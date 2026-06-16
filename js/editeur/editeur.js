// ============ Éditeur de cartes — atelier autonome (hors du jeu) ============
// Quatre calques sur une COPIE de travail d'une carte réelle : Terrain, Dessin (prefabs,
// cloisons, portes — le NOUVEAU calque générique), Zombies (proba), Événements (chance).
// Rien n'est jamais écrit dans les fichiers du jeu : les cartes éditées vivent dans une
// SURCOUCHE localStorage ('omd_editeur_v1'). Le bouton « Tester » ouvre le vrai jeu sur la
// copie (index.html?test=<id>). Le rendu intérieur (murs + prefabs/cloisons/creux) est
// MUTUALISÉ avec le moteur via js/art/prefabs.js — l'éditeur est WYSIWYG.
import { CARTES } from '../data/world.js';
import { ZOMBIES } from '../data/zombies.js';
import { EVENTS } from '../data/events.js';
import { PREFABS, dessinerDecor, dessinerCloisons, dessinerCreux, autoDecor } from '../art/prefabs.js';

const CLE = 'omd_editeur_v1';

// Couleurs de terrain — RECOPIÉES de map.js pour un rendu fidèle, sans dépendre du jeu.
const TERRAIN = {
  rue:       { fill: '#1d1d21', stroke: '#2c2c31' }, place:     { fill: '#242427', stroke: '#313136' },
  parc:      { fill: '#19211b', stroke: '#27322a' }, rail:      { fill: '#1b1b1d', stroke: '#3a3530' },
  porte:     { fill: '#2b2620', stroke: '#4a3e2c' }, batiment:  { fill: '#2a2622', stroke: '#473d31' },
  route:     { fill: '#1d1d21', stroke: '#2c2c31' }, autoroute: { fill: '#232328', stroke: '#3c3c44' },
  village:   { fill: '#272320', stroke: '#473d31' }, ville:     { fill: '#2c2722', stroke: '#54483a' },
  nature:    { fill: '#181f17', stroke: '#242e23' }, site:      { fill: '#262028', stroke: '#41374a' },
  piece:     { fill: '#211e19', stroke: '#383226' }, couloir:   { fill: '#1a1814', stroke: '#2c2820' },
  escalier:  { fill: '#231f18', stroke: '#3d3526' }, eau:       { fill: '#13202a', stroke: '#1d3140' },
  mur:       { fill: '#0f0f11', stroke: '#1a1a1d' },
};
const TERRAIN_KEYS = Object.keys(TERRAIN);
const TAILLE_NOEUD = { place: 34, parc: 30, rue: 21, route: 23, autoroute: 23, batiment: 28, ville: 30, village: 28, site: 28, eau: 24, porte: 18 };
const MUR_TRAIT = '#4f4636';
const CIRC = ['couloir', 'escalier', 'porte'];
const PREFAB_KEYS = Object.keys(PREFABS);

// ---------- État de l'éditeur ----------
const E = {
  id: null,            // id de la carte ouverte (= sa clé dans CARTES et dans la surcouche)
  carte: null,         // copie de travail (objet)
  calque: 'terrain',   // 'terrain' | 'dessin' | 'zombies' | 'events'
  sel: null,           // 'x,y' de la case sélectionnée
  outil: 'sel',        // outil du calque terrain : 'sel' | 'peindre' | 'gomme'
  peintType: 'piece',  // type appliqué par l'outil Peindre
  outilD: 'prefab',    // outil du calque Dessin : 'sel' | 'prefab' | 'cloison' | 'porte' | 'creux'
  prefab: 'lit',       // prefab courant à poser
  geom: null,          // géométrie de la dernière grille rendue (pour le pointage)
};

const el = (id) => document.getElementById(id);
const echap = (s) => String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const echapAttr = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const pct = (p) => Math.round((p == null ? 1 : p) * 100);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const r2 = (v) => Math.round(v * 100) / 100;

// ---------- Surcouche localStorage ----------
function lireSurcouche() { try { return JSON.parse(localStorage.getItem(CLE) || '{}'); } catch (e) { return {}; } }
function ecrireSurcouche(o) { try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) { alert('Sauvegarde locale impossible : ' + e.message); } }
function sauverCourante() { if (!E.id || !E.carte) return; const o = lireSurcouche(); o[E.id] = E.carte; ecrireSurcouche(o); }

// ---------- Ouvrir une carte ----------
function ouvrir(id, depuisOriginal = false) {
  if (!CARTES[id] && !lireSurcouche()[id]) return;
  const o = lireSurcouche();
  let c;
  if (!depuisOriginal && o[id]) c = JSON.parse(JSON.stringify(o[id]));
  else c = JSON.parse(JSON.stringify(CARTES[id]));
  delete c._adj;
  c.editeur = true;
  if (!c._source) c._source = id;
  E.id = id; E.carte = c; E.sel = null; E.outil = 'sel';
  sauverCourante();
  rendre();
}

// ============ Liaison de bord (logique de map.js/world.js, en DONNÉES seules) ============
// null = mur · 'ouvert' · 'porte' (bois) · 'porte_fer'
function paireDans(liste, k1, k2) {
  return (liste || []).find(([p, q]) => (p === k1 && q === k2) || (p === k2 && q === k1));
}
function liaisonEd(c, x, y, nx, ny) {
  const a = c.cases[`${x},${y}`], b = c.cases[`${nx},${ny}`];
  if (!a || !b) return null;
  if (['mur', 'eau'].includes(a.t) || ['mur', 'eau'].includes(b.t)) return null;
  const k1 = `${x},${y}`, k2 = `${nx},${ny}`;
  if (paireDans(c.murs, k1, k2)) return null;
  const passage = paireDans(c.passages, k1, k2);
  const aC = CIRC.includes(a.t), bC = CIRC.includes(b.t);
  const passable = c.ouvert || aC || bC || !!passage;
  if (!passable) return null;
  if (passage) return passage[2] === 'ouvert' ? 'ouvert' : passage[2] === 'porte_fer' ? 'porte_fer' : 'porte';
  if (c.ouvert) return 'ouvert';
  if (aC && bC) return 'ouvert';
  return 'porte';
}

