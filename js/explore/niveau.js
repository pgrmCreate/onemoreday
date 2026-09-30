// ============ Plans d'exploration — parseur et validateur du format ASCII (REFONTE §4.2) ============
// parserNiveau(def) → niveau (grilles typées par étage, pièces, meubles groupés, portes, escaliers appariés,
// entrées, sorties, marqueurs, spawns, PNJ, objets/documents au sol, déclencheurs de zone).
// validerNiveau(def, ctx?) → [erreurs] (chaînes lisibles). Aucune dépendance au DOM : utilisable sous Node.
// Un plan mal formé ne fait jamais planter : parserNiveau collecte des avertissements (niveau.avertissements).

// ---------- Codes de cases ----------
export const K = { VIDE: 0, MUR: 1, SOL: 2, EAU: 3, PORTE: 4, FENETRE: 5, ESC_MONTE: 6, ESC_DESCEND: 7, SORTIE: 8, MEUBLE: 9 };

// Matières de sol (index = valeur stockée dans etage.sol)
export const MATIERES = ['parquet', 'carrelage', 'moquette', 'beton', 'lino', 'tomettes', 'terre', 'bitume', 'paves',
  'herbe', 'gravier', 'eau', 'marbre', 'debris'];
export const MAT = Object.fromEntries(MATIERES.map((m, i) => [m, i]));

// ---------- Mobilier : nom de prop → description ----------
// cat = catégorie de butin (null = pas un conteneur) ; bloque / opaque ; nom = libellé avec article.
export const PROPS = {
  table:      { c: 't', cat: 'table', bloque: 1, nom: 'la table' },
  comptoir:   { c: 'r', cat: 'comptoir', bloque: 1, nom: 'le comptoir' },
  cuisine:    { c: 'k', cat: 'cuisine', bloque: 1, nom: 'les placards' },
  etagere:    { c: 's', cat: 'etagere', bloque: 1, nom: 'l\'étagère' },
  armoire:    { c: 'a', cat: 'vetements', bloque: 1, nom: 'l\'armoire' },
  frigo:      { c: 'f', cat: 'frigo', bloque: 1, nom: 'le frigo' },
  bureau:     { c: 'd', cat: 'bureau', bloque: 1, nom: 'le bureau' },
  caisse:     { c: 'g', cat: 'caisse', bloque: 1, nom: 'la caisse' },
  poubelle:   { c: 'o', cat: 'poubelle', bloque: 1, nom: 'la poubelle' },
  machine:    { c: 'm', cat: 'machine', bloque: 1, nom: 'la machine' },
  lit:        { c: 'b', cat: 'lit', bloque: 1, nom: 'le lit' },
  canape:     { c: 'p', cat: 'canape', bloque: 1, nom: 'le canapé' },
  banc:       { c: 'n', cat: null, bloque: 1, nom: 'le banc' },
  lavabo:     { c: 'w', cat: 'salle_de_bain', bloque: 1, nom: 'le lavabo' },
  baignoire:  { c: 'h', cat: 'salle_de_bain', bloque: 1, nom: 'la baignoire' },
  chaise:     { c: 'c', cat: null, bloque: 0, nom: 'la chaise', decor: 1 },
  cadavre:    { c: '%', cat: null, bloque: 0, nom: 'le corps', decor: 1 },
  debris:     { c: ';', cat: null, bloque: 0, nom: 'les débris', decor: 1 },
  voiture:    { c: 'v', cat: 'voiture', bloque: 1, nom: 'la voiture' },
  gravats:    { c: 'x', cat: null, bloque: 1, nom: 'les gravats' },
  arbre:      { c: 'T', cat: null, bloque: 1, opaque: 1, nom: 'l\'arbre' },
  tombe:      { c: '=', cat: null, bloque: 1, nom: 'la tombe' },
  // Props disponibles uniquement via `legende` ({ prop: 'caveau' }) :
  caveau:     { cat: null, bloque: 1, opaque: 1, nom: 'le caveau' },
  pilier:     { cat: null, bloque: 1, opaque: 1, nom: 'le pilier' },
  haie:       { cat: null, bloque: 1, opaque: 1, nom: 'la haie' },
  grille:     { cat: null, bloque: 1, nom: 'la grille' },
  barriere:   { cat: null, bloque: 1, nom: 'la barrière' },
  cheminee:   { cat: null, bloque: 1, nom: 'la cheminée' },
  autel:      { cat: null, bloque: 1, nom: 'l\'autel' },
  statue:     { cat: null, bloque: 1, opaque: 1, nom: 'la statue' },
  fontaine:   { cat: null, bloque: 1, nom: 'la fontaine' },
  tente:      { cat: 'caisse', bloque: 1, nom: 'la tente' },
  generateur: { cat: 'machine', bloque: 1, nom: 'le groupe électrogène' },
  conteneur:  { cat: 'machine', bloque: 1, opaque: 1, nom: 'le conteneur' },
  cercueil:   { cat: null, bloque: 1, nom: 'le cercueil' },
  brancard:   { cat: 'lit', bloque: 1, nom: 'le brancard' },
  cloche:     { cat: null, bloque: 1, nom: 'la cloche' },
  piano:      { cat: null, bloque: 1, nom: 'le piano' },
  palette:    { cat: 'caisse', bloque: 1, nom: 'la palette' },
  caisson:    { cat: 'caisse', bloque: 1, nom: 'la caisse' },
};
const PROP_PAR_CHAR = Object.fromEntries(Object.entries(PROPS).filter(([, p]) => p.c).map(([n, p]) => [p.c, n]));

