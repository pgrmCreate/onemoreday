// ============ Cartes multi-échelles : déplacement, fouille, verrous, événements ============
// Quatre échelles, le même moteur : on clique une case, on s'y rend (1 ou 2 cases
// selon ta vitesse et l'environnement), le temps file, et ce qui devait arriver arrive.
// Les événements s'affichent dans une fenêtre par-dessus la carte.
import {
  G, save, rng, chance, pick, skillLevel, gainSkill, setFlag, getFlag, estNuit, noteJournal,
} from './state.js';
import { CARTES, DEPART } from './data/world.js';
import {
  carte, carteCourante, caseDef, caseCourante, franchissable, passagePossible, ckey, keyCourante,
  decouvrir, decouvrirAutour, estDecouverte, casesVisibles, solDe, solVisible, deposerAuSol, revelerSol,
  fouilleEtat, estSecurisee, securiser, zombiesPoolCourant, interieurSecurise,
  niveauSombre, liaison,
} from './world.js';
import { svgAmbiance, aAmbiance } from './ambiance.js';
import { jouerCineUneFois } from './cinema.js';
import {
  carteVivante, peuplerCarte, zombiesSur, zombieEn, retirerZombie, meuteAuContact,
  tourZombies, attirerZombies,
} from './zombies_map.js';
import { EVENTS } from './data/events.js';
import { item } from './data/items.js';
import {
  render, updateHUD, setLieuLabel, log, logHtml, btnAct, $, toast,
  showPanel, closePanel, showEvt, closeEvt, attente,
} from './ui.js';
import { ico } from './icons.js';
import { svgScene } from './illustrations.js';
import {
  addItem, hasItem, removeItem, hasOutil, poidsTotal, poidsMax, placePour,
  espaceUtilise, espaceMax, defItem,
} from './inventory.js';
import { advanceTime, dormir } from './survival.js';
import { appliquerEffets, besoinRempli, besoinTexte, jetReussi } from './effects.js';
import { demarrerCombat } from './combat.js';
import { playAmbiance, sfx } from './audio.js';
import { jouerScene } from './scenes.js';

