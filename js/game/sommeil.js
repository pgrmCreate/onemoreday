// ============ Dormir — choisir combien de temps, où, et à deux ============
// ouvrirSommeil({ couchage: { type, nom, force } }) : fenêtre de choix (2 h, 4 h, 8 h, jusqu'à l'aube), avec l'état du lieu
// (sûr ou non) et le COUCHAGE (par terre, mauvais, moyen, vrai lit : docs/GAMEPLAY.md §5.7) — sans couchage : par terre.
// Règles (REGLAGES.survie.SOMMEIL) : on ne dort que si la fatigue est < 80 ; impossible si des morts te cherchent ;
// lieu non sûr (porte ouverte, morts dans le lieu) = risque d'intrusion à chaque heure → réveil en sursaut, combat.
// Une pièce dont toutes les portes sont fermées et sans mort dedans est sûre. Le couchage fixe ce qu'on récupère.
// À DEUX : le sommeil se décide ensemble — l'un propose, l'autre accepte (bandeau), et l'horloge file pour les deux.
import { G, genrer } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { texteHorloge } from './temps_connu.js';
import { el } from '../core/util.js';
import { REGLAGES } from '../data/reglages.js';
import { dormir, categorieCouchage } from './survival.js';
import { icase } from '../carte/catalogue.js';
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
  const ij = icase(E, j.x, j.y), pid = ij >= 0 ? E.piece[ij] : -1;
  const P = pid >= 0 ? V.niveau.pieces[pid] : null;
  let sur = !!(V.L && V.L.refuge);
  let raisonRisque = '';
  if (!sur && P && !P.exterieur) {
    // toutes les portes qui donnent sur la pièce sont fermées ?
    let ouvertes = 0;
    for (const p of V.niveau.portes) {
      if (p.etage !== E.id) continue;
      if (!(p.pieces || []).includes(pid)) continue;
      const s = V.snap.portes[p.cle];
      if (!s || s.etat === 'ouverte' || s.etat === 'cassee') ouvertes++;
    }
    const mortsIci = V.zListe.some(z => { if (z.etage !== j.etage) return false; const i = icase(E, z.x, z.y); return i >= 0 && E.piece[i] === pid; });

    sur = ouvertes === 0 && !mortsIci;
    raisonRisque = mortsIci ? 'un mort est dans la pièce' : ouvertes ? `${ouvertes} porte${ouvertes > 1 ? 's' : ''} ouverte${ouvertes > 1 ? 's' : ''}` : '';
  } else if (!sur) raisonRisque = 'dehors, à découvert';
  const mortsPresents = V.zListe.length > 0;
  return { ok: true, sur, raisonRisque, mortsPresents, danger: (V.L && V.L.danger) || 0.3, V };
}

// ---------- Le couchage ----------
const maj1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function texteCouchage(C, avecSac) {
  if (C.categorie === 'sol') return 'Par terre. Tu dormiras mal : tu ne seras pas vraiment {reposé|reposée}, et tu te réveilleras {courbaturé|courbaturée}.';
  if (C.categorie === 'mauvais') return `${C.nom ? maj1(C.nom) : 'Ce couchage'} : on y dort mal. Tu ne récupéreras pas complètement.`;
  if (C.categorie === 'moyen') return avecSac ? `${C.nom ? maj1(C.nom) + ', dans ton sac de couchage' : 'Par terre, dans ton sac de couchage'} : ça ira pour une nuit.` : `${C.nom ? maj1(C.nom) : 'Ce couchage'} : ça ira pour une nuit.`;
  return 'Un vrai lit : tu récupéreras bien.';
}
const ICI = { sol: 'par terre', mauvais: 'sur un mauvais couchage', moyen: '', correct: 'dans un vrai lit' };

// ---------- La fenêtre ----------
let fen = null;
export async function ouvrirSommeil({ couchage = null } = {}) {
  if (enCours || fen || !G) return;
  const p = G.player;
  const sit = await situation();
  const type = couchage && couchage.type, force = couchage && couchage.force;
  const sansSac = force || (type && REGLAGES.survie.SOMMEIL.COUCHAGES[type]) || 'sol';
  const C = { categorie: categorieCouchage(type, force), nom: (couchage && couchage.nom) || null };
  const avecSac = C.categorie === 'moyen' && (sansSac === 'sol' || sansSac === 'mauvais');
  const fermer = () => { if (fen) { fen.remove(); fen = null; } };
  fen = el('div', { class: 'som-fond', onclick: (e) => { if (e.target === fen) fermer(); } });
  const boite = el('div', { class: 'som-boite', role: 'dialog', 'aria-label': 'Dormir' });
  fen.append(boite);
  boite.append(el('h3', {}, C.nom ? `Dormir : ${C.nom}` : 'Dormir'));
  const fat = Math.round(p.fatigue ?? 100);
  boite.append(el('p', { class: 'som-etat' }, `Fatigue : ${fat}/100 ${fat >= 80 ? '— tu n’as pas sommeil' : fat < 25 ? '— tu tombes de sommeil' : ''}`));
  boite.append(el('p', { class: 'som-couchage som-' + C.categorie }, genrer(texteCouchage(C, avecSac))));
  if (!sit.ok) boite.append(el('p', { class: 'som-alerte' }, sit.raison));
  else boite.append(el('p', { class: sit.sur ? 'som-sur' : 'som-alerte' }, sit.sur ? 'Lieu sûr : portes fermées, rien ici.' : `Lieu exposé (${sit.raisonRisque || 'des morts rôdent'}) : tu risques d’être {surpris|surprise}. Ferme les portes, ou barricade-toi.`.replace('{surpris|surprise}', p.genre === 'f' ? 'surprise' : 'surpris')));
  if (G.mode !== 'solo') boite.append(el('p', { class: 'som-coop' }, `À deux, vous dormez ensemble : ${coop ? coop.pairNom() : 'ton coéquipier'} doit accepter.`));
  const h = clock.heureDecimale();
  const jusquAube = Math.round(((REGLAGES.temps.HEURES.JOUR - h + 24) % 24) || 8);
  const choix = el('div', { class: 'som-choix' });
  const peut = sit.ok && fat < SO().FATIGUE_MAX_POUR_DORMIR;
  for (const [lab, hh] of [['2 h', 2], ['4 h', 4], ['8 h', 8], [`Jusqu’au jour (${jusquAube} h)`, jusquAube]]) {
    choix.append(el('button', { class: 'btn', type: 'button', disabled: peut ? null : true, onclick: () => { fermer(); demander(hh, sit, C.categorie); } }, lab));
  }
  boite.append(choix, el('button', { class: 'btn som-annuler', type: 'button', onclick: fermer }, 'Annuler'));
  document.body.append(fen);
}

