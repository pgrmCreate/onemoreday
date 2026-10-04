// Urgences de Salon, la nuit. Travelling latéral le long du couloir des box ; néons, brancards,
// la clochette sur le chariot, et une main à manche rouge qui glisse un billet dans une housse.
import { alea, r1, halo, mix, sombre, degrade, uid, gisant, humain } from '../lib.js';
import { svgBrasMain, poserMain, formesMain, formesBillet, POSES_MAIN, melangePose } from '../main.js';

// La main (js/cine/main.js) : où se trouve le poignet, l'angle de la main, la pose des doigts, à chaque instant du plan.
// Repères : px = centre de la pochette porte-étiquette sur la housse (fraction 0,56 de la couche), Y_POCHE = son bord haut.
const Y_POCHE = 702, ECH_MAIN = 1.25;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (t, a, b) => ease((t - a) / (b - a));
// Clés : t (s), poignet (dx depuis px, y), angle de la main (°)
const CLES = [
  { t: 0, x: 760, y: 60, a: 92 }, { t: 3.2, x: 760, y: 60, a: 92 },
  { t: 5.0, x: 139, y: 551, a: 110 },                     // au-dessus de la pochette, le billet pincé
  { t: 5.45, x: 132, y: 558, a: 111 },                    // un temps d'hésitation
  { t: 6.05, x: 128, y: 614, a: 113 },                    // le billet entre dans la pochette
  { t: 6.5, x: 132, y: 612, a: 112 },                     // les doigts s'ouvrent
  { t: 6.95, x: 156, y: 530, a: 106 },                    // la main remonte
  { t: 8.4, x: 700, y: 90, a: 95 },                       // et s'en va
];
function etatMain(tp) {
  let i = 0; while (i < CLES.length - 2 && tp > CLES[i + 1].t) i++;
  const A = CLES[i], B = CLES[i + 1], k = seg(tp, A.t, B.t);
  const x = A.x + (B.x - A.x) * k, y = A.y + (B.y - A.y) * k, a = A.a + (B.a - A.a) * k;
  // doigts : pincés jusqu'à 6,05 s, s'ouvrent jusqu'à 6,4 s, se détendent en partant
  let g = POSES_MAIN.pince;
  if (tp > 6.05) g = melangePose(POSES_MAIN.pince, POSES_MAIN.ouverte, seg(tp, 6.05, 6.4));
  if (tp > 6.6) g = melangePose(POSES_MAIN.ouverte, POSES_MAIN.repos, seg(tp, 6.6, 7.3));
  // un léger tremblement au-dessus de la housse (elle hésite)
  const tr = tp > 4.9 && tp < 6.1 ? Math.sin(tp * 37) * 1.2 + Math.sin(tp * 23) * 0.8 : 0;
  return { x, y: y + tr, a, g, lache: tp > 6.15 };
}

const MUR = '#5d7d76', MUR_OMBRE = '#2c3b38', SOL = '#1f2826', NEON = '#e9f5ee';

function brancard(x, y, w, o = {}) {
  const c = '#8d9894';
  let s = `<g class="brancard">`;
  s += `<path d="M${x} ${y - 70}h${w}M${x + 20} ${y - 70}l-6 58M${x + w - 20} ${y - 70}l6 58M${x + 10} ${y - 30}h${w - 20}" stroke="${c}" stroke-width="6" fill="none"/>`;
  for (const cx of [x + 14, x + w - 14]) s += `<circle cx="${cx}" cy="${y - 8}" r="9" fill="#141817"/>`;
  s += `<rect x="${x - 4}" y="${y - 92}" width="${w + 8}" height="22" rx="6" fill="${o.matelas || '#35514d'}"/>`;
  if (o.drap) s += `<path d="M${x - 6} ${y - 92}c${w * 0.2} -30 ${w * 0.5} -40 ${w * 0.72} -26c${w * 0.14} 6 ${w * 0.26} 4 ${w * 0.3} 26v44c-${w * 0.3} 10 -${w * 0.7} 8 -${w + 12} 0z" fill="${o.drap}"/><path d="M${x + w * 0.2} ${y - 100}q${w * 0.2} 30 ${w * 0.1} 60M${x + w * 0.6} ${y - 108}q-10 40 10 70" stroke="${sombre(o.drap, 0.2)}" stroke-width="3" fill="none"/>`;
  return s + '</g>';
}

