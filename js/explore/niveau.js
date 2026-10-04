// ============ Plans d'exploration — point d'entrée unique (REFONTE §4.2) ============
// parserNiveau(def) → niveau, quel que soit le format :
//   - format « couches » (js/carte/plan.js : sol, murs, ouvertures, objets, décals, lumières) — le format à utiliser ;
//   - ancien format ASCII (plan: ['####', …] + legende) — converti en couches (js/carte/ascii.js).
// validerNiveau(def, ctx?) → [erreurs] (chaînes lisibles). Aucune dépendance au DOM : utilisable sous Node.
// Un plan mal formé ne fait jamais planter : parserNiveau collecte des avertissements (niveau.avertissements).
import { K, SOLS_IDS, SOL_IDX, OBJETS } from '../carte/catalogue.js';
import { compilerPlan, accessibilite as acces, marchable, cleCase as cle, DECOS as DEC } from '../carte/compiler.js';
import { asciiVersPlan, CARS_GLOBAUX as CARS } from '../carte/ascii.js';
import { agrandirDef } from '../carte/abords.js';

export { K };
export const MATIERES = SOLS_IDS;            // index = valeur stockée dans etage.sol
export const MAT = SOL_IDX;
export const PROPS = OBJETS;
export const CARS_GLOBAUX = CARS;
export const DECOS = DEC;
export const cleCase = cle;
export const accessibilite = acces;

export function parserNiveau(def) {
  if (!def || typeof def !== 'object') def = { etages: [] };
  if (def.format === 'couches' && def.plan) return compilerPlan(def.plan, def);
  const avert = [];
  def = agrandirDef(def);              // abords générés (×4) autour du plan d'origine
  const plan = asciiVersPlan(def, (m) => avert.push(m));
  const niv = compilerPlan(plan, def);
  niv.abords = def.abords || null;
  if (!(def.etages || []).length) avert.push('aucun étage');
  niv.avertissements.unshift(...avert);
  niv.format = 'ascii';
  return niv;
}

