// Gymnase réfrigéré, banlieue de Lyon, trois mois plus tard. Murs, paniers relevés, lignes du terrain ; quatre cents
// housses blanches alignées sur le parquet ; l'affiche « LE DON, UN ACTE RESPONSABLE » ; la file des familles, la buée.
import { alea, r1, halo, mix, gisant, humain, degrade, uid, voile } from '../lib.js';
import { onduler } from '../anim.js';

export default {
  largeur: 2.2,
  fond: '#cfdbe3',
  reglages: { brouillard: '#e8f0f4' },
  couches: [
    { profondeur: 0, svg: (L) => {
      const id = uid('mur');
      let s = `<defs>${degrade(id, [[0, '#6a7a86'], [0.3, '#a8b8c4'], [1, '#cfdbe3']])}</defs><rect x="-5" y="-5" width="${L + 10}" height="620" fill="url(#${id})"/>`;
      // Poutres, néons, paniers relevés.
      let p = ''; for (let x = 0; x < L; x += 300) p += `M${x} 0L${x + 150} 140L${x + 300} 0`;
      s += `<path d="${p}M0 140H${L}" stroke="#4a5a66" stroke-width="8" fill="none" opacity="0.7"/>`;
      for (let x = 100; x < L; x += 400) s += `<rect class="neon-g" x="${x}" y="170" width="180" height="12" fill="#f4fbff"/>${halo(x + 90, 180, 300, 120, '#e8f4ff', 0.35)}`;
      for (const u of [0.2, 0.8]) { const x = L * u; s += `<path d="M${x} 150v160" stroke="#4a5a66" stroke-width="10"/><rect x="${x - 70}" y="200" width="140" height="90" fill="#e8eef2" stroke="#4a5a66" stroke-width="5"/><path d="M${x - 24} 290h48" stroke="#c8522a" stroke-width="6"/>`; }
      s += `<rect x="-5" y="560" width="${L + 10}" height="50" fill="#3a5a8a"/>`;
      return s;
    } },
    { profondeur: 0.4, svg: (L) => {
      const id = uid('parquet');
      let s = `<defs>${degrade(id, [[0, '#b89a74'], [1, '#8a6e4e']])}</defs><rect x="-5" y="600" width="${L + 10}" height="410" fill="url(#${id})"/>`;
      s += `<path d="M-5 640H${L + 5}M${L * 0.5} 600V1010" stroke="#e8e4d8" stroke-width="5" opacity="0.7"/><ellipse cx="${L * 0.5}" cy="760" rx="220" ry="60" fill="none" stroke="#e8e4d8" stroke-width="5" opacity="0.7"/>`;
      s += `<path d="M-5 700Q${L * 0.15} 820 -5 940M${L + 5} 700Q${L * 0.85} 820 ${L + 5} 940" stroke="#c8522a" stroke-width="5" fill="none" opacity="0.6"/>`;
      // Rangées de housses : petites au fond, grandes devant.
      const rnd = alea('housses');
      for (let r = 0; r < 7; r++) {
        const y = 640 + Math.pow(r / 6, 1.3) * 350, lg = 80 + r * 30, pas = lg * 1.55;
        s += `<rect x="-5" y="${r1(y - lg * 0.05)}" width="${L + 10}" height="${r1(lg * 0.07)}" fill="#6a5438" opacity="0.25"/>`;
        for (let x = -lg + (r % 2) * pas * 0.5; x < L; x += pas) s += gisant(x, y, lg, mix('#f4f6f8', '#9aa8b2', 0.35 - r * 0.05), { housse: true, etiquette: rnd() < 0.8 ? '#f4e8a0' : '#e8a0a0' });
      }
      return s;
    } },
    { profondeur: 0.6, svg: (L) => {
      // L'affiche.
      const x = L * 0.9, y = 250;
      return `<g class="affiche"><rect x="${x - 170}" y="${y}" width="340" height="230" fill="#f4f2ec"/><rect x="${x - 170}" y="${y}" width="340" height="60" fill="#3a6aa8"/><text x="${x}" y="${y + 42}" font-family="Oswald, sans-serif" font-size="30" letter-spacing="4" text-anchor="middle" fill="#f4f2ec">LE DON,</text><text x="${x}" y="${y + 110}" font-family="Oswald, sans-serif" font-size="30" text-anchor="middle" fill="#1a2a44">UN ACTE</text><text x="${x}" y="${y + 150}" font-family="Oswald, sans-serif" font-size="30" text-anchor="middle" fill="#1a2a44">RESPONSABLE</text><path d="M${x - 40} ${y + 190}q40 -30 80 0q-40 30 -80 0z" fill="#c83a3a"/></g><ellipse class="reflet-affiche" cx="${x - 120}" cy="${y + 110}" rx="40" ry="140" fill="#ffffff" opacity="0"/>`;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('familles');
      // Porte ouverte sur le froid, la file des familles.
      let s = `<rect x="-20" y="200" width="${L * 0.1}" height="820" fill="#2a3440"/>${halo(L * 0.04, 600, 300, 500, '#f4fbff', 0.3)}`;
      for (let i = 0; i < 10; i++) {
        const x = L * (0.05 + i * 0.022) + rnd() * 20, h = i % 4 === 3 ? 220 : 330 + rnd() * 50;
        s += humain(x, 1030, h, 'debout', { corps: rnd.choix(['#2a2e36', '#3a3230', '#22262e', '#4a3a3a', '#2e3a46']), manteau: rnd() < 0.6 ? '#2a2a30' : null, tete: '#b8a898', cheveux: rnd.choix(['#2a2018', '#6a5a4a', '#1a1614']), sens: -1 });
        s += `<g class="buee" data-i="${i}" data-x="${r1(x - h * 0.08)}" data-y="${r1(1030 - h * 0.9)}" opacity="0"><ellipse cx="${r1(x - h * 0.08)}" cy="${r1(1030 - h * 0.9)}" rx="${r1(h * 0.05)}" ry="${r1(h * 0.03)}" fill="#f4fbff"/></g>`;
      }
      return s + voile(L, '#dce8f0', 0.08);
    } },
  ],
  ambiance: ['neons'],
  anims: {
    neons(t, S) { S.q('.neon-g').forEach((el, i) => S.attr(el, 'opacity', i === 3 && Math.sin(t * 19) > 0.7 ? '0.3' : '1')); },
    file_familles(t, S) { onduler(t, S, '.humain', 1.5, 1, 0.15); },
    buee_respiration(t, S) {
      S.q('.buee').forEach((el, i) => {
        const c = ((t + i * 0.37) % 3) / 3, k = c < 0.5 ? c * 2 : 0;
        S.attr(el, 'opacity', (Math.sin(k * Math.PI) * 0.6).toFixed(2));
        S.attr(el, 'transform', `translate(${r1(-k * 40)},${r1(-k * 20)}) translate(${el.dataset.x},${el.dataset.y}) scale(${(1 + k * 1.5).toFixed(2)}) translate(${-el.dataset.x},${-el.dataset.y})`);
      });
    },
    affiche_don(t, S) { for (const el of S.q('.reflet-affiche')) { const k = Math.min(1, S.tp / 4); S.attr(el, 'opacity', (Math.sin(k * Math.PI) * 0.25).toFixed(2)); S.attr(el, 'transform', `translate(${r1(k * 240)},0)`); } },
  },
};
