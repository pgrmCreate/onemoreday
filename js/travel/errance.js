// ============ Marcher sans carte — le réseau de tronçons et ses cellules (sans DOM) ============
// Sans carte en poche (plan de Salon pour la ville, carte routière pour le pays), la sortie d'un lieu n'ouvre pas la
// feuille : on part à pied (js/travel/errance_ui.js), et c'est le CÔTÉ de la carte par lequel on sort qui décide où l'on
// va. Chaque côté (nord, est, sud, ouest) mène au plus à un voisin situé dans cette direction (js/data/reseau.js, généré
// par tools/generer_reseau.mjs d'après les vraies sorties des cartes) ; un côté sans voisin n'a pas de route connue.
// Entre deux lieux, un TRONÇON de 1 à 3 cellules jouables (une rue, un bout de route), générées depuis leur seul
// identifiant : les deux joueurs voient la même, et son état (morts, butin pris, objets posés) se sauve comme celui de
// n'importe quel lieu.
//
// Une cellule s'aligne sur la marche : on entre d'un côté, la suite est TOUT DROIT en face, dans la même direction, et
// une rue latérale finit en cul-de-sac (de quoi fouiller, rien de plus). On revient toujours sur ses pas en marchant.
//
//   id d'une cellule : 'troncon:<a>~<b>:<k>' (k = 0..n-1, de a vers b) ou 'troncon:<a>~<b>:x' (le cul-de-sac)
import { G } from '../core/state.js';
import { seedRng } from '../core/rng.js';
import { LIEUX_GEO } from '../data/lieux.js';
import { ERRANCE, REPERES, IMPASSES, TRACES } from '../data/troncons.js';
import { LIENS } from '../data/reseau.js';
import { migrerRueV0, tournerPositionV0 } from './errance_migration.js';
import { suiteCoteV0 } from './errance_v0.js';

export const PREFIXE = 'troncon:';
export const estCellule = (id) => typeof id === 'string' && id.startsWith(PREFIXE);
export const OPP = { n: 's', s: 'n', e: 'o', o: 'e' };
export const NOM_COTE = { n: 'le nord', e: 'l’est', s: 'le sud', o: 'l’ouest' };

const metres = (a, b) => {
  const k = 111320;
  return Math.hypot((a.lon - b.lon) * k * Math.cos(a.lat * Math.PI / 180), (a.lat - b.lat) * k);
};
const borne = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const tirage = (s) => seedRng(s)();

// ---------------------------------------------------------------- le réseau (fini, écrit dans js/data/reseau.js)
let graphe = null;
export function reseau() {
  if (graphe) return graphe;
  const aretes = new Map(), parLieu = new Map();
  for (const [p, cp, q] of LIENS) {
    const A = LIEUX_GEO[p], B = LIEUX_GEO[q];
    if (!A || !B) continue;
    const [a, ca, b] = p < q ? [p, cp, q] : [q, OPP[cp], p];
    const echelle = A.echelle === 'salon' && B.echelle === 'salon' ? 'salon' : 'region';
    const m = metres(A, B), [lo, hi] = ERRANCE.CELLULES[echelle];
    const e = { id: `${a}~${b}`, a, b, m, echelle, n: borne(Math.round(m / ERRANCE.M_PAR_CELLULE[echelle]), lo, hi), cote: { [a]: ca, [b]: OPP[ca] } };
    aretes.set(e.id, e);
    for (const id of [a, b]) (parLieu.get(id) || parLieu.set(id, []).get(id)).push(e);
  }
  graphe = { aretes, parLieu };
  return graphe;
}
export const arete = (id) => reseau().aretes.get(id) || null;

// ---------------------------------------------------------------- orientation
// Une cellule se dessine d'abord « à plat » (on vient de l'ouest, la suite est à l'est, la rue latérale au nord ou au
// sud), puis on la tourne pour que l'est du dessin pointe dans la direction de la marche de a vers b.
const TOURNE = {
  e: { e: 'e', o: 'o', n: 'n', s: 's' },
  o: { e: 'o', o: 'e', n: 's', s: 'n' },
  n: { e: 'n', n: 'o', o: 's', s: 'e' },
  s: { e: 's', s: 'o', o: 'n', n: 'e' },
};
const inverse = (T) => Object.fromEntries(Object.entries(T).map(([k, v]) => [v, k]));
const laterale = (e) => (tirage(`${e.id}:lat`) < 0.5 ? 'n' : 's');          // côté (à plat) de la rue latérale
const sens = (e, impasse) => (impasse ? TOURNE[e.cote[e.a]][laterale(e)] : e.cote[e.a]);
// Le vrai côté d'un côté « à plat » (et l'inverse), pour une cellule de ce tronçon.
export const reel = (e, impasse, c) => TOURNE[sens(e, impasse)][c];
export const aPlat = (e, impasse, c) => inverse(TOURNE[sens(e, impasse)])[c];
export const coteLateral = (e) => reel(e, false, laterale(e));

