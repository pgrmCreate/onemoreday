// ============ Construction — côté joueur : ce qu'il faut, payer, gagner l'expérience (sans DOM) ============
// Catalogue : js/data/construction.js. La pose et la vie des constructions : simulation du lieu (js/explore/sim.js),
// le placement à l'écran : js/explore/construction.js.
import { G } from '../core/state.js';
import { CONSTRUCTIONS, CATS_CONSTRUCTION, DEMONTABLES } from '../data/construction.js';
import { ITEMS } from '../data/items.js';
import * as inv from './inventory.js';
import { niveau as nivComp, gagnerXps, nomCompetence } from './player.js';

export { CONSTRUCTIONS, CATS_CONSTRUCTION, DEMONTABLES };
const joueur = (p) => p || (G && G.player);
const NOM_OUTIL = { abattre: 'Une hache ou une hachette', scier: 'Une scie', elaguer: 'Une lame', marteler: 'Un marteau', couper: 'Une lame', allumer: 'De quoi allumer (briquet, allumettes)', creuser: 'Une pelle', forcer: 'Un pied-de-biche', visser: 'Un tournevis' };

// etatConstruction(type, p) → { d, faisable, manques: [texte], ingredients: [{ id, nom, faut, a, ok }], outils: [{ tag, nom, ok }],
//   competences: [{ skill, nom, faut, a, ok }] }
export function etatConstruction(type, p) {
  p = joueur(p); const d = CONSTRUCTIONS[type];
  if (!d) return { d: null, faisable: false, manques: ['Inconnu'], ingredients: [], outils: [], competences: [] };
  const ingredients = (d.ingredients || []).map(x => { const a = inv.countDispo(x.id, p); /* le sac + ce qui est à portée de main */ return { id: x.id, nom: (ITEMS[x.id] || {}).nom || x.id, faut: x.qty, a, ok: a >= x.qty }; });
  const outils = (d.outils || []).map(tag => ({ tag, nom: NOM_OUTIL[tag] || tag, ok: inv.hasTagDispo(tag, p) }));
  const competences = Object.entries(d.skill || {}).map(([s, n]) => { const a = nivComp(s, p); return { skill: s, nom: nomCompetence(s), faut: n, a, ok: a >= n }; });
  const manques = [
    ...ingredients.filter(x => !x.ok).map(x => `${x.nom} : ${x.a}/${x.faut}`),
    ...outils.filter(x => !x.ok).map(x => x.nom),
    ...competences.filter(x => !x.ok).map(x => `${x.nom} ${x.faut} requis`),
  ];
  return { d, faisable: !manques.length, manques, ingredients, outils, competences };
}
// Après une pose réussie : les matériaux sont consommés, l'expérience gagnée.
export function payerConstruction(type, p) {
  p = joueur(p); const d = CONSTRUCTIONS[type]; if (!d) return false;
  for (const x of d.ingredients || []) inv.retirerDispo(x.id, x.qty, p);
  gagnerXps(d.xp || {}, 1, p);
  return true;
}
// Ce que rend un démontage (construction ou meuble) : dans le sac, le reste au sol.
export function recevoir(liste, p) { p = joueur(p); for (const x of liste || []) if (x.qty > 0) inv.addItem(x.id, x.qty, {}, p); }
// Durée réelle d'une construction (ms) : 30 min de jeu ≈ 5 s, −8 % par niveau de Construction.
export function dureeConstructionMs(type, p) {
  const d = CONSTRUCTIONS[type]; if (!d) return 3000;
  return Math.max(1500, (d.tempsMin || 20) * 170 * Math.max(0.5, 1 - 0.08 * nivComp('construction', joueur(p))));
}
export const peutDemonterMeuble = (type, p) => !!DEMONTABLES[type] && (inv.hasTag('marteler', joueur(p)) || inv.hasTag('forcer', joueur(p)));
