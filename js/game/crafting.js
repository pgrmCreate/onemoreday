// ============ Fabrication — recettes connues / apprises, disponibilité détaillée, fabriquer (sans DOM) ============
// Règles : GAMEPLAY §6 ; nombres : REGLAGES.craft ; données : js/data/recipes.js.
// Une recette est CONNUE si `connue`, ou apprise par un livre lu (recettesApprises), ou si l'un des niveaux
// de `apprise_niveau` est atteint. Rien n'est consommé avant la fin : l'interface anime la barre, puis appelle fabriquer().
import { G } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { REGLAGES } from '../data/reglages.js';
import { RECIPES, CATEGORIES_RECETTES, POSTES } from '../data/recipes.js';
import { ITEMS } from '../data/items.js';
import { niveau, gagnerXp, gagnerXps, nomCompetence, normaliserJoueur } from './player.js';
import * as inv from './inventory.js';

export { CATEGORIES_RECETTES, POSTES };
const K = () => REGLAGES.craft;
const joueur = (p) => p || (G && G.player);
const maintenant = () => (G ? G.world.minutes : 0);

// Libellés des outils (tags d'usage).
export const OUTILS = {
  cuisson: 'Récipient de cuisson', couper: 'Une lame', marteler: 'Un marteau', visser: 'Un tournevis ou une clé',
  affuter: 'Pierre à aiguiser', coudre: 'Trousse de couture', allumer: 'Briquet ou allumettes', filtrer: 'Un filtre',
  entretien_arme: 'Kit de nettoyage', ouvrir: 'Ouvre-boîte ou lame', forcer: 'Pied-de-biche',
};

// ---------- Contexte des postes (fourni par l'exploration) ----------
// etabli : à ≤ 1,5 case d'une table / d'un bureau / d'une machine ; etabliVrai : marqueur 'etabli' (temps × 0,7) ;
// feu : feu de camp allumé proche, cheminée. Le réchaud (+ gaz dans le sac) et un feu de camp posé ici comptent seuls.
const contexte = { etabli: false, etabliVrai: false, feu: false, lieu: null };
export function setContexteFabrication(patch) { Object.assign(contexte, patch || {}); emit('inventaire', { poste: true }); }
export function postesDisponibles(p) {
  p = joueur(p);
  const lieu = contexte.lieu ?? (p.position && p.position.lieu) ?? null;
  const fc = p.feuCamp;
  const feuCamp = !!(fc && fc.jusqua > maintenant() && (fc.lieu ?? null) === lieu);
  const rechaud = inv.hasItem('rechaud_camping', 1, p) && inv.hasItem('cartouche_gaz', 1, p);
  return {
    etabli: !!(contexte.etabli || contexte.etabliVrai), etabliVrai: !!contexte.etabliVrai,
    feu: !!(contexte.feu || feuCamp || rechaud), feuSource: contexte.feu ? 'feu' : feuCamp ? 'feu_camp' : rechaud ? 'rechaud' : null,
  };
}

// ---------- Connaissance ----------
export function estConnue(r, p) {
  p = joueur(p); if (!r) return false;
  if (r.connue) return true;
  if ((p.recettesApprises || []).includes(r.id)) return true;
  if (r.apprise_niveau) for (const [s, n] of Object.entries(r.apprise_niveau)) if (niveau(s, p) >= n) return true;
  return false;
}
// Comment la découvrir : { livres: [noms], niveaux: ['Médecine 1', …] }
export function commentApprendre(r) {
  return {
    livres: (r.apprise_par || []).map(id => (ITEMS[id] || {}).nom || id),
    niveaux: Object.entries(r.apprise_niveau || {}).map(([s, n]) => `${nomCompetence(s)} ${n}`),
  };
}

