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
  armeEquipee, armesDisponibles, soinsAccesRapide, degainerAccesRapide, rengainerArme,
  nbSlotsAccesRapide, removeItem, protectionTotale, bonusAgiliteVetements, countItem, munitionsPour,
} from './inventory.js';
import { ajouterBlessure, mortJoueur } from './survival.js';
import { render, updateHUD, log, $ } from './ui.js';
import { ico } from './icons.js';
import { svgCombat } from './illustrations.js';
import { startCombatMusic, stopCombatMusic, sfx, setHeartbeat } from './audio.js';

let C = null; // état du combat en cours

export function enCombat() { return !!C; }

const COUTS = { tir: 8, pousser: 10, jeter: 12, fuir: 22, changer: 5, bander: 16 };

// Attaque chargée : MAINTENIR le bouton charge le coup (ou la visée), RELÂCHER le déclenche.
// La charge c va de 0 à 1, et TOUT continue pendant ce temps — la menace monte, le zombie frappe.
const CHARGE = {
  duree: 1300,       // ms pour charger un coup de mêlée de 0 à 1
  coutMin: 8,        // endurance d'un coup relâché aussitôt
  coutPlein: 24,     // endurance AJOUTÉE à pleine charge (8 + 24 = 32)
  delaiMin: 120,     // ms entre relâcher et toucher, à charge nulle
  delaiMax: 650,     // ... à pleine charge : un coup de fléau, ça s'annonce
  viseeDuree: 1600,  // ms de visée pleine (armes à feu) — la compétence visee accélère
};
const ANNEAU_CIRC = 97.4; // circonférence du cercle SVG de la jauge de charge (2π × 15.5)

export function demarrerCombat(zombieIds, opts = {}) {
  if (C) return;
  const ids = Array.isArray(zombieIds) ? [...zombieIds] : [zombieIds];
  const premier = ids.shift();
  C = {
    z: creerZombie(premier),
    queue: ids,
    opts,
    defense: false,
    fini: false,
    logs: [],
    timer: null,
    armesJetees: [], // {id, dur, touche} — récupérables en fouillant après le combat
    hurleurACrie: false,
    dernierTick: performance.now(),
    qteTimer: null,   // esquive réflexe en cours
    qteJusqua: 0,     // cooldown : la fenêtre d'esquive ne revient pas tout de suite
    contreJusqua: 0,  // après une esquive réussie : une seconde pour frapper
    chg: null,        // charge en cours (bouton maintenu) : { type, c, prev, raf, ... }
    frappe: null,     // coup de mêlée relâché mais pas encore arrivé : { c, timer }
  };
  startCombatMusic();
  sfx('zombie');
  clog(`<span class="gore">${C.z.def.desc}</span>`);
  if (C.queue.length) clog(`Et derrière... ${C.queue.length} autre${C.queue.length > 1 ? 's' : ''} silhouette${C.queue.length > 1 ? 's' : ''} approche${C.queue.length > 1 ? 'nt' : ''}.`);
  if (opts.surprise) { C.z.menace = 0.65; clog('Il t\'a surpris — il est déjà sur toi !'); }
  renderCombat();
  C.timer = setInterval(tick, 100);
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
  const el = $('#combat-log');
  if (el) { el.innerHTML = C.logs.join(''); el.scrollTop = el.scrollHeight; }
}

// ---------- Boucle temps réel ----------
function tick() {
  if (!C || C.fini) return;
  const now = performance.now();
  const dt = Math.min(300, now - C.dernierTick);
  C.dernierTick = now;
  const p = G.player;

  // Récupération d'endurance
  p.sta = Math.min(p.staMax, p.sta + (C.defense ? 9 : 2.2) * (dt / 1000));

  // Jauge de menace
  C.z.menace += dt / (C.z.def.vitesse * C.z.facteur);
  if (C.z.menace >= 1) {
    C.z.menace = 0;
    C.z.facteur = 0.85 + Math.random() * 0.3;
    attaqueZombie();
  }
  if (!C) return; // le combat a pu se terminer (mort)
  setHeartbeat(p.pv <= 25);
  majBarres();
}

function etatEndurance() {
  const s = G.player.sta;
  if (s > 55) return 'souffle bon';
  if (s > 35) return 'souffle court';
  if (s > 20) return 'épuisé';
  if (s > 8) return 'exténué';
  return 'à bout de forces';
}

