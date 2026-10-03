// ============ Temps 1 — l'écran d'exploration (REFONTE §5, §12.3) ============
// entrer({ lieuId, entree }), sortir(), pause(), reprise().
// Parle au monde UNIQUEMENT via un canal (obtenirCanal) : local (solo/hôte) ou distant (invité, intégrateur).
// LE COMBAT SE JOUE ICI, en temps réel (plus d'écran séparé) : se déplacer, frapper, pousser (combat_vue.js).
//   combatIci(spec) → Promise<resultat>   : des morts surgissent autour du joueur (scènes, déclencheurs).
//   embuscade(spec) → Promise<resultat>   : un bout de route jouable (rencontres de voyage), on en sort par un bord.
// Crochets de test : definirCrochets({ scene, obtenirCanal }) (banc d'essai dev/explore.html).
import { G, getFlag, noteJournal, sauver as sauverPartie, avantSauvegarde } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, clamp } from '../core/util.js';
import { pref, setPref } from '../core/prefs.js';
import { seedRng } from '../core/rng.js';
import * as flow from '../game/flow.js';
import { lieu as lieuDe, objet, chargerNiveau, ITEMS } from '../game/donnees.js';
import { REGLAGES, niveauDepuisXp, presetDifficulte } from '../data/reglages.js';
import { ZOMBIES } from '../data/zombies.js';
import { DECLENCHEURS } from '../data/histoire/declencheurs.js';
import { DOCUMENTS } from '../data/histoire/documents.js';
import { PNJ } from '../data/histoire/pnj.js';
import { parserNiveau, K, PROPS } from './niveau.js';
import { creerSimLieu } from './sim.js';
import { creerCanalLocal } from './canal_local.js';
import { creerChamp, calculerLOS, calculerVision, lumiereLampe } from './vision.js';
import { deplacer } from './physique.js';
import { creerRendu } from './rendu.js';
import { creerEntrees } from './entrees.js';
import { creerCombatVue } from './combat_vue.js';
import { genererEmbuscade } from './embuscade.js';

const RX = REGLAGES.exploration, RL = REGLAGES.lumiere;
const RAYON = 0.3;
const JOUEUR_ID = 'local';

// ---------- Crochets remplaçables ----------
let crochets = {
  scene: (id) => flow.scene(id),
  obtenirCanal: null,
};
export function definirCrochets(c) { crochets = { ...crochets, ...c }; }

