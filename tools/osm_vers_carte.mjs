// ============================================================================
//  OSM → cartes du jeu (js/data/carte_salon.js, js/data/carte_region.js)
// ============================================================================
// Usage : node tools/osm_vers_carte.mjs [dossier_geo=../geo]
// Entrées (Overpass, `out geom`, © contributeurs OpenStreetMap, ODbL) :
//   salon_roads.json, salon_misc.json, salon_buildings.json, region_roads.json, region_water.json
// Sorties : tracés simplifiés (Douglas-Peucker) + GRAPHE ROUTIER, en mètres dans une projection
// équirectangulaire locale (x vers l'est, y vers le SUD, origine = `origine`).
//
// Encodage compact des nombres : « polyline » de Google (entiers signés, zigzag, 5 bits/caractère,
// caractères 63..126). Chaque couche est UNE chaîne = une suite d'entiers, décodée par js/travel/geo.js.
//   noeuds : x0,y0, dx,dy, dx,dy…            (coordonnées delta, en `unite` mètres)
//   aretes : par arête : da, db, classe, L, n, puis n points intermédiaires en delta depuis le nœud a
//            (da = a − a précédent ; db = b − a ; L = longueur réelle en mètres)
//   lignes (rail, eau…) : par ligne : n, x0−xPréc, y0−yPréc, puis (n−1) deltas
//   polygones : idem, fermeture implicite
// Classes de voies : 0 autoroute/voie rapide, 1 principale, 2 secondaire, 3 tertiaire, 4 rue, 5 piétonne.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const GEO = path.resolve(process.argv[2] || path.join(RACINE, '..', 'geo'));
const lire = (f) => { const p = path.join(GEO, f); if (!fs.existsSync(p)) { console.warn('absent :', f); return null; } return JSON.parse(fs.readFileSync(p, 'utf8')).elements || []; };

const { LIEUX_GEO, SALON_SUR_REGION } = await import(path.join(RACINE, 'js/data/lieux.js'));

// ---------------------------------------------------------------- projection
const KLAT = 6371000 * Math.PI / 180;
function projection(lat0, lon0) {
  const klon = KLAT * Math.cos(lat0 * Math.PI / 180);
  return (lat, lon) => [(lon - lon0) * klon, (lat0 - lat) * KLAT];
}
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function longueur(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += d2(pts[i - 1], pts[i]); return s; }

// ---------------------------------------------------------------- Douglas-Peucker
function distSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  if (!l) return d2(p, a);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l; t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const garde = new Uint8Array(pts.length); garde[0] = garde[pts.length - 1] = 1;
  const pile = [[0, pts.length - 1]];
  while (pile.length) {
    const [i, j] = pile.pop(); let m = -1, dm = tol;
    for (let k = i + 1; k < j; k++) { const d = distSeg(pts[k], pts[i], pts[j]); if (d > dm) { dm = d; m = k; } }
    if (m >= 0) { garde[m] = 1; pile.push([i, m], [m, j]); }
  }
  return pts.filter((_, i) => garde[i]);
}

// ---------------------------------------------------------------- encodage
function enc(nums) {
  let s = '';
  for (let v of nums) {
    v = Math.round(v); v = v < 0 ? ~(v << 1) : v << 1;
    while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    s += String.fromCharCode(v + 63);
  }
  return s;
}
// Couche de lignes/polygones → flux d'entiers.
function fluxLignes(lignes, unite) {
  const out = []; let px = 0, py = 0;
  for (const l of lignes) {
    const q = l.map(p => [Math.round(p[0] / unite), Math.round(p[1] / unite)]);
    const r = q.filter((p, i) => i === 0 || p[0] !== q[i - 1][0] || p[1] !== q[i - 1][1]);
    if (r.length < 2) continue;
    out.push(r.length, r[0][0] - px, r[0][1] - py);
    for (let i = 1; i < r.length; i++) out.push(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]);
    px = r[0][0]; py = r[0][1];
  }
  return enc(out);
}

