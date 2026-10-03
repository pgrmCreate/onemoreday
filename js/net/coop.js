// ============ Co-op à deux — session, écrans, routage (HÔTE-AUTORITAIRE) ============
// L'hôte tient le monde (js/game/autorite.js) : horloge, drapeaux, quêtes, lieux occupés — et donc les combats,
// qui se jouent dans la simulation du lieu (temps réel). L'invité envoie ses gestes (x:act), l'hôte relaie tout.
// L'invité possède son personnage et parle au monde par des canaux DISTANTS de même interface
// que les canaux locaux (exploration §12.3, combat §12.4). Plus de « deux mondes » qui divergent.
import { G, setG, joueurNeuf, sauver, setFlag, genrer, noteJournal, utiliserCleSauvegarde } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { el, $, escapeHtml } from '../core/util.js';
import * as net from './net.js';
import * as autorite from '../game/autorite.js';
import * as flow from '../game/flow.js';
import * as quetes from '../game/quetes.js';
import { lieu as lieuDe } from '../game/donnees.js';
import { SERVEUR_EN_LIGNE } from '../data/serveur.js';
import { majDisponible, appliquerMaj } from '../version.js';

const ID_HOTE = 'hote', ID_INVITE = 'invite';
let role = null;           // 'hote' | 'invite' | null
let actif = false;
let offs = [];
let nomPair = null;
let pairPos = null;        // { lieu, mode }
const rpcAttente = new Map(); let rpcSeq = 1;
const ctx = {};            // callbacks du main (afficher, ecranTitre, ecranCreation, demarrerInvite)

export function estCoop() { return actif; }
export function monRole() { return role; }
export function moiId() { return role === 'invite' ? ID_INVITE : ID_HOTE; }
function envoyer(m) { net.envoyer(m); }

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
    <p class="recit" style="font-size:16px">Chacun se déplace librement ; dans le même lieu, on se bat côte à côte. L'hôte tient le monde : l'autre le rejoint là où il en est.</p>
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
//  HÔTE
// =====================================================================
async function heberger(url, { nom, genre, difficulte }) {
  const code = code4();
  const r = await net.connecter({ url, code, role: 'host', nom, meta: { jour: 1, heure: 8, minute: 0 } });
  if (!r.ok) { emit('toast', { texte: 'Hébergement impossible : ' + (r.raison || 'serveur injoignable.') }); return; }
  role = 'hote'; actif = true;
  brancherCommun();
  brancherHote();
  await ctx.nouvelleAventure({ nom, genre, difficulte, mode: 'hote' });
  G.player.id = ID_HOTE;
  emit('toast', { texte: `Partie ouverte (${code}). L'autre joueur n'a qu'à la rejoindre.` });
}

function brancherHote() {
  // Le monde « tenu » : l'exploration de l'hôte passe elle aussi par l'autorité.
  import('../explore/vue.js').then(v => v.definirCrochets({ obtenirCanal: (lieuId, niveau, L) => autorite.canalLieu(lieuId, niveau, L, ID_HOTE) }));
  net.on('pair', (present, m) => {
    if (present) { nomPair = (m && m.nom) || net.nomPair(); emit('toast', { texte: `${nomPair || 'Ton coéquipier'} arrive.` }); envoyerMonde(); }
    else { emit('toast', { texte: `${nomPair || 'Ton coéquipier'} est parti.` }); quitterLieuInvite(); pairPos = null; majBadge(); }
  });
  net.on('message', (m) => { try { recuHote(m); } catch (e) { console.error('[coop] hôte', m && m.t, e); } });
  // Horloge et fiche du salon
  const t = setInterval(() => {
    if (!G || !actif) return;
    envoyer({ t: 'horloge', m: G.world.minutes });
    envoyer({ t: 'heure', jour: clock.jour(), heure: clock.heure(), minute: clock.minute() });
  }, 1000);
  offs.push(() => clearInterval(t));
  // Instantanés du lieu de l'invité (10 Hz)
  const s = setInterval(() => {
    if (!invite.lieu) return;
    const sim = autorite.simDe(invite.lieu);
    if (sim) envoyer({ t: 'x:snap', lieu: invite.lieu, s: sim.instantane() });
  }, 100);
  offs.push(() => clearInterval(s));
}
function envoyerMonde() {
  if (!G) return;
  autorite.sauverTout();
  const monde = { ...G.world };
  envoyer({ t: 'monde', monde, hote: { nom: G.player.nom, position: G.player.position } });
  envoyerPos();
}

const invite = { lieu: null, canal: null, offs: [] };
const EVTS_RELAIS = ['porte', 'bruit', 'hurlement', 'sol', 'conteneur', 'charge', 'zombie',
  'telegraphe', 'attaque', 'blessure', 'saisie', 'martele', 'degage', 'coup', 'rate', 'coup_vide', 'mort_zombie', 'poussee', 'tir', 'bouscule'];
