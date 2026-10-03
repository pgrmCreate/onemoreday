// ============ Toasts — messages brefs (écoute bus 'toast' { texte, type: 'info'|'bon'|'mauvais'|'alerte' }) ============
// demarrerToasts() branche l'écoute (idempotent). toast(texte, type) pour un appel direct.
import { on } from '../core/bus.js';
import { genrer } from '../core/state.js';
import { ico } from './icons.js';

let racine = null, branche = false;
const MAX = 3, DUREE = { info: 3200, bon: 3400, alerte: 4200, mauvais: 4600 };
const ICONE = { info: 'info', bon: 'coche', alerte: 'alerte', mauvais: 'alerte' };
const derniers = new Map(); // anti-doublon (même texte < 1,2 s)

function conteneur() {
  if (racine && racine.isConnected) return racine;
  racine = document.createElement('div');
  racine.className = 'ui-toasts'; racine.setAttribute('role', 'status'); racine.setAttribute('aria-live', 'polite');
  document.body.appendChild(racine);
  return racine;
}
export function toast(texte, type = 'info') {
  if (!texte || typeof document === 'undefined') return;
  texte = genrer(String(texte));
  const t = performance.now();
  if (t - (derniers.get(texte) || 0) < 1200) return;
  derniers.set(texte, t);
  const c = conteneur();
  const n = document.createElement('div');
  n.className = `ui-toast ui-toast-${type}`;
  n.innerHTML = `${ico(ICONE[type] || 'info')}<span></span>`;
  n.lastChild.textContent = texte;
  n.addEventListener('click', () => fermer(n));
  c.appendChild(n);
  while (c.children.length > MAX) c.firstChild.remove();
  requestAnimationFrame(() => n.classList.add('visible'));
  setTimeout(() => fermer(n), DUREE[type] || 3200);
}
function fermer(n) { if (!n.isConnected) return; n.classList.remove('visible'); n.classList.add('sortie'); setTimeout(() => n.remove(), 260); }
export function demarrerToasts() {
  if (branche) return; branche = true;
  on('toast', (d) => toast(d && d.texte, d && d.type));
}
