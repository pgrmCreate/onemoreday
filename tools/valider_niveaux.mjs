#!/usr/bin/env node
// Valide tous les plans d'exploration js/data/niveaux/*.js (format REFONTE §4.2, docs/NIVEAUX.md).
// Usage : node tools/valider_niveaux.mjs [id …] [--avertissements]
// Code de sortie ≠ 0 si au moins une erreur.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = path.join(RACINE, 'js/data/niveaux');
const args = process.argv.slice(2);
const voirAvert = args.includes('--avertissements');
const filtre = args.filter(a => !a.startsWith('--'));

const { validerNiveau, parserNiveau } = await import(pathToFileURL(path.join(RACINE, 'js/explore/niveau.js')));
async function charger(rel, nom) {
  try { return (await import(pathToFileURL(path.join(RACINE, rel))))[nom]; } catch (e) { return null; }
}
const ctx = {
  zombies: await charger('js/data/zombies.js', 'ZOMBIES'),
  documents: await charger('js/data/histoire/documents.js', 'DOCUMENTS'),
  pnj: await charger('js/data/histoire/pnj.js', 'PNJ'),
  items: { ...(await charger('js/data/items.js', 'ITEMS') || {}), ...(await charger('js/data/histoire/objets_quete.js', 'OBJETS_QUETE') || {}), ...(await charger('js/data/clothing.js', 'CLOTHES') || {}) },
  scenes: null,
};
try { const s = await charger('js/data/histoire/scenes.js', 'SCENES'); const r = await charger('js/data/rencontres_scenes.js', 'SCENES_RENCONTRES'); if (s) ctx.scenes = { ...(r || {}), ...s }; } catch (e) {}

let fichiers = [];
try { fichiers = readdirSync(DOSSIER).filter(f => f.endsWith('.js')); } catch (e) { console.log('Aucun dossier js/data/niveaux/'); process.exit(0); }
if (filtre.length) fichiers = fichiers.filter(f => filtre.includes(f.replace(/\.js$/, '')));

let nErr = 0;
for (const f of fichiers.sort()) {
  let def;
  try { def = (await import(pathToFileURL(path.join(DOSSIER, f)))).default; }
  catch (e) { console.log(`✗ ${f} : import impossible — ${e.message}`); nErr++; continue; }
  const id = f.replace(/\.js$/, '');
  const erreurs = validerNiveau(def, ctx);
  if (def && def.id !== id) erreurs.push(`id « ${def && def.id} » ≠ nom de fichier « ${id} »`);
  let resume = '';
  try {
    const n = parserNiveau(def);
    resume = `${n.etages.length} étage(s), ${n.pieces.filter(p => p.nom).length} pièce(s) nommée(s), ${n.meubles.filter(m => m.conteneur).length} conteneur(s), ${n.portes.length} porte(s), ${n.spawns.length} mort(s), ${Object.keys(n.marqueurs).length} marqueur(s)`;
    if (voirAvert) for (const a of n.avertissements) console.log(`   · ${a}`);
  } catch (e) {}
  if (erreurs.length) { nErr += erreurs.length; console.log(`✗ ${id} (${erreurs.length} erreur(s))`); for (const e of erreurs) console.log(`   - ${e}`); }
  else console.log(`✓ ${id} — ${resume}`);
}
console.log(nErr ? `\n${nErr} erreur(s).` : `\n${fichiers.length} plan(s) valide(s).`);
process.exit(nErr ? 1 : 0);
