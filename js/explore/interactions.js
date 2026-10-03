// ============ Exploration — interactions : cible la plus proche, portes, actions chronométrées, PNJ, documents,
// déclencheurs d'histoire, escaliers, sorties, pièces ============
// Une seule touche (E / bouton Interagir) : l'action proposée est toujours écrite en clair (« Fouiller l'armoire »).
// Co-op : portes à deux (verrou { deux: true }), déclencheurs « à deux » (deux: true), relever son coéquipier à terre.
import { G, getFlag, sauver as sauverPartie } from '../core/state.js';
import { emit } from '../core/bus.js';
import { el } from '../core/util.js';
import * as flow from '../game/flow.js';
import { REGLAGES } from '../data/reglages.js';
import { ZOMBIES } from '../data/zombies.js';
import { DECLENCHEURS } from '../data/histoire/declencheurs.js';
import { DOCUMENTS } from '../data/histoire/documents.js';
import { PNJ } from '../data/histoire/pnj.js';
import { K } from './niveau.js';
import { mod, sfx, message, afficherLieu, verifierCondition, compter, niv, nomObjet, outil, caseLibrePres } from './commun.js';
import { ouvrirSommeil } from '../game/sommeil.js';
import { commencerFouille, interrompreFouille, fermerButin, ramasser, lireDocument, prendreTout } from './butin.js';

const RX = REGLAGES.exploration;
let V = null, api = null;
// api = { changerEtage(etage), sortir(), finArene(raison), scene(id) → Promise, coop: { pairPres(d) → pair|null, relever(id), signaler(evt) } }
export function lierInteractions(v, a) { V = v; api = a; }

