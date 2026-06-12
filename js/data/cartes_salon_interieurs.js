// ============ Salon-de-Provence — les grands intérieurs ============
// Lieux RÉELS : Pharmacie du Cours (42 cours Victor Hugo), Decathlon City des cours,
// médiathèque (bd Aristide Briand), Cinéplanet de la place Morgan (9 salles, déc. 2021),
// Hôpital du Pays Salonais (207 av. Julien Fabre), commissariat (av. du Pays Catalan),
// hyper E.Leclerc « Les Viougues » (route de Pélissanne), Weldom de la Gandonne
// (rue du Canesteu), garage Renault Sapas (666 bd du Roy René), centre de secours
// des pompiers (rue Emmanuel Vitria).
// Schéma : voir cartes_salon_centre.js (mêmes structures de carte et de case).

export const CARTES_SALON_INTERIEURS = {

  // ════════ PHARMACIE DU COURS — l'officine pillée, la réserve intacte ════════
  // Empreinte en L : la boutique côté cours (vitrine, comptoir, rayons), et derrière
  // la porte « Réservé au personnel », le couloir de service qui dessert le bureau,
  // le préparatoire et la réserve grillagée — aveugle, tout au fond.
  int_pharmacie: {
    nom: 'Pharmacie du Cours', sousTitre: '42 cours Victor Hugo — la croix verte est éteinte',
    echelle: 'interieur', tempsParCase: 1, largeur: 5, hauteur: 4,
    exterieur: false, ambiance: 'sombre', illu: 'pharmacie',
    zombiesPool: ['errant', 'rampant', 'putrefie'],
    passages: [
      ['0,3', '0,2', 'ouvert'], // la vitrine ouvre sur le comptoir — même plateau de vente
      ['2,3', '3,3', 'ouvert'], // l'officine ouvre sur le rayon orthopédie
      ['3,3', '4,3', 'ouvert'], // l'orthopédie ouvre sur la parapharmacie, au bout du plateau
    ],
    murs: [
      ['1,3', '1,2'], // cloison pleine : l'entrée ne donne pas sur le couloir de service
    ],
    cases: {
      // ----- la boutique, côté cours -----
      '0,3': {
        t: 'piece', nom: 'La vitrine', lbl: 'Vitrine', danger: 0.2, mob: 'etageres',
        desc: 'La devanture vantait l\'été : crèmes solaires, eaux thermales, jambes légères. Le soleil a continué sans personne — il décolore les boîtes une à une derrière le verre étoilé.',
        fouille: { max: 2, table: [
          { id: 'savon', q: [1, 1], p: 0.35 }, { id: 'vitamines', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '1,3': {
        t: 'porte', nom: 'Entrée de l\'officine', lbl: 'Sortie', danger: 0.2,
        desc: 'La croix verte pend au-dessus de la porte, éteinte. Sur la vitre fendue, une affiche : « Pensez à renouveler vos ordonnances avant l\'été ». Personne n\'a renouvelé quoi que ce soit.',
        vers: { carte: 'q_cours', x: 7, y: 2, temps: 2 }, versNom: 'Ressortir sur le cours Victor Hugo',
      },
      '2,3': {
        t: 'piece', nom: 'L\'officine', lbl: 'Officine', danger: 0.3, mob: 'rayonnages',
        desc: 'Les présentoirs sont couchés, les tiroirs à médicaments arrachés et vidés en vrac sur le carrelage. Ceux qui sont passés avant toi cherchaient la même chose — mais ils tremblaient trop pour chercher bien.',
        fouille: { max: 3, table: [
          { id: 'antidouleur', q: [1, 1], p: 0.35 }, { id: 'bandage_fortune', q: [1, 2], p: 0.5 },
          { id: 'vitamines', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.6 },
          { id: 'eclat_verre', q: [1, 2], p: 0.6 }, { id: 'canette_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,3': {
        t: 'piece', nom: 'Rayon orthopédie', lbl: 'Orthopédie', danger: 0.25, mob: 'etageres',
        desc: 'Béquilles, attelles, bas de contention sous blister. Un fauteuil roulant attend au milieu de l\'allée, tourné vers la porte, comme si quelqu\'un venait de se lever.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.35 },
          { id: 'chiffon', q: [1, 2], p: 0.6 }, { id: 'sac_plastique', q: [1, 1], p: 0.5 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'Parapharmacie', lbl: 'Parapharm.', danger: 0.25, mob: 'rayonnages',
        desc: 'Shampoings, eaux florales, coton par ballots. Un flacon renversé a figé une coulée nacrée sur le carrelage. Tout un rayon pour rester propre et beau — ça sent encore l\'amande douce, par-dessus le reste.',
        fouille: { max: 3, table: [
          { id: 'savon', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.45 },
          { id: 'vitamines', q: [1, 1], p: 0.3 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
          { id: 'herbes_simples', q: [1, 1], p: 0.25 },
        ] },
      },
      '0,2': {
        t: 'piece', nom: 'Le comptoir', lbl: 'Comptoir', danger: 0.25, mob: 'comptoir',
        desc: 'Des ordonnances éparpillées jusque dans la rue, tamponnées, jamais servies. Sous la caisse, le pharmacien gardait son petit bazar — et son flacon personnel.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 1], p: 0.3 }, { id: 'savon', q: [1, 1], p: 0.35 },
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'portefeuille', q: [1, 1], p: 0.4 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- derrière la porte « Réservé au personnel » -----
      '1,2': {
        t: 'couloir', nom: 'Couloir de service', lbl: '', danger: 0.15,
        desc: 'La porte « Réservé au personnel » bat encore sur ses gonds souples. Derrière, la lumière de la boutique n\'arrive plus qu\'en biais, et une blouse pend à la patère, très blanche, très mince.',
      },
      '2,2': {
        t: 'couloir', nom: 'Couloir de service — les cartons', lbl: '', danger: 0.2, sombre: 1,
        desc: 'La dernière livraison s\'empile le long du mur, jamais déballée, le bordereau encore scotché sur le carton du haut. Daté du 18. Le grossiste promettait de repasser jeudi.',
        fouille: { max: 2, table: [
          { id: 'sac_plastique', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
          { id: 'scotch', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,2': {
        t: 'piece', nom: 'Bureau du titulaire', lbl: 'Bureau', danger: 0.2, mob: 'bureau',
        desc: 'Une blouse blanche sur le dossier de la chaise, un agenda ouvert sur une semaine qui n\'a jamais eu lieu. Le tiroir du bas ferme mal — il a toujours fermé mal.',
        fouille: { max: 2, table: [
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'vitamines', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 1], p: 0.5 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- l'aile du fond -----
      '0,1': {
        t: 'piece', nom: 'Le préparatoire', lbl: 'Prépa', danger: 0.25, sombre: 1, mob: 'etabli',
        desc: 'La paillasse carrelée, la balance de précision sous sa cloche, des flacons bruns étiquetés d\'une écriture penchée. Dans le mortier, une poudre prise en bloc. On composait ici des remèdes sur mesure, pour des gens qui n\'existent plus.',
        fouille: { max: 3, table: [
          { id: 'desinfectant', q: [1, 1], p: 0.4 }, { id: 'bandage', q: [1, 2], p: 0.35 },
          { id: 'bouteille_vide', q: [1, 2], p: 0.4 }, { id: 'eclat_verre', q: [1, 1], p: 0.35 },
          { id: 'herbes_simples', q: [1, 1], p: 0.3 },
        ] },
      },
      '1,1': {
        t: 'couloir', nom: 'Le coude du couloir', lbl: '', danger: 0.2, sombre: 1,
        desc: 'Le couloir tourne et s\'enfonce loin des vitrines. Au bout, la grille de la réserve découpe le noir en petits rectangles — derrière, des rangées de boîtes blanches que tout le monde a vues, que personne n\'a touchées.',
      },
      '1,0': {
        t: 'piece', nom: 'L\'arrière-boutique', lbl: 'Réserve', danger: 0.35, sombre: 2, mob: 'etageres',
        verrou: {
          desc: 'Une grille d\'acier ferme la réserve aux stupéfiants et aux stocks. Les pillards ont tordu deux barreaux, cassé trois ongles, et abandonné. La grille a gagné.',
          options: [
            { methode: 'outil', outil: 'pied_de_biche', label: 'Faire levier sur la grille', tempsMin: 6 },
            { methode: 'outil', outil: 'pince_coupante', label: 'Couper le cadenas de la grille', tempsMin: 4 },
            { methode: 'skill', skill: 'force', niveau: 2, label: 'Écarter les barreaux à mains nues', tempsMin: 12, risque: { p: 0.25, blessure: 'entaille', zones: ['à la main'], texte: 'Le barreau cède d\'un coup et le métal tranchant te laboure la paume.' } },
          ],
        },
        desc: 'Des étagères entières de boîtes blanches, classées par molécule, intactes. Dans le noir, l\'odeur d\'alcool pharmaceutique est presque propre. Presque rassurante.',
        fouille: { max: 4, table: [
          { id: 'antibiotiques', q: [1, 2], p: 0.9 }, { id: 'kit_suture', q: [1, 1], p: 0.5 },
          { id: 'bandage', q: [1, 3], p: 0.7 }, { id: 'desinfectant', q: [1, 2], p: 0.6 },
          { id: 'antidouleur', q: [1, 2], p: 0.6 },
        ] },
      },
    },
  },

  // ════════ DECATHLON CITY — le magasin qui venait d'ouvrir ════════
  // Plateau de vente d'un seul tenant : les portiques côté cours, les caisses,
  // puis les rayons reliés par des ouvertures sans battant. Au fond, derrière
  // la porte « Réservé au personnel », la réserve aveugle sur deux travées et
  // le vestiaire de l'équipe ; sur le flanc, l'atelier cycle et sa régie.
  int_decathlon: {
    nom: 'Decathlon City', sousTitre: 'les cours — il avait ouvert trois semaines avant la fin',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 4,
    exterieur: false, ambiance: 'sombre', illu: 'magasin',
    zombiesPool: ['errant', 'coureur', 'rampant'],
    passages: [
      // — le plateau de vente : un seul volume, aucune porte entre les rayons —
      ['0,2', '1,2', 'ouvert'], // le rayon chaussures ouvre sur les sports et la pêche
      ['1,2', '2,2', 'ouvert'], // les sports ouvrent sur les caisses et l'allée centrale
      ['1,1', '1,2', 'ouvert'], // le rayon vélos donne sur les sports — plateau continu
      ['1,1', '2,1', 'ouvert'], // vélos et camping se touchent au fond du plateau
      ['2,1', '2,2', 'ouvert'], // le camping descend vers l'allée des caisses
      ['2,1', '3,1', 'ouvert'], // camping et fitness, le long du mur du fond
      ['3,1', '4,1', 'ouvert'], // le fitness ouvre sur le textile, au bout du plateau
      ['3,0', '4,0', 'ouvert'], // la réserve est un seul volume, d'une travée à l'autre
      // — les vraies portes —
      ['0,1', '1,1'], // la porte de l'atelier cycle, sur le flanc du rayon vélos
      ['3,1', '3,0'], // la porte « Réservé au personnel » de la réserve, au fond du plateau
      ['4,0', '5,0'], // la porte du vestiaire, tout au fond de la réserve
    ],
    cases: {
      // ----- côté cours : les portiques et le devant du plateau -----
      '2,3': {
        t: 'porte', nom: 'Les portiques d\'entrée', lbl: 'Sortie', danger: 0.2,
        desc: 'Les portiques antivol sont morts, la vitrine étoilée autour d\'un caddie encastré. À l\'intérieur, tout sent encore le neuf — le plastique, le carton, la peinture. La fin du monde a interrompu une inauguration.',
        vers: { carte: 'q_cours', x: 5, y: 2, temps: 2 }, versNom: 'Ressortir sur les cours',
      },
      '2,2': {
        t: 'piece', nom: 'Caisses et allée centrale', lbl: 'Caisses', danger: 0.25, mob: 'comptoir',
        desc: 'Les écrans des caisses sont noirs, un panier de courses abandonné au milieu de l\'allée : gourde, chaussettes, sifflet. Quelqu\'un préparait sa survie avec des articles de sport. Il n\'a pas eu le temps de payer.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 2], p: 0.6 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'casquette', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,2': {
        t: 'piece', nom: 'Rayon sports et pêche', lbl: 'Sports', danger: 0.3, mob: 'ratelier',
        desc: 'Le râtelier des battes de baseball est à moitié vide — tu n\'es pas le premier à avoir l\'idée. Au rayon pêche, les hameçons scintillent dans la pénombre comme des dents minuscules.',
        fouille: { max: 3, table: [
          { id: 'batte_baseball', q: [1, 1], p: 0.6 }, { id: 'canne_peche', q: [1, 1], p: 0.5 },
          { id: 'fil_de_fer', q: [1, 2], p: 0.4 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
        ] },
      },
      '0,2': {
        t: 'piece', nom: 'Rayon chaussures', lbl: 'Chaussures', danger: 0.3, mob: 'etageres',
        desc: 'Des boîtes éventrées jusqu\'au plafond, des chaussures dépareillées partout. Quelqu\'un a essayé des rangers assis sur le banc — il y est toujours, en chaussettes, et il tourne la tête vers toi.',
        fouille: { max: 3, table: [
          { id: 'rangers', q: [1, 1], p: 0.45 }, { id: 'baskets', q: [1, 1], p: 0.6 },
          { id: 'sac_plastique', q: [1, 2], p: 0.5 }, { id: 'canette_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- le fond du plateau, loin des vitrines -----
      '0,1': {
        t: 'piece', nom: 'Atelier cycle', lbl: 'Atelier', danger: 0.3, sombre: 1, mob: 'etabli',
        desc: 'Un vélo est resté serré dans le pied de réparation, roue avant voilée, le carnet d\'atelier ouvert sur le ticket n°12. Le client n\'est jamais revenu. L\'huile de chaîne s\'est figée en larmes noires sur l\'établi.',
        fouille: { max: 3, table: [
          { id: 'cle_molette', q: [1, 1], p: 0.35 }, { id: 'tournevis', q: [1, 1], p: 0.4 },
          { id: 'visserie', q: [1, 2], p: 0.5 }, { id: 'ressort', q: [1, 2], p: 0.4 },
          { id: 'scotch', q: [1, 1], p: 0.35 },
        ] },
      },
      '1,1': {
        t: 'piece', nom: 'Rayon vélos', lbl: 'Vélos', danger: 0.3, sombre: 1, mob: 'ratelier',
        desc: 'Les VTT pendent au mur par la roue avant, trop neufs pour avoir servi. Un antivol coupé traîne entre les râteliers : quelqu\'un est parti d\'ici en pédalant. Tu espères qu\'il roule encore, quelque part.',
        fouille: { max: 3, table: [
          { id: 'gants_cuir', q: [1, 1], p: 0.3 }, { id: 'visserie', q: [1, 2], p: 0.45 },
          { id: 'tuyau_plastique', q: [1, 1], p: 0.3 }, { id: 'sacoche', q: [1, 1], p: 0.25 },
        ] },
      },
      '2,1': {
        t: 'piece', nom: 'Rayon camping', lbl: 'Camping', danger: 0.3, sombre: 1, mob: 'rayonnages',
        desc: 'Une tente d\'exposition encore montée, sacs de couchage en rouleaux, réchauds sous antivol. Tout ce qu\'il fallait pour partir loin. Personne n\'est parti assez loin.',
        fouille: { max: 4, table: [
          { id: 'sac_randonnee', q: [1, 1], p: 0.35 }, { id: 'sac_a_dos', q: [1, 1], p: 0.5 },
          { id: 'rechaud_camping', q: [1, 1], p: 0.4 }, { id: 'cartouche_gaz', q: [1, 2], p: 0.5 },
          { id: 'corde', q: [1, 1], p: 0.5 }, { id: 'lampe_frontale', q: [1, 1], p: 0.45 },
          { id: 'piles', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,1': {
        t: 'piece', nom: 'Rayon fitness', lbl: 'Fitness', danger: 0.25, sombre: 1, mob: 'machines',
        desc: 'Les tapis de course alignés face aux vitres tapissées d\'adhésifs — le jour n\'entre plus que par tranches. Au rayon nutrition, les pots de protéines ont été éventrés sur place ; quelqu\'un a mangé la poudre à pleines mains.',
        fouille: { max: 3, table: [
          { id: 'jogging', q: [1, 1], p: 0.45 }, { id: 'tshirt', q: [1, 2], p: 0.5 },
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'vitamines', q: [1, 1], p: 0.3 },
          { id: 'bouteille_eau', q: [1, 1], p: 0.25 },
        ] },
      },
      '4,1': {
        t: 'piece', nom: 'Rayon textile', lbl: 'Textile', danger: 0.25, mob: 'etageres',
        desc: 'Des portants renversés, des polos bleus de vendeurs pliés derrière le comptoir de retouche. Les mannequins sans tête sont les seules silhouettes dont tu sois sûr, ici.',
        fouille: { max: 3, table: [
          { id: 'jogging', q: [1, 1], p: 0.5 }, { id: 'bonnet', q: [1, 1], p: 0.5 },
          { id: 'gants_laine', q: [1, 1], p: 0.5 }, { id: 'ceinture_cuir', q: [1, 1], p: 0.4 },
          { id: 'tshirt', q: [1, 2], p: 0.6 },
        ] },
      },
      // ----- derrière la porte « Réservé au personnel » -----
      '3,0': {
        t: 'piece', nom: 'La réserve — les palettes', lbl: 'Réserve', danger: 0.4, sombre: 2, mob: 'palettes',
        desc: 'Des cartons de livraison jamais ouverts, gerbés sur trois mètres. Le stock entier d\'un magasin neuf, dans le noir complet. Ta main suit le film plastique des palettes comme une rampe.',
        fouille: { max: 2, table: [
          { id: 'sac_a_dos', q: [1, 1], p: 0.5 }, { id: 'baskets', q: [1, 1], p: 0.4 },
          { id: 'corde', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,0': {
        t: 'piece', nom: 'La réserve — le fond', lbl: '', danger: 0.4, sombre: 2, mob: 'palettes',
        desc: 'Tout au fond, entre les travées, quelque chose s\'est renversé — et continue, doucement, de se renverser. Tu retiens ton souffle pour écouter le sien.',
        fouille: { max: 2, table: [
          { id: 'cartouche_gaz', q: [1, 1], p: 0.4 }, { id: 'bonnet', q: [1, 1], p: 0.4 },
          { id: 'gants_laine', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,0': {
        t: 'piece', nom: 'Vestiaire du personnel', lbl: 'Vestiaire', danger: 0.35, sombre: 2, mob: 'casiers',
        desc: 'Six casiers en tôle, des polos bleus encore sous cellophane. Sur le panneau de liège, le planning de la semaine d\'inauguration et une photo d\'équipe : neuf sourires. Un seul casier est fermé de l\'intérieur.',
        fouille: { max: 3, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
          { id: 'casquette', q: [1, 1], p: 0.35 }, { id: 'biscuits', q: [1, 1], p: 0.3 },
          { id: 'briquet', q: [1, 1], p: 0.25 }, { id: 'savon', q: [1, 1], p: 0.25 },
        ] },
      },
    },
  },

  // ════════ MÉDIATHÈQUE — le seul silence choisi de la ville ════════
  // Deux niveaux sur le même plan : en haut la mezzanine de l'espace musique
  // (salle de répétition, fonds patrimonial, coursive), en bas le plateau de
  // lecture — banque de prêt, presse, tables, adultes, jeunesse, multimédia —
  // prolongé par l'aile de service et sa réserve aveugle. L'escalier relie
  // les deux, à gauche.
  int_mediatheque: {
    nom: 'Médiathèque', sousTitre: 'boulevard Aristide Briand — quarante ans de livres, plus un lecteur',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 6,
    exterieur: false, ambiance: 'calme', illu: 'immeuble',
    zombiesPool: ['errant', 'rampant'],
    passages: [
      ['1,0', '1,1'], // double porte capitonnée de la salle de répétition, sur la coursive
      ['2,0', '2,1'], // porte vitrée du fonds patrimonial
      ['0,3', '0,4', 'ouvert'], // le multimédia ouvre sur la presse — plateau continu
      ['0,3', '1,3', 'ouvert'], // ... et sur les rayonnages adultes
      ['1,3', '2,3', 'ouvert'], // les rayonnages adultes ouvrent sur la jeunesse
      ['1,3', '1,4', 'ouvert'], // ... et sur les tables de lecture
      ['0,4', '1,4', 'ouvert'], // la presse ouvre sur les tables
      ['1,4', '2,4', 'ouvert'], // les tables ouvrent sur la banque de prêt
      ['2,3', '2,4', 'ouvert'], // la jeunesse aussi — le plateau fait le tour
      ['4,3', '5,3', 'ouvert'], // les deux travées de la réserve
    ],
    cases: {
      // ----- la mezzanine -----
      '1,0': {
        t: 'piece', nom: 'Salle de répétition', lbl: 'Répétition', danger: 0.05, sombre: 2, refuge: true, mob: null,
        desc: 'Murs capitonnés, double porte, pas une fenêtre : la salle de répétition de l\'espace musique est insonorisée dans les deux sens. Le seul endroit de Salon où le silence est un choix, pas une menace. Tu pourrais dormir ici sans entendre la fin du monde gratter dehors.',
        fouille: { max: 2, table: [
          { id: 'cable_electrique', q: [1, 1], p: 0.5 }, { id: 'piles', q: [1, 1], p: 0.4 },
          { id: 'chiffon', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Fonds patrimonial', lbl: 'Patrimoine', danger: 0.1, sombre: 1, mob: 'etageres',
        desc: 'Vitrines basses, reliures de cuir sous verre : le fonds ancien, et les Centuries dans une édition d\'époque, ouvertes sur une page que quelqu\'un a longuement consultée. Nostradamus avait prévenu. Personne n\'a voulu lire jusqu\'au bout.',
        fouille: { max: 2, table: [
          { id: 'gants_laine', q: [1, 1], p: 0.3 }, { id: 'carte_quartier', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
        ] },
      },
      '0,1': {
        t: 'escalier', nom: 'Escalier (mezzanine)', lbl: 'Escalier', danger: 0.1,
        desc: 'Le haut des marches débouche sur la coursive. D\'ici, tout le plateau s\'étale en contrebas — les travées, les tables, et ce qui s\'y déplace parfois, lentement, entre les rayonnages.',
      },
      '1,1': {
        t: 'couloir', nom: 'Coursive — l\'espace musique', lbl: '', danger: 0.1,
        desc: 'La coursive de l\'espace musique : bacs de CD, casques pendus à leurs crochets, et la double porte capitonnée qui ne laisse rien filtrer — ni dans un sens, ni dans l\'autre.',
      },
      '2,1': {
        t: 'couloir', nom: 'Coursive — devant le fonds', lbl: '', danger: 0.1,
        desc: 'Le garde-corps de verre longe le vide. Sur la vitre du fonds patrimonial, une affichette : « Manipulation des ouvrages sur rendez-vous ». Plus personne ne prendra rendez-vous.',
      },
      '3,1': {
        t: 'couloir', nom: 'Coursive — le bout', lbl: '', danger: 0.15,
        desc: 'Le bout de la coursive : un fauteuil tourné vers la grande verrière, au-dessus du monde. Quelqu\'un venait lire ici. Le livre est resté ouvert sur l\'accoudoir, face contre ciel.',
      },
      // ----- entre les deux : l'escalier descend -----
      '0,2': {
        t: 'escalier', nom: 'Escalier (rez-de-chaussée)', lbl: 'Escalier', danger: 0.1,
        desc: 'Un escalier de béton clair tourne autour d\'un pilier nu. L\'écho y double chacun de tes pas, comme si quelqu\'un montait toujours derrière toi.',
      },
      // ----- le plateau de lecture, rez-de-chaussée -----
      '0,3': {
        t: 'piece', nom: 'Espace multimédia', lbl: 'Multimédia', danger: 0.15, sombre: 1, mob: 'bureau',
        desc: 'Des écrans noirs en rangées, des casques audio pendus à leurs crochets. Sur le dernier poste, un post-it : « NE PAS ÉTEINDRE — téléchargement en cours ». Il s\'est éteint quand même.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'lampe_torche', q: [1, 1], p: 0.4 },
          { id: 'cable_electrique', q: [1, 2], p: 0.5 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
          { id: 'radio_portable', q: [1, 1], p: 0.3 },
        ] },
      },
      '1,3': {
        t: 'piece', nom: 'Espace adultes', lbl: 'Adultes', danger: 0.15, mob: 'rayonnages',
        desc: 'Des rayonnages à perte de vue, une odeur de papier et de moquette tiède. Au rayon « Vie pratique », quelqu\'un a sorti tous les livres de médecine et de jardinage — il en reste une pile, soigneusement choisie, jamais emportée.',
        fouille: { max: 2, table: [
          { id: 'carte_quartier', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
        ] },
      },
      '2,3': {
        t: 'piece', nom: 'Espace jeunesse', lbl: 'Jeunesse', danger: 0.15, mob: 'fauteuils',
        desc: 'Des coussins en cercle pour l\'heure du conte, des albums ouverts face contre terre. Sur le tapis, un doudou assis bien droit attend le retour des petits lecteurs. Tu évites de le regarder trop longtemps.',
        fouille: { max: 2, table: [
          { id: 'biscuits', q: [1, 1], p: 0.3 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
          { id: 'bonnet', q: [1, 1], p: 0.25 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,3': {
        t: 'couloir', nom: 'Dégagement de service', lbl: '', danger: 0.2, sombre: 1,
        desc: 'Derrière la porte « PRIVÉ », la moquette cède au carrelage. Panneau de liège, plannings, une cafetière froide sur l\'étagère : l\'envers du décor, plus mort encore que le décor.',
      },
      '4,3': {
        t: 'piece', nom: 'La réserve — les compacts', lbl: 'Réserve', danger: 0.3, sombre: 2, mob: 'rayonnages',
        desc: 'Les rayonnages compacts, serrés comme des dents. Tu tournes la manivelle d\'un quart de tour : les travées s\'écartent en grinçant, et quelque chose, plus loin dans le noir, glisse en réponse.',
        fouille: { max: 2, table: [
          { id: 'scotch', q: [1, 1], p: 0.45 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'fil_de_fer', q: [1, 1], p: 0.35 },
        ] },
      },
      '5,3': {
        t: 'piece', nom: 'La réserve — le fond', lbl: '', danger: 0.35, sombre: 2, mob: 'palettes',
        desc: 'Le fond de la réserve, là où le noir est le plus ancien. Des cartons d\'archives gonflés d\'humidité, un diable à roulettes, et sous l\'odeur de papier, cette pointe douceâtre que tu connais trop bien.',
        fouille: { max: 2, table: [
          { id: 'planche', q: [1, 2], p: 0.4 }, { id: 'bache_plastique', q: [1, 1], p: 0.3 },
          { id: 'sac_plastique', q: [1, 2], p: 0.4 },
        ] },
      },
      '0,4': {
        t: 'piece', nom: 'Espace presse', lbl: 'Presse', danger: 0.1,
        desc: 'Les quotidiens des trois derniers jours du monde sont encore sur leurs présentoirs, dans l\'ordre. Tu peux lire la fin arriver, page après page, comme une marée.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [2, 4], p: 0.9 }, { id: 'telephone_mort', q: [1, 1], p: 0.3 },
          { id: 'canette_vide', q: [1, 1], p: 0.3 },
        ] },
      },
      '1,4': {
        t: 'piece', nom: 'Les tables de lecture', lbl: 'Lecture', danger: 0.1, mob: 'table',
        desc: 'Les grandes tables de lecture sous leurs lampes éteintes. Des chaises repoussées en hâte, un livre ouvert dont les pages ont gondolé — des semaines que le silence lit par-dessus les épaules vides.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,4': {
        t: 'piece', nom: 'Banque de prêt', lbl: 'Banque', danger: 0.1, mob: 'comptoir',
        desc: 'Le grand comptoir en arc de cercle, la douchette à code-barres sur son socle. Le registre affiche le dernier emprunt du 19 — un guide des oiseaux de Provence, jamais rendu. Dans le tiroir, les objets trouvés de quarante ans de lecteurs.',
        fouille: { max: 3, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
          { id: 'piles', q: [1, 2], p: 0.3 }, { id: 'briquet', q: [1, 1], p: 0.25 },
        ] },
      },
      // ----- l'entrée, côté boulevard -----
      '2,5': {
        t: 'porte', nom: 'Hall d\'accueil', lbl: 'Sortie', danger: 0.1,
        desc: 'Le chariot des retours attend devant la banque de prêt, plein de livres que personne ne rendra jamais en retard. L\'affiche du club de lecture annonce une séance pour un jeudi qui n\'existe plus.',
        vers: { carte: 'q_cours', x: 9, y: 2, temps: 2 }, versNom: 'Ressortir boulevard Aristide Briand',
      },
    },
  },

  // ════════ CINÉPLANET — la séance qui ne finit jamais ════════
  // Deux niveaux sur le même plan : en haut la cabine de projection et son local
  // technique, desservis par l'escalier de service ; en bas le multiplexe —
  // hall ouvert sur la confiserie, dégagement, et le long couloir des neuf salles.
  int_cineplanet: {
    nom: 'Cinéplanet', sousTitre: 'place Morgan — neuf salles, 1 150 fauteuils, une seule séance',
    echelle: 'interieur', tempsParCase: 1, largeur: 7, hauteur: 6,
    exterieur: false, ambiance: 'sombre', illu: 'immeuble',
    zombiesPool: ['errant', 'coureur', 'hurleur', 'putrefie'],
    passages: [
      ['4,0', '5,0'], // porte du local technique, au fond de la cabine
      ['0,3', '1,3', 'ouvert'], // la salle 1 est un seul volume — les rangs descendent vers l'écran
      ['2,4', '3,4', 'ouvert'], // les bornes sont dans le même hall ouvert que la confiserie
      ['3,4', '4,4', 'ouvert'],
    ],
    murs: [
      ['2,3', '3,3'], // le dégagement ne donne pas dans les salles : on y entre par le couloir
      ['3,3', '4,3'],
    ],
    cases: {
      // ----- la cabine de projection, au-dessus des salles -----
      '4,0': {
        t: 'piece', nom: 'Local technique', lbl: 'Technique', danger: 0.2, sombre: 2, mob: 'etageres',
        desc: 'Des racks de serveurs muets, des écheveaux de câble pendus à leurs crochets, et la grosse soufflerie de la climatisation, figée. Tout le cinéma respirait par cette pièce. Plus rien ne respire ici.',
        fouille: { max: 3, table: [
          { id: 'cable_electrique', q: [1, 2], p: 0.6 }, { id: 'piles', q: [1, 2], p: 0.4 },
          { id: 'scotch', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.4 },
        ] },
      },
      '5,0': {
        t: 'piece', nom: 'Cabine de projection', lbl: 'Cabine', danger: 0.25, sombre: 2, mob: 'machines',
        desc: 'Les projecteurs numériques dorment sous leur housse. Par la lucarne, tu vois la salle 1 en contre-plongée : les rangées de têtes, parfaitement alignées, qui attendent. Tu recules de la vitre très lentement.',
        fouille: { max: 3, table: [
          { id: 'cable_electrique', q: [1, 2], p: 0.6 }, { id: 'lampe_torche', q: [1, 1], p: 0.4 },
          { id: 'ressort', q: [1, 2], p: 0.5 }, { id: 'scotch', q: [1, 1], p: 0.4 },
        ] },
      },
      '6,0': {
        t: 'escalier', nom: 'Palier de la cabine', lbl: 'Escalier', danger: 0.15, sombre: 1,
        desc: 'Le haut des marches sent la poussière chaude des machines, longtemps après leur mort. Par l\'entrebâillement de la porte, la cabine — et son silence de projecteurs couverts.',
      },
      // ----- l'escalier de service descend -----
      '6,1': {
        t: 'escalier', nom: 'Escalier de la cabine', lbl: 'Escalier', danger: 0.2, sombre: 1,
        desc: 'Un escalier de service en béton brut, réservé au personnel. Sur la porte en haut, un autocollant : « Projection — interdit au public ». Le public ne risque plus de monter.',
      },
      // ----- le couloir des salles -----
      '0,2': {
        t: 'couloir', nom: 'Couloir des salles — le cul-de-sac', lbl: '', danger: 0.4, sombre: 1,
        desc: 'Le bout du couloir. L\'issue de secours est cadenassée de l\'extérieur — quelqu\'un a voulu que rien ne sorte par là. Le panneau vert « SORTIE » est mort comme le reste.',
      },
      '1,2': {
        t: 'couloir', nom: 'Couloir des salles — devant la salle 1', lbl: '', danger: 0.4, sombre: 1,
        desc: 'La moquette épaisse avale tes pas. Les numéros des salles luisent faiblement au-dessus des portes capitonnées. Derrière la porte de la salle 1, un son très bas, continu — comme une respiration de groupe.',
      },
      '2,2': {
        t: 'couloir', nom: 'Couloir des salles — devant la salle 2', lbl: '', danger: 0.4, sombre: 1,
        desc: 'Devant la salle 2, une affiche sous verre : une comédie romantique, deux visages qui rient. Quelqu\'un a écrasé sa paume en sang dessus, en travers des sourires.',
      },
      '3,2': {
        t: 'couloir', nom: 'Couloir des salles — le milieu', lbl: '', danger: 0.35, sombre: 1,
        desc: 'Le milieu du couloir. Un bloc de secours grésille encore quelque part, trop faible pour éclairer — juste assez pour faire bouger les ombres.',
      },
      '4,2': {
        t: 'couloir', nom: 'Couloir des salles — devant la salle 3', lbl: '', danger: 0.4, sombre: 1,
        desc: 'La porte de la salle 3 est entrouverte sur du noir absolu. Un gobelet géant est tombé en travers du seuil, sa paille encore plantée dans le couvercle.',
      },
      '5,2': {
        t: 'couloir', nom: 'Couloir des salles — les salles du fond', lbl: '', danger: 0.4, sombre: 1,
        desc: 'Les portes des salles 4 à 9 se succèdent dans le noir, toutes closes. Derrière certaines, rien. Derrière d\'autres, tu préfères ne pas savoir.',
      },
      '6,2': {
        t: 'couloir', nom: 'Fond du couloir — la porte de service', lbl: '', danger: 0.35, sombre: 1,
        desc: 'Une porte battante marquée « PRIVÉ » bâille sur l\'escalier de service. Un seau de ménage attend là depuis des semaines, son eau noire parfaitement immobile.',
      },
      // ----- les salles et les services -----
      '0,3': {
        t: 'piece', nom: 'Salle 1 — l\'écran', lbl: 'Écran', danger: 0.55, sombre: 2, mob: 'fauteuils',
        desc: 'Le bas des gradins, au pied de l\'écran. De près, la toile est griffée jusqu\'à la trame, sur deux mètres de haut — comme si quelque chose avait voulu entrer dans l\'image.',
        fouille: { max: 2, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '1,3': {
        t: 'piece', nom: 'Salle 1', lbl: 'Salle 1', danger: 0.6, sombre: 2, mob: 'fauteuils',
        zombies: ['errant', 'errant', 'coureur', 'hurleur'],
        desc: 'Le noir des salles obscures, à prendre au mot désormais. Des rangées entières de silhouettes assises, immobiles, face à l\'écran blanc. La séance de 20 h 30 n\'a jamais fini. Quand la porte se referme derrière toi, au premier rang, une tête pivote.',
        fouille: { max: 2, table: [
          { id: 'portefeuille', q: [1, 2], p: 0.5 }, { id: 'telephone_mort', q: [1, 2], p: 0.5 },
          { id: 'canette_vide', q: [1, 3], p: 0.6 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,3': {
        t: 'piece', nom: 'Salle 2', lbl: 'Salle 2', danger: 0.45, sombre: 2, mob: 'fauteuils',
        desc: 'Tes pas collent au soda séché entre les rangs. Les fauteuils ont gardé la forme des absents : un manteau plié, un sac à main ouvert, des poches à fouiller à tâtons en priant que rien ne respire au rang suivant.',
        fouille: { max: 3, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.5 }, { id: 'telephone_mort', q: [1, 2], p: 0.5 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'briquet', q: [1, 1], p: 0.25 },
          { id: 'chocolat', q: [1, 1], p: 0.2 },
        ] },
      },
      '3,3': {
        t: 'couloir', nom: 'Dégagement des salles', lbl: '', danger: 0.3, sombre: 1,
        desc: 'Entre le hall et les salles, la lumière du dehors meurt à mi-chemin. Au plafond, un panneau lumineux éteint : « Vos salles → ». La flèche pointe vers le noir.',
      },
      '4,3': {
        t: 'piece', nom: 'Salle 3', lbl: 'Salle 3', danger: 0.4, sombre: 2, mob: 'fauteuils',
        desc: 'La séance jeune public. Des lunettes 3D jonchent les rangs comme des insectes morts, et des cartons de pop-corn renversés croustillent sous tes semelles. Tu refuses de penser à qui occupait ces fauteuils-là.',
        fouille: { max: 3, table: [
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'portefeuille', q: [1, 1], p: 0.35 },
          { id: 'soda', q: [1, 1], p: 0.3 }, { id: 'chips', q: [1, 1], p: 0.25 },
          { id: 'sac_plastique', q: [1, 2], p: 0.4 },
        ] },
      },
      '5,3': {
        t: 'piece', nom: 'Sanitaires', lbl: 'Sanitaires', danger: 0.3, sombre: 1, mob: null,
        desc: 'Les robinets sont à sec, les miroirs piqués de noir. Sur la faïence, écrit au rouge à lèvres : « ON S\'EST MIS EN SÉCURITÉ SALLE 1 ». Tu connais la suite.',
        fouille: { max: 2, table: [
          { id: 'savon', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'sac_plastique', q: [1, 1], p: 0.35 },
        ] },
      },
      // ----- le hall, côté place Morgan -----
      '2,4': {
        t: 'piece', nom: 'Bornes et billetterie', lbl: 'Billets', danger: 0.25, mob: 'machines',
        desc: 'Les bornes tactiles affichent un écran figé sur « Choisissez votre séance ». Au sol, des billets imprimés, des lunettes 3D, et un petit soulier vernis, un seul.',
        fouille: { max: 2, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.5 }, { id: 'telephone_mort', q: [1, 1], p: 0.5 },
          { id: 'sac_plastique', q: [1, 1], p: 0.4 }, { id: 'briquet', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,4': {
        t: 'piece', nom: 'Le grand hall', lbl: 'Hall', danger: 0.3, mob: null,
        desc: 'Les cordons de file d\'attente sont toujours en place, guidant des fantômes vers les caisses. La moquette rouge a bu des choses qu\'elle n\'a jamais rendues.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,4': {
        t: 'piece', nom: 'La confiserie', lbl: 'Confiserie', danger: 0.35, mob: 'comptoir',
        desc: 'La machine à pop-corn est renversée, son contenu écrasé en bouillie rance sur le carrelage. Derrière le comptoir, les étagères de bonbons brillent dans la pénombre comme un coffre au trésor pour enfants morts.',
        fouille: { max: 4, table: [
          { id: 'chocolat', q: [1, 2], p: 0.5 }, { id: 'soda', q: [1, 2], p: 0.5 },
          { id: 'chips', q: [1, 1], p: 0.5 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'canette_vide', q: [1, 3], p: 0.6 },
        ] },
      },
      '3,5': {
        t: 'porte', nom: 'Les portes vitrées', lbl: 'Sortie', danger: 0.2,
        desc: 'Les affiches des sorties du mercredi jaunissent derrière leurs vitrines lumineuses éteintes. Le multiplexe n\'avait pas trois ans. Dehors, la place Morgan et sa fontaine morte.',
        vers: { carte: 'q_cours', x: 2, y: 7, temps: 2 }, versNom: 'Ressortir place Morgan',
      },
    },
  },

  // ════════ HÔPITAL DU PAYS SALONAIS — le pire et le meilleur endroit du jeu ════════
  // Deux niveaux sur le même plan : en haut le sous-sol (morgue, buanderie), isolé par
  // une rangée vide et relié par les deux cases d'escalier empilées à droite ; en bas
  // le rez-de-chaussée — l'aile des services au fond (pharmacie, bloc, réveil, imagerie,
  // vestiaire), le long couloir central qui dessert tout, et l'aile des urgences qui
  // avance vers l'avenue (sas de sortie en 2,6).
  int_hopital: {
    nom: 'Hôpital du Pays Salonais', sousTitre: '207 avenue Julien Fabre — 346 lits, aucun de libre',
    echelle: 'interieur', tempsParCase: 2, largeur: 7, hauteur: 7,
    exterieur: false, ambiance: 'sombre', illu: 'immeuble',
    zombiesPool: ['putrefie', 'enrage', 'gonfle', 'colosse', 'errant', 'rampant', 'nuee_rats'],
    passages: [
      ['2,5', '1,5', 'ouvert'], // la salle d'attente ouvre sur l'accueil — même plateau des urgences
      ['2,5', '3,5', 'ouvert'], // les box de soins ouvrent sur l'accueil (zone de triage)
      ['1,2', '2,2'], // porte entre le bloc opératoire et la salle de réveil
    ],
    cases: {
      // ----- sous-sol (on n'y descend que par l'escalier sud) -----
      '3,0': {
        t: 'piece', nom: 'La morgue', lbl: 'Morgue', danger: 0.6, sombre: 2, mob: 'tiroirs',
        zombies: ['putrefie', 'putrefie', 'rampant', 'enrage'],
        desc: 'Le froid est tombé avec le courant, et l\'odeur a pris toute la place. Les tiroirs réfrigérés sont ouverts, les housses descendues à la taille. Vides, pour la plupart. Tu comptes les housses. Tu comptes les portes. Les comptes ne tombent pas juste.',
        fouille: { max: 3, table: [
          { id: 'bache_plastique', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 3], p: 0.7 },
          { id: 'telephone_mort', q: [1, 2], p: 0.5 }, { id: 'portefeuille', q: [1, 2], p: 0.5 },
          { id: 'desinfectant', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,0': {
        t: 'couloir', nom: 'Couloir du sous-sol — la morgue', lbl: '', danger: 0.5, sombre: 2,
        desc: 'Au fond, une porte à double battant sous une plaque émaillée : MORGUE. Quelqu\'un a écrit dessous, à la craie : « complet ». La craie a coulé avec l\'humidité.',
      },
      '5,0': {
        t: 'piece', nom: 'Buanderie hospitalière', lbl: 'Buanderie', danger: 0.4, sombre: 1, mob: 'machines',
        desc: 'Les laveuses industrielles bâillent sur des draps à demi lavés, figés dans l\'eau morte. Par un soupirail grillagé, un jour gris et maigre tombe sur les piles de linge. L\'odeur de lessive se bat avec celle du couloir. Elle perd.',
        fouille: { max: 3, table: [
          { id: 'chiffon', q: [2, 4], p: 0.8 }, { id: 'savon', q: [1, 2], p: 0.5 },
          { id: 'bandage_fortune', q: [1, 2], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'fil_de_fer', q: [1, 1], p: 0.3 },
        ] },
      },
      '6,0': {
        t: 'couloir', nom: 'Couloir du sous-sol', lbl: '', danger: 0.5, sombre: 2,
        desc: 'Des tuyauteries courent au plafond et gouttent à contretemps. Ta lumière ne découpe qu\'un morceau de couloir à la fois — le reste attend son tour dans le noir.',
      },
      // ----- entre les deux : l'escalier sud descend -----
      '6,1': {
        t: 'escalier', nom: 'Escalier sud (sous-sol)', lbl: 'Escalier', danger: 0.45, sombre: 2,
        desc: 'Le palier du sous-sol. L\'air y est plus épais, saturé d\'eau de Javel et d\'autre chose, en dessous, que la Javel n\'a jamais réussi à couvrir.',
      },
      // ----- rez-de-chaussée : l'aile des services, au fond -----
      '0,2': {
        t: 'piece', nom: 'Pharmacie hospitalière', lbl: 'Pharmacie', danger: 0.5, sombre: 2, mob: 'etageres',
        verrou: {
          desc: 'Une porte blindée à lecteur de badge, morte avec le courant. Quelqu\'un a tapé dedans à la hache d\'incendie — la porte porte les cicatrices, mais elle a gagné.',
          options: [
            { methode: 'outil', outil: 'pied_de_biche', label: 'Attaquer le bâti au pied-de-biche', tempsMin: 10 },
            { methode: 'skill', skill: 'mecanique', niveau: 2, label: 'Démonter la serrure motorisée', tempsMin: 15 },
            { methode: 'skill', skill: 'force', niveau: 3, label: 'Enfoncer la porte à l\'épaule', tempsMin: 20, risque: { p: 0.3, blessure: 'entaille', zones: ['à l\'épaule'], texte: 'Le chambranle cède dans un éclat de tôle qui te taille l\'épaule jusqu\'au sang.' } },
          ],
        },
        desc: 'Le trésor de guerre de l\'hôpital : armoires de dotation pleines, chariots de distribution chargés pour une tournée qui n\'a jamais eu lieu. De quoi soigner un quartier entier. Ou toi, longtemps.',
        fouille: { max: 4, table: [
          { id: 'antibiotiques', q: [1, 3], p: 0.9 }, { id: 'kit_suture', q: [1, 1], p: 0.6 },
          { id: 'bandage', q: [2, 4], p: 0.8 }, { id: 'desinfectant', q: [1, 2], p: 0.7 },
          { id: 'antidouleur', q: [1, 2], p: 0.6 },
        ] },
      },
      '1,2': {
        t: 'piece', nom: 'Bloc opératoire', lbl: 'Bloc op.', danger: 0.5, mob: 'table',
        desc: 'Le scialytique éteint pend au-dessus de la table comme un œil fermé. L\'opération a été interrompue au milieu : les instruments sont encore disposés dans l\'ordre, le champ stérile est encore en place. Le patient, lui, n\'est plus sur la table.',
        fouille: { max: 3, table: [
          { id: 'kit_suture', q: [1, 1], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.5 },
          { id: 'chiffon', q: [1, 2], p: 0.6 }, { id: 'eclat_verre', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,2': {
        t: 'piece', nom: 'Salle de réveil', lbl: 'Réveil', danger: 0.45, mob: 'lits',
        desc: 'Quatre lits aux barrières levées, les moniteurs éteints penchés sur des oreillers creusés. C\'est ici qu\'on attendait que les patients reviennent à eux. Certains sont revenus autrement.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.4 }, { id: 'antidouleur', q: [1, 1], p: 0.35 },
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'portefeuille', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,2': {
        t: 'piece', nom: 'Service d\'imagerie', lbl: 'Imagerie', danger: 0.4, sombre: 1, mob: 'machines',
        desc: 'Le scanner trône dans la pénombre comme un monolithe, sa bouche ronde ouverte sur une table vide. Au sol, des clichés éparpillés : des poumons, des crânes, des gens entiers en transparence. Aucun n\'a été rendu.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 2], p: 0.4 }, { id: 'cable_electrique', q: [1, 2], p: 0.45 },
          { id: 'eclat_verre', q: [1, 2], p: 0.4 }, { id: 'telephone_mort', q: [1, 1], p: 0.3 },
        ] },
      },
      '5,2': {
        t: 'piece', nom: 'Vestiaire du personnel', lbl: 'Vestiaire', danger: 0.35, sombre: 1, mob: 'casiers',
        desc: 'Les casiers du personnel, certains cadenassés, d\'autres béants sur des blouses qui pendent comme des mues. Sur le planning de garde punaisé au mur, tout le monde était de service le 19.',
        fouille: { max: 3, table: [
          { id: 'savon', q: [1, 1], p: 0.4 }, { id: 'tshirt', q: [1, 1], p: 0.35 },
          { id: 'jogging', q: [1, 1], p: 0.3 }, { id: 'portefeuille', q: [1, 1], p: 0.35 },
          { id: 'lampe_frontale', q: [1, 1], p: 0.2 },
        ] },
      },
      '6,2': {
        t: 'escalier', nom: 'Escalier sud (rez-de-chaussée)', lbl: 'Escalier', danger: 0.4, sombre: 1,
        desc: 'L\'escalier de service descend vers le sous-sol. Sur la rampe, une main a laissé une trace continue, sombre, qui descend avec toi. Elle ne remonte pas.',
      },
      // ----- le couloir central -----
      '0,3': {
        t: 'couloir', nom: 'Couloir central — la porte blindée', lbl: '', danger: 0.45, sombre: 1,
        desc: 'La ligne verte meurt au pied de la porte blindée. Au mur, un distributeur de gel hydroalcoolique arraché pendouille au bout de sa vis — vidé jusqu\'à la dernière goutte.',
      },
      '1,3': {
        t: 'couloir', nom: 'Couloir central', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Les néons sont morts ; seules les lignes de couleur au sol guident encore — « suivez la ligne verte vers la pharmacie ». Tu la suis. Quelque chose, plus loin dans le noir, la suit aussi.',
      },
      '2,3': {
        t: 'couloir', nom: 'Couloir central — le chariot renversé', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Un chariot de soins renversé barre à moitié le passage, compresses et flacons répandus en étoile. Tu enjambes. Le carrelage colle sous tes semelles, et tu ne regardes pas pourquoi.',
        fouille: { max: 2, table: [
          { id: 'bandage_fortune', q: [1, 2], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.3 },
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,3': {
        t: 'couloir', nom: 'Couloir central — l\'imagerie', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Le pictogramme jaune des rayonnements veille encore sur la porte de l\'imagerie. Plus loin, le couloir s\'enfonce dans une ombre qui semble respirer quand tu t\'arrêtes.',
      },
      '4,3': {
        t: 'couloir', nom: 'Couloir central — les brancards', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Des brancards vides garés en épi, comme des voitures sur un parking. Sur le plus proche, les sangles ont été déchirées de l\'intérieur.',
      },
      '5,3': {
        t: 'couloir', nom: 'Couloir central — côté personnel', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Un panneau « Réservé au personnel », une rangée de néons morts. Tes pas réveillent un écho qui met un peu trop de temps à s\'éteindre.',
      },
      '6,3': {
        t: 'couloir', nom: 'Couloir central — le fond', lbl: '', danger: 0.45, sombre: 1,
        desc: 'Le bout du couloir. La porte coupe-feu de l\'escalier sud est calée ouverte par un sabot d\'infirmière. Un seul.',
      },
      // ----- l'aile des urgences, vers l'avenue -----
      '2,4': {
        t: 'couloir', nom: 'Couloir des urgences', lbl: '', danger: 0.4,
        desc: 'Une double porte battante aux hublots ronds sépare les urgences du reste de l\'hôpital. À travers le plexiglas rayé, le couloir central n\'est qu\'une gorge d\'ombre.',
      },
      '1,5': {
        t: 'piece', nom: 'Salle d\'attente', lbl: 'Attente', danger: 0.45, mob: 'bancs',
        desc: 'Des rangées de sièges en plastique, des magazines piétinés, un distributeur de tickets qui affiche encore le numéro 847. Quelqu\'un a écrit au feutre sur le mur : « ILS MORDAIENT DÉJÀ DANS LA FILE ».',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'telephone_mort', q: [1, 2], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.5 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,5': {
        t: 'piece', nom: 'Accueil des urgences', lbl: 'Urgences', danger: 0.5, mob: 'lits',
        desc: 'Des brancards alignés jusque dans les couloirs, certains encore sanglés. Le tableau d\'affichage indique 11 heures d\'attente. Les draps sont tachés à hauteur de visage, tous au même endroit.',
        fouille: { max: 3, table: [
          { id: 'bandage_fortune', q: [1, 2], p: 0.5 }, { id: 'antidouleur', q: [1, 1], p: 0.3 },
          { id: 'chiffon', q: [1, 3], p: 0.7 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,5': {
        t: 'piece', nom: 'Box de soins', lbl: 'Box', danger: 0.45, mob: 'lits',
        desc: 'Les rideaux des box pendent, à moitié arrachés de leurs rails. Dans le box 3, une perfusion goutte encore dans le vide, au rythme d\'une horloge que personne n\'a arrêtée.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.6 }, { id: 'desinfectant', q: [1, 1], p: 0.5 },
          { id: 'antidouleur', q: [1, 1], p: 0.4 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,6': {
        t: 'porte', nom: 'Sas des urgences', lbl: 'Sortie', danger: 0.3,
        desc: 'Les portes automatiques sont bloquées à demi ouvertes sur une ambulance abandonnée, portières béantes, gyrophare mort. C\'est ici que tout a commencé pour Salon : les premiers mordus sont arrivés par ce sas.',
        vers: { carte: 'ville_salon', x: 3, y: 1, temps: 2 }, versNom: 'Ressortir avenue Julien Fabre',
      },
    },
  },

  // ════════ COMMISSARIAT — ils ont tenu un siège, ils ont perdu ════════
  // Deux niveaux sur le même plan : en bas le rez-de-chaussée (l'entrée fortifiée
  // côté avenue, le hall, la brigade, la salle de repos, la salle radio, les
  // vestiaires et le bureau du commissaire au bout du couloir de service) ;
  // en haut le sous-sol — le couloir aveugle de la garde à vue, qui dessert
  // les scellés, les cellules et l'armurerie blindée. L'escalier relie les deux.
  int_commissariat: {
    nom: 'Commissariat', sousTitre: 'avenue du Pays Catalan — ouvert 24h/24, jusqu\'au bout',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 6,
    exterieur: false, ambiance: 'sombre', illu: 'commissariat',
    zombiesPool: ['errant', 'coureur', 'enrage', 'colosse'],
    passages: [
      ['1,4', '2,4'], // les bureaux de la brigade ouvrent directement sur le hall d'accueil
    ],
    cases: {
      // ----- sous-sol : la garde à vue -----
      '1,0': {
        t: 'piece', nom: 'Salle des scellés', lbl: 'Scellés', danger: 0.35, sombre: 2, mob: 'etageres',
        desc: 'Des étagères grillagées, des sachets numérotés alignés dans le noir : couteaux, téléphones, liasses — toute la petite délinquance d\'une sous-préfecture mise sous plastique. Les affaires ne seront jamais jugées. Les pièces à conviction, elles, peuvent encore servir.',
        fouille: { max: 3, table: [
          { id: 'couteau_artisanal', q: [1, 1], p: 0.45 }, { id: 'batte_baseball', q: [1, 1], p: 0.3 },
          { id: 'alcool_fort', q: [1, 1], p: 0.35 }, { id: 'telephone_mort', q: [1, 2], p: 0.6 },
          { id: 'portefeuille', q: [1, 1], p: 0.5 }, { id: 'sacoche', q: [1, 1], p: 0.25 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Les cellules', lbl: 'Cellules', danger: 0.5, sombre: 2, special: 'cellules', mob: 'barreaux',
        desc: 'Trois cellules de garde à vue aux portes closes, leurs judas comme des yeux fermés. Derrière l\'une d\'elles, quelque chose bouge quand tu bouges, et s\'arrête quand tu t\'arrêtes.',
      },
      '3,0': {
        t: 'piece', nom: 'L\'armurerie', lbl: 'Armurerie', danger: 0.25, sombre: 2, mob: 'ratelier',
        verrou: {
          desc: 'Une porte blindée avec digicode. Pas de gonds apparents, pas de faiblesse : ici, c\'est le code ou rien. Quelqu\'un, quelque part dans ces bureaux, l\'a forcément noté.',
          options: [
            { methode: 'item', item: 'code_armurerie', label: 'Taper le code « 4471 »', tempsMin: 1 },
          ],
        },
        desc: 'Les râteliers sont à moitié vides — ils sont sortis armés, pour ce que ça a changé. Mais ce qui reste vaut tous les pillages de la ville : de l\'acier propre, huilé, et des boîtes de munitions au carré.',
        fouille: { max: 4, table: [
          { id: 'pistolet_9mm', q: [1, 1], p: 1 }, { id: 'munitions_9mm', q: [8, 14], p: 1 },
          { id: 'cartouches', q: [4, 8], p: 0.6 }, { id: 'machette', q: [1, 1], p: 0.5 },
          { id: 'gilet_tactique', q: [1, 1], p: 0.4 }, { id: 'holster_cuisse', q: [1, 1], p: 0.5 },
        ] },
      },
      '0,1': {
        t: 'escalier', nom: 'Escalier (sous-sol)', lbl: 'Escalier', danger: 0.35, sombre: 1,
        desc: 'Le bas des marches. Le jour du rez-de-chaussée n\'arrive ici qu\'en reflet pâle, qui meurt sur le béton avant la première porte. Au-delà, le couloir n\'est qu\'une bouche noire.',
      },
      '1,1': {
        t: 'couloir', nom: 'Garde à vue — côté escalier', lbl: '', danger: 0.4, sombre: 2,
        desc: 'Passé la dernière marche, le noir devient total. Le mur est lisse et froid sous ta paume, ponctué de portes renforcées qui ne rendent aucun son quand tu y colles l\'oreille. Aucun.',
      },
      '2,1': {
        t: 'couloir', nom: 'Couloir de garde à vue', lbl: '', danger: 0.4, sombre: 2,
        desc: 'Un couloir aveugle, des portes renforcées de chaque côté. L\'éclairage de secours clignote au bout, par à-coups, comme un pouls fatigué. Entre deux flashs, le couloir n\'est jamais tout à fait pareil.',
      },
      '3,1': {
        t: 'couloir', nom: 'Garde à vue — le fond', lbl: '', danger: 0.45, sombre: 2,
        desc: 'Le fond du couloir, là où palpite l\'éclairage de secours. Sous la porte blindée de l\'armurerie, pas un rai de lumière — et sur le mur d\'en face, des traînées sombres descendent vers le sol, comme si quelqu\'un s\'y était adossé longtemps.',
      },
      // ----- entre les deux : l'escalier remonte -----
      '0,2': {
        t: 'escalier', nom: 'Escalier (rez-de-chaussée)', lbl: 'Escalier', danger: 0.3,
        desc: 'Une volée de marches en béton plonge vers la garde à vue. Sur la porte, une plaque réglementaire : « Sous-sol — accès réservé ». Dessous, au stylo, une main pressée a ajouté : « n\'ouvrez plus ».',
      },
      // ----- rez-de-chaussée -----
      '0,3': {
        t: 'couloir', nom: 'Couloir de service — l\'escalier', lbl: '', danger: 0.3,
        desc: 'L\'extrémité du couloir, entre la porte des vestiaires et celle du sous-sol. Un képi est resté accroché à la rampe, posé là comme pour cinq minutes — il y a des semaines.',
      },
      '1,3': {
        t: 'couloir', nom: 'Couloir de service — le tableau', lbl: '', danger: 0.3,
        desc: 'Un panneau de liège : plannings, notes de service, un calendrier arrêté au mois du grand marché. Par-dessus, punaisée de travers, la liste des effectifs — sur vingt-deux noms, dix-neuf sont rayés au feutre rouge.',
      },
      '2,3': {
        t: 'couloir', nom: 'Couloir de service — la retraite', lbl: '', danger: 0.35,
        desc: 'Des chaises et une armoire renversées, repoussées contre les murs : une barricade qui n\'a pas tenu. Ils ont reculé pièce par pièce, et le couloir garde l\'ordre exact de leur retraite.',
      },
      '3,3': {
        t: 'couloir', nom: 'Couloir de service — le distributeur', lbl: '', danger: 0.3,
        desc: 'Un distributeur de boissons couché en travers, vitre étoilée, canettes éparpillées jusque sous les plinthes. Quelqu\'un l\'a vidé à coups de pied — avant ou après la fin, impossible à dire.',
        fouille: { max: 2, table: [
          { id: 'soda', q: [1, 1], p: 0.35 }, { id: 'canette_vide', q: [1, 3], p: 0.7 },
          { id: 'chocolat', q: [1, 1], p: 0.2 },
        ] },
      },
      '4,3': {
        t: 'couloir', nom: 'Couloir de service — la porte du chef', lbl: '', danger: 0.3,
        desc: 'Le bout du couloir : une porte capitonnée, une plaque dorée — « Commissaire ». Elle est entrouverte sur de la lumière du jour, la seule du couloir.',
      },
      '5,3': {
        t: 'piece', nom: 'Bureau du commissaire', lbl: 'Direction', danger: 0.25, mob: 'bureau',
        desc: 'Le drapeau dans son socle, les photos de promotion, et sur le bureau une bouteille sortie du tiroir, deux verres. Un seul a servi. Le fauteuil est tourné vers la fenêtre, vers la ville qu\'il fallait tenir.',
        fouille: { max: 3, table: [
          { id: 'alcool_fort', q: [1, 1], p: 0.45 }, { id: 'carte_quartier', q: [1, 1], p: 0.35 },
          { id: 'briquet', q: [1, 1], p: 0.35 }, { id: 'portefeuille', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 },
        ] },
      },
      '0,4': {
        t: 'piece', nom: 'Vestiaires', lbl: 'Vestiaires', danger: 0.3, mob: 'casiers',
        desc: 'Des casiers métalliques aux portes battantes, des uniformes pendus qui attendent des hommes qui ne reviendront pas. Au fond, une douche coule goutte à goutte depuis des semaines.',
        fouille: { max: 4, table: [
          { id: 'gilet_tactique', q: [1, 1], p: 0.5 }, { id: 'rangers', q: [1, 1], p: 0.5 },
          { id: 'casque_moto', q: [1, 1], p: 0.4 }, { id: 'gants_cuir', q: [1, 1], p: 0.5 },
          { id: 'holster_cuisse', q: [1, 1], p: 0.4 }, { id: 'sac_militaire', q: [1, 1], p: 0.35 },
          { id: 'lampe_frontale', q: [1, 1], p: 0.3 },
        ] },
      },
      '1,4': {
        t: 'piece', nom: 'Bureaux de la brigade', lbl: 'Brigade', danger: 0.35, mob: 'bureau',
        desc: 'Des bureaux couverts de procès-verbaux que plus personne ne classera. Sur l\'écran d\'un poste, un rapport inachevé : « ...les individus ne répondent pas aux sommations et continuent de ». La phrase s\'arrête là.',
        fouille: { max: 3, table: [
          { id: 'code_armurerie', q: [1, 1], p: 0.8 }, { id: 'gants_cuir', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'telephone_mort', q: [1, 1], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,4': {
        t: 'piece', nom: 'Hall d\'accueil', lbl: 'Accueil', danger: 0.4, mob: 'comptoir',
        desc: 'La banque d\'accueil est criblée d\'impacts — tirés vers la porte, tous. Le panneau « Votre commissariat vous accueille 24h/24 » pend par un coin. Quelqu\'un a barré « vous accueille » au marqueur.',
        fouille: { max: 3, table: [
          { id: 'munitions_9mm', q: [2, 5], p: 0.3 }, { id: 'piles', q: [1, 1], p: 0.3 },
          { id: 'lampe_torche', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,4': {
        t: 'piece', nom: 'Salle de repos', lbl: 'Repos', danger: 0.25, mob: 'table',
        desc: 'Une kitchenette, un canapé défoncé, un baby-foot dont les petits joueurs de bois fixent la porte. Sur la table, une partie de cartes interrompue : les mains encore distribuées, face cachée, autour d\'un cendrier plein.',
        fouille: { max: 3, table: [
          { id: 'biscuits', q: [1, 1], p: 0.35 }, { id: 'soda', q: [1, 1], p: 0.3 },
          { id: 'chocolat', q: [1, 1], p: 0.25 }, { id: 'canette_vide', q: [1, 2], p: 0.6 },
          { id: 'briquet', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,4': {
        t: 'piece', nom: 'Salle radio', lbl: 'Radio', danger: 0.3, mob: 'machines',
        desc: 'Les consoles du standard sont mortes, mais la main courante est restée ouverte sur le pupitre. Dernière ligne, 3 h 12 : « plus personne ne répond sur aucun canal ». L\'écriture penche, comme tracée en marchant.',
        fouille: { max: 3, table: [
          { id: 'radio_portable', q: [1, 1], p: 0.45 }, { id: 'piles', q: [1, 2], p: 0.5 },
          { id: 'cable_electrique', q: [1, 2], p: 0.4 }, { id: 'lampe_torche', q: [1, 1], p: 0.25 },
          { id: 'journal_papier', q: [1, 2], p: 0.4 },
        ] },
      },
      '2,5': {
        t: 'porte', nom: 'L\'entrée fortifiée', lbl: 'Sortie', danger: 0.3,
        desc: 'Des sacs de sable empilés en chicane devant les portes, un tapis de douilles de 9 mm qui roulent sous tes semelles. Ils ont transformé l\'accueil en poste de combat. Le poste est tombé quand même.',
        vers: { carte: 'ville_salon', x: 8, y: 4, temps: 2 }, versNom: 'Ressortir avenue du Pays Catalan',
      },
    },
  },

  // ════════ HYPER E.LECLERC « LES VIOUGUES » — le ventre de la ville ════════
  // Plan : l'entrée et le parking couvert au sud, la galerie marchande en couloir
  // (cafétéria à l'ouest, poste de sécurité à l'est), les deux portillons de la
  // ligne de caisses, puis le grand plateau de vente — frais, épicerie, conserves,
  // bazar — et tout au fond, la chambre froide et la réserve cadenassée.
  int_leclerc: {
    nom: 'Hyper E.Leclerc — Les Viougues', sousTitre: 'route de Pélissanne — le garde-manger de 44 000 personnes',
    echelle: 'interieur', tempsParCase: 2, largeur: 8, hauteur: 6,
    exterieur: false, ambiance: 'sombre', illu: 'magasin',
    zombiesPool: ['gonfle', 'putrefie', 'hurleur', 'errant', 'errant', 'rampant', 'nuee_rats'],
    passages: [
      ['0,5', '1,5', 'ouvert'], // le parking couvert file sous la dalle, d'une travée à l'autre
      ['3,2', '3,3', 'ouvert'], // passé les caisses, on débouche sur le plateau de vente
      ['4,2', '4,3', 'ouvert'], // idem, côté caisses automatiques
      ['3,3', '4,3', 'ouvert'], // la ligne de caisses court d'un bout à l'autre
      // — le grand plateau de vente : tout communique à découvert —
      ['2,1', '3,1', 'ouvert'], ['3,1', '4,1', 'ouvert'], ['4,1', '5,1', 'ouvert'], ['5,1', '6,1', 'ouvert'],
      ['2,2', '3,2', 'ouvert'], ['3,2', '4,2', 'ouvert'], ['4,2', '5,2', 'ouvert'],
      ['2,1', '2,2', 'ouvert'], ['3,1', '3,2', 'ouvert'], ['4,1', '4,2', 'ouvert'], ['5,1', '5,2', 'ouvert'],
      // — les portes du fond —
      ['2,1', '2,0'], // la porte isolée de la chambre froide, derrière les frais
      ['6,1', '6,0'], // le rideau de la réserve et du quai, au fond du bazar
    ],
    cases: {
      // ----- l'entrée et le parking couvert -----
      '2,5': {
        t: 'porte', nom: 'Entrée de la galerie', lbl: 'Sortie', danger: 0.3,
        desc: 'Les portes coulissantes sont coincées par un enchevêtrement de caddies, tordus en barricade par les derniers clients. Dans la pénombre, l\'enseigne du traiteur asiatique grésille encore sur batterie.',
        vers: { carte: 'ville_salon', x: 10, y: 3, temps: 2 }, versNom: 'Ressortir route de Pélissanne',
      },
      '1,5': {
        t: 'piece', nom: 'Parking couvert — la rampe', lbl: 'Parking', danger: 0.4, sombre: 2, mob: 'voiture',
        desc: 'La rampe d\'accès plonge sous la dalle et le jour renonce au bout de dix mètres. Des caddies abandonnés entre les places, un landau couché sur le flanc. Tu poses les pieds là où le silence veut bien te laisser passer.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 3], p: 0.6 }, { id: 'sac_plastique', q: [1, 3], p: 0.7 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '0,5': {
        t: 'piece', nom: 'Parking couvert — les travées', lbl: 'Parking', danger: 0.4, sombre: 2, mob: 'voiture',
        desc: 'Des rangées de voitures sous les néons morts, coffres ouverts, courses jamais déballées. Quelque part dans le noir, une alarme à bout de batterie couine toutes les trente secondes. Quelque chose lui répond.',
        fouille: { max: 2, table: [
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'bouteille_eau', q: [1, 1], p: 0.25 },
        ] },
      },
      // ----- la galerie marchande -----
      '1,4': {
        t: 'piece', nom: 'La cafétéria', lbl: 'Cafét.', danger: 0.35, mob: 'table',
        desc: 'Chaises hautes renversées, plateaux figés sur les tables, un menu enfant à moitié mangé. Derrière le comptoir, la machine garde ses tasses alignées, prêtes pour des pauses que personne ne viendra plus prendre.',
        fouille: { max: 2, table: [
          { id: 'soda', q: [1, 1], p: 0.4 }, { id: 'biscuits', q: [1, 1], p: 0.3 },
          { id: 'chocolat', q: [1, 1], p: 0.25 }, { id: 'canette_vide', q: [1, 2], p: 0.6 },
        ] },
      },
      '2,4': {
        t: 'couloir', nom: 'Galerie — le tabac-presse', lbl: '', danger: 0.35,
        desc: 'Le sas d\'entrée ouvre sur la galerie. Le tabac-presse a baissé son rideau aux trois quarts ; dessous, des magazines de la semaine 12 jaunissent en piles. Les gros titres parlaient encore de « cas isolés ».',
      },
      '3,4': {
        t: 'couloir', nom: 'Galerie marchande', lbl: '', danger: 0.4,
        desc: 'Une douzaine de boutiques éventrées : le coiffeur, le cordonnier, la parfumerie qui embaume encore par-dessus l\'odeur de pourriture. Les rideaux métalliques à moitié baissés font des gueules ouvertes tout du long.',
        fouille: { max: 3, table: [
          { id: 'eclat_verre', q: [1, 3], p: 0.6 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'piles', q: [1, 1], p: 0.3 },
          { id: 'savon', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,4': {
        t: 'couloir', nom: 'Galerie — la bijouterie', lbl: '', danger: 0.35,
        desc: 'La bijouterie a été vidée jusqu\'aux présentoirs — comme si l\'or comptait encore. En face, l\'opticien aligne ses montures intactes : personne n\'a songé à piller de quoi voir venir la suite.',
      },
      '5,4': {
        t: 'couloir', nom: 'Galerie — le photomaton', lbl: '', danger: 0.35,
        desc: 'Un photomaton, rideau tiré. Tu ne l\'écartes pas. Plus loin, la boulangerie de la galerie exhale une odeur de levain mort, et le distributeur de chewing-gums trône, intact, plein de couleurs absurdes.',
      },
      '6,4': {
        t: 'couloir', nom: 'Bout de la galerie', lbl: '', danger: 0.4,
        desc: 'Le bout de la galerie : les sanitaires, un distributeur de billets éventré pour rien, la porte du poste de sécurité. Au sol, une longue trace brune va de l\'un à l\'autre, tirée comme un trait de règle.',
      },
      '7,4': {
        t: 'piece', nom: 'Poste de sécurité', lbl: 'Sécurité', danger: 0.3, sombre: 1, mob: 'bureau',
        desc: 'Une rangée d\'écrans morts tournés vers un fauteuil vide. Sur le registre, la dernière ligne date du jour 19 : « affluence anormale, appelé renforts ». Les renforts, c\'est toi, avec trois semaines de retard.',
        fouille: { max: 2, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'lampe_torche', q: [1, 1], p: 0.3 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- la ligne de caisses -----
      '3,3': {
        t: 'piece', nom: 'Ligne de caisses', lbl: 'Caisses', danger: 0.4, mob: 'comptoir',
        desc: 'Trente caisses en enfilade, tapis figés sous des courses abandonnées. Une caissière est toujours à son poste, sanglée à sa chaise par quelqu\'un qui l\'aimait sans doute. Elle scanne le vide, encore et encore.',
        fouille: { max: 2, table: [
          { id: 'chocolat', q: [1, 2], p: 0.4 }, { id: 'soda', q: [1, 1], p: 0.4 },
          { id: 'canette_vide', q: [1, 3], p: 0.6 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'Caisses automatiques', lbl: 'Caisses', danger: 0.4, mob: 'comptoir',
        desc: 'Les caisses automatiques, écrans noirs. L\'une d\'elles a répété « article inattendu dans la zone d\'ensachage » jusqu\'à sa dernière goutte de batterie. L\'article inattendu est toujours là, séché sur le tapis.',
        fouille: { max: 2, table: [
          { id: 'sac_plastique', q: [1, 3], p: 0.7 }, { id: 'portefeuille', q: [1, 1], p: 0.4 },
          { id: 'cabas_courses', q: [1, 1], p: 0.6 },
        ] },
      },
      // ----- le plateau de vente, côté caisses -----
      '2,2': {
        t: 'piece', nom: 'Rayons frais — crémerie', lbl: 'Frais', danger: 0.5, mob: 'comptoir',
        desc: 'La crémerie n\'est plus qu\'une croûte verdâtre derrière les vitres des armoires froides. L\'odeur ici est presque douce, lactée, écœurante. Celle qui vient du fond du rayon ne l\'est pas du tout.',
        fouille: { max: 1, table: [
          { id: 'sac_plastique', q: [1, 2], p: 0.6 }, { id: 'soda', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,2': {
        t: 'piece', nom: 'Rayon textile', lbl: 'Textile', danger: 0.4, mob: 'etageres',
        desc: 'Les portants du textile renversés dans une odeur de teinture et de poussière. Des vêtements pour toute une vie ordinaire — bureaux, mariages, rentrées des classes. Tu fouilles les tailles comme on fouille des tombes.',
        fouille: { max: 2, table: [
          { id: 'tshirt', q: [1, 2], p: 0.5 }, { id: 'jean', q: [1, 1], p: 0.35 },
          { id: 'pull_laine', q: [1, 1], p: 0.3 }, { id: 'casquette', q: [1, 1], p: 0.3 },
          { id: 'gants_laine', q: [1, 1], p: 0.25 },
        ] },
      },
      '4,2': {
        t: 'piece', nom: 'Allée centrale', lbl: '', danger: 0.45, mob: null,
        desc: 'L\'allée centrale, large comme une avenue, jonchée de prospectus qui promettent des prix bas pour toujours. Un caddie couché au milieu, vidé jusqu\'au siège bébé. Tes pas résonnent comme dans une cathédrale pillée.',
      },
      '5,2': {
        t: 'piece', nom: 'Têtes de gondole', lbl: '', danger: 0.45, mob: null,
        desc: 'Les têtes de gondole ont été prises d\'assaut le premier soir : présentoirs pliés, cartons écrasés, une chaussure d\'enfant seule au milieu de l\'allée. Au plafond, les panneaux indiquent des rayons que plus personne ne cherche.',
      },
      // ----- le plateau de vente, le fond des rayons -----
      '2,1': {
        t: 'piece', nom: 'Rayons frais', lbl: 'Frais', danger: 0.55, sombre: 1, mob: 'comptoir',
        zombies: ['gonfle', 'gonfle', 'putrefie'],
        desc: 'Trois semaines sans froid. Les vitrines de viande sont devenues des choses qui bougent toutes seules, et l\'air est si épais que tu le mâches. Eux, là-dedans, sont chez eux : gras, lents, gonflés à craquer.',
        fouille: { max: 1, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,1': {
        t: 'piece', nom: 'Épicerie sèche', lbl: 'Épicerie', danger: 0.5, sombre: 1, mob: 'rayonnages',
        desc: 'Pâtes et riz éventrés par les rats, qui ont fait leurs greniers dans les rayonnages. Ce qui reste se cherche à quatre pattes, sous les étagères, là où la panique n\'a pas eu la patience d\'aller.',
        fouille: { max: 2, table: [
          { id: 'chips', q: [1, 2], p: 0.4 }, { id: 'biscuits', q: [1, 2], p: 0.4 },
          { id: 'canette_vide', q: [1, 3], p: 0.6 },
        ] },
      },
      '4,1': {
        t: 'piece', nom: 'Rayon conserves', lbl: 'Conserves', danger: 0.5, sombre: 1, mob: 'rayonnages',
        desc: 'Des allées entières de conserves renversées, de paquets éclatés, de verre pilé. Le gros est passé dans les caddies de la panique, mais un hypermarché ne se vide pas en trois jours — il faut juste fouiller plus bas, plus loin, plus longtemps qu\'eux.',
        fouille: { max: 2, table: [
          { id: 'conserve_haricots', q: [2, 4], p: 0.6 }, { id: 'conserve_raviolis', q: [1, 3], p: 0.5 },
          { id: 'bouteille_eau', q: [1, 2], p: 0.4 },
        ] },
      },
      '5,1': {
        t: 'piece', nom: 'Rayon bazar', lbl: 'Bazar', danger: 0.4, sombre: 1, mob: 'rayonnages',
        desc: 'Outillage léger, vaisselle, articles de plage hors saison. Les pillards ont pris les écrans et laissé les allumettes — la panique fait de très mauvais choix.',
        fouille: { max: 2, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'scotch', q: [1, 1], p: 0.5 },
          { id: 'lampe_torche', q: [1, 1], p: 0.35 }, { id: 'radio_portable', q: [1, 1], p: 0.25 },
        ] },
      },
      '6,1': {
        t: 'piece', nom: 'Arts ménagers', lbl: 'Ménager', danger: 0.4, sombre: 1, mob: 'rayonnages',
        desc: 'Poêles pendues en quinconce, cocottes empilées, un mur d\'ampoules pour des lampes qui ne se rallumeront pas. Quelqu\'un a dormi dans l\'allée : le carton aplati a gardé la forme d\'un corps en chien de fusil.',
        fouille: { max: 2, table: [
          { id: 'casserole', q: [1, 1], p: 0.4 }, { id: 'ouvre_boite', q: [1, 1], p: 0.3 },
          { id: 'allumettes', q: [1, 2], p: 0.5 }, { id: 'bouteille_vide', q: [1, 2], p: 0.6 },
        ] },
      },
      // ----- tout au fond : la chambre froide et la réserve -----
      '2,0': {
        t: 'piece', nom: 'Chambre froide', lbl: 'Ch. froide', danger: 0.5, sombre: 2, mob: null,
        desc: 'La chambre froide de la boucherie. Trois semaines que le froid est mort, et la porte isolée a gardé tout le reste. Les carcasses pendent à leurs crochets dans le noir absolu, et quelque chose goutte, lentement, au fond.',
        fouille: { max: 2, table: [
          { id: 'couteau_cuisine', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,0': {
        t: 'piece', nom: 'La réserve', lbl: 'Réserve', danger: 0.5, sombre: 2, mob: 'palettes',
        verrou: {
          desc: 'Le rideau du quai de livraison est baissé et cadenassé de l\'intérieur. Quelqu\'un voulait garder le stock pour lui. Vu le silence, il n\'en profite plus.',
          options: [
            { methode: 'outil', outil: 'pince_coupante', label: 'Couper le cadenas', tempsMin: 5 },
            { methode: 'outil', outil: 'pied_de_biche', label: 'Forcer le rideau au pied-de-biche', tempsMin: 10 },
            { methode: 'skill', skill: 'force', niveau: 2, label: 'Soulever le rideau à bout de bras', tempsMin: 15, risque: { p: 0.25, blessure: 'entaille', zones: ['à l\'avant-bras'], texte: 'Le rideau retombe d\'un coup — tu retires la main une seconde trop tard et le métal te mord l\'avant-bras.' } },
          ],
        },
        desc: 'Des palettes filmées sur des dizaines de mètres, intactes dans le noir absolu. De quoi tenir un hiver. Dans un coin, un duvet, un réchaud froid, et une forme allongée que tu choisis de ne pas éclairer.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [2, 4], p: 0.9 }, { id: 'conserve_raviolis', q: [2, 4], p: 0.8 },
          { id: 'bouteille_eau', q: [2, 4], p: 0.9 }, { id: 'alcool_fort', q: [1, 1], p: 0.5 },
          { id: 'cartouche_gaz', q: [1, 1], p: 0.4 }, { id: 'sac_a_dos', q: [1, 1], p: 0.4 },
        ] },
      },
    },
  },

  // ════════ WELDOM DE LA GANDONNE — le temple de la visserie ════════
  // L'entrée et l'accueil côté rue (en bas, à gauche), la grande allée centrale qui
  // traverse tout le magasin, les quatre rayons du plateau de vente reliés à découvert
  // (fond de boutique en pénombre), la serre de la jardinerie au bout de l'allée,
  // et tout au fond : la réserve aveugle et la cour des matériaux grillagée.
  int_weldom: {
    nom: 'Weldom', sousTitre: 'rue du Canesteu, la Gandonne — tout pour réparer un monde irréparable',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 4,
    exterieur: false, ambiance: 'sombre', illu: 'magasin',
    zombiesPool: ['errant', 'rampant', 'coureur'],
    passages: [
      // — le plateau de vente : les rayons communiquent à découvert —
      ['0,1', '1,1', 'ouvert'], // l'outillage ouvre sur le rayon bois, même plateau
      ['1,1', '2,1', 'ouvert'], // le bois ouvre sur la quincaillerie
      ['2,1', '3,1', 'ouvert'], // la quincaillerie ouvre sur la peinture
      // — les portes du fond —
      ['1,1', '1,0'], // porte du fond du rayon bois vers la cour des matériaux grillagée
      ['1,0', '2,0', 'ouvert'], // la cour file le long du grillage, d'une travée à l'autre
      ['3,1', '3,0'], // la porte de la réserve, au fond du rayon peinture
    ],
    cases: {
      // ----- l'entrée, côté rue du Canesteu -----
      '1,3': {
        t: 'porte', nom: 'Les caisses', lbl: 'Sortie', danger: 0.2,
        desc: 'Les tourniquets d\'entrée, un présentoir de graines de tomates renversé, et la radio du magasin muette au plafond. Sur la porte, l\'affiche des promos de la semaine 12. On est très loin de la semaine 12.',
        vers: { carte: 'ville_salon', x: 1, y: 5, temps: 2 }, versNom: 'Ressortir rue du Canesteu',
      },
      '0,3': {
        t: 'piece', nom: 'Accueil & SAV', lbl: 'Accueil', danger: 0.2, mob: 'comptoir',
        desc: 'Le comptoir du service après-vente, son registre des locations ouvert : une bétonnière jamais rendue, une caution jamais récupérée. Derrière, les clés des transpalettes pendent à leur tableau, bien rangées, parfaitement inutiles.',
        fouille: { max: 2, table: [
          { id: 'scotch', q: [1, 1], p: 0.4 }, { id: 'piles', q: [1, 2], p: 0.4 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'portefeuille', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- l'allée centrale, qui traverse le magasin de part en part -----
      '0,2': {
        t: 'couloir', nom: 'Tête de l\'allée centrale', lbl: '', danger: 0.2,
        desc: 'Un caddie est resté en tête d\'allée, chargé : sacs de chaux, rouleaux de fil, gants par paires. La liste de quelqu\'un qui préparait déjà la suite, et qui n\'est jamais allé jusqu\'aux caisses.',
        fouille: { max: 2, table: [
          { id: 'fil_de_fer', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '1,2': {
        t: 'couloir', nom: 'Allée centrale — les promos', lbl: '', danger: 0.25,
        desc: 'Le rayon des promotions de saison : barbecues en kit, parasols fanés dans leurs housses. L\'été que tout le monde attendait est arrivé sans personne.',
      },
      '2,2': {
        t: 'couloir', nom: 'Allée centrale', lbl: '', danger: 0.25,
        desc: 'Les panneaux suspendus annoncent les rayons comme des stations de métro : Quincaillerie, Outillage, Bois. Un escabeau est resté déplié au milieu — quelqu\'un est monté chercher quelque chose et n\'est jamais redescendu le ranger.',
        fouille: { max: 2, table: [
          { id: 'visserie', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'canette_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,2': {
        t: 'couloir', nom: 'Allée centrale — la flaque', lbl: '', danger: 0.25,
        desc: 'Une flaque sèche de peinture blanche s\'étale en travers de l\'allée, avec des traces dedans — des semelles, puis des pieds nus, puis plus rien. Tu enjambes les empreintes sans les regarder.',
      },
      '4,2': {
        t: 'couloir', nom: 'Bout de l\'allée', lbl: '', danger: 0.25,
        desc: 'Le bout de l\'allée s\'ouvre sur la lumière verte de la jardinerie. Un arrosoir renversé, du terreau répandu, et cette odeur d\'humus qui te serre le cœur — ça sent le dimanche matin, ça sent les vivants.',
      },
      // ----- le plateau de vente, le fond du magasin -----
      '0,1': {
        t: 'piece', nom: 'Rayon outillage', lbl: 'Outillage', danger: 0.3, sombre: 1, mob: 'ratelier',
        desc: 'Les outils électroportatifs ont disparu avec leurs voleurs — batteries mortes, ils ne servent plus à rien. L\'outillage à main, lui, est toujours là, pendu en rangs d\'oignons. Les vieux outils gagnent toujours à la fin.',
        fouille: { max: 4, table: [
          { id: 'marteau', q: [1, 1], p: 0.5 }, { id: 'tournevis', q: [1, 1], p: 0.6 },
          { id: 'pince_coupante', q: [1, 1], p: 0.4 }, { id: 'cle_molette', q: [1, 1], p: 0.4 },
          { id: 'pied_de_biche', q: [1, 1], p: 0.5 }, { id: 'lampe_torche', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,1': {
        t: 'piece', nom: 'Rayon bois et cordages', lbl: 'Bois', danger: 0.25, sombre: 1, mob: 'rayonnages',
        desc: 'Des tasseaux, des manches de rechange, des bobines de corde au mètre. Ça sent la sciure et la résine — une odeur d\'atelier, de cabane, d\'avant. Tu restes une minute de trop à respirer.',
        fouille: { max: 3, table: [
          { id: 'corde', q: [1, 1], p: 0.5 }, { id: 'manche_balai', q: [1, 2], p: 0.6 },
          { id: 'planche', q: [1, 2], p: 0.5 }, { id: 'ressort', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,1': {
        t: 'piece', nom: 'Rayon quincaillerie', lbl: 'Quinc.', danger: 0.25, sombre: 1, mob: 'tiroirs',
        desc: 'Des murs entiers de bacs à vis, clous, chevilles, boulons, classés au gramme près. La civilisation tenait avec ça. La tienne tiendra pareil.',
        fouille: { max: 4, table: [
          { id: 'clous', q: [4, 10], p: 0.8 }, { id: 'visserie', q: [1, 3], p: 0.8 },
          { id: 'fil_de_fer', q: [1, 2], p: 0.6 }, { id: 'scotch', q: [1, 1], p: 0.5 },
        ] },
      },
      '3,1': {
        t: 'piece', nom: 'Rayon peinture', lbl: 'Peinture', danger: 0.25, sombre: 1, mob: 'rayonnages',
        desc: 'Des pots empilés par teintes — Blanc coton, Lin clair, Gris galet : tout un nuancier de vies calmes. Quelqu\'un a renversé un pot de rouge au milieu du rayon, et tu choisis de croire que c\'est de la peinture.',
        fouille: { max: 3, table: [
          { id: 'bache_plastique', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 3], p: 0.7 },
          { id: 'scotch', q: [1, 1], p: 0.5 }, { id: 'bidon_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- la serre de la jardinerie, au bout de l'allée -----
      '5,2': {
        t: 'piece', nom: 'La jardinerie', lbl: 'Jardin', danger: 0.25, mob: 'plantes',
        desc: 'La serre de la jardinerie, voilée de verre sale. Les plants sont morts dans leurs godets, alignés comme un cimetière miniature — sauf la menthe et le thym, qui débordent de leurs pots et grimpent aux étagères. La vie continue, là où on ne lui demande rien.',
        fouille: { max: 3, table: [
          { id: 'herbes_simples', q: [1, 2], p: 0.5 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.5 },
          { id: 'gants_cuir', q: [1, 1], p: 0.35 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      // ----- tout au fond : la réserve et la cour grillagée -----
      '3,0': {
        t: 'piece', nom: 'La réserve', lbl: 'Réserve', danger: 0.35, sombre: 2, mob: 'palettes',
        desc: 'La réserve n\'a aucune fenêtre. Ta lumière accroche des rayonnages hauts comme des falaises, des palettes filmées encore pleines, et l\'échelle roulante arrêtée au milieu de son rail. Quelque part dans les hauteurs, quelque chose a fait son nid dans la laine de verre.',
        fouille: { max: 3, table: [
          { id: 'visserie', q: [1, 3], p: 0.6 }, { id: 'clous', q: [2, 6], p: 0.5 },
          { id: 'corde', q: [1, 1], p: 0.35 }, { id: 'planche', q: [1, 2], p: 0.5 },
        ] },
      },
      '1,0': {
        t: 'piece', nom: 'Cour des matériaux', lbl: 'Cour', danger: 0.3, mob: 'palettes',
        desc: 'La cour grillagée derrière le magasin : palettes de parpaings, sacs de ciment pétrifiés par la pluie. Un transpalette gît au milieu, fourches levées, comme une bête renversée.',
        fouille: { max: 2, table: [
          { id: 'brique', q: [1, 3], p: 0.6 }, { id: 'clous', q: [2, 6], p: 0.4 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Cour — la charpente', lbl: 'Cour', danger: 0.3, mob: 'palettes',
        desc: 'Le bois de charpente dort sous ses bâches, chevrons et liteaux par paquets sanglés. Le grillage du fond a gardé une touffe de tissu accrochée à mi-hauteur — quelqu\'un est passé par-dessus, dans un sens ou dans l\'autre.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [2, 4], p: 0.7 }, { id: 'bache_plastique', q: [1, 2], p: 0.6 },
        ] },
      },
    },
  },

  // ════════ GARAGE RENAULT SAPAS — la batterie de la locomotive ════════
  // Concession en T : le showroom vitré et l'accueil côté boulevard, le couloir
  // de service qui file vers le fond, la halle d'atelier sur trois travées
  // (pont élévateur, établis, porte sectionnelle), la fosse en contrebas,
  // et au fond le magasin de pièces, la réserve de pneus et le vestiaire.
  // L'aire de lavage est accolée à l'est.
  int_garage: {
    nom: 'Garage Renault Sapas', sousTitre: '666 boulevard du Roy René — le numéro faisait rire les mécanos',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 5,
    exterieur: false, ambiance: 'sombre', illu: 'atelier',
    zombiesPool: ['errant', 'rampant', 'chien_infecte', 'brule'],
    passages: [
      ['0,3', '1,3', 'ouvert'], // le showroom est un seul plateau vitré
      ['1,1', '2,1', 'ouvert'], // la halle d'atelier : pont et établis, même volume
      ['2,1', '2,2', 'ouvert'], // la halle continue jusqu'à la porte sectionnelle
      ['1,1', '1,2'], // les marches de la fosse de visite descendent depuis le pont
      ['1,0', '1,1'], // la porte de la réserve de pneus, au fond de l'atelier
      ['2,0', '2,1'], // le magasin de pièces dessert directement l'atelier
      ['3,3', '4,3'], // le bureau du patron ouvre derrière le comptoir atelier
    ],
    cases: {
      // ----- côté boulevard -----
      '2,4': {
        t: 'porte', nom: 'Accueil clientèle', lbl: 'Sortie', danger: 0.2,
        desc: 'La porte vitrée, un comptoir avec le tableau des clés — toutes pendues, aucune voiture rendue. Sur le parking, les véhicules de courtoisie attendent des clients qui n\'ont plus besoin d\'aller nulle part.',
        vers: { carte: 'ville_salon', x: 2, y: 6, temps: 2 }, versNom: 'Ressortir boulevard du Roy René',
      },
      '0,3': {
        t: 'piece', nom: 'Le showroom — les modèles', lbl: 'Showroom', danger: 0.2, mob: 'voiture',
        desc: 'Deux Clio neuves brillent sous trois semaines de poussière, les prix en chiffres énormes collés aux pare-brise. Au plafond pendent les ballons des portes ouvertes, fripés comme des fruits oubliés.',
      },
      '1,3': {
        t: 'piece', nom: 'Le showroom — le coin vendeur', lbl: '', danger: 0.25, mob: 'bureau',
        desc: 'Un bureau, deux chaises côté client, des dossiers de financement jamais signés. Dans l\'écran mort, ton reflet a la tête de quelqu\'un qui n\'achètera plus jamais rien.',
        fouille: { max: 2, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'briquet', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,3': {
        t: 'couloir', nom: 'Hall d\'accueil', lbl: '', danger: 0.2,
        desc: 'Le lino porte l\'usure de mille semelles entre la porte et le comptoir. Un présentoir de tarifs révision, un distributeur de café éventré, et ce silence de salle d\'attente qui n\'attend plus rien.',
      },
      '3,3': {
        t: 'piece', nom: 'Le comptoir atelier', lbl: 'Comptoir', danger: 0.25, mob: 'comptoir',
        desc: 'Les ordres de réparation s\'empilent sous un presse-papier en piston chromé. Le dernier, daté du jour 1, dit : « Client pressé — bruit moteur, part dans le sud ». Il n\'est jamais reparti.',
        fouille: { max: 3, table: [
          { id: 'scotch', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
          { id: 'telephone_mort', q: [1, 1], p: 0.5 }, { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'Bureau du patron', lbl: 'Bureau', danger: 0.2, mob: 'bureau',
        desc: 'Le planning des révisions couvre tout un mur, plein jusqu\'à la fin du mois. Sur le bureau, une bouteille de pastis entamée et deux verres. Ils ont trinqué à quelque chose, le dernier soir.',
        fouille: { max: 3, table: [
          { id: 'alcool_fort', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'briquet', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- le couloir de service -----
      '3,2': {
        t: 'couloir', nom: 'Couloir de service', lbl: '', danger: 0.25,
        desc: 'Derrière le comptoir, le couloir des mécanos : affiches de sécurité, pointeuse muette, un extincteur descellé. Les murs ont la couleur des mains qui les ont touchés.',
      },
      '3,1': {
        t: 'couloir', nom: 'Couloir du fond', lbl: '', danger: 0.25,
        desc: 'Ça sent la gomme, l\'huile froide et le café d\'il y a trois semaines. Sur la porte du vestiaire, une photo d\'équipe punaisée — huit hommes en bleu qui rient, un 14 juillet quelconque.',
      },
      // ----- la halle d'atelier -----
      '1,1': {
        t: 'piece', nom: 'L\'atelier — le pont', lbl: 'Atelier', danger: 0.35, mob: 'voiture', special: 'batterie',
        desc: 'Un camion de livraison est resté sur le pont élévateur, à deux mètres du sol, capot ouvert sur un moteur à moitié démonté. En dessous, sur son chariot de manutention, la batterie de poids lourd débranchée attend — 24 volts, quatorze kilos. Le cœur de rechange de la locomotive.',
        fouille: { max: 4, table: [
          { id: 'trousse_outils', q: [1, 1], p: 1 }, { id: 'cle_molette', q: [1, 1], p: 0.6 },
          { id: 'fil_de_fer', q: [1, 2], p: 0.6 }, { id: 'visserie', q: [1, 2], p: 0.7 },
          { id: 'chiffon', q: [1, 3], p: 0.7 },
        ] },
      },
      '2,1': {
        t: 'piece', nom: 'L\'atelier — les établis', lbl: '', danger: 0.3, mob: 'etabli',
        desc: 'Les servantes à outils sont restées ouvertes, chaque douille à sa place, et une clé dynamométrique posée en travers comme une phrase interrompue. Quelqu\'un comptait revenir finir le couple de serrage.',
        fouille: { max: 3, table: [
          { id: 'marteau', q: [1, 1], p: 0.4 }, { id: 'tournevis', q: [1, 1], p: 0.4 },
          { id: 'visserie', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.6 },
        ] },
      },
      '2,2': {
        t: 'piece', nom: 'L\'atelier — la sectionnelle', lbl: '', danger: 0.3, mob: 'machines',
        desc: 'La grande porte sectionnelle est baissée ; ses hublots laissent tomber deux colonnes de jour gris sur le compresseur et l\'équilibreuse. Au sol, une trace d\'huile file vers la fosse comme une flèche.',
        fouille: { max: 2, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'ressort', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,2': {
        t: 'piece', nom: 'La fosse de visite', lbl: 'Fosse', danger: 0.4, sombre: 2, mob: null,
        desc: 'Quatre marches descendent dans la fosse, sous une voiture restée en l\'air. Le fond baigne dans deux doigts d\'huile noire, et il y a une baladeuse éteinte, et un gant. Un seul gant.',
        fouille: { max: 3, table: [
          { id: 'tuyau_plastique', q: [1, 1], p: 1 }, { id: 'bidon_vide', q: [1, 1], p: 0.7 },
          { id: 'chiffon', q: [1, 3], p: 0.8 }, { id: 'cle_molette', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- les pièces du fond -----
      '1,0': {
        t: 'piece', nom: 'Réserve de pneus', lbl: 'Pneus', danger: 0.3, sombre: 2, mob: 'palettes',
        desc: 'Des colonnes de pneus montent jusqu\'au plafond dans un noir qui sent la gomme neuve. Entre les piles, des passages étroits comme des tranchées — quelque chose pourrait y attendre sans respirer.',
        fouille: { max: 3, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'bache_plastique', q: [1, 1], p: 0.4 },
          { id: 'bidon_vide', q: [1, 1], p: 0.4 }, { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Magasin de pièces', lbl: 'Magasin', danger: 0.3, sombre: 1, mob: 'rayonnages',
        desc: 'Des rayonnages de filtres, durites et plaquettes, étiquetés par référence dans une pénombre d\'archives. Une odeur de caoutchouc neuf et d\'huile propre — la dernière pièce de Salon où rien n\'a encore pourri.',
        fouille: { max: 3, table: [
          { id: 'pince_coupante', q: [1, 1], p: 0.5 }, { id: 'scotch', q: [1, 1], p: 0.6 },
          { id: 'ressort', q: [1, 2], p: 0.6 }, { id: 'cable_electrique', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,0': {
        t: 'piece', nom: 'Vestiaire des mécanos', lbl: 'Vestiaire', danger: 0.2, sombre: 1, mob: 'casiers',
        desc: 'Les bleus de travail pendent en rang, raidis de cambouis, les prénoms au marqueur sur le sparadrap des casiers. Sous le banc, une paire de chaussures de ville attend la fin d\'un service qui ne finira pas.',
        fouille: { max: 3, table: [
          { id: 'gants_cuir', q: [1, 1], p: 0.5 }, { id: 'ceinture_outils', q: [1, 1], p: 0.3 },
          { id: 'savon', q: [1, 1], p: 0.5 }, { id: 'casquette', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'piece', nom: 'Aire de lavage', lbl: 'Lavage', danger: 0.25, mob: 'machines',
        desc: 'Une berline à moitié lavée, la mousse séchée en cartes grises sur le capot. Le nettoyeur haute pression dort enroulé sur son support, et la rigole centrale a gardé une eau noire qui ne s\'écoule plus.',
        fouille: { max: 3, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.6 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.5 },
          { id: 'savon', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.6 },
        ] },
      },
    },
  },

  // ════════ CENTRE DE SECOURS — ils sont partis aider, ils ne sont pas revenus ════════
  // Deux niveaux sur le même plan : en haut l'étage de vie (dortoir, salle de sport,
  // bureau du chef, desservis par un couloir), en bas le rez-de-chaussée (vestiaires,
  // remise, standard, salle de garde, et les travées du garage avec la VSAV).
  // L'escalier relie les deux, à gauche ; le portail coulissant donne sur la rue, au sud.
  int_caserne: {
    nom: 'Centre de secours', sousTitre: 'rue Emmanuel Vitria — toutes les travées sont vides',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 6,
    exterieur: false, ambiance: 'calme', illu: 'commissariat',
    zombiesPool: ['errant'],
    passages: [
      ['1,0', '1,1'], // porte du dortoir sur le couloir de l'étage
      ['2,0', '2,1'], // porte de la salle de sport
      ['3,0', '3,1'], // porte du bureau du chef de centre
      ['3,3', '4,3'], // porte directe salle de garde → garage (départ rapide)
      ['4,3', '4,4', 'ouvert'], // les travées du garage : un seul plateau
      ['4,4', '5,4', 'ouvert'], // la travée où dort la VSAV
    ],
    cases: {
      // ----- l'étage de vie -----
      '1,0': {
        t: 'piece', nom: 'Le dortoir', lbl: 'Dortoir', danger: 0.1, mob: 'lits',
        desc: 'Des lits au carré, des réveils muets, un roman ouvert face contre le drap. La chambre de garde attend la relève comme une promesse que plus personne ne peut tenir. C\'est l\'endroit le plus triste de la ville, et le plus propre.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.6 }, { id: 'photo_famille', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Salle de sport', lbl: 'Muscu', danger: 0.1, mob: 'machines',
        desc: 'Un rack de fonte, une barre de traction, un tapis de course tourné vers la fenêtre. Au tableau blanc, les temps du parcours sportif — MARTINEZ détenait le record. Plus personne ne viendra l\'effacer.',
        fouille: { max: 3, table: [
          { id: 'bouteille_eau', q: [1, 1], p: 0.4 }, { id: 'tshirt', q: [1, 1], p: 0.4 },
          { id: 'jogging', q: [1, 1], p: 0.35 }, { id: 'barre_cereales', q: [1, 1], p: 0.25 },
        ] },
      },
      '3,0': {
        t: 'piece', nom: 'Bureau du chef de centre', lbl: 'Bureau', danger: 0.1, mob: 'bureau',
        desc: 'Les rapports d\'intervention de la nuit du 19 sont restés ouverts sous la lampe, l\'écriture de plus en plus penchée à mesure que les appels s\'empilaient. Le dernier feuillet s\'arrête au milieu d\'une phrase.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'carte_quartier', q: [1, 1], p: 0.2 },
          { id: 'briquet', q: [1, 1], p: 0.3 }, { id: 'portefeuille', q: [1, 1], p: 0.35 },
        ] },
      },
      '0,1': {
        t: 'escalier', nom: 'Escalier (étage)', lbl: 'Escalier', danger: 0.1,
        desc: 'L\'escalier de béton descend en deux volées franches. La rampe rouge est usée à blanc par des mains pressées — ici, personne ne descendait jamais lentement.',
      },
      '1,1': {
        t: 'couloir', nom: 'Couloir de l\'étage — le dortoir', lbl: '', danger: 0.1,
        desc: 'Le lino couine sous tes semelles, si fort que tu finis par marcher le long des plinthes. La porte du dortoir est entrebâillée sur une pénombre de sieste qui n\'a jamais pris fin.',
      },
      '2,1': {
        t: 'couloir', nom: 'Couloir de l\'étage — la perche', lbl: '', danger: 0.1,
        desc: 'Le trou de l\'ancienne perche a été condamné par une plaque boulonnée. Quelqu\'un y a peint un sourire au marqueur — l\'humour des gens qui descendaient vers le danger.',
      },
      '3,1': {
        t: 'couloir', nom: 'Couloir de l\'étage — le fond', lbl: '', danger: 0.1,
        desc: 'Au bout, la fenêtre donne sur la cour de manœuvre. La tour de séchage y tend ses tuyaux pendus comme des mues de serpent.',
      },
      // ----- entre les deux : l'escalier descend -----
      '0,2': {
        t: 'escalier', nom: 'Escalier (rez-de-chaussée)', lbl: 'Escalier', danger: 0.1,
        desc: 'Le bas des marches sent encore vaguement le café et le cirage. Sur la première marche, une paire de bottes attend, prête, vide.',
      },
      // ----- rez-de-chaussée : les pièces du fond -----
      '0,3': {
        t: 'piece', nom: 'Vestiaires', lbl: 'Vestiaires', danger: 0.1, mob: 'casiers',
        desc: 'Les tenues de feu pendent en rang, lourdes, indestructibles, avec les noms au pochoir : MARTINEZ, BLANC, N\'GUYEN. Dans les casiers ouverts, des photos d\'enfants sourient à des pères qui ne rentreront pas de garde.',
        fouille: { max: 4, table: [
          { id: 'veste_renforcee', q: [1, 1], p: 0.4 }, { id: 'gants_renforces', q: [1, 1], p: 0.5 },
          { id: 'rangers', q: [1, 1], p: 0.5 }, { id: 'casque_moto', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,3': {
        t: 'piece', nom: 'Remise matériel', lbl: 'Remise', danger: 0.15, sombre: 1, mob: 'ratelier',
        desc: 'Des étagères au cordeau : haches, cordes, lances, matériel de désincarcération trop lourd pour servir. Tout est rangé, vérifié, prêt. Le matériel a survécu à ceux qui l\'entretenaient.',
        fouille: { max: 4, table: [
          { id: 'hache_pompier', q: [1, 1], p: 0.8 }, { id: 'pied_de_biche', q: [1, 1], p: 0.5 },
          { id: 'corde', q: [1, 1], p: 0.6 }, { id: 'desinfectant', q: [1, 1], p: 0.5 },
          { id: 'bandage', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,3': {
        t: 'piece', nom: 'Le standard', lbl: 'Standard', danger: 0.1, mob: 'bureau',
        desc: 'Trois écrans morts, un casque pendu à son crochet, et l\'imprimante qui tend toujours son dernier ticket d\'alerte — daté du 19, secours à personne, rue des Frères Kennedy. Personne n\'a accusé réception.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'radio_portable', q: [1, 1], p: 0.25 },
          { id: 'cable_electrique', q: [1, 1], p: 0.4 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,3': {
        t: 'piece', nom: 'Salle de garde', lbl: 'Garde', danger: 0.1, mob: 'table',
        desc: 'La cafetière est encore à moitié pleine, voilée de moisissure. Le baby-foot est figé en pleine partie, la sonnerie d\'alerte au-dessus de la porte ne sonnera plus. Ils sont partis en trente secondes, comme toujours. Comme jamais.',
        fouille: { max: 3, table: [
          { id: 'chocolat', q: [1, 1], p: 0.4 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'Fond du garage', lbl: 'Atelier', danger: 0.15, sombre: 1, mob: 'etabli',
        desc: 'Le fond des travées, loin des portes levées : un établi de remise en état, des casques F1 alignés sur leur étagère, une odeur de gasoil qui a survécu à tout le reste. Le compresseur s\'est tu au milieu d\'une respiration.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'cle_molette', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- rez-de-chaussée : le hall et les travées -----
      '0,4': {
        t: 'couloir', nom: 'Couloir des vestiaires', lbl: '', danger: 0.1,
        desc: 'Des affiches de prévention sur les murs — détecteurs de fumée, gestes qui sauvent. Tout un monde où les morts restaient morts.',
      },
      '1,4': {
        t: 'couloir', nom: 'Couloir — la vitrine des coupes', lbl: '', danger: 0.1,
        desc: 'Une vitrine de coupes et de fanions, les photos des promotions depuis 1987. Sur la plus récente, trente-deux visages que tu n\'oses pas regarder trop longtemps.',
      },
      '2,4': {
        t: 'couloir', nom: 'Hall d\'accueil', lbl: '', danger: 0.1,
        desc: 'Le guichet vitré du hall, son présentoir de dépliants renversé — « Devenez sapeur-pompier volontaire ». Personne n\'a ramassé. Personne ne viendra plus s\'engager.',
      },
      '3,4': {
        t: 'couloir', nom: 'Couloir du départ', lbl: '', danger: 0.1,
        desc: 'Une ligne rouge peinte au sol file droit vers le garage. Trente secondes du lit au camion, les vestes enfilées en marchant — le chrono mural est resté vissé là, figé.',
      },
      '4,4': {
        t: 'piece', nom: 'Garage des engins', lbl: 'Engins', danger: 0.15, mob: null,
        desc: 'Six travées, six taches d\'huile, zéro camion. Les portes sont restées levées sur la nuit du premier jour. Seule une VSAV demeure, portes arrière ouvertes, son brancard à moitié sorti — ils ont chargé quelqu\'un en vitesse et pris un autre véhicule.',
        fouille: { max: 2, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.6 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.5 },
        ] },
      },
      '5,4': {
        t: 'piece', nom: 'La VSAV', lbl: 'VSAV', danger: 0.2, mob: 'voiture',
        desc: 'L\'ambulance dort dans la dernière travée, portes battantes ouvertes sur le brancard à demi sorti. Des sangles coupées au couteau, une perfusion arrachée — quelqu\'un n\'a pas attendu la fin du trajet. À l\'intérieur, ça sent l\'éther et le sang sec.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.4 },
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'attelle', q: [1, 1], p: 0.2 },
        ] },
      },
      // ----- l'entrée, côté rue -----
      '2,5': {
        t: 'porte', nom: 'L\'entrée du centre', lbl: 'Sortie', danger: 0.1,
        desc: 'Le portail coulissant est resté ouvert sur la cour de manœuvre déserte. Le drapeau pend, délavé. Au tableau des effectifs, tous les noms sont basculés sur « DÉPART ». Aucun n\'est revenu sur « RETOUR ».',
        vers: { carte: 'ville_salon', x: 8, y: 6, temps: 2 }, versNom: 'Ressortir rue Emmanuel Vitria',
      },
    },
  },
};
