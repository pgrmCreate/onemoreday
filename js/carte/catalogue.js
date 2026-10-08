// ============ Catalogue des tuiles — LA référence de tout ce qu'on peut poser sur une carte ============
// Une carte est faite de COUCHES (voir js/carte/plan.js) :
//   1. sol       une matière par case (SOLS)                   → bruit des pas, texture, transitions douces
//   2. murs      un style de mur par case (MURS)               → bloque / cache la vue, texture, épaisseur
//   3. ouvertures portes, fenêtres, escaliers, sorties        → posées DANS la couche des murs
//   4. objets    meubles et décor, multi-cases, orientables (OBJETS) → bloquent, se fouillent, font de l'ombre
//   5. décals    sang, feuilles, fissures, tapis, marquages (DECALS) → purement visuel
//   6. lumières  feux, lampadaires, néons, bougies (LUMIERES)  → éclairent pour de vrai (les morts te voient)
//   7. vivant    morts, PNJ, entrées, marqueurs d'histoire, déclencheurs, objets au sol
// Aucun DOM : utilisable sous Node (outils de validation).

// ---------- 1. Sols ----------
// Les 14 premiers gardent l'ordre historique (index stocké dans etage.sol, lu par la simulation pour le bruit des pas).
// prio : la matière la plus haute « déborde » sur sa voisine (bords irréguliers) ; ext : matière d'extérieur.
export const SOLS = {
  parquet:    { nom: 'parquet', prio: 10, ext: false },
  carrelage:  { nom: 'carrelage', prio: 10, ext: false },
  moquette:   { nom: 'moquette', prio: 10, ext: false },
  beton:      { nom: 'béton', prio: 3, ext: true },
  lino:       { nom: 'lino', prio: 10, ext: false },
  tomettes:   { nom: 'tomettes', prio: 10, ext: false },
  terre:      { nom: 'terre', prio: 5, ext: true },
  bitume:     { nom: 'bitume', prio: 1, ext: true },
  paves:      { nom: 'pavés', prio: 2, ext: true },
  herbe:      { nom: 'herbe', prio: 6, ext: true },
  gravier:    { nom: 'gravier', prio: 4, ext: true },
  eau:        { nom: 'eau', prio: 0, ext: true },
  marbre:     { nom: 'marbre', prio: 10, ext: false },
  debris:     { nom: 'débris', prio: 4, ext: true },
  // nouveaux (ajoutés à la suite : n'altèrent pas les index historiques)
  dalles:     { nom: 'dalles', prio: 3, ext: true },        // dalles de pierre (places, parvis)
  trottoir:   { nom: 'trottoir', prio: 2, ext: true },
  sable:      { nom: 'sable', prio: 5, ext: true },
  herbe_seche:{ nom: 'herbe sèche', prio: 6, ext: true },   // la Crau, les talus
  boue:       { nom: 'boue', prio: 5, ext: true },
  planches:   { nom: 'planches', prio: 10, ext: false },    // plancher brut, estrade, ponton
  metal:      { nom: 'tôle', prio: 10, ext: false },        // conteneurs, camions
  carrelage_damier: { nom: 'damier', prio: 10, ext: false },
};
export const SOLS_IDS = Object.keys(SOLS);
export const SOL_IDX = Object.fromEntries(SOLS_IDS.map((id, i) => [id, i]));
export const SOL_AUCUN = 255;

// ---------- 2. Murs ----------
// opaque : cache la vue (une grille, un muret, une vitrine laissent voir) ; bas : mur bas (muret, haie basse) —
// dessiné moins haut. epais : on dessine une face avant (impression de hauteur).
export const MURS = {
  _:        { nom: 'aucun' },
  platre:   { nom: 'cloison', bloque: 1, opaque: 1, epais: 1 },
  brique:   { nom: 'mur de briques', bloque: 1, opaque: 1, epais: 1 },
  pierre:   { nom: 'mur de pierre', bloque: 1, opaque: 1, epais: 1 },
  crepi:    { nom: 'façade', bloque: 1, opaque: 1, epais: 1 },
  beton:    { nom: 'béton', bloque: 1, opaque: 1, epais: 1 },
  bois:     { nom: 'planches', bloque: 1, opaque: 1, epais: 1 },
  rocher:   { nom: 'rocher', bloque: 1, opaque: 1, epais: 1 },
  haie:     { nom: 'haie', bloque: 1, opaque: 1, epais: 0 },
  muret:    { nom: 'muret', bloque: 1, opaque: 0, epais: 0, bas: 1 },
  grille:   { nom: 'grille', bloque: 1, opaque: 0, epais: 0, bas: 1 },
  vitrine:  { nom: 'vitrine', bloque: 1, opaque: 0, epais: 0, bas: 1 },
  tole:     { nom: 'tôle', bloque: 1, opaque: 1, epais: 1 },
  vide:     { nom: 'néant', bloque: 1, opaque: 1, epais: 0, vide: 1 },
};
export const MURS_IDS = Object.keys(MURS);
export const MUR_IDX = Object.fromEntries(MURS_IDS.map((id, i) => [id, i]));

