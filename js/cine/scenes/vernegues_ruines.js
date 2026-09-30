// Vieux-Vernègues, la nuit. Ciel étoilé sur une plaine sans une lumière ; la dent du château ruiné ; l'église sans
// toit, ses arcs sans voûte, et sur le mur, à la chaux : UN POUR UN. Figuiers, bouches de caves, des centaines de
// bougies ; des revenus assis entre les ruines, qui jouent aux cartes.
import { alea, ciel, etoiles, halo, r1, massif, brume, humain, touffe, radial, uid, voile } from '../lib.js';
import { scintiller, ease } from '../anim.js';

const PIERRE = '#2a2c36', PIERRE2 = '#383a46', BOUGIE = '#f0c26a';

function bougies(pts) {
  const id = uid('bg');
  let s = `<defs>${radial(id, [[0, BOUGIE, 0.55], [0.4, BOUGIE, 0.18], [1, BOUGIE, 0]])}</defs>`;
  let h = '', f = '';
  for (const [x, y, k] of pts) {
    h += `<circle cx="${r1(x)}" cy="${r1(y - 6 * k)}" r="${r1(40 * k)}" fill="url(#${id})"/>`;
    f += `M${r1(x)} ${r1(y)}v${r1(-10 * k)}`;
  }
  return s + `<g class="bougies">${h}</g><path d="${f}" stroke="#e8e0cc" stroke-width="3"/><path class="flammes-b" d="${pts.map(([x, y, k]) => `M${r1(x)} ${r1(y - 10 * k)}q-2 -6 0 -10q2 4 0 10z`).join('')}" fill="#ffe7a0" stroke="#ffd070" stroke-width="2"/>`;
}

