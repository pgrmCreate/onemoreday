// Vignette — Sénas : vergers sous filets anti-grêle noirs, la station fruitière de tôle, « NON » à la bombe rouge,
// le clocher au fond.
import { alea, ciel, r1, massif, clocherVillage, olivier, voile, nuages, brume } from '../lib.js';
import { onduler, balancer } from '../anim.js';

export default {
  largeur: 1.15,
  fond: '#9aa4a8',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#6a7a8a'], [1, '#d0ccc0']]) + nuages(L, 60, 300, 7, 'senas-n', '#e8e4dc', 0.5) + massif(L, 600, 60, 'senas-c', '#8a9088') + clocherVillage(L * 0.66, 600, 320, '#9a8e7a', { clsCloche: 'cloche-senas' }) + brume(L, 500, 640, '#d0ccc0', 0, 0.4, 0.1) },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('vergers');
      let s = `<rect x="-5" y="640" width="${L + 10}" height="370" fill="#7a7a58"/>`;
      for (let r = 0; r < 4; r++) for (let x = -40; x < L * 0.5; x += 90 - r * 10) s += olivier(x + r * 30, 660 + r * 40, 90 + r * 20, '#4a5a34', rnd, '#3a3226');
      // Filets anti-grêle noirs tendus.
      s += `<g class="filets"><path d="M-10 580Q${L * 0.12} 620 ${L * 0.25} 580T${L * 0.5} 580V840H-10z" fill="#0c0c0e" opacity="0.55"/>`;
      let d = ''; for (let x = -10; x < L * 0.5; x += 16) d += `M${x} 590V840`; s += `<path d="${d}" stroke="#000" stroke-width="1.5" opacity="0.4"/></g>`;
      return s;
    } },
    { profondeur: 0.75, svg: (L) => {
      const x = L * 0.55;
      let s = `<rect x="${x}" y="520" width="${L * 0.4}" height="340" fill="#9aa0a4"/>`;
      let d = ''; for (let k = x; k < x + L * 0.4; k += 18) d += `M${k} 520V860`; s += `<path d="${d}" stroke="#7a8084" stroke-width="4"/>`;
      s += `<path d="M${x - 30} 520L${x + L * 0.2} 450L${x + L * 0.4 + 30} 520z" fill="#6a7074"/><rect x="${x + 80}" y="680" width="220" height="180" fill="#2a2c2e"/>`;
      s += `<text x="${x + L * 0.26}" y="700" font-family="Oswald, sans-serif" font-size="150" font-weight="700" text-anchor="middle" fill="#c8202a" opacity="0.9" transform="rotate(-4 ${x + L * 0.26} 700)">NON</text>`;
      s += `<path d="M${x + L * 0.2} 710v70M${x + L * 0.29} 714v50" stroke="#c8202a" stroke-width="6" opacity="0.7"/>`;
      return s + `<rect x="-5" y="860" width="${L + 10}" height="150" fill="#5a5448"/>`;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#2a2a2a', 0.1) },
  ],
  ambiance: ['vent'],
  anims: { vent(t, S) { onduler(t, S, '.filets', 0, 4, 0.4); balancer(t, S, '.cloche-senas', 2, 0.3); } },
};
