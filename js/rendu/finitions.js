// ============ Finitions du rendu : relief, lumière et couleur (validées au banc d'essai le 26 oct. 2026) ============
//   aoMurs        ombre douce au pied des murs, des deux côtés, sur une petite case et demie (pré-rendu dans les blocs)
//   ombreContact  ombre sous chaque meuble, voiture, caisse (pré-rendu)
//   solVivant     taches d'huile, fissures, papiers, herbes folles au pied des murs, fleurs dans l'herbe (pré-rendu)
//   lumiereFenetres  le jour entre par chaque fenêtre et se pose au sol en trapèze (chaque image, avant l'obscurité)
//   ombrePerso    ombre portée d'un personnage dehors, selon le soleil
//   bordsToit     rives sombres et liseré clair au bord d'un toit
//   etalonnage2   couleur : saturation, chaleur du lieu, ombres relevées (le jour seulement)
import { TS, TF as T, hash, rr, ellipse } from './outils.js';
import { K, FIN, MURS, MURS_IDS, SOLS, SOLS_IDS, FAMILLES } from '../carte/catalogue.js';

const styleDe = (E, i) => MURS_IDS[E.mur ? E.mur[i] : 1] || 'platre';
function murPlein(E, x, y) {
  if (x < 0 || y < 0 || x >= E.w || y >= E.h) return false;
  const i = y * E.w + x;
  if (E.code[i] !== K.MUR) return false;
  const M = MURS[styleDe(E, i)] || {};
  return !!M.epais && !M.bas && !M.vide;
}
const solLibre = (E, x, y) => x >= 0 && y >= 0 && x < E.w && y < E.h && E.code[y * E.w + x] !== K.MUR && E.code[y * E.w + x] !== K.VIDE;

// ---------- Occlusion au pied des murs ----------
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
export function aoMurs(c, E, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!solLibre(E, x, y)) continue;
    const px = x * T, py = y * T;
    for (const [dx, dy] of DIRS) {
      // mur collé (forte) ou à une case (faible, la suite du dégradé)
      let a0 = 0, a1 = 0;
      if (murPlein(E, x + dx, y + dy)) { a0 = 0.4; a1 = 0.1; }
      else if (solLibre(E, x + dx, y + dy) && murPlein(E, x + 2 * dx, y + 2 * dy)) { a0 = 0.1; a1 = 0; }
      if (!a0) continue;
      // dégradé depuis le côté du mur
      const sx = dx > 0 ? px + T : px, sy = dy > 0 ? py + T : py;
      const g = c.createLinearGradient(sx, sy, sx - dx * T, sy - dy * T);
      g.addColorStop(0, `rgba(0,0,0,${a0})`); g.addColorStop(1, `rgba(0,0,0,${a1})`);
      c.fillStyle = g; c.fillRect(px, py, T, T);
    }
  }
}

// ---------- Ombre de contact sous les objets ----------
export function ombreContact(c, R) {
  if (R.haut || (R.d && R.d.decor)) return;
  const x = R.x * TS, y = R.y * TS, w = R.w * TS, h = R.h * TS;
  c.fillStyle = 'rgba(0,0,0,0.13)'; rr(c, x - 5, y - 2, w + 11, h + 10, 9); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; rr(c, x - 1.5, y + 1, w + 4, h + 4, 5); c.fill();
}

