// ============ Entrées de l'exploration : clavier, souris, tactile (joystick + boutons) ============
// creerEntrees({ racine, canvas, actions }) → { etat, fermer(), setInteragir(libelle|null), setBouton(nom, { actif, libelle }), actif(bool) }
// etat : { mx, my (−1..1, vecteur de déplacement, norme = poussée), course, accroupi, viseeSouris (bool), sx, sy (souris écran) }
// actions : { interagir(), lampe(), inventaire(), carte(), echap(), zoom(facteur), accroupi(bool),
//             frapper(appui: bool), pousser(), recharger(), echangerMains(), dos(), rapide(i),
//             secondaire() (G / petit rond : menu des autres actions), viser(sx, sy) (placement : un toucher place le fantôme) }
// COMBAT : se déplacer, FRAPPER (tape = coup rapide, enchaîner = enchaînement, maintenir = coup chargé), POUSSER. Pas d'esquive.
//   PC : ZQSD + souris (le personnage regarde la souris) ; clic gauche = frapper, clic droit / Espace = pousser
//        (arme à feu en main : clic droit maintenu = viser, clic gauche = tirer ; sans viser, clic gauche = crosse),
//        E = interagir, R = recharger, X = échanger les mains, B = dos ↔ main, 1-4 = accès rapide.
//   Tactile : joystick n'importe où ; gros bouton Frapper et Pousser à droite (visée assistée).
import { el } from '../core/util.js';

const TOUCHES = {
  haut: ['KeyW', 'KeyZ', 'ArrowUp'], bas: ['KeyS', 'ArrowDown'],
  gauche: ['KeyA', 'KeyQ', 'ArrowLeft'], droite: ['KeyD', 'ArrowRight'],
};

