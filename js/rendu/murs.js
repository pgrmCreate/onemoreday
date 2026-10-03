// ============ Couche MURS : dessus texturé, arêtes, face avant (impression de hauteur), murets, grilles, haies,
// fenêtres, encadrements de portes, escaliers, sorties ============
// peindreMurs(c, niv, E, x0, y0, x1, y1) — coordonnées monde (1 case = TS px).
import { TS, rng, hash, cercle, ellipse, rr, avecOmbre } from './outils.js';
import { textureMur, COULEURS_MUR } from './textures.js';
import { K, MURS, MURS_IDS } from '../carte/catalogue.js';

export const FACE = 0.42;      // hauteur de la face avant d'un mur, en cases (dessinée sur la case du dessous)
const motifsMur = new Map();
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
    const px = x * TS, py = y * TS;
    c.fillStyle = motifMur(c, st); c.fillRect(px, py, TS, TS);
    // arêtes : côté ouvert = trait sombre + reflet intérieur (haut/gauche) ou ombre (bas/droite)
    const ouvert = (dx, dy) => { const j = at(x + dx, y + dy); return j >= 0 && !estMurPlein(E, j) && E.code[j] !== K.VIDE; };
    const T = COULEURS_MUR[st] || COULEURS_MUR.platre;
    if (ouvert(0, -1)) { c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px, py, TS, 1.6); c.fillStyle = 'rgba(255,240,220,0.2)'; c.fillRect(px, py + 1.6, TS, 1.6); }
    if (ouvert(-1, 0)) { c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px, py, 1.6, TS); c.fillStyle = 'rgba(255,240,220,0.16)'; c.fillRect(px + 1.6, py, 1.6, TS); }
    if (ouvert(1, 0)) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(px + TS - 4, py, 2.4, TS); c.fillStyle = 'rgba(8,7,6,0.85)'; c.fillRect(px + TS - 1.6, py, 1.6, TS); }
    if (ouvert(0, 1)) { c.fillStyle = 'rgba(255,240,220,0.12)'; c.fillRect(px, py + TS - 3, TS, 1.4); c.fillStyle = 'rgba(8,7,6,0.75)'; c.fillRect(px, py + TS - 1.4, TS, 1.4); }
    // ombre sur le dessus près du vide (l'épaisseur se perd dans le noir)
    void T;
    if (st === 'rocher') { const r = rng(x * 911 + y * 37); for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(255,255,255,0.05)'; cercle(c, px + r() * TS, py + r() * TS, 6 + r() * 8); c.fill(); } }
  }
  // 4) fenêtres, encadrements de portes
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x, k = E.code[i];
    if (k === K.FENETRE) fenetre(c, E, x, y, at);
    else if (k === K.PORTE) cadrePorte(c, E, niv, x, y, at);
  }
  // 5) escaliers et sorties
  for (const s of niv.escaliers) if (s.etage === E.id) for (const j of s.cases) { const x = j % w, y = (j / w) | 0; if (x >= X0 && x <= X1 && y >= Y0 && y <= Y1) marche(c, E, s, x, y); }
  for (const s of niv.sorties) if (s.etage === E.id) for (const j of s.cases) { const x = j % w, y = (j / w) | 0; if (x >= X0 && x <= X1 && y >= Y0 && y <= Y1) sortie(c, E, x, y, at); }
}

