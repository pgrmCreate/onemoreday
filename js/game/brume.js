// ============ La brume jaune — le chlore de la gare de triage (docs/HISTOIRE.md §4 et §9) ============
// Depuis la frappe (drapeau `frappe_faite`), le chlore des wagons-citernes éventrés s'amasse LA NUIT, quand le vent
// tombe, dans les terres basses : d'abord la gare, puis la Crau, les bords de l'étang, la Touloubre. Il est plus lourd que
// l'air : les hauteurs et les étages en sont à l'abri ; dedans, au rez-de-chaussée, on en prend un peu moins. Le mistral,
// la pluie et l'orage le chassent ; il faiblit de jour en jour.
// Ce qui protège (emplacement « visage », js/data/clothing.js) : `brume` = part arrêtée (foulard mouillé 0,5, masque de
// protection 0,25) ; le masque à gaz (`filtre: true`) arrête tout tant qu'une cartouche (`filtre_gaz`) y est vissée,
// et une cartouche s'use (REGLAGES.brume.FILTRE_MIN minutes passées dans la brume).
// Sans DOM. L'exploration dit où l'on est (setContexte) et lit visuel() pour dessiner le voile jaune.
import { G, getFlag } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { seedRng } from '../core/rng.js';
import { REGLAGES } from '../data/reglages.js';
import { CLOTHES } from '../data/clothing.js';
import { meteo } from './meteo.js';
import * as survival from './survival.js';
import * as inv from './inventory.js';

const R = () => REGLAGES.brume;
let off = null, ctx = { lieu: null, rdc: true, dehors: true }, nuitAnnoncee = -1, exposeDepuis = 0, dernierToux = 0;

// Où est le joueur, vu par l'exploration (appelé à chaque seconde par js/explore/vue.js).
export function setContexte(c) { ctx = { ...ctx, ...c }; }
export function oublierContexte() { ctx = { lieu: null, rdc: true, dehors: true }; }

const debut = () => (G && G.world.brumeDebut != null ? G.world.brumeDebut : null);
// Jours écoulés depuis la frappe (null avant).
export function joursDepuis(min = G ? G.world.minutes : 0) { const d = debut(); return d == null ? null : (min - d) / 1440; }

// Force du chlore dans un lieu, de nuit et sans vent (0..1), selon l'étalement et l'affaiblissement.
export function forceLieu(lieuId, min = G ? G.world.minutes : 0) {
  const d = joursDepuis(min); if (d == null || d < 0 || !lieuId) return 0;
  let id = lieuId;
  // une rue d'un tronçon (marcher sans carte) : la moyenne de ses deux bouts
  if (typeof id === 'string' && id.startsWith('troncon:')) {
    const [a, b] = id.slice(8).split(':')[0].split('~');
    return 0.8 * (forceLieu(a, min) + forceLieu(b, min)) / 2;
  }
  const z = R().BAS[id]; if (!z) return 0;
  if (d < z.delai) return 0;
  const age = Math.max(0, d - R().PLEINE_JOURS);
  const faiblit = Math.max(R().PLANCHER, 1 - age / R().DECLIN_JOURS);
  return z.force * faiblit;
}

// La nuit, sans vent : 0..1 (montée de 21 h à 22 h, pleine jusqu'à 6 h, se dissipe de 6 h à 8 h).
export function nuitCalme(min = G ? G.world.minutes : 0) {
  const m = meteo();
  if (m === 'mistral' || m === 'pluie' || m === 'orage') return 0;
  const h = ((min % 1440) + 1440) % 1440 / 60;
  let rampe = 0;
  if (h >= 21 && h < 22) rampe = h - 21; else if (h >= 22 || h < 6) rampe = 1; else if (h >= 6 && h < 8) rampe = 1 - (h - 6) / 2;
  if (!rampe) return 0;
  // une nuit sur quatre environ, une brise suffit à la disperser (tirée une fois par nuit, la même pour les deux joueurs)
  const nuit = Math.floor((min - 21 * 60) / 1440), d = joursDepuis(min);
  const forcee = d != null && d < R().NUITS_SURES;                         // les deux premières nuits : toujours
  if (!forcee && seedRng(`${G.world.seed}:brume:${nuit}`)() > R().CHANCE_NUIT) return 0;
  return rampe;
}

