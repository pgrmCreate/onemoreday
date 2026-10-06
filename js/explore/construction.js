// ============ Exploration — construire, démonter, et ce que les constructions apportent ============
// Placement : le menu « Construire » (à part, à côté du Sac) émet 'construction:placer' { type } → un fantôme vert clair
// suit la souris (PC) ou se place devant toi — un toucher sur l'écran le pose où tu veux (tactile) ; rouge = impossible.
// Clic / bouton Poser = le personnage bâtit à cet endroit (action en temps réel : ne bouge pas, le marteau s'entend ; le
// chantier se dessine en se remplissant) ; T = tourner ; Échap = annuler. On reste en mode placement tant qu'on a de quoi
// (un mur après l'autre). Un mort qui approche coupe le placement et le chantier (js/explore/vue.js, alerteMort).
// Interactions : caisse (ouvrir, ranger), porte construite, feu (remettre du bois), récupérateur (boire, remplir),
// potager (récolter, replanter), lit (dormir), établi (fabriquer) ; touche G = geste secondaire (démonter, barricader).
// Contexte : établi, feu, point d'eau, dehors → fabrication et survie (2 fois par seconde).
import { G } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { CONSTRUCTIONS, DEMONTABLES, COMBUSTIBLES, casesConstruction, casesFinesConstruction, tailleConstruction } from '../data/construction.js';
import { FIN, icase, sousCases } from '../carte/catalogue.js';
import * as cons from '../game/construction.js';
import { setContexteFabrication } from '../game/crafting.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import { K } from './niveau.js';
import { mod, sfx, sfxA, message, niv, compter } from './commun.js';
import { ouvrirSommeil } from '../game/sommeil.js';
import { lancerAction } from './interactions.js';
import { commencerFouille } from './butin.js';

let V = null;
export function lierConstruction(v) { V = v; pointEau = null; if (v) { v.placement = null; v.retiresVus = ''; } }

const minutes = () => (G ? G.world.minutes : 0);
const defDe = (c) => CONSTRUCTIONS[c.type];
const consListe = () => (V && V.snap && V.snap.constructions) || [];
// Petites cases couvertes par un toit construit (étage E) — recalculée seulement quand les toits changent.
let toitsCache = null;
export function grilleToits(E) {
  if (!V || !E) return null;
  const L = consListe().filter(c => c.etage === E.id && CONSTRUCTIONS[c.type] && CONSTRUCTIONS[c.type].toit);
  const sig = E.id + '|' + L.map(c => c.uid).join(',');
  if (toitsCache && toitsCache.sig === sig) return toitsCache.g;
  const g = new Uint8Array(E.w * E.h);
  for (const c of L) for (const i of casesFinesConstruction(E, c)) g[i] = 1;
  toitsCache = { sig, g };
  return g;
}
const nomC = (c) => (defDe(c) || {}).nom || 'la construction';
const le = (c) => { const n = nomC(c); return /^[AEIOUYÉÈ]/i.test(n) ? `l'${n.toLowerCase()}` : `${/^(Caisse|Palissade|Porte|Barricade|Clôture|Fosse|Table|Chaise|Torche|Alarme)/.test(n) ? 'la' : /^(Barbelés)/.test(n) ? 'les' : 'le'} ${n.toLowerCase()}`; };
const feuAllume = (c) => (defDe(c) || {}).feu && (c.feuJusqua || 0) > minutes();

// ---------- Placement ----------
export function demarrerPlacement(type) {
  if (!V || !CONSTRUCTIONS[type]) return;
  if (V.arene) { message('Pas ici : tu es en pleine route.'); return; }
  V.placement = { type, rot: 0, x: 0, y: 0, ok: false, raison: '', cible: null };
  const tactile = V.entrees.etat.tactile || matchMedia('(pointer: coarse)').matches;
  message(tactile ? `${CONSTRUCTIONS[type].nom} : touche l'endroit voulu, puis « Poser ».` : `${CONSTRUCTIONS[type].nom} : choisis l'endroit, clic pour bâtir (T tourne, Échap arrête).`, 4200);
}
// Tactile : un toucher sur la carte place le fantôme à cet endroit (il y reste même si tu bouges).
export function viserPlacement(sx, sy) {
  if (!V || !V.placement || !V.rendu) return false;
  const m = V.rendu.ecranVersMonde(sx, sy);
  V.placement.cible = { x: m.x, y: m.y };
  return true;
}
export function annulerPlacement() { if (V && V.placement) { V.placement = null; return true; } return false; }
export function tournerPlacement() { if (V && V.placement) { V.placement.rot = (V.placement.rot + 1) % 2; return true; } return false; }
export const enPlacement = () => !!(V && V.placement);

