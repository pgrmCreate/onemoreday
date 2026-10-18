#!/usr/bin/env node
// Génère js/data/reseau.js : les liaisons à pied entre les lieux (marcher sans carte, js/travel/errance.js).
// Règle : chaque CÔTÉ d'une carte (nord, est, sud, ouest) mène à UN voisin au plus, situé dans cette direction ; la
// liaison est symétrique (le lieu à l'est de A voit A à son ouest). Un côté n'est relié que si la carte du lieu a
// vraiment une sortie sur ce bord. On relie d'abord les paires les plus proches et les mieux alignées, puis on raccroche
// les groupes isolés en tolérant un cap plus oblique. Enfin, une recherche locale force les liaisons qui raccourcissent
// les chemins à pied entre lieux de Salon (le « détour » : chemin sur vol d'oiseau).
// Usage : node tools/generer_reseau.mjs [--ecrire]
import { readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (rel) => import(pathToFileURL(path.join(RACINE, rel)));
const { parserNiveau } = await imp('js/explore/niveau.js');
const { FIN } = await imp('js/carte/catalogue.js');
const { LIEUX_GEO, SALON_SUR_REGION } = await imp('js/data/lieux.js');

const OPP = { n: 's', s: 'n', e: 'o', o: 'e' };
const ANG = { e: 0, n: 90, o: 180, s: -90 };
const K = 111320;
const vec = (a, b) => ({ x: (b.lon - a.lon) * K * Math.cos(a.lat * Math.PI / 180), y: (b.lat - a.lat) * K });
const metres = (a, b) => { const v = vec(a, b); return Math.hypot(v.x, v.y); };

// ---- les côtés de chaque carte qui ont une sortie
export function cotesNiveau(def) {
  const n = parserNiveau(def), cotes = new Set();
  for (const s of n.sorties) {
    const E = n.etages[n.etageIdx[s.etage]], w = E.w / FIN, h = E.h / FIN;
    const d = [['o', s.cx], ['e', w - s.cx], ['n', s.cy], ['s', h - s.cy]].sort((a, b) => a[1] - b[1])[0];
    if (d[1] <= 1.5) cotes.add(d[0]);
  }
  return cotes;
}
const cotes = {};
for (const f of readdirSync(path.join(RACINE, 'js/data/niveaux')).filter(f => f.endsWith('.js') && !f.startsWith('_'))) {
  const def = (await imp('js/data/niveaux/' + f)).default;
  cotes[def.id] = cotesNiveau(def);
}

// ---- les candidats
const geo = Object.entries(LIEUX_GEO).filter(([, g]) => Number.isFinite(g.lat) && Number.isFinite(g.lon)).map(([id, g]) => ({ id, ...g }));
const pres = (g) => metres(g, SALON_SUR_REGION) <= 5200;            // un village aux portes de Salon
function admissible(a, b, d) {
  if (a.echelle === 'salon' && b.echelle === 'salon') return d <= 2500;
  if (a.echelle === 'region' && b.echelle === 'region') return d <= 14000;
  const v = a.echelle === 'region' ? a : b;                        // ville ↔ village : seulement aux portes de Salon
  return pres(v) && d <= 6000;
}
function candidats(tol) {
  const L = [];
  for (const a of geo) for (const b of geo) {
    if (a.id >= b.id) continue;
    const d = metres(a, b); if (!admissible(a, b, d)) continue;
    const v = vec(a, b), ang = Math.atan2(v.y, v.x) * 180 / Math.PI;
    for (const [c, A] of Object.entries(ANG)) {
      const ecart = Math.abs(((ang - A + 540) % 360) - 180);
      if (ecart <= tol) L.push({ a: a.id, b: b.id, ca: c, cb: OPP[c], d, ecart, cout: d * (1 + Math.max(0, ecart - 30) / 30) });
    }
  }
  return L.sort((p, q) => p.cout - q.cout);
}

const C45 = candidats(45), C60 = candidats(60), C70 = candidats(70);
const proche = (k) => k.d <= (LIEUX_GEO[k.a].echelle === 'salon' && LIEUX_GEO[k.b].echelle === 'salon' ? 1200 : 8000);
// Construit le réseau ; forces : des liaisons posées en premier (la recherche locale ci-dessous les choisit).
function construire(forces = []) {
  const pris = {}, liens = [], groupe = new Map(geo.map(g => [g.id, g.id]));
  const racine = (id) => { while (groupe.get(id) !== id) id = groupe.get(id); return id; };
  const libre = (id, c) => !(pris[id] && pris[id][c]) && (!cotes[id] || cotes[id].has(c));
  const deja = (k) => liens.some(l => l.a === k.a && l.b === k.b);
  const essayer = (k) => { if (deja(k) || !libre(k.a, k.ca) || !libre(k.b, k.cb)) return; (pris[k.a] ||= {})[k.ca] = k.b; (pris[k.b] ||= {})[k.cb] = k.a; liens.push(k); groupe.set(racine(k.a), racine(k.b)); };
  for (const k of forces) essayer(k);
  for (const k of C45) essayer(k);                                     // 1. les voisins bien alignés (45° au plus)
  for (const k of C60) if (proche(k)) essayer(k);                      // 2. les côtés encore libres, voisin proche (60°)
  for (const k of C70) if (racine(k.a) !== racine(k.b)) essayer(k);   // 3. raccrocher les groupes isolés (70°)
  return { pris, liens, groupes: new Set(geo.map(g => racine(g.id))).size };
}
// Détour : longueur du chemin à pied (plus court, en mètres) sur la distance à vol d'oiseau, entre lieux de Salon
function detour(liens) {
  const adj = new Map(); for (const l of liens) for (const [p, q] of [[l.a, l.b], [l.b, l.a]]) (adj.get(p) || adj.set(p, []).get(p)).push([q, l.d]);
  const S = geo.filter(g => g.echelle === 'salon'); let tot = 0, n = 0, pire = [0];
  for (const a of S) {
    const dist = new Map([[a.id, 0]]), file = [a.id];
    while (file.length) { file.sort((p, q) => dist.get(p) - dist.get(q)); const x = file.shift(); for (const [y, d] of adj.get(x) || []) if (!dist.has(y) || dist.get(x) + d < dist.get(y)) { dist.set(y, dist.get(x) + d); file.push(y); } }
    for (const b of S) { if (b.id <= a.id) continue; const r = (dist.get(b.id) ?? 1e6) / Math.max(150, metres(a, b)); tot += r; n++; if (r > pire[0]) pire = [r, a.id, b.id]; }
  }
  return { moyen: tot / n, pire };
}
const score = (R) => { const d = detour(R.liens); return d.moyen + d.pire[0] / 10 + (R.groupes - 1) * 100; };
// Recherche locale : on force une liaison candidate (cap ≤ 60°, voisins proches) si le réseau obtenu fait moins de détours.
let forces = [], R = construire(), meilleur = score(R);
console.log('glouton : détour moyen', detour(R.liens).moyen.toFixed(2), 'pire', JSON.stringify(detour(R.liens).pire));
for (let tour = 0, mieux = true; mieux && tour < 6; tour++) {
  mieux = false;
  for (const k of C60.filter(proche)) {
    if (R.liens.some(l => l.a === k.a && l.b === k.b)) continue;
    const F = [...forces, k], R2 = construire(F), s2 = score(R2);
    if (s2 < meilleur - 1e-6) { forces = F; R = R2; meilleur = s2; mieux = true; }
  }
}
const { pris, liens } = R;
const D = detour(liens);
console.log('détour moyen', D.moyen.toFixed(2), 'pire', JSON.stringify([+D.pire[0].toFixed(1), D.pire[1], D.pire[2]]), '·', forces.length, 'liaison(s) forcée(s)');
const isoles = geo.filter(g => !pris[g.id]).map(g => g.id);
console.log(`${liens.length} liaisons, ${R.groupes} groupe(s)${isoles.length ? ', isolés : ' + isoles.join(', ') : ''}`);
for (const g of [...geo].sort((p, q) => p.id.localeCompare(q.id))) {
  const p = pris[g.id] || {};
  console.log(g.id.padEnd(18), [...(cotes[g.id] || [])].sort().join('').padEnd(5), ['n', 'e', 's', 'o'].map(c => `${c}:${(p[c] || '-').padEnd(16)}`).join(' '));
}
for (const l of liens.filter(l => l.ecart > 45)) console.log('oblique :', l.a, l.ca, '→', l.b, Math.round(l.ecart) + '°', Math.round(l.d) + ' m');

if (process.argv.includes('--ecrire')) {
  const lignes = liens.sort((p, q) => (p.a + p.b).localeCompare(q.a + q.b))
    .map(l => `  ['${l.a}', '${l.ca}', '${l.b}'],   // ${Math.round(l.d)} m`);
  writeFileSync(path.join(RACINE, 'js/data/reseau.js'),
`// ============ Le réseau à pied (marcher sans carte) — GÉNÉRÉ par tools/generer_reseau.mjs, à ne pas éditer à la main ============
// Chaque côté d'une carte mène à un voisin au plus, dans cette direction : [lieu A, côté de A, lieu B] (B est relié par
// le côté opposé). Un côté sans liaison n'a pas de route connue : sans carte, on n'y part pas.
export const LIENS = [
${lignes.join('\n')}
];
`);
  console.log('→ js/data/reseau.js écrit');
}
