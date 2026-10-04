// ============ Panneau Construire — un menu à part, à côté du Sac et du Corps ============
// Colonne de catégories (tout, murs, défense, mobilier, survie) ; liste (ce qu'on peut bâtir d'abord) ; fiche.
// « Placer » ferme le panneau : le fantôme vert clair apparaît dans le lieu (js/explore/construction.js), on choisit
// l'endroit, on pose, et le personnage bâtit. Un mort qui approche coupe tout (placement, chantier, panneau).
import { G } from '../../core/state.js';
import * as cons from '../../game/construction.js';
import { el, icoEl, avecScroll } from './commun.js';
import { dessinerConstruire } from './construire.js';

const ICONE_CAT = { murs: 'materiau', defense: 'verrou', mobilier: 'etabli', survie: 'feu' };
const etat = { sel: null, cat: null };

export function monter(racine, opts = {}, api) {
  if (opts.type && cons.CONSTRUCTIONS[opts.type]) etat.sel = opts.type;
  const rendre = () => avecScroll(racine, () => dessiner(racine, api));
  rendre();
  return { maj: rendre };
}

function dessiner(racine, api) {
  racine.textContent = '';
  const p = G.player;
  const cats = el('nav', { class: 'fa-cats', 'data-scroll': 'cats' });
  const nFaisables = (cat) => Object.entries(cons.CONSTRUCTIONS).filter(([t, d]) => (!cat || d.cat === cat) && cons.etatConstruction(t, p).faisable).length;
  const catBtn = (id, nom, ic) => {
    const b = el('button', { type: 'button', class: 'fa-cat' + (etat.cat === id ? ' actif' : ''), title: nom, onclick: () => { etat.cat = id; etat.sel = null; dessiner(racine, api); } }, icoEl(ic), el('span', {}, nom));
    const n = nFaisables(id); if (n) b.append(el('em', { class: 'pn-badge' }, String(n)));
    return b;
  };
  cats.append(catBtn(null, 'Tout', 'tout'));
  for (const [id, nom] of Object.entries(cons.CATS_CONSTRUCTION)) cats.append(catBtn(id, nom, ICONE_CAT[id] || 'marteau'));
  const liste = el('div', { class: 'fa-liste', 'data-scroll': 'liste-' + (etat.cat || 'tout') });
  const fiche = el('aside', { class: 'pn-fiche fa-fiche', 'data-scroll': 'fiche' });
  dessinerConstruire(liste, fiche, etat, () => dessiner(racine, api), api);
  racine.append(el('div', { class: 'fa-grille' + (etat.sel ? ' avec-fiche' : '') }, cats, liste, fiche));
}
