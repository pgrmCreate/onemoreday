import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { normaliserJoueur } from '../js/game/player.js';
import * as inv from '../js/game/inventory.js';

let sol = [];
function joueur(sac = 'sac_a_dos', inventaire = []) {
  nouvellePartie({ nom: 'Sacs', mode: 'solo', seed: 17 });
  normaliserJoueur(G.player);
  const p = G.player;
  p.inventaire = inventaire; p.equip = { sac }; p.equipEtat = {}; p.accesRapide = [];
  p.position = { mode: 'lieu', lieu: 'cimetiere' }; sol = [];
  inv.setSol({ lister: () => sol, deposer: it => sol.push({ ...it }), prendre: (i, n = 1) => { const it = sol[i]; if (!it) return null; const pris = { ...it, qty: Math.min(n, it.qty) }; it.qty -= pris.qty; if (!it.qty) sol.splice(i, 1); return pris; } });
  return p;
}
const choix = (plan, ancien = 'poser') => ({ ancien, empreinte: plan.empreinte });
let p = joueur('sac_randonnee', [{ id: 'planche', qty: 4 }]);
const avant = JSON.stringify(p), plan = inv.prevoirSac('sac_a_dos', p);
const tableau = p.inventaire, planches = p.inventaire[0];
assert.equal(JSON.stringify(p), avant, 'aperçu sans mutation');
assert.deepEqual(plan.surplus, [{ id: 'planche', qty: 1 }], '24 L dans 20 L : une planche à poser');
assert.equal(plan.garderPossible, false);
assert.equal(inv.porterObjet({ id: 'sac_a_dos', qty: 1 }, p).ok, false, 'pas de changement non confirmé');
assert.equal(JSON.stringify(p), avant);
assert.equal(inv.porterObjet({ id: 'sac_a_dos', qty: 1 }, p, null, choix(plan)).ok, true);
assert.deepEqual(sol, [{ id: 'planche', qty: 1 }, { id: 'sac_randonnee', qty: 1 }]);
assert.equal(inv.countItem('planche', p), 3);
assert.equal(p.inventaire, tableau, 'le tableau conserve son identité');
assert.equal(p.inventaire[0], planches, 'une pile partiellement déposée conserve son identité');
assert.equal(p.equip.sac, 'sac_a_dos');

p = joueur('sac_a_dos', [{ id: 'sac_randonnee', qty: 1 }, { id: 'bandage', qty: 2 }]);
let a = inv.prevoirSac('sac_randonnee', p, 0);
assert.equal(a.garderPossible, true);
assert.equal(inv.equiper(0, p, choix(a, 'garder')).ok, true);
assert.equal(inv.countItem('sac_a_dos', p), 1);
assert.equal(inv.countItem('sac_randonnee', p), 0);
assert.equal(sol.length, 0);
assert.equal(inv.countItem('bandage', p), 2);
assert.equal(JSON.parse(JSON.stringify(p)).equip.sac, 'sac_randonnee', 'forme sauvegardable inchangée');

p = joueur('sac_a_dos', [{ id: 'sac_a_dos', qty: 2 }]);
a = inv.prevoirSac('sac_a_dos', p, 0);
assert.equal(inv.equiper(0, p, choix(a, 'garder')).ok, true);
assert.equal(inv.countItem('sac_a_dos', p), 2, 'même modèle : aucun exemplaire perdu ni créé');
a = inv.prevoirSac('sac_randonnee', p);
p.inventaire.push({ id: 'bandage', qty: 1 });
const change = JSON.stringify(p);
assert.equal(inv.porterObjet({ id: 'sac_randonnee', qty: 1 }, p, null, choix(a)).ok, false);
assert.equal(JSON.stringify(p), change, 'aperçu périmé refusé sans mutation');

p = joueur(null);
assert.equal(inv.porterObjet({ id: 'sac_a_dos', qty: 1 }, p).ok, true, 'premier sac sans confirmation');
sol.push({ id: 'sac_randonnee', qty: 2 });
a = inv.prevoirSac('sac_randonnee', p);
assert.equal((await inv.equiperDepuisSol(0, p, null, choix(a))).ok, true);
assert.equal(sol.find(it => it.id === 'sac_randonnee').qty, 1, 'un seul sac pris dans une pile au sol');
assert.equal(sol.find(it => it.id === 'sac_a_dos').qty, 1);

p = joueur(); p.position = { mode: 'voyage' };
inv.finirTri();
inv.mettreATrier({ id: 'sac_randonnee', qty: 1 });
a = inv.prevoirSac('sac_randonnee', p);
assert.equal(inv.porterATrier(0, p, choix(a)).ok, true);
assert.deepEqual(inv.listeATrier(), [{ id: 'sac_a_dos', qty: 1 }], 'ancien sac à trier en voyage');
assert.equal(sol.length, 0);
console.log('Sacs : aperçu pur, surplus exact, conservation, annulation, état périmé, premier sac, pile au sol et tri vérifiés.');
