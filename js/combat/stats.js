// ============================================================================
//  COMBAT — ce que le personnage apporte au combat, et ce que le combat lui laisse
// ============================================================================
//   statsCombat(player, { tactile, noir }) → stats   (entrée de creerCombat, participants[].stats)
//   appliquerResultat(player, resultat)               usure de l'arme, munitions, objets consommés,
//                                                     échanges d'accès rapide, endurance, compteur de morts.
// Aucune dépendance au DOM : utilisable côté hôte pour un invité (stats envoyées par l'invité).
// ============================================================================
import { REGLAGES, niveauDepuisXp } from '../data/reglages.js';
import { ITEMS, CLOTHES } from '../game/donnees.js';
import { zonesCouvertes, ZONES_JAMBE, ZONES_BRAS } from '../data/clothing.js';
import { profilMainsNues } from './sim.js';

const SKILLS = ['force', 'dexterite', 'agilite', 'mainsNues', 'visee', 'entretien'];
const SLOTS_VETEMENTS = ['tete', 'torse', 'mains', 'jambes', 'pieds', 'sac', 'ceinture', 'holster'];

const idDe = (x) => (x == null ? null : typeof x === 'string' ? x : x.id);

// Munitions disponibles (sac + poches + accès rapide) pour un id de munition.
export function compterMunitions(player, munId) {
  let n = 0;
  for (const it of [...(player.inventaire || []), ...(player.accesRapide || [])]) if (it && it.id === munId) n += it.qty ?? 1;
  return n;
}

export function profilArme(inst, player) {
  const id = idDe(inst);
  const def = id && ITEMS[id];
  if (!def || def.type !== 'arme') return profilMainsNues();
  const a = {
    id, nom: def.nom, dmg: (def.dmg || [1, 2]).slice(), vitesse: def.vitesse || 500, sta: def.sta ?? 6,
    allonge: def.allonge || 0, charge: def.charge || 1, stagger: def.stagger || 0, crit: def.crit || 0,
    skill: def.skill || 'force', bruit: def.bruit || 0, tir: def.tir || null, crosse: def.crosse || null,
    dur: (inst && typeof inst === 'object' && inst.dur != null) ? inst.dur : (def.dur ?? null), durMax: def.dur ?? null,
    balles: 0, reserve: 0,
  };
  if (a.tir) {
    a.balles = Math.min(a.tir.capacite, (inst && inst.balles) || 0);   // champ d'instance `balles` : cartouches engagées
    a.reserve = player ? compterMunitions(player, a.tir.munition) : 0;
  }
  return a;
}

// L'arme en main comme instance { id, dur, balles } : equip.arme (id) + equipEtat.arme (js/game), ou objet.
export function instanceArme(p) {
  const e = (p && p.equip) || {};
  if (!e.arme) return null;
  if (typeof e.arme === 'object') return e.arme;
  return { id: e.arme, ...((p.equipEtat && p.equipEtat.arme) || {}) };
}
function slotAccesRapide(p, x) {
  if (!x) return null;
  if (typeof x === 'object') return { ...x };
  const its = (p.inventaire || []).filter(i => i && i.id === x);
  if (!its.length) return null;
  const qty = its.reduce((n, i) => n + (i.qty ?? 1), 0);
  const inst = its.find(i => i.dur != null) || its[0];
  const d = ITEMS[x];
  const s = { id: x, qty, dur: inst.dur, balles: inst.balles || 0 };
  if (d && d.tir) s._reserve = compterMunitions(p, d.tir.munition);
  return s;
}

