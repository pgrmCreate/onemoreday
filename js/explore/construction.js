// ============ Exploration — construire, démonter, et ce que les constructions apportent ============
// Placement : le panneau « Construire » émet 'construction:placer' { type } → un fantôme suit la souris (PC) ou se place
// devant toi (tactile) ; vert = possible, rouge = non. Clic / bouton Poser = bâtir (action en temps réel : ne bouge pas,
// le marteau s'entend) ; T = tourner ; Échap = annuler. On reste en mode placement tant qu'on a de quoi (un mur après l'autre).
// Interactions : caisse (ouvrir, ranger), porte construite, feu (remettre du bois), récupérateur (boire, remplir),
// potager (récolter, replanter), lit (dormir), établi (fabriquer) ; touche G = geste secondaire (démonter, barricader).
// Contexte : établi, feu, point d'eau, dehors → fabrication et survie (2 fois par seconde).
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { CONSTRUCTIONS, DEMONTABLES, casesConstruction, tailleConstruction } from '../data/construction.js';
import * as cons from '../game/construction.js';
import { setContexteFabrication } from '../game/crafting.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import { K } from './niveau.js';
import { mod, sfx, sfxA, message, niv, compter } from './commun.js';
import { ouvrirSommeil } from '../game/sommeil.js';
import { lancerAction } from './interactions.js';
import { commencerFouille } from './butin.js';

let V = null;
export function lierConstruction(v) { V = v; if (v) { v.placement = null; v.retiresVus = ''; } }

const minutes = () => (G ? G.world.minutes : 0);
const defDe = (c) => CONSTRUCTIONS[c.type];
const consListe = () => (V && V.snap && V.snap.constructions) || [];
const nomC = (c) => (defDe(c) || {}).nom || 'la construction';
const le = (c) => { const n = nomC(c); return /^[AEIOUYÉÈ]/i.test(n) ? `l'${n.toLowerCase()}` : `${/^(Caisse|Palissade|Porte|Barricade)/.test(n) ? 'la' : 'le'} ${n.toLowerCase()}`; };
const feuAllume = (c) => (defDe(c) || {}).feu && (c.feuJusqua || 0) > minutes();

// ---------- Placement ----------
export function demarrerPlacement(type) {
  if (!V || !CONSTRUCTIONS[type]) return;
  if (V.arene) { message('Pas ici : tu es en pleine route.'); return; }
  V.placement = { type, rot: 0, x: 0, y: 0, ok: false, raison: '' };
  message(`${CONSTRUCTIONS[type].nom} : choisis l'endroit. ${V.entrees.etat.tactile ? 'Bouton Poser' : 'Clic'} pour bâtir, T pour tourner, Échap pour arrêter.`, 4200);
}
export function annulerPlacement() { if (V && V.placement) { V.placement = null; return true; } return false; }
export function tournerPlacement() { if (V && V.placement) { V.placement.rot = (V.placement.rot + 1) % 2; return true; } return false; }
export const enPlacement = () => !!(V && V.placement);

