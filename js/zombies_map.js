// ============ Les zombies SUR la carte — vivants en temps réel, persistants ============
// Aux échelles intérieur et quartier, les zombies existent en chair (morte) sur
// la grille : ils errent MÊME quand tu ne fais rien (boucle au tick, côté map.js),
// regardent dans UNE direction (cône de vue ~90°), te poursuivent de mémoire,
// tapent dans les portes fermées — et au contact, un anneau se vide avant la morsure.
// Persistance : G.world.zmap[carteId] = {
//   t: minute du dernier peuplement,
//   z: [{x, y, id, pas, uid, dir:[dx,dy], ag?, mx?, my?, sans?, spin?, faitLeMort?}],
//   morts: [{x, y}]  — les cadavres laissés au sol
// }
// Champs d'un zombie :
//   uid       — identité stable (pour bouger son pion SVG sans tout redessiner)
//   dir       — vecteur orthogonal du regard, mis à jour à chaque déplacement
//   ag        — 1 : en chasse (il t'a vu ou entendu), 0/absent : errance
//   mx, my    — MÉMOIRE : dernière position où il t'a vu (ou source d'un bruit)
//   sans      — ticks consécutifs sans te revoir (au-delà de MEMOIRE_TICKS : il abandonne)
//   spin      — anneau de contact en cours : ticks restants avant le combat
//   faitLeMort — affiché comme cadavre tant qu'on ne l'a pas réveillé (pré-placés seulement)
import { G, chance, pick, estNuit } from './state.js';
import { CARTES } from './data/world.js';
import {
  passagePossible, ckey, estSecurisee, liaison, porteCassee, frapperPorte,
} from './world.js';
import { zombie } from './data/zombies.js';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------- Réglages du temps réel ----------
export const TICK_MS = 900;     // horloge des zombies (~0,9 s par tick)
export const SPIN_TICKS = 2;    // anneau de contact : 2 ticks (~1,8 s) avant la morsure
export const OUIE_JOUEUR = 5;   // distance à laquelle TU entends un zombie bouger (point estompé)
const MEMOIRE_TICKS = 8;        // ticks sans te revoir avant d'abandonner la poursuite
const CONE_PORTEE = 7;          // distance max du cône de vue d'un zombie
const P_ERRANCE = 0.4;          // en errance : un pas un tick sur deux-trois

// Les échelles où les zombies vivent sur la grille (ville/région : trop abstrait).
export function carteVivante(carteId) {
  const c = CARTES[carteId];
  return !!c && (c.echelle === 'interieur' || c.echelle === 'quartier');
}

function entree(carteId) {
  if (!G.world.zmap) G.world.zmap = {};
  return G.world.zmap[carteId] || null;
}

function uidSuivant() {
  G.world.zseq = (G.world.zseq || 0) + 1;
  return G.world.zseq;
}

// Direction orthogonale dominante de (x1,y1) vers (x2,y2) — pour tourner la tête.
function dirVers(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx) || 1, 0] : [0, Math.sign(dy) || 1];
}

// Migration douce des sauvegardes d'avant : identité, regard, liste des morts.
function normaliser(e) {
  if (!e.morts) e.morts = [];
  for (const z of e.z) {
    if (z.uid === undefined) z.uid = uidSuivant();
    if (!z.dir) z.dir = pick(DIRS).slice();
  }
}

// Peuple une carte à la première visite — et la repeuple doucement si on
// revient après plus de douze heures (le vide attire toujours quelque chose).
// À la PREMIÈRE visite, les zombies SCÉNARISÉS (carte.zombiesFixes) sont posés
// d'abord ; le peuplement procédural complète sans dépasser le cap.
export function peuplerCarte(carteId) {
  if (!carteVivante(carteId)) return;
  if (!G.world.zmap) G.world.zmap = {};
  const c = CARTES[carteId];
  const maintenant = G.world.statsTemps || 0;
  const ex = G.world.zmap[carteId];
  if (ex) normaliser(ex);
  if (ex && maintenant - (ex.t || 0) < 12 * 60) return;
  const z = ex ? [...ex.z] : [];
  if (!ex) {
    for (const f of c.zombiesFixes || []) {
      if (carteId === G.world.carte && f.x === G.world.x && f.y === G.world.y) continue;
      z.push({
        x: f.x, y: f.y, id: f.id, pas: 0, uid: uidSuivant(),
        dir: f.dir ? [...f.dir] : pick(DIRS).slice(),
        ...(f.faitLeMort ? { faitLeMort: true } : {}),
      });
    }
  }
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
      z.push({ x, y, id: pick(pool), pas: 0, uid: uidSuivant(), dir: pick(DIRS).slice() });
    }
  }
  G.world.zmap[carteId] = { t: maintenant, z, morts: (ex && ex.morts) || [] };
}

export function zombiesSur(carteId) {
  const e = entree(carteId);
  return e ? e.z : [];
}

// Le zombie ACTIF d'une case (les faux morts n'arrêtent pas la marche : ils se réveillent).
export function zombieEn(carteId, x, y) {
  return zombiesSur(carteId).find(z => !z.faitLeMort && z.x === x && z.y === y) || null;
}

