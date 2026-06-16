// ============ Prefabs de cases — le calque de DESSIN générique des intérieurs ============
// Un prefab est un petit dessin SVG au trait (façon plan d'évacuation, comme le mobilier
// historique de map.js) qui s'adapte à une BOÎTE (x, y, w, h en pixels). On les pose
// LIBREMENT dans une case via cd.decor = [{ p:'lit', x, y, w, h, rot?, flip? }] en
// coordonnées NORMALISÉES 0→1 de la cellule — donc indépendantes de sa taille réelle.
//
// Trois primitives génériques, toutes purement VISUELLES (zéro impact sur la logique :
// adjacence, déplacement, zombies, co-op restent pilotés par la grille de cases) :
//   • cd.decor    : prefabs posés (lit, armoire, WC…)            → dessinerDecor()
//   • cd.cloisons : murs INTERNES (+ porte) dans une case        → dessinerCloisons()
//   • cd.creux    : zone de la case rendue comme du MUR/vide     → dessinerCreux()
//                   (cage d'escalier étroite, recoin, pièce en L)
//
// Le trait/colori vient de la classe CSS `.mob` (fill:none; stroke:#6f6757; opacity:.72) ;
// on ne pose un `fill` inline que pour les volumes qui « reposent » sur le sol (lit, cuve…).

// ---------- Registre de prefabs : (x, y, w, h) => fragment SVG dans la boîte ----------
const SOL = '#15120e'; // remplissage sombre d'un meuble posé au sol (sous le trait clair)