// Une case marchable, libre, sans construction, sans personne (une barricade de fenêtre : une fenêtre).
function verifier(P) {
  const E = V.E, d = CONSTRUCTIONS[P.type];
  const bl = V.canal.grilles ? V.canal.grilles(E.id).bloque : E.bloque;
  const occ = new Set();
  for (const c of consListe()) if (c.etage === E.id) for (const [x, y] of casesConstruction(c.type, c.x, c.y, c.rot)) occ.add(y * E.w + x);
  for (const [x, y] of casesConstruction(P.type, P.x, P.y, P.rot)) {
    if (x < 0 || y < 0 || x >= E.w || y >= E.h) return 'hors de la carte';
    const i = y * E.w + x;
    if (occ.has(i)) return 'déjà construit';
    if (d.pose === 'fenetre') { if (E.code[i] !== K.FENETRE) return 'il faut une fenêtre'; continue; }
    if (E.code[i] !== K.SOL || bl[i]) return 'pas la place';
    if (d.bloque) {
      if (Math.hypot(V.j.x - x - 0.5, V.j.y - y - 0.5) < 0.8) return 'tu es dessus';
      for (const z of V.zListe) if (z.etage === E.id && Math.hypot(z.x - x - 0.5, z.y - y - 0.5) < 0.8) return 'quelqu\'un est là';
    }
  }
  const [w, h] = tailleConstruction(P.type, P.rot);
  if (Math.hypot(P.x + w / 2 - V.j.x, P.y + h / 2 - V.j.y) > 3.2) return 'trop loin';
  return '';
}
function majPlacement() {
  const P = V.placement, I = V.entrees.etat, j = V.j;
  const [w, h] = tailleConstruction(P.type, P.rot);
  let cx, cy;
  if (I.viseeSouris && !I.tactile) { const m = V.rendu.ecranVersMonde(I.sx, I.sy); cx = m.x; cy = m.y; }
  else { cx = j.x + Math.cos(j.dir) * 1.6; cy = j.y + Math.sin(j.dir) * 1.6; }
  P.x = Math.floor(cx - w / 2 + 0.5); P.y = Math.floor(cy - h / 2 + 0.5);
  P.raison = verifier(P);
  const e = cons.etatConstruction(P.type);
  if (!P.raison && !e.faisable) P.raison = e.manques[0] || 'il manque quelque chose';
  P.ok = !P.raison;
  P.w = w; P.h = h;
}
// Clic / bouton Poser.
export function poserPlacement() {
  const P = V && V.placement; if (!P || V.action) return false;
  majPlacement();
  if (!P.ok) { message(`Impossible : ${P.raison}.`, 1800); sfx('rate', { volume: 0.4 }); return true; }
  const d = CONSTRUCTIONS[P.type], o = { type: P.type, etage: V.E.id, x: P.x, y: P.y, rot: P.rot };
  lancerAction(`Construire : ${d.nom.toLowerCase()}…`, cons.dureeConstructionMs(P.type), P.x + P.w / 2, P.y + P.h / 2, async () => {
    if (!cons.etatConstruction(o.type).faisable) { message('Il te manque des matériaux.'); return; }
    const r = await V.canal.construire({ ...o, minutes: minutes() });
    if (!r || !r.ok) { message(`Impossible : ${{ occupe: 'la place est prise', quelqu_un: 'quelqu\'un est dessus', fenetre: 'il faut une fenêtre', hors: 'hors de la carte' }[r && r.raison] || 'ça ne tient pas là'}.`); return; }
    cons.payerConstruction(o.type);
    sfx('porte_coup', { volume: 0.5 });
    message(`${d.nom} : fait.`, 1600);
    if (V && V.placement && !cons.etatConstruction(o.type).faisable) { V.placement = null; message(`${d.nom} : fait. Plus assez de matériaux pour un autre.`, 2600); }
  }, d.outils && d.outils.includes('marteler') ? 7 : 3);
  return true;
}
// Ce que le rendu dessine (fantôme).
export function fantome() {
  const P = V && V.placement; if (!P || V.action) return null;
  return { type: P.type, dessin: CONSTRUCTIONS[P.type].dessin, x: P.x, y: P.y, w: P.w || 1, h: P.h || 1, ok: P.ok, etage: V.E.id };
}

