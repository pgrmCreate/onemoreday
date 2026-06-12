// ============ Combat en temps réel ============
// La jauge de menace du zombie se remplit en continu : quand elle est pleine, il attaque.
// Chaque action coûte de l'endurance. En défense, on récupère mais on ne bouge plus.
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

const COUTS = { attaque: 15, tir: 8, puissance: 30, pousser: 10, jeter: 12, fuir: 22, changer: 5, bander: 16 };

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
    charge: false,    // coup de puissance en préparation
    chargeTimer: null,
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
  // boutons selon endurance — tout est gelé pendant la préparation d'un coup de puissance
  const feu = !!infoArme().feu;
  document.querySelectorAll('.combat-acts button[data-cout]').forEach(b => {
    const cout = parseFloat(b.dataset.cout);
    if (C.charge) { b.disabled = true; return; }
    if (b.dataset.act === 'puissance' && feu) { b.disabled = true; return; }
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

  // Un coup encaissé en pleine préparation peut briser l'élan du coup de puissance.
  if (C.charge && chance(0.5)) {
    C.charge = false;
    clog('Le choc te coupe l\'élan — ton coup de puissance est perdu.', 'degats');
  }

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

function actionAttaquer() {
  if (C.defense) return;
  const arme = infoArme();
  if (arme.feu) return actionTirer();
  if (!depenser(COUTS.attaque)) return;
  const sk = skillLevel(arme.skill);
  let pTouche = 0.62 + sk * 0.06 - C.z.def.esquive;
  if (performance.now() < (C.contreJusqua || 0)) pTouche += 0.22; // il est au sol de son élan : frappe !
  if (G.player.sta < 15) pTouche -= 0.15;
  if (arme.def && arme.def.allonge) pTouche += 0.05;
  if (chance(Math.max(0.15, pTouche))) {
    const crit = chance(0.08 + skillLevel('dexterite') * 0.02);
    let deg = rng(arme.dmg[0], arme.dmg[1]);
    if (!arme.feu && !arme.mains) deg += Math.round(skillLevel('force') * 1.3);
    if (arme.mains) deg += Math.round(skillLevel('mainsNues') * 1.5);
    if (crit) deg = Math.round(deg * 1.8);
    const fini = infligerDegats(deg, crit, arme);
    // usure — même sur le coup fatal (clog est silencieux si le combat est fini)
    if (arme.ref) {
      if (!chance(skillLevel('entretien') * 0.1)) arme.ref.dur -= 1;
      if (arme.ref.dur <= 0) {
        clog('<b>Ton arme se brise entre tes mains !</b>', 'degats');
        log(`${arme.nom} : hors d'usage. Il faudra trouver autre chose.`, 'warn');
        G.player.equip.arme = null;
      }
    }
    const up = gainSkill(arme.skill, 2);
    if (up) clog(`<b>${up.skill === 'mainsNues' ? 'Mains nues' : 'Compétence'} niveau ${up.niveau} !</b>`, 'coup');
    if (fini) return; // le combat s'est terminé sur ce coup : ne plus toucher à C
  } else {
    sfx('rate');
    clog(`Ton coup fend l'air. ${leZombie(C.z.def.nom, true)} avance toujours.`);
    gainSkill(arme.skill, 1);
  }
}

function actionTirer() {
  const arme = infoArme();
  if (!arme.feu) return;
  if (munitionsPour(arme.ref.id) <= 0) { clog('<b>Clic.</b> Plus de munitions.', 'degats'); return; }
  if (!depenser(COUTS.tir)) return;
  removeItem(arme.ammo, 1);
  sfx('tir');
  const sk = skillLevel('visee');
  let pTouche = 0.55 + sk * 0.08 - C.z.def.esquive;
  if (chance(Math.max(0.2, pTouche))) {
    const crit = chance(0.12 + sk * 0.03);
    let deg = rng(arme.dmg[0], arme.dmg[1]);
    if (crit) deg = Math.round(deg * 1.7);
    const fini = infligerDegats(deg, crit, arme);
    const up = gainSkill('visee', 3);
    if (up) clog(`<b>Visée niveau ${up.niveau} !</b>`, 'coup');
    if (fini) return; // dernier zombie abattu : le combat est clos, le bruit n'attire plus rien ici
  } else {
    clog('La détonation claque — la balle s\'écrase dans un mur. Raté.');
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

// ---------- Coup de puissance : on arme, on encaisse le risque, on écrase ----------
// Une préparation d'une seconde pendant laquelle TOUT continue : la menace
// monte, et un coup reçu peut briser l'élan. Mais quand ça touche…
function actionPuissance() {
  if (C.defense || C.charge) return;
  const arme = infoArme();
  if (arme.feu) { clog('Pas avec une arme à feu — vise et tire.'); return; }
  if (!depenser(COUTS.puissance)) return;
  C.charge = true;
  sfx('puissance_charge');
  clog('Tu armes ton coup, tout le poids du corps derrière…');
  majBarres();
  C.chargeTimer = setTimeout(() => {
    if (!C || C.fini) return;
    C.chargeTimer = null;
    const brise = !C.charge; // l'élan a été cassé par un coup encaissé
    C.charge = false;
    if (brise) { majBarres(); return; }
    const sk = skillLevel(arme.skill);
    let pTouche = 0.55 + sk * 0.06 - C.z.def.esquive;
    if (performance.now() < (C.contreJusqua || 0)) pTouche += 0.22;
    if (G.player.sta < 15) pTouche -= 0.15;
    if (chance(Math.max(0.12, pTouche))) {
      sfx('puissance');
      const crit = chance(0.18 + skillLevel('dexterite') * 0.02);
      let deg = Math.round(rng(arme.dmg[0], arme.dmg[1]) * 2.2) + Math.round(skillLevel('force') * 2);
      if (arme.mains) deg += Math.round(skillLevel('mainsNues') * 2);
      if (crit) deg = Math.round(deg * 1.6);
      clog('<span class="gore">Le coup part comme un fléau, tout ton poids derrière. Ça craque.</span>', 'coup');
      C.z.menace = Math.max(0, C.z.menace - 0.45); // il encaisse, il recule
      const finiCombat = infligerDegats(deg, crit, arme);
      if (arme.ref) {
        arme.ref.dur -= 2; // frapper si fort use l'arme deux fois plus
        if (arme.ref.dur <= 0) {
          clog('<b>Ton arme se brise sur l\'impact !</b>', 'degats');
          log(`${arme.nom} : hors d'usage. Il faudra trouver autre chose.`, 'warn');
          G.player.equip.arme = null;
        }
      }
      gainSkill('force', 4);
      gainSkill(arme.skill, 2);
      if (finiCombat) return;
    } else {
      sfx('rate');
      clog('Trop téléphoné : il se déporte et ton coup laboure le vide. Tu titubes, déséquilibré.');
      C.z.menace = Math.min(1, C.z.menace + 0.25);
      gainSkill(arme.skill, 1);
    }
    majBarres();
  }, 950);
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
  if (C && C.chargeTimer) clearTimeout(C.chargeTimer);
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
//   ATTAQUER · SE DÉFENDRE   (réflexes)
//   REPOUSSER · ACCÈS RAPIDE (gagner du temps, changer d'outil)
//   JETER · FUIR             (dernières cartouches)
function renderCombat(remplaceSeulement = false) {
  const arme = infoArme();
  const armeLbl = arme.feu ? `Tirer (${arme.nom})` : `Attaquer (${arme.nom.toLowerCase()})`;
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
      <button class="act primary" data-act="attaquer" data-cout="${arme.feu ? COUTS.tir : COUTS.attaque}">${ico(arme.feu ? 'pistolet' : 'attaque')} ${armeLbl}<small class="cout">−${arme.feu ? COUTS.tir : COUTS.attaque} end. · ${arme.dmg[0]}–${arme.dmg[1]} dégâts${arme.ammo ? ` · ${countItem(arme.ammo)} mun.` : ''}</small></button>
      <button class="act ${C.defense ? 'defense-on' : ''}" data-act="defense" data-cout="0">${ico('defense')} Se défendre<small class="cout">récupère l'endurance, −45 % dégâts</small></button>
      <button class="act puissance" data-act="puissance" data-cout="${COUTS.puissance}" ${arme.feu ? 'disabled' : ''}>${ico('attaque')} Coup de puissance<small class="cout">${arme.feu ? 'pas avec une arme à feu' : `−${COUTS.puissance} end. · préparation risquée · dégâts ×2`}</small></button>
      <button class="act" data-act="pousser" data-cout="${COUTS.pousser}">${ico('pousser')} Repousser<small class="cout">−${COUTS.pousser} end. · gagne du temps</small></button>
      <button class="act" data-act="acces" data-cout="${COUTS.changer}">${ico('ceinture')} Accès rapide<small class="cout">−${COUTS.changer} end. · ceinture / holster</small></button>
      <button class="act" data-act="jeter" data-cout="${COUTS.jeter}">${ico('jeter')} Jeter l'arme<small class="cout">−${COUTS.jeter} end. · dégâts ×1,5</small></button>
      ${C.opts.fuitePossible !== false ? `<button class="act" data-act="fuir" data-cout="${COUTS.fuir}">${ico('fuir')} Fuir<small class="cout">−${COUTS.fuir} end.</small></button>` : ''}
    </div>
  </div>`;
  render(html);
  const acts = { attaquer: actionAttaquer, puissance: actionPuissance, pousser: actionPousser, defense: actionDefense, acces: actionAccesRapide, jeter: actionJeter, fuir: actionFuir };
  document.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = () => { if (C && !C.fini) { acts[b.dataset.act](); if (C && !C.fini) majBarres(); } };
  });
  const cl = $('#combat-log');
  if (cl) cl.scrollTop = cl.scrollHeight;
}
