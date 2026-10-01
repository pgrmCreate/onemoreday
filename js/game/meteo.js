// ============ Météo du monde : une par demi-journée (graine), elle DURE ============
// Pilote la pluie (son plein dehors, étouffé sous un toit ; visible dehors en exploration) et le contexte de survie.
import { G } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import { seedRng } from '../core/rng.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import { setContexteSurvie } from './survival.js';

let courante = null, off = null;
export function meteo() { return courante || 'clair'; }
// Intensité visuelle de la pluie 0..1 (forte ou légère selon la demi-journée).
export function pluie() {
  if (meteo() !== 'pluie' || !G) return 0;
  const r = seedRng(`${G.world.seed}:averse:${Math.floor(G.world.minutes / 720)}`);
  return r() < 0.4 ? 1 : 0.55;
}
function maj() {
  if (!G) return;
  const m = meteoCourante();
  if (m === courante) return;
  courante = m;
  try { setContexteSurvie({ meteo: m }); } catch (e) {}
  const p = pluie();
  import('../audio.js').then(a => a.setPluie && a.setPluie(p ? (p >= 1 ? 'forte' : 'legere') : null)).catch(() => {});
  emit('meteo', { type: m, pluie: p });
}
export function demarrerMeteo() { arreterMeteo(); courante = null; maj(); off = on('minute', maj); }
export function arreterMeteo() { if (off) off(); off = null; courante = null; import('../audio.js').then(a => a.setPluie && a.setPluie(null)).catch(() => {}); }
