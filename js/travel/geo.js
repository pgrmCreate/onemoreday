// ============ Géographie du voyage — projection, distances réelles, itinéraires routés ============
// Deux feuilles : 'salon' (la ville, 1 unité = 1 m) et 'region' (le pays salonais, 1 unité = 10 m).
// Les coordonnées de travail sont TOUJOURS en mètres (x vers l'est, y vers le sud) dans la projection
// équirectangulaire locale de la feuille. Les graphes routiers viennent d'OpenStreetMap
// (tools/osm_vers_carte.mjs → js/data/carte_salon.js, carte_region.js).
//
// API (REFONTE §12.5) :
//   projeter(lat, lon, echelle) → {x, y}          deprojeter(x, y, echelle) → {lat, lon}
//   distanceM(a, b)  (a, b : ids de lieux ou {lat, lon}) → mètres à vol d'oiseau
//   itineraire(deLieu, versLieu) → { points, metres, troncons, echelle, route, sortie }
//   pointA(iti, d) → {x, y, angle}               lieuxAffiches(echelle) → [lieu…]
import { CARTE_SALON } from '../data/carte_salon.js';
import { CARTE_REGION } from '../data/carte_region.js';
import { LIEUX, SALON_SUR_REGION } from '../game/donnees.js';
import { zonesEn } from '../data/zones.js';
import { REGLAGES } from '../data/reglages.js';
import { G } from '../core/state.js';

const KLAT = 6371000 * Math.PI / 180;
const DONNEES = { salon: CARTE_SALON, region: CARTE_REGION };
const cache = {};

// ---------------------------------------------------------------- décodage (polyline Google)
export function decoder(s) {
  const out = []; let i = 0;
  while (i < s.length) {
    let r = 0, sh = 0, b;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 0x1f) << sh; sh += 5; } while (b >= 0x20);
    out.push(r & 1 ? ~(r >> 1) : r >> 1);
  }
  return out;
}
// Flux de lignes → [[[x,y]…]…] en mètres.
function decoderLignes(s, u) {
  if (!s) return [];
  const v = decoder(s); const res = []; let i = 0, px = 0, py = 0;
  while (i < v.length) {
    const n = v[i++]; let x = px + v[i++], y = py + v[i++]; px = x; py = y;
    const l = [[x * u, y * u]];
    for (let k = 1; k < n; k++) { x += v[i++]; y += v[i++]; l.push([x * u, y * u]); }
    res.push(l);
  }
  return res;
}

// ---------------------------------------------------------------- feuilles
export function feuille(echelle) {
  if (cache[echelle]) return cache[echelle];
  const c = DONNEES[echelle];
  const u = c.unite || 1;
  const klon = KLAT * Math.cos(c.origine.lat * Math.PI / 180);
  const vn = decoder(c.noeuds); const nb = vn.length / 2;
  const nx = new Float64Array(nb), ny = new Float64Array(nb);
  for (let i = 0, x = 0, y = 0; i < nb; i++) { x += vn[2 * i]; y += vn[2 * i + 1]; nx[i] = x * u; ny[i] = y * u; }
  const ve = decoder(c.aretes); const aretes = []; const adj = Array.from({ length: nb }, () => []);
  for (let i = 0, a = 0; i < ve.length;) {
    a += ve[i++]; const b = a + ve[i++]; const classe = ve[i++]; const L = ve[i++]; const n = ve[i++];
    const pts = [[nx[a], ny[a]]]; let cx = nx[a] / u, cy = ny[a] / u;
    for (let k = 0; k < n; k++) { cx += ve[i++]; cy += ve[i++]; pts.push([cx * u, cy * u]); }
    pts.push([nx[b], ny[b]]);
    let lg = 0; for (let k = 1; k < pts.length; k++) lg += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    const e = { a, b, classe, L: Math.max(L, lg * 0.98), lg: lg || 1, pts };
    adj[a].push(aretes.length); if (b !== a) adj[b].push(aretes.length);
    aretes.push(e);
  }
  const f = {
    echelle, c, u, klon, nx, ny, aretes, adj,
    cadre: c.cadre.map(v => v * u),
    lignes: (couche) => (f['_' + couche] ||= decoderLignes(c[couche], u)),
  };
  return (cache[echelle] = f);
}

