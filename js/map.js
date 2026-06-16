// ============ Cartes multi-échelles : déplacement, fouille, verrous, événements ============
// Quatre échelles, le même moteur : on clique une case, on s'y rend (1 ou 2 cases
// selon ta vitesse et l'environnement), le temps file, et ce qui devait arriver arrive.
// Les événements s'affichent dans une fenêtre par-dessus la carte.
import {
  G, save, rng, chance, pick, skillLevel, gainSkill, setFlag, getFlag, estNuit, noteJournal, seedRng,
} from './state.js';
import { CARTES, DEPART } from './data/world.js';
import { REGLAGES } from './data/reglages.js';
import {
  carte, carteCourante, caseDef, caseCourante, franchissable, passagePossible, ckey, keyCourante,
  decouvrir, decouvrirAutour, estDecouverte, casesVisibles, solDe, solVisible, deposerAuSol, revelerSol,
  fouilleEtat, estSecurisee, securiser, zombiesPoolCourant, interieurSecurise,
  niveauSombre, liaison, porteCassee, estGraphe, voisinsCandidats,
  assignerGaranties, garantiesCase,
} from './world.js';
import { svgAmbiance, aAmbiance } from './ambiance.js';
import { jouerCineUneFois, cineEnCours, jouerCine } from './cinema.js';
import {
  carteVivante, peuplerCarte, zombiesSur, retirerZombie, meuteAuContact,
  tickZombies, attirerZombies, champOuieJoueur,
  fauxMortEn, reveillerFauxMort, ajouterMort, mortsSur,
  TICK_MS, OUIE_JOUEUR,
} from './zombies_map.js';
import { EVENTS } from './data/events.js';
import { item } from './data/items.js';
import {
  render, updateHUD, setLieuLabel, log, logHtml, btnAct, $, toast, showHUD,
  showPanel, closePanel, showEvt, closeEvt, attente, panelOuvert, evtOuvert,
} from './ui.js';
import { ico } from './icons.js';
import { svgScene } from './illustrations.js';
import { dessinerDecor, dessinerCloisons, dessinerCreux, autoDecor } from './art/prefabs.js';
import {
  addItem, hasItem, removeItem, poidsTotal, poidsMax, placePour,
  espaceUtilise, espaceMax, defItem, countItem,
  surcharge, enSurpoids, poidsPlafond, equiperDepuisSol, libelleJetes,
  estContenant, recipientOuvert, contenance, descEau, fmtL, instancePourEau,
  tenirRecipient, prendreEnMain,
  lumiereActive, basculerLumiere, etatLumiere, rayonLumiere,
} from './inventory.js';
import { cloth } from './data/clothing.js';
import { advanceTime, dormir, attendre } from './survival.js';
import { appliquerEffets, besoinRempli, besoinTexte, jetReussi } from './effects.js';
import { demarrerCombat, enCombat, noteCombat, appliquerCombatDistant, pauseCombatPourCine, reprendreCombatAvecDecompte, repondreDemandeRejoindre } from './combat.js';
import { playAmbiance, sfx, setTension, setChrono } from './audio.js';
import { jouerScene } from './scenes.js';
import * as multi from './multi.js';

let selection = null; // case sélectionnée sur la carte (info avant déplacement)
let vueDessin = false; // bascule plan ↔ dessin d'ambiance (bouton œil)
let enMarche = false;  // déplacement animé en cours : on ne clique pas pendant
let chemPrev = new Map(); // BFS : d'où on vient, pour reconstruire le chemin
let pasDepuisCraque = 0; // pas écoulés depuis le dernier craquement (pas bruyant occasionnel)
let dernierTickZ = 0;  // horodatage du dernier tick des morts (perf.now) — pour qu'ils gardent
                       // LEUR horloge (TICK_MS) même pendant que tu marches (sinon ils accélèrent)

// ---------- Position de départ ----------
export function initPosition() {
  G.world.carte = DEPART.carte;
  G.world.x = DEPART.x;
  G.world.y = DEPART.y;
  decouvrirAutour(DEPART.carte, DEPART.x, DEPART.y);
}

// ---------- Objectif courant ----------
export function objectifActuel() {
  if (getFlag('chapitre2')) {
    return 'Chapitre 2 — Miramas-le-Vieux : remplir la citerne du Refuge (l\'eau dort dans le triage, en contrebas) et tirer au clair la rumeur des bêtes échappées de La Barben.';
  }
  if (!getFlag('sorti_hotel')) return 'Quitter le Grand Hôtel de la Poste : tes réserves sont mortes depuis hier.';
  if (!getFlag('gare_ouverte')) return 'Rejoindre la gare SNCF de Salon, à l\'ouest des cours — la radio parle d\'un convoi vers Miramas.';
  if (!getFlag('conducteur_fouille')) return 'Explorer la gare : la locomotive de service a besoin d\'une clé, d\'une batterie et de gasoil.';
  const manque = [];
  if (!getFlag('batterie_a_la_gare')) manque.push('la batterie poids lourd (garage Sapas, zone de la Gandonne)');
  if (!hasItem('bidon_gasoil')) manque.push('un bidon de gasoil (à siphonner dans les carcasses)');
  if (!hasItem('cle_locomotive')) manque.push('la clé de la locomotive');
  if (manque.length) return `Réunir : ${manque.join(', ')}.`;
  return 'Tout est prêt. Rejoindre la locomotive, quai de service, et partir vers Miramas.';
}

// ---------- Rendu de la carte ----------
const ECHELLE_NOM = { interieur: 'Intérieur', quartier: 'Quartier', ville: 'Ville', region: 'Pays salonais' };
// Longueur de marche par déplacement : on clique loin, et le personnage AVANCE
// case par case (animé) — le temps, la fatigue et les zombies avancent avec lui.
const PORTEE_BASE = { interieur: 5, quartier: 6, ville: 4, region: 3 };

const TERRAIN = {
  // extérieur
  rue:       { fill: '#1d1d21', stroke: '#2c2c31' },
  place:     { fill: '#242427', stroke: '#313136' },
  parc:      { fill: '#19211b', stroke: '#27322a' },
  rail:      { fill: '#1b1b1d', stroke: '#3a3530' },
  porte:     { fill: '#2b2620', stroke: '#4a3e2c' },
  batiment:  { fill: '#2a2622', stroke: '#473d31' },
  // région
  route:     { fill: '#1d1d21', stroke: '#2c2c31' },
  autoroute: { fill: '#232328', stroke: '#3c3c44' },
  village:   { fill: '#272320', stroke: '#473d31' },
  ville:     { fill: '#2c2722', stroke: '#54483a' },
  nature:    { fill: '#181f17', stroke: '#242e23' },
  site:      { fill: '#262028', stroke: '#41374a' },
  // intérieur
  piece:     { fill: '#211e19', stroke: '#383226' },
  couloir:   { fill: '#1a1814', stroke: '#2c2820' },
  escalier:  { fill: '#231f18', stroke: '#3d3526' },
  // obstacles dessinés (rares : l'absence de case suffit en général)
  eau:       { fill: '#13202a', stroke: '#1d3140' },
  mur:       { fill: '#0f0f11', stroke: '#1a1a1d' },
};

// Couleurs des dessins de cases (au trait, comme le reste du jeu)
const MUR_TRAIT = '#4f4636';   // murs des plans intérieurs
const BANDE = '#26262a';       // chaussée des rues
const T_VEGETAL = '#46563f';
const T_EAU = '#2e4a5e';
const T_TOIT = '#564a39';
const T_METAL = '#4a443c';

// Graine déterministe par case : les dessins varient d'une case à l'autre
// mais ne « clignotent » pas entre deux rendus.
function graine(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function porteeActuelle() {
  const C = carteCourante();
  let p = C.portee ?? PORTEE_BASE[C.echelle] ?? 1;
  const pl = G.player;
  if (poidsTotal() > poidsMax() * 0.85) p -= 1;
  if (enSurpoids()) p -= 1; // chargé au-delà du raisonnable : on traîne la patte
  if (pl.sta < 15) p -= 1;
  if (pl.blessures.some(b => ['à la cuisse', 'au genou', 'au mollet', 'à la cheville', 'au pied'].includes(b.zone) && !b.bandee)) p -= 1;
  return Math.max(1, p);
}

// Cases atteignables (BFS borné) — retourne Map 'x,y' -> distance,
// et mémorise le chemin (chemPrev) pour la marche animée.
function atteignables(portee) {
  const res = new Map();
  chemPrev = new Map();
  let front = [[G.world.x, G.world.y]];
  res.set(`${G.world.x},${G.world.y}`, 0);
  for (let d = 1; d <= portee; d++) {
    const next = [];
    for (const [x, y] of front) {
      for (const [nx, ny] of voisinsCandidats(G.world.carte, x, y)) {
        const k = `${nx},${ny}`;
        if (res.has(k) || !passagePossible(G.world.carte, x, y, nx, ny)) continue;
        res.set(k, d);
        chemPrev.set(k, `${x},${y}`);
        next.push([nx, ny]);
      }
    }
    front = next;
  }
  res.delete(`${G.world.x},${G.world.y}`);
  return res;
}

// Reconstruit le chemin (liste de [x,y]) du joueur vers une case atteignable.
function cheminVers(pos) {
  const depart = `${G.world.x},${G.world.y}`;
  const chemin = [];
  let k = pos;
  while (k && k !== depart) {
    chemin.unshift(k.split(',').map(Number));
    k = chemPrev.get(k);
  }
  return chemin;
}

// ---------- Codes couleur des cases (cf. bouton Légende) ----------
// rouge = très dangereux · violet pointillé = noir total (lumière nécessaire)
// vert = sécurisée · point ocre = objets au sol · rectangle = porte/passage
const CODES = {
  danger:   '#a83226',
  sombre:   '#7b6fc4',
  securisee:'#5d7a44',
  sol:      '#8a5a28',
};
function cadreCase(px, py, w, h, inset, couleur, dash = false) {
  return `<rect x="${px + inset}" y="${py + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="2"
    fill="none" stroke="${couleur}" stroke-width="1.5" ${dash ? 'stroke-dasharray="3 2.5"' : ''}/>`;
}

// ---------- Mobilier dessiné (intérieurs) ----------
// Chaque pièce reçoit un petit dessin au trait selon son nom — ou cd.mob explicite
// (clé de MOB ; mob: null pour une pièce volontairement vide).
const MOB = {
  lit: (x, y, s) => `<rect x="${x + s * .14}" y="${y + s * .2}" width="${s * .3}" height="${s * .56}" rx="2"/>
    <rect x="${x + s * .18}" y="${y + s * .24}" width="${s * .22}" height="${s * .09}" rx="1.5"/>
    <line x1="${x + s * .14}" y1="${y + s * .44}" x2="${x + s * .44}" y2="${y + s * .44}"/>`,
  lits: (x, y, s) => MOB.lit(x - s * .04, y, s * .8) + MOB.lit(x + s * .34, y + s * .14, s * .8),
  comptoir: (x, y, s) => `<path d="M${x + s * .18} ${y + s * .76} V${y + s * .36} H${x + s * .72}"/>
    <path d="M${x + s * .3} ${y + s * .76} V${y + s * .48} H${x + s * .72}" opacity=".5"/>`,
  rayonnages: (x, y, s) => [0, 1, 2].map(i =>
    `<rect x="${x + s * .16}" y="${y + s * .18 + i * s * .24}" width="${s * .6}" height="${s * .11}"/>`).join(''),
  etageres: (x, y, s) => [0, 1, 2].map(i =>
    `<rect x="${x + s * .17 + i * s * .25}" y="${y + s * .17}" width="${s * .11}" height="${s * .58}"/>`).join(''),
  table: (x, y, s) => `<circle cx="${x + s * .5}" cy="${y + s * .47}" r="${s * .15}"/>
    <line x1="${x + s * .5}" y1="${y + s * .24}" x2="${x + s * .5}" y2="${y + s * .29}"/>
    <line x1="${x + s * .5}" y1="${y + s * .65}" x2="${x + s * .5}" y2="${y + s * .7}"/>
    <line x1="${x + s * .27}" y1="${y + s * .47}" x2="${x + s * .32}" y2="${y + s * .47}"/>
    <line x1="${x + s * .68}" y1="${y + s * .47}" x2="${x + s * .73}" y2="${y + s * .47}"/>`,
  bureau: (x, y, s) => `<rect x="${x + s * .2}" y="${y + s * .3}" width="${s * .46}" height="${s * .2}"/>
    <circle cx="${x + s * .43}" cy="${y + s * .62}" r="${s * .07}"/>`,
  bancs: (x, y, s) => [0, 1, 2].map(i => {
    const yy = y + s * .27 + i * s * .19;
    return `<line x1="${x + s * .2}" y1="${yy}" x2="${x + s * .72}" y2="${yy}"/>
      <line x1="${x + s * .2}" y1="${yy + 3.5}" x2="${x + s * .72}" y2="${yy + 3.5}" opacity=".45"/>`;
  }).join(''),
  fauteuils: (x, y, s) => {
    let r = '';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      r += `<rect x="${x + s * .19 + i * s * .22}" y="${y + s * .25 + j * s * .25}" width="${s * .13}" height="${s * .13}" rx="2"/>`;
    }
    return r;
  },
  casiers: (x, y, s) => [0, 1, 2, 3].map(i =>
    `<rect x="${x + s * .14 + i * s * .18}" y="${y + s * .2}" width="${s * .14}" height="${s * .5}"/>`).join(''),
  cuisine: (x, y, s) => `<rect x="${x + s * .23}" y="${y + s * .24}" width="${s * .42}" height="${s * .42}"/>
    <circle cx="${x + s * .36}" cy="${y + s * .37}" r="${s * .05}"/><circle cx="${x + s * .53}" cy="${y + s * .37}" r="${s * .05}"/>
    <circle cx="${x + s * .36}" cy="${y + s * .54}" r="${s * .05}"/><circle cx="${x + s * .53}" cy="${y + s * .54}" r="${s * .05}"/>`,
  etabli: (x, y, s) => `<rect x="${x + s * .16}" y="${y + s * .5}" width="${s * .56}" height="${s * .16}"/>
    <line x1="${x + s * .27}" y1="${y + s * .22}" x2="${x + s * .27}" y2="${y + s * .36}"/>
    <circle cx="${x + s * .27}" cy="${y + s * .4}" r="${s * .045}"/>
    <line x1="${x + s * .45}" y1="${y + s * .25}" x2="${x + s * .45}" y2="${y + s * .4}"/>`,
  voiture: (x, y, s) => `<rect x="${x + s * .32}" y="${y + s * .18}" width="${s * .3}" height="${s * .58}" rx="${s * .08}"/>
    <line x1="${x + s * .36}" y1="${y + s * .32}" x2="${x + s * .58}" y2="${y + s * .32}"/>
    <line x1="${x + s * .36}" y1="${y + s * .6}" x2="${x + s * .58}" y2="${y + s * .6}"/>`,
  barreaux: (x, y, s) => [0, 1, 2, 3, 4].map(i =>
    `<line x1="${x + s * .22 + i * s * .12}" y1="${y + s * .22}" x2="${x + s * .22 + i * s * .12}" y2="${y + s * .58}"/>`).join('')
    + `<line x1="${x + s * .17}" y1="${y + s * .22}" x2="${x + s * .75}" y2="${y + s * .22}"/>`,
  tiroirs: (x, y, s) => {
    let r = '';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      r += `<rect x="${x + s * .18 + j * s * .26}" y="${y + s * .2 + i * s * .17}" width="${s * .22}" height="${s * .13}"/>`;
    }
    return r;
  },
  ratelier: (x, y, s) => `<rect x="${x + s * .18}" y="${y + s * .26}" width="${s * .56}" height="${s * .38}"/>
    <line x1="${x + s * .28}" y1="${y + s * .6}" x2="${x + s * .34}" y2="${y + s * .3}"/>
    <line x1="${x + s * .42}" y1="${y + s * .6}" x2="${x + s * .48}" y2="${y + s * .3}"/>
    <line x1="${x + s * .56}" y1="${y + s * .6}" x2="${x + s * .62}" y2="${y + s * .3}"/>`,
  palettes: (x, y, s) => `<rect x="${x + s * .16}" y="${y + s * .2}" width="${s * .28}" height="${s * .28}"/>
    <path d="M${x + s * .16} ${y + s * .2} l${s * .28} ${s * .28} M${x + s * .44} ${y + s * .2} l${-s * .28} ${s * .28}"/>
    <rect x="${x + s * .42}" y="${y + s * .52}" width="${s * .28}" height="${s * .28}"/>
    <path d="M${x + s * .42} ${y + s * .52} l${s * .28} ${s * .28} M${x + s * .7} ${y + s * .52} l${-s * .28} ${s * .28}"/>`,
  plantes: (x, y, s) => [[.3, .35], [.56, .27], [.46, .6]].map(([fx, fy]) =>
    `<circle cx="${x + s * fx}" cy="${y + s * fy}" r="${s * .09}"/>
     <line x1="${x + s * fx}" y1="${y + s * (fy + .09)}" x2="${x + s * fx}" y2="${y + s * (fy + .17)}"/>`).join(''),
  machines: (x, y, s) => `<rect x="${x + s * .2}" y="${y + s * .3}" width="${s * .24}" height="${s * .3}"/>
    <rect x="${x + s * .52}" y="${y + s * .3}" width="${s * .24}" height="${s * .3}"/>
    <circle cx="${x + s * .32}" cy="${y + s * .45}" r="${s * .05}"/>`,
  debris: (x, y, s, g) => {
    const dx = (g % 3 - 1) * s * .1, dy = ((g >> 2) % 3 - 1) * s * .08;
    return `<rect x="${x + s * .32 + dx}" y="${y + s * .36 + dy}" width="${s * .18}" height="${s * .14}"
        transform="rotate(${(g % 5) * 7 - 14} ${x + s * .41 + dx} ${y + s * .43 + dy})"/>
      <circle cx="${x + s * .64 + dx}" cy="${y + s * .58 + dy}" r="1.3"/>
      <circle cx="${x + s * .26 - dx}" cy="${y + s * .62 - dy}" r="1.1"/>`;
  },
};
// Choix automatique du mobilier d'après le nom de la pièce (le premier motif gagne)
const MOB_AUTO = [
  [/dortoir/i, 'lits'],
  [/chambre|suite/i, 'lit'],
  [/cuisine|fourneaux/i, 'cuisine'],
  [/réception|accueil|billetterie|comptoir|caisse/i, 'comptoir'],
  [/lingerie|réserve|stock|arrière-boutique|cellier|cave|remise|combles|grenier/i, 'rayonnages'],
  [/morgue/i, 'tiroirs'],
  [/cellule/i, 'barreaux'],
  [/armurerie/i, 'ratelier'],
  [/vestiaire|casier/i, 'casiers'],
  [/atelier|garage|fosse|mécanique/i, 'etabli'],
  [/parking/i, 'voiture'],
  [/jardin|simples|serre|potager/i, 'plantes'],
  [/projection|multimédia|standard|machinerie/i, 'machines'],
  [/salle \d|presse|cinéma/i, 'fauteuils'],
  [/attente|nef|chapelle|église|répétition|tribune/i, 'bancs'],
  [/bureau|cabinet|secrétariat/i, 'bureau'],
  [/salon|déjeuner|restaurant|café|réfectoire|garde\b/i, 'table'],
  [/palette|matériaux|cour|quai|entrepôt/i, 'palettes'],
  [/rayon|allée|galerie|boutique|magasin|pharmacie|officine|bibliothèque|adultes|espace/i, 'etageres'],
];
function mobilier(cd, x, y, px, py, s) {
  let cle = cd.mob;
  if (cle === null) return '';
  if (!cle && cd.nom) { const m = MOB_AUTO.find(([re]) => re.test(cd.nom)); if (m) cle = m[1]; }
  if (!cle) cle = 'debris';
  const fn = MOB[cle];
  return fn ? `<g class="mob">${fn(px, py, s, graine(x, y))}</g>` : '';
}

// (Meublage automatique générique — autoDecor/FURNISH — déplacé dans js/art/prefabs.js,
//  partagé entre le moteur et l'éditeur de cartes.)

// ---------- Dessin du sol des intérieurs ----------
function dessinInterieur(cd, x, y, px, py, s, autoF) {
  // Une case qui porte un calque de dessin (cd.decor) reprend la main COMPLÈTE sur son art :
  // on saute le sol/mobilier automatique et on laisse decor + creux + cloisons tout définir.
  if (cd.decor) return '';
  const id = G.world.carte;
  const circu = (dx, dy) => {
    const n = caseDef(id, x + dx, y + dy);
    return !!n && ['couloir', 'escalier', 'porte'].includes(n.t);
  };
  if (cd.t === 'escalier') {
    if (autoF) return ''; // la cage étroite est fournie par le meublage auto (cage_escalier + creux)
    const horiz = circu(1, 0) || circu(-1, 0); // les marches filent dans l'axe de la circulation
    let l = '';
    for (let i = 1; i <= 4; i++) {
      const f = (s * i) / 5;
      l += horiz
        ? `<line x1="${px + f}" y1="${py + 9}" x2="${px + f}" y2="${py + s - 9}"/>`
        : `<line x1="${px + 9}" y1="${py + f}" x2="${px + s - 9}" y2="${py + f}"/>`;
    }
    return `<g class="mob">${l}</g>`;
  }
  if (cd.t === 'couloir') {
    const horiz = circu(1, 0) || circu(-1, 0);
    return `<g class="mob" opacity=".3">${horiz
      ? `<line x1="${px + 4}" y1="${py + s * .3}" x2="${px + s - 4}" y2="${py + s * .3}"/><line x1="${px + 4}" y1="${py + s * .7}" x2="${px + s - 4}" y2="${py + s * .7}"/>`
      : `<line x1="${px + s * .3}" y1="${py + 4}" x2="${px + s * .3}" y2="${py + s - 4}"/><line x1="${px + s * .7}" y1="${py + 4}" x2="${px + s * .7}" y2="${py + s - 4}"/>`}</g>`;
  }
  if (cd.t === 'porte') {
    // le sas d'entrée : un paillasson
    return `<g class="mob"><rect x="${px + s / 2 - 9}" y="${py + s / 2 - 5}" width="18" height="10" rx="1" stroke-dasharray="3 2"/></g>`;
  }
  return autoF ? '' : mobilier(cd, x, y, px, py, s);
}

