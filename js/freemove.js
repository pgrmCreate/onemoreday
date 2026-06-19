// ============ Déplacement LIBRE (échelle intérieur) : un rond qui glisse sur le plan ============
// La grille de cases reste la COUCHE TECHNIQUE (fouille, zombies, portes, événements, lumière
// continuent de marcher sur 'x,y'), mais le joueur a en plus une POSITION CONTINUE en pixels
// (G.world.fx/fy, dans l'espace de la carte). On en dérive la case courante à chaque pas.
//
// Ce module ne DESSINE pas la carte (c'est map.js qui fournit le contenu via `dessiner`) :
// il gère l'ENTRÉE (joystick tactile + flèches clavier), les COLLISIONS contre les murs
// reconstruits depuis la grille, la CAMÉRA à zone morte, et la boucle d'animation (rAF).
//
//   <svg id="fm-svg">                      ← cadre = fenêtre caméra (viewBox 0 0 vw vh)
//     <g id="fm-cam" transform="translate(-camX,-camY)">  ← le plan entier, qu'on fait glisser
//        …cases, murs, meubles, zombies…
//        <g id="fm-joueur" transform="translate(fx,fy)">… ← le rond, déplacé chaque frame
//
import { G } from './state.js';
import { carteCourante, caseDef, passagePossible, liaison } from './world.js';
import { autoDecor } from './art/prefabs.js';

// ---------- Réglages ----------
export const CS_LIBRE = 104;   // taille d'une case en pixels (plus grande qu'en mode tap : on bouge DEDANS)
const GAP_L = 0, PAD_L = 6;
export const RAYON = 9;        // rayon du rond joueur (collisions) — petit = moins de coincement, passages plus aisés
const VITESSE = 110;           // pixels / seconde à pleine poussée (réduit : marche posée, plus calme)
const DEAD = 0.30;             // zone morte caméra : fraction centrale de la fenêtre
const PORTE_GAP = 17;          // demi-ouverture d'une porte de pièce pour la collision
const CLOISON_GAP = 16;        // demi-ouverture d'une porte de cloison interne (salle de bain) — assez large pour entrer

// ---------- Layout d'un intérieur (mis en cache sur la carte) ----------
// Largeur par colonne (colW{x}) et hauteur par ligne (rowH{y}) en fraction de CS, comme le
// rendu en cases — on garde une grille pondérée (couloirs fins, paliers courts).
export function layoutInterieur(C) {
  if (C._fmLayout) return C._fmLayout;
  const colF = (x) => (C.colW && C.colW[x] != null) ? C.colW[x] : 1;
  const rowF = (y) => (C.rowH && C.rowH[y] != null) ? C.rowH[y] : 1;
  const cwA = [], chA = [], colX = [], rowY = [];
  let ax = PAD_L; for (let x = 0; x < C.largeur; x++) { cwA[x] = CS_LIBRE * colF(x); colX[x] = ax; ax += cwA[x] + GAP_L; }
  let ay = PAD_L; for (let y = 0; y < C.hauteur; y++) { chA[y] = CS_LIBRE * rowF(y); rowY[y] = ay; ay += chA[y] + GAP_L; }
  const W = ax - GAP_L + PAD_L, H = ay - GAP_L + PAD_L;
  return (C._fmLayout = { CS: CS_LIBRE, PAD: PAD_L, cwA, chA, colX, rowY, W, H });
}

// Case (x,y) qui contient le point pixel (fx,fy).
export function celluleEn(C, fx, fy) {
  const L = layoutInterieur(C);
  let x = 0; for (let i = 0; i < C.largeur; i++) { if (fx >= L.colX[i]) x = i; else break; }
  let y = 0; for (let i = 0; i < C.hauteur; i++) { if (fy >= L.rowY[i]) y = i; else break; }
  return { x, y };
}
// Centre pixel d'une case.
export function centreCellule(C, x, y) {
  const L = layoutInterieur(C);
  const cx = (L.colX[x] ?? L.PAD) + (L.cwA[x] ?? L.CS) / 2;
  const cy = (L.rowY[y] ?? L.PAD) + (L.chA[y] ?? L.CS) / 2;
  return { fx: cx, fy: cy };
}

