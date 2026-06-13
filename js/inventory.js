// ============ Inventaire & équipement ============
// Deux limites (cf. instructions) : le POIDS et l'ESPACE.
// Les vêtements/armes équipés pèsent mais n'occupent pas d'espace d'inventaire.
// ACCÈS RAPIDE : les objets glissés dans la ceinture / le holster / le gilet.
// En combat, on ne peut utiliser QUE l'arme en main et les objets d'accès rapide.
// CONTENANTS D'EAU : une instance pleine porte eau:{q:'croupie'|'bouillie', L} et ne
// s'empile pas. 1 L = 1 kg en plus du poids à vide. Un récipient OUVERT plein
// (canette, casserole) ne va pas dans le sac : tenu en main (slot arme) ou posé au sol.
import { G, skillLevel } from './state.js';
import { ITEMS, item } from './data/items.js';
import { CLOTHES, cloth } from './data/clothing.js';
import { sfx } from './audio.js';
import { deposerAuSol, keyCourante } from './world.js';

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
    if (d) p += (d.poids || 0) * it.qty + poidsEau(it);
  }
  for (const it of accesRapide()) {
    const d = item(it.id) || cloth(it.id);
    if (d) p += (d.poids || 0) * (it.qty || 1) + poidsEau(it);
  }
  for (const slot of Object.keys(G.player.equip)) {
    const eqv = G.player.equip[slot];
    if (!eqv) continue;
    if (slot === 'arme') { // l'objet tenu en main : {id, dur?} ou un récipient {id, eau?}
      const d = item(eqv.id);
      if (d) p += (d.poids || 0) + poidsEau(eqv);
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
// Le POIDS est une limite SOUPLE. Jusqu'au max, tout va bien. Entre le max et un
// PLAFOND dur, on est « en surpoids » : on bouge encore (plus lentement) mais le
// combat se paie cher. Au-delà du plafond, on ne peut plus rien ajouter de son
// plein gré — l'excédent file au sol (cf. equiperVetement / equiperDepuisSol).
export function poidsPlafond() { return Math.round(poidsMax() * 1.5); }
export function enSurpoids() { const p = poidsTotal(); return p > poidsMax() && p <= poidsPlafond(); }
// surcharge = au-delà du plafond : déplacement bloqué (garde-fou, on y arrive rarement).
export function surcharge() { return poidsTotal() > poidsPlafond(); }
// Sévérité du surpoids, 0 (au max) → 1 (au plafond), pour doser les malus de combat.
export function surpoidsFacteur() {
  const pm = poidsMax(), pl = poidsPlafond();
  if (pl <= pm) return 0;
  return Math.max(0, Math.min(1, (poidsTotal() - pm) / (pl - pm)));
}

// ---------- Objets jetés au sol (débordement) ----------
// Quand une action fait porter plus que ce qu'on peut contenir (sac troqué contre
// un plus petit, ceinture aux emplacements réduits…), l'excédent tombe sur la case
// courante. Ces helpers RETIRENT du sac / de l'accès rapide et renvoient la liste
// de ce qui a été jeté, pour que l'appelant l'annonce.
function jeterAuSol(entry) {
  const e = { id: entry.id, qty: entry.qty || 1, ...champsInstance(entry) };
  deposerAuSol(keyCourante(), e);
  return { id: e.id, qty: e.qty };
}
// Vide l'excédent d'ESPACE du sac vers le sol jusqu'à repasser sous la capacité.
function viderExcesEspace() {
  const jetes = [];
  let garde = 60; // garde-fou anti-boucle
  while (espaceUtilise() > espaceMax() && garde-- > 0) {
    const inv = G.player.inventaire;
    // On jette d'abord ce qui occupe le plus d'espace (libère le plus vite).
    let idx = -1, max = 0;
    inv.forEach((it, i) => { const e = defItem(it.id)?.espace || 0; if (e > max) { max = e; idx = i; } });
    if (idx < 0) break; // plus que des objets sans encombrement : en jeter ne libère rien
    const it = inv[idx];
    // détache UNE unité (les piles tombent une par une)
    const unite = { id: it.id, qty: 1, ...champsInstance(it) };
    it.qty -= 1;
    if (it.qty <= 0) inv.splice(idx, 1);
    deposerAuSol(keyCourante(), unite);
    jetes.push({ id: unite.id, qty: 1 });
  }
  return fusionnerJetes(jetes);
}
// Vide l'excédent d'ACCÈS RAPIDE (emplacements perdus) vers le sac, sinon le sol.
function viderExcesAccesRapideAuSol() {
  const jetes = [];
  const ar = accesRapide();
  while (ar.length > nbSlotsAccesRapide()) {
    const it = ar.pop();
    if (placePour(it.id, 1)) {
      G.player.inventaire.push({ id: it.id, qty: 1, ...champsInstance(it) });
    } else {
      deposerAuSol(keyCourante(), { id: it.id, qty: 1, ...champsInstance(it) });
      jetes.push({ id: it.id, qty: 1 });
    }
  }
  return fusionnerJetes(jetes);
}
function fusionnerJetes(jetes) {
  const m = new Map();
  for (const j of jetes) m.set(j.id, (m.get(j.id) || 0) + j.qty);
  return [...m.entries()].map(([id, qty]) => ({ id, qty }));
}
// Libellé « pied-de-biche, 2 chiffons » à partir d'une liste {id, qty}.
export function libelleJetes(jetes) {
  return jetes.map(j => `${defItem(j.id)?.nom || j.id}${j.qty > 1 ? ` ×${j.qty}` : ''}`).join(', ');
}

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
  // une gourde pleine garde son eau, une lampe allumée reste allumée
  ar.push({ id: it.id, qty: 1, ...champsInstance(it) });
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
  if (it.dur !== undefined || it.eau || it.on !== undefined || it.usure) {
    G.player.inventaire.push({ id: it.id, qty: 1, ...champsInstance(it) });
  } else addItem(it.id, 1);
  return true;
}

// ---------- Contenants d'eau ----------
// L'eau pèse : 1 litre = 1 kg, en plus du poids à vide du récipient.
export function poidsEau(entry) { return entry && entry.eau ? entry.eau.L : 0; }
export function estContenant(id) { return !!(defItem(id) && defItem(id).contenance); }
export function recipientOuvert(id) { const d = defItem(id); return !!d && d.recipient === 'ouvert'; }
export function contenance(id) { const d = defItem(id); return (d && d.contenance) || 0; }
const arrondiL = (n) => Math.round(n * 100) / 100;

// « eau croupie, 0,5/1 L » — affichage du contenu (virgule à la française)
export function fmtL(n) { return String(arrondiL(n)).replace('.', ','); }
export function descEau(entry) {
  if (!entry || !entry.eau) return '';
  return `eau ${entry.eau.q === 'bouillie' ? 'bouillie' : 'croupie'}, ${fmtL(entry.eau.L)}/${fmtL(contenance(entry.id))} L`;
}

// Si une pile d'objets vides (qty > 1) doit recevoir de l'eau, on en détache UNE instance.
export function instancePourEau(index) {
  const it = G.player.inventaire[index];
  if (!it) return null;
  if (it.eau || it.qty === 1) return it;
  it.qty -= 1;
  const inst = { id: it.id, qty: 1 };
  G.player.inventaire.push(inst);
  return inst;
}

// Verser d'un contenant dans un autre, dans la limite des capacités.
// Mélanger de la croupie à de la bouillie gâche tout : le résultat est croupi.
export function verserEau(src, dst) {
  if (!src || !src.eau || !dst) return { ok: false, raison: 'Rien à verser.' };
  const libre = contenance(dst.id) - (dst.eau ? dst.eau.L : 0);
  const move = arrondiL(Math.min(src.eau.L, libre));
  if (move <= 0) return { ok: false, raison: 'Le récipient est déjà plein.' };
  const gache = dst.eau && dst.eau.L > 0 && dst.eau.q !== src.eau.q;
  const q = dst.eau && dst.eau.L > 0 ? (gache ? 'croupie' : dst.eau.q) : src.eau.q;
  dst.eau = { q, L: arrondiL((dst.eau ? dst.eau.L : 0) + move) };
  src.eau.L = arrondiL(src.eau.L - move);
  if (src.eau.L <= 0.01) delete src.eau;
  return { ok: true, L: move, gache };
}

// Les champs qui appartiennent à UNE instance (et non à une pile d'objets) :
// durabilité d'arme, eau embarquée, lampe allumée, usure des piles / de la torche.
function champsInstance(src) {
  const o = {};
  if (src.dur !== undefined) o.dur = src.dur;
  if (src.eau) o.eau = src.eau;
  if (src.on !== undefined) o.on = src.on;
  if (src.usure) o.usure = src.usure;
  return o;
}

// Prendre un objet EN MAIN (slot arme) — utilisé pour les récipients ouverts.
// Ce qui occupait la main retourne au sac ; si c'était un récipient ouvert plein,
// son eau se renverse (le récipient vide retourne au sac quand même).
export function prendreEnMain(objet) {
  const renverse = libererLaMain();
  G.player.equip.arme = { id: objet.id, ...champsInstance(objet) };
  return { ok: true, renverse };
}
// Vide la main vers le sac. Retourne le nom du récipient renversé, ou null.
function libererLaMain() {
  const cur = G.player.equip.arme;
  if (!cur) return null;
  let renverse = null;
  if (cur.eau && recipientOuvert(cur.id)) {
    renverse = defItem(cur.id) ? defItem(cur.id).nom : cur.id;
    delete cur.eau;
  }
  G.player.inventaire.push({ id: cur.id, qty: 1, ...champsInstance(cur) });
  G.player.equip.arme = null;
  return renverse;
}
// Prendre en main un récipient depuis le sac (index d'inventaire).
export function tenirRecipient(index) {
  const it = G.player.inventaire[index];
  if (!it || !estContenant(it.id)) return { ok: false, renverse: null };
  const inst = instancePourEau(index);
  G.player.inventaire.splice(G.player.inventaire.indexOf(inst), 1);
  return prendreEnMain(inst);
}
// Après bu/vidé, les contenants vides se ré-empilent proprement.
// Les instances marquées (eau, durabilité, lampe allumée/entamée) restent seules.
export function consolider() {
  const inv = G.player.inventaire;
  const marque = (o) => o.eau || o.dur !== undefined || o.on !== undefined || o.usure;
  for (let i = inv.length - 1; i >= 0; i--) {
    const it = inv[i];
    if (marque(it)) continue;
    const j = inv.findIndex((o, k) => k < i && o.id === it.id && !marque(o));
    if (j >= 0) { inv[j].qty += it.qty; inv.splice(i, 1); }
  }
}

// ---------- Manipulation ----------
export function defItem(id) { return item(id) || cloth(id); }

// NB : un contenant PLEIN ne compte pas comme l'objet « nu » (une gourde pleine
// n'est pas une gourde vide, un bidon plein d'eau n'est pas un bidon disponible).
export function countItem(id) {
  let n = 0;
  for (const i of G.player.inventaire) if (i.id === id && !i.eau) n += i.qty;
  for (const i of accesRapide()) if (i.id === id && !i.eau) n += i.qty || 1;
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
    // jamais sur un contenant plein ni sur une lampe allumée/entamée
    const ex = G.player.inventaire.find(i => i.id === id && !i.eau && i.on === undefined && !i.usure);
    if (ex) { ex.qty += qty; return true; }
    G.player.inventaire.push({ id, qty });
  } else {
    for (let i = 0; i < qty; i++) G.player.inventaire.push({ id, qty: 1, dur: d.dur });
  }
  return true;
}