// ---------------------------------------------------------------- découpe au cadre
function dansCadre(p, c) { return p[0] >= c[0] && p[0] <= c[2] && p[1] >= c[1] && p[1] <= c[3]; }
function couperLigne(pts, c) {
  const res = []; let cur = [];
  for (const p of pts) { if (dansCadre(p, c)) cur.push(p); else { if (cur.length > 1) res.push(cur); cur = []; } }
  if (cur.length > 1) res.push(cur);
  return res;
}
function couperPolygone(pts, c) { // Sutherland-Hodgman
  const bords = [[0, c[0], 1], [0, c[2], -1], [1, c[1], 1], [1, c[3], -1]];
  let poly = pts;
  for (const [ax, v, s] of bords) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ina = (a[ax] - v) * s >= 0, inb = (b[ax] - v) * s >= 0;
      if (ina) out.push(a);
      if (ina !== inb) { const t = (v - a[ax]) / (b[ax] - a[ax]); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
    }
    poly = out; if (!poly.length) break;
  }
  return poly;
}
function aire(pts) { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); }

// Assemble des morceaux de contour (relations multipolygones) en anneaux fermés.
function assemblerAnneaux(morceaux) {
  const reste = morceaux.map(m => m.slice()); const anneaux = [];
  while (reste.length) {
    let ring = reste.shift();
    let progres = true;
    while (progres && d2(ring[0], ring[ring.length - 1]) > 1) {
      progres = false;
      for (let i = 0; i < reste.length; i++) {
        const m = reste[i], fin = ring[ring.length - 1];
        if (d2(m[0], fin) < 1) { ring = ring.concat(m.slice(1)); }
        else if (d2(m[m.length - 1], fin) < 1) { ring = ring.concat(m.slice().reverse().slice(1)); }
        else continue;
        reste.splice(i, 1); progres = true; break;
      }
    }
    anneaux.push(ring);
  }
  return anneaux;
}

// ---------------------------------------------------------------- classes de voies
function classeVoie(hw) {
  if (/^(motorway|trunk)/.test(hw)) return 0;
  if (/^primary/.test(hw)) return 1;
  if (/^secondary/.test(hw)) return 2;
  if (/^tertiary/.test(hw)) return 3;
  if (hw === 'pedestrian') return 5;
  return 4;
}

