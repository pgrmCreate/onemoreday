// ============ Exploration — la page de rangement ============
// Une page entière pour transférer des objets : ce qu'on porte à gauche, le rangement (ou le sol) à droite, deux listes qui
// défilent chacune de leur côté et un tri par catégorie commun. Toucher une ligne transfère toute la pile, le petit « 1 »
// un seul objet, et le bas de chaque colonne transfère tout ce que le tri affiche (docs/RETOURS_JOUEUR.md #75).
// La page ne fait qu'afficher : les gestes et les règles de place sont dans ./butin.js.
//   montrerRangement({ titre, verbe, gauche, droite, placeG, placeD, toutG, toutD, fermer })
//     gauche, droite : [{ cle, id, nom, qty, volume, note?, n, raison?, agir(qty) }]   n : combien on peut transférer d'un coup
//     placeG, placeD : texte de place { txt, frac? } ; toutG, toutD (lignes) : tout transférer ; fermer() : quitter
//   cacherRangement()
import { el } from '../core/util.js';
import { categorie, CATEGORIES_OBJETS } from '../game/inventory.js';
import { icoEl, iconeObjet } from '../ui/icons.js';
import { commandeTransfert } from '../ui/transferts.js';

const COURT = { munition: 'Munitions', boisson: 'Boissons', outil: 'Outils', vetement: 'Vêtements', quete: 'Importants' };
const NOMS = Object.fromEntries(CATEGORIES_OBJETS.map(([k, n]) => [k, COURT[k] || n]));
const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
const bouton = (attrs, ...contenu) => commandeTransfert(el('button', attrs, ...contenu));

let page = null, filtre = 'tout', clavier = null, derniere = null;

function ligne(l, fleche) {
  const seul = l.n >= 1 && l.qty > 1 && !l.raison;
  return el('li', { class: 'ra-ligne' + (l.n < 1 ? ' bloque' : '') },
    bouton({ class: 'ra-objet', type: 'button', disabled: l.n < 1 ? true : null, title: l.raison || null, onclick: () => l.agir(l.n) },
      el('span', { class: 'ra-ico' }, icoEl(iconeObjet(l.id))),
      el('span', { class: 'ra-nom' }, l.nom, l.qty > 1 ? el('em', {}, ' ×' + l.qty) : null, l.note ? el('small', {}, l.note) : null),
      el('span', { class: 'ra-vol' }, l.raison || `${fmt(l.volume)} L`),
      el('span', { class: 'ra-fleche' }, l.n >= 1 ? fleche : '')),
    seul ? bouton({ class: 'ra-un', type: 'button', 'aria-label': `Un seul : ${l.nom}`, onclick: () => l.agir(1) }, '1') : null);
}
function colonne(cote, titre, lignes, place, tout, fleche, vide) {
  const vus = lignes.filter(l => filtre === 'tout' || categorie(l.id) === filtre);
  const liste = el('ul', { class: 'ra-liste', 'data-cote': cote });
  for (const l of vus) liste.append(ligne(l, fleche));
  if (!vus.length) liste.append(el('li', { class: 'ra-vide' }, filtre === 'tout' ? vide : `Rien ici dans « ${NOMS[filtre]} ».`));
  const tete = el('div', { class: 'ra-col-t' }, el('b', {}, titre), el('span', {}, place ? place.txt : ''));
  if (place && place.frac != null) tete.append(el('i', { class: 'ra-jauge' + (place.frac >= 1 ? ' plein' : '') }, el('b', { style: { width: Math.min(100, place.frac * 100).toFixed(0) + '%' } })));
  const possibles = vus.filter(l => l.n >= 1);
  return el('section', { class: 'ra-col' }, tete, liste,
    tout ? bouton({ class: 'ra-tout', type: 'button', disabled: possibles.length ? null : true, onclick: () => tout(possibles) },
      `${tout.libelle}${filtre === 'tout' ? '' : ` : ${NOMS[filtre].toLowerCase()}`}`) : null);
}

export function montrerRangement(d) {
  derniere = d;
  if (!page) {
    page = el('div', { class: 'ex-rangement', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ranger' });
    document.body.append(page);
    // tant que la page est ouverte, le clavier est à elle : Échap ferme, et le personnage ne part pas tout seul derrière
    clavier = (e) => { if (e.ctrlKey || e.metaKey) return; e.stopPropagation(); e.preventDefault(); if (e.key === 'Escape' && derniere) derniere.fermer(); };
    window.addEventListener('keydown', clavier, true);
    filtre = 'tout';
  }
  const haut = {}; page.querySelectorAll('.ra-liste').forEach(l => { haut[l.dataset.cote] = l.scrollTop; });   // chaque geste redessine : on garde sa place
  const tous = [...d.gauche, ...d.droite];
  const presentes = CATEGORIES_OBJETS.map(([k]) => k).filter(k => tous.some(l => categorie(l.id) === k));
  if (filtre !== 'tout' && !presentes.includes(filtre)) filtre = 'tout';
  const puce = (k, nom, n) => el('button', { class: 'ra-puce' + (filtre === k ? ' actif' : ''), type: 'button', 'aria-pressed': filtre === k ? 'true' : 'false', onclick: () => { filtre = k; montrerRangement(derniere); } }, nom, el('em', {}, String(n)));
  const puces = el('div', { class: 'ra-puces', role: 'toolbar', 'aria-label': 'Trier par catégorie' }, puce('tout', 'Tout', tous.length),
    ...presentes.map(k => puce(k, NOMS[k], tous.filter(l => categorie(l.id) === k).length)));
  const defil = page.querySelector('.ra-puces'), xPuces = defil ? defil.scrollLeft : 0;
  page.textContent = '';
  page.append(
    el('header', { class: 'ra-tete' }, el('h2', {}, d.titre), el('button', { class: 'ra-fermer', type: 'button', onclick: () => d.fermer() }, 'Fermer')),
    puces,
    el('div', { class: 'ra-colonnes' },
      colonne('g', 'Sur toi', d.gauche, d.placeG, d.toutG, '→', 'Tu n’as rien à ranger.'),
      colonne('d', d.nomD, d.droite, d.placeD, d.toutD, '←', 'Vide.')));
  puces.scrollLeft = xPuces;
  page.querySelectorAll('.ra-liste').forEach(l => { l.scrollTop = haut[l.dataset.cote] || 0; });
}
export function cacherRangement() {
  if (!page) return;
  window.removeEventListener('keydown', clavier, true);
  page.remove(); page = null; clavier = null; derniere = null;
}