export const PREFABS = {
  // ----- chambre / séjour -----
  lit: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${SOL}"/>
    <rect x="${x + w * .14}" y="${y + h * .07}" width="${w * .72}" height="${h * .16}" rx="2"/>
    <line x1="${x}" y1="${y + h * .34}" x2="${x + w}" y2="${y + h * .34}"/>`,
  lit_double: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${SOL}"/>
    <rect x="${x + w * .1}" y="${y + h * .07}" width="${w * .34}" height="${h * .15}" rx="2"/>
    <rect x="${x + w * .56}" y="${y + h * .07}" width="${w * .34}" height="${h * .15}" rx="2"/>
    <line x1="${x}" y1="${y + h * .32}" x2="${x + w}" y2="${y + h * .32}"/>
    <line x1="${x + w / 2}" y1="${y + h * .32}" x2="${x + w / 2}" y2="${y + h}"/>`,
  lits: (x, y, w, h) => PREFABS.lit(x, y, w * .46, h) + PREFABS.lit(x + w * .54, y, w * .46, h),
  armoire: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${SOL}"/>
    <line x1="${x + w / 2}" y1="${y + h * .12}" x2="${x + w / 2}" y2="${y + h * .88}"/>
    <circle cx="${x + w / 2 - w * .07}" cy="${y + h / 2}" r="1.2"/><circle cx="${x + w / 2 + w * .07}" cy="${y + h / 2}" r="1.2"/>`,
  commode: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${SOL}"/>
    <line x1="${x}" y1="${y + h / 3}" x2="${x + w}" y2="${y + h / 3}"/><line x1="${x}" y1="${y + h * 2 / 3}" x2="${x + w}" y2="${y + h * 2 / 3}"/>
    <circle cx="${x + w / 2}" cy="${y + h / 6}" r="1.1"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="1.1"/><circle cx="${x + w / 2}" cy="${y + h * 5 / 6}" r="1.1"/>`,
  bureau: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h * .5}" rx="1.5" fill="${SOL}"/>
    <circle cx="${x + w / 2}" cy="${y + h * .8}" r="${Math.min(w, h) * .16}"/>`,
  chaise: (x, y, w, h) => `<rect x="${x + w * .15}" y="${y + h * .25}" width="${w * .7}" height="${h * .6}" rx="1.5"/>
    <line x1="${x + w * .15}" y1="${y + h * .25}" x2="${x + w * .15}" y2="${y + h * .1}"/>`,
  table: (x, y, w, h) => { const r = Math.min(w, h) * .38, cx = x + w / 2, cy = y + h / 2;
    return `<circle cx="${cx}" cy="${cy}" r="${r}"/>
      <line x1="${cx - r}" y1="${cy}" x2="${cx - r - 3}" y2="${cy}"/><line x1="${cx + r}" y1="${cy}" x2="${cx + r + 3}" y2="${cy}"/>
      <line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy - r - 3}"/><line x1="${cx}" y1="${cy + r}" x2="${cx}" y2="${cy + r + 3}"/>`; },
  canape: (x, y, w, h) => { const rd = Math.min(w, h) * .2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rd}" fill="${SOL}"/>
      <rect x="${x + w * .12}" y="${y + h * .32}" width="${w * .76}" height="${h * .5}" rx="${rd * .6}"/>
      <line x1="${x + w / 2}" y1="${y + h * .32}" x2="${x + w / 2}" y2="${y + h * .82}"/>`; },
  tapis: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" stroke-dasharray="4 3"/>
    <rect x="${x + 4}" y="${y + 4}" width="${Math.max(0, w - 8)}" height="${Math.max(0, h - 8)}" rx="1.5" opacity=".5"/>`,
  etagere: (x, y, w, h) => [0, 1, 2].map(i =>
    `<line x1="${x}" y1="${y + h * (i + .5) / 3}" x2="${x + w}" y2="${y + h * (i + .5) / 3}"/>`).join('')
    + `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}"/><line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}"/>`,
  plante: (x, y, w, h) => { const cx = x + w / 2;
    return `<path d="M${x + w * .32} ${y + h}H${x + w * .68}L${x + w * .6} ${y + h * .62}H${x + w * .4}Z" fill="${SOL}"/>
      <circle cx="${cx}" cy="${y + h * .4}" r="${w * .2}"/><circle cx="${cx - w * .16}" cy="${y + h * .5}" r="${w * .15}"/><circle cx="${cx + w * .16}" cy="${y + h * .5}" r="${w * .15}"/>`; },

  // ----- salle de bain -----
  wc: (x, y, w, h) => `<rect x="${x + w * .22}" y="${y}" width="${w * .56}" height="${h * .26}" rx="1.5" fill="${SOL}"/>
    <ellipse cx="${x + w / 2}" cy="${y + h * .64}" rx="${w * .32}" ry="${h * .3}" fill="${SOL}"/>`,
  lavabo: (x, y, w, h) => `<rect x="${x}" y="${y + h * .2}" width="${w}" height="${h * .62}" rx="${w * .22}" fill="${SOL}"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h * .2}"/>
    <circle cx="${x + w / 2}" cy="${y + h * .5}" r="1.4"/>`,
  baignoire: (x, y, w, h) => { const rd = Math.min(w, h) * .28;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rd}" fill="${SOL}"/>
      <rect x="${x + 3}" y="${y + 3}" width="${Math.max(0, w - 6)}" height="${Math.max(0, h - 6)}" rx="${rd * .7}"/>
      <circle cx="${x + w * .82}" cy="${y + h / 2}" r="1.6"/>`; },
  douche: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5"/>
    <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" opacity=".5"/>
    <circle cx="${x + w / 2}" cy="${y + h / 2}" r="1.6"/>`,

  // ----- cuisine -----
  evier: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${SOL}"/>
    <rect x="${x + w * .08}" y="${y + h * .25}" width="${w * .38}" height="${h * .5}" rx="1.5"/>
    <rect x="${x + w * .54}" y="${y + h * .25}" width="${w * .38}" height="${h * .5}" rx="1.5"/>`,
  cuisiniere: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${SOL}"/>
    ${[[.3, .3], [.7, .3], [.3, .7], [.7, .7]].map(([a, b]) => `<circle cx="${x + w * a}" cy="${y + h * b}" r="${Math.min(w, h) * .11}"/>`).join('')}`,
  frigo: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${SOL}"/>
    <line x1="${x}" y1="${y + h * .42}" x2="${x + w}" y2="${y + h * .42}"/>
    <line x1="${x + w * .8}" y1="${y + h * .1}" x2="${x + w * .8}" y2="${y + h * .32}"/>`,

  // ----- circulation -----
  // Une cage d'escalier ÉTROITE : à poser dans une boîte fine (souvent collée à un mur),
  // le reste de la case étant comblé par un cd.creux pour le rendu « cage » resserrée.
  cage_escalier: (x, y, w, h) => { const n = 6; let r = '';
    for (let i = 1; i <= n; i++) r += `<line x1="${x}" y1="${y + h * i / (n + 1)}" x2="${x + w}" y2="${y + h * i / (n + 1)}"/>`;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}"/><line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}"/>${r}`; },
};

