// ============ Co-op à deux — session, écrans, routage (HÔTE-AUTORITAIRE) ============
// L'hôte tient le monde (js/game/autorite.js) : horloge, drapeaux, quêtes, lieux occupés, combats.
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
import { statsCombat } from '../combat/stats.js';
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
    <p class="recit" style="font-size:16px">Chacun se déplace librement ; les combats se livrent ensemble. L'hôte tient le monde : l'autre le rejoint là où il en est.</p>
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
  flow.definirCombatCoop(combatHote);
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
  // Combats partagés : relais des événements vers l'invité s'il y participe
  offs.push(on('coop:combat:evts', ({ id, evts }) => { if (invite.combats.has(id)) envoyer({ t: 'c:evts', id, evts }); }));
  const ce = setInterval(() => { for (const id of invite.combats) { const C = autorite.combatDe(id); if (C) envoyer({ t: 'c:etat', id, e: C.sim.etat() }); } }, 50);
  offs.push(() => clearInterval(ce));
}
function envoyerMonde() {
  if (!G) return;
  autorite.sauverTout();
  const monde = { ...G.world };
  envoyer({ t: 'monde', monde, hote: { nom: G.player.nom, position: G.player.position } });
  envoyerPos();
}

const invite = { lieu: null, canal: null, offs: [], combats: new Set() };
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
      for (const evt of ['contact', 'porte', 'bruit', 'hurlement', 'renfort', 'sol', 'conteneur', 'charge', 'zombie']) {
        invite.offs.push(invite.canal.on(evt, (e) => {
          if (evt === 'contact' && e.joueur !== ID_INVITE) return;
          envoyer({ t: 'x:evt', lieu: m.lieu, e });
        }));
      }
      envoyer({ t: 'x:snap', lieu: m.lieu, s: invite.canal.instantane() });
      break;
    }
    case 'x:sortir': if (invite.lieu === m.lieu) quitterLieuInvite(); break;
    case 'x:maj': if (invite.canal && invite.lieu === m.lieu) invite.canal.majJoueur(m.p); break;
    case 'x:bruit': if (invite.canal && invite.lieu === m.lieu) invite.canal.bruit(m.b); break;
    case 'x:rpc': {
      let r = null;
      try {
        if (invite.canal && invite.lieu === m.lieu && typeof invite.canal[m.m] === 'function') r = await invite.canal[m.m](...(m.a || []));
      } catch (e) { r = null; }
      envoyer({ t: 'x:rep', id: m.id, r: r === undefined ? null : r });
      break;
    }
    // --- Combats ---
    case 'c:demande': {
      // L'invité est pris : le combat se joue ICI ; l'hôte peut le rejoindre s'il est tout près.
      const id = m.spec.id || `ci${Date.now().toString(36)}`;
      const C = autorite.creerCombatPartage({ id, spec: m.spec, lieuId: m.spec.lieuId, participants: [{ id: ID_INVITE, nom: nomPair || 'Coéquipier', stats: m.stats }] });
      invite.combats.add(id);
      C.vue(ID_INVITE).on('fin', (r) => { envoyer({ t: 'c:fin', id, r }); invite.combats.delete(id); });
      envoyer({ t: 'c:ok', rid: m.rid, id, e: C.sim.etat() });
      proposerRejoindre(C, m.spec.lieuId, nomPair);
      break;
    }
    case 'c:rejoindre': {
      const C = autorite.combatDe(m.id);
      if (!C || C.estFini()) { envoyer({ t: 'c:refus', rid: m.rid }); break; }
      C.ajouter({ id: ID_INVITE, nom: nomPair || 'Coéquipier', stats: m.stats });
      invite.combats.add(m.id);
      C.vue(ID_INVITE).on('fin', (r) => { envoyer({ t: 'c:fin', id: m.id, r }); invite.combats.delete(m.id); });
      envoyer({ t: 'c:ok', rid: m.rid, id: m.id, e: C.sim.etat() });
      break;
    }
    case 'c:action': { const C = autorite.combatDe(m.id); if (C) C.vue(ID_INVITE).action(m.a); break; }
    default: break;
  }
}