// ---------- Par image ----------
export function majConstruction(dt) {
  if (!V) return;
  if (V.placement) majPlacement();
  // meubles démontés (chez soi ou par le coéquipier) : on les retire du dessin
  const ret = (V.snap && V.snap.retires) || [];
  const cle = ret.join('|');
  if (cle !== V.retiresVus) {
    V.retiresVus = cle; V.retires = new Set(ret);
    for (const E of V.niveau.etages) for (const R of (E.rendu ? E.rendu.objets : [])) R.retire = R.meuble != null && V.retires.has((V.niveau.meubles[R.meuble] || {}).cle);
    if (V.rendu && V.rendu.viderCache) V.rendu.viderCache();
  }
  V.tCtx = (V.tCtx || 0) - dt;
  if (V.tCtx <= 0) { V.tCtx = 500; majContexte(); }
}
// Feux allumés → sources de lumière (comme une lampe posée).
export function feuxCommeLampes(lampes, n, max = 6) {
  if (!V) return n;
  for (const c of consListe()) {
    if (n >= max) break;
    if (c.etage !== V.E.id || !feuAllume(c)) continue;
    lampes[n++] = { x: c.x + 0.5, y: c.y + 0.5, dir: 0, forme: 'halo', angle: 360, portee: 6, sec: true, feu: true };
  }
  return n;
}
function pres(x, y, r) { return Math.hypot(V.j.x - x, V.j.y - y) <= r; }
function majContexte() {
  const E = V.E, j = V.j;
  let etabli = false, etabliVrai = false, feu = false, feuProche = false, eau = null;
  for (const c of consListe()) {
    if (c.etage !== E.id) continue;
    const d = defDe(c); if (!d) continue;
    const [w, h] = tailleConstruction(c.type, c.rot), cx = c.x + w / 2, cy = c.y + h / 2;
    if (d.poste === 'etabli' && pres(cx, cy, 1.8)) { etabli = true; etabliVrai = true; }
    if (feuAllume(c)) { if (pres(cx, cy, 2.2)) feu = true; if (pres(cx, cy, 3.5)) feuProche = true; }
  }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = Math.floor(j.x) + dx, y = Math.floor(j.y) + dy;
    if (x < 0 || y < 0 || x >= E.w || y >= E.h) continue;
    const mi = E.meuble ? E.meuble[y * E.w + x] : -1;
    if (mi == null || mi < 0) continue;
    const m = V.niveau.meubles[mi]; if (!m || (V.retires && V.retires.has(m.cle))) continue;
    if (Math.hypot(x + 0.5 - j.x, y + 0.5 - j.y) <= 1.6 && ['table', 'table_ronde', 'bureau', 'machine', 'comptoir'].includes(m.type)) etabli = true;
    if (m.marqueur === 'etabli') etabliVrai = etabli = true;
    if (['wc', 'baignoire', 'lavabo', 'cuisine'].includes(m.type) || m.eau) eau = eau || 'croupie';
  }
  for (const mk of Object.values(V.niveau.marqueurs || {})) if (mk && mk.eau && mk.etage === E.id && pres(mk.x + 0.5, mk.y + 0.5, 2)) eau = 'croupie';
  const pi = E.piece[Math.floor(j.y) * E.w + Math.floor(j.x)], P = pi >= 0 ? V.niveau.pieces[pi] : null;
  try { setContexteFabrication({ etabli, etabliVrai, feu, lieu: V.lieuId }); } catch (e) {}
  try { mod.survie && mod.survie.setContexteSurvie && mod.survie.setContexteSurvie({ exterieur: P ? !!P.exterieur : !!V.niveau.exterieur, feuProche, sourceEau: eau }); } catch (e) {}
}

// ---------- Cibles (touche E / G) ----------
// Appelée par chercherCible : propose les constructions proches.
export function ciblesConstruction(proposer) {
  if (!V || V.placement) return;
  const j = V.j, R = REGLAGES.exploration.INTERACTION_CASES + 0.4;
  for (const c of consListe()) {
    if (c.etage !== V.E.id) continue;
    const [w, h] = tailleConstruction(c.type, c.rot);
    const cx = Math.max(c.x, Math.min(c.x + w, j.x)), cy = Math.max(c.y, Math.min(c.y + h, j.y));
    const d = Math.hypot(cx - j.x, cy - j.y);
    if (d > R) continue;
    proposer({ type: 'construction', c, etage: c.etage, x0: c.x, y0: c.y, x1: c.x + w, y1: c.y + h, cx: c.x + w / 2, cy: c.y + h / 2 }, d, 0.05);
  }
}
// Eau de pluie tombée depuis le dernier passage (météo déterministe : on rejoue les demi-heures).
function eauRecuperee(c) {
  const d = defDe(c); if (!d || !d.eau) return c.eau || 0;
  let L = c.eau || 0; const t1 = minutes();
  for (let t = Math.max(c.eauT || t1, t1 - 7 * 1440); t < t1 && L < d.eau.cap; t += 30) { const m = meteoCourante(t); if (m === 'pluie' || m === 'orage') L += d.eau.lParMin * Math.min(30, t1 - t); }
  return Math.min(d.eau.cap, Math.round(L * 100) / 100);
}
function pousse(c) { const d = defDe(c); return d && d.potager && c.plante != null ? Math.min(1, (minutes() - c.plante) / (d.potager.jours * 1440)) : 0; }
const besoinEau = () => (G.player.soif ?? 100) < 85;

