// ============ Co-op à deux — session, écrans, routage (HÔTE-AUTORITAIRE) ============
// L'hôte tient le monde (js/game/autorite.js) : horloge, drapeaux, quêtes, lieux occupés — et donc les combats,
// qui se jouent dans la simulation du lieu (temps réel). L'invité envoie ses gestes (x:act), l'hôte relaie tout.
// Ce que la co-op ajoute au jeu :
//   - VOIR L'AUTRE : il est toujours dessiné dans le même lieu (silhouette bleue + nom, même dans le noir),
//     une flèche au bord de l'écran pointe vers lui, l'encart dit où il est (étage, lieu, distance) ;
//   - SE RETROUVER : « Rejoindre » le téléporte auprès de l'autre (il est loin dans un autre lieu) ;
//   - SE RELEVER : à 0 PV on tombe « à terre » 30 s, l'autre peut te relever (E) ; sinon, c'est la mort ;
//   - L'HISTOIRE À DEUX : drapeaux, quêtes, déclencheurs déjà joués, lieux découverts, cinématiques partagés ;
//     quand l'un vit une scène, l'autre la suit en direct dans un panneau (sans être bloqué) ; certains moments
//     exigent d'être deux au même endroit (déclencheurs et portes « deux »).
// Réseau : instantanés du lieu de l'invité à 15 Hz, en DIFFÉRENTIEL (portes, sol, cadavres, conteneurs seulement
// quand ils changent), position de l'invité à 20 Hz, positions croisées (lieu, étage, x, y) à 4 Hz.
import { G, setG, joueurNeuf, setFlag, genrer, utiliserCleSauvegarde } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, $, escapeHtml } from '../core/util.js';
import * as net from './net.js';
import * as autorite from '../game/autorite.js';
import * as flow from '../game/flow.js';
import * as quetes from '../game/quetes.js';
import { lieu as lieuDe } from '../game/donnees.js';
import { intercepterMort } from '../game/survival.js';
import * as vueExplore from '../explore/vue.js';
import { REGLAGES } from '../data/reglages.js';
import { SERVEUR_EN_LIGNE } from '../data/serveur.js';
import { majDisponible, appliquerMaj } from '../version.js';

