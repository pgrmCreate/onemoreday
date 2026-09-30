// ============ Panneau Options (Menu) — son, vibrations, taille du texte, commandes, sauvegarder, quitter ============
// Préférences via js/core/prefs.js (seul endroit qui touche localStorage). Taille du texte : variable CSS --ui-echelle.
// « Quitter vers le titre » émet bus 'menu:titre' (l'intégrateur ramène à l'écran titre).
import { G, sauver } from '../../core/state.js';
import { emit } from '../../core/bus.js';
import { pref, setPref } from '../../core/prefs.js';
import { toast } from '../toast.js';
import { el, icoEl, onglets, bouton, g } from './commun.js';

const TAILLES = [['petit', 'Petit', 0.9], ['normal', 'Normal', 1], ['grand', 'Grand', 1.15], ['tresgrand', 'Très grand', 1.3]];
export function appliquerTailleTexte() {
  if (typeof document === 'undefined') return;
  const t = TAILLES.find(x => x[0] === (pref('texte') || 'normal')) || TAILLES[1];
  document.documentElement.style.setProperty('--ui-echelle', String(t[2]));
}
appliquerTailleTexte();

let audio = null;
const chargerAudio = () => audio ? Promise.resolve(audio) : import('../../audio.js').then(m => (audio = m)).catch(() => null);

let etat = { onglet: 'reglages', confirmer: false };
export function monter(racine) {
  etat.confirmer = false;
  dessiner(racine);
  return {};
}
function ligne(icone, titre, sous, ctrl) {
  return el('div', { class: 'op-ligne' }, icoEl(icone), el('div', { class: 'op-txt' }, el('strong', {}, titre), sous ? el('small', {}, sous) : null), ctrl);
}
function interrupteur(on, f, label) {
  const b = el('button', { type: 'button', role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': label, class: 'op-switch' + (on ? ' on' : ''), onclick: () => f(!on) }, el('i'));
  return b;
}
function dessiner(racine) {
  racine.textContent = '';
  racine.append(el('div', { class: 'pn-barre' }, onglets([
    { id: 'reglages', label: 'Réglages', icone: 'options' },
    { id: 'commandes', label: 'Commandes', icone: 'clavier' },
  ], etat.onglet, (id) => { etat.onglet = id; dessiner(racine); })));
  const z = el('div', { class: 'op-zone', 'data-scroll': 'op' });
  if (etat.onglet === 'reglages') {
    const vol = el('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round((pref('volume') ?? 0.6) * 100)), 'aria-label': 'Volume', class: 'op-range' });
    const out = el('output', {}, `${vol.value} %`);
    vol.addEventListener('input', () => { out.textContent = `${vol.value} %`; setPref('volume', vol.value / 100); chargerAudio().then(a => a && a.setVolume && a.setVolume(vol.value / 100)); });
    z.append(el('h3', { class: 'pn-section' }, 'Son'),
      ligne('volume', 'Volume', null, el('div', { class: 'op-vol' }, vol, out)),
      ligne('muet', 'Couper le son', null, interrupteur(!!pref('muet'), (v) => { setPref('muet', v); chargerAudio().then(a => a && a.setMuted && a.setMuted(v)); dessiner(racine); }, 'Muet')),
      el('h3', { class: 'pn-section' }, 'Confort'),
      ligne('vibration', 'Vibrations', g('Sur mobile, au contact et quand tu es touché{|e}.'), interrupteur(pref('vibrations') !== false, (v) => { setPref('vibrations', v); dessiner(racine); }, 'Vibrations')),
      ligne('texte', 'Taille du texte', 'Interface, journal, documents.', el('div', { class: 'op-seg', role: 'radiogroup' }, ...TAILLES.map(([k, n]) =>
        el('button', { type: 'button', role: 'radio', 'aria-checked': (pref('texte') || 'normal') === k ? 'true' : 'false', class: (pref('texte') || 'normal') === k ? 'actif' : '', onclick: () => { setPref('texte', k); appliquerTailleTexte(); dessiner(racine); } }, n)))));
    z.append(el('h3', { class: 'pn-section' }, 'Partie'));
    if (G && G.mode === 'solo') z.append(ligne('coche', 'Sauvegarder', 'La partie se sauvegarde aussi seule, à chaque lieu.', bouton({ label: 'Sauvegarder', icone: 'coche', cls: 'second', onclick: () => toast(sauver() ? 'Partie sauvegardée.' : 'Sauvegarde impossible.', 'info') })));
    z.append(ligne('quitter', 'Quitter vers le titre', etat.confirmer ? 'Sûr ? Ce qui n\'est pas sauvegardé sera perdu.' : null,
      etat.confirmer
        ? el('div', { class: 'op-confirme' }, bouton({ label: 'Annuler', cls: 'second', onclick: () => { etat.confirmer = false; dessiner(racine); } }),
            bouton({ label: 'Quitter', icone: 'quitter', cls: 'danger', onclick: () => { if (G && G.mode === 'solo') sauver(); import('./index.js').then(m => m.fermerPanneau()); emit('menu:titre', {}); } }))
        : bouton({ label: 'Quitter', icone: 'quitter', cls: 'second', onclick: () => { etat.confirmer = true; dessiner(racine); } })));
  } else {
    const T = [
      ['Se déplacer', 'Z Q S D · W A S D · flèches', 'Joystick à gauche'],
      ['Courir / s\'accroupir', 'Maj · Ctrl ou C', 'Boutons à droite'],
      ['Interagir', 'E', 'Bouton « Interagir »'],
      ['Lampe', 'F', 'Bouton « Lampe »'],
      ['Sac · Corps · Journal', 'I · C (hors exploration) · J', 'Boutons ronds en haut à droite'],
      ['Fermer un panneau · Menu', 'Échap', 'Croix'],
      ['Frapper (maintenir = charger)', 'Espace ou J', 'Bouton « Frapper »'],
      ['Garde · Esquive · Pousser', 'K · L ou Maj · H', 'Boutons dédiés'],
      ['Accès rapide · Recharger', '1-4 · R', 'Ceinture en bas'],
      ['Fuir (maintenir)', 'Échap (1,5 s)', 'Bouton « Fuir »'],
    ];
    const tb = el('table', { class: 'op-commandes' }, el('thead', {}, el('tr', {}, el('th', {}, 'Action'), el('th', {}, 'Clavier'), el('th', {}, 'Tactile'))));
    const tbody = el('tbody'); for (const [a, k, t] of T) tbody.append(el('tr', {}, el('td', {}, a), el('td', {}, ...k.split(' · ').flatMap((x, i) => [i ? ' · ' : null, el('kbd', {}, x)])), el('td', {}, t)));
    tb.append(tbody); z.append(tb);
  }
  racine.append(z);
}
