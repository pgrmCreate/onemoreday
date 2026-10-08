// ============ Les événements qui viennent : SIRÈNES et HORDES — état du monde, annonces, quête « tenir » (sans DOM) ============
// Sirènes : l'armée fait hurler une zone (Salon, ou les villages de la plaine) : tous les morts qui l'entendent COURENT,
//   d'autres arrivent ; les collines et la Crau se vident.
// Hordes : une colonne de morts traverse UN lieu (un village, un quartier, ta base) pendant quelques heures : il s'y
//   entasse des morts en plus, qui marchent.
// Histoire et textes : js/data/histoire/ruees.js ; nombres : REGLAGES.ruees. Une RADIO (js/game/radio.js) les annonce
// des heures à l'avance ; sans radio, on n'a que quelques minutes de signes — ou rien : on est pris par surprise.
// Tourne chez l'hôte (ou en solo) à chaque minute de jeu. L'état actif est recopié dans des DRAPEAUX (partagés en co-op) :
//   ruee_type ('sirenes' | 'horde'), ruee_zone ('salon' | 'villages' | 'lieu:<id>'), ruee_fin, ruee_id, ruee_prevue.
// Cycle : prévue → active → finie (le suivant dans 3 à 5 jours ; les hordes commencent dès le jour 3).
import { G, setFlag, retirerFlag, noteJournal } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { LIEUX_GEO } from '../data/lieux.js';
import {
  RUEES_HISTOIRE, SANS_RUEE, ZONES_RUEE, RADIO_RUEE, SIGNES_RUEE, DEBUT_RUEE, FIN_RUEE, JOURNAL_RUEE,
  RADIO_HORDE, SIGNES_HORDE, DEBUT_HORDE, FIN_HORDE, JOURNAL_HORDE,
} from '../data/histoire/ruees.js';
import { verifier } from './conditions.js';
import * as quetes from './quetes.js';
import { aUneRadio, capter } from './radio.js';
import { lieu as lieuDe } from './donnees.js';
import { seedRng } from '../core/rng.js';

const R = () => REGLAGES.ruees;
const maintenant = () => (G ? G.world.minutes : 0);
const etat = () => { const w = G.world; return w.ruees || (w.ruees = { prevue: null, faites: [], prochaine: null, n: 0 }); };
const flags = () => (G ? G.world.flags : {});
const SANS_HORDE = new Set(['nature', 'ruines', 'grotte']);   // les hordes passent par les routes, les bourgs, les quartiers