// Une case marchable, libre, sans construction, sans personne (une barricade de fenêtre : une fenêtre).
function verifier(P) {
  const E = V.E, d = CONSTRUCTIONS[P.type];
  const bl = V.canal.grilles ? V.canal.grilles(E.id).bloque : E.bloque;
  const occ = new Set();
  // un toit ne gêne que les autres toits (on en pose au-dessus des murs, d'un lit, d'un feu…)
  for (const c of consListe()) if (c.etage === E.id && !!(CONSTRUCTIONS[c.type] || {}).toit === !!d.toit) for (const i of casesFinesConstruction(E, c)) occ.add(i);
  if (d.toit) {
    let dehors = 0;
    for (const [x, y] of casesConstruction(P.type, P.x, P.y, P.rot)) {
      if (x < 0 || y < 0 || x * FIN >= E.w || y * FIN >= E.h) return 'hors de la carte';
      const sous = sousCases(E, x, y);
      if (sous.some(i => occ.has(i))) return 'il y a déjà un toit';
      if (sous.some(i => { const pi = E.piece[i], Pc = pi >= 0 ? V.niveau.pieces[pi] : null; return Pc ? Pc.exterieur : V.niveau.exterieur; })) dehors++;
    }
    if (!dehors) return 'déjà à l\'abri ici';
    const [w, h] = tailleConstruction(P.type, P.rot);
    if (Math.hypot(P.x + w / 2 - V.j.x, P.y + h / 2 - V.j.y) > 3.2) return 'trop loin : approche-toi';
    return '';
  }
  for (const [x, y] of casesConstruction(P.type, P.x, P.y, P.rot)) {
    if (x < 0 || y < 0 || x * FIN >= E.w || y * FIN >= E.h) return 'hors de la carte';
    const sous = sousCases(E, x, y);       // les petites cases de l'unité (grille fine)
    if (sous.some(i => occ.has(i))) return 'déjà construit';
    if (d.pose === 'fenetre') { if (!sous.some(i => E.code[i] === K.FENETRE)) return 'il faut une fenêtre'; continue; }
    if (sous.some(i => E.code[i] !== K.SOL || bl[i])) return 'pas la place';
    if (d.bloque) {
      if (Math.hypot(V.j.x - x - 0.5, V.j.y - y - 0.5) < 0.8) return 'tu es dessus';
      for (const z of V.zListe) if (z.etage === E.id && Math.hypot(z.x - x - 0.5, z.y - y - 0.5) < 0.8) return 'quelqu\'un est là';
    }
  }
  const [w, h] = tailleConstruction(P.type, P.rot);
  if (Math.hypot(P.x + w / 2 - V.j.x, P.y + h / 2 - V.j.y) > 3.2) return 'trop loin : approche-toi';
  return '';
}
function majPlacement() {
  const P = V.placement, I = V.entrees.etat, j = V.j;
  const [w, h] = tailleConstruction(P.type, P.rot);
  let cx, cy;
  if (P.cible) { cx = P.cible.x; cy = P.cible.y; }
  else if (I.viseeSouris && !I.tactile) { const m = V.rendu.ecranVersMonde(I.sx, I.sy); cx = m.x; cy = m.y; }
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
  if (!P.ok) { message(`Impossible : ${P.raison}.`, 1800); sfx('clic'); return true; }
  const d = CONSTRUCTIONS[P.type], o = { type: P.type, etage: V.E.id, x: P.x, y: P.y, rot: P.rot };
  const chantier = { type: P.type, dessin: d.dessin, x: P.x, y: P.y, w: P.w, h: P.h, etage: V.E.id };
  P.cible = null;
  lancerAction(`Construire : ${d.nom.toLowerCase()}…`, cons.dureeConstructionMs(P.type), P.x + P.w / 2, P.y + P.h / 2, async () => {
    if (!cons.etatConstruction(o.type).faisable) { message('Il te manque des matériaux.'); return; }
    const r = await V.canal.construire({ ...o, minutes: minutes() });
    if (!r || !r.ok) { message(`Impossible : ${{ occupe: 'la place est prise', quelqu_un: 'quelqu\'un est dessus', fenetre: 'il faut une fenêtre', hors: 'hors de la carte' }[r && r.raison] || 'ça ne tient pas là'}.`); return; }
    cons.payerConstruction(o.type);
    sfx('porte_coup', { volume: 0.5 });
    message(`${d.nom} : fait.`, 1600);
    if (V && V.placement && !cons.etatConstruction(o.type).faisable) { V.placement = null; message(`${d.nom} : fait. Plus assez de matériaux pour un autre.`, 2600); }
  }, d.outils && d.outils.includes('marteler') ? 7 : 3, d.outils && d.outils.includes('marteler') ? 'clouer' : null);
  if (V.action) V.action.chantier = chantier;
  return true;
}
// Ce que le rendu dessine : le chantier en cours (il se remplit), sinon le fantôme du placement.
export function fantome() {
  if (!V) return null;
  const A = V.action;
  if (A && A.chantier) return { ...A.chantier, ok: true, chantier: Math.min(1, A.t / A.duree) };
  const P = V.placement; if (!P || A) return null;
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
    const f = defDe(c).feu;
    lampes[n++] = { x: c.x + 0.5, y: c.y + 0.5, dir: 0, forme: 'halo', angle: 360, portee: f.discret ? 2.6 : f.petit ? 4.2 : 6, sec: true, feu: true };
  }
  return n;
}
// ---------- Points d'eau : WC, baignoire, lavabo, évier (réserve, parfois à sec), fontaine, puits, rivière (inépuisables) ----------
const TYPES_EAU = new Set(['wc', 'baignoire', 'lavabo', 'cuisine', 'fontaine']);
let pointEau = null;
// remplirAuPointEau(index) : « Remplir » sur un contenant du sac → { ok, raison? }. La réserve est tenue par la simulation
// (partagée en co-op) ; l'eau est toujours croupie.
export async function remplirAuPointEau(index) {
  const it = G.player.inventaire[index], src = pointEau;
  if (!it) return { ok: false };
  if (!V || !src) return { ok: false, raison: 'Pas d\'eau à portée.' };
  const cap = mod.inv.contenance(it.id), avant = it.eau ? it.eau.L : 0, voulu = Math.round((cap - avant) * 100) / 100;
  if (voulu <= 0) return { ok: false, raison: 'Déjà plein.' };
  let L = voulu;
  if (src.cle) {
    const r = await V.canal.puiserEau(src.cle, voulu);
    V.snap = V.canal.instantane();
    if (!r || !r.ok) {
      if (r && r.raison === 'réseau') return { ok: false, raison: 'Pas de réponse de l\'autre joueur.' };
      majContexte();
      return { ok: false, raison: /toilettes/i.test(src.nom) ? 'Tu actionnes la chasse : le réservoir est vide.' : /baignoire/i.test(src.nom) ? 'La baignoire est sèche.' : 'Le robinet hoquette. Rien ne coule.' };
    }
    L = r.L;
  }
  const res = mod.inv.remplir(index, 'croupie', L);
  if (res && res.ok !== false) {
    sfx('remplir'); majContexte();
    message(src.infini ? 'Plein. L\'eau est trouble — à faire bouillir.' : L < voulu - 0.01 ? `Les dernières gouttes : ${String(Math.round(L * 10) / 10).replace('.', ',')} L. C'est tout ce qu'il y avait.` : 'Rempli. L\'eau a un goût de tuyau.', 2800);
  }
  return res;
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
    if (d.poste === 'table' && pres(cx, cy, 1.6)) etabli = true;
    if (feuAllume(c)) { if (pres(cx, cy, 2.2)) feu = true; if (pres(cx, cy, 3.5)) feuProche = true; }
  }
  const vusM = new Set();
  for (let dy = -2 * FIN; dy <= 2 * FIN; dy++) for (let dx = -2 * FIN; dx <= 2 * FIN; dx++) {
    const x = Math.floor(j.x * FIN) + dx, y = Math.floor(j.y * FIN) + dy;
    if (x < 0 || y < 0 || x >= E.w || y >= E.h) continue;
    const mi = E.meuble ? E.meuble[y * E.w + x] : -1;
    if (mi == null || mi < 0 || vusM.has(mi)) continue;
    const m = V.niveau.meubles[mi]; if (!m || (V.retires && V.retires.has(m.cle))) continue;
    if (Math.hypot((x + 0.5) / FIN - j.x, (y + 0.5) / FIN - j.y) > 1.6) continue;
    vusM.add(mi);
    if (['table', 'table_ronde', 'bureau', 'machine', 'comptoir'].includes(m.type)) etabli = true;
    if (m.marqueur === 'etabli') etabliVrai = etabli = true;
    if (TYPES_EAU.has(m.type) || m.eau) {   // réserve à sec (déjà vidée, ou rien n'en coule) : on cherche ailleurs
      const reste = V.snap && V.snap.eau ? V.snap.eau[m.cle] : undefined;
      if (!(reste <= 0.01) && (!eau || !eau.infini)) eau = { cle: m.cle, nom: m.nom, infini: m.type === 'fontaine' || !!m.eau };
    }
  }
  // cases d'eau (rivière, canal, étang, bassin) et marqueurs d'eau : inépuisables
  const portee = REGLAGES.exploration.EAU.PORTEE;
  if (!eau || !eau.infini) {
    for (let dy = -2 * FIN; dy <= 2 * FIN && !(eau && eau.infini); dy++) for (let dx = -2 * FIN; dx <= 2 * FIN; dx++) {
      const x = Math.floor(j.x * FIN) + dx, y = Math.floor(j.y * FIN) + dy;
      if (x < 0 || y < 0 || x >= E.w || y >= E.h || E.code[y * E.w + x] !== K.EAU) continue;
      if (Math.hypot((x + 0.5) / FIN - j.x, (y + 0.5) / FIN - j.y) > portee) continue;
      eau = { cle: null, nom: 'l\'eau', infini: true }; break;
    }
  }
  for (const mk of Object.values(V.niveau.marqueurs || {})) if (mk && mk.eau && mk.etage === E.id && pres(mk.x + 0.5, mk.y + 0.5, 2)) eau = { cle: null, nom: 'l\'eau', infini: true };
  pointEau = eau;
  const ij = icase(E, j.x, j.y), pi = ij >= 0 ? E.piece[ij] : -1, P = pi >= 0 ? V.niveau.pieces[pi] : null;

  try { setContexteFabrication({ etabli, etabliVrai, feu, lieu: V.lieuId }); } catch (e) {}
  // dehors / à l'abri : calculés par la vue (toits construits, murs autour) — voir explore/vue.js, abri()
  const A = V.abri || { exterieur: P ? !!P.exterieur : !!V.niveau.exterieur, abrite: P ? !P.exterieur : !V.niveau.exterieur };
  try { mod.survie && mod.survie.setContexteSurvie && mod.survie.setContexteSurvie({ exterieur: A.exterieur, abrite: A.abrite, feuProche, sourceEau: eau ? 'croupie' : null }); } catch (e) {}
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

