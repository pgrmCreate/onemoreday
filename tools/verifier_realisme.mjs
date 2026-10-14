#!/usr/bin/env node
// Réalisme des bâtiments d'un plan d'exploration (docs/RETOURS_JOUEUR.md, P15) : bâtiment par bâtiment (pièces
// d'intérieur reliées par des portes et des escaliers), ce qu'il contient d'essentiel, et ce qui manque.
//   - tout bâtiment où l'on vit ou travaille a des toilettes (un WC, pas seulement un lavabo) ;
//   - un logement (des lits, et une pièce qui dit chambre, maison, séjour…) a aussi un point d'eau pour se laver et de quoi cuisiner ;
//   - une pièce nommée « toilettes », « sanitaires », « salle de bain », « salle d'eau » a son WC (ou sa baignoire).
// Seul le cœur dessiné à la main est vérifié (les maisons des abords sont générées par js/carte/abords.js, qui suit ces
// règles). Un bâtiment qui n'en a pas besoin (église, hangar, cave, ruine, garage…) se déclare dans le plan :
// `sansSanitaires: ['Le nom d'une de ses pièces', …]` (ou `sansSanitaires: true` pour tout le lieu).
// Usage : node tools/verifier_realisme.mjs [id …] [--tout]   (--tout : affiche aussi les bâtiments sans défaut)
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (rel) => import(pathToFileURL(path.join(RACINE, rel)));
const { asciiVersPlan } = await imp('js/carte/ascii.js');
const { compilerPlan } = await imp('js/carte/compiler.js');
const { K, FIN } = await imp('js/carte/catalogue.js');

const args = process.argv.slice(2);
const tout = args.includes('--tout');
const filtre = args.filter(a => !a.startsWith('--'));
const DOSSIER = path.join(RACINE, 'js/data/niveaux');
let fichiers = readdirSync(DOSSIER).filter(f => f.endsWith('.js') && !f.startsWith('_'));
if (filtre.length) fichiers = fichiers.filter(f => filtre.includes(f.replace(/\.js$/, '')));

const WC = new Set(['wc']), LAVER = new Set(['lavabo', 'baignoire']), CUIRE = new Set(['cuisine']);
const LITS = new Set(['lit', 'lit_simple', 'lit_camp', 'matelas']);
const SURFACE_MIN = 24;   // unités² (≈ 15 m²) : en dessous, un cabanon, une guérite, un placard
const NOM_WC = /toilettes|sanitaires|\bwc\b/i, NOM_EAU = /salle de bain|salle d.eau/i;
const NOM_LOGEMENT = /chambre|maison|logement|séjour|salon|loge\b|salle commune|appartement|\bb2\d/i;
const PAS_LOGEMENT = /dortoir|chambrée|chambre froide|chambre \d|chambre de garde|hôtel|box|infirmerie|sonneurs|cloches/i;

function compiler(def) {
  if (def.format === 'couches' && def.plan) return compilerPlan(def.plan, def);
  return compilerPlan(asciiVersPlan(def, () => {}), def);
}