// ============ RENDU DE LA CARTE (SVG) ============
function cadre(px, py, w, h, inset, col, dash) {
  return `<rect x="${px + inset}" y="${py + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="2" fill="none" stroke="${col}" stroke-width="1.5" ${dash ? 'stroke-dasharray="3 2.5"' : ''}/>`;
}
function marqueurs(cd, mx, my) {
  let g = '';
  if (Array.isArray(cd.zEd) && cd.zEd.length) g += `<circle cx="${mx}" cy="${my}" r="8" fill="#3a1414" stroke="#a83226"/><text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="9" fill="#e8a0a0">${cd.zEd.length}</text>`;
  return g;
}
function marqueursEv(cd, mx, my) {
  if (Array.isArray(cd.evEd) && cd.evEd.length) return `<circle cx="${mx}" cy="${my}" r="8" fill="#3a3414" stroke="#caa72a"/><text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="9" fill="#e8d27a">${cd.evEd.length}</text>`;
  return '';
}

// --- Murs et portes d'une cellule (façon plan), à partir des DONNÉES de carte ---
function mursDeCaseEd(c, x, y, px, py, w, h) {
  const cd = c.cases[`${x},${y}`];
  const bords = [
    { dx: 1, dy: 0, x1: px + w, y1: py, x2: px + w, y2: py + h, prio: true },
    { dx: 0, dy: 1, x1: px, y1: py + h, x2: px + w, y2: py + h, prio: true },
    { dx: -1, dy: 0, x1: px, y1: py, x2: px, y2: py + h, prio: false },
    { dx: 0, dy: -1, x1: px, y1: py, x2: px + w, y2: py, prio: false },
  ];
  let out = '';
  for (const b of bords) {
    const nx = x + b.dx, ny = y + b.dy;
    const voisin = c.cases[`${nx},${ny}`];
    if (!b.prio && voisin) continue; // bord partagé tracé par le voisin
    const li = voisin ? liaisonEd(c, x, y, nx, ny) : null;
    if (!li) { out += `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}"/>`; continue; }
    const vert = b.x1 === b.x2;
    const mx = (b.x1 + b.x2) / 2, my = (b.y1 + b.y2) / 2;
    const demi = li === 'ouvert' ? Math.min(w, h) * .3 : 8;
    out += vert
      ? `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x1}" y2="${my - demi}"/><line x1="${b.x1}" y1="${my + demi}" x2="${b.x1}" y2="${b.y2}"/>`
      : `<line x1="${b.x1}" y1="${b.y1}" x2="${mx - demi}" y2="${b.y1}"/><line x1="${mx + demi}" y1="${b.y1}" x2="${b.x2}" y2="${b.y1}"/>`;
    if (li === 'porte' || li === 'porte_fer') {
      const coul = li === 'porte_fer' ? '#7a8aa0' : '#6d5d42';
      out += vert
        ? `<rect x="${b.x1 - 2.5}" y="${my - demi}" width="5" height="${demi * 2}" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`
        : `<rect x="${mx - demi}" y="${b.y1 - 2.5}" width="${demi * 2}" height="5" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`;
    }
  }
  return out;
}

// --- Poignées du calque Dessin (outil Porte) : bords cliquables colorés selon l'état ---
const PORTE_COUL = { mur: '#a83226', porte: '#caa72a', ouvert: '#5d9e57', porte_fer: '#6f8fd6' };
function poigneesPorte(c, geom) {
  let out = '';
  for (let x = 0; x < c.largeur; x++) for (let y = 0; y < c.hauteur; y++) {
    if (!c.cases[`${x},${y}`]) continue;
    for (const [dx, dy] of [[1, 0], [0, 1]]) { // droite + bas : chaque bord une fois
      const nx = x + dx, ny = y + dy;
      if (!c.cases[`${nx},${ny}`]) continue;
      const li = liaisonEd(c, x, y, nx, ny);
      const etat = li || 'mur';
      const X = geom.colX[x], Y = geom.rowY[y], W = geom.cwA[x], H = geom.chA[y];
      const mx = dx ? X + W : X + W / 2, my = dx ? Y + H / 2 : Y + H;
      const x1 = dx ? X + W : X + W * .22, y1 = dx ? Y + H * .22 : Y + H;
      const x2 = dx ? X + W : X + W * .78, y2 = dx ? Y + H * .78 : Y + H;
      out += `<line class="ed-bord" data-bord="${x},${y}|${nx},${ny}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PORTE_COUL[etat]}" stroke-width="6" stroke-linecap="round" opacity=".85"/>`;
    }
  }
  return out;
}