// ---------------------------------------------------------------- projection
export function projeter(lat, lon, echelle = 'salon') {
  const c = DONNEES[echelle];
  const klon = KLAT * Math.cos(c.origine.lat * Math.PI / 180);
  return { x: (lon - c.origine.lon) * klon, y: (c.origine.lat - lat) * KLAT };
}
export function deprojeter(x, y, echelle = 'salon') {
  const c = DONNEES[echelle];
  const klon = KLAT * Math.cos(c.origine.lat * Math.PI / 180);
  return { lat: c.origine.lat - y / KLAT, lon: c.origine.lon + x / klon };
}
function versLL(p) {
  if (typeof p === 'string') { const l = LIEUX[p]; return l ? { lat: l.lat, lon: l.lon } : null; }
  return p;
}
export function distanceM(a, b) {
  a = versLL(a); b = versLL(b);
  if (!a || !b) return 0;
  const x = (b.lon - a.lon) * KLAT * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  const y = (b.lat - a.lat) * KLAT;
  return Math.hypot(x, y);
}

// Lieux visibles (REFONTE §12.5) d'une feuille.
export function estDecouvert(id) {
  const l = LIEUX[id]; if (!l) return false;
  return !!(l.decouvert || (G && G.world.lieux[id] && G.world.lieux[id].decouvert));
}
export function lieuxAffiches(echelle) {
  return Object.values(LIEUX).filter(l => l.echelle === echelle && Number.isFinite(l.lat) && estDecouvert(l.id));
}
// Échelle d'un lieu (les lieux inconnus / malformés sont traités comme 'salon').
export function echelleDe(id) { return (LIEUX[id] && LIEUX[id].echelle) || 'salon'; }

// ---------------------------------------------------------------- accroche au graphe
// Plusieurs accroches candidates (la rue la plus proche n'est pas toujours la bonne : une rocade
// qui contourne le village, une impasse…). Chacune : arête k, segment i, abscisse s (m réels), point q.
const memoAcc = new Map(), memoDj = new Map();
function memo(m, cle, fn) { if (m.has(cle)) return m.get(cle); const v = fn(); if (m.size > 24) m.delete(m.keys().next().value); m.set(cle, v); return v; }
function accroches(f, x, y) { return memo(memoAcc, `${f.echelle}:${Math.round(x)}:${Math.round(y)}`, () => calculerAccroches(f, x, y)); }
function calculerAccroches(f, x, y) {
  const parArete = [];
  for (let k = 0; k < f.aretes.length; k++) {
    const e = f.aretes[k]; const p = e.pts; let acc = 0, best = null, bd = Infinity;
    for (let i = 1; i < p.length; i++) {
      const ax = p[i - 1][0], ay = p[i - 1][1], dx = p[i][0] - ax, dy = p[i][1] - ay, l2 = dx * dx + dy * dy;
      const lseg = Math.sqrt(l2);
      let t = l2 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = ax + t * dx, qy = ay + t * dy, d = Math.hypot(x - qx, y - qy);
      if (d < bd) { bd = d; best = { k, i, s: (acc + t * lseg) * e.L / e.lg, q: [qx, qy], dist: d }; }
      acc += lseg;
    }
    if (best) parArete.push(best);
  }
  if (!parArete.length) return [];
  // coût d'accès : de la porte à la rue (cours, grilles, clôtures : jamais tout droit).
  const fac = REGLAGES.voyage.FACTEUR_DETOUR[f.echelle] || 1.2;
  for (const b of parArete) { b.acces = b.dist * fac; b.p = [x, y]; }
  parArete.sort((u, v) => u.acces - v.acces);
  const marge = f.echelle === 'region' ? 900 : 120;
  return parArete.filter((b, j) => j === 0 || (j < 6 && b.acces <= parArete[0].acces + marge));
}
// Sous-polyligne d'une arête depuis l'accroche vers l'extrémité a (versA) ou b.
function morceau(e, acc, versA) {
  const pts = e.pts;
  if (versA) return [acc.q, ...pts.slice(0, acc.i).reverse()];
  return [acc.q, ...pts.slice(acc.i)];
}

