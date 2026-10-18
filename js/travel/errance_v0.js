// Ancien plan figé : uniquement pour retrouver les meubles et entrées des sauvegardes v0.
// Ne pas modifier le tirage ni l'ordre des objets : leurs positions sont des clés de sauvegarde.
import { seedRng } from '../core/rng.js';
import { ERRANCE, IMPASSES } from '../data/troncons.js';
const tirage = s => seedRng(s)();
const laterale = (e, k) => tirage(e.id + ':' + k + ':lat') < 0.5 ? 'n' : 's';
export const suiteCoteV0 = (e, k) => tirage(e.id + ':' + k + ':suite') < 0.5 ? 'e' : laterale(e, k);
const suiteCote = suiteCoteV0;
const impasseCote = (e, k) => suiteCote(e, k) === 'e' ? laterale(e, k) : 'e';
const genreImpasse = e => { const L = IMPASSES[e.echelle]; return L[Math.floor(tirage(e.id + ':impasse') * L.length) % L.length]; };

const W = 44, H = 24, MID = 12, R0 = MID - 2, R1 = MID + 1, C0 = 19, C1 = 22;
export function planCelluleV0(id, c) {
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
  const L = { nom: 'Ancienne rue', pool: ERRANCE.POOL, morts: { n: ERRANCE.MORTS[e.echelle] } };
  return {
    id, nom: L.nom, exterieur: true, abords: false, typeButin: 'defaut', pool: L.pool, morts: L.morts,
    etages: [{ id: 'rue', nom: L.nom, monte: null, descend: null, plan: g.map(l => l.join('')) }],
    pieces: [], legende,
  };
}
