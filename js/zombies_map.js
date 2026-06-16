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
import { G, chance, pick, estNuit, seedRng } from './state.js';
import { CARTES } from './data/world.js';
import {
  passagePossible, ckey, estSecurisee, liaison, porteCassee, frapperPorte,
  estGraphe, voisinsCandidats, sontLies,
} from './world.js';
import { zombie } from './data/zombies.js';
import { REGLAGES, reglageEchelle } from './data/reglages.js';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------- Réglages du temps réel (TOUS centralisés dans js/data/reglages.js) ----------
// Ici on ne fait que LIRE la config : pour changer le ressenti (vitesse des morts,
// durée de l'anneau de contact, etc.), c'est dans reglages.js que ça se passe.
const RZ = REGLAGES.zombies;
export const TICK_MS = RZ.TICK_MS;        // horloge des zombies (~0,9 s par tick)
export const SPIN_TICKS = RZ.SPIN_TICKS;  // anneau de contact de base, AVANT le facteur d'échelle
export const OUIE_JOUEUR = RZ.OUIE_JOUEUR;
const MEMOIRE_TICKS = RZ.MEMOIRE_TICKS;
const CONE_PORTEE = RZ.CONE_PORTEE;
const P_ERRANCE = RZ.P_ERRANCE;

// Contact CONTINU (déplacement libre intérieur) : le combat se déclenche au CONTACT RÉEL des
// ronds (géré frame par frame côté freemove/map.js), pas par l'anneau de case adjacente. Quand
// c'est actif, le tick NE FIGE PLUS les morts (ils continuent de poursuivre) et ne renvoie aucun
// `contact` — c'est la distance pixel entre le rond du joueur et celui du mort qui décide.
export let CONTACT_CONTINU = false;
export function setContactContinu(v) { CONTACT_CONTINU = v; }

// Anneau de contact EFFECTIF sur une carte donnée : la base, étirée par l'échelle.
// En quartier (un nœud = un pâté de maisons), l'instant suspendu avant la morsure
// dure bien plus longtemps — c'est ce qui te laisse le temps de t'écarter ou de fuir.
function spinTicks(carteId) {
  const c = CARTES[carteId];
  return SPIN_TICKS * reglageEchelle(c && c.echelle).anneauZombie;
}

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

