// ============ Temps 1 — l'écran d'exploration (REFONTE §5, §12.3) — le cœur ============
// entrer({ lieuId, entree }), sortir(), pause(), reprise() ; combatIci(spec), embuscade(spec) (combat_lieu.js).
// Parle au monde UNIQUEMENT via un canal (obtenirCanal) : local (solo/hôte) ou distant (invité).
// Modules de l'écran : commun.js (outils), interactions.js (la touche E), butin.js (fouille), combat_vue.js (gestes),
// combat_lieu.js (combats de scène, embuscades), hud_explore.js (DOM), ../rendu/rendu.js (l'image).
// Crochets de test : definirCrochets({ scene, obtenirCanal }) (banc d'essai dev/explore.html).
import { G, getFlag, avantSauvegarde } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, clamp } from '../core/util.js';
import { pref, setPref } from '../core/prefs.js';
import * as flow from '../game/flow.js';
import { lieu as lieuDe, chargerNiveau } from '../game/donnees.js';
import { REGLAGES, presetDifficulte } from '../data/reglages.js';
import { ZOMBIES } from '../data/zombies.js';
import { QUETES } from '../data/histoire/quetes.js';
import { parserNiveau } from './niveau.js';
import { icase, FIN } from '../carte/catalogue.js';
import { creerSimLieu } from './sim.js';
import { creerCanalLocal } from './canal_local.js';
import { creerChamp, calculerLOS, calculerVision, lumiereLampe } from './vision.js';
import { deplacer } from './physique.js';
import { creerRendu } from '../rendu/rendu.js';
import { biomeAutour } from '../rendu/atmosphere.js';
import { creerEntrees } from './entrees.js';
import { creerCombatVue } from './combat_vue.js';
import { genererEmbuscade } from './embuscade.js';
import { creerHud } from './hud_explore.js';
import { mod, chargerOptionnels, lierCommun, vib, sfx, sfxA, posPorte, verifierCondition, compter, niv, message, afficherLieu, caseLibrePres } from './commun.js';
import { lierButin, avancerFouille, interrompreFouille, fermerButin, fournisseurSol, fournisseurProximite, majProximite, ouvrirSol, nombreAuSol } from './butin.js';
import { lierInteractions, chercherCible, majInvite, interagir, basculerChoix, fermerChoix, choisir, avancerAction, majPnj, declencheursEntree, zones, piece } from './interactions.js';
import { lierCombatLieu, combatIci as combatIci_, embuscade as embuscade_, suivreCombat, finArene } from './combat_lieu.js';
import { lierNature, majRecherche, basculerRecherche, vitesseRecherche, enRecherche } from './nature.js';
import { lierConstruction, demarrerPlacement, annulerPlacement, tournerPlacement, enPlacement, poserPlacement, viserPlacement, majConstruction, feuxCommeLampes, fantome, grilleToits } from './construction.js';
import { intensiteRuee, rueeIdActive, etatRuee, lieuDansZone } from '../game/ruees.js';

export { verifierCondition };
const RX = REGLAGES.exploration, RL = REGLAGES.lumiere;
const RAYON = 0.3;
const JOUEUR_ID = 'local';
// Zoom à trois crans (petit bouton discret en bas à gauche) : large, normal, proche. La molette et le pincement restent libres.
const CRANS_ZOOM = [0.72, 1, 1.4];
const cranZoom = (z) => { let b = 0; for (let i = 1; i < CRANS_ZOOM.length; i++) if (Math.abs(CRANS_ZOOM[i] - z) < Math.abs(CRANS_ZOOM[b] - z)) b = i; return b; };
const EVTS_COMBAT = ['telegraphe', 'fente', 'attaque', 'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule'];

// ---------- Crochets remplaçables ----------
let crochets = { scene: (id) => flow.scene(id), obtenirCanal: null, coop: null };
export function definirCrochets(c) { crochets = { ...crochets, ...c }; }

// ---------- Canal ----------
const niveauxParses = {};
export async function obtenirCanal(lieuId, niveau, L) {
  if (crochets.obtenirCanal) return crochets.obtenirCanal(lieuId, niveau, L);
  const W = G.world;
  const etat = W.lieux[lieuId] && W.lieux[lieuId].etat;
  const diff = presetDifficulte(W.difficulte || (G.options && G.options.difficulte));
  const sim = creerSimLieu({
    lieuId, niveau, etat, seed: W.seed, danger: L.danger ?? 0.3, pool: L.pool || niveau.pool,
    minutes: W.minutes, typeButin: L.typeButin || L.type || niveau.typeButin, mortsN: (L.morts && L.morts.n) || (niveau.morts && niveau.morts.n),
    repeuplement: L.repeuplement, coop: G.mode !== 'solo', difficulte: diff, mult: L.abondance || 1,
    getFlag: (k) => getFlag(k),
    getRuee: () => { const i = intensiteRuee(lieuId); return i ? { i, id: rueeIdActive() } : null; },
  });
  return creerCanalLocal(sim, JOUEUR_ID);
}
export function niveauParse(id, def) { return niveauxParses[id] || (niveauxParses[id] = parserNiveau(def)); }

// ---------- État de la vue ----------
let V = null;
const vue = () => V;

