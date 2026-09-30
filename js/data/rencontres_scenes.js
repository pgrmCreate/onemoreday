// ============================================================================
//  SCÈNES DES RENCONTRES DE VOYAGE — format REFONTE §4.5 (fusionnées dans SCENES par l'intégrateur)
// ============================================================================
// Toutes les ids commencent par 'rv_' (pas de collision avec les scènes du scénariste).
// Extensions utilisées ici (documentées dans docs/GAMEPLAY.md §Temps 2) :
//   choix.texte          texte de RÉSULTAT d'un choix sans test (affiché comme reussite.texte, puis `suivant`).
//   effets.detour: m     voyage : ajoute m mètres au trajet restant.
//   effets.demiTour      voyage : le joueur rebrousse chemin (retour = distance déjà parcourue).
//   effets.butin         { table: 'voyage.<cat>', n } : tire dans js/data/butin.js (tirerButinTable).
//   effets.combat.surprise  le combat commence avec la menace « surpris » (reglages.combat.MENACE_DEPART).
//   suivant '#combat'    la scène se ferme et lance le combat décrit par effets.combat.
// Les tests affichent leur pourcentage (reglages.scenes.TEST) : { skill, difficulte } ou { chance }.
// `{masculin|féminin}` est remplacé selon le genre du joueur.
// ============================================================================

const FIN = '#fin';
const COMBAT = '#combat';
const ARME_LONGUE = { ou: [{ objet: 'lance_artisanale' }, { objet: 'lance_renforcee' }, { objet: 'pelle' }] };
const LAME = { ou: [{ objet: 'couteau_cuisine' }, { objet: 'couteau_combat' }, { objet: 'couteau_artisanal' }, { objet: 'machette' }, { objet: 'machette_aiguisee' }, { objet: 'hache_pompier' }, { objet: 'sabre_cavalerie' }] };
const ARME_DE_TIR = { ou: [{ objet: 'pistolet_9mm' }, { objet: 'fusil_chasse' }, { objet: 'fusil_assaut' }, { objet: 'arbalete_fortune' }] };

