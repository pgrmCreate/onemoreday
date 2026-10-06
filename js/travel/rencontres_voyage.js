// ============ Rencontres de voyage — vitesse, jauge de risque, tirage (GAMEPLAY §3, §13) ============
// Fonctions PURES (aucun DOM) : partagées par la carte (fiche : durée, risque) et l'écran de voyage.
//   contexteVoyage({ allure, groupe, minutes })            → ctx
//   vitesse(ctx) → { mParMin, raisons }                      (REGLAGES.voyage.ALLURES × MALUS_VITESSE)
//   evaluerRisque(iti, ctx, opts) → { cran 1..5, esperance, raisons, libelle }
//   tirerRencontres(iti, ctx, { de, vers, minutes, demiTour }) → [{ d, def, hostile, scripte, point }]
//   condition(cond) → bool                                   (CONDITION, REFONTE §4.5)
import { REGLAGES, paramsJour, presetDifficulte } from '../data/reglages.js';
import { RENCONTRES } from '../data/rencontres.js';
import { RENCONTRES_HISTOIRE } from '../data/histoire/rencontres.js';
import { DECLENCHEURS } from '../data/histoire/declencheurs.js';
import { ZONES, zone } from '../data/zones.js';
import { ZOMBIES } from '../game/donnees.js';
import { G } from '../core/state.js';
import { seedRng, pickPoids } from '../core/rng.js';
import { pref } from '../core/prefs.js';
import { rueeTroncon, etatRuee } from '../game/ruees.js';

const V = () => REGLAGES.voyage;
const R = () => REGLAGES.voyage.RENCONTRES;
const avert = new Set();
function warn(k, ...a) { if (!avert.has(k)) { avert.add(k); console.warn('[voyage]', ...a); } }

// ---------------------------------------------------------------- conditions (REFONTE §4.5)
export function condition(c) {
  if (!c) return true;
  if (!G) return false;
  const W = G.world, P = G.player;
  for (const [k, v] of Object.entries(c)) {
    let ok = true;
    switch (k) {
      case 'flag': ok = !!W.flags[v]; break;
      case 'pasFlag': ok = !W.flags[v]; break;
      case 'flagEgal': ok = W.flags[v[0]] === v[1]; break;
      case 'objet': { const [id, q] = Array.isArray(v) ? v : [v, 1]; ok = (P.inventaire || []).filter(i => i.id === id).reduce((s, i) => s + (i.qty || 1), 0) >= q || Object.values(P.equip || {}).includes(id); break; }
      case 'skill': { const xp = (P.skillXp || {})[v[0]] || 0; const Pal = REGLAGES.competences?.PALIERS || [0]; let n = 0; for (let i = 1; i < Pal.length; i++) if (xp >= Pal[i]) n = i; ok = n >= v[1]; break; }
      case 'nuit': { const h = (W.minutes % 1440) / 60, H = REGLAGES.temps.HEURES; ok = (h >= H.NUIT || h < H.AUBE) === !!v; break; }
      case 'jourMin': ok = Math.floor(W.minutes / 1440) + 1 >= v; break;
      case 'lieuVisite': ok = !!(W.lieux[v] && W.lieux[v].visite); break;
      case 'quete': ok = !!(W.quetes[v[0]] && W.quetes[v[0]].etape === v[1]); break;
      case 'ou': ok = (v || []).some(condition); break;
      default: warn('cond:' + k, 'condition inconnue', k); ok = true;
    }
    if (!ok) return false;
  }
  return true;
}

// ---------------------------------------------------------------- météo (fallback si le monde ne la tient pas)
export function meteoCourante(minutes = G ? G.world.minutes : 480) {
  if (G && G.world.meteo) return typeof G.world.meteo === 'string' ? G.world.meteo : (G.world.meteo.type || 'clair');
  const M = REGLAGES.meteo; if (!M || !G) return 'clair';
  const jour = Math.floor(minutes / 1440) + 1, h = (minutes % 1440) / 60;
  const [a, b] = M.CHANGE_A;
  const demi = h >= a && h < b ? 0 : 1; const j = h < a ? jour - 1 : jour;
  const r = seedRng(G.world.seed + ':meteo:' + j + ':' + demi);
  return pickPoids(Object.keys(M.POIDS), k => M.POIDS[k], r);
}