export function retirerZombie(carteId, z) {
  const e = entree(carteId);
  if (e) e.z = e.z.filter(v => v !== z);
}

// ---------- Cadavres au sol ----------
export function mortsSur(carteId) {
  const e = entree(carteId);
  return (e && e.morts) || [];
}
export function ajouterMort(carteId, x, y) {
  const e = entree(carteId);
  if (!e) return;
  if (!e.morts) e.morts = [];
  e.morts.push({ x, y });
}

// ---------- Les faux morts ----------
export function fauxMortEn(carteId, x, y) {
  return zombiesSur(carteId).find(z => z.faitLeMort && z.x === x && z.y === y) || null;
}
// Il se redresse : en chasse immédiate, anneau de contact si tu es à portée de bras.
export function reveillerFauxMort(z) {
  delete z.faitLeMort;
  z.ag = 1; z.mx = G.world.x; z.my = G.world.y; z.sans = 0;
  z.dir = dirVers(z.x, z.y, G.world.x, G.world.y);
  if (Math.abs(z.x - G.world.x) + Math.abs(z.y - G.world.y) <= 1) z.spin = SPIN_TICKS;
}

// Le zombie au contact et ses congénères adjacents : ils arrivent ENSEMBLE.
export function meuteAuContact(carteId, x, y) {
  return zombiesSur(carteId).filter(z => !z.faitLeMort
    && Math.abs(z.x - x) + Math.abs(z.y - y) <= 1);
}

// Le joueur vient d'arriver au contact (marche) : les adjacents se figent,
// anneau lancé. Retourne le nombre de NOUVEAUX anneaux démarrés.
export function declencherSpins(carteId) {
  let n = 0;
  for (const z of meuteAuContact(carteId, G.world.x, G.world.y)) {
    if (z.spin) continue;
    z.spin = SPIN_TICKS;
    z.ag = 1; z.mx = G.world.x; z.my = G.world.y; z.sans = 0;
    z.dir = dirVers(z.x, z.y, G.world.x, G.world.y);
    n++;
  }
  return n;
}

// ---------- Portes : ce qu'un zombie peut franchir ----------
// Les zombies ne savent pas OUVRIR une porte (bois ou fer) : un battant fermé
// les bloque — ils le cassent (bois) ou s'y heurtent pour toujours (fer).
function porteSur(carteId, x1, y1, x2, y2) {
  const li = liaison(carteId, x1, y1, x2, y2);
  if (li !== 'porte' && li !== 'porte_fer') return null;
  return porteCassee(carteId, x1, y1, x2, y2) ? null : li;
}
function passageZombie(carteId, x1, y1, x2, y2) {
  if (!passagePossible(carteId, x1, y1, x2, y2)) return false;
  return !porteSur(carteId, x1, y1, x2, y2);
}

// ---------- Perception ----------
// Il te VOIT si : tu es dans un cône ~90° face à son regard, à distance ≤ 7,
// ligne de vue dégagée (la vue est réciproque : on réutilise TA visibilité,
// qui passe par les mêmes murs et portes) — OU à portée de bras (dist ≤ 1) —
// OU la nuit à dist ≤ 2 (ils sentent).
function teVoit(z, px, py, vis) {
  const dist = Math.abs(z.x - px) + Math.abs(z.y - py);
  if (dist <= 1) return true;
  if (estNuit() && dist <= 2) return true;
  if (dist > CONE_PORTEE) return false;
  if (!vis.has(`${z.x},${z.y}`)) return false;
  const dx = px - z.x, dy = py - z.y;
  const [fx, fy] = z.dir || [0, 1];
  const devant = dx * fx + dy * fy;          // composante devant lui
  return devant > 0 && Math.abs(dx * fy - dy * fx) <= devant; // cône à ~45° de part et d'autre
}

