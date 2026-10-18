// Régressions : anciennes rues pivotées, possessions, repli et reprise solo/hôte/invité.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parserNiveau } from '../js/explore/niveau.js';
import { FIN, K, icase } from '../js/carte/catalogue.js';
import { creerSimLieu } from '../js/explore/sim.js';
import { tailleConstruction } from '../js/data/construction.js';
import { lieu } from '../js/game/donnees.js';
import { nouvellePartie, G } from '../js/core/state.js';
import { planCelluleV0 } from '../js/travel/errance_v0.js';
import { decoder, planCellule, preparerRepriseErrance, reseau, idCellule, idImpasse, reel, coteLateral } from '../js/travel/errance.js';

const fixtures = JSON.parse(readFileSync(new URL('fixtures/errance_v0.json', import.meta.url))).rues;
const charger = (id, n, etat) => creerSimLieu({ lieuId: id, niveau: n, etat, seed: 7, minutes: 500, mortsN: [0, 0], repeuplement: 0 }).sauver();
const contenu = s => {
  const items = [...s.sol.filter(o => o.id), ...Object.values(s.conteneurs).flatMap(c => c.items || []), ...s.constructions.flatMap(c => c.items || []), ...s.cadavres.flatMap(c => c.items || [])];
  return items.map(({ uid, etage, x, y, ...it }) => JSON.stringify(it)).sort();
};
const libre = (n, p, w = 1, h = 1) => {
  const E = n.etages[n.etageIdx[p.etage]];
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const i = icase(E, Math.floor(p.x) + xx + 0.5, Math.floor(p.y) + yy + 0.5);
    assert.ok(i >= 0 && !E.bloque[i] && E.code[i] === K.SOL, `position accessible ${p.etage}:${p.x},${p.y}`);
  }
};
for (const f of fixtures) {
  const original = structuredClone(f.etat), ancien = parserNiveau(f.plan), n = parserNiveau(planCellule(f.id));
  assert.equal(n.planVersion, 1, 'la version ASCII arrive bien au compilateur');
  assert.deepEqual(parserNiveau(planCelluleV0(f.id, decoder(f.id))).meubles.map(m => [m.cle, m.type]), ancien.meubles.map(m => [m.cle, m.type]), 'la reconstruction v0 correspond au vrai plan conservé');
  const s = charger(f.id, n, f.etat);
  assert.deepEqual(f.etat, original, 'la sauvegarde source reste intacte');
  assert.equal(s.planV, 1);
  assert.deepEqual(contenu(s), contenu(original), 'aucun objet perdu, altéré ou dupliqué');
  for (const p of [...s.sol, ...s.cadavres, ...s.zombies]) libre(n, p);
  for (const c of s.constructions) libre(n, c, ...tailleConstruction(c.type, c.rot));
  for (const cle of Object.keys(s.conteneurs)) assert.ok(n.meubleParCle[cle]?.conteneur, `conteneur retrouvé : ${cle}`);
  assert.equal(s.retires.length, original.retires.length, 'meuble démonté conservé');
  for (const cle of s.retires) assert.ok(n.meubleParCle[cle]);
  assert.ok(Object.values(s.conteneurs).some(c => c.progres === 1 && !c.items.length), 'un conteneur vidé reste vide');
  assert.ok(s.sol.some(o => o.id === 'clous' && o.qty === 17), 'contenu orphelin récupérable au sol');
  const reload = charger(f.id, n, s);
  assert.deepEqual(contenu(reload), contenu(s), 'pas de deuxième migration après rechargement');
  assert.deepEqual(reload.constructions, s.constructions);
}

// Chaque orientation, y compris les impasses : reprendre le joueur et son retour une seule fois.
for (const e of reseau().aretes.values()) for (const id of [idCellule(e, 0), idImpasse(e)]) {
  const p = { position: { mode: 'lieu', lieu: id, etage: 'rue', x: 12.5, y: 12.5 }, errance: { retour: { cellule: idCellule(e, 0), cote: 'e' } } };
  assert.equal(preparerRepriseErrance(p), null);
  const n = parserNiveau(planCellule(id)), E = n.etages[0];
  assert.ok(p.position.x >= 0 && p.position.x < E.w / FIN && p.position.y >= 0 && p.position.y < E.h / FIN);
  assert.equal(p.errance.retour.cote, coteLateral(e));
  const once = structuredClone(p); preparerRepriseErrance(p); assert.deepEqual(p, once);
}
const id = 'troncon:place_crousillat~tour_horloge:0', c = decoder(id);
const pEntree = { position: { mode: 'lieu', lieu: id, entree: 'o' } };
preparerRepriseErrance(pEntree); assert.equal(pEntree.position.entree, reel(c.e, false, 'o'));
const supprime = 'troncon:pharmacie_carnot~tour_horloge:0';
assert.equal(decoder(supprime), null);
for (const depart of ['tour_horloge', 'pharmacie_carnot']) {
  const p = { position: { mode: 'lieu', lieu: supprime }, errance: { depart: { lieu: depart, arete: 'pharmacie_carnot~tour_horloge' } } };
  assert.deepEqual(preparerRepriseErrance(p), { lieu: depart, provenance: true });
  assert.equal(p.position.lieu, depart, 'la provenance explicite prime sur le tri alphabétique');
}
const sansProvenance = { position: { mode: 'lieu', lieu: supprime, etage: 'rue', x: 41.5, y: 12.5 } };
assert.deepEqual(preparerRepriseErrance(sansProvenance), { lieu: 'tour_horloge', provenance: false });
assert.equal(preparerRepriseErrance({ position: { mode: 'lieu', lieu: 'troncon:invalide' } }).lieu, 'cimetiere');
const autre = { position: { mode: 'lieu', lieu: 'tour_horloge', x: 3, y: 2 } };
const copie = structuredClone(autre); assert.equal(preparerRepriseErrance(autre), null); assert.deepEqual(autre, copie);

// Exécuter les vraies fonctions de reprise, sans lancer le DOM du menu principal.
const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const reprise = main.slice(main.indexOf('async function reprendrePosition()'), main.indexOf('// ---------- Mort ----------'))
  .replace('export async function demarrerInvite', 'async function demarrerInvite');
for (const mode of ['solo', 'hote', 'invite']) {
  nouvellePartie({ mode, seed: 7 });
  G.player.position = { mode: 'lieu', lieu: supprime, x: 41.5, y: 12.5 };
  const entrees = [], messages = [];
  const api = runInNewContext(reprise + ';({reprendrePosition,demarrerInvite})', {
    G, preparerRepriseErrance, console, cacherEcran() {}, demarrerSystemes() {},
    flow: { lieuDe: lieu, explorer: async l => entrees.push(l), toast: m => messages.push(m) },
  });
  if (mode === 'invite') await api.demarrerInvite({ position: G.player.position, neuf: false, avant: async () => G.player.position });
  else await api.reprendrePosition();
  assert.deepEqual(entrees, ['tour_horloge']);
  assert.match(messages[0], /point de repli/, 'le repli inconnu n’est pas présenté comme une provenance connue');
}
console.log('Errance : migration v0, possessions, conteneurs, constructions, reprise et repli solo/hôte/invité vérifiés.');
