// Test headless de la CONSTRUCTION dans la simulation d'un lieu (js/explore/sim.js + js/data/construction.js).
// Lancer : node dev/test_construction.mjs   (code ≠ 0 en cas d'échec)
import { creerSimLieu } from '../js/explore/sim.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { genererEmbuscade } from '../js/explore/embuscade.js';
import { nouvellePartie, G } from '../js/core/state.js';
import * as player from '../js/game/player.js';
import { CONSTRUCTIONS } from '../js/data/construction.js';

let echecs = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { echecs++; console.log('  ÉCHEC :', m); } else console.log('  ok   :', m); };
const titre = (t) => console.log(`\n== ${t}`);

nouvellePartie({ nom: 'T', mode: 'solo', seed: 3 }); player.normaliserJoueur(G.player);
const niveau = parserNiveau(genererEmbuscade({ seed: 3, echelle: 'region' }));
let sim = creerSimLieu({ lieuId: '__c', niveau, seed: 3, mortsN: [0, 0] });
const e = niveau.entrees.defaut, E = niveau.etages[niveau.etageIdx[e.etage]];
const j = sim.ajouterJoueur('p', { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5, dir: 0 }, {});
const libre = (x, y) => E.code[y * E.w + x] === 2 && !sim.grilles(e.etage).bloque[y * E.w + x];
// une case libre à 3-6 cases du joueur
function caseLibre(dx0 = 3) { for (let r = dx0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = e.x + dx, y = e.y + dy; if (Math.max(Math.abs(dx), Math.abs(dy)) === r && x > 1 && y > 1 && x < E.w - 2 && y < E.h - 2 && libre(x, y) && libre(x + 1, y) && libre(x, y + 1) && libre(x + 1, y + 1)) return [x, y]; } return null; }

titre('Poser un mur');
const [wx, wy] = caseLibre(3);
let r = sim.construire('p', { type: 'mur_planches', etage: e.etage, x: wx, y: wy, rot: 0, minutes: 600 });
ok(r.ok && sim.grilles(e.etage).bloque[wy * E.w + wx] === 1 && sim.grilles(e.etage).opaque[wy * E.w + wx] === 1, `mur posé en (${wx},${wy}) : il bloque et cache la vue`);
r = sim.construire('p', { type: 'palissade', etage: e.etage, x: wx, y: wy, rot: 0 });
ok(!r.ok && r.raison === 'occupe', 'pas deux constructions sur la même case');
r = sim.construire('p', { type: 'mur_planches', etage: e.etage, x: Math.floor(j.x), y: Math.floor(j.y) });
ok(!r.ok, `pas de mur sur le joueur (${r.raison})`);
r = sim.construire('p', { type: 'barricade_fenetre', etage: e.etage, x: wx + 1, y: wy });
ok(!r.ok && r.raison === 'fenetre', 'une barricade de fenêtre ne se pose que sur une fenêtre');

titre('Porte en planches');
const [px, py] = caseLibre(5);
r = sim.construire('p', { type: 'porte_planches', etage: e.etage, x: px, y: py });
const porte = sim.constructions().find(c => c.uid === r.uid);
ok(r.ok && sim.grilles(e.etage).bloque[py * E.w + px] === 1, 'porte fermée : elle bloque');
sim.agirConstruction('p', porte.uid, 'ouvrir');
ok(sim.grilles(e.etage).bloque[py * E.w + px] === 0, 'porte ouverte : on passe');
sim.agirConstruction('p', porte.uid, 'fermer');
ok(sim.grilles(e.etage).bloque[py * E.w + px] === 1, 'refermée');

