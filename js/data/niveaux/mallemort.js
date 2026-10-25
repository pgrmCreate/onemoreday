// Les ponts de Mallemort (ACTE V, le final) — format à couches (js/carte/plan.js), version 1.
// En une phrase : sur la rive sud de la Durance, le camp d'attente où des centaines de gens campent sans feu devant le pont
// suspendu barré par l'armée, qui ne l'ouvrira qu'une heure, à l'aube du mercredi 7 octobre (docs/HISTOIRE.md §6, acte V).
// Réel : pont suspendu de 1844-1848 (Marc Seguin, 320 m, pylônes de pierre), rouvert en passerelle en 2025 ; pont routier
// de 1980 à côté ; en face, Mérindol (Vaucluse), où l'armée tient la ligne Durance. Longueurs très compressées.
//
// Organisation (72 × 48 unités, nord en haut) :
//   - LA RIVE NORD (y 0..5) : l'armée. Sacs de sable, tentes, un camion, deux projecteurs qui éclairent le pont toute la
//     nuit ; hors d'atteinte (cases bloquées) : on la voit, on n'y va pas ;
//   - LA DURANCE (y 6..27), haute et brune ; personne ne la traverse ;
//   - LE PONT ROUTIER (x 10..15) : muré de conteneurs empilés au milieu de la rivière, une impasse ;
//   - LE PONT SUSPENDU (x 44..48) : ses pylônes de pierre, le tablier de planches entre les câbles, la ligne des 200 mètres
//     peinte en travers, et au bout la ligne de l'armée ; À L'ENTRÉE, côté sud, la grille de l'armée, flanquée de chevaux
//     de frise et de sacs de sable : fermée tant que le pont n'est pas ouvert (drapeau `pont_fait`), et elle dit pourquoi ;
//     devant elle, une bande vide où personne ne s'assoit (on tire sur qui s'approche) ;
//   - LE CAMP D'ATTENTE (rive sud, y 29..37, de part et d'autre de la bande vide) : des tentes, des couvertures posées dans
//     l'herbe et, autour, une trentaine de figurants assis, présents de l'annonce du pont (`pont_annonce`) à son passage
//     (`pont_fait`) ; des feux ÉTEINTS (l'armée les interdit), des voitures garées au bord de la route ;
//   - LA ROUTE D17d (y 38..40), d'ouest en est : les deux sorties ; au sud, le bar du pont et la maison de l'éclusier.
// Peuplement : tant que le camp est là, aucun mort sur la rive sud (meta refuge + tout le lieu sansMorts : l'armée tire
// sur ceux qui approchent) ; quelques morts avant l'annonce (si pasFlag pont_annonce), d'autres quand le camp a passé le
// pont (si pont_fait) : la rive sud redevient un lieu comme un autre.
//
// Check-list (docs/RETOURS_JOUEUR.md §3) :
//   [x] sens et taille : lieu clé du final, compact, sans abords ; le camp, le pont, la route et deux bâtiments à fouiller ;
//   [x] peuplement : les vivants ont leur raison visible (l'armée en face, la grille, les projecteurs) ; aucun mort
//       procédural (sansMorts) ; avant / après : les figurants et les morts ont leur condition ;
//   [x] portes : la grille du pont dit pourquoi elle est fermée ; toutes les autres s'ouvrent ; 2 unités libres derrière ;
//   [x] réalisme : le bar a ses toilettes, la maison de l'éclusier est un logement complet ;
//   [x] repérage : les pylônes et les projecteurs se voient de loin ; chaque pièce a un nom ; sorties au bord de la route.
import { plan } from '../../carte/plan.js';

const W = 72, H = 48;
const CAMP = { flag: 'pont_annonce', pasFlag: 'pont_fait' };      // le camp d'attente : de l'annonce au passage du pont
const AVANT = { pasFlag: 'pont_annonce' };
const APRES = { flag: 'pont_fait' };
const NORD = -Math.PI / 2;