// ---------- Murs et portes du plan (façon plan d'évacuation) ----------
// Chaque bord de case intérieure : mur plein, battant de porte, ou ouverture libre.
function mursDeCase(cd, x, y, px, py, w, h, connue) {
  const id = G.world.carte;
  const bords = [
    { dx: 1, dy: 0, x1: px + w, y1: py, x2: px + w, y2: py + h, prio: true },
    { dx: 0, dy: 1, x1: px, y1: py + h, x2: px + w, y2: py + h, prio: true },
    { dx: -1, dy: 0, x1: px, y1: py, x2: px, y2: py + h, prio: false },
    { dx: 0, dy: -1, x1: px, y1: py, x2: px + w, y2: py, prio: false },
  ];
  let out = '';
  for (const b of bords) {
    const nx = x + b.dx, ny = y + b.dy;
    const voisin = caseDef(id, nx, ny);
    if (!b.prio && voisin && connue(nx, ny)) continue; // ce bord sera tracé par le voisin
    const li = voisin ? liaison(id, x, y, nx, ny) : null;
    if (!li) { out += `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}"/>`; continue; }
    const vert = b.x1 === b.x2;
    const mx = (b.x1 + b.x2) / 2, my = (b.y1 + b.y2) / 2;
    const demi = li === 'ouvert' ? Math.min(w, h) * .3 : 8; // demi-largeur de l'ouverture
    out += vert
      ? `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x1}" y2="${my - demi}"/><line x1="${b.x1}" y1="${my + demi}" x2="${b.x1}" y2="${b.y2}"/>`
      : `<line x1="${b.x1}" y1="${b.y1}" x2="${mx - demi}" y2="${b.y1}"/><line x1="${mx + demi}" y1="${b.y1}" x2="${b.x2}" y2="${b.y1}"/>`;
    if (li === 'porte') {
      if (porteCassee(id, x, y, nx, ny)) {
        // Porte ENFONCÉE : un battant de travers, sombre et rougeâtre — elle ne protège plus.
        const br = '#8a3a2a';
        out += vert
          ? `<g transform="rotate(30 ${b.x1} ${my})"><rect x="${b.x1 - 1.5}" y="${my - demi}" width="3.5" height="${demi * 2}" rx="1" fill="#0f0807" stroke="${br}" stroke-width="1.3"/></g>`
          : `<g transform="rotate(30 ${mx} ${b.y1})"><rect x="${mx - demi}" y="${b.y1 - 1.5}" width="${demi * 2}" height="3.5" rx="1" fill="#0f0807" stroke="${br}" stroke-width="1.3"/></g>`;
      } else {
        const ferme = (voisin.verrou && !G.world.verrous[ckey(id, nx, ny)]) || (cd.verrou && !G.world.verrous[ckey(id, x, y)]);
        const coul = ferme ? '#8a5a28' : '#6d5d42';
        out += vert
          ? `<rect x="${b.x1 - 2.5}" y="${my - demi}" width="5" height="${demi * 2}" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`
          : `<rect x="${mx - demi}" y="${b.y1 - 2.5}" width="${demi * 2}" height="5" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`;
      }
    }
  }
  return out;
}

// ---------- Dessin des cases extérieures ----------
const ROUTIER = new Set(['rue', 'route', 'autoroute', 'place', 'porte']);
function dessinExterieur(cd, x, y, px, py, s) {
  const id = G.world.carte;
  const g = graine(x, y);
  const cx = px + s / 2, cy = py + s / 2;
  const nb = (dx, dy) => caseDef(id, x + dx, y + dy);
  let d = '';
  switch (cd.t) {
    case 'rue': case 'route': case 'autoroute': case 'porte': case 'place': {
      // la chaussée se prolonge vers les cases voisines praticables : les rues font réseau
      const w = s * (cd.t === 'place' ? .74 : cd.t === 'autoroute' ? .6 : .48);
      const h2 = w / 2;
      let bandes = `<rect x="${cx - h2}" y="${cy - h2}" width="${w}" height="${w}"/>`;
      if (nb(1, 0) && ROUTIER.has(nb(1, 0).t)) bandes += `<rect x="${cx}" y="${cy - h2}" width="${s / 2}" height="${w}"/>`;
      if (nb(-1, 0) && ROUTIER.has(nb(-1, 0).t)) bandes += `<rect x="${px}" y="${cy - h2}" width="${s / 2}" height="${w}"/>`;
      if (nb(0, 1) && ROUTIER.has(nb(0, 1).t)) bandes += `<rect x="${cx - h2}" y="${cy}" width="${w}" height="${s / 2}"/>`;
      if (nb(0, -1) && ROUTIER.has(nb(0, -1).t)) bandes += `<rect x="${cx - h2}" y="${py}" width="${w}" height="${s / 2}"/>`;
      d += `<g fill="${BANDE}">${bandes}</g>`;
      if (cd.t === 'autoroute') {
        const horiz = !!(nb(1, 0) && ROUTIER.has(nb(1, 0).t)) || !!(nb(-1, 0) && ROUTIER.has(nb(-1, 0).t));
        d += horiz
          ? `<line x1="${px + 3}" y1="${cy}" x2="${px + s - 3}" y2="${cy}" stroke="#3c3c44" stroke-width="1.3" stroke-dasharray="5 4"/>`
          : `<line x1="${cx}" y1="${py + 3}" x2="${cx}" y2="${py + s - 3}" stroke="#3c3c44" stroke-width="1.3" stroke-dasharray="5 4"/>`;
      } else if (cd.t === 'place') {
        let dots = '';
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          dots += `<circle cx="${px + s * .26 + i * s * .24}" cy="${py + s * .26 + j * s * .24}" r="1"/>`;
        }
        d += `<g fill="#3a3a3f" opacity=".6">${dots}</g>`;
        if (cd.special === 'fontaine') {
          d += `<circle cx="${cx}" cy="${cy}" r="${s * .16}" fill="none" stroke="${T_EAU}" stroke-width="1.3"/>
            <circle cx="${cx}" cy="${cy}" r="${s * .07}" fill="none" stroke="${T_EAU}" stroke-width="1.1"/>`;
        }
      } else if (cd.t === 'porte') {
        // porte fortifiée : l'arche dans les remparts
        d += `<path d="M${cx - s * .18} ${cy + s * .22} V${cy} a${s * .18} ${s * .18} 0 0 1 ${s * .36} 0 V${cy + s * .22}" fill="none" stroke="#6a5c45" stroke-width="1.6"/>
          <line x1="${cx - s * .28}" y1="${cy + s * .22}" x2="${cx + s * .28}" y2="${cy + s * .22}" stroke="#6a5c45" stroke-width="1.2"/>`;
      } else {
        // selon la case : fissure, plaque d'égout, carcasse de voiture
        if (g % 4 === 0) d += `<path d="M${cx - s * .18} ${cy + s * .12} l${s * .1} ${-s * .08} l${s * .12} ${s * .05}" fill="none" stroke="#33333a" stroke-width="1"/>`;
        if (g % 5 === 1) d += `<circle cx="${cx + s * .12}" cy="${cy - s * .1}" r="2.2" fill="none" stroke="#3a3a40" stroke-width="1"/>`;
        if (g % 7 === 2) d += `<rect x="${cx - s * .26}" y="${cy - s * .12}" width="${s * .14}" height="${s * .26}" rx="2.5" fill="none" stroke="${T_METAL}" stroke-width="1.1"/>`;
      }
      break;
    }
    case 'parc': case 'nature': {
      const arbre = (ax, ay, r) => `<circle cx="${ax}" cy="${ay}" r="${r}"/>
        <circle cx="${ax - r * .6}" cy="${ay + r * .4}" r="${r * .65}"/>
        <line x1="${ax}" y1="${ay + r}" x2="${ax}" y2="${ay + r + 4}"/>`;
      const o1 = (g % 3 - 1) * s * .07, o2 = ((g >> 2) % 3 - 1) * s * .07;
      d += `<g fill="none" stroke="${T_VEGETAL}" stroke-width="1.1" opacity=".9">
        ${arbre(px + s * .32 + o1, py + s * .3 + o2, s * .1)}
        ${arbre(px + s * .66 - o2, py + s * .54 + o1, s * .12)}
        <path d="M${px + s * .26} ${py + s * .78} l3 -4 l3 4 M${px + s * .58} ${py + s * .82} l2.5 -3.5 l2.5 3.5"/>
      </g>`;
      break;
    }
    case 'rail': {
      const railLa = (dx, dy) => { const n = nb(dx, dy); return !!n && n.t === 'rail'; };
      const horiz = railLa(1, 0) || railLa(-1, 0) || !(railLa(0, 1) || railLa(0, -1));
      let traverses = '';
      for (let i = 0; i < 4; i++) {
        const f = s * .14 + i * s * .24;
        traverses += horiz
          ? `<line x1="${px + f}" y1="${cy - s * .14}" x2="${px + f}" y2="${cy + s * .14}"/>`
          : `<line x1="${cx - s * .14}" y1="${py + f}" x2="${cx + s * .14}" y2="${py + f}"/>`;
      }
      d += `<g stroke="#33302a" stroke-width="2">${traverses}</g>`;
      d += horiz
        ? `<g stroke="${T_METAL}" stroke-width="1.2"><line x1="${px}" y1="${cy - s * .08}" x2="${px + s}" y2="${cy - s * .08}"/><line x1="${px}" y1="${cy + s * .08}" x2="${px + s}" y2="${cy + s * .08}"/></g>`
        : `<g stroke="${T_METAL}" stroke-width="1.2"><line x1="${cx - s * .08}" y1="${py}" x2="${cx - s * .08}" y2="${py + s}"/><line x1="${cx + s * .08}" y1="${py}" x2="${cx + s * .08}" y2="${py + s}"/></g>`;
      break;
    }
    case 'eau': {
      const vague = (yy) => `<path d="M${px + s * .12} ${yy} q${s * .13} -4.5 ${s * .26} 0 t${s * .26} 0 t${s * .26} 0" fill="none"/>`;
      d += `<g stroke="${T_EAU}" stroke-width="1.1">${vague(cy - s * .16)}${vague(cy)}${vague(cy + s * .16)}</g>`;
      break;
    }
    case 'site': {
      d += `<g fill="none" stroke="#565042" stroke-width="1.2">
        <line x1="${cx - s * .14}" y1="${cy - s * .14}" x2="${cx - s * .14}" y2="${cy + s * .16}"/>
        <line x1="${cx + s * .14}" y1="${cy - s * .14}" x2="${cx + s * .14}" y2="${cy + s * .16}"/>
        <line x1="${cx - s * .2}" y1="${cy - s * .16}" x2="${cx + s * .2}" y2="${cy - s * .16}"/>
        <line x1="${cx - s * .2}" y1="${cy + s * .16}" x2="${cx + s * .2}" y2="${cy + s * .16}"/></g>`;
      break;
    }
    case 'village': {
      const toit = (tx, ty, tw, th) => `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}"/><line x1="${tx}" y1="${ty + th / 2}" x2="${tx + tw}" y2="${ty + th / 2}"/>`;
      d += `<g fill="none" stroke="${T_TOIT}" stroke-width="1.1">${toit(px + s * .16, py + s * .22, s * .3, s * .24)}${toit(px + s * .52, py + s * .42, s * .32, s * .26)}</g>`;
      break;
    }
    case 'ville': {
      d += `<g fill="none" stroke="${T_TOIT}" stroke-width="1.1">
        <rect x="${px + s * .14}" y="${py + s * .16}" width="${s * .3}" height="${s * .4}"/>
        <rect x="${px + s * .52}" y="${py + s * .2}" width="${s * .34}" height="${s * .28}"/>
        <rect x="${px + s * .3}" y="${py + s * .6}" width="${s * .36}" height="${s * .24}"/></g>`;
      break;
    }
    case 'batiment': {
      // un toit vu du ciel, faîtage et arêtiers — l'orientation varie d'une case à l'autre
      const m = s * .15;
      const horiz = g % 2 === 0;
      d += `<g fill="none" stroke="${T_TOIT}" stroke-width="1.2">
        <rect x="${px + m}" y="${py + m}" width="${s - 2 * m}" height="${s - 2 * m}"/>
        ${horiz
          ? `<line x1="${px + m + 6}" y1="${cy}" x2="${px + s - m - 6}" y2="${cy}"/><line x1="${px + m}" y1="${py + m}" x2="${px + m + 6}" y2="${cy}"/><line x1="${px + m}" y1="${py + s - m}" x2="${px + m + 6}" y2="${cy}"/><line x1="${px + s - m}" y1="${py + m}" x2="${px + s - m - 6}" y2="${cy}"/><line x1="${px + s - m}" y1="${py + s - m}" x2="${px + s - m - 6}" y2="${cy}"/>`
          : `<line x1="${cx}" y1="${py + m + 6}" x2="${cx}" y2="${py + s - m - 6}"/><line x1="${px + m}" y1="${py + m}" x2="${cx}" y2="${py + m + 6}"/><line x1="${px + s - m}" y1="${py + m}" x2="${cx}" y2="${py + m + 6}"/><line x1="${px + m}" y1="${py + s - m}" x2="${cx}" y2="${py + s - m - 6}"/><line x1="${px + s - m}" y1="${py + s - m}" x2="${cx}" y2="${py + s - m - 6}"/>`}
      </g>`;
      break;
    }
    case 'escalier': {
      let l = '';
      for (let i = 1; i <= 4; i++) l += `<line x1="${px + s * .2}" y1="${py + (s * i) / 5}" x2="${px + s * .8}" y2="${py + (s * i) / 5}"/>`;
      d += `<g stroke="#565042" stroke-width="1.2">${l}</g>`;
      break;
    }
    case 'couloir': {
      d += `<g stroke="#565042" stroke-width="1" opacity=".5"><line x1="${px + 4}" y1="${cy - s * .16}" x2="${px + s - 4}" y2="${cy - s * .16}"/><line x1="${px + 4}" y1="${cy + s * .16}" x2="${px + s - 4}" y2="${cy + s * .16}"/></g>`;
      break;
    }
  }
  return d;
}

// Pion de zombie sur la carte : silhouette rouge, bras en avant.
// dir = vecteur du regard (petit cône dessiné devant lui) ; spin = anneau de
// contact en cours (il est sur toi : bouge, ou le combat s'engage).
function pionZombie(px, py, CS, n, dir, spin) {
  const cx = px + CS / 2, cy = py + CS / 2;
  let s = '<g>';
  // Cône de vue : un éventail estompé dans la direction du regard.
  if (dir && (dir[0] || dir[1])) {
    const ang = Math.atan2(dir[1], dir[0]);
    const L = 15, demi = 0.5; // ~±28°
    const ax = cx + Math.cos(ang - demi) * L, ay = cy + Math.sin(ang - demi) * L;
    const bx = cx + Math.cos(ang + demi) * L, by = cy + Math.sin(ang + demi) * L;
    s += `<path d="M${cx} ${cy}L${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}Z" fill="#a83226" opacity=".16"/>`;
  }
  // Anneau de contact : le décompte avant la morsure (anime en CSS).
  if (spin) s += `<circle class="zspin" cx="${cx}" cy="${cy}" r="13" fill="none" stroke="#e0503e" stroke-width="2"/>`;
  s += `<g class="zpion">
    <circle cx="${cx}" cy="${cy}" r="9.5" fill="#160b0b" stroke="#a83226" stroke-width="1.6"/>
    <circle cx="${cx - 0.5}" cy="${cy - 3.6}" r="2.6" fill="#c4574a"/>
    <path d="M${cx - 3.6} ${cy + 6.5}L${cx - 1.5} ${cy - 0.5}M${cx + 3.6} ${cy + 6.5}L${cx + 1.5} ${cy - 0.5}M${cx - 4.5} ${cy + 0.5}l9 -1.6" stroke="#c4574a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  </g>`;
  if (n > 1) {
    s += `<circle cx="${px + CS - 9}" cy="${py + 9}" r="6.5" fill="#a83226"/>
      <text x="${px + CS - 9}" y="${py + 12}" text-anchor="middle" font-size="9" fill="#fff">${n}</text>`;
  }
  return s + '</g>';
}