let selection = null; // case sélectionnée sur la carte (info avant déplacement)
let vueDessin = false; // bascule plan ↔ dessin d'ambiance (bouton œil)
let enMarche = false;  // déplacement animé en cours : on ne clique pas pendant
let chemPrev = new Map(); // BFS : d'où on vient, pour reconstruire le chemin

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
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
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
function cadreCase(px, py, CS, inset, couleur, dash = false) {
  return `<rect x="${px + inset}" y="${py + inset}" width="${CS - 2 * inset}" height="${CS - 2 * inset}" rx="2"
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

// ---------- Dessin du sol des intérieurs ----------
function dessinInterieur(cd, x, y, px, py, s) {
  const id = G.world.carte;
  const circu = (dx, dy) => {
    const n = caseDef(id, x + dx, y + dy);
    return !!n && ['couloir', 'escalier', 'porte'].includes(n.t);
  };
  if (cd.t === 'escalier') {
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
  return mobilier(cd, x, y, px, py, s);
}

// ---------- Murs et portes du plan (façon plan d'évacuation) ----------
// Chaque bord de case intérieure : mur plein, battant de porte, ou ouverture libre.
function mursDeCase(cd, x, y, px, py, s, connue) {
  const id = G.world.carte;
  const bords = [
    { dx: 1, dy: 0, x1: px + s, y1: py, x2: px + s, y2: py + s, prio: true },
    { dx: 0, dy: 1, x1: px, y1: py + s, x2: px + s, y2: py + s, prio: true },
    { dx: -1, dy: 0, x1: px, y1: py, x2: px, y2: py + s, prio: false },
    { dx: 0, dy: -1, x1: px, y1: py, x2: px + s, y2: py, prio: false },
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
    const demi = li === 'ouvert' ? s * .3 : 8; // demi-largeur de l'ouverture
    out += vert
      ? `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x1}" y2="${my - demi}"/><line x1="${b.x1}" y1="${my + demi}" x2="${b.x1}" y2="${b.y2}"/>`
      : `<line x1="${b.x1}" y1="${b.y1}" x2="${mx - demi}" y2="${b.y1}"/><line x1="${mx + demi}" y1="${b.y1}" x2="${b.x2}" y2="${b.y1}"/>`;
    if (li === 'porte') {
      const ferme = (voisin.verrou && !G.world.verrous[ckey(id, nx, ny)]) || (cd.verrou && !G.world.verrous[ckey(id, x, y)]);
      const coul = ferme ? '#8a5a28' : '#6d5d42';
      out += vert
        ? `<rect x="${b.x1 - 2.5}" y="${my - demi}" width="5" height="${demi * 2}" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`
        : `<rect x="${mx - demi}" y="${b.y1 - 2.5}" width="${demi * 2}" height="5" rx="1" fill="#16130e" stroke="${coul}" stroke-width="1.2"/>`;
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
function pionZombie(px, py, CS, n) {
  const cx = px + CS / 2, cy = py + CS / 2;
  let s = `<g class="zpion">
    <circle cx="${cx}" cy="${cy}" r="9.5" fill="#160b0b" stroke="#a83226" stroke-width="1.6"/>
    <circle cx="${cx - 0.5}" cy="${cy - 3.6}" r="2.6" fill="#c4574a"/>
    <path d="M${cx - 3.6} ${cy + 6.5}L${cx - 1.5} ${cy - 0.5}M${cx + 3.6} ${cy + 6.5}L${cx + 1.5} ${cy - 0.5}M${cx - 4.5} ${cy + 0.5}l9 -1.6" stroke="#c4574a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  </g>`;
  if (n > 1) {
    s += `<circle cx="${px + CS - 9}" cy="${py + 9}" r="6.5" fill="#a83226"/>
      <text x="${px + CS - 9}" y="${py + 12}" text-anchor="middle" font-size="9" fill="#fff">${n}</text>`;
  }
  return s;
}

function svgCarte(reach, vis) {
  const C = carteCourante();
  const interieur = C.echelle === 'interieur';
  // Cases plus petites au zoom moyen (quartier) : on voit la rue plus loin.
  const CS = interieur ? 56 : (C.echelle === 'quartier' ? 38 : 46);
  const GAP = interieur ? 0 : 3, PAD = interieur ? 5 : 4;
  const W = C.largeur * CS + (C.largeur - 1) * GAP + PAD * 2;
  const H = C.hauteur * CS + (C.hauteur - 1) * GAP + PAD * 2;
  const toutConnu = hasItem('carte_quartier') && !interieur;
  const connue = (vx, vy) => toutConnu || estDecouverte(G.world.carte, vx, vy);
  const vivante = carteVivante(G.world.carte);
  const zombies = vivante ? zombiesSur(G.world.carte) : [];
  let cells = '', murs = '';
  for (const [pos, cd] of Object.entries(C.cases)) {
    const [x, y] = pos.split(',').map(Number);
    if (!connue(x, y)) continue;
    const t = TERRAIN[cd.t] || TERRAIN.rue;
    const px = PAD + x * (CS + GAP), py = PAD + y * (CS + GAP);
    const ici = x === G.world.x && y === G.world.y;
    const aVue = vis.has(pos);
    const atteign = reach.has(pos);
    const sel = selection === pos;
    const k = ckey(G.world.carte, x, y);
    const secur = estSecurisee(k);
    const niv = niveauSombre(cd);
    // le dessin de l'environnement, par-dessus le fond
    let inner = interieur ? dessinInterieur(cd, x, y, px, py, CS) : dessinExterieur(cd, x, y, px, py, CS);
    // une entrée (bâtiment, sortie d'intérieur) : le petit rectangle de porte
    if (cd.vers) {
      const basY = ['batiment', 'village', 'ville', 'site'].includes(cd.t) ? py + CS - 20 : py + 7;
      inner += `<rect x="${px + CS / 2 - 5.5}" y="${basY}" width="11" height="14" rx="1" fill="#16130e" stroke="${cd.verrou && !G.world.verrous[k] ? '#8a5a28' : '#6d5d42'}" stroke-width="1.3"/>
        <circle cx="${px + CS / 2 + 2.5}" cy="${basY + 7.5}" r="1" fill="#6d5d42"/>`;
    }
    if (solVisible(k).length) {
      inner += `<circle cx="${px + CS - 8}" cy="${py + CS - 8}" r="3" fill="${CODES.sol}"/>`;
    }
    // noir total : la case s'enfonce dans l'ombre
    if (niv === 2) inner += `<rect x="${px + 1}" y="${py + 1}" width="${CS - 2}" height="${CS - 2}" fill="#050507" opacity=".44"/>`;
    // Liserés : codes couleur de la case (voir Légende)
    const insetEtat = interieur ? 3 : 1.5;
    if (secur) inner += cadreCase(px, py, CS, insetEtat, CODES.securisee);
    else if ((cd.danger || 0) >= 0.4) inner += cadreCase(px, py, CS, insetEtat, CODES.danger);
    if (niv === 1) inner += cadreCase(px, py, CS, insetEtat + 3, CODES.sombre, true);
    else if (niv === 2) inner += cadreCase(px, py, CS, insetEtat + 3, CODES.sombre);
    // Indice texte : lbl explicite, sinon dérivé du nom (toutes les pièces en intérieur)
    const lbl = cd.lbl !== undefined ? cd.lbl
      : (cd.nom && (interieur || cd.vers || cd.special || cd.t === 'ville' || cd.t === 'village' || cd.t === 'site') ? cd.nom.split(' ')[0] : '');
    if (lbl && !ici) {
      inner += `<text x="${px + CS / 2}" y="${py + CS - 5}" text-anchor="middle" font-size="9" fill="#9a8f7c">${lbl.slice(0, 10)}</text>`;
    }
    // Hors de ta vue : la case reste en mémoire, mais on n'y voit pas
    // ce qui s'y trouve MAINTENANT (et les zombies n'y sont pas dessinés).
    if (!aVue && !ici) {
      inner += `<rect x="${px}" y="${py}" width="${CS}" height="${CS}" fill="#08080a" opacity=".4"/>`;
    }
    // Eux. Visibles seulement dans ta ligne de vue — on les voit ARRIVER.
    if (aVue) {
      const zlist = zombies.filter(z => z.x === x && z.y === y);
      if (zlist.length) inner += pionZombie(px, py, CS, zlist.length);
    }
    if (ici) {
      inner += `<g class="joueur"><circle cx="${px + CS / 2}" cy="${py + CS / 2}" r="8" fill="#c9b98a" stroke="#0b0b0c" stroke-width="2"/>
        <circle cx="${px + CS / 2}" cy="${py + CS / 2}" r="12" fill="none" stroke="#c9b98a" stroke-width="1" opacity=".5"/></g>`;
    }
    cells += `<g class="case ${atteign ? 'atteignable' : ''} ${sel ? 'selection' : ''}" data-case="${pos}">
      <rect class="fond" x="${px}" y="${py}" width="${CS}" height="${CS}" rx="${interieur ? 0 : 2}" fill="${t.fill}" ${interieur ? '' : `stroke="${t.stroke}"`}/>
      ${inner}<rect class="hl" x="${px + 1.5}" y="${py + 1.5}" width="${CS - 3}" height="${CS - 3}" rx="2"/></g>`;
    if (interieur) murs += mursDeCase(cd, x, y, px, py, CS, connue);
  }
  return `<svg class="carte-grille" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${cells}${murs ? `<g fill="none" stroke="${MUR_TRAIT}" stroke-width="3" stroke-linecap="square">${murs}</g>` : ''}</svg>`;
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
  if (niv === 1) tags.push(`<span class="ci-tag sombre">pénombre${hasOutil('lumiere') ? ' — tu as de la lumière' : ' — fouilles moins sûres'}</span>`);
  else if (niv === 2) tags.push(`<span class="ci-tag sombre">noir total${hasOutil('lumiere') ? ' — tu as de la lumière' : ' — lumière nécessaire'}</span>`);
  const nSol = solVisible(k).reduce((s, e) => s + (e.qty || 1), 0);
  if (nSol) tags.push(`<span class="ci-tag">${nSol} objet${nSol > 1 ? 's' : ''} au sol</span>`);
  return tags.join('');
}

function tuile(attrs, icone, nom, sub = '', opts = {}) {
  return `<button class="tile${opts.classe ? ' ' + opts.classe : ''}" ${attrs} ${opts.disabled ? 'disabled' : ''}>
    <span class="t-ico">${ico(icone)}</span><span class="t-nom">${nom}</span>${sub ? `<span class="t-sub">${sub}</span>` : ''}</button>`;
}

export function renderLieu() {
  const C = carteCourante();
  if (!C) { console.error('Carte inconnue', G.world.carte); return; }
  const cd = caseCourante() || {};
  const k = keyCourante();
  peuplerCarte(G.world.carte);
  decouvrirAutour(G.world.carte, G.world.x, G.world.y);
  playAmbiance(G.world.carte);
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
    <span class="lb-sub">${ECHELLE_NOM[C.echelle]}${C.exterieur ? ' — à découvert' : ''}${estNuit() ? ' — nuit' : ''}</span></div>
  <div class="carte-wrap${vueDessin && fond ? ' vue-dessin' : ''}">
    ${fond ? `<div class="carte-fond">${fond}</div><div class="carte-voile"></div>` : ''}
    ${svgCarte(reach, vis)}
    <div class="carte-legende"><span>marche : ${portee} case${portee > 1 ? 's' : ''}</span><span>${C.tempsParCase} min/case</span>${C.sousTitre ? `<span>${C.sousTitre}</span>` : ''}
      <button class="legende-btn" data-legende="1" title="Légende">?</button>
      ${fond ? `<button class="legende-btn icone" data-vue="1" title="${vueDessin ? 'Revenir au plan' : 'Voir les lieux'}">${ico(vueDessin ? 'carte' : 'oeil')}</button>` : ''}
    </div>
  </div>
  <div class="case-info" id="case-info">
    <div class="ci-nom">${cd.nom || C.nom}</div>
    ${cd.desc ? `<div class="ci-desc">${cd.desc}</div>` : ''}
    <div class="ci-tags">${tagsCase(cd, k)}</div>
  </div>
  <div class="actions"><div class="tiles">`;

  // --- actions sur la case courante ---
  if (cd.vers) {
    const cible = carte(cd.vers.carte);
    const bloque = cd.verrou && !G.world.verrous[k];
    html += tuile('data-entrer="1"', bloque ? 'verrou' : (cible && cible.echelle === 'interieur' ? 'entrer' : 'sortir'),
      cd.versNom || (cible ? cible.nom : '?'), bloque ? '<span class="req">accès bloqué</span>' : `${cd.vers.temps ?? C.tempsParCase} min`);
  }
  if (cd.fouille) {
    const epuisee = f.n >= cd.fouille.max;
    const tMin = tempsFouille(f.n);
    const nivF = niveauSombre(cd);
    const mention = nivF === 2 ? ' · <span class="req">noir total</span>' : nivF === 1 ? ' · pénombre' : '';
    html += tuile('data-fouille="1"', 'fouille', `Fouiller (${f.n}/${cd.fouille.max})`,
      epuisee ? 'retournée de fond en comble' : `${tMin} min${mention}`,
      { disabled: epuisee });
  }
  if (nbSol) {
    html += tuile('data-sol="1"', 'ramasser', `Ramasser (${nbSol})`, 'examiner ce qui traîne', { classe: 'trouves-btn' });
  }
  if (cd.special) html += tuileSpeciale(cd, k);
  if (C.echelle === 'interieur') {
    html += tuile('data-dormir="1"', 'dormir', 'Dormir', sommeilInfo());
  }
  html += `</div></div>
  <div class="gamelog" id="gamelog">${logHtml()}</div>`;

  render(html);
  updateHUD();

  // --- interactions carte ---
  document.querySelectorAll('[data-case]').forEach(g => {
    g.onclick = () => {
      if (enMarche) return; // on ne change pas de cap en pleine marche
      const pos = g.dataset.case;
      if (pos === `${G.world.x},${G.world.y}`) { selection = null; renderLieu(); return; }
      if (selection === pos && reach.has(pos)) {
        selection = null;
        sfx('clic');
        allerEnCase(pos);
        return;
      }
      selection = pos;
      majInfoCase(pos, reach);
    };
  });
  const lier = (sel, fn) => { const b = $(sel); if (b) b.onclick = () => { if (enMarche) return; sfx('clic'); fn(); }; };
  lier('[data-entrer]', entrerCase);
  lier('[data-fouille]', () => fouiller());
  lier('[data-sol]', panneauTrouves);
  lier('[data-dormir]', panneauSommeil);
  lier('[data-legende]', panneauLegende);
  lier('[data-vue]', () => { vueDessin = !vueDessin; renderLieu(); });
  const sp = $('[data-special]');
  if (sp) sp.onclick = () => { if (enMarche) return; sfx('clic'); actionSpeciale(sp.dataset.special); };
}

// ---------- Légende de la carte ----------
function panneauLegende() {
  const carre = (couleur, dash = false, fond = '#211e19') =>
    `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="${fond}" stroke="${couleur}" stroke-width="1.6" ${dash ? 'stroke-dasharray="3 2.5"' : ''}/></svg>`;
  const ligne = (sym, txt) => `<div class="leg-row">${sym}<span>${txt}</span></div>`;
  const mur = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><line x1="10" y1="1" x2="10" y2="19" stroke="${MUR_TRAIT}" stroke-width="2.6"/></svg>`;
  const murPorte = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><g stroke="${MUR_TRAIT}" stroke-width="2.6"><line x1="10" y1="1" x2="10" y2="4.5"/><line x1="10" y1="15.5" x2="10" y2="19"/></g><rect x="8" y="4.5" width="4" height="11" rx="1" fill="#16130e" stroke="#6d5d42" stroke-width="1.1"/></svg>`;
  const murOuvert = `<svg width="20" height="20" viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" fill="#211e19"/><g stroke="${MUR_TRAIT}" stroke-width="2.6"><line x1="10" y1="1" x2="10" y2="5"/><line x1="10" y1="15" x2="10" y2="19"/></g></svg>`;
  const box = showEvt(`<h2 class="lieu-nom">Légende de la carte</h2>
    <div class="leg-grid">
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
  if (poidsTotal() > poidsMax()) { toast('Trop chargé pour bouger. Allège ton sac.'); return; }
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
    const r = advanceTime(C.tempsParCase);
    r.messages.forEach(m => log(m.t, m.c));
    if (r.mort) { enMarche = false; return; }
    G.world.x = x; G.world.y = y;
    sfx('pas');
    decouvrirAutour(G.world.carte, x, y);
    G.player.sta = Math.max(0, G.player.sta - 0.6); // marcher use, un peu
    const vis = casesVisibles(G.world.carte, x, y);
    // Eux aussi avancent — et le contact arrête tout.
    let contact = carteVivante(G.world.carte) ? tourZombies(G.world.carte, vis) : null;
    if (!contact) contact = zombieEn(G.world.carte, x, y);
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
  const cd = caseCourante() || {};
  const meute = meuteAuContact(G.world.carte, G.world.x, G.world.y);
  const groupe = meute.includes(z) ? meute : [z, ...meute];
  groupe.forEach(v => retirerZombie(G.world.carte, v));
  log(`${cd.nom || 'Ici'} : ${groupe.length > 1 ? 'ils sont' : 'il est'} sur toi.`, 'bad');
  demarrerCombat(groupe.map(v => v.id), { onFin: () => renderLieu() });
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
    const r = advanceTime(minutes);
    r.messages.forEach(m => log(m.t, m.c));
    if (r.mort) return;
    G.world.carte = cd.vers.carte;
    G.world.x = cd.vers.x; G.world.y = cd.vers.y;
    peuplerCarte(G.world.carte);
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
    else suite();
  });
}

function arrivee() {
  const cd = caseCourante() || {};
  const k = keyCourante();
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
  // Événement ? — dans une fenêtre par-dessus la carte
  const type = typeEvenement();
  const pEv = { rue: 0.26, interieur: 0.14, parc: 0.26 }[type] || 0.2;
  if ((cd.danger || 0) > 0 && chance(pEv)) {
    const ev = tirerEvent(type);
    if (ev) { jouerEvent(ev); return; }
  }
  renderLieu();
}

function typeEvenement() {
  const C = carteCourante();
  const cd = caseCourante() || {};
  if (C.echelle === 'interieur') return 'interieur';
  if (cd.t === 'parc' || cd.t === 'nature') return 'parc';
  return 'rue';
}

// ---------- Fouille : répétable, de plus en plus longue, de plus en plus payante ----------
const TEMPS_FOUILLE_BASE = { interieur: 10, quartier: 15, ville: 20, region: 30 };
function tempsFouille(n) {
  const C = carteCourante();
  const base = TEMPS_FOUILLE_BASE[C.echelle] || 15;
  return Math.round(base * (1 + 0.6 * n)); // chaque passage coûte plus de temps
}

function fouiller(aTatons = false) {
  const cd = caseCourante();
  if (!cd || !cd.fouille) return;
  const k = keyCourante();
  // L'accès est bloqué (grille, rideau, cadenas) : il faut d'abord ouvrir.
  if (cd.verrou && !G.world.verrous[k]) { ecranVerrou(cd, k); return; }
  const f = fouilleEtat(k);
  if (f.n >= cd.fouille.max) { toast('Tu as déjà tout retourné ici.'); return; }

  if (niveauSombre(cd) === 2 && !hasOutil('lumiere') && !aTatons) {
    const box = showEvt(`<div class="narration">Il fait noir là-dedans. Sans lumière, tu ne verras rien venir — ni les objets, ni le reste.</div>
      <div class="actions">
        ${btnAct('data-tatons="1"', 'Fouiller à tâtons', 'tu trouveras moins, et ils te verront avant que tu les voies')}
        ${btnAct('data-renonce="1"', 'Renoncer', 'revenir avec une lampe')}
      </div>`);
    box.querySelector('[data-tatons]').onclick = () => { closeEvt(); fouiller(true); };
    box.querySelector('[data-renonce]').onclick = () => closeEvt();
    return;
  }

  // Le temps s'accélère quand on agit : chaque fouille mange de longues minutes.
  const minutes = tempsFouille(f.n);
  attente(aTatons ? 'Tu fouilles à tâtons…' : 'Tu fouilles…', minutes, () => {
    const r = advanceTime(minutes);
    r.messages.forEach(m => log(m.t, m.c));
    if (r.mort) return;
    G.player.sta = Math.max(0, G.player.sta - (4 + 2 * f.n));

    // Danger : farfouiller fait du bruit, et plus longtemps on reste, plus on en fait.
    // Sur les cartes vivantes, le bruit ATTIRE les zombies alentour — tu les
    // verras arriver sur la carte. L'embuscade aveugle, elle, devient rare.
    let danger = (cd.danger ?? 0.2) * (1 + 0.2 * f.n);
    if (estSecurisee(k)) danger *= 0.15;
    if (aTatons) danger *= 1.6;
    if (niveauSombre(cd) === 1 && !hasOutil('lumiere')) danger *= 1.2; // en pénombre, on les voit venir tard
    if (estNuit()) danger *= 1.3;
    if (carteVivante(G.world.carte)) {
      attirerZombies(G.world.carte, G.world.x, G.world.y, 4 + f.n);
      danger *= 0.4;
    }
    if (chance(danger)) {
      log(`En fouillant ${ (cd.nom || 'la zone').toLowerCase() }, tu n'étais pas seul.`, 'bad');
      demarrerCombat([pick(zombiesPoolCourant())], {
        surprise: aTatons,
        onFin: (res) => { if (res === 'victoire') terminerFouille(aTatons); else renderLieu(); },
      });
      return;
    }
    terminerFouille(aTatons);
  });
}