// Combat de l'HÔTE (contact dans un lieu, rencontre de voyage, scène) : combat partagé ; l'invité est invité s'il est près.
async function combatHote(spec) {
  const id = spec.id || `ch${Date.now().toString(36)}`;
  const C = autorite.creerCombatPartage({ id, spec, lieuId: spec.lieuId, participants: [{ id: ID_HOTE, nom: G.player.nom, stats: statsCombat(G.player, { tactile: matchMedia('(pointer: coarse)').matches }) }] });
  // Invitation à l'invité s'il est dans le même lieu
  const pos = G.player.position || {};
  if (net.pairPresent() && pos.mode === 'lieu' && invite.lieu === pos.lieu) envoyer({ t: 'c:invitation', id, nom: G.player.nom, lieu: pos.lieu });
  return C.vue(ID_HOTE);
}
// L'hôte voit un bouton pour rejoindre le combat de l'invité (même lieu).
function proposerRejoindre(C, lieuId, nom) {
  const pos = G && G.player.position;
  if (!pos || pos.mode !== 'lieu' || pos.lieu !== lieuId) return;
  bouttonRejoindre(`Rejoindre le combat de ${nom || 'ton coéquipier'}`, async () => {
    if (C.estFini()) return;
    C.ajouter({ id: ID_HOTE, nom: G.player.nom, stats: statsCombat(G.player) });
    const vue = await import('../explore/vue.js');
    try { vue.pause(); } catch (e) {}
    const m = await import('../combat/vue.js');
    await m.ouvrir({ spec: { ...C.spec, lieuId }, canal: C.vue(ID_HOTE) });
    try { vue.reprise(); } catch (e) {}
  }, C);
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
  flow.definirCombatCoop(combatInvite);
  // sauvegarde locale du seul personnage
  const s = setInterval(() => { if (G) try { localStorage.setItem('omd_v3_invite', JSON.stringify({ seed: G.world.seed, player: G.player })); } catch (e) {} }, 10000);
  offs.push(() => clearInterval(s));
}

