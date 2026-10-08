// ============ Combat dans l'exploration — RÈGLES (headless, sans DOM, sans état) — « combat 2 » ============
// Mêlée sans raté au hasard, enchaînements (3 coups), coup chargé, coup de grâce sur un mort à terre, équilibre des morts.
// La simulation du lieu (sim.js) s'en sert pour résoudre les coups des joueurs et les attaques des morts.
// Nombres : REGLAGES.combat (docs/GAMEPLAY.md §4). Profils d'arme : js/game/stats_combat.js → statsCombat(player).arme.
import { REGLAGES } from '../data/reglages.js';

const R = () => REGLAGES.combat;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const niv = (stats, k) => (stats && stats.niveaux && stats.niveaux[k]) || 0;

export const MAINS_NUES_ID = 'mains_nues';
export function profilMainsNues() {
  const M = R().MAINS_NUES;
  return { id: MAINS_NUES_ID, nom: M.nom, dmg: M.dmg.slice(), vitesse: M.vitesse, sta: M.sta, allonge: M.allonge,
    charge: M.charge, stagger: M.stagger, crit: M.crit, skill: M.skill, bruit: M.bruit, dur: null, durMax: null };
}
// Arme effectivement utilisée pour frapper (une arme à feu en main frappe à la crosse).
export function profilMelee(arme) {
  const a = arme || profilMainsNues();
  if (!a.tir) return a;
  return { ...a, dmg: (a.crosse || [3, 6]).slice(), vitesse: Math.max(450, a.vitesse || 500), sta: Math.max(4, a.sta || 4),
    allonge: 0, charge: 1.3, stagger: 0.25, crit: 0.05, skill: 'force', crosse: true };
}
// Portée, arc et nombre de cibles d'un coup.
export function geometrie(prof) {
  const k = clamp(Math.round(prof.allonge || 0), 0, 2);
  return { portee: R().PORTEE[k], arc: R().ARC_DEG[k] * Math.PI / 180, cibles: R().CIBLES_MAX[k] };
}
export const essouffle = (sta) => sta < R().ENDURANCE.SEUIL_ESSOUFFLE;
// Durée du geste (ms) ; essoufflé : × 1,5.
export function dureeGeste(prof, ess) { return (prof.vitesse || 450) * (ess ? R().COUP.DUREE_LENTEUR_EPUISE : 1); }
export function dureeChargePleine(prof, ess) { return dureeGeste(prof, ess) * R().CHARGE.FACTEUR_DUREE; }
// Charge 0..1 à partir du temps d'appui.
export function chargeDepuisAppui(prof, ms, ess) {
  const T = R().CHARGE.TAPE_MS;
  if (ms < T || (prof.charge || 1) <= 1) return 0;
  return clamp((ms - T) / Math.max(1, dureeChargePleine(prof, ess) - T), 0, 1);
}
// Coût d'endurance d'un coup.
export function coutCoup(prof, c, stats) {
  return (prof.sta || 4) * (1 + (R().CHARGE.STA_MULT_PLEIN - 1) * c) * (1 + (REGLAGES.inventaire.SURPOIDS.sta || 0.5) * ((stats && stats.surpoids) || 0));
}

