// ============ Bus d'événements — le seul lien entre modules qui ne se connaissent pas ============
const abonnes = new Map();
export function on(evt, fn) {
  if (!abonnes.has(evt)) abonnes.set(evt, new Set());
  abonnes.get(evt).add(fn);
  return () => off(evt, fn);
}
export function off(evt, fn) { const s = abonnes.get(evt); if (s) s.delete(fn); }
export function once(evt, fn) { const o = on(evt, (d) => { o(); fn(d); }); return o; }
export function emit(evt, data) {
  const s = abonnes.get(evt);
  if (!s) return;
  for (const fn of [...s]) { try { fn(data); } catch (e) { console.error(`[bus] ${evt}`, e); } }
}
