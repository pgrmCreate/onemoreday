// L'intérieur de la housse. Presque noir ; le plastique laiteux respire, se colle au visage ;
// la fermeture éclair s'ouvre de haut en bas et une lumière orangée entre. Sert aussi au carton de titre.
import { r1, uid, radial, degrade, halo } from '../lib.js';

export default {
  largeur: 1,
  fond: '#050506',
  couches: [
    { profondeur: 0, svg: (L, H) => {
      const id = uid('h'), id2 = uid('h');
      let s = `<defs>${radial(id, [[0, '#3a3936', 0.9], [0.5, '#17171a', 0.95], [1, '#050506', 1]])}${degrade(id2, [[0, '#ffffff', 0], [0.5, '#e9e4da', 0.07], [1, '#ffffff', 0]], 'h')}</defs>`;
      s += `<rect width="${L}" height="${H}" fill="#050506"/><g class="plastique" data-x="${L / 2}" data-y="${H / 2}"><ellipse cx="${L / 2}" cy="${H * 0.5}" rx="${L * 0.55}" ry="${H * 0.8}" fill="url(#${id})"/>`;
      // Plis du plastique : grands reflets courbes.
      for (let i = 0; i < 9; i++) {
        const x = L * (0.12 + i * 0.1), c = (i % 2 ? 1 : -1) * 90;
        s += `<path d="M${r1(x)} -20C${r1(x + c)} ${H * 0.3} ${r1(x - c)} ${H * 0.65} ${r1(x + c * 0.4)} ${H + 20}" stroke="#d8d2c6" stroke-width="${18 + (i % 3) * 14}" fill="none" opacity="${0.025 + (i % 3) * 0.015}"/>`;
      }
      s += `<rect width="${L}" height="${H}" fill="url(#${id2})"/></g>`;
      return s;
    } },
    { profondeur: 0.45, svg: (L, H) => {
      const x = L / 2;
      let dents = '';
      for (let y = 0; y < H; y += 14) dents += `M${x - 9} ${y}h8M${x + 1} ${y + 7}h8`;
      let s = `<g class="zip"><path d="M${x} 0V${H}" stroke="#0a0a0b" stroke-width="30"/><path d="${dents}" stroke="#56534e" stroke-width="5"/></g>`;
      s += `<g class="ouverture" opacity="0">${halo(x, 360, 200, 520, '#e89048', 0.45)}<path class="fente" d="M${x} 0L${x} 0Z" fill="#f4b068"/><path class="fente-coeur" d="M${x} 0L${x} 0Z" fill="#fff0cc"/></g>`;
      s += `<g class="curseur" transform="translate(${x},0)"><rect x="-14" y="-10" width="28" height="44" rx="5" fill="#77736b"/><rect x="-6" y="30" width="12" height="36" rx="4" fill="#5a5750"/></g>`;
      return s;
    } },
    { profondeur: 0.85, svg: (L, H) => {
      // Empreinte du visage quand le plastique se colle : arête du nez, arcades, lèvres.
      const x = L * 0.5, y = H * 0.5;
      return `<g class="visage" opacity="0" stroke="#e8e2d6" fill="none" stroke-linecap="round">
        <path d="M${x - 160} ${y - 120}q70 -40 130 -8M${x + 160} ${y - 120}q-70 -40 -130 -8" stroke-width="10" opacity="0.5"/>
        <path d="M${x} ${y - 110}q-8 90 -26 130q20 16 44 2" stroke-width="12" opacity="0.6"/>
        <path d="M${x - 70} ${y + 110}q70 24 140 0" stroke-width="8" opacity="0.45"/>
        <path d="M${x - 240} ${y - 260}q240 -130 480 0" stroke-width="16" opacity="0.2"/>
      </g>`;
    } },
  ],
  anims: {
    souffle_plastique(t, S) {
      // Respiration lente et irrégulière : gonfle, puis colle.
      const c = (t % 3.4) / 3.4, b = c < 0.4 ? Math.sin(c / 0.4 * Math.PI / 2) : Math.cos((c - 0.4) / 0.6 * Math.PI / 2);
      for (const el of S.q('.plastique')) S.attr(el, 'transform', `translate(${el.dataset.x},${el.dataset.y}) scale(${(1 + b * 0.05).toFixed(4)}) translate(${-el.dataset.x},${-el.dataset.y})`);
      for (const el of S.q('.visage')) S.attr(el, 'opacity', (Math.max(0, 1 - b * 1.6) * 0.9).toFixed(2));
    },
    fermeture_eclair(t, S) {
      const L = S.couches[1].L, x = L / 2;
      const k = Math.max(0, Math.min(1, (S.tp - 1) / 4.5)), e = k * k * (3 - 2 * k);
      const yb = e * 780, w = 6 + e * 22 + Math.sin(t * 2.2) * 2;
      for (const el of S.q('.ouverture')) { S.attr(el, 'opacity', Math.min(1, k * 4).toFixed(2)); }
      for (const el of S.q('.fente')) S.attr(el, 'd', `M${x} -10C${x - w} ${r1(yb * 0.3)} ${x - w * 0.8} ${r1(yb * 0.8)} ${x} ${r1(yb)}C${x + w * 0.8} ${r1(yb * 0.8)} ${x + w} ${r1(yb * 0.3)} ${x} -10Z`);
      for (const el of S.q('.fente-coeur')) S.attr(el, 'd', `M${x} -10C${x - w * 0.3} ${r1(yb * 0.3)} ${x - w * 0.2} ${r1(yb * 0.7)} ${x} ${r1(yb * 0.9)}C${x + w * 0.2} ${r1(yb * 0.7)} ${x + w * 0.3} ${r1(yb * 0.3)} ${x} -10Z`);
      for (const el of S.q('.curseur')) S.attr(el, 'transform', `translate(${x},${r1(yb)})`);
    },
  },
};
