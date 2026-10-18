// ============ Refuges — règles communes (sans DOM) ============
// Un même jugement pour le simulateur (morts, positions validées par l'hôte), le déplacement du joueur (chez chacun)
// et le sommeil : qu'est-ce qu'un refuge habité, une pièce protégée, un portail qu'on ne franchit pas en entrant.
//   condition(si, getFlag)                  { flag, pasFlag, flagEgal } (tableaux acceptés) ; absente = vraie
//   refugeHabite(niveau, getFlag)           le niveau a `refuge: { si }` et la condition tient
//   pieceProtegee(niveau, o)                o = { etage, x, y } dans une pièce sansMorts
//   porteAuSeuil(niveau, o)                 la porte dont o occupe une case, ou null
//   entreeRefusee(niveau, gardee, morts, a, b) → porte | null : passer de a (dehors) à b (seuil ou dedans) d'une porte
//                                           gardée à parvis, alors qu'un mort rôde devant ; gardee(p) dit si elle l'est
import { icase } from '../carte/catalogue.js';
import { K } from '../carte/catalogue.js';

const liste = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
export function condition(si, getFlag) {
  if (!si) return true;
  if (liste(si.flag).some(k => !getFlag(k))) return false;
  if (liste(si.pasFlag).some(k => !!getFlag(k))) return false;
  if (si.flagEgal && getFlag(si.flagEgal[0]) !== si.flagEgal[1]) return false;
  return true;
}
export const refugeHabite = (niveau, getFlag) => !!(niveau && niveau.refuge) && condition(niveau.refuge, getFlag);
const etageDe = (niveau, etage) => niveau.etages[niveau.etageIdx[etage]];
export function pieceProtegee(niveau, o) {
  const E = o && etageDe(niveau, o.etage); if (!E) return false;
  const i = icase(E, o.x, o.y), P = i >= 0 && E.piece[i] >= 0 ? niveau.pieces[E.piece[i]] : null;
  return !!(P && P.sansMorts);
}
export function porteAuSeuil(niveau, o) {
  const E = o && etageDe(niveau, o.etage); if (!E) return null;
  const i = icase(E, o.x, o.y);
  return i >= 0 && E.code[i] === K.PORTE ? niveau.portes[E.porte[i]] : null;
}
export function entreeRefusee(niveau, gardee, morts, a, b) {
  if (!a || !b || a.etage !== b.etage) return null;
  for (const p of niveau.portes) {
    if (!p.parvis || p.etage !== b.etage || !gardee(p)) continue;
    if (Math.hypot(b.x - p.x - 0.5, b.y - p.y - 0.5) > 2.5) continue;               // pas cette porte-là
    const dehors = !pieceProtegee(niveau, a) && porteAuSeuil(niveau, a) !== p;
    const entre = pieceProtegee(niveau, b) || porteAuSeuil(niveau, b) === p;
    if (!dehors || !entre) continue;
    if (morts.some(z => z.etage === p.etage && !(z.hp <= 0) && Math.hypot(z.x - p.x - 0.5, z.y - p.y - 0.5) < p.parvis)) return p;
  }
  return null;
}
