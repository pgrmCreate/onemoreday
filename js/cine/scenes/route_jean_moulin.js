// Sortie nord de Salon, matin. Le rond-point et la statue de Jean Moulin, bras tendus vers le ciel ; un drap blanc
// noué à ses poignets : « CALÈS → PAR LES COLLINES ». La route piétinée, glissières tordues, chaussures, une poussette.
import { alea, ciel, halo, r1, alpilles, massif, brume, humain, herbes, nuages, olivier, sol, degrade, uid } from '../lib.js';
import { onduler } from '../anim.js';

export default {
  largeur: 1.7,
  fond: '#b9cdd8',
  reglages: { poussiere: '#e6dcc4', vent: 0.3 },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#6f9cc0'], [0.6, '#b9cdd8'], [1, '#ece4d0']]) + halo(L * 0.8, 240, 600, 400, '#fff6e0', 0.4) + nuages(L, 100, 360, 8, 'jm-n', '#ffffff', 0.4) + alpilles(L, 610, 130, 'jm-alp', '#8a98a4', '#c4ccd2') + brume(L, 520, 640, '#e6e2d6', 0, 0.5, 0.3) },
    { profondeur: 0.3, svg: (L) => {
      const rnd = alea('jm-pl');
      let s = massif(L, 640, 30, 'jm-coll', '#9a9a78');
      for (let i = 0; i < 26; i++) s += olivier(rnd() * L, 650 + rnd() * 40, 40 + rnd() * 20, '#6a7454', rnd, '#4a4a3a');
      s += sol(L, 680, [[0, '#b8ae90'], [1, '#9a9078']]);
      return s;
    } },
    { profondeur: 0.5, svg: (L) => {
      const x = L * 0.5, bronze = '#15130f', rnd = alea('jm');
      // Rond-point : terre-plein herbeux, bordure.
      let s = `<ellipse cx="${x}" cy="840" rx="${L * 0.36}" ry="70" fill="#6f7452"/><ellipse cx="${x}" cy="840" rx="${L * 0.36}" ry="70" fill="none" stroke="#d8d2c2" stroke-width="10"/>`;
      s += herbes(L, 790, rnd, '#5a6040', { densite: 0.08, hMax: 30 });
      // Socle.
      s += `<path d="M${x - 130} 830h260l-20 -40h-220z" fill="#b8b0a0"/><rect x="${x - 90}" y="520" width="180" height="270" fill="#c9c2b2"/><rect x="${x + 30}" y="520" width="60" height="270" fill="#9a9282"/><rect x="${x - 104}" y="500" width="208" height="26" fill="#d8d2c2"/>`;
      s += `<text x="${x - 20}" y="640" font-family="Oswald, sans-serif" font-size="22" letter-spacing="3" text-anchor="middle" fill="#6a6252">JEAN MOULIN</text>`;
      // La statue : manteau long, bras levés en V, le drap tendu entre les poignets.
      const y0 = 500, st = `fill="${bronze}"`;
      s += `<path d="M${x - 46} ${y0}l10 -150q-4 -40 8 -70l20 -14h16l20 14q12 30 8 70l10 150z" ${st}/>`;
      s += `<path d="M${x - 40} ${y0 - 60}l-6 -120M${x + 40} ${y0 - 60}l6 -120" stroke="${bronze}" stroke-width="10"/>`;
      s += `<circle cx="${x}" cy="${y0 - 262}" r="22" ${st}/><path d="M${x - 34} ${y0 - 272}h68M${x - 20} ${y0 - 272}v-18h40v18" stroke="${bronze}" stroke-width="10" ${st}/>`;
      s += `<path d="M${x - 24} ${y0 - 226}L${x - 82} ${y0 - 330}L${x - 104} ${y0 - 420}M${x + 24} ${y0 - 226}L${x + 82} ${y0 - 330}L${x + 104} ${y0 - 420}" stroke="${bronze}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      s += `<path d="M${x - 30} ${y0 - 230}q30 -10 60 0" stroke="#3a342a" stroke-width="4" fill="none"/>`;
      s += halo(x - 60, 300, 80, 200, '#c9d8e0', 0.18);
      // Le drap : noué aux deux poignets, il pend et claque.
      const dy = y0 - 416;
      s += `<g class="drap" data-x="${x}" data-y="${dy}"><path d="M${x - 104} ${dy}Q${x} ${dy + 30} ${x + 104} ${dy}L${x + 96} ${dy + 150}Q${x} ${dy + 190} ${x - 100} ${dy + 150}z" fill="#ece8de"/><path d="M${x - 60} ${dy + 20}q10 60 -6 130M${x + 50} ${dy + 24}q-8 60 8 124" stroke="#cfc8b8" stroke-width="4" fill="none"/>`;
      s += `<text x="${x}" y="${dy + 80}" font-family="Caveat, cursive" font-size="40" text-anchor="middle" fill="#2a2a2a" transform="rotate(-3 ${x} ${dy + 80})">CALÈS →</text><text x="${x}" y="${dy + 124}" font-family="Caveat, cursive" font-size="27" text-anchor="middle" fill="#2a2a2a" transform="rotate(-2 ${x} ${dy + 124})">PAR LES COLLINES</text></g>`;
      s += `<path d="M${x - 110} ${dy - 6}l12 12M${x + 110} ${dy - 6}l-12 12" stroke="#ece8de" stroke-width="7"/>`;
      return s;
    } },
    { profondeur: 0.8, svg: (L) => {
      const rnd = alea('jm-route');
      let s = sol(L, 880, [[0, '#7a766c'], [1, '#4a4842']]);
      s += `<path d="M-10 884H${L + 10}" stroke="#d8d2c2" stroke-width="6" stroke-dasharray="80 60"/>`;
      // Glissières tordues.
      s += `<path d="M${L * 0.05} 900q200 -10 380 30q80 30 200 -20l140 10" stroke="#9a9a98" stroke-width="16" fill="none"/><path d="M${L * 0.05} 940v-40M${L * 0.15} 950v-46M${L * 0.25} 960v-40" stroke="#6a6a68" stroke-width="10"/>`;
      // Chaussures, sacs, poussette renversée, traces de pas.
      for (let i = 0; i < 26; i++) s += `<path d="M${r1(rnd() * L)} ${r1(930 + rnd() * 60)}c10 -10 30 -10 36 0z" fill="${rnd.choix(['#1c1a18', '#6a2a22', '#e8e2d6', '#2a3a5a'])}"/>`;
      const px = L * 0.72;
      s += `<g transform="rotate(-60 ${px} 970)"><path d="M${px} 970h110l20 -80h-120z" fill="#3a4a5a"/><circle cx="${px + 20}" cy="980" r="18" fill="none" stroke="#1a1a1a" stroke-width="6"/><circle cx="${px + 100}" cy="980" r="18" fill="none" stroke="#1a1a1a" stroke-width="6"/><path d="M${px + 120} 890l40 -60" stroke="#1a1a1a" stroke-width="6"/></g>`;
      return s;
    } },
    { profondeur: 1.1, svg: (L) => herbes(L, 990, alea('jm-herb'), '#6a6a3e', { densite: 0.22, hMax: 150, couche: 0.25, epais: 5, cls: 'herbes-pp' }) + herbes(L, 1000, alea('jm-herb2'), '#8a8452', { densite: 0.14, hMax: 110, couche: 0.3, epais: 4, cls: 'herbes-pp' }) },
  ],
  ambiance: ['herbes_vent'],
  anims: {
    drap_claque(t, S) {
      for (const el of S.q('.drap')) {
        const k = Math.sin(t * 5.3) * 0.5 + Math.sin(t * 8.1) * 0.3;
        S.attr(el, 'transform', `translate(${el.dataset.x},${el.dataset.y}) skewX(${(k * 12).toFixed(1)}) scale(${(1 - Math.abs(k) * 0.06).toFixed(3)},1) translate(${-el.dataset.x},${-el.dataset.y})`);
      }
    },
    herbes_vent(t, S) { onduler(t, S, '.herbes-pp', 8, 1, 0.3); },
  },
};
