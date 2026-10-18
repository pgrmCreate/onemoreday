// Vraie fonction de sortie ; seul le chargement asynchrone et les écrans sont simulés.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const src = readFileSync(new URL('../js/explore/interactions.js', import.meta.url), 'utf8');
const sortir = src.slice(src.indexOf('async function sortirDuLieu('), src.indexOf('// Ce que propose une sortie'))
  .replaceAll("import('../travel/errance_ui.js')", 'charger()');
const cote = src.slice(src.indexOf('function coteSortie('), src.indexOf('export function piece()'));
function banc() {
  let resolve, reject;
  const attente = new Promise((a, b) => { resolve = a; reject = b; });
  const commandes = [], visites = [], messages = [];
  const v = { occupe: false, enPause: false, L: { echelle: 'salon' }, lieuId: 'tour_horloge',
    niveau: { etageIdx: { rue: 0 }, etages: [{ w: 88, h: 48 }] }, j: { etage: 'rue', x: 1, y: 12 }, entrees: { actif: b => commandes.push(b) } };
  const contexte = { V: v, FIN: 2, charger: () => attente, estCellule: () => false, carteEnMain: () => false,
    G: { player: {} }, sauverPartie() {}, console: { warn() {} },
    flow: { explorer: async l => visites.push(l), toast: m => messages.push(m) } };
  contexte.api = { sortir: () => { contexte.V = null; } };
  const agir = runInNewContext(sortir + cote + ';sortirDuLieu', contexte);
  return { agir: () => agir({ etage: 'rue', cx: 0, cy: 12 }), resolve, reject, contexte, v, commandes, visites, messages };
}
{
  const b = banc(); let departs = 0;
  const premier = b.agir(), second = b.agir();
  assert.equal(b.v.occupe, true, 'verrou posé avant le chargement');
  assert.deepEqual(b.commandes, [false]);
  b.resolve({ partirPar: async (id, cote, partir) => { departs++; partir(); return true; } });
  await Promise.all([premier, second]);
  assert.equal(departs, 1, 'un seul départ pour deux interactions');
  assert.equal(b.contexte.V, null);
}
{
  const b = banc(), action = b.agir();
  b.resolve({ partirPar: async () => false }); await action;
  assert.equal(b.v.occupe, false, 'route inconnue : on peut encore jouer');
  assert.deepEqual(b.commandes, [false, true]);
}
{
  const b = banc(), action = b.agir(); b.reject(new Error('chargement interrompu')); await action;
  assert.equal(b.v.occupe, false); assert.deepEqual(b.commandes, [false, true]);
  assert.equal(b.messages.length, 1, 'échec annoncé, sans rejet non traité');
}
{
  const b = banc(), action = b.agir(); let departs = 0; b.contexte.V = null;
  b.resolve({ partirPar: async () => departs++ }); await action;
  assert.equal(departs, 0, 'écran fermé pendant l’import : aucun départ tardif');
}
{
  const b = banc(), action = b.agir(); b.v.enPause = true;
  b.resolve({ partirPar: async () => false }); await action;
  assert.equal(b.v.occupe, false); assert.deepEqual(b.commandes, [false], 'la pause reste respectée');
}
{
  const b = banc(), action = b.agir();
  b.resolve({ partirPar: async (id, cote, partir) => { partir(); throw new Error('rue indisponible'); } }); await action;
  assert.deepEqual(b.visites, ['tour_horloge'], 'un chargement échoué après la sortie revient dans le lieu');
}
console.log('Sortie sans carte : double interaction, route inconnue, erreurs, fermeture et pause vérifiées.');
