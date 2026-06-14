// Outil dev : génère 3 galeries HTML (5 créatures chacune) pour affichage inline.
// Usage : node tools/gen_widget.mjs  → écrit tools/zwidget_1.html .. _3.html
import { svgCombatZombie } from '../js/art/combat_art.js';
import { ZOMBIES } from '../js/data/zombies.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const NEW = new Set(['ecolier', 'policier', 'rat_geant']);
const GROUPES = [
  ['ecolier', 'policier', 'rat_geant'],
  ['errant', 'rampant', 'coureur', 'enrage'],
  ['gonfle', 'hurleur', 'putrefie', 'traqueur'],
  ['chien_infecte', 'colosse', 'brule'],
  ['nuee_rats'],
];

const STYLE = `<style>
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
.zg{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;padding:8px 0}
.zg figure{margin:0;border:1px solid #26262c;border-radius:12px;overflow:hidden}
.zg figure.n{border-color:#7a3038}
.zg .c{aspect-ratio:3/4;display:flex;align-items:flex-end;justify-content:center;background:linear-gradient(#262b38,#0c0d12)}
.zg .c svg{width:100%;height:100%;display:block}
.zg figcaption{font-size:12px;text-align:center;padding:5px 4px;color:#cfc9b8;background:#0a0b10}
.zg figure.n figcaption{color:#e8868d}
@media (max-width:640px){.zg{grid-template-columns:repeat(3,1fr)}}
</style>`;

const dir = path.dirname(fileURLToPath(import.meta.url));
GROUPES.forEach((ids, gi) => {
  const tiles = ids.map(id => {
    const nom = (ZOMBIES[id] && ZOMBIES[id].nom) || id;
    return `<figure class="${NEW.has(id) ? 'n' : ''}"><div class="c">${svgCombatZombie(id)}</div>` +
      `<figcaption>${nom}${NEW.has(id) ? ' · nouveau' : ''}</figcaption></figure>`;
  }).join('');
  const html = `${STYLE}\n<h2 class="sr-only">Créatures de combat de One More Day, groupe ${gi + 1}, rendues en SVG.</h2>\n<div class="zg">${tiles}</div>`;
  const f = path.join(dir, `zwidget_${gi + 1}.html`);
  fs.writeFileSync(f, html, 'utf8');
  console.log(`zwidget_${gi + 1}.html`, html.length, 'octets');
});
