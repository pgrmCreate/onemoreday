// ============ Zombies de combat — illustrations SVG ============
// Hiver post-apocalyptique français. Chaque scène : arène sombre en 3 à 5 plans
// (ciel → fond → plan moyen → premier plan) + créature centrée, grande, face au joueur.
// Palette désaturée, accents rares (#a31621/#d6303e, #c9a227, #cfc9b8).
// Tous les ids SVG sont préfixés par le zid (plusieurs SVG coexistent dans le DOM).
// Les CRÉATURES (zombies) vivent dans combat_creatures.js (un calque autonome chacun).
const W = 800, H = 340;
import { CREATURES } from './combat_creatures.js';

// ---------- Fabriques communes ----------

// Œil rouge luisant : halo radial (gradient `${p}-oeil` déclaré dans les defs) + pupille
function oeil(p, x, y, r = 2.4) {
  return `<circle cx="${x}" cy="${y}" r="${(r * 3.4).toFixed(1)}" fill="url(#${p}-oeil)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#d6303e"/>` +
    `<circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.4).toFixed(1)}" fill="#e8868d" opacity="0.8"/>`;
}

// Neige fine déterministe (pas de hasard : rendu stable)
function neige(seed, n = 12) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (i * 167 + seed * 89 + 31) % W;
    const y = (i * 101 + seed * 47 + 17) % 280;
    s += `<circle cx="${x}" cy="${y}" r="${(0.7 + (i % 3) * 0.4).toFixed(1)}" fill="#cfc9b8" opacity="0.${12 + ((i + seed) % 3) * 5}"/>`;
  }
  return s;
}

