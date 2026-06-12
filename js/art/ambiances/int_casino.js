// Ambiance « Petit Casino » — la supérette de la rue Kennedy, pillée au jour 19.
// Intérieur : la vitrine étoilée laisse entrer le ciel de la rue, le reste de la
// boutique s'enfonce dans une pénombre grasse. Rayonnages en dominos, caddie
// couché, tiroir-caisse béant — la panique a tout raflé, mais la panique fouille mal.
import { W, H, R, rng, dots, fenetre, halo, neige, voileNuit } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(419);
  let s = '';

  // Les murs de la boutique — un jus de pénombre qui sent le lait tourné.
  s += `<rect width="${W}" height="${H}" fill="#100f13"/>`;
  // Au plafond, la rampe de néons morte ; un tube pend au bout de son fil.
  s += `<path d="M420 0v16M560 0v12" stroke="#15161b" stroke-width="3"/>
    <rect x="384" y="16" width="84" height="7" fill="#15161b"/>
    <path d="M560 12l34 28" stroke="#1a1c22" stroke-width="4" stroke-linecap="round"/>`;

  // La vitrine sur la rue Kennedy : deux panneaux et la porte vitrée — seule lumière.
  s += `<rect x="24" y="48" width="296" height="190" fill="#0d0c10"/>`;
  s += fenetre(a, 36, 58, 100, 152, 'va');
  s += fenetre(a, 144, 58, 100, 152, 'vb');
  s += fenetre(a, 254, 70, 56, 168, 'po');
  // Au travers : les façades d'en face, découpées dans le ciel du moment.
  s += `<path d="M36 134l22 -10 24 6 26 -14 28 12v82h-100z" fill="#0a0b10" opacity="0.9"/>
    <path d="M144 142l30 -12 26 8 24 -10 20 8v74h-100z" fill="#0a0b10" opacity="0.9"/>
    <path d="M196 206v-50q0 -8 9 -8" stroke="#0a0b10" stroke-width="2.5" fill="none"/>
    <path d="M254 152l26 -10 30 12v84h-56z" fill="#0a0b10" opacity="0.9"/>`;
  // L'impact qui a étoilé le panneau de gauche — quelqu'un est entré sans la clé.
  s += `<g stroke="#0a0b10" stroke-width="1.5" fill="none" opacity="0.9">
    <path d="M90 118l-26 -18M90 118l24 -22M90 118l30 10M90 118l-20 26M90 118l8 32M90 118l-32 4M90 118l16 -34"/>
    <circle cx="90" cy="118" r="5"/><circle cx="90" cy="118" r="11" opacity="0.55"/>
  </g><path d="M90 118l10 -3l-4 9z" fill="#08090d" opacity="0.7"/>`;
  // L'allège sous la vitrine, et le carrelage de la surface de vente.
  s += `<rect x="24" y="210" width="222" height="28" fill="#12110f"/>`;
  s += `<rect x="0" y="238" width="${W}" height="${H - 238}" fill="#131210"/>`;
  let dal = '';
  for (let i = 0; i < 7; i++) dal += `M0 ${R(246 + i * 13)}H${W}`;
  for (let i = 0; i < 22; i++) dal += `M${R(r() * W)} ${R(246 + r() * 78)}v12`;
  s += `<path d="${dal}" stroke="#0c0b09" stroke-width="1.3" opacity="0.65" fill="none"/>`;
  // La lumière de la rue s'écrase en flaque sur le carrelage.
  s += halo(a, 'jour', 180, 256, 230, 58, a.bas, R(0.16 * Math.max(0.18, a.lum)));

  // Au fond : une gondole encore debout, presque vide — la panique a mangé le reste.
  s += `<rect x="470" y="158" width="86" height="80" fill="#101117"/>
    <path d="M470 182h86M470 206h86" stroke="#07080c" stroke-width="2.4"/>
    <path d="M484 176v6M512 200v6M538 176v6" stroke="#16161d" stroke-width="6"/>`;
  // La porte battante « PRIVÉ », son hublot aveugle vers l'arrière-boutique.
  s += `<rect x="600" y="126" width="54" height="112" fill="#14110d"/>
    <rect x="606" y="132" width="42" height="100" fill="#0f0d0a"/>
    <circle cx="627" cy="158" r="8" fill="#0a0b10"/>`;
  // Le rayon frais : trois armoires réfrigérées mortes, vitres voilées de gris.
  s += `<rect x="690" y="92" width="104" height="146" fill="#121318"/>
    <rect x="698" y="100" width="26" height="128" fill="#161a1e"/>
    <rect x="730" y="100" width="26" height="128" fill="#161a1e"/>
    <rect x="762" y="100" width="26" height="128" fill="#161a1e"/>
    <rect x="698" y="100" width="90" height="128" fill="#3a4150" opacity="0.12"/>
    <path d="M722 110v40M754 110v40M786 110v40" stroke="#07080c" stroke-width="2.4"/>`;
  // Du riz répandu près de l'épicerie du fond — trié grain par grain par les rats.
  const riz = [];
  for (let i = 0; i < 26; i++) riz.push([R(560 + r() * 150), R(244 + r() * 34)]);
  s += dots(riz, 1.2, '#5a544a', 0.35);

  // La caisse : le comptoir, et le tiroir qui pend, plein de billets sans valeur.
  s += `<rect x="322" y="208" width="140" height="8" fill="#1a1712"/>
    <rect x="326" y="216" width="132" height="52" fill="#14120e"/>
    <path d="M336 228h112M336 250h112" stroke="#0e0c09" stroke-width="2"/>
    <rect x="354" y="186" width="46" height="24" rx="2" fill="#15171c"/>
    <path d="M392 186l8 -14" stroke="#15171c" stroke-width="2.4"/>
    <rect x="392" y="166" width="20" height="12" fill="#0c0d11"/>
    <path d="M352 210l44 6l-3 10l-44 -7z" fill="#101218"/>
    <path d="M362 216l10 2M378 219l9 1" stroke="#c9a227" stroke-width="2" opacity="0.45"/>`;

  // Les rayonnages, couchés en dominos — le dernier s'est retenu au mur.
  const dom = [[506, -68], [574, -56], [642, -44], [710, -25]];
  for (const [bx, ang] of dom) {
    s += `<g transform="translate(${bx},284) rotate(${ang})">
      <rect x="-8" y="-108" width="16" height="108" fill="#101117"/>
      <path d="M-8 -82h16M-8 -54h16M-8 -27h16" stroke="#07080c" stroke-width="2.2"/>
    </g>`;
  }
  // Bocaux brisés au pied des dominos : le sol scintille à peine, poisseux.
  const verre = [];
  for (let i = 0; i < 16; i++) verre.push([R(440 + r() * 290), R(282 + r() * 36)]);
  s += dots(verre, 1.3, '#3a4150', 0.5);
  // Une traînée sombre part des rayons — quelqu'un n'a pas couru assez vite.
  s += `<path d="M512 300q32 8 66 3l-6 7q-32 4 -54 -3z" fill="#22080a" opacity="0.45"/>`;

  // Conserves éparses : debout, couchées, roulées jusque sous la caisse.
  let cans = '';
  for (let i = 0; i < 9; i++) {
    const cx = R(300 + r() * 390), cy = R(256 + r() * 58);
    if (i % 3) cans += `<rect x="${cx}" y="${R(cy - 9)}" width="7" height="9" rx="1"/>`;
    else cans += `<circle cx="${cx}" cy="${R(cy - 4)}" r="4.5"/>`;
  }
  s += `<g fill="#13151a">${cans}</g>`;

  // Le caddie couché en travers de l'allée, roues en l'air, panier grillagé.
  s += `<g stroke="#23252e" stroke-width="1.2" fill="#0c0d12">
    <path d="M340 318l64 -6l-4 -30l-50 4z"/>
    <path d="M354 317l-3 -28M370 315l-3 -28M386 314l-3 -29M346 300l56 -5" fill="none" opacity="0.8"/>
  </g>
  <path d="M404 312l26 -9M400 286l25 -8" stroke="#1c1e26" stroke-width="3"/>
  <circle cx="434" cy="301" r="5" fill="#08080b"/><circle cx="429" cy="276" r="5" fill="#08080b"/>
  <path d="M340 316l-17 5" stroke="#1c1e26" stroke-width="3.4" stroke-linecap="round"/>`;
  // Le tourniquet à cartes postales, fauché dans la fuite, couché devant la porte.
  s += `<ellipse cx="254" cy="309" rx="7" ry="3" fill="#15161b"/>
    <path d="M254 307l72 -10" stroke="#1b1d24" stroke-width="3"/>
    <g fill="#1f2128"><rect x="272" y="294" width="7" height="9"/>
    <rect x="294" y="291" width="7" height="9"/><rect x="312" y="298" width="7" height="9"/></g>`;

  // Poussière en suspension dans la lumière de la vitrine.
  if (a.lum > 0.3) s += neige(91, 12, R(0.12 * a.lum), 50, 320, 70, 240);

  // Loin des vitrines, la boutique reste sombre, même à midi.
  s += voileNuit(a, 1.3);
  return s;
}
