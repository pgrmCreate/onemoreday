// ============ Temps 2 — la carte (sélection de destination) ============
// entrer({ echelle, depuis }) / sortir(). Carte illustrée plein écran, pan/zoom, lieux découverts,
// fiche d'un lieu (distance réelle, durée, risque 5 crans, allure) → flow.voyager(...).
// Aucun déplacement libre ici (REFONTE §6).
import * as flow from '../game/flow.js';
import { G } from '../core/state.js';
import { on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, fmtDistance, fmtDuree } from '../core/util.js';
import { LIEUX, SALON_SUR_REGION } from '../game/donnees.js';
import { QUETES } from '../data/histoire/quetes.js';
import { CARTE_SALON } from '../data/carte_salon.js';
import { REGLAGES } from '../data/reglages.js';
import { itineraire, projeter, lieuxAffiches, estDecouvert, echelleDe, zonesVues } from './geo.js';
import { monterFeuille, creerMarqueur, desencombrer, SVGNS, pictoPath } from './art_carte.js';
import { contexteVoyage, vitesse, evaluerRisque, tirerRencontres, estHostile } from './rencontres_voyage.js';

let E = null;                 // état de l'écran courant
let allure = 'normale';       // mémorisée d'une ouverture à l'autre

const TYPES = {
  hotel: 'Hôtel', place: 'Place', monument: 'Monument', mairie: 'Mairie', chateau: 'Château', musee: 'Musée', eglise: 'Église',
  superette: 'Supérette', supermarche: 'Supermarché', hypermarche: 'Hypermarché', pharmacie: 'Pharmacie', mediatheque: 'Médiathèque',
  cinema: 'Cinéma', usine: 'Usine', cimetiere: 'Cimetière', gare: 'Gare', commissariat: 'Commissariat', gendarmerie: 'Gendarmerie',
  caserne: 'Caserne', hopital: 'Hôpital', lycee: 'Lycée', bricolage: 'Bricolage', cite: 'Cité', village: 'Village', ruines: 'Ruines',
  grotte: 'Grottes', zoo: 'Parc animalier', base: 'Base militaire', triage: 'Gare de triage', aerodrome: 'Aérodrome', route: 'Route', nature: 'Nature',
};

// ---------------------------------------------------------------- état des lieux
export function lieuCourant() {
  const p = G && G.player.position;
  if (p && p.mode === 'lieu' && p.lieu) return p.lieu;
  if (p && p.mode === 'voyage' && p.voyage) return p.voyage.de;
  return 'hotel_poste';
}
export function objectifCourant() {
  if (!G) return null;
  for (const [id, q] of Object.entries(QUETES || {})) {
    const s = G.world.quetes[id];
    if (!q.principale || !s || s.faite) continue;
    const et = q.etapes && q.etapes[s.etape];
    if (et && et.lieu) return et.lieu;
  }
  return null;
}
export function etatLieu(id) {
  const w = (G && G.world.lieux[id]) || {};
  const l = LIEUX[id] || {};
  if (l.refuge || w.refuge) return { code: 'refuge', texte: 'refuge' };
  if (w.fouille || (w.etat && w.etat.fouille)) return { code: 'fouille', texte: 'fouillé' };
  if (w.visite) return { code: 'visite', texte: 'visité' };
  return { code: 'inconnu', texte: 'jamais visité' };
}
function aJumelles() {
  if (!G) return false;
  const P = G.player;
  return (P.inventaire || []).some(i => /jumelle/.test(i.id)) || Object.values(P.equip || {}).some(v => /jumelle/.test(String(v || '')));
}

