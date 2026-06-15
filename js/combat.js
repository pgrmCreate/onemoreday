// ============ Combat en temps réel ============
// La jauge de menace du zombie se remplit en continu : quand elle est pleine, il attaque.
// Chaque action coûte de l'endurance. En défense, on récupère mais on ne bouge plus.
// L'attaque se CHARGE : maintenir le bouton arme le coup (ou la visée au pistolet),
// relâcher le déclenche — plus c'est chargé, plus ça cogne, plus ça rate, plus ça use.
// EN COMBAT, on n'a que ce qu'on a SUR soi : l'arme en main et l'accès rapide
// (ceinture, holster, gilet). Le sac reste fermé — pas le temps.
import { G, rng, chance, pick, skillLevel, gainSkill } from './state.js';
import { ZOMBIES, zombie } from './data/zombies.js';
import { item } from './data/items.js';
import { zombiesPoolCourant, deposerAuSol, keyCourante } from './world.js';
import {
  armeEquipee, armesDisponibles, soinsAccesRapide, degainerAccesRapide,
  accesRapide, removeItem, protectionTotale, bonusAgiliteVetements, countItem, munitionsPour,
  enSurpoids, surpoidsFacteur,
} from './inventory.js';
import { ajouterBlessure, mortJoueur } from './survival.js';
import { render, updateHUD, showHUD, log, $ } from './ui.js';
import { ico } from './icons.js';
import { svgCombatDecor, svgCombatZombie, pngZombie } from './illustrations.js';
import { svgAmbiance, aAmbiance } from './ambiance.js';
import { startCombatMusic, stopCombatMusic, sfx, setHeartbeat } from './audio.js';
import * as multi from './multi.js';
import { REGLAGES } from './data/reglages.js';

let C = null; // état du combat en cours

export function enCombat() { return !!C; }

// Le fond de la scène de combat = le LIEU où il se déroule. Si la carte a un dessin
// d'ambiance (chambre, rue, magasin…), on l'affiche tel quel — même cadre 800×340 que les
// arènes. Sinon (lieu sans dessin), on retombe sur l'arène générique liée au type de mort.
function decorCombat() {
  if (C && aAmbiance(C.decorCarte)) return svgAmbiance(C.decorCarte, C.decorHeure);
  return svgCombatDecor(C ? C.decorZid : 'inconnu');
}

// Coût des actions et profil de l'attaque chargée : centralisés dans js/data/reglages.js.
// MAINTENIR le bouton charge le coup (ou la visée), RELÂCHER le déclenche ; pendant la
// charge TOUT continue — la menace monte, le mort frappe.
const COUTS = REGLAGES.combat.COUTS;
const CHARGE = REGLAGES.combat.CHARGE;
const MAINTIEN = REGLAGES.combat.MAINTIEN; // ms de remplissage des jauges (pousser/fuir/accès)
const ATERRE = REGLAGES.combat.ATERRE;     // mort à terre : durée, amplis de dégâts/critique, risque
const REGEN = REGLAGES.combat.REGEN;       // récupération d'endurance : repos (rien) vs actif
const DEFENSE = REGLAGES.combat.DEFENSE;   // garde chargée : durée, tenue au max, réductions
const ANNEAU_CIRC = 97.4; // circonférence du cercle SVG d'une jauge ronde (2π × 15.5)

export function demarrerCombat(zombieIds, opts = {}) {
  if (C) return;
  const ids = Array.isArray(zombieIds) ? [...zombieIds] : [zombieIds];
  const premier = ids.shift();
  C = {
    z: creerZombie(premier),
    queue: ids,
    decorZid: premier, // arène de SECOURS (par type de mort) si le lieu n'a pas d'ambiance
    // Le décor du combat, c'est le LIEU où il se joue : on réutilise le dessin d'ambiance
    // de la carte courante (la chambre, la rue, le magasin…) plutôt qu'une arène générique.
    // Heure GELÉE au début du combat pour que le ciel de la fenêtre ne bouge pas en plein duel.
    decorCarte: G.world.carte,
    decorHeure: G.world.heure + G.world.minute / 60,
    opts,
    def: null,        // garde en charge : { c, prev, raf, max, maxTimer, collapsed } ou null
    fini: false,
    logs: [],
    logOuvert: false, // le journal de combat ne s'affiche que si on appuie dessus
    timer: null,
    armesJetees: [], // {id, dur, touche} — récupérables en fouillant après le combat
    hurleurACrie: false,
    dernierTick: performance.now(),
    qteTimer: null,   // esquive réflexe en cours
    qteJusqua: 0,     // cooldown : la fenêtre d'esquive ne revient pas tout de suite
    contreJusqua: 0,  // après une esquive réussie : une seconde pour frapper
    aTerre: 0,        // timestamp (perf.now) jusqu'auquel le mort actif est à terre (0 = debout)
    chg: null,        // charge en cours (bouton maintenu) : { type, c, prev, raf, ... }
    hold: null,       // autre bouton maintenu (pousser/fuir/accès) : { act, c, prev, raf, btn, duree, plein }
    frappe: null,     // coup de mêlée relâché mais pas encore arrivé : { c, timer }
    enc: opts.enc || null,    // co-op : identifiant de rencontre PARTAGÉE (combat à deux)
    appliquantDistant: false, // garde anti-boucle pendant l'application d'un coup distant
  };
  startCombatMusic();
  sfx('zombie');
  clog(`<span class="gore">${C.z.def.desc}</span>`);
  if (C.queue.length) clog(`Et derrière... ${C.queue.length} autre${C.queue.length > 1 ? 's' : ''} silhouette${C.queue.length > 1 ? 's' : ''} approche${C.queue.length > 1 ? 'nt' : ''}.`);
  if (opts.surprise) { C.z.menace = 0.65; clog('Il t\'a surpris — il est déjà sur toi !'); }
  if (enSurpoids()) clog('Le poids de ton barda te scie les épaules — tes gestes sont lourds, tes esquives molles.', 'degats');
  renderCombat();
  C.timer = setInterval(tick, 100);
  // Co-op : signaler que je suis en combat ici (le coéquipier peut venir m'épauler).
  // Un combat en multi a une rencontre PARTAGÉE (enc) : rejoindre reprend le même id.
  if (multi.estMulti()) {
    if (!C.enc) C.enc = 'e' + Math.floor(Math.random() * 1e9);
    multi.diffuserPosition({ enCombat: true, combat: { ids: [C.z.id, ...C.queue], enc: C.enc } });
  }
}

// Co-op : un message externe (ex. « X t'a rejoint ») glissé dans le journal de combat.
export function noteCombat(html) { if (C) clog(html, 'coup'); }

// Co-op : re-pousse la photo LIVE de la rencontre (file à jour) au coéquipier — pour
// qu'une demande de « rejoindre » porte sur les morts ENCORE debout, pas un instantané périmé.
function diffuserSnapshotCombat() {
  if (multi.estMulti() && C && C.enc) {
    multi.diffuserPosition({ enCombat: true, combat: { ids: [C.z.id, ...C.queue], enc: C.enc } });
  }
}

// Co-op : le coéquipier DEMANDE à rejoindre ce combat. Seul l'hôte de la rencontre (celui
// qui a un combat VIVANT au même enc) répond — et il renvoie la file ACTUELLE. Un combat
// fini (C nul / C.fini / autre enc) ne peut JAMAIS être rejoint → plus de « combat fantôme ».
export function repondreDemandeRejoindre(m) {
  if (C && !C.fini && C.enc === m.enc) {
    multi.diffuserCombat({ sub: 'rejoindre-ok', enc: C.enc, ids: [C.z.id, ...C.queue] });
    clog(`<b>${m.nom || 'Ton coéquipier'} accourt pour t'épauler !</b>`, 'coup');
  } else {
    multi.diffuserCombat({ sub: 'rejoindre-non', enc: m.enc });
  }
}

