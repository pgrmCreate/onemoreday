// Mallemort, la Durance. De la rive sud (gauche) à la rive nord (droite) : le pont suspendu aux pylônes de pierre en
// arc de triomphe, câbles en courbe, tablier de planches, « 200 M » peint en rouge ; derrière, le pont routier muré de
// conteneurs ; rive nord : sacs de sable, filets, projecteurs, tente blanche, combinaisons. Eau grise, galets, roseaux.
import { alea, ciel, halo, r1, mix, massif, brume, humain, herbes, nuages, sol, panache, degrade, uid, lerp, voile } from '../lib.js';
import { passant, animerPassants, onduler, ease } from '../anim.js';

const U_SUD = 0.1, U_NORD = 0.86, TABLIER = 600;
const CONT = ['#8a3a2a', '#2a5a7a', '#b8a040', '#4a6a4a', '#9a9a94', '#6a2a2a'];

function pylone(x, y, h, c) {
  const w = 150;
  return `<path d="M${x - w / 2} ${y}V${y - h}h${w}V${y}h-40V${y - h * 0.45}a35 35 0 0 0 -70 0V${y}z" fill="${c}"/><rect x="${x - w / 2 - 8}" y="${y - h - 16}" width="${w + 16}" height="22" fill="${mix(c, '#fff', 0.15)}"/><rect x="${x + 20}" y="${y - h}" width="55" height="${h}" fill="#000" opacity="0.2"/>`;
}

