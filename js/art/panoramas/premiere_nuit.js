// Panorama « La première nuit » — vue depuis une fenêtre d'étage du Grand Hôtel
// de la Poste, au-dessus de la place Crousillat. Le courant vient de mourir :
// plus une seule lumière électrique. La place sombre dans le noir — Fontaine
// Moussue, terrasses figées, platanes nus, voitures abandonnées, une silhouette
// qui titube entre les carcasses (x ≈ 970) ; à droite la Porte de l'Horloge
// (cadran mort à 21 h 10, comme en 1909), l'Empéri en ombre sur son rocher et la
// lueur d'un incendie derrière les toits (x ≈ 1500). La caméra reste DERRIÈRE la
// vitre : rideau et montant à gauche, appui de fenêtre en bas, bougie, reflets.
import {
  R, rng, ciel, dots, halo, astre, etoiles, neige, brume,
  batisse, toits, zfig, carcasse, lampadaire, bougie,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

// Platane d'hiver de la place Crousillat (silhouette nue, écorce marbrée).
const platane = (x, y, s = 1, k = 1) => `<g transform="translate(${x},${y}) scale(${R(k * s)},${s})" stroke="#0c0d12" fill="none" stroke-linecap="round">
  <path d="M0 0q-2 -30 0 -46" stroke-width="7"/>
  <path d="M0 -34q-12 -14 -22 -18M0 -38q10 -13 20 -17M0 -44q-4 -15 2 -25M-4 -32q-13 -8 -23 -6M4 -34q13 -9 23 -9" stroke-width="3"/>
  <path d="M-20 -50q-6 -4 -10 -2M18 -53q8 -5 12 -3M3 -67q4 -7 2 -11M-22 -38q-7 0 -11 3" stroke-width="1.8"/>
  <path d="M-2 -14h4M-1 -7h3" stroke="#23252e" stroke-width="2.6"/>
</g>`;

export default function (a0) {
  // La nuit doit dominer : si l'heure du jeu n'est pas nocturne, on force le
  // ciel de 21 h 30 (déterministe) — la première nuit est une nuit, point.
  const a = a0.nuit ? a0 : { ...ciel(21.5), heure: 21.5, p: a0.p };

  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;

  // ---- L'incendie au loin, derrière les toits : la seule lumière qui reste ----
  s += halo(a, 'feu', 1500, 196, 230, 95, '#7a3320', 0.32);
  s += halo(a, 'feu2', 1500, 202, 118, 48, '#8a4a20', 0.3);
  s += `<path d="M1462 200q-14 -40 6 -70q-18 -34 4 -66" stroke="#15151b" stroke-width="13" fill="none" opacity="0.55"/>
  <path d="M1544 200q12 -36 -4 -62q14 -30 -2 -58" stroke="#15151b" stroke-width="9" fill="none" opacity="0.45"/>
  <path d="M1468 196q-10 -34 4 -60" stroke="#3a3540" stroke-width="2.4" fill="none" opacity="0.25"/>`;

  // ---- Lune voilée et étoiles froides ----
  s += astre(a, 1000, 60);
  s += etoiles(a, 43, 80) + `<g transform="translate(800,0)">${etoiles(a, 91, 80)}</g>`;

  // ---- Toits lointains de la vieille ville ----
  s += toits(17, 198, 42, '#0b0c12', 0.92)
    + `<g transform="translate(800,0)">${toits(73, 198, 42, '#0b0c12', 0.92)}</g>`;

  // ---- Le château de l'Empéri, masse crénelée sur son rocher, à contre-feu ----
  s += `<g fill="#090a0f">
    <path d="M1352 200q40 -32 108 -40q72 -6 134 20l12 20z"/>
    <rect x="1392" y="132" width="150" height="40"/>
    <rect x="1398" y="112" width="26" height="26"/>
    <rect x="1470" y="96" width="32" height="44"/>`;
  let merl = '';
  for (let mx = 1392; mx < 1538; mx += 20) merl += `<rect x="${mx}" y="124" width="9" height="10"/>`;
  merl += `<rect x="1398" y="104" width="7" height="9"/><rect x="1410" y="104" width="7" height="9"/>
    <rect x="1470" y="88" width="8" height="9"/><rect x="1482" y="88" width="8" height="9"/><rect x="1494" y="88" width="8" height="9"/>`;
  s += merl + `</g>
  <path d="M1502 96v44" stroke="#5a2a1c" stroke-width="1.6" opacity="0.5"/>`;

  // ---- Les façades d'en face : toutes les fenêtres mortes ----
  s += batisse(a, 150, 246, 132, 138, '#101117', 61);
  s += batisse(a, 292, 246, 112, 120, '#0e0f15', 62);
  s += batisse(a, 426, 246, 140, 146, '#101117', 63);
  s += batisse(a, 576, 246, 108, 116, '#0e0f15', 64);
  s += batisse(a, 710, 246, 96, 124, '#101117', 65);
  s += batisse(a, 816, 246, 124, 132, '#0e0f15', 66);
  s += batisse(a, 950, 246, 110, 118, '#101117', 67);
  s += batisse(a, 1086, 246, 100, 126, '#0e0f15', 68);
  s += batisse(a, 1256, 246, 120, 134, '#101117', 69);
  s += batisse(a, 1386, 246, 104, 86, '#0e0f15', 70);
  s += batisse(a, 1516, 246, 84, 92, '#101117', 71);
  // Un volet arraché qui pend, deux carreaux étoilés.
  s += `<rect x="330" y="178" width="7" height="17" fill="#0a0b10" transform="rotate(14 333 186)"/>
  <path d="M858 168l6 7 -4 5M1108 188l5 6" stroke="#1c1d24" stroke-width="1.5" fill="none" opacity="0.8"/>`;
  // Un drap pendu à une fenêtre — un appel que plus personne ne lira.
  s += `<path d="M468 170q2 -4 6 -4h30q4 0 5 4l-3 44q-18 8 -34 0z" fill="#b9b2a0" opacity="0.2"/>
  <path d="M474 184h26M472 198h28M478 208h18" stroke="#3a3f49" stroke-width="2" opacity="0.5"/>
  <path d="M484 190q6 9 4 20" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.35"/>`;
  // Une seule veille : la flamme d'une bougie derrière un carreau, quelqu'un d'autre.
  s += halo(a, 'veille', 988, 168, 16, 13, '#c9882a', 0.16);
  s += `<path d="M988 165v6" stroke="#c9882a" stroke-width="4" opacity="0.3"/>`;

  // ---- La Porte de l'Horloge : campanile en fer forgé, cadran mort à 21 h 10 ----
  s += `<g fill="#0a0b10">
    <rect x="1196" y="86" width="56" height="160"/>
    <path d="M1190 86h68l-8 -14h-52z"/>
    <path d="M1207 72q17 -27 34 0M1203 72q21 -35 42 0" stroke="#0a0b10" stroke-width="2.6" fill="none"/>
  </g>
  <circle cx="1224" cy="118" r="13" fill="#16171f"/>
  <path d="M1224 118l-8 -3M1224 118l4 -9" stroke="#3a3b44" stroke-width="2"/>
  <path d="M1206 146h36M1206 166h36" stroke="#06070b" stroke-width="2" opacity="0.6"/>
  <path d="M1208 246v-26q16 -14 32 0v26z" fill="#05060a"/>`;

  // ---- Le sol de la place : pavés, papiers, traînées ----
  s += `<rect x="0" y="246" width="${PW}" height="68" fill="#101218"/>`;
  const rc = rng(23);
  let pav = '';
  for (let i = 0; i < 80; i++) pav += `M${R(rc() * PW)} ${R(252 + rc() * 56)}h7`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="1.8" fill="none" opacity="0.6"/>`;
  const rp = rng(67), pap = [];
  for (let i = 0; i < 22; i++) pap.push([R(rp() * PW), R(252 + rp() * 54)]);
  s += dots(pap, 1.8, '#3c414c', 0.22);
  // Du sang séché près d'une portière ; une flaque noire sous la camionnette.
  s += `<path d="M848 296q30 -8 66 -6l-4 7q-32 -2 -58 5z" fill="#22080a" opacity="0.55"/>`;
  s += `<ellipse cx="1338" cy="310" rx="26" ry="4" fill="#0c0608" opacity="0.6"/>`;
  // La lueur de l'incendie coule dans la rue, entre deux façades.
  s += halo(a, 'ruefeu', 1500, 262, 32, 58, '#6e2c1c', 0.18);

  // ---- La Fontaine Moussue : le champignon, l'eau qui coule pour personne ----
  s += `<g>
    <ellipse cx="700" cy="292" rx="58" ry="10" fill="#0e1217"/>
    <ellipse cx="700" cy="288" rx="50" ry="7" fill="#15202a" opacity="0.8"/>
    <path d="M686 288q-8 -34 -15 -40q18 -11 29 -11t29 11q-7 6 -15 40z" fill="#1a241c"/>
    <ellipse cx="700" cy="238" rx="32" ry="15" fill="#202c20"/>
    <ellipse cx="693" cy="233" rx="23" ry="9" fill="#27361f" opacity="0.7"/>
    <path d="M676 245q4 18 7 41M724 245q-4 18 -7 41" stroke="#2c3f4a" stroke-width="1.4" fill="none" opacity="0.8"/>
  </g>
  <ellipse cx="712" cy="288" rx="13" ry="2.4" fill="#cfc9b8" opacity="0.14"/>`;

  // ---- La terrasse du café, figée en plein service ----
  s += `<path d="M250 300l84 -14 -3 -7 -84 16z" fill="#14151b"/>
  <path d="M334 281l16 -3" stroke="#0d0e13" stroke-width="3"/>
  <path d="M262 296l10 -8M286 292l10 -8M310 288l10 -8" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.8"/>`;
  s += `<ellipse cx="392" cy="280" rx="16" ry="4" fill="#13141a"/>
  <path d="M392 282v18M384 300h16" stroke="#13141a" stroke-width="3" fill="none"/>
  <ellipse cx="448" cy="296" rx="5" ry="14" fill="#13141a"/>
  <path d="M452 296h20" stroke="#13141a" stroke-width="3"/>`;
  s += `<g stroke="#13141a" stroke-width="2.4" fill="none">
    <path d="M362 308l2 -16h10l2 16M364 296l-2 -7h12"/>
    <path d="M486 300l14 -4M492 306l-2 -12l12 -3"/>
  </g>`;
  const rv = rng(141), ver = [];
  for (let i = 0; i < 9; i++) ver.push([R(376 + rv() * 110), R(290 + rv() * 16)]);
  s += dots(ver, 1.5, '#3c414c', 0.25);
  // Une valise éventrée, le linge qui s'en échappe.
  s += `<rect x="528" y="292" width="26" height="15" rx="2" fill="#0d0e14"/>
  <path d="M528 292l-9 -10h26z" fill="#0d0e14"/>
  <path d="M520 304q-10 4 -18 2q5 5 14 4z" fill="#191b22"/>`;

  // ---- Les platanes nus de la place ----
  s += platane(600, 312, 1) + platane(1130, 310, 0.92, -1);

  // ---- Les voitures abandonnées, portières ouvertes ----
  s += carcasse(610, 302, 0.8, '#101117', 7);
  s += carcasse(872, 306, 0.92, '#0f1016', 12);
  s += `<path d="M948 304l6 -18 7 3 -5 17z" fill="#0d0e13"/>`;
  s += `<g transform="rotate(-7 1060 300)">${carcasse(1018, 300, 0.85, '#101117', 21)}</g>`;
  // La camionnette du fleuriste, portes arrière béantes, cartons renversés.
  s += `<g fill="#0e0f15">
    <rect x="1296" y="272" width="86" height="34" rx="4"/>
    <rect x="1372" y="280" width="22" height="26" rx="3"/>
    <rect x="1378" y="284" width="12" height="10" fill="#07080d"/>
    <path d="M1296 272l-12 -8v34l12 -6z" fill="#0c0d12"/>
    <circle cx="1316" cy="308" r="8" fill="#08080b"/><circle cx="1366" cy="308" r="8" fill="#08080b"/>
    <path d="M1300 282h70" stroke="#08090d" stroke-width="2" opacity="0.6"/>
  </g>
  <rect x="1276" y="300" width="13" height="10" fill="#0d0e14" transform="rotate(-12 1282 305)"/>
  <rect x="1262" y="304" width="11" height="9" fill="#0c0d13"/>`;

  // ---- Eux. Celui qui titube entre les voitures, et les autres ----
  s += zfig(968, 270, 0.74, '#0b0c10', a.nuit, 16);
  s += zfig(742, 276, 0.6, '#0b0c10', a.nuit, 0);
  s += zfig(415, 248, 0.42, '#0a0b10', a.nuit, -10);
  s += zfig(1224, 256, 0.45, '#0a0b10', a.nuit, 8);
  // Au débouché de la rue embrasée : des têtes, serrées, qui avancent.
  const rh = rng(313), tete = [];
  for (let i = 0; i < 7; i++) tete.push([R(1486 + rh() * 30), R(252 + rh() * 12)]);
  s += dots(tete, 3, '#0a0b10', 0.9);

  // ---- Lampadaires morts : plus une ampoule dans toute la ville ----
  s += lampadaire(330, 310, 62, '#0d0e13', 0);
  s += lampadaire(786, 312, 66, '#0d0e13', -7);
  s += lampadaire(1158, 308, 60, '#0d0e13', 4);

  // ---- Des oiseaux levés par les cris, côté incendie ----
  s += `<path d="M1380 70q6 -7 12 0M1420 88q5 -6 10 0q5 -6 10 0M1340 56q6 -7 12 0" stroke="#060608" stroke-width="2" fill="none" opacity="0.8"/>`;

  // ---- Brume au sol et neige fine, en deux moitiés ----
  s += brume(a, 250, '#3a4150', 0.12, 'p1')
    + `<g transform="translate(800,0)">${brume(a, 250, '#3a4150', 0.12, 'p2')}</g>`;
  s += neige(37, 28, 0.3) + `<g transform="translate(800,0)">${neige(71, 28, 0.3)}</g>`;

  // ---- La vitre : reflets en biais, buée qui coule ----
  s += `<path d="M210 0l-120 340M560 0l-110 340M1210 0l-100 340" stroke="#aeb6c6" stroke-width="22" opacity="0.035"/>
  <path d="M236 0l-118 340" stroke="#aeb6c6" stroke-width="6" opacity="0.05"/>
  <path d="M120 296v14M410 300v10M760 292v18M1050 298v12M1330 296v13" stroke="#aeb6c6" stroke-width="1.6" opacity="0.08"/>`;

  // ---- L'appui de fenêtre : la bougie, un couteau de cuisine à portée de main ----
  s += `<rect x="0" y="314" width="${PW}" height="26" fill="#07080d"/>
  <path d="M0 314h${PW}" stroke="#181a22" stroke-width="2" opacity="0.8"/>`;
  s += bougie(a, 132, 306, 'bg');
  s += `<rect x="127" y="307" width="10" height="10" rx="2" fill="#b9b2a0" opacity="0.6"/>
  <path d="M129 310q-2 5 0 8M136 309q2 4 1 8" stroke="#b9b2a0" stroke-width="1.4" fill="none" opacity="0.4"/>
  <ellipse cx="132" cy="318" rx="11" ry="2.6" fill="#0d0e13"/>`;
  s += `<path d="M210 320l26 -3 1 3 -26 3z" fill="#3f444f"/>
  <rect x="236" y="317" width="9" height="5" rx="1.6" fill="#0d0e13"/>
  <rect x="282" y="318" width="14" height="7" rx="1.4" fill="#0c0d12"/>`;

  // ---- Le rideau et le montant : on regarde depuis la chambre ----
  s += `<rect x="86" y="0" width="9" height="${PH}" fill="#0a0b10"/>`;
  s += `<path d="M0 0h78q-10 60 2 120q-14 70 -4 130q-10 50 4 90h-80z" fill="#08090e"/>
  <path d="M0 318l16 10 12 -12 16 14 14 -10 12 12 8 -6v14h-78z" fill="#08090e"/>
  <path d="M22 8q-6 80 4 160q-8 90 0 164M52 6q8 70 -2 150q10 92 2 176" stroke="#101218" stroke-width="3" fill="none" opacity="0.8"/>`;
  s += `<rect x="1578" y="0" width="8" height="${PH}" fill="#0a0b10"/>
  <rect x="1586" y="0" width="14" height="${PH}" fill="#08090e"/>
  <path d="M1592 4q-4 90 2 168q-5 90 0 164" stroke="#101218" stroke-width="2.4" fill="none" opacity="0.8"/>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
