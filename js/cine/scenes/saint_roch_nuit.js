// Vignette — le cimetière Saint-Roch sur son rocher, la nuit : allées de mausolées accolés, conteneurs frigorifiques
// blancs sur l'esplanade, loge du gardien, soldat NRBC assis, housses le long des murs, grille ouvragée.
import { alea, ciel, etoiles, lune, halo, r1, gisant, humain, grilleFer, voile, cypres } from '../lib.js';
import { scintiller } from '../anim.js';

export default {
  largeur: 1.15,
  fond: '#0c0f18',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#05070e'], [1, '#1a2032']]) + etoiles(L, 500, 160, 'stroch') + lune(L * 0.7, 160, 28) },
    { profondeur: 0.4, svg: (L) => {
      const rnd = alea('mausolees');
      let s = `<path d="M-10 700Q${L / 2} 650 ${L + 10} 700V1010H-10Z" fill="#1a1c24"/>`;
      for (let x = 0; x < L; x += 110 + rnd() * 40) { const h = 140 + rnd() * 90; s += `<path d="M${r1(x)} 720V${r1(720 - h)}l55 -40l55 40V720z" fill="${rnd.choix(['#3a3c46', '#34363f', '#40424c'])}"/><rect x="${r1(x + 38)}" y="${r1(720 - h * 0.6)}" width="34" height="${r1(h * 0.6)}" fill="#0c0d12"/><path d="M${r1(x + 55)} ${r1(720 - h - 40)}v-30M${r1(x + 45)} ${r1(720 - h - 58)}h20" stroke="#40424c" stroke-width="5"/>`; }
      for (let i = 0; i < 8; i++) s += cypres(L * (0.05 + i * 0.13), 640, 200 + rnd() * 80, '#0e1410');
      return s;
    } },
    { profondeur: 0.7, svg: (L) => {
      let s = `<rect x="-5" y="780" width="${L + 10}" height="230" fill="#20222a"/>`;
      // Conteneurs frigorifiques et leur groupe électrogène.
      for (let k = 0; k < 3; k++) { const x = L * 0.52 + k * 250; s += `<rect x="${x}" y="620" width="230" height="170" fill="#d8dadc"/><path d="M${x + 20} 640v130M${x + 60} 640v130M${x + 100} 640v130" stroke="#a8aaac" stroke-width="4"/><rect class="led-frigo" x="${x + 190}" y="640" width="12" height="8" fill="#46d27a"/>`; }
      // Loge du gardien, lampe.
      s += `<rect x="${L * 0.18}" y="600" width="220" height="190" fill="#3a3630"/><path d="M${L * 0.18 - 20} 600l130 -60l130 60z" fill="#5a3a2a"/><rect x="${L * 0.18 + 80}" y="660" width="50" height="50" fill="#e8c070" class="loge"/>${halo(L * 0.18 + 105, 685, 90, 70, '#e8c070', 0.4)}`;
      // Housses le long du mur.
      for (let k = 0; k < 6; k++) s += gisant(L * 0.46 + k * 120, 800, 110, '#cfd0cc', { housse: true });
      // Soldat NRBC assis.
      s += humain(L * 0.42, 790, 200, 'assis', { corps: '#5a6040', tete: '#2a2e22', sens: -1 }) + `<circle cx="${L * 0.42 - 12}" cy="${790 - 176}" r="6" fill="#0a0a0a"/>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => grilleFer(L * 0.02, 500, L * 0.96, 520, '#050608', 34, 7) + `<path d="M${L * 0.3} 500q${L * 0.2} -120 ${L * 0.4} 0" stroke="#050608" stroke-width="10" fill="none"/>` + voile(L, '#05070e', 0.15) },
  ],
  ambiance: ['lueurs'],
  anims: { lueurs(t, S) { scintiller(t, S, '.loge', 0.7, 1, 6); for (const el of S.q('.led-frigo')) S.attr(el, 'opacity', (t % 2) < 0.2 ? '1' : '0.3'); } },
};
