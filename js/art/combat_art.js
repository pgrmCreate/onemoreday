// ============ Zombies de combat — illustrations SVG ============
// Hiver post-apocalyptique français. Chaque scène : arène sombre en 3 à 5 plans
// (ciel → fond → plan moyen → premier plan) + créature centrée, grande, face au joueur.
// Palette désaturée, accents rares (#a31621/#d6303e, #c9a227, #cfc9b8).
// Tous les ids SVG sont préfixés par le zid (plusieurs SVG coexistent dans le DOM).
// Fichier 100 % autonome — aucun import. Export unique : svgCombat(zid).
const W = 800, H = 340;

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
  // Arène générique (zid inconnu)
  inconnu: {
    haut: '#22252f', bas: '#101218', lune: [660, 64], sol: '#0a0a0c', ligneSol: 292, seed: 21,
    fond: fond([[0, 120, 170, 9], [150, 90, 130, 6], [640, 110, 160, 9]]) + corbeau(280, 88),
    props: sang(340, 318, 70, 0.35),
  },
};

// ---------- Créatures (anatomie cassée, multi-paths) ----------

// Errant : pas traînant, mâchoire pendante reliée par des lambeaux, bras tordu à contresens
function zErrant(p) {
  const peau = '#15161c', man = '#0d0e13';
  return `<g transform="translate(400,314)">
<ellipse cx="2" cy="2" rx="84" ry="13" fill="#000" opacity="0.5"/>
<path d="M 18,-86 L 40,-46 L 52,-4 L 38,0 L 26,-44 L 10,-78 Z" fill="${man}"/>
<path d="M 36,2 l 22,-2 l 0,6 l -24,2 Z" fill="#0a0a0e"/>
<path d="M -22,-88 L -26,-40 L -22,-2 L -6,-2 L -8,-44 L -2,-84 Z" fill="${man}"/>
<path d="M -26,0 l -16,2 l 2,5 l 18,0 Z" fill="#0a0a0e"/>
<path d="M -34,-92 Q -44,-136 -30,-166 L 28,-170 Q 44,-134 36,-94 L 28,-96 L 24,-80 L 12,-94 L 2,-78 L -10,-92 L -18,-78 L -26,-92 Z" fill="${man}"/>
<path d="M -30,-160 Q -2,-170 26,-164 L 24,-150 Q -2,-156 -28,-148 Z" fill="#13141a"/>
<path d="M -6,-140 q 12,5 22,2 M -7,-130 q 12,5 23,2 M -7,-120 q 11,5 22,2" stroke="#23242c" stroke-width="2.4" fill="none"/>
<path d="M -28,-156 L -52,-128 L -38,-104 L -58,-72" stroke="${peau}" stroke-width="10" fill="none" stroke-linejoin="miter" stroke-linecap="round"/>
<path d="M -58,-72 l -5,9 M -58,-72 l 2,11 M -58,-72 l 8,8" stroke="${peau}" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 30,-154 L 42,-112 L 40,-62" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 40,-62 l -4,10 M 40,-62 l 3,11 M 40,-62 l 9,7" stroke="${peau}" stroke-width="2.4" stroke-linecap="round"/>
<g transform="rotate(8 0 -160)">
<path d="M -12,-168 Q -18,-192 -2,-198 Q 16,-194 13,-170 Q 12,-162 4,-160 L -8,-162 Q -12,-164 -12,-168 Z" fill="${peau}"/>
<path d="M -7,-160 Q -6,-142 2,-139 Q 9,-141 9,-156 L 4,-158 Q -2,-156 -7,-160 Z" fill="#101117"/>
<path d="M -5,-157 q 4,3 12,1" stroke="#5e564a" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -7,-159 L -8,-150 M 8,-157 L 9,-149" stroke="#1b1118" stroke-width="1.4"/>
<path d="M 1,-139 q 1,9 -1,18" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.8"/>
${oeil(p, -6, -182, 2.2)}${oeil(p, 7, -181, 2.2)}
</g>
<path d="M -4,-96 q 3,16 0,34" stroke="#5e1118" stroke-width="3" opacity="0.6" fill="none"/>
</g>`;
}

