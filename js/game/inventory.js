// ============ Inventaire — poids, encombrement, équipement, accès rapide, lampes, eau, usure (sans DOM) ============
// Règles : GAMEPLAY §8 (poids + encombrement), §2.5 (lumière et piles), §6.1 (réparation), REGLAGES.inventaire.
// Forme : G.player.inventaire = [{ id, qty, dur?, durMax?, eau?: { q: 'propre'|'croupie', L } }]
//         G.player.equip = { arme, tete, torse, mains, jambes, pieds, sac, ceinture, holster, lampe } (ids)
//         G.player.equipEtat = { arme: { dur, durMax }, lampe: { charge (min), allumee } }
//         G.player.accesRapide = [ids] — objets du sac accrochés à la ceinture / au holster / au gilet.
// Tout changement émet bus 'inventaire'.
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES, SLOTS } from '../data/clothing.js';
import { OBJETS_QUETE } from '../data/histoire/objets_quete.js';
import { niveau } from './player.js';

const I = () => REGLAGES.inventaire;
const joueur = (p) => p || (G && G.player);
export const SLOTS_VETEMENT = ['tete', 'torse', 'mains', 'jambes', 'pieds', 'sac', 'ceinture', 'holster'];
export const NOMS_SLOTS = { ...SLOTS, arme: 'En main', lampe: 'Lampe' };

// ---------- Définitions ----------
export function def(id) { return ITEMS[id] || OBJETS_QUETE[id] || CLOTHES[id] || null; }
export function nomObjet(id) { const d = def(id); return d ? d.nom : id; }
export const estVetement = (id) => !!CLOTHES[id];
export const estArme = (id) => { const d = def(id); return !!(d && d.type === 'arme'); };
export const estLampe = (id) => !!REGLAGES.lumiere.SOURCES[id] && !!ITEMS[id] && (ITEMS[id].usage || []).includes('lumiere');
const aEtat = (it) => it.dur != null || it.eau != null || it.charge != null;

// Catégorie d'affichage d'un objet (onglet Sac).
export const CATEGORIES_OBJETS = [
  ['arme', 'Armes'], ['munition', 'Munitions et projectiles'], ['nourriture', 'Nourriture'], ['boisson', 'Boissons et eau'],
  ['soin', 'Soins'], ['outil', 'Outils et lumière'], ['vetement', 'Vêtements et sacs'], ['materiau', 'Matériaux'],
  ['livre', 'Livres'], ['quete', 'Objets importants'], ['divers', 'Divers'],
];
export function categorie(id) {
  const d = def(id); if (!d) return 'divers';
  if (CLOTHES[id]) return 'vetement';
  if (d.type === 'arme') return 'arme';
  if (d.type === 'munition' || d.type === 'jet') return 'munition';
  if (d.type === 'recipient') return 'boisson';
  if (d.type === 'quete' || d.type === 'lore') return 'quete';
  return ['nourriture', 'boisson', 'soin', 'outil', 'materiau', 'livre'].includes(d.type) ? d.type : 'divers';
}

// ---------- Sol (callback) ----------
// L'exploration branche son « sol » (objets au sol du lieu). Par défaut : une pile locale (banc d'essai).
let solLocal = [];
let sol = {
  lister: () => solLocal,
  deposer: (item) => { const s = solLocal.find(x => x.id === item.id && !aEtat(x) && !aEtat(item)); if (s) s.qty += item.qty; else solLocal.push({ ...item }); },
  prendre: (i) => solLocal.splice(i, 1)[0] || null,
};
// provider : { lister() → [items], deposer(item), prendre(index) → item|null }
export function setSol(provider) { sol = provider || sol; emit('inventaire', { sol: true }); }
export function objetsAuSol() { try { return sol.lister() || []; } catch (e) { return []; } }