titre('Caisse de rangement');
const [cx, cy] = caseLibre(7);
r = sim.construire('p', { type: 'caisse_bois', etage: e.etage, x: cx, y: cy });
const cle = '#c:' + r.uid;
sim.ranger('p', cle, { id: 'conserve_haricots', qty: 3 }); sim.ranger('p', cle, { id: 'conserve_haricots', qty: 2 }); sim.ranger('p', cle, { id: 'biscuits', qty: 1, reste: 0.5 });
let f = sim.fouiller('p', cle);
ok(f.items.length === 2 && f.items[0].qty === 5 && f.items[1].reste === 0.5, `rangé : ${f.items.map(i => `${i.id}×${i.qty}`).join(', ')} (le paquet entamé garde son état)`);
const pris = sim.prendre('p', cle, 0, 2);
ok(pris && pris.qty === 2 && sim.fouiller('p', cle).items[0].qty === 3, 'on reprend 2 conserves, 3 restent');

titre('Les morts cognent et cassent');
const [zx, zy] = caseLibre(9);
const mur2 = sim.construire('p', { type: 'palissade', etage: e.etage, x: zx, y: zy });
const c2 = sim.constructions().find(c => c.uid === mur2.uid);
// un mur continu entre un mort et le joueur : on l'enferme dans un carré de palissades
const uidsMur = [];
for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (dx || dy) { const q = sim.construire('p', { type: 'palissade', etage: e.etage, x: zx + 20 + dx, y: zy + dy }); if (q.ok) uidsMur.push(q.uid); }
const z = sim.faireApparaitre(['colosse'], { joueurId: 'p' });
const mort = sim.zombies().find(q => q.uid === z[0]);
if (mort) { mort.x = zx + 20.5; mort.y = zy + 0.5; mort.etat = 'chasse'; mort.joueur = 'p'; mort.derniere = { x: j.x, y: j.y }; mort.memoire = 1e9; mort.alerte = 1; }
let coups = 0, detruite = 0;
for (let t = 0; t < 120000 && !detruite; t += 100) for (const ev of sim.tick(100)) { if (ev.type === 'construction' && ev.action === 'coup') coups++; if (ev.type === 'construction' && ev.action === 'detruite') detruite++; }
ok(uidsMur.length >= 6 && coups > 3 && detruite >= 1, `enfermé : ${coups} coups sur la palissade, ${detruite} détruite(s)`);
ok(c2 && sim.constructions().includes(c2), 'la palissade lointaine est intacte');

titre('Pieux');
const sim2 = creerSimLieu({ lieuId: '__c2', niveau, seed: 4, mortsN: [0, 0] });
sim2.ajouterJoueur('p', { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5, dir: 0 }, {});
const [kx, ky] = [e.x + 3, e.y];
let pieuxOk = sim2.construire('p', { type: 'pieux', etage: e.etage, x: kx, y: ky }).ok;
const zz = sim2.faireApparaitre(['errant'], { joueurId: 'p' });
const m2 = sim2.zombies().find(q => q.uid === zz[0]); if (m2) { m2.x = kx + 0.5; m2.y = ky + 0.5; }
let empale = 0; for (let t = 0; t < 3000; t += 100) for (const ev of sim2.tick(100)) if (ev.action === 'piege') empale++;
ok(pieuxOk && empale >= 1, `un mort sur les pieux s'empale (${empale} fois)`);

titre('Démonter, sauvegarder, recharger');
const d = sim.agirConstruction('p', porte.uid, 'demonter');
ok(d.ok && d.rendu.some(x => x.id === 'planche' && x.qty >= 1) && sim.grilles(e.etage).bloque[py * E.w + px] === 0, `porte démontée : rendu ${d.rendu.map(x => `${x.id}×${x.qty}`).join(', ')}`);
const sauve = sim.sauver(700);
const sim3 = creerSimLieu({ lieuId: '__c', niveau, seed: 3, mortsN: [0, 0], etat: sauve });
ok(sim3.constructions().length === sim.constructions().length && sim3.grilles(e.etage).bloque[wy * E.w + wx] === 1, `rechargé : ${sim3.constructions().length} constructions, le mur bloque toujours`);
ok(sim3.fouiller('p', cle).items.length === 2, 'le contenu de la caisse est gardé');
ok(Object.keys(CONSTRUCTIONS).length >= 10, `${Object.keys(CONSTRUCTIONS).length} constructions au catalogue`);

console.log(`\n${n - echecs}/${n} vérifications réussies.`);
process.exit(echecs ? 1 : 0);
