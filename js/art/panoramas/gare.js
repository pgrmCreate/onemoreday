// Panorama « La gare » — travelling le long des quais sous la halle :
// verrière crevée en sheds (le ciel du moment passe entre les poutrelles),
// piliers de fonte en rythme, train de marchandises endormi sur la voie du
// fond, bagages et bâches abandonnés, panneaux pendus — et au bout du quai,
// le locotracteur orange, seul sur sa voie de service, presque lumineux.
import {
  R, rng, astre, etoiles, neige, brume, toits, zfig, halo,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  // --- Ciel pleine largeur (fondCiel ne couvre que 800) ---
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;

  s += astre(a, 438, 56);
  s += etoiles(a, 41, 60) + `<g transform="translate(800,0)">${etoiles(a, 67, 60)}</g>`;

  // --- Lointain : les toits de Salon au-delà des voies ---
  s += toits(9, 206, 40, '#0b0c12', 0.8)
    + `<g transform="translate(800,0)">${toits(53, 206, 40, '#0b0c12', 0.8)}</g>`;

  // --- Voie du fond + train de marchandises immobile ---
  s += `<path d="M0 259H${PW}" stroke="#1a1c23" stroke-width="2" opacity="0.8"/>`;
  const rt = rng(411);
  let wag = '', tx = 46, wi = 0;
  while (tx < 1140) {
    const w = R(138 + rt() * 46), t = wi % 3;
    if (t === 0) {
      // Couvert : porte coulissante entrouverte sur du noir.
      wag += `<rect x="${tx}" y="198" width="${w}" height="56" fill="#0d0f15"/>
      <rect x="${R(tx + w * 0.36)}" y="206" width="${R(w * 0.26)}" height="44" fill="#0b0c11"/>
      <path d="M${tx} 204h${w}" stroke="#08090c" stroke-width="2" opacity="0.8"/>`;
    } else if (t === 1) {
      // Tombereau : chargement en dents irrégulières.
      wag += `<rect x="${tx}" y="212" width="${w}" height="42" fill="#0c0e13"/>
      <path d="M${tx} 212l${R(w * 0.2)} -8 ${R(w * 0.18)} 6 ${R(w * 0.22)} -9 ${R(w * 0.2)} 7 ${R(w * 0.2)} 4" stroke="#0a0b10" stroke-width="3" fill="none"/>`;
    } else {
      // Citerne ventrue sur ses berceaux.
      wag += `<rect x="${tx}" y="206" width="${w}" height="40" rx="19" fill="#0e1016"/>
      <rect x="${R(tx + w / 2 - 5)}" y="200" width="10" height="8" fill="#0b0c11"/>
      <rect x="${tx + 8}" y="246" width="${w - 16}" height="8" fill="#0b0c11"/>`;
    }
    wag += `<rect x="${tx}" y="252" width="${w}" height="5" fill="#08090d"/>
    <circle cx="${R(tx + 22)}" cy="253" r="6.5" fill="#07080b"/>
    <circle cx="${R(tx + w - 22)}" cy="253" r="6.5" fill="#07080b"/>`;
    // Une traînée brune séchée sur un flanc ; une bâche qui claque sur un autre.
    if (wi === 1) wag += `<path d="M${R(tx + w * 0.4)} 226q8 14 4 26l-12 -2q2 -14 8 -24z" fill="#a31621" opacity="0.35"/>`;
    if (wi === 3) wag += `<path d="M${tx + 6} 198q${R(w * 0.4)} -8 ${R(w - 12)} 2l-4 18q-${R(w * 0.45)} -8 -${R(w - 16)} 0z" fill="#1d2027" opacity="0.85"/>`;
    if (tx + w + 12 < 1140) wag += `<path d="M${R(tx + w)} 244h12" stroke="#0a0b10" stroke-width="3"/>`;
    tx += w + 12;
    wi++;
  }
  s += wag + `<rect x="40" y="257" width="1104" height="4" fill="#06070a" opacity="0.6"/>`;

  // --- Le quai : bordure, ligne de sécurité mangée, joints de dalles ---
  s += `<rect x="0" y="262" width="${PW}" height="${PH - 262}" fill="#101218"/>
  <rect x="0" y="262" width="${PW}" height="7" fill="#181a21"/>
  <path d="M0 309H${PW}" stroke="#474c5a" stroke-width="2.4" stroke-dasharray="16 26" opacity="0.28"/>`;
  const rp = rng(913);
  let pav = '';
  for (let i = 0; i < 70; i++) pav += `M${R(rp() * PW)} ${R(272 + rp() * 36)}h8`;
  s += `<path d="${pav}" stroke="#0a0b10" stroke-width="1.8" fill="none" opacity="0.55"/>`;

  // --- Bagages, bâches et débris qui défilent au premier plan ---
  s += `<g fill="#0d0e14">
    <rect x="132" y="284" width="34" height="20" rx="2"/>
    <rect x="150" y="268" width="28" height="17" rx="2"/>
    <path d="M158 268v-5h12v5" stroke="#0d0e14" stroke-width="3" fill="none"/>
    <rect x="170" y="288" width="26" height="16" rx="2" transform="rotate(8 183 296)"/>
  </g>`;
  s += `<path d="M398 304q4 -26 34 -30q30 -3 44 14q8 10 8 16z" fill="#1c1f27"/>
  <path d="M412 290q14 -10 34 -8M404 300q22 -12 56 -6" stroke="#101218" stroke-width="1.6" fill="none" opacity="0.8"/>
  <path d="M484 302q14 2 20 6l-30 2z" fill="#a31621" opacity="0.4"/>`;
  s += `<path d="M540 296q44 6 86 2l-6 7q-44 4 -76 -2z" fill="#22080a" opacity="0.5"/>`;
  s += `<g stroke="#14161d" fill="none" stroke-width="3">
    <path d="M636 300l54 -8M642 302l-8 -22"/>
    <circle cx="648" cy="304" r="6" fill="#0a0b10" stroke="none"/>
    <circle cx="684" cy="298" r="6" fill="#0a0b10" stroke="none"/>
  </g>`;
  s += `<rect x="724" y="296" width="58" height="14" fill="#0e1016" transform="rotate(-5 753 303)"/>
  <rect x="730" y="300" width="40" height="4" fill="#222633" opacity="0.5" transform="rotate(-5 753 303)"/>`;
  s += `<rect x="886" y="290" width="30" height="14" rx="2" fill="#0d0e14"/>
  <path d="M886 290l-16 -8l4 14z" fill="#0d0e14"/>
  <path d="M872 296q-12 4 -20 2q6 6 16 5z" fill="#191b22"/>
  <rect x="930" y="294" width="20" height="12" rx="2" fill="#0c0d13" transform="rotate(-10 940 300)"/>`;
  s += `<path d="M1052 304q6 -20 30 -24q26 -4 38 12q6 8 6 12z" fill="#1a1d25"/>
  <path d="M1062 288l8 16M1096 282l6 22" stroke="#0e1016" stroke-width="1.5" fill="none"/>`;

  // Eux. Ils attendent un train qui ne passera plus.
  s += zfig(284, 273, 0.6, '#0b0c10', a.nuit, -7);
  s += zfig(596, 270, 0.64, '#0b0c10', a.nuit, 10);
  s += zfig(948, 279, 0.5, '#0a0b10', a.nuit, -12);

  // --- La halle : sheds crevés, verrière sale, éclats qui pendent ---
  const rs = rng(77);
  let verre = '', cadres = '', eclats = '';
  for (let x0 = 0; x0 < PW; x0 += 160) {
    const ax = x0 + 52;
    cadres += `M${x0} 112L${ax} 30L${x0 + 160} 112`;
    cadres += `M${x0 + 26} 71V112M${ax + 27} 50.5V112M${ax + 54} 71V112M${ax + 81} 91.5V112`;
    if (rs() < 0.55) verre += `M${x0} 112L${ax} 30L${ax} 112Z`;
    else eclats += `M${x0 + 14} 90l7 12 5 -9 6 14`;
    if (rs() < 0.5) verre += `M${ax} 30L${x0 + 160} 112L${ax} 112Z`;
    else eclats += `M${ax + 36} 58l8 14 6 -8 7 16M${ax + 70} 96l5 9`;
  }
  s += verre ? `<path d="${verre}" fill="#0d1118" opacity="0.5"/>` : '';
  s += `<path d="${cadres}" stroke="#0a0b10" stroke-width="4.5" fill="none"/>`;
  s += eclats ? `<path d="${eclats}" stroke="#0d1016" stroke-width="2" fill="none" opacity="0.9"/>` : '';
  s += `<rect x="0" y="112" width="${PW}" height="7" fill="#0b0c11"/>`;
  // Caténaire morte : un câble qui pendouille, arraché vers le milieu.
  s += `<path d="M0 132q210 30 430 12t450 20q220 12 440 -10t280 6" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.7"/>
  <path d="M898 150q8 34 -8 60" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.7"/>`;

  // --- Piliers de fonte en rythme, consoles en arc, lampes pendantes mortes ---
  let pil = '';
  for (let k = 1; k <= 9; k++) {
    const px = k * 160;
    pil += `<path d="M${px - 46} 119Q${px} 121 ${px} 158M${px + 46} 119Q${px} 121 ${px} 158" stroke="#0b0c11" stroke-width="3" fill="none" opacity="0.9"/>
    <circle cx="${px}" cy="138" r="6" stroke="#0b0c11" stroke-width="2.2" fill="none" opacity="0.8"/>
    <rect x="${px - 11}" y="119" width="22" height="6" fill="#090a0f"/>
    <rect x="${px - 5}" y="125" width="10" height="172" fill="#090a0f"/>
    <rect x="${px - 9}" y="195" width="18" height="5" fill="#090a0f"/>
    <rect x="${px - 12}" y="297" width="24" height="8" fill="#090a0f"/>`;
    if (k % 2) pil += `<path d="M${px + 80} 119v16" stroke="#0a0b10" stroke-width="2"/>
    <path d="M${px + 71} 143l9 -9 9 9z" fill="#0a0b10"/><circle cx="${px + 80}" cy="146" r="2.5" fill="#14151c"/>`;
  }
  s += pil;

  // --- Panneaux pendus (l'un ne tient plus que par une chaîne) ---
  s += `<g stroke="#15171e" stroke-width="2">
    <path d="M348 119v18M412 119v18" fill="none"/>
    <rect x="338" y="137" width="84" height="22" fill="#0e1016"/>
    <rect x="346" y="144" width="56" height="6" fill="#222633" opacity="0.55" stroke="none"/>
  </g>
  <g transform="rotate(-10 706 119)" stroke="#15171e" stroke-width="2">
    <path d="M706 119v20" fill="none"/>
    <rect x="664" y="139" width="84" height="22" fill="#0e1016"/>
    <rect x="672" y="146" width="50" height="6" fill="#222633" opacity="0.55" stroke="none"/>
  </g>
  <g stroke="#15171e" stroke-width="2">
    <path d="M1148 119v16M1214 119v22" fill="none"/>
    <rect x="1138" y="138" width="86" height="22" fill="#0e1016" transform="rotate(4 1181 149)"/>
  </g>`;

  s += brume(a, 248, '#3a4150', 0.13, 'p1')
    + `<g transform="translate(800,0)">${brume(a, 248, '#3a4150', 0.13, 'p2')}</g>`;

  // --- Voie de service au premier plan : ballast, traverses, rails ---
  s += `<rect x="0" y="312" width="${PW}" height="${PH - 312}" fill="#0b0c11"/>`;
  let trav = '';
  for (let sx = 10; sx < PW; sx += 34) trav += `M${sx} 315V336`;
  s += `<path d="${trav}" stroke="#08090d" stroke-width="6" fill="none"/>
  <path d="M0 318H${PW}M0 330H${PW}" stroke="#1e2129" stroke-width="2.6"/>`;

  // --- Point d'orgue : le LOCOTRACTEUR ORANGE, seul, presque lumineux ---
  s += halo(a, 'loco', 1352, 270, 160, 95, '#8a4a20', 0.3);
  s += `<g>
    <rect x="1258" y="290" width="190" height="11" fill="#0a0a0e"/>
    <path d="M1252 293h6M1448 293h6" stroke="#0a0a0e" stroke-width="7"/>
    <rect x="1266" y="248" width="112" height="42" rx="3" fill="#8a4a20"/>
    <path d="M1294 248v42M1322 248v42M1350 248v42" stroke="#5f3316" stroke-width="1.6"/>
    <path d="M1270 252h104" stroke="#a3622e" stroke-width="2" opacity="0.7"/>
    <rect x="1286" y="236" width="9" height="12" fill="#33271d"/>
    <rect x="1378" y="224" width="62" height="66" fill="#8a4a20"/>
    <rect x="1373" y="218" width="72" height="8" rx="3" fill="#5f3316"/>
    <rect x="1386" y="232" width="44" height="22" fill="#0b0e14"/>
    <path d="M1408 232v22" stroke="#5f3316" stroke-width="2.4"/>
    <rect x="1262" y="283" width="182" height="5" fill="#c8c2b0" opacity="0.4"/>
    <path d="M1266 246h112M1373 217h72" stroke="#c8cdd8" stroke-width="2" opacity="0.45"/>
    <path d="M1306 262q-3 10 1 22M1394 270q-2 9 1 16" stroke="#5f3316" stroke-width="1.6" fill="none" opacity="0.8"/>
    <circle cx="1296" cy="305" r="13" fill="#08080b"/><circle cx="1296" cy="305" r="4" fill="#1a1c22"/>
    <circle cx="1352" cy="305" r="13" fill="#08080b"/><circle cx="1352" cy="305" r="4" fill="#1a1c22"/>
    <circle cx="1408" cy="305" r="13" fill="#08080b"/><circle cx="1408" cy="305" r="4" fill="#1a1c22"/>
    <path d="M1283 305h114" stroke="#0a0a0e" stroke-width="3"/>
    <circle cx="1444" cy="252" r="3" fill="#c9a227" opacity="${R(0.25 + 0.4 * (1 - a.lum))}"/>
  </g>`;

  s += neige(31, 34, 0.35) + `<g transform="translate(800,0)">${neige(87, 34, 0.35)}</g>`;

  // Voile final pleine largeur (voileNuit ne couvre que 800).
  const ov = Math.min(0.82, Math.round((1 - a.lum) * 55) / 100);
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${ov}"/>`;
  return s;
}
