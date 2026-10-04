// ============ Cinématiques — bibliothèque de primitives SVG ============
// Toutes les fonctions rendent des FRAGMENTS SVG (chaînes). Repère commun : hauteur H = 1000 unités,
// y vers le bas ; la largeur d'une couche est fournie par le lecteur (elle dépend de sa profondeur).
// Un cadre 2.39:1 fait F = 2390 unités de large au zoom 1.
// Aucun tirage n'utilise Math.random : tout passe par alea(graine) pour que les décors soient stables.

export const H = 1000;
export const RATIO = 2.39;
export const F = Math.round(H * RATIO);

// ---------- Nombres et hasard ----------
export const r1 = n => Math.round(n * 10) / 10;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

function hacher(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Générateur déterministe (mulberry32). alea('salon') ou alea(42) → fonction () => [0,1[.
export function alea(graine) {
  let a = typeof graine === 'number' ? graine >>> 0 : hacher(graine);
  const f = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.entre = (a0, b0) => a0 + (b0 - a0) * f();
  f.ent = (a0, b0) => Math.floor(a0 + (b0 - a0 + 1) * f());
  f.choix = arr => arr[Math.floor(f() * arr.length)];
  f.signe = () => (f() < 0.5 ? -1 : 1);
  return f;
}

// Identifiants uniques (dégradés) : plusieurs couches coexistent dans le document.
let compteur = 0;
export function uid(p = 'g') { return 'cn' + p + (++compteur).toString(36); }

// ---------- Couleurs ----------
function hexVers(c) { if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function versHex(r, g, b) { return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1); }
export function mix(a, b, t) {
  const A = hexVers(a), B = hexVers(b);
  return versHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
export const sombre = (c, t) => mix(c, '#000000', t);
export const clair = (c, t) => mix(c, '#ffffff', t);
// Désature vers le gris de même luminance.
export function desature(c, t) {
  const [r, g, b] = hexVers(c); const l = 0.3 * r + 0.59 * g + 0.11 * b;
  return versHex(r + (l - r) * t, g + (l - g) * t, b + (l - b) * t);
}

// ---------- Dégradés et lumière ----------
// stops : [[offset, couleur, opacité?], ...]
export function degrade(id, stops, dir = 'v') {
  const [x2, y2] = dir === 'h' ? [1, 0] : [0, 1];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
}
export function radial(id, stops) {
  return `<radialGradient id="${id}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2] === undefined ? 1 : s[2]}"/>`).join('')}</radialGradient>`;
}
// Ciel plein cadre en dégradé vertical.
export function ciel(L, stops, h = H) {
  const id = uid('ciel');
  return `<defs>${degrade(id, stops)}</defs><rect x="-2" y="-2" width="${L + 4}" height="${h + 4}" fill="url(#${id})"/>`;
}
// Halo radial doux (soleil, lampe, incendie).
export function halo(cx, cy, rx, ry, c, o = 0.5, attrs = '') {
  const id = uid('halo');
  return `<defs>${radial(id, [[0, c, o], [0.35, c, o * 0.45], [0.7, c, o * 0.12], [1, c, 0]])}</defs><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="url(#${id})" ${attrs}/>`;
}
// Bande de brume horizontale (de y0 à y1), opacités haut / milieu / bas.
export function brume(L, y0, y1, c, oH = 0, oM = 0.5, oB = 0) {
  const id = uid('brume');
  return `<defs>${degrade(id, [[0, c, oH], [0.55, c, oM], [1, c, oB]])}</defs><rect x="-2" y="${r1(y0)}" width="${L + 4}" height="${r1(y1 - y0)}" fill="url(#${id})"/>`;
}
// Rayons de lumière obliques (puits de soleil entre les arbres).
export function rayons(L, rnd, n, c, o = 0.12, pente = 0.35, y0 = 0, y1 = H) {
  const id = uid('ray');
  let s = `<defs>${degrade(id, [[0, c, o], [0.7, c, o * 0.4], [1, c, 0]])}</defs><g fill="url(#${id})">`;
  for (let i = 0; i < n; i++) {
    const x = rnd() * L, w = 30 + rnd() * 110, dx = (y1 - y0) * pente;
    s += `<path d="M${r1(x)} ${y0}h${r1(w)}l${r1(dx + w * 0.8)} ${y1 - y0}h${r1(-w * 2.2)}z" opacity="${r1(0.4 + rnd() * 0.6)}"/>`;
  }
  return s + '</g>';
}

// ---------- Ciel : étoiles, nuages, lune ----------
export function etoiles(L, yMax, n, graine, c = '#e6dfcc') {
  const rnd = alea(graine); let d = '', d2 = '';
  for (let i = 0; i < n; i++) {
    const x = r1(rnd() * L), y = r1(Math.pow(rnd(), 1.4) * yMax);
    if (rnd() < 0.12) d2 += `M${x} ${y}h.1`; else d += `M${x} ${y}h.1`;
  }
  return `<path d="${d}" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity="0.55"/><path d="${d2}" stroke="${c}" stroke-width="4.2" stroke-linecap="round" opacity="0.85"/>`;
}
export function lune(cx, cy, r, c = '#e9e3cf') {
  return halo(cx, cy, r * 5, r * 5, c, 0.22) + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/><circle cx="${r1(cx - r * 0.3)}" cy="${r1(cy - r * 0.2)}" r="${r1(r * 0.22)}" fill="#000" opacity="0.07"/><circle cx="${r1(cx + r * 0.25)}" cy="${r1(cy + r * 0.3)}" r="${r1(r * 0.15)}" fill="#000" opacity="0.06"/>`;
}
// Nuages étirés (stratus) : longues ellipses superposées, ventre plus sombre.
export function nuages(L, y0, y1, n, graine, c = '#ffffff', o = 0.5, ventre = null, cls = '') {
  const rnd = alea(graine); let s = `<g class="${cls}">`;
  for (let i = 0; i < n; i++) {
    const x = rnd() * L, y = y0 + rnd() * (y1 - y0), w = 180 + rnd() * 520, h = 10 + rnd() * 26;
    s += `<g opacity="${r1(o * (0.5 + rnd() * 0.5) * 100) / 100}">`;
    for (let k = 0; k < 4; k++) {
      const dx = (rnd() - 0.5) * w * 0.7, dy = (rnd() - 0.5) * h * 1.2;
      if (ventre) s += `<ellipse cx="${r1(x + dx)}" cy="${r1(y + dy + h * 0.45)}" rx="${r1(w * (0.3 + rnd() * 0.3))}" ry="${r1(h * 0.55)}" fill="${ventre}"/>`;
      s += `<ellipse cx="${r1(x + dx)}" cy="${r1(y + dy)}" rx="${r1(w * (0.3 + rnd() * 0.35))}" ry="${r1(h * (0.6 + rnd() * 0.6))}" fill="${c}"/>`;
    }
    s += '</g>';
  }
  return s + '</g>';
}
// Cumulus arrondis (ciel de beau temps, fumées d'incendie lointaines).
export function cumulus(x, y, w, h, graine, c, ombre, o = 1) {
  const rnd = alea(graine); let s = `<g opacity="${o}">`, t = '';
  for (let i = 0; i < 9; i++) {
    const u = rnd(), cx = x + (u - 0.5) * w, cy = y - Math.sin(u * Math.PI) * h * (0.4 + rnd() * 0.5), r = h * (0.35 + rnd() * 0.4);
    s += `<circle cx="${r1(cx)}" cy="${r1(cy + r * 0.25)}" r="${r1(r)}" fill="${ombre}"/>`;
    t += `<circle cx="${r1(cx - r * 0.12)}" cy="${r1(cy)}" r="${r1(r * 0.92)}" fill="${c}"/>`;
  }
  return s + t + `<rect x="${r1(x - w * 0.55)}" y="${r1(y)}" width="${r1(w * 1.1)}" height="${r1(h * 0.3)}" fill="${ombre}" opacity="0"/></g>`;
}

// ---------- Relief ----------
// Ligne de crête : rend une chaîne de points "x y" de 0 à L (bruit de valeur lissé multi-octaves).
export function crete(L, yBase, amp, graine, { pas = 40, rugosite = 0.5, octaves = 4, pics = 0 } = {}) {
  const rnd = alea(graine); const n = Math.ceil(L / pas) + 2;
  const val = [];
  for (let i = 0; i < n; i++) val.push(0);
  let a = 1, periode = n / 3;
  for (let o = 0; o < octaves; o++) {
    const k = Math.max(1, Math.round(periode)); const pts = [];
    for (let i = 0; i <= Math.ceil(n / k) + 1; i++) pts.push(rnd());
    for (let i = 0; i < n; i++) {
      const f = i / k, i0 = Math.floor(f), t = f - i0, s = t * t * (3 - 2 * t);
      val[i] += a * (pts[i0] + (pts[i0 + 1] - pts[i0]) * s);
    }
    a *= rugosite; periode /= 2.2;
  }
  let max = 0; for (const v of val) max = Math.max(max, v);
  const out = [];
  for (let i = 0; i < n; i++) {
    let v = val[i] / max;
    if (pics) v = Math.pow(v, 1 + pics);
    out.push([r1(i * pas - pas), r1(yBase - v * amp)]);
  }
  return out;
}
// Massif plein sous une crête (collines, Alpilles, falaises), avec dégradé vertical optionnel.
export function massif(L, yBase, amp, graine, fill, opts = {}) {
  const pts = crete(L, yBase, amp, graine, opts);
  const bas = opts.bas || H + 10;
  let f = fill;
  let defs = '';
  if (opts.degrade) { const id = uid('mas'); defs = `<defs>${degrade(id, opts.degrade)}</defs>`; f = `url(#${id})`; }
  return defs + `<path d="M-50 ${bas}L${pts.map(p => p.join(' ')).join('L')}L${L + 50} ${bas}Z" fill="${f}" ${opts.attrs || ''}/>`;
}
// Alpilles : calcaire déchiqueté, arêtes claires côté soleil.
export function alpilles(L, yBase, amp, graine, fill, lumiere = null) {
  const pts = crete(L, yBase, amp, graine, { pas: 22, rugosite: 0.62, octaves: 5, pics: 0.8 });
  let s = `<path d="M-50 ${H + 10}L${pts.map(p => p.join(' ')).join('L')}L${L + 50} ${H + 10}Z" fill="${fill}"/>`;
  if (lumiere) {
    const rnd = alea(graine + 'l'); let d = '';
    for (let i = 2; i < pts.length - 2; i++) {
      if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1] && rnd() < 0.8) {
        const [x, y] = pts[i]; const hh = (yBase - y) * (0.4 + rnd() * 0.5);
        d += `M${x} ${y}l${r1(-10 - rnd() * 25)} ${r1(hh)}l${r1(6 + rnd() * 10)} 0z`;
      }
    }
    s += `<path d="${d}" fill="${lumiere}" opacity="0.5"/>`;
  }
  return s;
}

