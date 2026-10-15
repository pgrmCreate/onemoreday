// ============ Co-op à deux — session, écrans, routage (HÔTE-AUTORITAIRE) ============
// L'hôte tient le monde (js/game/autorite.js) : horloge, drapeaux, quêtes, lieux occupés — et donc les combats,
// qui se jouent dans la simulation du lieu (temps réel). L'invité envoie ses gestes (x:act), l'hôte relaie tout.
// Ce que la co-op ajoute au jeu :
//   - VOIR L'AUTRE : il est toujours dessiné dans le même lieu (silhouette bleue + nom, même dans le noir),
//     une flèche au bord de l'écran pointe vers lui, l'encart dit où il est (étage, lieu, distance) ;
//   - SE RETROUVER : « Rejoindre » le téléporte auprès de l'autre (il est loin dans un autre lieu) ;
//   - SE RELEVER : à 0 PV on tombe « à terre » 30 s, l'autre peut te relever (E) ; sinon, c'est la mort ;
//   - L'HISTOIRE À DEUX : drapeaux, quêtes, déclencheurs déjà joués, lieux découverts, missions ;
//     quand l'un vit une scène, l'autre la suit en direct dans un panneau (sans être bloqué) ; certains moments
//     exigent d'être deux au même endroit (déclencheurs et portes « deux » — règle solo si l'autre est parti) ;
//   - LES CINÉMATIQUES ne sont JAMAIS imposées : côte à côte et au calme, on la regarde ensemble ; sinon l'autre reçoit
//     une invitation (« Regarder ») qu'il prend quand il veut. Pendant une scène ou une cinématique, on est « hors jeu »
//     (les morts ne te voient plus : à deux, le monde ne s'arrête pas) ;
//   - MOURIR À DEUX ne coupe pas la partie : tes affaires tombent là où tu es tombé, et tu peux revenir avec un autre
//     survivant auprès de ton coéquipier (la mort de l'hôte ne renvoie plus l'invité à l'écran titre) ;
//   - REPRENDRE : l'hôte peut rouvrir sa partie sauvegardée ; l'invité y retrouve son personnage.
// Réseau : instantanés du lieu de l'invité à 15 Hz, en DIFFÉRENTIEL (portes, sol, cadavres, conteneurs seulement
// quand ils changent), position de l'invité à 20 Hz, positions croisées (lieu, étage, x, y) à 4 Hz.
import { G, setG, joueurNeuf, setFlag, genrer, utiliserCleSauvegarde, avantSauvegarde, aSauvegarde, effacerSauvegarde, noteJournal, sauver } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, $, escapeHtml } from '../core/util.js';
import * as net from './net.js';
import * as autorite from '../game/autorite.js';
import * as flow from '../game/flow.js';
import * as quetes from '../game/quetes.js';
import { lieu as lieuDe } from '../game/donnees.js';
import { intercepterMort } from '../game/survival.js';
import { brancherCoopSommeil, invitation as inviterSommeil, accordRecu, refusRecu, recuSommeil, attenteRecue } from '../game/sommeil.js';
import { inviter, annulerInvitations } from '../ui/invitations.js';
import { afficherEtatTransferts } from '../ui/transferts.js';
import * as vueExplore from '../explore/vue.js';
import { REGLAGES } from '../data/reglages.js';
import { SERVEUR_EN_LIGNE } from '../data/serveur.js';
import { majDisponible, appliquerMaj } from '../version.js';
import { appliquerConstructions } from '../data/construction.js';
import { brancherCoopMissions, recevoirOp, recevoirLivraison, MISSIONS } from '../game/missions.js';
import { aUneRadio, setRadioAutre, recevoirRadio } from '../game/radio.js';
import { SLOTS_TENUS, addItem } from '../game/inventory.js';
import { confirmerConstruction } from '../game/construction.js';
import { normaliserJoueur } from '../game/player.js';
import { panneauOuvert } from '../ui/panels/index.js';

const ID_HOTE = 'hote', ID_INVITE = 'invite';
const NOM_PROVISOIRE = 'Invité';   // le nom de l'invité tant que son personnage n'est pas choisi
let arriveeAnnoncee = false;        // l'hôte a-t-il déjà dit « X arrive » pour cette connexion ?
const RC = REGLAGES.coop;
let role = null;           // 'hote' | 'invite' | null
let actif = false;
let offs = [];
let nomPair = null;
let pairPos = null;        // { mode, lieu, etage, x, y, agonie, nom }
let muet = false;          // le coéquipier ne répond plus (Wi-Fi perdu : la connexion reste ouverte, mais rien n'arrive)
let finie = false;         // la liaison a pris fin (coupée, ou l'hôte est parti) : on ne le dit qu'une fois
const rpcAttente = new Map(); let rpcSeq = 1;
const transfertsEnCours = new Map();
const METHODES_TRANSFERT = new Set(['prendre', 'prendreLot', 'deposer', 'ranger', 'construire']);
const ctx = {};            // callbacks du main (afficher, ecranTitre, ecranCreation, demarrerInvite, nouvelleAventure)

export function estCoop() { return actif; }
export function monRole() { return role; }
export function moiId() { return role === 'invite' ? ID_INVITE : ID_HOTE; }
function envoyer(m) { net.envoyer(m); }
function majNomPair(n) { if (n) { nomPair = n; if (G) G.pairNom = n; } }

// =====================================================================
//  ÉCRANS
// =====================================================================
const btn = (data, label, sous = '', cls = '') => `<button class="btn ${cls}" ${data}>${label}${sous ? `<small>${sous}</small>` : ''}</button>`;
function code4() { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * L.length)]; return c; }

