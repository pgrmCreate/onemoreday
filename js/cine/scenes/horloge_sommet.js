// Du sommet de la Tour de l'Horloge, la nuit. Les Alpilles en ombre et une lueur d'incendie ; la vieille ville,
// l'Empéri éteint (une fenêtre allumée) ; la foule immobile, visages levés ; la ferronnerie du campanile, le cadran vu de dos.
import { panache, alea, ciel, etoiles, halo, r1, mix, alpilles, massif, merToits, emperi, brume, cloche, voile, degrade, uid } from '../lib.js';
import { scintiller, balancer } from '../anim.js';

export default {
  largeur: 2.3,
  fond: '#0b1020',
  reglages: { fumee: '#3a2a26' },
  couches: [
    { profondeur: 0, svg: (L) => {
      let s = ciel(L, [[0, '#060914'], [0.55, '#111a33'], [0.78, '#1d2744'], [1, '#2a2638']]);
      s += etoiles(L, 520, 260, 'sommet');
      s += `<g class="incendie">${halo(L * 0.3, 450, 900, 260, '#e2551c', 0.55)}${halo(L * 0.3, 455, 320, 80, '#f4b23c', 0.75)}</g>` + panache(L * 0.3, 450, 380, 90, '#3a2622', alea('pan'), { vent: 0.6, o: 0.55, c2: '#1a1620' });
      s += alpilles(L, 470, 120, 'sommet-alp', '#0d1120', '#1c2440');
      s += `<path d="M${L * 0.27} 440q20 -60 -10 -130q40 40 30 130z" fill="#3a2a26" opacity="0.5"/>`;
      return s + brume(L, 380, 520, '#2a2c48', 0, 0.35, 0);
    } },
    { profondeur: 0.3, svg: (L) => {
      const rnd = alea('sommet-toits');
      let s = massif(L, 560, 40, 'sommet-plaine', '#0e1322');
      s += emperi(L * 0.8, 600, 900, { roc: '#141a2a', mur: '#1e2436', ombre: '#0c0f1a', toit: '#161a28', fenetreAllumee: true });
      s += merToits(L, 600, 780, rnd, { tuile: '#3a2a2c', ombre: '#141018', mur: '#1a1a24', rangs: 7, fenetres: 0.008, couleurFenetre: '#c9a227', voile: '#1d2744', voileO: 0.6 });
      return s;
    } },
    { profondeur: 0.55, svg: (L) => {
      // La place en contrebas, vue plongeante : têtes et visages pâles levés, la fontaine.
      const rnd = alea('sommet-foule');
      let s = `<path d="M-10 760Q${L / 2} 720 ${L + 10} 760V1010H-10Z" fill="#161a24"/>`;
      s += `<circle cx="${L * 0.36}" cy="880" r="70" fill="#1e2a1c"/><circle cx="${L * 0.36}" cy="880" r="40" fill="#2a3a26"/><circle cx="${L * 0.36}" cy="880" r="96" fill="none" stroke="#2a2e38" stroke-width="10"/>`;
      let d = '', f = '';
      for (let i = 0; i < L / 3.2; i++) {
        const x = rnd() * L, y = 780 + Math.pow(rnd(), 0.8) * 230;
        if (Math.hypot(x - L * 0.36, y - 880) < 110) continue;
        const r = 7 + (y - 780) / 230 * 9;
        d += `M${r1(x)} ${r1(y)}m-${r1(r)} 0a${r1(r)} ${r1(r * 0.9)} 0 1 0 ${r1(r * 2)} 0a${r1(r)} ${r1(r * 0.9)} 0 1 0 -${r1(r * 2)} 0`;
        f += `M${r1(x - r * 0.45)} ${r1(y - r * 0.1)}h${r1(r * 0.9)}`;
      }
      s += `<g class="foule-levee"><path d="${d}" fill="#0a0c12"/><path d="${f}" stroke="#8c8a86" stroke-width="5" opacity="0.55"/></g>`;
      s += `<g class="lampes-foule">${halo(L * 0.55, 900, 90, 40, '#e8d49a', 0.4)}${halo(L * 0.2, 950, 70, 30, '#e8d49a', 0.3)}</g>`;
      return s + voile(L, '#0b1020', 0.2, 740, 1000);
    } },
    { profondeur: 0.95, svg: (L, H) => {
      // Ferronnerie du campanile au premier plan.
      const fer = '#040507';
      let s = `<g stroke="${fer}" fill="none" stroke-linecap="round">`;
      for (let x = -100; x < L + 200; x += 900) {
        s += `<path d="M${x} ${H + 20}V120C${x + 50} -60 ${x + 400} -120 ${x + 450} -160" stroke-width="34"/>`;
        s += `<path d="M${x + 60} 600c80 -40 80 -140 0 -160c-60 -10 -60 60 -10 70" stroke-width="10"/><path d="M${x + 60} 300c90 -30 90 -130 10 -150" stroke-width="10"/>`;
      }
      s += `<path d="M-20 70H${L + 20}" stroke-width="20"/><path d="M-20 980H${L + 20}" stroke-width="44"/></g>`;
      // Une cloche en amorce en haut à gauche.
      s += cloche(L * 0.08, -60, 420, '#0c0d10', 'cloche-muette');
      s += `<path d="M${L * 0.08 - 200} 330q200 26 400 0" stroke="#3a3428" stroke-width="6" fill="none" opacity="0.6"/>`;
      // Le cadran vu de dos, verre dépoli laiteux : 21 h 10 à l'envers.
      const cx = L * 0.965, cy = 470, r = 330, id = uid('cad');
      s += `<defs>${degrade(id, [[0, '#cfc8b0', 0.55], [1, '#8a8470', 0.35]])}</defs>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${r + 30}" fill="#07080b"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
      let g = ''; for (let k = 0; k < 12; k++) { const a = -k / 12 * Math.PI * 2; g += `M${r1(cx + Math.sin(a) * r * 0.82)} ${r1(cy - Math.cos(a) * r * 0.82)}L${r1(cx + Math.sin(a) * r * 0.94)} ${r1(cy - Math.cos(a) * r * 0.94)}`; }
      s += `<path d="${g}" stroke="#2a2620" stroke-width="10" opacity="0.7"/>`;
      const ah = -(9 + 1 / 6) / 12 * Math.PI * 2, am = -(10 / 60) * Math.PI * 2;
      s += `<path d="M${cx} ${cy}L${r1(cx + Math.sin(ah) * r * 0.5)} ${r1(cy - Math.cos(ah) * r * 0.5)}" stroke="#1a1714" stroke-width="22" stroke-linecap="round"/>`;
      s += `<path d="M${cx} ${cy}L${r1(cx + Math.sin(am) * r * 0.78)} ${r1(cy - Math.cos(am) * r * 0.78)}" stroke="#1a1714" stroke-width="14" stroke-linecap="round"/>`;
      s += `<path class="reflet-aiguille" d="M${cx} ${cy}L${r1(cx + Math.sin(am) * r * 0.78)} ${r1(cy - Math.cos(am) * r * 0.78)}" stroke="#e8c070" stroke-width="4" stroke-linecap="round" stroke-dasharray="40 600" opacity="0.9"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="24" fill="#0c0b0a"/>`;
      return s;
    } },
  ],
  ambiance: ['lueurs'],
  anims: {
    foule_immobile(t, S) { for (const el of S.q('.foule-levee')) S.attr(el, 'transform', `translate(${(Math.sin(t * 0.6) * 2).toFixed(1)},${(Math.sin(t * 0.9) * 1.5).toFixed(1)})`); },
    cloches_immobiles(t, S) { balancer(t, S, '.cloche-muette', 0.6, 0.15); },
    incendie_lointain(t, S) { scintiller(t, S, '.incendie', 0.6, 1, 3); },
    cadran_21h10(t, S) { for (const el of S.q('.reflet-aiguille')) S.attr(el, 'stroke-dashoffset', r1(-((t * 70) % 640))); },
    lueurs(t, S) { scintiller(t, S, '.fenetre-emperi', 0.5, 1, 5); scintiller(t, S, '.lampes-foule', 0.4, 1, 7); },
  },
};
