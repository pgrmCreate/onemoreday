// ============ L'autorité — le monde partagé tenu par UNE machine (solo ou hôte) ============
// En solo, l'exploration crée elle-même sa sim (canal propriétaire). En CO-OP, l'hôte passe par ici :
//   - une sim par lieu OCCUPÉ, qui tourne à 10 Hz tant qu'au moins un joueur (hôte ou invité) y est ;
//   - chaque joueur a son canal (non propriétaire) sur la sim : l'hôte le sien, l'invité un canal « proxy »
//     piloté par les messages réseau (js/net/coop.js) ;
//   - les COMBATS sont simulés ici aussi (combat partagé, un seul pas de temps, N participants).
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { getFlag } from '../core/state.js';
import { creerSimLieu } from '../explore/sim.js';
import { creerCanalLocal } from '../explore/canal_local.js';
import { creerCombat } from '../combat/sim.js';
import { presetDifficulte } from '../data/reglages.js';
import { lieu as lieuDe } from './donnees.js';

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
  });
}

export function entreeLieu(lieuId, niveau, L = lieuDe(lieuId) || {}) {
  let e = sims.get(lieuId);
  if (!e) {
    const sim = creerSim(lieuId, niveau, L);
    e = { sim, canaux: new Map(), dernier: performance.now(), runner: null };
    // Le propriétaire est un canal fantôme : il fait tourner la sim et répartit les événements.
    e.runner = creerCanalLocal(sim, '__autorite', { proprietaire: true, hz: 10 });
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
  for (const c of combats.values()) c.arreter();
  combats.clear();
}

// ---------- Combats partagés ----------
// Un seul pas de temps (50 ms) pour tout le monde ; chaque participant a une « vue canal » :
//   { joueurId, action(a), etat(), resultat(), on('evt'|'fin'), demarrer(), arreter(), pause() }
const combats = new Map(); // id → combat

export function creerCombatPartage({ id, spec, participants, lieuId }) {
  const L = lieuId ? lieuDe(lieuId) : null;
  const zombies = (spec.zombies || ['errant']).map((z, i) => (typeof z === 'string' ? { uid: `${id}:${i}`, type: z } : { uid: z.uid || `${id}:${i}`, type: z.type, hp: z.hp }));
  const sim = creerCombat({
    id, lieuId: lieuId || null, seed: `${G.world.seed}:${id}`, participants, zombies,
    danger: spec.danger ?? (L ? L.danger : undefined), surprise: spec.surprise || 'normal',
    difficulte: presetDifficulte(G.world.difficulte), pool: spec.pool || null, tuto: !!spec.tuto,
  });
  const abonnes = new Map(); // joueurId → { evt:Set, fin:Set }
  const vus = new Set();
  let timer = null, fini = false, dernier = performance.now();
  const C = {
    id, sim, spec, lieuId, zombies,
    participants: () => sim.etat().joueurs ? sim.etat().joueurs.map(j => j.id) : participants.map(p => p.id),
    vue(joueurId) {
      const ab = abonnes.get(joueurId) || { evt: new Set(), fin: new Set() };
      abonnes.set(joueurId, ab);
      return {
        joueurId,
        action(a) { const r = sim.action(joueurId, a); pas(0); return r; },
        etat: () => sim.etat(),
        resultat: () => sim.resultat(joueurId),
        on(evt, fn) { (ab[evt] || (ab[evt] = new Set())).add(fn); return () => ab[evt].delete(fn); },
        demarrer() {}, arreter() {}, pause() {},
      };
    },
    ajouter(p) { sim.ajouterParticipant(p); pas(0); },
    arreter() { if (timer) clearInterval(timer); timer = null; combats.delete(id); },
    estFini: () => fini,
  };
  function diffuser(evts) {
    const frais = [];
    for (const e of evts) { if (e.n != null) { if (vus.has(e.n)) continue; vus.add(e.n); } frais.push(e); }
    if (frais.length) for (const ab of abonnes.values()) for (const e of frais) for (const fn of [...ab.evt]) { try { fn(e); } catch (err) { console.error(err); } }
    if (frais.length) emit('coop:combat:evts', { id, evts: frais });
    if (sim.fini() && !fini) {
      fini = true;
      for (const [jid, ab] of abonnes) { const r = sim.resultat(jid); for (const fn of [...ab.fin]) { try { fn(r); } catch (err) { console.error(err); } } }
      emit('coop:combat:fin', { id });
      C.arreter();
    }
  }
  function pas(dt) { diffuser(sim.tick(dt)); }
  timer = setInterval(() => { const t = performance.now(); const dt = Math.min(250, t - dernier); dernier = t; pas(dt); }, 50);
  combats.set(id, C);
  return C;
}
export function combatDe(id) { return combats.get(id) || null; }
export function combatsActifs() { return [...combats.values()]; }
