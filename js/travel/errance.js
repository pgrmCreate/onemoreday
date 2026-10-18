// ============ Marcher sans carte — le réseau de tronçons et ses cellules (sans DOM) ============
// Sans carte en poche (plan de Salon pour la ville, carte routière pour le pays), la sortie d'un lieu n'ouvre plus la
// feuille : on part à pied (js/travel/errance_ui.js). Chaque lieu est relié à ses voisins les plus proches par un
// TRONÇON de 1 à 3 cellules jouables (une rue, un bout de route), générées depuis leur seul identifiant : les deux
// joueurs voient la même, et son état (morts, butin pris, objets posés) se sauve comme celui de n'importe quel lieu.
//
// Une cellule a trois sorties : celle d'où l'on vient (ouest, côté a), la SUITE (est ou rue latérale) et une mauvaise
// rue qui finit en cul-de-sac (l'autre des deux). De jour et par temps clair, un repère du lieu visé montre la suite ;
// de nuit, dans la brume ou sans repère, on devine — et l'on peut se perdre. Le réseau est fini (deux voisins par lieu),
// borné par de vraies barrières (impasses), et l'on revient toujours sur ses pas en marchant.
//
//   id d'une cellule : 'troncon:<a>~<b>:<k>' (k = 0..n-1, de a vers b) ou 'troncon:<a>~<b>:x' (le cul-de-sac)
import { G } from '../core/state.js';
import { seedRng } from '../core/rng.js';
import { LIEUX_GEO, SALON_SUR_REGION } from '../data/lieux.js';
import { LIEUX_RECIT } from '../data/histoire/lieux_recit.js';
import { ERRANCE, REPERES, IMPASSES, TRACES } from '../data/troncons.js';

export const PREFIXE = 'troncon:';
export const estCellule = (id) => typeof id === 'string' && id.startsWith(PREFIXE);

const metres = (a, b) => {
  const k = 111320;
  return Math.hypot((a.lon - b.lon) * k * Math.cos(a.lat * Math.PI / 180), (a.lat - b.lat) * k);
};
const borne = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const tirage = (s) => seedRng(s)();

