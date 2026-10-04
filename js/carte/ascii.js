// ============ Ancien format ASCII (REFONTE §4.2, docs/NIVEAUX.md) → Plan à couches ============
// asciiVersPlan(def) → Plan. Les 45 plans existants profitent ainsi du nouveau moteur (murs typés, objets
// dessinés, toits, lumières) sans être réécrits. Les nouveaux niveaux s'écrivent directement avec js/carte/plan.js.
import { Plan } from './plan.js';
import { K, SOL_IDX, SOL_AUCUN, MUR_IDX, OBJETS, OBJET_PAR_CAR } from './catalogue.js';
import { REGLAGES } from '../data/reglages.js';

// Hachage stable (même carte pour les deux joueurs, d'une partie à l'autre).
const hache = (s) => { let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; };

// Légende globale de l'ancien format
const GLOBALE = {
  ' ': { k: K.VIDE }, '#': { k: K.MUR }, '.': { k: K.SOL }, ',': { k: K.SOL, ext: 'bitume' }, '"': { k: K.SOL, ext: 'herbe' },
  ':': { k: K.SOL, ext: 'gravier' }, '~': { k: K.EAU }, '+': { k: K.PORTE, etat: 'fermee' }, '/': { k: K.PORTE, etat: 'ouverte' },
  'X': { k: K.PORTE, etat: 'verrouillee' }, '|': { k: K.FENETRE }, '<': { k: K.ESC_MONTE }, '>': { k: K.ESC_DESCEND },
  'E': { k: K.SORTIE }, '@': { k: K.SOL, entree: 'defaut' }, 'Z': { k: K.SOL, zombie: true },
};
export const CARS_GLOBAUX = Object.keys(GLOBALE).concat(Object.keys(OBJET_PAR_CAR));
const CLASSE = { '.': 1, ',': 2, '"': 3, ':': 4 };
const EXT = new Set([',', '"', ':', '~', 'T', 'v']);
// Murs d'extérieur par défaut selon le lieu (pierre sèche des vieux villages, crépi provençal en ville)
const MUR_EXT_PIERRE = new Set(['cimetiere', 'emperi', 'vernegues', 'cales', 'saint_laurent', 'senas', 'cornillon', 'aurons', 'miramas_le_vieux', 'la_barben', 'eyguieres', 'saint_michel', 'mallemort']);

function propDesc(nom) {
  const p = OBJETS[nom];
  return { k: p.decor ? K.SOL : K.MEUBLE, prop: nom, decor: !!p.decor };
}
function resoudre(ch, legende, avert) {
  const L = legende && Object.prototype.hasOwnProperty.call(legende, ch) ? legende[ch] : null;
  if (!L) {
    if (GLOBALE[ch]) return GLOBALE[ch];
    if (OBJET_PAR_CAR[ch]) return propDesc(OBJET_PAR_CAR[ch]);
    return null;
  }
  if (typeof L !== 'object') { avert(`légende '${ch}' : entrée invalide`); return { k: K.SOL }; }
  let d;
  if (L.comme) d = { ...(GLOBALE[L.comme] || (OBJET_PAR_CAR[L.comme] ? propDesc(OBJET_PAR_CAR[L.comme]) : { k: K.SOL })) };
  else if (L.porte) d = { k: K.PORTE, etat: L.etat || ((L.verrou || L.flag) ? 'verrouillee' : 'fermee') };
  else if (L.prop) {
    if (!OBJETS[L.prop]) { avert(`légende '${ch}' : prop inconnue « ${L.prop} » (rendue comme une caisse)`); d = { ...propDesc('caisson') }; }
    else d = propDesc(L.prop);
  } else if (L.mur) d = { k: K.MUR };
  else if (L.eau && L.bloque) d = { k: K.EAU };
  else d = { k: K.SOL };
  return { ...d, leg: L };
}