// ---------- Cartes « plan » à nœuds libres : position, regard, distance ----------
function posPlan(c, x, y) {
  const cd = c.cases[`${x},${y}`];
  return cd ? { cx: cd.cx ?? (x * 74 + 50), cy: cd.cy ?? (y * 74 + 50) } : { cx: x, cy: y };
}
// Regard normalisé : en plan, vers le nœud cible (espace cx,cy) ; sinon orthogonal.
function regard(c, x1, y1, x2, y2) {
  if (!c || !c.graphe) return dirVers(x1, y1, x2, y2);
  const a = posPlan(c, x1, y1), b = posPlan(c, x2, y2);
  const dx = b.cx - a.cx, dy = b.cy - a.cy, n = Math.hypot(dx, dy) || 1;
  return [dx / n, dy / n];
}
// Distance en SAUTS depuis (px,py) sur le graphe (perception + poursuite).
function champHops(carteId, px, py) {
  const df = new Map([[`${px},${py}`, 0]]);
  let front = [[px, py]];
  for (let d = 1; d < 40 && front.length; d++) {
    const next = [];
    for (const [x, y] of front) for (const [nx, ny] of voisinsCandidats(carteId, x, y)) {
      const k = `${nx},${ny}`;
      if (df.has(k) || !passageZombie(carteId, x, y, nx, ny)) continue;
      df.set(k, d); next.push([nx, ny]);
    }
    front = next;
  }
  return df;
}
// Distance PERÇUE par le joueur jusqu'à un nœud : en SAUTS sur un plan à nœuds (cohérent
// avec la vue et la poursuite), à calculer une fois par rendu. Renvoie null hors plan —
// le compteur de meute et les points d'ouïe retombent alors sur la distance en cases.
export function champOuieJoueur(carteId) {
  return estGraphe(carteId) ? champHops(carteId, G.world.x, G.world.y) : null;
}
// Au contact : même case, OU adjacent AVEC un passage réellement ouvert entre les
// deux. Le passage compte : un mort dans le couloir, derrière TA porte fermée, n'est
// PAS au contact — il doit d'abord enfoncer la porte (sinon il mordrait au travers).
function auContact(carteId, ax, ay, bx, by) {
  if (ax === bx && ay === by) return true;
  if (estGraphe(carteId)) return passageZombie(carteId, ax, ay, bx, by);
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1 && passageZombie(carteId, ax, ay, bx, by);
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
// Rayon « réveil sûr » : à la PREMIÈRE pose d'une carte, on ne sème aucun mort
// à portée immédiate de l'endroit où l'on débarque (la chambre du début, l'entrée
// d'un lieu). Sans ça, on pouvait « ouvrir les yeux » collé à un mort et devoir se
// battre dès la première seconde — et, en co-op, l'un tombait dessus, pas l'autre.
const SPAWN_SAFE = 2;

export function peuplerCarte(carteId) {
  if (!carteVivante(carteId)) return;
  if (!G.world.zmap) G.world.zmap = {};
  const c = CARTES[carteId];
  const maintenant = G.world.statsTemps || 0;
  const ex = G.world.zmap[carteId];
  if (ex) normaliser(ex);
  if (ex && maintenant - (ex.t || 0) < 12 * 60) return;
  const premiere = !ex; // 1re pose de cette carte : on sème de façon DÉTERMINISTE (co-op)
  // ---------- Mode ÉDITEUR : placement 100 % MANUEL ----------
  // Une carte marquée `editeur:true` (testée depuis l'éditeur de cartes) ne reçoit
  // AUCUN peuplement procédural ni `zombiesFixes` : seuls comptent les zombies posés à
  // la main, case par case, via `cd.zEd = [{id, p}]` (p = proba d'apparition 0..1).
  // Chaque spec est tirée une fois, à la graine de partie — placement à la lettre.
  if (c.editeur) {
    if (!premiere) return; // un seul peuplement (le bac à sable de test repart à neuf à chaque essai)
    const rndE = seedRng((G.world.seed || 0) + ':zed:' + carteId);
    const zE = [];
    for (const [pos, cd] of Object.entries(c.cases)) {
      if (!Array.isArray(cd.zEd) || !cd.zEd.length) continue;
      const [x, y] = pos.split(',').map(Number);
      for (const spec of cd.zEd) {
        const p = spec.p == null ? 1 : spec.p;
        if (rndE() < p) {
          zE.push({
            x, y, id: spec.id, pas: 0, uid: uidSuivant(), dir: pick(DIRS).slice(),
            ...(spec.faitLeMort ? { faitLeMort: true } : {}),
          });
        }
      }
    }
    G.world.zmap[carteId] = { t: maintenant, z: zE, morts: [] };
    return;
  }
  const z = ex ? [...ex.z] : [];
  // À la 1re visite, le tirage suit une graine PARTAGÉE (seed + carte) : hôte et invité
  // sèment EXACTEMENT la même horde, sans avoir à se synchroniser. Au repeuplement
  // (retour après 12 h), on retombe sur l'aléa ordinaire — rare, et déjà en jeu.
  const rnd = premiere ? seedRng((G.world.seed || 0) + ':z:' + carteId) : null;
  const sChance = (p) => (premiere ? rnd() : Math.random()) < p;
  const sPick = (arr) => arr[Math.floor((premiere ? rnd() : Math.random()) * arr.length)];
  // Case d'arrivée (réveil / entrée) à protéger sur cette carte, le cas échéant.
  const surCarte = carteId === G.world.carte;
  const prochePoint = (x, y) => surCarte && (Math.abs(x - G.world.x) + Math.abs(y - G.world.y)) <= SPAWN_SAFE;
  if (!ex) {
    for (const f of c.zombiesFixes || []) {
      if (prochePoint(f.x, f.y)) continue; // jamais collé au point d'arrivée
      z.push({
        x: f.x, y: f.y, id: f.id, pas: 0, uid: uidSuivant(),
        dir: f.dir ? [...f.dir] : sPick(DIRS).slice(),
        ...(f.faitLeMort ? { faitLeMort: true } : {}),
      });
    }
  }
  // Densité de la horde : nb de cases ÷ capDiv (réglages.js) — le quartier en porte plus.
  // Une carte peut imposer son propre plafond via `capZombies` (ex. l'hôtel du début : 3 max).
  const capDiv = reglageEchelle(c.echelle).capDiv;
  const cap = c.capZombies != null
    ? c.capZombies
    : Math.max(2, Math.round(Object.keys(c.cases).length / capDiv)) + (estNuit() ? 1 : 0);
  for (const [pos, cd] of Object.entries(c.cases)) {
    if (z.length >= cap) break;
    const danger = cd.danger || 0;
    if (danger < 0.15) continue;
    const [x, y] = pos.split(',').map(Number);
    if (estSecurisee(ckey(carteId, x, y))) continue;
    if (z.some(e => e.x === x && e.y === y)) continue;
    if (prochePoint(x, y)) continue; // zone de réveil/entrée sûre : pas de combat immédiat
    if (sChance(danger * (ex ? 0.3 : 0.55))) {
      const pool = cd.zombies || c.zombiesPool || ['errant'];
      z.push({ x, y, id: sPick(pool), pas: 0, uid: uidSuivant(), dir: sPick(DIRS).slice() });
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
  z.dir = regard(CARTES[G.world.carte], z.x, z.y, G.world.x, G.world.y);
  if (auContact(G.world.carte, z.x, z.y, G.world.x, G.world.y)) z.spin = spinTicks(G.world.carte);
}

// Le zombie au contact et ses congénères adjacents : ils arrivent ENSEMBLE.
export function meuteAuContact(carteId, x, y) {
  return zombiesSur(carteId).filter(z => !z.faitLeMort && auContact(carteId, z.x, z.y, x, y));
}

// Le joueur vient d'arriver au contact (marche) : les adjacents se figent,
// anneau lancé. Retourne le nombre de NOUVEAUX anneaux démarrés.
export function declencherSpins(carteId) {
  let n = 0;
  for (const z of meuteAuContact(carteId, G.world.x, G.world.y)) {
    if (z.spin) continue;
    z.spin = spinTicks(carteId);
    z.ag = 1; z.mx = G.world.x; z.my = G.world.y; z.sans = 0;
    z.dir = regard(CARTES[carteId], z.x, z.y, G.world.x, G.world.y);
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
function teVoit(carteId, z, px, py, vis, dist) {
  if (dist <= 1) return true;
  if (estNuit() && dist <= 2) return true;
  if (dist > CONE_PORTEE) return false;
  if (!vis.has(`${z.x},${z.y}`)) return false;
  const c = CARTES[carteId];
  // Sur un PLAN à nœuds, un nœud est un pâté de maisons entier : le « regard » d'un mort
  // y est une abstraction trop fine. Dès qu'il a une ligne de vue dégagée sur toi (la vue
  // est réciproque : on réutilise TA visibilité) et que tu es à portée, il te repère —
  // sans cône serré. C'est ce qui lui permet de venir de l'autre bout de la ville ; sinon,
  // tourné « au hasard », il ne te voyait jamais au-delà d'une case.
  if (c && c.graphe) return true;
  // Grille (intérieur, rue dense) : cône ~90° devant son regard.
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
  // Sur un plan à nœuds, la distance au joueur est un nombre de SAUTS (champ BFS
  // recalculé à chaque tick) ; la poursuite descend ce gradient vers toi.
  const c = CARTES[carteId];
  const graphe = !!(c && c.graphe);
  const df = graphe ? champHops(carteId, px, py) : null;
  const distJ = (xx, yy) => graphe ? (df.get(`${xx},${yy}`) ?? 99) : Math.abs(xx - px) + Math.abs(yy - py);
  for (const z of e.z) {
    if (z.faitLeMort) continue; // il attend son heure
    const def = zombie(z.id) || {};
    const dist = distJ(z.x, z.y);

    // En contact CONTINU (déplacement libre), aucun anneau de case : on purge un éventuel
    // reliquat et le mort poursuit sans se figer (le contact réel des ronds fait foi ailleurs).
    if (CONTACT_CONTINU) { if (z.spin) delete z.spin; }
    // --- anneau de contact en cours : il est sur toi, l'instant se fige ---
    else if (z.spin) {
      z.spin--;
      if (z.spin <= 0) {
        delete z.spin;
        if (auContact(carteId, z.x, z.y, px, py)) { if (!ev.contact) ev.contact = z; }
        // sinon : tu t'es arraché à temps (ou la porte tient) — il reprend au tick suivant
      }
      continue;
    }

    // --- perception : cône de vue, contact, flair nocturne, mémoire ---
    if (teVoit(carteId, z, px, py, vis, dist)) {
      z.ag = 1; z.mx = px; z.my = py; z.sans = 0;
    } else if (z.ag) {
      z.sans = (z.sans || 0) + 1;
      // il a atteint l'endroit où il t'a vu, ou trop de temps sans te revoir : il renifle, puis repart errer
      if (z.sans > MEMOIRE_TICKS || (z.x === z.mx && z.y === z.my)) {
        z.ag = 0; delete z.mx; delete z.my; delete z.sans;
      }
    }

    // --- au contact (passage ouvert) et en chasse : il s'immobilise, l'anneau démarre ---
    // (sauf en contact CONTINU : il ne se fige pas, il vient au contact réel du rond)
    if (!CONTACT_CONTINU && z.ag && auContact(carteId, z.x, z.y, px, py)) {
      z.spin = spinTicks(carteId);
      z.dir = regard(c, z.x, z.y, px, py);
      ev.spins.push(z);
      continue;
    }

    // --- cadence : la poursuite presse le pas, l'errance traîne ; l'ÉCHELLE étire tout ---
    // En quartier, un nœud est un pâté de maisons entier : `cadenceZombie` (≥ 1)
    // multiplie la période du pas → le mort met bien plus de temps à changer de case.
    z.pas = (z.pas || 0) + 1;
    const cad = reglageEchelle(c && c.echelle).cadenceZombie;
    const lent = (def.vitesse || RZ.SEUIL_LENT) >= RZ.SEUIL_LENT;
    if (z.ag) {
      const periode = (lent ? RZ.PERIODE_LENT : RZ.PERIODE_VIF) * cad;
      if (periode > 1 && z.pas % periode !== 0) continue; // il n'avance qu'un tick sur `periode`
    } else if (!chance(P_ERRANCE / cad)) continue;          // en errance : encore plus paresseux au loin

    // --- mouvement ---
    let pasV = null;
    const voisinsZ = (zz) => (graphe ? voisinsCandidats(carteId, zz.x, zz.y) : DIRS.map(([dx, dy]) => [zz.x + dx, zz.y + dy]))
      .filter(([nx, ny]) => passageZombie(carteId, zz.x, zz.y, nx, ny));
    if (z.ag && graphe) {
      // Plan : on descend le gradient de distance (en sauts) vers le joueur.
      const options = voisinsZ(z).sort((a, b) => distJ(a[0], a[1]) - distJ(b[0], b[1]));
      pasV = (options.length && distJ(options[0][0], options[0][1]) < dist) ? options[0] : (options[0] || null);
    } else if (z.ag) {
      const d = (xx, yy) => Math.abs(xx - z.mx) + Math.abs(yy - z.my);
      const options = voisinsZ(z).sort((a, b) => d(a[0], a[1]) - d(b[0], b[1]));
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
      const options = voisinsZ(z).filter(([nx, ny]) => !estSecurisee(ckey(carteId, nx, ny)));
      pasV = options.length ? pick(options) : null;
    }
    if (!pasV) continue;
    if (pasV[0] === px && pasV[1] === py) continue; // il ne marche pas SUR toi : l'anneau s'en charge au contact
    // Les morts peuvent désormais s'EMPILER sur un même nœud : à l'écran un seul pion
    // porte le compte (2, 3…), plutôt que trois silhouettes superposées. On ne bloque
    // donc plus le pas sur une case déjà occupée — la horde se lit d'un chiffre.
    z.dir = regard(c, z.x, z.y, pasV[0], pasV[1]);
    z.x = pasV[0]; z.y = pasV[1];
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
  const graphe = estGraphe(carteId);
  const df = graphe ? champHops(carteId, x, y) : null; // distance en sauts sur le plan
  for (const z of zombiesSur(carteId)) {
    if (z.faitLeMort) continue;
    const dist = graphe ? (df.get(`${z.x},${z.y}`) ?? 99) : Math.abs(z.x - x) + Math.abs(z.y - y);
    if (dist > rayon || dist === 0) continue;
    z.dir = regard(CARTES[carteId], z.x, z.y, x, y);
    z.ag = 1; z.mx = x; z.my = y; z.sans = 0;
  }
}