// Retire en piochant d'abord dans l'inventaire, puis dans l'accès rapide.
// Les contenants PLEINS sont épargnés (leur eau n'est pas un ingrédient).
export function removeItem(id, qty = 1) {
  for (let i = G.player.inventaire.length - 1; i >= 0 && qty > 0; i--) {
    const it = G.player.inventaire[i];
    if (it.id !== id || it.eau) continue;
    const take = Math.min(it.qty, qty);
    it.qty -= take; qty -= take;
    if (it.qty <= 0) G.player.inventaire.splice(i, 1);
  }
  const ar = accesRapide();
  for (let i = ar.length - 1; i >= 0 && qty > 0; i--) {
    if (ar[i].id !== id || ar[i].eau) continue;
    ar.splice(i, 1);
    qty -= 1;
  }
  return qty === 0;
}

export function dropItem(index, qty = 1) {
  const it = G.player.inventaire[index];
  if (!it) return;
  const n = Math.min(qty, it.qty);
  // Jeté = posé au sol de la case courante : récupérable (par toi, ou par ton coéquipier en co-op).
  deposerAuSol(keyCourante(), { id: it.id, qty: n, ...champsInstance(it) });
  it.qty -= n;
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

// ---------- Lampes : la lumière est un INTERRUPTEUR, pas un état passif ----------
// Une lampe n'éclaire QUE tenue en main ou à la ceinture, ET allumée (champ
// d'instance on:true). Allumée, elle consomme en continu : les lampes à piles
// mangent une paire de piles en ~3 h de jeu (champ usure 0→1), la torche
// artisanale se consume en ~45 min puis part en cendres.
const MIN_PAR_PILES = 180; // ~3 h de jeu par paire de piles
const MIN_TORCHE = 45;     // une torche brûle ~45 min

export function estLampe(id) { return id === 'lampe_torche' || id === 'lampe_frontale' || id === 'torche'; }

// true si une lampe ALLUMÉE est en main ou en accès rapide : c'est ÇA, avoir de la lumière.
export function lumiereActive() {
  const allumee = (e) => !!(e && estLampe(e.id) && e.on);
  if (allumee(G.player.equip.arme)) return true;
  return accesRapide().some(allumee);
}

// La lampe « à portée » (pour le bouton sous la carte) : une allumée d'abord,
// sinon la première en main ou à la ceinture. null si aucune.
export function lampePortee() {
  const cands = [];
  const main = G.player.equip.arme;
  if (main && estLampe(main.id)) cands.push(main);
  for (const e of accesRapide()) if (estLampe(e.id)) cands.push(e);
  return cands.find(e => e.on) || cands[0] || null;
}

// Allumer / éteindre une instance de lampe. Retourne { ok, on, raison? }.
export function basculerLampe(ref) {
  if (!ref || !estLampe(ref.id)) return { ok: false, raison: 'Pas une lampe.' };
  if (ref.on) {
    // éteinte : une lampe aux piles intactes redevient un objet ordinaire (empilable)
    delete ref.on;
    if (!ref.usure) delete ref.usure;
    return { ok: true, on: false };
  }
  if (ref.id === 'torche') {
    if (!hasOutil('feu')) return { ok: false, raison: 'Rien pour enflammer la torche.' };
  } else if (!hasItem('piles')) {
    return { ok: false, raison: 'Pas de piles.' };
  }
  ref.on = true;
  if (!ref.usure) ref.usure = 0;
  return { ok: true, on: true };
}

// Prendre une lampe du sac EN MAIN (elle n'a pas de dégâts : equiperArme la refuse).
export function tenirLampe(index) {
  const it = G.player.inventaire[index];
  if (!it || !estLampe(it.id)) return { ok: false, renverse: null };
  const inst = instancePourEau(index); // détache UNE instance de la pile
  G.player.inventaire.splice(G.player.inventaire.indexOf(inst), 1);
  return prendreEnMain(inst);
}

// Drain continu, appelé par advanceTime (dt en minutes de jeu).
// Toute lampe allumée consomme, où qu'elle soit — une lampe oubliée allumée
// au fond du sac vide ses piles sans éclairer personne.
export function usureLampes(dt) {
  const msgs = [];
  const allumees = [];
  const main = G.player.equip.arme;
  if (main && estLampe(main.id) && main.on) allumees.push({ ref: main, ou: 'main' });
  for (const e of accesRapide()) if (estLampe(e.id) && e.on) allumees.push({ ref: e, ou: 'ar' });
  for (const e of G.player.inventaire) if (estLampe(e.id) && e.on) allumees.push({ ref: e, ou: 'sac' });
  for (const { ref, ou } of allumees) {
    if (ref.id === 'torche') {
      ref.usure = (ref.usure || 0) + dt / MIN_TORCHE;
      if (ref.usure >= 1) {
        if (ou === 'main') G.player.equip.arme = null;
        else if (ou === 'ar') accesRapide().splice(accesRapide().indexOf(ref), 1);
        else G.player.inventaire.splice(G.player.inventaire.indexOf(ref), 1);
        msgs.push({ t: 'Ta torche s\'est consumée jusqu\'au manche. Tu lâches le tison.', c: 'warn' });
      }
    } else {
      ref.usure = (ref.usure || 0) + dt / MIN_PAR_PILES;
      if (ref.usure >= 1) {
        ref.usure = 0;
        removeItem('piles', 1); // la paire morte part à la poubelle
        if (hasItem('piles')) {
          msgs.push({ t: 'Le faisceau jaunit, meurt — tu remplaces les piles à tâtons.', c: 'warn' });
        } else {
          ref.on = false;
          msgs.push({ t: 'La lampe s\'éteint. Plus de piles.', c: 'warn' });
        }
      }
    }
  }
  return msgs;
}

// ---------- Équipement ----------
// Un récipient tenu en main n'est PAS une arme : le combat le traite comme des
// mains nues (et l'eau d'un récipient ouvert se renverse si on dégaine).
export function armeEquipee() {
  const a = G.player.equip.arme;
  if (!a) return null;
  const d = item(a.id);
  if (d && !d.dmg) return null; // récipient ou objet inoffensif en main
  return a; // {id, dur}
}
// Retourne { ok, renverse } — renverse : nom du récipient dont l'eau s'est répandue.
export function equiperArme(index) {
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, renverse: null };
  const d = item(it.id);
  if (!d || !d.dmg) return { ok: false, renverse: null };
  // remettre ce qu'on tenait dans l'inventaire (l'eau d'un récipient ouvert se renverse)
  const renverse = libererLaMain();
  G.player.equip.arme = { id: it.id, dur: it.dur ?? d.dur };
  G.player.inventaire.splice(index, 1);
  return { ok: true, renverse };
}
// Retourne false si on tient un récipient ouvert PLEIN : il ne va pas dans le sac.
export function desequiperArme() {
  const cur = G.player.equip.arme;
  if (!cur) return true;
  if (cur.eau && recipientOuvert(cur.id)) return false;
  G.player.inventaire.push({ id: cur.id, qty: 1, ...champsInstance(cur) });
  G.player.equip.arme = null;
  return true;
}