export function ecranCoop(callbacks) {
  Object.assign(ctx, callbacks);
  const enLigne = !!SERVEUR_EN_LIGNE;
  const c = ctx.afficher(`
    <h2 class="gros-titre">Jouer à deux</h2>
    <p class="recit" style="font-size:16px">Vous vous réveillez ensemble au cimetière. Chacun bouge librement ; dans le même lieu, on se bat côte à côte, on se relève l'un l'autre, et certains passages ne s'ouvrent qu'à deux.</p>
    <div class="menu">
      ${enLigne ? btn('data-c="net"', 'En ligne', 'chacun chez soi, via le serveur', 'primaire') : ''}
      ${btn('data-c="lan"', 'Même Wi-Fi', 'l\'un héberge depuis son appareil', enLigne ? '' : 'primaire')}
      ${btn('data-c="retour"', 'Retour')}
    </div>`, 'place_crousillat_nuit');
  c.querySelectorAll('[data-c]').forEach(b => b.onclick = async () => {
    if (b.dataset.c === 'retour') return ctx.ecranTitre();
    const url = b.dataset.c === 'net' ? SERVEUR_EN_LIGNE : null;
    if (url && await majDisponible()) return ecranMaj();
    ecranSalons(url);
  });
}
function ecranMaj() {
  const c = ctx.afficher(`<h2 class="gros-titre">Mise à jour requise</h2>
    <p class="recit" style="font-size:16px">Pour jouer en ligne, vos deux jeux doivent être à la même version. Ta sauvegarde n'est pas touchée.</p>
    <div class="menu">${btn('data-a="maj"', 'Mettre à jour', '', 'primaire')}${btn('data-a="retour"', 'Retour')}</div>`);
  c.querySelector('[data-a="maj"]').onclick = () => appliquerMaj();
  c.querySelector('[data-a="retour"]').onclick = () => ecranCoop(ctx);
}
// La partie hébergée sauvegardée (omd_v3_hote), si elle existe : { nom, jour, heure, minute }.
function partieHebergee() {
  if (!aSauvegarde('hote')) return null;
  try { const g = JSON.parse(localStorage.getItem('omd_v3_hote')); const m = g.world.minutes || 0; return { nom: g.player.nom, jour: Math.floor(m / 1440) + 1, heure: Math.floor((m % 1440) / 60), minute: m % 60 }; }
  catch (e) { return null; }
}
function ecranSalons(url) {
  const reprise = partieHebergee();
  const c = ctx.afficher(`
    <h2 class="gros-titre">Parties ${url ? 'en ligne' : 'sur ce Wi-Fi'}</h2>
    <div class="menu">${reprise ? btn('data-s="reprendre"', 'Reprendre ma partie', `${escapeHtml(reprise.nom)} — jour ${reprise.jour}, l'autre te rejoint`, 'primaire') : ''}${btn('data-s="hote"', reprise ? 'Héberger une nouvelle partie' : 'Héberger une partie', reprise ? 'efface la partie hébergée' : 'tu crées le monde, l\'autre te rejoint', reprise ? '' : 'primaire')}</div>
    <div class="champ">Parties ouvertes</div>
    <div class="menu" id="co-liste"><p class="aide">Recherche…</p></div>
    <p class="aide" id="co-statut"></p>
    <div class="menu">${btn('data-s="maj"', 'Rafraîchir')}${btn('data-s="retour"', 'Retour')}</div>`, 'place_crousillat_nuit');
  // La liste se relit toute seule (REGLAGES.coop.LISTE_SALONS_MS) tant que cet écran est affiché et la page visible :
  // la partie de l'autre apparaît sans geste. Une seule demande à la fois ; chaque partie garde SON bouton d'une lecture à
  // l'autre (on ajoute, retire ou met à jour l'heure, sans tout redessiner : ni clignotement, ni toucher perdu), et tant
  // qu'un doigt est posé sur la liste, rien n'y bouge avant son clic (une partie ne glisse pas sous le doigt). Une panne
  // passagère garde la liste affichée. On s'arrête net en quittant l'écran, en lançant une partie, ou page cachée.
  const liste = c.querySelector('#co-liste'), statut = c.querySelector('#co-statut');
  let codes = null, enCours = false, minuteur = null, fini = false;
  const doigt = { pose: false, attente: null, t: null };   // un toucher en cours sur la liste, et la lecture qui l'attend
  const actif = () => !fini && liste.isConnected;
  const surVisibilite = () => { if (document.hidden) { clearTimeout(minuteur); minuteur = null; } else if (actif() && !enCours) charger(false); };
  const poser = () => { doigt.pose = true; clearTimeout(doigt.t); };
  // le clic suit le relâcher : on attend un peu avant d'appliquer une lecture mise de côté
  const lever = () => { if (!doigt.pose) return; clearTimeout(doigt.t); doigt.t = setTimeout(() => { doigt.pose = false; const s = doigt.attente; doigt.attente = null; if (s && actif()) montrer(s); }, 400); };
  liste.addEventListener('pointerdown', poser);
  document.addEventListener('pointerup', lever); document.addEventListener('pointercancel', lever);
  const arreter = () => {
    fini = true; clearTimeout(minuteur); minuteur = null; clearTimeout(doigt.t);
    document.removeEventListener('visibilitychange', surVisibilite);
    document.removeEventListener('pointerup', lever); document.removeEventListener('pointercancel', lever);
  };
  const planifier = () => { clearTimeout(minuteur); minuteur = actif() && !document.hidden ? setTimeout(() => charger(false), RC.LISTE_SALONS_MS) : null; };
  const sousTitre = (s) => `Jour ${s.jour} — ${String(s.heure).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
  const majTextes = (b, s) => {
    const nom = s.nom || 'Partie', sous = sousTitre(s), petit = b.querySelector('small');
    if (b.firstChild && b.firstChild.nodeType === 3 && b.firstChild.textContent !== nom) b.firstChild.textContent = nom;
    if (petit && petit.textContent !== sous) petit.textContent = sous;
  };
  const creerBouton = (s) => {
    const t = document.createElement('template');
    t.innerHTML = btn(`data-code="${escapeHtml(s.code)}"`, escapeHtml(s.nom || 'Partie'), sousTitre(s));
    const b = t.content.firstElementChild;
    b.onclick = () => { arreter(); rejoindre(url, b.dataset.code); };
    return b;
  };
  const montrer = (salons) => {
    const nouveaux = salons.map(s => s.code).join('|');
    const parCode = new Map([...liste.querySelectorAll('[data-code]')].map(b => [b.dataset.code, b]));
    // mêmes parties que l'affichage : l'heure seulement, et une liste différée plus ancienne n'a plus lieu d'être
    if (nouveaux === codes) { doigt.attente = null; salons.forEach(s => { const b = parCode.get(s.code); if (b) majTextes(b, s); }); return; }
    if (doigt.pose) { doigt.attente = salons; return; }     // la liste change sous un doigt : après son clic
    const focus = liste.contains(document.activeElement) ? document.activeElement.dataset.code : null;
    codes = nouveaux;
    if (!salons.length) { liste.innerHTML = '<p class="aide">Aucune partie ouverte. Héberge la tienne, ou demande à l\'autre joueur de le faire.</p>'; return; }
    // retirer les parties fermées et les messages ; garder, mettre à jour et ranger les autres ; ajouter les nouvelles
    for (const e of [...liste.children]) if (!e.dataset.code || !salons.some(s => s.code === e.dataset.code)) e.remove();
    salons.forEach((s, k) => {
      let b = parCode.get(s.code);
      if (b && b.isConnected) majTextes(b, s); else b = creerBouton(s);
      if (liste.children[k] !== b) liste.insertBefore(b, liste.children[k] || null);
    });
    if (focus && document.activeElement !== liste.querySelector(`[data-code="${CSS.escape(focus)}"]`)) { const b = liste.querySelector(`[data-code="${CSS.escape(focus)}"]`); if (b) b.focus(); }
  };
  // demande : premier chargement ou « Rafraîchir » (on dit ce qui se passe) ; sinon relecture discrète
  const charger = async (demande) => {
    if (!actif()) { arreter(); return; }
    if (enCours) return;                // déjà une demande en route : pas de seconde en parallèle
    clearTimeout(minuteur); minuteur = null;
    enCours = true;
    if (demande && codes === null) liste.innerHTML = '<p class="aide">Recherche…</p>';
    let salons = null;
    try { salons = await net.listerSalons(url); } finally { enCours = false; }
    if (!actif()) { arreter(); return; }
    if (salons) { montrer(salons); if (statut.dataset.echec) { statut.textContent = ''; delete statut.dataset.echec; } }
    else if (codes === null) liste.innerHTML = '<p class="aide">Impossible de charger les parties. Vérifie le réseau : la liste se remettra à jour d’elle-même.</p>';
    else if (demande) { statut.textContent = 'Le serveur ne répond pas : la liste affichée n’est peut-être plus à jour.'; statut.dataset.echec = '1'; }
    planifier();
  };
  document.addEventListener('visibilitychange', surVisibilite);
  charger(true);
  c.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
    if (b.dataset.s === 'maj') return charger(true);
    arreter();
    if (b.dataset.s === 'retour') return ecranCoop(ctx);
    if (b.dataset.s === 'reprendre') return heberger(url, null, reprise);
    if (b.dataset.s === 'hote') return ctx.ecranCreation({ mode: 'hote', apres: (opts) => heberger(url, opts) });
  });
}

// =====================================================================
//  CROCHET D'EXPLORATION : ce que l'écran demande à la co-op
// =====================================================================
const crochetCoop = {
  // le coéquipier est-il à moins de d cases (même lieu, même étage) ?
  pairPres(d) {
    const V = vueExplore.etatDebug(); if (!V) return null;
    for (const p of V.pairsVus || []) if (p.etage === V.j.etage && Math.hypot(p.x - V.j.x, p.y - V.j.y) <= d) return p;
    return null;
  },
  relever(id) { envoyer({ t: 'relever', id }); },
  // personne à attendre : pas de co-op, ou le coéquipier est parti → les passages « à deux » suivent la règle solo
  seul() { return !actif || !net.pairPresent(); },
  // la scène que vit l'autre en ce moment (id racine) : on ne la lance pas une seconde fois en même temps
  sceneAutre() { return sceneAutre; },
  // le coéquipier est-il dans un autre lieu (ou en route) ?
  ailleurs() { const moi = vueExplore.joueurLocal(); return !!(pairPos && (!moi || pairPos.lieu !== moi.lieu || pairPos.mode !== 'lieu')); },
  // encart du HUD : où est l'autre ?
  info(V, pairs) {
    if (actif && !net.connecte()) return { texte: 'Hors ligne', alerte: true };
    if (!actif || !net.pairPresent()) return actif ? { texte: 'En attente de ton coéquipier…' } : null;
    const nom = nomPair || 'Coéquipier';
    if (muet) return { texte: `${nom} ne répond plus…`, alerte: true };
    const p = pairs.find(q => q.etage === V.j.etage) || pairs[0];
    if (p) {
      if (p.agonie) return { texte: `${nom} est à terre ! Va le relever (E)`, alerte: true };
      if (p.horsJeu) return { texte: `${nom} · dans une scène` };
      if (p.etage !== V.j.etage) { const E2 = V.niveau.etages[V.niveau.etageIdx[p.etage]]; return { texte: `${nom} · ${E2 ? E2.nom : 'autre étage'}` }; }
      const d = Math.hypot(p.x - V.j.x, p.y - V.j.y) * 0.8;
      return { texte: `${nom} · ${d < 3 ? 'à côté de toi' : Math.round(d) + ' m'}` };
    }
    if (pairPos && pairPos.agonie) return { texte: `${nom} est à terre, loin d'ici !`, alerte: true };
    const L = pairPos && pairPos.lieu ? lieuDe(pairPos.lieu) : null;
    return { texte: `${nom} · ${pairPos && pairPos.mode === 'voyage' ? 'en route vers ' : ''}${L ? (L.court || L.nom) : 'ailleurs'}` };
  },
};

