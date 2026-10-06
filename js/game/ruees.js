// ============ Les sirènes (« ruées ») — l'état du monde, les annonces, la quête « tenir » (sans DOM) ============
// L'armée fait hurler une zone (Salon, ou les villages de la plaine) : tous les morts qui l'entendent COURENT, d'autres
// arrivent ; les collines et la Crau se vident. Histoire et textes : js/data/histoire/ruees.js ; nombres : REGLAGES.ruees.
// Tourne chez l'hôte (ou en solo) à chaque minute de jeu. L'état actif est recopié dans des DRAPEAUX (partagés en co-op) :
//   ruee_zone ('salon' | 'villages'), ruee_fin (minute), ruee_id — que lisent la simulation des lieux, le voyage, le HUD.
// Cycle : prévue (annonce : scène d'histoire, ou radio portable + piles ~12 h avant, ou signes ~1 h 30 avant)
//         → active (les sirènes hurlent) → finie (prochaine dans 3 à 5 jours).
import { G, setFlag, retirerFlag, noteJournal } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { LIEUX_GEO } from '../data/lieux.js';
import { RUEES_HISTOIRE, SANS_RUEE, ZONES_RUEE, RADIO_RUEE, SIGNES_RUEE, DEBUT_RUEE, FIN_RUEE, JOURNAL_RUEE } from '../data/histoire/ruees.js';
import { verifier } from './conditions.js';
import * as quetes from './quetes.js';
import * as inv from './inventory.js';
import { seedRng } from '../core/rng.js';

const R = () => REGLAGES.ruees;
const maintenant = () => (G ? G.world.minutes : 0);
const etat = () => { const w = G.world; return w.ruees || (w.ruees = { prevue: null, faites: [], prochaine: null, n: 0 }); };
const flags = () => (G ? G.world.flags : {});

// ---------- Lecture (partout : solo, hôte, invité) ----------
export const zoneActive = () => flags().ruee_zone || null;
export const rueeIdActive = () => flags().ruee_id || null;
// Un lieu est-il dans la zone qui hurle ? (la nature, les ruines, les grottes : jamais)
export function lieuDansZone(lieuId, zone = zoneActive()) {
  if (!zone) return false;
  const g = LIEUX_GEO[lieuId]; if (!g) return false;
  if (zone === 'salon') return g.echelle === 'salon';
  const Z = ZONES_RUEE[zone];
  return !!(Z && Z.types && g.echelle === 'region' && Z.types.includes(g.type));
}
// 0 (calme) … 1 (les sirènes hurlent ici) — lue par la simulation du lieu.
export const intensiteRuee = (lieuId) => (lieuDansZone(lieuId) ? 1 : 0);
// Voyage : sur un tronçon d'échelle donnée → { mult (× rencontres), danger (+) }.
export function rueeTroncon(echelle) {
  const z = zoneActive(); if (!z) return { mult: 1, danger: 0 };
  const Rr = R();
  if ((z === 'salon' && echelle === 'salon') || (z === 'villages' && echelle === 'region')) return { mult: z === 'salon' ? Rr.RENCONTRES_ZONE : (1 + Rr.RENCONTRES_ZONE) / 2, danger: Rr.DANGER_ZONE };
  return { mult: Rr.RENCONTRES_NATURE, danger: 0 };
}
// Pour le HUD : { zone, nom, fin } si les sirènes hurlent ; { prevue, nom, debut } si la radio l'a annoncée.
export function etatRuee() {
  const f = flags();
  if (f.ruee_zone) return { active: true, zone: f.ruee_zone, nom: (ZONES_RUEE[f.ruee_zone] || {}).nom, fin: f.ruee_fin };
  if (f.ruee_prevue) return { active: false, zone: f.ruee_prevue.zone, nom: (ZONES_RUEE[f.ruee_prevue.zone] || {}).nom, debut: f.ruee_prevue.debut };
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
  return `dans ${jd} jours`;
}
const remplir = (s, z, debut) => s.replace('{quand}', quandTexte(debut)).replace('{dans}', (ZONES_RUEE[z] || {}).dans || '');

// ---------- Moteur (hôte / solo) ----------
let offs = [];
export function demarrerRuees() {
  arreterRuees();
  offs.push(on('minute', () => { try { tic(); } catch (e) { console.warn('[ruees]', e); } }));
}
export function arreterRuees() { offs.forEach(f => f()); offs = []; }

const interdit = () => SANS_RUEE.some(c => verifier(c));
const aRadio = () => inv.hasItem('radio_portable') && inv.hasItem('piles');
// Le joueur est-il dans la zone (dans un lieu, ou en route sur sa feuille) ?
function joueurDansZone(zone) {
  const pos = G.player && G.player.position; if (!pos) return false;
  if (pos.lieu) return lieuDansZone(pos.lieu, zone);
  const v = pos.voyage; return !!(v && (lieuDansZone(v.de, zone) || lieuDansZone(v.vers, zone)));
}

