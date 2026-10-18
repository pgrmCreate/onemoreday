// Refuges sûrs (F03) : l'Empéri et la Tour de l'Horloge. Vrai simulateur, vrais plans.
//   - tant que le refuge est habité, aucun mort n'entre (grille fermée cognée, grille ouverte, joueur dans le seuil) ;
//   - la porte gardée se referme derrière les joueurs, sans enfermer personne ;
//   - du dehors, on ne t'ouvre pas tant qu'un mort rôde devant le portail ;
//   - au siège (sonnailles), le refuge n'est plus habité et ses figurants sont partis ;
//   - une sauvegarde de l'ancienne version (2) est migrée : intrus retiré, grille refaite, objets et constructions gardés.
// node dev/test_refuges.mjs
import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { creerSimLieu } from '../js/explore/sim.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { icase, FIN, K } from '../js/carte/catalogue.js';
import { statsCombat } from '../js/game/stats_combat.js';
import { PNJ } from '../js/data/histoire/pnj.js';
import emperi from '../js/data/niveaux/emperi.js';
import tour from '../js/data/niveaux/tour_horloge.js';
import { refugeHabite, pieceProtegee } from '../js/explore/refuge.js';

nouvellePartie({ seed: 11 });
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); console.log('  ok   :', m); };
const NE = parserNiveau(emperi), NT = parserNiveau(tour);
const grille = NE.portes.find(p => p.nom === 'la porte du château');
const chene = NT.portes.find(p => p.nom === 'la petite porte de la tour');
const pieceDe = (niv, z) => { const E = niv.etages[niv.etageIdx[z.etage]]; const i = icase(E, z.x, z.y); return i >= 0 && E.piece[i] >= 0 ? niv.pieces[E.piece[i]] : null; };
const dansSur = (niv, z) => { const P = pieceDe(niv, z); return !!(P && P.sansMorts); };
const dansSeuil = (niv, z, p) => { const E = niv.etages[niv.etageIdx[z.etage]]; const i = icase(E, z.x, z.y); return i >= 0 && E.code[i] === K.PORTE && E.porte[i] === p.idx; };

function simuler(niv, flags, { joueurs = [{ id: 'p', x: 31.5, y: 31.5 }], ouvrir = null, bruit = null, approcher = null, etat = null, duree = 120000, controle = null } = {}) {
  const sim = creerSimLieu({ lieuId: niv.id, niveau: niv, seed: 'refuge', mortsN: [0, 2], getFlag: (k) => flags[k], minutes: 23 * 60, etat });
  for (const j of joueurs) sim.ajouterJoueur(j.id, { etage: 'rdc', x: j.x, y: j.y, dir: 0 }, { stats: statsCombat(G.player) });
  if (ouvrir) sim.porte(ouvrir.cle, 'ouvrir', joueurs[0].id);
  if (approcher) for (const [k, z] of sim.zombies().entries()) { z.x = approcher.x + (k % 3) - 1; z.y = approcher.y + Math.floor(k / 3) * 0.8; }
  let t = 0, entres = 0, seuil = 0;
  while (t < duree) {
    if (bruit && t % 3000 === 0) sim.bruit({ etage: 'rdc', x: bruit.x, y: bruit.y, rayon: 25 });
    sim.tick(50); t += 50;
    for (const z of sim.zombies()) { if (dansSur(niv, z)) entres++; if (ouvrir && dansSeuil(niv, z, ouvrir)) seuil++; }
    if (controle) controle(sim, t);
  }
  return { sim, entres, seuil };
}