// ---------- Ingrédients : on compte l'eau des contenants comme de l'eau à bouillir ----------
const EAU_ING = 'eau_croupie';
function disponible(id, p) {
  let n = inv.countItem(id, p);
  if (id === EAU_ING) n += Math.floor(inv.litresEau(null, p) / REGLAGES.survie.EAU.DOSE_L + 1e-6);
  return n;
}
function consommer(id, qty, p) {
  let reste = qty - inv.removeItem(id, qty, p);
  if (id === EAU_ING) {
    p.inventaire.forEach((it, i) => { while (reste > 0 && it.eau && it.eau.L >= REGLAGES.survie.EAU.DOSE_L - 1e-6) { inv.preleverEau(i, REGLAGES.survie.EAU.DOSE_L, p); reste--; } });
  }
  return reste <= 0;
}

// ---------- État détaillé d'une recette ----------
// → { r, connue, faisable, maxQty, tempsMin, manques: [{ type, texte }], ingredients: [{ id, nom, a, faut, ok }],
//     outils: [{ tag, nom, ok, objet }], poste: { id, nom, ok }|null, competences: [{ skill, nom, faut, a, ok }], cibles? }
export function etatRecette(r, p, qty = 1) {
  p = normaliserJoueur(joueur(p)); if (typeof r === 'string') r = RECIPES.find(x => x.id === r);
  if (!r) return null;
  const connue = estConnue(r, p), postes = postesDisponibles(p);
  const ingredients = (r.ingredients || []).map(x => ({ id: x.id, nom: inv.nomObjet(x.id), a: disponible(x.id, p), faut: x.qty * qty, parUnite: x.qty }));
  ingredients.forEach(x => { x.ok = x.a >= x.faut; });
  const outils = (r.outils || []).map(tag => { const o = inv.objetsAvecTag(tag, p); return { tag, nom: OUTILS[tag] || tag, ok: o.length > 0, objet: o[0] ? inv.nomObjet(o[0]) : null }; });
  const poste = r.poste ? { id: r.poste, nom: POSTES[r.poste] || r.poste, ok: !!postes[r.poste], source: r.poste === 'feu' ? postes.feuSource : null } : null;
  const competences = Object.entries(r.skill || {}).map(([s, n]) => ({ skill: s, nom: nomCompetence(s), faut: n, a: niveau(s, p), ok: niveau(s, p) >= n }));
  const manques = [];
  for (const x of ingredients) if (!x.ok) manques.push({ type: 'ingredient', id: x.id, texte: `${x.nom} : ${x.a}/${x.faut}` });
  for (const o of outils) if (!o.ok) manques.push({ type: 'outil', tag: o.tag, texte: `Outil : ${o.nom.toLowerCase()}` });
  if (poste && !poste.ok) manques.push({ type: 'poste', id: poste.id, texte: poste.id === 'feu' ? 'Il faut un feu (feu de camp, réchaud + gaz)' : 'Il faut un établi (table, bureau, machine)' });
  for (const c of competences) if (!c.ok) manques.push({ type: 'competence', skill: c.skill, texte: `${c.nom} ${c.faut} (tu es à ${c.a})` });
  let cibles = null;
  if (r.special === 'reparer') {
    cibles = inv.cibles(r.cible || [], p).filter(c => c.durMax && c.dur < c.durMax);
    if (!cibles.length) manques.push({ type: 'cible', texte: `Rien à réparer (${(r.cible || []).map(nomFamille).join(', ')})` });
  }
  // Quantité max faisable
  let maxQty = 0;
  if (!manques.filter(m => m.type !== 'ingredient').length) {
    maxQty = r.special ? (manques.length ? 0 : 1) : Math.min(99, ...ingredients.map(x => Math.floor(x.a / x.parUnite)), r.ingredients.length ? 99 : 1);
  }
  const tempsMin = Math.max(1, Math.round((r.tempsMin || 1) * qty * (poste && poste.id === 'etabli' && postes.etabliVrai ? K().POSTES.etabli.bonusMarqueur : 1)));
  return { r, connue, faisable: connue && manques.length === 0, maxQty, tempsMin, manques, ingredients, outils, poste, competences, cibles };
}
export function nomFamille(f) { return { lame: 'lames', bois: 'manches en bois', metal: 'métal', arme_feu: 'armes à feu' }[f] || f; }

