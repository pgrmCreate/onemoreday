// ============ Couche SOL : matières, transitions irrégulières, variations, occlusion au pied des murs, décals ============
// peindreSol(c, niv, E, x0, y0, x1, y1) — c est en coordonnées MONDE (1 case = TS px), déjà translaté.
import { TS, hash, bruit, cercle, ellipse, rr, rng } from './outils.js';
import { motif } from './textures.js';
import { K, SOLS, SOLS_IDS, MURS, MURS_IDS } from '../carte/catalogue.js';

const PRIO = SOLS_IDS.map(id => SOLS[id].prio ?? 5);
const EXT = SOLS_IDS.map(id => !!SOLS[id].ext);
const HERBE = new Set(['herbe', 'herbe_seche'].map(id => SOLS_IDS.indexOf(id)));

const estMurHaut = (E, i) => { const k = E.code[i]; if (k !== K.MUR) return false; const M = MURS[MURS_IDS[E.mur ? E.mur[i] : 1]] || {}; return !M.bas && !M.vide; };
const vide = (E, i) => E.code[i] === K.VIDE;

export function peindreSol(c, niv, E, x0, y0, x1, y1) {
  const w = E.w, h = E.h;
  const X0 = Math.max(0, x0 - 1), Y0 = Math.max(0, y0 - 1), X1 = Math.min(w - 1, x1 + 1), Y1 = Math.min(h - 1, y1 + 1);
  // 1) matières de base, par plages horizontales
  for (let y = Y0; y <= Y1; y++) {
    let x = X0;
    while (x <= X1) {
      const i = y * w + x;
      if (vide(E, i)) { x++; continue; }
      const m = E.sol[i]; let x2 = x;
      while (x2 + 1 <= X1 && !vide(E, y * w + x2 + 1) && E.sol[y * w + x2 + 1] === m) x2++;
      c.fillStyle = motif(c, m);
      c.fillRect(x * TS, y * TS, (x2 - x + 1) * TS, TS);
      x = x2 + 1;
    }
  }
  // 2) variations de grande échelle (salissures, zones plus claires) — aucune case ne ressemble à sa voisine
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x; if (vide(E, i)) continue;
    const v = bruit(x / 7, y / 7, 4096, 3) * 0.65 + bruit(x / 2.5, y / 2.5, 4096, 4) * 0.35 - 0.5;
    if (Math.abs(v) < 0.04) continue;
    c.fillStyle = v > 0 ? `rgba(0,0,0,${Math.min(0.28, v * 0.5)})` : `rgba(255,236,200,${Math.min(0.07, -v * 0.14)})`;
    c.fillRect(x * TS, y * TS, TS, TS);
  }
  // 3) transitions : la matière la plus « haute » déborde, bord irrégulier
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x; if (vide(E, i) || E.code[i] === K.MUR) continue;
    const m = E.sol[i];
    for (let d = 0; d < 4; d++) {
      const nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (vide(E, j) || E.code[j] === K.MUR) continue;
      const n = E.sol[j];
      if (n === m || PRIO[n] <= PRIO[m] || !(EXT[n] && EXT[m])) continue;
      bord(c, x, y, d, n);
    }
  }
  // 4) occlusion : ombre douce au pied des murs (plus forte côté haut-gauche, d'où vient la lumière)
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const i = y * w + x; if (vide(E, i) || E.code[i] === K.MUR) continue;
    const px = x * TS, py = y * TS;
    const mur = (dx, dy) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) return false; const j = ny * w + nx; return estMurHaut(E, j) || (E.code[j] === K.MEUBLE && E.opaque[j]); };
    const ao = (x0g, y0g, x1g, y1g, a, rx, ry, rw, rh) => { const g = c.createLinearGradient(x0g, y0g, x1g, y1g); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
    const L = TS * 0.46;
    if (mur(0, -1)) ao(px, py, px, py + L * 1.25, 0.62, px, py, TS, L * 1.25);   // le mur du haut a sa face avant : ombre de contact
    if (mur(-1, 0)) ao(px, py, px + L, py, 0.5, px, py, L, TS);
    if (mur(1, 0)) ao(px + TS, py, px + TS - L * 0.7, py, 0.3, px + TS - L * 0.7, py, L * 0.7, TS);
    if (mur(0, 1)) ao(px, py + TS, px, py + TS - L * 0.6, 0.26, px, py + TS - L * 0.6, TS, L * 0.6);
  }
  // 5) décals fixes (sang séché, feuilles, papiers…)
  const D = E.rendu ? E.rendu.decals : [];
  for (const dc of D) {
    if (dc.x < x0 - 2 || dc.x > x1 + 3 || dc.y < y0 - 2 || dc.y > y1 + 3) continue;
    dessinerDecal(c, dc);
  }
}