// =====================================================================
//  HÔTE
// =====================================================================
// opts = { nom, genre, difficulte } pour une nouvelle partie ; reprise = fiche de la partie sauvegardée à rouvrir.
async function heberger(url, opts, reprise = null) {
  const code = code4();
  const nom = reprise ? reprise.nom : opts.nom;
  const meta = reprise ? { jour: reprise.jour, heure: reprise.heure, minute: reprise.minute } : { jour: 1, heure: 8, minute: 0 };
  const r = await net.connecter({ url, code, role: 'host', nom, meta });
  if (!r.ok) { emit('toast', { texte: 'Hébergement impossible : ' + (r.raison || 'serveur injoignable.') }); return; }
  role = 'hote'; actif = true; finie = false;
  brancherHote();
  brancherCommun();
  if (reprise) {
    // le personnage de l'hôte se reprend avant le premier dessin (l'invité, lui, retrouvera le sien par la graine)
    await ctx.continuer('hote', () => { if (G) { G.player.id = ID_HOTE; G.pairNom = nomPair; } });
  } else {
    await ctx.nouvelleAventure({ ...opts, mode: 'hote', avant: () => { if (G) G.player.id = ID_HOTE; } });
  }
  if (G) G.player.id = ID_HOTE;
  emit('toast', { texte: `Partie ${reprise ? 'rouverte' : 'ouverte'} (${code}). L'autre joueur n'a qu'à la rejoindre.` });
}

function brancherHote() {
  vueExplore.definirCrochets({ obtenirCanal: (lieuId, niveau, L) => autorite.canalLieu(lieuId, niveau, L, ID_HOTE), coop: crochetCoop });
  net.on('pair', (present, m) => {
    // l'invité se connecte sous un nom provisoire : on l'annonce quand son vrai prénom arrive (« bonjour »)
    if (present) { const n = (m && m.nom) || net.nomPair(); if (n && n !== NOM_PROVISOIRE) majNomPair(n); arriveeAnnoncee = false; envoyerMonde(); }
    else { emit('toast', { texte: `${nomPair || 'Ton coéquipier'} est parti.` }); annulerInvitations(); fermerSpectateur(); quitterLieuInvite(); pairPos = null; majBadge(); }
  });
  net.on('message', (m) => { try { recuHote(m); } catch (e) { console.error('[coop] hôte', m && m.t, e); } });
  // la sauvegarde de l'hôte range AUSSI l'état des lieux où il n'est pas (celui où joue l'invité)
  offs.push(avantSauvegarde(() => autorite.sauverTout()));
  const t = setInterval(() => {
    if (!G || !actif) return;
    envoyer({ t: 'horloge', m: G.world.minutes });
    envoyer({ t: 'heure', jour: clock.jour(), heure: clock.heure(), minute: clock.minute() });
  }, 1000);
  offs.push(() => clearInterval(t));
  // instantanés du lieu de l'invité : 15 Hz, le « monde statique » seulement quand il change (ou toutes les 3 s)
  let dernierVm = -1, dernierComplet = 0;
  const s = setInterval(() => {
    if (!invite.lieu) return;
    const sim = autorite.simDe(invite.lieu);
    if (!sim) return;
    const snap = sim.instantane(), now = performance.now();
    const complet = snap.vm !== dernierVm || now - dernierComplet > 3000;
    if (complet) { dernierVm = snap.vm; dernierComplet = now; envoyer({ t: 'x:snap', lieu: invite.lieu, s: snap }); }
    else envoyer({ t: 'x:snap', lieu: invite.lieu, s: { t: snap.t, vm: snap.vm, zombies: snap.zombies, joueurs: snap.joueurs } });
  }, 66);
  offs.push(() => clearInterval(s));
}
function envoyerMonde() {
  if (!G) return;
  autorite.sauverTout();
  envoyer({ t: 'monde', monde: { ...G.world }, hote: { nom: G.player.nom, position: positionPrecise() } });
  envoyerPos();
}

const invite = { lieu: null, canal: null, offs: [] };
const EVTS_RELAIS = ['porte', 'construction', 'meuble', 'bruit', 'hurlement', 'sol', 'conteneur', 'charge', 'zombie', 'voiture', 'ruee',
  'telegraphe', 'fente', 'attaque', 'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule'];
function quitterLieuInvite() {
  invite.offs.forEach(f => f()); invite.offs = [];
  if (invite.canal) { try { invite.canal.fermer(); } catch (e) {} }
  invite.canal = null; invite.lieu = null;
}
async function recuHote(m) {
  if (recuCommun(m)) return;
  switch (m.t) {
    case 'bonjour':
      if (m.nom && m.nom !== NOM_PROVISOIRE) { majNomPair(m.nom); if (!arriveeAnnoncee) { arriveeAnnoncee = true; emit('toast', { texte: `${m.nom} arrive.` }); } }
      envoyerMonde(); break;
    case 'x:entrer': {
      quitterLieuInvite();
      const { chargerNiveau } = await import('../game/donnees.js');
      const def = await chargerNiveau(m.lieu); if (!def) return;
      const niveau = vueExplore.niveauParse(m.lieu, def);
      const L = lieuDe(m.lieu) || {};
      invite.lieu = m.lieu;
      invite.canal = autorite.canalLieu(m.lieu, niveau, L, ID_INVITE);
      invite.canal.ajouterJoueur(m.pos, m.info || { nom: nomPair });
      for (const evt of EVTS_RELAIS) invite.offs.push(invite.canal.on(evt, (e) => envoyer({ t: 'x:evt', lieu: m.lieu, e })));
      envoyer({ t: 'x:snap', lieu: m.lieu, s: invite.canal.instantane() });
      break;
    }
    case 'x:sortir': if (invite.lieu === m.lieu) quitterLieuInvite(); break;
    case 'sauter': if (m.n > 0 && m.n <= 1440) clock.avancer(m.n); break;          // un saut de temps raconté chez l'invité
    case 'mission_op': recevoirOp(m.op); break;
    case 'x:maj': if (invite.canal && invite.lieu === m.lieu) invite.canal.majJoueur(m.p); break;
    case 'x:bruit': if (invite.canal && invite.lieu === m.lieu) invite.canal.bruit(m.b); break;
    case 'x:act': if (invite.canal && invite.lieu === m.lieu) invite.canal.action(m.a); break;
    case 'x:rpc': {
      let r = null;
      const tr = m.transfert && METHODES_TRANSFERT.has(m.m) && /^[a-z0-9-]{12,80}$/i.test(m.transfert) ? m.transfert : null;
      const recus = G && (G.world.transferts || (G.world.transferts = {}));
      if (tr && Object.hasOwn(recus, tr)) { envoyer({ t: 'x:rep', id: m.id, r: recus[tr].r }); break; }
      if (tr && transfertsEnCours.has(tr)) { r = await transfertsEnCours.get(tr); envoyer({ t: 'x:rep', id: m.id, r }); break; }
      let finir;
      if (tr) transfertsEnCours.set(tr, new Promise(ok => { finir = ok; }));
      try { if (invite.canal && invite.lieu === m.lieu && typeof invite.canal[m.m] === 'function') r = await invite.canal[m.m](...(m.a || [])); }
      catch (e) { r = null; }
      if (tr) { recus[tr] = { r: r ?? null }; sauver(); finir(r); transfertsEnCours.delete(tr); }
      envoyer({ t: 'x:rep', id: m.id, r: r === undefined ? null : r });
      break;
    }
    case 'x:transfert_recu': if (G.world.transferts && typeof m.id === 'string') delete G.world.transferts[m.id]; break;
    default: break;
  }
}