// ---------------------------------------------------------------- graphe routier
// ways : [{ ids: [osmNodeId…], pts: [[x,y]…], classe, nom, ref }]
function construireGraphe(ways, { tol, unite }) {
  const usage = new Map();
  for (const w of ways) w.ids.forEach((id, i) => usage.set(id, (usage.get(id) || 0) + (i === 0 || i === w.ids.length - 1 ? 2 : 1)));
  const index = new Map(); const noeuds = [];
  const nid = (id, p) => { if (!index.has(id)) { index.set(id, noeuds.length); noeuds.push(p); } return index.get(id); };
  let aretes = [];
  for (const w of ways) {
    let debut = 0;
    for (let i = 1; i < w.ids.length; i++) {
      if (usage.get(w.ids[i]) >= 2 || i === w.ids.length - 1) {
        const pts = w.pts.slice(debut, i + 1);
        const a = nid(w.ids[debut], w.pts[debut]), b = nid(w.ids[i], w.pts[i]);
        if (a !== b || pts.length > 3) aretes.push({ a, b, pts, classe: w.classe, nom: w.nom, ref: w.ref, L: longueur(pts) });
        debut = i;
      }
    }
  }
  // Fusion des nœuds de degré 2 (jonction de deux ways de même classe).
  const adj = () => { const m = noeuds.map(() => []); aretes.forEach((e, k) => { if (!e.mort) { m[e.a].push(k); if (e.b !== e.a) m[e.b].push(k); } }); return m; };
  let A = adj(); let fusions = 0;
  for (let n = 0; n < noeuds.length; n++) {
    const l = A[n].filter(k => !aretes[k].mort);
    if (l.length !== 2 || l[0] === l[1]) continue;
    const e1 = aretes[l[0]], e2 = aretes[l[1]];
    if (e1.classe !== e2.classe || e1.a === e1.b || e2.a === e2.b) continue;
    const p1 = e1.b === n ? e1.pts : e1.pts.slice().reverse(); const s1 = e1.b === n ? e1.a : e1.b;
    const p2 = e2.a === n ? e2.pts : e2.pts.slice().reverse(); const s2 = e2.a === n ? e2.b : e2.a;
    if (s1 === s2) continue;
    const ne = { a: s1, b: s2, pts: p1.concat(p2.slice(1)), classe: e1.classe, nom: e1.nom || e2.nom, ref: e1.ref || e2.ref, L: e1.L + e2.L };
    e1.mort = e2.mort = true; aretes.push(ne); const k = aretes.length - 1;
    A[s1] = A[s1].filter(x => x !== l[0] && x !== l[1]).concat(k);
    A[s2] = A[s2].filter(x => x !== l[0] && x !== l[1]).concat(k);
    A[n] = []; fusions++;
  }
  aretes = aretes.filter(e => !e.mort);
  // Plus grande composante connexe seulement.
  A = noeuds.map(() => []); aretes.forEach((e, k) => { A[e.a].push(e.b); A[e.b].push(e.a); });
  const comp = new Int32Array(noeuds.length).fill(-1); let meilleure = -1, taille = 0;
  for (let s = 0, c = 0; s < noeuds.length; s++) {
    if (comp[s] >= 0 || !A[s].length) continue;
    let t = 0; const pile = [s]; comp[s] = c;
    while (pile.length) { const u = pile.pop(); t++; for (const v of A[u]) if (comp[v] < 0) { comp[v] = c; pile.push(v); } }
    if (t > taille) { taille = t; meilleure = c; } c++;
  }
  aretes = aretes.filter(e => comp[e.a] === meilleure);
  // Renumérotation compacte, tri spatial grossier (deltas plus petits).
  const utilises = [...new Set(aretes.flatMap(e => [e.a, e.b]))].sort((i, j) => (Math.floor(noeuds[i][1] / 200) - Math.floor(noeuds[j][1] / 200)) || (noeuds[i][0] - noeuds[j][0]));
  const renum = new Map(utilises.map((o, i) => [o, i]));
  const N = utilises.map(o => [Math.round(noeuds[o][0] / unite), Math.round(noeuds[o][1] / unite)]);
  const E = aretes.map(e => {
    let a = renum.get(e.a), b = renum.get(e.b), pts = e.pts;
    if (b < a) { [a, b] = [b, a]; pts = pts.slice().reverse(); }
    const simp = dp(pts, tol).slice(1, -1).map(p => [Math.round(p[0] / unite), Math.round(p[1] / unite)]);
    return { a, b, classe: e.classe, L: Math.max(1, Math.round(e.L)), mil: simp, nom: e.nom, ref: e.ref, pts };
  }).sort((x, y) => x.a - y.a || x.b - y.b);
  const fn = []; let px = 0, py = 0;
  for (const [x, y] of N) { fn.push(x - px, y - py); px = x; py = y; }
  const fe = []; let pa = 0;
  for (const e of E) {
    fe.push(e.a - pa, e.b - e.a, e.classe, e.L, e.mil.length);
    let [cx, cy] = N[e.a];
    for (const [x, y] of e.mil) { fe.push(x - cx, y - cy); cx = x; cy = y; }
    pa = e.a;
  }
  return { N, E, noeuds: enc(fn), aretes: enc(fe), fusions };
}

