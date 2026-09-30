// Le cirque de Calès au-dessus de Lamanon, le soir. Deux falaises de safre jaune trouées de grottes carrées ; dans
// les trous, des feux, du linge, des silhouettes ; une échelle de corde ; l'antenne tendue au sommet ; chênes kermès.
import { alea, ciel, halo, r1, mix, massif, brume, humain, touffe, alpilles, nuages, lerp, uid, degrade } from '../lib.js';
import { scintiller, onduler } from '../anim.js';

const SAFRE = '#d7b36a', SAFRE_O = '#9a7040', SAFRE_N = '#5a3e26';

function falaise(x0, x1, yTop, rnd, cote) {
  // Masse : sommet irrégulier, pied évasé.
  let d = `M${r1(x0 - 60)} 1010`;
  const n = 26;
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u); const bord = Math.min(u, 1 - u); d += `L${r1(x)} ${r1(yTop + (bord < 0.08 ? (0.08 - bord) * 3000 : 0) + (rnd() - 0.5) * 24)}`; }
  d += `L${r1(x1 + 60)} 1010Z`;
  const idg = uid('saf');
  let s = `<defs>${degrade(idg, [[0, '#e8c47a'], [0.5, SAFRE], [1, '#8a6034']])}</defs><path d="${d}" fill="url(#${idg})"/>`;
  // Érosion : coulures verticales, alvéoles, végétation sur la crête.
  let st = ''; for (let i = 0; i < (x1 - x0) / 40; i++) { const x = x0 + rnd() * (x1 - x0), y = yTop + rnd() * 200; st += `M${r1(x)} ${r1(y)}q${r1((rnd() - 0.5) * 20)} ${r1(150 + rnd() * 300)} ${r1((rnd() - 0.5) * 10)} ${r1(300 + rnd() * 400)}`; }
  s += `<path d="${st}" stroke="${SAFRE_O}" stroke-width="${r1(6 + rnd() * 10)}" opacity="0.18" fill="none" stroke-linecap="round"/>`;
  let al = ''; for (let i = 0; i < (x1 - x0) / 25; i++) al += `M${r1(x0 + rnd() * (x1 - x0))} ${r1(yTop + 40 + rnd() * 700)}a${r1(4 + rnd() * 10)} ${r1(3 + rnd() * 6)} 0 1 0 0.1 0z`;
  s += `<path d="${al}" fill="${SAFRE_N}" opacity="0.3"/>`;
  s += `<path d="M${r1(cote > 0 ? x1 - 160 : x0)} ${yTop}h160V1010h-160z" fill="${SAFRE_N}" opacity="0.3"/>`;
  for (let x = x0; x < x1; x += 30 + rnd() * 50) s += touffe(x, yTop + 6, 18 + rnd() * 20, '#4a5230', rnd, 8);
  // Grottes taillées : ouvertures carrées aux angles usés, en quinconce irrégulier.
  let g = '', feux = '';
  for (let niv = 0; niv < 4; niv++) {
    const y = yTop + 100 + niv * 150 + rnd() * 30;
    for (let x = x0 + 60 + rnd() * 100; x < x1 - 100; x += 150 + rnd() * 220) {
      const w = 44 + rnd() * 50, h = 52 + rnd() * 34, yy = y + (rnd() - 0.5) * 50;
      g += `<path d="M${r1(x)} ${r1(yy + h)}V${r1(yy + 8)}q2 -8 10 -8h${r1(w - 20)}q8 0 10 8V${r1(yy + h)}z" fill="#1e140c"/><path d="M${r1(x - 4)} ${r1(yy + h)}h${r1(w + 8)}" stroke="#f0d8a0" stroke-width="5" opacity="0.5"/>`;
      if (rnd() < 0.45) feux += `<g class="feu-grotte">${halo(x + w / 2, yy + h * 0.7, w * 1.6, h * 1.1, '#f4a23c', 0.75)}<path d="M${r1(x + w / 2 - 10)} ${r1(yy + h)}q10 -30 10 -36q10 16 10 36z" fill="#ffd070"/></g>`;
      else if (rnd() < 0.35) feux += humain(x + w / 2, yy + h, h * 0.8, 'debout', { corps: '#120c08', sens: rnd.signe() });
    }
    const ex = lerp(x0, x1, 0.25 + niv * 0.15);
    let es = ''; for (let k = 0; k < 6; k++) es += `M${r1(ex + k * 18)} ${r1(y + 150 - k * 24)}h22v-6`;
    g += `<path d="${es}" stroke="${SAFRE_N}" stroke-width="5" fill="none" opacity="0.6"/>`;
  }
  return s + g + feux;
}