// =====================================================================
//  INVITÉ
// =====================================================================
async function rejoindre(url, code) {
  const statut = $('#co-statut');
  if (statut) statut.textContent = 'Connexion…';
  let entre = false;
  const r = await net.connecter({ url, code, role: 'guest', nom: NOM_PROVISOIRE });
  if (!r.ok) { if (statut) statut.textContent = 'Échec : ' + (r.raison || 'connexion impossible.'); return; }
  net.on('message', (m) => {
    if (m.t === 'monde') { if (!entre) { entre = true; adopterMonde(m); } return; }
    try { recuInvite(m); } catch (e) { console.error('[coop] invité', m && m.t, e); }
  });
  net.on('pair', (present) => {
    if (present || !actif || finie) return;
    finie = true;
    // une fin ou un écran de mort à l'écran : on ne l'arrache pas pour l'écran titre
    if (G && (G._fin || G._mortTraitee)) { emit('toast', { texte: 'L\'hôte a quitté la partie.' }); return; }
    sauverInvite();
    emit('toast', { texte: 'L\'hôte a quitté la partie. Ton personnage est gardé : tu le retrouveras dans sa partie.' });
    setTimeout(() => { if (actif) ctx.ecranTitre(); }, 2500);
  });
  role = 'invite'; actif = true; finie = false;
  if (statut) statut.textContent = 'Connecté — en attente du monde de l\'hôte…';
  envoyer({ t: 'bonjour', nom: NOM_PROVISOIRE });
}
function adopterMonde({ monde, hote }) {
  majNomPair((hote && hote.nom) || 'l\'hôte');
  let perso = null;
  // le personnage de l'invité dans CE monde (même graine) : { seed, player } (gardé toutes les 10 s) ou la partie entière
  // { world, player } (sauvée en quittant la page) — un personnage mort ne revient pas
  try { const s = JSON.parse(localStorage.getItem('omd_v3_invite') || 'null'); const seed = s && (s.seed ?? (s.world && s.world.seed)); if (s && seed === monde.seed && s.player && !s.player.mort) perso = s.player; } catch (e) {}
  const entrer = (player, neuf) => {
    setG({ v: 3, mode: 'invite', cree: Date.now(), world: monde, player, journal: [], documents: [], carteNotes: {} });
    G.pairNom = nomPair;
    utiliserCleSauvegarde('invite');
    G.player.id = ID_INVITE;
    recupererTransferts();
    brancherInvite();
    brancherCommun();
    envoyer({ t: 'bonjour', nom: G.player.nom });
    // on arrive AUPRÈS de l'hôte (pas à l'autre bout de la carte)
    const hp = hote && hote.position;
    let pos;
    if (hp && hp.mode === 'lieu' && hp.lieu && hp.x != null) pos = { mode: 'lieu', lieu: hp.lieu, etage: hp.etage, x: hp.x + 0.8, y: hp.y + 0.3, abords: hp.abords };
    else if (!neuf && player.position && player.position.lieu) pos = player.position;
    else pos = { mode: 'lieu', lieu: (hp && hp.lieu) || 'cimetiere' };
    G.player.position = pos;
    // Un nouveau venu voit d'abord l'introduction (passable) ; puis il arrive AUPRÈS de l'hôte — on attend que celui-ci
    // soit dans un lieu (il regarde peut-être encore la sienne) : sinon on jouerait son réveil à sa place.
    const avant = async () => {
      if (neuf && !G.world.flags.prologue_fini) await flow.cinematique('intro', { distant: true });
      const p = await positionHote(neuf ? 20000 : 4000);
      if (p) G.player.position = p;
      return G.player.position;
    };
    ctx.demarrerInvite({ position: pos, auprès: true, neuf, avant });
    emit('toast', { texte: `Tu rejoins la partie de ${nomPair}.` });
  };
  if (perso) return entrer(perso, false);
  ctx.ecranCreation({ mode: 'invite', apres: ({ nom, genre }) => entrer(joueurNeuf(nom, genre), true) });
}
// Attend (au plus ms) que l'hôte soit dans un lieu, et renvoie une place à côté de lui (ou null).
async function positionHote(ms) {
  const fin = performance.now() + ms;
  while (performance.now() < fin) {
    if (pairPos && pairPos.mode === 'lieu' && pairPos.lieu && pairPos.x != null) break;
    await new Promise(r => setTimeout(r, 250));
  }
  const p = pairPos;
  return p && p.mode === 'lieu' && p.lieu && p.x != null ? { mode: 'lieu', lieu: p.lieu, etage: p.etage, x: p.x + 0.8, y: p.y + 0.3, abords: p.abords } : null;
}
function brancherInvite() {
  vueExplore.definirCrochets({ obtenirCanal: (lieuId, niveau) => canalDistant(lieuId, niveau), coop: crochetCoop });
  const s = setInterval(sauverInvite, 10000);
  offs.push(() => clearInterval(s));
}
function sauverInvite() {
  if (role === 'invite' && G && !G.player.mort && !G._mortTraitee) try { localStorage.setItem('omd_v3_invite', JSON.stringify({ seed: G.world.seed, player: G.player })); } catch (e) {}
}
let lieuDistant = null;
function recuInvite(m) {
  if (recuCommun(m)) return;
  switch (m.t) {
    case 'horloge': clock.setMinutesDistantes(m.m); break;
    case 'x:snap': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._snap(m.s); break;
    case 'x:evt': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._evt(m.e); break;
    case 'x:rep': { const f = rpcAttente.get(m.id); if (f) { rpcAttente.delete(m.id); majTransferts(); f(m.r); } break; }
    case 'mission_livre': recevoirLivraison(m.l); break;     // la récompense d'une mission que j'ai faite
    case 'radio': recevoirRadio(m.texte, m.journal); break;   // la radio a parlé : je l'entends si j'en ai une
    default: break;
  }
}
function majTransferts() {
  afficherEtatTransferts([...rpcAttente.values()].filter(f => f.abandonner).length);
}
function rpc(msg) {
  return new Promise((ok) => {
    const id = rpcSeq++;
    // Une prise/dépose n'expire pas au bout de quatre secondes : une réponse perdue ne dit pas si le monde a changé.
    // L'intention est sauvée avec le personnage ; au retour, le reçu de l'hôte permet de retrouver l'objet une seule fois.
    const tr = METHODES_TRANSFERT.has(msg.m) && G && role === 'invite' ? 'tr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) : null;
    if (tr) {
      const g = G, p = g.player;
      p.transferts = p.transferts || [];
      p.transferts.push({ id: tr, m: msg.m, a: msg.a });
      sauverInvite();
      const reponse = (r) => {
        p.transferts = p.transferts.filter(x => x.id !== tr);
        if (msg.m === 'deposer' && !r) rendreTransfert(msg.a[1]);
        ok(r);
        // Les continuations du ramassage/repas ont eu lieu avant la sauvegarde et l'accusé de réception.
        setTimeout(() => { if (G === g) { sauverInvite(); envoyer({ t: 'x:transfert_recu', id: tr }); } }, 0);
      };
      reponse.abandonner = () => ok(msg.m === 'construire' || msg.m === 'ranger' ? { ok: false, attente: true } : null); // la prochaine connexion tranche grâce au reçu
      rpcAttente.set(id, reponse);
      majTransferts();
      if (net.connecte()) envoyer({ ...msg, id, rid: id, transfert: tr });
      else { rpcAttente.delete(id); majTransferts(); reponse(null); }
      return;
    }
    rpcAttente.set(id, ok);
    envoyer({ ...msg, id, rid: id });
    setTimeout(() => { if (rpcAttente.has(id)) { rpcAttente.delete(id); ok(null); } }, 4000);
  });
}
function rendreTransfert(it) {
  if (!it || !G) return;
  if (it.doc) { if (!G.documents.includes(it.doc)) G.documents.push(it.doc); return; }
  const { id, qty, ...etat } = it;
  addItem(id, qty || 1, etat, G.player, { siPlein: 'tri' });
}
function recupererTransferts() {
  const p = G.player, recus = G.world.transferts || {};
  for (const tr of p.transferts || []) {
    const r = recus[tr.id] && recus[tr.id].r;
    if (tr.m === 'deposer') { if (!r) rendreTransfert(tr.a[1]); }
    else if (tr.m === 'ranger') { if (!r || !r.ok) rendreTransfert(tr.a[1]); }
    else if (tr.m === 'construire') {
      if (!r || !r.ok) { for (const it of tr.a[1] || []) rendreTransfert(it); }
      else confirmerConstruction(tr.a[0].type);
    }
    else if (tr.m === 'prendreLot') { for (const it of r || []) rendreTransfert(it); }
    else rendreTransfert(r);
    envoyer({ t: 'x:transfert_recu', id: tr.id });
  }
  p.transferts = [];
  sauverInvite();
}
// ---------- Canal DISTANT d'exploration (même interface que canal_local) ----------
function canalDistant(lieuId, niveau) {
  if (lieuDistant) lieuDistant.fermer();
  const ecouteurs = new Map();
  const dyn = niveau.etages.map(E => ({ bloque: Uint8Array.from(E.bloque), opaque: Uint8Array.from(E.opaque) }));
  let snap = { zombies: [], portes: {}, conteneurs: {}, sol: [], cadavres: [], joueurs: [], joues: [] };
  let majEnAttente = null, majTimer = null;
  const joues = new Set();
  const diffuser = (evt, d) => { const s = ecouteurs.get(evt); if (s) for (const fn of [...s]) { try { fn(d); } catch (e) { console.error(e); } } };
  const appel = (m, a) => rpc({ t: 'x:rpc', lieu: lieuId, m, a });
  const c = {
    joueurId: ID_INVITE, niveau, lieu: lieuId, local: false,
    _snap(s) {
      snap = { ...snap, ...s };          // instantané léger : on garde portes, sol, cadavres du dernier complet
      if (s.constructions || s.retires) { // grilles recalculées comme chez l'hôte : niveau → meubles démontés → portes → constructions
        niveau.etages.forEach((E, k) => { dyn[k].bloque.set(E.bloque); dyn[k].opaque.set(E.opaque); });
        for (const cle of snap.retires || []) { const m = niveau.meubleParCle[cle]; if (m) for (const i of m.cases) { dyn[niveau.etageIdx[m.etage]].bloque[i] = 0; dyn[niveau.etageIdx[m.etage]].opaque[i] = 0; } }
        const tout = { ...snap.portes };
        for (const p of niveau.portes) { const st = tout[p.cle]; const E = niveau.etages[niveau.etageIdx[p.etage]]; const ferme = st ? (st.etat === 'fermee' || st.etat === 'verrouillee') : (p.etat === 'fermee' || p.etat === 'verrouillee'); const op = ferme && !(p.style === 'grille' || p.style === 'vitree') ? 1 : 0; for (const i of p.cases) { dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = op; } }
        appliquerConstructions(niveau, dyn, snap.constructions || []);
      } else if (s.portes) for (const p of niveau.portes) {
        const st = s.portes[p.cle]; if (!st) continue;
        const E = niveau.etages[niveau.etageIdx[p.etage]];
        const ferme = st.etat === 'fermee' || st.etat === 'verrouillee';
        const op = ferme && !(p.style === 'grille' || p.style === 'vitree') ? 1 : 0;
        for (const i of p.cases) { dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = op; }

      }
      (s.joues || []).forEach(i => joues.add(i));
      diffuser('tick', { t: performance.now() });
    },
    _evt(e) { diffuser(e.type, e); },
    ajouterJoueur(pos, info) { envoyer({ t: 'x:entrer', lieu: lieuId, pos, info: { nom: G.player.nom, ...(info || {}) } }); },
    majJoueur(patch) {
      majEnAttente = { ...(majEnAttente || {}), ...patch };
      if (!majTimer) majTimer = setTimeout(() => { majTimer = null; envoyer({ t: 'x:maj', lieu: lieuId, p: majEnAttente }); majEnAttente = null; }, 50);
    },
    bruit(b) { envoyer({ t: 'x:bruit', lieu: lieuId, b }); },
    porte: (cle, action) => appel('porte', [cle, action]).then(r => r || { ok: false, raison: 'réseau' }),
    fouiller: (cle) => appel('fouiller', [cle]).then(r => r || { items: [], dureeMs: 0 }),
    arreterFouille: (p) => { appel('arreterFouille', [p]); },
    prendre: (cle, i, qty, id) => appel('prendre', [cle, i, qty, id]),
    prendreLot: (pris) => appel('prendreLot', [pris]),
    contenu: (cle) => appel('contenu', [cle]).then(r => r || []),
    construire: (o, materiaux) => appel('construire', [o, materiaux]).then(r => r || { ok: false, raison: 'réseau' }),
    agirConstruction: (uid, a, patch) => appel('agirConstruction', [uid, a, patch]).then(r => r || { ok: false, raison: 'réseau' }),
    ranger: (cle, item) => appel('ranger', [cle, item]).then(r => r || { ok: false, raison: 'réseau' }),
    demonterMeuble: (cle) => appel('demonterMeuble', [cle]).then(r => r || { ok: false, raison: 'réseau' }),
    puiserEau: (cle, L) => appel('puiserEau', [cle, L]).then(r => r || { ok: false, raison: 'réseau' }),
    ouvrirVoiture: (cle, mode) => appel('ouvrirVoiture', [cle, mode]).then(r => r || { ok: false, raison: 'réseau' }),
    deposer: (pos, item) => appel('deposer', [pos, item]),
    action(a) { if (majTimer) { clearTimeout(majTimer); majTimer = null; if (majEnAttente) envoyer({ t: 'x:maj', lieu: lieuId, p: majEnAttente }); majEnAttente = null; } envoyer({ t: 'x:act', lieu: lieuId, a }); return Promise.resolve({ ok: true }); },
    faireApparaitre: (l, o) => appel('faireApparaitre', [l, o]).then(r => r || []),
    // missions jouées par l'invité là où l'hôte n'est pas : vagues, mise en scène, réveil d'une pièce
    appelerMorts: (n, cible, o) => appel('appelerMorts', [n, cible, o]).then(r => r || []),
    preparerMission: (o) => appel('preparerMission', [o]),
    reveillerZone: (o) => appel('reveillerZone', [o]),
    blesserZombie: (uid, n) => appel('blesserZombie', [uid, n]),
    retirerZombies: (uids, o) => appel('retirerZombies', [uids, o]),
    repousserZombies: (uids, d) => appel('repousserZombies', [uids, d]),
    instantane: () => snap,
    pairs: () => (snap.joueurs || []).filter(j => j.id !== ID_INVITE),
    grilles: (etage) => dyn[niveau.etageIdx[etage]],
    marquerJoue(i) { joues.add(i); appel('marquerJoue', [i]); }, estJoue: (i) => joues.has(i),
    sauver: () => null,
    on(evt, fn) { if (!ecouteurs.has(evt)) ecouteurs.set(evt, new Set()); ecouteurs.get(evt).add(fn); return () => ecouteurs.get(evt).delete(fn); },
    pause() {}, reprise() {},
    fermer() { envoyer({ t: 'x:sortir', lieu: lieuId }); ecouteurs.clear(); if (lieuDistant === c) lieuDistant = null; },
  };
  lieuDistant = c;
  return c;
}

