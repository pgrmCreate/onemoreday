// ============ Bibliothèque des dessins d'ambiance — fonds de carte ============
// Chaque carte « niveau petit » a son dessin d'ambiance : il apparaît derrière la
// grille (sous un voile) et en grand via le bouton œil. Le CIEL est DYNAMIQUE :
// sa couleur suit l'heure du jeu, et le décor s'assombrit à la nuit tombée.
// Même charte que js/art/scenes_art.js : hiver post-apocalyptique désaturé,
// silhouettes #060608→#16161d, accents rares (sang #a31621/#d6303e, or pâle #c9a227).
// Toutes les fonctions retournent des fragments SVG (string) pour un canevas W×H.
// Les ids de gradients sont préfixés par a.p : plusieurs SVG coexistent dans le DOM.

export const W = 800, H = 340;
export const R = n => Math.round(n * 10) / 10;

// PRNG déterministe (Lehmer) — les dessins ne « clignotent » pas entre deux rendus.
export function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = s * 48271 % 2147483647) / 2147483647;
}

// ---------- Ciel dynamique ----------
// Arrêts du cycle : [heure, haut du ciel, bas du ciel, lumière 0..1]
// Hiver provençal : aubes ocres, midis blafards, nuits d'encre.
const ARRETS = [
  [0,    '#07080f', '#10131d', 0.06],
  [5,    '#0a0c15', '#141826', 0.08],
  [6.6,  '#23203a', '#6f4634', 0.30],   // l'aube ronge la nuit
  [8.5,  '#3c4659', '#7e7d70', 0.72],
  [13,   '#525f73', '#8e9484', 1],      // midi pâle d'hiver
  [16.5, '#4a4f63', '#8d7355', 0.8],
  [19,   '#2c2940', '#8c4f30', 0.42],   // couchant rouillé
  [20.8, '#111422', '#1d2030', 0.14],
  [24,   '#07080f', '#10131d', 0.06],
];

