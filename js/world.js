// ============ Accès au monde : cartes, cases, sol, fouilles ============
// Quatre échelles de cartes, toutes en cases :
//   'interieur' (pièces) → 'quartier' (rues) → 'ville' (Salon) → 'region' (pays salonais)
// Une case absente de carte.cases est infranchissable (mur, bâtiment plein, champ).
import { G } from './state.js';
import { CARTES } from './data/world.js';

export function carte(id) { return CARTES[id]; }
export function carteCourante() { return CARTES[G.world.carte]; }
export const ckey = (carteId, x, y) => `${carteId}:${x},${y}`;
export function keyCourante() { return ckey(G.world.carte, G.world.x, G.world.y); }

export function caseDef(carteId, x, y) {
  const c = CARTES[carteId];
  if (!c) return null;
  return c.cases[`${x},${y}`] || null;
}
export function caseCourante() { return caseDef(G.world.carte, G.world.x, G.world.y); }

// Une case est franchissable si elle existe et n'est pas un obstacle pur
export function franchissable(carteId, x, y) {
  const cd = caseDef(carteId, x, y);
  return !!cd && cd.t !== 'mur' && cd.t !== 'eau';
}

// ---------- Passages entre cases ----------
// Dehors, deux cases qui se touchent communiquent. DEDANS, deux pièces voisines sur la
// grille sont séparées par un mur : on circule par les couloirs, escaliers et portes.
// Exceptions par carte :
//   carte.ouvert: true        — plateau ouvert (supérette, hangar) : tout communique
//   carte.passages: [['x,y','x,y'], ...] — portes déclarées entre deux pièces précises
const CIRCULATION = new Set(['couloir', 'escalier', 'porte']);
export function passagePossible(carteId, x1, y1, x2, y2) {
  if (!franchissable(carteId, x2, y2)) return false;
  const c = CARTES[carteId];
  if (!c || c.echelle !== 'interieur') return true;
  const k1 = `${x1},${y1}`, k2 = `${x2},${y2}`;
  // murs déclarés : bloquent même la circulation (étages superposés sur la grille...)
  if ((c.murs || []).some(([p, q]) => (p === k1 && q === k2) || (p === k2 && q === k1))) return false;
  if (c.ouvert) return true;
  const a = caseDef(carteId, x1, y1), b = caseDef(carteId, x2, y2);
  if (!a || CIRCULATION.has(a.t) || CIRCULATION.has(b.t)) return true;
  return (c.passages || []).some(([p, q]) => (p === k1 && q === k2) || (p === k2 && q === k1));
}

// Niveau d'obscurité d'une case : 0 (éclairée), 1 (pénombre), 2 (noir total).
// Donnée : sombre: 1 | 2 — compat : sombre: true vaut 2.
export function niveauSombre(cd) {
  if (!cd || !cd.sombre) return 0;
  return cd.sombre === true ? 2 : cd.sombre;
}

// Nature de la liaison entre deux cases voisines (pour dessiner le plan) :
//   null     — mur : on ne passe pas
//   'ouvert' — on circule sans battant (même plateau, couloir qui continue)
//   'porte'  — un battant de porte sur le mur
// Un passage déclaré ['a','b','ouvert'] force une ouverture sans battant.
export function liaison(carteId, x1, y1, x2, y2) {
  if (!passagePossible(carteId, x1, y1, x2, y2)) return null;
  const c = CARTES[carteId];
  if (!c || c.echelle !== 'interieur' || c.ouvert) return 'ouvert';
  const k1 = `${x1},${y1}`, k2 = `${x2},${y2}`;
  const p = (c.passages || []).find(([a, b]) => (a === k1 && b === k2) || (a === k2 && b === k1));
  if (p) return p[2] === 'ouvert' ? 'ouvert' : 'porte';
  const a = caseDef(carteId, x1, y1), b = caseDef(carteId, x2, y2);
  if (a && b && CIRCULATION.has(a.t) && CIRCULATION.has(b.t)) return 'ouvert';
  return 'porte';
}

// ---------- Brouillard de guerre & ligne de vue ----------
export function decouvrir(carteId, x, y) {
  if (!G.world.decouverts[carteId]) G.world.decouverts[carteId] = [];
  const k = `${x},${y}`;
  if (!G.world.decouverts[carteId].includes(k)) G.world.decouverts[carteId].push(k);
}
export function estDecouverte(carteId, x, y) {
  return !!(G.world.decouverts[carteId] && G.world.decouverts[carteId].includes(`${x},${y}`));
}

