// ============ Le flow — enchaîne les temps (exploration — combat compris —, carte/voyage) ============
// Version initiale : les modules des temps sont chargés à la demande (import dynamique) pour que
// chaque agent puisse développer et tester son temps isolément.
import { G, sauver } from '../core/state.js';
import { emit } from '../core/bus.js';
import * as clock from '../core/clock.js';

let courant = null;

const pileOverlays = [];   // combats / scènes / cinématiques ouverts par-dessus

export function stage() {
  let s = document.getElementById('stage');
  if (!s) { s = document.createElement('div'); s.id = 'stage'; document.body.appendChild(s); }
  return s;
}

async function basculer(nom, chemin, params) {
  if (courant && courant.module.sortir) { try { courant.module.sortir(); } catch (e) { console.error(e); } }
  const module = await import(chemin);
  courant = { nom, module };
  document.body.dataset.temps = nom;
  await module.entrer(params);
  emit('temps', { nom, params });
}
export function tempsCourant() { return courant ? courant.nom : null; }

export async function explorer(lieuId, opts = {}) {
  if (G) {
    const P = G.player.position || {};
    // on garde la position précise (reprise de partie, rejoindre son coéquipier) si rien n'impose une entrée
    if (!(P.mode === 'lieu' && P.lieu === lieuId && P.x != null && !opts.entree && !P.sorti)) G.player.position = { mode: 'lieu', lieu: lieuId, entree: opts.entree || null };
    const L = G.world.lieux[lieuId] || (G.world.lieux[lieuId] = {});
    L.decouvert = true; L.visite = true;
  }
  clock.setVitesse(vitesseSolo('exploration'));
  ambiance(lieuId);
  await basculer('exploration', '../explore/vue.js', { lieuId, ...opts });
  emit('lieu:entre', { lieu: lieuId });
  sauver();
}
function ambiance(id) { import('../audio.js').then(a => { try { a.playAmbiance(id); } catch (e) {} }).catch(() => {}); }
export async function ouvrirCarte(opts = {}) {
  clock.setVitesse(vitesseSolo('exploration'));
  ambiance(opts.echelle === 'region' ? 'region' : 'rue');
  import('../audio.js').then(a => a.setPluieInterieur && a.setPluieInterieur(false)).catch(() => {});
  await basculer('carte', '../travel/carte.js', opts);
}
export async function voyager(opts) {
  clock.setVitesse(vitesseSolo('voyage'));
  await basculer('voyage', '../travel/voyage.js', opts);
  sauver();
}

function pauserCourant() { if (courant && courant.module.pause) courant.module.pause(); }
function reprendreCourant() { if (!pileOverlays.length && courant && courant.module.reprise) courant.module.reprise(); }

// Le COMBAT n'a plus d'écran à lui : il se joue dans l'exploration.
//   - dans un lieu (scène, déclencheur) : les morts surgissent autour du joueur (explore/vue.combatIci) ;
//   - ailleurs (voyage) : une EMBUSCADE, petit bout de route jouable (explore/vue.embuscade), par-dessus le voyage.
// → Promise<{ issue: 'victoire'|'fuite'|'mort', tues, fuis, xp, bruit }>
export async function combattre(spec) {
  spec = normaliserCombat(spec);
  emit('combat:debut', { spec });
  const vue = await import('../explore/vue.js');
  let r = null;
  try {
    if (courant && courant.nom === 'exploration' && vue.actif()) {
      // Une scène a pu mettre l'exploration (et l'horloge) en pause : le combat, lui, se joue en temps réel.
      const pausesHorloge = clock.pausesActives();
      clock.viderPauses();
      if (courant.module.reprise) courant.module.reprise();
      try { r = await vue.combatIci(spec); }
      finally {
        for (const raison of pausesHorloge) clock.pause(raison);
        if (pileOverlays.length && courant && courant.module.pause) courant.module.pause();
      }
    } else {
      pileOverlays.push('combat'); pauserCourant();
      clock.setVitesse(vitesseSolo('combat'));
      try {
        const echelle = (G && G.player.position && G.player.position.voyage && lieuDe(G.player.position.voyage.vers) || {}).echelle;
        r = await vue.embuscade({ ...spec, echelle: spec.echelle || echelle || 'region' });
      } finally {
        pileOverlays.pop(); clock.setVitesse(vitesseSolo(courant ? courant.nom : 'exploration')); reprendreCourant();
      }
    }
  } catch (e) { console.warn('[flow] combat', e); r = { issue: 'fuite', tues: [], fuis: [] }; }
  r = r || { issue: 'fuite', tues: [], fuis: [] };
  emit('combat:fin', { resultat: r });
  return r;
}
export async function scene(id, opts = {}) {
  pileOverlays.push('scene'); pauserCourant(); clock.pause('scene');
  try {
    const m = await import('../ui/dialogue.js');
    const r = await m.jouerScene(id, opts);
    if (r && r.teleporter) { const t = r.teleporter; setTimeout(() => explorer(t.lieu, { entree: t.entree }), 0); }
    return r;
  } finally {
    clock.reprendre('scene'); pileOverlays.pop(); reprendreCourant();
  }
}
export async function cinematique(id, opts = {}) {
  if (!opts.distant) emit('cinematique', { id });   // co-op : l'autre joueur la voit aussi
  pileOverlays.push('cine'); pauserCourant(); clock.pause('cine');
  try {
    const m = await import('../cine/lecteur.js');
    await m.jouer(id);
  } catch (e) { console.warn('[cine]', id, e); }
  finally { clock.reprendre('cine'); pileOverlays.pop(); reprendreCourant(); }
}
export async function appliquerEffets(effets, ctx = {}) {
  const m = await import('./effects.js');
  return m.appliquerEffets(effets, ctx);
}
export function toast(texte, type = 'info') { emit('toast', { texte, type }); }
export function overlayOuvert() { return pileOverlays.length > 0; }

import { REGLAGES } from '../data/reglages.js';
function vitesseSolo(nom) {
  const V = (REGLAGES.temps && REGLAGES.temps.VITESSE_SOLO) || {};
  const v = V[nom === 'carte' ? 'exploration' : nom];
  return v == null ? 1 : v;
}

export function normaliserCombat(spec) {
  if (!spec) return { zombies: ['errant'] };
  const s = { ...spec };
  if (s.surprise === true) s.surprise = 'surpris';
  if (s.tutoriel) s.tuto = true;
  if (!s.lieuId && G && G.player.position && G.player.position.lieu) s.lieuId = G.player.position.lieu;
  return s;
}
import { lieu as lieuDe } from './donnees.js';
export { lieuDe };
export function quitter() {
  if (courant && courant.module.sortir) { try { courant.module.sortir(); } catch (e) {} }
  courant = null; pileOverlays.length = 0;
  const s = document.getElementById('stage'); if (s) s.innerHTML = '';
}
