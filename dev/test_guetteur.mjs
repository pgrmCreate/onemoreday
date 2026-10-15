import assert from 'node:assert/strict';
import { nouvellePartie, G, setG } from '../js/core/state.js';
import * as missions from '../js/game/missions.js';
import { itineraire } from '../js/travel/geo.js';
import { preparerVoyage } from '../js/travel/preparer_voyage.js';
import { lambdas } from '../js/travel/rencontres_voyage.js';

nouvellePartie({ nom: 'Guetteur', seed: 32 });
const params = { de: 'cornillon', vers: 'lancon', minutesDepart: 480 };
const base = preparerVoyage(params);
assert.equal(preparerVoyage({ ...params, guetteur: true }).guetteur, false);
for (const etat of ['active', 'echouee', 'refusee']) {
  G.world.missions = { m_guetteur: { etat, i: 0, d: {} } };
  assert.equal(preparerVoyage({ ...params, guetteur: true }).disponible, false, etat);
}
// Vraie réussite du moteur, puis ancienne sauvegarde sans nouveau drapeau.
G.world.missions.m_guetteur = { etat: 'active', i: 0, d: {} };
// Le récit est une interface navigateur : ce test exécute les effets sans lancer sa minuterie d'affichage.
const minuterie = globalThis.setTimeout;
try { globalThis.setTimeout = () => 0; missions.reussirEtape('m_guetteur'); }
finally { globalThis.setTimeout = minuterie; }
assert.equal(G.world.missions.m_guetteur.etat, 'reussie');
assert.match(G.journal.map(j => j.texte).join(' '), /mistral.*chemins du guetteur/);
const original = JSON.stringify(itineraire(params.de, params.vers));
const prudent = preparerVoyage({ ...params, guetteur: true });
assert.equal(prudent.guetteur, true);
assert.ok(prudent.iti.metres > base.iti.metres && prudent.duree > base.duree);
assert.ok(prudent.risque.esperance < base.risque.esperance);
const nuit = { ...params, minutesDepart: 0 };
assert.ok(preparerVoyage({ ...nuit, guetteur: true }).risque.cran < preparerVoyage(nuit).risque.cran,
  'la jauge baisse lorsque l’exposition franchit un seuil');
assert.ok(preparerVoyage({ ...nuit, guetteur: true }).risque.raisons.includes('de nuit'),
  'le cahier ne masque pas les facteurs de danger');
assert.match(prudent.risque.raisons.join(' '), /guetteur/);
assert.equal(JSON.stringify(itineraire(params.de, params.vers)), original, 'route mémorisée intacte');
const urbain = { de: 'cimetiere', vers: 'tour_horloge' };
assert.deepEqual(preparerVoyage({ ...urbain, guetteur: true }), preparerVoyage(urbain), 'aucun bonus urbain');
const scene = preparerVoyage({ de: 'cornillon', vers: 'vernegues', guetteur: true, contourner: true });
assert.ok(scene.rencontres.some(r => r.scripte && r.def.id === 'rh_ch2_lion'), 'scène imposée conservée');

// Une fixture avec une vraie rencontre aléatoire repérable ; même tirage, même position, même contournement.
let repere;
for (let seed = 1; seed <= 100 && !repere; seed++) {
  G.world.seed = seed;
  const p = preparerVoyage({ ...params, guetteur: true });
  if (p.repere) repere = p;
}
assert.ok(repere, 'fixture avec rencontre visible aux jumelles');
const affiche = preparerVoyage({ ...repere.params, contourner: true });
const depart = preparerVoyage(affiche.params);
assert.deepEqual(depart, affiche, 'mêmes paramètres : fiche et départ strictement identiques');
assert.equal(affiche.rencontres.filter(r => r.hostile).length, repere.rencontres.filter(r => r.hostile).length - 1);
assert.equal(affiche.iti.metres, repere.iti.metres + affiche.detourRepere);
assert.equal(affiche.repere.d, repere.repere.d);
assert.ok(affiche.risque.esperance <= repere.risque.esperance);
assert.ok(affiche.rencontres.every(r => r.d <= affiche.iti.metres));

// Persistance des paramètres, mode invité et surpoids identique entre estimation et déplacement.
G.player.position = { mode: 'voyage', voyage: affiche.params };
setG(JSON.parse(JSON.stringify(G)));
assert.deepEqual(preparerVoyage(G.player.position.voyage), affiche);
G.mode = 'invite';
assert.equal(preparerVoyage({ ...params, guetteur: true }).disponible, true);
G.player.inventaire = [{ id: 'planche', qty: 100 }];
const charge = preparerVoyage({ ...params, guetteur: true });
assert.ok(charge.v.mParMin < prudent.v.mParMin, 'le surpoids est inclus dans l’aperçu');

// Les migrations amplifient toujours les rencontres : le cahier ne les supprime pas.
const expositionAvant = lambdas(charge.iti, charge.ctx).reduce((n, x) => n + x.lambda, 0);
G.world.flags.ruee_type = 'sirenes'; G.world.flags.ruee_zone = 'villages'; G.world.flags.ruee_fin = 999999;
G.world.flags.ruee_connue = true;
const migration = preparerVoyage({ ...params, guetteur: true });
assert.equal(migration.risque.inconnu, true, 'migration connue toujours signalée');
assert.ok(lambdas(migration.iti, migration.ctx).reduce((n,x) => n+x.lambda,0)
  > expositionAvant, 'les sirènes augmentent encore l’exposition');
console.log('Guetteur : réussite réelle, anciennes parties, région/ville, durée/risque, scènes, jumelles, déterminisme, persistance, invité et charge vérifiés.');