// ---------------------------------------------------------------- entrée / sortie
export async function entrer({ echelle, depuis } = {}) {
  sortir();
  depuis = depuis || lieuCourant();
  echelle = echelle || echelleDe(depuis);
  const racine = el('div', { class: 'carte-ecran' });
  const vueHote = el('div', { class: 'carte-vue' });
  racine.append(vueHote);
  flow.stage().appendChild(racine);
  E = { racine, vueHote, depuis, echelle, offs: [], sel: null, F: null, marqueurs: [], raf: 0 };
  construireBarre();
  montrer(echelle, { premier: true });
  const onKey = (e) => {
    if (e.key === 'Escape') { if (E.sel) fermerFiche(); }
    else if (e.key === '+' || e.key === '=') E.F.vue.zoomer(0.7);
    else if (e.key === '-') E.F.vue.zoomer(1.4);
  };
  window.addEventListener('keydown', onKey);
  E.offs.push(() => window.removeEventListener('keydown', onKey));
  E.offs.push(on('minute', () => majHorloge()));
}
export function sortir() {
  if (!E) return;
  for (const f of E.offs) try { f(); } catch (e) {}
  if (E.raf) cancelAnimationFrame(E.raf);
  if (E.F) E.F.detruire();
  E.racine.remove();
  E = null;
}

// ---------------------------------------------------------------- barre du haut
function construireBarre() {
  const onglet = (ech, txt) => el('button', { class: 'carte-onglet', 'data-ech': ech, onclick: () => montrer(ech) }, txt);
  E.horloge = el('span', { class: 'carte-horloge' });
  E.ici = el('span', { class: 'carte-ici' });
  const l = LIEUX[E.depuis];
  const barre = el('div', { class: 'carte-barre' },
    el('div', { class: 'carte-onglets' }, onglet('salon', 'Salon'), onglet('region', 'Pays salonais')),
    el('div', { class: 'carte-infos' }, E.horloge, E.ici),
    el('button', { class: 'carte-btn carte-rester', onclick: () => flow.explorer(E.depuis) }, 'Rester ici'),
  );
  E.ici.textContent = l ? 'Tu es à : ' + (l.court || l.nom) : '';
  const zoom = el('div', { class: 'carte-zoom' },
    el('button', { class: 'carte-btn rond', 'aria-label': 'Zoomer', onclick: () => E.F.vue.zoomer(0.6) }, '+'),
    el('button', { class: 'carte-btn rond', 'aria-label': 'Dézoomer', onclick: () => E.F.vue.zoomer(1.6) }, '−'),
    el('button', { class: 'carte-btn rond', 'aria-label': 'Recentrer sur ta position', onclick: () => recentrer(true) }, el('span', { class: 'ico-cible' })),
  );
  E.racine.append(barre, zoom);
  majHorloge();
}
function majHorloge() { if (E && E.horloge) E.horloge.textContent = clock.texteHeure(); }

// ---------------------------------------------------------------- une feuille
function montrer(echelle, { premier = false, centrerSur = null } = {}) {
  if (!premier && echelle === E.echelle && E.F) return;
  fermerFiche();
  if (E.F) E.F.detruire();
  E.echelle = echelle;
  for (const b of E.racine.querySelectorAll('.carte-onglet')) b.classList.toggle('actif', b.dataset.ech === echelle);
  E.F = monterFeuille(E.vueHote, echelle, { onTap, onChange: planifierDesencombrement, estDecouvert, nuit: clock.estNuit(), brouillard: zonesVues(echelle) });
  poserMarqueurs();
  if (centrerSur) E.F.vue.centrer(centrerSur.x, centrerSur.y, echelle === 'region' ? 16000 : 2200);
  else recentrer(false);
}
function recentrer(anime) {
  const ech = E.echelle; const l = LIEUX[E.depuis];
  let p;
  if (l && l.echelle === ech) p = projeter(l.lat, l.lon, ech);
  else if (ech === 'region') p = projeter(SALON_SUR_REGION.lat, SALON_SUR_REGION.lon, 'region');
  else p = projeter(SALON_SUR_REGION.lat, SALON_SUR_REGION.lon, 'salon');
  const w = ech === 'region' ? 22000 : 2000;
  if (anime) E.F.vue.allerA([p.x - w / 2, p.y - w / 4, p.x + w / 2, p.y + w / 4], { marge: 0 });
  else E.F.vue.centrer(p.x, p.y, w);
}