// ---------- Solo : on dort. Co-op : on propose. ----------
function demander(heures, sit, couchage) {
  if (G.mode !== 'solo' && coop) {
    propose = { heures, couchage, t: performance.now() };
    coop.proposer(heures);
    emit('toast', { texte: `Tu proposes de dormir ${heures} h. On attend ${coop.pairNom()}.` });
    return;
  }
  executer(heures, sit, couchage);
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
  const couchage = (propose && propose.couchage) || 'sol';   // chacun récupère selon son propre couchage
  propose = null;
  executer(heures, sit.ok ? sit : { sur: false, mortsPresents: true, danger: 0.3 }, couchage);
}

// Le sommeil, heure par heure, écran noir qui laisse filer l'horloge.
async function executer(heures, sit, couchage = 'sol') {
  if (enCours || !G) return;
  // déjà assez reposé pour ce couchage : on ne s'endort pas (l'horloge ne tourne pas pour rien)
  const essai = dormir(0, { force: true, silencieux: true, couchage });
  if (essai && essai.ok === false && essai.plafond) { emit('toast', { texte: genrer(essai.raison), type: 'info' }); return; }
  enCours = true;
  const V = sit.V || null;
  if (V) { V.occupe = true; V.entrees.actif(false); V.canal.majJoueur({ allure: 'immobile' }); }
  const voile = el('div', { class: 'som-voile' }, el('div', { class: 'som-t' }, 'Tu dors…'), el('div', { class: 'som-h' }));
  document.body.append(voile);
  requestAnimationFrame(() => voile.classList.add('on'));
  const majH = () => { voile.lastChild.textContent = texteHorloge(); };
  await new Promise(r => setTimeout(r, 700));
  let interrompu = false, dormi = 0, plafond = false;
  for (let k = 0; k < heures && G && !G.player.mort; k++) {
    const r = dormir(1, { force: true, silencieux: true, sur: sit.sur, danger: sit.danger, mortsPresents: sit.mortsPresents, couchage, sansCourbatures: true });
    if (!r.ok) { plafond = !!r.plafond; break; }
    dormi += r.dormi || 0;
    majH();
    if (r.interrompu) { interrompu = true; break; }
    if (r.plafond) { plafond = true; break; }
    await new Promise(r2 => setTimeout(r2, 420));
  }
  const cb = finSommeil(couchage, dormi);
  voile.classList.remove('on');
  setTimeout(() => voile.remove(), 500);
  enCours = false;
  if (V && flow.tempsCourant() === 'exploration') { V.occupe = false; if (!V.enPause) V.entrees.actif(true); }
  const h = Math.max(1, Math.round(dormi / 60)), f = G.player.fatigue, SE = REGLAGES.survie.SEUILS.fatigue;
  const etat = f < SE.grave ? 'épuisé{|e}' : f < SE.gene ? 'fatigué{|e}' : f < SE.gene + 20 ? 'las{|se}' : null;
  let texte;
  if (interrompu) texte = 'Tu te réveilles en sursaut.';
  else if (plafond && couchage === 'sol' && dormi < 60) texte = 'Le sol est trop dur : impossible de te rendormir.';
  else if (etat) texte = `Tu as dormi ${h} h${ICI[couchage] ? ' ' + ICI[couchage] : ''}. Tu te réveilles encore ${etat}${cb ? ', et {courbaturé|courbaturée}' : ''}.`;
  else texte = `Tu as dormi ${h} h${ICI[couchage] ? ' ' + ICI[couchage] : ''}. ${f < 80 ? 'Tu te sens un peu mieux' : 'Tu te sens {reposé|reposée}'}${cb ? ', mais {courbaturé|courbaturée}' : ''}.`;
  emit('toast', { texte: genrer(texte), type: interrompu ? 'mauvais' : 'info' });
}
// Les courbatures (mal dormi), posées une fois au réveil selon le temps passé sur ce couchage.
function finSommeil(couchage, dormi) {
  const cb = (REGLAGES.survie.SOMMEIL.COUCHAGE[couchage] || {}).courbatures, p = G && G.player;
  if (!cb || !p || dormi < cb.apresH * 60) return false;
  p.effets.douleurAigueV = Math.max((p.effets.douleurAigue || 0) > 0 ? p.effets.douleurAigueV || 0 : 0, cb.douleur);
  p.effets.douleurAigue = Math.max(p.effets.douleurAigue || 0, cb.min);
  p.effets.courbatures = cb.min; p.effets.courbaturesSta = cb.regenSta;
  emit('survie', {});
  return true;
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
