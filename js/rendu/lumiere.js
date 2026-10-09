// ============ Lumière : masque d'obscurité coloré, sources fixes qui vacillent, halos ============
// Un petit ImageData (SUB×SUB échantillons par case) dit, pour chaque point de l'écran, à quel point il est
// sombre et de quelle couleur est la lumière qui l'atteint ; agrandi avec lissage → bords doux.
//   - non vu : noir ; déjà vu : gris « souvenir » ;
//   - vu : lumière ambiante (jour, fenêtres) + sources fixes (feux, néons, gyrophares, bougies) + lampes (torches).
import { TS, clamp, hash } from './outils.js';
import { lumiereLampe, boitesLampes, horsBoite } from '../explore/vision.js';
import { FIN, icase } from '../carte/catalogue.js';

// Échantillons par PETITE case (grille fine) : 1 suffit (2 par unité, comme avant la grille fine).
export const SUB = 1;

// Intensité d'une source animée à l'instant t (ms).
export function vacillement(src, t) {
  const ph = src.phase || 0;
  switch (src.anim) {
    case 'feu': return 0.78 + 0.13 * Math.sin(t / 83 + ph) + 0.07 * Math.sin(t / 31 + ph * 3) + 0.05 * (hash(Math.floor(t / 60), ph * 100 | 0) - 0.5);
    case 'bougie': return 0.86 + 0.08 * Math.sin(t / 140 + ph) + 0.05 * Math.sin(t / 47 + ph * 2);
    case 'neon': { const k = Math.floor(t / 70 + ph * 10); return hash(k, 7) < 0.035 ? 0.15 : hash(k >> 3, 9) < 0.02 ? 0.5 : 1; }
    case 'gyro': { const v = Math.max(0, Math.sin(t / 220 + ph)); return 0.15 + 0.85 * v * v; }
    default: return 1;
  }
}

// Ambiance colorée selon l'heure (0..24) : couleur de la lumière du jour et teinte de l'obscurité.
export function ambiance(h) {
  // [heure, lumière r,g,b, ombre r,g,b]
  const P = [[0, 0.5, 0.6, 1, 4, 6, 14], [5, 0.55, 0.6, 0.95, 4, 6, 13], [6.5, 1, 0.72, 0.6, 10, 6, 8], [8, 1, 0.95, 0.88, 6, 5, 5],
    [12, 1, 1, 0.97, 4, 4, 4], [17.5, 1, 0.93, 0.82, 5, 4, 4], [19.5, 1, 0.62, 0.42, 12, 5, 6], [21, 0.62, 0.62, 0.95, 6, 6, 14], [24, 0.5, 0.6, 1, 4, 6, 14]];
  let a = P[0], b = P[1];
  for (let k = 0; k < P.length - 1; k++) if (h >= P[k][0] && h <= P[k + 1][0]) { a = P[k]; b = P[k + 1]; break; }
  const f = (h - a[0]) / Math.max(1e-6, b[0] - a[0]);
  const m = (i) => a[i] + (b[i] - a[i]) * f;
  return { lr: m(1), lg: m(2), lb: m(3), or: m(4), og: m(5), ob: m(6) };
}

