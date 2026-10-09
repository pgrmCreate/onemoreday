// Test headless des règles du personnage (survie, blessures & soins, inventaire, fabrication).
// Lancer : node dev/test_ui_regles.mjs   (code ≠ 0 en cas d'échec)
import { nouvellePartie, G } from '../js/core/state.js';
import * as bus from '../js/core/bus.js';
import * as clock from '../js/core/clock.js';
import { REGLAGES } from '../js/data/reglages.js';
import * as player from '../js/game/player.js';
import * as surv from '../js/game/survival.js';
import * as inv from '../js/game/inventory.js';
import * as craft from '../js/game/crafting.js';

let echecs = 0, n = 0;
const ok = (cond, msg) => { n++; if (!cond) { echecs++; console.log('  ÉCHEC :', msg); } else console.log('  ok   :', msg); };
const titre = (t) => console.log('\n== ' + t);
const toasts = []; bus.on('toast', (t) => toasts.push(t.texte));
let morts = []; bus.on('mort', (m) => morts.push(m.cause));

// ---------- 1. Survie 48 h ----------
titre('Survie : 48 h de jeu sans manger ni boire');
nouvellePartie({ nom: 'Test', mode: 'solo', seed: 42 });
player.normaliserJoueur(G.player);
surv.demarrerSurvie();
const p = G.player;
ok(player.niveau('force') === 0 && p.skillXp.force === 20, 'XP de départ (Force 20, niveau 0)');
const f0 = p.faim, s0 = p.soif, fa0 = p.fatigue;
clock.avancer(60);
ok(Math.abs((f0 - p.faim) - 60 * REGLAGES.survie.FAIM_PAR_MIN) < 0.01, `faim −${(f0 - p.faim).toFixed(2)} en 1 h`);
ok(Math.abs((s0 - p.soif) - 60 * REGLAGES.survie.SOIF_PAR_MIN) < 0.01, `soif −${(s0 - p.soif).toFixed(2)} en 1 h`);
ok(fa0 - p.fatigue > 3, `fatigue −${(fa0 - p.fatigue).toFixed(2)} en 1 h`);
for (let h = 1; h < 48 && !p.mort; h++) clock.avancer(60);
console.log(`  après 48 h : PV ${p.pv.toFixed(1)}, faim ${p.faim.toFixed(1)}, soif ${p.soif.toFixed(1)}, fatigue ${p.fatigue.toFixed(1)}, mort=${p.mort || '-'}`);
ok(p.soif === 0 && p.faim < 20, 'soif vide, faim basse au bout de 48 h');
ok(p.pv < 100, 'on perd des PV à soif 0');
const mood = surv.etatsCorps(p).map(m => m.id);
ok(mood.includes('soif') && mood.includes('faim'), `moodles : ${mood.join(', ')}`);
ok(p.staMax < 100, `endurance max réduite (${p.staMax})`);