// Co-op : une cinématique déclenchée par le coéquipier surgit pendant mon combat.
// On FIGE le combat (la menace ne monte plus, la charge en cours est annulée) ;
// la scène se joue par-dessus, puis le combat reprend après un décompte.
export function pauseCombatPourCine() {
  if (!C || C.fini || C.pause) return false;
  C.pause = true;
  C.aTerre = 0; // on ne fige pas un compte à terre par-dessus une cinématique : il se relève
  if (C.timer) { clearInterval(C.timer); C.timer = null; }
  if (C.qteTimer) { clearTimeout(C.qteTimer); C.qteTimer = null; }
  if (C.frappe) { clearTimeout(C.frappe.timer); C.frappe = null; }
  if (C.chg && C.chg.raf) { cancelAnimationFrame(C.chg.raf); C.chg = null; }
  if (C.hold && C.hold.raf) { cancelAnimationFrame(C.hold.raf); C.hold = null; }
  if (C.def && C.def.raf) { cancelAnimationFrame(C.def.raf); C.def = null; }
  const qte = document.querySelector('.qte'); if (qte) qte.remove();
  resetAnneau();
  setHeartbeat(false);
  return true;
}
// Le combat reprend dans l'état EXACT où il était, après un 5-4-3-2-1 (pas de surprise).
export function reprendreCombatAvecDecompte() {
  if (!C || C.fini) return;
  const ov = document.createElement('div');
  ov.className = 'reprise-combat';
  ov.innerHTML = `<div class="reprise-num">5</div><div class="reprise-lbl">Le combat reprend…</div>`;
  document.body.appendChild(ov);
  const num = ov.querySelector('.reprise-num');
  let n = 5;
  num.textContent = n; sfx('alerte_contact');
  const tic = () => {
    n--;
    if (n <= 0) {
      ov.remove();
      if (C && !C.fini) { C.pause = false; C.dernierTick = performance.now(); C.timer = setInterval(tick, 100); renderCombat(true); majBarres(); }
      return;
    }
    num.textContent = n;
    sfx('alerte_contact');
    setTimeout(tic, 1000);
  };
  setTimeout(tic, 1000);
}

// Co-op : appliquer un événement de combat venu du coéquipier (même rencontre enc).
//   'degats' — son coup use aussi LE zombie (usure visible, jamais létale de mon côté) ;
//   'fin'    — il a achevé la rencontre : mon combat se termine en victoire aussi.
export function appliquerCombatDistant(m) {
  if (!C || !C.enc || m.enc !== C.enc) return false;
  if (m.sub === 'degats') {
    // Si l'autre frappe un AUTRE type de mort que celui que j'ai en face (files divergées),
    // on n'applique rien : mieux vaut rater l'usure partagée que ronger le mauvais zombie.
    if (m.zid && C.z.id !== m.zid) return false;
    C.appliquantDistant = true;
    C.z.hp = Math.max(1, C.z.hp - (m.deg || 0)); // l'achèvement reste l'affaire de celui qui frappe le coup mortel
    C.appliquantDistant = false;
    clog('Ton coéquipier le frappe aussi — il encaisse de partout.', 'coup');
    majBarres();
    return true;
  }
  if (m.sub === 'fin') {
    clog('<b>Ton coéquipier a porté le coup fatal. Le combat est terminé.</b>', 'coup');
    finVictoire(true);
    return true;
  }
  return false;
}

function creerZombie(id) {
  const def = zombie(id);
  return { id, def, hp: def.hp, hpMax: def.hp, menace: 0, facteur: 0.9 + Math.random() * 0.2 };
}

// Article défini devant un nom de zombie (tous masculins) : « l'errant », « le coureur »
function leZombie(nom, majuscule = false) {
  const n = nom.toLowerCase();
  const art = /^[aeéiouh]/.test(n) ? `l'${n}` : `le ${n}`;
  return majuscule ? art.charAt(0).toUpperCase() + art.slice(1) : art;
}

// L'état du zombie se LIT sur lui, il ne se mesure pas : pas de barre de vie.
function etatZombie() {
  const r = C.z.hp / C.z.hpMax;
  if (r > 0.8) return 'intact';
  if (r > 0.55) return 'entamé';
  if (r > 0.3) return 'sérieusement amoché';
  if (r > 0.12) return 'mutilé, tenant à peine debout';
  return 'en charpie — il refuse juste de tomber';
}

function clog(html, cls = '') {
  if (!C) return; // le combat vient de se terminer : message silencieux
  C.logs.push(`<p class="${cls}">${html}</p>`);
  if (C.logs.length > 40) C.logs.shift();
  const el = $('#cb-log-corps');
  if (el) { el.innerHTML = C.logs.join(''); el.scrollTop = el.scrollHeight; }
}

// ---------- Effets d'écran : un message central bref + des animations par action ----------
// Le journal complet est masqué (bouton) ; ici, on SYNTHÉTISE chaque échange d'un mot
// ou deux, projeté au centre, le temps d'une animation. C'est le retour immédiat du combat.
let flashTimer = null;
function flashCombat(txt, cls = '') {
  const el = $('#cb-msg');
  if (!el) return;
  el.className = 'cb-msg ' + cls;
  el.innerHTML = `<span>${txt}</span>`;
  void el.offsetWidth;        // reflow : relance l'animation même sur message identique
  el.classList.add('show');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { if (el) { el.classList.remove('show'); } }, 1400);
}

// Le décor tremble et un voile rouge passe : un coup encaissé.
function secouerScene() {
  const scene = $('.combat-scene');
  if (!scene) return;
  scene.classList.remove('shake'); void scene.offsetWidth; scene.classList.add('shake');
  const fl = $('.combat-scene .flash');
  if (fl) { fl.classList.remove('hit'); void fl.offsetWidth; fl.classList.add('hit'); }
}

// Une animation ponctuelle sur le mort actif (impact, entaille, recul, bond, chute).
function effetZombie(cls) {
  const z = $('#z-actif');
  if (!z) return;
  z.classList.remove(cls); void z.offsetWidth; z.classList.add(cls);
  if (cls !== 'z-terre') setTimeout(() => { if (z) z.classList.remove(cls); }, 520);
}

// ---------- Boucle temps réel ----------
function tick() {
  if (!C || C.fini) return;
  const now = performance.now();
  const dt = Math.min(300, now - C.dernierTick);
  C.dernierTick = now;
  const p = G.player;

  // Récupération d'endurance : LA PLUS RAPIDE quand on ne fait RIEN. Dès qu'on agit
  // (charge d'attaque, frappe en vol, garde levée, bouton maintenu), elle ralentit.
  const enAction = !!(C.chg || C.hold || C.frappe || C.def);
  p.sta = Math.min(p.staMax, p.sta + (enAction ? REGEN.actif : REGEN.repos) * (dt / 1000));

  // À TERRE : il ne peut pas attaquer, sa menace reste gelée — puis il se relève.
  if (C.aTerre) {
    if (now >= C.aTerre) {
      C.aTerre = 0;
      C.z.menace = 0.15;
      clog(`${leZombie(C.z.def.nom, true)} se redresse en titubant.`, 'degats');
      flashCombat('Il se relève', 'degats');
      majSceneEtat();
    }
  } else {
    // Jauge de menace — en surpoids, tes parades molles le laissent presser le pas.
    const sevSP = enSurpoids() ? surpoidsFacteur() : 0;
    C.z.menace += (dt / (C.z.def.vitesse * C.z.facteur)) * (1 + 0.35 * sevSP);
    if (C.z.menace >= 1) {
      C.z.menace = 0;
      C.z.facteur = 0.85 + Math.random() * 0.3;
      attaqueZombie();
    }
  }
  if (!C) return; // le combat a pu se terminer (mort)
  setHeartbeat(p.pv <= 25);
  majBarres();
}

