// Panorama « Le départ du train » — cinématique 1600×340, travelling gauche→droite.
// Le Y 8000 s'arrache de la gare de Salon : à gauche le bout de la halle et le
// quai qui défile — bagages, sang, un errant resté planté sur le ciment, la
// passerelle noire de monde ; au centre la sortie de gare — caténaires mortes
// (un câble arraché pend), wagons garés, entrepôts de la Gandonne, passage à
// niveau figé ; à droite la voie file dans la plaine de la Crau : pylônes,
// clôtures à moutons, bergerie morte, brebis sans berger, canal de Craponne,
// garrigue — et les Alpilles posées au loin comme un décor. Salon fume derrière.
import {
  R, rng, dots, astre, etoiles, neige, brume, zfig, carcasse,
  lampadaire, pin, clocher,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 1180, 58);
  s += etoiles(a, 23, 64) + `<g transform="translate(800,0)">${etoiles(a, 59, 64)}</g>`;

  // ---- Le panache du diesel, couché au-dessus de la gare qu'on quitte ----
  s += `<g fill="#0c0d11">
    <ellipse cx="70" cy="40" rx="76" ry="15" opacity="0.5"/>
    <ellipse cx="200" cy="50" rx="96" ry="17" opacity="0.4"/>
    <ellipse cx="350" cy="62" rx="110" ry="18" opacity="0.3"/>
    <ellipse cx="502" cy="74" rx="88" ry="13" opacity="0.16"/>
  </g>
  <path d="M40 34q40 -12 84 2M170 44q52 -14 110 4M330 58q60 -12 120 6" stroke="#101116" stroke-width="3" fill="none" opacity="0.4"/>`;

  // ---- Salon qui s'éloigne : toits, le rocher de l'Empéri, trois fumées droites ----
  s += `<path d="M292 252V230h20v-8h14v8h18l10 -9 10 9h16v-14h18v14h24v-9h20v9h22v-15h16v15h60v-12h18v12h46v-16h14v16h40v-10h16v10h28V252Z" fill="#0c0d12" opacity="0.9"/>`;
  s += clocher(376, 252, 20, '#0c0d13');
  // Le rocher de l'Empéri, le donjon crénelé, la Tour de l'Horloge en aiguille.
  s += `<path d="M428 252q12 -34 36 -50q22 -16 50 -18q28 2 46 20q18 18 26 48z" fill="#0b0c11"/>
  <rect x="476" y="168" width="44" height="20" fill="#0b0c11"/>
  <path d="M479 168v-6M489 168v-6M499 168v-6M509 168v-6M517 168v-6" stroke="#0b0c11" stroke-width="5"/>
  <rect x="520" y="158" width="13" height="30" fill="#0b0c11"/>
  <rect x="616" y="216" width="11" height="36" fill="#0c0d12"/>
  <path d="M618 216q3.5 -7 7 0" stroke="#0c0d12" stroke-width="1.8" fill="none"/>`;
  // Trois colonnes de fumée, toutes droites dans l'air immobile.
  s += `<path d="M408 222q-3 -52 2 -84q-2 -42 1 -66M452 198q3 -50 -2 -88q2 -28 -1 -44M538 206q-2 -56 3 -96q-2 -30 1 -46" stroke="#15161a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45"/>`;

  // ---- Les Alpilles, posées au loin comme un décor ----
  s += `<path d="M720 252l60 -14 50 8 70 -18 60 10 80 -14 70 8 90 -16 70 10 80 -10 90 6 60 -8 100 8L1600 252Z" fill="#0d0f16" opacity="0.55"/>`;

  // ---- Le sol : la plaine continue, du ballast de gare à la steppe ----
  s += `<rect x="0" y="252" width="${PW}" height="60" fill="#0f1015"/>`;

  // ---- La voie du fond, qui file vers Miramas ----
  s += `<path d="M0 264H${PW}" stroke="#1a1c23" stroke-width="2" opacity="0.8"/>`;

  // ---- Les entrepôts de la Gandonne, boîtes mortes au bord des voies ----
  s += `<g fill="#0d0e14">
    <rect x="500" y="210" width="128" height="54"/>
    <path d="M496 210h136l-10 -14h-116z" fill="#0b0c11"/>
    <rect x="642" y="222" width="96" height="42"/>
    <path d="M638 222h104l-8 -12h-88z" fill="#0b0c11"/>
  </g>
  <path d="M512 220h104M654 230h72" stroke="#13141b" stroke-width="3" opacity="0.7"/>
  <rect x="560" y="240" width="22" height="24" fill="#08090d"/>`;

  // ---- Caténaires mortes : mâts en rythme, câble arraché qui pend ----
  let mats = '';
  for (const mx of [660, 818, 976, 1134, 1292, 1450]) {
    mats += `<path d="M${mx} 264V152h20M${mx} 170l16 -10M${mx + 18} 152v8" stroke="#0c0d12" stroke-width="3" fill="none"/>`;
  }
  s += mats;
  s += `<path d="M660 160Q739 168 818 160Q897 168 976 160M1134 160Q1213 168 1292 160Q1371 168 1450 160Q1525 166 1600 161" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.7"/>
  <path d="M976 160q14 28 -2 56q-6 14 4 26" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.7"/>`;

  // ---- Deux wagons garés sur la voie morte, oubliés là pour toujours ----
  s += `<g>
    <rect x="600" y="228" width="88" height="30" fill="#0e1016"/>
    <rect x="634" y="234" width="22" height="24" fill="#0a0b10"/>
    <path d="M600 234h88" stroke="#08090c" stroke-width="2" opacity="0.8"/>
    <circle cx="616" cy="261" r="5.5" fill="#07080b"/><circle cx="672" cy="261" r="5.5" fill="#07080b"/>
    <rect x="700" y="240" width="80" height="18" fill="#0d0f15"/>
    <path d="M704 240q24 -9 70 -2l-3 12q-34 -6 -64 0z" fill="#1d2027" opacity="0.85"/>
    <circle cx="714" cy="261" r="5.5" fill="#07080b"/><circle cx="766" cy="261" r="5.5" fill="#07080b"/>
    <path d="M688 250h12" stroke="#0a0b10" stroke-width="3"/>
  </g>
  <path d="M626 246q6 8 3 12l-8 -1q1 -7 5 -11z" fill="#a31621" opacity="0.3"/>`;

  // ---- Le passage à niveau figé : croix, barrière cassée, voiture qui attend ----
  s += `<rect x="856" y="252" width="38" height="88" fill="#1a1b21" opacity="0.4"/>
  <path d="M852 268v-30M840 232l24 12M840 244l24 -12" stroke="#15161d" stroke-width="3" fill="none"/>
  <path d="M862 266l32 -22" stroke="#565a64" stroke-width="3" opacity="0.5" stroke-dasharray="8 6"/>`;
  s += carcasse(856, 300, 0.72, '#0f1016', 3);

  // ---- La Crau : sillons, cailloux, garrigue ----
  const rsi = rng(317);
  let sillons = '';
  for (let i = 0; i < 9; i++) sillons += `M${R(900 + rsi() * 560)} ${R(268 + rsi() * 34)}q60 ${R(-1 - rsi() * 3)} 128 0`;
  s += `<path d="${sillons}" stroke="#0c0d12" stroke-width="1.6" fill="none" opacity="0.5"/>`;
  const rca = rng(641), cail = [];
  for (let i = 0; i < 30; i++) cail.push([R(840 + rca() * 750), R(266 + rca() * 40)]);
  s += dots(cail, 1.6, '#3c414c', 0.16);
  s += `<path d="M920 302q8 -10 18 -2q10 -8 16 2z" fill="#0b0e0b"/>
  <path d="M1166 298q7 -9 16 -2q8 -6 13 2z" fill="#0b0e0b"/>
  <path d="M1382 304q9 -11 20 -2q10 -8 17 2z" fill="#0b0e0b"/>
  <path d="M1556 296q6 -8 14 -2q7 -5 11 2z" fill="#0b0e0b"/>`;

  // ---- Le canal de Craponne : un fil d'eau qui prend la couleur du ciel ----
  s += `<path d="M1150 279q120 -7 220 -5q90 2 150 -2" stroke="${a.bas}" stroke-width="5" fill="none" opacity="0.16" stroke-linecap="round"/>
  <path d="M1152 278q120 -6 218 -4q90 2 148 -2" stroke="${a.bas}" stroke-width="1.6" fill="none" opacity="0.3"/>
  <path d="M1210 280v-11h10v11" stroke="#101117" stroke-width="2.4" fill="none"/>`;

  // ---- Clôtures à moutons, piquets tordus ----
  const rcl = rng(98);
  let cloture = '';
  for (let i = 0; i < 14; i++) cloture += `M${R(900 + i * 38 + rcl() * 9)} ${R(291 + i * 0.6)}v-9`;
  s += `<path d="${cloture}" stroke="#0d0e13" stroke-width="2.4" fill="none"/>
  <path d="M902 287q190 4 510 3" stroke="#0d0e13" stroke-width="1.2" fill="none" opacity="0.6"/>`;
  let cloture2 = '';
  for (let i = 0; i < 10; i++) cloture2 += `M${R(1020 + i * 44 + rcl() * 8)} 271v-7`;
  s += `<path d="${cloture2}" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>`;

  // ---- La bergerie morte, toit à moitié effondré, citerne sur pattes ----
  s += `<g fill="#0d0e14">
    <rect x="1030" y="266" width="54" height="20"/>
    <path d="M1026 266h36l-6 -12h-24z"/>
    <path d="M1062 266h26l-4 -10l-20 -2z" fill="#0b0c11"/>
  </g>
  <rect x="1048" y="272" width="9" height="14" fill="#07080b"/>
  <circle cx="1100" cy="262" r="7" fill="#0c0d12"/>
  <path d="M1096 269v6M1104 269v6" stroke="#0c0d12" stroke-width="2.6"/>`;

  // ---- Pylônes haute tension, en file vers le sud ----
  const pylone = (x, h) => `<g stroke="#0c0d12" fill="none">
    <path d="M${x - 14} 268L${x - 4} ${268 - h}h8L${x + 14} 268" stroke-width="2.6"/>
    <path d="M${x - 11} ${R(268 - h * 0.25)}h22M${x - 8} ${R(268 - h * 0.5)}h16" stroke-width="2"/>
    <path d="M${x - 12} 268L${x + 9} ${R(268 - h * 0.5)}M${x + 12} 268L${x - 9} ${R(268 - h * 0.5)}" stroke-width="1.4" opacity="0.8"/>
    <path d="M${x - 18} ${R(268 - h * 0.86)}h36M${x - 13} ${R(268 - h * 0.68)}h26" stroke-width="2.2"/>
  </g>`;
  s += pylone(1000, 92) + pylone(1240, 84) + pylone(1520, 88);
  s += `<path d="M1018 189Q1124 206 1222 196Q1374 212 1502 192Q1554 198 1600 194M1018 205Q1124 220 1222 211Q1374 226 1502 208Q1554 213 1600 210" stroke="#0a0b10" stroke-width="1.2" fill="none" opacity="0.6"/>`;

  // ---- Les brebis sans berger, et le patou qui les suit ----
  s += `<g fill="#8d897c" opacity="0.5">
    <ellipse cx="1248" cy="287" rx="5" ry="3"/><ellipse cx="1262" cy="291" rx="5.5" ry="3.2"/>
    <ellipse cx="1276" cy="285" rx="4.6" ry="2.8"/><ellipse cx="1290" cy="290" rx="5" ry="3"/>
    <ellipse cx="1305" cy="286" rx="4.4" ry="2.6"/><ellipse cx="1318" cy="292" rx="5.2" ry="3"/>
    <ellipse cx="1336" cy="288" rx="4.6" ry="2.8"/>
  </g>
  <path d="M1243 286h.1M1257 290h.1M1271 284h.1M1285 289h.1M1300 285h.1M1313 291h.1M1331 287h.1" stroke="#5e5b52" stroke-width="2" stroke-linecap="round" opacity="0.5" fill="none"/>
  <ellipse cx="1368" cy="292" rx="6" ry="3.4" fill="#55524a" opacity="0.5"/>
  <path d="M1374 290l3 -3" stroke="#55524a" stroke-width="2" opacity="0.5"/>`;

  // ---- Les errants de la plaine — des points sombres qui marchent vers le sud ----
  s += zfig(1056, 261, 0.5, '#0b0c10', a.nuit, 11);
  s += zfig(1196, 268, 0.42, '#0b0c10', a.nuit, 14);
  s += zfig(1422, 258, 0.55, '#0a0b10', a.nuit, 9);
  s += zfig(1520, 270, 0.4, '#0b0c10', a.nuit, 16);
  s += `<path d="M1120 96q6 -7 12 0M1162 110q5 -6 10 0q5 -6 10 0M1390 84q6 -7 12 0M1448 118q5 -6 10 0" stroke="#060608" stroke-width="2" fill="none" opacity="0.8"/>`;

  // ---- Les signaux morts : sortie de gare et entrée de pleine voie ----
  s += `<path d="M458 306v-48h-9" stroke="#101117" stroke-width="3" fill="none"/><circle cx="446" cy="258" r="3" fill="#a31621" opacity="0.5"/>`;
  s += `<path d="M1560 306v-46h-9" stroke="#101117" stroke-width="3" fill="none"/><circle cx="1548" cy="260" r="3" fill="#a31621" opacity="0.45"/>`;

  // ---- La halle de la gare : sheds crevés, toit déchiré, piliers de fonte ----
  const rsh = rng(83);
  let verre = '', cadres = '', eclats = '';
  for (const x0 of [0, 160]) {
    const ax = x0 + 52;
    cadres += `M${x0} 112L${ax} 30L${x0 + 160} 112M${x0 + 26} 71V112M${ax + 27} 50.5V112M${ax + 54} 71V112`;
    if (rsh() < 0.6) verre += `M${x0} 112L${ax} 30L${ax} 112Z`;
    else eclats += `M${x0 + 14} 90l7 12 5 -9 6 14`;
    if (rsh() < 0.5) verre += `M${ax} 30L${x0 + 160} 112L${ax} 112Z`;
    else eclats += `M${ax + 36} 58l8 14 6 -8 7 16`;
  }
  s += verre ? `<path d="${verre}" fill="#0d1118" opacity="0.5"/>` : '';
  s += `<path d="${cadres}" stroke="#0a0b10" stroke-width="4.5" fill="none"/>`;
  s += eclats ? `<path d="${eclats}" stroke="#0d1016" stroke-width="2" fill="none" opacity="0.9"/>` : '';
  s += `<rect x="0" y="112" width="332" height="7" fill="#0b0c11"/>
  <path d="M332 112l20 3 -14 4 10 5 -16 7z" fill="#0b0c11"/>`;
  for (const px of [88, 248]) {
    s += `<path d="M${px - 46} 119Q${px} 121 ${px} 158M${px + 46} 119Q${px} 121 ${px} 158" stroke="#0b0c11" stroke-width="3" fill="none" opacity="0.9"/>
    <rect x="${px - 11}" y="119" width="22" height="6" fill="#090a0f"/>
    <rect x="${px - 5}" y="125" width="10" height="172" fill="#090a0f"/>
    <rect x="${px - 12}" y="297" width="24" height="8" fill="#090a0f"/>`;
  }
  // Le panneau de la gare, pendu de travers — plus personne pour le lire.
  s += `<g transform="rotate(-7 192 148)">
    <path d="M168 119v18M216 119v18" stroke="#15171e" stroke-width="2" fill="none"/>
    <rect x="158" y="137" width="84" height="22" fill="#0e1016"/>
    <rect x="166" y="144" width="44" height="6" fill="#222633" opacity="0.55"/>
  </g>`;

  // ---- La passerelle au-dessus des voies, noire de monde ----
  s += `<rect x="318" y="186" width="270" height="8" fill="#0b0c11"/>
  <path d="M318 172h270" stroke="#0b0c11" stroke-width="2.4" fill="none"/>`;
  let gc = '';
  for (let gx = 322; gx < 588; gx += 18) gc += `M${gx} 172v14`;
  s += `<path d="${gc}" stroke="#0b0c11" stroke-width="1.6" fill="none" opacity="0.9"/>`;
  s += `<rect x="334" y="194" width="9" height="118" fill="#0a0b10"/>
  <rect x="560" y="194" width="9" height="118" fill="#0a0b10"/>
  <path d="M588 186l56 70q4 6 12 6h12" stroke="#0b0c11" stroke-width="6" fill="none"/>
  <path d="M588 172l56 70" stroke="#0b0c11" stroke-width="2" fill="none"/>`;
  const rpa = rng(909), tetes = [];
  for (let i = 0; i < 10; i++) tetes.push([R(330 + rpa() * 250), R(174 + rpa() * 8)]);
  s += dots(tetes, 2.6, '#0a0b10', 0.85);
  s += zfig(352, 168.7, 0.36, '#0a0b10', a.nuit, -10);
  s += zfig(396, 168.9, 0.35, '#0a0b10', a.nuit, 12);
  s += zfig(448, 168.7, 0.36, '#0a0b10', a.nuit, -14);
  s += zfig(506, 169.2, 0.34, '#0a0b10', a.nuit, 8);
  s += zfig(548, 168.9, 0.35, '#0a0b10', a.nuit, 18);
  s += zfig(612, 196, 0.38, '#0a0b10', a.nuit, 24);

  // ---- Le quai : bordure, ligne de sécurité, rampe d'extrémité ----
  s += `<rect x="0" y="262" width="440" height="${PH - 262}" fill="#101218"/>
  <rect x="0" y="262" width="440" height="7" fill="#181a21"/>
  <path d="M440 262l64 50h-64z" fill="#101218"/>
  <path d="M440 264l60 47" stroke="#181a21" stroke-width="3"/>
  <path d="M0 309H440" stroke="#474c5a" stroke-width="2.4" stroke-dasharray="16 26" opacity="0.26"/>`;
  const rpv = rng(913);
  let pav = '';
  for (let i = 0; i < 36; i++) pav += `M${R(rpv() * 432)} ${R(272 + rpv() * 32)}h8`;
  s += `<path d="${pav}" stroke="#0a0b10" stroke-width="1.8" fill="none" opacity="0.5"/>`;
  s += lampadaire(400, 262, 58, '#0d0e13', 6);

  // ---- Ce que la marée a laissé sur le ciment ----
  s += `<g fill="#0d0e14">
    <rect x="118" y="286" width="32" height="19" rx="2"/>
    <rect x="136" y="271" width="26" height="16" rx="2"/>
    <path d="M143 271v-5h11v5" stroke="#0d0e14" stroke-width="3" fill="none"/>
  </g>
  <path d="M196 300l30 -6 4 8 -30 6z" fill="#0c0d13"/>
  <path d="M204 297q10 -6 22 -4" stroke="#1d2027" stroke-width="4" fill="none"/>
  <g stroke="#14161d" fill="none" stroke-width="3">
    <path d="M258 300l40 -8M264 302l-6 -20"/>
    <circle cx="268" cy="303" r="5.5" fill="#0a0b10" stroke="none"/>
    <circle cx="296" cy="297" r="5.5" fill="#0a0b10" stroke="none"/>
  </g>`;
  s += `<path d="M70 282q70 14 150 10l-8 8q-76 2 -136 -8z" fill="#22080a" opacity="0.5"/>
  <path d="M352 270q26 -2 48 2l-5 6q-22 -3 -40 -2z" fill="#a31621" opacity="0.28"/>`;
  const rdb = rng(505), deb = [];
  for (let i = 0; i < 14; i++) deb.push([R(30 + rdb() * 390), R(272 + rdb() * 28)]);
  s += dots(deb, 1.8, '#3c414c', 0.2);

  // ---- Eux : la meute qui a suivi le train, et celui qui s'est arrêté ----
  s += dots([[34, 272], [52, 276], [68, 270], [88, 274], [110, 271], [126, 275]], 3.2, '#0a0b10', 0.9);
  s += zfig(92, 242, 0.62, '#0b0c10', a.nuit, 16);
  s += zfig(132, 239, 0.66, '#0a0b10', a.nuit, 20);
  s += zfig(170, 246, 0.58, '#0b0c10', a.nuit, 12);
  s += zfig(204, 250, 0.52, '#0b0c10', a.nuit, 18);
  // Lui. Planté au bord du quai, immobile, qui regarde le train partir.
  s += zfig(334, 230, 0.86, '#0a0b10', a.nuit, -3);

  // ---- Brume au sol, en deux nappes ----
  s += brume(a, 250, '#3a4150', 0.13, 'p1') + `<g transform="translate(800,0)">${brume(a, 250, '#3a4150', 0.13, 'p2')}</g>`;

  // ---- La voie sous la machine : ballast, traverses, rails pleine largeur ----
  s += `<rect x="0" y="312" width="${PW}" height="${PH - 312}" fill="#0b0c11"/>`;
  let trav = '';
  for (let sx = 10; sx < PW; sx += 34) trav += `M${sx} 315V336`;
  s += `<path d="${trav}" stroke="#08090d" stroke-width="6" fill="none"/>
  <path d="M0 318H${PW}M0 330H${PW}" stroke="#1e2129" stroke-width="2.6"/>`;
  // Une borne kilométrique, un bout de tôle entre les rails.
  s += `<rect x="1452" y="296" width="10" height="14" rx="2" fill="#565a64" opacity="0.45"/>
  <path d="M1452 300h10" stroke="#0b0c11" stroke-width="1.6"/>
  <path d="M530 324l26 -4" stroke="#15161d" stroke-width="5"/>`;
  s += pin(930, 308, 0.85, '#0a0d0a') + pin(1336, 312, 1.15, '#0a0d0a') + pin(1592, 306, 0.8, '#0a0d0a');

  s += neige(37, 34, 0.35) + `<g transform="translate(800,0)">${neige(91, 34, 0.35)}</g>`;

  // Voile final pleine largeur (voileNuit ne couvre que 800).
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
