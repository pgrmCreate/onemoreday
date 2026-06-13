// Panorama « L'Empéri » — cinématique 1600×340, travelling gauche → droite.
// On marche sur le chemin de ronde. À gauche, tout Salon en contrebas : les
// toits serrés du centre ancien, trois colonnes de fumée, une tranchée de rue
// où ça grouille encore, la plaine de la Crau jusqu'à la crête des Alpilles.
// Au centre, la tour d'angle massive pivote vers l'intérieur. À droite, la
// cour d'honneur VIDE — fenêtres à meneaux, échafaudage du chantier abandonné,
// galerie Renaissance, canon du musée, une forme sous une bâche — et les
// charognards qui tournent au-dessus (point d'orgue x ≈ 1150–1550).
import {
  R, rng, dots, astre, etoiles, neige, brume, toits, zfig,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

// Charognard perché — dos voûté, cou nu, bec crochu. k = -1 pour le miroir.
const percheur = (x, y, sc = 1, k = 1) => `<g transform="translate(${x},${y}) scale(${R(k * sc)},${sc})" fill="#060608">
  <path d="M-10 0q-5 -11 0 -17q5 -6 13 -4q4 1 6 -2q3 -3 5 -1q2 2 -1 5l-3 3q3 7 -1 16z"/>
  <path d="M13 -19l7 2 -6 3z"/>
  <path d="M-5 0l-1 4M3 0l1 4" stroke="#060608" stroke-width="1.7" fill="none"/>
</g>`;

// Charognard en vol — deux arcs d'ailes, rien d'autre. Ça suffit.
const volant = (x, y, sc = 1) => `<g transform="translate(${x},${y}) scale(${sc})" stroke="#060608" stroke-width="2.6" fill="none" stroke-linecap="round">
  <path d="M-13 0Q-6 -8 0 -1Q6 -8 13 0"/>
</g>`;

export default function (a) {
  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 380, 54);
  s += etoiles(a, 43, 64) + `<g transform="translate(800,0)">${etoiles(a, 89, 64)}</g>`;

  // ---- Le lointain vu d'en haut : crête des Alpilles, plaine de la Crau ----
  s += `<path d="M0 192Q90 176 190 186Q300 196 420 184Q540 174 660 188L660 222L0 222Z" fill="#0b0c11" opacity="0.5"/>`;
  s += `<rect x="0" y="202" width="680" height="34" fill="#0c0d12" opacity="0.45"/>`;

  // ---- Les toits de Salon en contrebas — deux bandes de pignons serrés ----
  s += toits(21, 218, 28, '#0b0c12', 0.8);
  // La Tour de l'Horloge, loin au nord, campanile de fer contre le ciel.
  s += `<g fill="#0a0b10"><rect x="78" y="188" width="14" height="32"/>
    <path d="M80 186q5 -9 10 0M78 187q7 -13 14 0" stroke="#0a0b10" stroke-width="1.4" fill="none"/></g>`;
  // Bande proche : faîtages, tuiles, le clocher-tour de Saint-Michel.
  s += `<path d="M0 340L0 252L34 230L70 252L70 246L122 246L122 234L168 220L214 234L214 252L262 252L300 236L338 252L338 246L382 246L428 242L474 224L520 242L520 252L568 252L596 238L624 252L624 246L678 230L726 252L726 340Z" fill="#0d0e14"/>`;
  s += `<rect x="292" y="214" width="16" height="24" fill="#0c0d13"/>
    <path d="M292 214l8 -8 8 8z" fill="#0c0d13"/>
    <path d="M296 222q4 -7 8 0v7h-8z" fill="#06070b"/>`;
  // Pentes de tuiles et grain des toitures.
  s += `<path d="M34 230l36 22M168 220l46 14M300 236l38 16M474 224l46 18M596 238l28 14M678 230l48 22" stroke="#08090d" stroke-width="1.4" fill="none" opacity="0.6"/>`;
  const rt = rng(311), tui = [];
  for (let i = 0; i < 40; i++) tui.push([R(rt() * 700), R(228 + rt() * 20)]);
  s += dots(tui, 1.4, '#08090d', 0.35);
  // Cheminées froides, une antenne tordue.
  s += `<g fill="#0b0c11"><rect x="60" y="238" width="7" height="12"/><rect x="186" y="216" width="8" height="13"/><rect x="332" y="240" width="7" height="10"/><rect x="500" y="234" width="8" height="12"/><rect x="650" y="226" width="7" height="12"/></g>`;
  s += `<path d="M610 240v-20M604 224h12M606 229h8" stroke="#0c0d12" stroke-width="1.6" fill="none"/>`;
  // Un toit crevé — chevrons à nu au-dessus du trou.
  s += `<path d="M176 232l26 -9 9 7 -3 12 -24 5z" fill="#06070b"/>
    <path d="M180 234l20 -7M186 240l16 -6" stroke="#15161d" stroke-width="1.4" fill="none"/>`;

  // ---- La tranchée d'une rue, en contrebas : eux, minuscules, qui tournent en rond ----
  s += `<path d="M382 246L428 242L436 274L374 274Z" fill="#07080d"/>`;
  const rz = rng(733), pz = [];
  for (let i = 0; i < 14; i++) pz.push([R(386 + rz() * 42), R(250 + rz() * 18)]);
  s += dots(pz, 2.2, '#0d0e14', 0.9);
  s += zfig(398, 250, 0.22, '#0c0d12', a.nuit, 10) + zfig(417, 258, 0.26, '#0c0d12', a.nuit, -12);

  // ---- Trois colonnes de fumée — quelque part, quelque chose brûle encore ----
  s += `<path d="M118 238q-8 -26 2 -48q9 -22 -2 -44q-9 -20 2 -40M340 248q-9 -24 0 -46q8 -22 -2 -42q-8 -20 1 -38M592 246q-8 -22 1 -44q8 -22 -1 -42" stroke="#4d515c" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.26"/>`;
  s += volant(222, 98, 0.55) + volant(262, 112, 0.5) + volant(556, 84, 0.6);

  // ---- Le parapet du chemin de ronde : merlons, joints, lichen ----
  s += `<rect x="0" y="272" width="760" height="68" fill="#11121a"/>`;
  let mer = '';
  for (let mx = 6; mx < 640; mx += 52) mer += `<rect x="${mx}" y="250" width="28" height="26" fill="#11121a"/>`;
  s += mer + `<path d="M0 272h760" stroke="#1c1e26" stroke-width="1.6" opacity="0.6"/>`;
  const rj = rng(212);
  let jnt = '';
  for (let i = 0; i < 26; i++) jnt += `M${R(rj() * 740)} ${R(280 + rj() * 52)}h10`;
  s += `<path d="${jnt}" stroke="#0b0c10" stroke-width="1.8" fill="none" opacity="0.5"/>`;
  // Lichen sur la pierre — la seule chose qui pousse encore ici.
  const rl = rng(644), li = [];
  for (let i = 0; i < 16; i++) li.push([R(10 + rl() * 620), R(252 + rl() * 20)]);
  s += dots(li, 2.4, '#27361f', 0.25);
  // La table d'orientation, sa flèche gravée ; des jumelles tombées là.
  s += `<path d="M196 334l6 -28h16l6 28z" fill="#0d0e13"/>
    <ellipse cx="210" cy="306" rx="21" ry="5.5" fill="#13141c"/>
    <ellipse cx="210" cy="304.5" rx="21" ry="5.5" fill="none" stroke="#1c1e26" stroke-width="1.3"/>
    <path d="M201 305l15 1m-4 -3l5 3 -5 2" stroke="#c8c2b0" stroke-width="1.2" fill="none" opacity="0.28"/>`;
  s += `<circle cx="316" cy="332" r="3.4" fill="#08090d"/><circle cx="323" cy="333" r="3.4" fill="#08090d"/>
    <path d="M318 329q3 -2 5 0M312 332q-7 -3 -12 1" stroke="#08090d" stroke-width="1.3" fill="none"/>`;
  s += percheur(474, 250, 0.55);

  // ---- La tour d'angle : fruit du mur, créneaux, archères, blason mangé ----
  s += `<path d="M636 340L648 118Q650 72 658 62L818 62Q826 72 828 118L840 340Z" fill="#0c0d12"/>`;
  let cren = '';
  for (let cx = 654; cx < 812; cx += 26) cren += `<rect x="${cx}" y="46" width="14" height="18" fill="#0c0d12"/>`;
  s += cren;
  s += `<path d="M716 142v28M756 196v26M700 240v24M744 286v22" stroke="#06070b" stroke-width="4"/>
    <path d="M710 152h12M750 206h12" stroke="#06070b" stroke-width="2.4"/>
    <path d="M660 180h44M770 160h46M656 262h52M764 244h54M652 312h60" stroke="#08090d" stroke-width="1.4" opacity="0.5"/>`;
  s += `<path d="M774 190h28v20q-14 13 -28 0z" fill="none" stroke="#c8c2b0" stroke-width="1.4" opacity="0.12"/>`;
  s += percheur(700, 46, 0.7, -1);
  // La porte basse qui débouche dans la cour, gueule noire dans le rocher.
  s += `<path d="M806 340v-40q15 -16 30 0v40z" fill="#07080d"/>`;

  // ---- Le donjon, derrière la façade : créneaux, hampe sans drapeau ----
  s += `<rect x="1040" y="52" width="150" height="70" fill="#0d0e14"/>`;
  let crd = '';
  for (let cx = 1046; cx < 1184; cx += 24) crd += `<rect x="${cx}" y="38" width="13" height="16" fill="#0d0e14"/>`;
  s += crd;
  s += `<path d="M1108 38V12" stroke="#0c0d12" stroke-width="2.2"/>
    <path d="M1108 14q9 4 16 1l-5 7l-11 -3z" fill="#1d2027" opacity="0.9"/>`;
  s += percheur(1086, 38, 0.8);

  // ---- La façade de la cour d'honneur : créneaux, fenêtres à meneaux ----
  s += `<rect x="820" y="118" width="780" height="132" fill="#101117"/>`;
  let crf = '';
  for (let cx = 826; cx < 1180; cx += 38) crf += `<rect x="${cx}" y="106" width="19" height="14" fill="#101117"/>`;
  s += crf + `<path d="M820 124h780" stroke="#0b0c11" stroke-width="2.4" opacity="0.7"/>`;
  let fen = '', men = '';
  for (let i = 0; i < 6; i++) {
    const wx = 850 + i * 62;
    fen += `<rect x="${wx}" y="136" width="26" height="36" fill="#07080d"/><rect x="${wx}" y="188" width="26" height="30" fill="#07080d"/>`;
    men += `M${wx + 13} 136v36M${wx} 152h26M${wx + 13} 188v30M${wx} 201h26`;
  }
  s += fen + `<path d="${men}" stroke="#262833" stroke-width="3" fill="none"/>`;
  // Au-dessus de la dernière croisée, un lèchement de suie : ça a brûlé dedans.
  s += `<path d="M1162 130q12 -6 24 0l4 10" stroke="#060608" stroke-width="4" fill="none" opacity="0.6"/>`;

  // ---- L'échafaudage du chantier abandonné, bâches arrachées ----
  let ech = '';
  for (let ex = 858; ex <= 1008; ex += 30) ech += `M${ex} 118V250`;
  ech += 'M852 132H1014M852 166H1014M852 200H1014M852 234H1014';
  s += `<path d="${ech}" stroke="#15161d" stroke-width="3" fill="none"/>
    <path d="M858 166L918 132M918 200L978 166M948 250L1008 200" stroke="#15161d" stroke-width="2" fill="none" opacity="0.8"/>
    <rect x="852" y="162" width="162" height="5" fill="#14151c"/>
    <rect x="852" y="230" width="162" height="5" fill="#14151c"/>`;
  s += `<path d="M872 134q28 -6 58 0l-5 30q-9 9 -5 24l-16 5q3 -15 -6 -22l-13 5q-7 -24 -13 -42z" fill="#1d2027" opacity="0.85"/>
    <path d="M952 168q20 -4 38 2l-7 40q-12 6 -8 18l-12 3q2 -26 -11 -63z" fill="#1d2027" opacity="0.7"/>`;
  s += percheur(990, 162, 0.6, -1);

  // ---- La galerie Renaissance : balustrade, arcades sur du noir ----
  s += `<rect x="1180" y="128" width="360" height="122" fill="#12131b"/>`;
  let bal = '';
  for (let bx = 1188; bx < 1536; bx += 14) bal += `M${bx} 119v8`;
  s += `<path d="M1180 118h360M1180 128h360" stroke="#0e0f15" stroke-width="3"/>
    <path d="${bal}" stroke="#0e0f15" stroke-width="2.2" fill="none"/>`;
  let arcs = '', gfen = '';
  for (let k = 0; k < 5; k++) {
    const ax = 1196 + k * 70;
    arcs += `<path d="M${ax} 250v-46q25 -22 50 0v46z" fill="#07080d"/>`;
    gfen += `<rect x="${ax + 11}" y="148" width="28" height="26" fill="#0a0b10"/><path d="M${ax + 25} 148v26M${ax + 11} 160h28" stroke="#232530" stroke-width="2.4" fill="none"/>`;
  }
  s += arcs + gfen;
  // Fientes sous la balustrade : les arcades du musée servent de perchoir.
  s += `<path d="M1216 130v10M1287 131v8M1352 130v12M1433 131v9M1502 130v10" stroke="#c8c2b0" stroke-width="2" opacity="0.12"/>`;
  s += percheur(1402, 118, 0.85, -1) + percheur(1158, 106, 0.75);
  // Le mur-clocher de la chapelle castrale, cloche muette.
  s += `<path d="M1546 118v-24l26 -15 26 15v24z" fill="#0e0f15"/>
    <path d="M1564 104q8 -15 16 0v14h-16z" fill="#07080d"/>
    <path d="M1572 96q-5 7 -4 11h8q1 -4 -4 -11z" fill="#1a1b22"/>`;

  // ---- Le pavé de la cour d'honneur : joints, flaques de ciel, feuilles ----
  s += `<rect x="836" y="250" width="764" height="90" fill="#13141a"/>`;
  const rp2 = rng(617);
  let pv = '';
  for (let i = 0; i < 64; i++) pv += `M${R(844 + rp2() * 750)} ${R(258 + rp2() * 74)}h7`;
  s += `<path d="${pv}" stroke="#0c0d11" stroke-width="1.8" fill="none" opacity="0.6"/>`;
  s += `<ellipse cx="1190" cy="302" rx="96" ry="11" fill="${a.bas}" opacity="0.14"/>
    <ellipse cx="1190" cy="302" rx="96" ry="11" fill="none" stroke="#1a1c24" stroke-width="1.2" opacity="0.5"/>
    <ellipse cx="1396" cy="326" rx="40" ry="6" fill="${a.bas}" opacity="0.1"/>`;
  // Une traînée sombre part de la porte de la tour. Personne ne l'a lavée.
  s += `<path d="M840 330q44 -7 86 -3l-6 7q-40 -2 -72 3z" fill="#22080a" opacity="0.45"/>`;
  const rf = rng(519), fe2 = [];
  for (let i = 0; i < 30; i++) fe2.push([R(1140 + rf() * 420), R(252 + rf() * 16)]);
  s += dots(fe2, 2, '#2a2418', 0.5);
  s += `<path d="M836 252q26 10 54 8l-8 8q-26 0 -46 -8z" fill="#241f15" opacity="0.45"/>`;
  const rdr = rng(423), dr = [];
  for (let i = 0; i < 14; i++) dr.push([R(1180 + rdr() * 340), R(256 + rdr() * 60)]);
  s += dots(dr, 1.8, '#c8c2b0', 0.13);

  // ---- La brouette du chantier, eau de pluie ; le gilet plié sur le manche ----
  s += `<g fill="#0d0e13">
      <path d="M916 308l50 0 9 -20 -64 0z"/>
      <path d="M966 308l16 -11M916 308l-13 9" stroke="#0d0e13" stroke-width="3.6"/>
    </g>
    <circle cx="928" cy="316" r="7.5" fill="#08080b"/><circle cx="928" cy="316" r="2.4" fill="#15161d"/>
    <ellipse cx="943" cy="289" rx="26" ry="3.4" fill="${a.bas}" opacity="0.3"/>
    <g transform="rotate(-18 977 295)"><rect x="970" y="290" width="15" height="10" rx="2" fill="#8a4a20" opacity="0.5"/>
    <path d="M972 295l11 -3" stroke="#c8c2b0" stroke-width="1.6" opacity="0.3"/></g>`;

  // ---- Le canon du musée sur son affût, exposé pour plus personne ----
  s += `<g fill="#0c0d12">
      <path d="M1056 308l54 -16q7 -2 9 3l-2 6l-56 17z"/>
      <path d="M1117 292l8 -3l3 7l-8 3z"/>
    </g>
    <circle cx="1072" cy="314" r="13" fill="none" stroke="#0c0d12" stroke-width="4.5"/>
    <path d="M1072 301v26M1061 307l22 13M1083 307l-22 13" stroke="#0c0d12" stroke-width="2.2"/>
    <circle cx="1072" cy="314" r="2.6" fill="#0c0d12"/>`;
  s += percheur(1124, 290, 0.85, -1);

  // ---- Ce qui les fait tourner : une forme sous une bâche, devant les arcades ----
  s += `<path d="M1268 326q12 -12 34 -13q24 -1 36 9l5 6l-78 1z" fill="#101117"/>
    <path d="M1338 324q7 -3 12 -1M1344 320l3 -5" stroke="#6e675c" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M1250 332q22 -9 48 -7l-5 8q-24 -1 -38 5z" fill="#22080a" opacity="0.55"/>`;
  const rpl = rng(808), pl = [];
  for (let i = 0; i < 12; i++) pl.push([R(1240 + rpl() * 140), R(306 + rpl() * 28)]);
  s += dots(pl, 1.5, '#c8c2b0', 0.22);
  s += percheur(1316, 330, 1.05) + `<g transform="rotate(14 1254 330)">${percheur(1254, 330, 0.95, -1)}</g>`;

  // ---- La roue des charognards au-dessus de la cour — patiente, silencieuse ----
  s += volant(1212, 76, 0.7) + volant(1272, 52, 0.85) + volant(1356, 44, 1) + volant(1438, 62, 0.9)
    + volant(1474, 96, 0.75) + volant(1418, 128, 0.85) + volant(1330, 142, 1.05) + volant(1244, 120, 0.8)
    + volant(1300, 92, 0.6);

  // ---- Brume au sol et neige fine, en deux moitiés ----
  s += brume(a, 252, '#3a4150', 0.13, 'p1') + `<g transform="translate(800,0)">${brume(a, 252, '#3a4150', 0.13, 'p2')}</g>`;
  s += neige(31, 30, 0.34) + `<g transform="translate(800,0)">${neige(63, 30, 0.34)}</g>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
