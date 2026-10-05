// ============ La carte illustrée — « plan touristique abîmé » (SVG) ============
// Dessin des deux feuilles (Salon / pays salonais) à partir des tracés OSM pré-simplifiés
// (js/data/carte_*.js, décodés par geo.js) : papier jauni, plis, taches, brûlures, routes au trait
// légèrement tremblé, pictogrammes à la main, annotations au feutre. Unités SVG = mètres.
// Les épaisseurs de trait et les tailles de texte suivent la variable CSS --mpp (mètres par pixel
// écran) posée par creerVue() : pas de JS par élément pendant un zoom.
//
// Exports : construireFeuille(echelle) → { svg, cadre, couches }, creerVue(hote, svg, opts),
//           creerMarqueur(lieu, etat), pictoPath(type), cercleFeutre(r, graine), SVGNS.
import { feuille, projeter } from './geo.js';
import { ZONES } from '../data/zones.js';
import { LIEUX } from '../game/donnees.js';
import { seedRng } from '../core/rng.js';

export const SVGNS = 'http://www.w3.org/2000/svg';
const f1 = (v) => Math.round(v * 10) / 10;

// ---------------------------------------------------------------- trait tremblé
// Bruit doux (somme de sinus) : la ligne « respire » comme tracée à main levée ; les extrémités restent fixes.
function bruit(x, y, s) { return Math.sin(x * 0.011 + y * 0.004 + s) * 0.6 + Math.sin(x * 0.003 - y * 0.013 + s * 1.7) * 0.4; }
function trembler(pts, amp, pas, s = 0) {
  if (!amp) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const L = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.floor(L / pas));
    const nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
    for (let k = 1; k <= n; k++) {
      const t = k / n; const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      if (k === n && i === pts.length - 1) { out.push([bx, by]); break; }
      const o = amp * bruit(x, y, s); out.push([x + nx * o, y + ny * o]);
    }
  }
  return out;
}
function dLigne(pts, ferme = false) {
  let d = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]);
  for (let i = 1; i < pts.length; i++) d += 'L' + f1(pts[i][0]) + ' ' + f1(pts[i][1]);
  return ferme ? d + 'Z' : d;
}
// Tache / contour irrégulier autour de (cx, cy).
function blob(cx, cy, r, rng, lobes = 9, irr = 0.35) {
  const n = 28; const ph = Array.from({ length: 3 }, () => rng() * 6.28); const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const k = 1 + irr * (Math.sin(a * lobes / 3 + ph[0]) * 0.5 + Math.sin(a * lobes / 1.7 + ph[1]) * 0.3 + (rng() - 0.5) * 0.4);
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) { const p = pts[(i + 1) % n], q = pts[(i + 2) % n]; d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + q[0]) / 2)} ${f1((p[1] + q[1]) / 2)}`; }
  return d + 'Z';
}
// Boucle de feutre (cercle pas tout à fait fermé, qui déborde) — en pixels, autour de 0,0.
export function cercleFeutre(r, graine = 1, tours = 1.15) {
  const rng = seedRng('feutre:' + graine); let d = ''; const n = 30;
  const a0 = rng() * 6.28; const ex = 1 + (rng() - 0.5) * 0.25;
  for (let i = 0; i <= n * tours; i++) {
    const a = a0 + i / n * Math.PI * 2; const rr = r * (1 + (rng() - 0.5) * 0.08 + i / (n * tours) * 0.12);
    d += (i ? 'L' : 'M') + f1(Math.cos(a) * rr * ex) + ' ' + f1(Math.sin(a) * rr / ex);
  }
  return d;
}

// ---------------------------------------------------------------- pictogrammes (boîte 24×24, trait)
const C = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const PICTOS = {
  hotel: 'M3 18V8M3 14h18v4M21 18v-4M10 11h8.5a2.5 2.5 0 0 1 2.5 2.5' + C(6.3, 11.3, 1.8),
  place: 'M5 19h14M7 19l1-4h8l1 4M12 15V8M12 8c-2 0-3.2 1.8-3.2 3.2M12 8c2 0 3.2 1.8 3.2 3.2M12 8V5',
  monument: 'M8 21V9h8v12M7 9l5-5 5 5M6 21h12M12 12.8v1.4l1 .7' + C(12, 13.5, 2.3),
  mairie: 'M4 20h16M5 20v-8h14v8M4 12l8-5 8 5M8 20v-5M12 20v-5M16 20v-5M12 7V3l3 1-3 1',
  chateau: 'M5 20V8h2v2h2V8h2v2h2V8h2v2h2V8h2v12M10 20v-4a2 2 0 0 1 4 0v4',
  musee: 'M4 20h16M5 10h14M12 4l8 5H4zM7 10v8M12 10v8M17 10v8',
  eglise: 'M12 3v5M10 5h4M7 20v-8l5-4 5 4v8M5 20h14M11 20v-3h2v3',
  superette: 'M3 5h3l2 10h10l2-7H7' + C(9.5, 19, 1.4) + C(16.5, 19, 1.4),
  pharmacie: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  mediatheque: 'M12 7c-2-2-5-2-8-1v12c3-1 6-1 8 1 2-2 5-2 8-1V6c-3-1-6-1-8 1zM12 7v12',
  cinema: 'M4 7h16v11H4zM4 10h16M4 15h16M8 7v3M12 7v3M16 7v3M8 15v3M12 15v3M16 15v3',
  usine: 'M3 20V11l5 3v-3l5 3v-3l5 3V5h2v15zM3 20h18',
  cimetiere: 'M8 20v-9a4 4 0 0 1 8 0v9M12 10v5M10 12h4M5 20h14',
  gare: 'M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 11h14M8 17l-2 3M16 17l2 3' + C(8.5, 14, .6) + C(15.5, 14, .6),
  commissariat: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM12 8.5l1.1 2.3 2.6.4-1.9 1.8.5 2.6-2.3-1.2-2.3 1.2.5-2.6-1.9-1.8 2.6-.4z',
  caserne: 'M12 21c-4 0-6-3-6-6 0-4 4-6 4-10 3 2 3 4 3 5 1-1 2-2 2-3 2 2 3 5 3 8 0 3-2 6-6 6z',
  hopital: 'M5 4h14v16H5zM9 8v8M15 8v8M9 12h6',
  lycee: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6',
  bricolage: 'M13 4l7 7-2.5 2.5-7-7zM12 8.5L4 16.5 7.5 20l8-8',
  cite: 'M4 20V8h6v12M10 20V4h6v16M16 20v-9h4v9M3 20h18M6 11h2M6 14h2M12 7h2M12 10h2M12 13h2',
  village: 'M3 20v-7l4-3 4 3v7M11 20v-9l5-4 5 4v9M2 20h20M6 20v-3h2v3M15 20v-3h2v3',
  ruines: 'M4 20V9l2 1V7l2 2v11M12 20v-6l2-2 1 3 2-1v6M3 20h18',
  grotte: 'M3 20c0-8 4-14 9-14s9 6 9 14M8 20c0-4 2-7 4-7s4 3 4 7',
  zoo: 'M12 13c-3 0-5 3-5 5 0 2 2 2 5 2s5 0 5-2c0-2-2-5-5-5z' + C(6.5, 11, 1.6) + C(17.5, 11, 1.6) + C(9.8, 7, 1.6) + C(14.2, 7, 1.6),
  base: 'M12 3c1 0 1.5 1 1.5 2v4l7 4v2l-7-2v4l2 2v1L12 19l-3.5 1v-1l2-2v-4l-7 2v-2l7-4V5c0-1 .5-2 1.5-2z',
  triage: 'M4 20L8 4M20 20L16 4M5 16h14M6 12h12M7 8h10',
  aerodrome: 'M5 21V4M5 5l13 2v5L5 13M9 5.6v6.8M13 6.3v5.4',
  route: 'M8 21l2-18M16 21l-2-18M12 5v2M12 11v2M12 17v2',
  nature: 'M12 21v-6M12 3c-4 0-6 3-6 6 0 3 3 5 6 5s6-2 6-5c0-3-2-6-6-6z',
  ville: 'M3 20V9h5v11M8 20V5h6v15M14 20v-8h7v8M2 20h20',
};
const ALIAS = { supermarche: 'superette', hypermarche: 'superette', gendarmerie: 'commissariat' };
export function pictoPath(type) { return PICTOS[type] || PICTOS[ALIAS[type]] || C(12, 12, 4); }

// ---------------------------------------------------------------- styles de voies
// [couleur de fond, largeur en mètres (salon), largeur minimale en px] — le liseré (casing) ajoute ~40 %.
const VOIES = [
  { fond: '#d0683a', m: 14, px: 2.4 },  // 0 autoroute
  { fond: '#e6a73c', m: 11, px: 2.1 },  // 1 principale
  { fond: '#eecb68', m: 9, px: 1.7 },   // 2 secondaire
  { fond: '#f7edd0', m: 7.5, px: 1.2 }, // 3 tertiaire
  { fond: '#fcf6e6', m: 5.5, px: 0.7 }, // 4 rue
  { fond: '#eadcb9', m: 4.5, px: 0.6 }, // 5 piétonne
];

// ---------------------------------------------------------------- annotations au feutre (lat/lon réels)
// lieu : n'apparaît que si ce lieu est découvert. rot en degrés. coul : rouge | bleu | noir.
const ANNOTATIONS = {
  salon: [
    { lat: 43.6421, lon: 5.1056, texte: 'NE PAS Y ALLER', rot: -8, coul: 'rouge', taille: 1.25, croix: true, lieu: 'hopital' },
    { lat: 43.6375, lon: 5.0858, texte: 'trop de monde', rot: 6, coul: 'noir', fleche: [40, -26] },
    { lat: 43.6393, lon: 5.0990, texte: 'VIVANTS ?', rot: -4, coul: 'bleu', taille: 1.1, fleche: [-44, -30] },
    { lat: 43.6543, lon: 5.1052, texte: 'chiens !!', rot: 10, coul: 'rouge' },
    { lat: 43.6292, lon: 5.1245, texte: 'A7 = bouchon, voitures pleines', rot: -14, coul: 'noir', taille: 0.9 },
    { lat: 43.6436, lon: 5.0925, texte: 'cloches la nuit ??', rot: -6, coul: 'bleu', taille: 0.9 },
    { lat: 43.6582, lon: 5.0850, texte: 'calme (pour l’instant)', rot: 4, coul: 'bleu', taille: 0.9 },
  ],
  region: [
    { lat: 43.6000, lon: 5.1180, texte: 'militaires ? NE PAS Y ALLER', rot: -6, coul: 'rouge', taille: 1.1, croix: true, lieu: 'ba701' },
    { lat: 43.5700, lon: 4.9560, texte: 'les trains ne partent plus', rot: 5, coul: 'noir', taille: 0.95 },
    { lat: 43.7420, lon: 5.1850, texte: 'le pont = la sortie ?', rot: -5, coul: 'bleu', lieu: 'mallemort', fleche: [-30, 26] },
    { lat: 43.5720, lon: 5.1650, texte: 'péage : BARRAGE', rot: 8, coul: 'rouge' },
    { lat: 43.6380, lon: 4.9700, texte: 'la Crau : rien pour se cacher', rot: -3, coul: 'noir', taille: 0.95 },
    { lat: 43.6050, lon: 5.2350, texte: 'fauves échappés', rot: 6, coul: 'rouge', lieu: 'la_barben' },
    { lat: 43.7120, lon: 5.0700, texte: 'VIVANTS ?', rot: -8, coul: 'bleu', taille: 1.15, lieu: 'cales' },
  ],
};
const COULEURS = { rouge: '#b01c26', bleu: '#1d3d8f', noir: '#1a1714' };

// ---------------------------------------------------------------- construction d'une feuille
const cacheSVG = {};
export function construireFeuille(echelle) {
  const f = feuille(echelle);
  const [x0, y0, x1, y1] = f.cadre; const W = x1 - x0, H = y1 - y0;
  const marge = W * 0.045;
  const rng = seedRng('carte:' + echelle);
  const R = echelle === 'region';
  const k = R ? 9 : 1; // facteur d'échelle des largeurs « en mètres »
  if (!cacheSVG[echelle]) {
    const p = [];
    // --- defs : papier, hachures
    const hs = R ? 260 : 26;
    p.push(`<defs>
      <radialGradient id="c-papier-${echelle}" cx="50%" cy="46%" r="75%"><stop offset="0" stop-color="#efe3c2"/><stop offset=".62" stop-color="#e6d4a8"/><stop offset="1" stop-color="#c7a86c"/></radialGradient>
      <linearGradient id="c-pli-v" x1="0" x2="1"><stop offset="0" stop-color="#6b4a1f" stop-opacity=".13"/><stop offset=".48" stop-color="#6b4a1f" stop-opacity="0"/><stop offset=".52" stop-color="#fff8e0" stop-opacity="0"/><stop offset="1" stop-color="#fff8e0" stop-opacity=".12"/></linearGradient>
      <linearGradient id="c-pli-h" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6b4a1f" stop-opacity=".11"/><stop offset=".5" stop-color="#6b4a1f" stop-opacity="0"/><stop offset="1" stop-color="#fff8e0" stop-opacity=".1"/></linearGradient>
      <radialGradient id="c-brule"><stop offset=".55" stop-color="#0d0a08"/><stop offset=".72" stop-color="#2a170a"/><stop offset=".86" stop-color="#6d3a12" stop-opacity=".85"/><stop offset="1" stop-color="#8a5a24" stop-opacity="0"/></radialGradient>
      <radialGradient id="c-cafe"><stop offset=".7" stop-color="#9a6a2e" stop-opacity=".05"/><stop offset=".93" stop-color="#8a5620" stop-opacity=".22"/><stop offset="1" stop-color="#7a4a18" stop-opacity=".05"/></radialGradient>
      <pattern id="c-hach-${echelle}" width="${hs}" height="${hs}" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="${hs}" stroke="#b01c26" stroke-width="${hs * 0.16}" stroke-opacity=".55"/></pattern>
      <pattern id="c-parc-${echelle}" width="${hs * 1.6}" height="${hs * 1.6}" patternUnits="userSpaceOnUse"><path d="M${hs * .4} ${hs * .9}c0-${hs * .5} ${hs * .5}-${hs * .5} ${hs * .5} 0M${hs * 1.2} ${hs * 1.5}c0-${hs * .45} ${hs * .45}-${hs * .45} ${hs * .45} 0" fill="none" stroke="#56693a" stroke-width="${hs * .09}" stroke-opacity=".7"/></pattern>
      <pattern id="c-croix-${echelle}" width="${hs * 1.2}" height="${hs * 1.2}" patternUnits="userSpaceOnUse"><path d="M${hs * .6} ${hs * .25}v${hs * .6}M${hs * .38} ${hs * .45}h${hs * .44}" stroke="#4a4232" stroke-width="${hs * .08}" stroke-opacity=".6"/></pattern>
      <pattern id="c-indus-${echelle}" width="${hs * .9}" height="${hs * .9}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="${hs * .9}" stroke="#6b5d48" stroke-width="${hs * .06}" stroke-opacity=".45"/></pattern>
      <pattern id="c-eau-${echelle}" width="${hs * 3}" height="${hs * 1.1}" patternUnits="userSpaceOnUse"><path d="M0 ${hs * .5}q${hs * .75}-${hs * .3} ${hs * 1.5} 0t${hs * 1.5} 0" fill="none" stroke="#4f7d96" stroke-width="${hs * .07}" stroke-opacity=".55"/></pattern>
      <clipPath id="c-clip-${echelle}"><rect x="${x0}" y="${y0}" width="${W}" height="${H}"/></clipPath>
    </defs>`);
    // --- la feuille : ombre, papier au bord déchiré, cadre imprimé
    const bord = []; const n = 90;
    const tour = [[x0 - marge, y0 - marge], [x1 + marge, y0 - marge], [x1 + marge, y1 + marge], [x0 - marge, y1 + marge]];
    for (let s = 0; s < 4; s++) {
      const [ax, ay] = tour[s], [bx, by] = tour[(s + 1) % 4];
      for (let i = 0; i < n; i++) { const t = i / n; const j = (rng() - 0.5) * marge * 0.09 + Math.sin(t * 40 + s) * marge * 0.02; bord.push([ax + (bx - ax) * t + (ay === by ? 0 : j), ay + (by - ay) * t + (ay === by ? j : 0)]); }
    }
    p.push(`<path d="${dLigne(bord.map(([x, y]) => [x + marge * .25, y + marge * .35]), true)}" fill="#000" opacity=".55"/>`);
    p.push(`<path class="c-papier" d="${dLigne(bord, true)}" fill="url(#c-papier-${echelle})"/>`);
    // --- tracés (découpés au cadre imprimé)
    p.push(`<g clip-path="url(#c-clip-${echelle})">`);
    p.push(...coucheFond(f, echelle, k, hs));
    p.push(...coucheRoutes(f, echelle, k));
    p.push('</g>');
    // cadre imprimé double + graduations
    p.push(`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="#3a2c1c" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`);
    p.push(`<rect x="${x0 - marge * .28}" y="${y0 - marge * .28}" width="${W + marge * .56}" height="${H + marge * .56}" fill="none" stroke="#3a2c1c" stroke-width=".7" vector-effect="non-scaling-stroke"/>`);
    let gr = ''; const pasG = W / 12;
    for (let i = 0; i <= 12; i++) { const x = x0 + i * pasG; gr += `M${f1(x)} ${f1(y0)}v${f1(-marge * .28)}M${f1(x)} ${f1(y1)}v${f1(marge * .28)}`; }
    const pasGy = H / 10;
    for (let i = 0; i <= 10; i++) { const y = y0 + i * pasGy; gr += `M${f1(x0)} ${f1(y)}h${f1(-marge * .28)}M${f1(x1)} ${f1(y)}h${f1(marge * .28)}`; }
    p.push(`<path d="${gr}" stroke="#3a2c1c" stroke-width=".7" vector-effect="non-scaling-stroke"/>`);
    // lettres/chiffres de carroyage (plan de ville)
    let car = '';
    for (let i = 0; i < 12; i++) car += `<text x="${f1(x0 + (i + .5) * pasG)}" y="${f1(y0 - marge * .08)}">${'ABCDEFGHJKLM'[i]}</text>`;
    for (let i = 0; i < 10; i++) car += `<text x="${f1(x0 - marge * .14)}" y="${f1(y0 + (i + .5) * pasGy)}">${i + 1}</text>`;
    p.push(`<g class="c-carroyage" style="font-size:${f1(marge * .16)}px">${car}</g>`);
    // --- titre et légende imprimés (dans la marge)
    p.push(titre(echelle, x0, y0, W, H, marge));
    // --- plis (4 × 3 panneaux)
    let plis = '';
    for (let i = 1; i < 4; i++) { const x = x0 - marge + (W + 2 * marge) * i / 4; plis += `<rect x="${f1(x - W * .03)}" y="${f1(y0 - marge)}" width="${f1(W * .06)}" height="${f1(H + 2 * marge)}" fill="url(#c-pli-v)"/>`; }
    for (let i = 1; i < 3; i++) { const y = y0 - marge + (H + 2 * marge) * i / 3; plis += `<rect x="${f1(x0 - marge)}" y="${f1(y - H * .035)}" width="${f1(W + 2 * marge)}" height="${f1(H * .07)}" fill="url(#c-pli-h)"/>`; }
    let lp = '';
    for (let i = 1; i < 4; i++) { const x = x0 - marge + (W + 2 * marge) * i / 4; lp += `M${f1(x)} ${f1(y0 - marge)}V${f1(y1 + marge)}`; }
    for (let i = 1; i < 3; i++) { const y = y0 - marge + (H + 2 * marge) * i / 3; lp += `M${f1(x0 - marge)} ${f1(y)}H${f1(x1 + marge)}`; }
    plis += `<path d="${lp}" stroke="#5a3d17" stroke-opacity=".32" stroke-width="1.1" vector-effect="non-scaling-stroke"/>`;
    plis += `<path d="${lp}" stroke="#fffbe8" stroke-opacity=".35" stroke-width="1" vector-effect="non-scaling-stroke" transform="translate(${f1(W * .0012)} ${f1(W * .0012)})"/>`;
    // usure aux croisements de plis
    for (let i = 1; i < 4; i++) for (let j = 1; j < 3; j++) {
      const x = x0 - marge + (W + 2 * marge) * i / 4, y = y0 - marge + (H + 2 * marge) * j / 3;
      plis += `<path d="${blob(x, y, W * .012, rng, 5, .5)}" fill="#f6ecd2" opacity=".55"/>`;
    }
    p.push(`<g class="c-plis">${plis}</g>`);
    // --- taches : café, sang, brûlures
    p.push(taches(echelle, f, rng, x0, y0, W, H, marge));
    cacheSVG[echelle] = p.join('');
  }
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'carte-svg carte-' + echelle);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = cacheSVG[echelle];
  const couches = {};
  for (const nom of ['zones', 'annot', 'brouillard', 'route', 'marques', 'pion']) {
    const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'c-' + nom); svg.appendChild(g); couches[nom] = g;
  }
  return { svg, cadre: f.cadre, marge, couches, echelle };
}

// Fonds : parcs, cimetières, zones industrielles, eau, rail, bâti.
function coucheFond(f, echelle, k, hs) {
  const out = []; const R = echelle === 'region';
  const poly = (couche, amp = 0) => f.lignes(couche).map(l => dLigne(amp ? trembler(l, amp, amp * 8, 3) : l, true)).join('');
  const lig = (couche, amp, pas) => f.lignes(couche).map(l => dLigne(trembler(l, amp, pas, 7))).join('');
  if (!R) {
    // halo urbain : les rues, en très large et très pâle, dessinent la ville bâtie
    let halo = '';
    for (const e of f.aretes) if (e.classe >= 3) halo += dLigne(e.pts);
    out.push(`<path class="c-halo" d="${halo}"/>`);
    out.push(`<path d="${poly('industrie')}" fill="#dbc9a6" stroke="#8a7457" stroke-opacity=".5" stroke-width=".8" vector-effect="non-scaling-stroke"/><path d="${poly('industrie')}" fill="url(#c-indus-salon)"/>`);
    out.push(`<path d="${poly('militaire')}" fill="#d9b9a0" /><path d="${poly('militaire')}" fill="url(#c-hach-salon)" opacity=".5"/>`);
    out.push(`<path d="${poly('parcs', 2)}" fill="#b8c486" fill-opacity=".75" stroke="#6f7f45" stroke-opacity=".6" stroke-width=".9" vector-effect="non-scaling-stroke"/><path d="${poly('parcs')}" fill="url(#c-parc-salon)"/>`);
    out.push(`<path d="${poly('cimetieres', 1.5)}" fill="#c9c6a2" stroke="#5d5840" stroke-width=".9" vector-effect="non-scaling-stroke"/><path d="${poly('cimetieres')}" fill="url(#c-croix-salon)"/>`);
    out.push(`<path class="c-ruisseau" d="${lig('ruisseaux', 2, 25)}"/>`);
    out.push(`<path class="c-canal" d="${lig('canaux', 1.5, 25)}"/>`);
    out.push(`<path class="c-bati" d="${poly('bati')}"/>`);
    out.push(`<path class="c-rail-f" d="${lig('rail', 1, 40)}"/><path class="c-rail" d="${lig('rail', 1, 40)}"/>`);
  } else {
    out.push(`<path class="c-ville" d="${f.lignes('ville').map(l => dLigne(l)).join('')}"/>`);
    out.push(`<path d="${poly('etangs', 40)}" fill="#a8c3c2" stroke="#4f7a90" stroke-width="1.3" vector-effect="non-scaling-stroke"/><path d="${poly('etangs')}" fill="url(#c-eau-region)"/>`);
    out.push(`<path class="c-riviere" d="${lig('rivieres', 25, 300)}"/>`);
    out.push(`<path class="c-canal" d="${lig('canaux', 18, 300)}"/>`);
    out.push(`<path class="c-rail-f" d="${lig('rail', 10, 400)}"/><path class="c-rail" d="${lig('rail', 10, 400)}"/>`);
    out.push(relief(f));
  }
  return out;
}
// Hachures de relief (Alpilles, chaîne des Côtes, collines) : petits « chevrons » à la plume.
function relief(f) {
  const rng = seedRng('relief');
  const massifs = [[43.735, 4.955, 5200, 2600], [43.705, 5.02, 3000, 1500], [43.66, 5.215, 5500, 2400], [43.69, 5.17, 2600, 1400], [43.575, 5.08, 2600, 1300], [43.69, 5.075, 1800, 900]];
  let d = '';
  for (const [lat, lon, rx, ry] of massifs) {
    const c = projeter(lat, lon, 'region');
    for (let i = 0; i < 60; i++) {
      const a = rng() * 6.28, r = Math.sqrt(rng());
      const x = c.x + Math.cos(a) * rx * r, y = c.y + Math.sin(a) * ry * r; const s = 180 + rng() * 160;
      d += `M${f1(x - s)} ${f1(y + s * .5)}L${f1(x)} ${f1(y - s * .4)}L${f1(x + s)} ${f1(y + s * .5)}`;
    }
  }
  return `<path class="c-relief" d="${d}"/>`;
}
function coucheRoutes(f, echelle, k) {
  const R = echelle === 'region';
  const parClasse = VOIES.map(() => []);
  const amp = R ? 35 : 1.8, pas = R ? 450 : 30;
  for (const e of f.aretes) {
    const pts = e.classe <= 3 ? trembler(e.pts, amp, pas, e.a * 0.37) : e.pts;
    parClasse[e.classe].push(dLigne(pts));
  }
  const out = [];
  // liserés d'abord (du plus petit au plus gros), puis fonds
  for (let c = 5; c >= 0; c--) if (parClasse[c].length) out.push(`<path class="v-lis v${c}" d="${parClasse[c].join('')}"/>`);
  for (let c = 5; c >= 0; c--) if (parClasse[c].length) out.push(`<path class="v-fond v${c}" d="${parClasse[c].join('')}"/>`);
  // étiquettes de rues (Salon) / noms d'eau (région) et cartouches de routes
  let et = '';
  for (const [x, y, ang, nom, cl] of f.c.etiquettes || []) {
    const u = f.u;
    et += `<text class="et et${cl}" transform="translate(${x * u} ${y * u}) rotate(${ang})">${echapper(nom)}</text>`;
  }
  out.push(`<g class="c-etiquettes">${et}</g>`);
  if (R) {
    let rf = '';
    for (const [x, y, ref, cl] of f.c.refs || []) rf += `<g class="ref ref${cl}" transform="translate(${x * f.u} ${y * f.u})"><g class="m-e"><rect x="-15" y="-7" width="30" height="14" rx="2"/><text y="3.8">${echapper(ref.replace(/^D(\d)/, 'D $1').replace(/^A(\d)/, 'A $1').replace(/^N(\d)/, 'N $1'))}</text></g></g>`;
    out.push(`<g class="c-refs">${rf}</g>`);
  }
  return out;
}
function titre(echelle, x0, y0, W, H, marge) {
  const R = echelle === 'region';
  const t1 = R ? 'LE PAYS SALONAIS' : 'SALON-DE-PROVENCE';
  const t2 = R ? 'Carte des environs — Crau, Alpilles, Durance' : 'Plan de la ville — centre historique et quartiers';
  const s = marge * .34;
  // échelle graphique imprimée (500 m / 5 km) + rose des vents
  const L = R ? 5000 : 500; const xs = x0 + W * .03, ys = y1Of(y0, H) - H * .035;
  let bar = '';
  for (let i = 0; i < 5; i++) bar += `<rect x="${f1(xs + i * L / 5)}" y="${f1(ys)}" width="${f1(L / 5)}" height="${f1(s * .22)}" fill="${i % 2 ? '#f3e8cc' : '#2a2016'}" stroke="#2a2016" stroke-width=".8" vector-effect="non-scaling-stroke"/>`;
  bar += `<text class="c-imprime" x="${f1(xs)}" y="${f1(ys - s * .15)}" style="font-size:${f1(s * .42)}px">0</text><text class="c-imprime" x="${f1(xs + L)}" y="${f1(ys - s * .15)}" style="font-size:${f1(s * .42)}px" text-anchor="middle">${R ? '5 km' : '500 m'}</text>`;
  const cx = x0 + W * .95, cy = y0 + H * .07, r = marge * .7;
  const rose = `<g class="c-rose" transform="translate(${f1(cx)} ${f1(cy)})"><path d="M0 ${-r}L${r * .22} 0L0 ${r}L${-r * .22} 0Z" fill="#f3e8cc" stroke="#2a2016" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M0 ${-r}L${r * .22} 0H${-r * .22}Z" fill="#2a2016"/><path d="M${-r * .7} 0H${r * .7}" stroke="#2a2016" stroke-width=".8" vector-effect="non-scaling-stroke"/><text class="c-imprime" y="${f1(-r * 1.12)}" text-anchor="middle" style="font-size:${f1(r * .42)}px">N</text></g>`;
  return `<g class="c-titre"><text class="c-imprime c-t1" x="${f1(x0 + W * .02)}" y="${f1(y0 + s * 1.25)}" style="font-size:${f1(s * 1.05)}px">${t1}</text>`
    + `<text class="c-imprime c-t2" x="${f1(x0 + W * .02)}" y="${f1(y0 + s * 1.95)}" style="font-size:${f1(s * .5)}px">${t2}</text>`
    + `<path d="M${f1(x0 + W * .02)} ${f1(y0 + s * 2.25)}h${f1(W * .3)}" stroke="#2a2016" stroke-width="1" vector-effect="non-scaling-stroke"/></g>${bar}${rose}`;
}
const y1Of = (y0, H) => y0 + H;
function taches(echelle, f, rng, x0, y0, W, H, marge) {
  let s = '';
  const R = echelle === 'region';
  // café : 2 anneaux (un fond de tasse, un demi-anneau)
  const cafes = R ? [[.78, .72, .07], [.12, .3, .05]] : [[.2, .74, .06], [.83, .28, .045]];
  for (const [u, v, r] of cafes) {
    const cx = x0 + W * u, cy = y0 + H * v, rr = W * r;
    s += `<path d="${blob(cx, cy, rr, rng, 4, .06)}" fill="url(#c-cafe)"/>`;
    s += `<path d="${blob(cx, cy, rr * .97, rng, 5, .05)}" fill="none" stroke="#7b4a17" stroke-opacity=".28" stroke-width="2.2" vector-effect="non-scaling-stroke"/>`;
    s += `<path d="${blob(cx + rr * .5, cy - rr * .2, rr * .2, rng, 6, .4)}" fill="#8a5a24" opacity=".12"/>`;
  }
  // sang : éclaboussure + gouttes (près d'une zone dangereuse)
  const sangs = R ? [[43.605, 5.112, .007], [43.584, 4.998, .005]] : [[43.6406, 5.1043, .008], [43.6378, 5.0905, .005]];
  for (const [lat, lon, r] of sangs) {
    const c = projeter(lat, lon, echelle); const rr = W * r;
    s += `<g class="c-sang"><path d="${blob(c.x, c.y, rr, rng, 11, .55)}"/>`;
    for (let i = 0; i < 9; i++) { const a = rng() * 6.28, d = rr * (1.3 + rng() * 1.6); s += `<path d="${blob(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d, rr * (.05 + rng() * .12), rng, 5, .3)}"/>`; }
    s += `<path d="M${f1(c.x + rr * .2)} ${f1(c.y + rr * .6)}q${f1(rr * .05)} ${f1(rr * .8)} ${f1(-rr * .02)} ${f1(rr * 1.3)}" stroke="#6d1016" stroke-width="${f1(rr * .1)}" stroke-linecap="round" fill="none"/></g>`;
  }
  // brûlures : un coin rongé, un trou de cigarette
  const brul = [[x1Of(x0, W) + marge * .2, y0 + H * .62, W * .055], [x0 + W * .63, y0 + H * .9, W * .012]];
  for (const [cx, cy, r] of brul) {
    s += `<path d="${blob(cx, cy, r * 1.25, rng, 7, .35)}" fill="url(#c-brule)"/>`;
    s += `<path d="${blob(cx, cy, r * .78, rng, 9, .3)}" fill="#0b0b0c"/>`;
  }
  // mots griffonnés dans la marge
  const notes = R
    ? [['Joëlle dit : pas la nuit', x0 + W * .56, y1Of(y0, H) + marge * .62, -1.5], ['eau = canal de Craponne', x0 + W * .05, y0 - marge * .45, 1]]
    : [['jour 3 : plus d’eau au robinet', x0 + W * .5, y1Of(y0, H) + marge * .64, -1.5], ['rester loin des cours', x0 + W * .62, y0 - marge * .46, 1]];
  for (const [t, x, y, r] of notes) s += `<text class="c-note" x="${f1(x)}" y="${f1(y)}" transform="rotate(${r} ${f1(x)} ${f1(y)})" style="font-size:${f1(marge * .32)}px">${echapper(t)}</text>`;
  return `<g class="c-taches">${s}</g>`;
}
const x1Of = (x0, W) => x0 + W;
function echapper(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ---------------------------------------------------------------- brouillard
// Ce qu'on ne connaît pas encore de la feuille : un voile de papier vierge (crayonné de hachures légères), percé de
// trous aux bords doux là où la carte est connue (zones : [[x, y, r], …] en mètres ; null = tout est connu).
let nBrouillard = 0;
export function dessinerBrouillard(F, zones) {
  const g = F.couches.brouillard; if (!g) return;
  g.innerHTML = ''; F.masqueBrouillard = null;
  if (!zones) return;
  const [x0, y0, x1, y1] = F.cadre, m = F.marge * 1.6;
  const id = `c-brou-${F.echelle}-${++nBrouillard}`, hs = F.echelle === 'region' ? 300 : 30;
  let s = `<defs>
    <radialGradient id="${id}-t"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <pattern id="${id}-h" width="${hs}" height="${hs}" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><line x1="0" y1="0" x2="0" y2="${hs}" stroke="#7a6038" stroke-width="${hs * 0.05}" stroke-opacity=".28"/></pattern>
    <mask id="${id}" maskUnits="userSpaceOnUse" x="${x0 - m}" y="${y0 - m}" width="${x1 - x0 + 2 * m}" height="${y1 - y0 + 2 * m}">
      <rect x="${x0 - m}" y="${y0 - m}" width="${x1 - x0 + 2 * m}" height="${y1 - y0 + 2 * m}" fill="#fff"/>`;
  for (const [x, y, r] of zones) s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${id}-t)"/>`;
  s += `</mask></defs>
    <g mask="url(#${id})" class="c-voile">
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#e3d1a6" fill-opacity=".94"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id}-h)"/>
    </g>`;
  g.innerHTML = s;
  F.masqueBrouillard = g.querySelector('mask'); F.idBrouillard = id;
}
// Un trou de plus (pendant un trajet), sans tout redessiner.
export function percerBrouillard(F, x, y, r) {
  if (!F || !F.masqueBrouillard) return;
  const c = document.createElementNS(SVGNS, 'circle');
  c.setAttribute('cx', f1(x)); c.setAttribute('cy', f1(y)); c.setAttribute('r', f1(r)); c.setAttribute('fill', `url(#${F.idBrouillard}-t)`);
  F.masqueBrouillard.appendChild(c);
}

// ---------------------------------------------------------------- couches dynamiques
// Zones de danger (≥ 0,5) : cercle hachuré + contour au feutre rouge + nom griffonné.
export function dessinerZones(g, echelle) {
  let s = '';
  for (const z of ZONES) {
    if (z.echelle !== echelle || z.danger < 0.5) continue;
    const c = projeter(z.centre.lat, z.centre.lon, echelle); const r = z.rayon_m;
    const rng = seedRng('zone:' + z.id);
    s += `<path class="z-hach" d="${blob(c.x, c.y, r, rng, 6, .12)}" style="opacity:${f1(.25 + (z.danger - .5) * 1.2)}"/>`;
    s += `<path class="z-bord" d="${blob(c.x, c.y, r * 1.02, rng, 7, .1)}"/>`;
    const a = -0.9 + rng() * 0.5;
    s += `<g class="z-nom" transform="translate(${f1(c.x + Math.cos(a) * r * .72)} ${f1(c.y + Math.sin(a) * r * .95)})"><g class="m-e"><text transform="rotate(${Math.round(-6 + rng() * 12)})">${echapper(z.nom.replace(/^(Le |La |Les |L')/, ''))}</text></g></g>`;
  }
  g.innerHTML = s;
}
export function dessinerAnnotations(g, echelle, estDecouvert) {
  let s = '';
  (ANNOTATIONS[echelle] || []).forEach((a, i) => {
    if (a.lieu && !estDecouvert(a.lieu)) return;
    const c = projeter(a.lat, a.lon, echelle); const col = COULEURS[a.coul] || COULEURS.noir;
    let inner = `<text transform="rotate(${a.rot || 0})" style="fill:${col};font-size:${f1(15 * (a.taille || 1))}px">${echapper(a.texte)}</text>`;
    if (a.croix) inner += `<path d="M-14 -34l22 20M8 -34l-22 20" stroke="${col}" stroke-width="3" stroke-linecap="round" transform="translate(-6 8)"/>`;
    if (a.fleche) { const [dx, dy] = a.fleche; inner += `<path d="M0 6Q${dx * .3} ${dy * .9 + 6} ${dx} ${dy}m-7 -1l7 1-2 7" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`; }
    s += `<g class="annot" transform="translate(${f1(c.x)} ${f1(c.y)})"><g class="m-e">${inner}</g></g>`;
  });
  g.innerHTML = s;
}

