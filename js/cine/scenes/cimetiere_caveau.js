// Vignette — intérieur d'une chapelle funéraire : étagères de marbre, cercueils de chêne, FAMILLE ROUX-BÉRENGER,
// housses blanches au sol, rai de lumière rouge sous la porte.
import { r1, halo, degrade, uid, gisant, voile } from '../lib.js';
import { scintiller } from '../anim.js';

export default {
  largeur: 1.1,
  fond: '#0a0909',
  couches: [
    { profondeur: 0, svg: (L) => {
      const c = L / 2, id = uid('cv');
      let s = `<defs>${degrade(id, [[0, '#1c1a1a'], [1, '#0c0b0b']])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      // Voûte et plaque.
      s += `<path d="M${c - 700} 1010V260Q${c} 20 ${c + 700} 260V1010" fill="none" stroke="#2a2626" stroke-width="40"/>`;
      s += `<rect x="${c - 260}" y="170" width="520" height="70" fill="#8a847a"/><text x="${c}" y="218" font-family="EB Garamond, serif" font-size="34" letter-spacing="6" text-anchor="middle" fill="#2a2622">FAMILLE ROUX-BÉRENGER</text>`;
      // Étagères de marbre et cercueils.
      for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
        const x = c + side * 420 - 230, y = 380 + k * 190;
        s += `<rect x="${x}" y="${y}" width="460" height="18" fill="#9a948a"/><path d="M${x + 20} ${y}l20 -110h380l20 110z" fill="#4a2e1c"/><path d="M${x + 40} ${y - 110}h380" stroke="#6a4a2e" stroke-width="6"/><rect x="${x + 200}" y="${y - 70}" width="60" height="16" fill="#b89a5a" opacity="0.6"/>`;
      }
      return s;
    } },
    { profondeur: 0.5, svg: (L) => {
      const c = L / 2;
      let s = `<rect x="-5" y="880" width="${L + 10}" height="130" fill="#181616"/>`;
      // Porte au fond et rai de lumière rouge dessous.
      s += `<rect x="${c - 120}" y="560" width="240" height="330" fill="#050505"/><rect class="rai-rouge" x="${c - 120}" y="884" width="240" height="8" fill="#d6303e"/>${halo(c, 900, 360, 60, '#d6303e', 0.5).replace('<ellipse', '<ellipse class="rai-rouge"')}`;
      s += gisant(c - 520, 960, 420, '#d8d6d0', { housse: true, etiquette: '#e8e0c8' }) + gisant(c + 150, 990, 470, '#cfcdc6', { housse: true });
      return s;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#000', 0.25) + halo(L * 0.5, 1000, 700, 200, '#d6303e', 0.12) },
  ],
  ambiance: ['rai'],
  anims: { rai(t, S) { scintiller(t, S, '.rai-rouge', 0.7, 1, 2); } },
};