// Rampant : sectionné à la taille, traînée noire, viscères, doigts rongés jusqu'à l'os
function zRampant(p) {
  const peau = '#14151b';
  return `<g transform="translate(400,320)">
<ellipse cx="0" cy="2" rx="120" ry="11" fill="#000" opacity="0.5"/>
<path d="M -330,-2 Q -220,-16 -96,-8 L -92,4 Q -224,-2 -330,10 Z" fill="#070308" opacity="0.85"/>
<path d="M -300,2 q 60,-6 130,-3" stroke="#1d0a10" stroke-width="3" opacity="0.6" fill="none"/>
<path d="M -96,-10 q -22,10 -42,4 q -16,-5 -30,3" stroke="#2a0d12" stroke-width="7" fill="none" opacity="0.85"/>
<path d="M -120,-4 q -10,7 -22,5" stroke="#3d1218" stroke-width="4" fill="none" opacity="0.7"/>
<path d="M -86,-12 Q -88,-30 -68,-36 L 18,-50 Q 52,-52 66,-40 L 64,-22 Q 30,-30 -14,-22 Q -56,-14 -82,-8 Z" fill="${peau}"/>
<path d="M -84,-14 q 8,-10 18,-12 l -2,12 q -10,2 -16,6 Z" fill="#2a0d12"/>
<circle cx="-78" cy="-22" r="2.6" fill="#8f8876" opacity="0.8"/>
<path d="M -66,-34 l 8,-5 l 8,4 l 9,-5 l 9,4 l 10,-5 l 10,4 l 11,-5" stroke="#23242c" stroke-width="2.4" fill="none"/>
<path d="M -30,-40 L -8,-46 L -4,-30 L -16,-24 Z" fill="#0c0d12"/>
<path d="M 6,-44 L -16,-20 L 10,-6" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="miter"/>
<path d="M 52,-42 L 88,-22 L 116,-8" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 116,-8 l 14,2 M 116,-8 l 12,6 M 116,-8 l 8,9 M 116,-8 l 3,11" stroke="#8f8876" stroke-width="2.2" stroke-linecap="round"/>
<path d="M 10,-6 l 12,3 M 10,-6 l 9,7 M 10,-6 l 3,9" stroke="#8f8876" stroke-width="2" stroke-linecap="round"/>
<path d="M 56,-46 Q 52,-72 72,-78 Q 92,-74 88,-50 Q 86,-40 74,-38 Q 60,-38 56,-46 Z" fill="${peau}"/>
<path d="M 66,-40 Q 70,-30 80,-30 Q 88,-32 88,-44 L 80,-40 Q 72,-38 66,-40 Z" fill="#0e0f14"/>
<path d="M 68,-38 q 6,3 14,1" stroke="#5e564a" stroke-width="1.5" fill="none" opacity="0.7"/>
${oeil(p, 68, -62, 2.4)}${oeil(p, 82, -60, 2.4)}
<path d="M -60,-8 q 2,6 0,10 M -30,-14 q 2,6 0,11" stroke="#a31621" stroke-width="2" opacity="0.6" fill="none"/>
</g>`;
}