// ---------- La cible ----------
export function chercherCible() {
  if (V.occupe) return null;
  const j = V.j, E = V.E, C = V.C, n = V.niveau, snap = V.snap;
  const R = RX.INTERACTION_CASES;
  let best = null, bs = Infinity;
  const proposer = (c, d, bonus = 0) => {
    let a = Math.atan2(c.cy - j.y, c.cx - j.x) - j.dir; a = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
    const s = d + a * 0.25 - bonus;
    if (s < bs) { bs = s; best = c; }
  };
  const x0 = Math.floor(j.x - R - 0.5), x1 = Math.floor(j.x + R + 0.5), y0 = Math.floor(j.y - R - 0.5), y1 = Math.floor(j.y + R + 0.5);
  const vusMeubles = new Set();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (x < 0 || y < 0 || x >= E.w || y >= E.h) continue;
    const i = y * E.w + x;
    if (C.los[i] !== C.stamp) continue;
    const dx = Math.max(x - j.x, 0, j.x - x - 1), dy = Math.max(y - j.y, 0, j.y - y - 1);
    const d = Math.hypot(dx, dy);
    if (d > R) continue;
    const code = E.code[i];
    if (code === K.PORTE) {
      const p = n.portes[E.porte[i]]; const s = snap.portes[p.cle];
      if (s && s.etat !== 'cassee') proposer({ type: 'porte', p, s, etage: E.id, x0: x, y0: y, x1: x + 1, y1: y + 1, cx: x + 0.5, cy: y + 0.5 }, d);
    } else if (code === K.MEUBLE) {
      const m = n.meubles[E.meuble[i]];
      if (!m || vusMeubles.has(m.idx)) continue; vusMeubles.add(m.idx);
      const decl = m.marqueur && declencheurMarqueur(m.marqueur);
      if (!m.conteneur && !decl) continue;
      proposer({ type: 'meuble', m, decl, etage: E.id, x0: m.x0, y0: m.y0, x1: m.x1 + 1, y1: m.y1 + 1, cx: x + 0.5, cy: y + 0.5 }, d, decl ? 0.2 : 0);
    } else if (code === K.ESC_MONTE || code === K.ESC_DESCEND) {
      const s = n.escaliers.find(e => e.etage === E.id && e.cases.includes(i));
      if (s && s.arrivee) proposer({ type: 'escalier', s, etage: E.id, x0: x, y0: y, x1: x + 1, y1: y + 1, cx: x + 0.5, cy: y + 0.5 }, d, 0.1);
    } else if (code === K.SORTIE) {
      const s = n.sorties.find(e => e.etage === E.id && e.cases.includes(i));
      proposer({ type: 'sortie', s, etage: E.id, x0: x, y0: y, x1: x + 1, y1: y + 1, cx: x + 0.5, cy: y + 0.5 }, d);
    }
  }
  for (const m of Object.values(n.marqueurs)) {
    if (m.etage !== E.id || m.meuble || m.porte) continue;
    const d = Math.hypot(m.x + 0.5 - j.x, m.y + 0.5 - j.y);
    if (d > R + 0.5 || C.los[m.y * E.w + m.x] !== C.stamp) continue;
    const decl = declencheurMarqueur(m.id);
    const doc = docDuMarqueur(m.id);
    const pnj = V.pnj.find(q => q.marqueur === m.id);
    if (!decl && !doc && !pnj) continue;
    if (pnj && !decl) continue;
    proposer({ type: decl ? 'marqueur' : 'doc', decl, doc, m, etage: E.id, x0: m.x, y0: m.y, x1: m.x + 1, y1: m.y + 1, cx: m.x + 0.5, cy: m.y + 0.5 }, d, 0.3);
  }
  if (best && best.type === 'porte' && best.p.marqueur) { const decl = declencheurMarqueur(best.p.marqueur); if (decl) best = { ...best, type: 'marqueur', decl }; }
  for (const q of V.pnj) {
    if (q.etage !== E.id) continue;
    const d = Math.hypot(q.x - j.x, q.y - j.y) - 0.3;
    if (d > R) continue;
    proposer({ type: 'pnj', q, etage: E.id, x0: q.x - 0.5, y0: q.y - 0.5, x1: q.x + 0.5, y1: q.y + 0.5, cx: q.x, cy: q.y }, d, 0.3);
  }
  // coéquipier à terre : le relever passe avant tout
  for (const p of V.pairsVus || []) {
    if (p.etage !== E.id || !p.agonie) continue;
    const d = Math.hypot(p.x - j.x, p.y - j.y) - 0.3;
    if (d > R + 0.3) continue;
    proposer({ type: 'relever', p, etage: E.id, x0: p.x - 0.6, y0: p.y - 0.6, x1: p.x + 0.6, y1: p.y + 0.6, cx: p.x, cy: p.y }, d, 1);
  }
  for (const o of snap.sol) {
    if (o.etage !== E.id) continue;
    const d = Math.hypot(o.x - j.x, o.y - j.y) - 0.2;
    if (d > R) continue;
    proposer({ type: 'sol', o, etage: E.id, x0: o.x - 0.5, y0: o.y - 0.5, x1: o.x + 0.5, y1: o.y + 0.5, cx: o.x, cy: o.y }, d, 0.15);
  }
  for (const cd of snap.cadavres) {
    if (cd.etage !== E.id) continue;
    const def = ZOMBIES[cd.type];
    const c = snap.conteneurs['cad:' + cd.uid];
    if (!def || !def.butin || (c && c.reste === 0 && c.progres >= 1)) continue;
    const d = Math.hypot(cd.x - j.x, cd.y - j.y) - 0.3;
    if (d > R) continue;
    proposer({ type: 'cadavre', cd, etage: E.id, x0: cd.x - 0.6, y0: cd.y - 0.6, x1: cd.x + 0.6, y1: cd.y + 0.6, cx: cd.x, cy: cd.y }, d);
  }
  if (best) best.libelle = libelle(best);
  return best;
}
function libelle(c) {
  switch (c.type) {
    case 'porte': {
      const { p, s } = c;
      if (s.etat === 'ouverte') return 'Fermer la porte';
      if (s.etat === 'fermee') return s.barricadee ? 'Ouvrir (barricadée)' : 'Ouvrir la porte';
      const v = p.verrou || {};
      if (v.flag && getFlag(v.flag)) return 'Ouvrir la porte';
      if (p.deux || v.deux) return G.mode !== 'solo' ? 'Soulever à deux' : 'Forcer (lourd)';
      if (v.cle && compter(v.cle) > 0) return `Déverrouiller (${nomObjet(v.cle)})`;
      if (v.forcer && outil(v.forcer)) return 'Forcer la porte';
      if (v.crocheter && compter('crochets_serrure') > 0) return 'Crocheter la serrure';
      return 'Porte verrouillée';
    }
    case 'meuble': {
      if (c.decl) return c.decl.libelle || `Examiner ${c.m.nom}`;
      const st = V.snap.conteneurs[c.m.cle];
      if (estLit(c.m) && (!c.m.conteneur || (st && st.progres >= 1 && st.reste === 0))) return `Dormir dans ${c.m.nom}`;
      if (st && st.progres >= 1 && st.reste === 0) return `Fouiller ${c.m.nom} (vide)`;
      return `Fouiller ${c.m.nom}`;
    }
    case 'escalier': return c.s.sens === 'monte' ? 'Monter' : 'Descendre';
    case 'sortie': return 'Sortir (carte)';
    case 'marqueur': return (c.decl && c.decl.libelle) || (c.m && c.m.def && c.m.def.nom ? `Examiner ${c.m.def.nom}` : 'Examiner');
    case 'doc': return `${(G.documents || []).includes(c.doc) ? 'Relire' : 'Lire'} : ${(DOCUMENTS[c.doc] || {}).titre || 'document'}`;
    case 'pnj': return `Parler à ${c.q.nom}`;
    case 'relever': return `Relever ${c.p.nom || 'ton coéquipier'}`;
    case 'sol': return c.o.doc ? `Lire : ${(DOCUMENTS[c.o.doc] || {}).titre || 'document'}` : `Ramasser : ${nomObjet(c.o.id)}${c.o.qty > 1 ? ' ×' + c.o.qty : ''}`;
    case 'cadavre': return 'Fouiller le corps';
  }
  return 'Interagir';
}
const LITS = new Set(['lit', 'lit_simple', 'lit_hopital', 'canape', 'brancard', 'fauteuil']);
const estLit = (m) => LITS.has(m.type);
export function majInvite() {
  const c = V.cible;
  const txt = c ? c.libelle : null;
  if (V._invite !== txt) {
    V._invite = txt;
    V.hud.invite.textContent = '';
    if (txt) V.hud.invite.append(el('kbd', {}, 'E'), ' ', txt);
    V.hud.invite.classList.toggle('on', !!txt);
    V.entrees.setInteragir(txt);
  }
}