// ---------- Légende globale ----------
const GLOBALE = {
  ' ': { k: K.VIDE },
  '#': { k: K.MUR },
  '.': { k: K.SOL },
  ',': { k: K.SOL, ext: 'bitume' },
  '"': { k: K.SOL, ext: 'herbe' },
  ':': { k: K.SOL, ext: 'gravier' },
  '~': { k: K.EAU },
  '+': { k: K.PORTE, etat: 'fermee' },
  '/': { k: K.PORTE, etat: 'ouverte' },
  'X': { k: K.PORTE, etat: 'verrouillee' },
  '|': { k: K.FENETRE },
  '<': { k: K.ESC_MONTE },
  '>': { k: K.ESC_DESCEND },
  'E': { k: K.SORTIE },
  '@': { k: K.SOL, entree: 'defaut' },
  'Z': { k: K.SOL, zombie: true },
};
export const CARS_GLOBAUX = Object.keys(GLOBALE).concat(Object.keys(PROP_PAR_CHAR));
const SOL_CHARS = new Set(['.', ',', '"', ':']);

export const cleCase = (etage, x, y) => `${etage}:${x},${y}`;

// ---------- Résolution d'un caractère en descripteur ----------
function resoudre(ch, legende, avert) {
  const L = legende && Object.prototype.hasOwnProperty.call(legende, ch) ? legende[ch] : null;
  if (!L) {
    if (GLOBALE[ch]) return GLOBALE[ch];
    if (PROP_PAR_CHAR[ch]) return propDesc(PROP_PAR_CHAR[ch]);
    return null;
  }
  if (typeof L !== 'object') { avert(`légende '${ch}' : entrée invalide`); return { k: K.SOL }; }
  let d;
  if (L.comme) {
    d = { ...(GLOBALE[L.comme] || (PROP_PAR_CHAR[L.comme] ? propDesc(PROP_PAR_CHAR[L.comme]) : { k: K.SOL })) };
  } else if (L.porte) {
    d = { k: K.PORTE, etat: L.etat || ((L.verrou || L.flag) ? 'verrouillee' : 'fermee') };
  } else if (L.prop) {
    if (!PROPS[L.prop]) { avert(`légende '${ch}' : prop inconnue « ${L.prop} » (rendue comme une caisse)`); d = { ...propDesc('caisson'), prop: L.prop }; }
    else d = propDesc(L.prop);
  } else if (L.mur) d = { k: K.MUR };
  else if (L.eau && L.bloque) d = { k: K.EAU };
  else d = { k: K.SOL };
  d = { ...d, leg: L };
  if (L.sol) d.sol = L.sol;
  if (L.bloque != null) d.bloque = L.bloque ? 1 : 0;
  if (L.opaque != null) d.opaque = L.opaque ? 1 : 0;
  return d;
}
function propDesc(nom) {
  const p = PROPS[nom];
  if (p.decor) return { k: K.SOL, deco: nom, prop: nom };
  return { k: K.MEUBLE, prop: nom, cat: p.cat, bloque: p.bloque, opaque: p.opaque || 0 };
}

