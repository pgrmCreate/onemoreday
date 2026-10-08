// ============ Compilateur — Plan (couches) → niveau jouable ============
// compilerPlan(plan, def) → niveau : la structure lue par la simulation (sim.js), la vision, l'IA et le rendu.
// Champs historiques conservés (code, sol, bloque, opaque, piece, meuble, porte, deco, lumBase, pieces, meubles, portes,
// escaliers, entrees, sorties, marqueurs, spawns, pnj, sol, declencheurs) + le rendu :
//   E.mur (style de mur par case), E.int (intérieur), E.rendu = { objets, decals, sources (lumières cuites), toits },
//   E.lumStat (lumière des sources fixes, 0..1, pour la vision et la détection par les morts).
//
// GRILLE FINE (catalogue.js, FIN) : le plan est écrit en unités ; chaque unité devient FIN × FIN petites cases.
// Les murs « minces » ne gardent qu'une petite case d'épaisseur, collée en haut à gauche de leur unité (un treillis :
// un mur vertical garde sa colonne de gauche, un mur horizontal sa rangée du haut) ; la moitié libérée revient au sol
// voisin. Une porte fait FIN petites cases de large (une unité), une seule d'épaisseur.
// Les grilles de E sont FINES (E.w = largeur × FIN) ; tout ce qui est une POSITION reste en unités, avec la convention
// historique « (x + 0,5, y + 0,5) est le centre » : entrées, morts, PNJ, objets au sol, marqueurs, portes (p.x, p.y),
// arrivées d'escalier. Meubles : x0..x1 / y0..y1 en unités (centre = (x0 + x1 + 1) / 2). Clés (cle) : en unités, comme
// avant la grille fine (les sauvegardes restent valables).
// Aucune dépendance au DOM.
import { K, SOLS_IDS, SOL_IDX, SOL_AUCUN, MURS, MURS_IDS, MUR_IDX, OBJETS, LUMIERES, DECALS, FIN, MURS_MINCES, disposition } from './catalogue.js';
import { creerChamp, calculerLOS } from '../explore/vision.js';
import { solsAscii } from './ascii.js';

export const DECOS = ['chaise', 'cadavre', 'debris'];
export const cleCase = (etage, x, y) => `${etage}:${x},${y}`;
const DX4 = [1, -1, 0, 0], DY4 = [0, 0, 1, -1];
const PIECE_SOMBRE_DEF = { 0: 1, 1: 0.45, 2: 0 };
const MINCE = MURS_IDS.map(id => MURS_MINCES.has(id));

// ---------- Découpe d'un étage en petites cases ----------
// Renvoie un « plan fin » : mêmes champs que l'EtagePlan (sol, mur, ouv, int, force, portes, sorties) à la résolution
// fine, + src (unité d'origine de chaque petite case), portesG (une entrée par porte : ses petites cases) et, pour
// l'ancien format, classeSol / solForce / car.
export function affiner(P) {
  const F = FIN, w = P.w, h = P.h, W = w * F, H = h * F, N = W * H;
  const FP = {
    id: P.id, w: W, h: H, uw: w, uh: h,
    sol: new Uint8Array(N), mur: new Uint8Array(N), ouv: new Uint8Array(N), int: new Uint8Array(N), src: new Int32Array(N),
    force: new Map(), portes: new Map(), sorties: new Map(), portesG: [],
  };
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : y * w + x);
  // une unité « trait » : mur mince, porte ou fenêtre (hors plan : compte comme un trait, les bords restent fermés)
  const trait = (i) => i < 0 || P.ouv[i] === K.PORTE || P.ouv[i] === K.FENETRE || (!P.ouv[i] && P.mur[i] > 0 && MINCE[P.mur[i]]);
  const bloc = (i) => i < 0 || P.ouv[i] === K.PORTE || P.ouv[i] === K.FENETRE || (!P.ouv[i] && P.mur[i] > 0) || (P.sol[i] === SOL_AUCUN && !P.ouv[i]);
  const copier = (k, j) => { FP.sol[k] = P.sol[j]; FP.mur[k] = P.mur[j]; FP.ouv[k] = P.ouv[j]; FP.int[k] = P.int[j]; FP.src[k] = j; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const fi = (dx, dy) => (y * F + dy) * W + x * F + dx;
    if (!trait(i)) { for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) copier(fi(dx, dy), i); continue; }
    const iD = at(x + 1, y), iB = at(x, y + 1), iDB = at(x + 1, y + 1);
    let garde; // garde(dx, dy) : la petite case reste mur / ouverture
    if (P.ouv[i] === K.PORTE) {
      const horiz = bloc(at(x - 1, y)) && bloc(iD);
      const vert = bloc(at(x, y - 1)) && bloc(iB);
      const h2 = horiz || !vert;
      garde = (dx, dy) => (h2 ? dy === 0 : dx === 0);
      const cases = [];
      for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) if (garde(dx, dy)) cases.push(fi(dx, dy));
      FP.portesG.push({ pd: P.portes.get(i) || {}, ux: x, uy: y, cases, orient: h2 ? 'h' : 'v' });
    } else {
      const tD = trait(iD), tB = trait(iB), tDB = trait(iDB);
      garde = (dx, dy) => (dx === 0 || tD) && (dy === 0 || tB) && (dx === 0 || dy === 0 || tDB);
    }
    // donneur de la moitié libérée : le voisin de droite, du dessous ou en diagonale qui n'est pas un trait
    const donneur = (dx, dy) => {
      const cand = dx && dy ? [iDB, iD, iB] : dx ? [iD, iDB] : [iB, iDB];
      for (const j of cand) if (j >= 0 && !trait(j)) return j;
      return -1;
    };
    for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) {
      const k = fi(dx, dy);
      if (garde(dx, dy)) { copier(k, i); continue; }
      const j = donneur(dx, dy);
      if (j < 0) copier(k, i); else copier(k, j);
      if (P.ouv[i] === K.PORTE && FP.ouv[k] === K.PORTE) FP.ouv[k] = 0;   // seule la porte elle-même reste une porte
    }
  }
  for (let k = 0; k < N; k++) {
    const j = FP.src[k];
    const f = P.force.get(j); if (f) FP.force.set(k, f);
    if (FP.ouv[k] === K.SORTIE) FP.sorties.set(k, P.sorties.get(j) || { echelle: null });
  }
  for (const g of FP.portesG) for (const k of g.cases) FP.portes.set(k, g.pd);
  if (P.classeSol) {
    FP.classeSol = new Uint8Array(N); FP.solForce = new Map(); FP.car = P.car ? new Array(N) : null;
    for (let k = 0; k < N; k++) {
      const j = FP.src[k];
      FP.classeSol[k] = P.classeSol[j];
      if (P.solForce && P.solForce.has(j)) FP.solForce.set(k, P.solForce.get(j));
      if (FP.car) FP.car[k] = P.car[j];
    }
  }
  return FP;
}

