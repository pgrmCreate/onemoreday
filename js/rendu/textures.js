// ============ Textures procédurales sans couture (sols, dessus de murs, toits) ============
// Chaque texture couvre TEX = 6 cases (288 px) et boucle parfaitement : on la peint dans les blocs
// pré-rendus avec un décalage pris sur la position MONDE de la case → aucune répétition visible de case en case.
import { TS, canvas, rng, fbm, hash, hex, rgb, melange, rr, enBoucle, cercle, ellipse } from './outils.js';
import { SOLS_IDS } from '../carte/catalogue.js';

export const TEX = TS * 6;
const cache = new Map();

// Fond de bruit coloré : v = fbm → dégradé sombre → clair, + grain fin.
function fond(c, S, sombre, clair, { base = 4, oct = 4, gamma = 1, grain = 10, k = 1, taches = null } = {}) {
  const im = c.createImageData(S, S), d = im.data;
  const A = hex(sombre), B = hex(clair), T = taches ? hex(taches.coul) : null;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let v = fbm(x, y, S, base, oct, k);
    v = Math.pow(Math.min(1, Math.max(0, (v - 0.2) / 0.6)), gamma);
    let r = A[0] + (B[0] - A[0]) * v, g = A[1] + (B[1] - A[1]) * v, b = A[2] + (B[2] - A[2]) * v;
    if (T) { const t = fbm(x, y, S, taches.base || 3, 3, k + 50); if (t > taches.seuil) { const f = Math.min(1, (t - taches.seuil) * 6) * (taches.force || 0.5); r += (T[0] - r) * f; g += (T[1] - g) * f; b += (T[2] - b) * f; } }
    const n = (hash(x, y, k + 9) - 0.5) * grain;
    const o = (y * S + x) * 4;
    d[o] = r + n; d[o + 1] = g + n; d[o + 2] = b + n; d[o + 3] = 255;
  }
  c.putImageData(im, 0, 0);
}
function points(c, S, r, n, couls, tmin, tmax, alpha = 1) {
  c.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const x = r() * S, y = r() * S, t = tmin + r() * (tmax - tmin);
    c.fillStyle = couls[Math.floor(r() * couls.length)];
    enBoucle(S, x, y, t + 1, (X, Y) => { c.fillRect(X, Y, t, t); });
  }
  c.globalAlpha = 1;
}
function fissure(c, S, r, x, y, len, coul = 'rgba(0,0,0,0.4)', larg = 1) {
  c.strokeStyle = coul; c.lineWidth = larg; c.lineCap = 'round';
  enBoucle(S, x, y, len, (X, Y) => {
    c.beginPath(); c.moveTo(X, Y); let a = r() * 6.28, px = X, py = Y;
    const rr2 = rng(Math.floor(x * 13 + y * 7));
    for (let i = 0; i < 6; i++) { a += (rr2() - 0.5) * 1.3; px += Math.cos(a) * len / 6; py += Math.sin(a) * len / 6; c.lineTo(px, py); }
    c.stroke();
  });
}