export async function interagir(o) {
  if (!V || V.occupe || V.enPause) return;
  if (V.butin && !o) { prendreTout(); return; }
  if (V.fouille) { interrompreFouille(); return; }
  if (V.action) { V.action = null; V.hud.barre.classList.add('cache'); return; }
  const c = V.cible = chercherCible();
  if (!c) return;
  switch (c.type) {
    case 'porte': return actionPorte(c);
    case 'meuble': if (c.decl) return jouerDeclencheur(c.decl); if (c.libelle && c.libelle.startsWith('Dormir')) return ouvrirSommeil({ lit: true }); return commencerFouille(c.m.cle, c.m.nom, (c.m.x0 + c.m.x1 + 1) / 2, (c.m.y0 + c.m.y1 + 1) / 2);
    case 'escalier': return prendreEscalier(c.s);
    case 'sortie': return sortirDuLieu(c.s);
    case 'marqueur': return jouerDeclencheur(c.decl);
    case 'doc': return lireDocument(c.doc);
    case 'pnj': return parler(c.q);
    case 'relever': return lancerAction(`Relever ${c.p.nom || 'ton coéquipier'}…`, REGLAGES.coop.RELEVER_MS || 3000, c.p.x, c.p.y, () => { api.coop && api.coop.relever(c.p.id); sfx('soin'); });
    case 'sol': return ramasser(c.o);
    case 'cadavre': return commencerFouille('cad:' + c.cd.uid, 'le corps', c.cd.x, c.cd.y);
  }
}
async function actionPorte(c) {
  const { p, s } = c;
  const C = V.canal;
  let action = s.etat === 'ouverte' ? (V.j.allure === 'course' ? 'claquer' : 'fermer') : 'ouvrir';
  if (s.etat === 'verrouillee') {
    const v = p.verrou || {};
    if (v.flag && getFlag(v.flag)) action = 'ouvrir';
    else if (p.deux || v.deux) {
      // une porte (grille, rideau de fer) trop lourde pour une personne
      if (G.mode !== 'solo') {
        const pair = api.coop && api.coop.pairPres(2.6);
        if (!pair) { message('Trop lourd. Il faut être deux : appelle ton coéquipier.', 2600); sfx('porte_coup'); return; }
        return lancerAction('Soulever ensemble…', 2200, p.x + 0.5, p.y + 0.5, async () => { const r = await C.porte(p.cle, 'forcer'); if (r.ok) { sfx('porte_casse'); message('Ça cède. Vous passez.'); } }, RX.BRUIT.porte_forcee * 0.25);
      }
      if (niv('force') >= 2 || outil('pied_de_biche')) return lancerAction('Forcer (lourd)…', 4500, p.x + 0.5, p.y + 0.5, async () => { const r = await C.porte(p.cle, 'forcer'); if (r.ok) { sfx('porte_casse'); message('À force, ça cède.'); } }, RX.BRUIT.porte_forcee * 0.4);
      message('Trop lourd pour toi seul. Un pied-de-biche ferait levier.', 2600); sfx('porte_coup'); return;
    }
    else if (v.cle && compter(v.cle) > 0) action = 'deverrouiller';
    else if (v.forcer && outil(v.forcer)) {
      const force = niv('force');
      return lancerAction('Forcer la porte…', RX.PORTES.FORCER_MS * Math.max(0.4, 1 - 0.1 * force), p.x + 0.5, p.y + 0.5, async () => {
        const r = await C.porte(p.cle, 'forcer'); if (r.ok) { sfx('porte_casse'); message('La serrure cède dans un craquement.'); }
      }, RX.BRUIT.porte_forcee * 0.3);
    } else if (v.crocheter && compter('crochets_serrure') > 0 && niv('mecanique') >= (v.meca || 0)) {
      return lancerAction('Crocheter…', RX.PORTES.CROCHETER_MS * Math.max(0.4, 1 - 0.12 * niv('mecanique')), p.x + 0.5, p.y + 0.5, async () => { await C.porte(p.cle, 'crocheter'); sfx('clic'); });
    } else {
      sfx('porte_coup');
      message(v.flag && !v.cle && !v.forcer ? 'Fermée. Ça ne s\'ouvre pas de ce côté.' : v.cle ? `Verrouillée. Il faudrait ${nomObjet(v.cle).toLowerCase()}.` : v.forcer ? `Verrouillée. Un ${nomObjet(v.forcer).toLowerCase()} en viendrait à bout.` : 'Verrouillée.');
      return;
    }
  }
  const r = await C.porte(p.cle, action);
  if (r.ok) sfx('porte');
  else if (r.raison === 'occupee') message('Quelque chose bloque le passage.');
  else if (r.raison === 'flag') message('Fermée. Ça ne s\'ouvre pas de ce côté.');
  else if (r.raison === 'verrouillee') message('Verrouillée.');
}
// Action chronométrée générique (forcer, crocheter, relever…) : interrompue par le mouvement.
export function lancerAction(label, ms, x, y, fin, bruitParS = 0) {
  V.action = { label, duree: ms, t: 0, x, y, fin, bruit: bruitParS, tb: 0 };
  V.hud.barre.firstChild.textContent = label;
  V.hud.barre.classList.remove('cache');
}
export function avancerAction(dt) {
  const a = V.action, I = V.entrees.etat;
  if (Math.hypot(I.mx, I.my) > 0.3) { V.action = null; V.hud.barre.classList.add('cache'); message('Interrompu.'); return; }
  a.t += dt; a.tb += dt;
  if (a.bruit && a.tb >= 1000) { a.tb = 0; V.canal.bruit({ etage: V.j.etage, x: a.x, y: a.y, rayon: a.bruit }); }
  V.hud.barre.lastChild.firstChild.style.width = (100 * Math.min(1, a.t / a.duree)).toFixed(1) + '%';
  if (a.t >= a.duree) { V.action = null; V.hud.barre.classList.add('cache'); a.fin(); }
}

