// ============ Exploration — combats de scène (des morts surgissent ici) et embuscades de voyage ============
//   combatIci(spec) → Promise<resultat> : des morts surgissent autour du joueur (scènes, déclencheurs).
//   embuscade(spec) → Promise<resultat> : un bout de route jouable (rencontres de voyage), on en sort par un bord.
// resultat = { issue: 'victoire'|'fuite'|'mort', tues, fuis, xp, bruit }
import { G } from '../core/state.js';
import { REGLAGES } from '../data/reglages.js';
import { sfx, message } from './commun.js';

let V = null, api = null;
// api = { entrer(params), sortir(), vue: () => V courant }
export function lierCombatLieu(v, a) { V = v; if (a) api = a; }

export async function combatIci(spec = {}) {
  if (!V) return { issue: 'fuite', tues: [], fuis: [] };
  const v = V;
  const occupe = v.occupe; v.occupe = false; v.entrees.actif(true);   // une scène a pu figer le joueur : il doit pouvoir se battre
  try {
    const uids = await v.canal.faireApparaitre(spec.zombies || ['errant'], { surprise: spec.surprise, scene: true });
    if (api.vue() !== v) return { issue: 'fuite', tues: [], fuis: [] };
    sfx('alerte_contact');
    return await suivreCombat(v, uids);
  } finally {
    if (api.vue() === v && occupe) { v.occupe = true; v.entrees.actif(false); }
  }
}
export function suivreCombat(v, uids, { arene = false } = {}) {
  return new Promise((ok) => {
    if (!v) return ok({ issue: 'fuite', tues: [], fuis: uids });
    const set = new Set(uids);
    let loinDepuis = 0, fini = false;
    const finir = (issue) => {
      if (fini) return; fini = true; clearInterval(iv);
      const vivants = v.snap ? v.snap.zombies.filter(z => set.has(z.uid)).map(z => z.uid) : [];
      ok({ issue, tues: uids.filter(u => !vivants.includes(u)), fuis: issue === 'fuite' ? vivants : [], xp: {}, bruit: 0 });
    };
    v.attentes = (v.attentes || []).concat(() => finir(v.cbt && v.cbt.etat.mort ? 'mort' : 'fuite'));
    const iv = setInterval(() => {
      if (api.vue() !== v) { finir('fuite'); return; }
      if (v.cbt.etat.mort || (G.player.pv ?? 1) <= 0) { finir('mort'); return; }
      const vivants = v.snap.zombies.filter(z => set.has(z.uid));
      if (!vivants.length) { finir('victoire'); return; }
      if (arene) return;
      const F = REGLAGES.combat.FIN_FUITE;
      const loin = vivants.every(z => z.etage !== v.j.etage || Math.hypot(z.x - v.j.x, z.y - v.j.y) > F.DISTANCE);
      loinDepuis = loin ? loinDepuis + 250 : 0;
      if (loinDepuis >= F.MS) finir('fuite');
    }, 250);
  });
}

// Embuscade : un bout de route généré, on s'en sort en tuant ou par un bord.
let areneFin = null;
export function embuscade(spec = {}) {
  return new Promise(async (ok) => {
    areneFin = ok;
    const W = G.world;
    const seed = `${W.minutes}:${(spec.zombies || []).join(',')}:${Math.floor(Math.random() * 1e6)}`;
    try { await api.entrer({ arene: { ...spec, seed, echelle: spec.echelle || 'region' } }); }
    catch (e) { console.warn('[explore] embuscade', e); areneFin = null; ok({ issue: 'fuite', tues: [], fuis: [] }); }
  });
}
export function finArene(raison) {
  const v = api.vue();
  if (!v || !v.arene) return;
  if (raison === 'nettoye') { // tous à terre : on peut fouiller les corps puis reprendre la route
    v.hud.route.classList.remove('cache');
    message('Plus rien ne bouge. Fouille les corps si tu veux, puis reprends la route (ou sors par un bord).', 4200);
    v.areneVictoire = true;
    return;
  }
  const vivants = v.snap ? v.snap.zombies.map(z => z.uid) : [];
  const res = { issue: raison === 'mort' ? 'mort' : v.areneVictoire || !vivants.length ? 'victoire' : 'fuite', tues: [], fuis: vivants, xp: {}, bruit: 0 };
  const ok = areneFin; areneFin = null;
  api.sortir();
  if (ok) ok(res);
}
