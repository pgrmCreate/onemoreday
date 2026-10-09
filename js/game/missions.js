// ============ Missions — le moteur (contenu : js/data/histoire/missions.js) ============
// État partagé : G.world.missions[id] = { etat, i, depuis, d }
//   etat ∈ 'proposee' (offre vue, « plus tard ») | 'active' | 'reussie' | 'echouee' | 'refusee'
//   i = étape courante ; d = données de l'étape (compte de minutes, jours nourris, santé du PNJ, morts restants…).
// Tourne chez qui tient le monde (solo, hôte) ; l'invité reçoit l'état et les bandeaux (js/net/coop.js, message 'mission').
// Ce qui se joue sur place (morts restants, pièce atteinte, vagues, PNJ blessé, geste) : js/explore/missions_vue.js.
// Bus : 'mission:maj' { id, notif?, distant? } ; 'mission:notif' { type, titre, texte } (bandeau, js/ui/notif.js) ;
//       'mission:etape' { id, i }. Effet de scène : { mission: ['accepter' | 'plusTard' | 'refuser', id] | ['donner', id, objet] }.
import { G, genrer, noteJournal } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { MISSIONS } from '../data/histoire/missions.js';
import { REGLAGES } from '../data/reglages.js';
import { SCENES, lieu as lieuDe, objet } from './donnees.js';
import { verifier } from './conditions.js';
import { appliquerEffets } from './effects.js';
import * as inv from './inventory.js';
import { pointsAliment, motPortion } from './survival.js';