export default {
  largeur: 2.5,
  fond: '#3f78b0',
  reglages: { poussiere: '#d8d2c0', vent: 0.7, fumee: '#3a3634' },
  couches: [
    { profondeur: 0, svg: (L) => ciel(L, [[0, '#1f5390'], [0.55, '#3f78b0'], [0.9, '#a8c4d8'], [1, '#d2dde2']]) + nuages(L, 60, 320, 14, 'dur-n', '#f0f4f8', 0.55, '#9ab4cc', 'nuages-dur') + massif(L, 590, 90, 'dur-lub', '#5a6a78', { rugosite: 0.45 }) + brume(L, 500, 640, '#c9d6de', 0, 0.45, 0.1) },
    { profondeur: 0.28, svg: (L) => {
      const rnd = alea('dur-routier');
      // Pont routier en béton, muré de conteneurs.
      let s = sol(L, 620, [[0, '#7a8078'], [1, '#6a6e66']]);
      for (let x = L * 0.05; x < L * 0.95; x += L * 0.12) s += `<rect x="${r1(x)}" y="560" width="30" height="70" fill="#8a8a84"/>`;
      s += `<rect x="0" y="545" width="${L * 0.47}" height="20" fill="#b0aea6"/><rect x="${L * 0.53}" y="545" width="${L * 0.47}" height="20" fill="#b0aea6"/>`;
      s += `<g class="troncon" data-x="${L * 0.47}" data-y="555"><rect x="${L * 0.47}" y="545" width="${L * 0.06}" height="20" fill="#b0aea6"/></g>`;
      let c = ''; for (let k = 0; k < 10; k++) { const x = L * 0.42 + k * 34; c += `<g class="conteneur" data-k="${k}" data-x="${r1(x + 16)}" data-y="545"><rect x="${r1(x)}" y="${r1(505 - (k % 2) * 40)}" width="32" height="40" fill="${CONT[k % CONT.length]}"/><path d="M${r1(x + 6)} ${r1(509 - (k % 2) * 40)}v32M${r1(x + 16)} ${r1(509 - (k % 2) * 40)}v32M${r1(x + 26)} ${r1(509 - (k % 2) * 40)}v32" stroke="#000" stroke-width="2" opacity="0.25"/></g>`; }
      s += `<g class="conteneurs">${c}</g>`;
      s += `<g class="explosion" opacity="0">${halo(L * 0.5, 540, 260, 200, '#ffd070', 0.9)}${halo(L * 0.5, 540, 120, 90, '#fff4d0', 1)}${panache(L * 0.5, 540, 360, 110, '#2a2624', rnd, { vent: 0.5, o: 0.8, c2: '#6a6660' })}</g>`;
      s += `<g class="troupeau-routier" opacity="0">${Array.from({ length: 90 }, (_, i) => `<rect x="${r1(L * 0.02 + i * 22 + rnd() * 10)}" y="${r1(520 + rnd() * 10)}" width="7" height="${r1(18 + rnd() * 6)}" rx="3" fill="#15161a"/>`).join('')}</g>`;
      return s + voile(L, '#c9d6de', 0.2);
    } },
    { profondeur: 0.48, svg: (L) => {
      const rnd = alea('dur-pont');
      const xs = L * U_SUD, xn = L * U_NORD, pierre = '#b8a888';
      let s = '';
      // Rive nord : levée, sacs de sable, filets, tente, projecteurs, combinaisons blanches.
      s += `<path d="M${xn - 60} 740L${xn + 60} 600H${L + 10}V1010H${xn - 60}z" fill="#6a6a5a"/>`;
      s += `<path d="M${xn + 80} 600q${(L - xn) / 2} -60 ${L - xn} -10" stroke="#4a5a3a" stroke-width="50" fill="none" opacity="0.8"/>`;
      let sacs = ''; for (let i = 0; i < 40; i++) sacs += `<ellipse cx="${r1(xn + 80 + (i % 20) * 24)}" cy="${r1(590 - Math.floor(i / 20) * 16)}" rx="14" ry="9" fill="#a89a76"/>`;
      s += sacs + `<path d="M${xn + 360} 590l60 -80l60 80z" fill="#e8e6e0"/>`;
      for (let i = 0; i < 4; i++) s += humain(xn + 120 + i * 70, 590, 80, 'debout', { corps: '#e8e6e0', tete: '#e8e6e0', sens: -1 });
      for (let i = 0; i < 3; i++) { const px = xn + 110 + i * 150; s += `<g class="projecteur" data-x="${px}" data-y="545"><path d="M${px} 545L${px - 1600} 420V720z" fill="#fff6d8" opacity="0.1"/>${halo(px, 545, 50, 50, '#fff6d8', 0.9)}</g><path d="M${px} 590v-45" stroke="#3a3a3a" stroke-width="6"/>`; }
      // Rive sud et troupeau qui arrive.
      s += `<path d="M-10 1010V640L${xs + 60} 640L${xs + 120} 760V1010z" fill="#7a7260"/>`;
      s += `<g class="troupeau-sud" opacity="0">${Array.from({ length: 160 }, () => { const x = rnd() * (xs + 60), y = 640 + rnd() * 30; return `<rect x="${r1(x)}" y="${r1(y - 26)}" width="9" height="${r1(24 + rnd() * 8)}" rx="4" fill="#121316"/>`; }).join('')}</g>`;
      // Pylônes, câbles, suspentes, tablier.
      s += pylone(xs, 740, 360, pierre) + pylone(xn, 740, 360, pierre);
      const cx = (xs + xn) / 2;
      let susp = '';
      for (let x = xs + 40; x < xn - 40; x += 36) { const u = (x - xs) / (xn - xs), y = 400 + (1 - Math.pow(2 * u - 1, 2)) * 170; susp += `M${r1(x)} ${r1(y)}V${TABLIER}`; }
      s += `<g class="cables"><path d="M${xs - 60} 740L${xs} 390Q${cx} 740 ${xn} 390L${xn + 70} 600" stroke="#2a2a2a" stroke-width="7" fill="none"/><path d="${susp}" stroke="#3a3a3a" stroke-width="2.4"/></g>`;
      s += `<rect x="${xs}" y="${TABLIER}" width="${xn - xs}" height="16" fill="#6a5a42"/>`;
      let pl = ''; for (let x = xs; x < xn; x += 12) pl += `M${x} ${TABLIER}v16`;
      s += `<path d="${pl}" stroke="#4a3c2a" stroke-width="2"/><path d="M${xs} ${TABLIER - 40}H${xn}M${xs} ${TABLIER - 20}H${xn}" stroke="#3a3a3a" stroke-width="3"/>`;
      s += `<text x="${lerp(xs, xn, 0.62)}" y="${TABLIER - 50}" font-family="Oswald, sans-serif" font-size="44" font-weight="600" text-anchor="middle" fill="#b8322c">200 M</text>`;
      // Herse au bout des planches, côté nord.
      let hg = ''; for (let k = 0; k < 7; k++) hg += `M${xn - 70 + k * 18} ${TABLIER - 150}v150`;
      s += `<g class="herse" transform="translate(0,-170)"><path d="${hg}M${xn - 74} ${TABLIER - 120}h124M${xn - 74} ${TABLIER - 60}h124" stroke="#2a2a2a" stroke-width="6"/></g>`;
      // La colonne sur le pont.
      for (let i = 0; i < 16; i++) s += passant(lerp(xs + 20, xn - 200, i / 16) + rnd() * 30, TABLIER, 56 + rnd() * 12, { v: 20 + rnd() * 6, L: xn - 100, pose: rnd() < 0.3 ? 'courbe' : 'marche', corps: rnd.choix(['#1c1c20', '#2a2420', '#3a2a24']), cls: 'traverse' });
      return s;
    } },
    { profondeur: 0.72, svg: (L) => {
      const rnd = alea('dur-eau');
      const id = uid('eau');
      let s = `<defs>${degrade(id, [[0, '#8a9290'], [0.5, '#6a7470'], [1, '#4a5250']])}</defs><rect x="-5" y="760" width="${L + 10}" height="260" fill="url(#${id})"/>`;
      let d = ''; for (let i = 0; i < L / 14; i++) { const x = rnd() * L, y = 770 + rnd() * 220; d += `M${r1(x)} ${r1(y)}h${r1(20 + rnd() * 60)}`; }
      const ecume = `<path class="ecume" d="${d}" stroke="#e8ece8" stroke-width="3" opacity="0.5" stroke-dasharray="30 20"/>`; void ecume;
      let g = ''; for (let i = 0; i < 120; i++) g += `<ellipse cx="${r1(rnd() * L)}" cy="${r1(790 + rnd() * 30)}" rx="${r1(8 + rnd() * 16)}" ry="5" fill="#b8b2a4"/>`;
      s += `<path d="M-10 800Q${L * 0.3} 780 ${L * 0.45} 800T${L + 10} 790V830H-10z" fill="#a8a294" opacity="0.8"/>` + g;
      return s;
    } },
    { profondeur: 0.72, svg: (L) => { const rnd = alea('dur-eau'); let d = ''; for (let i = 0; i < L / 14; i++) { const x = rnd() * L, y = 770 + rnd() * 220; d += `M${r1(x)} ${r1(y)}h${r1(20 + rnd() * 60)}`; } return `<path class="ecume" d="${d}" stroke="#e8ece8" stroke-width="3" opacity="0.5" stroke-dasharray="30 20"/>`; } },
    { profondeur: 1, svg: (L) => { const rnd = alea('dur-ros'); return herbes(L, 1000, rnd, '#4a5030', { densite: 0.2, hMax: 260, couche: 0.25, epais: 5, cls: 'roseaux' }) + herbes(L, 1010, rnd, '#6a6a40', { densite: 0.14, hMax: 200, couche: 0.3, epais: 4, cls: 'roseaux' }); } },
    { profondeur: 1, svg: (L) => {
      const rnd = alea('dur-pp');
      let s = '';
      // Téléphone (gros plan) — invisible hors de son animation.
      const px = L * 0.5, py = 700;
      s += `<g class="telephone" opacity="0"><path d="M${px - 150} ${py + 330}q-20 -120 60 -200" stroke="#6a4a3a" stroke-width="90" stroke-linecap="round" fill="none"/>`;
      s += `<rect x="${px - 110}" y="${py - 200}" width="220" height="420" rx="26" fill="#0a0a0c"/><rect x="${px - 98}" y="${py - 182}" width="196" height="384" rx="12" fill="#12161c"/>`;
      s += `<text x="${px}" y="${py - 110}" font-family="Oswald, sans-serif" font-size="22" text-anchor="middle" fill="#cfd6de" class="tel-txt">Envoi…</text><rect x="${px - 80}" y="${py - 80}" width="160" height="10" rx="5" fill="#2a3038"/><rect class="tel-barre" x="${px - 80}" y="${py - 80}" width="0" height="10" rx="5" fill="#e6dfcc"/>`;
      s += `<path d="M${px + 50} ${py - 160}h6v-6h6v-6h6v-6h6v24z" fill="#e6dfcc" opacity="0.8"/><rect x="${px - 80}" y="${py - 40}" width="160" height="200" fill="#1c2430"/>${humain(px, py + 150, 150, 'debout', { corps: '#0a0c10' })}</g>`;
      // Mosaïque d'écrans.
      // Mosaïque d'écrans : journaux, visages, le pont, du texte — la vidéo partout.
      let m = ''; const cw = 170, ch = 104;
      for (let y = 0; y < 1000; y += ch + 10) for (let x = 0; x < L; x += cw + 10) {
        const f = rnd.choix(['#8fa8c4', '#b8c8d8', '#d8dde0', '#4a6a90', '#c9a080', '#2a3446']), k = rnd();
        let c = `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${f}"/>`;
        if (k < 0.4) c += `<circle cx="${x + cw * 0.5}" cy="${y + ch * 0.42}" r="${ch * 0.18}" fill="#2a2020" opacity="0.75"/><path d="M${x + cw * 0.3} ${y + ch}q${cw * 0.2} ${-ch * 0.45} ${cw * 0.4} 0z" fill="#2a2020" opacity="0.75"/>`;
        else if (k < 0.65) c += `<path d="M${x} ${y + ch * 0.7}h${cw}" stroke="#3a3a3a" stroke-width="4"/><path d="M${x + 10} ${y + ch * 0.2}q${cw * 0.4} ${ch * 0.4} ${cw - 20} 0" stroke="#1a1a1a" stroke-width="2" fill="none"/>`;
        else c += `<path d="M${x + 12} ${y + 20}h${cw * 0.7}M${x + 12} ${y + 40}h${cw * 0.5}M${x + 12} ${y + 60}h${cw * 0.6}" stroke="#1a1e26" stroke-width="6" opacity="0.6"/><rect x="${x}" y="${y + ch - 18}" width="${cw}" height="18" fill="#b8322c"/>`;
        m += `<g class="ecran" data-d="${r1(rnd() * 2.5)}" opacity="0">${c}</g>`;
      }
      s += `<g class="mosaique"><rect class="fond-mosaique" x="-5" y="-5" width="${L + 10}" height="1010" fill="#050608" opacity="0"/>${m}</g>`;
      return s;
    } },
  ],
  ambiance: ['eau_ecume'],
  anims: {
    cables_vibrent(t, S) { for (const el of S.q('.cables')) S.attr(el, 'transform', `translate(0,${(Math.sin(t * 17) * 1.5 + Math.sin(t * 2.1) * 2).toFixed(2)})`); onduler(t, S, '.roseaux', 12, 2, 0.6); },
    eau_ecume(t, S) { for (const el of S.q('.ecume')) S.attr(el, 'stroke-dashoffset', r1(t * 90)); },
    colonne_traverse(t, S) { animerPassants(t, S, '.traverse', { marge: 0 }); },
    projecteurs(t, S) { S.q('.projecteur').forEach((el, i) => S.attr(el, 'transform', `rotate(${(Math.sin(t * 0.5 + i * 2) * 5).toFixed(2)} ${el.dataset.x} ${el.dataset.y})`)); },
    troupeau_arrive(t, S) { const k = ease(S.tp / 4); for (const el of S.q('.troupeau-sud')) { S.attr(el, 'opacity', k.toFixed(2)); S.attr(el, 'transform', `translate(${r1(-200 + k * 200)},0)`); } },
    herse_tombe(t, S) { const k = Math.min(1, Math.max(0, (S.tp - 1) / 0.35)); const b = k >= 1 ? Math.sin((S.tp - 1.35) * 20) * Math.exp(-(S.tp - 1.35) * 6) * 8 : 0; for (const el of S.q('.herse')) S.attr(el, 'transform', `translate(0,${r1(-170 * (1 - k * k) + b)})`); },
    pont_routier_saute(t, S) {
      const tp = S.tp - 3;
      for (const el of S.q('.explosion')) S.attr(el, 'opacity', tp < 0 ? '0' : Math.max(0.5, 1 - tp * 0.3).toFixed(2));
      const k = Math.max(0, Math.min(1, tp / 1.4));
      for (const el of S.q('.troncon')) S.attr(el, 'transform', `translate(0,${r1(k * k * 140)}) rotate(${r1(k * 30)} ${el.dataset.x} ${el.dataset.y})`);
    },
    conteneurs_basculent(t, S) {
      S.q('.conteneur').forEach((el, i) => { const k = Math.max(0, Math.min(1, (S.tp - 1 - i * 0.15) / 1.2)); S.attr(el, 'transform', `translate(${r1(k * 20)},${r1(k * k * 90)}) rotate(${r1(k * (i % 2 ? 70 : -50))} ${el.dataset.x} ${el.dataset.y})`); });
    },
    troupeau_traverse(t, S) { for (const el of S.q('.troupeau-routier')) { S.attr(el, 'opacity', Math.min(1, S.tp / 1.5).toFixed(2)); S.attr(el, 'transform', `translate(${r1(S.tp * 80)},0)`); } },
    telephone_envoye(t, S) {
      for (const el of S.q('.telephone')) S.attr(el, 'opacity', Math.min(1, S.tp / 0.6).toFixed(2));
      const k = Math.min(1, Math.max(0, (S.tp - 0.6) / 3));
      for (const el of S.q('.tel-barre')) S.attr(el, 'width', r1(160 * ease(k)));
      for (const el of S.q('.tel-txt')) if (k >= 1 && !el.__ok) { el.__ok = true; el.textContent = 'Envoyé.'; }
    },
    ecrans_s_allument(t, S) { for (const el of S.q('.fond-mosaique')) S.attr(el, 'opacity', Math.min(1, Math.max(0, (S.tp - 0.6) / 1.2)).toFixed(2)); for (const el of S.q('.ecran')) S.attr(el, 'opacity', Math.max(0, Math.min(1, (S.tp - 1 - +el.dataset.d) / 0.6)).toFixed(2)); },
  },
};