// ---------- Rendu des trois calques (appelés depuis map.js, en coords CELLULE px) ----------

// Prefabs posés : itère cd.decor et dessine chaque prefab dans sa boîte (rot/flip optionnels).
export function dessinerDecor(decor, cellX, cellY, cellW, cellH) {
  if (!Array.isArray(decor) || !decor.length) return '';
  let s = '';
  for (const d of decor) {
    const fn = PREFABS[d.p];
    if (!fn) continue;
    const bx = cellX + (d.x || 0) * cellW, by = cellY + (d.y || 0) * cellH;
    const bw = (d.w != null ? d.w : .3) * cellW, bh = (d.h != null ? d.h : .3) * cellH;
    let art = fn(bx, by, bw, bh, d);
    if (d.flip) art = `<g transform="translate(${2 * bx + bw} 0) scale(-1 1)">${art}</g>`;
    if (d.rot) art = `<g transform="rotate(${d.rot} ${bx + bw / 2} ${by + bh / 2})">${art}</g>`;
    s += art;
  }
  return `<g class="mob decor">${s}</g>`;
}

// Zones « creuses » : une partie de la case rendue comme du MUR/vide (cage étroite, recoin,
// pièce en L). Purement visuel : la case reste une cellule jouable entière.
export function dessinerCreux(creux, cellX, cellY, cellW, cellH) {
  if (!Array.isArray(creux) || !creux.length) return '';
  let s = '';
  for (const r of creux) {
    const bx = cellX + (r.x || 0) * cellW, by = cellY + (r.y || 0) * cellH;
    const bw = (r.w || 0) * cellW, bh = (r.h || 0) * cellH;
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#0f0f11" stroke="#15140f" stroke-width="1"/>`;
  }
  return s;
}

