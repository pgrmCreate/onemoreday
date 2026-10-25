// La bergerie de Cabassole (ACTE II, « La bergerie ») — format à couches (js/carte/plan.js).
// En une phrase : la bergerie isolée de Gérard Pons, vieux berger de la Crau, où Fernand et le joueur viennent chercher
// les antibiotiques vétérinaires pour Noa, et où ils passent la nuit au coin du feu avant de rentrer à l'aube.
// Réel : une bergerie de Crau, c'est un très long bâtiment bas en galets et en pierre, à toit de tuiles à deux pentes,
// ouvert par de grandes portes au sud (à l'abri du mistral) ; à côté, le « parc » (enclos de pierre sèche), la petite
// maison du berger (le mas) et sa cheminée, un puits à balancier, une haie de cyprès coupe-vent au nord ; tout autour,
// les coussouls, une steppe de galets et d'herbe rase où l'on voit venir de loin.
//
// Organisation (56 × 44 unités, nord en haut) :
//   - au nord, la haie de cyprès (y 1) protège la bergerie et le mas ;
//   - LA BERGERIE (x 10..37, y 4..13 ; 26 × 8 dedans, terre et paille, pénombre) : deux grandes portes au sud, l'une côté
//     cour (est), l'autre côté parc (ouest) ; derrière chacune, un déclencheur (ber_gerard, une seule fois : la scène
//     pose gerard_vu). Au fond (ouest), Gérard debout parmi ses brebis mortes, tourné vers l'enclos où trois brebis
//     vivantes sont serrées derrière un muret bas (l'enclos fait partie de la nef : on voit les brebis par-dessus) ;
//   - LE MAS (x 37..48, y 4..12), accolé au pignon est de la bergerie (comme le dit ber_arrivee), sans porte entre les
//     deux : la salle commune (cheminée allumée, table, le lit de Gérard, le lit de camp de Fernand) et la souillarde
//     (l'armoire du vétérinaire contre le mur du fond, l'évier de pierre sous la fenêtre). Sûr pour la nuit (sansMorts) ;
//   - LA COUR (au sud du mas) : le puits à balancier (eau inépuisable), la tombe du chien sous l'amandier, le foyer éteint,
//     le pick-up de Gérard, et au fond de la cour le cabinet des toilettes ;
//   - LE PARC à moutons (x 10..23, y 16..26), enclos de pierre sèche à deux barrières ;
//   - LES COUSSOULS tout autour : galets et herbe sèche, de longs murets qui servent de repères, deux cairns, le cabanon de
//     pierre en ruine à l'ouest (quelqu'un y a dormi : sac de couchage moisi, boîtes vides, cendres), deux morts errants
//     loin de la cour ;
//   - LA DRAILLE arrive de l'est (de Miramas) : entrées `draille` et `defaut`, une seule sortie au bord est.
// Peuplement : Gérard (mort scénarisé, flagMort gerard_acheve) ; 2 errants au sud ; aucun mort procédural à l'intérieur
// (mortsDehorsSeulement) ; le mas et le cabinet sont sansMorts, et le lieu est un refuge (meta refuge) tant que Fernand y
// est : on dort en sûreté au mas. La bergerie n'est PAS sansMorts (le refuge en chasserait Gérard).
// Lumières : la cheminée du mas, rien d'autre (la nuit est noire dans la Crau ; le foyer de la cour est éteint).
// Sortie : fermée tant que dure la nuit de l'acte II (Fernand ne marche pas de nuit). Elle s'ouvre après la frappe
// (frappe_faite), dans la branche où l'on rentre de nuit (retour_nuit), et pour qui vient ici sans être parti avec
// Fernand (jeu libre, pasFlag depart_crau).
//
// Check-list (docs/RETOURS_JOUEUR.md §3) :
//   [x] sens et taille : lieu clé de l'acte II, cœur 56 × 44, abords: false, rien n'est à plus de ~20 unités d'un repère ;
//   [x] chaque pièce a une fonction (scène, couchage, armoire, eau, toilettes, traces) ; aucune pièce pour faire grand ;
//   [x] Fernand vivant : il arrive avec le joueur ; le mas est sansMorts et le lieu est un refuge tant qu'il est là ;
//   [x] lieux_gameplay.bergerie.morts = [0, 1] : cohérent (un mort procédural au plus, et seulement dehors) ;
//   [x] morts scénarisés conditionnels : Gérard disparaît une fois achevé (si pasFlag gerard_acheve) ;
//   [x] traces : brebis mortes, tombe du chien, foyer éteint, cabanon squatté (couchage, boîtes, cendres) ;
//   [x] portes : toutes s'ouvrent (aucune verrouillée ; l'armoire du vétérinaire est fermée à clé par sa scène, ber_armoire) ;
//   [x] 2 unités libres derrière chaque porte, aucun meuble au seuil (vérifié au script) ;
//   [x] pas d'étage ;
//   [x] réalisme (P15) : WC dans le cabinet au fond de la cour, évier et cuvette dans la souillarde ; exceptions déclarées
//       ci-dessous (sansSanitaires) ;
//   [x] repérage : toutes les pièces nommées ; repères : la haie de cyprès, la bergerie, le puits, le parc, les murets ;
//   [x] danger lisible : pas de séquence de discrétion imposée ; Gérard est dans la pénombre mais la scène le montre ;
//   [ ] mission : aucune (la quête q_crau passe par les scènes) ;
//   [~] lumières : le moteur ne sait pas encore allumer une lumière selon un drapeau ; le feu de la cheminée brûle donc
//       toujours, même après le départ de Fernand (à reprendre quand les lumières accepteront `si`).
import { plan } from '../../carte/plan.js';