// ---------- Murs : segments infranchissables reconstruits depuis la grille ----------
// Pour chaque case existante, ses 4 bords : mur plein si le voisin n'existe pas ou n'est pas
// franchissable ; sinon une ouverture centrale (porte/passage) qu'on laisse libre. Plus les
// cloisons internes (avec trou de porte) et les creux (rendus comme du vide → 4 bords pleins).
export function mursInterieur(C, carteId) {
  if (C._fmMurs && C._fmMursId === carteId) return C._fmMurs;
  const L = layoutInterieur(C);
  const segs = [];
  const add = (x1, y1, x2, y2) => segs.push({ x1, y1, x2, y2 });
  for (const pos of Object.keys(C.cases)) {
    const [x, y] = pos.split(',').map(Number);
    const cd = C.cases[pos];
    const px = L.colX[x], py = L.rowY[y], w = L.cwA[x], h = L.chA[y];
    if (px == null || py == null) continue;
    const sides = [
      { nx: x + 1, ny: y, x1: px + w, y1: py, x2: px + w, y2: py + h, vert: true },  // droite
      { nx: x - 1, ny: y, x1: px, y1: py, x2: px, y2: py + h, vert: true },          // gauche
      { nx: x, ny: y + 1, x1: px, y1: py + h, x2: px + w, y2: py + h, vert: false }, // bas
      { nx: x, ny: y - 1, x1: px, y1: py, x2: px + w, y2: py, vert: false },         // haut
    ];
    for (const s of sides) {
      const voisin = caseDef(carteId, s.nx, s.ny);
      if (voisin && passagePossible(carteId, x, y, s.nx, s.ny)) {
        // Passage TOTALEMENT ouvert (couloir qui continue, même plateau) : aucun mur sur ce bord.
        if (liaison(carteId, x, y, s.nx, s.ny) === 'ouvert') continue;
        // Porte : un mur percé d'une ouverture centrale (on vise l'embrasure pour passer).
        const mx = (s.x1 + s.x2) / 2, my = (s.y1 + s.y2) / 2;
        if (s.vert) { add(s.x1, s.y1, s.x1, my - PORTE_GAP); add(s.x1, my + PORTE_GAP, s.x1, s.y2); }
        else { add(s.x1, s.y1, mx - PORTE_GAP, s.y1); add(mx + PORTE_GAP, s.y1, s.x2, s.y1); }
        continue;
      }
      add(s.x1, s.y1, s.x2, s.y2); // mur plein
    }
    // Cloisons internes (cd.cloisons ou meublage auto), avec trou de porte. Le MOBILIER, lui, ne
    // bloque jamais : seuls les murs, cloisons et creux arrêtent.
    const auto = autoDecor(cd);
    const cloi = cd.cloisons || (auto && auto.cloisons) || null;
    if (cloi) for (const wl of cloi) {
      const x1 = px + wl.x1 * w, y1 = py + wl.y1 * h, x2 = px + wl.x2 * w, y2 = py + wl.y2 * h;
      if (wl.porte != null) {
        const t = Math.max(0, Math.min(1, wl.porte));
        const gx = x1 + (x2 - x1) * t, gy = y1 + (y2 - y1) * t;
        const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
        add(x1, y1, gx - ux * CLOISON_GAP, gy - uy * CLOISON_GAP); add(gx + ux * CLOISON_GAP, gy + uy * CLOISON_GAP, x2, y2);
      } else add(x1, y1, x2, y2);
    }
    // Creux = mur PLEIN épais (recoin, séparation large) : ses 4 bords bloquent.
    const creux = cd.creux || (auto && auto.creux) || null;
    if (creux) for (const r of creux) {
      const bx = px + (r.x || 0) * w, by = py + (r.y || 0) * h, bw = (r.w || 0) * w, bh = (r.h || 0) * h;
      add(bx, by, bx + bw, by); add(bx + bw, by, bx + bw, by + bh);
      add(bx + bw, by + bh, bx, by + bh); add(bx, by + bh, bx, by);
    }
  }
  C._fmMurs = segs; C._fmMursId = carteId;
  return segs;
}

function distPtSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}
function bloque(segs, fx, fy) {
  for (const s of segs) if (distPtSeg(fx, fy, s.x1, s.y1, s.x2, s.y2) < RAYON) return true;
  return false;
}
// Un cercle de rayon r en (fx,fy) touche-t-il un mur ? (réutilisé pour les morts, qui ont
// leur propre rayon, plus petit que celui du joueur.)
export function estBloque(C, carteId, fx, fy, r = RAYON) {
  const segs = mursInterieur(C, carteId);
  for (const s of segs) if (distPtSeg(fx, fy, s.x1, s.y1, s.x2, s.y2) < r) return true;
  return false;
}

// ---------- État du contrôleur ----------
let etat = null;
const touches = new Set();

export function freemoveActif() { return !!etat; }

// ---------- Entrée clavier ----------
function codeTouche(key) {
  key = key.toLowerCase();
  if (key === 'arrowup' || key === 'w' || key === 'z') return 'up';
  if (key === 'arrowdown' || key === 's') return 'down';
  if (key === 'arrowleft' || key === 'a' || key === 'q') return 'left';
  if (key === 'arrowright' || key === 'd') return 'right';
  return null;
}
function onKeyDown(e) {
  if (e.repeat) return;
  const t = codeTouche(e.key);
  if (!t) return;
  if (e.key.startsWith('Arrow')) e.preventDefault();
  touches.add(t);
}
function onKeyUp(e) {
  const t = codeTouche(e.key);
  if (t) touches.delete(t);
}

// ---------- Joystick tactile (flottant : il apparaît sous le doigt) ----------
const TACTILE = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(pointer: coarse)').matches : false;

function lireInput() {
  if (etat && etat.joy.actif && etat.joy.mag > 0.12) {
    return { dx: etat.joy.dx, dy: etat.joy.dy, mag: Math.min(1, etat.joy.mag) };
  }
  let dx = (touches.has('right') ? 1 : 0) - (touches.has('left') ? 1 : 0);
  let dy = (touches.has('down') ? 1 : 0) - (touches.has('up') ? 1 : 0);
  if (dx || dy) { const n = Math.hypot(dx, dy); return { dx: dx / n, dy: dy / n, mag: 1 }; }
  return { dx: 0, dy: 0, mag: 0 };
}

function montrerJoy(lx, ly) {
  const j = etat.joyEl; if (!j) return;
  j.style.left = lx + 'px'; j.style.top = ly + 'px';
  j.firstChild.style.transform = 'translate(-50%,-50%)';
  j.classList.add('on');
}
function bougerKnob(dx, dy) {
  const j = etat.joyEl; if (!j) return;
  j.firstChild.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}
function cacherJoy() { if (etat && etat.joyEl) etat.joyEl.classList.remove('on'); }

function onWrapDown(e) {
  if (!TACTILE || !etat) return;
  if (e.target.closest && e.target.closest('.carte-legende')) return; // boutons ? / œil
  const r = etat.wrap.getBoundingClientRect();
  const j = etat.joy;
  j.actif = true; j.id = e.pointerId; j.ox = e.clientX; j.oy = e.clientY; j.dx = 0; j.dy = 0; j.mag = 0;
  montrerJoy(e.clientX - r.left, e.clientY - r.top);
  try { etat.wrap.setPointerCapture(e.pointerId); } catch (_) {}
}
function onWrapMove(e) {
  const j = etat && etat.joy;
  if (!j || !j.actif || e.pointerId !== j.id) return;
  const dx = e.clientX - j.ox, dy = e.clientY - j.oy, max = 46, len = Math.hypot(dx, dy);
  const cl = Math.min(len, max);
  j.dx = len ? dx / len : 0; j.dy = len ? dy / len : 0; j.mag = cl / max;
  bougerKnob(j.dx * cl, j.dy * cl);
}
function onWrapUp(e) {
  const j = etat && etat.joy;
  if (!j || e.pointerId !== j.id) return;
  j.actif = false; j.dx = j.dy = j.mag = 0; cacherJoy();
}

