// Ambiance « Le triage de Miramas » — la plus grande gare de triage du sud-est.
// Extérieur : faisceaux de voies qui filent vers un point de fuite, files de
// trémies et de citernes rouillées, portique de grue, caténaires, château d'eau.
// La brume traîne au ras des rails ; eux, ils traînent entre les wagons.
import {
  W, H, R, rng, fondCiel, astre, etoiles, neige, brume, toits, zfig, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(8000);
  let s = fondCiel(a) + astre(a, 212, 54) + etoiles(a, 73, 64);

  // Au fond, la zone logistique : Clésud, des kilomètres de toits plats.
  s += toits(17, 212, 20, '#090a0f', 0.7);
  s += `<path d="M0 234v-32h238l10 8v24z" fill="#0b0c11"/>
    <path d="M556 234v-24l12 -8h232v32z" fill="#0b0c11"/>`;

  // Le château d'eau ferroviaire : la cuve sur pylônes, pleine à ras bord.
  s += `<g fill="#0c0d13" stroke="#0c0d13">
    <path d="M80 108l44 -20 44 20z"/>
    <rect x="86" y="106" width="76" height="46" rx="6"/>
    <path d="M96 150l-8 78M152 150l8 78M112 150l-4 78M136 150l4 78" stroke-width="4" fill="none"/>
    <path d="M92 188h64M96 168l54 20M150 168l-54 20" stroke-width="2" fill="none"/>
    <path d="M124 152v76" stroke-width="3" fill="none"/>
  </g>`;

  // Le portique de grue, jambes écartées au-dessus des voies, crochet pendu.
  s += `<g fill="#0b0c11" stroke="#0b0c11">
    <rect x="348" y="86" width="304" height="11"/>
    <path d="M364 230L386 97M404 230L390 97M636 230L614 97M596 230L610 97" stroke-width="5" fill="none"/>
    <path d="M372 196h28M380 160h22M628 196h-28M620 160h-22" stroke-width="2.4" fill="none"/>
    <rect x="498" y="97" width="30" height="10"/>
    <path d="M513 107v50" stroke-width="1.6" fill="none"/>
    <path d="M513 157v8q-6 6 -1 11" stroke-width="2.6" fill="none"/>
  </g>`;

  // Les caténaires : une file de poteaux qui rapetisse vers le nord, fil tendu.
  s += `<path d="M762 316v-96h-36M688 288v-70h-27M636 268v-52h-20M600 254v-38h-15M576 245v-27h-10"
    stroke="#0d0e13" stroke-width="2.6" fill="none"/>
  <path d="M762 220L688 218L636 216L600 216L576 218" stroke="#14151c" stroke-width="1.2" fill="none" opacity="0.8"/>`;

  // Le sol du triage : ballast, puis l'éventail des voies vers le point de fuite.
  s += `<rect x="0" y="228" width="${W}" height="${H - 228}" fill="#101116"/>`;
  let rails = '';
  for (const ex of [-140, -30, 70, 165, 255, 350, 470, 565, 660, 770, 880, 990]) rails += `M424 234L${ex} 344`;
  s += `<path d="${rails}" stroke="#1c1e26" stroke-width="1.5" fill="none" opacity="0.85"/>`;
  // Deux rails accrochent ce qui reste de lumière.
  s += `<path d="M424 234L210 344M424 234L640 344" stroke="#2e323e" stroke-width="1.8" fill="none" opacity="${R(0.2 + 0.3 * a.lum)}"/>`;
  // Les aiguillages : des voies qui se croisent sans plus mener nulle part.
  s += `<path d="M310 292Q390 266 478 262M540 288Q458 262 384 258" stroke="#22242e" stroke-width="1.4" fill="none" opacity="0.7"/>`;
  let bal = '';
  for (let i = 0; i < 38; i++) bal += `M${R(r() * W)} ${R(240 + r() * 96)}h6`;
  s += `<path d="${bal}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.5"/>`;

  // Le faisceau ouest : une file de trémies à grain, éventrées par la rouille.
  for (const [hx, hy, hs] of [[318, 252, 0.35], [270, 260, 0.46], [208, 271, 0.6], [118, 286, 0.78], [8, 304, 1]]) {
    s += `<g transform="translate(${hx},${hy}) scale(${hs})" fill="#0d0e14">
      <path d="M2 -40h60v4h-60z" fill="#101117"/>
      <path d="M0 -36h64l-6 18-10 12h-32l-10 -12z"/>
      <circle cx="14" cy="-2" r="4.5" fill="#08090d"/><circle cx="50" cy="-2" r="4.5" fill="#08090d"/>
    </g>`;
  }
  // Le faisceau est : les wagons-citernes, à perte de vue eux aussi.
  for (const [cx, cy, cs] of [[508, 257, 0.4], [548, 270, 0.55], [608, 288, 0.74], [694, 312, 1]]) {
    s += `<g transform="translate(${cx},${cy}) scale(${cs})" fill="#0e0f15">
      <rect x="0" y="-30" width="74" height="22" rx="11"/>
      <rect x="30" y="-35" width="13" height="7" rx="3"/>
      <path d="M0 -8h74" stroke="#08090d" stroke-width="2"/>
      <circle cx="16" cy="-3" r="4.5" fill="#08090d"/><circle cx="58" cy="-3" r="4.5" fill="#08090d"/>
    </g>`;
  }
  // Sur la citerne de tête : le pictogramme orange délavé, et la rouille qui pleure.
  s += `<rect x="725" y="294" width="10" height="10" transform="rotate(45 730 299)" fill="#8a4a20" opacity="0.4"/>
    <path d="M706 296q1 8 0 14M752 292q2 9 1 16" stroke="#8a4a20" stroke-width="1.6" fill="none" opacity="0.28"/>`;

  // Eux. Entre les wagons, dans les couloirs d'ombre, ils attendent un bruit.
  s += zfig(352, 286, 0.55, '#0b0c10', a.nuit, -7);
  s += zfig(452, 268, 0.42, '#0c0d12', a.nuit, 11);
  s += zfig(388, 300, 0.68, '#0a0b10', a.nuit, 5);

  // La brume rampe au ras des rails — elle, au moins, ne fait pas de bruit.
  s += brume(a, 226, '#3a4150', 0.17);
  s += brume(a, 282, '#39404e', 0.11, 'b');
  s += neige(57, 26, 0.35);
  s += voileNuit(a);
  return s;
}