// Fouiller dans le noir use la lumière : la lampe mange ses piles, la torche se consume.
function usureLumiere() {
  if ((hasItem('lampe_torche') || hasItem('lampe_frontale')) && hasItem('piles')) {
    if (chance(0.25)) {
      removeItem('piles', 1);
      log(hasItem('piles')
        ? 'Le faisceau de ta lampe jaunit : une paire de piles est morte.'
        : 'Ta lampe clignote, faiblit, s\'éteint. Plus de piles.', 'warn');
    }
  } else if (hasItem('torche')) {
    if (chance(0.2)) {
      removeItem('torche', 1);
      log('Ta torche s\'est consumée jusqu\'au manche. Tu lâches le tison.', 'warn');
    }
  }
}

function terminerFouille(aTatons) {
  const cd = caseCourante();
  const k = keyCourante();
  const f = fouilleEtat(k);
  const niv = niveauSombre(cd);
  if (niv === 2 && !aTatons) usureLumiere();
  else if (niv === 1 && hasOutil('lumiere') && chance(0.5)) usureLumiere(); // on s'éclaire par confort
  // Plus on creuse, plus on a de chances de mettre la main sur ce qui reste.
  // En pénombre sans lampe, on passe à côté d'une partie des choses.
  const malusPenombre = (niv === 1 && !hasOutil('lumiere')) ? 0.75 : 1;
  const profondeur = Math.min(1.15, (0.55 + 0.3 * f.n)) * (aTatons ? 0.5 : 1) * malusPenombre;
  const deniches = [];
  for (const entry of (cd.fouille.table || [])) {
    const d = defItem(entry.id);
    if (!d) { console.warn('Loot inconnu :', entry.id); continue; }
    if (f.pris[entry.id]) continue;
    if (!chance(entry.p * profondeur)) continue;
    const qty = rng(entry.q[0], entry.q[1]);
    deposerAuSol(k, { id: entry.id, qty, dur: d.dur ? d.dur : undefined });
    f.pris[entry.id] = true;
    deniches.push(`${d.nom}${qty > 1 ? ' ×' + qty : ''}`);
  }
  // Ce qui traînait caché (une arme jetée en combat...) finit par se retrouver.
  const reveles = revelerSol(k);
  f.n++;
  if (deniches.length) {
    log(`Déniché : ${deniches.join(', ')}.`, 'good');
    sfx('loot');
  } else if (reveles) {
    log('Tu remets la main sur ce qui était tombé là.', 'good');
    sfx('loot');
  } else {
    log(`${cd.nom || 'La zone'} : rien de plus cette fois.`, '');
  }
  const C = carteCourante();
  if (C.echelle === 'interieur' && !estSecurisee(k)) {
    securiser(k);
    log(`${cd.nom} : pièce nettoyée et sécurisée.`, 'good');
    if (interieurSecurise(G.world.carte)) log(`${C.nom} : tout est fouillé. L'endroit est à toi.`, 'good');
  }
  save();
  // Pendant que tu farfouillais, eux marchaient.
  if (carteVivante(G.world.carte)) {
    const vis = casesVisibles(G.world.carte, G.world.x, G.world.y);
    const contact = tourZombies(G.world.carte, vis) || zombieEn(G.world.carte, G.world.x, G.world.y);
    if (contact) { renderLieu(); lancerCombatContact(contact); return; }
  }
  renderLieu();
  if (deniches.length || reveles) panneauTrouves();
}