// ---------- Déplacement (collisions axe par axe → glissement le long des murs) ----------
function avancer(dt) {
  const inp = lireInput();
  if (inp.mag <= 0.05) return false;
  const C = carteCourante();
  const L = layoutInterieur(C);
  const segs = mursInterieur(C, G.world.carte);
  const dist = VITESSE * inp.mag * dt;
  const steps = Math.max(1, Math.ceil(dist / (RAYON * 0.6)));
  const sd = dist / steps;
  let bougé = false;
  for (let i = 0; i < steps; i++) {
    const tx = G.world.fx + inp.dx * sd;
    if (!bloque(segs, tx, G.world.fy)) { G.world.fx = tx; bougé = true; }
    const ty = G.world.fy + inp.dy * sd;
    if (!bloque(segs, G.world.fx, ty)) { G.world.fy = ty; bougé = true; }
  }
  // Filet de sécurité : on reste dans le cadre de la carte
  G.world.fx = Math.max(RAYON, Math.min(L.W - RAYON, G.world.fx));
  G.world.fy = Math.max(RAYON, Math.min(L.H - RAYON, G.world.fy));
  return bougé;
}

// ---------- Caméra à zone morte ----------
function majCamera(svg, cam) {
  const vw = svg.clientWidth || svg.getBoundingClientRect().width;
  const vh = svg.clientHeight || svg.getBoundingClientRect().height;
  if (!vw || !vh) return;
  if (etat.vw !== vw || etat.vh !== vh) { svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`); etat.vw = vw; etat.vh = vh; }
  const L = layoutInterieur(carteCourante());
  const fx = G.world.fx, fy = G.world.fy;
  let camX = etat.camX, camY = etat.camY;
  const dzx = vw * DEAD, dzy = vh * DEAD;
  if (fx - camX < dzx) camX = fx - dzx;
  if (fx - camX > vw - dzx) camX = fx - (vw - dzx);
  if (fy - camY < dzy) camY = fy - dzy;
  if (fy - camY > vh - dzy) camY = fy - (vh - dzy);
  camX = L.W <= vw ? -(vw - L.W) / 2 : Math.max(0, Math.min(camX, L.W - vw));
  camY = L.H <= vh ? -(vh - L.H) / 2 : Math.max(0, Math.min(camY, L.H - vh));
  etat.camX = camX; etat.camY = camY;
  cam.setAttribute('transform', `translate(${(-camX).toFixed(2)},${(-camY).toFixed(2)})`);
}

// ---------- Boucle d'animation ----------
function frame(now) {
  if (!etat) return;
  // Boucle résiliente : une exception transitoire (rendu, DOM) ne doit JAMAIS figer le joueur —
  // on la signale et on continue la frame suivante.
  try {
    const svg = document.getElementById('fm-svg');
    if (!svg) { arreterFreemove(); return; }
    const cam = document.getElementById('fm-cam');
    const dt = Math.min(0.05, (now - (etat.last || now)) / 1000);
    etat.last = now;
    if (etat.actif()) {
      const ax = G.world.x, ay = G.world.y;
      const bougea = avancer(dt);
      if (bougea) {
        const C = carteCourante();
        const cell = celluleEn(C, G.world.fx, G.world.fy);
        if (cell.x !== ax || cell.y !== ay) {
          G.world.x = cell.x; G.world.y = cell.y;
          if (etat.onCellChange) etat.onCellChange(cell.x, cell.y, ax, ay);
        }
      }
      // Co-op : je diffuse ma position FINE pendant le glissement (~8×/s), plus une dernière
      // fois quand je m'arrête. Sans ça, le coéquipier me voit figé puis « téléporter » d'un coup.
      if (etat.onPos) {
        if (bougea) {
          etat.bougeait = true;
          etat.posAcc += dt;
          if (etat.posAcc >= 0.12) { etat.posAcc = 0; etat.onPos(); }
        } else if (etat.bougeait) {
          etat.bougeait = false; etat.posAcc = 0; etat.onPos();
        }
      }
      // Le monde « continu » respire chaque frame : déplacement fluide des morts, contact des ronds…
      if (etat.onFrame) etat.onFrame(dt);
    } else if (etat.joy.actif) { etat.joy.actif = false; etat.joy.mag = 0; cacherJoy(); }
    if (cam) majCamera(svg, cam);
    const pion = document.getElementById('fm-joueur');
    if (pion) pion.setAttribute('transform', `translate(${G.world.fx.toFixed(2)},${G.world.fy.toFixed(2)})`);
  } catch (e) {
    console.error('freemove frame', e);
  }
  if (etat) etat.raf = requestAnimationFrame(frame);
}

// ---------- Démarrage / arrêt ----------
// opts = { dessiner:()=>string (contenu de #fm-cam), onCellChange:(x,y,ax,ay), onFrame:(dt), onPos:(), actif:()=>bool }
export function demarrerFreemove(opts) {
  arreterFreemove();
  const C = carteCourante();
  if (!C || C.echelle !== 'interieur') return;
  const wrap = document.querySelector('.carte-wrap');
  const svg = document.getElementById('fm-svg');
  if (!wrap || !svg) return;

  // Synchronise la position continue avec la case logique (après un téléport / 1re fois).
  const snap = () => { const c = centreCellule(C, G.world.x, G.world.y); G.world.fx = c.fx; G.world.fy = c.fy; };
  if (G.world.fx == null || G.world.fy == null || isNaN(G.world.fx)) snap();
  else { const cell = celluleEn(C, G.world.fx, G.world.fy); if (cell.x !== G.world.x || cell.y !== G.world.y) snap(); }

  // Joystick flottant (tactile) dans le cadre de la carte
  let joyEl = null;
  if (TACTILE) {
    joyEl = document.createElement('div');
    joyEl.className = 'fm-joy';
    joyEl.innerHTML = '<div class="fm-joy-knob"></div>';
    wrap.appendChild(joyEl);
  }

  etat = {
    wrap, svg, joyEl,
    dessiner: opts.dessiner, onCellChange: opts.onCellChange, onFrame: opts.onFrame, onPos: opts.onPos, actif: opts.actif || (() => true),
    posAcc: 0, bougeait: false,
    camX: 0, camY: 0, vw: 0, vh: 0, last: 0,
    joy: { actif: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0, mag: 0 },
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  if (TACTILE) {
    wrap.addEventListener('pointerdown', onWrapDown);
    wrap.addEventListener('pointermove', onWrapMove);
    wrap.addEventListener('pointerup', onWrapUp);
    wrap.addEventListener('pointercancel', onWrapUp);
  }

  // Contenu initial + caméra placée AVANT le premier rendu (pas de saut visible).
  redessinerFreemove();
  const cam = document.getElementById('fm-cam');
  if (cam) { etat.camX = G.world.fx - svg.clientWidth / 2; etat.camY = G.world.fy - svg.clientHeight / 2; majCamera(svg, cam); }
  etat.raf = requestAnimationFrame(frame);
}

export function arreterFreemove() {
  if (!etat) return;
  if (etat.raf) cancelAnimationFrame(etat.raf);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  if (etat.wrap) {
    etat.wrap.removeEventListener('pointerdown', onWrapDown);
    etat.wrap.removeEventListener('pointermove', onWrapMove);
    etat.wrap.removeEventListener('pointerup', onWrapUp);
    etat.wrap.removeEventListener('pointercancel', onWrapUp);
  }
  if (etat.joyEl && etat.joyEl.parentNode) etat.joyEl.parentNode.removeChild(etat.joyEl);
  touches.clear();
  etat = null;
}

// Reconstruit le contenu de #fm-cam (cases/murs/zombies/rond) sans toucher caméra ni écouteurs.
export function redessinerFreemove() {
  if (!etat) return;
  const cam = document.getElementById('fm-cam');
  if (cam) cam.innerHTML = etat.dessiner();
}
