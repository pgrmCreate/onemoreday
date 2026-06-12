// ============ État global, sauvegarde, RNG, compétences ============
export const VERSION = '0.2.0';
const SAVE_KEY = 'onemoreday_save_v2'; // v2 : monde de Salon-de-Provence, incompatible avec les sauvegardes v1

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

// ---------- Nouvelle partie ----------
export function newGame(nom, difficulte) {
  G = {
    version: VERSION,
    difficulte, // 'normal' (mort = retour à la sauvegarde) | 'extreme' (permadeath)
    player: {
      nom: nom || 'Sam',
      pv: 100, pvMax: 100,
      sta: 100, staMax: 100,
      faim: 72,   // 100 = rassasié, 0 = affamé
      soif: 65,   // 100 = hydraté, 0 = déshydraté
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
      jour: 1, heure: 8, minute: 0,
      // Position : une carte (échelle quelconque) + des coordonnées de case
      carte: null, x: 0, y: 0, // définis par map.js au lancement (DEPART du monde)
      decouverts: {}, // carteId -> ['x,y', ...] : brouillard de guerre
      fouilles: {},   // 'carte:x,y' -> { n: fouilles faites, pris: {itemId:true} }
      sol: {},        // 'carte:x,y' -> [{id, qty, dur?, cache?}] objets au sol (cache = révélé par une fouille)
      securisees: {}, // 'carte:x,y' -> true : case intérieure nettoyée
      barricades: {}, // 'carte:x,y' -> true : case barricadée (sommeil sûr)
      verrous: {},    // 'carte:x,y' -> true : accès forcé/ouvert
      zmap: {},       // carteId -> { t, z: [{x,y,id,pas}] } : zombies SUR la carte
      flags: {},      // drapeaux d'histoire
      eventsVus: [],  // ids d'événements "once" déjà joués
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
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; }
  catch (e) { console.error('Sauvegarde impossible', e); return false; }
}
export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    G = JSON.parse(raw);
    if (!G.world.zmap) G.world.zmap = {}; // sauvegardes d'avant les zombies sur carte
    return G;
  } catch (e) { console.error('Chargement impossible', e); return null; }
}
export function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
export function clearSave() { localStorage.removeItem(SAVE_KEY); }

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