export async function entrer({ lieuId, entree, arene = null } = {}) {
  if (V) sortir();
  await chargerOptionnels();
  lienCss();
  let L, idNiveau, def, niveau;
  if (arene) {
    lieuId = '__embuscade';
    def = genererEmbuscade({ seed: arene.seed, echelle: arene.echelle });
    L = { id: lieuId, nom: def.nom, echelle: arene.echelle || 'region', danger: arene.danger ?? 0.4 };
    idNiveau = lieuId; niveau = parserNiveau(def);
  } else {
    L = lieuDe(lieuId) || { id: lieuId, nom: lieuId, echelle: 'salon' };
    idNiveau = L.niveau === undefined ? lieuId : (L.niveau || lieuId);
    def = await chargerNiveau(idNiveau);
    if (!def) { flow.toast(`${L.nom || lieuId} : impossible d'y entrer (plan manquant).`); try { await flow.ouvrirCarte({ echelle: L.echelle || 'salon' }); } catch (e) {} return; }
    niveau = niveauParse(idNiveau, def);
  }
  for (const a of niveau.avertissements) console.warn(`[niveau ${idNiveau}] ${a}`);

  const racine = el('div', { class: 'explore' + (arene ? ' ex-arene' : '') });
  const canvas = el('canvas', { class: 'ex-canvas' });
  racine.append(canvas);
  const hud = creerHud(racine, { arene: !!arene });
  flow.stage().append(racine);

  V = {
    lieuId, L, niveau, racine, canvas, hud, actif: true, enPause: false, occupe: false,
    champs: niveau.etages.map(creerChamp), E: null, C: null,
    j: { x: 0, y: 0, etage: null, dir: 0, vx: 0, vy: 0, allure: 'immobile', marche: 0, lumiere: 1 },
    lampes: [], nLampes: 0, lampeMoi: { x: 0, y: 0, dir: 0, forme: 'cone', angle: 60, portee: 9, sec: false },
    snap: null, tSnap: 0, zInterp: new Map(), zListe: [], ondes: [], dernOnde: new Map(),
    pairsVus: [], pInterp: new Map(),
    cible: null, tCible: 0, fouille: null, butin: null, action: null, carte: false,
    piece: -1, tPos: 0, tPnj: 0, pnj: [], off: [], raf: 0, tPrec: performance.now(), msgT: 0,
    zoom: pref('zoomExplore') || 1, zonesDedans: new Set(), arene, periode: 50, tSnapPrec: performance.now(),
    tVis: 0, tSnapVis: 0, ralenti: null, tGuide: 0,
  };
  lierTout(V);
  if (arene) {
    const W = G.world;
    const sim = creerSimLieu({ lieuId, niveau, etat: null, seed: `${W.seed}:${arene.seed}`, danger: L.danger, pool: arene.pool || ['errant'],
      minutes: W.minutes, mortsN: [0, 0], coop: false, difficulte: presetDifficulte(W.difficulte || (G.options && G.options.difficulte)) });
    V.canal = creerCanalLocal(sim, JOUEUR_ID);
  } else V.canal = await obtenirCanal(lieuId, niveau, L);
  if (!V) return;

  // position de départ
  let pos = null;
  const P = G.player.position;
  if (!entree && P && P.mode === 'lieu' && P.lieu === lieuId && P.etage && P.x != null && niveau.etageIdx[P.etage] != null) {
    const ab = niveau.abords, avant = P.abords || { dx: 0, dy: 0 };     // position sauvée avant les abords : décalée
    const dx = ab ? ab.dx - (avant.dx || 0) : 0, dy = ab ? ab.dy - (avant.dy || 0) : 0;
    pos = { etage: P.etage, x: P.x + dx, y: P.y + dy };
  }
  if (!pos) {
    const e = (entree && (niveau.entrees[entree] || caseLibrePres(niveau, niveau.marqueurs[entree]))) || niveau.entrees.defaut;
    if (entree && !niveau.entrees[entree] && !niveau.marqueurs[entree]) console.warn(`[explore] entrée « ${entree} » inconnue dans ${idNiveau}`);
    pos = { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5 };
  }
  V.j.x = pos.x; V.j.y = pos.y; V.j.dir = Math.PI / 2;
  ajouterJoueurSim(pos);
  changerEtage(pos.etage);
  if (!arene) {
    G.world.lieux[lieuId] = { ...(G.world.lieux[lieuId] || {}), decouvert: true, visite: true };
    emit('lieu:entre', { lieu: lieuId });
  }
  V.snap = V.canal.instantane(); V.tSnap = performance.now(); majInterp(true);
  V.off.push(on('construction:placer', ({ type }) => { if (V) demarrerPlacement(type); }));

  // rendu + entrées
  V.rendu = creerRendu(canvas, niveau);
  V.rendu.setZoom(V.zoom);
  V.entrees = creerEntrees({ racine, canvas, actions: {
    interagir: (o) => interagir(o), lampe: basculerLampe, inventaire: ouvrirInventaire,
    carte: () => { V.carte = !V.carte; }, echap, zoom: (f) => regleZoom(V.zoom * f),
    accroupi: () => {}, aide: () => V && V.hud.basculerAide(),
    frapper: (appui, annule, mode) => { if (!V || !V.cbt || V.occupe) return; if (enPlacement()) { if (appui) poserPlacement(); return; } if (appui) stopperActions(); V.cbt.frapper(appui, annule, mode); },
    crosse: (appui, annule) => { if (!V || !V.cbt || V.occupe || enPlacement()) return; if (appui) stopperActions(); V.cbt.frapper(appui, annule, 'crosse'); },
    clicDroit: (appui) => { if (!V || !V.cbt || V.occupe) return; if (enPlacement()) { if (appui) tournerPlacement(); return; } if (appui) stopperActions(); V.cbt.clicDroit(appui); },
    secondaire: () => basculerChoix(),
    recherche: () => { if (V && !V.arene) basculerRecherche(); },
    sol: () => { if (V && !V.occupe && !V.enPause) ouvrirSol(); },
    viser: (sx, sy) => viserPlacement(sx, sy),
    tourner: () => tournerPlacement(),
    pousser: () => { if (!V || !V.cbt || V.occupe) return; stopperActions(); V.cbt.pousser(); },
    recharger: () => V && V.cbt && V.cbt.recharger(),
    echangerMains: () => V && V.cbt && V.cbt.echangerMains(),
    dos: () => V && V.cbt && V.cbt.dos(),
    rapide: (i) => { if (!V) return; if (V.choix) { choisir(i); return; } if (i < 4 && V.cbt) V.cbt.rapide(i); },
  } });
  hud.majZoom(cranZoom(V.zoom));
  hud.zoom.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); });
  hud.zoom.addEventListener('click', () => { if (!V) return; const c = cranZoom(V.zoom); regleZoom(CRANS_ZOOM[(c + 1) % CRANS_ZOOM.length]); });
  V.cbt = creerCombatVue({
    canal: V.canal, j: () => V.j, zombies: () => V.zListe, message, sfx, sfxA, vib, inv: mod.inv, player: mod.player, survie: mod.survie, entrees: V.entrees,
    tactile: () => !!(V.entrees.etat.tactile || matchMedia('(pointer: coarse)').matches), pause: () => !V || V.enPause || V.occupe || !!G.player.agonie,
    bousculer: (dx, dy) => { if (!V) return; tmpPos.x = V.j.x; tmpPos.y = V.j.y; deplacer(V.E.w, V.E.h, grilleBloque(), tmpPos, dx, dy, RAYON); V.j.x = tmpPos.x; V.j.y = tmpPos.y; },
    effets: () => V && V.rendu && V.rendu.effets, etage: () => V && V.E, mouvement: () => V.entrees.etat,
    solo: G.mode === 'solo' && !arene, ralentir: (f, ms) => { if (!V) return; V.ralenti = { f, fin: performance.now() + ms }; V.canal.echelle && V.canal.echelle(f, ms); },
  });
  for (const t of EVTS_COMBAT) V.off.push(V.canal.on(t, (e) => { if (V && V.cbt) V.cbt.surEvt(e); }));
  V.off.push(on('mort', () => { if (!V) return; V.cbt.mourir(); V.entrees.actif(false); }));
  V.off.push(on('inventaire', () => { if (!V) return; V.cbt.majStats(); V.hud.majMains(V, mod.inv); }));
  // enfiler / retirer un vêtement, un sac : le froissement du tissu (l'arme et la lampe ont leurs propres gestes)
  V.off.push(on('inventaire', (e) => { const s = e && (e.equip || e.desequip); if (s && !['arme', 'mainG', 'lampe'].includes(s)) sfx('vetement'); }));
  V.hud.majMains(V, mod.inv);
  // HUD des mains : main droite → la ranger d'où elle vient ; dos → sortir / remettre ; ⇄ → échanger les mains ;
  // cases de ceinture → sortir / remettre (comme les touches 1-4).
  hud.mains.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]'); if (!b || !V) return;
    const m = b.dataset.m;
    if (m === 'dos') V.cbt.dos();
    else if (m === 'echanger') V.cbt.echangerMains();
    else if (m === 'droite') V.cbt.rangerMain();
    else if (m.startsWith('rapide')) V.cbt.rapide(+m.slice(6));
  });
  hud.route.addEventListener('click', () => { if (V && V.arene) finArene('route'); });
  const onResize = () => V && V.rendu.resize();
  window.addEventListener('resize', onResize);
  V.off.push(() => window.removeEventListener('resize', onResize));

  // événements du monde
  const C = V.canal;
  V.off.push(C.on('tick', () => {
    const t = performance.now(); V.periode = Math.max(30, Math.min(200, V.periode * 0.8 + (t - V.tSnapPrec) * 0.2)); V.tSnapPrec = t;
    V.snap = C.instantane(); V.tSnap = t; V.tSnapVis = V.tVis; majInterp(false); ecouter();
  }));
  V.off.push(C.on('porte', (e) => {
    const pp = posPorte(e.cle);
    if (e.action === 'coup') { if (pp) { sfxA('porte_coup', ...pp, 16); V.rendu.effets.eclats(pp[2], pp[0], pp[1], Math.random() * 6.28); } onde(e.cle, true); }
    else if (e.action === 'casse' || e.action === 'enfoncee') { if (pp) { sfxA('porte_casse', ...pp, 24); V.rendu.effets.eclats(pp[2], pp[0], pp[1], Math.random() * 6.28); } onde(e.cle, true); }
    else if (e.source !== (C.joueurId || JOUEUR_ID) && (e.action === 'ouvre' || e.action === 'ferme') && pp) sfxA('porte', ...pp, 12);
  }));
  V.off.push(C.on('zombie', (e) => { if (e.etat === 'chasse') { const z = V.zInterp.get(e.uid); if (z && z._vu) sfx('alerte'); else if (z) sfxA('zombie_loin', z.x, z.y, z.etage, 14); } }));
  // les sirènes arrivent ici (simulation : réveil + renforts) : on le voit et on l'entend tout de suite
  V.off.push(C.on('ruee', () => { V.tSirene = 0; message('Les sirènes ! Partout, les morts se lèvent et courent vers le bruit.', 3800); }));
  V.off.push(C.on('hurlement', (e) => { const z = e && V.zInterp.get(e.uid); if (z) sfxA('hurlement', z.x, z.y, z.etage, 40); else sfx('hurlement', { volume: 0.5 }); }));
  V.off.push(avantSauvegarde(() => {
    if (!V || !V.canal.sauver || V.arene) return;
    const etat = V.canal.sauver(G.world.minutes);
    if (etat) G.world.lieux[V.lieuId] = { ...(G.world.lieux[V.lieuId] || {}), etat };
    G.player.position = { mode: 'lieu', lieu: V.lieuId, etage: V.j.etage, x: +V.j.x.toFixed(2), y: +V.j.y.toFixed(2), abords: abordsDe(V) };
  }));
  // météo : la pluie se voit dehors (et s'entend étouffée sous un toit), le mistral pousse les feuilles
  import('../game/meteo.js').then(m => { if (V) { V.pluie = m.pluie(); V.vent = m.vent ? m.vent() : 0.3; V.meteo = m.meteo ? m.meteo() : 'clair'; } }).catch(() => {});
  V.off.push(on('meteo', (e) => { if (V) { V.pluie = e.pluie || 0; if (e.vent != null) V.vent = e.vent; if (e.type) V.meteo = e.type; } }));
  V.dehorsSon = null;
  const majBoutonLampe = () => {
    if (!V) return;
    const a = !!(G.player.equip && G.player.equip.lampe) || G.player.inventaire.some(it => RL.SOURCES[it.id]);
    V.entrees.setVisible && V.entrees.setVisible('lampe', a);
    V.entrees.setBouton('lampe', { actif: !!lampeActive() });
  };
  majBoutonLampe();
  V.off.push(on('inventaire', majBoutonLampe));
  V.off.push(on('quete', (e) => { if (!V) return; V.tGuide = 0; if (e && !e.distant && e.etape !== 'fin') sfx('decouverte'); }));
  V.off.push(on('flag', () => { if (V) { V.tGuide = 0; majObjetsDrapeaux(); } }));
  majObjetsDrapeaux();
  if (mod.inv && mod.inv.setSol) mod.inv.setSol(fournisseurSol());
  if (mod.inv && mod.inv.setProximite) mod.inv.setProximite(fournisseurProximite());
  if (!mod.panneaux) import('../ui/panels/index.js').then(m => { mod.panneaux = m; }).catch(() => {});

  V.raf = requestAnimationFrame(boucle);
  if (G.mode === 'solo') clock.setVitesse(((REGLAGES.temps.VITESSE_SOLO || {}).exploration) ?? 1);
  if (!arene) setTimeout(() => { if (V && !V.enPause) declencheursEntree(); }, 350);
  else {
    afficherLieu(def.nom);
    const uids = await V.canal.faireApparaitre(arene.zombies || ['errant'], { surprise: arene.surprise });
    if (V) suivreCombat(V, uids, { arene: true }).then((r) => finArene(r.issue === 'victoire' ? 'nettoye' : r.issue, r));
  }
}
function lierTout(v) {
  lierCommun(v); lierButin(v);
  lierInteractions(v, { changerEtage, sortir, finArene, scene: (id) => crochets.scene(id), coop: crochets.coop });
  lierCombatLieu(v, { entrer, sortir, vue });
  lierConstruction(v); lierNature(v);
}
function regleZoom(z) {
  if (!V) return;
  V.zoom = clamp(z, 0.55, 2); V.rendu.setZoom(V.zoom * (V.zoomCbt || 1)); setPref('zoomExplore', V.zoom);
  V.hud.majZoom(cranZoom(V.zoom));
}
function stopperActions() { fermerChoix(); if (V.fouille || V.butin || V.action) { interrompreFouille(); fermerButin(); V.action = null; V.hud.barre.classList.add('cache'); } }
function ajouterJoueurSim(pos) {
  const C = V.canal;
  if (C.ajouterJoueur) C.ajouterJoueur(pos, { nom: G.player.nom, discretion: niv('discretion') });
  else C.majJoueur({ ...pos, nom: G.player.nom, discretion: niv('discretion') });
}

