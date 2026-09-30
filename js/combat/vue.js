// ============================================================================
//  COMBAT — l'écran (Temps 3) : ouvrir({ spec }) → Promise<resultat>
// ============================================================================
// Monte un écran plein par-dessus tout, fait tourner la simulation (sim.js) via un canal
// (canal_local.js, ou un canal distant fourni par la co-op), traduit clavier / tactile en
// actions et les événements en retours (chiffres, sang, secousses, sons, vibrations, journal).
// Applique au JOUEUR LOCAL les blessures (js/game/survival.js → infligerBlessure si présent),
// les dégâts bloqués, l'usure de l'arme, les munitions et l'XP.
//
// spec (REFONTE §12.2) : { zombies: [{uid?, type, hp?}] | ['errant', …], lieuId?, decor?,
//   surprise?: 'engage'|'normal'|'surpris'|'voyage', tuto?: bool, noir?: bool, id?, pool? }
// Option : ouvrir({ spec, canal }) — un canal déjà prêt (co-op : canal distant de l'invité / hôte).
// Résultat : { issue: 'victoire'|'fuite'|'mort', tues, fuis, xp, bruit, blessures, usure, munitions, dureeMs, mal }
// ============================================================================
import { G, genrer } from '../core/state.js';
import { emit as busEmit } from '../core/bus.js';
import { el, estTactile, vibrer } from '../core/util.js';
import { pref } from '../core/prefs.js';
import { ZOMBIES, LIEUX, ITEMS } from '../game/donnees.js';
import { REGLAGES, presetDifficulte } from '../data/reglages.js';
import { creerCombat } from './sim.js';
import { creerCanalCombat } from './canal_local.js';
import { statsCombat, appliquerResultat } from './stats.js';
import { decorSVG, themeDepuis } from './decor.js';

const RACINE = new URL('../../', import.meta.url).href;
let courant = null;
export function debug() { return courant; }

// ---------------------------------------------------------------- audio (tolérant)
let audio = null;
async function chargerAudio() {
  if (audio !== null) return audio;
  try { audio = await import('../audio.js'); try { audio.initAudio && audio.initAudio(); } catch (e) {} } catch (e) { audio = false; }
  return audio;
}
const son = (n) => { try { if (audio && audio.sfx) audio.sfx(n); } catch (e) {} };

// ---------------------------------------------------------------- visuels des morts
let silhouettes = null;
function urlPng(type) {
  const def = ZOMBIES[type];
  return def && def.png ? RACINE + def.png : null;
}
function svgMort(type, prefixe) {
  const S = silhouettes || {};
  const fn = S[type] || S._defaut;
  if (!fn) return el('div');
  const w = document.createElement('div');
  w.innerHTML = `<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">${fn(prefixe)}</svg>`;
  return w.firstElementChild;
}
let compteurSvg = 0;
function visuelMort(type) {
  const url = urlPng(type);
  if (url) {
    const img = el('img', { src: url, alt: (ZOMBIES[type] || {}).nom || type, draggable: 'false' });
    img.addEventListener('error', () => { const s = svgMort(type, `cbs${++compteurSvg}`); img.replaceWith(s); }, { once: true });
    return img;
  }
  return svgMort(type, `cbs${++compteurSvg}`);
}

// ---------------------------------------------------------------- textes
const NOM_PLAIE = { egratignure: 'Égratignure', contusion: 'Contusion', entaille: 'Entaille', profonde: 'Blessure profonde', morsure: 'Morsure', fracture: 'Fracture', brulure: 'Brûlure' };
const RAISON_RATE = { derobe: 'Il se dérobe.', essouffle: 'Trop {essoufflé|essoufflée} : le coup part à côté.', noir: 'Raté : dans le noir.', vide: 'Raté.', personne: '' };

const TUTO = {
  debut: '<b>Frapper</b> : appui court (Espace / J, ou le gros bouton). <b>Maintiens</b> pour charger un coup lourd, relâche pour frapper.',
  rouge: 'Contour <span class="rouge">ROUGE</span> : il va frapper. <b>Esquive</b> (L / Maj, ou glisse le doigt sur lui). Au tout dernier moment, c\'est une esquive <b>parfaite</b> : tu contres.',
  ambre: 'Contour <b>AMBRE</b>, bras ouverts : il veut t\'empoigner. Esquive-le, ou prépare-toi à marteler.',
  saisie: 'Il te tient ! <b>Martèle Frapper</b> (ou Pousser) avant que l\'anneau se ferme. Un mort ne te mord que s\'il te tient.',
  contre: '<b>Contre !</b> Frappe maintenant : coup garanti, ×1,6.',
  souffle: 'Ton souffle baisse. <b>Lâche tout une seconde</b> : l\'endurance remonte vite. {Essoufflé|Essoufflée}, tes coups partent quand même, mais mous.',
  garde: '<b>Garde</b> (K, maintenir) : bloque l\'essentiel d\'un coup, au prix d\'endurance. Le repère bleu sur ta barre montre ce que coûtera le prochain blocage.',
  pousser: '<b>Pousser</b> (H) : le repousse et casse sa ruée. Il faut 2,5 s pour recommencer.',
  fuir: '<b>Fuir</b> : maintiens Échap (ou le bouton) 1,5 s. Plus il y a de morts, plus c\'est dur.',
  tir: '<b>Tirer</b> : maintiens pour viser, relâche pour tirer. <b>R</b> recharge. Le bruit attire les autres.',
};

// ============================================================================
export async function ouvrir({ spec = {}, canal: canalFourni = null } = {}) {
  if (courant) { console.warn('[combat] un combat est déjà ouvert'); return courant.promesse; }
  const ctx = { spec };
  courant = ctx;
  ctx.promesse = new Promise((res) => { ctx.resoudre = res; });
  try { await monter(ctx, canalFourni); }
  catch (e) {
    console.error('[combat] impossible d\'ouvrir le combat', e);
    nettoyer(ctx);
    const r = { issue: 'victoire', tues: [], fuis: [], xp: {}, bruit: 0, erreur: String(e) };
    ctx.resoudre(r);
  }
  return ctx.promesse;
}

async function monter(ctx, canalFourni) {
  const spec = ctx.spec;
  await chargerAudio();
  const joueurId = (canalFourni && canalFourni.joueurId) || (G && G.player && (G.player.id || G.player.nom)) || 'moi';
  const id = spec.id || `c${Date.now().toString(36)}`;
  const zombies = (spec.zombies || ['errant']).map((z, i) => (typeof z === 'string' ? { uid: `${id}:${i}`, type: z } : { uid: z.uid || `${id}:${i}`, type: z.type, hp: z.hp }));
  const lieu = spec.lieuId ? LIEUX[spec.lieuId] : null;
  const tactile = estTactile();
  // Silhouettes SVG de repli : seulement si un mort n'a pas d'image.
  if (zombies.some(z => !urlPng(z.type)) || (lieu && lieu.pool && lieu.pool.some(t => !urlPng(t)))) {
    try { silhouettes = (await import('./silhouettes.js')).SILHOUETTES; } catch (e) { silhouettes = {}; }
  }
  let canal = canalFourni;
  if (!canal) {
    const stats = statsCombat(G ? G.player : null, { tactile, noir: !!spec.noir });
    const diff = presetDifficulte((G && (G.world.difficulte || G.difficulte)) || pref('difficulte'));
    ctx.sim = creerCombat({
      id, lieuId: spec.lieuId || null, seed: `${G ? G.world.seed : 1}:${id}`,
      participants: [{ id: joueurId, nom: (G && G.player.nom) || 'Toi', stats }],
      zombies, danger: spec.danger ?? (lieu ? lieu.danger : undefined), surprise: spec.surprise || 'normal',
      difficulte: diff, pool: spec.pool || null, tuto: !!spec.tuto,
    });
    canal = creerCanalCombat(ctx.sim, joueurId);
  }
  ctx.canal = canal; ctx.jid = joueurId; ctx.tactile = tactile;
  try { ctx.survie = await import('../game/survival.js'); } catch (e) { ctx.survie = null; }
  try { ctx.player = await import('../game/player.js'); } catch (e) { ctx.player = null; }

  construireDom(ctx, lieu);
  brancherEntrees(ctx);
  ctx.offs = [canal.on('evt', (e) => surEvt(ctx, e)), canal.on('fin', (r) => surFin(ctx, r))];
  ctx.surVisibilite = () => { if (!G || G.mode === 'solo') canal.pause && canal.pause(document.hidden); };
  document.addEventListener('visibilitychange', ctx.surVisibilite);
  try { audio && audio.startCombatMusic && audio.startCombatMusic(); } catch (e) {}
  busEmit('combat:debut', { spec });
  canal.demarrer && canal.demarrer();
  const boucle = () => { if (courant !== ctx || ctx.ferme) return; rendre(ctx); ctx.raf = requestAnimationFrame(boucle); };
  ctx.raf = requestAnimationFrame(boucle);
  if (spec.tuto) tuto(ctx, 'debut', 7000);
}