// Coureur : récent, sweat à capuche, élan vers le joueur, mains tendues, cri muet
function zCoureur(p) {
  const peau = '#1b1c23', vet = '#10121a', jean = '#141821';
  return `<g transform="translate(400,312)">
<ellipse cx="0" cy="2" rx="88" ry="12" fill="#000" opacity="0.5"/>
<path d="M 60,-6 q 28,-10 56,-4" stroke="#3a4150" stroke-width="5" opacity="0.22" fill="none"/>
<path d="M -14,-74 L -34,-40 L -30,-4 L -14,-4 L -18,-38 L 0,-66 Z" fill="${jean}"/>
<path d="M -32,-2 l -18,2 l 2,6 l 18,0 Z" fill="#0a0a0e"/>
<path d="M 14,-72 L 44,-44 L 74,-12 L 62,-2 L 34,-34 L 4,-62 Z" fill="${jean}"/>
<path d="M 62,-4 l 20,6 l -3,7 l -20,-5 Z" fill="#0a0a0e"/>
<path d="M -30,-78 Q -40,-116 -24,-138 L 26,-138 Q 42,-112 30,-76 L 16,-82 L 6,-72 L -8,-82 L -18,-72 Z" fill="${vet}"/>
<path d="M -24,-136 Q 0,-148 26,-136 L 20,-124 Q 0,-134 -18,-124 Z" fill="#0b0d14"/>
<path d="M 22,-134 q 8,4 8,12 q -8,2 -14,-4 Z" fill="${peau}"/>
<path d="M 24,-130 q 5,3 4,8" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -26,-126 L -52,-104 L -66,-78" stroke="${peau}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M -66,-78 l -14,-2 M -66,-78 l -13,5 M -66,-78 l -8,11 M -66,-78 l -1,13 M -66,-78 l 7,10" stroke="${peau}" stroke-width="3" stroke-linecap="round"/>
<path d="M 28,-124 L 50,-100 L 60,-74" stroke="${peau}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M 60,-74 l 14,-3 M 60,-74 l 12,6 M 60,-74 l 6,12 M 60,-74 l -2,13" stroke="${peau}" stroke-width="3" stroke-linecap="round"/>
<path d="M -14,-134 Q -18,-160 2,-166 Q 22,-162 18,-136 Q 16,-126 4,-124 Q -10,-124 -14,-134 Z" fill="${peau}"/>
<path d="M -7,-128 Q -5,-112 3,-110 Q 12,-112 11,-126 L 4,-128 Q -2,-126 -7,-128 Z" fill="#08080c"/>
<path d="M -6,-127 l 3,4 l 3,-3 l 3,4 l 3,-3 l 4,3" stroke="#8f8876" stroke-width="1.5" fill="none"/>
<path d="M 2,-110 q 1,8 0,14" stroke="#a31621" stroke-width="1.8" opacity="0.7" fill="none"/>
${oeil(p, -7, -148, 2.5)}${oeil(p, 9, -147, 2.5)}
<path d="M 12,-132 q 6,10 4,22" stroke="#a31621" stroke-width="2.4" opacity="0.7" fill="none"/>
</g>`;
}

// Enragé : posture de charge basse, peau lacérée par ses propres ongles, dents claquantes
function zEnrage(p) {
  const peau = '#17161c';
  return `<g transform="translate(400,314)">
<ellipse cx="0" cy="2" rx="98" ry="13" fill="#000" opacity="0.5"/>
<path d="M -60,-4 l 26,-6 M -56,2 l 24,-5 M 40,-8 l 26,4" stroke="#1d2027" stroke-width="2" opacity="0.7"/>
<path d="M -22,-70 L -52,-38 L -48,-4 L -32,-4 L -34,-34 L -8,-60 Z" fill="${peau}"/>
<path d="M -50,-2 l -16,2 l 2,6 l 17,-1 Z" fill="#0c0c10"/>
<path d="M 22,-70 L 50,-40 L 50,-4 L 34,-4 L 34,-34 L 8,-60 Z" fill="${peau}"/>
<path d="M 48,-2 l 17,2 l -2,6 l -17,-1 Z" fill="#0c0c10"/>
<path d="M -34,-72 Q -46,-110 -26,-136 L 30,-136 Q 48,-108 34,-70 L 20,-78 L 10,-66 L -4,-78 L -16,-66 L -26,-76 Z" fill="${peau}"/>
<path d="M -26,-134 L -34,-104 L -22,-112 L -26,-88 L -14,-100" stroke="#0d0e13" stroke-width="5" fill="none"/>
<path d="M -14,-126 l 10,16 M -4,-128 l 10,16 M 6,-130 l 10,16 M -20,-104 l 12,14 M 14,-108 l 10,14" stroke="#a31621" stroke-width="1.8" opacity="0.8"/>
<path d="M -30,-126 L -66,-110 L -92,-80" stroke="${peau}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M -92,-80 l -13,-4 M -92,-80 l -13,3 M -92,-80 l -9,10 M -92,-80 l -2,13" stroke="${peau}" stroke-width="3" stroke-linecap="round"/>
<path d="M 32,-126 L 68,-108 L 90,-76" stroke="${peau}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M 90,-76 l 13,-4 M 90,-76 l 13,3 M 90,-76 l 8,10 M 90,-76 l 1,13" stroke="${peau}" stroke-width="3" stroke-linecap="round"/>
<path d="M -64,-108 l 8,8 M -76,-96 l 8,8 M 64,-106 l -8,8 M 78,-92 l -8,8" stroke="#a31621" stroke-width="1.6" opacity="0.75"/>
<path d="M -16,-132 Q -22,-160 2,-166 Q 24,-160 18,-132 Q 14,-120 0,-118 Q -12,-120 -16,-132 Z" fill="${peau}"/>
<path d="M -10,-126 Q -8,-114 2,-112 Q 12,-114 12,-124 L 2,-122 Q -4,-122 -10,-126 Z" fill="#08080c"/>
<path d="M -9,-125 l 3,5 l 3,-4 l 3,5 l 3,-4 l 4,4 l 3,-4" stroke="#9a9484" stroke-width="1.6" fill="none"/>
<path d="M -7,-113 l 3,-4 l 3,4 l 3,-4 l 4,4 l 3,-4" stroke="#9a9484" stroke-width="1.6" fill="none"/>
<path d="M -8,-156 l 6,10 M 0,-158 l 6,10 M 8,-156 l 5,9" stroke="#a31621" stroke-width="1.5" opacity="0.8"/>
${oeil(p, -8, -146, 2.6)}${oeil(p, 10, -145, 2.6)}
<path d="M 0,-112 q 2,9 0,16 M 6,-112 q 3,8 2,14" stroke="#a31621" stroke-width="1.6" opacity="0.7" fill="none"/>
</g>`;
}

