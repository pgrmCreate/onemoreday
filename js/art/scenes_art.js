// ============ Décors SVG d'ambiance — "One More Day" ============
// Hiver post-apocalyptique français. Palette sombre et désaturée :
// fonds #0d0d0f→#2d3242, silhouettes #060608→#16161d, accents rares
// (rouge sang #a31621/#d6303e, or pâle #c9a227, lune #cfc9b8).
// Chaque scène : 3 à 5 plans de profondeur, 1 à 2 sources de lumière.
// Tous les ids (gradients…) sont préfixés par le nom de la scène,
// car plusieurs SVG peuvent coexister dans le DOM.
// Fichier 100 % autonome — aucun import.

const W = 800, H = 340;
const R = n => Math.round(n * 10) / 10;

// Générateur pseudo-aléatoire déterministe (Lehmer) — motifs stables.
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = s * 48271 % 2147483647) / 2147483647;
}

// Nuage de points compacté en un seul <path> (M x y h.1 …).
function dots(pts, w, c, o) {
  if (!pts.length) return '';
  return `<path d="${pts.map(q => `M${q[0]} ${q[1]}h.1`).join('')}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}" fill="none"/>`;
}

// Fond de ciel (dégradé vertical plein cadre).
function fond(p, haut, bas) {
  return `<defs><linearGradient id="${p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/>
  </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${p}-ciel)"/>`;
}

// Halo lumineux radial (lune, bougie, phare, lampadaire…).
function halo(p, id, cx, cy, rx, ry, c, o) {
  return `<defs><radialGradient id="${p}-${id}">
    <stop offset="0" stop-color="${c}" stop-opacity="${o}"/>
    <stop offset="0.55" stop-color="${c}" stop-opacity="${R(o * 0.32)}"/>
    <stop offset="1" stop-color="${c}" stop-opacity="0"/>
  </radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${p}-${id})"/>`;
}

// Lune voilée : halo + disque + cratère + banc de nuage.
function lune(p, cx, cy, r, c = '#cfc9b8', hop = 0.4, voile = '#191c26') {
  return halo(p, 'lune', cx, cy, R(r * 3.1), R(r * 3.1), c, hop)
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.92"/>
    <circle cx="${R(cx - r * 0.3)}" cy="${R(cy - r * 0.18)}" r="${R(r * 0.17)}" fill="#9a958a" opacity="0.4"/>
    <path d="M${R(cx - r * 1.7)} ${R(cy - r * 0.2)}q${R(r * 1.7)} ${R(r * 0.6)} ${R(r * 3.4)} 0" stroke="${voile}" stroke-width="${R(r * 0.34)}" fill="none" opacity="0.6"/>`;
}

// Étoiles froides (deux tailles).
function etoiles(seed, n, ymax = 150, o = 0.5) {
  const r = rng(seed), a = [], b = [];
  for (let i = 0; i < n; i++) (i % 4 ? a : b).push([R(r() * W), R(r() * ymax)]);
  return dots(a, 1.1, '#aeb6c6', R(o * 0.7)) + dots(b, 1.7, '#cdd3df', o);
}

// Neige fine.
function neige(seed, n = 30, o = 0.4, x0 = 0, x1 = W, y0 = 0, y1 = 312) {
  const r = rng(seed), a = [], b = [];
  for (let i = 0; i < n; i++) (i % 3 ? a : b).push([R(x0 + r() * (x1 - x0)), R(y0 + r() * (y1 - y0))]);
  return dots(a, 1.4, '#c8cdd8', o) + dots(b, 2.2, '#c8cdd8', R(o * 0.65));
}

// Brume au sol : bande en dégradé + nappe.
function brume(p, y, t = '#3a4150', o = 0.16, idx = '') {
  return `<defs><linearGradient id="${p}-brume${idx}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${t}" stop-opacity="0"/><stop offset="0.5" stop-color="${t}" stop-opacity="${o}"/>
    <stop offset="1" stop-color="${t}" stop-opacity="0"/></linearGradient></defs>
  <rect x="0" y="${y}" width="${W}" height="72" fill="url(#${p}-brume${idx})"/>
  <ellipse cx="400" cy="${y + 50}" rx="350" ry="19" fill="${t}" opacity="${R(o * 0.48)}"/>`;
}

// Immeuble avec fenêtres (éteintes / cassées / rares fenêtres or).
function batisse(x, base, w, h, t, seed, pAllume = 0, casse = 0.14) {
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
function toits(seed, y, amp, t, o = 1) {
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
function clocher(x, y, h, t) {
  return `<path d="M${x} ${y}v${-h}l13 -24 13 24v${h}z" fill="${t}"/>
  <path d="M${x + 13} ${y - h - 24}v-11M${x + 8.5} ${y - h - 30}h9" stroke="${t}" stroke-width="2.4"/>`;
}

// Silhouette d'errant — pieds à y+48 (échelle s).
function zfig(x, y, s = 1, t = '#0b0c10', yeux = true, pench = 8) {
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${pench})" fill="${t}" stroke="${t}" stroke-linecap="round">
    <ellipse cx="3" cy="-57" rx="8" ry="9.5" stroke="none"/>
    <path d="M-10 -48Q-15 -20 -11 6L11 6Q16 -22 10 -48Q0 -54 -10 -48M-11 4l4 11 3-8 3 10 4-9 4 10 4-11z" stroke="none"/>
    <path d="M-9 -44q-11 9 -13 24l2 8M9 -44q10 7 12 21l4 9" stroke-width="5.5" fill="none"/>
    <path d="M-5 7l-3 41M6 7l5 41" stroke-width="7.5" fill="none"/>
    ${yeux ? `<path d="M1 -58h.1M7 -57h.1" stroke="#d6303e" stroke-width="3" opacity="0.85" fill="none"/>` : ''}
  </g>`;
}

// Errant lointain (forme simplifiée) — pieds à y.
function zloin(x, y, s = 1, t = '#0b0c10', o = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${t}" opacity="${o}">
    <circle cx="1" cy="-31" r="4.6"/>
    <path d="M-5 -27q-3 13 -2 27h4l2-11 2 11h4q2-14 -2-27q-4 3 -8 0z"/>
  </g>`;
}

// Horde diffuse (bâtonnets + têtes), pour les arrière-plans.
function horde(seed, n, x0, x1, y, sMin, sMax, t = '#0a0c12', o = 0.8) {
  const r = rng(seed), corps = [], tetes = [];
  const sm = (sMin + sMax) / 2;
  for (let i = 0; i < n; i++) {
    const x = R(x0 + r() * (x1 - x0)), s = sMin + r() * (sMax - sMin);
    const yy = R(y + r() * 7 * s);
    corps.push(`M${x} ${yy}v${R(-15 * s)}`);
    tetes.push([R(x + (r() - 0.5) * 3), R(yy - 19 * s)]);
  }
  return `<path d="${corps.join('')}" stroke="${t}" stroke-width="${R(8 * sm)}" stroke-linecap="round" opacity="${o}" fill="none"/>`
    + dots(tetes, R(6.5 * sm), t, o);
}

// Corbeaux en vol (petits "m").
function corbeauVol(seed, n, x0, x1, y0, y1) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = R(x0 + r() * (x1 - x0)), y = R(y0 + r() * (y1 - y0)), k = R(2.4 + r() * 3);
    s += `<path d="M${x} ${y}q${k} ${-k} ${k * 2} 0q${k} ${-k} ${k * 2} 0" stroke="#06070a" stroke-width="1.6" fill="none"/>`;
  }
  return s;
}

// Corbeau perché (silhouette).
function corbeau(x, y, s = 1, t = '#06070a') {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${t}">
    <ellipse cx="0" cy="-5" rx="7" ry="4.5" transform="rotate(-12)"/>
    <circle cx="6" cy="-10" r="3"/><path d="M8.5 -10.5l5 1.5-5 1.5z"/>
    <path d="M-6 -4l-7 3" stroke="${t}" stroke-width="2.5"/>
    <path d="M-1 0v3M3 0v3" stroke="${t}" stroke-width="1.2"/>
  </g>`;
}

// Arbre nu d'hiver.
function arbreNu(x, ysol, h, t = '#07080a', lean = 0) {
  return `<g transform="translate(${x},${ysol}) rotate(${lean})" stroke="${t}" fill="none" stroke-linecap="round">
    <path d="M0 0C-3 ${R(-h * 0.4)} 3 ${R(-h * 0.55)} 0 ${-h}" stroke-width="7"/>
    <path d="M-1 ${R(-h * 0.42)}q-14 -10 -21 -27m21 27q-19 -3 -30 -1" stroke-width="3.4"/>
    <path d="M1 ${R(-h * 0.58)}q14 -8 18 -26m-18 26q17 -1 29 -11" stroke-width="3.4"/>
    <path d="M0 ${R(-h * 0.8)}q-10 -12 -8 -25m8 25q9 -10 16 -18" stroke-width="2.4"/>
    <path d="M0 ${-h}q-6 -8 -4 -17m4 17q6 -6 10 -14" stroke-width="1.7"/>
  </g>`;
}

// Touffes d'herbes hautes.
function herbes(seed, x0, x1, y, n, hMax, t = '#0b0e0c', o = 1) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = R(x0 + r() * (x1 - x0)), h = R(hMax * (0.45 + r() * 0.55)), k = R((r() - 0.5) * 11);
    d += `M${x} ${R(y + r() * 5)}q${k} ${R(-h * 0.6)} ${R(k * 1.8)} ${-h}`;
  }
  return `<path d="${d}" stroke="${t}" stroke-width="1.7" fill="none" opacity="${o}"/>`;
}

// Lampadaire (mort, ou allumé : rare lumière or).
function lampadaire(p, i, x, ysol, h = 88, allume = false, flip = 1) {
  const yt = ysol - h, lx = x + 19 * flip;
  let s = `<path d="M${x} ${ysol}V${yt + 10}q0 -10 ${10 * flip} -10h${9 * flip}" stroke="#0a0b0f" stroke-width="4.5" fill="none"/>
  <rect x="${flip > 0 ? x + 12 : x - 26}" y="${yt - 6}" width="14" height="7" rx="2" fill="#0a0b0f"/>`;
  if (allume) s = halo(p, 'lamp' + i, lx, yt + 6, 54, 46, '#c9a227', 0.26) + s
    + `<ellipse cx="${lx}" cy="${yt + 2}" rx="4" ry="2.5" fill="#c9a227" opacity="0.8"/>`;
  return s;
}

// Voiture abandonnée (option : portière ouverte).
function voiture(x, y, s = 1, t = '#0c0d12', porte = false) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-46 0q2 -12 14 -14l8 -12q22 -8 44 0l8 12q14 2 16 14l-2 8h-86z" fill="${t}"/>
    <path d="M-21 -24l-5 9h17l2-9zM1 -24l-2 9h19l-6-9z" fill="#05060a"/>
    <circle cx="-26" cy="8" r="9" fill="#060608"/><circle cx="26" cy="8" r="9" fill="#060608"/>
    ${porte ? `<path d="M14 -14l15 -17 4 3-12 16z" fill="${t}"/>` : ''}
  </g>`;
}

// Poussette renversée (silhouette, à distance).
function poussette(x, y, s = 1, t = '#0a0b0f') {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${t}">
    <path d="M0 0q-3 -16 11 -21l11 2-2 19z"/>
    <path d="M21 -1l16 -14 3 3-15 14z"/>
    <circle cx="38" cy="-17" r="5" fill="none" stroke="${t}" stroke-width="2.2"/>
    <circle cx="27" cy="-25" r="4" fill="none" stroke="${t}" stroke-width="2.2"/>
  </g>`;
}