// des silhouettes de réfugiés (couleurs, coiffures) ; un enfant est plus petit
const S = [
  { manteau: '#4a3a30', pantalon: '#2a2622', cheveux: '#7a7068', coiffure: 'court' },
  { manteau: '#2c3f66', pantalon: '#22262c', cheveux: '#c9a35a', coiffure: 'long' },
  { manteau: '#7a2a26', pantalon: '#2c3440', cheveux: '#2a1c12', coiffure: 'court' },
  { manteau: '#5e6066', pantalon: '#24272c', cheveux: '#6b4a2a', coiffure: 'long' },
  { manteau: '#3d4a36', pantalon: '#3a3530', cheveux: '#1a1410', coiffure: 'court' },
  { manteau: '#7a6a4a', pantalon: '#2f2a24', cheveux: '#3a2a1a', coiffure: 'long' },
  { manteau: '#5a4a52', pantalon: '#2e2a2c', cheveux: '#c8c4bc', coiffure: 'long' },
  { manteau: '#8a5a3a', pantalon: '#26282e', cheveux: '#4a2e1a', coiffure: 'court' },
];
const ENFANT = (k) => ({ ...S[k % S.length], taille: 0.72 });
const SOLDAT = { manteau: '#4e5440', pantalon: '#3e4232', cheveux: '#241a12', coiffure: 'court' };

// Ce qu'on dit dans le camp (une ou deux répliques par figurant, tirées dans l'ordre).
const DIRE = [
  ['Ils ouvrent à l’aube, une heure. Après, plus personne ne passe jusqu’à la semaine suivante.'],
  ['Pas de feu. Le premier soir, quelqu’un en a allumé un, et ils ont tiré en l’air depuis l’autre rive.'],
  ['On vient de Pélissanne. On était quarante au départ.', 'On a marché quatre jours, en évitant les routes.'],
  ['Il paraît qu’ils te déshabillent sous une lampe. Une seule morsure, et c’est non.'],
  ['Mon frère est de l’autre côté, à Mérindol. Il m’attend, je le sais.'],
  ['Tu as un nom sur la liste ? Nous, on n’avait pas de refuge. On tente quand même.'],
  ['Ne t’approche pas de la grille. Ils tirent à deux cents mètres, et ils ne préviennent qu’une fois.'],
  ['Les projecteurs restent allumés toute la nuit. On dort mal, mais on dort.'],
  ['J’ai donné ma montre à un soldat pour qu’il note notre nom. Je ne sais pas s’il l’a fait.'],
  ['Ça fait trois nuits qu’on attend ici. On mange ce qu’on a apporté, et on le partage de moins en moins.'],
  ['De l’eau, il y en a dans la Durance. Sans feu, on ne peut pas la faire bouillir, alors on garde les bouteilles.'],
  ['Chut. La petite dort enfin.'],
  ['Il faut être recensé. Les autres passeront le mercredi d’après, s’il y en a un.'],
  ['Notre voiture est tombée en panne sèche à dix kilomètres d’ici. On a fini à pied, avec les valises.'],
  ['On s’est cachés huit jours dans la réserve d’un supermarché, à Salon. Huit jours sans voir le ciel.'],
  ['Un soldat a crié dans un mégaphone : « Restez assis, gardez vos papiers, pas de lumière. » Depuis, on obéit.'],
  ['Regarde les sacs de sable. Ils ne veulent pas qu’on passe, ils veulent qu’on attende.'],
  ['Mon fils tousse depuis la brume. Ils vont croire qu’il est malade, et il ne l’est pas.'],
  ['Je n’ai jamais aimé ce pont. Il bouge quand on marche dessus.'],
  ['On a tout laissé à Lambesc. Je n’ai gardé que les photos.'],
  ['Quand ils ouvriront, il ne faudra pas courir. Ceux qui courent, ils les arrêtent.'],
  ['Tu as quelque chose à manger ? C’est pour le petit, pas pour moi.'],
  ['La Durance est haute, avec les pluies. N’essaie pas de traverser à la nage, d’autres ont essayé.'],
  ['On prie, ici, même ceux qui ne priaient pas.'],
  ['On était au lycée de Lamanon avec les profs. Les profs sont restés là-bas.'],
  ['Ils ont dit un mot de passe par refuge. Ceux qui n’en ont pas, ils les mettent à part.'],
  ['J’ai compté les tentes : trente-deux. Et toutes les familles qui n’en ont pas.'],
  ['Ma mère a quatre-vingt-sept ans. Elle dit qu’elle a déjà traversé ce pont à pied, en 44, dans l’autre sens.'],
];
const ENFANTS = [
  ['Maman dit qu’on verra des soldats gentils de l’autre côté.'],
  ['J’ai pas le droit de jouer au ballon. Ça fait du bruit.'],
  ['Le pont, il est vieux comme mon arrière-grand-père, c’est papa qui l’a dit.'],
  ['On a dormi dans la voiture. C’était bien.'],
];
const NOMS = ['Josiane', 'Marc', 'Nadia', 'Kévin', 'Sylvie', 'Abdel', 'Margaux', 'Christophe', 'Laura', 'Mehmet', 'Jacqueline',
  'Dylan', 'Sophie', 'Bernard', 'Amina', 'Éric', 'Fatima', 'Jean-Pierre', 'Manon', 'Gilles', 'Océane', 'Antoine', 'Yvette',
  'Rachid', 'Pauline', 'Thierry', 'Sébastien', 'Ginette'];
