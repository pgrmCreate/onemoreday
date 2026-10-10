// ============ Inventaire — poids, VOLUME, mains, dos, équipement, accès rapide, lampes, eau, usure (sans DOM) ============
// Règles : GAMEPLAY §8 (poids + volume, mains, dos), §2.5 (lumière et piles), §6.1 (réparation), REGLAGES.inventaire.
// Forme : G.player.inventaire = [{ id, qty, dur?, durMax?, eau?: { q: 'propre'|'croupie', L } }]   (sac + poches)
//         G.player.equip = { arme (= MAIN DROITE), mainG (main gauche), dos, tete, haut, torse (pull), veste, mains, poignet (montre), jambes, pieds,
//                            sac, ceinture, holster, lampe } (ids)
//         G.player.deuxMains = true quand l'objet de la main droite est tenu à DEUX mains (main gauche libre).
//         G.player.equipEtat = { arme|mainG|dos: { dur, durMax, balles, eau… } (l'instance), lampe: { charge, allumee } }
//         G.player.accesRapide = [ids] — objets du sac accrochés à la ceinture / au holster / au gilet.
// Une LAMPE qui se tient à la main (lampe torche, lampe à huile, torche) occupe la main gauche.
// Tout changement émet bus 'inventaire'.
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES, SLOTS, COUVRE_DEFAUT } from '../data/clothing.js';
import { OBJETS_QUETE } from '../data/histoire/objets_quete.js';
import { niveau } from './player.js';

const I = () => REGLAGES.inventaire;
const joueur = (p) => p || (G && G.player);
export const SLOTS_VETEMENT = ['tete', 'haut', 'torse', 'veste', 'mains', 'poignet', 'jambes', 'pieds', 'sac', 'ceinture', 'holster'];
export const SLOTS_TENUS = ['arme', 'mainG', 'dos'];          // ce qu'on tient / porte sanglé (instances)
export const NOMS_SLOTS = { ...SLOTS, arme: 'Main droite', mainG: 'Main gauche', dos: 'Dans le dos', lampe: 'Lampe' };

// ---------- Définitions ----------
export function def(id) { return ITEMS[id] || OBJETS_QUETE[id] || CLOTHES[id] || null; }
export function nomObjet(id) { const d = def(id); return d ? d.nom : id; }
export const estVetement = (id) => !!CLOTHES[id];
export const estArme = (id) => { const d = def(id); return !!(d && d.type === 'arme'); };
export const estLampe = (id) => !!REGLAGES.lumiere.SOURCES[id] && !!ITEMS[id] && (ITEMS[id].usage || []).includes('lumiere');
export const lampeTenue = (id) => !!(id && REGLAGES.lumiere.SOURCES[id] && REGLAGES.lumiere.SOURCES[id].mains);
export const deuxMainsDef = (id) => { const d = def(id); return !!(d && d.deux_mains); };
const aEtat = (it) => it.dur != null || it.eau != null || it.charge != null || it.balles != null || it.reste != null;

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
  prendre: (i, qty) => { const s = solLocal[i]; if (!s) return null; if (qty > 0 && qty < s.qty) { s.qty -= qty; return { ...s, qty }; } return solLocal.splice(i, 1)[0]; },
};
// provider : { lister() → [items], deposer(item), prendre(index, qty?) → item|null }
export function setSol(provider) { sol = provider || sol; emit('inventaire', { sol: true }); }
export function objetsAuSol() { try { return sol.lister() || []; } catch (e) { return []; } }

// ---------- À portée de main (fabriquer, construire) ----------
// Ce qui traîne par terre autour de soi et ce qu'il y a dans les rangements DÉJÀ fouillés tout près compte comme
// si on l'avait sur soi : deux chiffons par terre suffisent pour un bandage. L'exploration branche le fournisseur :
// { lister() → [{ id, qty, src, ...état }], prendre([{ src, id, qty }]) }. Hors exploration : rien à portée.
let proximite = { lister: () => [], prendre: () => {} };
export function setProximite(provider) { proximite = provider || { lister: () => [], prendre: () => {} }; }
export function aPortee() { try { return proximite.lister() || []; } catch (e) { return []; } }
const compterPortee = (id) => aPortee().reduce((s, it) => s + (it.id === id ? (it.qty || 1) : 0), 0);
// Sur soi + à portée de main.
export function countDispo(id, p) { return countItem(id, p) + compterPortee(id); }
export function hasTagDispo(tag, p) { return hasTag(tag, p) || aPortee().some(it => { const d = def(it.id); return !!(d && (d.usage || []).includes(tag)); }); }
export function objetsAvecTagDispo(tag, p) {
  const r = objetsAvecTag(tag, p);
  for (const it of aPortee()) { const d = def(it.id); if (d && (d.usage || []).includes(tag) && !r.includes(it.id)) r.push(it.id); }
  return r;
}
// Retire d'abord du sac, puis de ce qui est à portée (le sol, les rangements). → nombre retiré.
export function retirerDispo(id, qty = 1, p) {
  let n = removeItem(id, qty, p);
  if (n >= qty) return n;
  const pris = [];
  for (const it of aPortee()) {
    if (n >= qty) break;
    if (it.id !== id) continue;
    const k = Math.min(qty - n, it.qty || 1);
    pris.push({ src: it.src, id, qty: k }); n += k;
  }
  if (pris.length) { try { proximite.prendre(pris); } catch (e) { console.warn('[inv] à portée', e); } }
  return n;
}