// Cadavre au sol (zombie abattu, ou faux-mort tant qu'il n'est pas réveillé) :
// une forme tassée, sombre, sans agitation.
function pictoCadavre(px, py, CS) {
  const cx = px + CS / 2, cy = py + CS / 2;
  return `<g class="zmort" opacity=".72">
    <ellipse cx="${cx}" cy="${cy + 1}" rx="10" ry="6.5" fill="#0e0808" stroke="#5a2420" stroke-width="1.3"/>
    <path d="M${cx - 6} ${cy + 1}l5 -2.5M${cx + 6} ${cy - 1}l-5 2" stroke="#7a2f28" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

// Ouïe : un zombie tout proche, hors de ta vue — un point rouge estompé qui
// pulse (parfois à travers les murs). Tu l'ENTENDS avant de le voir.
function pointOuie(px, py, CS) {
  const cx = px + CS / 2, cy = py + CS / 2;
  return `<circle class="zouie" cx="${cx}" cy="${cy}" r="4.5" fill="#a83226"/>`;
}

// Distance d'OUÏE entre toi et un nœud : en SAUTS si on est sur un plan à nœuds
// (champ fourni — cohérent avec la vue et la poursuite), en cases sinon. Sans ça, sur
// un plan de quartier, la distance de grille (sparse, arbitraire) fausserait le repère.
function distOuie(champOuie, x, y) {
  return champOuie ? (champOuie.get(`${x},${y}`) ?? 99) : Math.abs(x - G.world.x) + Math.abs(y - G.world.y);
}

// ---------- Co-op : le pion du coéquipier ----------
// Bleu (jamais confondu avec ton or ni leur rouge). Sa couleur vire selon ses PV ;
// un anneau d'alerte s'il est en plein combat.
function pionAllie(px, py, CS, pr, off = 0) {
  const cx = px + CS / 2 + off, cy = py + CS / 2 + off;
  const c = pr.pvTier === 'critique' ? '#c0603a' : pr.pvTier === 'amoche' ? '#c9a14a' : '#5ab0c9';
  let s = `<g class="allie">`;
  if (pr.enCombat) s += `<circle class="zspin" cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#e0503e" stroke-width="1.5" opacity=".85"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#0e1a1d" stroke="${c}" stroke-width="1.8"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${c}" stroke-width="1" opacity=".45"/>
    <circle cx="${cx}" cy="${cy - 1.8}" r="1.7" fill="${c}"/>`;
  return s + '</g>';
}

function manhattanPair(pr) { return Math.abs(pr.x - G.world.x) + Math.abs(pr.y - G.world.y); }

// La ligne d'état du coéquipier sous le nom du lieu (où il est, son état, en combat).
function pairBarre(vis) {
  if (!multi.estMulti()) return '';
  const pr = multi.pairEtat();
  let txt;
  if (!multi.pairPresent()) txt = multi.estHote() ? 'Co-op · en attente d\'un joueur' : 'coéquipier hors ligne';
  else if (!pr) txt = 'coéquipier connecté…';
  else if (pr.carte !== G.world.carte) { const c = carte(pr.carte); txt = `${pr.nom || 'Coéquipier'} : à ${c ? c.nom : 'un autre lieu'}`; }
  else {
    const ou = vis.has(`${pr.x},${pr.y}`) ? 'dans ta ligne de mire' : 'dans ce secteur';
    const etat = pr.enCombat ? ' — EN COMBAT' : pr.pvTier === 'critique' ? ' — mal en point' : pr.pvTier === 'amoche' ? ' — entamé' : '';
    txt = `${pr.nom || 'Coéquipier'} : ${ou}${etat}`;
  }
  const cls = (pr && pr.enCombat) ? 'lb-pair combat' : multi.pairPresent() ? 'lb-pair' : 'lb-pair off';
  return `<span class="${cls}" id="lb-pair">${txt}</span>`;
}
function majBarrePair() {
  const el = document.querySelector('#lb-pair');
  if (el) el.outerHTML = pairBarre(casesVisibles(G.world.carte, G.world.x, G.world.y));
}

// La tuile « Rejoindre le combat » : ton coéquipier se bat tout près, sur ta carte.
function tuilePairCombat() {
  if (!multi.estMulti() || enCombat()) return '';
  const pr = multi.pairEtat();
  if (!pr || !pr.enCombat || !pr.combat || pr.carte !== G.world.carte) return '';
  if (manhattanPair(pr) > 4) return '';
  return tuile('data-rejoindre="1"', 'attaque', 'Rejoindre le combat', `${pr.nom || 'ton coéquipier'} se bat tout près`, { classe: 'trouves-btn' });
}
// Rejoindre le combat du coéquipier — désormais avec POIGNÉE DE MAIN anti-course : on ne
// démarre PAS un combat tout de suite (le sien est peut-être déjà fini). On DEMANDE, et on
// n'entre que si l'hôte du combat confirme (avec la file à jour). Sans réponse → combat fini.
let rejoindreEnAttente = null; // enc qu'on attend de rejoindre (null = aucune demande en cours)
let rejoindreTimer = null;
function rejoindreCombatPair() {
  const pr = multi.pairEtat();
  if (!pr || !pr.enCombat || !pr.combat) { toast('Le combat est déjà fini.'); renderLieu(); return; }
  if (rejoindreEnAttente) return; // demande déjà partie : on attend la réponse
  rejoindreEnAttente = pr.combat.enc;
  multi.diffuserCombat({ sub: 'demande-rejoindre', enc: pr.combat.enc, nom: G.player.nom });
  toast('Tu te précipites pour l\'épauler…');
  clearTimeout(rejoindreTimer);
  rejoindreTimer = setTimeout(() => {
    if (rejoindreEnAttente) { rejoindreEnAttente = null; toast('Le combat est déjà fini.'); renderLieu(); }
  }, 1800); // pas de réponse à temps → le combat s'est terminé entre-temps
}

// Co-op : pousser l'état « monde » d'une case (objets au sol + fouille + sécurisée)
// au coéquipier. Appelé après chaque action qui touche le sol ou la fouille.
function syncCaseMonde(k) {
  if (!multi.estMulti()) return;
  multi.diffuserEvenement({ e: 'case', k, sol: solDe(k), fouille: G.world.fouilles[k] || null, secur: !!G.world.securisees[k] });
}
export function syncCaseCourante() { syncCaseMonde(keyCourante()); }

// Co-op : la case que le COÉQUIPIER est en train de fouiller (null s'il ne fouille pas).
let fouillePairK = null;
// La fouille EN COURS chez moi (overlay continu) : exposée pour que les événements
// réseau (objet trouvé, progression, fin) du coéquipier viennent l'alimenter. null = aucune.
let fouilleSession = null;
// Je signale au coéquipier que je commence / termine de fouiller une case, pour qu'il
// n'y vienne pas en même temps (et ne voie pas sa fouille « annulée »). Inerte en solo.
function signalerFouille(k, etat) {
  if (!multi.estMulti()) return;
  multi.diffuserEvenement({ e: 'fouille', k, etat });
}
// Le coéquipier est-il, là, physiquement sur cette case ? (filet de sécurité : si le
// signal 'fin' se perd parce qu'il s'est déconnecté, on ne reste pas bloqué.)
function pairSurCase(k) {
  const pr = multi.pairEtat();
  return !!pr && ckey(pr.carte, pr.x, pr.y) === k;
}

// Redessin de carte FIABLE après un événement réseau (case ramassée, fouille du pair…).
// Le coéquipier pouvait rater la mise à jour s'il marchait ou avait un panneau ouvert à
// l'instant du message : sa carte gardait l'objet « au sol » qui n'existe plus. On réessaie
// jusqu'à ce qu'il soit dispo — la case se resynchronise alors visiblement.
let rafraichirEnAttente = false;
function planifierRafraichirCarte() {
  if (rafraichirEnAttente) return;
  rafraichirEnAttente = true;
  const essayer = () => {
    if (!document.querySelector('.carte-grille')) { rafraichirEnAttente = false; return; }
    if (modaleBloque() || enMarche) { setTimeout(essayer, 250); return; }
    rafraichirEnAttente = false;
    rafraichirCarteSeule();
  };
  setTimeout(essayer, 0);
}

// Câblage co-op : posé une fois, dort tant qu'on n'est pas en multi.
let pairCombatPrec = false;
function brancherMulti() {
  // Monde partagé : on adopte l'état de case reçu (butin/fouille communs, dernier écrivain).
  multi.poser('onEvenement', (m) => {
    // Fouille partagée : présence + flux d'objets trouvés / progression / fin, relayés au
    // panneau de fouille en cours (cf. lancerFouilleContinue) pour que le coéquipier voie
    // la MÊME barre se remplir et les MÊMES objets sortir, sans double dépôt.
    if (m.e === 'fouille') {
      if (m.etat === 'debut') fouillePairK = m.k;
      else if (m.etat === 'fin') { if (fouillePairK === m.k) fouillePairK = null; }
      else if (m.etat === 'trouve') { if (fouilleSession && fouilleSession.k === m.k) fouilleSession.onTrouveDistant(m.label); }
      else if (m.etat === 'progress') { if (fouilleSession && fouilleSession.k === m.k) fouilleSession.onProgressDistant(m.frac); }
      else if (m.etat === 'complete') { if (fouilleSession && fouilleSession.k === m.k) fouilleSession.onCompleteDistant(); }
      return;
    }
    if (m.e !== 'case') return;
    if (Array.isArray(m.sol)) { if (m.sol.length) G.world.sol[m.k] = m.sol; else delete G.world.sol[m.k]; }
    if (m.fouille) {
      // FUSION, pas écrasement : on garde le plus avancé des deux compteurs et l'UNION
      // du butin déjà pris. Sans ça, l'état reçu écrasait une fouille locale en cours →
      // la fouille du joueur paraissait « annulée » (compteur qui saute, butin escamoté).
      const cur = G.world.fouilles[m.k];
      G.world.fouilles[m.k] = cur
        ? { n: Math.max(cur.n || 0, m.fouille.n || 0), frac: Math.max(cur.frac || 0, m.fouille.frac || 0), pris: { ...(cur.pris || {}), ...(m.fouille.pris || {}) } }
        : m.fouille;
    }
    if (m.secur) G.world.securisees[m.k] = true; else delete G.world.securisees[m.k];
    if (m.k.split(':')[0] !== G.world.carte) return; // pas ma carte : appliqué en mémoire, rien à redessiner
    const surAuSol = panelOuvert() && (($('.panel-head h2') || {}).textContent === 'Au sol') && m.k === keyCourante();
    if (surAuSol) panneauTrouves(); // le panneau « Au sol » ouvert sur cette case : on le rafraîchit
    else planifierRafraichirCarte(); // sinon : on redessine la carte DÈS QU'ON est dispo (même si on marche / un panneau est ouvert)
  });
  multi.poser('onPairMaj', (pr) => {
    if (!pr) fouillePairK = null; // coéquipier parti : plus aucune fouille à attendre
    if (!document.querySelector('.carte-grille') || modaleBloque() || enMarche) return;
    const combatNow = !!(pr && pr.enCombat);
    const flip = combatNow !== pairCombatPrec;
    pairCombatPrec = combatNow;
    if (flip) renderLieu();              // (dis)parition de la tuile « Rejoindre »
    else { rafraichirCarteSeule(); majBarrePair(); } // simple déplacement du pion
  });
  multi.poser('onCombat', (m) => {
    if (m.sub === 'demande-rejoindre') {
      // Le coéquipier veut me rejoindre : si MON combat (cet enc) est vivant, j'accepte
      // et renvoie la file à jour ; sinon je refuse (il verra « déjà fini »).
      repondreDemandeRejoindre(m);
    } else if (m.sub === 'rejoindre-ok') {
      if (rejoindreEnAttente !== m.enc) return;       // réponse à une autre/ancienne demande
      rejoindreEnAttente = null; clearTimeout(rejoindreTimer);
      if (enCombat()) return;                          // déjà entré entre-temps
      const ids = (m.ids && m.ids.length) ? [...m.ids] : [pick(zombiesPoolCourant())];
      log('Tu te jettes dans la mêlée pour épauler ton coéquipier.', 'good');
      demarrerCombat(ids, { onFin: () => renderLieu(), rejointPair: true, enc: m.enc });
    } else if (m.sub === 'rejoindre-non') {
      if (rejoindreEnAttente === m.enc) {
        rejoindreEnAttente = null; clearTimeout(rejoindreTimer);
        toast('Le combat est déjà fini.'); renderLieu();
      }
    } else if (m.sub === 'rejoint') {
      const txt = `${m.nom || 'Ton coéquipier'} t'a rejoint dans le combat !`;
      if (enCombat()) noteCombat(`<b>${txt}</b>`); else { toast(txt); sfx('alerte'); }
    } else if (m.sub === 'degats' || m.sub === 'fin') {
      appliquerCombatDistant(m);
      // Une demande de rejoindre en vol alors que le combat se termine : on l'annule.
      if (m.sub === 'fin' && rejoindreEnAttente === m.enc) {
        rejoindreEnAttente = null; clearTimeout(rejoindreTimer);
        if (!enCombat()) { toast('Le combat est déjà fini.'); renderLieu(); }
      }
    }
  });
  // Cinématique partagée : si le coéquipier en déclenche une, je la vois aussi.
  // En plein combat, le combat se fige, la scène se joue, puis reprend après un décompte.
  multi.poser('onCine', (id) => {
    // On MARQUE la scène comme vue de ce côté aussi : sans ça, l'invité re-déclencherait
    // « premiere_nuit » via son propre renderLieu après la version relayée (nuit en double).
    setFlag('cine_' + id); save();
    if (cineEnCours()) return; // déjà une scène à l'écran
    if (enCombat()) {
      if (pauseCombatPourCine()) jouerCine(id, () => reprendreCombatAvecDecompte(), true);
      else jouerCine(id, () => {}, true);
    } else {
      jouerCine(id, () => { if (document.querySelector('.carte-grille')) rafraichirCarteSeule(); }, true);
    }
  });
  // Horloge de l'hôte adoptée par l'invité : on rafraîchit l'affichage et la
  // bascule jour/nuit (ambiance + ombrage) sans toucher à sa propre survie.
  multi.poser('onHeure', () => { verifierBasculeNuit(); updateHUD(); });
  // Sommeil partagé : l'autre s'est (dé)préparé → on rafraîchit le panneau Dormir
  // s'il est ouvert ; le « go » à deux déclenche le sommeil de chacun.
  multi.poser('onDodo', () => {
    if (panelOuvert() && (($('.panel-head h2') || {}).textContent === 'Dormir')) panneauSommeil();
  });
  multi.poser('onDodoGo', (heures) => executerSommeil(heures));
  // Départ à deux : quand les DEUX ont ouvert les yeux, on entre dans le monde ensemble.
  multi.poser('onDeuxPrets', () => { showHUD(true); renderLieu(); });
  // Le coéquipier vient de se déclarer prêt : on rafraîchit l'écran d'attente (pseudo).
  multi.poser('onPretPair', () => { if ($('.attente-coop')) ecranAttenteCoop(); });
}
brancherMulti();

// ---------- Départ co-op : « Ouvrir les yeux » à deux ----------
// Appelé quand un joueur a fini l'intro et appuyé « Ouvrir les yeux ». En solo : on
// entre directement. En co-op : on se déclare prêt et on attend l'autre (écran d'attente).
// Quand les deux sont prêts, onDeuxPrets (ci-dessus) lance le monde des deux côtés.
export function coopEntrerOuAttendre() {
  if (!multi.estMulti()) { renderLieu(); return; }
  ecranAttenteCoop();
  multi.signalerPret(); // si l'autre est déjà prêt, onDeuxPrets enchaîne aussitôt le départ
}
function ecranAttenteCoop() {
  const echap = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const nom = echap(multi.nomPair() || 'ton coéquipier');
  render(`
    <div class="attente-coop">
      <div class="ac-pulse">${ico('oeil')}</div>
      <h2 class="lieu-nom">Tu ouvres les yeux.</h2>
      <p class="narration">En attente de <b>${nom}</b> — il doit ouvrir les yeux à son tour pour que le premier jour commence en même temps pour vous deux.</p>
      <div class="actions">${btnAct('data-seul="1"', 'Commencer sans attendre', 'si ton coéquipier tarde trop')}</div>
    </div>`);
  showHUD(false);
  const b = $('[data-seul]');
  if (b) b.onclick = () => { sfx('clic'); multi.forcerDepart(); };
}

// Les tailles de cases NON UNIFORMES (intérieur) viennent d'une grille PONDÉRÉE : chaque
// carte peut donner une largeur par colonne (carte.colW{x}) et une hauteur par ligne
// (carte.rowH{y}), en fraction d'une case pleine. Tout est géré dans svgCarte ci-dessous.

function svgCarte(reach, vis) {
  if (estGraphe(G.world.carte)) return svgCartePlan(reach, vis); // plan à nœuds libres
  const C = carteCourante();
  const interieur = C.echelle === 'interieur';
  // Cases plus petites au zoom moyen (quartier) : on voit la rue plus loin.
  const CS = interieur ? 56 : (C.echelle === 'quartier' ? 38 : 46);
  const GAP = interieur ? 0 : 3, PAD = interieur ? 5 : 4;
  // Grille PONDÉRÉE (intérieur) : largeur par colonne (carte.colW{x}) et hauteur par ligne
  // (carte.rowH{y}), en fraction de CS — de quoi rompre le quadrillage tout carré (couloirs
  // fins, paliers d'escalier courts…) tout en gardant murs, adjacence et clics ALIGNÉS : une
  // cellule reste un vrai rectangle de la grille (les bords partagés coïncident). Défaut 1.
  const colF = (x) => (interieur && C.colW && C.colW[x] != null) ? C.colW[x] : 1;
  const rowF = (y) => (interieur && C.rowH && C.rowH[y] != null) ? C.rowH[y] : 1;
  const cwA = [], chA = [], colX = [], rowY = [];
  let accX = PAD; for (let x = 0; x < C.largeur; x++) { cwA[x] = CS * colF(x); colX[x] = accX; accX += cwA[x] + GAP; }
  let accY = PAD; for (let y = 0; y < C.hauteur; y++) { chA[y] = CS * rowF(y); rowY[y] = accY; accY += chA[y] + GAP; }
  const W = accX - GAP + PAD;
  const H = accY - GAP + PAD;
  const toutConnu = hasItem('carte_quartier') && !interieur;
  const connue = (vx, vy) => toutConnu || estDecouverte(G.world.carte, vx, vy);
  const vivante = carteVivante(G.world.carte);
  const zombies = vivante ? zombiesSur(G.world.carte) : [];
  const morts = vivante ? mortsSur(G.world.carte) : [];
  const champOuie = vivante ? champOuieJoueur(G.world.carte) : null; // sauts (plan) ou null (grille)
  const pair = multi.estMulti() ? multi.pairEtat() : null; // le coéquipier, s'il y en a un
  // Une lampe allumée en main ou à la ceinture troue le noir autour de toi, sur un
  // RAYON qui dépend du type de lampe (la lampe torche porte à 2 cases).
  const lampe = lumiereActive();
  const rLampe = lampe ? rayonLumiere() : 0;
  // Co-op : la lampe du coéquipier éclaire AUSSI, autour de SA position (même carte) —
  // les deux halos se rejoignent quand vous êtes proches ou sur la même case.
  const pairLampe = !!(pair && pair.carte === G.world.carte && pair.lampe);
  const rPair = pairLampe ? (pair.rayonLampe || 1) : 0;
  const dansHalo = (x, y) =>
    (lampe && Math.abs(x - G.world.x) <= rLampe && Math.abs(y - G.world.y) <= rLampe)
    || (pairLampe && Math.abs(x - pair.x) <= rPair && Math.abs(y - pair.y) <= rPair);
  let cells = '', murs = '', parois = '';
  for (const [pos, cd] of Object.entries(C.cases)) {
    const [x, y] = pos.split(',').map(Number);
    if (!connue(x, y)) continue;
    const t = TERRAIN[cd.t] || TERRAIN.rue;
    // La CELLULE (rectangle de la grille pondérée) : fond, murs, halos, clic.
    const cellX = colX[x], cellY = rowY[y], cellW = cwA[x], cellH = chA[y];
    // L'ART (mobilier, pions, cadavre) se dessine dans un CARRÉ centré dans la cellule : les
    // ronds restent ronds et le mobilier proportionné, même dans une cellule non carrée.
    const cs = Math.min(cellW, cellH), dx = cellX + (cellW - cs) / 2, dy = cellY + (cellH - cs) / 2;
    const ici = x === G.world.x && y === G.world.y;
    const aVue = vis.has(pos);
    const atteign = reach.has(pos);
    const sel = selection === pos;
    const k = ckey(G.world.carte, x, y);
    const secur = estSecurisee(k);
    const niv = niveauSombre(cd);
    // le dessin de l'environnement, par-dessus le fond
    // Calque de DESSIN : explicite (cd.decor/creux/cloisons) sinon meublage AUTOMATIQUE par type/nom.
    const auto = interieur ? autoDecor(cd) : null;
    const decorSrc = cd.decor || (auto && auto.decor) || null;
    const creuxSrc = cd.creux || (auto && auto.creux) || null;
    let inner = interieur ? dessinInterieur(cd, x, y, dx, dy, cs, !!(auto && auto.decor)) : dessinExterieur(cd, x, y, dx, dy, cs);
    // creux d'abord (zones rendues en mur), puis prefabs posés. En coordonnées CELLULE (cellW/cellH),
    // pas le carré inscrit : un prefab épouse la cellule réelle.
    if (interieur) {
      if (creuxSrc) inner += dessinerCreux(creuxSrc, cellX, cellY, cellW, cellH);
      if (decorSrc) inner += dessinerDecor(decorSrc, cellX, cellY, cellW, cellH);
    }
    // une entrée (bâtiment, sortie d'intérieur) : le petit rectangle de porte
    if (cd.vers) {
      const basY = ['batiment', 'village', 'ville', 'site'].includes(cd.t) ? dy + cs - 20 : dy + 7;
      inner += `<rect x="${dx + cs / 2 - 5.5}" y="${basY}" width="11" height="14" rx="1" fill="#16130e" stroke="${cd.verrou && !G.world.verrous[k] ? '#8a5a28' : '#6d5d42'}" stroke-width="1.3"/>
        <circle cx="${dx + cs / 2 + 2.5}" cy="${basY + 7.5}" r="1" fill="#6d5d42"/>`;
    }
    if (solVisible(k).length) {
      inner += `<circle cx="${cellX + cellW - 8}" cy="${cellY + cellH - 8}" r="3" fill="${CODES.sol}"/>`;
    }
    // noir total : la case s'enfonce dans l'ombre — sauf dans un halo de lampe (la tienne
    // ou celle du coéquipier ; le noir lointain reste noir)
    const eclairee = dansHalo(x, y) && (ici || aVue);
    if (niv === 2 && !eclairee) inner += `<rect x="${cellX + 1}" y="${cellY + 1}" width="${cellW - 2}" height="${cellH - 2}" fill="#050507" opacity=".44"/>`;
    // Liserés : codes couleur de la case (voir Légende)
    const insetEtat = interieur ? 3 : 1.5;
    if (secur) inner += cadreCase(cellX, cellY, cellW, cellH, insetEtat, CODES.securisee);
    else if ((cd.danger || 0) >= 0.4) inner += cadreCase(cellX, cellY, cellW, cellH, insetEtat, CODES.danger);
    if (niv === 1) inner += cadreCase(cellX, cellY, cellW, cellH, insetEtat + 3, CODES.sombre, true);
    else if (niv === 2) inner += cadreCase(cellX, cellY, cellW, cellH, insetEtat + 3, CODES.sombre);
    // Indice texte : lbl explicite, sinon dérivé du nom (toutes les pièces en intérieur)
    const lbl = cd.lbl !== undefined ? cd.lbl
      : (cd.nom && (interieur || cd.vers || cd.special || cd.t === 'ville' || cd.t === 'village' || cd.t === 'site') ? cd.nom.split(' ')[0] : '');
    if (lbl && !ici) {
      inner += `<text x="${cellX + cellW / 2}" y="${cellY + cellH - 5}" text-anchor="middle" font-size="9" fill="#9a8f7c">${lbl.slice(0, 10)}</text>`;
    }
    // Hors de ta vue : la case reste en mémoire, mais on n'y voit pas
    // ce qui s'y trouve MAINTENANT (et les zombies n'y sont pas dessinés).
    if (!aVue && !ici) {
      inner += `<rect x="${cellX}" y="${cellY}" width="${cellW}" height="${cellH}" fill="#08080a" opacity=".4"/>`;
    }
    // Eux, et leurs morts. Visibles dans ta ligne de vue : on les voit ARRIVER.
    if (aVue) {
      // cadavres au sol + faux-morts (affichés comme des corps tant qu'ils dorment)
      const corps = morts.some(m => m.x === x && m.y === y)
        || zombies.some(z => z.faitLeMort && z.x === x && z.y === y);
      if (corps) inner += pictoCadavre(dx, dy, cs);
      const zlist = zombies.filter(z => !z.faitLeMort && z.x === x && z.y === y);
      if (zlist.length) inner += pionZombie(dx, dy, cs, zlist.length, zlist[0].dir, !!zlist[0].spin);
    } else if (!ici) {
      // Ouïe : un zombie vivant tout proche, hors de vue → point rouge estompé.
      const dist = distOuie(champOuie, x, y);
      if (dist <= OUIE_JOUEUR && zombies.some(z => !z.faitLeMort && z.x === x && z.y === y)) {
        inner += pointOuie(dx, dy, cs);
      }
    }
    // Le coéquipier (co-op) : on ne le voit QUE dans sa ligne de mire, comme eux.
    // Sur la même case que toi, on le décale pour que les deux ronds restent lisibles.
    if (pair && aVue && pair.carte === G.world.carte && pair.x === x && pair.y === y) {
      inner += pionAllie(dx, dy, cs, pair, ici ? 3 : 0);
    }
    if (ici) {
      // Pion joueur : un petit rond discret, légèrement décalé (au-dessus du contenu de la case).
      const off = (pair && pair.carte === G.world.carte && pair.x === x && pair.y === y) ? -3 : 0;
      const jx = cellX + cellW / 2 + off, jy = cellY + cellH / 2 + off;
      inner += `<g class="joueur"><circle cx="${jx}" cy="${jy}" r="5.5" fill="#c9b98a" stroke="#0b0b0c" stroke-width="1.8"/>
        <circle cx="${jx}" cy="${jy}" r="8" fill="none" stroke="#c9b98a" stroke-width="1" opacity=".5"/></g>`;
    }
    // Le FOND remplit toute la cellule : une cellule resserrée (couloir, escalier) est donc
    // physiquement plus petite — c'est la grille pondérée qui porte la variation de taille.
    cells += `<g class="case ${atteign ? 'atteignable' : ''} ${sel ? 'selection' : ''}" data-case="${pos}">
      <rect class="fond" x="${cellX}" y="${cellY}" width="${cellW}" height="${cellH}" rx="${interieur ? 0 : 2}" fill="${t.fill}" ${interieur ? '' : `stroke="${t.stroke}"`}/>
      ${inner}<rect class="hl" x="${cellX + 1.5}" y="${cellY + 1.5}" width="${cellW - 3}" height="${cellH - 3}" rx="2"/></g>`;
    if (interieur) {
      murs += mursDeCase(cd, x, y, cellX, cellY, cellW, cellH, connue);
      const cloiSrc = cd.cloisons || (auto && auto.cloisons) || null;
      if (cloiSrc) parois += dessinerCloisons(cloiSrc, cellX, cellY, cellW, cellH);
    }
  }
  return `<svg class="carte-grille" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${cells}${murs ? `<g fill="none" stroke="${MUR_TRAIT}" stroke-width="3" stroke-linecap="square">${murs}</g>` : ''}${parois}</svg>`;
}

