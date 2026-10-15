// ============ Dormir — choisir combien de temps, où, et à deux ============
// ouvrirSommeil({ couchage: { type, nom, force } }) : fenêtre de choix (2 h, 4 h, 8 h, jusqu'à l'aube), avec l'état du lieu
// (sûr ou non) et le COUCHAGE (par terre, mauvais, moyen, vrai lit : docs/GAMEPLAY.md §5.7) — sans couchage : par terre.
// Règles (REGLAGES.survie.SOMMEIL) : on ne dort que si la fatigue est < 80 ; impossible si des morts te cherchent ;
// lieu non sûr (porte ouverte, morts dans le lieu) = risque d'intrusion à chaque heure → réveil en sursaut, combat.
// Une pièce dont toutes les portes sont fermées et sans mort dedans est sûre. Le couchage fixe ce qu'on récupère.
// À DEUX : le sommeil se décide ensemble — l'un propose, l'autre accepte (bandeau), et l'horloge file pour les deux,
// tant que les DEUX dorment (REGLAGES.coop.SOMMEIL_COMMUN) : l'hôte, qui tient l'heure, dort heure par heure et envoie
// chaque bloc dormi ; l'invité le dort à son tour et répond. Le premier réveillé (plafond du couchage, intrusion, mort,
// liaison perdue) arrête le sommeil des deux : personne ne compte d'heures que l'autre n'a pas vécues.
import { G, genrer } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { texteHorloge } from './temps_connu.js';
import { el, fmtDuree } from '../core/util.js';
import { REGLAGES } from '../data/reglages.js';
import { dormir, categorieCouchage, commencerRepos, finirRepos } from './survival.js';
import { icase } from '../carte/catalogue.js';
import * as flow from './flow.js';
import { inviter } from '../ui/invitations.js';

const SO = () => REGLAGES.survie.SOMMEIL;
// { proposer(h, id), accepter(h, id), refuser(raison, id), envoyer(msg), hote(), pairNom() } branché par js/net/coop.js ;
// débranché (null) quand la partie à deux s'arrête : ce qui était en cours est abandonné
let coop = null;
export function brancherCoopSommeil(c) { if (!c) abandonnerCommun(); coop = c; }
let enCours = false;
let propose = null;        // ma proposition en attente : { id, heures, couchage, t }
let invitee = null;        // le bandeau d'invitation affiché : { id, repondu, b }
const ATTENTE_ACCORD_MS = 5000, ATTENTE_BLOC_MS = 8000;   // au-delà, l'autre ne répond plus : on se réveille
let suivi = null;          // sommeil à deux en cours : { file, attente, fin, annule, sid }
const nouvelId = () => Math.random().toString(36).slice(2, 10);
// Déjà trop reposé pour ce couchage ? (rien ne s'avance)
const auPlafond = (couchage) => { const e = dormir(0, { force: true, silencieux: true, couchage }); return e && e.ok === false && e.plafond ? e : null; };
// La partie à deux s'arrête (on quitte, la liaison est coupée) : plus de proposition ni de bandeau, et le sommeil commun
// en cours s'interrompt sans plus rien envoyer ni toucher à la partie suivante.
function abandonnerCommun() {
  propose = null;
  if (invitee) { invitee.repondu = true; invitee.h.retirer(); invitee = null; }
  if (suivi) { const s = suivi; suivi = null; s.annule = true; const f = s.attente; s.attente = null; if (f) f(); }
  clock.suspendreDistant(false);
}

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
  // Jusqu'au prochain lever du jour, à la minute près (pile à l'heure du jour : le lendemain, jamais une durée nulle).
  const minAube = ((REGLAGES.temps.HEURES.JOUR * 60 - clock.minutes() % 1440) % 1440 + 1440) % 1440 || 1440;
  const choix = el('div', { class: 'som-choix' });
  const peut = sit.ok && fat < SO().FATIGUE_MAX_POUR_DORMIR;
  for (const [lab, hh] of [['2 h', 2], ['4 h', 4], ['8 h', 8], [`Jusqu’au jour (${fmtDuree(minAube)})`, minAube / 60]]) {
    choix.append(el('button', { class: 'btn', type: 'button', disabled: peut ? null : true, onclick: () => { fermer(); demander(hh, sit, C.categorie); } }, lab));
  }
  boite.append(choix, el('button', { class: 'btn som-annuler', type: 'button', onclick: fermer }, 'Annuler'));
  document.body.append(fen);
}