// ---------------------------------------------------------------- le réseau (fini, déterministe)
let graphe = null;
export function reseau() {
  if (graphe) return graphe;
  const geo = Object.entries(LIEUX_GEO).filter(([, g]) => Number.isFinite(g.lat) && Number.isFinite(g.lon)).map(([id, g]) => ({ id, ...g }));
  const aretes = new Map();
  const ajouter = (p, q, echelle) => {
    const [a, b] = p.id < q.id ? [p, q] : [q, p];
    const id = `${a.id}~${b.id}`;
    if (aretes.has(id)) return;
    const m = metres(a, b), [lo, hi] = ERRANCE.CELLULES[echelle];
    aretes.set(id, { id, a: a.id, b: b.id, m, echelle, n: borne(Math.round(m / ERRANCE.M_PAR_CELLULE[echelle]), lo, hi) });
  };
  for (const echelle of ['salon', 'region']) {
    const L = geo.filter(g => g.echelle === echelle);
    for (const l of L) {
      const proches = L.filter(o => o !== l).map(o => [o, metres(l, o)]).sort((p, q) => p[1] - q[1]);
      for (let k = 0; k < Math.min(ERRANCE.VOISINS[echelle], proches.length); k++) {
        if (k > 0 && echelle === 'region' && proches[k][1] > ERRANCE.REGION_MAX_M) break;
        ajouter(l, proches[k][0], echelle);
      }
    }
  }
  // les villages proches de Salon y sont reliés par la route (on suit les panneaux) : au lieu de la ville le plus proche
  const salon = geo.filter(g => g.echelle === 'salon');
  for (const v of geo.filter(g => g.echelle === 'region' && metres(g, SALON_SUR_REGION) <= ERRANCE.PONT_SALON_M)) {
    const s = salon.map(o => [o, metres(v, o)]).sort((p, q) => p[1] - q[1])[0];
    if (s) ajouter(v, s[0], 'region');
  }
  // Un seul réseau : on relie les groupes isolés par la paire de lieux la plus proche (le cimetière doit mener au
  // centre, Istres à Salon…). Les tronçons déjà posés gardent leur identifiant ; seuls quelques ponts s'ajoutent.
  const groupe = new Map(geo.map(g => [g.id, g.id]));
  const racine = (id) => { while (groupe.get(id) !== id) id = groupe.get(id); return id; };
  for (const e of aretes.values()) groupe.set(racine(e.a), racine(e.b));
  for (;;) {
    let meilleur = null;
    for (const p of geo) for (const q of geo) {
      if (racine(p.id) === racine(q.id)) continue;
      const d = metres(p, q);
      if (!meilleur || d < meilleur[2]) meilleur = [p, q, d];
    }
    if (!meilleur) break;
    const [p, q] = meilleur;
    ajouter(p, q, p.echelle === 'salon' && q.echelle === 'salon' ? 'salon' : 'region');
    groupe.set(racine(p.id), racine(q.id));
  }
  const parLieu = new Map();
  for (const e of aretes.values()) for (const id of [e.a, e.b]) (parLieu.get(id) || parLieu.set(id, []).get(id)).push(e);
  for (const l of parLieu.values()) l.sort((p, q) => p.m - q.m);
  graphe = { aretes, parLieu };
  return graphe;
}
export const arete = (id) => reseau().aretes.get(id) || null;

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
const laterale = (e, k) => (tirage(`${e.id}:${k}:lat`) < 0.5 ? 'n' : 's');
export const suiteCote = (e, k) => (tirage(`${e.id}:${k}:suite`) < 0.5 ? 'e' : laterale(e, k));
export const impasseCote = (e, k) => (suiteCote(e, k) === 'e' ? laterale(e, k) : 'e');
export const genreImpasse = (e) => { const L = IMPASSES[e.echelle] || IMPASSES.salon; return L[Math.floor(tirage(`${e.id}:impasse`) * L.length) % L.length]; };
const point = (e, t) => { const a = LIEUX_GEO[e.a], b = LIEUX_GEO[e.b]; return { lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t }; };
export const pointCellule = (e, k) => point(e, k == null ? 0.5 : (k + 1) / (e.n + 1));
// Mètres que représente le passage d'une cellule à la suivante (n cellules = n + 1 intervalles).
export const pas = (e) => e.m / (e.n + 1);
// La trace écrite sur un mur de cette cellule (document), s'il y en a une.
function traceIci(e, k) {
  for (const t of TRACES) {
    const premier = (reseau().parLieu.get(t.pres) || [])[0];
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
export function planCellule(id) {
  const c = decoder(id); if (!c) return null;
  const { e, k, impasse } = c;
  const ville = e.echelle === 'salon';
  const r = seedRng(`${id}:plan`);
  const g = Array.from({ length: H }, () => Array(W).fill(ville ? ',' : '"'));
  const bord = ville ? '#' : 'T';
  const sorties = impasse ? ['o'] : ['o', suiteCote(e, k), impasseCote(e, k)];
  const lat = sorties.find(s => s === 'n' || s === 's');
  // chaussée est-ouest, et la rue latérale (nord ou sud)
  for (let y = R0 - 1; y <= R1 + 1; y++) for (let x = 0; x < W; x++) g[y][x] = (y < R0 || y > R1) ? (ville ? ',' : ':') : ',';
  if (lat) {
    const [y0, y1] = lat === 'n' ? [0, R0 - 1] : [R1 + 1, H - 1];
    for (let y = y0; y <= y1; y++) for (let x = C0 - 1; x <= C1 + 1; x++) g[y][x] = (x < C0 || x > C1) ? (ville ? ',' : ':') : ',';
  }
  // bords : façades closes (ville) ou rideau d'arbres (campagne), percés aux sorties
  for (let x = 0; x < W; x++) { g[0][x] = bord; g[H - 1][x] = bord; }
  for (let y = 0; y < H; y++) { g[y][0] = bord; g[y][W - 1] = bord; }
  for (let y = R0; y <= R1; y++) { g[y][0] = 'E'; if (sorties.includes('e')) g[y][W - 1] = 'E'; }
  if (lat) for (let x = C0; x <= C1; x++) g[lat === 'n' ? 0 : H - 1][x] = 'E';
  // le cul-de-sac : la rue finit sur une barrière, et l'on voit la suite qu'on ne peut pas prendre
  const legende = {
    1: { comme: ',', entree: 'o' }, 2: { comme: ',', entree: 'e' }, 3: { comme: ',', entree: 'n' }, 4: { comme: ',', entree: 's' },
    B: { prop: 'barriere' }, G: { prop: 'grille' }, R: { prop: 'roncier' },
  };
  if (impasse) {
    const im = genreImpasse(e), x0 = W - 10;
    for (let y = 1; y < H - 1; y++) {
      if (im.obstacle === 'eau') { for (let x = x0; x < x0 + 3; x++) g[y][x] = '~'; }
      else if (y >= R0 - 2 && y <= R1 + 2) g[y][x0] = im.obstacle === 'barriere' ? (y % 3 === 2 ? 'B' : 'x') : im.obstacle === 'grille' ? 'G' : 'R';
      else if (im.obstacle === 'roncier') { g[y][x0] = 'R'; g[y][x0 + 1] = 'R'; }
      else g[y][x0] = bord;
    }
  }
  // ce qu'il y a dans la rue : voitures abandonnées, poubelles, gravats, platanes ou arbres, débris, corps
  const libre = (x, y, w = 1, h = 1) => {
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      if (xx < 1 || yy < 1 || xx >= W - 1 || yy >= H - 1) return false;
      if (!',":'.includes(g[yy][xx])) return false;
    }
    return true;
  };
  const poser = (x, y, w, h, ch) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) g[yy][xx] = ch; };
  const loinSorties = (x) => x > 5 && x < W - 6 && (Math.abs(x - (C0 + C1) / 2) > 4);
  for (let n = 0, essai = 0; essai < 60 && n < (ville ? 3 : 2); essai++) {
    const x = 4 + Math.floor(r() * (W - 10)), y = R0 + Math.floor(r() * 3);
    if (loinSorties(x) && libre(x, y, 3, 2)) { poser(x, y, 3, 2, 'v'); n++; }
  }
  for (let n = 0, essai = 0; essai < 300 && n < (ville ? 14 : 22); essai++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 1 + Math.floor(r() * (H - 2));
    if (y >= R0 - 1 && y <= R1 + 1) continue;
    if (lat && x >= C0 - 1 && x <= C1 + 1) continue;
    if (!libre(x, y)) continue;
    g[y][x] = ville ? (r() < 0.35 ? 'T' : r() < 0.6 ? 'o' : 'x') : (r() < 0.8 ? 'T' : 'x');
    n++;
  }
  for (let k2 = 0; k2 < 12; k2++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 2 + Math.floor(r() * (H - 4));
    if (',":'.includes(g[y][x])) g[y][x] = r() < 0.75 ? ';' : '%';
  }
  // les entrées, deux pas à l'intérieur de chaque sortie, et le centre
  g[MID - 1][2] = '1';
  if (sorties.includes('e')) g[MID][W - 3] = '2';
  if (lat === 'n') g[2][C0 + 1] = '3';
  if (lat === 's') g[H - 3][C0 + 2] = '4';
  g[MID][impasse ? 8 : 12] = '@';
  const doc = impasse ? null : traceIci(e, k);
  if (doc) { legende[5] = { comme: ',', document: doc }; g[R0 - 1][8] = '5'; }
  const L = lieuCellule(id);
  return {
    id, nom: L.nom, exterieur: true, abords: false, typeButin: 'defaut', pool: L.pool, morts: L.morts,
    etages: [{ id: 'rue', nom: L.nom, monte: null, descend: null, plan: g.map(l => l.join('')) }],
    pieces: [], legende,
  };
}