// ============================================================================
//  DOM
// ============================================================================
function bouton(cls, titre, sous, touche, nom) {
  const b = el('button', { class: `cbt-b ${cls}`, type: 'button', 'data-action': nom, 'aria-label': titre },
    el('i', { class: 'jauge' }), el('strong', {}, titre), el('small', {}, sous || ''), touche ? el('kbd', {}, touche) : null);
  return b;
}
function construireDom(ctx, lieu) {
  if (!document.querySelector('link[data-cbt]')) {
    const l = el('link', { rel: 'stylesheet', href: RACINE + 'css/combat.css', 'data-cbt': '1' });
    document.head.appendChild(l);
  }
  const theme = themeDepuis(lieu, ctx.spec.decor);
  const d = {};
  d.racine = el('div', { class: 'cbt', role: 'application', 'aria-label': 'Combat' });
  d.monde = el('div', { class: 'cbt-monde' });
  d.decor = el('div', { class: 'cbt-decor', html: decorSVG(theme, ctx.spec.lieuId || theme) });
  d.scene = el('div', { class: 'cbt-scene' });
  d.file = el('div', { class: 'cbt-file' });
  d.sol = el('div', { class: 'cbt-sol' });
  d.mort = el('div', { class: 'cbt-mort entree' });
  d.mortP = el('div', { class: 'cbt-mort-p' });
  d.mortC = el('div', { class: 'cbt-mort-c' });
  d.mortP.append(d.mortC); d.mort.append(d.mortP);
  d.balayage = el('div', { class: 'cbt-balayage' });
  d.scene.append(d.file, d.sol, d.mort, d.balayage);
  d.fx = el('div', { class: 'cbt-fx' });
  d.flash = el('div', { class: 'cbt-flash' });
  d.monde.append(d.decor, d.scene, el('div', { class: 'cbt-vignette' }), el('div', { class: 'cbt-grain' }), d.fx, d.flash);

  // HUD
  d.hud = el('div', { class: 'cbt-hud' });
  d.anneauVal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const svgA = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgA.setAttribute('viewBox', '0 0 60 60');
  const fondA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const c of [fondA, d.anneauVal]) { c.setAttribute('cx', 30); c.setAttribute('cy', 30); c.setAttribute('r', 24); }
  fondA.setAttribute('class', 'fond'); d.anneauVal.setAttribute('class', 'val');
  d.anneauVal.setAttribute('stroke-dasharray', String(2 * Math.PI * 24));
  svgA.append(fondA, d.anneauVal);
  d.anneauTxt = el('span', {}, 'menace');
  d.anneau = el('div', { class: 'cbt-anneau', title: 'Jauge de menace : pleine, il se ramasse pour attaquer' }, svgA, d.anneauTxt);
  d.cNom = el('span', {}, '—'); d.cPv = el('small', {}, '');
  d.cBarreF = el('i', { class: 'fantome' }); d.cBarre = el('i');
  d.cEtat = el('div', { class: 'cbt-etat' }, '');
  d.cCriI = el('i'); d.cCri = el('div', { class: 'cbt-cri', title: 'Il gonfle la gorge : coupe son cri (le faire vaciller, le pousser)' }, d.cCriI);
  d.cible = el('div', { class: 'cbt-cible' }, d.anneau, el('div', { class: 'cbt-cible-info' },
    el('div', { class: 'cbt-cible-nom' }, d.cNom, d.cPv), el('div', { class: 'cbt-barre' }, d.cBarreF, d.cBarre), d.cEtat, d.cCri));
  d.recit = el('div', { class: 'cbt-recit' });
  d.journal = el('div', { class: 'cbt-journal', 'aria-live': 'polite' });
  d.renfort = el('div', { class: 'cbt-renfort' });
  d.fronts = el('div', { class: 'cbt-fronts' });
  // Joueur
  d.pvI = el('i'); d.pvT = el('span'); d.staI = el('i'); d.staT = el('span');
  d.staCout = el('i', { class: 'cout' }); d.staRepere = el('i', { class: 'repere', title: 'Coût du prochain blocage' });
  const seuil = el('i', { class: 'seuil', title: 'En dessous : essoufflé(e)' });
  seuil.style.left = `${REGLAGES.combat.ENDURANCE.SEUIL_ESSOUFFLE}%`;
  d.pvB = el('div', { class: 'cbt-barre cbt-pv' }, d.pvI);
  d.staB = el('div', { class: 'cbt-barre cbt-sta' }, d.staI, d.staCout, seuil, d.staRepere);
  d.armeNom = el('span'); d.armeInfo = el('span');
  d.puces = el('div', { class: 'cbt-puces' });
  d.joueur = el('div', { class: 'cbt-joueur' },
    el('div', { class: 'cbt-lig' }, el('b', {}, 'PV'), d.pvB, d.pvT),
    el('div', { class: 'cbt-lig' }, el('b', {}, 'END'), d.staB, d.staT),
    el('div', { class: 'cbt-arme' }, d.armeNom, d.armeInfo), d.puces);
  // Boutons
  d.bFrapper = bouton('cbt-b-frapper', 'Frapper', 'maintenir : charger', 'Espace', 'frapper');
  d.bGarde = bouton('cbt-b-garde', 'Garde', 'maintenir', 'K', 'garde');
  d.bEsquive = bouton('cbt-b-esquive', 'Esquive', 'ou glisser', 'L', 'esquive');
  d.bPousser = bouton('cbt-b-pousser', 'Pousser', '', 'H', 'pousser');
  d.bCrosse = bouton('cbt-b-crosse', 'Crosse', 'coup', 'F', 'crosse');
  d.bRecharger = bouton('cbt-b-recharger', 'Recharger', '', 'R', 'recharger');
  d.actions = el('div', { class: 'cbt-actions' }, d.bGarde, d.bPousser, d.bFrapper, d.bEsquive, d.bCrosse, d.bRecharger);
  d.bFuir = bouton('cbt-b-fuir', 'Fuir', 'maintenir', 'Échap', 'fuir');
  d.rapide = el('div', { class: 'cbt-rapide' });
  // Empoignade, charge, tuto
  const svgE = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svgE.setAttribute('viewBox', '0 0 100 100');
  const fe = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  d.empVal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const c of [fe, d.empVal]) { c.setAttribute('cx', 50); c.setAttribute('cy', 50); c.setAttribute('r', 42); }
  fe.setAttribute('class', 'fond'); d.empVal.setAttribute('class', 'val'); d.empVal.setAttribute('stroke-dasharray', String(2 * Math.PI * 42));
  svgE.append(fe, d.empVal);
  d.empN = el('b', {}, '0');
  d.emp = el('div', { class: 'cbt-emp' }, svgE, el('div', {}, d.empN, el('span', {}, 'Martèle !')));
  d.chargeI = el('i'); d.charge = el('div', { class: 'cbt-charge' }, d.chargeI, el('em'));
  d.tuto = el('div', { class: 'cbt-tuto' });
  d.hud.append(d.cible, d.recit, d.journal, d.renfort, d.fronts, d.joueur, d.actions, d.bFuir, d.rapide, d.emp, d.charge, d.tuto);
  d.racine.append(d.monde, d.hud);
  document.body.appendChild(d.racine);
  ctx.d = d;
  ctx.prev = {};
  ctx.journal = [];
  ctx.tutoVu = new Set();
  ctx.fileCle = '';
}