// ---------- Végétation ----------
// Platane : tronc tacheté (écorce en camouflage), fourche, houppier en grappes à trois tons.
export function platane(x, yBase, h, rnd, o = {}) {
  const tronc = o.tronc || '#9c947c', taches = o.taches || ['#6f6a55', '#c9c2a4', '#857d63'];
  const feuille = o.feuille || ['#3e5226', '#5d7532', '#86a04a'];
  const w = h * 0.07, fourche = yBase - h * (o.fut || 0.48);
  const pench = (o.pench || 0) * h;
  let s = `<g class="platane">`;
  // Tronc légèrement évasé au pied.
  s += `<path d="M${r1(x - w * 0.8)} ${yBase}C${r1(x - w * 0.5)} ${r1(yBase - h * 0.1)} ${r1(x - w * 0.5 + pench * 0.5)} ${r1(fourche + h * 0.1)} ${r1(x - w * 0.45 + pench)} ${r1(fourche)}L${r1(x + w * 0.45 + pench)} ${r1(fourche)}C${r1(x + w * 0.5 + pench * 0.5)} ${r1(fourche + h * 0.1)} ${r1(x + w * 0.5)} ${r1(yBase - h * 0.1)} ${r1(x + w * 0.8)} ${yBase}Z" fill="${tronc}"/>`;
  // Taches d'écorce.
  for (let i = 0; i < 9; i++) {
    const ty = yBase - rnd() * (yBase - fourche), tx = x + pench * ((yBase - ty) / (yBase - fourche)) + (rnd() - 0.5) * w * 0.9;
    s += `<ellipse cx="${r1(tx)}" cy="${r1(ty)}" rx="${r1(w * (0.15 + rnd() * 0.25))}" ry="${r1(w * (0.3 + rnd() * 0.5))}" fill="${rnd.choix(taches)}" opacity="0.45"/>`;
  }
  // Ombre portée sur le côté droit.
  s += `<path d="M${r1(x + w * 0.1)} ${yBase}L${r1(x + w * 0.1 + pench)} ${r1(fourche)}L${r1(x + w * 0.45 + pench)} ${r1(fourche)}L${r1(x + w * 0.8)} ${yBase}Z" fill="#000" opacity="0.18"/>`;
  // Branches maîtresses.
  const bx = x + pench;
  const br = [[-0.34, -0.3], [0.05, -0.42], [0.36, -0.28]];
  let d = '';
  for (const [dx, dy] of br) d += `M${r1(bx)} ${r1(fourche + 4)}Q${r1(bx + dx * h * 0.3)} ${r1(fourche + dy * h * 0.4)} ${r1(bx + dx * h * 0.55)} ${r1(fourche + dy * h * 0.8)}`;
  s += `<path d="${d}" stroke="${tronc}" stroke-width="${r1(w * 0.55)}" fill="none" stroke-linecap="round"/>`;
  // Houppier en touffes : dessous sombre, milieu, dessus éclairé.
  if (!o.nu) {
    const cy = fourche - h * 0.3, rw = h * (o.large || 0.55), rh = h * 0.32;
    let g = `<g class="houppier">`;
    const couches = [[feuille[0], 1.0, 0.08, 22], [feuille[1], 0.82, -0.05, 16], [feuille[2], 0.5, -0.16, 9]];
    for (const [c, k, dy, n] of couches) {
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
        g += touffe(bx + Math.cos(a) * rw * rr * k, cy + dy * h + Math.sin(a) * rh * rr * k * 0.9, h * (0.07 + rnd() * 0.06), c, rnd, 12, o.opFeuille || 1);
      }
    }
    s += g + '</g>';
  }
  return s + '</g>';
}
// Touffe de feuillage : amas de petites feuilles-ellipses orientées (plus organique que des disques).
export function touffe(cx, cy, r, c, rnd, n = 14, o = 1) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * r, x = cx + Math.cos(a) * rr * 1.3, y = cy + Math.sin(a) * rr * 0.8;
    const e = r * (0.18 + rnd() * 0.22), ang = rnd() * 3.14;
    const dx = Math.cos(ang) * e, dy = Math.sin(ang) * e * 0.6;
    d += `M${r1(x - dx)} ${r1(y - dy)}Q${r1(x - dy * 0.9)} ${r1(y + dx * 0.9)} ${r1(x + dx)} ${r1(y + dy)}Q${r1(x + dy * 0.9)} ${r1(y - dx * 0.9)} ${r1(x - dx)} ${r1(y - dy)}Z`;
  }
  return `<path d="${d}" fill="${c}" opacity="${o}"/>`;
}
// Voûte de platanes : bande de feuillage continue en haut du cadre (rue vue de dessous), bord inférieur déchiqueté.
export function voute(L, yBas, rnd, couleurs, o = {}) {
  const [c0, c1, c2] = couleurs; let s = `<g class="voute">`;
  let d = `M-40 -10H${L + 40}V${r1(yBas * 0.3)}`;
  for (let x = L + 40; x > -60; x -= 30) d += `L${r1(x)} ${r1(yBas * (0.25 + rnd() * 0.25 + 0.2 * Math.sin(x / 260)))}`;
  s += `<path d="${d}Z" fill="${c0}"/>`;
  for (let x = -40; x < L + 40; x += 55 + rnd() * 40) {
    const y = yBas * (0.35 + rnd() * 0.5);
    s += touffe(x, y, 50 + rnd() * 50, c0, rnd, 16);
    if (rnd() < 0.6) s += touffe(x + (rnd() - 0.5) * 60, y - 40 - rnd() * 60, 40 + rnd() * 40, c1, rnd, 12, 0.9);
  }
  // Ciel qui perce entre les feuilles.
  if (o.trous) for (let i = 0; i < L / 120; i++) s += `<ellipse cx="${r1(rnd() * L)}" cy="${r1(rnd() * yBas * 0.4)}" rx="${r1(6 + rnd() * 16)}" ry="${r1(4 + rnd() * 10)}" fill="${o.trous}" opacity="${r1(0.5 + rnd() * 0.5)}"/>`;
  // Lumière sur les feuilles hautes.
  if (c2) for (let i = 0; i < L / 110; i++) s += touffe(rnd() * L, rnd() * yBas * 0.55, 20 + rnd() * 30, c2, rnd, 8, r1(0.35 + rnd() * 0.4));
  return s + '</g>';
}
export function cypres(x, yBase, h, c, pli = 0, cls = 'cypres') {
  const w = h * 0.16, p = pli * h;
  return `<g class="${cls}" data-x="${r1(x)}" data-y="${yBase}"><path d="M${r1(x - w * 0.5)} ${yBase}C${r1(x - w * 0.9)} ${r1(yBase - h * 0.4)} ${r1(x - w * 0.3 + p * 0.6)} ${r1(yBase - h * 0.8)} ${r1(x + p)} ${r1(yBase - h)}C${r1(x + w * 0.4 + p * 0.6)} ${r1(yBase - h * 0.75)} ${r1(x + w * 0.9)} ${r1(yBase - h * 0.35)} ${r1(x + w * 0.5)} ${yBase}Z" fill="${c}"/></g>`;
}
export function pin(x, yBase, h, c, rnd) {
  const w = h * 0.9; let s = `<path d="M${r1(x)} ${yBase}q${r1(-h * 0.03)} ${r1(-h * 0.4)} ${r1(h * 0.05)} ${r1(-h * 0.7)}" stroke="${c}" stroke-width="${r1(h * 0.045)}" fill="none"/>`;
  for (let i = 0; i < 6; i++) {
    const cx = x + h * 0.05 + (rnd() - 0.5) * w * 0.8, cy = yBase - h * (0.72 + rnd() * 0.2), rx = w * (0.18 + rnd() * 0.2);
    s += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(rx * 0.32)}" fill="${c}"/>`;
  }
  return s;
}
export function olivier(x, yBase, h, c, rnd, tronc) {
  let s = `<path d="M${r1(x - h * 0.05)} ${yBase}q${r1(h * 0.08)} ${r1(-h * 0.25)} ${r1(-h * 0.02)} ${r1(-h * 0.45)}M${r1(x + h * 0.04)} ${yBase}q${r1(h * 0.02)} ${r1(-h * 0.3)} ${r1(h * 0.12)} ${r1(-h * 0.42)}" stroke="${tronc || c}" stroke-width="${r1(h * 0.07)}" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 8; i++) {
    const cx = x + (rnd() - 0.5) * h * 0.9, cy = yBase - h * (0.55 + rnd() * 0.3), r = h * (0.14 + rnd() * 0.12);
    s += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(r * 1.3)}" ry="${r1(r * 0.8)}" fill="${c}" opacity="${r1(0.8 + rnd() * 0.2)}"/>`;
  }
  return s;
}
// Herbes : touffes de traits fins. couche = inclinaison (vent).
export function herbes(L, yBase, rnd, c, { densite = 0.25, hMax = 40, couche = 0, epais = 2, cls = 'herbes' } = {}) {
  let d = '';
  const n = Math.round(L * densite);
  for (let i = 0; i < n; i++) {
    const x = rnd() * L, y = yBase + rnd() * 20, hh = hMax * (0.4 + rnd() * 0.6), cb = couche * hh + (rnd() - 0.5) * hh * 0.3;
    d += `M${r1(x)} ${r1(y)}q${r1(cb * 0.3)} ${r1(-hh * 0.6)} ${r1(cb)} ${r1(-hh)}`;
  }
  return `<path class="${cls}" d="${d}" stroke="${c}" stroke-width="${epais}" fill="none" stroke-linecap="round"/>`;
}