// Gonflé : boursouflé de gaz, peau verdâtre tendue à craquer, cloques, fluides
function zGonfle(p) {
  return `<g transform="translate(400,310)">
<ellipse cx="0" cy="4" rx="96" ry="13" fill="#000" opacity="0.55"/>
<path d="M -34,-30 L -44,-4 L -26,-4 L -22,-26 Z" fill="#101411"/>
<path d="M 34,-30 L 46,-4 L 28,-4 L 22,-26 Z" fill="#101411"/>
<path d="M -44,-2 l -14,2 l 2,6 l 15,-1 Z M 44,-2 l 15,2 l -2,6 l -15,-1 Z" fill="#0b0d0b"/>
<ellipse cx="0" cy="-78" rx="68" ry="58" fill="url(#${p}-gaz)"/>
<path d="M -52,-104 q 50,-22 102,-2 M -58,-78 q 56,-16 116,0 M -50,-52 q 50,14 100,2" stroke="#10140f" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -30,-118 q 8,14 4,30 q -3,12 6,22 M 26,-120 q -6,16 2,30 q 6,10 2,20" stroke="#1b231a" stroke-width="2.6" fill="none"/>
<ellipse cx="-34" cy="-66" rx="7" ry="5" fill="#2a3326"/><circle cx="-36" cy="-68" r="1.6" fill="#3d4a36"/>
<ellipse cx="26" cy="-92" rx="8" ry="6" fill="#2a3326"/><circle cx="24" cy="-94" r="1.8" fill="#3d4a36"/>
<ellipse cx="6" cy="-48" rx="6" ry="4" fill="#2a3326"/>
<path d="M 40,-60 q 8,6 10,14" stroke="#0c100c" stroke-width="3" fill="none"/>
<path d="M 48,-48 q 3,14 0,30 M 52,-44 q 2,10 1,20" stroke="#11130c" stroke-width="2.6" opacity="0.85" fill="none"/>
<path d="M -56,-110 L -82,-92 L -88,-66" stroke="#141813" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -88,-66 l -7,7 M -88,-66 l 0,9 M -88,-66 l 6,7" stroke="#141813" stroke-width="2.4" stroke-linecap="round"/>
<path d="M 56,-110 L 80,-94 L 86,-68" stroke="#141813" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 86,-68 l 7,7 M 86,-68 l 0,9 M 86,-68 l -6,7" stroke="#141813" stroke-width="2.4" stroke-linecap="round"/>
<path d="M -12,-134 Q -14,-156 2,-160 Q 18,-156 14,-132 Q 6,-126 -4,-128 Z" fill="#141813"/>
<path d="M -6,-132 q 6,5 14,2" stroke="#0c100c" stroke-width="2" fill="none"/>
<path d="M 0,-130 q 2,8 0,14" stroke="#2a3326" stroke-width="2" opacity="0.8" fill="none"/>
${oeil(p, -5, -148, 1.9)}${oeil(p, 8, -147, 1.9)}
<path d="M -20,-138 q -6,-14 2,-26 q 6,-10 0,-20 M 24,-140 q 8,-14 2,-28" stroke="#4a5340" stroke-width="2" fill="none" opacity="0.22"/>
<ellipse cx="6" cy="0" rx="40" ry="6" fill="#11130c" opacity="0.8"/>
</g>`;
}