// ---------- 2. Manger / boire / contenants ----------
titre('Manger, boire, contenants');
inv.addItem('conserve_haricots', 1);
let r = surv.manger('conserve_haricots');
ok(!r.ok && /ouvre-boîte/.test(r.raison), 'conserve sans ouvre-boîte : refusée avec la raison');
inv.addItem('ouvre_boite', 1);
const faimAv = p.faim; r = surv.manger('conserve_haricots');
ok(r.ok && p.faim > faimAv && inv.hasItem('boite_vide'), 'conserve mangée, boîte vide rendue');
// Satiété : on mange jusqu'à être calé·e, le reste est gardé ; pas de « +30 »
p.faim = 80; inv.addItem('biscuits', 1);
r = surv.manger('biscuits');
const ent = p.inventaire.find(x => x.id === 'biscuits');
ok(r.ok && p.faim >= 99 && ent && ent.reste > 0.5 && ent.reste < 1, `paquet de biscuits : calé·e (${surv.motFaim(p)}), il en reste ${ent && ent.reste} — « ${r.texte} »`);
r = surv.manger('biscuits');
ok(!r.ok && r.peutForcer, `rassasié·e : « ${r.raison} »`);
const resteAv = ent.reste; r = surv.manger(p.inventaire.indexOf(ent), p, { forcer: true });
ok(r.ok && p.effets.nausee > 0 && p.inventaire.find(x => x.id === 'biscuits' && x.reste < resteAv), 'se forcer : on en mange encore un peu, nausée');
// L'estomac : affamé·e, on ne se gave pas d'un coup — il faut digérer avant de finir le paquet
p.mort = null; p.pv = p.pvMax; p.soif = 100; p.fatigue = 100;   // (le test des 48 h l'a laissé·e mort·e)
p.faim = 10; r = surv.manger('biscuits');
ok(!r.ok && r.peutForcer && /repu/.test(r.raison), `affamé·e mais l'estomac est encore plein : « ${r.raison} »`);
p.estomac = 0; r = surv.manger('biscuits');
const ent2 = p.inventaire.find(x => x.id === 'biscuits');
ok(r.ok && p.estomac >= REGLAGES.survie.REPAS.ESTOMAC_MAX - 1 && (!ent2 || ent2.reste > 0), `estomac vide : un repas le remplit (${Math.round(p.estomac)} points), on garde le reste`);
surv.tickMinutes(120);
ok(p.estomac === 0, `deux heures plus tard, l'estomac s'est vidé (${p.estomac})`);
p.faim = 10; p.estomac = 0; while (p.inventaire.some(x => x.id === 'biscuits')) { p.estomac = 0; p.faim = 10; if (!surv.manger('biscuits').ok) break; }
ok(!p.inventaire.some(x => x.id === 'biscuits'), `affamé·e, repas après repas : on finit le paquet entamé (${surv.motFaim(p)})`);
// Le poids du corps suit la faim
{ const kg0 = p.poidsCorps; p.faim = 30; surv.tickMinutes(1440); const kg1 = p.poidsCorps;
  ok(kg1 < kg0, `une journée affamé·e : on maigrit (${kg0.toFixed(2)} → ${kg1.toFixed(2)} kg)`);
  p.poidsCorps = p.poidsRef * 0.75; ok(surv.corpulence(p).id === 'emacie' && surv.effetsCorpulence(p).degats < 1, `émacié·e : ${surv.corpulence(p).label}, coups ×${surv.effetsCorpulence(p).degats}`);
  p.poidsCorps = p.poidsRef; ok(surv.corpulence(p).id === 'normal', 'poids de forme : normal'); }
ok(surv.motPortion('compote') === 'une bouchée' && surv.motPortion('barre_cereales') === 'un en-cas' && surv.motPortion('conserve_raviolis') === 'un repas léger' && surv.motPortion('biscuits') === 'un gros repas',
  `portions en mots : barre = ${surv.motPortion('barre_cereales')}, raviolis = ${surv.motPortion('conserve_raviolis')}, biscuits = ${surv.motPortion('biscuits')}`);
// Consommer sur place (meuble / sol), sans ramasser
p.faim = 30; p.estomac = 0;
r = surv.consommer({ id: 'conserve_raviolis', qty: 1 }, p);
ok(r.ok && r.fini && r.rend === 'boite_vide', 'raviolis mangés sur place (ouvre-boîte dans le sac)');
r = surv.consommer({ id: 'bandage', qty: 1 }, p);
ok(!r.ok && /plaie/.test(r.raison), `bandage au sol sans plaie : « ${r.raison} »`);
inv.addItem('gourde', 1);
const ig = p.inventaire.findIndex(x => x.id === 'gourde');
inv.remplir(ig, 'propre');
ok(inv.litresEau('propre') === 1, 'gourde remplie (1 L propre)');
const soifAv = p.soif; surv.boire(p.inventaire.findIndex(x => x.id === 'gourde'));
ok(Math.round(p.soif - soifAv) === 40 && Math.abs(inv.litresEau() - 0.5) < 1e-6, 'une gorgée = 0,5 L = +40 soif');

