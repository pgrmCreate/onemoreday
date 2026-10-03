// ============ L'horloge du monde ============
// 1 minute de jeu toutes les REGLAGES.temps.MS_PAR_MINUTE ms × vitesse. Émet 'minute' ({delta}).
// Solo : la vitesse dépend de ce qu'on fait (REGLAGES.temps.VITESSE_SOLO) et des pauses.
// Co-op : l'hôte fait avancer l'horloge ; l'invité reçoit l'heure (setMinutesDistantes).
import { G } from './state.js';
import { emit } from './bus.js';
import { REGLAGES } from '../data/reglages.js';

const T = () => REGLAGES.temps;
let timer = null, dernier = 0, reste = 0;
let vitesse = 1;
const pauses = new Set();
let esclave = false;         // true chez l'invité : l'hôte fait foi

export function demarrer({ invite = false } = {}) {
  esclave = invite;
  arreter();
  dernier = performance.now();
  timer = setInterval(tic, 100);
}
export function arreter() { if (timer) clearInterval(timer); timer = null; }
export function pause(raison) { pauses.add(raison); }
export function reprendre(raison) { pauses.delete(raison); }
export function enPause() { return pauses.size > 0; }
export function viderPauses() { pauses.clear(); }
export function pausesActives() { return [...pauses]; }
export function setVitesse(m) { vitesse = Math.max(0, m); }
export function getVitesse() { return vitesse; }

function tic() {
  const t = performance.now();
  const dt = t - dernier; dernier = t;
  if (!G || esclave) return;
  if (document.hidden && G.mode === 'solo') return;
  if (pauses.size && G.mode === 'solo') return;
  reste += dt * vitesse;
  const pas = T().MS_PAR_MINUTE || 1000;
  if (reste < pas) return;
  const n = Math.floor(reste / pas);
  reste -= n * pas;
  avancer(n);
}

// Fait passer n minutes d'un coup (sommeil, fabrication, attente, scène « tempsMin »).
export function avancer(n) {
  if (!G || n <= 0) return;
  const avantJour = jour();
  G.world.minutes += n;
  emit('minute', { delta: n });
  if (jour() !== avantJour) emit('jour', { jour: jour() });
}
export function setMinutesDistantes(m) {
  if (!G) return;
  const d = m - G.world.minutes;
  if (d > 0) avancer(d); else G.world.minutes = m;
}

export const minutes = () => (G ? G.world.minutes : 480);
export const jour = () => Math.floor(minutes() / 1440) + 1;
export const heure = () => Math.floor((minutes() % 1440) / 60);
export const minute = () => minutes() % 60;
export function texteHeure() { return `Jour ${jour()} — ${String(heure()).padStart(2, '0')}:${String(minute()).padStart(2, '0')}`; }
export function heureDecimale() { return (minutes() % 1440) / 60; }
export function estNuit() { const h = heureDecimale(); const H = T().HEURES; return h >= H.NUIT || h < H.AUBE; }
// 0 (nuit noire, LUNE) … 1 (plein jour), rampes à l'aube et au crépuscule.
export function lumiereJour(h = heureDecimale()) {
  const H = T().HEURES, L = T().LUNE ?? 0.12;
  if (h >= H.JOUR && h < H.CREPUSCULE) return 1;
  if (h >= H.AUBE && h < H.JOUR) return L + (1 - L) * (h - H.AUBE) / (H.JOUR - H.AUBE);
  if (h >= H.CREPUSCULE && h < H.NUIT) return 1 - (1 - L) * (h - H.CREPUSCULE) / (H.NUIT - H.CREPUSCULE);
  return L;
}
