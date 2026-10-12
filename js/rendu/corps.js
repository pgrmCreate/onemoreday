// ============ Outils partagés des corps vus de dessus (morts et vivants) ============
// Couleurs en tableaux [r, g, b], cache de sprites peints une fois (mesuré en pixels, peu de peinture par image),
// ombre douce posée vers le bas-droite du monde, volume, taches, crasse, contour des épaules, bras à coude.
import { canvas, rgb, ellipse, clamp } from './outils.js';

export const PI = Math.PI, TAU = PI * 2;
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const mul = (a, f) => [Math.min(255, a[0] * f), Math.min(255, a[1] * f), Math.min(255, a[2] * f)];
export const css = (a, al = 1) => rgb(a, al);
export const choisir = (r, l) => l[Math.floor(r() * l.length) % l.length];
export const entre = (r, a, b) => a + (b - a) * r();

// Résolution des sprites (px de sprite par px du monde) : fixe pour l'appareil, pour ne jamais tout repeindre quand
// la caméra zoome. Un téléphone (écran dense) a des sprites plus fins.
export const RES = (() => { const d = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1; return clamp(Math.round(d * 1.3 * 2) / 2, 1.5, 3); })();

// ---------- Cache des sprites ----------
const sprites = new Map();          // cle → { cv, hx, hy, px }
// Le cache se mesure en pixels (≈ 4 octets chacun) : beaucoup de petites mains, quelques gros corps couchés.
const PX_MAX = 7e6;
let pxTotal = 0;
// Peindre un sprite coûte (surtout la première fois qu'il est posé) : on en peint peu par image, au prorata de leur
// taille — une horde qui surgit se « dessine » en une seconde au lieu de figer l'image.
let budget = 0, tBudget = 0;
export function peutPeindre(cout) {
  const t = performance.now();
  if (t - tBudget > 10) { tBudget = t; budget = 3; }
  if (budget <= 0) return false;
  budget -= cout; return true;
}
export function sprite(cle, hx, hy, peindre) {
  let s = sprites.get(cle);
  if (s) { sprites.delete(cle); sprites.set(cle, s); return s; }
  if (!peutPeindre(Math.max(0.2, hx * hy / 200))) return null;
  const cv = canvas(Math.ceil(2 * hx * RES), Math.ceil(2 * hy * RES));
  const c = cv.getContext('2d');
  c.setTransform(RES, 0, 0, RES, hx * RES, hy * RES);
  c.lineCap = 'round'; c.lineJoin = 'round';
  peindre(c);
  s = { cv, hx, hy, px: cv.width * cv.height };
  sprites.set(cle, s); pxTotal += s.px;
  while (pxTotal > PX_MAX && sprites.size > 1) { const k = sprites.keys().next().value; pxTotal -= sprites.get(k).px; sprites.delete(k); }
  return s;
}
export const poser = (c, s) => c.drawImage(s.cv, -s.hx, -s.hy, 2 * s.hx, 2 * s.hy);
// L'ombre douce (une seule, partagée) : on la tourne et l'étire selon le corps.
let ombreSpr = null;
export function ombre() {
  if (ombreSpr) return ombreSpr;
  const R = 2, W = 64, H = 48, cv = canvas(W * R, H * R), c = cv.getContext('2d');
  const g = c.createRadialGradient(W * R / 2, H * R / 2, 0, W * R / 2, H * R / 2, W * R / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.55, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.setTransform(1, 0, 0, H / W, 0, 0); c.fillStyle = g; c.fillRect(0, 0, W * R, W * R);
  ombreSpr = { cv, w: W, h: H };
  return ombreSpr;
}
export function dessinerOmbre(c, x, y, dir, lx, ly, k = 1) {
  const o = ombre();
  c.save(); c.translate(x + 3.5 * k, y + 4.5 * k); c.rotate(dir);
  c.drawImage(o.cv, -lx, -ly, 2 * lx, 2 * ly);
  c.restore();
}

// ---------- Petits outils de peinture ----------
// Une tache irrégulière (sang, crasse) : plusieurs disques mêlés.
export function tache(c, r, x, y, rad, coul, al, n = 5) {
  for (let k = 0; k < n; k++) {
    const a = r() * TAU, d = r() * rad * 0.6;
    c.fillStyle = css(coul, al * entre(r, 0.55, 1));
    ellipse(c, x + Math.cos(a) * d, y + Math.sin(a) * d, rad * entre(r, 0.35, 0.75), rad * entre(r, 0.3, 0.7), r() * PI); c.fill();
  }
}
// Volume vu de dessus : le haut (au centre) éclairé, les bords qui tombent dans l'ombre. path() trace la forme.
export function volume(c, path, cx, cy, R, clair = 0.13, sombre = 0.5) {
  c.save(); path(); c.clip();
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, R);
  g.addColorStop(0, `rgba(255,248,236,${clair})`); g.addColorStop(0.5, 'rgba(255,248,236,0)');
  g.addColorStop(0.78, `rgba(0,0,0,${sombre * 0.35})`); g.addColorStop(1, `rgba(0,0,0,${sombre})`);
  c.fillStyle = g; c.fillRect(cx - R * 1.6, cy - R * 1.6, R * 3.2, R * 3.2);
  c.restore();
}
// Saleté et usure dans une forme (à appeler clippé).
export function crasse(c, r, x0, y0, x1, y1, n, coul, al) {
  for (const f of [0.3, 0.6, 0.95]) {
    c.fillStyle = css(coul, al * f); c.beginPath();
    for (let k = 0; k < n / 3; k++) { const x = entre(r, x0, x1), y = entre(r, y0, y1), rr = entre(r, 0.25, 1.1); c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); }
    c.fill();
  }
}
// Des points (même couleur) d'un seul tracé.
export function points(c, liste, coul) { c.fillStyle = coul; c.beginPath(); for (const [x, y, rr] of liste) { c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); } c.fill(); }