// Valise abandonnée (option : éventrée).
function valise(x, y, s = 1, t = '#0c0d12', ouverte = false) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-14" y="-10" width="28" height="17" rx="2" fill="${t}"/>
    <path d="M-5 -10v-4h10v4" stroke="${t}" stroke-width="2" fill="none"/>
    ${ouverte ? `<path d="M-14 -10l5 -12h23v4l-21 2-3 6z" fill="${t}"/>
    <path d="M-8 -6h6M2 -4h7M-4 0h9" stroke="#23242c" stroke-width="2.4"/>` : ''}
  </g>`;
}

// Chien errant décharné.
function chien(x, y, s = 1, t = '#0a0b0e') {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-24 -14q14 -8 33 -5l11 -10 9 2-7 9 1 5-11 4q-19 4 -36 -5z" fill="${t}"/>
    <path d="M-22 -12l-3 13M-14 -10l-2 11M8 -9l3 11M16 -10l4 12" stroke="${t}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M-24 -14l-9 5" stroke="${t}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="16" cy="-25" r="1.3" fill="#d6303e" opacity="0.85"/>
  </g>`;
}

// Flaque de sang séché.
function flaque(x, y, rx, o = 0.55) {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${R(rx * 0.17)}" fill="#2a0d12" opacity="${o}"/>
  <ellipse cx="${R(x - rx * 0.2)}" cy="${y}" rx="${R(rx * 0.5)}" ry="${R(rx * 0.09)}" fill="#a31621" opacity="${R(o * 0.4)}"/>`;
}

// Traînée de sang.
function sang(x, y, l, o = 0.4) {
  return `<path d="M${x} ${y}q${R(l * 0.4)} -3 ${l} 0l${R(-l * 0.16)} 4q${R(-l * 0.5)} 3 ${R(-l * 0.76)} 0z" fill="#a31621" opacity="${o}"/>`;
}

// Cadre final : viewBox + vignettage linéaire et radial.
// Le balisage est minifié (espaces et retours superflus) : budget < 8 Ko/scène.
function cadre(p, contenu) {
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img">${contenu}
  <defs><linearGradient id="${p}-vig" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="0.22" stop-color="#000" stop-opacity="0"/>
    <stop offset="0.78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/>
  </linearGradient><radialGradient id="${p}-vigr" cx="0.5" cy="0.5" r="0.74">
    <stop offset="0.62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.42"/>
  </radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${p}-vig)"/><rect width="${W}" height="${H}" fill="url(#${p}-vigr)"/>
</svg>`.replace(/\s+/g, ' ').replace(/> </g, '><');
}

// ===================== LES SCÈNES =====================