function svgGrille(c) {
  const interieur = c.echelle === 'interieur';
  const CS = interieur ? 56 : (c.echelle === 'quartier' ? 40 : 48);
  const GAP = interieur ? 0 : 3, PAD = 8;
  const colF = (x) => (interieur && c.colW && c.colW[x] != null) ? c.colW[x] : 1;
  const rowF = (y) => (interieur && c.rowH && c.rowH[y] != null) ? c.rowH[y] : 1;
  const cwA = [], chA = [], colX = [], rowY = [];
  let accX = PAD; for (let x = 0; x < c.largeur; x++) { cwA[x] = CS * colF(x); colX[x] = accX; accX += cwA[x] + GAP; }
  let accY = PAD; for (let y = 0; y < c.hauteur; y++) { chA[y] = CS * rowF(y); rowY[y] = accY; accY += chA[y] + GAP; }
  const W = accX - GAP + PAD, H = accY - GAP + PAD;
  E.geom = { colX, rowY, cwA, chA, CS, PAD, W, H };
  const dessin = E.calque === 'dessin';

  let cells = '', murs = '', parois = '';
  for (let y = 0; y < c.hauteur; y++) for (let x = 0; x < c.largeur; x++) {
    const pos = `${x},${y}`, cd = c.cases[pos];
    const X = colX[x], Y = rowY[y], Wc = cwA[x], Hc = chA[y];
    const sel = E.sel === pos;
    let g = `<g class="ed-case" data-case="${pos}">`;
    if (!cd) {
      g += `<rect x="${X}" y="${Y}" width="${Wc}" height="${Hc}" rx="2" fill="#0e0e10" stroke="#1c1c20" stroke-dasharray="2 3"/>`;
    } else {
      const t = TERRAIN[cd.t] || TERRAIN.rue;
      g += `<rect x="${X}" y="${Y}" width="${Wc}" height="${Hc}" rx="${interieur ? 0 : 2}" fill="${t.fill}" stroke="${t.stroke}"/>`;
      // Calque de dessin : explicite sinon meublage AUTO (comme le jeu) — uniquement en intérieur.
      if (interieur) {
        const auto = autoDecor(cd);
        const creuxSrc = cd.creux || (auto && auto.creux);
        const decorSrc = cd.decor || (auto && auto.decor);
        if (creuxSrc) g += dessinerCreux(creuxSrc, X, Y, Wc, Hc);
        if (decorSrc) g += dessinerDecor(decorSrc, X, Y, Wc, Hc);
        const cloiSrc = cd.cloisons || (auto && auto.cloisons);
        if (cloiSrc) parois += dessinerCloisons(cloiSrc, X, Y, Wc, Hc);
        murs += mursDeCaseEd(c, x, y, X, Y, Wc, Hc);
      }
      const lbl = cd.lbl !== undefined ? cd.lbl : (cd.nom ? cd.nom.split(' ')[0] : '');
      if (lbl) g += `<text x="${X + Wc / 2}" y="${Y + Hc - 5}" text-anchor="middle" font-size="9" fill="#9a8f7c">${echap(lbl).slice(0, 12)}</text>`;
      if ((cd.danger || 0) >= 0.4) g += cadre(X, Y, Wc, Hc, 2, '#a83226');
      if (cd.sombre) g += cadre(X, Y, Wc, Hc, 5, '#7b6fc4', cd.sombre === 1 || cd.sombre === true);
      if (cd.vers) g += `<rect x="${X + Wc / 2 - 5}" y="${Y + 5}" width="10" height="13" rx="1" fill="#16130e" stroke="#6d5d42"/>`;
      g += marqueurs(cd, X + 11, Y + 11);
      g += marqueursEv(cd, X + Wc - 11, Y + 11);
    }
    if (estDepart(pos)) g += `<circle cx="${X + Wc / 2}" cy="${Y + Hc / 2}" r="6" fill="#c9b98a" stroke="#0b0b0c" stroke-width="2"/>`;
    if (sel) g += `<rect x="${X + 1.5}" y="${Y + 1.5}" width="${Wc - 3}" height="${Hc - 3}" rx="2" fill="none" stroke="#5a9be8" stroke-width="2.5"/>`;
    g += `</g>`;
    cells += g;
  }
  // Surcouche d'édition (calque Dessin, outil Porte) : bords cliquables.
  let overlay = '';
  if (dessin && E.outilD === 'porte' && interieur) overlay += `<g class="ed-portes">${poigneesPorte(c, E.geom)}</g>`;
  const cls = dessin ? 'ed-grille ed-dessin' : 'ed-grille';
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${cells}${murs ? `<g class="ed-murs" fill="none" stroke="${MUR_TRAIT}" stroke-width="3" stroke-linecap="square">${murs}</g>` : ''}${parois}${overlay}</svg>`;
}

// ---- Plan à nœuds (quartier/ville) : inchangé, pas de calque dessin ----
function voisinsPlan(c, x, y) {
  const cd = c.cases[`${x},${y}`]; if (!cd) return [];
  if (cd.liens) return cd.liens.filter(l => c.cases[l]).map(l => l.split(',').map(Number));
  if (c.liensAuto) { const r = []; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (c.cases[k]) r.push([x + dx, y + dy]); } return r; }
  return [];
}
function posN(c, cd, x, y) { if (cd.cx != null && cd.cy != null) return { cx: cd.cx, cy: cd.cy }; return { cx: x * 78 + 52, cy: y * 78 + 52 }; }
function svgPlan(c) {
  let W = c.vue && c.vue.x, H = c.vue && c.vue.y;
  if (!W || !H) { W = 0; H = 0; for (const [pos, cd] of Object.entries(c.cases)) { const [x, y] = pos.split(',').map(Number); const p = posN(c, cd, x, y); W = Math.max(W, p.cx + 50); H = Math.max(H, p.cy + 55); } }
  let rues = '', nodes = ''; const fait = new Set();
  for (const [pos, cd] of Object.entries(c.cases)) {
    const [x, y] = pos.split(',').map(Number); const a = posN(c, cd, x, y);
    for (const [bx, by] of voisinsPlan(c, x, y)) {
      const lk = `${bx},${by}`; const bcd = c.cases[lk]; if (!bcd) continue;
      const cle = pos < lk ? pos + '|' + lk : lk + '|' + pos; if (fait.has(cle)) continue; fait.add(cle);
      const b = posN(c, bcd, bx, by);
      rues += `<line x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}" stroke="#26262a" stroke-width="10" stroke-linecap="round"/>`;
    }
  }
  for (const [pos, cd] of Object.entries(c.cases)) {
    const [x, y] = pos.split(',').map(Number); const { cx, cy } = posN(c, cd, x, y);
    const r = TAILLE_NOEUD[cd.t] || 22; const t = TERRAIN[cd.t] || TERRAIN.rue; const sel = E.sel === pos;
    let g = `<g class="ed-case" data-case="${pos}">`;
    g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1.5"/>`;
    const lbl = cd.lbl !== undefined ? cd.lbl : (cd.nom ? cd.nom.split(' ')[0] : '');
    if (lbl) g += `<text x="${cx}" y="${cy + r + 11}" text-anchor="middle" font-size="9" fill="#9a8f7c">${echap(lbl).slice(0, 12)}</text>`;
    if ((cd.danger || 0) >= 0.4) g += `<circle cx="${cx}" cy="${cy}" r="${r - 3}" fill="none" stroke="#a83226" stroke-width="1.5"/>`;
    g += marqueurs(cd, cx - r + 2, cy - r + 2);
    g += marqueursEv(cd, cx + r - 2, cy - r + 2);
    if (estDepart(pos)) g += `<circle cx="${cx}" cy="${cy}" r="6" fill="#c9b98a" stroke="#0b0b0c" stroke-width="2"/>`;
    if (sel) g += `<circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="none" stroke="#5a9be8" stroke-width="2.5"/>`;
    g += `</g>`;
    nodes += g;
  }
  return `<svg class="ed-grille" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${rues}${nodes}</svg>`;
}
function svgCarteEd(c) { return c.graphe ? svgPlan(c) : svgGrille(c); }
function estDepart(pos) { const d = E.carte && E.carte._depart; return !!(d && `${d.x},${d.y}` === pos); }