// ============================================================================
//  ENTRÉES : clavier, boutons, balayage
// ============================================================================
const TOUCHES = {
  Space: 'frapper', KeyJ: 'frapper', KeyF: 'crosse', KeyK: 'garde', KeyL: 'esquive', ShiftLeft: 'esquive', ShiftRight: 'esquive',
  KeyH: 'pousser', KeyR: 'recharger', Escape: 'fuir', Digit1: 'r0', Digit2: 'r1', Digit3: 'r2', Digit4: 'r3',
  Numpad1: 'r0', Numpad2: 'r1', Numpad3: 'r2', Numpad4: 'r3',
};
const TENUS = new Set(['frapper', 'crosse', 'garde', 'fuir']);

function presser(ctx, nom) {
  if (ctx.ferme || ctx.finAffichee) return;
  const c = ctx.canal;
  const moi = ctx.moi;
  const armeTir = moi && moi.arme.tir;
  if (TENUS.has(nom)) { if (ctx.tenus.has(nom)) return; ctx.tenus.add(nom); }
  switch (nom) {
    case 'frapper':
      if (armeTir && !(moi && moi.empoignade)) c.action({ type: 'tirer', appui: true });
      else c.action({ type: 'frapper', appui: true });
      break;
    case 'crosse': c.action({ type: 'frapper', appui: true }); break;
    case 'garde': c.action({ type: 'garde', appui: true }); break;
    case 'esquive': c.action({ type: 'esquive' }); break;
    case 'pousser': c.action({ type: 'pousser' }); break;
    case 'recharger': c.action({ type: 'recharger' }); break;
    case 'fuir': c.action({ type: 'fuir', appui: true }); break;
    default:
      if (nom && nom[0] === 'r') c.action({ type: 'rapide', index: +nom.slice(1) });
  }
  const b = ctx.d.racine.querySelector(`[data-action="${nom}"]`);
  if (b) { b.classList.add('appui'); if (!TENUS.has(nom)) setTimeout(() => b.classList.remove('appui'), 120); }
}
function relacher(ctx, nom) {
  if (!ctx.tenus.has(nom)) return;
  ctx.tenus.delete(nom);
  const c = ctx.canal;
  const moi = ctx.moi;
  switch (nom) {
    case 'frapper':
      if (moi && moi.visee != null) c.action({ type: 'tirer', appui: false });
      else c.action({ type: 'frapper', appui: false });
      break;
    case 'crosse': c.action({ type: 'frapper', appui: false }); break;
    case 'garde': c.action({ type: 'garde', appui: false }); break;
    case 'fuir': c.action({ type: 'fuir', appui: false }); break;
  }
  const b = ctx.d.racine.querySelector(`[data-action="${nom}"]`);
  if (b) b.classList.remove('appui');
}
function brancherEntrees(ctx) {
  ctx.tenus = new Set();
  ctx.kd = (e) => {
    if (ctx.finAffichee) {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); ctx.continuer && ctx.continuer(); }
      return;
    }
    const nom = TOUCHES[e.code];
    if (!nom) return;
    e.preventDefault(); e.stopPropagation();
    if (e.repeat) return;
    presser(ctx, nom);
  };
  ctx.ku = (e) => {
    const nom = TOUCHES[e.code];
    if (!nom) return;
    e.preventDefault(); e.stopPropagation();
    relacher(ctx, nom);
  };
  ctx.blur = () => { for (const n of [...ctx.tenus]) relacher(ctx, n); };
  window.addEventListener('keydown', ctx.kd, true);
  window.addEventListener('keyup', ctx.ku, true);
  window.addEventListener('blur', ctx.blur);
  // Boutons (souris + tactile) : pointerdown = appui, pointerup/cancel = relâche
  ctx.d.hud.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (er) {}
    presser(ctx, b.dataset.action);
  });
  const fin = (e) => { const b = e.target.closest && e.target.closest('[data-action]'); if (b) relacher(ctx, b.dataset.action); };
  ctx.d.hud.addEventListener('pointerup', fin);
  ctx.d.hud.addEventListener('pointercancel', fin);
  ctx.d.hud.addEventListener('lostpointercapture', fin);
  ctx.d.hud.addEventListener('contextmenu', (e) => e.preventDefault());
  // Balayage sur le mort : esquive
  let dep = null;
  ctx.d.balayage.addEventListener('pointerdown', (e) => { dep = { x: e.clientX, y: e.clientY, t: performance.now() }; try { ctx.d.balayage.setPointerCapture(e.pointerId); } catch (er) {} });
  ctx.d.balayage.addEventListener('pointerup', (e) => {
    if (!dep) return;
    const dx = e.clientX - dep.x, dy = e.clientY - dep.y, dt = performance.now() - dep.t;
    dep = null;
    if (Math.hypot(dx, dy) > 40 && dt < 600) presser(ctx, 'esquive');
  });
}

// ============================================================================
//  RENDU (60 Hz, sans innerHTML)
// ============================================================================
const setTxt = (ctx, k, n, v) => { if (ctx.prev[k] !== v) { ctx.prev[k] = v; n.textContent = v; } };
const setW = (ctx, k, n, v) => { const s = `${Math.max(0, Math.min(100, v)).toFixed(1)}%`; if (ctx.prev[k] !== s) { ctx.prev[k] = s; n.style.width = s; } };
const setCls = (n, c, on) => { if (n.classList.contains(c) !== !!on) n.classList.toggle(c, !!on); };

function mortAffiche(st, moi) {
  if (!moi) return null;
  const par = (uid) => uid && st.zombies.find(z => z.uid === uid && z.etat !== 'file' && z.etat !== 'mort' && z.etat !== 'fui');
  return par(moi.cible) || par(moi.actif) || st.zombies.find(z => !['file', 'mort', 'fui'].includes(z.etat)) || null;
}