// Face avant d'un mur : bande verticale sur la case du dessous, dégradé + rangs selon la matière, plinthe, ombre de contact.
function face(c, E, x, y, st) {
  const T = COULEURS_MUR[st] || COULEURS_MUR.platre;
  const px = x * TS, py = (y + 1) * TS, H = TS * FACE;
  const g = c.createLinearGradient(0, py, 0, py + H);
  g.addColorStop(0, T.face); g.addColorStop(1, 'rgba(10,8,6,1)');
  c.fillStyle = g; c.fillRect(px, py, TS, H);
  // texture légère de la face (motif du mur assombri)
  c.save(); c.globalAlpha = 0.35; c.fillStyle = motifMur(c, st); c.fillRect(px, py, TS, H); c.restore();
  const r = rng(x * 7349 + y * 131);
  if (st === 'pierre' || st === 'rocher') { c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(px, py + H * k / 3); c.lineTo(px + TS, py + H * k / 3); c.stroke(); } for (let k = 0; k < 3; k++) { const xx = px + r() * TS; c.beginPath(); c.moveTo(xx, py + (k % 3) * H / 3); c.lineTo(xx, py + ((k % 3) + 1) * H / 3); c.stroke(); } }
  else if (st === 'brique') { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(px, py + H * k / 4); c.lineTo(px + TS, py + H * k / 4); c.stroke(); } }
  else if (st === 'bois') { c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(px + TS * k / 4, py); c.lineTo(px + TS * k / 4, py + H); c.stroke(); } }
  else if (st === 'tole') { for (let k = 0; k < TS; k += 5) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(px + k, py, 2, H); } }
  // arête haute (le coin du mur prend la lumière)
  c.fillStyle = 'rgba(255,240,220,0.14)'; c.fillRect(px, py, TS, 1.4);
  // plinthe à l'intérieur, pied plus sombre dehors
  if (st === 'platre') { c.fillStyle = T.plinthe; c.fillRect(px, py + H - 3.2, TS, 3.2); c.fillStyle = 'rgba(255,240,220,0.08)'; c.fillRect(px, py + H - 3.2, TS, 0.8); }
  else { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(px, py + H - 2.5, TS, 2.5); }
  // ombre de contact sur le sol
  const g2 = c.createLinearGradient(0, py + H, 0, py + H + TS * 0.22);
  g2.addColorStop(0, 'rgba(0,0,0,0.5)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g2; c.fillRect(px, py + H, TS, TS * 0.22);
  // salissures (coulures) aléatoires
  if (r() < 0.35) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(px + r() * TS, py + 2, 2 + r() * 4, H * (0.4 + r() * 0.5)); }
}

function murBas(c, E, x, y, st, horiz, vert) {
  const px = x * TS, py = y * TS, T = COULEURS_MUR[st] || COULEURS_MUR.muret;
  if (st === 'grille') {
    c.strokeStyle = '#141414'; c.lineCap = 'round';
    avecOmbre(c, 3, 2, 3, 0.6, () => {
      c.lineWidth = 2.4; c.beginPath();
      if (horiz) { c.moveTo(px, py + TS * 0.5); c.lineTo(px + TS, py + TS * 0.5); }
      if (vert) { c.moveTo(px + TS * 0.5, py); c.lineTo(px + TS * 0.5, py + TS); }
      c.stroke();
    });
    c.fillStyle = '#1e1e1e'; c.strokeStyle = '#3a3a3a'; c.lineWidth = 1;
    // barreaux pointus
    for (let k = 0; k < 4; k++) {
      const t = (k + 0.5) / 4;
      const bx = horiz ? px + t * TS : px + TS * 0.5, by = horiz ? py + TS * 0.5 : py + t * TS;
      cercle(c, bx, by, 2.2); c.fill(); c.stroke();
    }
    c.fillStyle = '#262626'; rr(c, px + TS * 0.5 - 4, py + TS * 0.5 - 4, 8, 8, 2); c.fill();
    return;
  }
  if (st === 'vitrine') {
    c.fillStyle = 'rgba(120,170,190,0.25)';
    if (horiz) c.fillRect(px, py + TS * 0.42, TS, TS * 0.16); else c.fillRect(px + TS * 0.42, py, TS * 0.16, TS);
    c.strokeStyle = 'rgba(200,230,240,0.35)'; c.lineWidth = 1; c.beginPath();
    if (horiz) { c.moveTo(px + 4, py + TS * 0.46); c.lineTo(px + TS * 0.4, py + TS * 0.46); } else { c.moveTo(px + TS * 0.46, py + 4); c.lineTo(px + TS * 0.46, py + TS * 0.4); }
    c.stroke();
    c.fillStyle = '#2a2a2a'; if (horiz) { c.fillRect(px, py + TS * 0.4, TS, 2); c.fillRect(px, py + TS * 0.58, TS, 2); } else { c.fillRect(px + TS * 0.4, py, 2, TS); c.fillRect(px + TS * 0.58, py, 2, TS); }
    return;
  }
  // muret de pierre
  const ep = TS * 0.5;
  const rect = horiz && !vert ? [px, py + (TS - ep) / 2, TS, ep] : vert && !horiz ? [px + (TS - ep) / 2, py, ep, TS] : [px + (TS - ep) / 2, py + (TS - ep) / 2, ep, ep];
  avecOmbre(c, 5, 3, 4, 0.55, () => { c.fillStyle = motifMur(c, 'pierre'); c.fillRect(...rect); });
  if (horiz && vert) { c.fillStyle = motifMur(c, 'pierre'); c.fillRect(px, py + (TS - ep) / 2, TS, ep); c.fillRect(px + (TS - ep) / 2, py, ep, TS); }
  c.strokeStyle = 'rgba(8,7,6,0.8)'; c.lineWidth = 1.2; c.strokeRect(rect[0] + 0.6, rect[1] + 0.6, rect[2] - 1.2, rect[3] - 1.2);
  c.fillStyle = 'rgba(255,240,220,0.14)'; c.fillRect(rect[0] + 1, rect[1] + 1, rect[2] - 2, 1.4);
  void T;
}