// ---------- Validation ----------
// ctx optionnel : { zombies: {id:…}, documents: {…}, pnj: {…}, items: {…}, scenes: {…} } pour vérifier les ids.
export function validerNiveau(def, ctx = {}) {
  const err = [];
  if (!def || typeof def !== 'object') return ['définition vide'];
  if (!def.id) err.push('id manquant');
  if (!Array.isArray(def.etages) || !def.etages.length) { err.push('aucun étage'); return err; }
  const ids = new Set();
  const couches = def.format === 'couches';
  def.etages.forEach((e, k) => {
    if (!e.id) err.push(`étage #${k} : id manquant`);
    else if (ids.has(e.id)) err.push(`étage « ${e.id} » défini deux fois`);
    ids.add(e.id);
    if (couches) return;
    if (!Array.isArray(e.plan) || !e.plan.length) { err.push(`étage « ${e.id} » : plan vide`); return; }
    const L0 = String(e.plan[0]).length;
    e.plan.forEach((l, y) => { if (String(l).length !== L0) err.push(`étage « ${e.id} » ligne ${y} : longueur ${String(l).length} au lieu de ${L0}`); });
  });
  for (const e of def.etages) {
    if (e.monte && !ids.has(e.monte)) err.push(`étage « ${e.id} » : monte vers « ${e.monte} » inconnu`);
    if (e.descend && !ids.has(e.descend)) err.push(`étage « ${e.id} » : descend vers « ${e.descend} » inconnu`);
  }
  // Références (légende ASCII ou couches)
  const verifRef = (ou, L) => {
    if (!L) return;
    if (L.zombie && ctx.zombies && !ctx.zombies[L.zombie]) err.push(`${ou} : mort inconnu « ${L.zombie} »`);
    if (L.document && ctx.documents && !ctx.documents[L.document]) err.push(`${ou} : document inconnu « ${L.document} »`);
    if (L.pnj && ctx.pnj && !ctx.pnj[L.pnj]) err.push(`${ou} : PNJ inconnu « ${L.pnj} »`);
    if (L.objet && ctx.items) { const id = Array.isArray(L.objet) ? L.objet[0] : L.objet; if (!ctx.items[id]) err.push(`${ou} : objet inconnu « ${id} »`); }
    if (L.conteneur && Array.isArray(L.conteneur.items) && ctx.items) for (const it of L.conteneur.items) if (!ctx.items[it.id]) err.push(`${ou} : objet de conteneur inconnu « ${it.id} »`);
    if (L.prop && !OBJETS[L.prop]) err.push(`${ou} : prop inconnue « ${L.prop} » (voir docs/NIVEAUX.md)`);
    if (L.etat && !['dort', 'immobile', 'erre', 'fait_le_mort', 'cogne', 'ouverte', 'fermee', 'verrouillee'].includes(L.etat)) err.push(`${ou} : état inconnu « ${L.etat} »`);
    if (L.si && typeof L.si !== 'object') err.push(`${ou} : « si » doit être un objet CONDITION`);
  };
  if (!couches) {
    for (const [c, L] of Object.entries(def.legende || {})) {
      if (c.length !== 1) err.push(`légende : clé « ${c} » doit être UN caractère`);
      verifRef(`légende '${c}'`, L);
    }
  } else if (def.plan) {
    for (const P of def.plan.etages) {
      for (const z of P.zombies) verifRef(`mort (${z.x},${z.y})`, { zombie: z.type });
      for (const q of P.pnj) verifRef(`PNJ (${q.x},${q.y})`, { pnj: q.id });
      for (const o of P.solItems) verifRef(`objet au sol (${o.x},${o.y})`, o.doc ? { document: o.doc } : { objet: o.id });
      for (const o of P.objets) if (o.conteneur) verifRef(`${o.type} (${o.x},${o.y})`, { conteneur: o.conteneur });
    }
  }
  for (const pid of def.pool || []) if (ctx.zombies && !ctx.zombies[pid]) err.push(`pool : mort inconnu « ${pid} »`);
  let niv;
  try { niv = parserNiveau(def); } catch (e) { err.push('le parseur a échoué : ' + e.message); return err; }
  for (const a of niv.avertissements) if (/inconnu|hors plan|n'est pas dans|deux fois|plusieurs fois/.test(a)) err.push(a);
  if (!Object.keys(niv.entrees).length) err.push('aucune entrée (@ ou { entree: \'nom\' })');
  if (!niv.sorties.length) err.push('aucune sortie E');
  for (const s of niv.escaliers) {
    const E = niv.etages[niv.etageIdx[s.etage]];
    const x = s.cases[0] % E.w, y = (s.cases[0] / E.w) | 0;
    if (!s.vers) err.push(`escalier ${s.sens === 'monte' ? '<' : '>'} en (${x},${y}) sur « ${s.etage} » : l'étage n'a pas de « ${s.sens} »`);
    else if (!s.cible) err.push(`escalier ${s.sens === 'monte' ? '<' : '>'} en (${x},${y}) sur « ${s.etage} » : aucun escalier ${s.sens === 'monte' ? '>' : '<'} sur « ${s.vers} » qui revienne ici`);
    else if (!s.arrivee) err.push(`escalier en (${x},${y}) sur « ${s.etage} » : pas de case libre à l'arrivée`);
  }
  for (const d of niv.declencheurs) {
    const E = niv.etages[niv.etageIdx[d.etage]];
    if (E && (d.x < 0 || d.y < 0 || d.x + (d.w || 1) > E.w || d.y + (d.h || 1) > E.h)) err.push(`déclencheur (${d.x},${d.y}) sur « ${d.etage} » : hors plan`);
    if (!d.scene && !d.cinematique && !d.marqueur) err.push(`déclencheur (${d.x},${d.y}) : ni scene, ni cinematique, ni marqueur`);
    if (d.scene && ctx.scenes && !ctx.scenes[d.scene]) err.push(`déclencheur : scène inconnue « ${d.scene} »`);
  }
  // Connexité : tout l'espace marchable relié à une entrée
  const acc = acces(niv);
  const isoles = [];
  for (const E of niv.etages) {
    const A = acc[E.id];
    for (let i = 0; i < E.w * E.h; i++) if (marchable(E, i) && !A[i]) isoles.push(`${E.id} (${i % E.w},${(i / E.w) | 0})`);
  }
  if (isoles.length) err.push(`${isoles.length} case(s) marchable(s) inaccessible(s) depuis l'entrée, ex. ${isoles.slice(0, 4).join(', ')}`);
  for (const [nom, e] of Object.entries(niv.entrees)) {
    const E = niv.etages[niv.etageIdx[e.etage]];
    if (E && E.bloque[e.y * E.w + e.x]) err.push(`entrée « ${nom} » sur une case bloquante`);
  }
  return err;
}