export function creerLumiere() {
  let buf = null, bw = 0, bh = 0;           // lumière fixe accumulée par case (vue courante)
  let masque = null, mctx = null, mdata = null, mw = 0, mh = 0;

  function assurer(cols, rows) {
    if (!buf || cols > bw || rows > bh) {
      bw = Math.max(cols, bw); bh = Math.max(rows, bh);
      buf = { r: new Float32Array(bw * bh), g: new Float32Array(bw * bh), b: new Float32Array(bw * bh), v: new Float32Array(bw * bh) };
    }
    if (!masque || cols * SUB > mw || rows * SUB > mh) {
      mw = Math.max(cols * SUB, mw); mh = Math.max(rows * SUB, mh);
      masque = document.createElement('canvas'); masque.width = mw; masque.height = mh;
      mctx = masque.getContext('2d');
      mdata = mctx.createImageData(mw, mh);
    }
  }

  // Sources fixes → buf (pour les cases de la fenêtre [rx0, ry0, cols, rows]). Renvoie la liste des sources visibles (halos).
  function accumuler(E, rx0, ry0, cols, rows, t, out) {
    buf.r.fill(0, 0, bw * bh); buf.g.fill(0, 0, bw * bh); buf.b.fill(0, 0, bw * bh);
    out.length = 0;
    const S = (E.rendu && E.rendu.sources) || [];
    const ux0 = rx0 / FIN, uy0 = ry0 / FIN, ux1 = (rx0 + cols) / FIN, uy1 = (ry0 + rows) / FIN;
    for (const src of S) {
      if (src.x + src.r < ux0 || src.x - src.r > ux1 || src.y + src.r < uy0 || src.y - src.r > uy1) continue;
      const f = Math.max(0, vacillement(src, t));
      src._f = f;
      out.push(src);
      const [cr, cg, cb] = src.coul;
      const cs = src.cases, vs = src.vals, w = E.w;
      for (let k = 0; k < cs.length; k++) {
        const i = cs[k], x = i % w - rx0, y = ((i / w) | 0) - ry0;
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const o = y * bw + x, v = vs[k] * f;
        buf.r[o] += v * cr; buf.g[o] += v * cg; buf.b[o] += v * cb;
      }
    }
    return out;
  }

  // Calcule et dessine le masque. S : { E, C, jour, heure, lampes, nLampes, t }, cam : { vx0, vy0, vx1, vy1 }, place(rx0, ry0, cols, rows) → dessin à l'écran.
  const visibles = [];
  function masquer(ctx, S, rx0, ry0, cols, rows, dessiner) {
    assurer(cols, rows);
    const E = S.E, C = S.C, jour = S.jour, lampes = S.lampes, nL = S.nLampes;
    const amb = S.amb || ambiance(12);
    accumuler(E, rx0, ry0, cols, rows, S.t, visibles);
    const d = mdata.data, stride = mw * 4;
    const souvenir = S.souvenir ?? 0.14;
    const B = boitesLampes(lampes, nL);
    // visibilité brute par petite case, puis adoucie vers l'intérieur (3 × 3 pondéré, jamais au-delà de la valeur brute :
    // aucune fuite derrière un mur) → les ombres portées perdent leurs marches d'escalier
    const vb = buf.v;
    for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
      const x = rx0 + cx, y = ry0 + cy;
      let v = 0;
      if (x >= 0 && y >= 0 && x < E.w && y < E.h) { const i = y * E.w + x; v = C.los[i] === C.stamp ? C.vis[i] : 0; }
      vb[cy * bw + cx] = v;
    }
    const lisse = (cx, cy) => {
      const o = cy * bw + cx, v0 = vb[o];
      if (v0 <= 0.01 || cx === 0 || cy === 0 || cx >= cols - 1 || cy >= rows - 1) return v0;
      const a = (4 * v0 + 2 * (vb[o - 1] + vb[o + 1] + vb[o - bw] + vb[o + bw]) + vb[o - bw - 1] + vb[o - bw + 1] + vb[o + bw - 1] + vb[o + bw + 1]) / 16;
      return a < v0 ? a : v0;
    };
    for (let cy = 0; cy < rows; cy++) {
      const y = ry0 + cy;
      for (let cx = 0; cx < cols; cx++) {
        const x = rx0 + cx;
        let vis = 0, vu = 0, base = 0, i = -1, sr = 0, sg = 0, sb = 0;
        if (x >= 0 && y >= 0 && x < E.w && y < E.h) {
          i = y * E.w + x;
          vis = lisse(cx, cy); vu = C.vu[i];
          base = E.lumBase[i] * jour;
          const o = cy * bw + cx; sr = buf.r[o]; sg = buf.g[o]; sb = buf.b[o];
        }
        for (let sy = 0; sy < SUB; sy++) for (let sx = 0; sx < SUB; sx++) {
          const o = (cy * SUB + sy) * stride + (cx * SUB + sx) * 4;
          if (vis > 0.01) {
            const px = (x + (sx + 0.5) / SUB) / FIN, py = (y + (sy + 0.5) / SUB) / FIN;
            let lp = 0;
            for (let q = 0; q < nL; q++) {
              const L = lampes[q];
              if (horsBoite(B, q, px, py) || (L.sec && C.los2[i] !== C.stamp2)) continue;
              const c = lumiereLampe(L, px, py);
              if (c > 0) lp = lp + c * (1 - lp * 0.5);
            }
            // on se voit toujours un peu soi-même (et ce qui nous touche) : petite lueur autour du joueur
            if (S.soi) { const dx = px - S.soi.x, dy = py - S.soi.y, d2 = dx * dx + dy * dy; if (d2 < 2.2) { const v = 0.32 * (1 - Math.sqrt(d2) / 1.48); if (v > lp) lp = v; } }
            const st = sr > sg ? (sr > sb ? sr : sb) : (sg > sb ? sg : sb);
            let l = base + st * (1 - base * 0.6) + lp * (1 - base * 0.5);
            if (l > 1) l = 1;
            let b = vis * (0.08 + 0.92 * Math.pow(l, 0.78));
            if (vu && b < souvenir) b = souvenir;
            // couleur de la lumière : seule la part « colorée » teinte (la lumière blanche ne voile pas)
            const cr = base * amb.lr * 0.35 + sr + lp * 1.0, cg = base * amb.lg * 0.35 + sg + lp * 0.86, cb = base * amb.lb * 0.35 + sb + lp * 0.62;
            const mx = cr > cg ? (cr > cb ? cr : cb) : (cg > cb ? cg : cb), mn = cr < cg ? (cr < cb ? cr : cb) : (cg < cb ? cg : cb);
            const k = mx > 1e-4 ? Math.min(1, mx) * 150 / mx : 0;
            d[o] = amb.or + (cr - mn) * k; d[o + 1] = amb.og + (cg - mn) * k; d[o + 2] = amb.ob + (cb - mn) * k;
            d[o + 3] = (1 - b) * 255;
          } else if (vu) { d[o] = 8; d[o + 1] = 9; d[o + 2] = 12; d[o + 3] = 226; }
          else { d[o] = 0; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 255; }
        }
      }
    }
    mctx.putImageData(mdata, 0, 0, 0, 0, cols * SUB, rows * SUB);
    dessiner(masque, cols * SUB, rows * SUB);
    return visibles;
  }

  // Halos additifs autour des sources vues (bloom léger, la flamme « éclaire » l'air).
  function halos(ctx, S, ex, ey, pxc) {
    const C = S.C, E = S.E;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const src of visibles) {
      const i = icase(E, src.x, src.y);
      if (i < 0 || C.los[i] !== C.stamp) continue;       // pas de halo à travers les murs
      const f = src._f ?? 1, R = Math.max(1, src.r * 0.85) * pxc;
      const X = ex(src.x), Y = ey(src.y);
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, R);
      const [r, gg, b] = src.coul;
      const fort = src.anim === 'gyro' || src.type === 'fusee' || src.anim === 'feu';
      const a = (fort ? 0.26 : 0.15) * f * (src.i || 1) * (1.15 - 0.5 * (S.jour ?? 1));   // la nuit, la couleur domine
      g.addColorStop(0, `rgba(${r * 255 | 0},${gg * 255 | 0},${b * 255 | 0},${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(X - R, Y - R, R * 2, R * 2);
    }
    ctx.restore();
  }

  return { masquer, halos, visibles: () => visibles, fermer() { masque = null; buf = null; } };
}
// Lumière fixe reçue en un point (pour la détection par les morts et l'interface), sans vacillement.
export function lumiereFixe(E, x, y) {
  const i = icase(E, x, y);
  if (!E.lumStat || i < 0) return 0;
  return E.lumStat[i];
}

void clamp; void TS;
