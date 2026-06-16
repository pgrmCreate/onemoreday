// ============ État global, sauvegarde, RNG, compétences ============
export const VERSION = '0.2.0';
const SAVE_KEY = 'onemoreday_save_v2'; // v2 : monde de Salon-de-Provence, incompatible avec les sauvegardes v1
// Sauvegarde ACTIVE : la vraie partie par défaut. L'éditeur de cartes bascule sur une clé
// SÉPARÉE (utiliserSauvegardeTest) le temps d'un essai, pour ne JAMAIS écraser ta partie réelle.
let CLE_SAUVEGARDE = SAVE_KEY;
export function utiliserSauvegardeTest() { CLE_SAUVEGARDE = 'onemoreday_test_v2'; }

export let G = null; // état de la partie en cours

export const SKILLS = {
  force:        { nom: 'Force',             desc: 'Porter plus lourd, frapper plus fort, forcer les portes.' },
  dexterite:    { nom: 'Dextérité',         desc: 'Toucher plus souvent et plus précisément avec une arme.' },
  agilite:      { nom: 'Agilité',           desc: 'Esquiver, fuir, escalader.' },
  mainsNues:    { nom: 'Combat à mains nues', desc: 'Frapper sans arme, se dégager d\'une étreinte.' },
  visee:        { nom: 'Visée (armes à feu)', desc: 'Précision au tir, gestion du recul.' },
  construction: { nom: 'Construction',      desc: 'Barricader, assembler des objets solides.' },
  mecanique:    { nom: 'Mécanique',         desc: 'Réparer moteurs, batteries, serrures.' },
  entretien:    { nom: 'Entretien',         desc: 'Les armes s\'usent moins vite entre tes mains.' },
  chasse:       { nom: 'Pêche / Chasse',    desc: 'Poser des collets, pêcher, dépecer proprement.' },
};

// XP nécessaire pour atteindre chaque niveau (0 → 5)
const SKILL_PALIERS = [0, 50, 130, 260, 450, 700];

export function skillLevel(id) {
  const xp = G.player.skillXp[id] || 0;
  let lvl = 0;
  for (let i = 1; i < SKILL_PALIERS.length; i++) if (xp >= SKILL_PALIERS[i]) lvl = i;
  return lvl;
}

export function gainSkill(id, xp) {
  if (!G || !SKILLS[id]) return null;
  const avant = skillLevel(id);
  G.player.skillXp[id] = (G.player.skillXp[id] || 0) + xp;
  const apres = skillLevel(id);
  return apres > avant ? { skill: id, niveau: apres } : null;
}

