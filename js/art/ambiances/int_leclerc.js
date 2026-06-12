// Ambiance « Hyper E.Leclerc — Les Viougues » — le garde-manger de 44 000 personnes.
// Intérieur caverneux : le jour ne tombe que des sheds du plafond, en lames,
// et les allées filent vers un noir que rien n'entame. Gondoles pillées,
// caddies tordus en barricade, panneaux pendus, la montagne de palettes du fond.
import { W, H, R, rng, fenetre, halo, zfig, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(44000);
  let s = '';

  // Le hangar de vente : un seul volume, sans néons, sans musique d'ambiance.
  s += `<rect width="${W}" height="${H}" fill="#0e0f14"/>`;

  // ---- Les sheds : entre les poutres, des bandes de ciel — la seule lumière. ----
  s += `<rect width="${W}" height="76" fill="#08090d"/>`;
  s += fenetre(a, 58, 12, 120, 26, 's1');
  s += fenetre(a, 248, 12, 120, 26, 's2', true);
  s += fenetre(a, 438, 12, 120, 26, 's3');
  s += fenetre(a, 628, 12, 120, 26, 's4');
  // Le profil en dents de scie des fermes, et la rive basse du plafond.
  s += `<path d="M26 76L58 6M216 76L248 6M406 76L438 6M596 76L628 6M780 76L800 30" stroke="#06070b" stroke-width="7" fill="none"/>`;
  s += `<path d="M0 76H${W}" stroke="#06070b" stroke-width="5"/>`;
  // Rampes de néons mortes, pendues à leurs chaînes — l'une ne tient plus que d'un côté.
  s += `<path d="M120 76v16M196 76v16M520 76v14M600 76v6" stroke="#15161d" stroke-width="1.6" fill="none"/>`;
  s += `<rect x="112" y="92" width="92" height="5" fill="#101117"/>`;
  s += `<g transform="rotate(-9 520 90)"><rect x="512" y="90" width="92" height="5" fill="#101117"/></g>`;

  // Le sol : carrelage industriel, joints en fuite vers le fond du magasin.
  s += `<rect x="0" y="242" width="${W}" height="${H - 242}" fill="#111218"/>`;
  let joints = '';
  for (let i = 0; i < 9; i++) joints += `M${R(i * 100 - 40)} ${H}L${R(330 + i * 17)} 242`;
  s += `<path d="${joints}" stroke="#0b0c10" stroke-width="1.4" fill="none" opacity="0.7"/>`;

  // Le bout de l'allée centrale : un noir total, qui ne rend pas les échos.
  s += `<rect x="338" y="120" width="130" height="124" fill="#05060a"/>`;
  s += `<path d="M312 ${H}L370 242h66L520 ${H}z" fill="#15161c" opacity="0.8"/>`;

  // ---- Les gondoles, en perspective : pillées le premier soir, jamais redressées. ----
  s += `<g fill="#0d0e13">
    <path d="M60 118h128v124H60z"/><path d="M226 154h84v88h-84z"/><path d="M330 182h44v60h-44z"/>
    <path d="M618 118h128v124H618z"/><path d="M496 154h84v88h-84z"/><path d="M432 182h44v60h-44z"/>
  </g>`;
  s += `<path d="M60 150h128M60 184h128M60 216h128M618 150h128M618 184h128M618 216h128M226 180h84M226 208h84M496 180h84M496 208h84M330 204h44M432 204h44" stroke="#08090d" stroke-width="3" fill="none"/>`;
  // Ce qui reste sur les étagères : des cartons que la panique n'a pas jugés bons.
  let boites = '';
  for (let i = 0; i < 10; i++) {
    const bx = i % 2 === 0 ? R(66 + r() * 100) : R(624 + r() * 100);
    const sy = [150, 184, 216][i % 3];
    const bw = R(8 + r() * 13), bh = R(6 + r() * 7);
    boites += `<rect x="${bx}" y="${R(sy - bh)}" width="${bw}" height="${bh}"/>`;
  }
  s += `<g fill="#101117">${boites}</g>`;
  // Une étagère arrachée gît devant le rayon frais, ses conserves éparpillées.
  s += `<g transform="translate(92,254) rotate(8)"><rect width="86" height="9" fill="#0d0e13"/><path d="M8 0v9M44 0v9M78 0v9" stroke="#08090d" stroke-width="2" fill="none"/></g>`;

  // Les panneaux d'allée, pendus de travers — des directions pour plus personne.
  s += `<path d="M250 76v19M306 76v31" stroke="#1a1b22" stroke-width="1.6" fill="none"/>`;
  s += `<g transform="translate(244,95) rotate(10)"><rect width="68" height="20" rx="3" fill="#14151b"/><rect width="68" height="5" rx="2" fill="#8a4a20" opacity="0.4"/></g>`;
  // Celui-là ne tient plus que par un fil, à la verticale ou presque.
  s += `<path d="M560 76v20M608 76v7" stroke="#1a1b22" stroke-width="1.6" fill="none"/>`;
  s += `<g transform="translate(560,96) rotate(55)"><rect x="-3" width="60" height="18" rx="3" fill="#14151b"/><rect x="-3" width="60" height="5" rx="2" fill="#8a4a20" opacity="0.35"/></g>`;
  s += `<g transform="translate(384,108) rotate(-6)"><rect width="28" height="9" rx="2" fill="#111217"/></g>`;

  // Les fûts de lumière des sheds : du jour en colonnes, qui meurt avant le sol.
  if (a.lum > 0.18) {
    const op = R(0.07 * a.lum);
    s += `<path d="M252 40L364 40L420 246L296 246Z" fill="${a.bas}" opacity="${op}"/>`;
    s += `<path d="M442 40L554 40L520 246L408 246Z" fill="${a.bas}" opacity="${R(op * 0.7)}"/>`;
    s += halo(a, 'jour', 408, 252, 200, 48, a.bas, R(0.12 * a.lum));
  }

  // Au seuil du noir, quelque chose attend que tes yeux s'habituent.
  s += zfig(396, 220, 0.42, '#08090d', true, -4);

  // La longue trace brune, tirée comme un trait de règle, depuis le fond.
  s += `<path d="M402 244q-12 40 -34 78l10 4q22 -40 34 -80z" fill="#22080a" opacity="0.45"/>`;
  // Des conserves ont roulé jusqu'au milieu de l'allée. Personne ne court les ramasser.
  let cans = '';
  for (let i = 0; i < 6; i++) cans += `<circle cx="${R(330 + r() * 200)}" cy="${R(258 + r() * 64)}" r="${R(3 + r() * 2)}"/>`;
  s += `<g fill="#14151b">${cans}</g>`;
  // Prospectus jonchés — des prix bas pour toujours, disaient-ils.
  let pros = '';
  for (let i = 0; i < 14; i++) pros += `M${R(40 + r() * 710)} ${R(250 + r() * 82)}h${R(5 + r() * 6)}`;
  s += `<path d="${pros}" stroke="#1f2027" stroke-width="2.6" fill="none" opacity="0.6"/>`;
  // Une chaussure d'enfant, seule au milieu de l'allée.
  s += `<path d="M430 300q8 -4 12 0l6 3q-2 4 -9 4h-9z" fill="#16161d"/>`;

  // La barricade de caddies des derniers clients, tordue, soudée par la rouille.
  const caddie = (x, y, rot, t) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="${t}" fill="none" stroke-width="2.4">
    <path d="M0 0l7 -24h46l9 24z"/><path d="M14 -24v24M28 -24v24M42 -24v24"/><path d="M62 -24l11 -8"/>
    <circle cx="10" cy="7" r="4.5" fill="#0a0b10" stroke="none"/><circle cx="50" cy="7" r="4.5" fill="#0a0b10" stroke="none"/>
  </g>`;
  s += caddie(120, 296, -6, '#15161d');
  s += caddie(168, 306, 10, '#14151b');
  s += caddie(214, 264, 142, '#101117'); // celui-là a fini sur le dos

  // La montagne de palettes, filmées, intactes — de quoi tenir un hiver.
  const palette = (x, y) => `<rect x="${x}" y="${y}" width="48" height="13" fill="#161209"/><path d="M${x + 15} ${y}v13M${x + 33} ${y}v13M${x} ${y + 8}h48" stroke="#06070b" stroke-width="2" fill="none"/>`;
  s += palette(642, 322) + palette(692, 322) + palette(742, 322);
  s += palette(666, 308) + palette(716, 308) + palette(690, 294);
  s += `<g transform="rotate(-13 624 330)">${palette(600, 318)}</g>`;
  // Le reflet du film plastique, à peine — la seule chose neuve du magasin.
  s += `<path d="M676 292q34 -8 78 6" stroke="#3a4150" stroke-width="1.4" fill="none" opacity="0.22"/>`;

  // Poussière en suspension dans les fûts de lumière.
  if (a.lum > 0.3) s += neige(91, 14, R(0.10 * a.lum), 250, 560, 60, 240);

  // Un hangar à sheds reste une caverne, même à midi.
  s += voileNuit(a, 1.35);
  return s;
}