function poserMarqueurs() {
  const g = E.F.couches.marques; g.innerHTML = '';
  E.marqueurs = [];
  const ech = E.echelle, obj = objectifCourant();
  const liste = lieuxAffiches(ech);
  if (LIEUX[E.depuis] && LIEUX[E.depuis].echelle === ech && !liste.some(l => l.id === E.depuis)) liste.push(LIEUX[E.depuis]);
  for (const l of liste) {
    const p = projeter(l.lat, l.lon, ech); const st = etatLieu(l.id);
    const etat = { courant: l.id === E.depuis, cle: l.role === 'cle', objectif: l.id === obj, visite: st.code !== 'inconnu', fouille: st.code === 'fouille' };
    const m = creerMarqueur(l, p, etat);
    g.appendChild(m);
    E.marqueurs.push({ g: m, x: p.x, y: p.y, nom: l.court || l.nom, prio: (etat.courant ? 100 : 0) + (etat.objectif ? 50 : 0) + (etat.cle ? 20 : 0) + (st.code !== 'inconnu' ? 2 : 0) + (1 - (l.danger || 0)) });
  }
  // Salon sur la carte régionale, sorties de ville sur la carte de Salon.
  if (ech === 'region') {
    const p = projeter(SALON_SUR_REGION.lat, SALON_SUR_REGION.lon, 'region');
    const m = creerMarqueur({ id: 'salon', type: 'ville', court: 'Salon-de-Provence' }, p, { courant: LIEUX[E.depuis]?.echelle === 'salon' });
    m.classList.add('ville'); m.dataset.id = ''; m.dataset.feuille = 'salon';
    g.appendChild(m);
    E.marqueurs.push({ g: m, x: p.x, y: p.y, nom: 'Salon-de-Provence', prio: 90 });
  } else {
    const vus = new Set();
    for (const s of CARTE_SALON.sorties || []) {
      if (!s.vers || vus.has(s.vers)) continue; vus.add(s.vers);
      const dest = LIEUX[s.vers]; const p = projeter(s.lat, s.lon, 'salon');
      const ang = Math.atan2(p.y, p.x) * 180 / Math.PI;
      const nomDest = dest && estDecouvert(s.vers) ? (dest.court || dest.nom) : 'la campagne';
      const gg = document.createElementNS(SVGNS, 'g');
      gg.setAttribute('class', 'sortie'); gg.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      gg.dataset.sortie = s.id;
      gg.innerHTML = `<g class="m-e"><g transform="rotate(${ang.toFixed(0)})"><path class="s-fleche" d="M-14 0H14M6 -8L15 0L6 8"/></g><text class="s-nom" x="${p.x > 0 ? -20 : 20}" y="${p.y > 0 ? -14 : 26}" text-anchor="${p.x > 0 ? 'end' : 'start'}">vers ${nomDest}${s.route ? ' (' + s.route + ')' : ''}</text><circle class="m-cible" r="22"/></g>`;
      g.appendChild(gg);
    }
  }
  E.groupes = document.createElementNS(SVGNS, 'g'); E.groupes.setAttribute('class', 'c-groupes'); g.appendChild(E.groupes);
  planifierDesencombrement();
}
function planifierDesencombrement() {
  if (!E || E.raf) return;
  E.raf = requestAnimationFrame(() => {
    E.raf = 0; if (!E.F) return;
    const { mpp } = E.F.vue.etat();
    const groupes = desencombrer(E.marqueurs, mpp);
    let s = '';
    for (const gr of groupes) s += `<g class="groupe" data-groupe="${gr.membres.map(m => m.g.dataset.id).join(',')}" transform="translate(${gr.x.toFixed(1)} ${gr.y.toFixed(1)})"><g class="m-e"><circle cx="13" cy="-12" r="8.5"/><text x="13" y="-8.6">+${gr.n - 1}</text></g></g>`;
    E.groupes.innerHTML = s;
  });
}