// ---------- Listes pour l'interface ----------
// → { faisables: [etat], incompletes: [etat], inconnues: [etat] } (triées), filtrées par catégorie si donnée.
export function recettesParEtat(cat, p) {
  p = joueur(p);
  const res = { faisables: [], incompletes: [], inconnues: [] };
  for (const r of RECIPES) {
    if (cat && r.cat !== cat) continue;
    const e = etatRecette(r, p);
    if (!e.connue) res.inconnues.push(e); else if (e.faisable) res.faisables.push(e); else res.incompletes.push(e);
  }
  res.incompletes.sort((a, b) => a.manques.length - b.manques.length || a.r.nom.localeCompare(b.r.nom, 'fr'));
  res.faisables.sort((a, b) => a.r.nom.localeCompare(b.r.nom, 'fr'));
  return res;
}
export function compteParCategorie(p) {
  const o = {}; for (const c of Object.keys(CATEGORIES_RECETTES)) o[c] = { faisables: 0, connues: 0, total: 0 };
  for (const r of RECIPES) { const e = etatRecette(r, p); const x = o[r.cat] || (o[r.cat] = { faisables: 0, connues: 0, total: 0 }); x.total++; if (e.connue) x.connues++; if (e.faisable) x.faisables++; }
  return o;
}
// Durée réelle de la barre (ms) pour tempsMin : tempsMin × MS_PAR_MINUTE / FABRICATION (×6 en solo).
export function dureeBarreMs(tempsMin) {
  const acc = REGLAGES.temps.FABRICATION_ACCELERE || 6;
  return Math.min(12000, tempsMin * (REGLAGES.temps.MS_PAR_MINUTE || 1000) / acc);
}

// ---------- Fabriquer ----------
// fabriquer(id, qty = 1, { cible }) — cible (réparation) : 'arme' ou index du sac.
// Consomme, fait passer le temps (solo : clock.avancer), donne l'XP. → { ok, raison?, obtenu?: {id, qty}, texte }
export function fabriquer(id, qty = 1, opts = {}, p) {
  p = normaliserJoueur(joueur(p)); const r = RECIPES.find(x => x.id === id);
  if (!r) return { ok: false, raison: 'Recette inconnue.' };
  qty = Math.max(1, Math.floor(qty)); if (r.special) qty = 1;
  const e = etatRecette(r, p, qty);
  if (!e.connue) return { ok: false, raison: 'Tu ne sais pas encore faire ça.' };
  if (e.manques.length) return { ok: false, raison: e.manques[0].texte, manques: e.manques };
  let cible = null;
  if (r.special === 'reparer') {
    const ref = opts.cible ?? (e.cibles[0] && e.cibles[0].ref);
    cible = inv.instanceDe(ref, p);
    if (!cible || !e.cibles.some(c => c.ref === ref)) return { ok: false, raison: 'Choisis quoi réparer.' };
  }
  for (const x of r.ingredients || []) if (!consommer(x.id, x.qty * qty, p)) console.warn('[craft] consommation incomplète', x.id);
  let texte = '', obtenu = null;
  if (r.resultat) {
    const d = ITEMS[r.resultat.id] || inv.def(r.resultat.id);
    const n = r.resultat.qty * qty; const inst = {};
    if (d && d.dur && d.type === 'arme') {
      const Q = K().QUALITE; const requis = Math.max(0, ...Object.values(r.skill || { x: 0 }));
      const nv = Math.max(0, ...Object.keys(r.skill || r.xp || {}).map(s => niveau(s, p)), 0);
      const q = Math.min(Q.max, Q.base + Q.parNiveau * (nv - requis)); // ×0,8 au niveau requis, ×1,2 au mieux
      inst.durMax = Math.round(d.dur * Math.max(Q.base, q)); inst.dur = inst.durMax;
    }
    if (inst.dur != null) for (let i = 0; i < n; i++) inv.addItem(r.resultat.id, 1, { ...inst }, p);
    else inv.addItem(r.resultat.id, n, {}, p);
    obtenu = { id: r.resultat.id, qty: n };
    texte = `${d ? d.nom : r.resultat.id}${n > 1 ? ' ×' + n : ''}`;
  } else if (r.special === 'reparer') {
    inv.reparerInstance(cible, r.gain || 0.3, p);
    texte = `${inv.nomObjet(cible.id)} : ${Math.round(100 * cible.dur / cible.durMax)} %`;
  } else if (r.special === 'feu_camp') {
    p.feuCamp = { lieu: contexte.lieu ?? (p.position && p.position.lieu) ?? null, jusqua: maintenant() + e.tempsMin + K().FEU_CAMP_MIN };
    emit('feu:pose', { ...p.feuCamp }); texte = 'Le feu prend.';
  } else if (r.special === 'barricade') {
    emit('barricade', {}); texte = 'La porte est barricadée.';
  }
  if (e.poste && e.poste.id === 'feu' && e.poste.source === 'rechaud') consommerGaz(e.tempsMin, p);
  gagnerXps(r.xp, qty, p);
  if (r.outils && r.outils.includes('marteler')) emit('bruit', { rayon: K().BRUIT_S.marteler, source: 'fabrication' });
  if (G && G.mode === 'solo') clock.avancer(e.tempsMin);
  emit('inventaire', { fabrique: r.id });
  emit('fabrication', { id: r.id, qty, obtenu });
  emit('toast', { texte: `Fabriqué : ${texte}`, type: 'bon' });
  return { ok: true, obtenu, texte, tempsMin: e.tempsMin };
}
function consommerGaz(min, p) {
  p.gazUtilise = (p.gazUtilise || 0) + min;
  while (p.gazUtilise >= K().GAZ_MIN_PAR_CARTOUCHE) { p.gazUtilise -= K().GAZ_MIN_PAR_CARTOUCHE; inv.removeItem('cartouche_gaz', 1, p); emit('toast', { texte: 'Cartouche de gaz vide.', type: 'alerte' }); }
}