// ---------- Parseur ----------
export function parserNiveau(def) {
  const avertissements = [];
  const avert = (m) => avertissements.push(m);
  const niv = {
    id: def.id, nom: def.nom || def.id, exterieur: !!def.exterieur,
    typeButin: def.typeButin || null, pool: def.pool || null, morts: def.morts || null, def,
    etages: [], etageIdx: {}, pieces: [], meubles: [], meubleParCle: {}, portes: [], porteParCle: {},
    escaliers: [], entrees: {}, sorties: [], marqueurs: {}, spawns: [], pnj: [], sol: [], declencheurs: [],
    avertissements,
  };
  const legende = def.legende || {};
  const etagesDef = Array.isArray(def.etages) ? def.etages : [];
  if (!etagesDef.length) avert('aucun étage');

  etagesDef.forEach((ed, idx) => {
    const plan = Array.isArray(ed.plan) ? ed.plan : [];
    const h = plan.length;
    const w = plan.reduce((m, l) => Math.max(m, String(l).length), 0);
    const n = w * h;
    const E = {
      id: ed.id || `e${idx}`, nom: ed.nom || ed.id || `Étage ${idx}`, idx, w, h,
      monte: ed.monte || null, descend: ed.descend || null, def: ed,
      code: new Uint8Array(n), sol: new Uint8Array(n), bloque: new Uint8Array(n), opaque: new Uint8Array(n),
      piece: new Int16Array(n).fill(-1), meuble: new Int32Array(n).fill(-1), porte: new Int32Array(n).fill(-1),
      deco: new Uint8Array(n), lumBase: new Float32Array(n), car: new Array(n),
    };
    niv.etageIdx[E.id] = idx;
    niv.etages.push(E);
    const desc = new Array(n);
    // 1) résolution des caractères
    for (let y = 0; y < h; y++) {
      const ligne = String(plan[y]);
      for (let x = 0; x < w; x++) {
        const ch = x < ligne.length ? ligne[x] : ' ';
        const i = y * w + x;
        E.car[i] = ch;
        let d = resoudre(ch, legende, avert);
        if (!d) { avert(`${E.id} (${x},${y}) : caractère inconnu « ${ch} » (traité comme sol)`); d = { k: K.SOL }; }
        desc[i] = d;
        E.code[i] = d.k;
        const bl = d.bloque != null ? d.bloque : (d.k === K.MUR || d.k === K.EAU || d.k === K.FENETRE || d.k === K.VIDE ||
          (d.k === K.PORTE && d.etat !== 'ouverte') ? 1 : 0);
        const op = d.opaque != null ? d.opaque : (d.k === K.MUR || d.k === K.VIDE || (d.k === K.PORTE && d.etat !== 'ouverte') ? 1 : 0);
        E.bloque[i] = bl; E.opaque[i] = op;
        if (d.deco) E.deco[i] = DECOS.indexOf(d.deco) + 1;
      }
    }
    E._desc = desc;
  });

  // 2) pièces (flood-fill, les portes et fenêtres séparent), matières, lumière
  for (const E of niv.etages) {
    const { w, h, code } = E;
    const separe = (i) => code[i] === K.MUR || code[i] === K.VIDE || code[i] === K.PORTE || code[i] === K.FENETRE;
    const file = new Int32Array(w * h);
    for (let s = 0; s < w * h; s++) {
      if (E.piece[s] >= 0 || separe(s)) continue;
      const pid = niv.pieces.length;
      const P = { id: pid, etage: E.id, nom: null, sol: null, sombre: null, exterieur: false, n: 0, fenetres: [], x0: w, y0: h, x1: 0, y1: 0 };
      niv.pieces.push(P);
      let a = 0, b = 0, nExt = 0, nSolInt = 0;
      file[b++] = s; E.piece[s] = pid;
      while (a < b) {
        const i = file[a++]; const x = i % w, y = (i / w) | 0;
        P.n++; if (x < P.x0) P.x0 = x; if (y < P.y0) P.y0 = y; if (x > P.x1) P.x1 = x; if (y > P.y1) P.y1 = y;
        const ch = E.car[i];
        if (ch === ',' || ch === '"' || ch === ':' || ch === '~' || ch === 'T' || ch === 'v') nExt++;
        else if (ch === '.') nSolInt++;
        for (let dI = 0; dI < 4; dI++) {
          const nx = x + DX4[dI], ny = y + DY4[dI];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (code[j] === K.FENETRE && !P.fenetres.includes(j)) P.fenetres.push(j);
          if (E.piece[j] >= 0 || separe(j)) continue;
          E.piece[j] = pid; file[b++] = j;
        }
      }
      P.exterieur = nExt > nSolInt || (niv.exterieur && nSolInt === 0);
    }
  }
  // pièces nommées
  for (const pd of def.pieces || []) {
    const ei = niv.etageIdx[pd.etage];
    const E = niv.etages[ei];
    if (!E || pd.x == null || pd.y == null || pd.x < 0 || pd.y < 0 || pd.x >= E.w || pd.y >= E.h) { avert(`pièce « ${pd.nom} » : position hors plan`); continue; }
    const pid = E.piece[pd.y * E.w + pd.x];
    if (pid < 0) { avert(`pièce « ${pd.nom} » : (${pd.x},${pd.y}) sur ${pd.etage} n'est pas dans une pièce (mur, porte ?)`); continue; }
    const P = niv.pieces[pid];
    if (pd.nom) P.nom = pd.nom;
    if (pd.sol) { if (MAT[pd.sol] == null) avert(`pièce « ${pd.nom} » : sol inconnu « ${pd.sol} »`); else P.sol = pd.sol; }
    if (pd.sombre != null) P.sombre = pd.sombre;
    if (pd.exterieur != null) P.exterieur = !!pd.exterieur;
  }
  const solDefaut = def.solDefaut || (niv.exterieur ? 'beton' : 'parquet');
  for (const E of niv.etages) {
    const { w, h } = E;
    for (let i = 0; i < w * h; i++) {
      const d = E._desc[i];
      const P = E.piece[i] >= 0 ? niv.pieces[E.piece[i]] : null;
      let m;
      if (d.sol && MAT[d.sol] != null) m = d.sol;
      else if (d.k === K.EAU) m = 'eau';
      else if (E.car[i] === ';') m = null;
      else {
        const ch = SOL_CHARS.has(E.car[i]) ? E.car[i] : solVoisin(E, i);
        if (ch === '"') m = (P && (P.sol === 'terre')) ? 'terre' : 'herbe';
        else if (ch === ':') m = 'gravier';
        else if (ch === ',') m = (P && ['bitume', 'paves', 'beton', 'terre'].includes(P.sol)) ? P.sol : 'bitume';
        else m = (P && P.sol) || (P && P.exterieur ? 'paves' : solDefaut);
      }
      if (m == null) { const ch = solVoisin(E, i); m = ch === '"' ? 'herbe' : ch === ':' ? 'gravier' : ch === ',' ? 'bitume' : ((P && P.sol) || solDefaut); E.deco[i] = DECOS.indexOf('debris') + 1; }
      E.sol[i] = MAT[m] ?? 0;
    }
    calculerLumiere(niv, E);
  }

  // 3) meubles (cases identiques adjacentes), portes, escaliers, sorties, marqueurs…
  for (const E of niv.etages) {
    const { w, h } = E;
    const vu = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, d = E._desc[i], ch = E.car[i];
      const L = d.leg || null;
      if (d.k === K.MEUBLE && !vu[i]) {
        const cases = groupe(E, i, (j) => E.car[j] === ch && E.code[j] === K.MEUBLE, vu);
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        for (const j of cases) { const cx = j % w, cy = (j / w) | 0; if (cx < x0) x0 = cx; if (cy < y0) y0 = cy; if (cx > x1) x1 = cx; if (cy > y1) y1 = cy; }
        const cle = cleCase(E.id, x, y);
        const cont = L && L.conteneur;
        const P = PROPS[d.prop] || {};
        const m = {
          cle, idx: niv.meubles.length, etage: E.id, type: d.prop, car: ch, cat: (cont && cont.categorie) || d.cat || null,
          cases, x0, y0, x1, y1, taille: cases.length,
          conteneur: cont === false ? false : !!(cont || d.cat),
          nom: (cont && cont.nom) ? cont.nom : (L && L.nom) || P.nom || 'le meuble',
          items: cont && Array.isArray(cont.items) ? cont.items.map(it => ({ id: it.id, qty: it.qty || 1 })) : null,
          table: cont && 'table' in cont ? cont.table : undefined,
          marqueur: L && L.marqueur || null, eau: L && L.eau || null,
          piece: E.piece[i],
        };
        if (m.cat === null && cont) m.cat = 'etagere';
        niv.meubles.push(m); niv.meubleParCle[cle] = m;
        for (const j of cases) E.meuble[j] = m.idx;
        if (m.marqueur) ajouterMarqueur(niv, m.marqueur, { etage: E.id, x, y, meuble: cle, def: L }, avert);
      } else if (d.k === K.PORTE) {
        const horiz = murOuBloc(E, x - 1, y) && murOuBloc(E, x + 1, y);
        const verrou = normaliserVerrou(L);
        const p = {
          cle: cleCase(E.id, x, y), idx: niv.portes.length, etage: E.id, x, y,
          etat: d.etat, verrou, exterieure: !!(L && L.exterieure) || bordExterieur(niv, E, x, y),
          orient: horiz ? 'h' : 'v', marqueur: L && L.marqueur || null, nom: (L && L.nom) || null,
        };
        if (p.etat === 'verrouillee' && !p.verrou) p.verrou = { forcer: 'pied_de_biche' };
        niv.portes.push(p); niv.porteParCle[p.cle] = p; E.porte[i] = p.idx;
        if (p.marqueur) ajouterMarqueur(niv, p.marqueur, { etage: E.id, x, y, porte: p.cle, def: L }, avert);
      } else if ((d.k === K.ESC_MONTE || d.k === K.ESC_DESCEND) && !vu[i]) {
        const cases = groupe(E, i, (j) => E.code[j] === d.k, vu);
        niv.escaliers.push({ cle: cleCase(E.id, x, y), etage: E.id, sens: d.k === K.ESC_MONTE ? 'monte' : 'descend', cases,
          cx: moy(cases, w, 0), cy: moy(cases, w, 1), vers: d.k === K.ESC_MONTE ? E.monte : E.descend, arrivee: null });
      } else if (d.k === K.SORTIE && !vu[i]) {
        const cases = groupe(E, i, (j) => E.code[j] === K.SORTIE, vu);
        niv.sorties.push({ cle: cleCase(E.id, x, y), etage: E.id, cases, cx: moy(cases, w, 0), cy: moy(cases, w, 1),
          echelle: (L && L.echelle) || null });
      }
      if (d.k === K.SOL || d.k === K.PORTE || d.k === K.SORTIE) {
        if (d.entree === 'defaut' && !niv.entrees.defaut) niv.entrees.defaut = { etage: E.id, x, y };
        if (d.zombie) niv.spawns.push({ etage: E.id, x, y, type: null, etat: null });
        if (L) {
          if (L.entree) { if (niv.entrees[L.entree]) avert(`entrée « ${L.entree} » définie deux fois`); else niv.entrees[L.entree] = { etage: E.id, x, y }; }
          if (L.zombie) niv.spawns.push({ etage: E.id, x, y, type: L.zombie, etat: L.etat || null, hp: L.hp || null, dir: L.dir });
          if (L.pnj) niv.pnj.push({ id: L.pnj, etage: E.id, x, y, si: L.si || null, marqueur: L.marqueur || null, nom: L.nom || null });
          if (L.document) niv.sol.push({ etage: E.id, x, y, doc: L.document, marqueur: L.marqueur || null });
          if (L.objet) {
            const o = Array.isArray(L.objet) ? { id: L.objet[0], qty: L.objet[1] || 1 } : { id: L.objet, qty: 1 };
            niv.sol.push({ etage: E.id, x, y, id: o.id, qty: o.qty });
          }
          if (L.marqueur && d.k !== K.PORTE) ajouterMarqueur(niv, L.marqueur, { etage: E.id, x, y, def: L, eau: L.eau || null, pnj: L.pnj || null, doc: L.document || null }, avert);
        }
      }
    }
  }
  // Escaliers : appariement monte ↔ descend (le plus proche du centre)
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
    else if (niv.sorties[0]) { const s = niv.sorties[0]; const E = niv.etages[niv.etageIdx[s.etage]]; niv.entrees.defaut = { etage: s.etage, x: s.cases[0] % E.w, y: (s.cases[0] / E.w) | 0 }; }
  }
  // Déclencheurs de zone
  (def.declencheurs || []).forEach((dz, i) => {
    if (niv.etageIdx[dz.etage] == null) { avert(`déclencheur #${i} : étage inconnu « ${dz.etage} »`); return; }
    niv.declencheurs.push({ i, etage: dz.etage, x: dz.x | 0, y: dz.y | 0, w: dz.w || 1, h: dz.h || 1, scene: dz.scene || null,
      cinematique: dz.cinematique || null, marqueur: dz.marqueur || null, unique: dz.unique !== false, si: dz.si || null });
  });
  for (const E of niv.etages) delete E._desc;
  return niv;
}

