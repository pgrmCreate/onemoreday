// ============ Exploration — fouille en temps réel et fenêtre de butin ============
// La fouille avance tant qu'on ne bouge pas ; les objets se révèlent au fil de la barre. Toucher un nom = l'action
// la plus utile (enfiler si ça se porte, sinon prendre). Rien ne se perd : un sac plein laisse l'objet dans le meuble.
import { G, noteJournal } from '../core/state.js';
import { emit } from '../core/bus.js';
import { el } from '../core/util.js';
import { DOCUMENTS } from '../data/histoire/documents.js';
import { mod, sfx, message, nomObjet, capitaliser } from './commun.js';
import { CONSTRUCTIONS, tailleConstruction } from '../data/construction.js';
import { commandeTransfert, transfertEnCours } from '../ui/transferts.js';
import { choisirSac, comparaisonSac } from '../ui/sacs.js';
import { depotIci } from './missions_vue.js';

const boutonTransfert = (attrs, ...contenu) => commandeTransfert(el('button', attrs, ...contenu));

let V = null;
export function lierButin(v) { V = v; }

// rect { x0, y0, x1, y1 } : l'emprise du meuble — la fenêtre reste ouverte tant qu'on est à portée de son bord (une
// tente 3×3 se fouille depuis son flanc, loin de son centre)
// Le bruit de la fouille suit ce qu'on fouille : le type du meuble d'abord, sa catégorie sinon.
const FOUILLE_TYPE = { casier: 'fouille_metal', classeur: 'fouille_metal', rayonnage: 'fouille_metal', caisse_enreg: 'fouille_metal', etabli_meuble: 'fouille_metal',
  palette: 'fouille_bois', tas_bois: 'fouille_feuilles', buisson: 'fouille_feuilles' };
const FOUILLE_CAT = { bureau: 'fouille_bois', cuisine: 'fouille_bois', comptoir: 'fouille_bois', vetements: 'fouille_bois', table: 'fouille_bois', etagere: 'fouille_bois',
  machine: 'fouille_metal', frigo: 'fouille_metal', caisse: 'fouille_papier', poubelle: 'fouille_papier' };
function sonFouille(cle, m) {
  if (cle.startsWith('cad:')) return 'fouille_corps';   // des vêtements qu'on retourne
  return (m && (FOUILLE_TYPE[m.type] || FOUILLE_CAT[m.cat])) || 'fouille';
}