// Étiquettes de rues : pour chaque nom, le plus long tronçon droit.
function etiquettes(E, N, unite, { max, minL, classes }) {
  const parNom = new Map();
  for (const e of E) {
    if (!e.nom || !classes.includes(e.classe)) continue;
    const r = parNom.get(e.nom) || { total: 0, best: null, bestL: 0, classe: e.classe };
    r.total += e.L; r.classe = Math.min(r.classe, e.classe);
    for (let i = 1; i < e.pts.length; i++) {
      const l = d2(e.pts[i - 1], e.pts[i]);
      if (l > r.bestL) { r.bestL = l; r.best = [e.pts[i - 1], e.pts[i]]; }
    }
    parNom.set(e.nom, r);
  }
  return [...parNom].filter(([, r]) => r.total >= minL && r.bestL > 40).sort((a, b) => a[1].classe - b[1].classe || b[1].total - a[1].total).slice(0, max)
    .map(([nom, r]) => {
      const [p, q] = r.best; let ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
      if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      return [Math.round((p[0] + q[0]) / 2 / unite), Math.round((p[1] + q[1]) / 2 / unite), Math.round(ang), nom, r.classe];
    });
}

function ecrire(fichier, nom, obj, entete) {
  const js = `${entete}\nexport const ${nom} = ${JSON.stringify(obj)};\n`;
  fs.writeFileSync(path.join(RACINE, fichier), js);
  console.log(fichier, (js.length / 1024).toFixed(1), 'Ko');
}
const ENTETE = (titre) => `// ============ ${titre} — GÉNÉRÉ par tools/osm_vers_carte.mjs, ne pas éditer à la main ============
// Données © contributeurs OpenStreetMap, licence ODbL (https://www.openstreetmap.org/copyright).
// Coordonnées en « unite » mètres, projection équirectangulaire locale autour de « origine » (x est, y sud),
// nombres encodés (polyline Google) — décodage : js/travel/geo.js.`;