export function sortir() {
  if (!V) return;
  const v = V;
  v.actif = false;
  cancelAnimationFrame(v.raf);
  try { interrompreFouille(); } catch (e) {}
  try { v.cbt && v.cbt.fermer(); } catch (e) {}
  if (!v.arene) try {
    const etat = v.canal.sauver ? v.canal.sauver(G.world.minutes) : null;
    if (etat) G.world.lieux[v.lieuId] = { ...(G.world.lieux[v.lieuId] || {}), etat };
    G.player.position = { mode: 'lieu', lieu: v.lieuId, etage: v.j.etage, x: +v.j.x.toFixed(2), y: +v.j.y.toFixed(2), abords: abordsDe(v) };
  } catch (e) { console.error(e); }
  for (const f of v.off) { try { f(); } catch (e) {} }
  try { v.entrees && v.entrees.fermer(); } catch (e) {}
  try { v.rendu && v.rendu.fermer(); } catch (e) {}
  try { v.canal.fermer && v.canal.fermer(); } catch (e) {}
  if (mod.inv && mod.inv.setSol) { const pile = []; mod.inv.setSol({ lister: () => pile, deposer: (it) => pile.push({ ...it }), prendre: (i) => pile.splice(i, 1)[0] || null }); }
  if (mod.inv && mod.inv.setProximite) mod.inv.setProximite(null);
  try { mod.audio && mod.audio.setTension && mod.audio.setTension(0); } catch (e) {}
  try { mod.audio && mod.audio.setHorde && mod.audio.setHorde(0); } catch (e) {}
  try { mod.audio && mod.audio.setNature && mod.audio.setNature(null); } catch (e) {}
  try { mod.audio && mod.audio.setDedans && mod.audio.setDedans(1); } catch (e) {}
  v.racine.remove();
  if (!v.arene) emit('lieu:sort', { lieu: v.lieuId });
  V = null;
  lierTout(null);
  for (const f of v.attentes || []) { try { f(); } catch (e) {} }
}
export function pause() {
  if (!V || V.enPause) return;
  V.enPause = true;
  V.entrees && V.entrees.actif(false);
  if (G.mode === 'solo' && V.canal.pause) V.canal.pause();
  cancelAnimationFrame(V.raf);
  V.canal.majJoueur({ allure: 'immobile' });
}
export function reprise() {
  if (!V || !V.enPause) return;
  V.enPause = false;
  if (V.canal.reprise) V.canal.reprise();
  if (!V.occupe && !(V.cbt && V.cbt.etat.mort)) V.entrees.actif(true);
  V.tPrec = performance.now();
  V.raf = requestAnimationFrame(boucle);
}
export function etatDebug() { return V; }
export function actif() { return !!V && !V.arene; }
export function enArene() { return !!(V && V.arene); }
export const combatIci = (spec) => combatIci_(spec);
export const embuscade = (spec) => embuscade_(spec);
// Position et état du joueur local (co-op : relève, téléportation auprès du coéquipier)
export function joueurLocal() { return V ? { lieu: V.lieuId, etage: V.j.etage, x: V.j.x, y: V.j.y } : null; }
export function teleporterLocal(etage, x, y) {
  if (!V || V.niveau.etageIdx[etage] == null) return false;
  if (etage !== V.j.etage) changerEtage(etage);
  V.j.x = x; V.j.y = y; V.j.vx = V.j.vy = 0;
  V.canal.majJoueur({ etage, x, y });
  V.rendu.recaler();
  return true;
}

