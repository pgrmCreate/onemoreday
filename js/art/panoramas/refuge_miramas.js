// Panorama « Le Refuge » — cinématique 1600×340, travelling gauche → droite.
// L'INTÉRIEUR de Miramas-le-Vieux, juste après la herse : à gauche la porte
// Notre-Dame refermée sur le monde mort (la plaine et le triage en contrebas,
// minuscules, encore grouillants au-delà du parapet) ; puis la calade qui monte
// entre les façades de pierre — fenêtres de feu, linge propre, marelle à la
// craie, bûcheron, charreton ; point d'orgue à droite (x ≈ 1240–1400) : la
// placette au micocoulier et la SALLE COMMUNE fumante, des VIVANTS autour d'un
// brasero, l'église et la tour du guet. Le seul endroit du jeu qui respire :
// les lueurs sont chaudes, les fumées sont des fumées de cuisine.
import {
  R, rng, dots, halo, astre, etoiles, neige, brume, clocher, zfig, pin,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  const nox = 1 - a.lum;                  // part d'obscurité 0..~0.94
  const orF = R(0.22 + nox * 0.55);       // fenêtres de feu : visibles le jour, fortes la nuit
  const feuSol = R(0.08 + nox * 0.2);     // lueurs couchées sur les pavés

  // Silhouette de VIVANT — debout, droit, pieds à (x,y). Pas d'yeux rouges : un humain.
  const vivant = (x, y, s = 1, flip = 1, bras = '', t = '#11131b') =>
    `<g transform="translate(${x},${y}) scale(${flip * s},${s})" fill="${t}" stroke="${t}" stroke-linecap="round">
    <circle cx="0" cy="-44" r="5.6" stroke="none"/>
    <path d="M-7 -37Q-10 -18 -8 0L8 0Q10 -20 7 -37Q0 -41 -7 -37Z" stroke="none"/>${bras}</g>`;
  const LANCE = `<path d="M10 -54v58" stroke-width="2" fill="none"/><path d="M5 -30l5 3" stroke-width="4" fill="none"/>`;
  // Vivant assis (sur un banc, à une table) — silhouette tassée, paisible.
  const assis = (x, y, s = 1, flip = 1, t = '#11131b') =>
    `<g transform="translate(${x},${y}) scale(${flip * s},${s})" fill="${t}">
    <circle cx="0" cy="-34" r="5.2"/>
    <path d="M-6 -28Q-9 -14 -7 -8L8 -8L8 0L4 0L4 -4L-6 -4Z"/></g>`;
  // Fumée de cheminée — fumée de cuisine, pas d'incendie.
  const fumee = (x, y, w = 4, o = 0.28) =>
    `<path d="M${x} ${y}q-6 -12 1 -24q7 -12 -1 -24q-5 -10 4 -18" stroke="#8d929c" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${o}"/>`;
  // Lanterne bricolée sur potence — l'éclairage public du Refuge.
  const lanterne = (x, y, h, id) =>
    halo(a, id, x + 9, y - h - 6, 26, 20, '#c9882a', R(0.12 + nox * 0.4))
    + `<path d="M${x} ${y}v${-h}q0 -8 9 -8" stroke="#14161d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="${x + 5.5}" y="${y - h - 13}" width="7" height="9" fill="#0d0e14"/>
    <rect x="${x + 7}" y="${y - h - 11}" width="4" height="5" fill="#e0b04a" opacity="${R(0.3 + nox * 0.6)}"/>`;

  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 84, 54);
  s += etoiles(a, 29, 64) + `<g transform="translate(800,0)">${etoiles(a, 30, 64)}</g>`;

  // ---- Le monde mort, par-dessus le parapet (x 0–470) : la plaine, le triage ----
  s += `<path d="M0 204Q120 194 260 202Q380 208 470 200L470 214L0 214Z" fill="#0a0b10" opacity="0.8"/>`;
  s += `<rect x="0" y="210" width="470" height="26" fill="#0d0e14"/>`;
  // Le triage en contrebas : rails, wagons minuscules, le château d'eau SNCF.
  s += `<path d="M0 224h146M0 229h150" stroke="#15171e" stroke-width="1.2" fill="none" opacity="0.7"/>`;
  let mw = '';
  for (let i = 0; i < 7; i++) mw += `<rect x="${8 + i * 19}" y="${217 - (i % 2)}" width="16" height="6" rx="1"/>`;
  s += `<g fill="#0a0b10" opacity="0.9">${mw}</g>`;
  s += `<path d="M122 217v-8M116 209h12v-6q-6 -3 -12 0z" stroke="#0a0b10" stroke-width="1.6" fill="none"/>`;
  // Eux, dehors, tout en bas. Le mur est exactement à sa place.
  const re = rng(417), epts = [];
  for (let i = 0; i < 6; i++) epts.push([R(34 + re() * 110), R(226 + re() * 5)]);
  s += dots(epts, 1.8, '#0a0b10', 0.8);
  s += zfig(310, 220, 0.18, '#0a0b10', a.nuit, 12) + zfig(388, 222, 0.16, '#0a0b10', a.nuit, -10);
  s += zfig(430, 224, 0.15, '#0a0b10', a.nuit, 8);

  // ---- Le sol : la calade, le caniveau central, les pavés bombés ----
  s += `<rect x="0" y="252" width="${PW}" height="${PH - 252}" fill="#121318"/>`;
  s += `<path d="M0 302q400 8 800 2t800 -4" stroke="#0b0c10" stroke-width="3" fill="none" opacity="0.5"/>
    <path d="M0 307q400 8 800 2t800 -4" stroke="#0b0c10" stroke-width="1.4" fill="none" opacity="0.4"/>`;
  const rp = rng(808);
  let pav = '';
  for (let i = 0; i < 90; i++) pav += `M${R(rp() * PW)} ${R(258 + rp() * 76)}h6`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.6"/>`;
  // Congères au pied des murs, traces de pas — beaucoup de pas. Des vivants.
  s += `<ellipse cx="210" cy="255" rx="26" ry="3.5" fill="#c8cdd8" opacity="0.07"/>
    <ellipse cx="470" cy="332" rx="30" ry="3.5" fill="#c8cdd8" opacity="0.07"/>
    <ellipse cx="1092" cy="256" rx="24" ry="3" fill="#c8cdd8" opacity="0.07"/>
    <ellipse cx="1520" cy="333" rx="28" ry="3.5" fill="#c8cdd8" opacity="0.07"/>`;
  const rfp = rng(212), fp = [];
  for (let i = 0; i < 16; i++) fp.push([R(238 + i * 24 + rfp() * 6), R(306 + (i % 2 ? 5 : -3) + rfp() * 3)]);
  s += dots(fp, 2, '#0b0c10', 0.45);

  // ---- Les guetteurs du chemin de ronde, puis le parapet qui les coupe à la taille ----
  s += vivant(96, 246, 0.6, 1, LANCE) + vivant(126, 246, 0.58, -1);
  let cren = 'M0 234';
  for (let cx = 0; cx < 470; cx += 18) cren += 'v-8h9v8h9';
  cren += 'V252H0z';
  s += `<path d="${cren}" fill="#101117"/>`;
  s += `<rect x="356" y="238" width="34" height="14" fill="#1b1e24" opacity="0.7"/>`; // la tôle qui rapièce la courtine
  // Concertina de récupération sur la lèvre du mur, côté porte.
  let fil = '';
  for (let i = 0; i < 7; i++) fil += `M${R(248 + i * 13)} 228a5 6 0 1 1 .2 0`;
  s += `<path d="${fil}" stroke="#1a1b22" stroke-width="1.5" fill="none" opacity="0.8"/>`;
  s += pin(438, 238, 0.85, '#0a0d0a');

  // ---- La PORTE NOTRE-DAME (x 150–242) : la tour, la herse retombée, le dehors pâle ----
  s += vivant(176, 114, 0.55, 1, LANCE) + vivant(212, 114, 0.5, -1,
    `<path d="M-2 -36l7 -4" stroke-width="3.5" fill="none"/>`);
  s += `<g fill="#0d0e14"><rect x="150" y="116" width="92" height="136"/>
    <path d="M150 116v-8h12v8zM172 116v-8h12v8zM194 116v-8h12v8zM216 116v-8h12v8zM230 116v-8h12v8z"/></g>`;
  s += `<path d="M158 140h22M204 168h26M162 206h18M212 224h20" stroke="#15161d" stroke-width="1.6" opacity="0.7"/>`;
  // La voûte : au-delà, la lumière du dehors — et la herse en travers.
  s += `<path d="M174 252v-32q22 -18 44 0v32z" fill="${a.bas}" opacity="0.85"/>`;
  s += `<path d="M180 252v-34M190 252v-39M200 252v-40M210 252v-39M220 252v-34M174 228h44M174 240h44" stroke="#1a1d24" stroke-width="2.2" fill="none"/>`;
  s += `<path d="M176 246l40 -20M176 226l40 20" stroke="#26211a" stroke-width="3" fill="none" opacity="0.9"/>`;
  s += halo(a, 'porte', 196, 248, 30, 22, '#c9a227', R(0.12 + nox * 0.45));
  s += `<rect x="193" y="212" width="6" height="7" fill="#0b0c11"/><rect x="194.5" y="214" width="3" height="4" fill="#e0b04a" opacity="${R(0.3 + nox * 0.6)}"/>`;
  // Le panneau des consignes, peint à la main — illisible d'ici, connu de tous.
  s += `<rect x="154" y="190" width="26" height="17" fill="#c8cdd8" opacity="0.14"/>
    <path d="M157 195h20M157 200h13" stroke="#06070b" stroke-width="1.6" opacity="0.5"/>`;
  // Le projecteur sur batteries, braqué vers la plaine morte.
  s += `<rect x="154" y="100" width="12" height="8" fill="#101218"/><path d="M160 108v8" stroke="#101218" stroke-width="3"/>`;
  s += `<path d="M154 106L18 198L92 224Z" fill="#d8d8c0" opacity="${R(0.04 + nox * 0.15)}"/>`;
  // L'escalier du chemin de ronde et les sacs de sable de réserve.
  s += `<g fill="#0d0e14"><rect x="40" y="246" width="26" height="6"/><rect x="46" y="240" width="20" height="6"/><rect x="52" y="234" width="14" height="6"/></g>`;
  let sacs = '';
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4 - j; i++)
    sacs += `<ellipse cx="${R(282 + i * 21 + j * 10.5)}" cy="${R(286 - j * 9)}" rx="11" ry="5" fill="${(i + j) % 2 ? '#14151b' : '#121318'}"/>`;
  s += `<g>${sacs}</g>`;

  // ---- Le front de maisons (x 462–1070) : pierre, feux aux fenêtres, fumées ----
  const rv = rng(5113);
  const hs = [
    [462, 92, 88, 1, 0], [560, 118, 112, 1, 1], [684, 76, 96, 0, 0],
    [770, 106, 118, 1, 0], [882, 96, 90, 0, 0], [984, 86, 104, 1, 0],
  ];
  let fenOr = '', fenNoir = '';
  hs.forEach(([hx, hw, hh, chim, ouverte], idx) => {
    const top = 252 - hh, rise = R(12 + hw * 0.14);
    s += `<rect x="${hx}" y="${top}" width="${hw}" height="${hh}" fill="${idx % 2 ? '#0f1016' : '#101117'}"/>`;
    s += `<path d="M${hx - 3} ${top}l${R(hw / 2 + 3)} ${-rise}l${R(hw / 2 + 3)} ${rise}z" fill="#0d0e14"/>`;
    s += `<path d="M${R(hx + 8)} ${R(top + hh * 0.4)}h9M${R(hx + hw - 20)} ${R(top + hh * 0.66)}h10" stroke="#15161d" stroke-width="1.5" opacity="0.6"/>`;
    if (chim) {
      const cx = R(hx + hw * 0.72), cy = R(top - rise + 2);
      s += `<rect x="${R(cx - 3.5)}" y="${cy - 14}" width="7" height="15" fill="#0f1016"/>` + fumee(cx, cy - 14);
    }
    const cols = Math.max(2, Math.round(hw / 44)), rows = hh > 100 ? 3 : 2;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const wx = R(hx + 13 + i * ((hw - 26) / cols)), wy = R(top + 14 + j * ((hh - 30) / rows));
      if (rv() < 0.55) fenOr += `M${wx} ${wy}v8`;
      else fenNoir += `M${wx} ${wy}v8`;
    }
    const dx = R(hx + hw * 0.55);
    s += `<rect x="${dx}" y="228" width="13" height="24" fill="${ouverte ? '#c9882a' : '#07080d'}" ${ouverte ? `opacity="${R(orF * 0.9)}"` : ''}/>`;
    if (ouverte) s += `<path d="M${dx} 252h13l11 18h-34z" fill="#c9882a" opacity="${feuSol}"/>`;
  });
  s += `<path d="${fenNoir}" stroke="#06070b" stroke-width="5.5" fill="none"/>`;
  s += `<path d="${fenOr}" stroke="#c9882a" stroke-width="5.5" fill="none" stroke-linecap="round" opacity="${orF}"/>`;

  // ---- La rue Mireille : la faille entre deux façades, taillée dans le roc ----
  s += `<rect x="758" y="160" width="14" height="92" fill="#07080d"/>
    <path d="M758 188q7 -9 14 0v6h-14z" fill="#0e0f15"/>`;
  s += halo(a, 'mir', 765, 224, 18, 14, '#c9882a', R(0.1 + nox * 0.4));
  s += `<rect x="763" y="218" width="4" height="6" fill="#e0b04a" opacity="0.8"/>`;
  s += `<path d="M757 204q8 4 16 0" stroke="#7e848e" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M762 205v7h6v-7z" fill="#9aa0ab" opacity="0.7"/>`;

  // ---- Du linge sèche entre les façades. Du linge propre. ----
  s += `<path d="M652 186q32 12 64 4" stroke="#7e848e" stroke-width="1.4" fill="none" opacity="0.8"/>`;
  s += `<g fill="#9aa0ab" opacity="0.85"><path d="M664 192v10h7v-10z"/>
    <path d="M684 195h8l-1 10h-2l-1 -7l-1 7h-2z"/><path d="M704 193v9h7v-9z"/></g>`;

  // ---- Le quotidien qui défile : charreton, marelle, bûcheron, puits ----
  s += `<g transform="rotate(-6 540 318)"><rect x="510" y="310" width="52" height="9" fill="#14151a"/>
    <path d="M562 312l18 -6M562 318l18 -2" stroke="#14151a" stroke-width="2.6" fill="none"/></g>
    <circle cx="524" cy="326" r="8.5" fill="#0b0c10"/><circle cx="524" cy="326" r="2.5" fill="#1d2026"/>
    <ellipse cx="528" cy="308" rx="9" ry="5" fill="#1a1c22"/><ellipse cx="544" cy="307" rx="8" ry="4.5" fill="#181a20"/>`;
  s += `<g transform="translate(736,322) scale(1,0.34) rotate(-3)" stroke="#c8cdd8" stroke-width="1.6" fill="none" opacity="0.28">
    <path d="M0 0h13v-9h-13zM13 0h13v-9h-13zM6 -9h14v-9h-14zM6 -18h7v-9h-7zM13 -18h7v-9h-7zM8 -27h11v-9h-11z"/>
    <ellipse cx="13" cy="-41" rx="7" ry="4.5"/></g>`;
  // Le tas de bûches, le billot, la hache levée — du bois pour cent poêles.
  s += `<g fill="#14151a"><circle cx="852" cy="324" r="4"/><circle cx="861" cy="324" r="4"/><circle cx="870" cy="324" r="4"/>
    <circle cx="856" cy="317" r="4"/><circle cx="865" cy="317" r="4"/><circle cx="861" cy="310" r="4"/></g>
    <g fill="#0b0c10"><circle cx="852" cy="324" r="1.4"/><circle cx="861" cy="324" r="1.4"/><circle cx="870" cy="324" r="1.4"/>
    <circle cx="856" cy="317" r="1.4"/><circle cx="865" cy="317" r="1.4"/><circle cx="861" cy="310" r="1.4"/></g>
    <rect x="888" y="312" width="16" height="12" fill="#15161c"/>`;
  // Le puits condamné, planches clouées en travers.
  s += `<ellipse cx="1044" cy="316" rx="17" ry="6" fill="#15161c"/>
    <rect x="1027" y="298" width="34" height="18" rx="3" fill="#15161c"/>
    <path d="M1024 300l40 6M1024 308l40 -4" stroke="#1f1c16" stroke-width="3.5"/>
    <path d="M1031 298v-12q13 -8 26 0v12" stroke="#15161c" stroke-width="3" fill="none"/>`;
  s += lanterne(636, 322, 64, 'lp1') + lanterne(1224, 318, 58, 'lp2');

  // ---- La placette (x 1070–1240) : le micocoulier nu, les tables, les fanions ----
  s += `<g stroke="#0c0e12" fill="none" stroke-linecap="round">
    <path d="M1122 326q-3 -38 0 -58q-10 -16 -22 -22M1122 268q-14 -4 -22 -14M1122 268q2 -16 12 -26q2 -10 0 -18M1134 242q10 -8 22 -10M1134 242q-2 -10 2 -18" stroke-width="6"/>
    <path d="M1100 246q-8 -2 -12 -8M1100 254q-10 2 -16 0M1134 230q6 -8 4 -16M1156 232q8 -2 12 -8M1146 226q2 -8 8 -12" stroke-width="2.4"/>
  </g><path d="M1106 322h32" stroke="#14161a" stroke-width="4"/>`;
  s += `<rect x="1158" y="288" width="46" height="5" fill="#15161c"/>
    <path d="M1164 293l-6 16M1170 293l4 16M1192 293l-5 16M1198 293l6 16" stroke="#15161c" stroke-width="2.6" fill="none"/>`;
  // La guirlande de fanions qu'aucune fête n'a décrochée.
  s += `<path d="M1066 186Q1150 212 1244 162" stroke="#3e4350" stroke-width="1.4" fill="none" opacity="0.9"/>`;
  s += `<g opacity="0.8"><path d="M1096 197l3 9 5 -7z" fill="#3e4350"/><path d="M1126 203l3 9 5 -7z" fill="#5d2730"/>
    <path d="M1156 204l3 9 5 -7z" fill="#3e4350"/><path d="M1186 198l3 9 5 -7z" fill="#454a57"/>
    <path d="M1214 187l3 9 5 -7z" fill="#5d2730"/></g>`;

  // ---- LA SALLE COMMUNE (x 1240–1402) : le cœur du Refuge, et sa fumée de cuisine ----
  s += halo(a, 'scfen', 1316, 208, 96, 44, '#c9882a', R(0.1 + nox * 0.26));
  s += `<rect x="1240" y="156" width="162" height="96" fill="#101118"/>
    <path d="M1234 156l87 -24 87 24z" fill="#0d0e14"/>
    <rect x="1348" y="120" width="9" height="20" fill="#101118"/>`;
  s += fumee(1352, 120, 6, 0.34)
    + `<path d="M1356 118q5 -11 -1 -22q-6 -11 2 -22" stroke="#8d929c" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.26"/>`;
  // Trois hautes fenêtres de feu, la double porte ouverte, la lumière sur les pavés.
  s += `<g fill="#c9882a" opacity="${orF}"><rect x="1256" y="176" width="14" height="22" rx="2"/>
    <rect x="1288" y="176" width="14" height="22" rx="2"/><rect x="1372" y="176" width="14" height="22" rx="2"/></g>
    <path d="M1263 176v22M1256 187h14M1295 176v22M1288 187h14M1379 176v22M1372 187h14" stroke="#0b0c11" stroke-width="1.8"/>`;
  s += `<rect x="1306" y="216" width="28" height="36" fill="#c9882a" opacity="${R(orF * 0.95)}"/>
    <path d="M1320 216v36" stroke="#0b0c11" stroke-width="2.4"/>
    <path d="M1306 252h28l22 30h-66z" fill="#c9882a" opacity="${R(feuSol * 1.4)}"/>`;
  s += `<rect x="1300" y="206" width="40" height="7" fill="#c8cdd8" opacity="0.16"/>
    <rect x="1338" y="224" width="7" height="10" fill="#c8cdd8" opacity="0.3"/>`;
  s += vivant(1316, 254, 0.5, -1, '', '#0b0c11');

  // ---- L'église au grain, le clocher, l'étang de Berre au loin, la tour du guet ----
  s += `<rect x="1494" y="198" width="106" height="5" fill="#46505e" opacity="${R(0.1 + 0.28 * a.lum)}"/>`;
  s += `<rect x="1404" y="190" width="88" height="62" fill="#0e0f15"/>
    <path d="M1400 190l48 -14 48 14z" fill="#0c0d13"/>
    <circle cx="1448" cy="186" r="4.5" fill="#08090d"/>`;
  s += clocher(1496, 252, 86, '#0c0d13');
  s += `<path d="M1452 96q6 -7 12 0M1480 84q5 -6 10 0" stroke="#060608" stroke-width="2" fill="none" opacity="0.8"/>`;
  s += pin(1532, 250, 0.55, '#0a0d0a');
  s += `<g fill="#0b0c11"><rect x="1540" y="116" width="40" height="136"/>
    <rect x="1540" y="106" width="9" height="11"/><rect x="1556" y="106" width="9" height="11"/><rect x="1572" y="106" width="9" height="11"/></g>`;
  s += vivant(1560, 106, 0.5, 1, LANCE);
  s += halo(a, 'guet', 1576, 94, 20, 16, '#c9a227', R(0.1 + nox * 0.4));
  s += `<circle cx="1576" cy="94" r="2" fill="#e0b95a" opacity="0.9"/>`;

  // ---- Le brasero de la placette — et les vivants autour ----
  s += halo(a, 'feu', 1306, 296, 84, 56, '#c9882a', R(0.2 + nox * 0.3));
  s += `<ellipse cx="1306" cy="322" rx="44" ry="6" fill="#c9882a" opacity="${feuSol}"/>`;
  s += `<path d="M1294 312q0 -10 12 -10t12 10l-2 8h-20z" fill="#15161c"/>
    <path d="M1297 304l-7 14M1315 304l7 14M1306 306v14" stroke="#15161c" stroke-width="2.4" fill="none"/>
    <path d="M1306 302q-5 -9 0 -16q6 8 0 16" fill="#e0b04a" opacity="0.9"/>
    <path d="M1306 286q-2 -5 1 -9" stroke="#d8b14a" stroke-width="1.6" fill="none" opacity="0.7"/>`;

  // ---- Les VIVANTS : ils marchent droit, ils portent, ils rient quelque part ----
  s += vivant(700, 284, 0.55, 1,
    `<ellipse cx="13" cy="-4" rx="9" ry="5" stroke="none"/><path d="M6 -28l7 22" stroke-width="3.2" fill="none"/>`);
  s += vivant(716, 318, 0.36) + vivant(762, 325, 0.34, -1);
  s += vivant(906, 312, 0.64, 1,
    `<path d="M3 -34l8 -12" stroke-width="4" fill="none"/><path d="M11 -46l6 -16" stroke-width="2.6" fill="none"/><path d="M13 -64l10 4 -3 6 -9 -3z" stroke="none"/>`);
  s += vivant(1004, 318, 0.68, -1,
    `<rect x="-12" y="-56" width="26" height="7" rx="2" transform="rotate(-8 0 -52)" stroke="none"/><path d="M-2 -34l8 -14" stroke-width="4" fill="none"/>`);
  s += assis(1166, 314, 0.6) + assis(1198, 315, 0.58, -1);
  s += vivant(1180, 326, 0.4, -1);
  s += vivant(1278, 318, 0.66, 1) + vivant(1338, 320, 0.62, -1) + vivant(1314, 322, 0.4);

  // ---- Brume légère et neige fine, en deux moitiés ----
  s += brume(a, 256, '#3a4150', 0.11, 'p1') + `<g transform="translate(800,0)">${brume(a, 256, '#3a4150', 0.11, 'p2')}</g>`;
  s += neige(31, 26, 0.32) + `<g transform="translate(800,0)">${neige(77, 26, 0.32)}</g>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