// ============ Rendu « plan » : carte quartier à nœuds libres ============
// Un vrai plan de ville : les RUES sont des rubans entre nœuds liés, les BÂTIMENTS
// des blocs cernés (les murs), les places/parcs des nœuds plus larges. On se déplace
// de nœud en nœud comme avant, mais on voit enfin le tracé des rues et les façades.
const TAILLE_NOEUD = { place: 34, parc: 30, rue: 21, route: 23, autoroute: 23, batiment: 28, ville: 30, village: 28, site: 28, eau: 24, porte: 18 };
const BATI = new Set(['batiment', 'ville', 'village', 'site']);
// Position d'un nœud sur le plan : explicite (cx,cy) si dessinée à la main, sinon
// dérivée de la grille AVEC un décalage déterministe par nœud — ça casse l'alignement
// rigide et donne un tracé de rues organique, sans rien placer à la main.
function posN(cd, x, y) {
  if (cd.cx != null && cd.cy != null) return { cx: cd.cx, cy: cd.cy };
  const h = graine(x, y);
  return { cx: x * 78 + 52 + ((h & 31) - 15), cy: y * 78 + 52 + (((h >> 6) & 31) - 15) };
}
function rayonN(cd) { return cd.r ?? TAILLE_NOEUD[cd.t] ?? 21; }
function anneauN(cx, cy, r, couleur, dash = false) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${couleur}" stroke-width="1.6" ${dash ? 'stroke-dasharray="3 2.5"' : ''}/>`;
}
function glypheN(cd, cx, cy, r) {
  const g = (s) => `<g stroke="${T_TRAIT}" stroke-width="1.3" fill="none" stroke-linecap="round">${s}</g>`;
  if (BATI.has(cd.t)) { // quelques fenêtres sur la façade
    const w = r * 0.34;
    return g(`<line x1="${cx - w}" y1="${cy - r * .35}" x2="${cx - w}" y2="${cy + r * .35}"/><line x1="${cx + w}" y1="${cy - r * .35}" x2="${cx + w}" y2="${cy + r * .35}"/>`);
  }
  if (cd.t === 'parc' || cd.t === 'vegetal') return `<circle cx="${cx}" cy="${cy - 1}" r="${r * .42}" fill="#3c5436" stroke="#2c3f29" stroke-width="1"/><line x1="${cx}" y1="${cy + r * .1}" x2="${cx}" y2="${cy + r * .5}" stroke="#2c3f29" stroke-width="2"/>`;
  if (cd.t === 'eau') return g(`<path d="M${cx - r * .5} ${cy} q${r * .25} -6 ${r * .5} 0 t${r * .5} 0"/>`);
  return ''; // rue/place : la chaussée parle d'elle-même
}
const T_TRAIT = '#6d5d42';
function svgCartePlan(reach, vis) {
  const C = carteCourante();
  const toutConnu = hasItem('carte_quartier');
  const connue = (vx, vy) => toutConnu || estDecouverte(G.world.carte, vx, vy);
  const vivante = carteVivante(G.world.carte);
  const zombies = vivante ? zombiesSur(G.world.carte) : [];
  const morts = vivante ? mortsSur(G.world.carte) : [];
  const champOuie = vivante ? champOuieJoueur(G.world.carte) : null; // distance d'ouïe en SAUTS sur le plan
  const pair = multi.estMulti() ? multi.pairEtat() : null;
  const lampe = lumiereActive();
  // Co-op : la lampe du coéquipier éclaire autour de SON nœud (sur quelques sauts de rue,
  // selon le type de lampe) — pour qu'on s'entraide à trouer le noir, même séparés.
  const pairLampe = !!(pair && pair.carte === G.world.carte && pair.lampe);
  const haloPair = new Set();
  if (pairLampe) {
    let front = [`${pair.x},${pair.y}`]; haloPair.add(front[0]);
    for (let d = 0; d < (pair.rayonLampe || 1); d++) {
      const suiv = [];
      for (const kk of front) {
        const [hx, hy] = kk.split(',').map(Number);
        for (const [nx, ny] of voisinsCandidats(G.world.carte, hx, hy)) {
          const nk = `${nx},${ny}`;
          if (!haloPair.has(nk)) { haloPair.add(nk); suiv.push(nk); }
        }
      }
      front = suiv;
    }
  }
  // Dimensions du plan : carte.vue, sinon enveloppe des nœuds.
  let W = C.vue && C.vue.x, H = C.vue && C.vue.y;
  if (!W || !H) {
    W = 0; H = 0;
    for (const [pos, cd] of Object.entries(C.cases)) {
      const [x, y] = pos.split(',').map(Number); const { cx, cy } = posN(cd, x, y); const r = rayonN(cd);
      W = Math.max(W, cx + r + 18); H = Math.max(H, cy + r + 22);
    }
  }
  // 1) Les rues : un ruban par paire de nœuds liés (dessiné une seule fois).
  let rues = '', cells = '';
  const fait = new Set();
  for (const [pos, cd] of Object.entries(C.cases)) {
    const [x, y] = pos.split(',').map(Number);
    const a = posN(cd, x, y);
    for (const [bx, by] of voisinsCandidats(G.world.carte, x, y)) {
      const lk = `${bx},${by}`;
      const bcd = C.cases[lk]; if (!bcd) continue;
      const cle = pos < lk ? pos + '|' + lk : lk + '|' + pos; if (fait.has(cle)) continue; fait.add(cle);
      if (!connue(x, y) && !connue(bx, by)) continue;
      const b = posN(bcd, bx, by);
      const route = ROUTIER.has(cd.t) || ROUTIER.has(bcd.t);
      const large = route ? 15 : 9;
      rues += `<line x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}" stroke="${BANDE}" stroke-width="${large}" stroke-linecap="round"/>`;
      if (route) rues += `<line x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}" stroke="#3a3a40" stroke-width="1" stroke-dasharray="4 6" stroke-linecap="round"/>`;
    }
  }
  // 2) Les nœuds.
  for (const [pos, cd] of Object.entries(C.cases)) {
    const [x, y] = pos.split(',').map(Number);
    if (!connue(x, y)) continue;
    const { cx, cy } = posN(cd, x, y); const r = rayonN(cd);
    const ici = x === G.world.x && y === G.world.y;
    const aVue = vis.has(pos);
    const atteign = reach.has(pos);
    const sel = selection === pos;
    const k = ckey(G.world.carte, x, y);
    const t = TERRAIN[cd.t] || TERRAIN.rue;
    const bati = BATI.has(cd.t);
    let inner = bati
      ? `<rect x="${cx - r}" y="${(cy - r * 0.82).toFixed(1)}" width="${r * 2}" height="${(r * 1.64).toFixed(1)}" rx="3" fill="${t.fill}" stroke="${MUR_TRAIT}" stroke-width="2"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1.3"/>`;
    inner += glypheN(cd, cx, cy, r);
    if (cd.vers) inner += `<rect x="${cx - 5}" y="${(cy + r - 7).toFixed(1)}" width="10" height="13" rx="1" fill="#16130e" stroke="${cd.verrou && !G.world.verrous[k] ? '#8a5a28' : '#6d5d42'}" stroke-width="1.3"/>`;
    if (solVisible(k).length) inner += `<circle cx="${(cx + r - 5).toFixed(1)}" cy="${(cy - r + 5).toFixed(1)}" r="3" fill="${CODES.sol}"/>`;
    if (estSecurisee(k)) inner += anneauN(cx, cy, r + 3, CODES.securisee);
    else if ((cd.danger || 0) >= 0.4) inner += anneauN(cx, cy, r + 3, CODES.danger);
    const niv = niveauSombre(cd);
    const eclairee = (lampe && (ici || aVue)) || (pairLampe && haloPair.has(pos));
    if (niv === 2 && !eclairee) inner += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#050507" opacity=".44"/>`;
    if (niv === 1) inner += anneauN(cx, cy, r + 5, CODES.sombre, true);
    else if (niv === 2) inner += anneauN(cx, cy, r + 5, CODES.sombre);
    const lbl = cd.lbl !== undefined ? cd.lbl : (cd.nom ? cd.nom.split(' ')[0] : '');
    if (lbl && !ici) inner += `<text x="${cx}" y="${(cy + r + 16).toFixed(1)}" text-anchor="middle" font-size="16" fill="#e3d8bd" stroke="#0a0a0b" stroke-width="3" paint-order="stroke" style="font-weight:600">${lbl.slice(0, 14)}</text>`;
    if (!aVue && !ici) inner += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#08080a" opacity=".4"/>`;
    const box = [cx - 14, cy - 14, 28]; // boîte synthétique pour réutiliser les pions
    if (aVue) {
      const corps = morts.some(m => m.x === x && m.y === y) || zombies.some(z => z.faitLeMort && z.x === x && z.y === y);
      if (corps) inner += pictoCadavre(box[0], box[1], box[2]);
      const zlist = zombies.filter(z => !z.faitLeMort && z.x === x && z.y === y);
      if (zlist.length) inner += pionZombie(box[0], box[1], box[2], zlist.length, zlist[0].dir, !!zlist[0].spin);
    } else if (!ici) {
      // Ouïe sur le plan : un mort proche (en sauts) hors de vue → point estompé,
      // comme sur la grille, pour que chaque mort compté par le badge ait son repère.
      if (distOuie(champOuie, x, y) <= OUIE_JOUEUR && zombies.some(z => !z.faitLeMort && z.x === x && z.y === y)) inner += pointOuie(box[0], box[1], box[2]);
    }
    if (pair && aVue && pair.carte === G.world.carte && pair.x === x && pair.y === y) inner += pionAllie(box[0], box[1], box[2], pair, ici ? 4 : 0);
    if (ici) {
      const off = (pair && pair.carte === G.world.carte && pair.x === x && pair.y === y) ? -4 : 0;
      inner += `<g class="joueur"><circle cx="${cx + off}" cy="${cy + off}" r="6" fill="#c9b98a" stroke="#0b0b0c" stroke-width="1.8"/>
        <circle cx="${cx + off}" cy="${cy + off}" r="9" fill="none" stroke="#c9b98a" stroke-width="1" opacity=".5"/></g>`;
    }
    const hl = bati
      ? `<rect class="hl" x="${cx - r - 2}" y="${(cy - r * 0.82 - 2).toFixed(1)}" width="${r * 2 + 4}" height="${(r * 1.64 + 4).toFixed(1)}" rx="4"/>`
      : `<circle class="hl" cx="${cx}" cy="${cy}" r="${r + 2.5}"/>`;
    cells += `<g class="case ${atteign ? 'atteignable' : ''} ${sel ? 'selection' : ''}" data-case="${pos}">${inner}${hl}</g>`;
  }
  return `<svg class="carte-grille plan" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><g class="rues">${rues}</g>${cells}</svg>`;
}

function tagsCase(cd, k) {
  const tags = [];
  if (estSecurisee(k)) tags.push('<span class="ci-tag sur">sécurisée</span>');
  else if ((cd.danger || 0) >= 0.4) tags.push('<span class="ci-tag danger">très dangereux</span>');
  else if ((cd.danger || 0) >= 0.2) tags.push('<span class="ci-tag danger">dangereux</span>');
  if (cd.fouille) {
    const f = fouilleEtat(k);
    tags.push(`<span class="ci-tag">fouille ${f.n}/${cd.fouille.max}</span>`);
  }
  if (cd.vers) tags.push(`<span class="ci-tag">${cd.verrou && !G.world.verrous[k] ? 'accès bloqué' : 'on peut entrer'}</span>`);
  const niv = niveauSombre(cd);
  if (niv === 1) tags.push(`<span class="ci-tag sombre">pénombre${lumiereActive() ? ' — ta lampe éclaire' : ' — fouilles moins sûres'}</span>`);
  else if (niv === 2) tags.push(`<span class="ci-tag sombre">noir total${lumiereActive() ? ' — ta lampe éclaire' : ' — lumière nécessaire'}</span>`);
  const nSol = solVisible(k).reduce((s, e) => s + (e.qty || 1), 0);
  if (nSol) tags.push(`<span class="ci-tag">${nSol} objet${nSol > 1 ? 's' : ''} au sol</span>`);
  return tags.join('');
}

function tuile(attrs, icone, nom, sub = '', opts = {}) {
  return `<button class="tile${opts.classe ? ' ' + opts.classe : ''}" ${attrs} ${opts.disabled ? 'disabled' : ''}>
    <span class="t-ico">${ico(icone)}</span><span class="t-nom">${nom}</span>${sub ? `<span class="t-sub">${sub}</span>` : ''}</button>`;
}

// (Re)lie les clics sur les cases de la carte. Extrait pour pouvoir rafraîchir
// la grille seule (boucle temps réel) sans reconstruire tout l'écran.
// ---------- Menu radial : toutes les actions d'une case, sous le doigt ----------
// Plutôt que de scroller jusqu'au panneau du bas, on appuie (long) / clic droit / tape sa
// propre case → un anneau d'actions s'ouvre à l'endroit touché. Les actions sont les MÊMES
// que le panneau (fouiller, dormir, puiser, ramasser, entrer, aller…), via les mêmes fns.
const SPECIAL_ICO = {
  fontaine: 'soif', peche: 'soif', chasse: 'fouille', siphon: 'soif', cloches: 'options',
  cellules: 'verrou', conducteur: 'corps', batterie: 'surcharge', locomotive: 'monter',
};
const SPECIAL_NOM = {
  fontaine: 'Puiser', peche: 'Pêcher', chasse: 'Collet', siphon: 'Siphonner', cloches: 'Cloches',
  cellules: 'Cellules', conducteur: 'Le cheminot', batterie: 'La batterie', locomotive: 'Locomotive',
};
// Liste des actions disponibles sur une case → [{icon, nom, sub, disabled, fn}].
function actionsPourCase(pos, reach) {
  const C = carteCourante();
  const [x, y] = pos.split(',').map(Number);
  const cd = caseDef(G.world.carte, x, y) || {};
  const k = ckey(G.world.carte, x, y);
  const ici = (x === G.world.x && y === G.world.y);
  const acts = [];
  if (!ici) { // une autre case : on peut s'y rendre si elle est atteignable
    if (reach && reach.has(pos)) acts.push({ icon: 'aller', nom: 'Aller ici', sub: cd.nom || '', disabled: false, fn: () => allerEnCase(pos) });
    return acts;
  }
  // La case où tu te tiens : ses actions (mêmes conditions que le panneau du bas).
  if (cd.vers) {
    const cible = carte(cd.vers.carte);
    const bloque = cd.verrou && !G.world.verrous[k];
    acts.push({ icon: bloque ? 'verrou' : (cible && cible.echelle === 'interieur' ? 'entrer' : 'sortir'),
      nom: cd.versNom || (cible ? cible.nom : '?'), sub: bloque ? 'bloqué' : `${cd.vers.temps ?? C.tempsParCase} min`,
      disabled: bloque, fn: entrerCase });
  }
  if (cd.fouille) {
    const f = fouilleEtat(k);
    const epuisee = fouilleFinie(f, cd);
    const entamee = (f.frac || 0) > 0 && !epuisee;
    acts.push({ icon: 'fouille', nom: entamee ? 'Continuer' : 'Fouiller',
      sub: epuisee ? 'rien' : (entamee ? `${Math.round((f.frac || 0) * 100)} %` : ''), disabled: epuisee, fn: () => fouiller() });
  }
  const nbSol = solVisible(k).reduce((s, e) => s + (e.qty || 1), 0);
  if (nbSol) acts.push({ icon: 'ramasser', nom: `Ramasser`, sub: `${nbSol}`, disabled: false, fn: panneauTrouves });
  if (cd.special && tuileSpeciale(cd, k) !== '') {
    acts.push({ icon: SPECIAL_ICO[cd.special] || 'fouille', nom: SPECIAL_NOM[cd.special] || 'Action', sub: '', disabled: false, fn: () => actionSpeciale(cd.special) });
  }
  if (accesEau(cd) && cd.special !== 'fontaine') {
    acts.push({ icon: 'soif', nom: 'Puiser', sub: aDeQuoiPuiser() ? '' : 'aucun contenant', disabled: !aDeQuoiPuiser(), fn: panneauPuiser });
  }
  if (C.echelle === 'interieur') acts.push({ icon: 'dormir', nom: 'Dormir', sub: '', disabled: false, fn: panneauSommeil });
  // Co-op : rejoindre le combat du coéquipier tout proche (même condition que la tuile).
  if (multi.estMulti() && !enCombat()) {
    const pr = multi.pairEtat();
    if (pr && pr.enCombat && pr.combat && pr.carte === G.world.carte && manhattanPair(pr) <= 4)
      acts.push({ icon: 'attaque', nom: 'Rejoindre', sub: 'le combat', disabled: false, fn: rejoindreCombatPair });
  }
  return acts;
}

