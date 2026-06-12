// Ambiance « Centre de secours » — la remise des engins, rue Emmanuel Vitria.
// Intérieur : les portes de garage vitrées découpent le ciel en bandes, le
// fourgon rouge sombre dort dans sa travée, les tenues pendent comme des
// hommes vides. Ils sont partis en trente secondes. Aucun n'est revenu.
import { W, H, R, rng, fenetre, halo, zfig, neige, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1812);
  let s = '';

  // Les murs de la remise : béton peint, mangé d'ombre et de gasoil.
  s += `<rect width="${W}" height="${H}" fill="#100f12"/>`;
  // La charpente métallique, à peine devinée sous le plafond.
  s += `<path d="M0 34H${W}M60 34l50 -22M210 34l50 -22M420 34l50 -22M640 34l50 -22" stroke="#15161c" stroke-width="3" fill="none" opacity="0.8"/>`;

  // Première porte sectionnelle : le ciel du moment entre par bandes vitrées.
  s += fenetre(a, 48, 50, 158, 188, 'a');
  // Dans la cour de manœuvre, un errant attend devant la vitre. Patient.
  s += zfig(105, 165, 0.42, '#0c0d12', a.nuit, 6);
  // Le muret de la cour, au ras du tablier.
  s += `<rect x="48" y="208" width="158" height="30" fill="#0b0c11" opacity="0.85"/>`;
  // Les lamelles du tablier : le jour n'entre qu'en tranches.
  s += `<path d="M48 81H206M48 113H206M48 175H206M48 207H206" stroke="#08090d" stroke-width="4" fill="none"/>
    <path d="M87 50v188M167 50v188" stroke="#08090d" stroke-width="2" opacity="0.8" fill="none"/>`;

  // Deuxième porte : un carreau étoilé — quelque chose a voulu entrer.
  s += fenetre(a, 244, 50, 158, 188, 'b', true);
  // Au travers, la tour de séchage tend ses tuyaux pendus, mues de serpent.
  s += `<rect x="348" y="64" width="36" height="174" fill="#0a0b10" opacity="0.88"/>
    <path d="M344 64h44l-22 -12z" fill="#0a0b10" opacity="0.88"/>
    <path d="M356 72v58M366 72v76M376 72v50" stroke="#16181f" stroke-width="2.4" fill="none" opacity="0.7"/>`;
  s += `<path d="M244 81H402M244 113H402M244 175H402M244 207H402" stroke="#08090d" stroke-width="4" fill="none"/>
    <path d="M283 50v188M363 50v188" stroke="#08090d" stroke-width="2" opacity="0.8" fill="none"/>`;

  // La dalle de béton : joints sales, six travées, plus un seul camion ou presque.
  s += `<rect x="0" y="238" width="${W}" height="${H - 238}" fill="#131210"/>`;
  let joints = '';
  for (let i = 0; i < 6; i++) joints += `M0 ${R(248 + i * 16 + r() * 3)}H${W}`;
  for (let i = 0; i < 9; i++) joints += `M${R(40 + i * 88)} 238L${R(-10 + i * 100)} ${H}`;
  s += `<path d="${joints}" stroke="#0b0a09" stroke-width="1.3" opacity="0.6" fill="none"/>`;
  // Les taches d'huile des engins partis — six travées, six fantômes.
  s += `<ellipse cx="112" cy="280" rx="36" ry="8" fill="#0a0907" opacity="0.8"/>
    <ellipse cx="66" cy="306" rx="22" ry="6" fill="#0a0907" opacity="0.7"/>`;
  // La ligne rouge du départ, peinte au sol : trente secondes du lit au camion.
  s += `<path d="M796 256q-300 12 -560 2" stroke="#5e1518" stroke-width="4" fill="none" opacity="0.55"/>`;
  // La lumière des portes s'écrase en dalles pâles sur le béton.
  s += halo(a, 'pA', 127, 258, 150, 44, a.bas, R(0.15 * Math.max(0.16, a.lum)));
  s += halo(a, 'pB', 323, 262, 140, 40, a.bas, R(0.12 * Math.max(0.16, a.lum)));

  // L'étagère des casques F1, alignés, vérifiés, prêts pour personne.
  s += `<path d="M584 118h148" stroke="#1a1b22" stroke-width="4"/>`;
  let casques = '';
  for (let i = 0; i < 4; i++) casques += `<path d="M${R(594 + i * 36)} 116q3 -11 13 -11t13 11z"/>`;
  s += `<g fill="#16161d">${casques}</g>`;
  // Les tuyaux lovés au mur, couronnes patientes au-dessus des casiers.
  s += `<g stroke="#241c14" fill="none"><circle cx="612" cy="76" r="16" stroke-width="5.5"/>
    <circle cx="612" cy="76" r="6" stroke-width="3"/>
    <circle cx="666" cy="80" r="14" stroke-width="5"/><circle cx="666" cy="80" r="5" stroke-width="3"/></g>`;

  // Les casiers d'intervention, restés ouverts sur le dernier départ.
  s += `<g fill="#14151c"><rect x="588" y="126" width="40" height="112"/>
    <rect x="634" y="126" width="40" height="112"/><rect x="680" y="126" width="40" height="112"/></g>
    <rect x="640" y="132" width="28" height="100" fill="#0a0b10"/>
    <path d="M674 126l26 -10v112l-26 10z" fill="#191a21"/>
    <path d="M608 138v88M700 138v88" stroke="#0d0e13" stroke-width="2" fill="none"/>`;
  // Une paire de bottes au pied des casiers, prête, vide.
  s += `<path d="M644 224v12h10v-12zM658 224v12h10v-12z" fill="#0b0c10"/>`;

  // Les tenues de feu pendues au rail — des hommes vides qui attendent l'alerte.
  s += `<path d="M728 64h66" stroke="#1c1d24" stroke-width="3"/>`;
  for (let i = 0; i < 3; i++) {
    const tx = R(740 + i * 24);
    s += `<path d="M${tx} 70v6" stroke="#1c1d24" stroke-width="2"/>
      <path d="M${tx - 9} 78q9 -5 18 0l4 56h-26z" fill="#14151a"/>
      <path d="M${tx - 8} 96h16M${tx - 8} 118h17" stroke="#6b675a" stroke-width="2" opacity="0.3"/>`;
  }

  // Le fourgon rouge sombre, au repos dans sa travée. Lui n'est jamais parti.
  s += `<ellipse cx="368" cy="310" rx="205" ry="10" fill="#05050a" opacity="0.55"/>`;
  s += `<rect x="180" y="170" width="290" height="92" rx="5" fill="#5e1518"/>
    <path d="M470 262v-82q0 -8 8 -8h38q8 0 13 7l20 28q5 7 5 15v40z" fill="#5e1518"/>
    <rect x="188" y="262" width="362" height="16" fill="#0c0c10"/>`;
  // Les rideaux des coffres d'équipement, à lamelles, tirés sur le matériel.
  let rid = '';
  for (let k = 0; k < 3; k++) {
    const cx0 = 198 + k * 92;
    rid += `<rect x="${cx0}" y="184" width="70" height="62" fill="#470f12"/>`;
    let lam = '';
    for (let j = 1; j < 9; j++) lam += `M${R(cx0 + j * 7.8)} 184v62`;
    rid += `<path d="${lam}" stroke="#320a0d" stroke-width="1.4" fill="none"/>`;
  }
  s += rid;
  // Cabine : vitre latérale, pare-brise en sifflet, gyrophare éteint.
  s += `<rect x="478" y="182" width="30" height="28" rx="2" fill="#0b0d12"/>
    <path d="M518 178l17 25l-7 5l-15 -23z" fill="#0b0d12" opacity="0.9"/>
    <path d="M510 172v90" stroke="#420d11" stroke-width="2" fill="none"/>
    <path d="M486 170v-7h22v7z" fill="#19202e"/>`;
  // La bande rétro-réfléchissante, or pâle fatigué le long du flanc.
  s += `<rect x="182" y="248" width="368" height="5" fill="#c9a227" opacity="0.2"/>`;
  // L'échelle arrimée sur le toit, qui ne montera plus à rien.
  s += `<path d="M190 166h276M190 161h276M214 161v5M262 161v5M310 161v5M358 161v5M406 161v5" stroke="#1a1b22" stroke-width="2.4" fill="none"/>`;
  // Le jour des portes accroche le haut de la caisse.
  s += `<path d="M186 169h298" stroke="${a.bas}" stroke-width="1.6" fill="none" opacity="${R(0.18 * a.lum)}"/>`;
  // Roues et pare-chocs : le repos complet des machines.
  s += `<g fill="#08080b"><circle cx="240" cy="292" r="17"/><circle cx="430" cy="292" r="17"/><circle cx="518" cy="292" r="17"/></g>
    <g fill="#14151a"><circle cx="240" cy="292" r="6"/><circle cx="430" cy="292" r="6"/><circle cx="518" cy="292" r="6"/></g>
    <rect x="540" y="252" width="22" height="12" fill="#15161c"/>`;

  // Poussière en suspension dans les bandes de jour.
  if (a.lum > 0.3) s += neige(43, 12, R(0.1 * a.lum), 50, 410, 60, 235);

  // Une remise sans courant reste sombre, même à midi — les vitres aident à peine.
  s += voileNuit(a, 1.2);
  return s;
}