// Murs « minces » : sur la grille fine, ils n'occupent qu'une petite case d'épaisseur (0,4 m) au lieu d'une unité.
// Les autres (rocher, haie, néant) restent des masses pleines.
export const MURS_MINCES = new Set(['platre', 'brique', 'pierre', 'crepi', 'beton', 'bois', 'tole', 'muret', 'grille', 'vitrine']);

// ---------- 3. Ouvertures (codes de cases, hérités de l'ancien format) ----------
export const K = { VIDE: 0, MUR: 1, SOL: 2, EAU: 3, PORTE: 4, FENETRE: 5, ESC_MONTE: 6, ESC_DESCEND: 7, SORTIE: 8, MEUBLE: 9 };

// ---------- Grille fine ----------
// Les plans s'écrivent en UNITÉS (1 unité = 0,8 m : l'ancienne « case ») ; le compilateur découpe chaque unité en
// FIN × FIN petites cases (0,4 m) : murs fins, ouvertures nettes, empreintes d'objets plus justes.
// Les POSITIONS (joueurs, morts, objets au sol, entrées, marqueurs, constructions) et tous les réglages en « cases »
// restent en unités ; seules les grilles d'un étage compilé (code, sol, bloque, opaque, piece…) sont fines.
//   E.w, E.h : dimensions FINES ; une position (x, y) en unités tombe dans la petite case icase(E, x, y).
export const FIN = 2;
export const icase = (E, x, y) => {
  const cx = Math.floor(x * FIN), cy = Math.floor(y * FIN);
  return cx < 0 || cy < 0 || cx >= E.w || cy >= E.h ? -1 : cy * E.w + cx;
};
// Centre (en unités) de la petite case i.
export const cxCase = (E, i) => (i % E.w + 0.5) / FIN;
export const cyCase = (E, i) => (((i / E.w) | 0) + 0.5) / FIN;
// Les FIN × FIN petites cases de l'unité (ux, uy) (hors plan : ignorées).
export function sousCases(E, ux, uy) {
  const out = [];
  for (let dy = 0; dy < FIN; dy++) for (let dx = 0; dx < FIN; dx++) {
    const x = ux * FIN + dx, y = uy * FIN + dy;
    if (x >= 0 && y >= 0 && x < E.w && y < E.h) out.push(y * E.w + x);
  }
  return out;
}