export default {
  largeur: 2.2,
  fond: '#0b0d16',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#04050a'], [0.6, '#0e1222'], [1, '#1a1e30']]) + etoiles(L, 650, 360, 'vernegues') + massif(L, 720, 40, 'vg-plaine', '#0a0c14') + brume(L, 640, 760, '#1c2236', 0, 0.5, 0) },
    { profondeur: 0.22, svg: (L) => {
      // La dent du château ruiné sur son éperon.
      const x = L * 0.3;
      let s = massif(L, 780, 90, 'vg-colline', '#10121c');
      s += `<path d="M${x - 80} 700V380l30 -20l10 30l20 -60l30 40v330z" fill="#161822"/><path d="M${x - 40} 480h16v40h-16z" fill="#05060a"/>`;
      s += `<path d="M${x + 40} 700v-120h60v-30h30v150z" fill="#141620"/>`;
      return s;
    } },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('vg-eglise');
      // Maisons effondrées, murs à jour.
      let s = '';
      for (let x = -40; x < L; x += 260 + rnd() * 200) {
        const w = 180 + rnd() * 120, h = 180 + rnd() * 200;
        s += `<path d="M${r1(x)} 900V${r1(900 - h)}l${r1(w * 0.3)} ${r1(-rnd() * 40)}l${r1(w * 0.3)} ${r1(60 + rnd() * 60)}l${r1(w * 0.4)} ${r1(-rnd() * 40)}V900z" fill="${PIERRE}"/>`;
        s += `<rect x="${r1(x + w * 0.3)}" y="${r1(900 - h * 0.6)}" width="${r1(w * 0.2)}" height="${r1(h * 0.3)}" fill="#07080c"/>`;
      }
      // L'église : façade sans toit, arcs sans voûte, clocher-mur.
      const ex = L * 0.8;
      s += `<path d="M${ex - 420} 900V440h260l60 -60h60l60 60h240V900z" fill="${PIERRE2}"/>`;
      for (let k = 0; k < 4; k++) s += `<path d="M${ex - 380 + k * 190} 900V600a70 70 0 0 1 140 0V900z" fill="#0a0c14"/>`;
      s += `<path d="M${ex - 90} 380v-120h180v120" fill="none" stroke="${PIERRE2}" stroke-width="30"/><path d="M${ex - 60} 360v-70a60 60 0 0 1 120 0v70" fill="#0a0c14"/>`;
      // Inscription à la chaux.
      s += `<g class="chaux"><text x="${ex + 150}" y="560" font-family="Special Elite, monospace" font-size="72" text-anchor="middle" fill="#e6e2d6" opacity="0.85" transform="rotate(-2 ${ex + 150} 560)">UN POUR UN</text>`;
      s += `<path d="M${ex + 10} 575q4 30 0 60M${ex + 250} 575q2 20 0 40" stroke="#e6e2d6" stroke-width="4" opacity="0.5"/></g>`;
      s += `<ellipse class="lueur-chaux" cx="${ex}" cy="540" rx="120" ry="90" fill="#f0d8a0" opacity="0"/>`;
      // Bougies dans les niches et sur les murs.
      const pts = [];
      for (let i = 0; i < 160; i++) pts.push([rnd() * L, 600 + rnd() * 300, 0.8 + rnd() * 0.4]);
      for (let k = 0; k < 4; k++) for (let j = 0; j < 8; j++) pts.push([ex - 380 + k * 190 + 20 + j * 13, 895, 1]);
      s += bougies(pts);
      return s;
    } },
    { profondeur: 0.75, svg: (L) => {
      const rnd = alea('vg-fig');
      let s = '';
      for (let x = rnd() * 400; x < L; x += 600 + rnd() * 500) s += touffe(x, 780, 160, '#0c1210', rnd, 40) + touffe(x + 40, 740, 110, '#121a16', rnd, 24) + `<path d="M${r1(x)} 960q-10 -80 10 -160" stroke="#0a0c0c" stroke-width="20"/>`;
      s += `<rect x="-5" y="930" width="${L + 10}" height="80" fill="#0c0d14"/>`;
      // Bouches de caves au ras du sol, lueur ambrée.
      for (let x = 200; x < L; x += 700 + rnd() * 300) s += halo(x + 60, 950, 120, 40, BOUGIE, 0.5) + `<path d="M${x} 960q60 -60 120 0z" fill="#e8a040" opacity="0.6"/>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('vg-revenus');
      let s = '';
      // Murets et bougies du premier plan.
      s += `<path d="M-10 1010V930H${L * 0.3}V950H${L * 0.62}V920H${L + 10}V1010Z" fill="#12131a"/>`;
      const pts = [];
      for (let i = 0; i < 60; i++) { const x = rnd() * L; pts.push([x, x < L * 0.3 ? 930 : x < L * 0.62 ? 950 : 920, 1.4 + rnd() * 0.5]); }
      s += bougies(pts);
      // Revenus assis en cercle, cartes.
      for (const cx of [L * 0.2, L * 0.5, L * 0.78]) {
        s += halo(cx, 880, 220, 90, BOUGIE, 0.35);
        s += `<ellipse cx="${cx}" cy="905" rx="70" ry="12" fill="#2a2418"/><path d="M${cx - 20} 898l14 -3l2 6l-14 3zM${cx + 10} 900l14 -2l1 6l-14 2z" fill="#e6e0d0"/>`;
        for (const [dx, sens] of [[-190, 1], [150, -1], [-40, 1]]) s += `<g class="revenu" data-p="${r1(rnd() * 6)}">${humain(cx + dx, 930, 300, 'assis', { corps: '#0a0b10', sens })}</g>`;
      }
      return s + voile(L, '#05060a', 0.15);
    } },
  ],
  ambiance: ['bougies_vacillent'],
  anims: {
    bougies_vacillent(t, S) { scintiller(t, S, '.bougies', 0.7, 1, 13); scintiller(t, S, '.flammes-b', 0.75, 1, 17); },
    revenus_assis(t, S) { S.q('.revenu').forEach((el, i) => { const p = +el.dataset.p; S.attr(el, 'transform', `translate(${(Math.sin(t * 0.5 + p) * 3).toFixed(1)},${(Math.max(0, Math.sin(t * 0.9 + p * 2)) * -4).toFixed(1)})`); }); },
    inscription_chaux(t, S) {
      for (const el of S.q('.lueur-chaux')) {
        const k = ease(S.tp / 4.5);
        S.attr(el, 'opacity', (0.22 * Math.sin(k * Math.PI)).toFixed(3));
        S.attr(el, 'transform', `translate(${r1(k * 320)},0)`);
      }
    },
  },
};