// ============ POINTAGE (coordonnées SVG ↔ cellule) ============
function svgPoint(svg, cx, cy) {
  const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
  const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
  const loc = pt.matrixTransform(m.inverse());
  return { x: loc.x, y: loc.y };
}
function celluleEn(vx, vy) {
  const g = E.geom; if (!g) return null;
  for (let x = 0; x < E.carte.largeur; x++) for (let y = 0; y < E.carte.hauteur; y++) {
    const X = g.colX[x], Y = g.rowY[y], W = g.cwA[x], H = g.chA[y];
    if (vx >= X && vx < X + W && vy >= Y && vy < Y + H) return { x, y, pos: `${x},${y}`, X, Y, W, H };
  }
  return null;
}

// ============ CLIC SUR UNE CASE (calques terrain/zombies/events) ============
function clicCase(pos) {
  if (E.calque === 'terrain' && E.outil === 'peindre') {
    const cd = E.carte.cases[pos] || (E.carte.cases[pos] = {});
    cd.t = E.peintType;
    if (cd.danger == null) cd.danger = 0.2;
    E.sel = pos; majDonnees(); return;
  }
  if (E.calque === 'terrain' && E.outil === 'gomme') {
    delete E.carte.cases[pos];
    if (E.sel === pos) E.sel = null;
    majDonnees(); return;
  }
  E.sel = pos; rendreCanvas(); rendreInspect();
}

// ============ INTERACTIONS DU CALQUE DESSIN ============
// Pose par GLISSER : on dessine une boîte (prefab/creux) ou un segment (cloison) DANS une case.
function brancherDessin(svg) {
  // Outil Porte : clic sur un bord → cycle mur → porte → ouvert → porte_fer.
  svg.querySelectorAll('[data-bord]').forEach(seg => seg.onclick = (e) => { e.stopPropagation(); cyclePorte(seg.dataset.bord); });

  if (!['prefab', 'cloison', 'creux'].includes(E.outilD)) return;
  let drag = null, temp = null;
  svg.style.touchAction = 'none';
  svg.onpointerdown = (e) => {
    const p = svgPoint(svg, e.clientX, e.clientY);
    const cell = celluleEn(p.x, p.y);
    if (!cell || !E.carte.cases[cell.pos]) return;
    drag = { cell, x0: p.x, y0: p.y };
    temp = document.createElementNS('http://www.w3.org/2000/svg', E.outilD === 'cloison' ? 'line' : 'rect');
    temp.setAttribute('class', 'ed-temp');
    svg.appendChild(temp);
    try { svg.setPointerCapture(e.pointerId); } catch (_) { /* pointeur synthétique : sans capture */ }
  };
  svg.onpointermove = (e) => {
    if (!drag) return;
    const p = svgPoint(svg, e.clientX, e.clientY);
    const c = drag.cell;
    const x1 = Math.max(c.X, Math.min(c.X + c.W, drag.x0)), y1 = Math.max(c.Y, Math.min(c.Y + c.H, drag.y0));
    const x2 = Math.max(c.X, Math.min(c.X + c.W, p.x)), y2 = Math.max(c.Y, Math.min(c.Y + c.H, p.y));
    if (E.outilD === 'cloison') {
      temp.setAttribute('x1', x1); temp.setAttribute('y1', y1); temp.setAttribute('x2', x2); temp.setAttribute('y2', y2);
    } else {
      temp.setAttribute('x', Math.min(x1, x2)); temp.setAttribute('y', Math.min(y1, y2));
      temp.setAttribute('width', Math.abs(x2 - x1)); temp.setAttribute('height', Math.abs(y2 - y1));
    }
  };
  svg.onpointerup = (e) => {
    if (!drag) return;
    const p = svgPoint(svg, e.clientX, e.clientY);
    const c = drag.cell, cd = E.carte.cases[c.pos];
    const nx0 = clamp01((drag.x0 - c.X) / c.W), ny0 = clamp01((drag.y0 - c.Y) / c.H);
    const nx1 = clamp01((p.x - c.X) / c.W), ny1 = clamp01((p.y - c.Y) / c.H);
    if (E.outilD === 'cloison') {
      if (Math.hypot(nx1 - nx0, ny1 - ny0) > 0.08) (cd.cloisons || (cd.cloisons = [])).push({ x1: r2(nx0), y1: r2(ny0), x2: r2(nx1), y2: r2(ny1) });
    } else {
      let bx = Math.min(nx0, nx1), by = Math.min(ny0, ny1), bw = Math.abs(nx1 - nx0), bh = Math.abs(ny1 - ny0);
      if (bw < 0.08 || bh < 0.08) { bw = Math.max(bw, 0.3); bh = Math.max(bh, 0.3); } // simple clic → taille par défaut
      bw = Math.min(bw, 1 - bx); bh = Math.min(bh, 1 - by);
      if (E.outilD === 'creux') (cd.creux || (cd.creux = [])).push({ x: r2(bx), y: r2(by), w: r2(bw), h: r2(bh) });
      else (cd.decor || (cd.decor = [])).push({ p: E.prefab, x: r2(bx), y: r2(by), w: r2(bw), h: r2(bh) });
    }
    drag = null; temp = null; E.sel = c.pos; majDonnees();
  };
}

