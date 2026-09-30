// Salle des plâtres, en souvenir : rouge dominant, cadrage serré. Carrelage, lit d'examen à sangles, chariot et
// clochette ; un brancard entre par la droite — un homme moustachu, la jambe en attelle, qui ne crie pas.
import { alea, r1, halo, mix, sombre, degrade, radial, uid } from '../lib.js';
import { ease } from '../anim.js';

const R0 = '#1c0608', R1 = '#3a0f12', R2 = '#8e1b24', BLANC = '#d8c4bc';

export default {
  largeur: 1.5,
  fond: R0,
  couches: [
    { profondeur: 0, svg: (L) => {
      const id = uid('sq');
      let s = `<defs>${radial(id, [[0, '#6a1a1e', 1], [0.6, R1, 1], [1, R0, 1]])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      let d = ''; for (let x = 0; x < L; x += 64) d += `M${x} 0V760`; for (let y = 0; y < 760; y += 64) d += `M0 ${y}H${L}`;
      s += `<path d="${d}" stroke="#120406" stroke-width="4" opacity="0.5"/>`;
      s += `<rect x="-5" y="760" width="${L + 10}" height="250" fill="#240a0c"/><path d="M-5 760H${L + 5}" stroke="#5a1a1e" stroke-width="6"/>`;
      s += `<path d="M${L * 0.15} 420q30 60 10 140q-20 50 6 90" stroke="#1a0506" stroke-width="10" fill="none" opacity="0.5"/>`;
      s += halo(L * 0.5, 80, 700, 260, '#ff6a5a', 0.25);
      return s;
    } },
    { profondeur: 0.35, svg: (L) => {
      // Lit d'examen, sangles de cuir, menottes.
      const x = L * 0.2, y = 820, w = 760;
      let s = `<rect x="${x}" y="${y - 200}" width="${w}" height="60" rx="10" fill="#3a1416"/><rect x="${x}" y="${y - 214}" width="${w}" height="22" rx="8" fill="#5a1e22"/>`;
      s += `<path d="M${x + 40} ${y - 140}V${y}M${x + w - 40} ${y - 140}V${y}" stroke="#2a0c0e" stroke-width="20"/>`;
      s += `<g class="sangles">`;
      for (const k of [0.2, 0.5, 0.8]) s += `<path class="sangle" data-x="${r1(x + w * k)}" d="M${r1(x + w * k)} ${y - 216}v96" stroke="#1a0a08" stroke-width="30"/><rect x="${r1(x + w * k - 22)}" y="${y - 176}" width="44" height="18" fill="none" stroke="#b89a70" stroke-width="5"/>`;
      s += `</g>`;
      s += `<path d="M${x + w + 10} ${y - 190}c40 0 50 50 20 60c-30 10 -40 -30 -10 -40" stroke="#9a8a80" stroke-width="7" fill="none"/><circle cx="${x + w + 50}" cy="${y - 110}" r="22" fill="none" stroke="#9a8a80" stroke-width="7"/>`;
      return s;
    } },
    { profondeur: 0.62, svg: (L) => {
      const x = L * 0.44, y = 900;
      let s = `<rect x="${x}" y="${y - 260}" width="320" height="16" fill="#5a2a2c"/><path d="M${x + 10} ${y - 260}v250M${x + 310} ${y - 260}v250M${x} ${y - 120}h320" stroke="#4a2022" stroke-width="10"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${x + 20 + i * 44}" y="${y - 300}" width="38" height="40" rx="6" fill="${BLANC}" opacity="0.8"/>`;
      const bx = x + 250, by = y - 260;
      s += `<g class="clochette" data-x="${bx}" data-y="${by - 80}">${halo(bx, by - 40, 90, 70, '#ffb070', 0.35)}<path d="M${bx - 32} ${by}c4 -10 14 -14 18 -40c2 -10 24 -10 26 0c4 26 14 30 18 40z" fill="#b07a36"/><rect x="${bx - 5}" y="${by - 84}" width="10" height="46" rx="4" fill="#5a3a1e"/></g>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      // Le brancard et l'homme : attelle, moustache, bouche qui formera « Jo ».
      const x = L * 0.52, y = 930;
      let s = `<g class="brancard-homme"><rect x="${x}" y="${y - 150}" width="1100" height="40" rx="12" fill="#2a0c0e"/><path d="M${x + 60} ${y - 110}v110M${x + 1040} ${y - 110}v110" stroke="#1a0608" stroke-width="16"/>`;
      s += `<path d="M${x + 140} ${y - 150}c20 -70 120 -90 220 -80l500 10c80 0 150 20 180 70z" fill="#4a1a1c"/>`;
      s += `<rect x="${x + 700}" y="${y - 214}" width="340" height="56" rx="12" fill="${BLANC}"/><path d="M${x + 740} ${y - 214}v56M${x + 820} ${y - 214}v56M${x + 900} ${y - 214}v56M${x + 980} ${y - 214}v56" stroke="#8a6a64" stroke-width="6"/>`;
      // Tête : visage dans l'ombre, lumière rouge rasante par le haut, yeux mi-clos, moustache.
      const hx = x + 120, hy = y - 250;
      s += `<g class="visage" data-x="${hx}" data-y="${hy}"><ellipse cx="${hx}" cy="${hy + 10}" rx="84" ry="104" fill="#3a1214"/>`;
      s += `<path d="M${hx - 84} ${hy - 10}q10 -100 90 -104q70 0 78 90q-40 -60 -88 -58q-50 4 -80 72z" fill="#140506"/>`;
      s += `<path d="M${hx + 20} ${hy - 76}q60 20 64 86q-20 -40 -64 -86z" fill="#8e2a2c" opacity="0.7"/>`;
      s += `<path d="M${hx - 44} ${hy - 10}h30M${hx + 18} ${hy - 10}h30" stroke="#0e0304" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M${hx + 6} ${hy - 4}q12 34 -4 50" stroke="#220808" stroke-width="7" fill="none"/>`;
      s += `<path d="M${hx - 36} ${hy + 60}q40 -22 84 0q-10 12 -42 8q-30 4 -42 -8z" fill="#0e0404"/><ellipse class="bouche" cx="${hx + 6}" cy="${hy + 78}" rx="22" ry="3" fill="#050101"/></g></g>`;
      s += halo(hx, hy - 60, 300, 240, '#ff8070', 0.15);
      return s;
    } },
  ],
  anims: {
    clochette_agitee(t, S) {
      const a = Math.sin(t * 22) * 26 * Math.exp(-((S.tp % 2.2)) * 1.2);
      for (const el of S.q('.clochette')) S.attr(el, 'transform', `rotate(${a.toFixed(1)} ${el.dataset.x} ${el.dataset.y})`);
    },
    sangles_tirent(t, S) {
      S.q('.sangle').forEach((el, i) => { const k = Math.max(0, Math.sin(t * 5 + i * 1.7)) ** 3; S.attr(el, 'transform', `translate(${(k * 10 - 5).toFixed(1)},${(-k * 14).toFixed(1)})`); });
      for (const el of S.q('.sangles')) S.attr(el, 'transform', `translate(${(Math.sin(t * 31) * 2).toFixed(1)},0)`);
    },
    brancard_approche(t, S) {
      const k = ease(S.tp / 5.5);
      for (const el of S.q('.brancard-homme')) S.attr(el, 'transform', `translate(${r1(520 * (1 - k))},0)`);
    },
    visage_homme(t, S) {
      // Les lèvres s'arrondissent : « Jo ».
      const k = ease((S.tp - 2) / 1.2) * (1 - ease((S.tp - 4) / 1.2));
      for (const el of S.q('.bouche')) { S.attr(el, 'rx', r1(26 - k * 12)); S.attr(el, 'ry', r1(4 + k * 14)); }
      for (const el of S.q('.visage')) S.attr(el, 'transform', `translate(0,${(Math.sin(t * 0.8) * 3).toFixed(1)})`);
    },
  },
};
