// Vignette — le parvis des urgences : ambulances en épi portes ouvertes, tente militaire effondrée, housses contre le
// mur, drap « ICI ON SOIGNE ENCORE ».
import { alea, ciel, r1, halo, gisant, voile, nuages } from '../lib.js';

function ambu(x, y, s) {
  let g = `<rect x="${x}" y="${y - 200 * s}" width="${330 * s}" height="${170 * s}" fill="#e8e6de"/><rect x="${x + 330 * s}" y="${y - 150 * s}" width="${90 * s}" height="${120 * s}" fill="#dcdad2"/><path d="M${x + 340 * s} ${y - 150 * s}l${40 * s} ${-40 * s}h${40 * s}v${40 * s}z" fill="#2a3440"/>`;
  g += `<rect x="${x}" y="${y - 120 * s}" width="${420 * s}" height="${16 * s}" fill="#e0b020"/><rect x="${x + 140 * s}" y="${y - 180 * s}" width="${40 * s}" height="${40 * s}" fill="#2a4a8a"/><path d="M${x + 160 * s} ${y - 176 * s}v32M${x + 144 * s} ${y - 160 * s}h32" stroke="#e8e6de" stroke-width="${8 * s}"/>`;
  g += `<path d="M${x} ${y - 200 * s}l${-70 * s} ${-10 * s}v${170 * s}l${70 * s} ${10 * s}z" fill="#cfcdc4"/>`;
  for (const rx of [70, 330]) g += `<circle cx="${x + rx * s}" cy="${y - 20 * s}" r="${30 * s}" fill="#141414"/>`;
  return g;
}

export default {
  largeur: 1.15,
  fond: '#5a5e64',
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#4a4e58'], [1, '#9a9890']]) + nuages(L, 60, 300, 6, 'parvis-n', '#8a8a88', 0.6) },
    { profondeur: 0.4, svg: (L) => {
      const c = L / 2;
      let s = `<rect x="-5" y="240" width="${L + 10}" height="520" fill="#b8b4aa"/>`;
      for (let k = 0; k < 10; k++) s += `<rect x="${c - 1000 + k * 200}" y="300" width="120" height="90" fill="#3a3e46"/>`;
      s += `<rect x="${c - 400}" y="560" width="800" height="200" fill="#2a2e36"/><rect x="${c - 400}" y="500" width="800" height="60" fill="#b8322c"/><text x="${c}" y="542" font-family="Oswald, sans-serif" font-size="40" letter-spacing="10" text-anchor="middle" fill="#f4f0e8">URGENCES</text>`;
      s += `<g class="drap"><path d="M${c - 330} 400h660l-10 90h-640z" fill="#e8e4da"/><text x="${c}" y="458" font-family="Caveat, cursive" font-size="48" text-anchor="middle" fill="#8e1b24">ICI ON SOIGNE ENCORE</text></g>`;
      for (let k = 0; k < 7; k++) s += gisant(c - 900 + k * 130, 770, 120, '#d4d4ce', { housse: true });
      return s;
    } },
    { profondeur: 0.75, svg: (L) => {
      const c = L / 2;
      let s = `<rect x="-5" y="770" width="${L + 10}" height="240" fill="#4a4a4c"/>`;
      s += `<g transform="rotate(-8 ${c - 600} 900)">${ambu(c - 820, 900, 1.1)}</g><g transform="rotate(10 ${c + 500} 920)">${ambu(c + 300, 930, 1.2)}</g>`;
      // Tente militaire effondrée.
      s += `<path d="M${c - 250} 930l120 -130l80 60l140 -40l80 110z" fill="#5a6040"/><path d="M${c - 130} 800l-20 130M${c + 90} 820l30 110" stroke="#3a3e2a" stroke-width="6"/>`;
      s += halo(c + 700, 820, 120, 60, '#3a7cff', 0.3);
      return s;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#1a1c22', 0.15) },
  ],
  ambiance: ['drap'],
  anims: { drap(t, S) { for (const el of S.q('.drap')) S.attr(el, 'transform', `translate(0,${(Math.sin(t * 1.8) * 3).toFixed(1)})`); } },
};
