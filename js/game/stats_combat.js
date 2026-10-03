// ============================================================================
//  CE QUE LE PERSONNAGE APPORTE AU COMBAT (sans DOM)
// ============================================================================
//   statsCombat(player, { tactile, noir }) → stats
// Envoyé à la simulation du lieu (canal.majJoueur({ stats })) : c'est elle qui résout coups et attaques,
// y compris chez l'hôte pour l'invité en co-op. L'arme est celle de la MAIN DROITE (ou de la gauche si la droite
// est vide) ; une arme à deux mains tenue d'une seule main frappe moins fort et plus lentement.
import { REGLAGES, niveauDepuisXp } from '../data/reglages.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES, zonesCouvertes, ZONES_JAMBE, ZONES_BRAS } from '../data/clothing.js';
import { profilMainsNues } from '../explore/combat.js';

const SKILLS = ['force', 'dexterite', 'agilite', 'mainsNues', 'visee', 'entretien'];
const SLOTS_VETEMENTS = ['tete', 'torse', 'mains', 'jambes', 'pieds', 'sac', 'ceinture', 'holster'];

// Munitions disponibles (sac) pour un id de munition.
export function compterMunitions(player, munId) {
  let n = 0;
  for (const it of player.inventaire || []) if (it && it.id === munId) n += it.qty ?? 1;
  return n;
}

// Profil d'une arme (ou d'un objet tenu qui peut servir d'arme : `melee`).
export function profilArme(id, etat, player, { uneMain = false } = {}) {
  const def = id && ITEMS[id];
  const base = def && (def.type === 'arme' ? def : def.melee ? { ...def.melee, nom: def.nom } : null);
  if (!base) return profilMainsNues();
  const U = REGLAGES.inventaire.UNE_MAIN;
  const a = {
    id, nom: def.nom, dmg: (base.dmg || [1, 2]).slice(), vitesse: base.vitesse || 500, sta: base.sta ?? 6,
    allonge: base.allonge || 0, charge: base.charge || 1, stagger: base.stagger || 0, crit: base.crit || 0,
    skill: base.skill || 'force', bruit: base.bruit || 0, tir: def.tir || null, crosse: def.crosse || null,
    dur: etat && etat.dur != null ? etat.dur : (def.dur ?? null), durMax: (etat && etat.durMax) ?? def.dur ?? null,
    balles: 0, reserve: 0, uneMain: false, improvise: def.type !== 'arme',
  };
  if (uneMain) { a.uneMain = true; a.vitesse = Math.round(a.vitesse * U.vitesse); a.sta = Math.round(a.sta * U.sta * 10) / 10; a.charge = 1; }
  if (a.tir) {
    a.balles = Math.min(a.tir.capacite, (etat && etat.balles) || 0);
    a.reserve = player ? compterMunitions(player, a.tir.munition) : 0;
  }
  return a;
}
// L'objet qui frappe : main droite, sinon main gauche ; → { id, slot, etat, uneMain }
export function objetQuiFrappe(p) {
  const e = (p && p.equip) || {}, et = (p && p.equipEtat) || {};
  const sert = (id) => { const d = id && ITEMS[id]; return !!(d && (d.type === 'arme' || d.melee)); };
  if (e.arme && sert(e.arme)) return { id: e.arme, slot: 'arme', etat: et.arme, uneMain: !!(ITEMS[e.arme].deux_mains && !p.deuxMains) };
  if (e.mainG && sert(e.mainG)) return { id: e.mainG, slot: 'mainG', etat: et.mainG, uneMain: !!ITEMS[e.mainG].deux_mains };
  return { id: null, slot: null, etat: null, uneMain: false };
}

export function statsCombat(player, { tactile = false, noir = false } = {}) {
  const p = player || {};
  const niveaux = {};
  for (const k of SKILLS) niveaux[k] = niveauDepuisXp((p.skillXp || {})[k] || 0);
  const equip = p.equip || {};
  // Protection par zone (max des vêtements qui la couvrent) + agilité des vêtements
  const protection = {};
  let agiVet = 0;
  for (const slot of SLOTS_VETEMENTS) {
    const id = equip[slot];
    const c = id && CLOTHES[id];
    if (!c) continue;
    agiVet += c.agilite || 0;
    if (c.protection > 0) for (const z of zonesCouvertes(id)) protection[z] = Math.max(protection[z] || 0, c.protection);
  }
  // Blessures : douleur, bras fracturé sans attelle
  const B = (REGLAGES.survie && REGLAGES.survie.BLESSURES) || {};
  let douleur = 0, jambeBlessee = false, degatsMult = 1;
  for (const b of p.blessures || []) {
    douleur += (B[b.type] && B[b.type].douleur) || 0;
    if ((b.gravite || 0) >= 2 && ZONES_JAMBE.includes(b.zone)) jambeBlessee = true;
    if (b.type === 'fracture' && !b.attelle && ZONES_BRAS.includes(b.zone)) degatsMult = REGLAGES.survie.FRACTURE_SANS_ATTELLE.degats;
  }
  if (typeof p.douleur === 'number') douleur = p.douleur;
  const o = objetQuiFrappe(p);
  const arme = profilArme(o.id, o.etat, p, { uneMain: o.uneMain });
  return {
    pv: p.pv ?? 100, pvMax: p.pvMax ?? 100, sta: p.sta ?? 100, staMax: p.staMax ?? 100,
    faim: p.faim ?? 100, fatigue: p.fatigue ?? 100, douleur,
    niveaux, agilite: Math.max(0, niveaux.agilite + agiVet), protection, surpoids: p._surpoids || 0,
    jambeBlessee, degatsMult, noir: !!noir, tactile: !!tactile,
    arme, armeSlot: o.slot,
  };
}