// ---------- RNG ----------
export function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function chance(p) { return Math.random() < p; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---------- RNG DÉTERMINISTE (co-op : même résultat chez l'hôte et l'invité) ----------
// Pour tout ce qui doit être IDENTIQUE des deux côtés sans se parler en continu :
// seeding des zombies à la 1re visite, pré-placement des événements… On dérive une
// graine d'une chaîne (la graine de partie + l'id de carte), et on en tire un flux
// reproductible. Hôte et invité partagent G.world.seed (l'invité adopte le monde),
// donc seedRng(seed+':z:'+carteId) donne la MÊME suite des deux côtés.
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seedRng(s) {
  let a = hashStr(String(s));
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Nouvelle partie ----------
export function newGame(nom) {
  G = {
    version: VERSION,
    difficulte: 'extreme', // mode UNIQUE : permadeath — la mort efface la partie, aucun retour en arrière
    player: {
      nom: nom || 'Sam',
      pv: 100, pvMax: 100,
      sta: 100, staMax: 100,
      faim: 100,  // 100 = rassasié, 0 = affamé — on démarre toutes jauges pleines
      soif: 100,  // 100 = hydraté, 0 = déshydraté
      skillXp: { force: 20, dexterite: 20, agilite: 20, mainsNues: 0, visee: 0, construction: 0, mecanique: 0, entretien: 0, chasse: 0 },
      inventaire: [], // [{id, qty, dur?}]
      // Tenue de départ : des vêtements de tous les jours, rien de plus.
      equip: { arme: null, tete: null, torse: 'tshirt', mains: null, jambes: 'jean', pieds: 'baskets', sac: null, ceinture: null, holster: null },
      accesRapide: [], // objets portés à la ceinture/holster/gilet : [{id, qty:1, dur?}] — seuls accessibles en combat
      blessures: [],  // [{type, zone, saigne, infecte, bandee, suturee, age}]
      maladie: null,  // null | 'intoxication' | 'fievre'
      maladieDuree: 0,
      morts: 0,       // zombies tués
    },
    world: {
      // Graine de partie : socle de tout le déterminisme partagé en co-op (l'invité
      // l'adopte avec le monde). Tirée une fois, ici, chez celui qui crée la partie.
      seed: Math.floor(Math.random() * 1e9),
      jour: 1, heure: 8, minute: 0,
      // Position : une carte (échelle quelconque) + des coordonnées de case
      carte: null, x: 0, y: 0, // définis par map.js au lancement (DEPART du monde)
      fx: 0, fy: 0, // position CONTINUE en pixels (échelle intérieur : déplacement libre, cf. freemove.js)
      decouverts: {}, // carteId -> ['x,y', ...] : brouillard de guerre
      fouilles: {},   // 'carte:x,y' -> { n: fouilles faites, pris: {itemId:true} }
      sol: {},        // 'carte:x,y' -> [{id, qty, dur?, cache?}] objets au sol (cache = révélé par une fouille)
      securisees: {}, // 'carte:x,y' -> true : case intérieure nettoyée
      barricades: {}, // 'carte:x,y' -> true : case barricadée (sommeil sûr)
      verrous: {},    // 'carte:x,y' -> true : accès forcé/ouvert
      zmap: {},       // carteId -> { t, z: [{x,y,id,pas,uid,dir,...}], morts: [{x,y}] } : zombies SUR la carte
      zseq: 0,        // compteur d'identités de zombies (uid stables pour l'affichage)
      portes: {},     // carteId -> { 'x1,y1|x2,y2': {pv, cassee} } : portes attaquées par eux
      flags: {},      // drapeaux d'histoire
      eventsVus: [],  // ids d'événements "once" déjà joués
      garanties: {},  // carteId -> { 'x,y': [{id, qty}] } : butin GARANTI dispatché à la 1re visite
      eventsPlaces: {}, // carteId -> { 'x,y': eventId } : événements PRÉ-PLACÉS (mêmes lieux pour les deux en co-op)
      eventsFaits: {},  // 'carte:x,y' -> true : événement pré-placé déjà déclenché (de MON côté ; non diffusé)
      statsTemps: 0,  // minutes écoulées au total
    },
    journal: [],
    log: [],
  };
  return G;
}

export function setG(data) { G = data; }
export function getFlag(k) { return !!(G && G.world.flags[k]); }
export function setFlag(k, v = true) { if (G) G.world.flags[k] = v; }

// ---------- Sauvegarde ----------
export function save() {
  if (!G) return false;
  try { localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(G)); return true; }
  catch (e) { console.error('Sauvegarde impossible', e); return false; }
}
export function load() {
  try {
    const raw = localStorage.getItem(CLE_SAUVEGARDE);
    if (!raw) return null;
    G = JSON.parse(raw);
    if (!G.world.zmap) G.world.zmap = {};   // sauvegardes d'avant les zombies sur carte
    if (!G.world.portes) G.world.portes = {}; // sauvegardes d'avant les portes à PV
    if (G.world.seed === undefined) G.world.seed = Math.floor(Math.random() * 1e9); // graine partagée
    if (G.world.fx === undefined) { G.world.fx = 0; G.world.fy = 0; } // position continue (déplacement libre intérieur)
    if (!G.world.eventsPlaces) G.world.eventsPlaces = {}; // événements pré-placés
    if (!G.world.eventsFaits) G.world.eventsFaits = {};   // événements pré-placés déjà joués
    return G;
  } catch (e) { console.error('Chargement impossible', e); return null; }
}
export function hasSave() { return !!localStorage.getItem(CLE_SAUVEGARDE); }
export function clearSave() { localStorage.removeItem(CLE_SAUVEGARDE); }

// ---------- Journal narratif ----------
export function noteJournal(texte) {
  if (!G) return;
  G.journal.push({ jour: G.world.jour, heure: G.world.heure, texte });
}

export function heureTxt() {
  const h = String(G.world.heure).padStart(2, '0');
  const m = String(G.world.minute).padStart(2, '0');
  return `Jour ${G.world.jour} — ${h}:${m}`;
}
export function estNuit() { return G.world.heure >= 21 || G.world.heure < 7; }
