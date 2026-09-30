// La Crau sous le mistral. Ciel lavé bleu cobalt, nuages déchiquetés qui filent ; les Alpilles nettes ; la plaine
// de galets, les haies de cyprès pliées ; les herbes couchées ; la colonne de Calès, courbée contre le vent.
import { alea, ciel, halo, r1, alpilles, massif, nuages, cypres, herbes, sol, humain, brume } from '../lib.js';
import { passant, animerPassants, ployer, onduler } from '../anim.js';

export default {
  largeur: 2.4,
  fond: '#2f6db3',
  reglages: { poussiere: '#e0d8c0', vent: 0.8 },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#1d4f8f'], [0.5, '#2f6db3'], [0.85, '#8ab4d8'], [1, '#c9dce8']]) + halo(L * 0.3, 150, 700, 300, '#ffffff', 0.3) + nuages(L, 60, 360, Math.round(L / 180), 'crau-n', '#f4f8fc', 0.7, '#9ab8d4', 'nuages-filent') },
    { profondeur: 0.18, svg: (L) => alpilles(L, 600, 190, 'crau-alp', '#5a7088', '#b8c8d8') + brume(L, 540, 640, '#c9dce8', 0, 0.35, 0.1) },
    { profondeur: 0.4, svg: (L) => {
      const rnd = alea('crau-plaine');
      let s = sol(L, 620, [[0, '#a8a488'], [0.4, '#9a9074'], [1, '#7a7058']]);
      // Galets de la Crau.
      let d = ''; for (let i = 0; i < L / 3; i++) { const x = rnd() * L, y = 630 + Math.pow(rnd(), 0.7) * 380, r = 1 + (y - 620) / 60; d += `M${r1(x)} ${r1(y)}a${r1(r * 1.4)} ${r1(r)} 0 1 0 0.1 0z`; }
      s += `<path d="${d}" fill="#d8d2c0" opacity="0.5"/>`;
      // Haies de cyprès, pliées par le vent.
      return s + `<path d="M-10 760Q${L / 2} 740 ${L + 10} 770" stroke="#8a8068" stroke-width="30" fill="none" opacity="0.6"/>`;
    } },
    { profondeur: 0.4, svg: (L) => {
      const rnd = alea('crau-cypres'); let s = '';
      for (const [y, h, n] of [[640, 80, 26], [700, 150, 18]]) {
        const x0 = rnd() * L * 0.3;
        for (let i = 0; i < n; i++) { const x = x0 + i * h * 0.3 + (i > n / 2 ? L * 0.35 : 0); s += cypres(x, y, h * (0.9 + rnd() * 0.2), y < 680 ? '#3a4a3a' : '#243424', 0.12, 'cypres'); }
      }
      return s;
    } },
    { profondeur: 0.7, svg: (L) => herbes(L, 830, alea('crau-h1'), '#a09a60', { densite: 0.22, hMax: 70, couche: 0.9, epais: 3, cls: 'herbes-couchees' }) + herbes(L, 880, alea('crau-h2'), '#8a8450', { densite: 0.18, hMax: 90, couche: 1.1, epais: 3, cls: 'herbes-couchees' }) },
    { profondeur: 1, svg: (L) => sol(L, 960, [[0, '#6a6048'], [1, '#4a4232']]) },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('colonne');
      let s = '';
      for (let i = 0; i < 22; i++) {
        const x = L * (0.2 + i * 0.035 + rnd() * 0.02), h = 270 + rnd() * 50, c = rnd.choix(['#1c1c20', '#2a2420', '#22262a', '#3a2a24']);
        const enfant = rnd() < 0.2;
        s += passant(x, 950 + rnd() * 25, h, { v: -(24 + rnd() * 8), L, pose: 'courbe', corps: c, manteau: rnd() < 0.5 ? c : null, vent: 30, sac: rnd() < 0.4 ? '#4a3a2a' : null, cls: 'marcheur', enfant: enfant ? c : null });
      }
      return s;
    } },
  ],
  anims: {
    herbes_couchees(t, S) { onduler(t, S, '.herbes-couchees', 10, 2, 0.9, 0.4); },
    nuages_filent(t, S) { for (const el of S.q('.nuages-filent')) S.attr(el, 'transform', `translate(${r1(t * 160)},0)`); },
    cypres_plient(t, S) { ployer(t, S, '.cypres', 6, 3, 0.7, 5); },
    colonne_marche(t, S) {
      animerPassants(t, S, '.marcheur', { marge: 600 });
    },
  },
};