console.log('\n== Empéri habité : rien ne passe la grille');
{
  const f = { emp_entree_ok: true };
  let r = simuler(NE, f, { bruit: { x: 31.5, y: 31.5 }, approcher: { x: 31.5, y: 39.5 } });
  ok(r.entres === 0 && r.sim.instantane().portes[grille.cle].pv === 120, 'grille fermée, morts attirés par un combat dans le porche : aucun mort entré, grille intacte');
  r = simuler(NE, f, { ouvrir: grille, bruit: { x: 31.5, y: 31.5 }, approcher: { x: 31.5, y: 39.5 } });
  ok(r.entres === 0 && r.sim.instantane().portes[grille.cle].etat === 'fermee', 'grille laissée ouverte : refermée par les gardes, aucun mort entré');
  r = simuler(NE, f, { joueurs: [{ id: 'p', x: 31.5, y: 36.5 }], ouvrir: grille, bruit: { x: 31.5, y: 36.5 }, approcher: { x: 31.5, y: 39.5 } });
  ok(r.entres === 0 && r.seuil === 0, 'joueur planté dans le seuil, grille ouverte, 2 min de morts attirés : aucun mort dans le seuil ni dedans');
  ok(r.sim.instantane().portes[grille.cle].etat === 'ouverte', '… et la grille reste ouverte tant que le joueur se tient dans l’embrasure');
}

console.log('\n== Deux joueurs de part et d’autre : personne n’est enfermé');
{
  const f = { emp_entree_ok: true };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'deux', mortsN: [0, 0], getFlag: (k) => f[k], minutes: 12 * 60 });
  for (const z of sim.zombies().slice()) sim.zombies().splice(sim.zombies().indexOf(z), 1);
  const a = sim.ajouterJoueur('a', { etage: 'rdc', x: 31.5, y: 33.5, dir: 0 }, { stats: statsCombat(G.player) });
  const b = sim.ajouterJoueur('b', { etage: 'rdc', x: 31.5, y: 39.5, dir: 0 }, { stats: statsCombat(G.player) });
  ok(sim.porte(grille.cle, 'ouvrir', 'a').ok, 'le joueur du dedans ouvre');
  for (let t = 0; t < 3000; t += 50) sim.tick(50);
  ok(sim.instantane().portes[grille.cle].etat === 'fermee', 'personne dans l’embrasure : la grille se referme');
  ok(a.x === 31.5 && a.y === 33.5 && b.x === 31.5 && b.y === 39.5, 'aucun joueur déplacé par la fermeture');
  ok(sim.porte(grille.cle, 'ouvrir', 'b').ok, 'parvis dégagé : le joueur du dehors peut rouvrir et rentrer');
}

console.log('\n== Le portail : pas d’ouverture avec un mort devant');
{
  const f = { emp_entree_ok: true };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'parvis', mortsN: [0, 0], getFlag: (k) => f[k], minutes: 12 * 60 });
  sim.ajouterJoueur('b', { etage: 'rdc', x: 31.5, y: 39.5, dir: 0 }, { stats: statsCombat(G.player) });
  const z = sim.zombies()[0]; z.x = 34.5; z.y = 40.5; z.etat = 'erre';
  const r = sim.porte(grille.cle, 'ouvrir', 'b');
  ok(!r.ok && r.raison === 'parvis' && /Mehdi/.test(r.message || ''), 'un mort à 4 unités : « On n’ouvre pas avec des morts devant la grille ! »');
  sim.zombies().length = 0;
  ok(sim.porte(grille.cle, 'ouvrir', 'b').ok, 'parvis dégagé : la grille s’ouvre');
  const f2 = {};
  const s2 = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'av', mortsN: [0, 0], getFlag: (k) => f2[k], minutes: 12 * 60 });
  for (let t = 0; t < 1500; t += 50) s2.tick(50);
  const devant = s2.zombies().filter(q => Math.hypot(q.x - 31.5, q.y - 36.5) < 8);
  ok(devant.length >= 3, `avant l’accueil, ${devant.length} morts attendent devant la grille`);
}