// Modules optionnels (tolère leur absence)
let inv = null, player = null, audio = null, panneaux = null, survie = null;
async function chargerOptionnels() {
  const essai = async (p) => { try { return await import(p); } catch (e) { return null; } };
  [inv, player, audio, survie] = await Promise.all([essai('../game/inventory.js'), essai('../game/player.js'), essai('../audio.js'), essai('../game/survival.js')]);
}
const vib = (ms) => { try { if (pref('vibrations') !== false && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
const EVTS_COMBAT = ['telegraphe', 'attaque', 'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule'];
const sfx = (n, o) => { try { audio && audio.sfx && audio.sfx(n, o); } catch (e) {} };
// Son situé dans le lieu : plus on est loin, moins on l'entend (au-delà de la portée : rien). Un étage d'écart = étouffé.
function sfxA(nom, x, y, etage, portee = 14) {
  if (!V) return;
  let d = Math.hypot(x - V.j.x, y - V.j.y);
  if (etage && etage !== V.j.etage) d = d * 1.6 + 6;
  const f = 1 - d / portee;
  if (f <= 0) return;
  sfx(nom, { volume: Math.pow(f, 1.6), pan: Math.max(-0.8, Math.min(0.8, (x - V.j.x) / 10)) });
}
function posPorte(cle) { const p = V && V.niveau.porteParCle[cle]; return p ? [p.x + 0.5, p.y + 0.5, p.etage] : null; }

// ---------- Canal ----------
const niveauxParses = {};
// Remplaçable par js/game/autorite.js → canalLieu(lieuId) quand il existera.
export async function obtenirCanal(lieuId, niveau, L) {
  if (crochets.obtenirCanal) return crochets.obtenirCanal(lieuId, niveau, L);
  // Quand js/game/autorite.js existera, l'intégrateur branche ici canalLieu(lieuId) (ou via definirCrochets).
  const W = G.world;
  const etat = W.lieux[lieuId] && W.lieux[lieuId].etat;
  const diff = presetDifficulte(W.difficulte || (G.options && G.options.difficulte));
  const sim = creerSimLieu({
    lieuId, niveau, etat, seed: W.seed, danger: L.danger ?? 0.3, pool: L.pool || niveau.pool,
    minutes: W.minutes, typeButin: L.typeButin || L.type || niveau.typeButin, mortsN: (L.morts && L.morts.n) || (niveau.morts && niveau.morts.n),
    repeuplement: L.repeuplement, coop: G.mode !== 'solo', difficulte: diff, mult: L.abondance || 1,
    getFlag: (k) => getFlag(k),
  });
  return creerCanalLocal(sim, JOUEUR_ID);
}

// ---------- Conditions (REFONTE §4.5) ----------
export function verifierCondition(c) {
  if (!c) return true;
  if (!G) return false;
  const W = G.world;
  for (const [k, v] of Object.entries(c)) {
    switch (k) {
      case 'flag': if (!W.flags[v]) return false; break;
      case 'pasFlag': if (W.flags[v]) return false; break;
      case 'flagEgal': if (W.flags[v[0]] !== v[1]) return false; break;
      case 'objet': { const [id, q] = Array.isArray(v) ? v : [v, 1]; if (compter(id) < q) return false; break; }
      case 'skill': if (niveauDepuisXp((G.player.skillXp || {})[v[0]]) < v[1]) return false; break;
      case 'nuit': if (clock.estNuit() !== !!v) return false; break;
      case 'jourMin': if (clock.jour() < v) return false; break;
      case 'lieuVisite': if (!(W.lieux[v] && W.lieux[v].visite)) return false; break;
      case 'quete': { const q = W.quetes[v[0]]; if (!q || q.etape !== v[1]) return false; break; }
      case 'ou': if (!v.some(verifierCondition)) return false; break;
      default: break;
    }
  }
  return true;
}
function compter(id) {
  if (inv && inv.countItem) return inv.countItem(id);
  let n = 0; for (const it of G.player.inventaire) if (it.id === id) n += it.qty || 1;
  for (const s of Object.values(G.player.equip || {})) if (s === id) n++;
  return n;
}

// ---------- État de la vue ----------
let V = null;

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
    niveau = niveauxParses[idNiveau] || (niveauxParses[idNiveau] = parserNiveau(def));
  }
  for (const a of niveau.avertissements) console.warn(`[niveau ${idNiveau}] ${a}`);

  const racine = el('div', { class: 'explore' + (arene ? ' ex-arene' : '') });
  const canvas = el('canvas', { class: 'ex-canvas' });
  const hud = {
    lieu: el('div', { class: 'ex-lieu' }),
    msg: el('div', { class: 'ex-msg' }),
    invite: el('div', { class: 'ex-invite' }),
    etat: el('div', { class: 'ex-etat' }),
    butin: el('div', { class: 'ex-butin cache' }),
    barre: el('div', { class: 'ex-action cache' }, el('div', { class: 'ex-action-l' }), el('div', { class: 'ex-action-b' }, el('i'))),
    mains: el('div', { class: 'ex-mains' }),
    degage: el('div', { class: 'ex-degage cache' }),
    sang: el('div', { class: 'ex-sang' }),
    route: el('button', { class: 'ex-route cache', type: 'button' }, 'Reprendre la route'),
    aide: el('div', { class: 'ex-aide-cbt' }, 'Clic gauche : frapper (maintenir = coup chargé) · Clic droit / Espace : pousser', el('br'), 'E : interagir · X : échanger les mains · B : dos · R : recharger'),
  };
  hud.sta = el('div', { class: 'ex-sta' }, el('i'));
  hud.lampe = el('div', { class: 'ex-lampe' }, el('span', {}, 'Lampe'), el('b', {}, el('i')));
  hud.etat.append(hud.sta, hud.lampe);
  racine.append(canvas, hud.sang, hud.lieu, hud.msg, hud.invite, hud.etat, hud.barre, hud.butin, hud.mains, hud.degage, hud.route, hud.aide);
  flow.stage().append(racine);

  V = {
    lieuId, L, niveau, racine, canvas, hud, actif: true, enPause: false, occupe: false, enCombat: false,
    champs: niveau.etages.map(creerChamp), E: null, C: null,
    j: { x: 0, y: 0, etage: null, dir: 0, vx: 0, vy: 0, allure: 'immobile', marche: 0, lumiere: 1 },
    lampes: [], nLampes: 0, lampeMoi: { x: 0, y: 0, dir: 0, forme: 'cone', angle: 60, portee: 9, sec: false }, lampesPairs: [],
    snap: null, tSnap: 0, zInterp: new Map(), zListe: [], ondes: [], dernOnde: new Map(),
    cible: null, tCible: 0, fouille: null, butin: null, action: null, carte: false,
    piece: -1, tPos: 0, tPnj: 0, pnj: [], off: [], raf: 0, tPrec: performance.now(), msgT: 0,
    zoom: pref('zoomExplore') || 1, zonesDedans: new Set(), arene, periode: 50, tSnapPrec: performance.now(),
  };
  if (arene) {
    const W = G.world;
    const sim = creerSimLieu({ lieuId, niveau, etat: null, seed: `${W.seed}:${arene.seed}`, danger: L.danger, pool: arene.pool || ['errant'],
      minutes: W.minutes, mortsN: [0, 0], coop: false, difficulte: presetDifficulte(W.difficulte || (G.options && G.options.difficulte)) });
    V.canal = creerCanalLocal(sim, JOUEUR_ID);
  } else V.canal = await obtenirCanal(lieuId, niveau, L);
  if (!V) return; // sorti entre-temps

  // position de départ
  let pos = null;
  const P = G.player.position;
  if (!entree && P && P.mode === 'lieu' && P.lieu === lieuId && P.etage && P.x != null && niveau.etageIdx[P.etage] != null) pos = { etage: P.etage, x: P.x, y: P.y };
  if (!pos) {
    let e = (entree && (niveau.entrees[entree] || caseLibrePres(niveau, niveau.marqueurs[entree]))) || niveau.entrees.defaut;
    if (entree && !niveau.entrees[entree] && !niveau.marqueurs[entree]) console.warn(`[explore] entrée « ${entree} » inconnue dans ${idNiveau}`);
    pos = { etage: e.etage, x: e.x + 0.5, y: e.y + 0.5 };
  }
  V.j.x = pos.x; V.j.y = pos.y; V.j.dir = Math.PI / 2;
  ajouterJoueurSim(pos);
  changerEtage(pos.etage);

  // monde
  if (!arene) {
    G.world.lieux[lieuId] = { ...(G.world.lieux[lieuId] || {}), decouvert: true, visite: true };
    emit('lieu:entre', { lieu: lieuId });
  }
  V.snap = V.canal.instantane(); V.tSnap = performance.now(); majInterp(true);

  // rendu + entrées
  V.rendu = creerRendu(canvas, niveau);
  V.rendu.setZoom(V.zoom);
  V.entrees = creerEntrees({ racine, canvas, actions: {
    interagir: (o) => interagir(o), lampe: basculerLampe, inventaire: ouvrirInventaire,
    carte: () => { V.carte = !V.carte; }, echap, zoom: (f) => { V.zoom = clamp(V.zoom * f, 0.55, 2); V.rendu.setZoom(V.zoom * (V.zoomCbt || 1)); setPref('zoomExplore', V.zoom); },
    accroupi: () => {},
    frapper: (appui, annule) => { if (!V || !V.cbt || V.occupe) return; if (appui && (V.fouille || V.butin || V.action)) { interrompreFouille(); fermerButin(); V.action = null; V.hud.barre.classList.add('cache'); } V.cbt.frapper(appui, annule); },
    pousser: () => { if (!V || !V.cbt || V.occupe) return; if (V.fouille || V.butin || V.action) { interrompreFouille(); fermerButin(); V.action = null; V.hud.barre.classList.add('cache'); } V.cbt.pousser(); },
    recharger: () => V && V.cbt && V.cbt.recharger(),
    echangerMains: () => V && V.cbt && V.cbt.echangerMains(),
    dos: () => V && V.cbt && V.cbt.dos(),
    rapide: (i) => V && V.cbt && V.cbt.rapide(i),
  } });
  // Combat (côté joueur) : gestes, endurance, retours, blessures appliquées au corps.
  V.cbt = creerCombatVue({
    canal: V.canal, j: () => V.j, zombies: () => V.zListe, message, sfx, sfxA, vib, inv, player, survie, entrees: V.entrees,
    tactile: () => !!(V.entrees.etat.tactile || matchMedia('(pointer: coarse)').matches), pause: () => !V || V.enPause || V.occupe,
    bousculer: (dx, dy) => { if (!V) return; tmpPos.x = V.j.x; tmpPos.y = V.j.y; deplacer(V.E.w, V.E.h, grilleBloque(), tmpPos, dx, dy, RAYON); V.j.x = tmpPos.x; V.j.y = tmpPos.y; },
  });
  for (const t of EVTS_COMBAT) V.off.push(V.canal.on(t, (e) => { if (V && V.cbt) V.cbt.surEvt(e); }));
  V.off.push(on('mort', () => { if (!V) return; V.cbt.mourir(); V.entrees.actif(false); }));
  V.off.push(on('inventaire', () => { if (!V) return; V.cbt.majStats(); majMains(); }));
  majMains();
  hud.mains.addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b || !V) return; if (b.dataset.m === 'dos') V.cbt.dos(); else V.cbt.echangerMains(); });
  hud.route.addEventListener('click', () => { if (V && V.arene) finArene('route'); });
  setTimeout(() => hud.aide.classList.add('cache'), 30000);
  const onResize = () => V && V.rendu.resize();
  window.addEventListener('resize', onResize);
  V.off.push(() => window.removeEventListener('resize', onResize));

  // événements du monde
  const C = V.canal;
  V.off.push(C.on('tick', () => {
    const t = performance.now(); V.periode = Math.max(30, Math.min(200, V.periode * 0.8 + (t - V.tSnapPrec) * 0.2)); V.tSnapPrec = t;
    V.snap = C.instantane(); V.tSnap = t; majInterp(false); ecouter();
  }));
  V.off.push(C.on('porte', (e) => {
    const pp = posPorte(e.cle);
    if (e.action === 'coup') { if (pp) sfxA('porte_coup', ...pp, 16); onde(e.cle, true); }
    else if (e.action === 'casse' || e.action === 'enfoncee') { if (pp) sfxA('porte_casse', ...pp, 24); onde(e.cle, true); }
    else if (e.source !== (C.joueurId || JOUEUR_ID) && (e.action === 'ouvre' || e.action === 'ferme') && pp) sfxA('porte', ...pp, 12);
  }));
  V.off.push(C.on('zombie', (e) => { if (e.etat === 'chasse') { const z = V.zInterp.get(e.uid); if (z && z._vu) sfx('alerte'); else if (z) sfxA('zombie_loin', z.x, z.y, z.etage, 14); } }));
  V.off.push(C.on('hurlement', (e) => { const z = e && V.zInterp.get(e.uid); if (z) sfxA('hurlement', z.x, z.y, z.etage, 40); else sfx('hurlement', { volume: 0.5 }); }));
  V.off.push(on('minute', () => { if (V && V.C) { /* lumière du jour : rien à recalculer, lue à chaque image */ } }));

  // Chaque sauvegarde (auto, fermeture de l'onglet…) range aussi l'état du lieu : meubles vidés, objets au sol, morts.
  V.off.push(avantSauvegarde(() => {
    if (!V || !V.canal.sauver || V.arene) return;
    const etat = V.canal.sauver(G.world.minutes);
    if (etat) G.world.lieux[V.lieuId] = { ...(G.world.lieux[V.lieuId] || {}), etat };
    G.player.position = { mode: 'lieu', lieu: V.lieuId, etage: V.j.etage, x: +V.j.x.toFixed(2), y: +V.j.y.toFixed(2) };
  }));

  // Météo : la pluie se voit dehors (et s'entend étouffée sous un toit)
  import('../game/meteo.js').then(m => { if (V) V.pluie = m.pluie(); }).catch(() => {});
  V.off.push(on('meteo', (e) => { if (V) V.pluie = e.pluie || 0; }));
  V.dehorsSon = null;

  // Bouton lampe visible seulement si on en a une (portée ou dans le sac)
  const majBoutonLampe = () => {
    if (!V) return;
    const a = !!(G.player.equip && G.player.equip.lampe) || G.player.inventaire.some(it => RL.SOURCES[it.id]);
    V.entrees.setVisible && V.entrees.setVisible('lampe', a);
    V.entrees.setBouton('lampe', { actif: !!lampeActive() });
  };
  majBoutonLampe();
  V.off.push(on('inventaire', majBoutonLampe));

  // sol ↔ inventaire (poser / ramasser depuis le panneau)
  if (inv && inv.setSol) inv.setSol(fournisseurSol());

  V.raf = requestAnimationFrame(boucle);
  if (G.mode === 'solo') clock.setVitesse(((REGLAGES.temps.VITESSE_SOLO || {}).exploration) ?? 1);
  // déclencheurs d'entrée
  if (!arene) setTimeout(() => { if (V && !V.enPause) declencheursEntree(); }, 350);
  else {
    afficherLieu(def.nom);
    const uids = await V.canal.faireApparaitre(arene.zombies || ['errant'], { surprise: arene.surprise });
    if (V) suivreCombat(uids, { arene: true }).then((r) => finArene(r.issue === 'victoire' ? 'nettoye' : r.issue, r));
  }
}

