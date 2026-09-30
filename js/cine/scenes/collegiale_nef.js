// Vignette — la nef gothique de Saint-Laurent : très haute, bancs, des dizaines de silhouettes debout tournées vers
// l'autel, le prêtre en aube avec sa clochette, la grille de la chapelle de la Vierge, la plaque de Nostradamus, cierges.
import { alea, r1, halo, degrade, uid, humain, foule, voile, grilleFer } from '../lib.js';
import { scintiller, balancer } from '../anim.js';

export default {
  largeur: 1.1,
  fond: '#0e0c10',
  couches: [
    { profondeur: 0, svg: (L) => {
      const c = L / 2, id = uid('nef');
      let s = `<defs>${degrade(id, [[0, '#0a080c'], [0.6, '#1e1a1e'], [1, '#2a2226']])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      // Arcs brisés et piliers en perspective.
      for (let k = 0; k < 5; k++) { const w = 900 - k * 150, h = 900 - k * 110, o = 0.8 - k * 0.12; s += `<path d="M${c - w} 1010V${1000 - h * 0.55}Q${c - w} ${1000 - h * 1.05} ${c} ${1000 - h * 1.12}Q${c + w} ${1000 - h * 1.05} ${c + w} ${1000 - h * 0.55}V1010" fill="none" stroke="#2e282c" stroke-width="${60 - k * 8}" opacity="${o}"/>`; }
      // Vitrail haut, autel, lumière.
      s += `<path d="M${c - 60} 330V200q60 -80 120 0v130z" fill="#3a2a5a"/>${halo(c, 280, 200, 200, '#8a6ab0', 0.25)}`;
      s += `<rect x="${c - 180}" y="700" width="360" height="90" fill="#6a5a4a"/>${halo(c, 690, 400, 200, '#f0c26a', 0.35)}`;
      s += `<rect x="${c + 540}" y="480" width="160" height="90" fill="#8a847a"/><text x="${c + 620}" y="530" font-family="EB Garamond, serif" font-size="18" text-anchor="middle" fill="#2a2622">NOSTRADAMUS</text>`;
      s += grilleFer(c - 800, 500, 240, 300, '#0a0808', 22, 5);
      return s;
    } },
    { profondeur: 0.5, svg: (L) => {
      const c = L / 2, rnd = alea('cierges');
      let s = '';
      for (let i = 0; i < 26; i++) { const x = c - 300 + rnd() * 600, y = 700 + rnd() * 20; s += `<g class="cierge">${halo(x, y - 20, 40, 40, '#f0c26a', 0.5)}<rect x="${r1(x - 3)}" y="${r1(y - 30)}" width="6" height="30" fill="#e8e0cc"/></g>`; }
      // Le prêtre en aube, clochette levée.
      s += humain(c + 60, 790, 230, 'leve_cloche', { corps: '#d8d2c4', tete: '#a88a70', sens: -1 });
      s += `<g class="clochette-pretre" data-x="${c + 40}" data-y="${568}"><path d="M${c + 30} 590c2 -6 6 -8 8 -18h8c2 10 6 12 8 18z" fill="#b08a40"/></g>`;
      return s;
    } },
    { profondeur: 0.8, svg: (L) => {
      const rnd = alea('nef-foule');
      let s = foule(L, 1000, 380, rnd, { couleurs: ['#07060a', '#0a080c', '#0c0a0e'], poses: ['mort_leve', 'debout', 'mort'], rangs: 3, espace: 0.2, sens: 1 }).svg;
      let b = ''; for (let k = 0; k < 4; k++) b += `<rect x="-5" y="${860 + k * 40}" width="${L + 10}" height="14" fill="#2a1e16"/>`;
      return b + s + voile(L, '#000', 0.2);
    } },
  ],
  ambiance: ['vie'],
  anims: { vie(t, S) { scintiller(t, S, '.cierge', 0.6, 1, 12); balancer(t, S, '.clochette-pretre', 20, 1.3); } },
};
