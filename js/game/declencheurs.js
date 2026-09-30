// ============ Déclencheurs globaux — 'flag' et 'heure' (les autres sont gérés par l'exploration / le voyage) ============
import { G } from '../core/state.js';
import { on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { DECLENCHEURS } from '../data/histoire/declencheurs.js';
import { verifier } from './conditions.js';
import * as flow from './flow.js';

let offs = [], file = [], enCours = false;
const cle = (d, i) => `global:${d.quand}:${d.flag || ''}:${d.heure ?? ''}:${d.scene || d.cinematique || i}`;

export function demarrerDeclencheurs() {
  arreterDeclencheurs();
  offs.push(on('flag', ({ k, v }) => { if (v) verifierTous('flag', k); }));
  offs.push(on('minute', () => verifierTous('heure')));
  offs.push(on('scene:fin', () => setTimeout(depiler, 50)));
  offs.push(on('combat:fin', () => setTimeout(depiler, 50)));
}
export function arreterDeclencheurs() { offs.forEach(f => f()); offs = []; file = []; }

function verifierTous(quand, flag) {
  if (!G || G.mode === 'invite') return;
  DECLENCHEURS.forEach((d, i) => {
    if (d.quand !== quand) return;
    if (quand === 'flag' && d.flag !== flag) return;
    if (quand === 'heure') {
      if (d.jourMin && clock.jour() < d.jourMin) return;
      if (d.heure != null && clock.heure() < d.heure) return;
    }
    const k = cle(d, i);
    G.world.declencheurs = G.world.declencheurs || {};
    if (G.world.declencheurs[k]) return;
    if (!verifier(d.si)) return;
    if (d.unique !== false || quand === 'heure') G.world.declencheurs[k] = true;
    file.push(d);
  });
  depiler();
}
async function depiler() {
  if (enCours || !file.length || flow.overlayOuvert()) return;
  enCours = true;
  const d = file.shift();
  try {
    if (d.cinematique) await flow.cinematique(d.cinematique);
    if (d.scene) {
      const r = await flow.scene(d.scene);
      if (r && r.fin === '#combat' && r.combat) await flow.combattre(r.combat);
    }
  } catch (e) { console.warn('[declencheurs]', e); }
  enCours = false;
  if (file.length) setTimeout(depiler, 100);
}