// ---------- Le torse (debout) ----------
// Contour des épaules et du haut du corps vu de dessus : dos arrondi, pointes d'épaules, poitrine (et ventre du colosse).
export function contourTorse(c, car, ventre) {
  const SW = 12.3 * car, F = 6 * car, B = -6.6 * car;
  c.beginPath();
  c.moveTo(B, 0);
  c.bezierCurveTo(B, -SW * 0.6, -4.6 * car, -SW, -1.6 * car, -SW);
  c.bezierCurveTo(1.6 * car, -SW - 0.5, 4.6 * car, -SW + 0.9, 4.3 * car, -SW + 3.4 * car);
  c.bezierCurveTo(F, -SW * 0.5, F + ventre, -5 * car, F + ventre, 0);
  c.bezierCurveTo(F + ventre, 5 * car, F, SW * 0.5, 4.3 * car, SW - 3.4 * car);
  c.bezierCurveTo(4.6 * car, SW - 0.9, 1.6 * car, SW + 0.5, -1.6 * car, SW);
  c.bezierCurveTo(-4.6 * car, SW, B, SW * 0.6, B, 0);
  c.closePath();
}

// ---------- Le bras : épaule → coude → main ----------
// Deux segments L1, L2. Vu de dessus, un bras qui pend (main près de l'épaule) se RACCOURCIT au lieu de se plier en
// faisant saillir le coude : on raccourcit les segments quand la main est proche, le coude plie un peu, vers
// l'extérieur (côté s = ±1). → [ex, ey, hx, hy] (la main peut être ramenée à portée)
export function coude(sx, sy, hx, hy, L1, L2, s, plie = 1) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
  const dmax = (L1 + L2) * 0.98;
  if (d > dmax) { hx = sx + dx / d * dmax; hy = sy + dy / d * dmax; d = dmax; }
  d = Math.max(d, 1.5);
  const k = clamp(d * 1.12 / (L1 + L2), 0.3, 1);          // raccourci : le bras « pend » vers le sol
  const l1 = L1 * k, l2 = L2 * k;
  const a = Math.atan2(hy - sy, hx - sx);
  const cosB = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const b = Math.acos(cosB) * plie;
  return [sx + Math.cos(a + s * b) * l1, sy + Math.sin(a + s * b) * l1, hx, hy];
}