// Marqueur de lieu (taille constante à l'écran). etat : { courant, cle, objectif, visite, fouille, inconnu }
export function creerMarqueur(lieu, p, etat = {}) {
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('class', 'lieu' + (etat.courant ? ' courant' : '') + (etat.cle ? ' cle' : '') + (etat.objectif ? ' objectif' : '') + (etat.visite ? ' visite' : ''));
  g.setAttribute('transform', `translate(${f1(p.x)} ${f1(p.y)})`);
  g.dataset.id = lieu.id;
  const h = lieu.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  let s = '<g class="m-e">';
  if (etat.objectif) s += `<path class="m-obj" d="${cercleFeutre(24, h + 3, 1.9)}"/><text class="m-obj-t" x="20" y="-22" transform="rotate(-10 20 -22)">ici ?</text>`;
  else if (etat.cle) s += `<path class="m-cle" d="${cercleFeutre(20, h)}"/>`;
  s += `<circle class="m-tampon" r="11.5"/>`;
  s += `<g transform="translate(-8.4 -8.4) scale(.7)"><path class="m-picto" d="${pictoPath(lieu.type)}"/></g>`;
  if (etat.visite) s += `<path class="m-coche" d="M7 -13l3 3 6-8"/>`;
  if (etat.fouille) s += `<path class="m-fouille" d="M-16 -15l6 6M-10 -15l-6 6"/>`;
  if (etat.courant) s += `<g class="m-ici"><path d="M0 -14c-5 -7 -8 -10 -8 -15a8 8 0 0 1 16 0c0 5-3 8-8 15z"/><circle cy="-29" r="3"/></g>`;
  s += `<text class="m-nom" y="25">${echapper(lieu.court || lieu.nom)}</text>`;
  s += `<circle class="m-cible" r="22"/></g>`;
  g.innerHTML = s;
  return g;
}

