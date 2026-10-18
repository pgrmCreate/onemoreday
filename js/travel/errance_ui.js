// ============ Marcher sans carte — partir à pied, passer d'une rue à l'autre (DOM) ============
// ouvrirDepart(lieuId, echelle, partir) : la fenêtre « Sans carte » à la sortie d'un lieu (rues qui en partent, indications
// reçues de l'histoire, rester) ; partir() est appelé juste avant de quitter le lieu (il range la position).
// traverser(cellule, cote) : on sort d'une cellule par un bord → la cellule suivante, le cul-de-sac ou le lieu au bout.
// Le temps compté à chaque passage est celui de la marche condensée (js/data/troncons.js, ERRANCE).
import { G, genrer } from '../core/state.js';
import { emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el } from '../core/util.js';
import * as flow from '../game/flow.js';
import { lieu } from '../game/donnees.js';
import { ERRANCE, VERS } from '../data/troncons.js';
import { meteoCourante } from './rencontres_voyage.js';
import { projeter, reveler, RAYONS } from './geo.js';
import { departs, voisin, decoder, cap, repere, indications, direction, genreImpasse, pas, pointCellule } from './errance.js';

const COTE = { e: 'vers l’est', o: 'vers l’ouest', n: 'vers le nord', s: 'vers le sud' };
const nomLieu = (id) => { const l = lieu(id); return l ? (l.court || l.nom) : id; };
const connu = (id) => !!(G && G.world.lieux[id] && G.world.lieux[id].visite);
// Voit-on loin ? De jour, sans brume ni pluie battante.
function voitLoin() {
  const m = meteoCourante();
  return !clock.estNuit() && !['brouillard', 'pluie', 'orage'].includes(m);
}
// Le temps de marche qu'un passage représente (au-delà de la traversée réelle de la cellule).
function compterMarche(e) {
  const min = Math.max(0, Math.round(pas(e) / ERRANCE.M_PAR_MIN) - ERRANCE.MIN_MARCHE_CELLULE);
  if (min > 0) clock.sauter(min);     // à deux, l'invité demande le saut à l'hôte (comme un effet tempsMin)
}
// Ce que l'on a parcouru se dessine sur la feuille (utile le jour où l'on trouve une carte).
function memoriser(e, k) {
  try { const p = pointCellule(e, k), q = projeter(p.lat, p.lon, e.echelle); reveler(e.echelle, q.x, q.y, (RAYONS[e.echelle] || RAYONS.salon).trajet); } catch (err) {}
}
const memo = () => (G.player.errance || (G.player.errance = {}));

// ---------------------------------------------------------------- la fenêtre de départ
let fen = null;
export function ouvrirDepart(lieuId, echelle, partir, rester) {
  if (fen || !G) return;
  const fermer = () => { if (fen) { fen.remove(); fen = null; } };
  const annuler = () => { fermer(); if (rester) rester(); };
  fen = el('div', { class: 'som-fond', onclick: (ev) => { if (ev.target === fen) annuler(); } });
  const boite = el('div', { class: 'som-boite err-boite', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Partir sans carte' });
  fen.append(boite);
  boite.append(el('h3', {}, 'Sans carte'),
    el('p', {}, echelle === 'region'
      ? 'Tu n’as pas de carte routière sur toi. Tu peux suivre la route à pied, en te fiant aux panneaux et à ce que tu reconnais, mais une mauvaise route peut finir en cul-de-sac.'
      : 'Tu n’as pas de plan sur toi. Tu peux partir à pied, rue après rue, en te fiant à ce que tu reconnais, mais une mauvaise rue peut finir en cul-de-sac.'));
  const liste = el('div', { class: 'som-choix som-naturel' });
  const loin = voitLoin();
  for (const d of departs(lieuId)) {
    const dir = direction(lieuId, d.vers), court = dir.replace(/^l(e |’)/, ''), vu = loin && repere(d.vers) && VERS[d.vers];
    const texte = connu(d.vers) ? `Retourner à pied : ${nomLieu(d.vers)} (${court})`
      : vu ? `Marcher vers ${vu} (${court})` : `Partir à pied vers ${dir}`;
    liste.append(el('button', { class: 'btn', type: 'button', onclick: () => {
      fermer(); partir();
      memo().retour = null;
      compterMarche(d.e); memoriser(d.e, d.cellule.endsWith(':0') ? 0 : d.e.n - 1);
      flow.explorer(d.cellule, { entree: d.entree }).then(() => arrivee(d.cellule, d.entree));
    } }, texte));
  }
  for (const id of indications(lieuId)) {
    liste.append(el('button', { class: 'btn', type: 'button', onclick: () => {
      fermer(); partir();
      flow.voyager({ de: lieuId, vers: id, allure: 'normale', indication: true });
    } }, VERS[id] ? `Suivre les indications jusqu’à ${VERS[id]}` : `Suivre les indications : ${nomLieu(id)}`));
  }
  if (!liste.childNodes.length) liste.append(el('p', { class: 'som-etat' }, 'Aucune rue ne part d’ici que tu saurais suivre.'));
  boite.append(liste, el('button', { class: 'btn som-annuler', type: 'button', onclick: annuler }, 'Rester ici'));
  document.body.append(fen);
}

// ---------------------------------------------------------------- d'une cellule à l'autre
export async function traverser(cellule, cote) {
  const c = decoder(cellule); if (!c) return false;
  const M = memo(), v = voisin(cellule, cote, M.retour);
  if (!v) return false;
  compterMarche(c.e);
  if (v.lieu) {
    M.retour = null;
    await flow.explorer(v.lieu, { venantDe: v.venantDe });
    return true;
  }
  if (v.impasse) M.retour = { cellule, cote };
  else if (decoder(v.cellule) && !decoder(v.cellule).impasse) { const d = decoder(v.cellule); memoriser(d.e, d.k); }
  await flow.explorer(v.cellule, { entree: v.entree });
  arrivee(v.cellule, v.entree);
  return true;
}

// Ce qu'on voit en arrivant dans une rue : le repère du lieu visé (de jour, par temps clair), ou rien pour s'orienter.
export function arrivee(cellule, entree) {
  const c = decoder(cellule); if (!c) return;
  let texte;
  if (c.impasse) texte = genreImpasse(c.e).texte;
  else {
    const k = cap(cellule, entree), rp = k && repere(k.vers), dehors = c.e.echelle === 'region';
    if (!k) return;
    if (!voitLoin()) texte = clock.estNuit()
      ? 'Il fait trop sombre pour reconnaître quoi que ce soit : il faudra deviner par où continuer.'
      : 'La pluie et la brume cachent tout au bout de la rue : impossible de savoir par où continuer.';
    else if (rp) texte = `Au loin, tu reconnais ${rp}, ${COTE[k.sortie]}.`;
    else texte = dehors ? 'Rien, à l’horizon, ne te dit par où continuer.' : 'Rien, au-dessus des toits, ne te dit par où continuer.';
  }
  emit('toast', { texte: genrer(texte), type: 'info' });
}

