// Le coffre du Leclerc (F02) : ouvrir vite (la sirène réveille le magasin) ou couper la sirène d'abord. Le vacarme, le
// réveil et le journal suivent la variante ACCEPTÉE par l'hôte ; la récompense est donnée une seule fois.
import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { on } from '../js/core/bus.js';
import * as M from '../js/game/missions.js';
import { MISSIONS } from '../js/data/histoire/missions.js';

const ID = 'm_coffre';
const iAgir = MISSIONS[ID].etapes.findIndex(e => e.type === 'agir');
const etape = MISSIONS[ID].etapes[iAgir];
assert.ok(etape.choix && etape.choix.vite && etape.choix.silence, 'le coffre propose deux façons d’ouvrir');
assert.equal(etape.choix.silence.tag, 'visser', 'couper la sirène demande un outil qui visse');
assert.ok(etape.choix.silence.sansOutil, 'sans outil, la raison est écrite');
assert.ok(!/dorment|tous les morts/.test(etape.choix.silence.annonce + etape.choix.silence.journal), 'le silence ne prétend pas que tous les morts dorment');
assert.ok(!/réveillé/.test(MISSIONS[ID].fin.effets.journal) && !/sonnerie/.test(MISSIONS[ID].fin.texte), 'la fin est neutre');

const consequences = [], livraisons = [];
on('mission:consequence', (v) => consequences.push(v));
M.brancherCoopMissions({ relais: () => {}, livrer: (l) => livraisons.push(l), lieuAutre: () => null });   // l'hôte agit chez lui
const partie = (seed) => {
  nouvellePartie({ nom: 'Coffre', mode: 'hote', seed });
  G.world.missions = { [ID]: { etat: 'active', i: iAgir, d: {}, depuis: 0 } };
  consequences.length = 0; livraisons.length = 0;
};
const pistolets = () => G.player.inventaire.filter(it => it.id === 'pistolet_9mm').length;
const journal = () => (G.journal || []).map(j => j.texte).join('\n');

// 1. L'hôte coupe la sirène : pas de vacarme ni de réveil, annonce et journal du silence, un pistolet.
partie(1);
M.reussirEtape(ID, { variante: 'silence' });
assert.equal(consequences.length, 1);
assert.equal(consequences[0].bruit, 0, 'pas de vacarme');
assert.equal(consequences[0].reveil, null, 'pas de réveil');
assert.match(consequences[0].annonce, /se tait/);
assert.match(journal(), /coupé la sirène/);
assert.equal(pistolets(), 1, 'la récompense');
assert.equal(G.world.missions[ID].i, iAgir + 1, 'étape suivante : sortir');
// …puis le geste rapide de l'invité arrive trop tard : ni sirène, ni second pistolet, ni livraison.
M.recevoirOp({ op: 'reussir', id: ID, i: iAgir, variante: 'vite' });
assert.equal(consequences.length, 1, 'le geste dépassé ne fait pas sonner la sirène');
assert.equal(livraisons.length, 0, 'rien n’est livré à l’invité');
assert.equal(pistolets(), 1, 'un seul lot');
assert.equal(G.world.missions[ID].i, iAgir + 1, 'le geste dépassé ne termine pas l’étape « sortir »');

// 2. L'invité ouvre vite le premier : la sirène, le réveil et le lot partent chez LUI, une fois.
partie(2);
M.recevoirOp({ op: 'reussir', id: ID, i: iAgir, variante: 'vite' });
M.recevoirOp({ op: 'reussir', id: ID, i: iAgir, variante: 'silence' });
assert.equal(livraisons.length, 1, 'une seule livraison');
const l = livraisons[0].effets;
assert.equal(l.consequence.bruit, etape.bruit, 'la sirène');
assert.deepEqual(l.consequence.reveil, etape.reveil, 'le magasin se réveille');
assert.match(l.journal, /sirène a réveillé/);
assert.deepEqual(l.objets, etape.effets.objets, 'la récompense habituelle');
assert.equal(consequences.length, 0, 'rien ne sonne chez l’hôte');
assert.equal(pistolets(), 0, 'l’hôte n’a rien reçu');

// 3. Sans variante connue (ancien client), c'est le geste rapide : l'alarme sonne comme avant.
partie(3);
M.reussirEtape(ID);
assert.equal(consequences[0].bruit, etape.bruit);

// 4. Chez l'invité, la réussite part chez l'hôte avec sa variante, une seule fois par étape.
const relais = [];
M.brancherCoopMissions({ relais: (op) => relais.push(op), livrer: () => {}, lieuAutre: () => null });
nouvellePartie({ nom: 'Coffre', mode: 'invite', seed: 4 });
G.world.missions = { [ID]: { etat: 'active', i: iAgir, d: {}, depuis: 0 } };
M.reussirEtape(ID, { variante: 'silence' }); M.reussirEtape(ID, { variante: 'vite' });
assert.deepEqual(relais, [{ op: 'reussir', id: ID, i: iAgir, variante: 'silence' }], 'une demande, avec la variante choisie');
M.brancherCoopMissions(null);

console.log('Coffre du Leclerc : silence, vite, geste dépassé, invité premier, ancien client, relais vérifiés.');