function haie(c, E, x, y) {
  const px = x * TS, py = y * TS, r = rng(x * 4513 + y * 977);
  avecOmbre(c, 8, 4, 6, 0.6, () => { c.fillStyle = '#1a2612'; rr(c, px - 2, py - 2, TS + 4, TS + 4, 10); c.fill(); });
  for (let k = 0; k < 16; k++) {
    const bx = px + r() * TS, by = py + r() * TS, t = 5 + r() * 8, f = 0.6 + r() * 0.6;
    c.fillStyle = `rgb(${34 * f | 0},${54 * f | 0},${26 * f | 0})`; cercle(c, bx, by, t); c.fill();
    c.fillStyle = 'rgba(160,200,120,0.07)'; cercle(c, bx - t * 0.3, by - t * 0.3, t * 0.5); c.fill();
  }
}

function fenetre(c, E, x, y, at) {
  const i = y * E.w + x, st = style(E, i);
  const px = x * TS, py = y * TS;
  c.fillStyle = motifMur(c, MURS[st] && !MURS[st].bas ? st : 'platre'); c.fillRect(px, py, TS, TS);
  const murG = at(x - 1, y) >= 0 && estMurOuOuv(E, at(x - 1, y)), murD = at(x + 1, y) >= 0 && estMurOuOuv(E, at(x + 1, y));
  const horiz = murG || murD || !(at(x, y - 1) >= 0 && estMurOuOuv(E, at(x, y - 1)));
  const cassee = E.def && E.def.force && E.def.force.get && (E.def.force.get(i) || {}).cassee;
  c.save();
  if (!horiz) { c.translate(px + TS / 2, py + TS / 2); c.rotate(Math.PI / 2); c.translate(-px - TS / 2, -py - TS / 2); }
  // appui de fenêtre, cadre, vitre
  c.fillStyle = '#20180f'; c.fillRect(px, py + TS * 0.3, TS, TS * 0.4);
  const g = c.createLinearGradient(px, py + TS * 0.36, px + TS, py + TS * 0.64);
  g.addColorStop(0, 'rgba(110,150,170,0.85)'); g.addColorStop(0.5, 'rgba(60,90,110,0.85)'); g.addColorStop(1, 'rgba(120,160,175,0.85)');
  c.fillStyle = g; c.fillRect(px + 2, py + TS * 0.38, TS - 4, TS * 0.24);
  c.fillStyle = 'rgba(230,245,255,0.35)'; c.fillRect(px + 5, py + TS * 0.4, TS * 0.3, 1.6);
  c.fillStyle = '#3a2c1c'; c.fillRect(px + TS / 2 - 1, py + TS * 0.36, 2, TS * 0.28);
  c.fillStyle = 'rgba(255,240,220,0.18)'; c.fillRect(px, py + TS * 0.3, TS, 1.2);
  if (cassee) { c.fillStyle = '#0c0c0e'; c.beginPath(); c.moveTo(px + 6, py + TS * 0.38); c.lineTo(px + TS * 0.55, py + TS * 0.5); c.lineTo(px + TS * 0.3, py + TS * 0.62); c.lineTo(px + 4, py + TS * 0.62); c.closePath(); c.fill(); }
  c.restore();
}