function lienCss() {
  if (document.querySelector('link[href*="explore.css"]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = new URL('../../css/explore.css', import.meta.url).href;
  document.head.append(l);
}
function changerEtage(etage) {
  const n = V.niveau;
  V.E = n.etages[n.etageIdx[etage]];
  V.C = V.champs[V.E.idx];
  V.j.etage = etage;
  V.piece = -1;
  if (V.rendu) V.rendu.recaler();
}

// ---------- Boucle ----------
const tmpPos = { x: 0, y: 0 };
function boucle(t) {
  if (!V || !V.actif || V.enPause) return;
  V.raf = requestAnimationFrame(boucle);
  let dt = Math.min(50, t - V.tPrec); V.tPrec = t;
  if (V.ralenti) { if (t < V.ralenti.fin) dt *= V.ralenti.f; else V.ralenti = null; }
  try { image(t, dt); } catch (e) { console.error('[explore]', e); }
}
function image(t, dt) {
  const j = V.j, E = V.E, C = V.C, I = V.entrees.etat;
  const bloque = grilleBloque();
  const ech = V.cbt.echelleTemps();           // micro-arrêt à l'impact : l'image se fige un instant
  const dtv = dt * ech;
  V.tVis += dtv;
  // --- déplacement ---
  const libre = !V.occupe && !V.action;
  let mx = libre ? I.mx : 0, my = libre ? I.my : 0;
  V.cbt.maj(dt);
  const pousse = Math.min(1, Math.hypot(mx, my));
  const sta = G.player.sta, staMax = G.player.staMax || 100;
  let allure = pousse < 0.05 ? 'immobile' : I.accroupi ? 'accroupi' : 'marche';
  if (allure !== 'immobile' && I.course && !I.accroupi && pousse > 0.35 && !enRecherche()) {
    if (sta > RX.COURSE_STA_MIN || (j.allure === 'course' && sta > 0)) allure = 'course';
  }
  let v = RX.VITESSE[allure === 'immobile' ? 'marche' : allure] || 3.2;
  if (allure === 'accroupi') v *= 1 + RX.ACCROUPI_VITESSE_AGILITE * niv('agilite');
  try { if (mod.player && mod.player.vitesseMarche) v *= mod.player.vitesseMarche(G.player); } catch (e) {}
  if (G.player.agonie) v *= 0.22;                 // à terre (co-op) : on rampe
  v *= V.cbt.vitesseMult() * vitesseRecherche();
  {
    const cible = pousse > 0 ? v * pousse : 0;
    const k = 1 - Math.exp(-dtv / RX.INERTIE_MS);
    const ux = pousse > 0 ? mx / Math.hypot(mx, my) : 0, uy = pousse > 0 ? my / Math.hypot(mx, my) : 0;
    j.vx += (ux * cible - j.vx) * k; j.vy += (uy * cible - j.vy) * k;
  }
  if (Math.abs(j.vx) + Math.abs(j.vy) > 1e-3) {
    tmpPos.x = j.x; tmpPos.y = j.y;
    deplacer(E.w, E.h, bloque, tmpPos, j.vx * dtv / 1000, j.vy * dtv / 1000, RAYON);
    j.x = tmpPos.x; j.y = tmpPos.y;
  }
  const vReelle = Math.hypot(j.vx, j.vy);
  j.marche = Math.min(1, vReelle / 2.5);
  j.allure = vReelle < 0.2 ? 'immobile' : allure;
  if (j.allure === 'course' && Math.random() < dt / 160) V.rendu.effets.poussiere(j.etage, j.x - j.vx * 0.05, j.y - j.vy * 0.05, 1);
  // endurance
  const S = REGLAGES.survie.STA_HORS_COMBAT || { repos: 10, marche: 6, accroupi: 7 };
  let dS;
  const tm = performance.now();   // modificateurs du corps (faim, douleur, nausée, surpoids…), recalculés 2 fois/s
  if (!V.mods || tm - V.tMods > 500) { V.tMods = tm; try { V.mods = mod.player && mod.player.modificateurs ? mod.player.modificateurs(G.player) : null; } catch (e) { V.mods = null; } }
  const M = V.mods || { staCout: 1, regenSta: 1 };
  if (j.allure === 'course') {
    // on s'essouffle vite à bas niveau : la dépense baisse avec l'Agilité, monte avec la fatigue et le surpoids
    let k = Math.max(0.45, 1 - RX.COURSE_AGILITE * niv('agilite')) * M.staCout;
    if ((G.player.fatigue ?? 100) < REGLAGES.survie.SEUILS.fatigue.gene) k *= 1 + RX.COURSE_FATIGUE;
    dS = -RX.COURSE_STA_S * k;
    V.finCourse = performance.now() + RX.COURSE_REPRISE_MS;
    V.tCourse = (V.tCourse || 0) + dt;
    if (V.tCourse >= RX.COURSE_XP_S * 1000) { V.tCourse = 0; try { mod.player && mod.player.gagnerXp('agilite', 1); } catch (e) {} }
  } else if (performance.now() < (V.finCourse || 0)) dS = 0;   // reprendre son souffle
  else dS = (S[j.allure === 'immobile' ? 'repos' : j.allure] || 6) * M.regenSta;
  G.player.sta = clamp(G.player.sta + dS * dt / 1000, 0, staMax);
  // pas (plancher dedans ; dehors : bitume en ville, gravier ailleurs) et souffle court en fin de course
  if (j.allure !== 'immobile') {
    V.pasDist = (V.pasDist || 0) + vReelle * dt / 1000;
    if (V.pasDist >= RX.PAS_FOULEE[j.allure]) { V.pasDist = 0; sfx(!V.dehorsSon ? 'pas' : ({ vert: 'pas_herbe', sec: 'pas_gravier' })[V.scene && V.scene.biome] || 'pas_beton', { volume: RX.PAS_VOLUME[j.allure] }); }
  }
  V.tSouffle = (V.tSouffle || 0) - dt;
  if (j.allure === 'course' && G.player.sta < staMax * RX.SOUFFLE_SEUIL && V.tSouffle <= 0) { V.tSouffle = 2300; sfx('souffle_course'); }
  // orientation : souris (PC) sinon direction de marche
  let dirCible = j.dir;
  const forcee = V.cbt.dirForcee();
  if (I.viseeSouris && !I.tactile) { const m = V.rendu.ecranVersMonde(I.sx, I.sy); dirCible = Math.atan2(m.y - j.y, m.x - j.x); }
  else if (forcee != null) dirCible = forcee;
  else if (vReelle > 0.3 && V.cbt.vitesseMult() >= 1) dirCible = Math.atan2(j.vy, j.vx);
  let da = dirCible - j.dir; da = Math.atan2(Math.sin(da), Math.cos(da));
  j.dir += da * (1 - Math.exp(-dtv / (I.viseeSouris && !I.tactile ? 40 : 70)));

  // --- lumière et vision ---
  const jour = clock.lumiereJour();
  const la = lampeActive();
  V.nLampes = 0;
  if (la) {
    const L = V.lampeMoi; L.x = j.x; L.y = j.y; L.dir = j.dir; L.forme = la.forme; L.angle = la.angle; L.portee = la.portee;
    V.lampes[V.nLampes++] = L;
  }
  const pairs = lisserPairs(dt);
  let secondaire = false;
  for (const p of pairs) {
    if (p.etage !== E.id || !p.lampe) continue;
    const S2 = RL.SOURCES[p.lampeSource] || RL.SOURCES.lampe_torche;
    if (!secondaire) { calculerLOS(C, V.canal.grilles ? V.canal.grilles(E.id).opaque : E.opaque, p.x, p.y, S2.portee + 1, true); secondaire = true; }
    V.lampes[V.nLampes++] = { x: p.x, y: p.y, dir: p.dir, forme: S2.forme, angle: S2.angle, portee: S2.portee, sec: true };
    if (V.nLampes >= 4) break;
  }
  V.nLampes = feuxCommeLampes(V.lampes, V.nLampes);       // feux de camp construits : ils éclairent pour de vrai
  const opaque = V.canal.grilles ? V.canal.grilles(E.id).opaque : E.opaque;
  calculerLOS(C, opaque, j.x, j.y, 17);
  calculerVision(C, E, jour, j.x, j.y, V.lampes, V.nLampes);
  const ci = Math.max(0, icase(E, j.x, j.y));
  let lumJ = (E.lumBase[ci] || 0) * jour + (E.lumStat ? E.lumStat[ci] || 0 : 0);
  for (let q = 0; q < V.nLampes; q++) lumJ = Math.max(lumJ, lumiereLampe(V.lampes[q], j.x, j.y) * 0.5);
  j.lumiere = Math.min(1, lumJ);
  V.canal.majJoueur({ x: j.x, y: j.y, etage: j.etage, dir: j.dir, allure: j.allure, lumiere: j.lumiere, lampe: !!la, lampeSource: la ? la.id : null });
  { const sac = (G.player.equip && G.player.equip.sac) || null; if (sac !== V._sacEnvoye) { V._sacEnvoye = sac; V.canal.majJoueur({ sac }); } } // le coéquipier voit ton sac

  // --- morts interpolés (figés pendant le micro-arrêt) ---
  const f = clamp((V.tVis - V.tSnapVis) / V.periode, 0, 1);
  for (const z of V.zListe) {
    z.x = z.x0 + (z.x1 - z.x0) * f; z.y = z.y0 + (z.y1 - z.y0) * f;
    let dd = z.d1 - z.d0; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); z.dir = z.d0 + dd * f;
    z._eclaire = false;
    if (la && z.etage === E.id) z._eclaire = lumiereLampe(V.lampeMoi, z.x, z.y) > 0.3;
  }
  for (let q = V.ondes.length - 1; q >= 0; q--) { V.ondes[q].age += dt; if (V.ondes[q].age > V.ondes[q].duree) V.ondes.splice(q, 1); }

  // --- interactions, zones, pièce, guide ---
  V.tCible -= dt;
  if (V.tCible <= 0) { V.tCible = 90; V.cible = chercherCible(); majInvite(); zones(); piece(); V.entrees.setSol && V.entrees.setSol(nombreAuSol()); }
  majProximite(dt);
  if (V.fouille) avancerFouille(dt);
  if (V.action) avancerAction(dt);
  majConstruction(dt);
  majRecherche(dt);
  if (V._placeVu !== enPlacement()) { V._placeVu = enPlacement(); V.entrees.setPlacement && V.entrees.setPlacement(V._placeVu); }
  if (V.butin && Math.hypot(V.butin.x - j.x, V.butin.y - j.y) > 1.9) fermerButin();
  V.tPnj -= dt; if (V.tPnj <= 0) { V.tPnj = 800; majPnj(); }
  V.tPos -= dt; if (V.tPos <= 0) { V.tPos = 2000; if (!V.arene) G.player.position = { mode: 'lieu', lieu: V.lieuId, etage: j.etage, x: +j.x.toFixed(2), y: +j.y.toFixed(2), abords: abordsDe(V) }; tension(); }
  V.tGuide -= dt; if (V.tGuide <= 0) { V.tGuide = 700; majObjectif(); majCoopHud(pairs); }
  // --- HUD ---
  let menace = false;
  for (const z of V.zListe) if (z.etage === j.etage && (z.etat === 'chasse' || z.atk) && z._vu && Math.hypot(z.x - j.x, z.y - j.y) < 6) { menace = true; break; }
  alerteMort(t);
  V.hud.majVitaux(menace || !!V.cbt.etat.empoigne);
  V.hud.majLampe(la);
  V.hud.majDegage(V.cbt.etat.empoigne);
  if (V.msgT > 0) { V.msgT -= dt; if (V.msgT <= 0) V.hud.msg.classList.remove('on'); }
  // --- zoom de combat : la caméra se rapproche quand un mort te charge ---
  const zc = menace ? 1.2 : 1;
  V.zoomCbt = (V.zoomCbt || 1) + (zc - (V.zoomCbt || 1)) * (1 - Math.exp(-dt / 600));
  if (Math.abs(V.rendu.zoom() - V.zoom * V.zoomCbt) > 0.005) V.rendu.setZoom(V.zoom * V.zoomCbt);
  // --- caméra + image ---
  const av = 1.2 + (la ? 0.8 : 0);
  V.rendu.suivre(j.x, j.y, dt, Math.cos(j.dir) * av * (vReelle > 0.2 || I.viseeSouris ? 1 : 0.5), Math.sin(j.dir) * av * (vReelle > 0.2 || I.viseeSouris ? 1 : 0.5));
  const snap = V.snap, Sc = V.scene || (V.scene = { joueur: {}, fouille: { x: 0, y: 0, frac: 0, n: 0 } });
  Sc.E = E; Sc.C = C; Sc.jour = jour; Sc.t = V.tVis; Sc.dt = dtv; Sc.heure = clock.heureDecimale(); Sc.hitstop = ech < 1 ? 1 : 0;
  // à ciel ouvert : une pièce extérieure, et pas sous un toit construit
  { const ii = icase(E, V.j.x, V.j.y), pi = ii >= 0 ? E.piece[ii] : -1; const P = pi >= 0 ? V.niveau.pieces[pi] : null; const T = grilleToits(E); Sc.dehors = (P ? !!P.exterieur : !!V.niveau.exterieur) && !(T && ii >= 0 && T[ii]); }
  Sc.pluie = V.pluie || 0; Sc.vent = V.vent ?? 0.3; Sc.meteo = V.meteo || 'clair';
  if (!V.tBiome || t - V.tBiome > 1000) { V.tBiome = t; Sc.biome = biomeAutour(E, V.j.x, V.j.y); }   // ville, sec (Crau), vert
  if (V.dehorsSon !== Sc.dehors) { V.dehorsSon = Sc.dehors; try { mod.audio && mod.audio.setPluieInterieur && mod.audio.setPluieInterieur(!Sc.dehors); } catch (e) {} }
  const J = Sc.joueur;
  J.x = j.x; J.y = j.y; J.dir = j.dir; J.marche = j.marche; J.lampe = !!la; J.lampeMain = !!(la && (RL.SOURCES[la.id] || {}).mains); J.allure = j.allure;
  J.equip = V.equipVu; J.cbt = V.cbt.rendu(); J.agonie = !!G.player.agonie;
  Sc.fx = V.cbt.fx; Sc.sang = V.cbt.sang; Sc.moi = V.canal.joueurId || JOUEUR_ID;
  Sc.styleJoueur = styleJoueur();
  Sc.soi = Sc.soi || {}; Sc.soi.x = j.x; Sc.soi.y = j.y;
  V.hud.sang.style.opacity = (J.cbt.flash * 0.85 + (G.player.pv < 30 ? 0.25 + 0.1 * Math.sin(t / 300) : 0) + (G.player.agonie ? 0.45 : 0)).toFixed(3);
  Sc.pairs = pairs; Sc.zombies = V.zListe; Sc.portes = snap.portes; Sc.sol = snap.sol; Sc.cadavres = snap.cadavres; Sc.pnj = V.pnj;
  Sc.constructions = snap.constructions || []; Sc.placement = fantome(); Sc.minutes = G.world.minutes;
  Sc.cible = V.cible; Sc.ondes = V.ondes; Sc.lampes = V.lampes; Sc.nLampes = V.nLampes; Sc.carte = V.carte; Sc.objectif = V.objectif || null;
  const Fo = Sc.fouille;
  if (V.fouille) { Fo.x = V.fouille.x; Fo.y = V.fouille.y; Fo.frac = V.fouille.p; Fo.n = V.fouille.items.length; Sc.fouilleOn = true; }
  else if (V.action) { Fo.x = V.action.x; Fo.y = V.action.y; Fo.frac = V.action.t / V.action.duree; Fo.n = 0; Sc.fouilleOn = true; }
  else Sc.fouilleOn = false;
  V.rendu.dessiner(Sc);
}
// Apparence du joueur : couleur du haut porté, cheveux selon le genre, sac à dos visible.
let styleCache = null, styleCle = '';
function styleJoueur() {
  const p = G.player, e = p.equip || {};
  const cle = `${e.torse || ''}|${e.sac || ''}|${p.genre || ''}`;
  if (cle === styleCle && styleCache) return styleCache;
  styleCle = cle;
  const torse = e.torse || '';
  const manteau = /cuir|blouson/.test(torse) ? '#3a2a22' : /militaire|treillis|parka/.test(torse) ? '#3e4630' : /pull|laine/.test(torse) ? '#5a3a3a' : /veste|manteau/.test(torse) ? '#2e3a3e' : /blouse|hopital/.test(torse) ? '#8a9a9c' : '#4a4a3a';
  styleCache = { manteau, pantalon: '#2a2c30', cheveux: p.genre === 'f' ? '#3a2416' : '#241a12', peau: '#b89378', coiffure: p.genre === 'f' ? 'long' : 'court', sac: e.sac || false };
  return styleCache;
}
function grilleBloque() {
  if (V.canal.grilles) return V.canal.grilles(V.E.id).bloque;
  const E = V.E;
  if (!V._bl || V._blE !== E.id) { V._bl = Uint8Array.from(E.bloque); V._blE = E.id; }
  for (const p of V.niveau.portes) if (p.etage === E.id) { const s = V.snap.portes[p.cle]; if (s) { const b = s.etat === 'fermee' || s.etat === 'verrouillee' ? 1 : 0; for (const i of p.cases) V._bl[i] = b; } }
  return V._bl;
}
function majInterp(init) {
  const vus = new Set();
  const liste = V.zListe; liste.length = 0;
  for (const s of V.snap.zombies) {
    let z = V.zInterp.get(s.uid);
    if (!z) { z = { uid: s.uid, x: s.x, y: s.y, x0: s.x, y0: s.y, x1: s.x, y1: s.y, d0: s.dir, d1: s.dir, dir: s.dir }; V.zInterp.set(s.uid, z); }
    const saut = Math.hypot(s.x - z.x, s.y - z.y) > 2 || init || z.etage !== s.etage;
    z.x0 = saut ? s.x : z.x; z.y0 = saut ? s.y : z.y; z.x1 = s.x; z.y1 = s.y; z.d0 = saut ? s.dir : z.dir; z.d1 = s.dir;
    z.etage = s.etage; z.type = s.type; z.etat = s.etat; z.alerte = s.alerte; z.vitesse = s.vitesse; z.hp = s.hp; z.hpMax = s.hpMax;
    z.sexe = s.sexe; z.atk = s.atk; z.fente = s.fente; z.saisit = s.saisit; z.vac = s.vac; z.terre = s.terre; z.eq = s.eq;
    if (s.touche) z.tTouche = V.tVis;
    vus.add(s.uid); liste.push(z);
  }
  for (const k of V.zInterp.keys()) if (!vus.has(k)) V.zInterp.delete(k);
}
// Coéquipier(s) : position lissée (le réseau arrive par à-coups), pour un pion qui glisse au lieu de sauter.
function lisserPairs(dt) {
  const bruts = V.canal.pairs();
  const out = V.pairsVus; out.length = 0;
  const k = 1 - Math.exp(-dt / 90);
  for (const p of bruts) {
    let q = V.pInterp.get(p.id);
    if (!q || q.etage !== p.etage || Math.hypot(q.x - p.x, q.y - p.y) > 3) { q = { ...p }; V.pInterp.set(p.id, q); }
    const ax = q.x, ay = q.y;
    Object.assign(q, p, { x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k });
    let dd = p.dir - (q._dir ?? p.dir); dd = Math.atan2(Math.sin(dd), Math.cos(dd)); q._dir = (q._dir ?? p.dir) + dd * k; q.dir = q._dir;
    q.marche = Math.min(1, Math.hypot(q.x - ax, q.y - ay) / Math.max(1e-3, dt) * 1000 / 2.5);
    out.push(q);
  }
  return out;
}
function ecouter() {
  const j = V.j, now = performance.now();
  for (const z of V.zListe) {
    if (z.etage !== j.etage) continue;
    { const i = icase(V.E, z.x1, z.y1); if (z._vu || (i >= 0 && V.C.los[i] === V.C.stamp && V.C.vis[i] > 0.3)) continue; }
    const d = Math.hypot(z.x1 - j.x, z.y1 - j.y);
    const chasse = z.etat === 'chasse';
    const portee = chasse ? Math.max(RX.PERCEPTION.OUIE_JOUEUR, Math.min(12, (ZOMBIES[z.type] || {}).grogne || 8)) : RX.PERCEPTION.OUIE_JOUEUR;
    if (d > portee) continue;
    if (!chasse && (z.vitesse || 0) < 0.05 && z.etat !== 'cogne') continue;
    const dern = V.dernOnde.get(z.uid) || 0;
    if (now - dern < (chasse ? 900 : 1700)) continue;
    V.dernOnde.set(z.uid, now);
    if (V.ondes.length < 24) V.ondes.push({ x: z.x1 + (Math.random() - 0.5) * 1.2, y: z.y1 + (Math.random() - 0.5) * 1.2, etage: z.etage, age: 0, duree: 1400, danger: chasse });
  }
}
function onde(cle, danger) {
  const p = V.niveau.porteParCle[cle]; if (!p || p.etage !== V.j.etage) return;
  if (Math.hypot(p.x + 0.5 - V.j.x, p.y + 0.5 - V.j.y) > 16) return;
  if (V.ondes.length < 24) V.ondes.push({ x: p.x + 0.5, y: p.y + 0.5, etage: p.etage, age: 0, duree: 1200, danger });
}
// Profondeur dans un bâtiment : le plus court chemin (en unités) de la position du joueur jusqu'à une case
// du dehors, sans traverser murs ni portes fermées. Infinity si tout est fermé.
function profondeurDedans() {
  const E = V.E, bl = grilleBloque(), P = V.niveau.pieces, ext = !!V.niveau.exterieur, T = grilleToits(E);
  const dehorsCase = (i) => { if (T && T[i]) return false; const pi = E.piece[i]; const p = pi >= 0 ? P[pi] : null; return p ? !!p.exterieur : ext; }; // ciel ouvert
  const d0 = icase(E, V.j.x, V.j.y); if (d0 < 0) return 0;
  const MAX = RX.DEDANS_SON.PORTEE * FIN, w = E.w, n = E.w * E.h;
  const vu = new Uint8Array(n), file = [d0]; vu[d0] = 1; let tete = 0;
  for (let pas = 0; pas <= MAX && tete < file.length; pas++) {
    const fin = file.length;
    for (; tete < fin; tete++) {
      const i = file[tete];
      if (dehorsCase(i) && !bl[i]) return pas / FIN;
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < n && !vu[j] && !bl[j]) { vu[j] = 1; file.push(j); }
    }
  }
  return Infinity;
}
// Combien du dehors on entend à cette profondeur : faible à l'entrée, quasi rien au fond.
function attenuationDedans(prof) {
  const D = RX.DEDANS_SON;
  return prof === Infinity ? D.MIN : Math.max(D.MIN, D.ENTREE * Math.exp(-prof / D.DECROIT));
}
function tension() {
  if (!mod.audio || !mod.audio.setTension) return;
  let t = 0;
  for (const z of V.zListe) if (z.etage === V.j.etage) { const d = Math.hypot(z.x - V.j.x, z.y - V.j.y); if (z.etat === 'chasse') t = Math.max(t, 1 - d / 14); else if (z.alerte > 0.3) t = Math.max(t, 0.4 * (1 - d / 12)); }
  try { mod.audio.setTension(clamp(t, 0, 1)); } catch (e) {}
  // horde lointaine : beaucoup de morts dans le quartier, hors de portée directe
  const H = RX.HORDE_SON; let n = 0;
  for (const z of V.zListe) if (z.etage === V.j.etage) { const d = Math.hypot(z.x - V.j.x, z.y - V.j.y); if (d >= H.DIST_MIN && d <= H.DIST_MAX) n++; }
  // Salon est infesté : dehors, on l'entend toujours gémir au loin, même si peu de morts rôdent ici
  const fond = H.SALON_DEHORS && V.dehorsSon && V.L && V.L.echelle === 'salon' ? 1 : 0;
  try { mod.audio.setHorde && mod.audio.setHorde(n >= H.FORTE ? 2 : n >= H.CALME ? 1 : fond, !V.dehorsSon); } catch (e) {}
  // fond nature : cigales, oiseaux, grillons, vent — selon l'heure, le terrain et la météo
  const Sc = V.scene || {};
  try { mod.audio.setNature && mod.audio.setNature({ dehors: !!V.dehorsSon, biome: Sc.biome || 'ville', heure: clock.heureDecimale(), vent: V.vent ?? 0.3 }); } catch (e) {}
  // dans un bâtiment : le dehors s'entend de moins en moins à mesure qu'on s'enfonce (portes fermées : presque rien)
  const prof = V.dehorsSon ? 0 : profondeurDedans();
  try { mod.audio.setDedans && mod.audio.setDedans(V.dehorsSon ? 1 : attenuationDedans(prof)); } catch (e) {}
  // pour la survie : sous un toit = au sec ; toit + murs tout autour (plus de ciel ouvert accessible) = un intérieur
  { const ii = icase(V.E, V.j.x, V.j.y), pi = ii >= 0 ? V.E.piece[ii] : -1, Pc = pi >= 0 ? V.niveau.pieces[pi] : null;
    const pieceExt = Pc ? !!Pc.exterieur : !!V.niveau.exterieur;
    V.abri = { abrite: !V.dehorsSon, exterieur: pieceExt && !(!V.dehorsSon && prof === Infinity) }; }
  // Les sirènes de l'armée : dans la zone qui hurle, toutes les 35 à 80 s ; ailleurs (les collines), on les devine au loin.
  const ru = etatRuee();
  if (ru && ru.active && !V.arene) {
    const ici = lieuDansZone(V.lieuId), t = performance.now(), S = REGLAGES.ruees.SIRENE_S;
    if (!V.tSirene || t >= V.tSirene) {
      V.tSirene = t + (S[0] + Math.random() * (S[1] - S[0])) * 1000 * (ici ? 1 : 2.2);
      sfx('sirene', { volume: ici ? 1 : 0.22 });
    }
  }
  // Les cloches du soir : tant que Maud guette, elles sonnent sur Salon chaque soir à 21 h 10
  // (l'heure où l'horloge s'est arrêtée). Une fois par jour, dehors, en ville.
  const C2 = RX.CLOCHES_SOIR, h = clock.heureDecimale(), jr = clock.jour();
  if (C2 && V.dehorsSon && V.L && V.L.echelle === 'salon' && !getFlag(C2.FIN_FLAG) && h >= C2.HEURE && h < C2.HEURE + 0.5 && G.world.clochesJour !== jr) {
    G.world.clochesJour = jr; sfx('cloches');
  }
}