function majBarres() {
  if (!C) return;
  // Jauge de menace : un mince liseré rouge en haut de l'écran (gelé si le mort est à terre).
  const m = $('#cb-menace');
  if (m) {
    m.style.width = (C.z.menace * 100) + '%';
    m.classList.toggle('imminent', !C.aTerre && C.z.menace > 0.7);
    m.classList.toggle('gele', !!C.aTerre);
  }
  // Jauge d'endurance : un mince liseré en bas.
  const s = $('#cb-sta');
  if (s) {
    const r = G.player.sta / G.player.staMax;
    s.style.width = (r * 100) + '%';
    s.classList.toggle('bas', r < 0.25);
  }
  // Santé du zombie actif : barre horizontale en bas, au centre.
  const zhp = $('#cb-zhp');
  if (zhp) {
    const rz = Math.max(0, C.z.hp) / C.z.hpMax;
    zhp.style.width = (rz * 100) + '%';
    zhp.classList.toggle('bas', rz < 0.3);
  }
  updateHUD();
  // État des boutons ronds selon l'endurance — pendant une charge, une frappe en vol
  // ou un autre bouton maintenu, on n'arme rien d'autre.
  document.querySelectorAll('.cb [data-cout]').forEach(b => {
    const cout = parseFloat(b.dataset.cout);
    const act = b.dataset.act;
    if (act === 'defense' || act === 'journal') { b.disabled = false; return; }
    // Esquive : toujours active pendant une fenêtre réflexe (le QTE n'a pas de coût).
    if (act === 'esquiver' && C.qteFinir) { b.disabled = false; return; }
    if (C.def) { b.disabled = true; return; }   // garde levée : rien d'autre
    if (C.chg) { b.disabled = act !== 'attaquer'; return; }
    if (C.hold) { b.disabled = b !== C.hold.btn; return; }
    if (C.frappe) { b.disabled = true; return; }
    b.disabled = G.player.sta < cout;
  });
}

// Reflet visuel de l'état du mort actif : penché « à terre », classe sur le calque.
function majSceneEtat() {
  const z = $('#z-actif');
  if (z) z.classList.toggle('z-terre', !!C.aTerre);
}

// ---------- Attaque du zombie ----------
function attaqueZombie() {
  const z = C.z;
  if (C.aTerre) return; // au sol, il ne peut pas frapper

  // Hurleur : appelle du renfort la première fois
  if (z.def.hurle && !C.hurleurACrie) {
    C.hurleurACrie = true;
    sfx('hurlement');
    clog(`<span class="gore">Le hurleur rejette la tête en arrière et pousse un cri qui déchire le silence sur des centaines de mètres.</span>`);
    if (chance(0.7)) {
      const renfort = pick(zombiesPoolCourant());
      C.queue.push(renfort);
      clog(`Quelque chose lui répond, pas loin. <b>Un ${zombie(renfort).nom.toLowerCase()} arrive !</b>`, 'degats');
    }
    return;
  }

  // Esquive réflexe : parfois il SE JETTE sur toi — un bouton surgit au milieu,
  // à toi d'appuyer à temps. Pas à chaque coup, et jamais deux fois de suite.
  if (!estEnGarde() && performance.now() > (C.qteJusqua || 0) && chance(0.5)) {
    lancerEsquiveQTE();
    return;
  }
  resoudreAttaque(1);
}

// La fenêtre d'esquive : un bouton au centre de la scène, une fenêtre courte
// (l'agilité l'allonge), et l'anneau qui se referme dit le temps qui reste.
function lancerEsquiveQTE() {
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  const fenetre = Math.min(1000, 620 + agi * 50);
  C.qteJusqua = performance.now() + 9000;
  sfx('alerte');
  clog(`<b>${leZombie(C.z.def.nom, true)} se jette sur toi !</b>`, 'degats');
  const scene = $('.combat-scene');
  if (!scene) { resoudreAttaque(1); return; }
  const ov = document.createElement('div');
  ov.className = 'qte';
  ov.innerHTML = `<button class="qte-btn"><span class="qte-anneau" style="animation-duration:${fenetre}ms"></span>Esquiver !</button>`;
  scene.appendChild(ov);
  let fini = false;
  const finir = (reussi) => {
    if (fini) return;
    fini = true;
    ov.remove();
    C.qteFinir = null; // la fenêtre se referme : le bouton Esquiver redevient « délibéré »
    if (!C || C.fini) return;
    if (C.qteTimer) { clearTimeout(C.qteTimer); C.qteTimer = null; }
    if (reussi) {
      sfx('esquive');
      flashCombat('Esquive !', 'coup');
      clog('Tu plonges sur le côté — il traverse le vide et s\'écrase là où tu étais. <em>Une seconde pour frapper.</em>', 'coup');
      C.contreJusqua = performance.now() + 2500;
      C.z.menace = 0;
      const up = gainSkill('agilite', 4);
      if (up) clog(`<b>Agilité niveau ${up.niveau} !</b>`, 'coup');
      majBarres();
    } else {
      resoudreAttaque(0.3); // la fenêtre est passée : les réflexes ne sauvent presque plus
    }
  };
  // Le bouton ESQUIVER (à droite de la garde) déclenche aussi cette fenêtre réflexe.
  C.qteFinir = finir;
  ov.querySelector('.qte-btn').onclick = () => finir(true);
  C.qteTimer = setTimeout(() => finir(false), fenetre);
}

// Le bouton ESQUIVER, en tap. Pendant une fenêtre réflexe, il vaut le QTE. Sinon c'est
// un pas de côté DÉLIBÉRÉ : payant si le mort est sur le point de frapper (menace haute),
// peu utile s'il n'est pas encore lancé — à doser, comme tout ce qui coûte de l'endurance.
function resoudreEsquive() {
  if (!C || C.fini) return;
  if (C.qteFinir) { C.qteFinir(true); return; }     // une ruée est en cours : c'est LE moment
  if (C.def || C.chg || C.hold || C.frappe) return; // pas pendant une autre action
  if (C.aTerre) { flashCombat('Inutile', ''); return; } // il est au sol : rien à esquiver
  if (!depenser(COUTS.esquive)) return;
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  if (C.z.menace > 0.5) {
    sfx('esquive');
    flashCombat('Esquive !', 'coup');
    clog('Tu anticipes sa ruée et plonges sur le côté — il mord le vide. <em>Une seconde pour frapper.</em>', 'coup');
    C.z.menace = 0;
    C.contreJusqua = performance.now() + 2200;
    const up = gainSkill('agilite', 3);
    if (up) clog(`<b>Agilité niveau ${up.niveau} !</b>`, 'coup');
  } else {
    sfx('rate');
    flashCombat('Pas de côté', '');
    clog('Tu prends tes distances d\'un pas vif. Il n\'était pas encore lancé — tu n\'as fait que souffler un peu.', '');
    C.z.menace = Math.max(0, C.z.menace - 0.18);
  }
  majBarres();
}

function resoudreAttaque(factEsquive) {
  const p = G.player;
  const z = C.z;

  // Esquive du joueur (réflexe passif). La garde ajoute un bonus PROPORTIONNEL à sa charge.
  const defN = defNiveau();
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  let pEsquive = (0.1 + agi * 0.05 + DEFENSE.esquiveMax * defN) * factEsquive;
  if (p.sta < 15) pEsquive *= 0.5;
  if (enSurpoids()) pEsquive *= (1 - 0.55 * surpoidsFacteur()); // chargé comme une mule : on esquive mal
  if (chance(pEsquive)) {
    sfx('rate');
    flashCombat(defN > 0.05 ? 'Bloqué' : 'Esquive', '');
    clog(defN > 0.05 ? 'Tu bloques son assaut, arc-bouté derrière ta garde.' : 'Tu te jettes sur le côté — ses ongles fendent l\'air à un cheveu de ton visage.');
    const up = gainSkill('agilite', 2);
    if (up) clog(`<b>Agilité niveau ${up.niveau} !</b>`, 'coup');
    return;
  }

  // Dégâts — chaque type de zombie a ses coups : la description et la zone touchée vont ensemble
  const atk = z.def.attaques ? pick(z.def.attaques) : null;
  let deg = rng(z.def.dmg[0], z.def.dmg[1]);
  const prot = protectionTotale();
  deg = Math.max(1, Math.round(deg - prot * 1.1 - deg * DEFENSE.reducMax * defN));
  p.pv = Math.max(0, p.pv - deg);
  sfx('degats');
  secouerScene();
  flashCombat(deg >= 12 ? 'Mordu !' : 'Touché', 'degats');
  clog(`${atk ? atk.desc : 'Il t\'atteint de plein fouet.'} <b class="degats">Tu encaisses.</b>`, 'degats');

  // Un coup encaissé en pleine charge (ou pendant que la frappe est en vol) peut briser
  // l'élan : seuls les coups très armés (charge > 0.6) sont assez engagés pour se perdre.
  const cElan = C.chg && C.chg.type === 'melee' ? C.chg.c : (C.frappe ? C.frappe.c : 0);
  if (cElan > 0.6 && chance(0.5)) briserElan(cElan);

  // Blessure — localisée là où le coup a porté
  if (chance(0.45) && deg > 3) {
    const grav = Math.min(z.def.blessureMax, pick([1, 1, 1, 2, 2, 3, 4]));
    const type = ['egratignure', 'entaille', 'profonde', 'plaie'][grav - 1];
    const msgs = ajouterBlessure(type, atk ? atk.zones : null);
    const b = p.blessures[p.blessures.length - 1];
    if (b && chance(z.def.infection * 3)) b.souillee = true;
    msgs.forEach(m => clog(m.t, 'degats'));
  }

  if (p.pv <= 0) finMort();
}