export function lerpHex(c1, c2, t) {
  const n1 = parseInt(c1.slice(1), 16), n2 = parseInt(c2.slice(1), 16);
  const c = (sh) => Math.round(((n1 >> sh) & 255) + (((n2 >> sh) & 255) - ((n1 >> sh) & 255)) * t);
  return '#' + ((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0');
}

// Heure décimale (8.5 = 8 h 30) → { haut, bas, lum, nuit } : le ciel du moment.
export function ciel(heure) {
  const h = ((heure % 24) + 24) % 24;
  let i = 0;
  while (i < ARRETS.length - 2 && ARRETS[i + 1][0] <= h) i++;
  const a = ARRETS[i], b = ARRETS[i + 1];
  const t = (h - a[0]) / (b[0] - a[0]);
  const lum = Math.round((a[3] + (b[3] - a[3]) * t) * 100) / 100;
  return { haut: lerpHex(a[1], b[1], t), bas: lerpHex(a[2], b[2], t), lum, nuit: lum < 0.2 };
}

// Fond de ciel plein cadre (dégradé vertical aux couleurs du moment).
export function fondCiel(a) {
  return `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${a.p}-ciel)"/>`;
}

// Nuage de points compacté en un seul <path>.
export function dots(pts, w, c, o) {
  if (!pts.length) return '';
  return `<path d="${pts.map(q => `M${q[0]} ${q[1]}h.1`).join('')}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}" fill="none"/>`;
}

// Halo lumineux radial (lune, bougie, lampadaire mort qui grésille…).
export function halo(a, id, cx, cy, rx, ry, c, o) {
  return `<defs><radialGradient id="${a.p}-${id}">
    <stop offset="0" stop-color="${c}" stop-opacity="${o}"/>
    <stop offset="0.55" stop-color="${c}" stop-opacity="${R(o * 0.32)}"/>
    <stop offset="1" stop-color="${c}" stop-opacity="0"/>
  </radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${a.p}-${id})"/>`;
}

// Lune voilée : halo + disque + cratère + banc de nuage.
export function lune(a, cx, cy, r, c = '#cfc9b8', hop = 0.4) {
  return halo(a, 'lune', cx, cy, R(r * 3.1), R(r * 3.1), c, hop)
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.92"/>
    <circle cx="${R(cx - r * 0.3)}" cy="${R(cy - r * 0.18)}" r="${R(r * 0.17)}" fill="#9a958a" opacity="0.4"/>
    <path d="M${R(cx - r * 1.7)} ${R(cy - r * 0.2)}q${R(r * 1.7)} ${R(r * 0.6)} ${R(r * 3.4)} 0" stroke="#191c26" stroke-width="${R(r * 0.34)}" fill="none" opacity="0.6"/>`;
}

// Soleil d'hiver, pâle et bas — visible seulement quand il fait jour.
export function soleil(a, cx, cy, r = 16) {
  return halo(a, 'soleil', cx, cy, R(r * 4), R(r * 4), '#d8cfae', R(0.30 * a.lum))
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d8cfae" opacity="${R(0.5 * a.lum)}"/>`;
}

// L'astre du moment : lune la nuit, soleil voilé le jour, rien aux heures grises.
export function astre(a, cx = 640, cy = 64) {
  if (a.nuit) return lune(a, cx, cy, 17);
  if (a.lum >= 0.45) return soleil(a, cx, cy);
  return '';
}

// Étoiles froides — ne s'allument que la nuit (opacité liée à l'obscurité).
export function etoiles(a, seed, n, ymax = 150) {
  if (a.lum > 0.25) return '';
  const o = R(0.5 * (1 - a.lum));
  const r = rng(seed), pa = [], pb = [];
  for (let i = 0; i < n; i++) (i % 4 ? pa : pb).push([R(r() * W), R(r() * ymax)]);
  return dots(pa, 1.1, '#aeb6c6', R(o * 0.7)) + dots(pb, 1.7, '#cdd3df', o);
}

// Neige fine.
export function neige(seed, n = 30, o = 0.4, x0 = 0, x1 = W, y0 = 0, y1 = 312) {
  const r = rng(seed), pa = [], pb = [];
  for (let i = 0; i < n; i++) (i % 3 ? pa : pb).push([R(x0 + r() * (x1 - x0)), R(y0 + r() * (y1 - y0))]);
  return dots(pa, 1.4, '#c8cdd8', o) + dots(pb, 2.2, '#c8cdd8', R(o * 0.65));
}

// Brume au sol : bande en dégradé + nappe.
export function brume(a, y, t = '#3a4150', o = 0.16, idx = '') {
  return `<defs><linearGradient id="${a.p}-brume${idx}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${t}" stop-opacity="0"/><stop offset="0.5" stop-color="${t}" stop-opacity="${o}"/>
    <stop offset="1" stop-color="${t}" stop-opacity="0"/></linearGradient></defs>
  <rect x="0" y="${y}" width="${W}" height="72" fill="url(#${a.p}-brume${idx})"/>
  <ellipse cx="400" cy="${y + 50}" rx="350" ry="19" fill="${t}" opacity="${R(o * 0.48)}"/>`;
}

// Immeuble avec fenêtres. La nuit, les rares fenêtres allumées s'éteignent :
// pAllume est automatiquement écrasé par l'obscurité ambiante (monde mort).
export function batisse(a, x, base, w, h, t, seed, pAllume = 0, casse = 0.14) {
  const r = rng(seed);
  const cols = Math.max(2, Math.round(w / 38)), rows = Math.max(2, Math.round(h / 50));
  const dark = [], gold = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const v = r();
    if (v < casse) continue;
    const fx = R(x + 9 + i * ((w - 16) / cols)), fy = R(base - h + 11 + j * ((h - 18) / rows));
    (v > 1 - pAllume ? gold : dark).push(`M${fx} ${fy}v9`);
  }
  return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${t}"/>`
    + (dark.length ? `<path d="${dark.join('')}" stroke="#06070b" stroke-width="6" fill="none"/>` : '')
    + (gold.length ? `<path d="${gold.join('')}" stroke="#c9a227" stroke-width="6" fill="none" opacity="0.5"/>` : '');
}

// Ligne de toits lointains (pignons, toits plats, cheminées).
export function toits(seed, y, amp, t, o = 1) {
  const r = rng(seed);
  let d = `M0 ${H}L0 ${y}`, x = 0;
  while (x < W) {
    const lw = R(48 + r() * 74), pic = R(y - 8 - r() * amp);
    if (r() < 0.55) d += `L${R(x + lw / 2)} ${pic}L${R(x + lw)} ${y}`;
    else {
      d += `L${x} ${pic}L${R(x + lw)} ${pic}L${R(x + lw)} ${y}`;
      if (r() < 0.5) d += `M${R(x + lw * 0.3)} ${pic}v-9h6v9`;
    }
    x += lw;
  }
  return `<path d="${d}L${W} ${H}Z" fill="${t}" opacity="${o}"/>`;
}

// Clocher d'église (silhouette).
export function clocher(x, y, h, t) {
  return `<path d="M${x} ${y}v${-h}l13 -24 13 24v${h}z" fill="${t}"/>
  <path d="M${x + 13} ${y - h - 24}v-11M${x + 8.5} ${y - h - 30}h9" stroke="${t}" stroke-width="2.4"/>`;
}

// Silhouette d'errant — pieds à y+48 (échelle s). Yeux rouges visibles la nuit.
export function zfig(x, y, s = 1, t = '#0b0c10', yeux = true, pench = 8) {
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${pench})" fill="${t}" stroke="${t}" stroke-linecap="round">
    <ellipse cx="3" cy="-57" rx="8" ry="9.5" stroke="none"/>
    <path d="M-10 -48Q-15 -20 -11 6L11 6Q16 -22 10 -48Q0 -54 -10 -48M-11 4l4 11 3-8 3 10 4-9 4 10 4-11z" stroke="none"/>
    <path d="M-9 -44q-11 9 -13 24l2 8M9 -44q10 7 12 21l4 9" stroke-width="5.5" fill="none"/>
    <path d="M-5 7l-3 41M6 7l5 41" stroke-width="7.5" fill="none"/>
    ${yeux ? `<path d="M1 -58h.1M7 -57h.1" stroke="#d6303e" stroke-width="3" opacity="0.85" fill="none"/>` : ''}
  </g>`;
}

// Carcasse de voiture (vitres crevées, parfois sur cales).
export function carcasse(x, y, s = 1, t = '#101117', seed = 1) {
  const r = rng(seed);
  const brule = r() < 0.3;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${brule ? '#0a0a0d' : t}">
    <path d="M0 0h86l-7 -17q-3 -6 -10 -6h-50q-7 0 -11 6z"/>
    <path d="M14 -22l5 -10q2 -4 7 -4h32q5 0 7 4l5 10z" opacity="0.85"/>
    <circle cx="20" cy="2" r="7" fill="#08080b"/><circle cx="66" cy="2" r="7" fill="#08080b"/>
    ${r() < 0.5 ? `<path d="M30 -30l8 5M44 -31l-6 6" stroke="#06070b" stroke-width="1.6"/>` : ''}
  </g>`;
}