// ---------------------------------------------------------------- contexte
export function contexteVoyage({ allure = 'normale', groupe = null, minutes } = {}) {
  const m = minutes ?? (G ? G.world.minutes : 480);
  const jour = Math.floor(m / 1440) + 1, h = (m % 1440) / 60, H = REGLAGES.temps.HEURES;
  const nuit = h >= H.NUIT || h < H.AUBE;
  const crepuscule = !nuit && (h >= H.CREPUSCULE || h < H.JOUR);
  const coop = Array.isArray(groupe) ? groupe.length > 1 : !!groupe;
  const bl = (G && G.player.blessures) || [];
  const saigne = bl.some(b => b.saigne && !b.bandee && !b.suturee);
  const meteo = meteoCourante(m);
  const diffId = (G && G.world.difficulte) || pref('difficulte');
  return {
    allure: V().ALLURES[allure] ? allure : 'normale', minutes: m, jour, heure: h, nuit, crepuscule, coop, saigne, meteo,
    E: REGLAGES.meteo?.EFFETS?.[meteo] || { rencontres: 1 }, pj: paramsJour(jour), diff: presetDifficulte(diffId),
  };
}

// ---------------------------------------------------------------- vitesse (m par minute de jeu)
const ZONE_JAMBE = /jambe|genou|cuisse|mollet|pied|cheville/i;
export function vitesse(ctx, { surpoids = 0 } = {}) {
  const A = V().ALLURES[ctx.allure], M = V().MALUS_VITESSE; const raisons = [];
  let v = A.kmh * 1000 / 60;
  if (surpoids > 0) { v *= 1 + (M.surpoids - 1) * Math.min(1, surpoids); raisons.push('trop chargé'); }
  const P = G ? G.player : null;
  if (P) {
    let pire = 0;
    for (const b of P.blessures || []) if (ZONE_JAMBE.test(b.zone || '') && !b.suturee && !b.attelle) pire = Math.max(pire, b.gravite || 0);
    if (pire >= 2) { v *= M.jambe[Math.min(4, pire)] || 1; raisons.push('tu boites'); }
    if ((P.fatigue ?? 100) < 25) { v *= M.fatigue; raisons.push('épuisé'); }
  }
  if (ctx.nuit) { v *= M.nuit; raisons.push('dans le noir'); }
  if (ctx.meteo === 'pluie') { v *= M.pluie; raisons.push('sous la pluie'); }
  return { mParMin: Math.max(10, v), raisons };
}

// ---------------------------------------------------------------- le catalogue
function catalogue() { return [...RENCONTRES, ...RENCONTRES_HISTOIRE]; }
function defRencontre(id) { return catalogue().find(r => r.id === id) || null; }
export const estHostile = (r) => !!r && (r.type === 'combat' || !!r.hostile);
const vue = (id) => !!(G && G.world.flags['rencontre_vue:' + id]);

// Danger d'un tronçon (max des zones, défaut d'échelle) + courbe des jours.
function dangerTroncon(t, ctx) {
  const d = t.danger ?? R().DANGER_DEFAUT[t.echelle] ?? 0.2;
  return Math.min(1, d + (ctx.pj.danger || 0) + rueeTroncon(t.echelle).danger);   // les sirènes : la zone qui hurle est pire
}
// λ de chaque tronçon (GAMEPLAY §3.2).
export function lambdas(iti, ctx, { demiTour = false } = {}) {
  const Rr = R(), A = V().ALLURES[ctx.allure];
  const heureF = ctx.nuit ? Rr.NUIT : ctx.crepuscule ? Rr.CREPUSCULE : 1;
  const commun = heureF * A.rencontres * (ctx.coop ? REGLAGES.coop.RENCONTRES_MULT : 1) * (ctx.pj.rencontres ?? 1)
    * (ctx.E.rencontres ?? 1) * (ctx.saigne ? Rr.SAIGNEMENT : 1) * (ctx.diff.rencontres ?? 1) * (demiTour ? Rr.DEMI_TOUR : 1);
  return iti.troncons.map(t => {
    const d = dangerTroncon(t, ctx);
    return { t, d, lambda: (Rr.PAR_KM[t.echelle] ?? 0.3) * (Rr.DANGER.base + Rr.DANGER.pente * d) * (t.metres / 1000) * commun * rueeTroncon(t.echelle).mult };
  });
}
// Rencontres éligibles en un point (tronçon t, danger d, nuit au moment du passage).
function eligibles(t, d, nuitIci, exclus) {
  if (G && G.world.flags.voyage_sans_aleatoire) return [];
  return catalogue().filter(r => (r.poids || 0) > 0
    && (!r.echelle || r.echelle === t.echelle)
    && (!r.zones || r.zones.some(z => t.zones.includes(z)))
    && (r.nuit == null || r.nuit === nuitIci)
    && (r.dangerMin || 0) <= d
    && !(r.unique && (vue(r.id) || exclus.has(r.id)))
    && condition(r.si));
}
function nuitA(ctx, minutesPlus) {
  const h = ((ctx.minutes + minutesPlus) % 1440) / 60, H = REGLAGES.temps.HEURES;
  return h >= H.NUIT || h < H.AUBE;
}

