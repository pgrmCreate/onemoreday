// ============ Inventaire & équipement ============
// Deux limites (cf. instructions) : le POIDS et l'ESPACE.
// Les vêtements/armes équipés pèsent mais n'occupent pas d'espace d'inventaire.
// ACCÈS RAPIDE : les objets glissés dans la ceinture / le holster / le gilet.
// En combat, on ne peut utiliser QUE l'arme en main et les objets d'accès rapide.
import { G, skillLevel } from './state.js';
import { ITEMS, item } from './data/items.js';
import { CLOTHES, cloth } from './data/clothing.js';

const SLOTS_VETEMENTS = ['tete', 'torse', 'mains', 'jambes', 'pieds', 'sac', 'ceinture', 'holster'];

// ---------- Capacités ----------
// Façon Project Zomboid : sans sac, on porte ses poches et ses bras, point.
// Chaque sac (et certains harnais) ajoute son PORTAGE en kg.
export function poidsMax() {
  let p = 8 + skillLevel('force') * 2;
  for (const slot of SLOTS_VETEMENTS) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c) p += c.portage || 0;
  }
  return Math.round(p);
}
export function espaceMax() {
  let e = 4; // poches de base
  for (const slot of SLOTS_VETEMENTS) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c) e += c.espace || 0;
  }
  return e;
}
export function poidsTotal() {
  let p = 0;
  for (const it of G.player.inventaire) {
    const d = item(it.id) || cloth(it.id);
    if (d) p += (d.poids || 0) * it.qty;
  }
  for (const it of accesRapide()) {
    const d = item(it.id) || cloth(it.id);
    if (d) p += (d.poids || 0) * (it.qty || 1);
  }
  for (const slot of Object.keys(G.player.equip)) {
    const eqv = G.player.equip[slot];
    if (!eqv) continue;
    if (slot === 'arme') { // l'arme équipée est un objet {id, dur}
      const d = item(eqv.id);
      if (d) p += d.poids || 0;
      continue;
    }
    const d = cloth(eqv) || item(eqv);
    if (d) p += d.poids || 0;
  }
  return p;
}
export function espaceUtilise() {
  let e = 0;
  for (const it of G.player.inventaire) {
    const d = item(it.id) || cloth(it.id);
    if (d) e += (d.espace || 0) * it.qty;
  }
  return e;
}
export function surcharge() { return poidsTotal() > poidsMax(); }

// ---------- Accès rapide ----------
export function accesRapide() {
  if (!G.player.accesRapide) G.player.accesRapide = [];
  return G.player.accesRapide;
}
// Nombre d'emplacements offerts par l'équipement porté (ceinture, holster, gilet...)
export function nbSlotsAccesRapide() {
  let n = 0;
  for (const slot of SLOTS_VETEMENTS) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c) n += c.accesRapide || 0;
  }
  return n;
}
// Un objet est éligible à l'accès rapide s'il est assez compact (espace ≤ 2)
export function peutAccesRapide(id) {
  const d = item(id) || cloth(id);
  return !!d && (d.espace || 0) <= 2 && !cloth(id);
}
export function mettreEnAccesRapide(index) {
  const ar = accesRapide();
  if (ar.length >= nbSlotsAccesRapide()) return { ok: false, raison: 'Plus de place à la ceinture.' };
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, raison: 'Objet introuvable.' };
  if (!peutAccesRapide(it.id)) return { ok: false, raison: 'Trop encombrant pour la ceinture.' };
  ar.push({ id: it.id, qty: 1, dur: it.dur });
  it.qty -= 1;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  return { ok: true };
}
export function retirerAccesRapide(arIndex) {
  const ar = accesRapide();
  const it = ar[arIndex];
  if (!it) return false;
  if (!placePour(it.id, 1)) return false;
  ar.splice(arIndex, 1);
  if (it.dur !== undefined) G.player.inventaire.push({ id: it.id, qty: 1, dur: it.dur });
  else addItem(it.id, 1);
  return true;
}

// ---------- Manipulation ----------
export function defItem(id) { return item(id) || cloth(id); }

export function countItem(id) {
  let n = 0;
  for (const i of G.player.inventaire) if (i.id === id) n += i.qty;
  for (const i of accesRapide()) if (i.id === id) n += i.qty || 1;
  return n;
}
export function hasItem(id, qty = 1) { return countItem(id) >= qty; }