// Corbeau en vol (deux arcs d'ailes)
function corbeau(x, y, s = 1) {
  return `<path d="M ${x - 9 * s},${y} Q ${x - 4 * s},${y - 7 * s} ${x},${y} Q ${x + 4 * s},${y - 7 * s} ${x + 9 * s},${y}" stroke="#060608" stroke-width="${(1.8 * s).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
}

// Immeubles du fond — fenêtres noires, barricadées (croix de planches) ou rarement allumées
function fond(bats) {
  return bats.map(([x, l, h, n]) => {
    let f = '';
    for (let i = 0; i < (n || 0); i++) {
      const fx = Math.round(x + 9 + (i % 3) * (l / 3.3)), fy = 292 - h + 12 + ((i / 3) | 0) * 26;
      const k = (i * 7 + x) % 13;
      if (k === 0) f += `<rect x="${fx}" y="${fy}" width="9" height="12" fill="#c9a227" opacity="0.2"/>`;
      else if (k < 4) f += `<rect x="${fx}" y="${fy}" width="9" height="12" fill="#050507"/><path d="M ${fx},${fy + 2} l 9,8 M ${fx},${fy + 10} l 9,-8" stroke="#1c1d24" stroke-width="1.5"/>`;
      else f += `<rect x="${fx}" y="${fy}" width="9" height="12" fill="#08080d"/>`;
    }
    return `<rect x="${x}" y="${292 - h}" width="${l}" height="${h}" fill="#0a0a0e"/>${f}`;
  }).join('');
}

// Carcasse de voiture brûlée, vitres soufflées
function carcasse(x, y, s = 1, t = '#0c0d11') {
  return `<g transform="translate(${x},${y}) scale(${s})">
<path d="M -52,0 L -46,-14 L -28,-22 L 26,-22 L 46,-12 L 54,0 Z" fill="${t}"/>
<path d="M -24,-21 L -18,-30 L 18,-30 L 26,-21 Z" fill="${t}"/>
<rect x="-16" y="-28" width="13" height="7" fill="#060608"/><rect x="2" y="-28" width="13" height="7" fill="#060608"/>
<circle cx="-30" cy="1" r="8" fill="#060608"/><circle cx="32" cy="1" r="8" fill="#060608"/>
<path d="M -6,-30 q -5,-14 3,-26" stroke="#1a1d24" stroke-width="5" fill="none" opacity="0.45"/>
</g>`;
}

// Lampadaire éteint, penché
function lampadaire(x, y, pench = -6) {
  return `<g transform="translate(${x},${y}) rotate(${pench})"><rect x="-2" y="-104" width="4" height="104" fill="#0a0a0e"/><path d="M -2,-104 q 14,-10 26,-6" stroke="#0a0a0e" stroke-width="4" fill="none"/><ellipse cx="26" cy="-108" rx="7" ry="4" fill="#0a0a0e"/></g>`;
}

// Traînée de sang séché au sol
function sang(x, y, l, o = 0.4) {
  return `<path d="M ${x},${y} q ${Math.round(l * 0.4)},-5 ${l},-2 l ${-Math.round(l * 0.12)},7 q ${-Math.round(l * 0.55)},-2 ${-Math.round(l * 0.9)},2 Z" fill="#a31621" opacity="${o}"/>`;
}

// Nappes de brume au sol (3 voiles)
function brume(y) {
  return `<rect x="0" y="${y}" width="${W}" height="52" fill="#3a4150" opacity="0.10"/><rect x="0" y="${y + 20}" width="${W}" height="40" fill="#3a4150" opacity="0.08"/><ellipse cx="250" cy="${y + 48}" rx="230" ry="15" fill="#3a4150" opacity="0.08"/>`;
}

// Arène complète : defs + ciel + lune voilée + fond + lueur + sol + accessoires + brume + neige
function arene(p, o) {
  const g = o.lueur || '#a31621';
  const lp = o.lueurPos || [400, 180, 300, 150];
  const lune = o.lune ? `<circle cx="${o.lune[0]}" cy="${o.lune[1]}" r="54" fill="url(#${p}-lune)"/><circle cx="${o.lune[0]}" cy="${o.lune[1]}" r="23" fill="#cfc9b8" opacity="0.75"/><path d="M ${o.lune[0] - 32},${o.lune[1] - 4} q 32,9 64,2" stroke="${o.haut}" stroke-width="8" opacity="0.5" fill="none"/>` : '';
  return `<defs>
<linearGradient id="${p}-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.haut}"/><stop offset="1" stop-color="${o.bas}"/></linearGradient>
<radialGradient id="${p}-lune" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#cfc9b8" stop-opacity="0.8"/><stop offset="0.45" stop-color="#cfc9b8" stop-opacity="0.16"/><stop offset="1" stop-color="#cfc9b8" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-oeil" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.5"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-lueur" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${g}" stop-opacity="0.15"/><stop offset="1" stop-color="${g}" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-vign" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="0.78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.62"/></linearGradient>
${o.defs || ''}</defs>
<rect width="${W}" height="${H}" fill="url(#${p}-ciel)"/>
${lune}${o.fond || ''}
<rect x="0" y="${o.ligneSol}" width="${W}" height="${H - o.ligneSol}" fill="${o.sol}"/>
<ellipse cx="${lp[0]}" cy="${lp[1]}" rx="${lp[2]}" ry="${lp[3]}" fill="url(#${p}-lueur)"/>
${o.props || ''}${brume(o.brumeY ?? 238)}${o.neige === false ? '' : neige(o.seed || 1)}`;
}

// ---------- Arènes : un décor distinct par créature ----------
const ARENES = {
  // Rue déserte sous la lune, carcasses et valise abandonnée
  errant: {
    haut: '#252a36', bas: '#11131a', lune: [646, 60], sol: '#0a0a0c', ligneSol: 292, seed: 3,
    fond: fond([[0, 128, 188, 6], [142, 92, 138, 6], [628, 104, 164, 6], [742, 58, 118, 0]]) + lampadaire(176, 292, -7) + lampadaire(640, 292, 4) + corbeau(226, 86),
    props: carcasse(150, 318, 0.9) + sang(310, 320, 96)
      + `<rect x="232" y="306" width="26" height="16" rx="3" fill="#0c0d12"/><path d="M 238,306 q 7,-8 14,0" stroke="#0c0d12" stroke-width="3" fill="none"/>`,
  },
  // Parking souterrain : piliers, néon agonisant, caddie — pas de neige
  rampant: {
    haut: '#16171d', bas: '#0c0c10', lune: null, lueur: '#8d8878', lueurPos: [405, 150, 220, 110], sol: '#0b0b0e', ligneSol: 282, seed: 5, brumeY: 254, neige: false,
    fond: `<rect x="0" y="0" width="800" height="76" fill="#0e0e13"/>`
      + [0, 1, 2, 3].map(i => `<rect x="${70 + i * 200}" y="68" width="120" height="7" fill="#09090d"/>`).join('')
      + [96, 648].map(x => `<path d="M ${x},76 L ${x - 8},282 L ${x + 34},282 L ${x + 26},76 Z" fill="#101118"/><rect x="${x}" y="168" width="28" height="9" fill="#a31621" opacity="0.22"/>`).join('')
      + `<rect x="352" y="72" width="108" height="5" rx="2" fill="#cfc9b8" opacity="0.45"/>`,
    props: `<g transform="translate(614,300)"><path d="M -26,-32 L 22,-32 L 16,-6 L -20,-6 Z" fill="none" stroke="#14151c" stroke-width="3"/><circle cx="-14" cy="0" r="5" fill="#0d0e13"/><circle cx="10" cy="0" r="5" fill="#0d0e13"/><path d="M 22,-32 l 11,-12" stroke="#14151c" stroke-width="3"/></g>`
      + `<ellipse cx="186" cy="316" rx="46" ry="7" fill="#070709" opacity="0.8"/>` + sang(238, 310, 64, 0.35),
  },
  // Boulevard ouvert : abribus étoilé, papiers gelés, lune basse
  coureur: {
    haut: '#262b38', bas: '#12141b', lune: [126, 64], sol: '#0a0a0d', ligneSol: 290, seed: 7,
    fond: fond([[0, 88, 148, 3], [94, 122, 208, 6], [598, 112, 178, 6], [716, 84, 138, 0]])
      + `<g transform="translate(556,290)"><rect x="-44" y="-58" width="6" height="58" fill="#0b0c11"/><rect x="38" y="-58" width="6" height="58" fill="#0b0c11"/><rect x="-50" y="-64" width="100" height="8" fill="#0b0c11"/><rect x="-36" y="-52" width="70" height="40" fill="#11141c" opacity="0.55"/><path d="M -28,-44 l 54,26 M 26,-44 l -54,26" stroke="#1d2027" stroke-width="1.5" opacity="0.7"/></g>`,
    props: carcasse(184, 316) + [222, 472, 542].map((x, i) => `<rect x="${x}" y="${308 + (i % 2) * 6}" width="10" height="7" fill="#8d8878" opacity="0.22" transform="rotate(${i * 30 - 40} ${x} 310)"/>`).join('') + sang(396, 318, 64, 0.35),
  },
  // Ruelle étroite : murs convergents, benne, griffures, escalier de secours
  enrage: {
    haut: '#1d1f29', bas: '#0e0f14', lune: null, lueurPos: [400, 190, 260, 130], sol: '#0a0a0c', ligneSol: 288, seed: 9, brumeY: 248,
    fond: `<path d="M 0,0 L 268,0 L 332,288 L 0,288 Z" fill="#101218"/><path d="M 800,0 L 532,0 L 468,288 L 800,288 Z" fill="#0e1016"/><path d="M 268,0 L 532,0 L 502,96 L 298,96 Z" fill="#191d28"/>`
      + `<path d="M 636,62 l 58,24 M 636,104 l 58,24 M 636,146 l 58,24 M 656,52 l 0,132 M 694,68 l 0,130" stroke="#0a0b10" stroke-width="4"/>`
      + [70, 130, 700].map(x => `<rect x="${x}" y="110" width="22" height="30" fill="#050507"/><path d="M ${x},116 l 22,18 M ${x},134 l 22,-18" stroke="#1c1d24" stroke-width="2"/>`).join(''),
    props: `<g transform="translate(150,306)"><rect x="-52" y="-44" width="104" height="44" rx="4" fill="#0e1014"/><rect x="-56" y="-50" width="112" height="10" rx="3" fill="#0b0c10"/><path d="M -30,-50 q 10,-10 24,-6" stroke="#101216" stroke-width="5" fill="none"/></g>`
      + `<ellipse cx="238" cy="304" rx="20" ry="11" fill="#0b0c10"/><ellipse cx="264" cy="308" rx="14" ry="8" fill="#0d0e12"/>`
      + `<path d="M 598,182 l 14,38 M 610,178 l 14,38 M 622,174 l 14,38" stroke="#1d2027" stroke-width="2.4" opacity="0.8"/>` + sang(330, 314, 84, 0.45),
  },
  // Décharge derrière un grillage : sacs éventrés, mouches, flaque verdâtre
  gonfle: {
    haut: '#21262c', bas: '#10130f', lune: [676, 68], lueur: '#3d4a36', sol: '#0b0d0a', ligneSol: 290, seed: 11,
    defs: `<radialGradient id="gonfle-gaz" cx="0.42" cy="0.36" r="0.78"><stop offset="0" stop-color="#2a3324"/><stop offset="0.65" stop-color="#1b2117"/><stop offset="1" stop-color="#11150f"/></radialGradient>`,
    fond: fond([[0, 110, 150, 6], [654, 146, 168, 9]])
      + [130, 170, 210, 250, 290].map(x => `<path d="M ${x},290 L ${x},234" stroke="#0c0d10" stroke-width="3"/>`).join('') + `<path d="M 122,238 L 298,238 M 122,262 L 298,262" stroke="#0c0d10" stroke-width="2"/>`,
    props: `<ellipse cx="560" cy="310" rx="26" ry="13" fill="#0c0e0a"/><ellipse cx="600" cy="314" rx="20" ry="10" fill="#0a0c08"/><ellipse cx="530" cy="316" rx="16" ry="8" fill="#0d0f0b"/>`
      + [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${556 + ((i * 17) % 52) - 26}" cy="${266 + (i * 11) % 30}" r="0.9" fill="#060608" opacity="0.6"/>`).join('')
      + `<ellipse cx="420" cy="318" rx="60" ry="8" fill="#141a10" opacity="0.8"/>`,
  },
  // Parvis d'église : clocher, bancs renversés, corbeaux qui fuient le cri
  hurleur: {
    haut: '#252a36', bas: '#11131a', lune: [652, 54], sol: '#0a0a0d', ligneSol: 292, seed: 13,
    fond: `<path d="M 80,292 L 80,120 L 102,86 L 124,120 L 124,292 Z" fill="#0b0b10"/><path d="M 102,86 L 102,62 M 92,72 L 112,72" stroke="#0b0b10" stroke-width="4"/><rect x="92" y="130" width="20" height="28" rx="9" fill="#060609"/>`
      + fond([[148, 110, 120, 6], [640, 158, 142, 9]])
      + corbeau(300, 92, 1.1) + corbeau(352, 60, 0.9) + corbeau(420, 44, 0.8) + corbeau(482, 78) + corbeau(252, 130, 1.2),
    props: `<g transform="translate(218,310)"><rect x="-40" y="-8" width="80" height="6" fill="#0c0d11" transform="rotate(-16)"/><path d="M -34,-2 l 0,10 M 30,-22 l 0,12" stroke="#0c0d11" stroke-width="4"/></g>`
      + `<ellipse cx="620" cy="308" rx="54" ry="10" fill="#0c0e13"/><rect x="610" y="266" width="18" height="38" fill="#0b0c11"/><ellipse cx="619" cy="266" rx="24" ry="6" fill="#0e1118"/>` + sang(300, 320, 70, 0.35),
  },
  // Cour d'immeuble : linge oublié, fenêtre encore allumée, matelas
  putrefie: {
    haut: '#1b1d24', bas: '#0e0f12', lune: null, lueur: '#c9a227', lueurPos: [361, 116, 90, 64], sol: '#0b0b0d', ligneSol: 286, seed: 15, brumeY: 246,
    fond: `<rect x="0" y="0" width="190" height="286" fill="#101117"/><rect x="610" y="0" width="190" height="286" fill="#0f1015"/><rect x="190" y="0" width="420" height="240" fill="#0c0d12"/>`
      + [0, 1, 2, 3, 4, 5].map(i => `<rect x="${236 + (i % 3) * 120}" y="${66 + ((i / 3) | 0) * 70}" width="22" height="28" fill="#07080b"/>`).join('')
      + `<rect x="350" y="96" width="22" height="28" fill="#c9a227" opacity="0.28"/><path d="M 350,110 h 22 M 361,96 v 28" stroke="#0c0d12" stroke-width="2"/>`
      + `<path d="M 190,122 Q 400,152 610,118" stroke="#1a1c22" stroke-width="1.6" fill="none"/>`
      + [258, 330, 470, 540].map((x, i) => `<path d="M ${x},${134 + (i % 2) * 7} q 6,26 -2,44 l 14,-2 q 6,-22 0,-42 Z" fill="#0d0e13"/>`).join(''),
    props: `<g transform="translate(158,306)"><rect x="-22" y="-38" width="44" height="38" rx="4" fill="#0d0e12"/><ellipse cx="0" cy="-38" rx="22" ry="5" fill="#0a0b0f"/></g>`
      + `<rect x="540" y="296" width="110" height="16" rx="6" fill="#0e0f13" transform="rotate(-5 595 304)"/>` + sang(296, 316, 90, 0.3),
  },
  // Terrain vague : arbres nus, ossements, carcasse dévorée
  chien_infecte: {
    haut: '#222630', bas: '#0f1113', lune: [120, 62], sol: '#0c0e0c', ligneSol: 294, seed: 17,
    fond: [210, 296, 560, 654, 738].map((x, i) => `<path d="M ${x},294 L ${x - 2},${214 - (i % 3) * 14} M ${x - 1},238 l -16,-22 M ${x},228 l 14,-20 M ${x - 1},254 l -12,-14" stroke="#08090b" stroke-width="${3.5 - (i % 2)}" fill="none"/>`).join('')
      + [330, 380, 430, 480].map(x => `<path d="M ${x},294 L ${x + 4},250" stroke="#0b0c0e" stroke-width="3"/>`).join('') + `<path d="M 322,258 L 492,250" stroke="#0b0c0e" stroke-width="2"/>`,
    props: `<path d="M 250,318 l 22,-4 M 296,322 l 16,2" stroke="#8f8876" stroke-width="2.4" opacity="0.5" stroke-linecap="round"/><circle cx="250" cy="318" r="2.4" fill="#8f8876" opacity="0.5"/><circle cx="272" cy="314" r="2.4" fill="#8f8876" opacity="0.5"/>`
      + `<path d="M 600,316 q 18,-14 44,-6 q 14,4 18,10 l -60,2 Z" fill="#0d0a0a"/><path d="M 612,310 q 8,-6 18,-4 M 624,304 q 6,-3 12,-2" stroke="#3d1218" stroke-width="2" opacity="0.7" fill="none"/>` + sang(486, 320, 70),
  },
  // Commissariat barricadé : fenêtres grillagées, fourgon, douilles
  colosse: {
    haut: '#23242e', bas: '#101117', lune: [706, 56], sol: '#0a0a0d', ligneSol: 296, seed: 19,
    fond: `<rect x="120" y="70" width="560" height="226" fill="#0f1118"/><rect x="120" y="70" width="560" height="22" fill="#0a0b10"/>`
      + [0, 1, 2, 3, 4, 5].map(i => `<rect x="${150 + i * 92}" y="116" width="42" height="56" fill="#08090d"/><path d="M ${150 + i * 92},132 h 42 M ${150 + i * 92},150 h 42 M ${164 + i * 92},116 v 56 M ${178 + i * 92},116 v 56" stroke="#1a1c24" stroke-width="2"/>`).join('')
      + `<rect x="368" y="210" width="64" height="86" fill="#07080b"/><path d="M 362,226 l 76,14 M 362,258 l 76,-12 M 362,282 l 76,8" stroke="#15171d" stroke-width="7"/>`,
    props: `<g transform="translate(648,296)"><rect x="-66" y="-44" width="132" height="40" rx="8" fill="#0d0f16"/><rect x="-56" y="-36" width="28" height="16" fill="#070809"/><circle cx="-38" cy="-2" r="9" fill="#060608"/><circle cx="36" cy="-2" r="9" fill="#060608"/><rect x="-10" y="-51" width="20" height="7" rx="2" fill="#11141d"/></g>`
      + [298, 318, 338, 354].map((x, i) => `<rect x="${x}" y="${314 + (i % 2) * 4}" width="5" height="2" fill="#c9a227" opacity="0.4" transform="rotate(${i * 44} ${x} 315)"/>`).join('')
      + `<path d="M 178,312 l 60,-18 M 194,318 l 60,-18" stroke="#0c0d12" stroke-width="4"/>` + sang(420, 322, 80),
  },
  // Cour d'école au crépuscule : préau, portique de balançoires, cartable abandonné
  ecolier: {
    haut: '#272c38', bas: '#12141b', lune: [150, 70], sol: '#0a0a0d', ligneSol: 292, seed: 23,
    fond: fond([[0, 150, 150, 9], [560, 230, 150, 12]])
      + `<g transform="translate(360,200)"><rect x="-60" y="0" width="120" height="92" fill="#0c0d12"/><rect x="-60" y="-6" width="120" height="8" fill="#0a0b10"/><path d="M -56,0 L -56,92 M -28,0 L -28,92 M 0,0 L 0,92 M 28,0 L 28,92 M 56,0 L 56,92" stroke="#0a0b10" stroke-width="3"/></g>`
      + `<g transform="translate(120,292)"><rect x="-2" y="-78" width="4" height="78" fill="#0b0c11"/><rect x="64" y="-78" width="4" height="78" fill="#0b0c11"/><rect x="-6" y="-80" width="78" height="5" fill="#0b0c11"/><path d="M 14,-75 l 0,40 M 30,-75 l 0,40 M 46,-75 l 0,40" stroke="#11141c" stroke-width="2"/><rect x="10" y="-36" width="10" height="5" fill="#11141c"/><rect x="40" y="-36" width="10" height="5" fill="#11141c"/></g>`
      + corbeau(300, 80) + corbeau(352, 64, 0.8),
    props: `<rect x="232" y="306" width="22" height="16" rx="2" fill="#3a2f1a" transform="rotate(-8 243 314)"/><path d="M 236,306 q 6,-7 12,-1" stroke="#3a2f1a" stroke-width="3" fill="none"/>`
      + sang(330, 318, 70, 0.32),
  },
  // Barrage de police : fourgon, gyrophare éteint, barrière, douilles au sol
  policier: {
    haut: '#23252e', bas: '#101117', lune: [120, 58], sol: '#0a0a0d', ligneSol: 294, seed: 25,
    fond: fond([[0, 120, 170, 9], [150, 96, 130, 6], [640, 120, 160, 9]])
      + `<g transform="translate(470,294)"><rect x="-70" y="-46" width="140" height="42" rx="8" fill="#0d0f16"/><rect x="-60" y="-38" width="30" height="16" fill="#070809"/><rect x="30" y="-38" width="30" height="16" fill="#070809"/><circle cx="-44" cy="-2" r="9" fill="#060608"/><circle cx="44" cy="-2" r="9" fill="#060608"/><rect x="-12" y="-53" width="24" height="8" rx="2" fill="#11141d"/><rect x="-8" y="-52" width="7" height="6" fill="#3a1a1d"/><rect x="2" y="-52" width="7" height="6" fill="#1a2d3a"/></g>`
      + lampadaire(180, 294, -6),
    props: `<g transform="translate(250,300)"><rect x="-40" y="-30" width="8" height="30" fill="#11141c"/><rect x="32" y="-30" width="8" height="30" fill="#11141c"/><rect x="-46" y="-34" width="92" height="8" rx="2" fill="#7a1018" opacity="0.5"/><path d="M -40,-22 l 80,0 M -40,-12 l 80,0" stroke="#0c0d12" stroke-width="2"/></g>`
      + [300, 318, 338].map((x, i) => `<rect x="${x}" y="${314 + (i % 2) * 4}" width="5" height="2" fill="#c9a227" opacity="0.4" transform="rotate(${i * 40} ${x} 315)"/>`).join('')
      + sang(420, 320, 80),
  },
  // Tunnel/égout : voûte sombre, tuyaux, flaque verdâtre — pas de neige sous terre
  rat_geant: {
    haut: '#15171b', bas: '#0b0d0c', lune: null, lueur: '#3d4a36', lueurPos: [400, 170, 240, 120], sol: '#0a0b0a', ligneSol: 286, seed: 27, brumeY: 250, neige: false,
    fond: `<rect x="0" y="0" width="800" height="92" fill="#0d0f0e"/>`
      + `<path d="M 400,92 a 360,150 0 0 0 -360,150 L 40,286 L 760,286 L 760,242 a 360,150 0 0 0 -360,-150 Z" fill="#0c0e0c"/>`
      + [120, 680].map(x => `<path d="M ${x},92 L ${x},286" stroke="#080a08" stroke-width="6"/>`).join('')
      + `<rect x="150" y="120" width="500" height="10" rx="4" fill="#0a0c0a"/><path d="M 150,160 L 650,160" stroke="#0a0c0a" stroke-width="8"/>`
      + `<path d="M 360,130 q -4,30 0,60" stroke="#3d4a36" stroke-width="2" fill="none" opacity="0.4"/>`,
    props: `<ellipse cx="400" cy="300" rx="150" ry="12" fill="#141a10" opacity="0.7"/>`
      + `<ellipse cx="260" cy="312" rx="40" ry="6" fill="#0c0e0a"/>`
      + sang(470, 316, 70, 0.35),
  },
  // Arène générique (zid inconnu)
  inconnu: {
    haut: '#22252f', bas: '#101218', lune: [660, 64], sol: '#0a0a0c', ligneSol: 292, seed: 21,
    fond: fond([[0, 120, 170, 9], [150, 90, 130, 6], [640, 110, 160, 9]]) + corbeau(280, 88),
    props: sang(340, 318, 70, 0.35),
  },
};