// m : le meuble fouillé, s'il y en a un (son bruit en dépend)
export async function commencerFouille(cle, nom, x, y, rect, m) {
  const r = await V.canal.fouiller(cle);
  if (!V || r.erreur) return;
  if (r.verrouillee) { message(`${capitaliser(r.nom || nom)} est fermée à clé : il faut casser une vitre.`); return; }
  V.fouille = { cle, nom: r.nom || nom, items: r.items, duree: depotIci(cle) ? 400 : Math.max(400, r.dureeMs),   // on vient y ranger : on ne le fouille pas
    p: r.progres || 0, x, y, rect, reveles: -1, tb: 0, nomSon: sonFouille(cle, m), tSon: 0, son: null };
  if (m && m.cat === 'voiture') { sfx('portiere'); V.fouille.tSon = 2200; }   // la portière d'abord, on fouille ensuite
  ouvrirButin(V.fouille);
  majRevele();
}
export function avancerFouille(dt) {
  const F = V.fouille, I = V.entrees.etat;
  if (Math.hypot(I.mx, I.my) > 0.3) { interrompreFouille(); return; }
  F.p = Math.min(1, F.p + dt / F.duree);
  // le bruit de la fouille, relancé à la fin du précédent tant qu'on fouille
  F.tSon -= dt; if (F.tSon <= 0) { F.son = sfx(F.nomSon); F.tSon = F.son ? F.son.duree * 1000 - 300 : 5200; }
  majRevele();
  if (F.p >= 1) {
    V.canal.arreterFouille(1);
    if (F.son) F.son.stop();
    V.fouille = null;
    // la caisse du camp, le tas de bois : on est venu y ranger quelque chose — la fenêtre s'ouvre sur « Ranger », même vide
    if (V.butin && depotIci(F.cle)) { V.butin.fini = true; V.butin.ranger = true; rendreButin(); }
    else if (!V.butin || !V.butin.items.length) { message(`Rien d'utile dans ${F.nom}.`); fermerButin(); }
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
  if (V.fouille.son) V.fouille.son.stop();
  V.fouille = null;
  if (V.butin && !V.butin.visibles) fermerButin();
  else if (V.butin) { V.butin.fini = true; rendreButin(); }
}
function ouvrirButin(F) {
  V.butin = { cle: F.cle, nom: F.nom, items: F.items, visibles: 0, fini: false, x: F.x, y: F.y, rect: F.rect };
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
    const libPorter = { vetement: 'Porter', lampe: 'Équiper', main: 'En main', dos: 'Dans le dos', deux: 'À deux mains' }[ou] || 'Porter';
    const libConso = mod.survie && mod.survie.libelleConsommer ? mod.survie.libelleConsommer(it.id) : null;
    ul.append(el('li', { class: (tient ? '' : 'plein') + (i >= (B.dejaVus || 0) ? ' neuf' : '') }, boutonTransfert({ class: 'ex-b-nom', type: 'button', onclick: () => (portable ? porterItem(i) : prendreItem(i)) }, nomObjet(it.id), it.qty > 1 ? el('em', {}, ' ×' + it.qty) : null, el('span', { class: 'sac-ecart' }, comparaisonSac(it.id))),
      portable ? boutonTransfert({ class: 'ex-b', type: 'button', onclick: () => porterItem(i) }, libPorter) : null,
      libConso ? boutonTransfert({ class: 'ex-b', type: 'button', onclick: () => consommerItem(i) }, libConso) : null,
      boutonTransfert({ class: 'ex-b', type: 'button', disabled: tient ? null : true, title: tient ? null : (inv.raisonPlace && inv.raisonPlace(it.id)) || 'Plus de place', onclick: () => prendreItem(i) }, tient ? 'Prendre' : (inv.estPetit && !inv.estPetit(it.id) && !inv.capacites().sac ? 'Trop gros' : 'Sac plein'))));
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
  // Ranger : poser ses affaires dans une caisse construite (ou un meuble déjà fouillé)
  if (B.fini && inv) {
    if (B.ranger) {
      // par terre : pas de limite de place ; un meuble ou une caisse : sa contenance
      const cap = B.sol ? Infinity : capaciteRangement(B), occ = B.items.reduce((s, it) => s + inv.volumeDe(it.id) * (it.qty || 1), 0);
      if (!B.sol) h.append(el('div', { class: 'ex-butin-place' }, `Place : ${fmt(occ)} / ${cap} L`));
      const ul2 = el('ul', { class: 'ex-butin-l' });
      G.player.inventaire.forEach((it, i) => {
        const v = inv.volumeDe(it.id) * (it.qty || 1), tient = occ + v <= cap + 1e-6;
        if (B.sol) { ul2.append(el('li', {}, el('span', { class: 'ex-b-nom' }, nomObjet(it.id), it.qty > 1 ? el('em', {}, ' ×' + it.qty) : null), boutonTransfert({ class: 'ex-b', type: 'button', onclick: () => poserItem(i) }, 'Poser'))); return; }
        ul2.append(el('li', { class: tient ? '' : 'plein' }, el('span', { class: 'ex-b-nom' }, nomObjet(it.id), it.qty > 1 ? el('em', {}, ' ×' + it.qty) : null),
          boutonTransfert({ class: 'ex-b', type: 'button', disabled: tient ? null : true, onclick: () => rangerItem(i) }, tient ? 'Ranger' : 'Trop gros')));
      });
      // ce qu'on tient en main ou dans le dos (une branche, sans sac : on la porte à bras)
      for (const [slot, lib] of [['arme', 'en main'], ['dos', 'dans le dos']]) {
        const id = G.player.equip[slot]; if (!id || B.sol) continue;
        const v = inv.volumeDe(id), tient = occ + v <= cap + 1e-6;
        ul2.append(el('li', { class: tient ? '' : 'plein' }, el('span', { class: 'ex-b-nom' }, nomObjet(id), el('em', {}, ' (' + lib + ')')),
          boutonTransfert({ class: 'ex-b', type: 'button', disabled: tient ? null : true, onclick: () => rangerTenue(slot) }, tient ? 'Ranger' : 'Trop gros')));
      }
      if (!G.player.inventaire.length && !G.player.equip.arme && !G.player.equip.dos) ul2.append(el('li', { class: 'ex-butin-cache' }, 'Ton sac est vide.'));
      h.append(ul2);
    }
  }
  h.append(el('div', { class: 'ex-butin-a' },
    boutonTransfert({ class: 'ex-b ex-b-p', type: 'button', disabled: B.visibles ? null : true, onclick: prendreTout }, 'Tout prendre'),
    B.fini ? el('button', { class: 'ex-b', type: 'button', onclick: () => { B.ranger = !B.ranger; rendreButin(); } }, B.ranger ? (B.sol ? 'Fini' : 'Fini de ranger') : (B.sol ? 'Poser…' : 'Ranger…')) : null,
    el('button', { class: 'ex-b', type: 'button', onclick: () => { interrompreFouille(); fermerButin(); } }, 'Fermer')));
}
const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
// Contenance (litres) : une caisse construite selon son plan, un meuble 30 L, un corps 10 L.
function capaciteRangement(B) {
  if (B.cle.startsWith('#c:')) { const c = ((V.snap && V.snap.constructions) || []).find(q => q.uid === B.cle.slice(3)); return (c && CONSTRUCTIONS[c.type] && CONSTRUCTIONS[c.type].contenance) || 60; }
  return B.cle.startsWith('cad:') ? 10 : 30;
}
// Par terre : poser une affaire du sac à ses pieds, la fenêtre se met à jour.
function poserItem(i) {
  if (transfertEnCours()) return;
  const B = V && V.butin, inv = mod.inv; if (!B || !inv) return;
  const it = G.player.inventaire[i]; if (!it) return;
  inv.poser(i, it.qty || 1);
  sfx('tissu_dechire', { volume: 0.3 });
  setTimeout(() => {
    if (!V || V.butin !== B) return;
    const objets = solProche();
    B.uids = objets.map(o => o.uid); B.items = objets.map(o => { const { uid: _u, etage: _e, x: _x, y: _y, ...r } = o; return r; });
    B.visibles = B.dejaVus = B.items.length;
    rendreButin();
  }, 80);
}
// Ranger ce qu'on tient en main ou dans le dos.
async function rangerTenue(slot) {
  if (transfertEnCours()) return;
  const B = V && V.butin, inv = mod.inv; if (!B || !inv || !inv.sortirTenue) return;
  const sorti = inv.sortirTenue(slot); if (!sorti) return;
  const r = await V.canal.ranger(B.cle, sorti);
  if (r && r.attente) return;
  if (!r || !r.ok) { inv.tenirInstance(sorti, 'droite'); message('Impossible de le ranger ici.', 1800); rendreButin(); return; }
  B.items.push({ ...sorti, qty: sorti.qty || 1 }); B.visibles = B.dejaVus = B.items.length;
  sfx('loot'); rendreButin();
}
async function rangerItem(i) {
  if (transfertEnCours()) return;
  const B = V && V.butin, inv = mod.inv; if (!B || !inv) return;
  const it = G.player.inventaire[i]; if (!it) return;
  const sorti = inv.removeIndex(i, it.qty || 1); if (!sorti) return;
  const r = await V.canal.ranger(B.cle, sorti);
  if (r && r.attente) return; // après coupure, le reçu décidera si l'objet est dans le rangement ou revient au sac
  if (!r || !r.ok) { const { id, qty, ...etat } = sorti; inv.addItem(id, qty || 1, etat); message('Impossible de le ranger ici.', 1800); rendreButin(); return; }
  const pile = !Object.keys(sorti).some(k => k !== 'id' && k !== 'qty') && B.items.find(x => x.id === sorti.id && !Object.keys(x).some(k => k !== 'id' && k !== 'qty'));
  if (pile) pile.qty = (pile.qty || 1) + (sorti.qty || 1); else B.items.push({ ...sorti });
  B.visibles = B.items.length; B.dejaVus = B.items.length;
  sfx('tissu_dechire', { volume: 0.4 });
  rendreButin();
}
// Prendre la i-ème ligne de la fenêtre : un meuble (par son rang), ou le sol (par l'objet lui-même).
function prendreDe(B, i, qty) {
  if (B.sol) return V.canal.prendre('#sol:' + B.uids[i], 0, qty);
  return V.canal.prendre(B.cle, i, qty);
}
function retirerDuButin(B, i) {
  if (B.uids) B.uids.splice(i, 1);
  B.items.splice(i, 1); B.visibles = Math.max(0, B.visibles - 1); B.dejaVus = Math.max(0, (B.dejaVus || 0) - 1);
  if (V.fouille && V.fouille.cle === B.cle) { V.fouille.items = B.items; V.fouille.reveles = Math.max(0, V.fouille.reveles - 1); }
}
async function prendreItem(i) {
  if (transfertEnCours()) return;
  const B = V && V.butin, inv = mod.inv; if (!B || i >= B.visibles) return;
  const prevu = B.items[i];
  if (inv && inv.combienTient && inv.combienTient(prevu.id, prevu.qty || 1) < 1) {
    message(`${inv.raisonPlace(prevu.id) || 'Plus de place.'}${inv.ouPorter(prevu.id) ? ' Tu peux le porter directement.' : ''}`, 2600);
    return;
  }
  const it = await prendreDe(B, i);
  if (!it) return;
  retirerDuButin(B, i);
  donner(it);
  if (!B.items.length && B.fini) fermerButin(); else rendreButin();
}
// Manger / boire / se soigner sur place avec ce qu'on vient de trouver (sans le prendre). Le reste d'une boîte entamée est gardé.
async function consommerItem(i) {
  if (transfertEnCours()) return;
  const B = V && V.butin, S = mod.survie, inv = mod.inv; if (!B || i >= B.visibles || !S) return;
  const prevu = B.items[i];
  const v = S.peutConsommer(prevu);
  if (!v.ok && !v.peutForcer) { message(v.raison || 'Impossible.', 2200); return; }
  if (!v.ok && v.peutForcer && !B.forcer) { B.forcer = prevu.id; message(`${v.raison} Touche encore « Manger » pour te forcer.`, 2600); return; }
  const it = await prendreDe(B, i, 1);
  if (!it) return;
  if ((prevu.qty || 1) > 1) prevu.qty -= 1; else retirerDuButin(B, i);
  const forcer = !v.ok && B.forcer === prevu.id;
  B.forcer = null;
  const etat = (() => { const { id: _i, qty: _q, ...e } = it; return e; })();
  // manger prend du temps : le repas se joue dans le monde (la fenêtre se ferme) ; le reste d'une boîte entamée va au sac
  if (inv && (inv.def(it.id) || {}).type === 'nourriture') {
    fermerButin();
    const d = { prendre: () => ({ ...it, qty: 1 }), rendre: (e) => { const { id: _i, qty: _q, ...et } = e; inv.addItem(e.id, 1, et); }, forcer, fermer: () => {} };
    emit('repas:demande', d);
    if (d.pris) return;
  }
  const r = S.consommer({ ...it, qty: 1 }, G.player, { forcer });
  if (!r.ok) { donner({ ...it, qty: 1 }, true); if (r.raison) message(r.raison, 2200); }
  else {
    if (!r.fini && inv) inv.addItem(it.id, 1, { ...etat, ...(r.reste != null ? { reste: r.reste, ouvert: r.ouvert } : {}), ...(r.eau ? { eau: r.eau } : {}) });
    if (r.rend && inv) inv.addItem(r.rend, 1);
  }
  if (!B.items.length && B.fini) fermerButin(); else rendreButin();
}
let portEnCours = false;
async function porterItem(i) {
  if (transfertEnCours() || portEnCours) return;
  const B = V && V.butin, inv = mod.inv; if (!B || i >= B.visibles || !inv || !inv.porterObjet) return;
  portEnCours = true;
  try {
  const prevu = B.items[i], p = G.player;
  const choix = await choisirSac(prevu.id, p, { valide: () => V && V.butin === B && B.items[i] === prevu });
  if (!choix || !V || V.butin !== B || B.items[i] !== prevu) return;
  const it = await prendreDe(B, i, 1);
  if (!it) return;
  if ((prevu.qty || 1) > 1) prevu.qty--; else retirerDuButin(B, i);
  const r = inv.porterObjet(it, p, null, choix);
  if (r.ok && V && V.cbt) V.cbt.majStats();
  if (!r.ok) { inv.mettreATrier(it); message(r.raison || 'Impossible de le porter.', 2200); }
  else sfx('loot');
  if (V && V.butin === B) { if (!B.items.length && B.fini) fermerButin(); else rendreButin(); }
  } finally { portEnCours = false; }
}
export async function prendreTout() {
  if (transfertEnCours()) return;
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
    const it = await prendreDe(B, i);
    if (it) { retirerDuButin(B, i); donner(it, true); pris++; }
  }
  if (pris) sfx('loot');
  if (laisses.length) message(`Sac plein : ${laisses.slice(0, 3).join(', ')}${laisses.length > 3 ? '…' : ''} reste${laisses.length > 1 ? 'nt' : ''} ici.`, 3200);
  else if (pris) message(`Tu prends ${pris} objet${pris > 1 ? 's' : ''}.`, 1400);
  if (B.fini && !B.items.length) fermerButin(); else rendreButin();
}
// Distance du joueur à ce qu'il fouille : au bord de l'emprise s'il y en a une, sinon au point.
export function distanceButin(B, j) {
  const R = B.rect;
  if (!R) return Math.hypot(B.x - j.x, B.y - j.y);
  return Math.hypot(Math.max(R.x0 - j.x, 0, j.x - R.x1), Math.max(R.y0 - j.y, 0, j.y - R.y1));
}
export function fermerButin() { if (!V) return; V.butin = null; V.hud.butin.classList.add('cache'); V.hud.butin.textContent = ''; }

