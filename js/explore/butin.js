// ============ Exploration — fouille en temps réel et fenêtre de butin ============
// La fouille avance tant qu'on ne bouge pas ; les objets se révèlent au fil de la barre. Toucher un nom = l'action
// la plus utile (enfiler si ça se porte, sinon prendre). Rien ne se perd : un sac plein laisse l'objet dans le meuble.
import { G, noteJournal } from '../core/state.js';
import { emit } from '../core/bus.js';
import { el } from '../core/util.js';
import { DOCUMENTS } from '../data/histoire/documents.js';
import { mod, sfx, message, nomObjet, capitaliser } from './commun.js';

let V = null;
export function lierButin(v) { V = v; }

export async function commencerFouille(cle, nom, x, y) {
  const r = await V.canal.fouiller(cle);
  if (!V || r.erreur) return;
  sfx('tissu_dechire');
  V.fouille = { cle, nom: r.nom || nom, items: r.items, duree: Math.max(400, r.dureeMs), p: r.progres || 0, x, y, reveles: -1, tb: 0 };
  ouvrirButin(V.fouille);
  majRevele();
}
export function avancerFouille(dt) {
  const F = V.fouille, I = V.entrees.etat;
  if (Math.hypot(I.mx, I.my) > 0.3) { interrompreFouille(); return; }
  F.p = Math.min(1, F.p + dt / F.duree);
  majRevele();
  if (F.p >= 1) {
    V.canal.arreterFouille(1);
    V.fouille = null;
    if (!V.butin || !V.butin.items.length) { message(`Rien d'utile dans ${F.nom}.`); fermerButin(); }
    else { V.butin.fini = true; rendreButin(); sfx('loot'); }
  }
}
function majRevele() {
  const F = V.fouille; const n = F.items.length;
  let k = 0; for (let i = 0; i < n; i++) if (F.p >= (i + 1) / (n + 1)) k = i + 1;
  if (k !== F.reveles) { F.reveles = k; if (V.butin) { V.butin.visibles = k; rendreButin(); } if (k > 0) sfx('clic'); }
}
export function interrompreFouille() {
  if (!V || !V.fouille) return;
  V.canal.arreterFouille(V.fouille.p);
  V.fouille = null;
  if (V.butin && !V.butin.visibles) fermerButin();
  else if (V.butin) { V.butin.fini = true; rendreButin(); }
}
function ouvrirButin(F) {
  V.butin = { cle: F.cle, nom: F.nom, items: F.items, visibles: 0, fini: false, x: F.x, y: F.y };
  V.hud.butin.classList.remove('cache');
  rendreButin();
}
export function rendreButin() {
  const B = V.butin, h = V.hud.butin, inv = mod.inv; if (!B) return;
  h.textContent = '';
  h.append(el('div', { class: 'ex-butin-t' }, capitaliser(B.nom), el('span', {}, B.fini ? '' : ' — fouille…')));
  const ul = el('ul', { class: 'ex-butin-l' });
  for (let i = 0; i < B.visibles && i < B.items.length; i++) {
    const it = B.items[i];
    const tient = !inv || !inv.combienTient || inv.combienTient(it.id, it.qty || 1) >= (it.qty || 1);
    const ou = inv && inv.ouPorter ? inv.ouPorter(it.id) : null;
    const portable = !!ou;
    const libPorter = { vetement: 'Porter', lampe: 'Équiper', main: 'En main', dos: 'Dans le dos' }[ou] || 'Porter';
    ul.append(el('li', { class: (tient ? '' : 'plein') + (i >= (B.dejaVus || 0) ? ' neuf' : '') }, el('button', { class: 'ex-b-nom', type: 'button', onclick: () => (portable ? porterItem(i) : prendreItem(i)) }, nomObjet(it.id), it.qty > 1 ? el('em', {}, ' ×' + it.qty) : null),
      portable ? el('button', { class: 'ex-b', type: 'button', onclick: () => porterItem(i) }, libPorter) : null,
      el('button', { class: 'ex-b', type: 'button', disabled: tient ? null : true, title: tient ? null : (inv.raisonPlace && inv.raisonPlace(it.id)) || 'Plus de place', onclick: () => prendreItem(i) }, tient ? 'Prendre' : (inv.estPetit && !inv.estPetit(it.id) && !G.player.equip.sac ? 'Trop gros' : 'Sac plein'))));
  }
  B.dejaVus = Math.min(B.visibles, B.items.length);
  const reste = B.items.length - B.visibles;
  if (!B.fini && reste > 0) ul.append(el('li', { class: 'ex-butin-cache' }, '…'));
  if (B.fini && !B.items.length) ul.append(el('li', { class: 'ex-butin-cache' }, 'Vide.'));
  h.append(ul);
  if (inv && inv.placeLibre) {
    const sac = inv.sacPorte();
    const b = inv.bilan();
    const f = (n) => String(n).replace('.', ',');
    h.append(el('div', { class: 'ex-butin-place' }, sac ? `${sac.nom} : ${f(b.sac.utilise)} / ${b.sac.max} L · poches ${f(b.poches.utilise)} / ${f(b.poches.max)} L` : `Pas de sac : tes poches seulement (${f(b.poches.utilise)} / ${f(b.poches.max)} L, petits objets).`));
  }
  h.append(el('div', { class: 'ex-butin-a' },
    el('button', { class: 'ex-b ex-b-p', type: 'button', disabled: B.visibles ? null : true, onclick: prendreTout }, 'Tout prendre'),
    el('button', { class: 'ex-b', type: 'button', onclick: () => { interrompreFouille(); fermerButin(); } }, 'Fermer')));
}
function retirerDuButin(B, i) {
  B.items.splice(i, 1); B.visibles = Math.max(0, B.visibles - 1); B.dejaVus = Math.max(0, (B.dejaVus || 0) - 1);
  if (V.fouille && V.fouille.cle === B.cle) { V.fouille.items = B.items; V.fouille.reveles = Math.max(0, V.fouille.reveles - 1); }
}
async function prendreItem(i) {
  const B = V && V.butin, inv = mod.inv; if (!B || i >= B.visibles) return;
  const prevu = B.items[i];
  if (inv && inv.combienTient && inv.combienTient(prevu.id, prevu.qty || 1) < 1) {
    message(`${inv.raisonPlace(prevu.id) || 'Plus de place.'}${inv.ouPorter(prevu.id) ? ' Tu peux le porter directement.' : ''}`, 2600);
    return;
  }
  const it = await V.canal.prendre(B.cle, i);
  if (!it) return;
  retirerDuButin(B, i);
  donner(it);
  if (!B.items.length && B.fini) fermerButin(); else rendreButin();
}
async function porterItem(i) {
  const B = V && V.butin, inv = mod.inv; if (!B || i >= B.visibles || !inv || !inv.porterObjet) return;
  const it = await V.canal.prendre(B.cle, i);
  if (!it) return;
  retirerDuButin(B, i);
  const r = inv.porterObjet(it);
  if (r.ok && V.cbt) V.cbt.majStats();
  if (!r.ok) { donner(it); message(r.raison || 'Impossible de le porter.', 2200); }
  else sfx('loot');
  if (!B.items.length && B.fini) fermerButin(); else rendreButin();
}
export async function prendreTout() {
  const B = V && V.butin, inv = mod.inv; if (!B) return;
  if (inv && inv.sacPorte && !inv.sacPorte()) {
    const k = B.items.slice(0, B.visibles).findIndex(x => inv.slotDe(x.id) === 'sac');
    if (k >= 0) await porterItem(k);
    if (!V || V.butin !== B) return;
  }
  const laisses = [];
  let pris = 0;
  for (let i = B.visibles - 1; i >= 0; i--) {
    const prevu = B.items[i];
    if (inv && inv.combienTient && inv.combienTient(prevu.id, prevu.qty || 1) < (prevu.qty || 1)) { laisses.push(nomObjet(prevu.id)); continue; }
    const it = await V.canal.prendre(B.cle, i);
    if (it) { retirerDuButin(B, i); donner(it, true); pris++; }
  }
  if (pris) sfx('loot');
  if (laisses.length) message(`Sac plein : ${laisses.slice(0, 3).join(', ')}${laisses.length > 3 ? '…' : ''} reste${laisses.length > 1 ? 'nt' : ''} ici.`, 3200);
  else if (pris) message(`Tu prends ${pris} objet${pris > 1 ? 's' : ''}.`, 1400);
  if (B.fini && !B.items.length) fermerButin(); else rendreButin();
}
export function fermerButin() { if (!V) return; V.butin = null; V.hud.butin.classList.add('cache'); V.hud.butin.textContent = ''; }