export default {
  largeur: 2.1,
  fond: '#0d1211',
  reglages: { poussiere: '#cfe0da' },
  couches: [
    { profondeur: 0, svg: (L) => {
      const rnd = alea('couloir');
      const id = uid('m'), ids = uid('s'), idp = uid('p');
      let s = `<defs>${degrade(id, [[0, '#1b2523'], [0.2, MUR], [0.75, mix(MUR, '#20302d', 0.4)], [1, '#1a2422']])}${degrade(ids, [[0, '#33423f'], [0.4, SOL], [1, '#0b0f0e']])}${degrade(idp, [[0, '#0a0d0d'], [1, '#27322f']])}</defs>`;
      s += `<rect x="-5" y="0" width="${L + 10}" height="160" fill="url(#${idp})"/>`;
      s += `<rect x="-5" y="150" width="${L + 10}" height="615" fill="url(#${id})"/>`;
      s += `<rect x="-5" y="760" width="${L + 10}" height="250" fill="url(#${ids})"/>`;
      // Plinthe et main courante.
      s += `<rect x="-5" y="690" width="${L + 10}" height="22" fill="#3d514d"/><rect x="-5" y="740" width="${L + 10}" height="22" fill="#26302e"/><rect x="-5" y="548" width="${L + 10}" height="12" fill="#9aa7a0" opacity="0.5"/>`;
      // Faux-plafond.
      let d = ''; for (let x = 0; x < L; x += 150) d += `M${x} 0V150`; s += `<path d="${d}M0 70H${L}" stroke="#000" stroke-width="3" opacity="0.35"/>`;
      // Perspective : un couloir perpendiculaire qui s'enfonce (u ≈ 0.47).
      const cx = L * 0.47, cw = 380, vx = cx, vy = 470;
      s += `<rect x="${cx - cw / 2}" y="150" width="${cw}" height="615" fill="#0d1413"/>`;
      s += `<path d="M${cx - cw / 2} 150L${vx - 34} ${vy - 60}V${vy + 70}L${cx - cw / 2} 765z" fill="#1f2c2a"/><path d="M${cx + cw / 2} 150L${vx + 34} ${vy - 60}V${vy + 70}L${cx + cw / 2} 765z" fill="#182321"/>`;
      s += `<path d="M${cx - cw / 2} 765L${vx - 34} ${vy + 70}H${vx + 34}L${cx + cw / 2} 765z" fill="#151d1c"/><path d="M${cx - cw / 2} 150L${vx - 34} ${vy - 60}H${vx + 34}L${cx + cw / 2} 150z" fill="#0a0e0e"/>`;
      for (let k = 0; k < 5; k++) { const t = k / 5, y = 150 + (vy - 60 - 150) * (1 - Math.pow(0.55, k + 1)), w = cw * Math.pow(0.55, k + 1) * 0.5; s += `<rect class="neon neon-loin" x="${r1(vx - w / 2)}" y="${r1(y)}" width="${r1(w)}" height="${r1(Math.max(2, 10 * (1 - t)))}" fill="${NEON}" opacity="${0.8 - t * 0.5}"/>`; }
      s += `<rect x="${vx - 34}" y="${vy - 60}" width="68" height="130" fill="#050707"/>`;
      s += `<rect x="${vx - 18}" y="${vy - 52}" width="36" height="12" fill="#2f8a52" opacity="0.8"/>`;
      s += humain(vx + 6, vy + 66, 70, 'mort', { corps: '#030404' });
      // Portes de box.
      let n = 1;
      for (let x = 160; x < L - 100; x += 520) {
        if (Math.abs(x + 100 - cx) < 330) continue;
        const ouverte = rnd() < 0.3;
        s += `<rect x="${x}" y="330" width="210" height="432" fill="${ouverte ? '#070a0a' : '#6f8f87'}"/>`;
        if (!ouverte) s += `<path d="M${x + 105} 330v432" stroke="#2f3f3b" stroke-width="4"/><circle cx="${x + 55}" cy="430" r="26" fill="#1a2422"/><circle cx="${x + 155}" cy="430" r="26" fill="#1a2422"/><rect x="${x}" y="690" width="210" height="72" fill="#8a9a94" opacity="0.5"/>`;
        else s += `<path d="M${x + 210} 330l60 -14v460l-60 -14z" fill="#6f8f87"/><rect x="${x + 20}" y="600" width="120" height="16" fill="#1e2a28"/>`;
        s += `<rect x="${x + 50}" y="282" width="110" height="34" fill="#d8ddd6"/><text x="${x + 105}" y="308" font-family="Oswald, sans-serif" font-size="22" letter-spacing="3" text-anchor="middle" fill="#1a2422">BOX ${n}</text>`;
        n++;
      }
      s += `<rect x="${L * 0.62}" y="200" width="330" height="44" fill="#1d4a7a"/><text x="${L * 0.62 + 165}" y="231" font-family="Oswald, sans-serif" font-size="24" letter-spacing="3" text-anchor="middle" fill="#e6ecf0">SALLE 4 — PLÂTRES  →</text>`;
      // Traînée sombre au sol.
      s += `<path d="M${L * 0.3} 850q200 -20 420 10q-180 26 -420 -10z" fill="#3a1216" opacity="0.7"/>`;
      // Néons du plafond et leurs reflets sur le sol ciré.
      for (let x = 260; x < L; x += 640) {
        s += `<g class="neon" data-i="${x}">${halo(x + 80, 150, 520, 260, '#d9f0e6', 0.35)}<rect x="${x}" y="118" width="160" height="16" fill="${NEON}"/>`;
        s += `<ellipse cx="${x + 80}" cy="860" rx="180" ry="26" fill="#cfe8de" opacity="0.1"/><rect x="${x + 70}" y="770" width="20" height="200" fill="#cfe8de" opacity="0.06"/></g>`;
      }
      return s;
    } },
    { profondeur: 0.38, svg: (L) => {
      const rnd = alea('couloir-b');
      let s = '';
      for (let x = 120; x < L; x += 700 + rnd() * 300) {
        s += brancard(x, 830, 330, { drap: rnd() < 0.6 ? '#c9d0cb' : null, matelas: '#2f4744' });
        if (rnd() < 0.5) s += `<path d="M${x + 420} 830v-360M${x + 390} 470h60" stroke="#8d9894" stroke-width="5"/><path d="M${x + 440} 474q14 20 0 60q-12 -30 0 -60z" fill="#d9e4de" opacity="0.6"/>`;
      }
      // Fauteuil roulant.
      const fx = L * 0.72;
      s += `<circle cx="${fx}" cy="780" r="46" fill="none" stroke="#6d7874" stroke-width="7"/><path d="M${fx - 40} 740h90v-120M${fx - 40} 740v-50h70" stroke="#6d7874" stroke-width="7" fill="none"/><rect x="${fx - 44}" y="690" width="80" height="12" fill="#1c2322"/>`;
      s += `<rect x="-5" y="0" width="${L + 10}" height="1000" fill="#0c1413" opacity="0.18"/>`;
      return s;
    } },
    { profondeur: 0.66, svg: (L) => {
      // Chariot de soins et la clochette de bronze à manche de bois.
      const x = L * 0.3, y = 900;
      let s = `<g class="chariot">`;
      s += `<rect x="${x}" y="${y - 250}" width="300" height="14" fill="#a9b3ae"/><rect x="${x}" y="${y - 120}" width="300" height="12" fill="#8d9894"/>`;
      s += `<path d="M${x + 8} ${y - 250}v230M${x + 292} ${y - 250}v230" stroke="#8d9894" stroke-width="8"/>`;
      for (const cx of [x + 14, x + 286]) s += `<circle cx="${cx}" cy="${y - 10}" r="12" fill="#101413"/>`;
      s += `<rect x="${x + 30}" y="${y - 300}" width="90" height="50" fill="#dfe7e2"/><rect x="${x + 130}" y="${y - 286}" width="60" height="36" fill="#6b8fb8"/><rect x="${x + 40}" y="${y - 170}" width="120" height="50" fill="#c9d0cb"/><rect x="${x + 170}" y="${y - 160}" width="90" height="40" fill="#e6e0cc"/>`;
      s += `<path d="M${x + 150} ${y - 320}q10 -20 30 -18" stroke="#cfd6d2" stroke-width="3" fill="none"/>`;
      // Clochette.
      const bx = x + 235, by = y - 250;
      s += `<g class="clochette" data-x="${bx}" data-y="${by}">${halo(bx, by - 40, 70, 60, '#e8c070', 0.25)}<path d="M${bx - 30} ${by}c4 -10 14 -14 18 -38c2 -10 22 -10 24 0c4 24 14 28 18 38z" fill="#9c6a2a"/><path d="M${bx - 10} ${by - 30}c2 -6 8 -8 10 -8" stroke="#e0b060" stroke-width="3" fill="none"/><rect x="${bx - 5}" y="${by - 80}" width="10" height="42" rx="4" fill="#5a3a1e"/><circle cx="${bx}" cy="${by - 82}" r="7" fill="#6a4424"/></g>`;
      s += `</g>`;
      s += `<ellipse cx="${x + 150}" cy="${y + 4}" rx="190" ry="14" fill="#000" opacity="0.4"/>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      // Brancard de premier plan (en silhouette sur la photo).
      const x = L * 0.47, y = 900;   // relevé : l'action reste au-dessus des sous-titres
      let s = brancard(x - 40, y, 900, { matelas: '#1f2c2a' });
      s += `<path d="M${x - 40} ${y - 180}q480 -60 900 -20" stroke="#8c928d" stroke-width="4" fill="none" stroke-dasharray="10 5"/>`;
      return s;
    } },
    { profondeur: 1, naturel: { lum: 0.66, sat: 0.6 }, svg: (L) => {
      // Couleurs naturelles (pas de silhouette) : la housse, sa pochette porte-étiquette, le billet et la main.
      const x = L * 0.47, y = 900, px = L * 0.56;   // relevé : l'action reste au-dessus des sous-titres
      const ig = uid('hs'), ip = uid('pl');
      let s = `<defs>${degrade(ig, [[0, '#eef1ec'], [0.45, '#d6dbd5'], [1, '#9aa29b']])}${degrade(ip, [[0, '#ffffff', 0.5], [0.3, '#e8eef0', 0.2], [1, '#c8d2d4', 0.35]])}</defs>`;
      // housse : plastique épais, fermeture éclair sur le dessus, plis
      s += gisant(x - 60, y - 88, 960, `url(#${ig})`, { housse: true });
      s += `<path d="M${x - 10} ${y - 232}c150 -26 420 -34 620 -40c120 -4 220 2 300 16" stroke="#4a504c" stroke-width="7" fill="none" stroke-dasharray="3 4" opacity="0.8"/>`;
      s += `<path d="M${x + 60} ${y - 120}q60 -40 140 -30M${x + 300} ${y - 210}q30 50 10 110M${x + 560} ${y - 200}q-30 60 20 120M${x + 760} ${y - 150}q50 -20 100 0" stroke="#8d958f" stroke-width="5" fill="none" opacity="0.55" stroke-linecap="round"/>`;
      s += `<path d="M${x + 40} ${y - 200}q200 -40 420 -46" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.35" stroke-linecap="round"/>`;
      // pochette : dos (l'étiquette dedans), puis le billet libre, la main, et le devant transparent
      s += `<rect x="${px - 80}" y="${Y_POCHE}" width="160" height="86" rx="4" fill="#b9c1bb"/>`;
      s += `<rect x="${px - 66}" y="${Y_POCHE + 22}" width="132" height="56" fill="#f2ecd6"/><path d="M${px - 56} ${Y_POCHE + 38}h90M${px - 56} ${Y_POCHE + 52}h112M${px - 56} ${Y_POCHE + 66}h70" stroke="#6a6458" stroke-width="3"/>`;
      const Mp = formesMain(POSES_MAIN.pince), Bp = formesBillet(Mp);
      s += `<g class="billet-libre" opacity="0"><path d="${Bp.billet}" fill="#efe9d8"/><path d="${Bp.pliBillet}" stroke="#b6ad96" stroke-width="2" fill="none"/></g>`;
      s += `<g class="main-billet" data-px="${r1(px)}">${svgBrasMain({ id: uid('mn') })}</g>`;
      s += `<rect x="${px - 80}" y="${Y_POCHE}" width="160" height="86" rx="4" fill="url(#${ip})" stroke="#e9eef0" stroke-width="2.5" class="poche-avant"/>`;
      s += `<path d="M${px - 78} ${Y_POCHE + 2}h156" stroke="#ffffff" stroke-width="3" opacity="0.7"/><path d="M${px - 60} ${Y_POCHE + 12}l30 64" stroke="#ffffff" stroke-width="6" opacity="0.18"/>`;
      return s;
    } },
  ],
  anims: {
    neon_clignote(t, S) {
      S.q('.neon').forEach((el, i) => {
        const panne = i === 2 || i === 5;
        const v = panne ? ((Math.sin(t * 23) > 0.6 || (t % 3.1) < 0.35) ? 0.15 : 1) : 0.92 + 0.08 * Math.sin(t * 50 + i);
        S.attr(el, 'opacity', v.toFixed(2));
      });
    },
    clochette_tremble(t, S) {
      const salve = (t % 2.6) < 0.8 ? 1 : 0.15;
      for (const el of S.q('.clochette')) S.attr(el, 'transform', `rotate(${(Math.sin(t * 60) * 2.2 * salve).toFixed(2)} ${el.dataset.x} ${el.dataset.y})`);
    },
    main_billet(t, S) {
      // La main approche, hésite, glisse le billet dans la pochette, ouvre les doigts, remonte et s'en va.
      const tp = S.tp;
      const e = etatMain(tp);
      for (const grp of S.q('.main-billet')) {
        const px = +grp.dataset.px, wx = px + e.x, wy = e.y;
        const bras = grp.__bras || (grp.__bras = grp.querySelector('.bras-rig')), main = grp.__main || (grp.__main = grp.querySelector('.main-rig'));
        S.attr(bras, 'transform', `translate(${r1(wx)},${r1(wy)}) rotate(${(e.a + 9).toFixed(2)}) scale(${ECH_MAIN})`);
        S.attr(main, 'transform', `translate(${r1(wx)},${r1(wy)}) rotate(${e.a.toFixed(2)}) scale(${ECH_MAIN})`);
        // les doigts ne sont recalculés que s'ils bougent
        const cle = e.g.doigts.flat().concat(e.g.pouce).map(v => v.toFixed(1)).join(',') + (e.lache ? 'l' : '');
        if (grp.__cle !== cle) { grp.__cle = cle; poserMain(main, e.g, !e.lache); }
        // le billet lâché reste dans la pochette et glisse au fond
        if (!grp.__libre) grp.__libre = grp.parentNode.querySelector('.billet-libre');
        const lib = grp.__libre;
        if (e.lache) {
          if (!grp.__pose) { const r = etatMain(6.15); grp.__pose = { x: px + r.x, y: r.y, a: r.a }; }
          const k = ease((tp - 6.15) / 0.6), P = grp.__pose;
          S.attr(lib, 'transform', `translate(${r1(P.x - 6 * k)},${r1(P.y + 34 * k)}) rotate(${(P.a + 8 * k).toFixed(2)}) scale(${ECH_MAIN})`);
          S.attr(lib, 'opacity', '1');
        } else { grp.__pose = null; S.attr(lib, 'opacity', '0'); }
      }
    },
  },
};
