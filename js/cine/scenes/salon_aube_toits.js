// L'aube depuis la maison de Nostradamus : ciel rose-gris, brume basse, le Puech et l'Empéri (du linge sur les
// remparts), la mer de toits et ses fumées droites — pas un souffle — ; la lucarne et son rebord de pierre.
import { panache, alea, ciel, halo, r1, mix, sombre, merToits, emperi, brume, nuages, oiseau, touffe, degrade, uid } from '../lib.js';
import { onduler } from '../anim.js';

export default {
  largeur: 2.4,
  fond: '#b48f8a',
  reglages: { brouillard: '#e6cfc6' },
  couches: [
    { profondeur: 0, svg: (L) => {
      let s = ciel(L, [[0, '#5e5866'], [0.35, '#7c6f78'], [0.7, '#c9998e'], [0.85, '#e8b8a0'], [1, '#f0cdb4']]);
      s += halo(L * 0.28, 600, 900, 300, '#ffe0c0', 0.5) + halo(L * 0.28, 610, 200, 90, '#fff4e0', 0.6);
      s += nuages(L, 120, 420, Math.round(L / 300), 'aube-n', '#f0c8b8', 0.35, '#8a7680');
      s += `<path d="M-20 640Q${L * 0.25} 600 ${L * 0.5} 625T${L + 20} 615V800H-20Z" fill="#8f7c86" opacity="0.8"/>`;
      let o = ''; const rnd = alea('martinets');
      for (let i = 0; i < 14; i++) o += `<g class="martinet" data-x="${r1(rnd() * L)}" data-y="${r1(120 + rnd() * 300)}" data-p="${r1(rnd() * 6)}">${oiseau(0, 0, 14 + rnd() * 8, '#2a2228')}</g>`;
      return s + o;
    } },
    { profondeur: 0.25, svg: (L) => {
      let s = emperi(L * 0.66, 690, 880, { roc: '#6f5e66', mur: '#9a8284', ombre: '#5a4a54', toit: '#6a4e50' });
      // Linge tendu sur les remparts.
      const x0 = L * 0.66 - 380, y0 = 690 - 880 * 0.22 * 0.92 - 105;
      s += `<path d="M${r1(x0)} ${r1(y0)}q200 30 420 0" stroke="#4a3a40" stroke-width="3" fill="none"/>`;
      const couleurs = ['#e8e2d6', '#c9a0a0', '#9ab0c8', '#e8d8b0', '#f0f0ea'];
      for (let i = 0; i < 9; i++) { const x = x0 + 30 + i * 44, y = y0 + 8 + Math.sin(i / 8 * Math.PI) * 14; s += `<g class="linge" data-x="${r1(x)}" data-y="${r1(y)}"><rect x="${r1(x)}" y="${r1(y)}" width="30" height="${36 + (i % 3) * 12}" fill="${couleurs[i % 5]}"/></g>`; }
      return s + brume(L, 560, 760, '#e6cfc6', 0, 0.55, 0.3);
    } },
    { profondeur: 0.55, svg: (L) => {
      const rnd = alea('aube-toits');
      let s = merToits(L, 700, 930, rnd, { tuile: '#b06a52', ombre: '#6a3a34', mur: '#b89a88', rangs: 7, voile: '#d8b0a4', voileO: 0.7 });
      // Houppiers des platanes du cours, immobiles.
      for (let x = rnd() * 300; x < L; x += 500 + rnd() * 400) s += `<g class="platane-loin">${touffe(x, 760, 90, '#4f5a3e', rnd, 30)}${touffe(x - 20, 740, 60, '#6a7450', rnd, 14)}</g>`;
      // Fumées de cheminées, droites.
      for (let i = 0; i < 9; i++) { const x = rnd() * L, y = 720 + rnd() * 160; s += `<g class="fumee-droite">${panache(x, y, 240 + rnd() * 120, 26, '#efe2dc', rnd, { vent: 0.03, o: 0.16, n: 30 })}</g>`; }
      return s + brume(L, 800, 1000, '#e6cfc6', 0, 0.35, 0.1);
    } },
    { profondeur: 1, svg: (L) => {
      // Lucarne et rebord de pierre : cadre du premier plan.
      const pierre = '#3a302e', id = uid('pie');
      let s = `<defs>${degrade(id, [[0, '#4a3e3a'], [1, '#221c1c']])}</defs>`;
      s += `<path d="M-20 -20H${L * 0.13}V1020H-20Z" fill="url(#${id})"/><path d="M${L * 0.13} -20v1040" stroke="#6a5652" stroke-width="10"/>`;
      s += `<path d="M-20 900H${L + 20}V1020H-20Z" fill="${pierre}"/><path d="M-20 900H${L + 20}" stroke="#8a706a" stroke-width="8"/>`;
      s += `<path d="M-20 -20H${L + 20}V40H-20Z" fill="${sombre(pierre, 0.3)}"/>`;
      // Un pot de géranium et une tasse sur le rebord.
      const px = L * 0.86;
      s += `<path d="M${px - 50} 900l10 -80h80l10 80z" fill="#8a4a32"/><circle cx="${px}" cy="790" r="44" fill="#2e3a24"/><circle cx="${px - 20}" cy="770" r="10" fill="#b8322c"/><circle cx="${px + 18}" cy="782" r="9" fill="#c8423a"/>`;
      s += `<path d="M${L * 0.5} 900v-40h50v40z" fill="#d8d0c0"/><path d="M${L * 0.5 + 50} 868q20 6 0 22" stroke="#d8d0c0" stroke-width="6" fill="none"/>`;
      return s;
    } },
  ],
  anims: {
    martinets(t, S) {
      for (const el of S.q('.martinet')) {
        const d = el.dataset, p = +d.p;
        const x = +d.x + Math.sin(t * 0.9 + p) * 260 + t * 60, y = +d.y + Math.sin(t * 1.7 + p * 2) * 60;
        S.attr(el, 'transform', `translate(${r1(x)},${r1(y)}) scale(1,${(0.5 + 0.5 * Math.abs(Math.sin(t * 9 + p))).toFixed(2)})`);
      }
    },
    fumees_droites(t, S) { S.q('.fumee-droite').forEach((el, i) => { S.attr(el, 'transform', `translate(${(Math.sin(t * 0.3 + i) * 3).toFixed(1)},0)`); }); },
    linge_emperi(t, S) { S.q('.linge').forEach((el, i) => S.attr(el, 'transform', `rotate(${(Math.sin(t * 0.8 + i) * 2).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`)); },
    platanes_immobiles(t, S) { onduler(t, S, '.platane-loin', 0.6, 0.3, 0.05); },
  },
};