let radialOuvert = false;
function fermerRadial() {
  const ov = document.getElementById('radial-ov');
  if (ov) ov.remove();
  radialOuvert = false;
}
function ouvrirRadial(pos, cx, cy, reach) {
  if (enMarche || panelOuvert() || evtOuvert() || enCombat()) return;
  fermerRadial();
  const [x, y] = pos.split(',').map(Number);
  const acts = actionsPourCase(pos, reach);
  if (!acts.length) { selection = pos; majInfoCase(pos, reach); return; } // rien à faire ici : on sélectionne
  sfx('clic');
  radialOuvert = true;
  const RAY = 84;
  const vw = window.innerWidth, vh = window.innerHeight;
  cx = Math.max(RAY + 46, Math.min(cx, vw - RAY - 46));
  cy = Math.max(RAY + 60, Math.min(cy, vh - RAY - 70));
  const n = acts.length;
  const items = acts.map((a, i) => {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2; // premier élément en haut
    const ix = (Math.cos(ang) * RAY).toFixed(1), iy = (Math.sin(ang) * RAY).toFixed(1);
    return `<button class="radial-item${a.disabled ? ' off' : ''}" data-ri="${i}"
      style="transform:translate(-50%,-50%) translate(${ix}px,${iy}px)" title="${a.nom}${a.sub ? ' — ' + a.sub : ''}">
      ${ico(a.icon)}<span class="ri-nom">${a.nom}</span>${a.sub ? `<span class="ri-sub">${a.sub}</span>` : ''}</button>`;
  }).join('');
  const cd = caseDef(G.world.carte, x, y) || {};
  const titre = (x === G.world.x && y === G.world.y) ? 'Ici' : (cd.nom || 'Cette case');
  const ov = document.createElement('div');
  ov.id = 'radial-ov';
  ov.className = 'radial-ov';
  ov.innerHTML = `<div class="radial" style="left:${cx}px;top:${cy}px">
    <button class="radial-hub" data-rclose="1" title="Fermer">${ico('croix')}</button>
    ${items}<span class="radial-titre">${titre}</span></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('pointerdown', (e) => { if (e.target === ov) fermerRadial(); });
  ov.querySelector('[data-rclose]').onclick = fermerRadial;
  ov.querySelectorAll('[data-ri]').forEach(b => {
    b.onclick = () => { const a = acts[+b.dataset.ri]; if (!a || a.disabled) return; fermerRadial(); a.fn(); };
  });
  const esc = (e) => { if (e.key === 'Escape') { fermerRadial(); document.removeEventListener('keydown', esc); } };
  document.addEventListener('keydown', esc);
}

// Le bouton « Actions » (coin bas gauche) : ouvre le menu radial DEPUIS le bouton, pour la
// case SÉLECTIONNÉE (sinon celle où l'on se tient). On clique une case, puis ce bouton.
export function radialDepuisBouton() {
  if (!carteCourante() || enCombat() || panelOuvert() || evtOuvert()) return;
  const pos = selection || `${G.world.x},${G.world.y}`;
  const reach = atteignables(porteeActuelle());
  if (!actionsPourCase(pos, reach).length) { toast('Aucune action ici — sélectionne une case proche.'); return; }
  const b = document.getElementById('btn-actions');
  let ax = 64, ay = window.innerHeight - 150;
  if (b) { const r = b.getBoundingClientRect(); ax = r.right + 8; ay = r.top + r.height / 2; }
  ouvrirRadial(pos, ax, ay, reach);
}

// (Re)lie les clics sur les cases de la carte. Extrait pour pouvoir rafraîchir
// la grille seule (boucle temps réel) sans reconstruire tout l'écran.
let lpTimer = null, lpX = 0, lpY = 0, lpFired = false;
function lierCasesCarte(reach) {
  if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
  const annuleLP = () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } };
  document.querySelectorAll('[data-case]').forEach(g => {
    const pos = g.dataset.case;
    g.onclick = () => {
      if (enMarche) return; // on ne change pas de cap en pleine marche
      if (lpFired) { lpFired = false; return; } // un appui long vient d'agir : on ignore le clic
      if (pos === `${G.world.x},${G.world.y}`) {
        // Sur ta propre case : un tap ouvre le menu d'actions (plus besoin de scroller).
        const acts = actionsPourCase(pos, reach);
        if (acts.length) { const r = g.getBoundingClientRect(); ouvrirRadial(pos, r.left + r.width / 2, r.top + r.height / 2, reach); }
        else { selection = null; renderLieu(); }
        return;
      }
      if (selection === pos && reach.has(pos)) { selection = null; sfx('clic'); allerEnCase(pos); return; }
      selection = pos;
      majInfoCase(pos, reach);
    };
    // Appui long (mobile + souris) → menu radial à l'endroit pressé.
    g.addEventListener('pointerdown', (e) => {
      if (enMarche || e.button === 2) return;
      lpX = e.clientX; lpY = e.clientY; lpFired = false;
      annuleLP();
      lpTimer = setTimeout(() => { lpTimer = null; lpFired = true; ouvrirRadial(pos, e.clientX, e.clientY, reach); }, 420);
    });
    g.addEventListener('pointerup', annuleLP);
    g.addEventListener('pointercancel', annuleLP);
    g.addEventListener('pointermove', (e) => {
      if (lpTimer && (Math.abs(e.clientX - lpX) > 12 || Math.abs(e.clientY - lpY) > 12)) annuleLP();
    });
    // Clic droit (desktop) → menu radial.
    g.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (enMarche) return;
      const r = g.getBoundingClientRect();
      ouvrirRadial(pos, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, reach);
    });
  });
}

// Redessine UNIQUEMENT la grille (pions, points d'ouïe, cadavres, portes
// enfoncées) sans toucher au reste de l'écran : c'est ce que joue la boucle
// temps réel à chaque pas des zombies, pour ne pas tout reconstruire.
function rafraichirCarteSeule() {
  const svg = document.querySelector('.carte-wrap .carte-grille');
  if (!svg) return;
  const reach = atteignables(porteeActuelle());
  const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
  svg.outerHTML = svgCarte(reach, vis);
  lierCasesCarte(reach);
}

export function renderLieu() {
  const C = carteCourante();
  if (!C) { console.error('Carte inconnue', G.world.carte); return; }
  const cd = caseCourante() || {};
  const k = keyCourante();
  peuplerCarte(G.world.carte);
  assignerGaranties(G.world.carte); // pose le butin garanti (lampe, clé…) à la 1re visite
  assignerEvenements(G.world.carte); // pré-place les événements (mêmes lieux pour les deux en co-op)
  decouvrirAutour(G.world.carte, G.world.x, G.world.y);
  playAmbiance(G.world.carte);
  reevaluerTension(); // playAmbiance a pu rebâtir la scène (carte / jour↔nuit) : ré-arme la musique d'action au prochain tick
  setLieuLabel(`${cd.nom || C.nom}`);

  const portee = porteeActuelle();
  const reach = atteignables(portee);
  const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
  const nbSol = solVisible(k).reduce((s, e) => s + (e.qty || 1), 0);
  const f = cd.fouille ? fouilleEtat(k) : null;

  // Un râle pas loin : tu LES vois sur la carte, eux te sentent.
  if (carteVivante(G.world.carte) && !enMarche) {
    const proche = zombiesSur(G.world.carte).some(z =>
      vis.has(`${z.x},${z.y}`) && Math.abs(z.x - G.world.x) + Math.abs(z.y - G.world.y) <= 4);
    if (proche && chance(0.35)) sfx('zombie_loin');
  }

  // Le dessin d'ambiance vit DERRIÈRE la carte (sous un voile), et en grand
  // via le bouton œil — son ciel suit l'heure du jeu.
  const fond = aAmbiance(G.world.carte) ? svgAmbiance(G.world.carte, G.world.heure + G.world.minute / 60) : '';
  let html = `
  <div class="lieu-bar"><span class="lb-nom">${C.nom}</span>
    <span class="lb-sub">${ECHELLE_NOM[C.echelle]}${C.exterieur ? ' — à découvert' : ''}${estNuit() ? ' — nuit' : ''}</span>${pairBarre(vis)}</div>
  <div class="carte-wrap${vueDessin && fond ? ' vue-dessin' : ''}">
    ${fond ? `<div class="carte-fond">${fond}</div><div class="carte-voile"></div>` : ''}
    ${svgCarte(reach, vis)}
    <div class="carte-legende">
      <button class="legende-btn" data-legende="1" title="Légende et déplacement">?</button>
      ${fond ? `<button class="legende-btn icone" data-vue="1" title="${vueDessin ? 'Revenir au plan' : 'Voir les lieux'}">${ico(vueDessin ? 'carte' : 'oeil')}</button>` : ''}
    </div>
  </div>
  <div class="case-info" id="case-info">
    <div class="ci-nom">${cd.nom || C.nom}</div>
    ${cd.desc ? `<div class="ci-desc">${cd.desc}</div>` : ''}
    <div class="ci-tags">${tagsCase(cd, k)}</div>
  </div>
  ${barreRonde()}
  <div class="actions"><div class="tiles">`;

  // --- actions sur la case courante ---
  if (cd.vers) {
    const cible = carte(cd.vers.carte);
    const bloque = cd.verrou && !G.world.verrous[k];
    html += tuile('data-entrer="1"', bloque ? 'verrou' : (cible && cible.echelle === 'interieur' ? 'entrer' : 'sortir'),
      cd.versNom || (cible ? cible.nom : '?'), bloque ? '<span class="req">accès bloqué</span>' : `${cd.vers.temps ?? C.tempsParCase} min`);
  }
  if (cd.fouille) {
    const epuisee = fouilleFinie(f, cd);
    const entamee = (f.frac || 0) > 0 && !epuisee;
    const pct = Math.round((f.frac || 0) * 100);
    const nivF = niveauSombre(cd);
    const mention = nivF === 2 ? ' · <span class="req">noir total</span>' : nivF === 1 ? ' · pénombre' : '';
    html += tuile('data-fouille="1"', 'fouille', entamee ? 'Continuer la fouille' : 'Fouiller',
      epuisee ? 'plus rien à fouiller' : (entamee ? `déjà ${pct} % — reprendre${mention}` : `tout y passer${mention}`),
      { disabled: epuisee });
  }
  if (nbSol) {
    html += tuile('data-sol="1"', 'ramasser', `Ramasser (${nbSol})`, 'examiner ce qui traîne', { classe: 'trouves-btn' });
  }
  if (cd.special) html += tuileSpeciale(cd, k);
  // Une source d'eau sans case spéciale (citerne du triage, berge d'un canal...)
  if (accesEau(cd) && cd.special !== 'fontaine') {
    html += tuile('data-puiser="1"', 'soif', 'Puiser de l\'eau',
      aDeQuoiPuiser() ? 'remplir un contenant — eau croupie' : '<span class="req">aucun contenant à remplir</span>',
      { disabled: !aDeQuoiPuiser() });
  }
  if (C.echelle === 'interieur') {
    html += tuile('data-dormir="1"', 'dormir', 'Dormir', sommeilInfo());
  }
  html += tuilePairCombat(); // co-op : rejoindre le combat du coéquipier tout proche
  html += `</div></div>`;
  // Journal de bord : MASQUÉ sur mobile (s'ouvre via le bouton Journal, pour laisser la
  // place à la carte) mais TOUJOURS visible sur PC sous les actions — l'écran est assez
  // grand (cf. CSS .gamelog-inline, affiché seulement en grand écran). Sur mobile la règle
  // CSS le cache : on peut donc toujours l'écrire, c'est l'affichage qui s'adapte.
  html += `<div class="gamelog gamelog-inline" id="gamelog-inline">${logHtml()}</div>`;

  render(html);
  updateHUD();
  if (multi.estMulti()) multi.diffuserPosition(); // co-op : signaler ma position/état au coéquipier

  // --- interactions carte ---
  lierCasesCarte(reach);
  const lier = (sel, fn) => { const b = $(sel); if (b) b.onclick = () => { if (enMarche) return; sfx('clic'); fn(); }; };
  lier('[data-entrer]', entrerCase);
  lier('[data-fouille]', () => fouiller());
  lier('[data-sol]', panneauTrouves);
  lier('[data-puiser]', panneauPuiser);
  lier('[data-dormir]', panneauSommeil);
  lier('[data-legende]', panneauLegende);
  lier('[data-vue]', () => { vueDessin = !vueDessin; renderLieu(); });
  lier('[data-attendre]', panneauAttendre);
  lier('[data-lampe]', basculerLampePortee);
  lier('[data-rejoindre]', rejoindreCombatPair);
  const sp = $('[data-special]');
  if (sp) sp.onclick = () => { if (enMarche) return; sfx('clic'); actionSpeciale(sp.dataset.special); };

  // La toute première nuit de l'aventure : un plan sur la place, du noir total.
  // En co-op, SEUL l'hôte la déclenche (il fait foi sur l'horloge) puis la diffuse à
  // l'invité — sinon les deux la lanceraient chacun de leur côté (nuit jouée en double).
  if (estNuit() && !getFlag('cine_premiere_nuit') && !getFlag('chapitre2') && !enMarche && !multi.estInvite()) {
    jouerCineUneFois('premiere_nuit');
  }
}

// ---------- Boutons ronds sous la carte : statut de lumière + lampe + attendre ----------
// Le statut de lumière est TOUJOURS affiché (« Lumière allumée · piles 60% », « Lampe
// éteinte », « Aucune lampe ») : le joueur voit en permanence s'il a de la lumière sur lui.
function barreRonde() {
  const L = etatLumiere();
  const titre = !L.a ? 'Aucune lampe — trouve-en une (et des piles)'
    : L.on ? 'Éteindre la lampe' : 'Allumer la lampe (sortie du sac et prise en main si besoin)';
  const sousTexte = L.a ? `${L.reserve} paire${L.reserve > 1 ? 's' : ''} de piles en réserve` : 'Trouve une lampe et des piles';
  return `<div class="actions-rondes">
    <div class="lampe-statut ${L.on ? 'on' : L.a ? '' : 'vide'}" title="${sousTexte}">
      ${ico('lumiere')}<span class="lampe-texte">${L.texte}</span>
    </div>
    ${L.a ? `<button class="brond ${L.on ? 'on' : ''}" data-lampe="1" title="${titre}">${ico('lumiere')}</button>` : ''}
    <button class="brond" data-attendre="1" title="Attendre">${ico('sablier')}</button>
  </div>`;
}

// Rafraîchit EN PLACE l'indicateur de lumière (texte + % piles) sans reconstruire la
// carte : appelé à chaque battement du monde pour que la charge des piles « descende »
// sous les yeux, même quand le joueur n'agit pas (sinon le % paraît figé entre deux actions).
function majIndicateurLumiere() {
  const st = document.querySelector('.lampe-statut');
  if (!st) return;
  const L = etatLumiere();
  // Cibler le span de TEXTE explicitement : st.querySelector('span') attrapait le span
  // de l'icône (ico() enveloppe le SVG dans <span class="ico">) et y collait le texte,
  // d'où le statut affiché en double.
  const span = st.querySelector('.lampe-texte');
  if (span) span.textContent = L.texte;
  st.classList.toggle('on', !!L.on);
  st.classList.toggle('vide', !L.a && !L.on);
  const btn = document.querySelector('[data-lampe]');
  if (btn) btn.classList.toggle('on', !!L.on);
}

function basculerLampePortee() {
  const r = basculerLumiere();
  if (!r.ok) { toast(r.raison || 'Impossible.'); return; }
  const d = defItem(r.ref.id);
  const nom = d.nom.toLowerCase();
  sfx('clic');
  if (r.renverse) log(`${r.renverse} : l'eau se renverse — tu avais les mains prises.`, 'warn');
  if (r.deja) log(`${d.nom} sort du sac — elle éclaire enfin.`, '');
  else if (r.ref.id === 'torche') log(r.on ? 'La torche s\'embrase. La flamme danse — et se voit de loin.' : 'Tu étouffes la torche.', '');
  else {
    const intro = r.depuisSac ? `Tu sors ${nom} du sac. ` : '';
    log(r.on ? `${intro}Clic — ${d.nom} troue l'obscurité.` : `Tu éteins ${nom === 'torche' ? 'la torche' : 'la ' + nom}.`, '');
  }
  save();
  renderLieu();
}

// ---------- Attendre : laisser filer le temps pour reprendre son souffle ----------
function panneauAttendre() {
  // En co-op, on ne « saute » pas le temps tout seul (ça désynchroniserait les
  // deux horloges) : le temps s'écoule déjà en continu. Pour franchir la nuit,
  // on dort à deux. Le bouton ne propose donc que ce rappel.
  if (multi.estMulti() && multi.pairPresent()) {
    showPanel(`
      <div class="panel-head"><h2>Attendre</h2><button class="panel-close">×</button></div>
      <p class="cap-line">En co-op, le temps s'écoule en continu, à l'identique pour vous deux : pas besoin d'attendre.
      Pour sauter une longue période (la nuit), <b>dormez en même temps</b> depuis le menu Dormir.</p>`);
    return;
  }
  const box = showPanel(`
    <div class="panel-head"><h2>Attendre</h2><button class="panel-close">×</button></div>
    <p class="cap-line">S'asseoir, souffler, guetter. Le repos rend l'endurance bien plus vite que la marche —
    mais le temps passe pour tout le monde : la faim, la soif... et eux.</p>
    <div class="actions">
      ${btnAct('data-att="10"', 'Reprendre son souffle', '10 minutes')}
      ${btnAct('data-att="30"', 'Faire une vraie pause', '30 minutes')}
      ${btnAct('data-att="60"', 'Attendre une heure', '1 h')}
    </div>`);
  box.querySelectorAll('[data-att]').forEach(b => {
    b.onclick = () => {
      sfx('clic');
      closePanel();
      const min = parseInt(b.dataset.att, 10);
      attente('Tu attends, l\'oreille tendue…', min, () => {
        const r = attendre(min);
        r.messages.forEach(m => log(m.t, m.c));
        if (r.mort) return;
        if (r.staGain > 0) {
          log(`Tu reprends ton souffle (+${r.staGain} endurance).`, 'good');
          toast(`+${r.staGain} endurance — tu reprends ton souffle.`);
        } else {
          log('Le temps passe. Tu n\'avais pas vraiment besoin de souffler.', '');
        }
        updateHUD();
        save();
        // Pendant que tu soufflais, eux marchaient.
        if (carteVivante(G.world.carte)) {
          const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
          const ev = tickZombies(G.world.carte, vis);
          if (ev.contact) { renderLieu(); lancerCombatContact(ev.contact); return; }
        }
        renderLieu();
      });
    };
  });
}

// ---------- Légende de la carte ----------
function panneauLegende() {
  const carre = (couleur, dash = false, fond = '#211e19') =>
    `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="${fond}" stroke="${couleur}" stroke-width="1.6" ${dash ? 'stroke-dasharray="3 2.5"' : ''}/></svg>`;
  const ligne = (sym, txt) => `<div class="leg-row">${sym}<span>${txt}</span></div>`;
  const mur = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><line x1="10" y1="1" x2="10" y2="19" stroke="${MUR_TRAIT}" stroke-width="2.6"/></svg>`;
  const murPorte = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><g stroke="${MUR_TRAIT}" stroke-width="2.6"><line x1="10" y1="1" x2="10" y2="4.5"/><line x1="10" y1="15.5" x2="10" y2="19"/></g><rect x="8" y="4.5" width="4" height="11" rx="1" fill="#16130e" stroke="#6d5d42" stroke-width="1.1"/></svg>`;
  const murOuvert = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><g stroke="${MUR_TRAIT}" stroke-width="2.6"><line x1="10" y1="1" x2="10" y2="5"/><line x1="10" y1="15" x2="10" y2="19"/></g></svg>`;
  const Cl = carteCourante() || {};
  const portee = porteeActuelle();
  const box = showEvt(`<h2 class="lieu-nom">Légende de la carte</h2>
    <div class="leg-grid">
      <div class="leg-row"><span style="grid-column:1/-1"><b>Déplacement</b> — tu marches jusqu'à ${portee} case${portee > 1 ? 's' : ''} d'un coup${Cl.tempsParCase ? ` (${Cl.tempsParCase} min/case)` : ''}${Cl.sousTitre ? ` · ${Cl.sousTitre}` : ''}.</span></div>
      <div class="leg-sep"></div>
      ${ligne(carre(CODES.danger), '<b>Encadré rouge</b> — très dangereux : attends-toi à de la compagnie.')}
      ${ligne(carre(CODES.sombre, true), '<b>Violet pointillé</b> — pénombre : on y voit mal, fouiller sans lampe est moins sûr.')}
      ${ligne(carre(CODES.sombre, false, '#0c0c12'), '<b>Violet plein, case assombrie</b> — noir total : sans lumière, fouiller devient un pari.')}
      ${ligne(carre(CODES.securisee), '<b>Encadré vert</b> — pièce fouillée, nettoyée, sûre.')}
      ${ligne(carre('#5a544a', true), '<b>Pointillé clair</b> — case atteignable : touche-la deux fois et tu marches jusque-là, pas à pas.')}
      ${ligne(carre('#c9b98a'), '<b>Encadré doré</b> — case sélectionnée : touche encore pour t\'y rendre.')}
      ${ligne(`<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#211e19" stroke="#383226"/><circle cx="14" cy="14" r="3" fill="${CODES.sol}"/></svg>`, '<b>Point ocre</b> — des objets traînent au sol.')}
      ${ligne(`<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#211e19" stroke="#383226"/><circle cx="10" cy="10" r="4.5" fill="#c9b98a" stroke="#0b0b0c" stroke-width="1.5"/></svg>`, '<b>Cercle clair</b> — toi.')}
      ${ligne(`<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#211e19" stroke="#383226"/><circle cx="10" cy="10" r="6" fill="#160b0b" stroke="#a83226" stroke-width="1.4"/><circle cx="9.7" cy="7.8" r="1.7" fill="#c4574a"/><path d="M7.8 14l1.1-4M12.2 14l-1.1-4M7.4 10.4l5.4-1" stroke="#c4574a" stroke-width="1.2" fill="none"/></svg>`, '<b>Silhouette rouge</b> — un zombie. Tu le vois de loin dans ta ligne de vue ; il avance quand tu avances. Au contact : combat.')}
      ${ligne(`<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#211e19" stroke="#383226"/><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#08080a" opacity=".5"/></svg>`, '<b>Case assombrie</b> — explorée, mais hors de ta vue : on n\'y voit pas ce qui s\'y trouve maintenant.')}
      <div class="leg-sep"></div>
      <div class="leg-row"><span style="grid-column:1/-1">En intérieur, la carte est un <b>plan</b> : les murs disent où l\'on ne passe pas, les portes et les ouvertures disent où l\'on va.</span></div>
      ${ligne(mur, '<b>Trait épais</b> — un mur : on ne traverse pas.')}
      ${ligne(murPorte, '<b>Battant sur le mur</b> — une porte : on peut passer (rouille : verrouillée).')}
      ${ligne(murOuvert, '<b>Mur interrompu</b> — ouverture libre : le couloir ou le plateau continue.')}
      ${ligne(`<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="#2b2620" stroke="#4a3e2c"/><rect x="6.5" y="5" width="7" height="10" rx="1" fill="#16130e" stroke="#6d5d42" stroke-width="1.3"/></svg>`, '<b>Petit rectangle de porte</b> — un lieu où entrer (bâtiment, sortie).')}
    </div>
    <div class="actions">${btnAct('data-leg-ok="1"', 'Compris', '', { classe: 'primary' })}</div>`);
  box.querySelector('[data-leg-ok]').onclick = () => closeEvt();
}

function majInfoCase(pos, reach) {
  const [x, y] = pos.split(',').map(Number);
  const cd = caseDef(G.world.carte, x, y) || {};
  const k = ckey(G.world.carte, x, y);
  const connu = estDecouverte(G.world.carte, x, y) || (hasItem('carte_quartier') && carteCourante().echelle !== 'interieur');
  const dist = reach.get(pos);
  const C = carteCourante();
  let action = '';
  if (dist) action = `<div class="item-btns" style="margin-top:6px"><button data-go="${pos}">${ico('aller')} Y aller — ${dist * C.tempsParCase} min</button></div>`;
  else if (C.echelle === 'interieur' && Math.abs(x - G.world.x) + Math.abs(y - G.world.y) === 1 && franchissable(G.world.carte, x, y)) {
    action = `<div class="ci-desc">Un mur sépare ces deux pièces : passe par le couloir.</div>`;
  } else action = `<div class="ci-desc">Trop loin pour un seul déplacement : approche-toi case par case.</div>`;
  $('#case-info').innerHTML = `
    <div class="ci-nom">${connu ? (cd.nom || '—') : 'Zone inconnue'}</div>
    ${connu && cd.desc ? `<div class="ci-desc">${cd.desc}</div>` : ''}
    <div class="ci-tags">${connu ? tagsCase(cd, k) : ''}</div>${action}`;
  document.querySelectorAll('.carte-grille .case').forEach(c => c.classList.toggle('selection', c.dataset.case === pos));
  const go = $('[data-go]');
  if (go) go.onclick = () => {
    if (enMarche) return;
    selection = null;
    sfx('clic');
    allerEnCase(pos);
  };
}

// ---------- Déplacement : la marche animée ----------
// Le personnage AVANCE case par case, comme si on le faisait bouger : à chaque
// pas, le temps passe, la carte se découvre, et les zombies jouent leur tour.
// Tout contact interrompt la marche et déclenche le combat.
function allerEnCase(pos) {
  if (enMarche) return;
  if (surcharge()) { toast('Beaucoup trop chargé pour bouger. Pose des objets au sol pour t\'alléger.'); return; }
  const chemin = cheminVers(pos);
  if (!chemin.length) return;
  marcher(chemin);
}

function marcher(chemin) {
  const C = carteCourante();
  enMarche = true;
  const pas = () => {
    if (!enMarche || !G) return;
    const [x, y] = chemin.shift();
    // Le temps n'est plus « sauté » par pas : il coule en temps réel (boucle du
    // monde), donc marcher coûte le temps réel de la marche — pareil pour les deux.
    G.world.x = x; G.world.y = y;
    sfx('pas'); // un pas bref et net à chaque case
    // De temps en temps, une lame craque sous le pied : ça s'entend, et ça peut
    // attirer un mort tout proche. La nuit, on est plus lourd, plus maladroit.
    if (carteVivante(G.world.carte) && ++pasDepuisCraque >= 5 && chance(estNuit() ? 0.55 : 0.38)) {
      pasDepuisCraque = 0;
      sfx('pas_craque');
      attirerZombies(G.world.carte, x, y, estNuit() ? 3 : 2);
    }
    decouvrirAutour(G.world.carte, x, y);
    G.player.sta = Math.max(0, G.player.sta - 0.6); // marcher use, un peu
    const vis = casesVisibles(G.world.carte, x, y);
    // Eux aussi avancent — et le contact arrête tout.
    let contact = null;
    if (carteVivante(G.world.carte)) {
      const fm = fauxMortEn(G.world.carte, x, y); // marcher SUR un faux-mort le réveille
      if (fm) { reveillerFauxMort(fm); sfx('zombie'); }
      // Les morts gardent LEUR horloge (TICK_MS), que tu marches ou non : sinon un pas
      // toutes les 190 ms ferait jouer leur tick ~5× trop souvent et la lenteur voulue
      // en quartier s'effondrerait dès qu'on bouge. On ne les fait jouer qu'un tick par TICK_MS.
      const now = performance.now();
      if (now - dernierTickZ >= TICK_MS) {
        dernierTickZ = now;
        const ev = tickZombies(G.world.carte, vis);
        if (ev.portes.length) {
          sfx(ev.portes.some(p => p.cassee) ? 'porte_casse' : 'porte_coup');
          if (ev.portes.some(p => p.cassee)) log('Une porte cède sous les coups, tout près.', 'bad');
        }
        contact = ev.contact;
      }
      majTension(vis);
    }
    if (contact) {
      enMarche = false;
      save();
      renderLieu();
      lancerCombatContact(contact);
      return;
    }
    if (!chemin.length) {
      enMarche = false;
      save();
      arrivee();
      return;
    }
    renderLieu();
    setTimeout(pas, 190);
  };
  pas();
}

// Combat au contact d'un zombie de la carte : lui, et ceux collés à lui.
function lancerCombatContact(z) {
  poserTension(0); // la musique de combat prend le relais
  const cd = caseCourante() || {};
  const carteId = G.world.carte;
  const meute = meuteAuContact(carteId, G.world.x, G.world.y);
  const groupe = meute.includes(z) ? meute : [z, ...meute];
  const positions = groupe.map(v => ({ x: v.x, y: v.y })); // pour y laisser les cadavres
  groupe.forEach(v => retirerZombie(carteId, v));
  log(`${cd.nom || 'Ici'} : ${groupe.length > 1 ? 'ils sont' : 'il est'} sur toi.`, 'bad');
  demarrerCombat(groupe.map(v => v.id), {
    onFin: (res) => {
      if (res === 'victoire') positions.forEach(p => ajouterMort(carteId, p.x, p.y));
      renderLieu();
    },
  });
}

function entrerCase() {
  const cd = caseCourante();
  if (!cd || !cd.vers) return;
  const k = keyCourante();
  if (cd.verrou && !G.world.verrous[k]) { ecranVerrou(cd, k); return; }
  const C = carteCourante();
  const cible = carte(cd.vers.carte);
  const minutes = cd.vers.temps ?? C.tempsParCase;
  attente(cible && cible.echelle === 'interieur' ? 'Tu entres…' : 'Tu ressors…', minutes, () => {
    // Plus de saut d'horloge ici : le temps coule en temps réel pendant l'attente
    // (boucle « battement du monde »), identique pour les deux joueurs en co-op.
    G.world.carte = cd.vers.carte;
    G.world.x = cd.vers.x; G.world.y = cd.vers.y;
    peuplerCarte(G.world.carte);
    assignerGaranties(G.world.carte);
    assignerEvenements(G.world.carte); // placés AVANT l'arrivée (sinon le 1er pas sur la carte n'aurait rien)
    decouvrirAutour(G.world.carte, G.world.x, G.world.y);
    if (!getFlag('visite_' + cd.vers.carte)) {
      setFlag('visite_' + cd.vers.carte);
      if (cible.journal !== false) noteJournal(`Première visite : ${cible.nom}.`);
    }
    if (cible.onEntree) { setFlag(cible.onEntree); }
    if (G.world.carte !== 'int_hotel' && !getFlag('sorti_hotel')) setFlag('sorti_hotel');
    save();
    // Les grands moments se découvrent à la caméra : la ville ravagée à la
    // première sortie, les quais et leur machine à la première visite.
    const suite = () => arrivee();
    if (G.world.carte === 'q_centre' && getFlag('sorti_hotel')) jouerCineUneFois('sortie_hotel', suite);
    else if (G.world.carte === 'int_gare') jouerCineUneFois('quais_gare', suite);
    else if (G.world.carte === 'int_hopital') jouerCineUneFois('hopital', suite);
    else if (G.world.carte === 'int_emperi') jouerCineUneFois('emperi', suite);
    else if (G.world.carte === 'int_refuge') jouerCineUneFois('refuge_miramas', suite);
    else suite();
  });
}

function arrivee() {
  const cd = caseCourante() || {};
  const k = keyCourante();
  // Grand moment « vue d'en haut » : la première fois au pied de la Tour de
  // l'Horloge, la caméra prend de la hauteur avant de rendre la main.
  if (cd.special === 'cloches' && !getFlag('cine_clocher')) {
    jouerCineUneFois('clocher', () => renderLieu());
    return;
  }
  // Rencontre tirée au sort : SEULEMENT aux échelles abstraites (ville, région).
  // Sur les cartes vivantes, les zombies sont visibles et le combat se joue au contact —
  // ce que tes yeux couvrent ne peut plus te sauter dessus par surprise.
  if (!carteVivante(G.world.carte)) {
    let p = (cd.danger || 0) * (estNuit() ? 1.45 : 1);
    if (estSecurisee(k)) p *= 0.15;
    if (getFlag('discretion_pluie')) { p *= 0.4; G.world.flags['discretion_pluie'] = false; }
    if (getFlag('discretion_cloches')) { p *= 0.35; G.world.flags['discretion_cloches'] = false; }
    if (chance(p)) {
      const pool = zombiesPoolCourant();
      const ids = [pick(pool)];
      if ((cd.danger || 0) >= 0.45 && chance(0.35)) ids.push(pick(pool));
      log(`${cd.nom || 'Ici'} : quelque chose t'a repéré.`, 'bad');
      demarrerCombat(ids, { onFin: () => renderLieu() });
      return;
    }
  }
  // Événement ? — désormais PRÉ-PLACÉ (mêmes lieux pour les deux joueurs en co-op).
  // On ne tire PLUS un événement au hasard à chaque pas : ça divergeait d'une machine
  // à l'autre (l'un « tombait sur le fil de fer », pas l'autre). Chaque case piégée a
  // reçu SON événement à la 1re visite de la carte (assignerEvenements, graine partagée).
  // On le déclenche une fois de mon côté quand j'y mets le pied ; mon coéquipier le
  // déclenchera lui aussi au même endroit (la consigne « événements communs »).
  const evId = evenementPlaceCourant(k);
  if (evId) {
    const ev = EVENTS.find(e => e.id === evId);
    if (ev && evenementJouable(ev)) {
      G.world.eventsFaits[k] = true; // consommé de MON côté QUAND il se déclenche (non diffusé : chacun le vit une fois)
      jouerEvent(ev);
      return;
    }
    // pas jouable ici/maintenant (déjà vu, mauvaise heure, condition non remplie) :
    // on le LAISSE en place — il pourra se déclencher plus tard, au bon moment.
  }
  renderLieu();
}