// Résout un coup de mêlée (ou un tir) d'un joueur sur un mort.
//   o = { stats, prof, def, c (charge 0..1), combo (0..2), achever, critForce, aTerre, vacille, telegraphie, furtif, ess, tir, visee,
//         accroupi (coup porté accroupi : moins fort), rnd }
// → { touche, raison?, degats, crit, vacille (le coup le fait vaciller d'office), interrompt, equilibre (entame), terre (mise à terre) }
// MÊLÉE : AUCUN raté au hasard — si le mort est dans l'arc au moment de l'impact, le coup porte (c'est la sim qui juge l'arc).
export function resoudreCoup(o) {
  const { stats = {}, prof, def, c = 0, combo = 0, achever = false, critForce = false, aTerre = false, vacille = false, telegraphie = false,
    furtif = false, ess = false, tir = false, visee = 0, accroupi = false, rnd = Math.random } = o;
  const D = R().DEGATS, CR = R().CRIT, CO = R().COUP, CB = R().COMBO, CH = R().CHARGE;
  if (tir) {
    const TI = R().TIR;
    let p = ((prof.tir && prof.tir.precision) || 0.7) * (TI.HANCHE + (1 - TI.HANCHE) * visee) + TI.PREC_PAR_NIVEAU * niv(stats, 'visee') - (def.esquive || 0);
    if (stats.noir) p += R().TOUCHER.NOIR;
    p = clamp(p, TI.CRITIQUE_MIN, R().TOUCHER.MAX);
    if (!(aTerre || vacille) && rnd() >= p) return { touche: false, raison: stats.noir ? 'noir' : 'vide', degats: 0, crit: false, vacille: false, interrompt: false, equilibre: 0, terre: false };
  }
  const k = clamp(combo | 0, 0, 2);
  let [mn, mx] = prof.dmg || [1, 2];
  if (prof.skill === 'mainsNues' && !tir) { const b = R().MAINS_NUES.PAR_NIVEAU_DEGATS * niv(stats, 'mainsNues'); mn += b; mx += b; }
  let d = (mn + Math.floor(rnd() * (mx - mn + 1))) * (1 + ((prof.charge || 1) - 1) * c);
  if (!tir) d *= CB.DEGATS[k];
  d *= 1 + D.PAR_NIVEAU * niv(stats, tir ? 'visee' : prof.skill);
  let pc = (prof.crit || 0) + CR.PAR_DEXTERITE * niv(stats, 'dexterite') + CR.CHARGE * c
    + (vacille ? CR.VACILLE : 0) + (aTerre ? R().A_TERRE.CRIT : 0) + (tir ? R().TIR.CRIT_VISEE * visee : 0);
  pc *= def.critMult ?? 1;
  const crit = achever || critForce || rnd() < pc;
  if (crit) d *= CO.CRIT_MULT;
  if (achever) d *= R().ACHEVER.MULT;
  else if (aTerre) d *= prof.skill === 'mainsNues' ? R().MAINS_NUES.A_TERRE_MULT : R().A_TERRE.DEGATS;
  if (furtif) d *= REGLAGES.exploration.FURTIF.MULT;
  if (!tir && ess) d *= R().ENDURANCE.ESSOUFFLE_DEGATS;
  if (!tir && accroupi) d *= (R().ACCROUPI || {}).DEGATS ?? 0.7;   // accroupi(e) : silencieux, mais le geste est retenu
  if ((stats.faim ?? 100) < 15) d *= D.AFFAME;
  if (prof.durMax && prof.dur != null && prof.dur / prof.durMax < D.SEUIL_USEE) d *= D.USEE;
  if (!tir) d *= stats.degatsMult ?? 1;
  if (!tir && prof.uneMain) d *= REGLAGES.inventaire.UNE_MAIN.degats;
  if (!crit && def.armure) d *= 1 - def.armure * (tir ? R().TIR.ARMURE_EFFICACE : 1);
  d = Math.max(1, Math.round(d));
  // Équilibre entamé, vacillement, interruption, mise à terre
  const res = def.resistance || 0;
  const lourd = !tir && c >= CH.SEUIL_LOURD;
  const equilibre = tir ? d * 0.8 : d * CB.EQUILIBRE[k] * (lourd ? 2 : 1 + c);
  let fait = false, interrompt = false, terre = false;
  if (tir) fait = rnd() < (prof.stagger || 0) * CO.STAGGER_RAPIDE * (1 - res);
  else {
    if (lourd) fait = res < R().VACILLER.RESISTANCE_INTERRUPTION || rnd() < 0.35;
    if (telegraphie && c >= CH.SEUIL_INTERRUPTION) { interrompt = res < R().VACILLER.RESISTANCE_INTERRUPTION || fait; if (interrompt) fait = true; }
    if (lourd && rnd() < CH.TERRE * (1 - res)) terre = true;
    if (k === 2 && rnd() < CB.TERRE * (1 - res)) terre = true;
    if (rnd() < (prof.stagger || 0) * 0.35 * (1 - res)) fait = true;   // une arme lourde secoue même en coup rapide
  }
  return { touche: true, degats: d, crit, vacille: fait, interrompt, equilibre, terre, combo: k, achever };
}
// Une attaque de mort qui porte : zone, plaie, dégâts (après protection), points de mal.
//   o = { def, type (nom du type de mort), stats (protection par zone), morsure (empoignade ratée), rnd, diff }
export function resoudreAttaque(o) {
  const { def, type, stats = {}, morsure = false, rnd = Math.random, diff = {} } = o;
  const B = R().BLESSURES, P = R().PROTECTION, S = REGLAGES.survie;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const [mn, mx] = def.dmg || [4, 8];
  const jet = morsure ? mx : mn + Math.floor(rnd() * (mx - mn + 1));
  const brut = morsure ? jet * R().EMPOIGNADE.MORSURE_DEGATS : jet;
  const haut = jet >= mn + (mx - mn) * 2 / 3, auMax = jet >= mx;
  const toutes = (def.attaques || []).filter(a => a && a.zones && a.zones.length);
  let liste = morsure ? toutes.filter(a => a.type === 'morsure' || a.type === 'morsure_animale') : toutes.filter(a => a.type !== 'morsure');
  if (!liste.length) liste = toutes;
  const att = liste.length ? pick(liste) : { type: morsure ? 'morsure' : 'coup', desc: '', zones: ['au torse'] };
  const zone = pick(att.zones);
  const typeAtt = morsure ? 'morsure' : att.type;
  let plaie;
  if (typeAtt === 'griffure') plaie = (auMax && def.blessureMax >= 3 && B.griffure.max) ? B.griffure.max : haut ? B.griffure.haut : B.griffure.defaut;
  else if (typeAtt === 'coup') plaie = def.fracture && rnd() < def.fracture ? B.coup.fracture : haut ? B.coup.haut : B.coup.defaut;
  else if (typeAtt === 'morsure_animale') plaie = haut ? B.morsure_animale.haut : B.morsure_animale.defaut;
  else plaie = B.morsure.defaut;
  const plafond = def.blessureMax || 4;
  const descente = { fracture: 'contusion', profonde: 'entaille', entaille: 'egratignure' };
  while (!morsure && plaie !== 'morsure' && S.BLESSURES[plaie] && S.BLESSURES[plaie].gravite > plafond && descente[plaie]) plaie = descente[plaie];
  const p = (stats.protection && stats.protection[zone]) || 0;
  let dentsBloquees = false;
  if (p > 0) {
    if (typeAtt === 'griffure') {
      if (p >= P.GRIFFURE_SEUIL) plaie = 'contusion';
      else if (p >= P.GRIFFURE_ALLEGE) plaie = plaie === 'profonde' ? 'entaille' : plaie === 'entaille' ? 'egratignure' : plaie;
    }
    if (plaie === 'morsure' && rnd() < P.MORSURE_BLOQUEE * p) { plaie = 'contusion'; dentsBloquees = true; }
  }
  const degats = Math.max(1, Math.round(brut * (diff.degatsMorts || 1)) - P.REDUC_PAR_POINT * p);
  const info = S.BLESSURES[plaie] || { gravite: 1, pSaigne: 0 };
  const saigne = rnd() < (info.pSaigne || 0);
  const pts = S.CONTAMINATION.POINTS[plaie] || 0;
  const mal = def.vivant ? 0 : Math.round(pts * (def.infection || 0) * (diff.contamination ?? 1) * 10) / 10;
  const blessure = { type: plaie, zone, gravite: info.gravite, saigne, souillee: !!def.souille, animale: !!def.animal, source: type };
  return { blessure, degats, mal, desc: att.desc || '', attaque: typeAtt, dentsBloquees, protection: p };
}

// Martèlements nécessaires pour se dégager d'une empoignade.
export function tapsEmpoignade(def, stats) {
  const E = R().EMPOIGNADE;
  let n = def.saisieForce || 6;
  n -= Math.floor(niv(stats, 'force') / E.FORCE_PAR_TAP);
  if (niv(stats, 'mainsNues') >= 3) n -= E.MAINS_NUES_BONUS;
  return Math.max(E.TAPS_MIN, n);
}
// Bruit (cases) d'un coup qui porte.
export const bruitCoup = (prof) => R().BRUIT_ARME[clamp(Math.round(prof.bruit || 0), 0, 3)];