// Bord irrégulier de la matière n qui déborde sur la case (x, y) par le côté d (0 droite, 1 gauche, 2 bas, 3 haut).
function bord(c, x, y, d, n) {
  const px = x * TS, py = y * TS, S = TS;
  // points de profondeur le long du côté (bruit continu entre cases voisines : bord cohérent)
  const pts = [];
  const N = 5;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const gx = d < 2 ? (d === 0 ? x + 1 : x) : x + t, gy = d < 2 ? y + t : (d === 2 ? y + 1 : y);
    const prof = S * (0.12 + 0.3 * bruit(gx * 3.1, gy * 3.1, 4096, 7 + d % 2));
    pts.push([t, prof]);
  }
  c.save();
  c.beginPath();
  const P = (t, p) => {
    if (d === 0) return [px + S - p, py + t * S];
    if (d === 1) return [px + p, py + t * S];
    if (d === 2) return [px + t * S, py + S - p];
    return [px + t * S, py + p];
  };
  const [ax, ay] = P(0, 0); c.moveTo(ax, ay);
  for (const [t, p] of pts) { const [qx, qy] = P(t, p); c.lineTo(qx, qy); }
  const [bx, by] = P(1, 0); c.lineTo(bx, by); c.closePath();
  c.fillStyle = motif(c, n);
  c.fill();
  // ombre douce sous le bord (épaisseur de l'herbe, du gravier)
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1.6; c.beginPath();
  pts.forEach(([t, p], k) => { const [qx, qy] = P(t, p); if (k) c.lineTo(qx, qy); else c.moveTo(qx, qy); });
  c.stroke();
  c.restore();
  // brins d'herbe qui dépassent
  if (HERBE.has(n)) {
    c.lineWidth = 1; c.lineCap = 'round';
    const r = rng((x * 73856093) ^ (y * 19349663) ^ d);
    for (let k = 0; k < 9; k++) {
      const t = r(); const pi = Math.min(N - 1, Math.floor(t * N)); const p = pts[pi][1] + (pts[pi + 1][1] - pts[pi][1]) * (t * N - pi);
      const [qx, qy] = P(t, p);
      const l = 2 + r() * 4, a = (d === 0 ? Math.PI : d === 1 ? 0 : d === 2 ? -Math.PI / 2 : Math.PI / 2) + (r() - 0.5) * 1.4;
      c.strokeStyle = r() < 0.5 ? '#3e522a' : '#56703a';
      c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx + Math.cos(a) * l, qy + Math.sin(a) * l); c.stroke();
    }
  }
}