function rendre(ctx) {
  const st = ctx.canal.etat();
  const d = ctx.d;
  const moi = st.participants.find(p => p.id === ctx.jid) || st.participants[0];
  ctx.moi = moi;
  if (!moi) return;
  const z = mortAffiche(st, moi);
  ctx.zAffiche = z;
  // ---- le mort
  if (z && z.uid !== ctx.prev.zuid) {
    ctx.prev.zuid = z.uid;
    d.mortC.replaceChildren(visuelMort(z.type));
    d.mort.className = 'cbt-mort entree';
    requestAnimationFrame(() => requestAnimationFrame(() => setCls(d.mort, 'entree', z.etat === 'entree')));
  }
  if (!z && ctx.prev.zuid) { ctx.prev.zuid = null; d.mortC.replaceChildren(); }
  if (z) {
    setCls(d.mort, 'entree', z.etat === 'entree');
    setCls(d.mort, 'tel', z.etat === 'telegraphe');
    setCls(d.mort, 'tel-coup', z.etat === 'telegraphe' && z.ruee === 'coup');
    setCls(d.mort, 'tel-saisie', z.etat === 'telegraphe' && z.ruee === 'saisie');
    setCls(d.mort, 'vacille', z.etat === 'vacille');
    setCls(d.mort, 'a-terre', z.etat === 'a_terre');
    setCls(d.mort, 'empoignade', z.etat === 'empoignade');
    setCls(d.mort, 'menace-haute', z.etat === 'menace' && z.menace > 0.7);
    setCls(d.mort, 'feu', z.feu);
    const def = ZOMBIES[z.type] || {};
    setTxt(ctx, 'cnom', d.cNom, z.nom);
    setTxt(ctx, 'cpv', d.cPv, `${z.hp} / ${z.hpMax}`);
    setW(ctx, 'cbar', d.cBarre, 100 * z.hp / z.hpMax);
    setW(ctx, 'cbarf', d.cBarreF, 100 * z.hp / z.hpMax);
    // anneau de menace
    const C = 2 * Math.PI * 24;
    const val = z.etat === 'telegraphe' ? 1 - (z.tel || 0) : z.menace;
    const off = (C * (1 - Math.max(0, Math.min(1, val)))).toFixed(1);
    if (ctx.prev.anneau !== off) { ctx.prev.anneau = off; d.anneauVal.setAttribute('stroke-dashoffset', off); }
    const clsA = z.etat === 'telegraphe' ? `cbt-anneau tel tel-${z.ruee}` : 'cbt-anneau';
    if (ctx.prev.clsA !== clsA) { ctx.prev.clsA = clsA; d.anneau.className = clsA; }
    setTxt(ctx, 'atxt', d.anneauTxt, z.etat === 'telegraphe' ? (z.ruee === 'saisie' ? 'saisie' : 'coup') : z.etat === 'a_terre' || z.etat === 'vacille' ? 'figée' : `${Math.round(100 * z.menace)} %`);
    let etat = '', cls = 'cbt-etat';
    switch (z.etat) {
      case 'entree': etat = 's\'avance…'; break;
      case 'menace': etat = z.menace > 0.7 ? 'se rapproche, va se ramasser' : 'tangue vers toi'; break;
      case 'telegraphe': etat = z.ruee === 'saisie' ? 'BRAS OUVERTS : VA T\'EMPOIGNER' : 'SE RAMASSE : VA FRAPPER'; cls += z.ruee === 'saisie' ? ' ambre' : ' rouge'; break;
      case 'recup': etat = 'se reprend…'; break;
      case 'vacille': etat = 'VACILLE : frappe !'; cls += ' creme'; break;
      case 'a_terre': etat = 'À TERRE : frappe !'; cls += ' creme'; break;
      case 'empoignade': etat = 'EMPOIGNADE'; cls += ' ambre'; break;
    }
    if (z.joueur && z.joueur !== ctx.jid) etat = `(front de ${nomJoueur(st, z.joueur)}) ${etat}`;
    setTxt(ctx, 'cetat', d.cEtat, etat);
    if (ctx.prev.clsE !== cls) { ctx.prev.clsE = cls; d.cEtat.className = cls; }
    setCls(d.cCri, 'on', z.cri != null);
    if (z.cri != null) setW(ctx, 'cri', d.cCriI, 100 * z.cri);
    void def;
  } else {
    setTxt(ctx, 'cnom', d.cNom, st.renfortsEnRoute ? 'Quelque chose approche' : '—');
    setTxt(ctx, 'cpv', d.cPv, ''); setTxt(ctx, 'cetat', d.cEtat, '');
    setW(ctx, 'cbar', d.cBarre, 0); setW(ctx, 'cbarf', d.cBarreF, 0);
  }
  // ---- la file (reconstruite seulement quand elle change)
  const cle = st.file.join(',');
  if (cle !== ctx.fileCle) { ctx.fileCle = cle; rendreFile(ctx, st); }
  // ---- renforts
  const rtxt = st.renfortsEnRoute ? `Des pas approchent (${st.renfortsEnRoute})` : (st.file.length ? `En file : ${st.file.length}` : '');
  setTxt(ctx, 'renf', d.renfort, rtxt);
  // ---- joueur
  setW(ctx, 'pv', d.pvI, 100 * moi.pv / moi.pvMax); setTxt(ctx, 'pvt', d.pvT, String(moi.pv));
  setW(ctx, 'sta', d.staI, 100 * moi.sta / moi.staMax); setTxt(ctx, 'stat', d.staT, String(Math.floor(moi.sta)));
  setCls(d.staB, 'essouffle', moi.essouffle);
  const coutCoup = moi.charge != null ? moi.arme.staCoup + (moi.arme.staLourd - moi.arme.staCoup) * moi.charge : moi.arme.tir ? REGLAGES.combat.TIR.STA : moi.arme.staCoup;
  const cf = Math.min(moi.sta, coutCoup);
  const gauche = `${(100 * (moi.sta - cf) / moi.staMax).toFixed(1)}%`, larg = `${(100 * cf / moi.staMax).toFixed(1)}%`;
  if (ctx.prev.cg !== gauche + larg) { ctx.prev.cg = gauche + larg; d.staCout.style.left = gauche; d.staCout.style.width = larg; }
  const rep = `${Math.min(100, 100 * moi.coutBloc / moi.staMax).toFixed(1)}%`;
  if (ctx.prev.rep !== rep) { ctx.prev.rep = rep; d.staRepere.style.left = rep; }
  setCls(d.racine, 'cbt-bas-pv', moi.pv / moi.pvMax < 0.3);
  if (ctx.prev.coeur !== (moi.pv / moi.pvMax < 0.3)) { ctx.prev.coeur = moi.pv / moi.pvMax < 0.3; try { audio && audio.setHeartbeat && audio.setHeartbeat(ctx.prev.coeur); } catch (e) {} }
  const a = moi.arme;
  setTxt(ctx, 'arme', d.armeNom, a.nom);
  let info = '';
  if (a.tir) info = `${a.balles} / ${a.capacite}  (+${a.reserve})`;
  else if (a.durMax) info = `usure ${Math.round(100 * a.dur / a.durMax)} %`;
  setTxt(ctx, 'armei', d.armeInfo, info);
  setCls(d.armeInfo, 'use', !a.tir && a.durMax && a.dur / a.durMax < REGLAGES.combat.DEGATS.SEUIL_USEE);
  // puces d'état
  const puces = [];
  if (moi.contre > 0) puces.push(['CONTRE !', 'ambre']);
  if (moi.garde) puces.push([moi.gardePrete ? 'Garde levée' : 'Garde…', 'bleu']);
  if (moi.brisee) puces.push(['Garde brisée', 'rouge']);
  if (moi.aBout) puces.push(['À bout de souffle', 'rouge']);
  else if (moi.essouffle) puces.push([genrer('{Essoufflé|Essoufflée}'), 'rouge']);
  if (moi.recharge != null) puces.push([`Recharge ${Math.round(moi.recharge * 100)} %`, 'bleu']);
  if (moi.change) puces.push(['Change d\'arme…', 'bleu']);
  if (moi.soin) puces.push(['Soin…', 'bleu']);
  if (moi.fuite != null) puces.push([`Fuite ${Math.round(moi.fuite * 100)} %`, 'ambre']);
  if (moi.aTerre) puces.push([`À terre ${Math.ceil(moi.aTerreRestant / 1000)} s`, 'rouge']);
  const cleP = puces.map(p => p[0]).join('|');
  if (ctx.prev.puces !== cleP) { ctx.prev.puces = cleP; d.puces.replaceChildren(...puces.map(([t, c]) => el('span', { class: `cbt-puce ${c}` }, t))); }
  // ---- boutons
  rendreBoutons(ctx, st, moi, z);
  // ---- empoignade
  const emp = moi.empoignade;
  setCls(d.emp, 'on', !!emp);
  if (emp) {
    const C = 2 * Math.PI * 42;
    d.empVal.setAttribute('stroke-dashoffset', (C * (1 - emp.restant / emp.duree)).toFixed(1));
    setCls(d.empVal, 'urgent', emp.restant < 800);
    setTxt(ctx, 'empn', d.empN, String(Math.max(0, Math.ceil(emp.requis - emp.taps))));
  }
  // ---- barre de charge / visée
  const ch = moi.charge != null ? moi.charge : moi.visee;
  setCls(d.charge, 'on', ch != null && (moi.visee != null || ch > 0.02));
  if (ch != null) { setW(ctx, 'ch', d.chargeI, 100 * ch); setCls(d.charge, 'plein', ch >= 0.9); }
  // ---- fronts co-op
  if (st.participants.length > 1) rendreFronts(ctx, st, moi);
  // ---- tutoriel : conseils conditionnels
  if (ctx.spec.tuto) {
    if (moi.sta < 30) tuto(ctx, 'souffle');
    if (moi.contre > 0) tuto(ctx, 'contre', 1500);
    if (moi.pv / moi.pvMax < 0.5) tuto(ctx, 'fuir');
    if (a.tir) tuto(ctx, 'tir');
    if (z && z.etat === 'menace' && z.menace > 0.75 && ctx.nbTel >= 3) tuto(ctx, 'pousser');
  }
}
function nomJoueur(st, id) { const p = st.participants.find(x => x.id === id); return p ? p.nom : id; }