// ---------- Solo : on dort. Co-op : on propose. ----------
function demander(heures, sit, couchage) {
  if (G.mode !== 'solo' && coop) {
    const pl = auPlafond(couchage);
    if (pl) { emit('toast', { texte: genrer(pl.raison), type: 'info' }); return; }
    propose = { id: nouvelId(), heures, couchage, t: performance.now() };
    coop.proposer(heures, propose.id);
    emit('toast', { texte: `Tu proposes de dormir ${fmtDuree(heures * 60)}. On attend ${coop.pairNom()}.` });
    return;
  }
  executer(heures, sit, couchage);
}
// Le coéquipier propose : bandeau « Dormir aussi ». Sans « oui », il le sait (refus, impossible, pas sommeil, pas de réponse).
// Une proposition plus récente remplace l'ancienne ; chaque réponse porte l'identifiant de SA proposition.
export function invitation(nom, heures, id) {
  const non = (raison) => coop && coop.refuser(raison, id);
  if (enCours) { non('impossible'); return; }
  if (propose && performance.now() - propose.t < 120000) { const h = Math.min(heures, propose.heures); coop && coop.accepter(h, id); lancerApresAccord(h); return; }
  if (invitee) { invitee.repondu = true; invitee.h.retirer(); }
  const inv = { id, repondu: false, b: null, h: null };
  const repondre = () => { if (inv.repondu) return false; inv.repondu = true; inv.h.retirer(); if (invitee === inv) invitee = null; return true; };
  inv.b = el('div', { class: 'som-invite' }, el('span', {}, `${nom} veut dormir ${fmtDuree(heures * 60)}.`),
    el('button', { class: 'btn', type: 'button', onclick: async () => {
      if (!repondre()) return;
      const sit = await situation();
      if (!sit.ok) { emit('toast', { texte: sit.raison, type: 'alerte' }); non('impossible'); return; }
      const pl = auPlafond('sol');
      if (pl) { emit('toast', { texte: genrer(pl.raison), type: 'info' }); non('repose'); return; }
      coop && coop.accepter(heures, id); lancerApresAccord(heures);
    } }, 'Dormir aussi'),
    el('button', { class: 'btn', type: 'button', onclick: () => { if (repondre()) non('refus'); } }, 'Pas maintenant'));
  invitee = inv;
  // affichée quand on peut répondre (pas sous une scène) ; 30 s comptées à l'écran seulement (js/ui/invitations.js)
  inv.h = inviter('sommeil', { element: inv.b, dureeMs: 30000,
    expire: () => { if (repondre()) non('sans_reponse'); },
    abandon: () => { if (repondre()) non('sans_reponse'); },
    masquee: () => coop && coop.envoyer({ t: 'sommeil_attente', id }),
    annule: () => { inv.repondu = true; if (invitee === inv) invitee = null; } });
}
// Mon coéquipier lit une scène : ma proposition l'attend (il la verra à la fin).
export function attenteRecue(nom, id) {
  if (!propose || (id && propose.id !== id)) return;
  propose.t = performance.now();      // l'attente n'est pas un silence : la proposition reste valable
  emit('toast', { texte: `${nom} lit une scène : ta proposition l’attend.` });
}
// Ma proposition n'est pas suivie : on ne dort pas, et on le dit (sinon on attendrait pour rien). Une réponse à une
// ancienne proposition ne touche pas la nouvelle.
export function refusRecu(nom, raison, id) {
  if (!propose || (id && propose.id !== id)) return;
  propose = null;
  const t = raison === 'impossible' ? `${nom} ne peut pas dormir pour l’instant : vous restez éveillés.`
    : raison === 'repose' ? `${nom} n’a pas sommeil : vous restez éveillés.`
    : raison === 'sans_reponse' ? `${nom} n’a pas répondu : vous restez éveillés.`
    : `${nom} ne veut pas dormir maintenant.`;
  emit('toast', { texte: t });
}
// « Dormir aussi » reçu : seulement pour MA proposition en cours (pas une ancienne, pas si l'on dort déjà).
export function accordRecu(heures, id) {
  if (enCours || !propose || (id && propose.id !== id)) return;
  lancerApresAccord(heures);
}
export async function lancerApresAccord(heures) {
  const couchage = (propose && propose.couchage) || 'sol';   // chacun récupère selon son propre couchage
  propose = null;
  // à deux, on écoute l'autre dès l'accord (sa fin ou son premier bloc peuvent arriver avant la fin de ce qui suit) ;
  // l'invité ne suit plus l'heure diffusée : il n'avancera que des blocs que l'hôte a dormis
  if (G && G.mode !== 'solo' && coop && !enCours && !suivi) { suivi = nouveauSuivi(); if (!coop.hote()) clock.suspendreDistant(true); }
  const s = suivi;
  const sit = await situation();
  if (s && (s.annule || s !== suivi)) return;       // la partie à deux s'est arrêtée entre-temps
  executer(heures, sit.ok ? sit : { sur: false, mortsPresents: true, danger: 0.3 }, couchage);
}
const nouveauSuivi = () => ({ file: [], attente: null, fin: false, annule: false, sid: null });
// Messages du sommeil à deux (routés par js/net/coop.js) : bloc dormi par l'hôte, réponse de l'invité, fin.
// Chaque sommeil porte l'identifiant donné par l'hôte (sid) : un message d'un sommeil précédent est ignoré.
export function recuSommeil(m) {
  const s = suivi; if (!s) return;
  if (m.t === 'sommeil_ack') { if (!s.sid || m.sid !== s.sid) return; }
  else if (m.sid) { if (!s.sid) s.sid = m.sid; else if (m.sid !== s.sid) return; }
  s.file.push(m);
  if (m.t === 'sommeil_fin' || (m.t === 'sommeil_ack' && m.fin)) s.fin = true;
  if (s.attente) { const f = s.attente; s.attente = null; f(); }
}
// Le prochain message de ce sommeil (ou null au-delà de ms, ou s'il est abandonné).
function prochain(s, ms) {
  if (!s || s.annule) return Promise.resolve(null);
  if (s.file.length) return Promise.resolve(s.file.shift());
  return new Promise((ok) => {
    const t = setTimeout(() => { s.attente = null; ok(null); }, ms);
    s.attente = () => { clearTimeout(t); ok(!s.annule && s.file.length ? s.file.shift() : null); };
  });
}

