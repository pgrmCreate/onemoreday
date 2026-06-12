// ============ Le pays salonais — carte interville ============
// Lieux RÉELS : Pélissanne, La Barben (château + parc animalier), Grans, Lançon et
// son péage A7, Eyguières et l'aérodrome, Lamanon et les grottes de Calès, Sénas,
// Alleins, Mallemort et son pont, Vieux-Vernègues (ruiné par le séisme de 1909),
// Miramas (triage, Clésud, Miramas-le-Vieux), Saint-Chamas et la Poudrerie royale,
// les Alpilles, la plaine de la Crau, l'étang de Berre, la bifurcation A7/A54.

export const CARTES_REGION = {

  region: {
    nom: 'Le pays salonais', sousTitre: 'la Provence entre Durance, Alpilles et étang de Berre',
    echelle: 'region', tempsParCase: 45, largeur: 12, hauteur: 9,
    exterieur: true, ambiance: 'rue', illu: 'parc',
    zombiesPool: ['errant', 'coureur', 'chien_infecte'],
    cases: {
      // ── Salon, au centre ──
      '5,5': {
        t: 'ville', nom: 'Salon-de-Provence', lbl: 'SALON',
        desc: 'La ville aux 44 000 habitants, son château dressé sur le rocher, ses colonnes de fumée. Chez toi, pour ce que ça veut encore dire.',
        danger: 0.3, vers: { carte: 'ville_salon', x: 6, y: 1, temps: 20 }, versNom: 'Rentrer dans Salon',
      },
      // ── Axe nord : D538, Lamanon, Sénas, Durance ──
      '5,4': {
        t: 'route', nom: 'D538 — route Jean Moulin', danger: 0.25,
        desc: 'La départementale du nord, droite entre les vergers. Des voitures abandonnées tous les cent mètres, capots ouverts, réservoirs déjà tétés.',
        fouille: { max: 2, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.3 }, { id: 'barre_cereales', q: [1, 1], p: 0.3 },
          { id: 'sac_plastique', q: [1, 2], p: 0.5 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,3': {
        t: 'route', nom: 'D538 — la plaine', danger: 0.2,
        desc: 'La route file entre les haies de cyprès, plein nord. Le pertuis de Lamanon s\'ouvre devant toi : le seul passage naturel entre les Alpilles et les collines. Tout passe par là — les canaux, le rail, la route. Tout est toujours passé par là.',
      },
      '5,2': {
        t: 'village', nom: 'Lamanon', lbl: 'Lamanon', danger: 0.35,
        zombies: ['errant', 'putrefie', 'rampant'],
        desc: 'Le village du pertuis, écrasé sous son platane géant — la Soléïado, six cents ans d\'âge. Les volets battent. Sur la place, un panneau à la craie : « CALÈS. EN HAUT. VIVANTS. »',
        fouille: { max: 3, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.4 }, { id: 'bouteille_eau', q: [1, 1], p: 0.35 },
          { id: 'couteau_cuisine', q: [1, 1], p: 0.35 }, { id: 'corde', q: [1, 1], p: 0.35 },
          { id: 'allumettes', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,1': {
        t: 'site', nom: 'Grottes de Calès', lbl: 'Calès', danger: 0.2,
        desc: 'Cent seize grottes creusées dans le safre entre deux falaises — un village troglodyte entier, habité au Moyen Âge, vide depuis cinq siècles. Plus maintenant : des cordes pendent aux accès, des guetteurs te suivent des yeux depuis les cavités. Des vivants. Méfiants. Armés.',
        fouille: { max: 2, table: [
          { id: 'corde', q: [1, 1], p: 0.4 }, { id: 'torche', q: [1, 1], p: 0.3 },
          { id: 'appat', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,2': {
        t: 'route', nom: 'Ex-N7 — vallée de la Durance', danger: 0.3,
        desc: 'La mythique Nationale 7, devenue un long parking de l\'exode. Les hordes descendues de la vallée du Rhône sont passées par ici. Certaines y traînent encore.',
        fouille: { max: 3, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.35 }, { id: 'manteau_hiver', q: [1, 1], p: 0.3 },
          { id: 'conserve_raviolis', q: [1, 1], p: 0.35 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,1': {
        t: 'village', nom: 'Sénas', lbl: 'Sénas', danger: 0.35,
        desc: 'Le grenier du pays : vergers à perte de vue, stations fruitières, entrepôts frigorifiques pleins de pommes qui fermentent doucement dans le noir. L\'odeur de cidre sauvage se sent depuis la route.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.4 }, { id: 'bidon_vide', q: [1, 1], p: 0.35 },
          { id: 'collet', q: [1, 1], p: 0.3 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.35 },
          { id: 'barre_cereales', q: [1, 3], p: 0.5 },
        ] },
      },
      '7,2': {
        t: 'village', nom: 'Alleins', lbl: 'Alleins', danger: 0.25,
        desc: 'Un village calme adossé aux collines, ses ruelles, son castrum ruiné sur la hauteur. Des potagers entretenus — ENTRETENUS. Quelqu\'un vit ici et ne tient pas à ce que ça se sache.',
        fouille: { max: 3, table: [
          { id: 'appat', q: [1, 2], p: 0.5 }, { id: 'conserve_haricots', q: [1, 1], p: 0.35 },
          { id: 'manche_balai', q: [1, 1], p: 0.4 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      '8,2': {
        t: 'route', nom: 'D17d — piémont des Costes', danger: 0.2,
        desc: 'La petite route serpente au pied du massif, entre oliveraies et murets de pierre sèche. Pas une carcasse, pas un corps : par ici, la fin du monde s\'est faite discrète.',
      },
      '8,1': {
        t: 'village', nom: 'Mallemort', lbl: 'Mallemort', danger: 0.3,
        desc: '« Malle-mort ». Le nom du village a cessé d\'être drôle il y a vingt-trois jours. Les résidences de Pont-Royal alignent leurs piscines vertes le long d\'un golf retourné à la steppe.',
        fouille: { max: 3, table: [
          { id: 'bouteille_eau', q: [1, 2], p: 0.4 }, { id: 'alcool_fort', q: [1, 1], p: 0.35 },
          { id: 'pull_laine', q: [1, 1], p: 0.35 }, { id: 'briquet', q: [1, 1], p: 0.35 },
        ] },
      },
      '8,0': {
        t: 'site', nom: 'Pont et barrage de Mallemort', lbl: 'Pont', danger: 0.3,
        desc: 'Le vieux pont suspendu de 1848 et son frère moderne, côte à côte au-dessus de la Durance — le seul franchissement du secteur. Quelqu\'un a soudé des herses de fortune à l\'entrée du tablier. Le barrage EDF ronronne en aval, sans personne aux commandes.',
        fouille: { max: 2, table: [
          { id: 'cable_electrique', q: [1, 2], p: 0.5 }, { id: 'visserie', q: [1, 2], p: 0.5 },
          { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      // ── Axe nord-ouest : D17, Eyguières, Alpilles ──
      '4,4': {
        t: 'route', nom: 'D17 — route d\'Eyguières', danger: 0.2,
        desc: 'La route des Alpilles, entre la plaine et les premiers contreforts. Un tracteur en travers, moteur arraché. Le silence des champs est si total qu\'il bourdonne.',
      },
      '3,4': {
        t: 'site', nom: 'Aérodrome de Salon-Eyguières', lbl: 'Aérodrome', danger: 0.25,
        desc: 'Deux cents hectares d\'herbe, des hangars en tôle, des avions légers sagement alignés — Cessna, ULM, planeurs. Aucun n\'a décollé : pas d\'essence avia dans les cuves, siphonnées par les premiers partis. Les hangars, eux, n\'ont pas tout donné.',
        fouille: { max: 4, table: [
          { id: 'trousse_outils', q: [1, 1], p: 0.4 }, { id: 'bidon_vide', q: [1, 2], p: 0.5 },
          { id: 'cable_electrique', q: [1, 2], p: 0.5 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'cle_molette', q: [1, 1], p: 0.4 }, { id: 'bache_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,3': {
        t: 'route', nom: 'D17 — piémont des Alpilles', danger: 0.2,
        desc: 'Les falaises blanches des Alpilles se dressent au nord. La garrigue sent le thym et la pierre chaude. Pour la première fois depuis des semaines, tu n\'entends rien traîner des pieds.',
      },
      '2,3': {
        t: 'village', nom: 'Eyguières', lbl: 'Eyguières', danger: 0.3,
        desc: 'Le gros village au pied des Opies. Fontaines, lavoirs, platanes — et des barricades de village, faites de remorques agricoles et de bottes de foin. Percées, toutes.',
        fouille: { max: 3, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.4 }, { id: 'fusil_chasse', q: [1, 1], p: 0.2 },
          { id: 'cartouches', q: [2, 5], p: 0.3 }, { id: 'collet', q: [1, 1], p: 0.35 },
          { id: 'alcool_fort', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,2': {
        t: 'nature', nom: 'Massif des Alpilles', lbl: 'Alpilles', danger: 0.15, special: 'chasse',
        desc: 'Calcaire blanc, pins tordus, sentiers de crête. Presque personne ne vivait ici — presque aucun d\'eux n\'y rôde. Le gibier, lui, est revenu en force. La montagne se moque de la fin du monde.',
        fouille: { max: 2, table: [
          { id: 'appat', q: [1, 3], p: 0.6 }, { id: 'manche_balai', q: [1, 1], p: 0.4 },
          { id: 'torche', q: [1, 1], p: 0.2 }, { id: 'herbes_simples', q: [1, 2], p: 0.5 },
        ] },
      },
      // ── Ouest/sud-ouest : Crau, Grans, Miramas, étang ──
      '4,5': {
        t: 'nature', nom: 'Plaine de la Crau', lbl: 'Crau', danger: 0.2, special: 'chasse',
        zombies: ['chien_infecte', 'chien_infecte', 'errant'],
        desc: 'La steppe de cailloux, plate jusqu\'à l\'horizon. Cent mille brebis y paissaient ; les troupeaux errent maintenant sans bergers, et les patous devenus fous les gardent contre tout ce qui marche — morts comme vivants. On voit venir à deux kilomètres. On est vu pareil.',
        fouille: { max: 3, table: [
          { id: 'viande_crue', q: [1, 2], p: 0.4 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'collet', q: [1, 1], p: 0.35 }, { id: 'bidon_vide', q: [1, 1], p: 0.3 },
        ] },
      },
      '5,6': {
        t: 'route', nom: 'D113 — vers le sud', danger: 0.25,
        desc: 'L\'ancienne nationale Arles–Marseille descend vers Lançon et l\'étang. À l\'est, par-dessus les champs, on devine les grillages sans fin de la base aérienne.',
        fouille: { max: 2, table: [
          { id: 'sac_plastique', q: [1, 2], p: 0.5 }, { id: 'canette_vide', q: [1, 3], p: 0.6 },
          { id: 'barre_cereales', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,6': {
        t: 'route', nom: 'D569 — vallée de la Touloubre', danger: 0.2,
        desc: 'La petite route suit la rivière entre les peupliers. La Touloubre est presque à sec — son lit de galets fait un chemin creux, invisible depuis la plaine.',
      },
      '3,6': {
        t: 'village', nom: 'Grans', lbl: 'Grans', danger: 0.3,
        desc: 'Le village sur la Touloubre, ses moulins, ses lavoirs où l\'eau coule toujours — de l\'eau douce, courante, permanente. La moitié des survivants du pays a dû y penser. Les traces de camps le confirment.',
        fouille: { max: 3, table: [
          { id: 'bouteille_eau', q: [1, 2], p: 0.4 }, { id: 'canne_peche', q: [1, 1], p: 0.3 },
          { id: 'conserve_raviolis', q: [1, 1], p: 0.35 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'casserole', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,7': {
        t: 'route', nom: 'D69 — vers Miramas', danger: 0.25,
        desc: 'La route longe les clôtures interminables de Clésud — sept cent mille mètres carrés d\'entrepôts logistiques. Des semi-remorques alignés par centaines. Quelqu\'un a taggé sur un portail : « TOUT EST À NOUS MAINTENANT ». Quelqu\'un d\'autre a barré « NOUS ».',
      },
      '2,7': {
        t: 'ville', nom: 'Miramas — le triage et le Vieux', lbl: 'MIRAMAS', danger: 0.45,
        zombies: ['errant', 'errant', 'coureur', 'hurleur', 'gonfle'],
        desc: 'La plus grande gare de triage du sud-est : des kilomètres de wagons immobiles. Au-dessus, sur son éperon de rocher, Miramas-le-Vieux — le village médiéval, ses murs, ses guetteurs, sa rampe unique hérissée de herses. C\'est LE Refuge de la radio. À pied, n\'y pense pas : ils tirent les premiers et s\'excusent jamais. La voix l\'a répété : « suivez la voie ferrée ». Le convoi. Seulement le convoi.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [1, 3], p: 0.5 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'conserve_haricots', q: [1, 2], p: 0.4 }, { id: 'fil_de_fer', q: [1, 3], p: 0.5 },
        ] },
      },
      '1,7': {
        t: 'village', nom: 'Saint-Chamas', lbl: 'St-Chamas', danger: 0.3,
        desc: 'Le port de pêche sur l\'étang de Berre, ses maisons troglodytes, son pont romain du Ier siècle — le pont Flavien, étroit, défendable à deux. Des barques de pêche se balancent au môle. Les zombies nagent mal, dit-on. Personne n\'a vérifié deux fois.',
        fouille: { max: 3, table: [
          { id: 'canne_peche', q: [1, 1], p: 0.4 }, { id: 'poisson_fume', q: [1, 2], p: 0.35 },
          { id: 'corde', q: [1, 2], p: 0.5 }, { id: 'couteau_cuisine', q: [1, 1], p: 0.35 },
        ] },
      },
      '0,7': {
        t: 'site', nom: 'L\'ancienne Poudrerie royale', lbl: 'Poudrerie', danger: 0.35,
        zombies: ['errant', 'rampant', 'putrefie'],
        desc: 'Trois siècles de fabrique d\'explosifs engloutis par une forêt humide — bâtiments éventrés sous les lianes, canaux morts, roselières. En 1936, une explosion a tué 53 ouvriers ici. Les caves scellées n\'ont jamais toutes été vidées, murmuraient les anciens. Poudre noire. Salpêtre. De quoi faire parler le futur.',
        fouille: { max: 3, table: [
          { id: 'cable_electrique', q: [1, 2], p: 0.5 }, { id: 'planche', q: [1, 2], p: 0.5 },
          { id: 'fil_de_fer', q: [1, 3], p: 0.5 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      // ── Est : Pélissanne, La Barben, Aurons, Vernègues ──
      '6,5': {
        t: 'route', nom: 'D572 — vallée de la Touloubre', danger: 0.25,
        desc: 'La route de Pélissanne s\'enfonce à l\'est entre les collines boisées. C\'est par là qu\'on monte vers La Barben — son château, et son zoo. Les bas-côtés portent des traces de griffes. Larges. Pas humaines.',
      },
      '7,5': {
        t: 'village', nom: 'Pélissanne', lbl: 'Pélissanne', danger: 0.4,
        zombies: ['errant', 'errant', 'coureur', 'putrefie'],
        desc: 'Dix mille habitants, des halles, des fontaines — la petite sœur de Salon, assez proche pour être tombée le même jour. Le centre ancien est un piège à embuscades : ruelles closes, voitures en chicane, et eux à chaque angle.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.45 }, { id: 'bandage', q: [1, 1], p: 0.35 },
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'couteau_cuisine', q: [1, 1], p: 0.35 },
          { id: 'bouteille_eau', q: [1, 1], p: 0.35 }, { id: 'alcool_fort', q: [1, 1], p: 0.3 },
        ] },
      },
      '8,5': {
        t: 'route', nom: 'D572 — gorges de la Touloubre', danger: 0.3,
        desc: 'La route se resserre dans la vallée boisée. Sur le bitume, une carcasse de sanglier, proprement vidée. Pas déchiquetée — VIDÉE. Quelque chose de grand chasse dans ces bois, et ce n\'est pas un errant.',
      },
      '9,5': {
        t: 'route', nom: 'Montée de La Barben', danger: 0.3,
        desc: 'Le château apparaît au détour, perché sur son éperon au-dessus des arbres — mille ans de murailles intactes. Les panneaux du parc animalier pendent : « VOUS ENTREZ SUR LE TERRITOIRE DES LIONS ». Quelqu\'un a ajouté au feutre : « ILS SONT SORTIS. »',
      },
      '9,6': {
        t: 'site', nom: 'Château et zoo de La Barben', lbl: 'La Barben', danger: 0.45,
        zombies: ['chien_infecte', 'errant', 'coureur'],
        desc: 'Trente hectares d\'enclos ouverts ou éventrés. Les herbivores broutent en liberté entre les carcasses de visiteurs ; des lions, des loups et des hyènes ont pris la garrigue. Le château, lui, est clos, hermétique — et des silhouettes armées arpentent ses remparts. Une faction tient la forteresse. Reste à savoir laquelle. Chapitre 2.',
        fouille: { max: 3, table: [
          { id: 'viande_crue', q: [1, 2], p: 0.45 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'trousse_outils', q: [1, 1], p: 0.25 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      '7,4': {
        t: 'village', nom: 'Aurons', lbl: 'Aurons', danger: 0.15,
        desc: 'Six cents âmes, une seule route en lacets, des collines boisées tout autour. Le village perché est presque intact — presque vide aussi : rien à manger, rien à piller, rien à craindre. Le sanctuaire des pauvres.',
        fouille: { max: 2, table: [
          { id: 'appat', q: [1, 2], p: 0.5 }, { id: 'allumettes', q: [1, 1], p: 0.4 },
          { id: 'manche_balai', q: [1, 1], p: 0.4 },
        ] },
      },
      '8,4': {
        t: 'route', nom: 'Route des Costes', danger: 0.15,
        desc: 'La petite route de crête entre Aurons et Vernègues. Vue plongeante sur toute la plaine : Salon fume, l\'étang scintille, et l\'A7 dessine sa cicatrice grise du nord au sud.',
      },
      '8,3': {
        t: 'site', nom: 'Vieux-Vernègues', lbl: 'Vernègues', danger: 0.2,
        desc: 'Le village fantôme. Détruit par le séisme du 11 juin 1909 — le plus violent jamais enregistré en France — et jamais rebâti. Ruines à ciel ouvert, église éventrée, caves voûtées sous tes pas, prêtes à céder. Un lieu qui a déjà connu sa fin du monde. Il t\'accueille en collègue.',
        fouille: { max: 3, table: [
          { id: 'brique', q: [2, 4], p: 0.7 }, { id: 'planche', q: [1, 2], p: 0.4 },
          { id: 'eclat_verre', q: [1, 2], p: 0.5 }, { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
      '6,4': {
        t: 'nature', nom: 'Collines du Tallagard', lbl: 'Tallagard', danger: 0.15, special: 'chasse',
        desc: 'Oliviers, amandiers, bories de pierre sèche. Le plateau au-dessus de Salon, point culminant de la commune. Les bergeries abandonnées font des abris honnêtes, et le gibier ne manque pas.',
        fouille: { max: 3, table: [
          { id: 'appat', q: [1, 3], p: 0.6 }, { id: 'collet', q: [1, 1], p: 0.3 },
          { id: 'planche', q: [1, 2], p: 0.4 }, { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
      // ── Les autoroutes ──
      '6,3': {
        t: 'autoroute', nom: 'Bifurcation A7 / A54', lbl: 'A7', danger: 0.5, special: 'siphon',
        zombies: ['errant', 'errant', 'coureur', 'gonfle', 'hurleur'],
        desc: 'Quatre-vingt-dix mille véhicules par jour passaient ici. Le dernier jour, ils y sont restés : un océan de tôle figée sur des kilomètres, l\'exode de tout un pays à l\'arrêt. Dans les habitacles, ça bouge encore, ceinturé, patient. Le plus grand gisement de carburant et de bagages du pays salonais — et le plus peuplé.',
        fouille: { max: 4, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.4 }, { id: 'bouteille_eau', q: [1, 2], p: 0.4 },
          { id: 'barre_cereales', q: [1, 3], p: 0.5 }, { id: 'manteau_hiver', q: [1, 1], p: 0.3 },
          { id: 'sac_a_dos', q: [1, 1], p: 0.35 }, { id: 'piles', q: [1, 2], p: 0.4 },
        ] },
      },
      '6,6': {
        t: 'autoroute', nom: 'Péage de Lançon (A7)', lbl: 'Péage', danger: 0.45, special: 'siphon',
        zombies: ['errant', 'coureur', 'gonfle'],
        desc: 'L\'une des plus grandes barrières de péage de France, vingt-six voies de portiques morts. L\'aire de Lançon, juste derrière : boutique, station, restaurant — un condensé de civilisation sous vide, gardé par ses anciens clients.',
        fouille: { max: 4, table: [
          { id: 'soda', q: [1, 3], p: 0.5 }, { id: 'chips', q: [1, 2], p: 0.5 },
          { id: 'biscuits', q: [1, 2], p: 0.5 }, { id: 'bidon_vide', q: [1, 1], p: 0.35 },
          { id: 'carte_quartier', q: [1, 1], p: 0.2 }, { id: 'chocolat', q: [1, 2], p: 0.4 },
        ] },
      },
      '6,7': {
        t: 'village', nom: 'Lançon-Provence', lbl: 'Lançon', danger: 0.3,
        desc: 'Le village au pied de son château médiéval ruiné. Quelqu\'un a refortifié la butte avec des palettes et des grillages de chantier — un nid d\'aigle de fortune au-dessus des toits. Vide, désormais. Ou silencieux, ce qui n\'est pas pareil.',
        fouille: { max: 3, table: [
          { id: 'conserve_haricots', q: [1, 1], p: 0.4 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'planche', q: [1, 2], p: 0.4 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      // ── Barrières naturelles (décor infranchissable) ──
      '7,0': { t: 'eau', nom: 'La Durance', desc: 'Large, grise, indifférente. La frontière nord du monde connu.' },
      '9,0': { t: 'eau', nom: 'La Durance', desc: 'Le fleuve roule ses eaux froides vers le Rhône.' },
      '1,8': { t: 'eau', nom: 'Étang de Berre', desc: 'La grande lagune salée, 155 km². Au sud, les torchères mortes de Berre piquent l\'horizon.' },
      '2,8': { t: 'eau', nom: 'Étang de Berre', desc: 'L\'eau saumâtre clapote contre les pontons. Imbuvable. Navigable.' },
      '3,8': { t: 'eau', nom: 'Étang de Berre', desc: 'Des voiliers dérivent au mouillage, drisses sonnant contre les mâts. Personne à bord. Nulle part.' },
    },
  },
};
