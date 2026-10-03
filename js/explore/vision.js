// ============ Champ de vision (shadowcasting récursif sur la grille) et éclairage ============
// Tout est pré-alloué par étage : aucune allocation par image.
import { REGLAGES } from '../data/reglages.js';

const RL = REGLAGES.lumiere;
const OCT = [[1, 0, 0, -1, -1, 0, 0, 1], [0, 1, -1, 0, 0, -1, 1, 0], [0, 1, 1, 0, 0, -1, -1, 0], [1, 0, 0, 1, -1, 0, 0, -1]];

// Champ : buffers d'un étage. los = case en ligne de vue (stamp), vis = visibilité 0..1, lum = lumière 0..1,
// vu = mémoire (déjà vu), liste des cases en LOS.
export function creerChamp(E) {
  const n = E.w * E.h;
  return { w: E.w, h: E.h, los: new Uint32Array(n), stamp: 1, liste: new Int32Array(n), n: 0,
    vis: new Float32Array(n), lum: new Float32Array(n), vu: new Uint8Array(n),
    // LOS secondaire (lampe du coéquipier)
    los2: new Uint32Array(n), stamp2: 1 };
}

function marquer(C, X, Y, secondaire) {
  const i = Y * C.w + X;
  if (secondaire) { C.los2[i] = C.stamp2; return; }
  if (C.los[i] !== C.stamp) { C.los[i] = C.stamp; C.liste[C.n++] = i; }
}
function castLight(C, opaque, cx, cy, row, start, end, radius, xx, xy, yx, yy, sec) {
  if (start < end) return;
  const r2 = (radius + 0.5) * (radius + 0.5);
  const w = C.w, h = C.h;
  let newStart = 0;
  for (let j = row; j <= radius; j++) {
    let dx = -j - 1; const dy = -j;
    let blocked = false;
    while (dx <= 0) {
      dx++;
      const X = cx + dx * xx + dy * xy, Y = cy + dx * yx + dy * yy;
      const lSlope = (dx - 0.5) / (dy + 0.5), rSlope = (dx + 0.5) / (dy - 0.5);
      if (start < rSlope) continue;
      else if (end > lSlope) break;
      const dedans = X >= 0 && Y >= 0 && X < w && Y < h;
      if (dedans && dx * dx + dy * dy < r2) marquer(C, X, Y, sec);
      const op = !dedans || opaque[Y * w + X];
      if (blocked) {
        if (op) { newStart = rSlope; continue; }
        blocked = false; start = newStart;
      } else if (op && j < radius) {
        blocked = true;
        castLight(C, opaque, cx, cy, j + 1, start, lSlope, radius, xx, xy, yx, yy, sec);
        newStart = rSlope;
      }
    }
    if (blocked) break;
  }
}
// Calcule la ligne de vue depuis (ox, oy) jusqu'à R cases.
export function calculerLOS(C, opaque, ox, oy, R, secondaire = false) {
  const cx = Math.floor(ox), cy = Math.floor(oy);
  if (secondaire) C.stamp2++; else { C.stamp++; C.n = 0; }
  if (cx < 0 || cy < 0 || cx >= C.w || cy >= C.h) return;
  marquer(C, cx, cy, secondaire);
  for (let o = 0; o < 8; o++) castLight(C, opaque, cx, cy, 1, 1.0, 0.0, Math.ceil(R), OCT[0][o], OCT[1][o], OCT[2][o], OCT[3][o], secondaire);
}

// Contribution d'une lampe au point (x, y) : 0..~1,1, bord doux. L = { x, y, dir, forme, angle (deg), portee }.
export function lumiereLampe(L, x, y) {
  const dx = x - L.x, dy = y - L.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > L.portee + 0.5) return 0;
  const fd = Math.max(0, 1 - (d / (L.portee + 0.5)) ** 2);
  // halo court autour du porteur (toujours)
  const halo = d < 1.8 ? (1 - d / 1.8) * 0.55 : 0;
  if (L.forme === 'halo') return Math.max(halo, fd * 1.05);
  if (d < 0.35) return Math.max(halo, 0.9);
  let da = Math.atan2(dy, dx) - L.dir;
  da = Math.abs(((da + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
  const demi = (L.angle || 60) * Math.PI / 360;
  const bord = 0.22;
  const fa = da <= demi - bord ? 1 : da >= demi + bord * 0.6 ? 0 : 1 - (da - (demi - bord)) / (bord * 1.6);
  return Math.max(halo, fd * fa * 1.15);
}

// Portée de vue du joueur selon la lumière de la case regardée (continue entre les seuils).
export function porteeVision(l) {
  const V = RL.VISION_JOUEUR, S = RL.SEUILS;
  if (l < S.penombre) return V.noir + (V.penombre - V.noir) * (l / S.penombre);
  if (l < S.eclaire) return V.penombre + (V.eclaire - V.penombre) * ((l - S.penombre) / (S.eclaire - S.penombre));
  return V.eclaire;
}

// Remplit C.lum et C.vis pour les cases en LOS ; met à jour la mémoire C.vu.
// lampes : [{ x, y, dir, forme, angle, portee, sec: bool }] (sec = éclairée seulement si LOS secondaire).
export function calculerVision(C, E, jour, px, py, lampes, nLampes) {
  const w = C.w;
  for (let k = 0; k < C.n; k++) {
    const i = C.liste[k];
    const x = i % w + 0.5, y = ((i / w) | 0) + 0.5;
    let l = E.lumBase[i] * jour + (E.lumStat ? E.lumStat[i] * (1 - E.lumBase[i] * jour * 0.6) : 0);
    for (let q = 0; q < nLampes; q++) {
      const L = lampes[q];
      if (L.sec && C.los2[i] !== C.stamp2) continue;
      const c = lumiereLampe(L, x, y);
      if (c > 0) l = l + c * (1 - l * 0.5);
    }
    if (l > 1) l = 1;
    C.lum[i] = l;
    const d = Math.hypot(x - px, y - py);
    const R = porteeVision(l);
    let v = (R - d) / 1.2 + 0.5;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    C.vis[i] = v;
    if (v > 0.08) C.vu[i] = 1;
  }
}
export const estEnLOS = (C, i) => C.los[i] === C.stamp;
export const visibilite = (C, i) => (C.los[i] === C.stamp ? C.vis[i] : 0);
