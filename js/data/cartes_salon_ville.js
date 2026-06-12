// ============ Salon-de-Provence — la ville (échelle large) ============
// Lieux RÉELS : hôpital du Pays Salonais, gendarmerie (av. du 18 Juin 1940),
// commissariat (av. du Pays Catalan), Leclerc « Les Viougues », zone de la Gandonne
// (Weldom, garage Sapas), caserne des pompiers (rue Vitria), savonnerie Marius Fabre,
// stade Marcel Roustan, cimetière Saint-Roch, les Canourgues, la Monaque,
// BA 701 — École de l'air, rond-point du Fouga Magister, mémorial Jean Moulin.

export const CARTES_SALON_VILLE = {

  ville_salon: {
    nom: 'Salon-de-Provence', sousTitre: '44 000 habitants. Avant.',
    echelle: 'ville', tempsParCase: 10, largeur: 12, hauteur: 9,
    exterieur: true, ambiance: 'rue', illu: 'rue',
    zombiesPool: ['errant', 'errant', 'coureur', 'hurleur', 'gonfle', 'chien_infecte', 'brule'],
    cases: {
      // ── Axe nord : D538, gendarmerie, Canourgues, hôpital ──
      '6,0': {
        t: 'route', nom: 'Route Jean Moulin (D538)', lbl: 'D538 N.',
        desc: 'La sortie nord, vers Lamanon et la Durance. Le grand bronze noir de Jean Moulin, six mètres de haut, bras tendus vers le ciel, regarde passer les colonnes de voitures mortes. Il en a vu d\'autres, des occupations.',
        danger: 0.25, vers: { carte: 'region', x: 5, y: 4, temps: 20 }, versNom: 'Quitter Salon par le nord',
      },
      '6,1': {
        t: 'rue', nom: 'Entrée nord — av. du 18 Juin', lbl: '', danger: 0.3,
        desc: 'L\'avenue d\'entrée de ville, ses concessions auto et ses ronds-points. Un barrage de gendarmerie abandonné : herses déployées, fourgon bleu portes ouvertes, personne.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 1], p: 0.35 }, { id: 'bandage', q: [1, 1], p: 0.3 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.35 },
        ] },
      },
      '7,1': {
        t: 'batiment', nom: 'Caserne de gendarmerie', lbl: 'Gendarmerie', danger: 0.5,
        zombies: ['errant', 'enrage', 'colosse', 'coureur'],
        desc: 'L\'enceinte murée du 940 avenue du 18 Juin 1940 — caserne ET logements : les familles vivaient sur place. Le portail bâille. Dans la cour, du linge d\'enfant sèche depuis trois semaines.',
        verrou: {
          desc: 'Le portail blindé est entrouvert mais coincé par un fourgon en travers. Il faudra se faufiler ou forcer.',
          options: [
            { methode: 'skill', skill: 'agilite', niveau: 1, label: 'Se faufiler entre le fourgon et le mur', tempsMin: 5, risque: { p: 0.25, blessure: 'egratignure', zones: ['à l\'épaule'], texte: 'La tôle déchirée t\'entaille l\'épaule au passage.' } },
            { methode: 'outil', outil: 'pied_de_biche', label: 'Forcer le portail au pied-de-biche', tempsMin: 10 },
          ],
        },
        fouille: { max: 4, table: [
          { id: 'pistolet_9mm', q: [1, 1], p: 0.35 }, { id: 'munitions_9mm', q: [4, 9], p: 0.6 },
          { id: 'gilet_tactique', q: [1, 1], p: 0.4 }, { id: 'holster_cuisse', q: [1, 1], p: 0.4 },
          { id: 'rangers', q: [1, 1], p: 0.4 }, { id: 'bandage', q: [1, 2], p: 0.4 },
          { id: 'lampe_torche', q: [1, 1], p: 0.4 }, { id: 'sac_militaire', q: [1, 1], p: 0.3 },
          { id: 'radio_portable', q: [1, 1], p: 0.25 },
        ] },
      },
      '5,1': {
        t: 'rue', nom: 'Les Canourgues', lbl: 'Canourgues', danger: 0.5,
        zombies: ['errant', 'errant', 'coureur', 'hurleur', 'enrage'],
        desc: 'Les barres et les tours du plateau nord. Des milliers de gens vivaient là ; des milliers de fenêtres te regardent. Dans les cages d\'escalier, ça cogne contre les portes, étage après étage.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 3], p: 0.6 },
          { id: 'couteau_cuisine', q: [1, 1], p: 0.4 }, { id: 'jogging', q: [1, 1], p: 0.4 },
          { id: 'telephone_mort', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'batiment', nom: 'Carrefour Market des Canourgues', lbl: 'Carrefour', danger: 0.45,
        zombies: ['errant', 'putrefie', 'gonfle'],
        desc: 'Le supermarché du quartier, rideaux forcés depuis longtemps. Les rayons ont été disputés — au sens propre : des caddies renversés, des taches sombres, et ce qui reste des perdants.',
        fouille: { max: 4, table: [
          { id: 'conserve_raviolis', q: [1, 2], p: 0.5 }, { id: 'conserve_haricots', q: [1, 2], p: 0.5 },
          { id: 'chips', q: [1, 2], p: 0.4 }, { id: 'soda', q: [1, 2], p: 0.4 },
          { id: 'bouteille_eau', q: [1, 2], p: 0.4 }, { id: 'sac_plastique', q: [1, 3], p: 0.7 },
          { id: 'canette_vide', q: [1, 3], p: 0.7 }, { id: 'cabas_courses', q: [1, 1], p: 0.5 },
        ] },
      },
      '3,1': {
        t: 'batiment', nom: 'Hôpital du Pays Salonais', lbl: 'HÔPITAL', danger: 0.45,
        desc: '207 avenue Julien Fabre. Trois cent quarante-six lits, des urgences, une maternité — et l\'épicentre de tout. Les premiers mordus sont arrivés ici en ambulance. Les suivants à pied. Les derniers n\'en sont jamais repartis.',
        vers: { carte: 'int_hopital', x: 2, y: 6, temps: 3 }, versNom: 'Entrer dans l\'hôpital',
      },
      '2,1': {
        t: 'rue', nom: 'Touret — route d\'Eyguières', lbl: '', danger: 0.3,
        desc: 'Les faubourgs nord-ouest s\'effilochent en pavillons et en vergers. Au loin, la ligne bleue des Alpilles — là où il n\'y a presque personne. Donc presque aucun d\'eux.',
        fouille: { max: 2, table: [
          { id: 'manche_balai', q: [1, 1], p: 0.4 }, { id: 'appat', q: [1, 2], p: 0.5 },
          { id: 'planche', q: [1, 2], p: 0.4 },
        ] },
      },
      '1,1': {
        t: 'route', nom: 'Route d\'Eyguières (D17)', lbl: 'D17 N-O.',
        desc: 'La départementale file au nord-ouest vers Eyguières et les Alpilles, entre les haies de cyprès. L\'aérodrome est par là, quelque part dans la plaine.',
        danger: 0.2, vers: { carte: 'region', x: 4, y: 4, temps: 20 }, versNom: 'Quitter Salon vers les Alpilles',
      },
      // ── Couronne nord-centre ──
      '6,2': {
        t: 'rue', nom: 'Boulevard de la Reine Jeanne', danger: 0.35,
        desc: 'L\'axe des écoles et du collège Jean Bernard. Les grilles de l\'Intermarché voisin ont cédé dans un sens, puis dans l\'autre.',
        fouille: { max: 3, table: [
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '7,2': {
        t: 'batiment', nom: 'Intermarché Reine Jeanne', lbl: 'Intermarché', danger: 0.4,
        zombies: ['errant', 'putrefie', 'brule', 'brule', 'hurleur'],
        desc: 'Le supermarché le plus central de Salon. La moitié des rayons a brûlé — un feu de panique, vite éteint par personne. L\'autre moitié sent la suie et la saumure.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 3], p: 0.6 }, { id: 'bouteille_eau', q: [1, 2], p: 0.5 },
          { id: 'chocolat', q: [1, 1], p: 0.4 }, { id: 'casserole', q: [1, 1], p: 0.35 },
          { id: 'allumettes', q: [1, 2], p: 0.4 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,2': {
        t: 'batiment', nom: 'Stade Marcel Roustan', lbl: 'Stade', danger: 0.45,
        zombies: ['errant', 'errant', 'coureur', 'colosse'],
        desc: '« ZONE DE REGROUPEMENT » : les affiches mènent ici. Tentes militaires entre les buts, lits picot alignés sous la tribune de 1 940 places, portique de décontamination effondré. Le tri a tourné court. Les triés sont restés.',
        fouille: { max: 4, table: [
          { id: 'bandage', q: [1, 3], p: 0.6 }, { id: 'desinfectant', q: [1, 1], p: 0.4 },
          { id: 'conserve_raviolis', q: [1, 2], p: 0.5 }, { id: 'munitions_9mm', q: [2, 5], p: 0.3 },
          { id: 'bache_plastique', q: [1, 2], p: 0.5 }, { id: 'gants_cuir', q: [1, 1], p: 0.35 },
          { id: 'antibiotiques', q: [1, 1], p: 0.25 }, { id: 'radio_portable', q: [1, 1], p: 0.3 },
          { id: 'lampe_frontale', q: [1, 1], p: 0.3 },
        ] },
      },
      // ── Le centre (liens vers les quartiers fins) ──
      '6,3': {
        t: 'porte', nom: 'Les cours — centre-ville', lbl: 'CENTRE',
        desc: 'L\'anneau de platanes autour de la vieille ville : le cœur commerçant de Salon, le grand marché figé, et derrière les deux portes médiévales, le centre ancien et son château.',
        danger: 0.3, vers: { carte: 'q_cours', x: 4, y: 0, temps: 6 }, versNom: 'Descendre vers les cours',
      },
      '6,4': {
        t: 'rue', nom: 'Boulevard Aristide Briand', danger: 0.3,
        desc: 'Le boulevard contourne le centre par l\'est. À travers les platanes, on aperçoit le donjon de l\'Empéri qui domine les toits — le seul endroit de la ville qui regarde tout le reste de haut.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'brique', q: [1, 1], p: 0.4 },
          { id: 'portefeuille', q: [1, 1], p: 0.35 },
        ] },
      },
      '5,3': {
        t: 'rue', nom: 'Avenue Émile Zola', lbl: '', danger: 0.3,
        desc: 'L\'avenue glisse vers l\'ouest, la gare et les voies. Les platanes y sont plus jeunes, les façades plus basses, les ombres plus longues.',
      },
      '5,4': {
        t: 'batiment', nom: 'Savonnerie Marius Fabre', lbl: 'Savonnerie', danger: 0.3,
        desc: '148 avenue Paul-Bourret : la fabrique de savon de Marseille depuis 1900. Les chaudrons sont pleins, figés, verts. L\'odeur d\'huile d\'olive saponifiée a survécu à la fin du monde — c\'est déjà ça.',
        fouille: { max: 4, table: [
          { id: 'savon', q: [2, 4], p: 0.9 }, { id: 'bidon_vide', q: [1, 1], p: 0.4 },
          { id: 'chiffon', q: [2, 4], p: 0.6 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'desinfectant', q: [1, 1], p: 0.35 },
        ] },
      },
      '4,3': {
        t: 'rue', nom: 'Quartier Blazots — pavillons', lbl: '', danger: 0.3,
        desc: 'Des lotissements proprets, haies taillées une dernière fois il y a trois semaines. Jardins, abris, barbecues : la banlieue pavillonnaire est une mine — maison par maison, clôture par clôture.',
        fouille: { max: 4, table: [
          { id: 'marteau', q: [1, 1], p: 0.4 }, { id: 'clous', q: [3, 8], p: 0.5 },
          { id: 'tuyau_plastique', q: [1, 1], p: 0.4 }, { id: 'conserve_haricots', q: [1, 1], p: 0.35 },
          { id: 'collet', q: [1, 1], p: 0.3 }, { id: 'planche', q: [1, 3], p: 0.5 },
        ] },
      },
      '4,2': {
        t: 'rue', nom: 'Avenue Julien Fabre', lbl: '', danger: 0.35,
        desc: 'L\'axe de l\'hôpital. Des ambulances abandonnées en file indienne sur cinq cents mètres, gyrophares morts. Certaines portières sont restées ouvertes. Certaines civières aussi.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.4 },
          { id: 'kit_suture', q: [1, 1], p: 0.25 }, { id: 'vitamines', q: [1, 1], p: 0.35 },
        ] },
      },
      '3,2': {
        t: 'rue', nom: 'Bel-Air', lbl: '', danger: 0.35,
        desc: 'Petits collectifs et maisons mêlés. Le complexe sportif de Bel-Air a servi de point de ralliement — les sacs de couchage sont encore là, alignés dans le gymnase, tous occupés, aucun par un vivant.',
        fouille: { max: 3, table: [
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'barre_cereales', q: [1, 2], p: 0.4 },
          { id: 'jogging', q: [1, 1], p: 0.4 }, { id: 'baskets', q: [1, 1], p: 0.35 },
        ] },
      },
      // ── Ouest : gare, Gandonne ──
      '4,4': {
        t: 'porte', nom: 'Quartier Morgan-Gare', lbl: 'GARE',
        desc: 'Vers la place Morgan, le pôle bus et la gare SNCF — la porte de sortie ferroviaire de Salon, si quelque chose y roule encore.',
        danger: 0.3, vers: { carte: 'q_gare', x: 3, y: 0, temps: 6 }, versNom: 'Descendre au quartier de la gare',
      },
      '3,4': {
        t: 'rue', nom: 'Avenue de la Gandonne', lbl: '', danger: 0.25,
        desc: 'La zone d\'activités commence : hangars, enseignes, parkings à poids lourds. Moins d\'habitants ici — donc moins d\'eux. Le métal rouille en paix.',
      },
      '2,4': {
        t: 'rue', nom: 'ZA la Gandonne (est)', lbl: 'Gandonne', danger: 0.25,
        desc: 'Entrepôts et ateliers en tôle grise. Un semi-remorque s\'est couché en travers du rond-point, sa cargaison de palettes éventrée sur cent mètres.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [2, 4], p: 0.7 }, { id: 'bache_plastique', q: [1, 2], p: 0.5 },
          { id: 'visserie', q: [1, 2], p: 0.5 }, { id: 'fil_de_fer', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,5': {
        t: 'rue', nom: 'Boulevard du Roy René', danger: 0.25,
        desc: 'L\'artère de la zone industrielle. Garages auto, matériaux, une station-service Total aux pompes mortes — sans électricité, l\'essence dort dans les cuves, inaccessible.',
        fouille: { max: 3, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.4 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.4 },
          { id: 'cle_molette', q: [1, 1], p: 0.35 }, { id: 'ressort', q: [1, 2], p: 0.5 },
        ] },
      },
      '1,5': {
        t: 'batiment', nom: 'Weldom — rue du Canesteu', lbl: 'Weldom', danger: 0.3,
        desc: 'Le magasin de bricolage de la Gandonne. Tout ce qu\'il faut pour construire, barricader, réparer — si les rayons n\'ont pas déjà été passés au peigne fin par plus prévoyant que toi.',
        vers: { carte: 'int_weldom', x: 1, y: 3, temps: 2 }, versNom: 'Entrer chez Weldom',
      },
      '2,6': {
        t: 'batiment', nom: 'Garage Renault Sapas', lbl: 'Garage', danger: 0.3,
        desc: '666 boulevard du Roy René. Le grand garage auto de la zone : pont élévateur, atelier poids lourds, et — si le carnet du cheminot dit vrai — une batterie de camion encore chargée quelque part là-dedans.',
        vers: { carte: 'int_garage', x: 2, y: 4, temps: 2 }, versNom: 'Entrer dans le garage',
      },
      '1,6': {
        t: 'rue', nom: 'ZA la Gandonne (sud)', lbl: '', danger: 0.25,
        desc: 'Le bout de la zone, là où les hangars laissent place aux champs de la Crau. Un Intersport, des concessions, et le silence des parkings vides.',
        fouille: { max: 3, table: [
          { id: 'batte_baseball', q: [1, 1], p: 0.35 }, { id: 'sac_a_dos', q: [1, 1], p: 0.35 },
          { id: 'gants_cuir', q: [1, 1], p: 0.35 }, { id: 'corde', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,6': {
        t: 'site', nom: 'Cimetière Saint-Roch', lbl: 'Cimetière', danger: 0.3,
        zombies: ['errant', 'rampant', 'putrefie'],
        desc: 'Bâti en hauteur sur le rocher, 140 boulevard du Roi René : une ville de mausolées serrés, ruelles de marbre et de cyprès. L\'ironie du lieu ne t\'échappe pas : c\'est le seul quartier où les morts sont restés couchés.',
        fouille: { max: 3, table: [
          { id: 'allumettes', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'brique', q: [1, 2], p: 0.5 }, { id: 'alcool_fort', q: [1, 1], p: 0.3 },
          { id: 'photo_famille', q: [1, 1], p: 0.4 },
        ] },
      },
      // ── Sud-est : Monaque, commissariat, Viougues, Leclerc ──
      '7,4': {
        t: 'rue', nom: 'La Monaque', lbl: 'Monaque', danger: 0.45,
        zombies: ['errant', 'errant', 'coureur', 'hurleur'],
        desc: 'La cité des années 60, collée au centre. Neuf hectares de barres où logeaient les familles de la base aérienne. Sur un balcon du troisième, un drapeau tricolore pend, à moitié arraché. Quelqu\'un y a écrit : « ILS NOUS ONT LAISSÉS. »',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 3], p: 0.6 },
          { id: 'munitions_9mm', q: [2, 4], p: 0.25 }, { id: 'couteau_cuisine', q: [1, 1], p: 0.35 },
          { id: 'casquette', q: [1, 1], p: 0.3 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
        ] },
      },
      '8,4': {
        t: 'batiment', nom: 'Commissariat de police', lbl: 'Police', danger: 0.4,
        desc: 'Avenue du Pays Catalan. Les portes vitrées sont défoncées — vers l\'extérieur. À l\'accueil, des sacs de sable et des douilles par centaines : ils ont tenu un siège, ici. Ils ont perdu.',
        vers: { carte: 'int_commissariat', x: 2, y: 5, temps: 2 }, versNom: 'Entrer dans le commissariat',
      },
      '8,3': {
        t: 'rue', nom: 'Avenue de l\'Europe', lbl: '', danger: 0.35,
        desc: 'L\'axe est, son collège Jean Moulin et sa pharmacie au 715. Les abribus sont placardés du même arrêté préfectoral, daté du 21 : « CONFINEMENT GÉNÉRAL ». Il a tenu deux jours.',
        fouille: { max: 2, table: [
          { id: 'bandage_fortune', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'soda', q: [1, 1], p: 0.3 },
        ] },
      },
      '9,3': {
        t: 'rue', nom: 'Les Viougues', lbl: 'Viougues', danger: 0.3,
        desc: 'Le plateau est de la ville, pavillons et pinède. De là-haut, on voit tout Salon — et les colonnes de fumée qui montent encore de trois quartiers.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [1, 2], p: 0.5 }, { id: 'clous', q: [2, 6], p: 0.5 },
          { id: 'collet', q: [1, 1], p: 0.3 }, { id: 'appat', q: [1, 2], p: 0.5 },
        ] },
      },
      '10,3': {
        t: 'batiment', nom: 'E.Leclerc Les Viougues', lbl: 'LECLERC', danger: 0.45,
        desc: 'L\'hypermarché de Salon, route de Pélissanne. Un parking de cinq cents places, cinq cents voitures, et le grand rideau d\'entrée levé d\'un mètre vingt. Tout le monde a eu la même idée que toi. Tout le monde.',
        vers: { carte: 'int_leclerc', x: 2, y: 5, temps: 3 }, versNom: 'Se glisser sous le rideau',
      },
      '10,4': {
        t: 'rue', nom: 'Route de Pélissanne (ouest)', lbl: '', danger: 0.3,
        desc: 'La D572 commence sa route vers Pélissanne et la vallée de la Touloubre. Les carcasses se font plus rares — ceux qui sont partis par là sont partis tôt.',
      },
      '11,4': {
        t: 'route', nom: 'D572 — vers Pélissanne', lbl: 'D572 E.',
        desc: 'La départementale s\'enfonce à l\'est entre les collines. Pélissanne à cinq kilomètres, La Barben et son château au-delà. Et le zoo. Tu repenses au zoo chaque fois qu\'un buisson bouge.',
        danger: 0.2, vers: { carte: 'region', x: 6, y: 5, temps: 20 }, versNom: 'Quitter Salon par l\'est',
      },
      // ── Sud : Broquetiers, caserne, BA701 ──
      '6,5': {
        t: 'rue', nom: 'Avenue Georges Borel', lbl: '', danger: 0.3,
        desc: 'L\'avenue descend plein sud, vers la zone des Broquetiers et, au bout, la base aérienne. Les panneaux militaires « BA 701 — ÉCOLE DE L\'AIR » sont criblés d\'impacts.',
      },
      '7,5': {
        t: 'rue', nom: 'Rond-point de la Monaque sud', lbl: '', danger: 0.3,
        desc: 'Un carrefour giratoire orné d\'oliviers municipaux. Au centre, quelqu\'un a dressé trois croix de fortune en planches. Il y a des fleurs fraîches. FRAÎCHES.',
      },
      '7,6': {
        t: 'rue', nom: 'Les Broquetiers — av. de la Patrouille de France', lbl: 'Broquetiers', danger: 0.3,
        desc: 'La zone commerciale sud : Norauto, Buffalo Grill, un hôtel trois étoiles aux 55 chambres closes. Le Buffalo a brûlé. L\'odeur de graisse froide et de cendre tient le quartier.',
        fouille: { max: 4, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'cle_molette', q: [1, 1], p: 0.4 },
          { id: 'tuyau_plastique', q: [1, 1], p: 0.4 }, { id: 'bidon_vide', q: [1, 1], p: 0.4 },
          { id: 'trousse_outils', q: [1, 1], p: 0.25 }, { id: 'scotch', q: [1, 1], p: 0.4 },
        ] },
      },
      '8,6': {
        t: 'batiment', nom: 'Caserne des pompiers', lbl: 'Pompiers', danger: 0.2,
        desc: 'Le centre de secours de la rue Emmanuel Vitria, un des plus gros du département. Les portes des remises sont grandes ouvertes, les engins partis — partis en intervention le premier jour, jamais revenus. La caserne attend ses camions comme un chien attend son maître.',
        vers: { carte: 'int_caserne', x: 2, y: 5, temps: 2 }, versNom: 'Entrer dans la caserne',
      },
      '6,6': {
        t: 'rue', nom: 'D113 — traversée sud', lbl: '', danger: 0.35,
        desc: 'L\'ancienne nationale traverse le sud de la ville. L\'exode est passé par là : glissières pliées, valises éclatées, et une file de voitures qui n\'avance plus depuis vingt-trois jours.',
        fouille: { max: 3, table: [
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'bouteille_eau', q: [1, 1], p: 0.35 },
          { id: 'manteau_hiver', q: [1, 1], p: 0.3 }, { id: 'sac_plastique', q: [1, 3], p: 0.6 },
        ] },
      },
      '6,7': {
        t: 'route', nom: 'Avenue de la Patrouille de France (sud)', lbl: '', danger: 0.3, special: 'siphon',
        desc: 'La quatre-voies qui mène à la base. Des dizaines de véhicules militaires et civils imbriqués — l\'évacuation de la BA 701 s\'est arrêtée ici, à deux kilomètres des grilles. Les réservoirs des camions n\'attendent que ton tuyau.',
        fouille: { max: 4, table: [
          { id: 'munitions_9mm', q: [2, 6], p: 0.35 }, { id: 'cartouches', q: [2, 4], p: 0.25 },
          { id: 'bandage', q: [1, 2], p: 0.4 }, { id: 'gants_renforces', q: [1, 1], p: 0.3 },
          { id: 'bidon_vide', q: [1, 1], p: 0.4 }, { id: 'barre_cereales', q: [1, 3], p: 0.5 },
        ] },
      },
      '6,8': {
        t: 'site', nom: 'BA 701 — École de l\'air', lbl: 'BA 701', danger: 0.55,
        zombies: ['coureur', 'enrage', 'colosse', 'errant'],
        desc: 'Quatre cent cinquante hectares derrière les grilles et les miradors vides. Sur le tarmac, des Alphajets de la Patrouille de France, intacts, alignés comme à la parade. La radio de la base s\'est tue il y a une semaine. Les grilles sont closes de l\'intérieur — et des silhouettes en treillis patrouillent encore, à leur manière. Ce qui s\'est passé ici attendra le chapitre 2. Si tu vis jusque-là.',
        fouille: { max: 2, table: [
          { id: 'munitions_9mm', q: [3, 8], p: 0.4 }, { id: 'gilet_tactique', q: [1, 1], p: 0.25 },
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'cartouches', q: [2, 5], p: 0.25 },
        ] },
      },
      '7,8': {
        t: 'site', nom: 'Rond-point du Fouga Magister', lbl: 'L\'Avion', danger: 0.25,
        desc: 'Le vieux Fouga aux couleurs de la Patrouille de France, perché sur son mât au milieu du giratoire. Tous les Salonais se sont donné rendez-vous « à l\'avion » un jour ou l\'autre. Quelqu\'un a pendu une banderole entre les ailes : « ILS REVIENDRONT ». Le vent l\'a déchirée en deux.',
        vers: { carte: 'region', x: 5, y: 6, temps: 20 }, versNom: 'Quitter Salon par le sud',
      },
      // ── Barrière est : canal EDF (décor infranchissable) ──
      '11,1': { t: 'eau', nom: 'Canal EDF', desc: 'Six à dix mètres de fond, des parois lisses, 250 m³ par seconde. Personne ne traverse ça. Rien ne traverse ça.' },
      '11,2': { t: 'eau', nom: 'Canal EDF', desc: 'Le canal usinier file vers la centrale de Croix-Blanche. L\'eau, elle, n\'a pas remarqué la fin du monde.' },
    },
  },
};