// ---------- LE tick temps réel ----------
// Joué toutes les TICK_MS par la boucle de map.js (qui décide quand le monde
// respire : carte affichée, pas de combat, pas de modale, onglet visible).
// Retourne ce qui s'est passé, pour l'affichage et le son :
//   contact — zombie dont l'anneau a expiré SUR toi : combat
//   bouges  — Set des uid qui se sont déplacés (pour l'ouïe du joueur)
//   bruits  — Set des uid qui ont fait du bruit sans bouger (coups de porte)
//   spins   — zombies dont l'anneau de contact vient de démarrer
//   portes  — coups portés aux portes : {x1,y1,x2,y2,cassee,fer}
export function tickZombies(carteId, vis) {
  const ev = { contact: null, bouges: new Set(), bruits: new Set(), spins: [], portes: [] };
  const e = entree(carteId);
  if (!e || !e.z.length) return ev;
  const px = G.world.x, py = G.world.y;
  const occupe = new Set(e.z.filter(v => !v.faitLeMort).map(v => `${v.x},${v.y}`));
  for (const z of e.z) {
    if (z.faitLeMort) continue; // il attend son heure
    const def = zombie(z.id) || {};
    const dist = Math.abs(z.x - px) + Math.abs(z.y - py);

    // --- anneau de contact en cours : il est sur toi, l'instant se fige ---
    if (z.spin) {
      z.spin--;
      if (z.spin <= 0) {
        delete z.spin;
        if (dist <= 1) { if (!ev.contact) ev.contact = z; }
        // sinon : tu t'es arraché à temps — il reprend la poursuite au tick suivant
      }
      continue;
    }

    // --- perception : cône de vue, contact, flair nocturne, mémoire ---
    if (teVoit(z, px, py, vis)) {
      z.ag = 1; z.mx = px; z.my = py; z.sans = 0;
    } else if (z.ag) {
      z.sans = (z.sans || 0) + 1;
      // il a atteint l'endroit où il t'a vu, ou trop de temps sans te revoir : il renifle, puis repart errer
      if (z.sans > MEMOIRE_TICKS || (z.x === z.mx && z.y === z.my)) {
        z.ag = 0; delete z.mx; delete z.my; delete z.sans;
      }
    }

    // --- adjacent et en chasse : il s'immobilise, l'anneau démarre ---
    if (z.ag && dist <= 1) {
      z.spin = SPIN_TICKS;
      z.dir = dirVers(z.x, z.y, px, py);
      ev.spins.push(z);
      continue;
    }

    // --- cadence : la poursuite presse le pas, l'errance traîne ---
    z.pas = (z.pas || 0) + 1;
    const lent = (def.vitesse || 6000) >= 6000;
    if (z.ag) {
      if (lent && z.pas % 2 === 0) continue; // les traînards chargent un tick sur deux
    } else if (!chance(P_ERRANCE)) continue;

    // --- mouvement ---
    let pasV = null;
    if (z.ag) {
      const d = (xx, yy) => Math.abs(xx - z.mx) + Math.abs(yy - z.my);
      const options = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
        .filter(([nx, ny]) => passageZombie(carteId, z.x, z.y, nx, ny))
        .sort((a, b) => d(a[0], a[1]) - d(b[0], b[1]));
      const ici = d(z.x, z.y);
      if (options.length && d(options[0][0], options[0][1]) < ici) {
        pasV = options[0];
      } else {
        // Le chemin direct est bouché. Une porte fermée ? Alors il TAPE dedans.
        const portes = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
          .filter(([nx, ny]) => passagePossible(carteId, z.x, z.y, nx, ny)
            && porteSur(carteId, z.x, z.y, nx, ny))
          .sort((a, b) => d(a[0], a[1]) - d(b[0], b[1]));
        if (portes.length) {
          const [nx, ny] = portes[0];
          z.dir = dirVers(z.x, z.y, nx, ny);
          const r = frapperPorte(carteId, z.x, z.y, nx, ny);
          ev.portes.push({ x1: z.x, y1: z.y, x2: nx, y2: ny, cassee: r.cassee, fer: r.fer });
          ev.bruits.add(z.uid);
          continue;
        }
        pasV = options[0] || null; // pas de porte : il prend le moins mauvais des pas
      }
    } else {
      const options = DIRS.map(([dx, dy]) => [z.x + dx, z.y + dy])
        .filter(([nx, ny]) => passageZombie(carteId, z.x, z.y, nx, ny)
          && !estSecurisee(ckey(carteId, nx, ny)));
      pasV = options.length ? pick(options) : null;
    }
    if (!pasV) continue;
    if (pasV[0] === px && pasV[1] === py) continue; // il ne marche pas SUR toi : l'anneau s'en charge au contact
    const k = `${pasV[0]},${pasV[1]}`;
    if (occupe.has(k)) continue;
    occupe.delete(`${z.x},${z.y}`);
    z.dir = [Math.sign(pasV[0] - z.x), Math.sign(pasV[1] - z.y)];
    z.x = pasV[0]; z.y = pasV[1];
    occupe.add(k);
    ev.bouges.add(z.uid);
  }
  return ev;
}

// ---------- Repli tour par tour (silencieux) ----------
// Quand la boucle temps réel ne peut pas tourner (action longue sous spinner
// d'attente, réglage futur) : on joue des ticks muets pour rattraper le temps.
export function tourZombies(carteId, vis) {
  return tickZombies(carteId, vis).contact;
}
export function rattraperTours(carteId, vis, tours = 1) {
  for (let i = 0; i < tours; i++) {
    const contact = tickZombies(carteId, vis).contact;
    if (contact) return contact;
  }
  return null;
}

// Un grand bruit (fouille brutale, cloche, coup de feu) : les zombies du coin
// tournent la tête vers la source — et s'y rendent, de mémoire, avant d'abandonner.
export function attirerZombies(carteId, x, y, rayon = 5) {
  for (const z of zombiesSur(carteId)) {
    if (z.faitLeMort) continue;
    const dist = Math.abs(z.x - x) + Math.abs(z.y - y);
    if (dist > rayon || dist === 0) continue;
    z.dir = dirVers(z.x, z.y, x, y);
    z.ag = 1; z.mx = x; z.my = y; z.sans = 0;
  }
}