console.log('\n== Le siège : le château n’est plus un refuge, ses figurants sont partis');
{
  const sieges = { emp_entree_ok: true, sonnailles_commencees: true };
  const r = simuler(NE, sieges, { bruit: { x: 31.5, y: 31.5 }, duree: 60000 });
  ok(r.entres > 0, `au siège, la horde passe la grille (${r.entres} présences de morts dans les murs) : le refuge n’est plus habité`);
  const figurants = NE.pnj.filter(p => p.si);
  const condOk = (si, fl) => [].concat(si.flag || []).every(k => fl[k]) && ![].concat(si.pasFlag || []).some(k => fl[k]);
  ok(figurants.length >= 8 && figurants.every(p => !condOk(p.si, sieges)), `les ${figurants.length} PNJ du château ne sont plus là au siège`);
  ok(!condOk(PNJ.vidal.si, sieges) && !condOk(PNJ.lou_emperi.si, sieges), 'Vidal et Lou non plus (ils parlent dans les scènes du siège)');
  ok(figurants.every(p => condOk(p.si, { emp_entree_ok: true })), 'avant les sonnailles, le camp est là');
}

console.log('\n== Une sauvegarde de la version 2 : migrée, rien de perdu');
{
  const etat = {
    v: 1, planV: 2, minutes: 12 * 60, uid: 50,
    zombies: [{ uid: 'z1', type: 'errant', etage: 'rdc', x: 31.5, y: 30.5, etat: 'erre' }, { uid: 'z2', type: 'errant', etage: 'rdc', x: 20.5, y: 47.5, etat: 'erre' }],
    portes: { [grille.cle]: { etat: 'cassee', pv: 0, pvMax: 120 } },
    sol: [{ id: 'chiffon', qty: 7, etage: 'rdc', x: 20.5, y: 47.5 }, { id: 'bandage', qty: 1, etage: 'rdc', x: 20.5, y: 47.5 }, { id: 'pile', qty: 2, etage: 'rdc', x: 33.5, y: 21.5 }, { id: 'piles', qty: 1, etage: 'rdc', x: 33.5, y: 21.5 }],
    conteneurs: { 'rdc:22,15': { items: [{ id: 'conserve_haricots', qty: 1 }], progres: 1 } },
    eau: { 'rdc:42,23': 3.5 },
    constructions: [{ uid: 'c1', type: 'coffre', etage: 'rdc', x: 30, y: 46, rot: 0, pv: 60, items: [{ id: 'chiffon', qty: 2 }] }],
    cadavres: [], retires: [], joues: [], condFaits: [],
  };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'mig', mortsN: [0, 0], getFlag: (k) => ({ emp_entree_ok: true })[k], minutes: 12 * 60, etat });
  const s = sim.instantane();
  ok(!sim.zombies().some(z => dansSur(NE, z)), 'l’intrus du porche est retiré');
  ok(s.portes[grille.cle].etat === 'fermee' && s.portes[grille.cle].pv === 120, 'la grille cassée est refaite');
  const E = NE.etages[0], H = E.h / FIN;
  const sol = sim.sauver(12 * 60).sol;
  ok(sol.filter(o => ['chiffon', 'bandage'].includes(o.id)).every(o => o.y < H && !E.bloque[icase(E, o.x, o.y)]), 'objets posés dans l’ancienne montée : ramenés sur une case libre du nouveau plan');
  ok(sol.find(o => o.id === 'chiffon').qty === 7 && sol.some(o => o.id === 'bandage'), 'quantités intactes (7 chiffons, le bandage)');
  const relog = sol.filter(o => ['chiffon', 'bandage'].includes(o.id));
  ok(new Set(relog.map(o => `${Math.floor(o.x)},${Math.floor(o.y)}`)).size === relog.length, 'les objets relogés ne sont pas empilés sur une seule case');
  const restes = sol.filter(o => ['pile', 'piles'].includes(o.id));
  ok(restes.length === 2 && restes.every(o => o.x === 33.5 && o.y === 21.5), 'une pile posée à une place toujours valable ne bouge pas');
  const sv = sim.sauver(12 * 60);
  ok(sv.conteneurs['rdc:25,15'] && sv.conteneurs['rdc:25,15'].items[0].id === 'conserve_haricots' && !sv.conteneurs['rdc:22,15'], 'la table déplacée garde ce qu’il en restait (pas de nouveau butin)');
  ok(sv.eau && sv.eau['rdc:36,24'] === 3.5, 'le tonneau déplacé garde son niveau d’eau');
  const c = sim.constructions()[0];
  ok(c && c.y + 1 <= H && c.items[0].qty === 2, `le coffre construit est gardé, avec son contenu, à une place libre (${c.x},${c.y})`);
  ok(sv.planV === 3, 'l’état sauvé est désormais en version 3');
}