// ---------- Volume (litres) ----------
// Volume d'UN exemplaire. Vêtement plié : `volume`, sinon 0,5 + 2,5 × poids (un sac vide : 15 % de sa contenance).
export function volumeDe(id) {
  const c = CLOTHES[id];
  if (c) {
    if (c.volume != null) return c.volume;
    const plie = 0.5 + 2.5 * (c.poids || 0);
    return Math.round((c.slot === 'sac' ? Math.max(plie, 0.15 * contenanceSac(id)) : plie) * 10) / 10;
  }
  const d = def(id); if (!d) return 0;
  if (d.volume != null) return d.volume;
  const V = I().VOLUME_DEFAUT; return V[Math.min(V.length - 1, Math.max(0, d.espace || 0))];
}
export const estLong = (id) => { const d = def(id); return !!(d && d.long); };
// Encombrant (un gros poste radio) : ni dans le sac, ni dans le dos — à deux mains, ou posé.
export const estEncombrant = (id) => { const d = def(id); return !!(d && d.encombrant); };
// Petit objet : il entre dans une poche.
export const estPetit = (id) => volumeDe(id) <= I().POCHE_MAX_L;
export function contenanceSac(id) { const c = CLOTHES[id]; if (!c || c.slot !== 'sac') return 0; return c.contenance ?? Math.round((c.espace || 0) * I().CONTENANCE_PAR_ESPACE); }
// Capacités : poches (petits objets) + sac (tout).
export function capacites(p) {
  p = joueur(p); let poches = I().POCHES_L;
  for (const s of SLOTS_VETEMENT) { const c = CLOTHES[p.equip[s]]; if (c && c.slot !== 'sac' && c.espace) poches += c.espace; }
  const sac = contenanceSac(p.equip.sac);
  return { poches, sac, total: poches + sac };
}
// Occupation : les petits objets vont d'abord dans les poches, le reste (et tout ce qui est gros) au sac.
export function occupation(p) {
  p = joueur(p); let petits = 0, gros = 0;
  for (const it of p.inventaire) {
    if (p.accesRapide.includes(it.id)) continue;           // accroché à la ceinture : ne prend pas de place
    const v = volumeDe(it.id) * (it.qty || 1);
    if (estPetit(it.id)) petits += v; else gros += v;
  }
  const cap = capacites(p);
  const enPoche = Math.min(petits, cap.poches);
  const r1 = (x) => Math.round(x * 10) / 10;
  return { petits: r1(petits), gros: r1(gros), poches: r1(enPoche), sac: r1(gros + petits - enPoche), total: r1(petits + gros) };
}
// Combien d'exemplaires de `id` tiennent encore (poches + sac).
export function combienTient(id, qty = 1, p) {
  p = joueur(p); const v = volumeDe(id);
  if (estEncombrant(id)) return 0;
  if (v <= 0) return qty;
  const cap = capacites(p), o = occupation(p);
  const libreTotal = cap.total - o.total + 1e-9;
  let n = Math.floor(libreTotal / v);
  if (!estPetit(id)) n = Math.min(n, Math.floor((cap.sac - o.gros - Math.max(0, o.petits - cap.poches) + 1e-9) / v));
  return Math.max(0, Math.min(qty, n));
}
// Pourquoi ça ne rentre pas (texte court) — ou null.
export function raisonPlace(id, p) {
  p = joueur(p);
  if (combienTient(id, 1, p) >= 1) return null;
  if (estEncombrant(id)) return 'Trop encombrant pour un sac : ça se porte à deux mains.';
  if (!estPetit(id) && !p.equip.sac) return estLong(id) ? 'Trop grand pour tes poches : à porter en main ou dans le dos.' : 'Trop gros pour tes poches : il te faut un sac.';
  return 'Plus de place dans ton sac.';
}
// Compatibilité (anciens appels en « emplacements ») : tout est désormais en litres.
export const espaceDe = (id) => volumeDe(id);
export function espaceMax(p) { return capacites(p).total; }
export function espaceUtilise(p) { return occupation(p).total; }
export function placeLibre(p) { p = joueur(p); return Math.max(0, Math.round((capacites(p).total - occupation(p).total) * 10) / 10); }