// ---------- Fallback : silhouette générique si un zid est inconnu ----------
// Silhouette humanoïde générique (zid inconnu)
function zInconnu(p) {
  const peau = '#121318';
  return `<g transform="translate(150,346)">
<ellipse cx="0" cy="2" rx="78" ry="12" fill="#000" opacity="0.5"/>
<path d="M -18,-80 L -24,-42 L -20,-4 L -6,-4 L -10,-42 L -2,-76 Z" fill="#0d0e13"/>
<path d="M 16,-80 L 24,-44 L 22,-4 L 8,-4 L 8,-44 L 2,-76 Z" fill="#0d0e13"/>
<path d="M -24,-2 l -14,2 l 2,6 l 14,0 Z M 22,-2 l 14,2 l -2,6 l -14,0 Z" fill="#0a0a0e"/>
<path d="M -28,-84 Q -36,-122 -22,-150 L 24,-152 Q 36,-120 28,-82 L 14,-88 L 2,-78 L -12,-88 L -20,-78 Z" fill="#0f1016"/>
<path d="M -22,-144 L -46,-118 L -42,-86" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -42,-86 l -7,8 M -42,-86 l 0,10 M -42,-86 l 6,8" stroke="${peau}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M 24,-144 L 44,-116 L 50,-88" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 50,-88 l 7,8 M 50,-88 l 0,10 M 50,-88 l -6,8" stroke="${peau}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M -12,-152 Q -16,-176 2,-180 Q 18,-176 14,-152 Q 6,-144 -4,-146 Z" fill="${peau}"/>
<path d="M -5,-148 q 5,4 12,1" stroke="#08080c" stroke-width="2" fill="none"/>
${oeil(p, -5, -164, 2.2)}${oeil(p, 8, -163, 2.2)}
</g>`;
}