// ---------------------------------------------------------------- pan / zoom (souris, molette, pincement)
// La vue garde un centre (cx, cy) et une largeur visible w (mètres). Pose --mpp sur le SVG.
export function creerVue(hote, svg, { cadre, marge = 0, minW = 300, maxW, onChange, onTap } = {}) {
  const [x0, y0, x1, y1] = cadre;
  maxW = maxW || (x1 - x0 + 2 * marge) * 1.05;
  const v = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: maxW };
  let anim = null, glisse = false;
  const pointeurs = new Map(); let depart = null;
  const taille = () => { const r = hote.getBoundingClientRect(); return { W: r.width || 800, H: r.height || 400, r }; };
  function borner() {
    v.w = Math.max(minW, Math.min(maxW, v.w));
    const { W, H } = taille(); const h = v.w * H / W;
    const mx = x0 - marge, Mx = x1 + marge, my = y0 - marge, My = y1 + marge;
    v.cx = v.w >= Mx - mx ? (mx + Mx) / 2 : Math.max(mx + v.w / 2, Math.min(Mx - v.w / 2, v.cx));
    v.cy = h >= My - my ? (my + My) / 2 : Math.max(my + h / 2, Math.min(My - h / 2, v.cy));
  }
  function appliquer() {
    borner();
    const { W, H } = taille(); const h = v.w * H / W;
    svg.setAttribute('viewBox', `${f1(v.cx - v.w / 2)} ${f1(v.cy - h / 2)} ${f1(v.w)} ${f1(h)}`);
    const mpp = v.w / W;
    svg.style.setProperty('--mpp', mpp.toFixed(4));
    if (onChange) onChange({ ...v, mpp, W, H });
  }
  const versCarte = (cx, cy) => { const { W, H, r } = taille(); const h = v.w * H / W; return { x: v.cx - v.w / 2 + (cx - r.left) / W * v.w, y: v.cy - h / 2 + (cy - r.top) / H * h }; };
  function zoomAutour(px, py, fac) {
    const a = versCarte(px, py); const nw = Math.max(minW, Math.min(maxW, v.w * fac)); const k = nw / v.w;
    v.cx = a.x + (v.cx - a.x) * k; v.cy = a.y + (v.cy - a.y) * k; v.w = nw; appliquer();
  }
  const onWheel = (e) => { e.preventDefault(); stop(); zoomAutour(e.clientX, e.clientY, Math.exp(e.deltaY * (e.deltaMode ? 0.05 : 0.0015))); };
  const onDown = (e) => {
    stop(); pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { hote.setPointerCapture(e.pointerId); } catch (_) {}
    if (pointeurs.size === 1) { glisse = false; depart = { x: e.clientX, y: e.clientY, cx: v.cx, cy: v.cy, cible: e.target }; }
    else if (pointeurs.size === 2) { glisse = true; const [a, b] = [...pointeurs.values()]; depart = { d: Math.hypot(a.x - b.x, a.y - b.y), w: v.w, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cx: v.cx, cy: v.cy }; }
  };
  const onMove = (e) => {
    if (!pointeurs.has(e.pointerId) || !depart) return;
    pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { W } = taille();
    if (pointeurs.size === 1 && depart.x != null) {
      const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      if (!glisse && Math.hypot(dx, dy) > 7) glisse = true;
      if (glisse) { v.cx = depart.cx - dx * v.w / W; v.cy = depart.cy - dy * v.w / W; appliquer(); }
    } else if (pointeurs.size === 2 && depart.d) {
      const [a, b] = [...pointeurs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y) || 1; const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      v.w = depart.w; v.cx = depart.cx; v.cy = depart.cy;
      v.cx -= (m.x - depart.m.x) * v.w / W; v.cy -= (m.y - depart.m.y) * v.w / W;
      zoomAutour(depart.m.x, depart.m.y, depart.d / d);
    }
  };
  const onUp = (e) => {
    const etait = pointeurs.size; const p = depart;
    pointeurs.delete(e.pointerId);
    if (etait === 1 && !glisse && p && onTap) onTap(p.cible, versCarte(e.clientX, e.clientY), e);
    if (pointeurs.size === 1) { const [a] = [...pointeurs.values()]; depart = { x: a.x, y: a.y, cx: v.cx, cy: v.cy, cible: null }; }
    else if (!pointeurs.size) depart = null;
  };
  function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }
  // Anime vers un cadre [minx, miny, maxx, maxy] (+ marge relative).
  // droite / haut : pixels masqués par l'interface (fiche, bandeau) — le cadre tient dans le reste.
  function allerA(bx, { duree = 700, marge: mg = 0.18, droite = 0, haut = 0, bas = 0 } = {}) {
    stop();
    const { W, H } = taille();
    const Wu = Math.max(80, W - droite), Hu = Math.max(80, H - haut - bas);
    const bw = Math.max(1, bx[2] - bx[0]) * (1 + mg * 2), bh = Math.max(1, bx[3] - bx[1]) * (1 + mg * 2);
    const w = Math.max(minW, Math.min(maxW, Math.max(bw * W / Wu, bh * W / Hu)));
    const mpp = w / W;
    const cible = { cx: (bx[0] + bx[2]) / 2 + droite / 2 * mpp, cy: (bx[1] + bx[3]) / 2 - (haut - bas) / 2 * mpp, w };
    if (!duree) { Object.assign(v, cible); appliquer(); return; }
    const a = { ...v }; const t0 = performance.now();
    const pas = (t) => {
      const u = Math.min(1, (t - t0) / duree); const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      v.cx = a.cx + (cible.cx - a.cx) * e; v.cy = a.cy + (cible.cy - a.cy) * e; v.w = Math.exp(Math.log(a.w) + (Math.log(cible.w) - Math.log(a.w)) * e);
      appliquer(); anim = u < 1 ? requestAnimationFrame(pas) : null;
    };
    anim = requestAnimationFrame(pas);
  }
  const zoomer = (fac) => { const { r } = taille(); stop(); zoomAutour(r.left + r.width / 2, r.top + r.height / 2, fac); };
  const ro = new ResizeObserver(() => appliquer()); ro.observe(hote);
  hote.addEventListener('wheel', onWheel, { passive: false });
  hote.addEventListener('pointerdown', onDown);
  hote.addEventListener('pointermove', onMove);
  hote.addEventListener('pointerup', onUp);
  hote.addEventListener('pointercancel', onUp);
  appliquer();
  return {
    etat: () => ({ ...v, mpp: v.w / taille().W }), appliquer, allerA, zoomer, versCarte,
    centrer(x, y, w) { stop(); v.cx = x; v.cy = y; if (w) v.w = w; appliquer(); },
    detruire() { stop(); ro.disconnect(); hote.removeEventListener('wheel', onWheel); hote.removeEventListener('pointerdown', onDown); hote.removeEventListener('pointermove', onMove); hote.removeEventListener('pointerup', onUp); hote.removeEventListener('pointercancel', onUp); },
  };
}