// ---------------------------------------------------------------- cellules
export function decoder(id) {
  if (!estCellule(id)) return null;
  const [, ar, k] = id.split(':');
  const e = arete(ar); if (!e) return null;
  if (k === 'x') return { e, k: null, impasse: true };
  const n = Number(k);
  return Number.isInteger(n) && n >= 0 && n < e.n ? { e, k: n, impasse: false } : null;
}
export const idCellule = (e, k) => `${PREFIXE}${e.id}:${k}`;
export const idImpasse = (e) => `${PREFIXE}${e.id}:x`;
export const genreImpasse = (e) => { const L = IMPASSES[e.echelle] || IMPASSES.salon; return L[Math.floor(tirage(`${e.id}:impasse`) * L.length) % L.length]; };
const point = (e, t) => { const a = LIEUX_GEO[e.a], b = LIEUX_GEO[e.b]; return { lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t }; };
export const pointCellule = (e, k) => point(e, k == null ? 0.5 : (k + 1) / (e.n + 1));
// Mètres que représente le passage d'une cellule à la suivante (n cellules = n + 1 intervalles).
export const pas = (e) => e.m / (e.n + 1);
// La trace écrite sur un mur de cette cellule (document), s'il y en a une.
function traceIci(e, k) {
  for (const t of TRACES) {
    const premier = (reseau().parLieu.get(t.pres) || []).slice().sort((p, q) => p.m - q.m)[0];
    if (premier !== e) continue;
    if ((t.pres === e.a && k === 0) || (t.pres === e.b && k === e.n - 1)) return t.doc;
  }
  return null;
}

// Le « lieu » d'une cellule, comme ceux de js/game/donnees.js (sans place sur la carte : pas de marqueur).
export function lieuCellule(id) {
  const c = decoder(id); if (!c) return null;
  const { e, k, impasse } = c;
  const nom = impasse ? genreImpasse(e).nom : e.echelle === 'salon' ? 'Une rue de Salon' : 'Sur la route';
  const p = pointCellule(e, impasse ? null : k);
  return {
    id, nom, court: nom, echelle: e.echelle, type: 'rue', niveau: id, typeButin: 'defaut', exterieur: true,
    danger: ERRANCE.DANGER[e.echelle], pool: ERRANCE.POOL, morts: { n: ERRANCE.MORTS[e.echelle] }, repeuplement: 0.25,
    latErrance: p.lat, lonErrance: p.lon, errance: { arete: e.id, k, impasse },
  };
}