function rendreBoutons(ctx, st, moi, z) {
  const d = ctx.d, a = moi.arme;
  const emp = !!moi.empoignade;
  // Frapper / Tirer / Marteler
  let t1 = 'Frapper', s1 = 'maintenir : charger';
  if (emp) { t1 = 'Marteler'; s1 = 'vite, vite !'; }
  else if (a.tir) { t1 = a.balles > 0 ? 'Tirer' : 'Vide'; s1 = a.balles > 0 ? 'maintenir : viser' : 'R : recharger'; }
  else if (moi.contre > 0) { t1 = 'Contrer'; s1 = 'maintenant !'; }
  const cle = `${t1}|${s1}`;
  if (ctx.prev.bf !== cle) { ctx.prev.bf = cle; d.bFrapper.querySelector('strong').textContent = t1; d.bFrapper.querySelector('small').textContent = s1; }
  setCls(d.bFrapper, 'pret-contre', moi.contre > 0);
  setCls(d.bFrapper, 'chaud', emp);
  const jf = d.bFrapper.querySelector('.jauge');
  const vch = moi.charge != null ? moi.charge : moi.visee != null ? moi.visee : 0;
  const hf = `${Math.round(vch * 100)}%`;
  if (ctx.prev.jf !== hf) { ctx.prev.jf = hf; jf.style.height = hf; }
  // Garde
  setCls(d.bGarde, 'appui', moi.garde || ctx.tenus.has('garde'));
  setCls(d.bGarde, 'gris', emp);
  // Esquive
  const esqTxt = moi.aBout ? ['À bout', 'de souffle'] : ['Esquive', ctx.tactile ? 'ou glisser' : 'L / Maj'];
  if (ctx.prev.be !== esqTxt.join()) { ctx.prev.be = esqTxt.join(); d.bEsquive.querySelector('strong').textContent = esqTxt[0]; d.bEsquive.querySelector('small').textContent = esqTxt[1]; }
  setCls(d.bEsquive, 'gris', moi.aBout || emp);
  setCls(d.bEsquive, 'chaud', !moi.aBout && z && z.etat === 'telegraphe' && z.joueur === ctx.jid && !z.esquivee);
  const je = d.bEsquive.querySelector('.jauge');
  const he = `${Math.round(100 * Math.min(1, moi.esquiveCd / REGLAGES.combat.ESQUIVE.COOLDOWN_MS))}%`;
  if (ctx.prev.je !== he) { ctx.prev.je = he; je.style.height = he; }
  // Pousser
  const jp = d.bPousser.querySelector('.jauge');
  const hp = emp ? '0%' : `${Math.round(100 * Math.min(1, moi.poussee / REGLAGES.combat.POUSSEE.RECHARGE_MS))}%`;
  if (ctx.prev.jp !== hp) { ctx.prev.jp = hp; jp.style.height = hp; }
  const sp = emp ? 'martèle' : moi.poussee > 0 ? `${(moi.poussee / 1000).toFixed(1).replace('.', ',')} s` : 'repousse';
  setTxt(ctx, 'bps', d.bPousser.querySelector('small'), sp);
  setCls(d.bPousser, 'gris', !emp && moi.poussee > 0);
  // Arme de tir : Crosse + Recharger
  const tir = !!a.tir;
  if (ctx.prev.tir !== tir) { ctx.prev.tir = tir; d.bCrosse.style.display = tir ? '' : 'none'; d.bRecharger.style.display = tir ? '' : 'none'; }
  if (tir) {
    setTxt(ctx, 'brs', d.bRecharger.querySelector('small'), `${a.balles}/${a.capacite} (+${a.reserve})`);
    setCls(d.bRecharger, 'gris', a.reserve <= 0 || a.balles >= a.capacite);
    setCls(d.bRecharger, 'chaud', a.balles === 0 && a.reserve > 0);
    const jr = d.bRecharger.querySelector('.jauge'); const hr = `${Math.round(100 * (moi.recharge || 0))}%`;
    if (ctx.prev.jr !== hr) { ctx.prev.jr = hr; jr.style.height = hr; }
  }
  // Fuir
  const jfu = d.bFuir.querySelector('.jauge'); const hfu = `${Math.round(100 * (moi.fuite || 0))}%`;
  if (ctx.prev.jfu !== hfu) { ctx.prev.jfu = hfu; jfu.style.height = hfu; }
  // Accès rapide
  const cleR = moi.accesRapide.map(s => (s ? `${s.id}:${s.qty}` : '-')).join('|');
  if (ctx.prev.rap !== cleR) {
    ctx.prev.rap = cleR;
    const bs = [];
    moi.accesRapide.forEach((s, i) => {
      if (!s || !s.id || s.qty <= 0) return;
      const def = ITEMS[s.id] || {};
      const verbe = def.type === 'arme' ? 'prendre' : def.jet ? 'lancer' : def.type === 'soin' ? 'soigner' : '';
      bs.push(bouton('', s.nom, `${i + 1} · ${verbe}${s.qty > 1 ? ' ×' + s.qty : ''}`, String(i + 1), `r${i}`));
    });
    d.rapide.replaceChildren(...bs);
  }
}

function rendreFile(ctx, st) {
  const d = ctx.d;
  const pos = [[28, 1], [72, 1], [16, 0.86], [84, 0.86], [38, 0.74], [62, 0.74]];
  const els = [];
  st.file.slice(0, pos.length).forEach((uid, i) => {
    const z = st.zombies.find(x => x.uid === uid);
    if (!z) return;
    const [x, s] = pos[i];
    const w = el('div', { class: 'cbt-file-mort' }, visuelMort(z.type), el('b', {}, String(i + 1)));
    w.style.left = `${x}%`; w.style.height = `${34 * s}%`; w.style.zIndex = String(10 - i);
    els.push(w);
  });
  if (st.file.length > pos.length) {
    const w = el('div', { class: 'cbt-file-num' }, `+${st.file.length - pos.length}`);
    w.style.left = '50%';
    els.push(w);
  }
  d.file.replaceChildren(...els);
}

function rendreFronts(ctx, st, moi) {
  const autres = st.participants.filter(p => p.id !== ctx.jid && !p.issue);
  const cle = autres.map(p => `${p.id}:${p.actif}:${moi.cible === p.actif}:${p.aTerre}`).join('|');
  if (ctx.prev.fronts === cle) return;
  ctx.prev.fronts = cle;
  ctx.d.fronts.replaceChildren(...autres.map(p => {
    const z = st.zombies.find(x => x.uid === p.actif);
    const aide = z && moi.cible === z.uid;
    const b = el('button', { type: 'button', class: aide ? 'on' : '', onclick: () => ctx.canal.action({ type: 'cible', cible: aide ? null : (z && z.uid) }) },
      aide ? 'Revenir à mon mort' : 'Aider (flanc ×1,25)');
    const rel = p.aTerre ? el('button', { type: 'button', onpointerdown: () => ctx.canal.action({ type: 'relever', cible: p.id, appui: true }),
      onpointerup: () => ctx.canal.action({ type: 'relever', cible: p.id, appui: false }) }, 'Relever (maintenir 3 s)') : null;
    return el('div', { class: 'cbt-front' }, `Front de ${p.nom} : ${z ? z.nom : 'personne'}`, z ? b : null, rel);
  }));
}

