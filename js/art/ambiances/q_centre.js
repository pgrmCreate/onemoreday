// Ambiance « Le centre ancien » — place Crousillat, la Fontaine Moussue,
// la Tour de l'Horloge arrêtée. Extérieur : ciel dynamique plein cadre,
// façades éventrées, carcasses, silhouettes qui tournent autour de la fontaine.
import {
  W, H, R, rng, fondCiel, astre, etoiles, neige, brume, batisse, toits,
  carcasse, lampadaire, zfig, pin, halo, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1306);
  let s = fondCiel(a) + astre(a, 632, 60) + etoiles(a, 41, 70);

  // Ligne de toits du fond : le vieux Salon, serré, sans une lumière.
  s += toits(9, 188, 46, '#0c0d13', 0.85);

  // La Tour de l'Horloge — campanile en fer forgé, cadran arrêté.
  s += `<g fill="#0a0b10">
    <rect x="520" y="74" width="54" height="130"/>
    <path d="M514 74h66l-8 -14h-50z"/>
    <path d="M531 60q16 -26 32 0M527 60q20 -34 40 0" stroke="#0a0b10" stroke-width="2.6" fill="none"/>
  </g>
  <circle cx="547" cy="106" r="13" fill="#1a1b22"/>
  <path d="M547 106l0 -9M547 106l6 4" stroke="#3a3b44" stroke-width="2"/>
  <path d="M530 132h34M530 152h34" stroke="#06070b" stroke-width="2" opacity="0.6"/>`;

  // Façades de la place : trois bâtisses, volets battants, fenêtres mortes.
  s += batisse(a, 30, 248, 130, 150, '#101117', 21);
  s += batisse(a, 170, 248, 110, 128, '#0e0f15', 22);
  s += batisse(a, 660, 248, 140, 168, '#101117', 23);
  // Devanture éventrée au pied de la première façade.
  s += `<rect x="48" y="214" width="74" height="34" fill="#08090d"/>
    <path d="M48 214l20 34M86 214l-12 34" stroke="#1c1d24" stroke-width="2" fill="none"/>`;

  // Le sol de la place : pavés, traînées sombres.
  s += `<rect x="0" y="248" width="${W}" height="${H - 248}" fill="#121318"/>`;
  let pav = '';
  for (let i = 0; i < 40; i++) pav += `M${R(r() * W)} ${R(254 + r() * 76)}h7`;
  s += `<path d="${pav}" stroke="#0b0c10" stroke-width="2" fill="none" opacity="0.7"/>`;
  s += `<path d="M300 268q60 10 120 4l-8 8q-58 5 -104 -4z" fill="#22080a" opacity="0.5"/>`;

  // La Fontaine Moussue : champignon de mousse, l'eau coule toujours.
  s += `<g>
    <ellipse cx="400" cy="296" rx="86" ry="14" fill="#0e1217"/>
    <ellipse cx="400" cy="290" rx="78" ry="10" fill="#15202a" opacity="0.8"/>
    <path d="M380 290q-12 -50 -22 -58q26 -16 42 -16t42 16q-10 8 -22 58z" fill="#1a241c"/>
    <ellipse cx="400" cy="216" rx="46" ry="22" fill="#202c20"/>
    <ellipse cx="390" cy="208" rx="34" ry="14" fill="#27361f" opacity="0.7"/>
    <path d="M366 226q6 26 10 60M434 226q-6 26 -10 60" stroke="#2c3f4a" stroke-width="1.6" fill="none" opacity="0.8"/>
  </g>`;
  // Reflet de l'astre dans la vasque, la nuit.
  if (a.nuit) s += `<ellipse cx="416" cy="290" rx="18" ry="3" fill="#cfc9b8" opacity="0.12"/>`;

  // Carcasses et mobilier urbain.
  s += carcasse(255, 318, 1, '#101117', 5);
  s += lampadaire(620, 318, 74, '#0d0e13', -7);
  s += pin(112, 318, 1.15, '#0a0d0a');

  // Eux. Ils tournent autour de la fontaine, sans fin.
  s += zfig(330, 296, 0.62, '#0b0c10', a.nuit, -6);
  s += zfig(470, 300, 0.66, '#0b0c10', a.nuit, 9);
  s += zfig(560, 306, 0.7, '#0a0b10', a.nuit, 14);

  s += brume(a, 250, '#3a4150', 0.14);
  s += neige(31, 26, 0.35);
  s += voileNuit(a);
  return s;
}
