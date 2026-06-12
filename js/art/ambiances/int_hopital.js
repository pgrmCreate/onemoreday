// Ambiance « Hôpital du Pays Salonais » — le couloir des urgences, là où tout
// a commencé pour Salon. Intérieur : les fenêtres hautes laissent tomber le ciel,
// un néon pendu grésille en vert blafard, et les traînées au sol vont toutes
// vers les portes battantes. Personne ne les a laissées en sortant.
import { W, H, R, rng, fenetre, halo, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(346); // 346 lits, aucun de libre
  let s = '';

  // Les murs froids du service, mangés de pénombre. Le plafond au-dessus.
  s += `<rect width="${W}" height="${H}" fill="#0f1116"/>`;
  s += `<rect width="${W}" height="14" fill="#0a0b0f"/>`;
  // Une dalle de faux plafond pend, décrochée depuis le premier soir.
  s += `<path d="M520 14h30l-9 30z" fill="#0d0e12"/>`;

  // Le lino, et ses dalles qui se décollent par plaques.
  s += `<rect x="0" y="246" width="${W}" height="${H - 246}" fill="#13151a"/>`;
  let dal = '';
  for (let i = 0; i < 26; i++) dal += `M${R(r() * W)} ${R(254 + r() * 78)}h${R(12 + r() * 12)}`;
  s += `<path d="${dal}" stroke="#0c0d11" stroke-width="1.6" fill="none" opacity="0.7"/>`;
  // Les lignes de guidage au sol — suivez la verte. Elles mènent toutes aux portes.
  s += `<path d="M0 302q340 -14 660 -42" stroke="#24402c" stroke-width="4" fill="none" opacity="0.4"/>
    <path d="M0 312q340 -12 668 -38" stroke="#4a1d20" stroke-width="3" fill="none" opacity="0.28"/>`;

  // Fenêtres hautes : trois pans de ciel hors d'atteinte.
  s += fenetre(a, 58, 30, 88, 54, 'a');
  s += fenetre(a, 184, 30, 88, 54, 'b', true);
  s += fenetre(a, 310, 30, 88, 54, 'c');
  // Leur lumière tombe en flaques pâles sur le lino.
  const lj = R(0.13 * Math.max(0.15, a.lum));
  s += halo(a, 'j1', 120, 262, 110, 26, a.bas, lj) + halo(a, 'j2', 356, 264, 110, 26, a.bas, lj);

  // La bande de couleur du service à hauteur d'épaule, et la plinthe.
  s += `<path d="M0 198H${W}" stroke="#1d2a20" stroke-width="7" opacity="0.5"/>
    <path d="M0 243H${W}" stroke="#0a0b0f" stroke-width="5"/>`;

  // Panneaux muraux : une flèche qui n'indique plus rien, la croix d'un poste de soins.
  s += `<rect x="486" y="118" width="70" height="22" rx="3" fill="#171b21"/>
    <path d="M498 129h36m-8 -6l9 6 -9 6" stroke="#2c3a33" stroke-width="2.6" fill="none"/>
    <rect x="576" y="104" width="30" height="30" rx="3" fill="#161c20"/>
    <path d="M591 111v16M583 119h16" stroke="#39554a" stroke-width="5.5"/>`;

  // Les portes battantes du fond, hublots ronds sur une gorge d'ombre.
  s += `<rect x="630" y="92" width="132" height="154" fill="#0a0b10"/>
    <rect x="638" y="100" width="54" height="146" fill="#191c21"/>
    <rect x="702" y="100" width="52" height="146" fill="#16191e"/>
    <circle cx="665" cy="142" r="13" fill="#05060a" stroke="#0b0d12" stroke-width="3"/>
    <ellipse cx="728" cy="142" rx="11" ry="13" fill="#05060a" stroke="#0b0d12" stroke-width="3"/>
    <path d="M652 216h26M712 216h24" stroke="#23262c" stroke-width="4"/>`;
  // Derrière le plexiglas rayé, la nuit, quelque chose regarde le couloir.
  if (a.nuit) s += `<path d="M661 141h.1M669 142h.1" stroke="#d6303e" stroke-width="2.6" opacity="0.8" fill="none"/>`;

  // Les traînées. Elles partent des box et finissent toutes sous les battants.
  s += `<path d="M240 298q210 -18 400 -44l52 -6l4 10l-56 8q-190 28 -396 40z" fill="#1c090c" opacity="0.5"/>
    <path d="M520 272q80 -10 158 -24" stroke="#22080a" stroke-width="7" fill="none" opacity="0.45"/>
    <path d="M556 284q70 -10 136 -24" stroke="#22080a" stroke-width="4" fill="none" opacity="0.4"/>`;

  // Le rail des box, ses anneaux orphelins, les rideaux à moitié arrachés.
  s += `<path d="M36 100h344" stroke="#0b0c10" stroke-width="3"/>`;
  let ann = '';
  for (let i = 0; i < 9; i++) ann += `<circle cx="${R(48 + i * 38 + r() * 8)}" cy="104" r="2.4"/>`;
  s += `<g fill="none" stroke="#0b0c10" stroke-width="1.6">${ann}</g>`;
  s += `<path d="M62 104q-8 68 4 134l26 -2q6 -66 -4 -130z" fill="#151a1c"/>
    <path d="M150 104h56q-6 38 -30 62q-20 -26 -26 -62z" fill="#141a1c"/>
    <path d="M236 230q34 -10 60 2q-10 10 -34 8q-22 0 -26 -10z" fill="#13181a"/>`;

  // Le néon pendu — un câble a lâché, l'autre grésille encore, vert et blafard.
  const gres = Math.floor((a.heure || 0) * 7) % 3 === 0 ? 0.1 : 0.28;
  s += `<path d="M414 0v12l-3 5M474 0v18" stroke="#0a0b10" stroke-width="2" fill="none"/>`;
  s += halo(a, 'neon', 439, 35, 120, 56, '#8fc9a0', gres);
  s += `<path d="M404 52L474 18" stroke="#cfe6cf" stroke-width="5" stroke-linecap="round" opacity="${R(0.4 + gres)}"/>
    <path d="M404 52l-7 3M474 18l7 -3" stroke="#15171c" stroke-width="6" stroke-linecap="round"/>`;
  s += halo(a, 'neonsol', 436, 258, 150, 22, '#6f9a7c', R(gres * 0.4));

  // Les brancards en travers du couloir, garés en épi pour personne.
  const brancard = (x, y, rot, tache) => `<g transform="translate(${x},${y}) rotate(${rot})">
    <path d="M8 -36l22 36M30 -36l-22 36M86 -36l22 36M108 -36l-22 36" stroke="#0e0f14" stroke-width="3.4" fill="none"/>
    <circle cx="10" cy="1" r="5" fill="#08080b"/><circle cx="30" cy="1" r="5" fill="#08080b"/>
    <circle cx="88" cy="1" r="5" fill="#08080b"/><circle cx="106" cy="1" r="5" fill="#08080b"/>
    <rect x="0" y="-51" width="116" height="15" rx="5" fill="#1b1e23"/>
    <path d="M8 -51q50 -9 102 -3l-2 6q-50 -5 -98 0z" fill="#23262b"/>
    ${tache ? `<ellipse cx="24" cy="-49" rx="11" ry="4" fill="#a31621" opacity="0.32"/>` : ''}
  </g>`;
  s += brancard(84, 318, -4, false);
  s += brancard(452, 322, 9, true);   // les draps tachés à hauteur de visage
  s += brancard(268, 330, -74, false); // celui-là, on l'a renversé en courant

  // Le pied à perfusion, sa poche vide qui goutte pour personne.
  s += `<path d="M610 320v-92M596 320l14 -10l14 10M610 228h13" stroke="#101218" stroke-width="3" fill="none"/>
    <rect x="618" y="228" width="11" height="16" rx="2" fill="#1d2126"/>
    <path d="M623 244q2 12 -4 20" stroke="#15181d" stroke-width="1.6" fill="none"/>`;

  // Paperasse de triage éparpillée — des noms que personne ne rappellera.
  let pap = '';
  for (let i = 0; i < 11; i++) pap += `<rect x="${R(20 + r() * 660)}" y="${R(270 + r() * 56)}" width="${R(7 + r() * 8)}" height="4" rx="1"/>`;
  s += `<g fill="#2a2d33" opacity="0.16">${pap}</g>`;

  // Poussière en suspension sous les fenêtres, quand le jour s'en mêle.
  if (a.lum > 0.3) s += neige(53, 12, R(0.1 * a.lum), 60, 400, 60, 240);

  // Un couloir d'hôpital reste blême même à midi, et noir bien avant la nuit.
  s += voileNuit(a, 1.25);
  return s;
}
