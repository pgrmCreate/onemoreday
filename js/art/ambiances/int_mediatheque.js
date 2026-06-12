// Ambiance « Médiathèque » — la grande salle de lecture, boulevard Aristide Briand.
// Intérieur : les hautes baies versent le ciel du moment sur le plateau ; les
// rayonnages font la haie, l'un s'est couché en avalanche de livres ; sur les
// tables, des lampes mortes. Des pages au sol, comme des feuilles de novembre.
import { W, H, R, rng, fenetre, halo, neige, zfig, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1948);
  let s = '';

  // Le volume : mur du fond couleur de papier éteint, plafond mangé d'ombre.
  s += `<rect width="${W}" height="${H}" fill="#11100f"/>`;
  s += `<rect width="${W}" height="54" fill="#0b0b10"/>`;
  // La moquette du plateau — tiède autrefois, juste sourde maintenant.
  s += `<rect x="0" y="262" width="${W}" height="${H - 262}" fill="#14120e"/>`;
  s += `<path d="M0 262H${W}" stroke="#0a0907" stroke-width="2"/>`;

  // Les hautes baies, à droite : tout le jour qui reste entre par elles.
  s += fenetre(a, 524, 40, 74, 206, 'a');
  s += fenetre(a, 618, 40, 74, 206, 'b', true);
  s += fenetre(a, 712, 40, 74, 206, 'c');
  // Au travers, une branche nue de platane griffe le ciel.
  s += `<path d="M640 122q22 -16 48 -18m-26 16q4 -14 -2 -28" stroke="#0a0b10" stroke-width="2.2" fill="none" opacity="0.8"/>
    <path d="M724 96q18 10 38 8m-22 -6q-2 -16 6 -24" stroke="#0a0b10" stroke-width="2" fill="none" opacity="0.7"/>`;
  // La lumière des baies s'écrase sur la moquette, en travées pâles.
  s += halo(a, 'jour', 640, 288, 235, 54, a.bas, R(0.16 * Math.max(0.15, a.lum)));
  s += `<path d="M540 246l-52 72h76l42 -72zM634 246l-32 72h78l30 -72z" fill="${a.bas}" opacity="${R(0.05 * a.lum)}"/>`;

  // L'escalier de béton tourne au bord du cadre, marche après marche.
  let esc = 'M84 262';
  for (let i = 0; i < 8; i++) esc += 'h-10v-13';
  s += `<path d="${esc}H0V262Z" fill="#0d0d12"/>`;
  // Le bloc « sortie de secours », vert éteint — même lui a cessé d'y croire.
  s += `<rect x="28" y="172" width="22" height="9" rx="2" fill="#1d3a22" opacity="0.5"/>`;

  // La mezzanine de l'espace musique court sur la gauche, au-dessus des travées.
  s += `<rect x="0" y="142" width="470" height="13" fill="#0c0c11"/>
    <rect x="0" y="155" width="470" height="8" fill="#08080c"/>`;
  // Garde-corps de verre : des montants fins, une lisse, le vide au travers.
  let gc = '';
  for (let i = 0; i <= 11; i++) gc += `M${R(8 + i * 42)} 142v-34`;
  s += `<rect x="0" y="108" width="470" height="34" fill="#181a20" opacity="0.26"/>
    <path d="${gc}M0 108h470" stroke="#0d0e13" stroke-width="2.4" fill="none"/>`;
  // Sur la coursive : les bacs de CD, et au bout, le fauteuil tourné vers les
  // baies — le livre est resté ouvert sur l'accoudoir, face contre ciel.
  s += `<g fill="#101117"><rect x="64" y="124" width="54" height="18"/><rect x="152" y="124" width="54" height="18"/></g>
    <path d="M68 124h46M156 124h46" stroke="#08090d" stroke-width="2"/>
    <path d="M404 142v-24q0 -5 6 -5h5v18h22v-18h5q6 0 6 5v24z" fill="#13110f"/>
    <path d="M409 112l6 -3 6 3 -6 2z" fill="#8f8878" opacity="0.5"/>`;
  // Les piliers qui portent tout ça, plantés dans la moquette.
  s += `<rect x="118" y="163" width="11" height="99" fill="#0b0b10"/>
    <rect x="332" y="163" width="11" height="99" fill="#0b0b10"/>`;

  // Les rayonnages en enfilade — des dos de livres par milliers, plus un lecteur.
  const etagere = (x, seed, dore = false) => {
    const q = rng(seed);
    let g = `<rect x="${x}" y="192" width="58" height="104" fill="#13121a"/>`, dos = '', or = '';
    for (let j = 0; j < 4; j++) {
      const ty = 217 + j * 26;
      g += `<path d="M${x} ${ty}h58" stroke="#0a0a0e" stroke-width="3"/>`;
      for (let i = 0; i < 12; i++) {
        const bx = R(x + 5 + i * 4.4), bh = R(12 + q() * 8), dent = `M${bx} ${ty - 2}v${-bh}`;
        if (q() < 0.82) { if (dore && q() < 0.12) or += dent; else dos += dent; }
      }
    }
    g += `<path d="${dos}" stroke="#0a0b10" stroke-width="2.6" fill="none"/>`;
    if (or) g += `<path d="${or}" stroke="#c9a227" stroke-width="2.2" fill="none" opacity="0.3"/>`;
    return g;
  };
  s += etagere(96, 11) + etagere(178, 12, true) + etagere(388, 14);
  // Celui-là s'est couché contre son voisin — l'avalanche s'est figée en travers.
  s += `<g transform="translate(262,296) rotate(-38)"><rect x="0" y="-104" width="58" height="104" fill="#100f16"/>
    <path d="M0 -78h58M0 -52h58M0 -26h58" stroke="#0a0a0e" stroke-width="3"/></g>`;
  let av = '';
  for (let i = 0; i < 26; i++) {
    const bx = R(236 + r() * 122), by = R(288 + r() * 28), rot = R(-40 + r() * 80);
    av += `<rect x="${bx}" y="${by}" width="${R(9 + r() * 6)}" height="4" transform="rotate(${rot} ${bx} ${by})"/>`;
  }
  s += `<g fill="#0d0d13">${av}</g>`;
  // Quelque chose se déplace parfois, lentement, entre les rayonnages.
  s += zfig(352, 240, 0.5, '#0a0b10', a.nuit, 6);

  // Les grandes tables de lecture sous leurs lampes mortes, chaises repoussées.
  const table = (x, y, sc) => `<g transform="translate(${x},${y}) scale(${sc})">
    <path d="M30 0v-12q0 -4 5 -4h10M88 0v-12q0 -4 5 -4h10" stroke="#0d0e13" stroke-width="3.5" fill="none"/>
    <path d="M37 -20h14l5 6h-17zM95 -20h14l5 6h-17z" fill="#0d0e13"/>
    <rect x="0" y="0" width="124" height="7" rx="2" fill="#15130f"/>
    <path d="M8 7l-4 30M116 7l4 30M62 7v30" stroke="#100e0b" stroke-width="5" fill="none"/>
    <path d="M52 -2l9 -3 9 3l-9 2z" fill="#8f8878" opacity="0.45"/>
  </g>`;
  s += table(436, 288, 0.94) + table(580, 302, 1.06);
  const chaise = (x, y, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="#11100d" stroke-width="3.5" fill="none">
    <path d="M0 0v-42M0 -22h17l4 22M3 -22l-5 22"/></g>`;
  s += chaise(420, 326) + chaise(572, 332) + chaise(722, 330, 78);

  // Le comptoir de prêt arrondit son arc au bord du cadre.
  s += `<path d="M716 340q-2 -40 38 -54q30 -10 46 -8v62z" fill="#17140f"/>
    <path d="M722 324q22 -30 78 -32" stroke="#0d0b08" stroke-width="3" fill="none"/>`;

  // Des pages arrachées partout sur la moquette — l'automne est entré ici aussi.
  let pg = '';
  for (let i = 0; i < 30; i++) {
    const px = R(20 + r() * 740), py = R(270 + r() * 62), rot = R(-50 + r() * 100);
    pg += `<path d="M${px} ${py}h8l-2 4h-7z" transform="rotate(${rot} ${px} ${py})"/>`;
  }
  s += `<g fill="#88806f" opacity="0.2">${pg}</g>`;
  // Deux feuilles encore en l'air, près du carreau crevé.
  s += `<g fill="#88806f" opacity="0.14"><path d="M600 182h7l-2 4h-6z" transform="rotate(24 600 182)"/>
    <path d="M632 214h7l-2 4h-6z" transform="rotate(-32 632 214)"/></g>`;

  // Poussière en suspension dans la lumière des baies.
  if (a.lum > 0.3) s += neige(53, 16, R(0.1 * a.lum), 530, 780, 60, 250);

  // Une salle haute et vitrée, mais une salle quand même : le dehors y arrive amorti.
  s += voileNuit(a, 1.2);
  return s;
}
