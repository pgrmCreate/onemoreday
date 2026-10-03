// ============ Plan — l'API de construction des cartes (couches + objets) ============
// Un niveau s'écrit en JS, couche par couche, avec des pièces toutes faites :
//
//   import { plan } from '../../carte/plan.js';
//   export default plan({ id: 'pharmacie', nom: 'Pharmacie', exterieur: false, typeButin: 'pharmacie' }, (p) => {
//     const e = p.etage('rdc', 'Rez-de-chaussée', 28, 20, { sol: 'bitume' });
//     const off = e.piece(2, 2, 14, 10, { nom: 'Officine', sol: 'carrelage', mur: 'crepi', toit: 'tuiles',
//       portes: [{ cote: 's', a: 6 }], fenetres: [{ cote: 's', a: 2, l: 3 }] });
//     e.objet('comptoir', off.x0 + 2, off.y0 + 3, { rot: 0 });
//     e.lumiere('neon', off.cx, off.cy);
//     e.entree('defaut', 8, 16); e.sortie(0, 14, 1, 4);
//   });
//
// Conventions : coordonnées en CASES (x vers la droite, y vers le bas), entières pour les couches,
// libres (flottantes) pour les décals et les lumières. piece(x, y, w, h) prend le rectangle EXTÉRIEUR
// (murs compris) et renvoie l'intérieur { x0, y0, x1, y1, cx, cy, w, h }.
// Tout est déterministe (graine = id du niveau) : les deux joueurs d'une co-op voient la même carte.
import { SOL_IDX, SOL_AUCUN, MUR_IDX, K, OBJETS } from './catalogue.js';
import { seedRng } from '../core/rng.js';

export const COTES = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };

export class EtagePlan {
  constructor(plan, id, nom, w, h, o = {}) {
    this.plan = plan; this.id = id; this.nom = nom || id; this.w = w; this.h = h;
    this.monte = o.monte || null; this.descend = o.descend || null;
    const n = w * h;
    const s0 = o.sol === null ? SOL_AUCUN : (SOL_IDX[o.sol || (plan.meta.exterieur ? 'bitume' : 'parquet')] ?? 0);
    this.sol = new Uint8Array(n).fill(s0);
    this.mur = new Uint8Array(n);           // index MURS (0 = aucun)
    this.ouv = new Uint8Array(n);           // K.PORTE / FENETRE / ESC_* / SORTIE / EAU (0 = rien)
    this.int = new Uint8Array(n).fill(o.interieur ? 1 : 0); // case d'intérieur (sous un toit)
    this.force = new Map();                 // i → { bloque, opaque } (forçages de légende)
    this.portes = new Map();                // i → options de porte
    this.sorties = new Map();               // i → { echelle }
    this.objets = []; this.decals = []; this.lumieres = []; this.zombies = []; this.pnj = [];
    this.entrees = {}; this.marqueurs = []; this.solItems = []; this.declencheurs = []; this.nommages = []; this.toits = [];
    this.rng = seedRng(`${plan.meta.id}:${id}`);
  }
  dedans(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  _i(x, y) { return y * this.w + x; }
  _rect(x, y, w, h, fn) {
    for (let yy = Math.max(0, y); yy < Math.min(this.h, y + h); yy++)
      for (let xx = Math.max(0, x); xx < Math.min(this.w, x + w); xx++) fn(yy * this.w + xx, xx, yy);
  }

  // ---------- Couche 1 : sol ----------
  sol_(mat) { const m = SOL_IDX[mat]; if (m == null) throw new Error(`sol inconnu « ${mat} »`); return m; }
  solRect(mat, x, y, w = 1, h = 1) { const m = this.sol_(mat); this._rect(x, y, w, h, (i) => { this.sol[i] = m; }); return this; }
  disque(mat, cx, cy, r) {
    const m = this.sol_(mat);
    this._rect(Math.floor(cx - r), Math.floor(cy - r), Math.ceil(2 * r) + 2, Math.ceil(2 * r) + 2, (i, x, y) => {
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) this.sol[i] = m;
    });
    return this;
  }
  // Chemin d'une largeur donnée le long d'une polyligne [[x,y], …] (centres de cases).
  chemin(mat, pts, larg = 1) {
    const m = this.sol_(mat), r = larg / 2;
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const L = Math.hypot(bx - ax, by - ay) || 1;
      for (let t = 0; t <= L; t += 0.25) {
        const px = ax + (bx - ax) * t / L, py = ay + (by - ay) * t / L;
        this._rect(Math.floor(px - r - 1), Math.floor(py - r - 1), Math.ceil(larg) + 3, Math.ceil(larg) + 3, (i, x, y) => {
          if (Math.max(Math.abs(x + 0.5 - px - 0.5), Math.abs(y + 0.5 - py - 0.5)) <= r) this.sol[i] = m;
        });
      }
    }
    return this;
  }
  // Taches irrégulières d'une matière (terre dans l'herbe…) : densite 0..1.
  taches(mat, x, y, w, h, densite = 0.15, taille = 1.6) {
    const r = this.rng, n = Math.round(w * h * densite / (taille * taille));
    for (let k = 0; k < n; k++) this.disque(mat, x + r() * w, y + r() * h, taille * (0.5 + r()));
    return this;
  }

  // ---------- Couche 2 : murs ----------
  mur_(style) { const m = MUR_IDX[style]; if (m == null) throw new Error(`mur inconnu « ${style} »`); return m; }
  murRect(style, x, y, w = 1, h = 1) { const m = this.mur_(style); this._rect(x, y, w, h, (i) => { if (!this.ouv[i] || this.ouv[i] === K.EAU) { this.mur[i] = m; this.ouv[i] = 0; } }); return this; }
  // Contour d'un rectangle (les ouvertures déjà posées sont respectées).
  contour(style, x, y, w, h) {
    this.murRect(style, x, y, w, 1); this.murRect(style, x, y + h - 1, w, 1);
    this.murRect(style, x, y, 1, h); this.murRect(style, x + w - 1, y, 1, h);
    return this;
  }
  // Ligne de mur horizontale ou verticale entre deux cases (incluses).
  cloison(style, x0, y0, x1, y1) {
    if (y0 === y1) return this.murRect(style, Math.min(x0, x1), y0, Math.abs(x1 - x0) + 1, 1);
    return this.murRect(style, x0, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1);
  }
  vide(x, y, w = 1, h = 1) { const m = this.mur_('vide'); this._rect(x, y, w, h, (i) => { this.sol[i] = SOL_AUCUN; this.mur[i] = m; this.ouv[i] = 0; }); return this; }
  forcer(x, y, o) { if (this.dedans(x, y)) this.force.set(this._i(x, y), { ...(this.force.get(this._i(x, y)) || {}), ...o }); return this; }

  // ---------- Couche 3 : ouvertures ----------
  // Porte : { etat: 'fermee'|'ouverte'|'verrouillee', verrou: 'cle'|{ forcer, crocheter, meca, flag, deux }, nom, marqueur,
  //           exterieure, style: 'bois'|'metal'|'grille'|'vitree'|'double', deux: true (il faut être deux pour l'ouvrir) }
  porte(x, y, o = {}) {
    if (!this.dedans(x, y)) return this;
    const i = this._i(x, y);
    this.ouv[i] = K.PORTE;
    if (!this.mur[i]) this.mur[i] = MUR_IDX[this.plan.meta.exterieur ? 'crepi' : 'platre'];
    let etat = o.etat || ((o.verrou || o.flag || o.deux) ? 'verrouillee' : 'fermee');
    this.portes.set(i, { ...o, etat });
    return this;
  }
  fenetre(x, y, w = 1, h = 1, o = {}) {
    this._rect(x, y, w, h, (i) => { this.ouv[i] = K.FENETRE; if (!this.mur[i]) this.mur[i] = MUR_IDX.platre; if (o.cassee) this.force.set(i, { ...(this.force.get(i) || {}), cassee: true }); });
    return this;
  }
  escalier(sens, x, y, w = 1, h = 1) {
    const k = sens === 'monte' ? K.ESC_MONTE : K.ESC_DESCEND;
    this._rect(x, y, w, h, (i) => { this.ouv[i] = k; this.mur[i] = 0; });
    return this;
  }
  sortie(x, y, w = 1, h = 1, o = {}) {
    this._rect(x, y, w, h, (i) => { this.ouv[i] = K.SORTIE; this.mur[i] = 0; this.sorties.set(i, { echelle: o.echelle || null }); });
    return this;
  }
  eau(x, y, w = 1, h = 1) { const m = SOL_IDX.eau; this._rect(x, y, w, h, (i) => { this.ouv[i] = K.EAU; this.sol[i] = m; this.mur[i] = 0; }); return this; }

  // ---------- Pièces toutes faites ----------
  // piece(x, y, w, h, { nom, sol, mur, sombre, toit, exterieur, portes: [{ cote, a, …porte }], fenetres: [{ cote, a, l }] })
  //   a = décalage le long du côté depuis le coin intérieur (0 = première case intérieure).
  piece(x, y, w, h, o = {}) {
    const mur = o.mur || (this.plan.meta.murInterieur || 'platre');
    if (o.sol !== null) this.solRect(o.sol || (this.plan.meta.exterieur ? 'beton' : 'parquet'), x + 1, y + 1, w - 2, h - 2);
    this.contour(mur, x, y, w, h);
    // sous les murs : même sol (pour les transitions et les portes)
    if (!o.exterieur) this._rect(x, y, w, h, (i) => { this.int[i] = 1; });
    const posCote = (cote, a, l = 1) => {
      if (cote === 'n') return [x + 1 + a, y, l, 1];
      if (cote === 's') return [x + 1 + a, y + h - 1, l, 1];
      if (cote === 'o') return [x, y + 1 + a, 1, l];
      return [x + w - 1, y + 1 + a, 1, l];
    };
    for (const f of o.fenetres || []) { const [fx, fy, fw, fh] = posCote(f.cote, f.a || 0, f.l || 1); this.fenetre(fx, fy, fw, fh, f); }
    for (const p of o.portes || []) { const [px, py] = posCote(p.cote, p.a || 0); this.porte(px, py, p); }
    for (const s of o.ouvertures || []) { const [sx, sy, sw, sh] = posCote(s.cote, s.a || 0, s.l || 1); this._rect(sx, sy, sw, sh, (i) => { this.mur[i] = 0; this.ouv[i] = 0; }); }
    const r = { x0: x + 1, y0: y + 1, x1: x + w - 2, y1: y + h - 2, w: w - 2, h: h - 2, cx: x + w / 2, cy: y + h / 2, X: x, Y: y, W: w, H: h };
    if (o.nom || o.sombre != null || o.sol) this.nommer(r.x0, r.y0, o.nom || null, { sol: o.sol, sombre: o.sombre, exterieur: o.exterieur });
    if (o.toit) this.toits.push({ x, y, w, h, type: o.toit, ref: [r.x0, r.y0] });
    return r;
  }
  // Bâtiment = pièce dont le contour est une façade et qui a un toit (vue de dehors).
  batiment(x, y, w, h, o = {}) { return this.piece(x, y, w, h, { mur: 'crepi', toit: 'tuiles', ...o }); }

  // ---------- Couche 4 : objets ----------
  // objet(type, x, y, { w, h, rot (0..3), nom, conteneur, cat, items, table, marqueur, couleur, variante, eau, bloque, opaque })
  objet(type, x, y, o = {}) {
    const d = OBJETS[type];
    if (!d) throw new Error(`objet inconnu « ${type} »`);
    const rot = ((o.rot || 0) % 4 + 4) % 4;
    let [w, h] = [o.w || d.t[0], o.h || d.t[1]];
    if ((rot === 1 || rot === 3) && !o.w && !o.h) [w, h] = [h, w];
    const ob = { type, x, y, w, h, rot, ...o };
    ob.w = w; ob.h = h;
    if (ob.variante == null) ob.variante = Math.floor(this.rng() * 1000);
    this.objets.push(ob);
    return ob;
  }
  // Une rangée d'objets identiques (tombes, bancs, voitures) : n exemplaires espacés de (dx, dy).
  rangee(type, x, y, n, dx, dy, o = {}) { const out = []; for (let k = 0; k < n; k++) out.push(this.objet(type, x + k * dx, y + k * dy, typeof o === 'function' ? o(k) : o)); return out; }

  // ---------- Couche 5 : décals ----------
  decal(type, x, y, o = {}) { this.decals.push({ type, x, y, r: o.r ?? 0.5, a: o.a ?? this.rng() * Math.PI * 2, s: o.s ?? this.rng(), ...o }); return this; }
  // Éparpille des décals dans un rectangle (feuilles, papiers, gravillons).
  semer(type, x, y, w, h, n, o = {}) { const r = this.rng; for (let k = 0; k < n; k++) this.decal(type, x + r() * w, y + r() * h, typeof o === 'function' ? o(k) : o); return this; }

  // ---------- Couche 6 : lumières ----------
  lumiere(type, x, y, o = {}) { this.lumieres.push({ type, x, y, ...o }); return this; }

  // ---------- Couche 7 : le vivant et l'histoire ----------
  zombie(type, x, y, o = {}) { this.zombies.push({ type: type || null, x, y, etat: o.etat || null, hp: o.hp || null, dir: o.dir }); return this; }
  entree(nom, x, y) { this.entrees[nom] = { x, y }; return this; }
  marqueur(id, x, y, o = {}) { this.marqueurs.push({ id, x, y, ...o }); return this; }
  pnj(id, x, y, o = {}) { this.pnj.push({ id, x, y, si: o.si || null, marqueur: o.marqueur || null, nom: o.nom || null }); if (o.marqueur) this.marqueur(o.marqueur, x, y, { pnj: id }); return this; }
  document(id, x, y, o = {}) { this.solItems.push({ x, y, doc: id, marqueur: o.marqueur || null }); return this; }
  objetSol(id, x, y, qty = 1) { this.solItems.push({ x, y, id, qty }); return this; }
  declencheur(x, y, w, h, o = {}) { this.declencheurs.push({ x, y, w, h, ...o }); return this; }
  nommer(x, y, nom, o = {}) { this.nommages.push({ x, y, nom, ...o }); return this; }
  toit(x, y, w, h, type = 'tuiles') { this.toits.push({ x, y, w, h, type, ref: [x + 1, y + 1] }); return this; }
}

export class Plan {
  constructor(meta = {}) {
    this.meta = { exterieur: false, ...meta };
    this.etages = [];
  }
  etage(id, nom, w, h, o = {}) { const e = new EtagePlan(this, id, nom, w, h, o); this.etages.push(e); return e; }
}

// Fabrique d'un niveau : renvoie la définition attendue par chargerNiveau / parserNiveau.
export function plan(meta, construire) {
  const p = new Plan(meta);
  construire(p);
  return {
    ...meta, format: 'couches', plan: p,
    etages: p.etages.map(e => ({ id: e.id, nom: e.nom, monte: e.monte, descend: e.descend, w: e.w, h: e.h })),
  };
}