// ---------------------------------------------------------------- les déplacements
// Les départs à pied depuis un lieu : [{ e, cellule, entree, vers }] (vers = le lieu au bout du tronçon).
export function departs(lieuId) {
  return (reseau().parLieu.get(lieuId) || []).map(e => e.a === lieuId
    ? { e, cellule: idCellule(e, 0), entree: 'o', vers: e.b }
    : { e, cellule: idCellule(e, e.n - 1), entree: suiteCote(e, e.n - 1), vers: e.a });
}
// Où mène la sortie `cote` de la cellule `id` ? → { lieu, venantDe } | { cellule, entree, impasse? } | null.
// retour : la cellule (et le côté) d'où l'on était entré dans le cul-de-sac (G.player.errance.retour).
export function voisin(id, cote, retour = null) {
  const c = decoder(id); if (!c) return null;
  const { e, k, impasse } = c;
  if (impasse) {
    const r = retour && decoder(retour.cellule);
    return r && r.e === e ? { cellule: retour.cellule, entree: retour.cote } : { cellule: idCellule(e, 0), entree: impasseCote(e, 0) };
  }
  if (cote === 'o') return k === 0 ? { lieu: e.a, venantDe: pointCellule(e, 0) } : { cellule: idCellule(e, k - 1), entree: suiteCote(e, k - 1) };
  if (cote === suiteCote(e, k)) return k === e.n - 1 ? { lieu: e.b, venantDe: pointCellule(e, k) } : { cellule: idCellule(e, k + 1), entree: 'o' };
  if (cote === impasseCote(e, k)) return { cellule: idImpasse(e), entree: 'o', impasse: true };
  return null;
}
// Vers où l'on marche dans cette cellule, d'après le côté par lequel on y est entré : { vers, sortie } | null.
export function cap(id, entree) {
  const c = decoder(id); if (!c || c.impasse) return null;
  const { e, k } = c;
  return entree === 'o' ? { vers: e.b, sortie: suiteCote(e, k) } : { vers: e.a, sortie: 'o' };
}
export const repere = (lieuId) => REPERES[lieuId] || null;

// ---------------------------------------------------------------- les cartes et les indications
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
// Les lieux que l'histoire a indiqués (quelqu'un a expliqué le chemin) et où l'on n'est pas encore allé.
export function indications(depuis) {
  if (!G) return [];
  const W = G.world.lieux || {};
  return Object.keys(LIEUX_GEO).filter(id => {
    const L = W[id]; if (!L || L.visite || id === depuis || !Number.isFinite(LIEUX_GEO[id].lat)) return false;
    return !!L.indique || (!!L.decouvert && (LIEUX_RECIT[id] || {}).decouvert === false);
  });
}
// Le cap approximatif d'un lieu à l'autre (« le nord-est »).
export function direction(de, vers) {
  const a = LIEUX_GEO[de], b = LIEUX_GEO[vers]; if (!a || !b) return null;
  const ang = Math.atan2((b.lat - a.lat), (b.lon - a.lon) * Math.cos(a.lat * Math.PI / 180));
  const noms = ['l’est', 'le nord-est', 'le nord', 'le nord-ouest', 'l’ouest', 'le sud-ouest', 'le sud', 'le sud-est'];
  return noms[((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8];
}