// ---------------------------------------------------------------- Dijkstra (tas binaire)
function dijkstra(f, sources) {
  const n = f.nx.length;
  const dist = new Float64Array(n).fill(Infinity); const prev = new Int32Array(n).fill(-1); const src = new Int32Array(n).fill(-1);
  const tas = []; // [cout, noeud]
  const pousser = (c, v) => { tas.push([c, v]); let i = tas.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (tas[p][0] <= tas[i][0]) break; [tas[p], tas[i]] = [tas[i], tas[p]]; i = p; } };
  const tirer = () => { const h = tas[0], l = tas.pop(); if (tas.length) { tas[0] = l; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < tas.length && tas[a][0] < tas[m][0]) m = a; if (b < tas.length && tas[b][0] < tas[m][0]) m = b; if (m === i) break; [tas[m], tas[i]] = [tas[i], tas[m]]; i = m; } } return h; };
  sources.forEach(({ n: v, cout }, j) => { if (cout < dist[v]) { dist[v] = cout; prev[v] = -2; src[v] = j; pousser(cout, v); } });
  while (tas.length) {
    const [c, u] = tirer(); if (c > dist[u]) continue;
    for (const k of f.adj[u]) {
      const e = f.aretes[k]; const v = e.a === u ? e.b : e.a;
      const nc = c + e.L * (e.classe === 0 ? 1.15 : 1); // on évite un peu les autoroutes à pied
      if (nc < dist[v]) { dist[v] = nc; prev[v] = k; src[v] = src[u]; pousser(nc, v); }
    }
  }
  return { dist, prev, src };
}
// Chemin du nœud source jusqu'au nœud v.
function remonter(f, dj, v) {
  const pieces = []; let u = v;
  while (dj.prev[u] >= 0) { const e = f.aretes[dj.prev[u]]; const vient = e.a === u ? e.b : e.a; pieces.push({ pts: e.a === vient ? e.pts : e.pts.slice().reverse(), L: e.L }); u = vient; }
  return { debut: u, pieces: pieces.reverse() };
}

// Itinéraire sur UNE feuille entre deux points (mètres de la feuille). Renvoie { segs: [{pts, L}], metres }.
function routerFeuille(f, pA, pB) {
  const SA = accroches(f, pA[0], pA[1]), SB = accroches(f, pB[0], pB[1]);
  if (!SA.length || !SB.length) return null;
  const sources = [];
  for (const acc of SA) { const e = f.aretes[acc.k]; sources.push({ n: e.a, cout: acc.acces + acc.s, acc, versA: true }, { n: e.b, cout: acc.acces + e.L - acc.s, acc, versA: false }); }
  const dj = memo(memoDj, `${f.echelle}:${Math.round(pA[0])}:${Math.round(pA[1])}`, () => dijkstra(f, sources));
  let best = null;
  for (const accB of SB) {
    const eB = f.aretes[accB.k];
    for (const finA of [true, false]) {
      const n = finA ? eB.a : eB.b; const c = dj.dist[n] + (finA ? accB.s : eB.L - accB.s) + accB.acces;
      if (Number.isFinite(c) && (!best || c < best.c)) best = { c, accB, finA, n };
    }
    for (const accA of SA) if (accA.k === accB.k) {
      const c = accA.acces + Math.abs(accA.s - accB.s) + accB.acces;
      if (!best || c < best.c) best = { c, accA, accB, direct: true };
    }
  }
  if (!best) return null;
  const segs = [];
  const acces = (acc, sens) => { if (acc.dist > 1) segs.push(sens ? { pts: [acc.p, acc.q], L: acc.acces } : { pts: [acc.q, acc.p], L: acc.acces }); };
  if (best.direct) {
    const { accA: aA, accB: aB } = best; const e = f.aretes[aA.k];
    acces(aA, true);
    let mid = aA.i === aB.i ? [] : e.pts.slice(Math.min(aA.i, aB.i), Math.max(aA.i, aB.i));
    if (aA.s > aB.s) mid = mid.reverse();
    segs.push({ pts: [aA.q, ...mid, aB.q], L: Math.abs(aA.s - aB.s) });
    acces(aB, false);
    return { segs, metres: best.c };
  }
  const { debut, pieces } = remonter(f, dj, best.n);
  const S = sources[dj.src[debut]]; const eA = f.aretes[S.acc.k], eB = f.aretes[best.accB.k];
  acces(S.acc, true);
  segs.push({ pts: morceau(eA, S.acc, S.versA), L: S.versA ? S.acc.s : eA.L - S.acc.s });
  for (const p of pieces) segs.push(p);
  segs.push({ pts: morceau(eB, best.accB, best.finA).reverse(), L: best.finA ? best.accB.s : eB.L - best.accB.s });
  acces(best.accB, false);
  return { segs, metres: best.c };
}

