// ============ Temps 2 — l'écran de voyage ============
// entrer({ de, vers, allure, groupe, minutesDepart?, contourner? }) / sortir() / pause() / reprise().
// La carte zoome sur l'itinéraire, un pion avance au rythme du temps de jeu, le bandeau dit
// « il te reste 640 m — ~8 min ». Les rencontres sont tirées au DÉPART (graine) ; à chacune, le pion
// s'arrête et une carte-événement s'ouvre (scène / combat / butin / ambiance). Arrivée → flow.explorer(vers).
//
// Effets de voyage (GAMEPLAY §3.4) : le résultat de flow.scene() peut porter { detour, demiTour, butin, combat }
// (à plat ou dans .effets) ; ils peuvent aussi arriver par le bus pendant la scène :
// 'voyage:detour' ({ m }), 'voyage:demiTour', 'voyage:butin' ({ table, n }). Exports detour(m) / demiTour() idem.
import * as flow from '../game/flow.js';
import { G, genrer, setFlag } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, fmtDistance, fmtDuree, texteHtml } from '../core/util.js';
import { seedRng } from '../core/rng.js';
import { LIEUX, objet } from '../game/donnees.js';
import { REGLAGES } from '../data/reglages.js';
import { itineraire, pointA, sousTrace, inverser, allonger, projeter, echelleDe } from './geo.js';
import { monterFeuille, creerMarqueur, SVGNS } from './art_carte.js';
import { contexteVoyage, vitesse, evaluerRisque, tirerRencontres } from './rencontres_voyage.js';
import { lieuCourant } from './carte.js';

let V = null;

const TITRES = { combat: 'Mauvaise rencontre', butin: 'Au bord de la route', ambiance: 'En chemin', choix: 'Sur ta route', pnj: 'Quelqu’un' };

// ---------------------------------------------------------------- entrée / sortie
export async function entrer({ de, vers, allure = 'normale', groupe = null, minutesDepart, contourner = false } = {}) {
  sortir();
  de = de || lieuCourant();
  const iti0 = itineraire(de, vers);
  const ctx = contexteVoyage({ allure, groupe, minutes: minutesDepart });
  let iti = iti0;
  let rencontres = tirerRencontres(iti, ctx, { de, vers, minutes: minutesDepart ?? ctx.minutes });
  if (contourner) {
    const h = rencontres.find(t => t.hostile && !t.scripte);
    if (h) { rencontres = rencontres.filter(t => t !== h); iti = allonger(iti, REGLAGES.voyage.DETOUR_REPERE_M[iti.echelle] || 250, h.d); decalerApres(rencontres, h.d, iti.metres - iti0.metres, iti0.metres); }
  }
  const surp = await surpoidsJoueur();
  const racine = el('div', { class: 'carte-ecran voyage-ecran' });
  const vueHote = el('div', { class: 'carte-vue' });
  racine.append(vueHote);
  flow.stage().appendChild(racine);
  V = { de, vers, allure, groupe, ctx, iti, rencontres, d: 0, total: 0, racine, vueHote, offs: [], pauses: new Set(), accel: false, fini: false, surp, raf: 0, dernierTexte: '' };
  V.v = vitesse(ctx, { surpoids: surp }).mParMin;
  V.risque = evaluerRisque(iti, ctx, { de, vers });
  V.F = monterFeuille(vueHote, iti.echelle, { zones: true, nuit: ctx.nuit });
  construireUI();
  dessinerRoute();
  cadrer(false);
  if (G) G.player.position = { mode: 'voyage', voyage: { de, vers, allure, d: 0, metres: iti.metres } };
  clock.setVitesse(vitesseBase());
  emit('voyage:debut', { de, vers, allure, metres: iti.metres });
  V.offs.push(on('mort', () => { if (V) { V.fini = true; V.pauses.add('mort'); } }));
  V.offs.push(on('voyage:detour', (x) => detour(x && x.m)));
  V.offs.push(on('voyage:demiTour', () => demiTour()));
  V.offs.push(on('voyage:butin', (x) => { if (x) V.butinsEnAttente = (V.butinsEnAttente || []).concat([x]); }));
  V.offs.push(on('minute', () => { if (V) V.horloge.textContent = clock.texteHeure(); }));
  const onKey = (e) => { if (e.key === ' ' && !V.pauses.size) basculerAccel(); };
  window.addEventListener('keydown', onKey); V.offs.push(() => window.removeEventListener('keydown', onKey));
  V.t = performance.now();
  V.raf = requestAnimationFrame(boucle);
}
export function sortir() {
  if (!V) return;
  cancelAnimationFrame(V.raf);
  for (const f of V.offs) try { f(); } catch (e) {}
  if (V.accel) clock.setVitesse(vitesseBase());
  if (V.carteEvt) V.carteEvt.remove();
  V.F.detruire(); V.racine.remove();
  V = null;
}
export function pause() { if (V) V.pauses.add('flow'); }
export function reprise() { if (V) { V.pauses.delete('flow'); V.t = performance.now(); } }