// ---------- Lecture (partout : solo, hôte, invité) ----------
export const zoneActive = () => flags().ruee_zone || null;
export const typeActif = () => (flags().ruee_zone ? flags().ruee_type || 'sirenes' : null);
export const rueeIdActive = () => flags().ruee_id || null;
// Un lieu est-il dans la zone touchée ? (la nature, les ruines, les grottes : jamais par les sirènes)
export function lieuDansZone(lieuId, zone = zoneActive()) {
  if (!zone) return false;
  if (zone.startsWith('lieu:')) return zone.slice(5) === lieuId;
  const g = LIEUX_GEO[lieuId]; if (!g) return false;
  if (zone === 'salon') return g.echelle === 'salon';
  const Z = ZONES_RUEE[zone];
  return !!(Z && Z.types && g.echelle === 'region' && Z.types.includes(g.type));
}
// 0 (calme) … 1 (les sirènes hurlent ici / la horde est là).
export const intensiteRuee = (lieuId) => (lieuDansZone(lieuId) ? 1 : 0);
// Pour la simulation du lieu : { i, id, course (ils courent ?), densite (× morts max du lieu en plus) } | null.
export function rueeSim(lieuId) {
  if (!lieuDansZone(lieuId)) return null;
  const horde = typeActif() === 'horde';
  return { i: 1, id: rueeIdActive(), course: !horde, densite: horde ? R().HORDE.DENSITE : R().DENSITE };
}
// Voyage : sur un tronçon d'échelle donnée → { mult (× rencontres), danger (+) } — seulement les sirènes.
export function rueeTroncon(echelle) {
  const z = zoneActive(); if (!z || typeActif() !== 'sirenes') return { mult: 1, danger: 0 };
  const Rr = R();
  if ((z === 'salon' && echelle === 'salon') || (z === 'villages' && echelle === 'region')) return { mult: z === 'salon' ? Rr.RENCONTRES_ZONE : (1 + Rr.RENCONTRES_ZONE) / 2, danger: Rr.DANGER_ZONE };
  return { mult: Rr.RENCONTRES_NATURE, danger: 0 };
}
const nomZone = (z) => (!z ? '' : z.startsWith('lieu:') ? nomLieu(z.slice(5)) : (ZONES_RUEE[z] || {}).nom || z);
function nomLieu(id) { const l = lieuDe(id); return l ? (l.court || l.nom) : (LIEUX_GEO[id] || {}).nom || id; }
// Ce que le joueur sait d'une migration en cours (sirènes : on les entend ; horde : la radio, ou on y était) → la zone | null.
export const migrationConnue = () => (flags().ruee_zone && flags().ruee_connue ? flags().ruee_zone : null);
// Pour le HUD : { active, type, nom, fin } — ou { active: false, type, nom, debut } si une radio l'a annoncé.
export function etatRuee() {
  const f = flags();
  if (f.ruee_zone) return { active: true, type: f.ruee_type || 'sirenes', zone: f.ruee_zone, nom: nomZone(f.ruee_zone), fin: f.ruee_fin };
  if (f.ruee_prevue) return { active: false, type: f.ruee_prevue.type || 'sirenes', zone: f.ruee_prevue.zone, nom: nomZone(f.ruee_prevue.zone), debut: f.ruee_prevue.debut };
  return null;
}

// ---------- Textes ----------
// « cette nuit vers 2 h », « demain vers 6 h », « ce soir vers 21 h », « dans une heure ou deux »
export function quandTexte(debut, t = maintenant()) {
  const d = debut - t;
  if (d < 150) return 'dans une heure ou deux';
  const h = Math.floor((debut % 1440) / 60), jd = Math.floor(debut / 1440) - Math.floor(t / 1440);
  const vers = `vers ${h} h`;
  if (jd === 0) return h >= 18 ? `ce soir ${vers}` : h >= 12 ? `cet après-midi ${vers}` : `ce matin ${vers}`;
  if (jd === 1) return h < 5 ? `cette nuit ${vers}` : `demain ${vers}`;
  if (jd === 2) return `après-demain ${vers}`;
  return `dans ${jd} jours`;
}
const remplir = (s, P) => s.replace('{quand}', quandTexte(P.debut)).replace('{dans}', (ZONES_RUEE[P.zone] || {}).dans || '').replace('{lieu}', nomZone(P.zone));
const textes = (P) => (P.type === 'horde'
  ? { radio: RADIO_HORDE, signes: SIGNES_HORDE, debut: DEBUT_HORDE, fin: FIN_HORDE, journal: JOURNAL_HORDE }
  : { radio: RADIO_RUEE[P.zone] || [], signes: SIGNES_RUEE[P.zone], debut: DEBUT_RUEE[P.zone], fin: FIN_RUEE[P.zone], journal: JOURNAL_RUEE });

// ---------- Moteur (hôte / solo) ----------
let offs = [];
export function demarrerRuees() {
  arreterRuees();
  offs.push(on('minute', () => { try { tic(); } catch (e) { console.warn('[ruees]', e); } }));
}
export function arreterRuees() { offs.forEach(f => f()); offs = []; }

