// ============ Canal local — la vue parle au monde uniquement par ici (REFONTE §12.3) ============
// creerCanalLocal(sim, joueurId, { proprietaire = true, hz = 10 }) :
//   propriétaire → fait tourner sim.tick à 20 Hz (setInterval) et diffuse les événements (le combat se joue ici).
//   Plusieurs canaux peuvent partager une même sim (co-op locale / tests) : un seul propriétaire.
// Interface (identique pour le futur canal distant de l'invité) :
//   majJoueur(patch), bruit(b), porte(cle, action) → Promise, fouiller(cle) → Promise, prendre(cle, i, qty?, id?) → Promise, contenu(cle) → Promise,
//   deposer(pos, item) → Promise, instantane(), pairs(), on(evt, fn) → off ;
//   construire(o), agirConstruction(uid, action, patch), ranger(cle, item), demonterMeuble(cle), puiserEau(cle, L),
//   ouvrirVoiture(cle, 'vitre' | 'forcer') → Promise
// Combat : action(a) → Promise ({ type: 'frapper'|'pousser'|'tirer'|'marteler', … }), faireApparaitre(liste, o) → Promise<uids>.
// Missions : appelerMorts(n, cible, { types }) → Promise<uids> (une vague qui marche vers cible = { etage, x, y }).
// Extensions : ajouterJoueur(pos, info), arreterFouille(progres), blesserZombie(uid, n), retirerZombies(uids, o),
//   repousserZombies(uids, depuis), pause(), reprise(), fermer(), niveau, joueurId, grilles(etage).
// Événements : 'porte', 'bruit', 'zombie', 'hurlement', 'charge', 'sol', 'conteneur', 'tick' + combat : 'telegraphe', 'attaque',
//   'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule'.
const canauxParSim = new WeakMap();

export function creerCanalLocal(sim, joueurId, { proprietaire = true, hz = 20 } = {}) {
  const ecouteurs = new Map();
  let timer = null, dernier = 0, enPause = false, ferme = false, facteur = 1, finFacteur = 0;
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
    if (facteur !== 1 && t > finFacteur) facteur = 1;
    const evts = sim.tick(dt * facteur);
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
    _recevoir(evts, avecTick = true) {
      for (const e of evts) diffuser(e.type, e);
      if (avecTick) diffuser('tick', { t: performance.now() });
    },
    hz,
    ajouterJoueur(pos, info) { if (!sim.joueur(joueurId)) sim.ajouterJoueur(joueurId, pos, info); else sim.majJoueur(joueurId, { ...pos, ...info }); },
    majJoueur(patch) { sim.majJoueur(joueurId, patch); },
    bruit(b) { sim.bruit({ source: joueurId, ...b }); },
    porte(cle, action) { return ok(sim.porte(cle, action, joueurId)); },
    fouiller(cle) { return ok(sim.fouiller(joueurId, cle)); },
    arreterFouille(progres) { sim.arreterFouille(joueurId, progres); },
    prendre(cle, i, qty, id) { return ok(sim.prendre(joueurId, cle, i, qty, id)); },
    contenu(cle) { return ok(sim.contenu(joueurId, cle)); },
    deposer(pos, item) { return ok(sim.deposer(joueurId, pos, item)); },
    // construction (js/data/construction.js)
    construire(o) { return this._act(() => sim.construire(joueurId, o)); },
    agirConstruction(uid, a, patch) { return this._act(() => sim.agirConstruction(joueurId, uid, a, patch)); },
    ranger(cle, item) { return this._act(() => sim.ranger(joueurId, cle, item)); },
    demonterMeuble(cle) { return this._act(() => sim.demonterMeuble(joueurId, cle)); },
    puiserEau(cle, L) { return this._act(() => sim.puiserEau(joueurId, cle, L)); },
    ouvrirVoiture(cle, mode) { return this._act(() => sim.ouvrirVoiture(joueurId, cle, mode)); },
    _act(f) { const r = f(); const evts = sim.viderEvenements(); if (evts.length) for (const c of liste) c._recevoir(evts, false); return ok(r); },
    action(a) {
      const r = sim.action(joueurId, a);
      const evts = sim.viderEvenements();     // livrés tout de suite : le coup se voit et s'entend sans attendre le pas
      if (evts.length) for (const c of liste) c._recevoir(evts, false);
      return ok(r);
    },
    faireApparaitre(l, o) { return ok(sim.faireApparaitre(l, { joueurId, ...(o || {}) })); },
    appelerMorts(n, cible, o) { return this._act(() => sim.appelerMorts(n, cible, o)); },   // vague de mission
    preparerMission(o) { return this._act(() => sim.preparerMission(o)); },                  // mise en scène d'une mission
    reveillerZone(o) { return this._act(() => sim.reveillerZone(o)); },                      // tout bascule (coffre, repéré·e)
    blesserZombie(uid, n) { return ok(sim.blesserZombie(uid, n)); },
    retirerZombies(uids, o) { sim.retirerZombies(uids, o); return ok(true); },
    repousserZombies(uids, depuis) { sim.repousserZombies(uids, depuis); return ok(true); },
    instantane() { return sim.instantane(); },
    pairs() {
      const snap = sim.instantane();
      return (snap.joueurs || []).filter(j => j.id !== joueurId);
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
    // ralenti du monde (solo) — f × la vitesse pendant ms
    echelle(f, ms) { if (!proprietaire) return; facteur = f; finFacteur = performance.now() + ms; },
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
