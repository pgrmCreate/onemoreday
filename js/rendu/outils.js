// ============ Outils de dessin partagés par le moteur de rendu ============
// Canvas hors écran, hasard déterministe, bruit continu (sans couture), couleurs, formes de base.

import { FIN } from '../carte/catalogue.js';
export const TS = 48;            // pixels par UNITÉ dans les calques pré-rendus (1 unité ≈ 0,8 m) : positions, objets, décals
export const TF = TS / FIN;      // pixels par PETITE case (grille fine : murs, sols, ouvertures)
export const CHUNK = 16;         // unités par côté de bloc pré-rendu

export function canvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, w | 0), Math.max(1, h | 0));
  const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c;
}

// ---------- Hasard ----------
export const hash = (x, y, k = 0) => {
  let h = (x * 374761393 + y * 668265263 + k * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export function rng(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function graine(s) { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------- Bruit de valeur périodique (textures sans couture) ----------
// bruit(x, y, periode, k) : x, y en « cases de réseau », periode = nb de cases de réseau avant répétition.
const fade = (t) => t * t * (3 - 2 * t);
export function bruit(x, y, per, k = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = fade(x - xi), fy = fade(y - yi);
  const m = (v) => ((v % per) + per) % per;
  const a = hash(m(xi), m(yi), k), b = hash(m(xi + 1), m(yi), k), c = hash(m(xi), m(yi + 1), k), d = hash(m(xi + 1), m(yi + 1), k);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
// fbm sur une texture de S pixels, octaves de base `base` cases de réseau sur S.
export function fbm(px, py, S, base = 4, oct = 4, k = 0) {
  let v = 0, amp = 0.5, tot = 0, n = base;
  for (let o = 0; o < oct; o++) { v += amp * bruit(px / S * n, py / S * n, n, k + o * 17); tot += amp; amp *= 0.5; n *= 2; }
  return v / tot;
}

// ---------- Couleurs ----------
export function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function rgb(c, a = 1) { return a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
export function teinte(h, f) { const c = typeof h === 'string' ? hex(h) : h; return rgb([Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)]); }
export function melange(a, b, t) { const A = typeof a === 'string' ? hex(a) : a, B = typeof b === 'string' ? hex(b) : b; return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }

// ---------- Formes ----------
export function rr(c, x, y, w, h, r) {
  w = Math.max(0, w); h = Math.max(0, h); r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}
export function ellipse(c, x, y, rx, ry, a = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), a, 0, Math.PI * 2); }
export function cercle(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); }
// Ombre douce portée (pré-rendu uniquement : shadowBlur coûte cher à 60 Hz).
export function avecOmbre(c, flou, dx, dy, alpha, fn) {
  c.save(); c.shadowColor = `rgba(0,0,0,${alpha})`; c.shadowBlur = flou; c.shadowOffsetX = dx; c.shadowOffsetY = dy; fn(); c.restore();
}
// Boîte en relief : face, arête claire en haut-gauche, arête sombre en bas-droite.
export function boite(c, x, y, w, h, coul, o = {}) {
  const r = o.r ?? 3;
  avecOmbre(c, o.flou ?? 7, o.dx ?? 3, o.dy ?? 4, o.ombre ?? 0.55, () => { c.fillStyle = coul; rr(c, x, y, w, h, r); c.fill(); });
  const g = c.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, `rgba(255,240,215,${o.clair ?? 0.16})`); g.addColorStop(1, 'rgba(0,0,0,0.16)');
  c.fillStyle = g; rr(c, x, y, w, h, r); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2; rr(c, x + 0.6, y + 0.6, w - 1.2, h - 1.2, r); c.stroke();
  c.strokeStyle = `rgba(255,240,215,${(o.clair ?? 0.16) * 0.9})`; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x + r, y + 1.6); c.lineTo(x + w - r, y + 1.6); c.stroke();
}
// Répète un dessin aux bords d'une texture périodique (S×S) pour qu'il « boucle ».
export function enBoucle(S, x, y, marge, fn) {
  fn(x, y);
  const gx = x < marge ? [S] : x > S - marge ? [-S] : [];
  const gy = y < marge ? [S] : y > S - marge ? [-S] : [];
  for (const dx of gx) fn(x + dx, y);
  for (const dy of gy) fn(x, y + dy);
  for (const dx of gx) for (const dy of gy) fn(x + dx, y + dy);
}
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const angDiff = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };
