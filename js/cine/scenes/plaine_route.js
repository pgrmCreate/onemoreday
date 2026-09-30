// La route départementale entre oliviers et vergers, restanques, Alpilles au loin, jour. Sert de vignette et du plan
// « file_marcheurs » de ch2_intro : une file de gamins et d'adultes traverse les oliveraies, loin de la route.
import { alea, ciel, halo, r1, alpilles, massif, olivier, herbes, brume, nuages, sol, cypres } from '../lib.js';
import { passant, animerPassants, onduler } from '../anim.js';

export default {
  largeur: 1.9,
  fond: '#a8c4d8',
  reglages: { poussiere: '#efe6cc' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#6a9ac0'], [0.6, '#a8c4d8'], [1, '#ece4d0']]) + halo(L * 0.3, 200, 600, 300, '#fff8e8', 0.4) + nuages(L, 80, 320, 10, 'pr-n', '#ffffff', 0.45) + alpilles(L, 590, 150, 'pr-alp', '#8a98a8', '#c8d0d8') + brume(L, 500, 640, '#e8e4d8', 0, 0.45, 0.2) },
    { profondeur: 0.3, svg: (L) => {
      const rnd = alea('pr-restanques');
      let s = massif(L, 680, 60, 'pr-coll', '#9a9a70');
      for (let k = 0; k < 4; k++) s += `<path d="M-10 ${640 + k * 24}H${L + 10}" stroke="#b8ae90" stroke-width="5" opacity="0.8"/>`;
      for (let i = 0; i < 70; i++) s += olivier(rnd() * L, 650 + rnd() * 70, 36 + rnd() * 16, '#7a8458', rnd, '#5a5040');
      for (let i = 0; i < 8; i++) s += cypres(rnd() * L, 700, 100 + rnd() * 40, '#3a4a32');
      return s;
    } },
    { profondeur: 0.55, svg: (L) => {
      const rnd = alea('pr-oliveraie');
      let s = sol(L, 720, [[0, '#b8a878'], [1, '#9a8a62']]);
      for (let x = 0; x < L; x += 150 + rnd() * 50) s += olivier(x, 790 + rnd() * 30, 150 + rnd() * 30, '#6a7a4a', rnd, '#4a4032');
      // La file de marcheurs, loin de la route : sacs, bidons, sabres de musée.
      for (let i = 0; i < 14; i++) s += passant(L * (0.1 + i * 0.045), 845, (i % 3 === 1 ? 110 : 150) + rnd() * 16, { v: 34, L, pose: 'marche', corps: rnd.choix(['#3a4a6a', '#6a3a2a', '#4a5a3a', '#2a2a30', '#8a6a3a']), tete: '#a88a70', sac: rnd() < 0.5 ? '#5a4a3a' : null, cls: 'marcheur' });
      return s;
    } },
    { profondeur: 0.85, svg: (L) => {
      let s = sol(L, 900, [[0, '#6a6660'], [1, '#4a4844']]);
      s += `<path d="M-10 950H${L + 10}" stroke="#e8e2d0" stroke-width="6" stroke-dasharray="90 70"/>`;
      return s + herbes(L, 900, alea('pr-h'), '#8a8452', { densite: 0.25, hMax: 60, epais: 3 });
    } },
  ],
  anims: {
    file_marcheurs(t, S) { animerPassants(t, S, '.marcheur', { marge: 300 }); onduler(t, S, '.herbes', 3, 0, 0.3); },
  },
};