export function donner(it, silencieux) {
  if (it.doc) { lireDocument(it.doc); return; }
  let auSol = 0;
  const inv = mod.inv;
  if (inv && inv.addItem) { const r = inv.addItem(it.id, it.qty || 1); auSol = (r && r.auSol) || 0; }
  else {
    const s = G.player.inventaire.find(x => x.id === it.id && x.dur == null && x.eau == null);
    if (s) s.qty += it.qty || 1; else G.player.inventaire.push({ id: it.id, qty: it.qty || 1 });
    emit('inventaire', { ajout: it.id });
  }
  if (!silencieux) message(auSol ? `${nomObjet(it.id)} : plus de place, posé au sol.` : `Pris : ${nomObjet(it.id)}${it.qty > 1 ? ' ×' + it.qty : ''}.`, 1600);
}
export async function ramasser(o) {
  const it = await V.canal.prendre('#sol:' + o.uid, 0);
  if (!it) return;
  if (it.doc) lireDocument(it.doc); else { donner(it); sfx('loot'); }
}
export function lireDocument(id) {
  if (!G.documents.includes(id)) { G.documents.push(id); const d = DOCUMENTS[id]; if (d) noteJournal(`Trouvé : ${d.titre}.`, 'document'); }
  sfx('clic');
  emit('document', { id });
}
// Le sol autour du joueur, vu depuis le panneau d'inventaire (poser / ramasser).
export function fournisseurSol() {
  const proches = () => (V && V.snap ? V.snap.sol.filter(o => !o.doc && o.etage === V.j.etage && Math.hypot(o.x - V.j.x, o.y - V.j.y) <= 1.6) : []);
  return {
    lister: () => proches().map(o => ({ id: o.id, qty: o.qty })),
    deposer: (item) => { if (V) V.canal.deposer({ etage: V.j.etage, x: V.j.x + Math.cos(V.j.dir) * 0.4, y: V.j.y + Math.sin(V.j.dir) * 0.4 }, item).then(() => { V && (V.snap = V.canal.instantane()); }); },
    prendre: (i) => { const o = proches()[i]; if (!o) return null; V.canal.prendre('#sol:' + o.uid, 0); V.snap.sol = V.snap.sol.filter(x => x !== o); return { id: o.id, qty: o.qty }; },
  };
}