// ---------- Objets au sol : ramassage à la main ----------
function panneauTrouves() {
  const k = keyCourante();
  const sol = solVisible(k);
  let html = `<div class="panel-head"><h2>Au sol</h2><button class="panel-close">×</button></div>
    <p class="cap-line">Poids : <b>${poidsTotal().toFixed(1)} / ${poidsMax()} kg</b> — Espace : <b>${espaceUtilise()} / ${espaceMax()}</b></p>
    <div class="item-list">`;
  if (!sol.length) html += `<p class="cap-line">Plus rien à ramasser ici. Fouille pour dénicher davantage.</p>`;
  sol.forEach((e, i) => {
    const d = defItem(e.id);
    if (!d) return;
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${(e.qty || 1) > 1 ? ` <span class="qty">×${e.qty}</span>` : ''}</span>
      <span class="item-meta">${(d.poids || 0).toFixed(1)} kg · ${d.espace || 0} esp.</span></div>
      <div class="item-desc">${d.desc}</div>
      <div class="item-btns">
        <button data-prendre="${i}">Prendre${(e.qty || 1) > 1 ? ' (1)' : ''}</button>
        ${(e.qty || 1) > 1 ? `<button data-prendre-tout="${i}">Tout (×${e.qty})</button>` : ''}
      </div></div>`;
  });
  html += `</div>`;
  if (sol.length > 1) {
    html += `<div class="actions" style="margin-top:10px">${btnAct('data-rafler="1"', 'Tout rafler', 'prend tout ce qui rentre dans le sac')}</div>`;
  }
  const box = showPanel(html);

  const prendreUn = (e) => {
    if (e.dur !== undefined) {
      if (!placePour(e.id, 1)) return false;
      G.player.inventaire.push({ id: e.id, qty: 1, dur: e.dur });
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
    if (solVisible(k).length) panneauTrouves();
    else { closePanel(); renderLieu(); }
  };
  box.querySelectorAll('[data-prendre]').forEach(b => b.onclick = () => prendre(parseInt(b.dataset.prendre, 10), 1));
  box.querySelectorAll('[data-prendre-tout]').forEach(b => b.onclick = () => prendre(parseInt(b.dataset.prendreTout, 10), 999));
  const raf = box.querySelector('[data-rafler]');
  if (raf) raf.onclick = () => {
    const tout = solDe(k);
    let pris = 0;
    for (let i = tout.length - 1; i >= 0; i--) {
      const e = tout[i];
      if (e.cache) continue;
      while ((e.qty || 1) > 0 && prendreUn(e)) { e.qty--; pris++; if (e.dur !== undefined) break; }
      if (e.qty <= 0) tout.splice(i, 1);
    }
    if (pris) { sfx('loot'); log(`Ramassé : ${pris} objet${pris > 1 ? 's' : ''}.`, 'good'); }
    if (solVisible(k).length) toast('Le reste ne rentre pas : fais du tri.');
    updateHUD();
    save();
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
        const r = advanceTime(o.tempsMin || 5);
        r.messages.forEach(m => log(m.t, m.c));
        if (r.mort) return;
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
      return t('soif', 'Prélever de l\'eau', hasItem('bouteille_vide') ? 'eau douteuse, à bouillir' : 'requiert : bouteille vide', hasItem('bouteille_vide'));
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
    case 'fontaine': {
      if (!removeItem('bouteille_vide', 1)) { toast('Il te faut une bouteille vide.'); renderLieu(); break; }
      attente('Tu remplis la bouteille…', 5, () => {
        addItem('eau_croupie', 1);
        const r = advanceTime(5);
        r.messages.forEach(m => log(m.t, m.c));
        if (r.mort) return;
        log('Tu remplis la bouteille à la fontaine. L\'eau sent la mousse et le calcaire. À bouillir, sauf envie de mourir plié en deux.', 'good');
        save(); renderLieu();
      });
      break;
    }
    case 'peche': {
      if (!hasItem('canne_peche')) { toast('Il te faut une canne à pêche.'); renderLieu(); break; }
      if (!placePour('poisson_cru', 2)) { toast('Fais de la place dans ton sac avant de pêcher.'); renderLieu(); break; }
      attente('Tu pêches, l\'œil sur le fil…', 60, () => {
        const r = advanceTime(60);
        r.messages.forEach(m => log(m.t, m.c));
        if (r.mort) return;
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
          const r = advanceTime(15);
          r.messages.forEach(m => log(m.t, m.c));
          if (r.mort) return;
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
        const r = advanceTime(20);
        r.messages.forEach(m => log(m.t, m.c));
        if (r.mort) return;
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
    const r = advanceTime(10);
    r.messages.forEach(m => log(m.t, m.c));
    if (r.mort) return;
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
      const r = advanceTime(60);
      r.messages.forEach(m => log(m.t, m.c));
      if (r.mort) return;
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
    jouerScene('loco_demarrage');
  };
}

// ---------- Événements (fenêtre par-dessus la carte) ----------
function tirerEvent(typeLieu) {
  const candidats = EVENTS.filter(ev => {
    const typeOk = (ev.types && ev.types.includes(typeLieu)) || (ev.lieux && ev.lieux.includes(G.world.carte));
    if (!typeOk) return false;
    if (ev.once && G.world.eventsVus.includes(ev.id)) return false;
    if (ev.nuit === true && !estNuit()) return false;
    if (ev.nuit === false && estNuit()) return false;
    if (ev.condition) {
      if (ev.condition.flag && !getFlag(ev.condition.flag)) return false;
      if (ev.condition.flagAbsent && getFlag(ev.condition.flagAbsent)) return false;
      if (ev.condition.item && !hasItem(ev.condition.item)) return false;
    }
    return true;
  });
  if (!candidats.length) return null;
  const total = candidats.reduce((s, e) => s + (e.p || 1), 0);
  let t = Math.random() * total;
  for (const e of candidats) { t -= (e.p || 1); if (t <= 0) return e; }
  return candidats[candidats.length - 1];
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
      resultatEvent(branche);
    };
  });
}

function resultatEvent(branche) {
  const appliquer = () => {
    const combatLance = appliquerEffets(branche.effets, () => renderLieu());
    if (G.player.pv <= 0) return; // mort pendant l'effet : ne pas écraser la sauvegarde
    save();
    if (!combatLance) renderLieu();
  };
  const continuer = () => {
    closeEvt();
    // Un choix qui coûte du temps se paie aussi en temps réel : petit spinner.
    if (branche.effets && branche.effets.tempsMin) attente('Le temps passe…', branche.effets.tempsMin, appliquer);
    else appliquer();
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

function panneauSommeil() {
  const sur = lieuSur();
  const piege = hasItem('piege_sonore');
  const jusquauMatin = G.world.heure >= 19 || G.world.heure < 7
    ? (G.world.heure >= 19 ? (24 - G.world.heure) + 7 : 7 - G.world.heure)
    : null;
  const box = showPanel(`
    <div class="panel-head"><h2>Dormir</h2><button class="panel-close">×</button></div>
    <p class="cap-line">${sommeilInfo()}.${!sur && piege ? ' Ton piège sonore montera la garde.' : ''}</p>
    <div class="actions">
      ${btnAct('data-sieste="3"', 'Faire une sieste (3 h)')}
      ${jusquauMatin ? btnAct(`data-sieste="${jusquauMatin}"`, `Dormir jusqu'au matin (${jusquauMatin} h)`) : btnAct('data-sieste="8"', 'Dormir longuement (8 h)')}
    </div>`);
  box.querySelectorAll('[data-sieste]').forEach(b => {
    b.onclick = () => {
      closePanel();
      const h = parseInt(b.dataset.sieste, 10);
      attente('Tu dors…', h * 60, () => {
        const r = dormir(h, lieuSur(), piege);
        r.messages.forEach(m => log(m.t, m.c));
        if (G.player.pv <= 0) return;
        save();
        if (r.attaque) {
          if (piege) log('Le piège sonore a claqué dans le noir : tu es debout, arme en main, avant que la chose ne t\'atteigne.', 'good');
          demarrerCombat([pick(zombiesPoolCourant())], { surprise: !piege, onFin: () => renderLieu() });
        } else {
          renderLieu();
        }
      });
    };
  });
}
