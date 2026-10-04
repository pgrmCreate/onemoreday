// Régénère la liste de précache de sw.js (tout le jeu hors-ligne, sauf dev/, tools/, docs/ et l'audio lourd).
// Usage : node tools/generer_sw.mjs
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const racine = fileURLToPath(new URL('..', import.meta.url));
const inclure = ['index.html', 'manifest.webmanifest', 'css', 'js', 'fonts', 'icons', 'zombies', 'img'];
const liste = ['./'];
function parcourir(rel) {
  const abs = join(racine, rel);
  if (rel.split(/[\\/]/).join('/').startsWith('img/cine')) return;          // plaques de cinématique : chargées à la demande (6 Mo)
  if (statSync(abs).isDirectory()) { for (const f of readdirSync(abs).sort()) parcourir(join(rel, f)); return; }
  if (/\.(js|css|html|woff2|svg|png|jpg|webp|webmanifest|json)$/.test(rel)) liste.push('./' + rel.replace(/\\/g, '/'));
}
inclure.forEach(parcourir);
const sw = readFileSync(join(racine, 'sw.js'), 'utf8');
const v = (Number((sw.match(/onemoreday-v(\d+)/) || [])[1]) || 14) + 1;
const nouveau = sw
  .replace(/const CACHE = 'onemoreday-v\d+';/, `const CACHE = 'onemoreday-v${v}';`)
  .replace(/const FICHIERS = \[[\s\S]*?\n\];/, `const FICHIERS = [\n${liste.map(f => `  '${f}',`).join('\n')}\n];`);
writeFileSync(join(racine, 'sw.js'), nouveau);
console.log(`sw.js : ${liste.length} fichiers, cache v${v}`);
