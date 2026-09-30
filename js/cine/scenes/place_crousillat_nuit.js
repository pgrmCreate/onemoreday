// La place Crousillat, la nuit. La Tour de l'Horloge et ses trois cloches, la Fontaine Moussue,
// les terrasses renversées ; de toutes les rues, les morts convergent vers la tour, visages levés.
import { alea, ciel, etoiles, lune, halo, r1, mix, tourHorloge, fontaineMoussue, facade, humain, brume, sol, voile } from '../lib.js';
import { balancer, couler, ease } from '../anim.js';

const NUIT = '#1c2230', PIERRE = '#5c5a5e', SIL = '#07080c';

function terrasse(x, y, s, rnd) {
  let g = '';
  // Table ronde, chaises (certaines renversées), parasol plié.
  g += `<ellipse cx="${x}" cy="${y - 110 * s}" rx="${60 * s}" ry="${12 * s}" fill="#15171e"/><path d="M${x} ${y - 110 * s}V${y}M${x - 30 * s} ${y}h${60 * s}" stroke="#15171e" stroke-width="${8 * s}"/>`;
  const chaise = (cx, rot) => `<g transform="rotate(${rot} ${cx} ${y})"><path d="M${cx} ${y}v${-70 * s}h${50 * s}v${70 * s}M${cx} ${y - 70 * s}v${-60 * s}" stroke="#1b1e27" stroke-width="${7 * s}" fill="none"/></g>`;
  g += chaise(x - 120 * s, rnd() < 0.5 ? -80 : 0) + chaise(x + 80 * s, rnd() < 0.5 ? 75 : 0);
  if (rnd() < 0.5) g += `<path d="M${x + 10 * s} ${y}V${y - 300 * s}" stroke="#20232c" stroke-width="${6 * s}"/><path d="M${x - 8 * s} ${y - 300 * s}q${18 * s} ${-20 * s} ${36 * s} 0l${-6 * s} ${170 * s}h${-24 * s}z" fill="#3a2226"/>`;
  return g;
}
function mortConverge(x, y, h, cible, rnd) {
  const v = (cible > x ? 1 : -1) * (26 + rnd() * 30);
  return `<g class="converge" data-x="${r1(x)}" data-c="${r1(cible)}" data-v="${r1(v)}" data-y="${r1(y)}" transform="translate(${r1(x)},${r1(y)})">${humain(0, 0, h, 'mort_leve', { corps: SIL, sens: v > 0 ? 1 : -1 })}</g>`;
}

export default {
  largeur: 1.7,
  fond: NUIT,
  reglages: { lampe: [0.5, 0.95], brouillard: '#4a5068' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#0a0d16'], [0.6, NUIT], [1, '#2c3142']]) + etoiles(L, 700, 220, 'crousillat') + lune(L * 0.8, 150, 30, '#dcd8c8') },
    { profondeur: 0.22, svg: (L) => {
      const rnd = alea('crous-fond');
      let s = '';
      for (let x = -40; x < L; x += 200 + rnd() * 80) s += facade(x, 820, 190 + rnd() * 80, 380 + rnd() * 160, rnd, { nuit: 1, enseigne: null, store: false });
      s += halo(L * 0.5, 180, 500, 400, '#8a94b8', 0.12);
      s += tourHorloge(L * 0.5, 830, 760, { pierre: PIERRE, fer: '#0a0b10', cadran: '#b8b4a4', porte: '#050608' });
      s += halo(L * 0.5 + 60, 300, 160, 420, '#9aa6d0', 0.18);
      // Porte au pied de la tour : un rai de lumière, une main.
      const px = L * 0.5;
      s += `<g class="porte-lumiere" opacity="0">${halo(px, 800, 140, 70, '#e8d49a', 0.6)}<rect class="rai" x="${px - 3}" y="700" width="6" height="130" fill="#f4e2aa"/><path d="M${px + 6} 752c10 -4 18 2 18 10l-4 12l-14 2z" fill="#0a0a0c" class="main-porte"/></g>`;
      s += brume(L, 600, 840, '#2a3048', 0, 0.5, 0.2);
      return s;
    } },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('crous-hotel');
      let s = '';
      // Grand Hôtel de la Poste à gauche, maisons à droite, fenêtres noires.
      s += facade(L * 0.04, 880, L * 0.22, 600, rnd, { nuit: 0.95, mur: '#c9b48e', enseigne: 'GRAND HÔTEL DE LA POSTE', store: false, etages: 4 });
      s += facade(L * 0.74, 880, L * 0.24, 520, rnd, { nuit: 0.95, store: ['#5a2a2a', '#c8b89a'], enseigne: 'BRASSERIE' });
      s += sol(L, 878, [[0, '#2a2e3a'], [1, '#12141b']]);
      return s;
    } },
    { profondeur: 0.7, svg: (L) => fontaineMoussue(L * 0.63, 950, 330, { mousse: '#1b2618', mousse2: '#2a3a24', pierre: '#34343a', eau: '#6f8290' }) },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('crous-pp');
      let s = '';
      for (let x = 120; x < L; x += 560 + rnd() * 300) { if (Math.abs(x - L * 0.5) < 380) continue; s += terrasse(x, 1000, 1.15, rnd); }
      for (let i = 0; i < 46; i++) {
        const cote = rnd() < 0.5 ? -1 : 1;
        const x = L * 0.5 + cote * (L * 0.3 + rnd() * L * 0.35), cible = L * 0.5 + cote * (80 + rnd() * L * 0.22);
        s += mortConverge(x, 960 + rnd() * 90, 360 + rnd() * 120, cible, rnd);
      }
      return s + voile(L, '#0a0c14', 0.25);
    } },
  ],
  ambiance: ['fontaine_coule'],
  anims: {
    cloches_balancent(t, S) { balancer(t, S, '.cloche', 22, 0.55, 1.4); },
    fontaine_coule(t, S) { couler(t, S, '.filets path', 50); },
    silhouettes_convergent(t, S) {
      for (const el of S.q('.converge')) {
        const d = el.dataset; const x0 = +d.x, c = +d.c, v = +d.v;
        let x = x0 + v * t; if ((v > 0 && x > c) || (v < 0 && x < c)) x = c + Math.sin(t * 0.7 + x0) * 4;
        S.attr(el, 'transform', `translate(${r1(x)},${r1(+d.y - Math.abs(Math.sin(t * 2 + x0)) * 6)})`);
      }
    },
    porte_entrouverte(t, S) {
      const k = ease((S.tp - 0.8) / 2.5);
      for (const el of S.q('.porte-lumiere')) S.attr(el, 'opacity', k.toFixed(2));
      for (const el of S.q('.rai')) { const w = 6 + k * 34; S.attr(el, 'width', r1(w)); S.attr(el, 'x', r1(+el.getAttribute('x') + 0)); }
    },
  },
};
