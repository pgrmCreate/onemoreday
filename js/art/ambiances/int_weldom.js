// Ambiance « Weldom » — la quincaillerie de la Gandonne, tout pour réparer
// un monde irréparable. Intérieur : le rideau métallique à demi baissé laisse
// passer une lame de ciel, le reste du plateau dort — rayonnages hauts,
// panneau d'outils dégarni, pots de peinture empilés, une échelle couchée
// en travers de l'allée que personne ne viendra ranger.
import { W, H, R, rng, dots, fenetre, halo, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1093);
  let s = '';

  // Le plateau de vente : un grand volume bas de plafond, sans une lampe.
  s += `<rect width="${W}" height="${H}" fill="#0f1014"/>`;
  s += `<rect width="${W}" height="46" fill="#0a0b0f"/>`;
  s += `<path d="M0 46H${W}M90 46v-9M250 46v-9M420 46v-9M590 46v-9M730 46v-9" stroke="#07080c" stroke-width="3" fill="none"/>`;
  // Béton du sol, joints de dalle qui filent vers le fond.
  s += `<rect x="0" y="242" width="${W}" height="${H - 242}" fill="#13141a"/>`;
  s += `<path d="M0 266H${W}M0 298H${W}M168 242l-32 ${H - 242}M432 242l16 ${H - 242}M656 242l30 ${H - 242}" stroke="#0c0d11" stroke-width="1.4" fill="none" opacity="0.7"/>`;

  // L'entrée : le rideau métallique à demi baissé, et dessous, la lame de ciel.
  s += `<rect x="50" y="56" width="196" height="186" fill="#08090d"/>`;
  s += fenetre(a, 64, 66, 168, 174, 'rd');
  // Dehors, au ras du sol : le parking, des masses sombres qui ne bougent plus.
  s += `<path d="M64 240v-26l52 -5 62 7 54 -4v28z" fill="#0a0b10" opacity="0.8"/>`;
  // Le tablier du rideau : lames serrées, voilées par un vieux coup d'épaule.
  s += `<rect x="56" y="56" width="184" height="118" fill="#0e1016"/>`;
  let lames = '';
  for (let i = 1; i < 14; i++) lames += `M56 ${R(56 + i * 8.4)}h184`;
  s += `<path d="${lames}" stroke="#07080c" stroke-width="1.6" fill="none"/>`;
  s += `<path d="M56 166q46 7 92 2t92 1" stroke="#161822" stroke-width="2" fill="none" opacity="0.5"/>`;
  s += `<rect x="56" y="172" width="184" height="7" fill="#14151b"/>`;
  // Les coulisses, de part et d'autre du tablier.
  s += `<rect x="48" y="56" width="8" height="186" fill="#101117"/><rect x="240" y="56" width="8" height="186" fill="#101117"/>`;
  // Le jour rampe sous le rideau, s'écrase au sol, puis renonce.
  s += halo(a, 'jour', 150, 258, 215, 58, a.bas, R(0.16 * Math.max(0.16, a.lum)));

  // Les panneaux des rayons pendent du plafond comme des stations de métro.
  // L'un ne tient plus que par un fil.
  s += `<g transform="rotate(2 352 74)"><path d="M330 46v16M374 46v16" stroke="#15161d" stroke-width="1.6"/><rect x="318" y="62" width="68" height="20" fill="#13141b"/><rect x="318" y="62" width="68" height="4" fill="#8a4a20" opacity="0.4"/></g>`;
  s += `<g transform="rotate(-12 560 46)"><path d="M560 46v18" stroke="#15161d" stroke-width="1.6"/><rect x="528" y="64" width="66" height="19" fill="#12131a"/><rect x="528" y="64" width="66" height="4" fill="#8a4a20" opacity="0.35"/></g>`;

  // Le panneau d'outils, au fond — la moitié des crochets sont nus.
  s += `<rect x="296" y="78" width="180" height="126" fill="#0d0e13"/>`;
  const trous = [];
  for (let i = 0; i < 60; i++) trous.push([R(306 + (i % 10) * 17.8), R(88 + Math.floor(i / 10) * 19)]);
  s += dots(trous, 1.3, '#080a0e', 0.8);
  // Ce qui reste pendu : des clés plates, en rangs d'oignons.
  s += `<g stroke="#1a1c24" fill="none" stroke-linecap="round">
    <path d="M318 98v32M340 96v40M362 100v28" stroke-width="3.4"/>
    <circle cx="318" cy="94" r="4.5" stroke-width="2.4"/>
    <circle cx="340" cy="92" r="5" stroke-width="2.4"/>
    <circle cx="362" cy="96" r="4" stroke-width="2.4"/>
  </g>`;
  // Deux marteaux, et la scie égoïne que personne n'a voulue.
  s += `<g fill="#161820">
    <rect x="394" y="98" width="5" height="38"/><rect x="386" y="94" width="21" height="9" rx="2"/>
    <rect x="420" y="102" width="5" height="32"/><rect x="412" y="98" width="21" height="8" rx="2"/>
  </g>`;
  s += `<path d="M448 98h18l-4 38q-10 2 -14 -4z" fill="#14161e"/><path d="M448 98q-6 4 -5 12l5 2" stroke="#14161e" stroke-width="4" fill="none"/>`;
  // La rangée du bas : rien que des crochets vides, et leurs ombres.
  s += `<path d="M312 158v24M338 160v20M368 156v26M398 160v22M430 158v20M456 156v22" stroke="#13151d" stroke-width="2" fill="none" opacity="0.8"/>`;
  // Une clé tombée au pied du panneau, que personne n'a ramassée.
  s += `<path d="M386 252l18 5" stroke="#161820" stroke-width="3.4" stroke-linecap="round"/><circle cx="406" cy="258" r="4" fill="none" stroke="#161820" stroke-width="2.2"/>`;

  // Les rayonnages hauts, à droite : des falaises de tôle et de cartons.
  s += `<g fill="#14151b">
    <rect x="502" y="60" width="6" height="182"/><rect x="624" y="60" width="6" height="182"/>
    <rect x="642" y="64" width="6" height="178"/><rect x="768" y="64" width="6" height="178"/>
  </g>`;
  s += `<path d="M502 102h128M502 144h128M502 188h128M642 108h132M642 152h132M642 196h132" stroke="#101117" stroke-width="5" fill="none"/>`;
  s += `<path d="M508 242l116 -42M648 242l120 -38" stroke="#0e0f15" stroke-width="2" fill="none" opacity="0.8"/>`;
  // Le stock qui reste : des cartons posés là pour toujours.
  let stock = '';
  for (let i = 0; i < 14; i++) {
    const bayB = i % 2;
    const bx = bayB ? R(648 + r() * 96) : R(510 + r() * 92);
    const niv = bayB ? [108, 152, 196][i % 3] : [102, 144, 188][i % 3];
    const bw = R(12 + r() * 16), bh = R(9 + r() * 9);
    stock += `<rect x="${bx}" y="${R(niv - bh - 2)}" width="${bw}" height="${bh}"/>`;
  }
  s += `<g fill="#101118">${stock}</g>`;

  // Les bidons, en rangée sage au pied du rayonnage, poignées alignées.
  let corps = '', anses = '';
  for (let i = 0; i < 4; i++) {
    const bx = 514 + i * 27;
    corps += `M${bx} 240v-23q0 -4 4 -4h14q4 0 4 4v23z`;
    anses += `M${bx + 6} 212q5 -6 10 0`;
  }
  s += `<path d="${corps}" fill="#11131a"/><path d="${anses}" stroke="#11131a" stroke-width="2.6" fill="none"/>`;

  // Les pots de peinture, empilés par teintes que plus personne ne choisira.
  let pots = '', couvercles = '';
  for (const [px, n] of [[666, 3], [696, 2], [724, 3], [752, 1]]) {
    for (let j = 0; j < n; j++) {
      const py = R(240 - (j + 1) * 19);
      pots += `<rect x="${px}" y="${py}" width="24" height="18" rx="2"/>`;
      couvercles += `M${px + 2} ${R(py + 2.5)}h20`;
    }
  }
  s += `<g fill="#12141b">${pots}</g><path d="${couvercles}" stroke="#0b0c11" stroke-width="1.4" fill="none"/>`;
  // Un pot a roulé jusque dans l'allée. Ce qui a séché autour est rouge.
  s += `<g transform="translate(560,290) rotate(96)"><rect x="-12" y="-9" width="24" height="18" rx="2" fill="#12141b"/></g>`;
  s += `<path d="M548 298q-22 8 -44 4q-10 -6 4 -10q24 -6 40 6z" fill="#a31621" opacity="0.4"/>`;

  // La flaque de peinture blanche, sèche — des semelles, puis des pieds nus,
  // puis plus rien. On enjambe sans regarder.
  s += `<path d="M298 262q30 -12 64 -6q26 4 18 12q-30 10 -66 4q-22 -4 -16 -10z" fill="#b9b4a6" opacity="0.13"/>`;
  s += `<g fill="#b9b4a6"><ellipse cx="396" cy="260" rx="4" ry="7" opacity="0.13"/><ellipse cx="412" cy="268" rx="4" ry="7" opacity="0.1"/><ellipse cx="430" cy="258" rx="3.5" ry="6" opacity="0.07"/><ellipse cx="446" cy="266" rx="3.5" ry="6" opacity="0.045"/></g>`;

  // L'échelle couchée en travers de l'allée — montée, jamais redescendue.
  s += `<g transform="translate(244,308) rotate(-8)" stroke="#1a1b23" fill="none" stroke-linecap="round">
    <path d="M0 0h232M4 -17h232" stroke-width="4"/>
    <path d="M22 0v-17M50 0v-17M78 -1v-16M106 -1v-16M134 -1v-16M162 -2v-15M190 -2v-15M218 -2v-15" stroke-width="3"/>
  </g>`;

  // Débris épars : visserie renversée, éclats de plastique.
  let deb = '';
  for (let i = 0; i < 9; i++) deb += `M${R(70 + r() * 640)} ${R(250 + r() * 74)}h6`;
  s += `<path d="${deb}" stroke="#0d0e12" stroke-width="3" fill="none" opacity="0.8"/>`;

  // Poussière en suspension dans la lame de jour.
  if (a.lum > 0.3) s += neige(67, 10, R(0.10 * a.lum), 60, 250, 150, 238);

  // Au-delà du rideau, le magasin reste une cave, même à midi.
  s += voileNuit(a, 1.3);
  return s;
}
