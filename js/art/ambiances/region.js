// Ambiance « Le pays salonais » — la plaine de la Crau vue du bord du ballast.
// Extérieur : la voie ferrée file droit vers Miramas (« suivez la voie ferrée »),
// les pylônes THT en file indienne, un mas volets clos sous ses cyprès, la garrigue
// rase peignée par le mistral — et l'A54 sur ses piles, au loin, figée pour de bon.
import {
  W, H, R, rng, dots, fondCiel, astre, etoiles, neige, brume, zfig, pin, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(4554);
  let s = fondCiel(a) + astre(a, 152, 58) + etoiles(a, 45, 78);

  // Les Alpilles au nord, une dent de calcaire posée sur l'horizon.
  s += `<path d="M0 184q60 -26 120 -16t96 4q70 4 120 12L356 196H0z" fill="#0d0f16" opacity="0.6"/>`;
  // Les collines de Lançon et des Costes, plus proches, plus sombres.
  s += `<path d="M420 196q70 -22 150 -14q60 4 110 -8q70 -14 120 6v16H420z" fill="#0b0c12" opacity="0.85"/>`;

  // L'A54 surélevée, au loin — et dessus, l'exode à l'arrêt, minuscule.
  s += `<rect x="0" y="178" width="252" height="6" fill="#0d0e14"/>
    <path d="M30 184v12M86 184v12M142 184v12M198 184v12" stroke="#0d0e14" stroke-width="5" fill="none"/>
    <path d="M0 178h252" stroke="#14151c" stroke-width="1.4"/>
    <path d="M44 176h9M120 176h7M170 176h10M205 176h6" stroke="#08090d" stroke-width="3.4" fill="none"/>`;

  // La steppe : plate jusqu'à l'horizon, cent mille cailloux pour seul troupeau.
  s += `<rect x="0" y="196" width="${W}" height="${H - 196}" fill="#101116"/>`;
  const cail = [];
  for (let i = 0; i < 58; i++) { const u = r(); cail.push([R(r() * W), R(200 + u * u * 134)]); }
  s += dots(cail, 1.6, '#1c1d24', 0.5);

  // Le mas, volets clos. Personne ne ferme les volets en partant pour une heure.
  s += `<g>
    <path d="M118 206l66 -14 66 14v6H118z" fill="#13141b"/>
    <path d="M140 209l44 -10M228 209l-44 -10" stroke="#0a0b10" stroke-width="1.2" fill="none" opacity="0.7"/>
    <rect x="124" y="212" width="120" height="46" fill="#0e0f15"/>
    <path d="M244 222l44 4v32h-44z" fill="#0c0d13"/>
    <rect x="226" y="194" width="9" height="14" fill="#13141b"/>
    <g fill="#15161d"><rect x="134" y="222" width="16" height="20"/><rect x="164" y="222" width="16" height="20"/><rect x="218" y="222" width="16" height="20"/></g>
    <path d="M142 222v20M172 222v20M226 222v20" stroke="#0a0b10" stroke-width="1.2" fill="none"/>
    <path d="M136 228h12M166 228h12M220 228h12M136 235h12M166 235h12M220 235h12" stroke="#0a0b10" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M192 258v-23q0 -5 6 -5t6 5v23z" fill="#06070b"/>
  </g>`;
  // Les cyprès du brise-vent, courbés dans le sens que le mistral a décidé.
  s += `<g fill="#090c09" transform="translate(102,258) rotate(5)">
    <path d="M0 0q-8 -32 3 -66q10 34 1 66z"/><path d="M-16 0q-6 -24 2 -50q8 26 2 50z" opacity="0.9"/>
  </g>`;

  // Des brebis sans berger, taches pâles qui dérivent sur la steppe.
  s += `<g fill="#4e5048" opacity="0.5"><ellipse cx="320" cy="262" rx="6" ry="3.4"/>
    <ellipse cx="338" cy="266" rx="5" ry="3"/><ellipse cx="306" cy="270" rx="5.4" ry="3.2"/>
    <ellipse cx="330" cy="274" rx="4.6" ry="2.8"/></g>
  <path d="M326 261h.1M343 265h.1M311 269h.1M334 273h.1" stroke="#16171d" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.7"/>`;
  // Ce que les patous laissent quand ils gardent contre tout ce qui marche.
  s += `<path d="M356 288q14 6 26 2l-5 7q-11 3 -18 -2z" fill="#22080a" opacity="0.5"/>`;

  // La voie ferrée, droite jusqu'au point de fuite. « Suivez la voie ferrée. »
  s += `<path d="M286 340L606 340L444 200L418 200Z" fill="#15161c"/>`;
  for (let k = 0; k < 10; k++) {
    const u = 0.97 * Math.pow(0.78, k), y = R(200 + 140 * u);
    s += `<path d="M${R(430 - 134 * u)} ${y}H${R(434 + 158 * u)}" stroke="#0c0d12" stroke-width="${R(Math.max(1.2, 5 * u))}" fill="none"/>`;
  }
  s += `<path d="M318 340L326 340L429.8 200L429 200Z" fill="#2b2d37" opacity="0.9"/>
    <path d="M566 340L574 340L432.8 200L432 200Z" fill="#2b2d37" opacity="0.9"/>`;
  // La croix de Saint-André d'un passage de drailles, penchée, peinture rongée.
  s += `<g transform="translate(618,316) rotate(6)" stroke-linecap="round" fill="none">
    <path d="M0 0v-46" stroke="#0d0e13" stroke-width="3"/>
    <path d="M-11 -52l22 12M11 -52l-22 12" stroke="#0d0e13" stroke-width="5"/>
    <path d="M-9 -51l18 10" stroke="#8a4a20" stroke-width="1.6" opacity="0.4"/>
  </g>`;

  // Les pylônes THT, en file indienne vers l'étang. Les câbles ne servent plus rien.
  const pylos = [[746, 338, 1.9], [664, 276, 1.05], [606, 238, 0.6], [568, 215, 0.36], [545, 204, 0.2], [530, 198.5, 0.11]];
  let cab = '';
  for (const [px, py, ps] of pylos) {
    s += `<g transform="translate(${px},${py}) scale(${ps})" stroke="#0b0c12" fill="none" stroke-linecap="round">
      <path d="M-15 0L-4 -84h8L15 0M0 -84v-10" stroke-width="3"/>
      <path d="M-12 -20h24M-9 -44h18M-25 -58h50M-18 -72h36" stroke-width="2.2"/>
      <path d="M-12 -20l21 -24M12 -20l-21 -24M-9 -44l16 -20M9 -44l-16 -20" stroke-width="1.3"/>
      <path d="M-22 -58v5M22 -58v5M-15 -72v5M15 -72v5" stroke-width="1.5"/>
    </g>`;
  }
  for (let i = 0; i + 1 < pylos.length; i++) {
    const [x1, y1, s1] = pylos[i], [x2, y2, s2] = pylos[i + 1];
    for (const sg of [-1, 1]) {
      const ax = R(x1 + sg * 25 * s1), ay = R(y1 - 58 * s1);
      const bx = R(x2 + sg * 25 * s2), by = R(y2 - 58 * s2);
      cab += `M${ax} ${ay}Q${R((ax + bx) / 2)} ${R((ay + by) / 2 + 10 * s1)} ${bx} ${by}`;
    }
  }
  s += `<path d="${cab}" stroke="#0b0c12" stroke-width="1.1" fill="none" opacity="0.7"/>`;
  // Un câble a rendu : il pend du premier pylône et traîne dans les cailloux.
  s += `<path d="M698.5 227.8q-26 64 -42 102" stroke="#0b0c12" stroke-width="1.2" fill="none" opacity="0.8"/>`;

  // La garrigue rase — thym, kermès, touffes peignées toutes dans le même sens.
  let touffe = '';
  for (let i = 0; i < 26; i++) {
    const u = r(), tx = R(r() * W), ty = R(208 + u * u * 126), ts = R(2 + u * 4);
    touffe += `M${tx} ${ty}q${ts} ${R(-ts * 1.6)} ${R(ts * 2)} 0`;
  }
  s += `<path d="${touffe}" stroke="#121a10" stroke-width="1.6" fill="none" opacity="0.8"/>`;

  // Les pins, couchés par le mistral — il souffle ici depuis avant les hommes.
  s += `<g transform="translate(58,330) rotate(16)">${pin(0, 0, 1.25, '#0a0d0a')}</g>`;
  s += `<g transform="translate(676,306) rotate(12)">${pin(0, 0, 0.8, '#0a0d0a')}</g>`;

  // Eux. Un qui suit les rails, lui aussi. Les autres dérivent comme la laine.
  s += zfig(412, 232, 0.34, '#0b0c10', a.nuit, 6);
  s += zfig(262, 246, 0.45, '#0a0b10', a.nuit, 12);
  s += zfig(648, 280, 0.66, '#0b0c10', a.nuit, -8);

  s += brume(a, 188, '#3a4150', 0.18);
  s += brume(a, 268, '#343a47', 0.1, 'b');
  s += neige(53, 30, 0.35);
  s += voileNuit(a);
  return s;
}