// Cloisons internes : segments de mur DANS une case, avec une porte optionnelle (porte =
// position 0→1 le long du segment où l'on perce une ouverture). Trait plus fin et plus clair
// que les murs porteurs, pour distinguer une simple séparation (salle de bain) d'un mur d'enceinte.
export function dessinerCloisons(cloisons, cellX, cellY, cellW, cellH) {
  if (!Array.isArray(cloisons) || !cloisons.length) return '';
  let s = '';
  for (const w of cloisons) {
    const x1 = cellX + w.x1 * cellW, y1 = cellY + w.y1 * cellH, x2 = cellX + w.x2 * cellW, y2 = cellY + w.y2 * cellH;
    if (w.porte != null) {
      const t = Math.max(0, Math.min(1, w.porte));
      const gx = x1 + (x2 - x1) * t, gy = y1 + (y2 - y1) * t;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len, half = 7;
      s += `<line x1="${x1}" y1="${y1}" x2="${gx - ux * half}" y2="${gy - uy * half}"/>`;
      s += `<line x1="${gx + ux * half}" y1="${gy + uy * half}" x2="${x2}" y2="${y2}"/>`;
    } else {
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
  }
  return `<g fill="none" stroke="#43392b" stroke-width="2.4" stroke-linecap="round">${s}</g>`;
}

// ---------- Meublage AUTOMATIQUE générique (calque de dessin par défaut) ----------
// Quand une case n'a pas de cd.decor explicite, on DÉDUIT un agencement de prefabs de son
// type/nom : escalier → cage étroite (partout), chambre → lit + salle de bain dessinée, cuisine
// → cuisinière/évier/frigo, etc. Surchargeable : un cd.decor explicite (ou un cd.mob) reprend la
// main, et une pièce non reconnue retombe sur le mobilier historique (aucune régression).
// PARTAGÉ moteur (map.js) + éditeur (editeur.js) : un seul endroit pour la politique de meublage.
export const SDB_CLOISONS = [{ x1: .6, y1: 0, x2: .6, y2: .4 }, { x1: .6, y1: .4, x2: 1, y2: .4, porte: .78 }];
export const SDB_COIN = [{ p: 'lavabo', x: .64, y: .08, w: .12, h: .12 }, { p: 'wc', x: .8, y: .07, w: .14, h: .2 }];
export const FURNISH = [
  [/dortoir/i, () => ({ decor: [{ p: 'lits', x: .1, y: .12, w: .8, h: .32 }, { p: 'lits', x: .1, y: .56, w: .8, h: .32 }] })],
  [/chambre|suite/i, () => ({ decor: [{ p: 'lit', x: .1, y: .46, w: .4, h: .46 }, { p: 'armoire', x: .1, y: .08, w: .32, h: .13 }, ...SDB_COIN], cloisons: SDB_CLOISONS })],
  [/salle de bain|sanitaire|toilette|douche|lavabo|\bwc\b/i, () => ({ decor: [{ p: 'douche', x: .1, y: .12, w: .3, h: .38 }, { p: 'lavabo', x: .54, y: .12, w: .18, h: .18 }, { p: 'wc', x: .78, y: .12, w: .16, h: .28 }] })],
  [/cuisine|fourneau/i, () => ({ decor: [{ p: 'cuisiniere', x: .08, y: .52, w: .34, h: .4 }, { p: 'evier', x: .48, y: .54, w: .38, h: .3 }, { p: 'frigo', x: .74, y: .08, w: .2, h: .36 }] })],
  [/réserve|reserve|stock|cellier|remise|arrière-boutique|combles|grenier|\bcave\b|lingerie/i, () => ({ decor: [{ p: 'etagere', x: .08, y: .1, w: .84, h: .22 }, { p: 'etagere', x: .08, y: .52, w: .84, h: .22 }] })],
  [/bureau|cabinet|secrétariat|secretariat/i, () => ({ decor: [{ p: 'bureau', x: .16, y: .22, w: .42, h: .52 }, { p: 'etagere', x: .66, y: .1, w: .26, h: .62 }] })],
  [/salon|réfectoire|refectoire|restaurant|café|cafe|déjeuner|dejeuner/i, () => ({ decor: [{ p: 'table', x: .3, y: .3, w: .4, h: .4 }, { p: 'canape', x: .06, y: .62, w: .34, h: .28 }] })],
];
export function autoDecor(cd) {
  if (cd.decor) return null;            // un calque de dessin explicite reprend toute la main
  if (cd.t === 'escalier') return { decor: [{ p: 'cage_escalier', x: .12, y: .08, w: .4, h: .84 }], creux: [{ x: .58, y: 0, w: .42, h: 1 }] };
  if (cd.t !== 'piece' || cd.mob) return null; // mobilier explicite (ou null) : on garde le rendu historique
  const nom = cd.nom || '';
  for (const [re, fn] of FURNISH) if (re.test(nom)) return fn(cd);
  return null;                          // pièce non reconnue → mobilier historique (pas de régression)
}
