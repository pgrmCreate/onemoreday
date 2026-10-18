import assert from 'node:assert/strict';
import { nouvellePartie, G, setG } from '../js/core/state.js';
import { aUneAlarme, prochaineAlarme, premierReveil, planNaturel, planSommeil, bruitSommeil, minutesRepos, mortAudible } from '../js/game/sommeil_regles.js';
import { dormir, demarrerSurvie, arreterSurvie } from '../js/game/survival.js';

nouvellePartie({ seed: 31 });
for (const montre of [null, 'montre', 'montre_digitale']) {
  G.player.equip.poignet = montre;
  assert.equal(aUneAlarme(G.player), montre === 'montre_digitale');
}
assert.equal(prochaineAlarme('07:00', 22 * 60), 31 * 60);
assert.equal(prochaineAlarme('07:00', 7 * 60), 31 * 60);
assert.equal(prochaineAlarme('07:00', 6 * 60 + 50), null);
assert.equal(prochaineAlarme('07:10', 0), null);
assert.equal(prochaineAlarme('24:00', 0), null);
assert.deepEqual(planSommeil(2), planNaturel(), 'ancienne durée arbitraire ne devient pas une alarme');
assert.deepEqual(planSommeil({ alarme: Infinity, regleePar: 'a' }), planNaturel());
const a = { alarme: 600, regleePar: 'a' }, b = { alarme: 610, regleePar: 'b' };
assert.deepEqual(premierReveil(a, b), a);
assert.deepEqual(premierReveil(planNaturel(), b), b);
assert.deepEqual(planSommeil(JSON.parse(JSON.stringify(b))), b);
assert.equal(bruitSommeil().niveau, 0);
for (const etat of ['fait_le_mort', 'immobile', 'dort']) assert.equal(mortAudible({ hp: 10, etat }), false);
for (const etat of ['erre', 'alerte', 'chasse', 'cogne']) assert.equal(mortAudible({ hp: 10, etat }), true);
assert.equal(mortAudible({ hp: 0, etat: 'erre' }), false);
assert.ok(bruitSommeil({ morts: 3 }).niveau > 0);
assert.equal(bruitSommeil({ meteo: 'brouillard' }).niveau, 0);
assert.ok(bruitSommeil({ meteo: 'orage', abrite: true }).niveau < bruitSommeil({ meteo: 'orage' }).niveau);
assert.ok(bruitSommeil({ alarme: true }).sources.includes('une alarme de voiture'));
assert.equal(bruitSommeil({ morts: 100, alarme: true, ruee: true }).niveau, 1);

demarrerSurvie();
const resultats = [];
for (const couchage of ['sol', 'mauvais', 'moyen', 'correct']) for (const bruit of [0, 0.6]) {
  nouvellePartie({ seed: 31 }); G.player.fatigue = 20; G.player.faim = G.player.soif = 100;
  const n = minutesRepos(G.player, couchage, bruit), avant = G.world.minutes;
  const r = dormir(n / 60, { force: true, silencieux: true, sur: true, couchage, bruit });
  assert.equal(r.dormi, n);
  assert.equal(G.world.minutes - avant, n);
  assert.ok(r.plafond);
  assert.equal(minutesRepos(G.player, couchage, bruit), 0);
  const clone = JSON.parse(JSON.stringify(G)); setG(clone);
  assert.equal(dormir(1, { force: true, silencieux: true, couchage }).ok, false, 'rechargement au plafond');
  resultats.push({ couchage, bruit, minutes: n, fatigue: G.player.fatigue });
}
for (const couchage of ['sol', 'mauvais', 'moyen', 'correct']) {
  const lignes = resultats.filter(r => r.couchage === couchage);
  assert.ok(lignes[1].minutes > lignes[0].minutes, 'le bruit allonge le sommeil');
}
nouvellePartie(); G.player.fatigue = 20;
const avant = G.world.minutes;
assert.equal(dormir(0.25, { force: true, sur: true, silencieux: true, couchage: 'correct' }).dormi, 15);
assert.equal(G.world.minutes - avant, 15);
arreterSurvie();
console.log(JSON.stringify({ ok: true, resultats }));