function quitterLieuInvite() {
  invite.offs.forEach(f => f()); invite.offs = [];
  if (invite.canal) { try { invite.canal.fermer(); } catch (e) {} }
  invite.canal = null; invite.lieu = null;
}
async function recuHote(m) {
  switch (m.t) {
    case 'bonjour': nomPair = m.nom || nomPair; envoyerMonde(); break;
    case 'flag': setFlag(m.k, m.v, { distant: true }); break;
    case 'quete': quetes.avancer(m.id, m.etape, { distant: true }); break;
    case 'pos': pairPos = m.pos; majBadge(); break;
    case 'x:entrer': {
      quitterLieuInvite();
      const { chargerNiveau } = await import('../game/donnees.js');
      const { parserNiveau } = await import('../explore/niveau.js');
      const def = await chargerNiveau(m.lieu); if (!def) return;
      const niveau = parserNiveau(def);
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
      try {
        if (invite.canal && invite.lieu === m.lieu && typeof invite.canal[m.m] === 'function') r = await invite.canal[m.m](...(m.a || []));
      } catch (e) { r = null; }
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
  nomPair = (hote && hote.nom) || 'l\'hôte';
  // Mon personnage : repris d'une précédente session sur CE monde, sinon création.
  let perso = null;
  try { const s = JSON.parse(localStorage.getItem('omd_v3_invite') || 'null'); if (s && s.seed === monde.seed && s.player) perso = s.player; } catch (e) {}
  const entrer = (player) => {
    setG({ v: 3, mode: 'invite', cree: Date.now(), world: monde, player, journal: [], documents: [], carteNotes: {} });
    utiliserCleSauvegarde('invite');
    G.player.id = ID_INVITE;
    brancherCommun();
    brancherInvite();
    envoyer({ t: 'bonjour', nom: G.player.nom });
    envoyerPos();
    const pos = (player.position && player.position.lieu) ? player.position : (hote && hote.position) || { lieu: 'cimetiere' };
    ctx.demarrerInvite({ position: pos.mode === 'lieu' ? pos : { lieu: (hote.position && hote.position.lieu) || 'cimetiere' } });
    emit('toast', { texte: `Tu rejoins la partie de ${nomPair}.` });
  };
  if (perso) return entrer(perso);
  ctx.ecranCreation({ mode: 'invite', apres: ({ nom, genre }) => entrer(joueurNeuf(nom, genre)) });
}

function brancherInvite() {
  import('../explore/vue.js').then(v => v.definirCrochets({ obtenirCanal: (lieuId, niveau) => canalDistant(lieuId, niveau) }));
  // sauvegarde locale du seul personnage
  const s = setInterval(() => { if (G) try { localStorage.setItem('omd_v3_invite', JSON.stringify({ seed: G.world.seed, player: G.player })); } catch (e) {} }, 10000);
  offs.push(() => clearInterval(s));
}

let lieuDistant = null; // canal distant courant (exploration — le combat compris)
function recuInvite(m) {
  switch (m.t) {
    case 'horloge': clock.setMinutesDistantes(m.m); break;
    case 'flag': setFlag(m.k, m.v, { distant: true }); break;
    case 'quete': quetes.avancer(m.id, m.etape, { distant: true }); break;
    case 'pos': pairPos = m.pos; majBadge(); break;
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
      snap = s;
      for (const p of niveau.portes) {
        const st = s.portes && s.portes[p.cle]; if (!st) continue;
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
      if (!majTimer) majTimer = setTimeout(() => { majTimer = null; envoyer({ t: 'x:maj', lieu: lieuId, p: majEnAttente }); majEnAttente = null; }, 100);
    },
    bruit(b) { envoyer({ t: 'x:bruit', lieu: lieuId, b }); },
    porte: (cle, action) => appel('porte', [cle, action]).then(r => r || { ok: false, raison: 'réseau' }),
    fouiller: (cle) => appel('fouiller', [cle]).then(r => r || { items: [], dureeMs: 0 }),
    arreterFouille: (p) => { appel('arreterFouille', [p]); },
    prendre: (cle, i) => appel('prendre', [cle, i]),
    deposer: (pos, item) => appel('deposer', [pos, item]),
    action(a) { envoyer({ t: 'x:act', lieu: lieuId, a }); return Promise.resolve({ ok: true }); },
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
//  COMMUN
// =====================================================================
function brancherCommun() {
  offs.push(on('flag', ({ k, v, distant }) => { if (!distant) envoyer({ t: 'flag', k, v }); }));
  offs.push(on('quete', ({ id, etape, distant }) => { if (!distant) envoyer({ t: 'quete', id, etape }); }));
  offs.push(on('temps', () => envoyerPos()));
  offs.push(on('lieu:entre', () => envoyerPos()));
  badge();
}
function envoyerPos() {
  if (!G) return;
  const p = G.player.position || {};
  envoyer({ t: 'pos', pos: { mode: p.mode, lieu: p.lieu || (p.voyage && p.voyage.vers) || null, nom: G.player.nom } });
}

// Petit badge : où est le coéquipier
let badgeEl = null;
function badge() {
  if (badgeEl) return;
  badgeEl = el('div', { class: 'coop-badge' });
  document.body.append(badgeEl);
  majBadge();
}
function majBadge() {
  if (!badgeEl) return;
  if (!actif || !net.pairPresent()) { badgeEl.textContent = actif ? 'En attente d’un coéquipier…' : ''; badgeEl.style.display = actif ? '' : 'none'; return; }
  const L = pairPos && pairPos.lieu ? lieuDe(pairPos.lieu) : null;
  badgeEl.style.display = '';
  badgeEl.textContent = `${nomPair || 'Coéquipier'} — ${pairPos && pairPos.mode === 'voyage' ? 'en route vers ' : ''}${L ? (L.court || L.nom) : '…'}`;
}

export function arreter() {
  offs.forEach(f => { try { f(); } catch (e) {} }); offs = [];
  quitterLieuInvite();
  autorite.toutFermer();
  import('../explore/vue.js').then(v => v.definirCrochets({ obtenirCanal: null })).catch(() => {});
  net.deconnecter();
  actif = false; role = null; nomPair = null; pairPos = null;
  if (badgeEl) { badgeEl.remove(); badgeEl = null; }
}