export function compilerPlan(plan, def = {}) {
  const meta = plan.meta || {};
  const F = FIN;
  const avertissements = [];
  const avert = (m) => avertissements.push(m);
  const niv = {
    id: meta.id, nom: meta.nom || meta.id, exterieur: !!meta.exterieur, fin: F,
    typeButin: meta.typeButin || null, pool: meta.pool || null, morts: meta.morts || null, mortsDehorsSeulement: !!meta.mortsDehorsSeulement, planVersion: meta.version || 0, def,
    etages: [], etageIdx: {}, pieces: [], meubles: [], meubleParCle: {}, portes: [], porteParCle: {},
    escaliers: [], entrees: {}, sorties: [], marqueurs: {}, spawns: [], pnj: [], sol: [], declencheurs: [],
    avertissements, format: 'couches',
  };
  const FPs = plan.etages.map(affiner);

  // ---------- 1. Grilles de base ----------
  plan.etages.forEach((P, idx) => {
    const FP = FPs[idx];
    const { w, h } = FP, n = w * h;
    const E = {
      id: P.id, nom: P.nom, idx, w, h, uw: P.w, uh: P.h, monte: P.monte, descend: P.descend, def: FP,
      code: new Uint8Array(n), sol: new Uint8Array(n), bloque: new Uint8Array(n), opaque: new Uint8Array(n),
      piece: new Int16Array(n).fill(-1), meuble: new Int32Array(n).fill(-1), porte: new Int32Array(n).fill(-1),
      deco: new Uint8Array(n), lumBase: new Float32Array(n), lumStat: new Float32Array(n),
      mur: Uint8Array.from(FP.mur), int: Uint8Array.from(FP.int), car: null,
      rendu: { objets: [], decals: [], sources: [], toits: [] },
    };
    niv.etageIdx[E.id] = idx; niv.etages.push(E);
    for (let i = 0; i < n; i++) {
      const o = FP.ouv[i], m = FP.mur[i], s = FP.sol[i];
      let k;
      if (o) k = o;
      else if (m) k = MURS_IDS[m] === 'vide' ? K.VIDE : K.MUR;
      else if (s === SOL_AUCUN) k = K.VIDE;
      else k = K.SOL;
      E.code[i] = k;
      E.sol[i] = s === SOL_AUCUN ? (SOL_IDX.beton) : s;
      let bl = 0, op = 0;
      if (k === K.VIDE) { bl = 1; op = 1; }
      else if (k === K.MUR) { const M = MURS[MURS_IDS[m]] || {}; bl = M.bloque ?? 1; op = M.opaque ?? 1; }
      else if (k === K.FENETRE || k === K.EAU) { bl = 1; op = 0; }
      else if (k === K.PORTE) { const pd = FP.portes.get(i) || {}; const ouv = pd.etat === 'ouverte'; bl = ouv ? 0 : 1; op = ouv ? 0 : (pd.style === 'grille' || pd.style === 'vitree' ? 0 : 1); }
      E.bloque[i] = bl; E.opaque[i] = op;
    }
  });

  // ---------- 2. Objets (avant les pièces : ils comptent pour l'intérieur/extérieur) ----------
  plan.etages.forEach((P, idx) => {
    const E = niv.etages[idx], FP = FPs[idx];
    const { w, h } = E;
    const sol = (x, y) => x >= 0 && y >= 0 && x < w && y < h && E.code[y * w + x] === K.SOL && !E.bloque[y * w + x];
    const mur = (x, y) => x >= 0 && y >= 0 && x < w && y < h && (E.code[y * w + x] === K.MUR || E.code[y * w + x] === K.FENETRE);
    for (const ob of P.objets) {
      const d = OBJETS[ob.type] || OBJETS.caisson;
      const R = { ...ob, d };
      let cases = [];
      if (ob.cases && ob.cases.length) {
        // forme irrégulière (ancien format) : cases en unités → petites cases
        for (const j of ob.cases) { const ux = j % P.w, uy = (j / P.w) | 0; for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) cases.push((uy * F + dy) * w + ux * F + dx); }
        R.irregulier = true; R.cle0 = [ob.cases[0] % P.w, (ob.cases[0] / P.w) | 0];
      } else {
        let fx = Math.round(ob.x * F), fy = Math.round(ob.y * F);
        const fw = Math.max(1, Math.round(ob.w * F)), fh = Math.max(1, Math.round(ob.h * F));
        R.cle0 = [Math.floor(ob.x), Math.floor(ob.y)];
        // un meuble posé contre un mur du haut ou de gauche s'y colle (la moitié du mur libérée ne laisse pas un vide derrière)
        if (!d.decor || ob.conteneur || ob.marqueur) {
          let ok = true; for (let y = fy; y < fy + fh && ok; y++) ok = sol(fx - 1, y) && mur(fx - 2, y);
          if (ok) fx -= 1;
          ok = true; for (let x = fx; x < fx + fw && ok; x++) ok = sol(x, fy - 1) && mur(x, fy - 2);
          if (ok) fy -= 1;
        }
        // empreinte réelle plus petite (tronc, poteau) : centrée ; le dessin garde sa taille, centré sur elle
        let ex = fx, ey = fy, ew = fw, eh = fh;
        const q = (ob.rot || 0) % 2 === 1;
        if (d.tf && !ob.w && !ob.h || d.tf && ob.w === d.t[0] && ob.h === d.t[1]) {
          const tw = Math.min(fw, q ? d.tf[1] : d.tf[0]), th = Math.min(fh, q ? d.tf[0] : d.tf[1]);
          ex = fx + Math.floor((fw - tw) / 2); ey = fy + Math.floor((fh - th) / 2); ew = tw; eh = th;
        } else {
          // un objet unique posé sur une empreinte d'autres proportions : il est dessiné plus petit, centré (catalogue,
          // disposition) — l'empreinte réelle (collision, surlignage) se réduit à ce qui est dessiné, au plus près
          const dp = disposition(ob.type, q ? ob.h : ob.w, q ? ob.w : ob.h);
          if (dp.mode === 'centrer') {
            const tw = Math.min(fw, Math.max(1, Math.round((q ? dp.h : dp.w) * F))), th = Math.min(fh, Math.max(1, Math.round((q ? dp.w : dp.h) * F)));
            ex = fx + Math.floor((fw - tw) / 2); ey = fy + Math.floor((fh - th) / 2); ew = tw; eh = th;
          }
        }
        for (let y = ey; y < ey + eh; y++) for (let x = ex; x < ex + ew; x++) if (x >= 0 && y >= 0 && x < w && y < h) cases.push(y * w + x);
        // boîte de dessin (unités) : centrée sur l'empreinte, à la taille du plan
        R.x = (ex + ew / 2) / F - ob.w / 2; R.y = (ey + eh / 2) / F - ob.h / 2;
      }
      const bloque = ob.bloque != null ? (ob.bloque ? 1 : 0) : (d.bloque || 0);
      const opaque = ob.opaque != null ? (ob.opaque ? 1 : 0) : (d.opaque || 0);
      Object.assign(R, { cases, bloque, opaque, haut: ob.haut ?? d.haut ?? null, lumiere: ob.lumiere ?? d.lumiere ?? null });
      E.rendu.objets.push(R);
      // Un objet de décor (chaise, corps, débris, tapis, housse) reste du sol — sauf s'il a un contenu ou un marqueur.
      const meuble = !d.decor || !!ob.conteneur || !!ob.marqueur;
      const dk = DECOS.indexOf(ob.type);
      for (const i of cases) {
        if (E.code[i] !== K.SOL) continue;
        if (!meuble) {
          if (dk >= 0) E.deco[i] = dk + 1;
          if (bloque) E.bloque[i] = 1;
          if (opaque) E.opaque[i] = 1;
          continue;
        }
        E.code[i] = K.MEUBLE; E.bloque[i] = bloque; E.opaque[i] = opaque;
      }
      R._meuble = meuble && cases.some(i => E.code[i] === K.MEUBLE);
    }
    // forçages de légende
    for (const [i, f] of FP.force) { if (f.bloque != null) E.bloque[i] = f.bloque ? 1 : 0; if (f.opaque != null) E.opaque[i] = f.opaque ? 1 : 0; }
  });

  // ---------- 3. Pièces : remplissage (murs, portes et fenêtres séparent) ----------
  for (const E of niv.etages) {
    const { w, h, code } = E;
    const separe = (i) => code[i] === K.MUR || code[i] === K.VIDE || code[i] === K.PORTE || code[i] === K.FENETRE;
    const file = new Int32Array(w * h);
    for (let s = 0; s < w * h; s++) {
      if (E.piece[s] >= 0 || separe(s)) continue;
      const pid = niv.pieces.length;
      const Pc = { id: pid, etage: E.id, nom: null, sol: null, sombre: null, exterieur: false, n: 0, fenetres: [], x0: w, y0: h, x1: 0, y1: 0, toit: null };
      niv.pieces.push(Pc);
      let a = 0, b = 0, nExt = 0, nInt = 0;
      file[b++] = s; E.piece[s] = pid;
      while (a < b) {
        const i = file[a++]; const x = i % w, y = (i / w) | 0;
        Pc.n++; if (x < Pc.x0) Pc.x0 = x; if (y < Pc.y0) Pc.y0 = y; if (x > Pc.x1) Pc.x1 = x; if (y > Pc.y1) Pc.y1 = y;
        const iv = E.int[i];
        if (iv === 1) nInt++; else if (iv === 0) nExt++;
        for (let d = 0; d < 4; d++) {
          const nx = x + DX4[d], ny = y + DY4[d];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (code[j] === K.FENETRE && !Pc.fenetres.includes(j)) Pc.fenetres.push(j);
          if (E.piece[j] >= 0 || separe(j)) continue;
          E.piece[j] = pid; file[b++] = j;
        }
      }
      Pc.exterieur = nExt > nInt || (niv.exterieur && nInt === 0);
      Pc.n = Pc.n / (F * F);      // surface en unités (comme avant la grille fine)
    }
  }
  // pièces nommées
  plan.etages.forEach((P, idx) => {
    const E = niv.etages[idx], FP = FPs[idx];
    const pieceEn = (ux, uy) => { // la pièce de l'unité (ux, uy) : son centre, sinon une de ses petites cases, sinon autour
      for (let r = 0; r <= 2 * F; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = Math.floor((ux + 0.5) * F) + dx, y = Math.floor((uy + 0.5) * F) + dy;
        if (x >= 0 && y >= 0 && x < E.w && y < E.h && E.piece[y * E.w + x] >= 0) return E.piece[y * E.w + x];
      }
      return -1;
    };
    for (const pd of P.nommages) {
      if (pd.x < 0 || pd.y < 0 || pd.x >= P.w || pd.y >= P.h) { avert(`pièce « ${pd.nom} » : position hors plan`); continue; }
      const pid = pieceEn(pd.x, pd.y);
      if (pid < 0) { avert(`pièce « ${pd.nom} » : (${pd.x},${pd.y}) sur ${E.id} n'est pas dans une pièce (mur, porte ?)`); continue; }
      const Pc = niv.pieces[pid];
      if (pd.nom) Pc.nom = pd.nom;
      if (pd.sol) { if (SOL_IDX[pd.sol] == null) avert(`pièce « ${pd.nom} » : sol inconnu « ${pd.sol} »`); else Pc.sol = pd.sol; }
      if (pd.sombre != null) Pc.sombre = pd.sombre;
      if (pd.exterieur != null) Pc.exterieur = !!pd.exterieur;
      if (pd.sansMorts) Pc.sansMorts = true;   // ni morts procéduraux ni repeuplement dans cette pièce
    }
    // toits : rattachés à la pièce de leur case de référence (rectangles en unités)
    for (const t of P.toits) {
      const [rx, ry] = t.ref || [t.x + 1, t.y + 1];
      const pid = rx >= 0 && ry >= 0 && rx < P.w && ry < P.h ? pieceEn(rx, ry) : -1;
      E.rendu.toits.push({ x: t.x, y: t.y, w: t.w, h: t.h, type: t.type, piece: pid });
      if (pid >= 0) niv.pieces[pid].toit = t.type;
    }
    // ancien format : matières selon la pièce, toits automatiques sur les intérieurs d'un lieu extérieur
    if (FP.classeSol) solsAscii(niv, E, FP, plan.solDefaut || 'parquet');
    if (FP.car) E.car = FP.car;
    if (plan.toitsAuto && niv.exterieur) {
      for (const Pc of niv.pieces) {
        if (Pc.etage !== E.id || Pc.exterieur || Pc.toit || Pc.n < 3) continue;
        const k = (Pc.x0 * 7 + Pc.y0 * 13) % 10;
        Pc.toit = k < 7 ? 'tuiles' : k < 9 ? 'terrasse' : 'zinc';
        E.rendu.toits.push({ x: (Pc.x0 - 1) / F, y: (Pc.y0 - 1) / F, w: (Pc.x1 - Pc.x0 + 3) / F, h: (Pc.y1 - Pc.y0 + 3) / F, type: Pc.toit, piece: Pc.id });
      }
    }
  });

  // ---------- 4. Lumière ambiante + sources fixes ----------
  for (const E of niv.etages) calculerLumiere(niv, E, def.lumiere);
  plan.etages.forEach((P, idx) => cuireSources(niv, niv.etages[idx], P));

  // ---------- 5. Meubles, portes, escaliers, sorties ----------
  plan.etages.forEach((P, idx) => {
    const E = niv.etages[idx], FP = FPs[idx];
    const { w, h } = E;
    // petites cases d'une unité (pour retrouver un meuble ou une porte posés « sur » une unité)
    const dansUnite = (ux, uy, grille) => { for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) { const x = ux * F + dx, y = uy * F + dy; if (x < w && y < h && grille[y * w + x] >= 0) return grille[y * w + x]; } return -1; };
    for (const R of E.rendu.objets) {
      if (!R._meuble) continue;
      const cases = R.cases.filter(i => E.code[i] === K.MEUBLE);
      if (!cases.length) continue;
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (const j of cases) { const cx = j % w, cy = (j / w) | 0; if (cx < x0) x0 = cx; if (cy < y0) y0 = cy; if (cx > x1) x1 = cx; if (cy > y1) y1 = cy; }
      const cont = R.conteneur;
      const d = R.d;
      let cle = cleCase(E.id, R.cle0[0], R.cle0[1]);
      if (niv.meubleParCle[cle]) cle = cleCase(E.id, (x0 / F).toFixed(1), (y0 / F).toFixed(1));
      const m = {
        cle, idx: niv.meubles.length, etage: E.id, type: R.type, car: R.car || null, cat: (cont && cont.categorie) || R.cat || d.cat || null,
        cases, x0: x0 / F, y0: y0 / F, x1: (x1 + 1) / F - 1, y1: (y1 + 1) / F - 1, taille: Math.max(1, Math.round(cases.length / (F * F))),
        conteneur: cont === false ? false : !!(cont || R.cat || d.cat),
        nom: (cont && cont.nom) ? cont.nom : R.nom || d.nom || 'le meuble',
        items: cont && Array.isArray(cont.items) ? cont.items.map(it => ({ id: it.id, qty: it.qty || 1 })) : null,
        table: cont && 'table' in cont ? cont.table : undefined,
        marqueur: R.marqueur || null, eau: R.eau || null, piece: E.piece[cases[0]],
        rendu: R,
      };
      if (m.cat === null && cont) m.cat = 'etagere';
      R.meuble = m.idx;
      niv.meubles.push(m); niv.meubleParCle[cle] = m;
      for (const j of cases) E.meuble[j] = m.idx;
      if (m.marqueur) ajouterMarqueur(niv, m.marqueur, { etage: E.id, x: R.cle0[0], y: R.cle0[1], meuble: cle, def: R }, avert);
    }
    for (const g of FP.portesG) {
      const pd = g.pd, verrou = normaliserVerrou(pd);
      let bx0 = w, by0 = h, bx1 = 0, by1 = 0;
      for (const j of g.cases) { const cx = j % w, cy = (j / w) | 0; if (cx < bx0) bx0 = cx; if (cy < by0) by0 = cy; if (cx > bx1) bx1 = cx; if (cy > by1) by1 = cy; }
      const pieces = new Set();
      let ext = !!pd.exterieure;
      for (const j of g.cases) {
        const x = j % w, y = (j / w) | 0;
        for (let d = 0; d < 4; d++) {
          const nx = x + DX4[d], ny = y + DY4[d];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const pp = E.piece[ny * w + nx];
          if (pp >= 0) { pieces.add(pp); if (niv.pieces[pp].exterieur) ext = true; }
        }
      }
      const p = {
        cle: cleCase(E.id, g.ux, g.uy), idx: niv.portes.length, etage: E.id,
        // centre de la porte (unités) = (x + 0,5, y + 0,5) ; boîte du battant en unités
        x: (bx0 + bx1 + 1) / (2 * F) - 0.5, y: (by0 + by1 + 1) / (2 * F) - 0.5,
        bx: bx0 / F, by: by0 / F, bw: (bx1 - bx0 + 1) / F, bh: (by1 - by0 + 1) / F, cases: g.cases, pieces: [...pieces],
        etat: pd.etat || 'fermee', verrou, exterieure: ext,
        orient: g.orient, marqueur: pd.marqueur || null, nom: pd.nom || null, style: pd.style || null,
        deux: !!(pd.deux || (verrou && verrou.deux)),
        message: pd.message || null,   // dit à l'essai tant qu'elle ne s'ouvre pas (« barrée de l'intérieur… »)
      };
      if (p.etat === 'verrouillee' && !p.verrou) p.verrou = { forcer: 'pied_de_biche' };
      niv.portes.push(p); niv.porteParCle[p.cle] = p;
      for (const j of g.cases) E.porte[j] = p.idx;
      if (p.marqueur) ajouterMarqueur(niv, p.marqueur, { etage: E.id, x: g.ux, y: g.uy, porte: p.cle, def: pd }, avert);
    }
    const vu = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const k = E.code[i];
      if (vu[i]) continue;
      const x = i % w, y = (i / w) | 0;
      if (k === K.ESC_MONTE || k === K.ESC_DESCEND) {
        const cases = groupe(E, i, (j) => E.code[j] === k, vu);
        niv.escaliers.push({ cle: cleCase(E.id, x, y), etage: E.id, sens: k === K.ESC_MONTE ? 'monte' : 'descend', cases,
          cx: moy(cases, w, 0) / F, cy: moy(cases, w, 1) / F, vers: k === K.ESC_MONTE ? E.monte : E.descend, arrivee: null });
      } else if (k === K.SORTIE) {
        const cases = groupe(E, i, (j) => E.code[j] === K.SORTIE, vu);
        let ech = null; for (const j of cases) { const s = FP.sorties.get(j); if (s && s.echelle) ech = s.echelle; }
        niv.sorties.push({ cle: cleCase(E.id, x, y), etage: E.id, cases, cx: moy(cases, w, 0) / F, cy: moy(cases, w, 1) / F, echelle: ech });
      }
    }
    // entrées, morts, PNJ, objets au sol, marqueurs, déclencheurs (positions en unités)
    for (const [nom, e] of Object.entries(P.entrees)) {
      if (niv.entrees[nom]) { avert(`entrée « ${nom} » définie deux fois`); continue; }
      niv.entrees[nom] = { etage: E.id, x: e.x | 0, y: e.y | 0 };
    }
    for (const z of P.zombies) niv.spawns.push({ etage: E.id, x: z.x | 0, y: z.y | 0, type: z.type, etat: z.etat, hp: z.hp, dir: z.dir, si: z.si || null });
    for (const q of P.pnjs) niv.pnj.push({ id: q.id, etage: E.id, x: q.x | 0, y: q.y | 0, si: q.si, marqueur: q.marqueur, nom: q.nom, dir: q.dir ?? null, style: q.style || null, repliques: q.repliques || null });
    for (const o of P.solItems) niv.sol.push(o.doc ? { etage: E.id, x: o.x | 0, y: o.y | 0, doc: o.doc, marqueur: o.marqueur || null } : { etage: E.id, x: o.x | 0, y: o.y | 0, id: o.id, qty: o.qty || 1 });
    for (const mk of P.marqueurs) {
      const x = mk.x | 0, y = mk.y | 0;
      const info = { etage: E.id, x, y, def: mk, eau: mk.eau || null, pnj: mk.pnj || null, doc: mk.document || null };
      const mi = dansUnite(x, y, E.meuble), pi = dansUnite(x, y, E.porte);
      if (mi >= 0 && mk.meuble !== false) { const m = niv.meubles[mi]; info.meuble = m.cle; if (!m.marqueur) m.marqueur = mk.id; }
      else if (pi >= 0) { const p = niv.portes[pi]; info.porte = p.cle; if (!p.marqueur) p.marqueur = mk.id; }
      if (mk.document) niv.sol.push({ etage: E.id, x, y, doc: mk.document, marqueur: mk.id });
      if (mk.objet) { const ob = Array.isArray(mk.objet) ? { id: mk.objet[0], qty: mk.objet[1] || 1 } : { id: mk.objet, qty: 1 }; niv.sol.push({ etage: E.id, x, y, ...ob }); }
      ajouterMarqueur(niv, mk.id, info, avert);
    }
    P.declencheurs.forEach((dz) => {
      const i = niv.declencheurs.length;
      niv.declencheurs.push({ i, etage: E.id, x: dz.x | 0, y: dz.y | 0, w: dz.w || 1, h: dz.h || 1, scene: dz.scene || null,
        cinematique: dz.cinematique || null, marqueur: dz.marqueur || null, unique: dz.unique !== false, si: dz.si || null, deux: !!dz.deux });
    });
    // décals
    for (const dc of P.decals) { if (!DECALS[dc.type]) avert(`décal inconnu « ${dc.type} »`); E.rendu.decals.push(dc); }
  });

  // ---------- 6. Escaliers appariés, entrée par défaut ----------
  for (const s of niv.escaliers) {
    if (!s.vers) continue;
    const cibles = niv.escaliers.filter(t => t.etage === s.vers && t.sens !== s.sens && t.vers === s.etage);
    if (!cibles.length) continue;
    let best = cibles[0], bd = Infinity;
    for (const t of cibles) { const dd = (t.cx - s.cx) ** 2 + (t.cy - s.cy) ** 2; if (dd < bd) { bd = dd; best = t; } }
    s.cible = best.cle;
    s.arrivee = caseArrivee(niv, best);
  }
  if (!niv.entrees.defaut) {
    const nom = Object.keys(niv.entrees)[0];
    if (nom) niv.entrees.defaut = niv.entrees[nom];
    else if (niv.sorties[0]) { const s = niv.sorties[0]; const E = niv.etages[niv.etageIdx[s.etage]]; niv.entrees.defaut = { etage: s.etage, x: Math.floor((s.cases[0] % E.w) / F), y: Math.floor(((s.cases[0] / E.w) | 0) / F) }; }
    else if (niv.etages[0]) niv.entrees.defaut = { etage: niv.etages[0].id, x: 1, y: 1 };
  }
  return niv;
}

