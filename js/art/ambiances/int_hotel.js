// Ambiance « Grand Hôtel de la Poste » — la chambre 203, vingt-trois jours de siège.
// Intérieur : la lumière n'entre que par la fenêtre (ciel dynamique), le reste
// est mangé d'ombre. Matelas au sol, bouteilles, la porte barricadée.
import { W, H, R, rng, fondCiel, fenetre, halo, bougie, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(203);
  let s = '';

  // Le mur du fond, sombre — la pièce est dans son jus de pénombre.
  s += `<rect width="${W}" height="${H}" fill="#100f12"/>`;
  // Plancher : lattes fatiguées.
  s += `<rect x="0" y="245" width="${W}" height="${H - 245}" fill="#15120d"/>`;
  let lattes = '';
  for (let i = 0; i < 9; i++) lattes += `M0 ${R(252 + i * 11)}H${W}`;
  s += `<path d="${lattes}" stroke="#0c0a07" stroke-width="1.4" opacity="0.8" fill="none"/>`;

  // La fenêtre, source unique de lumière : le ciel du moment au-dessus de la place.
  s += fenetre(a, 320, 60, 170, 150, 'a', true);
  // Au travers : les toits d'en face, découpés dans le ciel.
  s += `<path d="M325 150l40 -22 38 12 30 -16 32 20v66h-140z" fill="#0a0b10" opacity="0.9"/>`;
  // La lumière de la fenêtre s'écrase sur le plancher.
  s += halo(a, 'jour', 405, 260, 190, 60, a.bas, R(0.16 * Math.max(0.18, a.lum)));
  // Rideau pendu, à moitié arraché.
  s += `<path d="M308 52q14 80 2 162l16 -6q8 -78 -2 -150z" fill="#1a161c"/>
    <path d="M502 52q-12 84 0 160l-16 -8q-8 -76 2 -146z" fill="#1a161c"/>`;

  // Le matelas au sol, la couverture en boule.
  s += `<g fill="#1d1a16"><rect x="70" y="262" width="170" height="40" rx="7"/>
    <path d="M95 262q40 -18 95 -4q22 6 8 12q-60 -10 -103 -8z" fill="#211d18"/></g>`;
  // Bouteilles le long du mur — les nuits comptées en verre vide.
  let btl = '';
  for (let i = 0; i < 6; i++) {
    const bx = R(560 + i * 26 + r() * 8);
    btl += `<path d="M${bx} 300v-16q0 -5 3 -7v-7h4v7q3 2 3 7v16z"/>`;
  }
  s += `<g fill="#13161a" opacity="0.95">${btl}</g>`;

  // La porte du couloir, barricadée : planches en croix, commode poussée contre.
  s += `<rect x="640" y="120" width="92" height="180" fill="#171410"/>
    <rect x="648" y="128" width="76" height="164" fill="#120f0c"/>
    <path d="M636 160l100 50M736 150l-100 56" stroke="#241e14" stroke-width="9" stroke-linecap="round"/>
    <rect x="624" y="232" width="120" height="68" fill="#1b1712"/>
    <path d="M634 248h100M634 270h100" stroke="#120f0b" stroke-width="3"/>`;
  // Griffures en bas de la porte — ils savent qu'on est là.
  s += `<path d="M652 286l8 -16M664 288l7 -14M676 288l6 -15" stroke="#2e2417" stroke-width="1.6" fill="none"/>`;

  // La radio à piles sur sa caisse, et la bougie qui veille à côté.
  s += `<rect x="120" y="216" width="56" height="30" fill="#191510"/>
    <rect x="128" y="190" width="40" height="26" rx="3" fill="#15171c"/>
    <circle cx="139" cy="203" r="6" fill="none" stroke="#0c0d11" stroke-width="2"/>
    <path d="M160 190l16 -18" stroke="#15171c" stroke-width="2.2"/>`;
  if (a.lum < 0.5) s += bougie(a, 196, 212, 'bg1');

  // Poussière en suspension dans le rai de lumière.
  if (a.lum > 0.3) s += neige(77, 14, R(0.12 * a.lum), 330, 480, 80, 250);

  // Une chambre aveugle reste sombre, même à midi.
  s += voileNuit(a, 1.25);
  return s;
}
