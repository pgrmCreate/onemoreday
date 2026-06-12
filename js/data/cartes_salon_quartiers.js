// ============ Salon-de-Provence — l'anneau des cours et le quartier de la gare ============
// Lieux RÉELS : cours Gimon, Carnot, Victor Hugo, Camille Pelletan, bd Nostradamus,
// collégiale Saint-Laurent (tombeau de Nostradamus), place Gambetta, place Morgan,
// place du Général-de-Gaulle, parc de la Légion d'Honneur, gare SNCF de Salon
// (ligne Avignon–Miramas). Voir le schéma documenté dans cartes_salon_centre.js.

export const CARTES_SALON_QUARTIERS = {

  // ════════ L'ANNEAU DES COURS — là où était le grand marché ════════
  q_cours: {
    nom: 'Les cours', sousTitre: 'l\'anneau des boulevards — jour de marché, pour toujours',
    echelle: 'quartier', tempsParCase: 3, largeur: 10, hauteur: 8,
    exterieur: true, ambiance: 'rue', illu: 'avenue',
    zombiesPool: ['errant', 'errant', 'coureur', 'hurleur', 'gonfle', 'chien_infecte', 'traqueur'],
    cases: {
      // --- bord nord : cours Carnot, square, collégiale ---
      '4,0': {
        t: 'rue', nom: 'Boulevard des Capucins', lbl: 'Ville N.',
        desc: 'Le boulevard remonte vers les quartiers nord et le reste de la ville : l\'hôpital, les Canourgues, les zones commerciales. Le monde d\'après les platanes.',
        danger: 0.3, vers: { carte: 'ville_salon', x: 6, y: 3, temps: 6 }, versNom: 'Gagner le nord de la ville',
      },
      '5,0': {
        t: 'parc', nom: 'Square Jean XXIII', danger: 0.2,
        desc: 'Un carré d\'herbe folle entre la collégiale et le boulevard. Les bancs sont vides, le toboggan aussi. Tu ne t\'attardes pas sur le bac à sable.',
        fouille: { max: 2, table: [
          { id: 'manche_balai', q: [1, 1], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
          { id: 'appat', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,0': {
        t: 'batiment', nom: 'Collégiale Saint-Laurent', lbl: 'Collégiale', danger: 0.25,
        desc: 'Le vaisseau gothique où repose Nostradamus depuis 1791. La nef est haute et glacée, le tombeau intact dans sa chapelle. Quelqu\'un a écrit à la craie sur la dalle : « TU AURAIS PU PRÉVENIR. »',
        fouille: { max: 3, table: [
          { id: 'allumettes', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 3], p: 0.6 },
          { id: 'bandage', q: [1, 1], p: 0.35 }, { id: 'alcool_fort', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,1': {
        t: 'rue', nom: 'Angle Carnot / Victor Hugo', lbl: '', danger: 0.35,
        desc: 'Le carrefour des deux cours. Une barricade de palettes et de caddies, éventrée de l\'intérieur. Les sacs de courses sont encore accrochés aux poignées.',
        fouille: { max: 2, table: [
          { id: 'sac_plastique', q: [1, 3], p: 0.7 }, { id: 'conserve_haricots', q: [1, 1], p: 0.3 },
          { id: 'planche', q: [1, 2], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,1': {
        t: 'rue', nom: 'Cours Carnot', danger: 0.4,
        desc: 'Les platanes centenaires, les façades à balcons, et le Tabac du Fontenoy au rideau à demi arraché. Sous les arbres, ils errent entre les étals comme des clients très patients.',
        fouille: { max: 3, table: [
          { id: 'briquet', q: [1, 2], p: 0.6 }, { id: 'journal_papier', q: [1, 3], p: 0.7 },
          { id: 'chocolat', q: [1, 1], p: 0.3 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,1': {
        t: 'rue', nom: 'Le grand marché figé', lbl: 'Marché', danger: 0.5,
        desc: 'C\'est arrivé un mercredi matin, en plein marché. Les étals sont restés : fruits noircis en tas bourdonnants, camionnettes de forains portes ouvertes, une balance qui grince au vent. Ils sont DENSES ici — l\'endroit était noir de monde.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.5 }, { id: 'conserve_raviolis', q: [1, 1], p: 0.4 },
          { id: 'bache_plastique', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 3], p: 0.7 },
          { id: 'cartouche_gaz', q: [1, 1], p: 0.4 }, { id: 'couteau_cuisine', q: [1, 1], p: 0.35 },
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'corde', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'rue', nom: 'Cours Carnot (est)', lbl: '', danger: 0.4,
        desc: 'Banques aux distributeurs éventrés, chocolatier aux vitrines soufflées. L\'argent tapisse le trottoir, détrempé, et personne ne se baisse plus.',
        fouille: { max: 2, table: [
          { id: 'chocolat', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 2], p: 0.6 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,1': {
        t: 'rue', nom: 'Haut du cours Gimon', danger: 0.4,
        desc: 'L\'artère commerçante principale. Le Columbus Café a encore ses ardoises du jour. Un vélo cadenassé attend un propriétaire qui marche désormais très différemment.',
        fouille: { max: 3, table: [
          { id: 'soda', q: [1, 2], p: 0.4 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'canette_vide', q: [1, 3], p: 0.6 }, { id: 'piles', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,1': {
        t: 'rue', nom: 'Cours Gimon', danger: 0.4,
        desc: 'Boutiques de fringues, bijouterie, boulangeries. Les vitrines intactes te renvoient ton reflet entre les mannequins — et tu sursautes à chaque fois, parce que certains mannequins bougent.',
        fouille: { max: 3, table: [
          { id: 'pull_laine', q: [1, 1], p: 0.4 }, { id: 'jean', q: [1, 1], p: 0.4 },
          { id: 'gants_laine', q: [1, 1], p: 0.35 }, { id: 'chiffon', q: [1, 3], p: 0.6 },
          { id: 'casquette', q: [1, 1], p: 0.3 }, { id: 'cabas_courses', q: [1, 1], p: 0.4 },
        ] },
      },
      '7,1': {
        t: 'rue', nom: 'Bas du cours Gimon', lbl: '', danger: 0.35,
        desc: 'Le cours s\'achève sur le boulevard Nostradamus. Une ambulance du SMUR est montée sur le trottoir, portes arrière béantes, brancard vide. Le matériel a saigné jusque sur la chaussée.',
        fouille: { max: 3, table: [
          { id: 'bandage', q: [1, 2], p: 0.5 }, { id: 'desinfectant', q: [1, 1], p: 0.4 },
          { id: 'antidouleur', q: [1, 1], p: 0.35 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
        ] },
      },
      '8,1': {
        t: 'rue', nom: 'Angle Gimon / Bourg Neuf', lbl: '', danger: 0.3,
        desc: 'Le coin de rue regarde à la fois les cours et la vieille porte crénelée. Bon poste d\'observation — pour toi comme pour eux.',
      },
      // --- POI nord : Decathlon, pharmacie, médiathèque ---
      '5,2': {
        t: 'batiment', nom: 'Decathlon City', lbl: 'Decathlon', danger: 0.3,
        desc: 'Le magasin de sport flambant neuf des cours — ouvert un mois avant la fin du monde. Le rideau d\'entrée est à moitié relevé, comme une invitation.',
        vers: { carte: 'int_decathlon', x: 2, y: 3, temps: 2 }, versNom: 'Se glisser sous le rideau',
      },
      '7,2': {
        t: 'batiment', nom: 'Pharmacie du Cours', lbl: 'Pharmacie', danger: 0.3,
        desc: 'La croix verte pend, morte, au 42 du cours Victor Hugo. À travers la vitrine : présentoirs renversés, sol blanc de comprimés écrasés, et une grille au fond.',
        vers: { carte: 'int_pharmacie', x: 1, y: 3, temps: 2 }, versNom: 'Entrer dans l\'officine',
      },
      '8,2': {
        t: 'rue', nom: 'Boulevard Nostradamus', danger: 0.3,
        desc: 'L\'anneau est continue ici son tour de la vieille ville. Des voitures en double file pour l\'éternité.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'piles', q: [1, 1], p: 0.3 },
          { id: 'barre_cereales', q: [1, 1], p: 0.25 }, { id: 'cable_electrique', q: [1, 1], p: 0.3 },
        ] },
      },
      '9,2': {
        t: 'batiment', nom: 'Médiathèque', lbl: 'Médiathèque', danger: 0.2,
        desc: 'Le grand vaisseau vitré du boulevard Aristide Briand. Des rayonnages entiers visibles à travers les baies — et pas un mouvement à l\'intérieur. Le savoir n\'intéresse plus grand monde.',
        vers: { carte: 'int_mediatheque', x: 2, y: 5, temps: 2 }, versNom: 'Entrer dans la médiathèque',
      },
      '8,3': {
        t: 'place', nom: 'Place Gambetta', danger: 0.3,
        desc: 'L\'ancien cinéma Les Arcades, fermé bien avant l\'épidémie, regarde la place de ses affiches délavées. Une pharmacie au 31, déjà visitée — mais pas vidée.',
        fouille: { max: 3, table: [
          { id: 'vitamines', q: [1, 1], p: 0.4 }, { id: 'bandage_fortune', q: [1, 2], p: 0.4 },
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'eclat_verre', q: [1, 1], p: 0.4 },
        ] },
      },
      '8,4': {
        t: 'rue', nom: 'Boulevard Nostradamus (sud)', lbl: '', danger: 0.3,
        desc: 'Les platanes ont commencé à manger les façades. Trois semaines sans tailler, et la nature reprend déjà ses marques.',
        fouille: { max: 2, table: [
          { id: 'brique', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'bouteille_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '8,5': {
        t: 'rue', nom: 'Rue du Bourg Neuf (extérieur)', lbl: '', danger: 0.3,
        desc: 'La rue longe les anciens remparts vers la porte médiévale. Sur les murs, des affichettes : « ZONE DE REGROUPEMENT : STADE ROUSTAN », barrées ensuite au feutre rouge.',
      },
      '9,5': {
        t: 'porte', nom: 'Porte du Bourg Neuf (côté ville)', lbl: 'Pte Bourg-Neuf', danger: 0.25,
        desc: 'La porte crénelée du XIIe, vue de l\'extérieur. La Vierge noire te regarde passer sous le porche. De l\'autre côté : les ruelles du centre ancien.',
        vers: { carte: 'q_centre', x: 7, y: 3, temps: 3 }, versNom: 'Passer la porte vers le centre ancien',
      },
      '8,6': {
        t: 'place', nom: 'Place Crousillat (côté cours)', lbl: 'Crousillat', danger: 0.3,
        desc: 'Le bout sud-est de l\'anneau débouche sur la place de la Fontaine Moussue, au pied de la Tour de l\'Horloge. Ton hôtel est à deux pas, de l\'autre côté.',
        vers: { carte: 'q_centre', x: 2, y: 0, temps: 4 }, versNom: 'Rejoindre la place Crousillat',
      },
      // --- bord sud : Pelletan, République, De Gaulle, Morgan ---
      '7,6': {
        t: 'rue', nom: 'Cours Camille Pelletan', danger: 0.35,
        desc: 'Le marché du mercredi débordait jusqu\'ici. Une camionnette de poissonnier, portes ouvertes : tu sens l\'odeur trois cases avant. Eux ne la remarquent même plus.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'fil_de_fer', q: [1, 1], p: 0.4 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'bidon_vide', q: [1, 1], p: 0.3 },
        ] },
      },
      '6,6': {
        t: 'rue', nom: 'Boulevard de la République', danger: 0.35,
        desc: 'Les beaux immeubles 1900 de la République, balcons ouvragés et volets clos. Derrière l\'un d\'eux, quelqu\'un joue du piano — deux notes, toujours les mêmes, depuis des heures.',
        fouille: { max: 2, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'bouteille_vide', q: [1, 2], p: 0.5 },
          { id: 'telephone_mort', q: [1, 1], p: 0.35 },
        ] },
      },
      '5,6': {
        t: 'rue', nom: 'République (ouest)', lbl: '', danger: 0.3,
        desc: 'Le boulevard descend doucement vers la place du Général-de-Gaulle. Un bus scolaire vide, en travers, portes ouvertes. Tu choisis de ne pas regarder les petites fenêtres.',
      },
      '4,6': {
        t: 'place', nom: 'Place du Général-de-Gaulle', lbl: 'De Gaulle', danger: 0.4,
        desc: 'La grande place du marché du dimanche. Un hélicoptère léger s\'est posé là, en catastrophe — il manque la queue, et le pilote, et une explication.',
        fouille: { max: 3, table: [
          { id: 'cable_electrique', q: [1, 2], p: 0.5 }, { id: 'ressort', q: [1, 2], p: 0.5 },
          { id: 'visserie', q: [1, 2], p: 0.5 }, { id: 'trousse_outils', q: [1, 1], p: 0.25 },
          { id: 'briquet', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,6': {
        t: 'parc', nom: 'Parc de la Légion d\'Honneur', lbl: 'Parc', danger: 0.25,
        desc: 'Le poumon vert du centre. La roseraie a explosé en broussaille, l\'herbe monte aux genoux — et l\'herbe haute, maintenant, c\'est là qu\'ils attendent, couchés.',
        fouille: { max: 3, table: [
          { id: 'manche_balai', q: [1, 1], p: 0.4 }, { id: 'appat', q: [1, 3], p: 0.6 },
          { id: 'brique', q: [1, 1], p: 0.4 }, { id: 'vitamines', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,6': {
        t: 'place', nom: 'Place Morgan', lbl: 'Morgan', danger: 0.35,
        desc: 'La place réaménagée, ses kiosques de bouche, sa halle alimentaire. Les frigos des kiosques ont coulé sur le pavé neuf. Le Cinéplanet allume encore — quelque part, un groupe électrogène n\'a pas dit son dernier mot.',
        fouille: { max: 3, table: [
          { id: 'conserve_raviolis', q: [1, 1], p: 0.4 }, { id: 'soda', q: [1, 2], p: 0.4 },
          { id: 'biscuits', q: [1, 1], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
          { id: 'cartouche_gaz', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,7': {
        t: 'batiment', nom: 'Cinéplanet', lbl: 'Cinéma', danger: 0.3,
        desc: 'Neuf salles, onze cent fauteuils, ouvert un an avant la fin. Le hall sent le pop-corn rance. Sur le panneau LED, encore alimenté : « SÉANCE EN COURS ».',
        vers: { carte: 'int_cineplanet', x: 3, y: 5, temps: 2 }, versNom: 'Entrer dans le multiplexe',
      },
      '1,6': {
        t: 'rue', nom: 'Angle Victor Hugo / Morgan', lbl: '', danger: 0.3,
        desc: 'Le carrefour penche vers l\'ouest et la gare. Un panneau SNCF indique encore la direction, criblé de chevrotine.',
      },
      // --- bord ouest : cours Victor Hugo, sortie gare ---
      '1,5': {
        t: 'rue', nom: 'Cours Victor Hugo (sud)', lbl: '', danger: 0.35,
        desc: 'Opticiens, banques, agences immobilières : la rue des vitrines propres. Toutes étoilées maintenant, sauf une, parfaitement intacte, ce qui est pire.',
        fouille: { max: 2, table: [
          { id: 'eclat_verre', q: [1, 2], p: 0.6 }, { id: 'telephone_mort', q: [1, 1], p: 0.4 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,4': {
        t: 'rue', nom: 'Cours Victor Hugo', danger: 0.4,
        desc: 'Le cœur de l\'anneau ouest. Les terrasses des brasseries, tables dressées pour un service qui n\'a jamais eu lieu. L\'ardoise du jour propose la daube. C\'était un mercredi.',
        fouille: { max: 3, table: [
          { id: 'alcool_fort', q: [1, 1], p: 0.35 }, { id: 'canette_vide', q: [1, 3], p: 0.6 },
          { id: 'briquet', q: [1, 1], p: 0.4 }, { id: 'couteau_cuisine', q: [1, 1], p: 0.3 },
          { id: 'chips', q: [1, 1], p: 0.3 },
        ] },
      },
      '0,4': {
        t: 'rue', nom: 'Vers la gare', lbl: 'Gare',
        desc: 'Le boulevard de la gare descend à l\'ouest, tout droit, vers les voies. La radio l\'a dit : suivez la voie ferrée vers le sud.',
        danger: 0.3, vers: { carte: 'q_gare', x: 5, y: 3, temps: 5 }, versNom: 'Descendre vers la gare',
      },
      '1,3': {
        t: 'rue', nom: 'Cours Victor Hugo (nord)', lbl: '', danger: 0.35,
        desc: 'Une pharmacie au 167, vidée jusqu\'aux présentoirs. Sur la porte, à la craie : « PLUS RIEN. ALLEZ À L\'HÔPITAL. » Quelqu\'un a ajouté en dessous, d\'une autre main : « N\'Y ALLEZ PAS. »',
        fouille: { max: 2, table: [
          { id: 'bandage_fortune', q: [1, 1], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,2': {
        t: 'rue', nom: 'Haut Victor Hugo', lbl: '', danger: 0.3,
        desc: 'L\'anneau remonte vers le carrefour Carnot. Des caddies abandonnés en file indienne, comme un troupeau qui aurait perdu son berger.',
      },
    },
  },

  // ════════ LE QUARTIER MORGAN-GARE ════════
  q_gare: {
    nom: 'Quartier de la gare', sousTitre: 'le bout de la ville, le début de la voie',
    echelle: 'quartier', tempsParCase: 3, largeur: 6, hauteur: 6,
    exterieur: true, ambiance: 'rue', illu: 'avenue',
    zombiesPool: ['errant', 'coureur', 'rampant', 'hurleur', 'brule'],
    cases: {
      '3,0': {
        t: 'rue', nom: 'Avenue Émile Zola', lbl: 'Ville',
        desc: 'L\'avenue remonte vers le gros de la ville : la Gandonne, l\'hôpital, les quartiers nord.',
        danger: 0.3, vers: { carte: 'ville_salon', x: 4, y: 4, temps: 6 }, versNom: 'Remonter vers la ville',
      },
      '3,1': {
        t: 'rail', nom: 'Voie ferrée (nord)', lbl: 'Voie N.', danger: 0.1,
        desc: 'Le ballast file vers le nord — Lamanon, Cavaillon, Avignon. Marcher sur les voies : le seul endroit de la ville où l\'on voit venir à cent mètres.',
        fouille: { max: 2, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'brique', q: [1, 2], p: 0.5 },
          { id: 'cable_electrique', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,2': {
        t: 'rue', nom: 'Avenue de la gare', lbl: '', danger: 0.3,
        desc: 'Des maisons de ville aux volets tirés, un café de gare au rideau baissé. Quelqu\'un a cloué des planches sur une porte — de l\'extérieur. Tu n\'y penses pas trop fort.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'bouteille_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,3': {
        t: 'rue', nom: 'Boulevard de la gare', danger: 0.35,
        desc: 'La dernière ligne droite avant les voies. Les voitures de ceux qui ont cru au dernier train s\'entassent jusque sur les trottoirs.',
        fouille: { max: 3, table: [
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'soda', q: [1, 1], p: 0.35 },
          { id: 'piles', q: [1, 1], p: 0.3 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,3': {
        t: 'rue', nom: 'Vers les cours', lbl: 'Cours',
        desc: 'Le boulevard remonte à l\'est vers l\'anneau des cours et la vieille ville.',
        danger: 0.3, vers: { carte: 'q_cours', x: 0, y: 4, temps: 5 }, versNom: 'Remonter vers les cours',
      },
      '3,3': {
        t: 'place', nom: 'Pôle d\'échanges — gare routière', lbl: 'Bus', danger: 0.4, special: 'siphon',
        desc: 'Les quais de bus rénovés en 2015, et quatre cars couchés ou imbriqués, réservoirs pleins pour des lignes qui ne rouleront plus. L\'évacuation est partie d\'ici. Elle n\'est pas allée loin.',
        fouille: { max: 4, table: [
          { id: 'sac_a_dos', q: [1, 1], p: 0.4 }, { id: 'bouteille_eau', q: [1, 1], p: 0.4 },
          { id: 'biscuits', q: [1, 1], p: 0.4 }, { id: 'pull_laine', q: [1, 1], p: 0.35 },
          { id: 'tuyau_plastique', q: [1, 1], p: 0.4 }, { id: 'bidon_vide', q: [1, 1], p: 0.35 },
          { id: 'portefeuille', q: [1, 2], p: 0.5 }, { id: 'radio_portable', q: [1, 1], p: 0.25 },
          { id: 'cabas_courses', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,2': {
        t: 'rue', nom: 'Passerelle au-dessus des voies', lbl: 'Passerelle', danger: 0.2,
        desc: 'La passerelle métallique enjambe les voies. De là-haut : les quais, le TER mort, et au sud, la voie qui file droit dans la plaine, vers Miramas. Vers le Refuge, si la radio dit vrai.',
      },
      '2,2': {
        t: 'batiment', nom: 'Gare de Salon-de-Provence', lbl: 'GARE', danger: 0.3,
        desc: 'Le bâtiment voyageurs, rénové, placardé d\'affiches d\'évacuation : « DIRECTION MIRAMAS — DERNIER CONVOI 21H40 ». Les grilles des quais sont fermées par une chaîne cadenassée. Quelqu\'un a voulu protéger quelque chose, ici.',
        verrou: {
          desc: 'Les grilles d\'accès aux quais sont fermées par une lourde chaîne cadenassée, doublée de barricades de chariots à bagages.',
          flag: 'gare_ouverte',
          options: [
            { methode: 'outil', outil: 'pince_coupante', label: 'Couper la chaîne à la pince', tempsMin: 5 },
            { methode: 'skill', skill: 'force', niveau: 3, label: 'Arracher la chaîne', tempsMin: 15 },
            { methode: 'skillItem', skill: 'agilite', niveau: 2, item: 'corde', label: 'Escalader la grille avec la corde', tempsMin: 10, risque: { p: 0.35, blessure: 'entaille', zones: ['au mollet'], texte: 'Les pointes de la grille te déchirent le mollet à la descente.' } },
          ],
        },
        vers: { carte: 'int_gare', x: 2, y: 5, temps: 2 }, versNom: 'Entrer dans la gare',
      },
      '3,4': {
        t: 'rail', nom: 'Voie ferrée (sud)', lbl: 'Voie S.', danger: 0.15,
        desc: 'La ligne Avignon–Miramas plonge au sud à travers la plaine. Quinze kilomètres de ballast jusqu\'au triage de Miramas. À pied, c\'est une journée de cible mouvante. En machine, une heure.',
        fouille: { max: 2, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'brique', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,4': {
        t: 'rail', nom: 'Wagon de fret isolé', lbl: 'Wagon', danger: 0.3,
        desc: 'Un wagon couvert, seul sur une voie de garage, la porte coulissante entrebâillée de vingt centimètres. Il en sort une odeur de paille moisie — et un bruit de respiration. Peut-être la tienne.',
        fouille: { max: 3, table: [
          { id: 'corde', q: [1, 1], p: 0.5 }, { id: 'bache_plastique', q: [1, 1], p: 0.5 },
          { id: 'planche', q: [1, 3], p: 0.6 }, { id: 'conserve_haricots', q: [1, 2], p: 0.35 },
          { id: 'manteau_hiver', q: [1, 1], p: 0.3 },
        ] },
      },
    },
  },

  // ════════ INTÉRIEUR DE LA GARE — le nerf du chapitre ════════
  // Du sud au nord, comme on traverse une vraie gare : le bâtiment voyageurs
  // (salle d'attente, hall, guichets, kiosque à journaux), le quai 1 le long des
  // façades, le TER mort sur sa voie, puis le passage souterrain — seul moyen de
  // franchir les voies — qui remonte sur le quai 2, le quai de service avec le
  // cheminot, le local de l'Infra, et tout au nord le locotracteur.
  int_gare: {
    nom: 'Gare de Salon — les quais', sousTitre: 'ligne Avignon–Miramas, PK 56',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 6,
    exterieur: false, ambiance: 'sombre', illu: 'gare',
    zombiesPool: ['errant', 'coureur', 'rampant'],
    passages: [
      ['1,4', '2,4', 'ouvert'], // la salle d'attente ouvre en grand sur le hall — même plateau
      ['2,4', '3,4'], // porte de service derrière les hygiaphones, du hall vers les guichets
      ['1,1', '2,1'], // la porte du local de l'Infra donne sur le quai de service
      ['2,0', '2,1'], // le locotracteur est garé le long du quai de service, marchepied accessible
    ],
    murs: [
      ['3,3', '3,4'], // le local SNCF ne donne pas sur le quai — on y entre par le hall
    ],
    cases: {
      // ----- la voie de service, tout au nord -----
      '2,0': {
        t: 'piece', nom: 'Le locotracteur Y 8000', lbl: 'LOCO', danger: 0.1, special: 'locomotive', mob: 'machines',
        desc: 'Le vieux locotracteur de manœuvre, orange délavé, fidèle au poste sur sa voie de service. Petit, moche, increvable — et diesel : pas besoin de caténaire morte. Ta sortie de Salon, si tu la réveilles.',
      },
      // ----- quai 2 et quai de service -----
      '1,1': {
        t: 'piece', nom: 'Local de l\'Infra', lbl: 'Infra', danger: 0.2, sombre: 2, mob: 'etabli',
        desc: 'Un blockhaus de parpaings sans la moindre fenêtre, au ras du ballast. Ça sent le gasoil et la graisse froide. Les outils de la voie pendent à leurs silhouettes peintes — il en manque.',
        fouille: { max: 3, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.6 }, { id: 'visserie', q: [1, 2], p: 0.5 },
          { id: 'cable_electrique', q: [1, 1], p: 0.4 }, { id: 'gants_cuir', q: [1, 1], p: 0.3 },
          { id: 'bidon_vide', q: [1, 1], p: 0.35 }, { id: 'clous', q: [1, 2], p: 0.4 },
        ] },
      },
      '2,1': {
        t: 'piece', nom: 'Quai de service', lbl: 'Quai serv.', danger: 0.25, special: 'conducteur',
        desc: 'La voie de service, à l\'écart. Contre un pilier, un corps en gilet orange SNCF, assis, comme endormi — un cheminot de l\'Infra. Il ne dort pas. La question, c\'est : à quel point.',
      },
      '3,1': {
        t: 'couloir', nom: 'Quai 2', lbl: 'Quai 2', danger: 0.25,
        desc: 'Le quai d\'en face, balayé de feuilles de platane. D\'ici, la façade de la gare te regarde par toutes ses fenêtres — et tu n\'arrives pas à jurer qu\'elles sont vides.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
          { id: 'eclat_verre', q: [1, 1], p: 0.4 }, { id: 'bouteille_vide', q: [1, 1], p: 0.35 },
        ] },
      },
      '4,1': {
        t: 'couloir', nom: 'Quai 2 — côté escalier', lbl: '', danger: 0.2,
        desc: 'Le bout du quai 2 s\'effiloche en herbes folles entre les traverses. Un panneau « ACCÈS INTERDIT — DANGER » pend de travers. Plus personne ne fait la police.',
      },
      '5,1': {
        t: 'escalier', nom: 'Escalier du quai 2', lbl: 'Escalier', danger: 0.2,
        desc: 'Les marches remontent du souterrain vers le ciel blanc. Tu comptes les dernières à tâtons — la lumière du jour fait mal, après le noir d\'en bas.',
      },
      // ----- les voies : la rame morte, et le souterrain qui passe dessous -----
      '2,2': {
        t: 'piece', nom: 'Le TER mort', lbl: 'TER', danger: 0.45,
        desc: 'Une rame TER bleue et grise, arrêtée en pleine charge, portes bloquées mi-course. À l\'intérieur, des silhouettes tassées contre les vitres. Des traces de griffes — côté intérieur. Le dernier convoi n\'est jamais parti.',
        fouille: { max: 4, table: [
          { id: 'sac_a_dos', q: [1, 1], p: 0.5 }, { id: 'pull_laine', q: [1, 1], p: 0.4 },
          { id: 'bouteille_eau', q: [1, 1], p: 0.4 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'rangers', q: [1, 1], p: 0.3 }, { id: 'bandage', q: [1, 1], p: 0.35 },
          { id: 'telephone_mort', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,2': {
        t: 'couloir', nom: 'Passage souterrain', lbl: '', danger: 0.35, sombre: 2,
        desc: 'Le souterrain qui passe sous les voies. Noir absolu, sol gras, et cette acoustique de cathédrale qui transforme chaque goutte d\'eau en bruit de pas.',
      },
      // ----- quai 1, le long du bâtiment voyageurs -----
      '1,3': {
        t: 'couloir', nom: 'Quai 1 — ouest', lbl: '', danger: 0.25,
        desc: 'Le bout ouest du quai, là où la marquise s\'arrête. Des bagages abandonnés tous les dix mètres, comme un jeu de piste que personne n\'a fini.',
      },
      '2,3': {
        t: 'couloir', nom: 'Quai 1 — face à la rame', lbl: '', danger: 0.3,
        desc: 'Les portes du TER bâillent à hauteur de quai, bloquées à mi-course. À l\'intérieur, quelque chose se déplace lentement entre les sièges, avec une patience d\'aquarium.',
      },
      '3,3': {
        t: 'couloir', nom: 'Quai 1', lbl: 'Quai 1', danger: 0.3,
        desc: 'Le quai principal sous sa marquise crevée. Distributeurs de friandises éventrés, bancs renversés. Le panneau « SALON-DE-PROVENCE » se balance sur un seul boulon.',
        fouille: { max: 3, table: [
          { id: 'soda', q: [1, 2], p: 0.5 }, { id: 'chips', q: [1, 1], p: 0.4 },
          { id: 'barre_cereales', q: [1, 2], p: 0.5 }, { id: 'canette_vide', q: [1, 3], p: 0.7 },
          { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '4,3': {
        t: 'couloir', nom: 'Quai 1 — est', lbl: '', danger: 0.25,
        desc: 'La fin du quai côté sud, là où le ballast plonge vers Miramas. Le kiosque du Relais tient encore debout, rideau à demi baissé sur ses présentoirs.',
      },
      '5,3': {
        t: 'escalier', nom: 'Escalier du souterrain', lbl: 'Escalier', danger: 0.25,
        desc: 'L\'escalier s\'enfonce sous les voies. L\'air qui monte est froid, immobile, avec une odeur de pierre mouillée. En bas, le noir commence à la troisième marche.',
      },
      // ----- le bâtiment voyageurs, côté ville -----
      '1,4': {
        t: 'piece', nom: 'Salle d\'attente', lbl: 'Attente', danger: 0.25, mob: 'bancs',
        desc: 'Des rangées de sièges coqués boulonnés au sol, un radiateur froid, des affiches de destinations ensoleillées. Quelqu\'un a dormi là plusieurs nuits : un nid de couvertures, des canettes en cercle. Plus personne dedans.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'canette_vide', q: [1, 2], p: 0.6 },
          { id: 'barre_cereales', q: [1, 1], p: 0.25 }, { id: 'telephone_mort', q: [1, 1], p: 0.35 },
          { id: 'chiffon', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,4': {
        t: 'piece', nom: 'Hall des voyageurs', lbl: 'Hall', danger: 0.3,
        desc: 'Les écrans d\'affichage figés sur des départs morts. Un campement abandonné contre les consignes : duvets, poussette, valises ouvertes. Ceux qui attendaient le dernier convoi. Il est parti sans eux — ou il n\'est jamais venu.',
        fouille: { max: 4, table: [
          { id: 'bouteille_eau', q: [1, 2], p: 0.5 }, { id: 'biscuits', q: [1, 2], p: 0.5 },
          { id: 'chocolat', q: [1, 1], p: 0.4 }, { id: 'sacoche', q: [1, 1], p: 0.4 },
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 3], p: 0.6 },
          { id: 'portefeuille', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,4': {
        t: 'piece', nom: 'Guichets et local SNCF', lbl: 'Guichets', danger: 0.25, mob: 'comptoir',
        desc: 'Derrière les guichets, le local de service : plannings punaisés, gilets orange aux patères, un téléphone décroché qui pend au bout de son fil. Le tableau des circulations s\'arrête au 19, 21h40 : « DERNIER — MIRAMAS ».',
        fouille: { max: 3, table: [
          { id: 'lampe_torche', q: [1, 1], p: 0.5 }, { id: 'piles', q: [1, 2], p: 0.5 },
          { id: 'trousse_outils', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'briquet', q: [1, 1], p: 0.4 }, { id: 'radio_portable', q: [1, 1], p: 0.35 },
        ] },
      },
      '4,4': {
        t: 'piece', nom: 'Relais presse', lbl: 'Presse', danger: 0.2, sombre: 1, mob: 'rayonnages',
        desc: 'Le kiosque à journaux du quai, figé sur les unes du 19 : « ÉPIDÉMIE : LE SUD TIENT ». Dans la pénombre du rideau à demi baissé, les magazines ont jauni d\'un mois en trois semaines.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 3], p: 0.8 }, { id: 'biscuits', q: [1, 1], p: 0.4 },
          { id: 'chocolat', q: [1, 1], p: 0.3 }, { id: 'soda', q: [1, 1], p: 0.35 },
          { id: 'briquet', q: [1, 1], p: 0.4 }, { id: 'piles', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- l'entrée, sur le parvis -----
      '2,5': {
        t: 'porte', nom: 'Hall des voyageurs — entrée', lbl: 'Sortie', danger: 0.2,
        desc: 'Les portes vitrées du bâtiment voyageurs. Dehors, le parvis et la ville. Dedans, l\'écho.',
        vers: { carte: 'q_gare', x: 2, y: 2, temps: 2 }, versNom: 'Ressortir sur le parvis',
      },
    },
  },
};
