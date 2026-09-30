// ============ Données fusionnées — le point d'entrée unique pour lire le contenu ============
// Tous les modules lisent LIEUX / ITEMS / SCENES d'ici (jamais directement les fichiers partiels).
import { LIEUX_GEO, SALON_SUR_REGION } from '../data/lieux.js';
import { LIEUX_RECIT } from '../data/histoire/lieux_recit.js';
import { LIEUX_GAMEPLAY } from '../data/lieux_gameplay.js';
import { ITEMS as ITEMS_BASE } from '../data/items.js';
import { OBJETS_QUETE } from '../data/histoire/objets_quete.js';
import { CLOTHES } from '../data/clothing.js';
import { SCENES as SCENES_HISTOIRE } from '../data/histoire/scenes.js';
import { SCENES_RENCONTRES } from '../data/rencontres_scenes.js';
import { ZOMBIES } from '../data/zombies.js';

export { SALON_SUR_REGION, ZOMBIES, CLOTHES };

export const LIEUX = {};
for (const [id, geo] of Object.entries(LIEUX_GEO)) {
  LIEUX[id] = { id, ...geo, ...(LIEUX_GAMEPLAY[id] || {}), ...(LIEUX_RECIT[id] || {}) };
  if (!LIEUX[id].court) LIEUX[id].court = LIEUX[id].nom;
  if (LIEUX[id].niveau === undefined) LIEUX[id].niveau = id; // par convention : js/data/niveaux/<id>.js
}

export const ITEMS = { ...ITEMS_BASE, ...OBJETS_QUETE };
export const SCENES = { ...SCENES_RENCONTRES, ...SCENES_HISTOIRE };

export function lieu(id) { return LIEUX[id] || null; }
export function objet(id) { return ITEMS[id] || CLOTHES[id] || null; }
export function scene(id) { return SCENES[id] || null; }
export function mort(id) { return ZOMBIES[id] || null; }

// Plans d'exploration : chargés à la demande (import dynamique), mis en cache.
const cacheNiveaux = {};
export async function chargerNiveau(id) {
  if (cacheNiveaux[id]) return cacheNiveaux[id];
  try {
    const m = await import(`../data/niveaux/${id}.js`);
    return (cacheNiveaux[id] = m.default);
  } catch (e) {
    console.warn(`[niveaux] plan introuvable : ${id}`, e);
    return null;
  }
}