// ---------- Actions du joueur ----------
function infoArme() {
  const a = armeEquipee();
  if (!a) {
    const n = skillLevel('mainsNues');
    return { nom: 'Mains nues', dmg: [3 + n, 6 + n * 2], skill: 'mainsNues', mains: true };
  }
  const d = item(a.id);
  return { nom: d.nom, dmg: d.dmg, skill: d.skill || 'dexterite', feu: d.feu, ammo: d.ammo, bruit: d.bruit || 0, def: d, ref: a };
}

function depenser(cout) {
  if (G.player.sta < cout) { clog('Trop épuisé. Mets-toi en défense pour récupérer.', 'degats'); return false; }
  G.player.sta -= cout;
  return true;
}

// ---------- Attaque chargée : maintenir, c'est armer ; relâcher, c'est frapper ----------
// Mêlée : la charge augmente dégâts, critique et coût, mais pénalise la précision et
// retarde l'impact. Arme à feu : maintenir, c'est VISER — relâcher tire aussitôt.

// Interpolation de couleur pour l'anneau (deux hexa → rgb)
function lerpHex(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * t);
  const g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * t);
  const bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

// Mêlée : blanc cassé → orange → rouge sang. Visée : gris clair → bleu acier.
function couleurCharge(c, type) {
  if (type === 'tir') return lerpHex('#b9c4cc', '#5d8fb5', c);
  return c < 0.55 ? lerpHex('#cfc9b8', '#c97a27', c / 0.55) : lerpHex('#c97a27', '#d6303e', (c - 0.55) / 0.45);
}

function elemsAnneau() {
  const btn = document.querySelector('.cb [data-act="attaquer"]');
  return { btn, prog: btn ? btn.querySelector('.cb-ring-prog') : null };
}

function resetAnneau() {
  const { btn, prog } = elemsAnneau();
  if (btn) btn.classList.remove('chg-active', 'chg-pleine', 'chg-plafond', 'chg-tir');
  if (prog) prog.style.strokeDashoffset = ANNEAU_CIRC;
}

function majAnneau(ch) {
  const { btn, prog } = elemsAnneau();
  if (!btn || !prog) return;
  prog.style.strokeDashoffset = ANNEAU_CIRC * (1 - ch.c);
  prog.style.stroke = couleurCharge(ch.c, ch.type);
  btn.classList.add('chg-active');
  btn.classList.toggle('chg-tir', ch.type === 'tir');
  btn.classList.toggle('chg-pleine', ch.c >= 0.999);
  btn.classList.toggle('chg-plafond', !!ch.plafond);
}

// Le doigt se pose : la charge commence. Rien n'est dépensé tant qu'on ne relâche pas.
function debuterCharge(e, btn) {
  if (!C || C.fini || C.def || C.chg || C.frappe) return;
  const arme = infoArme();
  if (arme.feu) {
    if (munitionsPour(arme.ref.id) <= 0) { clog('<b>Clic.</b> Plus de munitions.', 'degats'); return; }
    if (G.player.sta < COUTS.tir) { clog('Trop épuisé. Mets-toi en défense pour récupérer.', 'degats'); return; }
  } else if (G.player.sta < CHARGE.coutMin) {
    clog('Trop épuisé. Mets-toi en défense pour récupérer.', 'degats');
    return;
  }
  try { btn.setPointerCapture(e.pointerId); } catch (err) { /* navigateur sans capture : pointerleave prendra le relais */ }
  C.chg = {
    type: arme.feu ? 'tir' : 'melee',
    c: 0,
    prev: performance.now(),
    raf: null,
    pointerId: e.pointerId,
    vibre: false,    // une seule vibration à pleine charge
    annonce: false,  // un seul message d'élan par charge
    plafond: false,
    duree: arme.feu ? Math.max(900, CHARGE.viseeDuree - skillLevel('visee') * 70) : CHARGE.duree,
  };
  majBarres();
  bouclerCharge();
}

// La jauge monte image par image — le tick de combat, lui, continue de tourner à côté.
function bouclerCharge() {
  if (!C || C.fini || !C.chg) return;
  const ch = C.chg;
  const now = performance.now();
  const dt = Math.min(120, now - ch.prev);
  ch.prev = now;
  if (ch.type === 'melee') {
    // la jauge PLAFONNE au niveau que l'endurance peut payer — l'anneau bute
    const cMax = Math.max(0, Math.min(1, (G.player.sta - CHARGE.coutMin) / CHARGE.coutPlein));
    ch.c = Math.min(ch.c + dt / ch.duree, cMax);
    ch.plafond = cMax < 1 && ch.c >= cMax - 0.002;
    if (!ch.annonce && ch.c > 0.6) {
      ch.annonce = true;
      sfx('puissance_charge');
      clog('Tu armes ton coup, tout le poids du corps derrière…');
    }
  } else {
    ch.c = Math.min(1, ch.c + dt / ch.duree);
  }
  if (ch.c >= 0.999 && !ch.vibre) {
    ch.vibre = true;
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (err) { /* pas de vibreur : tant pis */ }
  }
  majAnneau(ch);
  ch.raf = requestAnimationFrame(bouclerCharge);
}

function annulerCharge() {
  if (!C || !C.chg) return;
  if (C.chg.raf) cancelAnimationFrame(C.chg.raf);
  C.chg = null;
}

// Le doigt se lève (ou glisse : pointercancel passe ici aussi — la charge atteinte part quand même).
function relacherCharge() {
  if (!C || C.fini || !C.chg) return;
  const ch = C.chg;
  annulerCharge();
  if (ch.type === 'tir') {
    resetAnneau();
    resoudreTir(ch.c);
  } else {
    const c = ch.c;
    G.player.sta = Math.max(0, G.player.sta - Math.min(G.player.sta, CHARGE.coutMin + CHARGE.coutPlein * c));
    // Délai de frappe : plus le coup est chargé, plus il met de temps à arriver —
    // et pendant ce temps, le zombie ne t'attend pas. L'anneau reste figé : le coup est en vol.
    const delai = CHARGE.delaiMin + (CHARGE.delaiMax - CHARGE.delaiMin) * c;
    C.frappe = { c, timer: setTimeout(() => frappeMelee(c), delai) };
  }
  if (C && !C.fini) majBarres();
}

// L'élan se brise sous un coup encaissé : la frappe est perdue, l'endurance engagée aussi.
function briserElan(c) {
  if (C.frappe) {
    clearTimeout(C.frappe.timer);
    C.frappe = null; // l'endurance a déjà été dépensée au relâcher
  } else if (C.chg) {
    // on paie le coup qu'on n'a pas pu donner
    G.player.sta = Math.max(0, G.player.sta - (CHARGE.coutMin + CHARGE.coutPlein * c));
    annulerCharge();
  }
  resetAnneau();
  clog('Le choc te coupe l\'élan — ton coup est perdu, l\'endurance avec.', 'degats');
}