// ---------------------------------------------------------------- le plan d'une cellule (format ASCII, déterministe)
const W = 44, H = 24, MID = 12, R0 = MID - 2, R1 = MID + 1, C0 = 19, C1 = 22;
const CHIFFRE = { o: '1', e: '2', n: '3', s: '4' };
const COTE_CHIFFRE = { 1: 'o', 2: 'e', 3: 'n', 4: 's' };
// Tourner une grille dessinée à plat pour que son est pointe vers `d`.
function tourner(g, d) {
  const h = g.length, w = g[0].length;
  if (d === 'e') return g;
  if (d === 'o') return g.map((l, y) => l.map((_, x) => g[h - 1 - y][w - 1 - x]));
  if (d === 'n') return Array.from({ length: w }, (_, y) => Array.from({ length: h }, (_, x) => g[x][w - 1 - y]));
  return Array.from({ length: w }, (_, y) => Array.from({ length: h }, (_, x) => g[h - 1 - x][y]));   // 's'
}
export function planCellule(id) {
  const c = decoder(id); if (!c) return null;
  const { e, k, impasse } = c;
  const ville = e.echelle === 'salon';
  const r = seedRng(`${id}:plan`);
  const g = Array.from({ length: H }, () => Array(W).fill(ville ? ',' : '"'));
  const bord = ville ? '#' : 'T';
  // à plat : on vient de l'ouest ; la suite à l'est (tout droit) ; la rue latérale (cul-de-sac) au nord ou au sud
  const lat = impasse ? null : laterale(e);
  for (let y = R0 - 1; y <= R1 + 1; y++) for (let x = 0; x < W; x++) g[y][x] = (y < R0 || y > R1) ? (ville ? ',' : ':') : ',';
  if (lat) {
    const [y0, y1] = lat === 'n' ? [0, R0 - 1] : [R1 + 1, H - 1];
    for (let y = y0; y <= y1; y++) for (let x = C0 - 1; x <= C1 + 1; x++) g[y][x] = (x < C0 || x > C1) ? (ville ? ',' : ':') : ',';
  }
  // bords : façades closes (ville) ou rideau d'arbres (campagne), percés aux sorties
  for (let x = 0; x < W; x++) { g[0][x] = bord; g[H - 1][x] = bord; }
  for (let y = 0; y < H; y++) { g[y][0] = bord; g[y][W - 1] = bord; }
  for (let y = R0; y <= R1; y++) { g[y][0] = 'E'; if (!impasse) g[y][W - 1] = 'E'; }
  if (lat) for (let x = C0; x <= C1; x++) g[lat === 'n' ? 0 : H - 1][x] = 'E';
  const legende = {
    1: { comme: ',', entree: 'o' }, 2: { comme: ',', entree: 'e' }, 3: { comme: ',', entree: 'n' }, 4: { comme: ',', entree: 's' },
    B: { prop: 'barriere' }, G: { prop: 'grille' }, R: { prop: 'roncier' },
  };
  // le cul-de-sac : la rue finit sur une barrière, et l'on voit au-delà ce qu'on ne peut pas franchir
  if (impasse) {
    const im = genreImpasse(e), x0 = W - 10;
    for (let y = 1; y < H - 1; y++) {
      if (im.obstacle === 'eau') { for (let x = x0; x < x0 + 3; x++) g[y][x] = '~'; }
      else if (y >= R0 - 2 && y <= R1 + 2) g[y][x0] = im.obstacle === 'barriere' ? (y % 3 === 2 ? 'B' : 'x') : im.obstacle === 'grille' ? 'G' : 'R';
      else if (im.obstacle === 'roncier') { g[y][x0] = 'R'; g[y][x0 + 1] = 'R'; }
      else g[y][x0] = bord;
    }
  }
  const libreDans = (G2, x, y, w = 1, h = 1) => {
    const HH = G2.length, WW = G2[0].length;
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      if (xx < 1 || yy < 1 || xx >= WW - 1 || yy >= HH - 1) return false;
      if (!',":'.includes(G2[yy][xx])) return false;
    }
    return true;
  };
  // le décor du bord de la rue : platanes ou arbres, poubelles, débris (à plat, avant de tourner)
  for (let n = 0, essai = 0; essai < 300 && n < (ville ? 14 : 22); essai++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 1 + Math.floor(r() * (H - 2));
    if (y >= R0 - 1 && y <= R1 + 1) continue;
    if (lat && x >= C0 - 1 && x <= C1 + 1) continue;
    if (!libreDans(g, x, y)) continue;
    g[y][x] = ville ? (r() < 0.35 ? 'T' : r() < 0.6 ? 'o' : 'x') : (r() < 0.8 ? 'T' : 'x');
    n++;
  }
  for (let k2 = 0; k2 < 12; k2++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 2 + Math.floor(r() * (H - 4));
    if (',":'.includes(g[y][x])) g[y][x] = r() < 0.75 ? ';' : '%';
  }
  // les entrées, deux pas à l'intérieur de chaque sortie, et le centre
  g[MID - 1][2] = '1';
  if (!impasse) g[MID][W - 3] = '2';
  if (lat === 'n') g[2][C0 + 1] = '3';
  if (lat === 's') g[H - 3][C0 + 2] = '4';
  g[MID][impasse ? 8 : 12] = '@';
  const doc = impasse ? null : traceIci(e, k);
  if (doc) { legende[5] = { comme: ',', document: doc }; g[R0 - 1][8] = '5'; }
  // on tourne : l'est du dessin pointe dans le sens de la marche ; les chiffres d'entrée suivent leur côté
  const d = sens(e, impasse);
  const t = tourner(g, d).map(l => l.map(ch => COTE_CHIFFRE[ch] ? CHIFFRE[TOURNE[d][COTE_CHIFFRE[ch]]] : ch));
  // les voitures abandonnées, toujours en long (3 × 2), posées sur la chaussée après avoir tourné
  const HH = t.length, WW = t[0].length;
  for (let n = 0, essai = 0; essai < 80 && n < (ville ? 3 : 2); essai++) {
    const x = 4 + Math.floor(r() * (WW - 9)), y = 4 + Math.floor(r() * (HH - 9));
    if (t[y][x] !== ',' || !libreDans(t, x, y, 3, 2)) continue;
    for (let yy = y; yy < y + 2; yy++) for (let xx = x; xx < x + 3; xx++) t[yy][xx] = 'v';
    n++;
  }
  const L = lieuCellule(id);
  return {
    id, nom: L.nom, exterieur: true, abords: false, version: 1, typeButin: 'defaut', pool: L.pool, morts: L.morts,
    migrer: { 0: (etat, niveau) => migrerRueV0(etat, niveau, c, d) },
    etages: [{ id: 'rue', nom: L.nom, monte: null, descend: null, plan: t.map(l => l.join('')) }],
    pieces: [], legende,
  };
}