// Le sommeil, heure par heure, écran noir qui laisse filer l'horloge.
async function executer(heures, sit, couchage = 'sol') {
  if (enCours || !G) return;
  // la partie et la liaison de CE sommeil : si l'une change (on quitte, on rejoint une autre partie), il s'arrête sans rien toucher
  const g = G, c = coop, aDeux = g.mode !== 'solo' && !!c, hote = aDeux && c.hote();
  if (aDeux && !suivi) { suivi = nouveauSuivi(); if (!hote) clock.suspendreDistant(true); }
  const s = aDeux ? suivi : null;
  const vivant = () => G === g && !(s && s.annule);
  const env = (m) => { if (vivant()) c.envoyer(m); };
  const liberer = () => { if (s && suivi === s) { suivi = null; if (!hote) clock.suspendreDistant(false); } };
  // déjà assez reposé pour ce couchage : on ne s'endort pas (l'horloge ne tourne pas pour rien), et l'autre se réveille
  const pl = auPlafond(couchage);
  if (pl) { emit('toast', { texte: genrer(pl.raison), type: 'info' }); if (aDeux) env({ t: 'sommeil_fin' }); liberer(); return; }
  enCours = true;
  if (hote) s.sid = nouvelId();
  const V = sit.V || null;
  if (V) { V.occupe = true; V.entrees.actif(false); V.canal.majJoueur({ allure: 'immobile' }); }
  const voile = el('div', { class: 'som-voile' }, el('div', { class: 'som-t' }, 'Tu dors…'), el('div', { class: 'som-h' }));
  document.body.append(voile);
  requestAnimationFrame(() => voile.classList.add('on'));
  const majH = () => { voile.lastChild.textContent = texteHorloge(); };
  let interrompu = false, dormi = 0, plafond = false, autre = null, abandon = false;   // autre : 'debout' (l'autre s'est levé) | 'muet'
  const opts = { force: true, silencieux: true, sur: sit.sur, danger: sit.danger, mortsPresents: sit.mortsPresents, couchage, sansCourbatures: true };
  try {
    if (aDeux && !hote) {
      // INVITÉ : il dort les blocs que l'hôte a dormis, et répond après chacun (fin = il se réveille)
      for (;;) {
        const m = await prochain(s, ATTENTE_BLOC_MS);
        if (!vivant()) { abandon = true; break; }
        if (!m) { autre = 'muet'; break; }
        if (m.t === 'sommeil_fin') { if (dormi < Math.round(heures * 60)) autre = 'debout'; break; }   // avant la fin convenue : l'autre s'est levé
        if (m.t !== 'sommeil_bloc' || g.player.mort) continue;
        const r = dormir((m.n || 0) / 60, opts);
        if (!r.ok) { plafond = !!r.plafond; env({ t: 'sommeil_ack', fin: true, sid: s.sid }); break; }
        dormi += r.dormi || 0;
        majH();
        env({ t: 'sommeil_ack', fin: !!(r.interrompu || r.plafond || g.player.mort), sid: s.sid });
        if (r.interrompu) { interrompu = true; break; }
        if (r.plafond) { plafond = true; break; }
      }
    } else {
      await new Promise(r => setTimeout(r, 700));
      // SOLO / HÔTE : heure par heure, le dernier bloc seulement ce qui reste (jusqu'au jour : 7 h 15 = 7 blocs + 15 min)
      for (let reste = Math.round(heures * 60); reste > 0; reste -= 60) {
        if (!vivant()) { abandon = true; break; }
        if (g.player.mort) break;
        if (hote && s.fin) { autre = 'debout'; break; }
        const r = dormir(Math.min(60, reste) / 60, opts);
        if (!r.ok) { plafond = !!r.plafond; break; }
        dormi += r.dormi || 0;
        majH();
        if (hote) env({ t: 'sommeil_bloc', n: r.dormi || 0, sid: s.sid });
        if (r.interrompu) { interrompu = true; break; }
        if (r.plafond) { plafond = true; break; }
        if (hote) {
          // l'invité a-t-il dormi ce bloc, et dort-il encore ?
          const m = await prochain(s, ATTENTE_ACCORD_MS);
          if (!vivant()) { abandon = true; break; }
          if (!m) { autre = 'muet'; break; }
          if (s.fin) { autre = 'debout'; break; }
        }
        await new Promise(r2 => setTimeout(r2, 420));
      }
    }
  } finally {
    if (hote) env({ t: 'sommeil_fin', sid: s.sid });
    liberer();
  }
  voile.classList.remove('on');
  setTimeout(() => voile.remove(), 500);
  enCours = false;
  if (abandon || G !== g) return;      // partie quittée pendant le sommeil : rien d'autre à faire ni à dire
  const cb = finSommeil(couchage, dormi);
  if (V && flow.tempsCourant() === 'exploration') { V.occupe = false; if (!V.enPause) V.entrees.actif(true); }
  const duree = fmtDuree(dormi), f = g.player.fatigue, SE = REGLAGES.survie.SEUILS.fatigue;
  const etat = f < SE.grave ? 'épuisé{|e}' : f < SE.gene ? 'fatigué{|e}' : f < SE.gene + 20 ? 'las{|se}' : null;
  const nom = aDeux ? c.pairNom() : '';
  let texte;
  if (interrompu) texte = 'Tu te réveilles en sursaut.';
  else if (autre === 'muet' && !dormi) texte = `Plus de nouvelles de ${nom} : vous restez éveillés.`;
  else if (autre === 'debout' && !dormi) texte = `${nom} ne dort pas : vous restez éveillés.`;
  else if (plafond && couchage === 'sol' && dormi < 60) texte = 'Le sol est trop dur : impossible de te rendormir.';
  else if (!dormi) texte = 'Tu n’arrives pas à trouver le sommeil.';
  else if (etat) texte = `Tu as dormi ${duree}${ICI[couchage] ? ' ' + ICI[couchage] : ''}. Tu te réveilles encore ${etat}${cb ? ', et {courbaturé|courbaturée}' : ''}.`;
  else texte = `Tu as dormi ${duree}${ICI[couchage] ? ' ' + ICI[couchage] : ''}. ${f < 80 ? 'Tu te sens un peu mieux' : 'Tu te sens {reposé|reposée}'}${cb ? ', mais {courbaturé|courbaturée}' : ''}.`;
  if (dormi && autre === 'debout') texte += ` ${nom} est debout : tu te lèves aussi.`;
  else if (dormi && autre === 'muet') texte += ` Plus de nouvelles de ${nom} : tu te lèves.`;
  emit('toast', { texte: genrer(texte), type: interrompu ? 'mauvais' : 'info' });
}

