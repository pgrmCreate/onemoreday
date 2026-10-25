// Saint-Chamas — la Poudrerie (ACTE IV, « La brume ») — refait au format à couches (js/carte/plan.js), version 2.
// En une phrase : le point de ralliement des survivants du Refuge, un parc au bord de l'étang de Berre où l'on attend les
// autres dans la maison du gardien, jusqu'à ce que la brume jaune monte de l'eau et qu'il faille fuir vers Cornillon.
// Réel : l'ancienne Poudrerie royale de Saint-Chamas (1690-1974), aujourd'hui un parc naturel : grandes allées de
// platanes, canaux, ruines d'ateliers de poudre envahies de lierre, un magasin à poudre voûté en pierre, la maison du
// gardien ; au sud, la grève de l'étang.
//
// Organisation (70 × 52 unités, nord en haut) :
//   - LE SENTIER DU REFUGE arrive au nord, sur la grande allée de platanes (x 21..25) : entrées `allee` et `defaut`,
//     sortie nord (vers Miramas-le-Vieux), et le vieux panneau du parc ;
//   - LA MAISON DU GARDIEN (x 4..16, y 3..12), le refuge de l'acte IV : au rez-de-chaussée la cuisine (Inès, la lanterne,
//     le poêle), l'entrée et son escalier droit (2 × 3), le cellier ; à l'étage (`e1`, escalier aux mêmes coordonnées)
//     la chambre aux matelas, où l'on dort, et la salle d'eau (WC, lavabo, baignoire). Pièces sansMorts ; le lieu est un
//     refuge (meta refuge) tant qu'on attend (refuge_fui, pas encore brume_vue). L'étage est aussi l'abri de la brume ;
//   - L'ALLÉE TRANSVERSALE (y 14..16) file vers l'est, jusqu'à la sortie est (vers Cornillon) ; au nord-est, les ruines de
//     l'atelier des meules (un figuier y a poussé) ;
//   - LE CANAL (y 21..22) traverse tout le parc ; on le passe sur la passerelle de la grande allée ou sur le pont de pierre
//     de l'est ;
//   - au sud du canal : les ruines de l'atelier des poudres et la stèle de 1936 (doc_poudrerie) à l'ouest, le bassin au
//     milieu, le magasin à poudre voûté (une seule porte, noir) à l'est ;
//   - LA GRÈVE (y 38..) derrière la clôture du parc et ses deux portillons : galets, roseaux, la barque échouée, puis
//     l'étang (bord sud).
// Peuplement : 3 errants dans le parc à l'arrivée, loin de la maison ; quand la brume vient (brume_vue), une marée
// silencieuse de 13 morts entre la grève et le parc. Figurants selon la chute : Karine et Noa (noa_avec), ou bien les
// familles parties à l'aube (familles_parties) : Karine et Noa, Paul et Josette Mendès, Céline et Théo.
// Pourquoi ils tiennent ici : le parc est presque vide (les morts sont montés au triage, puis au rocher) ; la maison a une
// porte pleine et un étage, et elle est la seule du parc. Les deux sorties restent fermées pendant l'attente (Inès refuse de partir) ; elles
// s'ouvrent quand la brume monte, et pour qui vient ici sans être passé par la chute du Refuge (jeu libre).
//
// Check-list (docs/RETOURS_JOUEUR.md §3) :
//   [x] sens et taille : lieu clé de l'acte IV, cœur 70 × 52, abords: false ; chaque zone a son repère (maison, allées de
//       platanes, ruines, canal et passerelle, bassin, magasin à poudre, clôture et barque) à moins de ~20 unités ;
//   [x] chaque pièce a une fonction (cuisine et PNJ, escalier, réserves, couchage, eau, butin du magasin, document) ;
//   [~] personnages vivants : une raison visible (maison close, étage, parc presque vide) ; elle reste à dire en une phrase
//       dans pou_arrivee (scène du scénariste) ; maison sansMorts + meta refuge ; un figurant au moins par pièce habitée
//       (cuisine, chambre), Inès dans tous les cas ;
//   [ ] lieux_gameplay.saint_chamas.morts = [3, 6] et repeuplement 0.5 : TROP pour « peu de morts à l'arrivée » (le lieu
//       l'emporte sur le plan) ; à ramener à [0, 2] et 0.2 dans js/data/lieux_gameplay.js (fichier hors de ce chantier) ;
//   [x] morts scénarisés : la marée a son `si` (brume_vue) ; l'état « après » (parc envahi, maison vide) est prévu ;
//   [x] portes : aucune verrouillée ; les portes des ruines sont ouvertes ; 2 unités libres derrière chacune (script) ;
//   [x] escalier droit 2 × 3, aux mêmes coordonnées sur les deux étages, une case libre à l'arrivée ;
//   [x] réalisme (P15) : WC, lavabo, baignoire à l'étage, cuisine et évier en bas ; le magasin à poudre est exempté ;
//   [x] repérage : toutes les pièces nommées ; sorties au bord, sur les allées ;
//   [x] danger lisible : la brume et la marée sont annoncées par pou_odeur (20 h) avant pou_brume (22 h) ;
//   [ ] mission : aucune (q_brume passe par les scènes, attente à l'heure) ;
//   [~] lumières : le moteur n'allume pas encore une lumière selon un drapeau ; la lanterne de la cuisine et la bougie de
//       la chambre restent donc allumées après le départ (à reprendre quand les lumières accepteront `si`).
import { plan } from '../../carte/plan.js';

