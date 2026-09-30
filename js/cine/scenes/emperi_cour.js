// Vignette — la cour d'honneur de l'Empéri : galerie Renaissance, linge entre les colonnes, marmite sur un feu de
// palettes, tableau d'ardoise, tour d'angle avec une antenne sur un bâton de ski.
import { alea, ciel, halo, r1, humain, panache, voile, creneaux, nuages } from '../lib.js';
import { scintiller, onduler } from '../anim.js';

export default {
  largeur: 1.15,
  fond: '#6a7280',
  reglages: { fumee: '#6a6a6a' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#5a6a80'], [1, '#b8b4a8']]) + nuages(L, 60, 260, 6, 'cour-n', '#d8d4cc', 0.5) },
    { profondeur: 0.35, svg: (L) => {
      const c = L / 2, pierre = '#b8a888';
      let s = `<rect x="-5" y="220" width="${L + 10}" height="620" fill="${pierre}"/>`;
      // Tour d'angle, antenne sur bâton de ski.
      s += `<rect x="${c + 620}" y="80" width="200" height="760" fill="#a89878"/>` + creneaux(c + 620, 80, 200, 22, '#a89878') + `<path d="M${c + 720} 58V-40M${c + 690} -10h60M${c + 700} 20h40" stroke="#2a2a2a" stroke-width="5"/>`;
      // Galerie Renaissance : arcades sur colonnes, deux niveaux.
      for (let k = 0; k < 7; k++) {
        const x = c - 900 + k * 220;
        s += `<path d="M${x} 840V640a90 90 0 0 1 180 0V840z" fill="#3a3228"/><path d="M${x} 560V420a90 90 0 0 1 180 0V560z" fill="#4a4034"/><rect x="${x - 20}" y="560" width="220" height="16" fill="#cfc0a0"/>`;
      }
      // Linge entre les colonnes.
      s += `<path d="M${c - 900} 660Q${c - 500} 700 ${c + 460} 660" stroke="#2a2420" stroke-width="3" fill="none"/>`;
      const rnd = alea('cour-linge');
      for (let i = 0; i < 22; i++) { const x = c - 880 + i * 60; s += `<g class="linge" data-x="${x}" data-y="${672}"><rect x="${x}" y="${668 + Math.sin(i / 21 * Math.PI) * 30}" width="40" height="${50 + rnd() * 30}" fill="${rnd.choix(['#e8e2d6', '#9ab0c8', '#c96a5a', '#e8d8b0', '#6a8a6a', '#3a4a6a'])}"/></g>`; }
      return s;
    } },
    { profondeur: 0.7, svg: (L) => {
      const c = L / 2, rnd = alea('cour-feu');
      let s = `<rect x="-5" y="830" width="${L + 10}" height="180" fill="#8a7e68"/>`;
      // Marmite sur feu de palettes, tableau d'ardoise.
      s += `<g class="feu">${halo(c - 200, 900, 200, 120, '#f4a23c', 0.55)}<path d="M${c - 260} 930l60 -60l60 60z" fill="#ffb040"/></g><path d="M${c - 290} 940h180M${c - 280} 925h160" stroke="#6a4a2a" stroke-width="12"/><path d="M${c - 260} 870h120v-60h-120z" fill="#1a1a1a"/>`;
      s += panache(c - 200, 800, 420, 50, '#9a9a98', rnd, { vent: 0.2, o: 0.4 });
      s += `<rect x="${c + 150}" y="680" width="260" height="170" fill="#1e2420"/><path d="M${c + 170} 870l10 -20M${c + 390} 870l-10 -20" stroke="#4a3a2a" stroke-width="8"/><text x="${c + 280}" y="730" font-family="Caveat, cursive" font-size="30" text-anchor="middle" fill="#e6e2d6">Eau : 2 L / pers.</text><text x="${c + 280}" y="770" font-family="Caveat, cursive" font-size="26" text-anchor="middle" fill="#e6e2d6">Garde poterne : Théo</text><text x="${c + 280}" y="806" font-family="Caveat, cursive" font-size="26" text-anchor="middle" fill="#e6e2d6">MONTRE TES BRAS</text>`;
      for (let i = 0; i < 5; i++) s += humain(c - 420 + i * 70 + (i > 2 ? 300 : 0), 960, 220 + rnd() * 30, i === 1 ? 'assis' : 'debout', { corps: rnd.choix(['#3a4a6a', '#5a3a3a', '#4a4a3a', '#2a2a30']), tete: '#b89a80', cheveux: '#2a2018', sens: rnd.signe() });
      return s;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#1a1c22', 0.12) },
  ],
  ambiance: ['vie'],
  anims: { vie(t, S) { scintiller(t, S, '.feu', 0.7, 1, 10); S.q('.linge').forEach((el, i) => S.attr(el, 'transform', `rotate(${(Math.sin(t * 1.2 + i) * 3).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`)); } },
};