export const SCENES_RENCONTRES = {

  // ═══════════════════════════ SALON ═══════════════════════════
  rv_horde_carrefour: {
    illu: 'carrefour', musique: 'tension', orateur: null,
    texte: "Le carrefour est noir de monde. Une ambulance couchée sur le flanc, portes arrière béantes, et autour, trente corps debout, peut-être plus, qui oscillent sur place comme un champ de blé mort.\n\nQuelque chose dans l'ambulance les retient là. Tu ne veux pas savoir quoi. Ta route passe de l'autre côté.",
    choix: [
      {
        label: 'Contourner par les ruelles (+400 m)',
        texte: "Tu recules sans te retourner, un pas après l'autre, jusqu'au coin de la rue. Trois pâtés de maisons de détour, les épaules raides, à guetter chaque porte cochère.",
        effets: { detour: 400 }, suivant: FIN,
      },
      {
        label: 'Lancer une bouteille au loin pour les attirer',
        besoin: { objet: 'bouteille_vide' },
        texte: "La bouteille décrit une longue courbe et explose contre une vitrine, deux rues plus loin. Trente têtes pivotent ensemble. Le champ de blé se met en marche, lentement, vers le bruit. Tu traverses derrière eux, sur la pointe des pieds.",
        effets: { objet: ['bouteille_vide', -1], xp: { discretion: 6 } }, suivant: FIN,
      },
      {
        label: 'Ramper sous les voitures garées',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Châssis après châssis, le nez dans l'huile de vidange et le verre pilé, tu traverses sous trente paires de jambes. De l'autre côté, tes coudes saignent un peu. Tu es passé{|e}.",
          effets: { sta: -15, xp: { discretion: 10 } }, suivant: FIN,
        },
        echec: {
          texte: "Sous la troisième voiture, une odeur te prévient une demi-seconde trop tard. Il vit là, dans l'ombre du châssis, sectionné à la taille. Ses doigts se referment sur ta cheville.",
          effets: { combat: { zombies: ['rampant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Foncer en longeant les façades',
        test: { skill: 'agilite', difficulte: 2 },
        reussite: {
          texte: "Tu cours. Des têtes se tournent, des bras se tendent, trop lents. Tu passes, le cœur au bord des lèvres, et tu ne t'arrêtes qu'au bout de la rue.",
          effets: { sta: -30, xp: { agilite: 8 } }, suivant: FIN,
        },
        echec: {
          texte: "Tu cours — et un bras te fauche au passage. Tu roules, tu te relèves, mais ils sont déjà deux sur toi.",
          effets: { combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
    ],
  },

  rv_alarme_voiture: {
    illu: 'voiture', musique: 'tension', orateur: null,
    texte: "Un 4x4 abandonné au milieu du carrefour, vitres intactes. Sur la banquette arrière, des sacs de courses jamais déballés.\n\nMais le voyant rouge de l'alarme clignote encore sous le pare-brise. La batterie n'est pas morte, elle.",
    choix: [
      {
        label: 'Couper l\'alarme par le capot',
        besoin: { skill: ['mecanique', 1] },
        test: { skill: 'mecanique', difficulte: 1 },
        reussite: {
          texte: "Tu glisses la main sous le capot entrouvert et tu arraches la cosse. Le voyant s'éteint. La vitre cède sans un cri, et tu fais tes courses dans le silence.",
          effets: { objets: [['conserve_haricots', 1], ['soda', 1]], butin: { table: 'voyage.voiture', n: 1 }, xp: { mecanique: 12 }, tempsMin: 15 }, suivant: FIN,
        },
        echec: {
          texte: "Ton tournevis ripe. L'alarme explose dans la rue déserte, stridente, obscène. Des silhouettes se décollent des murs, une à une, et convergent.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Briser la vitre et rafler un sac',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "La vitre éclate, l'alarme hurle. Tu as déjà plongé à mi-corps dans l'habitacle. Dix secondes pour rafler un sac, et tu cours sans te retourner pendant que toute la rue se réveille derrière toi.",
          effets: { objets: [['soda', 1], ['biscuits', 1]], sta: -20, bruit: 3, xp: { agilite: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "L'alarme te vrille les tympans. Le temps d'attraper un sac, une main grise agrippe ton col par la portière opposée. Il était couché sur le plancher, à attendre.",
          effets: { objet: ['biscuits', 1], bruit: 3, combat: { zombies: ['errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer au large',
        texte: "Des courses en boîte contre une sirène qui ameute le quartier. Le calcul est vite fait. Tu contournes.",
        effets: { detour: 100 }, suivant: FIN,
      },
    ],
  },

  rv_rampant_voiture: {
    illu: 'voiture', musique: 'sombre', orateur: null,
    texte: "Une petite voiture portière ouverte, le moteur froid depuis longtemps. Sur le siège passager, un sac à dos.\n\nSous la voiture, une traînée noire part vers l'arrière. Elle ne ressort pas.",
    choix: [
      {
        label: 'Taper sous le châssis avec une arme longue',
        besoin: ARME_LONGUE,
        texte: "Tu enfonces le bout sous le bas de caisse, à l'aveugle, jusqu'à sentir une résistance molle. Quelque chose gargouille, se débat, et s'arrête. Le sac est à toi.",
        effets: { butin: { table: 'voyage.cadavre', n: 2 }, xp: { dexterite: 4 } }, suivant: FIN,
      },
      {
        label: 'Prendre le sac, vite',
        test: { chance: 0.5 },
        reussite: {
          texte: "Tu attrapes le sac par une bretelle et tu recules de trois pas. Rien ne bouge sous la voiture. Peut-être que la traînée est vieille. Peut-être pas.",
          effets: { butin: { table: 'voyage.cadavre', n: 2 } }, suivant: FIN,
        },
        echec: {
          texte: "Ta main se referme sur la bretelle au moment où une autre se referme sur ta cheville.",
          effets: { butin: { table: 'voyage.cadavre', n: 2 }, combat: { zombies: ['rampant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Le faire sortir et l\'affronter',
        texte: "Tu cognes du pied contre l'aile. Une main noire jaillit de sous la voiture et racle le bitume vers toi.",
        effets: { butin: { table: 'voyage.cadavre', n: 2 }, combat: { zombies: ['rampant'] } }, suivant: COMBAT,
      },
      {
        label: 'Laisser la voiture',
        texte: "Un sac à dos contre une cheville. Tu passes.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_hurleur_balcon: {
    illu: 'facade', musique: 'tension', orateur: null,
    texte: "Au deuxième étage, sur un balcon de géraniums morts, une silhouette se penche par-dessus la rambarde. La gorge ouverte jusqu'aux clavicules, qui palpite.\n\nElle ne t'a pas encore vu{|e}. Si elle crie, tout le quartier saura où tu es.",
    choix: [
      {
        label: 'Passer juste en dessous, accroupi{|e}',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu longes le mur, pile sous le balcon, là où elle ne peut pas regarder. Une goutte noire s'écrase à côté de ta chaussure. Puis c'est la rue suivante.",
          effets: { xp: { discretion: 8 } }, suivant: FIN,
        },
        echec: {
          texte: "Un éclat de verre crisse sous ta semelle. Là-haut, la tête pivote. Le cri te traverse de part en part, et au bout de la rue des portes se mettent à cogner.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'coureur'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'L\'abattre avant qu\'elle crie',
        si: ARME_DE_TIR,
        test: { skill: 'visee', difficulte: 1 },
        reussite: {
          texte: "Un seul tir. La silhouette bascule par-dessus la rambarde et s'écrase entre deux poubelles. Personne d'autre ne répond. Cette fois.",
          effets: { xp: { visee: 8 }, bruit: 2 }, suivant: FIN,
        },
        echec: {
          texte: "Tu la manques. Elle crie. Évidemment qu'elle crie.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire un détour (+250 m)',
        texte: "Tu fais demi-tour avant qu'elle ne tourne la tête, et tu prends la rue parallèle. Longtemps, tu crois entendre le cri qu'elle n'a pas poussé.",
        effets: { detour: 250 }, suivant: FIN,
      },
    ],
  },

  rv_gonfleur_ruelle: {
    illu: 'ruelle', musique: 'sombre', orateur: null,
    texte: "La ruelle est bouchée. Un gonflé s'est coincé entre deux poubelles, la panse contre le mur, tendue comme un ballon d'eau.\n\nIl te sent. Il se retourne, lentement, dans un bruit de ventre.",
    choix: [
      {
        label: 'Le crever à bout de bras',
        si: { ou: [ARME_LONGUE, ARME_DE_TIR] },
        texte: "Tu le perces à distance. Il éclate contre le mur dans un souffle chaud et vert. Tu retiens ta respiration trop tard ; tu vomis quand même. Mais tu es propre.",
        effets: { sta: -10, xp: { dexterite: 4 } }, suivant: FIN,
      },
      {
        label: 'Lui jeter une brique',
        besoin: { objet: 'brique' },
        test: { chance: 0.6 },
        reussite: {
          texte: "La brique lui entre dans le ventre. Il éclate à trois mètres de toi. L'odeur te plie en deux. Tu passes en apnée.",
          effets: { objet: ['brique', -1], sta: -5 }, suivant: FIN,
        },
        echec: {
          texte: "La brique rebondit sur son crâne. Il avance. Il est déjà trop près.",
          effets: { objet: ['brique', -1], combat: { zombies: ['gonfleur'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire le tour (+300 m)',
        texte: "Il y a des combats qui ne valent pas la peine d'être gagnés.",
        effets: { detour: 300 }, suivant: FIN,
      },
      {
        label: 'L\'affronter',
        texte: "Tu serres ton arme. Il clapote vers toi.",
        effets: { combat: { zombies: ['gonfleur'] } }, suivant: COMBAT,
      },
    ],
  },

  rv_pillards_barrage: {
    illu: 'barricade', musique: 'tension', orateur: 'Les pillards',
    texte: "Un bus en travers de la rue, des palettes, des barbelés. Derrière, deux hommes et une femme. Un fusil de chasse, une arbalète.\n\n« Péage. Tu payes, tu passes. »\n\nLa femme ne te regarde pas. Elle regarde tes mains.",
    choix: [
      {
        label: 'Donner deux conserves',
        besoin: { objet: ['conserve_haricots', 2] },
        texte: "Tu poses les boîtes sur le capot du bus. L'homme au fusil les soupèse, hoche la tête. On t'ouvre un passage entre les palettes, juste assez large pour toi.",
        effets: { objet: ['conserve_haricots', -2] }, suivant: FIN,
      },
      {
        label: 'Donner une bouteille d\'alcool',
        besoin: { objet: 'alcool_fort' },
        texte: "« Ça, ça passe. » La bouteille disparaît derrière le bus. Tu entends le bouchon sauter avant d'avoir franchi les barbelés.",
        effets: { objet: ['alcool_fort', -1] }, suivant: FIN,
      },
      {
        label: 'Contourner par les jardins (+350 m)',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu passes par-dessus un grillage, puis un autre, entre les balançoires rouillées et les piscines vertes. Personne ne te voit.",
          effets: { detour: 350, xp: { discretion: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "Un carreau d'arbalète se plante dans le grillage, à dix centimètres de ta tête. « La prochaine est pour toi. » Tu recules.",
          effets: { sta: -10, demiTour: true }, suivant: FIN,
        },
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu lèves les mains et tu recules. Ils ne te suivent pas. Ils n'ont pas besoin.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_fil_tendu: {
    illu: 'rue', musique: 'sombre', orateur: null,
    texte: "La rue est trop propre. Quelqu'un a balayé les débris sur toute la largeur, d'un trottoir à l'autre.\n\nPersonne ne balaie plus rien.",
    choix: [
      {
        label: 'Ralentir et regarder où tu mets les pieds',
        texte: "Un fil de pêche tendu à hauteur de cheville entre deux lampadaires, relié à des canettes et à un parpaing en équilibre sur un balcon. Tu l'enjambes. Puis tu reviens le couper et tu l'enroules : ça peut servir.",
        effets: { objet: ['fil_de_fer', 1], tempsMin: 5, xp: { discretion: 4 } }, suivant: FIN,
      },
      {
        label: 'Ne pas ralentir',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "Quelque chose accroche ta cheville et cède. Des canettes dégringolent, un parpaing s'écrase derrière toi. Tu cours déjà.",
          effets: { bruit: 2, sta: -10 }, suivant: FIN,
        },
        echec: {
          texte: "Ton pied accroche le fil. Tu t'étales de tout ton long pendant que le parpaing éclate sur le trottoir, à côté de ta tête. Ton genou, lui, a pris.",
          effets: { pv: -6, blessure: { type: 'contusion', zone: 'au genou' }, bruit: 2 }, suivant: FIN,
        },
      },
    ],
  },

  rv_colosse_barrage: {
    illu: 'barrage_police', musique: 'tension', orateur: null,
    texte: "Un barrage de police : deux fourgons, des barrières, un camion à canon à eau. Au milieu, debout, immobile, un CRS en tenue complète. Deux mètres. La visière baissée.\n\nIl ne bouge pas. Il ne bouge pas encore.",
    choix: [
      {
        label: 'Passer entre les fourgons, sans bruit',
        test: { skill: 'discretion', difficulte: 2 },
        reussite: {
          texte: "Tu te glisses entre les tôles, le dos contre la carrosserie. Tu passes à quatre mètres de lui. Il sent quelque chose : la visière tourne d'un cran. Puis tu es de l'autre côté.",
          effets: { xp: { discretion: 12 } }, suivant: FIN,
        },
        echec: {
          texte: "Ta manche accroche une barrière. Le métal grince. La visière se tourne, lentement, entièrement, vers toi.",
          effets: { combat: { zombies: ['colosse'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Fouiller un fourgon dans son dos',
        test: { skill: 'discretion', difficulte: 2 },
        reussite: {
          texte: "Porte latérale, trousse de secours, un carton de munitions. Tu refermes aussi doucement que tu as ouvert. Il n'a pas bougé.",
          effets: { objets: [['munitions_9mm', 6], ['bandage', 2]], tempsMin: 10, xp: { discretion: 10 } }, suivant: FIN,
        },
        echec: {
          texte: "La porte latérale coulisse dans un fracas de rails rouillés. Derrière toi, un pas. Un seul. Le sol vibre.",
          effets: { objet: ['bandage', 1], combat: { zombies: ['colosse'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire le grand tour (+500 m)',
        texte: "Deux mètres de muscle mort sous les coques de protection. Non.",
        effets: { detour: 500 }, suivant: FIN,
      },
    ],
  },

  rv_ambulance: {
    illu: 'ambulance', musique: 'sombre', orateur: null,
    texte: "Une ambulance, gyrophare mort, portes arrière entrouvertes. À l'intérieur, sur le brancard, une forme sanglée sous un drap. Le drap bouge. Doucement.\n\nLes casiers sur les côtés sont encore fermés.",
    choix: [
      {
        label: 'Achever la forme d\'abord',
        texte: "Tu appuies le drap sur son visage et tu frappes à travers. Une fois. Deux fois. Le tissu rougit, puis ne bouge plus. Tu mets longtemps à ouvrir les casiers : tes mains tremblent.",
        effets: { butin: { table: 'voyage.secours', n: 2 }, tempsMin: 10 }, suivant: FIN,
      },
      {
        label: 'Ouvrir les casiers sans la réveiller',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Un casier, deux casiers. Le drap se soulève au rythme de quelque chose qui n'est pas une respiration. Tu repars les bras pleins.",
          effets: { butin: { table: 'voyage.secours', n: 2 }, xp: { discretion: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "Le loquet claque. Sous le drap, la forme se cabre et la sangle du torse cède, puis celle des jambes.",
          effets: { butin: { table: 'voyage.secours', n: 1 }, combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Laisser l\'ambulance',
        texte: "Tu refermes doucement les portes arrière. Quelqu'un d'autre ouvrira les casiers. Ou personne.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_incendie: {
    illu: 'incendie', musique: 'tension', orateur: null,
    texte: "Une fumée noire barre la rue. Un immeuble brûle, lentement, sans pompiers, depuis on ne sait quand. La chaleur te gifle à trente mètres.\n\nDerrière la fumée, ta route.",
    choix: [
      {
        label: 'Traverser la fumée en apnée',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "Tu fonces, un chiffon sur la bouche, les yeux fermés. Trente mètres de nuit brûlante. Tu ressors en toussant, noir{|e} de suie. Vivant{|e}.",
          effets: { sta: -20, pv: -3 }, suivant: FIN,
        },
        echec: {
          texte: "Tu perds le trottoir dans la fumée, tu te cognes à une voiture, tu respires. Quand tu ressors, tes poumons brûlent — et ton bras aussi.",
          effets: { pv: -10, sta: -25, blessure: { type: 'brulure', zone: "à l'avant-bras" } }, suivant: FIN,
        },
      },
      {
        label: 'Contourner (+300 m)',
        texte: "Tu fais le tour du pâté de maisons. Des cendres tombent comme une neige grise sur tes épaules.",
        effets: { detour: 300 }, suivant: FIN,
      },
      {
        label: 'Attendre et regarder',
        texte: "La porte de l'immeuble s'ouvre. Quelque chose en sort, en feu, et marche vers toi sans hâte, sans un cri.",
        effets: { combat: { zombies: ['errant'] } }, suivant: COMBAT,
      },
    ],
  },

  rv_babyphone: {
    illu: 'facade', musique: 'sombre', orateur: null,
    texte: "Une voix d'enfant, quelque part dans un immeuble. « Maman ? Maman, t'es où ? »\n\nElle vient d'une fenêtre ouverte au premier. Elle se répète. Exactement pareille. « Maman ? Maman, t'es où ? »",
    choix: [
      {
        label: 'Monter voir',
        texte: "L'escalier sent le renfermé. Au premier, la porte est ouverte. Sur la table de la cuisine, un babyphone branché sur une batterie de voiture, et un téléphone qui rejoue le même message vocal, en boucle.\n\nAutour de la table, quatre morts assis, les poignets liés aux chaises, qui tournent la tête vers toi. Quelqu'un a fait ça pour attirer. Quelqu'un a mangé ici, après.\n\nTu prends les piles. Tu laisses les morts. Tu ne restes pas.",
        effets: { objets: [['piles', 2]], tempsMin: 15, flag: 'rv_appat_babyphone', journal: "Un appât dans un immeuble : un babyphone, quatre morts attachés. Quelqu'un chasse dans ces rues. Pas des morts." },
        suivant: FIN,
      },
      {
        label: 'Faire taire la voix d\'une pierre',
        test: { chance: 0.7 },
        reussite: {
          texte: "Le deuxième caillou fait mouche. La voix se tait. Le silence, après, est pire.",
          effets: {}, suivant: FIN,
        },
        echec: {
          texte: "Le caillou rebondit sur la rambarde avec un bruit de cloche. Derrière toi, une porte cède.",
          effets: { combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer vite',
        texte: "Tu presses le pas. La voix te suit longtemps, toujours pareille, toujours à la même hauteur.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_signal_miroir: {
    illu: 'facade', musique: 'calme', orateur: null,
    texte: "Un éclat de lumière te frappe l'œil. Encore un. Là-haut, à une fenêtre du troisième, quelqu'un fait jouer un miroir au soleil.\n\nTrois éclats courts. Trois longs. Trois courts.",
    choix: [
      {
        label: 'Faire signe en retour',
        texte: "Tu lèves le bras. Le miroir disparaît. Une minute plus tard, un sac descend au bout d'une corde, jusqu'au trottoir. Dedans, deux bouteilles d'eau et un papier plié : « On ne peut pas ouvrir. Pardon. Bonne chance. »\n\nLe rideau se referme.",
        effets: { objets: [['bouteille_eau', 2]], tempsMin: 5 }, suivant: FIN,
      },
      {
        label: 'Ignorer',
        texte: "Tu n'as pas le temps pour les messages de la fin du monde. Tu te le répètes jusqu'au bout de la rue.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_mourante: {
    illu: 'vitrine', musique: 'sombre', orateur: 'La femme',
    texte: "Elle est assise contre une vitrine de boulangerie, les mains pressées sur son ventre. Entre ses doigts, la morsure est nette, profonde, déjà noire sur les bords. Elle te suit des yeux sans peur.\n\n« Approche. J'ai plus rien à mordre, moi. »\n\nElle pousse son sac vers toi du bout du pied.\n\n« Prends. Mais avant de partir… fais en sorte que je ne me relève pas. S'il te plaît. »",
    choix: [
      {
        label: 'Tenir sa main, et faire vite',
        texte: "Elle serre tes doigts une fois, fort, comme on dit merci. Tu fais ce qu'elle demande pendant qu'elle regarde le ciel.\n\nDans son sac, il y a une photo : elle, un homme, deux enfants, une plage. Tu la gardes. Quelqu'un doit se souvenir.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1], ['photo_famille', 1]], sta: -10, tempsMin: 15, flag: 'rv_derniere_volonte' },
        suivant: FIN,
      },
      {
        label: 'Rester avec elle jusqu\'à la fin, sans frapper',
        texte: "Tu n'as pas pu. Tu t'assieds à côté d'elle et tu attends. Elle parle de Lille, d'un chien qui s'appelait Brio, puis elle ne parle plus.\n\nQuand ses yeux se rouvrent, laiteux, ta lâcheté a un prix : c'est elle, et ce n'est plus elle.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1]], tempsMin: 50, combat: { zombies: ['errant'], surprise: true } },
        suivant: COMBAT,
      },
      {
        label: 'Prendre le sac et partir sans répondre',
        texte: "Tu ramasses le sac sans croiser son regard. Dans ton dos, sa voix ne tremble même pas : « J'espère que quelqu'un fera pareil pour toi. »\n\nTu marches plus vite que nécessaire, longtemps.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1]], tempsMin: 5, flag: 'rv_mourante_abandonnee' },
        suivant: FIN,
      },
    ],
  },

  rv_marchand_grille: {
    illu: 'soupirail', musique: 'calme', orateur: 'Le barbu du soupirail',
    texte: "Un sifflement bref, depuis un soupirail muré à moitié. Derrière la grille, un visage barbu, une lampe à huile.\n\n« Du calme. Je vends, j'achète, je tire pas. »\n\nIl pousse une caisse contre les barreaux : des médicaments, du matériel. « On fait affaire, ou tu passes ton chemin. »",
    choix: [
      {
        label: 'Une cartouche contre des antibiotiques',
        besoin: { objet: 'cartouches' },
        texte: "Il fait rouler la cartouche dans sa paume, l'examine à la lumière de sa lampe, puis glisse la plaquette entre les barreaux. « Personne devrait crever d'une griffure. »",
        effets: { objets: [['cartouches', -1], ['antibiotiques', 1]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Une bouteille d\'alcool contre un kit de suture',
        besoin: { objet: 'alcool_fort' },
        texte: "Ses yeux s'allument en voyant l'étiquette. « Ça, ça soigne ce que les médocs soignent pas. » Le kit passe la grille, encore sous blister.",
        effets: { objets: [['alcool_fort', -1], ['kit_suture', 1]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Deux conserves contre des piles',
        besoin: { objet: ['conserve_haricots', 2] },
        texte: "« La bouffe, toujours. » Deux paires de piles roulent sur le trottoir. « Testées. Enfin, presque. »",
        effets: { objets: [['conserve_haricots', -2], ['piles', 2]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Lui demander ce qu\'il sait',
        texte: "Il hausse les épaules. « Le monde, il tient dans dix rues, maintenant. » Puis, plus bas : « Y a des gens qui se cachaient dans les grottes de Calès, à Lamanon. Des troglodytes, comme au Moyen Âge. Ça tient, un rocher. » Il souffle sa lampe. L'entretien est terminé.",
        effets: { decouvrir: ['cales'], tempsMin: 10 }, suivant: FIN,
      },
      {
        label: 'Continuer ta route',
        texte: "Tu ne troques rien avec un homme dont tu ne vois pas les mains. La grille reste entre vous, et c'est très bien comme ça.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_survivant_mordu: {
    illu: 'fontaine', musique: 'sombre', orateur: "L'homme de la fontaine",
    texte: "Un homme assis sur le rebord d'une fontaine, une ceinture serrée en garrot au-dessus du coude. L'avant-bras est violet.\n\n« Mordu. Hier soir. » Il rit, un peu. « T'aurais pas un truc contre la douleur ? Je te donne ce que j'ai. »\n\nSon sac est à ses pieds. Une carte pliée dépasse de sa poche.",
    choix: [
      {
        label: 'Lui donner des antidouleurs',
        besoin: { objet: 'antidouleur' },
        texte: "Il avale les cachets à sec. « Merci. » Il te tend sa carte, pliée en huit. « J'ai marqué où j'ai trouvé de la bouffe. Moi, j'en aurai plus besoin. »\n\nQuand tu te retournes au bout de la rue, il est toujours assis, les yeux fermés, au soleil.",
        effets: { objets: [['antidouleur', -1], ['conserve_raviolis', 2]], decouvrir: ['intermarche'], flag: 'rv_mordu_aide' }, suivant: FIN,
      },
      {
        label: 'Lui donner de l\'alcool',
        besoin: { objet: 'alcool_fort' },
        texte: "Il boit au goulot, longtemps. « Ça, c'est un ami. » Il te pousse son sac du pied. « Prends. Et va-t'en avant que je change. »",
        effets: { objets: [['alcool_fort', -1], ['conserve_raviolis', 2]], butin: { table: 'voyage.cadavre', n: 1 }, flag: 'rv_mordu_aide' }, suivant: FIN,
      },
      {
        label: 'Lui demander ce que ça fait',
        texte: "« Ça brûle. Puis ça ne brûle plus, et c'est pire. Les veines deviennent noires. On a soif, soif tout le temps. » Il te regarde. « Si tu te fais mordre, perds pas ton temps à espérer. Profite. »\n\nIl ferme les yeux.",
        effets: { journal: "Un mordu, à la fontaine. Il m'a dit : les veines noircissent, on a soif. Si tu te fais mordre, profite." }, suivant: FIN,
      },
      {
        label: 'Partir',
        texte: "Tu ne peux rien pour lui. Tu te le répètes. C'est vrai. C'est vrai quand même.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  // ═══════════════════════════ LE PAYS SALONAIS ═══════════════════════════
  rv_bouchon_a7: {
    illu: 'autoroute', musique: 'sombre', orateur: null,
    texte: "L'autoroute est un cimetière de tôle. Des voitures pare-chocs contre pare-chocs sur des kilomètres, portières ouvertes, valises éventrées sur le bitume.\n\nCertaines ne sont pas vides.",
    choix: [
      {
        label: 'Fouiller quelques voitures (30 min)',
        test: { chance: 0.6 },
        reussite: {
          texte: "Coffres, boîtes à gants, sacs de voyage. Tu vas vite, et tu ne regardes pas les sièges avant.",
          effets: { butin: { table: 'voyage.voiture', n: 3 }, tempsMin: 30 }, suivant: FIN,
        },
        echec: {
          texte: "À la quatrième voiture, la ceinture de sécurité retient encore le conducteur. Elle ne retient plus ses bras. Deux portières plus loin, une autre s'ouvre.",
          effets: { butin: { table: 'voyage.voiture', n: 1 }, tempsMin: 15, combat: { zombies: ['errant', 'errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Siphonner un réservoir',
        si: { objet: 'bouteille_vide' },
        besoin: { objet: 'tuyau_plastique' },
        texte: "Le goût de l'essence te reste dans la bouche deux heures. Mais une bouteille pleine, c'est deux cocktails, ou un feu qui prend sous la pluie.",
        effets: { objets: [['bouteille_vide', -1], ['essence', 1]], tempsMin: 15 }, suivant: FIN,
      },
      {
        label: 'Longer le bas-côté sans t\'arrêter',
        texte: "Tu marches sur la bande d'arrêt d'urgence, les yeux droit devant. Des vitres embuées de l'intérieur. Des mains qui frappent, doucement, contre le verre. Tu ne tournes pas la tête.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_troupeau_crau: {
    illu: 'crau', musique: 'calme', orateur: null,
    texte: "Un troupeau de mérinos sans berger dérive sur le coussoul, des centaines de dos laineux, sales, lents. Les chiens de garde ne sont plus là.\n\nLes brebis te regardent passer et s'écartent à peine.",
    choix: [
      {
        label: 'Abattre une bête',
        besoin: LAME,
        texte: "Tu en isoles une contre un muret de pierres sèches. C'est plus dur que tu ne croyais, plus long, plus bruyant. Le troupeau s'éloigne sans hâte pendant que tu découpes ce que tu peux porter.",
        effets: { objets: [['viande_crue', 3]], tempsMin: 40, bruit: 1, xp: { chasse: 12 } }, suivant: FIN,
      },
      {
        label: 'Marcher au milieu du troupeau',
        texte: "Au milieu des brebis, ton odeur se noie dans la leur. Pour la première fois depuis des jours, rien ne te regarde. Le troupeau va à peu près dans ta direction. Tu te laisses porter.",
        effets: { tempsMin: 20, fatigue: 3 }, suivant: FIN,
      },
      {
        label: 'Passer ton chemin',
        texte: "Tu les laisses brouter la fin du monde.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_convoi_militaire: {
    illu: 'convoi', musique: 'tension', orateur: null,
    texte: "Un camion militaire couché dans le fossé, bâche arrachée, caisses répandues dans l'herbe. Deux soldats sont restés sanglés dans la cabine.\n\nIls tournent la tête vers toi en même temps.",
    choix: [
      {
        label: 'Fouiller les caisses pendant qu\'ils se débattent',
        test: { chance: 0.55 },
        reussite: {
          texte: "Les sangles tiennent. Tu fouilles au son de leurs dents qui claquent contre le pare-brise.",
          effets: { butin: { table: 'voyage.convoi', n: 2 }, tempsMin: 15 }, suivant: FIN,
        },
        echec: {
          texte: "Une portière cède sous leur poids. Le premier tombe dans le fossé, se relève, le casque de travers.",
          effets: { butin: { table: 'voyage.convoi', n: 1 }, combat: { zombies: ['militaire'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Les achever un par un, à travers la vitre',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: "La vitre est brisée, ils sont sanglés. C'est presque trop facile, et c'est pour ça que tu le fais proprement. Puis tu prends ton temps avec les caisses.",
          effets: { butin: { table: 'voyage.convoi', n: 3 }, tempsMin: 25, sta: -20 }, suivant: FIN,
        },
        echec: {
          texte: "Ton coup glisse sur un casque. Le soldat se cabre, la sangle claque. Il est dehors.",
          effets: { butin: { table: 'voyage.convoi', n: 2 }, combat: { zombies: ['militaire'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer au large',
        texte: "Des caisses de l'armée, dans un fossé, gardées par des soldats. Même morts, ils font leur travail.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_canal_craponne: {
    illu: 'canal', musique: 'calme', orateur: null,
    texte: "Le canal de Craponne coupe ta route, vert et lent, bordé de roseaux. Le petit pont de bois a brûlé ; il en reste deux poutres noires qui trempent.\n\nDe l'autre côté, le chemin continue.",
    choix: [
      {
        label: 'Remplir une bouteille',
        besoin: { objet: 'bouteille_vide' },
        texte: "L'eau est claire en surface. Tu sais ce qu'il y a au fond des canaux, en ce moment. Il faudra la faire bouillir.",
        effets: { objets: [['bouteille_vide', -1], ['eau_croupie', 1]], tempsMin: 2 }, suivant: 'rv_canal_craponne',
      },
      {
        label: 'Traverser à la nage',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: "L'eau est glacée et elle sent la vase. Quatre brasses, et tu te hisses sur l'autre berge, grelottant{|e}, le sac trempé.",
          effets: { sta: -25, fatigue: -5 }, suivant: FIN,
        },
        echec: {
          texte: "Le courant est plus fort qu'il n'en a l'air. Tu bois la tasse, tu cognes une poutre, tu sors de l'eau à quatre pattes, deux cents mètres plus bas.",
          effets: { sta: -35, pv: -5, blessure: { type: 'contusion', zone: 'au flanc' }, detour: 200 }, suivant: FIN,
        },
      },
      {
        label: 'Chercher un autre pont (+1,2 km)',
        texte: "Tu longes la berge jusqu'à une passerelle d'irrigation, rouillée mais debout.",
        effets: { detour: 1200 }, suivant: FIN,
      },
      {
        label: 'Faire demi-tour',
        texte: "Pas aujourd'hui.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_orage: {
    illu: 'orage', musique: 'calme', orateur: null,
    texte: "Le ciel devient violet au-dessus des Alpilles. Le vent tombe d'un coup. Les premières gouttes sont larges comme des pièces.\n\nIl y a une cabane de vigne, là, à cinquante mètres.",
    choix: [
      {
        label: 'T\'abriter dans la cabane (1 h)',
        texte: "Tu attends, assis{|e} sur un sac d'engrais, pendant que l'orage vide le ciel sur les vignes. L'eau coule par le toit en trois endroits. Personne ne vient. Tu as même dormi, un peu.",
        effets: { tempsMin: 60, fatigue: 8 }, suivant: FIN,
      },
      {
        label: 'Remplir tes bouteilles à la gouttière',
        si: { objet: 'bouteille_vide' },
        texte: "De l'eau de pluie, froide, qui sent la tuile. La plus propre que tu aies bue depuis longtemps.",
        effets: { objets: [['bouteille_vide', -1], ['bouteille_eau', 1]], tempsMin: 20 }, suivant: FIN,
      },
      {
        label: 'Continuer sous la pluie',
        texte: "Trempé{|e} en dix secondes. Le bon côté : tu n'entends plus rien, et plus rien ne t'entend.",
        effets: { sta: -10, fatigue: -4 }, suivant: FIN,
      },
    ],
  },

  rv_ferme_abandonnee: {
    illu: 'mas', musique: 'sombre', orateur: null,
    texte: "Un mas abandonné, portail ouvert, un chien mort au bout de sa chaîne. La porte de la cuisine bat au vent. Le potager est retourné.\n\nLa cave est fermée par une chaîne et un cadenas.",
    choix: [
      {
        label: 'Fouiller la cuisine',
        test: { chance: 0.7 },
        reussite: {
          texte: "Des placards à moitié vidés, mais les gens d'ici gardaient des choses partout : derrière les rideaux, au-dessus du buffet, dans les boîtes à biscuits.",
          effets: { butin: { table: 'voyage.ferme', n: 2 }, tempsMin: 20 }, suivant: FIN,
        },
        echec: {
          texte: "La grand-mère est encore dans son fauteuil, devant la télé éteinte, un plaid sur les genoux. Elle se lève quand tu passes.",
          effets: { butin: { table: 'voyage.ferme', n: 1 }, combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Forcer la cave',
        besoin: { ou: [{ objet: 'pince_coupante' }, { objet: 'pied_de_biche' }, { objet: 'hache_pompier' }] },
        texte: "La chaîne cède. En bas, dans la fraîcheur, des bocaux faits maison, des bouteilles sans étiquette, un jambon qui pend au plafond, une boîte de cartouches sur l'étagère.",
        effets: { butin: { table: 'voyage.ferme', n: 3 }, objets: [['cartouches', 4]], tempsMin: 25, bruit: 1 }, suivant: FIN,
      },
      {
        label: 'Passer',
        texte: "Un chien mort à la chaîne, une porte qui bat. Tu connais la suite.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_puits: {
    illu: 'puits', musique: 'calme', orateur: null,
    texte: "Un puits de pierre au bord du chemin, la margelle couverte de mousse, un seau au bout d'une chaîne rouillée.\n\nEn bas, loin, l'eau renvoie un rond de ciel.",
    choix: [
      {
        label: 'Tirer de l\'eau',
        test: { chance: 0.85 },
        reussite: {
          texte: "Le seau remonte en grinçant, plein à ras bord. Tu bois d'abord, à longues gorgées froides qui font mal aux dents.",
          effets: { soif: 30, tempsMin: 10 }, suivant: 'rv_puits_remplir',
        },
        echec: {
          texte: "Le seau remonte lourd. Trop lourd. Dans le seau, il y a une main. Juste une main, gonflée, avec une alliance.\n\nTu n'as plus soif.",
          effets: { tempsMin: 5 }, suivant: FIN,
        },
      },
      {
        label: 'Passer',
        texte: "Tu as appris à te méfier des puits.",
        effets: {}, suivant: FIN,
      },
    ],
  },
  rv_puits_remplir: {
    illu: 'puits', musique: 'calme', orateur: null,
    texte: "Le seau est encore à moitié plein.",
    choix: [
      {
        label: 'Remplir une bouteille',
        besoin: { objet: 'bouteille_vide' },
        texte: "Eau de puits : fraîche, mais personne ne l'a analysée depuis longtemps. À faire bouillir.",
        effets: { objets: [['bouteille_vide', -1], ['eau_croupie', 1]] }, suivant: 'rv_puits_remplir',
      },
      { label: 'Repartir', texte: "Tu laisses retomber le seau.", effets: {}, suivant: FIN },
    ],
  },

  rv_horde_migration: {
    illu: 'horde_plaine', musique: 'tension', orateur: null,
    texte: "D'abord, la poussière. Puis le bruit : un piétinement, un murmure de mille gorges.\n\nUne horde traverse la plaine devant toi, de gauche à droite, sur un kilomètre de large. Ils ne courent pas. Ils vont quelque part.",
    choix: [
      {
        label: 'Te coucher dans un fossé et attendre (1 h)',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Une heure le visage dans la terre, à compter les pas. Des jambes passent à deux mètres de ta tête. Puis moins. Puis plus rien.",
          effets: { tempsMin: 60, xp: { discretion: 12 } }, suivant: FIN,
        },
        echec: {
          texte: "Un traînard s'arrête au bord du fossé. Il te regarde. Il ne crie pas — il se laisse tomber sur toi.",
          effets: { tempsMin: 30, combat: { zombies: ['errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire un grand détour (+2 km)',
        texte: "Tu remontes le long d'une haie de cyprès, loin, très loin sur leur flanc, en priant pour que le vent ne tourne pas.",
        effets: { detour: 2000 }, suivant: FIN,
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu les regardes passer de loin, et tu rentres. Ce qu'il y avait de l'autre côté attendra.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_peage_pillards: {
    illu: 'barricade', musique: 'tension', orateur: 'Le plus jeune',
    texte: "Un tracteur en travers de la départementale, une remorque de pneus, et trois gars en gilets orange avec des fusils de chasse.\n\n« Contribution volontaire ! » crie le plus jeune.\n\nLes deux autres ne rient pas.",
    choix: [
      {
        label: 'Payer en cartouches (3)',
        besoin: { objet: ['cartouches', 3] },
        texte: "Le plus vieux compte les cartouches deux fois, puis fait un signe du menton. Tu passes entre le tracteur et le fossé.",
        effets: { objet: ['cartouches', -3] }, suivant: FIN,
      },
      {
        label: 'Payer en antibiotiques',
        besoin: { objet: 'antibiotiques' },
        texte: "Le plus vieux lit la boîte, longtemps. « Ma fille. » C'est tout ce qu'il dit. Il te laisse passer.",
        effets: { objet: ['antibiotiques', -1] }, suivant: FIN,
      },
      {
        label: 'Leur faire croire qu\'une horde arrive',
        test: { chance: 0.45 },
        reussite: {
          texte: "Tu montres la poussière au loin — un troupeau, en vrai. Ils se regardent. Le plus vieux siffle entre ses dents ; ils démarrent le tracteur et filent vers le village. Tu passes pendant qu'ils partent.",
          effets: {}, suivant: FIN,
        },
        echec: {
          texte: "« Bien essayé. » Un coup de crosse dans le ventre, un autre dans le dos quand tu tombes. Ils te laissent repartir par où tu es venu{|e}.",
          effets: { pv: -10, blessure: { type: 'contusion', zone: 'au ventre' }, demiTour: true }, suivant: FIN,
        },
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu lèves la main en signe de paix et tu recules. Le plus jeune te crie quelque chose. Tu ne l'entends pas.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_campement: {
    illu: 'pinede', musique: 'calme', orateur: null,
    texte: "Un campement sous des pins : une tente affaissée, un feu éteint dont les cendres sont encore tièdes, une casserole avec un fond de café.\n\nQui que ce soit, ils sont partis il y a moins d'une heure. Ou ils ne sont pas loin.",
    choix: [
      {
        label: 'Fouiller vite',
        test: { chance: 0.65 },
        reussite: {
          texte: "Tu vides la tente en trois gestes et tu repars sans courir, pour ne pas avoir l'air de fuir.",
          effets: { butin: { table: 'voyage.campement', n: 2 }, tempsMin: 10 }, suivant: FIN,
        },
        echec: {
          texte: "Une voix derrière toi : « Pose ça. » Un canon froid sur ta nuque. Tu poses ça. Ils te laissent partir les mains vides, et tu comprends que c'est une gentillesse.",
          effets: { tempsMin: 10, sta: -10 }, suivant: FIN,
        },
      },
      {
        label: 'Attendre qu\'ils reviennent',
        texte: "Tu t'assieds à l'écart, les mains bien visibles. Une heure passe. Personne ne revient. Tu prends ce qui reste, en te disant qu'ils l'auraient voulu. Tu n'en sais rien.",
        effets: { butin: { table: 'voyage.campement', n: 1 }, tempsMin: 60 }, suivant: FIN,
      },
      {
        label: 'Passer',
        texte: "Chacun ses cendres.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_mas_fortifie: {
    illu: 'mas', musique: 'tension', orateur: 'Le vieux du mas',
    texte: "Un mas au bout d'une allée de platanes, volets clos, barbelés sur le mur d'enceinte. Une voix depuis le portail. Un vieux, fusil au poing.\n\n« Arrête-toi là. T'es mordu{|e} ? Montre tes bras. »",
    choix: [
      {
        label: 'Montrer tes bras',
        texte: "Tu remontes tes manches, lentement. Il regarde longtemps, sans baisser le canon. Puis il crache de côté.",
        effets: { tempsMin: 5 }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Repartir',
        texte: "Tu recules jusqu'à la route. Il ne te quitte pas des yeux, ni du canon.",
        effets: {}, suivant: FIN,
      },
    ],
  },
  rv_mas_fortifie_2: {
    illu: 'mas', musique: 'calme', orateur: 'Le vieux du mas',
    texte: "« Bon. » Il baisse à peine le fusil. « J'ai de l'eau, j'ai de l'huile, j'ai des olives. J'ai pas de médicaments, j'ai pas de cartouches. Tu vois où je veux en venir. »",
    choix: [
      {
        label: 'Deux cartouches contre de l\'eau et de l\'huile',
        besoin: { objet: ['cartouches', 2] },
        texte: "Il les glisse dans la poche de sa veste sans les regarder. Trois bouteilles d'eau et un litre d'huile passent par-dessus le portail.",
        effets: { objets: [['cartouches', -2], ['bouteille_eau', 3], ['huile_olive', 1]] }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Des antibiotiques contre des provisions',
        besoin: { objet: 'antibiotiques' },
        texte: "Il tient la boîte comme on tient un oiseau. « Ma femme tousse. » Un cabas passe le portail : olives, miel, deux bouteilles d'eau. Il ne dit pas merci. Il n'a pas besoin.",
        effets: { objets: [['antibiotiques', -1], ['olives', 2], ['miel', 1], ['bouteille_eau', 2]] }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Lui demander la route',
        texte: "« Évite La Barben. Y a des bêtes qui sont sorties. Pas des chiens. Des bêtes. » Il crache encore. « Et la base aérienne, c'est même pas la peine d'y penser. »",
        effets: { decouvrir: ['la_barben'] }, suivant: FIN,
      },
      {
        label: 'Partir',
        texte: "Il te regarde t'éloigner jusqu'au bout de l'allée. Au troisième platane, tu entends le portail se refermer.",
        effets: {}, suivant: FIN,
      },
    ],
  },
};