// ---------- Architecture provençale ----------
const VOLETS = ['#5e7f95', '#6d8a78', '#8a9aa4', '#4f6f86', '#9b8a64', '#7a8f9c'];
const MURS = ['#d9a45b', '#e2c08e', '#cfa071', '#e6d3ad', '#c98f5a', '#dcb884', '#d3b58f'];
// Façade : enduit, génoise, tuiles, fenêtres à volets, rez-de-chaussée commerçant.
// o : { mur, volet, toit, nuit (0..1), lumiere (0..1 fenêtres allumées), enseigne, store, etages, voile (couleur de brume), voileO }
export function facade(x, yBase, w, h, rnd, o = {}) {
  const nuit = o.nuit || 0;
  let mur = o.mur || rnd.choix(MURS);
  let volet = o.volet || rnd.choix(VOLETS);
  let toit = o.toit || rnd.choix(['#a8583a', '#b86b45', '#9a4f35', '#b5613f']);
  if (o.tonalite) { mur = mix(mur, o.tonalite[0], o.tonalite[1]); volet = mix(volet, o.tonalite[0], o.tonalite[1]); toit = mix(toit, o.tonalite[0], o.tonalite[1]); }
  const murO = mix(mur, '#0b0d16', nuit * 0.82), voletO = mix(volet, '#0b0d16', nuit * 0.8), toitO = mix(toit, '#0b0d16', nuit * 0.85);
  const ombreMur = sombre(murO, 0.18), vitre = mix('#2a2a30', '#07080c', nuit);
  const top = yBase - h;
  let s = `<g class="facade">`;
  s += `<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}" fill="${murO}"/>`;
  // Salissures et patine.
  for (let i = 0; i < 4; i++) s += `<rect x="${r1(x + rnd() * w * 0.8)}" y="${r1(top + rnd() * h * 0.6)}" width="${r1(w * (0.1 + rnd() * 0.3))}" height="${r1(h * (0.1 + rnd() * 0.4))}" fill="${ombreMur}" opacity="${r1(0.12 + rnd() * 0.2)}"/>`;
  const idp = uid('pat');
  s += `<defs>${degrade(idp, [[0, '#000', 0], [0.7, '#000', 0.05], [1, '#000', 0.22]])}</defs><rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}" fill="url(#${idp})"/>`;
  // Toit : génoise + débord de tuiles.
  const deb = 14;
  s += `<rect x="${r1(x - deb)}" y="${r1(top - 16)}" width="${r1(w + deb * 2)}" height="18" fill="${toitO}"/>`;
  s += `<path d="M${r1(x - deb)} ${r1(top - 16)}L${r1(x + w * 0.1)} ${r1(top - 16 - (o.pente || 26))}H${r1(x + w * 0.9)}L${r1(x + w + deb)} ${r1(top - 16)}Z" fill="${sombre(toitO, 0.12)}"/>`;
  let tu = ''; for (let tx = x - deb + 6; tx < x + w + deb; tx += 9) tu += `M${r1(tx)} ${r1(top - 14)}v14`;
  s += `<path d="${tu}" stroke="${sombre(toitO, 0.35)}" stroke-width="2.4"/>`;
  s += `<rect x="${r1(x - 4)}" y="${r1(top + 2)}" width="${r1(w + 8)}" height="7" fill="${sombre(murO, 0.28)}"/><rect x="${r1(x - 2)}" y="${r1(top + 9)}" width="${r1(w + 4)}" height="5" fill="${sombre(murO, 0.18)}"/>`;
  // Fenêtres.
  const rdc = o.rdc === undefined ? Math.min(150, h * 0.3) : o.rdc;
  const etages = o.etages || Math.max(1, Math.floor((h - rdc - 40) / 120));
  const nf = Math.max(1, Math.round(w / 110));
  const pasX = w / nf, fw = Math.min(46, pasX * 0.42), fh = fw * 1.75;
  const pasY = (h - rdc - 30) / etages;
  for (let e = 0; e < etages; e++) {
    const fy = top + 34 + e * pasY + (pasY - fh) * 0.35;
    for (let i = 0; i < nf; i++) {
      const fx = x + pasX * (i + 0.5) - fw / 2;
      const etat = rnd();
      const allume = o.lumiere && rnd() < o.lumiere;
      s += `<rect x="${r1(fx - 3)}" y="${r1(fy - 3)}" width="${r1(fw + 6)}" height="${r1(fh + 6)}" fill="${clair(murO, 0.12)}" opacity="0.6"/>`;
      if (allume) {
        s += `<rect x="${r1(fx)}" y="${r1(fy)}" width="${r1(fw)}" height="${r1(fh)}" fill="${o.couleurLumiere || '#f0c26a'}" opacity="0.9"/>`;
      } else s += `<rect x="${r1(fx)}" y="${r1(fy)}" width="${r1(fw)}" height="${r1(fh)}" fill="${vitre}"/>`;
      if (etat < 0.4 && !allume) {
        // Volets fermés : persiennes.
        s += `<rect x="${r1(fx)}" y="${r1(fy)}" width="${r1(fw)}" height="${r1(fh)}" fill="${voletO}"/>`;
        let pl = ''; for (let py = fy + 5; py < fy + fh; py += 6) pl += `M${r1(fx + 2)} ${r1(py)}h${r1(fw - 4)}`;
        s += `<path d="${pl}" stroke="${sombre(voletO, 0.3)}" stroke-width="1.6"/><path d="M${r1(fx + fw / 2)} ${r1(fy)}v${r1(fh)}" stroke="${sombre(voletO, 0.4)}" stroke-width="1.5"/>`;
      } else {
        // Volets ouverts de part et d'autre.
        s += `<rect x="${r1(fx - fw * 0.5)}" y="${r1(fy)}" width="${r1(fw * 0.46)}" height="${r1(fh)}" fill="${voletO}"/><rect x="${r1(fx + fw * 1.04)}" y="${r1(fy)}" width="${r1(fw * 0.46)}" height="${r1(fh)}" fill="${voletO}"/>`;
        if (!allume) s += `<path d="M${r1(fx + fw / 2)} ${r1(fy)}v${r1(fh)}M${r1(fx)} ${r1(fy + fh * 0.4)}h${r1(fw)}" stroke="${sombre(murO, 0.5)}" stroke-width="1.4" opacity="0.6"/>`;
      }
      if (etat > 0.85 && e === 0) s += `<path d="M${r1(fx - 6)} ${r1(fy + fh)}h${r1(fw + 12)}M${r1(fx - 6)} ${r1(fy + fh - 18)}h${r1(fw + 12)}M${r1(fx - 4)} ${r1(fy + fh - 18)}v18M${r1(fx + fw + 4)} ${r1(fy + fh - 18)}v18M${r1(fx + fw / 2)} ${r1(fy + fh - 18)}v18" stroke="#1d1a18" stroke-width="2" opacity="${0.8 - nuit * 0.3}"/>`;
    }
  }
  // Descente d'eau.
  if (rnd() < 0.6) s += `<path d="M${r1(x + w - 6)} ${r1(top + 10)}V${yBase}" stroke="${sombre(murO, 0.35)}" stroke-width="4"/>`;
  // Rez-de-chaussée : vitrine ou portes.
  const ry = yBase - rdc;
  s += `<rect x="${r1(x)}" y="${r1(ry)}" width="${r1(w)}" height="${r1(rdc)}" fill="${sombre(murO, 0.1)}"/>`;
  if (o.enseigne || rnd() < 0.55) {
    const vx = x + w * 0.1, vw = w * 0.8, vy = ry + rdc * 0.25;
    const lum = o.vitrineAllumee ? (o.couleurLumiere || '#e8b865') : mix('#302a26', '#0a0a0e', nuit);
    s += `<rect x="${r1(vx)}" y="${r1(vy)}" width="${r1(vw)}" height="${r1(rdc * 0.75)}" fill="${lum}" opacity="${o.vitrineAllumee ? 0.8 : 1}"/>`;
    s += `<path d="M${r1(vx + vw * 0.33)} ${r1(vy)}v${r1(rdc * 0.75)}M${r1(vx + vw * 0.66)} ${r1(vy)}v${r1(rdc * 0.75)}" stroke="${sombre(murO, 0.5)}" stroke-width="3"/>`;
    if (o.store !== false && (o.store || rnd() < 0.5)) {
      const sc = o.store && o.store !== true ? o.store : rnd.choix([['#b8322c', '#e9dfc8'], ['#2f5f4a', '#e9dfc8'], ['#284c73', '#e2d8c0'], ['#8a6a2a', '#e9dfc8']]);
      s += store(vx - 10, vy - 6, vw + 20, 46, sc, nuit);
    }
    if (o.enseigne) {
      const txt = o.enseigne;
      const tw = Math.min(vw * 0.9, txt.length * 26 + 30);
      s += `<rect x="${r1(x + w / 2 - tw / 2)}" y="${r1(ry - 6)}" width="${r1(tw)}" height="34" fill="${mix('#1c1a17', '#07080c', nuit)}"/><text x="${r1(x + w / 2)}" y="${r1(ry + 20)}" font-family="Oswald, sans-serif" font-size="24" letter-spacing="3" text-anchor="middle" fill="${mix(o.couleurEnseigne || '#e6dfcc', '#20222a', nuit * 0.6)}">${txt}</text>`;
    }
  } else {
    const pw = Math.min(70, w * 0.3);
    s += `<path d="M${r1(x + w / 2 - pw / 2)} ${yBase}V${r1(ry + 20 + pw / 2)}a${r1(pw / 2)} ${r1(pw / 2)} 0 0 1 ${r1(pw)} 0V${yBase}Z" fill="${mix(sombre(volet, 0.35), '#07080c', nuit)}"/>`;
  }
  if (o.croix) s += croixPharmacie(x + w - 30, ry - 40, 22, o.croixAllumee);
  if (o.voile) s += `<rect x="${r1(x - deb)}" y="${r1(top - 50)}" width="${r1(w + deb * 2)}" height="${r1(h + 50)}" fill="${o.voile}" opacity="${o.voileO || 0.3}"/>`;
  return s + '</g>';
}
export function store(x, y, w, h, [c1, c2], nuit = 0) {
  const a = mix(c1, '#0b0d16', nuit * 0.8), b = mix(c2, '#0b0d16', nuit * 0.8);
  let s = `<path d="M${r1(x)} ${r1(y)}h${r1(w)}l14 ${r1(h)}h${r1(-w - 28)}z" fill="${b}"/>`;
  const n = Math.max(3, Math.round(w / 22));
  let d = '';
  for (let i = 0; i < n; i += 2) {
    const x0 = x + (w / n) * i, x1 = x + (w / n) * (i + 1);
    const k0 = (i / n) * (w + 28) - 14, k1 = ((i + 1) / n) * (w + 28) - 14;
    d += `M${r1(x0)} ${r1(y)}L${r1(x1)} ${r1(y)}L${r1(x + k1)} ${r1(y + h)}L${r1(x + k0)} ${r1(y + h)}Z`;
  }
  s += `<path d="${d}" fill="${a}"/>`;
  let fr = ''; for (let i = 0; i < n; i++) fr += `M${r1(x - 14 + i * (w + 28) / n)} ${r1(y + h)}q${r1((w + 28) / n / 2)} 12 ${r1((w + 28) / n)} 0`;
  s += `<path d="${fr}" fill="${a}"/>`;
  return s;
}
export function croixPharmacie(x, y, t, allumee = false) {
  const c = allumee ? '#46d27a' : '#2f6e45';
  const s = `<path d="M${r1(x - t / 3)} ${r1(y - t)}h${r1(t * 2 / 3)}v${r1(t * 2 / 3)}h${r1(t * 2 / 3)}v${r1(t * 2 / 3)}h${r1(-t * 2 / 3)}v${r1(t * 2 / 3)}h${r1(-t * 2 / 3)}v${r1(-t * 2 / 3)}h${r1(-t * 2 / 3)}v${r1(-t * 2 / 3)}h${r1(t * 2 / 3)}z" fill="${c}"/>`;
  return (allumee ? halo(x, y, t * 3, t * 3, '#46d27a', 0.35) : '') + s;
}
// Rangée de façades jointives sur toute la largeur L.
export function rangee(L, yBase, rnd, o = {}) {
  let s = '', x = -40;
  const enseignes = (o.enseignes || []).slice();
  while (x < L + 40) {
    const w = (o.wMin || 150) + rnd() * ((o.wMax || 260) - (o.wMin || 150));
    const h = (o.hMin || 300) + rnd() * ((o.hMax || 460) - (o.hMin || 300));
    const opt = Object.assign({}, o);
    let ens = null;
    for (let i = 0; i < enseignes.length; i++) if (enseignes[i].u * L >= x && enseignes[i].u * L < x + w) { ens = enseignes.splice(i, 1)[0]; break; }
    if (ens) Object.assign(opt, ens.o || {}, { enseigne: ens.txt });
    else opt.enseigne = null;
    s += facade(x, yBase, w, h, rnd, opt);
    x += w;
  }
  return s;
}
// Mer de toits vue d'en haut (vieille ville) : pans de tuiles en escalier, cheminées.
export function merToits(L, y0, y1, rnd, o = {}) {
  const tuile = o.tuile || '#a8583a', ombre = o.ombre || '#5b2d20', mur = o.mur || '#c9a57a';
  let s = '';
  const rangs = o.rangs || 7;
  for (let r = 0; r < rangs; r++) {
    const t = r / (rangs - 1), y = lerp(y0, y1, t), ech = 0.5 + t * 0.9;
    let x = -60 + rnd() * 40;
    const k = o.voile ? (1 - t) * (o.voileO || 0.5) : 0;
    while (x < L + 60) {
      const w = (80 + rnd() * 140) * ech, hh = (30 + rnd() * 40) * ech, mh = (20 + rnd() * 50) * ech;
      const cT = o.voile ? mix(tuile, o.voile, k) : tuile, cO = o.voile ? mix(ombre, o.voile, k) : ombre, cM = o.voile ? mix(mur, o.voile, k) : mur;
      s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(mh + (y1 - y) + 40)}" fill="${sombre(cM, 0.1 + rnd() * 0.2)}"/>`;
      if (rnd() < 0.5) s += `<path d="M${r1(x)} ${r1(y)}L${r1(x + w * 0.5)} ${r1(y - hh)}L${r1(x + w)} ${r1(y)}Z" fill="${cT}"/><path d="M${r1(x + w * 0.5)} ${r1(y - hh)}L${r1(x + w)} ${r1(y)}H${r1(x + w * 0.5)}Z" fill="${cO}" opacity="0.55"/>`;
      else s += `<path d="M${r1(x)} ${r1(y)}L${r1(x + w * 0.08)} ${r1(y - hh * 0.8)}H${r1(x + w)}V${r1(y)}Z" fill="${cT}"/>`;
      if (rnd() < 0.3) s += `<rect x="${r1(x + w * (0.2 + rnd() * 0.6))}" y="${r1(y - hh - 18 * ech)}" width="${r1(10 * ech)}" height="${r1(26 * ech)}" fill="${cO}"/>`;
      if (o.fenetres && rnd() < o.fenetres) s += `<rect x="${r1(x + w * 0.3)}" y="${r1(y + mh * 0.3)}" width="${r1(8 * ech)}" height="${r1(12 * ech)}" fill="${o.couleurFenetre || '#f0c26a'}"/>`;
      x += w - 4;
    }
  }
  return s;
}

