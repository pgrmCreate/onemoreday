// ============ Panneau Fabrication — refonte ============
// Colonne de catégories ; recettes « faisables maintenant » en tête, puis connues mais incomplètes (ce qui manque en rouge),
// puis inconnues grisées (« À découvrir : livre X ») ; fiche : ingrédients possédés/requis, outils, poste, temps, compétence,
// quantité ; bouton Fabriquer avec barre de progression (rien n'est consommé avant la fin, interrompre ne coûte rien).
import { G } from '../../core/state.js';
import { RECIPES } from '../../data/recipes.js';
import * as craft from '../../game/crafting.js';
import * as inv from '../../game/inventory.js';
import { nomCompetence } from '../../game/player.js';
import { iconeObjet, ICONE_CATEGORIE_RECETTE } from '../icons.js';
import { toast } from '../toast.js';
import { el, icoEl, bouton, avecScroll, vide, pct, g } from './commun.js';
import { dessinerConstruire } from './construire.js';

let etat = { cat: null, sel: null, qty: 1, cible: null };
const etatC = { sel: null };   // onglet « Construire »
let apiPanneau = null;
let enCours = null; // { raf, debut, duree, id }

export function monter(racine, opts = {}, api) {
  apiPanneau = api || null;
  if (opts.cat !== undefined) etat.cat = opts.cat;
  if (opts.recette) etat.sel = opts.recette;
  const rendre = () => { if (!enCours) avecScroll(racine, () => dessiner(racine)); };
  rendre();
  return { maj: rendre, demonter: interrompre };
}
function interrompre() { if (enCours) { cancelAnimationFrame(enCours.raf); enCours = null; } }

function iconeRecette(r) { return r.resultat ? iconeObjet(r.resultat.id) : r.special === 'feu_camp' ? 'feu' : r.special === 'barricade' ? 'materiau' : 'reparer'; }

function dessiner(racine) {
  const p = G.player; racine.textContent = '';
  const comptes = craft.compteParCategorie(p);
  // Catégories
  const cats = el('nav', { class: 'fa-cats', 'data-scroll': 'cats' });
  const totF = Object.values(comptes).reduce((s, c) => s + c.faisables, 0);
  const catBtn = (id, nom, ic, n) => {
    const b = el('button', { type: 'button', class: 'fa-cat' + (etat.cat === id ? ' actif' : ''), title: nom, onclick: () => { etat.cat = id; etat.sel = null; dessiner(racine); } }, icoEl(ic), el('span', {}, nom));
    if (n) b.append(el('em', { class: 'pn-badge' }, String(n)));
    return b;
  };
  cats.append(catBtn(null, 'Tout', 'tout', totF));
  for (const [id, nom] of Object.entries(craft.CATEGORIES_RECETTES)) cats.append(catBtn(id, nom, ICONE_CATEGORIE_RECETTE[id] || 'fabrication', comptes[id] && comptes[id].faisables));
  cats.append(catBtn('construire', 'Construire', 'etabli', 0));
  if (etat.cat === 'construire') {
    const liste = el('div', { class: 'fa-liste', 'data-scroll': 'liste-construire' });
    const fiche = el('aside', { class: 'pn-fiche fa-fiche', 'data-scroll': 'fiche' });
    dessinerConstruire(liste, fiche, etatC, () => dessiner(racine), apiPanneau);
    racine.append(el('div', { class: 'fa-grille' + (etatC.sel ? ' avec-fiche' : '') }, cats, liste, fiche));
    return;
  }
  // Postes disponibles
  const po = craft.postesDisponibles(p);
  const postes = el('div', { class: 'fa-postes' },
    el('span', { class: po.etabli ? 'on' : '' }, icoEl('etabli'), po.etabli ? 'Établi' : 'Pas d\'établi'),
    el('span', { class: po.feu ? 'on feu' : '' }, icoEl('feu'), po.feu ? ({ rechaud: 'Réchaud', feu_camp: 'Feu de camp' }[po.feuSource] || 'Feu') : 'Pas de feu'));
  // Liste
  const liste = el('div', { class: 'fa-liste', 'data-scroll': 'liste-' + etat.cat });
  const res = craft.recettesParEtat(etat.cat, p);
  liste.append(postes);
  const section = (titre, arr, cls) => {
    if (!arr.length) return;
    liste.append(el('h3', { class: `pn-section ${cls}` }, titre, el('em', {}, String(arr.length))));
    for (const e of arr) liste.append(ligne(e, cls, racine));
  };
  section('Faisables maintenant', res.faisables, 'faisable');
  section('Il manque quelque chose', res.incompletes, 'incomplete');
  section('À découvrir', res.inconnues, 'inconnue');
  if (!res.faisables.length && !res.incompletes.length && !res.inconnues.length) liste.append(vide('Rien ici.', 'fabrication'));
  if (!etat.sel && res.faisables[0] && matchMedia('(min-width: 700px)').matches) etat.sel = res.faisables[0].r.id;
  const fiche = el('aside', { class: 'pn-fiche fa-fiche', 'data-scroll': 'fiche' });
  remplirFiche(fiche, p, racine);
  racine.append(el('div', { class: 'fa-grille' + (etat.sel ? ' avec-fiche' : '') }, cats, liste, fiche));
}

