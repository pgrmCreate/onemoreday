// Ambiance « Les cours » — l'anneau des boulevards, jour de marché pour toujours.
// Extérieur : double rangée de platanes taillés ras pour l'hiver, kiosque à
// musique vide, terrasses renversées, et la Porte de l'Horloge en point de fuite.
import {
  W, H, R, rng, fondCiel, astre, etoiles, neige, brume, batisse, toits,
  carcasse, lampadaire, zfig, voileNuit,
} from '../ambiance_lib.js';

// Platane taillé : tronc nu, moignons en poings, quelques brindilles d'hiver.
function platane(x, y, sc, seed) {
  const k = rng(seed);
  let tw = '';
  for (const [nx, ny] of [[0, -71], [-15, -62], [15, -64]]) for (let i = 0; i < 3; i++) {
    const an = -2.5 + (i + k()) * 0.62, l = 8 + k() * 7;
    tw += `M${nx} ${ny}l${R(Math.cos(an) * l)} ${R(Math.sin(an) * l)}`;
  }
  return `<g transform="translate(${x},${y}) scale(${sc})" fill="#0b0c10" stroke="#0b0c10" stroke-linecap="round">
    <path d="M-6 0Q-4 -26 -3 -49L3 -49Q4 -26 6 0Z" stroke="none"/>
    <path d="M-2 -49L-15 -62M2 -49L15 -64M0 -49V-71" stroke-width="4.6" fill="none"/>
    <circle cx="0" cy="-71" r="4.4" stroke="none"/><circle cx="-15" cy="-62" r="4.2" stroke="none"/><circle cx="15" cy="-64" r="4.2" stroke="none"/>
    <path d="${tw}" stroke-width="1.7" fill="none" opacity="0.9"/>
    <path d="M-2 -18h3M0 -33h3" stroke="#23252e" stroke-width="2" opacity="0.4" fill="none"/>
  </g>`;
}