// ---------- Objectif : jamais un fil d'Ariane ----------
// Le personnage ne sait pas où est la sortie ni où s'équiper : pas de bandeau permanent, pas de flèche vers le but.
// Un nouvel objectif est annoncé une fois (toast du HUD général, js/ui/hud.js) ; il reste lisible dans le journal
// (onglet Objectifs) et, quand le personnage connaît le lieu, marqué sur la carte de Salon.
// Exception voulue au cas par cas : une entrée `guide` marquée `repere: true` ({ lieu, si, marqueur, texte }) pose
// encore un repère discret sur place (aucune quête n'en a besoin aujourd'hui).
function majObjectif() {
  V.objectif = null;
  V.hud.majGuide('');
  if (V.arene) return;
  let best = null;
  for (const [id, q] of Object.entries(QUETES)) {
    const e = G.world.quetes && G.world.quetes[id];
    if (!q.principale || !e || e.faite) continue;
    if (!best || (q.chapitre || 0) >= (best.q.chapitre || 0)) best = { q, e };
  }
  const etape = best ? best.q.etapes[best.e.etape] || {} : {};
  for (const g of etape.guide || []) {
    if (!g.repere || (g.lieu && g.lieu !== V.lieuId) || !verifierCondition(g.si)) continue;
    const cible = g.marqueur ? V.niveau.marqueurs[g.marqueur] : null;
    if (cible) V.objectif = { etage: cible.etage, x: cible.x + 0.5, y: cible.y + 0.5, texte: texteCourt(g.texte || etape.objectif || '') };
    break;
  }
}
const texteCourt = (t) => (t.length > 34 ? t.slice(0, 32).replace(/\s+\S*$/, '') + '…' : t);
function majCoopHud(pairs) {
  if (G.mode === 'solo' || !crochets.coop) { V.hud.majCoop(null); return; }
  const info = crochets.coop.info ? crochets.coop.info(V, pairs) : null;
  V.hud.majCoop(info);
}

