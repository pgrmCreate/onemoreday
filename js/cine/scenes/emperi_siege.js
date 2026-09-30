// L'Empéri pendant le siège (vignette et fond). Ciel rougi, murs et tours, torches sur le chemin de ronde, des gamins
// en silhouette avec sabres et bouteilles ; la porte doublée de palettes ; la marée au pied, bras levés.
import { alea, ciel, halo, r1, creneaux, humain, foule, panache, degrade, uid, voile, etoiles } from '../lib.js';
import { scintiller, onduler } from '../anim.js';

export default {
  largeur: 1.35,
  fond: '#1a0808',
  reglages: { fumee: '#2a1612', braises: '#f4a23c' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#12060a'], [0.2, '#4a1210'], [0.42, '#b0401a'], [0.6, '#7a2414'], [1, '#2a0a08']]) + etoiles(L, 300, 60, 'siege') + halo(L * 0.3, 380, 1000, 260, '#f07a2c', 0.45) + panache(L * 0.75, 700, 600, 140, '#1a0c0c', alea('sg'), { vent: 0.4, o: 0.7 }) },
    { profondeur: 0.35, svg: (L) => {
      const mur = '#1c1012', rnd = alea('siege-mur');
      let s = `<path d="M-10 1010V420H${L * 0.18}V300H${L * 0.3}V420H${L * 0.7}V260H${L * 0.84}V420H${L + 10}V1010Z" fill="${mur}"/>`;
      s += creneaux(-10, 420, L + 20, 34, mur) + creneaux(L * 0.18, 300, L * 0.12, 30, mur) + creneaux(L * 0.7, 260, L * 0.14, 30, mur);
      s += `<path d="M${L * 0.3} 420V1010M${L * 0.7} 420V1010" stroke="#0e0708" stroke-width="10"/>`;
      // Torches et gamins sur le chemin de ronde.
      for (let i = 0; i < 7; i++) {
        const x = L * (0.06 + i * 0.145), y = i === 1 ? 300 : i === 5 ? 260 : 420;
        s += `<g class="torche">${halo(x, y - 60, 120, 110, '#f4a23c', 0.55)}<path d="M${x} ${y}v-50" stroke="#2a1a10" stroke-width="8"/><path d="M${x - 10} ${y - 50}q10 -40 10 -50q10 20 10 50z" fill="#ffc060"/></g>`;
      }
      for (let i = 0; i < 9; i++) {
        const x = L * (0.1 + rnd() * 0.8), y = x > L * 0.18 && x < L * 0.3 ? 300 : x > L * 0.7 && x < L * 0.84 ? 260 : 420;
        s += `<g class="gamin" data-x="${r1(x)}" data-y="${y}">${humain(x, y + 2, 120 + rnd() * 30, rnd() < 0.4 ? 'bras_leves' : 'debout', { corps: '#0a0506', sens: rnd.signe() })}<path d="M${r1(x + 14)} ${y - 80}l40 -60" stroke="#0a0506" stroke-width="6"/></g>`;
      }
      s += `<rect x="${L * 0.1}" y="520" width="18" height="40" fill="#f4a23c" opacity="0.7"/><rect x="${L * 0.55}" y="560" width="18" height="40" fill="#f4a23c" opacity="0.5"/>`;
      return s;
    } },
    { profondeur: 0.6, svg: (L) => {
      // La porte, grille de chantier doublée de palettes.
      const x = L * 0.5, y = 900;
      let s = `<path d="M${x - 200} ${y}V${y - 330}a200 200 0 0 1 400 0V${y}z" fill="#0c0606"/>`;
      let d = ''; for (let k = 0; k < 7; k++) d += `M${x - 190} ${y - 40 - k * 44}h380`;
      s += `<g fill="#5a3a24">${Array.from({ length: 5 }, (_, k) => `<rect x="${x - 190 + k * 78}" y="${y - 300}" width="70" height="300"/>`).join('')}</g><path d="${d}" stroke="#3a2416" stroke-width="10"/>`;
      s += `<path d="M${x - 196} ${y - 320}h392" stroke="#8a8a8a" stroke-width="6"/>`;
      let g = ''; for (let gx = x - 190; gx <= x + 190; gx += 24) g += `M${gx} ${y - 320}v300`; s += `<path d="${g}" stroke="#6a6a6a" stroke-width="3" opacity="0.6"/>`;
      return s + halo(x, y - 200, 300, 200, '#e2551c', 0.2);
    } },
    { profondeur: 1, svg: (L) => `<g class="maree-bras">${foule(L, 1060, 420, alea('siege-foule'), { couleurs: ['#050203', '#0a0506', '#0c0708'], poses: ['bras_tendus', 'bras_leves', 'mort_bras'], rangs: 3, espace: 0.17 }).svg}</g>` + voile(L, '#2a0808', 0.2, 700, 1000) },
  ],
  ambiance: ['torches', 'marée'],
  anims: {
    torches(t, S) { scintiller(t, S, '.torche', 0.6, 1, 12); onduler(t, S, '.gamin', 2, 1, 0.4); },
    'marée'(t, S) { onduler(t, S, '.maree-bras', 10, 6, 0.3); },
  },
};
