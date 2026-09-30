// Même cours Carnot, 10 h 51 : la panique. Ciel voilé, couleurs lavées, étals renversés, gyrophare au loin.
import { alea, etal, humain, halo, r1, mix, sombre, gisant, uid, radial } from '../lib.js';
import { passant, animerPassants, onduler, ease } from '../anim.js';
import { MATIN, coucheCiel, coucheFacades, couchePlatanes, coucheVoute } from './_cours.js';

const P = Object.assign({}, MATIN, {
  ciel: [[0, '#8c8f8a'], [0.5, '#b3ad98'], [0.85, '#cfc4a4'], [1, '#d8caa4']],
  soleil: [0.3, 160, '#fff1c8', 0.25], nuages: '#e8e2d2', nuagesO: 0.5, ventreNuages: '#9a978c',
  lointain: '#9a9c94', rocher: '#a9a79c', tonalite: ['#77756c', 0.35], voileFond: ['#c9c2aa', 0.3],
  feuille: ['#39432a', '#4f5b35', '#6f7a4c'], tronc: '#98917e', sol: [[0, '#b8ad96'], [0.3, '#948a78'], [1, '#5a5248']],
  rayons: '#f4ead0', rayonsO: 0.06, tachesSol: null, trous: '#c9c6b8',
});
const HAUTS = ['#8e2a26', '#bdb3a0', '#4e6474', '#5a6b3e', '#a88450', '#2a2e36', '#6a4052', '#d6d0c2', '#8a5a3a', '#3a5a64'];
const BAS = ['#2a3242', '#8f846e', '#222226', '#3c444c'];
const PEAUX = ['#b8927a', '#9a765e', '#cfb09a', '#6e4e3a'];
const CHEV = ['#2a1e16', '#3a2a1e', '#1a1614', '#7a6248', '#b8b0a2'];

function fruitsEcrases(L, rnd, y0, y1, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * L, y = y0 + rnd() * (y1 - y0), r = 6 + rnd() * 14, c = rnd.choix(['#b8502a', '#d27a3a', '#8e1b24', '#c9a040', '#6a2a3a']);
    s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(r * 1.8)}" ry="${r1(r * 0.5)}" fill="${c}" opacity="0.75"/><circle cx="${r1(x + r)}" cy="${r1(y - 2)}" r="${r1(r * 0.35)}" fill="${c}"/>`;
  }
  return s;
}