// Objets du décor liés à un drapeau (R.drapeau) : le plan décroché du mur de la loge… → R.pris, blocs refaits.
function majObjetsDrapeaux() {
  let change = false;
  for (const E of V.niveau.etages) for (const R of (E.rendu ? E.rendu.objets : [])) {
    if (!R.drapeau) continue;
    const v = !!getFlag(R.drapeau);
    if (R.pris !== v) { R.pris = v; change = true; }
  }
  if (change && V.rendu) V.rendu.viderCache();
}

// ---------- Lampe ----------
function lampeActive() {
  const inv = mod.inv;
  if (inv && inv.lampe) {
    const l = inv.lampe(G.player);
    if (l && l.allumee && l.charge > 0) return l;
    return null;
  }
  if (!V.lampeFallback) return null;
  const S = RL.SOURCES[V.lampeFallback];
  return S ? { id: V.lampeFallback, ...S, frac: 1 } : null;
}
function basculerLampe() {
  const inv = mod.inv;
  if (inv && inv.allumerLampe) {
    const l = inv.lampe(G.player);
    if (!l) {
      const k = G.player.inventaire.findIndex(it => inv.estLampe && inv.estLampe(it.id));
      if (k >= 0 && inv.equiper) { inv.equiper(k); } else { message('Tu n\'as pas de lampe.'); return; }
    }
    const r = inv.allumerLampe(null);
    if (!r.ok) message(r.raison || 'La lampe ne s\'allume pas.');
    else sfx('clic');
    V.entrees.setBouton('lampe', { actif: !!lampeActive() });
    return;
  }
  const id = Object.keys(RL.SOURCES).find(s => compter(s) > 0);
  if (!id) { message('Tu n\'as pas de lampe.'); return; }
  V.lampeFallback = V.lampeFallback ? null : id;
  V.entrees.setBouton('lampe', { actif: !!V.lampeFallback });
}

