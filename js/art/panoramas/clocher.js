// Panorama « Du haut du clocher » — cinématique 1600×340, vue plongeante.
// Depuis le sommet de la Porte de l'Horloge : à gauche la cage de fer forgé
// de Joseph Rolland et sa cloche muette ; puis la mer de toits du centre
// ancien — fumées que personne n'éteint, îlot brûlé, ruelles-canyons où des
// errants minuscules restent figés, la place de l'Hôtel-de-Ville et sa statue
// cernée, le clocher-mur de Saint-Michel ; point d'orgue : l'EMPÉRI massif et
// éteint sur son rocher (x ≈ 1000–1350) ; et au-delà, la Porte du Bourg Neuf,
// les platanes nus des cours, l'A7 figée, la plaine vide jusqu'aux collines.
import {
  R, rng, dots, halo, astre, etoiles, neige, brume, zfig,
} from '../ambiance_lib.js';

const PW = 1600, PH = 340;

export default function (a) {
  // ---- Ciel pleine largeur (fondCiel ne couvre que 800) ----
  let s = `<defs><linearGradient id="${a.p}-ciel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${a.haut}"/><stop offset="1" stop-color="${a.bas}"/>
  </linearGradient></defs><rect width="${PW}" height="${PH}" fill="url(#${a.p}-ciel)"/>`;
  s += astre(a, 520, 58);
  s += etoiles(a, 41, 60, 110) + `<g transform="translate(800,0)">${etoiles(a, 87, 60, 110)}</g>`;

  // ---- L'horizon : les collines, cerne gris autour de la ville ----
  s += `<path d="M0 134Q190 120 380 130Q640 142 880 126Q1130 112 1360 128Q1500 136 1600 128L1600 168L0 168Z" fill="#0b0d13" opacity="0.5"/>`;
  s += `<path d="M1280 158Q1400 142 1500 148Q1560 151 1600 146L1600 190L1280 190Z" fill="#0a0b10" opacity="0.65"/>`;
  // Deux fumées au ras de l'horizon : d'autres villes brûlent aussi.
  s += `<path d="M1448 150q-5 -16 2 -32q6 -16 0 -30M1532 144q-4 -14 3 -28q5 -14 -1 -26" stroke="#3a3e49" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.25"/>`;

  // ---- La plaine, à droite : champs gris, l'autoroute et son chapelet de morts ----
  s += `<path d="M1330 240L1600 230L1600 146Q1462 154 1344 172Z" fill="#0c0d12"/>`;
  s += `<path d="M1364 186Q1480 176 1600 170M1356 202Q1478 192 1600 186M1350 218Q1476 208 1600 204" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.7"/>`;
  s += `<path d="M1352 196Q1470 184 1600 178" stroke="#1b1d24" stroke-width="5" fill="none"/>`;
  const rv = rng(733), va = [], vb = [];
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    (i % 4 ? va : vb).push([R(1360 + t * 232 + rv() * 6), R(195 - t * 17 + rv() * 2)]);
  }
  s += dots(va, 2, '#060608', 0.9) + dots(vb, 2.2, '#8a4a20', 0.4);
  // Les platanes nus de la ceinture des cours, là où la ville s'arrête.
  let pla = '';
  for (let i = 0; i < 8; i++) {
    const px = 1400 + i * 26, py = R(222 - i * 1.2);
    pla += `M${px} ${py}v-10M${px} ${R(py - 10)}l-5 -6M${px} ${R(py - 10)}l5 -6M${px} ${R(py - 13)}l-3 -7`;
  }
  s += `<path d="${pla}" stroke="#0c0d12" stroke-width="2" fill="none"/>`;
  s += zfig(1424, 206, 0.14, '#0a0b10', a.nuit, 9) + zfig(1452, 210, 0.13, '#0a0b10', a.nuit, -11);

  // ---- La mer de toits, plan lointain : une dentelle grise jusqu'au bord est ----
  const rA = rng(901);
  let dA = 'M0 252L0 200', xA = 0, chA = '';
  while (xA < 1368) {
    const lw = R(24 + rA() * 34), pic = R(176 + rA() * 16);
    if (rA() < 0.6) dA += `L${R(xA + lw / 2)} ${pic}L${R(xA + lw)} 200`;
    else {
      dA += `L${xA} ${pic}L${R(xA + lw)} ${pic}L${R(xA + lw)} 200`;
      if (rA() < 0.4) chA += `M${R(xA + lw * 0.3)} ${pic}v-6`;
    }
    xA += lw;
  }
  s += `<path d="${dA}L${R(xA)} 252Z" fill="#0b0c12" opacity="0.92"/>`;
  s += `<path d="${chA}" stroke="#0b0c12" stroke-width="2.4" fill="none" opacity="0.92"/>`;

  // ---- Plan moyen : pignons serrés, cheminées, antennes — le centre ancien ----
  const rB = rng(1907);
  let xB = 0;
  while (xB < 1356) {
    const w = R(34 + rB() * 40), hh = R(22 + rB() * 22), base = R(250 + rB() * 6);
    const top = R(base - hh);
    const f = rB() < 0.5 ? '#0d0e14' : '#0c0d13';
    s += `<path d="M${xB} ${base}L${R(xB + w * 0.14)} ${top}L${R(xB + w * 0.86)} ${R(top + 2)}L${R(xB + w)} ${base}Z" fill="${f}"/>`;
    if (rB() < 0.45) s += `<path d="M${R(xB + w * 0.3)} ${R(top + 3)}v-8h5v8" stroke="${f}" stroke-width="2.4" fill="none"/>`;
    if (rB() < 0.25) s += `<path d="M${R(xB + w * 0.6)} ${top}v-9m-5 3l5 -3 5 3" stroke="#0a0b10" stroke-width="1.4" fill="none"/>`;
    xB += w + R(1 + rB() * 4);
  }

  // ---- L'îlot brûlé : charpentes à nu, braises mortes, la grande fumée noire ----
  s += `<path d="M524 252l8 -34 26 -8 30 10 18 -6 14 30 -8 8z" fill="#060608"/>`;
  s += `<path d="M536 224l18 -14M560 212l16 22M586 214l-8 26M598 220l12 14" stroke="#0c0d12" stroke-width="1.8" fill="none"/>`;
  s += halo(a, 'braise', 566, 248, 44, 14, '#8a4a20', R(0.12 + 0.18 * (1 - a.lum)));
  s += dots([[552, 246], [566, 243], [579, 247]], 1.6, '#d6303e', 0.4);
  s += `<path d="M566 240q-10 -28 2 -54q11 -25 -1 -50q-9 -22 9 -44q13 -17 34 -26" stroke="#16171d" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.42"/>`;
  s += `<path d="M566 240q-8 -26 3 -50q9 -23 0 -48q-7 -20 10 -42" stroke="#060608" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.5"/>`;

  // ---- Saint-Michel : le clocher-mur à arcades, ses cloches, la tour du XVe ----
  s += `<path d="M632 252v-62h32v62z" fill="#0c0d13"/>
  <path d="M632 190l16 -14 16 14z" fill="#0c0d13"/>
  <path d="M637 216q5.5 -11 11 0v9h-11zM652 216q5.5 -11 11 0v9h-11z" fill="#06070b"/>
  <circle cx="642.5" cy="219" r="2.2" fill="#04050a"/><circle cx="657.5" cy="219" r="2.2" fill="#04050a"/>
  <path d="M648 176v-8M644 171h8" stroke="#0c0d13" stroke-width="2"/>`;
  s += `<rect x="668" y="200" width="22" height="52" fill="#0d0e14"/><path d="M666 200h26l-13 -10z" fill="#0d0e14"/>`;
  // Le cadran de la ville. Arrêté à 21 h 10, comme l'autre. Comme en 1909.
  s += `<circle cx="679" cy="214" r="5" fill="#15161d"/><path d="M679 214l-3 -1.4M679 214l1.4 -3" stroke="#34353e" stroke-width="1.2"/>`;

  // ---- Les fumées : la ville brûle lentement, sans pompiers, sans sirènes ----
  s += `<path d="M318 240q-8 -22 1 -44q8 -20 -2 -40q-7 -17 7 -34q10 -13 24 -20" stroke="#4d515c" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.3"/>`;
  s += `<path d="M806 234q-7 -20 2 -40q8 -18 -2 -36q-6 -15 8 -30q9 -10 20 -15" stroke="#4d515c" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="0.26"/>`;
  s += `<path d="M978 244q-6 -18 2 -36q7 -17 -1 -33q-6 -14 7 -28" stroke="#454a55" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.24"/>`;

  // ---- L'EMPÉRI (x ≈ 1000–1350) : le rocher du Puech et la forteresse, éteinte ----
  s += `<path d="M1002 308Q1024 232 1056 192L1068 170L1292 170L1308 190Q1334 230 1352 308Z" fill="#0a0b10"/>`;
  s += `<path d="M1058 188L1086 252L1072 308M1150 172L1136 244L1158 308M1262 172L1282 250L1268 308" stroke="#06070b" stroke-width="2" fill="none" opacity="0.6"/>`;
  // La courtine crénelée posée sur la lèvre du rocher.
  let cren = 'M1052 156';
  for (let cx = 1052; cx < 1296; cx += 16) cren += 'v-6h8v6h8';
  cren += 'v22H1052z';
  s += `<path d="${cren}" fill="#0d0e14"/>`;
  // Les deux tours massives et le logis ; la galerie Renaissance, morte.
  s += `<rect x="1086" y="100" width="44" height="58" fill="#0e0f15"/>`;
  let cr1 = 'M1086 100';
  for (let cx = 1086; cx < 1126; cx += 10) cr1 += 'v-5h5v5h5';
  cr1 += 'v9H1086z';
  s += `<path d="${cr1}" fill="#0e0f15"/>`;
  s += `<rect x="1238" y="92" width="48" height="66" fill="#0d0e14"/>`;
  let cr2 = 'M1238 92';
  for (let cx = 1238; cx < 1282; cx += 11) cr2 += 'v-5h5.5v5h5.5';
  cr2 += 'v9H1238z';
  s += `<path d="${cr2}" fill="#0d0e14"/>`;
  s += `<rect x="1130" y="122" width="108" height="36" fill="#0c0d13"/>`;
  s += `<path d="M1140 144q5 -9 10 0M1158 144q5 -9 10 0M1176 144q5 -9 10 0M1194 144q5 -9 10 0M1212 144q5 -9 10 0" stroke="#06070b" stroke-width="2.6" fill="none"/>`;
  s += `<path d="M1098 116v10M1112 124v10M1250 108v12M1268 120v10" stroke="#06070b" stroke-width="3"/>`;
  // La chapelle castrale, un campanile de pierre au-dessus du logis.
  s += `<path d="M1196 122v-14l9 -6 9 6v14z" fill="#0d0e14"/><path d="M1201 118q4 -8 8 0v4h-8z" fill="#06070b"/>`;
  // Le grand escalier, en lacets sur la face du rocher.
  s += `<path d="M1014 296L1062 262L1030 236L1068 210L1050 192L1066 176" stroke="#1c1e26" stroke-width="3.2" fill="none" stroke-linejoin="round" opacity="0.85"/>`;
  // Les corbeaux tiennent le donjon, maintenant.
  s += `<path d="M1148 78q6 -7 12 0q6 -7 12 0M1218 64q5 -6 10 0q5 -6 10 0M1262 82q6 -7 12 0" stroke="#060608" stroke-width="2" fill="none" opacity="0.8"/>`;

  // ---- La Porte du Bourg Neuf, créneaux et mâchicoulis, au bord est ----
  s += `<rect x="1358" y="226" width="34" height="30" fill="#0d0e14"/>
  <path d="M1358 226v-6h7v6h6v-6h8v6h6v-6h7v6z" fill="#0d0e14"/>
  <path d="M1370 256v-12q5 -6 10 0v12z" fill="#06070b"/>`;

  // ---- Plan rapproché : grands toits de tuiles, faîtages, lucarnes, trouées ----
  const rC = rng(517);
  let xC = -14, iC = 0;
  while (xC < 1620) {
    const w = R(64 + rC() * 64), hh = R(38 + rC() * 22), base = R(304 + rC() * 8);
    const top = R(base - hh);
    const f = iC % 2 ? '#0c0d12' : '#0b0c11';
    s += `<path d="M${xC} ${base}L${R(xC + w * 0.16)} ${top}H${R(xC + w * 0.84)}L${R(xC + w)} ${base}Z" fill="${f}"/>`;
    s += `<path d="M${R(xC + w * 0.16)} ${top}H${R(xC + w * 0.84)}" stroke="#06070b" stroke-width="2" opacity="0.8"/>`;
    let tl = '';
    for (let i = 1; i < 4; i++) {
      const ty = R(top + hh * i / 4), ins = R(w * 0.16 * (1 - i / 4));
      tl += `M${R(xC + ins)} ${ty}L${R(xC + w - ins)} ${ty}`;
    }
    s += `<path d="${tl}" stroke="#08090d" stroke-width="1.3" fill="none" opacity="0.7"/>`;
    const dv = rC();
    if (dv < 0.3) s += `<path d="M${R(xC + w * 0.42)} ${R(top + 10)}h11l-5.5 -8z" fill="#08090d"/>`;
    else if (dv < 0.5) s += `<rect x="${R(xC + w * 0.34)}" y="${R(top - 9)}" width="8" height="11" fill="${f}"/><path d="M${R(xC + w * 0.34 - 1.5)} ${R(top - 9)}h11" stroke="${f}" stroke-width="3"/>`;
    // Deux toits crevés sur le noir des combles, et une bâche orange délavée.
    if (iC === 3 || iC === 9) s += `<path d="M${R(xC + w * 0.3)} ${R(top + 8)}l${R(w * 0.3)} -3 ${R(w * 0.12)} 9 -${R(w * 0.26)} 7z" fill="#06070b"/>`;
    if (iC === 6) s += `<path d="M${R(xC + w * 0.5)} ${R(top + 6)}l${R(w * 0.26)} 4 -4 12 -${R(w * 0.2)} -2z" fill="#8a4a20" opacity="0.3"/>`;
    xC += w + R(2 + rC() * 5);
    iC++;
  }

  // ---- Les ruelles-canyons : tout en bas, EUX, minuscules et figés ----
  s += `<path d="M438 340L450 238L474 238L498 340Z" fill="#07080d"/>`;
  s += `<path d="M452 252h18M450 270h21M448 290h24M445 312h28" stroke="#0d0e14" stroke-width="1.4" opacity="0.6"/>`;
  s += `<path d="M462 318q9 4 18 2l-3 5q-9 1 -15 -3z" fill="#a31621" opacity="0.3"/>`;
  s += zfig(461, 282, 0.17, '#0a0b10', a.nuit, 8) + zfig(470, 312, 0.22, '#0a0b10', a.nuit, -10);
  s += `<path d="M836 340L846 246L866 246L884 340Z" fill="#07080d"/>`;
  s += `<path d="M848 262h16M846 284h19M843 310h23" stroke="#0d0e14" stroke-width="1.4" opacity="0.6"/>`;
  s += zfig(856, 290, 0.18, '#0a0b10', a.nuit, 12) + zfig(862, 322, 0.2, '#0b0c10', a.nuit, -7);

  // ---- La place de l'Hôtel-de-Ville : la statue de Craponne, et son public ----
  s += `<path d="M688 306L700 252L788 252L802 306Z" fill="#0e1015"/>`;
  s += `<path d="M700 252L688 306M788 252L802 306M694 280h100M690 296h110" stroke="#0a0b10" stroke-width="1.2" fill="none" opacity="0.5"/>`;
  s += `<rect x="742" y="276" width="9" height="7" fill="#0b0c11"/>
  <path d="M746.5 276v-9M746.5 271l4 -3M746.5 269l-3.5 -2" stroke="#1c241f" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  // Eux, en cercle autour du bronze, figés comme une audience.
  const rq = rng(1313), qa = [], qb = [];
  for (let i = 0; i < 18; i++) {
    const an = i * 0.349, rr = 14 + rq() * 18;
    (i % 3 ? qa : qb).push([R(746 + Math.cos(an) * rr * 1.6), R(284 + Math.sin(an) * rr * 0.42)]);
  }
  s += dots(qa, 2, '#0a0b10', 0.9) + dots(qb, 2.6, '#0c0d12', 0.85);
  s += zfig(716, 270, 0.16, '#0a0b10', a.nuit, 10) + zfig(774, 268, 0.15, '#0a0b10', a.nuit, -9);
  s += `<path d="M730 298q14 5 30 3l-4 5q-14 1 -24 -4z" fill="#22080a" opacity="0.45"/>`;

  // ---- Tout premier plan : les toits sous la tour, énormes, qu'on survole ----
  const rD = rng(2025);
  let xD = -20, iD = 0;
  while (xD < 1620) {
    const w = R(120 + rD() * 90), top = R(300 + rD() * 12);
    const f = iD % 2 ? '#0a0b10' : '#090a0f';
    if (iD === 4) {
      // Une terrasse : le campement de quelqu'un qui a tenu un moment, là-haut.
      s += `<rect x="${xD}" y="${top}" width="${R(w)}" height="${R(340 - top)}" fill="#0b0c11"/>`;
      s += `<path d="M${R(xD + 6)} ${R(top + 2)}h${R(w - 12)}" stroke="#14151c" stroke-width="2.4" opacity="0.7"/>`;
      s += `<rect x="${R(xD + 14)}" y="${R(top + 14)}" width="34" height="12" rx="2" fill="#15161c" opacity="0.8"/>`;
      s += `<ellipse cx="${R(xD + 31)}" cy="${R(top + 19)}" rx="12" ry="4" fill="#0a0b10"/>`;
      s += `<path d="M${R(xD + 58)} ${R(top + 6)}q24 6 48 2" stroke="#101218" stroke-width="1.4" fill="none"/>`;
      s += `<path d="M${R(xD + 70)} ${R(top + 9)}v8h6v-8M${R(xD + 88)} ${R(top + 10)}v9h7v-9" fill="#14151b"/>`;
      s += dots([[R(xD + 26), R(top + 30)], [R(xD + 34), R(top + 28)], [R(xD + 52), R(top + 32)]], 1.8, '#3c414c', 0.5);
    } else {
      s += `<path d="M${xD} 348L${R(xD + w * 0.2)} ${top}H${R(xD + w * 0.8)}L${R(xD + w)} 348Z" fill="${f}"/>`;
      s += `<path d="M${R(xD + w * 0.2)} ${top}H${R(xD + w * 0.8)}" stroke="#05060a" stroke-width="2.6" opacity="0.9"/>`;
      let tD = '';
      for (let i = 1; i < 4; i++) {
        const ty = R(top + (340 - top) * i / 3.4), ins = R(w * 0.2 * (1 - i / 4));
        tD += `M${R(xD + ins)} ${ty}L${R(xD + w - ins)} ${ty}`;
      }
      s += `<path d="${tD}" stroke="#06070b" stroke-width="1.6" fill="none" opacity="0.8"/>`;
      if (rD() < 0.5) s += `<rect x="${R(xD + w * 0.3)}" y="${R(top - 12)}" width="10" height="14" fill="${f}"/><path d="M${R(xD + w * 0.3 - 2)} ${R(top - 12)}h14" stroke="${f}" stroke-width="3.4"/>`;
      if (iD === 7) s += `<path d="M${R(xD + w * 0.5)} ${R(top + 8)}l16 10m-8 -5l-10 14m10 -14l14 2" stroke="#101218" stroke-width="1.6" fill="none"/>`;
    }
    xD += w + R(3 + rD() * 6);
    iD++;
  }

  // ---- Le sommet de la tour : pierre, fer forgé, la cloche muette ----
  s += `<rect x="0" y="244" width="152" height="96" fill="#0d0e14"/>`;
  s += `<rect x="0" y="240" width="156" height="8" fill="#15161c"/>`;
  s += `<path d="M0 266h150M0 290h150M0 314h150M38 248v18M96 248v18M64 266v24M118 266v24M30 290v24M88 290v24M52 314v26M110 314v26" stroke="#08090d" stroke-width="1.8" opacity="0.7"/>`;
  s += `<rect x="138" y="214" width="16" height="30" fill="#0e0f15"/><circle cx="146" cy="210" r="5" fill="#0e0f15"/>`;
  // La cage de fer forgé de Joseph Rolland, et sa flèche dans le vent.
  s += `<path d="M8 242Q8 92 76 50Q144 92 144 242" stroke="#0b0c11" stroke-width="5" fill="none"/>`;
  s += `<path d="M38 242Q38 124 76 88Q114 124 114 242" stroke="#0b0c11" stroke-width="3.2" fill="none" opacity="0.9"/>`;
  s += `<path d="M20 174Q76 158 132 174M32 120Q76 106 120 120" stroke="#0b0c11" stroke-width="2.4" fill="none" opacity="0.9"/>`;
  s += `<path d="M76 50v-22M76 28l9 5 -9 4z" stroke="#0b0c11" stroke-width="2.6" fill="#0b0c11"/>`;
  s += `<path d="M68 32q-7 2 -7 9M84 32q7 2 7 9" stroke="#0b0c11" stroke-width="1.8" fill="none"/>`;
  // 2 563 kilos de bronze pendus dans le vide. De quoi réveiller toute la ville.
  s += `<path d="M76 124v14" stroke="#0b0c11" stroke-width="3.5"/>`;
  s += `<path d="M60 170q0 -32 16 -32t16 32q5 2 5 7h-42q0 -5 5 -7z" fill="#0b0c11"/>`;
  s += `<circle cx="76" cy="182" r="4" fill="#0b0c11"/>`;
  s += `<path d="M70 177q-7 36 -5 63" stroke="#15161d" stroke-width="1.6" fill="none" opacity="0.9"/>`;
  // Deux corbeaux te regardent faire. Ils ont vu d'autres curieux monter ici.
  s += `<g transform="translate(124,168)" fill="#060608"><ellipse cx="0" cy="-3" rx="7" ry="4.4"/><circle cx="6.5" cy="-7" r="2.8"/><path d="M9 -7l5.5 1.6 -5.5 1.2zM-5 -4l-8 -4 3 6z"/></g>`;
  s += `<g transform="translate(28,240) scale(-0.85,0.85)" fill="#060608"><ellipse cx="0" cy="-3" rx="7" ry="4.4"/><circle cx="6.5" cy="-7" r="2.8"/><path d="M9 -7l5.5 1.6 -5.5 1.2zM-5 -4l-8 -4 3 6z"/></g>`;

  // ---- Corbeaux en vol, brume couchée entre les toits, neige fine ----
  s += `<path d="M236 92q6 -7 12 0q6 -7 12 0M398 58q6 -7 12 0q6 -7 12 0M688 80q5 -6 10 0q5 -6 10 0M912 50q6 -7 12 0M1418 100q5 -6 10 0q5 -6 10 0" stroke="#060608" stroke-width="2.2" fill="none" opacity="0.8"/>`;
  s += brume(a, 196, '#3a4150', 0.12, 'g') + `<g transform="translate(800,0)">${brume(a, 196, '#3a4150', 0.12, 'd')}</g>`;
  s += neige(31, 26, 0.32) + `<g transform="translate(800,0)">${neige(63, 26, 0.32)}</g>`;

  // ---- Voile final pleine largeur (voileNuit ne couvre que 800) ----
  s += `<rect width="${PW}" height="${PH}" fill="#04050a" opacity="${Math.min(0.82, Math.round((1 - a.lum) * 55) / 100)}"/>`;
  return s;
}