let nDefauts = 0;
for (const f of fichiers.sort()) {
  const def = (await import(pathToFileURL(path.join(DOSSIER, f)))).default;
  const id = f.replace(/\.js$/, '');
  if (def.sansSanitaires === true) { if (tout) console.log(`· ${id} : exempté (sansSanitaires: true)`); continue; }
  const exempts = new Set((def.sansSanitaires || []).map(n => n.normalize('NFC')));
  let niv;
  try { niv = compiler(def); } catch (e) { console.log(`✗ ${id} : compilation impossible — ${e.message}`); nDefauts++; continue; }
  // ---------- les bâtiments : composantes de pièces d'intérieur (portes, escaliers) ----------
  const parent = niv.pieces.map((_, i) => i);
  const racine = (i) => (parent[i] === i ? i : (parent[i] = racine(parent[i])));
  const unir = (a, b) => { a = racine(a); b = racine(b); if (a !== b) parent[b] = a; };
  const interieur = (p) => p >= 0 && !niv.pieces[p].exterieur;
  for (const E of niv.etages) {
    const { w, h } = E;
    for (let i = 0; i < w * h; i++) {
      if (E.code[i] !== K.PORTE) continue;
      const x = i % w, y = (i / w) | 0, voisins = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let k = 1; k <= 2; k++) { // une porte a l'épaisseur d'un mur fin : on regarde jusqu'à deux petites cases
          const nx = x + dx * k, ny = y + dy * k; if (nx < 0 || ny < 0 || nx >= w || ny >= h) break;
          const p = E.piece[ny * w + nx]; if (p >= 0) { voisins.push(p); break; }
        }
      }
      const ints = voisins.filter(interieur);
      for (let k = 1; k < ints.length; k++) unir(ints[0], ints[k]);
    }
  }
  // escaliers : la pièce d'un escalier à un étage rejoint la pièce à la même place à l'étage où il mène
  for (const E of niv.etages) {
    const ed = (def.etages || []).find(e => e.id === E.id) || E;
    for (let i = 0; i < E.w * E.h; i++) {
      const c = E.code[i]; if (c !== K.ESC_MONTE && c !== K.ESC_DESCEND) continue;
      const vers = c === K.ESC_MONTE ? (E.monte || ed.monte) : (E.descend || ed.descend); const E2 = vers && niv.etages[niv.etageIdx[vers]];
      const p = E.piece[i]; if (!E2 || !interieur(p)) continue;
      const x = i % E.w, y = (i / E.w) | 0;
      for (let r = 0; r <= 3 * FIN; r++) {
        let trouve = -1;
        for (let dy = -r; dy <= r && trouve < 0; dy++) for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= E2.w || ny >= E2.h) continue;
          const q = E2.piece[ny * E2.w + nx]; if (interieur(q)) { trouve = q; break; }
        }
        if (trouve >= 0) { unir(p, trouve); break; }
      }
    }
  }
  // ---------- ce que contient chaque bâtiment ----------
  const bat = new Map();
  const B = (p) => { const r = racine(p); if (!bat.has(r)) bat.set(r, { pieces: new Set(), surface: 0, types: new Set() }); return bat.get(r); };
  niv.pieces.forEach((P, i) => { if (!interieur(i)) return; const b = B(i); b.pieces.add(i); b.surface += P.n; });
  for (const m of niv.meubles) {
    const E = niv.etages[niv.etageIdx[m.etage]]; if (!E) continue;
    // la pièce sous le meuble, sinon une pièce voisine (le meuble bloque, mais sa case garde sa pièce)
    let p = -1;
    const cx = Math.floor((m.x0 + m.x1 + 1) / 2 * FIN), cy = Math.floor((m.y0 + m.y1 + 1) / 2 * FIN);   // meubles en unités, grille fine
    for (let r = 0; r <= 2 * FIN && p < 0; r++) for (let dy = -r; dy <= r && p < 0; dy++) for (let dx = -r; dx <= r && p < 0; dx++) {
      const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < E.w && y < E.h && E.piece[y * E.w + x] >= 0) p = E.piece[y * E.w + x];
    }
    if (interieur(p)) { B(p).types.add(m.type); niv.pieces[p].types = (niv.pieces[p].types || new Set()).add(m.type); }
  }
  const lignes = [];
  for (const b of bat.values()) {
    const noms = [...b.pieces].map(i => niv.pieces[i].nom).filter(Boolean);
    if (noms.some(n => exempts.has(n.normalize('NFC')))) continue;
    const a = (S) => [...S].some(t => b.types.has(t));
    const manque = [];
    if (b.surface >= SURFACE_MIN && !a(WC)) manque.push('pas de WC');
    // un logement (des lits, et une pièce qui dit chambre, maison, logement, séjour…) : un point d'eau pour se laver et de
    // quoi cuisiner. Un dortoir de fortune, un hôpital, une caserne, un hôtel ne sont pas des logements.
    const logement = a(LITS) && noms.some(n => NOM_LOGEMENT.test(n)) && !noms.some(n => PAS_LOGEMENT.test(n));
    if (logement && !a(LAVER)) manque.push('un logement sans point d’eau pour se laver');
    if (logement && !a(CUIRE) && b.surface >= SURFACE_MIN) manque.push('un logement sans cuisine');
    for (const i of b.pieces) {
      const P = niv.pieces[i]; if (!P.nom) continue;
      const t = P.types || new Set();
      if (NOM_WC.test(P.nom) && !t.has('wc')) manque.push(`« ${P.nom} » sans WC`);
      if (NOM_EAU.test(P.nom) && !t.has('wc') && !t.has('baignoire') && !t.has('lavabo')) manque.push(`« ${P.nom} » sans rien pour se laver`);
    }
    if (!manque.length && !tout) continue;
    const titre = noms.length ? noms.slice(0, 4).join(', ') + (noms.length > 4 ? '…' : '') : '(pièces sans nom)';
    lignes.push(`   ${manque.length ? '✗' : '✓'} ${titre} — ${Math.round(b.surface)} u²${manque.length ? ' : ' + manque.join(' ; ') : ''}`);
    nDefauts += manque.length ? 1 : 0;
  }
  if (lignes.length) { console.log(`${id}`); for (const l of lignes) console.log(l); }
}
console.log(nDefauts ? `\n${nDefauts} bâtiment(s) à revoir.` : '\nTous les bâtiments sont équipés.');
process.exit(0);