export const DECOS = ['chaise', 'cadavre', 'debris'];
const DX4 = [1, -1, 0, 0], DY4 = [0, 0, 1, -1];

function moy(cases, w, axe) { let s = 0; for (const j of cases) s += axe ? ((j / w) | 0) : j % w; return s / cases.length + 0.5; }
function groupe(E, i0, ok, vu) {
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
function murOuBloc(E, x, y) {
  if (x < 0 || y < 0 || x >= E.w || y >= E.h) return true;
  const c = E.code[y * E.w + x];
  return c === K.MUR || c === K.FENETRE || c === K.VIDE || c === K.PORTE;
}
function bordExterieur(niv, E, x, y) {
  for (let d = 0; d < 4; d++) {
    const nx = x + DX4[d], ny = y + DY4[d];
    if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
    const p = E.piece[ny * E.w + nx];
    if (p >= 0 && niv.pieces[p].exterieur) return true;
  }
  return false;
}
function solVoisin(E, i) {
  const x0 = i % E.w, y0 = (i / E.w) | 0;
  for (let r = 1; r <= 3; r++) {
    const cpt = {};
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = x0 + dx, y = y0 + dy;
      if (x < 0 || y < 0 || x >= E.w || y >= E.h) continue;
      const c = E.car[y * E.w + x];
      if (SOL_CHARS.has(c)) cpt[c] = (cpt[c] || 0) + 1;
    }
    let best = null, bn = 0;
    for (const c in cpt) if (cpt[c] > bn) { bn = cpt[c]; best = c; }
    if (best) return best;
  }
  return '.';
}
function normaliserVerrou(L) {
  if (!L) return null;
  let v = L.verrou;
  if (typeof v === 'string') v = { cle: v };
  else if (v && typeof v === 'object') v = { ...v };
  else v = null;
  if (L.flag) v = { ...(v || {}), flag: L.flag };
  return v;
}
function ajouterMarqueur(niv, id, info, avert) {
  if (niv.marqueurs[id]) { if (!niv.marqueurs[id].meuble || !info.meuble || niv.marqueurs[id].meuble !== info.meuble) avert(`marqueur « ${id} » placé plusieurs fois (le premier fait foi)`); return; }
  niv.marqueurs[id] = { id, ...info };
}
function caseArrivee(niv, esc) {
  const E = niv.etages[niv.etageIdx[esc.etage]];
  let best = null, bd = Infinity;
  for (const j of esc.cases) {
    const x = j % E.w, y = (j / E.w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
      const k = ny * E.w + nx;
      if (E.bloque[k] || E.code[k] === K.ESC_MONTE || E.code[k] === K.ESC_DESCEND || E.code[k] === K.SORTIE || E.code[k] === K.PORTE) continue;
      const dd = (nx + 0.5 - esc.cx) ** 2 + (ny + 0.5 - esc.cy) ** 2 + (dx && dy ? 0.5 : 0);
      if (dd < bd) { bd = dd; best = { etage: E.id, x: nx, y: ny }; }
    }
  }
  return best;
}