export function donner(it, silencieux) {
  if (it.doc) { lireDocument(it.doc); return; }
  let auSol = 0;
  const inv = mod.inv;
  if (inv && inv.addItem) { const { id: _i, qty: _q, ...etat } = it; const r = inv.addItem(it.id, it.qty || 1, etat); auSol = (r && r.auSol) || 0; }
  else {
    const s = G.player.inventaire.find(x => x.id === it.id && x.dur == null && x.eau == null);
    if (s) s.qty += it.qty || 1; else G.player.inventaire.push({ id: it.id, qty: it.qty || 1 });
    emit('inventaire', { ajout: it.id });
  }
  if (!silencieux) message(auSol ? `Plus de place. Laissé par terre : ${nomObjet(it.id)}.` : `Pris : ${nomObjet(it.id)}${it.qty > 1 ? ' ×' + it.qty : ''}.`, 1600);
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
    lister: () => proches().map(o => { const { uid: _u, etage: _e, x: _x, y: _y, ...r } = o; return r; }),
    deposer: (item) => {
      const v = V;
      if (v) return v.canal.deposer({ etage: v.j.etage, x: v.j.x + Math.cos(v.j.dir) * 0.4, y: v.j.y + Math.sin(v.j.dir) * 0.4 }, item)
        .then(r => { if (V === v) v.snap = v.canal.instantane(); return r; });
    },
    prendre: async (i, qty) => {
      const o = proches()[i]; if (!o) return null;
      const v = V, r = await v.canal.prendre('#sol:' + o.uid, 0, qty);
      if (V === v) v.snap = v.canal.instantane();
      return r;
    },
  };
}

