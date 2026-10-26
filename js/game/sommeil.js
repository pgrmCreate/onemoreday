// ============ Dormir — réveil naturel ou alarme de montre digitale, seul ou à deux ============
// ouvrirSommeil({ couchage: { type, nom, force } }) : réveil naturel et alarme si équipée, avec l'état du lieu
// (sûr ou non) et le COUCHAGE (par terre, mauvais, moyen, vrai lit : docs/GAMEPLAY.md §5.7) — sans couchage : par terre.
// Règles (REGLAGES.survie.SOMMEIL) : on ne dort que si la fatigue est < 80 ; impossible si des morts te cherchent ;
// lieu non sûr (porte ouverte, morts dans le lieu) = risque d'intrusion à chaque heure → réveil en sursaut, combat.
// Une pièce dont toutes les portes sont fermées et sans mort dedans est sûre. Le couchage fixe ce qu'on récupère.
// À DEUX : le sommeil se décide ensemble — l'un propose, l'autre accepte (bandeau), et l'horloge file pour les deux,
// tant que les DEUX dorment (REGLAGES.coop.SOMMEIL_COMMUN) : l'hôte, qui tient l'heure, dort heure par heure et envoie
// chaque bloc dormi ; l'invité le dort à son tour et répond. Le premier réveillé (plafond du couchage, intrusion, mort,
// liaison perdue) arrête le sommeil des deux : personne ne compte d'heures que l'autre n'a pas vécues.
import { G, genrer, getFlag } from '../core/state.js';
import { refugeHabite, pieceProtegee, condition } from '../explore/refuge.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { texteHorloge, heureConnue, momentVague } from './temps_connu.js';
import { el, fmtDuree } from '../core/util.js';
import { REGLAGES } from '../data/reglages.js';
import { dormir, categorieCouchage, commencerRepos, finirRepos } from './survival.js';
import { icase } from '../carte/catalogue.js';
import * as flow from './flow.js';
import { inviter } from '../ui/invitations.js';
import { aUneAlarme, planNaturel, planSommeil, premierReveil, prochaineAlarme, minutesRepos, bruitSommeil, mortAudible, PHRASES_REVEIL } from './sommeil_regles.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import { intensiteRuee } from './ruees.js';
import { ligneLibre, obstaclesSon } from '../explore/physique.js';
import { CONSTRUCTIONS, tailleConstruction } from '../data/construction.js';