// Regroupe les marqueurs trop proches à l'écran (priorité : courant > objectif > clé > autres).
// marqueurs : [{ g, x, y, prio }] → masque les moins prioritaires et renvoie les groupes { x, y, n, membres }.
export function desencombrer(marqueurs, mpp, rayonPx = 26) {
  const tri = [...marqueurs].sort((a, b) => b.prio - a.prio);
  const vus = []; const groupes = [];
  for (const m of tri) {
    const proche = vus.find(o => Math.hypot(o.x - m.x, o.y - m.y) / mpp < rayonPx);
    if (proche) { m.g.style.display = 'none'; proche.membres.push(m); }
    else { m.g.style.display = ''; m.membres = [m]; vus.push(m); }
  }
  // étiquettes : masquées si elles chevauchent une étiquette plus prioritaire
  const boites = [];
  for (const m of vus) {
    const w = (m.nom || '').length * 6.2 * mpp, h = 13 * mpp; const b = [m.x - w / 2, m.y + 16 * mpp, m.x + w / 2, m.y + 16 * mpp + h];
    const chev = boites.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    m.g.classList.toggle('sans-nom', chev);
    if (!chev) boites.push(b);
    if (m.membres.length > 1) groupes.push({ x: m.x, y: m.y, n: m.membres.length, membres: m.membres, tete: m });
  }
  return groupes;
}
export { LIEUX };