// Rencontres scénarisées : déclencheurs { quand: 'voyage', de?, vers?, a, si, rencontre, unique }.
function scenarisees(de, vers) {
  const out = [];
  for (const dcl of DECLENCHEURS || []) {
    if (dcl.quand !== 'voyage') continue;
    if (dcl.de && dcl.de !== de) continue;
    if (dcl.vers && dcl.vers !== vers) continue;
    const cle = 'voyage:' + dcl.rencontre;
    if (dcl.unique && G && G.world.declencheurs && G.world.declencheurs[cle]) continue;
    if (!condition(dcl.si)) continue;
    const def = defRencontre(dcl.rencontre);
    if (!def) { warn('dcl:' + dcl.rencontre, 'rencontre scénarisée introuvable', dcl.rencontre); continue; }
    if (def.unique && vue(def.id)) continue;
    out.push({ a: Math.max(0.02, Math.min(0.98, dcl.a ?? 0.5)), def, cle: dcl.unique ? cle : null });
  }
  return out;
}

// ---------------------------------------------------------------- jauge de risque
const LIBELLES = ['calme', 'prudence', 'risqué', 'dangereux', 'suicidaire'];
export function evaluerRisque(iti, ctx, { de, vers, demiTour = false } = {}) {
  const Ls = lambdas(iti, ctx, { demiTour });
  const rapide = V().ALLURES[ctx.allure].distance || 0;
  let E = 0, zoneMax = null;
  const v = vitesse(ctx).mParMin;
  for (const { t, d, lambda } of Ls) {
    const el = eligibles(t, d, nuitA(ctx, t.d / v), new Set());
    const tot = el.reduce((s, r) => s + r.poids, 0);
    const h = el.filter(estHostile).reduce((s, r) => s + r.poids, 0);
    if (tot > 0) E += lambda * (h / tot) * (1 - rapide);
    for (const z of t.zones) { const Z = zone(z); if (Z && Z.echelle === t.echelle && (!zoneMax || Z.danger > zoneMax.danger)) zoneMax = Z; }
  }
  E = Math.min(E, R().MAX[iti.echelle] || 3);
  if (!demiTour) for (const s of scenarisees(de, vers)) if (estHostile(s.def)) E += 1;
  const crans = V().RISQUE_CRANS; let cran = 1; for (const s of crans) if (E >= s) cran++;
  const RS = V().RAISONS_SEUILS, raisons = [];
  if (zoneMax && zoneMax.danger >= RS.zone) raisons.push(`${zoneMax.echelle === 'salon' ? 'quartier infesté' : 'secteur infesté'} : ${zoneMax.nom.replace(/^(Le |La |Les |L')/, (m) => m.toLowerCase())}`);
  { const ru = etatRuee(); if (ru && ru.active && Ls.some(({ t }) => rueeTroncon(t.echelle).mult > 1)) raisons.unshift(`les sirènes hurlent : ${ru.nom}`); }
  if (RS.nuit && ctx.nuit) raisons.push('de nuit');
  if (ctx.allure === RS.allure) raisons.push('allure rapide : on t’entend venir');
  if (RS.coop && ctx.coop) raisons.push('à deux, on se fait remarquer');
  if (RS.saigne && ctx.saigne) raisons.push('tu saignes');
  if (!raisons.length && cran <= 2) raisons.push(ctx.allure === 'discrete' ? 'tu rases les murs' : 'rien ne bouge, en apparence');
  return { cran, esperance: E, raisons: raisons.slice(0, 2), libelle: LIBELLES[cran - 1] };
}

// ---------------------------------------------------------------- tirage (au départ, sur la graine)
function poisson(l, rng) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= rng(); } while (p > L && k < 50); return k - 1; }