function majBarres() {
  const m = $('#menace-fill');
  if (m) {
    m.style.width = (C.z.menace * 100) + '%';
    m.classList.toggle('imminent', C.z.menace > 0.7);
  }
  const ze = $('#ennemi-etat');
  if (ze) ze.innerHTML = `Il est <b>${etatZombie()}</b>`;
  const se = $('#combat-sta');
  if (se) se.innerHTML = `Ton souffle : <b>${etatEndurance()}</b>`;
  updateHUD();
  // boutons selon endurance — pendant une charge ou une frappe en vol, rien d'autre ne se fait
  document.querySelectorAll('.combat-acts button[data-cout]').forEach(b => {
    const cout = parseFloat(b.dataset.cout);
    if (C.chg) { b.disabled = b.dataset.act !== 'attaquer'; return; } // le doigt reste sur le bouton tenu
    if (C.frappe) { b.disabled = true; return; }
    b.disabled = C.defense ? b.dataset.act !== 'defense' : G.player.sta < cout;
  });
}

// ---------- Attaque du zombie ----------
function attaqueZombie() {
  const z = C.z;

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
  if (!C.defense && performance.now() > (C.qteJusqua || 0) && chance(0.5)) {
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
    if (!C || C.fini) return;
    if (C.qteTimer) { clearTimeout(C.qteTimer); C.qteTimer = null; }
    if (reussi) {
      sfx('esquive');
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
  ov.querySelector('.qte-btn').onclick = () => finir(true);
  C.qteTimer = setTimeout(() => finir(false), fenetre);
}

function resoudreAttaque(factEsquive) {
  const p = G.player;
  const z = C.z;

  // Esquive du joueur (réflexe passif)
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  let pEsquive = (0.1 + agi * 0.05 + (C.defense ? 0.3 : 0)) * factEsquive;
  if (p.sta < 15) pEsquive *= 0.5;
  if (chance(pEsquive)) {
    sfx('rate');
    clog(C.defense ? 'Tu bloques son assaut, arc-bouté derrière ta garde.' : 'Tu te jettes sur le côté — ses ongles fendent l\'air à un cheveu de ton visage.');
    const up = gainSkill('agilite', 2);
    if (up) clog(`<b>Agilité niveau ${up.niveau} !</b>`, 'coup');
    return;
  }

  // Dégâts — chaque type de zombie a ses coups : la description et la zone touchée vont ensemble
  const atk = z.def.attaques ? pick(z.def.attaques) : null;
  let deg = rng(z.def.dmg[0], z.def.dmg[1]);
  const prot = protectionTotale();
  deg = Math.max(1, Math.round(deg - prot * 1.1 - (C.defense ? deg * 0.45 : 0)));
  p.pv = Math.max(0, p.pv - deg);
  sfx('degats');
  const scene = $('.combat-scene');
  if (scene) {
    scene.classList.remove('shake'); void scene.offsetWidth; scene.classList.add('shake');
    const fl = $('.combat-scene .flash');
    if (fl) { fl.classList.remove('hit'); void fl.offsetWidth; fl.classList.add('hit'); }
  }
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
  const btn = document.querySelector('.combat-acts [data-act="attaquer"]');
  return { btn, prog: btn ? btn.querySelector('.chg-prog') : null };
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
  if (!C || C.fini || C.defense || C.chg || C.frappe) return;
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
  if (chance(Math.max(0.12, pTouche))) {
    if (c >= 0.7) sfx('puissance');
    const crit = chance(0.08 + skillLevel('dexterite') * 0.02 + c * 0.18);
    let deg = Math.round(rng(arme.dmg[0], arme.dmg[1]) * (0.55 + 1.45 * c));
    if (!arme.mains) deg += Math.round(skillLevel('force') * (1 + c));
    if (arme.mains) deg += Math.round(skillLevel('mainsNues') * (1.2 + 0.8 * c));
    if (crit) deg = Math.round(deg * 1.6);
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
    const crit = chance(0.12 + sk * 0.03);
    let deg = rng(arme.dmg[0], arme.dmg[1]);
    if (crit) deg = Math.round(deg * 1.7);
    const fini = infligerDegats(deg, crit, arme);
    const up = gainSkill('visee', 3);
    if (up) clog(`<b>Visée niveau ${up.niveau} !</b>`, 'coup');
    if (fini) return; // dernier zombie abattu : le combat est clos, le bruit n'attire plus rien ici
  } else {
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
  } else {
    finVictoire();
  }
}

function actionPousser() {
  if (C.defense) return;
  if (!depenser(COUTS.pousser)) return;
  const f = skillLevel('force');
  if (chance(0.55 + f * 0.1)) {
    C.z.menace = Math.max(0, C.z.menace - 0.55);
    sfx('coup');
    clog('Tu le repousses violemment. Il titube en arrière, te laissant une seconde de répit.');
    gainSkill('force', 2);
  } else {
    clog('Tu pousses — il est plus lourd que prévu et encaisse à peine.');
    gainSkill('force', 1);
  }
}

function actionDefense() {
  C.defense = !C.defense;
  const btn = $('[data-act="defense"]');
  if (btn) btn.classList.toggle('defense-on', C.defense);
  clog(C.defense
    ? 'Tu te replies derrière ta garde, à reprendre ton souffle. <em>(récupération rapide, dégâts réduits, mais tu ne peux pas agir)</em>'
    : 'Tu relèves la garde, prêt à frapper.');
  document.querySelectorAll('.combat-acts button[data-cout]').forEach(b => {
    if (b.dataset.act !== 'defense') b.disabled = C.defense;
  });
}

function actionJeter() {
  if (C.defense) return;
  const a = armeEquipee();
  if (!a) { clog('Rien à jeter — tu es à mains nues.'); return; }
  if (!depenser(COUTS.jeter)) return;
  const d = item(a.id);
  const sk = skillLevel('dexterite');
  G.player.equip.arme = null;
  if (chance(0.5 + sk * 0.08)) {
    let deg = Math.round(rng(d.dmg[0], d.dmg[1]) * 1.5);
    clog('Tu jettes ton arme de toutes tes forces !');
    if (d.feuFlamme) {
      sfx('explosion');
      deg = rng(d.dmg[0], d.dmg[1]);
      clog(`<span class="gore">La bouteille explose en gerbe de flammes. ${leZombie(C.z.def.nom, true)} s'embrase en silence — ils ne crient jamais.</span>`, 'gore');
      // brûle aussi la file
      if (C.queue.length && chance(0.5)) {
        clog(`<b>Les flammes rattrapent ${leZombie(zombie(C.queue[0]).nom)} derrière !</b>`, 'coup');
        C.queue.shift();
        G.player.morts++;
      }
    } else if (!d.jetSeul) {
      C.armesJetees.push({ id: a.id, dur: a.dur, touche: true });
    }
    infligerDegats(deg, false, { nom: d.nom + ' (jeté)', feu: true }); // un jet se fait à distance
    gainSkill('dexterite', 3);
  } else {
    clog('Ton arme rebondit sur son épaule et glisse au sol, quelque part dans le noir.');
    if (!d.jetSeul) C.armesJetees.push({ id: a.id, dur: a.dur, touche: false });
  }
}

// ---------- Accès rapide en combat : la ceinture, rien d'autre ----------
function actionAccesRapide() {
  if (C.defense) return;
  const armes = armesDisponibles();
  const soins = soinsAccesRapide();
  const cur = armeEquipee();
  const slots = nbSlotsAccesRapide();
  let html = `<h3>Accès rapide (−${COUTS.changer} end.)</h3><div class="actions">`;
  if (!slots) {
    html += `<div class="item-desc">Aucun emplacement d'accès rapide : il te faut une <b>ceinture</b>, un holster ou un gilet. En attendant, tu te bats avec ce que tu as en main.</div>`;
  } else if (!armes.length && !soins.length && !cur) {
    html += `<div class="item-desc">Ta ceinture est vide. Glisses-y des objets depuis l'inventaire, hors combat.</div>`;
  }
  armes.forEach(a => {
    const dmg = `${a.def.dmg[0]}–${a.def.dmg[1]} dégâts`;
    const mun = a.def.ammo ? ` — ${countItem(a.def.ammo)} munitions` : '';
    html += `<button class="act" data-ar="${a.idx}">Dégainer : ${a.def.nom}<small>${dmg}${mun}${a.jet ? ' — se jette' : ''}</small></button>`;
  });
  soins.forEach(s => {
    const utile = G.player.blessures.some(b => b.saigne && !b.bandee);
    html += `<button class="act" data-soin="${s.idx}" ${utile ? '' : 'disabled'}>Se bander à la hâte<small>−${COUTS.bander} end. — stoppe un saignement${utile ? '' : ' (aucun saignement)'}</small></button>`;
  });
  if (cur && slots > 0) {
    html += `<button class="act" data-ar="rengainer">Rengainer : ${item(cur.id).nom}<small>passer à mains nues, l'arme reste à la ceinture</small></button>`;
  }
  if (cur) {
    html += `<button class="act" data-ar="lacher">Lâcher l'arme au sol<small>mains nues — tu la retrouveras en fouillant ici</small></button>`;
  }
  html += `<button class="act" data-ar="annuler">Annuler</button></div>`;
  const zone = $('#combat-armes');
  zone.innerHTML = html;
  zone.querySelectorAll('[data-ar]').forEach(b => {
    b.onclick = () => {
      const v = b.dataset.ar;
      zone.innerHTML = '';
      if (v === 'annuler') return;
      if (!depenser(COUTS.changer)) return;
      if (v === 'rengainer') {
        if (rengainerArme()) clog('Tu rengaines. Mains nues.');
        else clog('Plus de place à la ceinture.');
      } else if (v === 'lacher') {
        const arme = armeEquipee();
        if (arme) {
          deposerAuSol(keyCourante(), { id: arme.id, qty: 1, dur: arme.dur, cache: true });
          G.player.equip.arme = null;
          clog('Tu lâches ton arme. Elle sonne sur le sol, quelque part à tes pieds.');
        }
      } else {
        if (degainerAccesRapide(parseInt(v, 10))) {
          clog(`Tu dégaines : ${item(armeEquipee().id).nom}.`);
        }
      }
      renderCombat(true);
    };
  });
  zone.querySelectorAll('[data-soin]').forEach(b => {
    b.onclick = () => {
      zone.innerHTML = '';
      if (!depenser(COUTS.bander)) return;
      const s = soinsAccesRapide()[0];
      if (!s) return;
      const bl = G.player.blessures.find(x => x.saigne && !x.bandee);
      if (!bl) { clog('Rien à bander.'); return; }
      removeItem(s.id, 1);
      bl.bandee = true;
      if (s.id === 'bandage_fortune' && !bl.desinfectee) bl.bandeSale = true;
      C.z.menace = Math.min(1, C.z.menace + 0.3); // il avance pendant que tu te bandes
      clog('Tu serres le bandage en gardant un œil sur lui. Le saignement s\'arrête — il s\'approche.', 'coup');
      sfx('soin');
      renderCombat(true);
    };
  });
}

function actionFuir() {
  if (C.defense) return;
  if (!depenser(COUTS.fuir)) return;
  const agi = skillLevel('agilite') + bonusAgiliteVetements();
  let p = 0.4 + agi * 0.1;
  if (['coureur', 'chien_infecte', 'enrage'].includes(C.z.id)) p -= 0.18;
  if (chance(Math.max(0.1, p))) {
    clog('Tu tournes les talons et cours sans te retourner, le souffle en feu.');
    gainSkill('agilite', 5);
    finCombat('fuite');
  } else {
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
  const qte = document.querySelector('.qte');
  if (qte) qte.remove();
  stopCombatMusic();
  setHeartbeat(false);
}

function finVictoire() {
  nettoyer();
  C.fini = true;
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

// ---------- Rendu ----------
// Ordre des actions, toujours le même : ce qui sauve la peau d'abord.
//   FRAPPER/VISER · SE DÉFENDRE   (réflexes)
//   REPOUSSER · ACCÈS RAPIDE      (gagner du temps, changer d'outil)
//   JETER · FUIR                  (dernières cartouches)
function renderCombat(remplaceSeulement = false) {
  const arme = infoArme();
  const armeLbl = arme.feu ? `Viser (${arme.nom.toLowerCase()})` : `Frapper (${arme.nom.toLowerCase()})`;
  const sousLbl = arme.feu
    ? `maintenir pour viser · −${COUTS.tir} end. · ${arme.dmg[0]}–${arme.dmg[1]} dégâts · ${countItem(arme.ammo)} mun.`
    : `maintenir pour charger · −${CHARGE.coutMin} à −${CHARGE.coutMin + CHARGE.coutPlein} end. · ${arme.dmg[0]}–${arme.dmg[1]} dégâts`;
  const html = `
  <div class="combat">
    <div class="combat-scene">
      <div class="illu">${svgCombat(C.z.id)}</div>
      <div class="flash"></div>
    </div>
    <div>
      <p class="ennemi-nom">${C.z.def.nom}${C.queue.length ? ` <small style="color:var(--fg-dim)">(+${C.queue.length} derrière)</small>` : ''}</p>
      <div class="ennemi-etat" id="ennemi-etat">Il est <b>${etatZombie()}</b></div>
      <div class="menace-wrap">
        <div class="menace-label"><span>Menace</span><span>il attaque quand la jauge est pleine</span></div>
        <div class="menace"><div class="menace-fill" id="menace-fill"></div></div>
      </div>
      <div class="combat-sta" id="combat-sta">Ton souffle : <b>${etatEndurance()}</b></div>
    </div>
    <div class="combat-log" id="combat-log">${C.logs.join('')}</div>
    <div id="combat-armes"></div>
    <div class="combat-acts">
      <button class="act primary chg-btn" data-act="attaquer" data-cout="${arme.feu ? COUTS.tir : CHARGE.coutMin}"><span class="chg-jauge" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="chg-fond" cx="18" cy="18" r="15.5"/><circle class="chg-prog" cx="18" cy="18" r="15.5" style="stroke-dasharray:${ANNEAU_CIRC};stroke-dashoffset:${ANNEAU_CIRC}"/></svg></span>${ico(arme.feu ? 'pistolet' : 'attaque')} ${armeLbl}<small class="cout">${sousLbl}</small></button>
      <button class="act ${C.defense ? 'defense-on' : ''}" data-act="defense" data-cout="0">${ico('defense')} Se défendre<small class="cout">récupère l'endurance, −45 % dégâts</small></button>
      <button class="act" data-act="pousser" data-cout="${COUTS.pousser}">${ico('pousser')} Repousser<small class="cout">−${COUTS.pousser} end. · gagne du temps</small></button>
      <button class="act" data-act="acces" data-cout="${COUTS.changer}">${ico('ceinture')} Accès rapide<small class="cout">−${COUTS.changer} end. · ceinture / holster</small></button>
      <button class="act" data-act="jeter" data-cout="${COUTS.jeter}">${ico('jeter')} Jeter l'arme<small class="cout">−${COUTS.jeter} end. · dégâts ×1,5</small></button>
      ${C.opts.fuitePossible !== false ? `<button class="act" data-act="fuir" data-cout="${COUTS.fuir}">${ico('fuir')} Fuir<small class="cout">−${COUTS.fuir} end.</small></button>` : ''}
    </div>
  </div>`;
  render(html);
  const acts = { pousser: actionPousser, defense: actionDefense, acces: actionAccesRapide, jeter: actionJeter, fuir: actionFuir };
  document.querySelectorAll('[data-act]').forEach(b => {
    if (b.dataset.act === 'attaquer') return; // géré en pointer events ci-dessous
    b.onclick = () => { if (C && !C.fini) { acts[b.dataset.act](); if (C && !C.fini) majBarres(); } };
  });
  // Le bouton d'attaque se tient au doigt : pointerdown charge, relâcher frappe (ou tire).
  // setPointerCapture garde le doigt même s'il glisse ; pointercancel relâche le coup
  // à la charge atteinte — un doigt perdu ne mange pas l'endurance pour rien.
  const btnAtk = document.querySelector('.combat-acts [data-act="attaquer"]');
  if (btnAtk) {
    btnAtk.onpointerdown = (e) => { e.preventDefault(); debuterCharge(e, btnAtk); };
    const lacher = (e) => {
      e.preventDefault();
      if (C && C.chg && e.pointerId !== C.chg.pointerId) return; // un autre doigt ne lâche pas le coup
      relacherCharge();
    };
    btnAtk.onpointerup = lacher;
    btnAtk.onpointercancel = lacher;
    btnAtk.onpointerleave = (e) => { if (C && C.chg) lacher(e); }; // sans capture (vieux navigateur), sortir du bouton relâche
    btnAtk.oncontextmenu = (e) => e.preventDefault(); // pas de menu contextuel sur l'appui long mobile
  }
  const cl = $('#combat-log');
  if (cl) cl.scrollTop = cl.scrollHeight;
}