// La VUE passe-t-elle d'une case à sa voisine ? Dehors : tout ce qui existe se
// voit (les bâtiments pleins — cases absentes — bouchent). Dedans : le regard
// circule par les ouvertures libres, mais un battant de porte fermé l'arrête.
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function vuePasse(carteId, x1, y1, x2, y2) {
  const c = CARTES[carteId];
  if (!c) return false;
  if (c.echelle !== 'interieur') return !!caseDef(carteId, x2, y2);
  return liaison(carteId, x1, y1, x2, y2) === 'ouvert';
}

// Toutes les cases actuellement DANS TA VUE depuis (px,py) :
// une nappe courte autour de toi, plus de longs rayons droits — on voit
// ce qui arrive au bout d'un couloir ou d'une rue, de loin.
export function casesVisibles(carteId, px, py, opts = {}) {
  const vis = new Set([`${px},${py}`]);
  const c = CARTES[carteId];
  if (!c) return vis;
  const nappe = opts.nappe ?? 4;
  const rayon = opts.rayon ?? (c.echelle === 'interieur' ? 8 : 9);
  let front = [[px, py]];
  for (let d = 0; d < nappe; d++) {
    const next = [];
    for (const [x, y] of front) {
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
        if (vis.has(k) || !vuePasse(carteId, x, y, nx, ny)) continue;
        vis.add(k);
        next.push([nx, ny]);
      }
    }
    front = next;
  }
  for (const [dx, dy] of DIRS) {
    let x = px, y = py;
    for (let d = 0; d < rayon; d++) {
      const nx = x + dx, ny = y + dy;
      if (!vuePasse(carteId, x, y, nx, ny)) break;
      vis.add(`${nx},${ny}`);
      x = nx; y = ny;
    }
  }
  return vis;
}

// On découvre tout ce qu'on VOIT (la mémoire de la carte), plus les cases
// adjacentes (on sait qu'un mur ou une porte est là, même sans voir derrière).
export function decouvrirAutour(carteId, x, y) {
  for (const k of casesVisibles(carteId, x, y)) {
    const [vx, vy] = k.split(',').map(Number);
    decouvrir(carteId, vx, vy);
  }
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (caseDef(carteId, x + dx, y + dy)) decouvrir(carteId, x + dx, y + dy);
    }
  }
}

// ---------- Objets au sol ----------
// Tout ce qui traîne sur une case : trouvailles de fouille, armes jetées en combat...
// cache:true = pas encore repéré (révélé par la prochaine fouille de la case).
export function solDe(k) {
  if (!G.world.sol[k]) G.world.sol[k] = [];
  return G.world.sol[k];
}
export function deposerAuSol(k, entry) {
  const sol = solDe(k);
  if (entry.dur === undefined && !entry.cache) {
    const ex = sol.find(e => e.id === entry.id && e.dur === undefined && !e.cache);
    if (ex) { ex.qty += entry.qty || 1; return; }
  }
  sol.push({ qty: 1, ...entry });
}
export function solVisible(k) { return solDe(k).filter(e => !e.cache); }
export function revelerSol(k) {
  let n = 0;
  for (const e of solDe(k)) if (e.cache) { e.cache = false; n += e.qty || 1; }
  return n;
}

// ---------- Fouilles ----------
export function fouilleEtat(k) {
  if (!G.world.fouilles[k]) G.world.fouilles[k] = { n: 0, pris: {} };
  return G.world.fouilles[k];
}
// Une case intérieure fouillée à fond et nettoyée devient sûre. Une rue, jamais.
export function estSecurisee(k) { return !!G.world.securisees[k]; }
export function securiser(k) { G.world.securisees[k] = true; }

// ---------- Divers ----------
export function zombiesPoolCourant() {
  const cd = caseCourante();
  const c = carteCourante();
  return (cd && cd.zombies) || (c && c.zombiesPool) || ['errant'];
}
// Toutes les cases fouillables d'un intérieur sont-elles sécurisées ?
export function interieurSecurise(carteId) {
  const c = CARTES[carteId];
  if (!c || c.echelle !== 'interieur') return false;
  return Object.entries(c.cases).every(([pos, cd]) =>
    !cd.fouille ? true : estSecurisee(`${carteId}:${pos}`));
}