// ---------- Aides ----------
function moy(cases, w, axe) { let s = 0; for (const j of cases) s += axe ? ((j / w) | 0) : j % w; return s / cases.length + 0.5; }
export function groupe(E, i0, ok, vu) {
  const out = [i0]; vu[i0] = 1;
  for (let a = 0; a < out.length; a++) {
    const i = out[a], x = i % E.w, y = (i / E.w) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX4[d], ny = y + DY4[d];
      if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
      const j = ny * E.w + nx;
      if (!vu[j] && ok(j)) { vu[j] = 1; out.push(j); }
    }
  }
  return out;
}
export function normaliserVerrou(L) {
  if (!L) return null;
  let v = L.verrou;
  if (typeof v === 'string') v = { cle: v };
  else if (v && typeof v === 'object') v = { ...v };
  else v = null;
  if (L.flag) v = { ...(v || {}), flag: L.flag };
  if (L.deux) v = { ...(v || {}), deux: true };
  return v;
}
function ajouterMarqueur(niv, id, info, avert) {
  if (niv.marqueurs[id]) { if (!niv.marqueurs[id].meuble || !info.meuble || niv.marqueurs[id].meuble !== info.meuble) avert(`marqueur « ${id} » placé plusieurs fois (le premier fait foi)`); return; }
  niv.marqueurs[id] = { id, ...info };
}
// Arrivée d'un escalier : une petite case libre à côté, dont le CENTRE est (x + 0,5, y + 0,5) en unités.
function caseArrivee(niv, esc) {
  const E = niv.etages[niv.etageIdx[esc.etage]];
  const F = FIN, cx = esc.cx * F, cy = esc.cy * F;
  let best = null, bd = Infinity;
  for (const j of esc.cases) {
    const x = j % E.w, y = (j / E.w) | 0;
    for (let dy = -F; dy <= F; dy++) for (let dx = -F; dx <= F; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
      // il faut la place d'un corps : la petite case et ses voisines libres
      let libre = true;
      for (let ey = -1; ey <= 1 && libre; ey++) for (let ex = -1; ex <= 1 && libre; ex++) {
        const qx = nx + ex, qy = ny + ey;
        if (qx < 0 || qy < 0 || qx >= E.w || qy >= E.h) { libre = false; break; }
        const k = qy * E.w + qx;
        if (E.bloque[k] && E.code[k] !== K.PORTE) libre = false;
      }
      const k = ny * E.w + nx;
      if (!libre || E.code[k] === K.ESC_MONTE || E.code[k] === K.ESC_DESCEND || E.code[k] === K.SORTIE || E.code[k] === K.PORTE) continue;
      const dd = (nx + 0.5 - cx) ** 2 + (ny + 0.5 - cy) ** 2 + (dx && dy ? 0.5 : 0);
      if (dd < bd) { bd = dd; best = { etage: E.id, x: (nx + 0.5) / F - 0.5, y: (ny + 0.5) / F - 0.5 }; }
    }
  }
  if (!best) { // repli : la case libre la plus proche, même étroite
    for (const j of esc.cases) {
      const x = j % E.w, y = (j / E.w) | 0;
      for (let dy = -F; dy <= F; dy++) for (let dx = -F; dx <= F; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
        const k = ny * E.w + nx;
        if (E.bloque[k] || E.code[k] === K.ESC_MONTE || E.code[k] === K.ESC_DESCEND || E.code[k] === K.SORTIE || E.code[k] === K.PORTE) continue;
        const dd = (nx + 0.5 - cx) ** 2 + (ny + 0.5 - cy) ** 2;
        if (dd < bd) { bd = dd; best = { etage: E.id, x: (nx + 0.5) / F - 0.5, y: (ny + 0.5) / F - 0.5 }; }
      }
    }
  }
  return best;
}

