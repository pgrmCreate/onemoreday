// ============================================================================
//  VÊTEMENTS & ÉQUIPEMENT PORTÉ
// ============================================================================
// Champs :
//   nom, slot            slot ∈ tete | haut | torse | veste | mains | jambes | pieds | sac | ceinture | holster
//                        Le haut du corps se porte en TROIS COUCHES : haut (t-shirt, chemise), torse (pull, sweat,
//                        polaire), veste (veste, blouson, manteau, gilet, poncho) ; chaleurs et poches s'additionnent.
//   poids                kg (un vêtement porté pèse mais n'occupe pas d'emplacement).
//   espace               POCHES offertes par un vêtement (1 = 1 litre de poches : jean 1, cargo 2, gilet tactique 3).
//                        Les poches ne prennent que les PETITS objets (≤ reglages.inventaire.POCHE_MAX_L).
//   contenance           (sacs) volume utile en LITRES (sac d'écolier 20 L, randonnée 45 L, militaire 55 L).
//                        Une planche (6 L, longue) se porte en main ou dans le dos ; une pelle (10 L) n'entre que dans un grand sac.
//   volume               (optionnel) litres occupés PLIÉ dans un sac (défaut : 0,5 + 2,5 × poids, ou 15 % de la contenance).
//   portage              kg de charge en plus (sacs, harnais).
//   protection 0..4      protection de chaque ZONE couverte (voir `couvre`). Par point : −2 dégâts sur un coup
//                        qui touche cette zone ; 30 % de chance que les dents ne passent pas ; ≥ 2 : une griffure
//                        ne fait plus de plaie (voir reglages.combat.PROTECTION).
//   couvre [zones]       NOUVEAU — les zones du corps protégées (vocabulaire ZONES_CORPS ci-dessous). Si absent : COUVRE_DEFAUT[slot].
//   chaleur              points de chaleur (froid : voir reglages.survie.FROID).
//   agilite              NOUVEAU (ou ±1) — compte comme des niveaux d'agilité (souffle, fuite). Encombrant : −1.
//   bruitPas             NOUVEAU — × bruit de tes pas (rangers 1,2 ; baskets 0,9).
//   impermeable          NOUVEAU — protège de la pluie (pas de +1 froid « mouillé »).
//   ouie                 NOUVEAU — × portée à laquelle TU entends les morts (casque intégral : 0,7).
//   accesRapide          emplacements d'accès rapide (seuls ces objets sont utilisables en combat, avec l'arme en main).
//   tissu                chiffons rendus si on DÉCHIRE le vêtement (cuir, synthétique, métal : rien).
//   desc
// ============================================================================

// Vocabulaire des zones — les attaques des morts (zombies.js) n'emploient QUE ces zones.
export const ZONES_CORPS = [
  'à la tête', 'au visage', 'au cou', 'à l\'épaule', 'au bras', 'à l\'avant-bras', 'à la main',
  'au torse', 'au flanc', 'au ventre', 'dans le dos',
  'à la cuisse', 'au genou', 'au mollet', 'à la cheville', 'au pied',
];
// Zones « jambe » (blessure à une jambe → vitesse de voyage, fuite) et « bras » (fracture → dégâts).
export const ZONES_JAMBE = ['à la cuisse', 'au genou', 'au mollet', 'à la cheville', 'au pied'];
export const ZONES_BRAS = ['à l\'épaule', 'au bras', 'à l\'avant-bras', 'à la main'];

export const COUVRE_DEFAUT = {
  tete: ['à la tête'],
  haut: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'],
  veste: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'],
  torse: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'],
  mains: ['à la main'],
  jambes: ['à la cuisse', 'au genou', 'au mollet'],
  pieds: ['au pied', 'à la cheville'],
  sac: [], ceinture: [], holster: [],
};
const MANCHES = ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule', 'au bras', 'à l\'avant-bras'];