const interdit = () => SANS_RUEE.some(c => verifier(c));
// Le joueur est-il dans la zone (dans un lieu, ou en route depuis / vers elle) ?
function joueurDansZone(zone) {
  const pos = G.player && G.player.position; if (!pos) return false;
  if (pos.lieu) return lieuDansZone(pos.lieu, zone);
  const v = pos.voyage; return !!(v && (lieuDansZone(v.de, zone) || lieuDansZone(v.vers, zone)));
}
// Où passe la horde : un lieu connu (de préférence un lieu où l'on est déjà allé — ta base…), jamais la nature.
function cibleHorde(rnd) {
  const W = G.world, cands = [];
  for (const [id, g] of Object.entries(LIEUX_GEO)) {
    if (SANS_HORDE.has(g.type)) continue;
    if (g.echelle === 'salon' && W.flags.troupeau_passe) continue;      // Salon s'est vidé derrière le troupeau
    const L = W.lieux[id]; if (!L || !L.decouvert) continue;
    cands.push([id, L.visite ? 3 : 1]);
  }
  if (!cands.length) return null;
  let t = rnd() * cands.reduce((s, c) => s + c[1], 0);
  for (const [id, p] of cands) { t -= p; if (t <= 0) return id; }
  return cands[0][0];
}

function tic() {
  if (!G || G.mode === 'invite') return;
  const E = etat(), t = maintenant(), Rr = R();
  // 1. Rien de prévu : un événement écrit par l'histoire ? sinon, le retour régulier des sirènes et des hordes.
  if (!E.prevue) {
    if (interdit()) return;
    const h = RUEES_HISTOIRE.find(r => !E.faites.includes(r.id) && verifier(r.si));
    if (h) { prevoir({ id: h.id, type: 'sirenes', zone: h.zone, debut: t + h.delaiH * 60, duree: h.dureeH * 60, quete: h.quete, histoire: true }, h.annonce); return; }
    // le premier événement « au hasard » tombe le jour PREMIERE_J (ou un peu après) : connu d'avance, la radio peut l'annoncer
    if (E.prochaine == null) { E.prochaine = Math.max(t, (Rr.PREMIERE_J - 1) * 1440 + 6 * 60) + Math.round((0.3 + seedRng(`${G.world.seed}:ruee0`)() * 1.2) * 1440); return; }
    // on le prévoit dès qu'il entre dans la portée d'annonce de la radio (plusieurs jours avant)
    if (t < E.prochaine - (Math.max(Rr.ANNONCE_RADIO_H, Rr.HORDE.ANNONCE_H) + 6) * 60) return;
    const rnd = seedRng(`${G.world.seed}:ruee:${E.n}`);
    const sirenesPossibles = E.faites.some(id => RUEES_HISTOIRE.some(r => r.id === id));   // après les premières sirènes de l'histoire
    let type = sirenesPossibles && rnd() < 0.5 ? 'sirenes' : 'horde', zone;
    if (type === 'horde') { const c = cibleHorde(rnd); if (c) zone = 'lieu:' + c; else if (sirenesPossibles) type = 'sirenes'; else { E.prochaine = t + 720; return; } }
    if (type === 'sirenes') zone = flags().troupeau_passe ? 'villages' : 'salon';
    const DH = type === 'horde' ? Rr.HORDE.DUREE_H : Rr.DUREE_H, avance = type === 'horde' ? Rr.HORDE.ANNONCE_H : Rr.ANNONCE_RADIO_H;
    const duree = Math.round((DH[0] + rnd() * (DH[1] - DH[0])) * 60);
    void avance;
    prevoir({ id: `${type[0]}${E.n}`, type, zone, debut: Math.max(E.prochaine, t + Math.round((1 + rnd() * 5) * 60)), duree, quete: null, histoire: false });
    return;
  }
  const P = E.prevue, X = textes(P);
  // 2. Prévu, pas encore là : la radio prévient des heures avant ; sans radio, quelques minutes de signes, sur place.
  if (!P.active) {
    if (interdit()) { if (P.histoire) { P.debut = Math.max(P.debut, t + 60); } else { E.prevue = null; retirerFlag('ruee_prevue'); } return; }
    const avance = (P.type === 'horde' ? Rr.HORDE.ANNONCE_H : Rr.ANNONCE_RADIO_H) * 60;
    if (!P.radio && !P.histoire && t >= P.debut - avance && aUneRadio()) {
      P.radio = true;
      const l = X.radio; const txt = l.length ? l[(E.n + P.id.length) % l.length] : '';
      capter(remplir(txt, P), remplir(X.journal.annonce, P));
      setFlag('ruee_prevue', { type: P.type, zone: P.zone, debut: P.debut });
    }
    const signes = (P.type === 'horde' ? Rr.HORDE.SIGNES_H : Rr.SIGNES_H) * 60;
    if (!P.signes && t >= P.debut - signes) {
      P.signes = true;
      if (joueurDansZone(P.zone) && X.signes) emit('toast', { texte: X.signes, type: 'alerte' });
    }
    if (t >= P.debut) debuter(P);
    return;
  }
  // 3. En cours : jusqu'à la fin (ou si l'histoire l'interdit soudain : le siège, le mistral).
  if (t >= P.debut + P.duree || interdit()) finir(P);
}