// ---------- Poids ----------
function poidsItem(it) { const d = def(it.id); return ((d && d.poids) || 0) * (it.reste ?? 1) * (it.qty || 1) + (it.eau ? it.eau.L : 0); }
export function poidsPorte(p) {
  p = joueur(p); let kg = 0;
  for (const it of p.inventaire) kg += poidsItem(it);
  for (const [slot, id] of Object.entries(p.equip || {})) {
    if (!id || typeof id !== 'string') continue;
    const d = def(id); let w = (d && d.poids) || 0;
    const e = p.equipEtat && p.equipEtat[slot];
    if (e && e.eau) w += e.eau.L;
    if (slot === 'dos') w *= I().DOS_POIDS;
    kg += w;
  }
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
export function bilan(p) {
  p = joueur(p); const sp = surpoids(p), cap = capacites(p), o = occupation(p);
  return { ...sp, espace: o.total, espaceMax: cap.total, volume: o.total, volumeMax: cap.total,
    poches: { utilise: o.poches, max: cap.poches }, sac: { utilise: o.sac, max: cap.sac } };
}

// ---------- Ajout / retrait ----------
// addItem(id, qty, inst) : range dans les poches / le sac ; ce qui ne rentre pas (volume) est posé au sol.
// → { ajoute, auSol }
// opts.siPlein === 'tri' : le surplus part dans la pile « à trier » (le joueur choisit ce qu'il garde) au lieu du sol.
export function addItem(id, qty = 1, inst = {}, p, opts = {}) {
  p = joueur(p); const d = def(id);
  if (!d) { console.warn('[inventaire] objet inconnu', id); return { ajoute: 0, auSol: 0 }; }
  if (qty <= 0) return { ajoute: 0, auSol: 0 };
  const tient = combienTient(id, qty, p);
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
  if (reste > 0 && opts.siPlein === 'tri') {
    const item = { id, qty: reste, ...inst };
    if (d.dur && item.dur == null && d.type === 'arme') { item.dur = d.dur; item.durMax = d.dur; }
    mettreATrier(item);
    emit('inventaire', { ajout: id, qty: ajoute });
    return { ajoute, auSol: 0, aTrier: reste };
  }
  if (reste > 0) {
    const item = { id, qty: reste, ...inst };
    if (d.dur && item.dur == null && d.type === 'arme') { item.dur = d.dur; item.durMax = d.dur; }
    try { sol.deposer(item); } catch (e2) { console.warn('[inventaire] dépôt au sol impossible', e2); }
    emit('toast', { texte: `${raisonPlace(id, p) || 'Plus de place.'} Laissé par terre : ${d.nom}${reste > 1 ? ' ×' + reste : ''}.`, type: 'alerte' });
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
// Tout ce que le joueur a sur lui qui porte un tag d'usage (sac + mains + dos + lampe).
export function objetsAvecTag(tag, p) {
  p = joueur(p); const r = [];
  for (const it of p.inventaire) { const d = def(it.id); if (d && (d.usage || []).includes(tag)) r.push(it.id); }
  for (const s of ['arme', 'mainG', 'dos', 'lampe']) { const id = p.equip[s]; const d = id && def(id); if (d && (d.usage || []).includes(tag)) r.push(id); }
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
// Une seule unité d'une pile du sol (pour la consommer sur place). → item { id, qty: 1, …état } | null
export function prendreUnAuSol(indexSol) {
  const s = objetsAuSol()[indexSol]; if (!s) return null;
  const it = sol.prendre(indexSol, 1); if (!it) return null;
  if ((it.qty || 1) > 1) { sol.deposer({ ...it, qty: it.qty - 1 }); return { ...it, qty: 1 }; }  // fournisseur sans « qty »
  emit('inventaire', { sol: true });
  return it;
}
export function ramasser(indexSol, p) {
  p = joueur(p); const item = sol.prendre(indexSol); if (!item) return { ajoute: 0, auSol: 0 };
  const { id, qty, ...inst } = item;
  return addItem(id, qty || 1, inst, p);
}

// ---------- À trier : ce qu'on t'a donné et qui ne rentre pas ----------
// Une scène (voiture fouillée, cadeau, butin de rencontre) donne plus que ce que tu peux porter : au lieu de tomber
// au sol sans prévenir, le surplus attend ici. Le panneau du sac ouvre l'onglet « À trier » : on prend, on laisse des
// affaires de son sac pour faire de la place, puis « Terminé » abandonne le reste sur place.
let aTrier = [];
export function listeATrier() { return aTrier; }
export function mettreATrier(item) {
  const pile = !aEtat(item) && aTrier.find(x => x.id === item.id && !aEtat(x));
  if (pile) pile.qty += item.qty || 1; else aTrier.push({ ...item, qty: item.qty || 1 });
  emit('inventaire', { tri: true });
  emit('tri', { n: aTrier.length });
}
// Prendre la i-ème pile à trier (ce qui rentre). → { ok, raison? }
export function prendreATrier(i, p) {
  p = joueur(p); const it = aTrier[i]; if (!it) return { ok: false };
  const { id, qty, ...inst } = it;
  const n = Math.min(qty, combienTient(id, qty, p));
  if (n < 1) return { ok: false, raison: raisonPlace(id, p) || 'Plus de place.' };
  addItem(id, n, inst, p);
  it.qty -= n; if (it.qty <= 0) aTrier.splice(i, 1);
  emit('inventaire', { tri: true });
  return { ok: true };
}
// Porter directement (sac à dos, vêtement, arme en main…) la i-ème pile à trier.
export function porterATrier(i, p) {
  p = joueur(p); const it = aTrier[i]; if (!it) return { ok: false };
  const un = { ...it, qty: 1 };
  const r = porterObjet(un, p);
  if (r && r.ok) { it.qty -= 1; if (it.qty <= 0) aTrier.splice(i, 1); emit('inventaire', { tri: true }); }
  return r || { ok: false };
}
// Laisser une affaire du sac pour faire de la place : elle rejoint la pile à trier.
export function laisserPourTri(index, qty, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return false;
  const sorti = removeIndex(index, qty ?? it.qty, p);
  if (sorti) mettreATrier(sorti);
  return !!sorti;
}
// Fin du tri : ce qui reste est abandonné sur place (au sol si on est dans un lieu). → la liste abandonnée
export function finirTri() {
  const reste = aTrier; aTrier = [];
  for (const it of reste) { try { sol.deposer(it); } catch (e) { /* en voyage : laissé au bord de la route */ } }
  if (reste.length) emit('inventaire', { tri: true, sol: true });
  return reste;
}

// ---------- Sac porté ----------
export function sacPorte(p) { p = joueur(p); const id = p.equip.sac; const c = id && CLOTHES[id]; return c ? { id, nom: c.nom, espace: contenanceSac(id), contenance: contenanceSac(id), portage: c.portage || 0 } : null; }

// ---------- Mains et dos ----------
// Une instance « tenue » (main droite, main gauche, dos) garde tout son état dans equipEtat[slot].
function instanceTenue(slot, p) { const id = p.equip[slot]; return id ? { id, qty: 1, ...(p.equipEtat[slot] || {}) } : null; }
function poserTenue(slot, inst, p) {
  const { id, qty, ...etat } = inst;
  const d = def(id);
  if (d && d.dur && etat.dur == null && d.type === 'arme') { etat.dur = d.dur; etat.durMax = d.dur; }
  p.equip[slot] = id; p.equipEtat[slot] = etat;
}
function viderTenue(slot, p) { const inst = instanceTenue(slot, p); p.equip[slot] = null; delete p.equipEtat[slot]; if (slot === 'arme') p.deuxMains = false; return inst; }
// Range une instance dans le sac (ou au sol si elle ne rentre pas).
function ranger(inst, p) { if (!inst) return; const { id, qty, ...etat } = inst; addItem(id, qty || 1, etat, p); }
// Ce qui quitte la main droite retourne d'où il vient (façon Project Zomboid) : dans le dos s'il en sortait
// et que le dos est libre ; sinon au sac (un objet de la ceinture reste accroché à la ceinture).
function rangerOrigine(inst, p) {
  if (!inst) return;
  const o = (p.equipOrigine || {}).arme; if (p.equipOrigine) p.equipOrigine.arme = null;
  if (o === 'dos' && !p.equip.dos && peutDos(inst.id)) { poserTenue('dos', inst, p); return; }
  ranger(inst, p);
}
function origine(p, slot, v) { p.equipOrigine = p.equipOrigine || {}; p.equipOrigine[slot] = v; }
// La main gauche est-elle libre (ni objet, ni lampe tenue, ni arme à deux mains) ?
export function mainGaucheLibre(p) { p = joueur(p); return !p.equip.mainG && !lampeTenue(p.equip.lampe) && !p.deuxMains; }
// Ce que les mains tiennent : { droite, gauche, deux, uneMainPenalite }
export function mains(p) {
  p = joueur(p);
  const droite = p.equip.arme || null;
  const gauche = p.equip.mainG || (lampeTenue(p.equip.lampe) ? p.equip.lampe : null);
  const deux = !!(droite && p.deuxMains);
  return { droite, gauche, deux, uneMainPenalite: !!(droite && deuxMainsDef(droite) && !deux) };
}
// Peut-on sangler cet objet dans le dos ?
export function peutDos(id) { const d = def(id); if (!d || CLOTHES[id] || d.encombrant) return false; return !!d.long || volumeDe(id) >= I().DOS_VOLUME_MIN; }
// Où « porter » un objet trouvé (bouton Porter du butin) : 'vetement' | 'main' | 'dos' | 'lampe' | null.
export function ouPorter(id, p) {
  p = joueur(p);
  if (CLOTHES[id]) return 'vetement';
  if (estEncombrant(id)) return 'deux';
  if (estLampe(id)) return 'lampe';
  if (estArme(id) || (def(id) || {}).melee) return 'main';
  if (peutDos(id)) return p.equip.dos ? 'main' : 'dos';
  return null;
}
// Libérer la main gauche (objet → sac). Une lampe tenue retourne au sac aussi.
function libererGauche(p) {
  if (p.equip.mainG) ranger(viderTenue('mainG', p), p);
  if (lampeTenue(p.equip.lampe)) { emit('toast', { texte: 'La lampe retourne au sac pour libérer ta main.', type: 'info' }); desequiper('lampe', p, true); }
}
// Tenir l'objet d'index `index` du sac : main 'droite' | 'gauche' | 'deux'. → { ok, raison? }
export function tenir(index, main = 'droite', p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return { ok: false, raison: 'Objet introuvable.' };
  if (CLOTHES[it.id]) return { ok: false, raison: 'Ça se porte, ça ne se tient pas.' };
  const sorti = removeIndex(index, 1, p);
  return tenirInstance(sorti, main, p);
}
export function tenirInstance(inst, main = 'droite', p) {
  p = joueur(p); if (!inst) return { ok: false };
  if (main === 'deux') {
    if (p.equip.arme) rangerOrigine(viderTenue('arme', p), p);
    libererGauche(p);
    poserTenue('arme', inst, p); p.deuxMains = true;
  } else if (main === 'gauche') {
    if (p.equip.mainG) ranger(viderTenue('mainG', p), p);
    if (lampeTenue(p.equip.lampe)) desequiper('lampe', p, true);
    if (p.deuxMains) p.deuxMains = false;   // l'arme à deux mains passe à une main
    poserTenue('mainG', inst, p);
  } else {
    if (p.equip.arme) rangerOrigine(viderTenue('arme', p), p);
    poserTenue('arme', inst, p);
    // Une arme à deux mains se prend à deux mains si la main gauche est libre.
    p.deuxMains = deuxMainsDef(inst.id) && !p.equip.mainG && !lampeTenue(p.equip.lampe);
  }
  nettoyerAccesRapide(p);
  emit('inventaire', { equip: main === 'gauche' ? 'mainG' : 'arme' });
  return { ok: true, slot: main === 'gauche' ? 'mainG' : 'arme' };
}
// Passer l'objet de la main droite à deux mains / une main.
export function basculerDeuxMains(p) {
  p = joueur(p); if (!p.equip.arme) return { ok: false, raison: 'Rien en main droite.' };
  if (p.deuxMains) { p.deuxMains = false; emit('inventaire', { equip: 'arme' }); return { ok: true, deux: false }; }
  libererGauche(p); p.deuxMains = true;
  emit('inventaire', { equip: 'arme' });
  return { ok: true, deux: true };
}
// Échanger le contenu des deux mains (une lampe tenue reste à gauche).
export function echangerMains(p) {
  p = joueur(p);
  if (lampeTenue(p.equip.lampe)) return { ok: false, raison: 'Ta main gauche tient la lampe.' };
  const d = p.equip.arme ? viderTenue('arme', p) : null, g = p.equip.mainG ? viderTenue('mainG', p) : null;
  if (g) poserTenue('arme', g, p);
  if (d) poserTenue('mainG', d, p);
  p.deuxMains = false;
  emit('inventaire', { equip: 'arme' });
  return { ok: true };
}
// Dos : sangler l'objet du sac / d'une main ; reprendre en main.
export function mettreDos(index, p) {
  p = joueur(p); const it = p.inventaire[index]; if (!it) return { ok: false, raison: 'Objet introuvable.' };
  if (!peutDos(it.id)) return { ok: false, raison: 'Trop petit pour se sangler dans le dos.' };
  const sorti = removeIndex(index, 1, p);
  if (p.equip.dos) ranger(viderTenue('dos', p), p);
  poserTenue('dos', sorti, p);
  emit('inventaire', { equip: 'dos' });
  return { ok: true, slot: 'dos' };
}
export function mainVersDos(slot = 'arme', p) {
  p = joueur(p); const id = p.equip[slot]; if (!id) return { ok: false, raison: 'Main vide.' };
  if (!peutDos(id)) return { ok: false, raison: 'Trop petit pour le dos : range-le au sac.' };
  const inst = viderTenue(slot, p);
  if (slot === 'arme' && p.equipOrigine) p.equipOrigine.arme = null;
  if (p.equip.dos) { const ancien = viderTenue('dos', p); poserTenue(slot, ancien, p); if (slot === 'arme') { p.deuxMains = deuxMainsDef(ancien.id) && mainGaucheLibre(p); origine(p, 'arme', 'dos'); } }
  poserTenue('dos', inst, p);
  emit('inventaire', { equip: 'dos' });
  return { ok: true };
}
export function dosVersMain(p) {
  p = joueur(p); if (!p.equip.dos) return { ok: false, raison: 'Rien dans le dos.' };
  const inst = viderTenue('dos', p);
  if (p.equip.arme) { const ancien = viderTenue('arme', p); if (p.equipOrigine) p.equipOrigine.arme = null; if (peutDos(ancien.id)) poserTenue('dos', ancien, p); else ranger(ancien, p); }
  poserTenue('arme', inst, p);
  origine(p, 'arme', 'dos');
  p.deuxMains = deuxMainsDef(inst.id) && mainGaucheLibre(p);
  emit('inventaire', { equip: 'arme' });
  return { ok: true };
}

// Enfiler / prendre en main / sangler un objet SANS passer par le sac (marche même sac plein). → { ok, raison?, slot? }
export function porterObjet(item, p, ou = null) {
  p = joueur(p); if (!item) return { ok: false, raison: 'Rien à porter.' };
  ou = ou || ouPorter(item.id, p);
  if (!ou) return { ok: false, raison: 'Ça ne se porte pas.' };
  const { id, qty, ...inst } = item;
  const d = def(id);
  let r;
  if (ou === 'main' || ou === 'droite' || ou === 'gauche' || ou === 'deux') r = tenirInstance({ id, qty: 1, ...inst }, ou === 'main' ? 'droite' : ou, p);
  else if (ou === 'dos') {
    if (!peutDos(id)) return { ok: false, raison: 'Trop petit pour le dos.' };
    if (p.equip.dos) ranger(viderTenue('dos', p), p);
    poserTenue('dos', { id, qty: 1, ...inst }, p); emit('inventaire', { equip: 'dos' }); r = { ok: true, slot: 'dos' };
  } else {
    const it = { id, qty: 1, ...inst };
    if (d && d.dur && it.dur == null && d.type === 'arme') { it.dur = d.dur; it.durMax = d.dur; }
    p.inventaire.push(it);
    r = equiper(p.inventaire.length - 1, p);
    if (!r.ok) { const i = p.inventaire.indexOf(it); if (i >= 0) p.inventaire.splice(i, 1); return r; }
  }
  if ((qty || 1) > 1) addItem(id, qty - 1, inst, p);
  emit('toast', { texte: `${ou === 'dos' ? 'Dans le dos' : ou === 'vetement' || ou === 'lampe' ? 'Tu portes' : 'En main'} : ${d ? d.nom : id}.`, type: 'objet' });
  return r;
}
// Porter directement un objet posé au sol (depuis le panneau « Au sol »).
export function equiperDepuisSol(indexSol, p, ou = null) {
  p = joueur(p); const item = sol.prendre(indexSol); if (!item) return { ok: false, raison: 'Plus rien ici.' };
  const r = porterObjet(item, p, ou);
  if (!r.ok) { try { sol.deposer(item); } catch (e) {} }
  return r;
}

// ---------- Équipement ----------
// Emplacement « naturel » : vêtement → son emplacement, arme → main droite, lampe → lampe.
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
  if (slot === 'arme') return tenir(index, 'droite', p);
  if (slot === 'lampe' && lampeTenue(it.id)) {
    if (p.deuxMains) return { ok: false, raison: 'Tes deux mains tiennent déjà l\'arme. Prends une frontale, ou passe l\'arme à une main.' };
    if (p.equip.mainG) return { ok: false, raison: `Ta main gauche tient déjà : ${nomObjet(p.equip.mainG)}.` };
  }
  const sorti = removeIndex(index, 1, p);
  // l'ancien vêtement / sac : on enfile d'abord le nouveau, puis l'ancien rejoint le sac (rangé avec la NOUVELLE place)
  let ancien = null;
  if (p.equip[slot]) {
    if (SLOTS_TENUS.includes(slot)) desequiper(slot, p, true);
    else { ancien = { id: p.equip[slot], inst: slot === 'lampe' ? { charge: (p.equipEtat[slot] || {}).charge || 0 } : {} }; p.equip[slot] = null; delete p.equipEtat[slot]; }
  }
  p.equip[slot] = it.id;
  if (slot === 'lampe') { const src = REGLAGES.lumiere.SOURCES[it.id] || {}; p.equipEtat.lampe = { charge: sorti.charge ?? Math.round((src.minParCharge || 0) * 0.6), allumee: false }; }
  // un sac plus petit (ou un vêtement sans poches) : ce qui ne tient plus tombe par terre
  const tombes = deborder(p);
  if (ancien) addItem(ancien.id, 1, ancien.inst, p);
  avertirDebordement(tombes, slot === 'sac' ? 'Ton nouveau sac est plus petit' : 'Moins de poches');
  nettoyerAccesRapide(p);
  emit('inventaire', { equip: slot });
  return { ok: true, slot };
}
// Ce qui ne tient plus (sac plus petit, sac retiré, vêtement à poches enlevé) est posé au sol : les plus gros objets
// d'abord, pour en laisser le moins possible. → [{ id, qty, … }] ce qui est tombé. En voyage (pas de sol) : « À trier ».
export function deborder(p) {
  p = joueur(p); const tombes = [];
  for (let garde = 0; garde < 400; garde++) {
    const cap = capacites(p), o = occupation(p);
    const exces = o.sac - cap.sac;
    if (exces <= 1e-6) break;
    // trop de gros objets pour le sac : ce sont eux qui sortent ; sinon les petits qui débordent des poches
    const grosTrop = o.gros > cap.sac + 1e-6;
    let best = -1, bv = -1;
    p.inventaire.forEach((it, i) => {
      if (p.accesRapide.includes(it.id)) return;
      if (grosTrop && estPetit(it.id)) return;
      const v = volumeDe(it.id); if (v > bv) { bv = v; best = i; }
    });
    if (best < 0 || bv <= 0) break;
    const it = p.inventaire[best];
    const n = Math.max(1, Math.min(it.qty || 1, Math.ceil((exces - 1e-6) / bv)));
    const sorti = removeIndex(best, n, p);
    if (!sorti) break;
    try { sol.deposer(sorti); } catch (e) { mettreATrier(sorti); }
    const deja = tombes.find(x => x.id === sorti.id);
    if (deja) deja.qty += sorti.qty || 1; else tombes.push({ ...sorti });
  }
  if (tombes.length) emit('inventaire', { sol: true });
  return tombes;
}
function avertirDebordement(tombes, pourquoi) {
  if (!tombes || !tombes.length) return;
  const liste = tombes.map(t => `${nomObjet(t.id)}${(t.qty || 1) > 1 ? ' ×' + t.qty : ''}`).join(', ');
  emit('toast', { texte: `${pourquoi} : tout ne tient plus. Posé par terre : ${liste}.`, type: 'alerte' });
}
// Retirer (vers le sac ; ce qui ne tient pas va au sol).
export function desequiper(slot, p, silencieux = false) {
  p = joueur(p); const id = p.equip[slot]; if (!id) return false;
  if (SLOTS_TENUS.includes(slot)) { ranger(viderTenue(slot, p), p); }
  else {
    const etat = p.equipEtat[slot] || {};
    p.equip[slot] = null; delete p.equipEtat[slot];
    const inst = {};
    if (slot === 'lampe') inst.charge = etat.charge || 0;
    // sans ce sac (ou ce vêtement à poches), le surplus tombe d'abord ; puis on range ce qu'on vient d'ôter
    const tombes = deborder(p);
    addItem(id, 1, inst, p);
    avertirDebordement(tombes, slot === 'sac' ? 'Sans sac' : 'Moins de poches');
  }
  nettoyerAccesRapide(p);
  if (!silencieux) emit('inventaire', { desequip: slot });
  return true;
}
export function chaleurVetements(p) {
  p = joueur(p); let c = 0; for (const s of SLOTS_VETEMENT) { const v = CLOTHES[p.equip[s]]; if (v) c += v.chaleur || 0; } return c;
}
export function impermeable(p) { p = joueur(p); return SLOTS_VETEMENT.some(s => CLOTHES[p.equip[s]] && CLOTHES[p.equip[s]].impermeable); }
// Sous la pluie : à quelle vitesse on se mouille (1 = rien ne protège). C'est le haut du corps qui compte
// (poncho, veste de feu) ; des bottes ou un chapeau imperméables aident un peu.
const HAUT_DU_CORPS = ['haut', 'torse', 'veste'];
export function facteurPluie(p) {
  p = joueur(p); const R = REGLAGES.survie.MOUILLE; let f = 1;
  for (const s of SLOTS_VETEMENT) { const v = CLOTHES[p.equip[s]]; if (v && v.impermeable) f *= HAUT_DU_CORPS.includes(s) ? R.IMPERMEABLE : R.IMPERMEABLE_AUTRE; }
  return f;
}
export function protectionZone(zone, p) {
  p = joueur(p); let pr = 0;
  for (const s of SLOTS_VETEMENT) {
    const id = p.equip[s], c = CLOTHES[id]; if (!c || !c.protection) continue;
    const couvre = c.couvre || COUVRE_DEFAUT[c.slot] || { tete: ['à la tête'], torse: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'], mains: ['à la main'], jambes: ['à la cuisse', 'au genou', 'au mollet'], pieds: ['au pied', 'à la cheville'] }[c.slot] || [];
    if (couvre.includes(zone)) pr = Math.max(pr, c.protection);
  }
  return pr;
}

// ---------- Accès rapide ----------
export function accesRapideMax(p) {
  p = joueur(p); let n = 0;
  for (const s of ['ceinture', 'holster', 'torse', 'veste', 'sac']) { const c = CLOTHES[p.equip[s]]; if (c && c.accesRapide) n += c.accesRapide; }
  return Math.min(n, I().ACCES_RAPIDE_MAX);
}
function nettoyerAccesRapide(p) {
  // un objet de la ceinture tenu en main reste « à la ceinture » : il y retourne quand on le range
  p.accesRapide = p.accesRapide.filter(id => p.inventaire.some(it => it.id === id) || p.equip.arme === id || p.equip.mainG === id);
  const max = accesRapideMax(p);
  if (p.accesRapide.length > max) p.accesRapide.length = max;
}
// Ranger ce que tient la main droite là d'où il vient (dos, ceinture, sac). → { ok, ou?, raison? }
export function rangerMain(p) {
  p = joueur(p); if (!p.equip.arme) return { ok: false, raison: 'Main vide.' };
  const id = p.equip.arme, o = (p.equipOrigine || {}).arme;
  const inst = viderTenue('arme', p);
  let ou = 'sac';
  if (o === 'dos' && !p.equip.dos && peutDos(id)) { poserTenue('dos', inst, p); ou = 'dos'; }
  else { ranger(inst, p); if (p.accesRapide.includes(id)) ou = 'ceinture'; }
  if (p.equipOrigine) p.equipOrigine.arme = null;
  emit('inventaire', { equip: 'arme' });
  return { ok: true, ou };
}
// Touche d'accès rapide i (1-4) : sortir l'objet de la ceinture en main droite, ou l'y remettre s'il y est déjà.
export function basculerRapide(i, p) {
  p = joueur(p); const id = p.accesRapide[i]; if (!id) return { ok: false, raison: 'Rien à cet emplacement.' };
  if (p.equip.arme === id) return rangerMain(p);
  if (p.equip.mainG === id) { ranger(viderTenue('mainG', p), p); emit('inventaire', { equip: 'mainG' }); return { ok: true, ou: 'ceinture' }; }
  const k = p.inventaire.findIndex(x => x.id === id); if (k < 0) return { ok: false, raison: 'Tu ne l’as plus sur toi.' };
  const avant = p.accesRapide.slice();
  const r = tenir(k, 'droite', p);
  if (r.ok) { origine(p, 'arme', 'ceinture'); p.accesRapide = avant.filter(x => x === id || p.accesRapide.includes(x)); emit('inventaire', { accesRapide: true }); }
  return r;
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
export function userArme(n = 1, p, slot = 'arme') {
  p = joueur(p); const id = p.equip[slot]; const e = p.equipEtat[slot];
  if (!id || !e || e.dur == null) return null;
  const evite = REGLAGES.competences.EFFETS.entretien.usure * niveau('entretien', p);
  let perte = 0; for (let i = 0; i < n; i++) if (Math.random() >= evite) perte++;
  e.dur = Math.max(0, e.dur - perte);
  if (e.dur <= 0) {
    emit('toast', { texte: `${nomObjet(id)} : cassé${def(id).nom.endsWith('e') ? 'e' : ''}.`, type: 'mauvais' });
    p.equip[slot] = null; delete p.equipEtat[slot]; if (slot === 'arme') p.deuxMains = false;
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
  return { id, nom: nomObjet(id), ...src, recharge: src.charge || null, charge: e.charge || 0, allumee: !!e.allumee, frac: src.minParCharge ? Math.min(1, (e.charge || 0) / src.minParCharge) : 0 };
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
    else emit('toast', { texte: `${l.nom} : ${l.recharge === 'piles' ? 'piles mortes. Remplace-les (il te faut des piles).' : 'plus d\'huile.'}`, type: 'alerte' });
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