// Peut-on ajouter cet objet sans dépasser l'espace ? (le poids bloque seulement les déplacements)
export function placePour(id, qty = 1) {
  const d = defItem(id);
  if (!d) return false;
  return espaceUtilise() + (d.espace || 0) * qty <= espaceMax();
}

export function addItem(id, qty = 1) {
  const d = defItem(id);
  if (!d) { console.warn('Objet inconnu :', id); return false; }
  if (!placePour(id, qty)) return false;
  const stackable = !d.dur; // les armes à durabilité ne s'empilent pas
  if (stackable) {
    const ex = G.player.inventaire.find(i => i.id === id);
    if (ex) { ex.qty += qty; return true; }
    G.player.inventaire.push({ id, qty });
  } else {
    for (let i = 0; i < qty; i++) G.player.inventaire.push({ id, qty: 1, dur: d.dur });
  }
  return true;
}

// Retire en piochant d'abord dans l'inventaire, puis dans l'accès rapide.
export function removeItem(id, qty = 1) {
  for (let i = G.player.inventaire.length - 1; i >= 0 && qty > 0; i--) {
    const it = G.player.inventaire[i];
    if (it.id !== id) continue;
    const take = Math.min(it.qty, qty);
    it.qty -= take; qty -= take;
    if (it.qty <= 0) G.player.inventaire.splice(i, 1);
  }
  const ar = accesRapide();
  for (let i = ar.length - 1; i >= 0 && qty > 0; i--) {
    if (ar[i].id !== id) continue;
    ar.splice(i, 1);
    qty -= 1;
  }
  return qty === 0;
}

export function dropItem(index, qty = 1) {
  const it = G.player.inventaire[index];
  if (!it) return;
  it.qty -= qty;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
}

// ---------- Outils ----------
// tag : 'feu', 'cuisson', 'ouvrir', 'lumiere', 'mecanique', 'construction', etc.
export function hasOutil(tag) {
  if (tag === 'feu') {
    if (hasItem('briquet') || hasItem('allumettes')) return true;
    if (hasItem('rechaud_camping') && hasItem('cartouche_gaz')) return true;
    return false;
  }
  if (tag === 'lumiere') {
    return ((hasItem('lampe_torche') || hasItem('lampe_frontale')) && hasItem('piles')) || hasItem('torche');
  }
  const aTag = (it) => { const d = item(it.id); return d && d.usage && d.usage.includes(tag); };
  if (G.player.inventaire.some(aTag) || accesRapide().some(aTag)) return true;
  // l'arme équipée peut servir d'outil (pied-de-biche...)
  const armeEq = armeEquipee();
  if (armeEq) {
    const d = item(armeEq.id);
    if (d && d.usage && d.usage.includes(tag)) return true;
  }
  return false;
}

// ---------- Équipement ----------
export function armeEquipee() {
  const a = G.player.equip.arme;
  return a || null; // {id, dur}
}
export function equiperArme(index) {
  const it = G.player.inventaire[index];
  if (!it) return false;
  const d = item(it.id);
  if (!d || !d.dmg) return false;
  // remettre l'arme actuelle dans l'inventaire
  if (G.player.equip.arme) {
    const cur = G.player.equip.arme;
    G.player.inventaire.push({ id: cur.id, qty: 1, dur: cur.dur });
  }
  G.player.equip.arme = { id: it.id, dur: it.dur ?? d.dur };
  G.player.inventaire.splice(index, 1);
  return true;
}
export function desequiperArme() {
  const cur = G.player.equip.arme;
  if (!cur) return;
  G.player.inventaire.push({ id: cur.id, qty: 1, dur: cur.dur });
  G.player.equip.arme = null;
}

