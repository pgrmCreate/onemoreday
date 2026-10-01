// Vignette — les cours de Salon la nuit : platanes, étals abandonnés sous bâches, voitures, enseigne du tabac,
// réverbères morts, lune. Même rue que le marché (mêmes graines), éteinte.
import { alea, etal, voiture, lampadaire, r1, voile } from '../lib.js';
import { onduler } from '../anim.js';
import { MATIN, coucheCiel, coucheFacades, couchePlatanes } from './rue_commune.js';

const P = Object.assign({}, MATIN, {
  ciel: [[0, '#05070e'], [0.6, '#10141e'], [1, '#1e2230']], soleil: null, nuages: '#2a2e3a', nuagesO: 0.4, etoiles: true, lune: [0.62, 120, 30],
  lointain: '#141824', rocher: '#1c202c', nuit: 1, lumiere: 0.01, tonalite: ['#2a3040', 0.4], voileFond: ['#141824', 0.3],
  feuille: ['#0a0e0c', '#121a14', '#1c2620'], tronc: '#3a3a3c', taches: ['#2a2a2c', '#4a4a4c', '#343436'],
  sol: [[0, '#1c1e26'], [1, '#0a0b0e']], rayons: null, tachesSol: null, trous: '#1a1e2a', vouteH: 200,
});

export default {
  largeur: 1.2,
  fond: '#10141e',
  couches: [
    { profondeur: 0, svg: coucheCiel(P, 'cours') },
    { profondeur: 0.3, svg: coucheFacades(P, 'cours') },
    { profondeur: 0.5, svg: couchePlatanes(P, 'cours') },
    { profondeur: 0.75, svg: (L) => {
      const rnd = alea('cours-nuit');
      let s = '';
      for (let x = L * 0.05; x < L; x += 420 + rnd() * 120) s += etal(x, 890, 280, rnd, { nuit: 0.9, bache: ['#3a4a5a', '#2a3440'] });
      for (let x = L * 0.12; x < L; x += 700) s += lampadaire(x, 900, 420, '#0a0b0e', false);
      return s;
    } },
    { profondeur: 1, svg: (L) => voiture(L * 0.08, 1000, 520, '#1a1c22', { portiere: true }) + voiture(L * 0.7, 1010, 560, '#20232a') + voile(L, '#05070e', 0.2) },
  ],
  ambiance: ['brise'],
  anims: { brise(t, S) { onduler(t, S, '.houppier', 3, 1, 0.12); } },
};