// Cycle l'état d'un bord (outil Porte). Édite carte.passages / carte.murs.
function cyclePorte(bord) {
  const [k1, k2] = bord.split('|');
  const [x, y] = k1.split(',').map(Number), [nx, ny] = k2.split(',').map(Number);
  const ordre = ['mur', 'porte', 'ouvert', 'porte_fer'];
  const actuel = liaisonEd(E.carte, x, y, nx, ny) || 'mur';
  const suivant = ordre[(ordre.indexOf(actuel) + 1) % 4];
  E.carte.passages = (E.carte.passages || []).filter(([p, q]) => !((p === k1 && q === k2) || (p === k2 && q === k1)));
  E.carte.murs = (E.carte.murs || []).filter(([p, q]) => !((p === k1 && q === k2) || (p === k2 && q === k1)));
  if (suivant === 'mur') E.carte.murs.push([k1, k2]);
  else if (suivant === 'porte') E.carte.passages.push([k1, k2]);
  else if (suivant === 'ouvert') E.carte.passages.push([k1, k2, 'ouvert']);
  else E.carte.passages.push([k1, k2, 'porte_fer']);
  if (!E.carte.murs.length) delete E.carte.murs;
  if (!E.carte.passages.length) delete E.carte.passages;
  majDonnees();
}

// ============ INSPECTEUR (panneau de droite) ============
function rendreInspect() {
  const box = el('ed-inspect');
  if (!E.carte) { box.innerHTML = ''; return; }
  if (E.calque === 'dessin') { box.innerHTML = inspDessin(); brancherInspect(); return; }
  if (!E.sel) { box.innerHTML = `<div class="ed-hint">Clique une case sur le plan pour l'éditer.</div>`; return; }
  const cd = E.carte.cases[E.sel];
  if (E.calque === 'terrain') box.innerHTML = inspTerrain(E.sel, cd);
  else if (E.calque === 'zombies') box.innerHTML = inspZombies(E.sel, cd);
  else box.innerHTML = inspEvents(E.sel, cd);
  brancherInspect();
}

function inspTerrain(pos, cd) {
  if (!cd) return `<div class="ed-sec"><div class="ed-sec-t">Case ${pos}</div>
    <div class="ed-hint">Vide (mur / hors-plan).</div>
    <button data-act="creer">+ Créer une case ici</button></div>`;
  const opts = TERRAIN_KEYS.map(t => `<option value="${t}" ${cd.t === t ? 'selected' : ''}>${t}</option>`).join('');
  return `<div class="ed-sec">
    <div class="ed-sec-t">Case ${pos}</div>
    <label class="ed-lab">Terrain<select data-f="t">${opts}</select></label>
    <label class="ed-lab">Nom<input data-f="nom" value="${echapAttr(cd.nom || '')}"></label>
    <label class="ed-lab">Étiquette (carte)<input data-f="lbl" value="${echapAttr(cd.lbl || '')}"></label>
    <label class="ed-lab">Danger <span id="ed-dv">${pct(cd.danger || 0)}</span>%<input type="range" min="0" max="100" step="5" value="${pct(cd.danger || 0)}" data-f="danger"></label>
    <label class="ed-lab">Obscurité<select data-f="sombre">
      <option value="0" ${!cd.sombre ? 'selected' : ''}>aucune</option>
      <option value="1" ${cd.sombre === 1 ? 'selected' : ''}>pénombre</option>
      <option value="2" ${(cd.sombre === 2 || cd.sombre === true) ? 'selected' : ''}>noir total</option>
    </select></label>
    <div class="ed-btns">
      <button data-act="depart">${estDepart(pos) ? '★ Départ de test' : 'Définir comme départ'}</button>
      <button data-act="suppr" class="ed-danger-btn">Supprimer la case</button>
    </div>
  </div>`;
}