const W = 70, H = 52;
// Toit d'un bâtiment à plusieurs pièces : le même rectangle, rattaché à chaque pièce par une case de référence.
const toitSur = (e, x, y, w, h, refs, type = 'tuiles') => { for (const ref of refs) e.toits.push({ x, y, w, h, type, ref }); };

const ATTENTE = { flag: 'refuge_fui', pasFlag: 'brume_vue' };
const AVEC_NOA = { flag: 'noa_avec', pasFlag: 'brume_vue' };
const FAMILLES = { flag: 'familles_parties', pasFlag: 'brume_vue' };
const BRUME = { flag: 'brume_vue' };
// les sorties : fermées pendant l'attente ; ouvertes quand la brume monte, ou pour qui n'a jamais fui le Refuge
const SORTIE = {
  si: { ou: [{ flag: 'brume_vue' }, { pasFlag: 'refuge_fui' }] },
  message: 'Inès refuse de partir : Hélène a dit d’attendre deux jours à la Poudrerie, et les autres viendront peut-être.',
};
const S = {
  karine: { manteau: '#6a4a3a', pantalon: '#2a2a30', cheveux: '#3a2414', coiffure: 'long' },
  noa: { manteau: '#b8707a', pantalon: '#3a3f5a', cheveux: '#5a3a1e', coiffure: 'long', taille: 0.72 },
  paul: { manteau: '#5a5248', pantalon: '#3a3a38', cheveux: '#d8d4cc', coiffure: 'court', carrure: 0.92 },
  josette: { manteau: '#6b5a6e', pantalon: '#3a3438', cheveux: '#cfc8c0', coiffure: 'court', carrure: 0.9 },
  celine: { manteau: '#4a5a3a', pantalon: '#2c2a26', cheveux: '#8a5a2a', coiffure: 'long' },
  theo: { manteau: '#2e5a8a', pantalon: '#2a2c30', cheveux: '#3a2a1a', coiffure: 'court', taille: 0.85 },
};

