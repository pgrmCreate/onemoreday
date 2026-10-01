// ============ Canal local — la vue parle au monde uniquement par ici (REFONTE §12.3) ============
// creerCanalLocal(sim, joueurId, { proprietaire = true, hz = 10 }) :
//   propriétaire → fait tourner sim.tick à 10 Hz (setInterval) et diffuse les événements.
//   Plusieurs canaux peuvent partager une même sim (co-op locale / tests) : un seul propriétaire.
// Interface (identique pour le futur canal distant de l'invité) :
//   majJoueur(patch), bruit(b), porte(cle, action) → Promise, fouiller(cle) → Promise, prendre(cle, i) → Promise,
//   deposer(pos, item) → Promise, instantane(), pairs(), on(evt, fn) → off
// Extensions : ajouterJoueur(pos, info), arreterFouille(progres), attaquer(uid) → Promise, blesserZombie(uid, n), retirerZombies(uids, o),
//   repousserZombies(uids, depuis), finCombat(), pause(), reprise(), fermer(), niveau, joueurId, grilles(etage).
// Événements : 'contact', 'renfort', 'porte', 'bruit', 'zombie', 'hurlement', 'charge', 'sol', 'conteneur', 'tick'.
const canauxParSim = new WeakMap();

export function creerCanalLocal(sim, joueurId, { proprietaire = true, hz = 10 } = {}) {
  const ecouteurs = new Map();
  let timer = null, dernier = 0, enPause = false, ferme = false;
  let liste = canauxParSim.get(sim);
  if (!liste) { liste = new Set(); canauxParSim.set(sim, liste); }

  function diffuser(evt, data) {
    const s = ecouteurs.get(evt);
    if (!s) return;
    for (const fn of [...s]) { try { fn(data); } catch (e) { console.error(`[canal] ${evt}`, e); } }
  }
  function boucle() {
    const t = performance.now();
    const dt = Math.min(500, t - dernier); dernier = t;
    if (enPause) return;
    const evts = sim.tick(dt);
    for (const c of liste) c._recevoir(evts);
  }
  function demarrer() {
    if (!proprietaire || timer || ferme) return;
    dernier = performance.now();
    timer = setInterval(boucle, Math.round(1000 / hz));
  }
  const ok = (v) => Promise.resolve(v);

  const canal = {
    joueurId, niveau: sim.niveau, local: true,
    _recevoir(evts) {
      for (const e of evts) diffuser(e.type, e);
      diffuser('tick', { t: performance.now() });
    },
    ajouterJoueur(pos, info) { if (!sim.joueur(joueurId)) sim.ajouterJoueur(joueurId, pos, info); else sim.majJoueur(joueurId, { ...pos, ...info }); },
    majJoueur(patch) { sim.majJoueur(joueurId, patch); },
    bruit(b) { sim.bruit({ source: joueurId, ...b }); },
    porte(cle, action) { return ok(sim.porte(cle, action, joueurId)); },
    fouiller(cle) { return ok(sim.fouiller(joueurId, cle)); },
    arreterFouille(progres) { sim.arreterFouille(joueurId, progres); },
    prendre(cle, i) { return ok(sim.prendre(joueurId, cle, i)); },
    deposer(pos, item) { return ok(sim.deposer(joueurId, pos, item)); },
    attaquer(uid) { return ok(sim.attaquer(joueurId, uid)); },
    blesserZombie(uid, n) { return ok(sim.blesserZombie(uid, n)); },
    retirerZombies(uids, o) { sim.retirerZombies(uids, o); return ok(true); },
    repousserZombies(uids, depuis) { sim.repousserZombies(uids, depuis); return ok(true); },
    finCombat() { sim.finCombat(joueurId); },
    instantane() { return sim.instantane(); },
    pairs() {
      return sim.joueurs().filter(j => j.id !== joueurId).map(j => ({ id: j.id, nom: j.nom, x: j.x, y: j.y, etage: j.etage, dir: j.dir, enCombat: j.enCombat, lampe: j.lampe, lampeSource: j.lampeSource, allure: j.allure }));
    },
    grilles(etage) { return sim.grilles(etage); },
    marquerJoue(i) { sim.marquerJoue(i); }, estJoue(i) { return sim.estJoue(i); },
    sauver(m) { return sim.sauver(m); },
    on(evt, fn) {
      if (!ecouteurs.has(evt)) ecouteurs.set(evt, new Set());
      ecouteurs.get(evt).add(fn);
      return () => { const s = ecouteurs.get(evt); if (s) s.delete(fn); };
    },
    pause() { enPause = true; },
    reprise() { if (enPause) { enPause = false; dernier = performance.now(); } },
    fermer() {
      ferme = true;
      if (timer) clearInterval(timer); timer = null;
      liste.delete(canal); ecouteurs.clear();
      sim.retirerJoueur(joueurId);
    },
  };
  liste.add(canal);
  demarrer();
  return canal;
}