export function statsCombat(player, { tactile = false, noir = false } = {}) {
  const p = player || {};
  const niveaux = {};
  for (const k of SKILLS) niveaux[k] = niveauDepuisXp((p.skillXp || {})[k] || 0);
  const equip = p.equip || {};
  // Protection par zone (max des vêtements qui la couvrent) + agilité des vêtements + portage
  const protection = {};
  let agiVet = 0, portage = 0, poidsPorte = 0;
  for (const slot of SLOTS_VETEMENTS) {
    const id = idDe(equip[slot]);
    const c = id && CLOTHES[id];
    if (!c) continue;
    poidsPorte += c.poids || 0;
    agiVet += c.agilite || 0;
    portage += c.portage || 0;
    if (c.protection > 0) for (const z of zonesCouvertes(id)) protection[z] = Math.max(protection[z] || 0, c.protection);
  }
  // Surpoids (si le module inventaire ne le fournit pas déjà)
  let surpoids = p.surpoids;
  if (surpoids == null) {
    const I = REGLAGES.inventaire;
    let poids = poidsPorte;
    for (const it of [...(p.inventaire || []), ...(p.accesRapide || [])]) {
      const d = it && (ITEMS[it.id] || CLOTHES[it.id]);
      if (d) poids += (d.poids || 0) * (it.qty ?? 1) + ((it.eau && it.eau.q) || 0);
    }
    const armeDef = ITEMS[idDe(equip.arme)];
    if (armeDef) poids += armeDef.poids || 0;
    const max = I.POIDS_BASE + I.POIDS_PAR_FORCE * niveaux.force + portage;
    surpoids = Math.max(0, Math.min(1, (poids - max) / (max * (I.PLAFOND - 1))));
  }
  // Blessures : douleur, jambe blessée, bras fracturé sans attelle
  const B = (REGLAGES.survie && REGLAGES.survie.BLESSURES) || {};
  let douleur = 0, jambeBlessee = false, degatsMult = 1;
  for (const b of p.blessures || []) {
    douleur += (B[b.type] && B[b.type].douleur) || 0;
    if ((b.gravite || 0) >= 2 && ZONES_JAMBE.includes(b.zone)) jambeBlessee = true;
    if (b.type === 'fracture' && !b.attelle && ZONES_BRAS.includes(b.zone)) degatsMult = REGLAGES.survie.FRACTURE_SANS_ATTELLE.degats;
  }
  if (typeof p.douleur === 'number') douleur = p.douleur;
  const D = REGLAGES.survie.DOULEUR;
  const regenMult = douleur > D.SEUILS[1] ? 0.75 : 1;
  // Accès rapide : seuls les objets à la ceinture / holster / gilet (l'inventaire décide de ce qui y est).
  // Deux modèles tolérés : ids (js/game : p.accesRapide = ['couteau', …], objets dans le sac) ou objets { id, qty, dur }.
  const accesRapide = (p.accesRapide || []).slice(0, 4).map(x => slotAccesRapide(p, x)).filter(Boolean);
  const arme = profilArme(instanceArme(p), p);
  return {
    pv: p.pv ?? 100, pvMax: p.pvMax ?? 100, sta: p.sta ?? 100, staMax: p.staMax ?? 100,
    faim: p.faim ?? 100, fatigue: p.fatigue ?? 100, douleur, regenMult,
    niveaux, agilite: Math.max(0, niveaux.agilite + agiVet), protection, surpoids,
    jambeBlessee, degatsMult, noir: !!noir, tactile: !!tactile,
    arme, accesRapide,
  };
}

// Retire qty d'un objet de l'inventaire (puis de l'accès rapide). Renvoie le nombre retiré.
function retirer(player, id, qty) {
  let r = qty;
  for (const liste of [player.inventaire || [], player.accesRapide || []]) {
    for (let i = liste.length - 1; i >= 0 && r > 0; i--) {
      const it = liste[i];
      if (!it || it.id !== id) continue;
      const q = it.qty ?? 1, pris = Math.min(q, r);
      r -= pris;
      if (q - pris <= 0) liste.splice(i, 1); else it.qty = q - pris;
    }
  }
  return qty - r;
}
function ajouter(player, id, qty) {
  if (qty <= 0) return;
  const inv = player.inventaire || (player.inventaire = []);
  const ex = inv.find(i => i.id === id && !i.dur);
  if (ex) ex.qty = (ex.qty ?? 1) + qty; else inv.push({ id, qty });
}

// Applique au personnage ce que le combat a consommé/usé. Idempotent par résultat (marque `_applique`).
export function appliquerResultat(player, res) {
  if (!player || !res || res._applique) return;
  res._applique = true;
  // Munitions chargées dans le chargeur pendant le combat : elles quittent le sac.
  for (const [mid, n] of Object.entries(res.munitions || {})) if (mid !== 'recuperes' && n > 0) retirer(player, mid, n);
  if (res.munitions && res.munitions.recuperes) for (const [mid, n] of Object.entries(res.munitions.recuperes)) ajouter(player, mid, n);
  if (modeleIds(player)) { appliquerModeleIds(player, res); }
  // Objets lancés / soins utilisés depuis l'accès rapide
  else if (Array.isArray(res.accesRapide) && player.accesRapide) {
    // L'état final de l'accès rapide fait foi (échanges d'armes, objets consommés).
    const avant = player.accesRapide.slice(0, 4);
    const apres = res.accesRapide;
    for (let i = 0; i < avant.length; i++) {
      const a = apres[i];
      if (!a || !a.id || (a.qty != null && a.qty <= 0)) player.accesRapide[i] = null;
      else {
        const { _reserve, ...propre } = a;
        player.accesRapide[i] = propre;
      }
    }
    player.accesRapide = player.accesRapide.filter(Boolean);
  }
  // Arme en main à la fin (échanges, casse)
  const equip = player.equip || (player.equip = {});
  if (res.arme && !modeleIds(player)) {
    if (!res.arme.id) equip.arme = null;
    else {
      const inst = (equip.arme && typeof equip.arme === 'object' && equip.arme.id === res.arme.id) ? equip.arme : { id: res.arme.id };
      if (res.arme.dur != null) inst.dur = res.arme.dur;
      if (ITEMS[res.arme.id] && ITEMS[res.arme.id].tir) inst.balles = res.arme.balles || 0;
      equip.arme = inst;
    }
  }
  if (res.sta != null) player.sta = Math.max(0, Math.min(player.staMax ?? 100, res.sta));
  if (player.stats && res.tuesParMoi) player.stats.morts = (player.stats.morts || 0) + res.tuesParMoi;
}

