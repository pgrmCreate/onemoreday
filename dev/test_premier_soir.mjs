// Le premier soir (docs/HISTOIRE_DEBUT_V3.md §3) et l'équilibre des durées : l'horloge tenue, le lit de feuilles, les gestes.
import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { normaliserJoueur } from '../js/game/player.js';
import { REGLAGES } from '../js/data/reglages.js';
import * as clock from '../js/core/clock.js';
import { dureeRepas, dormir, categorieCouchage, demarrerSurvie, arreterSurvie } from '../js/game/survival.js';
import { dureeBarreMs } from '../js/game/crafting.js';
import { dureeConstructionMs, etatConstruction } from '../js/game/construction.js';
import { matinSuivant, solRefuse } from '../js/game/sommeil_regles.js';
import { CONSTRUCTIONS } from '../js/data/construction.js';
import { MISSIONS } from '../js/data/histoire/missions.js';
import { QUETES } from '../js/data/histoire/quetes.js';
import { ITEMS } from '../js/data/items.js';

nouvellePartie({ nom: 'Soir', mode: 'solo', seed: 5 });
normaliserJoueur(G.player);
const p = G.player;
demarrerSurvie();

// ─── L'horloge s'arrête à la tombée du jour ───
const tenue = REGLAGES.temps.TENUE_DEBUT;
G.world.horlogeTenue = tenue;
clock.avancer(40);
assert.equal(G.world.minutes, REGLAGES.temps.DEPART_MINUTES + 40, 'avant le cap, le temps passe');
clock.avancer(600);
assert.equal(G.world.minutes, tenue, 'le premier soir, on ne dépasse pas la tombée du jour');
clock.avancer(30);
assert.equal(G.world.minutes, tenue, 'même un saut de temps reste bloqué');
delete G.world.horlogeTenue;
clock.avancer(30);
assert.equal(G.world.minutes, tenue + 30, 'une fois endormi, l’heure repart');

// ─── Le premier réveil ───
assert.equal(matinSuivant(1185), 1440 + 420, 'le matin qui suit le premier soir : le jour 2 à 7 h');
assert.equal(matinSuivant(1440 + 100), 1440 + 420, 'endormi après minuit : 7 h du même jour');

// ─── La première nuit ne s'arrête pas au plafond du couchage ───
p.fatigue = 42; p.faim = 62; p.soif = 72;
const avant = G.world.minutes;
const nuit = dormir(11, { force: true, silencieux: true, sur: true, couchage: 'mauvais', respecterBloc: true, ignorerPlafond: true });
assert.equal(nuit.dormi, 660, '11 h de sommeil sur un lit de feuilles');
assert.equal(G.world.minutes, avant + 660);
assert.equal(Math.round(p.fatigue), REGLAGES.survie.SOMMEIL.COUCHAGE.mauvais.plafond, 'mais on ne récupère pas plus que le couchage ne le permet');
assert.ok(p.soif > 20 && p.faim > 20, `le matin, on a faim et soif sans être en danger (faim ${Math.round(p.faim)}, soif ${Math.round(p.soif)})`);

// ─── Dormir par terre ───
assert.equal(solRefuse('sol', 42), true, 'fatigué·e, on ne dort pas à même le sol');
assert.equal(solRefuse('sol', 12), false, 'épuisé·e, si');
assert.equal(solRefuse('mauvais', 42), false, 'un lit de feuilles suffit');
assert.equal(categorieCouchage('lit_feuilles'), 'mauvais', 'c’est un mauvais couchage, mais un couchage');

// ─── Le petit campement ───
for (const t of ['toit_bache', 'lit_feuilles']) assert.equal(etatConstruction(t, p).competences.length, 0, `${t} : aucune compétence requise`);
assert.ok(CONSTRUCTIONS.lit_feuilles.lit && !CONSTRUCTIONS.lit_feuilles.bloque, 'on dort sur le lit de feuilles, et on marche dessus');
assert.ok(CONSTRUCTIONS.lit_feuilles.ingredients.every(x => ITEMS[x.id]), 'ses matériaux existent');
assert.deepEqual(['fourgon', 'bois', 'coin', 'dormir'].filter(e => QUETES.q_debut.etapes[e]).length, 4, 'les quatre étapes du premier soir');
assert.equal(MISSIONS.m_fourgon.etapes[0].type, 'prendre');
assert.deepEqual(MISSIONS.m_fourgon.etapes[0].ids, ['sac_a_dos', 'bache_plastique']);

// ─── Les durées : ce qui se voit ───
const repas = (id, pts = 1e3) => dureeRepas({ id }, pts);
assert.ok(repas('chips') < repas('conserve_haricots'), 'un paquet de chips se mange plus vite qu’une conserve');
assert.ok(repas('barre_cereales') < repas('chips'), 'une barre de céréales, plus vite encore');
assert.ok(repas('conserve_haricots') >= 12000, 'une conserve prend plus de 12 s');
assert.ok(dureeRepas({ id: 'conserve_haricots', reste: 0.5, ouvert: 0 }, 1e3) < repas('conserve_haricots'), 'finir une boîte entamée est plus rapide : elle est ouverte');
assert.ok(dureeBarreMs(5) >= 5000, 'un bandage ne se fait pas en 2 secondes');
assert.ok(dureeBarreMs(2) >= REGLAGES.craft.BARRE_MIN_MS, 'aucune fabrication sous le minimum');
assert.ok(dureeBarreMs(600) <= REGLAGES.craft.BARRE_MAX_MS, 'ni au-dessus du maximum');
assert.equal(Math.round(dureeConstructionMs('toit_bache', p)), 12000, 'un toit de bâche : 12 s');
arreterSurvie();
console.log('Premier soir : horloge tenue, réveil au matin, sol refusé, campement et durées vérifiés.');
