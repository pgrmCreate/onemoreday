// Base aérienne 701, jour de chaleur. Ciel blanc, tour de contrôle, hangars, grillage ; neuf Alphajets tricolores
// alignés, verrières fermées ; au rond-point, le Fouga Magister sur son mât, un corps en uniforme pendu au bout de
// l'aile ; sur le parking, trois cents paires de rangers alignées.
import { alea, ciel, halo, r1, massif, brume, avion, humain, sol, degrade, uid, voile, herbes } from '../lib.js';


export default {
  largeur: 2.3,
  fond: '#e2dccb',
  reglages: { poussiere: '#efe6cc' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#b8c2c6'], [0.5, '#e2dccb'], [1, '#f4efe0']]) + halo(L * 0.5, 200, 1400, 500, '#ffffff', 0.5) + massif(L, 640, 70, 'ba-coll', '#b8b49e', { rugosite: 0.4 }) + brume(L, 520, 700, '#f4efe0', 0, 0.6, 0.3) },
    { profondeur: 0.25, svg: (L) => {
      const rnd = alea('ba-fond');
      let s = sol(L, 690, [[0, '#cfc6ac'], [1, '#bcb296']]);
      // Hangars arrondis.
      for (const [u, w] of [[0.1, 420], [0.34, 520], [0.82, 460]]) { const x = L * u; s += `<path d="M${x} 700V600a${w / 2} 120 0 0 1 ${w} 0V700z" fill="#a8a898"/><path d="M${x + w * 0.2} 700V620h${w * 0.6}V700z" fill="#3a3a36"/><path d="M${x} 600a${w / 2} 120 0 0 1 ${w} 0" stroke="#c8c6b6" stroke-width="6" fill="none"/>`; }
      // Tour de contrôle.
      const tx = L * 0.6;
      s += `<rect x="${tx - 30}" y="420" width="60" height="280" fill="#c9c4b2"/><path d="M${tx - 70} 420h140l-14 -70h-112z" fill="#3a4a54"/><rect x="${tx - 76}" y="340" width="152" height="12" fill="#e8e4d6"/><path d="M${tx} 340v-50" stroke="#6a6a64" stroke-width="4"/>`;
      // Miradors vides et grillage.
      for (const u of [0.05, 0.48, 0.95]) { const x = L * u; s += `<path d="M${x - 20} 700l12 -170M${x + 20} 700l-12 -170M${x - 14} 620h28" stroke="#6a6a60" stroke-width="5"/><rect x="${x - 24}" y="500" width="48" height="34" fill="#8a8a7c"/><path d="M${x - 30} 500h60l-10 -18h-40z" fill="#6a6a60"/>`; }
      let g = ''; for (let x = 0; x < L; x += 14) g += `M${x} 700l14 -60M${x + 14} 700l-14 -60`;
      s += `<path d="${g}" stroke="#7a7a70" stroke-width="1.5" opacity="0.5"/><path d="M0 640H${L}" stroke="#7a7a70" stroke-width="3"/>`;
      s += `<g class="manche" data-x="${L * 0.7}" data-y="560"><path d="M${L * 0.7} 700V560" stroke="#6a6a60" stroke-width="5"/><path d="M${L * 0.7} 560l70 6v18l-70 6z" fill="#e0602a"/><path d="M${L * 0.7 + 24} 562v26M${L * 0.7 + 48} 564v22" stroke="#f4efe0" stroke-width="7"/></g>`;
      return s + voile(L, '#f4efe0', 0.25);
    } },
    { profondeur: 0.5, svg: (L) => {
      let s = sol(L, 760, [[0, '#8a877c'], [1, '#6a675e']]);
      for (let i = 0; i < 9; i++) {
        const x = L * (0.26 + i * 0.066), y = 800;
        s += `<ellipse cx="${x + 110}" cy="${y + 34}" rx="120" ry="10" fill="#000" opacity="0.2"/>`;
        s += avion(x, y, 240, '#2c4f8f', 'chasseur', { cocarde: true, verriere: '#16202c' });
        s += `<path d="M${x + 20} ${y + 2}h180" stroke="#e8e4d6" stroke-width="5"/><path d="M${x + 20} ${y + 8}h180" stroke="#b8322c" stroke-width="5"/>`;
        s += `<path d="M${x + 60} ${y + 12}v22M${x + 170} ${y + 12}v22" stroke="#2a2a2a" stroke-width="5"/>`;
      }
      // Drapeau au mât.
      const fx = L * 0.22;
      s += `<path d="M${fx} 780V470" stroke="#8a8a84" stroke-width="6"/><g class="drapeau" data-x="${fx}" data-y="480"><rect x="${fx}" y="480" width="40" height="70" fill="#284c73"/><rect x="${fx + 40}" y="480" width="40" height="70" fill="#e8e4d6"/><rect x="${fx + 80}" y="480" width="40" height="70" fill="#b8322c"/></g>`;
      return s;
    } },
    { profondeur: 0.75, svg: (L) => {
      // Le rond-point de l'École de l'air : le Fouga pointé vers le ciel, un corps pendu à l'aile.
      const x = L * 0.12;
      let s = `<ellipse cx="${x}" cy="900" rx="300" ry="50" fill="#8a8a60"/><path d="M${x} 900V420" stroke="#7a7a74" stroke-width="22"/>`;
      s += `<g transform="rotate(-18 ${x} 420)">${avion(x - 330, 432, 640, '#d8d4c8', 'fouga', { cocarde: true, verriere: '#2a3440' })}<path d="M${x - 60} 436h180" stroke="#c83a2a" stroke-width="6"/></g>`;
      const ax = x + 250, ay = 340;
      s += `<g class="pendu" data-x="${ax}" data-y="${ay}"><path d="M${ax} ${ay}v140" stroke="#3a3228" stroke-width="3"/>${humain(ax, ay + 360, 230, { pench: 0, tete: 32, jambes: [[2, 0], [-2, 2]], bras: [[4, 2], [-4, 2]] }, { corps: '#4a5238', jambes: '#3a4030', tete: '#3a3228' })}</g>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      // Parking : rangers alignées par pointure, en perspective.
      let s = sol(L, 900, [[0, '#4a4842'], [1, '#2e2c28']]);
      s += `<path d="M${L * 0.7} 910H${L}" stroke="#e8e4d6" stroke-width="5" stroke-dasharray="70 40"/>`;
      let d = '', g = '';
      s += `<path d="M${L * 0.84} 1010L${L * 0.87} 720H${L + 10}V1010z" fill="#3a3834"/>`;
      for (let r = 0; r < 7; r++) {
        const y = 740 + r * 14 + r * r * 1.5, k = 0.5 + r * 0.1;
        for (let x = L * 0.875 - r * 6; x < L - 10; x += 30 * k) {
          d += `M${r1(x)} ${r1(y)}v${r1(-18 * k)}h${r1(8 * k)}v${r1(10 * k)}l${r1(8 * k)} ${r1(4 * k)}v${r1(4 * k)}zM${r1(x + 14 * k)} ${r1(y)}v${r1(-18 * k)}h${r1(8 * k)}v${r1(10 * k)}l${r1(8 * k)} ${r1(4 * k)}v${r1(4 * k)}z`;
          g += `M${r1(x + 3 * k)} ${r1(y - 14 * k)}h${r1(3 * k)}`;
        }
      }
      s += `<path d="${d}" fill="#0c0c0c"/><path class="reflets-rangers" d="${g}" stroke="#f4efe0" stroke-width="2" opacity="0.5"/>`;
      s += herbes(L * 0.6, 1000, alea('ba-h'), '#8a8454', { densite: 0.2, hMax: 60, epais: 3 });
      return s;
    } },
  ],
  ambiance: ['drapeau_mat'],
  anims: {
    fouga_mat(t, S) {},
    corps_balance(t, S) { for (const el of S.q('.pendu')) S.attr(el, 'transform', `rotate(${(Math.sin(t * 1.1) * 3.5).toFixed(2)} ${el.dataset.x} ${el.dataset.y})`); },
    manche_a_air(t, S) { for (const el of S.q('.manche')) S.attr(el, 'transform', `rotate(${(Math.sin(t * 2.3) * 6 + Math.sin(t * 5) * 2).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`); },
    drapeau_mat(t, S) { for (const el of S.q('.drapeau')) { const x = el.dataset.x, y = el.dataset.y; S.attr(el, 'transform', `translate(${x},${y}) skewY(${(Math.sin(t * 3.2) * 5).toFixed(1)}) scale(${(0.94 + 0.06 * Math.cos(t * 2.1)).toFixed(3)},1) translate(${-x},${-y})`); } },
    rangers_alignees(t, S) { for (const el of S.q('.reflets-rangers')) S.attr(el, 'opacity', (0.3 + 0.3 * Math.sin(t * 2.4)).toFixed(2)); },
  },
};