// --- Inspecteur du calque DESSIN : meublage de la case sélectionnée ---
function inspDessin() {
  if (E.carte.graphe) return `<div class="ed-sec"><div class="ed-hint">Le calque Dessin concerne les intérieurs (grille). Cette carte est un plan à nœuds.</div></div>`;
  if (!E.sel || !E.carte.cases[E.sel]) return `<div class="ed-sec"><div class="ed-hint">Choisis un outil à gauche, puis <b>glisse</b> dans une case pour poser un prefab, tracer une cloison ou creuser. Clique une case pour voir/éditer son contenu.</div></div>`;
  const cd = E.carte.cases[E.sel];
  const auto = autoDecor(cd);
  const decor = cd.decor || [];
  const cloisons = cd.cloisons || [];
  const creux = cd.creux || [];
  const ligDecor = decor.map((d, i) => `<div class="ed-row">
    <span class="ed-row-nom">${echap(d.p)} <span class="ed-dim">${Math.round(d.w * 100)}×${Math.round(d.h * 100)}</span></span>
    <button class="ed-mini" data-drot="${i}" title="Pivoter">⟳</button>
    <button class="ed-mini" data-dflip="${i}" title="Miroir">⇄</button>
    <button class="ed-x" data-ddel="${i}">✕</button></div>`).join('');
  const ligCloi = cloisons.map((w, i) => `<div class="ed-row">
    <span class="ed-row-nom">cloison ${w.porte != null ? '· porte' : ''}</span>
    <button class="ed-mini" data-cporte="${i}" title="Porte oui/non">⌷</button>
    <button class="ed-x" data-cdel="${i}">✕</button></div>`).join('');
  const ligCreux = creux.map((r, i) => `<div class="ed-row"><span class="ed-row-nom">creux ${Math.round(r.w * 100)}×${Math.round(r.h * 100)}</span><button class="ed-x" data-xdel="${i}">✕</button></div>`).join('');
  return `<div class="ed-sec">
    <div class="ed-sec-t">${echap(cd.nom || E.sel)}</div>
    ${(!cd.decor && auto) ? `<div class="ed-warn">Meublage AUTO (déduit du nom). Pose un prefab pour passer en manuel et reprendre la main.</div>` : ''}
    <div class="ed-sub">Prefabs posés (${decor.length})</div>
    <div class="ed-list">${ligDecor || '<div class="ed-hint">Aucun — glisse une boîte avec l\'outil Prefab.</div>'}</div>
    <div class="ed-sub">Cloisons (${cloisons.length})</div>
    <div class="ed-list">${ligCloi || '<div class="ed-hint">Aucune.</div>'}</div>
    <div class="ed-sub">Creux / vides (${creux.length})</div>
    <div class="ed-list">${ligCreux || '<div class="ed-hint">Aucun.</div>'}</div>
    ${(cd.decor || cd.cloisons || cd.creux) ? `<div class="ed-btns"><button data-act="dclear" class="ed-danger-btn">Tout effacer (revenir à l\'auto)</button></div>` : ''}
  </div>`;
}

function inspZombies(pos, cd) {
  if (!cd) return `<div class="ed-sec"><div class="ed-sec-t">Case ${pos}</div><div class="ed-hint">Case vide — crée-la d'abord (calque Terrain).</div></div>`;
  const vivante = E.carte.echelle === 'interieur' || E.carte.echelle === 'quartier';
  const liste = (cd.zEd || []).map((s, i) => `<div class="ed-row">
    <span class="ed-row-nom">${ZOMBIES[s.id] ? ZOMBIES[s.id].nom : s.id}</span>
    <input type="range" min="0" max="100" step="5" value="${pct(s.p)}" data-zp="${i}">
    <span class="ed-row-pv" data-zpv="${i}">${pct(s.p)}%</span>
    <button data-zdel="${i}" class="ed-x" aria-label="retirer">✕</button></div>`).join('');
  const palette = Object.keys(ZOMBIES).map(id => `<button class="ed-chip" data-zadd="${id}">${ZOMBIES[id].nom}</button>`).join('');
  return `<div class="ed-sec">
    <div class="ed-sec-t">${echap(cd.nom || pos)}</div>
    <div class="ed-hint">Placement manuel — chaque zombie a sa probabilité d'apparition.</div>
    ${vivante ? '' : '<div class="ed-warn">⚠ Échelle « ' + E.carte.echelle + ' » : les zombies ne vivent pas sur la carte à cette échelle.</div>'}
    <div class="ed-list">${liste || '<div class="ed-hint">Aucun zombie ici.</div>'}</div>
    <div class="ed-sub">Ajouter un zombie :</div>
    <div class="ed-pal">${palette}</div>
  </div>`;
}

function inspEvents(pos, cd) {
  if (!cd) return `<div class="ed-sec"><div class="ed-sec-t">Case ${pos}</div><div class="ed-hint">Case vide — crée-la d'abord (calque Terrain).</div></div>`;
  const liste = (cd.evEd || []).map((s, i) => {
    const ev = EVENTS.find(e => e.id === s.id);
    return `<div class="ed-row">
      <span class="ed-row-nom" title="${ev ? echapAttr(ev.texte.slice(0, 120)) : ''}">${echap(s.id)}</span>
      <input type="range" min="0" max="100" step="5" value="${pct(s.p)}" data-ep="${i}">
      <span class="ed-row-pv" data-epv="${i}">${pct(s.p)}%</span>
      <button data-edel="${i}" class="ed-x" aria-label="retirer">✕</button></div>`;
  }).join('');
  const opts = EVENTS.map(e => `<option value="${e.id}">${e.id}${e.types ? ' — ' + e.types.join('/') : ''}</option>`).join('');
  return `<div class="ed-sec">
    <div class="ed-sec-t">${echap(cd.nom || pos)}</div>
    <div class="ed-hint">Chance d'événement sur cette case (placement manuel). Le 1er qui « passe » se déclenche.</div>
    <div class="ed-list">${liste || '<div class="ed-hint">Aucun événement ici.</div>'}</div>
    <div class="ed-sub">Ajouter un événement :</div>
    <select id="ed-ev-sel">${opts}</select>
    <button data-act="evadd">+ Ajouter</button>
  </div>`;
}

function brancherInspect() {
  const box = el('ed-inspect');
  const cd = E.sel ? E.carte.cases[E.sel] : null;

  box.querySelectorAll('[data-f]').forEach(inp => {
    const f = inp.dataset.f;
    if (f === 'danger') {
      inp.oninput = () => { cd.danger = parseInt(inp.value, 10) / 100; const v = el('ed-dv'); if (v) v.textContent = pct(cd.danger); sauverCourante(); rendreCanvas(); };
    } else if (f === 't') {
      inp.onchange = () => { cd.t = inp.value; majDonnees(); };
    } else if (f === 'sombre') {
      inp.onchange = () => { const n = parseInt(inp.value, 10); if (n) cd.sombre = n; else delete cd.sombre; majDonnees(); };
    } else {
      inp.onchange = () => { const v = inp.value.trim(); if (v) cd[f] = v; else delete cd[f]; sauverCourante(); rendreCanvas(); };
    }
  });

  box.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    switch (b.dataset.act) {
      case 'creer': { E.carte.cases[E.sel] = { t: E.peintType, danger: 0.2 }; majDonnees(); break; }
      case 'suppr': { delete E.carte.cases[E.sel]; E.sel = null; majDonnees(); break; }
      case 'depart': { const [x, y] = E.sel.split(',').map(Number); E.carte._depart = { x, y }; majDonnees(); break; }
      case 'evadd': { const sel = el('ed-ev-sel'); if (sel && sel.value) { (cd.evEd || (cd.evEd = [])).push({ id: sel.value, p: 0.5 }); majDonnees(); } break; }
      case 'dclear': { delete cd.decor; delete cd.cloisons; delete cd.creux; majDonnees(); break; }
    }
  });

  // Calque Dessin : rotation / miroir / suppression des éléments posés
  box.querySelectorAll('[data-drot]').forEach(b => b.onclick = () => { const d = cd.decor[+b.dataset.drot]; d.rot = ((d.rot || 0) + 45) % 360; majDonnees(); });
  box.querySelectorAll('[data-dflip]').forEach(b => b.onclick = () => { const d = cd.decor[+b.dataset.dflip]; d.flip = !d.flip; majDonnees(); });
  box.querySelectorAll('[data-ddel]').forEach(b => b.onclick = () => { cd.decor.splice(+b.dataset.ddel, 1); if (!cd.decor.length) delete cd.decor; majDonnees(); });
  box.querySelectorAll('[data-cporte]').forEach(b => b.onclick = () => { const w = cd.cloisons[+b.dataset.cporte]; if (w.porte != null) delete w.porte; else w.porte = 0.5; majDonnees(); });
  box.querySelectorAll('[data-cdel]').forEach(b => b.onclick = () => { cd.cloisons.splice(+b.dataset.cdel, 1); if (!cd.cloisons.length) delete cd.cloisons; majDonnees(); });
  box.querySelectorAll('[data-xdel]').forEach(b => b.onclick = () => { cd.creux.splice(+b.dataset.xdel, 1); if (!cd.creux.length) delete cd.creux; majDonnees(); });

  box.querySelectorAll('[data-zp]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.zp; cd.zEd[i].p = parseInt(inp.value, 10) / 100;
    const v = box.querySelector(`[data-zpv="${i}"]`); if (v) v.textContent = pct(cd.zEd[i].p); sauverCourante();
  });
  box.querySelectorAll('[data-zadd]').forEach(b => b.onclick = () => { (cd.zEd || (cd.zEd = [])).push({ id: b.dataset.zadd, p: 0.6 }); majDonnees(); });
  box.querySelectorAll('[data-zdel]').forEach(b => b.onclick = () => { cd.zEd.splice(+b.dataset.zdel, 1); if (!cd.zEd.length) delete cd.zEd; majDonnees(); });

  box.querySelectorAll('[data-ep]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.ep; cd.evEd[i].p = parseInt(inp.value, 10) / 100;
    const v = box.querySelector(`[data-epv="${i}"]`); if (v) v.textContent = pct(cd.evEd[i].p); sauverCourante();
  });
  box.querySelectorAll('[data-edel]').forEach(b => b.onclick = () => { cd.evEd.splice(+b.dataset.edel, 1); if (!cd.evEd.length) delete cd.evEd; majDonnees(); });
}