export function asciiVersPlan(def, avert = () => {}) {
  const ext = !!def.exterieur;
  const p = new Plan({
    id: def.id, nom: def.nom || def.id, exterieur: ext, typeButin: def.typeButin, pool: def.pool, morts: def.morts,
    murInterieur: def.murInterieur || 'platre',
  });
  const murExt = def.murExterieur || (MUR_EXT_PIERRE.has(def.id) ? 'pierre' : 'crepi');
  const murInt = def.murInterieur || 'platre';
  const legende = def.legende || {};
  for (const ed of Array.isArray(def.etages) ? def.etages : []) {
    const plan = Array.isArray(ed.plan) ? ed.plan : [];
    const h = plan.length, w = plan.reduce((m, l) => Math.max(m, String(l).length), 0);
    const e = p.etage(ed.id, ed.nom, w, h, { monte: ed.monte, descend: ed.descend, sol: ext ? 'bitume' : 'parquet' });
    const n = w * h;
    const car = new Array(n), desc = new Array(n);
    e.classeSol = new Uint8Array(n);       // '.' ',' '"' ':' → 1..4 (matières recalculées après les pièces)
    e.solForce = new Map();                 // matière imposée par la légende
    for (let y = 0; y < h; y++) {
      const ligne = String(plan[y]);
      for (let x = 0; x < w; x++) {
        const ch = x < ligne.length ? ligne[x] : ' ';
        const i = y * w + x;
        car[i] = ch;
        let d = resoudre(ch, legende, avert);
        if (!d) { avert(`${ed.id} (${x},${y}) : caractère inconnu « ${ch} » (traité comme sol)`); d = { k: K.SOL }; }
        desc[i] = d;
        e.classeSol[i] = CLASSE[ch] || 0;
        const L = d.leg;
        e.int[i] = ch === '.' || (L && L.comme === '.') ? 1 : EXT.has(ch) || (L && EXT.has(L.comme)) ? 0 : 2;
        if (L && L.sol && SOL_IDX[L.sol] != null) e.solForce.set(i, SOL_IDX[L.sol]);
        if (L && (L.bloque != null || L.opaque != null)) e.force.set(i, { bloque: L.bloque, opaque: L.opaque });
        switch (d.k) {
          case K.VIDE: e.sol[i] = SOL_AUCUN; break;
          case K.MUR: e.mur[i] = 1; break; // style fixé plus bas
          case K.EAU: e.ouv[i] = K.EAU; e.sol[i] = SOL_IDX.eau; break;
          case K.PORTE: e.ouv[i] = K.PORTE; e.mur[i] = 1; e.portes.set(i, { etat: d.etat, verrou: L && L.verrou, flag: L && L.flag, exterieure: L && L.exterieure, marqueur: L && L.marqueur, nom: L && L.nom, deux: L && L.deux, style: L && L.style }); break;
          case K.FENETRE: e.ouv[i] = K.FENETRE; e.mur[i] = 1; break;
          case K.ESC_MONTE: case K.ESC_DESCEND: e.ouv[i] = d.k; break;
          case K.SORTIE: e.ouv[i] = K.SORTIE; e.sorties.set(i, { echelle: (L && L.echelle) || null }); break;
          default: break;
        }
        if (d.k === K.SOL || d.k === K.PORTE || d.k === K.SORTIE) {
          if (d.entree === 'defaut' && !e.entrees.defaut) e.entrees.defaut = { x, y };
          if (d.zombie) e.zombies.push({ type: null, x, y, etat: null });
          if (L) {
            if (L.entree) e.entrees[L.entree] = { x, y };
            if (L.zombie) e.zombies.push({ type: L.zombie, x, y, etat: L.etat || null, hp: L.hp || null, dir: L.dir });
            if (L.pnj) e.pnj.push({ id: L.pnj, x, y, si: L.si || null, marqueur: L.marqueur || null, nom: L.nom || null });
            if (L.document) e.solItems.push({ x, y, doc: L.document, marqueur: L.marqueur || null });
            if (L.objet) { const o = Array.isArray(L.objet) ? { id: L.objet[0], qty: L.objet[1] || 1 } : { id: L.objet, qty: 1 }; e.solItems.push({ x, y, ...o }); }
            if (L.marqueur && d.k !== K.PORTE && !(d.prop && !d.decor)) e.marqueurs.push({ id: L.marqueur, x, y, eau: L.eau || null, pnj: L.pnj || null, meuble: false });
          }
        }
      }
    }
    // Objets : cases identiques adjacentes = un seul meuble (décor : une case = un objet)
    const vu = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const d = desc[i];
      if (!d.prop || vu[i]) continue;
      const x = i % w, y = (i / w) | 0;
      const L = d.leg || null;
      if (d.decor) {
        vu[i] = 1;
        e.objets.push({ type: d.prop, x, y, w: 1, h: 1, rot: 0, variante: (x * 31 + y * 17) % 1000 });
        continue;
      }
      const cases = [i]; vu[i] = 1;
      for (let a = 0; a < cases.length; a++) {
        const j = cases[a], cx = j % w, cy = (j / w) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const k = ny * w + nx;
          if (!vu[k] && car[k] === car[i] && desc[k].prop && !desc[k].decor) { vu[k] = 1; cases.push(k); }
        }
      }
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (const j of cases) { const cx = j % w, cy = (j / w) | 0; if (cx < x0) x0 = cx; if (cy < y0) y0 = cy; if (cx > x1) x1 = cx; if (cy > y1) y1 = cy; }
      const plein = cases.length === (x1 - x0 + 1) * (y1 - y0 + 1);
      const cont = L && L.conteneur;
      // Étagères ordinaires (ni butin imposé, ni marqueur) : petites étagères, la plupart vides et non fouillables.
      const ET = REGLAGES.exploration.ETAGERES;
      const longue = Math.max(x1 - x0 + 1, y1 - y0 + 1), ligne = Math.min(x1 - x0 + 1, y1 - y0 + 1) === 1;
      if (OBJETS[d.prop] && OBJETS[d.prop].cat === 'etagere' && plein && ligne && longue > ET.SEGMENT && !(cont && (cont.items || cont.table)) && !(L && L.marqueur)) {
        const horiz = x1 > x0, pVide = (ET.PAR_BUTIN || {})[def.typeButin] ?? ET.VIDES;
        for (let a = 0; a < longue;) {
          let l = Math.min(ET.SEGMENT, longue - a); if (longue - a - l === 1) l++;   // jamais d'étagère d'une case en bout de rangée
          const sx = horiz ? x0 + a : x0, sy = horiz ? y0 : y0 + a;
          const vide = hache(`${def.id}:${ed.id}:${sx}:${sy}`) < pVide;
          e.objets.push({
            type: d.prop, x: sx, y: sy, w: horiz ? l : 1, h: horiz ? 1 : l, rot: 0, cases: null, car: car[i],
            nom: vide ? `${(L && L.nom) || OBJETS[d.prop].nom} (vide)` : L && L.nom, conteneur: vide ? false : cont, cat: cont && cont.categorie,
            vide, variante: (sx * 131 + sy * 977) % 1000, ascii: true,
          });
          a += l;
        }
        continue;
      }
      e.objets.push({
        type: d.prop, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, rot: 0, cases: plein ? null : cases, car: car[i],
        nom: L && L.nom, conteneur: cont, cat: cont && cont.categorie, marqueur: L && L.marqueur, eau: L && L.eau,
        variante: (x0 * 131 + y0 * 977) % 1000, ascii: true,
      });
    }
    // Styles de murs : façade si le mur touche l'extérieur, cloison sinon
    for (let i = 0; i < n; i++) {
      if (!e.mur[i]) continue;
      const x = i % w, y = (i / w) | 0;
      let dehors = false, dedans = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const c = car[ny * w + nx], iv = e.int[ny * w + nx];
        if (EXT.has(c) || iv === 0) dehors = true; else if (c === '.' || iv === 1) dedans = true;
      }
      const style = dehors ? murExt : dedans ? murInt : (ext ? murExt : murInt);
      e.mur[i] = MUR_IDX[style] || 1;
    }
    // Pièces nommées
    for (const pd of def.pieces || []) if (pd.etage === ed.id) e.nommages.push({ x: pd.x, y: pd.y, nom: pd.nom, sol: pd.sol, sombre: pd.sombre, exterieur: pd.exterieur });
    // Déclencheurs de zone
    for (const dz of def.declencheurs || []) if (dz.etage === ed.id) e.declencheurs.push({ ...dz });
    e.car = car;
  }
  // Déclencheurs d'étages inconnus
  (def.declencheurs || []).forEach((dz, i) => { if (!(def.etages || []).some(x => x.id === dz.etage)) avert(`déclencheur #${i} : étage inconnu « ${dz.etage} »`); });
  p.ascii = true;
  p.solDefaut = def.solDefaut || (ext ? 'beton' : 'parquet');
  p.toitsAuto = def.toits !== false;
  return p;
}

