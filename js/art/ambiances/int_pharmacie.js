// Ambiance « Pharmacie du Cours » — 42 cours Victor Hugo, la croix verte éteinte.
// Intérieur : la vitrine laisse entrer le ciel du moment sur une officine
// retournée — rayonnages blancs à terre, boîtes en vrac, rideau ouvert sur du noir.
import { W, H, R, rng, fenetre, halo, dots, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(42);
  let s = '';

  // Les murs de l'officine, gris de poussière.
  s += `<rect width="${W}" height="${H}" fill="#0f1014"/>`;
  // Fantômes clairs des étagères murales arrachées.
  s += `<rect x="420" y="96" width="150" height="10" fill="#16171c"/>
    <rect x="432" y="128" width="126" height="10" fill="#15161b"/>`;

  // Carrelage de pharmacie, damier fatigué sous les gravats.
  s += `<rect x="0" y="242" width="${W}" height="${H - 242}" fill="#131419"/>`;
  let car = '';
  for (let i = 0; i < 8; i++) car += `M0 ${R(250 + i * 12)}H${W}`;
  for (let i = 0; i < 16; i++) car += `M${R(20 + i * 50 + r() * 18)} 250v82`;
  s += `<path d="${car}" stroke="#0c0d11" stroke-width="1.3" opacity="0.7" fill="none"/>`;

  // La vitrine sur le cours : deux baies et la porte vitrée, seules sources de jour.
  s += fenetre(a, 46, 56, 112, 164, 'va', true);
  s += fenetre(a, 170, 56, 112, 164, 'vb');
  s += fenetre(a, 296, 76, 60, 144, 'vp');
  // La barre de la porte, et l'affiche des ordonnances qui se décolle du verre.
  s += `<path d="M296 150h60" stroke="#101116" stroke-width="6"/>
    <rect x="312" y="104" width="26" height="34" fill="#2c2b29" opacity="0.5" transform="rotate(5 325 121)"/>`;

  // La croix de pharmacie pendue dehors, éteinte — découpée sur le ciel.
  s += `<g transform="translate(101,106)">
    <path d="M-9 -27h18v18h18v18h-18v18h-18v-18h-18v-18h18z" fill="#0c100d"/>
    <path d="M-9 -27h18v18h18v18h-18v18h-18v-18h-18v-18h18z" fill="none" stroke="#1e2f23" stroke-width="1.6" opacity="0.5"/>
    <path d="M27 0h26" stroke="#0c100d" stroke-width="5"/>
  </g>`;
  // Les façades d'en face, mortes, au bas de la deuxième baie.
  s += `<path d="M174 170l28 -14 26 9 24 -13 28 15v51h-106z" fill="#0a0b10" opacity="0.9"/>`;

  // La lumière du dehors s'étale sur le carrelage.
  s += halo(a, 'jour', 200, 262, 235, 58, a.bas, R(0.16 * Math.max(0.16, a.lum)));
  // Verre étoilé tombé au pied de la baie fendue.
  const ve = []; for (let i = 0; i < 12; i++) ve.push([R(60 + r() * 130), R(246 + r() * 26)]);
  s += dots(ve, 1.5, '#3d4148', 0.4);

  // Un rayonnage blanc couché en travers de la flaque de jour.
  s += `<g transform="translate(152,304)">
    <rect x="0" y="-22" width="168" height="26" fill="#26272d"/>
    <path d="M34 -22v26M76 -22v26M118 -22v26" stroke="#0d0e12" stroke-width="2"/>
    <rect x="0" y="-22" width="168" height="5" fill="#2e2f36"/>
  </g>`;

  // Le comptoir, blanc sous la crasse — sa petite croix peinte ne promet plus rien.
  s += `<rect x="460" y="198" width="190" height="98" fill="#24252b"/>
    <rect x="452" y="192" width="206" height="10" fill="#2e2f36"/>
    <path d="M478 214v74M620 214v74" stroke="#16171c" stroke-width="2"/>
    <path d="M544 232h12v12h12v12h-12v12h-12v-12h-12v-12h12z" fill="#22311f" opacity="0.8"/>`;
  // La caisse, tiroir ouvert sur rien.
  s += `<rect x="586" y="170" width="44" height="24" rx="3" fill="#14161b"/>
    <rect x="582" y="190" width="52" height="6" fill="#101116"/>`;

  // Le deuxième rayonnage a basculé contre le comptoir, vidé dans sa chute.
  s += `<g transform="translate(404,300) rotate(33)">
    <rect x="-22" y="-142" width="44" height="142" fill="#2a2b32"/>
    <path d="M-22 -36h44M-22 -72h44M-22 -108h44" stroke="#0d0e12" stroke-width="2.4"/>
    <rect x="-22" y="-142" width="5" height="142" fill="#32333b"/>
  </g>`;

  // Boîtes de médicaments en vrac — celles que des mains tremblantes ont laissées.
  let bts = '';
  for (let i = 0; i < 13; i++) {
    const bx = R(70 + r() * 560), by = R(252 + r() * 66), rot = R(r() * 36 - 18);
    bts += `<rect x="${bx}" y="${by}" width="10" height="5.5" transform="rotate(${rot} ${bx} ${by})"/>`;
  }
  s += `<g fill="#1f2126" opacity="0.95">${bts}</g>`;
  // Deux taches discrètes dans le tas : un étui bordeaux, un autre or passé.
  s += `<rect x="318" y="268" width="11" height="6" fill="#5b1620" opacity="0.8" transform="rotate(-12 318 268)"/>
    <rect x="492" y="306" width="11" height="6" fill="#6b5a23" opacity="0.7" transform="rotate(9 492 306)"/>`;

  // Ordonnances tamponnées, jamais servies, semées du comptoir jusqu'à la porte.
  let ord = '';
  for (let i = 0; i < 7; i++) {
    const ox = R(340 + r() * 280), oy = R(258 + r() * 58);
    ord += `<rect x="${ox}" y="${oy}" width="13" height="7" transform="rotate(${R(r() * 40 - 20)} ${ox} ${oy})"/>`;
  }
  s += `<g fill="#34343a" opacity="0.5">${ord}</g>`;

  // Le fauteuil roulant de l'allée orthopédie, tourné vers la porte. Vide.
  s += `<g transform="translate(672,300)" stroke="#101116" fill="none" stroke-width="3">
    <circle cx="0" cy="-16" r="15"/>
    <path d="M0 -16l9 -11M0 -16l-13 -5M0 -16l3 14"/>
    <circle cx="20" cy="-7" r="5.5"/>
    <path d="M-7 -52q14 -2 16 12l3 16h12M-7 -52l-3 -8" stroke-width="3.6"/>
  </g>`;

  // Le rideau de l'arrière-boutique, entrouvert sur un noir complet.
  s += `<rect x="706" y="88" width="84" height="208" fill="#030408"/>
    <path d="M706 88v208M790 88v208" stroke="#1a1b20" stroke-width="4"/>
    <rect x="700" y="84" width="96" height="7" fill="#1a1b20"/>
    <path d="M706 91q-4 100 0 205h32q6 -104 1 -199q-16 -4 -33 -6z" fill="#1c1a1f"/>
    <path d="M716 100q3 90 -1 190M727 102q4 88 0 186" stroke="#121017" stroke-width="1.6" fill="none"/>`;

  // Poussière en suspension dans le rai de la vitrine.
  if (a.lum > 0.3) s += neige(77, 14, R(0.12 * a.lum), 60, 360, 70, 240);

  // Une officine qui ne tient le jour que de sa vitrine reste grise, même à midi.
  s += voileNuit(a, 1.25);
  return s;
}
