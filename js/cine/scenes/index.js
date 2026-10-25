// ============ Cinématiques — chargement des décors ============
// chargerDecor(id) → Promise<décor> : import dynamique de ./<id>.js ; si le décor manque ou plante,
// un décor de repli (fond noir, nom du lieu en filigrane) est rendu à la place — jamais d'exception.
// vignette(id, { ratio }) → Promise<string> : le décor figé en un seul SVG (cadrage centré, 16:9 par défaut),
// pour illustrer une scène narrative (clé `illu` des scènes).
import { H, F, esc } from '../lib.js';
import { PHOTOS, appliquerPhoto } from '../photos.js';

const cache = new Map();

export function decorRepli(id) {
  const nom = String(id || '').replace(/_/g, ' ');
  return {
    largeur: 1, fond: '#0b0b0c', repli: true,
    couches: [
      { profondeur: 0, svg: (L, h) => `<defs><radialGradient id="rpl-${esc(id)}"><stop offset="0" stop-color="#1b1a1d"/><stop offset="1" stop-color="#0b0b0c"/></radialGradient></defs><rect width="${L}" height="${h}" fill="url(#rpl-${esc(id)})"/>` },
      { profondeur: 0.6, svg: (L, h) => `<text x="${L / 2}" y="${h * 0.47}" text-anchor="middle" font-family="Oswald, sans-serif" font-size="46" letter-spacing="14" fill="#e6dfcc" opacity="0.18">${esc(nom.toUpperCase())}</text><path d="M${L / 2 - 120} ${h * 0.52}h240" stroke="#c9a227" stroke-width="2" opacity="0.35"/>` },
    ],
    anims: {},
  };
}

// Un décor sans dessin, fait de sa seule plaque photo (rendue dans Blender, js/cine/photos.js).
function decorPhoto(id) {
  return { largeur: 1.12, fond: '#0b0b0c', photoSeule: true, couches: [{ profondeur: 0, svg: (L, h) => `<rect width="${L}" height="${h}" fill="#0b0b0c"/>` }], anims: {} };
}

function valider(mod, id) {
  if (!mod || !Array.isArray(mod.couches) || !mod.couches.length) { console.warn('[cine] décor mal formé :', id); return decorRepli(id); }
  return mod;
}

export function chargerDecor(id) {
  if (!id) return Promise.resolve(decorRepli('noir'));
  if (!cache.has(id)) {
    const safe = String(id).replace(/[^a-z0-9_]/gi, '');
    cache.set(id, PHOTOS[id] && PHOTOS[id].seule ? Promise.resolve(decorPhoto(id))
      : import(`./${safe}.js`).then(m => valider(m.default, id)).catch(e => { if (PHOTOS[id]) return decorPhoto(id); console.warn('[cine] décor absent :', id, e && e.message); return decorRepli(id); }));
  }
  return cache.get(id);
}

export async function vignette(id, { ratio = 16 / 9, x = 0.5 } = {}) {
  const d = await chargerDecor(id);
  const Wv = Math.round(H * ratio);
  const Wd = Math.max(1, d.largeur || 2.2) * F;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wv} ${H}" preserveAspectRatio="xMidYMid slice" style="background:${d.fond || '#0b0b0c'}">`;
  // une plaque photo (Blender) : au fond, couvrante ; les couches dessinées proches restent, assombries
  const ph = d.repli ? null : appliquerPhoto(id, d.couches);
  if (ph) s += ph.photo.svg(Wv, H);
  for (const c of (ph ? ph.couches : d.couches)) {
    const p = Math.max(0, c.profondeur ?? 0.5);
    const L = Math.round(F + (Wd - F) * (p <= 1 ? 0.07 + 0.93 * p : p));
    let contenu = '';
    try { contenu = c.svg(L, H); } catch (e) { contenu = ''; }
    s += `<g transform="translate(${-Math.round((L - Wv) * x)},0)">${contenu}</g>`;
  }
  return s + '</svg>';
}
