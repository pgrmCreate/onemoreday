// ============ Moteur des fonds d'ambiance et des panoramas ============
// Le dessin d'une carte vit derrière la grille (sous un voile) et en grand via
// le bouton œil ; les panoramas servent aux cinématiques (plans caméra).
// Le ciel est calculé à l'heure du jeu : il change de couleur au fil de la journée.
import { ciel, W, H } from './art/ambiance_lib.js';
import { AMBIANCES } from './art/ambiances/index.js';
import { PANORAMAS, PANO_W, PANO_H } from './art/panoramas/index.js';

function contexte(prefixe, heure) {
  return { ...ciel(heure), heure, p: prefixe };
}

export function aAmbiance(carteId) { return !!AMBIANCES[carteId]; }

// Le fond d'une carte à une heure donnée (heure décimale : 8.5 = 8 h 30).
export function svgAmbiance(carteId, heure) {
  const fn = AMBIANCES[carteId];
  if (!fn) return '';
  try {
    const inner = fn(contexte('amb-' + carteId, heure));
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  } catch (e) { console.warn('Dessin d\'ambiance en panne :', carteId, e); return ''; }
}

// Un panorama de cinématique (large, pour les travellings).
export function svgPano(id, heure) {
  const fn = PANORAMAS[id];
  if (!fn) return '';
  try {
    const inner = fn(contexte('pano-' + id, heure));
    return `<svg viewBox="0 0 ${PANO_W} ${PANO_H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  } catch (e) { console.warn('Panorama en panne :', id, e); return ''; }
}
