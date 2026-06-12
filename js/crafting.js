// ============ Fabrication ============
import { G, skillLevel, gainSkill } from './state.js';
import { RECIPES } from './data/recipes.js';
import { item } from './data/items.js';
import { countItem, removeItem, addItem, hasOutil, hasItem, defItem, espaceUtilise, espaceMax } from './inventory.js';
import { advanceTime } from './survival.js';
import { carteCourante, caseCourante, keyCourante } from './world.js';

function outilOk(o) {
  if (o === 'feu') return hasOutil('feu');
  if (o === 'casserole') return hasItem('casserole') || hasItem('rechaud_camping');
  return hasItem(o) || (G.player.equip.arme && G.player.equip.arme.id === o);
}

export function listeRecettes() {
  return RECIPES.map(r => {
    const manque = [];
    for (const ing of r.ingredients) {
      const n = countItem(ing.id);
      if (n < ing.qty) manque.push(`${defItem(ing.id)?.nom || ing.id} (${n}/${ing.qty})`);
    }
    for (const o of r.outils) {
      if (!outilOk(o)) manque.push(o === 'feu' ? 'une source de feu' : defItem(o)?.nom || o);
    }
    let skillKo = null;
    if (r.skill && skillLevel(r.skill.id) < r.skill.niveau) {
      skillKo = r.skill;
    }
    return { r, manque, skillKo, possible: manque.length === 0 && !skillKo };
  });
}

// Retourne { ok, messages, niveauxGagnes }
export function fabriquer(recetteId) {
  const entry = listeRecettes().find(x => x.r.id === recetteId);
  if (!entry || !entry.possible) return { ok: false, messages: [{ t: 'Il te manque de quoi fabriquer ça.', c: 'warn' }] };
  const r = entry.r;
  const msgs = [];

  // Barricade : action spéciale sur la pièce où l'on se trouve
  if (r.special === 'barricade') {
    const C = carteCourante();
    const cd = caseCourante();
    if (!C || C.echelle !== 'interieur' || !cd) {
      return { ok: false, messages: [{ t: 'On ne barricade pas une rue. Trouve une pièce, à l\'intérieur.', c: 'warn' }] };
    }
    const cle = keyCourante();
    if (G.world.barricades[cle]) return { ok: false, messages: [{ t: 'Cette pièce est déjà barricadée.', c: 'warn' }] };
    for (const ing of r.ingredients) removeItem(ing.id, ing.qty);
    G.world.barricades[cle] = true;
    msgs.push({ t: `Tu cloues des planches en travers des accès de « ${cd.nom || 'la pièce'} ». Le bruit te fait grincer des dents, mais le résultat est solide. Tu peux dormir ici.`, c: 'good' });
  } else {
    // Espace NET : les ingrédients consommés libèrent de la place (ex. faire bouillir l'eau, 1 pour 1)
    const espaceLibere = r.ingredients.reduce((s, ing) => s + ((defItem(ing.id)?.espace) || 0) * ing.qty, 0);
    const espaceResultat = ((defItem(r.resultat.id)?.espace) || 0) * r.resultat.qty;
    if (espaceUtilise() - espaceLibere + espaceResultat > espaceMax()) {
      return { ok: false, messages: [{ t: 'Pas assez de place dans ton inventaire pour le résultat.', c: 'warn' }] };
    }
    for (const ing of r.ingredients) removeItem(ing.id, ing.qty);
    addItem(r.resultat.id, r.resultat.qty);
    msgs.push({ t: `Fabriqué : ${defItem(r.resultat.id).nom}.`, c: 'good' });
  }

  const niveaux = [];
  for (const [sk, xp] of Object.entries(r.xp || {})) {
    const lvlUp = gainSkill(sk, xp);
    if (lvlUp) niveaux.push(lvlUp);
  }
  const time = advanceTime(r.tempsMin);
  msgs.push(...time.messages);
  return { ok: true, messages: msgs, niveaux, mort: time.mort };
}