// Libellé du geste principal (E) et du geste secondaire (G).
export function libelleConstruction(c) {
  const d = defDe(c); if (!d) return null;
  if (d.contenance) return `Ouvrir ${le(c)}${c.n ? ` (${c.n} objet${c.n > 1 ? 's' : ''})` : ' (vide)'}`;
  if (d.porte) return c.ouverte ? 'Fermer la porte' : 'Ouvrir la porte';
  if (d.lit) return 'Dormir dans le lit';
  if (d.poste === 'etabli') return 'Fabriquer à l\'établi';
  if (d.feu) return feuAllume(c) ? `Remettre du bois (${Math.round((c.feuJusqua - minutes()) / 60 * 10) / 10} h restantes)` : 'Rallumer le feu';
  if (d.eau) { const L = eauRecuperee(c); return L < 0.1 ? 'Récupérateur : vide (il attend la pluie)' : besoinEau() ? `Boire l'eau de pluie (${L.toString().replace('.', ',')} L)` : `Remplir tes contenants (${L.toString().replace('.', ',')} L)`; }
  if (d.potager) { if (c.plante == null) return 'Planter des graines'; const p = pousse(c); return p >= 1 ? `Récolter (${d.potager.recolte} légumes)` : `Potager : ${p < 0.34 ? 'ça germe' : p < 0.67 ? 'ça pousse' : 'presque prêt'}`; }
  return `${d.nom}${c.pv < c.pvMax ? ` (${Math.round(100 * c.pv / c.pvMax)} %)` : ''}`;
}
export function secondaireConstruction(c) {
  const d = defDe(c); if (!d) return null;
  if (!(mod.inv && (mod.inv.hasTag('marteler') || mod.inv.hasTag('forcer'))) && d.outils && d.outils.length) return { libelle: `Démonter ${le(c)} (marteau ou pied-de-biche)`, f: () => message('Il faut un marteau ou un pied-de-biche.') };
  return { libelle: `Démonter ${le(c)}`, f: () => demonterConstruction(c) };
}
function demonterConstruction(c) {
  lancerAction(`Démonter ${le(c)}…`, Math.max(1500, cons.dureeConstructionMs(c.type) * 0.5), c.x + 0.5, c.y + 0.5, async () => {
    const r = await V.canal.agirConstruction(c.uid, 'demonter');
    if (!r || !r.ok) return;
    cons.recevoir(r.rendu);
    sfx('loot');
    message(r.rendu.length ? `Récupéré : ${r.rendu.map(x => `${mod.inv.nomObjet(x.id).toLowerCase()} ×${x.qty}`).join(', ')}.` : 'Démonté. Rien de réutilisable.');
    (mod.player && mod.player.gagnerXp) && mod.player.gagnerXp('construction', 1);
  }, 5);
}
export async function agirConstruction(c) {
  const d = defDe(c); if (!d) return;
  const C = V.canal;
  if (d.contenance) return commencerFouille('#c:' + c.uid, le(c), c.x + 0.5, c.y + 0.5);
  if (d.porte) { const r = await C.agirConstruction(c.uid, c.ouverte ? 'fermer' : 'ouvrir'); if (r && r.ok) sfx('porte'); else if (r && r.raison === 'occupee') message('Quelque chose bloque le passage.'); return; }
  if (d.lit) return ouvrirSommeil({ lit: true });
  if (d.poste === 'etabli') { try { (await import('../ui/panels/index.js')).ouvrirPanneau('fabrication'); } catch (e) {} return; }
  if (d.feu) {
    if (compter('planche') < 1) { message(feuAllume(c) ? 'Il faudrait une planche pour l\'entretenir.' : 'Il faut une planche (et de quoi allumer).'); return; }
    if (!feuAllume(c) && !(mod.inv && mod.inv.hasTag('allumer'))) { message('Il faut un briquet ou des allumettes.'); return; }
    return lancerAction(feuAllume(c) ? 'Remettre du bois…' : 'Rallumer…', 1600, c.x + 0.5, c.y + 0.5, async () => {
      const fin = Math.max(minutes(), c.feuJusqua || 0) + d.feu.bois;
      const r = await C.agirConstruction(c.uid, 'maj', { feuJusqua: Math.min(fin, minutes() + 6 * 60) });
      if (r && r.ok) { mod.inv.removeItem('planche', 1); sfx('allumer'); message('Le feu reprend.'); }
    });
  }
  if (d.eau) {
    const L = eauRecuperee(c);
    if (L < 0.1) { message('Vide. Il faut attendre la pluie.'); await C.agirConstruction(c.uid, 'maj', { eau: L, eauT: minutes() }); return; }
    let reste = L;
    if (besoinEau()) {
      const prise = Math.min(reste, 0.5);
      G.player.soif = Math.min(100, (G.player.soif || 0) + REGLAGES.survie.EAU.SOIF_PAR_L.propre * prise); reste -= prise;
      sfx('boire'); message('L\'eau de pluie est fraîche, un peu âpre.');
    } else {
      let n = 0;
      for (let i = 0; i < G.player.inventaire.length && reste > 0.05; i++) {
        const it = G.player.inventaire[i]; const cap = mod.inv.contenance(it.id); if (!cap) continue;
        const avant = it.eau ? it.eau.L : 0; const ajout = Math.min(cap - avant, reste); if (ajout <= 0.01) continue;
        const r = mod.inv.remplir(i, 'propre', ajout); if (r && r.ok !== false) { reste -= ajout; n++; }
      }
      message(n ? `${n} contenant${n > 1 ? 's' : ''} rempli${n > 1 ? 's' : ''} d'eau de pluie.` : 'Rien à remplir : il te faut une bouteille, une gourde, un jerrican.');
      if (n) sfx('remplir');
    }
    await C.agirConstruction(c.uid, 'maj', { eau: Math.round(reste * 100) / 100, eauT: minutes() });
    return;
  }
  if (d.potager) {
    if (c.plante == null) {
      if (compter('graines') < 1) { message('Il faut un sachet de graines.'); return; }
      return lancerAction('Planter…', 2500, c.x + 1, c.y + 1, async () => { const r = await C.agirConstruction(c.uid, 'maj', { plante: minutes() }); if (r && r.ok) { mod.inv.removeItem('graines', 1); message('Semé. Dans trois jours, de quoi manger.'); } });
    }
    if (pousse(c) < 1) { message(`Pas encore. Encore ${Math.ceil((d.potager.jours * 1440 - (minutes() - c.plante)) / 60)} h.`); return; }
    return lancerAction('Récolter…', 2500, c.x + 1, c.y + 1, async () => {
      const r = await C.agirConstruction(c.uid, 'maj', { plante: null });
      if (r && r.ok) { mod.inv.addItem('legumes', d.potager.recolte); (mod.player && mod.player.gagnerXp) && mod.player.gagnerXp('chasse', 3); sfx('loot'); message(`Récolté : ${d.potager.recolte} poignées de légumes. Il faudra des graines pour replanter.`); }
    });
  }
  message(libelleConstruction(c));
}

