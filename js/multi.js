// ============ Session co-op (hôte autoritaire) ============
// Un HÔTE crée la partie : son navigateur fait foi pour le monde (temps, zombies,
// histoire). Un INVITÉ rejoint : à la connexion il ADOPTE le monde de l'hôte, puis
// chacun diffuse sa position. On se voit sur la carte quand on est dans la ligne de
// mire de l'autre ; on peut se rejoindre dans un combat. Toute la mécanique réseau
// passe par js/net.js (transport) — ce module ne fait que la colle côté jeu.
//
// Tout est gardé derrière estMulti() : en solo, ce module dort et ne change rien.
import { G } from './state.js';
import * as net from './net.js';

let actif = false;   // une session multi est en cours
let monRole = null;  // 'host' | 'guest'
let pair = null;     // dernier état connu du coéquipier : { nom, carte, x, y, pvTier, enCombat, combat }
const cbs = {};      // hooks posés par map.js / main.js : onMonde, onPairMaj, onVivant, onCombat, onSysteme, onPairPresence

export function estMulti() { return actif; }
export function monCode() { return net.code(); } // le code de salon, pour l'afficher en jeu
export function role() { return monRole; }
export function estHote() { return monRole === 'host'; }
export function estInvite() { return monRole === 'guest'; }
export function pairEtat() { return pair; }
export function pairPresent() { return net.pairPresent(); }
export function poser(nom, fn) { cbs[nom] = fn; } // enregistre un hook de jeu

// Démarre une session. opts : { url?, code, role:'host'|'guest', nom }.
export async function demarrer(opts) {
  const r = await net.connecter(opts);
  if (!r.ok) return r;
  actif = true; monRole = r.infos.role; pair = null;
  net.on('message', recevoir);
  if (estInvite()) net.envoyer({ t: 'demande-monde' }); // réclame le monde à l'hôte (anti-course)
  net.on('pair', (present, m) => {
    if (present) {
      if (estHote()) envoyerMonde();   // un invité arrive : on lui pousse le monde + notre position
      diffuserPosition();
      if (cbs.onSysteme) cbs.onSysteme(`${(m && m.nom) || net.nomPair() || 'Ton coéquipier'} a rejoint la partie.`, 'good');
    } else {
      pair = null;
      if (cbs.onPairMaj) cbs.onPairMaj(null);
      if (cbs.onSysteme) cbs.onSysteme('Ton coéquipier a quitté la partie.', 'warn');
    }
    if (cbs.onPairPresence) cbs.onPairPresence(present);
  });
  net.on('etat', (e) => {
    if (e === 'ferme' && actif) { actif = false; pair = null; if (cbs.onPairMaj) cbs.onPairMaj(null); if (cbs.onSysteme) cbs.onSysteme('Connexion co-op perdue — tu continues en solo.', 'warn'); }
  });
  return r;
}
export function arreter() { actif = false; monRole = null; pair = null; net.deconnecter(); }

// ---------- Émissions ----------
// L'hôte envoie le monde complet à l'invité (adopté tel quel côté invité).
function envoyerMonde() { net.envoyer({ t: 'monde', world: G.world, nom: G.player.nom }); }

// Ma position + mon état, à chaque pas / rendu. extra : { enCombat, combat }.
export function diffuserPosition(extra = {}) {
  if (!actif) return;
  net.envoyer({ t: 'pos', carte: G.world.carte, x: G.world.x, y: G.world.y, nom: G.player.nom, pvTier: pvTier(), ...extra });
}
// L'hôte diffuse le monde « vivant » : le temps et les zombies de la carte courante,
// pour que l'invité voie les mêmes morts bouger au même endroit.
export function diffuserMondeVivant() {
  if (!actif || !estHote()) return;
  const carte = G.world.carte;
  net.envoyer({
    t: 'vivant', jour: G.world.jour, heure: G.world.heure, minute: G.world.minute,
    carte, zmap: (G.world.zmap && G.world.zmap[carte]) || null, portes: (G.world.portes && G.world.portes[carte]) || null,
  });
}
// Événements de combat partagés (invitation à rejoindre, dégâts, mort, fin).
export function diffuserCombat(payload) { if (actif) net.envoyer({ t: 'combat', ...payload }); }
// Mutations du monde partagé (case fouillée, objets au sol, porte enfoncée, drapeau).
export function diffuserEvenement(ev) { if (actif) net.envoyer({ t: 'evt', ...ev }); }
// Une cinématique déclenchée par moi : l'autre doit la voir aussi.
export function diffuserCine(id) { if (actif) net.envoyer({ t: 'cine', id }); }

function pvTier() { const p = G.player.pv; return p > 66 ? 'ok' : p > 33 ? 'amoche' : 'critique'; }

// ---------- Réception ----------
function recevoir(m) {
  switch (m.t) {
    case 'demande-monde':
      if (estHote()) { envoyerMonde(); diffuserPosition(); }
      break;
    case 'monde':
      if (cbs.onMonde) cbs.onMonde(m.world, m.nom);
      break;
    case 'pos':
      pair = { nom: m.nom, carte: m.carte, x: m.x, y: m.y, pvTier: m.pvTier, enCombat: !!m.enCombat, combat: m.combat || null };
      if (cbs.onPairMaj) cbs.onPairMaj(pair);
      break;
    case 'vivant':
      if (cbs.onVivant) cbs.onVivant(m);
      break;
    case 'combat':
      if (cbs.onCombat) cbs.onCombat(m);
      break;
    case 'evt':
      if (cbs.onEvenement) cbs.onEvenement(m);
      break;
    case 'cine':
      if (cbs.onCine) cbs.onCine(m.id);
      break;
  }
}