// Hurleur : torse arqué, gorge ouverte, tête renversée, bouche béante vers le ciel
function zHurleur(p) {
  const peau = '#15161c';
  return `<g transform="translate(400,312)">
<ellipse cx="0" cy="2" rx="80" ry="12" fill="#000" opacity="0.5"/>
<path d="M -20,-78 L -28,-40 L -24,-4 L -10,-4 L -12,-42 L -4,-74 Z" fill="#0e0f14"/>
<path d="M 18,-78 L 28,-42 L 26,-4 L 12,-4 L 12,-42 L 4,-74 Z" fill="#0e0f14"/>
<path d="M -26,-2 l -14,2 l 2,6 l 14,0 Z M 26,-2 l 14,2 l -2,6 l -14,0 Z" fill="#0a0a0e"/>
<path d="M -26,-82 Q -38,-118 -22,-148 L 24,-152 Q 38,-120 28,-80 L 14,-86 L 4,-76 L -10,-86 L -18,-76 Z" fill="#101117"/>
<path d="M -12,-128 q 14,6 26,2 M -13,-117 q 14,6 27,2 M -12,-106 q 13,6 25,2" stroke="#23242c" stroke-width="2.2" fill="none"/>
<path d="M -22,-142 L -54,-126 L -68,-96" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -68,-96 l -10,2 M -68,-96 l -7,8 M -68,-96 l 0,11" stroke="${peau}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M 26,-144 L 56,-130 L 68,-100" stroke="${peau}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 68,-100 l 10,2 M 68,-100 l 7,8 M 68,-100 l 0,11" stroke="${peau}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M -8,-148 L -10,-164 L 12,-168 L 12,-150 Z" fill="${peau}"/>
<path d="M -8,-156 Q 0,-148 12,-158 L 10,-166 Q 0,-158 -8,-164 Z" fill="#3d0d14"/>
<path d="M -7,-158 l 3,6 M 0,-160 l 2,7 M 7,-163 l 2,6" stroke="#a31621" stroke-width="1.6" opacity="0.9"/>
<path d="M -6,-154 q -2,8 -6,12 M 8,-156 q 2,9 -2,14" stroke="#2a0d12" stroke-width="2.4" fill="none"/>
<path d="M -14,-166 Q -18,-186 0,-190 Q 18,-186 14,-164 Q 10,-152 0,-150 Q -10,-152 -14,-166 Z" fill="${peau}"/>
<ellipse cx="0" cy="-182" rx="10" ry="7" fill="#08080c"/>
<path d="M -9,-184 l 3,3 l 3,-3 l 3,3 l 3,-3 l 3,3" stroke="#9a9484" stroke-width="1.4" fill="none"/>
<path d="M -8,-178 l 3,-3 l 3,3 l 3,-3 l 3,3" stroke="#9a9484" stroke-width="1.3" fill="none"/>
${oeil(p, -8, -168, 1.8)}${oeil(p, 9, -167, 1.8)}
<path d="M -14,-200 q 14,-10 30,-2 M -18,-212 q 18,-13 38,-3 M -22,-224 q 22,-16 46,-4" stroke="#3a4150" stroke-width="1.6" fill="none" opacity="0.3"/>
</g>`;
}