// =====================================================================
//  COMMUN (les deux machines)
// =====================================================================
function brancherCommun() {
  if (G) G.pairNom = nomPair;
  offs.push(on('flag', ({ k, v, distant }) => { if (!distant) envoyer({ t: 'flag', k, v }); }));
  offs.push(on('quete', ({ id, etape, distant }) => { if (!distant) envoyer({ t: 'quete', id, etape }); }));
  // missions : l'hôte les fait avancer, l'invité reçoit l'état et les bandeaux
  offs.push(on('mission:maj', ({ id, notif, distant }) => { if (!distant && G && G.mode === 'hote') envoyer({ t: 'mission', id, st: id ? (G.world.missions || {})[id] : null, notif: notif || null }); }));
  offs.push(on('declencheur', ({ cle }) => envoyer({ t: 'decl', cle })));
  offs.push(on('lieu:decouvert', ({ id, distant }) => { if (!distant) envoyer({ t: 'decouvert', id }); }));
  offs.push(on('cinematique', ({ id }) => envoyer({ t: 'cine', id })));
  offs.push(on('scene:debut', ({ id }) => envoyer({ t: 'scene', etat: 'debut', id, nom: G && G.player.nom })));
  offs.push(on('scene:noeud', (n) => envoyer({ t: 'scene', etat: 'noeud', ...n })));
  offs.push(on('scene:choix', (n) => envoyer({ t: 'scene', etat: 'choix', ...n })));
  offs.push(on('scene:fin', ({ id }) => envoyer({ t: 'scene', etat: 'fin', id })));
  offs.push(on('temps', () => { envoyerPos(); majBadge(); }));   // badge recalculé en entrant dans un lieu ou en le quittant
  offs.push(on('lieu:entre', () => envoyerPos()));
  // un saut de temps raconté chez l'invité : l'hôte, qui tient l'heure, saute aussi
  offs.push(on('horloge:sauter', ({ n }) => { if (role === 'invite') envoyer({ t: 'sauter', n }); }));
  // une scène emmène ailleurs (« Monter l'escalier », « Dormir chez Nostradamus ») : l'autre peut suivre
  offs.push(on('histoire:teleporter', (t) => envoyer({ t: 'suivre', lieu: t.lieu, entree: t.entree, nom: G && G.player.nom })));
  // la radio (sirènes, hordes, météo) : l'hôte la fait parler, l'invité l'entend s'il en a une
  offs.push(on('radio:capte', ({ texte, journal, distant }) => { if (!distant && role === 'hote') envoyer({ t: 'radio', texte, journal }); }));
  setRadioAutre(() => !!(pairPos && pairPos.radio));
  offs.push(() => setRadioAutre(null));
  // missions : l'invité les joue aussi (gestes relayés), les récompenses vont à qui les a faites
  brancherCoopMissions({
    relais: role === 'invite' ? (op) => envoyer({ t: 'mission_op', op }) : null,
    livrer: role === 'hote' ? (l) => envoyer({ t: 'mission_livre', l }) : null,
    lieuAutre: () => (pairPos && pairPos.mode === 'lieu' && net.pairPresent() ? pairPos.lieu : null),
  });
  offs.push(() => brancherCoopMissions(null));
  const p = setInterval(envoyerPos, 250);
  offs.push(() => clearInterval(p));
  // à 0 PV : « à terre » au lieu de mourir, tant que le coéquipier est là
  intercepterMort(aTerre);
  // dormir à deux : l'un propose, l'autre accepte, l'horloge file pour les deux
  brancherCoopSommeil({ proposer: (h, id) => envoyer({ t: 'sommeil', h, id, nom: G && G.player.nom }), accepter: (h, id) => envoyer({ t: 'sommeil_go', h, id }),
    refuser: (raison, id) => envoyer({ t: 'sommeil_non', raison, id }), envoyer, hote: () => role === 'hote', pairNom: () => nomPair || 'ton coéquipier' });
  offs.push(() => brancherCoopSommeil(null));
  offs.push(() => intercepterMort(null));
  // la liaison : coupée (connexion fermée) ou muette (Wi-Fi perdu, rien ne se ferme) — on le dit, au lieu de laisser
  // jouer avec un coéquipier figé. Un écran revenu de veille repart de zéro (les messages en attente arrivent d'abord).
  net.on('etat', (e) => { if (e === 'ferme') liaisonCoupee(); });
  let visibleDepuis = performance.now();
  const vis = () => { if (!document.hidden) visibleDepuis = performance.now(); };
  document.addEventListener('visibilitychange', vis);
  offs.push(() => document.removeEventListener('visibilitychange', vis));
  const w = setInterval(() => {
    const m = actif && net.pairPresent() && Math.min(net.silenceMs(), performance.now() - visibleDepuis) > RC.SILENCE_MS;
    if (m === muet) return;
    muet = m;
    majBadge();
    if (role === 'invite') bandeauLiaison(m);
  }, 1000);
  offs.push(() => clearInterval(w));
  badge();
}
// L'invité sans nouvelles de l'hôte : le monde est figé chez lui. Il peut attendre (le bandeau s'efface quand la
// liaison revient) ou partir ; son personnage est gardé.
let bandeauMuet = null;
function bandeauLiaison(on) {
  if (!on) { if (bandeauMuet) { bandeauMuet.remove(); bandeauMuet = null; } return; }
  if (bandeauMuet) return;
  bandeauMuet = el('div', { class: 'som-invite coop-liaison', role: 'status' },
    el('span', {}, `Plus de nouvelles de ${nomPair || 'l’hôte'} : tout reste figé tant que la liaison ne revient pas.`),
    el('button', { class: 'btn', type: 'button', onclick: () => { sauverInvite(); ctx.ecranTitre(); } }, 'Quitter la partie'));
  document.body.append(bandeauMuet);
}
function liaisonCoupee() {
  if (!actif || finie) return;
  finie = true; muet = false; bandeauLiaison(false);
  if (role === 'invite') {
    if (G && (G._fin || G._mortTraitee)) { emit('toast', { texte: 'La liaison avec l’hôte est coupée.' }); return; }
    sauverInvite();
    emit('toast', { texte: `La liaison avec ${nomPair || 'l’hôte'} est coupée. Ton personnage est gardé : rejoins sa partie depuis « Jouer à deux ».`, type: 'alerte', duree: 6000 });
    setTimeout(() => { if (actif) ctx.ecranTitre(); }, 2500);
    return;
  }
  // l'hôte garde son monde : il continue seul, et sait comment faire revenir l'autre
  annulerInvitations(); fermerSpectateur(); quitterLieuInvite(); pairPos = null; majBadge();
  emit('toast', { texte: 'La liaison est coupée : ton coéquipier ne te voit plus. Ta partie continue ; pour qu’il revienne, rouvre-la depuis « Jouer à deux ».', type: 'alerte', duree: 7000 });
}
// Messages reçus par les deux machines. true = traité.
function recuCommun(m) {
  switch (m.t) {
    case 'flag': setFlag(m.k, m.v, { distant: true }); return true;
    case 'quete': quetes.avancer(m.id, m.etape, { distant: true }); return true;
    case 'mission':
      if (G && m.id) { G.world.missions = G.world.missions || {}; G.world.missions[m.id] = m.st; }
      // une mission qui commence : elle s'écrit aussi dans le journal de l'invité
      if (G && G.mode === 'invite' && m.notif && m.notif.type === 'nouveau' && m.st && m.st.i === 0 && MISSIONS[m.id]) noteJournal(`Mission — ${MISSIONS[m.id].titre}. ${genrer(MISSIONS[m.id].resume || '')}`, 'objectif');
      if (m.notif) emit('mission:notif', m.notif);
      emit('mission:maj', { id: m.id, distant: true });
      return true;
    case 'pos': pairPos = m.pos; if (m.pos && m.pos.nom) majNomPair(m.pos.nom); majBadge(); return true;
    case 'decl': if (G) { G.world.declencheurs = G.world.declencheurs || {}; G.world.declencheurs[m.cle] = true; } return true;
    case 'decouvert': if (G) { const L = G.world.lieux[m.id] || (G.world.lieux[m.id] = {}); if (!L.decouvert) { L.decouvert = true; emit('lieu:decouvert', { id: m.id, distant: true }); } } return true;
    case 'cine': proposerCine(m.id); return true;
    case 'suivre': proposerSuivre(m); return true;
    case 'scene': spectateur(m); return true;
    case 'relever': releve(m.id); return true;
    case 'releve_nouveau': emit('toast', { texte: `${m.ancien || nomPair || 'Ton coéquipier'} est mort. ${m.nom} prend sa place à tes côtés.`, duree: 6000 }); majNomPair(m.nom); return true;
    case 'mort_pair': emit('toast', { texte: `${m.nom || nomPair || 'Ton coéquipier'} est mort. Ses affaires sont restées là où il est tombé.`, type: 'alerte', duree: 7000 }); return true;
    case 'sommeil': inviterSommeil(m.nom || nomPair || 'Ton coéquipier', m.h, m.id); return true;
    case 'sommeil_go': accordRecu(m.h, m.id); return true;
    case 'sommeil_non': refusRecu(nomPair || 'Ton coéquipier', m.raison, m.id); return true;
    case 'sommeil_attente': attenteRecue(nomPair || 'Ton coéquipier', m.id); return true;   // il lit une scène : ma proposition l'attend
    case 'sommeil_bloc': case 'sommeil_ack': case 'sommeil_fin': recuSommeil(m); return true;   // sommeil à deux, bloc par bloc
    default: return false;
  }
}
// Où je suis : dans un lieu (position précise), sur la carte, en route. (Sur la carte, on n'est PAS dans le lieu : les
// missions de l'autre ne doivent pas croire qu'on y monte la garde.)
function positionPrecise() {
  const j = vueExplore.joueurLocal();
  const p = G.player.position || {};
  if (j && j.lieu && !String(j.lieu).startsWith('__')) {
    // Les coordonnées incluent déjà les abords : l'arrivée ne doit pas les décaler une seconde fois.
    const ab = vueExplore.etatDebug().niveau.abords;
    return { mode: 'lieu', lieu: j.lieu, etage: j.etage, x: +j.x.toFixed(2), y: +j.y.toFixed(2), abords: ab ? { dx: ab.dx, dy: ab.dy } : null };
  }
  const tc = flow.tempsCourant();
  return { mode: tc === 'voyage' ? 'voyage' : tc === 'carte' ? 'carte' : (p.mode === 'lieu' ? 'ailleurs' : p.mode), lieu: p.lieu || (p.voyage && p.voyage.vers) || null };
}
let radioVue = { t: 0, v: false };
function envoyerPos() {
  if (!G || !actif) return;
  const t = performance.now();
  if (t - radioVue.t > 2000) { radioVue = { t, v: (() => { try { return aUneRadio({ seulMoi: true }); } catch (e) { return false; } })() }; }
  envoyer({ t: 'pos', pos: { ...positionPrecise(), nom: G.player.nom, agonie: !!G.player.agonie, horsJeu: flow.enRecit(), radio: radioVue.v } });
}

