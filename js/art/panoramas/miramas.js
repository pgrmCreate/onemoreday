// Panorama « Vers Miramas-le-Vieux » — cinématique 1600×340, travelling gauche→droite.
// À gauche, le triage en contrebas : wagons morts, brume couchée sur les rails.
// Au centre, la plaine de la Touloubre — mas isolé, sillons, pins parasols.
// Point d'orgue à droite : le ROCHER — village perché soudé à la falaise, remparts
// crénelés, rampe d'accès unique en lacets, fumées de cuisine, fenêtres d'or pâle
// à la nuit, deux projecteurs qui balaient la plaine depuis les murs.
import {
  R, rng, etoiles, neige, brume, astre, halo, batisse, clocher,
  carcasse, lampadaire, zfig, pin,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  const r = rng(2147);
  const nox = 1 - a.lum;                        // part d'obscurité 0..~0.94
  const orFen = R(Math.max(0.1, nox) * 0.72);   // fenêtres chaudes, vivantes la nuit
  const pjO = R(0.05 + nox * 0.2);              // cônes des projecteurs

  // ----- Ciel pleine largeur (gradient maison : fondCiel ne couvre que 800) -----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += etoiles(a, 61, 64) + `<g transform="translate(800,0)">${etoiles(a, 62, 64)}</g>`;
  s += astre(a, 1078, 56);

  // ----- Fond continu, sans couture : crête basse des collines puis la plaine -----
  s += `<path d="M0 250Q150 238 320 248Q500 256 660 244Q820 234 980 246Q1120 254 1240 244Q1420 234 1600 246L1600 340L0 340Z" fill="#0b0c11" opacity="0.85"/>`;
  s += `<rect x="0" y="258" width="${PW}" height="82" fill="#101116"/>`;

  // ----- Le triage, en contrebas (gauche) : cuvette sombre, rails convergents -----
  s += `<path d="M0 272L500 270Q572 272 614 286L658 340L0 340Z" fill="#0c0d12"/>`;
  s += `<path d="M0 298L640 284M0 308L652 292M0 320L668 302M0 332L676 312" stroke="#1c1d24" stroke-width="2.4" fill="none"/>`;
  let trav = '';
  for (let tx = 6; tx < 630; tx += 16) trav += `M${tx} ${R(303 - tx * 0.023)}h9M${tx + 7} ${R(326 - tx * 0.027)}h10`;
  s += `<path d="${trav}" stroke="#15161c" stroke-width="2.6" fill="none" opacity="0.8"/>`;
  // Poteaux caténaires et château d'eau SNCF, silhouettes au-dessus de la fosse.
  s += `<path d="M40 296v-64h16M250 294v-62h16M460 290v-58h16" stroke="#0d0e13" stroke-width="3.5" fill="none"/>`;
  s += `<path d="M548 268l8 -32h32l8 32" stroke="#0c0d12" stroke-width="4" fill="none"/>
    <path d="M540 236h64v-18q-32 -10 -64 0z" fill="#0c0d12"/>`;
  // Wagons morts — flancs orange SNCF mangés de nuit, un wagon versé.
  const wag = (x, y, w, t, sncf) => `<g transform="translate(${x},${y})" fill="${t}">
    <rect x="0" y="-32" width="${w}" height="25" rx="2"/>
    ${sncf ? `<rect x="5" y="-28" width="${R(w * 0.38)}" height="16" fill="#8a4a20" opacity="0.45"/>` : ''}
    <path d="M3 -7v5M${w - 3} -7v5" stroke="${t}" stroke-width="3"/>
    <circle cx="12" cy="0" r="4.5" fill="#08080b"/><circle cx="${w - 12}" cy="0" r="4.5" fill="#08080b"/>
    <path d="M0 -32h${w}" stroke="#1a1b22" stroke-width="1.6"/>
  </g>`;
  s += wag(58, 301, 92, '#101117', true) + wag(160, 300, 86, '#0e0f15', false) + wag(298, 298, 96, '#101117', true);
  s += wag(96, 327, 100, '#0d0e14', false) + `<g transform="translate(356,332) rotate(-7)">${wag(0, 0, 90, '#0e0f15', true)}</g>`;
  // Signal mort, feu rouge éteint à jamais ; trace sombre entre les voies.
  s += `<path d="M620 300v-44h-10" stroke="#101117" stroke-width="3" fill="none"/><circle cx="606" cy="256" r="3" fill="#a31621" opacity="0.55"/>`;
  s += `<path d="M214 322q22 6 40 1l-6 7q-18 4 -30 -2z" fill="#22080a" opacity="0.5"/>`;
  s += zfig(322, 296, 0.55, '#0b0c10', a.nuit, 10);

  // ----- La plaine de la Touloubre : la rivière prend la couleur du ciel -----
  s += `<path d="M660 336Q716 306 800 296Q900 284 992 278Q1080 272 1148 268" stroke="${a.bas}" stroke-width="7" fill="none" opacity="0.16" stroke-linecap="round"/>`;
  s += `<path d="M664 334Q720 305 802 295Q902 283 1150 267" stroke="${a.bas}" stroke-width="2" fill="none" opacity="0.3"/>`;
  let sillons = '';
  for (let i = 0; i < 8; i++) sillons += `M${R(688 + i * 10)} ${R(298 + i * 5)}q70 ${R(-2 - r() * 3)} ${R(150 - i * 8)} ${R(-1 - r() * 2)}`;
  s += `<path d="${sillons}" stroke="#0c0d12" stroke-width="1.8" fill="none" opacity="0.7"/>`;
  let cloture = '';
  for (let i = 0; i < 12; i++) cloture += `M${R(680 + i * 38 + r() * 8)} ${R(310 + i * 1.6)}v-10`;
  s += `<path d="${cloture}" stroke="#0d0e13" stroke-width="2.6" fill="none"/>`;
  // Le mas abandonné, volets morts, et la petite route qui mène au rocher.
  s += batisse(a, 880, 274, 66, 30, '#0d0e14', 73) + `<path d="M876 246l37 -13 37 13z" fill="#0d0e14"/>`;
  s += `<path d="M820 340Q1000 320 1150 322Q1180 324 1196 330" stroke="#15161d" stroke-width="10" fill="none" opacity="0.8"/>`;
  s += carcasse(1040, 330, 0.9, '#101117', 9);
  s += pin(700, 318, 1, '#0a0d0a') + pin(836, 300, 0.7, '#0a0d0a') + pin(1020, 326, 1.3, '#0a0d0a');
  s += zfig(742, 306, 0.5, '#0b0c10', a.nuit, -7);

  // ----- LE ROCHER (x 1190–1590) : la falaise et le village soudé dessus -----
  s += `<path d="M1186 340L1208 268Q1216 228 1238 200L1248 156Q1252 134 1266 126L1272 116L1538 116Q1546 132 1552 162L1564 216Q1572 260 1588 340Z" fill="#0a0b10"/>`;
  s += `<path d="M1262 132L1242 222L1258 340M1352 118L1338 236L1360 340M1470 117L1486 234L1470 340" stroke="#06070b" stroke-width="2.2" fill="none" opacity="0.65"/>`;
  // Remparts crénelés posés sur la lèvre du plateau.
  let cren = 'M1262 106';
  for (let cx = 1262; cx < 1534; cx += 16) cren += 'v-7h8v7h8';
  cren += 'v14H1262z';
  s += `<path d="${cren}" fill="#0e0f15"/>`;
  // Le village : pignons serrés au-dessus du mur, fenêtres d'or pâle la nuit.
  const rv = rng(907);
  let maisons = '', fenOr = '';
  let mx = 1270;
  while (mx < 1516) {
    const mw = R(22 + rv() * 24), mh = R(14 + rv() * 24), rh = R(5 + rv() * 6);
    maisons += `<path d="M${mx} 105v${R(-mh)}l${R(mw / 2)} ${R(-rh)}l${R(mw / 2)} ${rh}v${mh}z" fill="${rv() < 0.5 ? '#0e0f15' : '#101118'}"/>`;
    if (rv() < 0.85) fenOr += `M${R(mx + 5 + rv() * (mw - 10))} ${R(101 - rv() * (mh - 9))}v5`;
    mx += mw + R(3 + rv() * 5);
  }
  s += maisons + clocher(1394, 102, 30, '#0c0d13');
  s += `<path d="${fenOr}" stroke="#c9a227" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="${orFen}"/>`;
  // Fumées de cuisine — le seul village qui respire encore.
  s += `<path d="M1302 86q-7 -11 -1 -22q6 -11 -1 -24M1386 68q-6 -10 0 -21q6 -11 -1 -22M1466 84q-7 -11 0 -23q6 -10 -1 -21" stroke="#4d515c" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.3"/>`;
  // La rampe d'accès unique, en lacets sur la face de la falaise, jusqu'à la porte.
  s += `<path d="M1182 334L1326 298L1234 268L1354 236L1260 206L1352 178L1282 152L1320 132L1294 120" stroke="#1e2028" stroke-width="4.6" fill="none" stroke-linejoin="round" opacity="0.9"/>`;
  s += `<path d="M1288 120v-12q7 -9 14 0v12z" fill="#04050a"/>`;
  s += `<path d="M1326 294h.1M1354 232h.1M1320 128h.1" stroke="#c9a227" stroke-width="3" fill="none" stroke-linecap="round" opacity="${orFen}"/>`;
  // Deux projecteurs balaient depuis les murs — cônes pâles couchés sur la plaine.
  s += halo(a, 'pj1', 1268, 112, 22, 16, '#e6e2c8', R(0.15 + nox * 0.4));
  s += halo(a, 'pj2', 1530, 112, 22, 16, '#e6e2c8', R(0.12 + nox * 0.36));
  s += `<path d="M1268 112L1064 318L1176 334Z" fill="#d8d8c0" opacity="${pjO}"/>`;
  s += `<path d="M1530 112L1596 332L1474 326Z" fill="#d8d8c0" opacity="${R(pjO * 0.8)}"/>`;
  // Eux, pris dans le faisceau, et un autre au pied de la rampe.
  s += zfig(1120, 318, 0.58, '#0a0b10', a.nuit, 12) + zfig(1210, 332, 0.5, '#0b0c10', a.nuit, -9);

  // ----- Brume au sol, continue d'un bord à l'autre (deux nappes identiques) -----
  s += brume(a, 278, '#3a4150', 0.16);
  s += `<g transform="translate(800,0)">${brume(a, 278, '#3a4150', 0.16, 'b')}</g>`;
  s += `<ellipse cx="320" cy="314" rx="330" ry="14" fill="#3a4150" opacity="0.15"/>`;

  // ----- Premier plan qui défile au travelling : carcasses, mâts, grand pin -----
  s += carcasse(238, 339, 1.15, '#101117', 4) + carcasse(636, 338, 1.05, '#0e0f15', 6);
  s += lampadaire(470, 338, 80, '#0d0e13', -6) + lampadaire(905, 338, 74, '#0d0e13', 4);
  s += pin(972, 340, 1.6, '#0a0d0a');

  s += neige(71, 30, 0.35) + `<g transform="translate(800,0)">${neige(72, 30, 0.35)}</g>`;

  // Voile final maison (voileNuit ne couvre que 800 de large).
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
