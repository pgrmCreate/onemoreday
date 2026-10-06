// ============ L'autorité — le monde partagé tenu par UNE machine (solo ou hôte) ============
// En solo, l'exploration crée elle-même sa sim (canal propriétaire). En CO-OP, l'hôte passe par ici :
//   - une sim par lieu OCCUPÉ, qui tourne à 10 Hz tant qu'au moins un joueur (hôte ou invité) y est ;
//   - chaque joueur a son canal (non propriétaire) sur la sim : l'hôte le sien, l'invité un canal « proxy »
//     piloté par les messages réseau (js/net/coop.js) ;
//   - les COMBATS se jouent DANS ces sims de lieu (temps réel, plus d'écran séparé) : partagés d'office.
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { getFlag } from '../core/state.js';
import { creerSimLieu } from '../explore/sim.js';
import { creerCanalLocal } from '../explore/canal_local.js';
import { presetDifficulte } from '../data/reglages.js';
import { lieu as lieuDe } from './donnees.js';
import { rueeSim } from './ruees.js';

// ---------- Lieux ----------
const sims = new Map(); // lieuId → { sim, runner, canaux: Map<joueurId, canal>, dernier }

function creerSim(lieuId, niveau, L) {
  const W = G.world;
  const etat = W.lieux[lieuId] && W.lieux[lieuId].etat;
  const diff = presetDifficulte(W.difficulte);
  return creerSimLieu({
    lieuId, niveau, etat, seed: W.seed, danger: L.danger ?? 0.3, pool: L.pool || niveau.pool,
    minutes: W.minutes, typeButin: L.typeButin || L.type || niveau.typeButin,
    mortsN: (L.morts && L.morts.n) || (niveau.morts && niveau.morts.n),
    repeuplement: L.repeuplement, coop: true, difficulte: diff, mult: L.abondance || 1,
    getFlag: (k) => getFlag(k),
    getRuee: () => rueeSim(lieuId),
  });
}

export function entreeLieu(lieuId, niveau, L = lieuDe(lieuId) || {}) {
  let e = sims.get(lieuId);
  if (!e) {
    const sim = creerSim(lieuId, niveau, L);
    e = { sim, canaux: new Map(), dernier: performance.now(), runner: null };
    // Le propriétaire est un canal fantôme : il fait tourner la sim et répartit les événements.
    e.runner = creerCanalLocal(sim, '__autorite', { proprietaire: true, hz: 20 });
    sims.set(lieuId, e);
  }
  return e;
}

// Canal d'un joueur sur un lieu. À la fermeture, la sim est sauvée et libérée si plus personne n'y est.
export function canalLieu(lieuId, niveau, L, joueurId) {
  const e = entreeLieu(lieuId, niveau, L);
  const ancien = e.canaux.get(joueurId);
  if (ancien) { try { ancien.fermer(); } catch (err) {} }
  const c = creerCanalLocal(e.sim, joueurId, { proprietaire: false });
  const fermer = c.fermer;
  c.fermer = () => {
    fermer();
    if (e.canaux.get(joueurId) === c) e.canaux.delete(joueurId);
    liberer(lieuId);
  };
  // Pause/reprise d'un joueur : sans effet sur le monde partagé (le temps ne s'arrête jamais à deux).
  c.pause = () => {}; c.reprise = () => {};
  e.canaux.set(joueurId, c);
  return c;
}
function liberer(lieuId) {
  const e = sims.get(lieuId);
  if (!e || e.canaux.size) return;
  sauverLieu(lieuId);
  try { e.runner.fermer(); } catch (err) {}
  sims.delete(lieuId);
}
export function sauverLieu(lieuId) {
  const e = sims.get(lieuId); if (!e || !G) return;
  const L = G.world.lieux[lieuId] || (G.world.lieux[lieuId] = {});
  L.etat = e.sim.sauver(G.world.minutes);
}
export function sauverTout() { for (const id of sims.keys()) sauverLieu(id); }
export function simDe(lieuId) { const e = sims.get(lieuId); return e ? e.sim : null; }
export function lieuxActifs() { return [...sims.keys()]; }
export function toutFermer() {
  for (const [id, e] of sims) { for (const c of e.canaux.values()) { try { c.fermer(); } catch (err) {} } try { e.runner.fermer(); } catch (err) {} sims.delete(id); }
}