// ---------- À terre / relevé ----------
let agonieTimer = null;
function aTerre(p, cause) {
  if (!actif || !net.pairPresent() || p.agonie) return false;
  const now = G.world.minutes;
  if (p._derniereAgonie != null && now - p._derniereAgonie < RC.A_TERRE_RELANCE_MIN) return false; // deuxième fois coup sur coup : mort
  p.agonie = { fin: performance.now() + RC.A_TERRE_MS, cause };
  p._derniereAgonie = now;
  p.pv = 1;
  const V = vueExplore.etatDebug();
  if (V && V.canal) V.canal.majJoueur({ agonie: true });
  emit('toast', { texte: `Tu es à terre. ${nomPair || 'Ton coéquipier'} peut te relever — tiens bon.`, duree: 5000 });
  emit('agonie', { on: true });
  envoyerPos();
  clearInterval(agonieTimer);
  agonieTimer = setInterval(() => {
    if (!G || !G.player.agonie) { clearInterval(agonieTimer); return; }
    // ton coéquipier lit une scène ou regarde une cinématique : il ne peut pas venir, le temps ne compte pas
    if (pairPos && pairPos.horsJeu) G.player.agonie.fin += 300;
    if (performance.now() >= G.player.agonie.fin || !net.pairPresent()) {
      clearInterval(agonieTimer);
      const c = G.player.agonie.cause;
      G.player.agonie = null; G.player.pv = 0; G.player.mort = c;
      emit('mort', { cause: c });
    }
  }, 300);
  return true;
}
function releve(id) {
  if (!G || id !== moiId() || !G.player.agonie) return;
  G.player.agonie = null;
  G.player.pv = Math.max(G.player.pv || 0, RC.PV_RELEVE);
  clearInterval(agonieTimer);
  const V = vueExplore.etatDebug();
  if (V && V.canal) V.canal.majJoueur({ agonie: false });
  emit('toast', { texte: `${nomPair || 'Ton coéquipier'} te relève. Debout.` });
  emit('agonie', { on: false });
  envoyerPos();
}