// ---------- Évanoui (fatigue 0) ----------
// Seul, js/game/survival.js fait dormir 2 h d'un coup. À deux, l'heure appartient aux deux : on reste à terre
// EVANOUI_H heures du temps commun (l'horloge file normalement derrière le voile), on récupère minute par minute comme
// par terre, et l'heure ne saute ni chez soi ni chez l'autre. Quitter la partie ou mourir y met fin.
on('survie:evanoui', () => { if (G && G.mode !== 'solo') evanouiADeux(); });
async function evanouiADeux() {
  if (enCours || !G) return;
  const g = G, fin = clock.minutes() + Math.round(REGLAGES.survie.EFFETS.EVANOUI_H * 60);
  enCours = true;
  // la marque « déjà évanoui » ne sert qu'au saut d'un coup : ici, on est à terre (enCours) ; si l'on quitte avant de
  // reprendre connaissance, on retombera en revenant (sinon, sauvé avec la marque, on ne s'effondrerait plus jamais)
  g.player._evanoui = false;
  const vue = await import('../explore/vue.js');
  const V = vue.etatDebug();
  if (V && !V.arene) { V.occupe = true; V.entrees.actif(false); V.canal.majJoueur({ allure: 'immobile' }); }
  commencerRepos('sol');
  const voile = el('div', { class: 'som-voile' }, el('div', { class: 'som-t' }, 'Tu as perdu connaissance…'), el('div', { class: 'som-h' }));
  document.body.append(voile);
  requestAnimationFrame(() => voile.classList.add('on'));
  await new Promise((ok) => {
    const t = setInterval(() => {
      const fini = G !== g || g.player.mort || !coop || clock.minutes() >= fin;
      if (!fini) voile.lastChild.textContent = texteHorloge();
      if (fini) { clearInterval(t); ok(); }
    }, 500);
  });
  finirRepos();
  voile.classList.remove('on');
  setTimeout(() => voile.remove(), 500);
  enCours = false;
  if (G !== g || g.player.mort || !coop) return;      // partie quittée : on ne se réveille pas devant l'écran titre
  if (V && !V.arene && vue.etatDebug() === V && flow.tempsCourant() === 'exploration') { V.occupe = false; if (!V.enPause) V.entrees.actif(true); }
  emit('toast', { texte: 'Tu reprends connaissance, à même le sol.', type: 'info' });
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
