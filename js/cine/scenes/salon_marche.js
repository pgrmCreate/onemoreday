// Le cours Carnot, mercredi 2 septembre, 10 h — avant. Lumière dorée, marché plein, platanes.
import { alea, etal, humain, halo, r1, mix, sombre, oiseau, radial, uid } from '../lib.js';
import { passant, animerPassants, onduler, couler, ease } from '../anim.js';
import { MATIN, coucheCiel, coucheFacades, couchePlatanes, coucheVoute } from './_cours.js';

const P = MATIN;
const HAUTS = ['#b8322c', '#e6d3ad', '#5e7f95', '#6f8a3e', '#d9a45b', '#2e3440', '#8a4a6a', '#f0ece0', '#c86a3a', '#3f6d7a', '#9a3a4a', '#d8c070'];
const BAS = ['#2d3a4f', '#b8a88a', '#26262b', '#44505a', '#6b5a48', '#1d2a3f'];
const PEAUX = ['#c89a78', '#a8795a', '#e0b898', '#7a5238', '#d4a684'];
const CHEVEUX = ['#2a1e16', '#4a3222', '#1a1614', '#8a6a4a', '#cfc6b8', '#6a4a2a'];

// Fontaine de la place de Gaulle : bassin octogonal, fût, vasque, jets.
function fontaine(x, y, s) {
  const pierre = '#c9b48e', ombre = '#8f7d60', eau = '#bcd4d8';
  let g = `<g class="fontaine-gaulle">`;
  g += `<ellipse cx="${x}" cy="${y + 6}" rx="${230 * s}" ry="${30 * s}" fill="#000" opacity="0.18"/>`;
  g += `<path d="M${x - 220 * s} ${y}v${-58 * s}l${40 * s} ${-18 * s}h${360 * s}l${40 * s} ${18 * s}v${58 * s}z" fill="${pierre}"/><path d="M${x - 220 * s} ${y - 58 * s}l${40 * s} ${-18 * s}h${360 * s}l${40 * s} ${18 * s}z" fill="${eau}" opacity="0.8"/>`;
  g += `<path d="M${x + 60 * s} ${y}v${-58 * s}h${160 * s}v${58 * s}z" fill="${ombre}" opacity="0.35"/>`;
  g += `<rect x="${x - 18 * s}" y="${y - 240 * s}" width="${36 * s}" height="${170 * s}" fill="${pierre}"/><rect x="${x + 4 * s}" y="${y - 240 * s}" width="${14 * s}" height="${170 * s}" fill="${ombre}" opacity="0.5"/>`;
  g += `<path d="M${x - 90 * s} ${y - 240 * s}q${90 * s} ${50 * s} ${180 * s} 0z" fill="${pierre}"/><ellipse cx="${x}" cy="${y - 240 * s}" rx="${90 * s}" ry="${12 * s}" fill="${eau}"/>`;
  g += `<path d="M${x - 10 * s} ${y - 250 * s}q${10 * s} ${-70 * s} ${20 * s} 0" fill="${pierre}"/>`;
  g += `<g stroke="${eau}" stroke-width="${5 * s}" fill="none" stroke-linecap="round" opacity="0.9">`;
  for (const d of [-1, 1]) g += `<path class="jet" d="M${x + d * 80 * s} ${y - 238 * s}q${d * 60 * s} ${20 * s} ${d * 90 * s} ${160 * s}" stroke-dasharray="${14 * s} ${9 * s}"/>`;
  g += `<path class="jet" d="M${x} ${y - 300 * s}q${-6 * s} ${-60 * s} 0 ${-80 * s}q${6 * s} ${20 * s} 0 ${80 * s}" stroke-dasharray="${10 * s} ${7 * s}"/>`;
  g += `</g>`;
  for (const d of [-1, 1]) g += `<ellipse class="ride" cx="${x + d * 170 * s}" cy="${y - 64 * s}" rx="${24 * s}" ry="${5 * s}" fill="none" stroke="#eef6f6" stroke-width="2" opacity="0.6"/>`;
  return g + `</g>`;
}