// Enfiler un vêtement venu du sac. L'opération RÉUSSIT toujours côté place :
// l'ancien vêtement retourne au sac s'il y rentre, sinon il tombe au sol ; et si la
// capacité diminue (sac plus petit, ceinture aux emplacements réduits), le trop-plein
// file au sol aussi. Retourne { ok, auSol:[{id,qty}] } — la liste de ce qui est tombé.
export function equiperVetement(index) {
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, auSol: [] };
  const c = cloth(it.id);
  if (!c) return { ok: false, auSol: [] };
  const slot = c.slot;
  const ancien = G.player.equip[slot];
  const nouveauId = it.id;
  it.qty -= 1;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  G.player.equip[slot] = nouveauId;
  return rangerApresEquip(slot, ancien, c);
}
// Enfiler un vêtement DIRECTEMENT depuis le sol, sans le faire transiter par
// l'espace du sac : un sac (ou une ceinture) qu'on met sur le dos AJOUTE de la
// place — exiger de la place pour le ramasser serait absurde. L'appelant aura déjà
// retiré une unité du sol. Retourne { ok, auSol }.
export function equiperDepuisSol(solEntry) {
  const c = cloth(solEntry.id);
  if (!c) return { ok: false, auSol: [] };
  const slot = c.slot;
  const ancien = G.player.equip[slot];
  G.player.equip[slot] = solEntry.id;
  return rangerApresEquip(slot, ancien, c);
}
// Range l'ancien vêtement après un changement d'équipement et évacue tout
// débordement (place / accès rapide) vers le sol. Facteur commun aux deux entrées.
function rangerApresEquip(slot, ancien, nouveauDef) {
  const auSol = [];
  if (ancien && !addItem(ancien, 1)) auSol.push(jeterAuSol({ id: ancien, qty: 1 }));
  auSol.push(...viderExcesAccesRapideAuSol());
  auSol.push(...viderExcesEspace());
  return { ok: true, auSol: fusionnerJetes(auSol) };
}
// Retirer un vêtement. Réussit toujours côté place : il retourne au sac s'il y
// rentre (sinon au sol), et la capacité qui diminue peut faire déborder le reste.
export function desequiperVetement(slot) {
  const id = G.player.equip[slot];
  if (!id) return { ok: false, auSol: [] };
  G.player.equip[slot] = null;
  const auSol = [];
  if (!addItem(id, 1)) auSol.push(jeterAuSol({ id, qty: 1 }));
  auSol.push(...viderExcesAccesRapideAuSol());
  auSol.push(...viderExcesEspace());
  return { ok: true, auSol: fusionnerJetes(auSol) };
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
// Échange : l'arme en main va dans l'emplacement de l'objet pris (ou l'emplacement se libère).
// Si on tenait un récipient ouvert plein, son eau se renverse — dégainer a un prix.
export function degainerAccesRapide(arIndex) {
  const ar = accesRapide();
  const it = ar[arIndex];
  if (!it) return false;
  const d = item(it.id);
  if (!d || !d.dmg) return false;
  const cur = G.player.equip.arme;
  ar.splice(arIndex, 1);
  if (cur) {
    if (cur.eau && recipientOuvert(cur.id)) {
      delete cur.eau;
      G.player.inventaire.push({ id: cur.id, qty: 1 }); // le récipient vide retourne au sac
      sfx('eau_verse');
    } else {
      ar.push({ id: cur.id, qty: 1, ...champsInstance(cur) }); // une lampe allumée reste allumée
    }
  }
  G.player.equip.arme = { id: it.id, dur: it.dur ?? d.dur };
  return true;
}
// Rengainer l'arme en main vers la ceinture (s'il reste un emplacement)
export function rengainerArme() {
  const cur = G.player.equip.arme;
  if (!cur) return false;
  if (cur.eau && recipientOuvert(cur.id)) return false; // une casserole pleine ne se rengaine pas
  const ar = accesRapide();
  if (ar.length >= nbSlotsAccesRapide()) return false;
  ar.push({ id: cur.id, qty: 1, ...champsInstance(cur) });
  G.player.equip.arme = null;
  return true;
}

export function munitionsPour(armeId) {
  const d = item(armeId);
  if (!d || !d.ammo) return Infinity;
  return countItem(d.ammo);
}