// ============================================================================
//  RETOURS : événements → chiffres, sang, secousses, sons, journal
// ============================================================================
function centreMort(ctx) {
  const r = ctx.d.mort.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
}
function flotter(ctx, texte, cls = '', pos = null) {
  const p = pos || centreMort(ctx);
  const n = el('div', { class: `cbt-num ${cls}` }, texte);
  n.style.left = `${p.x + (Math.random() - 0.5) * 80}px`;
  n.style.top = `${p.y + (Math.random() - 0.5) * 40}px`;
  ctx.d.fx.appendChild(n);
  setTimeout(() => n.remove(), 1050);
}
function gicler(ctx, n = 8, fort = false) {
  const p = centreMort(ctx);
  for (let i = 0; i < n; i++) {
    const g = el('div', { class: 'cbt-giclee' });
    const a = Math.random() * Math.PI * 2, r = (fort ? 160 : 90) + Math.random() * 120;
    g.style.left = `${p.x}px`; g.style.top = `${p.y}px`;
    g.style.setProperty('--dx', `${Math.cos(a) * r}px`); g.style.setProperty('--dy', `${Math.sin(a) * r * 0.7 + 40}px`);
    const s = 6 + Math.random() * (fort ? 18 : 10); g.style.width = g.style.height = `${s}px`;
    ctx.d.fx.appendChild(g);
    setTimeout(() => g.remove(), 750);
  }
}
function tacher(ctx) {
  const t = el('div', { class: 'cbt-tache' });
  const s = 120 + Math.random() * 200;
  t.style.width = `${s}px`; t.style.height = `${s * 0.8}px`;
  t.style.left = `${Math.random() * 80 + 5}%`; t.style.top = `${Math.random() * 60 + 10}%`;
  ctx.d.fx.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}
function rejouer(n, cls) { n.classList.remove(cls); void n.offsetWidth; n.classList.add(cls); }
function secouer(ctx, fort = false) { rejouer(ctx.d.monde, fort ? 'secousse-forte' : 'secousse'); }
function eclair(ctx, variante = '') {
  const f = ctx.d.flash;
  f.className = `cbt-flash ${variante}`; void f.offsetWidth; f.classList.add('on');
}
function vib(ms) { if (pref('vibrations') !== false) vibrer(ms); }
function noter(ctx, texte, cls = '') {
  if (!texte) return;
  texte = genrer(texte);
  const now = performance.now();
  const der = ctx.journal[ctx.journal.length - 1];
  if (der && der.texte === texte && now - der.t < 700) return;   // pas de doublon
  ctx.journal.push({ texte, cls, t: now });
  if (ctx.journal.length > 3) ctx.journal.shift();
  ctx.d.journal.replaceChildren(...ctx.journal.map(l => el('div', { class: l.cls }, l.texte)));
}
function raconter(ctx, texte, ms = 2600) {
  if (!texte) return;
  const r = ctx.d.recit;
  r.textContent = genrer(texte);
  r.classList.add('on');
  clearTimeout(ctx.recitT);
  ctx.recitT = setTimeout(() => r.classList.remove('on'), ms);
}
function tuto(ctx, cle, ms = 6000) {
  if (!ctx.spec.tuto || ctx.tutoVu.has(cle) || !TUTO[cle]) return;
  if (ctx.tutoActif && performance.now() < ctx.tutoActif.jusqu && cle !== 'saisie' && cle !== 'rouge' && cle !== 'contre') return;
  ctx.tutoVu.add(cle);
  ctx.d.tuto.innerHTML = genrer(TUTO[cle]);   // texte statique : une fois, pas à 60 Hz
  ctx.d.tuto.classList.add('on');
  ctx.tutoActif = { cle, jusqu: performance.now() + Math.min(ms, 3000) };
  clearTimeout(ctx.tutoT);
  ctx.tutoT = setTimeout(() => ctx.d.tuto.classList.remove('on'), ms);
}
function cacherTuto(ctx, cle) { if (ctx.tutoActif && ctx.tutoActif.cle === cle) { ctx.d.tuto.classList.remove('on'); ctx.tutoActif = null; } }

function mortEl(ctx, uid) { return ctx.prev.zuid === uid ? ctx.d.mort : null; }

