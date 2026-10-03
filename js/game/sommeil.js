// ============ Dormir — choisir combien de temps, où, et à deux ============
// ouvrirSommeil({ lit }) : fenêtre de choix (2 h, 4 h, 8 h, jusqu'à l'aube), avec l'état du lieu (sûr ou non).
// Règles (REGLAGES.survie.SOMMEIL) : on ne dort que si la fatigue est < 80 ; impossible si des morts te cherchent ;
// lieu non sûr (porte ouverte, morts dans le lieu) = risque d'intrusion à chaque heure → réveil en sursaut, combat.
// Une pièce dont toutes les portes sont fermées et sans mort dedans est sûre. Un lit : sommeil plus réparateur.
// À DEUX : le sommeil se décide ensemble — l'un propose, l'autre accepte (bandeau), et l'horloge file pour les deux.
import { G } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el } from '../core/util.js';
import { REGLAGES } from '../data/reglages.js';
import { dormir } from './survival.js';
import * as flow from './flow.js';

const SO = () => REGLAGES.survie.SOMMEIL;
let coop = null;           // { proposer(h), accepter(h), pairNom() } branché par js/net/coop.js
export function brancherCoopSommeil(c) { coop = c; }
let enCours = false, propose = null;

// ---------- Où suis-je ? Est-ce sûr ? ----------
async function situation() {
  const vue = await import('../explore/vue.js');
  const V = vue.etatDebug();
  if (!V || V.arene) return { ok: false, raison: flow.tempsCourant() === 'exploration' ? 'Pas ici.' : 'Il faut être à l’abri, dans un lieu, pour dormir.' };
  const j = V.j, E = V.E;
  const chasse = V.zListe.some(z => z.etage === j.etage && (z.etat === 'chasse' || (z.etat === 'alerte' && z.alerte > 0.4)));
  if (chasse) return { ok: false, raison: 'Impossible : des morts te cherchent.' };
  const pid = E.piece[Math.floor(j.y) * E.w + Math.floor(j.x)];
  const P = pid >= 0 ? V.niveau.pieces[pid] : null;
  let sur = !!(V.L && V.L.refuge);
  let raisonRisque = '';
  if (!sur && P && !P.exterieur) {
    // toutes les portes qui donnent sur la pièce sont fermées ?
    let ouvertes = 0;
    for (const p of V.niveau.portes) {
      if (p.etage !== E.id) continue;
      let touche = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = p.x + dx, y = p.y + dy; if (x >= 0 && y >= 0 && x < E.w && y < E.h && E.piece[y * E.w + x] === pid) touche = true; }
      if (!touche) continue;
      const s = V.snap.portes[p.cle];
      if (!s || s.etat === 'ouverte' || s.etat === 'cassee') ouvertes++;
    }
    const mortsIci = V.zListe.some(z => z.etage === j.etage && E.piece[Math.floor(z.y) * E.w + Math.floor(z.x)] === pid);
    sur = ouvertes === 0 && !mortsIci;
    raisonRisque = mortsIci ? 'un mort est dans la pièce' : ouvertes ? `${ouvertes} porte${ouvertes > 1 ? 's' : ''} ouverte${ouvertes > 1 ? 's' : ''}` : '';
  } else if (!sur) raisonRisque = 'dehors, à découvert';
  const mortsPresents = V.zListe.length > 0;
  return { ok: true, sur, raisonRisque, mortsPresents, danger: (V.L && V.L.danger) || 0.3, V };
}

// ---------- La fenêtre ----------
let fen = null;
export async function ouvrirSommeil({ lit = false } = {}) {
  if (enCours || fen || !G) return;
  const p = G.player;
  const sit = await situation();
  const fermer = () => { if (fen) { fen.remove(); fen = null; } };
  fen = el('div', { class: 'som-fond', onclick: (e) => { if (e.target === fen) fermer(); } });
  const boite = el('div', { class: 'som-boite', role: 'dialog', 'aria-label': 'Dormir' });
  fen.append(boite);
  boite.append(el('h3', {}, lit ? 'Dormir dans le lit' : 'Dormir'));
  const fat = Math.round(p.fatigue ?? 100);
  boite.append(el('p', { class: 'som-etat' }, `Fatigue : ${fat}/100 ${fat >= 80 ? '— tu n’as pas sommeil' : fat < 25 ? '— tu tombes de sommeil' : ''}`));
  if (!sit.ok) boite.append(el('p', { class: 'som-alerte' }, sit.raison));
  else boite.append(el('p', { class: sit.sur ? 'som-sur' : 'som-alerte' }, sit.sur ? 'Lieu sûr : portes fermées, rien ici.' : `Lieu exposé (${sit.raisonRisque || 'des morts rôdent'}) : tu risques d’être {surpris|surprise}. Ferme les portes, ou barricade-toi.`.replace('{surpris|surprise}', p.genre === 'f' ? 'surprise' : 'surpris')));
  if (G.mode !== 'solo') boite.append(el('p', { class: 'som-coop' }, `À deux, vous dormez ensemble : ${coop ? coop.pairNom() : 'ton coéquipier'} doit accepter.`));
  const h = clock.heureDecimale();
  const jusquAube = Math.round(((REGLAGES.temps.HEURES.JOUR - h + 24) % 24) || 8);
  const choix = el('div', { class: 'som-choix' });
  const peut = sit.ok && fat < SO().FATIGUE_MAX_POUR_DORMIR;
  for (const [lab, hh] of [['2 h', 2], ['4 h', 4], ['8 h', 8], [`Jusqu’au jour (${jusquAube} h)`, jusquAube]]) {
    choix.append(el('button', { class: 'btn', type: 'button', disabled: peut ? null : true, onclick: () => { fermer(); demander(hh, sit, lit); } }, lab));
  }
  boite.append(choix, el('button', { class: 'btn som-annuler', type: 'button', onclick: fermer }, 'Annuler'));
  document.body.append(fen);
}