const SO = () => REGLAGES.survie.SOMMEIL;
// { proposer(plan, id), accepter(plan, id), refuser(raison, id), envoyer(msg), hote(), pairNom() } branché par js/net/coop.js ;
// débranché (null) quand la partie à deux s'arrête : ce qui était en cours est abandonné
let coop = null;
export function brancherCoopSommeil(c) { if (!c) abandonnerCommun(); coop = c; }
let enCours = false;
let propose = null;        // ma proposition en attente : { id, plan: { alarme, regleePar }, couchage, t }
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
  if (alarmeProche(V)) return { ok: false, raison: 'Impossible de dormir avec cette alarme qui hurle tout près.', V };
  const chasse = V.zListe.some(z => z.etage === j.etage && (z.etat === 'chasse' || (z.etat === 'alerte' && z.alerte > 0.4)));
  if (chasse) return { ok: false, raison: 'Impossible : des morts te cherchent.' };
  const ij = icase(E, j.x, j.y), pid = ij >= 0 ? E.piece[ij] : -1;
  const P = pid >= 0 ? V.niveau.pieces[pid] : null;
  // un refuge habité (js/explore/refuge.js) protège ses pièces sansMorts — pas la montée dehors ; au siège, il ne protège plus
  let sur = !!(V.L && V.L.refuge) || (refugeHabite(V.niveau, getFlag) && pieceProtegee(V.niveau, { etage: j.etage, x: j.x, y: j.y }));
  // un camp où quelqu'un veille (le plan : veille { si, x, y, rayon }) : dehors, mais on dort en sûreté près de lui
  const ve = V.niveau.veille;
  if (!sur && ve && condition(ve.si, getFlag) && Math.hypot(j.x - ve.x, j.y - ve.y) <= ve.rayon) sur = true;
  let raisonRisque = '';
  if (!sur && P && !P.exterieur) {
    // Les pièces qu'on atteint depuis la sienne par des portes ouvertes forment l'abri : une porte ouverte sur un cabinet
    // de toilettes fermé, ou sur la chambre voisine dont la porte est close, ne laisse rien entrer. Seule compte une porte
    // ouverte qui mène dehors (ou vers une pièce qui donne dehors), et un mort dans l'abri.
    const ouverte = (p) => { const s = V.snap.portes[p.cle]; return !s || s.etat === 'ouverte' || s.etat === 'cassee'; };
    const abri = new Set([pid]), file = [pid];
    let ouvertes = 0;
    while (file.length) {
      const q = file.shift();
      for (const p of V.niveau.portes) {
        if (p.etage !== E.id || !(p.pieces || []).includes(q) || !ouverte(p)) continue;
        const autres = p.pieces.filter(r => r !== q);
        if (p.exterieure || !autres.length) { ouvertes++; continue; }
        for (const r of autres) {
          if (abri.has(r)) continue;
          const R = V.niveau.pieces[r];
          if (!R || R.exterieur) { ouvertes++; continue; }
          abri.add(r); file.push(r);
        }
      }
    }
    const mortsIci = V.zListe.some(z => { if (z.etage !== j.etage) return false; const i = icase(E, z.x, z.y); return i >= 0 && abri.has(E.piece[i]); });

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

// L'invité n'a pas ouvert la fenêtre : chercher le couchage réellement à sa portée, sans traverser un mur.
function couchageIci(V) {
  const p = G.player;
  if (!V) return { categorie: categorieCouchage(null, null, p), nom: null };
  const j = V.j, E = V.E, opaque = V.canal.grilles?.(E.id).opaque || E.opaque;
  const candidats = [];
  for (const m of V.niveau.meubles) {
    if (m.etage !== j.etage || V.retires?.has(m.cle)) continue;
    if (!SO().COUCHAGES[m.type] && !m.rendu?.couchage) continue;
    candidats.push({ type: m.type, force: m.rendu?.couchage, nom: m.nom, x: m.x0, y: m.y0, w: m.x1 + 1 - m.x0, h: m.y1 + 1 - m.y0 });
  }
  for (const c of V.snap?.constructions || []) {
    if (c.etage !== j.etage || c.pv <= 0 || !SO().COUCHAGES[c.type]) continue;
    const [w, h] = tailleConstruction(c.type, c.rot);
    candidats.push({ ...c, w, h, nom: CONSTRUCTIONS[c.type]?.nom });
  }
  let meilleur = null, distance = 1.5;
  for (const m of candidats) {
    const x = Math.max(m.x + 0.05, Math.min(j.x, m.x + m.w - 0.05));
    const y = Math.max(m.y + 0.05, Math.min(j.y, m.y + m.h - 0.05));
    const d = Math.hypot(j.x - x, j.y - y);
    if (d <= distance && ligneLibre(E.w, E.h, opaque, j.x, j.y, x, y)) { meilleur = m; distance = d; }
  }
  return { categorie: categorieCouchage(meilleur?.type, meilleur?.force, p), nom: meilleur?.nom || null };
}

function alarmeProche(V) {
  return !!V && (V.snap?.alarmes || []).some(a => a.reste > 0 && a.etage === V.j.etage && Math.hypot(a.x - V.j.x, a.y - V.j.y) <= SO().BRUIT.RAYON * 2);
}

// ---------- Ambiance réellement audible depuis le couchage ----------
function ambianceSommeil(sit) {
  const V = sit.V;
  if (!V) return bruitSommeil();
  const j = V.j, R = SO().BRUIT.RAYON;
  const i = icase(V.E, j.x, j.y), piece = i >= 0 ? V.niveau.pieces[V.E.piece[i]] : null;
  const abrite = !!piece && !piece.exterieur;
  const bloque = V.canal.grilles?.(V.E.id).bloque || V.E.bloque;
  const morts = (V.zListe || []).filter(z => z.etage === j.etage && mortAudible(z) && Math.hypot(z.x-j.x, z.y-j.y) <= R)
    .reduce((n, z) => { const o = obstaclesSon(V.E, bloque, j.x, j.y, z.x, z.y, {}); return n + Math.pow(0.25, o.murs) * Math.pow(0.5, o.portes); }, 0);
  return bruitSommeil({ morts: morts >= 0.1 ? morts : 0, alarme: alarmeProche(V),
    ruee: intensiteRuee(V.lieuId) > 0, meteo: meteoCourante(), abrite });
}
const heureAlarme = t => `${String(Math.floor(t % 1440 / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
function texteProjet(plan) {
  if (plan.alarme == null) return 'jusqu’au réveil naturel';
  return heureConnue() ? `avec une alarme à ${heureAlarme(plan.alarme)}` : 'jusqu’à ce que la montre de ton coéquipier sonne';
}

// ---------- La fenêtre ----------
let fen = null;
export async function ouvrirSommeil({ couchage = null } = {}) {
  if (enCours || fen || !G) return;
  const g = G, sit = await situation();
  if (G !== g || fen || enCours) return;
  const p = g.player, type = couchage?.type, force = couchage?.force;
  const sansSac = force || (type && SO().COUCHAGES[type]) || 'sol';
  const C = couchage ? { categorie: categorieCouchage(type, force), nom: couchage.nom || null } : couchageIci(sit.V);
  const avecSac = C.categorie === 'moyen' && (sansSac === 'sol' || sansSac === 'mauvais');
  const fermer = () => { if (fen) { fen.remove(); fen = null; } };
  fen = el('div', { class: 'som-fond', onclick: e => { if (e.target === fen) fermer(); } });
  const boite = el('div', { class: 'som-boite', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Dormir' });
  fen.append(boite);
  const fat = Math.round(p.fatigue ?? 100), ambiance = ambianceSommeil(sit);
  boite.append(el('h3', {}, C.nom ? `Dormir : ${C.nom}` : 'Dormir'),
    el('p', { class: 'som-etat' }, fat >= SO().FATIGUE_MAX_POUR_DORMIR ? 'Tu n’as pas sommeil.' : fat < 25 ? 'Tu tombes de sommeil.' : 'Tu as besoin de dormir.'),
    el('p', { class: 'som-couchage som-' + C.categorie }, genrer(texteCouchage(C, avecSac))));
  boite.append(el('p', { class: !sit.ok || !sit.sur ? 'som-alerte' : 'som-sur' }, !sit.ok ? sit.raison : sit.sur
    ? 'Tu es à l’abri.' : `Le lieu est exposé (${sit.raisonRisque || 'des morts rôdent'}). Ferme les portes ou barricade-toi.`));
  boite.append(el('p', {}, ambiance.sources.length ? `Tu entends ${ambiance.sources.join(' et ')}. Ton sommeil risque d’être haché.` : 'Les alentours sont calmes.'));
  boite.append(el('p', {}, 'Sans alarme, tu dors jusqu’à ne plus pouvoir récupérer sur ce couchage.'));
  if (G.mode !== 'solo') boite.append(el('p', { class: 'som-coop' }, 'Vous devez accepter de dormir ensemble. Le premier réveillé réveille l’autre.'));
  const peut = sit.ok && fat < SO().FATIGUE_MAX_POUR_DORMIR;
  const lancer = async plan => {
    if (G !== g) { fermer(); return; }
    if (plan.alarme != null && !aUneAlarme(p)) { erreur.textContent = 'Enfile ta montre digitale pour régler une alarme.'; return; }
    const frais = await situation();
    if (G !== g || enCours) return;
    if (!frais.ok) { erreur.textContent = frais.raison; return; }
    if (p.fatigue >= SO().FATIGUE_MAX_POUR_DORMIR) { erreur.textContent = 'Tu n’as plus sommeil.'; return; }
    fermer(); demander(plan, frais, C.categorie);
  };
  const erreur = el('p', { class: 'som-alerte', role: 'status' });
  const choix = el('div', { class: 'som-choix som-naturel' }, el('button', { class: 'btn', type: 'button', disabled: peut ? null : true,
    onclick: () => lancer(planNaturel()) }, 'Dormir jusqu’au réveil'));
  boite.append(choix);
  if (aUneAlarme(p)) {
    const saisie = el('select', { id: 'som-alarme', 'aria-label': 'Heure de l’alarme' });
    for (let t = 0; t < 1440; t += 15) saisie.append(el('option', { value: heureAlarme(t) }, heureAlarme(t)));
    saisie.value = '07:00';
    const apercu = el('p', { class: 'som-etat' });
    const maj = () => { const t = prochaineAlarme(saisie.value, clock.minutes()); apercu.textContent = t == null ? 'Choisis une alarme dans au moins 15 minutes.' : `La montre sonnera à ${saisie.value}, dans ${fmtDuree(t - clock.minutes())}.`; };
    saisie.addEventListener('change', maj); maj();
    const bouton = el('button', { class: 'btn', type: 'button', disabled: peut ? null : true, onclick: () => {
      const t = prochaineAlarme(saisie.value, clock.minutes());
      if (t == null) { erreur.textContent = 'Choisis une alarme dans au moins 15 minutes.'; return; }
      lancer({ alarme: t, regleePar: nouvelId() });
    } }, 'Dormir avec l’alarme');
    boite.append(el('div', { class: 'som-reglage' }, el('label', { for: 'som-alarme' }, 'Alarme de ta montre'), saisie, apercu, bouton));
  } else boite.append(el('p', { class: 'som-etat' }, 'Seule une montre digitale portée permet de régler une alarme.'));
  boite.append(erreur, el('button', { class: 'btn som-annuler', type: 'button', onclick: fermer }, 'Annuler'));
  document.body.append(fen);
}

// Le plan commun transporte une minute absolue (ou null), jamais Infinity ni une durée libre sans montre.
function demander(plan, sit, couchage) {
  plan = planSommeil(plan);
  if (plan.alarme != null && !aUneAlarme(G.player)) return;
  const pl = auPlafond(couchage);
  if (pl) { emit('toast', { texte: genrer(pl.raison), type: 'info' }); return; }
  if (G.mode !== 'solo' && coop) {
    propose = { id: nouvelId(), plan, couchage, t: performance.now() };
    coop.proposer(plan, propose.id);
    emit('toast', { texte: `Tu proposes de dormir ${texteProjet(plan)}. On attend ${coop.pairNom()}.` });
  } else executer(plan, sit, couchage, plan.alarme != null);
}
export function invitation(nom, offre, id) {
  const plan = planSommeil(offre), non = raison => coop && coop.refuser(raison, id);
  if (enCours) { non('impossible'); return; }
  if (propose && performance.now() - propose.t < 120000) {
    const commun = premierReveil(plan, propose.plan);
    coop && coop.accepter(commun, id); lancerApresAccord(commun); return;
  }
  if (invitee) { invitee.repondu = true; invitee.h.retirer(); }
  const inv = { id, repondu: false, h: null };
  const repondre = () => { if (inv.repondu) return false; inv.repondu = true; inv.h.retirer(); if (invitee === inv) invitee = null; return true; };
  const b = el('div', { class: 'som-invite' }, el('span', {}, `${nom} propose de dormir ${texteProjet(plan)}.`),
    el('button', { class: 'btn', type: 'button', onclick: async () => {
      if (!repondre()) return;
      const g = G, c = coop, sit = await situation();
      if (G !== g || coop !== c || !c) return;
      if (!sit.ok) { emit('toast', { texte: sit.raison, type: 'alerte' }); non('impossible'); return; }
      const couchage = couchageIci(sit.V);
      const pl = auPlafond(couchage.categorie);
      if (pl || G.player.fatigue >= SO().FATIGUE_MAX_POUR_DORMIR) { non('repose'); return; }
      c.accepter(plan, id); lancerApresAccord(plan, couchage.categorie);
    } }, 'Dormir aussi'), el('button', { class: 'btn', type: 'button', onclick: () => { if (repondre()) non('refus'); } }, 'Pas maintenant'));
  invitee = inv;
  inv.h = inviter('sommeil', { element: b, dureeMs: 30000,
    expire: () => { if (repondre()) non('sans_reponse'); }, abandon: () => { if (repondre()) non('sans_reponse'); },
    masquee: () => coop && coop.envoyer({ t: 'sommeil_attente', id }),
    annule: () => { inv.repondu = true; if (invitee === inv) invitee = null; } });
}
export function attenteRecue(nom, id) {
  if (!propose || (id && propose.id !== id)) return;
  propose.t = performance.now(); emit('toast', { texte: `${nom} lit une scène : ta proposition l’attend.` });
}
export function refusRecu(nom, raison, id) {
  if (!propose || (id && propose.id !== id)) return;
  propose = null;
  emit('toast', { texte: raison === 'impossible' ? `${nom} ne peut pas dormir pour l’instant.` : raison === 'repose' ? `${nom} n’a pas sommeil.`
    : raison === 'sans_reponse' ? `${nom} n’a pas répondu : vous restez éveillés.` : `${nom} ne veut pas dormir maintenant.` });
}
export function accordRecu(plan, id) {
  if (enCours || !propose || (id && propose.id !== id)) return;
  lancerApresAccord(plan);
}
export async function lancerApresAccord(offre, couchageInvite = null) {
  if (invitee) { invitee.repondu = true; invitee.h.retirer(); invitee = null; }
  const plan = planSommeil(offre);
  let couchage = propose?.couchage || couchageInvite;
  const locale = plan.alarme != null && propose?.plan.regleePar === plan.regleePar;
  propose = null;
  if (G && G.mode !== 'solo' && coop && !enCours && !suivi) { suivi = nouveauSuivi(); if (!coop.hote()) clock.suspendreDistant(true); }
  const s = suivi, g = G, sit = await situation();
  if (G !== g || (s && (s.annule || s !== suivi))) return;
  couchage ||= couchageIci(sit.V).categorie;
  if (!sit.ok || (locale && !aUneAlarme(G.player))) {
    coop?.envoyer({ t: 'sommeil_fin' }); abandonnerCommun();
    emit('toast', { texte: !sit.ok ? sit.raison : 'Ta montre digitale n’est plus au poignet : le sommeil est annulé.' }); return;
  }
  executer(plan, sit, couchage, locale);
}
const nouveauSuivi = () => ({ file: [], attente: null, fin: false, annule: false, sid: null });
export function recuSommeil(m) {
  const s = suivi; if (!s) return;
  if (m.t === 'sommeil_ack') { if (!s.sid || m.sid !== s.sid) return; }
  else if (m.sid) { if (!s.sid) s.sid = m.sid; else if (m.sid !== s.sid) return; }
  s.file.push(m);
  if (m.t === 'sommeil_fin' || (m.t === 'sommeil_ack' && m.fin)) s.fin = true;
  if (s.attente) { const f = s.attente; s.attente = null; f(); }
}
function prochain(s, ms) {
  if (!s || s.annule) return Promise.resolve(null);
  if (s.file.length) return Promise.resolve(s.file.shift());
  return new Promise(ok => {
    const t = setTimeout(() => { s.attente = null; ok(null); }, ms);
    s.attente = () => { clearTimeout(t); ok(!s.annule && s.file.length ? s.file.shift() : null); };
  });
}

async function executer(plan, sit, couchage = 'sol', alarmeLocale = false) {
  if (enCours || !G) return;
  const g = G, c = coop, aDeux = g.mode !== 'solo' && !!c, hote = aDeux && c.hote();
  if (aDeux && !suivi) { suivi = nouveauSuivi(); if (!hote) clock.suspendreDistant(true); }
  const s = aDeux ? suivi : null, vivant = () => G === g && !(s && s.annule);
  const env = m => { if (vivant() && c) c.envoyer(m); };
  const liberer = () => { if (s && suivi === s) { suivi = null; if (!hote) clock.suspendreDistant(false); } };
  const pl = auPlafond(couchage);
  if (pl || (alarmeLocale && !aUneAlarme(g.player))) { if (aDeux) env({ t: 'sommeil_fin' }); liberer(); return; }
  enCours = true;
  if (hote) s.sid = nouvelId();
  const V = sit.V || null, vitesse = clock.getVitesse();
  clock.setVitesse(0); // chaque minute du sommeil vient des blocs, pas du timer entre deux réponses réseau.
  if (V) { V.occupe = true; V.entrees.actif(false); V.canal.majJoueur({ allure: 'immobile' }); }
  const voile = el('div', { class: 'som-voile' }, el('div', { class: 'som-t' }, 'Tu dors…'), el('div', { class: 'som-h' }));
  document.body.append(voile); requestAnimationFrame(() => voile.classList.add('on'));
  let dormi = 0, interrompu = false, plafond = false, autre = null, abandon = false, alarme = false, bruitReveil = false;
  const sources = new Set();
  const restant = () => {
    if (alarmeProche(V)) { bruitReveil = true; return 0; }
    return Math.max(0, Math.min(SO().NATUREL_MAX_MIN - dormi, minutesRepos(g.player, couchage, ambianceSommeil(sit).niveau),
      plan.alarme == null ? Infinity : plan.alarme - clock.minutes()));
  };
  const dormirBloc = n => {
    const b = ambianceSommeil(sit); b.sources.forEach(x => sources.add(x));
    const r = dormir(n / 60, { force: true, silencieux: true, sur: sit.sur, danger: sit.danger,
      mortsPresents: sit.mortsPresents, couchage, sansCourbatures: true, bruit: b.niveau, respecterBloc: true });
    dormi += r.dormi || 0; interrompu = !!r.interrompu; plafond = !!r.plafond;
    alarme = plan.alarme != null && clock.minutes() >= plan.alarme;
    voile.lastChild.textContent = texteHorloge();
    return r;
  };
  try {
    if (aDeux && !hote) {
      // Prêt envoyé après avoir reçu l'identifiant hôte : aucun message d'un ancien sommeil n'est accepté.
      for (;;) {
        const m = await prochain(s, ATTENTE_BLOC_MS);
        if (!vivant()) { abandon = true; break; }
        if (!m) { autre = 'muet'; break; }
        if (m.t === 'sommeil_fin') { autre = 'debout'; break; }
        if (m.t === 'sommeil_debut') {
          // L'accord peut arriver entre deux diffusions d'horloge. Rattraper ce temps éveillé avant le premier bloc.
          if (Number.isFinite(m.minutes) && m.minutes > clock.minutes()) clock.avancer(m.minutes - clock.minutes());
          env({ t: 'sommeil_ack', sid: s.sid, reste: restant(), fin: !restant() }); continue;
        }
        if (m.t !== 'sommeil_bloc' || !Number.isFinite(m.n) || m.n <= 0 || m.n > 60) continue;
        dormirBloc(m.n);
        const fin = interrompu || plafond || g.player.mort || !restant();
        env({ t: 'sommeil_ack', sid: s.sid, fin: !!fin, reste: restant() });
        if (fin) break;
      }
    } else {
      let restePair = Infinity;
      if (hote) {
        env({ t: 'sommeil_debut', sid: s.sid, minutes: clock.minutes() });
        const m = await prochain(s, ATTENTE_ACCORD_MS);
        if (!vivant()) abandon = true;
        else if (!m) autre = 'muet';
        else if (s.fin || !Number.isFinite(m.reste)) autre = 'debout';
        else restePair = Math.max(0, m.reste);
      }
      while (vivant() && !abandon && !autre && !g.player.mort && restant() > 0) {
        if (hote && s.fin) { autre = 'debout'; break; }
        const n = Math.min(60, restant(), restePair);
        if (n <= 0) { autre = 'debout'; break; }
        const r = dormirBloc(n);
        if (!r.ok) break;
        if (hote) {
          env({ t: 'sommeil_bloc', n: r.dormi, sid: s.sid });
          const m = await prochain(s, ATTENTE_ACCORD_MS);
          if (!vivant()) { abandon = true; break; }
          if (!m) { autre = 'muet'; break; }
          if (s.fin) { autre = 'debout'; break; }
          if (!Number.isFinite(m.reste)) { autre = 'muet'; break; }
          restePair = Math.max(0, m.reste);
        }
        if (interrompu || plafond || !restant()) break;
        await new Promise(r => setTimeout(r, 280));
      }
      if (!vivant()) abandon = true;
    }
  } finally {
    if (hote) env({ t: 'sommeil_fin', sid: s.sid });
    liberer(); enCours = false; voile.classList.remove('on'); setTimeout(() => voile.remove(), 500);
    if (G === g) clock.setVitesse(vitesse);
  }
  if (G === g && V && flow.tempsCourant() === 'exploration') { V.occupe = false; if (!V.enPause) V.entrees.actif(true); }
  if (abandon || G !== g) return;
  const cb = finSommeil(couchage, dormi);
  const duree = heureConnue() ? fmtDuree(dormi) : dormi < 60 ? 'un peu' : dormi < 240 ? 'quelques heures' : 'longtemps';
  let texte = !dormi ? 'Tu n’arrives pas à trouver le sommeil.' : `Tu as dormi ${duree}${ICI[couchage] ? ' ' + ICI[couchage] : ''}.`;
  if (bruitReveil) texte += ' Une alarme hurle tout près et t’empêche de dormir.';
  else if (interrompu) texte += ' Tu te réveilles en sursaut.';
  else if (alarme) texte += alarmeLocale ? ' Ta montre sonne.' : ' La montre de ton coéquipier sonne.';
  else if (dormi && g.player.fatigue < 80) texte += plafond ? ' Ce couchage ne te permet pas de récupérer davantage : tu te réveilles encore las{|se}.' : ' Tu te réveilles encore {fatigué|fatiguée}.';
  else if (dormi) texte += ' Tu te sens {reposé|reposée}.';
  if (cb) texte += ' Tu as des courbatures.';
  if (sources.size && dormi) texte += ` Tu entendais ${[...sources].join(' et ')} : il t’a fallu plus longtemps pour récupérer.`;
  if (autre === 'muet') texte += ` Plus de nouvelles de ${c.pairNom()} : tu te lèves.`;
  else if (autre === 'debout' && !alarme && !plafond) texte += ` ${c.pairNom()} est debout : tu te lèves aussi.`;
  if (!heureConnue() && dormi) texte += ` ${PHRASES_REVEIL[momentVague()]}`;
  // Un bip local discret, seulement si l'alarme a effectivement atteint son heure.
  if (alarme && alarmeLocale && V) V.canal.bruit?.({ etage: V.j.etage, x: V.j.x, y: V.j.y, rayon: 3 });
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