function pigeons(L, rnd, y0) {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const x = L * (0.25 + rnd() * 0.12), y = y0 + rnd() * 40, k = 0.9 + rnd() * 0.3;
    s += `<g class="pigeon" data-x="${r1(x)}" data-y="${r1(y)}" data-d="${r1(rnd() * 1.2 * 100) / 100}" data-vx="${r1(200 + rnd() * 300)}" data-vy="${r1(260 + rnd() * 220)}" transform="translate(${r1(x)},${r1(y)})">
      <g class="pg-sol"><ellipse cx="0" cy="-8" rx="${r1(13 * k)}" ry="${r1(7 * k)}" fill="#6d6a72"/><circle cx="${r1(11 * k)}" cy="${r1(-15 * k)}" r="${r1(5 * k)}" fill="#55525a"/><path d="M-12 -6l-9 3" stroke="#55525a" stroke-width="4"/></g>
      <g class="pg-vol" opacity="0">${oiseau(0, 0, 22 * k, '#5a5760')}<ellipse cx="0" cy="1" rx="6" ry="4" fill="#5a5760"/></g></g>`;
  }
  return s;
}

export default {
  largeur: 2.6,
  fond: '#a9c9de',
  couches: [
    { profondeur: 0, svg: coucheCiel(P, 'cours') },
    { profondeur: 0.28, svg: coucheFacades(P, 'cours') },
    { profondeur: 0.48, svg: couchePlatanes(P, 'cours', { voute: false }) },
    { profondeur: 0.48, nom: 'voute', svg: coucheVoute(P, 'cours') },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('marche-etals');
      let s = '';
      // Ombre portée de la voûte sur la chaussée, puis taches de lumière.
      s += `<rect x="-5" y="850" width="${L + 10}" height="160" fill="#3b3226" opacity="0.18"/>`;
      s += fontaine(L * 0.055, 905, 1.05);
      // Rangée d'étals.
      const contenus = ['peches', 'fromages', 'fleurs', 'legumes', 'olives', 'peches', 'legumes'];
      let x = L * 0.12;
      while (x < L - 200) {
        const w = 260 + rnd() * 110;
        s += etal(x, 890, w, rnd, { contenu: rnd.choix(contenus), ardoise: rnd() < 0.3 ? rnd.choix(['2 € le kg', 'Pêches de Crau', 'Brousse du Rove', 'Picodon']) : null });
        // Marchand derrière son étal.
        if (rnd() < 0.7) s += humain(x + w * (0.3 + rnd() * 0.4), 800, 250, 'debout', { corps: rnd.choix(HAUTS), tete: rnd.choix(PEAUX), cheveux: rnd.choix(CHEVEUX), jambes: rnd.choix(BAS), sens: rnd.signe() }).replace('<g class="humain"', '<g class="humain" opacity="0.95"');
        x += w + 60 + rnd() * 160;
      }
      return s;
    } },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('marche-chalands');
      let s = pigeons(L, rnd, 948);
      // Chalands du milieu, qui déambulent entre les étals.
      for (let i = 0; i < 26; i++) {
        const h = 270 + rnd() * 40, v = (rnd() < 0.5 ? -1 : 1) * (25 + rnd() * 30);
        s += passant(rnd() * L, 960 + rnd() * 30, h, { v, L, pose: rnd() < 0.4 ? 'cabas' : 'marche', corps: mix(rnd.choix(HAUTS), '#c8c0aa', 0.12), jambes: rnd.choix(BAS), tete: rnd.choix(PEAUX), cheveux: rnd.choix(CHEVEUX), sac: rnd() < 0.35 ? rnd.choix(['#c9a26a', '#6a8a3a', '#b8322c']) : null, robe: rnd() < 0.25 ? rnd.choix(HAUTS) : null });
      }
      return s;
    } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('marche-pp');
      let s = '';
      for (let i = 0; i < 16; i++) {
        const h = 500 + rnd() * 90, v = (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 40);
        const poussette = rnd() < 0.12;
        s += passant(rnd() * L, 1030 + rnd() * 50, h, { v, L, pose: rnd() < 0.5 ? 'cabas' : 'marche', corps: mix(rnd.choix(HAUTS), '#3a2a1e', 0.18), jambes: rnd.choix(BAS), tete: rnd.choix(PEAUX), cheveux: rnd.choix(CHEVEUX), sac: rnd() < 0.5 ? rnd.choix(['#c9a26a', '#8a6a3a', '#3a5a7a', '#b8322c']) : null, robe: rnd() < 0.3 ? rnd.choix(HAUTS) : null, chapeau: rnd() < 0.12 ? '#d8c89a' : null, cls: poussette ? 'passant' : 'passant' });
      }
      // Lumière rasante sur le premier plan : léger voile chaud.
      s += `<rect x="-5" y="0" width="${L + 10}" height="1000" fill="#f3d9a0" opacity="0.05"/>`;
      return s;
    } },
    { profondeur: 1.25, nom: 'feuilles', svg: (L) => {
      // Feuilles pendantes floues, très proches : cadre la composition et accentue la profondeur.
      const rnd = alea('marche-feuilles');
      const id = uid('fl');
      let s = `<defs>${radial(id, [[0, '#26331a', 0.95], [0.7, '#26331a', 0.6], [1, '#26331a', 0]])}</defs><g class="feuilles-pp">`;
      for (let x = rnd() * 400; x < L; x += 700 + rnd() * 900) {
        for (let k = 0; k < 7; k++) s += `<ellipse cx="${r1(x + (rnd() - 0.5) * 380)}" cy="${r1(-20 + rnd() * 110)}" rx="${r1(90 + rnd() * 80)}" ry="${r1(50 + rnd() * 40)}" fill="url(#${id})"/>`;
      }
      return s + '</g>';
    } },
  ],
  ambiance: ['bache_air'],
  anims: {
    foule_marche(t, S) { animerPassants(t, S, '.passant'); },
    platanes_brise(t, S) {
      S.decaler('voute', Math.sin(t * 0.55) * 8, Math.cos(t * 0.43) * 3);
      S.decaler('feuilles', Math.sin(t * 0.75) * 14, Math.cos(t * 0.6) * 6);
      for (const el of S.q('.taches-sol')) S.attr(el, 'opacity', (0.26 + 0.08 * Math.sin(t * 0.9)).toFixed(3));
    },
    pigeons_envol(t, S) {
      const tp = S.tp;
      for (const el of S.q('.pigeon')) {
        const d = el.dataset; const x = +d.x, y = +d.y, dl = 1.6 + +d.d;
        const tau = tp - dl;
        if (tau <= 0) { S.attr(el, 'transform', `translate(${x},${y - Math.abs(Math.sin(t * 3 + x)) * 3})`); continue; }
        if (!el.__vol) { el.__vol = true; el.querySelector('.pg-sol').setAttribute('opacity', '0'); el.querySelector('.pg-vol').setAttribute('opacity', '1'); }
        const nx = x + +d.vx * tau, ny = y - +d.vy * tau - 120 * tau * tau;
        const b = Math.sin(t * 34 + x) * 0.9;
        S.attr(el, 'transform', `translate(${r1(nx)},${r1(ny)}) scale(1,${b.toFixed(2)})`);
      }
    },
    fontaine_coule(t, S) {
      couler(t, S, '.jet', 70);
      S.q('.ride').forEach((el, i) => { const k = ((t * 0.6 + i * 0.5) % 1); S.attr(el, 'transform', `translate(${el.getAttribute('cx') * (1 - (1 + k * 1.5))},${el.getAttribute('cy') * (1 - (1 + k * 1.5))}) scale(${(1 + k * 1.5).toFixed(3)})`); S.attr(el, 'opacity', (0.6 * (1 - k)).toFixed(2)); });
    },
    bache_air(t, S) { onduler(t, S, '.bache', 0, 1.5, 0.35, 0.8); },
  },
};