// ---------- Solo : on dort. Co-op : on propose. ----------
function demander(heures, sit, lit) {
  if (G.mode !== 'solo' && coop) {
    propose = { heures, lit, t: performance.now() };
    coop.proposer(heures);
    emit('toast', { texte: `Tu proposes de dormir ${heures} h. On attend ${coop.pairNom()}.` });
    return;
  }
  executer(heures, sit, lit);
}
// Le coéquipier propose : bandeau « Dormir aussi ».
export function invitation(nom, heures) {
  if (propose && performance.now() - propose.t < 120000) { const h = Math.min(heures, propose.heures); coop && coop.accepter(h); lancerApresAccord(h); return; }
  const b = el('div', { class: 'som-invite' }, el('span', {}, `${nom} veut dormir ${heures} h.`),
    el('button', { class: 'btn', type: 'button', onclick: async () => { b.remove(); const sit = await situation(); if (!sit.ok) { emit('toast', { texte: sit.raison, type: 'alerte' }); return; } coop && coop.accepter(heures); lancerApresAccord(heures); } }, 'Dormir aussi'),
    el('button', { class: 'btn', type: 'button', onclick: () => b.remove() }, 'Pas maintenant'));
  document.body.append(b);
  setTimeout(() => b.remove(), 30000);
}
export async function lancerApresAccord(heures) {
  const sit = await situation();
  propose = null;
  executer(heures, sit.ok ? sit : { sur: false, mortsPresents: true, danger: 0.3 }, false);
}

// Le sommeil, heure par heure, écran noir qui laisse filer l'horloge.
async function executer(heures, sit, lit) {
  if (enCours || !G) return;
  enCours = true;
  const V = sit.V || null;
  if (V) { V.occupe = true; V.entrees.actif(false); V.canal.majJoueur({ allure: 'immobile' }); }
  const voile = el('div', { class: 'som-voile' }, el('div', { class: 'som-t' }, 'Tu dors…'), el('div', { class: 'som-h' }));
  document.body.append(voile);
  requestAnimationFrame(() => voile.classList.add('on'));
  const majH = () => { voile.lastChild.textContent = clock.texteHeure(); };
  await new Promise(r => setTimeout(r, 700));
  let interrompu = false, dormi = 0;
  const fatAvant = G.player.fatigue;
  for (let k = 0; k < heures && G && !G.player.mort; k++) {
    const r = dormir(1, { force: true, silencieux: true, sur: sit.sur, danger: sit.danger, mortsPresents: sit.mortsPresents });
    dormi += r.dormi || 0;
    if (lit) G.player.fatigue = Math.min(100, G.player.fatigue + 4);   // un vrai lit : plus réparateur
    majH();
    if (r.interrompu) { interrompu = true; break; }
    if (G.player.fatigue >= 99.5) break;
    await new Promise(r2 => setTimeout(r2, 420));
  }
  voile.classList.remove('on');
  setTimeout(() => voile.remove(), 500);
  enCours = false;
  if (V && flow.tempsCourant() === 'exploration') { V.occupe = false; if (!V.enPause) V.entrees.actif(true); }
  emit('toast', { texte: interrompu ? 'Tu te réveilles en sursaut.' : `Tu as dormi ${Math.round(dormi / 60)} h. Fatigue ${Math.round(fatAvant)} → ${Math.round(G.player.fatigue)}.`, type: interrompu ? 'mauvais' : 'info' });
}

// Intrusion pendant le sommeil : des morts entrent, tu te bats (surpris sans piège sonore).
on('survie:intrusion', ({ surprise } = {}) => {
  setTimeout(() => {
    if (!G || flow.tempsCourant() !== 'exploration') return;
    import('../explore/vue.js').then(vue => {
      const V = vue.etatDebug(); if (!V) return;
      const pool = (V.L && V.L.pool) || V.niveau.pool || ['errant'];
      const n = Math.random() < 0.4 ? 2 : 1;
      flow.combattre({ zombies: Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]), surprise: surprise || 'surpris' });
    });
  }, 600);
});