// L'impact du coup de mêlée, après son délai de vol
function frappeMelee(c) {
  if (!C || C.fini) return;
  C.frappe = null;
  resetAnneau();
  const arme = infoArme();
  const sk = skillLevel(arme.skill);
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  // Précision : la base habituelle, pénalisée par la charge — un coup de fléau se voit venir
  let pTouche = 0.62 + sk * 0.06 - C.z.def.esquive;
  if (performance.now() < (C.contreJusqua || 0)) pTouche += 0.22; // il est au sol de son élan : frappe !
  if (G.player.sta < 15) pTouche -= 0.15;
  if (arme.def && arme.def.allonge) pTouche += 0.05;
  pTouche *= Math.min(1, 1 - 0.28 * c + agi * 0.035);
  if (enSurpoids()) pTouche *= (1 - 0.25 * surpoidsFacteur()); // le barda gêne aussi tes coups
  if (chance(Math.max(0.12, pTouche))) {
    if (c >= 0.7) sfx('puissance');
    const crit = chance(0.08 + skillLevel('dexterite') * 0.02 + c * 0.18 + (C.aTerre ? ATERRE.bonusCrit : 0));
    let deg = Math.round(rng(arme.dmg[0], arme.dmg[1]) * (0.55 + 1.45 * c));
    if (!arme.mains) deg += Math.round(skillLevel('force') * (1 + c));
    if (arme.mains) deg += Math.round(skillLevel('mainsNues') * (1.2 + 0.8 * c));
    if (crit) deg = Math.round(deg * 1.6);
    if (C.aTerre) deg = Math.round(deg * ATERRE.multiDeg); // il est au sol : tu l'achèves
    effetZombie(crit ? 'z-crit' : 'z-impact');
    flashCombat(crit ? 'Critique !' : (C.aTerre ? 'Achevé' : 'Touché'), 'coup');
    if (c >= 0.7) clog('<span class="gore">Le coup part comme un fléau, tout ton poids derrière. Ça craque.</span>', 'coup');
    C.z.menace = Math.max(0, C.z.menace - 0.3 * c); // un coup lourd le fait reculer (en plus du recul de base)
    const fini = infligerDegats(deg, crit, arme);
    // usure — frapper plus fort use plus (×(1+c) en moyenne), même sur le coup fatal
    if (arme.ref) {
      let usure = chance(skillLevel('entretien') * 0.1) ? 0 : 1;
      if (chance(c)) usure += 1;
      arme.ref.dur -= usure;
      if (arme.ref.dur <= 0) {
        clog('<b>Ton arme se brise entre tes mains !</b>', 'degats');
        log(`${arme.nom} : hors d'usage. Il faudra trouver autre chose.`, 'warn');
        G.player.equip.arme = null;
      }
    }
    const up = gainSkill(arme.skill, 2);
    if (up) clog(`<b>${up.skill === 'mainsNues' ? 'Mains nues' : 'Compétence'} niveau ${up.niveau} !</b>`, 'coup');
    // XP : la force se forge sur les coups appuyés, l'agilité sur les coups vifs
    if (c >= 0.25) {
      const upF = gainSkill('force', Math.max(1, Math.round(c * 4)));
      if (upF) clog(`<b>Force niveau ${upF.niveau} !</b>`, 'coup');
    } else {
      const upA = gainSkill('agilite', 1);
      if (upA) clog(`<b>Agilité niveau ${upA.niveau} !</b>`, 'coup');
    }
    if (fini) return; // le combat s'est terminé sur ce coup : ne plus toucher à C
  } else {
    sfx('rate');
    flashCombat('Manqué', '');
    if (c > 0.5) {
      clog('Trop téléphoné : il se déporte et ton coup laboure le vide. Tu titubes, déséquilibré.');
      C.z.menace = Math.min(1, C.z.menace + 0.25 * c);
    } else {
      clog(`Ton coup fend l'air. ${leZombie(C.z.def.nom, true)} avance toujours.`);
    }
    gainSkill(arme.skill, 1);
  }
  majBarres();
}

// Le tir part au relâcher, sans délai : la visée a (0→1) fait toute la précision.
function resoudreTir(a) {
  const arme = infoArme();
  if (!arme.feu) return;
  if (munitionsPour(arme.ref.id) <= 0) { clog('<b>Clic.</b> Plus de munitions.', 'degats'); return; }
  if (!depenser(COUTS.tir)) return;
  removeItem(arme.ammo, 1);
  sfx('tir');
  const sk = skillLevel('visee');
  let pTouche = Math.min(0.97, 0.45 + 0.5 * a + sk * 0.02 - C.z.def.esquive);
  if (chance(Math.max(0.2, pTouche))) {
    const crit = chance(0.12 + sk * 0.03 + (C.aTerre ? ATERRE.bonusCrit : 0));
    let deg = rng(arme.dmg[0], arme.dmg[1]);
    if (crit) deg = Math.round(deg * 1.7);
    if (C.aTerre) deg = Math.round(deg * ATERRE.multiDeg);
    effetZombie(crit ? 'z-crit' : 'z-impact');
    flashCombat(crit ? 'En pleine tête !' : 'Touché', 'coup');
    const fini = infligerDegats(deg, crit, arme);
    const up = gainSkill('visee', 3);
    if (up) clog(`<b>Visée niveau ${up.niveau} !</b>`, 'coup');
    if (fini) return; // dernier zombie abattu : le combat est clos, le bruit n'attire plus rien ici
  } else {
    flashCombat('Manqué', '');
    clog(a < 0.3
      ? 'Tir précipité — la balle part n\'importe où, avalée par la nuit.'
      : 'La détonation claque — la balle s\'écrase dans un mur. Raté.');
    gainSkill('visee', 1);
  }
  // Le bruit attire
  if (chance(0.3) && C.queue.length < 3) {
    const renfort = pick(zombiesPoolCourant());
    C.queue.push(renfort);
    clog(`<b>Le coup de feu résonne dans tout le quartier. Quelque chose approche...</b>`, 'degats');
  }
}

// Retourne true si le combat s'est terminé sur ce coup (victoire ou mort du joueur)
function infligerDegats(deg, crit, arme) {
  C.derniereDistance = !!arme.feu; // tir ou projectile : on n'est pas au contact
  C.z.hp -= deg;
  // Co-op : mon coup use aussi le zombie commun chez mon coéquipier (rencontre partagée).
  // On joint le TYPE du mort visé : si la file de l'autre a divergé (morts tués dans un
  // ordre différent), il n'applique pas mon coup au mauvais adversaire.
  if (multi.estMulti() && C.enc && !C.appliquantDistant) multi.diffuserCombat({ sub: 'degats', enc: C.enc, deg, zid: C.z.id });
  sfx(crit ? 'coup_critique' : 'coup');
  const fl = $('.combat-scene .flash');
  if (fl) { fl.classList.remove('hit'); void fl.offsetWidth; fl.classList.add('hit'); }
  if (crit) {
    clog(`<span class="gore">${descCritique(arme)}</span>`, 'coup');
  } else {
    clog(`Tu touches ${leZombie(C.z.def.nom)} (${arme.nom.toLowerCase()}). Il est ${etatZombie()}.`);
  }
  // le choc le fait reculer un peu
  C.z.menace = Math.max(0, C.z.menace - 0.15);
  if (C.z.hp <= 0) zombieMort();
  return !C || C.fini;
}

function descCritique(arme) {
  if (arme.feu) return pick([
    'La balle entre par l\'orbite et repeint le mur derrière lui.',
    'Sa tête bascule en arrière dans un nuage rouge.',
  ]);
  if (arme.mains) return pick([
    'Ton poing s\'enfonce dans sa tempe avec un craquement sourd.',
    'Tu lui rabats la tête contre ton genou. Quelque chose cède.',
  ]);
  return pick([
    'Le coup s\'enfonce dans le crâne avec un bruit de noix qu\'on brise.',
    'Tu frappes si fort que la mâchoire part de travers, à moitié arrachée.',
    'L\'os cède. Le coup résonne jusque dans ton épaule.',
  ]);
}

function zombieMort() {
  const z = C.z;
  G.player.morts++;
  clog(`<span class="gore">${z.def.gore}</span>`, 'gore');

  // Gonflé : explose
  if (z.def.explose) {
    sfx('explosion');
    const distance = C.derniereDistance;
    if (!distance) {
      const deg = rng(6, 16);
      G.player.pv = Math.max(0, G.player.pv - deg);
      clog(`<span class="gore">Le corps gonflé éclate ! Tu es aspergé de fluides putrides.</span>`, 'degats');
      if (chance(0.5)) {
        // l'explosion crible ce qui est exposé : visage et bras
        ajouterBlessure('egratignure', ['au visage', 'à l\'avant-bras', 'à la main']).forEach(m => clog(m.t, 'degats'));
        const b = G.player.blessures[G.player.blessures.length - 1];
        if (b) b.souillee = true;
      }
      if (G.player.pv <= 0) return finMort();
    } else {
      clog('Le corps éclate à distance. Bien visé.');
    }
  }

  if (C.queue.length) {
    const suivant = C.queue.shift();
    C.z = creerZombie(suivant);
    sfx('zombie');
    clog(`<b>Pas le temps de souffler : ${leZombie(C.z.def.nom)} est sur toi !</b>`, 'degats');
    clog(`<span class="gore">${C.z.def.desc}</span>`);
    renderCombat(true);
    diffuserSnapshotCombat(); // co-op : la file a changé — on tient le coéquipier à jour
  } else {
    finVictoire();
  }
}

