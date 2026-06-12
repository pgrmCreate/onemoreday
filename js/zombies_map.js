// ============ Les zombies SUR la carte — visibles, mobiles, persistants ============
// Aux échelles intérieur et quartier, les zombies existent en chair (morte) sur
// la grille : on les VOIT arriver au bout du couloir, ils avancent quand tu
// avances, et le combat ne se déclenche qu'au CONTACT. Plus d'embuscades
// sorties de nulle part là où tes yeux portent.
// Persistance : G.world.zmap[carteId] = { t: minute du dernier peuplement, z: [{x,y,id,pas}] }
import { G, chance, pick, estNuit } from './state.js';
import { CARTES } from './data/world.js';
import { caseDef, passagePossible, ckey, estSecurisee } from './world.js';
import { zombie } from './data/zombies.js';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Les échelles où les zombies vivent sur la grille (ville/région : trop abstrait).
export function carteVivante(carteId) {
  const c = CARTES[carteId];
  return !!c && (c.echelle === 'interieur' || c.echelle === 'quartier');
}

function entree(carteId) {
  if (!G.world.zmap) G.world.zmap = {};
  return G.world.zmap[carteId] || null;
}

// Peuple une carte à la première visite — et la repeuple doucement si on
// revient après plus de douze heures (le vide attire toujours quelque chose).
export function peuplerCarte(carteId) {
  if (!carteVivante(carteId)) return;
  if (!G.world.zmap) G.world.zmap = {};
  const c = CARTES[carteId];
  const maintenant = G.world.statsTemps || 0;
  const ex = G.world.zmap[carteId];
  if (ex && maintenant - (ex.t || 0) < 12 * 60) return;
  const z = ex ? [...ex.z] : [];
  const cap = Math.max(2, Math.round(Object.keys(c.cases).length / 7)) + (estNuit() ? 1 : 0);
  for (const [pos, cd] of Object.entries(c.cases)) {
    if (z.length >= cap) break;
    const danger = cd.danger || 0;
    if (danger < 0.15) continue;
    const [x, y] = pos.split(',').map(Number);
    if (estSecurisee(ckey(carteId, x, y))) continue;
    if (z.some(e => e.x === x && e.y === y)) continue;
    if (carteId === G.world.carte && x === G.world.x && y === G.world.y) continue;
    if (chance(danger * (ex ? 0.3 : 0.55))) {
      const pool = cd.zombies || c.zombiesPool || ['errant'];
      z.push({ x, y, id: pick(pool), pas: 0 });
    }
  }
  G.world.zmap[carteId] = { t: maintenant, z };
}

export function zombiesSur(carteId) {
  const e = entree(carteId);
  return e ? e.z : [];
}

export function zombieEn(carteId, x, y) {
  return zombiesSur(carteId).find(z => z.x === x && z.y === y) || null;
}

export function retirerZombie(carteId, z) {
  const e = entree(carteId);
  if (e) e.z = e.z.filter(v => v !== z);
}

// Le zombie au contact et ses congénères adjacents : ils arrivent ENSEMBLE.
export function meuteAuContact(carteId, x, y) {
  const meute = zombiesSur(carteId).filter(z =>
    Math.abs(z.x - x) + Math.abs(z.y - y) <= 1);
  return meute;
}

// Un « tour » de zombies — joué après chaque pas du joueur ou action longue.
// vis : l'ensemble des cases dans la vue du joueur (la vue est réciproque :
// s'il est dans ta vue à portée, tu es dans la sienne).
// Retourne le zombie entré au contact, ou null.
export function tourZombies(carteId, vis) {
  const e = entree(carteId);
  if (!e || !e.z.length) return null;
  const px = G.world.x, py = G.world.y;
  const occupe = new Set(e.z.map(z => `${z.x},${z.y}`));
  let contact = null;
  for (const z of e.z) {
    const def = zombie(z.id) || {};
    z.pas = (z.pas || 0) + 1;
    const lent = (def.vitesse || 6000) >= 6000;
    if (lent && z.pas % 2 === 0) continue; // les traînards avancent un pas sur deux
    const dist = Math.abs(z.x - px) + Math.abs(z.y - py);
    const teVoit = (dist <= 7 && vis.has(`${z.x},${z.y}`)) || dist <= 1 || (estNuit() && dist <= 2);
    let pas = null;
    if (teVoit) {
      const options = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
        .filter(([nx, ny]) => passagePossible(carteId, z.x, z.y, nx, ny))
        .sort((a, b) => (Math.abs(a[0] - px) + Math.abs(a[1] - py)) - (Math.abs(b[0] - px) + Math.abs(b[1] - py)));
      pas = options[0] || null;
    } else if (chance(0.4)) {
      const options = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
        .filter(([nx, ny]) => passagePossible(carteId, z.x, z.y, nx, ny)
          && !estSecurisee(ckey(carteId, nx, ny)));
      pas = options.length ? pick(options) : null;
    }
    if (!pas) continue;
    if (pas[0] === px && pas[1] === py) { contact = z; continue; } // il fond sur toi
    const k = `${pas[0]},${pas[1]}`;
    if (occupe.has(k)) continue;
    occupe.delete(`${z.x},${z.y}`);
    z.x = pas[0]; z.y = pas[1];
    occupe.add(k);
  }
  return contact;
}

// Un grand bruit (fouille brutale, cloche, coup de feu) : les zombies du coin
// tournent la tête et se mettent en marche vers la source.
export function attirerZombies(carteId, x, y, rayon = 5) {
  for (const z of zombiesSur(carteId)) {
    const dist = Math.abs(z.x - x) + Math.abs(z.y - y);
    if (dist > rayon || dist === 0) continue;
    const options = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
      .filter(([nx, ny]) => passagePossible(carteId, z.x, z.y, nx, ny))
      .sort((a, b) => (Math.abs(a[0] - x) + Math.abs(a[1] - y)) - (Math.abs(b[0] - x) + Math.abs(b[1] - y)));
    if (options.length && !(options[0][0] === x && options[0][1] === y)) {
      z.x = options[0][0]; z.y = options[0][1];
    }
  }
}