// Événement pré-placé sur la case courante, non encore déclenché de mon côté (ou null).
function evenementPlaceCourant(k) {
  if (G.world.eventsFaits && G.world.eventsFaits[k]) return null;
  const a = G.world.eventsPlaces && G.world.eventsPlaces[G.world.carte];
  return (a && a[`${G.world.x},${G.world.y}`]) || null;
}
// Un événement pré-placé est-il jouable ICI, MAINTENANT ? (filtres dynamiques revérifiés
// au déclenchement, comme l'ancien tirage : once déjà vu, nuit/jour, condition de flag/item.)
function evenementJouable(ev) {
  if (ev.once && G.world.eventsVus.includes(ev.id)) return false;
  if (ev.nuit === true && !estNuit()) return false;
  if (ev.nuit === false && estNuit()) return false;
  if (ev.condition) {
    if (ev.condition.flag && !getFlag(ev.condition.flag)) return false;
    if (ev.condition.flagAbsent && getFlag(ev.condition.flagAbsent)) return false;
    if (ev.condition.item && !hasItem(ev.condition.item)) return false;
  }
  return true;
}

// ---------- Fouille : UNE action continue, le butin sort au fil de la barre ----------
// On fouille une case d'un seul trait : la barre se remplit, les objets se révèlent
// petit à petit (déposés AU SOL et listés dans l'overlay), et à 100 % la case est
// vidée. On peut s'arrêter quand on veut : ce qui a déjà été trouvé reste au sol, à
// ramasser. La progression (frac) est mémorisée — reprendre une fouille la continue.

function fouiller(aTatons = false) {
  const cd = caseCourante();
  if (!cd || !cd.fouille) return;
  const k = keyCourante();
  // L'accès est bloqué (grille, rideau, cadenas) : il faut d'abord ouvrir.
  if (cd.verrou && !G.world.verrous[k]) { ecranVerrou(cd, k); return; }
  const f = fouilleEtat(k);
  if (fouilleFinie(f, cd)) { toast('Tu as déjà tout retourné ici.'); return; }
  if (fouilleSession) return; // déjà une fouille en cours

  if (niveauSombre(cd) === 2 && !lumiereActive() && !aTatons) {
    const box = showEvt(`<div class="narration">Il fait noir là-dedans. Sans lumière allumée, tu ne verras rien venir — ni les objets, ni le reste.</div>
      <div class="actions">
        ${btnAct('data-tatons="1"', 'Fouiller à tâtons', 'tu trouveras moins, et ils te verront avant que tu les voies')}
        ${btnAct('data-renonce="1"', 'Renoncer', 'revenir avec une lampe allumée')}
      </div>`);
    box.querySelector('[data-tatons]').onclick = () => { closeEvt(); fouiller(true); };
    box.querySelector('[data-renonce]').onclick = () => closeEvt();
    return;
  }

  lancerFouilleContinue(aTatons, k, cd);
}

function fouilleFinie(f, cd) { return (f.frac || 0) >= 1 || f.n >= cd.fouille.max; }

// Le « programme » de découvertes d'une fouille COMPLÈTE : pour chaque objet de la table
// encore non pris, on décide une fois s'il sera trouvé, à quelle fraction de la barre il
// sortira. Déterministe côté DÉPOSITAIRE (un seul des deux dépose en co-op → pas de doublon).
function construireSchedule(cd, f, aTatons) {
  const niv = niveauSombre(cd);
  const malusPenombre = (niv === 1 && !lumiereActive()) ? 0.8 : 1;
  // Une fouille complète retrouve ~tout le trouvable ; tâtons/pénombre en laissent passer.
  const profondeur = 1.15 * (aTatons ? 0.55 : 1) * malusPenombre;
  const debut = f.frac || 0;
  const sched = [];
  for (const entry of (cd.fouille.table || [])) {
    const d = defItem(entry.id);
    if (!d) { console.warn('Loot inconnu :', entry.id); continue; }
    if (f.pris[entry.id]) continue;
    if (!chance(Math.min(0.96, entry.p * profondeur))) continue;
    const qty = rng(entry.q[0], entry.q[1]);
    const atFrac = debut + (1 - debut) * (0.12 + Math.random() * 0.83); // réparti sur le reste de la barre
    sched.push({ id: entry.id, qty, dur: d.dur ? d.dur : undefined, atFrac });
  }
  // Butin GARANTI affecté à CETTE case (lampe, clé…) : ajouté à coup sûr s'il n'a pas déjà
  // été trouvé, même à tâtons/dans le noir — c'est la promesse d'un objet indispensable.
  for (const g of garantiesCase(G.world.carte, G.world.x, G.world.y)) {
    if (f.pris[g.id] || sched.some(s => s.id === g.id)) continue;
    const d = defItem(g.id);
    if (!d) continue;
    const atFrac = debut + (1 - debut) * (0.25 + Math.random() * 0.55);
    sched.push({ id: g.id, qty: g.qty || 1, dur: d.dur ? d.dur : undefined, atFrac, garanti: true });
  }
  sched.sort((a, b) => a.atFrac - b.atFrac);
  return sched;
}

function lancerFouilleContinue(aTatons, k, cd) {
  const C = carteCourante();
  const f = fouilleEtat(k);
  const dureeBase = (REGLAGES.fouille.DUREE_MS[C.echelle] || 14000) * (aTatons ? REGLAGES.fouille.TATONS_MULT : 1);
  // Le DÉPOSITAIRE est seul à sortir les objets (anti-doublon en co-op) : l'hôte dès qu'il
  // fouille, sinon le fouilleur unique. L'invité qui aide l'hôte ne fait que VOIR sortir le butin.
  const coopAct = () => multi.estMulti() && fouillePairK === k && pairSurCase(k);
  const jeDepose = () => !multi.estMulti() || multi.estHote() || !coopAct();
  const schedule = construireSchedule(cd, f, aTatons); // chacun en a un : sert dès qu'on est dépositaire
  const revele = new Set();

  signalerFouille(k, 'debut');

  const ov = $('#fouille-progress');
  if (!ov) { // pas d'overlay (sécurité) : on retombe sur un dépôt immédiat
    schedule.forEach(e => { if (!f.pris[e.id]) { deposerAuSol(k, { id: e.id, qty: e.qty, dur: e.dur }); f.pris[e.id] = true; } });
    finaliserFouilleComplete(k, cd); signalerFouille(k, 'fin'); renderLieu(); if (solVisible(k).length) panneauTrouves();
    return;
  }
  const bar = ov.querySelector('.fouille-bar > i');
  const liste = $('#fouille-trouves');
  ov.querySelector('.fouille-label').textContent = aTatons ? 'Tu fouilles à tâtons…' : 'Tu fouilles…';
  if (liste) liste.innerHTML = '';
  ov.classList.remove('hidden');
  setChrono(true);

  let frac = f.frac || 0;
  let actif = true, timer = null, last = performance.now(), dernierProg = 0;
  if (bar) { bar.style.transition = 'width .15s linear'; bar.style.width = (frac * 100) + '%'; }

  const ligneTrouve = (label) => {
    if (!liste) return;
    const p = document.createElement('div'); p.className = 'ft-item'; p.textContent = '+ ' + label;
    liste.appendChild(p); liste.scrollTop = liste.scrollHeight;
  };
  const reveler = (e) => {
    revele.add(e.id);
    if (f.pris[e.id]) return; // déjà sorti (par le coéquipier) : on ne double pas
    deposerAuSol(k, { id: e.id, qty: e.qty, dur: e.dur });
    f.pris[e.id] = true;
    const d = defItem(e.id);
    const label = `${d ? d.nom : e.id}${e.qty > 1 ? ' ×' + e.qty : ''}`;
    ligneTrouve(label);
    sfx('loot');
    syncCaseMonde(k);
    if (multi.estMulti()) multi.diffuserEvenement({ e: 'fouille', k, etat: 'trouve', label });
  };

  const terminer = (complete, distant = false) => {
    if (!actif) return;
    actif = false;
    if (timer) clearInterval(timer);
    fouilleSession = null;
    ov.classList.add('hidden');
    setChrono(false);
    signalerFouille(k, 'fin');
    f.frac = complete ? 1 : Math.min(0.999, frac);
    // Endurance dépensée, proportionnelle à ce qu'on a fouillé cette fois (aider fatigue aussi).
    G.player.sta = Math.max(0, G.player.sta - Math.round(3 + 7 * frac));
    let combat = false;
    if (jeDepose()) {
      if (complete) combat = finaliserFouilleComplete(k, cd, distant);
      else { save(); syncCaseMonde(k); }
      if (complete && !distant && multi.estMulti()) multi.diffuserEvenement({ e: 'fouille', k, etat: 'complete' });
      // Le bruit de la fouille a pu attirer / réveiller : conséquences à la conclusion.
      if (complete && !distant) combat = consequencesFouille(k, cd, aTatons) || combat;
    } else {
      save();
    }
    if (combat) return; // le combat a pris la main (le butin déjà trouvé reste au sol)
    renderLieu();
    if (solVisible(k).length) panneauTrouves(); // s'arrêter = ramasser ce qu'on a trouvé
  };

  // Le coéquipier alimente CETTE fouille : objets qu'il sort, progression, fin.
  fouilleSession = {
    k,
    onTrouveDistant: (label) => { if (!jeDepose()) ligneTrouve(label); },
    onProgressDistant: (fr) => { if (!jeDepose() && fr > frac) { frac = fr; if (bar) bar.style.width = (frac * 100) + '%'; } },
    onCompleteDistant: () => terminer(true, true),
  };

  // Boucle pilotée par setInterval (et non requestAnimationFrame) : elle continue de
  // tourner même si l'onglet passe en arrière-plan (rAF, lui, se met en pause) — la
  // fouille avance alors correctement grâce au delta de temps réel mesuré.
  const tick = () => {
    if (!actif) return;
    const now = performance.now();
    const dt = now - last; last = now;
    const vit = (coopAct() ? REGLAGES.fouille.COOP_MULT : 1) / dureeBase;
    frac = Math.min(1, frac + dt * vit);
    if (bar) bar.style.width = (frac * 100) + '%';
    if (jeDepose()) {
      for (const e of schedule) if (!revele.has(e.id) && frac >= e.atFrac) reveler(e);
      if (multi.estMulti() && now - dernierProg > 550) { dernierProg = now; multi.diffuserEvenement({ e: 'fouille', k, etat: 'progress', frac }); }
    }
    if (frac >= 1) { terminer(true); return; }
  };
  timer = setInterval(tick, 120);

  const btnStop = ov.querySelector('.fouille-annuler');
  if (btnStop) btnStop.onclick = () => { if (actif) terminer(false); };
}

// Fin d'une fouille COMPLÈTE (dépositaire) : la case est vidée et marquée. Retourne
// false (le combat éventuel est géré à part, par consequencesFouille).
function finaliserFouilleComplete(k, cd, distant = false) {
  const f = fouilleEtat(k);
  f.n = cd.fouille.max; f.frac = 1;
  const reveles = revelerSol(k); // ce qui traînait caché (arme jetée en combat...) refait surface
  if (reveles) log('Tu remets la main sur ce qui était tombé là.', 'good');
  const C = carteCourante();
  if (C.echelle === 'interieur' && !estSecurisee(k)) {
    securiser(k);
    log(`${cd.nom || 'La pièce'} : fouillée de fond en comble, sécurisée.`, 'good');
    if (interieurSecurise(G.world.carte)) log(`${C.nom} : tout est fouillé. L'endroit est à toi.`, 'good');
  } else {
    log(`${cd.nom || 'La zone'} : il n'y a plus rien à fouiller ici.`, '');
  }
  save();
  syncCaseMonde(k);
  return false;
}

// Le bruit de la fouille à sa conclusion : sur carte vivante, on ameute les vrais morts
// (un tick les fait approcher) ; sur carte abstraite, risque d'embuscade. Le butin déjà
// trouvé est DÉJÀ au sol, donc un combat ne le fait plus perdre. Retourne true si combat.
function consequencesFouille(k, cd, aTatons) {
  if (carteVivante(G.world.carte)) {
    const portee = 4 + (aTatons ? 2 : 0) + (estNuit() ? 1 : 0);
    attirerZombies(G.world.carte, G.world.x, G.world.y, portee);
    const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
    const ev = tickZombies(G.world.carte, vis);
    if (ev.contact) { renderLieu(); lancerCombatContact(ev.contact); return true; }
  } else {
    let danger = (cd.danger ?? 0.2);
    if (estSecurisee(k)) danger *= 0.15;
    if (aTatons) danger *= 1.6;
    if (estNuit()) danger *= 1.3;
    if (chance(danger)) {
      log(`En fouillant ${(cd.nom || 'la zone').toLowerCase()}, tu n'étais pas seul. Tu te retournes d'un bloc.`, 'bad');
      demarrerCombat([pick(zombiesPoolCourant())], { surprise: aTatons, onFin: () => renderLieu() });
      return true;
    }
  }
  return false;
}

// ---------- Puiser : remplir bouteilles et contenants à une source d'eau ----------
// Sources reconnues : la case spéciale 'fontaine' (la Fontaine Moussue !), la
// citerne SNCF du triage (lbl 'CITERNE'), ou la berge d'une case de terrain 'eau'
// adjacente (canal, lavoir...). L'eau puisée est toujours CROUPIE : à bouillir.
function accesEau(cd) {
  if (!cd) return false;
  if (cd.special === 'fontaine') return true;
  if (cd.lbl === 'CITERNE') return true; // le château d'eau du triage (chapitre 2)
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = caseDef(G.world.carte, G.world.x + dx, G.world.y + dy);
    if (n && n.t === 'eau') return true;
  }
  return false;
}
// A-t-on quelque chose à remplir ? (bouteille vide, ou un contenant pas plein)
function aDeQuoiPuiser() {
  if (hasItem('bouteille_vide')) return true;
  const libre = (e) => estContenant(e.id) && (e.eau ? e.eau.L : 0) < contenance(e.id);
  if (G.player.inventaire.some(libre)) return true;
  const main = G.player.equip.arme;
  return !!(main && libre(main));
}
// Remplit un contenant (instance) de `litres` d'eau croupie, capacité respectée.
// Verser de la croupie sur de la bouillie gâche tout : le mélange est croupi.
function remplirCroupie(ref, litres) {
  if (!ref) return;
  const avant = ref.eau ? ref.eau.L : 0;
  const gache = !!(ref.eau && ref.eau.L > 0 && ref.eau.q === 'bouillie');
  ref.eau = { q: 'croupie', L: Math.round(Math.min(contenance(ref.id), avant + litres) * 100) / 100 };
  const d = defItem(ref.id);
  log(`${d ? d.nom : 'Contenant'} : ${descEau(ref)}.${gache ? ' L\'eau bouillie est gâchée — tout est croupi.' : ''}`, gache ? 'warn' : 'good');
}

function panneauPuiser() {
  let html = `<div class="panel-head"><h2>Puiser de l'eau</h2><button class="panel-close">×</button></div>
    <p class="cap-line">L'eau sent la mousse et le calcaire — croupie. À faire bouillir, sauf envie de mourir plié en deux. L'eau pèse : 1 L = 1 kg.</p>
    <div class="item-list">`;
  // Le circuit historique : la bouteille vide devient une bouteille d'eau croupie.
  const nB = countItem('bouteille_vide');
  if (nB) {
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">Bouteille vide${nB > 1 ? ` <span class="qty">×${nB}</span>` : ''}</span><span class="item-meta">5 min</span></div>
      <div class="item-btns"><button data-pu="bouteille">Remplir une bouteille</button></div></div>`;
  }
  // Le contenant tenu en main (canette, casserole... déjà sorties)
  const main = G.player.equip.arme;
  if (main && estContenant(main.id)) {
    const d = defItem(main.id);
    const plein = (main.eau ? main.eau.L : 0) >= contenance(main.id);
    html += `<div class="item-card equipped">
      <div class="item-line"><span class="item-nom">${d.nom} (en main)</span>
      <span class="item-meta">${main.eau ? descEau(main) : `vide — ${fmtL(contenance(main.id))} L`}</span></div>
      <div class="item-btns">${plein ? '<button disabled>Plein</button>' : '<button data-pu="main">Remplir (5 min)</button>'}</div></div>`;
  }
  // Les contenants du sac : les fermés se remplissent sur place, les ouverts
  // (canette, casserole) se remplissent EN MAIN — pleins, ils ne vont pas au sac.
  G.player.inventaire.forEach((it, i) => {
    if (!estContenant(it.id)) return;
    // La bouteille vide est désormais un contenant fermable (pour pouvoir transvaser
    // dedans), mais à la source elle garde sa carte dédiée ci-dessus (→ eau croupie) :
    // on évite ainsi de la lister deux fois.
    if (it.id === 'bouteille_vide' && !it.eau) return;
    const d = defItem(it.id);
    const plein = (it.eau ? it.eau.L : 0) >= contenance(it.id);
    let btns;
    if (plein) btns = '<button disabled>Plein</button>';
    else if (recipientOuvert(it.id)) btns = `<button data-pu="prendre:${i}">Remplir et tenir en main (5 min)</button>`;
    else if (it.id === 'bidon_vide') btns = `<button data-pu="inv:${i}:1">+1 L (3 min)</button><button data-pu="inv:${i}:plein">À ras bord (15 min)</button>`;
    else btns = `<button data-pu="inv:${i}:plein">Remplir (5 min)</button>`;
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${it.qty > 1 ? ` <span class="qty">×${it.qty}</span>` : ''}</span>
      <span class="item-meta">${it.eau ? descEau(it) : `vide — ${fmtL(contenance(it.id))} L`}</span></div>
      <div class="item-btns">${btns}</div></div>`;
  });
  html += `</div>`;
  if (!aDeQuoiPuiser()) html += `<p class="cap-line">Rien à remplir : trouve une bouteille vide, une gourde, un bidon — ou même une canette.</p>`;
  const box = showPanel(html);

  const puiser = (minutes, action) => {
    attente('Tu puises l\'eau…', minutes, () => {
      action();
      sfx('eau_verse');
      save();
      renderLieu();
      panneauPuiser(); // on peut enchaîner les remplissages
    });
  };
  box.querySelectorAll('[data-pu]').forEach(b => {
    b.onclick = () => {
      sfx('clic');
      const [mode, a, dose] = b.dataset.pu.split(':');
      if (mode === 'bouteille') {
        if (!removeItem('bouteille_vide', 1)) { toast('Plus de bouteille vide.'); return; }
        puiser(5, () => {
          addItem('eau_croupie', 1);
          log('Tu remplis la bouteille. L\'eau est trouble, avec des choses qui flottent. À bouillir.', 'good');
        });
      } else if (mode === 'main') {
        puiser(5, () => remplirCroupie(G.player.equip.arme, Infinity));
      } else if (mode === 'prendre') {
        const i = parseInt(a, 10);
        puiser(5, () => {
          const r = tenirRecipient(i);
          if (!r.ok) return;
          if (r.renverse) log(`${r.renverse} : l'eau se renverse pendant la manœuvre.`, 'warn');
          remplirCroupie(G.player.equip.arme, Infinity);
        });
      } else { // 'inv' : un contenant fermé, rempli sur place dans le sac
        const i = parseInt(a, 10);
        puiser(dose === '1' ? 3 : (G.player.inventaire[i] && G.player.inventaire[i].id === 'bidon_vide' ? 15 : 5),
          () => remplirCroupie(instancePourEau(i), dose === '1' ? 1 : Infinity));
      }
    };
  });
  return box;
}