export function equiperVetement(index) {
  const it = G.player.inventaire[index];
  if (!it) return false;
  const c = cloth(it.id);
  if (!c) return false;
  const slot = c.slot;
  const ancien = G.player.equip[slot];
  // retirer une ceinture pleine : il faut d'abord pouvoir vider ses emplacements
  if (ancien && !videExcesAccesRapide(cloth(ancien), c)) return false;
  // retirer le nouveau de l'inventaire et l'enfiler
  const nouveauId = it.id;
  it.qty -= 1;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  G.player.equip[slot] = nouveauId;
  // ranger l'ancien : s'il ne rentre pas (ex. troquer le grand sac contre une sacoche), on annule tout
  if (ancien && !addItem(ancien, 1)) {
    G.player.equip[slot] = ancien;
    addItem(nouveauId, 1); // la place qu'il occupait vient d'être libérée : toujours possible
    return false;
  }
  return true;
}
export function desequiperVetement(slot) {
  const id = G.player.equip[slot];
  if (!id) return false;
  const c = cloth(id);
  // l'espace total diminue : vérifier que ça rentre encore
  const espaceApres = espaceMax() - (c.espace || 0);
  if (espaceUtilise() + (c.espace || 0) > espaceApres) return false;
  if (!videExcesAccesRapide(c, null)) return false;
  G.player.equip[slot] = null;
  addItem(id, 1);
  return true;
}

// En retirant un vêtement à accès rapide, les objets en trop retournent dans le sac.
// Retourne false si le sac ne peut pas les absorber (on garde alors le vêtement).
function videExcesAccesRapide(ancienDef, nouveauDef) {
  const perdus = (ancienDef?.accesRapide || 0) - (nouveauDef?.accesRapide || 0);
  if (perdus <= 0) return true;
  const ar = accesRapide();
  const slotsApres = nbSlotsAccesRapide() - perdus;
  while (ar.length > Math.max(0, slotsApres)) {
    const it = ar[ar.length - 1];
    if (!placePour(it.id, 1)) return false;
    retirerAccesRapide(ar.length - 1);
  }
  return true;
}

export function protectionTotale() {
  let p = 0;
  for (const slot of SLOTS_VETEMENTS) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c) p += c.protection || 0;
  }
  return p;
}
export function chaleurTotale() {
  let ch = 0;
  for (const slot of ['tete', 'torse', 'mains', 'jambes', 'pieds']) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c) ch += c.chaleur || 0;
  }
  return ch;
}
export function bonusAgiliteVetements() {
  let b = 0;
  for (const slot of ['jambes', 'pieds']) {
    const id = G.player.equip[slot];
    if (!id) continue;
    const c = cloth(id);
    if (c && c.agilite) b += c.agilite;
  }
  return b;
}

// Armes et objets utilisables EN COMBAT : uniquement l'accès rapide.
export function armesDisponibles() {
  const res = [];
  accesRapide().forEach((it, idx) => {
    const d = item(it.id);
    if (!d) return;
    if (d.dmg && !d.jetSeul) res.push({ idx, id: it.id, dur: it.dur, def: d });
    else if (d.dmg && d.jetSeul) res.push({ idx, id: it.id, dur: it.dur, def: d, jet: true });
  });
  return res;
}
// Soins utilisables en combat depuis la ceinture (bandage = stopper un saignement)
export function soinsAccesRapide() {
  const res = [];
  accesRapide().forEach((it, idx) => {
    const d = item(it.id);
    if (d && d.type === 'soin' && d.soin === 'bandage') res.push({ idx, id: it.id, def: d });
  });
  return res;
}
// Échange : l'arme en main va dans l'emplacement de l'objet pris (ou l'emplacement se libère)
export function degainerAccesRapide(arIndex) {
  const ar = accesRapide();
  const it = ar[arIndex];
  if (!it) return false;
  const d = item(it.id);
  if (!d || !d.dmg) return false;
  const cur = G.player.equip.arme;
  ar.splice(arIndex, 1);
  if (cur) ar.push({ id: cur.id, qty: 1, dur: cur.dur });
  G.player.equip.arme = { id: it.id, dur: it.dur ?? d.dur };
  return true;
}
// Rengainer l'arme en main vers la ceinture (s'il reste un emplacement)
export function rengainerArme() {
  const cur = G.player.equip.arme;
  if (!cur) return false;
  const ar = accesRapide();
  if (ar.length >= nbSlotsAccesRapide()) return false;
  ar.push({ id: cur.id, qty: 1, dur: cur.dur });
  G.player.equip.arme = null;
  return true;
}

export function munitionsPour(armeId) {
  const d = item(armeId);
  if (!d || !d.ammo) return Infinity;
  return countItem(d.ammo);
}