// ---------- Photos de zombies (PNG détourés) ----------
// Certains types ont une vraie illustration détourée dans /zombies/. Quand elle existe,
// on l'affiche EN GRAND dans la scène de combat à la place de la silhouette SVG ; sinon
// on retombe sur la créature dessinée. Le fichier ne suit pas toujours l'id (gonfle →
// gonfleur), d'où cette table explicite. Chemin RELATIF (sous-dossier sur GitHub Pages).
const ZOMBIE_PNG = {
  errant: 'errant.png', coureur: 'coureur.png', rampant: 'rampant.png',
  hurleur: 'hurleur.png', enrage: 'enrage.png', gonfle: 'gonfleur.png',
};
export function pngZombie(zid) {
  const f = ZOMBIE_PNG[zid];
  return f ? 'zombies/' + f : null;
}

// ---------- Export ----------
// Le combat superpose DEUX calques distincts : le DÉCOR (arène, plein cadre) en fond,
// et la CRÉATURE (image autonome, fond transparent) par-dessus — autant de créatures
// que de zombies présents. Chacun se positionne et se met à l'échelle indépendamment.

// Décor seul : l'arène, sans aucune créature. Rempli le cadre (slice).
export function svgCombatDecor(zid) {
  const p = ARENES[zid] ? zid : 'inconnu';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
${arene(p, ARENES[p])}
<ellipse cx="400" cy="330" rx="430" ry="24" fill="#3a4150" opacity="0.08"/>
<rect width="${W}" height="${H}" fill="url(#${p}-vign)"/>
</svg>`;
}

// defs propres à la créature autonome (le halo d'œil rouge, autrefois fourni par l'arène)
function defsZombie(p) {
  return `<defs><radialGradient id="${p}-oeil" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.5"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient></defs>`;
}

// Créature seule : fond transparent, centrée en x=0 et posée sur sa ligne de sol
// (translate(150,346)), prête à être incrustée par-dessus le décor. viewBox 300×360.
export function svgCombatZombie(zid) {
  const draw = CREATURES[zid] || zInconnu;
  const p = CREATURES[zid] ? zid : 'inconnu';
  return `<svg class="z-svg" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
${defsZombie(p)}
${draw(p)}
</svg>`;
}
