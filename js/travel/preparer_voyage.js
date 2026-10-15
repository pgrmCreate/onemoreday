// Un même calcul pour la fiche et le départ : cahier, rencontres, jumelles, puis contournement.
import { G } from '../core/state.js';
import { REGLAGES } from '../data/reglages.js';
import { surpoids } from '../game/inventory.js';
import { itineraire, allonger } from './geo.js';
import { contexteVoyage, vitesse, evaluerRisque, tirerRencontres } from './rencontres_voyage.js';

export const DETOUR_GUETTEUR = 0.25;
export function cheminsConnus(iti) {
  return G?.world.missions?.m_guetteur?.etat === 'reussie'
    && iti.troncons.some(t => t.echelle === 'region');
}
export function preparerVoyage({ de, vers, allure = 'normale', groupe = null, minutesDepart,
  guetteur = false, contourner = false } = {}) {
  const base = itineraire(de, vers);
  const disponible = cheminsConnus(base);
  guetteur = !!(guetteur && disponible);
  const ctx = contexteVoyage({ allure, groupe, minutes: minutesDepart });
  ctx.guetteur = guetteur;
  ctx.surpoids = G ? surpoids(G.player).f || 0 : 0;
  const v = vitesse(ctx);
  const detourGuetteur = guetteur ? Math.round(base.metres * DETOUR_GUETTEUR) : 0;
  let iti = detourGuetteur ? allonger(base, detourGuetteur) : base;
  let rencontres = tirerRencontres(iti, ctx, { de, vers, minutes: ctx.minutes });
  const repere = rencontres.find(r => r.hostile && !r.scripte) || null;
  const risque = evaluerRisque(iti, ctx, { de, vers, hostilesEvites: contourner && repere ? 1 : 0 });
  const detourRepere = contourner && repere ? REGLAGES.voyage.DETOUR_REPERE_M[iti.echelle] || 250 : 0;
  if (detourRepere) {
    const avant = iti.metres;
    iti = allonger(iti, detourRepere, repere.d);
    const k = (avant - repere.d + detourRepere) / Math.max(1, avant - repere.d);
    rencontres = rencontres.filter(r => r !== repere).map(r => ({ ...r,
      d: r.d > repere.d ? repere.d + (r.d - repere.d) * k : r.d }));
  }
  return { iti, ctx, v, risque, rencontres, repere, disponible, guetteur, detourGuetteur,
    detourRepere, supplementGuetteur: Math.round(base.metres * DETOUR_GUETTEUR),
    duree: iti.metres / v.mParMin,
    params: { de, vers, allure: ctx.allure, groupe, minutesDepart: ctx.minutes, guetteur,
      contourner: !!detourRepere } };
}