// Après le calcul des pièces : matières du sol selon la pièce (règles de l'ancien format).
export function solsAscii(niv, E, P, solDefaut) {
  const { w, h } = E, cls = P.classeSol;
  const voisin = (i) => {
    const x0 = i % w, y0 = (i / w) | 0;
    for (let r = 1; r <= 3; r++) {
      const cpt = [0, 0, 0, 0, 0], ordre = [];
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = x0 + dx, y = y0 + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const c = cls[y * w + x];
        if (c && !cpt[c]) ordre.push(c);
        cpt[c]++;
      }
      let best = 0, bn = 0;
      for (const c of ordre) if (cpt[c] > bn) { bn = cpt[c]; best = c; } // à égalité : la première rencontrée (comme avant)
      if (best) return best;
    }
    return 1;
  };
  for (let i = 0; i < w * h; i++) {
    if (E.code[i] === K.VIDE || E.code[i] === K.EAU) continue;
    if (P.solForce.has(i)) { E.sol[i] = P.solForce.get(i); continue; }
    const Pc = E.piece[i] >= 0 ? niv.pieces[E.piece[i]] : null;
    const c = cls[i] || voisin(i);
    let m;
    if (c === 3) m = (Pc && Pc.sol === 'terre') ? 'terre' : (Pc && Pc.sol === 'herbe_seche') ? 'herbe_seche' : 'herbe';
    else if (c === 4) m = 'gravier';
    else if (c === 2) m = (Pc && ['bitume', 'paves', 'beton', 'terre', 'dalles', 'trottoir', 'sable'].includes(Pc.sol)) ? Pc.sol : 'bitume';
    else m = (Pc && Pc.sol) || (Pc && Pc.exterieur ? 'paves' : solDefaut);
    E.sol[i] = SOL_IDX[m] ?? 0;
    if (P.car && P.car[i] === ';') E.deco[i] = 3;
  }
}
