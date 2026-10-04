// ============ Panneau Fabrication — onglet « Construire » ============
// Liste des constructions (réalisables d'abord), fiche (il faut : matériaux, outils, niveau) et bouton « Placer » :
// le panneau se ferme, le fantôme apparaît dans le lieu (js/explore/construction.js) — on choisit l'endroit, puis on bâtit.
import { G } from '../../core/state.js';
import { emit } from '../../core/bus.js';
import * as cons from '../../game/construction.js';
import { iconeObjet } from '../icons.js';
import { el, icoEl, bouton, vide, g } from './commun.js';

export const ICONE_CONSTRUCTION = {
  mur_planches: 'materiau', mur_renforce: 'materiau', palissade: 'materiau', porte_planches: 'verrou', barricade_fenetre: 'verrou',
  pieux: 'lance', caisse_bois: 'sac', etabli: 'etabli', lit_fortune: 'dormir', feu_camp: 'feu', recuperateur: 'remplir', potager: 'nourriture',
};
const ic = (type) => ICONE_CONSTRUCTION[type] || 'fabriquer';

// liste + fiche dans la grille du panneau de fabrication ; etat = { sel } (partagé avec l'onglet), redessiner()
export function dessinerConstruire(liste, fiche, etat, redessiner, api) {
  const p = G.player;
  const tous = Object.keys(cons.CONSTRUCTIONS).map(type => ({ type, e: cons.etatConstruction(type, p) }));
  const faisables = tous.filter(x => x.e.faisable), autres = tous.filter(x => !x.e.faisable);
  if (!G.player.position || G.player.position.mode !== 'lieu') liste.append(el('p', { class: 'fi-desc' }, 'On construit sur place, dans un lieu : pas en route.'));
  const section = (titre, arr, cls) => {
    if (!arr.length) return;
    liste.append(el('h3', { class: `pn-section ${cls}` }, titre, el('em', {}, String(arr.length))));
    for (const { type, e } of arr) {
      const d = e.d;
      const b = el('button', { type: 'button', class: `fa-ligne ${cls}${etat.sel === type ? ' actif' : ''}`, onclick: () => { etat.sel = type; redessiner(); } });
      b.append(el('span', { class: 'fa-ic' }, icoEl(ic(type))));
      b.append(el('span', { class: 'fa-txt' }, el('span', { class: 'fa-nom' }, d.nom),
        e.faisable ? el('small', {}, `${cons.CATS_CONSTRUCTION[d.cat]} · ${d.tempsMin} min`) : el('small', { class: 'manque' }, e.manques.slice(0, 2).join(' · ') + (e.manques.length > 2 ? ` (+${e.manques.length - 2})` : ''))));
      if (e.faisable) b.append(el('span', { class: 'fa-pret' }, icoEl('coche')));
      liste.append(b);
    }
  };
  section('Tu peux construire', faisables, 'faisable');
  section('Il manque quelque chose', autres, 'incomplete');
  // fiche
  if (!etat.sel || !cons.CONSTRUCTIONS[etat.sel]) { fiche.append(vide('Choisis ce que tu veux bâtir. Démonter un meuble (touche G près de lui, avec un marteau ou un pied-de-biche) donne des planches.', 'etabli')); return; }
  const type = etat.sel, e = cons.etatConstruction(type, p), d = e.d;
  fiche.append(el('button', { type: 'button', class: 'fi-fermer', 'aria-label': 'Fermer la fiche', onclick: () => { etat.sel = null; redessiner(); } }, icoEl('fermer')));
  fiche.append(el('div', { class: `fi-tete${e.faisable ? ' faisable' : ''}` }, el('span', { class: 'fi-ic' }, icoEl(ic(type))),
    el('div', {}, el('h2', {}, d.nom), el('p', { class: 'fi-type' }, `${cons.CATS_CONSTRUCTION[d.cat]} · ${d.t[0]} × ${d.t[1]} case${d.t[0] * d.t[1] > 1 ? 's' : ''}`))));
  if (d.desc) fiche.append(el('p', { class: 'fi-desc' }, g(d.desc)));
  const req = el('ul', { class: 'fa-req' });
  const item = (ok, icone, txt, val) => req.append(el('li', { class: ok ? 'ok' : 'ko' }, icoEl(ok ? 'coche' : 'fermer'), el('span', { class: 'fa-req-ic' }, icoEl(icone)), el('span', {}, txt), val ? el('b', {}, val) : null));
  for (const x of e.ingredients) item(x.ok, iconeObjet(x.id), x.nom, `${x.a} / ${x.faut}`);
  for (const o of e.outils) item(o.ok, 'outil', o.nom, o.ok ? '' : 'manque');
  for (const c of e.competences) item(c.ok, 'competences', `${c.nom} ${c.faut}`, `niv. ${c.a}`);
  if (!e.ingredients.length && !e.outils.length) item(true, 'main', 'Rien de spécial');
  fiche.append(el('h3', { class: 'pn-section' }, 'Il faut'), req);
  const infos = [];
  if (d.pv < 999) infos.push(`Solidité : ${d.pv}`);
  if (d.bloque && !d.opaque) infos.push('on voit à travers');
  if (d.contenance) infos.push(`${d.contenance} L de rangement`);
  if (d.eau) infos.push(`jusqu'à ${d.eau.cap} L d'eau de pluie`);
  if (d.feu) infos.push(`brûle ${d.feu.minutes / 60} h`);
  if (d.potager) infos.push(`récolte en ${d.potager.jours} jours`);
  if (infos.length) fiche.append(el('p', { class: 'fi-desc' }, infos.join(' · ') + '.'));
  const pied = el('div', { class: 'fa-pied' }, el('div', { class: 'fa-infos' }, el('span', {}, icoEl('sablier'), `${d.tempsMin} min`)));
  pied.append(bouton({ label: e.faisable ? 'Placer' : 'Impossible', icone: 'poser', cls: 'principal fa-go', disabled: !e.faisable, raison: e.faisable ? null : e.manques[0],
    onclick: () => { emit('construction:placer', { type }); if (api && api.fermer) api.fermer(); } }));
  fiche.append(pied);
}
