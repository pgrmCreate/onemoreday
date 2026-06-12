// Ambiance « Miramas-le-Vieux » — le Refuge. Le village médiéval sur son rocher,
// maisons de pierre soudées, tour de guet, fumée aux conduits : des vivants.
// Le seul endroit du jeu où des fenêtres s'allument encore à la nuit tombée.
import {
  W, H, R, rng, fondCiel, astre, etoiles, neige, brume, batisse, toits,
  clocher, pin, halo, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1209);
  const pAll = a.lum < 0.45 ? 0.12 : 0; // la nuit, le Refuge garde ses lumières
  let s = fondCiel(a) + astre(a, 662, 56) + etoiles(a, 53, 80);

  // Au loin, l'étang de Berre — une lame métallique posée sur l'horizon.
  s += `<rect x="470" y="196" width="${W - 470}" height="6" fill="#46505e" opacity="${R(0.12 + 0.3 * a.lum)}"/>`;

  // Le rocher : pente douce côté rampe, à pic côté triage.
  s += `<path d="M0 ${H}L36 320Q90 290 132 246L168 196L600 196L622 232Q650 282 676 ${H}Z" fill="#0e1015"/>`;

  // Derrière les façades, la ligne de toits serrés du village (clipée au plateau).
  s += `<defs><clipPath id="${a.p}-roc"><rect x="176" y="60" width="420" height="138"/></clipPath></defs>
    <g clip-path="url(#${a.p}-roc)">${toits(17, 158, 30, '#0c0d13', 0.88)}</g>`;

  // La citerne du village, bâchée, sa jauge à la craie presque en bas.
  s += `<path d="M174 198q0 -17 19 -17t19 17z" fill="#12141a"/>
    <path d="M180 188q13 -8 26 0" stroke="#0c0d12" stroke-width="1.6" fill="none"/>
    <path d="M185 190h7M185 195h3" stroke="#aeb3bc" stroke-width="1.2" opacity="0.6" fill="none"/>`;

  // Le front de maisons médiévales, soudées les unes aux autres.
  s += batisse(a, 218, 198, 66, 64, '#101117', 31, pAll);
  s += `<path d="M218 134l33 -14 33 14z" fill="#101117"/>`;
  s += batisse(a, 296, 198, 60, 78, '#0f1016', 32, pAll);
  s += `<path d="M296 120l30 -12 30 12z" fill="#0f1016"/>`;
  s += batisse(a, 468, 198, 64, 60, '#101117', 33, pAll);
  s += `<path d="M468 138l32 -13 32 13z" fill="#101117"/>`;

  // L'église : le clocher, la nef où dort le grain du Refuge.
  s += clocher(358, 198, 56, '#0c0d13');
  s += `<rect x="384" y="160" width="78" height="38" fill="#0d0e14"/>
    <path d="M384 160l39 -10 39 10z" fill="#0d0e14"/>`;

  // La courtine est, rapiécée d'une tôle, et la tour carrée du guet nord.
  s += `<path d="M536 198v-13h6v5h6v-5h6v5h6v-5h6v13z" fill="#0d0e13"/>
    <rect x="540" y="189" width="8" height="8" fill="#1b1e24" opacity="0.8"/>`;
  s += `<g fill="#0b0c11"><rect x="548" y="92" width="38" height="106"/>
    <rect x="548" y="83" width="8" height="10"/><rect x="563" y="83" width="8" height="10"/>
    <rect x="578" y="83" width="8" height="10"/></g>`;
  // Le guetteur, emmitouflé, debout face à la plaine. Un vivant.
  s += `<g stroke="#0b0c11" fill="#0b0c11" stroke-linecap="round">
    <circle cx="567" cy="65" r="4" stroke="none"/>
    <path d="M567 69v13M567 73l-6 5M567 73l7 -2" stroke-width="3.2" fill="none"/></g>`;

  // Les conduits fument — la fumée qu'on voyait depuis le train. Des vivants.
  s += `<rect x="338" y="106" width="7" height="16" fill="#0f1016"/>
    <path d="M341 106q-6 -13 2 -25q8 -12 0 -25q-5 -11 5 -20" stroke="#8d929c" stroke-width="4" fill="none" opacity="0.3" stroke-linecap="round"/>`;
  s += `<rect x="436" y="146" width="7" height="14" fill="#0d0e14"/>
    <path d="M439 146q-7 -12 1 -23q8 -11 -1 -23" stroke="#8d929c" stroke-width="5" fill="none" opacity="0.26" stroke-linecap="round"/>`;

  // Du linge sèche entre les façades. Du linge propre.
  s += `<path d="M350 134q60 13 122 6" stroke="#7e848e" stroke-width="1.4" fill="none" opacity="0.8"/>
    <g fill="#9aa0ab" opacity="0.85"><path d="M372 141v10h7v-10z"/>
    <path d="M400 144h8l-1 10h-2l-1 -7l-1 7h-2z"/><path d="M436 143v9h8v-9z"/></g>`;
  s += `<path d="M278 150q15 6 30 -2" stroke="#7e848e" stroke-width="1.2" fill="none" opacity="0.7"/>
    <path d="M288 152v11h9v-11z" fill="#8d939e" opacity="0.75"/>`;

  // Strates du rocher, et la falaise côté triage.
  let roc = '';
  for (let i = 0; i < 12; i++) roc += `M${R(190 + r() * 360)} ${R(216 + r() * 96)}h${R(8 + r() * 10)}`;
  s += `<path d="${roc}" stroke="#15171d" stroke-width="1.6" fill="none" opacity="0.7"/>`;
  s += `<path d="M604 214l10 22M616 244l12 26M634 286l10 24" stroke="#15171d" stroke-width="1.8" fill="none" opacity="0.7"/>`;

  // La rampe : l'unique montée, raide, coupée de deux chicanes à pieux.
  s += `<path d="M64 328Q120 300 124 278Q128 258 150 240Q166 228 168 204" stroke="#1c1f26" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M112 284l18 6M138 240l18 8" stroke="#26211a" stroke-width="3.5" fill="none"/>
    <path d="M117 286l-1 -7M124 288l-1 -7M144 242l-1 -7M151 245l-1 -7" stroke="#26211a" stroke-width="2" fill="none"/>`;

  // En bas, la Porte Notre-Dame : la voûte, la herse de récupération, le barbelé.
  s += `<g fill="#0b0c11"><rect x="40" y="304" width="12" height="36"/>
    <rect x="84" y="304" width="12" height="36"/>
    <path d="M40 312q28 -24 56 0v-10q-28 -22 -56 0z"/></g>
    <path d="M52 ${H}v-24q16 -14 32 0v24z" fill="#08090d"/>
    <path d="M58 ${H}v-23M66 ${H}v-26M74 ${H}v-26M82 ${H}v-23M52 326h32" stroke="#1a1d24" stroke-width="2" fill="none"/>
    <path d="M40 302q8 -5 16 0t16 0t16 0t8 -2" stroke="#15171d" stroke-width="1.4" fill="none"/>`;

  // Les pins du rocher — l'hiver ne les déshabille pas.
  s += pin(150, 252, 0.85, '#0a0d0a');
  s += pin(596, 198, 0.65, '#0a0d0a');

  // En contrebas, le triage : des wagons immobiles à perte de nuit.
  s += `<rect x="650" y="324" width="150" height="16" fill="#0a0b0f"/>`;
  let wag = '';
  for (let i = 0; i < 4; i++) wag += `<rect x="${690 + i * 27}" y="${315 - (i % 2) * 3}" width="23" height="9" rx="1.5"/>`;
  s += `<g fill="#090a0e" opacity="0.9">${wag}</g>`;

  // À la nuit : deux lanternes or pâle — la lumière humaine tient encore ici.
  if (a.lum < 0.35) {
    s += halo(a, 'lant1', 399, 176, 26, 20, '#c9a227', 0.5)
      + `<rect x="396" y="172" width="6" height="9" fill="#d8b14a" opacity="0.85"/>`;
    s += halo(a, 'guet', 576, 76, 22, 17, '#c9a227', 0.45)
      + `<circle cx="576" cy="76" r="2.2" fill="#e0b95a" opacity="0.9"/>`;
  }

  s += brume(a, 278, '#3a4150', 0.13);
  s += neige(43, 28, 0.35);
  s += voileNuit(a);
  return s;
}
