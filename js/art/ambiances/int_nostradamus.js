// Ambiance « Maison de Nostradamus » — le petit musée du mage, dans le noir.
// Intérieur : la fenêtre à meneaux verse le jour de la ruelle, le reste est
// pénombre — vitrines (une brisée), mannequin en robe d'époque, astrolabe,
// livres anciens, et l'escalier étroit qui vrille dans le mur.
import { W, H, R, rng, fenetre, halo, bougie, dots, neige, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1566);
  let s = '';

  // Les murs du XVIe : un jus de pierre et de suie.
  s += `<rect width="${W}" height="${H}" fill="#11100f"/>`;
  // La charpente au plafond — les poutres que Nostradamus regardait déjà.
  s += `<rect width="${W}" height="30" fill="#0d0a08"/>`;
  let pou = '';
  for (let i = 0; i < 7; i++) pou += `<rect x="${R(26 + i * 116 + r() * 12)}" y="0" width="20" height="44" fill="#0a0806"/>`;
  s += pou + `<path d="M0 30H${W}" stroke="#070605" stroke-width="2"/>`;
  // Le sol de tomettes, ciré par quatre siècles de visites.
  s += `<rect x="0" y="252" width="${W}" height="${H - 252}" fill="#1a120e"/>`;
  let tom = '';
  const bandes = [252, 263, 277, 293, 312, 333];
  for (let i = 1; i < bandes.length; i++) {
    tom += `M0 ${bandes[i]}H${W}`;
    const pas = 24 + i * 9;
    for (let x = (i % 2) * pas / 2; x < W; x += pas) tom += `M${R(x)} ${bandes[i - 1]}V${bandes[i]}`;
  }
  s += `<path d="${tom}" stroke="#0e0907" stroke-width="1.3" fill="none" opacity="0.55"/>`;

  // La fenêtre à meneaux : croix de pierre, le ciel du moment sur la ruelle.
  s += `<rect x="80" y="56" width="140" height="168" fill="#1e1b16"/>`;
  s += fenetre(a, 94, 70, 112, 140, 'a', true);
  // Au travers : la façade d'en face, à toucher — la ruelle n'a pas deux mètres.
  s += `<path d="M94 116l30 -20 24 12 30 -16 28 18v100h-112z" fill="#0a0b10" opacity="0.88"/>
    <rect x="126" y="150" width="12" height="18" fill="#06070b"/>`;
  // Le meneau de pierre par-dessus les carreaux.
  s += `<path d="M150 70v140M94 140h112" stroke="#1e1b16" stroke-width="9"/>`;
  // La lumière du dehors s'étale sur les tomettes.
  s += halo(a, 'jour', 152, 266, 170, 52, a.bas, R(0.15 * Math.max(0.18, a.lum)));

  // Le mannequin en robe d'époque, immobile près de la fenêtre. Trop immobile.
  s += `<g transform="translate(268,252) rotate(-2)">
    <ellipse cx="0" cy="2" rx="26" ry="5" fill="#0a0908" opacity="0.7"/>
    <path d="M-26 0Q-19 -52 -8 -66L8 -66Q19 -52 26 0Z" fill="#0c0b0e"/>
    <path d="M-8 -66Q-11 -84 -6 -93L6 -93Q11 -84 8 -66Z" fill="#0d0c10"/>
    <ellipse cx="0" cy="-95" rx="10" ry="3.6" fill="#23201a" opacity="0.85"/>
    <ellipse cx="0" cy="-104" rx="7" ry="8.5" fill="#15130f"/>
    <path d="M-7 -109q7 -7 14 0q-2 -5 -7 -5t-7 5z" fill="#1b1813"/>
    <ellipse cx="-3" cy="-104" rx="2.8" ry="5.5" fill="#8d8268" opacity="${R(0.12 + 0.22 * a.lum)}"/>
  </g>`;

  // L'astrolabe pendu à sa poutre — le laiton accroche ce qui reste de jour.
  s += `<path d="M438 38v51" stroke="#1c1812" stroke-width="1.6"/>
    <g stroke="#c9a227" fill="none">
    <circle cx="438" cy="110" r="21" stroke-width="2" opacity="0.45"/>
    <circle cx="438" cy="110" r="13.5" stroke-width="1.4" opacity="0.32"/>
    <path d="M417 110h42M424 96l28 28" stroke-width="1.4" opacity="0.38"/>
    <circle cx="438" cy="110" r="2" fill="#c9a227" stroke="none" opacity="0.5"/>
  </g>`;

  // Deux vitrines du parcours. Celle de gauche garde son livre ouvert.
  s += `<rect x="330" y="210" width="86" height="42" fill="#131110"/>
    <path d="M336 252v-40M410 252v-40" stroke="#0c0a09" stroke-width="3"/>
    <rect x="336" y="152" width="74" height="58" fill="${a.bas}" opacity="0.05"/>
    <rect x="336" y="152" width="74" height="58" fill="none" stroke="#2b2e35" stroke-width="1.6"/>
    <path d="M344 202l20 -42M354 206l22 -46" stroke="#6a7488" stroke-width="1.2" fill="none" opacity="${R(0.12 * Math.max(0.25, a.lum))}"/>
    <path d="M357 198q8 -6 16 0q8 -6 16 0v6q-8 -5 -16 0q-8 -5 -16 0z" fill="#1f1b14"/>
    <path d="M357 204q16 -6 32 0" stroke="#c9a227" stroke-width="1" fill="none" opacity="0.3"/>`;
  // Celle de droite a été brisée — vidée bien avant toi.
  s += `<rect x="460" y="210" width="86" height="42" fill="#121010"/>
    <path d="M466 252v-40M540 252v-40" stroke="#0c0a09" stroke-width="3"/>
    <rect x="466" y="152" width="74" height="58" fill="${a.bas}" opacity="0.03"/>
    <rect x="466" y="152" width="74" height="58" fill="none" stroke="#2b2e35" stroke-width="1.6"/>
    <path d="M497 172l-14 -9M497 172l9 -16M497 172l16 6M497 172l-4 17M510 152l7 13 8 -9 6 11" stroke="#3c424d" stroke-width="1.2" fill="none" opacity="0.7"/>`;
  // Le verre au sol, qui brille à peine dans la pénombre.
  const ec = [];
  for (let i = 0; i < 12; i++) ec.push([R(470 + r() * 92), R(256 + r() * 14)]);
  s += dots(ec, 1.6, '#7c8694', R(0.22 * Math.max(0.2, a.lum)));
  // Le cordon de visite pend toujours entre ses poteaux.
  s += `<path d="M322 262v-36M556 262v-36" stroke="#16130f" stroke-width="4"/>
    <circle cx="322" cy="223" r="3.5" fill="#16130f"/><circle cx="556" cy="223" r="3.5" fill="#16130f"/>
    <path d="M322 230Q439 252 556 230" stroke="#5b1721" stroke-width="3" fill="none" opacity="0.85"/>`;

  // L'étagère des livres anciens — Centuries, almanachs, remèdes contre la peste.
  s += `<rect x="566" y="96" width="112" height="156" fill="#0e0b08"/>
    <rect x="572" y="104" width="100" height="144" fill="#0a0806"/>
    <path d="M572 132h100M572 170h100M572 208h100" stroke="#15110c" stroke-width="4"/>`;
  let lv1 = '', lv2 = '';
  for (let j = 0; j < 4; j++) {
    const by = j < 3 ? 130 + j * 38 : 245;
    for (let bx = 576; bx < 668; bx += 7) {
      if (r() < 0.14) continue;
      const hh = R(16 + r() * 9), seg = `M${bx} ${by}v${-hh}`;
      if (r() < 0.5) lv1 += seg; else lv2 += seg;
    }
  }
  s += `<path d="${lv1}" stroke="#16120c" stroke-width="5" fill="none"/>
    <path d="${lv2}" stroke="#1c1610" stroke-width="5" fill="none"/>`;
  // Un volume tombé, resté ouvert face contre terre.
  s += `<path d="M596 262l10 -5 10 5 -2 3 -8 -4 -8 4z" fill="#1c1610"/>`;

  // L'escalier étroit, creusé dans l'épaisseur du mur. Il monte dans le noir.
  s += `<rect x="686" y="82" width="110" height="12" fill="#14100b"/>
    <rect x="692" y="94" width="98" height="158" fill="#060709"/>
    <path d="M692 252h18v-15h18v-15h18v-15h18v-15h18v-15h8V252Z" fill="#15110c"/>
    <path d="M692 252h18M710 237h18M728 222h18M746 207h18M764 192h18" stroke="#221b12" stroke-width="1.5" fill="none"/>
    <path d="M700 224L780 156" stroke="#1f1812" stroke-width="3.5"/>
    <path d="M714 240v-12M738 220v-12M762 200v-12" stroke="#1f1812" stroke-width="2"/>
    <rect x="692" y="94" width="98" height="42" fill="#04050a" opacity="0.8"/>`;

  // Quand le jour faiblit, une bougie veille au pied du mannequin.
  if (a.lum < 0.5) s += bougie(a, 238, 244, 'bg1');
  // Poussière en suspension dans le rai de la fenêtre.
  if (a.lum > 0.3) s += neige(7, 12, R(0.10 * a.lum), 100, 230, 80, 244);

  // Le musée reste plongé dans sa pénombre, même en plein midi.
  s += voileNuit(a, 1.3);
  return s;
}