const ID_HOTE = 'hote', ID_INVITE = 'invite';
const RC = REGLAGES.coop;
let role = null;           // 'hote' | 'invite' | null
let actif = false;
let offs = [];
let nomPair = null;
let pairPos = null;        // { mode, lieu, etage, x, y, agonie, nom }
const rpcAttente = new Map(); let rpcSeq = 1;
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
function ecranSalons(url) {
  const c = ctx.afficher(`
    <h2 class="gros-titre">Parties ${url ? 'en ligne' : 'sur ce Wi-Fi'}</h2>
    <div class="menu">${btn('data-s="hote"', 'Héberger une partie', 'tu crées le monde, l\'autre te rejoint', 'primaire')}</div>
    <div class="champ">Parties ouvertes</div>
    <div class="menu" id="co-liste"><p class="aide">Recherche…</p></div>
    <p class="aide" id="co-statut"></p>
    <div class="menu">${btn('data-s="maj"', 'Rafraîchir')}${btn('data-s="retour"', 'Retour')}</div>`, 'place_crousillat_nuit');
  const charger = async () => {
    const liste = $('#co-liste'); if (!liste) return;
    liste.innerHTML = '<p class="aide">Recherche…</p>';
    const salons = await net.listerSalons(url);
    if (!$('#co-liste')) return;
    if (!salons.length) { liste.innerHTML = '<p class="aide">Aucune partie ouverte. Héberge la tienne, ou demande à l\'autre joueur de le faire.</p>'; return; }
    liste.innerHTML = salons.map(s => btn(`data-code="${escapeHtml(s.code)}"`, escapeHtml(s.nom || 'Partie'), `Jour ${s.jour} — ${String(s.heure).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`)).join('');
    liste.querySelectorAll('[data-code]').forEach(b => b.onclick = () => rejoindre(url, b.dataset.code));
  };
  charger();
  c.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
    if (b.dataset.s === 'retour') return ecranCoop(ctx);
    if (b.dataset.s === 'maj') return charger();
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
  // encart du HUD : où est l'autre ?
  info(V, pairs) {
    if (!actif || !net.pairPresent()) return actif ? { texte: 'En attente de ton coéquipier…' } : null;
    const nom = nomPair || 'Coéquipier';
    const p = pairs.find(q => q.etage === V.j.etage) || pairs[0];
    if (p) {
      if (p.agonie) return { texte: `${nom} est à terre ! Va le relever (E)`, alerte: true };
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
async function heberger(url, { nom, genre, difficulte }) {
  const code = code4();
  const r = await net.connecter({ url, code, role: 'host', nom, meta: { jour: 1, heure: 8, minute: 0 } });
  if (!r.ok) { emit('toast', { texte: 'Hébergement impossible : ' + (r.raison || 'serveur injoignable.') }); return; }
  role = 'hote'; actif = true;
  brancherHote();
  brancherCommun();
  await ctx.nouvelleAventure({ nom, genre, difficulte, mode: 'hote' });
  G.player.id = ID_HOTE;
  emit('toast', { texte: `Partie ouverte (${code}). L'autre joueur n'a qu'à la rejoindre.` });
}

function brancherHote() {
  vueExplore.definirCrochets({ obtenirCanal: (lieuId, niveau, L) => autorite.canalLieu(lieuId, niveau, L, ID_HOTE), coop: crochetCoop });
  net.on('pair', (present, m) => {
    if (present) { majNomPair((m && m.nom) || net.nomPair()); emit('toast', { texte: `${nomPair || 'Ton coéquipier'} arrive.` }); envoyerMonde(); }
    else { emit('toast', { texte: `${nomPair || 'Ton coéquipier'} est parti.` }); quitterLieuInvite(); pairPos = null; majBadge(); }
  });
  net.on('message', (m) => { try { recuHote(m); } catch (e) { console.error('[coop] hôte', m && m.t, e); } });
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
const EVTS_RELAIS = ['porte', 'bruit', 'hurlement', 'sol', 'conteneur', 'charge', 'zombie',
  'telegraphe', 'fente', 'attaque', 'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule', 'esquive'];
function quitterLieuInvite() {
  invite.offs.forEach(f => f()); invite.offs = [];
  if (invite.canal) { try { invite.canal.fermer(); } catch (e) {} }
  invite.canal = null; invite.lieu = null;
}
async function recuHote(m) {
  if (recuCommun(m)) return;
  switch (m.t) {
    case 'bonjour': majNomPair(m.nom); envoyerMonde(); break;
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
    case 'x:maj': if (invite.canal && invite.lieu === m.lieu) invite.canal.majJoueur(m.p); break;
    case 'x:bruit': if (invite.canal && invite.lieu === m.lieu) invite.canal.bruit(m.b); break;
    case 'x:act': if (invite.canal && invite.lieu === m.lieu) invite.canal.action(m.a); break;
    case 'x:rpc': {
      let r = null;
      try { if (invite.canal && invite.lieu === m.lieu && typeof invite.canal[m.m] === 'function') r = await invite.canal[m.m](...(m.a || [])); }
      catch (e) { r = null; }
      envoyer({ t: 'x:rep', id: m.id, r: r === undefined ? null : r });
      break;
    }
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
  const r = await net.connecter({ url, code, role: 'guest', nom: 'Invité' });
  if (!r.ok) { if (statut) statut.textContent = 'Échec : ' + (r.raison || 'connexion impossible.'); return; }
  net.on('message', (m) => {
    if (m.t === 'monde') { if (!entre) { entre = true; adopterMonde(m); } return; }
    try { recuInvite(m); } catch (e) { console.error('[coop] invité', m && m.t, e); }
  });
  net.on('pair', (present) => { if (!present && actif) { emit('toast', { texte: 'L\'hôte a quitté la partie.' }); setTimeout(() => ctx.ecranTitre(), 1500); } });
  role = 'invite'; actif = true;
  if (statut) statut.textContent = 'Connecté — en attente du monde de l\'hôte…';
  envoyer({ t: 'bonjour', nom: 'Invité' });
}
function adopterMonde({ monde, hote }) {
  majNomPair((hote && hote.nom) || 'l\'hôte');
  let perso = null;
  try { const s = JSON.parse(localStorage.getItem('omd_v3_invite') || 'null'); if (s && s.seed === monde.seed && s.player) perso = s.player; } catch (e) {}
  const entrer = (player, neuf) => {
    setG({ v: 3, mode: 'invite', cree: Date.now(), world: monde, player, journal: [], documents: [], carteNotes: {} });
    G.pairNom = nomPair;
    utiliserCleSauvegarde('invite');
    G.player.id = ID_INVITE;
    brancherInvite();
    brancherCommun();
    envoyer({ t: 'bonjour', nom: G.player.nom });
    // on arrive AUPRÈS de l'hôte (pas à l'autre bout de la carte)
    const hp = hote && hote.position;
    let pos;
    if (hp && hp.mode === 'lieu' && hp.lieu && hp.x != null) pos = { mode: 'lieu', lieu: hp.lieu, etage: hp.etage, x: hp.x + 0.8, y: hp.y + 0.3 };
    else if (!neuf && player.position && player.position.lieu) pos = player.position;
    else pos = { mode: 'lieu', lieu: (hp && hp.lieu) || 'cimetiere' };
    G.player.position = pos;
    ctx.demarrerInvite({ position: pos, auprès: true, neuf });
    emit('toast', { texte: `Tu rejoins la partie de ${nomPair}.` });
  };
  if (perso) return entrer(perso, false);
  ctx.ecranCreation({ mode: 'invite', apres: ({ nom, genre }) => entrer(joueurNeuf(nom, genre), true) });
}
function brancherInvite() {
  vueExplore.definirCrochets({ obtenirCanal: (lieuId, niveau) => canalDistant(lieuId, niveau), coop: crochetCoop });
  const s = setInterval(() => { if (G) try { localStorage.setItem('omd_v3_invite', JSON.stringify({ seed: G.world.seed, player: G.player })); } catch (e) {} }, 10000);
  offs.push(() => clearInterval(s));
}
let lieuDistant = null;
function recuInvite(m) {
  if (recuCommun(m)) return;
  switch (m.t) {
    case 'horloge': clock.setMinutesDistantes(m.m); break;
    case 'x:snap': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._snap(m.s); break;
    case 'x:evt': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._evt(m.e); break;
    case 'x:rep': { const f = rpcAttente.get(m.id); if (f) { rpcAttente.delete(m.id); f(m.r); } break; }
    default: break;
  }
}
function rpc(msg) {
  return new Promise((ok) => {
    const id = rpcSeq++;
    rpcAttente.set(id, ok);
    envoyer({ ...msg, id, rid: id });
    setTimeout(() => { if (rpcAttente.has(id)) { rpcAttente.delete(id); ok(null); } }, 4000);
  });
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
      if (s.portes) for (const p of niveau.portes) {
        const st = s.portes[p.cle]; if (!st) continue;
        const E = niveau.etages[niveau.etageIdx[p.etage]]; const i = p.y * E.w + p.x;
        const ferme = st.etat === 'fermee' || st.etat === 'verrouillee';
        dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = ferme ? 1 : 0;
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
    prendre: (cle, i) => appel('prendre', [cle, i]),
    deposer: (pos, item) => appel('deposer', [pos, item]),
    action(a) { if (majTimer) { clearTimeout(majTimer); majTimer = null; if (majEnAttente) envoyer({ t: 'x:maj', lieu: lieuId, p: majEnAttente }); majEnAttente = null; } envoyer({ t: 'x:act', lieu: lieuId, a }); return Promise.resolve({ ok: true }); },
    faireApparaitre: (l, o) => appel('faireApparaitre', [l, o]).then(r => r || []),
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
  offs.push(on('declencheur', ({ cle }) => envoyer({ t: 'decl', cle })));
  offs.push(on('lieu:decouvert', ({ id, distant }) => { if (!distant) envoyer({ t: 'decouvert', id }); }));
  offs.push(on('cinematique', ({ id }) => envoyer({ t: 'cine', id })));
  offs.push(on('scene:debut', ({ id }) => envoyer({ t: 'scene', etat: 'debut', id, nom: G && G.player.nom })));
  offs.push(on('scene:noeud', (n) => envoyer({ t: 'scene', etat: 'noeud', ...n })));
  offs.push(on('scene:choix', (n) => envoyer({ t: 'scene', etat: 'choix', ...n })));
  offs.push(on('scene:fin', ({ id }) => envoyer({ t: 'scene', etat: 'fin', id })));
  offs.push(on('temps', () => envoyerPos()));
  offs.push(on('lieu:entre', () => envoyerPos()));
  const p = setInterval(envoyerPos, 250);
  offs.push(() => clearInterval(p));
  // à 0 PV : « à terre » au lieu de mourir, tant que le coéquipier est là
  intercepterMort(aTerre);
  offs.push(() => intercepterMort(null));
  badge();
}
// Messages reçus par les deux machines. true = traité.
function recuCommun(m) {
  switch (m.t) {
    case 'flag': setFlag(m.k, m.v, { distant: true }); return true;
    case 'quete': quetes.avancer(m.id, m.etape, { distant: true }); return true;
    case 'pos': pairPos = m.pos; if (m.pos && m.pos.nom) majNomPair(m.pos.nom); majBadge(); return true;
    case 'decl': if (G) { G.world.declencheurs = G.world.declencheurs || {}; G.world.declencheurs[m.cle] = true; } return true;
    case 'decouvert': if (G) { const L = G.world.lieux[m.id] || (G.world.lieux[m.id] = {}); if (!L.decouvert) { L.decouvert = true; emit('lieu:decouvert', { id: m.id, distant: true }); } } return true;
    case 'cine': if (flow.tempsCourant() === 'exploration' && !flow.overlayOuvert()) flow.cinematique(m.id, { distant: true }); return true;
    case 'scene': spectateur(m); return true;
    case 'relever': releve(m.id); return true;
    default: return false;
  }
}
function positionPrecise() {
  const j = vueExplore.joueurLocal();
  const p = G.player.position || {};
  if (j && j.lieu && !String(j.lieu).startsWith('__')) return { mode: 'lieu', lieu: j.lieu, etage: j.etage, x: +j.x.toFixed(2), y: +j.y.toFixed(2) };
  return { mode: p.mode, lieu: p.lieu || (p.voyage && p.voyage.vers) || null };
}
function envoyerPos() {
  if (!G || !actif) return;
  envoyer({ t: 'pos', pos: { ...positionPrecise(), nom: G.player.nom, agonie: !!G.player.agonie } });
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

// ---------- Suivre la scène de l'autre (panneau non bloquant) ----------
let spect = null;
function spectateur(m) {
  if (m.etat === 'fin') { if (spect) { spect.classList.add('fin'); setTimeout(() => { if (spect) { spect.remove(); spect = null; } }, 2500); } return; }
  if (!spect) {
    spect = el('aside', { class: 'coop-spect' }, el('header'), el('div', { class: 'coop-spect-t' }), el('footer'));
    spect.querySelector('header').append(el('b', {}, `${nomPair || 'Ton coéquipier'} vit une scène`), el('button', { type: 'button', 'aria-label': 'Masquer', onclick: () => spect.classList.toggle('replie') }, '–'));
    document.body.append(spect);
  }
  spect.classList.remove('fin');
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
  if (!actif || !net.pairPresent()) { badgeEl.textContent = actif ? 'En attente d’un coéquipier…' : ''; badgeEl.style.display = actif ? '' : 'none'; badgeEl.classList.remove('rejoindre'); return; }
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
  G.player.position = { mode: 'lieu', lieu: p.lieu, etage: p.etage, x: p.x + 0.8, y: p.y + 0.3 };
  emit('toast', { texte: `Tu retrouves ${nomPair || 'ton coéquipier'}.` });
  await flow.explorer(p.lieu);
}

export function arreter() {
  offs.forEach(f => { try { f(); } catch (e) {} }); offs = [];
  quitterLieuInvite();
  autorite.toutFermer();
  vueExplore.definirCrochets({ obtenirCanal: null, coop: null });
  net.deconnecter();
  actif = false; role = null; nomPair = null; pairPos = null;
  clearInterval(agonieTimer);
  if (badgeEl) { badgeEl.remove(); badgeEl = null; }
  if (spect) { spect.remove(); spect = null; }
}
void genrer;
