// ============ Cinématiques — aides d'animation partagées par les décors ============
// Conventions : les éléments animés sont des <g> dont la position de repos est dans data-* ; l'animation
// écrit un attribut transform ABSOLU (jamais cumulatif) calculé depuis t : on peut sauter dans le temps.
import { humain, membres, r1, OPTIONS_FORMES } from './lib.js';

// Passant (ou mort qui marche) : groupe positionné par l'animation, corps redessiné à chaque image (vraie foulée).
// o : options de lib.humain + { v (unités/s, signe = sens), L (largeur de la couche pour le bouclage), pose, freq, bob }
export function passant(x, y, h, o = {}) {
  const sens = o.v < 0 ? -1 : 1;
  const nomPose = o.pose || 'marche';
  const ph = o.ph ?? ((x * 0.013) % 1);
  const corps = humain(0, 0, h, nomPose, Object.assign({}, o, { sens, cls: 'h' }), ph);
  // les options qui ajoutent des parties (robe, manteau, cheveux, sac…) suivent le groupe pour l'animation
  const opts = OPTIONS_FORMES.filter(k => o[k]).map(k => (k === 'vent' ? `vent=${o.vent}` : k)).join(',');
  return `<g class="${o.cls || 'passant'}" data-x="${r1(x)}" data-y="${r1(y)}" data-h="${r1(h)}" data-v="${o.v || 0}" data-l="${o.L || 0}" data-pose="${nomPose}" data-ph="${r1(ph * 100) / 100}" data-f="${o.freq || 0}" data-s="${sens}" data-o="${opts}" transform="translate(${r1(x)},${r1(y)})">${corps}</g>`;
}

function donnees(el) {
  if (!el.__d) {
    const d = el.dataset;
    const o = {};
    for (const k of (d.o || '').split(',').filter(Boolean)) { const [n, v] = k.split('='); o[n] = v != null ? +v : 1; }
    const parties = {};
    const h = el.querySelector('.h');
    if (h) for (const p of h.children) if (p.dataset && p.dataset.k) parties[p.dataset.k] = p;
    el.__d = { x: +d.x, y: +d.y, h: +d.h, v: +d.v, L: +d.l, pose: d.pose, ph: +d.ph, f: +d.f, s: +d.s, o, parties };
  }
  return el.__d;
}
// Fait avancer tous les passants d'un sélecteur. k : multiplicateur de vitesse (ex. panique), membresVivants : redessine le corps.
// La cadence suit la vitesse (une foulée ≈ 0,6 × la taille) : les pieds glissent à peine sur le sol.
export function animerPassants(t, S, sel = '.passant', { k = 1, membresVivants = true, marge = 200 } = {}) {
  for (const el of S.q(sel)) {
    const d = donnees(el);
    const L = d.L || 4000;
    let x = d.x + d.v * k * t;
    const span = L + marge * 2;
    x = ((x + marge) % span + span) % span - marge;
    const freq = d.f || (Math.abs(d.v) * Math.max(0.6, Math.sqrt(k)) / (d.h * (d.pose === 'court' ? 1.1 : 0.6)) + 0.1);
    const phase = ((t * freq + d.ph) % 1 + 1) % 1;
    const course = d.pose === 'court';
    // le bassin descend déjà de lui-même quand les jambes s'écartent (le pied le plus bas touche le sol) ; en course, la phase d'envol
    const bob = course ? Math.max(0, Math.cos(phase * Math.PI * 4)) * 0.025 * d.h : 0;
    S.attr(el, 'transform', `translate(${r1(x)},${r1(d.y - bob)})`);
    // corps redessiné à chaque image pour les grands, une image sur deux pour les petits (la foule du fond)
    if (membresVivants && d.v !== 0 && d.h >= 90 && (d.h >= 400 || (d.n = (d.n || 0) + 1) % 2 === 0)) {
      const m = membres(0, 0, d.h, d.pose, phase, d.s, d.o);
      for (const cle in d.parties) if (m[cle]) d.parties[cle].setAttribute('d', m[cle]);
    }
  }
}
// Oscillation douce autour d'un pivot (data-x, data-y) : cloches, enseignes, branches.
export function balancer(t, S, sel, amp, freq, dephase = 0.7) {
  S.q(sel).forEach((el, i) => {
    const x = el.dataset.x || 0, y = el.dataset.y || 0;
    const a = Math.sin(t * freq * Math.PI * 2 + i * dephase) * amp;
    S.attr(el, 'transform', `rotate(${a.toFixed(2)} ${x} ${y})`);
  });
}
// Translation sinusoïdale (feuillages, linge, herbes).
export function onduler(t, S, sel, ax, ay, freq, dephase = 1.1) {
  S.q(sel).forEach((el, i) => {
    const dx = Math.sin(t * freq * 6.283 + i * dephase) * ax, dy = Math.cos(t * freq * 5.1 + i * dephase) * ay;
    S.attr(el, 'transform', `translate(${dx.toFixed(1)},${dy.toFixed(1)})`);
  });
}
// Scintillement (bougies, feux, néons) : opacité bruitée.
export function scintiller(t, S, sel, min = 0.6, max = 1, vit = 9) {
  S.q(sel).forEach((el, i) => {
    const n = 0.5 + 0.25 * Math.sin(t * vit + i * 2.3) + 0.25 * Math.sin(t * vit * 1.93 + i * 5.1);
    S.attr(el, 'opacity', (min + (max - min) * n).toFixed(2));
  });
}
// Défilement de tirets (eau qui coule, filets) : décale stroke-dashoffset.
export function couler(t, S, sel, vit = 60) {
  S.q(sel).forEach(el => S.attr(el, 'stroke-dashoffset', (-t * vit).toFixed(1)));
}
// Cisaillement du haut d'un élément (arbre qui ploie, flamme couchée) : skewX autour du pied.
export function ployer(t, S, sel, base, amp, freq, rafales = 0) {
  S.q(sel).forEach((el, i) => {
    const x = +(el.dataset.x || 0), y = +(el.dataset.y || 0);
    const r = rafales ? Math.max(0, Math.sin(t * 0.7 + i * 0.4)) * rafales : 0;
    const a = base + Math.sin(t * freq * 6.283 + i * 0.9) * amp + r;
    S.attr(el, 'transform', `translate(${x},${y}) skewX(${(-a).toFixed(2)}) translate(${-x},${-y})`);
  });
}
export const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