// ============ BARRE DU HAUT ============
function rendreTop() {
  const edites = lireSurcouche();
  const groupes = {};
  for (const [id, c] of Object.entries(CARTES)) { (groupes[c.echelle] || (groupes[c.echelle] = [])).push([id, c]); }
  const ordre = ['interieur', 'quartier', 'ville', 'region'];
  let opts = '<option value="">— ouvrir une carte —</option>';
  for (const ech of ordre) {
    const arr = groupes[ech]; if (!arr) continue;
    opts += `<optgroup label="${ech}">` + arr.map(([id, c]) =>
      `<option value="${id}" ${E.id === id ? 'selected' : ''}>${edites[id] ? '● ' : ''}${id} — ${echapAttr(c.nom)}</option>`).join('') + `</optgroup>`;
  }
  el('ed-top').innerHTML = `
    <div class="ed-top-l">
      <span class="ed-logo">Éditeur de cartes</span>
      <select id="ed-map">${opts}</select>
      ${E.carte ? `<span class="ed-badge">${E.carte.echelle} · ${E.carte.largeur || '?'}×${E.carte.hauteur || '?'}</span>` : ''}
    </div>
    <div class="ed-top-r">
      <button id="ed-aide" title="Comment ça marche">? Aide</button>
      <button id="ed-import">⭱ Importer</button>
      ${E.carte ? `<button id="ed-export">⭳ Exporter</button>` : ''}
      ${E.carte ? `<button id="ed-reset" title="Repartir de la carte d'origine">↺ Original</button>` : ''}
      ${E.carte ? `<button id="ed-test" class="ed-primary">▶ Tester</button>` : ''}
    </div>`;
  el('ed-map').onchange = (e) => { if (e.target.value) ouvrir(e.target.value); };
  el('ed-aide').onclick = montrerAide;
  const imp = el('ed-import'); if (imp) imp.onclick = importer;
  const exp = el('ed-export'); if (exp) exp.onclick = exporter;
  const rst = el('ed-reset'); if (rst) rst.onclick = () => { if (confirm('Repartir de la carte d\'origine ? Tes modifications sur cette carte seront perdues.')) ouvrir(E.id, true); };
  const tst = el('ed-test'); if (tst) tst.onclick = tester;
}

function exporter() {
  const blob = new Blob([JSON.stringify(E.carte, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${E.id}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importer() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const c = JSON.parse(r.result);
        if (!c.cases) throw new Error('pas une carte');
        c.editeur = true;
        E.id = c._source || c._id || 'carte_importee'; c._source = E.id;
        E.carte = c; E.sel = null;
        sauverCourante(); rendre();
      } catch (e) { alert('Fichier JSON invalide : ' + e.message); }
    };
    r.readAsText(f);
  };
  inp.click();
}
function tester() { sauverCourante(); window.open(`index.html?test=${encodeURIComponent(E.id)}`, '_blank'); }

