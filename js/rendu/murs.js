// ============ Couche MURS : dessus texturé, arêtes, face avant (impression de hauteur), murets, grilles, haies,
// fenêtres, encadrements de portes, escaliers, sorties ============
// peindreMurs(c, niv, E, x0, y0, x1, y1) — coordonnées monde (1 unité = TS px) ; (x0, y0, x1, y1) en PETITES cases :
// un mur mince fait une petite case d'épaisseur (TF px), une porte une unité de large.
import { TS, TF as T, rng, hash, cercle, ellipse, rr, avecOmbre } from './outils.js';
import { textureMur, COULEURS_MUR } from './textures.js';
import { K, MURS, MURS_IDS } from '../carte/catalogue.js';

export const FACE = 0.4;       // hauteur de la face avant d'un mur, en unités (dessinée sur la petite case du dessous)
const motifsMur = new Map();
export function viderMotifsMur() { motifsMur.clear(); }
function motifMur(c, style) {
  let m = motifsMur.get(style);
  if (m && m.c === c) return m.p;
  m = { c, p: c.createPattern(textureMur(style), 'repeat') }; motifsMur.set(style, m);
  return m.p;
}
const style = (E, i) => MURS_IDS[E.mur ? E.mur[i] : 1] || 'platre';
const estMurPlein = (E, i) => { if (E.code[i] !== K.MUR) return false; const M = MURS[style(E, i)] || {}; return !M.bas && !M.vide; };
const estMurOuOuv = (E, i) => { const k = E.code[i]; return k === K.MUR || k === K.FENETRE || k === K.PORTE; };

