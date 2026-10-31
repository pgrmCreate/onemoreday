// ============ Les objets posés par terre, vus de dessus ============
// Un objet par terre ressemble à ce qu'il est (docs/RETOURS_JOUEUR.md #64) : une branche est une branche (bois fourchu,
// écorce, rameaux secs), une pierre un caillou, une boîte de conserve un cylindre couché avec son étiquette, un couteau un
// couteau, un jean un jean. Chaque objet a son dessin, sinon celui de sa famille (arme, vêtement selon la partie du corps,
// nourriture, soin, outil…), peint UNE fois en sprite (cache mesuré en pixels) avec son ombre portée vers le bas-droite,
// couché selon un angle tiré de sa place ; trois pierres montrent trois cailloux. Un reflet chaud qui respire, à peine, et
// un éclat de temps en temps disent qu'on peut le ramasser.
//   dessinerObjetSol(c, o, t)     o = { id, qty, x, y, uid } ou { doc } (un document)
//   brancheSeche(c, x0, y0, x1, y1, ep, r, o)   une branche morte (partagée avec le tas de bois du camp, ./objets.js)
import { TS, canvas, rng, graine, rr, cercle, ellipse, teinte, clamp } from './outils.js';
import { RES, peutPeindre } from './corps.js';
import { formeArme, dessinerArme, SACS } from './personnages.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES } from '../data/clothing.js';

const TAU = Math.PI * 2;
const NOIR = 'rgba(16,10,6,0.85)';

// ---------- Petits outils de dessin ----------
// un trait cerné de sombre (lisible sur tous les sols)
function trait(c, pts, ep, coul, contour = NOIR) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) c.lineTo(pts[k][0], pts[k][1]);
  c.strokeStyle = contour; c.lineWidth = ep + 1.3; c.stroke();
  c.strokeStyle = coul; c.lineWidth = ep; c.stroke();
}
// une forme pleine cernée
function plein(c, coul, trace, contour = NOIR, lw = 1) { trace(); c.fillStyle = coul; c.fill(); c.strokeStyle = contour; c.lineWidth = lw; c.stroke(); }
// un reflet clair en haut-gauche (le soleil du jeu)
function reflet(c, x, y, w, h, a = 0.22) { c.fillStyle = 'rgba(255,248,230,' + a + ')'; ellipse(c, x, y, w, h); c.fill(); }
// un caillou irrégulier (calcaire gris du pays, un peu de terre dans les creux)
export function caillou(c, x, y, R, r, coul = '#8e877a') {
  const n = 9, pts = [];
  for (let k = 0; k < n; k++) { const a = k / n * TAU, d = R * (0.78 + r() * 0.32); pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.86]); }
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); c.closePath();
  const g = c.createLinearGradient(x - R, y - R, x + R, y + R); g.addColorStop(0, teinte(coul, 1.06)); g.addColorStop(1, teinte(coul, 0.6));
  c.fillStyle = g; c.fill(); c.strokeStyle = NOIR; c.lineWidth = 0.9; c.stroke();
  reflet(c, x - R * 0.3, y - R * 0.3, R * 0.3, R * 0.18, 0.12);
  c.fillStyle = 'rgba(70,52,34,0.28)'; ellipse(c, x + R * 0.25, y + R * 0.3, R * 0.4, R * 0.2, 0.3); c.fill();   // la terre collée dessous
  if (r() < 0.6) { c.strokeStyle = 'rgba(40,34,28,0.35)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(x - R * 0.2, y + R * 0.1); c.lineTo(x + R * 0.35, y + R * 0.3); c.stroke(); }
}
// Une branche morte de pin : bois fourchu, écorce grise et brune qui s'effile, deux ou trois rameaux, quelques touffes
// d'aiguilles rousses au bout, et la cassure claire du gros bout.
export function brancheSeche(c, x0, y0, x1, y1, ep, r, o = {}) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
  const ecorce = o.ecorce || ['#5e4a36', '#6a5540', '#54442f'][Math.floor(r() * 3)];
  const bend = (r() - 0.5) * L * 0.12;
  const P = (t, off = 0) => [x0 + ux * L * t + nx * (Math.sin(t * Math.PI) * bend + off), y0 + uy * L * t + ny * (Math.sin(t * Math.PI) * bend + off)];
  // rameaux (sous la branche)
  const rameaux = [];
  const nr = o.rameaux ?? (2 + Math.floor(r() * 2));
  for (let k = 0; k < nr; k++) {
    const t = 0.3 + r() * 0.55, s = r() < 0.5 ? -1 : 1, a = Math.atan2(uy, ux) + s * (0.45 + r() * 0.5), l = L * (0.18 + r() * 0.2);
    const [bx, by] = P(t); rameaux.push([bx, by, bx + Math.cos(a) * l, by + Math.sin(a) * l, ep * (0.38 + r() * 0.12)]);
  }
  for (const [ax, ay, bx, by, e] of rameaux) trait(c, [[ax, ay], [(ax + bx) / 2 + (r() - 0.5) * 2, (ay + by) / 2 + (r() - 0.5) * 2], [bx, by]], e, teinte(ecorce, 0.92));
  // le bois principal : trois tronçons de plus en plus fins
  const seg = [[0, 0.4, 1], [0.38, 0.75, 0.78], [0.72, 1, 0.55]];
  for (const [a, b, f] of seg) { const A = P(a), M = P((a + b) / 2), B = P(b); trait(c, [A, M, B], ep * f, ecorce); }
  // le dessus de l'écorce, éclairé
  c.strokeStyle = 'rgba(200,180,150,0.35)'; c.lineWidth = Math.max(0.5, ep * 0.25);
  c.beginPath(); for (let k = 0; k <= 8; k++) { const [px, py] = P(k / 8 * 0.9, -ep * 0.22); if (k) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke();
  // les nœuds de l'écorce
  c.fillStyle = 'rgba(30,20,12,0.45)'; for (let k = 0; k < 4; k++) { const [px, py] = P(0.1 + r() * 0.8); ellipse(c, px, py, ep * 0.22, ep * 0.14, Math.atan2(uy, ux)); c.fill(); }
  // les aiguilles mortes (rousses) au bout des rameaux et de la branche
  if (o.aiguilles !== false) {
    const bouts = rameaux.map(q => [q[2], q[3]]).concat([P(1)]);
    for (const [bx, by] of bouts) if (r() < 0.8) {
      c.strokeStyle = ['#9a6e3a', '#8a6232', '#a67a44'][Math.floor(r() * 3)]; c.lineWidth = 0.55;
      c.beginPath(); for (let k = 0; k < 9; k++) { const a = r() * TAU, l = 2 + r() * 3.2; c.moveTo(bx, by); c.lineTo(bx + Math.cos(a) * l, by + Math.sin(a) * l); } c.stroke();
    }
  }
  // la cassure du gros bout : bois clair
  c.fillStyle = '#c8aa7a'; ellipse(c, x0, y0, ep * 0.42, ep * 0.5, Math.atan2(uy, ux)); c.fill();
  c.strokeStyle = 'rgba(90,60,30,0.55)'; c.lineWidth = 0.5; ellipse(c, x0, y0, ep * 0.2, ep * 0.26, Math.atan2(uy, ux)); c.stroke();
}
// une brindille (fine, sans aiguilles)
const brindille = (c, x0, y0, x1, y1, r) => trait(c, [[x0, y0], [(x0 + x1) / 2 + (r() - 0.5) * 2.4, (y0 + y1) / 2 + (r() - 0.5) * 2.4], [x1, y1]], 0.9 + r() * 0.5, ['#6a5440', '#7a6248', '#5a4836'][Math.floor(r() * 3)], 'rgba(16,10,6,0.7)');
// un paquet (sachet, emballage) : rectangle arrondi coloré, une bande, un reflet
function paquet(c, w, h, coul, bande, o = {}) {
  plein(c, coul, () => rr(c, -w / 2, -h / 2, w, h, o.r ?? 1.5));
  if (bande) { c.fillStyle = bande; c.fillRect(-w / 2 + 1, -h * 0.12, w - 2, h * 0.3); }
  if (o.dents) { c.fillStyle = 'rgba(255,255,255,0.25)'; for (let x = -w / 2 + 1; x < w / 2 - 1; x += 2) c.fillRect(x, -h / 2 + 0.3, 1, 1.2); }
  reflet(c, -w * 0.18, -h * 0.25, w * 0.25, h * 0.12);
}
// une boîte de conserve couchée : le cylindre, l'étiquette, les deux bords de métal
function conserve(c, coul, L = 13, D = 10) {
  plein(c, '#9ea4a6', () => rr(c, -L / 2, -D / 2, L, D, 2));
  c.fillStyle = coul; c.fillRect(-L / 2 + 2, -D / 2 + 0.6, L - 4, D - 1.2);
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-L / 2 + 2, -D / 2 + 1.2, L - 4, 1.4);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-L / 2 + 2, D / 2 - 2.4, L - 4, 1.6);
  c.strokeStyle = 'rgba(30,30,30,0.6)'; c.lineWidth = 0.5; for (const x of [-L / 2 + 2, L / 2 - 2]) { c.beginPath(); c.moveTo(x, -D / 2); c.lineTo(x, D / 2); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-2, -1.4, 4, 2.4);  // le petit cartouche de l'étiquette
}
// une bouteille couchée (plastique transparent ou verre), pleine ou vide
function bouteille(c, o = {}) {
  const L = o.L || 22, D = o.D || 8, verre = o.verre;
  const corps = verre || 'rgba(190,220,235,0.55)';
  plein(c, corps, () => { c.beginPath(); c.moveTo(-L / 2, -D / 2); c.lineTo(L * 0.18, -D / 2); c.quadraticCurveTo(L * 0.32, -D / 2, L * 0.36, -D * 0.22); c.lineTo(L / 2 - 2, -D * 0.22); c.lineTo(L / 2 - 2, D * 0.22); c.lineTo(L * 0.36, D * 0.22); c.quadraticCurveTo(L * 0.32, D / 2, L * 0.18, D / 2); c.lineTo(-L / 2, D / 2); c.closePath(); }, 'rgba(20,30,40,0.75)', 0.8);
  if (o.plein) { c.fillStyle = verre ? 'rgba(0,0,0,0.25)' : 'rgba(80,140,200,0.45)'; c.fillRect(-L / 2 + 0.8, -D / 2 + D * 0.42, L * 0.62, D * 0.5); }
  if (o.etiquette) { c.fillStyle = o.etiquette; c.fillRect(-L * 0.25, -D / 2 + 0.4, L * 0.28, D - 0.8); }
  c.fillStyle = o.bouchon || '#2a5aa8'; rr(c, L / 2 - 2.6, -D * 0.27, 3, D * 0.54, 0.6); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(-L / 2 + 1.5, -D / 2 + 1.1, L * 0.55, 0.9);
}
// une canette couchée (froissée si vide)
function canette(c, coul, vide) {
  const L = 12.5, D = 7.5;
  c.save(); if (vide) c.transform(1, 0.12, -0.08, 0.86, 0, 0);
  plein(c, coul, () => rr(c, -L / 2, -D / 2, L, D, 1.6));
  c.fillStyle = '#c4c8ca'; c.fillRect(L / 2 - 2, -D / 2 + 0.4, 1.6, D - 0.8); c.fillRect(-L / 2 + 0.4, -D / 2 + 0.4, 1.2, D - 0.8);
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-L / 2 + 2, -D / 2 + 1, L - 4.5, 1.2);
  if (vide) { c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-1, -D / 2); c.lineTo(1.5, 0); c.lineTo(-0.5, D / 2); c.stroke(); }
  c.restore();
}
// un bocal vu de dessus : le couvercle, le verre autour, le contenu
function bocal(c, contenu, couvercle = '#c23a2a', carreaux = false) {
  plein(c, 'rgba(200,220,220,0.55)', () => cercle(c, 0, 0, 7), 'rgba(20,30,30,0.7)', 0.8);
  c.fillStyle = contenu; cercle(c, 0, 0, 6); c.fill();
  c.fillStyle = couvercle; cercle(c, 0, 0, 4.8); c.fill();
  if (carreaux) { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let y = -4; y < 4; y += 2) for (let x = -4; x < 4; x += 2) if (((x + y) / 2) % 2 === 0 && x * x + y * y < 20) c.fillRect(x, y, 1.6, 1.6); }
  reflet(c, -2, -2.2, 1.8, 1, 0.45);
}
// un livre fermé (couverture, dos, tranche des pages)
function livre(c, coul, w = 14, h = 18) {
  plein(c, coul, () => rr(c, -w / 2, -h / 2, w, h, 1));
  c.fillStyle = teinte(coul, 0.65); c.fillRect(-w / 2, -h / 2, 2.2, h);
  c.fillStyle = '#e6dfcc'; c.fillRect(w / 2 - 1.2, -h / 2 + 1, 1.2, h - 2);
  c.fillStyle = 'rgba(255,240,200,0.55)'; c.fillRect(-w / 2 + 4, -h / 2 + 3, w - 7, 1.4); c.fillRect(-w / 2 + 4, -h / 2 + 5.6, w - 9, 0.9);
}
// une boîte de soin : blanche, une croix
function boiteSoin(c, w, h, croix = '#c42a2a', fond = '#e8e6e0') {
  plein(c, fond, () => rr(c, -w / 2, -h / 2, w, h, 1.5));
  c.fillStyle = croix; c.fillRect(-1, -h * 0.3, 2, h * 0.6); c.fillRect(-w * 0.25, -1, w * 0.5, 2);
}
// un vêtement plié : un rectangle doux, la marque d'un pli, le col
function plie(c, coul, w = 18, h = 14, col = true) {
  plein(c, coul, () => rr(c, -w / 2, -h / 2, w, h, 3), 'rgba(12,10,8,0.75)', 0.9);
  c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-w / 2 + 2, h * 0.08); c.lineTo(w / 2 - 2, h * 0.02); c.stroke();
  if (col) { c.strokeStyle = teinte(coul, 0.6); c.lineWidth = 1.4; c.beginPath(); c.arc(0, -h / 2 + 0.4, w * 0.18, 0.15, Math.PI - 0.15); c.stroke(); }
  reflet(c, -w * 0.2, -h * 0.22, w * 0.22, h * 0.1, 0.16);
}