// Intensité dans le lieu où l'on est (0..1), avant protection.
export function intensiteIci() {
  if (!G || debut() == null) return 0;
  const P = G.player.position || {};
  const lieu = P.mode === 'lieu' ? (ctx.lieu || P.lieu) : null;
  let f = 0;
  if (lieu) {
    f = forceLieu(lieu) * nuitCalme();
    if (!ctx.rdc) f = 0;                       // à l'étage, au-dessus de la nappe
    else if (!ctx.dehors) f *= R().DEDANS;      // dedans, au rez-de-chaussée : un peu moins
  } else if (P.mode === 'voyage' && P.voyage) {
    const v = P.voyage, frac = v.metres ? Math.min(1, (v.d || 0) / v.metres) : 0.5;
    f = ((1 - frac) * forceLieu(v.de) + frac * forceLieu(v.vers)) * nuitCalme() * R().EN_ROUTE;
  }
  return Math.max(0, Math.min(1, f));
}
// Ce qui protège le visage : 0..1 (le masque à gaz sans cartouche ne protège pas).
export function protection(p = G && G.player) {
  if (!p) return 0;
  const id = p.equip && p.equip.visage, c = id && CLOTHES[id];
  if (!c) return 0;
  if (c.filtre) { const e = (p.equipEtat || {}).visage; return e && e.filtre > 0 ? (c.brume ?? 1) : 0; }
  return c.brume || 0;
}
// Pour le rendu : la force du voile jaune autour de soi (on le voit aussi par la fenêtre de l'étage, en plus pâle).
export function visuel() {
  if (!G || debut() == null) return 0;
  const P = G.player.position || {};
  if (P.mode !== 'lieu') return 0;
  const f = forceLieu(ctx.lieu || P.lieu) * nuitCalme();
  return f * (ctx.rdc ? (ctx.dehors ? 1 : 0.55) : 0.3);
}

// ---------- Chaque minute de jeu ----------
function minute() {
  if (!G || G.player.mort) return;
  if (debut() == null) { if (getFlag('frappe_faite')) G.world.brumeDebut = G.world.minutes; else return; }
  const p = G.player;
  // l'odeur, avant la brume (P10 : le danger est dit avant d'être appliqué)
  const P = p.position || {}, lieu = P.mode === 'lieu' ? (ctx.lieu || P.lieu) : null;
  const h = clock.heure(), nuit = Math.floor((G.world.minutes - 21 * 60) / 1440);
  if (lieu && h >= 20 && h < 21 && nuitAnnoncee !== nuit && forceLieu(lieu) > 0.05 && nuitCalme(G.world.minutes + 90) > 0) {
    nuitAnnoncee = nuit;
    emit('toast', { texte: 'Le vent tombe, et une odeur d’eau de Javel monte avec le soir : la brume jaune va venir. Monte à l’étage, ou en hauteur.', type: 'alerte', duree: 7000 });
  }
  const brut = intensiteIci();
  if (brut < 0.04) { if (exposeDepuis) { exposeDepuis = 0; emit('brume', { expose: false }); } return; }
  // le masque à gaz use sa cartouche ; une cartouche du sac se visse toute seule quand la première est saturée
  const id = p.equip && p.equip.visage, c = id && CLOTHES[id];
  if (c && c.filtre) {
    p.equipEtat = p.equipEtat || {};
    const e = p.equipEtat.visage || (p.equipEtat.visage = { filtre: 0 });
    if (e.filtre > 0) {
      e.filtre = Math.max(0, e.filtre - brut);
      if (e.filtre <= 0) emit('toast', { texte: 'La cartouche du masque est saturée : l’odeur revient.', type: 'mauvais' });
    }
    if (e.filtre <= 0 && inv.countItem('filtre_gaz', p) > 0) {
      inv.removeItem('filtre_gaz', 1, p); e.filtre = R().FILTRE_MIN;
      emit('toast', { texte: 'Tu visses une cartouche neuve sur le masque.', type: 'info' });
    }
  }
  const f = brut * (1 - protection(p));
  if (!exposeDepuis) {
    exposeDepuis = G.world.minutes;
    emit('brume', { expose: true });
    emit('toast', { texte: f > 0.05 ? 'La brume jaune te brûle les yeux et la gorge. Couvre-toi le visage, ou monte.' : 'La brume jaune t’entoure. Ton masque tient.', type: f > 0.05 ? 'alerte' : 'info', duree: 5000 });
  }
  if (f < 0.03) return;
  // la toux, les poumons qui brûlent : des PV, de la fatigue ; dormir dedans peut tuer
  const B = R();
  p._cause = 'brume';
  survival.perdrePv(B.PV_PAR_MIN * f * (survival.activite() === 'sommeil' ? B.SOMMEIL_MULT : 1), 'brume', p);
  p.fatigue = Math.max(0, (p.fatigue ?? 100) - B.FATIGUE_PAR_MIN * f);
  if (G.world.minutes - dernierToux > B.TOUX_MIN) {
    dernierToux = G.world.minutes; emit('survie:toux', { brume: true });
    import('../audio.js').then(a => a.sfx && a.sfx('degats', { volume: 0.22 })).catch(() => {});
  }
}

export function demarrerBrume() {
  arreterBrume();
  nuitAnnoncee = -1; exposeDepuis = 0; dernierToux = 0;
  off = on('minute', minute);
}
export function arreterBrume() { if (off) off(); off = null; oublierContexte(); }