function tic() {
  if (!G || G.mode === 'invite') return;
  const E = etat(), t = maintenant();
  // 1. Rien de prévu : une sirène écrite par l'histoire ? sinon, le retour régulier des sirènes.
  if (!E.prevue) {
    if (interdit()) return;
    const h = RUEES_HISTOIRE.find(r => !E.faites.includes(r.id) && verifier(r.si));
    if (h) { prevoir({ id: h.id, zone: h.zone, debut: t + h.delaiH * 60, duree: h.dureeH * 60, quete: h.quete, histoire: true }, h.annonce); return; }
    if (!E.faites.length || E.prochaine == null || t < E.prochaine) return;
    const rnd = seedRng(`${G.world.seed}:ruee:${E.n}`), Rr = R();
    const zone = flags().troupeau_passe ? 'villages' : 'salon';
    const duree = Math.round((Rr.DUREE_H[0] + rnd() * (Rr.DUREE_H[1] - Rr.DUREE_H[0])) * 60);
    prevoir({ id: `r${E.n}`, zone, debut: t + Math.round((Rr.ANNONCE_RADIO_H + 2 + rnd() * 6) * 60), duree, quete: null, histoire: false });
    return;
  }
  const P = E.prevue;
  // 2. Prévue, pas encore là : la radio prévient, puis les drones.
  if (!P.active) {
    if (interdit()) { if (P.histoire) { P.debut = Math.max(P.debut, t + 60); } else { E.prevue = null; retirerFlag('ruee_prevue'); } return; }
    if (!P.radio && !P.histoire && t >= P.debut - R().ANNONCE_RADIO_H * 60 && aRadio()) {
      P.radio = true;
      const l = RADIO_RUEE[P.zone] || [];
      const txt = l.length ? l[(E.n + P.id.length) % l.length] : '';
      emit('toast', { texte: `Ta radio grésille : ${remplir(txt, P.zone, P.debut)}`, type: 'alerte', duree: 9000 });
      noteJournal(remplir(JOURNAL_RUEE.annonce, P.zone, P.debut), 'objectif');
      setFlag('ruee_prevue', { zone: P.zone, debut: P.debut });
    }
    if (!P.signes && t >= P.debut - R().SIGNES_H * 60) {
      P.signes = true;
      if (joueurDansZone(P.zone)) emit('toast', { texte: SIGNES_RUEE[P.zone], type: 'alerte', duree: 7000 });
    }
    if (t >= P.debut) debuter(P);
    return;
  }
  // 3. Elles hurlent : jusqu'à la fin (ou si l'histoire l'interdit soudain : le siège, le mistral).
  if (t >= P.debut + P.duree || interdit()) finir(P);
}

function prevoir(P, drapeauAnnonce) {
  const E = etat();
  E.prevue = { ...P, active: false, radio: false, signes: false };
  if (drapeauAnnonce) {
    setFlag(drapeauAnnonce, true);              // la scène de l'annonce (déclencheur 'flag')
    setFlag('ruee_prevue', { zone: P.zone, debut: P.debut });
    noteJournal(remplir(JOURNAL_RUEE.annonce, P.zone, P.debut), 'objectif');
  }
  if (P.quete) quetes.avancer(P.quete, 'debut');
  emit('ruee', { action: 'prevue', zone: P.zone, debut: P.debut });
}
function debuter(P) {
  P.active = true;
  setFlag('ruee_id', P.id); setFlag('ruee_fin', P.debut + P.duree); setFlag('ruee_zone', P.zone);
  retirerFlag('ruee_prevue');
  emit('toast', { texte: DEBUT_RUEE[P.zone], type: 'alerte', duree: 9000 });
  noteJournal(remplir(JOURNAL_RUEE.debut, P.zone, P.debut), 'objectif');
  if (P.quete) quetes.avancer(P.quete, 'tenir');
  emit('ruee', { action: 'debut', zone: P.zone, id: P.id });
}
function finir(P) {
  const E = etat();
  E.faites.push(P.id); E.n++; E.prevue = null;
  const rnd = seedRng(`${G.world.seed}:ruee_suivante:${E.n}`), Rr = R();
  E.prochaine = maintenant() + Math.round((Rr.INTERVALLE_J[0] + rnd() * (Rr.INTERVALLE_J[1] - Rr.INTERVALLE_J[0])) * 1440);
  retirerFlag('ruee_zone'); retirerFlag('ruee_fin'); retirerFlag('ruee_id'); retirerFlag('ruee_prevue');
  emit('toast', { texte: FIN_RUEE[P.zone], type: 'info', duree: 7000 });
  noteJournal(remplir(JOURNAL_RUEE.fin, P.zone, P.debut), 'objectif');
  if (P.quete) quetes.avancer(P.quete, 'fin');
  emit('ruee', { action: 'fin', zone: P.zone, id: P.id });
}