// ---------------------------------------------------------------- les déplacements
// Les départs à pied depuis un lieu : [{ e, cote, cellule, entree, vers }] — cote = le côté de la carte du lieu qui y mène,
// entree = le côté (réel) par lequel on entre dans la première cellule, vers = le lieu au bout du tronçon.
export function departs(lieuId) {
  return (reseau().parLieu.get(lieuId) || []).map(e => e.a === lieuId
    ? { e, cote: e.cote[e.a], cellule: idCellule(e, 0), entree: reel(e, false, 'o'), vers: e.b }
    : { e, cote: e.cote[e.b], cellule: idCellule(e, e.n - 1), entree: reel(e, false, 'e'), vers: e.a });
}
// Le départ par ce côté de la carte du lieu (null : pas de route connue par là).
export const departPar = (lieuId, cote) => departs(lieuId).find(d => d.cote === cote) || null;
// Un point au loin dans la direction d'un côté : on arrive dans le lieu par la sortie de ce côté (vue.arriveeParSortie).
const DIR = { n: [0, 1], s: [0, -1], e: [1, 0], o: [-1, 0] };
function auLoin(lieuId, cote) {
  const L = LIEUX_GEO[lieuId], [dx, dy] = DIR[cote];
  return { lat: L.lat + dy * 0.01, lon: L.lon + dx * 0.01 };
}
// Où mène le côté (réel) `cote` de la cellule `id` ? → { lieu, venantDe } | { cellule, entree, impasse? } | null.
// retour : la cellule (et le côté) d'où l'on était entré dans le cul-de-sac (G.player.errance.retour).
export function voisin(id, cote, retour = null) {
  const c = decoder(id); if (!c) return null;
  const { e, k, impasse } = c;
  if (impasse) {
    const r = retour && decoder(retour.cellule);
    return r && r.e === e ? { cellule: retour.cellule, entree: retour.cote } : { cellule: idCellule(e, 0), entree: coteLateral(e) };
  }
  const p = aPlat(e, false, cote);
  if (p === 'o') return k === 0 ? { lieu: e.a, venantDe: auLoin(e.a, e.cote[e.a]) } : { cellule: idCellule(e, k - 1), entree: reel(e, false, 'e') };
  if (p === 'e') return k === e.n - 1 ? { lieu: e.b, venantDe: auLoin(e.b, e.cote[e.b]) } : { cellule: idCellule(e, k + 1), entree: reel(e, false, 'o') };
  if (p === laterale(e)) return { cellule: idImpasse(e), entree: OPP[cote], impasse: true };
  return null;
}
// Vers où l'on marche dans cette cellule, d'après le côté par lequel on y est entré : { vers, sortie } | null.
export function cap(id, entree) {
  const c = decoder(id); if (!c || c.impasse) return null;
  const { e } = c;
  return aPlat(e, false, entree) === 'o' ? { vers: e.b, sortie: reel(e, false, 'e') } : { vers: e.a, sortie: reel(e, false, 'o') };
}
export const repere = (lieuId) => REPERES[lieuId] || null;

