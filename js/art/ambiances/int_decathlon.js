// Ambiance « Decathlon City » — le magasin de sport des cours, ouvert trois
// semaines avant la fin. Intérieur : la vitrine d'entrée laisse entrer le ciel,
// le reste du plateau s'enfonce dans la pénombre — portants basculés, kayak
// suspendu, mannequins démembrés, un seul vélo tordu au râtelier.
import { W, H, R, rng, fenetre, halo, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1422);
  let s = '';

  // Le plateau de vente : un seul volume, plafond technique apparent.
  s += `<rect width="${W}" height="${H}" fill="#0f1014"/>`;
  s += `<rect width="${W}" height="48" fill="#0a0b0f"/>`;
  s += `<path d="M0 48H${W}M64 48v-10M186 48v-10M308 48v-10M436 48v-10M562 48v-10M692 48v-10" stroke="#07080c" stroke-width="3" fill="none"/>`;
  // Béton ciré, joints en éventail vers la vitrine.
  s += `<rect x="0" y="238" width="${W}" height="${H - 238}" fill="#13141a"/>`;
  let joints = '';
  for (let i = 0; i < 7; i++) joints += `M${R(i * 132 - 40)} ${H}L${R(i * 118 + 28)} 238`;
  s += `<path d="${joints}" stroke="#0c0d11" stroke-width="1.4" fill="none" opacity="0.7"/>`;

  // La vitrine d'entrée — trois baies pleine hauteur, le dehors en travers.
  s += fenetre(a, 36, 62, 66, 168, 'va');
  s += fenetre(a, 110, 62, 66, 168, 'vb', true);
  s += fenetre(a, 184, 62, 66, 168, 'vc');
  // Au travers : un platane nu des cours, et la façade d'en face.
  s += `<path d="M60 230v-84q-9 -18 -20 -26q13 4 20 10v-22q10 14 14 36l9 -11q-2 23 -9 35v62z" fill="#0a0b10" opacity="0.85"/>`;
  s += `<path d="M188 230v-66h26l7 -13 7 13h18v66z" fill="#0a0b10" opacity="0.8"/>`;
  // L'étoilement du verre, autour du caddie encastré.
  s += `<path d="M142 180l-22 -26M142 180l24 -20M142 180l-26 14M142 180l28 18M142 180l-6 -34M142 180l4 38" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.9"/>`;
  s += `<g transform="translate(116,206) rotate(-10)" stroke="#15161d" fill="none" stroke-width="2.6">
    <path d="M0 0l8 -26h50l10 26z"/>
    <path d="M16 -26v26M30 -26v26M44 -26v26"/>
    <path d="M68 -26l12 -9"/>
    <circle cx="12" cy="8" r="5" fill="#0a0b10" stroke="none"/>
    <circle cx="56" cy="8" r="5" fill="#0a0b10" stroke="none"/>
  </g>`;
  // Le jour s'écrase au sol devant les baies, puis renonce.
  s += halo(a, 'jour', 160, 252, 230, 62, a.bas, R(0.15 * Math.max(0.16, a.lum)));

  // Les portiques antivol, morts — plus rien à protéger.
  s += `<g fill="#14151b"><rect x="276" y="148" width="9" height="90" rx="4.5"/><rect x="306" y="148" width="9" height="90" rx="4.5"/></g>`;
  // Quelqu'un a été traîné entre les portiques. Pas loin.
  s += `<path d="M288 246q42 14 96 10l-8 8q-50 2 -84 -10z" fill="#22080a" opacity="0.5"/>`;

  // Les gondoles du fond, à moitié vidées — quelques cartons ont tenu bon.
  s += `<g fill="#0d0e13"><rect x="350" y="138" width="150" height="100"/><rect x="520" y="146" width="120" height="92"/></g>`;
  s += `<path d="M350 168h150M350 198h150M520 176h120M520 206h120" stroke="#08090d" stroke-width="3" fill="none"/>`;
  let boites = '';
  for (let i = 0; i < 8; i++) {
    const g1 = i < 4;
    const bx = g1 ? R(356 + r() * 112) : R(526 + r() * 88);
    const sy = g1 ? [168, 198, 238][i % 3] : [176, 206, 238][i % 3];
    const bw = R(10 + r() * 14), bh = R(8 + r() * 6);
    boites += `<rect x="${bx}" y="${R(sy - bh)}" width="${bw}" height="${bh}"/>`;
  }
  s += `<g fill="#101117">${boites}</g>`;

  // Le kayak pend toujours du plafond — personne n'a eu le temps de l'acheter.
  s += `<g transform="rotate(3 470 86)">
    <path d="M430 48v30M540 48v32" stroke="#1a1b22" stroke-width="1.8" fill="none"/>
    <path d="M368 92Q470 64 572 94Q470 114 368 92Z" fill="#8a4a20" opacity="0.55"/>
    <path d="M368 92Q470 104 572 94Q470 114 368 92Z" fill="#0d0e13" opacity="0.8"/>
    <ellipse cx="470" cy="86" rx="26" ry="6" fill="#0a0b10" opacity="0.9"/>
  </g>`;

  // Le râtelier : des arceaux vides, des crochets nus au mur — un seul vélo
  // reste, roue avant pliée. Lui n'a emmené personne.
  s += `<path d="M620 96q0 10 8 10M668 96q0 10 8 10M716 96q0 10 8 10" stroke="#101117" stroke-width="3" fill="none"/>`;
  s += `<path d="M600 238h170" stroke="#101117" stroke-width="4" fill="none"/>`;
  let arceaux = '';
  for (let i = 0; i < 5; i++) { const ax = 608 + i * 36; arceaux += `M${ax} 238v-20q0 -8 8 -8t8 8v20`; }
  s += `<path d="${arceaux}" stroke="#14151b" stroke-width="3" fill="none"/>`;
  s += `<g stroke="#15161d" fill="none" stroke-width="2.6">
    <circle cx="648" cy="217" r="16"/>
    <ellipse cx="706" cy="220" rx="15" ry="9" transform="rotate(-28 706 220)"/>
    <path d="M648 217l24 -3 -8 -26M672 214l-8 -26h-5M664 188l32 4M672 214l24 -22M696 192q10 14 10 28M659 186h12M696 192l4 -8q6 -2 8 2"/>
  </g>`;

  // Les portants du textile, basculés — les cintres ont glissé en tas.
  s += `<g transform="translate(326,236) rotate(-18)" stroke="#14151b" fill="none" stroke-width="3.2" stroke-linecap="round">
    <path d="M-12 0h24M0 0v-44M92 0h24M104 0v-44M0 -44h104"/>
    <path d="M22 -44v6l-5 8h12zM48 -44v6l-5 8h12zM72 -44v6l-5 8h12z" stroke-width="1.8"/>
  </g>`;
  s += `<path d="M300 238q26 -16 60 -8q30 -12 48 4q-56 10 -108 4z" fill="#17141b"/>`;

  // Les mannequins sportifs, démembrés — les seules silhouettes dont on soit sûr.
  s += `<g fill="#1c1d25">
    <path d="M470 238h26l-3 -8h-20z"/>
    <rect x="481" y="172" width="4" height="58"/>
    <path d="M468 176q-4 -28 6 -40q8 -6 16 0q10 12 6 40q-14 6 -28 0z"/>
    <rect x="479" y="128" width="8" height="9" rx="3"/>
    <path d="M466 142q-10 10 -10 26" stroke="#1c1d25" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>`;
  s += `<g transform="translate(545,231) rotate(78)" fill="#191a22"><path d="M-12 0q-4 -26 6 -38q8 -6 14 0q10 12 6 38q-12 6 -26 0z"/></g>`;
  s += `<path d="M372 232q16 -8 30 -2" stroke="#191a22" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="262" cy="231" r="8" fill="#191a22"/>`;

  // Débris épars : boîtes éventrées, un ballon que personne ne shootera.
  let debris = '';
  for (let i = 0; i < 10; i++) debris += `M${R(60 + r() * 660)} ${R(246 + r() * 78)}h6`;
  s += `<path d="${debris}" stroke="#0d0e12" stroke-width="3" fill="none" opacity="0.8"/>`;
  s += `<circle cx="430" cy="276" r="9" fill="#101117"/><path d="M424 270q6 8 13 3" stroke="#0a0b0f" stroke-width="1.4" fill="none"/>`;

  // Poussière en suspension dans la lumière de la vitrine.
  if (a.lum > 0.3) s += neige(58, 12, R(0.10 * a.lum), 40, 260, 80, 232);

  // Un plateau aveugle au-delà des baies : la pénombre gagne, même à midi.
  s += voileNuit(a, 1.3);
  return s;
}
