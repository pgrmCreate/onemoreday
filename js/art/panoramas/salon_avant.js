// Panorama « La vie d'avant » — cinématique 1600×340, Salon-de-Provence paisible,
// un mois avant l'effondrement. MÊME composition que sortie_hotel et salon_chaos
// (hôtel à gauche, Fontaine Moussue, Tour de l'Horloge, le cours à droite) : ce
// que la caméra montre ici en paix, l'intro du chaos le remontre en feu.
// Dessiné à heure FIXE (un crépuscule doux) : c'est un souvenir, pas le ciel du jour.
import { R, rng, dots, halo, batisse, toits, lampadaire, pin } from '../ambiance_lib.js';

export default function (a) {
  const PW = 1600, PH = 340;

  // ---- Ciel du souvenir : couchant tiède, dernières lueurs ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b2840"/><stop offset="0.55" stop-color="#6b4530"/>
    <stop offset="1" stop-color="#9a6638"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  // Le soleil vient de passer derrière les toits : un foyer de lumière, pas d'astre.
  s += halo(a, 'couchant', 1060, 196, 360, 130, '#c98a3e', 0.3);
  // Premières étoiles, timides, côté nuit.
  s += dots([[80, 26], [210, 44], [340, 18], [126, 62], [430, 36], [38, 84]], 1.3, '#cdd3df', 0.3);
  // Martinets du soir (pas des corbeaux : la ville vit encore).
  s += `<path d="M520 70q5 -6 10 0q5 -6 10 0M880 48q4 -5 8 0q4 -5 8 0M1240 84q5 -6 10 0M700 110q4 -5 8 0q4 -5 8 0" stroke="#241d28" stroke-width="1.8" fill="none" opacity="0.8"/>`;

  // ---- Mêmes toits que sortie_hotel (seeds identiques), juste moins noirs ----
  s += toits(9, 190, 44, '#13131d', 1) + `<g transform="translate(800,0)">${toits(57, 190, 44, '#13131d', 1)}</g>`;
  // Fumées de cheminée tranquilles, fines et droites.
  s += `<path d="M338 178q-4 -16 3 -30M716 172q-4 -14 2 -26M1196 180q-4 -16 3 -28" stroke="#2c2733" stroke-width="5" fill="none" opacity="0.55" stroke-linecap="round"/>`;

  // ---- La Tour de l'Horloge — cadran ÉCLAIRÉ, l'heure tourne encore ----
  s += `<g fill="#100f18">
    <rect x="590" y="78" width="54" height="168"/>
    <path d="M584 78h66l-8 -14h-50z"/>
    <path d="M601 64q16 -26 32 0M597 64q20 -34 40 0" stroke="#100f18" stroke-width="2.6" fill="none"/>
  </g>`;
  s += halo(a, 'cadran', 617, 110, 36, 36, '#d8cfae', 0.3);
  s += `<circle cx="617" cy="110" r="13" fill="#cfc4a0" opacity="0.85"/>
  <path d="M617 110l-5 -7M617 110l8 3" stroke="#26222e" stroke-width="2"/>
  <path d="M600 138h34M600 158h34" stroke="#0a0a12" stroke-width="2" opacity="0.6"/>`;

  // ---- Le Grand Hôtel de la Poste : fenêtres chaudes, enseigne allumée ----
  s += batisse(a, 0, 246, 232, 206, '#15151f', 21, 0.42);
  s += `<g fill="#0e0d15">
    <rect x="38" y="156" width="166" height="14"/>
    <path d="M32 156h178l-7 -10h-164z"/>
    <rect x="54" y="170" width="11" height="76"/><rect x="178" y="170" width="11" height="76"/>
    <rect x="96" y="186" width="50" height="60" fill="#0a0910"/>
    <rect x="30" y="246" width="182" height="5"/><rect x="22" y="251" width="198" height="5"/>
  </g>
  <path d="M121 186v60M96 206h50" stroke="#17161f" stroke-width="2" opacity="0.7"/>`;
  // La porte du hall, entrouverte sur une lumière dorée — quelqu'un veille.
  s += halo(a, 'hall', 121, 226, 46, 34, '#c9882a', 0.3);
  s += `<rect x="112" y="196" width="18" height="50" fill="#c9882a" opacity="0.35"/>`;
  // L'enseigne pendante, éclairée.
  s += `<g transform="rotate(3 240 110)">
    <path d="M232 108h28M256 108v8" stroke="#1a1922" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="242" y="116" width="30" height="40" fill="#121118"/>
    <rect x="245.5" y="119.5" width="23" height="33" fill="none" stroke="#c9a227" stroke-width="1.4" opacity="0.75"/>
  </g>`;
  s += halo(a, 'ens', 257, 136, 30, 26, '#c9a227', 0.2);

  // ---- Façades du milieu de ville : intactes, habitées ----
  s += batisse(a, 650, 246, 120, 150, '#15151f', 31, 0.4);
  s += batisse(a, 780, 246, 116, 128, '#13131c', 32, 0.34);
  s += batisse(a, 904, 246, 96, 110, '#15151f', 33, 0.4);

  // ---- La rue du fond et le cours : vitrines, phares, vie ----
  s += batisse(a, 1300, 246, 56, 172, '#13131c', 35, 0.36);
  s += batisse(a, 1548, 246, 52, 178, '#13131c', 36, 0.36);
  s += `<rect x="1356" y="178" width="192" height="68" fill="#191822"/>`;
  // Fenêtres lointaines de la rue, dorées.
  const rv = rng(212), fen = [];
  for (let i = 0; i < 12; i++) fen.push([R(1366 + rv() * 172), R(186 + rv() * 50)]);
  s += dots(fen, 3.4, '#d8a93e', 0.5);

  // ---- Le sol : pavés propres, pas un papier ----
  s += `<rect x="0" y="246" width="${PW}" height="${PH - 246}" fill="#17171e"/>`;
  const rs = rng(515);
  let pav = '';
  for (let i = 0; i < 90; i++) pav += `M${R(rs() * PW)} ${R(252 + rs() * 80)}h7`;
  s += `<path d="${pav}" stroke="#101016" stroke-width="2" fill="none" opacity="0.7"/>`;
  s += `<path d="M1356 246h192v94h-238z" fill="#14141a"/>
    <path d="M1382 246l-26 94M1452 246l0 94M1522 246l28 94" stroke="#0f0f15" stroke-width="1.6" fill="none" opacity="0.5"/>`;

  // ---- La Fontaine Moussue : l'eau coule pour tout le monde ----
  s += `<g>
    <ellipse cx="400" cy="296" rx="86" ry="14" fill="#131820"/>
    <ellipse cx="400" cy="290" rx="78" ry="10" fill="#1b2733" opacity="0.85"/>
    <path d="M380 290q-12 -50 -22 -58q26 -16 42 -16t42 16q-10 8 -22 58z" fill="#202b22"/>
    <ellipse cx="400" cy="216" rx="46" ry="22" fill="#263326"/>
    <ellipse cx="390" cy="208" rx="34" ry="14" fill="#2d3d24" opacity="0.7"/>
    <path d="M366 226q6 26 10 60M434 226q-6 26 -10 60" stroke="#3a5160" stroke-width="1.7" fill="none" opacity="0.9"/>
    <ellipse cx="416" cy="290" rx="18" ry="3" fill="#d8cfae" opacity="0.2"/>
  </g>`;
  // Pigeons au bord du bassin.
  s += dots([[352, 282], [368, 280], [444, 283]], 3.2, '#23222b', 0.9);

  // ---- Terrasse de café place Crousillat : guirlande, tables, gens assis ----
  s += `<path d="M252 196q88 26 200 18" stroke="#1c1a24" stroke-width="1.4" fill="none"/>`;
  const guir = [];
  for (let i = 0; i < 9; i++) guir.push([R(258 + i * 22), R(197 + 12 * Math.sin(Math.PI * i / 8))]);
  s += dots(guir, 2.4, '#e0b04a', 0.8);
  // Tables rondes, verres, silhouettes attablées.
  const table = (x) => `<path d="M${x - 16} 296h32M${x} 296v18M${x - 10} 314h20" stroke="#1a1922" stroke-width="3" fill="none"/>
    <path d="M${x - 8} 292v4M${x + 6} 292v4" stroke="#d8cfae" stroke-width="2" opacity="0.5"/>`;
  const assis = (x, fl) => `<g transform="translate(${x},296) scale(${fl},1)" fill="#1b1a23">
    <circle cx="0" cy="-26" r="5.5"/><path d="M-6 -20q8 -4 11 2l1 10 -5 1 -2 -7h-6z"/>
    <path d="M-4 -8l1 12h4M-7 -8l-1 12" stroke="#1b1a23" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </g>`;
  s += table(286) + table(338) + assis(268, 1) + assis(305, -1) + assis(355, -1);
  s += halo(a, 'terr', 312, 270, 90, 56, '#c9882a', 0.16);

  // ---- Passants : la ville rentre dîner ----
  const passant = (x, y, sc, fl = 1, t = '#1b1a23') => `<g transform="translate(${x},${y}) scale(${R(sc * fl)},${sc})" fill="${t}" stroke="${t}" stroke-linecap="round">
    <circle cx="0" cy="-46" r="5.5" stroke="none"/>
    <path d="M-6 -40h12l3 23h-18z" stroke="none"/>
    <path d="M-3 -17l-3 17M3 -17l5 16" stroke-width="4.4" fill="none"/>
    <path d="M-5 -37l-5 15M5 -37l6 14" stroke-width="3.2" fill="none"/>
  </g>`;
  s += passant(498, 300, 1, 1) + passant(516, 300, 0.94, 1); // un couple, vers la place
  s += passant(700, 302, 0.9, -1);
  s += passant(966, 300, 0.85, 1);
  s += passant(1400, 298, 0.8, -1) + passant(1418, 298, 0.74, -1); // deux silhouettes remontent le cours
  // Un chien en laisse, queue haute.
  s += `<g transform="translate(728,302)" fill="#1b1a23">
    <path d="M-12 -8q8 -5 18 -3l6 -6 4 2-3 5 1 3-7 2q-10 2 -19 -3z"/>
    <path d="M-11 -7l-2 7M9 -6l2 6" stroke="#1b1a23" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M14 -16l-16 -22" stroke="#1b1a23" stroke-width="1.2"/>
  </g>`;

  // ---- Le bus du soir, debout, fenêtres allumées (on le reverra couché) ----
  s += `<g>
    <rect x="1140" y="252" width="150" height="46" rx="8" fill="#16151e"/>
    ${[1152, 1176, 1200, 1224, 1248].map(x => `<rect x="${x}" y="260" width="16" height="13" fill="#c9882a" opacity="0.5"/>`).join('')}
    <rect x="1142" y="284" width="146" height="4" fill="#8a4a20" opacity="0.6"/>
    <circle cx="1166" cy="300" r="7.5" fill="#0a0a10"/><circle cx="1262" cy="300" r="7.5" fill="#0a0a10"/>
  </g>`;
  s += halo(a, 'bus', 1296, 282, 28, 16, '#d8cfae', 0.3);

  // ---- Voitures du soir sur le cours : phares et feux rouges ----
  const auto = (x, y, sc, fl) => `<g transform="translate(${x},${y}) scale(${R(sc * fl)},${sc})">
    <path d="M-34 0q2 -10 11 -11l6 -9q17 -6 33 0l6 9q11 1 13 11l-2 6h-65z" fill="#15141d"/>
    <path d="M-16 -18l-4 7h13l2 -7zM1 -18l-2 7h14l-4 -7z" fill="#0a0a12"/>
    <circle cx="-20" cy="6" r="6.5" fill="#0a0a10"/><circle cx="20" cy="6" r="6.5" fill="#0a0a10"/>
  </g>`;
  s += halo(a, 'ph1', 1090, 308, 56, 16, '#d8cfae', 0.34) + auto(1056, 304, 0.9, -1)
    + `<circle cx="1086" cy="300" r="2.6" fill="#e8e0c0" opacity="0.9"/>`;
  s += auto(1496, 308, 0.95, 1) + `<circle cx="1462" cy="304" r="2.2" fill="#a32020" opacity="0.85"/>`;

  // ---- Lampadaires allumés, pins, vitrines chaudes ----
  s += halo(a, 'lp1', 556, 230, 60, 48, '#c9a227', 0.26) + lampadaire(540, 318, 74, '#13121a', 0)
    + `<circle cx="556" cy="232" r="3.4" fill="#e0b04a" opacity="0.85"/>`;
  s += halo(a, 'lp2', 968, 234, 56, 46, '#c9a227', 0.24) + lampadaire(952, 318, 70, '#13121a', 0)
    + `<circle cx="968" cy="236" r="3.2" fill="#e0b04a" opacity="0.8"/>`;
  s += halo(a, 'lp3', 1356, 236, 54, 44, '#c9a227', 0.22) + lampadaire(1340, 318, 72, '#13121a', 0)
    + `<circle cx="1356" cy="234" r="3.2" fill="#e0b04a" opacity="0.8"/>`;
  s += pin(270, 318, 1.1, '#0d120c');
  // Devanture de boulangerie encore ouverte (le rideau de fer à moitié baissé).
  s += `<rect x="798" y="214" width="86" height="32" fill="#c9882a" opacity="0.28"/>
    <rect x="798" y="214" width="86" height="9" fill="#11101a"/>
    <path d="M798 223h86" stroke="#0d0c14" stroke-width="1.6"/>`;
  s += halo(a, 'boul', 841, 234, 64, 30, '#c9882a', 0.2);

  // ---- Voile du soir, léger et fixe : la nuit n'est pas encore une menace ----
  s += `<rect width="${PW}" height="${PH}" fill="#120e1d" opacity="0.1"/>`;
  return s;
}