let lieuDistant = null; // canal distant courant (exploration)
const combatsDistants = new Map(); // id → canal distant de combat
function recuInvite(m) {
  switch (m.t) {
    case 'horloge': clock.setMinutesDistantes(m.m); break;
    case 'flag': setFlag(m.k, m.v, { distant: true }); break;
    case 'quete': quetes.avancer(m.id, m.etape, { distant: true }); break;
    case 'pos': pairPos = m.pos; majBadge(); break;
    case 'x:snap': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._snap(m.s); break;
    case 'x:evt': if (lieuDistant && lieuDistant.lieu === m.lieu) lieuDistant._evt(m.e); break;
    case 'x:rep': { const f = rpcAttente.get(m.id); if (f) { rpcAttente.delete(m.id); f(m.r); } break; }
    case 'c:ok': case 'c:refus': { const f = rpcAttente.get(m.rid); if (f) { rpcAttente.delete(m.rid); f(m); } break; }
    case 'c:etat': { const c = combatsDistants.get(m.id); if (c) c._etat(m.e); break; }
    case 'c:evts': { const c = combatsDistants.get(m.id); if (c) c._evts(m.evts); break; }
    case 'c:fin': { const c = combatsDistants.get(m.id); if (c) c._fin(m.r); break; }
    case 'c:invitation': bouttonRejoindre(`Rejoindre le combat de ${m.nom || 'l\'hôte'}`, () => rejoindreCombatHote(m.id, m.lieu)); break;
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
    attaquer: (uid) => appel('attaquer', [uid]).then(r => r || { ok: false }),
    blesserZombie: (uid, n) => appel('blesserZombie', [uid, n]),
    retirerZombies: (uids, o) => appel('retirerZombies', [uids, o]),
    repousserZombies: (uids, d) => appel('repousserZombies', [uids, d]),
    finCombat: () => { appel('finCombat', []); },
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

// ---------- Canal DISTANT de combat (même interface que creerCanalCombat) ----------
function canalCombatDistant(id, etat0) {
  const ab = { evt: new Set(), fin: new Set() };
  let etat = etat0, res = null;
  const vus = new Set();
  const c = {
    joueurId: ID_INVITE,
    _etat(e) { etat = e; },
    _evts(evts) { for (const e of evts) { if (e.n != null) { if (vus.has(e.n)) continue; vus.add(e.n); } for (const fn of [...ab.evt]) { try { fn(e); } catch (err) { console.error(err); } } } },
    _fin(r) { res = r; for (const fn of [...ab.fin]) { try { fn(r); } catch (err) { console.error(err); } } combatsDistants.delete(id); },
    action(a) { envoyer({ t: 'c:action', id, a }); return { ok: true }; },
    etat: () => etat,
    resultat: () => res,
    on(evt, fn) { (ab[evt] || (ab[evt] = new Set())).add(fn); return () => ab[evt].delete(fn); },
    demarrer() {}, arreter() {}, pause() {},
  };
  combatsDistants.set(id, c);
  return c;
}
async function combatInvite(spec) {
  const stats = statsCombat(G.player, { tactile: matchMedia('(pointer: coarse)').matches });
  const rep = await rpc({ t: 'c:demande', spec, stats });
  if (!rep || rep.t !== 'c:ok') { emit('toast', { texte: 'Liaison perdue avec l\'hôte.' }); return canalCombatFuite(); }
  return canalCombatDistant(rep.id, rep.e);
}
async function rejoindreCombatHote(id, lieuId) {
  const stats = statsCombat(G.player);
  const rep = await rpc({ t: 'c:rejoindre', id, stats });
  if (!rep || rep.t !== 'c:ok') { emit('toast', { texte: 'Le combat est déjà fini.' }); return; }
  const canal = canalCombatDistant(rep.id, rep.e);
  const vue = await import('../explore/vue.js');
  try { vue.pause(); } catch (e) {}
  const m = await import('../combat/vue.js');
  await m.ouvrir({ spec: { lieuId, id }, canal });
  try { vue.reprise(); } catch (e) {}
}
// Repli si l'hôte ne répond pas : un combat « fuite » immédiat (on ne bloque jamais le joueur).
function canalCombatFuite() {
  const ab = { evt: new Set(), fin: new Set() };
  const r = { issue: 'fuite', tues: [], fuis: [] };
  setTimeout(() => ab.fin.forEach(f => f(r)), 50);
  return { joueurId: ID_INVITE, action: () => ({ ok: false }), etat: () => ({ participants: [{ id: ID_INVITE, nom: '', pv: 0, pvMax: 1, sta: 0, staMax: 1, arme: {}, accesRapide: [] }], zombies: [], fini: true }), resultat: () => r, on(e, f) { (ab[e] || (ab[e] = new Set())).add(f); return () => {}; }, demarrer() {}, arreter() {}, pause() {} };
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
// Bouton flottant « Rejoindre le combat »
function bouttonRejoindre(texte, action, C) {
  const b = el('button', { class: 'coop-rejoindre btn primaire', onclick: () => { b.remove(); action(); } }, texte);
  document.body.append(b);
  const t0 = Date.now();
  const iv = setInterval(() => { if (!b.isConnected || Date.now() - t0 > 20000 || (C && C.estFini())) { clearInterval(iv); b.remove(); } }, 500);
}

export function arreter() {
  offs.forEach(f => { try { f(); } catch (e) {} }); offs = [];
  quitterLieuInvite();
  autorite.toutFermer();
  flow.definirCombatCoop(null);
  import('../explore/vue.js').then(v => v.definirCrochets({ obtenirCanal: null })).catch(() => {});
  net.deconnecter();
  actif = false; role = null; nomPair = null; pairPos = null;
  if (badgeEl) { badgeEl.remove(); badgeEl = null; }
  document.querySelectorAll('.coop-rejoindre').forEach(b => b.remove());
}
