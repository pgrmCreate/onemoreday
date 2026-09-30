// ============================================================================
//  COMBAT — décors de fond procéduraux (SVG), selon le type de lieu
// ============================================================================
// decorSVG(theme, graine) → chaîne SVG (viewBox 1600×900, slice). Flou et vignette : CSS.
// themeDepuis(lieu, decor) → 'rue' | 'interieur' | 'gare' | 'campagne' | 'eglise' | 'usine'
import { seedRng } from '../core/rng.js';

const THEME_TYPE = {
  hotel: 'interieur', pharmacie: 'interieur', superette: 'interieur', supermarche: 'interieur', hypermarche: 'interieur',
  mediatheque: 'interieur', musee: 'interieur', cinema: 'interieur', lycee: 'interieur', hopital: 'interieur',
  commissariat: 'interieur', gendarmerie: 'interieur', caserne: 'interieur', bricolage: 'interieur', mairie: 'interieur',
  interieur: 'interieur', magasin: 'interieur', refuge: 'interieur', sombre: 'interieur',
  eglise: 'eglise', cimetiere: 'eglise', chateau: 'eglise',
  gare: 'gare', triage: 'gare', train: 'gare',
  village: 'campagne', zoo: 'campagne', grotte: 'campagne', ruines: 'campagne', aerodrome: 'campagne', region: 'campagne', campagne: 'campagne',
  usine: 'usine', base: 'usine', garage: 'usine',
  place: 'rue', cite: 'rue', monument: 'rue', rue: 'rue',
};
export const THEMES = ['rue', 'interieur', 'gare', 'campagne', 'eglise', 'usine'];

export function themeDepuis(lieu, decor) {
  if (decor && THEMES.includes(decor)) return decor;
  if (decor && THEME_TYPE[decor]) return THEME_TYPE[decor];
  if (lieu) return THEME_TYPE[lieu.type] || THEME_TYPE[lieu.illustration] || THEME_TYPE[lieu.ambiance] || 'rue';
  return 'rue';
}

const W = 1600, H = 900, SOL = 640;
const f1 = (n) => Math.round(n * 10) / 10;

function ciel(haut, bas, lune, r) {
  let s = `<defs><linearGradient id="cb-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>
<radialGradient id="cb-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c9a227" stop-opacity=".55"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/></radialGradient>
<radialGradient id="cb-lune" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#cfd3d8" stop-opacity=".25"/><stop offset="1" stop-color="#cfd3d8" stop-opacity="0"/></radialGradient>
<linearGradient id="cb-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16140f"/><stop offset="1" stop-color="#070706"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#cb-ciel)"/>`;
  if (lune) {
    const x = 200 + r() * 1200;
    s += `<circle cx="${f1(x)}" cy="130" r="160" fill="url(#cb-lune)"/><circle cx="${f1(x)}" cy="130" r="34" fill="#b9bcbf" opacity=".35"/>`;
  }
  return s;
}
function sol(couleurLignes = '#1d1b16', pointFuite = W / 2) {
  let s = `<rect y="${SOL}" width="${W}" height="${H - SOL}" fill="url(#cb-sol)"/>`;
  for (let i = -8; i <= 8; i++) s += `<path d="M ${pointFuite},${SOL} L ${pointFuite + i * 260},${H}" stroke="${couleurLignes}" stroke-width="2" opacity=".6"/>`;
  for (let k = 1; k < 6; k++) { const y = SOL + (H - SOL) * Math.pow(k / 6, 1.8); s += `<path d="M 0,${f1(y)} H ${W}" stroke="${couleurLignes}" stroke-width="1.5" opacity=".45"/>`; }
  return s;
}
function immeubles(r, n, yBas, hMin, hMax, teinte) {
  let s = '', x = -40;
  for (let i = 0; i < n && x < W; i++) {
    const l = 120 + r() * 200, h = hMin + r() * (hMax - hMin);
    s += `<rect x="${f1(x)}" y="${f1(yBas - h)}" width="${f1(l)}" height="${f1(h)}" fill="${teinte}"/>`;
    for (let fy = yBas - h + 24; fy < yBas - 40; fy += 46) for (let fx = x + 18; fx < x + l - 26; fx += 38) {
      const k = r();
      if (k < 0.04) s += `<rect x="${f1(fx)}" y="${f1(fy)}" width="16" height="22" fill="#c9a227" opacity=".35"/>`;
      else if (k < 0.5) s += `<rect x="${f1(fx)}" y="${f1(fy)}" width="16" height="22" fill="#050506" opacity=".8"/>`;
    }
    x += l + r() * 20;
  }
  return s;
}
function platane(x, y, s, t = '#07080a') {
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><path d="M -8,0 L -6,-150 L 6,-150 L 9,0 Z" fill="${t}"/>
<path d="M 0,-120 L -40,-190 M 0,-130 L 45,-200" stroke="${t}" stroke-width="9"/>
<ellipse cx="-50" cy="-220" rx="80" ry="55" fill="${t}"/><ellipse cx="40" cy="-240" rx="90" ry="60" fill="${t}"/><ellipse cx="-5" cy="-280" rx="70" ry="50" fill="${t}"/></g>`;
}
function reverbere(x, y) {
  return `<circle cx="${x}" cy="${y - 300}" r="190" fill="url(#cb-halo)"/><rect x="${x - 5}" y="${y - 300}" width="10" height="300" fill="#08080a"/>
<path d="M ${x},${y - 300} q 0,-22 40,-24" stroke="#08080a" stroke-width="8" fill="none"/><rect x="${x + 30}" y="${y - 330}" width="28" height="14" fill="#c9a227" opacity=".8"/>`;
}
function carcasse(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M -150,0 L -130,-40 L -80,-62 L 70,-62 L 130,-34 L 155,0 Z" fill="#0b0b0e"/>
<path d="M -70,-60 L -52,-88 L 50,-88 L 72,-60 Z" fill="#0b0b0e"/><circle cx="-88" cy="2" r="24" fill="#040405"/><circle cx="92" cy="2" r="24" fill="#040405"/></g>`;
}