// ---------- Objets au sol : ramassage à la main ----------
// Garde-fou : si la fouille a empilé des récipients vides sur un récipient PLEIN
// posé là (même id), on re-sépare — l'eau n'appartient qu'à UNE instance.
function normaliserSol(k) {
  const tout = solDe(k);
  for (let i = tout.length - 1; i >= 0; i--) {
    const e = tout[i];
    if (e.eau && (e.qty || 1) > 1) {
      tout.push({ id: e.id, qty: e.qty - 1, cache: e.cache });
      e.qty = 1;
    }
  }
}

function panneauTrouves() {
  const k = keyCourante();
  normaliserSol(k);
  const sol = solVisible(k);
  const pt = poidsTotal(), pm = poidsMax();
  const poidsClasse = surcharge() ? 'over' : enSurpoids() ? 'warn' : '';
  let html = `<div class="panel-head"><h2>Au sol</h2><button class="panel-close">×</button></div>
    <p class="cap-line">Poids : <b class="${poidsClasse}">${pt.toFixed(1)} / ${pm} kg</b>${enSurpoids() ? ` <small>(en surpoids, plafond ${poidsPlafond()})</small>` : ''} — Espace : <b>${espaceUtilise()} / ${espaceMax()}</b></p>
    <div class="item-list">`;
  if (!sol.length) html += `<p class="cap-line">Plus rien à ramasser ici. Fouille pour dénicher davantage.</p>`;
  sol.forEach((e, i) => {
    const d = defItem(e.id);
    if (!d) return;
    // un récipient OUVERT plein ne va pas dans le sac : il se prend EN MAIN
    const enMain = e.eau && recipientOuvert(e.id);
    // un vêtement / sac / ceinture : on peut l'ENFILER directement, même trop grand pour le sac
    const portable = !!cloth(e.id) && !e.eau;
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${(e.qty || 1) > 1 ? ` <span class="qty">×${e.qty}</span>` : ''}</span>
      <span class="item-meta">${e.eau ? descEau(e) + ' · ' : ''}${((d.poids || 0) + (e.eau ? e.eau.L : 0)).toFixed(1)} kg · ${d.espace || 0} esp.</span></div>
      <div class="item-desc">${d.desc}</div>
      <div class="item-btns">
        ${portable ? `<button data-porter="${i}">Porter</button>` : ''}
        ${enMain
          ? `<button data-tenir="${i}">Prendre en main</button>`
          : `<button data-prendre="${i}">Prendre${(e.qty || 1) > 1 ? ' (1)' : ''}</button>
            ${(e.qty || 1) > 1 ? `<button data-prendre-tout="${i}">Tout (×${e.qty})</button>` : ''}`}
      </div></div>`;
  });
  html += `</div>`;
  if (sol.length > 1) {
    html += `<div class="actions" style="margin-top:10px">${btnAct('data-rafler="1"', 'Tout rafler', 'prend tout ce qui rentre dans le sac')}</div>`;
  }
  const box = showPanel(html);

  const prendreUn = (e) => {
    if (e.dur !== undefined || e.eau || e.on !== undefined || e.usure) { // instance unique (arme usée, contenant plein, lampe entamée)
      if (!placePour(e.id, 1)) return false;
      G.player.inventaire.push({ id: e.id, qty: 1, dur: e.dur, eau: e.eau, on: e.on, usure: e.usure });
      return true;
    }
    return addItem(e.id, 1);
  };
  const prendre = (i, n) => {
    const tout = solDe(k);
    const e = sol[i];
    if (!e) return;
    let pris = 0;
    for (let c = 0; c < Math.min(n, e.qty || 1); c++) {
      if (!prendreUn(e)) break;
      pris++;
    }
    if (!pris) { toast('Pas de place (ou trop d\'encombrement) : fais du tri.'); return; }
    e.qty -= pris;
    if (e.qty <= 0) tout.splice(tout.indexOf(e), 1);
    sfx('loot');
    updateHUD();
    save();
    syncCaseMonde(k);
    if (solVisible(k).length) panneauTrouves();
    else { closePanel(); renderLieu(); }
  };
  box.querySelectorAll('[data-prendre]').forEach(b => b.onclick = () => prendre(parseInt(b.dataset.prendre, 10), 1));
  box.querySelectorAll('[data-prendre-tout]').forEach(b => b.onclick = () => prendre(parseInt(b.dataset.prendreTout, 10), 999));
  // Enfiler directement un vêtement / sac / ceinture posé au sol (sans passer par
  // l'espace du sac). On retire UNE unité du sol, on l'équipe, et l'ancien + le
  // débordement éventuel retombent au sol.
  box.querySelectorAll('[data-porter]').forEach(b => b.onclick = () => {
    const tout = solDe(k);
    const e = sol[parseInt(b.dataset.porter, 10)];
    if (!e) return;
    const entry = { id: e.id };
    e.qty = (e.qty || 1) - 1;
    if (e.qty <= 0) tout.splice(tout.indexOf(e), 1);
    const r = equiperDepuisSol(entry);
    if (!r.ok) { addItem(e.id, 1); toast('Impossible d\'enfiler ça.'); return; }
    sfx('clic');
    const d = defItem(entry.id);
    log(`Tu enfiles ${d ? d.nom.toLowerCase() : 'l\'équipement'}.${r.auSol.length ? ` Ce qui ne rentre plus tombe au sol — ${libelleJetes(r.auSol)}.` : ''}`, r.auSol.length ? 'warn' : 'good');
    updateHUD();
    save();
    syncCaseMonde(k);
    renderLieu();
    if (solVisible(k).length) panneauTrouves();
    else closePanel();
  });
  // Récipient ouvert plein : il se prend en main (ce qu'on tenait retourne au sac)
  box.querySelectorAll('[data-tenir]').forEach(b => b.onclick = () => {
    const tout = solDe(k);
    const e = sol[parseInt(b.dataset.tenir, 10)];
    if (!e) return;
    tout.splice(tout.indexOf(e), 1);
    const r = prendreEnMain(e);
    if (r.renverse) {
      sfx('eau_verse');
      log(`${r.renverse} : l'eau se renverse pendant l'échange. Le récipient vide retourne dans le sac.`, 'warn');
    }
    sfx('loot');
    updateHUD();
    save();
    syncCaseMonde(k);
    if (solVisible(k).length) panneauTrouves();
    else { closePanel(); renderLieu(); }
  });
  const raf = box.querySelector('[data-rafler]');
  if (raf) raf.onclick = () => {
    const tout = solDe(k);
    let pris = 0;
    for (let i = tout.length - 1; i >= 0; i--) {
      const e = tout[i];
      if (e.cache) continue;
      if (e.eau && recipientOuvert(e.id)) continue; // se prend en main, pas dans le sac
      while ((e.qty || 1) > 0 && prendreUn(e)) { e.qty--; pris++; if (e.dur !== undefined) break; }
      if (e.qty <= 0) tout.splice(i, 1);
    }
    if (pris) { sfx('loot'); log(`Ramassé : ${pris} objet${pris > 1 ? 's' : ''}.`, 'good'); }
    if (solVisible(k).length) toast('Le reste ne rentre pas : fais du tri.');
    updateHUD();
    save();
    syncCaseMonde(k);
    if (solVisible(k).length) panneauTrouves();
    else { closePanel(); renderLieu(); }
  };
}

// ---------- Verrous ----------
function optionsVerrou(verrou) {
  let html = `<div class="actions">`;
  verrou.options.forEach((o, i) => {
    let ok = true, req = '';
    if (o.methode === 'outil') { ok = hasItem(o.outil) || (G.player.equip.arme && G.player.equip.arme.id === o.outil); req = item(o.outil).nom; }
    if (o.methode === 'skill') { ok = skillLevel(o.skill) >= o.niveau; req = `${o.skill} ${o.niveau}`; }
    if (o.methode === 'item') { ok = hasItem(o.item); req = item(o.item).nom; }
    if (o.methode === 'skillItem') { ok = skillLevel(o.skill) >= o.niveau && hasItem(o.item); req = `${o.skill} ${o.niveau} + ${item(o.item).nom}`; }
    html += btnAct(`data-vopt="${i}"`, o.label, ok ? `${o.tempsMin} min` : `<span class="req">Requiert : ${req}</span>`, { disabled: !ok });
  });
  html += btnAct('data-vannule="1"', 'Renoncer pour l\'instant');
  html += `</div>`;
  return html;
}

function ecranVerrou(cd, k) {
  const box = showEvt(`<h2 class="lieu-nom">${cd.versNom || cd.nom}</h2>
    <div class="narration">${cd.verrou.desc}</div>
    ${optionsVerrou(cd.verrou)}`);
  box.querySelectorAll('[data-vopt]').forEach(b => {
    b.onclick = () => {
      const o = cd.verrou.options[parseInt(b.dataset.vopt, 10)];
      closeEvt();
      attente(`${o.label}…`, o.tempsMin || 5, () => {
        if (o.methode === 'skill' || o.methode === 'skillItem') {
          const up = gainSkill(o.skill, 10);
          if (up) log(`Compétence ${o.skill} : niveau ${up.niveau} !`, 'good');
        }
        if (o.risque && chance(o.risque.p)) {
          log(o.risque.texte, 'bad');
          // Forcer un accès blesse les mains et les bras, sauf zones précisées par la donnée
          const bl = typeof o.risque.blessure === 'string'
            ? { type: o.risque.blessure, zones: o.risque.zones || ['à la main', 'à l\'avant-bras'] }
            : o.risque.blessure;
          appliquerEffets({ blessure: bl });
          if (G.player.pv <= 0) return;
        }
        sfx('porte');
        G.world.verrous[k] = true;
        if (cd.verrou.flag) setFlag(cd.verrou.flag);
        log(`${cd.versNom || cd.nom} : accès ouvert.`, 'good');
        save();
        renderLieu();
      });
    };
  });
  box.querySelector('[data-vannule]').onclick = () => closeEvt();
}

// ---------- Actions spéciales ----------
function tuileSpeciale(cd, k) {
  const sp = cd.special;
  const t = (icone, nom, sub, ok = true) =>
    tuile(`data-special="${sp}"`, icone, nom, ok ? sub : `<span class="req">${sub}</span>`, { disabled: !ok });
  switch (sp) {
    case 'fontaine':
      return t('soif', 'Puiser de l\'eau', aDeQuoiPuiser() ? 'eau douteuse, à bouillir' : 'requiert : un contenant ou une bouteille vide', aDeQuoiPuiser());
    case 'peche':
      return t('soif', 'Pêcher (1 h)', hasItem('canne_peche') ? (hasItem('appat') ? 'avec appâts' : 'sans appâts') : 'requiert : canne à pêche', hasItem('canne_peche'));
    case 'chasse': {
      const v = fouilleEtat(k);
      if (!v.colletPose) return t('fouille', 'Poser un collet', hasItem('collet') ? 'revenir dans 6 h' : 'requiert : un collet', hasItem('collet'));
      const h = Math.floor((G.world.statsTemps - v.colletPose) / 60);
      return t('fouille', 'Relever le collet', `posé il y a ${h} h${h < 6 ? ' (tôt)' : ''}`);
    }
    case 'siphon': {
      const ok = hasItem('tuyau_plastique') && hasItem('bidon_vide');
      return t('soif', 'Siphonner du gasoil', ok ? 'bruyant — 20 min' : 'requiert : tuyau + bidon vide', ok);
    }
    case 'cloches':
      return getFlag('cloches_sonnees') ? '' : t('options', 'Sonner les cloches', 'attirer la horde AILLEURS — une seule fois');
    case 'cellules':
      return getFlag('cellules_vues') ? '' : t('verrou', 'Couloir des cellules', 'quelque chose y vit encore');
    case 'conducteur':
      return getFlag('conducteur_fouille') ? '' : t('corps', 'Le corps du cheminot', 'il a peut-être la clé');
    case 'batterie': {
      if (getFlag('batterie_a_la_gare')) return '';
      const ok = getFlag('gare_ouverte') && G.player.sta >= 50;
      let sub = 'trajet épuisant et risqué';
      if (!getFlag('gare_ouverte')) sub = 'ouvre d\'abord la gare';
      else if (G.player.sta < 50) sub = 'repose-toi d\'abord (endurance)';
      return t('poids', 'Porter la batterie (14 kg)', sub, ok);
    }
    case 'locomotive':
      return tuile(`data-special="locomotive"`, 'monter', 'La locomotive', 'monter en cabine', { classe: 'tile-quete' });
  }
  return '';
}

function actionSpeciale(sp) {
  const cd = caseCourante();
  const k = keyCourante();
  switch (sp) {
    case 'fontaine': panneauPuiser(); break;
    case 'peche': {
      if (!hasItem('canne_peche')) { toast('Il te faut une canne à pêche.'); renderLieu(); break; }
      if (!placePour('poisson_cru', 2)) { toast('Fais de la place dans ton sac avant de pêcher.'); renderLieu(); break; }
      attente('Tu pêches, l\'œil sur le fil…', 60, () => {
        const bonus = hasItem('appat') ? 0.2 : 0;
        if (bonus) removeItem('appat', 1);
        if (jetReussi({ skill: 'chasse', base: 0.35 + bonus, parNiveau: 0.15 })) {
          const n = rng(1, 2);
          addItem('poisson_cru', n);
          log(`Ça mord ! ${n > 1 ? n + ' poissons' : 'Un poisson'} remonte${n > 1 ? 'nt' : ''} du canal.`, 'good');
          const up = gainSkill('chasse', 12);
          if (up) log(`Pêche/Chasse : niveau ${up.niveau} !`, 'good');
        } else {
          log('Une heure à fixer le fil. Rien. Le canal de Craponne garde ses carpes.', 'warn');
          gainSkill('chasse', 4);
        }
        save(); renderLieu();
      });
      break;
    }
    case 'chasse': {
      const v = fouilleEtat(k);
      if (!v.colletPose) {
        if (!removeItem('collet', 1)) { toast('Il te faut un collet.'); renderLieu(); break; }
        attente('Tu poses le collet…', 15, () => {
          v.colletPose = G.world.statsTemps;
          log('Tu dissimules le collet sur une coulée fraîche. Reviens dans quelques heures.', 'good');
          gainSkill('chasse', 6);
          save(); renderLieu();
        });
      } else {
        if (espaceUtilise() + 2 > espaceMax()) { toast('Fais de la place avant de relever le collet.'); renderLieu(); break; }
        attente('Tu relèves le collet…', 5, () => {
          const heures = (G.world.statsTemps - v.colletPose) / 60;
          v.colletPose = null;
          if (heures < 6) {
            addItem('collet', 1);
            log('Le collet est vide — trop tôt. Tu le récupères.', 'warn');
          } else if (chance(0.65)) {
            addItem('viande_crue', 1); addItem('collet', 1);
            log('Un lièvre s\'est pris dans le nœud. De la viande fraîche — à cuire.', 'good');
            const up = gainSkill('chasse', 14);
            if (up) log(`Pêche/Chasse : niveau ${up.niveau} !`, 'good');
          } else if (chance(0.6)) {
            addItem('collet', 1);
            log('Le collet a été déclenché... et vidé. Quelque chose est passé avant toi.', 'warn');
          } else {
            log('Le collet a disparu, arraché. Tu préfères ne pas savoir par quoi.', 'bad');
          }
          save(); renderLieu();
        });
      }
      break;
    }
    case 'siphon': {
      attente('Tu siphonnes le gasoil…', 20, () => {
        const continuer = () => {
          if (!hasItem('tuyau_plastique') || !hasItem('bidon_vide')) { toast('Il te faut un tuyau et un bidon vide.'); renderLieu(); return; }
          const libere = (defItem('bidon_vide').espace || 0);
          const requis = (defItem('bidon_gasoil').espace || 0);
          if (espaceUtilise() - libere + requis > espaceMax()) {
            log('Le bidon plein ne rentre pas dans ton inventaire. Fais de la place et reviens.', 'warn');
            renderLieu();
            return;
          }
          removeItem('bidon_vide', 1);
          addItem('bidon_gasoil', 1);
          log('Le gasoil monte dans le tuyau — tu en avales une gorgée au passage, immonde. Le bidon est plein.', 'good');
          const up = gainSkill('mecanique', 8);
          if (up) log(`Mécanique : niveau ${up.niveau} !`, 'good');
          noteJournal('Gasoil siphonné dans les carcasses.');
          save(); renderLieu();
        };
        if (chance(0.3)) {
          log('Le glouglou du carburant a couvert le raclement derrière toi.', 'bad');
          demarrerCombat([pick(zombiesPoolCourant())], { surprise: true, onFin: (res) => res === 'victoire' ? continuer() : renderLieu() });
        } else continuer();
      });
      break;
    }
    case 'cloches': {
      const box = showEvt(`<h2 class="lieu-nom">Les cloches de l'Horloge</h2>
        <div class="narration">Deux tonnes et demie de bronze au-dessus de ta tête. L'horloge, elle, est arrêtée — comme en 1909, après le séisme.\n\nSi tu sonnes, tout ce qui traîne dans Salon tournera la tête vers la tour. Et pendant qu'ils marcheront vers le bruit, les rues d'à côté se videront. Il faudra juste être loin quand ils arriveront.</div>
        <div class="actions">
          ${btnAct('data-sonne="1"', 'Sonner à la volée', 'les rues alentour seront plus calmes — la tour, beaucoup moins', { classe: 'primary' })}
          ${btnAct('data-non="1"', 'Laisser le bronze dormir')}
        </div>`);
      box.querySelector('[data-non]').onclick = () => closeEvt();
      box.querySelector('[data-sonne]').onclick = () => {
        closeEvt();
        setFlag('cloches_sonnees');
        setFlag('discretion_cloches');
        sfx('hurlement');
        log('Le bourdon frappe. Le son roule sur les toits de toute la ville. En contrebas, des dizaines de silhouettes pivotent, toutes dans la même direction : la tienne. Il est temps de ne plus être là.', 'warn');
        noteJournal('Les cloches de la Tour de l\'Horloge ont sonné pour la première fois depuis l\'effondrement.');
        save(); renderLieu();
      };
      break;
    }
    case 'cellules': ecranCellules(); break;
    case 'conducteur': ecranConducteur(); break;
    case 'batterie':
      if (!getFlag('gare_ouverte') || G.player.sta < 50) { toast('Pas en état pour ce portage.'); renderLieu(); break; }
      transporterBatterie();
      break;
    case 'locomotive': ecranLocomotive(); break;
  }
}

// ---------- Scènes spéciales : commissariat, gare ----------
function ecranCellules() {
  attente('Tu t\'enfonces dans le couloir…', 10, () => {
    const box = showEvt(`<h2 class="lieu-nom">Le couloir des cellules</h2>
      <div class="narration">Ta lumière accroche les barreaux un à un. Des cellules de garde à vue ouvertes, des traces de lutte. Dans la dernière, une silhouette en uniforme est assise contre le mur — un gardien, mort à son poste, les clés encore à la ceinture et un post-it dans sa pochette de poitrine.\n\nDans la cellule d'en face, <span class="gore">quelque chose se jette contre les barreaux</span>. Un détenu. Enfin, ça l'était. La moitié de son visage reste accrochée aux barreaux quand il recule pour charger à nouveau.</div>
      <div class="actions">
        ${btnAct('data-cell="finir"', 'L\'achever à travers les barreaux', 'sans risque, mais il faut le faire de près')}
        ${btnAct('data-cell="laisser"', 'Le laisser enfermé', 'il ne sortira jamais de là')}
      </div>`);
    const finir = () => {
      closeEvt();
      setFlag('cellules_vues');
      appliquerEffets({ items: [{ id: 'code_armurerie', qty: 1 }, { id: 'munitions_9mm', qty: 4 }, { id: 'bandage', qty: 1 }] });
      log('Sur le post-it du gardien : « ARM : 4471 ». Le code de l\'armurerie.', 'good');
      noteJournal('Code de l\'armurerie récupéré sur un gardien mort : 4471.');
      save(); renderLieu();
    };
    box.querySelector('[data-cell="finir"]').onclick = () => {
      sfx('coup_critique');
      log('Tu passes ta lame entre les barreaux et tu mets fin à la chose, calmement, méthodiquement. Le silence qui suit est presque pire.', '');
      gainSkill('dexterite', 5);
      G.player.morts++;
      finir();
    };
    box.querySelector('[data-cell="laisser"]').onclick = () => {
      log('Tu le laisses à sa cage. Ses coups contre les barreaux te suivront jusque dans la rue.', 'warn');
      finir();
    };
  });
}

function ecranConducteur() {
  attente('Tu fouilles le corps…', 5, () => {
    const loot = () => {
      setFlag('conducteur_fouille');
      appliquerEffets({ items: [{ id: 'cle_locomotive', qty: 1 }, { id: 'journal_conducteur', qty: 1 }] });
      log('La clé du locotracteur. Et son carnet : « Miramas-le-Vieux tient. Batterie HS — voir les garages de la Gandonne. Gasoil : siphonner les carcasses. »', 'good');
      noteJournal('Clé de la locomotive récupérée sur le cheminot.');
      save(); renderLieu();
    };
    if (chance(0.3)) {
      log('Au moment où ta main touche son gilet orange, ses yeux s\'ouvrent. Laiteux.', 'bad');
      demarrerCombat(['errant'], {
        surprise: true,
        onFin: (res) => {
          if (res === 'victoire') {
            log('Cette fois, il ne se relèvera plus. Tu fouilles ce qui reste de l\'uniforme.', '');
            loot();
          } else renderLieu();
        },
      });
      return;
    }
    log('Il est vraiment mort — la nuque, proprement. Quelqu\'un lui a évité le pire. Tu murmures un remerciement et tu fouilles son gilet.', '');
    loot();
  });
}

function transporterBatterie() {
  const box = showEvt(`<h2 class="lieu-nom">Le grand portage</h2>
    <div class="narration">Quatorze kilos de plomb et d'acide, à porter à bout de bras depuis la Gandonne jusqu'à la gare — le boulevard du Roy René, le passage sous la voie, les quais. Pas d'arme en main. Pas de fuite possible. Juste toi, la batterie, et la prière de ne croiser personne.\n\nTu cales la batterie contre ta poitrine et tu pousses la porte du garage.</div>
    <div class="actions">
      ${btnAct('data-bat="go"', 'Y aller — sans s\'arrêter', 'environ une heure de calvaire', { classe: 'primary' })}
      ${btnAct('data-bat="non"', 'Pas maintenant')}
    </div>`);
  box.querySelector('[data-bat="non"]').onclick = () => closeEvt();
  box.querySelector('[data-bat="go"]').onclick = () => {
    closeEvt();
    attente('Le grand portage…', 60, () => {
      G.player.sta = Math.max(5, G.player.sta - 45);
      const arriverGare = () => {
        setFlag('batterie_a_la_gare');
        G.world.carte = 'int_gare';
        const loco = Object.entries(carte('int_gare').cases).find(([, c]) => c.special === 'locomotive');
        if (loco) { const [x, y] = loco[0].split(',').map(Number); G.world.x = x; G.world.y = y; }
        decouvrirAutour(G.world.carte, G.world.x, G.world.y);
        gainSkill('force', 15);
        log('Les bras en feu, le dos brisé, tu hisses la batterie dans la cabine du locotracteur. C\'est fait.', 'good');
        noteJournal('Batterie transportée jusqu\'à la locomotive.');
        save(); renderLieu();
      };
      if (chance(0.55)) {
        log('À mi-chemin, un raclement profond derrière une carcasse. Tu poses la batterie — tu vas devoir te battre pour elle.', 'bad');
        demarrerCombat([pick(['coureur', 'errant', 'enrage'])], {
          fuitePossible: false,
          onFin: (res) => { if (res === 'victoire') { log('Tu reprends ton fardeau, le souffle court.', ''); arriverGare(); } else renderLieu(); },
        });
      } else {
        log('Tu traverses en apnée, plié sous le poids, chaque pas un pari. Personne ne t\'a vu. Miracle.', 'good');
        arriverGare();
      }
    });
  };
}

function ecranLocomotive() {
  const conditions = [
    { ok: getFlag('batterie_a_la_gare'), label: 'Batterie de poids lourd', hint: 'aux garages de la Gandonne — il faudra la porter' },
    { ok: hasItem('bidon_gasoil'), label: 'Bidon de gasoil', hint: 'à siphonner dans les carcasses (tuyau + bidon vide)' },
    { ok: hasItem('cle_locomotive'), label: 'Clé du locotracteur', hint: 'le cheminot, sur le quai, ne l\'emportera pas au paradis' },
    { ok: skillLevel('mecanique') >= 1 || hasItem('trousse_outils'), label: 'Savoir-faire mécanique', hint: 'compétence mécanique 1, ou une trousse à outils' },
  ];
  const pret = conditions.every(c => c.ok);
  render(`<div class="illu">${svgScene('gare')}</div>
    <h2 class="lieu-nom">Le locotracteur</h2>
    <div class="narration">Une vieille machine de manœuvre SNCF, orange délavé, garée sur la voie de service. La cabine sent le tabac froid. Tableau de bord mort : pas de batterie, réservoir à sec. Mais la mécanique a l'air saine. Elle peut rouler. Elle DOIT rouler — la voie file droit vers Miramas, à travers la plaine.</div>
    <div class="actions">
      <h3>Ce qu'il faut pour partir</h3>
      ${conditions.map(c => `<button class="act" disabled style="opacity:${c.ok ? 1 : 0.5}">${c.ok ? '✔' : '✘'} ${c.label}<small>${c.ok ? 'prêt' : c.hint}</small></button>`).join('')}
      ${pret ? btnAct('data-loco="1"', 'Raccorder la batterie, remplir le réservoir, tourner la clé', 'il n\'y aura pas de retour en arrière', { classe: 'primary' }) : ''}
      ${btnAct('data-retour="1"', 'Redescendre de la cabine')}
    </div>`);
  $('[data-retour]').onclick = () => renderLieu();
  const lo = $('[data-loco]');
  if (lo) lo.onclick = () => {
    removeItem('bidon_gasoil', 1); // la clé reste sur le contacteur
    noteJournal('La locomotive a démarré. Direction : Miramas-le-Vieux.');
    save();
    // Le grand départ en cinématique, PUIS la scène texte de la traversée.
    jouerCineUneFois('depart_train', () => jouerScene('loco_demarrage'));
  };
}

// ---------- Événements (fenêtre par-dessus la carte) ----------
// ---------- Événements PRÉ-PLACÉS (déterministes, partagés en co-op) ----------
// À la 1re visite d'une carte, on décide UNE fois pour toutes quelles cases « piégées »
// portent un événement et lequel — exactement comme le butin garanti (assignerGaranties).
// Tout suit la graine PARTAGÉE (G.world.seed + carte) : hôte et invité placent les MÊMES
// événements aux MÊMES endroits, sans se synchroniser. Chacun les déclenche ensuite une
// fois en passant dessus (eventsFaits, local). Les filtres dynamiques (nuit, once, flags)
// sont revérifiés au moment de jouer, pas au placement.
function assignerEvenements(carteId) {
  const c = CARTES[carteId];
  if (!c) return;
  if (!G.world.eventsPlaces) G.world.eventsPlaces = {};
  if (G.world.eventsPlaces[carteId]) return; // déjà dispatché
  // ---------- Mode ÉDITEUR : événements 100 % MANUELS ----------
  // Sur une carte `editeur:true`, on ne pioche PAS selon le danger : on ne pose que les
  // événements déposés à la main, case par case, via `cd.evEd = [{id, p}]` (p = chance 0..1).
  // Pour une case, on tente chaque spec dans l'ordre ; le premier qui « passe » est placé.
  if (c.editeur) {
    const rndE = seedRng((G.world.seed || 0) + ':eved:' + carteId);
    const assignE = {};
    for (const [pos, cd] of Object.entries(c.cases)) {
      if (!Array.isArray(cd.evEd) || !cd.evEd.length) continue;
      for (const spec of cd.evEd) {
        const p = spec.p == null ? 1 : spec.p;
        if (rndE() < p) { assignE[pos] = spec.id; break; }
      }
    }
    G.world.eventsPlaces[carteId] = assignE;
    return;
  }
  const typeDe = (cd) => {
    if (c.echelle === 'interieur') return 'interieur';
    if (cd.t === 'parc' || cd.t === 'nature') return 'parc';
    return 'rue';
  };
  const rnd = seedRng((G.world.seed || 0) + ':ev:' + carteId);
  const assign = {};
  for (const [pos, cd] of Object.entries(c.cases)) {
    const danger = cd.danger || 0;
    if (danger <= 0) continue;
    const type = typeDe(cd);
    const candidats = EVENTS.filter(ev =>
      (ev.types && ev.types.includes(type)) || (ev.lieux && ev.lieux.includes(carteId)));
    if (!candidats.length) continue;
    // Densité comparable à l'ancien tirage par pas, mais FIXÉE (un seul événement par case).
    if (rnd() >= Math.min(0.5, danger * 0.7)) continue;
    const total = candidats.reduce((s, e) => s + (e.p || 1), 0);
    let t = rnd() * total, choisi = candidats[candidats.length - 1];
    for (const e of candidats) { t -= (e.p || 1); if (t <= 0) { choisi = e; break; } }
    assign[pos] = choisi.id;
  }
  G.world.eventsPlaces[carteId] = assign;
}

function jouerEvent(ev) {
  if (ev.once) G.world.eventsVus.push(ev.id);
  renderLieu(); // la carte reste visible derrière la fenêtre
  let html = `<div class="narration">${ev.texte}</div><div class="actions">`;
  ev.choix.forEach((c, i) => {
    const ok = besoinRempli(c.besoin);
    html += btnAct(`data-evc="${i}"`, c.label, ok ? '' : `<span class="req">Requiert : ${besoinTexte(c.besoin)}</span>`, { disabled: !ok });
  });
  html += '</div>';
  const box = showEvt(html);
  updateHUD();
  box.querySelectorAll('[data-evc]').forEach(b => {
    b.onclick = () => {
      sfx('clic');
      const c = ev.choix[parseInt(b.dataset.evc, 10)];
      let branche;
      if (c.test) branche = jetReussi(c.test) ? c.reussite : c.echec;
      else branche = { texte: c.texte, effets: c.effets };
      resultatEvent(branche, c.label);
    };
  });
}

function resultatEvent(branche, action) {
  const appliquer = () => {
    const combatLance = appliquerEffets(branche.effets, () => renderLieu());
    if (G.player.pv <= 0) return; // mort pendant l'effet : ne pas écraser la sauvegarde
    save();
    if (!combatLance) renderLieu();
  };
  const continuer = () => {
    closeEvt();
    // Un choix qui coûte du temps se paie aussi en temps réel : petit spinner.
    // On affiche le NOM de l'action en cours (le libellé du choix), pas un « le temps passe » muet.
    if (branche.effets && branche.effets.tempsMin) {
      const lbl = action ? action.replace(/[.…]+$/, '') + '…' : 'Le temps passe…';
      attente(lbl, branche.effets.tempsMin, appliquer);
    } else appliquer();
  };
  if (!branche.texte) { continuer(); return; }
  const box = showEvt(`<div class="narration">${branche.texte}</div>
    <div class="actions">${btnAct('data-cont="1"', 'Continuer', '', { classe: 'primary' })}</div>`);
  box.querySelector('[data-cont]').onclick = () => { sfx('clic'); continuer(); };
}

// ---------- Sommeil ----------
function lieuSur() {
  const C = carteCourante();
  if (C.echelle !== 'interieur') return false;
  const cd = caseCourante();
  if (cd && cd.refuge) return true; // ta chambre d'hôtel du début
  return interieurSecurise(G.world.carte) || !!G.world.barricades[keyCourante()];
}
function sommeilInfo() {
  if (lieuSur()) return 'endroit sûr — sommeil réparateur';
  return 'lieu non sécurisé — sommeil risqué';
}

// Poignée de débogage console (sans effet en jeu normal) : omdAller('q_centre', 4, 3)
if (typeof window !== 'undefined') {
  window.omdAller = (carteId, x, y) => {
    G.world.carte = carteId; G.world.x = x; G.world.y = y;
    decouvrirAutour(carteId, x, y);
    renderLieu();
  };
}

// ---------- La vie qui rôde : boucle TEMPS RÉEL des zombies ----------
// Le monde respire même quand tu ne fais rien : sur les cartes vivantes, les
// zombies avancent à leur horloge (TICK_MS) — tu les vois ARRIVER. On ne tourne
// que quand l'écran carte est devant toi, hors marche, hors combat, hors modale,
// onglet visible ; sinon la nappe de tension retombe et on patiente.
let tensionCourante = -1;
function poserTension(t) {
  t = Math.round(Math.max(0, Math.min(1, t)) * 20) / 20;
  if (t === tensionCourante) return; // évite de réarmer la nappe à chaque tick
  tensionCourante = t;
  setTension(t);
}
// La scène vient d'être rebâtie (changement de carte ou bascule jour↔nuit) : playAmbiance
// a coupé net la musique d'action et relancé la musique du lieu. On oublie la dernière tension
// posée pour forcer la prochaine évaluation à re-pousser setTension — sinon un zombie resté à la
// même distance garderait le même palier et la musique d'action ne se ré-armerait jamais.
function reevaluerTension() { tensionCourante = -1; }

function modaleBloque() {
  if (enCombat() || cineEnCours() || panelOuvert() || evtOuvert()) return true;
  const att = $('#attente');
  if (att && !att.classList.contains('hidden')) return true;
  const fo = $('#fouille-progress'); // fouille continue en cours : le monde se fige aussi
  return !!(fo && !fo.classList.contains('hidden'));
}

// Tension musicale d'après le zombie le plus menaçant alentour.
function majTension(vis) {
  let t = 0;
  for (const z of zombiesSur(G.world.carte)) {
    if (z.faitLeMort) continue;
    if (z.spin) { t = 1; break; }
    const d = Math.abs(z.x - G.world.x) + Math.abs(z.y - G.world.y);
    if (d <= 7) {
      const vu = vis.has(`${z.x},${z.y}`);
      t = Math.max(t, (z.ag ? 1 : 0.55) * (1 - d / 9) * (vu ? 1 : 0.8));
    }
  }
  poserTension(t);
}

function tickTempsReel() {
  if (!G || !G.world || enMarche) return;
  if (multi.estMulti() && !multi.partieDemarree()) return; // co-op : pas avant le départ commun
  if (typeof document === 'undefined' || document.hidden) return;
  if (!carteVivante(G.world.carte) || !document.querySelector('.carte-grille') || modaleBloque()) {
    poserTension(0);
    return;
  }
  const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
  dernierTickZ = performance.now(); // les morts tiennent leur horloge, marche ou pas
  const ev = tickZombies(G.world.carte, vis);
  majTension(vis);
  if (ev.contact) { lancerCombatContact(ev.contact); return; }
  if (ev.portes.length) {
    sfx(ev.portes.some(p => p.cassee) ? 'porte_casse' : 'porte_coup');
    if (ev.portes.some(p => p.cassee)) log('Une porte cède sous les coups — le passage n\'est plus sûr. Reste sur tes gardes.', 'bad');
    else if (chance(0.45)) log('Des coups sourds contre une porte, tout près. Quelque chose veut entrer.', 'warn');
  }
  if (ev.spins.length) sfx('alerte_contact');
  else if (ev.bouges.size && chance(0.12)) sfx('zombie_loin');
  if (ev.bouges.size || ev.spins.length || ev.portes.length) rafraichirCarteSeule();
}

if (typeof window !== 'undefined') {
  setInterval(tickTempsReel, TICK_MS);
  // L'onglet revient au premier plan : on resynchronise la grille d'un coup.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && G && G.world && carteVivante(G.world.carte)
      && document.querySelector('.carte-grille') && !modaleBloque() && !enMarche) {
      rafraichirCarteSeule();
    }
  });
}

// ---------- Le battement du monde : le temps s'écoule en TEMPS RÉEL ----------
// 1 minute de jeu par seconde réelle (12 min réelles = une demi-journée). En solo
// et chez l'HÔTE, ce battement fait avancer l'horloge ; l'INVITÉ n'avance pas sa
// propre horloge (il adopte celle de l'hôte via onHeure) mais applique sa survie.
// Plus aucun saut de temps « par action » : le temps passe parce qu'il passe.
const BATTEMENT_MS = REGLAGES.temps.BATTEMENT_MS;
let prevNuit = null;
let battementsDepuisSave = 0;
function enJeu() {
  const tb = $('#topbar');
  return !!(G && G.world && tb && !tb.classList.contains('hidden'));
}
function mondeActif() {
  if (typeof document === 'undefined' || document.hidden) return false;
  if (!enJeu()) return false;
  if (enCombat() || cineEnCours()) return false; // combat tour par tour / cinématique : le temps se fige
  if (multi.estMulti() && !multi.partieDemarree()) return false; // co-op : horloge gelée jusqu'au départ commun
  return true;
}
// La bascule jour↔nuit doit rafraîchir l'ambiance et l'ombrage de la carte.
function verifierBasculeNuit() {
  const nuit = estNuit();
  if (nuit === prevNuit) return;
  const etaitConnu = prevNuit !== null;
  prevNuit = nuit;
  if (etaitConnu && document.querySelector('.carte-grille') && !modaleBloque() && !enMarche) renderLieu();
}
function battementMonde() {
  if (!mondeActif()) return;
  const invite = multi.estInvite();
  const r = advanceTime(1, invite ? { sansHorloge: true } : {});
  r.messages.forEach(m => log(m.t, m.c));
  verifierBasculeNuit();
  updateHUD();
  majIndicateurLumiere(); // les piles s'usent en continu : on le voit à l'écran sans agir
  if (r.mort) return; // l'écran de mort (omd-mort) prend le relais
  if (multi.estHote()) multi.diffuserHeure(); // l'hôte fait foi et diffuse l'heure
  if (++battementsDepuisSave >= 20) { battementsDepuisSave = 0; save(); }
}
if (typeof window !== 'undefined') setInterval(battementMonde, BATTEMENT_MS);

// Effectue réellement le sommeil (effets, réveil, éventuelle attaque). Durée fixe
// à l'écran (c'est un saut de temps, pas un geste). En co-op, l'invité applique la
// survie sans avancer l'horloge — l'hôte fait foi et diffuse le nouveau « Jour J ».
function executerSommeil(h) {
  closePanel();
  const sur = lieuSur();
  const piege = hasItem('piege_sonore');
  // Un mort ne surgit en plein sommeil QUE s'il en rôdait déjà un dans le bâtiment :
  // pas de pop magique. Lieu sécurisé / désert = nuit tranquille.
  const carteId = G.world.carte;
  const rodeurs = carteVivante(carteId) ? zombiesSur(carteId).filter(z => !z.faitLeMort) : [];
  attente('Vous dormez…', 0, () => {
    const r = dormir(h, sur, piege, multi.estInvite(), rodeurs.length > 0);
    r.messages.forEach(m => log(m.t, m.c));
    if (G.player.pv <= 0) return;
    save();
    if (r.attaque && rodeurs.length) {
      // c'est l'un des morts qui traînaient ici qui a fini par pousser ta porte — on le
      // RETIRE de la carte (il ne se dédouble pas) plutôt que d'en inventer un de toutes pièces.
      const encore = zombiesSur(carteId).filter(z => !z.faitLeMort);
      const z = (encore.length ? encore : rodeurs)[Math.floor(Math.random() * (encore.length || rodeurs.length))];
      const pos = { x: z.x, y: z.y }; // pour y laisser le cadavre, comme un combat de contact
      retirerZombie(carteId, z);
      if (piege) log('Le piège sonore a claqué dans le noir : tu es debout, arme en main, avant que la chose ne t\'atteigne.', 'good');
      demarrerCombat([z.id], { surprise: !piege, onFin: (res) => { if (res === 'victoire') ajouterMort(carteId, pos.x, pos.y); renderLieu(); } });
    } else {
      renderLieu();
    }
  }, { ms: 2600, noCancel: multi.estMulti() }); // en co-op on ne peut pas annuler (ça désyncerait)
}

function panneauSommeil() {
  const sur = lieuSur();
  const piege = hasItem('piege_sonore');
  const jusquauMatin = G.world.heure >= 19 || G.world.heure < 7
    ? (G.world.heure >= 19 ? (24 - G.world.heure) + 7 : 7 - G.world.heure)
    : null;
  // En co-op, on ne dort qu'à DEUX : chacun propose une durée, et le sommeil ne
  // s'enclenche (pour tout le monde, durée la plus courte) que lorsque les deux
  // sont prêts. Tant qu'on attend l'autre, le panneau affiche l'état d'attente.
  const coop = multi.estMulti() && multi.pairPresent();
  const enAttente = coop && multi.dodoEtat().moi != null;
  const lib = (base) => coop ? base.replace('Faire', 'Proposer').replace('Dormir', 'Proposer de dormir') : base;
  const box = showPanel(`
    <div class="panel-head"><h2>Dormir</h2><button class="panel-close">×</button></div>
    <p class="cap-line">${sommeilInfo()}.${!sur && piege ? ' Ton piège sonore montera la garde.' : ''}${coop ? '<br><b>Co-op :</b> vous dormez en même temps — propose une durée, ton coéquipier doit la rejoindre (on dort de la plus courte des deux).' : ''}</p>
    <div class="actions">
      ${enAttente
        ? `<p class="cap-line">En attente que ton coéquipier dorme aussi…</p>${btnAct('data-dodo-annule="1"', 'Annuler')}`
        : `${btnAct('data-sieste="3"', lib('Faire une sieste (3 h)'))}
           ${jusquauMatin ? btnAct(`data-sieste="${jusquauMatin}"`, lib(`Dormir jusqu'au matin (${jusquauMatin} h)`)) : btnAct('data-sieste="8"', lib('Dormir longuement (8 h)'))}`}
    </div>`);
  if (enAttente) {
    box.querySelector('[data-dodo-annule]').onclick = () => { multi.annulerDodo(); closePanel(); };
    return;
  }
  box.querySelectorAll('[data-sieste]').forEach(b => {
    b.onclick = () => {
      const h = parseInt(b.dataset.sieste, 10);
      if (coop) {
        multi.proposerDodo(h);
        toast('Tu te prépares à dormir — en attente de ton coéquipier.');
        panneauSommeil(); // bascule l'affichage en mode « attente »
      } else {
        executerSommeil(h);
      }
    };
  });
}