export default plan({
  id: 'saint_chamas', nom: 'Saint-Chamas — la Poudrerie', exterieur: true, abords: false, version: 2, typeButin: 'usine',
  sansSanitaires: ['Le magasin à poudre'],   // pas de toilettes, et c'est normal : la poudrière (tools/verifier_realisme.mjs)
  pool: ['errant', 'errant', 'putrefie', 'coureur', 'gonfleur'], morts: { n: [0, 2] }, mortsDehorsSeulement: true,
  refuge: ATTENTE,                            // la maison du gardien (pièces sansMorts) est sûre tant qu'on attend
}, (p) => {
  // ======================= REZ-DE-CHAUSSÉE : le parc =======================
  const e = p.etage('rdc', 'La Poudrerie', W, H, { sol: 'herbe', monte: 'e1' });

  // --- le sol : pelouses d'automne, sous-bois, allées de sable stabilisé ---
  e.taches('herbe_jaunie', 1, 1, W - 2, 36, 0.12, 2.2);
  e.taches('sous_bois', 1, 1, W - 2, 36, 0.06, 1.6);
  e.chemin('stabilise', [[23, 0], [23, 37]], 5);                 // la grande allée (nord-sud)
  e.chemin('stabilise', [[26, 15], [69, 15]], 3);                // l'allée transversale (vers l'est)
  e.chemin('stabilise', [[17, 8], [21, 8]], 1);                  // de l'allée à la porte du gardien
  e.chemin('stabilise', [[53, 17], [53, 25], [59, 25]], 1);      // vers le pont de pierre et le magasin
  e.chemin('terre', [[25, 30], [40, 26]], 1);                    // vers le bassin
  e.chemin('terre', [[20, 26], [18, 30]], 1);                    // vers les ruines de l'atelier des poudres
  e.semer('feuilles', 1, 1, W - 2, 36, 120);                     // les platanes perdent leurs feuilles
  e.semer('herbes', 1, 1, W - 2, 36, 40);

  // --- les platanes : la grande allée et l'allée transversale ---
  for (const y of [3, 7, 11, 18, 26, 30, 34]) { e.objet('platane', 20, y); e.objet('platane', 26, y); }
  for (const x of [31, 36, 41, 46, 51, 56, 61, 66]) { e.objet('platane', x, 13); e.objet('platane', x, 17); }
  e.objet('platane', 8, 18); e.objet('platane', 13, 16); e.objet('platane', 34, 33); e.objet('platane', 64, 36);
  // bancs et vieux panneau
  e.objet('banc', 18, 18, { w: 2, h: 1, nom: 'le banc de l’allée' });
  e.objet('banc', 28, 19, { w: 2, h: 1, nom: 'le banc de l’allée' });
  e.objet('banc', 30, 35, { w: 2, h: 1, nom: 'le banc face à l’étang' });
  e.objet('banc', 47, 35, { w: 2, h: 1, nom: 'le banc face à l’étang' });
  e.objet('caisson', 18, 1, { nom: 'le vieux panneau du parc', conteneur: false,
    message: 'Un panneau délavé du Département : « Parc de la Poudrerie. Ne pas cueillir. Ne pas faire de feu. » Le plan du parc a été arraché.' });

  // ======================= La maison du gardien (rez-de-chaussée) =======================
  // extérieur x 4..16, y 3..12 ; dedans x 5..15, y 4..11 : l'entrée et l'escalier (x 5..8, y 4..7), le cellier
  // (x 5..8, y 9..11), la cuisine (x 10..15, y 4..11) ; la porte d'entrée donne dans la cuisine, côté allée
  const ma = e.piece(4, 3, 13, 10, { nom: 'La maison du gardien — l’entrée', sol: 'tomettes', mur: 'crepi', toit: 'tuiles', sombre: 1, sansMorts: true,
    portes: [{ cote: 'e', a: 4, nom: 'la porte de la maison du gardien' }],
    fenetres: [{ cote: 'e', a: 1 }, { cote: 's', a: 6, l: 2 }, { cote: 'n', a: 5 }] });   // pas de fenêtre au-dessus du poêle
  toitSur(e, 4, 3, 13, 10, [[12, 8], [6, 10]]);   // un toit par pièce (le rendu ne couvre que la pièce de sa référence)
  e.cloison('platre', 9, ma.y0, 9, ma.y1); e.porte(9, 5, { nom: 'la porte de la cuisine' });
  e.cloison('platre', 5, 8, 8, 8); e.porte(7, 8, { nom: 'la porte du cellier' });
  e.escalier('monte', 5, 4, 2, 3);
  // la cuisine
  e.nommer(12, 8, 'La maison du gardien — la cuisine', { sol: 'tomettes', sombre: 1, sansMorts: true });
  e.objet('cuisine', 15, 4, { rot: 1, nom: 'l’évier et les placards' });
  e.objet('frigo', 10, 11, { nom: 'le frigo éteint' });
  e.objet('cheminee', 12, 4, { nom: 'le poêle à bois', conteneur: false });
  e.objet('table', 11, 7, { w: 2, h: 1, nom: 'la table de la cuisine', conteneur: false });
  e.objet('chaise', 11, 8); e.objet('chaise', 12, 8); e.objet('chaise', 13, 7);
  e.lumiere('lanterne', 12, 7.5, { r: 4.5, i: 0.7 });
  e.decal('papiers', 11.6, 7.3, { n: 2 });
  e.pnj('ines_pou', 13, 10, { marqueur: 'ines_pou', si: ATTENTE, dir: -Math.PI / 2 });
  e.pnj('pou_paul', 10, 8, { nom: 'Paul Mendès', style: S.paul, dir: 0, si: FAMILLES,
    repliques: ['Soixante ans que je n’avais pas dormi ailleurs que chez moi.', 'Josette ne dit rien, mais elle a mal aux pieds. On a marché toute la matinée.'] });
  e.pnj('pou_josette', 10, 10, { nom: 'Josette Mendès', style: S.josette, dir: 0, si: FAMILLES,
    repliques: ['Assieds-toi un peu. Tu ne tiens plus debout.', 'Paul ronfle. Au moins, on sait qu’il est vivant.'] });
  e.pnj('pou_celine', 14, 5, { nom: 'Céline', style: S.celine, dir: 0, si: FAMILLES,
    repliques: ['J’ai trouvé des boîtes dans le cellier du gardien. On tiendra deux jours, pas plus.', 'Théo ne me lâche plus d’une semelle. Je ne m’en plains pas.'] });
  // le cellier : les réserves du gardien
  e.nommer(6, 10, 'La maison du gardien — le cellier', { sol: 'beton', sombre: 2, sansMorts: true });
  e.objet('etagere', 5, 9, { w: 1, h: 2, rot: 1, nom: 'l’étagère du cellier' });
  e.objet('caisson', 8, 11, { nom: 'la caisse de pommes de terre' });
  e.objet('fut', 5, 11, { nom: 'le bidon de pétrole vide' });

  // ======================= Les ruines de l'atelier des meules (nord-est) =======================
  const rm = e.piece(36, 3, 14, 9, { nom: 'Les ruines de l’atelier des meules', sol: 'dalles', mur: 'pierre', exterieur: true,
    portes: [{ cote: 's', a: 6, etat: 'ouverte', nom: 'l’ancienne porte de l’atelier' }, { cote: 'o', a: 3, etat: 'ouverte', nom: 'l’ancienne porte de l’atelier' }] });
  // rm : x 37..48, y 4..10 ; des pans de mur sont tombés (murets), le lierre a tout pris
  e.murRect('muret', 40, 3, 5, 1); e.murRect('muret', 49, 6, 1, 3);
  e.taches('debris', rm.x0, rm.y0, rm.w, rm.h, 0.12, 1);
  e.objet('figuier', 45, 6, { nom: 'le figuier poussé dans les ruines' });
  e.objet('gravats', 38, 5, { nom: 'une meule brisée' }); e.objet('gravats', 47, 9, { nom: 'une meule brisée' });
  e.objet('gravats', 41, 9, { w: 2, h: 1, nom: 'les pierres écroulées' });
  e.objet('debris', 44, 9); e.objet('debris', 39, 8);
  e.semer('mousse', 36, 3, 14, 9, 18); e.semer('feuilles', rm.x0, rm.y0, rm.w, rm.h, 8);
  e.zombie('errant', 43, 7, { etat: 'erre' });

  // ======================= Les pelouses du milieu (entre les allées et le canal) =======================
  e.objet('cannier', 4, 20, { nom: 'les roseaux' }); e.objet('cannier', 5, 20, { nom: 'les roseaux' });
  e.objet('cannier', 33, 20, { nom: 'les roseaux' }); e.objet('cannier', 62, 20, { nom: 'les roseaux' });
  e.objet('laurier_rose', 45, 19); e.objet('buis', 39, 19);
  e.zombie('errant', 60, 19, { etat: 'erre' });

  // ======================= Le canal, la passerelle, le pont de pierre =======================
  e.eau(0, 21, 21, 2); e.eau(26, 21, 25, 2); e.eau(56, 21, W - 56, 2);
  e.solRect('planches', 22, 21, 3, 2); e.murRect('grille', 21, 21, 1, 2); e.murRect('grille', 25, 21, 1, 2);   // la passerelle
  e.solRect('dalles', 52, 21, 3, 2); e.murRect('muret', 51, 21, 1, 2); e.murRect('muret', 55, 21, 1, 2);      // le pont de pierre
  e.solRect('boue', 0, 20, W, 1); e.solRect('boue', 0, 23, W, 1);                                             // les berges

  // ======================= Les ruines de l'atelier des poudres, la stèle de 1936 (sud-ouest) =======================
  const rp = e.piece(4, 25, 14, 9, { nom: 'Les ruines de l’atelier des poudres', sol: 'dalles', mur: 'pierre', exterieur: true,
    portes: [{ cote: 'n', a: 6, etat: 'ouverte', nom: 'l’ancienne porte de l’atelier' }, { cote: 'e', a: 4, etat: 'ouverte', nom: 'l’ancienne porte de l’atelier' }] });
  // rp : x 5..16, y 26..32 ; sauté deux fois (1936, puis le 15 septembre pour arrêter les morts sur le pont)
  e.murRect('muret', 5, 33, 6, 1); e.murRect('muret', 4, 27, 1, 3);
  e.taches('debris', rp.x0, rp.y0, rp.w, rp.h, 0.2, 1.1);
  e.objet('gravats', 6, 27, { w: 2, h: 1, nom: 'les pierres écroulées' }); e.objet('gravats', 14, 31, { nom: 'les gravats' });
  e.objet('gravats', 9, 31, { w: 2, h: 1, nom: 'les gravats' });
  e.objet('debris', 12, 28); e.objet('debris', 7, 30); e.objet('debris', 15, 27);
  e.decal('cendres', 11, 29.5, { r: 0.8 }); e.semer('mousse', 4, 25, 14, 9, 14);
  e.objet('statue', 13, 24, { nom: 'la stèle de 1936' });
  e.document('doc_poudrerie', 14, 24);
  e.zombie('errant', 9, 29, { etat: 'erre' });

  // ======================= Le bassin (milieu) =======================
  e.solRect('dalles', 39, 27, 7, 5); e.eau(40, 28, 5, 3);
  e.semer('feuilles', 39, 27, 7, 5, 6);

  // ======================= Le magasin à poudre voûté (sud-est) =======================
  const mg = e.piece(54, 26, 10, 8, { nom: 'Le magasin à poudre', sol: 'dalles', mur: 'pierre', toit: 'terrasse', sombre: 2,
    portes: [{ cote: 'n', a: 4, nom: 'la porte du magasin à poudre', style: 'metal' }] });
  // mg : x 55..62, y 27..32 ; une seule porte, aucune fenêtre (une poudrière) : il faut une lampe
  e.objet('pilier', 57, 30, { nom: 'un pilier de la voûte' }); e.objet('pilier', 60, 30, { nom: 'un pilier de la voûte' });
  e.objet('caisson', 55, 32, { nom: 'une caisse du magasin' }); e.objet('caisson', 56, 32, { nom: 'une caisse du magasin' });
  e.objet('palette', 55, 27, { nom: 'la palette' });
  e.objet('fut', 62, 27, { nom: 'un baril vide' }); e.objet('fut', 62, 28, { nom: 'un baril vide' }); e.objet('fut', 62, 32, { nom: 'un baril vide' });
  e.objet('etagere', 60, 32, { w: 2, h: 1, nom: 'l’étagère du magasin' });
  e.objet('roncier', 53, 30); e.objet('roncier', 64, 28); e.objet('roncier', 58, 34);

  // ======================= La clôture du parc, la grève, l'étang =======================
  e.murRect('grille', 0, 37, W, 1);
  e.porte(23, 37, { etat: 'ouverte', style: 'grille', nom: 'le portillon de la grève' });
  e.porte(57, 37, { etat: 'ouverte', style: 'grille', nom: 'le portillon de la grève' });
  e.nommer(20, 41, 'La grève de l’étang', { exterieur: true });
  e.solRect('cailloux', 0, 38, W, 8);
  e.taches('sable', 0, 39, W, 6, 0.25, 1.8);
  e.semer('gravillons', 0, 38, W, 7, 40);
  // l'étang de Berre : le bord sud, une rive qui ondule
  for (let x = 0; x < W; x++) { const y0 = 44 + Math.round(Math.sin(x * 0.37) * 0.8 + Math.sin(x * 0.11 + 1) * 0.7); e.eau(x, y0, 1, H - y0); }
  for (const [x, y] of [[3, 41], [4, 42], [10, 40], [16, 42], [17, 42], [33, 41], [44, 40], [45, 41], [52, 42], [61, 40], [66, 41], [67, 41]]) e.objet('cannier', x, y, { nom: 'les roseaux' });
  e.objet('debris', 37, 41, { w: 3, h: 1, nom: 'la barque échouée' });
  e.decal('flaque', 38.5, 42.6, { r: 0.6 });
  e.semer('papiers', 30, 39, 20, 4, 3);

  // ======================= Le parc lui-même : nom, arrivée, sorties =======================
  e.nommer(30, 10, 'Le parc de la Poudrerie', { exterieur: true });
  e.entree('allee', 23, 2);
  e.entree('defaut', 23, 2);
  e.sortie(21, 0, 5, 1, SORTIE);                 // nord : le sentier qui remonte vers Miramas-le-Vieux
  e.sortie(W - 1, 14, 1, 3, SORTIE);             // est : la route de Cornillon

  // ======================= La brume : la marée silencieuse =======================
  for (const [x, y] of [[6, 40], [13, 39], [19, 40], [28, 42], [34, 39], [41, 42], [48, 39], [56, 41], [63, 40], [30, 32], [47, 33], [19, 35], [66, 34]]) {
    e.zombie('errant', x, y, { etat: 'erre', si: BRUME });
  }

  // ======================= 1er ÉTAGE : la maison du gardien =======================
  const e1 = p.etage('e1', 'L’étage de la maison du gardien', W, H, { sol: null, descend: 'rdc', interieur: true });
  const et = e1.piece(4, 3, 13, 10, { nom: 'La maison du gardien — le palier', sol: 'parquet', mur: 'crepi', sombre: 1, sansMorts: true,
    fenetres: [{ cote: 'e', a: 1 }, { cote: 's', a: 6, l: 2 }, { cote: 'n', a: 8 }, { cote: 'o', a: 6 }] });
  e1.cloison('platre', 9, et.y0, 9, et.y1); e1.porte(9, 5, { nom: 'la porte de la chambre' });
  e1.cloison('platre', 5, 8, 8, 8); e1.porte(7, 8, { nom: 'la porte de la salle d’eau' });
  e1.escalier('descend', 5, 4, 2, 3);
  // la chambre : on y dort, à l'abri de la brume
  e1.nommer(12, 8, 'La maison du gardien — la chambre', { sol: 'parquet', sombre: 1, sansMorts: true });
  e1.objet('lit', 14, 9, { nom: 'le lit du gardien' });
  e1.objet('matelas', 12, 4, { nom: 'un matelas' }); e1.objet('matelas', 14, 4, { nom: 'un matelas' });
  e1.objet('matelas', 10, 8, { nom: 'un matelas' }); e1.objet('matelas', 10, 10, { nom: 'un matelas' });
  e1.objet('armoire', 15, 6, { w: 1, h: 2, rot: 1, nom: 'l’armoire du gardien' });
  e1.decal('bougies', 13.4, 7.4);
  e1.pnj('pou_karine', 11, 7, { nom: 'Karine', style: S.karine, dir: -Math.PI / 2, si: AVEC_NOA,
    repliques: ['Elle dort enfin. Ne fais pas de bruit.', 'Tu nous as sorties de là. Je ne l’oublierai pas.'] });
  e1.pnj('pou_noa', 12, 6, { nom: 'Noa', style: S.noa, dir: Math.PI / 2, si: AVEC_NOA,
    repliques: ['J’ai froid. Maman dit que ça va passer.', 'Tu as vu, dehors ? Les oiseaux ne chantent plus.'] });
  e1.pnj('pou_karine_aube', 11, 7, { nom: 'Karine', style: S.karine, dir: -Math.PI / 2, si: FAMILLES,
    repliques: ['Hélène nous a fait sortir par la poterne avant l’aube. On n’a rien vu de la suite.', 'Noa dort beaucoup. La nuit, je compte ses respirations.'] });
  e1.pnj('pou_noa_aube', 12, 6, { nom: 'Noa', style: S.noa, dir: Math.PI / 2, si: FAMILLES,
    repliques: ['On a marché dans le noir. Théo m’a portée sur son dos.', 'Tu crois qu’Hélène va venir ? Elle a dit qu’elle viendrait.'] });
  e1.pnj('pou_theo', 15, 4, { nom: 'Théo', style: S.theo, dir: 0, si: FAMILLES,
    repliques: ['D’ici, on voit l’étang. Il n’y a pas un bateau.', 'Maman dit qu’on repartira quand les autres seront là.'] });
  // la salle d'eau
  e1.nommer(6, 10, 'La maison du gardien — la salle d’eau', { sol: 'carrelage', sombre: 1, sansMorts: true });
  e1.objet('baignoire', 5, 9, { nom: 'la baignoire' });
  e1.objet('lavabo', 5, 11, { nom: 'le lavabo' });
  e1.objet('wc', 8, 11);
});
