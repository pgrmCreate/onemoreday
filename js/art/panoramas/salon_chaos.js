// Panorama « L'effondrement » — cinématique 1600×340. MÊMES toits, même Tour de
// l'Horloge, même fontaine que salon_avant (et que sortie_hotel) — mais la nuit
// du grand marché : incendies, colonnes de fumée, gyrophares, et à droite la rue
// de l'exode : voitures bloquées, silhouettes qui courent, l'armée qui n'entre pas.
// Dessiné à heure FIXE (nuit rongée par le feu) : c'est un souvenir.
import { R, rng, dots, halo, batisse, toits, lampadaire, pin } from '../ambiance_lib.js';

export default function (a) {
  const PW = 1600, PH = 340;

  // ---- Ciel : nuit sale, teinte de braise au ras des toits ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b0912"/><stop offset="0.6" stop-color="#231016"/>
    <stop offset="1" stop-color="#3a180e"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  // Lueurs d'incendie au-dessus des foyers.
  s += halo(a, 'lueur1', 760, 170, 300, 120, '#c25a20', 0.3);
  s += halo(a, 'lueur2', 360, 184, 200, 90, '#c25a20', 0.2);
  s += halo(a, 'lueur3', 1480, 160, 220, 110, '#a3441c', 0.18);

  // ---- Colonnes de fumée : larges, penchées par le vent ----
  const fumee = (x, y, h, w, o) => `<path d="M${x} ${y}q${R(-h * 0.12)} ${R(-h * 0.34)} ${R(h * 0.05)} ${R(-h * 0.6)}q${R(-h * 0.16)} ${R(-h * 0.26)} ${R(-h * 0.04)} ${-h}" stroke="#120e14" stroke-width="${w}" fill="none" opacity="${o}" stroke-linecap="round"/>`;
  s += fumee(366, 180, 150, 26, 0.85) + fumee(770, 168, 168, 34, 0.9) + fumee(940, 200, 130, 22, 0.8) + fumee(1500, 176, 140, 24, 0.8);

  // ---- Mêmes toits que salon_avant (seeds identiques) ----
  s += toits(9, 190, 44, '#0b0a11', 1) + `<g transform="translate(800,0)">${toits(57, 190, 44, '#0b0a11', 1)}</g>`;

  // ---- Flammes sur les toits : trois foyers ----
  const flammes = (x, y, sc) => `<g transform="translate(${x},${y}) scale(${sc})">
    <path d="M0 0q-7 -10 -3 -20q4 7 8 9q-3 -11 5 -18q1 9 7 13q4 -9 2 -16q7 9 6 20q5 -3 6 -9q4 13 -7 21z" fill="#b34e1c"/>
    <path d="M7 -1q-4 -9 0 -16q4 7 9 9q-1 -9 4 -13q2 11 -1 20z" fill="#dd8930" opacity="0.9"/>
    <path d="M12 -3q-2 -5 0 -9q3 4 5 5q1 -5 3 -7q1 7 -2 11z" fill="#eec05a" opacity="0.85"/>
  </g>`;
  s += flammes(348, 176, 1.1) + flammes(382, 182, 0.8);
  s += flammes(936, 196, 0.9);

  // ---- La Tour de l'Horloge : cadran mort, silhouette à contre-feu ----
  s += `<g fill="#090810">
    <rect x="590" y="78" width="54" height="168"/>
    <path d="M584 78h66l-8 -14h-50z"/>
    <path d="M601 64q16 -26 32 0M597 64q20 -34 40 0" stroke="#090810" stroke-width="2.6" fill="none"/>
  </g>
  <circle cx="617" cy="110" r="13" fill="#171520"/>
  <path d="M617 110v-9M617 110l6 4" stroke="#322d3a" stroke-width="2"/>
  <path d="M600 138h34M600 158h34" stroke="#06050c" stroke-width="2" opacity="0.6"/>`;

  // ---- Le Grand Hôtel de la Poste : éteint, porte encore fermée ----
  s += batisse(a, 0, 246, 232, 206, '#0e0d15', 21, 0.03);
  s += `<g fill="#0a0911">
    <rect x="38" y="156" width="166" height="14"/>
    <path d="M32 156h178l-7 -10h-164z"/>
    <rect x="54" y="170" width="11" height="76"/><rect x="178" y="170" width="11" height="76"/>
    <rect x="96" y="186" width="50" height="60" fill="#070610"/>
    <rect x="30" y="246" width="182" height="5"/><rect x="22" y="251" width="198" height="5"/>
  </g>`;
  // L'enseigne pendante, déjà de travers, éteinte.
  s += `<g transform="rotate(7 240 110)">
    <path d="M232 108h28M256 108v8" stroke="#13121a" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="242" y="116" width="30" height="40" fill="#0d0c13"/>
  </g>`;

  // ---- Façades du milieu : l'une brûle de l'intérieur ----
  s += batisse(a, 650, 246, 120, 150, '#0e0d15', 31, 0);
  s += batisse(a, 780, 246, 116, 128, '#0c0b13', 32, 0);
  s += batisse(a, 904, 246, 96, 110, '#0e0d15', 33, 0);
  // Fenêtres en feu de l'immeuble 780 : le feu monte étage par étage.
  s += `<path d="M793 138v9M825 138v9M857 138v9M809 172v9M841 172v9" stroke="#d8742a" stroke-width="6" fill="none" opacity="0.85"/>`;
  s += halo(a, 'fen-feu', 826, 156, 70, 44, '#c25a20', 0.3);
  s += flammes(796, 122, 0.7);

  // ---- La rue du fond et le cours : l'exode ----
  s += batisse(a, 1300, 246, 56, 172, '#0c0b13', 35, 0.02);
  s += batisse(a, 1548, 246, 52, 178, '#0c0b13', 36, 0.02);
  s += `<rect x="1356" y="178" width="192" height="68" fill="#120f17"/>`;

  // ---- Sol ----
  s += `<rect x="0" y="246" width="${PW}" height="${PH - 246}" fill="#111016"/>`;
  const rs = rng(515);
  let pav = '';
  for (let i = 0; i < 90; i++) pav += `M${R(rs() * PW)} ${R(252 + rs() * 80)}h7`;
  s += `<path d="${pav}" stroke="#0b0a10" stroke-width="2" fill="none" opacity="0.7"/>`;
  s += `<path d="M1356 246h192v94h-238z" fill="#100e14"/>
    <path d="M1382 246l-26 94M1452 246l0 94M1522 246l28 94" stroke="#0b0a10" stroke-width="1.6" fill="none" opacity="0.5"/>`;
  // Papiers, verre, affaires perdues — la ville se vide en se renversant.
  const rp = rng(818), deb = [];
  for (let i = 0; i < 30; i++) deb.push([R(280 + rp() * 1300), R(254 + rp() * 76)]);
  s += dots(deb, 1.8, '#3c414c', 0.3);

  // ---- La Fontaine Moussue, et le grand marché renversé autour ----
  s += `<g>
    <ellipse cx="400" cy="296" rx="86" ry="14" fill="#0e1217"/>
    <ellipse cx="400" cy="290" rx="78" ry="10" fill="#15202a" opacity="0.8"/>
    <path d="M380 290q-12 -50 -22 -58q26 -16 42 -16t42 16q-10 8 -22 58z" fill="#1a241c"/>
    <ellipse cx="400" cy="216" rx="46" ry="22" fill="#202c20"/>
    <path d="M366 226q6 26 10 60M434 226q-6 26 -10 60" stroke="#2c3f4a" stroke-width="1.6" fill="none" opacity="0.8"/>
  </g>`;
  // Étals du mercredi : bâches arrachées, cagettes, fruits sous les semelles.
  s += `<g transform="rotate(-12 300 300)"><path d="M268 290l12 -20h52l12 20z" fill="#15131c"/>
    <path d="M276 292v22M324 292v20" stroke="#100e16" stroke-width="4"/></g>
  <g transform="rotate(8 504 306)"><path d="M478 300l10 -17h44l10 17z" fill="#13111a"/></g>
  <rect x="330" y="312" width="22" height="12" fill="#12101a"/><rect x="356" y="318" width="18" height="10" fill="#0f0d16"/>`;
  const rf2 = rng(909), fruits = [];
  for (let i = 0; i < 14; i++) fruits.push([R(280 + rf2() * 240), R(300 + rf2() * 30)]);
  s += dots(fruits, 2.6, '#4a3a20', 0.5);

  // ---- L'armée au bord du cours : sacs posés à la hâte, camion, gyrophares ----
  let sacs = '';
  for (let i = 0; i < 4; i++) sacs += `<ellipse cx="${R(1014 + i * 23)}" cy="322" rx="12" ry="5.6" fill="${i % 2 ? '#16141c' : '#141219'}"/>`;
  sacs += `<ellipse cx="1037" cy="312" rx="12" ry="5.6" fill="#16141c"/>`;
  s += sacs;
  // Le camion militaire, à l'arrêt, capot ouvert — il n'ira pas plus loin.
  s += `<g>
    <rect x="1080" y="266" width="104" height="38" fill="#131512"/>
    <path d="M1080 270q52 -7 104 0" stroke="#0d0f0c" stroke-width="3" fill="none"/>
    <rect x="1184" y="278" width="34" height="26" fill="#101209"/>
    <rect x="1190" y="282" width="14" height="10" fill="#070709"/>
    <path d="M1218 286l10 -12" stroke="#101209" stroke-width="3"/>
    <circle cx="1104" cy="306" r="8" fill="#070709"/><circle cx="1160" cy="306" r="8" fill="#070709"/><circle cx="1204" cy="306" r="8" fill="#070709"/>
  </g>`;
  // Un soldat encore debout, fusil bas, dépassé.
  s += `<g transform="translate(1056,302)" fill="#11130f" stroke="#11130f" stroke-linecap="round">
    <circle cx="0" cy="-47" r="5.6" stroke="none"/><path d="M-6 -44h12" stroke-width="3"/>
    <path d="M-6 -40h12l2 22h-16z" stroke="none"/>
    <path d="M-3 -17l-2 17M3 -17l3 17" stroke-width="4.4" fill="none"/>
    <path d="M-5 -36l-6 14M5 -36l8 10" stroke-width="3" fill="none"/>
    <path d="M-12 -20l20 -8" stroke-width="2.6" fill="none"/>
  </g>`;
  // Gyrophares : deux véhicules, lumière bleue froide qui balaie.
  s += halo(a, 'gyr1', 996, 286, 70, 40, '#46628f', 0.3);
  s += `<g><path d="M962 308q2 -10 11 -11l5 -8q15 -5 30 0l5 8q10 1 12 11l-2 5h-59z" fill="#10121c"/>
    <rect x="984" y="286" width="12" height="5" rx="2" fill="#46628f" opacity="0.9"/>
    <circle cx="976" cy="314" r="6" fill="#070709"/><circle cx="1010" cy="314" r="6" fill="#070709"/></g>`;
  s += halo(a, 'gyr2', 1262, 278, 56, 34, '#46628f', 0.22);
  s += `<rect x="1256" y="276" width="11" height="4" rx="2" fill="#46628f" opacity="0.8"/>`;

  // ---- La rue de l'exode (1240 → 1600) : tout le monde part, rien n'avance ----
  // File de voitures bloquées qui remonte la rue du fond, feux rouges en chapelet.
  const rq = rng(606);
  for (let i = 0; i < 6; i++) {
    const cx = R(1392 + i * 26 + rq() * 6), cy = R(238 - i * 9), sc2 = R(0.62 - i * 0.07);
    s += `<g transform="translate(${cx},${cy}) scale(${sc2})">
      <path d="M-30 0q2 -9 10 -10l5 -8q15 -5 30 0l5 8q9 1 11 10l-2 5h-57z" fill="#0e0d14"/>
      <circle cx="-17" cy="5" r="5.5" fill="#060609"/><circle cx="17" cy="5" r="5.5" fill="#060609"/>
    </g>
    <circle cx="${R(cx - 26 * sc2)}" cy="${R(cy - 2)}" r="1.8" fill="#a32020" opacity="0.85"/>
    <circle cx="${R(cx + 26 * sc2)}" cy="${R(cy - 2)}" r="1.8" fill="#a32020" opacity="0.8"/>`;
  }
  // Premier plan de la file : une voiture portières ouvertes, abandonnée en marche.
  s += `<g transform="translate(1330,310)">
    <path d="M-38 0q2 -11 12 -12l6 -9q18 -6 36 0l6 9q11 1 13 12l-2 6h-69z" fill="#100f16"/>
    <path d="M-18 -20l-4 8h14l2 -8zM2 -20l-2 8h15l-4 -8z" fill="#07070d"/>
    <path d="M16 -12l16 -16 4 3 -13 16z" fill="#100f16"/>
    <circle cx="-22" cy="6" r="7" fill="#060609"/><circle cx="22" cy="6" r="7" fill="#060609"/>
  </g>`;
  s += halo(a, 'phares', 1262, 312, 64, 18, '#d8cfae', 0.3);
  s += `<circle cx="1294" cy="306" r="2.6" fill="#e8e0c0" opacity="0.9"/><circle cx="1296" cy="312" r="2.4" fill="#e8e0c0" opacity="0.8"/>`;

  // ---- Ceux qui courent ----
  const courant = (x, y, sc, fl = 1, t = '#0f0e15') => `<g transform="translate(${x},${y}) scale(${R(sc * fl)},${sc})" fill="${t}" stroke="${t}" stroke-linecap="round">
    <circle cx="9" cy="-45" r="5.4" stroke="none"/>
    <path d="M1 -40l13 3 4 18h-15z" stroke="none"/>
    <path d="M5 -19l-13 15M10 -19l7 17" stroke-width="4.4" fill="none"/>
    <path d="M3 -35l-11 7M15 -33l10 11" stroke-width="3.1" fill="none"/>
  </g>`;
  s += courant(1238, 318, 0.95, 1);
  s += courant(1372, 312, 0.85, 1);
  s += courant(1428, 304, 0.74, 1);
  s += courant(1460, 296, 0.62, 1);
  // Une mère, un enfant à bout de bras — les deux silhouettes liées par la main.
  s += `<g transform="translate(1510,300)" fill="#0f0e15" stroke="#0f0e15" stroke-linecap="round">
    <circle cx="0" cy="-40" r="4.8" stroke="none"/><path d="M-5 -35h10l3 19h-15z" stroke="none"/>
    <path d="M-2 -16l-6 16M3 -16l5 15" stroke-width="3.8" fill="none"/>
    <path d="M-4 -31l-7 10M5 -31l9 8" stroke-width="2.8" fill="none"/>
    <circle cx="17" cy="-24" r="3.6" stroke="none"/><path d="M14 -20h7l2 12h-10z" stroke="none"/>
    <path d="M16 -8l-3 8M19 -8l4 8" stroke-width="2.8" fill="none"/>
    <path d="M14 -23l-3 4" stroke-width="2.2" fill="none"/>
  </g>`;
  // Foule plus loin dans la gueule de la rue : têtes et épaules, serrées.
  const rh = rng(313), tetes = [], corps = [];
  for (let i = 0; i < 22; i++) {
    const x = R(1380 + rh() * 160), y = R(250 + rh() * 12);
    tetes.push([x, y - 10]);
    corps.push(`M${x} ${y}v-7`);
  }
  s += `<path d="${corps.join('')}" stroke="#0d0c13" stroke-width="5" stroke-linecap="round" opacity="0.9" fill="none"/>` + dots(tetes, 3.2, '#0d0c13', 0.9);

  // ---- Affaires perdues sur la place et la rue ----
  s += `<g transform="rotate(12 540 318)"><rect x="526" y="312" width="26" height="15" rx="2" fill="#13111a"/>
    <path d="M534 312v-4h10v4" stroke="#13111a" stroke-width="2" fill="none"/>
    <path d="M530 318h7M542 322h8" stroke="#23242c" stroke-width="2"/></g>`;
  s += `<rect x="1188" y="320" width="22" height="13" rx="2" fill="#12101a" transform="rotate(-18 1199 326)"/>`;
  // Une chaussure seule. Personne ne revient la chercher.
  s += `<path d="M872 326q2 -7 9 -7t9 5l8 3q2 4 -3 4h-21q-3 0 -2 -5z" fill="#0e0d14"/>`;

  // ---- L'hélicoptère de la base, haut, projecteur perdu dans la fumée ----
  s += `<g transform="translate(1180,52)">
    <ellipse cx="0" cy="0" rx="13" ry="5.5" fill="#0a0911"/>
    <path d="M11 1l16 4 -15 1z" fill="#0a0911"/>
    <path d="M-22 -7h44" stroke="#0a0911" stroke-width="2"/>
    <circle cx="3" cy="-1" r="1.6" fill="#a32020" opacity="0.9"/>
  </g>`;
  s += `<defs><linearGradient id="${a.p}-proj" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0" stop-color="#9aa4b8" stop-opacity="0.18"/><stop offset="1" stop-color="#9aa4b8" stop-opacity="0"/>
  </linearGradient></defs>
  <path d="M1176 58L1100 246L1210 246Z" fill="url(#${a.p}-proj)"/>`;

  // ---- Lampadaires : l'un mort, l'autre qui grésille encore ----
  s += lampadaire(540, 318, 74, '#0d0c13', -2);
  s += halo(a, 'lp-gres', 968, 234, 36, 28, '#c9a227', 0.12) + lampadaire(952, 318, 70, '#0d0c13', 0);
  s += pin(270, 318, 1.1, '#0a0d0a');

  // ---- Voile de nuit fixe + cendres qui retombent ----
  const rc = rng(141), cendres = [];
  for (let i = 0; i < 26; i++) cendres.push([R(rc() * PW), R(rc() * 300)]);
  s += dots(cendres, 1.5, '#6a5648', 0.3);
  s += `<rect width="${PW}" height="${PH}" fill="#06040c" opacity="0.22"/>`;
  return s;
}
