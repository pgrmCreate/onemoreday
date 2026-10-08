// ============ Abords — agrandir un lieu autour de son plan d'origine (×4 par côté) ============
// agrandirDef(def) → nouvelle définition ASCII : le plan d'origine (le « cœur ») est posé au centre d'une carte quatre
// fois plus large et plus haute ; autour, des abords générés selon le MILIEU du lieu :
//   centre   vieille ville : ruelles pavées, maisons mitoyennes, placettes, platanes
//   ville    rues, immeubles, pavillons, parkings, jardins
//   zone     zone commerciale / industrielle : larges avenues, hangars, grands parkings, friches
//   village  rues étroites, maisons à jardin, puis oliveraies et champs
//   campagne chemins de terre, garrigue, champs, oliveraies, un mas ou deux
// Les sorties du cœur deviennent des rues ; les nouvelles sorties sont aux bords de la grande carte.
// Tous les étages sont décalés d'autant (les escaliers restent alignés). Déterministe (graine = id du lieu).
// La place sert à CONSTRUIRE : il y a toujours de la rue, de la friche, des jardins.
import { seedRng } from '../core/rng.js';
import { LIEUX_GEO } from '../data/lieux.js';

export const ABORDS_VERSION = 1;
const SANS = new Set(['cimetiere']);         // le cimetière du début reste compact
const FACTEUR = 4, MAX_W = 300, MAX_H = 200;

const CENTRE = new Set(['hotel_poste', 'place_crousillat', 'tour_horloge', 'casino_shop', 'pharmacie_carnot', 'hotel_de_ville',
  'nostradamus', 'saint_michel', 'emperi', 'place_de_gaulle', 'saint_laurent']);
const ZONE = new Set(['weldom', 'intermarche', 'leclerc', 'pompiers', 'gendarmerie', 'aerodrome', 'ba701', 'miramas', 'saint_chamas']);
const CAMPAGNE = new Set(['jean_moulin', 'la_barben', 'vernegues', 'cales']);
export function milieuDe(id) {
  if (CENTRE.has(id)) return 'centre';
  if (ZONE.has(id)) return 'zone';
  if (CAMPAGNE.has(id)) return 'campagne';
  const g = LIEUX_GEO[id];
  if (g && g.echelle === 'region') return 'village';
  return 'ville';
}

// Réglages par milieu : S = pas entre deux rues, RW = largeur de chaussée, trottoir, revêtement.
const MILIEUX = {
  centre:   { S: 17, RW: 3, trottoir: true, route: 'β', fond: 'β' },
  ville:    { S: 26, RW: 4, trottoir: true, route: ',', fond: '"' },
  zone:     { S: 34, RW: 6, trottoir: true, route: ',', fond: 'δ' },
  village:  { S: 22, RW: 3, trottoir: false, route: ',', fond: '"' },
  campagne: { S: 0,  RW: 3, trottoir: false, route: ':', fond: 'δ' },
};