// ---------- Couleurs des vêtements (comme sur le joueur, js/explore/vue.js) ----------
const COUL_VET = {
  tshirt: '#5a5e4a', chemise: '#7a8496', debardeur: '#a89e86', maillot_thermique: '#2a2a2e', sweat_capuche: '#4a5260', pull_laine: '#6a3e3a',
  polaire: '#3e5a6a', gilet_laine: '#7a6a52', veste_jean: '#3e5274', coupe_vent: '#2f6f8a', parka: '#4a5a3a', doudoune: '#a0402c',
  blouse_medicale: '#c4ccca', veste_cuir: '#3a2a22', blouson_moto: '#232126', manteau_hiver: '#2e3a3e', veste_pompier: '#2c2e36',
  gilet_tactique: '#3e4630', veste_renforcee: '#4a3a2c', poncho_pluie: '#3a6a3a',
  jean: '#2e3e5a', jogging: '#3a3a40', pantalon_cargo: '#4a4a36', treillis: '#3e4630', jean_genouilleres: '#2e3a4e',
};
const couleurVet = (id) => COUL_VET[id] || ['#4a4a40', '#5a4a3a', '#3a4a5a'][graine(id) % 3];

// ---------- Le dessin de chaque objet ----------
// d(c, r, k) : dessine l'exemplaire k (centré sur 0, couché le long de x) ; R : rayon du sprite ; n : exemplaires montrés au plus.
// e(k, r) : où se pose l'exemplaire k quand il y en a plusieurs.
const eparpille = (dx = 6, dy = 4) => (k, r) => (k === 0 ? [0, 0, 0] : [(k === 1 ? 1 : -1) * dx + (r() - 0.5) * 3, (k === 1 ? -1 : 1) * dy + (r() - 0.5) * 3, (r() - 0.5) * 1.6]);
const SPECIAUX = {
  branche: { R: 30, n: 2, e: (k, r) => (k ? [(r() - 0.5) * 6, 7 + r() * 3, 0.25 + (r() - 0.5) * 0.5] : [0, -2, 0]), d: (c, r) => brancheSeche(c, -24, 0, 24, 0, 4.4, r) },
  brindilles: { R: 18, n: 1, d: (c, r) => { for (let k = 0; k < 9; k++) { const a = (r() - 0.5) * 0.9 + (k % 2 ? Math.PI : 0), l = 9 + r() * 7, ox = (r() - 0.5) * 6, oy = (r() - 0.5) * 6; brindille(c, ox - Math.cos(a) * l, oy - Math.sin(a) * l * 0.6, ox + Math.cos(a) * l, oy + Math.sin(a) * l * 0.6, r); } } },
  buche: { R: 22, n: 2, e: eparpille(4, 7), d: (c, r) => {
    plein(c, '#5a4632', () => rr(c, -15, -5.5, 30, 11, 4));
    c.strokeStyle = 'rgba(25,16,8,0.55)'; c.lineWidth = 0.7; for (let k = 0; k < 6; k++) { const y = -4 + k * 1.6; c.beginPath(); c.moveTo(-13, y + (r() - 0.5)); c.lineTo(13, y + (r() - 0.5)); c.stroke(); }
    c.fillStyle = '#c4a272'; ellipse(c, 14, 0, 2.8, 5.2); c.fill(); c.strokeStyle = 'rgba(110,70,30,0.6)'; c.lineWidth = 0.5; ellipse(c, 14, 0, 1.4, 2.8); c.stroke();
  } },
  // assez gros et assez clairs pour se détacher du sol : une pierre, ça se ramasse (docs/RETOURS_JOUEUR.md)
  pierre: { R: 20, n: 3, e: eparpille(9, 6), d: (c, r) => {
    const t = 7 + r() * 2.4;
    c.fillStyle = 'rgba(10,8,6,0.45)'; ellipse(c, 1.6, 2.2, t * 1.05, t * 0.82); c.fill();   // son ombre portée
    caillou(c, 0, 0, t, r, ['#c4bcac', '#b6ae9e', '#cec6b4', '#a89f8e'][Math.floor(r() * 4)]);
  } },
  feuilles: { R: 20, n: 1, d: (c, r) => {
    c.fillStyle = 'rgba(0,0,0,0.3)'; ellipse(c, 1, 1.5, 15, 10.5); c.fill();
    for (let k = 0; k < 46; k++) {
      const a = r() * TAU, d = Math.sqrt(r()) * 13;
      c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d * 0.72); c.rotate(r() * TAU);
      c.fillStyle = ['#8a6a2a', '#7a5a26', '#9a7032', '#5a4a22', '#6a3a1a', '#a08034'][Math.floor(r() * 6)]; ellipse(c, 0, 0, 3.6, 2); c.fill();
      c.strokeStyle = 'rgba(30,18,6,0.45)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3.4, 0); c.lineTo(3.4, 0); c.stroke();
      c.restore();
    }
  } },
  brique: { R: 13, n: 2, e: eparpille(5, 5), d: (c) => { plein(c, '#a24a32', () => rr(c, -9, -4.5, 18, 9, 1)); c.fillStyle = 'rgba(0,0,0,0.25)'; cercle(c, -4, 0, 1.4); c.fill(); cercle(c, 0, 0, 1.4); c.fill(); cercle(c, 4, 0, 1.4); c.fill(); } },
  planche: { R: 28, n: 2, e: eparpille(2, 6), d: (c, r) => {
    plein(c, '#a07a4e', () => c.rect(-24, -4.5, 48, 9));
    c.strokeStyle = 'rgba(70,45,20,0.45)'; c.lineWidth = 0.6; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-23, -2.5 + k * 2.5); c.bezierCurveTo(-8, -3 + k * 2.5 + r() * 2, 8, -2 + k * 2.5, 23, -2.5 + k * 2.5 + r()); c.stroke(); }
    c.fillStyle = '#5a5e62'; cercle(c, -20, -2, 0.9); c.fill(); cercle(c, -20, 2, 0.9); c.fill();
  } },
  manche_balai: { R: 30, n: 1, d: (c) => trait(c, [[-26, 0], [26, 0]], 2.6, '#9a7a52') },
  cannes: { R: 30, n: 1, d: (c, r) => { for (let k = 0; k < 5; k++) trait(c, [[-26, -3 + k * 1.5 + r()], [26, -3 + k * 1.5 + r()]], 1.8, '#c8b47a', 'rgba(40,30,10,0.7)'); } },
  fil_de_fer: { R: 14, n: 1, d: (c, r) => {
    for (const [lw, s] of [[2.6, NOIR], [1.3, '#9aa0a2']]) { c.strokeStyle = s; c.lineWidth = lw; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(k * 0.7 - 1, k * 0.5 - 0.8, 8.5, 6.5, 0.2, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(7, 3); c.quadraticCurveTo(11, 6, 12, 9); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(-1, -1, 8.5, 6.5, 0.2, 3.6, 4.6); c.stroke();
  } },
  corde: { R: 14, n: 1, d: (c) => {
    for (const [lw, s] of [[3.6, 'rgba(30,20,8,0.85)'], [2.4, '#c2a676']]) { c.strokeStyle = s; c.lineWidth = lw; c.beginPath(); for (let a = 0; a < TAU * 3.2; a += 0.2) { const R = 2 + a * 0.4; const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.85; if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(90,60,30,0.5)'; c.lineWidth = 0.5; for (let a = 0.3; a < TAU * 3.2; a += 0.55) { const R = 2 + a * 0.4, x = Math.cos(a) * R, y = Math.sin(a) * R * 0.85; c.beginPath(); c.moveTo(x - 0.8, y - 0.8); c.lineTo(x + 0.8, y + 0.8); c.stroke(); }
  } },
  cable_electrique: { R: 13, n: 1, d: (c) => { for (const [lw, s] of [[2.6, NOIR], [1.6, '#2a2a2c']]) { c.strokeStyle = s; c.lineWidth = lw; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(k - 1, k * 0.6 - 0.6, 8, 6, 0.4, 0, TAU); c.stroke(); } } c.fillStyle = '#e8e2d0'; rr(c, 6, 4, 5, 3, 0.8); c.fill(); } },
  bache_plastique: { R: 20, n: 1, d: (c) => {
    plein(c, '#2e5a8a', () => rr(c, -14, -10, 28, 20, 1.5));
    c.strokeStyle = 'rgba(10,25,45,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-14, -3); c.lineTo(14, -3); c.moveTo(-14, 4); c.lineTo(14, 4); c.moveTo(-3, -10); c.lineTo(-3, 10); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-13, -9, 9, 5);
    c.fillStyle = '#c8ccd0'; for (const [x, y] of [[-12, -8], [12, -8], [-12, 8], [12, 8]]) { cercle(c, x, y, 1.1); c.fill(); }
  } },
  sac_plastique: { R: 13, n: 1, d: (c, r) => { plein(c, 'rgba(225,228,230,0.9)', () => { c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, d = 7 + r() * 3; k ? c.lineTo(Math.cos(a) * d, Math.sin(a) * d * 0.8) : c.moveTo(Math.cos(a) * d, Math.sin(a) * d * 0.8); } c.closePath(); }, 'rgba(60,60,60,0.6)', 0.7); c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-4, -2); c.lineTo(3, 2); c.moveTo(-2, 3); c.lineTo(4, -3); c.stroke(); } },
  chiffon: { R: 12, n: 1, d: (c, r) => { plein(c, '#b8b0a0', () => { c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, d = 6 + r() * 2.5; k ? c.lineTo(Math.cos(a) * d, Math.sin(a) * d * 0.8) : c.moveTo(Math.cos(a) * d, Math.sin(a) * d * 0.8); } c.closePath(); }, 'rgba(30,26,20,0.7)', 0.7); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, 1); c.stroke(); } },
  drap: { R: 16, n: 1, d: (c) => plie(c, '#d8d4c8', 22, 16, false) },
  couverture: { R: 17, n: 1, d: (c) => { plie(c, '#7a3a2e', 24, 17, false); c.strokeStyle = 'rgba(220,200,160,0.5)'; c.lineWidth = 0.8; for (const y of [-5, 5]) { c.beginPath(); c.moveTo(-11, y); c.lineTo(11, y); c.stroke(); } } },
  sac_couchage: { R: 18, n: 1, d: (c) => { plein(c, '#2e4a6a', () => rr(c, -14, -6, 28, 12, 6)); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.8; for (let x = -9; x < 12; x += 5) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x, 6); c.stroke(); } c.fillStyle = '#1e1e22'; c.fillRect(-14, -1.2, 28, 2.4); } },
  journal_papier: { R: 14, n: 1, d: (c) => { plein(c, '#d8d2c0', () => c.rect(-9, -11, 18, 22), 'rgba(40,36,30,0.6)', 0.6); c.fillStyle = 'rgba(20,20,20,0.75)'; c.fillRect(-7.5, -9.5, 15, 2.5); c.fillStyle = 'rgba(0,0,0,0.3)'; for (let y = -5.5; y < 9; y += 1.8) { c.fillRect(-7.5, y, 6.5, 0.8); c.fillRect(1, y, 6.5, 0.8); } } },
  clous: { R: 12, n: 1, d: (c, r) => { for (let k = 0; k < 6; k++) { const a = r() * TAU, x = (r() - 0.5) * 12, y = (r() - 0.5) * 9; trait(c, [[x, y], [x + Math.cos(a) * 6, y + Math.sin(a) * 6]], 0.8, '#8a8e90', 'rgba(20,20,20,0.8)'); c.fillStyle = '#6a6e70'; cercle(c, x, y, 1.1); c.fill(); } } },
  visserie: { R: 11, n: 1, d: (c, r) => { for (let k = 0; k < 7; k++) { const x = (r() - 0.5) * 12, y = (r() - 0.5) * 9; c.fillStyle = '#9a9ea0'; cercle(c, x, y, 1.4); c.fill(); c.strokeStyle = NOIR; c.lineWidth = 0.5; c.stroke(); } } },
  ressort: { R: 11, n: 1, d: (c) => { for (const [lw, s] of [[2.2, NOIR], [1.1, '#a8acae']]) { c.strokeStyle = s; c.lineWidth = lw; c.beginPath(); for (let k = 0; k <= 40; k++) { const t = k / 40, x = -8 + t * 16, y = Math.sin(t * TAU * 5) * 3.2; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } } },
  ferraille: { R: 14, n: 1, d: (c, r) => { for (let k = 0; k < 4; k++) { c.save(); c.translate((r() - 0.5) * 10, (r() - 0.5) * 8); c.rotate(r() * TAU); plein(c, ['#7a5a3e', '#6a6e70', '#8a5a34'][k % 3], () => { c.beginPath(); c.moveTo(-5, -2); c.lineTo(4, -3); c.lineTo(6, 2); c.lineTo(-3, 3); c.closePath(); }, NOIR, 0.7); c.restore(); } } },
  eclat_verre: { R: 11, n: 1, d: (c, r) => { for (let k = 0; k < 5; k++) { const x = (r() - 0.5) * 12, y = (r() - 0.5) * 9, a = r() * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); c.lineTo(x + Math.cos(a + 2.2) * 3, y + Math.sin(a + 2.2) * 3); c.lineTo(x + Math.cos(a + 4) * 2, y + Math.sin(a + 4) * 2); c.closePath(); c.fillStyle = 'rgba(190,225,235,0.6)'; c.fill(); c.strokeStyle = 'rgba(240,255,255,0.8)'; c.lineWidth = 0.5; c.stroke(); } } },
  scotch: { R: 9, n: 1, d: (c) => { plein(c, '#b8b4a8', () => cercle(c, 0, 0, 6.5), NOIR, 0.8); c.fillStyle = 'rgba(80,70,50,0.9)'; cercle(c, 0, 0, 3.8); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.5; c.beginPath(); c.arc(0, 0, 5.2, 3.6, 4.8); c.stroke(); } },
  sac_sable: { R: 16, n: 1, d: (c) => { plein(c, '#a89470', () => rr(c, -12, -7.5, 24, 15, 6)); c.strokeStyle = 'rgba(60,50,30,0.45)'; c.lineWidth = 0.6; for (let x = -8; x <= 8; x += 4) { c.beginPath(); c.moveTo(x, -7); c.lineTo(x, 7); c.stroke(); } } },
  fibres: { R: 15, n: 1, d: (c, r) => { c.lineWidth = 0.7; for (let k = 0; k < 14; k++) { c.strokeStyle = ['#a8a070', '#8a8a58', '#b8ae80'][k % 3]; const y = (r() - 0.5) * 6; c.beginPath(); c.moveTo(-11, y + (r() - 0.5) * 3); c.quadraticCurveTo(0, y + (r() - 0.5) * 5, 11, y + (r() - 0.5) * 3); c.stroke(); } c.fillStyle = '#6a5a3a'; c.fillRect(-1.5, -4, 3, 8); } },
  herbes_simples: { R: 13, n: 1, d: (c, r) => { for (let k = 0; k < 9; k++) { const a = (r() - 0.5) * 0.8; trait(c, [[-8, 0], [6 * Math.cos(a), 6 * Math.sin(a)]], 0.7, '#5a6a3a', 'rgba(20,24,10,0.6)'); c.fillStyle = ['#6a8a4a', '#7a9a5a'][k % 2]; ellipse(c, 6 * Math.cos(a) + 1.5, 6 * Math.sin(a), 2.4, 1.2, a); c.fill(); } c.fillStyle = '#8a6a3a'; c.fillRect(-8, -1.5, 2.5, 3); } },
  graines: { R: 10, n: 1, d: (c) => { paquet(c, 11, 14, '#e8dcb0', '#5a8a3a'); c.fillStyle = '#c84a2a'; cercle(c, 0, -3, 2); c.fill(); } },
  telephone_mort: { R: 11, n: 1, d: (c) => { plein(c, '#1c1c20', () => rr(c, -5, -9, 10, 18, 2)); c.fillStyle = '#2a3440'; rr(c, -4, -7.5, 8, 14, 1); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3, -6); c.lineTo(3, 4); c.stroke(); } },
  batterie_telephone: { R: 9, n: 1, d: (c) => { plein(c, '#2a2a2e', () => rr(c, -6, -3.5, 12, 7, 1)); c.fillStyle = '#c8a040'; c.fillRect(4.5, -2, 1.5, 4); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-4, -1, 5, 1); } },
  reveil: { R: 10, n: 1, d: (c) => { plein(c, '#b83a2a', () => cercle(c, 0, 0, 6.5)); c.fillStyle = '#f0ece0'; cercle(c, 0, 0, 4.8); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -3.4); c.moveTo(0, 0); c.lineTo(2.4, 0.6); c.stroke(); c.fillStyle = '#c8ccd0'; cercle(c, -4.8, -4.8, 2); c.fill(); cercle(c, 4.8, -4.8, 2); c.fill(); } },
  boite_vide: { R: 9, n: 2, e: eparpille(5, 4), d: (c) => { plein(c, '#a8aeb0', () => cercle(c, 0, 0, 5.5)); c.fillStyle = '#4a4e50'; cercle(c, 0, 0, 4.3); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.6; c.beginPath(); c.arc(0, 0, 4.9, 3.4, 4.9); c.stroke(); } },
  huile_olive: { R: 15, n: 1, d: (c) => bouteille(c, { verre: 'rgba(110,130,40,0.85)', plein: true, etiquette: '#e8dcb0', bouchon: '#2a2a2a', L: 22, D: 7.5 }) },
  essence: { R: 17, n: 1, d: (c) => jerrican(c, '#b82a1e') },
  jerrican_gasoil: { R: 17, n: 1, d: (c) => jerrican(c, '#2a4a2a') },
  bidon_vide: { R: 17, n: 1, d: (c) => jerrican(c, '#2a4a7a') },
  appat: { R: 8, n: 1, d: (c) => { plein(c, '#d8d0c0', () => cercle(c, 0, 0, 5)); c.fillStyle = '#6a4a2a'; cercle(c, 0, 0, 3.6); c.fill(); } },
  // contenants
  bouteille_eau: { R: 15, n: 2, e: eparpille(3, 6), d: (c) => bouteille(c, { plein: true, etiquette: '#3a8ac8' }) },
  bouteille_vide: { R: 15, n: 2, e: eparpille(3, 6), d: (c) => bouteille(c, { etiquette: '#3a8ac8' }) },
  eau_croupie: { R: 15, n: 1, d: (c) => bouteille(c, { plein: true, verre: 'rgba(150,160,110,0.65)', bouchon: '#5a5a3a' }) },
  eau_purifiee: { R: 15, n: 1, d: (c) => bouteille(c, { plein: true, etiquette: '#e8e8e8' }) },
  alcool_fort: { R: 15, n: 1, d: (c) => bouteille(c, { verre: 'rgba(120,70,30,0.85)', plein: true, etiquette: '#e8d8a0', bouchon: '#a8a8a8', L: 21 }) },
  cocktail_molotov: { R: 16, n: 1, d: (c) => { bouteille(c, { verre: 'rgba(60,110,60,0.85)', plein: true, bouchon: '#e0dcd0', L: 21 }); c.fillStyle = '#d8d0b8'; ellipse(c, 12, 0, 3.5, 2); c.fill(); } },
  gourde: { R: 12, n: 1, d: (c) => { plein(c, '#5a6a4a', () => ellipse(c, 0, 0, 9, 6.5)); c.fillStyle = '#2a2a2a'; rr(c, 7.5, -2, 4, 4, 1); c.fill(); reflet(c, -3, -2.5, 3, 1.4); } },
  thermos: { R: 13, n: 1, d: (c) => { plein(c, '#3a4a5a', () => rr(c, -10, -4, 20, 8, 3)); c.fillStyle = '#1e1e20'; c.fillRect(7, -4, 3, 8); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-8, -3, 13, 1.2); } },
  canette_vide: { R: 13, n: 3, e: eparpille(6, 5), d: (c, r) => canette(c, ['#b02a2a', '#2a5aa8', '#a8a8a8'][Math.floor(r() * 3)], true) },
  soda: { R: 10, n: 2, e: eparpille(4, 5), d: (c, r) => canette(c, ['#c42a2a', '#e08a1a', '#2a7a3a'][Math.floor(r() * 3)], false) },
  jus_fruits: { R: 10, n: 1, d: (c) => { plein(c, '#e8a020', () => rr(c, -5, -8, 10, 16, 1)); c.fillStyle = '#e8e4d0'; c.fillRect(-5, -8, 10, 4); c.fillStyle = '#c84a2a'; cercle(c, 0, 2, 2.4); c.fill(); } },
  // nourriture
  conserve_haricots: { R: 11, n: 3, e: eparpille(6, 5), d: (c) => conserve(c, '#c8642a') },
  conserve_raviolis: { R: 11, n: 3, e: eparpille(6, 5), d: (c) => conserve(c, '#b82a2a') },
  conserve_thon: { R: 10, n: 3, e: eparpille(6, 5), d: (c) => { plein(c, '#a8aeb0', () => ellipse(c, 0, 0, 7, 5.5)); c.fillStyle = '#2a6aa8'; ellipse(c, 0, 0, 5.6, 4.2); c.fill(); c.fillStyle = '#c8ccd0'; rr(c, -2.5, -3.6, 5, 2, 0.8); c.fill(); } },
  soupe_conserve: { R: 11, n: 3, e: eparpille(6, 5), d: (c) => conserve(c, '#2a7a5a') },
  ration_militaire: { R: 12, n: 1, d: (c) => paquet(c, 14, 18, '#5a5a3a', '#3a3a24') },
  croquettes: { R: 13, n: 1, d: (c) => paquet(c, 16, 20, '#c8642a', '#e8d8a0', { dents: true }) },
  biscuits: { R: 11, n: 2, e: eparpille(4, 5), d: (c) => { paquet(c, 16, 7, '#2a4a8a', null); c.fillStyle = '#c89a5a'; for (let x = -6; x <= 6; x += 3) { cercle(c, x, 0, 1.2); c.fill(); } } },
  chips: { R: 12, n: 1, d: (c) => paquet(c, 14, 17, '#e8c020', '#c42a2a', { dents: true, r: 2.5 }) },
  barre_cereales: { R: 9, n: 2, e: eparpille(3, 4), d: (c) => paquet(c, 13, 4.5, '#8a5a2a', '#e8c070') },
  chocolat: { R: 10, n: 1, d: (c) => { plein(c, '#4a2a1a', () => rr(c, -8, -4.5, 16, 9, 0.8)); c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.5; for (let x = -4; x <= 4; x += 4) { c.beginPath(); c.moveTo(x, -4.5); c.lineTo(x, 4.5); c.stroke(); } c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke(); c.fillStyle = '#c8a840'; c.fillRect(2, -4.5, 6, 9); } },
  pain: { R: 20, n: 1, d: (c) => { plein(c, '#c8963e', () => ellipse(c, 0, 0, 17, 4)); c.strokeStyle = 'rgba(240,210,150,0.85)'; c.lineWidth = 1.1; for (let x = -10; x <= 10; x += 5) { c.beginPath(); c.moveTo(x - 2, 1.5); c.lineTo(x + 2, -1.5); c.stroke(); } } },
  pates_seches: { R: 11, n: 1, d: (c) => { paquet(c, 10, 18, '#2a5aa8', null); c.fillStyle = '#e8d08a'; rr(c, -3, -4, 6, 8, 1); c.fill(); } },
  pates_cuites: { R: 10, n: 1, d: (c) => { plein(c, '#d8d4c8', () => cercle(c, 0, 0, 7)); c.fillStyle = '#e8cc7a'; cercle(c, 0, 0, 5); c.fill(); } },
  compote: { R: 9, n: 2, e: eparpille(4, 4), d: (c) => { plein(c, '#e8e4d8', () => cercle(c, 0, 0, 4.5)); c.fillStyle = '#c8b050'; cercle(c, 0, 0, 3.4); c.fill(); } },
  miel: { R: 9, n: 1, d: (c) => bocal(c, '#d8a020', '#e0c060') },
  confiture: { R: 9, n: 1, d: (c) => bocal(c, '#8a1a2a', '#c42a2a', true) },
  olives: { R: 9, n: 1, d: (c) => bocal(c, '#5a6a2a', '#d8b040') },
  tapenade: { R: 9, n: 1, d: (c) => bocal(c, '#2a2a1a', '#3a6a3a') },
  cafe_soluble: { R: 9, n: 1, d: (c) => bocal(c, '#3a2214', '#2a2a2a') },
  legumes: { R: 14, n: 1, d: (c) => { plein(c, '#3a6a2a', () => ellipse(c, -3, -2, 9, 2.8, -0.3)); c.fillStyle = 'rgba(200,230,150,0.35)'; ellipse(c, -4, -3, 5, 0.8, -0.3); c.fill(); for (const [x, y] of [[4, 4], [-2, 5]]) { plein(c, '#c43a2a', () => cercle(c, x, y, 3.2)); c.fillStyle = '#3a6a2a'; cercle(c, x, y - 2, 1); c.fill(); } } },
  raisin: { R: 10, n: 2, e: eparpille(4, 4), d: (c, r) => { trait(c, [[-1, -8], [0, -5]], 0.8, '#5a4a2a'); for (let k = 0; k < 13; k++) { const row = Math.floor(Math.sqrt(k * 2)); const x = (k % 4 - 1.5) * 2.4 * (1 - row * 0.12) + (r() - 0.5), y = -4 + row * 2.6; c.fillStyle = k % 3 ? '#3a2046' : '#54306a'; cercle(c, x, y, 1.5); c.fill(); } c.fillStyle = '#4a6a2a'; ellipse(c, 2.5, -6, 3, 1.6, 0.4); c.fill(); } },
  figues: { R: 10, n: 2, e: eparpille(4, 4), d: (c) => { plein(c, '#5a2a4a', () => { c.beginPath(); c.ellipse(0, 1, 4.2, 3.6, 0, 0, TAU); c.moveTo(0, -5); c.lineTo(2, -1); c.lineTo(-2, -1); c.closePath(); }); reflet(c, -1.5, 0, 1.5, 1, 0.3); } },
  mures: { R: 9, n: 1, d: (c, r) => { for (let k = 0; k < 8; k++) { const x = (r() - 0.5) * 9, y = (r() - 0.5) * 7; c.fillStyle = '#1a1020'; cercle(c, x, y, 1.8); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; cercle(c, x - 0.5, y - 0.5, 0.5); c.fill(); } } },
  fruits_sauvages: { R: 9, n: 1, d: (c, r) => { for (let k = 0; k < 8; k++) { const x = (r() - 0.5) * 9, y = (r() - 0.5) * 7; c.fillStyle = '#b82a2a'; cercle(c, x, y, 1.6); c.fill(); } } },
  amandes: { R: 9, n: 1, d: (c, r) => { for (let k = 0; k < 6; k++) { c.fillStyle = '#a8784a'; ellipse(c, (r() - 0.5) * 9, (r() - 0.5) * 7, 2.4, 1.4, r() * 3); c.fill(); } } },
  pignons: { R: 8, n: 1, d: (c, r) => { for (let k = 0; k < 9; k++) { c.fillStyle = '#e8d8b0'; ellipse(c, (r() - 0.5) * 8, (r() - 0.5) * 6, 1.4, 0.8, r() * 3); c.fill(); } } },
  champignons: { R: 9, n: 1, d: (c, r) => { for (let k = 0; k < 3; k++) { const x = (r() - 0.5) * 8, y = (r() - 0.5) * 6; plein(c, '#c8a878', () => cercle(c, x, y, 3), 'rgba(60,40,20,0.7)', 0.6); c.fillStyle = 'rgba(255,240,210,0.4)'; cercle(c, x - 0.8, y - 0.8, 1.2); c.fill(); } } },
  escargots: { R: 9, n: 1, d: (c, r) => { for (let k = 0; k < 3; k++) { const x = (r() - 0.5) * 8, y = (r() - 0.5) * 6; plein(c, '#a8845a', () => cercle(c, x, y, 2.6), 'rgba(40,30,20,0.8)', 0.6); c.strokeStyle = 'rgba(60,40,20,0.7)'; c.lineWidth = 0.5; c.beginPath(); c.arc(x, y, 1.3, 0, 5); c.stroke(); } } },
  viande_crue: { R: 11, n: 1, d: (c) => { plein(c, '#a82a2a', () => ellipse(c, 0, 0, 8, 5.5, 0.3)); c.fillStyle = '#e8d0c0'; ellipse(c, 3, -1, 2.4, 1.4, 0.3); c.fill(); } },
  viande_cuite: { R: 11, n: 1, d: (c) => { plein(c, '#6a3a1e', () => ellipse(c, 0, 0, 8, 5.5, 0.3)); c.strokeStyle = 'rgba(30,14,6,0.6)'; c.lineWidth = 0.8; for (let x = -4; x <= 4; x += 4) { c.beginPath(); c.moveTo(x - 2, -3); c.lineTo(x + 2, 3); c.stroke(); } } },
  viande_fumee: { R: 11, n: 1, d: (c) => { plein(c, '#4a2414', () => rr(c, -8, -3, 16, 6, 2)); } },
  poisson_cru: { R: 13, n: 1, d: (c) => poisson(c, '#9aa8b0') },
  poisson_cuit: { R: 13, n: 1, d: (c) => poisson(c, '#a87a4a') },
  poisson_fume: { R: 13, n: 1, d: (c) => poisson(c, '#7a5a3a') },
  // soins
  bandage: { R: 9, n: 2, e: eparpille(4, 4), d: (c) => { plein(c, '#f0ece4', () => rr(c, -5, -4, 10, 8, 3), 'rgba(40,40,40,0.6)', 0.7); c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 0.5; for (let x = -3; x <= 3; x += 1.5) { c.beginPath(); c.moveTo(x, -4); c.lineTo(x, 4); c.stroke(); } c.fillStyle = '#f0ece4'; c.fillRect(4.5, -2, 4, 4); } },
  bandage_fortune: { R: 9, n: 2, e: eparpille(4, 4), d: (c) => { plein(c, '#c8bca4', () => rr(c, -5, -4, 10, 8, 3), 'rgba(40,40,40,0.6)', 0.7); } },
  pansement_miel: { R: 8, n: 1, d: (c) => { plein(c, '#e8e0c8', () => rr(c, -5, -3, 10, 6, 1)); c.fillStyle = '#d8a020'; c.fillRect(-2, -1.8, 4, 3.6); } },
  desinfectant: { R: 10, n: 1, d: (c) => { bouteille(c, { verre: 'rgba(230,230,225,0.95)', L: 15, D: 7, bouchon: '#c42a2a' }); c.fillStyle = '#c42a2a'; c.fillRect(-3, -0.6, 4, 1.2); c.fillRect(-1.6, -2, 1.2, 4); } },
  antibiotiques: { R: 9, n: 1, d: (c) => boiteSoin(c, 12, 8, '#2a8a4a') },
  antibio_veto: { R: 9, n: 1, d: (c) => boiteSoin(c, 12, 8, '#2a6aa8') },
  antidouleur: { R: 9, n: 1, d: (c) => { plein(c, '#d8dcde', () => rr(c, -6, -4, 12, 8, 1), 'rgba(60,60,60,0.7)', 0.6); c.fillStyle = '#f4f4f0'; for (let x = -4; x <= 4; x += 2.6) for (const y of [-1.6, 1.6]) { cercle(c, x, y, 0.9); c.fill(); } } },
  vitamines: { R: 9, n: 1, d: (c) => { plein(c, '#e8a020', () => cercle(c, 0, 0, 4.5)); c.fillStyle = '#f4f4f0'; cercle(c, 0, 0, 3.4); c.fill(); } },
  kit_suture: { R: 10, n: 1, d: (c) => boiteSoin(c, 14, 9, '#c42a2a', '#3a6aa8') },
  savon: { R: 8, n: 1, d: (c) => { plein(c, '#e8d8b8', () => rr(c, -5.5, -3.5, 11, 7, 2.5)); reflet(c, -2, -1.5, 2.5, 1, 0.4); } },
  lingette: { R: 9, n: 1, d: (c) => paquet(c, 13, 9, '#e8f0f4', '#2a8ac8') },
  attelle: { R: 14, n: 1, d: (c) => { for (const y of [-2.5, 2.5]) plein(c, '#c8a878', () => rr(c, -11, y - 1.5, 22, 3, 1)); c.fillStyle = '#e8e4d8'; c.fillRect(-4, -4.5, 2, 9); c.fillRect(3, -4.5, 2, 9); } },
  tisane_emperi: { R: 9, n: 1, d: (c) => paquet(c, 10, 12, '#8a9a5a', '#e8e0c0') },
  onguent: { R: 8, n: 1, d: (c) => { plein(c, '#c8ccd0', () => cercle(c, 0, 0, 4.5)); c.fillStyle = '#2a8a4a'; cercle(c, 0, 0, 3.2); c.fill(); } },
  charbon_actif: { R: 9, n: 1, d: (c) => paquet(c, 12, 8, '#1e1e20', '#5a5a5a') },
  // outils
  briquet: { R: 7, n: 1, d: (c) => { plein(c, '#c42a2a', () => rr(c, -4.5, -2, 9, 4, 1.2)); c.fillStyle = '#c8ccd0'; c.fillRect(2.5, -2, 2.4, 4); } },
  allumettes: { R: 8, n: 1, d: (c) => { plein(c, '#e8dcb0', () => rr(c, -5.5, -3.5, 11, 7, 0.6)); c.fillStyle = '#2a4a8a'; c.fillRect(-4.5, -2.5, 9, 5); c.fillStyle = '#6a2a1a'; c.fillRect(-5.5, -3.5, 11, 1.2); } },
  piles: { R: 8, n: 1, d: (c) => { for (const y of [-2, 2]) { plein(c, '#2a2a2c', () => rr(c, -6, y - 1.6, 12, 3.2, 1.2), NOIR, 0.6); c.fillStyle = '#c8a040'; c.fillRect(-6, y - 1.6, 4, 3.2); } } },
  casserole: { R: 16, n: 1, d: (c) => { plein(c, '#8a8e90', () => cercle(c, -3, 0, 8)); c.fillStyle = '#4a4e50'; cercle(c, -3, 0, 6.6); c.fill(); trait(c, [[5, 0], [14, 0]], 2.4, '#2a2a2c'); reflet(c, -6, -3, 2.5, 1.2, 0.3); } },
  rechaud_camping: { R: 11, n: 1, d: (c) => { plein(c, '#5a5e62', () => cercle(c, 0, 0, 7)); c.strokeStyle = '#2a2a2c'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 2, Math.sin(a) * 2); c.lineTo(Math.cos(a) * 8.5, Math.sin(a) * 8.5); c.stroke(); } c.fillStyle = '#2a2a2c'; cercle(c, 0, 0, 2.4); c.fill(); } },
  cartouche_gaz: { R: 8, n: 1, d: (c) => { plein(c, '#2a6aa8', () => cercle(c, 0, 0, 5.5)); c.fillStyle = '#c8ccd0'; cercle(c, 0, 0, 2.6); c.fill(); } },
  pince_coupante: { R: 12, n: 1, d: (c) => { trait(c, [[-9, -3], [2, 0]], 2.2, '#c42a2a'); trait(c, [[-9, 3], [2, 0]], 2.2, '#c42a2a'); plein(c, '#6a6e70', () => { c.beginPath(); c.moveTo(1, -1.8); c.lineTo(9, -0.6); c.lineTo(9, 0.6); c.lineTo(1, 1.8); c.closePath(); }); } },
  trousse_outils: { R: 13, n: 1, d: (c) => { plein(c, '#b82a1e', () => rr(c, -10, -6, 20, 12, 1.5)); c.fillStyle = '#2a2a2c'; rr(c, -4, -1.5, 8, 3, 1.4); c.fill(); c.fillStyle = '#c8ccd0'; c.fillRect(-10, -0.4, 20, 0.8); } },
  pierre_aiguiser: { R: 10, n: 1, d: (c) => { plein(c, '#6a6e72', () => rr(c, -8, -2.5, 16, 5, 1)); c.fillStyle = '#9a8a6a'; c.fillRect(-8, 0, 16, 2.5); } },
  trousse_couture: { R: 9, n: 1, d: (c) => { plein(c, '#7a3a5a', () => rr(c, -6, -4, 12, 8, 2)); c.fillStyle = '#e8e0c8'; cercle(c, -2, 0, 1.6); c.fill(); trait(c, [[1, -2], [5, 2]], 0.5, '#c8ccd0'); } },
  crochets_serrure: { R: 9, n: 1, d: (c) => { for (const y of [-1.5, 1.5]) trait(c, [[-6, y], [5, y], [6.5, y - 1.5]], 0.7, '#a8acae'); c.fillStyle = '#2a2a2a'; c.fillRect(-7, -3, 3, 6); } },
  tuyau_plastique: { R: 13, n: 1, d: (c) => { for (const [lw, s] of [[3.2, NOIR], [2.2, '#2a8a5a']]) { c.strokeStyle = s; c.lineWidth = lw; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(k - 1, 0, 8, 6, 0.3, 0, TAU); c.stroke(); } } } },
  canne_peche: { R: 32, n: 1, d: (c) => { trait(c, [[-28, 0], [28, 0]], 1.2, '#3a3a3a'); c.fillStyle = '#8a8e90'; cercle(c, -20, 1.8, 2); c.fill(); trait(c, [[-28, 0], [-18, 0]], 2.4, '#6a4a2a'); } },
  nasse: { R: 14, n: 1, d: (c) => { plein(c, '#a8844a', () => ellipse(c, 0, 0, 11, 6)); c.strokeStyle = 'rgba(60,40,10,0.6)'; c.lineWidth = 0.6; for (let x = -8; x <= 8; x += 3) { c.beginPath(); c.moveTo(x, -5.5); c.lineTo(x, 5.5); c.stroke(); } c.fillStyle = 'rgba(30,20,8,0.7)'; ellipse(c, 9, 0, 2, 3.5); c.fill(); } },
  collet: { R: 10, n: 1, d: (c) => { c.strokeStyle = '#9aa0a2'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(1, 0, 5.5, 4, 0, 0, TAU); c.moveTo(-4.5, 0); c.lineTo(-9, 1); c.stroke(); } },
  piege_sonore: { R: 11, n: 1, d: (c) => { trait(c, [[-9, 0], [9, 0]], 0.6, '#9aa0a2'); for (const x of [-4, 4]) { c.save(); c.translate(x, 3); c.scale(0.7, 0.7); canette(c, '#a8a8a8', true); c.restore(); } } },
  filtre_fortune: { R: 12, n: 1, d: (c) => { bouteille(c, { L: 20, D: 8, bouchon: '#5a5a5a' }); c.fillStyle = '#3a3a3a'; c.fillRect(-6, -3, 4, 6); c.fillStyle = '#c8b890'; c.fillRect(-2, -3, 4, 6); } },
  filtre_gaz: { R: 8, n: 1, d: (c) => { plein(c, '#3a3a3a', () => cercle(c, 0, 0, 5.5)); c.strokeStyle = 'rgba(200,200,200,0.4)'; c.lineWidth = 0.5; for (let rr2 = 1.5; rr2 < 5; rr2 += 1.3) { cercle(c, 0, 0, rr2); c.stroke(); } } },
  jumelles: { R: 11, n: 1, d: (c) => { for (const y of [-3.4, 3.4]) { plein(c, '#2a2a2c', () => rr(c, -7, y - 2.8, 14, 5.6, 2)); c.fillStyle = 'rgba(120,170,200,0.7)'; cercle(c, 6.4, y, 1.8); c.fill(); } c.fillStyle = '#3a3a3c'; c.fillRect(-3, -1, 6, 2); } },
  radio_portable: { R: 11, n: 1, d: (c) => radio(c, '#2a2a2c') },
  radio_manivelle: { R: 11, n: 1, d: (c) => { radio(c, '#c86a1a'); trait(c, [[7, 3], [10, 6]], 1.2, '#2a2a2c'); } },
  radio_poche: { R: 9, n: 1, d: (c) => { c.save(); c.scale(0.75, 0.75); radio(c, '#5a3a2a'); c.restore(); } },
  kit_nettoyage: { R: 10, n: 1, d: (c) => { plein(c, '#3a4a2a', () => rr(c, -8, -4, 16, 8, 2)); trait(c, [[-6, 0], [6, 0]], 1, '#c8ccd0'); } },
  scie: { R: 20, n: 1, d: (c) => { plein(c, '#b8bcc0', () => { c.beginPath(); c.moveTo(-6, -4); c.lineTo(16, -2); c.lineTo(16, 2); c.lineTo(-6, 4); c.closePath(); }); c.strokeStyle = 'rgba(40,40,40,0.7)'; c.lineWidth = 0.5; for (let x = -5; x < 16; x += 1.5) { c.beginPath(); c.moveTo(x, 3.6 - (x + 6) * 0.08); c.lineTo(x + 0.7, 4.6 - (x + 6) * 0.08); c.stroke(); } plein(c, '#8a3a1e', () => rr(c, -15, -4.5, 10, 9, 3)); c.fillStyle = 'rgba(0,0,0,0.6)'; rr(c, -13, -2, 5, 4, 1.5); c.fill(); } },
  calendrier: { R: 12, n: 1, d: (c) => { livre(c, '#e8e4d8', 14, 16); c.fillStyle = '#c42a2a'; c.fillRect(-5, -6, 10, 3); } },
  agenda: { R: 10, n: 1, d: (c) => livre(c, '#2a2a3a', 10, 14) },
  ouvre_boite: { R: 9, n: 1, d: (c) => { trait(c, [[-7, 0], [4, 0]], 2, '#2a2a2c'); plein(c, '#a8acae', () => rr(c, 3, -2.5, 5, 5, 1)); } },
  lampe_huile: { R: 10, n: 1, d: (c) => { plein(c, '#8a6a3a', () => cercle(c, 0, 0, 6)); c.fillStyle = 'rgba(230,220,180,0.6)'; cercle(c, 0, 0, 4.2); c.fill(); c.fillStyle = '#2a2a2a'; cercle(c, 0, 0, 1.4); c.fill(); trait(c, [[-6, -3], [0, -8], [6, -3]], 0.7, '#5a5e60'); } },
  torche: { R: 18, n: 1, d: (c) => { trait(c, [[-14, 0], [8, 0]], 2.6, '#7a5a3a'); plein(c, '#c8b890', () => ellipse(c, 10, 0, 5, 3.4)); c.fillStyle = 'rgba(30,20,10,0.6)'; ellipse(c, 12, 0, 2.6, 2); c.fill(); } },
  lampe_frontale: { R: 10, n: 1, d: (c) => frontale(c, '#2a2a2c') },
  lampe_frontale_fortune: { R: 10, n: 1, d: (c) => frontale(c, '#5a4a3a') },
  // documents, objets de l'histoire
  portefeuille: { R: 9, n: 1, d: (c) => { plein(c, '#5a3a22', () => rr(c, -6.5, -4.5, 13, 9, 1.2)); c.strokeStyle = 'rgba(200,170,120,0.45)'; c.lineWidth = 0.5; c.beginPath(); c.rect(-5.5, -3.5, 11, 7); c.stroke(); } },
  carte_routiere: { R: 13, n: 1, d: (c) => { plein(c, '#e8e0c4', () => c.rect(-10, -7, 20, 14), 'rgba(40,40,40,0.6)', 0.6); c.strokeStyle = '#c42a2a'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-9, 4); c.bezierCurveTo(-3, 0, 3, 3, 9, -5); c.stroke(); c.strokeStyle = '#e8b020'; c.beginPath(); c.moveTo(-6, -6); c.lineTo(2, 6); c.stroke(); c.fillStyle = 'rgba(110,160,90,0.35)'; c.fillRect(2, -6, 7, 5); c.strokeStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.moveTo(-3.3, -7); c.lineTo(-3.3, 7); c.moveTo(3.3, -7); c.lineTo(3.3, 7); c.stroke(); } },
  photo_famille: { R: 9, n: 1, d: (c) => { plein(c, '#f0ece0', () => c.rect(-6, -5, 12, 10), 'rgba(40,40,40,0.6)', 0.5); c.fillStyle = '#6a7a8a'; c.fillRect(-5, -4, 10, 6.5); c.fillStyle = '#c8a07a'; for (const x of [-2.5, 0.5, 3]) { cercle(c, x, -1.4, 1.1); c.fill(); } } },
  // munitions et objets à lancer
  petards: { R: 9, n: 1, d: (c) => { for (let k = 0; k < 4; k++) { plein(c, '#c42a2a', () => rr(c, -5, -4 + k * 2.2, 10, 1.8, 0.6), NOIR, 0.4); } } },
  fusee_detresse: { R: 11, n: 1, d: (c) => { plein(c, '#d83a1e', () => rr(c, -8, -2.2, 16, 4.4, 1.6)); c.fillStyle = '#2a2a2a'; c.fillRect(5, -2.2, 3, 4.4); } },
  leurre_sonore: { R: 9, n: 1, d: (c) => { plein(c, '#3a3a3c', () => rr(c, -5, -4, 10, 8, 1.5)); c.fillStyle = '#c8a020'; cercle(c, 0, 0, 2.2); c.fill(); } },
};
function jerrican(c, coul) {
  plein(c, coul, () => rr(c, -12, -8, 24, 16, 2));
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -8); c.lineTo(12, 8); c.moveTo(-12, 8); c.lineTo(12, -8); c.stroke();
  c.fillStyle = teinte(coul, 0.7); rr(c, -10, -7, 7, 4, 1); c.fill(); c.fillStyle = '#2a2a2a'; cercle(c, 9, -5, 2.2); c.fill();
  reflet(c, -6, -5, 4, 1.4, 0.2);
}
function poisson(c, coul) {
  plein(c, coul, () => { c.beginPath(); c.ellipse(-1, 0, 8, 3.6, 0, 0, TAU); c.moveTo(6, 0); c.lineTo(11, -3.6); c.lineTo(11, 3.6); c.closePath(); });
  c.fillStyle = '#1a1a1a'; cercle(c, -6, -0.8, 0.8); c.fill(); reflet(c, -2, -1.6, 4, 0.8, 0.3);
}
function radio(c, coul) {
  plein(c, coul, () => rr(c, -9, -6, 18, 12, 2));
  c.fillStyle = 'rgba(0,0,0,0.5)'; for (let y = -3.6; y <= 3.6; y += 1.8) c.fillRect(-7, y - 0.4, 7, 0.8);
  c.fillStyle = '#c8ccd0'; cercle(c, 4.5, 0, 2.6); c.fill(); trait(c, [[8, -5], [12, -10]], 0.7, '#c8ccd0');
}
function frontale(c, coul) { c.strokeStyle = coul; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 7, 5, 0, 0, TAU); c.stroke(); plein(c, '#3a3a3c', () => rr(c, 5, -2.5, 4, 5, 1)); c.fillStyle = '#f0e8c0'; c.fillRect(8, -1.5, 1, 3); }