// Lampadaire mort (penché, parfois).
export function lampadaire(x, y, h = 70, t = '#0d0e13', pench = 0) {
  return `<g transform="translate(${x},${y}) rotate(${pench})" stroke="${t}" fill="none" stroke-width="4" stroke-linecap="round">
    <path d="M0 0v${-h}q0 -12 14 -12"/><circle cx="16" cy="${-h - 12}" r="3.5" fill="${t}"/>
  </g>`;
}

// Pin de Provence (silhouette en parasol) — l'hiver ne les déshabille pas.
export function pin(x, y, s = 1, t = '#0a0d0a') {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${t}">
    <path d="M-3 0l1 -34h4l1 34z"/>
    <path d="M0 -30q-26 -2 -34 -14q14 4 20 1q-12 -6 -14 -15q12 8 22 6q-6 -8 -4 -16q8 10 14 11q8 -2 12 -12q3 9 -3 16q11 1 20 -6q-3 10 -13 15q8 3 18 -1q-9 13 -38 15z"/>
  </g>`;
}

// Fenêtre d'intérieur : le CIEL DU MOMENT à travers les carreaux — c'est par elle
// que la lumière du dehors entre dans les pièces. Carreaux parfois brisés.
export function fenetre(a, x, y, w, h, idx = '', casse = false) {
  return `<defs><linearGradient id="${a.p}-fen${idx}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${a.p}-fen${idx})"/>
  <path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#08090d" stroke-width="3"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#08090d" stroke-width="4"/>
  ${casse ? `<path d="M${R(x + w * 0.62)} ${R(y + h * 0.2)}l${R(w * 0.12)} ${R(h * 0.16)}l${R(-w * 0.07)} ${R(h * 0.1)}" stroke="#0a0b10" stroke-width="1.6" fill="none"/>` : ''}
  ${`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#04050a" opacity="${R((1 - a.lum) * 0.25)}"/>`}`;
}

// Lueur de bougie/feu — la seule lumière chaude qui reste aux vivants.
export function bougie(a, cx, cy, id = 'bg') {
  return halo(a, id, cx, cy, 60, 44, '#c9882a', 0.34)
    + `<path d="M${cx} ${cy}q-3 -7 0 -12q4 5 0 12" fill="#e0b04a" opacity="0.9"/>`;
}

// Voile d'obscurité du décor — à appliquer EN DERNIER, par-dessus tout le dessin.
// La nuit, les objets restent dessinés mais s'enfoncent dans le noir.
// force > 1 pour les lieux sombres même en plein jour (caves, salles aveugles).
export function voileNuit(a, force = 1) {
  const o = Math.min(0.82, R((1 - a.lum) * 0.55 * force + (force > 1 ? 0.25 : 0)));
  return o > 0.02 ? `<rect width="${W}" height="${H}" fill="#04050a" opacity="${o}"/>` : '';
}