const NOMS_ENFANTS = ['Lina', 'Nathéo', 'Jade', 'Mattéo'];

export default plan({
  id: 'mallemort', nom: 'Les ponts de Mallemort', exterieur: true, version: 1, typeButin: 'village',
  pool: ['errant', 'errant', 'coureur', 'putrefie', 'gonfleur'], morts: { n: [0, 1] },
  refuge: CAMP,                                                   // tant que le camp est là : aucun mort ne reste sur la rive sud
}, (p) => {
  const e = p.etage('rive_sud', 'Mallemort', W, H, { sol: 'herbe' });
  const bloquer = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) e.forcer(xx, yy, { bloque: true }); };

  // ======================= Le sol, la Durance, les berges =======================
  e.taches('herbe_seche', 0, 29, W, 19, 0.2, 1.6);
  e.taches('terre', 17, 29, 54, 9, 0.12, 1.3);                     // l'herbe foulée du camp
  e.solRect('sable', 0, 27, W, 2);                                 // la grève, côté sud
  e.solRect('sable', 0, 5, W, 1);                                  // la grève, côté nord
  e.eau(0, 6, 10, 21); e.eau(16, 6, 28, 21); e.eau(49, 6, 23, 21); // la Durance (les ponts passent au-dessus)
  for (const x of [2, 6, 20, 26, 32, 38, 54, 60, 66, 70]) e.objet('cannier', x, 27, { nom: 'les roseaux' });
  for (const x of [4, 24, 36, 58, 64]) e.objet('cannier', x, 28, { nom: 'les roseaux' });

  // ======================= LA RIVE NORD : l'armée (hors d'atteinte) =======================
  e.solRect('herbe_jaunie', 0, 0, W, 5);
  bloquer(0, 0, W, 6);
  e.rangee('sacs_sable', 30, 4, 7, 4, 0, { nom: 'les sacs de sable de l’armée' });
  e.objet('tente', 22, 0, { nom: 'une tente de l’armée', conteneur: false });
  e.objet('tente', 60, 0, { nom: 'une tente de l’armée', conteneur: false });
  e.objet('camion_mil', 64, 3, { lumiere: false, conteneur: false });
  for (const x of [40, 52]) { e.objet('machine', x, 3, { nom: 'un projecteur de l’armée', conteneur: false }); e.lumiere('lampadaire', x + 0.5, 3.5, { r: 11, i: 0.95 }); }
  e.objet('poteau', 46, 2, { nom: 'le mât de l’armée' });

  // ======================= LE PONT ROUTIER (x 10..15) : muré de conteneurs =======================
  e.solRect('bitume', 11, 6, 4, 32);
  e.murRect('muret', 10, 6, 1, 22); e.murRect('muret', 15, 6, 1, 22);
  e.murRect('tole', 11, 15, 4, 1);                                   // le mur de conteneurs, au milieu de la rivière
  e.objet('conteneur', 11, 16, { w: 4, h: 2, nom: 'les conteneurs empilés', conteneur: false });
  bloquer(11, 6, 4, 9);                                              // au-delà du mur : hors d'atteinte
  e.decal('marquage', 12.5, 24, { a: Math.PI / 2, r: 0.8 }); e.decal('marquage', 12.5, 31, { a: Math.PI / 2, r: 0.8 });
  e.objet('voiture_calcinee', 11, 20, { rot: 1, w: 2, h: 3, nom: 'une voiture brûlée' });

  // ======================= LE PONT SUSPENDU (x 44..48) =======================
  e.solRect('planches', 45, 6, 3, 23);
  e.murRect('pierre', 42, 6, 3, 3); e.murRect('pierre', 48, 6, 3, 3);      // les pylônes nord
  e.murRect('pierre', 42, 26, 3, 3); e.murRect('pierre', 48, 26, 3, 3);    // les pylônes sud
  e.murRect('grille', 44, 9, 1, 17); e.murRect('grille', 48, 9, 1, 17);    // les câbles et les garde-corps
  e.decal('marquage', 46.5, 17.5, { a: 0, r: 1.4 });                        // la ligne des 200 mètres, peinte en travers
  e.decal('marquage', 45.6, 17.5, { a: 0, r: 0.6 }); e.decal('marquage', 47.4, 17.5, { a: 0, r: 0.6 });
  // au bout, la ligne de l'armée : sacs de sable et chevaux de frise ; au-delà, on ne passe pas
  e.murRect('grille', 45, 9, 3, 1);
  e.objet('sacs_sable', 45, 10, { w: 2, h: 1, nom: 'les sacs de sable de l’armée' });
  e.objet('barriere', 47, 10, { w: 1, h: 1, nom: 'les chevaux de frise' });
  bloquer(45, 6, 3, 3);
  for (const x of [45, 47]) e.pnj(`mal_soldat_${x}`, x, 7, { nom: 'Un soldat', style: SOLDAT, dir: Math.PI / 2,
    repliques: ['Reculez ! Personne ne passe avant l’aube.'] });
  e.nommer(46, 20, 'Le pont suspendu', { sol: 'planches', exterieur: true, sansMorts: true });

  // --- l'entrée, côté sud : la grille de l'armée, les chevaux de frise, les sacs de sable ---
  e.murRect('grille', 45, 28, 1, 1); e.murRect('grille', 47, 28, 1, 1);
  e.porte(46, 28, { verrou: { flag: 'pont_fait' }, exterieure: true, style: 'grille', nom: 'la grille du pont',
    message: 'L’armée n’ouvre le pont qu’à l’aube du mercredi, une heure. Personne ne passe avant.' });
  e.objet('barriere', 42, 29, { w: 2, h: 1, nom: 'les chevaux de frise' });
  e.objet('barriere', 49, 29, { w: 2, h: 1, nom: 'les chevaux de frise' });
  e.objet('sacs_sable', 40, 30, { w: 2, h: 1, nom: 'les sacs de sable' });
  e.objet('sacs_sable', 51, 30, { w: 2, h: 1, nom: 'les sacs de sable' });
  e.objet('poteau', 44, 31, { nom: 'le panneau de l’armée : « ZONE MILITAIRE. NE PAS APPROCHER. »' });

  // ======================= LE CAMP D'ATTENTE (rive sud, y 29..37) =======================
  // les tentes (aux familles : on ne les fouille pas)
  for (const [x, y] of [[18, 29], [27, 29], [36, 29], [53, 29], [62, 29]]) e.objet('tente', x, y, { nom: 'la tente d’une famille', conteneur: false });
  // les couvertures, et autour, les gens assis qui attendent
  const COUV = [[22, 30], [31, 30], [19, 34], [26, 34], [34, 34], [57, 30], [66, 30], [54, 34], [61, 34], [67, 34]];
  const COULEURS = ['#7a2a26', '#2c4a6a', '#6a6a3a', '#5a3a5a', '#3a5a4a', '#8a6a3a', '#4a4a52', '#7a4a2a', '#2a4a3a', '#6a3a3a'];
  let k = 0, ke = 0;
  COUV.forEach(([cx, cy], i) => {
    e.objet('tapis', cx, cy, { w: 3, h: 2, nom: 'une couverture', couleur: COULEURS[i] });
    const centre = [cx + 1.5, cy + 1];
    for (const [x, y] of [[cx - 1, cy], [cx + 3, cy + 1], [cx + 1, cy + 2]]) {
      const dir = Math.atan2(centre[1] - (y + 0.5), centre[0] - (x + 0.5));
      const enfant = (i * 3 + (x + y)) % 7 === 0 && ke < NOMS_ENFANTS.length;
      if (enfant) { e.pnj(`mal_enfant_${ke}`, x, y, { nom: NOMS_ENFANTS[ke], style: ENFANT(ke), dir, si: CAMP, repliques: ENFANTS[ke] }); ke++; continue; }
      e.pnj(`mal_camp_${k}`, x, y, { nom: NOMS[k % NOMS.length], style: S[(k * 3 + i) % S.length], dir, si: CAMP, repliques: DIRE[k % DIRE.length] }); k++;
    }
  });
  // deux qui regardent le pont, debout au bord de la bande vide
  e.pnj('mal_guet_1', 39, 33, { nom: 'Gilbert', style: S[0], dir: NORD, si: CAMP, repliques: ['Je compte les soldats sur l’autre rive. Ils sont douze, la nuit. Le jour, je ne sais pas.'] });
  e.pnj('mal_guet_2', 52, 33, { nom: 'Nicole', style: S[3], dir: NORD, si: CAMP, repliques: ['Mon mari est passé la dernière fois, en éclaireur. Il devait revenir me chercher.'] });
  // les feux éteints (l'armée interdit les feux), les sacs, les bidons
  for (const [x, y] of [[29.5, 33], [23.5, 36.6], [36.5, 36.6], [60.5, 33], [64.5, 37]]) { e.decal('cendres', x, y, { r: 0.55 }); e.decal('cendres', x + 0.3, y - 0.2, { r: 0.3 }); }
  for (const [x, y] of [[21, 33], [33, 33], [58, 33], [69, 33]]) e.objet('fut', x, y, { nom: 'un bidon d’eau', conteneur: false });
  e.semer('papiers', 17, 29, 54, 9, 14);
  e.semer('ordures', 17, 29, 54, 9, 8, { r: 0.35 });

  // ======================= LA ROUTE D17d (y 38..40) et ses voitures garées =======================
  e.solRect('bitume', 0, 38, W, 3);
  e.solRect('trottoir', 0, 37, 10, 1); e.solRect('trottoir', 16, 37, 56, 1);
  for (const x of [6, 22, 34, 50, 62]) e.decal('marquage', x, 39.5, { a: 0, r: 0.9 });
  const garees = [['voiture', 17], ['citadine', 21], ['break', 25], ['voiture', 29], ['camionnette', 33], ['suv', 38], ['camping_car', 43], ['voiture', 49]];
  for (const [type, x] of garees) e.objet(type, x, 41, { nom: 'une voiture de réfugiés', conteneur: false });
  e.sortie(0, 38, 1, 3); e.sortie(W - 1, 38, 1, 3);
  e.entree('defaut', 2, 39);
  e.entree('camp', 30, 37);
  for (const x of [19, 27, 41, 47]) e.objet('platane', x, 45);
  e.objet('pin', 33, 46); e.objet('olivier', 51, 46);

  // ======================= LE BAR DU PONT (x 3..14, y 41..47) =======================
  const bar = e.batiment(3, 41, 12, 7, { nom: 'Le bar du pont', sol: 'carrelage', sombre: 1, sansMorts: true,
    portes: [{ cote: 'n', a: 4, style: 'vitree', nom: 'la porte du bar' }], fenetres: [{ cote: 'n', a: 1, l: 2 }, { cote: 'n', a: 6, l: 1 }] });
  e.objet('comptoir', bar.x0, bar.y0 + 2, { w: 3, h: 1, nom: 'le comptoir du bar' });
  e.objet('etagere', bar.x0, bar.y0 + 4, { w: 3, h: 1, nom: 'les étagères à bouteilles' });
  e.objet('table_ronde', bar.x0 + 6, bar.y0); e.objet('chaise', bar.x0 + 6, bar.y0 + 1);
  e.objet('table_ronde', bar.x0 + 4, bar.y0 + 3); e.objet('chaise', bar.x0 + 4, bar.y0 + 4);
  e.decal('verre', bar.x0 + 5.4, bar.y0 + 2.2, { r: 0.4 }); e.decal('papiers', bar.x0 + 3, bar.y0 + 1, { n: 2 });
  // les toilettes, au fond du bar (on y entre par une porte de la salle)
  e.cloison('platre', bar.x1 - 2, bar.y0, bar.x1 - 2, bar.y1);
  e.porte(bar.x1 - 2, bar.y0 + 3, { nom: 'la porte des toilettes' });
  e.objet('wc', bar.x1, bar.y0); e.objet('lavabo', bar.x1 - 1, bar.y0);
  e.nommer(bar.x1 - 1, bar.y0 + 2, 'Les toilettes', { sol: 'carrelage', sombre: 2, sansMorts: true });

  // ======================= LA MAISON DE L'ÉCLUSIER (x 54..65, y 41..47) =======================
  const ec = e.batiment(54, 41, 12, 7, { nom: 'La maison de l’éclusier', sol: 'tomettes', sombre: 1, sansMorts: true,
    portes: [{ cote: 'n', a: 2, nom: 'la porte de l’éclusier' }], fenetres: [{ cote: 'n', a: 0, l: 1 }, { cote: 'n', a: 4, l: 1 }, { cote: 'e', a: 1 }] });
  // la salle (cuisine, table) à l'ouest ; la chambre et la salle de bain à l'est, derrière une cloison
  e.objet('cuisine', ec.x0, ec.y1, { w: 3, h: 1, nom: 'les placards de la cuisine' });
  e.objet('table', ec.x0, ec.y0 + 2, { w: 2, h: 1 }); e.objet('chaise', ec.x0, ec.y0 + 3);
  e.objet('frigo', ec.x0 + 3, ec.y1);
  e.cloison('platre', ec.x0 + 5, ec.y0, ec.x0 + 5, ec.y1);
  e.cloison('platre', ec.x0 + 6, ec.y0 + 2, ec.x1, ec.y0 + 2);
  e.porte(ec.x0 + 5, ec.y0 + 1, { nom: 'la porte de la chambre' });
  e.porte(ec.x0 + 5, ec.y0 + 3, { nom: 'la porte de la salle de bain' });
  e.objet('lit_simple', ec.x1, ec.y0, { w: 1, h: 2, nom: 'le lit de l’éclusier' });
  e.nommer(ec.x0 + 7, ec.y0, 'La chambre', { sol: 'parquet', sombre: 1, sansMorts: true });
  e.objet('wc', ec.x1, ec.y1); e.objet('lavabo', ec.x1, ec.y0 + 3);
  e.nommer(ec.x0 + 7, ec.y1, 'La salle de bain', { sol: 'carrelage', sombre: 2, sansMorts: true });
  e.decal('papiers', ec.x0 + 2.5, ec.y0 + 1.2, { n: 2 });

  // ======================= Le nom du dehors, et les morts =======================
  e.nommer(8, 33, 'Mallemort, la rive sud', { exterieur: true, sansMorts: true });
  // avant l'annonce du pont (on ne vient pas ici avant l'acte V) : quelques errants sur la rive sud
  for (const [x, y] of [[8, 32], [30, 36], [60, 33], [24, 44], [45, 45]]) e.zombie('errant', x, y, { etat: 'erre', si: AVANT });
  // quand le camp a passé le pont : la rive sud est vide, et les morts reviennent
  for (const [x, y, t] of [[20, 32, 'errant'], [35, 36, 'errant'], [58, 32, 'putrefie'], [66, 36, 'errant'], [28, 44, 'coureur'], [52, 45, 'errant']]) {
    e.zombie(t, x, y, { etat: 'erre', si: APRES });
  }
});
