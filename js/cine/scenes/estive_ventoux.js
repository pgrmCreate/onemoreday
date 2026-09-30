// Fin C, l'estive. Le Ventoux au sommet blanc comme un os, les pentes et les alpages, le troupeau qui monte en file ;
// au premier plan, des silhouettes qui se redressent et regardent leurs mains. Lumière d'aube froide.
import { alea, ciel, halo, r1, massif, brume, humain, herbes, nuages, degrade, uid, pin, lerp, cloche } from '../lib.js';
import { onduler, ease } from '../anim.js';

export default {
  largeur: 2.2,
  fond: '#aab4c0',
  reglages: { brouillard: '#e0e6ea' },
  couches: [
    { profondeur: 0, svg: (L) => {
      let s = ciel(L, [[0, '#6a7a92'], [0.5, '#aab4c0'], [0.85, '#e8d8c8'], [1, '#f4e4d0']]) + halo(L * 0.2, 640, 800, 240, '#fff0dc', 0.5);
      s += nuages(L, 80, 300, 10, 'vx-n', '#f0f0f4', 0.45, '#9aa4b4');
      // Le Ventoux : longue croupe, sommet pelé blanc.
      const sx = L * 0.72;
      s += `<path d="M-20 700L${L * 0.2} 560Q${sx - 300} 250 ${sx} 190Q${sx + 300} 240 ${L * 1.02} 520V760H-20Z" fill="#5a6478"/>`;
      s += `<path d="M${sx} 190Q${sx + 300} 240 ${L * 1.02} 520V760H${sx + 120}Q${sx + 60} 400 ${sx} 190z" fill="#3e4658" opacity="0.5"/>`;
      { // Pierrier blanc du sommet : suit la crête, bord inférieur irrégulier.
        const r2 = alea('vx-pierrier');
        const q = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
        const haut = [];
        for (let t = 0.55; t <= 1.001; t += 0.05) haut.push([q(L * 0.2, sx - 300, sx, t), q(560, 250, 190, t)]);
        for (let t = 0.05; t <= 0.5; t += 0.05) haut.push([q(sx, sx + 300, L * 1.02, t), q(190, 240, 520, t)]);
        let d = `M${haut.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L')}`;
        for (let i = haut.length - 1; i >= 0; i--) { const [x, y] = haut[i]; const prof = 10 + 120 * Math.pow(Math.sin((i / (haut.length - 1)) * Math.PI), 1.6); d += `L${r1(x + (r2() - 0.5) * 20)} ${r1(y + prof + r2() * 30 + (r2() < 0.2 ? 25 : 0))}`; }
        let str = ''; for (let i = 0; i < 26; i++) { const t = r2(), p = haut[Math.floor(t * haut.length)]; str += `M${r1(p[0])} ${r1(p[1] + 12)}l${r1((r2() - 0.5) * 14)} ${r1(10 + r2() * 30)}`; }
        const idc = uid('cap'); s += `<defs>${degrade(idc, [[0, '#f6f4ee'], [0.6, '#dcd8d0'], [1, '#b8b8b8']])}</defs><g class="sommet"><path d="${d}Z" fill="url(#${idc})"/><path d="${str}" stroke="#c9c5bd" stroke-width="4" opacity="0.7"/>${halo(sx, 230, 320, 130, '#ffffff', 0.3)}<rect x="${sx - 6}" y="142" width="12" height="50" fill="#d8d4ce"/><circle cx="${sx}" cy="140" r="10" fill="#e8e4de"/></g>`;
      }
      return s + brume(L, 560, 760, '#e0e6ea', 0, 0.55, 0.2);
    } },
    { profondeur: 0.3, svg: (L) => {
      const rnd = alea('vx-pentes');
      let s = massif(L, 800, 160, 'vx-p1', '#6a7a5a', { degrade: [[0, '#7a8a66'], [1, '#4a5a3e']] });
      for (let i = 0; i < 80; i++) s += pin(rnd() * L, 720 + rnd() * 100, 40 + rnd() * 30, '#34422e', rnd);
      return s + brume(L, 700, 860, '#e0e6ea', 0, 0.4, 0);
    } },
    { profondeur: 0.55, svg: (L) => {
      const rnd = alea('vx-file');
      let s = massif(L, 900, 120, 'vx-alpage', '#8a946a', { degrade: [[0, '#9aa476'], [1, '#6a7450']] });
      // La file qui monte en lacets vers le sommet (de droite à gauche puis en diagonale).
      let d = '';
      for (let i = 0; i < 700; i++) {
        const u = i / 700, x = lerp(L * 0.05, L * 0.95, u) + Math.sin(u * 18) * 40, y = lerp(960, 780, u) + Math.cos(u * 18) * 10, h = lerp(26, 10, u);
        d += `M${r1(x + rnd() * 6)} ${r1(y)}v${r1(-h)}h${r1(h * 0.3)}v${r1(h)}z`;
      }
      s += `<g class="file"><path d="${d}" fill="#1c1e22"/></g>`;
      s += `<g class="redon" data-x="${L * 0.95}" data-y="770">${cloche(L * 0.95, 760, 16, '#3a2a1a', 'redon-e')}</g>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('vx-revenus');
      let s = '';
      s += `<path d="M-5 1010V830Q${L / 2} 800 ${L + 5} 835V1010Z" fill="#4a5236"/>`;
      for (let i = 0; i < 9; i++) {
        const x = L * (0.1 + i * 0.1 + rnd() * 0.03), h = 280 + rnd() * 40;
        s += `<g class="revenant" data-d="${r1(rnd() * 3)}"><g class="r-couche">${humain(x, 850, h, 'regarde_mains', { corps: '#2a2a30', tete: '#9a8a80', sens: rnd.signe() })}</g><g class="r-debout" opacity="0">${humain(x, 850, h, 'redresse', { corps: '#2a2a30', tete: '#9a8a80', sens: rnd.signe() })}</g></g>`;
      }
      return s + herbes(L, 1000, rnd, '#6a7048', { densite: 0.2, hMax: 90, epais: 3 });
    } },
  ],
  anims: {
    troupeau_monte(t, S) { for (const el of S.q('.file')) S.attr(el, 'transform', `translate(${r1(t * 8)},${r1(-t * 1.5)})`); },
    redon_balance(t, S) { for (const el of S.q('.redon')) S.attr(el, 'transform', `translate(${r1(t * 8)},${r1(-t * 1.5)}) rotate(${(Math.sin(t * 2.4) * 16).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`); },
    revenus_se_redressent(t, S) {
      for (const el of S.q('.revenant')) {
        const k = ease((S.tp - 1 - +el.dataset.d) / 1.2);
        S.attr(el.children[0], 'opacity', (1 - k).toFixed(2)); S.attr(el.children[1], 'opacity', k.toFixed(2));
      }
    },
    sommet_blanc(t, S) { for (const el of S.q('.sommet')) S.attr(el, 'opacity', (0.85 + 0.15 * Math.min(1, S.tp / 5)).toFixed(2)); },
  },
};
