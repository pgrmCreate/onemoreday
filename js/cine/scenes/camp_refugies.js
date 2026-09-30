// Camp de toile au bord du Rhône, six semaines après. Ciel gris d'automne, platanes jaunes, le fleuve et ses
// peupliers ; des rangées de tentes blanches, une chapelle en préfabriqué et sa petite cloche ; la cuisine collective.
import { alea, ciel, halo, r1, massif, brume, platane, humain, sol, nuages, panache, cloche, voile, touffe } from '../lib.js';
import { onduler, balancer } from '../anim.js';

function tente(x, y, w, c) {
  return `<g class="tente" data-x="${r1(x + w / 2)}" data-y="${y}"><path d="M${r1(x)} ${y}L${r1(x + w * 0.5)} ${r1(y - w * 0.55)}L${r1(x + w)} ${y}z" fill="${c}"/><path d="M${r1(x + w * 0.5)} ${r1(y - w * 0.55)}L${r1(x + w)} ${y}H${r1(x + w * 0.5)}z" fill="#000" opacity="0.12"/><path d="M${r1(x + w * 0.42)} ${y}L${r1(x + w * 0.5)} ${r1(y - w * 0.3)}L${r1(x + w * 0.58)} ${y}z" fill="#2a2a2a" opacity="0.7"/></g>`;
}

export default {
  largeur: 2.2,
  fond: '#9a9c98',
  reglages: { cendres: '#c8c4bc', fumee: '#8a8a88' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#6f7474'], [0.6, '#a2a4a0'], [1, '#c8c6be']]) + nuages(L, 60, 400, 14, 'camp-n', '#b8bab6', 0.6, '#7a7e7e') },
    { profondeur: 0.2, svg: (L) => {
      const rnd = alea('camp-rhone');
      let s = massif(L, 600, 50, 'camp-coll', '#7a8078', { rugosite: 0.3 });
      for (let x = 0; x < L; x += 50 + rnd() * 40) s += `<path d="M${r1(x)} 640q-14 -80 0 -170q14 90 0 170z" fill="#6a7458" opacity="0.9"/>`;
      s += `<rect x="-5" y="640" width="${L + 10}" height="40" fill="#8a9496"/><path d="M-5 650H${L}M-5 664H${L}" stroke="#b8c0c2" stroke-width="2" opacity="0.5" stroke-dasharray="60 40"/>`;
      return s + brume(L, 560, 700, '#c8c6be', 0, 0.5, 0.2);
    } },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('camp-tentes');
      let s = sol(L, 680, [[0, '#8a8670'], [1, '#6a6452']]);
      for (let r = 0; r < 4; r++) { const y = 700 + r * 50, w = 110 + r * 30; for (let x = -40 + (r % 2) * w * 0.5; x < L; x += w * 1.3) if (Math.abs(x - L * 0.72) > 260 || r > 2) s += tente(x, y, w, ['#e8e6e0', '#dcdad2', '#d0cec6'][r % 3]); }
      // Chapelle préfabriquée et petite cloche.
      const cx = L * 0.72;
      s += `<rect x="${cx - 160}" y="600" width="320" height="140" fill="#c9c6bc"/><path d="M${cx - 175} 600l175 -70l175 70z" fill="#6a6a64"/><rect x="${cx - 30}" y="660" width="60" height="80" fill="#3a3a38"/><path d="M${cx} 530v-100M${cx - 20} 470h40" stroke="#4a4a46" stroke-width="7"/>`;
      s += `<path d="M${cx + 90} 600v-90h50v90" fill="none" stroke="#4a4a46" stroke-width="6"/>` + cloche(cx + 115, 518, 40, '#5a5040', 'cloche-chapelle');
      return s;
    } },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('camp-cuisine');
      let s = '';
      // Cuisine collective : bâche tendue, marmites, fumée.
      const kx = L * 0.3;
      s += `<path d="M${kx - 200} 820V700M${kx + 200} 820V700" stroke="#4a4a44" stroke-width="8"/><path class="bache-cuisine" d="M${kx - 230} 700L${kx} 660L${kx + 230} 700z" fill="#3a5a7a"/>`;
      s += `<rect x="${kx - 80}" y="770" width="160" height="50" fill="#2a2a2a"/>${halo(kx, 780, 120, 50, '#f4a23c', 0.5)}`;
      s += `<g class="fumee-cuisine">${panache(kx, 760, 460, 70, '#b8b8b4', rnd, { vent: 0.3, o: 0.5, c2: '#d8d8d4' })}</g>`;
      for (let i = 0; i < 12; i++) s += humain(kx - 300 + i * 55 + rnd() * 20, 880, 170 + rnd() * 20, rnd() < 0.3 ? 'assis' : 'debout', { corps: rnd.choix(['#4a4a52', '#5a4a3a', '#3a4a5a', '#6a5a4a']), tete: '#8a7462', sens: rnd.signe() });
      return s + sol(L, 880, [[0, '#5a5444'], [1, '#3a3428']]);
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('camp-platanes');
      let s = '';
      for (let x = 700; x < L; x += 1200 + rnd() * 100) s += `<g class="platane-jaune">${platane(x, 1040, 1400, rnd, { tronc: '#a8a08a', feuille: ['#8a6a2a', '#b8902a', '#d8b848'], large: 0.4 })}</g>`;
      for (let i = 0; i < 60; i++) s += `<ellipse cx="${r1(rnd() * L)}" cy="${r1(990 + rnd() * 20)}" rx="12" ry="5" fill="${rnd.choix(['#b8902a', '#8a6a2a', '#d8b848'])}"/>`;
      return s + voile(L, '#9a9c98', 0.08);
    } },
  ],
  anims: {
    tentes_vent(t, S) { S.q('.tente').forEach((el, i) => S.attr(el, 'transform', `translate(${el.dataset.x},${el.dataset.y}) skewX(${(Math.sin(t * 2 + i) * 2).toFixed(1)}) translate(${-el.dataset.x},${-el.dataset.y})`)); onduler(t, S, '.houppier', 6, 2, 0.3); onduler(t, S, '.bache-cuisine', 0, 3, 0.8); },
    fumee_cuisine(t, S) { for (const el of S.q('.fumee-cuisine')) S.attr(el, 'transform', `translate(${(Math.sin(t * 0.4) * 20 + t * 3).toFixed(1)},${(-(t * 6) % 40).toFixed(1)})`); },
    cloche_chapelle(t, S) { balancer(t, S, '.cloche-chapelle', 24, 0.6); },
  },
};