console.log('\n== Aucun déplacement de mort ne traverse un seuil gardé (poussée, séparation)');
{
  const f = { emp_entree_ok: true };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'pousse', mortsN: [0, 0], getFlag: (k) => f[k], minutes: 12 * 60 });
  sim.ajouterJoueur('p', { etage: 'rdc', x: 31.5, y: 36.5, dir: 0 }, { stats: statsCombat(G.player) });   // dans le seuil : la grille reste ouverte
  sim.porte(grille.cle, 'ouvrir', 'p'); sim.tick(50);
  const z = sim.zombies()[0]; z.x = 31.5; z.y = 37.6;
  sim.repousserZombies([z.uid], { x: 31.5, y: 40.5 });
  ok(!dansSur(NE, z) && !dansSeuil(NE, z, grille), `poussé de 4 unités vers la grille ouverte : il s’arrête devant (${z.x.toFixed(1)}, ${z.y.toFixed(1)}), ni dans le seuil ni dans le porche`);
  const [a, b] = sim.zombies(); a.x = b.x = 31.5; a.y = b.y = 37.4;
  for (let t = 0; t < 2000; t += 50) sim.tick(50);
  ok(!sim.zombies().some(q => dansSur(NE, q) || dansSeuil(NE, q, grille)), 'deux morts serrés contre la grille ouverte : la séparation n’en fait passer aucun');
}

console.log('\n== Migration : des constructions qui ne se superposent pas');
for (const ordre of ['invalide d’abord', 'valable d’abord']) {
  const c1 = { uid: 'c1', type: 'coffre', etage: 'rdc', x: 30, y: 46, rot: 0, pv: 60, items: [{ id: 'chiffon', qty: 3 }] };        // dans l’ancienne montée
  const c2 = { uid: 'c2', type: 'coffre', etage: 'rdc', x: 30, y: 43, rot: 0, pv: 60, items: [{ id: 'bandage', qty: 2 }] };        // toujours valable
  const c3 = { uid: 'c3', type: 'coffre', etage: 'rdc', x: 40, y: 45, rot: 1, pv: 60, items: [{ id: 'piles', qty: 1 }] };          // tourné (1 × 2), à reloger
  const etat = { v: 1, planV: 2, minutes: 720, uid: 9, zombies: [], portes: {}, conteneurs: {}, eau: {}, cadavres: [], retires: [], joues: [], condFaits: [],
    constructions: ordre === 'valable d’abord' ? [c2, c1, c3] : [c1, c3, c2],
    sol: [{ id: 'chiffon', qty: 4, etage: 'rdc', x: 30.5, y: 47.5 }, { id: 'clou', qty: 9, etage: 'rdc', x: 31.5, y: 46.5 }] };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'mig2', mortsN: [0, 0], getFlag: () => undefined, minutes: 720, etat });
  const cs = sim.constructions();
  const cases = new Map();
  for (const c of cs) { const [w, h] = c.rot % 2 ? [1, 2] : [2, 1]; for (let y = c.y; y < c.y + h; y++) for (let x = c.x; x < c.x + w; x++) cases.set(`${x},${y}`, (cases.get(`${x},${y}`) || 0) + 1); }
  ok(cs.length === 3 && [...cases.values()].every(v => v === 1), `${ordre} : trois coffres, aucune emprise superposée`);
  ok(cs.find(c => c.uid === 'c2').x === 30 && cs.find(c => c.uid === 'c2').y === 43, `${ordre} : le coffre déjà bien placé ne bouge pas`);
  ok(cs.find(c => c.uid === 'c1').items[0].qty === 3 && cs.find(c => c.uid === 'c3').items[0].id === 'piles' && cs.find(c => c.uid === 'c2').items[0].qty === 2, `${ordre} : contenus conservés`);
  const sol = sim.sauver(720).sol.filter(o => ['chiffon', 'clou'].includes(o.id));
  ok(sol.every(o => !cases.has(`${Math.floor(o.x)},${Math.floor(o.y)}`)), `${ordre} : aucun objet relogé sous un coffre`);
}