// ============================================================================
//  SALON
// ============================================================================
function faireSalon() {
  const O = { lat: 43.6415, lon: 5.095 };
  const P = projection(O.lat, O.lon);
  const unite = 1;
  const [x0, y1] = P(43.615, 5.055), [x1, y0] = P(43.668, 5.135);
  const cadre = [x0, y0, x1, y1].map(Math.round);
  const roads = lire('salon_roads.json');
  const ways = roads.filter(e => e.type === 'way' && e.geometry && e.tags?.highway && e.tags.area !== 'yes').map(e => ({
    ids: e.nodes, pts: e.geometry.map(g => P(g.lat, g.lon)), classe: classeVoie(e.tags.highway), nom: e.tags.name || null, ref: e.tags.ref || null,
  }));
  const g = construireGraphe(ways, { tol: 1.5, unite });
  console.log('salon : noeuds', g.N.length, 'aretes', g.E.length, 'fusions', g.fusions);

  // Sorties de ville : nœuds de voies principales/secondaires proches du bord du cadre.
  const marge = 180; const cands = [];
  g.E.forEach(e => { if (e.classe >= 1 && e.classe <= 3) for (const n of [e.a, e.b]) {
    const [x, y] = g.N[n]; const db = Math.min(x - cadre[0], cadre[2] - x, y - cadre[1], cadre[3] - y);
    if (db < marge) cands.push({ n, x, y, db, classe: e.classe, ref: e.ref, nom: e.nom });
  } });
  cands.sort((a, b) => a.classe - b.classe || a.db - b.db);
  const sorties = [];
  for (const c of cands) if (!sorties.some(s => Math.hypot(s.x - c.x, s.y - c.y) < 900)) sorties.push(c);
  const inv = (x, y) => ({ lat: +(O.lat - y / KLAT).toFixed(5), lon: +(O.lon + x / (KLAT * Math.cos(O.lat * Math.PI / 180))).toFixed(5) });
  const regionaux = Object.entries(LIEUX_GEO).filter(([, l]) => l.echelle === 'region');
  const SORTIES = sorties.map((s, i) => {
    const ang = Math.atan2(s.y, s.x); let vers = null, best = 1e9;
    for (const [id, l] of regionaux) {
      const [lx, ly] = P(l.lat, l.lon); const a2 = Math.atan2(ly, lx);
      let da = Math.abs(ang - a2); if (da > Math.PI) da = 2 * Math.PI - da;
      const cout = Math.hypot(lx, ly) * (1 + 3 * da);
      if (da < 0.7 && cout < best) { best = cout; vers = id; }
    }
    return { id: 'sortie_' + i, noeud: s.n, ...inv(s.x, s.y), route: (s.ref || '').replace(/\s/g, '').split(';')[0] || null, rue: s.nom, vers };
  });
  console.log('sorties', SORTIES.map(s => `${s.route || s.rue}→${s.vers}`).join(', '));

  // Couches de décor.
  const misc = lire('salon_misc.json') || [];
  const couche = (filtre, tol, poly = false, minA = 0) => {
    const res = [];
    for (const e of misc) {
      if (e.type !== 'way' || !e.geometry || !filtre(e.tags || {})) continue;
      const pts = e.geometry.map(q => P(q.lat, q.lon));
      if (poly) { const c = couperPolygone(pts, cadre); if (c.length > 2 && aire(c) >= minA) res.push(dp(c, tol)); }
      else for (const l of couperLigne(pts, cadre)) res.push(dp(l, tol));
    }
    return res;
  };
  const rail = couche(t => t.railway === 'rail' && t.service !== 'siding' && t.service !== 'yard', 3);
  const canaux = couche(t => /^(canal|river)$/.test(t.waterway) && !t.tunnel, 3);
  const ruisseaux = couche(t => t.waterway === 'stream' && !t.tunnel, 4);
  const parcs = couche(t => t.leisure === 'park', 2.5, true, 400);
  const cimetieres = couche(t => t.landuse === 'cemetery', 2, true);
  const industrie = couche(t => t.landuse === 'industrial' || t.landuse === 'retail', 4, true, 3000);
  const militaire = couche(t => t.landuse === 'military', 4, true);
  const bati = (lire('salon_buildings.json') || []).filter(e => e.type === 'way' && e.geometry).map(e => e.geometry.map(q => P(q.lat, q.lon)))
    .filter(p => aire(p) >= 18).map(p => { const s = dp(p.slice(0, -1), 0.9); return s.length >= 3 ? s : null; }).filter(Boolean);
  const eauNoms = [];
  for (const e of misc) if (e.tags?.waterway === 'canal' && /Craponne/.test(e.tags.name || '') && !e.tags.tunnel && e.geometry.length > 8) {
    const pts = e.geometry.map(q => P(q.lat, q.lon)); if (!pts.every(p => dansCadre(p, cadre))) continue;
    const i = Math.floor(pts.length / 2); const [p, q] = [pts[i - 1], pts[i]];
    let ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    if (!eauNoms.some(n => Math.hypot(n[0] - p[0], n[1] - p[1]) < 1200)) eauNoms.push([Math.round(p[0]), Math.round(p[1]), Math.round(ang), 'Canal de Craponne', 9]);
  }
  const CARTE = {
    echelle: 'salon', origine: O, unite, cadre,
    noeuds: g.noeuds, aretes: g.aretes,
    sorties: SORTIES,
    etiquettes: etiquettes(g.E, g.N, unite, { max: 90, minL: 220, classes: [1, 2, 3, 4, 5] }).concat(eauNoms.slice(0, 3)),
    rail: fluxLignes(rail, unite), canaux: fluxLignes(canaux, unite), ruisseaux: fluxLignes(ruisseaux, unite),
    parcs: fluxLignes(parcs, unite), cimetieres: fluxLignes(cimetieres, unite), industrie: fluxLignes(industrie, unite),
    militaire: fluxLignes(militaire, unite), bati: fluxLignes(bati, unite),
  };
  ecrire('js/data/carte_salon.js', 'CARTE_SALON', CARTE, ENTETE('Carte de Salon-de-Provence'));
  return { g, P };
}

