// Régressions des transferts partagés : même objet, refus, état d'instance et matériaux atomiques.
import assert from 'node:assert/strict';
import { creerSimLieu } from '../js/explore/sim.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { genererEmbuscade } from '../js/explore/embuscade.js';
import { nouvellePartie, G, joueurNeuf } from '../js/core/state.js';
import { normaliserJoueur } from '../js/game/player.js';
import * as inv from '../js/game/inventory.js';
import * as craft from '../js/game/crafting.js';

nouvellePartie({ nom: 'Hôte', mode: 'hote', seed: 3 });
normaliserJoueur(G.player);
const autre = normaliserJoueur(joueurNeuf('Invité'));
const niveau = parserNiveau(genererEmbuscade({ seed: 3, echelle: 'region' }));
const sim = creerSimLieu({ lieuId: '__objets', niveau, seed: 3, mortsN: [0, 0] });
const e = niveau.entrees.defaut, pos = { etage: e.etage, x: e.x + .5, y: e.y + .5 };
sim.ajouterJoueur('h', pos, {}); sim.ajouterJoueur('i', pos, {});
const temoins = new Set();
const deposer = (id, qty, etat = {}) => { const o = sim.deposer('h', pos, { id, qty, ...etat }); temoins.add(o.uid); return o; };
let image = [];
const rafraichir = () => { image = sim.instantane().sol.filter(o => temoins.has(o.uid)).map(o => ({ ...o })); };
inv.setSol({
  lister: () => image,
  prendre: async (i, qty) => { const o = image[i]; await Promise.resolve(); return o ? sim.prendre('i', '#sol:' + o.uid, 0, qty) : null; },
  deposer: it => deposer(it.id, it.qty, it),
});

deposer('pierre', 1); rafraichir();
const r = await Promise.all([inv.ramasser(0, G.player), inv.ramasser(0, autre)]);
assert.equal(r.reduce((n, x) => n + x.ajoute, 0), 1, 'deux demandes sur le même instantané donnent un seul objet');
assert.equal(sim.instantane().sol.filter(o => temoins.has(o.uid)).length, 0);
assert.equal(await inv.prendreUnAuSol(0), null, 'un repas ne reçoit pas un objet déjà pris');
assert.equal((await inv.equiperDepuisSol(0, autre)).ok, false, 'un équipement refusé ne crée rien');

const biscuits = deposer('biscuits', 2, { reste: .4, ouvert: true }); rafraichir();
const portion = await inv.prendreUnAuSol(0);
assert.equal(portion.qty, 1); assert.equal(portion.reste, .4);
assert.equal(sim.instantane().sol.find(o => o.uid === biscuits.uid).qty, 1, 'la portion restante appartient toujours au monde');

const a = deposer('chiffon', 2), b = deposer('ficelle', 1);
const lot = [{ cle: '#sol:' + a.uid, i: 0, id: 'chiffon', qty: 2 }, { cle: '#sol:' + b.uid, i: 0, id: 'ficelle', qty: 2 }];
assert.equal(sim.prendreLot('h', lot), null);
assert.equal(sim.instantane().sol.find(o => o.uid === a.uid).qty, 2, 'un lot incomplet ne prend pas le premier ingrédient');
lot[1].qty = 1;
assert.equal(sim.prendreLot('h', lot).length, 2);
assert.equal(sim.prendreLot('i', lot), null, 'un seul joueur obtient le lot');

const c = deposer('chiffon', 2);
const proximite = [{ id: 'chiffon', qty: 2, src: { sol: c.uid } }];
inv.setProximite({ lister: () => proximite, prendre: async pris => {
  await Promise.resolve();
  return sim.prendreLot('i', pris.map(x => ({ cle: '#sol:' + x.src.sol, i: 0, id: x.id, qty: x.qty })));
} });
const crafts = await Promise.all([craft.fabriquer('r_bandage_fortune', 1, {}, G.player), craft.fabriquer('r_bandage_fortune', 1, {}, autre)]);
assert.equal(crafts.filter(x => x.ok).length, 1, 'deux fabrications concurrentes ne réutilisent pas les chiffons');
assert.equal(sim.prendreLot('h', [{ cle: '#sol:' + c.uid, i: 0, id: 'chiffon', qty: 2 }]), null);

inv.addItem('chiffon', 1, {}, autre);
const avant = inv.countItem('chiffon', autre);
assert.equal((await inv.preleverIngredients([{ id: 'chiffon', qty: 3 }], autre)).ok, false);
assert.equal(inv.countItem('chiffon', autre), avant, 'un refus distant préserve les matériaux du sac');
console.log('Transferts multijoueurs : concurrence, refus, portion et paiement atomique vérifiés.');
