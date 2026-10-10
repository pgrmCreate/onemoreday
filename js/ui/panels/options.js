// ============ Panneau Options (Menu) — aujourd'hui (date, heure, montre), son, vibrations, taille du texte, commandes, sauvegarder, quitter ============
// Préférences via js/core/prefs.js (seul endroit qui touche localStorage). Taille du texte : variable CSS --ui-echelle.
// « Quitter vers le titre » émet bus 'menu:titre' (l'intégrateur ramène à l'écran titre).
import { G, sauver } from '../../core/state.js';
import { emit } from '../../core/bus.js';
import { pref, setPref } from '../../core/prefs.js';
import { toast } from '../toast.js';
import { el, icoEl, onglets, bouton, g } from './commun.js';
import * as clock from '../../core/clock.js';
import * as inv from '../../game/inventory.js';
import { montrePortee, montreDansSac, sourceDate, texteHeure } from '../../game/temps_connu.js';

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
// Aujourd'hui : la date (montre digitale au poignet, ou calendrier / agenda dans le sac) et l'heure (montre au poignet).
// On y enfile la montre qu'on a dans le sac, ou on l'enlève.
function aujourdhui(racine) {
  if (!G || !G.player) return [];
  const p = G.player, m = montrePortee(p), src = sourceDate(p), iSac = montreDansSac(p);
  const res = (r) => { if (r && r.ok === false && r.raison) toast(r.raison, 'alerte'); dessiner(racine); };
  const date = src
    ? ligne('calendrier', `Jour ${clock.jour()} · ${clock.dateTexte(clock.jour(), 'long')}`, `D'après ${src.slot ? 'ta montre digitale' : src.id === 'agenda' ? 'ton agenda' : 'ton calendrier'}.`, null)
    : ligne('calendrier', `Jour ${clock.jour()}`, g('Tu comptes les jours depuis ton réveil, mais tu ne sais pas quelle date on est : une montre digitale, un calendrier ou un agenda te la donnerait.'), null);
  const ctrl = m ? bouton({ label: 'Enlever', icone: 'retirer', cls: 'second', onclick: () => { inv.desequiper('poignet'); dessiner(racine); } })
    : iSac >= 0 ? bouton({ label: 'Enfiler la montre', icone: 'montre', cls: 'principal', onclick: () => res(inv.equiper(iSac)) }) : null;
  const sous = m ? `${m.nom} au poignet.` : iSac >= 0 ? `Tu as une montre dans ton sac (${inv.nomObjet(p.inventaire[iSac].id).toLowerCase()}), mais pas au poignet.` : 'Pas de montre : tu devines l\'heure au ciel.';
  return [el('h3', { class: 'pn-section' }, 'Aujourd\'hui'), date, ligne('montre', texteHeure(p), sous, ctrl)];
}
function dessiner(racine) {
  racine.textContent = '';
  racine.append(el('div', { class: 'pn-barre' }, onglets([
    { id: 'reglages', label: 'Réglages', icone: 'options' },
    { id: 'commandes', label: 'Commandes', icone: 'clavier' },
  ], etat.onglet, (id) => { etat.onglet = id; dessiner(racine); })));
  const z = el('div', { class: 'op-zone', 'data-scroll': 'op' });
  if (etat.onglet === 'reglages') {
    z.append(...aujourdhui(racine));
    const vol = el('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round((pref('volume') ?? 0.6) * 100)), 'aria-label': 'Volume', class: 'op-range' });
    const out = el('output', {}, `${vol.value} %`);
    vol.addEventListener('input', () => { out.textContent = `${vol.value} %`; setPref('volume', vol.value / 100); chargerAudio().then(a => a && a.setVolume && a.setVolume(vol.value / 100)); });
    z.append(el('h3', { class: 'pn-section' }, 'Son'),
      ligne('volume', 'Volume', null, el('div', { class: 'op-vol' }, vol, out)),
      ligne('muet', 'Couper le son', null, interrupteur(!!pref('muet'), (v) => { setPref('muet', v); chargerAudio().then(a => a && a.setMuted && a.setMuted(v)); dessiner(racine); }, 'Muet')),
      el('h3', { class: 'pn-section' }, 'Confort'),
      ligne('vibration', 'Vibrations', g('Sur mobile, au contact et quand tu es touché{|e}.'), interrupteur(pref('vibrations') !== false, (v) => { setPref('vibrations', v); dessiner(racine); }, 'Vibrations')),
      ligne('texte', 'Taille du texte', 'Interface, journal, documents.', el('div', { class: 'op-seg', role: 'radiogroup' }, ...TAILLES.map(([k, n]) =>
        el('button', { type: 'button', role: 'radio', 'aria-checked': (pref('texte') || 'normal') === k ? 'true' : 'false', class: (pref('texte') || 'normal') === k ? 'actif' : '', onclick: () => { setPref('texte', k); appliquerTailleTexte(); dessiner(racine); } }, n)))),
      // mémorisé dans les préférences : il reste actif aux parties suivantes (core/cadence.js)
      ligne('pile', 'Mode économie', '30 images par seconde au lieu de 60 : le téléphone chauffe moins et la batterie tient plus longtemps.', interrupteur(!!pref('economie'), (v) => { setPref('economie', v); dessiner(racine); }, 'Mode économie')));
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
      ['Frapper (maintenir = charger)', 'Clic gauche', 'Bouton « Frapper »'],
      ['Pousser', 'Clic droit · Espace', 'Bouton « Pousser »'],
      ['Accès rapide · Recharger', '1-4 · R', 'Ceinture en bas'],
    ];
    const tb = el('table', { class: 'op-commandes' }, el('thead', {}, el('tr', {}, el('th', {}, 'Action'), el('th', {}, 'Clavier'), el('th', {}, 'Tactile'))));
    const tbody = el('tbody'); for (const [a, k, t] of T) tbody.append(el('tr', {}, el('td', {}, a), el('td', {}, ...k.split(' · ').flatMap((x, i) => [i ? ' · ' : null, el('kbd', {}, x)])), el('td', {}, t)));
    tb.append(tbody); z.append(tb);
  }
  racine.append(z);
}