// Lumière ambiante de base (0..1, AVANT × lumiereJour) : pièces extérieures 1, fenêtres, pénombre, noir.
const PIECE_SOMBRE_DEF = { 0: 1, 1: 0.45, 2: 0 };
function calculerLumiere(niv, E, reglagesLumiere) {
  const R = reglagesLumiere || niv._lum || {};
  const PS = R.PIECE_SOMBRE || PIECE_SOMBRE_DEF;
  const portee = R.FENETRE_PORTEE || 5;
  const { w, h } = E;
  // facteur fenêtre par BFS depuis chaque fenêtre (dans la pièce)
  const fen = new Float32Array(w * h);
  const dist = new Int16Array(w * h);
  const file = new Int32Array(w * h);
  let a = 0, b = 0;
  dist.fill(-1);
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
  // murs, portes, fenêtres : lumière du voisin le plus clair (pour qu'ils se voient)
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

// ---------- Validation ----------
// ctx optionnel : { zombies: {id:…}, documents: {…}, pnj: {…}, items: {…}, scenes: {…} } pour vérifier les ids.
export function validerNiveau(def, ctx = {}) {
  const err = [];
  if (!def || typeof def !== 'object') return ['définition vide'];
  if (!def.id) err.push('id manquant');
  if (!Array.isArray(def.etages) || !def.etages.length) { err.push('aucun étage'); return err; }
  const ids = new Set();
  def.etages.forEach((e, k) => {
    if (!e.id) err.push(`étage #${k} : id manquant`);
    else if (ids.has(e.id)) err.push(`étage « ${e.id} » défini deux fois`);
    ids.add(e.id);
    if (!Array.isArray(e.plan) || !e.plan.length) { err.push(`étage « ${e.id} » : plan vide`); return; }
    const L0 = String(e.plan[0]).length;
    e.plan.forEach((l, y) => { if (String(l).length !== L0) err.push(`étage « ${e.id} » ligne ${y} : longueur ${String(l).length} au lieu de ${L0}`); });
  });
  for (const e of def.etages) {
    if (e.monte && !ids.has(e.monte)) err.push(`étage « ${e.id} » : monte vers « ${e.monte} » inconnu`);
    if (e.descend && !ids.has(e.descend)) err.push(`étage « ${e.id} » : descend vers « ${e.descend} » inconnu`);
  }
  // caractères
  const leg = def.legende || {};
  for (const [c, L] of Object.entries(leg)) {
    if (c.length !== 1) err.push(`légende : clé « ${c} » doit être UN caractère`);
    if (L && L.zombie && ctx.zombies && !ctx.zombies[L.zombie]) err.push(`légende '${c}' : mort inconnu « ${L.zombie} »`);
    if (L && L.document && ctx.documents && !ctx.documents[L.document]) err.push(`légende '${c}' : document inconnu « ${L.document} »`);
    if (L && L.pnj && ctx.pnj && !ctx.pnj[L.pnj]) err.push(`légende '${c}' : PNJ inconnu « ${L.pnj} »`);
    if (L && L.objet && ctx.items) { const id = Array.isArray(L.objet) ? L.objet[0] : L.objet; if (!ctx.items[id]) err.push(`légende '${c}' : objet inconnu « ${id} »`); }
    if (L && L.conteneur && Array.isArray(L.conteneur.items) && ctx.items) for (const it of L.conteneur.items) if (!ctx.items[it.id]) err.push(`légende '${c}' : objet de conteneur inconnu « ${it.id} »`);
    if (L && L.prop && !PROPS[L.prop]) err.push(`légende '${c}' : prop inconnue « ${L.prop} » (voir docs/NIVEAUX.md)`);
    if (L && L.etat && !['dort', 'immobile', 'erre', 'fait_le_mort', 'cogne', 'ouverte', 'fermee', 'verrouillee'].includes(L.etat)) err.push(`légende '${c}' : état inconnu « ${L.etat} »`);
    if (L && L.si && typeof L.si !== 'object') err.push(`légende '${c}' : « si » doit être un objet CONDITION`);
  }
  for (const pid of def.pool || []) if (ctx.zombies && !ctx.zombies[pid]) err.push(`pool : mort inconnu « ${pid} »`);
  let niv;
  try { niv = parserNiveau(def); } catch (e) { err.push('le parseur a échoué : ' + e.message); return err; }
  for (const a of niv.avertissements) if (/inconnu|hors plan|n'est pas dans|deux fois|plusieurs fois/.test(a)) err.push(a);
  if (!Object.keys(niv.entrees).length) err.push('aucune entrée (@ ou { entree: \'nom\' })');
  if (!niv.sorties.length) err.push('aucune sortie E');
  for (const s of niv.escaliers) {
    const E = niv.etages[niv.etageIdx[s.etage]];
    const x = s.cases[0] % E.w, y = (s.cases[0] / E.w) | 0;
    if (!s.vers) err.push(`escalier ${s.sens === 'monte' ? '<' : '>'} en (${x},${y}) sur « ${s.etage} » : l'étage n'a pas de « ${s.sens} »`);
    else if (!s.cible) err.push(`escalier ${s.sens === 'monte' ? '<' : '>'} en (${x},${y}) sur « ${s.etage} » : aucun escalier ${s.sens === 'monte' ? '>' : '<'} sur « ${s.vers} » qui revienne ici`);
    else if (!s.arrivee) err.push(`escalier en (${x},${y}) sur « ${s.etage} » : pas de case libre à l'arrivée`);
  }
  for (const d of def.declencheurs || []) {
    const E = niv.etages[niv.etageIdx[d.etage]];
    if (E && (d.x < 0 || d.y < 0 || d.x + (d.w || 1) > E.w || d.y + (d.h || 1) > E.h)) err.push(`déclencheur (${d.x},${d.y}) sur « ${d.etage} » : hors plan`);
    if (!d.scene && !d.cinematique && !d.marqueur) err.push(`déclencheur (${d.x},${d.y}) : ni scene, ni cinematique, ni marqueur`);
    if (d.scene && ctx.scenes && !ctx.scenes[d.scene]) err.push(`déclencheur : scène inconnue « ${d.scene} »`);
  }
  // Connexité : tout l'espace marchable relié à une entrée
  const acc = accessibilite(niv);
  const isoles = [];
  for (const E of niv.etages) {
    const A = acc[E.id];
    for (let i = 0; i < E.w * E.h; i++) if (marchable(E, i) && !A[i]) isoles.push(`${E.id} (${i % E.w},${(i / E.w) | 0})`);
  }
  if (isoles.length) err.push(`${isoles.length} case(s) marchable(s) inaccessible(s) depuis l'entrée, ex. ${isoles.slice(0, 4).join(', ')}`);
  for (const [nom, e] of Object.entries(niv.entrees)) {
    const E = niv.etages[niv.etageIdx[e.etage]];
    if (E && E.bloque[e.y * E.w + e.x]) err.push(`entrée « ${nom} » sur une case bloquante`);
  }
  return err;
}
function marchable(E, i) {
  const c = E.code[i];
  return (c === K.SOL || c === K.ESC_MONTE || c === K.ESC_DESCEND || c === K.SORTIE || c === K.PORTE) && (!E.bloque[i] || c === K.PORTE);
}
// BFS multi-étages depuis toutes les entrées ; portes (même verrouillées) traversables.
export function accessibilite(niv) {
  const acc = {};
  for (const E of niv.etages) acc[E.id] = new Uint8Array(E.w * E.h);
  const file = [];
  const pousser = (etage, x, y) => {
    const E = niv.etages[niv.etageIdx[etage]];
    if (!E) return;
    const i = y * E.w + x;
    if (acc[etage][i] || !marchable(E, i)) return;
    acc[etage][i] = 1; file.push([etage, i]);
  };
  for (const e of Object.values(niv.entrees)) pousser(e.etage, e.x, e.y);
  const escParCase = {};
  for (const s of niv.escaliers) for (const j of s.cases) escParCase[s.etage + ':' + j] = s;
  for (let a = 0; a < file.length; a++) {
    const [et, i] = file[a];
    const E = niv.etages[niv.etageIdx[et]];
    const x = i % E.w, y = (i / E.w) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX4[d], ny = y + DY4[d];
      if (nx >= 0 && ny >= 0 && nx < E.w && ny < E.h) pousser(et, nx, ny);
    }
    const s = escParCase[et + ':' + i];
    if (s && s.arrivee) pousser(s.arrivee.etage, s.arrivee.x, s.arrivee.y);
  }
  return acc;
}