// ---------- Monuments de Salon ----------
// Tour de l'Horloge : trois étages de pierre blonde, campanile de fer forgé, trois cloches, cadran (21 h 10).
export function tourHorloge(x, yBase, h, o = {}) {
  const pierre = o.pierre || '#b9a27a', ombre = sombre(pierre, 0.3), fer = o.fer || '#1b1a1c';
  const w = h * 0.3, top = yBase - h;
  const e = h * 0.78 / 3;
  let s = `<g class="tour-horloge">`;
  for (let i = 0; i < 3; i++) {
    const y = yBase - (i + 1) * e, ww = w * (1 - i * 0.04);
    s += `<rect x="${r1(x - ww / 2)}" y="${r1(y)}" width="${r1(ww)}" height="${r1(e)}" fill="${i === 1 ? clair(pierre, 0.04) : pierre}"/>`;
    s += `<rect x="${r1(x - ww / 2 - 6)}" y="${r1(y - 4)}" width="${r1(ww + 12)}" height="10" fill="${clair(pierre, 0.15)}"/>`;
    s += `<rect x="${r1(x + ww * 0.18)}" y="${r1(y)}" width="${r1(ww * 0.32)}" height="${r1(e)}" fill="${ombre}" opacity="0.45"/>`;
    // Pilastres.
    s += `<rect x="${r1(x - ww / 2)}" y="${r1(y)}" width="${r1(ww * 0.08)}" height="${r1(e)}" fill="${clair(pierre, 0.1)}"/><rect x="${r1(x + ww / 2 - ww * 0.08)}" y="${r1(y)}" width="${r1(ww * 0.08)}" height="${r1(e)}" fill="${ombre}" opacity="0.6"/>`;
  }
  // Porte voûtée au pied.
  s += `<path d="M${r1(x - w * 0.22)} ${yBase}V${r1(yBase - e * 0.55)}a${r1(w * 0.22)} ${r1(w * 0.22)} 0 0 1 ${r1(w * 0.44)} 0V${yBase}Z" fill="${o.porte || sombre(pierre, 0.75)}"/>`;
  // Niche / fenêtre du 2e étage.
  s += `<path d="M${r1(x - w * 0.1)} ${r1(yBase - e * 1.2)}v${r1(-e * 0.45)}a${r1(w * 0.1)} ${r1(w * 0.1)} 0 0 1 ${r1(w * 0.2)} 0v${r1(e * 0.45)}z" fill="${sombre(pierre, 0.7)}"/>`;
  // Cadran.
  const cy = yBase - e * 2.5, cr = w * 0.26;
  s += `<circle cx="${r1(x)}" cy="${r1(cy)}" r="${r1(cr + 6)}" fill="${sombre(pierre, 0.25)}"/><circle cx="${r1(x)}" cy="${r1(cy)}" r="${r1(cr)}" fill="${o.cadran || '#e9e1c8'}"/>`;
  let gr = ''; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; gr += `M${r1(x + Math.sin(a) * cr * 0.8)} ${r1(cy - Math.cos(a) * cr * 0.8)}L${r1(x + Math.sin(a) * cr * 0.92)} ${r1(cy - Math.cos(a) * cr * 0.92)}`; }
  s += `<path d="${gr}" stroke="#2a2622" stroke-width="3"/>`;
  // 21 h 10 : petite aiguille un peu après 9, grande sur 2.
  const ah = (9 + 10 / 60) / 12 * Math.PI * 2, am = 10 / 60 * Math.PI * 2;
  s += `<g class="aiguilles"><path d="M${r1(x)} ${r1(cy)}L${r1(x + Math.sin(ah) * cr * 0.5)} ${r1(cy - Math.cos(ah) * cr * 0.5)}" stroke="#1a1714" stroke-width="6" stroke-linecap="round"/><path class="grande-aiguille" d="M${r1(x)} ${r1(cy)}L${r1(x + Math.sin(am) * cr * 0.78)} ${r1(cy - Math.cos(am) * cr * 0.78)}" stroke="#1a1714" stroke-width="4" stroke-linecap="round"/></g>`;
  // Corniche et balustrade.
  const ty = yBase - e * 3;
  s += `<rect x="${r1(x - w * 0.56)}" y="${r1(ty - 14)}" width="${r1(w * 1.12)}" height="16" fill="${clair(pierre, 0.12)}"/>`;
  let bal = ''; for (let bx = x - w * 0.5; bx <= x + w * 0.5; bx += 12) bal += `M${r1(bx)} ${r1(ty - 14)}v-26`;
  s += `<path d="${bal}M${r1(x - w * 0.54)} ${r1(ty - 40)}h${r1(w * 1.08)}" stroke="${pierre}" stroke-width="5"/>`;
  // Campanile de fer forgé : cage en bulbe, trois cloches.
  const cb = ty - 40, ch = h - e * 3 - 40;
  s += `<g class="campanile" stroke="${fer}" fill="none" stroke-width="4">
    <path d="M${r1(x - w * 0.4)} ${r1(cb)}C${r1(x - w * 0.45)} ${r1(cb - ch * 0.5)} ${r1(x - w * 0.1)} ${r1(cb - ch * 0.8)} ${r1(x)} ${r1(cb - ch * 0.95)}C${r1(x + w * 0.1)} ${r1(cb - ch * 0.8)} ${r1(x + w * 0.45)} ${r1(cb - ch * 0.5)} ${r1(x + w * 0.4)} ${r1(cb)}"/>
    <path d="M${r1(x - w * 0.2)} ${r1(cb)}C${r1(x - w * 0.22)} ${r1(cb - ch * 0.5)} ${r1(x - w * 0.05)} ${r1(cb - ch * 0.8)} ${r1(x)} ${r1(cb - ch * 0.95)}C${r1(x + w * 0.05)} ${r1(cb - ch * 0.8)} ${r1(x + w * 0.22)} ${r1(cb - ch * 0.5)} ${r1(x + w * 0.2)} ${r1(cb)}"/>
    <path d="M${r1(x - w * 0.42)} ${r1(cb - ch * 0.35)}h${r1(w * 0.84)}" stroke-width="3"/>
    <path d="M${r1(x)} ${r1(cb - ch * 0.95)}v${r1(-ch * 0.12)}" stroke-width="3"/>
  </g>`;
  s += cloche(x, cb - ch * 0.62, w * 0.22, fer, 'cloche c1');
  s += cloche(x - w * 0.24, cb - ch * 0.2, w * 0.14, fer, 'cloche c2');
  s += cloche(x + w * 0.24, cb - ch * 0.2, w * 0.14, fer, 'cloche c3');
  return s + '</g>';
}
export function cloche(x, y, w, c, cls = 'cloche') {
  // Point de pivot en haut (data-*) pour l'animation de balancement.
  return `<g class="${cls}" data-x="${r1(x)}" data-y="${r1(y)}"><path d="M${r1(x - w * 0.15)} ${r1(y)}h${r1(w * 0.3)}v${r1(w * 0.12)}C${r1(x + w * 0.35)} ${r1(y + w * 0.2)} ${r1(x + w * 0.3)} ${r1(y + w * 0.6)} ${r1(x + w * 0.55)} ${r1(y + w * 0.95)}H${r1(x - w * 0.55)}C${r1(x - w * 0.3)} ${r1(y + w * 0.6)} ${r1(x - w * 0.35)} ${r1(y + w * 0.2)} ${r1(x - w * 0.15)} ${r1(y + w * 0.12)}Z" fill="${c}"/><circle cx="${r1(x)}" cy="${r1(y + w * 1.02)}" r="${r1(w * 0.09)}" fill="${c}"/></g>`;
}
// Rocher du Puech et château de l'Empéri (silhouette massive : donjon, courtines, tours).
export function emperi(x, yBase, w, o = {}) {
  const roc = o.roc || '#8a7a62', mur = o.mur || '#a8977a', ombre = o.ombre || sombre(mur, 0.35);
  const rnd = alea('emperi' + (o.graine || ''));
  const hr = w * 0.22;
  let s = `<g class="emperi">`;
  // Rocher.
  let d = `M${r1(x - w * 0.62)} ${yBase}`;
  const pts = 14;
  for (let i = 0; i <= pts; i++) {
    const t = i / pts, xx = x - w * 0.55 + t * w * 1.1;
    const yy = yBase - hr * Math.pow(Math.sin(t * Math.PI), 0.45) * (0.85 + rnd() * 0.15);
    d += `L${r1(xx)} ${r1(yy)}`;
  }
  d += `L${r1(x + w * 0.62)} ${yBase}Z`;
  s += `<path d="${d}" fill="${roc}"/>`;
  s += `<path d="M${r1(x + w * 0.05)} ${r1(yBase - hr * 0.95)}L${r1(x + w * 0.55)} ${r1(yBase - hr * 0.2)}L${r1(x + w * 0.62)} ${yBase}H${r1(x + w * 0.1)}Z" fill="${sombre(roc, 0.3)}" opacity="0.6"/>`;
  const base = yBase - hr * 0.92;
  // Courtine basse.
  s += `<rect x="${r1(x - w * 0.46)}" y="${r1(base - w * 0.1)}" width="${r1(w * 0.92)}" height="${r1(w * 0.12)}" fill="${mur}"/>`;
  s += creneaux(x - w * 0.46, base - w * 0.1, w * 0.92, w * 0.018, mur);
  // Corps de logis.
  s += `<rect x="${r1(x - w * 0.3)}" y="${r1(base - w * 0.2)}" width="${r1(w * 0.42)}" height="${r1(w * 0.12)}" fill="${sombre(mur, 0.05)}"/>`;
  s += `<path d="M${r1(x - w * 0.32)} ${r1(base - w * 0.2)}L${r1(x - w * 0.26)} ${r1(base - w * 0.25)}H${r1(x + w * 0.08)}L${r1(x + w * 0.14)} ${r1(base - w * 0.2)}Z" fill="${o.toit || sombre(mur, 0.45)}"/>`;
  // Donjon carré.
  s += `<rect x="${r1(x + w * 0.1)}" y="${r1(base - w * 0.34)}" width="${r1(w * 0.14)}" height="${r1(w * 0.26)}" fill="${mur}"/>`;
  s += creneaux(x + w * 0.1, base - w * 0.34, w * 0.14, w * 0.016, mur);
  s += `<rect x="${r1(x + w * 0.19)}" y="${r1(base - w * 0.34)}" width="${r1(w * 0.05)}" height="${r1(w * 0.26)}" fill="${ombre}" opacity="0.6"/>`;
  // Tours rondes aux angles.
  for (const [tx, th] of [[-0.44, 0.17], [0.4, 0.15], [-0.08, 0.14]]) {
    const cx = x + w * tx, tw = w * 0.07;
    s += `<rect x="${r1(cx - tw / 2)}" y="${r1(base - w * th)}" width="${r1(tw)}" height="${r1(w * th)}" fill="${mur}"/><rect x="${r1(cx + tw * 0.1)}" y="${r1(base - w * th)}" width="${r1(tw * 0.4)}" height="${r1(w * th)}" fill="${ombre}" opacity="0.55"/>`;
    s += creneaux(cx - tw / 2 - 3, base - w * th, tw + 6, w * 0.014, mur);
  }
  // Fenêtres (meurtrières), dont une éventuellement éclairée.
  let f = '';
  for (let i = 0; i < 9; i++) f += `M${r1(x - w * 0.26 + i * w * 0.045)} ${r1(base - w * 0.15)}v${r1(w * 0.03)}`;
  s += `<path d="${f}" stroke="${sombre(mur, 0.6)}" stroke-width="${r1(w * 0.008)}"/>`;
  if (o.fenetreAllumee) {
    const fx = x + w * 0.16, fy = base - w * 0.26;
    s += halo(fx, fy, w * 0.07, w * 0.07, '#f0c26a', 0.6) + `<rect class="fenetre-emperi" x="${r1(fx - w * 0.008)}" y="${r1(fy - w * 0.014)}" width="${r1(w * 0.016)}" height="${r1(w * 0.028)}" fill="#ffd98a"/>`;
  }
  return s + '</g>';
}
export function creneaux(x, y, w, t, c) {
  let d = '';
  for (let cx = x; cx < x + w - t * 0.5; cx += t * 2) d += `M${r1(cx)} ${r1(y)}h${r1(t)}v${r1(-t * 1.3)}h${r1(-t)}z`;
  return `<path d="${d}" fill="${c}"/>`;
}
// Fontaine Moussue : champignon de pierre barbu de mousse, quatre mascarons, bassin.
export function fontaineMoussue(x, yBase, h, o = {}) {
  const mousse = o.mousse || '#4d6b3a', mousse2 = o.mousse2 || '#6e8a4a', pierre = o.pierre || '#9c8e70', eau = o.eau || '#9fb8c0';
  const w = h * 1.1;
  let s = `<g class="fontaine-moussue">`;
  s += `<ellipse cx="${r1(x)}" cy="${r1(yBase - h * 0.08)}" rx="${r1(w * 0.75)}" ry="${r1(h * 0.1)}" fill="${sombre(pierre, 0.2)}"/>`;
  s += `<rect x="${r1(x - w * 0.75)}" y="${r1(yBase - h * 0.16)}" width="${r1(w * 1.5)}" height="${r1(h * 0.16)}" fill="${pierre}"/>`;
  s += `<ellipse cx="${r1(x)}" cy="${r1(yBase - h * 0.16)}" rx="${r1(w * 0.75)}" ry="${r1(h * 0.05)}" fill="${eau}" opacity="0.7"/>`;
  // Pied.
  s += `<rect x="${r1(x - w * 0.12)}" y="${r1(yBase - h * 0.7)}" width="${r1(w * 0.24)}" height="${r1(h * 0.56)}" fill="${sombre(mousse, 0.2)}"/>`;
  // Chapeau barbu.
  const rnd = alea('moussue');
  let d = `M${r1(x - w * 0.46)} ${r1(yBase - h * 0.52)}`;
  for (let i = 0; i <= 18; i++) { const t = i / 18; d += `L${r1(x - w * 0.46 + t * w * 0.92)} ${r1(yBase - h * (0.46 - rnd() * 0.08))}`; }
  d += `L${r1(x + w * 0.46)} ${r1(yBase - h * 0.6)}Q${r1(x + w * 0.4)} ${r1(yBase - h * 1.02)} ${r1(x)} ${r1(yBase - h)}Q${r1(x - w * 0.4)} ${r1(yBase - h * 1.02)} ${r1(x - w * 0.46)} ${r1(yBase - h * 0.6)}Z`;
  s += `<path d="${d}" fill="${mousse}"/>`;
  for (let i = 0; i < 10; i++) s += `<ellipse cx="${r1(x - w * 0.35 + rnd() * w * 0.6)}" cy="${r1(yBase - h * (0.65 + rnd() * 0.28))}" rx="${r1(w * 0.08)}" ry="${r1(h * 0.05)}" fill="${mousse2}" opacity="0.7"/>`;
  // Barbe pendante.
  let b = ''; for (let i = 0; i < 16; i++) { const bx = x - w * 0.44 + i * w * 0.058; b += `M${r1(bx)} ${r1(yBase - h * 0.5)}q${r1(rnd() * 6 - 3)} ${r1(h * 0.1)} 0 ${r1(h * (0.1 + rnd() * 0.12))}`; }
  s += `<path d="${b}" stroke="${mousse}" stroke-width="${r1(w * 0.03)}" stroke-linecap="round"/>`;
  // Mascarons et filets d'eau (classe pour l'animation).
  s += `<g class="filets" stroke="${eau}" stroke-width="${r1(h * 0.018)}" fill="none" stroke-linecap="round" opacity="0.85">`;
  for (const dx of [-0.3, -0.1, 0.1, 0.3]) s += `<path d="M${r1(x + dx * w)} ${r1(yBase - h * 0.42)}q${r1(dx * w * 0.6)} ${r1(h * 0.05)} ${r1(dx * w * 0.9)} ${r1(h * 0.26)}" stroke-dasharray="${r1(h * 0.05)} ${r1(h * 0.03)}"/>`;
  s += `</g>`;
  return s + '</g>';
}
// Clocher provençal (campanile de fer au-dessus d'une tour carrée) — églises de village.
export function clocherVillage(x, yBase, h, c, o = {}) {
  const w = h * 0.26;
  let s = `<rect x="${r1(x - w / 2)}" y="${r1(yBase - h * 0.8)}" width="${r1(w)}" height="${r1(h * 0.8)}" fill="${c}"/>`;
  s += `<path d="M${r1(x - w * 0.18)} ${r1(yBase - h * 0.62)}v${r1(-h * 0.1)}a${r1(w * 0.18)} ${r1(w * 0.18)} 0 0 1 ${r1(w * 0.36)} 0v${r1(h * 0.1)}z" fill="${o.baie || sombre(c, 0.6)}"/>`;
  s += `<path d="M${r1(x - w * 0.4)} ${r1(yBase - h * 0.8)}C${r1(x - w * 0.4)} ${r1(yBase - h * 0.95)} ${r1(x)} ${r1(yBase - h)} ${r1(x)} ${r1(yBase - h)}C${r1(x)} ${r1(yBase - h)} ${r1(x + w * 0.4)} ${r1(yBase - h * 0.95)} ${r1(x + w * 0.4)} ${r1(yBase - h * 0.8)}" stroke="${c}" stroke-width="4" fill="none"/>`;
  if (o.cloche !== false) s += cloche(x, yBase - h * 0.93, w * 0.35, c, o.clsCloche || 'cloche');
  return s;
}