// ---------- REPOUSSER (jauge maintenue) : succès = mort À TERRE ; échec = morsure ----------
// La poussée n'a lieu qu'à la fin de la jauge ; pendant qu'on s'arc-boute, le mort, lui,
// continue d'avancer (la menace monte) — d'où le risque.
function resoudrePousser() {
  if (!C || C.fini || C.def) return;
  if (!depenser(COUTS.pousser)) return;
  const f = skillLevel('force');
  let p = 0.5 + f * 0.1;
  if (enSurpoids()) p -= 0.12 * surpoidsFacteur();
  if (C.z.id === 'colosse') p -= 0.25; // une montagne ne tombe pas si facilement
  if (chance(Math.max(0.1, p))) {
    C.aTerre = performance.now() + ATERRE.duree;
    C.z.menace = 0;
    sfx('coup');
    effetZombie('z-chute');
    majSceneEtat();
    flashCombat('À terre !', 'coup');
    clog('Tu charges de l\'épaule — il bascule en arrière et s\'effondre lourdement. <b>Il est à terre : achève-le tant qu\'il est au sol.</b>', 'coup');
    gainSkill('force', 3);
  } else {
    flashCombat('Poussée ratée', 'degats');
    clog('Tu pousses — il tient bon, plus lourd que prévu, et se rabat aussitôt sur toi.', 'degats');
    gainSkill('force', 1);
    if (chance(ATERRE.risqueMorsure)) resoudreAttaque(1); // tu t'es découvert : il mord
  }
}

// ---------- SE DÉFENDRE : la garde se CHARGE (maintenir) ----------
// Plus on maintient, meilleure est la garde (réduction de dégâts + esquive, PROPORTIONNELLES
// à la charge). Mais une garde poussée à fond ne tient pas : arrivée au max, elle ne dure que
// DEFENSE.tenueMax, puis les bras lâchent et TOUTE la protection tombe d'un coup — comme si l'on
// ne se défendait pas — jusqu'à ce qu'on relâche et reprenne.
function defNiveau() { return C && C.def && !C.def.collapsed ? C.def.c : 0; }
function estEnGarde() { return defNiveau() > 0.08; }

// Anneau de la garde : acier terne → garde solide ; rouge pulsé au bord de la rupture.
function couleurDefense(c, danger) {
  if (danger) return '#d6303e';
  return lerpHex('#7c8aa0', '#cfd6cf', c);
}

function majAnneauDefense() {
  const btn = $('[data-act="defense"]');
  if (!btn) return;
  const prog = btn.querySelector('.cb-ring-prog');
  const d = C && C.def;
  if (!d) {
    if (prog) prog.style.strokeDashoffset = ANNEAU_CIRC;
    btn.classList.remove('chg-active', 'chg-pleine', 'chg-plafond', 'actif');
    return;
  }
  if (prog) {
    prog.style.strokeDashoffset = ANNEAU_CIRC * (1 - d.c);
    prog.style.stroke = couleurDefense(d.c, d.max && !d.collapsed);
  }
  btn.classList.add('chg-active');
  btn.classList.toggle('chg-pleine', d.max && !d.collapsed);
  btn.classList.toggle('chg-plafond', d.collapsed); // garde rompue : anneau « buté »
}

function debuterDefense(e, btn) {
  if (!C || C.fini || C.chg || C.hold || C.frappe || C.def) return;
  try { btn.setPointerCapture(e.pointerId); } catch (err) { /* sans capture : pointerleave prend le relais */ }
  C.def = { c: 0, prev: performance.now(), raf: null, pointerId: e.pointerId, max: false, maxTimer: 0, collapsed: false, vibre: false };
  btn.classList.add('actif');
  sfx('clic');
  clog('Tu lèves ta garde et t\'arc-boutes — elle se renforce tant que tu tiens.');
  majBarres();
  boucleDefense();
}

function boucleDefense() {
  if (!C || C.fini || !C.def) return;
  const d = C.def;
  const now = performance.now();
  const dt = Math.min(120, now - d.prev);
  d.prev = now;
  if (!d.collapsed) {
    if (!d.max) {
      d.c = Math.min(1, d.c + dt / DEFENSE.duree);
      if (d.c >= 0.999) {
        d.max = true;
        d.maxTimer = now + DEFENSE.tenueMax;
        if (!d.vibre) { d.vibre = true; try { if (navigator.vibrate) navigator.vibrate(15); } catch (err) { /* pas de vibreur */ } }
        clog('Garde au maximum — elle ne tiendra qu\'un instant.', 'coup');
      }
    } else if (now >= d.maxTimer) {
      d.collapsed = true;
      d.c = 0;
      sfx('rate');
      flashCombat('Garde rompue', 'degats');
      clog('Tes bras lâchent — ta garde s\'effondre, tu es à découvert.', 'degats');
    }
  }
  majAnneauDefense();
  d.raf = requestAnimationFrame(boucleDefense);
}

function finDefense() {
  if (!C || !C.def) return;
  const d = C.def;
  if (d.raf) cancelAnimationFrame(d.raf);
  C.def = null;
  majAnneauDefense();
  if (C && !C.fini) { clog('Tu relèves la garde, prêt à frapper.'); majBarres(); }
}

// ---------- Résolution d'un jet (objet de jet lancé depuis l'accès rapide) ----------
function resoudreJet(id, dur) {
  const d = item(id);
  const sk = skillLevel('dexterite');
  sfx('coup');
  if (chance(0.5 + sk * 0.08)) {
    let deg = Math.round(rng(d.dmg[0], d.dmg[1]) * 1.5);
    if (d.feuFlamme) {
      sfx('explosion');
      deg = rng(d.dmg[0], d.dmg[1]);
      effetZombie('z-crit');
      flashCombat('Embrasé !', 'gore');
      clog(`<span class="gore">La bouteille explose en gerbe de flammes. ${leZombie(C.z.def.nom, true)} s'embrase en silence — ils ne crient jamais.</span>`, 'gore');
      if (C.queue.length && chance(0.5)) {
        clog(`<b>Les flammes rattrapent ${leZombie(zombie(C.queue[0]).nom)} derrière !</b>`, 'coup');
        C.queue.shift();
        G.player.morts++;
      }
    } else {
      effetZombie('z-impact');
      flashCombat('Touché', 'coup');
      clog('Tu le lances de toutes tes forces — ça porte.');
      if (!d.jetSeul) C.armesJetees.push({ id, dur, touche: true });
    }
    infligerDegats(deg, false, { nom: d.nom + ' (jeté)', feu: true }); // un jet se fait à distance
    gainSkill('dexterite', 3);
  } else {
    flashCombat('Manqué', '');
    clog('Ton projectile rebondit sur lui et glisse au sol, quelque part dans le noir.');
    if (!d.jetSeul) C.armesJetees.push({ id, dur, touche: false });
  }
}

