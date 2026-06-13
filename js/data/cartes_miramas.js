// ============ Miramas — le Refuge et le triage (chapitre 2) ============
// Lieux RÉELS : Miramas-le-Vieux (village médiéval perché — porte Notre-Dame,
// rue Mireille taillée dans le roc, ruines du château du XIIe, chapelle
// Saint-Julien et cimetière Sainte-Répausole, courtine et tour carrée,
// belvédère sur l'étang de Berre), la gare de triage de Miramas (la plus
// grande du sud-est), les entrepôts de Clésud, la D69 vers le pays salonais.
// Voir le schéma documenté dans cartes_salon_centre.js.

export const CARTES_MIRAMAS = {

  // ════════ MIRAMAS-LE-VIEUX — LE REFUGE ════════
  q_miramas_vieux: {
    nom: 'Miramas-le-Vieux', sousTitre: 'le Refuge — un rocher de vivants au-dessus du monde mort',
    echelle: 'quartier', tempsParCase: 2, largeur: 7, hauteur: 6,
    graphe: true, liensAuto: true, // plan à nœuds : rues dessinées, déplacement de nœud en nœud
    exterieur: true, ambiance: 'calme', illu: 'camp',
    zombiesPool: ['errant'],
    cases: {
      // --- le haut du rocher : guet, château, citerne ---
      '2,0': {
        t: 'parc', nom: 'Potagers en terrasses', lbl: 'Potagers', danger: 0,
        desc: 'Des restanques arrachées à la roche, plantées de fèves, de blettes et d\'oignons en rangs serrés. Chaque plant est numéroté à la craie sur une ardoise. Un vieux te regarde regarder les légumes, la binette à la main, sans rien dire. Le message est clair.',
        fouille: { max: 1, table: [
          { id: 'appat', q: [1, 2], p: 0.4 }, { id: 'fil_de_fer', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,0': {
        t: 'site', nom: 'La tour carrée — le guet nord', lbl: 'Guet', danger: 0,
        desc: 'Le vestige le plus haut de la courtine : une tour carrée d\'où l\'on voit la Crau, la voie ferrée de Salon et tout ce qui marche dessus. Un guetteur y vit pratiquement, emmitouflé, jumelles au cou, une cloche de vélo à portée de main. Un coup : des vivants. Deux coups : tout le reste.',
      },
      '2,1': {
        t: 'site', nom: 'Ruines du château', lbl: 'Château', danger: 0,
        desc: 'Du château du XIIe, il reste un pan de la grande salle et un passage voûté à croisée d\'ogives, ouvert sur l\'ancienne cour. Le Refuge en a fait son poste de garde : râteliers d\'outils affûtés, tableau des tours de veille, et une consigne peinte au mur — « ON NE SORT JAMAIS SEUL ».',
        fouille: { max: 1, table: [
          { id: 'corde', q: [1, 1], p: 0.25 }, { id: 'chiffon', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,1': {
        t: 'site', nom: 'La citerne du village', lbl: 'Citerne', danger: 0,
        desc: 'La grande citerne d\'eau de pluie, maçonnée, couverte de bâches. Quelqu\'un a peint une jauge sur le flanc, et la marque de craie descend chaque matin. Elle est presque en bas. Pas de pluie depuis des semaines — et en contrebas, au triage, la citerne SNCF dort sur des milliers de litres. Tout le monde y pense. Personne n\'ose.',
        fouille: { max: 1, table: [
          { id: 'bouteille_vide', q: [1, 2], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'site', nom: 'Courtine est', lbl: 'Remparts', danger: 0,
        desc: 'Ce qui reste de l\'enceinte médiévale, rapiécé de parpaings et de tôles. En dessous, à pic : le triage et ses kilomètres de wagons immobiles, où des silhouettes circulent entre les rames comme des poux dans un peigne. Les guetteurs comptent. Ils ont arrêté de compter à quatre cents.',
      },
      // --- le cœur du village : église, belvédère, salle commune ---
      '1,2': {
        t: 'batiment', nom: 'La salle commune', lbl: 'Salle comm.', danger: 0,
        desc: 'L\'ancienne salle des fêtes du village, accolée à l\'église, devenue le cœur battant du Refuge : cantine, infirmerie, radio, dortoir. De la fumée de cuisine sort du conduit — la fumée que tu as vue depuis le train, celle qui voulait dire « vivants ».',
        vers: { carte: 'int_refuge', x: 2, y: 3, temps: 1 }, versNom: 'Entrer dans la salle commune',
      },
      '2,2': {
        t: 'batiment', nom: 'L\'église', lbl: 'Église', danger: 0,
        desc: 'Une nef charpentée sous ses tuiles, une abside voûtée, des murs d\'un mètre d\'épaisseur. Le Refuge y stocke le grain et les conserves — Dieu partage, il n\'a plus beaucoup de paroissiens. Sur la porte, la liste des arrivants du mois, et celle, plus courte, de ceux qu\'on attend encore.',
        fouille: { max: 1, table: [
          { id: 'allumettes', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      '3,2': {
        t: 'place', nom: 'Le belvédère', lbl: 'Belvédère', danger: 0,
        desc: 'La terrasse de l\'église, au bord du vide. Toute la Provence morte à tes pieds : l\'étang de Berre, immense, métallique, les torchères éteintes de Berre au loin, et juste en dessous, le triage. C\'est le plus bel endroit du monde d\'après. Les gens viennent y pleurer — c\'est l\'endroit prévu pour ça.',
      },
      '4,2': {
        t: 'rue', nom: 'La calade du cimetière', lbl: '', danger: 0.05,
        desc: 'Une calade de galets bombés file à l\'est, hors des maisons, vers le cimetière Sainte-Répausole. Les croix neuves se voient de loin : du bois de palette, des dates serrées sur trois semaines. Le Refuge tient. Pas pour tout le monde.',
      },
      '5,2': {
        t: 'batiment', nom: 'Chapelle Saint-Julien', lbl: 'St-Julien', danger: 0.05,
        desc: 'La chapelle romane du XIIe, seule au milieu de ses tombes, son retable doré du XVIIe intact dans la pénombre. C\'est ici qu\'on veille les morts du Refuge — entiers, et après la lame. La règle ne souffre aucune exception : personne ne revient, ici.',
        fouille: { max: 1, table: [
          { id: 'allumettes', q: [1, 2], p: 0.4 }, { id: 'chiffon', q: [1, 1], p: 0.3 },
        ] },
      },
      // --- les calades et la placette ---
      '2,3': {
        t: 'rue', nom: 'Rue Mireille', lbl: '', danger: 0,
        desc: 'La calade taillée à même le rocher — les anciens ont entaillé la pierre pour faire passer la rue. Les façades se touchent presque au-dessus de ta tête. Du linge sèche entre deux fenêtres. Du linge propre. Tu t\'arrêtes une seconde rien que pour le regarder.',
      },
      '3,3': {
        t: 'place', nom: 'La placette', lbl: 'Placette', danger: 0,
        desc: 'Le cœur du village : un micocoulier, un puits condamné, des tables en tréteaux sous des guirlandes sans ampoules. Des gosses jouent à la marelle sur les pavés — à la marelle. Des hommes débitent du bois. Quelqu\'un rit quelque part. Ton oreille a désappris ce bruit-là.',
        fouille: { max: 1, table: [
          { id: 'canette_vide', q: [1, 1], p: 0.4 }, { id: 'journal_papier', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,3': {
        t: 'batiment', nom: 'Les maisons de pierre', lbl: 'Maisons', danger: 0,
        desc: 'Des maisons médiévales soudées les unes aux autres, habitées — vraiment habitées : volets entrouverts, fumée aux conduits, une casserole qui chante derrière une fenêtre. Une centaine de vivants tiennent là-dedans. Tu n\'entres pas chez les gens. Plus maintenant.',
        fouille: { max: 1, table: [
          { id: 'chiffon', q: [1, 1], p: 0.3 },
        ] },
      },
      // --- la rampe : l'unique accès ---
      '3,4': {
        t: 'rue', nom: 'La rampe', lbl: 'Rampe', danger: 0.05,
        desc: 'L\'unique montée du village, raide, étroite, coincée entre le rocher et un mur de pierre sèche. Deux chicanes de palettes plantées de pieux la coupent en travers. Un seul homme peut la tenir. C\'est exactement pour ça que le Refuge existe encore.',
      },
      '3,5': {
        t: 'porte', nom: 'Porte Notre-Dame', lbl: 'Porte', danger: 0.1,
        desc: 'La porte fortifiée, en bas de la rampe : une voûte médiévale doublée d\'une herse de récupération — grilles de chantier, ressorts de camion, barbelés. Deux guetteurs en permanence, un projecteur branché sur batteries. Au-delà de la voûte, le monde d\'avant le Refuge recommence.',
        vers: { carte: 'q_triage', x: 4, y: 0, temps: 5 }, versNom: 'Franchir la porte vers le triage',
      },
    },
  },

  // ════════ LA GARE DE TRIAGE — le garde-manger qui grouille ════════
  q_triage: {
    nom: 'Le triage de Miramas', sousTitre: 'la plus grande gare de triage du sud-est — et la plus peuplée',
    echelle: 'quartier', tempsParCase: 3, largeur: 8, hauteur: 6,
    graphe: true, liensAuto: true, // plan à nœuds : rues dessinées, déplacement de nœud en nœud
    exterieur: true, ambiance: 'sombre', illu: 'gare',
    zombiesPool: ['errant', 'errant', 'coureur', 'hurleur', 'rampant', 'gonfle', 'traqueur'],
    cases: {
      // --- le pied du rocher : la zone tenue par le Refuge ---
      '4,0': {
        t: 'place', nom: 'Le quai de fortune', lbl: 'Quai', danger: 0.3,
        desc: 'Le débarcadère du Refuge, au pied de la rampe : palettes, conteneurs empilés, barbelés en accordéon. C\'est ici qu\'on t\'a fouillé en descendant du train. Deux sentinelles tiennent la position le jour. La nuit, personne ne la tient — la nuit, le quai appartient au triage.',
        vers: { carte: 'q_miramas_vieux', x: 3, y: 5, temps: 5 }, versNom: 'Remonter la rampe vers le Refuge',
        fouille: { max: 1, table: [
          { id: 'planche', q: [1, 2], p: 0.4 }, { id: 'fil_de_fer', q: [1, 2], p: 0.4 },
        ] },
      },
      '4,1': {
        t: 'rue', nom: 'Sous la falaise', lbl: '', danger: 0.3,
        desc: 'Le chemin de service longe le pied du rocher, entre la paroi et les premières voies. Au-dessus, le village ; devant, l\'océan de wagons. Les guetteurs de la courtine te suivent des yeux aussi loin qu\'ils peuvent. Après, tu es seul.',
        fouille: { max: 2, table: [
          { id: 'brique', q: [1, 2], p: 0.4 }, { id: 'canette_vide', q: [1, 2], p: 0.5 },
        ] },
      },
      // --- le faisceau ouest ---
      '3,2': {
        t: 'rail', nom: 'Le locotracteur Y 8000', lbl: 'LOCO', danger: 0.3,
        desc: 'Ta machine, garée sur sa voie, là où tu as coupé les gaz. Le museau orange est constellé d\'impacts sombres jusqu\'au pare-brise — le voyage est écrit dessus. Tu poses la main sur le capot tiède de soleil. Elle t\'a sorti de Salon. On n\'oublie pas ça.',
        fouille: { max: 2, table: [
          { id: 'chiffon', q: [1, 2], p: 0.5 }, { id: 'bidon_vide', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,2': {
        t: 'rail', nom: 'Faisceau ouest', danger: 0.45,
        zombies: ['errant', 'errant', 'coureur', 'hurleur'],
        desc: 'Trente voies parallèles, des rames de fret à perte de vue, figées en pleine manœuvre. Entre les wagons, les couloirs d\'ombre n\'en finissent pas — et ils ne sont pas vides. Des traînes de pieds résonnent sous les châssis, impossibles à localiser. Le triage est un piège qui a la taille d\'une ville.',
        fouille: { max: 2, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'planche', q: [1, 2], p: 0.4 },
          { id: 'cable_electrique', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,2': {
        t: 'batiment', nom: 'Entrepôt Clésud', lbl: 'Clésud', danger: 0.5, sombre: 2,
        zombies: ['errant', 'gonfle', 'coureur', 'nuee_rats'],
        desc: 'Le premier entrepôt de la zone logistique, en lisière du triage : vingt mètres de haut, des travées de racks dans le noir absolu. Sept cent mille mètres carrés comme ça, derrière. Le garde-manger du monde d\'avant — gardé par tout ce qui y est mort la nuit de l\'évacuation.',
        fouille: { max: 4, table: [
          { id: 'conserve_haricots', q: [1, 2], p: 0.5 }, { id: 'conserve_raviolis', q: [1, 2], p: 0.45 },
          { id: 'scotch', q: [1, 1], p: 0.4 }, { id: 'bache_plastique', q: [1, 2], p: 0.5 },
          { id: 'sac_plastique', q: [1, 3], p: 0.6 }, { id: 'cartouche_gaz', q: [1, 1], p: 0.3 },
          { id: 'lampe_frontale', q: [1, 1], p: 0.3 }, { id: 'cabas_courses', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,3': {
        t: 'rail', nom: 'Rames de fret (ouest)', danger: 0.55,
        zombies: ['errant', 'errant', 'errant', 'coureur', 'hurleur'],
        desc: 'Des wagons couverts alignés sur des centaines de mètres, portes coulissantes battantes. Quelque chose a niché là — eux. Une horde entière s\'abrite du soleil sous les châssis et dans les caisses, et le moindre claquement de tôle en réveille dix. Les guetteurs du village appellent ce secteur « la ruche ».',
        fouille: { max: 3, table: [
          { id: 'corde', q: [1, 1], p: 0.4 }, { id: 'bache_plastique', q: [1, 1], p: 0.4 },
          { id: 'planche', q: [1, 3], p: 0.5 }, { id: 'conserve_haricots', q: [1, 1], p: 0.3 },
        ] },
      },
      // --- le cœur du triage ---
      '4,2': {
        t: 'batiment', nom: 'Poste d\'aiguillage', lbl: 'Poste', danger: 0.35,
        desc: 'La tour de commande du triage, vitres soufflées, pupitres morts. Les voyants ne s\'allumeront plus, mais de là-haut on lit tout le faisceau d\'un seul regard — qui bouge, où, vers quoi. Sur le pupitre central, une tasse de café pétrifiée et un cahier de consignes ouvert au 19.',
        fouille: { max: 3, table: [
          { id: 'lampe_torche', q: [1, 1], p: 0.4 }, { id: 'piles', q: [1, 2], p: 0.5 },
          { id: 'journal_papier', q: [1, 2], p: 0.5 }, { id: 'briquet', q: [1, 1], p: 0.35 },
        ] },
      },
      '3,3': {
        t: 'site', nom: 'La butte de débranchement', lbl: 'Butte', danger: 0.4,
        desc: 'La bosse artificielle d\'où l\'on lâchait les wagons un à un vers les voies de tri. Le seul relief du triage : on y voit loin, on y est vu pareil. En bas de la pente, un wagon trémie a déraillé et s\'est couché — quelque chose cogne dedans, patiemment, depuis des semaines.',
        fouille: { max: 2, table: [
          { id: 'fil_de_fer', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'tuyau_acier', q: [1, 1], p: 0.3 },
        ] },
      },
      '5,2': {
        t: 'rail', nom: 'Faisceau est', danger: 0.45,
        zombies: ['errant', 'coureur', 'rampant', 'hurleur'],
        desc: 'Les voies de relevage et les rames en attente d\'un départ qui n\'aura plus lieu. Un wagon porte-autos chargé de voitures neuves, pare-brise étoilés de l\'intérieur. Le vent fait claquer une bâche quelque part — et chaque claquement fait tourner des têtes que tu ne vois pas.',
        fouille: { max: 2, table: [
          { id: 'eclat_verre', q: [1, 2], p: 0.5 }, { id: 'cable_electrique', q: [1, 1], p: 0.4 },
          { id: 'brique', q: [1, 1], p: 0.4 },
        ] },
      },
      '6,2': {
        t: 'site', nom: 'La citerne SNCF', lbl: 'CITERNE', danger: 0.4,
        desc: 'Le château d\'eau du triage : une cuve sur pylônes, des milliers de litres d\'eau de pluie au-dessus des voies, vanne grippée mais cuve saine — tu l\'entends sonner plein quand le vent la travaille. Là-haut, au village, leur citerne racle le fond. Tout le Refuge rêve de cette cuve. Il ne manque que quelqu\'un d\'assez fou pour venir la traire au milieu des morts.',
        fouille: { max: 4, table: [
          { id: 'bouteille_eau', q: [2, 4], p: 0.8 }, { id: 'eau_croupie', q: [1, 2], p: 0.5 },
          { id: 'bidon_vide', q: [1, 2], p: 0.5 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.45 },
          { id: 'corde', q: [1, 1], p: 0.3 },
        ] },
      },
      // --- le faisceau sud : céréaliers, citernes, frigos ---
      '4,3': {
        t: 'rail', nom: 'Wagons céréaliers', danger: 0.45,
        zombies: ['errant', 'chien_infecte', 'coureur'],
        desc: 'Des trémies à grain éventrées par la rouille, du blé germé en cascades sous les trappes. Les rats ont prospéré — et ce qui chasse les rats aussi. Ça détale entre tes jambes à chaque pas, et tout ce bruit de petites pattes attire de plus grosses choses.',
        fouille: { max: 2, table: [
          { id: 'appat', q: [1, 3], p: 0.6 }, { id: 'sac_plastique', q: [1, 2], p: 0.5 },
          { id: 'collet', q: [1, 1], p: 0.25 },
        ] },
      },
      '5,3': {
        t: 'rail', nom: 'Wagons-citernes', danger: 0.5,
        desc: 'Une rame entière de wagons-citernes, pictogrammes orange délavés. Certains sonnent creux, d\'autres pas — du gasoil, peut-être, ou pire. Ça suinte sous un raccord et l\'odeur d\'hydrocarbure prend à la gorge. Une étincelle ici et le triage entier s\'éclaire une dernière fois.',
        fouille: { max: 3, table: [
          { id: 'bidon_vide', q: [1, 2], p: 0.5 }, { id: 'tuyau_plastique', q: [1, 1], p: 0.4 },
          { id: 'cle_molette', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 2], p: 0.5 },
        ] },
      },
      '6,3': {
        t: 'rail', nom: 'Wagons frigorifiques', danger: 0.55,
        zombies: ['gonfle', 'gonfle', 'putrefie', 'errant'],
        desc: 'Des frigos blancs alignés, groupes électrogènes morts depuis trois semaines. L\'odeur arrive bien avant les wagons — viande, poisson, produits laitiers, tout un train de marée en décomposition. Des choses gorgées se traînent dans le jus, sous les châssis. Tu respires par la bouche. Ça ne suffit pas.',
        fouille: { max: 2, table: [
          { id: 'canette_vide', q: [1, 2], p: 0.5 }, { id: 'conserve_raviolis', q: [1, 1], p: 0.3 },
          { id: 'casserole', q: [1, 1], p: 0.25 },
        ] },
      },
      // --- la lisière sud : Clésud et la D69 ---
      '3,4': {
        t: 'batiment', nom: 'Entrepôts Clésud (sud)', lbl: 'Clésud S.', danger: 0.5, sombre: 2,
        zombies: ['errant', 'errant', 'gonfle', 'coureur'],
        desc: 'La plateforme textile de la zone : des balles de vêtements sous film, des portants renversés sur des centaines de mètres. Dans le noir entre les racks, des silhouettes pendent — des portants, se répète ton cerveau. Des portants. Tu fouilles vite et tu comptes tes pas vers la sortie.',
        fouille: { max: 4, table: [
          { id: 'pull_laine', q: [1, 1], p: 0.45 }, { id: 'jean', q: [1, 1], p: 0.4 },
          { id: 'gants_laine', q: [1, 1], p: 0.35 }, { id: 'bonnet', q: [1, 1], p: 0.3 },
          { id: 'chiffon', q: [2, 4], p: 0.7 }, { id: 'sac_a_dos', q: [1, 1], p: 0.25 },
        ] },
      },
      '4,4': {
        t: 'route', nom: 'Parking poids lourds', danger: 0.4,
        desc: 'Des centaines de semi-remorques alignés au cordeau, cabines vides, rideaux tirés. Les chauffeurs ont été évacués — ou pas. Quelques portières battent. Sur le bitume, entre les remorques, des affaires éparpillées racontent des départs qui ont mal tourné.',
        fouille: { max: 3, table: [
          { id: 'bidon_vide', q: [1, 1], p: 0.4 }, { id: 'telephone_mort', q: [1, 2], p: 0.5 },
          { id: 'corde', q: [1, 1], p: 0.35 }, { id: 'portefeuille', q: [1, 1], p: 0.4 },
          { id: 'casquette', q: [1, 1], p: 0.3 },
        ] },
      },
      '4,5': {
        t: 'route', nom: 'D69 — la sortie nord', lbl: 'D69', danger: 0.35,
        desc: 'La départementale longe les clôtures de Clésud et file au nord, vers Grans et le pays salonais. Quinze kilomètres de bitume à découvert jusqu\'aux faubourgs de Salon. À pied, c\'est une journée de cible mouvante — mais c\'est une route, et elle mène quelque part.',
        vers: { carte: 'region', x: 3, y: 7, temps: 25 }, versNom: 'Prendre la D69 vers le pays salonais',
      },
    },
  },

  // ════════ LA SALLE COMMUNE — le cœur du Refuge ════════
  // L'ancienne salle des fêtes du village, en T : le porche au sud, le grand
  // volume central (bas de salle, grande salle, cantine) d'un seul tenant,
  // l'infirmerie derrière son drap à l'ouest, la scène et sa loge radio à l'est,
  // les services au nord — cuisine, cellier aveugle — et le dortoir derrière la scène.
  int_refuge: {
    nom: 'La salle commune', sousTitre: 'l\'ancienne salle des fêtes — cantine, infirmerie, radio',
    echelle: 'interieur', tempsParCase: 1, largeur: 5, hauteur: 4,
    exterieur: false, ambiance: 'calme', illu: 'camp',
    zombiesPool: ['errant'],
    passages: [
      ['0,1', '1,1', 'ouvert'], // l'infirmerie, derrière son drap tendu sur le flanc de la cantine
      ['1,1', '2,1', 'ouvert'], // cantine et grande salle : le même volume de la salle des fêtes
      ['2,1', '2,2', 'ouvert'], // la salle continue vers le bas, jusqu'aux portes
      ['2,1', '3,1', 'ouvert'], // la salle ouvre de plain-pied sur l'estrade
      ['3,1', '4,1'], // la porte de la loge des musiciens — le poste radio
      ['3,1', '3,0'], // l'arrière-salle aux couvertures pendues s'ouvre au fond de la scène
      ['2,1', '2,0'], // la porte de service de la cuisine, dans le mur nord de la salle
      ['1,0', '2,0'], // le cellier aveugle, au fond de la cuisine
      ['2,2', '3,2'], // la porte du vestiaire, près de l'entrée
    ],
    cases: {
      // ----- le fond : cellier, cuisine, dortoir -----
      '1,0': {
        t: 'piece', nom: 'Le cellier', lbl: 'Cellier', danger: 0, sombre: 2, mob: 'etageres',
        desc: 'Le cellier aveugle de la salle des fêtes, au fond de la cuisine. Pas une fenêtre, pas une ampoule — des étagères de bocaux et de conserves que l\'inventaire recompte chaque soir, à la craie, sur le battant de la porte. Voler ici, c\'est voler cent personnes. Personne n\'a demandé ce que ça coûtait.',
        fouille: { max: 1, table: [
          { id: 'conserve_haricots', q: [1, 1], p: 0.2 }, { id: 'bouteille_vide', q: [1, 2], p: 0.35 },
          { id: 'sac_plastique', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,0': {
        t: 'piece', nom: 'La cuisine', lbl: 'Cuisine', danger: 0, mob: 'cuisine',
        desc: 'La cuisine des noces et des lotos, reconvertie en cuisine de siège : marmites rangées par taille, louches pendues au fil de fer, un fait-tout qui frémit du matin au soir. Tout est compté, tout est propre. La femme qui règne ici n\'élève jamais la voix — elle n\'en a pas besoin.',
        fouille: { max: 1, table: [
          { id: 'casserole', q: [1, 1], p: 0.2 }, { id: 'allumettes', q: [1, 1], p: 0.25 },
          { id: 'canette_vide', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,0': {
        t: 'piece', nom: 'Le dortoir', lbl: 'Dortoir', refuge: true, danger: 0, mob: 'lits',
        desc: 'L\'arrière-salle, cloisonnée de couvertures pendues : des rangées de matelas, de lits de camp, de duvets. La couchette du fond est la tienne — un matelas, une caisse, un clou pour ta veste. Première adresse depuis la chambre 203. Tu dors entouré de respirations vivantes.',
      },
      // ----- le grand volume et ses flancs -----
      '0,1': {
        t: 'piece', nom: 'L\'infirmerie', lbl: 'Infirmerie', danger: 0, mob: 'lits',
        desc: 'Quatre lits de camp derrière un drap tendu, des étagères de médicaments comptés au cachet près, une odeur de désinfectant coupé à l\'eau — de plus en plus à l\'eau. C\'est chez eux, ici. On ne vole pas l\'infirmerie qui te recoudra demain.',
        fouille: { max: 1, table: [
          { id: 'bandage_fortune', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
        ] },
      },
      '1,1': {
        t: 'piece', nom: 'La cantine', lbl: 'Cantine', danger: 0, mob: 'table',
        desc: 'Des tables en tréteaux, des bancs dépareillés, une marmite qui fume sur un poêle à bois. On mange à heures fixes, ce qu\'il y a, sans commentaire. Au mur, le tableau des corvées — ton nom y apparaîtra vite. Ici, personne ne mange gratis.',
        fouille: { max: 1, table: [
          { id: 'journal_papier', q: [1, 1], p: 0.4 }, { id: 'canette_vide', q: [1, 1], p: 0.3 },
        ] },
      },
      '2,1': {
        t: 'piece', nom: 'La grande salle', lbl: 'Gde salle', danger: 0, mob: null,
        desc: 'Le grand volume de la salle des fêtes, sous des guirlandes de fanions qu\'aucune fête n\'a décrochées. Au liège du mur, des dessins d\'enfants : des maisons, des soleils, des silhouettes grises barrées d\'un grand trait rageur. Personne n\'a eu le cœur de les enlever non plus.',
      },
      '3,1': {
        t: 'piece', nom: 'La scène', lbl: 'Scène', danger: 0, mob: null,
        desc: 'L\'estrade de l\'ancienne salle des fêtes, son rideau de velours rouge tiré aux trois quarts. C\'est de là que se font les annonces du soir, les comptes, les minutes de silence. Dans l\'angle, un piano droit désaccordé — quelqu\'un en joue parfois, après la soupe, et personne ne s\'en plaint jamais.',
        fouille: { max: 1, table: [
          { id: 'corde', q: [1, 1], p: 0.3 }, { id: 'chiffon', q: [1, 1], p: 0.35 },
        ] },
      },
      '4,1': {
        t: 'piece', nom: 'Le poste radio', lbl: 'Radio', danger: 0, mob: 'bureau',
        desc: 'L\'ancienne loge des musiciens, derrière la scène. Une table d\'écolier, un émetteur bricolé sur batteries de voiture, une antenne qui sort par le vasistas. C\'est d\'ici que la voix partait — celle qui t\'a tiré de la chambre 203. Un cahier de vacation note chaque contact : les colonnes des derniers jours sont presque vides.',
        fouille: { max: 1, table: [
          { id: 'piles', q: [1, 1], p: 0.25 }, { id: 'journal_papier', q: [1, 1], p: 0.4 },
        ] },
      },
      // ----- le bas de la salle et l'entrée -----
      '2,2': {
        t: 'piece', nom: 'Le bas de la salle', lbl: '', danger: 0, mob: 'bancs',
        desc: 'Les chaises pliantes s\'empilent contre le mur, près des portes, et une marelle à la craie déborde sur le parquet. Au panneau de liège, deux colonnes de visages : « RECHERCHÉS », « RETROUVÉS ». La seconde est la plus courte. Elle existe, c\'est déjà ça.',
        fouille: { max: 1, table: [
          { id: 'canette_vide', q: [1, 1], p: 0.3 }, { id: 'journal_papier', q: [1, 1], p: 0.3 },
        ] },
      },
      '3,2': {
        t: 'piece', nom: 'Le vestiaire', lbl: 'Vestiaire', danger: 0, mob: 'casiers',
        desc: 'Le vestiaire des mariages et des élections : des patères numérotées, des cartons triés à la craie — « HOMMES », « FEMMES », « PETITS ». La garde-robe commune du Refuge. On prend ce qu\'il faut sous l\'œil de la doyenne, on rend ce qu\'on ne porte plus, et tout finit sur son carnet.',
        fouille: { max: 2, table: [
          { id: 'gants_laine', q: [1, 1], p: 0.25 }, { id: 'bonnet', q: [1, 1], p: 0.25 },
          { id: 'casquette', q: [1, 1], p: 0.2 }, { id: 'chiffon', q: [1, 1], p: 0.4 },
        ] },
      },
      '2,3': {
        t: 'porte', nom: 'Le porche', lbl: 'Sortie', danger: 0,
        desc: 'La double porte de l\'ancienne salle des fêtes, calée ouverte le jour, barrée de l\'intérieur la nuit. Dehors : le village, les calades, les voix. Un panneau d\'écolier cloué au montant : « ESSUYEZ VOS ARMES ».',
        vers: { carte: 'q_miramas_vieux', x: 1, y: 2, temps: 1 }, versNom: 'Ressortir dans le village',
      },
    },
  },
};

// Point d'apparition du chapitre 2 : la placette de Miramas-le-Vieux.
export const DEPART_CH2 = { carte: 'q_miramas_vieux', x: 3, y: 3 };