// ---------- Humains et morts ----------
// Un corps DESSINÉ COMME UN CORPS, pas en bâtons : cuisses plus larges que les mollets, chevilles fines, pieds chaussés qui
// déroulent le pas (talon qui se lève, pointe qui se relève à l'attaque), mains (paume, doigts, pouce), cou, tête de profil
// (front, nez, lèvres, menton, mâchoire), cheveux ; le bras et la jambe du fond sont plus sombres (profondeur).
// Chaque partie est un chemin plein marqué data-k : l'animation (js/cine/anim.js) les recalcule sans rien reconstruire.
// Angles en degrés, 0 = vers le bas, positif = vers l'avant (sens du regard).
// p : { pench, tete (inclinaison), jambes: [[cuisse, genou], …], bras: [[epaule, coude], …], assis?, poing?, doigts? }
//   jambes[0] / bras[0] : côté proche ; [1] : côté du fond.
const RAD = Math.PI / 180;
const PROP = { cuisse: 0.235, tibia: 0.215, torse: 0.29, cou: 0.052, rt: 0.061, bras: 0.165, avant: 0.148 };
export function squelette(x, yBase, h, p, sens = 1) {
  const P = PROP, cuisse = P.cuisse * h, tibia = P.tibia * h, torse = P.torse * h, rt = P.rt * h;
  const pt = (ox, oy, ang, len) => [ox + Math.sin(ang * RAD) * len * sens, oy + Math.cos(ang * RAD) * len];
  const jambes = p.jambes.map(([a, b]) => { const g = pt(0, 0, a, cuisse); const f = pt(g[0], g[1], a - b, tibia); return { g, f, s: a - b }; });
  const pench = p.pench || 0;
  const epaule = pt(0, 0, 180 - pench, torse);
  const angT = 180 - pench - (p.tete || 0);
  const tete = pt(epaule[0], epaule[1], angT, P.cou * h + rt * 0.92);
  const art = pt(0, 0, 180 - pench, torse * 0.9);                 // articulation de l'épaule, un peu sous le haut du torse
  const bras = p.bras.map(([a, b]) => { const c = pt(art[0], art[1], a, P.bras * h); const m = pt(c[0], c[1], a + b, P.avant * h); return { e: art, c, m, ang: a + b }; });
  // pieds : le talon se lève quand la jambe passe derrière, la pointe se relève quand elle attaque devant
  const pieds = jambes.map(j => { const s = j.s; return s < -8 ? (-s - 8) * 0.9 : s > 12 ? -(s - 12) * 0.6 : 0; });
  let bas = 0;
  jambes.forEach((j, i) => { for (const q of PIED) bas = Math.max(bas, j.f[1] + rotPied(q, pieds[i], h, 1)[1]); });
  if (p.assis) bas = p.assis * h;
  const dx = x, dy = yBase - bas;
  const T = (q) => [q[0] + dx, q[1] + dy];
  return {
    h, sens, pench, angT, rt,
    hanche: T([0, 0]), epaule: T(epaule), tete: { x: tete[0] + dx, y: tete[1] + dy, r: rt },
    jambes: jambes.map((j, i) => ({ g: T(j.g), f: T(j.f), pied: pieds[i] })),
    bras: bras.map(b => ({ e: T(b.e), c: T(b.c), m: T(b.m), ang: b.ang })),
    mains: bras.map(b => T(b.m)), poing: !!p.poing, doigts: p.doigts ?? 22,
  };
}
// Chaussure (repère de la cheville, unités de h, x vers l'avant, y vers le bas).
const PIED = [[-0.044, 0.006], [-0.03, -0.02], [0.018, -0.017], [0.07, 0.01], [0.103, 0.023], [0.113, 0.035], [0.102, 0.046], [-0.038, 0.046], [-0.05, 0.03]];
function rotPied(q, deg, h, sens) {
  const a = deg * RAD, x = q[0] * h, y = q[1] * h;
  return [(x * Math.cos(a) - y * Math.sin(a)) * sens, x * Math.sin(a) + y * Math.cos(a)];
}
// Tête de profil et cheveux (repère de la tête, unités du rayon ; x vers l'avant, y vers le bas).
const TETE = [[-0.98, -0.05], [-0.86, -0.62], [-0.36, -0.98], [0.3, -0.98], [0.78, -0.62], [0.9, -0.26], [0.85, -0.08], [1.1, 0.17], [0.92, 0.3], [0.97, 0.44], [0.88, 0.57], [0.91, 0.71], [0.72, 0.86], [0.3, 0.84], [-0.04, 0.56], [-0.36, 0.52], [-0.76, 0.36]];
const CHEV_COURTS = [[-1.05, 0.06], [-1.01, -0.6], [-0.46, -1.09], [0.3, -1.09], [0.83, -0.72], [0.88, -0.5], [0.56, -0.63], [0.1, -0.56], [-0.28, -0.3], [-0.44, 0.12], [-0.76, 0.44]];
const CHEV_LONGS = [[-1.06, 0.06], [-1.01, -0.62], [-0.46, -1.1], [0.3, -1.09], [0.85, -0.72], [0.9, -0.46], [0.52, -0.6], [0.06, -0.5], [-0.24, -0.1], [-0.28, 0.7], [-0.3, 1.5], [-0.8, 1.62], [-1.12, 0.9]];
const CHAPEAU = [[-1.62, -0.5], [-0.82, -0.6], [-0.74, -1.32], [0.7, -1.34], [0.82, -0.62], [1.66, -0.54], [1.62, -0.42], [-1.6, -0.38]];