// ---------- Familles (ce qui n'a pas de dessin à lui) ----------
function familleVetement(id, d) {
  const s = d.slot, coul = couleurVet(id);
  if (s === 'sac') {
    const S = SACS[id] || { l: 15, p: 8, coul: '#4a4a3a' };
    return { R: 16, n: 1, d: (c) => { plein(c, S.coul, () => rr(c, -S.l * 0.55, -8, S.l * 1.1, 16, 4)); c.fillStyle = teinte(S.coul, 0.75); rr(c, -S.l * 0.5, -8, S.l, 6, 3); c.fill(); trait(c, [[-S.l * 0.3, 8], [-S.l * 0.3, 11], [S.l * 0.3, 11], [S.l * 0.3, 8]], 1, teinte(S.coul, 0.6)); if (S.bande) { c.fillStyle = S.bande; c.fillRect(-S.l * 0.55, 1, S.l * 1.1, 2); } reflet(c, -3, -5, 4, 1.4, 0.2); } };
  }
  if (s === 'jambes') return { R: 16, n: 1, d: (c) => { plein(c, coul, () => { c.beginPath(); c.moveTo(-7, -11); c.lineTo(7, -11); c.lineTo(8, 11); c.lineTo(1.5, 11); c.lineTo(0, -2); c.lineTo(-1.5, 11); c.lineTo(-8, 11); c.closePath(); }, 'rgba(10,10,10,0.75)', 0.9); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-7, -11, 14, 2); c.strokeStyle = 'rgba(220,180,90,0.45)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-5, -8); c.lineTo(-6, 9); c.moveTo(5, -8); c.lineTo(6, 9); c.stroke(); } };
  if (s === 'pieds') { const cc = /rangers|bottes_cuir/.test(id) ? '#2a2420' : /caoutchouc/.test(id) ? '#2a4a2a' : '#e0dcd4'; return { R: 12, n: 1, d: (c) => { for (const y of [-3.6, 3.6]) { plein(c, cc, () => ellipse(c, y * 0.3, y, 8, 3)); c.fillStyle = 'rgba(0,0,0,0.3)'; ellipse(c, -2 + y * 0.3, y, 3, 1.6); c.fill(); } } }; }
  if (s === 'tete') { const cc = /pompier/.test(id) ? '#c8a020' : /chantier/.test(id) ? '#e8c020' : /militaire/.test(id) ? '#4a5236' : /moto/.test(id) ? '#1e1e22' : /bonnet/.test(id) ? '#6a2a2a' : '#2a3a5a'; return { R: 11, n: 1, d: (c) => { plein(c, cc, () => cercle(c, 0, 0, 6.5)); if (/casquette/.test(id)) { plein(c, cc, () => ellipse(c, 6.5, 0, 4, 5)); } reflet(c, -2, -2, 2.6, 1.5, 0.3); } }; }
  if (s === 'mains') return { R: 10, n: 1, d: (c) => { for (const y of [-3, 3]) plein(c, /cuir/.test(id) ? '#5a3a22' : '#6a6a5a', () => { c.beginPath(); c.ellipse(0, y, 5, 2.6, 0, 0, TAU); c.rect(4, y - 2, 3, 4); }); } };
  if (s === 'ceinture' || s === 'holster') return { R: 12, n: 1, d: (c) => { c.strokeStyle = 'rgba(10,8,6,0.8)'; c.lineWidth = 3.4; c.beginPath(); c.ellipse(0, 0, 8, 5.5, 0, 0, TAU); c.stroke(); c.strokeStyle = '#5a3a22'; c.lineWidth = 2.4; c.stroke(); c.fillStyle = '#c8a040'; c.fillRect(6.5, -2, 3, 4); } };
  if (s === 'poignet') return { R: 8, n: 1, d: (c) => { trait(c, [[-6, 0], [6, 0]], 2.6, '#2a2a2c'); plein(c, id === 'montre_digitale' ? '#1e1e20' : '#c8ccd0', () => cercle(c, 0, 0, 3)); c.fillStyle = id === 'montre_digitale' ? '#7a9a6a' : '#f0ece0'; cercle(c, 0, 0, 2.1); c.fill(); } };
  if (s === 'visage') return { R: 9, n: 1, d: (c) => { plein(c, /gaz/.test(id) ? '#2a2a2c' : '#e8ecee', () => ellipse(c, 0, 0, 6, 4.5)); trait(c, [[-6, 0], [-9, -2]], 0.6, '#c8ccd0'); trait(c, [[6, 0], [9, -2]], 0.6, '#c8ccd0'); } };
  // le haut : un vêtement plié (veste plus grande)
  const grand = s === 'veste';
  return { R: grand ? 15 : 13, n: 1, d: (c) => plie(c, coul, grand ? 22 : 18, grand ? 16 : 14, true) };
}
function familleItem(id, d) {
  const t = d.type, u = d.usage || [];
  if (t === 'arme' || id === 'couteau_lancer') {
    const f = formeArme(id) || 'objet', L = { couteau: 11, machette: 22, batte: 28, hache: 26, pelle: 25, masse: 28, marteau: 15, lance: 40, barre: 26, pistolet: 10, fusil: 30, lampe: 9, objet: 10 }[f] || 10;
    return { R: Math.max(10, L * 0.7 + 6), n: 1, d: (c) => { c.save(); c.translate(-L * 0.42, 0); c.scale(1.15, 1.15); dessinerArme(c, f, L); c.restore(); } };
  }
  if (t === 'munition') return { R: 9, n: 1, d: (c) => { plein(c, '#c8b080', () => rr(c, -6.5, -4.5, 13, 9, 0.8)); c.fillStyle = '#b8902a'; for (let x = -4.5; x <= 4.5; x += 3) for (const y of [-1.5, 1.5]) { cercle(c, x, y, 1); c.fill(); } } };
  if (u.includes('lumiere') && /lampe/.test(id)) return { R: 10, n: 1, d: (c) => { c.save(); c.translate(-4.5, 0); c.scale(1.2, 1.2); dessinerArme(c, 'lampe', 9); c.restore(); } };
  if (t === 'nourriture') return { R: 10, n: 1, d: (c) => paquet(c, 12, 10, ['#c8642a', '#2a6a8a', '#8a2a2a'][graine(id) % 3], '#e8e0c0') };
  if (t === 'boisson') return { R: 15, n: 1, d: (c) => bouteille(c, { plein: true, etiquette: '#c84a2a' }) };
  if (t === 'soin') return { R: 9, n: 1, d: (c) => boiteSoin(c, 12, 9) };
  if (t === 'livre') return { R: 12, n: 1, d: (c) => livre(c, ['#7a2a2a', '#2a4a6a', '#3a5a2a', '#6a5a2a'][graine(id) % 4]) };
  if (t === 'lore' || t === 'quete') return { R: 9, n: 1, d: (c) => { plein(c, '#d8d0b8', () => c.rect(-6, -7.5, 12, 15), 'rgba(40,36,30,0.6)', 0.6); c.fillStyle = 'rgba(0,0,0,0.3)'; for (let k = 0; k < 4; k++) c.fillRect(-4.5, -5 + k * 2.6, 9 - k, 0.8); } };
  if (t === 'recipient') return { R: 15, n: 1, d: (c) => bouteille(c, {}) };
  if (t === 'outil') return { R: 10, n: 1, d: (c) => { plein(c, '#5a5e62', () => rr(c, -7, -4, 14, 8, 1.5)); c.fillStyle = '#c8a040'; c.fillRect(-2, -4, 4, 8); } };
  if (t === 'materiau') return { R: 10, n: 1, d: (c) => { plein(c, '#7a6a52', () => rr(c, -7, -5, 14, 10, 1.5)); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.stroke(); } };
  return { R: 9, n: 1, d: (c) => { plein(c, '#7a6a52', () => rr(c, -6, -5, 12, 10, 2)); } };
}
const DOC = { R: 10, n: 1, d: (c) => { plein(c, '#d8d0b8', () => c.rect(-6, -7.5, 12, 15), 'rgba(40,36,30,0.6)', 0.6); c.fillStyle = 'rgba(0,0,0,0.32)'; for (let k = 0; k < 5; k++) c.fillRect(-4.5, -5.5 + k * 2.4, 9 - (k % 2) * 3, 0.8); } };
const formes = new Map();
export function formeObjetSol(id) {
  let f = formes.get(id); if (f) return f;
  f = SPECIAUX[id] || (CLOTHES[id] ? familleVetement(id, CLOTHES[id]) : ITEMS[id] ? familleItem(id, ITEMS[id]) : familleItem(id, {}));
  formes.set(id, f);
  return f;
}
export const aSonDessin = (id) => !!SPECIAUX[id];

// ---------- Cache des sprites ----------
const cache = new Map();
let pxTotal = 0, tmp = null;
const PX_MAX = 4e6, TMP = 360;
function spriteObjet(cle, f, seed, n) {
  let s = cache.get(cle);
  if (s) { cache.delete(cle); cache.set(cle, s); return s; }
  if (!peutPeindre(Math.max(0.3, f.R * f.R / 250))) return null;
  const marge = 5, D = Math.min(TMP, Math.ceil((f.R + marge) * 2 * RES));
  if (!tmp) tmp = canvas(TMP, TMP);
  const t = tmp.getContext('2d');
  t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, D, D);
  t.setTransform(RES, 0, 0, RES, D / 2, D / 2); t.lineCap = 'round'; t.lineJoin = 'round';
  const r = rng(seed);
  const ang = (seed % 64) / 64 * TAU;
  for (let k = 0; k < n; k++) {
    const [dx, dy, da] = k && f.e ? f.e(k, r) : [0, 0, 0];
    t.save(); t.rotate(ang); t.translate(dx, dy); t.rotate(da); f.d(t, r, k); t.restore();
  }
  const cv = canvas(D, D), c = cv.getContext('2d');
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 2.2 * RES; c.shadowOffsetX = 1.6 * RES; c.shadowOffsetY = 2.2 * RES;
  c.drawImage(tmp, 0, 0, D, D, 0, 0, D, D);
  s = { cv, h: D / RES / 2, px: D * D };
  cache.set(cle, s); pxTotal += s.px;
  while (pxTotal > PX_MAX && cache.size > 1) { const k = cache.keys().next().value; pxTotal -= cache.get(k).px; cache.delete(k); }
  return s;
}
// le halo « on peut le ramasser » : une lueur chaude et douce, peinte une fois
let halo = null;
function haloSol() {
  if (halo) return halo;
  const S = 64, cv = canvas(S, S), c = cv.getContext('2d');
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,214,120,0.9)'); g.addColorStop(0.45, 'rgba(255,200,100,0.35)'); g.addColorStop(1, 'rgba(255,190,90,0)');
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  return (halo = cv);
}

