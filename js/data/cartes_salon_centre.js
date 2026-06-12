// ============ Salon-de-Provence — le centre ancien et ses intérieurs ============
// Lieux RÉELS : place Crousillat, Fontaine Moussue, Grand Hôtel de la Poste,
// Porte de l'Horloge, rue de l'Horloge, place de l'Hôtel-de-Ville, place Saint-Michel,
// maison de Nostradamus, place des Centuries, château de l'Empéri, Porte du Bourg Neuf.
//
// SCHÉMA D'UNE CARTE :
// {
//   nom, sousTitre, echelle: 'interieur'|'quartier'|'ville'|'region',
//   tempsParCase: minutes par case parcourue,
//   largeur, hauteur, exterieur: true|false (froid + jamais sécurisable),
//   ambiance: 'calme'|'rue'|'sombre', illu: clé de scenes_art,
//   zombiesPool: [...], // rencontres par défaut
//   cases: { 'x,y': CASE } — une case ABSENTE est infranchissable (mur, bâti plein)
//   passages: [['x1,y1','x2,y2'], ...] — portes directes entre deux pièces voisines (intérieurs) ;
//     un 3e élément 'ouvert' (['a','b','ouvert']) = ouverture sans battant (même plateau)
//   murs: [['x1,y1','x2,y2'], ...] — bloque un passage qui serait automatique
//     (couloir/escalier/porte touchant une case d'un AUTRE niveau, par ex.)
//   ouvert: true — plateau entièrement ouvert : toutes les cases voisines communiquent (intérieurs)
// }
// SCHÉMA D'UNE CASE :
// { t: terrain ('rue','place','parc','rail','porte','batiment','piece','couloir',
//      'escalier','route','autoroute','village','ville','nature','site','eau','mur'),
//   nom, lbl (étiquette courte carte), desc, danger: 0..1,
//   fouille: { max: N, table: [{id, q:[min,max], p}] },
//   vers: { carte, x, y, temps? } — on peut y "Entrer",
//   versNom — nom affiché du lien, verrou: { desc, options: [...] },
//     (option de verrou risquée : risque: { p, blessure, texte, zones: ['à la main', ...] }),
//   sombre: 1 (pénombre : fouilles moins sûres sans lampe) | 2 (noir total : lampe nécessaire),
//   mob: clé de mobilier dessiné sur le plan ('lit','lits','comptoir','rayonnages','etageres',
//        'table','bureau','bancs','fauteuils','casiers','cuisine','etabli','voiture','barreaux',
//        'tiroirs','ratelier','palettes','plantes','machines','debris') — sinon déduit du nom,
//        mob: null pour une pièce volontairement nue,
//   special: 'fontaine'|'siphon'|'peche'|'chasse'|'cloches'|
//            'cellules'|'conducteur'|'batterie'|'locomotive',
//   zombies: [...] (surcharge le pool), refuge: true (sommeil sûr d'office) }