// ---------- Documents, PNJ, déclencheurs ----------
function docDuMarqueur(mid) {
  for (const [id, d] of Object.entries(DOCUMENTS)) if (d.marqueur === mid && (!d.lieu || d.lieu === V.lieuId)) return id;
  const m = V.niveau.marqueurs[mid]; if (m && m.doc) return m.doc;
  return null;
}
export function majPnj() {
  const out = [];
  const n = V.niveau;
  for (const q of n.pnj) {
    const P = PNJ[q.id] || {};
    if (!verifierCondition(q.si || P.si)) continue;
    out.push({ id: q.id, nom: q.nom || P.nom || q.id, scene: P.scene, marqueur: q.marqueur, etage: q.etage, x: q.x + 0.5, y: q.y + 0.5, dir: Math.PI / 2 });
  }
  for (const [id, P] of Object.entries(PNJ)) {
    if (P.lieu !== V.lieuId || !P.marqueur || !n.marqueurs[P.marqueur]) continue;
    if (out.some(o => o.id === id)) continue;
    if (!verifierCondition(P.si)) continue;
    const m = n.marqueurs[P.marqueur];
    if (m.meuble || m.porte) { const c = caseLibrePres(n, m); if (!c) continue; out.push({ id, nom: P.nom, scene: P.scene, marqueur: P.marqueur, etage: c.etage, x: c.x + 0.5, y: c.y + 0.5, dir: Math.PI / 2 }); }
    else out.push({ id, nom: P.nom, scene: P.scene, marqueur: P.marqueur, etage: m.etage, x: m.x + 0.5, y: m.y + 0.5, dir: Math.PI / 2 });
  }
  V.pnj = out;
}
async function parler(q) {
  const d = declencheurMarqueur(q.marqueur);
  if (d) return jouerDeclencheur(d);
  if (q.scene) return jouerScene(q.scene);
  message(`${q.nom} ne dit rien.`);
}
export const cleDecl = (d) => `${d.quand}:${d.lieu || ''}:${d.marqueur || ''}:${d.scene || d.cinematique || ''}`;
export function declencheurActif(d) {
  if (d.unique && G.world.declencheurs && G.world.declencheurs[cleDecl(d)]) return false;
  return verifierCondition(d.si);
}
export function declencheurMarqueur(mid) {
  if (!mid) return null;
  for (const d of DECLENCHEURS) if (d.quand === 'marqueur' && d.lieu === V.lieuId && d.marqueur === mid && declencheurActif(d)) return d;
  return null;
}
export function declencheursEntree() {
  for (const d of DECLENCHEURS) if (d.quand === 'entree_lieu' && d.lieu === V.lieuId && declencheurActif(d)) { jouerDeclencheur(d); return; }
}
export function zones() {
  const j = V.j, x = Math.floor(j.x), y = Math.floor(j.y);
  for (const z of V.niveau.declencheurs) {
    const dedans = z.etage === j.etage && x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h;
    const deja = V.zonesDedans.has(z.i);
    if (!dedans) { if (deja) V.zonesDedans.delete(z.i); continue; }
    if (deja) continue;
    V.zonesDedans.add(z.i);
    if (z.unique && V.canal.estJoue && V.canal.estJoue(z.i)) continue;
    if (!verifierCondition(z.si)) continue;
    if (z.marqueur) { const d = declencheurMarqueur(z.marqueur); if (d) { V.canal.marquerJoue && V.canal.marquerJoue(z.i); jouerDeclencheur(d); } continue; }
    V.canal.marquerJoue && V.canal.marquerJoue(z.i);
    jouerDeclencheur({ quand: 'zone', lieu: V.lieuId, marqueur: 'zone' + z.i, scene: z.scene, cinematique: z.cinematique, unique: false, deux: z.deux });
    return;
  }
}
export async function jouerDeclencheur(d) {
  if (!V || V.occupe) return;
  // moment « à deux » : on attend que le coéquipier soit là
  if (d.deux && G.mode !== 'solo' && api.coop && !api.coop.pairPres(4)) { message('Attends ton coéquipier : vous devez être deux ici.', 2600); return; }
  if (d.unique) { G.world.declencheurs = G.world.declencheurs || {}; G.world.declencheurs[cleDecl(d)] = true; emit('declencheur', { cle: cleDecl(d) }); }
  if (d.cinematique) { V.occupe = true; V.entrees.actif(false); try { await flow.cinematique(d.cinematique); } finally { if (V) { V.occupe = false; if (!V.enPause) V.entrees.actif(true); } } }
  if (d.scene) await jouerScene(d.scene);
}
export async function jouerScene(id) {
  if (!V) return;
  V.occupe = true; V.entrees.actif(false); fermerButin(); interrompreFouille();
  V.canal.majJoueur({ allure: 'immobile' });
  let res = null;
  try { res = await api.scene(id); }
  catch (e) { console.warn('[explore] scène', id, e); }
  if (!V) return;
  V.occupe = false;
  if (!V.enPause) V.entrees.actif(true);
  if (res && res.fin === '#combat' && res.combat) await flow.combattre(res.combat);
}