function surEvt(ctx, e) {
  const moiEvt = e.joueur === ctx.jid;
  const st = ctx.canal.etat();
  const zNom = (uid) => { const z = st.zombies.find(x => x.uid === uid); return z ? z.nom : 'Le mort'; };
  switch (e.type) {
    case 'telegraphe':
      if (!moiEvt) break;
      ctx.nbTel = (ctx.nbTel || 0) + 1;
      son(e.ruee === 'saisie' ? 'alerte_contact' : 'zombie');
      if (e.ruee === 'saisie') tuto(ctx, 'ambre', 5000); else tuto(ctx, 'rouge', 6000);
      if (ctx.nbTel === 3) tuto(ctx, 'garde', 6000);
      break;
    case 'ruee': {
      const m = mortEl(ctx, e.zombie);
      if (m) rejouer(m, e.issue === 'esquivee' ? 'ruee-vide' : 'ruee');
      break;
    }
    case 'enchaine': if (moiEvt) { noter(ctx, 'Il enchaîne !', 'mal'); flotter(ctx, 'Il enchaîne !', 'info'); } break;
    case 'coup': {
      const m = mortEl(ctx, e.zombie);
      if (m) { rejouer(m, 'recul'); rejouer(m, 'touche'); setTimeout(() => m.classList.remove('touche'), 110); }
      if (m) {
        flotter(ctx, String(e.degats), e.crit ? 'crit' : '');
        gicler(ctx, e.crit || e.charge >= 0.9 ? 14 : 7, e.crit);
        if (e.crit) flotter(ctx, 'Critique', 'info');
        if (e.interrompu) flotter(ctx, 'Ruée brisée', 'info'); else if (e.vacille) flotter(ctx, 'Vacille', 'info');
        if (e.contre) flotter(ctx, 'Contre !', 'info');
        if (e.flanc) flotter(ctx, 'Flanc', 'petit');
      }
      if (moiEvt) {
        son(e.tir ? 'coup' : e.crit ? 'coup_critique' : e.charge >= 0.9 ? 'puissance' : 'coup');
        if (e.crit || e.charge >= 0.9 || e.contre) { secouer(ctx); vib(40); }
        cacherTuto(ctx, 'debut');
        const quoi = e.contre ? 'Contre' : e.charge >= 0.9 ? 'Coup lourd' : e.charge > 0 ? 'Coup chargé' : e.tir ? 'Tir' : 'Coup';
        const suite = e.interrompu ? ' : sa ruée est brisée.' : e.vacille ? ' : il vacille.' : e.crit ? ', critique.' : '.';
        noter(ctx, `${quoi} : ${e.degats}${suite}`, 'bien');
      }
      break;
    }
    case 'rate':
      if (moiEvt) {
        son('rate');
        const t = RAISON_RATE[e.raison] ?? 'Raté.';
        flotter(ctx, e.raison === 'derobe' ? 'Il se dérobe' : 'Raté', 'petit');
        noter(ctx, t);
      }
      break;
    case 'bloque':
      if (!moiEvt) break;
      son('coup'); vib(30);
      if (e.brisee) { secouer(ctx, true); eclair(ctx); flotter(ctx, 'Garde brisée', 'moi', centreEcran()); noter(ctx, `Garde brisée : plus d'endurance. −${e.degats} PV.`, 'mal'); vib([60, 40, 60]); }
      else { flotter(ctx, `Bloqué ${e.bloques}`, 'bleu', centreEcran()); noter(ctx, `Bloqué (${e.bloques})${e.degats ? `, −${e.degats} PV` : ''}, −${e.sta} endurance.`); }
      appliquerDegatsSimples(ctx, e.degats);
      if (e.degats) flotter(ctx, `−${e.degats}`, 'moi', centreEcran(0.7));
      break;
    case 'esquive':
      if (!moiEvt) break;
      son('esquive');
      if (e.vide) { flotter(ctx, 'Pas de côté', 'petit', centreEcran(0.6)); break; }
      if (e.parfaite) { eclair(ctx, 'blanc'); flotter(ctx, 'Esquive parfaite', 'info', centreEcran(0.55)); noter(ctx, 'Esquive parfaite : contre !', 'bien'); son('puissance_charge'); vib(25); }
      else { flotter(ctx, 'Esquivé', 'bleu', centreEcran(0.55)); noter(ctx, 'Esquivé : il frappe dans le vide.'); }
      cacherTuto(ctx, 'rouge'); cacherTuto(ctx, 'ambre');
      break;
    case 'saisie':
      if (!moiEvt) break;
      son('alerte_contact'); secouer(ctx, true); vib([80, 40, 80]);
      noter(ctx, `${zNom(e.zombie)} t'empoigne ! Martèle (${e.requis} coups).`, 'mal');
      tuto(ctx, 'saisie', 5000);
      break;
    case 'degage':
      if (!moiEvt) break;
      son('puissance'); secouer(ctx);
      noter(ctx, '{Dégagé|Dégagée} : il tombe à terre. Frappe !', 'bien');
      flotter(ctx, 'Dégagé !', 'info');
      cacherTuto(ctx, 'saisie');
      break;
    case 'blessure':
      if (!moiEvt) break;
      son('degats'); eclair(ctx); secouer(ctx, e.degats >= 12 || e.blessure.type === 'morsure'); vib(e.blessure.type === 'morsure' ? [120, 60, 160] : 110); tacher(ctx);
      flotter(ctx, `−${e.degats}`, 'moi', centreEcran(0.7));
      noter(ctx, `${NOM_PLAIE[e.blessure.type] || e.blessure.type} ${e.blessure.zone}, −${e.degats} PV.${e.dentsBloquees ? ' Les dents ne passent pas.' : ''}`, 'mal');
      raconter(ctx, e.desc, 3200);
      if (e.blessure.type === 'morsure') { try { son('alerte_infection'); } catch (er) {} }
      appliquerBlessure(ctx, e);
      break;
    case 'explosion':
      if (!moiEvt) break;
      son('explosion'); eclair(ctx, 'vert'); secouer(ctx, true); vib([100, 50, 150]);
      noter(ctx, `Il t'éclate dessus : −${e.degats} PV, −${e.sta} endurance.`, 'mal');
      raconter(ctx, 'Une gerbe de gaz et de fluides noirs. Ça te rentre dans la bouche, dans les plaies.', 3000);
      appliquerDegatsSimples(ctx, e.degats);
      if (e.souille && G && G.player) for (const b of G.player.blessures || []) if (!b.guerie) b.souillee = true;
      break;
    case 'mort_zombie': {
      if (ctx.prev.zuid === e.zombie) {
        const c = el('div', { class: 'cbt-cadavre' }, ...[...ctx.d.mortC.children].map(n => n.cloneNode(true)));
        ctx.d.scene.insertBefore(c, ctx.d.mort);
        setTimeout(() => c.remove(), 950);
        ctx.d.mortC.replaceChildren(); ctx.prev.zuid = null;
        gicler(ctx, 16, true);
      }
      son('coup_critique'); if (e.joueur === ctx.jid) vib(60);
      noter(ctx, `${ZOMBIES[e.typeMort] ? ZOMBIES[e.typeMort].nom : 'Le mort'} ne se relèvera pas.`, 'bien');
      raconter(ctx, e.gore, 2600);
      break;
    }
    case 'fuite_zombie': noter(ctx, `${zNom(e.zombie)} détale.`, 'bien'); break;
    case 'renfort_annonce': son('zombie_loin'); noter(ctx, e.cause === 'cri' ? 'Au loin, on lui répond.' : 'Des pas approchent…', 'mal'); break;
    case 'renfort': if (e.cause !== 'arrivee' || ctx.debutFait) { son('zombie'); noter(ctx, e.uids.length > 1 ? `${e.uids.length} de plus.` : 'Un autre arrive.', 'mal'); } break;
    case 'cri': son('hurlement'); secouer(ctx); noter(ctx, 'Il hurle. D\'autres vont venir.', 'mal'); break;
    case 'cri_coupe': noter(ctx, 'Son cri s\'étrangle.', 'bien'); break;
    case 'poussee':
      if (!moiEvt) break;
      son('coup');
      if (e.resultat === 'immobile') { flotter(ctx, 'Il ne bouge pas', 'info'); noter(ctx, 'Tu pousses : il ne bouge pas.', 'mal'); }
      else if (e.resultat === 'a_terre') { flotter(ctx, 'À terre', 'info'); noter(ctx, 'Il tombe à la renverse. Frappe !', 'bien'); }
      else { flotter(ctx, e.annule ? 'Ruée cassée' : 'Repoussé', 'info'); noter(ctx, e.annule ? 'Poussée : sa ruée est cassée.' : 'Tu le repousses.'); }
      { const m = mortEl(ctx, e.zombie); if (m) rejouer(m, 'recul'); }
      break;
    case 'tir': son('tir'); if (moiEvt) { secouer(ctx); vib(50); eclair(ctx, 'blanc'); } break;
    case 'tir_vide': if (moiEvt) { son('clic'); noter(ctx, 'Clic. Chargeur vide : R pour recharger.'); } break;
    case 'recharge': if (moiEvt && e.fin) { son('clic'); noter(ctx, `Rechargé : ${e.balles} en chargeur.`); } break;
    case 'change_arme': if (moiEvt) { son('clic'); noter(ctx, `En main : ${e.nom}.`); } break;
    case 'arme_cassee': if (moiEvt) { son('porte_casse'); flotter(ctx, 'Arme brisée', 'moi', centreEcran(0.6)); noter(ctx, `${e.nom} se brise. Mains nues.`, 'mal'); } break;
    case 'jet': if (moiEvt) { son('esquive'); noter(ctx, `Tu lances : ${e.nom}.`); } break;
    case 'feu': son('explosion'); noter(ctx, 'Les flammes le prennent.', 'bien'); break;
    case 'soin': if (moiEvt) { son('soin'); appliquerSoin(ctx, e); } break;
    case 'refus':
      if (!moiEvt) break;
      if (e.raison === 'a_bout') { flotter(ctx, 'À bout de souffle', 'moi', centreEcran(0.6)); noter(ctx, 'À bout de souffle : impossible d\'esquiver.', 'mal'); }
      else if (e.raison === 'plus_de_munitions') noter(ctx, 'Plus de munitions.', 'mal');
      else if (e.raison === 'pas_en_combat') noter(ctx, 'Pas le temps pour ça.');
      else if (e.raison === 'occupe') noter(ctx, 'Pas le temps : finis ton geste.');
      break;
    case 'fuite':
      if (!moiEvt) { noter(ctx, e.reussie ? `${nomJoueur(st, e.joueur)} décroche.` : ''); break; }
      if (e.reussie) noter(ctx, 'Tu décroches.', 'bien');
      else { noter(ctx, `Il te rattrape ! (${e.chance} %)`, 'mal'); secouer(ctx); son('alerte'); }
      break;
    case 'a_terre': noter(ctx, moiEvt ? 'Tu t\'effondres. Ton partenaire doit te relever.' : `${nomJoueur(st, e.joueur)} est à terre !`, 'mal'); break;
    case 'releve': noter(ctx, moiEvt ? 'On te relève.' : `${nomJoueur(st, e.joueur)} est debout.`, 'bien'); if (moiEvt && G && G.player) G.player.pv = Math.max(G.player.pv, REGLAGES.coop.PV_RELEVE); break;
    case 'mort_joueur': if (moiEvt) { son('mort'); eclair(ctx); secouer(ctx, true); vib([200, 100, 300]); } break;
    case 'rejoint': if (!moiEvt) noter(ctx, `${e.nom} te rejoint.`, 'bien'); break;
    case 'debut': ctx.debutFait = true; break;
  }
}
function centreEcran(fy = 0.6) { return { x: window.innerWidth / 2, y: window.innerHeight * fy }; }

