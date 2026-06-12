// Ambiance « Quartier de la gare » — l'avenue en pente vers le bâtiment voyageurs.
// Extérieur : la façade SNCF au fond (horloge arrêtée sur le dernier convoi),
// l'auvent affaissé, le passage sous voie comme une bouche noire, un bus articulé
// plié en travers de l'avenue, et les valises de ceux qui ont couru pour rien.
import {
  W, H, R, rng, fondCiel, astre, etoiles, neige, brume, batisse, toits,
  lampadaire, zfig, pin, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(2140);
  let s = fondCiel(a) + astre(a, 138, 56) + etoiles(a, 56, 66);

  // Les toits du bas de la ville, serrés derrière l'avenue.
  s += toits(14, 182, 40, '#0b0c12', 0.82);

  // Maisons de ville côté gauche : volets tirés, personne derrière.
  s += batisse(a, 0, 246, 118, 138, '#0f1016', 61);
  s += batisse(a, 126, 246, 100, 112, '#0d0e14', 62);

  // La gare de Salon : pavillon central, deux ailes basses, fronton.
  s += `<g fill="#0e0f15">
    <rect x="290" y="190" width="50" height="56"/><rect x="500" y="190" width="50" height="56"/>
    <rect x="340" y="148" width="160" height="98"/>
    <path d="M332 148h176l-12 -18h-152z"/>
  </g>`;
  // L'horloge du fronton, morte à 21 h 40 — l'heure du dernier convoi.
  s += `<circle cx="420" cy="140" r="9" fill="#181920"/>
    <path d="M420 140l-7 4M420 140l-4.5 1.6" stroke="#3a3b44" stroke-width="1.8"/>`;
  // Bandeau d'enseigne délavé, trois portes en arc, fenêtres mortes à l'étage.
  s += `<rect x="352" y="158" width="136" height="7" fill="#8a4a20" opacity="0.32"/>`;
  for (const ax of [368, 408, 448]) s += `<path d="M${ax} 246v-32q0 -11 12 -11t12 11v32z" fill="#06070b"/>`;
  s += `<path d="M372 178v10M418 178v10M464 178v10" stroke="#06070b" stroke-width="6" fill="none"/>`;
  // L'auvent du parvis, qui ploie sur ses derniers poteaux.
  s += `<path d="M304 196q116 16 232 5l-7 9q-110 9 -218 -5z" fill="#0a0b10"/>
    <path d="M330 206v40M420 210v36M510 205l7 41" stroke="#0a0b10" stroke-width="3" fill="none"/>`;

  // Le mur de soutènement des voies, à droite — et le passage sous voie,
  // une bouche noire d'où rien ne remonte plus.
  s += `<rect x="556" y="212" width="244" height="34" fill="#0e0f15"/>
    <path d="M556 212h244" stroke="#14151b" stroke-width="3"/>
    <path d="M614 246v-24q0 -8 14 -8t14 8v24z" fill="#04050a"/>`;
  // Caténaires : les poteaux tiennent encore, les fils ont rendu.
  s += `<path d="M600 212V116M600 124h20M600 136l18 -7M716 212V116M716 124h-20M716 136l-18 -7" stroke="#0c0d12" stroke-width="3" fill="none"/>
    <path d="M618 126q48 34 80 4M696 130q26 48 10 96" stroke="#0c0d12" stroke-width="1.6" fill="none" opacity="0.8"/>`;

  // Le sol, et l'avenue qui descend vers le parvis en se resserrant.
  s += `<rect x="0" y="246" width="${W}" height="${H - 246}" fill="#121318"/>`;
  s += `<path d="M92 340L322 250h196L668 340z" fill="#14151a"/>
    <path d="M404 262h10M398 280h14M390 302h18M380 326h24" stroke="#1d1e26" stroke-width="3" fill="none" opacity="0.65"/>`;
  let pav = '';
  for (let i = 0; i < 34; i++) pav += `M${R(r() * W)} ${R(252 + r() * 80)}h6`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.7"/>`;

  // Un d'eux, à demi caché derrière le bus — il regarde vers la gare, lui aussi.
  s += zfig(486, 280, 0.5, '#0b0c10', a.nuit, 10);

  // Le bus articulé de l'évacuation, plié en travers de l'avenue. Il n'est
  // pas allé plus loin que ça.
  s += `<g transform="translate(238,310)">
    <path d="M0 0h148v-36q0 -5 -5 -5h-138q-5 0 -5 5z" fill="#101117"/>
    <rect x="8" y="-33" width="132" height="13" fill="#06070b"/>
    <path d="M40 -33v13M74 -33v13M108 -33v13" stroke="#101117" stroke-width="2"/>
    <rect x="6" y="-14" width="136" height="4" fill="#8a4a20" opacity="0.3"/>
    <circle cx="26" cy="0" r="8" fill="#08080b"/><circle cx="122" cy="0" r="8" fill="#08080b"/>
    <path d="M148 -38l16 3v32l-16 3z" fill="#0a0a0d"/>
    <path d="M153 -36v35M159 -35v33" stroke="#06070b" stroke-width="1.4"/>
    <g transform="translate(164,0) rotate(3)">
      <path d="M0 0h138v-36q0 -5 -5 -5h-128q-5 0 -5 5z" fill="#101117"/>
      <rect x="6" y="-33" width="124" height="13" fill="#06070b"/>
      <path d="M38 -33v13M70 -33v13M102 -33v13" stroke="#101117" stroke-width="2"/>
      <rect x="4" y="-14" width="128" height="4" fill="#8a4a20" opacity="0.3"/>
      <circle cx="24" cy="0" r="8" fill="#08080b"/><circle cx="114" cy="0" r="8" fill="#08080b"/>
      <path d="M30 -41q20 -8 44 -3M88 -41q14 -5 30 -1" stroke="#06070b" stroke-width="2.4" fill="none" opacity="0.7"/>
    </g>
  </g>`;

  // Mobilier d'avenue : lampadaires morts, un pin que l'hiver n'a pas déshabillé.
  s += lampadaire(96, 318, 72, '#0d0e13', 5);
  s += lampadaire(704, 326, 58, '#0d0e13', -9);
  s += pin(150, 248, 0.95, '#0a0d0a');

  // Les valises, éventrées là où on les a lâchées. Le linge a pris la couleur du sol.
  for (const [vx, vy, rot] of [[168, 324, -4], [552, 318, 7], [392, 330, 0]]) {
    s += `<g transform="translate(${vx},${vy}) rotate(${rot})">
      <rect x="0" y="-13" width="28" height="13" rx="2" fill="#13141a"/>
      <path d="M2 -13l7 -11h19l-5 11z" fill="#0e0f15"/>
      <path d="M3 0q9 6 20 3M8 0q7 4 12 2" stroke="#41454f" stroke-width="2.4" fill="none" opacity="0.55"/>
    </g>`;
  }
  s += `<path d="M398 334q16 4 30 0l-4 6q-12 3 -22 -1z" fill="#22080a" opacity="0.5"/>`;

  // Eux. Un qui sort du passage sous voie, un qui remonte l'avenue à vide.
  s += zfig(636, 228, 0.4, '#0a0b10', a.nuit, 5);
  s += zfig(178, 298, 0.62, '#0b0c10', a.nuit, -7);

  s += brume(a, 252, '#3a4150', 0.15);
  s += neige(17, 26, 0.35);
  s += voileNuit(a);
  return s;
}