function prevoir(P, drapeauAnnonce) {
  const E = etat();
  E.prevue = { ...P, active: false, radio: false, signes: false };
  if (drapeauAnnonce) {
    setFlag(drapeauAnnonce, true);              // la scène de l'annonce (déclencheur 'flag')
    setFlag('ruee_prevue', { type: P.type, zone: P.zone, debut: P.debut });
    noteJournal(remplir(textes(P).journal.annonce, P), 'objectif');
  }
  if (P.quete) quetes.avancer(P.quete, 'debut');
  emit('ruee', { action: 'prevue', type: P.type, zone: P.zone, debut: P.debut });
}
function debuter(P) {
  P.active = true;
  const X = textes(P);
  setFlag('ruee_type', P.type); setFlag('ruee_id', P.id); setFlag('ruee_fin', P.debut + P.duree); setFlag('ruee_zone', P.zone);
  retirerFlag('ruee_prevue');
  // une horde ailleurs, loin de toi, sans radio : tu n'en sais rien (tu la découvriras en arrivant)
  if (P.type !== 'horde' || joueurDansZone(P.zone) || P.radio) { emit('toast', { texte: remplir(X.debut, P), type: 'alerte' }); setFlag('ruee_connue', true); }
  if (P.type !== 'horde' || P.radio || joueurDansZone(P.zone)) noteJournal(remplir(X.journal.debut, P), 'objectif');
  if (P.quete) quetes.avancer(P.quete, 'tenir');
  emit('ruee', { action: 'debut', type: P.type, zone: P.zone, id: P.id });
}
function finir(P) {
  const E = etat(), X = textes(P);
  E.faites.push(P.id); E.n++; E.prevue = null;
  const rnd = seedRng(`${G.world.seed}:ruee_suivante:${E.n}`), Rr = R();
  E.prochaine = maintenant() + Math.round((Rr.INTERVALLE_J[0] + rnd() * (Rr.INTERVALLE_J[1] - Rr.INTERVALLE_J[0])) * 1440);
  for (const k of ['ruee_zone', 'ruee_fin', 'ruee_id', 'ruee_type', 'ruee_prevue', 'ruee_connue']) retirerFlag(k);
  if (P.type !== 'horde' || joueurDansZone(P.zone) || P.radio) { emit('toast', { texte: remplir(X.fin, P), type: 'info' }); noteJournal(remplir(X.journal.fin, P), 'objectif'); }
  if (P.quete) quetes.avancer(P.quete, 'fin');
  emit('ruee', { action: 'fin', type: P.type, zone: P.zone, id: P.id });
}
