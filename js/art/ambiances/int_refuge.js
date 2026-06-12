// Ambiance « La salle commune » — l'ancienne salle des fêtes de Miramas-le-Vieux,
// devenue le cœur du Refuge. Intérieur : le seul lieu chaud du jeu — une cheminée
// qui brûle vraiment, des tables en tréteaux et leurs gamelles, des lits de camp
// au fond, des fanions qu'aucune fête n'a décrochés. Et des vivants, pas eux.
import { W, H, R, rng, halo, fenetre, bougie, neige, voileNuit } from '../ambiance_lib.js';

// Guirlande de fanions tendue entre deux piliers — la fête est restée accrochée.
const FANIONS = ['#2c2a33', '#5a2a2e', '#6e5a22', '#2a3a35'];
function guirlande(x1, x2, y, sag, n) {
  let s = `<path d="M${x1} ${y}Q${R((x1 + x2) / 2)} ${y + sag} ${x2} ${y}" stroke="#0b0a08" stroke-width="1.4" fill="none" opacity="0.8"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n, fx = R(x1 + (x2 - x1) * t), fy = R(y + 2 * sag * t * (1 - t));
    s += `<path d="M${R(fx - 5)} ${fy}h10l-5 12z" fill="${FANIONS[i % 4]}" opacity="0.7"/>`;
  }
  return s;
}

export default function (a) {
  const r = rng(112);
  let s = '';

  // Le grand volume voûté, dans un jus de pierre chaude.
  s += `<defs><linearGradient id="${a.p}-salle" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0e0f14"/><stop offset="1" stop-color="#1b1814"/>
  </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${a.p}-salle)"/>`;
  // Joints de pierre, par endroits — des murs d'un mètre d'épaisseur.
  let jts = '';
  for (let i = 0; i < 16; i++) jts += `M${R(r() * W)} ${R(56 + r() * 150)}h9`;
  s += `<path d="${jts}" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.4"/>`;

  // La voûte et ses piliers : la salle tient depuis des siècles, elle tiendra bien encore.
  s += `<path d="M70 122q165 -100 330 0M400 122q172 -100 345 0" stroke="#0a0b10" stroke-width="16" fill="none"/>
  <g fill="#0c0d12"><rect x="46" y="64" width="24" height="182"/><rect x="388" y="64" width="24" height="182"/><rect x="734" y="64" width="22" height="182"/></g>
  <path d="M42 116h32M384 116h32M730 116h30" stroke="#0c0d12" stroke-width="7"/>`;

  // Le parquet des bals, ciré par cent hivers de semelles.
  s += `<rect x="0" y="246" width="${W}" height="${H - 246}" fill="#16120d"/>`;
  let lat = '';
  for (let i = 0; i < 9; i++) lat += `M0 ${R(254 + i * 10)}H${W}`;
  s += `<path d="${lat}" stroke="#0d0a07" stroke-width="1.4" fill="none" opacity="0.7"/>`;

  // Le liège au mur : des dessins d'enfants — des soleils, des maisons.
  s += `<rect x="452" y="86" width="92" height="50" fill="#1f1a13"/>
    <g fill="#2e2b26"><rect x="458" y="92" width="22" height="26" transform="rotate(-3 469 105)"/><rect x="488" y="94" width="22" height="26"/><rect x="516" y="91" width="22" height="27" transform="rotate(4 527 104)"/></g>
    <path d="M465 100a5 5 0 1 0 8 0M492 112l7 -8 7 8zM521 112l6 -9 6 9v-4" stroke="#171411" stroke-width="1.6" fill="none"/>`;

  // Les couvertures pendues qui cloisonnent le dortoir, au fond.
  s += `<path d="M250 158L586 162" stroke="#0b0a08" stroke-width="1.6"/>
    <path d="M254 160q5 36 -2 60l50 3q6 -30 1 -61z" fill="#19161c"/>
    <path d="M536 162q4 38 -2 58l48 3q5 -28 1 -59z" fill="#1c1820"/>`;

  // Les lits de camp alignés contre le mur — des respirations vivantes, la nuit.
  for (let i = 0; i < 4; i++) {
    const cx = 262 + i * 82;
    s += `<g transform="translate(${cx},236)" fill="#171310">
      <path d="M8 10l12 -18M20 10l-12 -18M52 10l12 -18M64 10l-12 -18" stroke="#12100c" stroke-width="3" fill="none"/>
      <rect x="0" y="-10" width="70" height="7"/>
      <path d="M5 -10q18 -9 36 -5q18 2 25 5z" fill="#201c16"/>
    </g>`;
    // Quelqu'un dort, en plein jour — il rentre de garde, on marche doucement.
    if (i === 1) s += `<circle cx="${cx + 12}" cy="222" r="5" fill="#0c0d11"/>`;
  }

  // La fenêtre à croisillons : le ciel du moment, la neige posée sur l'appui.
  s += fenetre(a, 600, 66, 118, 128, 'a');
  s += `<path d="M639 66v128M679 66v128M600 109h118M600 151h118" stroke="#08090d" stroke-width="2"/>
    <path d="M602 196h114" stroke="#c8cdd8" stroke-width="3" opacity="0.16"/>`;
  s += halo(a, 'jour', 659, 258, 150, 46, a.bas, R(0.15 * Math.max(0.16, a.lum)));

  // Les fanions, tendus de pilier en pilier au travers de la salle.
  s += guirlande(76, 396, 126, 36, 8) + guirlande(404, 744, 126, 36, 9);

  // LA CHEMINÉE. Un vrai feu, nourri jour et nuit — le centre du monde, ici.
  s += `<path d="M96 150L116 60h66l22 90z" fill="#14110e"/>
    <rect x="84" y="146" width="132" height="10" fill="#201913"/>
    <rect x="92" y="156" width="16" height="90" fill="#16120e"/><rect x="192" y="156" width="16" height="90" fill="#16120e"/>
    <rect x="108" y="156" width="84" height="90" fill="#060608"/>`;
  // Les bûches, la marmite pendue à la crémaillère, la vapeur qui sent la soupe.
  s += `<path d="M118 242l58 -8M122 234l52 10" stroke="#0d0a07" stroke-width="6" stroke-linecap="round"/>
    <path d="M150 156v32" stroke="#0b0a08" stroke-width="2.4"/>
    <path d="M138 196q12 -11 24 0" stroke="#0b0a08" stroke-width="2.2" fill="none"/>
    <path d="M135 196h30q2 13 -15 15q-17 -2 -15 -15z" fill="#0e0d10"/>
    <path d="M150 188q-6 -9 1 -17q7 -8 1 -15" stroke="#3c3a38" stroke-width="1.8" fill="none" opacity="0.35"/>`;
  // Les flammes, et leur halo généreux : la seule chaleur franche du jeu.
  s += `<path d="M128 243q-5 -18 9 -30q-1 14 8 16q-3 -22 12 -31q-2 16 8 20q4 -10 2 -18q10 12 7 30q6 -4 6 -12q6 16 -8 25z" fill="#c9882a" opacity="0.88"/>
    <path d="M140 243q-2 -12 6 -18q0 10 6 12q0 -12 9 -16q-3 12 4 16q2 -6 1 -9q5 8 -2 15z" fill="#e0b04a" opacity="0.9"/>`;
  s += halo(a, 'feu', 150, 224, 195, 140, '#c9882a', 0.5);
  s += halo(a, 'coeur', 150, 234, 95, 68, '#e0b04a', 0.5);
  s += halo(a, 'feusol', 150, 290, 230, 40, '#c9882a', 0.28);
  // Braises sur la pierre du foyer.
  let br = '';
  for (let i = 0; i < 7; i++) br += `M${R(118 + r() * 64)} ${R(240 + r() * 7)}h.1`;
  s += `<path d="${br}" stroke="#e0b04a" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.55"/>`;
  // La réserve de bûches, et la bougie qui veille sur le manteau.
  s += `<g fill="#13100c"><ellipse cx="52" cy="296" rx="9" ry="8"/><ellipse cx="68" cy="300" rx="9" ry="8"/><ellipse cx="60" cy="286" rx="8" ry="7"/></g>
    <path d="M52 296h.1M68 300h.1M60 286h.1" stroke="#0c0a07" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  s += bougie(a, 206, 140, 'bgm');

  // Les provisions en caisses, recomptées chaque soir à la craie. On ne vole pas ici.
  s += `<g fill="#171310"><rect x="726" y="212" width="64" height="34"/><rect x="734" y="186" width="48" height="26"/></g>
    <path d="M726 229h64M734 199h48M742 186v26M758 212l24 34" stroke="#0d0a08" stroke-width="2" fill="none"/>
    <path d="M744 178v8h6v-8M764 180v6h6v-6" stroke="#14161a" stroke-width="4" fill="none"/>
    <path d="M743 178h8M763 180h8" stroke="#6e5a22" stroke-width="2"/>`;

  // La longue table en tréteaux, son banc, ses gamelles qui fument encore.
  s += `<rect x="300" y="266" width="220" height="7" fill="#1e1812"/>
    <path d="M320 273l-10 26M320 273l10 26M498 273l-10 26M498 273l10 26" stroke="#15110d" stroke-width="4"/>
    <rect x="316" y="292" width="188" height="5" fill="#19140f"/>
    <path d="M330 297v12M488 297v12" stroke="#12100c" stroke-width="4"/>`;
  s += `<g fill="#1d2126"><ellipse cx="342" cy="264" rx="9" ry="3.5"/><ellipse cx="384" cy="263" rx="9" ry="3.5"/><ellipse cx="436" cy="264" rx="9" ry="3.5"/><ellipse cx="472" cy="263" rx="9" ry="3.5"/></g>
    <path d="M384 259q-4 -7 2 -13" stroke="#3c3a38" stroke-width="1.6" fill="none" opacity="0.3"/>`;
  // Eux, ce sont des vivants : têtes penchées sur la soupe, coudes sur la table.
  s += `<g fill="#0b0c10"><circle cx="368" cy="240" r="6.5"/><path d="M356 266q0 -18 12 -20q12 2 12 20z"/>
    <circle cx="452" cy="241" r="6"/><path d="M441 266q0 -17 11 -19q11 2 11 19z"/>
    <circle cx="412" cy="247" r="5"/><path d="M403 266q0 -13 9 -15q9 2 9 15z"/></g>`;
  // Celui-là ne mange pas : il tend les mains vers le feu, simplement.
  s += `<g fill="#0b0c10"><circle cx="240" cy="246" r="6"/><path d="M232 288q-4 -22 6 -34q12 -4 12 8l-4 26z"/>
    <path d="M238 262q-12 2 -18 10" stroke="#0b0c10" stroke-width="4" fill="none"/></g>
    <rect x="228" y="288" width="26" height="5" fill="#15110d"/><path d="M232 293v10M250 293v10" stroke="#12100c" stroke-width="3.4"/>`;

  // Deuxième tablée, plus près des portes — il y a de la place pour tout le monde.
  s += `<rect x="348" y="304" width="252" height="6" fill="#1c1610"/>
    <path d="M372 310l-8 22M372 310l8 22M576 310l-8 22M576 310l8 22" stroke="#15110d" stroke-width="4"/>
    <g fill="#1d2126"><ellipse cx="420" cy="302" rx="9" ry="3.5"/><ellipse cx="500" cy="301" rx="9" ry="3.5"/><ellipse cx="540" cy="302" rx="9" ry="3.5"/></g>`;
  // Une bougie sur la table quand le jour baisse.
  if (a.lum < 0.6) s += bougie(a, 500, 262, 'bgt');

  // Poussière en suspension dans le jour de la fenêtre.
  if (a.lum > 0.3) s += neige(54, 12, R(0.1 * a.lum), 600, 720, 90, 240);

  // Le feu repousse la nuit : la salle commune ne dort jamais tout à fait.
  s += voileNuit(a, 0.8);
  return s;
}