const W = 56, H = 44;
// Toit d'un bâtiment à plusieurs pièces : le même rectangle, rattaché à chaque pièce par une case de référence (le rendu
// ne dessine un toit que sur la pièce de sa référence et ses murs).
const toitSur = (e, x, y, w, h, refs, type = 'tuiles') => { for (const ref of refs) e.toits.push({ x, y, w, h, type, ref }); };

export default plan({
  id: 'bergerie', nom: 'La bergerie de Cabassole', exterieur: true, abords: false, version: 1, typeButin: 'nature',
  // pas de WC dans ces bâtiments, et c'est normal : la bergerie est pour les bêtes ; le mas a ses toilettes
  // dans le cabinet au fond de la cour, à une dizaine de mètres de la porte, comme dans les vieux mas de la Crau
  // (tools/verifier_realisme.mjs ; le mas a bien son évier et sa cuvette)
  sansSanitaires: ['La bergerie', 'Le mas — la salle commune'],
  pool: ['errant', 'errant', 'rampant'], morts: { n: [0, 1] }, mortsDehorsSeulement: true,
  // la nuit de l'acte II, tant que Fernand est là : le mas (pièces sansMorts) est un refuge, on y dort en sûreté
  refuge: { flag: 'depart_crau', pasFlag: 'frappe_faite' },
}, (p) => {
  const e = p.etage('rdc', 'La bergerie de Cabassole', W, H, { sol: 'herbe_seche' });

  // ======================= Le sol : les coussouls (galets, herbe rase) =======================
  e.taches('cailloux', 1, 1, W - 2, H - 2, 0.2, 1.8);          // les galets de la Crau
  e.taches('herbe_jaunie', 1, 1, W - 2, H - 2, 0.08, 2.2);
  e.taches('terre', 1, 1, W - 2, H - 2, 0.04, 1.3);
  // la cour, damée par les bêtes et les bottes
  e.solRect('terre', 24, 14, 30, 15);
  e.taches('gravier', 24, 14, 30, 15, 0.12, 1.3);
  // la draille : le chemin des moutons, qui arrive de l'est (de Miramas)
  e.chemin('terre', [[55, 21], [49, 20], [43, 20], [37, 21]], 2);
  e.chemin('terre', [[41, 13], [41, 16], [37, 19]], 1);       // du mas au puits
  e.chemin('terre', [[33, 14], [36, 17]], 1);                 // de la grande porte au puits
  e.chemin('terre', [[18, 14], [24, 19]], 1);                 // de la porte de l'ouest au parc
  e.chemin('terre', [[41, 16], [45, 21]], 1);                 // du mas au cabinet, au fond de la cour
  e.chemin('terre', [[24, 21], [33, 21]], 1);                 // du parc à la cour
  e.chemin('terre', [[15, 27], [9, 23]], 1);                  // du parc au cabanon
  e.semer('traces', 26, 17, 28, 7, 22);                        // le passage du troupeau
  e.semer('gravillons', 1, 1, W - 2, H - 2, 70);
  e.semer('herbes', 1, 1, W - 2, H - 2, 45);

  // ======================= La haie de cyprès (coupe-vent, au nord) =======================
  for (let x = 8; x <= 53; x++) e.objet('cypres', x, 1, { nom: 'la haie de cyprès' });

  // ======================= La bergerie =======================
  // pas de sansMorts ici : le refuge (meta) chasserait Gérard de toute pièce sansMorts ; mortsDehorsSeulement suffit
  const b = e.piece(10, 4, 28, 10, { nom: 'La bergerie', sol: 'terre', mur: 'pierre', toit: 'tuiles', sombre: 1,
    portes: [
      { cote: 's', a: 22, nom: 'la grande porte de la bergerie' }, { cote: 's', a: 23, nom: 'la grande porte de la bergerie' },
      { cote: 's', a: 7, nom: 'la grande porte de l’ouest' }, { cote: 's', a: 8, nom: 'la grande porte de l’ouest' },
    ],
    fenetres: [{ cote: 's', a: 12 }, { cote: 's', a: 17 }, { cote: 'n', a: 1 }, { cote: 'n', a: 10 }, { cote: 'n', a: 18 }] });
  // b : x 11..36, y 5..12
  e.taches('herbe_seche', b.x0, b.y0, b.w, b.h, 0.45, 1.1);   // la paille piétinée
  e.semer('herbes', b.x0, b.y0, b.w, b.h, 26);
  // au fond (ouest), l'enclos des trois brebis vivantes, derrière un muret bas ; l'ouverture de la claie reste un passage
  // (pas une porte : l'enclos ferait une pièce à part, avec son propre toit, et on ne verrait plus les brebis de la nef)
  e.murRect('muret', 15, 5, 1, 4); e.murRect('muret', 15, 10, 1, 3);
  const BREBIS = { nom: 'une brebis vivante', message: 'Trois brebis maigres, serrées dans le coin de l’enclos. Elles n’ont pas bu depuis des jours.' };
  e.objet('brebis', 11, 5, BREBIS); e.objet('brebis', 12, 5, BREBIS); e.objet('brebis', 11, 6, BREBIS);
  e.objet('fut', 14, 12, { nom: 'l’auge vide' });
  e.semer('herbes', 11, 5, 4, 8, 6);
  // les mangeoires le long des murs
  for (const x of [17, 22, 27]) e.objet('treteau', x, 5, { w: 2, h: 1, nom: 'la mangeoire', conteneur: false });
  for (const x of [22, 27]) e.objet('treteau', x, 12, { w: 2, h: 1, nom: 'la mangeoire', conteneur: false });
  e.objet('caisson', 36, 5, { nom: 'le coffre à sel du berger' });
  // Gérard, debout parmi ses brebis mortes, tourné vers l'enclos ; sa mort pose gerard_acheve (la clé de l'armoire est à sa ceinture)
  e.zombie('errant', 18, 8, { etat: 'immobile', flagMort: 'gerard_acheve', si: { pasFlag: 'gerard_acheve' }, dir: Math.PI });
  e.marqueur('gerard', 18, 8);
  for (const [x, y] of [[16, 7], [17, 10], [19, 9], [20, 6], [21, 11], [23, 8], [25, 10], [27, 7], [29, 11], [31, 8]]) {
    e.objet('brebis_morte', x, y, { nom: 'une brebis morte' });
  }
  e.decal('flaque_sang', 19.6, 9.6, { r: 0.5 }); e.decal('flaque_sang', 23.4, 8.5, { r: 0.4 }); e.decal('traces', 17.5, 9.2, { a: 3.1 });
  // derrière chacune des deux grandes portes, la scène ; ber_gerard pose gerard_vu dans tous ses choix : elle ne joue qu'une fois
  e.declencheur(31, 5, 6, 8, { scene: 'ber_gerard', unique: true, si: { pasFlag: 'gerard_vu' } });
  e.declencheur(16, 10, 6, 3, { scene: 'ber_gerard', unique: true, si: { pasFlag: 'gerard_vu' } });

  // ======================= Le mas (la maison du berger) =======================
  // accolé au pignon est de la bergerie : le mur x 37 est commun, sans porte entre les deux
  const m = e.piece(37, 4, 12, 9, { nom: 'Le mas — la salle commune', sol: 'tomettes', mur: 'pierre', toit: 'tuiles', sombre: 1, sansMorts: true,
    portes: [{ cote: 's', a: 3, nom: 'la porte du mas' }],
    fenetres: [{ cote: 's', a: 0 }, { cote: 's', a: 8 }, { cote: 'e', a: 2 }] });   // aucune fenêtre au nord : c'est le côté du mistral
  // m : x 38..47, y 5..11 ; la salle commune à l'ouest (x 38..43), la souillarde à l'est (x 45..47)
  toitSur(e, 37, 4, 12, 9, [[46, 8]]);
  e.cloison('pierre', 44, m.y0, 44, m.y1);
  e.porte(44, 8, { nom: 'la porte de la souillarde' });
  // la salle commune
  e.objet('cheminee', 39, 5, { nom: 'la cheminée', conteneur: false });
  e.lumiere('feu', 40, 5.45, { r: 6 });
  e.objet('lit_camp', 38, 5, { nom: 'le lit de camp des tondeurs' });
  e.objet('lit_simple', 43, 10, { nom: 'le lit de Gérard' });
  e.objet('table', 40, 8, { w: 2, h: 1, nom: 'la table de la salle', conteneur: false });
  e.objet('chaise', 40, 9); e.objet('chaise', 41, 9); e.objet('chaise', 40, 7);
  e.objet('armoire', 42, 5, { w: 2, h: 1, nom: 'l’armoire de Gérard' });
  e.pnj('fernand_crau', 41, 6, { marqueur: 'fernand_crau', si: { flag: 'depart_crau', pasFlag: 'frappe_faite' }, dir: Math.PI * 0.75 });
  e.decal('papiers', 40.6, 8.4, { n: 2 });
  // la souillarde (l'arrière-cuisine)
  e.objet('armoire', 45, 5, { w: 2, h: 1, nom: 'l’armoire du vétérinaire', marqueur: 'armoire_veto', conteneur: false });
  e.objet('lavabo', 47, 7, { nom: 'la cuvette et le broc' });
  e.objet('etagere', 47, 9, { w: 1, h: 2, rot: 1, nom: 'l’étagère aux bocaux' });
  e.objet('cuisine', 45, 11, { w: 3, h: 1, nom: 'l’évier de pierre' });
  e.nommer(46, 8, 'Le mas — la souillarde', { sol: 'tomettes', sombre: 1, sansMorts: true });

  // ======================= La cour =======================
  e.objet('fontaine', 35, 18, { nom: 'le puits à balancier', conteneur: false });
  e.objet('poteau', 37, 17, { nom: 'le balancier du puits' });
  e.decal('flaque', 36, 20.3, { r: 0.5 });
  e.objet('amandier', 43, 15);
  e.objet('gravats', 44, 16, { nom: 'la tombe du chien', message: 'Des galets entassés sur de la terre retournée. Un collier de chien est posé dessus.' });
  e.decal('fleurs', 44.5, 17.2, { r: 0.3 });
  e.objet('feu_camp', 29, 19, { nom: 'le foyer de pierres', lumiere: false, message: 'Un cercle de pierres noircies. Les cendres sont froides depuis longtemps.' });
  e.decal('cendres', 29.5, 19.5, { r: 0.45 });
  e.objet('banc', 46, 13, { w: 2, h: 1, nom: 'le banc de Gérard' });
  e.objet('pickup', 49, 16, { nom: 'le pick-up de Gérard' });
  e.objet('palette', 49, 10, { nom: 'le tas de bûches' });
  e.objet('olivier', 26, 15); e.objet('olivier', 31, 27); e.objet('amandier', 40, 26);
  e.objet('cannier', 43, 25, { nom: 'les cannes de Provence' }); e.objet('cannier', 43, 26, { nom: 'les cannes de Provence' });
  // au fond de la cour, le cabinet des toilettes
  const wc = e.piece(44, 22, 4, 5, { nom: 'Les toilettes', sol: 'beton', mur: 'pierre', toit: 'tuiles', sombre: 1, sansMorts: true,
    portes: [{ cote: 'n', a: 0, nom: 'la porte du cabinet' }], fenetres: [{ cote: 'e', a: 1 }] });
  e.objet('wc', wc.x1, wc.y1);

  // ======================= Le parc à moutons (enclos de pierre sèche) =======================
  e.contour('muret', 10, 16, 14, 11);
  e.porte(23, 20, { etat: 'ouverte', style: 'bois', nom: 'la barrière du parc' });
  e.porte(23, 21, { etat: 'ouverte', style: 'bois', nom: 'la barrière du parc' });
  e.porte(15, 26, { etat: 'ouverte', style: 'bois', nom: 'la barrière du parc' });
  e.porte(16, 26, { etat: 'ouverte', style: 'bois', nom: 'la barrière du parc' });
  e.solRect('terre', 11, 17, 12, 9);
  e.taches('boue', 11, 17, 12, 9, 0.1, 1.2);
  e.nommer(18, 22, 'Le parc à moutons', { exterieur: true });
  e.objet('fut', 11, 17, { nom: 'l’abreuvoir' });
  e.objet('brebis_morte', 19, 18, { nom: 'une brebis morte' });
  e.semer('traces', 11, 17, 12, 9, 10);

  // ======================= Le cabanon de pierre en ruine (ouest) =======================
  const ca = e.piece(1, 17, 7, 6, { nom: 'Le cabanon en ruine', sol: 'terre', mur: 'pierre', exterieur: true,
    portes: [{ cote: 'e', a: 2, etat: 'ouverte', nom: 'la porte arrachée du cabanon' }] });
  // ca : x 2..6, y 18..21 ; le toit s'est effondré, des pans de mur sont tombés (murets)
  e.murRect('muret', 3, 17, 3, 1); e.murRect('muret', 1, 20, 1, 2);
  e.objet('gravats', 5, 21, { nom: 'les tuiles tombées' });
  e.objet('matelas', 2, 18, { nom: 'le sac de couchage moisi', conteneur: false });
  e.objet('caisson', 6, 18, { nom: 'les boîtes de conserve vides', conteneur: false,
    message: 'Des boîtes de conserve ouvertes au couteau, vides et léchées. Quelqu’un a dormi ici, il y a des jours.' });
  e.decal('cendres', 4, 20.4, { r: 0.4 });
  e.decal('papiers', 3.5, 19.6, { n: 2 });

  // ======================= Les coussouls : murets, cairns, morts =======================
  // un long muret de pierre sèche est-ouest, troué ; un autre nord-sud ; ce sont les repères de la plaine
  for (let x = 3; x <= 31; x++) if (![8, 9, 19].includes(x)) e.murRect('muret', x, 33, 1, 1);
  for (let y = 31; y <= 42; y++) if (![36, 37].includes(y)) e.murRect('muret', 38, y, 1, 1);
  e.objet('gravats', 24, 39, { nom: 'le cairn' });
  e.objet('gravats', 50, 36, { nom: 'le cairn' });
  e.objet('amandier', 30, 40);
  for (const [x, y, t] of [[6, 29, 'buisson'], [13, 41, 'romarin'], [44, 33, 'buisson'], [52, 41, 'romarin'], [34, 30, 'romarin'], [3, 38, 'buisson'], [18, 30, 'romarin']]) e.objet(t, x, y);
  e.objet('brebis_morte', 26, 36, { nom: 'une brebis morte' });
  e.zombie('errant', 14, 38, { etat: 'erre' });
  e.zombie('errant', 47, 40, { etat: 'erre' });
  e.nommer(30, 36, 'Les coussouls de Cabassole', { exterieur: true });

  // ======================= La draille : arrivée et sortie (est) =======================
  e.entree('draille', 53, 21);
  e.entree('defaut', 53, 21);
  e.sortie(W - 1, 19, 1, 5, {
    si: { ou: [{ flag: 'frappe_faite' }, { flag: 'retour_nuit' }, { pasFlag: 'depart_crau' }] },
    message: 'Fernand ne marche pas de nuit dans la Crau. On repartira à l’aube.',
  });
});