// Lumière ambiante de base (0..1, AVANT × lumiereJour) : pièces extérieures 1, fenêtres, pénombre, noir.
function calculerLumiere(niv, E, R = {}) {
  const PS = R.PIECE_SOMBRE || PIECE_SOMBRE_DEF;
  const portee = (R.FENETRE_PORTEE || 5) * FIN;
  const { w, h } = E;
  const fen = new Float32Array(w * h), dist = new Int16Array(w * h).fill(-1), file = new Int32Array(w * h);
  let a = 0, b = 0;
  for (let i = 0; i < w * h; i++) if (E.code[i] === K.FENETRE) { dist[i] = 0; file[b++] = i; }
  while (a < b) {
    const i = file[a++]; const x = i % w, y = (i / w) | 0;
    if (dist[i] >= portee) continue;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX4[d], ny = y + DY4[d];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (dist[j] >= 0 || E.opaque[j] || E.piece[j] < 0) continue;
      dist[j] = dist[i] + 1; file[b++] = j;
    }
  }
  for (let i = 0; i < w * h; i++) if (dist[i] > 0) fen[i] = Math.max(0, 1 - (dist[i] - 1) / portee);
  for (let i = 0; i < w * h; i++) {
    const p = E.piece[i];
    if (p < 0) { E.lumBase[i] = 0; continue; }
    const P = niv.pieces[p];
    if (P.exterieur) { E.lumBase[i] = 1; continue; }
    const s = P.sombre != null ? P.sombre : (P.fenetres.length ? 0 : 1);
    const f = fen[i];
    let v;
    if (s >= 2) v = 0;
    else if (s === 1) v = (PS[1] ?? 0.45) * (0.55 + 0.9 * f);
    else v = (PS[0] ?? 1) * (0.5 + 0.5 * f);
    E.lumBase[i] = Math.min(1, v);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (E.piece[i] >= 0) continue;
    let m = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (E.piece[j] >= 0 && E.lumBase[j] > m) m = E.lumBase[j];
    }
    E.lumBase[i] = m;
  }
}

