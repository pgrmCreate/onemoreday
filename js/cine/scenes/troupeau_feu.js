// Fin C, vers le feu. Ciel en feu, collines embrasées ; une silhouette de dos, le redon levé, une petite femme à son
// bras ; derrière, onze mille silhouettes qui suivent. Dernier plan : la route calcinée, une cloche fêlée au sol.
import { alea, ciel, halo, r1, massif, flammes, panache, humain, foule, sol, voile, pin, cloche, brume } from '../lib.js';
import { scintiller, ease } from '../anim.js';

export default {
  largeur: 2.2,
  fond: '#1a0a05',
  reglages: { braises: '#f4a23c', fumee: '#1e120e', cendres: '#9a948a', vent: 0.4 },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#0a0404'], [0.3, '#3a0e06'], [0.6, '#b0400e'], [0.85, '#f08a2a'], [1, '#ffd070']]) + halo(L * 0.1, 700, 1400, 500, '#ffd070', 0.5) + panache(L * 0.15, 700, 800, 280, '#1a0a08', alea('tf-p'), { vent: 0.5, o: 0.7, c2: '#4a1a0c' }) },
    { profondeur: 0.22, svg: (L) => {
      const rnd = alea('tf-coll');
      let s = `<g class="avant">` + massif(L, 720, 180, 'tf-c', '#200a06');
      for (let x = 0; x < L; x += 40 + rnd() * 30) s += pin(x, 660 + rnd() * 60, 50 + rnd() * 40, '#140604', rnd);
      for (let x = 0; x < L; x += 200 + rnd() * 200) s += `<g class="feu-c">${flammes(x, 700, 160, 100 + rnd() * 80, rnd, { couche: 0.3 })}</g>`;
      return s + `</g>` + brume(L, 600, 800, '#f08a2a', 0, 0.35, 0.1);
    } },
    { profondeur: 0.5, svg: (L) => {
      const rnd = alea('tf-mur');
      let s = sol(L, 860, [[0, '#2a0e06'], [1, '#0a0403']]);
      s += `<g class="avant">`;
      // Le mur de feu, à gauche.
      s += halo(L * 0.05, 700, 700, 400, '#ffd070', 0.6);
      s += `<g class="mur-feu">`;
      for (let x = -300; x < L * 0.2; x += 200) s += `<g class="langue" data-x="${x + 100}" data-y="880">${flammes(x, 880, 260, 520 + rnd() * 200, rnd, { couche: -0.2 })}</g>`;
      s += `</g>`;
      // Le meneur, de dos, redon levé ; Rose à son bras.
      const mx = L * 0.2;
      s += `<g class="meneur" data-x="${mx}"><g class="duo">${humain(mx, 900, 330, 'leve_cloche', { corps: '#050202', sens: -1 })}${humain(mx + 70, 900, 240, 'marche', { corps: '#070303', sens: -1 })}<path d="M${mx + 30} 740q20 10 30 0" stroke="#050202" stroke-width="16"/></g>`;
      s += `<g class="redon" data-x="${mx - 30}" data-y="560">${cloche(mx - 30, 540, 70, '#120806', 'redon-c')}${halo(mx - 30, 580, 60, 50, '#ffb060', 0.35)}</g></g>`;
      s += `</g>`;
      // Après : la route calcinée, la cloche fêlée.
      s += `<g class="apres" opacity="0"><rect x="-5" y="0" width="${L + 10}" height="1010" fill="#2a2624"/>${ciel(L, [[0, '#4a4644'], [0.7, '#6a6460'], [1, '#8a8480']])}`;
      s += massif(L, 740, 60, 'tf-cendre', '#2e2a28') + `<path d="M${L * 0.3} 1010L${L * 0.48} 740h${L * 0.04}L${L * 0.7} 1010z" fill="#1a1818"/>`;
      let d = ''; for (let i = 0; i < 70; i++) d += `M${r1(rnd() * L)} ${r1(740 + rnd() * 60)}v-${r1(20 + rnd() * 60)}`;
      s += `<path d="${d}" stroke="#141212" stroke-width="5"/>`;
      s += halo(L * 0.5, 880, 400, 120, '#e8c090', 0.18) + `<ellipse cx="${L * 0.5}" cy="905" rx="200" ry="22" fill="#0c0a08" opacity="0.6"/><g transform="rotate(72 ${L * 0.5} 860)">${cloche(L * 0.5, 700, 260, '#5a3e24', 'cloche-sol')}</g><path d="M${L * 0.5 - 60} 840l40 -40l-10 -30l30 -30" stroke="#0c0a08" stroke-width="6" fill="none"/><path d="M${L * 0.5 - 120} 820q100 -40 200 -10" stroke="#b8905a" stroke-width="5" fill="none" opacity="0.5"/></g>`;
      return s;
    } },
    { profondeur: 0.8, svg: (L) => `<g class="avant"><g class="suivants">${foule(L * 1.3, 990, 320, alea('tf-f1'), { couleurs: ['#040202', '#070303', '#0a0504'], poses: ['mort', 'mort_leve'], rangs: 3, espace: 0.17, sens: -1, x0: L * 0.3 }).svg}</g></g>` },
    { profondeur: 1, svg: (L) => `<g class="avant">${voile(L, '#3a0a02', 0.14)}</g>` },
  ],
  ambiance: ['feu_vit'],
  anims: {
    feu_vit(t, S) {
      scintiller(t, S, '.feu-c', 0.6, 1, 8);
      S.q('.langue').forEach((el, i) => { const x = el.dataset.x, y = el.dataset.y; S.attr(el, 'transform', `translate(${x},${y}) skewX(${(Math.sin(t * 3 + i) * 8).toFixed(1)}) scale(1,${(1 + Math.sin(t * 8 + i * 2) * 0.08).toFixed(3)}) translate(${-x},${-y})`); });
    },
    troupeau_suit(t, S) { for (const el of S.q('.suivants')) S.attr(el, 'transform', `translate(${r1(-t * 26)},${r1(-Math.abs(Math.sin(t * 1.8)) * 4)})`); },
    redon_leve(t, S) { for (const el of S.q('.redon')) S.attr(el, 'transform', `rotate(${(Math.sin(t * 2.2) * 14).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`); },
    rose_bras(t, S) { for (const el of S.q('.duo')) S.attr(el, 'transform', `translate(0,${(-Math.abs(Math.sin(t * 2)) * 6).toFixed(1)})`); },
    flammes_avancent(t, S) { for (const el of S.q('.mur-feu')) S.attr(el, 'transform', `translate(${r1(t * 14)},0)`); },
    silhouette_dans_flammes(t, S) {
      const k = ease(S.tp / 6);
      for (const el of S.q('.meneur')) { S.attr(el, 'transform', `translate(${r1(-k * 420)},0)`); S.attr(el, 'opacity', (1 - k * 0.9).toFixed(2)); }
    },
    cloche_au_sol(t, S) {
      for (const el of S.q('.apres')) S.attr(el, 'opacity', '1');
      for (const el of S.q('.avant')) S.attr(el, 'opacity', '0');
    },
  },
};