export function tirerRencontres(iti, ctx, { de, vers, minutes, demiTour = false } = {}) {
  if (!iti.metres || !iti.troncons.length) return [];
  const Rr = R();
  const seed = (G ? G.world.seed : 0) + ':voyage:' + de + '>' + vers + ':' + (minutes ?? ctx.minutes) + (demiTour ? ':retour' : '');
  const rng = seedRng(seed);
  const Ls = lambdas(iti, ctx, { demiTour });
  const [f0, f1] = Rr.FENETRE; const dMin = f0 * iti.metres, dMax = f1 * iti.metres;
  const esp = Rr.ESPACEMENT_M[iti.echelle] || 180;
  const tirees = [];
  // 1. Scénarisées (pas au retour d'un demi-tour).
  if (!demiTour) for (const s of scenarisees(de, vers)) tirees.push({ d: s.a * iti.metres, def: s.def, scripte: true, cleDecl: s.cle });
  // 2. Aléatoires : N ~ Poisson(Λ), plafonné ; positions pondérées par λ dans la fenêtre.
  const Lam = Ls.reduce((s, x) => s + x.lambda, 0);
  const N = Math.min(poisson(Lam, rng), Rr.MAX[iti.echelle] || 3);
  const fen = Ls.filter(x => x.t.d + x.t.metres > dMin && x.t.d < dMax);
  const totF = fen.reduce((s, x) => s + x.lambda, 0);
  const exclus = new Set(tirees.map(t => t.def.id));
  const v = vitesse(ctx).mParMin;
  for (let i = 0; i < N && totF > 0; i++) {
    let pos = null;
    for (let essai = 0; essai < 25 && pos == null; essai++) {
      let u = rng() * totF, x = fen[fen.length - 1];
      for (const y of fen) { u -= y.lambda; if (u <= 0) { x = y; break; } }
      const d = Math.max(dMin, Math.min(dMax, x.t.d + rng() * x.t.metres));
      if (tirees.every(t => Math.abs(t.d - d) >= esp)) pos = { d, x };
    }
    if (!pos) break;
    const { d, x } = pos;
    const el = eligibles(x.t, x.d, nuitA(ctx, d / v), exclus);
    if (!el.length) continue;
    let def = pickPoids(el, r => r.poids, rng);
    exclus.add(def.id);
    const hostile = estHostile(def);
    let distancee = false;
    const partRapide = V().ALLURES[ctx.allure].distance || 0;
    if (hostile && partRapide > 0 && rng() < partRapide) {
      distancee = true;
      def = { id: def.id + ':distancee', type: 'ambiance', illu: def.illu, texte: 'Des silhouettes se retournent sur ton passage, des bras se lèvent. Tu es déjà loin. Tu entends leurs pas traîner derrière toi, puis plus rien.' };
    }
    if (def.type === 'combat') def = preparerCombat(def, x, ctx, rng);
    tirees.push({ d, def, hostile: hostile && !distancee, distancee, point: { echelle: x.t.echelle, zones: x.t.zones, danger: x.d } });
  }
  for (const t of tirees) if (t.hostile == null) t.hostile = estHostile(t.def);
  return tirees.sort((a, b) => a.d - b.d);
}

// Combat : copie de la spécification + renfort co-op + brouillard (surprise).
function preparerCombat(def, x, ctx, rng) {
  const c = { ...(def.combat || { zombies: ['errant'] }) };
  c.zombies = [...(c.zombies || ['errant'])];
  if (ctx.coop && rng() < (REGLAGES.coop.COMBAT_MORT_EN_PLUS || 0)) {
    const zs = x.t.zones.map(zone).filter(z => z && z.pool).sort((a, b) => b.danger - a.danger);
    const pool = (zs[0] ? zs[0].pool : ['errant']).filter(id => !ZOMBIES[id] || (ZOMBIES[id].jourMin || 1) <= ctx.jour);
    if (pool.length) c.zombies.push(pool[Math.floor(rng() * pool.length)]);
  }
  if (c.surprise === true || (ctx.E && ctx.E.surprise)) c.surprise = 'surpris';
  else if (c.surprise === false || c.surprise == null) c.surprise = 'normal';
  return { ...def, combat: c };
}

// Libellés utiles aux vues.
export const NOMS_ALLURES = () => Object.fromEntries(Object.entries(V().ALLURES).map(([k, a]) => [k, a.nom]));
export { ZONES };
