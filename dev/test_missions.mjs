// Test headless des MISSIONS (js/game/missions.js) et de leurs outils dans la simulation (vagues, lieu préparé, lieu calme).
// Lancer : node dev/test_missions.mjs   (code ≠ 0 en cas d'échec)
import { nouvellePartie, G } from '../js/core/state.js';
import * as bus from '../js/core/bus.js';
import * as clock from '../js/core/clock.js';
import * as player from '../js/game/player.js';
import * as surv from '../js/game/survival.js';
import * as inv from '../js/game/inventory.js';
import * as M from '../js/game/missions.js';
import { appliquerEffets } from '../js/game/effects.js';
import { SCENES } from '../js/game/donnees.js';
import { creerSimLieu } from '../js/explore/sim.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { FIN } from '../js/carte/catalogue.js';

let echecs = 0, n = 0;
const ok = (cond, msg) => { n++; if (!cond) { echecs++; console.log('  ÉCHEC :', msg); } else console.log('  ok   :', msg); };
const titre = (t) => console.log('\n== ' + t);
const notifs = []; bus.on('mission:notif', (x) => notifs.push(x));
const dernier = () => notifs[notifs.length - 1] || {};

nouvellePartie({ nom: 'Test', mode: 'solo', seed: 7 });
player.normaliserJoueur(G.player);
G.world.minutes = 1440 * 2 + 10 * 60;      // jour 3, 10 h
M.demarrerMissions();
surv.demarrerSurvie();
const p = G.player;
p.equip.sac = 'sac_expedition';   // de la place pour les récompenses

// ---------- Offres ----------
titre('Offres');
M._setLieuVue('place_de_gaulle');
ok(M.aProposer('place_de_gaulle', () => false) === null, 'en arrivant de loin sur la place : rien ne saute aux yeux');
ok(M.aProposer('place_de_gaulle', (p, d) => p === 'Le tabac-presse' && d > 0) === 'm_marche', 'sous la fenêtre d’Odile (près du tabac) : le marché est proposé');
const sid = M.sceneOffre('m_marche');
ok(SCENES[sid] && SCENES[sid].choix.length === 3, 'scène d’offre : accepter, plus tard, refuser');
ok(M.aProposer('place_de_gaulle', () => true) === null, 'une seule fois par visite');
ok(M.aProposer('pharmacie_carnot', () => true) === null && SCENES[M.parlerPnj('m_mireille').scene], 'Mireille : pas d’offre surprise, on la reçoit en lui parlant');
ok(M.aProposer('cornillon', () => false) === null && M.aProposer('cornillon', (p) => p === 'La chambre du guetteur') === 'm_guetteur', 'Cornillon : proposé en entrant dans la chambre du guetteur seulement');

// ---------- Nettoyer ----------
titre('Nettoyer : le marché du mercredi');
appliquerEffets({ mission: ['accepter', 'm_marche'] });
ok(M.etat('m_marche').etat === 'active' && dernier().type === 'nouveau', `accepter par un effet de scène → « ${dernier().titre} »`);
ok(M.lieuCalme('place_de_gaulle'), 'pendant le nettoyage, le lieu est bouclé (plus d’arrivées tranquilles)');
ok(M.guide('place_de_gaulle').startsWith('Le marché du mercredi'), `guide : « ${M.guide('place_de_gaulle')} »`);
M.reussirEtape('m_marche');
ok(notifs.some(x => x.titre === 'Objectif rempli') && M.etapeDe('m_marche').type === 'atteindre', 'place vidée : « Objectif rempli », puis frapper chez Odile');
const conserves = inv.countItem('conserve_haricots');
M.reussirEtape('m_marche');
ok(M.etat('m_marche').etat === 'reussie' && dernier().titre === 'Mission accomplie', 'mission accomplie (bandeau)');
ok(inv.countItem('conserve_haricots') === conserves + 2, 'récompense : les conserves d’Odile');
ok(M.lieuCalme('place_de_gaulle') && G.world.lieux.place_de_gaulle.calmeJusqua > G.world.minutes + 3 * 1440, 'la place reste calme quatre jours');

// ---------- Tenir trois jours ----------
titre('Tenir trois jours à Cornillon');
M._setLieuVue('cornillon');
M.accepter('m_guetteur');
clock.avancer(1000);
ok(M.etat('m_guetteur').d.compte === 1000, `sur place : le compte avance (${M.guide('cornillon')})`);
bus.emit('temps', { nom: 'carte' });
await new Promise(r => setTimeout(r, 5));
clock.avancer(10);
ok(M.etat('m_guetteur').d.compte === 0 && dernier().type === 'info', `quitter le village : tout est à refaire (« ${dernier().texte} »)`);
M._setLieuVue('cornillon');
clock.avancer(4320);
ok(M.etat('m_guetteur').etat === 'reussie', 'trois jours et trois nuits plus tard : réussi');
ok(['berre', 'istres', 'lancon'].every(id => G.world.lieux[id] && G.world.lieux[id].decouvert), 'récompense : la plaine découverte depuis le village');

