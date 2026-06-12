// Panorama « La première sortie » — cinématique 1600×340, travelling gauche → droite.
// À gauche, le porche du Grand Hôtel de la Poste qu'on quitte ; puis la place
// Crousillat, la Fontaine Moussue, la Tour de l'Horloge arrêtée ; et vers la
// droite la ville se révèle : façades éventrées, barricade militaire abandonnée,
// bus couché, corbeaux — de plus en plus d'errants jusqu'à la rue qui grouille
// (point d'orgue x ≈ 1300–1550).
import {
  R, rng, dots, halo, astre, etoiles, neige, brume, batisse, toits,
  zfig, carcasse, lampadaire, pin,
} from '../ambiance_lib.js';

export default function (a) {
  const PW = 1600, PH = 340;
  const r = rng(4217);

  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 320, 58);
  s += etoiles(a, 41, 70) + `<g transform="translate(800,0)">${etoiles(a, 87, 70)}</g>`;

  // ---- Ligne de toits continue (opacité 1 : pas de couture à x = 800) ----
  s += toits(9, 190, 44, '#0c0d13', 1) + `<g transform="translate(800,0)">${toits(57, 190, 44, '#0c0d13', 1)}</g>`;

  // ---- La Tour de l'Horloge — campanile en fer forgé, cadran arrêté ----
  s += `<g fill="#0a0b10">
    <rect x="590" y="78" width="54" height="168"/>
    <path d="M584 78h66l-8 -14h-50z"/>
    <path d="M601 64q16 -26 32 0M597 64q20 -34 40 0" stroke="#0a0b10" stroke-width="2.6" fill="none"/>
  </g>
  <circle cx="617" cy="110" r="13" fill="#1a1b22"/>
  <path d="M617 110v-9M617 110l6 4" stroke="#3a3b44" stroke-width="2"/>
  <path d="M600 138h34M600 158h34" stroke="#06070b" stroke-width="2" opacity="0.6"/>`;

  // ---- Le Grand Hôtel de la Poste : façade, porche à colonnes, enseigne pendante ----
  s += batisse(a, 0, 246, 232, 206, '#101117', 21);
  // Une seule fenêtre encore éclairée — la chambre qu'on vient de quitter.
  s += halo(a, 'chbre', 152, 84, 28, 22, '#c9882a', 0.22);
  s += `<path d="M152 80v9" stroke="#c9a227" stroke-width="6" opacity="0.5"/>`;
  // Le porche : entablement, colonnes, porte sombre, marches.
  s += `<g fill="#0b0c11">
    <rect x="38" y="156" width="166" height="14"/>
    <path d="M32 156h178l-7 -10h-164z"/>
    <rect x="54" y="170" width="11" height="76"/><rect x="178" y="170" width="11" height="76"/>
    <rect x="96" y="186" width="50" height="60" fill="#07080d"/>
    <rect x="30" y="246" width="182" height="5"/><rect x="22" y="251" width="198" height="5"/>
  </g>
  <path d="M121 186v60M96 206h50" stroke="#13141a" stroke-width="2" opacity="0.7"/>`;
  // Enseigne pendante (sans lettres : un cartouche doré qui grince au vent).
  s += `<g transform="rotate(7 240 110)">
    <path d="M232 108h28M256 108v8" stroke="#15161d" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="242" y="116" width="30" height="40" fill="#0d0e14"/>
    <rect x="245.5" y="119.5" width="23" height="33" fill="none" stroke="#c9a227" stroke-width="1.4" opacity="0.4"/>
  </g>`;
  // Une trace de main sur la colonne — quelqu'un est sorti avant nous.
  s += `<g fill="#a31621" opacity="0.45"><circle cx="184" cy="206" r="3.4"/>
    <path d="M181 202l-1 -5M184 201l0 -6M187 202l1 -5M189 205l3 -3M182 209q-4 6 -3 14" stroke="#a31621" stroke-width="1.7" fill="none"/></g>`;

  // ---- Façades éventrées du milieu de ville ----
  s += batisse(a, 650, 246, 120, 150, '#101117', 31);
  s += batisse(a, 780, 246, 116, 128, '#0e0f15', 32);
  s += batisse(a, 904, 246, 96, 110, '#101117', 33);
  // Trou béant à l'étage et lèchement de suie.
  s += `<path d="M686 142l32 -10 17 13 -4 23 -27 11 -19 -15z" fill="#07080d"/>
    <path d="M688 138q18 -20 46 -10" stroke="#060608" stroke-width="5" fill="none" opacity="0.7"/>`;

  // ---- La rue du fond (point d'orgue) : deux façades qui encadrent la gueule noire ----
  s += batisse(a, 1300, 246, 56, 172, '#0e0f15', 35);
  s += batisse(a, 1548, 246, 52, 178, '#0e0f15', 36);
  s += `<rect x="1356" y="178" width="192" height="68" fill="#0a0b10"/>`;

  // ---- Le sol : pavés, papiers, traînées ----
  s += `<rect x="0" y="246" width="${PW}" height="${PH - 246}" fill="#121318"/>`;
  let pav = '';
  for (let i = 0; i < 90; i++) pav += `M${R(r() * PW)} ${R(252 + r() * 80)}h7`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.7"/>`;
  const rp = rng(515), pap = [];
  for (let i = 0; i < 26; i++) pap.push([R(rp() * PW), R(254 + rp() * 76)]);
  s += dots(pap, 1.8, '#3c414c', 0.22);
  // Chaussée de la rue grouillante, à peine plus sombre, lignes de fuite.
  s += `<path d="M1356 246h192v94h-238z" fill="#0f1014"/>
    <path d="M1382 246l-26 94M1452 246l0 94M1522 246l28 94" stroke="#0b0c10" stroke-width="1.6" fill="none" opacity="0.5"/>`;
  // Traînées de sang : une sur la place, une qui remonte vers la rue.
  s += `<path d="M310 270q56 9 112 4l-7 8q-54 5 -98 -4z" fill="#22080a" opacity="0.5"/>`;
  s += `<path d="M1268 300q60 -14 152 -28l4 7q-86 14 -148 28z" fill="#a31621" opacity="0.3"/>`;

  // ---- La Fontaine Moussue : le champignon de mousse, l'eau coule toujours ----
  s += `<g>
    <ellipse cx="400" cy="296" rx="86" ry="14" fill="#0e1217"/>
    <ellipse cx="400" cy="290" rx="78" ry="10" fill="#15202a" opacity="0.8"/>
    <path d="M380 290q-12 -50 -22 -58q26 -16 42 -16t42 16q-10 8 -22 58z" fill="#1a241c"/>
    <ellipse cx="400" cy="216" rx="46" ry="22" fill="#202c20"/>
    <ellipse cx="390" cy="208" rx="34" ry="14" fill="#27361f" opacity="0.7"/>
    <path d="M366 226q6 26 10 60M434 226q-6 26 -10 60" stroke="#2c3f4a" stroke-width="1.6" fill="none" opacity="0.8"/>
  </g>`;
  if (a.nuit) s += `<ellipse cx="416" cy="290" rx="18" ry="3" fill="#cfc9b8" opacity="0.12"/>`;

  // ---- Devanture éventrée et éboulis ----
  s += `<rect x="798" y="214" width="86" height="32" fill="#08090d"/>
    <path d="M798 214l22 32M842 214l-13 32M866 214l9 20" stroke="#1c1d24" stroke-width="2" fill="none"/>`;
  s += `<path d="M896 332q10 -26 30 -34q16 -10 38 -8q22 4 34 18l8 24z" fill="#0d0e13"/>
    <path d="M918 318h9M944 308h10M962 322h8M932 296h7" stroke="#15161d" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;

  // ---- La barricade militaire abandonnée : sacs de sable, herses, concertina ----
  let sacs = '';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5 - j; i++)
    sacs += `<ellipse cx="${R(1008 + i * 23 + j * 11.5)}" cy="${R(322 - j * 10)}" rx="12" ry="5.6" fill="${(i + j) % 2 ? '#14151b' : '#121318'}"/>`;
  s += `<g>${sacs}</g>`;
  s += `<g stroke="#15161d" stroke-width="4.5" stroke-linecap="round" fill="none">
    <path d="M1078 322l26 -28M1104 322l-26 -28M1091 326v-36"/>
    <path d="M1116 324l22 -24M1138 324l-22 -24M1127 328v-31"/>
  </g>`;
  let fil = '';
  for (let i = 0; i < 10; i++) fil += `M${R(1000 + i * 13.5)} 306a6.5 8 0 1 1 .2 0`;
  s += `<path d="${fil}" stroke="#1a1b22" stroke-width="1.6" fill="none" opacity="0.8"/>`;
  // Panneau de chantier orange renversé, casque tombé, douilles dans la neige sale.
  s += `<g transform="rotate(-14 1042 298)"><rect x="1020" y="292" width="44" height="9" fill="#8a4a20" opacity="0.6"/>
    <path d="M1026 292l7 9M1040 292l7 9M1054 292l7 9" stroke="#0d0e13" stroke-width="3"/>
    <path d="M1024 301l-4 14M1060 301l4 14" stroke="#0d0e13" stroke-width="3" fill="none"/></g>`;
  s += `<path d="M1148 322q2 -9 11 -9t11 9z" fill="#101218"/>`;
  const rd = rng(606), dou = [];
  for (let i = 0; i < 8; i++) dou.push([R(1008 + rd() * 116), R(318 + rd() * 14)]);
  s += dots(dou, 1.6, '#c9a227', 0.3);

  // ---- Le point d'orgue : la rue qui grouille (x ≈ 1300–1550) ----
  const rh = rng(909), ha = [], hb = [];
  for (let i = 0; i < 30; i++) (i % 2 ? ha : hb).push([R(1370 + rh() * 165), R(250 + rh() * 13)]);
  s += dots(ha, 3, '#0a0b10', 0.92) + dots(hb, 3.8, '#101218', 0.85);
  const rf = rng(1313);
  for (let i = 0; i < 6; i++)
    s += zfig(R(1366 + i * 28 + rf() * 12), R(266 + rf() * 9), R(0.36 + rf() * 0.1), '#0b0c10', a.nuit, R(-12 + rf() * 24));
  for (let i = 0; i < 6; i++)
    s += zfig(R(1348 + i * 34 + rf() * 16), R(288 + rf() * 22), R(0.56 + rf() * 0.24), i % 2 ? '#0b0c10' : '#0d0e13', a.nuit, R(-14 + rf() * 28));

  // ---- Le bus couché en travers, ventre vers la rue ----
  s += `<g>
    <rect x="1140" y="256" width="184" height="52" rx="11" fill="#0f1016"/>
    <rect x="1154" y="261" width="17" height="11" fill="#07080d"/><rect x="1180" y="261" width="17" height="11" fill="#07080d"/>
    <rect x="1206" y="261" width="17" height="11" fill="#07080d"/><rect x="1232" y="261" width="17" height="11" fill="#07080d"/>
    <rect x="1258" y="261" width="17" height="11" fill="#07080d"/>
    <rect x="1142" y="288" width="180" height="5" fill="#8a4a20" opacity="0.5"/>
    <rect x="1284" y="296" width="20" height="8" fill="#06070b"/>
    <circle cx="1330" cy="268" r="10.5" fill="#08080b"/><circle cx="1330" cy="296" r="10.5" fill="#08080b"/>
    <circle cx="1330" cy="268" r="3.5" fill="#15161d"/><circle cx="1330" cy="296" r="3.5" fill="#15161d"/>
    <path d="M1146 266l9 7M1152 280l-7 5M1148 296l10 -4" stroke="#06070b" stroke-width="1.6" fill="none"/>
    <path d="M1196 290q14 6 30 4l-3 6q-16 1 -27 -4z" fill="#d6303e" opacity="0.35"/>
  </g>`;
  // L'éclaireur de la meute, qui déborde déjà le bus.
  s += zfig(1334, 314, 0.85, '#0a0b10', a.nuit, -10);

  // ---- Mobilier urbain, carcasses, pin ----
  s += carcasse(470, 318, 1, '#101117', 5);
  s += carcasse(826, 322, 0.95, '#0f1016', 8);
  s += lampadaire(540, 318, 74, '#0d0e13', -6);
  s += lampadaire(952, 318, 70, '#0d0e13', 14);
  s += pin(270, 318, 1.1, '#0a0d0a');

  // ---- Les errants épars — de plus en plus nombreux vers la droite ----
  s += zfig(350, 298, 0.6, '#0b0c10', a.nuit, -6);
  s += zfig(468, 300, 0.64, '#0b0c10', a.nuit, 9);
  s += zfig(700, 304, 0.68, '#0a0b10', a.nuit, 12);
  s += zfig(762, 286, 0.45, '#0b0c10', a.nuit, -8);
  s += zfig(905, 300, 0.6, '#0b0c10', a.nuit, 16);
  s += zfig(988, 306, 0.72, '#0a0b10', a.nuit, -12);
  s += zfig(1108, 312, 0.78, '#0a0b10', a.nuit, 10);

  // ---- Les corbeaux : posés sur le bus et la barricade, en vol au-dessus ----
  const corbeau = (x, y, sc = 1, k = 1) => `<g transform="translate(${x},${y}) scale(${R(k * sc)},${sc})" fill="#060608">
    <ellipse cx="0" cy="-3" rx="7" ry="4.4"/><circle cx="6.5" cy="-7" r="2.8"/>
    <path d="M9 -7l5.5 1.6 -5.5 1.2zM-5 -4l-8 -4 3 6z"/></g>`;
  s += corbeau(1184, 256, 1) + corbeau(1264, 256, 0.9, -1) + corbeau(1024, 302, 0.85) + corbeau(1093, 290, 0.8, -1);
  s += `<path d="M1208 84q7 -8 14 0q7 -8 14 0M1292 62q6 -7 12 0q6 -7 12 0M1384 96q6 -7 12 0M1344 120q5 -6 10 0q5 -6 10 0M1452 76q6 -7 12 0" stroke="#060608" stroke-width="2.2" fill="none" opacity="0.8"/>`;

  // ---- Brume au sol et neige fine, en deux moitiés ----
  s += brume(a, 248, '#3a4150', 0.14, 'p1') + `<g transform="translate(800,0)">${brume(a, 248, '#3a4150', 0.14, 'p2')}</g>`;
  s += neige(31, 28, 0.34) + `<g transform="translate(800,0)">${neige(63, 28, 0.34)}</g>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