// Sources de lumière fixes : ombres portées par les murs (champ de vision depuis la source), cuites une fois.
// E.rendu.sources[k] = { type, x, y, coul, r, i, anim, phase, cases: Int32Array, vals: Float32Array } ; E.lumStat = max.
function cuireSources(niv, E, P) {
  const liste = [];
  for (const L of P.lumieres) liste.push({ ...L });
  for (const R of E.rendu.objets) if (R.lumiere) liste.push({ type: R.lumiere, x: R.x + R.w / 2, y: R.y + R.h / 2, objet: true });
  for (const dc of P.decals) { const D = DECALS[dc.type]; if (D && D.lumiere) liste.push({ type: D.lumiere, x: dc.x, y: dc.y, i: 0.6 }); }
  if (!liste.length) return;
  const C = creerChamp(E);
  // opacité « statique » : murs et objets opaques, portes fermées laissées passer à moitié (lumière sous la porte)
  const op = Uint8Array.from(E.opaque);
  for (const L of liste) {
    const T = LUMIERES[L.type] || LUMIERES.lanterne;
    const r = L.r ?? T.r, I = L.i ?? T.i;
    const coul = L.coul || T.coul;
    calculerLOS(C, op, L.x, L.y, r + 0.5);
    const cases = [], vals = [];
    for (let k = 0; k < C.n; k++) {
      const i = C.liste[k];
      const x = (i % E.w + 0.5) / FIN, y = (((i / E.w) | 0) + 0.5) / FIN;
      const d = Math.hypot(x - L.x, y - L.y);
      if (d > r) continue;
      const v = I * Math.pow(1 - d / r, 1.35);
      if (v < 0.02) continue;
      cases.push(i); vals.push(v);
      if (v > E.lumStat[i]) E.lumStat[i] = Math.min(1, v);
    }
    E.rendu.sources.push({ type: L.type, x: L.x, y: L.y, coul, r, i: I, anim: L.anim || T.anim, phase: (L.x * 7.13 + L.y * 3.7) % 6.28,
      cases: Int32Array.from(cases), vals: Float32Array.from(vals), objet: !!L.objet });
  }
}