// ---------- Attendre puis agir ----------
titre('Attendre la draisine de 22 h');
M._setLieuVue('gare');
G.world.minutes = Math.floor(G.world.minutes / 1440) * 1440 + 21 * 60;
M.accepter('m_draisine');
clock.avancer(30);
ok(M.etapeDe('m_draisine').type === 'attendre', '21 h 30 : on attend encore');
clock.avancer(40);
ok(M.etapeDe('m_draisine').type === 'atteindre', '22 h passées : la draisine est passée, il faut ramasser la caisse');
M.reussirEtape('m_draisine');
ok(inv.countItem('ration_militaire') >= 3, 'la caisse : des rations de l’armée');
bus.emit('temps', { nom: 'carte' }); await new Promise(r => setTimeout(r, 5));
ok(M.etat('m_draisine').etat === 'reussie', 'quitter la gare : mission accomplie');

// ---------- Protéger ----------
titre('Protéger Mireille');
M._setLieuVue('pharmacie_carnot');
M.accepter('m_mireille');
clock.avancer(5);
ok(M.blesserPnj('m_mireille', 30) === 70, 'Mireille prend des coups');
ok(/Mireille : (blessée|légèrement blessée)/.test(M.guide('pharmacie_carnot')), `guide : « ${M.guide('pharmacie_carnot')} »`);
bus.emit('temps', { nom: 'carte' }); await new Promise(r => setTimeout(r, 5));
ok(M.etat('m_mireille').etat === 'echouee' && /seule/.test(dernier().texte), `partir : échec (« ${dernier().texte} »)`);

// ---------- Nourrir ----------
titre('Nourrir Aimé');
M._setLieuVue('touloubre');
M.accepter('m_aime');
inv.addItem('ouvre_boite', 1); inv.addItem('conserve_raviolis', 6); inv.addItem('biscuits', 3);
let sc = SCENES[M.sceneNourrir('m_aime')];
ok(sc.choix.some(c => /raviolis/.test(c.label)), 'parler à Aimé : on choisit quoi lui donner');
appliquerEffets({ mission: ['donner', 'm_aime', 'biscuits'] });
ok(M.etat('m_aime').d.faits === 1, 'jour 1 : il a mangé à sa faim');
clock.avancer(1440);
appliquerEffets({ mission: ['donner', 'm_aime', 'biscuits'] });
clock.avancer(1440);
appliquerEffets({ mission: ['donner', 'm_aime', 'biscuits'] });
ok(M.etat('m_aime').etat === 'reussie' && inv.countItem('canne_peche') === 1, 'trois jours nourri : il remarche, sa canne à pêche en récompense');
// échec : deux jours sans manger
G.world.missions.m_aime = undefined; delete G.world.missions.m_aime;
M.accepter('m_aime');
clock.avancer(1440);
ok(M.etat('m_aime').etat === 'active', 'le jour de l’accord ne compte pas comme un jour manqué');
clock.avancer(1440);
ok(M.etat('m_aime').d.rates === 1 && dernier().type === 'echec', 'un jour sans manger : on est prévenu·e');
clock.avancer(1440);
ok(M.etat('m_aime').etat === 'echouee', 'deux jours sans manger : il meurt');
ok(M.pnjsDuLieu('touloubre').length === 0, 'et il n’est plus dans le moulin');

// ---------- La simulation : vagues, lieu préparé, lieu calme ----------
titre('Simulation : vagues, morts endormis, lieu bouclé');
const def = (await import('../js/data/niveaux/leclerc.js')).default;
const niveau = parserNiveau(def);
const sim = creerSimLieu({ lieuId: 'leclerc', niveau, seed: 3, minutes: G.world.minutes, arrivees: true, getCalme: () => true });
sim.ajouterJoueur('j', { etage: niveau.entrees.defaut.etage, x: niveau.entrees.defaut.x + 0.5, y: niveau.entrees.defaut.y + 0.5 });
const P = niveau.pieces.find(q => q.nom && q.nom.startsWith('L’hyper'));
const zone = { etage: P.etage, x0: P.x0 / FIN, y0: P.y0 / FIN, x1: (P.x1 + 1) / FIN, y1: (P.y1 + 1) / FIN };
const n0 = sim.zombies().length;
const poses = sim.preparerMission({ zone, n: 14, etat: 'dort' });
const dedans = sim.zombies().filter(z => z.x >= zone.x0 && z.x <= zone.x1 && z.y >= zone.y0 && z.y <= zone.y1);
ok(poses >= 10 && dedans.every(z => z.etat === 'dort'), `l’hypermarché : ${poses} morts posés, tous endormis debout (${dedans.length} dans les rayons)`);
const uids = sim.appelerMorts(4, { etage: niveau.entrees.defaut.etage, x: niveau.entrees.defaut.x, y: niveau.entrees.defaut.y });
ok(uids.length === 4 && sim.zombies().filter(z => uids.includes(z.uid)).every(z => z.etat === 'alerte' && z.cible), 'une vague : 4 morts entrent et marchent vers la cible');
const avant = sim.zombies().length;
for (let k = 0; k < 600; k++) sim.tick(100);
ok(sim.zombies().length === avant, `lieu bouclé : une minute sans arrivée tranquille (${avant} morts ; au départ ${n0})`);

const reveilles = sim.reveillerZone({ zone, cible: { etage: zone.etage, x: (zone.x0 + zone.x1) / 2, y: zone.y1 } });
ok(reveilles >= 20 && sim.zombies().filter(z => z.x >= zone.x0 && z.x <= zone.x1 && z.y >= zone.y0 && z.y <= zone.y1).every(z => z.etat !== 'dort'), `le coffre sonne : ${reveilles} morts se réveillent dans les rayons`);

M.arreterMissions();
console.log(`\n${n - echecs}/${n} vérifications réussies.`);
process.exit(echecs ? 1 : 0);
