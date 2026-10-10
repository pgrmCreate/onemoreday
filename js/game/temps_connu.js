// ============ Ce que le personnage SAIT du temps — heure (montre au poignet), date (montre digitale, calendrier) ============
// Sans montre, on ne lit que le ciel : un moment vague (« Fin d'après-midi »). Une montre à aiguilles donne l'heure ;
// une montre digitale donne aussi la date ; un calendrier ou un agenda dans le sac donne la date.
// Le numéro du jour (« Jour 3 »), lui, on le compte soi-même : il est toujours connu.
// Utilisé par le HUD (lieu + heure), le Menu (date), le sommeil et les cartes de voyage.
import { G } from '../core/state.js';
import * as clock from '../core/clock.js';
import { REGLAGES } from '../data/reglages.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES } from '../data/clothing.js';

const joueur = (p) => p || (G && G.player);

// La montre portée au poignet (définition), ou null.
export function montrePortee(p) {
  p = joueur(p); const id = p && p.equip && p.equip.poignet;
  const c = id && CLOTHES[id];
  return c && c.heure ? { id, ...c } : null;
}
// Le premier objet du sac qui donne la date (calendrier, agenda), ou null.
export function calendrierSac(p) {
  p = joueur(p); if (!p || !p.inventaire) return null;
  const it = p.inventaire.find(x => ITEMS[x.id] && ITEMS[x.id].date);
  return it ? { id: it.id, ...ITEMS[it.id] } : null;
}
// Une montre dans le sac, pas encore au poignet (pour proposer « Enfiler la montre »).
export function montreDansSac(p) {
  p = joueur(p); if (!p || !p.inventaire) return -1;
  return p.inventaire.findIndex(x => CLOTHES[x.id] && CLOTHES[x.id].heure);
}
export const heureConnue = (p) => !!montrePortee(p);
export function dateConnue(p) { const m = montrePortee(p); return !!(m && m.date) || !!calendrierSac(p); }
// D'où vient la date : la montre digitale d'abord (au poignet), sinon le calendrier du sac.
export function sourceDate(p) {
  const m = montrePortee(p); if (m && m.date) return m;
  return calendrierSac(p);
}

// Le moment de la journée tel qu'on le devine au ciel (sans montre).
export function momentVague(h = clock.heureDecimale()) {
  const H = REGLAGES.temps.HEURES;
  if (h < 4) return 'Pleine nuit';
  if (h < H.AUBE) return 'Avant l\'aube';
  if (h < H.JOUR) return 'Aube';
  if (h < 11) return 'Matinée';
  if (h < 13.5) return 'Vers midi';
  if (h < 16.5) return 'Après-midi';
  if (h < H.CREPUSCULE) return 'Fin d\'après-midi';
  if (h < H.NUIT) return 'Tombée du jour';
  return 'Nuit';
}
export const heureExacte = () => `${String(clock.heure()).padStart(2, '0')}:${String(clock.minute()).padStart(2, '0')}`;
// « 20:14 » avec une montre, « Tombée du jour » sans.
export function texteHeure(p) { return heureConnue(p) ? heureExacte() : momentVague(); }
// « Jour 3 · ven. 25 sept. » si la date est connue, « Jour 3 » sinon.
export function texteJour(p, forme = 'court') { return dateConnue(p) ? `Jour ${clock.jour()} · ${clock.dateTexte(clock.jour(), forme)}` : `Jour ${clock.jour()}`; }
// Remplace clock.texteHeure() partout où le joueur lit l'heure (sommeil, cartes de voyage).
export function texteHorloge(p) { return `${texteJour(p)} — ${texteHeure(p)}`; }
// Ce qu'on lit en regardant sa montre / son calendrier (toasts du sac et du Menu).
export function lireMontre(p) {
  const m = montrePortee(p); if (!m) return 'Tu n\'as pas de montre au poignet.';
  return m.date ? `Il est ${heureExacte()}. Nous sommes le ${clock.dateTexte(clock.jour(), 'long')}.` : `Il est ${heureExacte()}.`;
}
export function lireCalendrier() { return `Nous sommes le ${clock.dateTexte(clock.jour(), 'long')}, ton jour ${clock.jour()} depuis le réveil.`; }
