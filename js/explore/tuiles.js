// ============ Dessin procédural vu de dessus (style Darkwood) ============
// Sols par matière (motifs 4×4 cases mis en cache), murs épais à arête claire, fenêtres, escaliers,
// sorties, mobilier, décor ; tout le statique d'un étage est rendu par blocs (chunks) dans des canvas
// hors écran, une seule fois. Dynamique (portes, personnages, morts, cadavres, objets) : fonctions séparées.
import { K, MATIERES, DECOS } from './niveau.js';

export const TS = 32;          // pixels par case dans les canvas hors écran
export const CHUNK = 16;       // cases par côté de bloc

const hash = (x, y, k = 0) => {
  let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
function rngDe(seed) { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function canvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f)));
  return `rgb(${r},${g},${b})`;
};
function taches(c, r, w, h, n, couleurs, tmin, tmax, alpha = 1) {
  c.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    c.fillStyle = couleurs[Math.floor(r() * couleurs.length)];
    const s = tmin + r() * (tmax - tmin);
    c.fillRect(r() * w, r() * h, s, s);
  }
  c.globalAlpha = 1;
}
function fissure(c, r, x, y, len, col = 'rgba(0,0,0,0.35)') {
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y);
  let a = r() * Math.PI * 2;
  for (let i = 0; i < 5; i++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * len / 5; y += Math.sin(a) * len / 5; c.lineTo(x, y); }
  c.stroke();
}

// ---------- Motifs de sol ----------
const motifs = {};
export function motifSol(mat) {
  if (motifs[mat]) return motifs[mat];
  const N = 4, S = TS * N;
  const cv = canvas(S, S), c = cv.getContext('2d');
  const r = rngDe(MATIERES.indexOf(mat) * 7919 + 17);
  switch (mat) {
    case 'parquet': {
      c.fillStyle = '#5b3e27'; c.fillRect(0, 0, S, S);
      const lh = TS / 3;
      for (let y = 0; y < S; y += lh) {
        let x = -r() * TS * 2;
        while (x < S) {
          const L = TS * (1.5 + r() * 2.5);
          c.fillStyle = shade('#5b3e27', 0.8 + r() * 0.4);
          c.fillRect(x, y, L, lh);
          c.globalAlpha = 0.18; c.strokeStyle = '#2a1a0e';
          for (let k = 0; k < 3; k++) { c.beginPath(); const yy = y + 2 + r() * (lh - 4); c.moveTo(x, yy); c.bezierCurveTo(x + L / 3, yy + r() * 2 - 1, x + 2 * L / 3, yy + r() * 2 - 1, x + L, yy); c.stroke(); }
          c.globalAlpha = 1;
          c.fillStyle = 'rgba(20,10,4,0.75)'; c.fillRect(x, y, 1, lh);
          x += L;
        }
        c.fillStyle = 'rgba(20,10,4,0.8)'; c.fillRect(0, y, S, 1);
      }
      taches(c, r, S, S, 60, ['rgba(0,0,0,0.25)', 'rgba(255,230,190,0.06)'], 1, 3);
      break;
    }
    case 'carrelage': case 'marbre': {
      const base = mat === 'marbre' ? '#a9a498' : '#8b877a';
      c.fillStyle = '#56534c'; c.fillRect(0, 0, S, S);
      const t = mat === 'marbre' ? TS : TS / 2;
      for (let y = 0; y < S; y += t) for (let x = 0; x < S; x += t) {
        c.fillStyle = shade(base, 0.88 + r() * 0.2);
        c.fillRect(x + 1, y + 1, t - 2, t - 2);
        c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 1, y + 1, t - 2, 2);
        if (mat === 'marbre') { c.strokeStyle = 'rgba(70,70,70,0.25)'; fissure(c, r, x + r() * t, y + r() * t, t, 'rgba(80,78,72,0.3)'); }
        else if (r() < 0.08) fissure(c, r, x + r() * t, y + r() * t, t * 0.8);
      }
      taches(c, r, S, S, 40, ['rgba(0,0,0,0.12)'], 2, 6);
      break;
    }
    case 'moquette': {
      c.fillStyle = '#4b2a2c'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 2600, ['#57302f', '#3d2123', '#5d3637', '#44262a'], 1, 2);
      c.globalAlpha = 0.1; c.strokeStyle = '#000';
      for (let y = 0; y < S; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(S, y); c.stroke(); }
      c.globalAlpha = 1;
      taches(c, r, S, S, 12, ['rgba(0,0,0,0.18)'], 8, 20);
      break;
    }
    case 'beton': {
      c.fillStyle = '#65635e'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 90, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.04)'], 6, 22);
      taches(c, r, S, S, 900, ['rgba(0,0,0,0.18)', 'rgba(255,255,255,0.07)'], 1, 2);
      for (let i = 0; i < 6; i++) fissure(c, r, r() * S, r() * S, 20 + r() * 30);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 0, S, 1); c.fillRect(0, 0, 1, S); c.fillRect(0, S / 2, S, 1); c.fillRect(S / 2, 0, 1, S);
      break;
    }
    case 'lino': {
      c.fillStyle = '#6c7160'; c.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += TS) for (let x = 0; x < S; x += TS) { c.fillStyle = ((x + y) / TS) % 2 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'; c.fillRect(x, y, TS, TS); }
      taches(c, r, S, S, 700, ['rgba(20,20,10,0.25)', 'rgba(230,230,200,0.12)'], 1, 2);
      taches(c, r, S, S, 10, ['rgba(40,30,10,0.15)'], 10, 24);
      break;
    }
    case 'tomettes': {
      c.fillStyle = '#3f2519'; c.fillRect(0, 0, S, S);
      const R = TS / 3.2, hx = R * Math.sqrt(3);
      for (let row = -1, y = 0; y < S + R * 2; row++, y += R * 1.5) {
        for (let x = (row % 2 ? hx / 2 : 0) - hx; x < S + hx; x += hx) {
          c.fillStyle = shade('#8c4a2f', 0.8 + r() * 0.35);
          c.beginPath();
          for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * (R - 1.2), y + Math.sin(a) * (R - 1.2)); }
          c.closePath(); c.fill();
        }
      }
      taches(c, r, S, S, 300, ['rgba(0,0,0,0.2)', 'rgba(255,200,160,0.06)'], 1, 3);
      break;
    }
    case 'terre': {
      c.fillStyle = '#4a3a2a'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 80, ['rgba(0,0,0,0.12)', 'rgba(120,90,60,0.12)'], 8, 24);
      taches(c, r, S, S, 1500, ['#3b2e21', '#5a4733', '#2f251b'], 1, 2);
      taches(c, r, S, S, 40, ['#6a6258', '#57504a'], 2, 4);
      break;
    }
    case 'bitume': {
      c.fillStyle = '#353537'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 2600, ['#2c2c2e', '#414143', '#4a4a4b', '#262628'], 1, 2);
      taches(c, r, S, S, 16, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.03)'], 12, 30);
      for (let i = 0; i < 3; i++) fissure(c, r, r() * S, r() * S, 30 + r() * 40, 'rgba(0,0,0,0.45)');
      break;
    }
    case 'paves': {
      c.fillStyle = '#2f2d2a'; c.fillRect(0, 0, S, S);
      const t = TS / 2.5;
      for (let row = 0, y = 0; y < S; row++, y += t) for (let x = (row % 2) * -t / 2; x < S; x += t) {
        c.fillStyle = shade('#6a655c', 0.75 + r() * 0.35);
        const p = 1.5, rr = 3;
        c.beginPath(); c.roundRect ? c.roundRect(x + p, y + p, t - 2 * p, t - 2 * p, rr) : c.rect(x + p, y + p, t - 2 * p, t - 2 * p); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x + p + 1, y + p, t - 2 * p - 2, 1.5);
      }
      taches(c, r, S, S, 400, ['rgba(0,0,0,0.25)'], 1, 2);
      break;
    }
    case 'herbe': {
      c.fillStyle = '#34432a'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 60, ['rgba(0,0,0,0.15)', 'rgba(110,130,60,0.12)'], 10, 26);
      c.lineWidth = 1;
      for (let i = 0; i < 1300; i++) {
        const x = r() * S, y = r() * S;
        c.strokeStyle = ['#46582f', '#2a3620', '#56693a', '#3c4d2a'][Math.floor(r() * 4)];
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 4); c.stroke();
      }
      break;
    }
    case 'gravier': {
      c.fillStyle = '#6c675d'; c.fillRect(0, 0, S, S);
      taches(c, r, S, S, 3200, ['#8a857a', '#56524a', '#9b968a', '#4a463f', '#7a7466'], 1.5, 3);
      break;
    }
    case 'eau': {
      c.fillStyle = '#16232b'; c.fillRect(0, 0, S, S);
      c.strokeStyle = 'rgba(120,160,180,0.12)'; c.lineWidth = 1;
      for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S, l = 6 + r() * 14; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 2, x + l, y); c.stroke(); }
      break;
    }
    default: c.fillStyle = '#555'; c.fillRect(0, 0, S, S);
  }
  return (motifs[mat] = cv);
}

