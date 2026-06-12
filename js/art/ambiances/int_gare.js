// Ambiance « Gare de Salon — les quais » — la halle de la ligne Avignon–Miramas, PK 56.
// Intérieur : le ciel n'entre que par la verrière en sheds, crevée par endroits,
// entre les poutrelles noires. Un train de marchandises dort le long du quai 1 —
// et au bout, sous le pignon vitré, le locotracteur orange. La sortie de Salon.
import {
  W, H, R, rng, fenetre, halo, bougie, brume, neige, zfig, dots, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(5600);
  let s = '';

  // La halle : une pénombre de fer, de suie et de gasoil froid.
  s += `<rect width="${W}" height="${H}" fill="#0e0f14"/>`;
  // Le mur du fond, côté bâtiment voyageurs.
  s += `<rect x="0" y="104" width="${W}" height="154" fill="#111218"/>`;
  // Des affiches de destinations ensoleillées, délavées jusqu'au cadre.
  s += `<rect x="200" y="130" width="34" height="44" fill="#181a21" opacity="0.7"/>
    <rect x="470" y="132" width="34" height="42" fill="#161820" opacity="0.7"/>
    <path d="M470 132l11 13v-13z" fill="#0e0f14"/>`;

  // Le pignon vitré du bout de la halle : le ciel en grand, derrière la machine.
  s += fenetre(a, 664, 122, 116, 102, 'g');
  s += halo(a, 'fin', 722, 212, 130, 84, a.bas, R(0.16 * Math.max(0.18, a.lum)));

  // La fosse des voies, et les rails qui filent vers Miramas sans plus rien dessus.
  s += `<rect x="0" y="240" width="${W}" height="18" fill="#08090d"/>
    <path d="M0 246H${W}M0 253H${W}" stroke="#262a33" stroke-width="1.6" opacity="0.35" fill="none"/>`;

  // Le quai 1 : dalles grasses, feuilles de platane, bande d'éveil que plus personne ne respecte.
  s += `<rect x="0" y="258" width="${W}" height="${H - 258}" fill="#14151a"/>
    <rect x="0" y="258" width="${W}" height="3" fill="#43464f" opacity="0.22"/>`;
  let dal = '';
  for (let i = 0; i < 30; i++) dal += `M${R(r() * W)} ${R(268 + r() * 64)}h7`;
  s += `<path d="${dal}" stroke="#0c0d11" stroke-width="1.8" fill="none" opacity="0.7"/>`;

  // Le train de marchandises, à l'arrêt depuis le 19. Personne ne viendra le décharger.
  for (let i = 0; i < 3; i++) {
    const wx = 44 + i * 174;
    s += `<g>
      <path d="M${wx} 192q79 -11 158 0z" fill="#0d0e13"/>
      <rect x="${wx}" y="192" width="158" height="50" fill="#101117"/>
      <rect x="${wx + 58}" y="196" width="44" height="46" fill="#0c0d12"/>
      <path d="M${wx + 14} 196v42M${wx + 36} 196v42M${wx + 124} 196v42M${wx + 144} 196v42" stroke="#08090d" stroke-width="2" opacity="0.6" fill="none"/>
      <circle cx="${wx + 30}" cy="250" r="7.5" fill="#07080b"/><circle cx="${wx + 128}" cy="250" r="7.5" fill="#07080b"/>
    </g>`;
    if (i < 2) s += `<path d="M${wx + 158} 236h16" stroke="#0a0b10" stroke-width="4"/>`;
  }

  // Quelque chose se tient entre le dernier wagon et la machine. Ça ne bouge presque pas.
  s += zfig(592, 226, 0.55, '#0b0c10', a.nuit, 5);

  // Le locotracteur Y 8000 — orange sous la crasse, diesel, increvable. L'espoir du chapitre.
  s += `<g>
    <rect x="640" y="238" width="138" height="10" fill="#0d0e13"/>
    <rect x="648" y="212" width="96" height="26" rx="2" fill="#8a4a20"/>
    <rect x="742" y="190" width="34" height="48" rx="2" fill="#8a4a20"/>
    <rect x="742" y="186" width="36" height="6" rx="2" fill="#101117"/>
    <rect x="748" y="196" width="20" height="14" fill="#0c0e13"/>
    <rect x="662" y="202" width="7" height="10" rx="2" fill="#101117"/>
    <path d="M650 210h92" stroke="#101117" stroke-width="2.2"/>
    <path d="M676 216v18M692 216v18M708 216v18" stroke="#5d3014" stroke-width="2" opacity="0.7"/>
    <path d="M656 226q22 7 44 2" stroke="#5d3014" stroke-width="5" opacity="0.5" fill="none"/>
    <circle cx="650" cy="220" r="2.6" fill="#15171d"/>
    <rect x="634" y="228" width="6" height="8" fill="#101117"/>
    <circle cx="672" cy="250" r="8" fill="#07080b"/><circle cx="750" cy="250" r="8" fill="#07080b"/>
    <path d="M776 192v44" stroke="${a.bas}" stroke-width="1.4" opacity="${R(0.3 * Math.max(0.15, a.lum))}"/>
  </g>`;

  // Les piliers de fonte, gros comme des troncs, qui tiennent la halle depuis toujours.
  for (const px of [142, 388, 612]) {
    s += `<g fill="#0a0b10">
      <rect x="${px}" y="108" width="9" height="160"/>
      <path d="M${px - 9} 108h27l-5 14h-17z"/>
      <path d="M${px - 4} 268h17l4 8h-25z"/>
      <path d="M${px - 5} 130h19" stroke="#0a0b10" stroke-width="3"/>
    </g>`;
  }

  // Le plafond : la grande poutre, le treillis, et les sheds — quatre pans de ciel inclinés.
  s += `<rect width="${W}" height="108" fill="#0b0c11"/>`;
  const sheds = [56, 238, 420, 602];
  for (let i = 0; i < 4; i++) {
    s += `<g transform="rotate(-8 ${sheds[i] + 70} 54)">${fenetre(a, sheds[i], 18, 140, 66, 'v' + i, i === 2)}</g>`;
  }
  let aretes = '';
  for (const px of sheds) aretes += `M${px - 10} 100l26 -88`;
  s += `<path d="${aretes}" stroke="#07080c" stroke-width="9" fill="none"/>`;
  s += `<rect x="0" y="100" width="${W}" height="10" fill="#07080c"/>`;
  let treillis = '';
  for (let x = 0; x < W; x += 40) treillis += `M${x} 100l20 -12l20 12`;
  s += `<path d="${treillis}" stroke="#07080c" stroke-width="2.4" fill="none" opacity="0.9"/>`;

  // Le panneau du quai pend sur son dernier boulon. Plus besoin de savoir où on est.
  s += `<path d="M318 110l8 22" stroke="#101218" stroke-width="2.4"/>
    <g transform="rotate(13 326 132)"><rect x="288" y="132" width="78" height="17" rx="3" fill="#171a20" stroke="#23262d" stroke-width="1.6"/></g>`;

  // La lumière tombe des sheds en nappes obliques et s'écrase sur le quai.
  for (let i = 0; i < 4; i++) {
    const px = sheds[i];
    s += `<path d="M${px + 16} 102L${px + 128} 102L${px + 92} 266L${px - 22} 266Z" fill="${a.bas}" opacity="${R(0.06 * a.lum)}"/>`;
    s += halo(a, 'p' + i, px + 48, 264, 108, 24, a.bas, R(0.12 * Math.max(0.14, a.lum)));
  }

  // Sous le shed crevé : du verre au sol, et ce qui tombe du ciel avec la lumière.
  const verre = [];
  for (let i = 0; i < 10; i++) verre.push([R(412 + r() * 90), R(262 + r() * 16)]);
  s += dots(verre, 1.5, '#3d4250', 0.35);
  s += neige(91, 14, R(0.14 * Math.max(a.lum, 0.1)), 408, 530, 96, 256);

  // Des bâches sur des formes, le long du quai. On ne soulève pas. On sait déjà.
  s += `<path d="M84 324q12 -26 48 -29q42 -3 56 29z" fill="#191b21"/>
    <path d="M108 300q8 14 4 24M138 296q2 16 -2 28" stroke="#0e0f14" stroke-width="1.6" fill="none"/>
    <rect x="86" y="318" width="9" height="6" fill="#0d0e13"/><rect x="180" y="318" width="9" height="6" fill="#0d0e13"/>
    <path d="M212 328q8 -19 32 -20q26 0 32 20z" fill="#15171d"/>
    <path d="M236 312q4 9 2 16" stroke="#0d0e13" stroke-width="1.4" fill="none"/>
    <ellipse cx="118" cy="323" rx="15" ry="3" fill="#a31621" opacity="0.16"/>`;

  // Un chariot à bagages, et les valises que personne n'est revenu chercher.
  s += `<g stroke="#101218" fill="none" stroke-width="3">
    <path d="M560 312h64M620 312v-26"/>
    <circle cx="572" cy="318" r="5" fill="#0a0b10" stroke="none"/><circle cx="612" cy="318" r="5" fill="#0a0b10" stroke="none"/>
  </g>
  <rect x="652" y="300" width="26" height="16" rx="2" fill="#14161c"/>
  <rect x="684" y="306" width="20" height="12" rx="2" fill="#111318" transform="rotate(-9 694 312)"/>`;

  // Quelqu'un a campé au pied du pilier. La bougie est restée — elle veille encore, parfois.
  s += `<path d="M158 308q14 -10 34 -2q10 5 -2 9q-22 5 -32 -7z" fill="#1b1812"/>`;
  if (a.lum < 0.5) s += bougie(a, 200, 302, 'bg1');

  // L'air froid stagne au ras des voies.
  s += brume(a, 238, '#3a4150', 0.1);
  // Même à midi, la halle garde son jus de pénombre.
  s += voileNuit(a, 1.2);
  return s;
}