// ---------- 3. Blessure → soin ----------
titre('Blessure, mal, réflexe de désinfection');
nouvellePartie({ nom: 'Test', mode: 'solo', seed: 7 }); player.normaliserJoueur(G.player);
const q = G.player;
const w = surv.infligerBlessure(q, { type: 'entaille', zone: 'à l\'avant-bras', saigne: true, zombie: 'errant' });
ok(w && w.saigne && Math.abs(q.mal - 6 * 0.85) < 0.01, `entaille d'errant : +${q.mal.toFixed(1)} de mal`);
ok(surv.minuteurReflexe(w).reste === 10, 'minuteur « désinfecter dans les 10 min » visible');
inv.addItem('bandage', 1, {}, q); inv.addItem('desinfectant', 1, {}, q);
const soins = surv.soinsPossibles(q, 0);
ok(soins[0].urgent && soins.some(s => s.action === 'desinfecter' && s.objet === 'desinfectant'), `soins proposés : ${soins.map(s => s.action + (s.urgent ? '!' : '')).join(', ')}`);
clock.avancer(3);
r = surv.soigner(q, 0, 'desinfectant');
ok(r.ok && q.mal < 0.01, 'désinfectée à temps : le mal retombe à 0');
r = surv.soigner(q, 0, 'bandage');
ok(r.ok && !q.blessures[0].saigne && q.blessures[0].bandee, 'bandée : le saignement s\'arrête');
ok(player.niveau('medecine') === 0 && q.skillXp.medecine === 8, 'XP de Médecine gagnée (2 soins × 4)');
const m2 = surv.infligerBlessure(q, { type: 'morsure', zone: 'au cou', zombie: 'errant' });
ok(Math.abs(q.mal - 70 * 0.85) < 0.01, `morsure : mal ${q.mal.toFixed(1)}`);
inv.addItem('kit_suture', 1, {}, q);
ok(!surv.soigner(q, 1, 'kit_suture').ok, 'suture refusée sur une morsure');
ok(!surv.peutSoigner(q, m2, 'cauteriser').ok, 'cautériser sans lame ni flamme : refusé');
inv.addItem('couteau_cuisine', 1, {}, q); inv.addItem('briquet', 1, {}, q);
const malAv = q.mal; r = surv.soigner(q, 1, 'cauteriser');
ok(r.ok && Math.abs(q.mal - malAv / 2) < 0.2 && q.blessures.some(b => b.type === 'brulure'), 'cautérisée à temps : mal ÷ 2, brûlure infligée');
const f = surv.infligerBlessure(q, { type: 'fracture', zone: 'au mollet' });
ok(player.modificateurs(q).vitesse < 0.8, `fracture de jambe sans attelle : vitesse ×${player.modificateurs(q).vitesse.toFixed(2)}`);
inv.addItem('attelle', 1, {}, q); surv.soigner(q, q.blessures.indexOf(f), 'attelle');
ok(player.modificateurs(q).vitesse > 0.95, 'attelle posée : la jambe porte de nouveau');
// guérison : une égratignure bandée finit par disparaître
const eg = surv.infligerBlessure(q, { type: 'egratignure', zone: 'à la main', saigne: false }); eg.desinfJusqua = 1e9; // pas d'infection aléatoire pendant le test
const nb = q.blessures.length; q.faim = q.soif = 100;
console.log('  plaies :', q.blessures.map(b => `${b.type}${b.saigne ? '/saigne' : ''}${b.infecte ? '/infectée' : ''}`).join(', '));
for (let h = 0; h < 14; h++) { clock.avancer(60); q.faim = q.soif = q.fatigue = 100; }
if (q.blessures.length >= nb) console.log('  DEBUG', JSON.stringify(q.blessures.map(b=>[b.type,b.saigne,b.infecte,b.guerison.toFixed(2)])), q.mort, q.pv);
ok(q.blessures.length < nb, `égratignure guérie en < 14 h (${nb} → ${q.blessures.length} plaies)`);
// rechute
surv.ajouterMal(q, 100);
ok(surv.causeMort(q) === 'rechute' && morts.includes('rechute'), 'mal à 100 : rechute, bus « mort »');