function ligne(e, cls, racine) {
  const r = e.r; const actif = etat.sel === r.id;
  const b = el('button', { type: 'button', class: `fa-ligne ${cls}${actif ? ' actif' : ''}`, onclick: () => { etat.sel = r.id; etat.qty = 1; etat.cible = null; dessiner(racine); } });
  b.append(el('span', { class: 'fa-ic' }, icoEl(e.connue ? iconeRecette(r) : 'inconnu')));
  const t = el('span', { class: 'fa-txt' });
  if (!e.connue) {
    const c = craft.commentApprendre(r);
    t.append(el('span', { class: 'fa-nom' }, '???'), el('small', {}, 'À découvrir : ' + [...c.livres, ...c.niveaux].join(' ou ')));
  } else {
    t.append(el('span', { class: 'fa-nom' }, r.nom, r.resultat && r.resultat.qty > 1 ? el('em', {}, ` ×${r.resultat.qty}`) : null));
    if (e.faisable) t.append(el('small', {}, `${e.tempsMin} min${e.poste ? ' · ' + e.poste.nom : ''}${e.maxQty > 1 ? ` · jusqu'à ×${e.maxQty}` : ''}`));
    else t.append(el('small', { class: 'manque' }, e.manques.slice(0, 2).map(m => m.texte).join(' · ') + (e.manques.length > 2 ? ` (+${e.manques.length - 2})` : '')));
  }
  b.append(t);
  if (e.faisable) b.append(el('span', { class: 'fa-pret' }, icoEl('coche')));
  return b;
}

function remplirFiche(f, p, racine) {
  if (!etat.sel) { f.append(vide('Choisis une recette. Celles que tu peux faire tout de suite sont en haut.', 'fabrication')); return; }
  const r = RECIPES.find(x => x.id === etat.sel); if (!r) return;
  let e = craft.etatRecette(r, p, etat.qty);
  if (etat.qty > 1 && e.maxQty < etat.qty) { etat.qty = Math.max(1, e.maxQty); e = craft.etatRecette(r, p, etat.qty); }
  f.append(el('button', { type: 'button', class: 'fi-fermer', 'aria-label': 'Fermer la fiche', onclick: () => { etat.sel = null; dessiner(racine); } }, icoEl('fermer')));
  if (!e.connue) {
    const c = craft.commentApprendre(r);
    f.append(el('div', { class: 'fi-tete inconnue' }, el('span', { class: 'fi-ic' }, icoEl('inconnu')), el('div', {}, el('h2', {}, 'Recette inconnue'), el('p', { class: 'fi-type' }, craft.CATEGORIES_RECETTES[r.cat]))));
    const l = el('ul', { class: 'fa-apprendre' });
    for (const x of c.livres) l.append(el('li', {}, icoEl('livre'), `Lire : ${x}`));
    for (const x of c.niveaux) l.append(el('li', {}, icoEl('competences'), `Atteindre : ${x}`));
    f.append(el('p', { class: 'fi-desc' }, 'Tu ne sais pas encore comment faire ça.'), l);
    return;
  }
  const res = r.resultat ? inv.def(r.resultat.id) : null;
  f.append(el('div', { class: `fi-tete${e.faisable ? ' faisable' : ''}` },
    el('span', { class: 'fi-ic' }, icoEl(iconeRecette(r))),
    el('div', {}, el('h2', {}, r.nom), el('p', { class: 'fi-type' }, r.resultat ? `Donne : ${res ? res.nom : r.resultat.id} ×${r.resultat.qty * etat.qty}` : craft.CATEGORIES_RECETTES[r.cat]))));
  if (r.desc) f.append(el('p', { class: 'fi-desc' }, g(r.desc)));
  // Besoins
  const req = el('ul', { class: 'fa-req' });
  const item = (ok, ic, txt, val) => req.append(el('li', { class: ok ? 'ok' : 'ko' }, icoEl(ok ? 'coche' : 'fermer'), el('span', { class: 'fa-req-ic' }, icoEl(ic)), el('span', {}, txt), val ? el('b', {}, val) : null));
  for (const x of e.ingredients) item(x.ok, iconeObjet(x.id), x.nom, `${x.a} / ${x.faut}`);
  for (const o of e.outils) item(o.ok, 'outil', o.ok ? `${o.nom} (${o.objet})` : o.nom, o.ok ? '' : 'manque');
  item(!e.poste || e.poste.ok, e.poste ? (e.poste.id === 'feu' ? 'feu' : 'etabli') : 'main', e.poste ? e.poste.nom : 'À la main, n\'importe où', e.poste && !e.poste.ok ? 'absent' : '');
  for (const c of e.competences) item(c.ok, 'competences', `${c.nom} ${c.faut}`, `niv. ${c.a}`);
  f.append(el('h3', { class: 'pn-section' }, 'Il faut'), req);
  // Cible de réparation
  if (r.special === 'reparer') {
    f.append(el('h3', { class: 'pn-section' }, 'Réparer'));
    const cb = el('div', { class: 'fa-cibles' });
    if (!e.cibles.length) cb.append(el('p', { class: 'fi-desc' }, `Rien d'abîmé parmi : ${(r.cible || []).map(craft.nomFamille).join(', ')}.`));
    if (etat.cible == null && e.cibles[0]) etat.cible = e.cibles[0].ref;
    for (const c of e.cibles) cb.append(el('button', { type: 'button', class: 'fa-cible' + (etat.cible === c.ref ? ' actif' : ''), onclick: () => { etat.cible = c.ref; dessiner(racine); } },
      icoEl(iconeObjet(c.id)), el('span', {}, inv.nomObjet(c.id) + (c.ref === 'arme' ? ' (en main)' : '')), el('span', { class: 'inv-usure' + (c.dur / c.durMax < 0.2 ? ' bas' : '') }, el('i', { style: { width: pct(c.dur / c.durMax) } }))));
    f.append(cb);
  }
  // Pied : temps, xp, quantité, bouton
  const xp = Object.entries(r.xp || {}).map(([s, n]) => `+${n * etat.qty} ${nomCompetence(s)}`).join(', ');
  const pied = el('div', { class: 'fa-pied' });
  pied.append(el('div', { class: 'fa-infos' }, el('span', {}, icoEl('sablier'), `${e.tempsMin} min`), xp ? el('span', {}, icoEl('etoile'), xp) : null));
  if (!r.special && e.maxQty > 1) {
    pied.append(el('div', { class: 'fa-qty' },
      el('button', { type: 'button', 'aria-label': 'Moins', disabled: etat.qty <= 1 ? true : null, onclick: () => { etat.qty = Math.max(1, etat.qty - 1); dessiner(racine); } }, icoEl('moins')),
      el('output', {}, `×${etat.qty}`),
      el('button', { type: 'button', 'aria-label': 'Plus', disabled: etat.qty >= e.maxQty ? true : null, onclick: () => { etat.qty = Math.min(e.maxQty, etat.qty + 1); dessiner(racine); } }, icoEl('plus')),
      el('button', { type: 'button', class: 'max', onclick: () => { etat.qty = e.maxQty; dessiner(racine); } }, 'max')));
  }
  const go = bouton({ label: e.faisable ? 'Fabriquer' : 'Impossible', icone: 'fabriquer', cls: 'principal fa-go', disabled: !e.faisable, raison: e.faisable ? null : e.manques[0] && e.manques[0].texte,
    onclick: () => lancer(r, e, pied, racine) });
  pied.append(go);
  f.append(pied);
}

function lancer(r, e, pied, racine) {
  const duree = craft.dureeBarreMs(e.tempsMin);
  const barre = el('div', { class: 'fa-progres' }, el('i'), el('span', {}, `${r.nom}…`));
  const stop = bouton({ label: 'Interrompre', icone: 'fermer', cls: 'second', onclick: () => { interrompre(); toast('Interrompu. Rien n\'est perdu.', 'info'); dessiner(racine); } });
  pied.textContent = ''; pied.append(barre, stop);
  const i = barre.firstChild; const debut = performance.now();
  enCours = { debut, duree };
  const pas = (t) => {
    if (!enCours) return;
    const k = Math.min(1, (t - debut) / duree);
    i.style.width = `${k * 100}%`;
    if (k < 1) { enCours.raf = requestAnimationFrame(pas); return; }
    enCours = null;
    const res = craft.fabriquer(r.id, etat.qty, { cible: etat.cible });
    if (!res.ok) toast(res.raison, 'alerte');
    etat.qty = 1; etat.cible = null;
    import('../../game/survival.js').then(m => m.son && m.son('craft'));
    dessiner(racine);
  };
  enCours.raf = requestAnimationFrame(pas);
}
