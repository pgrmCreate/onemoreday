// Ambiance « Église Saint-Michel » — la nef unique, haute et noire, qui s'enfonce
// vers l'est. Intérieur : la seule vraie lumière tombe des trois lancettes de
// l'abside, teintée par les verres ; des cierges veillent encore près de l'autel,
// et sur les bancs en désordre, des silhouettes assises ne se retournent pas.
import { W, H, R, rng, lerpHex, halo, bougie, neige, voileNuit } from '../ambiance_lib.js';

// Une lancette en ogive : le ciel du moment au travers du vitrail, plombs par-dessus.
function lancette(a, x, yb, w, h, idx, teinte) {
  const th = lerpHex(a.haut, teinte, 0.5), tb = lerpHex(a.bas, teinte, 0.5);
  const ya = R(yb - h + w * 1.05);
  const d = `M${x} ${yb}V${ya}Q${x} ${R(ya - w * 0.95)} ${R(x + w / 2)} ${R(yb - h)}Q${x + w} ${R(ya - w * 0.95)} ${x + w} ${ya}V${yb}Z`;
  return `<defs><linearGradient id="${a.p}-vit${idx}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${th}"/><stop offset="1" stop-color="${tb}"/>
  </linearGradient></defs>
  <path d="${d}" fill="url(#${a.p}-vit${idx})"/>
  <path d="M${R(x + w / 2)} ${yb}V${R(yb - h + w * 0.2)}M${x} ${yb - 24}h${w}M${x} ${yb - 58}h${w}M${x} ${ya - 6}h${w}" stroke="#0a0b10" stroke-width="2.6" fill="none"/>
  <circle cx="${R(x + w / 2)}" cy="${R(ya - w * 0.42)}" r="${R(w * 0.2)}" fill="none" stroke="#0a0b10" stroke-width="2.4"/>
  <path d="${d}" fill="none" stroke="#08090d" stroke-width="5"/>
  <path d="${d}" fill="#04050a" opacity="${R((1 - a.lum) * 0.3)}"/>`;
}

