// Vignette — la montée du Puech : galets, deux murs, grilles du lycée, banderole « BIENVENUE AUX SECONDES », porte
// du château doublée de palettes, ronces sous le rempart.
import { alea, ciel, r1, halo, touffe, grilleFer, creneaux, voile, nuages } from '../lib.js';
import { onduler } from '../anim.js';

export default {
  largeur: 1.1,
  fond: '#8a94a0',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#5a6a80'], [1, '#c8c0b0']]) + nuages(L, 40, 200, 5, 'puech-n', '#e0dcd4', 0.5) },
    { profondeur: 0.35, svg: (L) => {
      const c = L / 2, mur = '#a89878';
      let s = `<path d="M${c - 700} 700V180H${c + 700}V700z" fill="${mur}"/>` + creneaux(c - 700, 180, 1400, 30, mur);
      s += `<path d="M${c - 150} 700V420a150 150 0 0 1 300 0V700z" fill="#2a2018"/>`;
      s += `<g fill="#6a4a2e">${Array.from({ length: 4 }, (_, k) => `<rect x="${c - 140 + k * 72}" y="440" width="64" height="260"/>`).join('')}</g><path d="M${c - 140} 500h280M${c - 140} 600h280" stroke="#4a3220" stroke-width="10"/>`;
      s += `<path d="M${c - 700} 700q300 -10 400 20" fill="none"/>`;
      return s;
    } },
    { profondeur: 0.65, svg: (L) => {
      const c = L / 2, rnd = alea('puech');
      // Montée pavée de galets entre deux murs.
      let s = `<path d="M${c - 380} 1010L${c - 160} 700H${c + 160}L${c + 380} 1010z" fill="#8a8272"/>`;
      let d = ''; for (let i = 0; i < 260; i++) { const y = 700 + Math.pow(rnd(), 0.8) * 310, w = 160 + (y - 700) * 0.7, x = c - w + rnd() * w * 2, r = 3 + (y - 700) / 40; d += `M${r1(x)} ${r1(y)}a${r1(r * 1.3)} ${r1(r)} 0 1 0 0.1 0z`; }
      s += `<path d="${d}" fill="#6a6456"/>`;
      s += `<path d="M-10 1010V640L${c - 180} 690L${c - 400} 1010z" fill="#9a8a70"/><path d="M${L + 10} 1010V640L${c + 180} 690L${c + 400} 1010z" fill="#8a7a60"/>`;
      // Grilles du lycée et banderole.
      s += grilleFer(c + 420, 520, 600, 200, '#1c1c1e', 26, 5);
      s += `<g class="banderole" data-x="${c + 720}" data-y="560"><path d="M${c + 440} 560h560v70h-560z" fill="#e8e4da"/><text x="${c + 720}" y="606" font-family="Oswald, sans-serif" font-size="32" letter-spacing="3" text-anchor="middle" fill="#2a4a8a">BIENVENUE AUX SECONDES</text></g>`;
      for (let x = -40; x < c - 300; x += 60) s += touffe(x, 640 + rnd() * 30, 50, '#2a3420', rnd, 14);
      return s;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#1a1c22', 0.12) },
  ],
  ambiance: ['vent'],
  anims: { vent(t, S) { for (const el of S.q('.banderole')) S.attr(el, 'transform', `translate(0,${(Math.sin(t * 2.2) * 3).toFixed(1)})`); } },
};