export default function (a) {
  const r = rng(1310);
  let s = fondCiel(a) + astre(a, 150, 58) + etoiles(a, 43, 70);

  // Toits lointains au-dessus de l'anneau — la vieille ville, serrée, éteinte.
  s += toits(17, 192, 42, '#0c0d13', 0.85);

  // La Porte de l'Horloge ferme la perspective. Le cadran n'a plus d'avis.
  s += `<g fill="#0b0c11">
    <rect x="372" y="118" width="56" height="136"/>
    <path d="M366 118h68l-7 -12h-54z"/>
    <path d="M383 106q17 -26 34 0M378 106q22 -34 44 0" stroke="#0b0c11" stroke-width="2.4" fill="none"/>
  </g>
  <circle cx="400" cy="166" r="11" fill="#171821"/>
  <path d="M400 166v-8M400 166l5 3" stroke="#383a45" stroke-width="1.8"/>
  <path d="M386 254v-32q14 -15 28 0v32z" fill="#05060a"/>`;

  // Les façades de l'anneau, en couloir vers la porte. Pas une lumière.
  s += batisse(a, 8, 252, 122, 142, '#101117', 24);
  s += batisse(a, 154, 252, 92, 106, '#0e0f15', 25);
  s += batisse(a, 268, 252, 64, 80, '#0d0e14', 26);
  s += batisse(a, 670, 252, 122, 150, '#101117', 27);
  s += batisse(a, 556, 252, 92, 110, '#0e0f15', 28);
  s += batisse(a, 470, 252, 62, 82, '#0d0e14', 29);

  // Vitrines mortes : verre étoilé à gauche, planches clouées à droite.
  s += `<rect x="24" y="216" width="84" height="36" fill="#07080c"/>
    <path d="M24 216l22 36M82 216l-14 36M58 224l12 28" stroke="#1c1d24" stroke-width="1.8" fill="none"/>
    <path d="M20 216h94l-9 -11h-58z" fill="#161812"/>
    <rect x="688" y="216" width="80" height="36" fill="#07080c"/>
    <path d="M684 250l32 -36M766 216l-44 36" stroke="#1d1a14" stroke-width="5"/>`;

  // La chaussée file droit vers la porte, entre deux trottoirs de pavés.
  s += `<rect x="0" y="252" width="${W}" height="${H - 252}" fill="#121318"/>`;
  s += `<path d="M64 ${H}L374 256M736 ${H}L426 256" stroke="#0a0b10" stroke-width="2.2" fill="none" opacity="0.6"/>`;
  let pav = '';
  for (let i = 0; i < 36; i++) pav += `M${R(r() * W)} ${R(258 + r() * 74)}h7`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.7"/>`;

  // Le kiosque à musique. Plus de fanfare le dimanche — plus de dimanche du tout.
  s += `<ellipse cx="140" cy="303" rx="54" ry="10" fill="#0e0f15"/>
    <path d="M92 296q48 -10 96 0v8q-48 10 -96 0z" fill="#101118"/>
    <rect x="98" y="252" width="84" height="44" fill="#08090e" opacity="0.85"/>
    <path d="M101 296V250M127 294V248M153 294V248M179 296V250" stroke="#0d0e13" stroke-width="2.6"/>
    <path d="M101 280h78M110 280v12M126 280v12M142 280v12M158 280v12" stroke="#0d0e13" stroke-width="1.5" opacity="0.8"/>
    <path d="M86 252q54 -34 108 0z" fill="#0c0d12"/>
    <path d="M140 234v-10" stroke="#0c0d12" stroke-width="2.4"/><circle cx="140" cy="221" r="2.4" fill="#0c0d12"/>`;

  // Une traînée sombre part du kiosque. Quelqu'un n'a pas couru assez vite.
  s += `<path d="M210 300q52 8 96 2l-7 8q-46 5 -82 -4z" fill="#22080a" opacity="0.5"/>`;

  // Terrasses de café renversées : tables au tapis, chaises empilées pour rien.
  s += `<g stroke="#14151c" fill="none" stroke-linecap="round">
    <circle cx="641" cy="318" r="15" stroke-width="5"/><path d="M641 318l24 10" stroke-width="4"/>
    <circle cx="697" cy="328" r="10" stroke-width="4"/>
  </g>`;
  let ch = '';
  for (let i = 0; i < 4; i++) ch += `M${748 + i * 2} ${330 - i * 6}l-8 -12h14l8 12M${754 + i * 2} ${318 - i * 6}l4 -16`;
  s += `<path d="${ch}" stroke="#13141b" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
  // Le parasol, mât tordu, toile crevée — un dernier lambeau garde sa couleur.
  s += `<path d="M676 332L648 254" stroke="#101117" stroke-width="3"/>
    <path d="M648 254l-34 30q16 0 22 -8q-2 12 6 16q4 -10 6 -38" fill="#16161d"/>
    <path d="M648 254l30 26q-14 2 -20 -4q4 12 -4 18q-6 -12 -6 -40" fill="#14151c"/>
    <path d="M640 268l-12 12q9 1 13 -5z" fill="#8a4a20" opacity="0.3"/>`;

  // Carcasses sur la chaussée — la file du mercredi ne redémarrera pas.
  s += carcasse(452, 288, 0.5, '#0e0f14', 11);
  s += carcasse(282, 330, 0.95, '#101117', 7);
  s += lampadaire(560, 306, 56, '#0d0e13', -6);

  // La double rangée de platanes taillés, du fond vers nous.
  const rangs = [
    [362, 266, 0.34, 101], [438, 266, 0.34, 102], [330, 278, 0.5, 103], [470, 278, 0.5, 104],
    [282, 294, 0.68, 105], [518, 294, 0.68, 106], [205, 316, 0.92, 107], [595, 316, 0.92, 108],
    [85, 338, 1.2, 109], [718, 338, 1.2, 110],
  ];
  for (const [tx, ty, ts, tg] of rangs) s += platane(tx, ty, ts, tg);

  // Eux. Ils errent entre les troncs, comme des clients très patients.
  s += zfig(408, 273, 0.4, '#0b0c10', a.nuit, 5);
  s += zfig(243, 280, 0.58, '#0b0c10', a.nuit, -7);
  s += zfig(532, 286, 0.66, '#0a0b10', a.nuit, 12);

  s += brume(a, 254, '#3a4150', 0.14);
  s += neige(33, 26, 0.35);
  s += voileNuit(a);
  return s;
}
