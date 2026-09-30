// Vignette — couloir du sous-sol de l'hôpital : néons morts, tiroirs d'inox de la morgue, casiers du vestiaire,
// le cône d'une lampe.
import { r1, halo, degrade, uid, voile } from '../lib.js';

export default {
  largeur: 1.1,
  fond: '#07090a',
  reglages: { lampe: [0.5, 0.8] },
  couches: [
    { profondeur: 0, svg: (L) => {
      const c = L / 2, vy = 470, id = uid('ss');
      let s = `<defs>${degrade(id, [[0, '#0c1011'], [1, '#050606']])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      // Couloir en perspective.
      s += `<path d="M${c - 1100} -10L${c - 90} ${vy - 60}V${vy + 70}L${c - 1100} 1010z" fill="#141a1a"/><path d="M${c + 1100} -10L${c + 90} ${vy - 60}V${vy + 70}L${c + 1100} 1010z" fill="#101616"/>`;
      s += `<path d="M${c - 1100} 1010L${c - 90} ${vy + 70}H${c + 90}L${c + 1100} 1010z" fill="#0c1010"/><rect x="${c - 90}" y="${vy - 60}" width="180" height="130" fill="#020303"/>`;
      // Tiroirs de morgue (gauche) et casiers (droite).
      for (let k = 0; k < 4; k++) { const t = k / 4, x0 = c - 1000 + t * 700, x1 = c - 1000 + (t + 0.25) * 700, h0 = 1 - t * 0.7, h1 = 1 - (t + 0.25) * 0.7; for (let r = 0; r < 3; r++) { const y0 = vy - 300 * h0 + r * 200 * h0, y1 = vy - 300 * h1 + r * 200 * h1; s += `<path d="M${x0 + 10} ${y0 + 10}L${x1 - 10} ${y1 + 8}V${y1 + 190 * h1 - 8}L${x0 + 10} ${y0 + 190 * h0 - 10}z" fill="#5a6466" stroke="#2a3234" stroke-width="4"/><rect x="${(x0 + x1) / 2 - 10}" y="${(y0 + y1) / 2 + 80 * h0}" width="${20 * h0}" height="${8 * h0}" fill="#9aa4a6"/>`; } }
      for (let k = 0; k < 6; k++) { const t = k / 6, x0 = c + 300 + t * 700, x1 = x0 + 110, h = 0.4 + t * 0.6; s += `<rect x="${x0}" y="${vy - 260 * h}" width="${110 * h}" height="${600 * h}" fill="#3a4a5a" stroke="#1a2228" stroke-width="3"/><path d="M${x0 + 20 * h} ${vy - 220 * h}h${60 * h}M${x0 + 20 * h} ${vy - 200 * h}h${60 * h}" stroke="#1a2228" stroke-width="3"/>`; void x1; }
      // Néons morts.
      for (let k = 0; k < 4; k++) { const t = k / 4, w = 300 * (1 - t * 0.8); s += `<rect x="${c - w / 2}" y="${40 + t * 360}" width="${w}" height="${14 * (1 - t * 0.7)}" fill="#2a3032"/>`; }
      s += `<rect class="neon-mourant" x="${c - 150}" y="40" width="300" height="14" fill="#cfe8de" opacity="0"/>`;
      return s;
    } },
    { profondeur: 0.6, svg: (L) => halo(L * 0.5, 820, 520, 220, '#e8d49a', 0.35) + halo(L * 0.5, 600, 160, 260, '#e8d49a', 0.08) },
    { profondeur: 1, svg: (L) => voile(L, '#000', 0.2) },
  ],
  ambiance: ['neon'],
  anims: { neon(t, S) { for (const el of S.q('.neon-mourant')) S.attr(el, 'opacity', (t % 4.3) < 0.12 || ((t % 4.3) > 0.2 && (t % 4.3) < 0.26) ? '0.8' : '0'); } },
};
