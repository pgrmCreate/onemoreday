// Salon, trois semaines après : plein jour, ciel lavé par le vent, le cours désert.
// La Tour de l'Horloge (arrêtée à 21 h 10) et l'Empéri au-dessus des toits, les platanes qui ploient.
import { alea, r1, halo, mix, sombre, voiture, tourHorloge, gisant, uid, radial, touffe } from '../lib.js';
import { onduler, ployer } from '../anim.js';
import { MATIN, coucheCiel, coucheFacades, couchePlatanes, coucheVoute } from './_cours.js';

const P = Object.assign({}, MATIN, {
  ciel: [[0, '#2f6aa6'], [0.45, '#5d8fb8'], [0.8, '#a9c3d6'], [1, '#d6dde0']],
  soleil: [0.75, 90, '#ffffff', 0.35], nuages: '#f4f6f8', nuagesO: 0.55, ventreNuages: '#b9c9d6',
  lointain: '#8ea3b3', rocher: '#b8bdb8', tonalite: ['#a9bccb', 0.22], voileFond: ['#d6e2ea', 0.14],
  feuille: ['#34452a', '#56693a', '#a2ab5a'], tronc: '#aaa38e', sol: [[0, '#c9c6ba'], [0.3, '#9c9a90'], [1, '#5c5c58']],
  rayons: null, tachesSol: null, trous: '#9fc0da', lumiere: 0, tour: 0.44, vouteH: 150,
});

function journal(x, y, s) {
  return `<g class="journal" data-x="${x}" data-y="${y}"><g class="journal-f"><path d="M${-60 * s} ${-40 * s}l${120 * s} ${-10 * s}l${6 * s} ${84 * s}l${-122 * s} ${8 * s}z" fill="#e8e4d8"/><path d="M${-50 * s} ${-26 * s}h${60 * s}M${-50 * s} ${-12 * s}h${90 * s}M${-50 * s} ${2 * s}h${90 * s}M${-50 * s} ${16 * s}h${70 * s}" stroke="#8a867c" stroke-width="${4 * s}"/><rect x="${20 * s}" y="${-30 * s}" width="${30 * s}" height="${24 * s}" fill="#6a6860"/><path d="M${-60 * s} ${-40 * s}l${60 * s} ${20 * s}" stroke="#c8c2b2" stroke-width="${2 * s}"/></g></g>`;
}