// ---------------------------------------------------------------- toucher
function onTap(cible) {
  if (!E) return;
  const n = cible && cible.closest ? cible.closest('[data-id],[data-sortie],[data-groupe],[data-feuille]') : null;
  if (!n) { fermerFiche(); return; }
  if (n.dataset.groupe) {
    const ids = n.dataset.groupe.split(',').filter(Boolean).map(id => LIEUX[id]).filter(Boolean);
    const ps = ids.map(l => projeter(l.lat, l.lon, E.echelle));
    if (ps.length) E.F.vue.allerA([Math.min(...ps.map(p => p.x)), Math.min(...ps.map(p => p.y)), Math.max(...ps.map(p => p.x)), Math.max(...ps.map(p => p.y))], { marge: 0.6 });
    return;
  }
  if (n.dataset.feuille) { const p = projeter(SALON_SUR_REGION.lat, SALON_SUR_REGION.lon, 'salon'); montrer('salon', { centrerSur: p }); return; }
  if (n.dataset.sortie) {
    const s = (CARTE_SALON.sorties || []).find(x => x.id === n.dataset.sortie);
    if (s) montrer('region', { centrerSur: projeter(s.lat, s.lon, 'region') });
    return;
  }
  if (n.dataset.id) ouvrirFiche(n.dataset.id);
}