// Putréfié : chair noircie qui coule, flanc emporté sur les côtes, vermine
function zPutrefie(p) {
  const chair = '#14160f', goutte = '#181a10';
  let vers = '';
  for (let i = 0; i < 9; i++) {
    vers += `<circle cx="${14 + ((i * 13) % 26) - 8}" cy="${-104 + (i * 7) % 18}" r="1.1" fill="#b3ac96" opacity="0.5"/>`;
  }
  for (let i = 0; i < 6; i++) {
    vers += `<circle cx="${((i * 19) % 40) - 16}" cy="${-2 + (i * 5) % 6}" r="1" fill="#b3ac96" opacity="0.45"/>`;
  }
  return `<g transform="translate(400,314)">
<ellipse cx="0" cy="2" rx="84" ry="12" fill="#000" opacity="0.5"/>
<ellipse cx="2" cy="0" rx="56" ry="9" fill="#101207" opacity="0.9"/>
<ellipse cx="32" cy="2" rx="18" ry="5" fill="#0c0e06" opacity="0.9"/>
<path d="M -18,-76 Q -26,-40 -20,-4 L -4,-4 Q -8,-40 -2,-72 Z" fill="${chair}"/>
<path d="M 16,-74 Q 26,-42 24,-8 L 8,-6 Q 8,-40 2,-70 Z" fill="${chair}"/>
<path d="M -28,-80 Q -38,-112 -20,-142 L 22,-146 Q 38,-114 26,-78 Q 12,-70 -6,-74 Q -20,-72 -28,-80 Z" fill="${chair}"/>
<path d="M 16,-122 Q 32,-118 30,-98 Q 24,-88 12,-92 Z" fill="#0a0b07"/>
<path d="M 16,-118 q 10,2 12,10 M 14,-110 q 9,3 12,9 M 12,-102 q 8,3 11,8" stroke="#8f8876" stroke-width="1.8" fill="none" opacity="0.8"/>
<path d="M -24,-94 q 3,18 -2,34 q -2,8 2,8 q 5,-2 4,-12 q 2,-18 0,-30 Z" fill="${goutte}"/>
<path d="M 22,-78 q 4,16 0,30 q -1,7 3,6 q 4,-3 2,-14 q 1,-12 -1,-22 Z" fill="${goutte}"/>
<path d="M -2,-72 q 2,12 -1,22" stroke="${goutte}" stroke-width="4" fill="none"/>
<path d="M -24,-134 L -46,-108 L -44,-78" stroke="${chair}" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -44,-78 q 2,10 -2,18" stroke="${goutte}" stroke-width="5" fill="none"/>
<path d="M 24,-136 L 46,-114 L 56,-86" stroke="${chair}" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M 46,-112 L 54,-90" stroke="#8f8876" stroke-width="2.4"/>
<path d="M 56,-86 l 8,4 M 56,-86 l 4,9 M 56,-86 l -2,9" stroke="${chair}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M -10,-142 Q -16,-166 2,-170 Q 18,-166 14,-144 Q 14,-132 0,-130 Q -8,-132 -10,-142 Z" fill="${chair}"/>
<path d="M 6,-132 q 4,10 1,20 q -1,6 3,5 q 3,-3 1,-12 Z" fill="${goutte}"/>
<path d="M -6,-136 q 6,4 14,1" stroke="#0a0b07" stroke-width="2" fill="none"/>
${oeil(p, -5, -154, 2)}${oeil(p, 8, -153, 2)}
${vers}
</g>`;
}