// ---------- Décals ----------
export function dessinerDecal(c, dc) {
  const x = dc.x * TS, y = dc.y * TS, R = (dc.r || 0.5) * TS, r = rng(Math.floor(dc.x * 1000 + dc.y * 7919) + (dc.s * 1e4 | 0));
  c.save();
  c.translate(x, y); c.rotate(dc.a || 0);
  switch (dc.type) {
    case 'sang': case 'flaque_sang': {
      const fort = dc.type === 'flaque_sang';
      c.fillStyle = fort ? 'rgba(52,6,8,0.85)' : 'rgba(70,8,10,0.7)';
      ellipse(c, 0, 0, R, R * 0.7); c.fill();
      for (let k = 0; k < (fort ? 7 : 10); k++) { const a = r() * 6.28, d = R * (0.8 + r() * 0.9), t = R * (0.06 + r() * 0.16); c.fillStyle = 'rgba(70,8,10,0.75)'; cercle(c, Math.cos(a) * d, Math.sin(a) * d * 0.75, t); c.fill(); }
      c.fillStyle = 'rgba(140,30,30,0.18)'; ellipse(c, -R * 0.2, -R * 0.2, R * 0.4, R * 0.25); c.fill();
      break;
    }
    case 'trainee_sang': {
      const L = (dc.l || 2) * TS;
      c.strokeStyle = 'rgba(60,6,8,0.72)'; c.lineCap = 'round';
      for (let k = 0; k < 3; k++) { c.lineWidth = R * (0.25 + r() * 0.3); c.beginPath(); c.moveTo(0, (r() - 0.5) * R * 0.6); c.bezierCurveTo(L * 0.33, (r() - 0.5) * R, L * 0.66, (r() - 0.5) * R, L, (r() - 0.5) * R * 0.6); c.stroke(); }
      break;
    }
    case 'feuilles': case 'aiguilles': {
      const n = dc.n || 9;
      for (let k = 0; k < n; k++) {
        const a = r() * 6.28, d = r() * R * 1.4;
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(r() * 6.28);
        if (dc.type === 'aiguilles') { c.strokeStyle = ['#6a5a32', '#5a4a26'][k % 2]; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.stroke(); }
        else { c.fillStyle = ['#7a5a26', '#8a6a2a', '#5a4a22', '#9a7032', '#6a3a1a'][Math.floor(r() * 5)]; ellipse(c, 0, 0, 3.6, 2); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-3.6, 0); c.lineTo(3.6, 0); c.stroke(); }
        c.restore();
      }
      break;
    }
    case 'fissure': {
      c.strokeStyle = 'rgba(10,9,8,0.6)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-R, 0);
      let px = -R, py = 0; for (let k = 0; k < 7; k++) { px += R * 2 / 7; py += (r() - 0.5) * R * 0.4; c.lineTo(px, py); } c.stroke();
      break;
    }
    case 'ordures': case 'papiers': {
      const n = dc.n || 6;
      for (let k = 0; k < n; k++) {
        const a = r() * 6.28, d = r() * R;
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(r() * 6.28);
        if (dc.type === 'papiers') { c.fillStyle = ['#c9c2ae', '#b8b09a', '#d8d2c0'][k % 3]; c.fillRect(-4, -3, 8, 6); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-3, -1.5, 6, 0.8); c.fillRect(-3, 0.5, 5, 0.8); }
        else { c.fillStyle = ['#3a4a5a', '#6a2a2a', '#c8c0a8', '#4a5a3a', '#2a2a2a'][Math.floor(r() * 5)]; rr(c, -3, -2.5, 6, 5, 1.5); c.fill(); }
        c.restore();
      }
      break;
    }
    case 'verre': {
      for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * R; c.fillStyle = `rgba(180,210,220,${0.3 + r() * 0.4})`; c.beginPath(); const sx = Math.cos(a) * d, sy = Math.sin(a) * d; c.moveTo(sx, sy); c.lineTo(sx + 3 * r(), sy + 2); c.lineTo(sx - 1, sy + 3 * r()); c.closePath(); c.fill(); }
      break;
    }
    case 'flaque': {
      c.fillStyle = 'rgba(20,30,36,0.55)'; ellipse(c, 0, 0, R, R * 0.6); c.fill();
      c.fillStyle = 'rgba(150,175,190,0.12)'; ellipse(c, -R * 0.25, -R * 0.15, R * 0.5, R * 0.18); c.fill();
      break;
    }
    case 'huile': { c.fillStyle = 'rgba(10,10,12,0.6)'; ellipse(c, 0, 0, R, R * 0.7); c.fill(); c.fillStyle = 'rgba(90,60,120,0.12)'; ellipse(c, R * 0.2, 0, R * 0.5, R * 0.3); c.fill(); break; }
    case 'mousse': { for (let k = 0; k < 12; k++) { const a = r() * 6.28, d = r() * R; c.fillStyle = `rgba(${50 + r() * 20},${70 + r() * 20},30,0.5)`; cercle(c, Math.cos(a) * d, Math.sin(a) * d, 2 + r() * 4); c.fill(); } break; }
    case 'cendres': { c.fillStyle = 'rgba(20,18,16,0.7)'; ellipse(c, 0, 0, R, R * 0.8); c.fill(); for (let k = 0; k < 18; k++) { c.fillStyle = `rgba(${90 + r() * 60},${86 + r() * 50},${80 + r() * 40},0.5)`; cercle(c, (r() - 0.5) * R * 1.4, (r() - 0.5) * R, 1 + r() * 1.5); c.fill(); } break; }
    case 'fleurs': {
      for (let k = 0; k < 5; k++) { const a = r() * 6.28, d = r() * R * 0.6; const col = ['#8a2a3a', '#c8b04a', '#d8d0c0', '#6a3a7a', '#a04a2a'][Math.floor(r() * 5)]; c.fillStyle = '#2a3a1a'; cercle(c, Math.cos(a) * d, Math.sin(a) * d, 3.2); c.fill(); c.fillStyle = col; cercle(c, Math.cos(a) * d, Math.sin(a) * d, 2.2); c.fill(); }
      break;
    }
    case 'bougies': {
      for (let k = 0; k < 4; k++) { const sx = (k - 1.5) * 5, sy = (k % 2) * 4; c.fillStyle = 'rgba(0,0,0,0.4)'; cercle(c, sx + 1, sy + 1, 2.4); c.fill(); c.fillStyle = '#d8ccb0'; cercle(c, sx, sy, 2.2); c.fill(); c.fillStyle = '#ffcf70'; cercle(c, sx, sy, 0.9); c.fill(); }
      break;
    }
    case 'marquage': { c.fillStyle = 'rgba(210,205,190,0.55)'; c.fillRect(-R, -2, R * 2, 4); break; }
    case 'passage_pieton': { c.fillStyle = 'rgba(210,205,190,0.5)'; for (let k = -2; k <= 2; k++) c.fillRect(k * TS * 0.4 - TS * 0.12, -R, TS * 0.24, R * 2); break; }
    case 'plaque_egout': { c.fillStyle = '#1e1e1f'; cercle(c, 0, 0, TS * 0.32); c.fill(); c.strokeStyle = 'rgba(120,120,120,0.35)'; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-TS * 0.25, k * 4); c.lineTo(TS * 0.25, k * 4); c.stroke(); } break; }
    case 'traces': { for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(40,6,8,0.55)'; ellipse(c, k * 9, (k % 2 ? 4 : -4), 3, 1.8); c.fill(); } break; }
    case 'gravillons': { for (let k = 0; k < 20; k++) { c.fillStyle = `rgba(${120 + r() * 40},${115 + r() * 40},${100 + r() * 30},0.8)`; cercle(c, (r() - 0.5) * R * 2, (r() - 0.5) * R * 2, 1 + r()); c.fill(); } break; }
    case 'herbes': { c.lineWidth = 1; for (let k = 0; k < 16; k++) { const sx = (r() - 0.5) * R * 2, sy = (r() - 0.5) * R; c.strokeStyle = r() < 0.5 ? '#3e522a' : '#5a743a'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (r() - 0.5) * 4, sy - 3 - r() * 5); c.stroke(); } break; }
    default: break;
  }
  c.restore();
}
void hash; void rr;