// ---- modèle js/game : equip.arme = id, equipEtat.arme = { dur, durMax, balles }, accesRapide = [ids] ----
function modeleIds(p) { return !!p.equipEtat || typeof (p.equip || {}).arme === 'string' || (p.accesRapide || []).some(x => typeof x === 'string'); }
function prendreInstance(p, id, dur) {
  const inv = p.inventaire || [];
  let i = inv.findIndex(x => x && x.id === id && dur != null && x.dur === dur);
  if (i < 0) i = inv.findIndex(x => x && x.id === id && x.dur != null);
  if (i < 0) i = inv.findIndex(x => x && x.id === id);
  if (i < 0) return null;
  const it = inv[i];
  if ((it.qty ?? 1) > 1) { it.qty -= 1; return { ...it, qty: 1 }; }
  inv.splice(i, 1);
  return it;
}
function appliquerModeleIds(p, res) {
  p.equip = p.equip || {}; p.equipEtat = p.equipEtat || {}; p.inventaire = p.inventaire || [];
  let ar = (p.accesRapide || []).slice();
  // Objets lancés et soins : un exemplaire du sac chacun.
  for (const id of res.consommes || []) retirer(p, id, 1);
  // Échanges d'arme (dans l'ordre) et casse.
  for (const ech of res.echanges || []) {
    if (ech.casse) { if (p.equip.arme === ech.casse) { p.equip.arme = null; delete p.equipEtat.arme; } continue; }
    const pris = prendreInstance(p, ech.prend, ech.prendDur);
    const ancienne = p.equip.arme;
    if (ancienne && ancienne !== 'mains_nues') {
      const d = ITEMS[ancienne] || {};
      const inst = { id: ancienne, qty: 1 };
      const dur = ech.poseDur ?? (p.equipEtat.arme && p.equipEtat.arme.dur);
      if (dur != null) { inst.dur = dur; inst.durMax = (p.equipEtat.arme && p.equipEtat.arme.durMax) ?? d.dur ?? dur; }
      if (d.tir) inst.balles = ech.poseBalles || 0;
      p.inventaire.push(inst);
    }
    p.equip.arme = ech.prend;
    const d = ITEMS[ech.prend] || {};
    p.equipEtat.arme = { dur: (pris && pris.dur) ?? ech.prendDur ?? d.dur ?? null, durMax: (pris && pris.durMax) ?? d.dur ?? null };
    if (d.tir) p.equipEtat.arme.balles = (pris && pris.balles) || 0;
    ar = ar.map(x => (x === ech.prend ? (ancienne && ancienne !== 'mains_nues' ? ancienne : null) : x)).filter(Boolean);
  }
  // État final de l'arme en main (usure, balles engagées).
  if (res.arme) {
    if (!res.arme.id) { p.equip.arme = null; delete p.equipEtat.arme; }
    else {
      p.equip.arme = res.arme.id;
      const d = ITEMS[res.arme.id] || {};
      const e = p.equipEtat.arme || (p.equipEtat.arme = { durMax: d.dur ?? null });
      if (res.arme.dur != null) e.dur = res.arme.dur;
      if (e.durMax == null && d.dur != null) e.durMax = d.dur;
      if (d.tir) e.balles = res.arme.balles || 0;
    }
  }
  // Accès rapide : on ne garde que ce qui est encore dans le sac.
  p.accesRapide = ar.filter((id, i) => ar.indexOf(id) === i && p.inventaire.some(x => x && x.id === id));
}