const SCENES_SVG = {

  // ----- TITRE : skyline de Mortagne sous lune rouge, fumées, errants -----
  titre: () => {
    const p = 'titre';
    const fumees = [[120, 130, 9], [398, 168, 12], [665, 112, 8]].map(([fx, fh, fw]) =>
      `<path d="M${fx} 212q-6 ${R(-fh * 0.33)} 2 ${R(-fh * 0.62)}q-5 ${R(-fh * 0.22)} 3 ${-fh}" stroke="#0c0e13" stroke-width="${fw}" fill="none" opacity="0.75" stroke-linecap="round"/>`).join('');
    return cadre(p, fond(p, '#261419', '#0d0d0f')
      + etoiles(31, 24, 140)
      + halo(p, 'lr', 580, 76, 128, 128, '#a31621', 0.34)
      + `<circle cx="580" cy="76" r="34" fill="#cfc9b8" opacity="0.9"/><circle cx="580" cy="76" r="34" fill="#a31621" opacity="0.42"/>
      <circle cx="570" cy="70" r="6" fill="#7e1119" opacity="0.35"/><circle cx="590" cy="86" r="4" fill="#7e1119" opacity="0.3"/>
      <path d="M524 70q56 22 112 0" stroke="#1c1014" stroke-width="11" fill="none" opacity="0.55"/>
      <path d="M538 92q42 14 86 0" stroke="#1c1014" stroke-width="7" fill="none" opacity="0.4"/>`
      + corbeauVol(9, 4, 420, 700, 36, 118)
      + toits(5, 212, 46, '#101219')
      + clocher(206, 212, 64, '#101219')
      + `<path d="M706 212l4 -40h14l4 40z" fill="#101219"/><rect x="698" y="158" width="30" height="16" rx="7" fill="#101219"/>`
      + fumees
      + brume(p, 196)
      + batisse(18, 292, 122, 178, '#0a0a0e', 11, 0.05)
      + batisse(150, 292, 88, 128, '#090a0d', 12, 0)
      + batisse(556, 292, 110, 198, '#0a0a0e', 13, 0.06)
      + batisse(676, 292, 104, 144, '#090a0d', 14, 0)
      + lampadaire(p, 2, 522, 292, 80, true, -1)
      + `<rect y="292" width="${W}" height="48" fill="#070709"/>
      <path d="M250 316h310" stroke="#121319" stroke-width="2" opacity="0.7"/>`
      + zfig(252, 264, 1, '#0c0e10', true, 10)
      + zfig(540, 266, 0.92, '#0c0e10', true, 14) + zloin(360, 300, 0.9, '#0a0b0f', 0.9)
      + valise(600, 314, 1, '#0b0c10', true)
      + flaque(330, 320, 42) + sang(346, 312, 64, 0.35)
      + neige(21, 24, 0.35));
  },

  // ----- APPARTEMENT : intérieur barricadé, bougie, fenêtre sur la ville -----
  appartement: () => {
    const p = 'appartement';
    // vue de nuit dans l'encadrement de la fenêtre
    const sky = [[78, 162, 38], [116, 130, 34], [150, 148, 52], [202, 120, 40], [242, 152, 44], [286, 136, 38]]
      .map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${238 - y}" fill="#0b0d13"/>`).join('');
    const planches = [[58, 98, -7], [50, 152, 5], [58, 210, -4]].map(([x, y, a], i) =>
      `<g transform="rotate(${a} ${x + 140} ${y})"><rect x="${x}" y="${y - 9}" width="288" height="17" fill="#191510"/>
      <path d="M${x + 14} ${y}h.1M${x + 272} ${y}h.1" stroke="#06070a" stroke-width="3.2" stroke-linecap="round"/></g>`).join('');
    // 23 jours gravés sur le mur (4 groupes de 5 + 3)
    let tally = '';
    for (let g = 0; g < 4; g++) {
      const tx = 392 + g * 27;
      tally += `<path d="${[0, 1, 2, 3].map(i => `M${tx + i * 5} 96v14`).join('')}" stroke="#2c2e38" stroke-width="1.8"/>
      <path d="M${tx - 2} 110l21 -12" stroke="#2c2e38" stroke-width="1.8"/>`;
    }
    tally += `<path d="M500 96v14M505 96v14M510 96v14" stroke="#2c2e38" stroke-width="1.8"/>`;
    return cadre(p, fond(p, '#191a21', '#0e0e12')
      + `<rect x="62" y="40" width="274" height="210" fill="#0b0c10"/>
      <defs><linearGradient id="${p}-vue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232838"/><stop offset="1" stop-color="#10121a"/></linearGradient></defs>
      <rect x="74" y="52" width="250" height="186" fill="url(#${p}-vue)"/>`
      + halo(p, 'lh', 288, 84, 46, 46, '#cfc9b8', 0.3)
      + `<circle cx="288" cy="84" r="15" fill="#cfc9b8" opacity="0.75"/>` + sky
      + `<path d="M128 150v6M298 168v6M226 142v6" stroke="#c9a227" stroke-width="4" opacity="0.5"/>`
      + neige(43, 22, 0.4, 78, 320, 56, 232)
      + `<path d="M197 52v186M74 142h250" stroke="#0b0c10" stroke-width="9"/>` + planches
      + `<path d="M330 52q14 60 2 186l-26 0q16 -110 4 -186z" fill="#121317" opacity="0.85"/>`
      + halo(p, 'froid', 200, 268, 150, 24, '#3a4150', 0.18)
      + tally
      + `<rect x="434" y="128" width="26" height="32" fill="#0d0e12" stroke="#23242c" stroke-width="2"/>
      <path d="M441 152q3 -10 6 0M449 152q3 -8 5 0" stroke="#2c2e38" stroke-width="2" fill="none"/>`
      + halo(p, 'bougie', 560, 192, 130, 104, '#c9a227', 0.34)
      + `<rect x="492" y="216" width="150" height="9" fill="#101116"/>
      <path d="M500 225l-7 60M634 225l7 60M566 225v55" stroke="#101116" stroke-width="5"/>
      <rect x="553" y="195" width="13" height="22" rx="3" fill="#3a3324"/>
      <path d="M551 198q-3 8 2 12M568 200q4 7 -1 11" stroke="#3a3324" stroke-width="2.4" fill="none"/>
      <ellipse cx="559" cy="187" rx="3.4" ry="7" fill="#e8c25a"/><ellipse cx="559" cy="189" rx="1.6" ry="3.4" fill="#fbe9b0"/>
      <rect x="586" y="199" width="42" height="17" rx="3" fill="#15161c"/><circle cx="596" cy="207" r="4.2" fill="#0c0d11"/>
      <path d="M620 199l9 -15" stroke="#15161c" stroke-width="2"/><circle cx="623" cy="206" r="1.4" fill="#a31621" opacity="0.9"/>`
      + `<rect x="700" y="84" width="88" height="186" fill="#121318"/><rect x="708" y="92" width="72" height="170" fill="#0e0f14"/>
      <circle cx="715" cy="180" r="3" fill="#23242c"/>
      <rect x="652" y="222" width="140" height="36" rx="8" fill="#1a1b22"/>
      <rect x="644" y="202" width="20" height="58" rx="6" fill="#1d1e26"/>
      <rect x="662" y="208" width="124" height="20" rx="7" fill="#22232c"/>`
      + `<rect y="254" width="${W}" height="86" fill="#0b0b0e"/>
      <path d="M0 272h800M0 296h800M0 322h800" stroke="#101116" stroke-width="1.5" opacity="0.7"/>
      <path d="M150 254v86M420 254v86M650 254v86" stroke="#0e0e12" stroke-width="2" opacity="0.6"/>`
      + `<g fill="#14151b"><rect x="378" y="282" width="7" height="20" rx="2"/><rect x="390" y="286" width="7" height="16" rx="2"/>
      <rect x="362" y="292" width="20" height="7" rx="3" transform="rotate(9 372 295)"/></g>
      <path d="M210 300q30 -12 64 -2q-26 16 -64 2z" fill="#16171d"/>`);
  },

  // ----- IMMEUBLE : cage d'escalier oppressante, traces brunes -----
  immeuble: () => {
    const p = 'immeuble';
    let esc = `M118 ${H}V314`;
    for (let i = 0; i < 10; i++) esc += `V${314 - (i + 1) * 15}H${118 + (i + 1) * 33}`;
    esc += `V${H}Z`;
    const balustres = [];
    for (let i = 0; i < 10; i++) balustres.push(`M${R(140 + i * 33)} ${R(304 - i * 15)}v-34`);
    return cadre(p, fond(p, '#121318', '#0a0a0d')
      + `<rect width="${W}" height="${H}" fill="#101116"/>
      <path d="M520 0q60 30 30 90q-40 10 -36 -30q4 -44 6 -60z" fill="#0c0d11" opacity="0.8"/>
      <path d="M60 180q26 18 4 60q-30 -4 -22 -36q6 -22 18 -24z" fill="#0c0d11" opacity="0.7"/>`
      // lucarne haute + rai de lumière froide (seule lumière)
      + `<rect x="650" y="20" width="60" height="76" fill="#222a38"/>
      <path d="M650 20l60 76M710 20l-60 76M680 20v76M650 58h60" stroke="#0b0c10" stroke-width="4"/>`
      + `<defs><linearGradient id="${p}-rai" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a4150" stop-opacity="0.22"/><stop offset="1" stop-color="#3a4150" stop-opacity="0"/></linearGradient></defs>
      <path d="M650 22L712 96L460 250L330 220Z" fill="url(#${p}-rai)"/>`
      // ampoule morte
      + `<path d="M320 0v58" stroke="#0a0a0d" stroke-width="2"/><path d="M316 58h8l-1 6h-6z" fill="#0a0a0d"/>
      <circle cx="320" cy="70" r="7" fill="#131318" stroke="#1d1e24" stroke-width="1.5"/>`
      // palier + porte de M. Keller entrouverte sur du noir
      + `<rect x="451" y="162" width="260" height="10" fill="#0d0e12"/>
      <rect x="500" y="50" width="64" height="112" fill="#060608"/>
      <g transform="rotate(-16 564 162)"><rect x="504" y="50" width="60" height="112" fill="#15161c"/>
      <circle cx="512" cy="112" r="2.6" fill="#23242c"/></g>
      <path d="M500 162h64" stroke="#0a0a0d" stroke-width="4"/>
      <path d="M608 100h56v62h-56z" fill="#101116"/><path d="M608 100l56 62M636 100v62" stroke="#0a0a0d" stroke-width="2"/>`
      // escalier + rampe
      + `<path d="${esc}" fill="#15161c"/>
      <path d="${Array.from({ length: 10 }, (_, i) => `M${118 + i * 33} ${299 - i * 15}h33`).join('')}" stroke="#0b0c10" stroke-width="2.5"/>
      <path d="${balustres.join('')}" stroke="#0c0d12" stroke-width="3"/>
      <path d="M132 272L470 118" stroke="#0c0d12" stroke-width="6"/>`
      // traces brunes qui descendent les marches
      + `<path d="M420 150q-50 36 -98 78q-40 36 -90 70" stroke="#3a1015" stroke-width="11" fill="none" opacity="0.5"/>
      <path d="M330 222q4 10 2 20M250 286q3 9 2 18" stroke="#3a1015" stroke-width="4" opacity="0.5" fill="none"/>
      <ellipse cx="585" cy="168" rx="26" ry="5" fill="#3a1015" opacity="0.55"/>`
      // empreinte de main sur le mur
      + `<g fill="#3a1015" opacity="0.6"><ellipse cx="210" cy="150" rx="8" ry="11"/>
      <path d="M204 141l-3 -9M210 139l0 -10M216 141l3 -9M220 146l6 -6" stroke="#3a1015" stroke-width="3.4" stroke-linecap="round"/></g>`
      // graffiti
      + `<text x="150" y="98" font-family="'Courier New',monospace" font-size="25" letter-spacing="3" fill="#7e1119" opacity="0.85" transform="rotate(-4 150 98)">ILS ENTENDENT</text>
      <path d="M163 104q4 14 2 24M262 102q3 10 2 18" stroke="#7e1119" stroke-width="2.4" opacity="0.6" fill="none"/>`
      // boîtes aux lettres forcées
      + `<g fill="#15161c"><rect x="16" y="226" width="88" height="66"/></g>
      <path d="M16 248h88M16 270h88M45 226v66M75 226v66" stroke="#0b0c10" stroke-width="2.4"/>
      <path d="M20 232l20 12M50 254l18 10" stroke="#0b0c10" stroke-width="3"/>
      <rect x="78" y="252" width="22" height="14" fill="#060608"/>`
      + `<rect y="314" width="${W}" height="26" fill="#08080a"/>
      <path d="M620 322q14 -5 22 0l-4 4q-8 -3 -14 0z" fill="#0c0d11"/><path d="M642 322l10 2" stroke="#0c0d11" stroke-width="2"/>`);
  },

  // ----- RUE : rue résidentielle jonchée, voitures, poussette au loin -----
  rue: () => {
    const p = 'rue';
    return cadre(p, fond(p, '#252a36', '#11131a')
      + etoiles(17, 14, 120) + lune(p, 138, 66, 24)
      + `<path d="M0 96q210 28 430 12" stroke="#0a0b0f" stroke-width="2" fill="none" opacity="0.8"/>`
      + corbeau(210, 106, 0.8)
      + toits(8, 212, 44, '#0d0f15')
      + batisse(0, 286, 138, 168, '#0b0c11', 21, 0.04) + batisse(620, 286, 110, 148, '#0b0c11', 22, 0.05)
      + arbreNu(225, 286, 96, '#08090c', -3)
      + brume(p, 212)
      + lampadaire(p, 2, 556, 288, 88, true, -1)
      + `<rect y="282" width="${W}" height="10" fill="#0d0e13"/><rect y="290" width="${W}" height="50" fill="#0a0a0d"/>
      <path d="${[60, 190, 330, 470, 610, 730].map(x => `M${x} 318h44`).join('')}" stroke="#181a22" stroke-width="3" opacity="0.55"/>`
      + poussette(492, 280, 0.82, '#0a0b0f')
      + voiture(345, 296, 1, '#0c0d12', true) + voiture(486, 288, 0.74, '#0b0c10')
      + valise(282, 312, 1, '#0c0d12', true)
      + dots([[300, 310], [316, 314], [296, 318], [420, 312], [434, 308]], 1.6, '#9aa4b8', 0.45)
      + zfig(168, 262, 0.95, '#0b0c0f', true, 12) + zfig(606, 266, 0.8, '#0b0c0f', true, -10)
      + zloin(440, 296, 0.95, '#0a0b0f', 0.9)
      + sang(96, 312, 62, 0.35)
      + neige(33, 24, 0.4)
      + `<path d="M0 340v-44q64 -12 152 -4l28 48z" fill="#060709"/>`);
  },

  // ----- MAGASIN : supérette saccagée, rayonnages, vitrine étoilée -----
  magasin: () => {
    const p = 'magasin';
    const r = rng(77);
    // gondole de rayonnages
    const gondole = (x, rot) => {
      let art = '';
      for (let i = 0; i < 7; i++) {
        const ax = R(x + 10 + r() * 124), ay = [166, 204, 242][Math.floor(r() * 3)] - 8;
        art += `<rect x="${ax}" y="${ay}" width="${R(7 + r() * 8)}" height="8" fill="#1c1e26"/>`;
      }
      return `<g transform="rotate(${rot} ${x + 75} 290)"><rect x="${x}" y="148" width="150" height="142" fill="#0c0d12"/>
      <path d="M${x} 166h150M${x} 204h150M${x} 242h150" stroke="#070809" stroke-width="5"/>${art}</g>`;
    };
    return cadre(p, fond(p, '#101117', '#0a0b0e')
      // vitrine sur la rue (lueur froide) + silhouette dehors
      + `<defs><linearGradient id="${p}-rue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262c3a"/><stop offset="1" stop-color="#141821"/></linearGradient></defs>
      <rect x="70" y="50" width="660" height="150" fill="url(#${p}-rue)" opacity="0.9"/>`
      + toits(55, 160, 30, '#0d0f15', 0.9)
      + zloin(300, 196, 1.05, '#0b0d13', 0.65)
      + `<path d="M70 50h660M70 200h660M250 50v150M430 50v150M610 50v150" stroke="#0b0c10" stroke-width="8"/>`
      // impacts étoilés
      + `<g stroke="#8e98a8" opacity="0.5" fill="none">
      <path d="M331 112l-26 -20M331 112l30 -26M331 112l-20 30M331 112l34 18M331 112l6 -36M331 112l-36 -2"/>
      <circle cx="331" cy="112" r="5"/><path d="M520 150l-22 -16M520 150l26 -20M520 150l-14 26M520 150l30 12"/></g>
      <path d="M514 144l12 12-6 6-12-10z" fill="#06070a"/>`
      // enseigne
      + `<rect x="280" y="22" width="240" height="26" rx="4" fill="#0c0d12"/>
      <text x="400" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" letter-spacing="5" fill="#6b6f7c" opacity="0.5">CHEZ NADIA</text>`
      // néon : un seul tube survivant
      + `<path d="M150 14v14M650 14v14" stroke="#0b0c10" stroke-width="2"/>
      <rect x="110" y="28" width="80" height="6" rx="3" fill="#15171d"/>
      <rect x="610" y="28" width="80" height="6" rx="3" fill="#9aa4b8" opacity="0.5"/>`
      + halo(p, 'neon', 650, 36, 110, 70, '#aab4c8', 0.2)
      // rayonnages (un renversé)
      + gondole(110, 0) + gondole(330, -9) + gondole(556, 0)
      // sol carrelé
      + `<rect y="290" width="${W}" height="50" fill="#0d0d11"/>
      <path d="M0 304h800M0 322h800" stroke="#121318" stroke-width="1.6" opacity="0.8"/>
      <path d="M130 290l-34 50M310 290l-14 50M490 290l14 50M670 290l34 50" stroke="#121318" stroke-width="1.6" opacity="0.6"/>`
      // congélateur qui suinte
      + `<rect x="600" y="216" width="146" height="76" fill="#101218"/>
      <path d="M600 232h146" stroke="#090a0e" stroke-width="3"/><rect x="614" y="206" width="50" height="14" fill="#0c0e13"/>
      <path d="M620 292q44 10 96 4l14 26q-72 10 -124 -8z" fill="#070809" opacity="0.85"/>
      <path d="M648 296q3 12 1 22M700 298q3 10 2 18" stroke="#070809" stroke-width="4" fill="none"/>`
      // caddie couché + boîtes éparses
      + `<g transform="translate(218,306) rotate(-78)" stroke="#1a1c24" fill="none" stroke-width="2.4">
      <path d="M0 0l34 0 8 -24 -44 0z"/><path d="M8 -6h28M4 -12h30M10 -18h26"/>
      <circle cx="6" cy="6" r="4"/><circle cx="30" cy="6" r="4"/><path d="M42 -24l10 -8" stroke-width="3"/></g>`
      + dots([[150, 312], [186, 320], [292, 316], [350, 308], [395, 322], [470, 314], [520, 320]], 5, '#1c1e26', 0.9)
      + dots([[168, 318], [318, 312], [438, 320]], 4, '#23242c', 0.8)
      + sang(330, 296, 90, 0.3)
      + `<path d="M0 340v-30q40 -8 92 -4l20 34z" fill="#060709"/>`);
  },

  // ----- PHARMACIE : croix verte brisée, comprimés au sol -----
  pharmacie: () => {
    const p = 'pharmacie';
    const r = rng(99);
    const pilules = [], pilR = [];
    for (let i = 0; i < 22; i++) (i % 6 ? pilules : pilR).push([R(180 + r() * 380), R(296 + r() * 34)]);
    const grille = [];
    for (let i = 0; i < 9; i++) grille.push(`M${566 + i * 19} 122V290`);
    return cadre(p, fond(p, '#10131a', '#0a0c10')
      // rai de lune par la vitrine crevée (lumière 1)
      + `<rect x="36" y="46" width="200" height="180" fill="#1c2230"/>
      <path d="M36 46h200M36 226h200M136 46v180M36 136h200" stroke="#0b0c10" stroke-width="7"/>
      <path d="M62 70l40 30-18 24-30 -22z" fill="#060709"/>
      <path d="M102 100l28 -22M84 124l-30 -10M44 92l18 -20" stroke="#8e98a8" stroke-width="1.4" opacity="0.5"/>`
      + `<defs><linearGradient id="${p}-rai" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#3a4150" stop-opacity="0.2"/><stop offset="1" stop-color="#3a4150" stop-opacity="0"/></linearGradient></defs>
      <path d="M60 70L140 120L360 330L150 330Z" fill="url(#${p}-rai)"/>`
      // croix verte pendante, à demi arrachée (lumière 2, blafarde)
      + halo(p, 'croix', 360, 96, 120, 86, '#2f6a42', 0.16)
      + `<path d="M306 30l10 18" stroke="#1a1c22" stroke-width="3"/>
      <g transform="rotate(-14 360 96)"><path d="M340 66h40v18h18v40h-18v18h-40v-18h-18v-40h18z" fill="#10231a"/>
      <path d="M340 66h40v18h18v40h-18v18h-40v-18h-18v-40h18z" fill="none" stroke="#2f6a42" stroke-width="2.4" opacity="0.8"/>
      ${dots([[348, 92], [364, 84], [372, 104], [356, 112], [342, 104]], 2.6, '#2f6a42', 0.7)}</g>`
      + `<g transform="rotate(26 480 318)"><rect x="462" y="312" width="40" height="13" fill="#10231a" stroke="#1d3a26" stroke-width="2"/></g>`
      // comptoir et caisses
      + `<rect x="320" y="218" width="220" height="74" fill="#11131a"/>
      <path d="M320 218h220" stroke="#1a1c24" stroke-width="5"/>
      <rect x="354" y="200" width="30" height="18" fill="#0c0e13"/><rect x="470" y="226" width="44" height="8" fill="#0c0e13" transform="rotate(14 492 230)"/>`
      // affiches de travers
      + `<rect x="262" y="120" width="40" height="52" fill="none" stroke="#23242c" stroke-width="2" transform="rotate(6 282 146)" opacity="0.7"/>
      <rect x="450" y="110" width="44" height="58" fill="none" stroke="#23242c" stroke-width="2" transform="rotate(-7 472 139)" opacity="0.6"/>
      <path d="M268 138q12 6 26 2M458 132q14 6 28 0" stroke="#23242c" stroke-width="1.6" opacity="0.5" fill="none"/>`
      // arrière-boutique grillagée, barreaux tordus, noir derrière
      + `<rect x="560" y="118" width="180" height="176" fill="#060709"/>
      <path d="${grille.join('')}" stroke="#1a1c22" stroke-width="3.4" fill="none"/>
      <path d="M566 150h170M566 196h170M566 244h170" stroke="#1a1c22" stroke-width="2.4"/>
      <path d="M642 188q-14 18 2 40q16 16 4 32" stroke="#060709" stroke-width="14" fill="none"/>
      <path d="M642 188q-14 18 2 40" stroke="#23242c" stroke-width="3" fill="none"/>`
      // présentoirs renversés + boîtes
      + `<g transform="rotate(74 220 296)"><rect x="186" y="262" width="34" height="98" fill="#0c0d12"/>
      <path d="M186 288h34M186 318h34" stroke="#070809" stroke-width="4"/></g>
      <rect x="252" y="306" width="16" height="9" fill="#2c2230"/><rect x="282" y="318" width="14" height="8" fill="#23242c"/>
      <rect x="430" y="312" width="16" height="9" fill="#23242c" transform="rotate(20 438 316)"/><rect x="498" y="320" width="15" height="8" fill="#2c2230"/>`
      // sol + comprimés écrasés + traînée vers la grille
      + `<rect y="292" width="${W}" height="48" fill="#0c0c10"/>
      <path d="M0 310h800M0 328h800" stroke="#111218" stroke-width="1.5" opacity="0.7"/>`
      + dots(pilules, 2.4, '#cfd2da', 0.5) + dots(pilR, 2.4, '#a31621', 0.45)
      + `<path d="M380 300q120 6 230 -6l24 8q-130 16 -252 6z" fill="#2a0d12" opacity="0.5"/>
      <path d="M598 296q14 -3 24 0" stroke="#2a0d12" stroke-width="7" opacity="0.55" fill="none"/>`);
  },

  // ----- PLACE : étals de marché, fontaine, plusieurs errants -----
  place: () => {
    const p = 'place';
    // étal de marché : bâche déchirée + caisses
    const etal = (x, hh, seed) => {
      const rr = rng(seed);
      let dech = `M${x} ${hh}l`;
      for (let i = 0; i < 6; i++) dech += `${R(8 + rr() * 12)} ${R(6 - rr() * 12)}l`;
      dech = dech.slice(0, -1);
      return `<path d="M${x - 6} ${hh + 6}l14 -26h104l14 26z" fill="#10121a"/>
      <path d="${dech}" stroke="#10121a" stroke-width="5" fill="none"/>
      <path d="M${x + 4} ${hh + 4}v54M${x + 116} ${hh + 4}v54" stroke="#0b0c11" stroke-width="4"/>
      <rect x="${x + 14}" y="${hh + 34}" width="26" height="16" fill="#0d0e14"/>
      <rect x="${x + 44}" y="${hh + 40}" width="22" height="12" fill="#0c0d12"/>`;
    };
    return cadre(p, fond(p, '#272c3a', '#12141b')
      + etoiles(27, 14, 100) + lune(p, 236, 56, 21)
      + corbeauVol(15, 3, 460, 720, 50, 120)
      + toits(35, 200, 40, '#0d0f15') + clocher(596, 200, 70, '#0d0f15')
      + batisse(0, 282, 118, 158, '#0b0c11', 41, 0.05) + batisse(688, 282, 112, 174, '#0b0c11', 42, 0.04)
      // guirlande de fanions en lambeaux
      + `<path d="M170 128q150 36 300 22" stroke="#10121a" stroke-width="1.6" fill="none"/>
      ${[200, 255, 310, 365].map(x => `<path d="M${x} ${R(136 + (x - 170) * 0.07)}l4 12 6 -11z" fill="#10121a"/>`).join('')}`
      + brume(p, 206)
      + etal(150, 234, 3) + etal(320, 228, 4) + etal(488, 236, 5)
      // tas de cagettes pourries + mouches
      + `<path d="M448 288q22 -16 52 -4q14 8 4 14l-58 0z" fill="#0d0f0e"/>`
      + dots([[462, 268], [478, 262], [490, 270], [470, 256], [484, 252]], 1.2, '#06070a', 0.8)
      // fontaine qui coule toujours
      + `<ellipse cx="652" cy="290" rx="62" ry="13" fill="#0d1117"/>
      <ellipse cx="652" cy="284" rx="62" ry="12" fill="none" stroke="#161922" stroke-width="4"/>
      <rect x="644" y="232" width="16" height="50" fill="#0d0f15"/><ellipse cx="652" cy="232" rx="24" ry="6" fill="#11141c"/>
      <path d="M636 236q-8 26 -4 44M668 236q8 26 4 44" stroke="#8fa0b4" stroke-width="1.7" fill="none" opacity="0.5"/>
      <path d="M620 286q14 4 30 2M656 288q16 2 28 -2" stroke="#8fa0b4" stroke-width="1.4" opacity="0.35" fill="none"/>`
      + `<rect y="288" width="${W}" height="52" fill="#0a0a0d"/>
      <path d="M0 318q400 12 800 0" stroke="#13141b" stroke-width="2" stroke-dasharray="7 11" opacity="0.5" fill="none"/>`
      + zfig(118, 262, 0.9, '#0b0c0f', true, 9) + zfig(414, 266, 1, '#0b0c0f', true, -12)
      + zloin(260, 296, 0.9, '#0a0b0f', 0.9) + zloin(545, 290, 0.8, '#0a0b0f', 0.9)
      + chien(360, 306, 1.1)
      + flaque(220, 314, 30, 0.5) + neige(51, 14, 0.35));
  },

  // ----- PARC : étang sous lune, arbres nus, herbes hautes -----
  parc: () => {
    const p = 'parc';
    const reflets = [];
    for (let i = 0; i < 5; i++) reflets.push(`M${R(548 + (i % 3) * 8 - 8)} ${R(262 + i * 11)}h${R(22 - i * 2)}`);
    return cadre(p, fond(p, '#1f262a', '#0c1110')
      + etoiles(61, 16, 130, 0.45) + lune(p, 560, 82, 40, '#cfc9b8', 0.5, '#171d1e')
      + corbeauVol(19, 2, 100, 320, 60, 120)
      // ligne d'arbres lointains
      + `<path d="M0 222q60 -26 120 -12q50 -22 110 -8q70 -24 130 -6q60 -18 120 -10q70 -16 120 -4q60 -10 200 -14V${H}H0Z" fill="#0a0f0d" transform="translate(0,8)" opacity="0.9"/>`
      // kiosque à musique
      + `<path d="M28 218a46 22 0 0 1 92 0z" fill="#0b100e"/>
      <path d="M38 218v44M62 218v46M86 218v46M110 218v44" stroke="#0b100e" stroke-width="4"/>
      <rect x="24" y="262" width="100" height="8" fill="#0b100e"/>`
      // étang
      + `<defs><linearGradient id="${p}-eau" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#18222a"/><stop offset="1" stop-color="#0c1216"/></linearGradient></defs>
      <ellipse cx="420" cy="290" rx="330" ry="42" fill="url(#${p}-eau)"/>
      <path d="${reflets.join('')}" stroke="#cfc9b8" stroke-width="2" opacity="0.3" fill="none"/>
      <path d="M200 282q20 -5 40 0M430 306q20 -4 40 0" stroke="#22303a" stroke-width="1.7" fill="none" opacity="0.8"/>`
      // lentilles d'eau
      + dots([[230, 290], [252, 296], [240, 302], [268, 290], [282, 300], [218, 298]], 4.5, '#0c120f', 0.9)
      // arbres nus
      + arbreNu(300, 268, 86, '#091009', -2)
      + arbreNu(118, 296, 152, '#060a08', -4) + arbreNu(706, 290, 132, '#060a08', 5)
      + corbeau(108, 158, 0.8, '#05080a')
      // quelque chose bouge entre les arbres
      + zloin(348, 262, 0.74, '#070b09', 0.6)
      + `<circle cx="345" cy="232" r="1.4" fill="#d6303e" opacity="0.7"/><circle cx="350" cy="232" r="1.4" fill="#d6303e" opacity="0.65"/>`
      // banc public
      + `<g stroke="#0a0e0b" stroke-width="3.4" fill="none"><path d="M196 318v-16M236 318v-16M194 304h44M194 296h44v-10"/></g>`
      // brume sur l'eau + herbes hautes (premier plan)
      + `<ellipse cx="380" cy="276" rx="200" ry="11" fill="#3a4150" opacity="0.1"/>`
      + `<rect y="320" width="${W}" height="20" fill="#080b09"/>`
      + herbes(7, 0, 800, 318, 28, 36, '#0d130e', 0.9)
      + herbes(13, 0, 800, 326, 32, 44, '#070a08', 1)
      + neige(73, 14, 0.3));
  },

  // ----- RUELLE : boyau claustrophobe, bennes, yeux rouges au fond -----
  ruelle: () => {
    const p = 'ruelle';
    const briques = [];
    for (let i = 0; i < 7; i++) briques.push(`M0 ${52 + i * 38}L${R(310 - i * 4)} ${R(66 + i * 36)}`);
    return cadre(p, `<rect width="${W}" height="${H}" fill="#07080b"/>`
      // fente de ciel entre les toits (seule lumière)
      + `<defs><linearGradient id="${p}-fente" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2d3242"/><stop offset="1" stop-color="#10131a"/></linearGradient></defs>
      <path d="M300 0h220L450 96h-90Z" fill="url(#${p}-fente)"/>`
      + halo(p, 'lueur', 410, 10, 130, 70, '#cfc9b8', 0.22)
      + dots([[352, 26], [468, 18], [420, 44]], 1.5, '#cdd3df', 0.6)
      // murs en perspective
      + `<path d="M0 0h310L408 340H0Z" fill="#10121a"/>
      <path d="${briques.join('')}" stroke="#0b0d13" stroke-width="2" opacity="0.8"/>
      <path d="M800 0H510L444 340H800Z" fill="#0d0f15"/>
      <path d="M510 60h180M496 130h200M482 210h220" stroke="#090b10" stroke-width="2.4" opacity="0.8"/>`
      // fond du boyau
      + `<rect x="376" y="96" width="100" height="190" fill="#060709"/>
      <path d="M398 200h36v86h-36z" fill="#040506"/>`
      // escalier de secours + descente d'eau
      + `<g stroke="#0c0e14" stroke-width="3.4" fill="none">
      <path d="M120 36l60 22M120 84l60 22M120 132l60 20M124 36v100M176 58v100"/>
      <path d="M84 0v300" stroke-width="6"/><path d="M84 300q0 10 10 10" /></g>`
      + dots([[96, 316], [97, 324], [98, 331]], 1.6, '#3a4150', 0.5)
      // fenêtre condamnée (mur droit)
      + `<rect x="600" y="90" width="64" height="78" fill="#0a0b10"/>
      <path d="M596 104l72 14M596 132l72 8M598 156l70 -6" stroke="#15130e" stroke-width="9"/>`
      // enseigne du garage pendue à un fil
      + `<path d="M520 96l-6 28M548 96l2 24" stroke="#14161c" stroke-width="2"/>
      <g transform="rotate(7 536 136)"><rect x="498" y="122" width="78" height="26" rx="3" fill="#11131a" stroke="#1d2027" stroke-width="2"/>
      <text x="537" y="140" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#6b6f7c" opacity="0.55">GARAGE</text></g>`
      // sol + flaque qui reflète la fente de ciel
      + `<path d="M376 286h100L660 340H140Z" fill="#0b0c10"/>
      <ellipse cx="400" cy="318" rx="60" ry="9" fill="#10131a"/>
      <path d="M380 316q20 -4 44 0" stroke="#3a4150" stroke-width="2" opacity="0.4" fill="none"/>`
      // bennes débordantes + sacs
      + `<g><rect x="138" y="252" width="150" height="74" rx="5" fill="#12141a"/>
      <path d="M138 252l24 -18 110 4 16 14z" fill="#171a21"/>
      <path d="M150 252v74M218 252v74" stroke="#0c0d12" stroke-width="3"/>
      <ellipse cx="180" cy="248" rx="26" ry="10" fill="#0e1015"/><ellipse cx="234" cy="246" rx="20" ry="9" fill="#101218"/>
      <circle cx="252" cy="240" r="8" fill="#0e1015"/></g>
      <ellipse cx="320" cy="322" rx="26" ry="11" fill="#0e1015"/><ellipse cx="352" cy="328" rx="18" ry="8" fill="#101218"/>
      <rect x="560" y="270" width="92" height="56" rx="4" fill="#101218"/>
      <path d="M560 270l16 -12 66 2 10 10z" fill="#14161d"/>
      <ellipse cx="606" cy="266" rx="18" ry="7" fill="#0c0e13"/>`
      + sang(430, 330, 60, 0.3)
      // les yeux, au fond
      + zloin(412, 282, 0.92, '#050608', 0.9)
      + `<circle cx="409" cy="250" r="2" fill="#d6303e"/><circle cx="416" cy="250" r="2" fill="#d6303e"/>
      <circle cx="390" cy="262" r="1.4" fill="#d6303e" opacity="0.55"/><circle cx="395" cy="262" r="1.4" fill="#d6303e" opacity="0.55"/>
      <circle cx="436" cy="258" r="1.2" fill="#d6303e" opacity="0.4"/><circle cx="440" cy="258" r="1.2" fill="#d6303e" opacity="0.4"/>`
      // vapeur d'un soupirail
      + `<path d="M620 326q-6 -18 4 -34q-8 -12 -2 -22" stroke="#3a4150" stroke-width="10" opacity="0.07" fill="none" stroke-linecap="round"/>`);
  },

  // ----- ATELIER : garage, camion sur pont élévateur, outils -----
  atelier: () => {
    const p = 'atelier';
    const outil = (x, y, type) => {
      if (type === 0) return `<g transform="translate(${x},${y})" fill="#06070a"><rect x="-1.5" y="0" width="3" height="20"/><circle cx="0" cy="0" r="4"/><circle cx="0" cy="22" r="3"/></g>`;
      if (type === 1) return `<g transform="translate(${x},${y})" fill="#06070a"><rect x="-6" y="0" width="12" height="6" rx="1"/><rect x="-1.5" y="6" width="3" height="17"/></g>`;
      return `<g transform="translate(${x},${y})" fill="#06070a"><path d="M-2 0h4l3 19-10 -4z"/><rect x="-3" y="-6" width="6" height="6" rx="2"/></g>`;
    };
    return cadre(p, fond(p, '#101116', '#0b0c0f')
      // charpente + verrière de toit (lumière froide 1)
      + `<rect x="330" y="0" width="160" height="30" fill="#222936"/>
      <path d="M370 0v30M410 0v30M450 0v30" stroke="#0b0c10" stroke-width="4"/>
      <defs><linearGradient id="${p}-jour" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a4150" stop-opacity="0.13"/><stop offset="1" stop-color="#3a4150" stop-opacity="0"/></linearGradient></defs>
      <path d="M330 30h160l50 210H280Z" fill="url(#${p}-jour)"/>
      <path d="M0 42h800M120 42l60 -30M380 42l-50 -30M520 42l50 -30M740 42l-40 -30" stroke="#0a0b0e" stroke-width="5"/>`
      // chaînes au plafond
      + `<path d="M600 42v66M644 42v52" stroke="#14161c" stroke-width="3" stroke-dasharray="5 4"/>
      <path d="M596 108q4 8 8 0M640 94q4 8 8 0" stroke="#14161c" stroke-width="3" fill="none"/>`
      // baladeuse (lumière or 2)
      + `<path d="M430 42v22" stroke="#0a0b0e" stroke-width="2"/>
      <path d="M430 64l-16 22h32z" fill="#0d0e13"/>`
      + halo(p, 'lampe', 430, 156, 175, 138, '#c9a227', 0.27)
      + `<ellipse cx="430" cy="86" rx="6" ry="3.4" fill="#e8c25a" opacity="0.85"/>`
      // panneau d'outils
      + `<rect x="80" y="92" width="220" height="124" fill="#15171d"/>
      <path d="M80 92h220M80 216h220" stroke="#0c0d12" stroke-width="3"/>`
      + dots([[100, 110], [130, 110], [160, 110], [190, 110], [220, 110], [250, 110], [280, 110], [100, 160], [280, 160]], 1.6, '#0c0d12', 0.8)
      + outil(110, 116, 0) + outil(146, 118, 1) + outil(182, 114, 2) + outil(218, 118, 0) + outil(254, 116, 1)
      + `<path d="M116 180h60v22h-60z" fill="#0d0f14"/><path d="M210 174l44 30M254 174l-44 30" stroke="#0c0d12" stroke-width="3"/>`
      // étagère à bidons
      + `<rect x="580" y="120" width="170" height="100" fill="#101218"/>
      <path d="M580 156h170M580 192h170" stroke="#0a0b0e" stroke-width="4"/>
      <rect x="594" y="132" width="18" height="22" fill="#171a21"/><rect x="620" y="136" width="16" height="18" fill="#14161d"/>
      <rect x="676" y="132" width="20" height="22" fill="#171a21"/><rect x="600" y="170" width="16" height="20" fill="#14161d"/>
      <rect x="700" y="168" width="18" height="22" fill="#171a21"/>`
      // pont élévateur + camion capot ouvert (autopsie interrompue)
      + `<rect x="312" y="158" width="13" height="142" fill="#101218"/><rect x="546" y="158" width="13" height="142" fill="#101218"/>
      <path d="M318 226l26 40M344 226l-26 40M552 226l-26 40M526 226l26 40" stroke="#0d0e13" stroke-width="4"/>
      <rect x="300" y="216" width="270" height="11" fill="#15171f"/>`
      + `<g fill="#0a0b10">
      <rect x="318" y="152" width="146" height="54" rx="4"/>
      <path d="M464 206v-36q0 -8 8 -8h28q9 0 13 8l8 16v20z"/>
      <rect x="472" y="168" width="24" height="15" fill="#161c26"/>
      <path d="M506 166l28 -18 5 5-24 18z"/>
      <rect x="508" y="180" width="22" height="16" fill="#070809"/>
      </g>
      <circle cx="352" cy="204" r="13" fill="#060709"/><circle cx="438" cy="204" r="13" fill="#060709"/><circle cx="504" cy="204" r="13" fill="#060709"/>`
      // sol, fosse, taches d'huile
      + `<rect y="296" width="${W}" height="44" fill="#0b0b0e"/>
      <path d="M0 296h800" stroke="#13141a" stroke-width="2"/>
      <rect x="352" y="312" width="180" height="22" fill="#050507"/>
      <path d="M352 312h180" stroke="#c9a227" stroke-width="2" stroke-dasharray="10 9" opacity="0.18"/>
      <ellipse cx="250" cy="322" rx="46" ry="6" fill="#070708" opacity="0.8"/>
      <ellipse cx="600" cy="330" rx="38" ry="5" fill="#070708" opacity="0.7"/>`
      // pile de pneus + établi + batterie sur chariot
      + `<g fill="#0c0d12"><ellipse cx="110" cy="296" rx="30" ry="10"/><ellipse cx="110" cy="282" rx="30" ry="10"/>
      <ellipse cx="110" cy="268" rx="30" ry="10"/><ellipse cx="110" cy="268" rx="13" ry="4.4" fill="#060709"/></g>
      <rect x="624" y="246" width="150" height="10" fill="#101116"/>
      <path d="M632 256l-5 44M764 256l5 44M700 256v42" stroke="#101116" stroke-width="5"/>
      <path d="M648 236q8 -8 16 0l-2 10h-12z" fill="#0d0f14"/>
      <rect x="186" y="288" width="36" height="22" rx="2" fill="#10121a"/>
      <path d="M192 288v-4h6v4M208 288v-4h6v4" stroke="#c9a227" stroke-width="2.4" opacity="0.6" fill="none"/>
      <circle cx="192" cy="314" r="4" fill="#060709"/><circle cx="216" cy="314" r="4" fill="#060709"/>
      <path d="M222 296q30 -8 48 4" stroke="#0e1015" stroke-width="3" fill="none"/>`);
  },

  // ----- AVENUE : embouteillage figé, bus couché, horde diffuse -----
  avenue: () => {
    const p = 'avenue';
    return cadre(p, fond(p, '#282232', '#12121a')
      + etoiles(81, 9, 90, 0.4)
      + corbeauVol(25, 3, 80, 320, 40, 110)
      + `<path d="M608 168q-5 -40 6 -78q-8 -28 -2 -58" stroke="#0c0e13" stroke-width="9" fill="none" opacity="0.6" stroke-linecap="round"/>`
      + batisse(0, 280, 140, 232, '#0b0c11', 51, 0.04) + batisse(148, 262, 72, 150, '#0a0b10', 52, 0.05)
      + batisse(704, 280, 96, 220, '#0b0c11', 54, 0.05) + batisse(622, 268, 76, 168, '#0a0b10', 55, 0)
      // la horde, diffuse, au fond de l'avenue
      + horde(67, 14, 300, 560, 252, 0.55, 0.95, '#0b0d13', 0.85)
      + dots([[366, 234], [370, 234], [452, 230], [456, 230], [410, 238], [414, 238]], 1.4, '#d6303e', 0.55)
      + brume(p, 206, '#3a4150', 0.22)
      + `<ellipse cx="430" cy="252" rx="190" ry="26" fill="#2a2430" opacity="0.35"/>`
      // chaussée
      + `<rect y="276" width="${W}" height="64" fill="#0a0a0d"/>
      <path d="${[40, 150, 270, 390, 510, 630, 740].map(x => `M${x} 306h44`).join('')}" stroke="#191b23" stroke-width="3" opacity="0.5"/>`
      // bus couché en travers
      + `<g transform="rotate(-4 310 270)">
      <rect x="168" y="238" width="288" height="64" rx="15" fill="#0d0e14"/>
      <path d="M182 252h258" stroke="#171d2a" stroke-width="13" stroke-dasharray="25 9"/>
      <path d="M182 296h260" stroke="#090a0e" stroke-width="5" stroke-dasharray="13 7"/>
      <circle cx="206" cy="232" r="12" fill="#060709"/><circle cx="294" cy="229" r="12" fill="#060709"/>
      <path d="M206 232l-3 -12M294 229l-3 -12" stroke="#060709" stroke-width="4"/>
      </g>
      <path d="M458 300q72 8 128 2" stroke="#06070a" stroke-width="9" opacity="0.6" fill="none"/>`
      // voitures imbriquées
      + voiture(596, 280, 0.7, '#0c0d12', true)
      + voiture(118, 296, 0.9, '#0b0c11') + voiture(238, 312, 1.04, '#0c0d12', true)
      // affaires abandonnées
      + valise(382, 316, 1, '#0c0d12', true)
      + dots([[430, 320], [444, 324], [516, 318]], 4, '#101116', 0.9)
      + sang(300, 322, 86, 0.35)
      + zfig(496, 268, 0.86, '#0b0c0f', true, -11) + zfig(354, 274, 0.95, '#0b0c0f', true, 13)
      // feu tricolore bloqué au rouge (accent)
      + `<path d="M70 318V128" stroke="#0a0b0f" stroke-width="6"/>
      <rect x="56" y="96" width="28" height="64" rx="6" fill="#0b0c10"/>`
      + halo(p, 'feu', 70, 110, 26, 26, '#a31621', 0.5)
      + `<circle cx="70" cy="110" r="6" fill="#a31621" opacity="0.9"/>
      <circle cx="70" cy="128" r="6" fill="#070809"/><circle cx="70" cy="146" r="6" fill="#070809"/>`
      + neige(57, 15, 0.4));
  },

  // ----- COMMISSARIAT : façade institutionnelle, sacs de sable, douilles -----
  commissariat: () => {
    const p = 'commissariat';
    const r = rng(7);
    // fenêtres à barreaux (2 niveaux) — compactées en deux paths
    let fr = '', fb = '';
    for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) {
      const fx = 158 + i * 84, fy = 122 + j * 78;
      if (j === 1 && (i === 2 || i === 3)) continue;
      fr += `M${fx} ${fy}h36v48h-36z`;
      fb += `M${fx + 9} ${fy}v48M${fx + 18} ${fy}v48M${fx + 27} ${fy}v48M${fx} ${fy + 24}h36`;
    }
    const fen = `<path d="${fr}" fill="#08090d"/><path d="${fb}" stroke="#1d2027" stroke-width="2" fill="none"/>`;
    // sacs de sable
    const sacs = (x, n0) => {
      let s = '';
      for (let j = 0; j < 3; j++) for (let i = 0; i < n0 - j; i++)
        s += `<rect x="${x + i * 30 + j * 15}" y="${282 - j * 15}" width="29" height="14" rx="6"/>`;
      return `<g fill="#14151c" stroke="#0b0c10" stroke-width="1.6">${s}</g>`;
    };
    const douilles = [], imp = [];
    for (let i = 0; i < 13; i++) douilles.push([R(190 + r() * 200), R(304 + r() * 28)]);
    for (let i = 0; i < 9; i++) imp.push([R(170 + r() * 250), R(140 + r() * 110)]);
    return cadre(p, fond(p, '#23242e', '#101117')
      + etoiles(91, 16, 84, 0.45) + lune(p, 84, 56, 18)
      // façade
      + `<rect x="110" y="86" width="580" height="214" fill="#11131a"/>
      <rect x="110" y="86" width="580" height="18" fill="#0b0c10"/>
      <rect x="100" y="80" width="600" height="10" fill="#0d0f15"/>
      <path d="${[150, 234, 318, 482, 566, 650].map(x => `M${x} 104V300`).join('')}" stroke="#0d0f15" stroke-width="9"/>` + fen
      + corbeau(140, 80, 0.85) + corbeau(560, 80, 0.7)
      // une fenêtre éclairée de l'intérieur — braise mourante
      + halo(p, 'braise', 596, 146, 40, 34, '#c9a227', 0.22)
      + `<rect x="578" y="122" width="36" height="48" fill="#1d1408" opacity="0.8"/>
      <path d="M587 122v48M596 122v48M605 122v48M578 146h36" stroke="#1d2027" stroke-width="2"/>`
      // entrée : enseigne, lanterne froide, porte défoncée vers l'extérieur
      + `<rect x="344" y="120" width="112" height="26" rx="3" fill="#0a0b10"/>
      <text x="400" y="139" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" letter-spacing="7" fill="#9aa4b8" opacity="0.8">POLICE</text>`
      + halo(p, 'lant', 400, 162, 44, 36, '#3d6a8a', 0.34)
      + `<circle cx="400" cy="160" r="7" fill="#3d6a8a" opacity="0.75"/><path d="M400 148v-2" stroke="#0a0b10" stroke-width="3"/>
      <rect x="358" y="172" width="84" height="110" fill="#060608"/>
      <g transform="rotate(24 358 282)"><rect x="320" y="172" width="40" height="110" fill="#13151c"/></g>
      <path d="M442 172v110" stroke="#13151c" stroke-width="8"/>
      <rect x="346" y="282" width="108" height="8" fill="#0d0f15"/><rect x="338" y="290" width="124" height="8" fill="#0b0c10"/>`
      // drapeau en lambeaux
      + `<path d="M132 86V20" stroke="#0d0f15" stroke-width="4"/>
      <path d="M132 24l36 6-8 6 10 6-38 6z" fill="#20242e"/>`
      // sol, sacs, barrière renversée, corps sous bâche
      + `<rect y="298" width="${W}" height="42" fill="#0b0b0e"/>` + sacs(216, 4) + sacs(462, 4)
      + `<g transform="rotate(12 600 316)" stroke="#14161c" stroke-width="4" fill="none">
      <path d="M540 310h120M540 322h120M548 304v24M652 304v24"/></g>`
      + `<path d="M118 318q30 -10 66 -2q10 4 2 8l-66 2q-8 -4 -2 -8z" fill="#0e0f14"/>` + flaque(196, 328, 30, 0.6)
      + `<path d="${imp.map(q => `M${q[0]} ${q[1]}h.1`).join('')}" stroke="#788294" stroke-width="2.6" stroke-linecap="round" opacity="0.45" fill="none"/>
      <path d="M286 188l-7 -7M289 185l5 8M468 232l8 -4" stroke="#788294" stroke-width="1" opacity="0.4"/>`
      + dots(douilles, 2, '#c9a227', 0.5)
      + neige(63, 18, 0.3));
  },

  // ----- GARE : grande verrière, locomotive massive à quai -----
  gare: () => {
    const p = 'gare';
    // montants de la verrière (suivent l'arche)
    const mull = [104, 162, 222, 284, 344].map(x => {
      const t = Math.sqrt((x - 40) / 360), ya = R(60 + 240 * (1 - t) * (1 - t));
      return `M${x} 292V${ya}M${800 - x} 292V${ya}`;
    }).join('');
    return cadre(p, fond(p, '#14161e', '#0b0c10')
      // verrière
      + `<defs><linearGradient id="${p}-glas" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d2330"/><stop offset="1" stop-color="#10131a"/></linearGradient></defs>
      <path d="M40 300Q40 60 400 60Q760 60 760 300Z" fill="url(#${p}-glas)" opacity="0.85"/>
      <path d="M40 300Q40 60 400 60Q760 60 760 300" stroke="#0a0b0e" stroke-width="11" fill="none"/>
      <path d="M74 300Q74 92 400 92Q726 92 726 300" stroke="#0a0b0e" stroke-width="4" fill="none"/>
      <path d="${mull}M400 292V60" stroke="#0a0b0e" stroke-width="4" fill="none"/>`
      // verrière crevée : trous plus clairs + rai de lune + neige qui entre
      + `<path d="M236 100l52 -8 10 38-48 12z" fill="#27303e" opacity="0.9"/>
      <path d="M452 78l44 6-6 30-40 -8z" fill="#222a38" opacity="0.85"/>
      <path d="M288 92l-14 22M470 84l-8 24" stroke="#8e98a8" stroke-width="1.2" opacity="0.4"/>
      <defs><linearGradient id="${p}-rai" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9aa4b8" stop-opacity="0.16"/><stop offset="1" stop-color="#9aa4b8" stop-opacity="0"/></linearGradient></defs>
      <path d="M240 104L296 96L350 300L240 300Z" fill="url(#${p}-rai)"/>`
      + neige(67, 14, 0.4, 240, 350, 110, 300)
      // horloge arrêtée + panneau des départs
      + `<circle cx="400" cy="120" r="19" fill="#171a22" stroke="#23242c" stroke-width="2.4"/>
      <path d="M400 120l-7 -9M400 120l9 4" stroke="#3a4150" stroke-width="2.4"/>
      <path d="M252 70v22M366 70v22" stroke="#0a0b0e" stroke-width="3"/>
      <rect x="232" y="92" width="156" height="40" fill="#0a0b10"/>
      <path d="M242 102h136M242 112h110M242 122h128" stroke="#181b24" stroke-width="4"/>`
      // piliers
      + `<path d="${[140, 262, 538, 660].map(x => `M${x} 300V128`).join('')}" stroke="#0b0c10" stroke-width="13"/>
      <path d="${[140, 262, 538, 660].map(x => `M${x - 16} 132h32`).join('')}" stroke="#0b0c10" stroke-width="6"/>`
      + corbeau(346, 64, 0.7) + corbeau(434, 66, 0.6)
      // campement abandonné
      + `<path d="M160 300l24 -38 26 38z" fill="#13151c"/><path d="M184 262v38" stroke="#0b0c10" stroke-width="2.4"/>
      <ellipse cx="232" cy="298" rx="16" ry="5" fill="#101116"/>
      ${dots([[222, 294], [230, 290], [240, 294]], 2, '#23242c', 0.8)}
      <rect x="118" y="288" width="22" height="12" rx="3" fill="#0e1015"/>`
      // le conducteur, assis contre un pilier
      + `<g fill="#08090c"><circle cx="276" cy="256" r="5.5"/>
      <path d="M268 261q-4 18 0 30h20l16 6 2 -5-15 -9h-14q2 -14 -2 -20z"/>
      <path d="M270 252l13 -2-1 -4-11 1z" fill="#0d1018"/></g>
      <ellipse cx="290" cy="296" rx="20" ry="4" fill="#2a0d12" opacity="0.5"/>`
      // locomotive massive à quai
      + `<g>
      <rect x="496" y="164" width="300" height="124" rx="7" fill="#0b0c11"/>
      <rect x="496" y="164" width="62" height="124" rx="7" fill="#0d0f15"/>
      <rect x="506" y="178" width="19" height="26" fill="#171d29"/><rect x="533" y="178" width="19" height="26" fill="#171d29"/>
      <circle cx="514" cy="226" r="6" fill="#15161c"/><circle cx="542" cy="226" r="6" fill="#15161c"/>
      <path d="M500 250h54M508 288v-28M546 288v-28" stroke="#070809" stroke-width="3" fill="none"/>
      <path d="${[572, 616, 660, 704, 748].map(x => `M${x} 182h30v17h-30z`).join('')}" stroke="#070809" stroke-width="2" fill="#141a24"/>
      <path d="M566 216h230M566 252h230" stroke="#070809" stroke-width="3"/>
      <circle cx="580" cy="292" r="15" fill="#060709"/><circle cx="624" cy="292" r="15" fill="#060709"/>
      <circle cx="718" cy="292" r="15" fill="#060709"/><circle cx="762" cy="292" r="15" fill="#060709"/>
      <path d="M580 292h44M718 292h44" stroke="#0e1015" stroke-width="4"/>
      <rect x="484" y="268" width="12" height="10" fill="#0d0f15"/><rect x="484" y="240" width="12" height="10" fill="#0d0f15"/>
      </g>`
      // quai + voie
      + `<rect y="300" width="${W}" height="14" fill="#0e0f14"/>
      <path d="M0 302h800" stroke="#3a4150" stroke-width="2" opacity="0.3"/>
      <rect y="314" width="${W}" height="26" fill="#08080a"/>
      <path d="M0 322h800M0 332h800" stroke="#15171d" stroke-width="3"/>
      <path d="${[30, 110, 190, 270, 350, 430, 510, 590, 670, 750].map(x => `M${x} 327h36`).join('')}" stroke="#101116" stroke-width="5"/>`
      + brume(p, 252, '#3a4150', 0.1));
  },

  // ----- TRAIN : locomotive lancée en pleine campagne, fumée -----
  train: () => {
    const p = 'train';
    return cadre(p, fond(p, '#3a4150', '#1c212c')
      // soleil d'hiver voilé (lumière)
      + halo(p, 'sol', 636, 66, 110, 110, '#cfc9b8', 0.3)
      + `<circle cx="636" cy="66" r="24" fill="#cfc9b8" opacity="0.55"/>
      <path d="M560 60q76 16 152 2" stroke="#2d3242" stroke-width="12" opacity="0.6" fill="none"/>
      <path d="M580 84q60 10 120 0" stroke="#2d3242" stroke-width="8" opacity="0.5" fill="none"/>`
      // Mortagne au loin, trois colonnes de fumée
      + `<path d="M0 218h26v-12h12v12h20v-18h14v18h22v-10h16v10h14v-16l8 -8 8 8v16h18v218H0Z" fill="#161a23"/>
      <path d="M36 206q-4 -28 4 -52M88 200q-5 -30 3 -56M132 202q-4 -24 5 -46" stroke="#10131a" stroke-width="7" opacity="0.75" fill="none" stroke-linecap="round"/>
      <path d="M158 218q120 -10 240 -6q200 -8 402 2v24H0v-16z" fill="#181d27"/>`
      // poteaux télégraphiques + fils
      + `<path d="${[110, 250, 620, 736].map(x => `M${x} 282V196h-14M${x} 196h14M${x} 208h10`).join('')}" stroke="#101218" stroke-width="4" fill="none"/>
      <path d="M110 200q70 14 140 0q186 16 366 0q60 10 120 2" stroke="#101218" stroke-width="1.6" fill="none" opacity="0.8"/>`
      // champs sous neige
      + `<rect y="262" width="${W}" height="52" fill="#1a1f28"/>
      <path d="M0 276h190M260 284h210M540 272h180" stroke="#8e98a8" stroke-width="2.4" opacity="0.16"/>
      <path d="M0 296h140M650 290h150" stroke="#8e98a8" stroke-width="2" opacity="0.12"/>
      <path d="M40 262q20 -10 44 -2q18 -8 30 0l-4 6H46z" fill="#141821"/>`
      // panache de fumée noire vers l'arrière
      + `<path d="M392 192q-8 -28 -30 -42" stroke="#14161c" stroke-width="13" fill="none" stroke-linecap="round" opacity="0.8"/>
      <ellipse cx="340" cy="142" rx="20" ry="13" fill="#171a21" opacity="0.6"/>
      <ellipse cx="288" cy="124" rx="29" ry="17" fill="#171a21" opacity="0.5"/>
      <ellipse cx="218" cy="112" rx="38" ry="20" fill="#15181f" opacity="0.42"/>
      <ellipse cx="128" cy="104" rx="48" ry="23" fill="#14161d" opacity="0.34"/>
      <ellipse cx="36" cy="100" rx="44" ry="24" fill="#13151b" opacity="0.26"/>`
      // la machine, lancée plein est
      + `<g>
      <path d="M268 304V210q0 -12 12 -12h268l46 10q12 4 18 14l16 26v56z" fill="#0c0d13"/>
      <rect x="500" y="210" width="22" height="20" rx="3" fill="#232b38"/><rect x="538" y="212" width="40" height="22" rx="3" fill="#1a212c"/>
      <rect x="380" y="180" width="22" height="20" fill="#0b0c11"/>
      <path d="M286 222h190M286 244h200" stroke="#070809" stroke-width="3"/>
      <path d="${[300, 344, 388, 432].map(x => `M${x} 256h28v18h-28z`).join('')}" fill="#10141c" stroke="#070809" stroke-width="2"/>
      <path d="M616 276l24 14v14h-30z" fill="#0a0b10"/>
      <circle cx="316" cy="304" r="16" fill="#060709"/><circle cx="366" cy="304" r="16" fill="#060709"/>
      <circle cx="500" cy="304" r="16" fill="#060709"/><circle cx="550" cy="304" r="16" fill="#060709"/>
      <path d="M316 304h50M500 304h50" stroke="#10131a" stroke-width="5"/>
      <circle cx="316" cy="304" r="5" fill="#10131a"/><circle cx="550" cy="304" r="5" fill="#10131a"/>
      </g>`
      // lignes de vitesse + voie
      + `<path d="M250 234H140M236 262H96M260 286H170" stroke="#3a4150" stroke-width="3" opacity="0.2"/>
      <rect y="314" width="${W}" height="26" fill="#13151b"/>
      <path d="M0 316h800" stroke="#232a35" stroke-width="3"/>
      <path d="${[10, 90, 170, 250, 330, 410, 490, 570, 650, 730].map(x => `M${x} 326h40`).join('')}" stroke="#0d0f14" stroke-width="6"/>
      <path d="M0 338h800" stroke="#0b0c10" stroke-width="4"/>`
      // corbeaux qui s'égaillent + clôture au premier plan
      + corbeauVol(37, 4, 640, 780, 110, 170)
      + `<path d="M30 340l-7 -54M180 340l-8 -48M652 340l7 -50M778 340l5 -44" stroke="#060709" stroke-width="7"/>
      <path d="M16 304q200 28 770 6" stroke="#060709" stroke-width="2.4" fill="none" opacity="0.8"/>
      <path d="M20 318q230 22 766 4" stroke="#060709" stroke-width="2" fill="none" opacity="0.7"/>`
      + neige(87, 24, 0.3));
  },

  // ----- TRAIN_NUIT : cabine chaude, phare trouant l'obscurité -----
  train_nuit: () => {
    const p = 'train_nuit';
    return cadre(p, fond(p, '#10121b', '#06070a')
      + etoiles(41, 44, 200, 0.6) + lune(p, 96, 44, 12, '#cfc9b8', 0.3)
      // collines noires
      + `<path d="M0 244q120 -26 240 -10q140 -20 280 -6q160 -14 280 4V${H}H0Z" fill="#090a0f"/>`
      // fumée qui mange les étoiles
      + `<ellipse cx="640" cy="96" rx="60" ry="20" fill="#04050a" opacity="0.7"/>
      <ellipse cx="730" cy="76" rx="56" ry="22" fill="#04050a" opacity="0.6"/>
      <path d="M600 150q6 -22 28 -34" stroke="#04050a" stroke-width="11" opacity="0.7" fill="none" stroke-linecap="round"/>`
      // faisceau du phare
      + `<defs><linearGradient id="${p}-fx" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#e8dcae" stop-opacity="0.4"/><stop offset="0.55" stop-color="#e8dcae" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#e8dcae" stop-opacity="0"/></linearGradient></defs>
      <path d="M560 206L0 238V312L560 226Z" fill="url(#${p}-fx)"/>`
      + halo(p, 'phare', 560, 215, 56, 44, '#f0e6c0', 0.65)
      + `<circle cx="560" cy="215" r="9" fill="#f0e6c0" opacity="0.95"/>`
      // une silhouette figée dans la lumière, loin devant
      + zloin(146, 272, 0.8, '#060709', 0.9)
      // neige visible dans le faisceau seulement
      + neige(97, 16, 0.5, 60, 520, 230, 290)
      // la machine, masse sombre, cabine chaude (2e lumière)
      + `<g>
      <path d="M540 330V206q0 -14 14 -14h246v138z" fill="#0a0b10"/>
      <path d="M540 206q40 -6 70 0" stroke="#10121a" stroke-width="3" fill="none"/>
      <rect x="648" y="158" width="152" height="36" rx="5" fill="#0b0c11"/>`
      + halo(p, 'cab', 692, 222, 64, 52, '#c9a227', 0.4)
      + `<rect x="664" y="206" width="52" height="34" rx="3" fill="#c9a227" opacity="0.6"/>
      <path d="M678 240q4 -16 1 -34h8q4 18 0 34z" fill="#0a0b10"/>
      <circle cx="683" cy="212" r="5.5" fill="#0a0b10"/>
      <rect x="736" y="206" width="44" height="34" rx="3" fill="#33301f" opacity="0.8"/>
      <path d="M548 246h240M548 282h240" stroke="#05060a" stroke-width="4"/>
      <path d="M556 296l-12 16M572 296l-12 16" stroke="#15161c" stroke-width="3"/>
      </g>`
      // rails qui accrochent la lumière
      + `<rect y="306" width="${W}" height="34" fill="#07070a"/>
      <path d="M540 318Q330 296 150 280" stroke="#bdb389" stroke-width="2.6" fill="none" opacity="0.4"/>
      <path d="M560 334Q360 308 166 286" stroke="#bdb389" stroke-width="3" fill="none" opacity="0.3"/>
      <path d="${[200, 260, 320, 380, 440, 500].map((x, i) => `M${x} ${R(300 + i * 5)}l${R(34 + i * 5)} ${R(6 + i)}`).join('')}" stroke="#1d1c14" stroke-width="4" opacity="0.7" fill="none"/>`);
  },

  // ----- CAMP : Refuge de Valdieu — la seule vraie lumière chaude -----
  camp: () => {
    const p = 'camp';
    // guirlande d'ampoules entre les miradors
    const guirlande = (x0, y0, cx, cy, x1, y1) => {
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6, u = 1 - t;
        pts.push([R(u * u * x0 + 2 * t * u * cx + t * t * x1), R(u * u * y0 + 2 * t * u * cy + t * t * y1)]);
      }
      return `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" stroke="#0d0f15" stroke-width="1.4" fill="none"/>` + dots(pts, 3, '#c9a227', 0.75);
    };
    // conteneurs (deux rangées)
    const conteneur = (x, y, w, h, c) => {
      let tole = '';
      for (let i = 9; i < w - 4; i += 14) tole += `M${x + i} ${y + 3}v${h - 6}`;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><path d="${tole}" stroke="#0b0d13" stroke-width="2.4" opacity="0.55" fill="none"/>`;
    };
    const bas = [[20, '#1b2130'], [100, '#242a36'], [180, '#28222c'], [260, '#1b2130'], [442, '#242a36'], [522, '#1b2130'], [602, '#28222c'], [682, '#242a36']]
      .map(([x, c]) => conteneur(x, 238, 78, 50, c)).join('');
    const hauts = [[58, '#242a36'], [196, '#1b2130'], [486, '#28222c'], [624, '#1b2130']]
      .map(([x, c]) => conteneur(x, 198, 78, 40, c)).join('');
    // mirador
    const mirador = (x, dir) => `
      <path d="M${x - 22} 238L${x - 8} 128M${x + 22} 238L${x + 8} 128M${x - 18} 210h36M${x - 14} 174h28M${x - 18} 210l32 -36M${x + 18} 210l-32 -36" stroke="#10131a" stroke-width="4" fill="none"/>
      <rect x="${x - 24}" y="100" width="48" height="30" fill="#11141c"/>
      <path d="M${x - 28} 100l28 -12 28 12z" fill="#0d0f15"/>
      <rect x="${x - 10}" y="108" width="14" height="11" fill="#c9a227" opacity="0.55"/>
      <path d="M${x + 24 * dir} 106L${x + 150 * dir} 196L${x + 88 * dir} 226Z" fill="url(#${p}-proj)" opacity="0.8"/>
      <circle cx="${x + 22 * dir}" cy="108" r="4" fill="#e8e2cc" opacity="0.8"/>`;
    return cadre(p, fond(p, '#2d3242', '#161b26')
      + `<defs><linearGradient id="${p}-proj" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8e2cc" stop-opacity="0.3"/><stop offset="1" stop-color="#e8e2cc" stop-opacity="0"/></linearGradient></defs>`
      + etoiles(29, 18, 90, 0.4)
      + `<path d="M0 206q140 -30 300 -18q220 -20 500 6V${H}H0Z" fill="#11141c"/>`
      // halo chaud au-dessus du camp + fumées de cuisine
      + halo(p, 'foyer', 400, 214, 280, 120, '#c9a227', 0.2)
      + `<path d="M310 198q-6 -30 6 -54q-8 -20 -2 -36M462 198q6 -28 -4 -50q8 -18 2 -34" stroke="#555a66" stroke-width="9" opacity="0.3" fill="none" stroke-linecap="round"/>`
      // enceinte de conteneurs
      + hauts + bas
      // fenêtres chaudes percées dans les conteneurs
      + `<path d="${[126, 214, 296, 468, 552, 710].map(x => `M${x} 256v12`).join('')}" stroke="#c9a227" stroke-width="8" opacity="0.55"/>
      <path d="${[88, 226, 516, 654].map(x => `M${x} 210v9`).join('')}" stroke="#c9a227" stroke-width="7" opacity="0.5"/>`
      // portail + enseigne + grillage et silhouettes d'enfants
      + `<rect x="340" y="208" width="120" height="80" fill="#0e1118"/>
      <rect x="352" y="220" width="96" height="68" fill="#c9a227" opacity="0.3"/>
      <path d="${[364, 380, 396, 412, 428].map(x => `M${x} 220V288`).join('')}" stroke="#0e1118" stroke-width="5"/>
      <path d="M352 240h96M352 262h96" stroke="#0e1118" stroke-width="3"/>
      <text x="400" y="202" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="3" fill="#c9a227" opacity="0.6">REFUGE DE VALDIEU</text>`
      + zloin(388, 288, 0.55, '#0d0f15', 0.9) + zloin(414, 288, 0.45, '#0d0f15', 0.9)
      // gardes sur le mur
      + `<g fill="#0d0f15"><circle cx="240" cy="186" r="4"/><path d="M236 190q-2 10 0 12h8q2 -4 0 -12q-4 -3 -8 0z"/>
      <path d="M232 198l16 -10" stroke="#0d0f15" stroke-width="2.4"/></g>
      <g fill="#0d0f15"><circle cx="560" cy="186" r="4"/><path d="M556 190q-2 10 0 12h8q2 -4 0 -12q-4 -3 -8 0z"/>
      <path d="M568 198l-14 -11" stroke="#0d0f15" stroke-width="2.4"/></g>`
      + mirador(150, -1) + mirador(650, 1)
      + guirlande(150, 130, 280, 196, 400, 178) + guirlande(400, 178, 520, 196, 650, 130)
      + `<path d="M400 178v-40" stroke="#10131a" stroke-width="3"/><path d="M400 138l30 -10v14l-30 4z" fill="#3d6a8a" opacity="0.85"/>`
      // la voie ferrée mène au portail
      + `<rect y="288" width="${W}" height="52" fill="#0d0f13"/>
      <path d="M398 288L330 340M402 288L470 340" stroke="#3a3a30" stroke-width="4" fill="none"/>
      <path d="M398 288L330 340M402 288L470 340" stroke="#c9a227" stroke-width="1.4" fill="none" opacity="0.35"/>
      <path d="${[296, 306, 318, 330].map((y, i) => `M${R(380 - i * 14)} ${y}h${R(40 + i * 28)}`).join('')}" stroke="#15171d" stroke-width="5"/>`
      + neige(45, 16, 0.35));
  },

  // ----- MORT : cercle de silhouettes penchées sur toi, flaque sombre -----
  mort: () => {
    const p = 'mort';
    const fig = (ang, s, o) => `<g transform="rotate(${ang} 400 165)"><g transform="translate(400,165) scale(${s})" opacity="${o}">
      <ellipse cx="0" cy="-78" rx="24" ry="28" fill="#08090c"/>
      <path d="M-34 -62Q-46 -18 -72 34L72 34Q46 -20 34 -62q-34 -18 -68 0z" fill="#08090c"/>
      <path d="M-20 -52q-22 16 -28 38M20 -52q22 16 28 38" stroke="#08090c" stroke-width="15" fill="none" stroke-linecap="round"/>
      <circle cx="-8" cy="-76" r="2.6" fill="#d6303e"/><circle cx="8" cy="-75" r="2.6" fill="#d6303e"/>
    </g></g>`;
    return cadre(p, `<rect width="${W}" height="${H}" fill="#060608"/>`
      // le ciel gris, là-haut, entre eux — dernière image
      + `<defs><radialGradient id="${p}-ouv" cx="0.5" cy="0.46">
      <stop offset="0" stop-color="#6a7484" stop-opacity="0.85"/><stop offset="0.2" stop-color="#4a5260" stop-opacity="0.5"/>
      <stop offset="0.45" stop-color="#23272f" stop-opacity="0.2"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/>
      </radialGradient></defs>
      <ellipse cx="400" cy="158" rx="320" ry="240" fill="url(#${p}-ouv)"/>`
      + neige(35, 9, 0.5, 330, 470, 90, 220)
      + halo(p, 'aura', 400, 165, 250, 200, '#a31621', 0.16)
      + fig(196, 1.18, 1) + fig(252, 0.95, 0.94) + fig(304, 1.08, 0.97)
      + fig(20, 1, 0.92) + fig(72, 0.9, 0.9) + fig(128, 1.04, 0.95)
      + `<ellipse cx="400" cy="330" rx="250" ry="26" fill="#1d070b" opacity="0.85"/>
      <ellipse cx="380" cy="328" rx="130" ry="13" fill="#a31621" opacity="0.22"/>
      <path d="M270 318q-20 -8 -34 -4M540 320q22 -10 38 -6" stroke="#1d070b" stroke-width="7" opacity="0.8" fill="none"/>`);
  },
};

export function svgScene(nom) {
  const fn = SCENES_SVG[nom] || SCENES_SVG.rue;
  return fn();
}