export { MISSIONS };
const W = () => G && G.world;
const tenant = () => !!G && G.mode !== 'invite';     // qui fait avancer les missions
const maintenant = () => (G ? G.world.minutes : 0);
const nomLieu = (id) => { const l = lieuDe(id); return l ? l.court || l.nom : id; };
// Les noms de pièces s'écrivent avec ’ ou ' : on compare sans s'en soucier.
export const normNom = (s) => String(s || '').replace(/[’']/g, "'").trim().toLowerCase();

// ---------- Lire l'état ----------
export function etat(id) { const w = W(); return w && w.missions ? w.missions[id] || null : null; }
export function etapeDe(id) { const s = etat(id), m = MISSIONS[id]; return s && s.etat === 'active' && m ? m.etapes[s.i] || null : null; }
export function actives() { return Object.keys(MISSIONS).filter(id => (etat(id) || {}).etat === 'active'); }
// Les missions actives dont l'étape courante se joue dans ce lieu → [{ id, m, s, e }]
export function ici(lieuId) {
  const out = [];
  for (const id of actives()) { const e = etapeDe(id); if (e && e.lieu === lieuId) out.push({ id, m: MISSIONS[id], s: etat(id), e }); }
  return out;
}

function ecrire(id, s, notif = null) {
  const w = W(); if (!w) return;
  w.missions = w.missions || {};
  w.missions[id] = s;
  if (notif) emit('mission:notif', notif);
  emit('mission:maj', { id, notif });
}
const bandeau = (type, titre, texte) => ({ type, titre: genrer(titre || ''), texte: genrer(texte || '') });
// Une info sur place (vague, repéré·e…) : bandeau, sans changer l'état.
export function annoncer(type, titre, texte) { const n = bandeau(type, titre, texte); emit('mission:notif', n); emit('mission:maj', { id: null, notif: n }); }

// ---------- Où est le joueur ? ----------
// Présent·e dans un lieu = l'écran d'exploration de ce lieu est ouvert (le sommeil sur place compte).
let lieuVue = null;
export function present(lieuId) { return !!lieuId && lieuVue === lieuId; }

// ---------- Proposer ----------
const vuesCetteVisite = new Set();      // une offre n'est montrée qu'une fois par visite
// La mission à proposer en arrivant dans ce lieu (piece = null) ou en entrant dans cette pièce.
export function aProposer(lieuId, piece = null) {
  if (!tenant()) return null;
  for (const [id, m] of Object.entries(MISSIONS)) {
    const o = m.offre; if (!o || o.lieu !== lieuId) continue;
    if (piece ? normNom(o.piece) !== normNom(piece) : !!o.piece) continue;
    const s = etat(id); if (s && s.etat !== 'proposee') continue;
    if (vuesCetteVisite.has(id) || !verifier(m.si)) continue;
    return id;
  }
  return null;
}
// Construit la scène d'offre (Accepter / Plus tard / Refuser) et renvoie son id.
export function sceneOffre(id) {
  vuesCetteVisite.add(id);
  const m = MISSIONS[id], sid = 'mission_offre_' + id;
  SCENES[sid] = {
    illu: null, musique: null, orateur: m.pnj ? m.pnj.nom : null,
    texte: m.offre.texte,
    choix: [
      { label: m.offre.accepter || 'Accepter', effets: { mission: ['accepter', id] }, suivant: '#fin' },
      { label: 'Y réfléchir (plus tard)', effets: { mission: ['plusTard', id] }, suivant: '#fin' },
      { label: m.offre.refuser || 'Refuser', effets: { mission: ['refuser', id] }, suivant: '#fin' },
    ],
  };
  return sid;
}

// ---------- Avancer ----------
export function accepter(id) {
  if (!tenant() || !MISSIONS[id]) return;
  const m = MISSIONS[id];
  ecrire(id, { etat: 'active', i: 0, depuis: maintenant(), d: {} });
  noteJournal(`Mission — ${m.titre}. ${genrer(m.resume || '')}`, 'objectif');
  debutEtape(id, true);
}
export function plusTard(id) { if (tenant()) ecrire(id, { etat: 'proposee', depuis: maintenant() }); }
export function refuser(id) { if (tenant()) ecrire(id, { etat: 'refusee', depuis: maintenant() }); }

function debutEtape(id, premiere) {
  const s = etat(id), m = MISSIONS[id], e = m.etapes[s.i];
  s.d = { debut: maintenant() };
  if (e.type === 'tenir' || e.type === 'proteger') s.d.compte = 0;
  if (e.type === 'proteger') s.d.pv = (m.pnj && m.pnj.pv) || 100;
  if (e.type === 'nourrir') Object.assign(s.d, { jour: clock.jour(), mange: 0, faits: 0, rates: 0, grace: clock.jour(), okJour: null });
  if (e.type === 'eliminer') { const L = W().lieux[e.lieu] || (W().lieux[e.lieu] = {}); delete L.calmeJusqua; }
  ecrire(id, s, bandeau('nouveau', premiere ? `Nouvelle mission — ${m.titre}` : 'Nouvel objectif', e.texte));
  emit('mission:etape', { id, i: s.i });
}
// L'étape courante est remplie : ses effets, le bandeau, puis l'étape suivante (ou la fin).
export function reussirEtape(id) {
  const s = etat(id), m = MISSIONS[id]; if (!tenant() || !s || s.etat !== 'active') return;
  const e = m.etapes[s.i];
  if (e.effets) appliquerEffets(e.effets);
  ecrire(id, s, bandeau('objectif', 'Objectif rempli', e.texte));
  s.i++;
  if (s.i >= m.etapes.length) { reussir(id); return; }
  debutEtape(id, false);
}
function reussir(id) {
  const s = etat(id), m = MISSIONS[id];
  s.etat = 'reussie'; s.fin = maintenant();
  if (m.nettoye) {     // le lieu nettoyé reste calme quelques jours
    for (const e of m.etapes) if (e.type === 'eliminer') { const L = W().lieux[e.lieu] || (W().lieux[e.lieu] = {}); L.calmeJusqua = maintenant() + m.nettoye * 1440; }
  }
  ecrire(id, s, bandeau('reussite', 'Mission accomplie', m.titre));
  if (m.fin) { if (m.fin.effets) appliquerEffets(m.fin.effets); if (m.fin.texte) raconter(id, 'fin', m.fin.texte); }
}
export function echouer(id, raison = '') {
  const s = etat(id), m = MISSIONS[id]; if (!tenant() || !s || s.etat !== 'active') return;
  s.etat = 'echouee'; s.fin = maintenant();
  ecrire(id, s, bandeau('echec', `Mission échouée — ${m.titre}`, raison));
  if (m.echec) { if (m.echec.effets) appliquerEffets(m.echec.effets); if (m.echec.texte) raconter(id, 'echec', m.echec.texte); }
}

// ---------- Le récit de fin (scène simple, jouée dès que l'écran est libre) ----------
const file = []; let enCours = false;
function raconter(id, quoi, texte) {
  const m = MISSIONS[id], sid = `mission_${quoi}_${id}`;
  SCENES[sid] = { illu: null, musique: null, orateur: m.pnj && quoi === 'fin' ? m.pnj.nom : null, texte, choix: [{ label: 'Continuer', suivant: '#fin' }] };
  file.push(sid); setTimeout(depiler, 900);
}
async function depiler() {
  if (enCours || !file.length) return;
  const flow = await import('./flow.js');
  if (flow.overlayOuvert()) { setTimeout(depiler, 700); return; }
  enCours = true;
  try { await flow.scene(file.shift()); } catch (e) { console.warn('[missions]', e); }
  enCours = false;
  if (file.length) setTimeout(depiler, 400);
}

// ---------- Le temps qui passe (tenir, attendre, protéger, nourrir, fuir) ----------
// L'heure h est-elle passée entre les minutes m0 (exclue) et m1 (incluse) ?
function heurePassee(h, m0, m1) {
  if (m1 - m0 >= 1440) return true;
  for (let t = m0 + 1; t <= m1; t++) if (Math.floor((t % 1440) / 60) === h) return true;
  return false;
}
function chaqueMinute(delta = 1) {
  if (!tenant()) return;
  const m1 = maintenant(), m0 = m1 - delta;
  for (const id of actives()) {
    const s = etat(id), m = MISSIONS[id], e = m.etapes[s.i]; if (!e) continue;
    const la = present(e.lieu);
    switch (e.type) {
      case 'tenir':
        if (la) { s.d.compte = (s.d.compte || 0) + delta; s.d.parti = false; if (s.d.compte >= e.minutes) reussirEtape(id); }
        else if ((s.d.compte || 0) > 0 && !s.d.parti) {
          s.d.parti = true;
          if (e.quitter === 'echec') echouer(id, `Tu as quitté ${nomLieu(e.lieu)}.`);
          else if (e.quitter !== 'pause') { s.d.compte = 0; ecrire(id, s, bandeau('info', m.titre, `Tu as quitté ${nomLieu(e.lieu)} : il faudra tout recommencer.`)); }
        }
        break;
      case 'attendre':
        if (la && heurePassee(e.heure, m0, m1)) reussirEtape(id);
        break;
      case 'proteger':
        if (la) { s.d.vu = true; s.d.compte = (s.d.compte || 0) + delta; if (s.d.compte >= e.minutes) reussirEtape(id); }
        else if (s.d.vu) echouer(id, `Tu as laissé ${m.pnj ? m.pnj.nom : 'la personne'} seule face aux morts.`);
        break;
      case 'nourrir': passerJours(id, s, m, e); break;
      case 'fuir': if (!la) reussirEtape(id); break;
      case 'atteindre': if (!e.piece && la) reussirEtape(id); break;
      default: break;
    }
  }
}
// Nourrir : à chaque nouveau jour, on regarde si la veille il a mangé à sa faim. Deux jours sans manger : il meurt.
function passerJours(id, s, m, e) {
  const j = clock.jour();
  while (s.etat === 'active' && s.d.jour < j) {
    const ok = s.d.okJour === s.d.jour, grace = s.d.grace === s.d.jour;
    if (!ok && !grace) {
      s.d.rates++;
      const nom = m.pnj ? m.pnj.nom : 'Il';
      if (s.d.rates >= 2) { echouer(id, `${nom} est mort de faim.`); return; }
      ecrire(id, s, bandeau('echec', m.titre, `${nom} a passé une journée entière sans manger. Encore une, et il n’y survivra pas.`));
    }
    s.d.jour++; s.d.mange = 0;
  }
}

// ---------- Nourrir quelqu'un : la scène « donner à manger » ----------
// Ce qu'il lui faut encore aujourd'hui, en mots.
function besoinMots(e, s) {
  const reste = Math.max(0, e.points - (s.d.mange || 0));
  if (reste <= 0) return null;
  for (const [seuil, mot] of REGLAGES.survie.REPAS.PORTIONS) if (reste < seuil) return mot;
  return 'un vrai repas';
}
export function sceneNourrir(id) {
  const s = etat(id), m = MISSIONS[id], e = etapeDe(id), nom = m.pnj.nom, sid = 'mission_pnj_' + id;
  const p = G.player, faitAujourdhui = s.d.okJour === clock.jour();
  const besoin = besoinMots(e, s);
  const jours = `${s.d.faits || 0} jour${(s.d.faits || 0) > 1 ? 's' : ''} sur ${e.jours}`;
  const texte = faitAujourdhui
    ? `${nom} a mangé à sa faim aujourd’hui. Il s’essuie la bouche avec le dos de la main. « Garde le reste pour toi. Reviens demain. »\n\n(Nourri : ${jours}.)`
    : `${nom} te regarde poser ton sac. Il essaie de ne pas avoir l’air d’attendre, mais ses yeux ne quittent pas tes mains.\n\nIl lui faudrait encore ${besoin} aujourd’hui. (Nourri : ${jours}.)`;
  const vus = new Set(), choix = [];
  if (!faitAujourdhui) {
    for (const it of p.inventaire) {
      const d = objet(it.id); if (!d || d.type !== 'nourriture' || vus.has(it.id) || pointsAliment(it.id, it.reste ?? 1) <= 0) continue;
      vus.add(it.id);
      choix.push({ label: `Lui donner : ${d.nom.toLowerCase()} (${motPortion(it.id, it.reste ?? 1)})`, effets: { mission: ['donner', id, it.id] }, suivant: sid });
      if (choix.length >= 7) break;
    }
    if (!choix.length) choix.push({ label: 'Tu n’as rien à lui donner', si: { flag: '__jamais__' }, suivant: '#fin' });
  }
  choix.push({ label: faitAujourdhui ? 'Le laisser se reposer' : 'Repartir', suivant: '#fin' });
  SCENES[sid] = { illu: null, musique: null, orateur: nom, texte, choix };
  return sid;
}
export function donner(id, itemId) {
  const s = etat(id), m = MISSIONS[id], e = etapeDe(id); if (!tenant() || !e || e.type !== 'nourrir') return;
  const p = G.player;
  let k = p.inventaire.findIndex(it => it.id === itemId && it.reste != null); if (k < 0) k = p.inventaire.findIndex(it => it.id === itemId);
  if (k < 0) return;
  const it = p.inventaire[k], pts = pointsAliment(itemId, it.reste ?? 1);
  inv.removeIndex(k, 1, p);
  const rend = (objet(itemId) || {}).rend; if (rend) inv.addItem(rend, 1, {}, p);
  s.d.mange = (s.d.mange || 0) + pts;
  if (s.d.mange >= e.points && s.d.okJour !== clock.jour()) {
    s.d.okJour = clock.jour(); s.d.faits = (s.d.faits || 0) + 1;
    if (s.d.faits >= e.jours) { reussirEtape(id); return; }
    ecrire(id, s, bandeau('objectif', m.titre, `${m.pnj.nom} a mangé à sa faim aujourd’hui (${s.d.faits} jour${s.d.faits > 1 ? 's' : ''} sur ${e.jours}).`));
  } else ecrire(id, s);
  sceneNourrir(id);   // la scène se met à jour (on revient dessus après le don)
}

// ---------- Le PNJ d'une mission ----------
// Les missions qui ont quelqu'un dans ce lieu (avant l'offre, offre en attente, ou en cours) → [{ id, pnj }]
export function pnjsDuLieu(lieuId) {
  const out = [];
  for (const [id, m] of Object.entries(MISSIONS)) {
    if (!m.pnj || m.pnj.lieu !== lieuId) continue;
    const s = etat(id);
    if (s ? !['proposee', 'active'].includes(s.etat) : !verifier(m.si)) continue;
    out.push({ id, pnj: m.pnj });
  }
  return out;
}
// Parler au PNJ : → { scene } ou { message }
export function parlerPnj(id) {
  const s = etat(id), m = MISSIONS[id], e = etapeDe(id);
  if (!s || s.etat === 'proposee') return { scene: sceneOffre(id) };
  if (e && e.type === 'nourrir') return { scene: sceneNourrir(id) };
  const r = m.pnj.repliques || [];
  return { message: r.length ? `${m.pnj.nom} : « ${r[Math.floor(Math.random() * r.length)]} »` : `${m.pnj.nom} ne dit rien.` };
}
// Protéger : le PNJ prend des coups (missions_vue). → pv restants
export function blesserPnj(id, n) {
  const s = etat(id), e = etapeDe(id); if (!tenant() || !e || e.type !== 'proteger') return null;
  const avant = s.d.pv ?? 100;
  s.d.pv = Math.max(0, avant - n);
  if (s.d.pv <= 0) { echouer(id, `${MISSIONS[id].pnj.nom} a été tuée par les morts.`); return 0; }
  if (Math.floor(avant / 25) !== Math.floor(s.d.pv / 25)) ecrire(id, s);   // l'invité suit, sans inonder le réseau
  return s.d.pv;
}

// ---------- Lieux bouclés et nettoyés ----------
// Pendant « nettoyer », et quelques jours après, aucun mort n'arrive tranquillement dans le lieu (sim : getCalme).
export function lieuCalme(lieuId) {
  if (!G) return false;
  if (actives().some(id => { const e = etapeDe(id); return e && e.type === 'eliminer' && e.lieu === lieuId; })) return true;
  const L = W().lieux[lieuId]; return !!(L && L.calmeJusqua > maintenant());
}

// ---------- Le guide (ligne discrète en haut de l'écran) : où en est-on, ici ? ----------
export function dureeMots(min) {
  min = Math.max(0, Math.round(min));
  const j = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), mn = min % 60;
  if (j >= 1) return `encore ${j} jour${j > 1 ? 's' : ''}${h ? ` et ${h} h` : ''}`;
  if (h >= 1) return `encore ${h} h${mn >= 10 ? ` ${String(mn).padStart(2, '0')}` : ''}`;
  return `encore ${mn || 1} min`;
}
const MOTS_PV = (pv) => pv >= 90 ? 'indemne' : pv >= 60 ? 'légèrement blessée' : pv >= 30 ? 'blessée' : 'gravement blessée';
export function guide(lieuId) {
  for (const { m, s, e } of ici(lieuId)) {
    let etatTxt = '';
    switch (e.type) {
      case 'eliminer': etatTxt = s.d.mots || 'débarrasse le lieu de tous ses morts'; break;
      case 'tenir': etatTxt = `tenir ici, ${dureeMots(e.minutes - (s.d.compte || 0))}`; break;
      case 'attendre': etatTxt = `attendre ${e.heure} h`; break;
      case 'proteger': etatTxt = `${m.pnj.nom} : ${MOTS_PV(s.d.pv ?? 100)} — ${dureeMots(e.minutes - (s.d.compte || 0))}`; break;
      case 'nourrir': { const b = besoinMots(e, s); etatTxt = s.d.okJour === clock.jour() ? `${m.pnj.nom} a mangé aujourd’hui` : `${m.pnj.nom} attend ${b}`; break; }
      case 'atteindre': etatTxt = s.d.repere ? 'repéré{|e} ! ' + genrer(e.texte).toLowerCase() : genrer(e.texte); break;
      default: etatTxt = genrer(e.texte);
    }
    return genrer(`${m.titre} — ${etatTxt}`);
  }
  return '';
}
// Texte de l'étape courante pour le journal (avec l'avancée).
export function avancee(id) {
  const s = etat(id), m = MISSIONS[id], e = etapeDe(id); if (!e) return '';
  switch (e.type) {
    case 'eliminer': return s.d.mots || '';
    case 'tenir': return (s.d.compte || 0) > 0 ? `Sur place : ${dureeMots(e.minutes - s.d.compte)}.` : 'Le compte n’a pas commencé : il faut être sur place.';
    case 'proteger': return `${m.pnj.nom} : ${MOTS_PV(s.d.pv ?? 100)}.`;
    case 'nourrir': return `Nourri à sa faim : ${s.d.faits || 0} jour${(s.d.faits || 0) > 1 ? 's' : ''} sur ${e.jours}.`;
    default: return '';
  }
}

// ---------- Effets de scène ----------
export function effet(v) {
  const [quoi, id, x] = Array.isArray(v) ? v : [v];
  if (quoi === 'accepter') accepter(id);
  else if (quoi === 'plusTard') plusTard(id);
  else if (quoi === 'refuser') refuser(id);
  else if (quoi === 'donner') donner(id, x);
}

// ---------- Branchement ----------
let offs = [];
export function demarrerMissions() {
  arreterMissions();
  offs.push(on('minute', (d) => chaqueMinute((d && d.delta) || 1)));
  offs.push(on('lieu:entre', ({ lieu }) => { lieuVue = lieu; vuesCetteVisite.clear(); }));
  offs.push(on('temps', ({ nom }) => { if (nom !== 'exploration') { lieuVue = null; setTimeout(() => chaqueMinute(0), 0); } }));
}
export function arreterMissions() { offs.forEach(f => f()); offs = []; lieuVue = null; }
// (tests) : forcer le lieu courant
export function _setLieuVue(l) { lieuVue = l; }