// Chien infecté : berger allemand, museau fendu en deux, échine hérissée, côtes saillantes
function zChien(p) {
  const poil = '#101116';
  return `<g transform="translate(400,318) scale(1.35)">
<ellipse cx="0" cy="2" rx="74" ry="8" fill="#000" opacity="0.5"/>
<path d="M 18,-44 Q 56,-56 74,-40 Q 84,-26 76,-12 L 64,-4 L 60,-26 L 36,-30 Z" fill="${poil}"/>
<path d="M 76,-26 q 18,4 24,18" stroke="${poil}" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M 62,-16 L 58,-2 L 68,-2 L 70,-14 Z" fill="${poil}"/>
<path d="M 58,0 l -5,2 M 66,0 l -4,3" stroke="#8f8876" stroke-width="1.4"/>
<path d="M -38,-48 Q -10,-62 20,-48 Q 30,-38 24,-22 L 12,-6 L -28,-8 Q -42,-28 -38,-48 Z" fill="${poil}"/>
<path d="M -30,-52 l 5,-9 l 4,8 l 5,-9 l 4,8 l 5,-9 l 5,8 l 5,-8 l 4,8 l 6,-8 l 4,8" stroke="${poil}" stroke-width="3" fill="none"/>
<path d="M -2,-40 q 10,4 18,1 M -2,-32 q 10,4 17,1 M -2,-24 q 9,4 16,1" stroke="#1f2026" stroke-width="2" fill="none"/>
<path d="M -34,-30 q 6,4 4,12" stroke="#2a0d12" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M -28,-22 L -34,-2 L -24,-2 L -20,-20 Z" fill="${poil}"/>
<path d="M 4,-20 L 2,-2 L 12,-2 L 14,-18 Z" fill="${poil}"/>
<path d="M -34,-2 l -4,2 M -30,-2 l -2,3 M 2,-2 l -3,3 M 8,-2 l -2,3" stroke="#8f8876" stroke-width="1.5"/>
<path d="M -22,-58 L -14,-78 L -4,-62 Z" fill="${poil}"/>
<path d="M 8,-62 L 18,-80 L 24,-60 Z" fill="${poil}"/>
<path d="M -20,-62 Q -24,-44 -8,-36 Q 8,-32 18,-42 Q 24,-52 18,-62 Q 0,-72 -20,-62 Z" fill="${poil}"/>
<path d="M -12,-40 Q -16,-24 -4,-16 L 0,-22 Q -6,-30 -4,-40 Z" fill="${poil}"/>
<path d="M 10,-40 Q 16,-26 6,-15 L 1,-22 Q 7,-30 5,-40 Z" fill="${poil}"/>
<path d="M -4,-40 Q -2,-26 -1,-20 L 2,-20 Q 4,-28 5,-40 Z" fill="#3d0d14"/>
<path d="M -3,-36 l 2,3 M -2,-30 l 2,3 M -1,-24 l 2,3 M 4,-36 l -2,3 M 3,-30 l -2,3 M 2,-24 l -1,3" stroke="#9a9484" stroke-width="1.3"/>
<path d="M -14,-44 q -4,6 -10,6 M 12,-44 q 4,6 10,7" stroke="#3d0d14" stroke-width="2" fill="none" opacity="0.9"/>
<path d="M -2,-16 q 1,7 -1,12 M 4,-15 q 2,6 1,11" stroke="#2a0d12" stroke-width="1.8" fill="none" opacity="0.8"/>
${oeil(p, -13, -54, 2.2)}${oeil(p, 13, -53, 2.2)}
</g>`;
}