// ---------- ACCÈS RAPIDE (un bouton maintenu par objet, en haut de l'écran) ----------
// Dégaine une arme, lance un objet de jet, ou se bande — selon la nature de l'objet.
function resoudreAcces(idx) {
  if (!C || C.fini || C.def) return;
  const it = accesRapide()[idx];
  if (!it) return;
  const d = item(it.id);
  if (!d) return;
  // Soin (bandage) : stoppe un saignement.
  if (d.type === 'soin' && d.soin === 'bandage') {
    const bl = G.player.blessures.find(x => x.saigne && !x.bandee);
    if (!bl) { flashCombat('Rien à bander', ''); clog('Aucun saignement à bander.'); return; }
    if (!depenser(COUTS.bander)) return;
    removeItem(it.id, 1);
    bl.bandee = true;
    if (it.id === 'bandage_fortune' && !bl.desinfectee) bl.bandeSale = true;
    if (!C.aTerre) C.z.menace = Math.min(1, C.z.menace + 0.3); // il avance pendant que tu te bandes
    flashCombat('Bandé', 'coup');
    clog('Tu serres le bandage en gardant un œil sur lui. Le saignement s\'arrête.', 'coup');
    sfx('soin');
    renderCombat(true);
    return;
  }
  // Objet de jet : on le lance.
  if (d.dmg && d.jetSeul) {
    if (!depenser(COUTS.jeter)) return;
    accesRapide().splice(idx, 1); // l'objet quitte la ceinture
    resoudreJet(it.id, it.dur);
    if (C && !C.fini) renderCombat(true);
    return;
  }
  // Arme : on la dégaine (l'arme en main, s'il y en a une, retourne à la ceinture).
  if (d.dmg) {
    if (!depenser(COUTS.changer)) return;
    if (degainerAccesRapide(idx)) {
      flashCombat('Arme en main', 'coup');
      clog(`Tu dégaines : ${item(armeEquipee().id).nom}.`);
      sfx('clic');
    }
    renderCombat(true);
  }
}

// ---------- FUIR (jauge maintenue) ----------
function resoudreFuir() {
  if (!C || C.fini || C.def) return;
  if (!depenser(COUTS.fuir)) return;
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  let p = 0.4 + agi * 0.1;
  if (['coureur', 'chien_infecte', 'enrage'].includes(C.z.id)) p -= 0.18;
  if (C.aTerre) p += 0.35; // il est au sol : c'est le moment de détaler
  if (chance(Math.max(0.1, p))) {
    flashCombat('Tu fuis', 'coup');
    clog('Tu tournes les talons et cours sans te retourner, le souffle en feu.');
    gainSkill('agilite', 5);
    finCombat('fuite');
  } else {
    flashCombat('Rattrapé !', 'degats');
    clog('<b>Tu trébuches dans ta fuite — il te rattrape !</b>', 'degats');
    gainSkill('agilite', 2);
    attaqueZombie();
  }
}

// ---------- Fins de combat ----------
function nettoyer() {
  if (C && C.timer) clearInterval(C.timer);
  if (C && C.qteTimer) clearTimeout(C.qteTimer);
  if (C && C.frappe) clearTimeout(C.frappe.timer);
  if (C && C.chg && C.chg.raf) cancelAnimationFrame(C.chg.raf);
  if (C && C.hold && C.hold.raf) cancelAnimationFrame(C.hold.raf);
  if (C && C.def && C.def.raf) cancelAnimationFrame(C.def.raf);
  const qte = document.querySelector('.qte');
  if (qte) qte.remove();
  stopCombatMusic();
  setHeartbeat(false);
  showHUD(true); // le combat se termine : on retrouve l'interface de déplacement
  if (multi.estMulti()) multi.diffuserPosition({ enCombat: false }); // co-op : je ne suis plus en combat
}

function finVictoire(distant = false) {
  nettoyer();
  C.fini = true;
  const enc = C.enc;
  // Les armes jetées restent au sol : il suffira de fouiller la zone.
  // Si le jet a raté sa cible, l'arme a pu glisser n'importe où — parfois perdue.
  let msgArme = '';
  for (const a of C.armesJetees) {
    if (!a.touche && chance(0.25)) {
      msgArme = ` ${item(a.id).nom} a glissé hors de portée — introuvable.`;
      continue;
    }
    deposerAuSol(keyCourante(), { id: a.id, qty: 1, dur: a.dur, cache: true });
    msgArme = ' Ton arme est tombée quelque part ici : fouille la zone pour la récupérer.';
  }
  const opts = C.opts;
  C = null;
  // Co-op : si la rencontre était partagée, prévenir le coéquipier que c'est fini.
  if (multi.estMulti() && enc && !distant) multi.diffuserCombat({ sub: 'fin', enc });
  log(`Combat gagné.${msgArme}`, 'good');
  updateHUD();
  if (opts.onFin) opts.onFin('victoire');
}

function finCombat(resultat) {
  nettoyer();
  C.fini = true;
  const opts = C.opts;
  // armes jetées abandonnées en fuyant
  C = null;
  updateHUD();
  if (resultat === 'fuite') log('Tu as fui le combat. Ce que tu as jeté est resté derrière toi.', 'warn');
  if (opts.onFin) opts.onFin(resultat);
}

function finMort() {
  nettoyer();
  C.fini = true;
  C = null;
  mortJoueur('combat');
}

// ---------- Rendu : un écran de combat à part entière ----------
// Plus aucune trace de l'interface de déplacement : le décor remplit l'écran, les morts
// sont INCRUSTÉS par-dessus (une image chacun), et tout se pilote par des BOUTONS RONDS
// transparents (icône seule) qu'on MAINTIENT. Disposition :
//   FUIR en haut gauche · ACCÈS RAPIDE en haut au milieu · journal en haut droite
//   SE DÉFENDRE en bas gauche · ATTAQUER en bas droite · REPOUSSER juste au-dessus.

// Une jauge ronde (anneau) réutilisable pour tous les boutons maintenus.
function ringMarkup() {
  return `<span class="cb-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="cb-ring-fond" cx="18" cy="18" r="15.5"/><circle class="cb-ring-prog" cx="18" cy="18" r="15.5" style="stroke-dasharray:${ANNEAU_CIRC};stroke-dashoffset:${ANNEAU_CIRC}"/></svg></span>`;
}

// Le visuel d'un zombie : sa PHOTO détourée si elle existe (errant, coureur…), sinon la
// silhouette SVG dessinée. La photo remplit le calque, posée sur le bas comme la créature.
function creatureMarkup(zid) {
  const png = pngZombie(zid);
  return png ? `<img class="z-png" src="${png}" alt="" draggable="false">` : svgCombatZombie(zid);
}

// Les morts présents : l'actif grand au centre, la file derrière, plus petite et estompée.
function hordeHTML() {
  let h = `<div class="z-layer z-actif${C.aTerre ? ' z-terre' : ''}" id="z-actif">${creatureMarkup(C.z.id)}</div>`;
  C.queue.slice(0, 4).forEach((id, i) => {
    const cote = i % 2 === 0 ? -1 : 1;
    const prof = Math.floor(i / 2) + 1;
    h += `<div class="z-layer z-fond" style="--cote:${cote};--prof:${prof}">${creatureMarkup(id)}</div>`;
  });
  return h;
}

// Boutons d'accès rapide : un par objet de la ceinture utilisable au combat.
function accesHTML() {
  let h = '';
  armesDisponibles().forEach(a => {
    const cout = a.jet ? COUTS.jeter : COUTS.changer;
    const ic = a.jet ? 'jeter' : (a.def.feu ? 'pistolet' : 'attaque');
    const mun = a.def.ammo ? `<span class="cb-acc-n">${countItem(a.def.ammo)}</span>` : '';
    h += `<button class="cbtn cb-acc" data-act="acces" data-idx="${a.idx}" data-cout="${cout}" title="${a.jet ? 'Lancer' : 'Dégainer'} : ${a.def.nom}">${ringMarkup()}<span class="cb-ic">${ico(ic)}</span>${mun}</button>`;
  });
  soinsAccesRapide().forEach(s => {
    h += `<button class="cbtn cb-acc" data-act="acces" data-idx="${s.idx}" data-cout="${COUTS.bander}" title="Se bander">${ringMarkup()}<span class="cb-ic">${ico('soin')}</span></button>`;
  });
  return h;
}

