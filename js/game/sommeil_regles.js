// Règles du réveil, indépendantes de l'interface et du transport coop.
import { REGLAGES } from '../data/reglages.js';

export const aUneAlarme = p => p?.equip?.poignet === 'montre_digitale';
const ETATS_BRUYANTS = new Set(['erre', 'alerte', 'chasse', 'cogne', 'mange']);
export const mortAudible = z => z.hp > 0 && ETATS_BRUYANTS.has(z.etat);
export const PHRASES_REVEIL = {
  'Pleine nuit': 'Il fait encore nuit noire.', 'Avant l\'aube': 'Le jour n’est pas encore levé.',
  Aube: 'L’aube pointe.', Matinée: 'Le soleil est déjà haut.', 'Vers midi': 'Il doit être midi.',
  'Après-midi': 'Le soleil a passé midi.', 'Fin d\'après-midi': 'L’après-midi touche à sa fin.',
  'Tombée du jour': 'Le jour tombe.', Nuit: 'La nuit est tombée.',
};
export const planNaturel = () => ({ alarme: null, regleePar: null });
export function planSommeil(p) {
  return p && Number.isFinite(p.alarme) && p.alarme >= 0 && typeof p.regleePar === 'string'
    ? { alarme: Math.floor(p.alarme), regleePar: p.regleePar } : planNaturel();
}
export function premierReveil(a, b) {
  a = planSommeil(a); b = planSommeil(b);
  return a.alarme == null ? b : b.alarme == null || a.alarme <= b.alarme ? a : b;
}
export function prochaineAlarme(hhmm, maintenant) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (h > 23 || m > 59 || m % 15) return null;
  const jour = Math.floor(maintenant / 1440) * 1440;
  let t = jour + h * 60 + m;
  if (t <= maintenant) t += 1440;
  return t - maintenant < REGLAGES.survie.SOMMEIL.ALARME_MIN ? null : t;
}
export function facteurBruit(bruit = 0) {
  return Math.max(REGLAGES.survie.SOMMEIL.BRUIT.GAIN_MIN, 1 - Math.max(0, Math.min(1, bruit)) * REGLAGES.survie.SOMMEIL.BRUIT.PERTE_GAIN);
}
export function minutesRepos(p, couchage, bruit = 0) {
  const S = REGLAGES.survie.SOMMEIL, c = S.COUCHAGE[couchage] || S.COUCHAGE.sol;
  return Math.max(0, Math.ceil((c.plafond - (p.fatigue ?? 100) - 0.01) / (S.FATIGUE_PAR_MIN * c.fatigue * facteurBruit(bruit))));
}
// Seulement des sources présentes : aucun tirage d'ambiance ni bruit de propagation confondu avec le vacarme.
export function bruitSommeil({ morts = 0, alarme = false, ruee = false, meteo = 'clair', abrite = false } = {}) {
  const B = REGLAGES.survie.SOMMEIL.BRUIT, sources = [];
  let niveau = 0;
  if (morts) { niveau += Math.min(B.MORTS_MAX, morts * B.PAR_MORT); sources.push('les râles des morts proches'); }
  if (alarme) { niveau += B.ALARME; sources.push('une alarme de voiture'); }
  if (ruee) { niveau += B.RUEE; sources.push('le tumulte dans le quartier'); }
  if (B.METEO[meteo]) { niveau += B.METEO[meteo] * (abrite ? B.ABRI_METEO : 1); sources.push(meteo === 'orage' ? 'le grondement de l’orage' : 'les rafales du mistral'); }
  return { niveau: Math.min(1, niveau), sources };
}
