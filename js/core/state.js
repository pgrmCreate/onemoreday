// ============ L'état de la partie — G, sauvegarde, drapeaux, journal ============
// G.world : PARTAGÉ en co-op (tenu par l'hôte). G.player : PROPRE à chaque joueur.
import { emit } from './bus.js';
import { REGLAGES } from '../data/reglages.js';

export const VERSION = 3;
const CLE = { solo: 'omd_v3_solo', hote: 'omd_v3_hote', invite: 'omd_v3_invite' };
let cleActive = CLE.solo;
export let G = null;
export function setG(g) { G = g; }
export function utiliserCleSauvegarde(k) { cleActive = CLE[k] || k; }

export function joueurNeuf(nom = 'Sam', genre = 'm') {
  const S = REGLAGES.survie || {};
  return {
    nom, genre,                       // genre : 'm' | 'f' (accords {masculin|féminin})
    pv: S.PV_MAX || 100, pvMax: S.PV_MAX || 100,
    sta: S.STA_MAX || 100, staMax: S.STA_MAX || 100,
    faim: 80, soif: 70, fatigue: 85, // 100 = bien
    mal: 0,                           // contamination 0..100 (GAMEPLAY §5.4)
    skillXp: {},
    inventaire: [],
    equip: { arme: null, mainG: null, dos: null, tete: null, torse: 'tshirt', mains: null, jambes: 'jean', pieds: 'baskets', sac: null, ceinture: null, holster: null },
    accesRapide: [],
    blessures: [],
    maladie: null,
    recettesApprises: [],
    position: { mode: 'titre' },
    stats: { morts: 0, joursSurvecus: 0, distance: 0, fouilles: 0 },
  };
}

export function nouvellePartie({ nom = 'Sam', genre = 'm', mode = 'solo', seed } = {}) {
  G = {
    v: VERSION, mode, cree: Date.now(),
    world: {
      seed: seed ?? Math.floor(Math.random() * 1e9),
      minutes: (REGLAGES.temps && REGLAGES.temps.DEPART_MINUTES) || 480,
      flags: {}, lieux: {}, quetes: {}, declencheurs: {},
      brouillard: true, carteVue: {},   // la carte se découvre petit à petit (js/travel/geo.js)
    },
    player: joueurNeuf(nom, genre),
    journal: [], documents: [], carteNotes: {},
  };
  utiliserCleSauvegarde(mode);
  return G;
}

// Crochets appelés juste avant chaque sauvegarde (ex. l'exploration y range l'état du lieu courant).
const avantSauver = new Set();
export function avantSauvegarde(fn) { avantSauver.add(fn); return () => avantSauver.delete(fn); }
export function sauver() {
  if (!G) return false;
  for (const fn of avantSauver) { try { fn(); } catch (e) { console.warn('[sauvegarde]', e); } }
  try { localStorage.setItem(cleActive, JSON.stringify(G)); return true; }
  catch (e) { console.error('Sauvegarde impossible', e); return false; }
}
export function charger(mode = 'solo') {
  utiliserCleSauvegarde(mode);
  try {
    const raw = localStorage.getItem(cleActive);
    if (!raw) return null;
    const g = JSON.parse(raw);
    if (!g || g.v !== VERSION) return null;
    G = g;
    return G;
  } catch (e) { console.error('Chargement impossible', e); return null; }
}
export function aSauvegarde(mode = 'solo') {
  try { const r = localStorage.getItem(CLE[mode] || mode); return !!r && JSON.parse(r).v === VERSION; } catch (e) { return false; }
}
export function effacerSauvegarde(mode) { try { localStorage.removeItem(mode ? (CLE[mode] || mode) : cleActive); } catch (e) {} }

// ---------- Drapeaux (monde partagé) ----------
export function getFlag(k) { return G ? G.world.flags[k] : undefined; }
export function setFlag(k, v = true, { distant = false } = {}) {
  if (!G) return;
  if (G.world.flags[k] === v) return;
  G.world.flags[k] = v;
  emit('flag', { k, v, distant });
}
export function retirerFlag(k) { if (G && k in G.world.flags) { delete G.world.flags[k]; emit('flag', { k, v: undefined }); } }

// ---------- Genre : « Tu es {seul|seule} » ----------
export function genrer(texte) {
  if (!texte || texte.indexOf('{') < 0) return texte;
  if (texte.indexOf('{coequipier}') >= 0) texte = texte.replace(/{coequipier}/g, (G && G.pairNom) || 'ton coéquipier');
  const f = G && G.player && G.player.genre === 'f';
  return texte.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, fe) => (f ? fe : m));
}

// ---------- Journal ----------
export function noteJournal(texte, type = 'recit') {
  if (!G) return;
  const e = { m: G.world.minutes, texte: genrer(texte), type };
  G.journal.push(e);
  if (G.journal.length > 400) G.journal.splice(0, G.journal.length - 400);
  emit('journal', e);
}