// ---------- À portée de main : le sol autour de soi + les rangements déjà fouillés tout près ----------
// Pour fabriquer et construire, ce qui est là compte comme si on l'avait sur soi (inv.aPortee / retirerDispo).
const PORTEE_SOL = 1.6, PORTEE_RANGEMENT = 1.5;
function solProche() { return V && V.snap ? V.snap.sol.filter(o => !o.doc && o.etage === V.j.etage && Math.hypot(o.x - V.j.x, o.y - V.j.y) <= PORTEE_SOL) : []; }
// Les rangements fouillés (ou caisses construites) qui ont encore quelque chose, à portée de bras.
function rangementsProches() {
  if (!V || !V.snap) return [];
  const j = V.j, r = [], dRect = (x0, y0, x1, y1) => Math.hypot(Math.max(x0 - j.x, 0, j.x - x1), Math.max(y0 - j.y, 0, j.y - y1));
  for (const m of V.niveau.meubles) {
    if (m.etage !== j.etage || !m.conteneur || (V.retires && V.retires.has(m.cle))) continue;
    const st = V.snap.conteneurs[m.cle];
    if (!st || (st.progres || 0) < 1 || !st.reste) continue;
    if (dRect(m.x0, m.y0, m.x1 + 1, m.y1 + 1) <= PORTEE_RANGEMENT) r.push(m.cle);
  }
  for (const c of V.snap.constructions || []) {
    if (c.etage !== j.etage || !c.n) continue;
    const [w, h] = tailleConstruction(c.type, c.rot);
    if (dRect(c.x, c.y, c.x + w, c.y + h) <= PORTEE_RANGEMENT) r.push('#c:' + c.uid);
  }
  return r;
}
// Rafraîchi régulièrement par la boucle (le contenu des rangements se demande au monde : hôte en co-op).
export function majProximite(dt) {
  if (!V) return;
  const P = V.proxi || (V.proxi = { t: 0, cle: '', contenus: {}, enCours: false });
  P.t -= dt;
  const cles = rangementsProches(), cle = cles.join('|') + '#' + ((V.snap && V.snap.vm) || 0);
  if (P.enCours || (cle === P.cle && P.t > 0)) return;
  P.cle = cle; P.t = 2500;
  if (!cles.length) { if (Object.keys(P.contenus).length) { P.contenus = {}; emit('inventaire', { portee: true }); } return; }
  if (!V.canal.contenu) return;
  P.enCours = true;
  Promise.all(cles.map(k => V.canal.contenu(k).then(items => [k, items || []]).catch(() => [k, []]))).then(res => {
    P.enCours = false;
    if (!V || V.proxi !== P) return;
    P.contenus = Object.fromEntries(res);
    emit('inventaire', { portee: true });
  });
}
export function fournisseurProximite() {
  return {
    lister() {
      if (!V) return [];
      const r = solProche().map(o => { const { uid, etage: _e, x: _x, y: _y, ...it } = o; return { ...it, qty: it.qty || 1, src: { sol: uid } }; });
      const P = V.proxi; if (!P) return r;
      for (const [cle, items] of Object.entries(P.contenus)) items.forEach((it, i) => { const q = it.qty ?? 1; if (q > 0) r.push({ ...it, qty: q, src: { cle, i } }); });
      return r;
    },
    // pris : [{ src, id, qty }] — un même rangement : des derniers aux premiers (les indices ne glissent pas)
    async prendre(pris) {
      if (!V) return null;
      const v = V;
      const tri = [...pris].sort((a, b) => (a.src.cle || '').localeCompare(b.src.cle || '') || (b.src.i ?? 0) - (a.src.i ?? 0));
      const r = await v.canal.prendreLot(tri.map(x => ({ cle: x.src.sol != null ? '#sol:' + x.src.sol : x.src.cle, i: x.src.i || 0, id: x.id, qty: x.qty })));
      if (V === v) { v.snap = v.canal.instantane(); if (v.proxi) { v.proxi.t = 0; v.proxi.cle = ''; } }
      return r;
    },
  };
}

// ---------- Les objets au sol autour de soi (bouton à côté de la loupe) ----------
// Comme une fouille déjà finie : la même fenêtre, avec ce qui traîne par terre à portée de main.
export function nombreAuSol() { return solProche().length; }
export function ouvrirSol() {
  if (!V) return;
  if (V.butin && V.butin.sol) { fermerButin(); return; }
  if (V.fouille) interrompreFouille();
  const objets = solProche();
  if (!objets.length) { message('Rien par terre, ici.', 1400); return; }
  V.butin = { cle: '#sol', sol: true, nom: 'Par terre', uids: objets.map(o => o.uid), items: objets.map(o => { const { uid: _u, etage: _e, x: _x, y: _y, ...it } = o; return it; }), visibles: objets.length, fini: true, x: V.j.x, y: V.j.y };
  V.butin.dejaVus = objets.length;
  V.hud.butin.classList.remove('cache');
  rendreButin();
}