// ---------- Mobilier ----------
const BOIS = '#5d4128', BOIS_F = '#3b2819', METAL = '#6e7272', DRAP = '#b9b2a0';
function ombre(c, x, y, w, h, r = 3) { c.fillStyle = 'rgba(0,0,0,0.38)'; rr(c, x + 3, y + 4, w, h, r); c.fill(); }
function rr(c, x, y, w, h, r) { c.beginPath(); w = Math.max(0, w); h = Math.max(0, h); if (c.roundRect) c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); else c.rect(x, y, w, h); }
function boite(c, x, y, w, h, coul, rad = 2, arete = 0.18) {
  ombre(c, x, y, w, h, rad);
  c.fillStyle = coul; rr(c, x, y, w, h, rad); c.fill();
  c.fillStyle = `rgba(255,240,210,${arete})`; c.fillRect(x + 1, y + 1, w - 2, 2);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x + 1, y + h - 2, w - 2, 2);
  c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1; rr(c, x + 0.5, y + 0.5, w - 1, h - 1, rad); c.stroke();
}
export function dessinerMeuble(c, m, E) {
  const x = m.x0 * TS, y = m.y0 * TS, w = (m.x1 - m.x0 + 1) * TS, h = (m.y1 - m.y0 + 1) * TS;
  const r = rngDe(m.x0 * 131 + m.y0 * 977 + 7);
  const horiz = w >= h;
  const plein = m.taille === (m.x1 - m.x0 + 1) * (m.y1 - m.y0 + 1);
  if (!plein && m.type !== 'arbre' && m.type !== 'haie' && m.type !== 'gravats') {
    for (const j of m.cases) { const cx = (j % E.w) * TS, cy = ((j / E.w) | 0) * TS; boite(c, cx + 2, cy + 2, TS - 4, TS - 4, couleurType(m.type), 2); }
    return;
  }
  const p = 3;
  switch (m.type) {
    case 'lit': case 'brancard': {
      boite(c, x + p, y + p, w - 2 * p, h - 2 * p, m.type === 'brancard' ? METAL : BOIS_F, 3);
      const coul = ['#7d8a95', '#8a7b6a', '#6e7a64', '#8f7f86'][Math.floor(r() * 4)];
      c.fillStyle = DRAP; rr(c, x + p + 3, y + p + 3, w - 2 * p - 6, h - 2 * p - 6, 3); c.fill();
      // oreiller + couverture
      if (horiz) {
        c.fillStyle = '#d8d2c2'; rr(c, x + p + 5, y + p + 5, TS * 0.55, h - 2 * p - 10, 4); c.fill();
        c.fillStyle = coul; rr(c, x + p + TS * 0.8, y + p + 3, w - 2 * p - TS * 0.8 - 3, h - 2 * p - 6, 3); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + p + TS * 0.8, y + p + 3, 3, h - 2 * p - 6);
      } else {
        c.fillStyle = '#d8d2c2'; rr(c, x + p + 5, y + p + 5, w - 2 * p - 10, TS * 0.55, 4); c.fill();
        c.fillStyle = coul; rr(c, x + p + 3, y + p + TS * 0.8, w - 2 * p - 6, h - 2 * p - TS * 0.8 - 3, 3); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + p + 3, y + p + TS * 0.8, w - 2 * p - 6, 3);
      }
      if (r() < 0.4) { c.fillStyle = 'rgba(110,20,25,0.55)'; c.beginPath(); c.ellipse(x + w * (0.4 + r() * 0.3), y + h * (0.4 + r() * 0.3), 6 + r() * 6, 4 + r() * 5, r() * 3, 0, 7); c.fill(); }
      break;
    }
    case 'table': case 'bureau': {
      boite(c, x + p, y + p, w - 2 * p, h - 2 * p, m.type === 'bureau' ? '#4a3a2c' : BOIS, 2);
      c.strokeStyle = 'rgba(0,0,0,0.15)'; for (let k = 0; k < 4; k++) { c.beginPath(); const yy = y + p + 4 + r() * (h - 2 * p - 8); c.moveTo(x + p + 2, yy); c.lineTo(x + w - p - 2, yy); c.stroke(); }
      // objets posés
      const n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const ox = x + p + 6 + r() * (w - 2 * p - 18), oy = y + p + 6 + r() * (h - 2 * p - 18);
        const t = r();
        if (m.type === 'bureau' && k === 0) { c.fillStyle = '#1c1d1f'; c.fillRect(ox, oy, 12, 8); c.fillStyle = '#2d3a40'; c.fillRect(ox + 1, oy + 1, 10, 6); }
        else if (t < 0.4) { c.fillStyle = '#d9d3c1'; c.save(); c.translate(ox + 5, oy + 6); c.rotate(r() - 0.5); c.fillRect(-5, -6, 10, 13); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let l = 0; l < 4; l++) c.fillRect(-3, -4 + l * 3, 6, 0.8); c.restore(); }
        else if (t < 0.7) { c.fillStyle = '#8c8a80'; c.beginPath(); c.arc(ox + 4, oy + 4, 4, 0, 7); c.fill(); c.fillStyle = '#3a3a36'; c.beginPath(); c.arc(ox + 4, oy + 4, 2.5, 0, 7); c.fill(); }
        else { c.fillStyle = '#2e4a3a'; c.fillRect(ox, oy, 3, 9); }
      }
      break;
    }
    case 'comptoir': case 'caisse': {
      boite(c, x + 1, y + 1, w - 2, h - 2, m.type === 'caisse' ? '#40454a' : '#6a5a48', 1, 0.14);
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 3, y + 3, w - 6, h - 6);
      if (m.type === 'caisse') { c.fillStyle = '#1f2224'; c.fillRect(x + w / 2 - 8, y + h / 2 - 6, 16, 12); c.fillStyle = '#44604a'; c.fillRect(x + w / 2 - 6, y + h / 2 - 5, 12, 4); c.fillStyle = '#777'; for (let k = 0; k < 3; k++) c.fillRect(x + w / 2 - 6 + k * 4.5, y + h / 2 + 1, 3, 3); }
      break;
    }
    case 'cuisine': {
      boite(c, x + 1, y + 1, w - 2, h - 2, '#7d7a70', 1, 0.2);
      const n = Math.max(1, Math.round((horiz ? w : h) / TS));
      for (let k = 0; k < n; k++) {
        const cx = horiz ? x + k * TS + TS / 2 : x + w / 2, cy = horiz ? y + h / 2 : y + k * TS + TS / 2;
        const t = (k + Math.floor(r() * 2)) % 3;
        if (t === 0) { c.fillStyle = '#9ea3a4'; rr(c, cx - 10, cy - 8, 20, 16, 3); c.fill(); c.fillStyle = '#4b5256'; rr(c, cx - 8, cy - 6, 16, 12, 3); c.fill(); c.fillStyle = '#ccc'; c.fillRect(cx - 1, cy - 9, 2, 4); }
        else if (t === 1) { c.fillStyle = '#26282a'; c.fillRect(cx - 11, cy - 10, 22, 20); c.strokeStyle = '#555'; for (const [a, b] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { c.beginPath(); c.arc(cx + a, cy + b, 3.5, 0, 7); c.stroke(); } }
        else { c.strokeStyle = 'rgba(0,0,0,0.3)'; c.strokeRect(cx - 12, cy - 11, 24, 22); }
      }
      break;
    }
    case 'etagere': {
      boite(c, x + 2, y + 2, w - 4, h - 4, '#3d3128', 1, 0.1);
      const long = horiz ? w : h, larg = horiz ? h : w;
      const nb = Math.floor((long - 8) / 5);
      for (let k = 0; k < nb; k++) {
        if (r() < 0.25) continue;
        const col = ['#6d4b3a', '#7b6a44', '#45566a', '#6a3a3a', '#8a8470', '#3c5a45', '#9a8d6a'][Math.floor(r() * 7)];
        const t = 3 + r() * 3, d = larg * (0.45 + r() * 0.35);
        c.fillStyle = col;
        if (horiz) c.fillRect(x + 5 + k * 5, y + (h - d) / 2, t, d); else c.fillRect(x + (w - d) / 2, y + 5 + k * 5, d, t);
      }
      c.fillStyle = 'rgba(0,0,0,0.35)'; if (horiz) c.fillRect(x + 2, y + h / 2 - 0.5, w - 4, 1); else c.fillRect(x + w / 2 - 0.5, y + 2, 1, h - 4);
      break;
    }
    case 'armoire': {
      boite(c, x + 2, y + 2, w - 4, h - 4, '#4a3322', 2, 0.14);
      c.fillStyle = 'rgba(0,0,0,0.4)'; if (horiz) c.fillRect(x + w / 2 - 0.5, y + 4, 1, h - 8); else c.fillRect(x + 4, y + h / 2 - 0.5, w - 8, 1);
      c.fillStyle = '#b9a060'; if (horiz) { c.fillRect(x + w / 2 - 4, y + h / 2 - 1, 2, 3); c.fillRect(x + w / 2 + 2, y + h / 2 - 1, 2, 3); } else { c.fillRect(x + w / 2 - 1, y + h / 2 - 4, 3, 2); c.fillRect(x + w / 2 - 1, y + h / 2 + 2, 3, 2); }
      break;
    }
    case 'frigo': case 'machine': case 'generateur': case 'conteneur': {
      const coul = m.type === 'frigo' ? '#c7c5bd' : m.type === 'conteneur' ? '#5a6a5c' : METAL;
      boite(c, x + 2, y + 2, w - 4, h - 4, coul, 2, 0.25);
      if (m.type === 'frigo') { c.fillStyle = '#8b8a84'; c.fillRect(x + 6, y + h - 9, w - 12, 2); }
      else if (m.type === 'conteneur') { c.strokeStyle = 'rgba(0,0,0,0.3)'; for (let k = 6; k < (horiz ? w : h) - 4; k += 5) { c.beginPath(); if (horiz) { c.moveTo(x + k, y + 4); c.lineTo(x + k, y + h - 4); } else { c.moveTo(x + 4, y + k); c.lineTo(x + w - 4, y + k); } c.stroke(); } }
      else { c.fillStyle = '#2a2c2d'; for (let k = 0; k < 4; k++) c.fillRect(x + 6, y + 6 + k * 4, w - 12, 2); c.fillStyle = '#b33'; c.fillRect(x + w - 9, y + h - 9, 3, 3); }
      break;
    }
    case 'poubelle': {
      if (m.taille > 1) { boite(c, x + 2, y + 3, w - 4, h - 6, '#2f4a36', 2, 0.15); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x + 4, y + h / 2, w - 8, 1); }
      else { c.fillStyle = 'rgba(0,0,0,0.38)'; c.beginPath(); c.arc(x + w / 2 + 2, y + h / 2 + 3, TS * 0.36, 0, 7); c.fill(); c.fillStyle = '#3c4a44'; c.beginPath(); c.arc(x + w / 2, y + h / 2, TS * 0.36, 0, 7); c.fill(); c.strokeStyle = '#6b7872'; c.lineWidth = 2; c.stroke(); c.lineWidth = 1; c.fillStyle = '#222'; c.beginPath(); c.arc(x + w / 2, y + h / 2, TS * 0.2, 0, 7); c.fill(); }
      taches(c, r, 0, 0, 0, [], 0, 0);
      break;
    }
    case 'canape': {
      const coul = ['#5b3a36', '#3f4a52', '#56503a'][Math.floor(r() * 3)];
      boite(c, x + p, y + p, w - 2 * p, h - 2 * p, shade(coul, 0.75), 5);
      c.fillStyle = coul;
      if (horiz) { const n = Math.max(1, Math.round(w / TS)); for (let k = 0; k < n; k++) { rr(c, x + p + 3 + k * (w - 2 * p - 6) / n, y + p + 9, (w - 2 * p - 6) / n - 2, h - 2 * p - 12, 4); c.fill(); } }
      else { const n = Math.max(1, Math.round(h / TS)); for (let k = 0; k < n; k++) { rr(c, x + p + 9, y + p + 3 + k * (h - 2 * p - 6) / n, w - 2 * p - 12, (h - 2 * p - 6) / n - 2, 4); c.fill(); } }
      break;
    }
    case 'banc': {
      ombre(c, x + 3, y + 6, w - 6, h - 12, 1);
      c.fillStyle = BOIS; const n = 3;
      for (let k = 0; k < n; k++) { if (horiz) c.fillRect(x + 3, y + 7 + k * ((h - 14) / n), w - 6, (h - 14) / n - 2); else c.fillRect(x + 7 + k * ((w - 14) / n), y + 3, (w - 14) / n - 2, h - 6); }
      break;
    }
    case 'lavabo': {
      const n = m.taille;
      for (const j of m.cases) {
        const cx = (j % E.w) * TS, cy = ((j / E.w) | 0) * TS;
        if ((j + n) % 2) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(cx + 18, cy + 19, 10, 12, 0, 0, 7); c.fill(); c.fillStyle = '#d6d4cc'; c.fillRect(cx + 7, cy + 3, 18, 7); c.beginPath(); c.ellipse(cx + 16, cy + 18, 9, 11, 0, 0, 7); c.fill(); c.fillStyle = '#9fa7a8'; c.beginPath(); c.ellipse(cx + 16, cy + 19, 5, 7, 0, 0, 7); c.fill(); }
        else { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(cx + 6, cy + 7, 24, 20); c.fillStyle = '#d6d4cc'; rr(c, cx + 4, cy + 5, 24, 18, 5); c.fill(); c.fillStyle = '#8b989a'; c.beginPath(); c.ellipse(cx + 16, cy + 14, 8, 5, 0, 0, 7); c.fill(); }
      }
      break;
    }
    case 'baignoire': {
      boite(c, x + 2, y + 2, w - 4, h - 4, '#d1cfc6', 8, 0.3);
      c.fillStyle = '#8e9a9c'; rr(c, x + 6, y + 6, w - 12, h - 12, 8); c.fill();
      if (r() < 0.5) { c.fillStyle = 'rgba(90,20,20,0.5)'; rr(c, x + 8, y + 8, w - 16, h - 16, 6); c.fill(); }
      break;
    }
    case 'voiture': {
      const coul = ['#5a2424', '#2c3e50', '#6b6b63', '#3d4a33', '#8a8577', '#1f2326'][Math.floor(r() * 6)];
      c.save(); c.translate(x + w / 2, y + h / 2); if (!horiz) c.rotate(Math.PI / 2);
      const L = Math.max(w, h) - 6, H = Math.min(w, h) - 8;
      c.fillStyle = 'rgba(0,0,0,0.45)'; rr(c, -L / 2 + 4, -H / 2 + 5, L, H, 10); c.fill();
      c.fillStyle = coul; rr(c, -L / 2, -H / 2, L, H, 10); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.08)'; rr(c, -L / 2 + 3, -H / 2 + 2, L - 6, 4, 2); c.fill();
      c.fillStyle = '#1b2227'; rr(c, -L * 0.18, -H / 2 + 4, L * 0.14, H - 8, 3); c.fill();   // pare-brise
      c.fillStyle = '#1b2227'; rr(c, L * 0.24, -H / 2 + 5, L * 0.08, H - 10, 2); c.fill();  // lunette
      c.fillStyle = shade(coul, 0.8); rr(c, -L * 0.03, -H / 2 + 3, L * 0.26, H - 6, 4); c.fill(); // toit
      c.fillStyle = '#d9d0a8'; c.fillRect(-L / 2 + 1, -H / 2 + 3, 3, 5); c.fillRect(-L / 2 + 1, H / 2 - 8, 3, 5);
      c.fillStyle = '#7a1c1c'; c.fillRect(L / 2 - 3, -H / 2 + 3, 2, 5); c.fillRect(L / 2 - 3, H / 2 - 8, 2, 5);
      if (r() < 0.5) { c.strokeStyle = 'rgba(220,230,235,0.35)'; fissure(c, r, -L * 0.12, 0, 12, 'rgba(220,230,235,0.4)'); }
      c.restore();
      break;
    }
    case 'gravats': {
      for (const j of m.cases) {
        const cx = (j % E.w) * TS, cy = ((j / E.w) | 0) * TS;
        for (let k = 0; k < 9; k++) { const s = 5 + r() * 10; const ox = cx + r() * (TS - s), oy = cy + r() * (TS - s); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(ox + 2, oy + 2, s, s * 0.8); c.fillStyle = ['#6d665c', '#58524a', '#7c5a44', '#8a847a'][Math.floor(r() * 4)]; c.save(); c.translate(ox + s / 2, oy + s / 2); c.rotate(r() * 3); c.fillRect(-s / 2, -s / 3, s, s * 0.7); c.restore(); }
        c.strokeStyle = '#4a3a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + r() * TS, cy + r() * TS); c.lineTo(cx + r() * TS, cy + r() * TS); c.stroke(); c.lineWidth = 1;
      }
      break;
    }
    case 'tombe': case 'cercueil': {
      const L = horiz ? w : h;
      c.save(); c.translate(x + w / 2, y + h / 2); if (!horiz) c.rotate(Math.PI / 2);
      const LL = Math.max(L - 6, TS * 0.8), HH = TS - 8;
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(-LL / 2 + 3, -HH / 2 + 4, LL, HH);
      c.fillStyle = m.type === 'cercueil' ? '#4a3322' : '#7c7a72'; c.fillRect(-LL / 2, -HH / 2, LL, HH);
      c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(-LL / 2, -HH / 2, LL, 2);
      c.strokeStyle = 'rgba(0,0,0,0.45)'; c.strokeRect(-LL / 2 + 0.5, -HH / 2 + 0.5, LL - 1, HH - 1);
      if (m.type === 'tombe') { c.fillStyle = '#5a5850'; c.fillRect(-LL / 2 + 3, -2, LL * 0.35, 4); c.fillRect(-LL / 2 + 3 + LL * 0.12, -HH / 2 + 4, 4, HH - 8); taches(c, r, 0, 0, 0, [], 0, 0); c.fillStyle = 'rgba(60,80,40,0.35)'; c.fillRect(LL / 2 - 10, -HH / 2 + 2, 7, HH - 4); }
      c.restore();
      break;
    }
    case 'caveau': case 'pilier': case 'statue': {
      ombre(c, x + 1, y + 1, w - 2, h - 2, 1);
      c.fillStyle = m.type === 'caveau' ? '#5f5c55' : '#6a665e'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 1, y + 1, w - 2, 3); c.fillRect(x + 1, y + 1, 3, h - 2);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 1, y + h - 4, w - 2, 3);
      if (m.type === 'caveau') { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); if (horiz) { c.moveTo(x + 3, y + h / 2); c.lineTo(x + w - 3, y + h / 2); } else { c.moveTo(x + w / 2, y + 3); c.lineTo(x + w / 2, y + h - 3); } c.stroke(); c.fillStyle = '#3d3a35'; c.fillRect(x + w / 2 - 2, y + h / 2 - 7, 4, 14); c.fillRect(x + w / 2 - 6, y + h / 2 - 3, 12, 4); }
      break;
    }
    case 'arbre': case 'haie': break; // canopées dessinées à part (au-dessus)
    case 'fontaine': {
      c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(x + w / 2 + 3, y + h / 2 + 4, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill();
      c.fillStyle = '#6d6a60'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill();
      c.fillStyle = '#1f3038'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 - 7, h / 2 - 7, 0, 0, 7); c.fill();
      c.fillStyle = '#4b5a3a'; c.beginPath(); c.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.14, 0, 7); c.fill();
      break;
    }
    default: {
      boite(c, x + 3, y + 3, w - 6, h - 6, couleurType(m.type), 2);
      if (m.type === 'cheminee') { c.fillStyle = '#1a1512'; c.fillRect(x + 8, y + 8, w - 16, h - 16); c.fillStyle = 'rgba(200,90,30,0.25)'; c.fillRect(x + 10, y + 10, w - 20, h - 20); }
      if (m.type === 'autel') { c.fillStyle = '#d8d0b8'; c.fillRect(x + 6, y + 6, w - 12, 4); }
    }
  }
}
function couleurType(t) {
  return { cheminee: '#4a4038', autel: '#8a8272', tente: '#5a6048', grille: '#2d2f30', barriere: '#6a5a3a', piano: '#1d1a18', cloche: '#6b5a2e', palette: '#7a6440', caisson: '#6b5638' }[t] || '#5a4a3a';
}
function dessinerArbre(c, cx, cy, r) {
  const R = TS * (0.75 + r() * 0.35);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(cx + 6, cy + 8, R, 0, 7); c.fill();
  for (let k = 0; k < 7; k++) {
    const a = r() * Math.PI * 2, d = r() * R * 0.45, rr2 = R * (0.45 + r() * 0.35);
    c.fillStyle = ['#1f2d1b', '#28391f', '#324526', '#1a2517'][Math.floor(r() * 4)];
    c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr2, 0, 7); c.fill();
  }
  c.fillStyle = 'rgba(160,190,110,0.08)'; c.beginPath(); c.arc(cx - R * 0.25, cy - R * 0.3, R * 0.5, 0, 7); c.fill();
}