// ---------- Poids et encombrement ----------
function poidsItem(it) { const d = def(it.id); return ((d && d.poids) || 0) * (it.qty || 1) + (it.eau ? it.eau.L : 0); }
export function poidsPorte(p) {
  p = joueur(p); let kg = 0;
  for (const it of p.inventaire) kg += poidsItem(it);
  for (const [slot, id] of Object.entries(p.equip || {})) if (id) { const d = def(id); kg += (d && d.poids) || 0; }
  return Math.round(kg * 100) / 100;
}
export function chargeMax(p) {
  p = joueur(p); let m = I().POIDS_BASE + I().POIDS_PAR_FORCE * niveau('force', p);
  for (const s of SLOTS_VETEMENT) { const c = CLOTHES[p.equip[s]]; if (c && c.portage) m += c.portage; }
  return m;
}
// f = 0..1 entre le max et le plafond (1,5 × max) ; bloque = au-delà du plafond.
export function surpoids(p) {
  p = joueur(p); const kg = poidsPorte(p), max = chargeMax(p), plafond = max * I().PLAFOND;
  const f = kg <= max ? 0 : Math.min(1, (kg - max) / (plafond - max));
  return { kg, max, plafond, f, bloque: kg > plafond };
}
export function espaceMax(p) {
  p = joueur(p); let e = I().POCHES;
  for (const s of SLOTS_VETEMENT) { const c = CLOTHES[p.equip[s]]; if (c && c.espace) e += c.espace; }
  return e;
}
// Encombrement d'UN exemplaire. Pour un vêtement, `espace` désigne la place qu'il OFFRE une fois porté :
// plié dans le sac, il occupe 1 emplacement (2 s'il est lourd ≥ 2 kg ou si c'est un grand sac).
export function espaceDe(id) {
  const c = CLOTHES[id]; if (c) return (c.poids >= 2 || (c.slot === 'sac' && (c.espace || 0) >= 6)) ? 2 : 1;
  const d = def(id); return (d && d.espace) || 0;
}
function espaceItem(it) { return espaceDe(it.id) * (it.qty || 1); }
export function espaceUtilise(p) {
  p = joueur(p); let e = 0;
  for (const it of p.inventaire) if (!p.accesRapide.includes(it.id)) e += espaceItem(it);
  return e;
}
export function bilan(p) {
  p = joueur(p); const sp = surpoids(p);
  return { ...sp, espace: espaceUtilise(p), espaceMax: espaceMax(p) };
}

// ---------- Ajout / retrait ----------
// addItem(id, qty, inst) : range dans le sac ; ce qui ne tient pas (encombrement) est posé au sol.
// → { ajoute, auSol }
export function addItem(id, qty = 1, inst = {}, p) {
  p = joueur(p); const d = def(id);
  if (!d) { console.warn('[inventaire] objet inconnu', id); return { ajoute: 0, auSol: 0 }; }
  if (qty <= 0) return { ajoute: 0, auSol: 0 };
  const place = Math.max(0, espaceMax(p) - espaceUtilise(p));
  const e = espaceDe(id);
  const tient = e === 0 ? qty : Math.min(qty, Math.floor(place / e));
  const avecEtat = aEtat(inst) || (d.dur && d.type === 'arme');
  let ajoute = 0;
  for (let i = 0; i < tient; i++) {
    if (avecEtat) {
      const it = { id, qty: 1, ...inst };
      if (d.dur && it.dur == null) { it.dur = d.dur; it.durMax = d.dur; }
      p.inventaire.push(it);
    } else {
      const pile = p.inventaire.find(x => x.id === id && !aEtat(x));
      if (pile) pile.qty += 1; else p.inventaire.push({ id, qty: 1 });
    }
    ajoute++;
  }
  const reste = qty - ajoute;
  if (reste > 0) {
    const item = { id, qty: reste, ...inst };
    if (d.dur && item.dur == null && d.type === 'arme') { item.dur = d.dur; item.durMax = d.dur; }
    try { sol.deposer(item); } catch (e2) { console.warn('[inventaire] dépôt au sol impossible', e2); }
    emit('toast', { texte: `Plus de place : ${d.nom}${reste > 1 ? ' ×' + reste : ''} posé au sol.`, type: 'alerte' });
  }
  emit('inventaire', { ajout: id, qty: ajoute });
  return { ajoute, auSol: reste };
}
// Retire qty exemplaires (piles d'abord, puis instances les plus usées). → nombre retiré.
export function removeItem(id, qty = 1, p) {
  p = joueur(p); let n = 0;
  const cand = p.inventaire.map((it, i) => ({ it, i })).filter(x => x.it.id === id)
    .sort((a, b) => (aEtat(a.it) - aEtat(b.it)) || ((a.it.dur ?? 1e9) - (b.it.dur ?? 1e9)));
  for (const { it } of cand) {
    while (n < qty && it.qty > 0) { it.qty--; n++; }
    if (n >= qty) break;
  }
  p.inventaire = p.inventaire.filter(it => it.qty > 0);
  nettoyerAccesRapide(p);
  if (n) emit('inventaire', { retrait: id, qty: n });
  return n;
}
export function removeIndex(index, qty = 1, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return null;
  const n = Math.min(qty, it.qty); it.qty -= n;
  const sorti = { ...it, qty: n };
  if (it.qty <= 0) p.inventaire.splice(index, 1);
  nettoyerAccesRapide(p);
  emit('inventaire', { retrait: it.id, qty: n });
  return sorti;
}
export function countItem(id, p) { p = joueur(p); return p.inventaire.reduce((s, it) => s + (it.id === id ? it.qty : 0), 0); }
export function hasItem(id, qty = 1, p) { return countItem(id, p) >= qty; }
// Tout ce que le joueur a sur lui qui porte un tag d'usage (sac + arme en main + lampe).
export function objetsAvecTag(tag, p) {
  p = joueur(p); const r = [];
  for (const it of p.inventaire) { const d = def(it.id); if (d && (d.usage || []).includes(tag)) r.push(it.id); }
  for (const s of ['arme', 'lampe']) { const id = p.equip[s]; const d = id && def(id); if (d && (d.usage || []).includes(tag)) r.push(id); }
  return [...new Set(r)];
}
export const hasTag = (tag, p) => objetsAvecTag(tag, p).length > 0;

