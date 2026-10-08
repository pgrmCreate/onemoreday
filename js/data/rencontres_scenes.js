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
    texte: "Le carrefour est noir de monde. Une ambulance est couchée sur le flanc, les portes arrière grandes ouvertes, et autour d’elle, trente morts debout, peut-être plus, oscillent sur place comme un champ de blé mort.\n\nQuelque chose dans l’ambulance les retient là, et tu ne veux pas savoir quoi. Le problème, c’est que ta route passe de l’autre côté.",
    choix: [
      {
        label: 'Contourner par les ruelles (+400 m)',
        texte: "Tu recules sans te retourner, un pas après l’autre, jusqu’au coin de la rue. Puis tu fais un détour de trois pâtés de maisons, les épaules raides, en guettant chaque porte cochère.",
        effets: { detour: 400 }, suivant: FIN,
      },
      {
        label: 'Lancer une bouteille au loin pour les attirer',
        besoin: { objet: 'bouteille_vide' },
        texte: "La bouteille décrit une longue courbe et explose contre une vitrine, deux rues plus loin. Les trente têtes pivotent ensemble, et tout le groupe se met lentement en marche vers le bruit. Tu traverses derrière eux, sur la pointe des pieds.",
        effets: { objet: ['bouteille_vide', -1], xp: { discretion: 6 } }, suivant: FIN,
      },
      {
        label: 'Ramper sous les voitures garées',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu rampes d’une voiture à l’autre, le nez dans l’huile de vidange et le verre pilé, sous trente paires de jambes. De l’autre côté, tes coudes saignent un peu, mais tu es passé{|e}.",
          effets: { sta: -15, xp: { discretion: 10 } }, suivant: FIN,
        },
        echec: {
          texte: "Sous la troisième voiture, une odeur te prévient, mais une demi-seconde trop tard : un mort coupé en deux à la taille est couché là, dans l’ombre, et ses doigts se referment sur ta cheville.",
          effets: { combat: { zombies: ['rampant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Foncer en longeant les façades',
        test: { skill: 'agilite', difficulte: 2 },
        reussite: {
          texte: "Tu cours. Des têtes se tournent et des bras se tendent, mais trop lentement. Tu passes, le cœur au bord des lèvres, et tu ne t’arrêtes qu’au bout de la rue.",
          effets: { sta: -30, xp: { agilite: 8 } }, suivant: FIN,
        },
        echec: {
          texte: "Tu cours, mais un bras te fauche au passage. Tu roules par terre et tu te relèves, mais ils sont déjà deux sur toi.",
          effets: { combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
    ],
  },

  rv_alarme_voiture: {
    illu: 'voiture', musique: 'tension', orateur: null,
    texte: "Un 4x4 a été abandonné au milieu du carrefour, les vitres intactes. Sur la banquette arrière, tu vois des sacs de courses qui n’ont jamais été déballés.\n\nMais sous le pare-brise, le voyant rouge de l’alarme clignote encore : la batterie n’est pas morte, et si tu casses une vitre, l’alarme se mettra à hurler.",
    choix: [
      {
        label: 'Couper l’alarme par le capot',
        besoin: { skill: ['mecanique', 1] },
        test: { skill: 'mecanique', difficulte: 1 },
        reussite: {
          texte: "Tu glisses la main sous le capot entrouvert et tu arraches la cosse de la batterie : le voyant s’éteint. Tu peux alors briser la vitre sans déclencher l’alarme, et faire tes courses en silence.",
          effets: { objets: [['conserve_haricots', 1], ['soda', 1]], butin: { table: 'voyage.voiture', n: 1 }, xp: { mecanique: 12 }, tempsMin: 15 }, suivant: FIN,
        },
        echec: {
          texte: "Ton tournevis ripe, et l’alarme explose dans la rue déserte, stridente et obscène. Une à une, des silhouettes se décollent des murs et viennent vers toi.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Briser la vitre et rafler un sac',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "La vitre éclate et l’alarme se met à hurler, mais tu as déjà plongé à mi-corps dans l’habitacle. En dix secondes, tu rafles un sac, puis tu cours sans te retourner pendant que toute la rue se réveille derrière toi.",
          effets: { objets: [['soda', 1], ['biscuits', 1]], sta: -20, bruit: 3, xp: { agilite: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "L’alarme te vrille les tympans. Le temps d’attraper un sac, une main grise t’agrippe le col par la portière opposée : un mort était couché sur le plancher, à attendre.",
          effets: { objet: ['biscuits', 1], bruit: 3, combat: { zombies: ['errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer au large',
        texte: "Quelques conserves contre une sirène qui ameuterait tout le quartier : le calcul est vite fait, et tu contournes la voiture.",
        effets: { detour: 100 }, suivant: FIN,
      },
    ],
  },

  rv_rampant_voiture: {
    illu: 'voiture', musique: 'sombre', orateur: null,
    texte: "Une petite voiture a été abandonnée là, la portière ouverte, avec un sac à dos posé sur le siège passager.\n\nUne traînée noire, comme du sang séché, part du trottoir et disparaît sous la voiture, et elle ne ressort pas de l’autre côté.",
    choix: [
      {
        label: 'Taper sous le châssis avec une arme longue',
        besoin: ARME_LONGUE,
        texte: "Tu enfonces le bout de ton arme sous le bas de caisse, à l’aveugle, jusqu’à sentir une résistance molle. Quelque chose gargouille, se débat, puis s’arrête. Le sac est à toi.",
        effets: { butin: { table: 'voyage.cadavre', n: 2 }, xp: { dexterite: 4 } }, suivant: FIN,
      },
      {
        label: 'Prendre le sac, vite',
        test: { chance: 0.5 },
        reussite: {
          texte: "Tu attrapes le sac par une bretelle et tu recules de trois pas. Rien ne bouge sous la voiture : la traînée est peut-être vieille, ou peut-être pas.",
          effets: { butin: { table: 'voyage.cadavre', n: 2 } }, suivant: FIN,
        },
        echec: {
          texte: "Ta main se referme sur la bretelle au moment même où une autre main se referme sur ta cheville.",
          effets: { butin: { table: 'voyage.cadavre', n: 2 }, combat: { zombies: ['rampant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Le faire sortir et l’affronter',
        texte: "Tu donnes un coup de pied dans l’aile, et une main noire jaillit de sous la voiture pour racler le bitume vers toi.",
        effets: { butin: { table: 'voyage.cadavre', n: 2 }, combat: { zombies: ['rampant'] } }, suivant: COMBAT,
      },
      {
        label: 'Laisser la voiture',
        texte: "Un sac à dos ne vaut pas une cheville arrachée, alors tu passes ton chemin.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_hurleur_balcon: {
    illu: 'facade', musique: 'tension', orateur: null,
    texte: "Au deuxième étage, sur un balcon aux géraniums morts, une morte se penche par-dessus la rambarde. Sa gorge est ouverte jusqu’aux clavicules, et tu la vois palpiter.\n\nElle ne t’a pas encore vu{|e}, mais si elle crie, tout le quartier saura où tu es.",
    choix: [
      {
        label: 'Passer juste en dessous, accroupi{|e}',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu longes le mur, pile sous le balcon, là où elle ne peut pas regarder. Une goutte noire s’écrase à côté de ta chaussure, et te voilà dans la rue suivante.",
          effets: { xp: { discretion: 8 } }, suivant: FIN,
        },
        echec: {
          texte: "Un éclat de verre crisse sous ta semelle, et là-haut, la tête pivote. Son cri te traverse de part en part, et au bout de la rue, des portes se mettent à cogner.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'coureur'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'L’abattre avant qu’elle crie',
        si: ARME_DE_TIR,
        test: { skill: 'visee', difficulte: 1 },
        reussite: {
          texte: "Il ne te faut qu’un tir. La silhouette bascule par-dessus la rambarde et s’écrase entre deux poubelles, et personne d’autre ne répond, cette fois.",
          effets: { xp: { visee: 8 }, bruit: 2 }, suivant: FIN,
        },
        echec: {
          texte: "Tu la manques, et évidemment, elle se met à crier.",
          effets: { bruit: 3, combat: { zombies: ['errant', 'errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire un détour (+250 m)',
        texte: "Tu fais demi-tour avant qu’elle ne tourne la tête, et tu prends la rue parallèle. Longtemps, tu crois encore entendre le cri qu’elle n’a pas poussé.",
        effets: { detour: 250 }, suivant: FIN,
      },
    ],
  },

  rv_gonfleur_ruelle: {
    illu: 'ruelle', musique: 'sombre', orateur: null,
    texte: "La ruelle est bouchée par un mort gonflé, coincé entre deux poubelles, le ventre énorme et tendu comme un ballon rempli d’eau. S’il éclate près de toi, ses gaz te rendront malade.\n\nIl t’a senti, et il se retourne lentement, dans un bruit de ventre.",
    choix: [
      {
        label: 'Le crever à bout de bras',
        si: { ou: [ARME_LONGUE, ARME_DE_TIR] },
        texte: "Tu le perces à distance, et il éclate contre le mur dans un souffle chaud et vert. Tu retiens ta respiration trop tard et tu vomis, mais au moins, tu n’as rien reçu sur toi.",
        effets: { sta: -10, xp: { dexterite: 4 } }, suivant: FIN,
      },
      {
        label: 'Lui jeter une brique',
        besoin: { objet: 'brique' },
        test: { chance: 0.6 },
        reussite: {
          texte: "La brique lui entre dans le ventre, et il éclate à trois mètres de toi. L’odeur te plie en deux, et tu passes en retenant ta respiration.",
          effets: { objet: ['brique', -1], sta: -5 }, suivant: FIN,
        },
        echec: {
          texte: "La brique rebondit sur son crâne, et il continue d’avancer. Il est déjà trop près.",
          effets: { objet: ['brique', -1], combat: { zombies: ['gonfleur'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire le tour (+300 m)',
        texte: "Certains combats ne valent pas la peine d’être gagnés, et tu prends un autre chemin.",
        effets: { detour: 300 }, suivant: FIN,
      },
      {
        label: 'L’affronter',
        texte: "Tu serres ton arme pendant qu’il avance vers toi avec un bruit de clapotis.",
        effets: { combat: { zombies: ['gonfleur'] } }, suivant: COMBAT,
      },
    ],
  },

  rv_pillards_barrage: {
    illu: 'barricade', musique: 'tension', orateur: 'Les pillards',
    texte: "La rue est barrée par un bus mis en travers, des palettes et des barbelés. Derrière, il y a deux hommes et une femme, avec un fusil de chasse et une arbalète.\n\n« C’est un péage. Tu payes, et tu passes. »\n\nLa femme ne te regarde pas : elle regarde tes mains.",
    choix: [
      {
        label: 'Donner deux conserves',
        besoin: { objet: ['conserve_haricots', 2] },
        texte: "Tu poses les boîtes sur le capot du bus. L’homme au fusil les soupèse et hoche la tête, puis on t’ouvre entre les palettes un passage juste assez large pour toi.",
        effets: { objet: ['conserve_haricots', -2] }, suivant: FIN,
      },
      {
        label: 'Donner une bouteille d’alcool',
        besoin: { objet: 'alcool_fort' },
        texte: "« Ça, ça passe. » La bouteille disparaît derrière le bus, et tu entends le bouchon sauter avant même d’avoir franchi les barbelés.",
        effets: { objet: ['alcool_fort', -1] }, suivant: FIN,
      },
      {
        label: 'Contourner par les jardins (+350 m)',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu passes par-dessus un grillage, puis un autre, entre les balançoires rouillées et les piscines devenues vertes, sans que personne te voie.",
          effets: { detour: 350, xp: { discretion: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "Un carreau d’arbalète se plante dans le grillage, à dix centimètres de ta tête. « La prochaine est pour toi. » Tu recules.",
          effets: { sta: -10, demiTour: true }, suivant: FIN,
        },
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu lèves les mains et tu recules. Ils ne te suivent pas : ils n’en ont pas besoin.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_fil_tendu: {
    illu: 'rue', musique: 'sombre', orateur: null,
    texte: "La rue est trop propre : quelqu’un a balayé les débris sur toute sa largeur, d’un trottoir à l’autre.\n\nOr plus personne ne balaie rien, maintenant.",
    choix: [
      {
        label: 'Ralentir et regarder où tu mets les pieds',
        texte: "Tu repères un fil de pêche tendu à hauteur de cheville entre deux lampadaires, relié à des canettes et à un parpaing posé en équilibre sur un balcon. Tu l’enjambes, puis tu reviens le couper et l’enrouler, parce que ça peut servir.",
        effets: { objet: ['fil_de_fer', 1], tempsMin: 5, xp: { discretion: 4 } }, suivant: FIN,
      },
      {
        label: 'Ne pas ralentir',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "Quelque chose accroche ta cheville et cède. Des canettes dégringolent et un parpaing s’écrase derrière toi, mais tu cours déjà.",
          effets: { bruit: 2, sta: -10 }, suivant: FIN,
        },
        echec: {
          texte: "Ton pied accroche le fil, et tu t’étales de tout ton long pendant que le parpaing éclate sur le trottoir, juste à côté de ta tête. Ton genou, lui, a pris un sale coup.",
          effets: { pv: -6, blessure: { type: 'contusion', zone: 'au genou' }, bruit: 2 }, suivant: FIN,
        },
      },
    ],
  },

  rv_colosse_barrage: {
    illu: 'barrage_police', musique: 'tension', orateur: null,
    texte: "Tu tombes sur un barrage de police : deux fourgons, des barrières et un camion à canon à eau. Au milieu se tient un CRS mort en tenue anti-émeute complète, debout et immobile. Il fait deux mètres, et sa visière est baissée.\n\nIl ne bouge pas, du moins pas encore.",
    choix: [
      {
        label: 'Passer entre les fourgons, sans bruit',
        test: { skill: 'discretion', difficulte: 2 },
        reussite: {
          texte: "Tu te glisses entre les tôles, le dos contre la carrosserie, et tu passes à quatre mètres de lui. Il sent quelque chose, et sa visière tourne d’un cran, mais te voilà déjà de l’autre côté.",
          effets: { xp: { discretion: 12 } }, suivant: FIN,
        },
        echec: {
          texte: "Ta manche accroche une barrière, et le métal grince. Lentement, la visière se tourne tout entière vers toi.",
          effets: { combat: { zombies: ['colosse'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Fouiller un fourgon dans son dos',
        test: { skill: 'discretion', difficulte: 2 },
        reussite: {
          texte: "Tu ouvres la porte latérale et tu trouves une trousse de secours et un carton de munitions. Tu refermes aussi doucement que tu as ouvert, et il n’a pas bougé.",
          effets: { objets: [['munitions_9mm', 6], ['bandage', 2]], tempsMin: 10, xp: { discretion: 10 } }, suivant: FIN,
        },
        echec: {
          texte: "La porte latérale coulisse dans un fracas de rails rouillés. Derrière toi, tu entends un pas, un seul, et le sol vibre.",
          effets: { objet: ['bandage', 1], combat: { zombies: ['colosse'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire le grand tour (+500 m)',
        texte: "Deux mètres de muscle mort sous des coques de protection : non, très peu pour toi.",
        effets: { detour: 500 }, suivant: FIN,
      },
    ],
  },

  rv_ambulance: {
    illu: 'ambulance', musique: 'sombre', orateur: null,
    texte: "Une ambulance est arrêtée là, le gyrophare éteint et les portes arrière entrouvertes. À l’intérieur, sur le brancard, une forme est sanglée sous un drap, et le drap bouge doucement.\n\nLes casiers, sur les côtés, sont encore fermés.",
    choix: [
      {
        label: 'Achever la forme d’abord',
        texte: "Tu appuies le drap sur son visage et tu frappes au travers, une fois, deux fois, jusqu’à ce que le tissu rougisse et ne bouge plus. Ensuite, tu mets longtemps à ouvrir les casiers, parce que tes mains tremblent.",
        effets: { butin: { table: 'voyage.secours', n: 2 }, tempsMin: 10 }, suivant: FIN,
      },
      {
        label: 'Ouvrir les casiers sans la réveiller',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu ouvres un casier, puis un deuxième, pendant que le drap se soulève au rythme de quelque chose qui n’est pas une respiration. Tu repars les bras pleins.",
          effets: { butin: { table: 'voyage.secours', n: 2 }, xp: { discretion: 6 } }, suivant: FIN,
        },
        echec: {
          texte: "Le loquet claque. Sous le drap, la forme se cabre, et la sangle du torse cède, puis celle des jambes.",
          effets: { butin: { table: 'voyage.secours', n: 1 }, combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Laisser l’ambulance',
        texte: "Tu refermes doucement les portes arrière. Quelqu’un d’autre ouvrira les casiers, ou peut-être personne.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_incendie: {
    illu: 'incendie', musique: 'tension', orateur: null,
    texte: "Une fumée noire barre la rue : un immeuble brûle lentement, sans pompiers, depuis on ne sait quand, et la chaleur te frappe le visage à trente mètres.\n\nTa route passe derrière la fumée.",
    choix: [
      {
        label: 'Traverser la fumée en apnée',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: "Tu fonces, un chiffon sur la bouche et les yeux fermés, à travers trente mètres de nuit brûlante. Tu ressors en toussant, noir{|e} de suie, mais vivant{|e}.",
          effets: { sta: -20, pv: -3 }, suivant: FIN,
        },
        echec: {
          texte: "Dans la fumée, tu perds le trottoir, tu te cognes à une voiture et tu respires la fumée. Quand tu ressors, tes poumons te brûlent, et ton bras aussi.",
          effets: { pv: -10, sta: -25, blessure: { type: 'brulure', zone: "à l'avant-bras" } }, suivant: FIN,
        },
      },
      {
        label: 'Contourner (+300 m)',
        texte: "Tu fais le tour du pâté de maisons, pendant que des cendres tombent sur tes épaules comme une neige grise.",
        effets: { detour: 300 }, suivant: FIN,
      },
      {
        label: 'Attendre et regarder',
        texte: "La porte de l’immeuble s’ouvre, et un mort en flammes en sort pour marcher vers toi, sans se presser et sans un cri.",
        effets: { combat: { zombies: ['errant'] } }, suivant: COMBAT,
      },
    ],
  },

  rv_babyphone: {
    illu: 'facade', musique: 'sombre', orateur: null,
    texte: "Tu entends une voix d’enfant quelque part dans un immeuble : « Maman ? Maman, t’es où ? »\n\nElle vient d’une fenêtre ouverte au premier étage, et elle se répète, exactement pareille : « Maman ? Maman, t’es où ? »",
    choix: [
      {
        label: 'Monter voir',
        texte: "L’escalier sent le renfermé, et au premier, la porte est ouverte. Sur la table de la cuisine, un babyphone est branché sur une batterie de voiture, à côté d’un téléphone qui rejoue en boucle le même message vocal.\n\nAutour de la table, quatre morts sont assis, les poignets liés aux chaises, et ils tournent la tête vers toi. Quelqu’un a monté ce piège pour attirer les vivants jusqu’ici, et quelqu’un a mangé ici, ensuite.\n\nTu prends les piles, tu laisses les morts, et tu ne restes pas.",
        effets: { objets: [['piles', 2]], tempsMin: 15, flag: 'rv_appat_babyphone', journal: "Un appât dans un immeuble : un babyphone, quatre morts attachés. Quelqu'un chasse dans ces rues. Pas des morts." },
        suivant: FIN,
      },
      {
        label: 'Faire taire la voix à coups de cailloux',
        test: { chance: 0.7 },
        reussite: {
          texte: "Le deuxième caillou passe par la fenêtre et touche quelque chose, et la voix se tait. Le silence qui suit est pire.",
          effets: {}, suivant: FIN,
        },
        echec: {
          texte: "Le caillou rebondit sur la rambarde avec un bruit de cloche, et derrière toi, une porte cède.",
          effets: { combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer vite',
        texte: "Tu presses le pas, mais la voix te suit longtemps, toujours pareille et toujours à la même hauteur.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_signal_miroir: {
    illu: 'facade', musique: 'calme', orateur: null,
    texte: "Un éclat de lumière te frappe l’œil, puis un autre. Là-haut, à une fenêtre du troisième étage, quelqu’un fait jouer un miroir au soleil.\n\nTu comptes trois éclats courts, trois longs, puis trois courts : c’est SOS, en morse.",
    choix: [
      {
        label: 'Faire signe en retour',
        texte: "Tu lèves le bras, et le miroir disparaît. Une minute plus tard, un sac descend au bout d’une corde jusqu’au trottoir. Dedans, il y a deux bouteilles d’eau et un papier plié : « On ne peut pas ouvrir. Pardon. Bonne chance. »\n\nPuis le rideau se referme.",
        effets: { objets: [['bouteille_eau', 2]], tempsMin: 5 }, suivant: FIN,
      },
      {
        label: 'Ignorer le signal',
        texte: "Tu n’as pas le temps pour les messages de la fin du monde, et tu te le répètes jusqu’au bout de la rue.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_mourante: {
    illu: 'vitrine', musique: 'sombre', orateur: 'La femme',
    texte: "Une femme est assise contre la vitrine d’une boulangerie, les mains pressées sur son ventre. Entre ses doigts, tu vois une morsure nette et profonde, déjà noire sur les bords. Elle te suit des yeux, sans peur.\n\n« Approche. Je mords pas. Pas encore. »\n\nElle pousse son sac vers toi du bout du pied.\n\n« Prends-le. Mais avant de partir… fais en sorte que je ne me relève pas. S’il te plaît. »",
    choix: [
      {
        label: 'Tenir sa main, et faire vite',
        texte: "Elle te serre les doigts une fois, fort, comme pour dire merci, et tu fais ce qu’elle te demande pendant qu’elle regarde le ciel.\n\nDans son sac, il y a une photo d’elle avec un homme et deux enfants, sur une plage. Tu la gardes, parce qu’il faut bien que quelqu’un se souvienne.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1], ['photo_famille', 1]], sta: -10, tempsMin: 15, flag: 'rv_derniere_volonte' },
        suivant: FIN,
      },
      {
        label: 'Rester avec elle jusqu’à la fin, sans frapper',
        texte: "Tu n’as pas pu. Tu t’assieds à côté d’elle et tu attends pendant qu’elle te parle de Lille et d’un chien qui s’appelait Brio, puis elle ne parle plus.\n\nQuand ses yeux se rouvrent, blancs comme du lait, tu paies ta faiblesse : c’est encore elle, et ce n’est déjà plus elle.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1]], tempsMin: 50, combat: { zombies: ['errant'], surprise: true } },
        suivant: COMBAT,
      },
      {
        label: 'Prendre le sac et partir sans répondre',
        texte: "Tu ramasses le sac sans croiser son regard. Dans ton dos, sa voix ne tremble même pas : « J’espère que quelqu’un fera pareil pour toi. »\n\nTu marches longtemps plus vite que nécessaire.",
        effets: { objets: [['barre_cereales', 1], ['bouteille_eau', 1]], tempsMin: 5, flag: 'rv_mourante_abandonnee' },
        suivant: FIN,
      },
    ],
  },

  rv_marchand_grille: {
    illu: 'soupirail', musique: 'calme', orateur: 'Le barbu du soupirail',
    texte: "Tu entends un sifflement bref venant d’un soupirail à moitié muré. Derrière la grille, tu distingues un visage barbu éclairé par une lampe à huile.\n\n« Du calme. Je vends, j’achète, je tire pas. »\n\nIl pousse une caisse de médicaments et de matériel contre les barreaux. « On fait affaire, ou tu passes ton chemin. »",
    choix: [
      {
        label: 'Échanger une cartouche contre des antibiotiques',
        besoin: { objet: 'cartouches' },
        texte: "Il fait rouler la cartouche dans sa paume et l’examine à la lumière de sa lampe, puis il glisse la plaquette entre les barreaux. « Personne devrait crever d’une griffure. »",
        effets: { objets: [['cartouches', -1], ['antibiotiques', 1]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Échanger de l’alcool contre un kit de suture',
        besoin: { objet: 'alcool_fort' },
        texte: "Ses yeux s’allument quand il voit l’étiquette. « Ça, ça soigne ce que les médocs soignent pas. » Le kit passe la grille, encore sous blister.",
        effets: { objets: [['alcool_fort', -1], ['kit_suture', 1]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Échanger deux conserves contre des piles',
        besoin: { objet: ['conserve_haricots', 2] },
        texte: "« La bouffe, toujours. » Deux paires de piles roulent sur le trottoir. « Elles sont testées. Enfin, presque. »",
        effets: { objets: [['conserve_haricots', -2], ['piles', 2]], tempsMin: 5 }, suivant: 'rv_marchand_grille',
      },
      {
        label: 'Lui demander ce qu’il sait',
        texte: "Il hausse les épaules. « Le monde, il tient dans dix rues, maintenant. » Puis il ajoute plus bas : « Il y a des gens qui se cachaient dans les grottes de Calès, à Lamanon, comme les troglodytes du Moyen Âge. Ça tient, un rocher. » Il souffle sa lampe, et la conversation est terminée.",
        effets: { decouvrir: ['cales'], tempsMin: 10 }, suivant: FIN,
      },
      {
        label: 'Continuer ta route',
        texte: "Tu ne fais pas d’échange avec un homme dont tu ne vois pas les mains. La grille reste entre vous, et c’est très bien comme ça.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_survivant_mordu: {
    illu: 'fontaine', musique: 'sombre', orateur: "L’homme de la fontaine",
    texte: "Un homme est assis sur le rebord d’une fontaine, une ceinture serrée en garrot au-dessus du coude, et son avant-bras est violet.\n\n« Mordu, hier soir. » Il rit un peu. « T’aurais pas un truc contre la douleur ? Je te donne ce que j’ai. »\n\nSon sac est posé à ses pieds, et une carte pliée dépasse de sa poche.",
    choix: [
      {
        label: 'Lui donner des antidouleurs',
        besoin: { objet: 'antidouleur' },
        texte: "Il avale les cachets à sec. « Merci. » Il te tend sa carte, pliée en huit. « J’ai marqué les endroits où j’ai trouvé de la bouffe. Moi, j’en aurai plus besoin. »\n\nQuand tu te retournes au bout de la rue, il est toujours assis au soleil, les yeux fermés.",
        effets: { objets: [['antidouleur', -1], ['conserve_raviolis', 2]], decouvrir: ['intermarche'], flag: 'rv_mordu_aide' }, suivant: FIN,
      },
      {
        label: 'Lui donner de l’alcool',
        besoin: { objet: 'alcool_fort' },
        texte: "Il boit longtemps au goulot. « Ça, c’est un ami. » Il pousse son sac vers toi du pied. « Prends-le, et va-t’en avant que je me transforme. »",
        effets: { objets: [['alcool_fort', -1], ['conserve_raviolis', 2]], butin: { table: 'voyage.cadavre', n: 1 }, flag: 'rv_mordu_aide' }, suivant: FIN,
      },
      {
        label: 'Lui demander ce que ça fait',
        texte: "« Ça brûle, et puis ça ne brûle plus, et c’est pire. Les veines deviennent noires, et on a soif, soif tout le temps. » Il te regarde. « Si tu te fais mordre, perds pas ton temps à espérer. Profite. »\n\nPuis il ferme les yeux.",
        effets: { journal: "Un mordu, à la fontaine. Il m'a dit : les veines noircissent, on a soif. Si tu te fais mordre, profite." }, suivant: FIN,
      },
      {
        label: 'Partir',
        texte: "Tu ne peux rien pour lui, et tu te le répètes. C’est vrai, mais ça ne console pas.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  // ═══════════════════════════ LE PAYS SALONAIS ═══════════════════════════
  rv_bouchon_a7: {
    illu: 'autoroute', musique: 'sombre', orateur: null,
    texte: "L’autoroute est devenue un cimetière de tôle. Sur des kilomètres, les voitures sont pare-chocs contre pare-chocs, les portières ouvertes et les valises éventrées sur le bitume.\n\nEt certaines ne sont pas vides.",
    choix: [
      {
        label: 'Fouiller quelques voitures (30 min)',
        test: { chance: 0.6 },
        reussite: {
          texte: "Tu fouilles les coffres, les boîtes à gants et les sacs de voyage en allant vite, sans regarder les sièges avant.",
          effets: { butin: { table: 'voyage.voiture', n: 3 }, tempsMin: 30 }, suivant: FIN,
        },
        echec: {
          texte: "À la quatrième voiture, la ceinture de sécurité retient encore le conducteur, mais plus ses bras. Et deux portières plus loin, une autre s’ouvre.",
          effets: { butin: { table: 'voyage.voiture', n: 1 }, tempsMin: 15, combat: { zombies: ['errant', 'errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Siphonner un réservoir',
        si: { objet: 'bouteille_vide' },
        besoin: { objet: 'tuyau_plastique' },
        texte: "Tu gardes le goût de l’essence dans la bouche pendant deux heures. Mais une bouteille pleine, c’est deux cocktails Molotov, ou un feu qui prend même sous la pluie.",
        effets: { objets: [['bouteille_vide', -1], ['essence', 1]], tempsMin: 15 }, suivant: FIN,
      },
      {
        label: 'Longer le bas-côté sans t’arrêter',
        texte: "Tu marches sur la bande d’arrêt d’urgence en regardant droit devant toi. Sur les côtés, il y a des vitres embuées de l’intérieur, et des mains qui frappent doucement contre le verre, mais tu ne tournes pas la tête.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_troupeau_crau: {
    illu: 'crau', musique: 'calme', orateur: null,
    texte: "Un troupeau de moutons mérinos sans berger dérive sur la plaine caillouteuse de la Crau, des centaines de dos laineux, sales et lents. Les chiens de garde ne sont plus là.\n\nLes brebis te regardent passer et s’écartent à peine.",
    choix: [
      {
        label: 'Abattre une bête',
        besoin: LAME,
        texte: "Tu en coinces une contre un muret de pierres sèches. C’est plus dur que tu ne le croyais, plus long et plus bruyant, et le troupeau s’éloigne sans se presser pendant que tu découpes ce que tu peux porter.",
        effets: { objets: [['viande_crue', 3]], tempsMin: 40, bruit: 1, xp: { chasse: 12 } }, suivant: FIN,
      },
      {
        label: 'Marcher au milieu du troupeau',
        texte: "Au milieu des brebis, ton odeur se noie dans la leur, et pour la première fois depuis des jours, plus rien ne te regarde. Le troupeau va à peu près dans ta direction, alors tu te laisses porter.",
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
    texte: "Un camion militaire est couché dans le fossé, la bâche arrachée et les caisses répandues dans l’herbe. Dans la cabine, deux soldats morts sont restés attachés par leur ceinture.\n\nIls tournent la tête vers toi en même temps.",
    choix: [
      {
        label: 'Fouiller les caisses pendant qu’ils se débattent',
        test: { chance: 0.55 },
        reussite: {
          texte: "Les sangles tiennent, et tu fouilles au son de leurs dents qui claquent contre le pare-brise.",
          effets: { butin: { table: 'voyage.convoi', n: 2 }, tempsMin: 15 }, suivant: FIN,
        },
        echec: {
          texte: "Une portière cède sous leur poids, et le premier tombe dans le fossé, avant de se relever, le casque de travers.",
          effets: { butin: { table: 'voyage.convoi', n: 1 }, combat: { zombies: ['militaire'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Les achever un par un, à travers la vitre',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: "La vitre est brisée et ils sont sanglés : c’est presque trop facile, et c’est pour ça que tu le fais proprement. Ensuite, tu prends ton temps avec les caisses.",
          effets: { butin: { table: 'voyage.convoi', n: 3 }, tempsMin: 25, sta: -20 }, suivant: FIN,
        },
        echec: {
          texte: "Ton coup glisse sur un casque. Le soldat se cabre, la sangle claque, et il se retrouve dehors.",
          effets: { butin: { table: 'voyage.convoi', n: 2 }, combat: { zombies: ['militaire'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Passer au large',
        texte: "Ce sont des caisses de l’armée, dans un fossé, gardées par des soldats qui, même morts, font encore leur travail.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_canal_craponne: {
    illu: 'canal', musique: 'calme', orateur: null,
    texte: "Le canal de Craponne coupe ta route, vert et lent, bordé de roseaux. Le petit pont de bois a brûlé, et il n’en reste que deux poutres noires qui trempent dans l’eau.\n\nDe l’autre côté, le chemin continue.",
    choix: [
      {
        label: 'Remplir une bouteille',
        besoin: { objet: 'bouteille_vide' },
        texte: "L’eau est claire en surface, mais tu sais ce qu’il y a au fond des canaux en ce moment : il faudra la faire bouillir.",
        effets: { objets: [['bouteille_vide', -1], ['eau_croupie', 1]], tempsMin: 2 }, suivant: 'rv_canal_craponne',
      },
      {
        label: 'Traverser à la nage',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: "L’eau est glacée et sent la vase. En quatre brasses, tu atteins l’autre berge et tu t’y hisses, grelottant{|e}, avec ton sac trempé.",
          effets: { sta: -25, fatigue: -5 }, suivant: FIN,
        },
        echec: {
          texte: "Le courant est plus fort qu’il n’en a l’air. Tu bois la tasse, tu te cognes contre une poutre, et tu sors de l’eau à quatre pattes, deux cents mètres plus bas.",
          effets: { sta: -35, pv: -5, blessure: { type: 'contusion', zone: 'au flanc' }, detour: 200 }, suivant: FIN,
        },
      },
      {
        label: 'Chercher un autre pont (+1,2 km)',
        texte: "Tu longes la berge jusqu’à une passerelle d’irrigation, rouillée mais toujours debout.",
        effets: { detour: 1200 }, suivant: FIN,
      },
      {
        label: 'Faire demi-tour',
        texte: "Pas aujourd’hui.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_orage: {
    illu: 'orage', musique: 'calme', orateur: null,
    texte: "Le ciel devient violet au-dessus des Alpilles, le vent tombe d’un coup, et les premières gouttes sont larges comme des pièces.\n\nIl y a une cabane de vigne, là, à cinquante mètres.",
    choix: [
      {
        label: 'T’abriter dans la cabane (1 h)',
        texte: "Tu attends, assis{|e} sur un sac d’engrais, pendant que l’orage vide le ciel sur les vignes. L’eau coule par le toit à trois endroits, mais personne ne vient, et tu arrives même à dormir un peu.",
        effets: { tempsMin: 60, fatigue: 8 }, suivant: FIN,
      },
      {
        label: 'Remplir tes bouteilles à la gouttière',
        si: { objet: 'bouteille_vide' },
        texte: "C’est de l’eau de pluie, froide, qui sent la tuile : la plus propre que tu aies bue depuis longtemps.",
        effets: { objets: [['bouteille_vide', -1], ['bouteille_eau', 1]], tempsMin: 20 }, suivant: FIN,
      },
      {
        label: 'Continuer sous la pluie',
        texte: "Tu es trempé{|e} en dix secondes. Le bon côté, c’est que tu n’entends plus rien, et que plus rien ne t’entend.",
        effets: { sta: -10, fatigue: -4 }, suivant: FIN,
      },
    ],
  },

  rv_ferme_abandonnee: {
    illu: 'mas', musique: 'sombre', orateur: null,
    texte: "Tu arrives devant un mas abandonné. Le portail est ouvert, un chien mort pend au bout de sa chaîne, la porte de la cuisine bat au vent, et le potager a été retourné.\n\nLa cave, elle, est fermée par une chaîne et un cadenas.",
    choix: [
      {
        label: 'Fouiller la cuisine',
        test: { chance: 0.7 },
        reussite: {
          texte: "Les placards sont à moitié vides, mais les gens d’ici cachaient des choses partout : derrière les rideaux, au-dessus du buffet et dans les boîtes à biscuits.",
          effets: { butin: { table: 'voyage.ferme', n: 2 }, tempsMin: 20 }, suivant: FIN,
        },
        echec: {
          texte: "La grand-mère est encore dans son fauteuil, devant la télé éteinte, un plaid sur les genoux. Elle est morte, et elle se lève quand tu passes.",
          effets: { butin: { table: 'voyage.ferme', n: 1 }, combat: { zombies: ['errant'] } }, suivant: COMBAT,
        },
      },
      {
        label: 'Forcer la cave',
        besoin: { ou: [{ objet: 'pince_coupante' }, { objet: 'pied_de_biche' }, { objet: 'hache_pompier' }] },
        texte: "La chaîne cède. En bas, dans la fraîcheur, tu trouves des bocaux faits maison, des bouteilles sans étiquette, un jambon qui pend au plafond et une boîte de cartouches sur l’étagère.",
        effets: { butin: { table: 'voyage.ferme', n: 3 }, objets: [['cartouches', 4]], tempsMin: 25, bruit: 1 }, suivant: FIN,
      },
      {
        label: 'Passer ton chemin',
        texte: "Un chien mort au bout de sa chaîne et une porte qui bat : tu connais la suite, et tu passes ton chemin.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_puits: {
    illu: 'puits', musique: 'calme', orateur: null,
    texte: "Au bord du chemin, il y a un puits de pierre, la margelle couverte de mousse, avec un seau au bout d’une chaîne rouillée.\n\nTout au fond, l’eau renvoie un rond de ciel.",
    choix: [
      {
        label: 'Tirer de l’eau',
        test: { chance: 0.85 },
        reussite: {
          texte: "Le seau remonte en grinçant, plein à ras bord, et tu bois d’abord à longues gorgées froides qui te font mal aux dents.",
          effets: { soif: 30, tempsMin: 10 }, suivant: 'rv_puits_remplir',
        },
        echec: {
          texte: "Le seau remonte lourd, beaucoup trop lourd, et dedans, il y a une main, seule, gonflée, avec une alliance.\n\nTu n’as plus soif.",
          effets: { tempsMin: 5 }, suivant: FIN,
        },
      },
      {
        label: 'Passer ton chemin',
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
        texte: "C’est de l’eau de puits, fraîche, mais que personne n’a analysée depuis longtemps : il faudra la faire bouillir.",
        effets: { objets: [['bouteille_vide', -1], ['eau_croupie', 1]] }, suivant: 'rv_puits_remplir',
      },
      { label: 'Repartir', texte: "Tu laisses retomber le seau.", effets: {}, suivant: FIN },
    ],
  },

  rv_horde_migration: {
    illu: 'horde_plaine', musique: 'tension', orateur: null,
    texte: "Tu vois d’abord la poussière, puis tu entends le bruit : un piétinement, et le murmure de mille gorges.\n\nUne horde traverse la plaine devant toi, de gauche à droite, sur un kilomètre de large. Ils ne courent pas : ils vont quelque part.",
    choix: [
      {
        label: 'Te coucher dans un fossé et attendre (1 h)',
        test: { skill: 'discretion', difficulte: 1 },
        reussite: {
          texte: "Tu restes une heure le visage dans la terre, à compter les pas. Des jambes passent à deux mètres de ta tête, puis de moins en moins, et enfin plus rien.",
          effets: { tempsMin: 60, xp: { discretion: 12 } }, suivant: FIN,
        },
        echec: {
          texte: "Un traînard s’arrête au bord du fossé et te regarde. Il ne crie pas : il se laisse simplement tomber sur toi.",
          effets: { tempsMin: 30, combat: { zombies: ['errant'], surprise: true } }, suivant: COMBAT,
        },
      },
      {
        label: 'Faire un grand détour (+2 km)',
        texte: "Tu remontes le long d’une haie de cyprès, très loin sur leur flanc, en priant pour que le vent ne tourne pas.",
        effets: { detour: 2000 }, suivant: FIN,
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu les regardes passer de loin, puis tu rentres : ce qu’il y avait de l’autre côté attendra.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_peage_pillards: {
    illu: 'barricade', musique: 'tension', orateur: 'Le plus jeune',
    texte: "Un tracteur est mis en travers de la départementale, avec une remorque de pneus, et trois gars en gilet orange t’attendent avec des fusils de chasse.\n\n« Contribution volontaire ! » crie le plus jeune.\n\nLes deux autres ne rient pas.",
    choix: [
      {
        label: 'Payer avec trois cartouches',
        besoin: { objet: ['cartouches', 3] },
        texte: "Le plus vieux compte les cartouches deux fois, puis te fait signe du menton, et tu passes entre le tracteur et le fossé.",
        effets: { objet: ['cartouches', -3] }, suivant: FIN,
      },
      {
        label: 'Payer avec des antibiotiques',
        besoin: { objet: 'antibiotiques' },
        texte: "Le plus vieux lit longtemps la boîte. « Ma fille », dit-il seulement, et il te laisse passer.",
        effets: { objet: ['antibiotiques', -1] }, suivant: FIN,
      },
      {
        label: 'Leur faire croire qu’une horde arrive',
        test: { chance: 0.45 },
        reussite: {
          texte: "Tu leur montres la poussière au loin, un vrai troupeau. Ils se regardent, le plus vieux siffle entre ses dents, puis ils démarrent le tracteur et filent vers le village. Tu passes pendant qu’ils s’en vont.",
          effets: {}, suivant: FIN,
        },
        echec: {
          texte: "« Bien essayé. » Tu reçois un coup de crosse dans le ventre, puis un autre dans le dos quand tu tombes, et ils te laissent repartir par où tu es venu{|e}.",
          effets: { pv: -10, blessure: { type: 'contusion', zone: 'au ventre' }, demiTour: true }, suivant: FIN,
        },
      },
      {
        label: 'Faire demi-tour',
        texte: "Tu lèves la main en signe de paix et tu recules. Le plus jeune te crie quelque chose, mais tu ne l’entends pas.",
        effets: { demiTour: true }, suivant: FIN,
      },
    ],
  },

  rv_campement: {
    illu: 'pinede', musique: 'calme', orateur: null,
    texte: "Sous des pins, tu trouves un campement : une tente affaissée, un feu éteint aux cendres encore tièdes, et une casserole avec un fond de café.\n\nQui que ce soit, ils sont partis il y a moins d’une heure, à moins qu’ils ne soient pas loin.",
    choix: [
      {
        label: 'Fouiller vite',
        test: { chance: 0.65 },
        reussite: {
          texte: "Tu vides la tente en trois gestes, et tu repars sans courir, pour ne pas avoir l’air de fuir.",
          effets: { butin: { table: 'voyage.campement', n: 2 }, tempsMin: 10 }, suivant: FIN,
        },
        echec: {
          texte: "Une voix s’élève derrière toi : « Pose ça. » Tu sens un canon froid sur ta nuque, et tu poses ce que tu tenais. Ils te laissent partir les mains vides, et tu comprends que c’est une gentillesse.",
          effets: { tempsMin: 10, sta: -10 }, suivant: FIN,
        },
      },
      {
        label: 'Attendre qu’ils reviennent',
        texte: "Tu t’assieds à l’écart, les mains bien visibles, et tu attends une heure, mais personne ne revient. Alors tu prends ce qui reste, en te disant qu’ils l’auraient voulu, même si tu n’en sais rien.",
        effets: { butin: { table: 'voyage.campement', n: 1 }, tempsMin: 60 }, suivant: FIN,
      },
      {
        label: 'Passer ton chemin',
        texte: "Chacun ses cendres.",
        effets: {}, suivant: FIN,
      },
    ],
  },

  rv_mas_fortifie: {
    illu: 'mas', musique: 'tension', orateur: 'Le vieux du mas',
    texte: "Au bout d’une allée de platanes se dresse un mas aux volets clos, avec des barbelés sur le mur d’enceinte. Une voix t’interpelle depuis le portail : c’est un vieux, le fusil au poing.\n\n« Arrête-toi là. T’es mordu{|e} ? Montre tes bras. »",
    choix: [
      {
        label: 'Montrer tes bras',
        texte: "Tu remontes lentement tes manches. Il regarde longtemps, sans baisser le canon, puis il crache de côté.",
        effets: { tempsMin: 5 }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Repartir',
        texte: "Tu recules jusqu’à la route, et il ne te quitte pas des yeux, ni du canon.",
        effets: {}, suivant: FIN,
      },
    ],
  },
  rv_mas_fortifie_2: {
    illu: 'mas', musique: 'calme', orateur: 'Le vieux du mas',
    texte: "« Bon. » Il baisse à peine le fusil. « J’ai de l’eau, de l’huile et des olives. J’ai pas de médicaments et pas de cartouches. Tu vois où je veux en venir. »",
    choix: [
      {
        label: 'Échanger deux cartouches contre eau et huile',
        besoin: { objet: ['cartouches', 2] },
        texte: "Il les glisse dans la poche de sa veste sans les regarder, et trois bouteilles d’eau et un litre d’huile passent par-dessus le portail.",
        effets: { objets: [['cartouches', -2], ['bouteille_eau', 3], ['huile_olive', 1]] }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Échanger des antibiotiques contre des vivres',
        besoin: { objet: 'antibiotiques' },
        texte: "Il tient la boîte comme on tiendrait un oiseau. « Ma femme tousse. » Un cabas passe le portail, avec des olives, du miel et deux bouteilles d’eau. Il ne dit pas merci, et il n’en a pas besoin.",
        effets: { objets: [['antibiotiques', -1], ['olives', 2], ['miel', 1], ['bouteille_eau', 2]] }, suivant: 'rv_mas_fortifie_2',
      },
      {
        label: 'Lui demander la route',
        texte: "« Évite La Barben. Il y a des bêtes qui sont sorties, et pas des chiens : des bêtes. » Il crache encore. « Et la base aérienne, c’est même pas la peine d’y penser. »",
        effets: { decouvrir: ['la_barben'] }, suivant: FIN,
      },
      {
        label: 'Partir',
        texte: "Il te regarde t’éloigner jusqu’au bout de l’allée, et au troisième platane, tu entends le portail se refermer.",
        effets: {}, suivant: FIN,
      },
    ],
  },
};