// ---------------------------------------------------------------- fiche d'un lieu
function fermerFiche() {
  if (!E) return;
  E.sel = null;
  if (E.fiche) { E.fiche.remove(); E.fiche = null; }
  if (E.F) E.F.couches.route.innerHTML = '';
  E.racine.classList.remove('avec-fiche');
  for (const m of E.marqueurs) m.g.classList.remove('choisi');
}
function ouvrirFiche(id) {
  const l = LIEUX[id]; if (!l) return;
  if (E.fiche) E.fiche.remove();
  E.sel = id;
  for (const m of E.marqueurs) m.g.classList.toggle('choisi', m.g.dataset.id === id);
  const st = etatLieu(id);
  const ici = id === E.depuis;
  const fiche = el('aside', { class: 'carte-fiche' });
  const entete = el('div', { class: 'f-entete' },
    el('div', { class: 'f-picto', html: `<svg viewBox="0 0 24 24"><path d="${pictoPath(l.type)}"/></svg>` }),
    el('div', { class: 'f-titres' },
      el('h2', {}, l.nom),
      el('div', { class: 'f-type' }, TYPES[l.type] || '', el('span', { class: 'f-etat e-' + st.code }, st.texte), l.role === 'cle' ? el('span', { class: 'f-etat e-cle' }, 'important') : null)),
    el('button', { class: 'f-fermer', 'aria-label': 'Fermer', onclick: fermerFiche }, '×'));
  fiche.append(entete, el('p', { class: 'f-desc' }, l.desc || ''));
  if (ici) {
    fiche.append(el('p', { class: 'f-ici' }, 'Tu es ici.'),
      el('div', { class: 'f-actions' }, el('button', { class: 'carte-btn principal', onclick: () => flow.explorer(id) }, 'Rester ici')));
  } else {
    E.fInfos = el('div', { class: 'f-infos' });
    const allures = el('div', { class: 'f-allures', role: 'radiogroup', 'aria-label': 'Allure' });
    for (const [k, a] of Object.entries(REGLAGES.voyage.ALLURES)) {
      allures.append(el('button', { class: 'f-allure' + (k === allure ? ' actif' : ''), 'data-a': k, role: 'radio', 'aria-checked': String(k === allure), onclick: () => { allure = k; majFiche(); } },
        el('b', {}, a.nom), el('small', {}, `${a.kmh} km/h`)));
    }
    E.fJumelles = el('div', { class: 'f-jumelles' });
    E.fPartir = el('button', { class: 'carte-btn principal', onclick: partir }, 'Partir');
    fiche.append(E.fInfos, allures, E.fJumelles, el('div', { class: 'f-actions' }, E.fPartir));
  }
  E.fiche = fiche; E.contourner = false;
  E.racine.append(fiche); E.racine.classList.add('avec-fiche');
  if (!ici) majFiche(true);
  else E.F.couches.route.innerHTML = '';
}
function majFiche(cadrer = false) {
  const id = E.sel; if (!id) return;
  for (const b of E.fiche.querySelectorAll('.f-allure')) { b.classList.toggle('actif', b.dataset.a === allure); b.setAttribute('aria-checked', String(b.dataset.a === allure)); }
  const iti = itineraire(E.depuis, id);
  const ctx = contexteVoyage({ allure });
  const v = vitesse(ctx);
  const duree = iti.metres / v.mParMin;
  const r = evaluerRisque(iti, ctx, { de: E.depuis, vers: id });
  E.iti = iti;
  let crans = '';
  for (let i = 1; i <= 5; i++) crans += `<i class="${i <= r.cran ? 'on r' + r.cran : ''}"></i>`;
  E.fInfos.innerHTML = '';
  E.fInfos.append(
    el('div', { class: 'f-ligne' }, el('span', { class: 'f-lab' }, 'Distance'), el('b', {}, fmtDistance(iti.metres)), iti.route ? null : el('small', {}, ' (à travers champs)')),
    el('div', { class: 'f-ligne' }, el('span', { class: 'f-lab' }, 'Durée'), el('b', {}, '~' + fmtDuree(duree)), v.raisons.length ? el('small', {}, ' — ' + v.raisons.join(', ')) : null),
    el('div', { class: 'f-ligne f-risque' }, el('span', { class: 'f-lab' }, 'Risque'), el('span', { class: 'f-jauge', html: crans }), el('b', { class: 'r' + r.cran }, r.libelle)),
    r.raisons.length ? el('div', { class: 'f-raisons' }, r.raisons.join(' · ')) : null,
  );
  // jumelles : la première rencontre hostile est repérée sur l'itinéraire
  E.fJumelles.innerHTML = '';
  E.repere = null;
  if (aJumelles()) {
    const ts = tirerRencontres(iti, ctx, { de: E.depuis, vers: id, minutes: G.world.minutes });
    const h = ts.find(t => t.hostile && !t.scripte);
    if (h) {
      E.repere = h;
      const m = REGLAGES.voyage.DETOUR_REPERE_M[iti.echelle] || 250;
      const cb = el('input', { type: 'checkbox', onchange: (e) => { E.contourner = e.target.checked; dessinerTrajet(); } });
      if (E.contourner) cb.checked = true;
      E.fJumelles.append(el('p', {}, `Aux jumelles : ça bouge à ${fmtDistance(h.d)} d’ici.`), el('label', {}, cb, ` Contourner (+${fmtDistance(m)})`));
    } else E.fJumelles.append(el('p', {}, 'Aux jumelles : rien de visible sur le trajet.'));
  }
  dessinerTrajet(cadrer);
}
function dessinerTrajet(cadrer = false) {
  const g = E.F.couches.route; const iti = E.iti; if (!iti || !iti.points.length) { g.innerHTML = ''; return; }
  const pts = iti.points.map(p => projeter(p.lat, p.lon, E.echelle));
  let d = ''; pts.forEach((p, i) => { d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  let s = `<path class="t-fond" d="${d}"/><path class="t-pointille" d="${d}"/>`;
  const a = pts[0], b = pts[pts.length - 1];
  s += `<g transform="translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})"><g class="m-e"><path class="t-croix" d="M-7 -7L7 7M7 -7L-7 7"/></g></g>`;
  s += `<g transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})"><g class="m-e"><circle class="t-depart" r="4"/></g></g>`;
  if (E.repere) {
    const q = pointSur(iti, pts, E.repere.d);
    s += `<g transform="translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})"><g class="m-e"><text class="t-repere" y="5">?</text>${E.contourner ? '<path class="t-contourne" d="M-12 -12L12 12"/>' : ''}</g></g>`;
  }
  g.innerHTML = s;
  if (cadrer) {
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const r = E.vueHote.getBoundingClientRect(), fr = E.fiche ? E.fiche.getBoundingClientRect() : null;
    const lateral = fr && fr.width < r.width * 0.7;
    E.F.vue.allerA([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
      { marge: 0.25, droite: lateral ? r.right - fr.left + 8 : 0, haut: 50 + (fr && !lateral ? fr.height : 0) });
  }
}
function pointSur(iti, pts, d) {
  let i = 1; while (i < iti.points.length - 1 && iti.points[i].d < d) i++;
  const A = iti.points[i - 1], B = iti.points[i]; const t = B.d > A.d ? (d - A.d) / (B.d - A.d) : 0;
  return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
}
function partir() {
  const vers = E.sel; if (!vers) return;
  const params = { de: E.depuis, vers, allure, groupe: null, minutesDepart: G ? G.world.minutes : undefined, contourner: !!(E.contourner && E.repere) };
  flow.voyager(params);
}
export { estHostile };