// ---------------------------------------------------------------- itinéraire entre deux lieux
function positionLieu(id) {
  const l = LIEUX[id];
  if (l && Number.isFinite(l.lat)) return { lat: l.lat, lon: l.lon, echelle: l.echelle || 'salon' };
  if (id === 'salon') return { ...SALON_SUR_REGION, echelle: 'salon' };
  return null;
}
const cacheIti = new Map();
export function itineraire(deLieu, versLieu, opts = {}) {
  const cle = deLieu + '>' + versLieu;
  if (!opts.sansCache && cacheIti.has(cle)) return cacheIti.get(cle);
  const r = calculerItineraire(deLieu, versLieu);
  if (cacheIti.size > 200) cacheIti.clear();
  cacheIti.set(cle, r);
  return r;
}
function calculerItineraire(deLieu, versLieu) {
  const A = positionLieu(deLieu), B = positionLieu(versLieu);
  if (!A || !B) { console.warn('[geo] lieu inconnu', deLieu, versLieu); return itiVide(deLieu, versLieu); }
  const eA = A.echelle, eB = B.echelle;
  const affichage = eA === 'salon' && eB === 'salon' ? 'salon' : 'region';
  let parties = []; let sortie = null;
  try {
    if (eA === eB) {
      const f = feuille(eA); const pa = projeter(A.lat, A.lon, eA), pb = projeter(B.lat, B.lon, eB);
      const r = routerFeuille(f, [pa.x, pa.y], [pb.x, pb.y]);
      if (r) parties.push({ echelle: eA, segs: r.segs });
    } else {
      // Ville ↔ région : par la meilleure sortie de ville (graphe de Salon + graphe régional).
      const salonPt = eA === 'salon' ? A : B, regPt = eA === 'salon' ? B : A;
      const fs = feuille('salon'), fr = feuille('region');
      const ps = projeter(salonPt.lat, salonPt.lon, 'salon'), pr = projeter(regPt.lat, regPt.lon, 'region');
      let best = null;
      for (const s of CARTE_SALON.sorties || []) {
        const qs = [fs.nx[s.noeud], fs.ny[s.noeud]];
        const q = projeter(s.lat, s.lon, 'region');
        const rs = routerFeuille(fs, [ps.x, ps.y], qs); if (!rs) continue;
        const rr = routerFeuille(fr, [q.x, q.y], [pr.x, pr.y]); if (!rr) continue;
        const tot = rs.metres + rr.metres;
        if (!best || tot < best.tot) best = { tot, rs, rr, s };
      }
      if (best) {
        sortie = best.s;
        const ps1 = { echelle: 'salon', segs: best.rs.segs }, pr1 = { echelle: 'region', segs: best.rr.segs };
        if (eA === 'salon') parties = [ps1, pr1];
        else parties = [inverserPartie(pr1), inverserPartie(ps1)];
      }
    }
  } catch (e) { console.warn('[geo] itinéraire impossible', e); parties = []; }
  if (!parties.length) return itiDroit(deLieu, versLieu, A, B, affichage);
  return assembler(deLieu, versLieu, parties, affichage, sortie);
}
function inverserPartie(p) { return { echelle: p.echelle, segs: p.segs.slice().reverse().map(s => ({ pts: s.pts.slice().reverse(), L: s.L })) }; }
function itiVide(de, vers) { return { de, vers, echelle: 'salon', points: [], metres: 0, troncons: [], route: false }; }
function itiDroit(de, vers, A, B, affichage) {
  const fac = REGLAGES.voyage.FACTEUR_DETOUR[affichage] || 1.25;
  const a = projeter(A.lat, A.lon, A.echelle), b = projeter(B.lat, B.lon, B.echelle);
  const la = deprojeter(a.x, a.y, A.echelle), lb = deprojeter(b.x, b.y, B.echelle);
  const pa = projeter(la.lat, la.lon, A.echelle), pb = projeter(lb.lat, lb.lon, A.echelle);
  return assembler(de, vers, [{ echelle: A.echelle, segs: [{ pts: [[pa.x, pa.y], [pb.x, pb.y]], L: distanceM(A, B) * fac }] }], affichage, null, false);
}
// Met bout à bout les parties (chacune dans sa feuille) → points dans la feuille d'affichage,
// avec distance cumulée RÉELLE (mètres), puis découpe en tronçons pour les zones.
function assembler(de, vers, parties, affichage, sortie, route = true) {
  const points = []; let d = 0;
  for (const p of parties) {
    for (const s of p.segs) {
      const pts = s.pts; let lg = 0;
      for (let i = 1; i < pts.length; i++) lg += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const k = lg > 0 ? s.L / lg : 0;
      for (let i = 0; i < pts.length; i++) {
        if (i > 0) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * k;
        const ll = deprojeter(pts[i][0], pts[i][1], p.echelle);
        const q = p.echelle === affichage ? { x: pts[i][0], y: pts[i][1] } : projeter(ll.lat, ll.lon, affichage);
        const der = points[points.length - 1];
        if (der && Math.abs(der.x - q.x) < 0.01 && Math.abs(der.y - q.y) < 0.01) { der.d = d; continue; }
        points.push({ x: q.x, y: q.y, lat: ll.lat, lon: ll.lon, d, echelle: p.echelle });
      }
    }
  }
  const metres = d;
  return { de, vers, echelle: affichage, points, metres, troncons: decouper(points, metres), route, sortie };
}
// Tronçons de 50 m (ville) / 250 m (région) : zones traversées + danger au milieu du tronçon.
function decouper(points, metres) {
  const R = REGLAGES.voyage.RENCONTRES; const out = [];
  if (!points.length || metres <= 0) return out;
  let d0 = 0;
  while (d0 < metres - 0.5) {
    const mi = pointBrut(points, d0 + 1);
    const pas = R.ECHANTILLON_M[mi.echelle] || 50;
    const l = Math.min(pas, metres - d0);
    const p = pointBrut(points, d0 + l / 2);
    const zs = zonesEn({ lat: p.lat, lon: p.lon }, p.echelle);
    let danger = null; for (const z of zs) danger = Math.max(danger ?? 0, z.danger);
    out.push({ d: d0, metres: l, echelle: p.echelle, lat: p.lat, lon: p.lon, zones: zs.map(z => z.id), danger });
    d0 += l;
  }
  return out;
}
function pointBrut(points, d) {
  let lo = 0, hi = points.length - 1;
  if (d <= 0) return points[0]; if (d >= points[hi].d) return points[hi];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (points[m].d <= d) lo = m; else hi = m; }
  const a = points[lo], b = points[hi], t = b.d > a.d ? (d - a.d) / (b.d - a.d) : 0;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t, echelle: t < 0.5 ? a.echelle : b.echelle, d };
}
// Position (dans la feuille d'affichage) à d mètres du départ, avec l'angle de marche (degrés).
export function pointA(iti, d) {
  const P = iti.points; if (!P.length) return { x: 0, y: 0, angle: 0 };
  const p = pointBrut(P, d); const q = pointBrut(P, Math.min(iti.metres, d + 15)); const r = pointBrut(P, Math.max(0, d - 15));
  return { ...p, angle: Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI };
}
// Sous-tracé [d0, d1] (pour dessiner la partie parcourue / restante).
export function sousTrace(iti, d0, d1) {
  const P = iti.points; const out = [pointBrut(P, d0)];
  for (const p of P) if (p.d > d0 && p.d < d1) out.push(p);
  out.push(pointBrut(P, d1));
  return out;
}
// Itinéraire inverse (demi-tour) : on repart de la position d vers le départ.
export function inverser(iti, d) {
  const pts = sousTrace(iti, 0, d).reverse().map(p => ({ ...p, d: d - p.d }));
  return { de: iti.vers, vers: iti.de, echelle: iti.echelle, points: pts, metres: d, troncons: decouper(pts, d), route: iti.route, demiTour: true };
}
// Ajoute un détour (mètres) : le reste du trajet (après dCourant) s'étire d'autant.
export function allonger(iti, m, dCourant = 0) {
  const reste = Math.max(1, iti.metres - dCourant), k = (reste + m) / reste;
  const pts = iti.points.map(p => (p.d > dCourant ? { ...p, d: dCourant + (p.d - dCourant) * k } : { ...p }));
  return { ...iti, points: pts, metres: iti.metres + m, troncons: decouper(pts, iti.metres + m) };
}
