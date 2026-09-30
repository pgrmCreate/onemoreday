// Du rempart de l'Empéri, à l'aube : ciel gris perle, la plaine vers le nord et la route d'Avignon ; le troupeau
// s'éloigne en rivière de dos courbés ; en tête, minuscules, le Berger, deux chiens, et Rose qui porte le redon.
import { alea, ciel, halo, r1, massif, alpilles, brume, creneaux, humain, degrade, uid, lerp, nuages } from '../lib.js';
import { onduler } from '../anim.js';

const VP = [0.86, 552];

export default {
  largeur: 2.2,
  fond: '#9aa3a8',
  reglages: { brouillard: '#c8ccd0', fumee: '#6a6a70' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#6f777e'], [0.5, '#9aa3a8'], [0.85, '#c9c6be'], [1, '#e2d6c4']]) + halo(L * 0.2, 520, 700, 200, '#f4e4cc', 0.45) + nuages(L, 80, 400, 12, 'rempart-n', '#b8bec2', 0.5, '#7a8288') + alpilles(L, 540, 70, 'rempart-alp', '#7c858c', '#a4aab0') },
    { profondeur: 0.22, svg: (L) => {
      const rnd = alea('plaine-n');
      let s = massif(L, 560, 20, 'pl', '#8a8f86');
      // Champs en bandes, haies, une ferme.
      for (let i = 0; i < 16; i++) { const y = 562 + i * 12; s += `<path d="M-10 ${y}H${L + 10}" stroke="${i % 2 ? '#7f846f' : '#8f8a74'}" stroke-width="12" opacity="0.8"/>`; }
      for (let i = 0; i < 30; i++) { const x = rnd() * L, y = 565 + rnd() * 160; s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(20 + rnd() * 40)}" ry="6" fill="#5e6450" opacity="0.8"/>`; }
      return s + brume(L, 520, 700, '#c8ccd0', 0, 0.6, 0.2);
    } },
    { profondeur: 0.5, svg: (L) => {
      const rnd = alea('troupeau-riviere');
      const vx = L * VP[0], vy = VP[1];
      let s = `<path d="M${-200} 1010L${vx - 6} ${vy}h12L${L * 0.5} 1010z" fill="#6f6a62"/>`;
      s += `<ellipse cx="${L * 0.22}" cy="900" rx="220" ry="46" fill="none" stroke="#5f5a54" stroke-width="30"/><ellipse cx="${L * 0.22}" cy="900" rx="130" ry="26" fill="#6f7a5a"/>`;
      // La rivière de dos courbés : dense près, poussière de points au loin.
      let d = '';
      for (let i = 0; i < 1400; i++) {
        const u = Math.pow(rnd(), 0.8), s0 = 1 - u;
        const xl = lerp(-100, vx - 4, u), xr = lerp(L * 0.47, vx + 4, u), y = lerp(1000, vy + 2, Math.pow(u, 0.85));
        const x = lerp(xl, xr, rnd()), h = lerp(70, 3, Math.pow(u, 0.6));
        if (h > 12) d += `M${r1(x)} ${r1(y)}c${r1(h * 0.1)} ${r1(-h * 0.6)} ${r1(h * 0.35)} ${r1(-h * 0.7)} ${r1(h * 0.5)} ${r1(-h * 0.55)}l${r1(h * 0.05)} ${r1(h * 0.55)}zM${r1(x + h * 0.48)} ${r1(y - h * 0.62)}m-${r1(h * 0.1)} 0a${r1(h * 0.1)} ${r1(h * 0.1)} 0 1 0 ${r1(h * 0.2)} 0a${r1(h * 0.1)} ${r1(h * 0.1)} 0 1 0 -${r1(h * 0.2)} 0`;
        else d += `M${r1(x)} ${r1(y)}h${r1(h * 0.4)}v${r1(-h * 0.8)}h${r1(-h * 0.4)}z`;
        void s0;
      }
      s += `<g class="riviere" data-x="${r1(vx)}" data-y="${vy}"><path d="${d}" fill="#26262a"/></g>`;
      // En tête : le Berger, les chiens, Rose et le redon.
      const bx = vx - 40, by = vy + 12;
      s += `<g class="tete-troupeau">`;
      s += `<g class="berger" data-x="${r1(bx)}">${humain(bx, by, 26, 'marche', { corps: '#2a2420', chapeau: '#2a2420', manteau: '#3a2e24' })}<path d="M${r1(bx + 8)} ${by}l3 -30" stroke="#2a2420" stroke-width="1.6"/></g>`;
      s += `<g class="rose">${humain(bx - 16, by + 2, 21, 'porte_redon', { corps: '#302a2a' })}<path class="redon" d="M${r1(bx - 14)} ${by - 12}h6l1 5h-8z" fill="#8a7040"/></g>`;
      for (const k of [0, 1]) s += `<g class="chien" data-k="${k}"><path d="M${r1(bx + 10 + k * 20)} ${by + 3}h10l2 -4l3 -1l-1 3l-2 2v3h-2v-2h-7v2h-2z" fill="#1c1a18"/></g>`;
      s += `</g>`;
      return s + brume(L, 540, 640, '#c8ccd0', 0, 0.35, 0);
    } },
    { profondeur: 1, svg: (L) => {
      // Créneaux du rempart au premier plan.
      const id = uid('pr');
      let s = `<defs>${degrade(id, [[0, '#6a6258'], [0.3, '#4a443c'], [1, '#221e1a']])}</defs>`;
      let d = `M-20 1010V800`;
      for (let x = -20; x < L + 40; x += 340) d += `H${x + 200}V700H${x + 340}V800`;
      s += `<path d="${d}V1010Z" fill="url(#${id})"/>`;
      const rnd = alea('pierres'); let p = '';
      for (let i = 0; i < L / 30; i++) { const x = rnd() * L, y = 820 + rnd() * 180; p += `M${r1(x)} ${r1(y)}h${r1(40 + rnd() * 60)}`; }
      let j = ''; for (let x = -20; x < L + 40; x += 340) j += `M${x + 200} 702h140M${x + 200} 740h140M${x + 270} 702v38`;
      s += `<path d="${p}${j}" stroke="#1a1816" stroke-width="3" opacity="0.6"/><path d="M-20 800H${L + 20}" stroke="#a8a094" stroke-width="5" opacity="0.6"/>`;
      return s;
    } },
  ],
  anims: {
    troupeau_s_eloigne(t, S) {
      for (const el of S.q('.riviere')) { const k = 1 - Math.min(0.12, t * 0.006); S.attr(el, 'transform', `translate(${el.dataset.x},${el.dataset.y}) scale(${k.toFixed(4)}) translate(${-el.dataset.x},${-el.dataset.y})`); }
      for (const el of S.q('.tete-troupeau')) S.attr(el, 'transform', `translate(${r1(t * 0.6)},${r1(-t * 0.25)})`);
    },
    berger_marche(t, S) { onduler(t, S, '.berger', 0.4, 0.8, 0.9); onduler(t, S, '.rose', 0.4, 0.8, 0.9); },
    chiens_tournent(t, S) { S.q('.chien').forEach((el, k) => { const a = t * 1.3 + k * 3; S.attr(el, 'transform', `translate(${(Math.cos(a) * 26 - 20).toFixed(1)},${(Math.sin(a) * 5).toFixed(1)})`); }); },
    redon_balance(t, S) { for (const el of S.q('.redon')) S.attr(el, 'transform', `translate(0,${(Math.abs(Math.sin(t * 2.4)) * 1.2).toFixed(2)})`); },
  },
};