function cadrePorte(c, E, niv, x, y, at) {
  const i = y * E.w + x, p = niv.portes[E.porte[i]];
  if (!p) return;
  const st = style(E, i), stM = MURS[st] && !MURS[st].bas ? st : 'platre';
  const px = x * TS, py = y * TS;
  const horiz = p.orient === 'h';
  // seuil
  c.fillStyle = 'rgba(30,22,14,0.7)';
  if (horiz) c.fillRect(px, py + TS * 0.38, TS, TS * 0.24); else c.fillRect(px + TS * 0.38, py, TS * 0.24, TS);
  // montants (prolongent le mur)
  c.fillStyle = motifMur(c, stM);
  const e = TS * 0.14;
  if (horiz) { c.fillRect(px, py, e, TS); c.fillRect(px + TS - e, py, e, TS); }
  else { c.fillRect(px, py, TS, e); c.fillRect(px, py + TS - e, TS, e); }
  c.fillStyle = 'rgba(8,7,6,0.8)';
  if (horiz) { c.fillRect(px + e - 1, py, 1.2, TS); c.fillRect(px + TS - e, py, 1.2, TS); }
  else { c.fillRect(px, py + e - 1, TS, 1.2); c.fillRect(px, py + TS - e, TS, 1.2); }
}

function marche(c, E, s, x, y) {
  const px = x * TS, py = y * TS, monte = s.sens === 'monte';
  const vertical = s.cases.length > 1 && s.cases.every(j => (j % E.w) === (s.cases[0] % E.w));
  c.save();
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(px, py, TS, TS);
  const n = 4;
  for (let k = 0; k < n; k++) {
    const f = monte ? 0.55 + 0.45 * (k / n) : 1 - 0.55 * (k / n);
    c.fillStyle = `rgba(${Math.round(120 * f)},${Math.round(108 * f)},${Math.round(92 * f)},0.85)`;
    if (vertical) c.fillRect(px + 3, py + k * TS / n + 1, TS - 6, TS / n - 2); else c.fillRect(px + k * TS / n + 1, py + 3, TS / n - 2, TS - 6);
    c.fillStyle = 'rgba(0,0,0,0.5)';
    if (vertical) c.fillRect(px + 3, py + (k + 1) * TS / n - 2, TS - 6, 1.6); else c.fillRect(px + (k + 1) * TS / n - 2, py + 3, 1.6, TS - 6);
  }
  c.fillStyle = '#2a2018'; if (vertical) { c.fillRect(px, py, 3, TS); c.fillRect(px + TS - 3, py, 3, TS); } else { c.fillRect(px, py, TS, 3); c.fillRect(px, py + TS - 3, TS, 3); }
  c.restore();
}

function sortie(c, E, x, y, at) {
  const px = x * TS, py = y * TS;
  // direction : vers le bord de la carte le plus proche
  const dx = x < 2 ? -1 : x > E.w - 3 ? 1 : 0, dy = y < 2 ? -1 : y > E.h - 3 ? 1 : 0;
  const a = Math.atan2(dy || (dx ? 0 : 1), dx);
  c.save(); c.translate(px + TS / 2, py + TS / 2); c.rotate(a);
  c.strokeStyle = 'rgba(201,162,39,0.32)'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { const o = -6 + k * 9; c.beginPath(); c.moveTo(o - 4, -8); c.lineTo(o + 4, 0); c.lineTo(o - 4, 8); c.stroke(); }
  c.restore();
  void at; void hash; void ellipse;
}