// ---------------------------------------------------------------- application au joueur local
function appliquerDegatsSimples(ctx, n) {
  if (!n || !G || !G.player) return;
  G.player.pv = Math.max(0, (G.player.pv ?? 100) - n);
  busEmit('survie', { pv: G.player.pv, combat: true });
}
function appliquerBlessure(ctx, e) {
  const p = G && G.player;
  if (!p) return;
  const b = { ...e.blessure, zombie: e.typeMort, mal: e.mal };
  const S = ctx.survie;
  // survival.infligerBlessure(p, b, { degats, mal }) : pose la plaie, ajoute le mal, retire les PV, émet 'blessure'.
  if (S && typeof S.infligerBlessure === 'function') {
    try { if (S.infligerBlessure(p, b, { degats: e.degats, mal: e.mal })) return; } catch (err) { console.warn('[combat] infligerBlessure', err); }
  }
  // Repli (survival.js absent ou en erreur) : le minimum, une seule fois.
  (p.blessures || (p.blessures = [])).push({ ...b, degats: e.degats, infecte: false, bandee: false, suturee: false, age: 0 });
  p.pv = Math.max(0, (p.pv ?? 100) - e.degats);
  p.mal = Math.min(100, (p.mal || 0) + (e.mal || 0));
  busEmit('blessure', { blessure: b, degats: e.degats, mal: e.mal });
}
function appliquerSoin(ctx, e) {
  const p = G && G.player;
  if (!p) return;
  const idx = (p.blessures || []).findIndex(b => b.saigne && !b.bandee);
  const S = ctx.survie;
  if (S && typeof S.soigner === 'function' && idx >= 0) { try { S.soigner(p, idx, e.objet); noter(ctx, 'Plaie bandée.', 'bien'); return; } catch (err) { console.warn(err); } }
  const def = ITEMS[e.objet] || {};
  if (def.soin === 'bandage' && idx >= 0) { const b = p.blessures[idx]; b.bandee = true; b.saigne = false; noter(ctx, 'Plaie bandée.', 'bien'); }
  else noter(ctx, `${def.nom || e.objet} : fait.`);
}

// ============================================================================
//  FIN
// ============================================================================
function surFin(ctx, r) {
  if (ctx.finRecue) return;
  ctx.finRecue = true;
  const res = { ...r };
  // Application au personnage local (usure, munitions, accès rapide, endurance, XP)
  if (G && G.player && !ctx.canalDistant) {
    try { appliquerResultat(G.player, res); busEmit('inventaire', { combat: true, usure: res.usure }); } catch (e) { console.warn('[combat] appliquerResultat', e); }
    for (const [k, n] of Object.entries(res.xp || {})) {
      try {
        if (ctx.player && typeof ctx.player.gagnerXp === 'function') ctx.player.gagnerXp(k, n);
        else { G.player.skillXp = G.player.skillXp || {}; G.player.skillXp[k] = (G.player.skillXp[k] || 0) + n; }
      } catch (e) { console.warn(e); }
    }
    if (res.issue === 'mort') G.player.pv = 0;
  }
  try { audio && audio.stopCombatMusic && audio.stopCombatMusic(); audio && audio.setHeartbeat && audio.setHeartbeat(false); } catch (e) {}
  setTimeout(() => afficherFin(ctx, res), res.issue === 'victoire' ? 700 : 900);
}
function afficherFin(ctx, res) {
  if (ctx.ferme) return;
  ctx.finAffichee = true;
  ctx.d.racine.classList.add('finie');
  const T = { victoire: ['Tu t\'en sors', ''], fuite: ['Tu décroches', ''], mort: ['Tu tombes', 'mort'] }[res.issue] || ['Fin du combat', ''];
  const lignes = [];
  if (res.tues && res.tues.length) lignes.push(`${res.tuesParMoi ?? res.tues.length} mort${(res.tuesParMoi ?? res.tues.length) > 1 ? 's' : ''} de plus à terre`);
  for (const b of res.blessures || []) lignes.push(`${NOM_PLAIE[b.type] || b.type} ${b.zone}${b.saigne ? ', saigne' : ''}`);
  if (res.mal > 0) lignes.push(`Le mal : +${res.mal}`);
  if (Object.keys(res.usure || {}).length) lignes.push(`Arme usée : −${Object.values(res.usure).reduce((a, b) => a + b, 0)}`);
  lignes.push(`${(res.dureeMs / 1000).toFixed(0)} s`);
  const btn = el('button', { type: 'button' }, 'Continuer');
  const carte = el('div', { class: 'cbt-fin-carte' }, el('h2', { class: T[1] }, genrer(T[0])),
    res.issue === 'mort' ? el('p', {}, 'Le noir. Puis plus rien.') : res.blessures && res.blessures.some(b => b.type === 'morsure') ? el('p', {}, genrer('Tu regardes la morsure. Tu sais ce que ça veut dire. Tu sais aussi que ton sang, lui, a déjà dit non une fois.')) : null,
    el('ul', {}, ...lignes.map(l => el('li', {}, l))), btn);
  const fin = el('div', { class: 'cbt-fin' }, carte);
  ctx.d.hud.appendChild(fin);
  requestAnimationFrame(() => fin.classList.add('on'));
  let fait = false;
  ctx.continuer = () => {
    if (fait) return; fait = true;
    const sortie = { ...res, issue: res.issue, tues: res.tues || [], fuis: res.fuis || [], xp: res.xp || {}, bruit: res.bruit || 0 };
    delete sortie._applique;
    nettoyer(ctx);
    busEmit('combat:fin', { resultat: sortie });
    ctx.resoudre(sortie);
  };
  btn.addEventListener('click', () => ctx.continuer());
  ctx.autoFin = setTimeout(() => ctx.continuer(), res.issue === 'mort' ? 9000 : 7000);
  setTimeout(() => { try { btn.focus(); } catch (e) {} }, 50);
}

function nettoyer(ctx) {
  if (ctx.ferme) return;
  ctx.ferme = true;
  cancelAnimationFrame(ctx.raf);
  clearTimeout(ctx.autoFin); clearTimeout(ctx.recitT); clearTimeout(ctx.tutoT);
  try { ctx.canal && ctx.canal.arreter && ctx.canal.arreter(); } catch (e) {}
  for (const off of ctx.offs || []) try { off(); } catch (e) {}
  if (ctx.kd) window.removeEventListener('keydown', ctx.kd, true);
  if (ctx.ku) window.removeEventListener('keyup', ctx.ku, true);
  if (ctx.blur) window.removeEventListener('blur', ctx.blur);
  if (ctx.surVisibilite) document.removeEventListener('visibilitychange', ctx.surVisibilite);
  try { audio && audio.stopCombatMusic && audio.stopCombatMusic(); audio && audio.setHeartbeat && audio.setHeartbeat(false); } catch (e) {}
  if (ctx.d && ctx.d.racine) ctx.d.racine.remove();
  if (courant === ctx) courant = null;
}

// Pour le flow : fermer de force (ex. déconnexion) — renvoie une fuite.
export function fermer() {
  const c = courant;
  if (!c) return;
  nettoyer(c);
  c.resoudre({ issue: 'fuite', tues: [], fuis: [], xp: {}, bruit: 0, interrompu: true });
}
// Contrat « temps » : le combat est un overlay, entrer/sortir délèguent.
export const entrer = (params) => ouvrir({ spec: params || {} });
export const sortir = fermer;