// ---------- Rendu d'un bloc statique ----------
// Rend les cases [cx0, cx0+CHUNK[ × [cy0, cy0+CHUNK[ de l'étage E dans un canvas (TS px / case).
export function rendreChunk(niveau, E, cx0, cy0) {
  const cv = canvas(CHUNK * TS, CHUNK * TS), c = cv.getContext('2d');
  c.fillStyle = '#050505'; c.fillRect(0, 0, CHUNK * TS, CHUNK * TS);
  c.translate(-cx0 * TS, -cy0 * TS);
  const x0 = Math.max(0, cx0 - 2), y0 = Math.max(0, cy0 - 2), x1 = Math.min(E.w - 1, cx0 + CHUNK + 1), y1 = Math.min(E.h - 1, cy0 + CHUNK + 1);
  const w = E.w;
  const estMur = (x, y) => { if (x < 0 || y < 0 || x >= E.w || y >= E.h) return true; const k = E.code[y * w + x]; return k === K.MUR || k === K.VIDE || k === K.FENETRE; };
  // 1) sols
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * w + x, k = E.code[i];
    if (k === K.MUR || k === K.VIDE || k === K.FENETRE) continue;
    const mat = MATIERES[E.sol[i]];
    c.drawImage(motifSol(mat), (x & 3) * TS, (y & 3) * TS, TS, TS, x * TS, y * TS, TS, TS);
  }
  // 2) occlusion le long des murs + bords herbe/sol
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * w + x, k = E.code[i];
    if (k === K.MUR || k === K.VIDE || k === K.FENETRE) continue;
    const X = x * TS, Y = y * TS, o = 10;
    if (estMur(x, y - 1)) { const g = c.createLinearGradient(0, Y, 0, Y + o); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(X, Y, TS, o); }
    if (estMur(x - 1, y)) { const g = c.createLinearGradient(X, 0, X + o, 0); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(X, Y, o, TS); }
    if (estMur(x + 1, y)) { const g = c.createLinearGradient(X + TS, 0, X + TS - o * 0.6, 0); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(X + TS - o, Y, o, TS); }
    if (estMur(x, y + 1)) { const g = c.createLinearGradient(0, Y + TS, 0, Y + TS - o * 0.6); g.addColorStop(0, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(X, Y + TS - o, TS, o); }
    // escaliers
    if (k === K.ESC_MONTE || k === K.ESC_DESCEND) {
      const monte = k === K.ESC_MONTE;
      c.fillStyle = monte ? '#4c463e' : '#2a2622'; c.fillRect(X, Y, TS, TS);
      for (let s = 0; s < 5; s++) { const f = monte ? 1 - s * 0.12 : 0.55 + s * 0.1; c.fillStyle = shade('#7a7064', f); c.fillRect(X + 1, Y + s * (TS / 5) + 1, TS - 2, TS / 5 - 2); }
      c.fillStyle = 'rgba(201,162,39,0.55)'; c.beginPath();
      if (monte) { c.moveTo(X + TS / 2, Y + 7); c.lineTo(X + TS / 2 + 6, Y + 14); c.lineTo(X + TS / 2 - 6, Y + 14); }
      else { c.moveTo(X + TS / 2, Y + TS - 7); c.lineTo(X + TS / 2 + 6, Y + TS - 14); c.lineTo(X + TS / 2 - 6, Y + TS - 14); }
      c.fill();
    }
    if (k === K.SORTIE) {
      c.fillStyle = 'rgba(201,162,39,0.10)'; c.fillRect(X, Y, TS, TS);
      c.strokeStyle = 'rgba(201,162,39,0.35)'; c.setLineDash([4, 4]); c.strokeRect(X + 2.5, Y + 2.5, TS - 5, TS - 5); c.setLineDash([]);
    }
    if (k === K.PORTE) { c.fillStyle = '#2b2119'; c.fillRect(X + 2, Y + 2, TS - 4, TS - 4); }
    // décor
    const d = E.deco[i];
    if (d) {
      const r = rngDe(x * 7 + y * 131 + 5);
      const nom = DECOS[d - 1];
      if (nom === 'debris') {
        for (let k2 = 0; k2 < 10; k2++) { c.fillStyle = ['rgba(200,210,215,0.35)', 'rgba(90,80,70,0.8)', 'rgba(40,35,30,0.8)'][k2 % 3]; c.save(); c.translate(X + r() * TS, Y + r() * TS); c.rotate(r() * 3); c.fillRect(-2, -1, 3 + r() * 5, 1.5 + r() * 2); c.restore(); }
        if (r() < 0.6) { c.fillStyle = 'rgba(95,15,20,0.45)'; c.beginPath(); c.ellipse(X + TS / 2, Y + TS / 2, 6 + r() * 8, 4 + r() * 6, r() * 3, 0, 7); c.fill(); }
      } else if (nom === 'chaise') {
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(X + 10, Y + 11, 16, 16);
        c.save(); c.translate(X + TS / 2, Y + TS / 2); c.rotate((r() - 0.5) * 1.2);
        c.fillStyle = BOIS; c.fillRect(-8, -8, 16, 16); c.fillStyle = BOIS_F; c.fillRect(-8, -8, 16, 4); c.restore();
      } else if (nom === 'cadavre') {
        dessinerCorps(c, X + TS / 2, Y + TS / 2, r() * Math.PI * 2, r, true);
      }
    }
  }
  // 3) murs et fenêtres
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * w + x, k = E.code[i];
    if (k !== K.MUR && k !== K.FENETRE && k !== K.VIDE) continue;
    const X = x * TS, Y = y * TS;
    if (k === K.VIDE) { c.fillStyle = '#050505'; c.fillRect(X, Y, TS, TS); continue; }
    c.fillStyle = '#1d1a17'; c.fillRect(X, Y, TS, TS);
    const r = rngDe(x * 31 + y * 7 + 3);
    c.fillStyle = 'rgba(255,240,220,0.035)'; for (let s = 0; s < 6; s++) c.fillRect(X + r() * TS, Y + r() * TS, 2 + r() * 5, 1);
    const ar = '#7d7466', ep = 3;
    c.fillStyle = ar;
    if (!estMur(x, y - 1)) c.fillRect(X, Y, TS, ep);
    if (!estMur(x, y + 1)) c.fillRect(X, Y + TS - ep, TS, ep);
    if (!estMur(x - 1, y)) c.fillRect(X, Y, ep, TS);
    if (!estMur(x + 1, y)) c.fillRect(X + TS - ep, Y, ep, TS);
    c.fillStyle = 'rgba(0,0,0,0.5)';
    if (!estMur(x, y - 1)) c.fillRect(X, Y + ep, TS, 1);
    if (!estMur(x, y + 1)) c.fillRect(X, Y + TS - ep - 1, TS, 1);
    if (!estMur(x - 1, y)) c.fillRect(X + ep, Y, 1, TS);
    if (!estMur(x + 1, y)) c.fillRect(X + TS - ep - 1, Y, 1, TS);
    if (k === K.FENETRE) {
      const horiz = estMur(x - 1, y) || estMur(x + 1, y) ? (estMur(x - 1, y) && estMur(x + 1, y)) || !(estMur(x, y - 1) && estMur(x, y + 1)) : true;
      c.fillStyle = '#6d6252';
      if (horiz) { c.fillRect(X, Y + TS / 2 - 5, TS, 10); c.fillStyle = 'rgba(150,185,200,0.55)'; c.fillRect(X + 1, Y + TS / 2 - 3, TS - 2, 6); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(X + 4, Y + TS / 2 - 2, 8, 1); c.fillStyle = '#4a4236'; c.fillRect(X + TS / 2 - 1, Y + TS / 2 - 4, 2, 8); }
      else { c.fillRect(X + TS / 2 - 5, Y, 10, TS); c.fillStyle = 'rgba(150,185,200,0.55)'; c.fillRect(X + TS / 2 - 3, Y + 1, 6, TS - 2); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(X + TS / 2 - 2, Y + 4, 1, 8); c.fillStyle = '#4a4236'; c.fillRect(X + TS / 2 - 4, Y + TS / 2 - 1, 8, 2); }
    }
  }
  // 4) mobilier (tout meuble qui touche le bloc)
  for (const m of niveau.meubles) {
    if (m.etage !== E.id) continue;
    if (m.x1 < x0 || m.x0 > x1 || m.y1 < y0 || m.y0 > y1) continue;
    dessinerMeuble(c, m, E);
  }
  // 5) canopées
  for (let y = Math.max(0, y0 - 1); y <= Math.min(E.h - 1, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(E.w - 1, x1 + 1); x++) {
    const i = y * w + x;
    const mi = E.meuble[i];
    if (mi < 0) continue;
    const m = niveau.meubles[mi];
    if (m.type === 'arbre') dessinerArbre(c, x * TS + TS / 2, y * TS + TS / 2, rngDe(x * 97 + y * 13));
    else if (m.type === 'haie') { const r = rngDe(x * 5 + y * 3); c.fillStyle = '#1e2b19'; c.fillRect(x * TS - 2, y * TS - 2, TS + 4, TS + 4); for (let k = 0; k < 6; k++) { c.fillStyle = ['#26361f', '#2f4226', '#1a2616'][k % 3]; c.beginPath(); c.arc(x * TS + r() * TS, y * TS + r() * TS, 6 + r() * 6, 0, 7); c.fill(); } }
  }
  return cv;
}