export function creerEntrees({ racine, canvas, actions }) {
  const etat = { mx: 0, my: 0, course: false, accroupi: false, viseeSouris: false, sx: 0, sy: 0, tactile: false };
  const bas = new Set();
  let actif = true;
  const off = [];
  const ecoute = (cible, evt, fn, o) => { cible.addEventListener(evt, fn, o); off.push(() => cible.removeEventListener(evt, fn, o)); };
  const tape = (e) => { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); };

  function majClavier() {
    let x = 0, y = 0;
    for (const c of TOUCHES.haut) if (bas.has(c)) y = -1;
    for (const c of TOUCHES.bas) if (bas.has(c)) y = 1;
    for (const c of TOUCHES.gauche) if (bas.has(c)) x = -1;
    for (const c of TOUCHES.droite) if (bas.has(c)) x = 1;
    if (joy.id == null) { const n = Math.hypot(x, y) || 1; etat.mx = x / n; etat.my = y / n; }
    etat.course = bas.has('ShiftLeft') || bas.has('ShiftRight') || boutonCourse;
  }
  ecoute(window, 'keydown', (e) => {
    if (!actif || tape(e)) return;
    const c = e.code;
    if (c === 'Tab') { e.preventDefault(); if (!e.repeat) actions.carte && actions.carte(); return; }
    if (e.repeat) { if (bas.has(c)) return; }
    bas.add(c);
    if (c === 'KeyE' || c === 'Enter') { e.preventDefault(); actions.interagir && actions.interagir(); }
    else if (c === 'Space') { e.preventDefault(); actions.pousser && actions.pousser(); }
    else if (c === 'KeyV') actions.pousser && actions.pousser();
    else if (c === 'KeyR') actions.recharger && actions.recharger();
    else if (c === 'KeyX') actions.echangerMains && actions.echangerMains();
    else if (c === 'KeyB') actions.dos && actions.dos();
    else if (/^Digit[1-9]$/.test(c)) actions.rapide && actions.rapide(+c.slice(5) - 1);
    else if (c === 'KeyF') actions.lampe && actions.lampe();
    else if (c === 'KeyG') actions.secondaire && actions.secondaire();
    else if (c === 'KeyO') actions.recherche && actions.recherche();
    else if (c === 'KeyP') actions.sol && actions.sol();
    else if (c === 'KeyT') actions.tourner && actions.tourner();
    else if (c === 'KeyI') actions.inventaire && actions.inventaire();
    else if (c === 'KeyH') actions.aide && actions.aide();
    else if (c === 'Escape') actions.echap && actions.echap();
    else if (c === 'KeyC' || c === 'ControlLeft' || c === 'ControlRight') { e.preventDefault(); etat.accroupi = !etat.accroupi; actions.accroupi && actions.accroupi(etat.accroupi); majBoutons(); }
    else if (c === 'Equal' || c === 'NumpadAdd') actions.zoom && actions.zoom(1.12);
    else if (c === 'Minus' || c === 'Digit6' || c === 'NumpadSubtract') actions.zoom && actions.zoom(1 / 1.12);
    if (c.startsWith('Arrow')) e.preventDefault();
    etat.tactile = false;
    majClavier();
  });
  ecoute(window, 'keyup', (e) => { bas.delete(e.code); majClavier(); });
  ecoute(window, 'blur', () => { bas.clear(); majClavier(); });

  // Souris : direction de la lampe, molette : zoom
  ecoute(canvas, 'mousemove', (e) => { if (etat.tactile) return; etat.viseeSouris = true; etat.sx = e.clientX; etat.sy = e.clientY; });
  ecoute(canvas, 'mouseleave', () => { etat.viseeSouris = false; });
  ecoute(canvas, 'wheel', (e) => { e.preventDefault(); if (!actif) return; actions.zoom && actions.zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1); }, { passive: false });
  // Souris : clic gauche = frapper (maintenir = charger), clic droit = pousser.
  let sourisFrappe = false, sourisVise = false;
  ecoute(canvas, 'mousedown', (e) => {
    if (etat.tactile || !actif) return;
    if (e.button === 0) { e.preventDefault(); sourisFrappe = true; actions.frapper && actions.frapper(true, false, 'pc'); }
    else if (e.button === 2) { e.preventDefault(); sourisVise = true; actions.clicDroit ? actions.clicDroit(true) : actions.pousser && actions.pousser(); }
  });
  ecoute(window, 'mouseup', (e) => {
    if (e.button === 0 && sourisFrappe) { sourisFrappe = false; actions.frapper && actions.frapper(false, false, 'pc'); }
    if (e.button === 2 && sourisVise) { sourisVise = false; actions.clicDroit && actions.clicDroit(false); }
  });
  ecoute(canvas, 'contextmenu', (e) => e.preventDefault());

  // ---------- Tactile ----------
  const zoneJoy = el('div', { class: 'ex-joyzone' });
  const joyBase = el('div', { class: 'ex-joy' }, el('div', { class: 'ex-joy-knob' }));
  zoneJoy.append(joyBase);
  const bInter = el('button', { class: 'ex-btn ex-btn-inter', type: 'button' }, el('span', { class: 'ex-btn-l' }, 'Interagir'));
  // Petites icônes discrètes (pas de texte) : courir, accroupi, lampe (cachée sans lampe).
  const SVG = {
    courir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.2" r="1.9" fill="currentColor" stroke="none"/><path d="M8.5 9.5 12 7.6l3 1.6 1.4 3 2.6.8"/><path d="M12 7.6 10.6 13l3.4 2.6-1 5.2"/><path d="M10.6 13 7.4 15.4 4.4 15"/></svg>',
    accroupi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="6.2" r="1.9" fill="currentColor" stroke="none"/><path d="M12.4 8.8 9 12.2l4.4 2.4-1.6 5"/><path d="M9 12.2 7.6 16.4 4.6 17"/><path d="M12 10.6l4 1.4"/><path d="M3 20.5h18" opacity=".45"/></svg>',
    loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="9" r="5.2"/><path d="m14 13 5.5 5.5"/><path d="M3 21.2h9" opacity=".45"/></svg>',
    sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20.5h18" opacity=".45"/><rect x="4" y="13" width="7" height="6" rx="1"/><path d="M14 19l2.2-6.5h3.2L21 19"/><path d="M7.5 13v-2.5M12 6.5l2 2 3.5-4" opacity=".75"/></svg>',
    lampe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="10" width="8" height="4.5" rx="1.2"/><path d="M10.5 9.2 13.5 8v8.5l-3-1.2z"/><path d="M15.5 9.5 21 7.5M15.5 12.2H21.5M15.5 15l5.5 2" opacity=".7"/></svg>',
  };
  const icone = (nom, label) => el('button', { class: 'ex-btn ex-btn-ico', type: 'button', 'aria-label': label, title: label, html: SVG[nom] });
  const bCourse = icone('courir', 'Courir (maintenir)'); bCourse.classList.add('ex-btn-courir');  // on court souvent : un peu plus grand
  const bAccr = icone('accroupi', 'S\'accroupir'); bAccr.classList.add('ex-btn-accr');          // un toucher de temps en temps : petit, collé en bas
  const bLampe = icone('lampe', 'Lampe');
  const bLoupe = icone('loupe', 'Chercher par terre (O)');
  // les objets par terre autour de soi (P) : grisé quand il n'y a rien, un petit nombre sinon
  const bSol = icone('sol', 'Objets au sol (P)'); bSol.classList.add('ex-btn-accr', 'ex-btn-sol', 'inactif'); bSol.append(el('em', {}, ''));
  const bInv = el('button', { class: 'cache', type: 'button' });
  // Combat : gros bouton Frapper (maintenir = charger), Pousser à côté.
  const SVG_F = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 15 9"/><path d="m13 7 4-4 4 4-4 4"/><path d="M6 15l3 3"/></svg>';
  const SVG_P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h9"/><path d="M12 6v12"/><path d="M15 7l5 5-5 5"/></svg>';
  const bFrapper = el('button', { class: 'ex-btn ex-btn-frapper', type: 'button', 'aria-label': 'Frapper (maintenir : coup chargé)' },
    el('span', { class: 'ex-frap-anneau' }), el('span', { class: 'ex-frap-ico', html: SVG_F }), el('span', { class: 'ex-frap-l' }, 'Frapper'));
  const bPousser = el('button', { class: 'ex-btn ex-btn-pousser', type: 'button', 'aria-label': 'Pousser' },
    el('span', { class: 'ex-frap-ico', html: SVG_P }), el('span', { class: 'ex-frap-l' }, 'Pousser'), el('i', { class: 'ex-cd' }));
  const bRecharger = el('button', { class: 'ex-btn ex-btn-petit ex-btn-recharger cache', type: 'button' }, 'Recharger');
  // arme à feu en main : le gros bouton TIRE, celui-ci frappe à la crosse
  const SVG_C = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h12l2-2h3v4l-6 1-2 7H8l1-6H3z"/><path d="M20 4l1.5-1.5M22 8h1.5" opacity=".7"/></svg>';
  const bCrosse = el('button', { class: 'ex-btn ex-btn-crosse cache', type: 'button', 'aria-label': 'Frapper à la crosse' },
    el('span', { class: 'ex-frap-ico', html: SVG_C }), el('span', { class: 'ex-frap-l' }, 'Frapper'));
  // autres actions possibles ici : un petit rond collé à Interagir déplie le menu (js/explore/interactions.js)
  const bAutres = el('button', { class: 'ex-btn ex-btn-autres cache', type: 'button', 'aria-label': 'Autres actions', title: 'Autres actions' },
    el('span', { class: 'ex-autres-p', html: '<i></i><i></i><i></i>' }), el('em', {}, ''));
  // mode placement (construction) : petits boutons au-dessus d'Interagir
  const bTourner = el('button', { class: 'ex-btn ex-btn-petit cache', type: 'button' }, 'Tourner');
  const bAnnuler = el('button', { class: 'ex-btn ex-btn-petit cache', type: 'button' }, 'Arrêter');
  // chercher par terre et s'accroupir : même importance, côte à côte en bas à gauche des boutons de combat
  bLoupe.classList.add('ex-btn-accr');
  const pad = el('div', { class: 'ex-pad' }, el('div', { class: 'ex-pad-ligne' }, bLampe, bCourse),
    el('div', { class: 'ex-pad-ligne ex-pad-place' }, bTourner, bAnnuler), el('div', { class: 'ex-pad-inter' }, bAutres, bInter),
    el('div', { class: 'ex-pad-combat' }, el('div', { class: 'ex-pad-bas' }, bSol, bLoupe, bAccr), el('div', { class: 'ex-pad-pile' }, bRecharger, bCrosse), bPousser, bFrapper));
  racine.append(zoneJoy, pad);

  const joy = { id: null, ox: 0, oy: 0, R: 56, t0: 0, sx: 0, sy: 0 };
  let boutonCourse = false, enPlacement = false;
  const pinch = { ids: new Map(), d0: 0 };
  function knob(dx, dy) { joyBase.firstChild.style.transform = `translate(${dx}px, ${dy}px)`; }
  ecoute(zoneJoy, 'pointerdown', (e) => {
    if (!actif || e.pointerType === 'mouse') return;
    etat.tactile = true; racine.classList.add('ex-tactile');
    if (joy.id != null) { // 2e doigt : pincement
      pinch.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
      return;
    }
    e.preventDefault();
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.t0 = performance.now();
    const r = zoneJoy.getBoundingClientRect();
    joyBase.style.left = (e.clientX - r.left) + 'px'; joyBase.style.top = (e.clientY - r.top) + 'px';
    joyBase.classList.add('on'); knob(0, 0);
    try { zoneJoy.setPointerCapture(e.pointerId); } catch (er) {}
  });
  ecoute(zoneJoy, 'pointermove', (e) => {
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
    const d = Math.hypot(dx, dy);
    if (d > joy.R) { dx *= joy.R / d; dy *= joy.R / d; }
    knob(dx, dy);
    const p = Math.min(1, d / joy.R);
    const mort = 0.12;
    const f = p < mort ? 0 : (p - mort) / (1 - mort);
    etat.mx = d ? (dx / Math.hypot(dx, dy)) * f : 0; etat.my = d ? (dy / Math.hypot(dx, dy)) * f : 0;
  });
  const finJoy = (e) => {
    pinch.ids.delete(e.pointerId);
    if (e.pointerId !== joy.id) return;
    // construction : un toucher bref (sans glisser) place le fantôme là où on a touché
    if (enPlacement && e.type === 'pointerup' && performance.now() - joy.t0 < 320 && Math.hypot(e.clientX - joy.ox, e.clientY - joy.oy) < 14) actions.viser && actions.viser(e.clientX, e.clientY);
    joy.id = null; etat.mx = 0; etat.my = 0; joyBase.classList.remove('on'); knob(0, 0);
  };
  ecoute(zoneJoy, 'pointerup', finJoy); ecoute(zoneJoy, 'pointercancel', finJoy);
  // pincement sur le canvas (hors joystick)
  ecoute(canvas, 'pointerdown', (e) => { if (e.pointerType !== 'touch') return; etat.tactile = true; racine.classList.add('ex-tactile'); pinch.ids.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pinch.ids.size === 2) { const [a, b] = [...pinch.ids.values()]; pinch.d0 = Math.hypot(a.x - b.x, a.y - b.y); } });
  ecoute(canvas, 'pointermove', (e) => {
    if (!pinch.ids.has(e.pointerId)) return;
    pinch.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.ids.size === 2 && pinch.d0 > 0) { const [a, b] = [...pinch.ids.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (Math.abs(d / pinch.d0 - 1) > 0.04) { actions.zoom && actions.zoom(d / pinch.d0); pinch.d0 = d; } }
  });
  const finPinch = (e) => { pinch.ids.delete(e.pointerId); if (pinch.ids.size < 2) pinch.d0 = 0; };
  ecoute(canvas, 'pointerup', finPinch); ecoute(canvas, 'pointercancel', finPinch);

  const presser = (b, fn) => ecoute(b, 'pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (!actif) return; b.classList.add('appui'); fn(e); });
  const relacher = (b, fn) => { const f = (e) => { b.classList.remove('appui'); fn && fn(e); }; ecoute(b, 'pointerup', f); ecoute(b, 'pointercancel', f); ecoute(b, 'pointerleave', f); };
  presser(bInter, () => actions.interagir && actions.interagir()); relacher(bInter);
  presser(bCourse, () => { boutonCourse = true; majClavier(); majBoutons(); }); relacher(bCourse, () => { boutonCourse = false; majClavier(); majBoutons(); });
  presser(bAccr, () => { etat.accroupi = !etat.accroupi; actions.accroupi && actions.accroupi(etat.accroupi); majBoutons(); }); relacher(bAccr);
  presser(bLampe, () => actions.lampe && actions.lampe()); relacher(bLampe);
  presser(bLoupe, () => actions.recherche && actions.recherche()); relacher(bLoupe);
  presser(bSol, () => { if (!bSol.classList.contains('inactif')) actions.sol && actions.sol(); }); relacher(bSol);
  presser(bInv, () => actions.inventaire && actions.inventaire()); relacher(bInv);
  let doigtFrappe = false;
  presser(bFrapper, () => { doigtFrappe = true; etat.tactile = true; actions.frapper && actions.frapper(true); });
  relacher(bFrapper, () => { if (!doigtFrappe) return; doigtFrappe = false; actions.frapper && actions.frapper(false); });
  presser(bPousser, () => { etat.tactile = true; actions.pousser && actions.pousser(); }); relacher(bPousser);
  presser(bRecharger, () => actions.recharger && actions.recharger()); relacher(bRecharger);
  let doigtCrosse = false;
  presser(bCrosse, () => { doigtCrosse = true; etat.tactile = true; actions.crosse && actions.crosse(true); });
  relacher(bCrosse, () => { if (!doigtCrosse) return; doigtCrosse = false; actions.crosse && actions.crosse(false); });
  presser(bAutres, () => actions.secondaire && actions.secondaire()); relacher(bAutres);
  presser(bTourner, () => actions.tourner && actions.tourner()); relacher(bTourner);
  presser(bAnnuler, () => actions.echap && actions.echap()); relacher(bAnnuler);
  for (const b of [bInter, bCourse, bAccr, bLampe, bLoupe, bSol, bInv, bFrapper, bPousser, bRecharger, bCrosse, bAutres, bTourner, bAnnuler]) ecoute(b, 'contextmenu', (e) => e.preventDefault());

  function majBoutons() {
    bAccr.classList.toggle('on', etat.accroupi);
    bCourse.classList.toggle('on', boutonCourse);
  }
  return {
    etat,
    // n autres actions possibles ici (0 = le petit rond disparaît)
    setAutres(n) {
      const t = n > 1 ? String(n) : ''; const em = bAutres.lastChild; if (em.textContent !== t) em.textContent = t;
      bAutres.classList.toggle('cache', !n);
    },
    // Mode placement (construction) : le gros bouton devient « Poser », Tourner et Arrêter apparaissent.
    setPlacement(on) {
      enPlacement = !!on;
      bTourner.classList.toggle('cache', !on); bAnnuler.classList.toggle('cache', !on);
      const l = bFrapper.lastChild; if (on && l.textContent !== 'Poser') l.textContent = 'Poser';
      bFrapper.classList.toggle('placement', !!on);
    },
    setInteragir(libelle) {
      const l = bInter.firstChild;
      if (l.textContent !== (libelle || 'Interagir')) l.textContent = libelle || 'Interagir';
      bInter.classList.toggle('inactif', !libelle);
    },
    setBouton(nom, { actif: a, libelle } = {}) {
      const b = { lampe: bLampe, course: bCourse, accroupi: bAccr, sac: bInv, recherche: bLoupe }[nom]; if (!b) return;
      if (a != null) b.classList.toggle('on', !!a);
      if (libelle && b !== bLampe && b !== bCourse && b !== bAccr && b !== bLoupe && b.textContent !== libelle) b.textContent = libelle;
    },
    setVisible(nom, v) { const b = { lampe: bLampe, course: bCourse, accroupi: bAccr, recharger: bRecharger, crosse: bCrosse }[nom]; if (b && b.classList.contains('cache') === !!v) b.classList.toggle('cache', !v); },
    // État du bouton Frapper : libellé (Frapper / Tirer / Dégage-toi), charge 0..1, menace proche, poussée en recharge.
    setCombat({ libelle, charge = 0, proche = false, pousseeCd = 0, empoigne = false, combo = -1 } = {}) {
      const l = bFrapper.lastChild; if (libelle && l.textContent !== libelle && !bFrapper.classList.contains('placement')) l.textContent = libelle;
      bFrapper.style.setProperty('--charge', charge.toFixed(3));
      bFrapper.classList.toggle('charge', charge > 0);
      bFrapper.classList.toggle('proche', !!proche);
      bFrapper.classList.toggle('empoigne', !!empoigne);
      bPousser.classList.toggle('empoigne', !!empoigne);
      bPousser.style.setProperty('--cd', Math.max(0, Math.min(1, pousseeCd)).toFixed(3));
      bPousser.classList.toggle('recharge', pousseeCd > 0.01);
      bPousser.classList.toggle('proche', !!proche);
      bFrapper.dataset.combo = combo >= 0 ? String(combo + 1) : '';
    },
    setAccroupi(v) { etat.accroupi = !!v; majBoutons(); },
    // n objets par terre à portée (0 = bouton grisé)
    setSol(n) {
      const t = n > 1 ? String(n) : ''; const em = bSol.lastChild; if (em.textContent !== t) em.textContent = t;
      if (bSol.classList.contains('inactif') !== !n) { bSol.classList.toggle('inactif', !n); bSol.setAttribute('aria-disabled', n ? 'false' : 'true'); }
    },
    actif(v) {
      actif = !!v;
      if (!actif) {
        bas.clear(); etat.mx = etat.my = 0; etat.course = false; boutonCourse = false; joy.id = null; joyBase.classList.remove('on');
        if (sourisFrappe || doigtFrappe) { sourisFrappe = doigtFrappe = false; actions.frapper && actions.frapper(false, true); }
        if (doigtCrosse) { doigtCrosse = false; actions.crosse && actions.crosse(false, true); }
        if (sourisVise) { sourisVise = false; actions.clicDroit && actions.clicDroit(false); }
      }
    },
    fermer() { for (const f of off) f(); zoneJoy.remove(); pad.remove(); },
  };
}
