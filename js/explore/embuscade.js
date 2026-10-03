// ============ Embuscade — petit bout de route jouable pour les combats de VOYAGE ============
// Plus d'écran de combat : quand une rencontre de voyage tourne mal, on se retrouve sur un tronçon de route
// (ou une rue, selon l'échelle) généré à partir de la graine. On en sort en tuant les morts, ou en
// atteignant un bord (sorties « E » à gauche et à droite) : la rencontre est laissée derrière.
//   genererEmbuscade({ seed, echelle: 'salon'|'region', nuit }) → définition de niveau (format ASCII, REFONTE §4.2)
import { seedRng } from '../core/rng.js';

export function genererEmbuscade({ seed = 1, echelle = 'region' } = {}) {
  const r = seedRng(`${seed}:embuscade`);
  const W = 42, H = 19;
  const ville = echelle === 'salon';
  const g = [];
  const mid = Math.floor(H / 2);
  const route0 = mid - 2, route1 = mid + 1;            // 4 rangées de chaussée
  for (let y = 0; y < H; y++) {
    const ligne = [];
    for (let x = 0; x < W; x++) {
      let c;
      if (y >= route0 && y <= route1) c = ',';
      else if (y === route0 - 1 || y === route1 + 1) c = ville ? ',' : ':';
      else c = ville ? ',' : '"';
      ligne.push(c);
    }
    g.push(ligne);
  }
  // Bords : arbres (campagne) ou murs (ville), sorties à gauche et à droite sur la chaussée.
  for (let x = 0; x < W; x++) { g[0][x] = ville ? '#' : 'T'; g[H - 1][x] = ville ? '#' : 'T'; }
  for (let y = 0; y < H; y++) {
    const route = y >= route0 && y <= route1;
    g[y][0] = route ? 'E' : (ville ? '#' : 'T');
    g[y][W - 1] = route ? 'E' : (ville ? '#' : 'T');
  }
  const libre = (x, y, w = 1, h = 1) => {
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      if (xx < 1 || yy < 1 || xx >= W - 1 || yy >= H - 1) return false;
      if (!',":'.includes(g[yy][xx])) return false;
    }
    return true;
  };
  const poser = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) g[yy][xx] = c; };
  // Voitures abandonnées sur la chaussée (jamais au milieu, là où l'on arrive).
  const nV = 2 + Math.floor(r() * 2);
  for (let k = 0, n = 0; k < 40 && n < nV; k++) {
    const x = 4 + Math.floor(r() * (W - 10)), y = route0 + Math.floor(r() * 3);
    if (Math.abs(x - W / 2) < 5) continue;
    if (libre(x, y, 3, 2)) { poser(x, y, 3, 2, 'v'); n++; }
  }
  // Arbres, haies de cyprès (campagne) ou poubelles, gravats (ville).
  const nA = ville ? 8 : 16;
  for (let k = 0, n = 0; k < 200 && n < nA; k++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 1 + Math.floor(r() * (H - 2));
    if (y >= route0 - 1 && y <= route1 + 1) continue;
    if (!libre(x, y)) continue;
    g[y][x] = ville ? (r() < 0.5 ? 'o' : 'x') : (r() < 0.75 ? 'T' : 'x');
    n++;
  }
  // Débris, sang, corps : ce qui s'est passé ici avant toi.
  for (let k = 0; k < 10; k++) {
    const x = 2 + Math.floor(r() * (W - 4)), y = 2 + Math.floor(r() * (H - 4));
    if (g[y][x] !== ',' && g[y][x] !== '"' && g[y][x] !== ':') continue;
    if (Math.abs(x - W / 2) < 3 && Math.abs(y - mid) < 2) continue;
    g[y][x] = r() < 0.7 ? ';' : '%';
  }
  g[mid][Math.floor(W / 2)] = '@';
  return {
    id: '__embuscade', nom: ville ? 'En pleine rue' : 'Sur la route', exterieur: true, typeButin: 'defaut',
    pool: ['errant'], morts: { n: [0, 0] },
    etages: [{ id: 'route', nom: ville ? 'La rue' : 'La route', monte: null, descend: null, plan: g.map(l => l.join('')) }],
    pieces: [], legende: {},
  };
}