// ---------- 4. Objets ----------
// t: [w, h] taille par défaut (cases, orientation 0 = horizontale) ; cat : catégorie de butin (null = pas fouillable) ;
// bloque / opaque ; nom (avec article) ; haut : partie dessinée AU-DESSUS des personnages (houppier, auvent) ;
// lumiere : id de LUMIERES émise ; decor : ne bloque pas (on marche dessus) ; bruit : bruit des pas dessus (×) ;
// mural : accroché à un mur (posé sur la case du mur, dessiné PAR-DESSUS le mur).
// c : caractère de l'ancien format ASCII (compatibilité).
// tf : [w, h] empreinte réelle en PETITES cases (grille fine), plus petite que t : le tronc d'un pin, un poteau. L'objet
//      est dessiné centré sur cette empreinte, à sa taille habituelle.
export const OBJETS = {
  // — mobilier d'intérieur —
  table:      { c: 't', cat: 'table', bloque: 1, t: [2, 1], nom: 'la table' },
  table_ronde:{ cat: 'table', bloque: 1, t: [1, 1], nom: 'la table' },
  comptoir:   { c: 'r', cat: 'comptoir', bloque: 1, t: [3, 1], nom: 'le comptoir' },
  cuisine:    { c: 'k', cat: 'cuisine', bloque: 1, t: [3, 1], nom: 'les placards' },
  etagere:    { c: 's', cat: 'etagere', bloque: 1, t: [2, 1], nom: 'l\'étagère' },
  rayonnage:  { cat: 'etagere', bloque: 1, t: [4, 1], nom: 'le rayonnage' },
  armoire:    { c: 'a', cat: 'vetements', bloque: 1, t: [2, 1], nom: 'l\'armoire' },
  commode:    { cat: 'vetements', bloque: 1, t: [2, 1], nom: 'la commode' },
  frigo:      { c: 'f', cat: 'frigo', bloque: 1, t: [1, 1], nom: 'le frigo' },
  bureau:     { c: 'd', cat: 'bureau', bloque: 1, t: [2, 1], nom: 'le bureau' },
  caisse:     { c: 'g', cat: 'caisse', bloque: 1, t: [1, 1], nom: 'la caisse' },
  poubelle:   { c: 'o', cat: 'poubelle', bloque: 1, t: [1, 1], nom: 'la poubelle' },
  machine:    { c: 'm', cat: 'machine', bloque: 1, t: [1, 1], nom: 'la machine' },
  lit:        { c: 'b', cat: 'lit', bloque: 1, t: [2, 3], nom: 'le lit' },
  lit_simple: { cat: 'lit', bloque: 1, t: [1, 2], nom: 'le lit' },
  lit_camp:   { cat: 'lit', bloque: 1, t: [1, 2], nom: 'le lit de camp' },   // couchage « moyen »
  matelas:    { cat: 'lit', bloque: 1, t: [1, 2], nom: 'le matelas' },       // posé au sol : couchage « moyen »
  canape:     { c: 'p', cat: 'canape', bloque: 1, t: [3, 1], nom: 'le canapé' },
  fauteuil:   { cat: 'canape', bloque: 1, t: [1, 1], nom: 'le fauteuil' },
  banc:       { c: 'n', cat: null, bloque: 1, t: [2, 1], nom: 'le banc' },
  lavabo:     { c: 'w', cat: 'salle_de_bain', bloque: 1, t: [1, 1], nom: 'le lavabo' },
  wc:         { cat: 'salle_de_bain', bloque: 1, t: [1, 1], nom: 'les toilettes' },
  baignoire:  { c: 'h', cat: 'salle_de_bain', bloque: 1, t: [1, 2], nom: 'la baignoire' },
  chaise:     { c: 'c', cat: null, bloque: 0, t: [1, 1], tf: [1, 1], nom: 'la chaise', decor: 1 },
  tapis:      { cat: null, bloque: 0, t: [3, 2], nom: 'le tapis', decor: 1, sol: 1 },
  piano:      { cat: null, bloque: 1, t: [2, 1], nom: 'le piano' },
  cheminee:   { cat: null, bloque: 1, t: [2, 1], nom: 'la cheminée' },
  televiseur: { cat: 'machine', bloque: 1, t: [1, 1], nom: 'le téléviseur' },
  // — commerce, bureaux, hôpital —
  caisse_enreg:{ cat: 'caisse', bloque: 1, t: [1, 1], nom: 'la caisse enregistreuse' },
  vitrine_frigo:{ cat: 'frigo', bloque: 1, t: [3, 1], nom: 'le meuble réfrigéré' },
  brancard:   { cat: 'lit', bloque: 1, t: [1, 2], nom: 'le brancard' },
  lit_hopital:{ cat: 'lit', bloque: 1, t: [1, 2], nom: 'le lit d\'hôpital' },
  casier:     { cat: 'vetements', bloque: 1, t: [1, 1], nom: 'le casier' },
  classeur:   { cat: 'bureau', bloque: 1, t: [1, 1], nom: 'le classeur' },
  // — extérieur, ville —
  voiture:    { c: 'v', cat: 'voiture', bloque: 1, t: [3, 2], nom: 'la voiture' },
  // modèles de voitures (js/data/voitures.js : serrure, alarme, butin propre) — même empreinte que la berline
  citadine:   { cat: 'voiture', bloque: 1, t: [3, 2], nom: 'la citadine' },
  break:      { cat: 'voiture', bloque: 1, t: [3, 2], nom: 'le break' },
  suv:        { cat: 'voiture', bloque: 1, t: [3, 2], nom: 'le 4 × 4' },
  pickup:     { cat: 'voiture', bloque: 1, t: [3, 2], nom: 'le pick-up' },
  voiture_police: { cat: 'voiture', bloque: 1, t: [3, 2], nom: 'la voiture de gendarmerie' },
  camping_car:{ cat: 'voiture', bloque: 1, opaque: 1, t: [4, 2], nom: 'le camping-car' },
  bus:        { cat: 'voiture', bloque: 1, opaque: 1, t: [9, 2], nom: 'le bus' },
  camionnette:{ cat: 'voiture', bloque: 1, opaque: 1, t: [4, 2], nom: 'la camionnette' },
  camion_mil: { cat: 'voiture', bloque: 1, opaque: 1, t: [5, 2], nom: 'le camion militaire', lumiere: 'gyrophare' },
  ambulance:  { cat: 'voiture', bloque: 1, opaque: 1, t: [4, 2], nom: 'l\'ambulance' },
  gravats:    { c: 'x', cat: null, bloque: 1, t: [1, 1], nom: 'les gravats' },
  arbre:      { c: 'T', cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'l\'arbre', haut: 'houppier' },
  platane:    { cat: null, bloque: 1, opaque: 0, t: [1, 1], nom: 'le platane', haut: 'platane' },
  cypres:     { cat: null, bloque: 1, opaque: 1, t: [1, 1], tf: [1, 1], nom: 'le cyprès', haut: 'cypres' },
  pin:        { cat: null, bloque: 1, opaque: 0, t: [1, 1], tf: [1, 1], nom: 'le pin', haut: 'pin' },
  olivier:    { cat: null, bloque: 1, opaque: 0, t: [1, 1], tf: [1, 1], nom: 'l\'olivier', haut: 'olivier' },
  buisson:    { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'le buisson' },
  figuier:    { cat: null, bloque: 1, opaque: 0, t: [1, 1], tf: [1, 1], nom: 'le figuier', haut: 'figuier' },
  amandier:   { cat: null, bloque: 1, opaque: 0, t: [1, 1], tf: [1, 1], nom: 'l\'amandier', haut: 'amandier' },
  roncier:    { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'le roncier' },
  cannier:    { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'les cannes de Provence' },
  lampadaire: { cat: null, bloque: 1, t: [1, 1], tf: [1, 1], nom: 'le lampadaire', haut: 'lampadaire' },
  poteau:     { cat: null, bloque: 1, t: [1, 1], tf: [1, 1], nom: 'le poteau' },
  borne:      { cat: null, bloque: 1, t: [1, 1], tf: [1, 1], nom: 'la borne' },
  benne:      { cat: 'poubelle', bloque: 1, opaque: 1, t: [2, 1], nom: 'la benne' },
  barriere:   { cat: null, bloque: 1, t: [2, 1], nom: 'la barrière' },
  sacs_sable: { cat: null, bloque: 1, t: [2, 1], nom: 'les sacs de sable' },
  palette:    { cat: 'caisse', bloque: 1, t: [1, 1], nom: 'la palette' },
  caisson:    { cat: 'caisse', bloque: 1, t: [1, 1], nom: 'la caisse' },
  fut:        { cat: null, bloque: 1, t: [1, 1], nom: 'le fût' },
  brasero:    { cat: null, bloque: 1, t: [1, 1], nom: 'le fût enflammé', lumiere: 'feu' },
  feu_camp:   { cat: null, bloque: 1, t: [1, 1], nom: 'le feu de camp', lumiere: 'feu' },
  fontaine:   { cat: null, bloque: 1, t: [2, 2], nom: 'la fontaine' },
  statue:     { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'la statue' },
  tente:      { cat: 'caisse', bloque: 1, t: [3, 3], nom: 'la tente' },
  generateur: { cat: 'machine', bloque: 1, t: [2, 1], nom: 'le groupe électrogène' },
  conteneur:  { cat: 'machine', bloque: 1, opaque: 1, t: [5, 2], nom: 'le conteneur' },
  // — cimetière, église —
  tombe:      { c: '=', cat: null, bloque: 1, t: [1, 2], nom: 'la tombe' },
  tombe_croix:{ cat: null, bloque: 1, t: [1, 2], nom: 'la tombe' },
  stele:      { cat: null, bloque: 1, t: [1, 1], nom: 'la stèle' },
  caveau:     { cat: null, bloque: 1, opaque: 1, t: [2, 2], nom: 'le caveau' },
  cercueil:   { cat: null, bloque: 1, t: [1, 2], nom: 'le cercueil' },
  housse:     { cat: null, bloque: 0, t: [1, 2], nom: 'la housse mortuaire', decor: 1 },
  autel:      { cat: null, bloque: 1, t: [3, 1], nom: 'l\'autel' },
  prie_dieu:  { cat: null, bloque: 1, t: [3, 1], nom: 'le banc d\'église' },
  cloche:     { cat: null, bloque: 1, t: [2, 2], nom: 'la cloche' },
  pilier:     { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'le pilier' },
  treteau:    { cat: 'table', bloque: 1, t: [2, 1], nom: 'les tréteaux' },                 // morgue de fortune, chantier
  chariot:    { cat: null, bloque: 1, t: [1, 2], nom: 'le chariot de la morgue' },
  etabli_meuble: { cat: 'caisse', bloque: 1, t: [3, 1], nom: 'l\'établi' },
  couronne:   { cat: null, bloque: 0, t: [1, 1], nom: 'la couronne de fleurs', decor: 1, sol: 1 },
  plan_mural: { cat: null, bloque: 0, t: [1, 1], nom: 'le plan de Salon', decor: 1, mural: 1 },             // punaisé au mur (posé sur la case du mur)
  tableau_cles:{ cat: null, bloque: 0, t: [1, 1], nom: 'le tableau de clés', decor: 1, mural: 1 },
  banc_pierre:{ cat: null, bloque: 1, t: [2, 1], nom: 'le banc de pierre' },
  // — décor au sol (on marche dessus) —
  cadavre:    { c: '%', cat: null, bloque: 0, t: [1, 1], nom: 'le corps', decor: 1 },
  debris:     { c: ';', cat: null, bloque: 0, t: [1, 1], nom: 'les débris', decor: 1, bruit: 2.5 },
  // — anciens noms (props de légende) gardés tels quels —
  haie:       { cat: null, bloque: 1, opaque: 1, t: [1, 1], nom: 'la haie' },
  grille:     { cat: null, bloque: 1, t: [1, 1], nom: 'la grille' },
};
// ---------- Comment un objet remplit son empreinte (le dessin, la collision et le surlignage disent la même chose) ----------
// Un plan pose souvent un objet sur une empreinte qui n'a pas ses proportions (une rangée de bancs de 6 × 1, un comptoir de
// 5 × 1, un tas de gravats de 20 × 1, une voiture sur 2 × 1…). Avant, le dessin se réduisait pour garder ses proportions
// et la collision gardait toute l'empreinte : des « objets invisibles » qui bloquaient, un carré orange trop grand.
// disposition(type, w, h) — w × h unités dans le sens du dessin — dit maintenant comment l'objet l'occupe :
//   'etirer'  proportions proches (écart ≤ ETIRER_MAX) : le dessin s'étire un peu et remplit l'empreinte ;
//   'repeter' un objet qui se range en rang (bancs, étagères, gravats, frigos…) : nx × ny exemplaires côte à côte,
//             si chacun garde au moins 70 % de sa taille (sinon : 'centrer') ;
//   'centrer' un objet unique (voiture, baignoire, autel…) : il garde ses proportions, centré (w, h = taille dessinée),
//             tourné d'un quart (tourne) quand il remplit ainsi nettement mieux l'empreinte ;
//             le compilateur réduit alors l'empreinte réelle (collision, surlignage) à ce qui est dessiné.
// DESSIN_SEUL : types sans sprite, dessinés à la main pour remplir leur empreinte (toujours 'etirer').
export const ETIRER_MAX = 1.4;
export const DESSIN_SEUL = new Set(['lit_camp', 'matelas', 'arbre', 'platane', 'cypres', 'pin', 'olivier', 'figuier', 'amandier', 'lampadaire', 'plan_mural', 'tableau_cles', 'cadavre', 'grille']);
const ETIRE_TOUJOURS = new Set(['tapis', 'haie']);
const UNIQUES = new Set(['baignoire', 'piano', 'cheminee', 'fontaine', 'statue', 'tente', 'generateur', 'caveau', 'autel', 'cloche', 'televiseur']);
export function disposition(type, w, h) {
  const d = OBJETS[type];
  if (!d || !d.t || DESSIN_SEUL.has(type) || ETIRE_TOUJOURS.has(type) || !(w > 0 && h > 0)) return { mode: 'etirer', nx: 1, ny: 1 };
  const r = (w / h) / (d.t[0] / d.t[1]);
  if (r <= ETIRER_MAX && r >= 1 / ETIRER_MAX) return { mode: 'etirer', nx: 1, ny: 1 };
  if (!UNIQUES.has(type) && d.cat !== 'voiture') {
    const nx = r > 1 ? Math.max(1, Math.round(r)) : 1, ny = r < 1 ? Math.max(1, Math.round(1 / r)) : 1;
    // en rang seulement si chaque exemplaire garde à peu près sa taille (un banc sur une seule case : un petit banc centré)
    if (Math.min(w / nx / d.t[0], h / ny / d.t[1]) >= 0.7) return { mode: 'repeter', nx, ny };
  }
  // centré ; tourné d'un quart s'il remplit nettement mieux ainsi (un autel posé en long, un caveau en travers)
  const k = Math.min(w / d.t[0], h / d.t[1]), k2 = Math.min(w / d.t[1], h / d.t[0]);
  if (k2 > k * 1.15) return { mode: 'centrer', tourne: true, nx: 1, ny: 1, w: d.t[1] * k2, h: d.t[0] * k2 };
  return { mode: 'centrer', nx: 1, ny: 1, w: d.t[0] * k, h: d.t[1] * k };
}
export const OBJET_PAR_CAR = Object.fromEntries(Object.entries(OBJETS).filter(([, o]) => o.c).map(([n, o]) => [o.c, n]));