// Reprise solo/hôte/invité. La provenance n'existait pas dans les sauvegardes v0 :
// sans elle, choisir l'extrémité la plus proche dans l'ancien tronçon et annoncer ce repli.
export function preparerRepriseErrance(joueur) {
  const pos = joueur.position;
  if (pos?.mode !== 'lieu' || !estCellule(pos.lieu)) return null;
  const c = decoder(pos.lieu), M = joueur.errance || (joueur.errance = {});
  if (c) {
    if ((pos.planV || 0) >= 1) return null;
    if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) tournerPositionV0(pos, sens(c.e, c.impasse));
    if (pos.entree) pos.entree = c.impasse ? reel(c.e, true, 'o')
      : pos.entree === 'o' ? reel(c.e, false, 'o') : pos.entree === suiteCoteV0(c.e, c.k) ? reel(c.e, false, 'e') : coteLateral(c.e);
    if (M.retour && decoder(M.retour.cellule)?.e === c.e) M.retour.cote = coteLateral(c.e);
    pos.planV = 1;
    return null;
  }
  const m = /^troncon:([^~:]+)~([^:]+):(x|\d+)$/.exec(pos.lieu);
  let lieu = 'cimetiere', provenance = false;
  if (m) {
    const [, a, b, k] = m, id = `${a}~${b}`;
    const candidats = [a, b].filter(v => Number.isFinite(LIEUX_GEO[v]?.lat));
    if (M.depart?.arete === id && candidats.includes(M.depart.lieu)) { lieu = M.depart.lieu; provenance = true; }
    else if (candidats.length === 2) {
      const echelle = LIEUX_GEO[a].echelle === 'salon' && LIEUX_GEO[b].echelle === 'salon' ? 'salon' : 'region';
      const [lo, hi] = ERRANCE.CELLULES[echelle];
      const n = borne(Math.round(metres(LIEUX_GEO[a], LIEUX_GEO[b]) / ERRANCE.M_PAR_CELLULE[echelle]), lo, hi);
      const retour = k === 'x' && M.retour?.cellule?.startsWith(`${PREFIXE}${id}:`) ? M.retour.cellule.split(':')[2] : k;
      const index = /^\d+$/.test(retour) ? borne(Number(retour), 0, n - 1) : 0;
      // Dans l'ancien plan, l'entrée A est à l'ouest ; l'entrée B peut être latérale.
      const sortie = suiteCoteV0({ id }, index), B = sortie === 'e' ? [41.5, 12.5] : sortie === 'n' ? [20.5, 2.5] : [21.5, 21.5];
      const x = Number.isFinite(pos.x) && k !== 'x' ? pos.x : 22, y = Number.isFinite(pos.y) && k !== 'x' ? pos.y : 12;
      const da = Math.hypot(x - 2.5, y - 11.5), db = Math.hypot(x - B[0], y - B[1]);
      lieu = index + da / (da + db || 1) < n / 2 ? a : b;
    } else if (candidats.length) lieu = candidats[0];
  }
  joueur.position = { mode: 'lieu', lieu };
  M.depart = null; M.retour = null;
  return { lieu, provenance };
}

// ---------------------------------------------------------------- les cartes
const possede = (id) => !!(G && ((G.player.inventaire || []).some(it => it && it.id === id) || Object.values(G.player.equip || {}).includes(id)));
// A-t-on, EN CE MOMENT, de quoi choisir sa route sur la feuille de cette échelle ? (posséder une carte et ce qu'on a
// découvert sont deux choses : une partie sans brouillard voit tout, mais ne planifie qu'avec une carte en poche)
export function carteEnMain(echelle = 'salon') {
  if (!G) return true;
  return echelle === 'region' ? possede('carte_routiere') : possede('plan_salon') || possede('carte_routiere');
}
// Peut-on choisir ce trajet sur la carte ? Un trajet entre la ville et le pays passe par la feuille du pays.
export function peutPlanifier(de, vers) {
  const a = (LIEUX_GEO[de] || {}).echelle || 'salon', b = (LIEUX_GEO[vers] || {}).echelle || 'salon';
  return carteEnMain(a === b ? b : 'region');
}
