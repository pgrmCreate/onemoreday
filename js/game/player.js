// ============ Le personnage — compétences et valeurs dérivées (sans DOM) ============
// Contrat REFONTE §12.6 : niveau(skill), gagnerXp(skill, n), dérivés (vitesse, charge, bonus).
// Tous les nombres viennent de REGLAGES (competences, inventaire, survie) et des données (vêtements).
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REGLAGES, niveauDepuisXp, presetDifficulte } from '../data/reglages.js';
import { CLOTHES, ZONES_JAMBE, ZONES_BRAS } from '../data/clothing.js';
import { ITEMS } from '../data/items.js';
import { poidsPorte, chargeMax as chargeMaxInv, surpoids } from './inventory.js';
import { douleur, deficitFroid, stadeMouille, effetsCorpulence } from './survival.js';

const C = () => REGLAGES.competences;
const S = () => REGLAGES.survie;
const joueur = (p) => p || (G && G.player);

export const COMPETENCES = () => Object.keys(C().LISTE);
export function nomCompetence(s) { return (C().LISTE[s] || {}).nom || s; }

// Complète un joueur venu d'une vieille sauvegarde ou de joueurNeuf() (champs ajoutés par l'interface).
export function normaliserJoueur(p) {
  p = joueur(p); if (!p) return p;
  p.skillXp = p.skillXp || {};
  for (const [s, xp] of Object.entries(C().DEPART || {})) if (p.skillXp[s] == null) p.skillXp[s] = xp;
  p.inventaire = p.inventaire || [];
  p.equip = Object.assign({ arme: null, mainG: null, dos: null, tete: null, haut: null, torse: null, veste: null, mains: null, poignet: null, jambes: null, pieds: null, sac: null, ceinture: null, holster: null, lampe: null }, p.equip || {});
  // vieilles sauvegardes : un seul emplacement « torse » → chaque vêtement rejoint sa couche (haut, pull, veste)
  const t = p.equip.torse, ct = t && CLOTHES[t];
  if (ct && ct.slot !== 'torse') { p.equip.torse = null; if (!p.equip[ct.slot]) p.equip[ct.slot] = t; else p.inventaire.push({ id: t, qty: 1 }); }
  // poids du corps (kg) : la référence dépend du genre ; on part de son poids de forme
  if (p.poidsRef == null) p.poidsRef = (S().CORPS || {}).REF ? S().CORPS.REF[p.genre === 'f' ? 'f' : 'm'] : 72;
  if (p.poidsCorps == null) p.poidsCorps = p.poidsRef;
  if (p.estomac == null) p.estomac = 0;     // points de faim encore « dans l'estomac » (se vident en digérant)
  p.equipEtat = p.equipEtat || {};          // { arme|mainG|dos: instance (dur, durMax, balles…), lampe: { charge, allumee } }
  if (p.deuxMains == null) p.deuxMains = !!(p.equip.arme && ((ITEMS[p.equip.arme] || {}).deux_mains));
  p.accesRapide = p.accesRapide || [];      // ids d'objets du sac accrochés (ceinture, holster, gilet)
  p.blessures = p.blessures || [];
  p.recettesApprises = p.recettesApprises || [];
  p.livresLus = p.livresLus || [];
  p.maladies = p.maladies || {};            // { intoxication: {reste}, fievre: {reste}, rhume: {reste} }
  p.effets = p.effets || {};                // effets temporaires en minutes restantes
  if (p.mal == null) p.mal = 0;
  if (p.staMaxBase == null) p.staMaxBase = S().STA_MAX || 100;
  p.stats = Object.assign({ morts: 0, joursSurvecus: 0, distance: 0, fouilles: 0, tuesParType: {} }, p.stats || {});
  if (!p.stats.tuesParType) p.stats.tuesParType = {};
  return p;
}

// ---------- Compétences ----------
export function xp(skill, p) { p = joueur(p); return p ? (p.skillXp[skill] || 0) : 0; }
export function niveau(skill, p) { return niveauDepuisXp(xp(skill, p)); }
export function niveaux(p) { const o = {}; for (const s of COMPETENCES()) o[s] = niveau(s, p); return o; }
// Progression dans le niveau courant : { niveau, xp, bas, haut, frac }
export function progression(skill, p) {
  const P = C().PALIERS, x = xp(skill, p), n = niveauDepuisXp(x);
  const bas = P[n], haut = P[n + 1] ?? P[n];
  return { niveau: n, xp: x, bas, haut, frac: haut > bas ? (x - bas) / (haut - bas) : 1, max: n >= P.length - 1 };
}

// Gagne de l'XP ; émet 'xp' et, au passage d'un palier, 'niveau' {skill, niveau} + un toast.
export function gagnerXp(skill, n, p) {
  p = joueur(p); if (!p || !n || !C().LISTE[skill]) return 0;
  const avant = niveau(skill, p);
  p.skillXp[skill] = Math.max(0, (p.skillXp[skill] || 0) + n);
  const apres = niveau(skill, p);
  emit('xp', { skill, n, niveau: apres });
  if (apres > avant) {
    emit('niveau', { skill, niveau: apres });
    emit('toast', { texte: `${nomCompetence(skill)} : niveau ${apres}`, type: 'bon' });
  }
  return apres;
}
export function gagnerXps(obj, mult = 1, p) { for (const [s, n] of Object.entries(obj || {})) gagnerXp(s, n * mult, p); }

