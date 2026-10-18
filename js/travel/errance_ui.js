// ============ Marcher sans carte — partir par un côté, passer d'une rue à l'autre (DOM) ============
// partirPar(lieuId, cote, partir) : sans carte, la sortie d'un lieu par un côté de sa carte mène au voisin situé dans
// cette direction (js/travel/errance.js, departPar) ; partir() est appelé juste avant de quitter le lieu (il range la
// position). Un côté sans voisin n'a pas de route connue : on reste.
// traverser(cellule, cote) : on sort d'une cellule par un bord → la cellule suivante, le cul-de-sac ou le lieu au bout.
// Le temps compté à chaque passage est celui de la marche condensée (js/data/troncons.js, ERRANCE).
import { G, genrer } from '../core/state.js';
import { emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import * as flow from '../game/flow.js';
import { ERRANCE } from '../data/troncons.js';
import { meteoCourante } from './rencontres_voyage.js';
import { projeter, reveler, RAYONS } from './geo.js';
import { departPar, voisin, decoder, cap, repere, genreImpasse, pas, pointCellule, NOM_COTE } from './errance.js';

// Voit-on loin ? De jour, sans brume ni pluie battante.
function voitLoin() {
  const m = meteoCourante();
  return !clock.estNuit() && !['brouillard', 'pluie', 'orage'].includes(m);
}
// Le temps de marche qu'un passage représente (au-delà de la traversée réelle de la cellule).
function compterMarche(e) {
  const min = Math.max(0, Math.round(pas(e) / ERRANCE.M_PAR_MIN) - ERRANCE.MIN_MARCHE_CELLULE);
  if (min > 0) clock.sauter(min);     // à deux, l'invité demande le saut à l'hôte (comme un effet tempsMin)
}
// Ce que l'on a parcouru se dessine sur la feuille (utile le jour où l'on trouve une carte).
function memoriser(e, k) {
  try { const p = pointCellule(e, k), q = projeter(p.lat, p.lon, e.echelle); reveler(e.echelle, q.x, q.y, (RAYONS[e.echelle] || RAYONS.salon).trajet); } catch (err) {}
}
const memo = () => (G.player.errance || (G.player.errance = {}));

// ---------------------------------------------------------------- partir par un côté de la carte
export const routeConnue = (lieuId, cote) => !!departPar(lieuId, cote);
export async function partirPar(lieuId, cote, partir) {
  const d = departPar(lieuId, cote);
  if (!d) {
    emit('toast', { texte: `Sans carte, tu ne sais pas où mène la route vers ${NOM_COTE[cote]}. Mieux vaut ne pas s’y risquer.`, type: 'info' });
    return false;
  }
  partir();
  memo().retour = null;
  memo().depart = { lieu: lieuId, arete: d.e.id };
  compterMarche(d.e); memoriser(d.e, d.cellule.endsWith(':0') ? 0 : d.e.n - 1);
  await flow.explorer(d.cellule, { entree: d.entree });
  arrivee(d.cellule, d.entree);
  return true;
}

// ---------------------------------------------------------------- d'une cellule à l'autre
export async function traverser(cellule, cote) {
  const c = decoder(cellule); if (!c) return false;
  const M = memo(), v = voisin(cellule, cote, M.retour);
  if (!v) return false;
  compterMarche(c.e);
  if (v.lieu) {
    M.retour = null; M.depart = null;
    await flow.explorer(v.lieu, { venantDe: v.venantDe });
    return true;
  }
  if (v.impasse) M.retour = { cellule, cote };
  else if (decoder(v.cellule) && !decoder(v.cellule).impasse) { const d = decoder(v.cellule); memoriser(d.e, d.k); }
  await flow.explorer(v.cellule, { entree: v.entree });
  arrivee(v.cellule, v.entree);
  return true;
}

// Ce qu'on voit en arrivant dans une rue : droit devant, le repère du lieu visé (de jour, par temps clair).
export function arrivee(cellule, entree) {
  const c = decoder(cellule); if (!c) return;
  let texte = null;
  if (c.impasse) texte = genreImpasse(c.e).texte;
  else {
    const k = cap(cellule, entree), rp = k && repere(k.vers);
    if (rp && voitLoin()) texte = `Droit devant, au loin, tu reconnais ${rp}.`;
  }
  if (texte) emit('toast', { texte: genrer(texte), type: 'info' });
}