// ---------- 5. Décals (visuels, sans effet de jeu) ----------
export const DECALS = {
  sang: {}, flaque_sang: {}, trainee_sang: {}, feuilles: {}, aiguilles: {}, fissure: {}, ordures: {}, papiers: {},
  verre: {}, flaque: {}, mousse: {}, huile: {}, cendres: {}, fleurs: {}, marquage: {}, passage_pieton: {},
  traces: {}, bougies: { lumiere: 'bougie' }, gravillons: {}, herbes: {}, plaque_egout: {},
};

// ---------- 6. Lumières ----------
// coul : couleur [r, g, b] 0..1 ; r : rayon (cases) ; i : intensité ; anim : 'feu' | 'bougie' | 'neon' | 'gyro' | 'fixe'.
// Une lumière éclaire VRAIMENT : elle rend visible de loin, et les morts te voient mieux quand tu es dedans.
export const LUMIERES = {
  feu:        { coul: [1, 0.55, 0.22], r: 6.5, i: 1, anim: 'feu' },
  braises:    { coul: [1, 0.35, 0.12], r: 3.5, i: 0.7, anim: 'feu' },
  bougie:     { coul: [1, 0.72, 0.38], r: 3.2, i: 0.75, anim: 'bougie' },
  lanterne:   { coul: [1, 0.78, 0.45], r: 5, i: 0.85, anim: 'bougie' },
  lampadaire: { coul: [1, 0.78, 0.5], r: 7.5, i: 0.85, anim: 'fixe' },
  neon:       { coul: [0.72, 0.9, 1], r: 6, i: 0.8, anim: 'neon' },
  ecran:      { coul: [0.5, 0.7, 1], r: 2.6, i: 0.5, anim: 'neon' },
  gyrophare:  { coul: [1, 0.12, 0.08], r: 6, i: 0.9, anim: 'gyro' },
  gyro_bleu:  { coul: [0.15, 0.35, 1], r: 6, i: 0.9, anim: 'gyro' },
  fusee:      { coul: [1, 0.18, 0.12], r: 5.5, i: 1, anim: 'feu' },
  urgence:    { coul: [0.3, 1, 0.45], r: 3, i: 0.6, anim: 'fixe' },   // BAES vert « sortie »
  lune:       { coul: [0.55, 0.65, 0.9], r: 8, i: 0.5, anim: 'fixe' }, // puits de lune (verrière)
};

// ---------- Toits (vus de dehors) ----------
export const TOITS = { tuiles: 1, zinc: 1, terrasse: 1, ardoise: 1, tole: 1, verriere: 1 };
