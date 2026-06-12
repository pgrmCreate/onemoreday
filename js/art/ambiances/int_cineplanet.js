// Ambiance « Cinéplanet » — place Morgan, neuf salles, une seule séance.
// Intérieur aveugle : le noir des salles obscures, à prendre au mot désormais.
// L'écran lacéré pend sur les premiers rangs, le liseré vert de l'issue de
// secours est la seule lueur — et un rai de jour par la porte entrouverte.
import { W, H, R, rng, halo, dots, neige, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1150); // 1 150 fauteuils, aucun spectateur parti
  let s = '';

  // La salle : murs d'ombre, plafond mangé de noir, spots morts.
  s += `<rect width="${W}" height="${H}" fill="#0d0e13"/>`;
  s += `<rect width="${W}" height="44" fill="#08090c"/>`;
  let spots = '';
  for (let i = 0; i < 6; i++) spots += `M${R(90 + i * 124 + r() * 18)} ${R(16 + r() * 14)}h3`;
  s += `<path d="${spots}" stroke="#14151b" stroke-width="3" fill="none"/>`;
  // Lambris acoustiques du mur de gauche — des rainures qui ne renvoient plus rien.
  let lam = '';
  for (let i = 0; i < 5; i++) lam += `M${R(18 + i * 26)} 60V236`;
  s += `<path d="${lam}" stroke="#0a0b10" stroke-width="6" fill="none" opacity="0.8"/>`;

  // L'écran géant : cadre de masquage, puis la toile, pâle même dans le noir.
  s += `<rect x="150" y="44" width="430" height="192" fill="#07080c"/>`;
  s += `<rect x="164" y="58" width="402" height="164" fill="#282930"/>`;
  // Lacérations : griffé jusqu'à la trame, le noir derrière l'image.
  s += `<path d="M236 74l26 118l-12 4l-22 -114z" fill="#07080c"/>
    <path d="M300 66l14 64l-9 2l-13 -62z" fill="#07080c" opacity="0.9"/>
    <path d="M470 88l-20 96l11 3l17 -92z" fill="#07080c"/>`;
  // Le grand lambeau : un pan de toile arraché qui pend sur les premiers rangs.
  s += `<path d="M352 92l66 -6l-8 136q-20 36 -34 60l-10 -2q8 -52 -14 -188z" fill="#07080c"/>
    <path d="M362 100l48 -5l-9 120q-16 30 -27 50q4 -80 -12 -165z" fill="#1f2026"/>`;
  // Une trace brune essuyée en bas de toile — quelque chose a voulu entrer dans l'image.
  s += `<path d="M430 206q44 6 86 2l-4 12q-42 4 -84 -2z" fill="#22080a" opacity="0.45"/>`;
  // Rideaux de scène à demi tirés, raides de poussière.
  s += `<path d="M140 40q16 100 4 200l24 -4q8 -96 -4 -196z" fill="#121016"/>
    <path d="M590 40q-14 102 -2 198l-26 -4q-8 -96 4 -194z" fill="#121016"/>`;

  // L'issue de secours, à gauche de l'écran : son liseré vert blafard
  // est la seule chose encore allumée dans tout le bâtiment.
  s += `<rect x="58" y="150" width="48" height="92" fill="#08090d"/>
    <rect x="58" y="150" width="48" height="92" fill="none" stroke="#3f7a4e" stroke-width="1.6" opacity="0.4"/>
    <rect x="66" y="132" width="32" height="11" fill="#21321f"/>`;
  s += halo(a, 'vsign', 82, 138, 52, 22, '#58a06a', 0.16);
  s += halo(a, 'vsol', 82, 252, 78, 24, '#3f7a4e', 0.09);

  // À droite, les gradins montent vers la porte de la salle.
  s += `<path d="M576 340h224V186h-44v24h-34v26h-34v28h-36v30h-38v26h-38z" fill="#0c0d12"/>`;

  // L'allée centrale descend vers l'écran, bordée de liseuses de sol mortes.
  s += `<path d="M350 236L394 236L444 340L300 340Z" fill="#121319"/>`;
  let lis = '';
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    lis += `M${R(352 - 48 * t)} ${R(244 + 88 * t)}h3M${R(392 + 48 * t)} ${R(244 + 88 * t)}h3`;
  }
  s += `<path d="${lis}" stroke="#1f2128" stroke-width="3" fill="none"/>`;

  // Les rangs de fauteuils : des dossiers alignés, dos à nous, face à l'écran.
  const rangs = [
    { y: 240, sh: 15, sw: 27, t: '#11121a', demi: 28 },
    { y: 263, sh: 18, sw: 32, t: '#0e0f15', demi: 38 },
    { y: 290, sh: 21, sw: 37, t: '#0b0c11', demi: 50 },
    { y: 322, sh: 25, sw: 43, t: '#08090c', demi: 64 },
  ];
  let tetes = '';
  rangs.forEach((rg, i) => {
    const xmax = R(586 + (340 - rg.y) * 1.55); // les rangs s'arrêtent au pied des gradins
    let d = '';
    for (let x = R(44 + r() * 14 - i * 8); x + rg.sw < xmax; x += rg.sw + 5) {
      const cx = x + rg.sw / 2;
      if (Math.abs(cx - 372) < rg.demi) continue; // l'allée centrale
      const sh = r() < 0.07 ? R(rg.sh * 0.45) : rg.sh; // un fauteuil arraché, parfois
      d += `M${R(x)} ${rg.y}v${R(-(sh - 7))}q0 -7 7 -7h${R(rg.sw - 14)}q7 0 7 7v${R(sh - 7)}`;
      // Quelques têtes dépassent des dossiers. Aucune ne se retourne. Pas encore.
      if (i === 0 && cx > 180 && cx < 560 && r() < 0.16)
        tetes += `<ellipse cx="${R(cx)}" cy="${R(rg.y - sh - 6)}" rx="5.5" ry="6.5" fill="#0a0b10"/>`;
    }
    s += `<path d="${d}" fill="${rg.t}"/>`;
  });
  s += tetes;

  // Un gobelet géant couché dans l'allée, la paille encore plantée dans le couvercle.
  s += `<g transform="translate(374,318) rotate(98)" fill="#13141a">
    <path d="M0 0h17l-3 -30h-11z"/><path d="M-2 0h21v4h-21z"/></g>
    <path d="M371 307l11 -17" stroke="#101116" stroke-width="2" fill="none"/>`;
  // Du pop-corn écrasé, semé entre les rangs.
  const pop = [];
  for (let i = 0; i < 12; i++) pop.push([R(306 + r() * 134), R(252 + r() * 80)]);
  s += dots(pop, 1.8, '#2e2a22', 0.4);

  // La porte entrouverte, en haut des gradins : une entaille de jour gris.
  s += `<rect x="752" y="80" width="46" height="108" fill="#060708"/>
    <rect x="756" y="86" width="7" height="100" fill="${a.bas}" opacity="${R(0.18 + 0.5 * a.lum)}"/>
    <rect x="765" y="86" width="33" height="100" fill="#0a0b0f"/>`;
  // Le rai tombe en travers des marches et meurt avant l'allée.
  const rai = R(0.1 * a.lum);
  if (rai > 0.015) {
    s += `<path d="M756 96L766 96L640 340L520 340Z" fill="${a.bas}" opacity="${rai}"/>`;
    s += halo(a, 'rai', 700, 210, 150, 140, a.bas, R(rai * 1.6));
    // Poussière en suspension dans la lame de jour.
    s += neige(77, 12, R(0.12 * a.lum), 600, 770, 110, 320);
  }

  // Une salle sans fenêtre reste noire, même à midi.
  s += voileNuit(a, 1.6);
  return s;
}