// ---------- Meubles et portes : gestes secondaires ----------
export function secondaireMeuble(m) {
  if (!m || !DEMONTABLES[m.type]) return null;
  if (!cons.peutDemonterMeuble(m.type)) return { libelle: `Démonter ${m.nom} (marteau ou pied-de-biche)`, f: () => message('Il faut un marteau ou un pied-de-biche pour le démonter.') };
  return { libelle: `Démonter ${m.nom}`, f: () => demonterMeuble(m) };
}
export function demonterMeuble(m) {
  const D = DEMONTABLES[m.type]; if (!D) return;
  lancerAction(`Démonter ${m.nom}…`, D.ms * Math.max(0.5, 1 - 0.08 * niv('construction')), (m.x0 + m.x1 + 1) / 2, (m.y0 + m.y1 + 1) / 2, async () => {
    const r = await V.canal.demonterMeuble(m.cle);
    if (!r || !r.ok) { message('Impossible de le démonter.'); return; }
    cons.recevoir(r.rendu);
    (mod.player && mod.player.gagnerXp) && mod.player.gagnerXp('construction', REGLAGES.competences.XP_ACTIONS.demonter.construction || 2);
    sfx('loot');
    message(`Récupéré : ${r.rendu.map(x => `${mod.inv.nomObjet(x.id).toLowerCase()} ×${x.qty}`).join(', ')}.`);
  }, REGLAGES.exploration.BRUIT.demonter || 6);
}
export function secondairePorte(p, s) {
  if (!s || s.etat === 'cassee' || s.barricadee) return null;
  const ok = compter('planche') >= 2 && compter('clous') >= 4 && mod.inv && mod.inv.hasTag('marteler');
  return { libelle: 'Barricader (2 planches, 4 clous, marteau)', f: () => {
    if (!ok) { message('Pour barricader : 2 planches, 4 clous et un marteau.'); return; }
    lancerAction('Barricader la porte…', REGLAGES.exploration.PORTES.BARRICADER_MIN * 170, p.x + 0.5, p.y + 0.5, async () => {
      const r = await V.canal.porte(p.cle, 'barricader');
      if (!r || !r.ok) { message(r && r.raison === 'occupee' ? 'Quelque chose bloque la porte.' : 'Impossible.'); return; }
      mod.inv.removeItem('planche', 2); mod.inv.removeItem('clous', 4);
      (mod.player && mod.player.gagnerXp) && mod.player.gagnerXp('construction', REGLAGES.competences.XP_ACTIONS.barricader.construction || 10);
      sfx('porte_coup'); message('Barricadée. Derrière, on peut dormir.');
    }, 7);
  } };
}
// Pour les bancs d'essai : émettre l'ordre de placement comme le panneau.
export const placer = (type) => emit('construction:placer', { type });