// ---------- Sols ----------
const PEINTRES = {
  parquet(c, S, r) {
    fond(c, S, '#3b2617', '#6a4a2e', { base: 3, oct: 3, grain: 6, k: 11 });
    const lh = TS / 4;
    for (let y = 0; y < S; y += lh) {
      let x = -r() * TS * 2; const ligne = Math.floor(y / lh);
      while (x < S) {
        const L = TS * (1.6 + r() * 2.4);
        const f = 0.78 + r() * 0.42;
        c.fillStyle = `rgba(${90 * f | 0},${60 * f | 0},${36 * f | 0},0.55)`;
        enBoucle(S, x, y, L, (X, Y) => c.fillRect(X, Y, L, lh));
        c.strokeStyle = 'rgba(25,14,6,0.35)'; c.lineWidth = 0.8;
        for (let k = 0; k < 3; k++) { const yy = y + 1.5 + r() * (lh - 3); c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + L / 3, yy + r() * 2 - 1, x + 2 * L / 3, yy + r() * 2 - 1, x + L, yy); c.stroke(); }
        c.fillStyle = 'rgba(18,9,3,0.85)'; enBoucle(S, x, y, 4, (X, Y) => c.fillRect(X, Y, 1.4, lh));
        x += L;
      }
      c.fillStyle = 'rgba(18,9,3,0.9)'; c.fillRect(0, y, S, 1.2);
      c.fillStyle = 'rgba(255,220,170,0.05)'; c.fillRect(0, y + 1.2, S, 1);
      void ligne;
    }
  },
  planches(c, S, r) {
    fond(c, S, '#2f2318', '#5b4632', { base: 3, oct: 3, grain: 8, k: 12 });
    const lw = TS / 3;
    for (let x = 0; x < S; x += lw) {
      c.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.2})`; c.fillRect(x, 0, lw, S);
      c.fillStyle = 'rgba(10,6,2,0.85)'; c.fillRect(x, 0, 1.5, S);
      for (let k = 0; k < 4; k++) { const yy = r() * S; c.fillStyle = 'rgba(20,12,4,0.7)'; cercle(c, x + 4, yy, 1.1); c.fill(); cercle(c, x + lw - 4, yy, 1.1); c.fill(); }
    }
  },
  carrelage(c, S, r) {
    fond(c, S, '#4a4740', '#5a5650', { base: 4, oct: 2, grain: 4, k: 13 });
    const t = TS / 2;
    for (let y = 0; y < S; y += t) for (let x = 0; x < S; x += t) {
      const f = 0.9 + r() * 0.16;
      c.fillStyle = rgb([150 * f, 144 * f, 128 * f]); c.fillRect(x + 1.2, y + 1.2, t - 2.4, t - 2.4);
      const g = c.createLinearGradient(x, y, x + t, y + t); g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0.08)');
      c.fillStyle = g; c.fillRect(x + 1.2, y + 1.2, t - 2.4, t - 2.4);
      if (r() < 0.07) fissure(c, S, r, x + r() * t, y + r() * t, t * 0.7, 'rgba(40,36,30,0.5)');
    }
    // crasse dans les joints et en taches
    c.globalAlpha = 0.35; fond2(c, S, 'rgba(40,30,15,1)', 0.62, 21); c.globalAlpha = 1;
  },
  carrelage_damier(c, S, r) {
    fond(c, S, '#2a2826', '#36332f', { base: 4, oct: 2, grain: 4, k: 14 });
    const t = TS / 2;
    for (let y = 0; y < S; y += t) for (let x = 0; x < S; x += t) {
      const blanc = ((x + y) / t) % 2 === 0, f = 0.9 + r() * 0.12;
      c.fillStyle = blanc ? rgb([176 * f, 170 * f, 154 * f]) : rgb([38 * f, 36 * f, 34 * f]); c.fillRect(x + 1, y + 1, t - 2, t - 2);
    }
    c.globalAlpha = 0.3; fond2(c, S, 'rgba(40,30,15,1)', 0.6, 22); c.globalAlpha = 1;
  },
  marbre(c, S, r) {
    fond(c, S, '#8f8a80', '#b8b3a8', { base: 3, oct: 4, grain: 4, k: 15, gamma: 0.8 });
    for (let i = 0; i < 14; i++) fissure(c, S, r, r() * S, r() * S, 40 + r() * 70, 'rgba(70,68,62,0.28)', 1 + r());
    const t = TS;
    c.fillStyle = 'rgba(40,38,34,0.55)';
    for (let y = 0; y < S; y += t) c.fillRect(0, y, S, 1.2);
    for (let x = 0; x < S; x += t) c.fillRect(x, 0, 1.2, S);
  },
  moquette(c, S, r) {
    fond(c, S, '#3a1f22', '#5e3336', { base: 6, oct: 4, grain: 22, k: 16 });
    c.globalAlpha = 0.12; c.strokeStyle = '#000';
    for (let y = 0; y < S; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(S, y); c.stroke(); }
    c.globalAlpha = 1;
    points(c, S, r, 18, ['rgba(0,0,0,0.25)', 'rgba(70,40,20,0.2)'], 10, 26, 0.5);
  },
  beton(c, S, r) {
    fond(c, S, '#4d4b47', '#6e6b65', { base: 4, oct: 5, grain: 14, k: 17, taches: { coul: '#3a3732', seuil: 0.62, force: 0.5 } });
    for (let i = 0; i < 7; i++) fissure(c, S, r, r() * S, r() * S, 20 + r() * 40, 'rgba(20,18,16,0.5)');
    c.fillStyle = 'rgba(20,18,16,0.35)';
    for (let k = 0; k <= S; k += TS * 2) { c.fillRect(0, k, S, 1.2); c.fillRect(k, 0, 1.2, S); }
  },
  lino(c, S, r) {
    fond(c, S, '#555a4c', '#6c7260', { base: 3, oct: 3, grain: 10, k: 18 });
    points(c, S, r, 900, ['rgba(20,20,10,0.3)', 'rgba(230,230,200,0.12)'], 1, 2);
    c.fillStyle = 'rgba(20,22,16,0.4)';
    for (let k = 0; k < S; k += TS * 1.5) c.fillRect(k, 0, 1, S);
  },
  tomettes(c, S, r) {
    fond(c, S, '#2c1a12', '#3a2318', { base: 4, oct: 2, grain: 4, k: 19 });
    const R = TS / 4, hx = R * Math.sqrt(3);
    const rows = Math.round(S / (R * 1.5)), Ry = S / rows / 1.5, cols = Math.round(S / hx), Hx = S / cols;
    for (let row = -1; row <= rows; row++) {
      const y = row * Ry * 1.5;
      for (let col = -1; col <= cols; col++) {
        const x = col * Hx + (((row % 2) + 2) % 2 ? Hx / 2 : 0);
        const f = 0.78 + r() * 0.36;
        c.fillStyle = rgb([150 * f, 78 * f, 48 * f]);
        c.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * (Ry - 1), y + Math.sin(a) * (Ry - 1)); }
        c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,210,170,0.06)'; c.fill();
      }
    }
    points(c, S, r, 260, ['rgba(0,0,0,0.25)', 'rgba(255,200,160,0.06)'], 1, 3);
  },
  terre(c, S, r) {
    fond(c, S, '#33271b', '#5a4632', { base: 4, oct: 5, grain: 16, k: 20, taches: { coul: '#2a2016', seuil: 0.6, force: 0.6 } });
    points(c, S, r, 120, ['#6e665a', '#5a544c', '#7a7064'], 2, 4);
    c.strokeStyle = 'rgba(30,20,10,0.4)'; c.lineWidth = 1;
    for (let i = 0; i < 6; i++) fissure(c, S, r, r() * S, r() * S, 16 + r() * 20, 'rgba(25,18,10,0.45)');
  },
  boue(c, S, r) {
    fond(c, S, '#241b13', '#43342a', { base: 3, oct: 4, grain: 10, k: 21, gamma: 1.4 });
    for (let i = 0; i < 6; i++) { const x = r() * S, y = r() * S, rr2 = 8 + r() * 16; c.fillStyle = 'rgba(30,40,46,0.45)'; enBoucle(S, x, y, rr2, (X, Y) => { ellipse(c, X, Y, rr2, rr2 * 0.6, r()); c.fill(); }); c.fillStyle = 'rgba(160,180,190,0.08)'; enBoucle(S, x, y, rr2, (X, Y) => { ellipse(c, X - 2, Y - 2, rr2 * 0.5, rr2 * 0.2, 0.3); c.fill(); }); }
  },
  bitume(c, S, r) {
    fond(c, S, '#232325', '#3b3b3d', { base: 6, oct: 5, grain: 26, k: 22, taches: { coul: '#1a1a1c', seuil: 0.64, force: 0.55 } });
    points(c, S, r, 1400, ['#4c4c4e', '#1c1c1e', '#555556'], 1, 1.6, 0.7);
    for (let i = 0; i < 4; i++) fissure(c, S, r, r() * S, r() * S, 40 + r() * 60, 'rgba(8,8,9,0.6)', 1.3);
  },
  paves(c, S, r) {
    // pavés irréguliers (calade) : cellules de Voronoï arrondies, joints sombres, mousse dans les creux
    pierres(c, S, 12, [96, 91, 82], 0.32, 1.8, 23, [24, 23, 21]);
    c.globalAlpha = 0.45; fond2(c, S, 'rgba(46,58,28,1)', 0.7, 24); c.globalAlpha = 1;
  },
  dalles(c, S, r) {
    fond(c, S, '#7e7462', '#a09582', { base: 4, oct: 4, grain: 10, k: 25, taches: { coul: '#5e5648', seuil: 0.62, force: 0.5 } });
    c.fillStyle = 'rgba(40,34,26,0.7)';
    for (let y = 0; y < S; y += TS) { c.fillRect(0, y, S, 1.6); const dec = (y / TS) % 2 ? TS / 2 : 0; for (let x = dec; x < S; x += TS) c.fillRect(x, y, 1.6, TS); }
    for (let i = 0; i < 5; i++) fissure(c, S, r, r() * S, r() * S, 18 + r() * 24, 'rgba(50,44,34,0.5)');
  },
  trottoir(c, S, r) {
    fond(c, S, '#54524d', '#6d6a64', { base: 5, oct: 4, grain: 12, k: 26 });
    c.fillStyle = 'rgba(30,28,25,0.6)';
    for (let k = 0; k <= S; k += TS) { c.fillRect(0, k, S, 1.3); c.fillRect(k, 0, 1.3, S); }
    points(c, S, r, 14, ['rgba(20,18,15,0.25)'], 4, 10, 0.6);
  },
  herbe(c, S, r) {
    fond(c, S, '#202b17', '#3e5229', { base: 5, oct: 5, grain: 14, k: 27, taches: { coul: '#4a4426', seuil: 0.66, force: 0.45 } });
    c.lineWidth = 1; c.lineCap = 'round';
    const couls = ['#4a6234', '#2a381e', '#5a7440', '#384a26', '#63793f'];
    for (let i = 0; i < 1500; i++) {
      const x = r() * S, y = r() * S, l = 2.5 + r() * 5, dx = (r() - 0.5) * 3;
      c.strokeStyle = couls[Math.floor(r() * couls.length)];
      enBoucle(S, x, y, 8, (X, Y) => { c.beginPath(); c.moveTo(X, Y); c.lineTo(X + dx, Y - l); c.stroke(); });
    }
    // fleurs des champs, rares
    for (let i = 0; i < 16; i++) { const x = r() * S, y = r() * S; c.fillStyle = ['#c8b85a', '#b9b3a0', '#9a6a9a'][Math.floor(r() * 3)]; enBoucle(S, x, y, 3, (X, Y) => { cercle(c, X, Y, 1.2); c.fill(); }); }
  },
  herbe_seche(c, S, r) {
    fond(c, S, '#4a4128', '#776a42', { base: 5, oct: 5, grain: 14, k: 28 });
    c.lineWidth = 1;
    for (let i = 0; i < 1100; i++) { const x = r() * S, y = r() * S, l = 2 + r() * 5; c.strokeStyle = ['#8a7a4a', '#5a5030', '#9a8a58'][Math.floor(r() * 3)]; enBoucle(S, x, y, 8, (X, Y) => { c.beginPath(); c.moveTo(X, Y); c.lineTo(X + (r() - 0.5) * 3, Y - l); c.stroke(); }); }
    points(c, S, r, 60, ['#6a6050', '#7a7262'], 2, 3);
  },
  gravier(c, S, r) {
    fond(c, S, '#5a554b', '#7d776b', { base: 6, oct: 3, grain: 20, k: 29 });
    for (let i = 0; i < 1300; i++) {
      const x = r() * S, y = r() * S, t = 1.2 + r() * 2.2, f = 0.7 + r() * 0.6;
      const col = rgb([138 * f, 132 * f, 120 * f]);
      enBoucle(S, x, y, 4, (X, Y) => { c.fillStyle = 'rgba(20,18,14,0.45)'; ellipse(c, X + 0.6, Y + 0.8, t, t * 0.8); c.fill(); c.fillStyle = col; ellipse(c, X, Y, t, t * 0.8); c.fill(); });
    }
  },
  sable(c, S, r) {
    fond(c, S, '#8a7a5a', '#b4a27c', { base: 4, oct: 4, grain: 12, k: 30 });
    c.strokeStyle = 'rgba(90,76,50,0.18)'; c.lineWidth = 1.2;
    for (let y = 0; y < S; y += 9) { c.beginPath(); for (let x = 0; x <= S; x += 8) c.lineTo(x, y + Math.sin((x / S) * Math.PI * 4 + y) * 2); c.stroke(); }
  },
  eau(c, S, r) {
    fond(c, S, '#0d171d', '#1c2e36', { base: 3, oct: 4, grain: 4, k: 31 });
    c.strokeStyle = 'rgba(130,170,190,0.12)'; c.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S, l = 6 + r() * 16; enBoucle(S, x, y, l, (X, Y) => { c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X + l / 2, Y - 2, X + l, Y); c.stroke(); }); }
  },
  debris(c, S, r) {
    PEINTRES.beton(c, S, r);
    for (let i = 0; i < 90; i++) { const x = r() * S, y = r() * S, t = 2 + r() * 6, f = 0.6 + r() * 0.5; c.fillStyle = rgb([120 * f, 114 * f, 104 * f]); enBoucle(S, x, y, t, (X, Y) => { c.save(); c.translate(X, Y); c.rotate(r() * 3); c.fillRect(-t / 2, -t / 2, t, t * 0.7); c.restore(); }); }
  },
  metal(c, S, r) {
    fond(c, S, '#3c4246', '#5a6266', { base: 3, oct: 3, grain: 8, k: 32 });
    for (let x = 0; x < S; x += 8) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x, 0, 2, S); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + 4, 0, 2, S); }
    c.globalAlpha = 0.4; fond2(c, S, 'rgba(110,60,30,1)', 0.66, 33); c.globalAlpha = 1; // rouille
  },
};
// Pierres irrégulières (Voronoï périodique) : esp = espacement moyen (px), base = couleur [r,g,b],
// varia = variation de teinte par pierre, joint = largeur du joint (px), jc = couleur du joint.
function pierres(c, S, esp, base, varia, joint, k, jc) {
  const n = Math.max(2, Math.round(S / esp)), cel = S / n;
  const pts = [];
  for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) pts.push([(gx + 0.15 + hash(gx, gy, k) * 0.7) * cel, (gy + 0.15 + hash(gx, gy, k + 1) * 0.7) * cel, hash(gx, gy, k + 2)]);
  const im = c.createImageData(S, S), d = im.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const gx = Math.floor(x / cel), gy = Math.floor(y / cel);
    let d1 = 1e9, d2 = 1e9, v = 0, px = 0, py = 0;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const cx = (gx + ox + n) % n, cy = (gy + oy + n) % n, p = pts[cy * n + cx];
      const X = p[0] + (gx + ox - cx) * cel, Y = p[1] + (gy + oy - cy) * cel;
      const dd = (x - X) * (x - X) + (y - Y) * (y - Y);
      if (dd < d1) { d2 = d1; d1 = dd; v = p[2]; px = X; py = Y; } else if (dd < d2) d2 = dd;
    }
    const bordure = Math.sqrt(d2) - Math.sqrt(d1);       // distance au joint (≈ 2× la vraie)
    const o = (y * S + x) * 4;
    const gr = (hash(x, y, k + 9) - 0.5) * 14;
    if (bordure < joint) { d[o] = jc[0] + gr; d[o + 1] = jc[1] + gr; d[o + 2] = jc[2] + gr; d[o + 3] = 255; continue; }
    const f = (1 - varia / 2) + v * varia;
    const bombe = Math.min(1, (bordure - joint) / (cel * 0.35));          // bombé de la pierre
    const lum = 0.72 + 0.28 * bombe + 0.12 * ((px - x) + (py - y)) / cel;  // lumière du haut-gauche
    d[o] = base[0] * f * lum + gr; d[o + 1] = base[1] * f * lum + gr; d[o + 2] = base[2] * f * lum + gr; d[o + 3] = 255;
  }
  c.putImageData(im, 0, 0);
}
// Voile de taches (crasse, mousse, rouille) au-dessus d'un seuil de bruit.
function fond2(c, S, coul, seuil, k) {
  const im = c.getImageData(0, 0, S, S), d = im.data;
  const m = /rgba?\((\d+),(\d+),(\d+)/.exec(coul); const C = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const v = fbm(x, y, S, 5, 3, k);
    if (v < seuil) continue;
    const f = Math.min(1, (v - seuil) * 5) * c.globalAlpha, o = (y * S + x) * 4;
    d[o] += (C[0] - d[o]) * f; d[o + 1] += (C[1] - d[o + 1]) * f; d[o + 2] += (C[2] - d[o + 2]) * f;
  }
  const ga = c.globalAlpha; c.globalAlpha = 1; c.putImageData(im, 0, 0); c.globalAlpha = ga;
}

export function textureSol(idx) {
  const id = SOLS_IDS[idx] || 'beton';
  const cle = 'sol:' + id;
  let t = cache.get(cle);
  if (t) return t;
  t = canvas(TEX, TEX);
  const c = t.getContext('2d');
  (PEINTRES[id] || PEINTRES.beton)(c, TEX, rng(idx * 7919 + 17));
  cache.set(cle, t);
  return t;
}
// ---------- Sols PHOTORÉALISTES (img/sols/*.jpg) ----------
// Rendus dans Blender à partir de matières Poly Haven (CC0) : vue de dessus, lumière du haut-gauche, normales et occlusion
// (pipeline : D:\projects 3D\OneMoreDay\omd_textures_sol.blend). img/sols/sols.json : { sol: { asset, m (mètres par tuile) } }.
// Chargés en arrière-plan ; tant qu'une image manque, la texture procédurale sert. PX_PAR_M : 1 case (0,8 m) = TS px.
const PX_PAR_M = TS / 0.8;
const photos = new Map();          // id de sol → canvas à l'échelle ; 'toit:' + type → toit
const prets = new Set();
let attenteSols = null;
function chargerDossier(dossier, index, prefixe) {
  const base = new URL(`../../img/${dossier}/`, import.meta.url);
  return fetch(new URL(index, base)).then(r => r.json()).then(meta => Promise.all(Object.entries(meta).map(([id, d]) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      const px = Math.max(96, Math.min(640, Math.round((d.m || 2) * PX_PAR_M)));
      const cv = canvas(px, px); const c = cv.getContext('2d');
      c.imageSmoothingQuality = 'high'; c.drawImage(im, 0, 0, px, px);
      photos.set(prefixe + id, cv); ok();
    };
    im.onerror = () => ok();
    im.src = new URL(id + '.jpg', base).href;
  })))).catch(() => {});
}
export function chargerSolsPhoto() {
  if (attenteSols || typeof Image === 'undefined') return attenteSols;
  attenteSols = Promise.all([chargerDossier('sols', 'sols.json', ''), chargerDossier('toits', 'toits.json', 'toit:')])
    .then(() => { motifs.clear(); for (const k of [...cache.keys()]) if (k.startsWith('toit:')) cache.delete(k); for (const f of prets) try { f(); } catch (e) {} });
  return attenteSols;
}
// Appelé quand les sols photo sont prêts (le rendu vide alors ses blocs pré-rendus).
export function surSolsPrets(f) { prets.add(f); return () => prets.delete(f); }

// Motif (pattern) d'une texture, pour remplir des formes en coordonnées monde.
const motifs = new Map();
export function motif(ctx, idx) {
  const cle = idx;
  let m = motifs.get(cle);
  if (m && m.ctx === ctx) return m.p;
  const photo = photos.get(SOLS_IDS[idx]);
  const p = ctx.createPattern(photo || textureSol(idx), 'repeat');
  motifs.set(cle, { ctx, p });
  return p;
}

// ---------- Dessus des murs ----------
const MURS_T = {
  platre:  { sombre: '#4e4a44', clair: '#6c675f', face: '#3a3631', plinthe: '#2a2520' },
  crepi:   { sombre: '#8a6a48', clair: '#b18c62', face: '#6a4e34', plinthe: '#4a3828' },
  pierre:  { sombre: '#6a6253', clair: '#928874', face: '#4f483c', plinthe: '#3a352c' },
  brique:  { sombre: '#5e2c20', clair: '#8a4632', face: '#4a2218', plinthe: '#3a1a12' },
  beton:   { sombre: '#4c4c4a', clair: '#6c6c68', face: '#3a3a38', plinthe: '#2a2a28' },
  bois:    { sombre: '#3a2a1a', clair: '#5e4630', face: '#2c1f12', plinthe: '#20160c' },
  rocher:  { sombre: '#4a4640', clair: '#7a746a', face: '#3a3630', plinthe: '#2a2722' },
  tole:    { sombre: '#3a4448', clair: '#5a666a', face: '#2c3438', plinthe: '#20262a' },
  haie:    { sombre: '#1c2a14', clair: '#33482a', face: '#18220f', plinthe: '#10180a' },
  muret:   { sombre: '#6a6253', clair: '#928874', face: '#4f483c', plinthe: '#3a352c' },
  grille:  { sombre: '#1a1a1a', clair: '#3a3a3a', face: '#111', plinthe: '#111' },
  vitrine: { sombre: '#2a3a44', clair: '#4a6a7a', face: '#1a2a34', plinthe: '#1a1a1a' },
};
export const COULEURS_MUR = MURS_T;
const PEINTRES_MUR = {
  platre(c, S, r) { fond(c, S, MURS_T.platre.sombre, MURS_T.platre.clair, { base: 3, oct: 4, grain: 8, k: 41 }); for (let i = 0; i < 8; i++) fissure(c, S, r, r() * S, r() * S, 20 + r() * 30, 'rgba(30,26,22,0.35)'); },
  crepi(c, S, r) { fond(c, S, MURS_T.crepi.sombre, MURS_T.crepi.clair, { base: 5, oct: 5, grain: 22, k: 42, taches: { coul: '#6a5038', seuil: 0.62, force: 0.5 } }); },
  pierre(c, S, r) {
    fond(c, S, '#3e382e', '#4a4438', { base: 4, oct: 2, grain: 4, k: 43 });
    let y = 0;
    while (y < S) {
      const hh = Math.min(S - y, 12 + Math.floor(r() * 8)); let x = -r() * 20;
      while (x < S) {
        const ww = 16 + r() * 22, f = 0.8 + r() * 0.35;
        c.fillStyle = rgb([128 * f, 118 * f, 100 * f]);
        enBoucle(S, x, y, ww, (X, Y) => { rr(c, X + 1.5, Y + 1.5, ww - 3, hh - 3, 3); c.fill(); });
        c.fillStyle = 'rgba(255,245,220,0.08)'; enBoucle(S, x, y, ww, (X, Y) => { rr(c, X + 2.5, Y + 2.5, ww - 6, 3, 1.5); c.fill(); });
        x += ww;
      }
      y += hh;
    }
  },
  brique(c, S, r) {
    fond(c, S, '#3a2a24', '#463228', { base: 4, oct: 2, grain: 4, k: 44 });
    const bh = 8, bw = 18;
    for (let row = 0, y = 0; y < S; row++, y += bh) for (let x = (row % 2) * -bw / 2; x < S + bw; x += bw) {
      const f = 0.75 + r() * 0.4; c.fillStyle = rgb([138 * f, 70 * f, 50 * f]);
      enBoucle(S, x, y, bw, (X, Y) => c.fillRect(X + 1, Y + 1, bw - 2, bh - 2));
    }
  },
  beton(c, S, r) { fond(c, S, MURS_T.beton.sombre, MURS_T.beton.clair, { base: 4, oct: 4, grain: 12, k: 45 }); c.fillStyle = 'rgba(20,20,18,0.25)'; for (let k = 0; k < S; k += TS) c.fillRect(0, k, S, 1); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(20,20,18,0.4)'; cercle(c, r() * S, r() * S, 1.4); c.fill(); } },
  bois(c, S, r) { fond(c, S, MURS_T.bois.sombre, MURS_T.bois.clair, { base: 3, oct: 3, grain: 8, k: 46 }); for (let y = 0; y < S; y += TS / 4) { c.fillStyle = 'rgba(10,6,2,0.8)'; c.fillRect(0, y, S, 1.2); } },
  rocher(c, S, r) { fond(c, S, MURS_T.rocher.sombre, MURS_T.rocher.clair, { base: 3, oct: 5, grain: 18, k: 47, gamma: 1.2 }); for (let i = 0; i < 10; i++) fissure(c, S, r, r() * S, r() * S, 30 + r() * 40, 'rgba(20,18,15,0.55)', 1.5); },
  tole(c, S) { fond(c, S, MURS_T.tole.sombre, MURS_T.tole.clair, { base: 3, oct: 3, grain: 6, k: 48 }); for (let x = 0; x < S; x += 6) { c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x, 0, 2, S); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 3, 0, 2, S); } },
  haie(c, S, r) { fond(c, S, '#121c0c', '#22301a', { base: 5, oct: 3, grain: 8, k: 49 }); for (let i = 0; i < 420; i++) { const x = r() * S, y = r() * S, t = 3 + r() * 6, f = 0.6 + r() * 0.7; c.fillStyle = rgb([40 * f, 62 * f, 30 * f]); enBoucle(S, x, y, t, (X, Y) => { cercle(c, X, Y, t); c.fill(); }); } },
};
export function textureMur(style) {
  const cle = 'mur:' + style;
  let t = cache.get(cle);
  if (t) return t;
  t = canvas(TEX, TEX);
  (PEINTRES_MUR[style] || PEINTRES_MUR.platre)(t.getContext('2d'), TEX, rng(style.length * 997 + 3));
  cache.set(cle, t);
  return t;
}

// ---------- Toits ----------
export function textureToit(type) {
  const cle = 'toit:' + type;
  if (photos.has(cle)) return photos.get(cle);       // toit photoréaliste (img/toits)
  let t = cache.get(cle);
  if (t) return t;
  t = canvas(TEX, TEX);
  const c = t.getContext('2d'), r = rng(type.length * 131 + 9), S = TEX;
  if (type === 'zinc' || type === 'tole') {
    fond(c, S, '#3c4448', '#5c666a', { base: 3, oct: 3, grain: 6, k: 61 });
    for (let x = 0; x < S; x += 12) { c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x, 0, 2, S); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 2, 0, 1.5, S); }
  } else if (type === 'terrasse') {
    fond(c, S, '#4c4a46', '#66635c', { base: 6, oct: 4, grain: 26, k: 62 });
    points(c, S, r, 1200, ['#77736a', '#3e3c38'], 1, 2);
  } else if (type === 'ardoise') {
    fond(c, S, '#22262a', '#30353a', { base: 3, oct: 2, grain: 6, k: 63 });
    for (let row = 0, y = 0; y < S; row++, y += 9) for (let x = (row % 2) * 7; x < S + 14; x += 14) { const f = 0.8 + r() * 0.4; c.fillStyle = rgb([52 * f, 58 * f, 64 * f]); enBoucle(S, x, y, 14, (X, Y) => { rr(c, X + 0.8, Y + 0.8, 12.4, 8, 2); c.fill(); }); }
  } else if (type === 'verriere') {
    fond(c, S, '#1c2830', '#2e4250', { base: 3, oct: 3, grain: 4, k: 64 });
    c.fillStyle = 'rgba(20,20,20,0.9)'; for (let k = 0; k < S; k += TS) { c.fillRect(0, k, S, 2); c.fillRect(k, 0, 2, S); }
  } else { // tuiles canal (romanes), le toit provençal
    fond(c, S, '#4a2216', '#5a2a1a', { base: 3, oct: 2, grain: 4, k: 65 });
    const tw = 9, th = 12;
    for (let x = 0; x < S; x += tw) for (let row = 0, y = -((x / tw) % 2) * th / 2; y < S; row++, y += th) {
      const f = 0.72 + r() * 0.42, col = rgb([170 * f, 84 * f, 54 * f]);
      enBoucle(S, x, y, th, (X, Y) => {
        const g = c.createLinearGradient(X, 0, X + tw, 0);
        g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.5, 'rgba(255,220,180,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
        c.fillStyle = col; rr(c, X + 0.5, Y, tw - 1, th + 1, 4); c.fill();
        c.fillStyle = g; rr(c, X + 0.5, Y, tw - 1, th + 1, 4); c.fill();
      });
    }
    c.globalAlpha = 0.45; fond2(c, S, 'rgba(60,64,40,1)', 0.68, 66); c.globalAlpha = 1; // lichen
  }
  cache.set(cle, t);
  return t;
}
export function viderTextures() { cache.clear(); motifs.clear(); }
export { melange };
