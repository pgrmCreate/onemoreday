// ============ Quêtes — étape courante, objectif affiché ============
import { G, noteJournal } from '../core/state.js';
import { emit } from '../core/bus.js';
import { QUETES } from '../data/histoire/quetes.js';

export { QUETES };
export function etape(id) { return G && G.world.quetes[id] ? G.world.quetes[id].etape : null; }
export function avancer(id, et, { distant = false } = {}) {
  if (!G || !QUETES[id]) return;
  const q = G.world.quetes[id] || (G.world.quetes[id] = { etape: null, faite: false, depuis: G.world.minutes });
  if (q.etape === et) return;
  q.etape = et;
  q.depuis = G.world.minutes;
  if (et === 'fin') q.faite = true;
  const def = QUETES[id].etapes[et];
  if (def && def.objectif && !distant) noteJournal(`Objectif — ${def.objectif}`, 'objectif');
  emit('quete', { id, etape: et, distant });
}
// Quête principale active : la dernière principale non finie (ordre de déclaration).
export function principale() {
  if (!G) return null;
  let res = null;
  for (const [id, def] of Object.entries(QUETES)) {
    const q = G.world.quetes[id];
    if (def.principale && q && q.etape && !(q.faite && q.etape === 'fin' && !def.etapes.fin?.objectif)) res = id;
  }
  return res;
}
export function objectifCourant() {
  const id = principale(); if (!id) return null;
  const q = G.world.quetes[id]; const e = QUETES[id].etapes[q.etape];
  return e ? { quete: id, titre: QUETES[id].titre, etape: q.etape, objectif: e.objectif, lieu: e.lieu || null } : null;
}