// ---------- Un mort approche : on coupe tout ----------
// Inventaire ou autre menu ouvert, plan du lieu, placement d'une construction, chantier, fouille, geste en cours :
// dès qu'un NOUVEAU mort menace (vu et en chasse assez près, vu tout près, ou entendu juste à côté), tout se ferme et on
// rend la main au joueur. Un mort déjà signalé ne recoupe pas tant qu'il n'a pas disparu quelques secondes (on peut
// rouvrir le sac en pleine fuite pour prendre un bandage).
function alerteMort(t) {
  const j = V.j, A = RX.ALERTE || {}, chasse = A.CHASSE ?? 9, proche = A.PROCHE ?? 3.5, oubli = A.OUBLI_MS ?? 6000;
  const vus = V.alertes || (V.alertes = new Map());
  let nouveau = false;
  for (const z of V.zListe) {
    if (z.etage !== j.etage || z.terre) continue;
    const d = Math.hypot(z.x - j.x, z.y - j.y);
    const menace = z._vu ? ((z.etat === 'chasse' || z.atk) ? d < chasse : d < proche) : (z.etat === 'chasse' && d < 2.2);
    if (!menace) continue;
    const avant = vus.get(z.uid);
    if (avant == null || t - avant > oubli) nouveau = true;
    vus.set(z.uid, t);
  }
  if (nouveau) couperTout();
}
function couperTout() {
  let coupe = false;
  const pn = mod.panneaux;
  if (pn && pn.panneauOuvert && pn.panneauOuvert() && pn.panneauOuvert() !== 'options') { pn.fermerPanneau(); coupe = true; }
  if (V.carte) { V.carte = false; coupe = true; }
  if (V.choix) { fermerChoix(); coupe = true; }
  if (annulerPlacement()) coupe = true;
  if (V.action) { V.action = null; V.hud.barre.classList.add('cache'); coupe = true; }
  if (V.fouille || V.butin) { interrompreFouille(); fermerButin(); coupe = true; }
  if (coupe) { message('Un mort approche !', 1800); sfx('alerte'); vib(80); }
}

// ---------- Divers ----------
async function ouvrirInventaire() {
  sfx('sac_zip');
  if (mod.panneaux === null || mod.panneaux === undefined) { try { mod.panneaux = await import('../ui/panels/index.js'); } catch (e) { mod.panneaux = false; } }
  if (mod.panneaux && mod.panneaux.ouvrirPanneau) { try { mod.panneaux.ouvrirPanneau('inventaire'); } catch (e) { console.warn(e); } }
}
function echap() {
  if (V.choix) { fermerChoix(); return; }
  if (annulerPlacement()) { message('Construction : arrêtée.', 1200); return; }
  if (V.carte) { V.carte = false; return; }
  if (V.cbt && V.cbt.etat.charge) { V.cbt.frapper(false, true); return; }
  if (V.butin || V.fouille) { interrompreFouille(); fermerButin(); return; }
  if (V.action) { V.action = null; V.hud.barre.classList.add('cache'); return; }
  emit('echap', { temps: 'exploration' });
}
// Décalage des abords du niveau courant (gardé avec la position du joueur).
function abordsDe(v) { const a = v && v.niveau && v.niveau.abords; return a ? { dx: a.dx, dy: a.dy } : null; }
