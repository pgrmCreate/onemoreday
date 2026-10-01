// Le cours Victor-Hugo, nuit des sonnailles. Même rue que le marché, sous les étoiles : la marée des morts remplit
// le cours d'un trottoir à l'autre ; devant, des silhouettes droites, cloche au cou, lampe au poing ; au fond, l'Empéri
// et ses torches.
import { alea, r1, foule, humain, halo, degrade, uid, voile } from '../lib.js';
import { scintiller, onduler } from '../anim.js';
import { MATIN, coucheCiel, coucheFacades, couchePlatanes } from './rue_commune.js';

const P = Object.assign({}, MATIN, {
  ciel: [[0, '#05060a'], [0.55, '#10121a'], [1, '#2e2a34']], soleil: null, nuages: null, etoiles: true,
  lointain: '#12141c', rocher: '#1c1e28', nuit: 1, lumiere: 0, tonalite: ['#1a1c28', 0.5], voileFond: ['#2a2630', 0.3],
  feuille: ['#080a0a', '#0e1210', '#161c16'], tronc: '#2a2a2c', taches: ['#1c1c1e', '#343436', '#262628'],
  sol: [[0, '#1a1c22'], [1, '#08090c']], rayons: null, tachesSol: null, trous: '#1a1c28', torches: true, uEmperi: 0.9,
  enseignes: true,
});
const TEINTES = ['#050608', '#08090c', '#0b0c10', '#0e0f13'];

function marée(L, rnd, y, h, rangs, esp, cls) {
  return `<g class="${cls}">` + foule(L, y, h, rnd, { couleurs: TEINTES, poses: ['mort', 'mort', 'mort_bras'], rangs, espace: esp, x0: -900, x1: L + 100, sens: 1 }).svg + '</g>';
}

export default {
  largeur: 2.5,
  fond: '#0e1016',
  reglages: { poussiere: '#8a8a90', lampe: [0.5, 0.95] },
  couches: [
    { profondeur: 0, svg: coucheCiel(P, 'cours') },
    { profondeur: 0.28, svg: coucheFacades(P, 'cours') },
    { profondeur: 0.28, nom: 'maree-loin', svg: (L) => marée(L, alea('tr-loin'), 745, 150, 2, 0.2, 'mt-loin') },
    { profondeur: 0.48, nom: 'maree-mil', svg: (L) => marée(L, alea('tr-mil'), 850, 250, 2, 0.18, 'mt-mil') },
    { profondeur: 0.48, svg: couchePlatanes(P, 'cours') },
    { profondeur: 0.72, svg: (L) => halo(L * 0.5, 900, L * 0.7, 160, '#5a4a4a', 0.5) },
    { profondeur: 0.72, nom: 'maree-pres', svg: (L) => `<g class="maree">${marée(L, alea('tr-pres'), 960, 360, 3, 0.18, 'mt-pres')}</g>` },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('sonnailleurs'); const id = uid('fx');
      let s = `<defs>${degrade(id, [[0, '#e8d49a', 0.55], [1, '#e8d49a', 0]], 'h')}</defs>`;
      for (let i = 0; i < 7; i++) {
        const x = L * (0.08 + i * 0.13 + rnd() * 0.04), y = 1010, h = 420 + rnd() * 50;
        s += `<g class="sonnailleur" data-x="${r1(x)}" data-y="${y}" data-p="${r1(rnd() * 6)}">`;
        s += `<g class="faisceau" data-x="${r1(x + h * 0.15)}" data-y="${r1(y - h * 0.5)}"><path d="M${r1(x + h * 0.15)} ${r1(y - h * 0.5)}l1400 -260v520z" fill="url(#${id})" opacity="0.35"/></g>`;
        s += halo(x + h * 0.15, y - h * 0.5, 90, 90, '#f0dca0', 0.6);
        s += humain(x, y, h, 'porte_lampe', { corps: '#040405', sonnaille: '#b8a060', lampe: '#fff2c8' }, rnd());
        s += `</g>`;
      }
      return s + voile(L, '#000', 0.12);
    } },
  ],
  ambiance: ['emperi_lointain'],
  anims: {
    troupeau_coule(t, S) {
      // La marée avance d'un bloc (pas de bouclage : elle est dessinée assez large pour toute la séquence).
      const vit = { 'mt-loin': 16, 'mt-mil': 26, 'mt-pres': 38 };
      for (const cls of Object.keys(vit)) S.decaler(cls.replace('mt', 'maree'), Math.min(vit[cls] * t, 880), -Math.abs(Math.sin(t * 1.6)) * 3);
    },
    lampes_de_tete(t, S) { S.q('.faisceau').forEach((el, i) => S.attr(el, 'transform', `rotate(${(Math.sin(t * 0.7 + i * 1.3) * 9 - 4).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`)); },
    sonnailleurs_marchent(t, S) { S.q('.sonnailleur').forEach(el => S.attr(el, 'transform', `translate(${r1(t * 26)},${r1(-Math.abs(Math.sin(t * 2.2 + +el.dataset.p)) * 8)})`)); },
    troupeau_tourne(t, S) {
      const k = Math.min(1, S.tp / 6);
      for (const el of S.q('.maree')) S.attr(el, 'transform', `translate(${r1(k * 200)},${r1(-k * 40)}) skewX(${(-k * 8).toFixed(2)})`);
    },
    emperi_lointain(t, S) { scintiller(t, S, '.torche-emperi', 0.5, 1, 11); },
  },
};
