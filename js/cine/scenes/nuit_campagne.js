// Vignette — un chemin de campagne la nuit : borne kilométrique, une silhouette assise, étoiles.
import { alea, ciel, etoiles, lune, halo, r1, massif, humain, herbes, cypres, voile, brume } from '../lib.js';
import { onduler } from '../anim.js';

export default {
  largeur: 1.15,
  fond: '#0a0d18',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#04060c'], [0.7, '#0e1424'], [1, '#1a2032']]) + etoiles(L, 700, 420, 'campagne') + lune(L * 0.28, 170, 22, '#e0dccc') + massif(L, 660, 70, 'nc-c', '#0a0c14') + brume(L, 600, 720, '#1c2438', 0, 0.45, 0) },
    { profondeur: 0.45, svg: (L) => {
      const c = L / 2;
      let s = `<path d="M-10 1010V700Q${c} 680 ${L + 10} 710V1010z" fill="#12141c"/><path d="M${c - 120} 1010Q${c - 20} 820 ${c + 30} 700h20Q${c + 40} 820 ${c + 280} 1010z" fill="#262830"/>`;
      for (let i = 0; i < 5; i++) s += cypres(c + 300 + i * 90, 720, 180 + i * 10, '#07090c');
      // Borne kilométrique et silhouette assise.
      const bx = c - 260;
      s += halo(bx + 60, 860, 360, 160, '#8a94b8', 0.18) + `<path d="M${bx - 50} 900v-150q50 -66 100 0v150z" fill="#b8b4a8"/><path d="M${bx - 50} 780q50 -56 100 0" fill="#9a2a2a"/><text x="${bx}" y="850" font-family="Oswald, sans-serif" font-size="30" text-anchor="middle" fill="#2a2a2a">D 17</text>`;
      s += humain(bx + 150, 905, 330, 'assis_sol', { corps: '#05060a', sens: -1 });
      return s;
    } },
    { profondeur: 1, svg: (L) => herbes(L, 1000, alea('nc-h'), '#141a14', { densite: 0.4, hMax: 140, couche: 0.1, epais: 4, cls: 'herbes-n' }) + voile(L, '#000', 0.15) },
  ],
  ambiance: ['brise'],
  anims: { brise(t, S) { onduler(t, S, '.herbes-n', 5, 0, 0.2); } },
};