// ---------- Sol vivant ----------
const DUR = new Set(['bitume', 'beton', 'paves', 'dalles', 'trottoir']);
export function solVivant(c, E, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!solLibre(E, x, y)) continue;
    const i = y * E.w + x, id = SOLS_IDS[E.sol[i]], fam = FAMILLES[E.sol[i]], S = SOLS[id] || {};
    const h1 = hash(x, y, 71), h2 = hash(x, y, 72), h3 = hash(x, y, 73);
    const cx = (x + 0.5) * T, cy = (y + 0.5) * T;
    const pres = DIRS.some(([dx, dy]) => murPlein(E, x + dx, y + dy) || (E.code[(y + dy) * E.w + x + dx] === K.MUR));
    if (S.ext && DUR.has(fam)) {
      if (h1 < 0.03) { c.fillStyle = `rgba(10,8,6,${0.16 + h2 * 0.12})`; ellipse(c, cx, cy, 5 + h2 * 9, 3 + h3 * 6); c.fill(); }   // tache d'huile
      else if (h1 < 0.055) {   // fissure
        c.strokeStyle = 'rgba(0,0,0,0.38)'; c.lineWidth = 0.9; c.beginPath(); let px = cx - T * 0.5, py = cy + (h2 - 0.5) * T;
        c.moveTo(px, py); for (let k = 0; k < 4; k++) { px += T * 0.32; py += (hash(x, y, 80 + k) - 0.5) * T * 0.5; c.lineTo(px, py); } c.stroke();
      }
      else if (h1 < 0.064) { c.save(); c.translate(cx, cy); c.rotate(h2 * 3); c.fillStyle = 'rgba(225,218,200,0.75)'; c.fillRect(-3, -2, 6, 4); c.restore(); }   // papier
      if (pres && h2 < 0.4) herbesFolles(c, cx, cy, h3);
    } else if (fam === 'herbe' || fam === 'herbe_seche') {
      if (h1 < 0.05) { const col = h2 < 0.5 ? 'rgba(240,236,220,0.8)' : 'rgba(232,196,70,0.8)'; for (let k = 0; k < 4; k++) { c.fillStyle = col; c.beginPath(); c.arc(cx + (hash(x, y, 90 + k) - 0.5) * T, cy + (hash(x, y, 95 + k) - 0.5) * T, 1.1, 0, 7); c.fill(); } }
      else if (h1 < 0.12) { c.fillStyle = 'rgba(20,30,10,0.14)'; ellipse(c, cx, cy, T * 0.7, T * 0.5); c.fill(); }
    } else if (fam === 'terre' || fam === 'gravier') {
      if (h1 < 0.12) for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(200,190,170,0.5)'; ellipse(c, cx + (hash(x, y, 60 + k) - 0.5) * T, cy + (hash(x, y, 65 + k) - 0.5) * T, 1.6, 1.2); c.fill(); }
    } else if (!S.ext) {
      if (h1 < 0.025) { c.fillStyle = 'rgba(0,0,0,0.1)'; ellipse(c, cx, cy, 4 + h2 * 6, 3 + h3 * 4); c.fill(); }   // trace, tache
      else if (h1 < 0.035) { c.fillStyle = 'rgba(255,250,235,0.06)'; ellipse(c, cx, cy, 5, 3); c.fill(); }
    }
  }
}
function herbesFolles(c, x, y, h) {
  c.strokeStyle = `rgba(${90 + h * 40 | 0},${120 + h * 30 | 0},50,0.75)`; c.lineWidth = 1; c.lineCap = 'round';
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.4, L = 3 + ((k * 7 + h * 10) % 4); c.beginPath(); c.moveTo(x + (k - 2) * 1.6, y + 3); c.lineTo(x + (k - 2) * 1.6 + Math.cos(a) * L, y + 3 + Math.sin(a) * L); c.stroke(); }
}