// ---------------------------------------------------------------- montage commun (carte et voyage)
// Monte une feuille dans `hote` (div) : SVG + grain du papier + attribution OSM + vue pan/zoom.
let grainURL = null;
function grain() {
  if (grainURL) return grainURL;
  try {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'); const im = x.createImageData(160, 160); const r = seedRng('grain');
    for (let i = 0; i < im.data.length; i += 4) { const v = 150 + r() * 105; im.data[i] = v; im.data[i + 1] = v * .96; im.data[i + 2] = v * .88; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0);
    // quelques fibres
    x.strokeStyle = 'rgba(90,60,30,.18)'; x.lineWidth = .6;
    for (let i = 0; i < 40; i++) { const a = r() * 160, b = r() * 160, l = 4 + r() * 10, t = r() * 6.28; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + Math.cos(t) * l * .5 + 2, b + Math.sin(t) * l * .5, a + Math.cos(t) * l, b + Math.sin(t) * l); x.stroke(); }
    grainURL = c.toDataURL();
  } catch (e) { grainURL = ''; }
  return grainURL;
}
export function monterFeuille(hote, echelle, { onTap, onChange, estDecouvert = () => true, zones = true, nuit = false, brouillard = null } = {}) {
  const F = construireFeuille(echelle);
  hote.classList.add('carte-hote');
  hote.classList.toggle('nuit', !!nuit);
  hote.appendChild(F.svg);
  const gr = document.createElement('div'); gr.className = 'carte-grain';
  const u = grain(); if (u) gr.style.backgroundImage = `url(${u})`;
  hote.appendChild(gr);
  const osm = document.createElement('div'); osm.className = 'carte-osm'; osm.textContent = '© contributeurs OpenStreetMap';
  hote.appendChild(osm);
  if (zones) dessinerZones(F.couches.zones, echelle);
  dessinerAnnotations(F.couches.annot, echelle, estDecouvert);
  dessinerBrouillard(F, brouillard);

  const R = echelle === 'region';
  F.svg.style.setProperty('--k', R ? '4' : '1');
  const vue = creerVue(hote, F.svg, {
    cadre: F.cadre, marge: F.marge, minW: R ? 2500 : 220, onTap,
    onChange: (v) => {
      F.svg.classList.toggle('z-loin', v.mpp > (R ? 45 : 4.2));
      F.svg.classList.toggle('z-proche', v.mpp < (R ? 14 : 1.25));
      if (onChange) onChange(v);
    },
  });
  return { ...F, vue, hote, detruire() { vue.detruire(); F.svg.remove(); gr.remove(); osm.remove(); } };
}