const vitesseBase = () => (REGLAGES.temps.VITESSE_SOLO && REGLAGES.temps.VITESSE_SOLO.voyage) ?? 1;
async function surpoidsJoueur() {
  try { const m = await import('../game/inventory.js'); return m.surpoids ? (m.surpoids(G.player).f || 0) : 0; } catch (e) { return 0; }
}
function decalerApres(ts, d0, m, ancien) {
  const k = (ancien - d0 + m) / Math.max(1, ancien - d0);
  for (const t of ts) if (t.d > d0) t.d = d0 + (t.d - d0) * k;
}

// ---------------------------------------------------------------- interface
function construireUI() {
  const L = LIEUX[V.vers];
  V.titre = el('div', { class: 'v-vers' });
  V.reste = el('div', { class: 'v-reste' });
  V.horloge = el('span', { class: 'carte-horloge' }, clock.texteHeure());
  V.jauge = el('div', { class: 'v-risque' });
  V.barre = el('i');
  const bandeau = el('div', { class: 'v-bandeau' },
    el('div', { class: 'v-textes' }, V.titre, V.reste),
    el('div', { class: 'v-droite' }, V.horloge, V.jauge),
    el('div', { class: 'v-progres' }, V.barre));
  V.btnAccel = el('button', { class: 'carte-btn', onclick: basculerAccel, 'aria-pressed': 'false' }, 'Accélérer ×' + (REGLAGES.temps.VOYAGE_ACCELERE || 4));
  if (G && G.mode !== 'solo') V.btnAccel.style.display = 'none';
  V.btnDemi = el('button', { class: 'carte-btn', onclick: () => demiTour() }, 'Faire demi-tour');
  const actions = el('div', { class: 'v-actions' }, V.btnDemi, V.btnAccel);
  V.racine.append(bandeau, actions);
  majTitre(); majJauge(); majBandeau(true);
  // pion + marqueurs de départ / arrivée
  const g = V.F.couches.marques; g.innerHTML = '';
  for (const id of [V.de, V.vers]) {
    const l = LIEUX[id]; if (!l) continue;
    const p = projeter(l.lat, l.lon, V.iti.echelle);
    g.appendChild(creerMarqueur(l, p, { courant: false, visite: false }));
  }
  V.pion = document.createElementNS(SVGNS, 'g'); V.pion.setAttribute('class', 'pion');
  V.pion.innerHTML = '<g class="m-e"><circle class="p-halo" r="16"/><g class="p-dir"><path d="M9 0L-4 -6L-1 0L-4 6Z"/></g><circle class="p-corps" r="6.5"/></g>';
  V.F.couches.pion.appendChild(V.pion);
  void L;
}
function majTitre() { const L = LIEUX[V.vers]; V.titre.textContent = (V.iti.demiTour ? 'Retour vers ' : 'Vers ') + (L ? (L.court || L.nom) : V.vers); }
function majJauge() {
  let s = ''; for (let i = 1; i <= 5; i++) s += `<i class="${i <= V.risque.cran ? 'on r' + V.risque.cran : ''}"></i>`;
  V.jauge.innerHTML = `<span class="f-jauge">${s}</span><small>${V.risque.raisons[0] || V.risque.libelle}</small>`;
  V.jauge.title = 'Risque : ' + V.risque.libelle + (V.risque.raisons.length ? ' — ' + V.risque.raisons.join(', ') : '');
}
function majBandeau(force) {
  const reste = Math.max(0, V.iti.metres - V.d);
  const txt = `il te reste ${fmtDistance(reste)} — ~${fmtDuree(Math.max(1, reste / V.v))}`;
  if (force || txt !== V.dernierTexte) { V.reste.textContent = txt; V.dernierTexte = txt; }
  V.barre.style.width = (100 * V.d / Math.max(1, V.iti.metres)).toFixed(1) + '%';
}
function basculerAccel() {
  if (!V || (G && G.mode !== 'solo')) return;
  V.accel = !V.accel;
  clock.setVitesse(vitesseBase() * (V.accel ? (REGLAGES.temps.VOYAGE_ACCELERE || 4) : 1));
  V.btnAccel.classList.toggle('actif', V.accel); V.btnAccel.setAttribute('aria-pressed', String(V.accel));
}
function dessinerRoute() {
  const pts = V.iti.points; let d = '';
  pts.forEach((p, i) => { d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  V.F.couches.route.innerHTML = `<path class="t-fond" d="${d}"/><path class="t-pointille" d="${d}"/><path class="t-fait" d=""/>`;
  V.fait = V.F.couches.route.querySelector('.t-fait');
}
function cadrer(anime = true) {
  const xs = V.iti.points.map(p => p.x), ys = V.iti.points.map(p => p.y);
  if (!xs.length) return;
  V.F.vue.allerA([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], { marge: 0.12, duree: anime ? 700 : 0, haut: 80, bas: 60 });
}
function majPion() {
  const p = pointA(V.iti, V.d);
  V.pion.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  V.pion.querySelector('.p-dir').setAttribute('transform', `rotate(${p.angle.toFixed(0)})`);
  const s = sousTrace(V.iti, 0, V.d); let d = '';
  s.forEach((q, i) => { d += (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1); });
  V.fait.setAttribute('d', d);
}

// ---------------------------------------------------------------- boucle
function boucle(t) {
  if (!V) return;
  const dt = Math.min(250, t - V.t); V.t = t;
  const solo = !G || G.mode === 'solo';
  const bloque = V.pauses.size || V.fini || (solo && clock.enPause());
  if (!bloque) {
    const minutes = dt / (REGLAGES.temps.MS_PAR_MINUTE || 1000) * (solo ? clock.getVitesse() : 1);
    let nd = V.d + V.v * minutes;
    const proch = V.rencontres[0];
    if (proch && nd >= proch.d) { nd = proch.d; V.rencontres.shift(); V.d = nd; majPion(); majBandeau(); lancerRencontre(proch); }
    else if (nd >= V.iti.metres) { V.d = V.iti.metres; majPion(); majBandeau(); arriver(); return; }
    else V.d = nd;
    majPion(); majBandeau();
    if (G && G.player.position.voyage) G.player.position.voyage.d = V.d;
  }
  V.raf = requestAnimationFrame(boucle);
}

// ---------------------------------------------------------------- arrivée / demi-tour / détour
function arriver() {
  if (!V || V.fini) return;
  V.fini = true;
  const vers = V.vers, de = V.de, m = V.total + V.d;
  if (G) {
    G.world.lieux[vers] = { ...(G.world.lieux[vers] || {}), decouvert: true, visite: true };
    G.player.stats.distance = (G.player.stats.distance || 0) + Math.round(m);
  }
  emit('voyage:fin', { de, vers, metres: m });
  flow.explorer(vers);
}
export function demiTour() {
  if (!V || V.fini || V.iti.demiTour) return;
  V.total += V.d;
  const retour = inverser(V.iti, V.d);
  const vers = V.de;
  V.iti = retour; V.de = V.vers; V.vers = vers; V.d = 0;
  V.rencontres = tirerRencontres(retour, V.ctx, { de: V.de, vers, minutes: G ? G.world.minutes : 0, demiTour: true });
  V.risque = evaluerRisque(retour, V.ctx, { demiTour: true });
  V.btnDemi.disabled = true;
  majTitre(); majJauge(); dessinerRoute(); majPion(); majBandeau(true);
  if (G && G.player.position.voyage) Object.assign(G.player.position.voyage, { de: V.de, vers, d: 0, metres: retour.metres });
  flow.toast('Tu rebrousses chemin.');
}
export function detour(m) {
  m = Number(m) || 0; if (!V || m <= 0) return;
  const avant = V.iti.metres;
  V.iti = allonger(V.iti, m, V.d);
  decalerApres(V.rencontres, V.d, m, avant);
  majBandeau(true);
  flow.toast(`Détour : +${fmtDistance(m)}`);
}

// ---------------------------------------------------------------- rencontres
async function lancerRencontre(r) {
  const def = r.def; V.pauses.add('rencontre');
  try {
    if (def.unique || def.id.startsWith('rh_')) setFlag('rencontre_vue:' + def.id);
    if (r.cleDecl && G) { G.world.declencheurs = G.world.declencheurs || {}; G.world.declencheurs[r.cleDecl] = true; }
    if (def.type === 'choix' || def.type === 'pnj') {
      let res = null;
      try { res = await flow.scene(def.scene); } catch (e) { console.warn('[voyage] scène', def.scene, e); }
      if (!V) return;
      await appliquerResultat(res, def);
    } else if (def.type === 'combat') {
      await carteEvenement(def, [{ label: 'Te défendre', principal: true }]);
      if (!V) return;
      await combat(def.combat, def);
    } else if (def.type === 'butin') {
      await fenetreButin(def, r);
    } else {
      await carteEvenement(def, [], { auto: 5200 });
      if (def.effets) await effets(def.effets);
    }
  } finally {
    if (V) {
      for (const b of V.butinsEnAttente || []) await fenetreButin({ texte: 'Tu fouilles rapidement.', butin: b }, r);
      if (V) { V.butinsEnAttente = []; V.pauses.delete('rencontre'); V.t = performance.now(); }
    }
  }
}
async function appliquerResultat(res, def) {
  if (!res) return;
  const x = { ...(res.effets || {}), ...res };
  if (x.fin === '#mort') { V.fini = true; return; }
  if (x.detour) detour(x.detour);
  if (x.butin) V.butinsEnAttente = (V.butinsEnAttente || []).concat([x.butin]);
  if (x.fin === '#combat' || x.combat) await combat(x.combat || def.combat || { zombies: ['errant'] }, def);
  if (V && x.demiTour) demiTour();
}
async function combat(spec, def) {
  if (!spec) return;
  const s = { zombies: spec.zombies || ['errant'], lieuId: null, decor: def.illu || null, surprise: spec.surprise === true ? 'surpris' : (spec.surprise || 'normal') };
  let r = null;
  try { r = await flow.combattre(s); } catch (e) { console.warn('[voyage] combat', e); }
  if (!V) return;
  if (r && r.issue === 'mort') V.fini = true;
  else if (r && r.issue === 'fuite') flow.toast('Tu t’enfuis. Ils suivent, loin derrière.');
}
async function effets(e) {
  const reste = { ...e };
  if (reste.detour) { detour(reste.detour); delete reste.detour; }
  if (reste.demiTour) { delete reste.demiTour; demiTour(); }
  if (Object.keys(reste).length) { try { await flow.appliquerEffets(reste); } catch (err) { console.warn('[voyage] effets', err); } }
}

// Carte-événement (texte + boutons). auto : ms avant fermeture automatique (ambiance).
function carteEvenement(def, boutons = [], { auto = 0, contenu = null } = {}) {
  return new Promise((ok) => {
    if (!V) return ok(null);
    const fermer = (v) => { if (!carte.isConnected) return; carte.classList.add('sort'); setTimeout(() => carte.remove(), 260); clearTimeout(tm); ok(v); };
    const carte = el('div', { class: 'v-evt t-' + def.type, role: 'dialog', 'aria-live': 'polite' },
      el('div', { class: 'v-evt-papier' },
        el('div', { class: 'v-evt-titre' }, TITRES[def.type] || 'En chemin'),
        el('div', { class: 'v-evt-texte', html: texteHtml(genrer(def.texte || '…')) }),
        contenu,
        el('div', { class: 'v-evt-boutons' }, ...(boutons.length ? boutons : [{ label: 'Continuer' }]).map((b, i) =>
          el('button', { class: 'carte-btn' + (b.principal || boutons.length <= 1 ? ' principal' : ''), onclick: () => fermer(b.valeur ?? i) }, b.label)))));
    if (auto) carte.addEventListener('click', () => fermer(0));
    const tm = auto ? setTimeout(() => fermer(0), auto) : 0;
    V.carteEvt = carte; V.racine.appendChild(carte);
    const b = carte.querySelector('button'); if (b) b.focus({ preventScroll: true });
  });
}
async function fenetreButin(def, r) {
  const b = def.butin || { table: 'voyage.cadavre', n: 1 };
  let items = [];
  try {
    const m = await import('../data/butin.js');
    const rng = seedRng((G ? G.world.seed : 0) + ':voyage-butin:' + (def.id || 'x') + ':' + Math.round(r.d) + ':' + (G ? G.world.minutes : 0));
    items = m.tirerButinTable(b.table, b.n || 1, rng, { jour: V.ctx.jour, coop: V.ctx.coop });
  } catch (e) { console.warn('[voyage] butin', e); }
  if (!V) return;
  const liste = el('ul', { class: 'v-butin' }, ...(items.length ? items.map(it => el('li', {}, `${(objet(it.id) || {}).nom || it.id}${it.qty > 1 ? ' ×' + it.qty : ''}`)) : [el('li', { class: 'vide' }, 'Rien qui vaille la peine.')]));
  const choix = await carteEvenement({ ...def, type: 'butin' }, items.length ? [{ label: 'Tout prendre', principal: true, valeur: 'prendre' }, { label: 'Laisser', valeur: 'laisser' }] : [{ label: 'Continuer' }], { contenu: liste });
  if (choix === 'prendre') await prendre(items);
  if (def.effets) await effets(def.effets);
}
async function prendre(items) {
  let addItem = null;
  try { const m = await import('../game/inventory.js'); addItem = m.addItem || m.ajouterObjet || null; } catch (e) {}
  for (const it of items) {
    if (addItem) { try { addItem(it.id, it.qty); continue; } catch (e) { console.warn('[voyage] addItem', e); } }
    if (!G) continue;
    const ex = G.player.inventaire.find(x => x.id === it.id);
    if (ex) ex.qty += it.qty; else G.player.inventaire.push({ id: it.id, qty: it.qty });
  }
  if (!addItem) emit('inventaire', {});
}
export { echelleDe };