// ---------- Lumière du jour par les fenêtres ----------
const CIEL = { clair: 1, mistral: 1, couvert: 0.55, pluie: 0.4, brouillard: 0.4, orage: 0.3 };
function fenetres(niveau, E) {
  if (E._fen2) return E._fen2;
  const L = [];
  for (let y = 0; y < E.h; y++) for (let x = 0; x < E.w; x++) {
    if (E.code[y * E.w + x] !== K.FENETRE) continue;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
      const p = E.piece[ny * E.w + nx];
      if (p >= 0 && niveau.pieces[p] && !niveau.pieces[p].exterieur) L.push({ x, y, dx, dy });
    }
  }
  return (E._fen2 = L);
}
export function lumiereFenetres(ctx, S, niveau, E, vuCase, vx0, vy0, vx1, vy1) {
  const f = (S.jour ?? 1) * (CIEL[S.meteo] ?? 1);
  if (f < 0.08) return;
  const L = fenetres(niveau, E);
  if (!L.length) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const D = 1.5 * TS;
  for (const F of L) {
    const ux = (F.x + 0.5) / FIN, uy = (F.y + 0.5) / FIN;
    if (ux < vx0 - 2 || ux > vx1 + 2 || uy < vy0 - 2 || uy > vy1 + 2) continue;
    if (!vuCase(ux + F.dx / FIN, uy + F.dy / FIN)) continue;
    ctx.save(); ctx.translate((F.x + 0.5) * T, (F.y + 0.5) * T); ctx.rotate(Math.atan2(F.dy, F.dx));
    const g = ctx.createLinearGradient(T * 0.5, 0, D, 0);
    // la largeur exacte de la petite case : les cases d'une même fenêtre se rejoignent en une seule flaque de jour
    g.addColorStop(0, `rgba(255,230,185,${0.15 * f})`); g.addColorStop(0.6, `rgba(255,230,185,${0.07 * f})`); g.addColorStop(1, 'rgba(255,230,185,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(T * 0.5, -T * 0.5); ctx.lineTo(D, -T * 0.62); ctx.lineTo(D, T * 0.62); ctx.lineTo(T * 0.5, T * 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- Ombre portée d'un personnage (dehors, le jour) ----------
export function ombrePerso(ctx, x, y, sol, f) {
  const len = Math.min(3.2, Math.hypot(sol.dx, sol.dy)) * TS * 0.75;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(sol.dy, sol.dx));
  const g = ctx.createLinearGradient(0, 0, len + 8, 0); g.addColorStop(0, `rgba(0,0,0,${0.32 * f})`); g.addColorStop(1, `rgba(0,0,0,${0.08 * f})`);
  ctx.fillStyle = g; ellipse(ctx, len * 0.5, 0, len * 0.5 + 7, 8); ctx.fill();
  ctx.restore();
}

// ---------- Rives d'un toit (sprite, repère du sprite : petite case (x0, y0) en haut à gauche) ----------
export function bordsToit(c, masque, x0, y0) {
  const dans = new Set(masque.map(([x, y]) => x + ',' + y));
  for (const [x, y] of masque) {
    const px = (x - x0) * T, py = (y - y0) * T;
    if (!dans.has(x + ',' + (y - 1))) { c.fillStyle = 'rgba(255,230,200,0.22)'; c.fillRect(px, py + 2.5, T, 1.5); c.fillStyle = 'rgba(25,12,6,0.85)'; c.fillRect(px, py, T, 2.5); }
    if (!dans.has(x + ',' + (y + 1))) { c.fillStyle = 'rgba(25,12,6,0.85)'; c.fillRect(px, py + T - 3, T, 3); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(px, py + T - 8, T, 5); }
    if (!dans.has((x - 1) + ',' + y)) { c.fillStyle = 'rgba(25,12,6,0.85)'; c.fillRect(px, py, 2.5, T); c.fillStyle = 'rgba(255,230,200,0.16)'; c.fillRect(px + 2.5, py, 1.5, T); }
    if (!dans.has((x + 1) + ',' + y)) { c.fillStyle = 'rgba(25,12,6,0.85)'; c.fillRect(px + T - 3, py, 3, T); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(px + T - 8, py, 5, T); }
  }
}

// ---------- Couleur ----------
// Lumière de Provence : un voile chaud et clair (soft-light au-dessus du gris moyen = éclaircit), des ombres un peu
// relevées et bleutées (l'ombre du Midi n'est pas noire), le tout réglé par le jour ; la nuit n'est pas touchée.
const TEINTES = { sec: '255,214,150', vert: '232,236,190', ville: '255,222,176' };
export function etalonnage2(ctx, S, W, H) {
  const j = S.jour ?? 1;
  if (j < 0.05) return;
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(${TEINTES[S.biome] || TEINTES.ville},${0.3 * j})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(40,52,72,${0.16 * j})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