// ---------- La cinématique de l'autre : ensemble si l'on est côte à côte, sinon une invitation ----------
// Jamais imposée : on peut être en plein combat, dans un menu, à l'autre bout de la ville. Côte à côte (même lieu, même
// étage, ≤ 12 m), au calme et libre, on la voit ensemble ; sinon un bandeau « Regarder » reste quelques dizaines de
// secondes (et la cinématique peut se voir plus tard, quand on veut, depuis ce bandeau).
let bandeauCine = null;
function libre() { return !flow.overlayOuvert() && !(G && G.player.agonie) && !vueExplore.enArene(); }
function proposerCine(id) {
  if (!G || !id) return;
  const moi = vueExplore.joueurLocal();
  const V = vueExplore.etatDebug();
  const pres = moi && pairPos && pairPos.mode === 'lieu' && pairPos.lieu === moi.lieu && pairPos.etage === moi.etage && pairPos.x != null && Math.hypot(pairPos.x - moi.x, pairPos.y - moi.y) <= 12;
  const occupe = V && (V.occupe || V.action || V.fouille || V.butin || V.choix);
  const panneau = !!panneauOuvert() || !!document.querySelector('.som-fond');   // sac, journal… ou la fenêtre « Dormir »
  if (pres && libre() && !occupe && !panneau && !vueExplore.menaceProche(10)) {
    emit('toast', { texte: `Vous regardez ensemble, ${nomPair || 'ton coéquipier'} et toi.` });
    flow.cinematique(id, { distant: true });
    return;
  }
  // une seule invitation « Regarder » (la plus récente) ; pendant une scène, elle attend la fin (js/ui/invitations.js)
  let h = null;
  const fin = () => { if (h) h.retirer(); if (bandeauCine === h) bandeauCine = null; };
  const b = el('div', { class: 'som-invite coop-cine' },
    el('span', {}, `${nomPair || 'Ton coéquipier'} vit un moment de l'histoire.`),
    el('button', { class: 'btn', type: 'button', onclick: () => {
      if (!libre()) { emit('toast', { texte: 'Pas maintenant : termine d\'abord ce que tu fais.' }); return; }
      if (vueExplore.menaceProche(9)) { emit('toast', { texte: 'Un mort est trop près.', type: 'alerte' }); return; }
      fin(); flow.cinematique(id, { distant: true });
    } }, 'Regarder'),
    el('button', { class: 'btn', type: 'button', onclick: fin }, 'Plus tard'));
  h = inviter('cine', { element: b, dureeMs: 45000, expire: fin, abandon: fin, annule: () => { if (bandeauCine === h) bandeauCine = null; } });
  bandeauCine = h;
}
// Une scène emmène l'autre ailleurs : côte à côte et au calme, on part avec lui ; sinon on le sait, et « Rejoindre » suffit.
function proposerSuivre(m) {
  const L = lieuDe(m.lieu);
  const moi = vueExplore.joueurLocal();
  const V = vueExplore.etatDebug();
  const pres = moi && pairPos && pairPos.lieu === moi.lieu && pairPos.etage === moi.etage && pairPos.x != null && Math.hypot(pairPos.x - moi.x, pairPos.y - moi.y) <= 12;
  const nom = m.nom || nomPair || 'Ton coéquipier';
  if (moi && moi.lieu === m.lieu) return;            // déjà là
  if (pres && libre() && !(V && (V.occupe || V.action)) && !vueExplore.menaceProche(9)) {
    emit('toast', { texte: `Tu suis ${nom}${L ? ' : ' + (L.court || L.nom) : ''}.` });
    G.player.position = { mode: 'lieu', lieu: m.lieu, entree: m.entree || null };
    setTimeout(() => flow.explorer(m.lieu, { entree: m.entree || undefined }), 400);
    return;
  }
  emit('toast', { texte: `${nom} est parti${L ? ' : ' + (L.court || L.nom) : ' ailleurs'}. Le bouton de ton coéquipier (en haut) te permet de le rejoindre.`, duree: 6000 });
}

// ---------- Mourir à deux ----------
// Ce que le mort portait tombe là où il est tombé (le coéquipier peut tout reprendre : une clé, la radio…).
export function deposerAffaires() {
  const V = vueExplore.etatDebug();
  if (!G || !V || !V.canal || !V.canal.deposer || V.arene) return 0;
  const p = G.player, pos = { etage: V.j.etage, x: V.j.x, y: V.j.y };
  const tas = [];
  for (const it of p.inventaire || []) tas.push({ ...it });
  for (const sl of SLOTS_TENUS) if (p.equip[sl]) tas.push({ id: p.equip[sl], qty: 1, ...((p.equipEtat || {})[sl] || {}) });
  if (p.equip.lampe && p.equip.lampe !== p.equip.mainG) tas.push({ id: p.equip.lampe, qty: 1, ...((p.equipEtat || {}).lampe || {}) });
  if (p.equip.sac) tas.push({ id: p.equip.sac, qty: 1 });
  let n = 0;
  tas.forEach((it, k) => {
    const a = k * 2.4, r = 0.25 + 0.12 * Math.sqrt(k);
    try { V.canal.deposer({ etage: pos.etage, x: pos.x + Math.cos(a) * r, y: pos.y + Math.sin(a) * r }, it); n++; } catch (e) {}
  });
  return n;
}
// Revenir avec un nouveau survivant, auprès du coéquipier s'il est dans un lieu, sinon là où l'on est tombé.
export async function nouveauSurvivant({ nom, genre }, lieuMort = null) {
  if (!G) return;
  const ancien = G.player;
  G.player = joueurNeuf(nom, genre);
  normaliserJoueur(G.player);
  G.player.id = moiId();
  G.player.stats = { ...(G.player.stats || {}), morts: 0 };
  G._mortTraitee = false;
  clearInterval(agonieTimer);
  if (role === 'invite') { try { localStorage.setItem('omd_v3_invite', JSON.stringify({ seed: G.world.seed, player: G.player })); } catch (e) {} }
  const p = pairPos;
  let pos;
  if (p && p.mode === 'lieu' && p.lieu && p.x != null) pos = { mode: 'lieu', lieu: p.lieu, etage: p.etage, x: p.x + 0.8, y: p.y + 0.3, abords: p.abords };
  else pos = { mode: 'lieu', lieu: lieuMort || (ancien.position && ancien.position.lieu) || 'cimetiere', entree: null };
  G.player.position = pos;
  noteJournal(`${ancien.nom} est {mort|morte}. ${nom} a pris la suite.`.replace('{mort|morte}', ancien.genre === 'f' ? 'morte' : 'mort'), 'recit');
  envoyer({ t: 'releve_nouveau', nom, ancien: ancien.nom });
  await flow.explorer(pos.lieu, pos.x != null ? {} : { entree: pos.entree || undefined });
  emit('toast', { texte: `${nom} ouvre les yeux. ${nomPair || 'Ton coéquipier'} est là.`, duree: 5000 });
}
// Quitter pour de bon après une mort (l'invité : son personnage mort ne doit pas revenir).
export function abandonnerApresMort() {
  if (role === 'invite') effacerSauvegarde('invite');
}

