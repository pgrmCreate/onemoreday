// Cautère. Ciel noir-orange ; collines de pins qui brûlent ; un mur de flammes couché par le vent vers la droite (le
// sud) ; devant, le troupeau en silhouettes et, selon le plan, le Berger immobile ; des avions qui passent bas.
import { alea, ciel, halo, r1, massif, pin, flammes, panache, humain, foule, avion, voile, brume, sol } from '../lib.js';
import { scintiller, ease } from '../anim.js';

export default {
  largeur: 2.4,
  fond: '#1a0a05',
  reglages: { fumee: '#1e1210', braises: '#f4a23c', vent: 0.6 },
  couches: [
    { profondeur: 0, svg: (L) => {
      let s = ciel(L, [[0, '#050304'], [0.35, '#2a0c06'], [0.62, '#8a2a0c'], [0.8, '#e2551c'], [1, '#f4b23c']]);
      const rnd = alea('ldf-ciel');
      for (let i = 0; i < 6; i++) s += panache(rnd() * L, 640, 700, 220, '#140a08', rnd, { vent: 0.7, o: 0.75, c2: '#3a1a10' });
      s += `<g class="avions" opacity="0">${avion(0, 250, 260, '#0a0506', 'canadair')}${avion(420, 300, 200, '#0a0506', 'canadair')}${avion(-380, 200, 160, '#0a0506', 'chasseur')}</g>`;
      return s;
    } },
    { profondeur: 0.22, svg: (L) => {
      const rnd = alea('ldf-coll');
      let s = massif(L, 700, 160, 'ldf-c1', '#1a0806');
      for (let x = 0; x < L; x += 28 + rnd() * 30) s += pin(x, 640 + rnd() * 50, 60 + rnd() * 50, '#120504', rnd);
      s += `<g class="feux-collines">`;
      for (let x = rnd() * 200; x < L; x += 180 + rnd() * 260) s += halo(x, 640, 200, 80, '#f4a23c', 0.5) + flammes(x - 60, 680, 120, 90 + rnd() * 60, rnd, { couche: 0.5, tons: ['#8e1b10', '#e2551c', '#f4b23c'] });
      s += `</g>`;
      return s + brume(L, 560, 760, '#e2551c', 0, 0.35, 0.1);
    } },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('ldf-mur');
      let s = halo(L * 0.5, 780, L * 0.7, 260, '#f4b23c', 0.45);
      s += `<g class="mur-feu">`;
      for (let x = -200; x < L + 200; x += 240) s += `<g class="langue" data-x="${x + 120}" data-y="860">${flammes(x, 860, 280, 330 + rnd() * 160, rnd, { couche: 0.7 })}</g>`;
      s += `</g>`;
      s += sol(L, 850, [[0, '#2a0e06'], [1, '#0a0403']]);
      return s;
    } },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('ldf-troupeau');
      let s = `<g class="troupeau-feu">${foule(L, 950, 260, rnd, { couleurs: ['#060303', '#0a0404', '#0c0605'], poses: ['mort', 'mort_bras', 'mort_leve'], rangs: 3, espace: 0.2, sens: 1, cls: 'bete' }).svg}</g>`;
      s += `<g class="troupeau-arrivant" opacity="1">${foule(L * 0.5, 980, 300, alea('ldf-arr'), { couleurs: ['#050303'], poses: ['mort', 'mort_bras'], rangs: 2, espace: 0.22, sens: 1 }).svg}</g>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const bx = L * 0.74;
      let s = sol(L, 990, [[0, '#0a0403'], [1, '#050202']]);
      s += `<g class="berger" opacity="0">${humain(bx, 1010, 520, 'debout', { corps: '#030202', chapeau: '#030202', manteau: '#050303', sens: 1 })}<path d="M${bx + 60} 1010l20 -470" stroke="#030202" stroke-width="10"/>${halo(bx, 700, 200, 400, '#f4a23c', 0.12)}</g>`;
      return s + voile(L, '#2a0804', 0.12);
    } },
  ],
  ambiance: ['feu_vit'],
  anims: {
    feu_vit(t, S) {
      scintiller(t, S, '.feux-collines', 0.65, 1, 8);
      S.q('.langue').forEach((el, i) => { const x = el.dataset.x, y = el.dataset.y; const k = 1 + Math.sin(t * 7 + i * 1.7) * 0.08 + Math.sin(t * 13 + i) * 0.05; S.attr(el, 'transform', `translate(${x},${y}) skewX(${(-18 + Math.sin(t * 3 + i) * 6).toFixed(1)}) scale(1,${k.toFixed(3)}) translate(${-x},${-y})`); });
    },
    flammes_avancent(t, S) { for (const el of S.q('.mur-feu')) S.attr(el, 'transform', `translate(${r1(t * 22)},0)`); },
    avions_passent(t, S) {
      const L = S.couches[0].L;
      for (const el of S.q('.avions')) { S.attr(el, 'opacity', '1'); S.attr(el, 'transform', `translate(${r1(-600 + ((S.tp * 520) % (L + 1600)))},${r1(Math.sin(t * 0.8) * 10)})`); }
    },
    troupeau_brule(t, S) {
      S.q('.bete').forEach((el, i) => {
        const k = Math.max(0, Math.min(1, (S.tp - 2 - (i % 17) * 0.3) / 2));
        S.attr(el, 'transform', `translate(0,${r1(k * 40)}) rotate(${r1(k * (i % 2 ? 60 : -40))} ${el.dataset.x} 950)`);
        S.attr(el, 'opacity', (1 - k * 0.6).toFixed(2));
      });
    },
    berger_immobile(t, S) { for (const el of S.q('.berger')) S.attr(el, 'opacity', '1'); },
    troupeau_arrive(t, S) { for (const el of S.q('.troupeau-arrivant')) S.attr(el, 'transform', `translate(${r1(-600 + ease(S.tp / 6) * 900)},0)`); },
  },
};