// ---------- Dynamique ----------
// Porte : cellule (x,y), orient 'h' (dans un mur horizontal) | 'v', état.
export function dessinerPorte(c, p, s, t) {
  const X = p.x * TS, Y = p.y * TS;
  const ferme = s.etat === 'fermee' || s.etat === 'verrouillee';
  c.save();
  if (s.etat === 'cassee') {
    c.fillStyle = '#3a2a1c'; c.save(); c.translate(X + TS / 2, Y + TS / 2); c.rotate(0.6); c.fillRect(-TS / 2, -3, TS * 0.7, 5); c.restore();
    c.fillStyle = '#4a3625'; c.save(); c.translate(X + TS * 0.3, Y + TS * 0.7); c.rotate(-0.4); c.fillRect(-6, -2, 12, 4); c.restore();
    c.restore(); return;
  }
  const h = p.orient === 'h';
  // chambranle
  c.fillStyle = '#6d6252';
  if (h) { c.fillRect(X, Y + TS / 2 - 6, 3, 12); c.fillRect(X + TS - 3, Y + TS / 2 - 6, 3, 12); }
  else { c.fillRect(X + TS / 2 - 6, Y, 12, 3); c.fillRect(X + TS / 2 - 6, Y + TS - 3, 12, 3); }
  const coul = s.barricadee ? '#5a4632' : p.exterieure ? '#4c3a2a' : '#6a4a2e';
  if (ferme) {
    c.fillStyle = 'rgba(0,0,0,0.4)';
    if (h) c.fillRect(X + 2, Y + TS / 2 - 3, TS - 4, 8); else c.fillRect(X + TS / 2 - 3, Y + 2, 8, TS - 4);
    c.fillStyle = coul;
    if (h) c.fillRect(X + 2, Y + TS / 2 - 4, TS - 4, 8); else c.fillRect(X + TS / 2 - 4, Y + 2, 8, TS - 4);
    c.fillStyle = 'rgba(255,230,190,0.18)';
    if (h) c.fillRect(X + 2, Y + TS / 2 - 4, TS - 4, 1.5); else c.fillRect(X + TS / 2 - 4, Y + 2, 1.5, TS - 4);
    if (s.pv < s.pvMax) { c.strokeStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); const k = 1 - s.pv / s.pvMax; for (let n = 0; n < 1 + k * 5; n++) { const a = X + 6 + n * 4, b = Y + TS / 2; if (h) { c.moveTo(a, b - 3); c.lineTo(a + 3, b + 3); } else { c.moveTo(X + TS / 2 - 3, Y + 6 + n * 4); c.lineTo(X + TS / 2 + 3, Y + 9 + n * 4); } } c.stroke(); }
    if (s.barricadee) { c.fillStyle = '#7a6040'; if (h) { c.fillRect(X + 4, Y + TS / 2 - 7, 4, 14); c.fillRect(X + TS - 8, Y + TS / 2 - 7, 4, 14); } else { c.fillRect(X + TS / 2 - 7, Y + 4, 14, 4); c.fillRect(X + TS / 2 - 7, Y + TS - 8, 14, 4); } }
    if (s.etat === 'verrouillee') { c.fillStyle = '#b89a3a'; if (h) c.fillRect(X + TS - 10, Y + TS / 2 - 2, 4, 4); else c.fillRect(X + TS / 2 - 2, Y + TS - 10, 4, 4); }
    else { c.fillStyle = '#a89868'; if (h) c.fillRect(X + TS - 9, Y + TS / 2 - 1, 3, 2); else c.fillRect(X + TS / 2 - 1, Y + TS - 9, 2, 3); }
  } else {
    // battant ouvert, pivoté sur un gond
    c.fillStyle = coul;
    if (h) { c.translate(X + 3, Y + TS / 2); c.rotate(Math.PI / 2 * 0.92); c.fillRect(0, -3, TS - 6, 6); }
    else { c.translate(X + TS / 2, Y + 3); c.rotate(-Math.PI / 2 * 0.92); c.fillRect(0, -3, TS - 6, 6); }
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 3, TS - 6, 2);
  }
  c.restore();
}