function renderCombat() {
  showHUD(false); // le combat est une page à part : aucun bouton du mode déplacement
  const arme = infoArme();
  const armeIco = arme.feu ? 'pistolet' : 'attaque';
  const fuitePossible = C.opts.fuitePossible !== false;
  const html = `
  <div class="cb">
    <div class="cb-menace-wrap"><div class="cb-menace-fill" id="cb-menace"></div></div>
    <div class="combat-scene" id="cb-scene">
      <div class="cb-decor">${decorCombat()}</div>
      <div class="cb-horde" id="cb-horde">${hordeHTML()}</div>
      <div class="flash"></div>
      <div class="cb-msg" id="cb-msg" aria-live="polite"></div>
    </div>
    <div class="cb-sta-wrap"><div class="cb-sta-fill" id="cb-sta"></div></div>

    <!-- Santé du zombie : barre horizontale en bas, au centre -->
    <div class="cb-zhp-wrap" id="cb-zhp-wrap" aria-label="Santé de l'adversaire">
      <div class="cb-zhp-fill" id="cb-zhp"></div>
    </div>

    <div class="cb-acces" id="cb-acces">${accesHTML()}</div>
    <button class="cbtn small cb-journal" data-act="journal" title="Journal de combat">${ico('journal')}</button>

    <div class="cb-defense-col">
      ${fuitePossible ? `<button class="cbtn small cb-fuir" data-act="fuir" data-cout="${COUTS.fuir}" title="Fuir (maintenir)">${ringMarkup()}<span class="cb-ic">${ico('fuir')}</span></button>` : ''}
      <div class="cb-def-row">
        <button class="cbtn big cb-defense chg-btn" data-act="defense" data-cout="0" title="Se défendre — maintenir pour charger la garde">${ringMarkup()}<span class="cb-ic">${ico('defense')}</span></button>
        <button class="cbtn cb-esquive" data-act="esquiver" data-cout="${COUTS.esquive}" title="Esquiver — un pas de côté quand il se jette sur toi">${ico('esquiver')}</button>
      </div>
    </div>

    <div class="cb-attaque-col">
      <button class="cbtn cb-pousser" data-act="pousser" data-cout="${COUTS.pousser}" title="Repousser (maintenir)">${ringMarkup()}<span class="cb-ic">${ico('pousser')}</span></button>
      <button class="cbtn big cb-attaque chg-btn" data-act="attaquer" data-cout="${arme.feu ? COUTS.tir : CHARGE.coutMin}" title="${arme.feu ? 'Viser puis tirer' : 'Charger puis frapper'} (maintenir)">${ringMarkup()}<span class="cb-ic">${ico(armeIco)}</span></button>
    </div>

    <div class="cb-log ${C.logOuvert ? '' : 'hidden'}" id="cb-log">
      <div class="cb-log-tete">Journal de combat<button class="cb-log-x" data-act="journal-x" title="Fermer">${ico('croix')}</button></div>
      <div class="cb-log-corps" id="cb-log-corps">${C.logs.join('')}</div>
    </div>
  </div>`;
  render(html);
  wireCombat();
  majBarres();
  const cl = $('#cb-log-corps'); if (cl) cl.scrollTop = cl.scrollHeight;
}

// ---------- Câblage des boutons (tous maintenus) ----------
function wireCombat() {
  // ATTAQUE : charge maintenue, relâcher déclenche (logique dédiée debuterCharge/relacherCharge).
  const btnAtk = document.querySelector('.cb [data-act="attaquer"]');
  if (btnAtk) {
    btnAtk.onpointerdown = (e) => { e.preventDefault(); debuterCharge(e, btnAtk); };
    const lacher = (e) => {
      e.preventDefault();
      if (C && C.chg && e.pointerId !== C.chg.pointerId) return;
      relacherCharge();
    };
    btnAtk.onpointerup = lacher;
    btnAtk.onpointercancel = lacher;
    btnAtk.onpointerleave = (e) => { if (C && C.chg) lacher(e); };
    btnAtk.oncontextmenu = (e) => e.preventDefault();
  }
  // DÉFENSE : maintenir CHARGE la garde (plus c'est long, mieux ça vaut) ; relâcher la baisse.
  const btnDef = document.querySelector('.cb [data-act="defense"]');
  if (btnDef) {
    btnDef.onpointerdown = (e) => { e.preventDefault(); debuterDefense(e, btnDef); };
    const off = (e) => { e.preventDefault(); finDefense(); };
    btnDef.onpointerup = off;
    btnDef.onpointercancel = off;
    btnDef.onpointerleave = (e) => { if (C && C.def) finDefense(); };
    btnDef.oncontextmenu = (e) => e.preventDefault();
  }
  // REPOUSSER / FUIR / ACCÈS RAPIDE : jauge maintenue → l'action n'a lieu qu'à la jauge pleine.
  document.querySelectorAll('.cb [data-act="pousser"], .cb [data-act="fuir"], .cb [data-act="acces"]').forEach(armerBoutonMaintenu);
  // ESQUIVER : un simple tap (réflexe) — pas de jauge à maintenir.
  const btnEsq = document.querySelector('.cb [data-act="esquiver"]');
  if (btnEsq) {
    btnEsq.onclick = (e) => { e.preventDefault(); resoudreEsquive(); };
    btnEsq.oncontextmenu = (e) => e.preventDefault();
  }
  // JOURNAL : simple appui ouvre/ferme l'historique complet.
  document.querySelectorAll('.cb [data-act="journal"], .cb [data-act="journal-x"]').forEach(b => {
    b.onclick = () => {
      if (!C) return;
      C.logOuvert = !C.logOuvert;
      const lg = $('#cb-log'); if (lg) lg.classList.toggle('hidden', !C.logOuvert);
      sfx('clic');
      const cl = $('#cb-log-corps'); if (cl) cl.scrollTop = cl.scrollHeight;
    };
  });
}

// Un bouton « maintenu » générique : l'anneau se remplit ; à plein, l'action se déclenche.
function armerBoutonMaintenu(btn) {
  const act = btn.dataset.act;
  const duree = act === 'fuir' ? MAINTIEN.fuir : act === 'pousser' ? MAINTIEN.pousser : MAINTIEN.acces;
  const cout = parseFloat(btn.dataset.cout) || 0;
  const declencher = () => {
    if (act === 'pousser') resoudrePousser();
    else if (act === 'fuir') resoudreFuir();
    else if (act === 'acces') resoudreAcces(parseInt(btn.dataset.idx, 10));
    if (C && !C.fini) majBarres();
  };
  btn.onpointerdown = (e) => {
    e.preventDefault();
    if (!C || C.fini || C.def || C.chg || C.hold || C.frappe) return;
    if (G.player.sta < cout) { flashCombat('Trop épuisé', 'degats'); return; }
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    C.hold = { btn, act, c: 0, prev: performance.now(), raf: null, duree, pointerId: e.pointerId, plein: declencher };
    btn.classList.add('cb-arme');
    majBarres();
    boucleMaintien();
  };
  const relache = (e) => {
    e.preventDefault();
    if (!C || !C.hold || C.hold.btn !== btn) return;
    if (e.pointerId != null && C.hold.pointerId != null && e.pointerId !== C.hold.pointerId) return;
    finMaintien();
  };
  btn.onpointerup = relache;
  btn.onpointercancel = relache;
  btn.onpointerleave = () => { if (C && C.hold && C.hold.btn === btn) finMaintien(); };
  btn.oncontextmenu = (e) => e.preventDefault();
}

function boucleMaintien() {
  if (!C || C.fini || !C.hold) return;
  const h = C.hold;
  const now = performance.now();
  const dt = Math.min(120, now - h.prev);
  h.prev = now;
  h.c = Math.min(1, h.c + dt / h.duree);
  const prog = h.btn.querySelector('.cb-ring-prog');
  if (prog) { prog.style.strokeDashoffset = ANNEAU_CIRC * (1 - h.c); prog.style.stroke = h.act === 'fuir' ? '#b9c4cc' : '#c97a27'; }
  h.btn.classList.toggle('cb-pleine', h.c >= 0.999);
  if (h.c >= 1) {
    const plein = h.plein;
    finMaintien();
    if (C && !C.fini) plein();
    return;
  }
  h.raf = requestAnimationFrame(boucleMaintien);
}

function finMaintien() {
  if (!C || !C.hold) return;
  const h = C.hold;
  if (h.raf) cancelAnimationFrame(h.raf);
  const prog = h.btn.querySelector('.cb-ring-prog');
  if (prog) prog.style.strokeDashoffset = ANNEAU_CIRC;
  h.btn.classList.remove('cb-arme', 'cb-pleine');
  C.hold = null;
  if (C && !C.fini) majBarres();
}
