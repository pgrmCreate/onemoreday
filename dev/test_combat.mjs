// Test headless du combat DANS l'exploration (js/explore/sim.js + combat.js).
// Lancer : node dev/test_combat.mjs   (code ≠ 0 en cas d'échec)
// Un joueur immobile face aux morts, qui frappe au rythme de son arme (pas de poussée) : on vérifie que
// les morts télégraphient, frappent, empoignent, et qu'on en vient à bout selon l'arme.
import { creerSimLieu } from '../js/explore/sim.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { genererEmbuscade } from '../js/explore/embuscade.js';
import { nouvellePartie, G } from '../js/core/state.js';
import * as player from '../js/game/player.js';
import * as inv from '../js/game/inventory.js';
import { statsCombat } from '../js/game/stats_combat.js';
import { ZOMBIES, typeMort } from '../js/data/zombies.js';

let echecs = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { echecs++; console.log('  ÉCHEC :', m); } else console.log('  ok   :', m); };

function combat(arme, types, { pousser = false, seed = 7 } = {}) {
  nouvellePartie({ nom: 'T', mode: 'solo', seed }); player.normaliserJoueur(G.player);
  if (arme) inv.porterObjet({ id: arme, qty: 1 });
  const niveau = parserNiveau(genererEmbuscade({ seed, echelle: 'region' }));
  const sim = creerSimLieu({ lieuId: '__test', niveau, seed, mortsN: [0, 0] });
  const e = niveau.entrees.defaut;
  const st = statsCombat(G.player);
  const j = sim.ajouterJoueur('p', { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5, dir: 0 }, { stats: st });
  const uids = sim.faireApparaitre(types, { joueurId: 'p' });
  const c = { pv: 100, mal: 0, t: 0, ev: {} };
  const compter = (evs) => { for (const ev of evs) { c.ev[ev.type] = (c.ev[ev.type] || 0) + 1; if (ev.type === 'blessure' && ev.joueur === 'p') { c.pv -= ev.degats; c.mal += ev.mal; } if (ev.type === 'saisie') for (let k = 0; k < ev.requis; k++) sim.action('p', { type: 'marteler' }); } };
  let prochain = 0, prochainePoussee = 0;
  while (c.t < 40000 && sim.zombies().some(z => uids.includes(z.uid)) && c.pv > 0 && c.mal < 100) {
    compter(sim.tick(50)); c.t += 50;
    const zs = sim.zombies().filter(z => uids.includes(z.uid)); if (!zs.length) break;
    const z = zs.reduce((a, b) => (Math.hypot(a.x - j.x, a.y - j.y) < Math.hypot(b.x - j.x, b.y - j.y) ? a : b));
    j.dir = Math.atan2(z.y - j.y, z.x - j.x);
    const d = Math.hypot(z.x - j.x, z.y - j.y);
    if (pousser && z.atk && c.t >= prochainePoussee && d < 1.5) { sim.action('p', { type: 'pousser' }); prochainePoussee = c.t + 800; }
    else if (c.t >= prochain && d < 1.6) { sim.action('p', { type: 'frapper', charge: 0 }); prochain = c.t + st.arme.vitesse; }
    compter(sim.viderEvenements());
  }
  c.restants = sim.zombies().filter(z => uids.includes(z.uid)).length;
  return c;
}

console.log('\n== Bestiaire : cinq types, hommes et femmes');
ok(Object.keys(ZOMBIES).length === 5, 'cinq types actifs');
ok(typeMort('militaire') === 'errant' && typeMort('putrefie') === 'errant' && !!ZOMBIES.militaire, 'les anciens ids restent valides (alias)');

console.log('\n== Un errant, immobile, au couteau');
let r = combat('couteau_cuisine', ['errant']);
ok(r.restants === 0 && r.pv > 60, `errant tué en ${(r.t / 1000).toFixed(1)} s, PV ${Math.round(r.pv)}`);

console.log('\n== Deux errants, mains nues');
r = combat(null, ['errant', 'errant']);
ok(r.ev.telegraphe > 0 && r.ev.coup > 0, `ils télégraphient (${r.ev.telegraphe}) et on les touche (${r.ev.coup})`);
ok(r.restants === 0 || r.pv <= 0, `issue : ${r.restants ? 'mort' : 'victoire'} en ${(r.t / 1000).toFixed(1)} s, PV ${Math.round(r.pv)}`);

console.log('\n== Colosse à la batte (sans pousser : il ne bouge pas de toute façon)');
r = combat('batte_baseball', ['colosse']);
ok(r.ev.coup >= 6, `il encaisse (${r.ev.coup} coups), PV restants ${Math.round(r.pv)}, ${r.restants ? 'debout' : 'à terre'}`);