// ---------- Suivre la scène de l'autre (panneau non bloquant) ----------
let spect = null, sceneAutre = null, finSpect = null;
function fermerSpectateur() {
  clearTimeout(finSpect); finSpect = null; sceneAutre = null;
  if (spect) { spect.remove(); spect = null; }
}
function majCommandesSpectateur() {
  if (!spect) return;
  const replie = spect.classList.contains('replie'), grand = !replie && spect.classList.contains('grand');
  const taille = spect.querySelector('.coop-spect-taille'), repli = spect.querySelector('.coop-spect-repli');
  taille.textContent = grand ? 'Réduire' : 'Agrandir';
  taille.setAttribute('aria-expanded', String(grand));
  repli.textContent = replie ? '+' : '−';
  repli.setAttribute('aria-label', replie ? 'Afficher le récit' : 'Masquer le récit');
  repli.setAttribute('aria-expanded', String(!replie));
}
function spectateur(m) {
  clearTimeout(finSpect); finSpect = null;
  if (m.etat === 'debut') sceneAutre = m.id || null;
  if (m.etat === 'fin') sceneAutre = null;
  if (m.etat === 'fin') {
    if (spect) {
      const termine = spect;
      termine.classList.add('fin');
      finSpect = setTimeout(() => { finSpect = null; if (spect === termine) fermerSpectateur(); }, 2500);
    }
    return;
  }
  if (!spect) {
    spect = el('aside', { class: 'coop-spect', 'aria-label': 'Récit du partenaire' }, el('header'), el('div', { class: 'coop-spect-t', id: 'coop-spect-texte', tabindex: '0', 'aria-label': 'Texte du récit' }), el('footer'));
    spect.querySelector('header').append(el('b', {}, `${nomPair || 'Ton coéquipier'} vit une scène`),
      el('button', { class: 'coop-spect-taille', type: 'button', 'aria-controls': 'coop-spect-texte', onclick: () => {
        if (spect.classList.contains('replie')) { spect.classList.remove('replie'); spect.classList.add('grand'); }
        else spect.classList.toggle('grand');
        majCommandesSpectateur();
      } }),
      el('button', { class: 'coop-spect-repli', type: 'button', 'aria-controls': 'coop-spect-texte', onclick: () => { spect.classList.toggle('replie'); majCommandesSpectateur(); } }));
    document.body.append(spect);
  }
  spect.classList.remove('fin');
  if (m.etat === 'debut') spect.classList.remove('grand', 'replie');
  majCommandesSpectateur();
  const t = spect.querySelector('.coop-spect-t'), f = spect.querySelector('footer');
  if (m.etat === 'noeud') {
    t.textContent = '';
    if (m.orateur) t.append(el('strong', {}, m.orateur));
    if (m.avant) t.append(el('p', { class: 'avant' }, m.avant));
    for (const par of String(m.texte || '').split(/\n\n+/)) t.append(el('p', {}, par));
    t.scrollTop = 0;
    f.textContent = 'Le choix lui revient…';
  } else if (m.etat === 'choix') f.textContent = `${nomPair || 'Il'} choisit : « ${m.label} »`;
  else if (m.etat === 'debut') { t.textContent = ''; f.textContent = ''; }
}

// ---------- Badge : où est le coéquipier, et « Rejoindre » ----------
let badgeEl = null;
function badge() {
  if (badgeEl) return;
  badgeEl = el('button', { class: 'coop-badge', type: 'button' });
  badgeEl.addEventListener('click', rejoindrePair);
  document.body.append(badgeEl);
  majBadge();
}
function peutRejoindre() {
  if (!pairPos || pairPos.mode !== 'lieu' || !pairPos.lieu || pairPos.x == null) return false;
  const moi = vueExplore.joueurLocal();
  if (moi && moi.lieu === pairPos.lieu) return false;
  if (flow.overlayOuvert() || vueExplore.enArene()) return false;
  return true;
}
function majBadge() {
  if (!badgeEl) return;
  if (!actif || !net.pairPresent()) {
    const horsLigne = actif && !net.connecte();
    badgeEl.textContent = horsLigne ? 'Hors ligne' : actif ? 'En attente d’un coéquipier…' : '';
    badgeEl.style.display = actif ? '' : 'none'; badgeEl.classList.remove('rejoindre'); badgeEl.classList.toggle('alerte', horsLigne);
    badgeEl.classList.toggle('discret', !!vueExplore.joueurLocal());   // dans un lieu, l'encart d'exploration le dit déjà
    return;
  }
  if (muet) { badgeEl.style.display = ''; badgeEl.classList.remove('rejoindre'); badgeEl.classList.add('alerte'); badgeEl.classList.toggle('discret', !!vueExplore.joueurLocal()); badgeEl.textContent = `${nomPair || 'Coéquipier'} ne répond plus…`; return; }
  const L = pairPos && pairPos.lieu ? lieuDe(pairPos.lieu) : null;
  badgeEl.style.display = '';
  const loin = peutRejoindre();
  badgeEl.classList.toggle('rejoindre', loin);
  badgeEl.classList.toggle('alerte', !!(pairPos && pairPos.agonie));
  badgeEl.textContent = `${nomPair || 'Coéquipier'} — ${pairPos && pairPos.mode === 'voyage' ? 'en route vers ' : ''}${L ? (L.court || L.nom) : '…'}${loin ? '  ·  Rejoindre' : ''}`;
  // dans le même lieu, l'encart du HUD d'exploration suffit
  const moi = vueExplore.joueurLocal();
  badgeEl.classList.toggle('discret', !!(moi && pairPos && moi.lieu === pairPos.lieu));
}
async function rejoindrePair() {
  if (!peutRejoindre()) return;
  const p = pairPos;
  G.player.position = { mode: 'lieu', lieu: p.lieu, etage: p.etage, x: p.x + 0.8, y: p.y + 0.3, abords: p.abords };
  emit('toast', { texte: `Tu retrouves ${nomPair || 'ton coéquipier'}.` });
  await flow.explorer(p.lieu);
}

// Prévenir l'autre qu'on vient de mourir (avant l'écran de mort).
export function annoncerMort() { if (actif) envoyer({ t: 'mort_pair', nom: G && G.player.nom }); }
export function arreter() {
  for (const [id, reponse] of rpcAttente) if (reponse.abandonner) { reponse.abandonner(); rpcAttente.delete(id); }
  majTransferts();
  annulerInvitations(); bandeauCine = null;
  offs.forEach(f => { try { f(); } catch (e) {} }); offs = [];
  quitterLieuInvite();
  autorite.toutFermer();
  vueExplore.definirCrochets({ obtenirCanal: null, coop: null });
  net.deconnecter();
  actif = false; role = null; nomPair = null; pairPos = null; muet = false;
  bandeauLiaison(false);
  clearInterval(agonieTimer);
  if (badgeEl) { badgeEl.remove(); badgeEl = null; }
  fermerSpectateur();
}
void genrer;
