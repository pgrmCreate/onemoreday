// La boîte d'Aimé (F04) : promise à la fin de m_aime, déterrée une seule fois au pied du troisième frêne de la Touloubre.
import assert from 'node:assert/strict';
import { nouvellePartie, G, setFlag } from '../js/core/state.js';
import { verifier as verifierCondition } from '../js/game/conditions.js';
import { MISSIONS } from '../js/data/histoire/missions.js';
import * as M from '../js/game/missions.js';
import { DECLENCHEURS } from '../js/data/histoire/declencheurs.js';
import { SCENES } from '../js/data/histoire/scenes.js';
import { parserNiveau } from '../js/explore/niveau.js';
import touloubre from '../js/data/niveaux/touloubre.js';

// La fin d'Aimé ne donne plus les provisions : elle promet la boîte.
const fin = MISSIONS.m_aime.fin.effets;
assert.deepEqual(fin.objets.map(o => o[0]).sort(), ['canne_peche', 'nasse'], 'la fin donne la canne et la nasse seulement');
assert.equal(fin.flag, 'aime_cache_promise', 'la fin pose la promesse');

// La boîte est au sol, au pied du troisième frêne après la passerelle (rive est), sur une case libre.
const n = parserNiveau(touloubre);
const m = n.marqueurs.cache_aime;
assert.ok(m, 'marqueur cache_aime posé');
const fresnes = n.meubles.filter(x => x.nom === 'le frêne');
assert.equal(fresnes.length, 3, 'trois frênes');
assert.ok(fresnes.some(f => f.x0 === m.x && f.y0 === m.y - 1), 'le marqueur est au pied d’un frêne');
assert.ok(!n.meubles.some(x => m.x >= x.x0 && m.x <= x.x1 && m.y >= x.y0 && m.y <= x.y1), 'on peut se tenir sur la case de la boîte');

// Le déclencheur : seulement après la promesse, plus jamais une fois la boîte prise ; il n'est pas « unique » (une
// partie fermée en pleine scène ne perd pas la boîte).
const d = DECLENCHEURS.find(x => x.quand === 'marqueur' && x.marqueur === 'cache_aime');
assert.ok(d && d.lieu === 'touloubre' && !d.unique && SCENES[d.scene], 'déclencheur à la Touloubre, scène existante');
nouvellePartie({ nom: 'Aimé', mode: 'solo', seed: 3 });
assert.equal(verifierCondition(d.si), false, 'pas de boîte avant la promesse');
G.world.missions = { m_aime: { etat: 'reussie' } };
assert.equal(verifierCondition(d.si), false, 'ancienne partie déjà récompensée : pas de seconde boîte');
setFlag('aime_cache_promise', true);
assert.equal(verifierCondition(d.si), true, 'après la promesse, on peut creuser');
assert.deepEqual(SCENES[d.scene].choix[0].effets, { mission: ['cache', 'm_aime'] }, 'la scène demande la boîte à l’hôte');

// L'attribution elle-même, exécutée plusieurs fois : l'hôte creuse, puis l'invité (deux demandes, comme deux appuis
// presque simultanés arrivés après). Un seul lot au total ; l'invité reçoit le message « déjà prise ».
const livraisons = [];
M.brancherCoopMissions({ relais: () => {}, livrer: (l) => livraisons.push(l), lieuAutre: () => 'touloubre' });
G.mode = 'hote';
const compte = () => G.player.inventaire.filter(it => it.id === 'poisson_fume').reduce((n, it) => n + (it.qty || 1), 0);
M.effet(['cache', 'm_aime']);
assert.equal(compte(), 2, 'l’hôte reçoit le lot');
assert.equal(G.world.flags.aime_cache_prise, true, 'la boîte est marquée prise par l’hôte');
M.recevoirOp({ op: 'cache', id: 'm_aime' }); M.recevoirOp({ op: 'cache', id: 'm_aime' });
assert.equal(compte(), 2, 'pas de second lot chez l’hôte');
assert.equal(livraisons.length, 2, 'deux réponses à l’invité');
assert.ok(livraisons.every(l => !l.effets && /plus rapide/.test(l.texte)), 'l’invité ne reçoit que le message « déjà prise »');
assert.equal(verifierCondition(d.si), false, 'une fois prise, la boîte n’est plus proposée');

// Dans l'autre sens : l'invité arrive le premier chez l'hôte, il reçoit le lot ; la demande suivante ne donne rien.
nouvellePartie({ nom: 'Aimé', mode: 'hote', seed: 4 }); setFlag('aime_cache_promise', true); livraisons.length = 0;
M.recevoirOp({ op: 'cache', id: 'm_aime' }); M.recevoirOp({ op: 'cache', id: 'm_aime' });
assert.equal(livraisons.filter(l => l.effets).length, 1, 'un seul lot livré à l’invité');
assert.deepEqual(livraisons[0].effets.objets.map(o => o[0]).sort(), ['alcool_fort', 'conserve_raviolis', 'poisson_fume'], 'la boîte contient les provisions');
assert.equal(compte(), 0, 'l’hôte n’a rien reçu');

// Chez l'invité, le geste part chez l'hôte : rien n'est donné ni marqué localement.
const relais = [];
M.brancherCoopMissions({ relais: (op) => relais.push(op), livrer: () => {}, lieuAutre: () => null });
nouvellePartie({ nom: 'Aimé', mode: 'invite', seed: 5 }); setFlag('aime_cache_promise', true);
M.effet(['cache', 'm_aime']);
assert.deepEqual(relais, [{ op: 'cache', id: 'm_aime' }], 'l’invité relaie sa demande');
assert.equal(compte(), 0, 'l’invité ne se sert pas lui-même');
assert.notEqual(G.world.flags.aime_cache_prise, true, 'l’invité ne vide pas la boîte lui-même');
M.brancherCoopMissions(null);

console.log('Boîte d’Aimé : promesse, emplacement, ancienne partie, attribution unique par l’hôte (hôte puis invité, invité puis invité, relais) vérifiés.');