console.log('\n== Groupe (errant ×3 + coureur), pelle à deux mains, en poussant quand ils télégraphient');
r = combat('pelle', ['errant', 'errant', 'errant', 'coureur'], { pousser: true });
ok(r.ev.poussee > 0, `poussées : ${r.ev.poussee}`);
ok(r.restants === 0, `groupe vaincu en ${(r.t / 1000).toFixed(1)} s, PV ${Math.round(r.pv)}`);

console.log('\n== Déterminisme (même graine → même combat)');
const a = combat('machette', ['errant', 'coureur'], { seed: 11 }), b = combat('machette', ['errant', 'coureur'], { seed: 11 });
ok(a.t === b.t && Math.round(a.pv) === Math.round(b.pv), `identique : ${a.t} ms / ${Math.round(a.pv)} PV`);

function arene(seed, arme) {
  nouvellePartie({ nom: 'T', mode: 'solo', seed }); player.normaliserJoueur(G.player);
  if (arme) inv.porterObjet({ id: arme, qty: 1 });
  const niveau = parserNiveau(genererEmbuscade({ seed, echelle: 'region' }));
  const sim = creerSimLieu({ lieuId: '__t', niveau, seed, mortsN: [0, 0] });
  const e = niveau.entrees.defaut;
  const j = sim.ajouterJoueur('p', { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5, dir: 0 }, { stats: statsCombat(G.player) });
  return { sim, j };
}

console.log('\n== Esquive : au moment de la fente, le coup ne porte pas');
{
  const { sim, j } = arene(5);
  sim.faireApparaitre(['errant'], { joueurId: 'p' });
  let esq = 0, parf = 0, bless = 0;
  for (let t = 0; t < 15000; t += 50) {
    for (const ev of sim.tick(50)) { if (ev.type === 'fente') sim.action('p', { type: 'esquiver' }); if (ev.type === 'esquive') { esq++; if (ev.parfaite) parf++; } if (ev.type === 'blessure') bless++; }
    const z = sim.zombies()[0]; if (z) j.dir = Math.atan2(z.y - j.y, z.x - j.x);
  }
  ok(esq >= 3 && bless === 0, `esquives ${esq} (parfaites ${parf}), blessures ${bless}`);
}

console.log('\n== Sans rien faire, il finit par toucher');
{
  const { sim, j } = arene(5);
  sim.faireApparaitre(['errant'], { joueurId: 'p' });
  let bless = 0;
  for (let t = 0; t < 8000; t += 50) { for (const ev of sim.tick(50)) if (ev.type === 'blessure') bless++; const z = sim.zombies()[0]; if (z) j.dir = Math.atan2(z.y - j.y, z.x - j.x); }
  ok(bless >= 2, `blessures en 8 s : ${bless}`);
}

console.log('\n== Enchaînement : le 3e coup frappe plus fort, aucun raté au hasard');
{
  const { sim, j } = arene(6, 'batte_baseball');
  sim.faireApparaitre(['colosse'], { joueurId: 'p' });
  for (let t = 0; t < 3000; t += 50) { sim.tick(50); const z = sim.zombies()[0]; j.dir = Math.atan2(z.y - j.y, z.x - j.x); }
  const coups = []; let rates = 0;
  for (let k = 0; k < 3; k++) { sim.action('p', { type: 'frapper', combo: k }); for (const ev of sim.viderEvenements()) { if (ev.type === 'coup') coups.push(ev); if (ev.type === 'rate') rates++; } sim.tick(50); }
  ok(coups.length === 3 && rates === 0 && coups[2].combo === 2, `coups : ${coups.map(d => d.degats + (d.vacille ? ' (vacille)' : '')).join(' / ')}`);
}

console.log('\n== Coup de grâce sur un mort à terre');
{
  const { sim, j } = arene(8);
  sim.faireApparaitre(['errant'], { joueurId: 'p' });
  for (let t = 0; t < 2000; t += 50) { sim.tick(50); const z = sim.zombies()[0]; j.dir = Math.atan2(z.y - j.y, z.x - j.x); }
  const z = sim.zombies()[0]; z.aTerre = 2000;
  sim.action('p', { type: 'frapper' });
  const c = sim.viderEvenements().find(ev => ev.type === 'coup');
  ok(c && c.achever && c.crit, `coup de grâce : ${c ? c.degats : '—'} dégâts`);
}

console.log(`\n${n - echecs}/${n} vérifications réussies.`);
process.exit(echecs ? 1 : 0);