// Caractères générés (légende ajoutée à celle du lieu) — lettres grecques, jamais utilisées par les plans écrits à la main.
const LEG = {
  'α': { comme: ',', sol: 'trottoir' }, 'β': { comme: ',', sol: 'paves' }, 'γ': { comme: '"', sol: 'terre' },
  'δ': { comme: '"', sol: 'herbe_seche' }, 'ε': { comme: ',', sol: 'dalles' }, 'τ': { comme: ',', sol: 'beton' },
  'ω': { comme: '.', sol: 'tomettes' }, 'ψ': { comme: '.', sol: 'parquet' }, 'χ': { comme: '.', sol: 'carrelage' },
  'ϕ': { comme: '.', sol: 'beton' }, 'ϑ': { comme: '.', sol: 'lino' },
  'ζ': { prop: 'platane', nom: 'le platane' }, 'η': { prop: 'pin', nom: 'le pin' }, 'θ': { prop: 'olivier', nom: 'l\'olivier' },
  'ι': { prop: 'cypres', nom: 'le cyprès' }, 'κ': { prop: 'buisson', nom: 'le buisson' }, 'λ': { prop: 'lampadaire', nom: 'le lampadaire' },
  'μ': { prop: 'benne', nom: 'la benne' }, 'ν': { prop: 'haie', nom: 'la haie' }, 'ξ': { prop: 'camionnette', nom: 'la camionnette' },
  'π': { prop: 'poteau', nom: 'le poteau' }, 'ρ': { prop: 'fut', nom: 'le fût' }, 'σ': { prop: 'palette', nom: 'la palette' },
  'ο': { prop: 'fontaine', nom: 'la fontaine' }, 'υ': { prop: 'borne', nom: 'la borne' },
  'Ϙ': { prop: 'figuier', nom: 'le figuier' }, 'Ϛ': { prop: 'amandier', nom: 'l\'amandier' },
  'Ϝ': { prop: 'roncier', nom: 'le roncier' }, 'Ϟ': { prop: 'cannier', nom: 'les cannes de Provence' },
  'ϗ': { porte: true, etat: 'verrouillee', nom: 'la porte fermée à clé' },        // forçable au pied-de-biche
  'ϖ': { comme: '.', sol: 'parquet', bloque: true },                                // intérieur d'une maison close : on ne voit que le toit
  'ϙ': { comme: '"', sol: 'herbe', bloque: true },                                  // fourré impénétrable (poche sans accès)
  'ϛ': { prop: 'voiture', nom: 'la voiture (déjà fouillée)', conteneur: false },     // la plupart des voitures ont été vidées
  // modèles de voitures (4 ter) : majuscule = encore à fouiller, minuscule = déjà vidée
  'Ϣ': { prop: 'citadine', nom: 'la citadine' }, 'ϣ': { prop: 'citadine', nom: 'la citadine (déjà fouillée)', conteneur: false },
  'Ϥ': { prop: 'break', nom: 'le break' }, 'ϥ': { prop: 'break', nom: 'le break (déjà fouillé)', conteneur: false },
  'Ϧ': { prop: 'suv', nom: 'le 4 × 4' }, 'ϧ': { prop: 'suv', nom: 'le 4 × 4 (déjà fouillé)', conteneur: false },
  'Ϩ': { prop: 'pickup', nom: 'le pick-up' }, 'ϩ': { prop: 'pickup', nom: 'le pick-up (déjà fouillé)', conteneur: false },
  'Ϫ': { prop: 'voiture_police', nom: 'la voiture de gendarmerie' }, 'ϫ': { prop: 'voiture_police', nom: 'la voiture de gendarmerie (déjà fouillée)', conteneur: false },
  'Ϭ': { prop: 'camping_car', nom: 'le camping-car' },
  'Ϯ': { prop: 'taxi', nom: 'le taxi' }, 'ϯ': { prop: 'taxi', nom: 'le taxi (déjà fouillé)', conteneur: false },
  'Ͱ': { prop: 'voiture_pompiers', nom: 'la voiture des pompiers' }, 'ͱ': { prop: 'voiture_pompiers', nom: 'la voiture des pompiers (déjà fouillée)', conteneur: false },
  'Ͳ': { prop: 'voiture_calcinee', nom: 'la carcasse calcinée', conteneur: false },
  'ͳ': { prop: 'fourgon_postal', nom: 'le fourgon postal' },
  'ϡ': { prop: 'table', nom: 'la table', conteneur: false },
  'ϟ': { prop: 'palette', nom: 'la palette vide', conteneur: false },
};
// Part des voitures générées qu'on peut encore fouiller.
const VOITURES_FOUILLABLES = 0.2;
// Modèles des voitures garées (poids par milieu) : [caractère à fouiller, caractère déjà vidé, poids]. 'v'/'ϛ' = berline.
const MODELES_VOITURES = {
  centre:   [['v', 'ϛ', 34], ['Ϣ', 'ϣ', 32], ['Ϥ', 'ϥ', 12], ['Ϧ', 'ϧ', 10], ['Ϩ', 'ϩ', 3], ['Ϫ', 'ϫ', 6], ['Ϯ', 'ϯ', 6], ['Ͱ', 'ͱ', 2]],
  ville:    [['v', 'ϛ', 32], ['Ϣ', 'ϣ', 28], ['Ϥ', 'ϥ', 14], ['Ϧ', 'ϧ', 12], ['Ϩ', 'ϩ', 7], ['Ϫ', 'ϫ', 5], ['Ϯ', 'ϯ', 4], ['Ͱ', 'ͱ', 2]],
  zone:     [['v', 'ϛ', 30], ['Ϣ', 'ϣ', 14], ['Ϥ', 'ϥ', 14], ['Ϧ', 'ϧ', 12], ['Ϩ', 'ϩ', 22], ['Ϫ', 'ϫ', 6], ['Ϯ', 'ϯ', 2], ['Ͱ', 'ͱ', 2]],
  village:  [['v', 'ϛ', 26], ['Ϣ', 'ϣ', 24], ['Ϥ', 'ϥ', 18], ['Ϧ', 'ϧ', 12], ['Ϩ', 'ϩ', 20], ['Ϯ', 'ϯ', 1], ['Ͱ', 'ͱ', 1]],
  campagne: [['v', 'ϛ', 24], ['Ϣ', 'ϣ', 16], ['Ϥ', 'ϥ', 18], ['Ϧ', 'ϧ', 16], ['Ϩ', 'ϩ', 26], ['Ͱ', 'ͱ', 1]],
};
// Part des camionnettes qui sont un camping-car, puis un fourgon postal ; part des voitures déjà vidées qui ont brûlé.
const CAMPING_CAR = { centre: 0.15, ville: 0.25, zone: 0.2, village: 0.35, campagne: 0.45 };
const FOURGON_POSTAL = { centre: 0.22, ville: 0.2, zone: 0.12, village: 0.15, campagne: 0.08 };
const CALCINEES = { centre: 0.14, ville: 0.12, zone: 0.12, village: 0.06, campagne: 0.05 };
// Ce qu'on peut traverser à pied (pour la passe d'accessibilité).
const MARCHE = new Set([',', '"', ':', '.', ';', '%', 'E', '+', '/', 'ϗ', '@', 'Z', 'α', 'β', 'γ', 'δ', 'ε', 'τ', 'ω', 'ψ', 'χ', 'ϕ', 'ϑ']);
const FOND_LIBRE = new Set(['"', 'δ', 'γ', 'β', ',', ':']);