export default {
  largeur: 2.7,
  fond: '#5d8fb8',
  reglages: { poussiere: '#e6e2d6', vent: 0.6 },
  couches: [
    { profondeur: 0, svg: (L, H) => {
      let s = coucheCiel(P, 'cours')(L, H);
      s += `<g class="drone" transform="translate(${L * 0.1},200)"><rect x="-16" y="-5" width="32" height="10" rx="4" fill="#4a4e54"/><path d="M-30 -8h18M12 -8h18" stroke="#3a3e44" stroke-width="3"/><circle cx="0" cy="6" r="3" fill="#b8322c" class="drone-led"/></g>`;
      return s;
    } },
    { profondeur: 0.28, svg: coucheFacades(P, 'cours') },
    { profondeur: 0.48, svg: couchePlatanes(P, 'cours', { voute: false }) },
    { profondeur: 0.48, nom: 'voute', svg: coucheVoute(P, 'cours') },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('mistral-vide');
      let s = `<rect x="-5" y="850" width="${L + 10}" height="160" fill="#1c2430" opacity="0.12"/>`;
      const couleurs = ['#8a2a26', '#d8d6cc', '#2a3a4e', '#6a6e70', '#b8a070', '#3a4a3a'];
      for (let x = 80 + rnd() * 200; x < L; x += 520 + rnd() * 500) {
        s += voiture(x, 930 + rnd() * 20, 360 + rnd() * 60, mix(rnd.choix(couleurs), '#9fb4c4', 0.15), { portiere: rnd() < 0.7 });
        if (rnd() < 0.4) s += `<path d="M${r1(x + 180)} 950l40 -6l10 20z" fill="#cfd2cc" opacity="0.7"/>`;
      }
      // Débris : cageots, chaussure, un corps sous un drap.
      for (let k = 0; k < 16; k++) { const x = rnd() * L; s += `<rect x="${r1(x)}" y="${r1(940 + rnd() * 40)}" width="${r1(30 + rnd() * 40)}" height="${r1(14 + rnd() * 14)}" fill="#8a7a5a" transform="rotate(${r1(rnd() * 40 - 20)} ${r1(x)} 960)"/>`; }
      s += gisant(L * 0.58, 978, 240, '#c9ccc4', { housse: true });
      s += `<path d="M${L * 0.58 - 20} 985q120 -10 260 6" stroke="#5a1418" stroke-width="6" opacity="0.5" fill="none"/>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('mistral-pp');
      let s = '';
      // Chaise de terrasse renversée, feuilles au sol.
      s += `<g transform="rotate(-70 ${L * 0.2} 1000)"><path d="M${L * 0.2} 1000v-160h120v160M${L * 0.2} 920h120M${L * 0.2} 840v-150" stroke="#2a2e32" stroke-width="10" fill="none"/></g>`;
      for (let k = 0; k < 40; k++) s += `<ellipse cx="${r1(rnd() * L)}" cy="${r1(985 + rnd() * 20)}" rx="12" ry="5" fill="${rnd.choix(['#8a7a3a', '#a08a4a', '#6a6a3a'])}"/>`;
      for (let k = 0; k < 18; k++) s += `<g class="feuille-vole" data-x="${r1(rnd() * L)}" data-y="${r1(300 + rnd() * 650)}" data-v="${r1(500 + rnd() * 500)}" data-p="${r1(rnd() * 10)}"><ellipse cx="0" cy="0" rx="14" ry="6" fill="${rnd.choix(['#8a7a3a', '#a89a50', '#5a6a2a'])}"/></g>`;
      s += journal(0, 0, 1.6);
      return s;
    } },
  ],
  ambiance: ['ciel_file'],
  anims: {
    platanes_vent(t, S) {
      ployer(t, S, '.arbre', 1.5, 1.2, 0.35, 2.5);
      onduler(t, S, '.houppier', 26, 6, 0.5, 0.7);
      S.decaler('voute', Math.sin(t * 2.5) * 26 + Math.sin(t * 4.1) * 8, Math.cos(t * 2) * 6);
    },
    journal_vole(t, S) {
      const L = S.couches[S.couches.length - 1].L;
      for (const el of S.q('.journal')) {
        const cyc = 5.5, k = (t % cyc) / cyc;
        const x = -300 + k * (L * 0.55) + S.tp * 60 + L * 0.2, y = 820 - Math.sin(k * Math.PI) * 420 + Math.sin(t * 5) * 30;
        S.attr(el, 'transform', `translate(${r1(x)},${r1(y)}) rotate(${r1(t * 170 % 360)}) scale(1,${Math.cos(t * 4).toFixed(2)})`);
      }
      for (const el of S.q('.feuille-vole')) {
        const d = el.dataset; const span = L + 400;
        const x = ((+d.x + +d.v * t) % span + span) % span - 200, y = +d.y + Math.sin(t * 3 + +d.p) * 40;
        S.attr(el, 'transform', `translate(${r1(x)},${r1(y)}) rotate(${r1(t * 300 + +d.p * 40)})`);
      }
    },
    drone_passe(t, S) {
      const L = S.couches[0].L;
      for (const el of S.q('.drone')) S.attr(el, 'transform', `translate(${r1(L * 0.05 + S.tp * 180)},${r1(210 + Math.sin(t * 1.3) * 12)})`);
      for (const el of S.q('.drone-led')) S.attr(el, 'opacity', (t % 1) < 0.15 ? '1' : '0.2');
    },
    ciel_file(t, S) { for (const el of S.q('.nuages-ciel')) S.attr(el, 'transform', `translate(${r1(t * 38)},0)`); },
  },
};