export default {
  largeur: 2.3,
  fond: '#d88a4a',
  reglages: { fumee: '#5a4038', vent: 0.2 },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#3a3450'], [0.4, '#8a5a60'], [0.75, '#e08a4a'], [1, '#f4c070']]) + halo(L * 0.7, 700, 800, 260, '#ffd090', 0.55) + nuages(L, 100, 380, 10, 'cales-n', '#f0a070', 0.5, '#7a4a50') },
    { profondeur: 0.2, svg: (L) => alpilles(L, 760, 90, 'cales-loin', '#6a4a4a', '#a06a50') + massif(L, 800, 30, 'cales-pl', '#5a4038') + brume(L, 700, 860, '#f0b070', 0, 0.45, 0.1) },
    { profondeur: 0.45, svg: (L) => {
      const rnd = alea('cales');
      let s = falaise(L * 0.02, L * 0.46, 250, rnd, 1) + falaise(L * 0.54, L * 1.02, 210, rnd, -1);
      // Vallon entre les deux falaises.
      s += `<path d="M${L * 0.44} 1010Q${L * 0.5} 900 ${L * 0.56} 1010z" fill="#3a2a1c" opacity="0.6"/>`;
      // Échelle de corde.
      const ex = L * 0.31, ey = 400;
      s += `<g class="echelle" data-x="${ex}" data-y="${ey}"><path d="M${ex - 16} ${ey}v320M${ex + 16} ${ey}v320" stroke="#3a2a1a" stroke-width="4"/>`;
      for (let y = ey + 20; y < ey + 320; y += 26) s += `<path d="M${ex - 16} ${y}h32" stroke="#4a3622" stroke-width="5"/>`;
      s += humain(ex, ey + 200, 70, 'bras_leves', { corps: '#120c08' }) + `</g>`;
      // Linge entre deux grottes.
      for (const [lx, ly] of [[L * 0.14, 470], [L * 0.7, 420], [L * 0.86, 580]]) {
        s += `<path d="M${lx} ${ly}q90 26 180 0" stroke="#2a1e14" stroke-width="3" fill="none"/>`;
        for (let k = 0; k < 5; k++) s += `<g class="linge" data-x="${lx + 20 + k * 32}" data-y="${ly + 10}"><rect x="${lx + 12 + k * 32}" y="${ly + 8 + Math.sin(k / 4 * Math.PI) * 10}" width="22" height="${30 + (k % 2) * 12}" fill="${['#e8e2d6', '#9ab0c8', '#c96a5a', '#e8d8b0', '#6a8a6a'][k]}"/></g>`;
      }
      // Antenne tendue au sommet.
      const ax = L * 0.8;
      s += `<path d="M${ax} 210V40M${ax} 60L${ax - 120} 210M${ax} 60L${ax + 110} 210M${ax - 30} 70h60" stroke="#2a2420" stroke-width="4"/><circle class="antenne-led" cx="${ax}" cy="38" r="6" fill="#d6303e"/>`;
      return s;
    } },
    { profondeur: 0.8, svg: (L) => {
      const rnd = alea('kermes');
      let s = '';
      for (let x = -40; x < L; x += 90 + rnd() * 140) s += `<g class="kermes">${touffe(x, 930 + rnd() * 40, 70 + rnd() * 60, '#2e3a22', rnd, 30)}${touffe(x + 20, 900 + rnd() * 30, 40 + rnd() * 30, '#46552e', rnd, 16)}</g>`;
      return s + `<rect x="-5" y="960" width="${L + 10}" height="60" fill="#1e2416"/>`;
    } },
  ],
  anims: {
    feux_grottes(t, S) { scintiller(t, S, '.feu-grotte', 0.55, 1, 10); for (const el of S.q('.antenne-led')) S.attr(el, 'opacity', (t % 1.4) < 0.2 ? '1' : '0.25'); },
    echelle_corde(t, S) { for (const el of S.q('.echelle')) S.attr(el, 'transform', `rotate(${(Math.sin(t * 1.2) * 1.8).toFixed(2)} ${el.dataset.x} ${el.dataset.y})`); },
    linge_seche(t, S) { S.q('.linge').forEach((el, i) => S.attr(el, 'transform', `rotate(${(Math.sin(t * 1.6 + i) * 5).toFixed(1)} ${el.dataset.x} ${el.dataset.y})`)); onduler(t, S, '.kermes', 2, 0.5, 0.3); },
  },
};
