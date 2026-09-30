// ============================================================================
//  COMBAT — canal local : fait tourner la simulation et relaie événements / fin
// ============================================================================
//   const canal = creerCanalCombat(sim, joueurId, { horloge: 'raf'|'intervalle' })
//   canal.action(a) → { ok, raison? }   canal.etat()   canal.resultat()
//   canal.on('evt', fn(e)) → off        canal.on('fin', fn(resultat)) → off
//   canal.demarrer() / canal.arreter() / canal.pause(bool)
// L'intégrateur fournira un canal DISTANT (invité) de même interface : l'hôte fait tourner
// la sim, envoie `combat:etat` (20 Hz) et `combat:evt`, l'invité envoie `combat:action`.
// ============================================================================
export function creerCanalCombat(sim, joueurId, { horloge = 'raf' } = {}) {
  const abonnes = { evt: new Set(), fin: new Set() };
  let actif = false, enPause = false, raf = 0, iv = 0, dernier = 0, finEnvoyee = false;
  const vus = new Set();   // garde-fou : un événement (numéro n) n'est relayé qu'une fois

  function diffuser(evts) {
    for (const e of evts) {
      if (vus.has(e.n)) continue;
      vus.add(e.n);
      for (const fn of [...abonnes.evt]) { try { fn(e); } catch (err) { console.error('[combat] evt', err); } }
    }
    if (sim.fini() && !finEnvoyee) {
      finEnvoyee = true;
      const r = sim.resultat(joueurId);
      for (const fn of [...abonnes.fin]) { try { fn(r); } catch (err) { console.error('[combat] fin', err); } }
      arreter();
    }
  }
  function avancer(dt) { if (!enPause) diffuser(sim.tick(dt)); }
  function boucleRaf(ts) {
    if (!actif) return;
    const dt = dernier ? Math.min(250, ts - dernier) : 16;
    dernier = ts;
    avancer(dt);
    raf = requestAnimationFrame(boucleRaf);
  }
  function demarrer() {
    if (actif) return;
    actif = true; dernier = 0;
    if (horloge === 'raf' && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(boucleRaf);
    else { let d = Date.now(); iv = setInterval(() => { const n = Date.now(); avancer(Math.min(250, n - d)); d = n; }, 50); }
    diffuser(sim.tick(0));
  }
  function arreter() {
    actif = false;
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    if (iv) clearInterval(iv);
    raf = iv = 0;
  }
  return {
    joueurId,
    action(a) { const r = sim.action(joueurId, a); diffuser(sim.tick(0)); return r; },
    etat: () => sim.etat(),
    resultat: () => sim.resultat(joueurId),
    on(evt, fn) { (abonnes[evt] || (abonnes[evt] = new Set())).add(fn); return () => abonnes[evt].delete(fn); },
    demarrer, arreter,
    pause(b) { enPause = !!b; dernier = 0; },
  };
}