// Une construction qui fait quelque chose quand on interagit (un mur nu, non : on ne peut que le démonter).
export function constructionActive(c) { const d = defDe(c); return !!(d && (d.contenance || d.porte || d.lit || d.poste || d.feu || d.eau || d.potager)); }
// Libellé du geste principal (E) et du geste secondaire (démonter : dans le menu des autres actions).
export function libelleConstruction(c) {
  const d = defDe(c); if (!d) return null;
  if (d.contenance) return `Ouvrir ${le(c)}${c.n ? ` (${c.n} objet${c.n > 1 ? 's' : ''})` : ' (vide)'}`;
  if (d.porte) return c.ouverte ? 'Fermer la porte' : 'Ouvrir la porte';
  if (d.lit) return 'Dormir dans le lit';
  if (d.poste === 'etabli') return 'Fabriquer à l\'établi';
  if (d.feu) return feuAllume(c) ? `Remettre du bois (${String(Math.round((c.feuJusqua - minutes()) / 60 * 10) / 10).replace('.', ',')} h restantes)` : d.feu.petit && !d.poste ? 'Rallumer la torche' : 'Rallumer le feu';
  if (d.eau) { const L = eauRecuperee(c); return L < 0.1 ? 'Récupérateur : vide (il attend la pluie)' : besoinEau() ? `Boire l'eau de pluie (${L.toString().replace('.', ',')} L)` : `Remplir tes contenants (${L.toString().replace('.', ',')} L)`; }
  if (d.potager) { if (c.plante == null) return 'Planter des graines'; const p = pousse(c); return p >= 1 ? `Récolter (${d.potager.recolte} légumes)` : `Potager : ${p < 0.34 ? 'ça germe' : p < 0.67 ? 'ça pousse' : 'presque prêt'}`; }
  return `${d.nom}${c.pv < c.pvMax ? ` (${Math.round(100 * c.pv / c.pvMax)} %)` : ''}`;
}
export function secondaireConstruction(c) {
  const d = defDe(c); if (!d) return null;
  // geste secondaire : proposé seulement si on peut le faire
  if (!(mod.inv && (mod.inv.hasTag('marteler') || mod.inv.hasTag('forcer'))) && d.outils && d.outils.length) return null;
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
    // on met au feu le meilleur bois qu'on a (bûche, planche, branche, brindilles)
    const bois = COMBUSTIBLES.find(([id]) => compter(id) > 0);
    if (!bois) { message(feuAllume(c) ? 'Il faudrait du bois pour l\'entretenir (bûche, planche, branche).' : 'Il faut du bois (et de quoi allumer).'); return; }
    if (!feuAllume(c) && !(mod.inv && mod.inv.hasTag('allumer'))) { message('Il faut un briquet ou des allumettes.'); return; }
    // rallumer : le briquet si on en a un, sinon les allumettes ; remettre du bois : le feu qui reprend
    const sonFeu = feuAllume(c) ? 'allumer' : compter('briquet') > 0 ? 'briquet' : compter('allumettes') > 0 ? 'allumette' : 'allumer';
    return lancerAction(feuAllume(c) ? 'Remettre du bois…' : 'Rallumer…', 1600, c.x + 0.5, c.y + 0.5, async () => {
      const gain = Math.round(bois[1] * (d.feu.bois / 60));
      const fin = Math.max(minutes(), c.feuJusqua || 0) + gain;
      const r = await C.agirConstruction(c.uid, 'maj', { feuJusqua: Math.min(fin, minutes() + 8 * 60) });
      if (r && r.ok) { mod.inv.removeItem(bois[0], 1); sfx(sonFeu); message(`Le feu reprend (${mod.inv.nomObjet(bois[0]).toLowerCase()}).`); }
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
  if (!cons.peutDemonterMeuble(m.type)) return null;     // geste secondaire : seulement avec marteau ou pied-de-biche
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
  // geste secondaire : proposé seulement quand on a de quoi (2 planches, 4 clous, un marteau)
  if (!(compter('planche') >= 2 && compter('clous') >= 4 && mod.inv && mod.inv.hasTag('marteler'))) return null;
  return { libelle: 'Barricader la porte', f: () => {
    lancerAction('Barricader la porte…', REGLAGES.exploration.PORTES.BARRICADER_MIN * 170, p.x + 0.5, p.y + 0.5, async () => {
      const r = await V.canal.porte(p.cle, 'barricader');
      if (!r || !r.ok) { message(r && r.raison === 'occupee' ? 'Quelque chose bloque la porte.' : 'Impossible.'); return; }
      mod.inv.removeItem('planche', 2); mod.inv.removeItem('clous', 4);
      (mod.player && mod.player.gagnerXp) && mod.player.gagnerXp('construction', REGLAGES.competences.XP_ACTIONS.barricader.construction || 10);
      sfx('porte_coup'); message('Barricadée. Derrière, on peut dormir.');
    }, 7, 'clouer');
  } };
}
// Pour les bancs d'essai : émettre l'ordre de placement comme le panneau.
export const placer = (type) => emit('construction:placer', { type });