export const CARTES_SALON_CENTRE = {

  // ════════ LE GRAND HÔTEL DE LA POSTE — point de départ ════════
  // Deux niveaux sur le même plan : en haut l'étage des chambres (couloir + 201 à 204
  // + lingerie), en bas le rez-de-chaussée (réception, salon, petits-déjeuners, cuisine,
  // cave). L'escalier de service relie les deux, à gauche.
  int_hotel: {
    nom: 'Grand Hôtel de la Poste', sousTitre: 'place Crousillat — ton terrier depuis 23 jours',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 5,
    exterieur: false, ambiance: 'calme', illu: 'immeuble',
    zombiesPool: ['errant', 'rampant'],
    passages: [
      ['1,0', '1,1'], // porte de la chambre 201 sur le couloir
      ['2,0', '2,1'], // porte de la chambre 202 sur le couloir
      ['3,0', '3,1'], // porte de ta chambre, la 203
      ['4,0', '4,1'], // porte de la chambre 204
      ['5,0', '5,1'], // porte de la lingerie, au bout du couloir
      ['0,3', '1,3', 'ouvert'], // la réception ouvre sur le salon de lecture — même plateau
      ['1,3', '2,3', 'ouvert'], // le salon ouvre sur la salle des petits-déjeuners
      ['2,3', '3,3'], // porte de service entre la salle et la cuisine
      ['3,3', '4,3'], // porte de la cave, au fond de la cuisine
    ],
    cases: {
      // ----- 2e étage -----
      '1,0': {
        t: 'piece', nom: 'Chambre 201', lbl: '201', danger: 0.2,
        desc: 'Le lit est fait, la valise ouverte sur le porte-bagages. Le client de la 201 n\'a jamais réglé sa note — il n\'a jamais quitté la ville non plus.',
        fouille: { max: 3, table: [
          { id: 'chiffon', q: [1, 2], p: 0.8 }, { id: 'pull_laine', q: [1, 1], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.6 }, { id: 'telephone_mort', q: [1, 1], p: 0.5 },
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'sacoche', q: [1, 1], p: 0.35 },
          { id: 'lampe_frontale', q: [1, 1], p: 0.25 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'Chambre 202', lbl: '202', danger: 0.15,
        desc: 'Deux brosses à dents dans le verre, deux alliances sur la table de nuit. Ils sont partis ensemble, vers quelque chose qu\'ils croyaient mieux. Le lit n\'est défait que d\'un côté.',
        fouille: { max: 3, table: [
          { id: 'tshirt', q: [1, 2], p: 0.6 }, { id: 'jean', q: [1, 1], p: 0.4 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'vitamines', q: [1, 1], p: 0.3 },
          { id: 'savon', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,0': {
        t: 'piece', nom: 'Ta chambre — la 203', lbl: 'Ta ch.', refuge: true, danger: 0,
        desc: 'Un matelas tiré contre la porte, des bouteilles vides en rang d\'oignons, et la fenêtre sur la place Crousillat. Vingt-trois jours que tu regardes la Fontaine Moussue couler pour personne.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.9 }, { id: 'photo_famille', q: [1, 1], p: 1 },
          { id: 'journal_papier', q: [1, 1], p: 0.7 }, { id: 'bouteille_vide', q: [1, 1], p: 0.6 },
        ] },
      },
      '4,0': {
        t: 'piece', nom: 'Chambre 204', lbl: '204', danger: 0.3, sombre: 1,
        desc: 'Les volets sont restés fermés depuis le premier jour et la pièce baigne dans une pénombre épaisse. Ça sent le tissu moisi et autre chose, en dessous — quelque chose de sucré.',
        fouille: { max: 3, table: [
          { id: 'casquette', q: [1, 1], p: 0.4 }, { id: 'jean', q: [1, 1], p: 0.35 },
          { id: 'barre_cereales', q: [1, 2], p: 0.4 }, { id: 'briquet', q: [1, 1], p: 0.3 },
          { id: 'ceinture_cuir', q: [1, 1], p: 0.45 }, { id: 'sac_a_dos', q: [1, 1], p: 0.3 },
        ] },
      },
      '5,0': {
        t: 'piece', nom: 'Lingerie de l\'étage', lbl: 'Lingerie', danger: 0.15,
        desc: 'Des piles de draps blancs sous cellophane, au bout du couloir. L\'odeur de lessive est la dernière odeur propre de la ville.',
        fouille: { max: 3, table: [
          { id: 'chiffon', q: [2, 4], p: 0.9 }, { id: 'savon', q: [1, 1], p: 0.5 },
          { id: 'bandage_fortune', q: [1, 2], p: 0.4 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'cabas_courses', q: [1, 1], p: 0.4 },
        ] },
      },
      '0,1': {
        t: 'escalier', nom: 'Escalier de service (étage)', lbl: 'Escalier', danger: 0.1,
        desc: 'Des marches en bois ciré qui craquent dans un ordre que tu connais par cœur. Troisième, septième, neuvième : à enjamber.',
      },
      '1,1': {
        t: 'couloir', nom: 'Couloir du 2e — côté escalier', lbl: '', danger: 0.1,
        desc: 'La moquette étouffe tes pas. La porte de la 201 est close, son « Ne pas déranger » toujours pendu à la poignée.',
      },
      '2,1': {
        t: 'couloir', nom: 'Couloir du 2e — chariot de ménage', lbl: '', danger: 0.12,
        desc: 'Le chariot de la femme de chambre attend contre le mur, serviettes pliées, savonnettes en rang. Le ménage du 19 n\'a jamais été fini.',
        fouille: { max: 2, table: [
          { id: 'savon', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 2], p: 0.7 },
          { id: 'sac_plastique', q: [1, 1], p: 0.4 }, { id: 'piles', q: [1, 1], p: 0.25 },
        ] },
      },
      '3,1': {
        t: 'couloir', nom: 'Couloir du 2e — devant ta porte', lbl: '', danger: 0.1,
        desc: 'Ton bout de couloir. Tu connais chaque lame du parquet sous la moquette, chaque ombre, chaque bruit normal. C\'est le dernier endroit du monde que tu connaisses par cœur.',
      },
      '4,1': {
        t: 'couloir', nom: 'Couloir du 2e — le fond', lbl: '', danger: 0.15,
        desc: 'Au bout, la porte de la 204 bâille sur du noir. Tu passes devant en regardant ailleurs, comme on longe un chien qu\'on ne connaît pas.',
      },
      '5,1': {
        t: 'couloir', nom: 'Bout du couloir — la lingerie', lbl: '', danger: 0.1,
        desc: 'Un renfoncement de service : extincteur, plan d\'évacuation jauni, et la porte de la lingerie. Le plan indique « VOUS ÊTES ICI ». Plus pour longtemps.',
      },
      // ----- entre les deux : l'escalier descend -----
      '0,2': {
        t: 'escalier', nom: 'Escalier de service (rez-de-chaussée)', lbl: 'Escalier', danger: 0.1,
        desc: 'Le bas des marches débouche derrière la réception, sous l\'horloge arrêtée du hall. Tu marques toujours un temps ici, à écouter le silence avant d\'avancer.',
      },
      // ----- rez-de-chaussée -----
      '0,3': {
        t: 'piece', nom: 'Réception', lbl: 'Réception', danger: 0.2,
        desc: 'Le registre est ouvert à la page du 19 — le jour du grand marché. La sonnette de comptoir brille encore. Personne ne viendra plus demander sa clé.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.8 }, { id: 'briquet', q: [1, 1], p: 0.5 },
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'lampe_torche', q: [1, 1], p: 0.35 },
          { id: 'radio_portable', q: [1, 1], p: 0.3 }, { id: 'portefeuille', q: [1, 1], p: 0.6 },
        ] },
      },
      '1,3': {
        t: 'piece', nom: 'Salon de lecture', lbl: 'Salon', danger: 0.15, mob: 'table',
        desc: 'Des fauteuils club fatigués, une bibliothèque d\'hôtel — guides touristiques et romans abandonnés par les clients. Tu en as lu trois en vingt-trois jours. Les fins heureuses sonnent bizarre, maintenant.',
        fouille: { max: 2, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.7 }, { id: 'briquet', q: [1, 1], p: 0.4 },
          { id: 'alcool_fort', q: [1, 1], p: 0.3 }, { id: 'canette_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,3': {
        t: 'piece', nom: 'Salle des petits-déjeuners', lbl: 'Salle', danger: 0.15,
        desc: 'Les tables encore dressées pour un service qui n\'a jamais eu lieu, serviettes en éventail. Tu as déjà raflé les corbeilles et les confituriers — il reste l\'argenterie, et le silence.',
        fouille: { max: 2, table: [
          { id: 'biscuits', q: [1, 1], p: 0.25 }, { id: 'chocolat', q: [1, 1], p: 0.2 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,3': {
        t: 'piece', nom: 'Cuisine de l\'hôtel', lbl: 'Cuisine', danger: 0.15,
        desc: 'Les fourneaux froids, la chambre froide entrouverte — tu as appris à ne plus l\'ouvrir. C\'est ici que tes vingt-trois jours de réserve ont fondu.',
        fouille: { max: 4, table: [
          { id: 'couteau_cuisine', q: [1, 1], p: 0.9 }, { id: 'casserole', q: [1, 1], p: 0.8 },
          { id: 'ouvre_boite', q: [1, 1], p: 0.6 }, { id: 'allumettes', q: [1, 1], p: 0.5 },
          { id: 'conserve_haricots', q: [1, 1], p: 0.3 }, { id: 'canette_vide', q: [1, 2], p: 0.6 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'La cave', lbl: 'Cave', danger: 0.3, sombre: 2,
        desc: 'Un escalier raide, une ampoule morte, et tes propres traces dans la poussière — tu es déjà descendu ici dix fois. Les casiers à vin sont vides. Ce qui reste, c\'est ce que tu n\'as pas encore osé chercher à tâtons.',
        fouille: { max: 3, table: [
          { id: 'bouteille_vide', q: [1, 3], p: 0.7 }, { id: 'alcool_fort', q: [1, 1], p: 0.35 },
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'fil_de_fer', q: [1, 1], p: 0.4 },
          { id: 'eclat_verre', q: [1, 2], p: 0.4 },
        ] },
      },
      '0,4': {
        t: 'porte', nom: 'Porte tambour', lbl: 'Sortie', danger: 0.1,
        desc: 'La porte vitrée donne sur la place Crousillat. De l\'autre côté du verre : la fontaine, les terrasses mortes, et eux.',
        vers: { carte: 'q_centre', x: 5, y: 0, temps: 2 }, versNom: 'Sortir sur la place Crousillat',
      },
    },
  },

  // ════════ LE CENTRE ANCIEN — la citadelle à deux portes ════════
  q_centre: {
    nom: 'Le centre ancien', sousTitre: 'Salon-de-Provence — intra-muros',
    echelle: 'quartier', tempsParCase: 3, largeur: 9, hauteur: 8,
    exterieur: true, ambiance: 'rue', illu: 'ruelle',
    zombiesPool: ['errant', 'errant', 'rampant', 'coureur', 'putrefie', 'hurleur', 'traqueur'],
    cases: {
      // --- place Crousillat (hors les murs, au pied de la tour) ---
      '2,0': {
        t: 'rue', nom: 'Vers les cours', lbl: 'Cours',
        desc: 'La place Crousillat débouche sur l\'anneau des cours — les boulevards plantés de platanes qui ceinturent la vieille ville. Là où il y avait le grand marché. Là où il y a la horde.',
        danger: 0.25, vers: { carte: 'q_cours', x: 8, y: 6, temps: 4 }, versNom: 'Rejoindre les cours',
      },
      '3,0': {
        t: 'place', nom: 'Terrasses de la place Crousillat', lbl: 'Terrasses', danger: 0.3,
        desc: 'Le Café des Arts, la Bastide. Les tables sont encore dressées, les chaises renversées, les verres pleins d\'eau de pluie. Un parasol claque au vent comme une voile morte.',
        fouille: { max: 3, table: [
          { id: 'canette_vide', q: [1, 3], p: 0.7 }, { id: 'bouteille_vide', q: [1, 2], p: 0.6 },
          { id: 'briquet', q: [1, 1], p: 0.4 }, { id: 'chips', q: [1, 1], p: 0.3 },
          { id: 'alcool_fort', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
        ] },
      },
      '4,0': {
        t: 'place', nom: 'La Fontaine Moussue', lbl: 'Fontaine', danger: 0.3, special: 'fontaine',
        desc: 'Le champignon de mousse continue de couler, imperturbable, comme il coule depuis 1775. Le clapotis est le seul bruit vivant de la place — et il porte. Ils viennent parfois y tremper leurs mains, par réflexe, comme des souvenirs.',
        fouille: { max: 2, table: [
          { id: 'bouteille_vide', q: [1, 2], p: 0.5 }, { id: 'portefeuille', q: [1, 1], p: 0.3 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,0': {
        t: 'batiment', nom: 'Grand Hôtel de la Poste', lbl: 'Hôtel', danger: 0.15,
        desc: 'Ta forteresse de fortune. Trois étages de chambres vides au-dessus des terrasses, et ta chambre, la 203, avec son matelas contre la porte.',
        vers: { carte: 'int_hotel', x: 0, y: 4, temps: 2 }, versNom: 'Rentrer dans l\'hôtel',
      },
      // --- la Porte de l'Horloge : seul passage nord dans les murs ---
      '4,1': {
        t: 'porte', nom: 'Porte de l\'Horloge', lbl: 'Pte Horloge', danger: 0.2, special: 'cloches',
        desc: 'Trois étages de pierre au-dessus du porche voûté, le campanile en fer forgé, et l\'horloge — arrêtée. Comme en 1909, après le séisme. Sous la voûte, l\'écho de tes pas est assourdissant.',
        fouille: { max: 1, table: [
          { id: 'brique', q: [1, 2], p: 0.5 }, { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      // --- intra-muros ---
      '4,2': {
        t: 'rue', nom: 'Rue de l\'Horloge', danger: 0.3,
        desc: 'L\'artère commerçante du centre ancien, étroite comme un couloir. Vitrines étoilées, rideaux à demi baissés, et entre les boutiques, des choses qui traînent des pieds.',
        fouille: { max: 3, table: [
          { id: 'sac_plastique', q: [1, 2], p: 0.6 }, { id: 'eclat_verre', q: [1, 2], p: 0.6 },
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'soda', q: [1, 1], p: 0.25 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,2': {
        t: 'rue', nom: 'Rue des Frères Kennedy', lbl: '', danger: 0.25,
        desc: 'La deuxième artère du vieux Salon. Une lingerie, un opticien, un salon de coiffure dont le rideau bat. Quelqu\'un a écrit « ILS ENTENDENT » à la peinture rouge sur le volet de la boulangerie.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 3], p: 0.7 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'visserie', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,2': {
        t: 'batiment', nom: 'Petit Casino', lbl: 'Casino', danger: 0.25,
        desc: 'La supérette du centre ancien. La vitre de la porte est constellée d\'impacts — de l\'intérieur. L\'enseigne grince sur son axe.',
        vers: { carte: 'int_casino', x: 0, y: 3, temps: 2 }, versNom: 'Entrer dans la supérette',
      },
      '1,2': {
        t: 'rue', nom: 'Bout de la rue Kennedy', lbl: '', danger: 0.35,
        desc: 'La rue se resserre entre deux façades aveugles. Une poussette vide, couchée sur le flanc, que tu contournes sans la regarder.',
        fouille: { max: 2, table: [
          { id: 'brique', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'ressort', q: [1, 1], p: 0.3 }, { id: 'sac_plastique', q: [1, 1], p: 0.5 },
        ] },
      },
      '2,3': {
        t: 'rue', nom: 'Ruelle des Pénitents', danger: 0.4, sombre: 1,
        desc: 'Un boyau entre les murs où le jour n\'entre jamais vraiment. L\'odeur est insoutenable. Quelque chose remue dans les poubelles, au fond.',
        fouille: { max: 2, table: [
          { id: 'eclat_verre', q: [1, 2], p: 0.6 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'bouteille_vide', q: [1, 2], p: 0.5 }, { id: 'tuyau_acier', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,3': {
        t: 'rue', nom: 'Rue Moulin d\'Isnard', lbl: '', danger: 0.3,
        desc: 'Des balcons en fer forgé, du linge pétrifié sur les fils. Une fenêtre claque à l\'étage, régulière comme un métronome.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.6 }, { id: 'manche_balai', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 1], p: 0.5 }, { id: 'canette_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,3': {
        t: 'place', nom: 'Place de l\'Hôtel-de-Ville', lbl: 'Mairie', danger: 0.35,
        desc: 'La façade classique de la mairie, ses deux tourelles, la statue d\'Adam de Craponne — l\'homme qui a fait venir l\'eau. La boutique de la savonnerie Marius Fabre a été pillée à moitié : à moitié seulement.',
        fouille: { max: 4, table: [
          { id: 'savon', q: [1, 2], p: 0.7 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
          { id: 'carte_quartier', q: [1, 1], p: 0.35 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'portefeuille', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,3': {
        t: 'rue', nom: 'Rue du Bourg Neuf (ouest)', lbl: '', danger: 0.3,
        desc: 'La rue file vers la deuxième porte des remparts. Des voitures garées en épi, certaines avec encore quelqu\'un dedans. Tu ne t\'approches plus des vitres.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'piles', q: [1, 1], p: 0.25 }, { id: 'barre_cereales', q: [1, 1], p: 0.2 },
        ] },
      },
      '6,3': {
        t: 'rue', nom: 'Rue du Bourg Neuf (est)', lbl: '', danger: 0.3,
        desc: 'Les façades se resserrent vers la vieille porte crénelée. Au-dessus du porche, dans sa niche, la Vierge noire du XIIIe siècle regarde la rue. Quelqu\'un a déposé des bougies fondues et un ours en peluche à ses pieds.',
        fouille: { max: 2, table: [
          { id: 'allumettes', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '7,3': {
        t: 'porte', nom: 'Porte du Bourg Neuf', lbl: 'Pte Bourg-Neuf', danger: 0.25,
        desc: 'Mâchicoulis, merlons, meurtrière : huit siècles de service, et la vieille porte tient toujours son rôle — filtrer ce qui entre. Côté est, les cours et la ville moderne.',
        vers: { carte: 'q_cours', x: 9, y: 5, temps: 3 }, versNom: 'Passer la porte vers l\'est',
      },
      '4,4': {
        t: 'rue', nom: 'Rue Nostradamus', danger: 0.3,
        desc: 'La rue monte doucement vers le rocher du Puech. Les plaques de musée — « Maison de Nostradamus » — pendent de travers. Il avait prédit beaucoup de choses. Pas ça. Ou peut-être que si.',
        fouille: { max: 2, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
          { id: 'eclat_verre', q: [1, 1], p: 0.4 },
        ] },
      },
      '5,4': {
        t: 'batiment', nom: 'Maison de Nostradamus', lbl: 'Nostradamus', danger: 0.2,
        desc: 'La maison étroite où l\'apothicaire a écrit ses Centuries et fini sa vie. Trois niveaux sous les poutres, un musée à taille de maison. La porte du musée est entrebâillée.',
        vers: { carte: 'int_nostradamus', x: 5, y: 5, temps: 2 }, versNom: 'Entrer chez Nostradamus',
      },
      '3,4': {
        t: 'place', nom: 'Place Saint-Michel', lbl: 'St-Michel', danger: 0.3,
        desc: 'Les étals du marché bio du samedi sont encore dressés — c\'était il y a trois semaines. Les cagettes pourrissent en tas bourdonnants. L\'église romane regarde tout ça de ses deux clochers.',
        fouille: { max: 3, table: [
          { id: 'conserve_haricots', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 3], p: 0.7 },
          { id: 'manche_balai', q: [1, 1], p: 0.4 }, { id: 'appat', q: [1, 2], p: 0.4 },
          { id: 'bache_plastique', q: [1, 1], p: 0.4 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      '2,4': {
        t: 'batiment', nom: 'Église Saint-Michel', lbl: 'Église', danger: 0.25,
        desc: 'Murs épais, fenêtres rares, et au portail roman, deux diables sculptés depuis huit cents ans. « Le Mal doit rester dehors. » Quelqu\'un y a cru : la porte est entrouverte.',
        vers: { carte: 'int_eglise', x: 0, y: 3, temps: 2 }, versNom: 'Pousser la porte de l\'église',
      },
      '4,5': {
        t: 'place', nom: 'Place des Centuries', lbl: 'Centuries', danger: 0.35,
        desc: 'Le parvis au pied du rocher. D\'ici, le château de l\'Empéri bouche le ciel. Des barricades de mobilier urbain, effondrées, racontent une dernière défense qui n\'a pas tenu.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [1, 2], p: 0.5 }, { id: 'clous', q: [2, 5], p: 0.5 },
          { id: 'brique', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'bandage_fortune', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,6': {
        t: 'escalier', nom: 'Montée du Puech', lbl: 'Montée', danger: 0.2,
        desc: 'Le grand escalier grimpe le long du rocher vers le château. Étroit, raide — un seul peut y passer de front. C\'est exactement ce qui en fait le meilleur chemin de la ville.',
      },
      '5,6': {
        t: 'batiment', nom: 'Lycée de l\'Empéri', lbl: 'Lycée', danger: 0.35,
        desc: 'Adossé au rocher, sous le château. Les grilles sont ouvertes sur une cour jonchée de sacs de cours abandonnés. Le tableau d\'affichage annonce encore le bac blanc.',
        fouille: { max: 4, table: [
          { id: 'barre_cereales', q: [1, 3], p: 0.6 }, { id: 'biscuits', q: [1, 2], p: 0.5 },
          { id: 'cable_electrique', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'bandage', q: [1, 1], p: 0.3 }, { id: 'sac_a_dos', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,7': {
        t: 'batiment', nom: 'Château de l\'Empéri', lbl: 'EMPÉRI', danger: 0.2,
        desc: 'Mille ans de murailles au sommet du rocher du Puech. Les archevêques d\'Arles, Napoléon, deux guerres — et maintenant toi. Si un endroit peut tenir dans cette ville, c\'est celui-là.',
        verrou: {
          desc: 'Le grand portail est verrouillé et les grilles du chantier du musée barrent l\'entrée — le château était en travaux quand tout est tombé. Les échafaudages, eux, montent jusqu\'au premier rempart.',
          options: [
            { methode: 'outil', outil: 'pied_de_biche', label: 'Forcer les grilles du chantier', tempsMin: 8 },
            { methode: 'skill', skill: 'force', niveau: 2, label: 'Écarter les grilles à la force des bras', tempsMin: 15 },
            { methode: 'skill', skill: 'agilite', niveau: 2, label: 'Escalader les échafaudages', tempsMin: 10, risque: { p: 0.3, blessure: 'entaille', texte: 'Une tôle cède sous ton pied — tu te rattrapes au tube suivant, l\'avant-bras ouvert.', zones: ['à l\'avant-bras'] } },
          ],
        },
        vers: { carte: 'int_emperi', x: 2, y: 4, temps: 3 }, versNom: 'Entrer dans le château',
      },
    },
  },

  // ════════ PETIT CASINO — la supérette du centre ════════
  // Plan en L : l'entrée et le coin presse sur la rue, le plateau de vente en
  // enfilade (caisse, rayons, épicerie, rayon frais), puis la porte « PRIVÉ »
  // vers l'arrière-boutique — couloir, bureau du gérant, et la réserve verrouillée.
  int_casino: {
    nom: 'Petit Casino', sousTitre: 'rue des Frères Kennedy',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 4,
    exterieur: false, ambiance: 'sombre', illu: 'magasin',
    zombiesPool: ['errant', 'putrefie', 'gonfle', 'nuee_rats'],
    passages: [
      ['0,2', '1,2', 'ouvert'], // même plateau de vente : la caisse ouvre sur les rayons
      ['1,2', '2,2', 'ouvert'], // les rayons se prolongent dans l'épicerie du fond
      ['2,2', '3,2', 'ouvert'], // l'épicerie débouche sur le rayon frais
      ['1,3', '1,2', 'ouvert'], // le coin presse donne directement sur les rayons
    ],
    cases: {
      // ----- sur la rue -----
      '0,3': {
        t: 'porte', nom: 'Entrée de la supérette', lbl: 'Sortie', danger: 0.2,
        desc: 'Le tourniquet à cartes postales est couché en travers de l\'entrée. Dehors, la rue Kennedy. Dedans, une odeur de lait tourné à couper au couteau.',
        vers: { carte: 'q_centre', x: 2, y: 2, temps: 2 }, versNom: 'Ressortir rue Kennedy',
      },
      '1,3': {
        t: 'piece', nom: 'Le coin presse', lbl: 'Presse', danger: 0.15, mob: 'etageres',
        desc: 'Le présentoir à journaux fige la ville au matin du 19 : « LE GRAND MARCHÉ FÊTE SES SIX CENTS ANS ». Le papier a jauni d\'un coup, comme s\'il avait compris avant les gens.',
        fouille: { max: 2, table: [
          { id: 'journal_papier', q: [1, 3], p: 0.8 }, { id: 'briquet', q: [1, 1], p: 0.4 },
          { id: 'chocolat', q: [1, 1], p: 0.3 }, { id: 'telephone_mort', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- le plateau de vente -----
      '0,2': {
        t: 'piece', nom: 'La caisse', lbl: 'Caisse', danger: 0.2, mob: 'comptoir',
        desc: 'Le tiroir-caisse pend, ouvert, plein de billets que plus personne ne volera. Sous le comptoir : le bazar utile d\'une caissière prévoyante.',
        fouille: { max: 3, table: [
          { id: 'briquet', q: [1, 1], p: 0.6 }, { id: 'chocolat', q: [1, 2], p: 0.5 },
          { id: 'piles', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 2], p: 0.6 },
          { id: 'scotch', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,2': {
        t: 'piece', nom: 'Les rayons', lbl: 'Rayons', danger: 0.3, mob: 'rayonnages',
        desc: 'Les étagères renversées en dominos, le sol poisseux de bocaux brisés. Le gros a été raflé dans la panique — mais la panique fouille mal.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.6 }, { id: 'conserve_raviolis', q: [1, 1], p: 0.5 },
          { id: 'chips', q: [1, 2], p: 0.5 }, { id: 'biscuits', q: [1, 1], p: 0.5 },
          { id: 'soda', q: [1, 2], p: 0.5 }, { id: 'canette_vide', q: [1, 3], p: 0.7 },
          { id: 'sac_plastique', q: [1, 2], p: 0.6 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '2,2': {
        t: 'piece', nom: 'L\'épicerie du fond', lbl: 'Épicerie', danger: 0.3, sombre: 1, mob: 'rayonnages',
        desc: 'Le fond de la boutique, loin des vitrines, baigne dans une pénombre grasse. Du riz répandu que les rats ont trié grain par grain. Sous l\'étagère du bas, la panique a laissé des oublis.',
        fouille: { max: 3, table: [
          { id: 'conserve_haricots', q: [1, 1], p: 0.4 }, { id: 'soupe_conserve', q: [1, 1], p: 0.3 },
          { id: 'biscuits', q: [1, 1], p: 0.35 }, { id: 'ouvre_boite', q: [1, 1], p: 0.25 },
          { id: 'sac_plastique', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '3,2': {
        t: 'piece', nom: 'Le rayon frais', lbl: 'Frais', danger: 0.35, sombre: 1, mob: 'machines',
        desc: 'Les armoires réfrigérées, mortes depuis des semaines. Tu respires par la bouche : lait, viande, yaourts — tout est devenu la même chose derrière les vitres voilées de gris.',
        fouille: { max: 2, table: [
          { id: 'soda', q: [1, 1], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.6 },
          { id: 'bouteille_eau', q: [1, 1], p: 0.25 }, { id: 'sac_plastique', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- l'arrière-boutique -----
      '4,2': {
        t: 'couloir', nom: 'Porte « PRIVÉ »', lbl: '', danger: 0.25, sombre: 1,
        desc: 'Une porte battante marquée « PRIVÉ », des cartons aplatis contre le mur. Le néon est mort, mais ta main cherche encore l\'interrupteur — réflexe d\'un monde où ça s\'allumait.',
      },
      '4,1': {
        t: 'couloir', nom: 'Couloir de l\'arrière-boutique', lbl: '', danger: 0.25, sombre: 1,
        desc: 'Un boyau encombré. Le transpalette est resté en travers, poignée tendue vers toi, comme si quelqu\'un comptait revenir le chercher.',
      },
      '5,1': {
        t: 'piece', nom: 'Bureau du gérant', lbl: 'Bureau', danger: 0.2, sombre: 1, mob: 'bureau',
        desc: 'Les plannings punaisés, le café fossilisé dans sa tasse, et le coffret de la recette grand ouvert — vidé par son propriétaire, pas par des pillards. Lui, au moins, a eu le temps de partir.',
        fouille: { max: 3, table: [
          { id: 'portefeuille', q: [1, 1], p: 0.4 }, { id: 'scotch', q: [1, 1], p: 0.4 },
          { id: 'piles', q: [1, 1], p: 0.35 }, { id: 'journal_papier', q: [1, 2], p: 0.5 },
          { id: 'allumettes', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,0': {
        t: 'piece', nom: 'La réserve', lbl: 'Réserve', danger: 0.4, sombre: 2, mob: 'palettes',
        verrou: {
          desc: 'Un rideau métallique à demi baissé, tordu, bloqué. Derrière, des palettes intactes — le jackpot, si tu arrives à entrer.',
          options: [
            { methode: 'skill', skill: 'force', niveau: 2, label: 'Soulever le rideau à la force des bras', tempsMin: 10 },
            { methode: 'outil', outil: 'pied_de_biche', label: 'Faire levier avec le pied-de-biche', tempsMin: 5 },
          ],
        },
        desc: 'Des palettes filmées jusqu\'au plafond, une odeur de carton humide, et pas la moindre fenêtre. La réserve n\'a jamais été pillée : le rideau a tenu.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [2, 3], p: 0.9 }, { id: 'conserve_raviolis', q: [1, 3], p: 0.8 },
          { id: 'bouteille_eau', q: [2, 4], p: 0.9 }, { id: 'alcool_fort', q: [1, 2], p: 0.6 },
          { id: 'cartouche_gaz', q: [1, 1], p: 0.5 }, { id: 'sac_a_dos', q: [1, 1], p: 0.5 },
        ] },
      },
    },
  },

  // ════════ ÉGLISE SAINT-MICHEL ════════
  // Plan roman : le porche s'ouvre à l'ouest sur une nef de trois travées, bordée
  // au nord par les fonts baptismaux et la chapelle latérale ; au chevet, le chœur
  // dessert la sacristie (et sa remise aveugle) et la vis du clocher, qui grimpe
  // à la chambre des cloches — posée tout en haut du plan, hors du vaisseau.
  int_eglise: {
    nom: 'Église Saint-Michel', sousTitre: 'XIIIe siècle — murs épais, fenêtres rares',
    echelle: 'interieur', tempsParCase: 1, largeur: 7, hauteur: 4,
    exterieur: false, ambiance: 'sombre', illu: 'commissariat',
    zombiesPool: ['errant', 'putrefie', 'rampant'],
    passages: [
      ['1,3', '2,3', 'ouvert'], // la nef file d'une travée à l'autre — même vaisseau
      ['2,3', '3,3', 'ouvert'],
      ['3,3', '4,3', 'ouvert'], // le chœur prolonge la nef, trois marches plus haut
      ['1,2', '1,3', 'ouvert'], // les fonts baptismaux ouvrent sur la première travée
      ['2,2', '2,3', 'ouvert'], // la chapelle latérale ouvre directement sur la nef
      ['4,3', '5,3'], // porte de la sacristie, dans le flanc du chœur
      ['5,2', '5,3'], // porte de la remise, au fond de la sacristie
    ],
    murs: [
      ['4,2', '5,2'], // le bas de la vis ne donne pas dans la remise — mur plein
    ],
    cases: {
      // ----- le clocher, au sommet de la vis -----
      '4,0': {
        t: 'piece', nom: 'La chambre des cloches', lbl: 'Clocher', danger: 0.1, mob: null,
        desc: 'Trois cloches pendent dans leur beffroi de chêne, muettes depuis le 19. Par les abat-sons, tout Salon s\'étale en contrebas — les toits, les cours, la horde réduite à des points lents. De là-haut, on pourrait presque croire que la ville dort.',
        fouille: { max: 2, table: [
          { id: 'corde', q: [1, 1], p: 0.6 }, { id: 'appat', q: [1, 2], p: 0.4 },
          { id: 'fil_de_fer', q: [1, 1], p: 0.35 },
        ] },
      },
      '4,1': {
        t: 'escalier', nom: 'La vis du clocher', lbl: 'Escalier', danger: 0.15, sombre: 1,
        desc: 'La vis tourne dans l\'épaisseur du mur, si étroite que tes épaules frottent la pierre. Des meurtrières découpent le noir en lames de jour où danse la poussière.',
      },
      // ----- le flanc nord et les annexes -----
      '1,2': {
        t: 'piece', nom: 'Les fonts baptismaux', lbl: 'Fonts', danger: 0.15, sombre: 1, mob: null,
        desc: 'La cuve de pierre est pleine d\'une eau noire où flottent de la cire et des pétales secs. Des générations de Salonais ont commencé ici. Dehors, quelque part, beaucoup n\'en finissent plus de finir.',
        fouille: { max: 2, table: [
          { id: 'eau_croupie', q: [1, 2], p: 0.5 }, { id: 'bouteille_vide', q: [1, 1], p: 0.4 },
          { id: 'allumettes', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,2': {
        t: 'piece', nom: 'Chapelle latérale', lbl: 'Chapelle', danger: 0.2, mob: 'table',
        desc: 'Des cierges fondus en stalactites, des ex-voto, et des dizaines de photos glissées sous la statue — des visages, des prénoms, des « reviens ». Le mur des disparus de Salon.',
        fouille: { max: 2, table: [
          { id: 'allumettes', q: [1, 2], p: 0.7 }, { id: 'photo_famille', q: [1, 1], p: 0.4 },
          { id: 'chiffon', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,2': {
        t: 'escalier', nom: 'Le bas de la tour', lbl: 'Escalier', danger: 0.15,
        desc: 'Une porte basse dans le flanc du chœur, et les premières marches creusées en leur centre — huit siècles de sonneurs, montés sonner les heures, les noces et les glas.',
      },
      '5,2': {
        t: 'piece', nom: 'Remise de la sacristie', lbl: 'Remise', danger: 0.2, sombre: 2, mob: 'etageres',
        desc: 'Pas de fenêtre, pas d\'air : des balais, une échelle trop courte, des cartons de cierges et des bidons d\'encaustique. Le ménage de la maison de Dieu tenait dans deux mètres carrés. L\'odeur de cire est celle des dimanches d\'avant.',
        fouille: { max: 3, table: [
          { id: 'manche_balai', q: [1, 1], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.6 },
          { id: 'allumettes', q: [1, 2], p: 0.4 }, { id: 'planche', q: [1, 1], p: 0.35 },
          { id: 'fil_de_fer', q: [1, 1], p: 0.35 },
        ] },
      },
      // ----- le vaisseau, du portail au chevet -----
      '0,3': {
        t: 'porte', nom: 'Le porche', lbl: 'Sortie', danger: 0.15,
        desc: 'Sous le portail roman, les deux diables sculptés te regardent passer. Huit cents ans qu\'ils montent la garde. Ces derniers temps, ils ont dû voir du travail.',
        vers: { carte: 'q_centre', x: 2, y: 4, temps: 2 }, versNom: 'Ressortir place Saint-Michel',
      },
      '1,3': {
        t: 'piece', nom: 'La nef — sous la tribune', lbl: '', danger: 0.3, sombre: 1, mob: 'bancs',
        desc: 'Une seule nef, haute et noire, qui s\'enfonce vers l\'est. Le présentoir des feuilles paroissiales s\'est renversé ; les pages détrempées collent aux dalles comme des feuilles mortes.',
        fouille: { max: 2, table: [
          { id: 'journal_papier', q: [1, 1], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'allumettes', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,3': {
        t: 'piece', nom: 'La nef — les bancs', lbl: 'Nef', danger: 0.35, sombre: 1, mob: 'bancs',
        desc: 'Des silhouettes sont assises sur les bancs, têtes baissées, parfaitement immobiles. Tu pries — c\'est le lieu — pour qu\'elles le restent.',
        fouille: { max: 2, table: [
          { id: 'bouteille_eau', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'bandage', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,3': {
        t: 'piece', nom: 'La nef — les premiers rangs', lbl: '', danger: 0.4, sombre: 1, mob: 'bancs',
        desc: 'Les premiers rangs sont les plus pleins. Ceux-là sont venus mourir au plus près de l\'autel, et certains attendent encore, assis bien droits. L\'un d\'eux tient un chapelet dans ce qui lui reste de mains.',
        fouille: { max: 2, table: [
          { id: 'allumettes', q: [1, 2], p: 0.5 }, { id: 'bandage', q: [1, 1], p: 0.3 },
          { id: 'journal_papier', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,3': {
        t: 'piece', nom: 'Le chœur', lbl: 'Chœur', danger: 0.25, mob: 'table',
        desc: 'Trois fenêtres romanes versent dans l\'abside la seule vraie lumière de l\'église. L\'autel est nu : quelqu\'un a emporté la croix et laissé les burettes. Le tabernacle bâille, vide.',
        fouille: { max: 2, table: [
          { id: 'allumettes', q: [1, 2], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'alcool_fort', q: [1, 1], p: 0.25 },
        ] },
      },
      '5,3': {
        t: 'piece', nom: 'La sacristie', lbl: 'Sacristie', danger: 0.25, mob: 'tiroirs',
        desc: 'Les chasubles pendues en rang, le coffre des objets de culte forcé. Sur la table, un registre ouvert : les derniers baptêmes datent du 18. La dernière page est une liste de noms barrés.',
        fouille: { max: 3, table: [
          { id: 'alcool_fort', q: [1, 1], p: 0.5 }, { id: 'chiffon', q: [2, 3], p: 0.7 },
          { id: 'bandage', q: [1, 1], p: 0.4 }, { id: 'desinfectant', q: [1, 1], p: 0.3 },
          { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
    },
  },

  // ════════ MAISON DE NOSTRADAMUS ════════
  // Trois niveaux superposés sur le même plan, du haut vers le bas : les combles
  // (squat du visiteur + grenier), le 1er étage du musée (cabinet, palier, salles,
  // salle de projection), le rez-de-chaussée (réserve, boutique, vestibule,
  // billetterie sur la rue). Deux rangées vides séparent les niveaux ; l'escalier
  // de meunier (à gauche) et le grand escalier (à droite) les relient, empilés.
  int_nostradamus: {
    nom: 'Maison de Nostradamus', sousTitre: 'trois niveaux sous les poutres',
    echelle: 'interieur', tempsParCase: 1, largeur: 6, hauteur: 6,
    exterieur: false, ambiance: 'calme', illu: 'appartement',
    zombiesPool: ['errant', 'rampant'],
    passages: [
      ['3,0', '4,0', 'ouvert'], // la cloison des combles, à demi démontée
      ['3,2', '4,2'], // la porte de la salle de projection, au bout du parcours
      ['3,4', '4,4'], // la porte de la réserve, derrière la boutique
    ],
    cases: {
      // ----- les combles -----
      '2,0': {
        t: 'escalier', nom: 'Escalier de meunier (combles)', lbl: 'Escalier', danger: 0.1,
        desc: 'La trémie débouche sous la charpente du XVIe. L\'air ne bouge plus ici ; il garde la chaleur du jour et l\'odeur du vieux bois comme une haleine.',
      },
      '3,0': {
        t: 'piece', nom: 'Les combles', lbl: 'Combles', danger: 0.1, sombre: 1, mob: 'lit',
        desc: 'Sous les poutres du XVIe, une petite pièce que troue une lucarne grise et qui sent la poussière chaude. Quelqu\'un a dormi ici récemment : duvet roulé, conserves vides, et un exemplaire des Centuries annoté au stylo rouge. La dernière note dit : « Quatrain VII — c\'est NOUS. »',
        fouille: { max: 3, table: [
          { id: 'conserve_raviolis', q: [1, 1], p: 0.5 }, { id: 'bouteille_eau', q: [1, 1], p: 0.5 },
          { id: 'bonnet', q: [1, 1], p: 0.4 }, { id: 'couteau_artisanal', q: [1, 1], p: 0.4 },
          { id: 'journal_papier', q: [1, 1], p: 0.6 },
        ] },
      },
      '4,0': {
        t: 'piece', nom: 'Le grenier du musée', lbl: 'Grenier', danger: 0.15, sombre: 1, mob: 'debris',
        desc: 'Le débarras de la scénographie : décors démontés, caisses éventrées, et des mannequins de rechange couchés sous une bâche. Dans le jour rare de la lucarne, on dirait des corps qui attendent leur tour.',
        fouille: { max: 3, table: [
          { id: 'planche', q: [1, 2], p: 0.5 }, { id: 'fil_de_fer', q: [1, 1], p: 0.4 },
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'corde', q: [1, 1], p: 0.25 },
        ] },
      },
      // ----- entre les deux : l'escalier de meunier descend -----
      '2,1': {
        t: 'escalier', nom: 'Escalier de meunier (1er)', lbl: 'Escalier', danger: 0.1,
        desc: 'Raide comme une échelle, l\'escalier de meunier grimpe du palier vers les combles. Chaque marche proteste sous ton poids — impossible de monter sans s\'annoncer.',
      },
      // ----- 1er étage : le parcours du musée -----
      '1,2': {
        t: 'piece', nom: 'Le cabinet de l\'astrologue', lbl: 'Cabinet', danger: 0.15, mob: 'bureau',
        desc: 'La reconstitution du cabinet où il écrivait les Centuries. Herbiers, mortiers, fioles d\'apothicaire — Michel de Nostredame soignait la peste avant de prédire la fin des temps. Les deux savoirs servent, aujourd\'hui.',
        fouille: { max: 3, table: [
          { id: 'vitamines', q: [1, 2], p: 0.6 }, { id: 'antidouleur', q: [1, 1], p: 0.4 },
          { id: 'savon', q: [1, 1], p: 0.3 }, { id: 'appat', q: [1, 2], p: 0.4 },
        ] },
      },
      '2,2': {
        t: 'couloir', nom: 'Palier du premier', lbl: '', danger: 0.15,
        desc: 'Le plancher ploie et grince, ciré par quatre siècles de pas. Les panneaux du parcours numérotent la visite : la peste, les remèdes, les présages. Tu suis les flèches, comme tout le monde avant toi.',
      },
      '3,2': {
        t: 'piece', nom: 'Salles du musée', lbl: 'Musée', danger: 0.2, sombre: 1, mob: 'etageres',
        desc: 'Les scénographies dans le noir : mannequins de cire en costume du XVIe, alambics, cartes du ciel. Dans la pénombre, chaque silhouette immobile te fait lever ton arme.',
        fouille: { max: 3, table: [
          { id: 'eclat_verre', q: [1, 2], p: 0.6 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'allumettes', q: [1, 1], p: 0.4 }, { id: 'bouteille_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      '4,2': {
        t: 'piece', nom: 'Salle de projection', lbl: 'Vidéo', danger: 0.25, sombre: 2, mob: 'bancs',
        desc: 'Une salle aveugle, des bancs face à un écran mort. La voix off racontait la peste d\'Aix en boucle ; il ne reste que le noir total, l\'odeur de moquette neuve et le silence d\'après la fin du film.',
        fouille: { max: 3, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.35 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.4 },
        ] },
      },
      '5,2': {
        t: 'escalier', nom: 'Grand escalier (1er)', lbl: 'Escalier', danger: 0.15,
        desc: 'L\'escalier de pierre vrille dans l\'épaisseur du mur, ses marches creusées en cuvette. Nostradamus les montait déjà ; toi, tu les descends une main sur la pierre froide.',
      },
      // ----- entre les deux : le grand escalier descend -----
      '5,3': {
        t: 'escalier', nom: 'Grand escalier (rez)', lbl: 'Escalier', danger: 0.15,
        desc: 'Les dernières marches s\'évasent dans la pénombre du vestibule. Tu t\'arrêtes à l\'avant-dernière, le temps d\'écouter la maison — elle craque toute seule, comme pour répondre.',
      },
      // ----- rez-de-chaussée : l'accueil sur la rue -----
      '3,4': {
        t: 'piece', nom: 'Réserve du musée', lbl: 'Réserve', danger: 0.2, sombre: 2, mob: 'etageres',
        desc: 'Une pièce aveugle derrière la boutique : cartons de catalogues, vitrine de rechange, un mannequin de cire démembré sous une bâche. Dans le noir complet, ta main hésite avant chaque caisse.',
        fouille: { max: 3, table: [
          { id: 'bache_plastique', q: [1, 1], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'scotch', q: [1, 1], p: 0.35 }, { id: 'fil_de_fer', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,4': {
        t: 'piece', nom: 'Boutique du musée', lbl: 'Boutique', danger: 0.15, mob: 'rayonnages',
        desc: 'Cartes postales du prophète, presse-papiers, rééditions des Centuries sous blister. Tout le monde voulait connaître l\'avenir pour douze euros. Personne n\'a aimé la réponse.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'carte_quartier', q: [1, 1], p: 0.3 },
          { id: 'briquet', q: [1, 1], p: 0.35 }, { id: 'chocolat', q: [1, 1], p: 0.2 },
          { id: 'sac_plastique', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,4': {
        t: 'couloir', nom: 'Vestibule', lbl: '', danger: 0.15,
        desc: 'Un boyau voûté bas, entre la rue et le grand escalier. La rampe luit d\'usure, et l\'ardoise des horaires promet encore une nocturne le premier vendredi du mois.',
      },
      '5,5': {
        t: 'porte', nom: 'Billetterie du musée', lbl: 'Sortie', danger: 0.15,
        desc: 'Les audioguides sont alignés sur leur râtelier, batteries mortes. Le tiroir des billets est intact : personne n\'est venu piller un musée. Presque personne.',
        vers: { carte: 'q_centre', x: 5, y: 4, temps: 2 }, versNom: 'Ressortir rue Nostradamus',
        fouille: { max: 2, table: [
          { id: 'piles', q: [1, 2], p: 0.5 }, { id: 'journal_papier', q: [1, 1], p: 0.5 },
          { id: 'telephone_mort', q: [1, 1], p: 0.4 },
        ] },
      },
    },
  },

  // ════════ CHÂTEAU DE L'EMPÉRI ════════
  // Le château en quadrilatère autour de sa cour d'honneur : la porterie au sud
  // (Sortie), la rampe de la cour basse qui monte entre les murs, la cour en plateau
  // à ciel ouvert, la galerie Renaissance en arcades à l'est (musée verrouillé et
  // salle des gypseries derrière), le jardin des Simples et la chapelle à l'ouest,
  // la citerne sous le rocher, et l'escalier des remparts vers le chemin de ronde.
  int_emperi: {
    nom: 'Château de l\'Empéri', sousTitre: 'mille ans de murailles sur le rocher du Puech',
    echelle: 'interieur', tempsParCase: 2, largeur: 7, hauteur: 5,
    exterieur: false, ambiance: 'sombre', illu: 'commissariat',
    zombiesPool: ['errant', 'putrefie', 'enrage', 'colosse'],
    passages: [
      // ----- remparts : le chemin de ronde -----
      ['0,0', '1,0', 'ouvert'], // le chemin de ronde court d'un créneau à l'autre
      ['1,0', '2,0', 'ouvert'],
      // ----- cour d'honneur : plateau à ciel ouvert -----
      ['1,1', '2,1', 'ouvert'], ['1,1', '1,2', 'ouvert'],
      ['2,1', '2,2', 'ouvert'], ['1,2', '2,2', 'ouvert'],
      ['2,2', '2,3', 'ouvert'], // la rampe de la cour basse débouche dans la cour
      // ----- les arcades de la galerie Renaissance, ouvertes sur la cour -----
      ['2,1', '3,1', 'ouvert'], ['2,2', '3,2', 'ouvert'],
      ['3,1', '3,2', 'ouvert'], // la galerie file d'une arcade à l'autre
      // ----- portes -----
      ['3,1', '4,1'], // la grille de chantier du musée militaire (cadenassée)
      ['4,1', '5,1', 'ouvert'], // l'enfilade des salles du musée
      ['3,2', '4,2'], // porte de la salle des gypseries, au fond de la galerie
      ['1,2', '0,2'], // la grille du jardin des Simples
      ['0,2', '0,3'], // la porte de la chapelle castrale donne sur le jardin des Simples
      ['2,3', '1,3'], // porte de la loge du gardien, dans la cour basse
      ['2,3', '3,3'], // la porte basse de la citerne, taillée dans le rocher
    ],
    murs: [
      ['0,1', '0,2'], // l'escalier des remparts tourne le dos au jardin
    ],
    cases: {
      // ----- le chemin de ronde -----
      '0,0': {
        t: 'piece', nom: 'Remparts — côté ouest', lbl: '', danger: 0.1, mob: null,
        desc: 'Le chemin de ronde s\'ouvre d\'un coup sur le ciel. Le vent te gifle — un vent propre, sans odeur de mort, le premier depuis des semaines. Tu restes une seconde de trop, juste pour respirer.',
      },
      '1,0': {
        t: 'piece', nom: 'Remparts — le chemin de ronde', lbl: 'Remparts', danger: 0.1, mob: null,
        desc: 'Les créneaux découpent les toits du centre ancien. En bas, dans les ruelles, tu les vois circuler — petits, lents, innombrables. D\'ici, on pourrait presque croire que la ville vit encore.',
      },
      '2,0': {
        t: 'piece', nom: 'Remparts — la table d\'orientation', lbl: 'Panorama', danger: 0.1, mob: 'table',
        desc: 'Tout Salon à tes pieds : les toits du centre ancien, l\'anneau des cours, la plaine de la Crau jusqu\'aux Alpilles. Trois colonnes de fumée montent de la ville. Sur la table d\'orientation, quelqu\'un a gravé une flèche vers le sud-ouest : « GARE → MIRAMAS. VIVANTS. »',
        fouille: { max: 2, table: [
          { id: 'carte_quartier', q: [1, 1], p: 1 },
          { id: 'barre_cereales', q: [1, 1], p: 0.4 }, { id: 'bouteille_eau', q: [1, 1], p: 0.4 },
        ] },
      },
      '0,1': {
        t: 'escalier', nom: 'Escalier des remparts', lbl: 'Escalier', danger: 0.15,
        desc: 'Des marches de pierre usées en cuvette par mille ans de gardes. Ça monte raide, vers la lumière.',
      },
      // ----- la cour d'honneur -----
      '1,1': {
        t: 'piece', nom: 'Cour d\'honneur — côté nord', lbl: 'Cour', danger: 0.2, mob: null,
        desc: 'Le pavé de la cour d\'honneur, lavé par trois semaines de pluie. Les fenêtres à meneaux te regardent de trois côtés à la fois — vides, toutes, mais tu vérifies quand même.',
      },
      '2,1': {
        t: 'piece', nom: 'Cour d\'honneur — l\'échafaudage', lbl: '', danger: 0.25, mob: null,
        desc: 'Un échafaudage monte le long de la façade, bâches arrachées qui respirent avec le vent. Quand elles se gonflent toutes ensemble, on dirait que le château soupire.',
      },
      '1,2': {
        t: 'piece', nom: 'Cour d\'honneur — côté ouest', lbl: '', danger: 0.2, mob: null,
        desc: 'Au pied du mur ouest, une brouette pleine d\'eau de pluie, un gilet de chantier plié sur le manche — posé là par quelqu\'un qui pensait revenir de la pause.',
      },
      '2,2': {
        t: 'piece', nom: 'Cour d\'honneur — le chantier', lbl: '', danger: 0.25, mob: 'palettes',
        desc: 'La galerie Renaissance encadre un chantier figé : échafaudages, palettes, bétonnière. Le musée rouvrait au printemps. Les ouvriers sont partis un mardi et ne sont jamais revenus — leur matériel, si.',
        fouille: { max: 4, table: [
          { id: 'planche', q: [2, 4], p: 0.8 }, { id: 'clous', q: [4, 10], p: 0.7 },
          { id: 'marteau', q: [1, 1], p: 0.5 }, { id: 'bache_plastique', q: [1, 2], p: 0.6 },
          { id: 'visserie', q: [1, 2], p: 0.6 }, { id: 'corde', q: [1, 1], p: 0.4 },
          { id: 'ceinture_outils', q: [1, 1], p: 0.35 },
        ] },
      },
      // ----- la galerie Renaissance et ce qu'elle dessert -----
      '3,1': {
        t: 'piece', nom: 'Galerie Renaissance — aile nord', lbl: 'Galerie', danger: 0.25, mob: null,
        desc: 'La galerie couvre le flanc est de la cour, arcade après arcade. Tes pas y sonnent double — un pour toi, un pour la voûte. Tu t\'arrêtes deux fois pour être sûr qu\'ils ne sont que deux.',
      },
      '3,2': {
        t: 'piece', nom: 'Galerie Renaissance — aile sud', lbl: '', danger: 0.3, mob: null,
        desc: 'Les arcades du XVIe siècle, et une enfilade de salles vides qui multiplient chaque bruit par dix. Au sol, une traînée sombre va de pilier en pilier, puis s\'arrête net.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'eclat_verre', q: [1, 1], p: 0.4 },
          { id: 'brique', q: [1, 1], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'piece', nom: 'Musée militaire — les uniformes', lbl: 'Musée', danger: 0.35, sombre: 2, mob: 'etageres',
        verrou: {
          desc: 'Les salles du musée d\'art et d\'histoire militaire sont fermées par une grille de chantier cadenassée. Derrière la grille : deux siècles d\'uniformes, de sabres et de fusils dans leurs vitrines.',
          options: [
            { methode: 'outil', outil: 'pince_coupante', label: 'Couper le cadenas à la pince', tempsMin: 5 },
            { methode: 'outil', outil: 'pied_de_biche', label: 'Faire sauter la grille au pied-de-biche', tempsMin: 10 },
            { methode: 'skill', skill: 'mecanique', niveau: 2, label: 'Crocheter le cadenas', tempsMin: 12 },
          ],
        },
        desc: 'Les collections napoléoniennes dans le noir : shakos, cuirasses, aigles dorées. Les uniformes se tiennent droit dans leurs vitrines, comme une garde qui attendrait la relève.',
        fouille: { max: 2, table: [
          { id: 'veste_cuir', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '5,1': {
        t: 'piece', nom: 'Musée militaire — salle des armes', lbl: 'Armes', danger: 0.35, sombre: 2, mob: 'ratelier',
        desc: 'La salle des armes blanches, tout au fond du noir. Les vitrines n\'ont pas résisté à tout le monde — mais il en reste : sabres, lances, baïonnettes sous le verre étoilé.',
        fouille: { max: 3, table: [
          { id: 'sabre_cavalerie', q: [1, 1], p: 0.8 }, { id: 'lance_renforcee', q: [1, 1], p: 0.35 },
          { id: 'eclat_verre', q: [1, 2], p: 0.5 },
        ] },
      },
      '4,2': {
        t: 'piece', nom: 'Salle des gypseries', lbl: 'Gypseries', danger: 0.25, sombre: 1, mob: null,
        desc: 'La salle d\'honneur et ses gypseries — guirlandes et angelots de plâtre à demi mangés d\'humidité. Sous les bâches du chantier, les moulures attendent une restauration qui ne viendra plus.',
        fouille: { max: 2, table: [
          { id: 'bache_plastique', q: [1, 1], p: 0.4 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'scotch', q: [1, 1], p: 0.3 }, { id: 'planche', q: [1, 2], p: 0.4 },
        ] },
      },
      // ----- l'aile ouest : le jardin et la chapelle -----
      '0,2': {
        t: 'piece', nom: 'Jardin des Simples', lbl: 'Simples', danger: 0.15, mob: 'plantes',
        desc: 'Le jardin de plantes médicinales reconstitué d\'après Nostradamus. Sauge, absinthe, millepertuis — tout a poussé fou en trois semaines. Une pharmacie vivante, pour qui sait lire les étiquettes.',
        fouille: { max: 3, table: [
          { id: 'vitamines', q: [1, 2], p: 0.6 }, { id: 'appat', q: [1, 3], p: 0.6 },
          { id: 'antidouleur', q: [1, 1], p: 0.3 }, { id: 'herbes_simples', q: [1, 3], p: 0.7 },
        ] },
      },
      '0,3': {
        t: 'piece', nom: 'Chapelle castrale', lbl: 'Chapelle', danger: 0.2, mob: null,
        desc: 'La chapelle Sainte-Catherine, nue et froide sous ses arcs brisés. L\'acoustique est terrifiante : ton souffle revient des murs comme celui d\'un autre.',
        fouille: { max: 2, table: [
          { id: 'allumettes', q: [1, 1], p: 0.5 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
          { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
      // ----- la cour basse et l'entrée -----
      '2,3': {
        t: 'piece', nom: 'Cour basse', lbl: 'Cour basse', danger: 0.2, mob: null,
        desc: 'La rampe pavée monte de la porterie vers la cour d\'honneur, entre deux murs hauts comme des falaises. Mille ans de défense ont dessiné ce passage pour être un piège — tu presses le pas.',
      },
      '1,3': {
        t: 'piece', nom: 'Loge du gardien', lbl: 'Loge', danger: 0.15, sombre: 1, mob: 'bureau',
        desc: 'La loge du gardien, collée à la porterie. Un fauteuil défoncé face aux écrans morts de la vidéosurveillance, un calendrier arrêté au mois d\'avant. Le trousseau de clés n\'est plus au tableau.',
        fouille: { max: 3, table: [
          { id: 'journal_papier', q: [1, 2], p: 0.6 }, { id: 'briquet', q: [1, 1], p: 0.4 },
          { id: 'piles', q: [1, 2], p: 0.35 }, { id: 'portefeuille', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,3': {
        t: 'piece', nom: 'La citerne', lbl: 'Citerne', danger: 0.25, sombre: 2, mob: null,
        desc: 'La citerne médiévale, creusée dans le rocher du Puech. Le noir y est total, l\'air immobile et froid. Quelque part en dessous, de l\'eau — tu entends la goutte tomber, très loin, très régulière.',
        fouille: { max: 2, table: [
          { id: 'eau_croupie', q: [1, 2], p: 0.6 }, { id: 'bidon_vide', q: [1, 1], p: 0.4 },
          { id: 'fil_de_fer', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,4': {
        t: 'porte', nom: 'La porterie', lbl: 'Sortie', danger: 0.15,
        desc: 'Le passage voûté sous la tour d\'entrée. Une seule porte pour tout le château : ce qui en faisait une prison en fait aujourd\'hui un refuge.',
        vers: { carte: 'q_centre', x: 4, y: 7, temps: 3 }, versNom: 'Redescendre la montée du Puech',
      },
    },
  },
};
