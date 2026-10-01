// ============ Entrées de l'exploration : clavier, souris, tactile (joystick + boutons) ============
// creerEntrees({ racine, canvas, actions }) → { etat, fermer(), setInteragir(libelle|null), setBouton(nom, { actif, libelle }), actif(bool) }
// etat : { mx, my (−1..1, vecteur de déplacement, norme = poussée), course, accroupi, viseeSouris (bool), sx, sy (souris écran) }
// actions : { interagir(), lampe(), inventaire(), carte(), echap(), zoom(facteur), accroupi(bool) }
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
    if (c === 'KeyE' || c === 'Space' || c === 'Enter') { e.preventDefault(); actions.interagir && actions.interagir(); }
    else if (c === 'KeyF') actions.lampe && actions.lampe();
    else if (c === 'KeyI') actions.inventaire && actions.inventaire();
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
  ecoute(canvas, 'mousedown', (e) => { if (e.button === 0 && !etat.tactile && actif) actions.interagir && actions.interagir({ souris: true, sx: e.clientX, sy: e.clientY }); });

  // ---------- Tactile ----------
  const zoneJoy = el('div', { class: 'ex-joyzone' });
  const joyBase = el('div', { class: 'ex-joy' }, el('div', { class: 'ex-joy-knob' }));
  zoneJoy.append(joyBase);
  const bInter = el('button', { class: 'ex-btn ex-btn-inter', type: 'button' }, el('span', { class: 'ex-btn-l' }, 'Interagir'));
  const bCourse = el('button', { class: 'ex-btn ex-btn-rond', type: 'button', 'aria-label': 'Courir' }, 'Courir');
  const bAccr = el('button', { class: 'ex-btn ex-btn-rond', type: 'button', 'aria-label': 'Accroupi' }, 'Accroupi');
  const bLampe = el('button', { class: 'ex-btn ex-btn-rond', type: 'button', 'aria-label': 'Lampe' }, 'Lampe');
  const bInv = el('button', { class: 'ex-btn ex-btn-rond ex-btn-petit', type: 'button', 'aria-label': 'Sac' }, 'Sac');
  const pad = el('div', { class: 'ex-pad' }, el('div', { class: 'ex-pad-ligne' }, bLampe), el('div', { class: 'ex-pad-ligne' }, bAccr, bCourse), bInter);
  racine.append(zoneJoy, pad);

  const joy = { id: null, ox: 0, oy: 0, R: 56 };
  let boutonCourse = false;
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
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
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
  presser(bInv, () => actions.inventaire && actions.inventaire()); relacher(bInv);
  for (const b of [bInter, bCourse, bAccr, bLampe, bInv]) ecoute(b, 'contextmenu', (e) => e.preventDefault());

  function majBoutons() {
    bAccr.classList.toggle('on', etat.accroupi);
    bCourse.classList.toggle('on', boutonCourse);
  }
  return {
    etat,
    setInteragir(libelle) {
      const l = bInter.firstChild;
      if (l.textContent !== (libelle || 'Interagir')) l.textContent = libelle || 'Interagir';
      bInter.classList.toggle('inactif', !libelle);
    },
    setBouton(nom, { actif: a, libelle } = {}) {
      const b = { lampe: bLampe, course: bCourse, accroupi: bAccr, sac: bInv }[nom]; if (!b) return;
      if (a != null) b.classList.toggle('on', !!a);
      if (libelle && b.textContent !== libelle) b.textContent = libelle;
    },
    setAccroupi(v) { etat.accroupi = !!v; majBoutons(); },
    actif(v) { actif = !!v; if (!actif) { bas.clear(); etat.mx = etat.my = 0; etat.course = false; boutonCourse = false; joy.id = null; joyBase.classList.remove('on'); } },
    fermer() { for (const f of off) f(); zoneJoy.remove(); pad.remove(); },
  };
}