const f1 = (q) => `${r1(q[0])} ${r1(q[1])}`;
// Spline de Catmull-Rom fermée → chemin de Bézier ; orientée comme les capsules (aire négative à l'écran) pour que les
// parties d'un même chemin se recouvrent sans trou.
function lisse(pts, k = 1) {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  if (a > 0) pts = pts.slice().reverse();
  const n = pts.length, P = (i) => pts[(i + n) % n];
  let d = `M${f1(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
    d += `C${f1(c1)} ${f1(c2)} ${f1(p2)}`;
  }
  return d + 'Z';
}
// Capsule effilée de a (rayon ra) à b (rayon rb), galbée d'un côté (gonfle > 0 : vers l'avant du corps, < 0 : vers l'arrière).
function capsule(a, b, ra, rb, gonfle = 0, sens = 1) {
  let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1e-6; dx /= L; dy /= L;
  const nx = -dy, ny = dx;
  const avant = Math.sign(nx * sens) || 1;                 // le côté +n regarde-t-il vers l'avant du corps ?
  const gP = gonfle * avant > 0 ? Math.abs(gonfle) : 0, gM = gonfle * avant < 0 ? Math.abs(gonfle) : 0;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, rm = (ra + rb) / 2;
  const a1 = [a[0] + nx * ra, a[1] + ny * ra], b1 = [b[0] + nx * rb, b[1] + ny * rb], b2 = [b[0] - nx * rb, b[1] - ny * rb], a2 = [a[0] - nx * ra, a[1] - ny * ra];
  const c1 = [mx + nx * (rm + gP * 2), my + ny * (rm + gP * 2)], c2 = [mx - nx * (rm + gM * 2), my - ny * (rm + gM * 2)];
  return `M${f1(a1)}Q${f1(c1)} ${f1(b1)}A${r1(rb)} ${r1(rb)} 0 0 0 ${f1(b2)}Q${f1(c2)} ${f1(a2)}A${r1(ra)} ${r1(ra)} 0 0 0 ${f1(a1)}Z`;
}
const versDir = (o, ang, len, sens) => [o[0] + Math.sin(ang * RAD) * len * sens, o[1] + Math.cos(ang * RAD) * len];

// Toutes les parties d'un corps (clé → chemin). o : options de humain (robe, manteau, cheveux, chapeau, sac, lampe…).
export function formes(x, yBase, h, nomPose, phase = 0, sens = 1, o = {}) {
  const p = typeof nomPose === 'string' ? pose(nomPose, phase) : nomPose;
  const k = squelette(x, yBase, h, p, sens);
  const F = {};
  // jambes (cuisse galbée devant, mollet derrière) et chaussures
  k.jambes.forEach((j, i) => {
    F['j' + i] = capsule(k.hanche, j.g, 0.058 * h, 0.04 * h, 0.012 * h, sens) + capsule(j.g, j.f, 0.039 * h, 0.022 * h, -0.016 * h, sens);
    F['p' + i] = lisse(PIED.map(q => { const r = rotPied(q, j.pied, h, sens); return [j.f[0] + r[0], j.f[1] + r[1]]; }), 0.9);
  });
  // torse de profil : bassin, ventre, poitrine, dos, omoplates, base du cou
  const ux = (k.epaule[0] - k.hanche[0]) / (PROP.torse * h), uy = (k.epaule[1] - k.hanche[1]) / (PROP.torse * h);
  const fx = -uy * sens, fy = ux * sens;
  const T = (t, w) => [k.hanche[0] + ux * PROP.torse * h * t + fx * w * h, k.hanche[1] + uy * PROP.torse * h * t + fy * w * h];
  F.corps = lisse([T(-0.1, 0.048), T(0.14, 0.054), T(0.4, 0.048), T(0.64, 0.062), T(0.86, 0.054), T(1.0, 0.032), T(1.07, 0.02),
    T(1.07, -0.026), T(0.97, -0.054), T(0.76, -0.064), T(0.5, -0.05), T(0.3, -0.042), T(0.1, -0.06), T(-0.07, -0.066), T(-0.18, -0.03)]);
  // cou et tête
  const t = k.tete, hx = Math.sin(k.angT * RAD) * sens, hy = Math.cos(k.angT * RAD);      // « haut » de la tête
  const ax = -hy * sens, ay = hx * sens;                                                    // « avant » de la tête
  const H2 = (q) => [t.x + ax * q[0] * t.r - hx * q[1] * t.r, t.y + ay * q[0] * t.r - hy * q[1] * t.r];
  F.cou = capsule(T(0.98, -0.006), H2([-0.12, 0.62]), 0.027 * h, 0.024 * h, 0, sens);
  F.tete = lisse(TETE.map(H2), 1);
  if (o.cheveux) F.cheveux = lisse((o.cheveuxLongs ? CHEV_LONGS : CHEV_COURTS).map(H2), 1);
  if (o.chapeau) F.chapeau = lisse(CHAPEAU.map(H2), 0.6);
  // bras (biceps, avant-bras) et mains (paume, doigts repliés, pouce)
  k.bras.forEach((b, i) => {
    F['b' + i] = capsule(b.e, b.c, 0.04 * h, 0.03 * h, -0.006 * h, sens) + capsule(b.c, b.m, 0.03 * h, 0.02 * h, 0.006 * h, sens);
    const paume = versDir(b.m, b.ang, 0.046 * h, sens);
    const plie = k.poing ? 95 : k.doigts;
    const bout = versDir(paume, b.ang + plie, (k.poing ? 0.026 : 0.044) * h, sens);
    const pouceA = versDir(b.m, b.ang + 90, 0.012 * h, sens), pouceB = versDir(pouceA, b.ang + 38, 0.03 * h, sens);
    F['m' + i] = capsule(b.m, paume, 0.018 * h, 0.021 * h, 0, sens) + capsule(paume, bout, 0.019 * h, 0.011 * h, 0, sens) + capsule(pouceA, pouceB, 0.009 * h, 0.0065 * h, 0, sens);
  });
  // vêtements longs : robe (évasée, suit les genoux), manteau (des épaules à mi-cuisse, le vent le pousse)
  const genoux = k.jambes.map(j => j.g);
  const avantG = Math.max(...genoux.map(g => (g[0] - k.hanche[0]) * sens)), arriereG = Math.min(...genoux.map(g => (g[0] - k.hanche[0]) * sens));
  const yG = Math.max(...genoux.map(g => g[1]));
  if (o.robe) F.robe = lisse([T(0.36, 0.05), [k.hanche[0] + (avantG + 0.05 * h) * sens, yG + 0.035 * h], [k.hanche[0] + (arriereG - 0.06 * h) * sens, yG + 0.04 * h], T(0.36, -0.048)], 0.7);
  if (o.manteau) {
    const v = (o.vent || 0) * -sens * 0.6;
    F.manteau = lisse([T(1.0, 0.04), T(0.62, 0.068), T(0.2, 0.066), [k.hanche[0] + (avantG * 0.6 + 0.06 * h) * sens + v * 0.5, k.hanche[1] + 0.2 * h],
      [k.hanche[0] + (arriereG * 0.6 - 0.07 * h) * sens + v, k.hanche[1] + 0.21 * h], T(0.2, -0.07), T(0.7, -0.07), T(0.98, -0.058)], 0.8);
  }
  if (o.sac) { const [mx, my] = k.mains[0]; F.sac = `M${f1([mx - 0.012 * h, my + 0.01 * h])}l${r1(-0.035 * h)} ${r1(0.03 * h)}v${r1(0.075 * h)}q0 ${r1(0.012 * h)} ${r1(0.012 * h)} ${r1(0.012 * h)}h${r1(0.075 * h)}q${r1(0.012 * h)} 0 ${r1(0.012 * h)} ${r1(-0.012 * h)}v${r1(-0.075 * h)}l${r1(-0.035 * h)} ${r1(-0.03 * h)}z`; }
  if (o.lampe) { const [mx, my] = k.mains[0]; const q = versDir([mx, my], k.bras[0].ang, 0.05 * h, sens); F.lampe = `M${f1([q[0] - 0.022 * h, q[1]])}a${r1(0.022 * h)} ${r1(0.022 * h)} 0 1 0 ${r1(0.044 * h)} 0a${r1(0.022 * h)} ${r1(0.022 * h)} 0 1 0 ${r1(-0.044 * h)} 0z`; }
  if (o.sonnaille) F.sonnaille = `M${f1(T(0.95, 0.02))}h${r1(0.04 * h * sens)}l${r1(0.01 * h * sens)} ${r1(0.06 * h)}h${r1(-0.06 * h * sens)}z`;
  F._k = k;
  return F;
}
// Poses nommées. phase (0..1) pour la marche et la course : une vraie foulée (genou qui se plie au passage, bras opposés).
function foulee(phase, ampC = 18, ampG = 48, base = 6, decal = 6) {
  const jambe = (ph) => {
    const a = decal + ampC * Math.sin(ph * Math.PI * 2);                                   // la cuisse va plus loin devant que derrière
    const g = base + ampG * Math.pow(Math.max(0, Math.cos((ph + 0.04) * Math.PI * 2)), 1.6);  // le genou se plie au passage
    return [a, g];
  };
  return [jambe(phase), jambe(phase + 0.5)];
}
export function pose(nom, phase = 0) {
  const s = Math.sin(phase * Math.PI * 2);
  const bras = (amp, coude = 16) => [[-amp * s, coude + 8 * Math.max(0, -s)], [amp * s, coude + 8 * Math.max(0, s)]];
  switch (nom) {
    case 'debout': return { pench: 2, tete: -2, jambes: [[4, 2], [-3, 1]], bras: [[3, 8], [-4, 10]], doigts: 30 };
    case 'marche': return { pench: 4, tete: -3, jambes: foulee(phase), bras: bras(18), doigts: 26 };
    case 'cabas': return { pench: 3, tete: -2, jambes: foulee(phase, 16, 42), bras: [[5, 4], [-12 * s, 14]], doigts: 70 };
    case 'court': return { pench: 16, tete: -10, jambes: foulee(phase, 36, 100, 14, 12), bras: [[-46 * s, 84], [46 * s, 84]], poing: true };
    case 'courbe': return { pench: 26, tete: -10, jambes: foulee(phase, 14, 38, 14, 14), bras: [[30, 40], [12, 58]], doigts: 50 };
    case 'mort': return { pench: 12 + s * 3, tete: 28, jambes: [[10 * s, 6], [-12 * s, 14]], bras: [[18, 10], [-4, 2]], doigts: 10 };
    case 'mort_bras': return { pench: 10, tete: 20, jambes: [[10 * s, 6], [-10 * s, 12]], bras: [[80, 10], [70, 20]], doigts: 40 };
    case 'mort_leve': return { pench: -4, tete: -40, jambes: [[3, 0], [-3, 2]], bras: [[10, 0], [-6, 0]], doigts: 10 };
    case 'penche': return { pench: 58, tete: 40, jambes: [[12, 20], [-8, 6]], bras: [[70, 40], [50, 50]], doigts: 40 };
    case 'accroupi': return { pench: 40, tete: 10, jambes: [[90, 150], [80, 140]], bras: [[60, 20], [40, 30]] };
    case 'assis': return { pench: 6, tete: 10, assis: 0.02, jambes: [[90, 90], [85, 80]], bras: [[40, 50], [30, 60]] };
    case 'assis_sol': return { pench: 12, tete: 18, assis: 0.02, jambes: [[90, 10], [80, 30]], bras: [[30, 40], [20, 50]] };
    case 'bras_leves': return { pench: -2, tete: -10, jambes: [[4, 0], [-4, 0]], bras: [[170, 8], [158, 12]], doigts: 6 };
    case 'bras_tendus': return { pench: 0, tete: -25, jambes: [[5, 0], [-5, 0]], bras: [[150, 5], [140, 5]], doigts: 8 };
    case 'porte_lampe': return { pench: 6, jambes: foulee(phase, 16, 44), bras: [[70, 10], [-12 * s, 14]], poing: true };
    case 'regarde_mains': return { pench: 20, tete: 40, assis: 0.02, jambes: [[90, 10], [80, 20]], bras: [[70, 70], [60, 80]], doigts: 14 };
    case 'redresse': return { pench: 10, tete: 30, assis: 0.02, jambes: [[90, 80], [70, 60]], bras: [[20, 30], [60, 70]] };
    case 'porte_redon': return { pench: 4, tete: 6, jambes: foulee(phase, 16, 44), bras: [[40, 90], [30, 100]], poing: true };
    case 'leve_cloche': return { pench: -4, tete: -10, jambes: foulee(phase, 14, 40), bras: [[165, 5], [20, 60]], poing: true };
    default: return pose('debout');
  }
}
// Silhouette humaine complète. o : { corps, jambes, tete, bras, cheveux, cheveuxLongs, sens, robe, manteau, vent, sac, chapeau,
//   lampe, enfant, sonnaille, cls, attrs }
const ORDRE = [['b1', 'manche', 0.16], ['m1', 'peau', 0.16], ['j1', 'jambes', 0.15], ['p1', 'chaussure', 0.15], ['j0', 'jambes', 0], ['p0', 'chaussure', 0],
  ['robe', 'robe', 0], ['corps', 'corps', 0], ['manteau', 'manteau', 0], ['cou', 'peau', 0.12], ['tete', 'peau', 0], ['cheveux', 'cheveux', 0],
  ['chapeau', 'chapeau', 0], ['sonnaille', 'sonnaille', 0], ['sac', 'sac', 0], ['b0', 'manche', 0], ['m0', 'peau', 0], ['lampe', 'lampe', 0]];
// Options qui ajoutent des parties (gardées sur le groupe animé : data-o).
export const OPTIONS_FORMES = ['robe', 'manteau', 'cheveux', 'cheveuxLongs', 'chapeau', 'sac', 'lampe', 'sonnaille', 'vent'];
export function humain(x, yBase, h, nomPose, o = {}, phase = 0) {
  const sens = o.sens || 1;
  const F = formes(x, yBase, h, nomPose, phase, sens, o);
  const cc = o.corps || '#111111', cj = o.jambes || cc, ct = o.tete || cc;
  const coul = { corps: cc, jambes: cj, peau: ct, manche: o.bras || sombre(cc, 0.08), chaussure: mix(sombre(cj, 0.45), '#16130f', 0.5), robe: o.robe, manteau: o.manteau,
    cheveux: o.cheveux, chapeau: o.chapeau, sac: o.sac, lampe: o.lampe, sonnaille: o.sonnaille };
  let s = `<g class="${o.cls || 'humain'}" ${o.attrs || ''}>`;
  for (const [cle, c, fonce] of ORDRE) {
    const d = F[cle]; if (!d || !coul[c]) continue;
    s += `<path class="h-${cle}" data-k="${cle}" d="${d}" fill="${fonce ? sombre(coul[c], fonce) : coul[c]}"/>`;
  }
  if (o.enfant) { const k = F._k; s += humain(k.epaule[0] - h * 0.04 * sens, k.epaule[1] + h * 0.02, h * 0.36, 'assis', { corps: o.enfant, sens }); }
  return s + '</g>';
}
// Parties seules (pour animer une marche sans reconstruire la silhouette) : { clé: chemin }.
export function membres(x, yBase, h, nomPose, phase, sens = 1, o = {}) { return formes(x, yBase, h, nomPose, phase, sens, o); }
// Corps couché (mort au sol, housse).
export function gisant(x, yBase, lg, c, o = {}) {
  const e = lg * 0.16;
  if (o.housse) return `<g class="housse"><path d="M${r1(x)} ${r1(yBase)}c${r1(lg * 0.02)} ${r1(-e * 0.9)} ${r1(lg * 0.2)} ${r1(-e * 1.1)} ${r1(lg * 0.3)} ${r1(-e * 0.9)}c${r1(lg * 0.2)} ${r1(-e * 0.3)} ${r1(lg * 0.5)} ${r1(-e * 0.2)} ${r1(lg * 0.66)} ${r1(-e * 0.4)}c${r1(lg * 0.02)} ${r1(e * 0.3)} ${r1(lg * 0.04)} ${r1(e * 0.9)} 0 ${r1(e * 1.3)}Z" fill="${c}"/><path d="M${r1(x + lg * 0.05)} ${r1(yBase - e * 0.9)}h${r1(lg * 0.85)}" stroke="${sombre(c, 0.25)}" stroke-width="2" opacity="0.7"/>${o.etiquette ? `<rect x="${r1(x + lg * 0.9)}" y="${r1(yBase - e * 0.4)}" width="${r1(lg * 0.07)}" height="${r1(e * 0.35)}" fill="${o.etiquette}"/>` : ''}</g>`;
  return `<path d="M${r1(x)} ${r1(yBase)}q${r1(lg * 0.1)} ${r1(-e * 1.4)} ${r1(lg * 0.25)} ${r1(-e)}l${r1(lg * 0.5)} ${r1(-e * 0.1)}q${r1(lg * 0.15)} 0 ${r1(lg * 0.25)} ${r1(e * 0.7)}z" fill="${c}"/><circle cx="${r1(x + lg * 0.08)}" cy="${r1(yBase - e * 0.8)}" r="${r1(e * 0.55)}" fill="${c}"/>`;
}
// Foule compacte : silhouettes serrées en rangs (masse), parallèle au sol. Rend { svg, n }.
export function foule(L, yBase, h, rnd, o = {}) {
  const couleurs = o.couleurs || ['#101014'];
  const poses = o.poses || ['mort'];
  let s = '', n = 0;
  const rangs = o.rangs || 3;
  for (let r = 0; r < rangs; r++) {
    const hh = h * (0.7 + 0.3 * r / Math.max(1, rangs - 1)), y = yBase - (rangs - 1 - r) * h * 0.08;
    let x = (o.x0 || 0) - rnd() * 40;
    while (x < (o.x1 || L)) {
      const c = rnd.choix(couleurs);
      const cl = o.cls ? `class="${o.cls}" data-x="${r1(x)}" data-p="${r1(rnd())}"` : '';
      s += `<g ${cl}>` + humain(0, 0, hh * (0.85 + rnd() * 0.25), rnd.choix(poses), { corps: c, sens: o.sens || (rnd() < 0.5 ? 1 : -1), chapeau: o.chapeaux && rnd() < 0.15 ? c : null, attrs: `transform="translate(${r1(x)},${r1(y)})"` }, rnd()) + '</g>';
      x += hh * (o.espace || 0.2) * (0.6 + rnd() * 0.8);
      n++;
    }
  }
  return { svg: s, n };
}

// ---------- Objets de la rue ----------
export function voiture(x, yBase, w, c, o = {}) {
  const h = w * 0.36;
  const rnd = alea('v' + x);
  const vitre = o.vitre || sombre(c, 0.6);
  let s = `<g class="voiture">`;
  s += `<path d="M${r1(x)} ${r1(yBase - h * 0.3)}q0 ${r1(-h * 0.34)} ${r1(w * 0.08)} ${r1(-h * 0.4)}l${r1(w * 0.16)} ${r1(-h * 0.06)}l${r1(w * 0.12)} ${r1(-h * 0.3)}h${r1(w * 0.38)}l${r1(w * 0.14)} ${r1(h * 0.32)}l${r1(w * 0.08)} ${r1(h * 0.04)}q${r1(w * 0.04)} ${r1(h * 0.08)} ${r1(w * 0.04)} ${r1(h * 0.34)}v${r1(h * 0.16)}H${r1(x)}Z" fill="${c}"/>`;
  s += `<path d="M${r1(x + w * 0.27)} ${r1(yBase - h * 0.76)}l${r1(w * 0.1)} ${r1(-h * 0.22)}h${r1(w * 0.15)}v${r1(h * 0.22)}zM${r1(x + w * 0.55)} ${r1(yBase - h * 0.76)}v${r1(-h * 0.22)}h${r1(w * 0.14)}l${r1(w * 0.1)} ${r1(h * 0.22)}z" fill="${vitre}"/>`;
  s += `<rect x="${r1(x)}" y="${r1(yBase - h * 0.34)}" width="${r1(w)}" height="${r1(h * 0.06)}" fill="${sombre(c, 0.3)}"/>`;
  for (const rx of [0.2, 0.8]) s += `<circle cx="${r1(x + w * rx)}" cy="${r1(yBase - h * 0.12)}" r="${r1(h * 0.2)}" fill="#141312"/><circle cx="${r1(x + w * rx)}" cy="${r1(yBase - h * 0.12)}" r="${r1(h * 0.08)}" fill="#5a5750"/>`;
  if (o.portiere) s += `<path d="M${r1(x + w * 0.55)} ${r1(yBase - h * 0.76)}l${r1(w * 0.2)} ${r1(-h * 0.1)}v${r1(h * 0.58)}l${r1(-w * 0.2)} ${r1(h * 0.1)}z" fill="${sombre(c, 0.15)}"/>`;
  if (o.phares) s += halo(x + w, yBase - h * 0.4, w * 0.3, h * 0.3, '#f5e7b8', 0.6);
  s += `<ellipse cx="${r1(x + w / 2)}" cy="${r1(yBase + 2)}" rx="${r1(w * 0.55)}" ry="${r1(h * 0.07)}" fill="#000" opacity="0.3"/>`;
  void rnd;
  return s + '</g>';
}
export function lampadaire(x, yBase, h, c, allume = false, lum = '#f0d08a') {
  let s = `<path d="M${r1(x)} ${yBase}V${r1(yBase - h)}q0 -24 26 -26h14" stroke="${c}" stroke-width="7" fill="none"/><path d="M${r1(x + 28)} ${r1(yBase - h - 28)}h26l-6 16h-14z" fill="${c}"/>`;
  s += `<rect x="${r1(x - 9)}" y="${r1(yBase - 30)}" width="18" height="30" fill="${c}"/>`;
  if (allume) s += halo(x + 41, yBase - h - 10, 140, 140, lum, 0.55) + `<rect x="${r1(x + 34)}" y="${r1(yBase - h - 12)}" width="14" height="5" fill="${lum}"/>`;
  return s;
}
// Étal de marché : tréteaux, bâche rayée, cageots. contenu : 'peches' | 'fromages' | 'fleurs' | 'legumes' | 'olives'
export function etal(x, yBase, w, rnd, o = {}) {
  const bache = o.bache || rnd.choix([['#b8322c', '#efe6d0'], ['#2f6b4a', '#efe6d0'], ['#b8322c', '#2f6b4a'], ['#e0b33c', '#efe6d0']]);
  const nuit = o.nuit || 0;
  const t = o.teinte;
  const col = c => mix(t ? mix(c, t[0], t[1]) : c, '#0b0d16', nuit);
  const hT = w * 0.28, yT = yBase - hT;
  let s = `<g class="etal" data-x="${r1(x)}" data-y="${yBase}">`;
  // Mâts et bâche.
  const hb = w * 0.72;
  s += `<path d="M${r1(x + 6)} ${yBase}V${r1(yBase - hb)}M${r1(x + w - 6)} ${yBase}V${r1(yBase - hb)}" stroke="${col('#3a3530')}" stroke-width="5"/>`;
  if (!o.sansBache) s += `<g class="bache">${store(x - 14, yBase - hb - 30, w + 28, 70, [col(bache[0]), col(bache[1])])}</g>`;
  // Table et nappe.
  s += `<rect x="${r1(x)}" y="${r1(yT)}" width="${r1(w)}" height="${r1(hT * 0.7)}" fill="${col(o.nappe || '#5a4636')}"/><rect x="${r1(x)}" y="${r1(yT)}" width="${r1(w)}" height="8" fill="${col('#7a6450')}"/>`;
  s += `<path d="M${r1(x + 10)} ${r1(yT + hT * 0.7)}l-6 ${r1(hT * 0.3)}M${r1(x + w - 10)} ${r1(yT + hT * 0.7)}l6 ${r1(hT * 0.3)}" stroke="${col('#2c2621')}" stroke-width="5"/>`;
  // Cageots et marchandise.
  const cont = o.contenu || rnd.choix(['peches', 'fromages', 'fleurs', 'legumes', 'olives']);
  const nc = Math.max(2, Math.round(w / 70));
  const cw = w / nc;
  for (let i = 0; i < nc; i++) {
    const cx = x + i * cw + 4, cy = yT - 26;
    s += `<rect x="${r1(cx)}" y="${r1(cy)}" width="${r1(cw - 8)}" height="26" fill="${col('#a88a5c')}"/><path d="M${r1(cx)} ${r1(cy + 9)}h${r1(cw - 8)}M${r1(cx)} ${r1(cy + 18)}h${r1(cw - 8)}" stroke="${col('#7a6240')}" stroke-width="2"/>`;
    let d = '';
    const fr = cont === 'peches' ? ['#e7954b', '#d9683a', '#f0b25a'] : cont === 'fleurs' ? ['#d24a6a', '#f0d24a', '#e8e0f0', '#9a4ad0'] : cont === 'legumes' ? ['#c83a2a', '#5b8a2e', '#e0a030', '#7a3a6a'] : cont === 'olives' ? ['#4a5a2a', '#2a2a1a', '#6a6a3a'] : ['#efe0b0', '#e6c880', '#f4ecd0'];
    if (cont === 'fromages') {
      s += `<path d="M${r1(cx + 6)} ${r1(cy)}a${r1((cw - 20) / 2)} ${r1(cw * 0.35)} 0 0 1 ${r1(cw - 20)} 0z" fill="${col('#dfe6e8')}" opacity="0.5"/><ellipse cx="${r1(cx + cw / 2 - 4)}" cy="${r1(cy - 6)}" rx="${r1(cw * 0.28)}" ry="8" fill="${col(rnd.choix(fr))}"/>`;
    } else if (cont === 'fleurs') {
      for (let k = 0; k < 7; k++) s += `<circle cx="${r1(cx + 6 + rnd() * (cw - 20))}" cy="${r1(cy - 6 - rnd() * 26)}" r="${r1(5 + rnd() * 5)}" fill="${col(rnd.choix(fr))}"/>`;
      s += `<path d="M${r1(cx + cw * 0.2)} ${r1(cy)}l4 -24M${r1(cx + cw * 0.5)} ${r1(cy)}l-2 -28M${r1(cx + cw * 0.7)} ${r1(cy)}l3 -22" stroke="${col('#4a6a2a')}" stroke-width="2"/>`;
    } else {
      for (let k = 0; k < 9; k++) { const fx = cx + 6 + rnd() * (cw - 20), fy = cy - 2 - rnd() * 10; d += `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="${r1(6 + rnd() * 3)}" fill="${col(rnd.choix(fr))}"/>`; }
      s += d;
    }
  }
  if (o.ardoise) s += `<rect x="${r1(x + w * 0.35)}" y="${r1(yT + 16)}" width="${r1(w * 0.3)}" height="40" fill="${col('#1e2220')}"/><text x="${r1(x + w * 0.5)}" y="${r1(yT + 44)}" font-family="Caveat, cursive" font-size="24" text-anchor="middle" fill="${col('#e6e0d0')}">${o.ardoise}</text>`;
  return s + '</g>';
}

// ---------- Aviation ----------
// Silhouette d'avion vu de profil. type : 'alphajet' | 'fouga' | 'canadair' | 'chasseur'
export function avion(x, y, lg, c, type = 'chasseur', o = {}) {
  const k = lg / 100;
  const P = (d) => d.replace(/(-?\d+(\.\d+)?)/g, m => r1(parseFloat(m) * k));
  let d;
  if (type === 'canadair') d = 'M0 10c10 -8 40 -10 70 -8l18 -12h8l-6 14c6 2 10 4 10 8c-10 4 -60 6 -90 4c-6 -2 -10 -3 -10 -6zM30 -4h40l2 -4h-44z';
  else if (type === 'fouga') d = 'M0 6c8 -8 30 -10 60 -9l22 -14h6l-12 16c10 2 20 4 24 8c-20 4 -70 6 -90 4zM82 -17l-10 -8l4 0l12 8zM40 4l-10 12h8l16 -12z';
  else d = 'M0 6c10 -8 36 -12 62 -10l18 -16h6l-8 18c10 2 18 4 22 8c-20 6 -76 6 -100 0zM30 2l-14 14h10l22 -14z';
  let s = `<g class="avion" transform="translate(${r1(x)},${r1(y)})${o.sens === -1 ? ' scale(-1,1)' : ''}"><path d="${P(d)}" fill="${c}"/>`;
  if (o.cocarde) s += `<circle cx="${r1(70 * k)}" cy="${r1(-2 * k)}" r="${r1(4 * k)}" fill="#e8e0d0"/><circle cx="${r1(70 * k)}" cy="${r1(-2 * k)}" r="${r1(2.6 * k)}" fill="#b8322c"/><circle cx="${r1(70 * k)}" cy="${r1(-2 * k)}" r="${r1(1.2 * k)}" fill="#284c73"/>`;
  if (o.verriere) s += `<path d="${P('M22 -1c4 -6 12 -8 20 -7l4 6z')}" fill="${o.verriere}"/>`;
  return s + '</g>';
}

// ---------- Feu et fumée (statiques ; l'animation vit dans les scènes) ----------
// Langues de flammes : trois tons, dessinées en une bande de largeur w depuis yBase, couchées par le vent (couche).
export function flammes(x, yBase, w, h, rnd, o = {}) {
  const tons = o.tons || ['#8e1b10', '#e2551c', '#f4b23c', '#ffe7a0'];
  const couche = o.couche || 0;
  let s = `<g class="${o.cls || 'flammes'}">`;
  tons.forEach((c, i) => {
    const k = 1 - i * 0.22; let d = `M${r1(x)} ${yBase}`;
    const n = Math.max(3, Math.round(w / (h * 0.25)));
    for (let j = 0; j < n; j++) {
      const x0 = x + (w / n) * j, x1 = x0 + w / n, hh = h * k * (0.45 + rnd() * 0.55);
      const pointe = x0 + (w / n) * 0.5 + couche * hh;
      d += `Q${r1(x0 + (w / n) * 0.1)} ${r1(yBase - hh * 0.5)} ${r1(pointe)} ${r1(yBase - hh)}Q${r1(x1 - (w / n) * 0.2 + couche * hh * 0.3)} ${r1(yBase - hh * 0.45)} ${r1(x1)} ${r1(yBase - hh * 0.08 * rnd())}`;
    }
    d += `L${r1(x + w)} ${yBase}Z`;
    s += `<path d="${d}" fill="${c}" opacity="${i === 0 ? 0.95 : 0.9}"/>`;
  });
  return s + '</g>';
}
// Colonne de fumée (panache) qui monte et se couche avec le vent.
export function panache(x, yBase, h, w, c, rnd, o = {}) {
  const vent = o.vent || 0, op = o.o || 0.6;
  let s = `<g class="${o.cls || 'panache'}" opacity="${op}">`;
  const n = o.n || 14;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), r = w * (0.25 + t * 0.9) * (0.8 + rnd() * 0.4);
    const cx = x + vent * h * t * t + (rnd() - 0.5) * w * 0.3, cy = yBase - h * t;
    s += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(r * 1.2)}" ry="${r1(r * 0.8)}" fill="${mix(c, o.c2 || c, t)}" opacity="${r1((1 - t * 0.6) * 100) / 100}"/>`;
  }
  return s + '</g>';
}