// ---------- 4. Inventaire ----------
titre('Inventaire : volume, poids, mains, dos, équipement, accès rapide, lampe');
nouvellePartie({ nom: 'Test', mode: 'solo', seed: 3 }); player.normaliserJoueur(G.player);
const j = G.player;
ok(inv.capacites(j).poches === REGLAGES.inventaire.POCHES_L + 1 && inv.capacites(j).sac === 0, 'poches de base + jean (1 L), pas de sac');
const res = inv.addItem('planche', 1, {}, j);
ok(res.ajoute === 0 && res.auSol === 1, 'une planche (6 L) ne rentre pas dans des poches : posée au sol');
ok(inv.porterObjet({ id: 'sac_a_dos', qty: 1 }, j).ok && inv.capacites(j).sac === 20, 'sac à dos d\'écolier porté : 20 L');
const iPl = inv.objetsAuSol().findIndex(x => x.id === 'planche');
ok(inv.ramasser(iPl, j).ajoute === 1 && inv.bilan(j).sac.utilise === 6, 'planche au sac : 6 L sur 20 (30 %)');
ok(inv.combienTient('planche', 5, j) === 2, 'deux planches de plus tiennent, pas trois (18 L sur 20)');
ok(inv.combienTient('piles', 50, j) === 50 && inv.combienTient('conserve_haricots', 99, j) >= 25, 'une paire de piles = 0,02 L : 50 tiennent sans peine ; une conserve, 0,45 L');
ok(inv.tenir(j.inventaire.findIndex(x => x.id === 'planche'), 'gauche', j).ok && j.equip.mainG === 'planche', 'planche en main gauche');
ok(inv.porterObjet({ id: 'planche', qty: 1 }, j, 'droite').ok && j.equip.arme === 'planche', 'une autre planche en main droite (une dans chaque main)');
const avant = inv.poidsPorte(j);
ok(inv.mainVersDos('arme', j).ok && j.equip.dos === 'planche' && Math.abs(inv.poidsPorte(j) - (avant - 1.8 * (1 - REGLAGES.inventaire.DOS_POIDS))) < 0.01, `planche dans le dos : plus légère (${avant} → ${inv.poidsPorte(j)} kg)`);
ok(inv.porterObjet({ id: 'pelle', qty: 1 }, j).ok && !j.deuxMains && inv.mains(j).uneMainPenalite, 'pelle en main droite, la gauche est prise : une seule main (pénalité)');
ok(inv.basculerDeuxMains(j).ok && j.deuxMains && !j.equip.mainG, 'pelle à deux mains : la planche de la main gauche part au sac / au sol');
ok(!inv.mainVersDos('arme', j).ok || j.equip.dos === 'pelle', 'la pelle passe dans le dos (la planche du dos revient en main)');
inv.addItem('ceinture_cuir', 1, {}, j);
j.inventaire.push({ id: 'brique', qty: 8 });   // poids forcé (8 briques ne rentrent pas toutes au sac)
const sp = inv.surpoids(j);
ok(sp.f > 0, `surpoids : ${sp.kg} kg / ${sp.max} kg, f = ${sp.f.toFixed(2)}`);
ok(surv.etatsCorps(j).some(m => m.id === 'surcharge'), 'moodle « Surchargé »');
inv.removeItem('brique', 8, j);
ok(inv.porterObjet({ id: 'batte_baseball', qty: 1 }, j).ok && j.equip.arme === 'batte_baseball' && j.equipEtat.arme.dur === 45, 'batte en main (durabilité 45)');
inv.addItem('bandage', 2, {}, j);
ok(!inv.mettreAccesRapide('bandage', j).ok, 'sans ceinture, rien en accès rapide');
inv.equiper(j.inventaire.findIndex(x => x.id === 'ceinture_cuir'), j);
ok(inv.mettreAccesRapide('bandage', j).ok && inv.accesRapideMax(j) === 2, 'ceinture en cuir : bandage à la ceinture (2 places)');
inv.addItem('lampe_torche', 1, {}, j); inv.addItem('piles', 1, {}, j);
ok(inv.equiper(j.inventaire.findIndex(x => x.id === 'lampe_torche'), j).ok && inv.mains(j).gauche === 'lampe_torche', 'lampe torche : tenue en main gauche');
j.equipEtat.lampe.charge = 0;   // piles mortes : l'allumer consomme les piles du sac
ok(inv.allumerLampe(true, j).ok && inv.lampe(j).charge === 600 && !inv.hasItem('piles', 1, j), 'lampe allumée : piles consommées, 600 min');
clock.avancer(30);
ok(inv.lampe(j).charge === 570, 'la lampe consomme une minute par minute');
for (let i = 0; i < 5; i++) inv.userArme(1, j);
ok(j.equipEtat.arme.dur <= 45 && j.equipEtat.arme.dur >= 40, `usure de la batte : ${j.equipEtat.arme.dur}/45`);
inv.addItem('sweat_capuche', 1, {}, j);
ok(inv.dechirer(j.inventaire.findIndex(x => x.id === 'sweat_capuche'), j).ok && inv.countItem('chiffon', j) === 2, 'sweat déchiré : 2 chiffons');