// ---------- Escaliers, sortie, pièces ----------
export function prendreEscalier(s) {
  const a = s.arrivee; if (!a) return;
  interrompreFouille(); fermerButin();
  api.changerEtage(a.etage);
  V.j.x = a.x + 0.5; V.j.y = a.y + 0.5; V.j.vx = V.j.vy = 0;
  V.canal.majJoueur({ etage: a.etage, x: V.j.x, y: V.j.y });
  sfx('pas_craque');
  afficherLieu(V.E.nom);
}
async function sortirDuLieu(s) {
  if (V.occupe) return;
  if (V.arene) { api.finArene('sortie'); return; }
  V.occupe = true;
  const echelle = (s && s.echelle) || V.L.echelle || 'salon';
  const id = V.lieuId;
  api.sortir();
  G.player.position = { mode: 'lieu', lieu: id, sorti: true };
  try { sauverPartie(); } catch (e) {}
  await flow.ouvrirCarte({ echelle, depuis: id });
}
export function piece() {
  const i = Math.floor(V.j.y) * V.E.w + Math.floor(V.j.x);
  const p = V.E.piece[i];
  if (p < 0 || p === V.piece) return;
  V.piece = p;
  const P = V.niveau.pieces[p];
  if (P.nom && P.nom !== V._dernierNom) { V._dernierNom = P.nom; afficherLieu(P.nom); }
}
void mod;