// ============ AIDE ============
function montrerAide() {
  const d = document.createElement('div');
  d.className = 'ed-modale';
  d.innerHTML = `<div class="ed-modale-in">
    <h2>Comment ça marche</h2>
    <p>L'éditeur travaille sur une <b>copie</b> de la carte (jamais les fichiers du jeu). « <b>Tester</b> » lance le vrai jeu dessus.</p>
    <h3>▦ Terrain</h3>
    <p>Pose le sol des cases : <i>Peindre</i> applique un type (pièce, couloir, escalier, rue…), <i>Gomme</i> retire une case (une case absente = mur). Une case = la brique logique (déplacement, vue, zombies).</p>
    <h3>✎ Dessin <span class="ed-tag">le calque générique</span></h3>
    <ul>
      <li><b>Prefab</b> : choisis un meuble (lit, armoire, WC, baignoire, cage d'escalier…) puis <b>glisse une boîte</b> dans une case → il se pose à cette taille et cette position. Pivote / miroir / supprime dans le panneau de droite.</li>
      <li><b>Cloison</b> : <b>glisse un trait</b> dans une case pour un mur intérieur (ex. séparer une salle de bain). Le bouton ⌷ y perce une porte.</li>
      <li><b>Porte</b> : clique un <b>bord</b> entre deux cases pour cycler <span style="color:#a83226">mur</span> → <span style="color:#caa72a">porte</span> → <span style="color:#5d9e57">ouvert</span> → <span style="color:#6f8fd6">porte blindée</span>.</li>
      <li><b>Creux</b> : glisse une boîte rendue en <b>mur</b> (cage d'escalier étroite, recoin, pièce en L).</li>
    </ul>
    <p class="ed-hint">Sans dessin explicite, une pièce se <b>meuble toute seule</b> d'après son nom (chambre → lit + salle de bain, cuisine → cuisinière/évier…). Dès que tu poses un prefab, tu reprends la main.</p>
    <h3>☠ Zombies · ⚡ Événements</h3>
    <p>Place des apparitions de zombies et des événements case par case, avec leur probabilité.</p>
    <div class="ed-btns"><button class="ed-primary" id="ed-aide-ok">Compris</button></div>
  </div>`;
  d.onclick = (e) => { if (e.target === d || e.target.id === 'ed-aide-ok') d.remove(); };
  document.body.appendChild(d);
}

// ============ RAIL DES CALQUES (gauche) ============
function rendreRail() {
  const cs = [['terrain', 'Terrain', '▦'], ['dessin', 'Dessin', '✎'], ['zombies', 'Zombies', '☠'], ['events', 'Événements', '⚡']];
  let html = cs.map(([k, nom, ic]) => `<button class="ed-calque ${E.calque === k ? 'on' : ''}" data-calque="${k}"><span class="ed-ic">${ic}</span>${nom}</button>`).join('');
  if (E.calque === 'terrain') {
    const types = TERRAIN_KEYS.map(t => `<option value="${t}" ${E.peintType === t ? 'selected' : ''}>${t}</option>`).join('');
    html += `<div class="ed-outils">
      <div class="ed-sub">Outil</div>
      <button class="ed-outil ${E.outil === 'sel' ? 'on' : ''}" data-outil="sel">Sélection</button>
      <button class="ed-outil ${E.outil === 'peindre' ? 'on' : ''}" data-outil="peindre">Peindre</button>
      <button class="ed-outil ${E.outil === 'gomme' ? 'on' : ''}" data-outil="gomme">Gomme</button>
      <label class="ed-sub" style="margin-top:8px">Type à peindre<select id="ed-peint">${types}</select></label>
    </div>`;
  } else if (E.calque === 'dessin') {
    const outils = [['sel', 'Sélection'], ['prefab', 'Prefab'], ['cloison', 'Cloison'], ['porte', 'Porte'], ['creux', 'Creux']];
    html += `<div class="ed-outils"><div class="ed-sub">Outil</div>` +
      outils.map(([k, n]) => `<button class="ed-outil ${E.outilD === k ? 'on' : ''}" data-outild="${k}">${n}</button>`).join('');
    if (E.outilD === 'prefab') {
      const pal = PREFAB_KEYS.map(k => `<button class="ed-prefab ${E.prefab === k ? 'on' : ''}" data-prefab="${k}" title="${k}">
        <svg viewBox="0 0 32 32">${dessinerDecor([{ p: k, x: .08, y: .08, w: .84, h: .84 }], 0, 0, 32, 32)}</svg>
        <span>${k}</span></button>`).join('');
      html += `<div class="ed-sub" style="margin-top:8px">Prefab à poser</div><div class="ed-prefabs">${pal}</div>`;
    }
    html += `<div class="ed-hint" style="margin-top:8px">Glisse dans une case pour poser. Détails à droite.</div></div>`;
  }
  el('ed-rail').innerHTML = html;
  el('ed-rail').querySelectorAll('[data-calque]').forEach(b => b.onclick = () => { E.calque = b.dataset.calque; rendre(); });
  el('ed-rail').querySelectorAll('[data-outil]').forEach(b => b.onclick = () => { E.outil = b.dataset.outil; rendreRail(); });
  el('ed-rail').querySelectorAll('[data-outild]').forEach(b => b.onclick = () => { E.outilD = b.dataset.outild; rendre(); });
  el('ed-rail').querySelectorAll('[data-prefab]').forEach(b => b.onclick = () => { E.prefab = b.dataset.prefab; rendreRail(); });
  const peint = el('ed-peint'); if (peint) peint.onchange = () => { E.peintType = peint.value; };
}

// ============ ASSEMBLAGE ============
function rendreCanvas() {
  const box = el('ed-canvas');
  if (!E.carte) { box.innerHTML = `<div class="ed-empty">Ouvre une carte dans le menu en haut pour commencer.</div>`; return; }
  box.innerHTML = svgCarteEd(E.carte);
  const svg = box.querySelector('svg');
  // Le clic-case sert toujours à SÉLECTIONNER (terrain/zombies/events, et l'outil Sélection du Dessin).
  const selectionSeule = E.calque !== 'dessin' || E.outilD === 'sel';
  if (selectionSeule) box.querySelectorAll('[data-case]').forEach(g => g.onclick = () => clicCase(g.dataset.case));
  if (E.calque === 'dessin' && !E.carte.graphe) brancherDessin(svg);
}
function majDonnees() { sauverCourante(); rendreCanvas(); rendreInspect(); }
function rendre() { rendreTop(); rendreRail(); rendreCanvas(); rendreInspect(); }

rendre();