export default function (a) {
  const r = rng(813);
  let s = '';

  // Le vaisseau : huit siècles de pierre, un jus de pénombre brune.
  s += `<defs><linearGradient id="${a.p}-nef" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0e0f14"/><stop offset="1" stop-color="#1b1814"/>
  </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${a.p}-nef)"/>`;

  // Les dalles, creusées par les processions.
  s += `<rect x="0" y="250" width="${W}" height="${H - 250}" fill="#161310"/>`;
  let dal = '';
  for (let i = 0; i < 34; i++) dal += `M${R(r() * W)} ${R(258 + r() * 72)}h8`;
  s += `<path d="${dal}" stroke="#0c0a08" stroke-width="1.8" fill="none" opacity="0.7"/>`;

  // L'abside en cul-de-four, et ses trois lancettes — la seule vraie lumière.
  s += `<path d="M560 250v-148q115 -54 230 0v148z" fill="#0b0c11" opacity="0.9"/>`;
  const lancettes = [[596, 40, 104, '#2a3f6e'], [658, 50, 136, '#7a2030'], [726, 40, 104, '#8a6a1d']];
  lancettes.forEach(([x, w, h, t], i) => {
    s += lancette(a, x, 206, w, h, i, t);
    // La couleur du verre s'écrase en flaque sur les dalles du chœur.
    s += halo(a, 'vl' + i, R(x + w / 2 - 14), 284, 62, 16, lerpHex(a.bas, t, 0.5), R(0.22 * Math.max(0.16, a.lum)));
  });
  // Le rai du grand vitrail rouge, oblique dans la poussière.
  s += `<path d="M662 204L592 302h140L716 204z" fill="${lerpHex(a.bas, '#7a2030', 0.5)}" opacity="${R(0.09 * a.lum)}"/>`;

  // Trois marches montent au chœur.
  s += `<path d="M566 252h226M576 263h216M588 274h204" stroke="#0a0a0e" stroke-width="2.2" fill="none" opacity="0.8"/>`;

  // L'autel nu — quelqu'un a emporté la croix — et le tabernacle qui bâille.
  s += `<rect x="694" y="180" width="22" height="20" fill="#120f0c"/>
    <path d="M696 198l14 -15" stroke="#0a0b10" stroke-width="2" fill="none"/>
    <rect x="642" y="208" width="96" height="7" fill="#1d1813"/>
    <rect x="648" y="215" width="84" height="37" fill="#15110d"/>`;

  // Les cierges encore allumés : la dernière veille.
  s += `<path d="M660 208v-16M716 208v-13" stroke="#241c12" stroke-width="3"/>
    <path d="M612 250v-30M602 250h20" stroke="#1d1812" stroke-width="3.4"/>`;
  s += bougie(a, 660, 190, 'c1') + bougie(a, 716, 193, 'c2') + bougie(a, 612, 218, 'c3');

  // La tribune, au-dessus du portail — personne n'y chante plus.
  s += `<path d="M0 78h128l-12 12H0z" fill="#0b0c11"/>
    <rect x="0" y="56" width="118" height="6" fill="#0b0c11"/>
    <path d="M16 78v-16M40 78v-16M64 78v-16M88 78v-16" stroke="#0b0c11" stroke-width="4"/>`;

  // Les piliers massifs et leurs arcs en plein cintre : l'église tient, elle.
  s += `<g fill="#0a0b10">
    <rect x="96" y="34" width="36" height="262"/><rect x="92" y="102" width="44" height="9"/>
    <rect x="336" y="34" width="36" height="262"/><rect x="332" y="102" width="44" height="9"/>
    <rect x="540" y="34" width="30" height="262"/><rect x="536" y="102" width="38" height="9"/>
  </g>
  <path d="M132 112q102 -88 204 0M372 112q84 -74 168 0" stroke="#0a0b10" stroke-width="22" fill="none"/>`;

  // Le bénitier, près du portail — l'eau y est noire à présent.
  s += `<g fill="#101116"><path d="M42 296l4 -28h10l4 28z"/><ellipse cx="51" cy="266" rx="13" ry="5"/></g>`;

  // Les bancs en désordre, et ceux qui sont restés assis, têtes baissées.
  for (let i = 0; i < 6; i++) {
    const bx = R(158 + i * 60 + r() * 12), by = R(270 + (i % 3) * 11);
    if (i === 3) {
      // Celui-ci a été renversé dans la panique.
      s += `<g transform="translate(${bx},${by}) rotate(${R(-80 + r() * 8)})" fill="#0b0c11">
        <rect x="0" y="-36" width="5" height="36"/><rect x="3" y="-15" width="46" height="5"/><rect x="44" y="-10" width="5" height="10"/></g>`;
      continue;
    }
    s += `<g transform="translate(${bx},${by}) rotate(${R(r() * 12 - 6)})" fill="#0b0c11">
      <rect x="0" y="-36" width="5" height="36"/><rect x="3" y="-15" width="46" height="5"/><rect x="44" y="-10" width="5" height="10"/></g>`;
    if (i === 2 || i === 4) s += `<g transform="translate(${bx + 18},${by - 13})" fill="#08090d">
      <circle cx="7" cy="-37" r="5.5"/><path d="M-6 0q-4 -20 4 -30q11 -5 12 6l-4 24z"/></g>`;
  }

  // Les feuilles paroissiales détrempées, collées aux dalles comme des feuilles mortes.
  s += `<path d="M66 296l12 -4 4 6 -12 4zM94 308l11 -3 3 5 -11 4z" fill="#23231f" opacity="0.7"/>`;
  // Une traînée sombre file vers le chœur. Quelqu'un a rampé jusqu'au bout.
  s += `<path d="M468 286q60 10 120 4l-6 8q-62 6 -110 -4z" fill="#22080a" opacity="0.42"/>`;

  // Poussière en suspension dans la lumière colorée de l'abside.
  if (a.lum > 0.3) s += neige(88, 14, R(0.1 * a.lum), 580, 780, 110, 240);

  // Les murs ont huit siècles d'épaisseur : la nef reste sombre, même à midi.
  s += voileNuit(a, 1.3);
  return s;
}