// Poser au sol (index du sac).
export function poser(index, qty, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return false;
  const sorti = removeIndex(index, qty ?? it.qty, p);
  if (sorti) sol.deposer(sorti);
  emit('inventaire', { sol: true });
  return true;
}
// Ramasser depuis le sol (index de la liste du sol). → { ajoute, auSol }
export function ramasser(indexSol, p) {
  p = joueur(p); const item = sol.prendre(indexSol); if (!item) return { ajoute: 0, auSol: 0 };
  const { id, qty, ...inst } = item;
  return addItem(id, qty || 1, inst, p);
}

// ---------- Équipement ----------
export function slotDe(id) {
  if (CLOTHES[id]) return CLOTHES[id].slot;
  if (estArme(id)) return 'arme';
  if (estLampe(id)) return 'lampe';
  return null;
}
// Équiper l'objet d'index `index` du sac (vêtement → son emplacement, arme → en main, lampe → lampe).
export function equiper(index, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return { ok: false, raison: 'Objet introuvable.' };
  const slot = slotDe(it.id); if (!slot) return { ok: false, raison: 'Ça ne se porte pas.' };
  const d = def(it.id);
  if (slot === 'arme' && d.deux_mains && p.equip.lampe === 'lampe_torche') {
    emit('toast', { texte: 'Arme à deux mains : la lampe torche retourne au sac.', type: 'info' });
    desequiper('lampe', p);
  }
  if (slot === 'lampe' && REGLAGES.lumiere.SOURCES[it.id].mains && p.equip.arme && (def(p.equip.arme) || {}).deux_mains)
    return { ok: false, raison: 'Tes deux mains tiennent déjà l\'arme. Prends une frontale.' };
  const sorti = removeIndex(index, 1, p);
  if (p.equip[slot]) desequiper(slot, p, true);
  p.equip[slot] = it.id;
  if (slot === 'arme') p.equipEtat.arme = { dur: sorti.dur ?? d.dur ?? null, durMax: sorti.durMax ?? d.dur ?? null };
  if (slot === 'lampe') p.equipEtat.lampe = { charge: sorti.charge ?? 0, allumee: false };
  nettoyerAccesRapide(p);
  emit('inventaire', { equip: slot });
  return { ok: true, slot };
}
// Retirer (vers le sac ; ce qui ne tient pas va au sol).
export function desequiper(slot, p, silencieux = false) {
  p = joueur(p); const id = p.equip[slot]; if (!id) return false;
  const etat = p.equipEtat[slot] || {};
  p.equip[slot] = null; delete p.equipEtat[slot];
  const inst = {};
  if (slot === 'arme' && etat.dur != null) { inst.dur = etat.dur; inst.durMax = etat.durMax; }
  if (slot === 'lampe') inst.charge = etat.charge || 0;
  addItem(id, 1, inst, p);
  nettoyerAccesRapide(p);
  if (!silencieux) emit('inventaire', { desequip: slot });
  return true;
}
export function chaleurVetements(p) {
  p = joueur(p); let c = 0; for (const s of SLOTS_VETEMENT) { const v = CLOTHES[p.equip[s]]; if (v) c += v.chaleur || 0; } return c;
}
export function impermeable(p) { p = joueur(p); return SLOTS_VETEMENT.some(s => CLOTHES[p.equip[s]] && CLOTHES[p.equip[s]].impermeable); }
export function protectionZone(zone, p) {
  p = joueur(p); let pr = 0;
  for (const s of SLOTS_VETEMENT) {
    const id = p.equip[s], c = CLOTHES[id]; if (!c || !c.protection) continue;
    const couvre = c.couvre || { tete: ['à la tête'], torse: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'], mains: ['à la main'], jambes: ['à la cuisse', 'au genou', 'au mollet'], pieds: ['au pied', 'à la cheville'] }[c.slot] || [];
    if (couvre.includes(zone)) pr = Math.max(pr, c.protection);
  }
  return pr;
}

// ---------- Accès rapide ----------
export function accesRapideMax(p) {
  p = joueur(p); let n = 0;
  for (const s of ['ceinture', 'holster', 'torse', 'sac']) { const c = CLOTHES[p.equip[s]]; if (c && c.accesRapide) n += c.accesRapide; }
  return Math.min(n, I().ACCES_RAPIDE_MAX);
}
function nettoyerAccesRapide(p) {
  p.accesRapide = p.accesRapide.filter(id => p.inventaire.some(it => it.id === id));
  const max = accesRapideMax(p);
  if (p.accesRapide.length > max) p.accesRapide.length = max;
}
export function estAccesRapide(id, p) { return joueur(p).accesRapide.includes(id); }
export function mettreAccesRapide(id, p) {
  p = joueur(p);
  if (!p.inventaire.some(it => it.id === id)) return { ok: false, raison: 'Tu ne l\'as pas sur toi.' };
  if (p.accesRapide.includes(id)) return { ok: true };
  const max = accesRapideMax(p);
  if (max === 0) return { ok: false, raison: 'Sans ceinture ni holster, rien ne s\'accroche.' };
  if (p.accesRapide.length >= max) return { ok: false, raison: `Accès rapide plein (${max}).` };
  p.accesRapide.push(id); emit('inventaire', { accesRapide: true }); return { ok: true };
}
export function retirerAccesRapide(id, p) {
  p = joueur(p); const n = p.accesRapide.length; p.accesRapide = p.accesRapide.filter(x => x !== id);
  if (n !== p.accesRapide.length) emit('inventaire', { accesRapide: true });
  return true;
}

// ---------- Usure et réparation ----------
// Usure de l'arme en main (coups qui portent). Entretien : 10 %/niv de ne rien user. → { dur, durMax, casse }
export function userArme(n = 1, p) {
  p = joueur(p); const id = p.equip.arme; const e = p.equipEtat.arme;
  if (!id || !e || e.dur == null) return null;
  const evite = REGLAGES.competences.EFFETS.entretien.usure * niveau('entretien', p);
  let perte = 0; for (let i = 0; i < n; i++) if (Math.random() >= evite) perte++;
  e.dur = Math.max(0, e.dur - perte);
  if (e.dur <= 0) {
    emit('toast', { texte: `${nomObjet(id)} : cassé${def(id).nom.endsWith('e') ? 'e' : ''}.`, type: 'mauvais' });
    p.equip.arme = null; delete p.equipEtat.arme;
    emit('inventaire', { casse: id }); return { dur: 0, durMax: e.durMax, casse: true };
  }
  emit('inventaire', { usure: id });
  return { dur: e.dur, durMax: e.durMax, casse: false };
}
export function etatUsure(it) { if (!it || it.dur == null || !it.durMax) return null; return it.dur / it.durMax; }
// Réparer une instance (objet du sac ou arme en main). gain = fraction de la durabilité max de base.
export function reparerInstance(inst, gain, p) {
  const d = def(inst.id); const base = d.dur || inst.durMax || 1;
  const R = REGLAGES.craft.REPARATION;
  const bonus = 1 + REGLAGES.competences.EFFETS.entretien.reparation * niveau('entretien', joueur(p));
  inst.durMax = Math.max(Math.round(base * R.plancher), Math.round((inst.durMax || base) - base * R.plafond));
  inst.dur = Math.min(inst.durMax, Math.round((inst.dur || 0) + base * gain * bonus));
  emit('inventaire', { reparation: inst.id });
  return inst;
}
// Les objets réparables par une famille (items.reparation) : [{ ref: 'arme'|index, id, dur, durMax }]
export function cibles(familles, p) {
  p = joueur(p); const r = [];
  const a = p.equip.arme;
  if (a && familles.includes(def(a).reparation) && p.equipEtat.arme) r.push({ ref: 'arme', id: a, ...p.equipEtat.arme });
  p.inventaire.forEach((it, i) => { const d = def(it.id); if (d && familles.includes(d.reparation) && it.dur != null) r.push({ ref: i, id: it.id, dur: it.dur, durMax: it.durMax }); });
  return r;
}
// L'instance modifiable désignée par ref ('arme' = arme en main, sinon index du sac).
export function instanceDe(ref, p) {
  p = joueur(p);
  if (ref === 'arme') { if (!p.equip.arme || !p.equipEtat.arme) return null; p.equipEtat.arme.id = p.equip.arme; return p.equipEtat.arme; }
  return p.inventaire[ref] || null;
}

// ---------- Lampes et piles ----------
export function lampe(p) {
  p = joueur(p); const id = p.equip.lampe; if (!id) return null;
  const src = REGLAGES.lumiere.SOURCES[id]; const e = p.equipEtat.lampe || (p.equipEtat.lampe = { charge: 0, allumee: false });
  return { id, nom: nomObjet(id), ...src, charge: e.charge || 0, allumee: !!e.allumee, frac: src.minParCharge ? Math.min(1, (e.charge || 0) / src.minParCharge) : 0 };
}
export function lampeAllumee(p) { const l = lampe(p); return !!(l && l.allumee && l.charge > 0); }
export function allumerLampe(on, p) {
  p = joueur(p); const l = lampe(p); if (!l) return { ok: false, raison: 'Aucune lampe équipée.' };
  if (on && l.charge <= 0) {
    const r = rechargerLampe(p); if (!r.ok) return { ok: false, raison: r.raison };
  }
  p.equipEtat.lampe.allumee = on == null ? !l.allumee : !!on;
  emit('inventaire', { lampe: p.equipEtat.lampe.allumee });
  return { ok: true, allumee: p.equipEtat.lampe.allumee };
}
// Remettre des piles / de l'huile. La torche ne se recharge pas (charge initiale = autonomie complète).
export function rechargerLampe(p) {
  p = joueur(p); const id = p.equip.lampe; if (!id) return { ok: false, raison: 'Aucune lampe équipée.' };
  const src = REGLAGES.lumiere.SOURCES[id]; const e = p.equipEtat.lampe;
  if (!src.charge) {
    if ((e.charge || 0) <= 0 && id === 'torche' && !e.entamee) { e.charge = src.minParCharge; e.entamee = true; return { ok: true }; }
    return { ok: false, raison: 'Elle ne se recharge pas.' };
  }
  if (!removeItem(src.charge, 1, p)) return { ok: false, raison: `Il te faut : ${nomObjet(src.charge)}.` };
  e.charge = src.minParCharge;
  emit('toast', { texte: `${nomObjet(id)} : ${src.charge === 'piles' ? 'piles neuves' : 'rechargée'}.`, type: 'bon' });
  emit('inventaire', { lampe: true });
  return { ok: true };
}
// Appelé chaque minute de jeu (demarrerSurvie) : la lampe allumée consomme.
export function consommerLumiere(delta, p) {
  p = joueur(p); const l = lampe(p); if (!l || !l.allumee) return;
  const e = p.equipEtat.lampe; e.charge = Math.max(0, (e.charge || 0) - delta);
  if (e.charge <= 0) {
    e.allumee = false;
    if (l.id === 'torche') { p.equip.lampe = null; delete p.equipEtat.lampe; emit('toast', { texte: 'La torche s\'éteint, consumée.', type: 'alerte' }); }
    else emit('toast', { texte: `${l.nom} : ${l.charge === 'piles' ? 'piles mortes' : 'plus d\'huile'}.`, type: 'alerte' });
    emit('inventaire', { lampe: false });
  }
}

// ---------- Eau et contenants ----------
export function contenance(id) { const d = def(id); return (d && d.contenance) || 0; }
// Remplir le contenant d'index `index` à une source ('propre' | 'croupie'). Mélanger rend croupie.
export function remplir(index, qualite = 'croupie', L, p) {
  p = joueur(p); let it = p.inventaire[index]; if (!it) return { ok: false };
  const cap = contenance(it.id); if (!cap) return { ok: false, raison: 'Ce n\'est pas un contenant.' };
  if (it.qty > 1) { it.qty--; it = { id: it.id, qty: 1 }; p.inventaire.push(it); }
  const avant = it.eau ? it.eau.L : 0;
  const ajout = Math.min(cap - avant, L ?? cap);
  if (ajout <= 0) return { ok: false, raison: 'Déjà plein.' };
  const q = (!it.eau || it.eau.L <= 0) ? qualite : (it.eau.q === 'propre' && qualite === 'propre' ? 'propre' : 'croupie');
  it.eau = { q, L: Math.round((avant + ajout) * 100) / 100 };
  emit('inventaire', { eau: it.id });
  return { ok: true, L: ajout, q };
}
export function vider(index, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it || !it.eau) return false;
  delete it.eau; fusionnerPiles(p); emit('inventaire', { eau: it.id }); return true;
}
// Retire L litres d'un contenant ; → qualité bue ou null.
export function preleverEau(index, L, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it || !it.eau || it.eau.L <= 0) return null;
  const pris = Math.min(L, it.eau.L); const q = it.eau.q;
  it.eau.L = Math.round((it.eau.L - pris) * 100) / 100;
  if (it.eau.L <= 0.001) { delete it.eau; fusionnerPiles(p); }
  emit('inventaire', { eau: it.id });
  return { q, L: pris };
}
export function litresEau(qualite, p) {
  p = joueur(p); return p.inventaire.reduce((s, it) => s + (it.eau && (!qualite || it.eau.q === qualite) ? it.eau.L : 0), 0);
}
function fusionnerPiles(p) {
  const out = [];
  for (const it of p.inventaire) {
    if (!aEtat(it)) { const pile = out.find(x => x.id === it.id && !aEtat(x)); if (pile) { pile.qty += it.qty; continue; } }
    out.push(it);
  }
  p.inventaire = out;
}

// ---------- Déchirer un vêtement (chiffons) ----------
export function dechirer(index, p) {
  p = joueur(p); const it = p.inventaire[index]; const c = it && CLOTHES[it.id];
  if (!c || !c.tissu) return { ok: false, raison: 'Rien à en tirer.' };
  removeIndex(index, 1, p);
  addItem('chiffon', c.tissu, {}, p);
  emit('toast', { texte: `${c.nom} déchiré : ${c.tissu} chiffon${c.tissu > 1 ? 's' : ''}.`, type: 'info' });
  return { ok: true, chiffons: c.tissu };
}

// Liste du sac groupée par catégorie : [{ cat, nom, items: [{ index, it, def }] }]
export function sacParCategorie(p) {
  p = joueur(p); const groupes = new Map(CATEGORIES_OBJETS.map(([k, n]) => [k, { cat: k, nom: n, items: [] }]));
  p.inventaire.forEach((it, index) => { const c = categorie(it.id); (groupes.get(c) || groupes.get('divers')).items.push({ index, it, def: def(it.id) }); });
  for (const g of groupes.values()) g.items.sort((a, b) => (a.def?.nom || '').localeCompare(b.def?.nom || '', 'fr'));
  return [...groupes.values()].filter(g => g.items.length);
}
