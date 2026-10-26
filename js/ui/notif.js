// ============ Les pensées du personnage — une ligne discrète en haut de l'écran ============
// Écoute le bus 'mission:notif' { type: 'nouveau'|'objectif'|'reussite'|'echec'|'info'|'pensee', texte }.
// Ce n'est pas un RPG (docs/RETOURS_JOUEUR.md #60) : pas de titre « Nouvelle mission » ni « Objectif rempli », pas de
// jingle. Seulement ce que pense le personnage, en italique, une pensée à la fois, dans une file : on ne rate rien.
// Seul un échec (repéré·e, un poste quitté) fait un bruit sourd.
import { on } from '../core/bus.js';
import { genrer } from '../core/state.js';

// le temps de lire : une base, plus le temps des mots
const duree = (texte) => Math.min(9000, 2600 + 55 * texte.length);
const SON = { echec: 'alerte_infection' };
const file = [];
let racine = null, enCours = false, branche = false;
let audio = null;
import('../audio.js').then(m => { audio = m; }).catch(() => {});

function conteneur() {
  if (racine && racine.isConnected) return racine;
  racine = document.createElement('div');
  racine.className = 'ui-notifs'; racine.setAttribute('role', 'status'); racine.setAttribute('aria-live', 'polite');
  document.body.appendChild(racine);
  return racine;
}
export function notifier(n) {
  if (!n || !n.texte || typeof document === 'undefined') return;
  const d = file[file.length - 1];
  if (d && d.texte === n.texte) return;   // doublon immédiat
  file.push(n);
  if (!enCours) suivant();
}
function suivant() {
  const n = file.shift();
  if (!n) { enCours = false; return; }
  enCours = true;
  const type = n.type || 'info';
  const texte = genrer(n.texte || '');
  const b = document.createElement('div');
  b.className = `ui-pensee ui-pensee-${type}`;
  b.textContent = texte;
  b.addEventListener('click', () => fermer(b));
  conteneur().appendChild(b);
  try { if (SON[type] && audio && audio.sfx) audio.sfx(SON[type]); } catch (e) {}
  requestAnimationFrame(() => b.classList.add('visible'));
  b._t = setTimeout(() => fermer(b), duree(texte));
}
function fermer(b) {
  if (!b.isConnected || b._ferme) return;
  b._ferme = true; clearTimeout(b._t);
  b.classList.remove('visible'); b.classList.add('sortie');
  setTimeout(() => { b.remove(); suivant(); }, 320);
}
export function demarrerNotifs() {
  if (branche) return; branche = true;
  on('mission:notif', (n) => notifier(n));
}