// ============================================================================
//  PAYS SALONAIS
// ============================================================================
function faireRegion() {
  const O = { lat: 43.615, lon: 5.085 };
  const P = projection(O.lat, O.lon);
  const unite = 10;
  const [x0, y1] = P(43.455, 4.915), [x1, y0] = P(43.772, 5.255);
  const cadre = [x0, y0, x1, y1].map(Math.round);
  const roads = lire('region_roads.json');
  let g = null, rail = [];
  if (roads) {
    const ways = roads.filter(e => e.type === 'way' && e.geometry && e.tags?.highway).map(e => ({
      ids: e.nodes, pts: e.geometry.map(q => P(q.lat, q.lon)), classe: Math.min(2, classeVoie(e.tags.highway)), nom: e.tags.name || null, ref: (e.tags.ref || '').split(';')[0] || null,
    }));
    g = construireGraphe(ways, { tol: 14, unite });
    console.log('region : noeuds', g.N.length, 'aretes', g.E.length);
    for (const e of roads) if (e.tags?.railway === 'rail' && e.tags.service == null && e.geometry)
      for (const l of couperLigne(e.geometry.map(q => P(q.lat, q.lon)), cadre)) rail.push(dp(l, 15));
  } else {
    g = grapheDeSecours(P, unite);
  }
  const water = lire('region_water.json') || [];
  const etangs = [], canaux = [], rivieres = [], nomsEau = [];
  for (const e of water) {
    const t = e.tags || {};
    if (e.type === 'relation' && t.natural === 'water') {
      const outer = e.members.filter(m => m.role === 'outer' && m.geometry).map(m => m.geometry.map(q => P(q.lat, q.lon)));
      for (const r of assemblerAnneaux(outer)) { const c = couperPolygone(r, cadre); if (c.length > 2) etangs.push({ pts: dp(c, 25), nom: t.name }); }
    } else if (e.type === 'way' && t.natural === 'water' && /^(Étang|Lac)/.test(t.name || '') && e.geometry) {
      const c = couperPolygone(e.geometry.map(q => P(q.lat, q.lon)), cadre);
      if (c.length > 2 && aire(c) > 40000) etangs.push({ pts: dp(c, 20), nom: t.name });
    } else if (e.type === 'way' && e.geometry && !t.tunnel) {
      const pts = e.geometry.map(q => P(q.lat, q.lon));
      if (t.waterway === 'river' && /Durance|Touloubre|Arc/.test(t.name || '')) for (const l of couperLigne(pts, cadre)) rivieres.push({ pts: dp(l, 15), nom: t.name });
      else if (t.waterway === 'canal' && /^(Canal de Craponne|Canal EDF|Canal de Marseille|Canal de la Vallée des Baux|Canal de Saint-Chamas)/.test(t.name || ''))
        for (const l of couperLigne(pts, cadre)) canaux.push({ pts: dp(l, 18), nom: t.name });
    }
  }
  const nomme = (liste) => {
    const vus = new Map();
    for (const { pts, nom } of liste) { const L = longueur(pts); if (!vus.has(nom) || vus.get(nom).L < L) vus.set(nom, { L, pts }); }
    for (const [nom, { pts }] of vus) {
      if (!nom) continue; const i = Math.floor(pts.length / 2); if (i < 1) continue;
      const [p, q] = [pts[i - 1], pts[i]]; let ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
      if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      nomsEau.push([Math.round(p[0] / unite), Math.round(p[1] / unite), Math.round(ang), nom.replace(/\s*\(.*\)/, ''), 9]);
    }
  };
  nomme(rivieres.filter(r => /Durance|Touloubre/.test(r.nom)));
  // Salon vu de loin : ses rues, très simplifiées.
  const sr = lire('salon_roads.json') || [];
  const ville = [];
  for (const e of sr) if (e.geometry && e.tags?.highway && classeVoie(e.tags.highway) >= 2) ville.push(dp(e.geometry.map(q => P(q.lat, q.lon)), 12));
  const CARTE = {
    echelle: 'region', origine: O, unite, cadre: cadre.map(v => Math.round(v / unite)),
    noeuds: g.noeuds, aretes: g.aretes, secours: !roads,
    etiquettes: etiquettes(g.E, g.N, unite, { max: 0, minL: 1e9, classes: [] }).concat(nomsEau),
    rail: fluxLignes(rail, unite), etangs: fluxLignes(etangs.map(e => e.pts), unite),
    rivieres: fluxLignes(rivieres.map(r => r.pts), unite), canaux: fluxLignes(canaux.map(c => c.pts), unite),
    ville: fluxLignes(ville.filter(l => longueur(l) > 60), unite),
    refs: routesRef(g.E, unite),
    salon: SALON_SUR_REGION,
  };
  ecrire('js/data/carte_region.js', 'CARTE_REGION', CARTE, ENTETE('Carte du pays salonais'));
}
// Numéros de route (cartouches « D538 ») : un par route et par ~6 km.
function routesRef(E, unite) {
  const out = [];
  for (const e of E) {
    if (!e.ref || e.L < 2500) continue;
    const i = Math.floor(e.pts.length / 2); const p = e.pts[i];
    if (out.some(o => o[2] === e.ref && Math.hypot(o[0] * unite - p[0], o[1] * unite - p[1]) < 9000) || out.some(o => Math.hypot(o[0] * unite - p[0], o[1] * unite - p[1]) < 2500)) continue;
    out.push([Math.round(p[0] / unite), Math.round(p[1] / unite), e.ref.replace(/\s/g, ''), e.classe]);
  }
  return out;
}
// Si region_roads.json manque : grands axes connus en lignes brisées plausibles.
function grapheDeSecours(P, unite) {
  const L = (id) => { const l = LIEUX_GEO[id]; return [l.lat, l.lon]; };
  const S = [SALON_SUR_REGION.lat, SALON_SUR_REGION.lon];
  const axes = [
    [1, 'D538', [S, [43.672, 5.088], L('cales'), [43.725, 5.080], L('senas')]],
    [1, 'D572', [S, [43.636, 5.125], L('pelissanne'), [43.628, 5.180], L('la_barben')]],
    [1, 'N113', [S, [43.620, 5.080], L('grans'), [43.590, 5.030], L('miramas'), [43.545, 5.000], L('istres')]],
    [0, 'A7', [L('senas'), [43.700, 5.110], [43.660, 5.120], [43.625, 5.125], L('lancon')]],
    [0, 'A54', [[43.640, 5.125], [43.620, 5.080], [43.600, 5.030], L('miramas')]],
    [2, 'D16', [S, [43.655, 5.130], L('aurons'), L('vernegues'), L('mallemort')]],
    [1, 'D569', [L('eyguieres'), [43.650, 5.030], L('miramas')]],
    [2, 'D17', [S, [43.660, 5.050], L('eyguieres')]],
    [2, 'D69', [S, [43.625, 5.100], L('ba701'), L('lancon')]],
    [2, 'D70', [L('cornillon'), L('saint_chamas'), L('miramas_le_vieux'), L('miramas')]],
    [2, 'D10', [L('lancon'), [43.520, 5.150], L('berre')]],
    [2, 'D73', [L('aerodrome'), L('eyguieres')]],
  ];
  const ways = []; let fake = 1;
  const cle = (p) => p.map(v => v.toFixed(4)).join(',');
  const ids = new Map();
  for (const [classe, ref, pts] of axes) ways.push({ ids: pts.map(p => { const k = cle(p); if (!ids.has(k)) ids.set(k, fake++); return ids.get(k); }), pts: pts.map(p => P(p[0], p[1])), classe, nom: null, ref });
  return construireGraphe(ways, { tol: 10, unite });
}

faireSalon();
faireRegion();