// Colosse : CRS de deux mètres, casque à visière fendue, plaques de kevlar, bouclier tombé
function zColosse(p) {
  const kev = '#0e0f15', plaq = '#151720';
  return `<g transform="translate(400,318)">
<ellipse cx="0" cy="2" rx="110" ry="14" fill="#000" opacity="0.55"/>
<g transform="translate(-104,-2) rotate(-14)"><rect x="-20" y="-66" width="44" height="66" rx="9" fill="#11131b"/><rect x="-13" y="-58" width="30" height="20" fill="#0a0b10"/><path d="M -16,-30 l 36,18" stroke="#1d2027" stroke-width="2"/></g>
<path d="M -34,-96 L -42,-48 L -38,-4 L -14,-4 L -18,-50 L -8,-92 Z" fill="${kev}"/>
<path d="M 32,-96 L 44,-50 L 42,-4 L 18,-4 L 18,-50 L 8,-92 Z" fill="${kev}"/>
<rect x="-40" y="-46" width="22" height="34" rx="5" fill="${plaq}"/>
<rect x="20" y="-46" width="22" height="34" rx="5" fill="${plaq}"/>
<path d="M -42,-2 l -18,2 l 2,8 l 22,0 Z M 42,-2 l 18,2 l -2,8 l -22,0 Z" fill="#08090d"/>
<path d="M -48,-100 Q -58,-150 -40,-186 L 42,-186 Q 60,-148 50,-98 L 30,-104 L 18,-94 L -2,-104 L -18,-94 L -34,-102 Z" fill="${kev}"/>
<rect x="-34" y="-176" width="66" height="26" rx="6" fill="${plaq}"/>
<rect x="-36" y="-146" width="70" height="22" rx="6" fill="${plaq}"/>
<rect x="-32" y="-120" width="62" height="18" rx="5" fill="${plaq}"/>
<rect x="-34" y="-160" width="66" height="6" fill="#3a4150"/>
<rect x="-38" y="-100" width="74" height="10" rx="3" fill="#090a0f"/>
<rect x="-10" y="-101" width="16" height="12" rx="2" fill="#1a1d26"/>
<path d="M -64,-180 Q -50,-194 -34,-188 L -36,-166 Q -56,-160 -66,-170 Z" fill="${plaq}"/>
<path d="M 62,-180 Q 48,-194 32,-188 L 34,-166 Q 54,-160 64,-170 Z" fill="${plaq}"/>
<path d="M -56,-168 L -66,-128 L -62,-84" stroke="${kev}" stroke-width="14" fill="none" stroke-linecap="round"/>
<rect x="-70" y="-86" width="8" height="46" rx="3" fill="#0a0b10" transform="rotate(12 -66 -84)"/>
<path d="M 56,-168 L 70,-130 L 66,-88" stroke="${kev}" stroke-width="14" fill="none" stroke-linecap="round"/>
<path d="M 62,-132 q 8,4 10,12" stroke="#17161c" stroke-width="6" fill="none"/>
<path d="M 64,-126 l 6,8 M 70,-120 l 4,7" stroke="#a31621" stroke-width="1.8" opacity="0.8"/>
<circle cx="66" cy="-84" r="7" fill="#17161c"/>
<path d="M -14,-186 L -12,-198 L 14,-198 L 14,-186 Z" fill="#17161c"/>
<path d="M -20,-200 Q -24,-232 2,-238 Q 26,-232 22,-198 Q 12,-192 -10,-192 Q -18,-194 -20,-200 Z" fill="${plaq}"/>
<rect x="-16" y="-226" width="36" height="16" rx="4" fill="#060608"/>
<path d="M -6,-226 l 8,16" stroke="#3a4150" stroke-width="1.4" opacity="0.8"/>
${oeil(p, -6, -218, 2)}${oeil(p, 10, -217, 2)}
<path d="M -10,-196 q 10,6 22,0" stroke="#0a0b10" stroke-width="3" fill="none"/>
<path d="M 2,-210 q 4,14 2,26" stroke="#5e1118" stroke-width="2.4" opacity="0.7" fill="none"/>
</g>`;
}

// Silhouette humanoïde générique (zid inconnu)
function zInconnu(p) {
  const peau = '#121318';
  return `<g transform="translate(400,314)">
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

const CREATURES = {
  errant: zErrant, rampant: zRampant, coureur: zCoureur, enrage: zEnrage, gonfle: zGonfle,
  hurleur: zHurleur, putrefie: zPutrefie, chien_infecte: zChien, colosse: zColosse, inconnu: zInconnu,
};

// ---------- Export ----------
export function svgCombat(zid) {
  const p = CREATURES[zid] ? zid : 'inconnu';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" width="100%">
${arene(p, ARENES[p])}
${CREATURES[p](p)}
<ellipse cx="400" cy="330" rx="430" ry="24" fill="#3a4150" opacity="0.08"/>
<rect width="${W}" height="${H}" fill="url(#${p}-vign)"/>
</svg>`;
}