// ---------- Divers ----------
export function grilleFer(x, y, w, h, c, pas = 18, ep = 3) {
  let d = '';
  for (let gx = x; gx <= x + w; gx += pas) d += `M${r1(gx)} ${r1(y + h)}V${r1(y)}`;
  d += `M${r1(x)} ${r1(y + 8)}H${r1(x + w)}M${r1(x)} ${r1(y + h - 12)}H${r1(x + w)}`;
  let pointes = '';
  for (let gx = x; gx <= x + w; gx += pas) pointes += `M${r1(gx - 4)} ${r1(y)}l4 -12l4 12z`;
  return `<path d="${d}" stroke="${c}" stroke-width="${ep}" fill="none"/><path d="${pointes}" fill="${c}"/>`;
}
export function oiseau(x, y, e, c) {
  return `<path d="M${r1(x - e)} ${r1(y)}q${r1(e * 0.5)} ${r1(-e * 0.5)} ${r1(e)} 0q${r1(e * 0.5)} ${r1(-e * 0.5)} ${r1(e)} 0" stroke="${c}" stroke-width="${r1(Math.max(1.5, e * 0.18))}" fill="none" stroke-linecap="round"/>`;
}
// Texture de papier sale / grain statique : semis de points très discrets sur la couche.
export function salissure(L, h, rnd, n, c = '#000', o = 0.06) {
  let d = '';
  for (let i = 0; i < n; i++) d += `M${r1(rnd() * L)} ${r1(rnd() * h)}h.1`;
  return `<path d="${d}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="${o}"/>`;
}
// Voile de profondeur : couvre toute la couche d'une couleur (perspective atmosphérique).
export function voile(L, c, o, y0 = 0, y1 = H) {
  return `<rect x="-5" y="${y0}" width="${L + 10}" height="${y1 - y0}" fill="${c}" opacity="${o}"/>`;
}
// Sol : bande pleine avec dégradé (chaussée, plaine).
export function sol(L, y, stops) {
  const id = uid('sol');
  return `<defs>${degrade(id, stops)}</defs><rect x="-5" y="${r1(y)}" width="${L + 10}" height="${r1(H - y + 10)}" fill="url(#${id})"/>`;
}
// Échappement XML pour du texte inséré dans le SVG.
export function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