// ---------- Poser un objet par terre ----------
// L'objet en petit (l'anneau de fabrication : ce qu'on est en train de faire), centré en (x, y), dans un rayon R (pixels).
export function dessinerIconeObjet(c, id, x, y, R) {
  const f = formeObjetSol(id), s = spriteObjet(id + ':icone', f, 1, 1);
  if (!s) return;
  const k = R / Math.max(8, f.R * 0.85);
  c.drawImage(s.cv, x - s.h * k, y - s.h * k, s.h * 2 * k, s.h * 2 * k);
}
export function dessinerObjetSol(c, o, t) {
  const x = o.x * TS, y = o.y * TS;
  const f = o.doc ? DOC : formeObjetSol(o.id);
  const seed = graine((o.doc || o.id) + ':' + Math.round(o.x * 8) + ':' + Math.round(o.y * 8));
  const n = Math.max(1, Math.min(f.n || 1, o.qty || 1));
  // la lueur qui respire, sous l'objet
  const p = 0.5 + 0.5 * Math.sin(t / 650 + (seed % 100));
  const Rh = Math.max(12, f.R * 0.95);
  c.globalAlpha = 0.1 + 0.12 * p; c.drawImage(haloSol(), x - Rh, y - Rh * 0.8, Rh * 2, Rh * 1.6); c.globalAlpha = 1;
  const s = spriteObjet((o.doc ? 'doc:' + o.doc : o.id) + ':' + n + ':' + (seed % 64), f, seed, n);
  if (s) c.drawImage(s.cv, x - s.h, y - s.h, s.h * 2, s.h * 2);
  else { c.fillStyle = '#7a6a4a'; rr(c, x - 5, y - 4, 10, 8, 2); c.fill(); }
  // un éclat, de temps en temps, comme un reflet de lumière sur l'objet
  const ph = ((t + (seed % 4000)) % 4200) / 4200;
  if (ph < 0.08) {
    const k = Math.sin(ph / 0.08 * Math.PI), sx = x - f.R * 0.25, sy = y - f.R * 0.2, L = 3 + 4 * k;
    c.strokeStyle = 'rgba(255,246,220,' + (0.85 * k).toFixed(3) + ')'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(sx - L, sy); c.lineTo(sx + L, sy); c.moveTo(sx, sy - L); c.lineTo(sx, sy + L); c.stroke();
  }
}