// ---------- Livres ----------
// lire(index) : 30 min (accéléré en solo), lumière requise, XP une seule fois, apprend les recettes. → { ok, apprises: [noms] }
export function lire(index, p) {
  p = normaliserJoueur(joueur(p)); const it = p.inventaire[index]; const d = it && ITEMS[it.id];
  if (!d || d.type !== 'livre') return { ok: false, raison: 'Ce n\'est pas un livre.' };
  const lum = contexteLumiere();
  if (!lum) return { ok: false, raison: 'Trop sombre pour lire. Allume une lampe.' };
  const deja = p.livresLus.includes(it.id);
  const apprises = [];
  for (const r of RECIPES) if ((r.apprise_par || []).includes(it.id) && !p.recettesApprises.includes(r.id)) {
    const avant = estConnue(r, p); p.recettesApprises.push(r.id); if (!avant) apprises.push(r.nom);
  }
  if (!deja) { p.livresLus.push(it.id); gagnerXps(d.xp || {}, 1, p); }
  if (G && G.mode === 'solo') clock.avancer(d.lecture || K().LECTURE_MIN);
  emit('inventaire', { lu: it.id });
  emit('toast', { texte: apprises.length ? `Appris : ${apprises.join(', ')}.` : deja ? 'Tu relis sans rien apprendre de neuf.' : 'Lu. Rien de neuf à fabriquer.', type: apprises.length ? 'bon' : 'info' });
  return { ok: true, apprises, deja };
}
// La lumière : fournie par l'exploration (setLumiere(fn → bool)). Par défaut : lampe allumée, ou de jour.
let contexteLumiere = () => inv.lampeAllumee() || clock.lumiereJour() > 0.3;
export function setLumiere(fn) { if (typeof fn === 'function') contexteLumiere = fn; }

// Recettes apprises en montant de niveau : annoncées.
on('niveau', ({ skill, niveau: n }) => {
  const p = G && G.player; if (!p) return;
  const nouv = RECIPES.filter(r => !r.connue && !p.recettesApprises.includes(r.id) && r.apprise_niveau && r.apprise_niveau[skill] === n);
  if (nouv.length) emit('toast', { texte: `Nouvelle recette : ${nouv.map(r => r.nom).join(', ')}.`, type: 'bon' });
});