// ---------- Dérivés ----------
// Agilité effective = niveau + bonus/malus des vêtements (baskets +1, sac de randonnée −1…).
export function agiliteEffective(p) {
  p = joueur(p); let a = niveau('agilite', p);
  for (const slot of ['tete', 'haut', 'torse', 'veste', 'mains', 'jambes', 'pieds', 'sac', 'ceinture', 'holster']) {
    const c = CLOTHES[p.equip[slot]]; if (c && c.agilite) a += c.agilite;
  }
  return Math.max(0, a);
}
export function chargeMax(p) { return chargeMaxInv(joueur(p)); }

// Pire blessure non soignée d'une jambe → multiplicateur de vitesse (GAMEPLAY §3.1).
function malusJambe(p) {
  const table = { 2: 0.85, 3: 0.7, 4: 0.55 };
  let m = 1;
  for (const b of p.blessures) {
    if (!ZONES_JAMBE.includes(b.zone)) continue;
    const soignee = b.suturee || b.attelle || (b.type !== 'fracture' && b.bandee);
    if (soignee) continue;
    m = Math.min(m, table[b.gravite] || 1);
  }
  return m;
}
function fractureBrasSansAttelle(p) { return p.blessures.some(b => b.type === 'fracture' && !b.attelle && ZONES_BRAS.includes(b.zone)); }

// Tous les modificateurs dus au corps, lus par l'exploration, le voyage et le combat.
export function modificateurs(p) {
  p = normaliserJoueur(p);
  const SE = S().SEUILS, EF = S().EFFETS, D = S().DOULEUR.SEUILS, M = S().CONTAMINATION.SEUILS;
  const f = surpoids(p).f;
  const dl = douleur(p);
  const r = { vitesse: 1, vitesseVoyage: 1, toucher: 0, degats: 1, regenSta: 1, vue: 1, fuite: 0, staCout: 1, bloque: surpoids(p).bloque };
  // surpoids
  r.vitesse *= 1 - REGLAGES.inventaire.SURPOIDS.vitesse * f;
  r.staCout *= 1 + REGLAGES.inventaire.SURPOIDS.sta * f;
  r.fuite -= 0.2 * f; r.toucher -= 0.1 * f;
  // faim / soif / fatigue
  if (p.faim < SE.faim.gene) r.regenSta *= EF.REGEN_GENE;
  if ((p.effets.nausee || 0) > 0) r.regenSta *= S().REPAS.NAUSEE_REGEN;
  if (p.faim < SE.faim.grave) r.degats *= 0.85;
  if (p.soif < SE.soif.gene) r.regenSta *= EF.REGEN_GENE;
  if (p.soif < SE.soif.grave) r.vue *= 0.85;
  if (p.fatigue < SE.fatigue.grave) { r.vitesse *= EF.VITESSE_EPUISE; r.toucher -= 0.08; }
  // douleur
  if (dl > D[2]) r.toucher -= 0.10; else if (dl > D[1]) r.toucher -= 0.05; else if (dl > D[0]) r.toucher -= 0.03;
  if (dl > D[1]) r.regenSta *= 0.75;
  if ((p.effets.alcool || 0) > 0) r.toucher += S().DOULEUR.ALCOOL.toucher;
  // maladies, mal
  if (p.maladies.fievre) r.toucher += S().MALADIES.fievre.toucher;
  if (p.mal >= M.fievre_noire) r.toucher -= 0.05;
  // froid
  const d = deficitFroid(p); if (d > 0) r.regenSta *= Math.max(0, 1 - S().FROID.REGEN_PAR_POINT * d);
  // mouillé : le souffle revient moins vite ; trempé, on se traîne
  const sm = stadeMouille(p), MO = S().MOUILLE; r.regenSta *= MO.REGEN_STA[sm]; r.vitesse *= MO.VITESSE[sm]; r.vitesseVoyage *= MO.VITESSE[sm];
  // blessures
  const mj = malusJambe(p); r.vitesse *= mj; r.vitesseVoyage *= mj;
  if (mj < 1) r.fuite -= 0.2;
  if (fractureBrasSansAttelle(p)) r.degats *= S().FRACTURE_SANS_ATTELLE.degats;
  r.vitesseVoyage *= 1 - REGLAGES.inventaire.SURPOIDS.vitesse * f;
  if (p.fatigue < 25) r.vitesseVoyage *= 0.85;
  // poids du corps : trop maigre, on frappe moins fort et le souffle s'épuise ; trop lourd, on court moins longtemps
  const ec = effetsCorpulence(p);
  if (ec) { r.vitesse *= ec.vitesse; r.vitesseVoyage *= ec.vitesse; r.staCout *= ec.staCout; r.regenSta *= ec.regenSta; r.degats *= ec.degats; }
  r.toucher = Math.round(r.toucher * 1000) / 1000;
  return r;
}
// Raccourcis demandés par le contrat.
export function vitesseMarche(p) { return modificateurs(p).vitesse; }
export function bonusCompetence(skill, p) { return 0.06 * niveau(skill, p); } // +6 %/niv sur les armes de la compétence
export function poidsActuel(p) { return poidsPorte(joueur(p)); }
export function difficulte() { return presetDifficulte(G && G.world && G.world.difficulte); }
