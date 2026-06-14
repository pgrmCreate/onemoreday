// ============ Base de données des objets ============
// poids en kg, espace en "cases" d'inventaire.
// types : arme, munition, nourriture, boisson, soin, outil, materiau, quete, lore, recipient
// CONTENANTS D'EAU : contenance (litres) + recipient: 'ferme' | 'ouvert'.
//   L'eau vit sur l'INSTANCE d'inventaire : { id, qty:1, eau: { q:'croupie'|'bouillie', L } }.
//   1 litre pèse 1 kg en plus du poids à vide (géré par inventory.js).
//   Un récipient OUVERT plein ne va pas dans le sac : tenu en main ou posé au sol.
export const ITEMS = {

  // ---------- ARMES DE MÊLÉE ----------
  couteau_cuisine: {
    nom: 'Couteau de cuisine', type: 'arme', poids: 0.3, espace: 1,
    dmg: [7, 13], dur: 22, bruit: 0, skill: 'dexterite',
    desc: 'La lame est encore propre. Ça ne durera pas.',
  },
  couteau_artisanal: {
    nom: 'Couteau artisanal', type: 'arme', poids: 0.3, espace: 1,
    dmg: [6, 11], dur: 12, bruit: 0, skill: 'dexterite',
    desc: 'Un éclat de verre, un chiffon, du scotch. Ça coupe la chair — et parfois la main qui le tient.',
  },
  batte_baseball: {
    nom: 'Batte de baseball', type: 'arme', poids: 1.1, espace: 2,
    dmg: [10, 17], dur: 35, bruit: 1, skill: 'force',
    desc: 'Le bois est fendu sur le manche. Quelqu\'un s\'en est déjà servi pour autre chose que du sport.',
  },
  batte_cloutee: {
    nom: 'Batte cloutée', type: 'arme', poids: 1.4, espace: 2,
    dmg: [15, 24], dur: 30, bruit: 1, skill: 'force',
    desc: 'Les clous accrochent l\'os et arrachent des lambeaux à chaque coup.',
  },
  pied_de_biche: {
    nom: 'Pied-de-biche', type: 'arme', poids: 2.2, espace: 2,
    dmg: [12, 19], dur: 70, bruit: 1, skill: 'force', usage: ['forcer'],
    desc: 'Ouvre les portes comme les crânes. L\'outil ultime de la fin du monde.',
  },
  machette: {
    nom: 'Machette', type: 'arme', poids: 0.8, espace: 2,
    dmg: [15, 25], dur: 42, bruit: 0, skill: 'dexterite', usage: ['couper'],
    desc: 'Tranche net. Les moignons ne saignent même plus chez eux.',
  },
  hache_pompier: {
    nom: 'Hache de pompier', type: 'arme', poids: 3.2, espace: 3,
    dmg: [19, 31], dur: 55, bruit: 1, skill: 'force', usage: ['forcer', 'couper'],
    desc: 'Lourde, lente, définitive. Un seul bon coup suffit souvent.',
  },
  cle_molette: {
    nom: 'Clé à molette', type: 'arme', poids: 0.9, espace: 1,
    dmg: [8, 14], dur: 60, bruit: 1, skill: 'force', usage: ['mecanique'],
    desc: 'Un outil honnête. Casse les mâchoires et démonte les boulons.',
  },
  tuyau_acier: {
    nom: 'Tuyau d\'acier', type: 'arme', poids: 1.6, espace: 2,
    dmg: [10, 16], dur: 65, bruit: 2, skill: 'force',
    desc: 'Résonne comme une cloche à chaque impact. Pas discret.',
  },
  lance_artisanale: {
    nom: 'Lance artisanale', type: 'arme', poids: 1.3, espace: 3,
    dmg: [12, 20], dur: 18, bruit: 0, skill: 'dexterite', allonge: true,
    desc: 'Un couteau ligaturé sur un manche à balai. Tient les dents à distance.',
  },
  lance_renforcee: {
    nom: 'Lance renforcée', type: 'arme', poids: 1.5, espace: 3,
    dmg: [14, 23], dur: 34, bruit: 0, skill: 'dexterite', allonge: true,
    desc: 'Ligatures de fil de fer, pointe resserrée. Elle ne bougera plus, même plantée dans un sternum.',
  },
  sabre_cavalerie: {
    nom: 'Sabre de cavalerie', type: 'arme', poids: 1.1, espace: 2,
    dmg: [16, 26], dur: 28, bruit: 0, skill: 'dexterite', allonge: true,
    desc: 'Sorti d\'une vitrine du musée de l\'Empéri. Cent cinquante ans qu\'il attendait de resservir.',
  },
  machette_aiguisee: {
    nom: 'Machette aiguisée', type: 'arme', poids: 0.8, espace: 2,
    dmg: [17, 28], dur: 38, bruit: 0, skill: 'dexterite', usage: ['couper'],
    desc: 'Le fil repris à la lime, affûté à raser. Il tranche les vertèbres — et s\'use plus vite.',
  },
  masse_chantier: {
    nom: 'Masse de chantier', type: 'arme', poids: 3.4, espace: 3,
    dmg: [17, 27], dur: 45, bruit: 2, skill: 'force',
    desc: 'Une brique scotchée au bout d\'un tuyau d\'acier. Chaque impact sonne comme un accident de chantier.',
  },

  // ---------- ARMES À FEU ----------
  pistolet_9mm: {
    nom: 'Pistolet 9 mm', type: 'arme', poids: 0.9, espace: 1,
    dmg: [24, 38], dur: 120, bruit: 3, skill: 'visee', feu: true, ammo: 'munitions_9mm',
    desc: 'Le métal est froid et rassurant. Chaque détonation est une invitation au dîner.',
  },
  fusil_chasse: {
    nom: 'Fusil de chasse', type: 'arme', poids: 3.4, espace: 3,
    dmg: [38, 62], dur: 90, bruit: 3, skill: 'visee', feu: true, ammo: 'cartouches',
    desc: 'À bout portant, il ne reste plus grand-chose au-dessus des épaules.',
  },
  munitions_9mm: {
    nom: 'Munitions 9 mm', type: 'munition', poids: 0.02, espace: 0,
    desc: 'Chaque balle est un choix.',
  },
  cartouches: {
    nom: 'Cartouches de chasse', type: 'munition', poids: 0.05, espace: 0,
    desc: 'De la chevrotine. Pour le gros gibier.',
  },
  arbalete_fortune: {
    nom: 'Arbalète de fortune', type: 'arme', poids: 2.6, espace: 3,
    dmg: [20, 33], dur: 30, bruit: 0, skill: 'visee', feu: true, ammo: 'carreau_fortune',
    desc: 'Un arc de planche, un ressort de sommier, un câble en guise de corde. Lente à armer, silencieuse comme la mort.',
  },
  carreau_fortune: {
    nom: 'Carreau de fortune', type: 'munition', poids: 0.08, espace: 0,
    desc: 'Du bois taillé, une vis limée en pointe. Ça part de travers, mais ça part sans bruit.',
  },

  // ---------- ARMES DE JET ----------
  brique: {
    nom: 'Brique', type: 'arme', poids: 1.8, espace: 1,
    dmg: [7, 14], dur: 3, bruit: 1, skill: 'force', jetSeul: true,
    desc: 'L\'arme la plus vieille du monde. Vise la tête.',
  },
  cocktail_molotov: {
    nom: 'Cocktail Molotov', type: 'arme', poids: 0.8, espace: 1,
    dmg: [30, 48], dur: 1, bruit: 2, skill: 'dexterite', jetSeul: true, feuFlamme: true,
    desc: 'L\'odeur d\'alcool et d\'essence. La chair brûlée pue pendant des heures.',
  },
  couteau_lancer: {
    nom: 'Couteau de lancer', type: 'arme', poids: 0.25, espace: 0,
    dmg: [9, 15], dur: 4, bruit: 0, skill: 'dexterite', jetSeul: true,
    desc: 'Un éclat de verre lesté d\'un ressort, équilibré au scotch. Dans l\'œil ou dans le mur — question d\'entraînement.',
  },

  // ---------- NOURRITURE ----------
  conserve_haricots: {
    nom: 'Conserve de haricots', type: 'nourriture', poids: 0.45, espace: 1,
    faim: 32, besoinOuvre: true,
    desc: 'Froids et gluants, mais c\'est de la vie en boîte.',
  },
  conserve_raviolis: {
    nom: 'Conserve de raviolis', type: 'nourriture', poids: 0.5, espace: 1,
    faim: 35, besoinOuvre: true,
    desc: 'La date de péremption a cessé d\'avoir un sens.',
  },
  barre_cereales: {
    nom: 'Barre de céréales', type: 'nourriture', poids: 0.05, espace: 0,
    faim: 14,
    desc: 'Sèche comme du plâtre. Des calories, rien de plus.',
  },
  chips: {
    nom: 'Paquet de chips', type: 'nourriture', poids: 0.15, espace: 1,
    faim: 12, soif: -6,
    desc: 'Le bruit du sachet s\'entend à dix mètres.',
  },
  chocolat: {
    nom: 'Tablette de chocolat', type: 'nourriture', poids: 0.1, espace: 0,
    faim: 16,
    desc: 'Blanchi par le temps. Un luxe d\'avant.',
  },
  biscuits: {
    nom: 'Paquet de biscuits', type: 'nourriture', poids: 0.3, espace: 1,
    faim: 22, soif: -4,
    desc: 'Émiettés, mais sucrés.',
  },
  viande_crue: {
    nom: 'Viande crue', type: 'nourriture', poids: 0.6, espace: 1,
    faim: 18, risque: { type: 'intoxication', p: 0.55 },
    desc: 'Crue, elle te rendra probablement malade. Fais-la cuire.',
  },
  viande_cuite: {
    nom: 'Viande cuite', type: 'nourriture', poids: 0.5, espace: 1,
    faim: 42,
    desc: 'L\'odeur te fait saliver — et peut-être pas que toi.',
  },
  poisson_cru: {
    nom: 'Poisson cru', type: 'nourriture', poids: 0.4, espace: 1,
    faim: 14, risque: { type: 'intoxication', p: 0.4 },
    desc: 'Frais de l\'étang. À cuire, sauf si tu aimes les parasites.',
  },
  poisson_cuit: {
    nom: 'Poisson cuit', type: 'nourriture', poids: 0.35, espace: 1,
    faim: 32,
    desc: 'Grillé sur un feu de fortune. Presque un bon souvenir.',
  },
  poisson_fume: {
    nom: 'Poisson fumé', type: 'nourriture', poids: 0.25, espace: 1,
    faim: 34,
    desc: 'Fumé lentement sur des copeaux. Léger, nourrissant, et il se garde.',
  },
  ragout: {
    nom: 'Ragoût du survivant', type: 'nourriture', poids: 0.6, espace: 1,
    faim: 55, soif: 6,
    desc: 'Viande et haricots mijotés dans la même casserole. Le meilleur repas depuis la fin du monde.',
  },
  viande_fumee: {
    nom: 'Viande fumée', type: 'nourriture', poids: 0.4, espace: 1,
    faim: 46,
    desc: 'Des lanières noircies au fumoir improvisé. Dure sous la dent, mais elle voyage et elle se garde.',
  },
  soupe_conserve: {
    nom: 'Soupe de conserves', type: 'nourriture', poids: 0.7, espace: 1,
    faim: 42, soif: 16,
    desc: 'Une boîte allongée d\'eau et bouillie. Chaud dans le ventre, ça vaut tous les discours.',
  },
  ragout_poisson: {
    nom: 'Ragoût de poisson', type: 'nourriture', poids: 0.6, espace: 1,
    faim: 46, soif: 12,
    desc: 'Deux poissons mijotés entiers, arêtes au fond. Ça sent l\'étang, mais ça tient au corps.',
  },

  // ---------- BOISSONS ----------
  bouteille_eau: {
    nom: 'Bouteille d\'eau', type: 'boisson', poids: 0.55, espace: 1,
    soif: 42, rend: 'bouteille_vide',
    desc: 'Claire. Propre. Précieuse.',
  },
  eau_croupie: {
    nom: 'Eau croupie', type: 'boisson', poids: 0.55, espace: 1,
    soif: 30, risque: { type: 'intoxication', p: 0.5 }, rend: 'bouteille_vide',
    desc: 'Trouble, avec des choses qui flottent. À faire bouillir.',
  },
  eau_purifiee: {
    nom: 'Eau bouillie', type: 'boisson', poids: 0.55, espace: 1,
    soif: 40, rend: 'bouteille_vide',
    desc: 'Un goût de casserole, mais elle ne te tuera pas.',
  },
  soda: {
    nom: 'Canette de soda', type: 'boisson', poids: 0.35, espace: 1,
    soif: 22, faim: 6, rend: 'canette_vide',
    desc: 'Tiède et trop sucré. Le sucre, ça se respecte maintenant.',
  },

  // ---------- CONTENANTS D'EAU (fermables : ils voyagent dans le sac, même pleins) ----------
  gourde: {
    nom: 'Gourde', type: 'recipient', poids: 0.15, espace: 1,
    contenance: 1, recipient: 'ferme',
    desc: 'Un litre, bouchon à vis, mousqueton au col. Légère, étanche — l\'amie du marcheur, l\'assurance-vie du survivant.',
  },
  thermos: {
    nom: 'Thermos', type: 'recipient', poids: 0.35, espace: 1,
    contenance: 0.5, recipient: 'ferme',
    desc: 'Un demi-litre sous double paroi d\'acier brossé. Le café qu\'il a connu manque à tout le monde.',
  },
  alcool_fort: {
    nom: 'Bouteille d\'alcool fort', type: 'boisson', poids: 0.9, espace: 1,
    soif: -10, special: 'alcool',
    desc: 'Désinfecte les plaies, oublie les morts, ou brûle les vivants. Polyvalent.',
  },

  // ---------- SOINS ----------
  bandage: {
    nom: 'Bandage stérile', type: 'soin', poids: 0.05, espace: 0, soin: 'bandage', qualite: 1,
    desc: 'Encore sous plastique. De l\'or blanc.',
  },
  bandage_fortune: {
    nom: 'Bandage de fortune', type: 'soin', poids: 0.05, espace: 0, soin: 'bandage', qualite: 0.5,
    desc: 'Des chiffons noués. Ça arrête le sang, pas les microbes.',
  },
  desinfectant: {
    nom: 'Désinfectant', type: 'soin', poids: 0.25, espace: 1, soin: 'desinfectant',
    desc: 'Ça pique à hurler. C\'est bon signe. Lance une désinfection qui tient l\'infection à distance des heures durant.',
  },
  lingette: {
    nom: 'Lingettes désinfectantes', type: 'soin', poids: 0.1, espace: 0, soin: 'desinfectant',
    desc: 'Un paquet à moitié plein. Ça nettoie vite et sans eau — une désinfection de terrain, le temps de souffler.',
  },
  antibiotiques: {
    nom: 'Antibiotiques', type: 'soin', poids: 0.05, espace: 0, soin: 'antibio',
    desc: 'La seule chose qui arrête une infection déjà installée.',
  },
  antidouleur: {
    nom: 'Antidouleurs', type: 'soin', poids: 0.05, espace: 0, soin: 'antidouleur',
    desc: 'Le monde devient cotonneux pendant quelques heures.',
  },
  kit_suture: {
    nom: 'Kit de suture', type: 'soin', poids: 0.15, espace: 1, soin: 'suture',
    desc: 'Aiguille courbe et fil. Recoudre sa propre chair demande du cran.',
  },
  savon: {
    nom: 'Savon de Marseille', type: 'soin', poids: 0.3, espace: 0, soin: 'nettoyer',
    desc: 'Un cube vert estampillé « Salon-de-Provence ». Laver une plaie à l\'eau et au savon : la base, depuis toujours. L\'infection prend moins, et recule un peu.',
  },
  vitamines: {
    nom: 'Vitamines', type: 'soin', poids: 0.05, espace: 0, soin: 'vitamines',
    desc: 'Mieux que rien quand on mange des chips depuis trois jours.',
  },
  attelle: {
    nom: 'Attelle', type: 'soin', poids: 0.4, espace: 1, soin: 'bandage', qualite: 1,
    desc: 'Une planche fendue, des chiffons, du scotch. Ça immobilise et ça compresse — du travail propre.',
  },
  tisane_emperi: {
    nom: 'Tisane de l\'Empéri', type: 'soin', poids: 0.3, espace: 1, soin: 'vitamines',
    desc: 'Sauge, thym et millepertuis infusés à la mode Nostradamus. Quatre siècles plus tard, ça soigne encore.',
  },

  // ---------- OUTILS ----------
  ouvre_boite: {
    nom: 'Ouvre-boîte', type: 'outil', poids: 0.1, espace: 0, usage: ['ouvrir'],
    desc: 'Le plus important des objets, d\'après les survivants.',
  },
  briquet: {
    nom: 'Briquet', type: 'outil', poids: 0.02, espace: 0, usage: ['feu'],
    desc: 'À moitié plein. Ou à moitié vide.',
  },
  allumettes: {
    nom: 'Boîte d\'allumettes', type: 'outil', poids: 0.02, espace: 0, usage: ['feu'],
    desc: 'Une vingtaine. Garde-les au sec.',
  },
  lampe_torche: {
    nom: 'Lampe torche', type: 'outil', poids: 0.3, espace: 1, usage: ['lumiere'], besoinPiles: true,
    desc: 'Un cône de lumière dans le noir. Et tout ce que la lumière attire. Sans piles, c\'est un tube de plastique.',
  },
  lampe_frontale: {
    nom: 'Lampe frontale', type: 'outil', poids: 0.15, espace: 0, usage: ['lumiere'], besoinPiles: true,
    desc: 'L\'élastique est distendu mais la LED est vaillante. Les deux mains libres dans le noir — un luxe inestimable.',
  },
  piles: {
    nom: 'Piles', type: 'outil', poids: 0.1, espace: 0,
    desc: 'Encore un peu de jus dedans.',
  },
  casserole: {
    nom: 'Casserole', type: 'outil', poids: 0.7, espace: 2, usage: ['cuisson'],
    contenance: 1.5, recipient: 'ouvert',
    desc: 'Pour faire bouillir l\'eau ou cuire ce que tu attrapes. Pleine, elle se porte à deux mains — pas dans le sac.',
  },
  rechaud_camping: {
    nom: 'Réchaud de camping', type: 'outil', poids: 1.1, espace: 2, usage: ['feu', 'cuisson'], besoinGaz: true,
    desc: 'Avec une cartouche de gaz, un vrai repas chaud.',
  },
  cartouche_gaz: {
    nom: 'Cartouche de gaz', type: 'outil', poids: 0.4, espace: 1,
    desc: 'Secoue-la : il en reste.',
  },
  marteau: {
    nom: 'Marteau', type: 'outil', poids: 0.6, espace: 1, usage: ['construction'],
    dmg: [7, 12], dur: 50, bruit: 1, skill: 'force',
    desc: 'Plante les clous. Peut dépanner en combat.',
  },
  tournevis: {
    nom: 'Tournevis', type: 'outil', poids: 0.15, espace: 0, usage: ['mecanique'],
    dmg: [5, 9], dur: 25, bruit: 0, skill: 'dexterite',
    desc: 'Dans l\'œil, jusqu\'au manche, ça marche aussi.',
  },
  pince_coupante: {
    nom: 'Pince coupante', type: 'outil', poids: 0.8, espace: 1, usage: ['couper_chaine'],
    desc: 'Coupe chaînes et cadenas. La clé universelle.',
  },
  trousse_outils: {
    nom: 'Trousse à outils', type: 'outil', poids: 2.5, espace: 3, usage: ['mecanique', 'construction'],
    desc: 'Clés, pinces, douilles. Le nécessaire du mécano.',
  },
  tuyau_plastique: {
    nom: 'Tuyau en plastique', type: 'outil', poids: 0.3, espace: 1, usage: ['siphon'],
    desc: 'Un mètre de tuyau souple. Pour siphonner les réservoirs.',
  },
  canne_peche: {
    nom: 'Canne à pêche', type: 'outil', poids: 0.8, espace: 2, usage: ['peche'],
    desc: 'Le fil est encore bon. L\'étang du parc regorge de poissons que plus personne ne pêche.',
  },
  collet: {
    nom: 'Collet', type: 'outil', poids: 0.2, espace: 1, usage: ['piege'],
    desc: 'Un nœud coulant en fil de fer. À poser près des terriers.',
  },
  corde: {
    nom: 'Corde', type: 'outil', poids: 0.8, espace: 1, usage: ['escalade'],
    desc: 'Dix mètres de corde solide. Mille usages.',
  },
  torche: {
    nom: 'Torche', type: 'outil', poids: 0.6, espace: 1, usage: ['lumiere', 'feu'],
    desc: 'Des chiffons serrés au bout d\'un manche. Une lumière qui danse — et qui dit à tout le quartier où tu es.',
  },
  piege_sonore: {
    nom: 'Piège sonore', type: 'outil', poids: 0.4, espace: 1, usage: ['alarme'],
    desc: 'Bouteilles, clous et fil de fer tendus en travers d\'un passage. Si quelque chose approche pendant ton sommeil, tu le sauras.',
  },
  nasse: {
    nom: 'Nasse', type: 'outil', poids: 0.6, espace: 2, usage: ['peche'],
    desc: 'Deux bouteilles emboîtées en entonnoir, armées de fil de fer. Posée près de la berge pendant que tu pêches, elle piège ce que ta ligne rate.',
  },
  filtre_fortune: {
    nom: 'Filtre de fortune', type: 'outil', poids: 0.2, espace: 1,
    desc: 'Une bouteille coupée, bourrée de chiffon et gainée de plastique. L\'eau ressort claire — sans feu, sans bruit.',
  },

  // ---------- DÉCHETS (le tout-venant des fouilles : presque rien... presque) ----------
  canette_vide: {
    nom: 'Canette vide', type: 'materiau', poids: 0.02, espace: 0,
    contenance: 0.25, recipient: 'ouvert',
    desc: 'Écrasée, rouillée. Accrochée à un fil, elle fait du bruit — remplie d\'eau, elle fait un quart de litre, à condition de la tenir droite.',
  },
  sac_plastique: {
    nom: 'Sac plastique', type: 'materiau', poids: 0.01, espace: 0,
    desc: 'Il en traîne partout, comme avant. Garde l\'eau dehors — ou dedans.',
  },
  journal_papier: {
    nom: 'Vieux journal', type: 'materiau', poids: 0.1, espace: 0,
    desc: '« L\'ÉTAT D\'URGENCE DÉCRÉTÉ DANS LES BOUCHES-DU-RHÔNE ». Bon allume-feu.',
  },
  cable_electrique: {
    nom: 'Câble électrique', type: 'materiau', poids: 0.3, espace: 1,
    desc: 'Deux mètres de câble arraché d\'un mur. Sous la gaine, du bon fil de cuivre.',
  },
  ressort: {
    nom: 'Ressort', type: 'materiau', poids: 0.1, espace: 0,
    desc: 'Arraché d\'un sommier ou d\'une carcasse de voiture. Un jour, ça servira.',
  },
  visserie: {
    nom: 'Vis et boulons', type: 'materiau', poids: 0.1, espace: 0,
    desc: 'Une poignée de quincaillerie dépareillée au fond d\'une boîte de conserve.',
  },
  telephone_mort: {
    nom: 'Téléphone mort', type: 'materiau', poids: 0.15, espace: 0,
    desc: 'Écran fendu, batterie à plat depuis des semaines. Le dernier SMS restera non lu.',
  },
  portefeuille: {
    nom: 'Portefeuille', type: 'materiau', poids: 0.1, espace: 0,
    desc: 'Cartes bleues, billets, photos de famille. Tout ce qui valait quelque chose ne vaut plus rien.',
  },
  bache_plastique: {
    nom: 'Bâche plastique', type: 'materiau', poids: 0.6, espace: 1,
    desc: 'Une bâche de chantier raide de poussière. Toit, sol, linceul — au choix.',
  },

  // ---------- MATÉRIAUX ----------
  chiffon: {
    nom: 'Chiffon', type: 'materiau', poids: 0.1, espace: 0,
    desc: 'Du tissu déchiré. Bandage, mèche, filtre.',
  },
  planche: {
    nom: 'Planche', type: 'materiau', poids: 1.8, espace: 2,
    desc: 'Du bois brut. Pour barricader ou construire.',
  },
  clous: {
    nom: 'Clous', type: 'materiau', poids: 0.05, espace: 0,
    desc: 'Une poignée de clous rouillés.',
  },
  scotch: {
    nom: 'Rouleau de scotch', type: 'materiau', poids: 0.2, espace: 0,
    desc: 'La civilisation tenait avec ça, en vrai.',
  },
  fil_de_fer: {
    nom: 'Fil de fer', type: 'materiau', poids: 0.2, espace: 0,
    desc: 'Souple et solide. Collets, ligatures, réparations.',
  },
  eclat_verre: {
    nom: 'Éclat de verre', type: 'materiau', poids: 0.2, espace: 0,
    desc: 'Long comme la main, coupant comme un rasoir.',
  },
  manche_balai: {
    nom: 'Manche à balai', type: 'materiau', poids: 0.5, espace: 2,
    desc: 'Un bon manche en bois dur.',
  },
  bouteille_vide: {
    nom: 'Bouteille vide', type: 'materiau', poids: 0.1, espace: 1,
    desc: 'À remplir — d\'eau ou de quelque chose qui brûle.',
  },
  bidon_vide: {
    nom: 'Bidon', type: 'materiau', poids: 0.6, espace: 2,
    contenance: 10, recipient: 'ferme',
    desc: 'Un jerrican de 10 litres, bouchon à baïonnette. Dix kilos d\'eau à ras bord — remplis-le à la mesure de ton dos.',
  },
  appat: {
    nom: 'Appâts', type: 'materiau', poids: 0.1, espace: 0,
    desc: 'Des vers gras déterrés sous une pierre.',
  },
  herbes_simples: {
    nom: 'Herbes médicinales', type: 'materiau', poids: 0.05, espace: 0,
    desc: 'Sauge, thym, millepertuis — cueillis au jardin des Simples ou dans la garrigue. Les vieux remèdes n\'ont pas de date de péremption.',
  },

  // ---------- OBJETS DE QUÊTE ----------
  batterie_camion: {
    nom: 'Batterie de poids lourd', type: 'quete', poids: 14, espace: 4,
    desc: 'Une batterie 24 V encore chargée. Une enclume à transporter — mais c\'est le cœur de la locomotive.',
  },
  bidon_gasoil: {
    nom: 'Bidon de gasoil', type: 'quete', poids: 9, espace: 3,
    desc: '10 litres de gasoil siphonné. Ça pue, ça fuit un peu, et ça vaut plus que de l\'or.',
  },
  cle_locomotive: {
    nom: 'Clé du locotracteur', type: 'quete', poids: 0.05, espace: 0,
    desc: 'Trouvée sur le corps du cheminot. L\'étiquette dit « Y 8000 — Infra, gare de Salon ».',
  },
  carte_quartier: {
    nom: 'Plan de Salon annoté', type: 'quete', poids: 0.05, espace: 0,
    desc: 'Un plan de la ville annoté à la main : abris, dangers, et une flèche vers la gare entourée trois fois.',
  },
  code_armurerie: {
    nom: 'Code de l\'armurerie', type: 'quete', poids: 0, espace: 0,
    desc: 'Un post-it taché de sang : « ARM : 4471 ».',
  },
  journal_conducteur: {
    nom: 'Carnet du cheminot', type: 'lore', poids: 0.1, espace: 0,
    desc: 'Les dernières pages parlent de Miramas-le-Vieux, le village perché. « Le Refuge tient encore. La voie est dégagée jusqu\'au triage. »',
  },

  // ---------- LORE ----------
  photo_famille: {
    nom: 'Photo de famille', type: 'lore', poids: 0, espace: 0,
    desc: 'Des inconnus qui sourient sur une plage. Tu la gardes quand même.',
  },
  radio_portable: {
    nom: 'Radio portable', type: 'lore', poids: 0.4, espace: 1, besoinPiles: true,
    desc: 'Elle ne capte qu\'un message en boucle : « ...Miramas-le-Vieux... le Refuge accueille... suivez la voie ferrée... »',
  },
};

export function item(id) { return ITEMS[id]; }
