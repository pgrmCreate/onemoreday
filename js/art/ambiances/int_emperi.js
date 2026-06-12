// Ambiance « Château de l'Empéri » — la grande salle voûtée du musée militaire.
// Intérieur : le jour n'entre que par les meurtrières, trois lames de ciel
// taillées dans deux mètres de mur. Les armures montent une garde que plus
// personne ne relève — l'une d'elles est tombée, ou on l'a fait tomber.
import { W, H, R, rng, fondCiel, halo, bougie, neige, voileNuit } from '../ambiance_lib.js';

// Une armure en faction sur son socle. `arme` : une hallebarde au poing.
function armure(x, y, s, arme = false) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-26" y="-8" width="52" height="8" fill="#0b0b0f"/>
    <path d="M-9 -8v-26h6v21h6v-21h6v26z" fill="#15171f"/>
    <path d="M-13 -34q-4 -20 2 -29h22q6 9 2 29q-13 5 -26 0z" fill="#181a22"/>
    <path d="M-16 -58q-7 3 -8 14l-1 8M16 -58q7 3 8 14l1 8" stroke="#15171f" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="-72" rx="9" ry="10" fill="#14161d"/>
    <path d="M-6 -71h12" stroke="#06070b" stroke-width="2.2"/>
    <path d="M-4 -77q4 -3 8 0" stroke="#262932" stroke-width="1.3" fill="none" opacity="0.7"/>
    ${arme ? `<path d="M24 -8v-96" stroke="#101216" stroke-width="3"/><path d="M24 -104l11 4l-7 11l-4 -3z" fill="#13141a"/>` : ''}
  </g>`;
}

export default function (a) {
  const r = rng(1190);
  // Le gradient de ciel est défini par fondCiel, puis la salle le recouvre :
  // il ne survivra qu'au fond des meurtrières.
  let s = fondCiel(a) + `<rect width="${W}" height="${H}" fill="#0d0d12"/>`;

  // La voûte en berceau : la travée proche, remplie de pierre sombre.
  s += `<path d="M30 252A370 232 0 0 1 770 252Z" fill="#161410"/>`;
  // Le fond de la salle, une travée plus loin, une ombre plus bas.
  s += `<path d="M150 252A250 162 0 0 1 650 252Z" fill="#121014"/>`;
  // Les arcs doubleaux se répondent jusqu'au noir.
  s += `<path d="M30 252A370 232 0 0 1 770 252" stroke="#1c1914" stroke-width="9" fill="none"/>
    <path d="M86 252A314 196 0 0 1 714 252" stroke="#0a0a0e" stroke-width="7" fill="none" opacity="0.9"/>
    <path d="M150 252A250 162 0 0 1 650 252" stroke="#08090d" stroke-width="6" fill="none" opacity="0.9"/>`;
  // Les claveaux de l'arc d'entrée, posés là il y a mille ans.
  let vous = '';
  for (let i = 0; i < 20; i++) {
    const th = (15 + i * 7.9) * Math.PI / 180, c = Math.cos(th), si = Math.sin(th);
    vous += `M${R(400 + 370 * c)} ${R(252 - 232 * si)}L${R(400 + 386 * c)} ${R(252 - 242 * si)}`;
  }
  s += `<path d="${vous}" stroke="#0a0a0d" stroke-width="1.6" fill="none" opacity="0.7"/>`;
  // Joints de pierre du mur du fond, à peine lisibles.
  let pier = '';
  for (let i = 0; i < 18; i++) pier += `M${R(190 + r() * 420)} ${R(118 + r() * 112)}h9`;
  s += `<path d="${pier}" stroke="#1f1b15" stroke-width="1.2" fill="none" opacity="0.35"/>`;

  // Le dallage, usé en cuvette par les gardes puis par les visites guidées.
  s += `<rect x="0" y="250" width="${W}" height="${H - 250}" fill="#15130e"/>`;
  let dal = '';
  for (let i = 0; i < 4; i++) dal += `M0 ${R(266 + i * 19)}H${W}`;
  for (let i = 0; i < 24; i++) dal += `M${R(r() * W)} ${R(251 + Math.floor(r() * 4) * 19)}v17`;
  s += `<path d="${dal}" stroke="#0c0b08" stroke-width="1.5" fill="none" opacity="0.7"/>`;

  // Les meurtrières — trois lames de ciel dans l'épaisseur de la muraille.
  [295, 395, 495].forEach((mx, i) => {
    s += `<path d="M${mx - 7} 193l3 -88h18l3 88z" fill="#1c1812" opacity="0.55"/>`;
    s += `<rect x="${mx}" y="110" width="10" height="75" fill="url(#${a.p}-ciel)"/>`;
    s += `<rect x="${mx}" y="110" width="10" height="75" fill="none" stroke="#06070b" stroke-width="2.5"/>`;
    // Le rai tombe en biais et s'écrase sur les dalles.
    s += `<path d="M${mx - 1} 185h12l24 117h-60z" fill="${a.bas}" opacity="${R(0.05 + 0.07 * a.lum)}"/>`;
    s += halo(a, 'rai' + i, mx + 5, 300, 58, 13, a.bas, R(0.2 * Math.max(0.12, a.lum)));
  });

  // Le râtelier de hampes : lances et hallebardes au garde-à-vous. Un crochet vide.
  s += `<path d="M84 300v-90M188 300v-90M78 214h116M78 266h116" stroke="#0e0f14" stroke-width="5" fill="none"/>
    <path d="M102 298l5 -146M130 298l1 -150M158 298l-3 -148" stroke="#121318" stroke-width="3" fill="none"/>
    <path d="M103 152l4 -16l4 16q-4 5 -8 0z" fill="#15161c"/>
    <path d="M127 148l4 -17l4 17q-4 5 -8 0z" fill="#15161c"/>
    <path d="M155 150l9 2l-2 12l-9 -1q-3 -7 2 -13z" fill="#13141a"/>`;
  // Au mur, le râtelier des sabres — il en manque un depuis peu.
  s += `<path d="M520 126h90" stroke="#0e0f14" stroke-width="4"/>
    <path d="M530 130q-3 24 8 42M558 130q-3 24 8 42" stroke="#13141b" stroke-width="3" fill="none"/>
    <path d="M527 128h7M555 128h7M583 128h7" stroke="#1d1e26" stroke-width="2.4"/>`;

  // Les armures en faction, et celle qui ne se relèvera pas.
  s += armure(235, 296, 1.05);
  s += armure(590, 300, 1.15, true);
  s += `<g transform="translate(330,306)">
    <ellipse cx="34" cy="5" rx="42" ry="5" fill="#22080a" opacity="0.45"/>
    <path d="M0 0q4 -16 20 -18l34 6q10 6 4 14z" fill="#171922"/>
    <path d="M62 2l26 -4l3 5l-26 5z" fill="#14161e"/>
    <circle cx="118" cy="0" r="10" fill="#14161d"/>
    <path d="M111 -1h13" stroke="#06070b" stroke-width="2"/>
    <path d="M-28 6l148 -26" stroke="#101216" stroke-width="3.2"/>
    <path d="M120 -20l14 2l-8 12z" fill="#101216"/>
  </g>`;
  // La traînée sombre va de dalle en dalle, puis s'arrête net.
  s += `<path d="M352 300q56 8 118 2l-6 7q-58 6 -106 -3z" fill="#22080a" opacity="0.4"/>`;

  // La tapisserie pendante, un coin décroché — il ne reste qu'une boucle au cimaise.
  s += `<path d="M640 54h142" stroke="#0c0b10" stroke-width="3.4"/>
    <path d="M768 54q5 9 -2 13" stroke="#221319" stroke-width="3" fill="none"/>
    <path d="M648 56l108 30v66q-24 18 -52 16l-9 -20l-7 24q-24 -3 -42 -17z" fill="#211218"/>
    <path d="M656 66l92 26v52" stroke="#3a161d" stroke-width="3" fill="none" opacity="0.6"/>
    <path d="M700 88q-4 40 2 76" stroke="#160c10" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M700 100l15 17l-15 17l-15 -17z" fill="none" stroke="#c9a227" stroke-width="1.8" opacity="0.22"/>`;

  // Quelqu'un a veillé ici : une bougie au pied de la première armure.
  if (a.lum < 0.55) s += bougie(a, 196, 290, 'bg1');
  // La poussière danse dans les rais — seul mouvement de la salle.
  if (a.lum > 0.3) s += neige(7, 12, R(0.12 * a.lum), 280, 528, 125, 290);

  // Trois fentes de jour ne suffisent pas : la salle reste dans sa nuit de pierre.
  s += voileNuit(a, 1.4);
  return s;
}