function ajouterJoueurSim(pos) {
  const C = V.canal;
  if (C.ajouterJoueur) C.ajouterJoueur(pos, { nom: G.player.nom, discretion: niv('discretion') });
  else C.majJoueur({ ...pos, nom: G.player.nom, discretion: niv('discretion') });
}
const niv = (s) => { try { return player && player.niveau ? player.niveau(s) : niveauDepuisXp((G.player.skillXp || {})[s]); } catch (e) { return 0; } };

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
    G.player.position = { mode: 'lieu', lieu: v.lieuId, etage: v.j.etage, x: +v.j.x.toFixed(2), y: +v.j.y.toFixed(2) };
  } catch (e) { console.error(e); }
  for (const f of v.off) { try { f(); } catch (e) {} }
  try { v.entrees && v.entrees.fermer(); } catch (e) {}
  try { v.rendu && v.rendu.fermer(); } catch (e) {}
  try { v.canal.fermer && v.canal.fermer(); } catch (e) {}
  if (inv && inv.setSol) { let pile = []; inv.setSol({ lister: () => pile, deposer: (it) => pile.push({ ...it }), prendre: (i) => pile.splice(i, 1)[0] || null }); }
  try { audio && audio.setTension && audio.setTension(0); } catch (e) {}
  v.racine.remove();
  if (!v.arene) emit('lieu:sort', { lieu: v.lieuId });
  V = null;
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