export const CLOTHES = {

  // ---------- TÊTE ----------
  bonnet: {
    nom: 'Bonnet de laine', slot: 'tete', poids: 0.2, espace: 0, protection: 0, chaleur: 2, tissu: 1,
    desc: 'Gratte un peu. Garde les oreilles.',
  },
  casquette: {
    nom: 'Casquette', slot: 'tete', poids: 0.15, espace: 0, protection: 0, chaleur: 1, tissu: 1,
    desc: 'Logo d\'une équipe qui ne jouera plus jamais.',
  },
  casque_chantier: {
    nom: 'Casque de chantier', slot: 'tete', poids: 0.4, espace: 0, protection: 1, chaleur: 0,
    desc: 'Jaune, fendu, la sangle réglée sur la tête d\'un autre. Le poing d\'un mort glisse dessus.',
  },
  casque_fortune: {
    nom: 'Casque de fortune', slot: 'tete', poids: 0.9, espace: 0, protection: 1, chaleur: 1, couvre: ['à la tête', 'au visage'],
    desc: 'Une casserole rembourrée de chiffons, jugulaire en scotch, une visière de plastique découpée. Ridicule jusqu\'au premier coup que tu ne sens pas.',
  },
  casque_pompier: {
    nom: 'Casque de pompier', slot: 'tete', poids: 1.4, espace: 0, protection: 2, chaleur: 1, couvre: ['à la tête', 'au visage'],
    desc: 'Le casque chromé des sapeurs de Salon, visière dorée rabattue. Il a vu des feux. Il verra pire.',
  },
  casque_militaire: {
    nom: 'Casque de combat', slot: 'tete', poids: 1.5, espace: 0, protection: 3, chaleur: 1,
    desc: 'Composite, couvre-casque camouflé, une étiquette « BA 701 » à l\'intérieur. La tête est à l\'abri. Le visage, non.',
  },
  casque_moto: {
    nom: 'Casque de moto intégral', slot: 'tete', poids: 1.5, espace: 0, protection: 3, chaleur: 1, ouie: 0.7,
    couvre: ['à la tête', 'au visage', 'au cou'],
    desc: 'Les dents ne passent pas à travers. La visière est fendue, et tu entends le monde comme au fond d\'une piscine.',
  },

  // ---------- HAUT DU CORPS : trois couches (le haut, puis le pull, puis la veste) ----------
  // couche 1 : le haut
  tshirt: {
    nom: 'T-shirt', slot: 'haut', poids: 0.2, espace: 0, protection: 0, chaleur: 0, tissu: 1,
    desc: 'Du coton fin. Autant dire rien.',
  },
  chemise: {
    nom: 'Chemise', slot: 'haut', poids: 0.3, espace: 1, protection: 0, chaleur: 1, tissu: 2, couvre: MANCHES,
    desc: 'Manches longues, une poche de poitrine, un col qui a connu le fer à repasser. On la porte sous un pull.',
  },
  debardeur: {
    nom: 'Débardeur', slot: 'haut', poids: 0.1, espace: 0, protection: 0, chaleur: 0, tissu: 1,
    desc: 'Pour les jours où le soleil de Provence tape. Les nuits, il ne sert à rien.',
  },
  maillot_thermique: {
    nom: 'Maillot thermique', slot: 'haut', poids: 0.2, espace: 0, protection: 0, chaleur: 2, tissu: 1, couvre: MANCHES,
    desc: 'Le maillot moulant des skieurs et des chasseurs. Sous un pull, il fait toute la différence quand le mistral souffle.',
  },
  // couche 2 : le pull
  polaire: {
    nom: 'Polaire', slot: 'torse', poids: 0.5, espace: 1, protection: 0, chaleur: 3, tissu: 2, couvre: MANCHES,
    desc: 'Une polaire de randonnée, fermée jusqu\'au menton. Légère, et chaude tant qu\'elle reste sèche.',
  },
  gilet_laine: {
    nom: 'Gilet de laine', slot: 'torse', poids: 0.4, espace: 1, protection: 0, chaleur: 2, tissu: 2, couvre: MANCHES,
    desc: 'Boutonné devant, deux poches, des coudes élimés. Le gilet d\'une grand-mère, qui tient chaud comme elle.',
  },
  sweat_capuche: {
    nom: 'Sweat à capuche', slot: 'torse', poids: 0.5, espace: 1, protection: 0, chaleur: 2, tissu: 2, couvre: MANCHES,
    desc: 'Une poche kangourou, une capuche, une odeur de lessive qui s\'en va. Le vêtement de tous les jours d\'avant.',
  },
  pull_laine: {
    nom: 'Pull en laine', slot: 'torse', poids: 0.6, espace: 0, protection: 0, chaleur: 3, tissu: 2, couvre: MANCHES,
    desc: 'Tricoté par quelqu\'un qui aimait quelqu\'un.',
  },
  // couche 3 : la veste (par-dessus tout le reste)
  veste_jean: {
    nom: 'Veste en jean', slot: 'veste', poids: 1.0, espace: 2, protection: 1, chaleur: 1, tissu: 2, couvre: MANCHES,
    desc: 'La toile épaisse arrête une griffure, pas une morsure. Elle a quatre poches, dont une qui ferme.',
  },
  coupe_vent: {
    nom: 'Coupe-vent', slot: 'veste', poids: 0.3, espace: 1, protection: 0, chaleur: 1, impermeable: true, tissu: 1, couvre: MANCHES,
    desc: 'Du nylon fin qui crisse à chaque geste. Il coupe le mistral et la pluie.',
  },
  parka: {
    nom: 'Parka', slot: 'veste', poids: 1.8, espace: 2, protection: 1, chaleur: 4, impermeable: true, tissu: 3, couvre: MANCHES,
    desc: 'Une capuche bordée de fausse fourrure, un tissu huilé. Avec un pull dessous, la nuit dans la Crau devient supportable.',
  },
  doudoune: {
    nom: 'Doudoune', slot: 'veste', poids: 0.8, espace: 2, protection: 0, chaleur: 4, tissu: 2, couvre: MANCHES,
    desc: 'Gonflée comme un pneu. Une griffure et les plumes s\'envolent, mais elle tient chaud comme rien d\'autre.',
  },
  blouse_medicale: {
    nom: 'Blouse d\'hôpital', slot: 'veste', poids: 0.3, espace: 1, protection: 0, chaleur: 0, tissu: 2, couvre: MANCHES,
    desc: 'Blanche, enfin elle l\'était. Un badge au nom d\'une interne. Deux poches, et c\'est tout ce qu\'elle a pour elle.',
  },
  veste_cuir: {
    nom: 'Veste en cuir', slot: 'veste', poids: 2.0, espace: 1, protection: 2, chaleur: 1, couvre: MANCHES,
    desc: 'Le cuir épais arrête les ongles et amortit les dents.',
  },
  blouson_moto: {
    nom: 'Blouson de moto', slot: 'veste', poids: 2.4, espace: 1, protection: 3, chaleur: 2, couvre: MANCHES,
    desc: 'Cuir épais, coques aux coudes et aux épaules. Il a déjà frotté le bitume de la nationale. Il frottera des dents.',
  },
  manteau_hiver: {
    nom: 'Manteau d\'hiver', slot: 'veste', poids: 2.6, espace: 2, protection: 1, chaleur: 4, tissu: 3, agilite: -1, couvre: MANCHES,
    desc: 'Encombrant mais chaud. Le mistral tue autant que les morts.',
  },
  veste_pompier: {
    nom: 'Veste de feu', slot: 'veste', poids: 2.5, espace: 2, protection: 2, chaleur: 3, impermeable: true, couvre: MANCHES,
    desc: 'La veste d\'intervention d\'un sapeur-pompier, bandes réfléchissantes et tissu ignifugé. Ça ne brûle pas, ça ne se déchire pas, ça ne sèche jamais.',
  },
  gilet_tactique: {
    nom: 'Gilet tactique', slot: 'veste', poids: 3.2, espace: 3, protection: 3, chaleur: 0, accesRapide: 2, portage: 2, agilite: -1,
    couvre: ['au torse', 'au flanc', 'au ventre', 'dans le dos'],
    desc: 'Plaques et sangles. Trouvé sur quelqu\'un qui n\'en a plus besoin. Les bras restent nus, mais deux objets restent à portée de main.',
  },
  veste_renforcee: {
    nom: 'Veste renforcée', slot: 'veste', poids: 2.8, espace: 1, protection: 3, chaleur: 1, agilite: -1, couvre: MANCHES,
    desc: 'Une veste en cuir cousue de fil de fer et de plaques de fortune. Lourde, raide, rassurante.',
  },
  poncho_pluie: {
    nom: 'Poncho de pluie', slot: 'veste', poids: 0.5, espace: 0, protection: 0, chaleur: 1, impermeable: true,
    desc: 'Une bâche de chantier découpée et scotchée aux épaules. Tu ressembles à un sac poubelle, mais un sac poubelle sec.',
  },

  // ---------- MAINS (et avant-bras) ----------
  gants_laine: {
    nom: 'Gants de laine', slot: 'mains', poids: 0.1, espace: 0, protection: 0, chaleur: 2, tissu: 1,
    desc: 'Doigts au chaud, prise moyenne.',
  },
  gants_cuir: {
    nom: 'Gants de cuir', slot: 'mains', poids: 0.25, espace: 0, protection: 1, chaleur: 1,
    desc: 'Protègent des éclats de verre et des griffures superficielles.',
  },
  gants_renforces: {
    nom: 'Gants renforcés', slot: 'mains', poids: 0.45, espace: 0, protection: 2, chaleur: 1, couvre: ['à la main', 'à l\'avant-bras'],
    desc: 'Du cuir doublé de fil de fer tressé, remonté en manchette jusqu\'au coude. Les dents glissent dessus.',
  },
  brassards_journaux: {
    nom: 'Brassards de magazines', slot: 'mains', poids: 0.6, espace: 0, protection: 2, chaleur: 1, couvre: ['à l\'avant-bras', 'à la main'],
    desc: 'Des magazines télé roulés serré autour des avant-bras, scotchés jusqu\'aux doigts. Trois cents pages de programmes que personne ne regardera. Les dents s\'y cassent.',
  },

  // ---------- JAMBES ----------
  jogging: {
    nom: 'Pantalon de jogging', slot: 'jambes', poids: 0.4, espace: 0, protection: 0, chaleur: 1, agilite: 1, tissu: 2,
    desc: 'Souple. On court bien dedans.',
  },
  jean: {
    nom: 'Jean', slot: 'jambes', poids: 0.7, espace: 1, protection: 1, chaleur: 1, tissu: 2,
    desc: 'La toile épaisse a déjà sauvé bien des mollets.',
  },
  pantalon_cargo: {
    nom: 'Pantalon cargo', slot: 'jambes', poids: 0.8, espace: 2, protection: 1, chaleur: 1, tissu: 2,
    desc: 'Des poches partout. Le vêtement du pillard.',
  },
  treillis: {
    nom: 'Pantalon de treillis', slot: 'jambes', poids: 0.9, espace: 2, protection: 1, chaleur: 2, tissu: 2,
    desc: 'Toile ripstop, genoux renforcés, poches à rabat. Il a été repassé, un jour.',
  },
  jean_genouilleres: {
    nom: 'Jean à jambières', slot: 'jambes', poids: 1.1, espace: 1, protection: 2, chaleur: 1, tissu: 2,
    desc: 'Un jean blindé de journaux pliés et de chiffons scotchés aux genoux et aux tibias. Les rampants mordent là d\'abord.',
  },

  // ---------- PIEDS ----------
  baskets: {
    nom: 'Baskets', slot: 'pieds', poids: 0.6, espace: 0, protection: 0, chaleur: 0, agilite: 1, bruitPas: 0.9,
    desc: 'Silencieuses et rapides.',
  },
  rangers: {
    nom: 'Rangers', slot: 'pieds', poids: 1.4, espace: 0, protection: 2, chaleur: 1, bruitPas: 1.2,
    desc: 'Bouts coqués. Écraser une tête ne laisse même pas de marque dessus. On t\'entend venir.',
  },
  bottes_cuir: {
    nom: 'Bottes en cuir', slot: 'pieds', poids: 1.2, espace: 0, protection: 2, chaleur: 2, couvre: ['au pied', 'à la cheville', 'au mollet'],
    desc: 'Montantes jusqu\'au mollet. Les chevilles sont la cible préférée des rampants.',
  },
  bottes_caoutchouc: {
    nom: 'Bottes en caoutchouc', slot: 'pieds', poids: 1.3, espace: 0, protection: 1, chaleur: 1, impermeable: true, bruitPas: 1.1,
    couvre: ['au pied', 'à la cheville', 'au mollet'],
    desc: 'Les bottes vertes du jardinier, montantes. Elles couinent à chaque pas et ne laissent rien passer — ni l\'eau, ni les incisives.',
  },

  // ---------- CEINTURES ----------
  // Sans ceinture (ou holster, gilet, sac militaire), AUCUN objet en accès rapide :
  // en combat, tu te bats avec ce que tu as en main, point.
  ceinture_fortune: {
    nom: 'Ceinture de fortune', slot: 'ceinture', poids: 0.3, espace: 0, protection: 0, chaleur: 0, accesRapide: 1,
    desc: 'De la corde et du scotch. Un objet coincé dedans, à portée de main.',
  },
  ceinture_cuir: {
    nom: 'Ceinture en cuir', slot: 'ceinture', poids: 0.4, espace: 0, protection: 0, chaleur: 0, accesRapide: 2,
    desc: 'Une bonne ceinture épaisse. Deux objets glissés dedans, dégainés en une seconde.',
  },
  ceinture_outils: {
    nom: 'Ceinture porte-outils', slot: 'ceinture', poids: 0.9, espace: 1, protection: 0, chaleur: 0, accesRapide: 3, portage: 1,
    desc: 'Boucles, étuis, mousquetons. Le harnais d\'un artisan — ou d\'un survivant organisé.',
  },
  ceinture_renforcee: {
    nom: 'Ceinture renforcée', slot: 'ceinture', poids: 0.6, espace: 0, protection: 0, chaleur: 0, accesRapide: 3,
    desc: 'Une ceinture en cuir doublée de boucles en fil de fer scotché. Trois objets calés contre les reins, dégainés sans regarder.',
  },

  // ---------- HOLSTERS ----------
  holster_cuisse: {
    nom: 'Holster de cuisse', slot: 'holster', poids: 0.4, espace: 0, protection: 0, chaleur: 0, accesRapide: 1,
    desc: 'Sanglé sur la cuisse. Une arme de plus, prête à sortir.',
  },
  holster_fortune: {
    nom: 'Holster de fortune', slot: 'holster', poids: 0.25, espace: 0, protection: 0, chaleur: 0, accesRapide: 1, tissu: 1,
    desc: 'Des chiffons cousus en étui, noués à la cuisse par de la corde. Pas élégant, mais l\'objet sort vite.',
  },

  // ---------- SACS ----------
  // Sans sac : les poches, les bras, et c'est tout. Chaque sac donne de l'ESPACE
  // (emplacements) et du PORTAGE (kg en plus). Le joueur les découvre en fouillant :
  // chaque type de lieu a les siens (cartable au lycée, valise à la gare, hotte au village…).
  cabas_courses: {
    nom: 'Cabas de courses', slot: 'sac', poids: 0.2, espace: 3, contenance: 12, protection: 0, chaleur: 0, portage: 2,
    desc: 'Un cabas réutilisable « préservons la planète ». La planète a d\'autres soucis, mais il porte encore.',
  },
  sac_fortune: {
    nom: 'Sac de fortune', slot: 'sac', poids: 0.3, espace: 3, contenance: 12, protection: 0, chaleur: 0, portage: 2, tissu: 2,
    desc: 'Des chiffons cousus à la corde. Moche, fragile, mais des poches sont des poches.',
  },
  sacoche: {
    nom: 'Sacoche en bandoulière', slot: 'sac', poids: 0.5, espace: 4, contenance: 10, protection: 0, chaleur: 0, portage: 3,
    desc: 'Petite mais pratique. Elle bat contre la hanche quand tu cours.',
  },
  sac_a_dos: {
    nom: 'Sac à dos d\'écolier', slot: 'sac', poids: 0.9, espace: 6, contenance: 20, protection: 0, chaleur: 0, portage: 5,
    desc: 'Un cartable à bretelles, des initiales au feutre sur le rabat. Le cartable de la fin du monde.',
  },
  sac_randonnee: {
    nom: 'Sac de randonnée', slot: 'sac', poids: 2.0, espace: 10, contenance: 45, protection: 0, chaleur: 0, portage: 8, agilite: -1,
    desc: '45 litres, armatures et sangle ventrale. Tout ce que tu possèdes tiendra dedans — et tout ça te tirera en arrière quand il faudra courir.',
  },
  sac_militaire: {
    nom: 'Sac militaire', slot: 'sac', poids: 2.6, espace: 12, contenance: 55, protection: 0, chaleur: 0, portage: 10, accesRapide: 1, agilite: -1,
    desc: 'Un sac de paquetage de la base aérienne 701. Sanglé serré, il porte une maison — et garde un objet à portée de main.',
  },
  sac_banane: {
    nom: 'Sac banane', slot: 'sac', poids: 0.2, espace: 2, contenance: 2, protection: 0, chaleur: 0, portage: 1, accesRapide: 1,
    desc: 'Ridicule il y a un mois. Aujourd\'hui : deux litres de plus, et un objet toujours sous la main.',
  },
  tote_bag: {
    nom: 'Tote bag en toile', slot: 'sac', poids: 0.15, espace: 2, contenance: 10, protection: 0, chaleur: 0, portage: 1, tissu: 1,
    desc: '« Lire, c\'est vivre deux fois. » Imprimé sur une toile fine qui ne supportera pas grand-chose.',
  },
  sac_enfant: {
    nom: 'Petit sac à dos d\'enfant', slot: 'sac', poids: 0.3, espace: 2, contenance: 8, protection: 0, chaleur: 0, portage: 2,
    desc: 'Une tête de lapin en peluche, des bretelles trop courtes. Tu évites de te demander à qui il était.',
  },
  sac_main: {
    nom: 'Sac à main', slot: 'sac', poids: 0.5, espace: 3, contenance: 6, protection: 0, chaleur: 0, portage: 2,
    desc: 'Cuir verni, fermoir doré. Il contenait un rouge à lèvres et des clés. Il contiendra des piles.',
  },
  sac_trail: {
    nom: 'Gilet d\'hydratation de trail', slot: 'sac', poids: 0.4, espace: 3, contenance: 8, protection: 0, chaleur: 0, portage: 3,
    desc: 'Collé au dos, il ne ballotte pas. Peu de place, mais tu cours avec comme sans.',
  },
  sac_jute: {
    nom: 'Sac de jute', slot: 'sac', poids: 0.4, espace: 4, contenance: 30, protection: 0, chaleur: 0, portage: 2, tissu: 2,
    desc: 'Un ancien sac à pommes de terre, noué d\'une ficelle en guise de bretelle. Ça gratte, ça tient.',
  },
  // Sac de fortune noué (js/data/recipes.js : r_baluchon, r_baluchon_couverture) : un drap suffit.
  baluchon: {
    nom: 'Baluchon', slot: 'sac', poids: 0.5, espace: 3, contenance: 12, protection: 0, chaleur: 0, portage: 1, tissu: 4,
    desc: "Un drap noué aux quatre coins, passé sur l'épaule. Tout s'y entasse en boule et il faut le dénouer pour retrouver quoi que ce soit, mais il porte.",
  },
  musette: {
    nom: 'Musette de l\'armée', slot: 'sac', poids: 0.6, espace: 4, contenance: 15, protection: 0, chaleur: 0, portage: 4,
    desc: 'Toile kaki, boucles en laiton, un numéro de matricule effacé. Elle a déjà fait une guerre.',
  },
  sac_isotherme: {
    nom: 'Sac isotherme', slot: 'sac', poids: 0.6, espace: 4, contenance: 15, protection: 0, chaleur: 0, portage: 3,
    desc: 'Le sac des pique-niques en Camargue. Le froid ne tient plus, mais les compartiments, si.',
  },
  sac_ordinateur: {
    nom: 'Sacoche d\'ordinateur', slot: 'sac', poids: 0.8, espace: 4, contenance: 12, protection: 0, chaleur: 0, portage: 3,
    desc: 'Rembourrée, pleine de poches pour des câbles qui ne servent plus à rien.',
  },
  sacoche_facteur: {
    nom: 'Sacoche de facteur', slot: 'sac', poids: 0.7, espace: 5, contenance: 18, protection: 0, chaleur: 0, portage: 4,
    desc: 'Jaune et bleue, encore pleine de lettres jamais distribuées. Tu les vides. Tu en gardes une.',
  },
  gibeciere: {
    nom: 'Gibecière de chasseur', slot: 'sac', poids: 0.9, espace: 5, contenance: 18, protection: 0, chaleur: 0, portage: 5,
    desc: 'Cuir épais et filet à gibier. Elle sent la poudre et la garrigue.',
  },
  cartable_cuir: {
    nom: 'Cartable en cuir', slot: 'sac', poids: 1.0, espace: 5, contenance: 14, protection: 0, chaleur: 0, portage: 4,
    desc: 'Le cartable d\'un professeur, usé aux coins. Solide comme on n\'en fait plus.',
  },
  sac_photo: {
    nom: 'Sac de photographe', slot: 'sac', poids: 0.9, espace: 5, contenance: 14, protection: 0, chaleur: 0, portage: 4, accesRapide: 1,
    desc: 'Compartiments réglables et ouverture sur le côté : ce que tu ranges là sort en une seconde.',
  },
  sac_sport: {
    nom: 'Sac de sport', slot: 'sac', poids: 0.8, espace: 7, contenance: 35, protection: 0, chaleur: 0, portage: 5,
    desc: 'Un polochon de club de foot, porté en bandoulière. Il cogne la jambe, mais il avale tout.',
  },
  sac_voyage: {
    nom: 'Sac de voyage', slot: 'sac', poids: 1.2, espace: 8, contenance: 40, protection: 0, chaleur: 0, portage: 6, agilite: -1,
    desc: 'L\'étiquette d\'un vol pour Lisbonne est encore attachée à la poignée. Quelqu\'un n\'est jamais parti.',
  },
  sac_samu: {
    nom: 'Sac d\'intervention du SAMU', slot: 'sac', poids: 1.4, espace: 8, contenance: 30, protection: 0, chaleur: 0, portage: 6, accesRapide: 1,
    desc: 'Rouge, rigide, compartimenté. Fait pour sauver des gens en courant.',
  },
  hotte_vendange: {
    nom: 'Hotte de vendangeur', slot: 'sac', poids: 1.8, espace: 9, contenance: 40, protection: 0, chaleur: 0, portage: 8, agilite: -1,
    desc: 'Une hotte en plastique dur, encore tachée de raisin. Elle porte lourd et cogne les cadres de porte.',
  },
  sac_livreur: {
    nom: 'Sac cube de livreur', slot: 'sac', poids: 1.3, espace: 9, contenance: 45, protection: 0, chaleur: 0, portage: 6, agilite: -1,
    desc: 'Une grande boîte isotherme à bretelles, au logo d\'une appli de livraison. Énorme, carrée, voyante.',
  },
  sac_police: {
    nom: 'Sac d\'intervention de la police', slot: 'sac', poids: 1.8, espace: 9, contenance: 40, protection: 0, chaleur: 0, portage: 8, accesRapide: 1,
    desc: 'Noir, renforcé, « POLICE » en lettres blanches. Plusieurs sangles pour garder l\'essentiel à portée.',
  },
  sac_alpinisme: {
    nom: 'Sac d\'alpinisme', slot: 'sac', poids: 1.5, espace: 9, contenance: 50, protection: 0, chaleur: 0, portage: 9,
    desc: '50 litres, dos ventilé, bien serré au corps. Il ne gêne presque pas quand tu dois courir.',
  },
  valise_cabine: {
    nom: 'Valise cabine', slot: 'sac', poids: 3.0, espace: 11, contenance: 40, protection: 0, chaleur: 0, portage: 9, agilite: -2,
    desc: 'À roulettes, poignée télescopique. Beaucoup de place, et un bruit de roulettes sur les pavés que tout le quartier entend.',
  },
  sac_expedition: {
    nom: 'Sac d\'expédition', slot: 'sac', poids: 2.9, espace: 14, contenance: 70, protection: 0, chaleur: 0, portage: 12, agilite: -2,
    desc: '70 litres. Le sac de quelqu\'un qui partait pour un mois dans les Alpes. Une maison sur le dos — et lourde.',
  },
};


export const SLOTS = {
  tete: 'Tête', haut: 'Haut', torse: 'Pull', veste: 'Veste', mains: 'Mains',
  jambes: 'Jambes', pieds: 'Pieds', sac: 'Sac',
  ceinture: 'Ceinture', holster: 'Holster',
};

export function cloth(id) { return CLOTHES[id] || null; }
// Zones couvertes par un vêtement (champ `couvre`, sinon celles de son slot).
export function zonesCouvertes(id) {
  const c = CLOTHES[id];
  if (!c) return [];
  return c.couvre || COUVRE_DEFAUT[c.slot] || [];
}
