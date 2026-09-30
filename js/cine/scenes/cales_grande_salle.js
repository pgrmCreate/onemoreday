// Vignette — la grande grotte de Calès : voûte de safre, torches, la foule assise, un tabouret au centre (le procès).
import { alea, r1, halo, humain, radial, uid, voile } from '../lib.js';
import { scintiller } from '../anim.js';

export default {
  largeur: 1.1,
  fond: '#1a100a',
  couches: [
    { profondeur: 0, svg: (L) => {
      const c = L / 2, id = uid('gr'), rnd = alea('grotte');
      let s = `<defs>${radial(id, [[0, '#6a4a2a', 1], [0.6, '#3a2616', 1], [1, '#140c08', 1]])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      // Voûte : strates de safre, arêtes.
      let d = ''; for (let k = 0; k < 14; k++) { const y = 40 + k * 40; d += `M${c - 1200} ${y + 200}Q${c} ${y - 180 + rnd() * 40} ${c + 1200} ${y + 200}`; }
      s += `<path d="${d}" stroke="#8a6a40" stroke-width="5" fill="none" opacity="0.25"/>`;
      s += `<path d="M-10 -10H${L + 10}V200Q${c} -40 -10 200z" fill="#0e0806"/>`;
      for (const x of [c - 700, c - 250, c + 250, c + 700]) s += `<g class="torche">${halo(x, 420, 320, 300, '#f4a23c', 0.6)}<path d="M${x} 520v-90" stroke="#2a1a10" stroke-width="10"/><path d="M${x - 12} 430q12 -44 12 -56q12 22 12 56z" fill="#ffc060"/></g>`;
      return s;
    } },
    { profondeur: 0.55, svg: (L) => {
      const c = L / 2;
      // Le tabouret au centre, dans la lumière.
      return halo(c, 700, 700, 420, '#f0b060', 0.35) + halo(c, 820, 300, 140, '#f0c26a', 0.5) + `<ellipse cx="${c}" cy="830" rx="200" ry="40" fill="#5a3e22" opacity="0.6"/><path d="M${c - 50} 800h100M${c - 40} 800l-12 60M${c + 40} 800l12 60M${c} 800v60" stroke="#2a1a10" stroke-width="12"/>`;
    } },
    { profondeur: 0.9, svg: (L) => {
      const rnd = alea('assemblee');
      let s = '';
      for (let r = 0; r < 3; r++) for (let x = -60 + r * 40; x < L + 60; x += 120 + rnd() * 40) {
        if (Math.abs(x - L / 2) < 300 && r < 2) continue;
        s += humain(x, 900 + r * 60, 280 + r * 50, 'assis', { corps: rnd.choix(['#140c08', '#1c120c', '#20160e']), sens: x < L / 2 ? 1 : -1 });
      }
      return s + voile(L, '#0a0604', 0.2);
    } },
  ],
  ambiance: ['torches'],
  anims: { torches(t, S) { scintiller(t, S, '.torche', 0.65, 1, 10); } },
};
