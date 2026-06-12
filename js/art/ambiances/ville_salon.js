// Ambiance « Salon-de-Provence (vue ville) » — la ville entière depuis les
// hauteurs de l'est. L'Empéri sur son rocher, les toits serrés du centre,
// trois colonnes de fumée qui ne s'éteignent pas, la plaine au loin.
import {
  W, H, R, rng, lerpHex, fondCiel, astre, etoiles, neige, brume, toits,
  clocher, zfig, carcasse, pin, halo, dots, voileNuit,
} from '../ambiance_lib.js';

export default function (a) {
  const r = rng(1340);
  let s = fondCiel(a) + astre(a, 598, 56) + etoiles(a, 53, 80);

  // La plaine au loin — champs, haies, plus une seule lumière nulle part.
  const plaine = lerpHex(a.bas, '#10131a', 0.72);
  s += `<path d="M0 158q200 -10 400 -8t400 6v60H0z" fill="${plaine}"/>`;
  // La ligne bleue des Alpilles, posée sur l'horizon.
  s += `<path d="M0 156l70 -18 64 12 58 -16 70 16 48 -8 40 14H0z" fill="${lerpHex(a.bas, '#141826', 0.6)}" opacity="0.85"/>`;
  // Parcellaire : chemins, haies, cyprès minuscules.
  let ch = '', cyp = '';
  for (let i = 0; i < 14; i++) ch += `M${R(r() * W)} ${R(160 + r() * 30)}h${R(18 + r() * 34)}`;
  for (let i = 0; i < 9; i++) cyp += `M${R(r() * W)} ${R(166 + r() * 22)}v-5`;
  s += `<path d="${ch}" stroke="#0e1118" stroke-width="1.2" fill="none" opacity="0.5"/>`;
  s += `<path d="${cyp}" stroke="#0c100e" stroke-width="2" fill="none" opacity="0.7"/>`;

  // Premier rang de toits, tout au fond — la ville commence là.
  s += toits(61, 196, 22, '#13141d', 0.8);

  // L'Empéri sur son rocher : la seule masse qui regarde tout le reste de haut.
  s += `<path d="M452 244q16 -56 54 -82l128 -4q40 24 60 86z" fill="#0d0e14"/>`;
  // La courtine crénelée, le donjon, la tour basse — fenêtres en meurtrières.
  s += `<path d="M492 166v-30h7v-7h7v7h10v-7h7v7h10v-7h7v7h10v-7h7v7h10v-7h7v7h10v-7h7v7h10v-7h7v7h7v30z" fill="#0b0c12"/>`;
  s += `<rect x="500" y="118" width="26" height="50" fill="#0b0c12"/>
    <path d="M500 118h7v-7h-7zM513 118h7v-7h-7z" fill="#0b0c12"/>
    <rect x="556" y="98" width="36" height="70" fill="#0b0c12"/>
    <path d="M556 98h7v-8h-7zM570 98h7v-8h-7zM584 98h8v-8h-8z" fill="#0b0c12"/>
    <path d="M568 116v9M580 132v9M510 132v8" stroke="#06070b" stroke-width="2.4"/>`;

  // Deuxième rang de toits — le centre ancien, serré contre son rocher.
  s += toits(17, 214, 30, '#0f1018', 0.95);
  // La collégiale et le campanile de l'Horloge dépassent à peine des tuiles.
  s += clocher(286, 226, 28, '#0d0e14');
  s += `<rect x="430" y="190" width="13" height="32" fill="#0c0d13"/>
    <path d="M431 190q5.5 -11 11 0" stroke="#0c0d13" stroke-width="2.2" fill="none"/>`;

  // Trois colonnes de fumée noire — trois quartiers qui brûlent encore.
  s += `<path d="M186 236q-7 -26 1 -48q-9 -26 -1 -48q-7 -24 5 -42" stroke="#14151b" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M188 182q-9 -26 0 -50q-6 -22 8 -38" stroke="#14151b" stroke-width="15" fill="none" stroke-linecap="round" opacity="0.4"/>
  <circle cx="197" cy="88" r="11" fill="#14151b" opacity="0.32"/>
  <circle cx="210" cy="74" r="15" fill="#14151b" opacity="0.24"/>
  <circle cx="226" cy="64" r="18" fill="#14151b" opacity="0.16"/>`;
  s += `<path d="M352 238q-8 -30 0 -56q-9 -28 1 -54q-8 -26 6 -46" stroke="#121319" stroke-width="11" fill="none" stroke-linecap="round" opacity="0.75"/>
  <path d="M354 176q-10 -30 0 -56q-7 -24 9 -42" stroke="#121319" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.42"/>
  <circle cx="366" cy="70" r="13" fill="#121319" opacity="0.34"/>
  <circle cx="382" cy="56" r="17" fill="#121319" opacity="0.25"/>
  <circle cx="401" cy="46" r="20" fill="#121319" opacity="0.16"/>`;
  s += `<path d="M690 240q-6 -24 2 -44q-8 -24 0 -44q-6 -22 6 -38" stroke="#14151b" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.65"/>
  <circle cx="701" cy="106" r="10" fill="#14151b" opacity="0.3"/>
  <circle cx="713" cy="94" r="13" fill="#14151b" opacity="0.2"/>`;
  // La suie dérive au vent, vers la plaine.
  const sp = [];
  for (let i = 0; i < 12; i++) sp.push([R(200 + r() * 260), R(40 + r() * 50)]);
  s += dots(sp, 1.5, '#1a1b22', 0.4);

  // Dernier rang de toits, au plus près — pignons, cheminées froides.
  s += toits(43, 236, 26, '#0b0c11');

  // Sous la colonne du centre, le foyer rougeoie — surtout une fois la nuit venue.
  s += halo(a, 'feu', 352, 222, 36, 13, '#8a4a20', R(0.1 + 0.24 * (1 - a.lum)));
  if (a.lum < 0.5) s += `<path d="M348 218h.1M356 220h.1" stroke="#d6303e" stroke-width="2.2" opacity="0.7" fill="none"/>`;

  // Le boulevard de ceinture : une file de carcasses minuscules, figée pour toujours.
  s += `<path d="M0 252q210 -12 412 -10t388 6v13q-190 -8 -390 -7t-410 12z" fill="#14151c"/>`;
  s += carcasse(140, 257, 0.34, '#0e0f15', 7);
  s += carcasse(395, 254, 0.3, '#101117', 11);
  s += carcasse(540, 255, 0.32, '#0e0f15', 19);
  s += carcasse(662, 256, 0.3, '#101117', 23);
  s += zfig(470, 243, 0.28, '#0b0c10', a.nuit, 12);

  // Le premier plan : la colline d'où l'on regarde, garrigue et pierres sèches.
  s += `<path d="M0 ${H}v-44q120 -22 250 -12q170 12 330 4q120 -6 220 16v36z" fill="#0a0b10"/>`;
  s += `<ellipse cx="64" cy="318" rx="26" ry="8" fill="#0d0e13"/>
    <ellipse cx="586" cy="324" rx="34" ry="9" fill="#0c0d12"/>`;
  let gar = '';
  for (let i = 0; i < 16; i++) gar += `M${R(r() * W)} ${R(300 + r() * 34)}q2 -6 4 0`;
  s += `<path d="${gar}" stroke="#0c0f0c" stroke-width="1.6" fill="none" opacity="0.8"/>`;

  // Les pins parasols encadrent la vue — l'hiver ne les déshabille pas.
  s += pin(96, 330, 1.8);
  s += pin(716, 326, 1.5, '#0a0d0a');
  s += pin(652, 336, 0.9, '#090c09');

  // Deux silhouettes montées jusqu'ici. Elles regardent la ville, comme toi.
  s += zfig(252, 268, 0.5, '#0b0c10', a.nuit, -6);
  s += zfig(598, 266, 0.46, '#0a0b10', a.nuit, 11);

  s += brume(a, 186, '#3a4150', 0.13);
  s += brume(a, 244, '#2e3340', 0.1, '2');
  s += neige(29, 28, 0.35);
  s += voileNuit(a);
  return s;
}