export default {
  largeur: 2.6,
  fond: '#b3ad98',
  reglages: { poussiere: '#d8cbb0' },
  couches: [
    { profondeur: 0, svg: coucheCiel(P, 'cours') },
    { profondeur: 0.28, svg: (L, H) => {
      let s = coucheFacades(P, 'cours')(L, H);
      // Gyrophare bleu loin dans la rue.
      const gx = L * 0.58;
      s += `<g class="gyro" opacity="0">${halo(gx, 660, 160, 90, '#3a7cff', 0.7)}<rect x="${gx - 6}" y="652" width="12" height="7" fill="#bcd4ff"/></g>`;
      s += `<path d="M${gx - 40} 700h80v-26l-10 -12h-50l-10 12z" fill="#e8e6e0"/><path d="M${gx - 40} 684h80" stroke="#2a5aa8" stroke-width="5"/>`;
      return s;
    } },
    { profondeur: 0.48, svg: couchePlatanes(P, 'cours', { voute: false }) },
    { profondeur: 0.48, nom: 'voute', svg: coucheVoute(P, 'cours') },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('marche-etals'); // mêmes étals qu'au marché
      let s = `<rect x="-5" y="850" width="${L + 10}" height="160" fill="#2a241c" opacity="0.2"/>`;
      s += fruitsEcrases(L, rnd, 900, 990, Math.round(L / 60));
      let x = L * 0.12, i = 0, fait = false;
      const contenus = ['peches', 'fromages', 'fleurs', 'legumes', 'olives', 'peches', 'legumes'];
      while (x < L - 200) {
        const w = 260 + rnd() * 110;
        const e = etal(x, 890, w, rnd, { contenu: rnd.choix(contenus), teinte: ['#7a766c', 0.35], sansBache: i % 3 === 1 });
        const bascule = !fait && x / L > 0.56; if (bascule) fait = true;
        if (bascule) s += `<g class="etal-bascule" data-x="${r1(x + w)}" data-y="890">${e}</g>`;
        else if (i % 4 === 2) s += `<g transform="rotate(-78 ${r1(x)} 890)" opacity="0.95">${e}</g>`;
        else s += e;
        if (i % 3 === 1) { const by = 890 - w * 0.72 - 30; let d = ''; for (let k = 0; k < 5; k++) d += `M${r1(x + k * w / 5)} ${r1(by)}l${r1(w / 5)} 0l${r1(-w * 0.06)} ${r1(60 + k * 22)}l${r1(-w * 0.08)} ${r1(-30)}z`; s += `<path class="bache-dechiree" d="${d}" fill="#7a2a24" opacity="0.85"/>`; }
        x += w + 60 + rnd() * 160; i++;
      }
      // Corps à terre, chaussures, cabas perdus.
      for (let k = 0; k < 4; k++) s += gisant(L * (0.2 + k * 0.22 + rnd() * 0.05), 975, 170, '#2a2622');
      for (let k = 0; k < 30; k++) s += `<ellipse cx="${r1(rnd() * L)}" cy="${r1(930 + rnd() * 60)}" rx="10" ry="5" fill="#1c1a18"/>`;
      return s;
    } },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('merc-fuite'); let s = '';
      // Foule qui fuit dans les deux sens.
      for (let k = 0; k < 30; k++) {
        const h = 270 + rnd() * 40, v = (rnd() < 0.5 ? -1 : 1) * (170 + rnd() * 150);
        s += passant(rnd() * L, 955 + rnd() * 35, h, { v, L, pose: 'court', corps: rnd.choix(HAUTS), jambes: rnd.choix(BAS), tete: rnd.choix(PEAUX), cheveux: rnd.choix(CHEV) });
      }
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('mercredi-pp');
      let s = '';
      // La silhouette penchée sur une autre : lecture floue, contre-jour.
      const px = L * 0.71;
      s += `<ellipse cx="${r1(px + 40)}" cy="1000" rx="340" ry="40" fill="#000" opacity="0.35"/>`;
      s += gisant(px - 180, 995, 440, '#1d1a18');
      s += `<g class="penchee" data-x="${r1(px + 60)}" data-y="760">${humain(px + 70, 1000, 560, 'penche', { corps: '#2a2320', jambes: '#1a1716', tete: '#1f1a18', sens: -1, cheveux: '#120f0e', cheveuxLongs: true })}</g>`;
      s += `<path d="M${r1(px - 120)} 985q60 -10 120 4q-40 12 -120 -4z" fill="#5a0f14" opacity="0.8"/>`;
      for (let k = 0; k < 11; k++) {
        const h = 500 + rnd() * 90, v = (rnd() < 0.5 ? -1 : 1) * (320 + rnd() * 200);
        s += passant(rnd() * L, 1040 + rnd() * 40, h, { v, L, pose: 'court', corps: sombre(rnd.choix(HAUTS), 0.25), jambes: sombre(rnd.choix(BAS), 0.2), tete: sombre(rnd.choix(PEAUX), 0.25), cheveux: rnd.choix(CHEV) });
      }
      return s;
    } },
    { profondeur: 1.25, svg: (L) => {
      const rnd = alea('merc-fl'); const id = uid('fl');
      let s = `<defs>${radial(id, [[0, '#1c2014', 0.95], [0.7, '#1c2014', 0.5], [1, '#1c2014', 0]])}</defs><g class="feuilles-pp">`;
      for (let x = rnd() * 400; x < L; x += 800 + rnd() * 900) for (let k = 0; k < 6; k++) s += `<ellipse cx="${r1(x + (rnd() - 0.5) * 380)}" cy="${r1(-20 + rnd() * 100)}" rx="${r1(90 + rnd() * 80)}" ry="${r1(50 + rnd() * 40)}" fill="url(#${id})"/>`;
      return s + '</g>';
    } },
  ],
  ambiance: ['gyrophare'],
  anims: {
    foule_court(t, S) { animerPassants(t, S, '.passant', { marge: 400 }); S.decaler('voute', Math.sin(t * 0.8) * 6, 0); },
    etals_renverses(t, S) {
      const k = ease((S.tp - 1.2) / 0.9);
      const a = k * 84 - (k >= 1 ? Math.sin((S.tp - 2.1) * 14) * Math.exp(-(S.tp - 2.1) * 5) * 5 : 0);
      for (const el of S.q('.etal-bascule')) S.attr(el, 'transform', `rotate(${a.toFixed(1)} ${el.dataset.x} ${el.dataset.y})`);
      onduler(t, S, '.bache-dechiree', 3, 2, 0.8);
    },
    silhouette_penchee(t, S) {
      // Mouvement de tête saccadé : des à-coups secs, puis immobilité.
      const cyc = t % 1.3, j = cyc < 0.18 ? Math.sin(cyc / 0.18 * Math.PI * 3) * 6 : 0;
      for (const el of S.q('.penchee')) S.attr(el, 'transform', `rotate(${j.toFixed(1)} ${el.dataset.x} ${el.dataset.y}) translate(0,${(Math.sin(t * 1.4) * 4).toFixed(1)})`);
    },
    gyrophare(t, S) { for (const el of S.q('.gyro')) S.attr(el, 'opacity', (Math.sin(t * 11) > 0.2 ? 1 : 0.15).toFixed(2)); },
  },
};