// Corps au sol (décor ou mort tué)
export function dessinerCorps(c, x, y, a, r, sang = true, peau = '#8c8a78', vet = '#3a3530') {
  c.save(); c.translate(x, y); c.rotate(a);
  if (sang) { c.fillStyle = 'rgba(80,8,14,0.7)'; c.beginPath(); c.ellipse(4, 2, 16, 11, 0.3, 0, 7); c.fill(); c.fillStyle = 'rgba(110,14,22,0.55)'; c.beginPath(); c.ellipse(-2, 5, 9, 6, 0, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(2, 2, 13, 7, 0, 0, 7); c.fill();
  c.fillStyle = vet; c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, 7); c.fill();
  c.fillStyle = shade('#3a3530', 0.8); c.fillRect(-14, -5, 6, 3); c.fillRect(7, 3, 9, 3);
  c.fillStyle = peau; c.beginPath(); c.arc(-13, 0, 4.2, 0, 7); c.fill();
  c.restore();
}

// Personnage vu de dessus (joueur, coéquipier, PNJ). t = temps (ms), marche = 0..1 (balancement).
export function dessinerPersonnage(c, x, y, dir, style, t, marche, allure = 'marche') {
  const S = TS / 32;
  const court = allure === 'course', bas = allure === 'accroupi';
  c.save(); c.translate(x, y); c.rotate(dir);
  // Allure : la course allonge la foulée et penche le buste ; accroupi, on se ramasse et on avance à pas comptés.
  const freq = court ? 62 : bas ? 190 : 110;
  const amp = court ? 5.5 : bas ? 1.6 : 3;
  const b = Math.sin(t / freq) * amp * marche;
  if (court && marche > 0.3) { // traînées de vitesse
    c.strokeStyle = 'rgba(230,223,204,0.10)'; c.lineWidth = 1.5 * S;
    for (const k of [-5, 0, 5]) { c.beginPath(); c.moveTo(-12 * S, k * S); c.lineTo(-22 * S - Math.abs(b) * S, k * S); c.stroke(); }
  }
  if (bas) { c.scale(0.84, 0.92); c.strokeStyle = 'rgba(201,162,39,0.22)'; c.setLineDash([3 * S, 4 * S]); c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 15 * S, 0, 7); c.stroke(); c.setLineDash([]); }
  const pench = court ? 3 * S : bas ? -1 * S : 0;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(2 * S, 3 * S, (court ? 13 : 11) * S, (bas ? 13 : 12) * S, 0, 0, 7); c.fill();
  // pieds
  c.fillStyle = '#1b1a18';
  if (bas) { c.beginPath(); c.ellipse((b - 2) * S, -6.5 * S, 4.5 * S, 3 * S, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse((-b - 2) * S, 6.5 * S, 4.5 * S, 3 * S, 0, 0, 7); c.fill(); }
  else { c.beginPath(); c.ellipse(b * S, -5 * S, 4 * S, 2.6 * S, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-b * S, 5 * S, 4 * S, 2.6 * S, 0, 0, 7); c.fill(); }
  c.translate(pench, 0);
  // épaules / buste (accroupi : dos rond, plus large ; course : plus étroit)
  c.fillStyle = style.manteau; c.beginPath(); c.ellipse(-1 * S, 0, (bas ? 8 : court ? 6 : 6.5) * S, (bas ? 10.5 : court ? 9.2 : 10) * S, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1; c.stroke();
  // bras : en course ils balancent fort ; accroupi, ramenés devant
  const bb = court ? b * 0.9 : b * 0.3;
  c.fillStyle = style.manteau;
  if (bas) { c.beginPath(); c.ellipse(6 * S, 4 * S, 5 * S, 2.4 * S, 0.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(6 * S, -4 * S, 5 * S, 2.4 * S, -0.5, 0, 7); c.fill(); }
  else { c.beginPath(); c.ellipse((6 + (court ? -bb : 0)) * S, 6 * S, 5 * S, 2.6 * S, 0.2, 0, 7); c.fill(); c.beginPath(); c.ellipse((4 - bb) * S, -7 * S, 4.5 * S, 2.6 * S, -0.3, 0, 7); c.fill(); }
  if (style.lampe) { c.fillStyle = '#2a2a2a'; c.fillRect(9 * S, (bas ? 3 : 5) * S, 6 * S, 3 * S); c.fillStyle = '#f2e6b0'; c.fillRect(14 * S, (bas ? 3 : 5) * S, 1.5 * S, 3 * S); }
  // tête (accroupi : rentrée dans les épaules, en avant)
  const hx = bas ? 2.5 * S : court ? 1.5 * S : 0;
  c.fillStyle = style.cheveux; c.beginPath(); c.arc(hx, 0, (bas ? 4.8 : 5.2) * S, 0, 7); c.fill();
  c.fillStyle = style.peau; c.beginPath(); c.arc(hx + 1.8 * S, 0, 3 * S, -1.3, 1.3); c.fill();
  c.restore();
}

// Mort vu de dessus. z = { dir, type, etat }, marche 0..1
export function dessinerMort(c, x, y, z, t, marche) {
  const S = TS / 32;
  const rampe = z.type === 'rampant';
  const gros = z.type === 'colosse' || z.type === 'gonfleur' ? 1.3 : 1;
  const animal = z.type === 'chien_infecte' || z.type === 'fauve' || z.type === 'sanglier';
  c.save(); c.translate(x, y); c.rotate(z.dir); c.scale(gros, gros);
  const b = Math.sin(t / 180 + (z.uid ? z.uid.length : 0)) * 2.5 * marche;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(2 * S, 3 * S, (rampe || animal ? 14 : 11) * S, 10 * S, 0, 0, 7); c.fill();
  const peau = z.type === 'putrefie' ? '#6f6a4a' : z.type === 'gonfleur' ? '#7c7658' : z.type === 'militaire' ? '#4a5040' : '#7d8070';
  const vet = z.type === 'militaire' ? '#3d4632' : ['#3b3128', '#2e3136', '#463a36'][(z.uid || 'a').charCodeAt(z.uid ? z.uid.length - 1 : 0) % 3];
  if (animal) {
    c.fillStyle = z.type === 'sanglier' ? '#3a2c22' : z.type === 'fauve' ? '#8a6a3a' : '#4a3c30';
    c.beginPath(); c.ellipse(-2 * S, 0, 11 * S, 5.5 * S, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(10 * S, 0, 4.5 * S, 3.8 * S, 0, 0, 7); c.fill();
    c.fillStyle = '#b8342c'; c.fillRect(13 * S, -1 * S, 2 * S, 2 * S);
  } else if (rampe) {
    c.fillStyle = vet; c.beginPath(); c.ellipse(-4 * S, 0, 10 * S, 5 * S, 0, 0, 7); c.fill();
    c.fillStyle = peau; c.beginPath(); c.ellipse((9 + b) * S, -6 * S, 5 * S, 1.8 * S, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse((9 - b) * S, 6 * S, 5 * S, 1.8 * S, -0.3, 0, 7); c.fill();
    c.fillStyle = peau; c.beginPath(); c.arc(7 * S, 0, 4 * S, 0, 7); c.fill();
    c.fillStyle = 'rgba(90,10,14,0.8)'; c.fillRect(-15 * S, -3 * S, 4 * S, 6 * S);
  } else {
    c.fillStyle = '#1a1816'; c.beginPath(); c.ellipse(b * S, -5 * S, 4 * S, 2.6 * S, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-b * S, 5 * S, 4 * S, 2.6 * S, 0, 0, 7); c.fill();
    c.fillStyle = vet; c.beginPath(); c.ellipse(-1 * S, 0, 6 * S, 9.5 * S, 0, 0, 7); c.fill();
    // bras tendus
    c.fillStyle = peau; c.beginPath(); c.ellipse((8 + b) * S, -5.5 * S, 6.5 * S, 2 * S, 0.1, 0, 7); c.fill(); c.beginPath(); c.ellipse((8 - b) * S, 5.5 * S, 6.5 * S, 2 * S, -0.1, 0, 7); c.fill();
    c.fillStyle = peau; c.beginPath(); c.arc(1 * S, 0, 4.8 * S, 0, 7); c.fill();
    c.fillStyle = 'rgba(40,30,20,0.7)'; c.beginPath(); c.arc(-0.5 * S, 0, 3.5 * S, 1.8, 4.5); c.fill();
    c.fillStyle = 'rgba(100,12,18,0.7)'; c.fillRect(-3 * S, -8 * S, 4 * S, 3 * S);
  }
  c.restore();
}

export function dessinerObjetSol(c, x, y, doc, t) {
  c.save(); c.translate(x, y);
  const g = 0.5 + 0.5 * Math.sin(t / 400);
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-5, -3, 12, 10);
  if (doc) { c.rotate(-0.25); c.fillStyle = '#d8cfb4'; c.fillRect(-6, -8, 12, 15); c.fillStyle = 'rgba(40,30,20,0.6)'; for (let l = 0; l < 4; l++) c.fillRect(-4, -5 + l * 3, 8, 0.8); }
  else { c.fillStyle = '#6b6a60'; c.fillRect(-6, -5, 12, 9); c.fillStyle = '#8f8d80'; c.fillRect(-6, -5, 12, 2); }
  c.restore();
  c.fillStyle = `rgba(230,210,140,${0.25 + g * 0.35})`; c.beginPath(); c.arc(x + 5, y - 6, 1.6 + g, 0, 7); c.fill();
}
