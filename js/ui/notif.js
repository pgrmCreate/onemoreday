// ============ Bandeaux de mission — « Nouvelle mission », « Objectif rempli », « Mission accomplie / échouée » ============
// Écoute le bus 'mission:notif' { type: 'nouveau'|'objectif'|'reussite'|'echec'|'info', titre, texte }.
// Un bandeau à la fois, en haut au centre, dans une file : on ne rate rien, même quand plusieurs objectifs tombent ensemble.
import { on } from '../core/bus.js';
import { genrer } from '../core/state.js';
import { ico } from './icons.js';

const DUREE = { nouveau: 4200, objectif: 3400, reussite: 4800, echec: 5200, info: 3600 };
const ICONE = { nouveau: 'objectif', objectif: 'coche', reussite: 'coche', echec: 'alerte', info: 'info' };
const SON = { nouveau: 'decouverte', objectif: 'decouverte', reussite: 'decouverte', echec: 'alerte_infection', info: null };
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
  if (!n || typeof document === 'undefined') return;
  const d = file[file.length - 1];
  if (d && d.titre === n.titre && d.texte === n.texte) return;   // doublon immédiat
  file.push(n);
  if (!enCours) suivant();
}
function suivant() {
  const n = file.shift();
  if (!n) { enCours = false; return; }
  enCours = true;
  const type = n.type || 'info';
  const b = document.createElement('div');
  b.className = `ui-notif ui-notif-${type}`;
  b.innerHTML = `<span class="ui-notif-ic">${ico(ICONE[type] || 'info')}</span><span class="ui-notif-t"><b></b><span></span></span>`;
  b.querySelector('b').textContent = genrer(n.titre || '');
  b.querySelector('.ui-notif-t span').textContent = genrer(n.texte || '');
  b.addEventListener('click', () => fermer(b));
  conteneur().appendChild(b);
  try { if (SON[type] && audio && audio.sfx) audio.sfx(SON[type]); } catch (e) {}
  requestAnimationFrame(() => b.classList.add('visible'));
  b._t = setTimeout(() => fermer(b), DUREE[type] || 3600);
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