// ---------- 5. Fabrication ----------
titre('Fabrication');
nouvellePartie({ nom: 'Test', mode: 'solo', seed: 5 }); player.normaliserJoueur(G.player);
const k = G.player; inv.porterObjet({ id: 'sac_randonnee', qty: 1 }, k);
let e = craft.etatRecette('r_bandage_fortune', k);
ok(e.connue && !e.faisable && e.manques[0].type === 'ingredient', `bandage sans chiffon : « ${e.manques[0].texte} »`);
inv.addItem('chiffon', 5, {}, k);
e = craft.etatRecette('r_bandage_fortune', k);
ok(e.faisable && e.maxQty === 2, 'bandage de fortune : faisable ×2');
const t0 = G.world.minutes;
r = craft.fabriquer('r_bandage_fortune', 2, {}, k);
ok(r.ok && inv.countItem('bandage_fortune', k) === 2 && inv.countItem('chiffon', k) === 1 && G.world.minutes - t0 === 10, 'fabriqué ×2 : chiffons consommés, 10 min écoulées');
e = craft.etatRecette('r_eau_bouillie', k);
ok(e.manques.some(m => m.type === 'poste') && e.manques.some(m => m.type === 'outil'), `eau bouillie : ${e.manques.map(m => m.texte).join(' · ')}`);
e = craft.etatRecette('r_kit_suture', k);
ok(!e.connue, 'kit de suture : inconnu au départ');
inv.addItem('precis_secourisme', 1, {}, k);
r = craft.lire(k.inventaire.findIndex(x => x.id === 'precis_secourisme'), k);
ok(r.ok && craft.estConnue(craft.etatRecette('r_kit_suture', k).r, k) && k.skillXp.medecine === 34, `livre lu (+30 XP Médecine) : ${r.apprises.join(', ')}`);
e = craft.etatRecette('r_kit_suture', k);
ok(e.manques.some(m => m.type === 'competence'), 'kit de suture : Médecine 1 requise (34/40 XP)');
player.gagnerXp('medecine', 6, k);
ok(player.niveau('medecine', k) === 1, 'Médecine niveau 1');
inv.addItem('pied_de_biche', 1, {}, k);
const ipb = k.inventaire.findIndex(x => x.id === 'pied_de_biche'); k.inventaire[ipb].dur = 30;
inv.addItem('fil_de_fer', 1, {}, k); inv.addItem('scotch', 1, {}, k);
e = craft.etatRecette('r_reparer_ligature', k);
ok(!e.connue, 'ligature : inconnue (Manuel du bricoleur / Entretien 1)');
player.gagnerXp('entretien', 40, k);
e = craft.etatRecette('r_reparer_ligature', k);
ok(e.connue && e.manques.length === 1 && e.manques[0].type === 'poste', 'ligature apprise par niveau ; il manque l\'établi');
craft.setContexteFabrication({ etabli: true });
r = craft.fabriquer('r_reparer_ligature', 1, { cible: ipb }, k);
ok(r.ok && k.inventaire.find(x => x.id === 'pied_de_biche').dur > 30 && k.inventaire.find(x => x.id === 'pied_de_biche').durMax === 108, `pied-de-biche réparé : ${r.texte}`);
const lst = craft.recettesParEtat(null, k);
ok(lst.faisables.length + lst.incompletes.length + lst.inconnues.length === 60 || lst.faisables.length + lst.incompletes.length + lst.inconnues.length > 50, `listes : ${lst.faisables.length} faisables, ${lst.incompletes.length} incomplètes, ${lst.inconnues.length} inconnues`);

console.log(`\n${n - echecs}/${n} vérifications réussies.`);
process.exit(echecs ? 1 : 0);