console.log('\n== Le portail en entrant : un joueur du dehors ne passe pas, même grille ouverte du dedans');
{
  const f = { emp_entree_ok: true };
  const sim = creerSimLieu({ lieuId: 'emperi', niveau: NE, seed: 'entre', mortsN: [0, 0], getFlag: (k) => f[k], minutes: 12 * 60 });
  sim.ajouterJoueur('hote', { etage: 'rdc', x: 31.5, y: 35.2, dir: 0 }, { stats: statsCombat(G.player) });
  const inv = sim.ajouterJoueur('inv', { etage: 'rdc', x: 31.5, y: 38.2, dir: 0 }, { stats: statsCombat(G.player) });
  ok(sim.porte(grille.cle, 'ouvrir', 'hote').ok, 'l’hôte, dedans, ouvre pour sortir');
  const z = sim.zombies()[0]; z.x = 35.5; z.y = 39.5; z.etat = 'erre';
  sim.viderEvenements && sim.viderEvenements();
  sim.majJoueur('inv', { etage: 'rdc', x: 31.5, y: 36.2 });   // dans le seuil (porte mince : y 36,0 → 36,5)
  const evs = sim.tick(50);
  const saut = sim.majJoueur('inv', { etage: 'rdc', x: 31.5, y: 35.4 }), evs2 = sim.tick(50);   // et d'un grand pas par-dessus le seuil
  ok(inv.y === 38.2 && evs2.some(e => e.type === 'recale' && e.joueur === 'inv'), 'un grand pas qui saute le seuil jusque dans le porche : refusé aussi');
  ok(inv.y === 38.2 && evs.some(e => e.type === 'recale' && e.joueur === 'inv' && /Mehdi/.test(e.message || '')), 'l’invité du dehors avance dans le seuil avec un mort devant : position refusée, recalé, message de Mehdi');
  sim.majJoueur('hote', { etage: 'rdc', x: 31.5, y: 36.2 }); sim.majJoueur('hote', { etage: 'rdc', x: 31.5, y: 38.0 });
  ok(sim.joueur('hote').y === 38.0, 'l’hôte sort sans être retenu');
  sim.zombies().length = 0;
  sim.majJoueur('inv', { etage: 'rdc', x: 31.5, y: 36.2 }); sim.majJoueur('inv', { etage: 'rdc', x: 31.5, y: 35.0 });
  ok(inv.y === 35.0, 'parvis dégagé : l’invité entre');
}

console.log('\n== Le sommeil voit le refuge habité (pièces protégées seulement)');
{
  const cour = { etage: 'rdc', x: 31.5, y: 20.5 }, montee = { etage: 'rdc', x: 20.5, y: 40.5 };
  const paisible = (k) => ({ emp_entree_ok: true })[k], siege = (k) => ({ emp_entree_ok: true, sonnailles_commencees: true })[k];
  ok(refugeHabite(NE, paisible) && pieceProtegee(NE, cour), 'cour d’honneur, château habité : à l’abri');
  ok(!pieceProtegee(NE, montee), 'la montée, dehors : pas protégée');
  ok(!refugeHabite(NE, siege), 'au siège : le château ne protège plus personne');
}

console.log('\n== La Tour : la porte de chêne, même ouverte');
{
  const f = { pro_signal: true, prologue_fini: true };
  const r = simuler(NT, f, { joueurs: [{ id: 'p', x: 27.5, y: 21.5 }], ouvrir: chene, bruit: { x: 27.5, y: 21.5 } });
  ok(r.entres === 0, 'porte laissée ouverte, morts de la place attirés : aucun mort au pied de l’escalier');
}

console.log(`\n${n}/${n} vérifications réussies.`);
