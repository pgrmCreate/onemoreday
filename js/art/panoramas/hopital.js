// Panorama « L'hôpital » — cinématique 1600×340, travelling gauche → droite.
// L'hôpital du Pays Salonais (207 avenue Julien Fabre) : à gauche l'avenue,
// le totem « H », les ambulances figées portes ouvertes ; au centre la grande
// façade aux fenêtres mortes, la tente de triage effondrée, les traînées
// sombres qui remontent TOUTES vers le hall, le drap pendu à une fenêtre
// avec son mot délavé ; point d'orgue à droite (x ≈ 1300–1550) : la baie des
// urgences barricadée DE L'INTÉRIEUR, mains séchées sur les vitres, errants
// agglutinés sur la rampe d'accès.
import {
  R, rng, dots, halo, astre, etoiles, neige, brume, batisse, toits,
  zfig, carcasse, lampadaire, pin,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 252, 58);
  s += etoiles(a, 53, 66) + `<g transform="translate(800,0)">${etoiles(a, 97, 66)}</g>`;

  // ---- Lointain : les toits du quartier Julien Fabre ----
  s += toits(23, 212, 36, '#0b0c12', 0.75)
    + `<g transform="translate(800,0)">${toits(71, 212, 36, '#0b0c12', 0.75)}</g>`;

  // ---- Ailes secondaires (l'EHPAD attenant, un plot technique au bord droit) ----
  s += batisse(a, 466, 246, 100, 100, '#0d0e14', 47);
  s += `<rect x="1580" y="126" width="20" height="120" fill="#0d0e14"/>`;

  // ---- Le bâtiment principal : barre de quatre niveaux, toiture technique ----
  s += `<rect x="560" y="96" width="700" height="150" fill="#101117"/>
    <rect x="560" y="90" width="700" height="6" fill="#0b0c11"/>
    <rect x="640" y="76" width="44" height="14" fill="#0b0c11"/>
    <rect x="902" y="78" width="36" height="12" fill="#0b0c11"/>
    <rect x="1086" y="74" width="50" height="16" fill="#0b0c11"/>
    <path d="M1150 90v-26M1144 70h12" stroke="#0b0c11" stroke-width="2.5" fill="none"/>
    <path d="M696 96v150M1128 96v150M832 96v88M1000 96v88" stroke="#0b0c11" stroke-width="2" opacity="0.7"/>`;

  // Trois bandes de fenêtres : noires, brisées ou condamnées — déterministe.
  const rf = rng(733);
  let noires = '', fissures = '', planches = '';
  for (let f = 0; f < 3; f++) {
    const fy = 110 + f * 38;
    for (let fx = 576; fx <= 1220; fx += 34) {
      if (f === 2 && fx > 820 && fx < 1004) continue; // le hall d'entrée mange ce niveau
      const v = rf();
      noires += `M${fx} ${fy}h24v16h-24z`;
      if (v < 0.1) planches += `M${fx} ${fy + 15}l24 -14M${fx} ${fy + 2}l24 13`;
      else if (v < 0.24) fissures += `M${fx + 4} ${fy + 2}l7 9 5 -6 6 10`;
      else if (v > 0.95) fissures += `M${fx + 19} ${fy + 2}v12`;
    }
  }
  s += `<path d="${noires}" fill="#06070b"/>`;
  s += `<path d="${fissures}" stroke="#1c1d24" stroke-width="1.8" fill="none" opacity="0.9"/>`;
  s += `<path d="${planches}" stroke="#2c2820" stroke-width="3.4" fill="none" opacity="0.85"/>`;
  // Une seule veilleuse, tout en haut près des urgences — quelqu'un, ou quelque chose.
  s += halo(a, 'veille', 1198, 118, 24, 18, '#c9882a', 0.16);
  s += `<rect x="1186" y="110" width="24" height="16" fill="#c9882a" opacity="0.12"/>`;

  // ---- LE DRAP pendu à une fenêtre du deuxième : un mot peint, délavé, illisible ----
  s += `<path d="M676 163h30l4 58q-10 9 -22 6l-8 -6z" fill="#c8c2b0" opacity="0.78"/>
    <path d="M684 168q-2 26 1 50M695 168q2 24 0 50M702 169q3 22 4 44" stroke="#8e8a7c" stroke-width="1.4" fill="none" opacity="0.5"/>
    <path d="M683 186q8 4 18 2M684 196q7 4 16 2M685 206q6 3 13 2" stroke="#20232b" stroke-width="2.6" fill="none" opacity="0.75"/>
    <path d="M688 190l1 9M697 197l1 8M691 200l1 7" stroke="#20232b" stroke-width="1.4" fill="none" opacity="0.6"/>
    <path d="M703 174q4 16 2 34" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.35"/>`;

  // ---- Le hall d'entrée : verrière crevée, auvent, croix terne, lit dressé dedans ----
  s += `<rect x="846" y="184" width="134" height="62" fill="#07080d"/>
    <path d="M880 184v62M914 184v62M948 184v62" stroke="#13141a" stroke-width="3"/>
    <path d="M856 200l12 18 8 -12 10 22M952 196l8 14 6 -8" stroke="#1c1d24" stroke-width="2" fill="none"/>
    <path d="M850 214l16 -10 14 8 -6 18 -18 6z" fill="#030408"/>
    <path d="M880 236h36M884 236v-10h26v10" stroke="#2a2d35" stroke-width="2.4" fill="none" opacity="0.8"/>`;
  s += zfig(900, 198, 0.5, '#101218', a.nuit, -4);
  s += `<rect x="822" y="176" width="180" height="9" fill="#0b0c11"/>
    <rect x="826" y="178" width="172" height="4" fill="#b9b4a6" opacity="0.16"/>
    <path d="M850 180h14M872 180h10M890 180h16M914 180h12M934 180h14M956 180h10" stroke="#20232b" stroke-width="3" opacity="0.5"/>
    <path d="M834 185v61M988 185v61" stroke="#0b0c11" stroke-width="5"/>
    <rect x="896" y="150" width="20" height="20" rx="2" fill="#0d0e14"/>
    <path d="M906 154v12M900 160h12" stroke="#a31621" stroke-width="4" opacity="0.55"/>`;
  // Verre au sol devant le sas.
  s += `<path d="M872 254l6 4M888 258l7 -3M902 252l5 4M922 256l6 3" stroke="#3c414c" stroke-width="1.6" fill="none" opacity="0.45"/>`;

  // ---- Le sol : parvis, bordure, places de parking effacées, joints ----
  s += `<rect x="0" y="246" width="${PW}" height="${PH - 246}" fill="#11131a"/>
    <rect x="0" y="246" width="${PW}" height="6" fill="#181a21"/>`;
  let marq = '';
  for (let i = 0; i < 9; i++) marq += `M${184 + i * 58} 286l-10 30`;
  s += `<path d="${marq}" stroke="#474c5a" stroke-width="2.2" opacity="0.16" fill="none"/>`;
  const rj = rng(508);
  let joints = '';
  for (let i = 0; i < 80; i++) joints += `M${R(rj() * PW)} ${R(252 + rj() * 80)}h7`;
  s += `<path d="${joints}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.6"/>`;
  // Papiers d'admission envolés ; masques chirurgicaux piétinés, pâles.
  const rp = rng(821), pap = [];
  for (let i = 0; i < 24; i++) pap.push([R(rp() * PW), R(254 + rp() * 78)]);
  s += dots(pap, 1.8, '#3c414c', 0.22);
  const rm = rng(355), masq = [];
  for (let i = 0; i < 14; i++) masq.push([R(560 + rm() * 980), R(258 + rm() * 70)]);
  s += dots(masq, 2.6, '#aeb6c6', 0.18);

  // La haie d'accueil, morte, le long de la façade.
  let haie = 'M566 256';
  for (let hx = 566; hx < 830; hx += 24) haie += 'q12 -13 24 0';
  s += `<path d="${haie}v6h-264z" fill="#0f130e" opacity="0.9"/>`;

  // ---- Les traînées sombres : TOUTES remontent vers l'intérieur ----
  s += `<path d="M610 306q120 -24 268 -54l6 6q-150 30 -266 54z" fill="#22080a" opacity="0.5"/>
    <path d="M700 292q90 -20 180 -38M706 297q90 -20 178 -38" stroke="#22080a" stroke-width="1.6" fill="none" opacity="0.5"/>
    <path d="M1042 300q-70 -22 -134 -40l8 -5q66 18 132 38z" fill="#22080a" opacity="0.45"/>
    <path d="M286 314q60 -8 118 -22l5 6q-58 14 -116 22z" fill="#22080a" opacity="0.4"/>`;

  // ---- Helpers locaux : ambulance, brancard, potence, fauteuil, main séchée ----
  // Ambulance figée — caisse pâle, bande et croix passées, portes arrière béantes.
  const ambu = (x, y, sens = 1) => `<g transform="translate(${x},${y}) scale(${sens},1)">
    <rect x="-104" y="-45" width="6" height="36" fill="#171a21"/>
    <g transform="rotate(9 -92 -10)">
      <rect x="-134" y="-42" width="32" height="33" fill="#181b22"/>
      <rect x="-130" y="-25" width="25" height="6" fill="#a31621" opacity="0.4"/>
    </g>
    <rect x="-92" y="-48" width="86" height="40" rx="3" fill="#1b1e25"/>
    <rect x="-92" y="-44" width="20" height="34" fill="#06070b"/>
    <path d="M-74 -20h-18M-74 -28h-18" stroke="#8e93a0" stroke-width="2" fill="none" opacity="0.45"/>
    <path d="M-6 -48h26q7 0 10 7l9 18q2 5 2 9v6h-47z" fill="#171a21"/>
    <path d="M-2 -44h21q5 0 7 5l7 15h-35z" fill="#07080d"/>
    <rect x="-88" y="-27" width="78" height="7" fill="#a31621" opacity="0.5"/>
    <path d="M-56 -36h12M-50 -42v12" stroke="#a31621" stroke-width="4" opacity="0.5"/>
    <rect x="-90" y="-46" width="82" height="3" fill="#c8c2b0" opacity="0.28"/>
    <rect x="-34" y="-54" width="16" height="6" rx="2" fill="#a31621" opacity="0.55"/>
    <circle cx="-68" cy="-5" r="8.5" fill="#08080b"/><circle cx="-68" cy="-5" r="3" fill="#15161d"/>
    <circle cx="22" cy="-5" r="8.5" fill="#08080b"/><circle cx="22" cy="-5" r="3" fill="#15161d"/>
    <path d="M-92 -8h114" stroke="#0a0a0e" stroke-width="3"/>
  </g>`;
  // Brancard d'urgence : châssis en X, roulettes folles ; rot pour le renverser.
  const brancard = (x, y, rot = 0, sc = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})">
    <rect x="-28" y="-26" width="56" height="6" rx="2" fill="#23262e"/>
    <rect x="-26" y="-30" width="20" height="4" rx="2" fill="#b9b4a6" opacity="0.35"/>
    <path d="M-20 -20L16 4M16 -20L-20 4" stroke="#1d2027" stroke-width="3.5" fill="none"/>
    <circle cx="-20" cy="7" r="4" fill="#08080b"/><circle cx="16" cy="7" r="4" fill="#08080b"/>
    <path d="M-28 -23h8M20 -23h8" stroke="#2a2d35" stroke-width="2" fill="none"/>
  </g>`;
  // Potence à perfusion, sa poche encore pendue.
  const potence = (x, y, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="#2a2d35" stroke-width="2.4" fill="none">
    <path d="M0 0v-52M-8 0h16M-6 -52q6 -6 12 0"/>
    <path d="M6 -50v7" stroke-width="1.6"/>
    <rect x="3" y="-43" width="7" height="10" rx="2" fill="#3c414c" stroke="none" opacity="0.8"/>
  </g>`;
  // Fauteuil roulant couché sur le flanc.
  const fauteuil = (x, y, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="#1d2027" fill="none">
    <circle cx="0" cy="0" r="11" stroke-width="2.6"/><circle cx="0" cy="0" r="2.5" fill="#1d2027" stroke="none"/>
    <circle cx="14" cy="6" r="4.5" stroke-width="2"/>
    <path d="M0 -11q-12 -2 -14 -14h12l4 12M-2 -25h12M14 2v-14" stroke-width="2.6"/>
  </g>`;
  // Trace de main séchée (sur les vitres des urgences).
  const main = (x, y, sc, o) => `<g transform="translate(${x},${y}) scale(${sc})" opacity="${o}">
    <circle cx="0" cy="0" r="3.2" fill="#a31621"/>
    <path d="M-3 -4l-1 -5M0 -5l0 -6M3 -4l1 -5M5 -1l4 -3M-1 4q-3 7 -2 15" stroke="#a31621" stroke-width="1.7" fill="none"/>
  </g>`;

  // ---- L'avenue, à gauche : totem « H », barrière figée, première ambulance ----
  s += `<path d="M84 246v-84" stroke="#13141a" stroke-width="6"/>
    <rect x="62" y="118" width="44" height="44" rx="3" fill="#141d28"/>
    <rect x="65" y="121" width="38" height="38" rx="2" fill="none" stroke="#3a4150" stroke-width="1.6" opacity="0.7"/>
    <path d="M76 130v20M92 130v20M76 140h16" stroke="#c8cdd8" stroke-width="4.5" opacity="0.55" fill="none"/>
    <path d="M62 134l44 16" stroke="#22080a" stroke-width="3" opacity="0.4"/>`;
  s += `<rect x="136" y="222" width="10" height="24" fill="#0d0e13"/>
    <g transform="rotate(-38 146 226)"><rect x="146" y="223" width="64" height="5" fill="#8a4a20" opacity="0.55"/>
    <path d="M154 223l5 5M170 223l5 5M186 223l5 5" stroke="#1a1b22" stroke-width="4" fill="none"/></g>`;
  s += ambu(268, 318, 1);
  s += brancard(178, 318, -64, 0.9);
  s += potence(330, 300, 12);

  // Carcasse qui couve encore — une fumée maigre, droite, sans personne pour la voir.
  s += carcasse(312, 320, 1, '#0a0a0d', 7);
  s += `<path d="M352 292q-8 -28 4 -52q-12 -22 -2 -44" stroke="#3a4150" stroke-width="10" fill="none" opacity="0.12" stroke-linecap="round"/>
    <path d="M358 292q-4 -24 6 -46q-8 -20 0 -38" stroke="#3a4150" stroke-width="5" fill="none" opacity="0.1" stroke-linecap="round"/>`;

  // ---- La tente de triage, déchirée, son entrée béante ; les formes alignées devant ----
  s += `<g>
    <path d="M426 308l32 -52h86l32 52z" fill="#171a13"/>
    <path d="M426 308l32 -52h86l32 52" stroke="#0d0f0a" stroke-width="2" fill="none"/>
    <path d="M458 256h86" stroke="#0d0f0a" stroke-width="2"/>
    <rect x="426" y="308" width="150" height="4" fill="#0b0c11"/>
    <path d="M488 308l10 -36 12 36z" fill="#06070b"/>
    <path d="M500 272l-6 36" stroke="#0d0f0a" stroke-width="1.4" fill="none"/>
    <path d="M534 282l16 10 -12 4z" fill="#06070b"/>
    <rect x="462" y="262" width="22" height="16" fill="#b9b4a6" opacity="0.3"/>
    <path d="M470 264v12M465 270h16" stroke="#a31621" stroke-width="3.4" opacity="0.55"/>
    <path d="M426 308l-16 14M576 308l16 14M458 256l-10 -12M544 256l10 -12" stroke="#10120c" stroke-width="1.6" fill="none"/>
  </g>`;
  let civ = '';
  for (let i = 0; i < 4; i++) {
    const bx = 424 + i * 32;
    civ += `<path d="M${bx} 330q14 -10 28 0z" fill="#23262c"/>
    <path d="M${bx + 3} 327q11 -6 22 0" stroke="#b9b4a6" stroke-width="1.6" fill="none" opacity="0.3"/>`;
  }
  s += civ + `<path d="M548 330q6 -8 12 -6" stroke="#0b0c10" stroke-width="4" fill="none"/>`;
  s += potence(598, 314);
  s += brancard(620, 322, -6);

  // ---- Deuxième ambulance, montée sur le parvis, le nez vers la haie ----
  s += `<g transform="rotate(-3 700 314)">${ambu(700, 314, -1)}</g>`;
  s += brancard(812, 312, 10, 0.9);
  s += fauteuil(986, 310, -78);
  s += potence(1024, 316, -82);
  s += brancard(906, 314, -74, 0.95);
  s += carcasse(1056, 322, 0.95, '#101117', 14);

  // ---- Le point d'orgue : l'aile des URGENCES, barricadée de l'intérieur ----
  s += `<rect x="1256" y="196" width="36" height="50" fill="#0d0e14"/>`;
  s += `<rect x="1288" y="166" width="292" height="80" fill="#0e0f15"/>
    <rect x="1288" y="162" width="292" height="6" fill="#0b0c11"/>`;
  // L'enseigne rouge, de travers, ses lettres réduites à des barres délavées.
  s += `<g transform="rotate(-2.5 1404 187)">
    <rect x="1330" y="176" width="148" height="21" fill="#a31621" opacity="0.42"/>
    <path d="M1340 187h12M1357 187h9M1371 187h11M1387 187h8M1400 187h12M1417 187h9M1431 187h11M1447 187h8" stroke="#c8cdd8" stroke-width="6" opacity="0.4"/>
    <path d="M1330 176l-4 -6" stroke="#15161d" stroke-width="2.5" fill="none"/>
  </g>
  <path d="M1352 198v8M1422 197v6" stroke="#a31621" stroke-width="2" opacity="0.3"/>`;
  // La baie vitrée : derrière le verre, planches en croix, armoires, lits dressés.
  s += `<rect x="1322" y="200" width="166" height="46" fill="#07080d"/>`;
  s += zfig(1408, 196, 0.5, '#060709', a.nuit, 0);
  s += `<g opacity="0.9">
    <rect x="1330" y="206" width="30" height="40" fill="#14161d"/>
    <rect x="1424" y="216" width="56" height="18" fill="#14161d"/>
    <path d="M1328 242l64 -34M1346 246l66 -34M1486 244l-58 -36M1470 246l-50 -32" stroke="#4a4336" stroke-width="6" fill="none" opacity="0.7"/>
    <path d="M1394 208l-2 38M1428 210l-2 36" stroke="#4a4336" stroke-width="5" fill="none" opacity="0.6"/>
  </g>`;
  s += `<path d="M1364 200v46M1405 200v46M1446 200v46" stroke="#13141a" stroke-width="3"/>
    <path d="M1336 240l30 -36" stroke="#aeb6c6" stroke-width="2" fill="none" opacity="0.07"/>`;
  s += main(1354, 224, 1, 0.4) + main(1378, 232, 0.9, 0.32) + main(1462, 226, 1.05, 0.38) + main(1438, 236, 0.8, 0.3);
  // Auvent du sas ambulances.
  s += `<rect x="1310" y="192" width="190" height="7" fill="#0b0c11"/>
    <path d="M1316 199v47M1494 199v47" stroke="#0b0c11" stroke-width="4"/>`;
  // Le quai des urgences et sa rampe — garde-corps tordu, traînée presque fraîche.
  s += `<path d="M1160 312L1296 254h290v58z" fill="#0f1118"/>
    <path d="M1160 312L1296 254" stroke="#1d2027" stroke-width="2" fill="none"/>
    <path d="M1172 306l124 -52M1172 306v6M1212 288v6M1252 270v6M1292 254v6" stroke="#1d2027" stroke-width="2" fill="none" opacity="0.8"/>`;
  s += `<path d="M1208 296q60 -28 132 -42l6 5q-72 16 -132 42z" fill="#a31621" opacity="0.28"/>`;
  // Troisième ambulance au pied de la rampe, ouverte sur le noir.
  s += ambu(1108, 320, -1);
  s += brancard(1230, 296, -58, 0.85);

  // ---- Mobilier urbain ----
  s += lampadaire(388, 318, 76, '#0d0e13', -4);
  s += lampadaire(1090, 318, 72, '#0d0e13', 8);
  s += pin(40, 314, 1.05, '#0a0d0a');

  // ---- Les errants : épars sur le parvis, agglutinés contre la baie des urgences ----
  s += zfig(132, 294, 0.55, '#0b0c10', a.nuit, 7);
  s += zfig(236, 302, 0.6, '#0b0c10', a.nuit, -10);
  s += zfig(636, 298, 0.6, '#0b0c10', a.nuit, -9);
  s += zfig(872, 296, 0.55, '#0a0b10', a.nuit, 11);
  s += zfig(948, 304, 0.7, '#0b0c10', a.nuit, -14);
  s += zfig(1078, 300, 0.62, '#0a0b10', a.nuit, 8);
  // La grappe, front collé aux vitres.
  const rh = rng(1201), gr = [];
  for (let i = 0; i < 14; i++) gr.push([R(1336 + rh() * 136), R(232 + rh() * 12)]);
  s += dots(gr, 3.2, '#0a0b10', 0.9);
  s += zfig(1352, 226, 0.62, '#0b0c10', a.nuit, 14);
  s += zfig(1386, 224, 0.64, '#0a0b10', a.nuit, -16);
  s += zfig(1420, 228, 0.6, '#0b0c10', a.nuit, 18);
  s += zfig(1452, 226, 0.62, '#0a0b10', a.nuit, -12);
  s += zfig(1258, 240, 0.6, '#0b0c10', a.nuit, 10);
  s += zfig(1502, 282, 0.8, '#0a0b10', a.nuit, 12);
  s += zfig(1532, 296, 0.95, '#0a0b10', a.nuit, -8);

  // ---- Les corbeaux : posés sur les auvents, en vol au-dessus de la barre ----
  const corbeau = (x, y, sc = 1, k = 1) => `<g transform="translate(${x},${y}) scale(${R(k * sc)},${sc})" fill="#060608">
    <ellipse cx="0" cy="-3" rx="7" ry="4.4"/><circle cx="6.5" cy="-7" r="2.8"/>
    <path d="M9 -7l5.5 1.6 -5.5 1.2zM-5 -4l-8 -4 3 6z"/></g>`;
  s += corbeau(840, 176, 0.9) + corbeau(1342, 192, 0.85, -1) + corbeau(536, 256, 0.8);
  s += `<path d="M1132 70q6 -7 12 0q6 -7 12 0M1248 96q6 -7 12 0M520 88q5 -6 10 0q5 -6 10 0M958 60q6 -7 12 0" stroke="#060608" stroke-width="2" fill="none" opacity="0.8"/>`;

  // ---- Brume au sol et neige fine, en deux moitiés ----
  s += brume(a, 250, '#3a4150', 0.14, 'p1') + `<g transform="translate(800,0)">${brume(a, 250, '#3a4150', 0.14, 'p2')}</g>`;
  s += neige(37, 28, 0.34) + `<g transform="translate(800,0)">${neige(79, 28, 0.34)}</g>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