// ---------- Accessibilité (validation) ----------
export function marchable(E, i) {
  const c = E.code[i];
  return (c === K.SOL || c === K.ESC_MONTE || c === K.ESC_DESCEND || c === K.SORTIE || c === K.PORTE || (c === K.MEUBLE && !E.bloque[i])) && (!E.bloque[i] || c === K.PORTE);
}
export function accessibilite(niv) {
  const acc = {};
  for (const E of niv.etages) acc[E.id] = new Uint8Array(E.w * E.h);
  const file = [];
  const pousser = (etage, i) => {
    const E = niv.etages[niv.etageIdx[etage]];
    if (!E || i < 0 || i >= E.w * E.h) return;
    if (acc[etage][i] || !marchable(E, i)) return;
    acc[etage][i] = 1; file.push([etage, i]);
  };
  // un point (x + 0,5, y + 0,5) en unités → sa petite case
  const fine = (etage, x, y) => { const E = niv.etages[niv.etageIdx[etage]]; if (!E) return -1; const fx = Math.floor((x + 0.5) * FIN), fy = Math.floor((y + 0.5) * FIN); return fx < 0 || fy < 0 || fx >= E.w || fy >= E.h ? -1 : fy * E.w + fx; };
  for (const e of Object.values(niv.entrees)) pousser(e.etage, fine(e.etage, e.x, e.y));
  const escParCase = {};
  for (const s of niv.escaliers) for (const j of s.cases) escParCase[s.etage + ':' + j] = s;
  for (let a = 0; a < file.length; a++) {
    const [et, i] = file[a];
    const E = niv.etages[niv.etageIdx[et]];
    const x = i % E.w, y = (i / E.w) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX4[d], ny = y + DY4[d];
      if (nx >= 0 && ny >= 0 && nx < E.w && ny < E.h) pousser(et, ny * E.w + nx);
    }
    const s = escParCase[et + ':' + i];
    if (s && s.arrivee) pousser(s.arrivee.etage, fine(s.arrivee.etage, s.arrivee.x, s.arrivee.y));
  }
  return acc;
}
export { SOLS_IDS, MURS_IDS };
