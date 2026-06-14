// Outil de build : assemble js/art/combat_creatures.js à partir d'une ou plusieurs
// sorties JSON de workflow (functionSource par créature). Plusieurs fichiers = fusion :
// le DERNIER qui contient une créature gagne (sert à ne rafraîchir que quelques zombies).
// Usage : node tools/build_creatures.js <out1.json> [out2.json ...]
const fs = require('fs');
const path = require('path');

const outs = process.argv.slice(2);
if (!outs.length) { console.error('Donne au moins un fichier output JSON.'); process.exit(1); }
const result = [];
const idx = new Map(); // id -> position dans result (pour écraser)
for (const out of outs) {
  const j = JSON.parse(fs.readFileSync(out, 'utf8'));
  for (const c of (j.result || [])) {
    if (idx.has(c.id)) result[idx.get(c.id)] = c; // écrase par la version la plus récente
    else { idx.set(c.id, result.length); result.push(c); }
  }
}

// Ordre canonique du bestiaire (12 existants + 3 nouveaux) → nom de fonction attendu.
const ORDRE = [
  ['errant', 'zErrant'], ['rampant', 'zRampant'], ['coureur', 'zCoureur'],
  ['enrage', 'zEnrage'], ['gonfle', 'zGonfle'], ['hurleur', 'zHurleur'],
  ['putrefie', 'zPutrefie'], ['chien_infecte', 'zChien'], ['colosse', 'zColosse'],
  ['brule', 'zBrule'], ['nuee_rats', 'zNueeRats'], ['traqueur', 'zTraqueur'],
  ['ecolier', 'zEcolier'], ['policier', 'zPolicier'], ['rat_geant', 'zRatGeant'],
];

const parId = new Map(result.map(c => [c.id, c]));
const manquants = ORDRE.filter(([id]) => !parId.has(id));
if (manquants.length) { console.error('Créatures manquantes :', manquants.map(m => m[0]).join(', ')); process.exit(1); }

const entete = `// ============ Créatures de combat — SVG autonomes (fond transparent) ============
// Chaque zombie est une image indépendante, centrée en x=0 et posée sur la ligne de sol
// (translate(150,346)), à incruster par-dessus le décor. Tous les ids SVG sont préfixés
// par le zid (paramètre p) pour cohabiter dans le DOM. Palette désaturée : chair morte,
// os, sang, braise. 12 morts d'origine redessinés + écolier, policier et rat géant.
// (Fichier assemblé par tools/build_creatures.js — voir ce script pour régénérer.)
`;

const registre = 'export const CREATURES = {\n' +
  ORDRE.map(([id, fn]) => `  ${id}: ${fn},`).join('\n') +
  '\n};\n';

const fonctions = ORDRE.map(([id, fn]) => {
  const c = parId.get(id);
  let src = (c.functionSource || '').trim();
  // Filet de sécurité : un nom de fonction divergent casserait le registre.
  if (!src.startsWith('function ' + fn + '(') && !src.startsWith('function ' + fn + ' (')) {
    // tolère un nom différent : on le renomme vers le nom attendu
    src = src.replace(/^function\s+\w+\s*\(/, 'function ' + fn + '(');
  }
  return src;
}).join('\n\n');

const contenu = entete + '\n' + registre + '\n' + fonctions + '\n';
const dest = path.join(__dirname, '..', 'js', 'art', 'combat_creatures.js');
fs.writeFileSync(dest, contenu, 'utf8');
console.log('Écrit', dest, '—', contenu.length, 'octets,', ORDRE.length, 'créatures.');
