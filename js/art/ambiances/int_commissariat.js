// Ambiance « Commissariat » — le hall d'accueil, avenue du Pays Catalan.
// Intérieur : la banque d'accueil sous sa vitre étoilée d'impacts, les affiches
// arrachées, les barrières couchées — et le couloir des cellules, au fond,
// qui avale ce qui reste de jour. Ouvert 24h/24, jusqu'au bout.
import { W, H, R, rng, fenetre, halo, dots, neige, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(4471);
  let s = '';

  // Les murs du hall : gris administratif mangé d'ombre.
  s += `<rect width="${W}" height="${H}" fill="#101116"/>`;
  // Le lino froid des services publics, quadrillé de joints sales.
  s += `<rect x="0" y="238" width="${W}" height="${H - 238}" fill="#131310"/>`;
  let carr = '';
  for (let i = 0; i < 7; i++) carr += `M0 ${R(248 + i * 14)}H${W}`;
  for (let i = 0; i < 12; i++) carr += `M${R(30 + i * 66)} 238L${R(-24 + i * 78)} ${H}`;
  s += `<path d="${carr}" stroke="#0b0b09" stroke-width="1.3" opacity="0.6" fill="none"/>`;
  s += `<path d="M0 238H${W}" stroke="#0a0a0e" stroke-width="3"/>`;

  // Fenêtres grillagées : le ciel du dehors, découpé en barreaux.
  s += fenetre(a, 44, 52, 110, 108, 'a');
  s += `<path d="M71 52v108M99 52v108M127 52v108" stroke="#0a0b10" stroke-width="3" fill="none"/>`;
  s += fenetre(a, 196, 58, 98, 100, 'b', true);
  s += `<path d="M221 58v100M245 58v100M269 58v100" stroke="#0a0b10" stroke-width="3" fill="none"/>`;
  // La lumière tombe en dalles pâles sur le lino.
  s += halo(a, 'jourA', 110, 258, 150, 46, a.bas, R(0.15 * Math.max(0.16, a.lum)));
  s += halo(a, 'jourB', 248, 262, 120, 40, a.bas, R(0.11 * Math.max(0.16, a.lum)));

  // Affiches réglementaires arrachées : il n'en reste que des lambeaux punaisés.
  s += `<path d="M330 54h60v30l-15 9 -10 -6 -13 10 -22 -5z" fill="#23222a" opacity="0.8"/>`;
  s += `<g transform="rotate(-13 410 66)"><path d="M410 66h44v52l-16 -9 -8 12 -20 -6z" fill="#201f27" opacity="0.75"/></g>`;
  s += dots([[330, 54], [390, 54], [410, 66], [452, 62]], 2.2, '#2e2d35', 0.8);
  // Le panneau d'accueil pend par un coin — plus personne n'accueille personne.
  s += `<path d="M474 46l-7 -12" stroke="#262a33" stroke-width="2" fill="none"/>
    <g transform="rotate(22 474 46)"><rect x="474" y="46" width="102" height="26" fill="#181a21"/>
    <path d="M482 54h86M482 63h58" stroke="#272b34" stroke-width="3" fill="none"/></g>`;

  // Le couloir des cellules : une bouche noire au fond du hall.
  s += `<rect x="600" y="72" width="108" height="166" fill="#08090d"/>`;
  s += `<rect x="612" y="84" width="84" height="154" fill="#05060a"/>`;
  s += `<rect x="628" y="100" width="52" height="138" fill="#030409"/>`;
  // Les premières portes renforcées, à peine devinées avant le noir total.
  s += `<path d="M616 112v96h12M692 112v96h-12" stroke="#15171e" stroke-width="2" fill="none" opacity="0.45"/>`;
  s += `<path d="M594 66h120M594 66v172M714 66v172" stroke="#1a1b22" stroke-width="5" fill="none"/>`;
  // Une traînée sombre sort du couloir : quelqu'un a été tiré vers le fond.
  s += `<path d="M626 238q-38 30 -96 44l12 6q60 -16 96 -46z" fill="#a31621" opacity="0.28"/>`;

  // La banque d'accueil : le comptoir qui a servi de dernier parapet.
  s += `<rect x="330" y="196" width="246" height="62" fill="#15161d"/>`;
  s += `<rect x="322" y="188" width="262" height="11" rx="2" fill="#1c1d25"/>`;
  s += `<path d="M352 216h58M352 230h42" stroke="#0d0e12" stroke-width="2" fill="none"/>`;
  // Impacts dans la façade — tirés vers la porte, tous.
  const pk = [];
  for (let i = 0; i < 7; i++) pk.push([R(346 + r() * 214), R(206 + r() * 42)]);
  s += dots(pk, 2.6, '#08080c', 0.9);
  // La vitre de protection, étoilée d'impacts : elle n'a protégé personne.
  s += `<rect x="340" y="124" width="226" height="66" fill="#171b22" opacity="0.5"/>
    <rect x="340" y="124" width="226" height="66" fill="none" stroke="#1f222b" stroke-width="3"/>
    <path d="M396 124v66M453 124v66M510 124v66" stroke="#1f222b" stroke-width="2" opacity="0.8"/>`;
  let imp = '';
  for (let k = 0; k < 3; k++) {
    const ix = R(372 + k * 64 + r() * 24), iy = R(138 + r() * 38);
    for (let j = 0; j < 7; j++) {
      const an = j * 0.9 + r() * 0.4, le = R(5 + r() * 8);
      imp += `M${ix} ${iy}l${R(Math.cos(an) * le)} ${R(Math.sin(an) * le)}`;
    }
  }
  s += `<path d="${imp}" stroke="#9aa1ad" stroke-width="1.1" fill="none" opacity="0.42"/>`;

  // Une barrière de police couchée : la file d'attente n'aura plus jamais lieu.
  s += `<g transform="translate(128,300) rotate(-7)" stroke="#181a20" fill="none" stroke-width="3.2" stroke-linecap="round">
    <path d="M0 0h148M0 -22h148M0 0v-22M148 0v-22"/>
    <path d="M21 0v-22M42 0v-22M63 0v-22M84 0v-22M105 0v-22M126 0v-22"/>
    <path d="M-5 6l11 -34M153 6l-11 -34"/></g>`;
  // La chicane de sacs de sable, replète et inutile, près de l'entrée.
  s += `<g fill="#1a1712"><rect x="-10" y="294" width="56" height="18" rx="9"/>
    <rect x="-16" y="310" width="68" height="22" rx="10"/>
    <rect x="4" y="278" width="52" height="18" rx="9" fill="#1d1a14"/></g>`;

  // Le bureau de faction et son gyrophare éteint — plus de bleu, plus d'ordre.
  s += `<rect x="648" y="252" width="128" height="12" fill="#191a20"/>
    <path d="M658 264v42M766 264v42M712 264v38" stroke="#15161c" stroke-width="5" fill="none"/>`;
  s += `<path d="M698 252v-7h38v7z" fill="#101117"/>
    <path d="M703 245q14 -23 28 0z" fill="#141821"/>
    <path d="M709 238q4 -8 9 -7" stroke="#2a3140" stroke-width="1.6" fill="none" opacity="0.7"/>`;

  // Procès-verbaux éparpillés, que plus personne ne classera.
  let pap = '';
  for (let i = 0; i < 7; i++) {
    const px = R(80 + r() * 430), py = R(268 + r() * 56), pw = R(10 + r() * 9);
    pap += `<path d="M${px} ${py}l${pw} -3l2 7l-${pw} 3z"/>`;
  }
  s += `<g fill="#23242a" opacity="0.5">${pap}</g>`;
  // Douilles de 9 mm sur le lino — l'or pâle de la dernière garde.
  const dl = [];
  for (let i = 0; i < 16; i++) dl.push([R(200 + r() * 340), R(270 + r() * 58)]);
  s += dots(dl, 2, '#c9a227', 0.38);

  // Poussière en suspension dans les rais des fenêtres.
  if (a.lum > 0.3) s += neige(17, 12, R(0.11 * a.lum), 50, 300, 70, 250);

  // Un hall sans courant reste sombre, même à midi.
  s += voileNuit(a, 1.3);
  return s;
}