const THEME_FN = {
  rue(r) {
    let s = ciel('#0c1016', '#1c1d22', true, r);
    s += immeubles(r, 12, SOL - 10, 220, 420, '#0d0e12');
    s += immeubles(r, 10, SOL, 120, 260, '#09090c');
    s += platane(180 + r() * 100, SOL + 10, 1.2) + platane(1350 + r() * 120, SOL + 10, 1.1);
    s += reverbere(420 + r() * 120, SOL + 4);
    s += carcasse(1120 + r() * 120, SOL + 60, 1.1);
    s += sol('#1e1c17');
    return s;
  },
  interieur(r) {
    let s = ciel('#17140f', '#0e0d0a', false, r);
    s += `<rect x="0" y="0" width="${W}" height="${SOL}" fill="#15130f"/>`;
    for (let x = 0; x < W; x += 64) s += `<rect x="${x}" y="0" width="30" height="${SOL}" fill="#1b1813" opacity=".6"/>`;
    s += `<rect x="0" y="${SOL - 120}" width="${W}" height="8" fill="#0a0907"/><rect x="0" y="${SOL - 112}" width="${W}" height="112" fill="#110f0c"/>`;
    const px = 260 + r() * 300;
    s += `<rect x="${f1(px)}" y="${SOL - 360}" width="170" height="360" fill="#050505"/><rect x="${f1(px - 14)}" y="${SOL - 374}" width="198" height="14" fill="#0c0b09"/>`;
    const ex = 980 + r() * 250;
    for (let k = 0; k < 4; k++) {
      s += `<rect x="${f1(ex)}" y="${SOL - 90 - k * 90}" width="360" height="10" fill="#0a0907"/>`;
      for (let b = 0; b < 8; b++) if (r() < 0.6) s += `<rect x="${f1(ex + 10 + b * 44)}" y="${f1(SOL - 90 - k * 90 - 20 - r() * 40)}" width="${f1(18 + r() * 16)}" height="${f1(20 + r() * 40)}" fill="#0f0d0a"/>`;
    }
    s += `<rect x="${f1(ex)}" y="${SOL - 400}" width="8" height="400" fill="#0a0907"/><rect x="${f1(ex + 352)}" y="${SOL - 400}" width="8" height="400" fill="#0a0907"/>`;
    const lx = 700 + r() * 200;
    s += `<path d="M ${f1(lx)},0 V 120" stroke="#050505" stroke-width="3"/><path d="M ${f1(lx - 40)},150 L ${f1(lx)},118 L ${f1(lx + 40)},150 Z" fill="#0b0a08"/>
<path d="M ${f1(lx - 38)},150 L ${f1(lx - 260)},${SOL} L ${f1(lx + 260)},${SOL} L ${f1(lx + 38)},150 Z" fill="#c9a227" opacity=".06"/>`;
    s += sol('#1f1b14');
    return s;
  },
  gare(r) {
    let s = ciel('#0e1116', '#1d1c1b', true, r);
    s += immeubles(r, 6, SOL - 30, 120, 220, '#0c0d10');
    for (let x = 80; x < W; x += 380) s += `<rect x="${x}" y="${SOL - 330}" width="12" height="330" fill="#08080a"/><path d="M ${x - 60},${SOL - 320} H ${x + 70}" stroke="#08080a" stroke-width="6"/>`;
    s += `<path d="M 0,${SOL - 300} Q ${W / 2},${SOL - 280} ${W},${SOL - 300}" stroke="#101014" stroke-width="2" fill="none"/>`;
    const wx = 900 + r() * 200;
    s += `<rect x="${f1(wx)}" y="${SOL - 190}" width="620" height="170" rx="10" fill="#0b0c0f"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="${f1(wx + 30 + k * 96)}" y="${SOL - 160}" width="60" height="44" fill="#050506"/>`;
    s += `<circle cx="${f1(wx + 90)}" cy="${SOL - 16}" r="22" fill="#040405"/><circle cx="${f1(wx + 520)}" cy="${SOL - 16}" r="22" fill="#040405"/>`;
    s += `<rect y="${SOL}" width="${W}" height="${H - SOL}" fill="#0c0b09"/>`;
    for (const d of [-190, -70, 70, 190]) s += `<path d="M ${W / 2 + d * 0.15},${SOL} L ${W / 2 + d * 6},${H}" stroke="#3a3a3e" stroke-width="5" opacity=".7"/>`;
    for (let k = 1; k < 9; k++) { const y = SOL + (H - SOL) * Math.pow(k / 9, 1.6); const w = 30 + (y - SOL) * 5; s += `<rect x="${f1(W / 2 - w)}" y="${f1(y)}" width="${f1(2 * w)}" height="${f1(4 + k)}" fill="#17130e"/>`; }
    return s;
  },
  campagne(r) {
    let s = ciel('#0d1118', '#232320', true, r);
    s += `<path d="M 0,${SOL - 120} Q 300,${SOL - 260} 620,${SOL - 150} T 1200,${SOL - 180} T ${W},${SOL - 140} V ${SOL} H 0 Z" fill="#0f1012"/>`;
    s += `<path d="M 0,${SOL - 60} Q 400,${SOL - 130} 800,${SOL - 70} T ${W},${SOL - 80} V ${SOL} H 0 Z" fill="#0b0b0c"/>`;
    for (let k = 0; k < 7; k++) {
      const x = r() * W, h = 120 + r() * 160;
      s += `<path d="M ${f1(x)},${SOL - 40} l -8,-${f1(h * 0.5)} l 8,0 Z" fill="#070708"/><ellipse cx="${f1(x - 4)}" cy="${f1(SOL - 40 - h * 0.6)}" rx="${f1(40 + r() * 40)}" ry="${f1(h * 0.28)}" fill="#070708"/>`;
    }
    s += `<path d="M 0,${SOL - 6} H ${W}" stroke="#141310" stroke-width="16"/>`;
    for (let x = 0; x < W; x += 34) s += `<rect x="${x}" y="${SOL - 30 - (x * 7 % 13)}" width="30" height="${24 + (x * 7 % 13)}" rx="6" fill="#0d0c0a"/>`;
    s += sol('#1b1a14');
    return s;
  },
  eglise(r) {
    let s = ciel('#110f0d', '#0c0b0a', false, r);
    s += `<rect width="${W}" height="${SOL}" fill="#12100d"/>`;
    for (let k = 0; k < 5; k++) {
      const x = 80 + k * 360;
      s += `<path d="M ${x},${SOL} V 220 Q ${x + 150},40 ${x + 300},220 V ${SOL} Z" fill="#0a0908"/>`;
      s += `<rect x="${x - 26}" y="140" width="40" height="${SOL - 140}" fill="#0e0c0a"/>`;
    }
    const vx = 700 + r() * 60;
    s += `<path d="M ${f1(vx)},360 V 170 Q ${f1(vx + 100)},80 ${f1(vx + 200)},170 V 360 Z" fill="#5c1a1f" opacity=".35"/><path d="M ${f1(vx + 100)},100 V 360 M ${f1(vx)},240 H ${f1(vx + 200)}" stroke="#0a0908" stroke-width="10"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="${140 + k * 220}" y="${SOL - 70}" width="170" height="70" fill="#0a0907"/>`;
    s += sol('#1b1813');
    return s;
  },
  usine(r) {
    let s = ciel('#0e1015', '#1b1b1d', true, r);
    s += `<rect x="0" y="${SOL - 420}" width="${W}" height="420" fill="#101114"/>`;
    for (let x = 0; x < W; x += 22) s += `<rect x="${x}" y="${SOL - 420}" width="10" height="420" fill="#0c0d10"/>`;
    s += `<rect x="560" y="${SOL - 300}" width="420" height="300" fill="#060607"/>`;
    for (let x = 0; x < W; x += 120) s += `<path d="M ${x},${SOL - 120} V ${SOL} M ${x},${SOL - 110} L ${x + 120},${SOL - 10} M ${x + 120},${SOL - 110} L ${x},${SOL - 10}" stroke="#1a1b1f" stroke-width="3" opacity=".7"/>`;
    for (let k = 0; k < 3; k++) { const x = 1150 + k * 70 + r() * 20; s += `<rect x="${f1(x)}" y="${SOL - 100}" width="60" height="100" rx="6" fill="#0b0b0d"/>`; }
    s += sol('#1c1c1e');
    return s;
  },
};

export function decorSVG(theme, graine = 'decor') {
  const r = seedRng(`${graine}:decor`);
  const fn = THEME_FN[theme] || THEME_FN.rue;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${fn(r)}</svg>`;
}