function lienCss() {
  if (document.querySelector('link[href*="explore.css"]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = new URL('../../css/explore.css', import.meta.url).href;
  document.head.append(l);
}
function caseLibrePres(niveau, m) {
  if (!m) return null;
  const E = niveau.etages[niveau.etageIdx[m.etage]];
  if (!E.bloque[m.y * E.w + m.x]) return m;
  for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = m.x + dx, y = m.y + dy;
    if (x >= 0 && y >= 0 && x < E.w && y < E.h && !E.bloque[y * E.w + x] && E.code[y * E.w + x] === K.SOL) return { etage: m.etage, x, y };
  }
  return null;
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
  const dt = Math.min(50, t - V.tPrec); V.tPrec = t;
  try { image(t, dt); } catch (e) { console.error('[explore]', e); }
}
function image(t, dt) {
  const j = V.j, E = V.E, C = V.C, I = V.entrees.etat;
  const bloque = grilleBloque();
  // --- déplacement ---
  const libre = !V.occupe && !V.action;
  let mx = libre ? I.mx : 0, my = libre ? I.my : 0;
  V.cbt.maj(dt);
  const pousse = Math.min(1, Math.hypot(mx, my));
  const sta = G.player.sta, staMax = G.player.staMax || 100;
  let allure = pousse < 0.05 ? 'immobile' : I.accroupi ? 'accroupi' : 'marche';
  if (allure !== 'immobile' && I.course && !I.accroupi && pousse > 0.35) {
    if (sta > RX.COURSE_STA_MIN || (j.allure === 'course' && sta > 0)) allure = 'course';
  }
  let v = RX.VITESSE[allure === 'immobile' ? 'marche' : allure] || 3.2;
  if (allure === 'accroupi') v *= 1 + RX.ACCROUPI_VITESSE_AGILITE * niv('agilite');
  try { if (player && player.vitesseMarche) v *= player.vitesseMarche(G.player); } catch (e) {}
  v *= V.cbt.vitesseMult();
  const cible = pousse > 0 ? v * pousse : 0;
  const k = 1 - Math.exp(-dt / RX.INERTIE_MS);
  const ux = pousse > 0 ? mx / Math.hypot(mx, my) : 0, uy = pousse > 0 ? my / Math.hypot(mx, my) : 0;
  j.vx += (ux * cible - j.vx) * k; j.vy += (uy * cible - j.vy) * k;
  if (Math.abs(j.vx) + Math.abs(j.vy) > 1e-3) {
    tmpPos.x = j.x; tmpPos.y = j.y;
    deplacer(E.w, E.h, bloque, tmpPos, j.vx * dt / 1000, j.vy * dt / 1000, RAYON);
    j.x = tmpPos.x; j.y = tmpPos.y;
  }
  const vReelle = Math.hypot(j.vx, j.vy);
  j.marche = Math.min(1, vReelle / 2.5);
  j.allure = vReelle < 0.2 ? 'immobile' : allure;
  // endurance
  const S = REGLAGES.survie.STA_HORS_COMBAT || { repos: 10, marche: 6, accroupi: 7 };
  const dS = j.allure === 'course' ? -RX.COURSE_STA_S : (S[j.allure === 'immobile' ? 'repos' : j.allure] || 6);
  G.player.sta = clamp(sta + dS * dt / 1000, 0, staMax);
  // orientation : souris (PC) sinon direction de marche
  let dirCible = j.dir;
  const forcee = V.cbt.dirForcee();
  if (I.viseeSouris && !I.tactile) { const m = V.rendu.ecranVersMonde(I.sx, I.sy); dirCible = Math.atan2(m.y - j.y, m.x - j.x); }
  else if (forcee != null) dirCible = forcee;
  else if (vReelle > 0.3 && V.cbt.vitesseMult() >= 1) dirCible = Math.atan2(j.vy, j.vx);
  let da = dirCible - j.dir; da = Math.atan2(Math.sin(da), Math.cos(da));
  j.dir += da * (1 - Math.exp(-dt / (I.viseeSouris && !I.tactile ? 40 : 70)));

  // --- lumière et vision ---
  const jour = clock.lumiereJour();
  const la = lampeActive();
  V.nLampes = 0;
  if (la) {
    const L = V.lampeMoi; L.x = j.x; L.y = j.y; L.dir = j.dir; L.forme = la.forme; L.angle = la.angle; L.portee = la.portee;
    V.lampes[V.nLampes++] = L;
  }
  const pairs = V.canal.pairs();
  let secondaire = false;
  for (const p of pairs) {
    if (p.etage !== E.id || !p.lampe) continue;
    const S2 = RL.SOURCES[p.lampeSource] || RL.SOURCES.lampe_torche;
    if (!secondaire) { calculerLOS(C, V.canal.grilles ? V.canal.grilles(E.id).opaque : E.opaque, p.x, p.y, S2.portee + 1, true); secondaire = true; }
    V.lampes[V.nLampes++] = { x: p.x, y: p.y, dir: p.dir, forme: S2.forme, angle: S2.angle, portee: S2.portee, sec: true };
    if (V.nLampes >= 4) break;
  }
  const opaque = V.canal.grilles ? V.canal.grilles(E.id).opaque : E.opaque;
  calculerLOS(C, opaque, j.x, j.y, 17);
  calculerVision(C, E, jour, j.x, j.y, V.lampes, V.nLampes);
  const ci = Math.floor(j.y) * E.w + Math.floor(j.x);
  let lumJ = (E.lumBase[ci] || 0) * jour;
  for (let q = 0; q < V.nLampes; q++) lumJ = Math.max(lumJ, lumiereLampe(V.lampes[q], j.x, j.y) * 0.5);
  j.lumiere = lumJ;
  V.canal.majJoueur({ x: j.x, y: j.y, etage: j.etage, dir: j.dir, allure: j.allure, lumiere: j.lumiere, lampe: !!la, lampeSource: la ? la.id : null });

  // --- morts interpolés ---
  const f = clamp((t - V.tSnap) / V.periode, 0, 1);
  for (const z of V.zListe) {
    z.x = z.x0 + (z.x1 - z.x0) * f; z.y = z.y0 + (z.y1 - z.y0) * f;
    let dd = z.d1 - z.d0; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); z.dir = z.d0 + dd * f;
    z._eclaire = false;
    if (la && z.etage === E.id) z._eclaire = lumiereLampe(V.lampeMoi, z.x, z.y) > 0.3;
  }
  // --- ondes ---
  for (let q = V.ondes.length - 1; q >= 0; q--) { V.ondes[q].age += dt; if (V.ondes[q].age > V.ondes[q].duree) V.ondes.splice(q, 1); }

  // --- interactions, zones, pièce ---
  V.tCible -= dt;
  if (V.tCible <= 0) { V.tCible = 90; V.cible = chercherCible(); majInvite(); zones(); piece(); }
  if (V.fouille) avancerFouille(dt);
  if (V.action) avancerAction(dt);
  if (V.butin && Math.hypot(V.butin.x - j.x, V.butin.y - j.y) > 1.9) fermerButin();
  V.tPnj -= dt; if (V.tPnj <= 0) { V.tPnj = 800; majPnj(); }
  V.tPos -= dt; if (V.tPos <= 0) { V.tPos = 2000; if (!V.arene) G.player.position = { mode: 'lieu', lieu: V.lieuId, etage: j.etage, x: +j.x.toFixed(2), y: +j.y.toFixed(2) }; tension(); }
  majDegage();
  // HUD
  V.hud.sta.firstChild.style.width = (100 * G.player.sta / staMax).toFixed(1) + '%';
  V.hud.sta.classList.toggle('plein', G.player.sta >= staMax - 0.5);
  V.hud.sta.classList.toggle('bas', G.player.sta < RX.COURSE_STA_MIN * 2);
  if (la && la.frac != null) V.hud.lampe.lastChild.firstChild.style.width = (100 * la.frac).toFixed(0) + '%';
  V.hud.lampe.classList.toggle('on', !!la);
  if (V.msgT > 0) { V.msgT -= dt; if (V.msgT <= 0) V.hud.msg.classList.remove('on'); }

  // --- zoom de combat : la caméra se rapproche quand un mort te charge (retour en douceur ensuite) ---
  let menace = false;
  for (const z of V.zListe) if (z.etage === j.etage && z.etat === 'chasse' && z._vu && Math.hypot(z.x - j.x, z.y - j.y) < 6) { menace = true; break; }
  const zc = menace ? 1.22 : 1;
  V.zoomCbt = (V.zoomCbt || 1) + (zc - (V.zoomCbt || 1)) * (1 - Math.exp(-dt / 600));
  if (Math.abs(V.rendu.zoom() - V.zoom * V.zoomCbt) > 0.005) V.rendu.setZoom(V.zoom * V.zoomCbt);
  // --- caméra + image ---
  const av = 1.2 + (la ? 0.8 : 0);
  V.rendu.suivre(j.x, j.y, dt, Math.cos(j.dir) * av * (vReelle > 0.2 || I.viseeSouris ? 1 : 0.5), Math.sin(j.dir) * av * (vReelle > 0.2 || I.viseeSouris ? 1 : 0.5));
  const snap = V.snap, Sc = V.scene || (V.scene = { joueur: {}, fouille: { x: 0, y: 0, frac: 0, n: 0 } });
  Sc.E = E; Sc.C = C; Sc.jour = jour; Sc.t = t;
  { const pi = E.piece[Math.floor(V.j.y) * E.w + Math.floor(V.j.x)]; const P = pi >= 0 ? V.niveau.pieces[pi] : null; Sc.dehors = P ? !!P.exterieur : !!V.niveau.exterieur; }
  Sc.pluie = V.pluie || 0;
  if (V.dehorsSon !== Sc.dehors) { V.dehorsSon = Sc.dehors; try { audio && audio.setPluieInterieur && audio.setPluieInterieur(!Sc.dehors); } catch (e) {} }
  Sc.joueur.x = j.x; Sc.joueur.y = j.y; Sc.joueur.dir = j.dir; Sc.joueur.marche = j.marche; Sc.joueur.lampe = !!la; Sc.joueur.allure = j.allure;
  Sc.joueur.equip = V.equipVu; Sc.joueur.cbt = V.cbt.rendu(); Sc.fx = V.cbt.fx; Sc.sang = V.cbt.sang; Sc.moi = V.canal.joueurId || JOUEUR_ID;
  V.hud.sang.style.opacity = (Sc.joueur.cbt.flash * 0.85 + (G.player.pv < 30 ? 0.25 + 0.1 * Math.sin(t / 300) : 0)).toFixed(3);
  Sc.pairs = pairs; Sc.zombies = V.zListe; Sc.portes = snap.portes; Sc.sol = snap.sol; Sc.cadavres = snap.cadavres; Sc.pnj = V.pnj;
  Sc.cible = V.cible; Sc.ondes = V.ondes; Sc.lampes = V.lampes; Sc.nLampes = V.nLampes; Sc.carte = V.carte;
  const Fo = Sc.fouille;
  if (V.fouille) { Fo.x = V.fouille.x; Fo.y = V.fouille.y; Fo.frac = V.fouille.p; Fo.n = V.fouille.items.length; Sc.fouilleOn = true; }
  else if (V.action) { Fo.x = V.action.x; Fo.y = V.action.y; Fo.frac = V.action.t / V.action.duree; Fo.n = 0; Sc.fouilleOn = true; }
  else Sc.fouilleOn = false;
  V.rendu.dessiner(Sc);
}
function grilleBloque() {
  if (V.canal.grilles) return V.canal.grilles(V.E.id).bloque;
  // canal distant : grille statique + portes de l'instantané
  const E = V.E;
  if (!V._bl || V._blE !== E.id) { V._bl = Uint8Array.from(E.bloque); V._blE = E.id; }
  for (const p of V.niveau.portes) if (p.etage === E.id) { const s = V.snap.portes[p.cle]; if (s) V._bl[p.y * E.w + p.x] = s.etat === 'fermee' || s.etat === 'verrouillee' ? 1 : 0; }
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
    z.sexe = s.sexe; z.atk = s.atk; z.saisit = s.saisit; z.vac = s.vac; z.terre = s.terre; if (s.touche) z.tTouche = performance.now();
    vus.add(s.uid); liste.push(z);
  }
  for (const k of V.zInterp.keys()) if (!vus.has(k)) V.zInterp.delete(k);
}
// Ce que le joueur entend : morts hors de vue à ≤ OUIE_JOUEUR (12 s'il grogne en chasse)
function ecouter() {
  const j = V.j, now = performance.now();
  for (const z of V.zListe) {
    if (z.etage !== j.etage || z._vu) continue;
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
function tension() {
  if (!audio || !audio.setTension) return;
  let t = 0;
  for (const z of V.zListe) if (z.etage === V.j.etage) { const d = Math.hypot(z.x - V.j.x, z.y - V.j.y); if (z.etat === 'chasse') t = Math.max(t, 1 - d / 14); else if (z.alerte > 0.3) t = Math.max(t, 0.4 * (1 - d / 12)); }
  try { audio.setTension(clamp(t, 0, 1)); } catch (e) {}
}

// ---------- Lampe ----------
function lampeActive() {
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
  if (inv && inv.allumerLampe) {
    const l = inv.lampe(G.player);
    if (!l) {
      // une lampe dans le sac ? l'équiper
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

// ---------- Interactions ----------
function chercherCible() {
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
      if (vusMeubles.has(m.idx)) continue; vusMeubles.add(m.idx);
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
  // marqueurs posés au sol (hors meubles/portes)
  for (const m of Object.values(n.marqueurs)) {
    if (m.etage !== E.id || m.meuble || m.porte) continue;
    const d = Math.hypot(m.x + 0.5 - j.x, m.y + 0.5 - j.y);
    if (d > R + 0.5 || C.los[m.y * E.w + m.x] !== C.stamp) continue;
    const decl = declencheurMarqueur(m.id);
    const doc = docDuMarqueur(m.id);
    const pnj = V.pnj.find(q => q.marqueur === m.id);
    if (!decl && !doc && !pnj) continue;
    if (pnj && !decl) continue; // le PNJ est proposé plus bas
    proposer({ type: decl ? 'marqueur' : 'doc', decl, doc, m, etage: E.id, x0: m.x, y0: m.y, x1: m.x + 1, y1: m.y + 1, cx: m.x + 0.5, cy: m.y + 0.5 }, d, 0.3);
  }
  // portes-marqueurs : un déclencheur actif remplace l'action de porte
  if (best && best.type === 'porte' && best.p.marqueur) { const decl = declencheurMarqueur(best.p.marqueur); if (decl) best = { ...best, type: 'marqueur', decl }; }
  for (const q of V.pnj) {
    if (q.etage !== E.id) continue;
    const d = Math.hypot(q.x - j.x, q.y - j.y) - 0.3;
    if (d > R) continue;
    proposer({ type: 'pnj', q, etage: E.id, x0: q.x - 0.5, y0: q.y - 0.5, x1: q.x + 0.5, y1: q.y + 0.5, cx: q.x, cy: q.y }, d, 0.3);
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
      if (v.cle && compter(v.cle) > 0) return `Déverrouiller (${nomObjet(v.cle)})`;
      if (v.forcer && outil(v.forcer)) return 'Forcer la porte';
      if (v.crocheter && compter('crochets_serrure') > 0) return 'Crocheter la serrure';
      return 'Porte verrouillée';
    }
    case 'meuble': {
      if (c.decl) return 'Examiner';
      const st = V.snap.conteneurs[c.m.cle];
      if (st && st.progres >= 1 && st.reste === 0) return `Fouiller ${c.m.nom} (vide)`;
      return `Fouiller ${c.m.nom}`;
    }
    case 'escalier': return c.s.sens === 'monte' ? 'Monter' : 'Descendre';
    case 'sortie': return 'Sortir';
    case 'marqueur': return 'Examiner';
    case 'doc': return `${(G.documents || []).includes(c.doc) ? 'Relire' : 'Lire'} : ${(DOCUMENTS[c.doc] || {}).titre || 'document'}`;
    case 'pnj': return `Parler à ${c.q.nom}`;
    case 'sol': return c.o.doc ? `Lire : ${(DOCUMENTS[c.o.doc] || {}).titre || 'document'}` : `Ramasser : ${nomObjet(c.o.id)}${c.o.qty > 1 ? ' ×' + c.o.qty : ''}`;
    case 'cadavre': return 'Fouiller le corps';
  }
  return 'Interagir';
}
const nomObjet = (id) => { const o = objet(id); return o ? o.nom : id; };
function outil(id) { return compter(id) > 0 || (G.player.equip && G.player.equip.arme === id); }
function majInvite() {
  const c = V.cible;
  const txt = c ? c.libelle : null;
  if (V._invite !== txt) {
    V._invite = txt;
    V.hud.invite.textContent = txt ? '' : '';
    if (txt) V.hud.invite.append(el('kbd', {}, 'E'), ' ', txt);
    V.hud.invite.classList.toggle('on', !!txt);
    V.entrees.setInteragir(txt);
  }
}
function message(t, ms = 2600) { V.hud.msg.textContent = t; V.hud.msg.classList.add('on'); V.msgT = ms; }

async function interagir(o) {
  if (!V || V.occupe || V.enPause) return;
  if (V.butin && !o) { prendreTout(); return; }
  if (V.fouille) { interrompreFouille(); return; }
  if (V.action) { V.action = null; V.hud.barre.classList.add('cache'); return; }
  const c = V.cible = chercherCible();
  if (!c) return;
  switch (c.type) {
    case 'porte': return actionPorte(c);
    case 'meuble': if (c.decl) return jouerDeclencheur(c.decl); return commencerFouille(c.m.cle, c.m.nom, (c.m.x0 + c.m.x1 + 1) / 2, (c.m.y0 + c.m.y1 + 1) / 2);
    case 'escalier': return prendreEscalier(c.s);
    case 'sortie': return sortirDuLieu(c.s);
    case 'marqueur': return jouerDeclencheur(c.decl);
    case 'doc': return lireDocument(c.doc);
    case 'pnj': return parler(c.q);
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
// Action chronométrée générique (forcer, crocheter…) : interrompue par le mouvement.
function lancerAction(label, ms, x, y, fin, bruitParS = 0) {
  V.action = { label, duree: ms, t: 0, x, y, fin, bruit: bruitParS, tb: 0 };
  V.hud.barre.firstChild.textContent = label;
  V.hud.barre.classList.remove('cache');
}
function avancerAction(dt) {
  const a = V.action, I = V.entrees.etat;
  if (Math.hypot(I.mx, I.my) > 0.3) { V.action = null; V.hud.barre.classList.add('cache'); message('Interrompu.'); return; }
  a.t += dt; a.tb += dt;
  if (a.bruit && a.tb >= 1000) { a.tb = 0; V.canal.bruit({ etage: V.j.etage, x: a.x, y: a.y, rayon: a.bruit }); }
  V.hud.barre.lastChild.firstChild.style.width = (100 * Math.min(1, a.t / a.duree)).toFixed(1) + '%';
  if (a.t >= a.duree) { V.action = null; V.hud.barre.classList.add('cache'); a.fin(); }
}

// ---------- Fouille en temps réel ----------
async function commencerFouille(cle, nom, x, y) {
  const r = await V.canal.fouiller(cle);
  if (!V || r.erreur) return;
  sfx('tissu_dechire');
  V.fouille = { cle, nom: r.nom || nom, items: r.items, duree: Math.max(400, r.dureeMs), p: r.progres || 0, x, y, reveles: -1, tb: 0 };
  ouvrirButin(V.fouille);
  majRevele();
}
function avancerFouille(dt) {
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
function interrompreFouille() {
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
function rendreButin() {
  const B = V.butin, h = V.hud.butin; if (!B) return;
  h.textContent = '';
  h.append(el('div', { class: 'ex-butin-t' }, capitaliser(B.nom), el('span', {}, B.fini ? '' : ' — fouille…')));
  const ul = el('ul', { class: 'ex-butin-l' });
  for (let i = 0; i < B.visibles && i < B.items.length; i++) {
    const it = B.items[i];
    const tient = !inv || !inv.combienTient || inv.combienTient(it.id, it.qty || 1) >= (it.qty || 1);
    const ou = inv && inv.ouPorter ? inv.ouPorter(it.id) : null;
    const portable = !!ou;
    const libPorter = { vetement: 'Porter', lampe: 'Équiper', main: 'En main', dos: 'Dans le dos' }[ou] || 'Porter';
    // Toucher le NOM fait l'action la plus utile : enfiler si ça se porte, sinon prendre.
    ul.append(el('li', { class: (tient ? '' : 'plein') + (i >= (B.dejaVus || 0) ? ' neuf' : '') }, el('button', { class: 'ex-b-nom', type: 'button', onclick: () => (portable ? porterItem(i) : prendreItem(i)) }, nomObjet(it.id), it.qty > 1 ? el('em', {}, ' ×' + it.qty) : null),
      portable ? el('button', { class: 'ex-b', type: 'button', onclick: () => porterItem(i) }, libPorter) : null,
      el('button', { class: 'ex-b', type: 'button', disabled: tient ? null : true, title: tient ? null : (inv.raisonPlace && inv.raisonPlace(it.id)) || 'Plus de place', onclick: () => prendreItem(i) }, tient ? 'Prendre' : (inv.estPetit && !inv.estPetit(it.id) && !G.player.equip.sac ? 'Trop gros' : 'Sac plein'))));
  }
  B.dejaVus = Math.min(B.visibles, B.items.length); // seules les lignes nouvelles s'animent
  const reste = B.items.length - B.visibles;
  if (!B.fini && reste > 0) ul.append(el('li', { class: 'ex-butin-cache' }, '…'));
  if (B.fini && !B.items.length) ul.append(el('li', { class: 'ex-butin-cache' }, 'Vide.'));
  h.append(ul);
  if (inv && inv.placeLibre) {
    const sac = inv.sacPorte();
    const b = inv.bilan();
    h.append(el('div', { class: 'ex-butin-place' }, sac ? `${sac.nom} : ${String(b.sac.utilise).replace('.', ',')} / ${b.sac.max} L · poches ${String(b.poches.utilise).replace('.', ',')} / ${String(b.poches.max).replace('.', ',')} L` : `Pas de sac : tes poches seulement (${String(b.poches.utilise).replace('.', ',')} / ${String(b.poches.max).replace('.', ',')} L, petits objets).`));
  }
  h.append(el('div', { class: 'ex-butin-a' },
    el('button', { class: 'ex-b ex-b-p', type: 'button', disabled: B.visibles ? null : true, onclick: prendreTout }, 'Tout prendre'),
    el('button', { class: 'ex-b', type: 'button', onclick: () => { interrompreFouille(); fermerButin(); } }, 'Fermer')));
}
// Retire l'objet i de la fenêtre de butin (après une prise réussie côté monde).
function retirerDuButin(B, i) {
  B.items.splice(i, 1); B.visibles = Math.max(0, B.visibles - 1); B.dejaVus = Math.max(0, (B.dejaVus || 0) - 1);
  if (V.fouille && V.fouille.cle === B.cle) { V.fouille.items = B.items; V.fouille.reveles = Math.max(0, V.fouille.reveles - 1); }
}
async function prendreItem(i) {
  const B = V && V.butin; if (!B || i >= B.visibles) return;
  const prevu = B.items[i];
  // Le sac est plein : on NE retire PAS l'objet du meuble (il reste là, rien ne se perd).
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
  const B = V && V.butin; if (!B || i >= B.visibles || !inv || !inv.porterObjet) return;
  const it = await V.canal.prendre(B.cle, i);
  if (!it) return;
  retirerDuButin(B, i);
  const r = inv.porterObjet(it);
  if (r.ok && V.cbt) V.cbt.majStats();
  if (!r.ok) { donner(it); message(r.raison || 'Impossible de le porter.', 2200); }
  else sfx('loot');
  if (!B.items.length && B.fini) fermerButin(); else rendreButin();
}
async function prendreTout() {
  const B = V && V.butin; if (!B) return;
  // D'abord enfiler un sac s'il y en a un et qu'on n'en porte pas : il donne la place pour le reste.
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
function fermerButin() { if (!V) return; V.butin = null; V.hud.butin.classList.add('cache'); V.hud.butin.textContent = ''; }
const capitaliser = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

function donner(it, silencieux) {
  if (it.doc) { lireDocument(it.doc); return; }
  let auSol = 0;
  if (inv && inv.addItem) { const r = inv.addItem(it.id, it.qty || 1); auSol = (r && r.auSol) || 0; }
  else {
    const s = G.player.inventaire.find(x => x.id === it.id && x.dur == null && x.eau == null);
    if (s) s.qty += it.qty || 1; else G.player.inventaire.push({ id: it.id, qty: it.qty || 1 });
    emit('inventaire', { ajout: it.id });
  }
  if (!silencieux) message(auSol ? `${nomObjet(it.id)} : plus de place, posé au sol.` : `Pris : ${nomObjet(it.id)}${it.qty > 1 ? ' ×' + it.qty : ''}.`, 1600);
}
async function ramasser(o) {
  const it = await V.canal.prendre('#sol:' + o.uid, 0);
  if (!it) return;
  if (it.doc) lireDocument(it.doc); else { donner(it); sfx('loot'); }
}
function fournisseurSol() {
  const proches = () => (V && V.snap ? V.snap.sol.filter(o => !o.doc && o.etage === V.j.etage && Math.hypot(o.x - V.j.x, o.y - V.j.y) <= 1.6) : []);
  return {
    lister: () => proches().map(o => ({ id: o.id, qty: o.qty })),
    deposer: (item) => { if (V) V.canal.deposer({ etage: V.j.etage, x: V.j.x + Math.cos(V.j.dir) * 0.4, y: V.j.y + Math.sin(V.j.dir) * 0.4 }, item).then(() => { V && (V.snap = V.canal.instantane()); }); },
    prendre: (i) => { const o = proches()[i]; if (!o) return null; V.canal.prendre('#sol:' + o.uid, 0); V.snap.sol = V.snap.sol.filter(x => x !== o); return { id: o.id, qty: o.qty }; },
  };
}

// ---------- Documents, PNJ, déclencheurs ----------
function docDuMarqueur(mid) {
  for (const [id, d] of Object.entries(DOCUMENTS)) if (d.marqueur === mid && (!d.lieu || d.lieu === V.lieuId)) return id;
  const m = V.niveau.marqueurs[mid]; if (m && m.doc) return m.doc;
  return null;
}
function lireDocument(id) {
  if (!G.documents.includes(id)) { G.documents.push(id); const d = DOCUMENTS[id]; if (d) noteJournal(`Trouvé : ${d.titre}.`, 'document'); }
  sfx('clic');
  emit('document', { id });
}
function majPnj() {
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
const cleDecl = (d) => `${d.quand}:${d.lieu || ''}:${d.marqueur || ''}:${d.scene || d.cinematique || ''}`;
function declencheurActif(d) {
  if (d.unique && G.world.declencheurs && G.world.declencheurs[cleDecl(d)]) return false;
  return verifierCondition(d.si);
}
function declencheurMarqueur(mid) {
  if (!mid) return null;
  for (const d of DECLENCHEURS) if (d.quand === 'marqueur' && d.lieu === V.lieuId && d.marqueur === mid && declencheurActif(d)) return d;
  return null;
}
function declencheursEntree() {
  for (const d of DECLENCHEURS) if (d.quand === 'entree_lieu' && d.lieu === V.lieuId && declencheurActif(d)) { jouerDeclencheur(d); return; }
}
function zones() {
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
    jouerDeclencheur({ quand: 'zone', lieu: V.lieuId, marqueur: 'zone' + z.i, scene: z.scene, cinematique: z.cinematique, unique: false });
    return;
  }
}
async function jouerDeclencheur(d) {
  if (!V || V.occupe) return;
  if (d.unique) { G.world.declencheurs = G.world.declencheurs || {}; G.world.declencheurs[cleDecl(d)] = true; }
  if (d.cinematique) { V.occupe = true; V.entrees.actif(false); try { await flow.cinematique(d.cinematique); } finally { if (V) { V.occupe = false; if (!V.enPause) V.entrees.actif(true); } } }
  if (d.scene) await jouerScene(d.scene);
}
async function jouerScene(id) {
  if (!V) return;
  V.occupe = true; V.entrees.actif(false); fermerButin(); interrompreFouille();
  V.canal.majJoueur({ allure: 'immobile' });
  let res = null;
  try { res = await crochets.scene(id); }
  catch (e) { console.warn('[explore] scène', id, e); }
  if (!V) return;
  V.occupe = false;
  if (!V.enPause) V.entrees.actif(true);
  if (res && res.fin === '#combat' && res.combat) await flow.combattre(res.combat);
}

// ---------- Escaliers, sortie ----------
function prendreEscalier(s) {
  const a = s.arrivee; if (!a) return;
  interrompreFouille(); fermerButin();
  changerEtage(a.etage);
  V.j.x = a.x + 0.5; V.j.y = a.y + 0.5; V.j.vx = V.j.vy = 0;
  V.canal.majJoueur({ etage: a.etage, x: V.j.x, y: V.j.y });
  sfx('pas_craque');
  afficherLieu(V.E.nom);
}
async function sortirDuLieu(s) {
  if (V.occupe) return;
  if (V.arene) { finArene('sortie'); return; }
  V.occupe = true;
  const echelle = (s && s.echelle) || V.L.echelle || 'salon';
  const id = V.lieuId;
  sortir();
  G.player.position = { mode: 'lieu', lieu: id, sorti: true };
  try { sauverPartie(); } catch (e) {}
  await flow.ouvrirCarte({ echelle, depuis: id });
}
function piece() {
  const i = Math.floor(V.j.y) * V.E.w + Math.floor(V.j.x);
  const p = V.E.piece[i];
  if (p < 0 || p === V.piece) return;
  V.piece = p;
  const P = V.niveau.pieces[p];
  if (P.nom && P.nom !== V._dernierNom) { V._dernierNom = P.nom; afficherLieu(P.nom); }
}
function afficherLieu(t) {
  const h = V.hud.lieu; h.textContent = t; h.classList.remove('on'); void h.offsetWidth; h.classList.add('on');
}

// ---------- Combat dans le lieu (scènes) et embuscades (voyage) ----------
export function actif() { return !!V && !V.arene; }
export function enArene() { return !!(V && V.arene); }
// Des morts surgissent autour du joueur, déjà en chasse. Résolu quand ils sont tous tombés, que le joueur
// leur a échappé (loin d'eux assez longtemps, ou sorti du lieu), ou qu'il est mort.
export async function combatIci(spec = {}) {
  if (!V) return { issue: 'fuite', tues: [], fuis: [] };
  const v = V;
  const occupe = v.occupe; v.occupe = false; v.entrees.actif(true);   // une scène en cours a figé le joueur : il doit pouvoir se battre
  try {
    const uids = await v.canal.faireApparaitre(spec.zombies || ['errant'], { surprise: spec.surprise, scene: true });
    if (V !== v) return { issue: 'fuite', tues: [], fuis: [] };
    sfx('alerte_contact');
    return await suivreCombat(uids);
  } finally {
    if (V === v && occupe) { v.occupe = true; v.entrees.actif(false); }
  }
}
function suivreCombat(uids, { arene = false } = {}) {
  return new Promise((ok) => {
    const v = V; if (!v) return ok({ issue: 'fuite', tues: [], fuis: uids });
    const set = new Set(uids);
    let loinDepuis = 0, fini = false;
    const finir = (issue) => {
      if (fini) return; fini = true; clearInterval(iv);
      const vivants = v.snap ? v.snap.zombies.filter(z => set.has(z.uid)).map(z => z.uid) : [];
      ok({ issue, tues: uids.filter(u => !vivants.includes(u)), fuis: issue === 'fuite' ? vivants : [], xp: {}, bruit: 0 });
    };
    v.attentes = (v.attentes || []).concat(() => finir(v.cbt && v.cbt.etat.mort ? 'mort' : 'fuite'));
    const iv = setInterval(() => {
      if (V !== v) { finir('fuite'); return; }
      if (v.cbt.etat.mort || (G.player.pv ?? 1) <= 0) { finir('mort'); return; }
      const vivants = v.snap.zombies.filter(z => set.has(z.uid));
      if (!vivants.length) { finir('victoire'); return; }
      if (arene) return;
      const F = REGLAGES.combat.FIN_FUITE;
      const loin = vivants.every(z => z.etage !== v.j.etage || Math.hypot(z.x - v.j.x, z.y - v.j.y) > F.DISTANCE);
      loinDepuis = loin ? loinDepuis + 250 : 0;
      if (loinDepuis >= F.MS) finir('fuite');
    }, 250);
  });
}
// Embuscade : un bout de route généré, on s'en sort en tuant ou par un bord.
let areneFin = null;
export function embuscade(spec = {}) {
  return new Promise(async (ok) => {
    areneFin = ok;
    const W = G.world;
    const seed = `${W.minutes}:${(spec.zombies || []).join(',')}:${Math.floor(Math.random() * 1e6)}`;
    try {
      await entrer({ arene: { ...spec, seed, echelle: spec.echelle || 'region' } });
    } catch (e) { console.warn('[explore] embuscade', e); areneFin = null; ok({ issue: 'fuite', tues: [], fuis: [] }); }
  });
}
function finArene(raison, r = null) {
  if (!V || !V.arene) return;
  if (raison === 'nettoye') { // tous à terre : on peut fouiller les corps puis reprendre la route
    V.hud.route.classList.remove('cache');
    message('Plus rien ne bouge. Fouille les corps si tu veux, puis reprends la route (ou sors par un bord).', 4200);
    V.areneVictoire = true;
    return;
  }
  const vivants = V.snap ? V.snap.zombies.map(z => z.uid) : [];
  const res = { issue: raison === 'mort' ? 'mort' : V.areneVictoire || !vivants.length ? 'victoire' : 'fuite', tues: [], fuis: vivants, xp: {}, bruit: 0 };
  const ok = areneFin; areneFin = null;
  sortir();
  if (ok) ok(res);
}
function majMains() {
  if (!V || !inv || !inv.mains) return;
  const m = inv.mains(G.player), p = G.player;
  V.equipVu = { droite: m.droite, gauche: m.gauche, deux: m.deux, dos: p.equip.dos || null };
  const nom = (id) => (id ? nomObjet(id) : 'Main nue');
  const usure = (slot) => { const e = p.equipEtat && p.equipEtat[slot]; return e && e.durMax ? Math.max(0, Math.min(1, e.dur / e.durMax)) : null; };
  const h = V.hud.mains; h.textContent = '';
  const ligne = (cls, data, titre, txt, u, extra) => {
    const b = el('button', { class: 'ex-main ' + cls, type: 'button', 'data-m': data, title: titre }, el('small', {}, titre), el('span', {}, txt));
    if (u != null) b.append(el('i', { class: 'ex-usure' + (u < 0.2 ? ' bas' : '') }, el('b', { style: { width: Math.round(u * 100) + '%' } })));
    if (extra) b.append(extra);
    return b;
  };
  const d = m.droite ? objet(m.droite) : null;
  const balles = d && d.tir ? el('em', {}, `${(p.equipEtat.arme && p.equipEtat.arme.balles) || 0}/${d.tir.capacite}`) : null;
  h.append(ligne('droite', 'mains', m.deux ? 'Deux mains' : 'Main droite', nom(m.droite) + (m.uneMainPenalite ? ' (1 main)' : ''), usure('arme'), balles));
  if (!m.deux && m.gauche) h.append(ligne('gauche', 'mains', 'Main gauche', nom(m.gauche), p.equip.mainG ? usure('mainG') : null));
  if (p.equip.dos) h.append(ligne('dos', 'dos', 'Dans le dos', nom(p.equip.dos), null));
}
function majDegage() {
  const r = V.cbt.etat.empoigne, h = V.hud.degage;
  if (!r) { if (!h.classList.contains('cache')) h.classList.add('cache'); return; }
  h.classList.remove('cache');
  const txt = `Dégage-toi ! ${Math.floor(r.taps)} / ${r.requis}`;
  if (h.textContent !== txt) h.textContent = txt;
}

// ---------- Divers ----------
async function ouvrirInventaire() {
  if (panneaux === null) { try { panneaux = await import('../ui/panels/index.js'); } catch (e) { panneaux = false; } }
  if (panneaux && panneaux.ouvrirPanneau) { try { panneaux.ouvrirPanneau('inventaire'); } catch (e) { console.warn(e); } }
}
function echap() {
  if (V.carte) { V.carte = false; return; }
  if (V.cbt && V.cbt.etat.charge) { V.cbt.frapper(false, true); return; }
  if (V.butin || V.fouille) { interrompreFouille(); fermerButin(); return; }
  if (V.action) { V.action = null; V.hud.barre.classList.add('cache'); return; }
  emit('echap', { temps: 'exploration' });
}
void ITEMS; void PROPS;