export function peindreMurs(c, niv, E, x0, y0, x1, y1) {
  const w = E.w, h = E.h;
  const X0 = Math.max(0, x0 - 1), Y0 = Math.max(0, y0 - 1), X1 = Math.min(w - 1, x1 + 1), Y1 = Math.min(h - 1, y1 + 1);
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : y * w + x);
  // 1) murs bas (muret, grille, vitrine) et haies : dessinés sur le sol
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x;
    if (E.code[i] !== K.MUR) continue;
    const st = style(E, i), M = MURS[st] || {};
    if (st === 'haie') { haie(c, E, x, y); continue; }
    if (!M.bas) continue;
    const horiz = (at(x - 1, y) >= 0 && estMurOuOuv(E, at(x - 1, y))) || (at(x + 1, y) >= 0 && estMurOuOuv(E, at(x + 1, y)));
    const vert = (at(x, y - 1) >= 0 && estMurOuOuv(E, at(x, y - 1))) || (at(x, y + 1) >= 0 && estMurOuOuv(E, at(x, y + 1)));
    murBas(c, E, x, y, st, horiz || !vert, vert);
  }
  // 2) faces avant (sous les murs pleins) — avant les dessus pour que l'arête recouvre proprement
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x;
    if (!estMurPlein(E, i) || !(MURS[style(E, i)] || {}).epais) continue;
    const j = at(x, y + 1);
    if (j < 0 || estMurPlein(E, j) || E.code[j] === K.VIDE) continue;
    if (E.code[j] === K.FENETRE || E.code[j] === K.PORTE) continue;
    face(c, E, x, y, style(E, i));
  }
  // 3) dessus des murs pleins
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x;
    if (!estMurPlein(E, i)) continue;
    const st = style(E, i);
    if (st === 'haie') continue;
    const px = x * T, py = y * T;
    c.fillStyle = motifMur(c, st); c.fillRect(px, py, T, T);
    // arêtes : côté ouvert = trait sombre + reflet intérieur (haut/gauche) ou ombre (bas/droite)
    const ouvert = (dx, dy) => { const j = at(x + dx, y + dy); return j >= 0 && !estMurPlein(E, j) && E.code[j] !== K.VIDE; };
    if (ouvert(0, -1)) { c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px, py, T, 1.4); c.fillStyle = 'rgba(255,240,220,0.22)'; c.fillRect(px, py + 1.4, T, 1.4); }
    if (ouvert(-1, 0)) { c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px, py, 1.4, T); c.fillStyle = 'rgba(255,240,220,0.17)'; c.fillRect(px + 1.4, py, 1.4, T); }
    if (ouvert(1, 0)) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(px + T - 3.4, py, 2, T); c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px + T - 1.4, py, 1.4, T); }
    if (ouvert(0, 1)) { c.fillStyle = 'rgba(255,240,220,0.12)'; c.fillRect(px, py + T - 2.6, T, 1.2); c.fillStyle = 'rgba(8,7,6,0.75)'; c.fillRect(px, py + T - 1.4, T, 1.4); }
    // usure : arête ébréchée, tache d'humidité (déterministe par case)
    const r = rng(x * 911 + y * 37);
    if (st === 'rocher') { for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(255,255,255,0.05)'; cercle(c, px + r() * T, py + r() * T, 3 + r() * 5); c.fill(); } }
    else if (r() < 0.18) { c.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.1})`; ellipse(c, px + r() * T, py + r() * T, 2 + r() * 4, 1.5 + r() * 3); c.fill(); }
  }
  // 4) fenêtres, encadrements de portes (une fois par porte, sur toute sa largeur)
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x;
    if (E.code[i] === K.FENETRE) fenetre(c, E, x, y, at);
  }
  for (const p of niv.portes) {
    if (p.etage !== E.id) continue;
    const j = p.cases[0], x = j % w, y = (j / w) | 0;
    if (x < X0 - 2 || x > X1 + 2 || y < Y0 - 2 || y > Y1 + 2) continue;
    cadrePorte(c, E, p);
  }
  // 5) escaliers et sorties
  for (const s of niv.escaliers) if (s.etage === E.id) for (const j of s.cases) { const x = j % w, y = (j / w) | 0; if (x >= X0 && x <= X1 && y >= Y0 && y <= Y1) marche(c, E, s, x, y); }
  for (const s of niv.sorties) if (s.etage === E.id) for (const j of s.cases) { const x = j % w, y = (j / w) | 0; if (x >= X0 && x <= X1 && y >= Y0 && y <= Y1) sortie(c, E, x, y, at); }
}

// Face avant d'un mur : bande verticale sur la case du dessous, dégradé + rangs selon la matière, plinthe, ombre de contact.
function face(c, E, x, y, st) {
  const C = COULEURS_MUR[st] || COULEURS_MUR.platre;
  const px = x * T, py = (y + 1) * T, H = Math.min(T, TS * FACE);
  const g = c.createLinearGradient(0, py, 0, py + H);
  g.addColorStop(0, C.face); g.addColorStop(1, 'rgba(10,8,6,1)');
  c.fillStyle = g; c.fillRect(px, py, T, H);
  // texture légère de la face (motif du mur assombri)
  c.save(); c.globalAlpha = 0.35; c.fillStyle = motifMur(c, st); c.fillRect(px, py, T, H); c.restore();
  const r = rng(x * 7349 + y * 131);
  if (st === 'pierre' || st === 'rocher') { c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(px, py + H * k / 3); c.lineTo(px + T, py + H * k / 3); c.stroke(); } for (let k = 0; k < 2; k++) { const xx = px + r() * T; c.beginPath(); c.moveTo(xx, py + (k % 3) * H / 3); c.lineTo(xx, py + ((k % 3) + 1) * H / 3); c.stroke(); } }
  else if (st === 'brique') { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(px, py + H * k / 4); c.lineTo(px + T, py + H * k / 4); c.stroke(); } }
  else if (st === 'bois') { c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1; for (let k = 1; k < 2; k++) { c.beginPath(); c.moveTo(px + T * k / 2, py); c.lineTo(px + T * k / 2, py + H); c.stroke(); } }
  else if (st === 'tole') { for (let k = 0; k < T; k += 5) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(px + k, py, 2, H); } }
  // arête haute (le coin du mur prend la lumière)
  c.fillStyle = 'rgba(255,240,220,0.14)'; c.fillRect(px, py, T, 1.2);
  // plinthe à l'intérieur, pied plus sombre dehors
  if (st === 'platre') { c.fillStyle = C.plinthe; c.fillRect(px, py + H - 2.6, T, 2.6); c.fillStyle = 'rgba(255,240,220,0.08)'; c.fillRect(px, py + H - 2.6, T, 0.7); }
  else { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(px, py + H - 2.2, T, 2.2); }
  // ombre de contact sur le sol
  const g2 = c.createLinearGradient(0, py + H, 0, py + H + TS * 0.2);
  g2.addColorStop(0, 'rgba(0,0,0,0.45)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g2; c.fillRect(px, py + H, T, TS * 0.2);
  // salissures (coulures) aléatoires
  if (r() < 0.3) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(px + r() * T, py + 2, 1.5 + r() * 3, H * (0.4 + r() * 0.5)); }
}

function murBas(c, E, x, y, st, horiz, vert) {
  const px = x * T, py = y * T;
  if (st === 'grille') {
    c.strokeStyle = '#141414'; c.lineCap = 'round';
    avecOmbre(c, 3, 2, 3, 0.6, () => {
      c.lineWidth = 2.2; c.beginPath();
      if (horiz) { c.moveTo(px, py + T * 0.5); c.lineTo(px + T, py + T * 0.5); }
      if (vert) { c.moveTo(px + T * 0.5, py); c.lineTo(px + T * 0.5, py + T); }
      c.stroke();
    });
    c.fillStyle = '#1e1e1e'; c.strokeStyle = '#3a3a3a'; c.lineWidth = 1;
    // barreaux pointus
    for (let k = 0; k < 2; k++) {
      const t = (k + 0.5) / 2;
      const bx = horiz ? px + t * T : px + T * 0.5, by = horiz ? py + T * 0.5 : py + t * T;
      cercle(c, bx, by, 2); c.fill(); c.stroke();
    }
    if (horiz && vert) { c.fillStyle = '#262626'; rr(c, px + T * 0.5 - 4, py + T * 0.5 - 4, 8, 8, 2); c.fill(); }
    return;
  }
  if (st === 'vitrine') {
    c.fillStyle = 'rgba(120,170,190,0.25)';
    if (horiz) c.fillRect(px, py + T * 0.34, T, T * 0.32); else c.fillRect(px + T * 0.34, py, T * 0.32, T);
    c.strokeStyle = 'rgba(200,230,240,0.35)'; c.lineWidth = 1; c.beginPath();
    if (horiz) { c.moveTo(px + 2, py + T * 0.42); c.lineTo(px + T * 0.6, py + T * 0.42); } else { c.moveTo(px + T * 0.42, py + 2); c.lineTo(px + T * 0.42, py + T * 0.6); }
    c.stroke();
    c.fillStyle = '#2a2a2a'; if (horiz) { c.fillRect(px, py + T * 0.3, T, 1.8); c.fillRect(px, py + T * 0.66, T, 1.8); } else { c.fillRect(px + T * 0.3, py, 1.8, T); c.fillRect(px + T * 0.66, py, 1.8, T); }
    return;
  }
  // muret de pierre (toute l'épaisseur de la petite case, 40 cm)
  const ep = T * 0.86;
  const rect = horiz && !vert ? [px, py + (T - ep) / 2, T, ep] : vert && !horiz ? [px + (T - ep) / 2, py, ep, T] : [px + (T - ep) / 2, py + (T - ep) / 2, ep, ep];
  avecOmbre(c, 5, 3, 4, 0.55, () => { c.fillStyle = motifMur(c, 'pierre'); c.fillRect(...rect); });
  if (horiz && vert) { c.fillStyle = motifMur(c, 'pierre'); c.fillRect(px, py + (T - ep) / 2, T, ep); c.fillRect(px + (T - ep) / 2, py, ep, T); }
  c.strokeStyle = 'rgba(8,7,6,0.8)'; c.lineWidth = 1.1; c.strokeRect(rect[0] + 0.6, rect[1] + 0.6, rect[2] - 1.2, rect[3] - 1.2);
  c.fillStyle = 'rgba(255,240,220,0.14)'; c.fillRect(rect[0] + 1, rect[1] + 1, rect[2] - 2, 1.2);
}

function haie(c, E, x, y) {
  const px = x * T, py = y * T, r = rng(x * 4513 + y * 977);
  avecOmbre(c, 6, 3, 5, 0.6, () => { c.fillStyle = '#1a2612'; rr(c, px - 2, py - 2, T + 4, T + 4, 7); c.fill(); });
  for (let k = 0; k < 7; k++) {
    const bx = px + r() * T, by = py + r() * T, t = 3.5 + r() * 5, f = 0.6 + r() * 0.6;
    c.fillStyle = `rgb(${34 * f | 0},${54 * f | 0},${26 * f | 0})`; cercle(c, bx, by, t); c.fill();
    c.fillStyle = 'rgba(160,200,120,0.07)'; cercle(c, bx - t * 0.3, by - t * 0.3, t * 0.5); c.fill();
  }
}

function fenetre(c, E, x, y, at) {
  const i = y * E.w + x, st = style(E, i);
  const px = x * T, py = y * T;
  c.fillStyle = motifMur(c, MURS[st] && !MURS[st].bas ? st : 'platre'); c.fillRect(px, py, T, T);
  const murG = at(x - 1, y) >= 0 && estMurOuOuv(E, at(x - 1, y)), murD = at(x + 1, y) >= 0 && estMurOuOuv(E, at(x + 1, y));
  const horiz = murG || murD || !(at(x, y - 1) >= 0 && estMurOuOuv(E, at(x, y - 1)));
  const cassee = E.def && E.def.force && E.def.force.get && (E.def.force.get(i) || {}).cassee;
  c.save();
  if (!horiz) { c.translate(px + T / 2, py + T / 2); c.rotate(Math.PI / 2); c.translate(-px - T / 2, -py - T / 2); }
  // appui de fenêtre, cadre, vitre (la vitre court d'une petite case à l'autre)
  c.fillStyle = '#20180f'; c.fillRect(px, py + T * 0.24, T, T * 0.52);
  const g = c.createLinearGradient(px, py + T * 0.32, px + T, py + T * 0.68);
  g.addColorStop(0, 'rgba(110,150,170,0.85)'); g.addColorStop(0.5, 'rgba(60,90,110,0.85)'); g.addColorStop(1, 'rgba(120,160,175,0.85)');
  c.fillStyle = g; c.fillRect(px, py + T * 0.34, T, T * 0.32);
  c.fillStyle = 'rgba(230,245,255,0.35)'; c.fillRect(px + 2, py + T * 0.38, T * 0.45, 1.2);
  if (!murD) { c.fillStyle = '#3a2c1c'; c.fillRect(px + T - 1.5, py + T * 0.3, 1.5, T * 0.4); }
  c.fillStyle = 'rgba(255,240,220,0.18)'; c.fillRect(px, py + T * 0.24, T, 1);
  if (cassee) { c.fillStyle = '#0c0c0e'; c.beginPath(); c.moveTo(px + 3, py + T * 0.34); c.lineTo(px + T * 0.7, py + T * 0.5); c.lineTo(px + T * 0.4, py + T * 0.66); c.lineTo(px + 2, py + T * 0.66); c.closePath(); c.fill(); }
  c.restore();
}

// Encadrement d'une porte, sur toute sa largeur (p.bx, p.by, p.bw, p.bh en unités).
function cadrePorte(c, E, p) {
  const i = p.cases[0], st = style(E, i), stM = MURS[st] && !MURS[st].bas ? st : 'platre';
  const px = p.bx * TS, py = p.by * TS, W = p.bw * TS, H = p.bh * TS;
  const horiz = p.orient === 'h';
  // seuil
  c.fillStyle = 'rgba(30,22,14,0.7)';
  if (horiz) c.fillRect(px, py + H * 0.3, W, H * 0.4); else c.fillRect(px + W * 0.3, py, W * 0.4, H);
  // montants (prolongent le mur)
  c.fillStyle = motifMur(c, stM);
  const e = TS * 0.09;
  if (horiz) { c.fillRect(px, py, e, H); c.fillRect(px + W - e, py, e, H); }
  else { c.fillRect(px, py, W, e); c.fillRect(px, py + H - e, W, e); }
  c.fillStyle = 'rgba(8,7,6,0.8)';
  if (horiz) { c.fillRect(px + e - 1, py, 1.2, H); c.fillRect(px + W - e, py, 1.2, H); }
  else { c.fillRect(px, py + e - 1, W, 1.2); c.fillRect(px, py + H - e, W, 1.2); }
}

// Un escalier se dessine EN ENTIER (des marches en travers, des limons sur les côtés, une flèche) puis chaque petite
// case n'en peint que sa part : on reconnaît un escalier au premier coup d'œil, plus des « dalles » éparses.
// Sens de la montée : vers le côté qui touche le plus de mur (l'escalier s'enfonce dans le mur) ; à défaut, le long.
function geomEscalier(E, s) {
  if (s._g) return s._g;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (const j of s.cases) { const x = j % E.w, y = (j / E.w) | 0; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  const mur = (x, y) => x < 0 || y < 0 || x >= E.w || y >= E.h || E.code[y * E.w + x] === K.MUR || E.code[y * E.w + x] === K.VIDE;
  const part = (n, f) => { let k = 0; for (let i = 0; i < n; i++) k += f(i) ? 1 : 0; return k / n; };
  const cotes = { n: part(x1 - x0 + 1, i => mur(x0 + i, y0 - 1)), e: part(y1 - y0 + 1, i => mur(x1 + 1, y0 + i)), s: part(x1 - x0 + 1, i => mur(x0 + i, y1 + 1)), o: part(y1 - y0 + 1, i => mur(x0 - 1, y0 + i)) };
  let dir = Object.entries(cotes).sort((a, b) => b[1] - a[1])[0];
  dir = dir[1] > 0 ? dir[0] : (x1 - x0 > y1 - y0 ? 'e' : 'n');
  return (s._g = { x0, y0, x1, y1, dir });
}
function marche(c, E, s, x, y) {
  const g = geomEscalier(E, s), monte = s.sens === 'monte';
  const X0 = g.x0 * T, Y0 = g.y0 * T, W = (g.x1 - g.x0 + 1) * T, H = (g.y1 - g.y0 + 1) * T;
  const vertical = g.dir === 'n' || g.dir === 's';            // on monte vers le haut / le bas de l'écran
  const L = vertical ? H : W, larg = vertical ? W : H;
  const n = Math.max(4, Math.round(L / (T * 0.55)));          // nombre de marches
  c.save();
  c.beginPath(); c.rect(x * T, y * T, T, T); c.clip();
  c.translate(X0 + W / 2, Y0 + H / 2);
  c.rotate({ n: -Math.PI / 2, s: Math.PI / 2, e: 0, o: Math.PI }[g.dir]);   // repère local : on monte vers +x
  const a = -L / 2, ep = L / n;
  c.fillStyle = 'rgba(10,9,8,0.9)'; c.fillRect(-L / 2, -larg / 2, L, larg);
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);                                     // 0 = départ, 1 = arrivée
    const f = monte ? 0.5 + 0.5 * t : 1 - 0.62 * t;            // ça monte vers la lumière, ça descend dans le noir
    c.fillStyle = `rgb(${Math.round(150 * f)},${Math.round(136 * f)},${Math.round(112 * f)})`;
    c.fillRect(a + k * ep + 0.6, -larg / 2 + 2, ep - 1.2, larg - 4);
    c.fillStyle = 'rgba(255,240,210,0.18)'; c.fillRect(a + (k + 1) * ep - 2.2, -larg / 2 + 2, 1.4, larg - 4);   // nez de marche
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(a + k * ep, -larg / 2 + 2, 1, larg - 4);                       // contremarche
  }
  c.fillStyle = 'rgba(40,30,22,0.95)'; c.fillRect(-L / 2, -larg / 2, L, 2.4); c.fillRect(-L / 2, larg / 2 - 2.4, L, 2.4);   // limons
  // flèche : dans le sens où l'on va
  const r = Math.min(larg, L) * 0.22;
  c.strokeStyle = 'rgba(232,196,90,0.75)'; c.lineWidth = Math.max(1.6, r * 0.28); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-r, -r); c.lineTo(r * 0.4, 0); c.lineTo(-r, r); c.stroke();
  c.beginPath(); c.moveTo(-r * 1.9, 0); c.lineTo(r * 0.3, 0); c.stroke();
  c.restore();
}

function sortie(c, E, x, y, at) {
  if (x % 2 || y % 2) return;            // une flèche par unité
  const px = x * T, py = y * T;
  // direction : vers le bord de la carte le plus proche
  const dx = x < 4 ? -1 : x > E.w - 5 ? 1 : 0, dy = y < 4 ? -1 : y > E.h - 5 ? 1 : 0;
  const a = Math.atan2(dy || (dx ? 0 : 1), dx);
  c.save(); c.translate(px + T, py + T); c.rotate(a);

  c.strokeStyle = 'rgba(201,162,39,0.32)'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { const o = -6 + k * 9; c.beginPath(); c.moveTo(o - 4, -8); c.lineTo(o + 4, 0); c.lineTo(o - 4, 8); c.stroke(); }
  c.restore();
  void at; void hash; void ellipse;
}