export function agrandirDef(def) {
  if (!def || def.format || def.abords === false || !def.id || def.id.startsWith('_') || SANS.has(def.id)) return def;
  const etages = Array.isArray(def.etages) ? def.etages : [];
  if (!etages.length) return def;
  const nE = (ed) => (ed.plan || []).reduce((s, l) => s + (String(l).match(/E/g) || []).length, 0);
  let g = 0; etages.forEach((ed, k) => { if (nE(ed) > nE(etages[g])) g = k; });
  if (!nE(etages[g])) return def;
  for (const c of Object.keys(LEG)) if (def.legende && def.legende[c]) { console.warn(`[abords] ${def.id} : caractère « ${c} » déjà pris`); return def; }

  const milieu = def.milieu || milieuDe(def.id), M = MILIEUX[milieu];
  const r = seedRng(`abords:${ABORDS_VERSION}:${def.id}`);
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const coeur = etages[g].plan.map(String);
  const Hg = coeur.length, Wg = coeur.reduce((m, l) => Math.max(m, l.length), 0);
  const Wmax = Math.max(...etages.map(ed => (ed.plan || []).reduce((m, l) => Math.max(m, String(l).length), 0)));
  const Hmax = Math.max(...etages.map(ed => (ed.plan || []).length));
  const TW = Math.max(Wmax + 40, Math.min(MAX_W, Wg * FACTEUR)), TH = Math.max(Hmax + 30, Math.min(MAX_H, Hg * FACTEUR));
  const ox = Math.floor((TW - Wg) / 2), oy = Math.floor((TH - Hg) / 2);

  // ---------- grille ----------
  const G = []; for (let y = 0; y < TH; y++) G.push(new Array(TW).fill(M.fond));
  const occ = new Uint8Array(TW * TH);            // 1 cœur, 2 route, 3 trottoir, 4 bâti, 5 réservé (jardin, parking…)
  const dans = (x, y) => x >= 0 && y >= 0 && x < TW && y < TH;
  const set = (x, y, c, o) => { if (!dans(x, y)) return; G[y][x] = c; if (o != null) occ[y * TW + x] = o; };
  const get = (x, y) => (dans(x, y) ? G[y][x] : null);
  const oc = (x, y) => (dans(x, y) ? occ[y * TW + x] : 255);
  const rect = (x, y, w, h, c, o) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c, o); };

  // ---------- 1. le cœur (sorties → rue ; vide du bord → terrain) ----------
  const routeCoeur = milieu === 'campagne' ? ':' : ',';
  const vide = new Uint8Array(Wg * Hg);
  const file = [];
  for (let y = 0; y < Hg; y++) for (let x = 0; x < Wg; x++) if ((x === 0 || y === 0 || x === Wg - 1 || y === Hg - 1) && (coeur[y][x] || ' ') === ' ') { vide[y * Wg + x] = 1; file.push([x, y]); }
  while (file.length) {
    const [x, y] = file.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wg || ny >= Hg || vide[ny * Wg + nx]) continue;
      if ((coeur[ny][nx] || ' ') === ' ') { vide[ny * Wg + nx] = 1; file.push([nx, ny]); }
    }
  }
  for (let y = 0; y < Hg; y++) for (let x = 0; x < Wg; x++) {
    let c = coeur[y][x] || ' ';
    if (c === 'E') c = routeCoeur;
    else if (vide[y * Wg + x]) c = M.fond;
    set(ox + x, oy + y, c, 1);
  }

  // ---------- 2. rocade autour du cœur + quadrillage de rues ----------
  const T = M.trottoir ? 1 : 0, R = M.RW + 2 * T;
  const rx0 = ox - R, rx1 = ox + Wg, ry0 = oy - R, ry1 = oy + Hg;    // débuts des bandes de la rocade
  const bandes = (debut, fin, a, b) => { // bandes de route (début de bande) de part et d'autre de la rocade
    const out = [a, b];
    if (!M.S) return out;
    for (let p = a - M.S - R; p >= 6; p -= M.S + R) out.push(p);
    for (let p = b + R + M.S; p <= fin - R - 6; p += M.S + R) out.push(p);
    return out.sort((u, v) => u - v);
  };
  const VX = bandes(0, TW, rx0, rx1), VY = bandes(0, TH, ry0, ry1);
  const rocade = (x, y) => x >= rx0 && x < rx1 + R && y >= ry0 && y < ry1 + R;
  const bande = (p0, horiz, campagneOK) => {
    for (let k = 0; k < R; k++) {
      const c = T && (k === 0 || k === R - 1) ? 'α' : M.route, o = c === 'α' ? 3 : 2;
      const lim = horiz ? TW : TH;
      for (let s = 0; s < lim; s++) {
        const x = horiz ? s : p0 + k, y = horiz ? p0 + k : s;
        if (oc(x, y) === 1) continue;
        if (o === 3 && oc(x, y) === 2) continue;          // une chaussée n'est jamais recouverte par un trottoir
        set(x, y, c, o);
      }
    }
  };
  if (milieu !== 'campagne') {
    for (const p of VX) bande(p, false);
    for (const p of VY) bande(p, true);
  } else {
    // campagne : un chemin autour du cœur, puis des pistes qui serpentent jusqu'aux bords
    for (let y = ry0; y < ry1 + R; y++) for (let x = rx0; x < rx1 + R; x++) if (oc(x, y) !== 1 && dans(x, y)) set(x, y, ':', 2);
    const piste = (x, y, dx, dy) => {
      let n = 0;
      while (dans(x, y) && n++ < 600) {
        for (let k = -1; k <= 1; k++) { const px = dy ? x + k : x, py = dx ? y + k : y; if (oc(px, py) !== 1) set(px, py, ':', 2); }
        x += dx; y += dy;
        if (r() < 0.18) { if (dx) y += r() < 0.5 ? -1 : 1; else x += r() < 0.5 ? -1 : 1; }
      }
    };
    piste(ox + (Wg >> 1), ry0, 0, -1); piste(ox + (Wg >> 1), ry1 + R - 1, 0, 1);
    piste(rx0, oy + (Hg >> 1), -1, 0); piste(rx1 + R - 1, oy + (Hg >> 1), 1, 0);
  }

  // ---------- 3. îlots ----------
  const portes = [];
  const ilots = [];
  if (milieu !== 'campagne') {
    const xs = [[0, VX[0] - 1]], ys = [[0, VY[0] - 1]];
    for (let k = 0; k < VX.length; k++) xs.push([VX[k] + R, k + 1 < VX.length ? VX[k + 1] - 1 : TW - 1]);
    for (let k = 0; k < VY.length; k++) ys.push([VY[k] + R, k + 1 < VY.length ? VY[k + 1] - 1 : TH - 1]);
    for (const [xa, xb] of xs) for (const [ya, yb] of ys) {
      const w = xb - xa + 1, h = yb - ya + 1;
      if (w < 4 || h < 4) continue;
      if (xa >= rx0 + R && xb < rx1 && ya >= ry0 + R && yb < ry1) continue;    // c'est le cœur
      if (rocade(xa, ya) && rocade(xb, yb)) continue;
      ilots.push({ x: xa, y: ya, w, h, d: Math.hypot(xa + w / 2 - (ox + Wg / 2), ya + h / 2 - (oy + Hg / 2)) });
    }
  } else {
    // campagne : des parcelles posées au hasard sur la garrigue
    const nb = Math.round(TW * TH / 900);
    for (let k = 0; k < nb; k++) {
      const w = ri(10, 26), h = ri(8, 18), x = ri(2, TW - w - 3), y = ri(2, TH - h - 3);
      let libre = true; for (let yy = y - 1; yy <= y + h && libre; yy++) for (let xx = x - 1; xx <= x + w && libre; xx++) if (oc(xx, yy)) libre = false;
      if (libre) ilots.push({ x, y, w, h, d: 0 });
    }
  }

  // ---------- bâtiments ----------
  const solMaison = { centre: 'ω', village: 'ω', ville: 'ψ', zone: 'ϕ', campagne: 'ω' }[milieu];
  // Une maison : murs, fenêtres, une porte côté rue ; habitée (meubles, fouillable), fermée à clé, ou sans porte (on ne voit que le toit).
  function maison(x, y, w, h, cote, o = {}) {
    if (w < 5 || h < 5) return;
    rect(x, y, w, h, o.sol || solMaison, 4);
    for (let xx = x; xx < x + w; xx++) { set(xx, y, '#', 4); set(xx, y + h - 1, '#', 4); }
    for (let yy = y; yy < y + h; yy++) { set(x, yy, '#', 4); set(x + w - 1, yy, '#', 4); }
    // fenêtres sur les façades qui donnent dehors
    const fen = (xx, yy) => { const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const o2 = oc(xx + dx, yy + dy); return o2 === 2 || o2 === 3 || o2 === 5 || o2 === 0; }); if (n) set(xx, yy, '|', 4); };
    for (let xx = x + 2; xx < x + w - 2; xx += 3) { fen(xx, y); fen(xx, y + h - 1); }
    for (let yy = y + 2; yy < y + h - 2; yy += 3) { fen(x, yy); fen(x + w - 1, yy); }
    const t = o.type || (r() < 0.7 ? 'close' : r() < 0.6 ? 'verrou' : 'ouverte');
    if (t === 'close') { for (let yy = y + 1; yy < y + h - 1; yy++) for (let xx = x + 1; xx < x + w - 1; xx++) set(xx, yy, 'ϖ', 4); return; }
    // porte côté rue — jamais en face de la cloison du milieu (la porte s'ouvrirait sur un mur)
    const sepPrevue = !o.vide && w - 2 >= 10 ? x + 1 + ((w - 2) >> 1) : null;
    const large = o.large || 1;
    const pxLibre = () => { for (let k = 0; k < 8; k++) { const v = x + ri(1, w - 2); if (sepPrevue == null || v + large - 1 < sepPrevue || v > sepPrevue) return v; } return sepPrevue - large >= x + 1 ? sepPrevue - large : sepPrevue + 1; };
    let px, py;
    if (cote === 'n') { px = pxLibre(); py = y; } else if (cote === 's') { px = pxLibre(); py = y + h - 1; }
    else if (cote === 'o') { px = x; py = y + ri(1, h - 2); } else { px = x + w - 1; py = y + ri(1, h - 2); }
    for (let k = 0; k < large; k++) {
      const qx = cote === 'n' || cote === 's' ? Math.min(px + k, x + w - 2) : px, qy = cote === 'n' || cote === 's' ? py : Math.min(py + k, y + h - 2);
      set(qx, qy, t === 'verrou' ? 'ϗ' : o.ouverte ? '/' : '+', 4); portes.push([qx, qy]);
    }
    if (o.vide) return;
    // une cloison au milieu des grandes maisons
    const ix = x + 1, iy = y + 1, iw = w - 2, ih = h - 2;
    let sep = null;
    if (iw >= 10) { sep = ix + (iw >> 1); for (let yy = y; yy < y + h; yy++) set(sep, yy, '#', 4); set(sep, iy + ri(0, ih - 1), '+', 4); }
    // meubles (le long des murs, jamais devant une porte)
    const libre = (xx, yy) => { const c = get(xx, yy); if (c !== solMaison && c !== (o.sol || solMaison)) return false; return ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const v = get(xx + dx, yy + dy); return v === '+' || v === 'ϗ' || v === '/'; }); };
    const poser = (xx, yy, ww, hh, c) => { for (let a = 0; a < hh; a++) for (let b = 0; b < ww; b++) if (!libre(xx + b, yy + a)) return false; for (let a = 0; a < hh; a++) for (let b = 0; b < ww; b++) set(xx + b, yy + a, c, 4); return true; };
    const zone2 = sep ? [[ix, sep - ix], [sep + 1, ix + iw - sep - 1]] : [[ix, iw]];
    zone2.forEach(([zx, zw], k) => {
      if (zw < 3) return;
      if (k === 0) { poser(zx, iy, Math.min(3, zw), 1, 'k') || poser(zx, iy + ih - 1, Math.min(3, zw), 1, 'k'); if (r() < 0.7) poser(zx + (zw >> 1) - 1, iy + (ih >> 1), 2, 1, 'ϡ'); if (r() < 0.4) poser(zx + zw - 1, iy, 1, 1, 'f'); }
      else { if (ih >= 4 && zw >= 3 && r() < 0.8) poser(zx, iy, 2, 3, 'b'); if (r() < 0.7) poser(zx + zw - 2, iy + ih - 1, 2, 1, 'a'); }
    });
  }
  function hangar(x, y, w, h) {
    maison(x, y, w, h, ['n', 's', 'o', 'e'][ri(0, 3)], { type: r() < 0.5 ? 'ouverte' : 'verrou', sol: 'ϕ', vide: true, large: 3, ouverte: true });
    // rayonnages et palettes à l'intérieur
    for (let yy = y + 3; yy < y + h - 3; yy += 4) for (let xx = x + 3; xx < x + w - 5; xx += 7) if (r() < 0.3) { for (let k = 0; k < 4; k++) if (get(xx + k, yy) === 'ϕ') set(xx + k, yy, 's', 4); }
    for (let k = 0; k < 4; k++) { const xx = ri(x + 2, x + w - 3), yy = ri(y + 2, y + h - 3); if (get(xx, yy) === 'ϕ') set(xx, yy, r() < 0.5 ? 'σ' : 'ϟ', 4); }
  }
  function parking(x, y, w, h) {
    rect(x, y, w, h, ',', 5);
    for (let yy = y + 1; yy + 2 <= y + h - 1; yy += 5) for (let xx = x + 1; xx + 3 <= x + w - 1; xx += 4) if (r() < 0.45) rect(xx, yy, 3, 2, r() < VOITURES_FOUILLABLES ? 'v' : 'ϛ', 5);
    for (let k = 0; k < 2; k++) { const xx = ri(x, x + w - 2), yy = ri(y, y + h - 1); if (get(xx, yy) === ',' && get(xx + 1, yy) === ',') { set(xx, yy, 'μ', 5); set(xx + 1, yy, 'μ', 5); } }
  }
  function jardin(x, y, w, h, arbres = ['θ', 'ζ', 'κ']) {
    rect(x, y, w, h, '"', 5);
    const n = Math.max(1, Math.round(w * h / 22));
    for (let k = 0; k < n; k++) set(ri(x, x + w - 1), ri(y, y + h - 1), arbres[ri(0, arbres.length - 1)], 5);
    if (r() < 0.3) set(ri(x, x + w - 1), ri(y, y + h - 1), 'n', 5);
  }
  function friche(x, y, w, h) {
    rect(x, y, w, h, r() < 0.5 ? 'δ' : 'γ', 5);
    const n = Math.max(1, Math.round(w * h / 30));
    for (let k = 0; k < n; k++) set(ri(x, x + w - 1), ri(y, y + h - 1), ['κ', 'x', ';', 'ρ', 'η'][ri(0, 4)], 5);
  }
  function champ(x, y, w, h) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, (yy - y) % 3 === 2 ? 'δ' : 'γ', 5);
  }
  function oliveraie(x, y, w, h) {
    rect(x, y, w, h, 'δ', 5);
    for (let yy = y + 1; yy < y + h - 1; yy += 3) for (let xx = x + 1; xx < x + w - 1; xx += 3) if (r() < 0.85) set(xx, yy, 'θ', 5);
  }
  function garrigue(x, y, w, h) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (!oc(xx, yy)) { set(xx, yy, r() < 0.1 ? 'γ' : 'δ'); if (r() < 0.05) set(xx, yy, r() < 0.65 ? 'κ' : 'η'); }
  }
  // Rangée de maisons le long d'un côté de l'îlot (mitoyennes en centre ancien, avec jardins au village).
  function rangee(x, y, w, prof, cote, mitoyen) {
    let xx = x, n = 0;
    while (xx < x + w - 4) {
      const lw = Math.min(x + w - xx, ri(mitoyen ? 6 : 7, mitoyen ? 10 : 11));
      if (lw < 5) break;
      const hh = Math.min(prof, ri(7, 10));
      maison(xx, cote === 'n' ? y : y + prof - hh, lw, hh, cote);
      // mitoyennes : elles partagent un mur, avec une ruelle toutes les trois maisons (on rejoint les cours)
      xx += lw + (mitoyen ? (++n % 3 === 0 ? 2 : -1) : ri(2, 4));
    }
  }
  function remplir(I) {
    const { x, y, w, h } = I;
    const pres = I.d < Math.max(Wg, Hg) * 0.9;
    const rue = (xa, ya, xb, yb) => { for (let yy = ya; yy <= yb; yy++) for (let xx = xa; xx <= xb; xx++) { const o2 = oc(xx, yy); if (o2 === 2 || o2 === 3) return true; } return false; };
    const ruN = rue(x, y - 1, x + w - 1, y - 1), ruS = rue(x, y + h, x + w - 1, y + h);
    // une rangée de maisons sur chaque côté qui donne sur une rue (sinon : jardin, champ…)
    const rangees = (prof, mitoyen) => {
      if (ruN) rangee(x, y, w, Math.min(prof, ruS ? Math.floor(h / 2) : h), 'n', mitoyen);
      if (ruS && h >= (ruN ? 2 * 5 + 2 : 5)) { const p = Math.min(prof, ruN ? h - Math.floor(h / 2) - 2 : h); rangee(x, y + h - p, w, p, 's', mitoyen); }
      return ruN || ruS;
    };
    if (milieu === 'centre') {
      if (r() < 0.12 && w >= 10 && h >= 10) { rect(x, y, w, h, 'ε', 5); set(x + (w >> 1), y + (h >> 1), 'ο', 5); set(x + (w >> 1) + 1, y + (h >> 1), 'ο', 5); set(x + (w >> 1), y + (h >> 1) + 1, 'ο', 5); set(x + (w >> 1) + 1, y + (h >> 1) + 1, 'ο', 5); for (const [a, b] of [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]]) set(x + a, y + b, 'ζ', 5); return; }
      jardin(x, y, w, h, ['ζ', 'κ']);
      rangees(10, true);
      return;
    }
    if (milieu === 'ville') {
      const t = r();
      if (t < 0.35 && w >= 14 && h >= 12) { jardin(x, y, w, h); maison(x + 2, y + 2, Math.min(w - 4, ri(14, 22)), Math.min(h - 4, ri(10, 14)), 'n', { sol: 'ϑ' }); return; }
      if (t < 0.55) { jardin(x, y, w, h); rangees(10, false); return; }
      if (t < 0.75) { parking(x, y, w, h); return; }
      if (t < 0.88) { jardin(x, y, w, h); return; }
      friche(x, y, w, h); return;
    }
    if (milieu === 'zone') {
      const t = r();
      if (t < 0.5 && w >= 14 && h >= 12) { friche(x, y, w, h); hangar(x + 2, y + 2, w - 4, h - 4); return; }
      if (t < 0.85) { parking(x, y, w, h); return; }
      friche(x, y, w, h); return;
    }
    if (milieu === 'village') {
      if (pres || r() < 0.4) { jardin(x, y, w, h, ['θ', 'ι', 'κ']); rangees(9, r() < 0.4); return; }
      if (r() < 0.5) { oliveraie(x, y, w, h); return; }
      champ(x, y, w, h); return;
    }
    // campagne : un mas, un champ, une oliveraie
    const t = r();
    if (t < 0.18 && w >= 12 && h >= 10) { jardin(x, y, w, h, ['θ', 'ι']); maison(x + 2, y + 2, Math.min(w - 4, 11), Math.min(h - 4, 8), 's'); return; }
    if (t < 0.6) { champ(x, y, w, h); return; }
    oliveraie(x, y, w, h);
  }
  if (milieu === 'campagne') garrigue(0, 0, TW, TH);
  ilots.sort((a, b) => a.d - b.d).forEach(remplir);

  // ---------- 4. mobilier urbain, arbres, voitures ----------
  const devantPorte = (x, y) => portes.some(([px, py]) => Math.abs(px - x) + Math.abs(py - y) <= 1);
  if (M.trottoir) {
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (oc(x, y) !== 3 || devantPorte(x, y)) continue;
      const k = (x * 7 + y * 13) % 11;
      if (k === 0) set(x, y, 'λ', 3);
      else if ((milieu === 'centre' || milieu === 'ville') && k === 5 && r() < 0.6) set(x, y, 'ζ', 3);
      else if (k === 8 && r() < 0.08) set(x, y, 'o', 3);
    }
  }
  // voitures abandonnées sur les chaussées horizontales
  const densite = { centre: 0.025, ville: 0.05, zone: 0.04, village: 0.03, campagne: 0.01 }[milieu];
  for (let y = 0; y < TH - 1; y++) for (let x = 0; x < TW - 3; x++) {
    if (r() > densite * 0.12) continue;
    let ok = true;
    for (let a = 0; a < 2 && ok; a++) for (let b = -1; b < 4 && ok; b++) if (oc(x + b, y + a) !== 2 || get(x + b, y + a) !== M.route) ok = false;
    if (ok) rect(x, y, 3, 2, r() < 0.15 ? 'ξ' : r() < VOITURES_FOUILLABLES ? 'v' : 'ϛ', 2), x += 4;
  }
  for (let k = 0; k < Math.round(TW * TH / 1500); k++) { const x = ri(0, TW - 1), y = ri(0, TH - 1); if (oc(x, y) === 2 && !devantPorte(x, y)) set(x, y, r() < 0.5 ? ';' : '%', 2); }
  // camionnettes : 4 × 2 (le « ξ » posé en 3 × 2 doit faire 4 de long)
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) if (G[y][x] === 'ξ' && get(x - 1, y) !== 'ξ' && (y === 0 || G[y - 1][x] !== 'ξ')) {
    if (get(x + 3, y) === M.route && get(x + 3, y + 1) === M.route) { set(x + 3, y, 'ξ'); set(x + 3, y + 1, 'ξ'); }
    else for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) set(x + b, y + a, 'ϛ');
  }

  // ---------- 4 bis. accessibilité : une poche fermée devient un fourré (ou une maison close) ----------
  {
    const vu = new Uint8Array(TW * TH), pile = [];
    const marche = (x, y) => { const c = G[y][x]; return oc(x, y) === 1 ? !'#| '.includes(c) : MARCHE.has(c); };
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const o2 = oc(x, y); if (o2 === 2 && marche(x, y)) { vu[y * TW + x] = 1; pile.push(y * TW + x); } }
    while (pile.length) {
      const i = pile.pop(), x = i % TW, y = (i / TW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!dans(nx, ny)) continue;
        const j = ny * TW + nx; if (vu[j] || !marche(nx, ny)) continue;
        vu[j] = 1; pile.push(j);
      }
    }
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (vu[y * TW + x] || oc(x, y) === 1 || !MARCHE.has(G[y][x])) continue;
      const c = G[y][x];
      set(x, y, c === '+' || c === '/' || c === 'ϗ' ? '#' : ['ω', 'ψ', 'χ', 'ϕ', 'ϑ', '.'].includes(c) ? 'ϖ' : 'ϙ');
    }
  }

  // ---------- 4 bis. essences variées (sans toucher au plan : mêmes cases bloquées) ----------
  // Une part des buissons devient des ronciers (mûres) ou des cannes de Provence (au bord des champs) ;
  // une part des oliviers des jardins, des figuiers ou des amandiers. Hasard par case, indépendant du tirage du plan.
  const hc = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + k * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    if (oc(x, y) === 1) continue;
    const c = G[y][x], u = hc(x, y, 7);
    if (c === 'κ') { if (u < 0.3) G[y][x] = 'Ϝ'; else if (u < 0.42 && milieu !== 'centre') G[y][x] = 'Ϟ'; }
    else if (c === 'θ' && milieu !== 'zone') { if (u < 0.18) G[y][x] = 'Ϙ'; else if (u < 0.3) G[y][x] = 'Ϛ'; }
  }

  // ---------- 4 ter. modèles de voitures (sans toucher au plan : mêmes empreintes, même tirage du reste) ----------
  // Chaque voiture garée (3 × 2, « v » ou « ϛ ») prend un modèle selon le milieu ; une camionnette (4 × 2) peut être un
  // camping-car. Hasard par voiture (coin haut-gauche), indépendant du tirage : les sauvegardes restent valables.
  {
    const MV = MODELES_VOITURES[milieu] || MODELES_VOITURES.ville, tot = MV.reduce((s, m) => s + m[2], 0);
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (oc(x, y) === 1) continue;
      const c = G[y][x];
      if (c === 'ξ') {
        if (get(x - 1, y) === 'ξ' || get(x, y - 1) === 'ξ') continue;
        const u = hc(x, y, 11), pc = CAMPING_CAR[milieu] ?? 0.2, pp = FOURGON_POSTAL[milieu] ?? 0.15;
        const nc = u < pc ? 'Ϭ' : u < pc + pp ? 'ͳ' : null;
        if (!nc) continue;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 4; b++) if (get(x + b, y + a) === 'ξ') G[y + a][x + b] = nc;
        continue;
      }
      if ((c !== 'v' && c !== 'ϛ') || get(x - 1, y) === c || get(x, y - 1) === c) continue;
      let u = hc(x, y, 13) * tot, k = 0;
      while (k < MV.length - 1 && u >= MV[k][2]) { u -= MV[k][2]; k++; }
      // une voiture déjà vidée a parfois brûlé (pillée, puis incendiée)
      const nc = c === 'v' ? MV[k][0] : hc(x, y, 17) < (CALCINEES[milieu] ?? 0.1) ? 'Ͳ' : MV[k][1];
      if (nc === c) continue;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) if (get(x + b, y + a) === c) G[y + a][x + b] = nc;
    }
  }

  // ---------- 5. sorties sur les bords (au bout des rues / pistes) ----------
  let nS = 0;
  for (let x = 0; x < TW; x++) for (const y of [0, TH - 1]) if (oc(x, y) === 2 || oc(x, y) === 3) { set(x, y, 'E'); nS++; }
  for (let y = 0; y < TH; y++) for (const x of [0, TW - 1]) if (oc(x, y) === 2 || oc(x, y) === 3) { set(x, y, 'E'); nS++; }
  if (!nS) for (let k = -1; k <= 1; k++) set(ox + (Wg >> 1) + k, TH - 1, 'E');

  // ---------- 6. tous les étages au même décalage ----------
  const nouveaux = etages.map((ed, k) => {
    if (k === g) return { ...ed, plan: G.map(l => l.join('')) };
    const lignes = []; const src = (ed.plan || []).map(String);
    for (let y = 0; y < TH; y++) {
      const sy = y - oy;
      if (sy < 0 || sy >= src.length) { lignes.push(' '.repeat(TW)); continue; }
      const l = src[sy];
      lignes.push(' '.repeat(ox) + l + ' '.repeat(Math.max(0, TW - ox - l.length)));
    }
    return { ...ed, plan: lignes.map(l => l.slice(0, TW)) };
  });
  const decaler = (o) => ({ ...o, x: (o.x | 0) + ox, y: (o.y | 0) + oy });
  const aire = (TW * TH) / (Wg * Hg);
  return {
    ...def,
    exterieur: true,                                   // il y a désormais un dehors autour (toits vus de dehors)
    solDefaut: def.solDefaut || (def.exterieur ? 'beton' : 'parquet'),
    etages: nouveaux,
    pieces: (def.pieces || []).map(decaler),
    declencheurs: (def.declencheurs || []).map(decaler),
    legende: { ...LEG, ...(def.legende || {}) },
    abords: { version: ABORDS_VERSION, milieu, dx: ox, dy: oy, w: TW, h: TH, coeur: { x: ox, y: oy, w: Wg, h: Hg },
      mortsMult: Math.min(3, Math.max(1, Math.sqrt(aire) * 0.75)) },
  };
}
