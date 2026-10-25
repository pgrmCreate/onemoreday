// ============ ACTE I — « Le Refuge » (jours 1 à 3, quête q_refuge) — docs/HISTOIRE.md §6 ============
// La porte et les mains levées, la nuit de quarantaine, les corvées (le puits, la brèche), la garde,
// les sirènes, la voix d'Hélène dans la nuit, Noa, l'enveloppe, le départ avec Fernand.
// Plus : la branche de nuit (ref_retour_nuit) et le retour au Refuge tombé (ref_ruines, acte V).
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.
// Charte : docs/CHARTE_ECRITURE.md (récit fluide, phrases liées, sensations par le personnage).

export const SCENES_REFUGE = {

  // ─────────────────────────── LA PORTE ───────────────────────────
  // Déclencheur : entrée dans miramas_le_vieux (entrée 'porte'), juste après la cinématique 'intro'. Hôte seulement.
  ref_porte: {
    illu: 'refuge_porte', musique: 'tension', orateur: null,
    texte: 'La route de Saint-Chamas finit en lacets sous le rocher, et le village est là-haut, posé au bord de sa falaise au-dessus de l’étang de Berre : un rempart gris, un clocher carré, quelques toits serrés. Le soleil vient de passer derrière la Crau, et l’étang devient couleur de plomb. Ça fait deux jours que tu marches vers cette voix.\n\nLa porte Notre-Dame est un arc de pierre si bien bouché par des palettes, des tôles et des sacs de sable qu’on dirait un mur. Au pied, quelqu’un a peint en blanc sur une tôle, en lettres hautes comme une main : MONTREZ VOS MAINS.\n\nTu as fait trois pas sur l’esplanade quand une lampe s’allume au-dessus de l’arc et te prend en plein visage. Tu ne vois plus rien qu’un rond blanc, et derrière, tu entends la voix d’un jeune homme qui crie trop fort, comme quelqu’un qui a peur.\n\n« Stop ! Tu bouges plus ! Montre tes mains ! »\n\nLà-haut, un déclic métallique claque dans le silence. Ça peut être une arme, ou rien du tout.',
    choix: [
      { label: 'Lever les mains lentement', suivant: 'ref_porte_2' },
      {
        label: 'Crier que tu viens pour le message de la radio',
        texte: '« Je viens pour la radio ! Le message ! »\n\n« Je m’en fous, de la radio ! Les mains, j’ai dit ! »',
        suivant: 'ref_porte_2',
      },
    ],
  },

  ref_porte_2: {
    illu: 'mains_levees', musique: 'tension', orateur: 'Yohan, puis Hélène',
    texte: 'Tu lèves les mains dans le faisceau, paumes ouvertes, doigts écartés.\n\n« Plus haut. Remonte tes manches, les deux. Maintenant, tourne-les. Doucement ! »\n\nTu retrousses tes manches jusqu’aux coudes et tu tournes lentement tes avant-bras dans la lumière, le dessus, puis le dessous, puis encore le dessus. La lampe s’arrête sur une vieille écorchure à ton poignet, et tu sens ton cœur cogner jusqu’à ce qu’elle reparte.\n\nUne deuxième silhouette apparaît sur le rempart, à côté du garçon. C’est une petite femme d’une soixantaine d’années, en gilet sans manches, avec des lunettes qui pendent à un cordon autour de son cou. Elle les pose sur son nez pour te regarder, comme on lit une étiquette.\n\n« Bonsoir. Je m’appelle Hélène, c’est moi qui m’occupe d’ici. » Elle parle bas, et pourtant tu l’entends parfaitement. « Je vais te poser trois questions, et tu vas me répondre sans réfléchir. D’où tu viens ? »',
    choix: [
      { label: '« D’un mas de la Crau, vers Saint-Martin. »', effets: { flag: 'origine_crau' }, suivant: 'ref_porte_3' },
      { label: '« De Salon. J’ai tenu dans des caves. »', effets: { flag: 'origine_salon' }, suivant: 'ref_porte_3' },
      { label: '« D’Istres. J’ai suivi le bord de l’étang. »', effets: { flag: 'origine_istres' }, suivant: 'ref_porte_3' },
    ],
  },

  ref_porte_3: {
    illu: 'refuge_porte', musique: 'tension', orateur: 'Hélène',
    texte: 'Elle hoche la tête, comme si elle notait la réponse quelque part.\n\n« Depuis combien de temps tu es dehors ? »\n\nTu réponds vingt jours. Tu les as comptés sur les murs des endroits où tu as dormi, sur les boîtes de conserve vides, sur tes doigts.\n\n« Quelqu’un t’a {suivi|suivie} ? »\n\nTu te retournes malgré toi. En bas, la route est vide jusqu’au premier virage, et le soir monte de l’étang. Non, personne.\n\nHélène reste un moment silencieuse. Puis elle dit quelque chose au garçon, et la lampe descend enfin sur tes pieds.\n\n« Voilà comment ça se passe ici. Tu vas passer vingt-quatre heures en quarantaine dans la tour-porte, {enfermé|enfermée} de l’extérieur. On t’apportera de l’eau. Si tu as de la fièvre demain matin, tu repars, et je ne discuterai pas. Si tu n’en as pas, tu es des nôtres, et ici, tout le monde travaille. »\n\nDerrière les tôles, quelqu’un tire un verrou, puis un deuxième. La porte s’entrouvre juste assez pour laisser passer une personne de profil, et un homme sort de l’ombre pour prendre ton sac. Il le fouille devant toi sans un mot, sans rien garder, et il te le rend.',
    choix: [
      {
        label: 'Entrer',
        effets: {
          flag: 'refuge_arrivee',
          quete: ['q_refuge', 'quarantaine'],
          teleporter: { lieu: 'miramas_le_vieux', entree: 'quarantaine' },
          journal: 'Je suis {arrivé|arrivée} au Refuge de Miramas-le-Vieux à la tombée de la nuit. On m’a regardé les bras sous une lampe. Hélène, celle qui dirige, m’a {mis|mise} en quarantaine pour vingt-quatre heures dans la tour-porte : si j’ai de la fièvre demain matin, je repars.',
        },
        suivant: '#fin',
      },
    ],
  },

  // CO-OP : le second joueur (il est arrivé avec l'hôte ; ref_porte ne se joue que chez l'hôte).
  ref_porte_coop: {
    illu: 'refuge_cellule', musique: 'sombre', orateur: null,
    texte: 'Vous avez fait les derniers kilomètres ensemble, {coequipier} et toi, sur la route de Saint-Chamas, en suivant la voix de la radio. Au pied du rocher, une lampe vous a pris dans son faisceau, et il a fallu lever les mains, remonter les manches et tourner les avant-bras sous la lumière, l’un après l’autre, pendant qu’un garçon criait sur le rempart.\n\nPuis une petite femme en gilet, avec des lunettes au bout d’un cordon, vous a posé trois questions et vous a annoncé la règle : vingt-quatre heures de quarantaine dans la tour-porte. Si l’un de vous a de la fièvre demain matin, ce sera la route.\n\nLa cellule est une pièce voûtée de la tour, avec deux matelas par terre, une cruche d’eau, un seau et une bougie dans une soucoupe. La porte s’est refermée sur vous, et vous avez entendu le verrou tourner de l’autre côté. Par la meurtrière, tu regardes l’étang devenir noir.',
    choix: [
      {
        label: 'T’asseoir et attendre',
        effets: { journal: 'Je suis {arrivé|arrivée} au Refuge de Miramas-le-Vieux avec {coequipier}. On nous a regardé les bras sous une lampe, et nous voilà en quarantaine pour vingt-quatre heures dans la tour-porte. Si l’un de nous a de la fièvre demain, nous repartons.' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA NUIT DE QUARANTAINE ───────────────────────────
  // Déclencheur : jour 1, 22 h, en quarantaine.
  ref_nuit_bastien: {
    illu: 'refuge_cellule', musique: 'calme', orateur: 'Bastien',
    texte: 'Tu es {assis|assise} contre le mur quand la petite trappe de la porte s’ouvre à hauteur de visage. Derrière, une lampe frontale réglée au plus bas éclaire un homme d’une trentaine d’années, mal rasé, avec des cernes qui lui descendent jusqu’aux joues.\n\n« Bonsoir. Bastien. J’étais infirmier aux urgences de Salon ; ici, je suis ce qu’il y a. » Il passe un thermomètre électronique par la trappe. « Sous le bras, s’il te plaît, deux minutes. Ce n’est pas contre toi, on le fait à tout le monde. »\n\nPendant que tu attends le bip, tu entends quelque part en dessous une toux d’enfant, sèche, qui n’en finit pas. Bastien tourne la tête vers le bruit, et tu vois ses épaules se raidir.\n\n« C’est Noa. Elle a huit ans, et elle tousse comme ça depuis quatre jours. Je n’ai plus rien à lui donner que du paracétamol et de l’eau chaude. » Il se reprend aussitôt, gêné. « Pardon. Tu n’as pas besoin de ça ce soir. »\n\nLe thermomètre bipe : 36,9. Bastien sourit pour la première fois, d’un sourire très fatigué.\n\nAu même moment, dans la poche de sa blouse, un petit récepteur allumé tout bas se met à grésiller, et une voix de jeune fille en sort, un peu nasillarde. Tu la reconnais dès le premier mot : c’est la voix de ta radio, celle que tu suis depuis deux jours.\n\n« Ici le Refuge de Miramas-le-Vieux… »\n\n« Inès, dit Bastien en baissant le son. Elle a dix-sept ans, et elle a installé son poste dans une maison en bas de la place, à côté de l’infirmerie. Elle lit le message en direct quand elle peut ; la nuit, c’est un enregistrement qui passe tout seul, toutes les heures. Moi, je l’écoute pour savoir l’heure. » Il sourit. « Ne lui dis pas que c’est grâce à elle que tu es là, elle deviendrait insupportable. »',
    choix: [
      { label: 'Parler encore un peu avec Bastien', effets: { document: 'doc_message_refuge' }, suivant: 'ref_nuit_bastien_2' },
      {
        label: 'Lui rendre le thermomètre et dormir',
        effets: {
          document: 'doc_message_refuge', tempsMin: 690, fatigue: 75,   // la nuit passe : on se réveille vers 6 h 30, avant Hélène
          journal: 'Première nuit en quarantaine. Bastien, l’infirmier, m’a pris la température : pas de fièvre. Une petite fille, Noa, tousse quelque part en dessous. Dans le petit récepteur de Bastien, j’ai entendu la voix d’Inès lire le message de la radio, celui qui m’a fait venir.',
        },
        suivant: '#fin',
      },
    ],
  },

  ref_nuit_bastien_2: {
    illu: 'refuge_cellule', musique: 'calme', orateur: 'Bastien',
    texte: 'Bastien s’assoit par terre de l’autre côté de la porte ; tu l’entends glisser contre le bois.\n\n« Le 12, l’armée a vidé l’hôpital. Ils ont emporté le matériel, les médicaments, et les soignants qui voulaient bien monter dans les camions. Moi, je n’ai pas voulu, parce que j’avais encore des patients. » Il se tait un moment. « Le 14, je n’en avais plus. »\n\nIl reste silencieux, puis il reprend. « Ma sœur habite à Istres. J’ai essayé d’y aller, et en route, je suis tombé sur le message d’Inès. Je me suis dit qu’un endroit où on demande de montrer ses mains, c’est un endroit où quelqu’un réfléchit. »\n\nIl se relève, et tu entends ses genoux craquer.\n\n« Dors. Demain matin, Hélène t’ouvrira. Elle a l’air dure, mais elle compte tout le monde le soir, un par un, et quand il en manque un, elle ne dort pas. »',
    choix: [
      {
        label: 'Dormir',
        effets: { tempsMin: 670, fatigue: 75, journal: 'Première nuit en quarantaine. Bastien, l’infirmier, a quitté l’hôpital de Salon quand l’armée l’a vidé ; sa sœur vit à Istres. Une petite fille, Noa, tousse quelque part en dessous. Dans le petit récepteur de Bastien, j’ai entendu la voix d’Inès lire le message de la radio, celui qui m’a fait venir.' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE MATIN ───────────────────────────
  // Déclencheur : jour 2, 7 h.
  ref_matin: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Hélène',
    texte: 'Le verrou tourne à sept heures. Hélène entre avec le même thermomètre que Bastien et te le tend sans un mot. Quand il bipe, elle lit 36,8, et elle note le chiffre dans un carnet à spirale, sous une longue colonne de noms et de chiffres.\n\n« Bien. Bienvenue au Refuge. » Elle ouvre la porte en grand. « Ici, tout le monde travaille. Viens, je vais te montrer. »\n\nDehors, le village sent le feu de bois et le linge mouillé. C’est une poignée de ruelles en pente, pavées de galets, qui montent entre des maisons de pierre serrées jusqu’à une petite place. Sur la place, il y a un puits, une église romane au clocher carré, Notre-Dame-de-Beauvezer, et du linge qui sèche entre deux fenêtres. Un camion bâché, un porteur blanc aux pneus à moitié dégonflés, est garé de travers au milieu de la place ; un grand type en marcel est assis sur le pare-chocs avec une tasse qui fume.\n\nAu-dessus de tout, sur la pointe du rocher, se dressent les ruines du château et son donjon carré, dont une seule fenêtre a été réparée avec des planches.\n\n« Le donjon, c’est chez moi, dit Hélène. Personne n’y monte sans frapper. »\n\nPar-dessus le rempart, l’étang de Berre brille comme une tôle, et à l’ouest, la Crau s’étend à perte de vue, plate et grise. Tout au fond, tu devines les toits des entrepôts et les longues lignes des voies de la gare de triage de Miramas. Quand le vent vient de là, il t’apporte, très loin, une voix de haut-parleur qui répète toujours la même phrase.',
    choix: [{ label: 'Suivre Hélène sur la place', suivant: 'ref_regles' }],
  },

  ref_regles: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Hélène',
    texte: 'Contre le mur de l’église, un grand tableau noir d’école est vissé dans la pierre. Les règles du Refuge y sont écrites à la craie, d’une écriture ronde et appliquée. Hélène te laisse les lire, puis elle tapote le bas du tableau avec son crayon, là où sont notées les corvées du jour.\n\n« Deux choses aujourd’hui. D’abord l’eau : la citerne est basse, il faut remonter vingt seaux du puits, ici, sur la place. Céline te montrera. Ensuite, la brèche. Le rempart nord s’est éboulé sur trois mètres pendant l’orage de la semaine dernière, et Rudy doit le refermer avant la nuit. Il a le marteau et les clous, mais il lui manque des planches. » Elle te regarde par-dessus ses lunettes. « Il y en a dans le bas du village, dans les maisons qu’on n’habite plus. Il en faut au moins quatre. Personne n’y est descendu depuis une semaine, alors fais attention, en bas. »\n\nElle te tend un pied-de-biche dont le manche est entouré de chatterton.\n\n« Pour les planches, et pour le reste. »\n\nElle referme son carnet.\n\n« Ce soir, tu prendras la garde à la brèche avec Rudy. Si elle est fermée, tu passeras une nuit tranquille. Sinon, non. »',
    choix: [
      {
        label: 'Te mettre au travail',
        effets: {
          teleporter: { lieu: 'miramas_le_vieux', entree: 'place' },   // Hélène t'a menée sur la place, devant le tableau
          flag: 'quarantaine_faite',
          quete: ['q_refuge', 'corvees'],
          document: 'doc_regles_refuge',
          objet: ['pied_de_biche', 1],
          journal: 'Pas de fièvre : Hélène m’a {accepté|acceptée} au Refuge. Corvées avant la nuit : remonter vingt seaux du puits, sur la place, et rapporter quatre planches du bas du village (les maisons abandonnées, où personne n’est descendu depuis une semaine) pour que Rudy ferme la brèche du rempart nord. Ce soir, je monte la garde à la brèche avec lui.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LES CORVÉES ───────────────────────────
  // Marqueur 'puits' (sur la place).
  ref_puits: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Céline',
    texte: 'Le puits est au milieu de la place, sous une margelle de pierre usée et une poulie rouillée qui grince. Une femme d’une quarantaine d’années, les manches retroussées et un fichu sur les cheveux, y remplit des seaux qu’elle vide dans une citerne de plastique bleu.\n\n« Toi, tu es {le nouveau|la nouvelle}. Moi, c’est Céline. » Elle te tend la corde sans attendre. « Vingt seaux, c’est ce qu’il faut pour la journée. La corde râpe, alors enroule ton pull autour de tes mains. Et ne te penche pas au-dessus : la semaine dernière, Théo a fait tomber un seau, et on l’a entendu cogner contre les parois pendant une éternité. »\n\nElle jette un coup d’œil à un garçon d’une douzaine d’années qui étend du linge de l’autre côté de la place, et elle baisse la voix.\n\n« Le village est sur un rocher, et l’eau est tout en bas. Ça fait plus de trente mètres. »',
    choix: [
      {
        label: 'Remonter vingt seaux',
        effets: {
          tempsMin: 40, fatigue: -10, flag: 'eau_faite',
          journal: 'J’ai remonté vingt seaux du puits avec Céline. La citerne est pleine pour la journée, et j’ai les mains en feu.',
        },
        suivant: '#fin',
      },
      { label: 'Revenir plus tard', suivant: '#fin' },
    ],
  },

  // Marqueur 'breche' (le rempart nord éboulé).
  ref_breche: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Rudy',
    texte: 'La brèche du rempart nord est au bout d’une ruelle qui ne mène plus nulle part. Sur trois mètres, le mur s’est effondré en un tas de gravats, et par le trou, tu vois la pente de rocaille et de chênes kermès qui descend vers la plaine. En travers, quelqu’un a tendu des fils de fer garnis de boîtes de conserve, pour entendre si quelque chose monte.\n\nUn grand type d’une quarantaine d’années est assis sur les gravats, un marteau de coffreur sur les genoux et une boîte de clous à côté de lui. Il a des bras de déménageur et un camion tatoué sur l’avant-bras.\n\n« C’est toi, {le nouveau|la nouvelle} ? Rudy. » Il ne se lève pas. « Hélène t’a parlé de mon trou ? Quatre planches, et je te le bouche. De la bonne planche, pas de la palette pourrie : des portes, des volets, des fonds de lit, ce que tu trouves. Il y en a plein dans le bas du village. » Il crache entre ses pieds. « Moi, je n’y descends pas. Je suis chauffeur, pas croque-mort. »',
    choix: [
      {
        label: 'Poser les planches avec Rudy',
        besoin: { objet: ['planche', 4] },
        effets: {
          retirer: [['planche', 4]], tempsMin: 50, fatigue: -8, flag: 'breche_fermee',
          journal: 'Avec Rudy, nous avons fermé la brèche du rempart nord avec quatre planches. Ce n’est pas beau, mais ça tiendra.',
        },
        suivant: 'ref_breche_2',
      },
      { label: 'Aller chercher des planches', effets: { flag: 'planches_demandees' }, suivant: '#fin' },
      { label: 'Partir', suivant: '#fin' },
    ],
  },

  ref_breche_2: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Rudy',
    texte: 'Vous clouez pendant presque une heure. Rudy tient les planches en travers de la brèche pendant que tu enfonces les clous dans les madriers qu’il a calés entre les pierres. Il travaille vite et bien, sans un geste de trop, et il parle sans te regarder.\n\n« Tu sais ce que c’est, ici ? Une souricière. Un seul chemin pour monter, un seul pour descendre, et des murs tout autour. Tant que les morts ne savent pas qu’on est là, c’est parfait. Le jour où ils le sauront… » Il tape un dernier clou, fort. « Mon camion, sur la place, il lui reste un fond de réservoir, de quoi faire quarante bornes, peut-être cinquante. Hélène veut qu’on le garde pour un coup dur. Moi, je dis que le coup dur, il vaudrait mieux le voir venir de loin. »\n\nIl recule de deux pas pour regarder le travail. La brèche est fermée par une palissade de planches et de vieux volets bleus, laide et solide.\n\n« Le jour où ça tombe, je ne serai pas dedans. Je te le dis franchement, comme ça, tu sauras. »',
    choix: [{ label: 'Ranger les outils', suivant: '#fin' }],
  },

  // ─────────────────────────── LA GARDE ───────────────────────────
  // Déclencheur : jour 2, 21 h. Les deux choix sont complémentaires (brèche fermée ou non).
  ref_garde: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Hélène',
    texte: 'Le repas du soir se prend sur la place, autour d’une marmite de pois chiches et de riz que Malik, le cuisinier, sert à la louche en comptant les cuillères. On mange vite, sans parler fort. À la fin, chacun remonte ses manches devant Bastien sous la lampe, même Hélène, même Paul et Josette, les deux vieux, qui le font en se tenant la main.\n\nPuis Hélène ouvre son carnet et distribue les postes de la nuit.\n\n« Céline, la porte Notre-Dame. Yohan et Malik, la brèche à partir de deux heures. Jusque-là, Rudy, et toi. » Elle relève les yeux. « À la brèche, on ne dort pas, on n’allume pas, et on ne quitte pas son poste. Si quelque chose monte, on le repousse. Si c’en est trop, Fernand sonne la cloche, et tout le monde vient. »',
    choix: [
      {
        label: 'Prendre ton poste à la brèche',
        si: { flag: 'breche_fermee' },
        effets: {
          mission: ['accepter', 'm_garde'], quete: ['q_refuge', 'garde'], teleporter: { lieu: 'miramas_le_vieux', entree: 'poste_breche' },
          journal: 'Garde de nuit à la brèche du rempart nord avec Rudy, jusqu’à deux heures. On ne dort pas, on n’allume pas, on ne quitte pas son poste. La brèche est fermée : la nuit devrait être calme.',
        },
        suivant: '#fin',
      },
      {
        label: 'Prendre ton poste devant la brèche ouverte',
        si: { pasFlag: 'breche_fermee' },
        effets: {
          mission: ['accepter', 'm_garde'], quete: ['q_refuge', 'garde'], teleporter: { lieu: 'miramas_le_vieux', entree: 'poste_breche' },
          journal: 'Garde de nuit à la brèche du rempart nord avec Rudy, jusqu’à deux heures. On ne dort pas, on n’allume pas, on ne quitte pas son poste. La brèche est restée ouverte : tout ce qui montera la pente pourra entrer.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 2, 23 h, pendant la garde.
  ref_sirenes: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Rudy',
    texte: 'Il est onze heures quand le bruit arrive de l’ouest. D’abord, tu crois que c’est le vent dans les fils de fer, puis la note monte, longue et grave, et elle ne redescend pas. Ce sont des sirènes, toutes celles de Miramas en même temps, et d’autres plus loin, vers Istres, qui leur répondent avec un temps de retard.\n\nAu-dessus de la plaine, des petites lumières rouges passent lentement en file, très haut, en direction de la gare de triage.\n\nRudy n’a même pas levé la tête.\n\n« Des drones, dit-il, avec des haut-parleurs dessous. C’est l’armée. Ils font hurler les sirènes sur un coin, et tous les morts qui les entendent se mettent à courir vers le bruit, même ceux qui dormaient debout dans les caves depuis trois semaines. » Il roule une cigarette avec du tabac de mégots. « Le lendemain, ils déplacent le bruit un peu plus loin, et les morts suivent. Fernand appelle ça le rabattage : il dit que c’est comme ça qu’on mène un troupeau à l’abattoir. »\n\nIl allume sa cigarette dans le creux de sa main, contre la règle, et il souffle la fumée vers le bas.\n\n« Ça fait deux semaines qu’ils les poussent tous vers la gare de triage. J’aimerais bien savoir ce qu’ils comptent en faire, une fois qu’ils y seront tous. »',
    choix: [
      {
        label: 'Continuer à guetter',
        effets: { journal: 'Vers onze heures, les sirènes ont hurlé sur Miramas, et des drones sont passés. Rudy dit que c’est l’armée : nuit après nuit, elle fait courir les morts vers le bruit et elle les pousse tous vers la gare de triage. Il se demande ce qu’elle compte en faire.' },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 3, 1 h, pendant la garde. La voix d'Hélène dans la nuit.
  ref_helene_radio: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: null,
    texte: 'Vers une heure, Rudy te donne un coup de coude et te montre le haut du rocher, sans un mot.\n\nAu donjon, derrière les planches de la seule fenêtre réparée, il y a de la lumière : une lueur jaune et faible, comme celle d’une lampe de poche posée sur une table. Les règles interdisent toute lumière après la tombée de la nuit, et c’est là-haut que dort Hélène.\n\nLe vent est tombé, et le village est si calme que, lorsqu’une voix se met à parler là-haut, tu l’entends par la fenêtre. C’est la voix basse et nette d’Hélène, celle qui ne crie jamais.\n\n« … Beauvezer. Je répète, Beauvezer. »\n\nUn grésillement lui répond, puis une autre voix, lointaine, déformée, dont tu ne comprends pas les mots.\n\n« Vous m’avez dit soixante heures. Il en reste vingt-neuf. » Un silence. « Non. Non. Personne ne descendra. » Un autre silence, plus long, puis, plus bas : « Quatorze. Non : quinze, maintenant. »\n\nLa lumière s’éteint.\n\nRudy a les yeux plissés vers le donjon, et il met longtemps à parler.\n\n« Elle parle toute seule, la nuit, finit-il par dire. Ou pas toute seule. » Il se tourne vers toi. « Elle nous compte. Je me demande bien pour qui. »',
    choix: [
      {
        label: 'Ne rien dire et continuer à guetter',
        effets: {
          flag: 'helene_radio_vue',
          journal: 'Vers une heure du matin, j’ai entendu Hélène parler dans une radio, en haut du donjon : « Beauvezer, je répète, Beauvezer… Vous m’avez dit soixante heures, il en reste vingt-neuf… Personne ne descendra… Quatorze. Non : quinze, maintenant. » Elle compte les gens du Refuge pour quelqu’un. Vingt-neuf heures avant quoi ?',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── NOA, L'ENVELOPPE, LE DÉPART ───────────────────────────
  // Déclencheur : jour 3, 7 h (même si la garde a mal tourné).
  ref_noa: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Bastien',
    texte: 'À sept heures, Théo, le fils de Céline, tambourine à ta porte, essoufflé : « Bastien veut tout le monde à l’infirmerie ! »\n\nL’infirmerie est une maison basse au sud de la place, avec quelques lits, une armoire presque vide et une odeur d’eucalyptus et de sueur. Noa est dans le lit du fond. C’est une petite fille aux cheveux collés par la fièvre, qui respire par la bouche avec un sifflement à chaque inspiration. Sa mère, Karine, est assise près d’elle et lui tient la main ; elle ne lève pas les yeux quand vous entrez.\n\nBastien parle à voix basse, mais dans cette petite salle, tout le monde l’entend.\n\n« Quarante de fièvre depuis cette nuit, et elle respire de plus en plus mal. C’est une pneumonie, j’en suis presque sûr. Il lui faudrait des antibiotiques, de l’amoxicilline, n’importe quoi, et je n’ai plus rien depuis une semaine. » Il se frotte les yeux. « Sans ça, elle a deux ou trois jours. Peut-être moins. »\n\nPersonne ne dit rien. Puis Fernand, le vieux berger, qui était resté près de la porte appuyé sur son bâton, se racle la gorge.\n\n« Gérard, à Cabassole, il soignait ses brebis à l’oxytétracycline. Il en avait toute une armoire, des flacons du vétérinaire. C’est la même chose que pour nous, à la dose près. » Il hausse les épaules. « Les brebis aussi, ça fait des pneumonies. »\n\n« Cabassole, c’est au milieu de la Crau, dit Hélène. À six kilomètres. »\n\n« Avec le camion, on y est en dix minutes », dit Rudy depuis la porte.\n\n« Avec le camion, tous les morts de la Crau sauront où vous allez, répond Hélène sans le regarder. Et il te reste quarante kilomètres d’essence : je les garde. »\n\nElle regarde Noa, puis Karine, puis Fernand, et enfin toi. Tu la vois faire un calcul dans sa tête, très vite, comme si elle comptait autre chose que des kilomètres.\n\n« Fernand, et toi. Personne d’autre. Vous partez dans une heure. »\n\nKarine lève enfin la tête, et elle te regarde pour la première fois. Elle ne dit pas merci. Elle dit : « Reviens. »',
    choix: [{ label: 'Préparer ton sac', suivant: 'ref_enveloppe' }],
  },

  ref_enveloppe: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: 'Avant le départ, Hélène te fait monter au donjon.\n\nTu n’y étais jamais {entré|entrée}. C’est une seule pièce carrée et haute, aux murs nus, avec un lit de camp fait au carré, une table et une chaise. Au-dessus du lit, l’étui d’un pistolet de gendarme pend à un clou. Sur la table, une couverture militaire est jetée sur quelque chose de gros et d’anguleux. Un fil noir sort de dessous, longe le mur et monte jusqu’à la fenêtre, où il disparaît dehors. Hélène voit que tu le regardes, et elle ne l’explique pas.\n\nElle sort de la poche de son gilet une enveloppe blanche, épaisse, fermée, sur laquelle elle a écrit quelques mots de sa petite écriture droite : À N’OUVRIR QUE SI LE REFUGE TOMBE.\n\n« Prends ça. » Elle ne la lâche pas tout de suite. « Tu ne l’ouvres pas avant : ni à la bergerie, ni sur la route, ni un soir où tu t’ennuies. Si le Refuge tient, tu me la rends fermée, et on n’en parle plus. Promets-le. »',
    choix: [
      {
        label: 'Le promettre',
        effets: { flag: 'promesse_helene', objet: ['enveloppe_helene', 1], quete: ['q_refuge', 'fin'] },
        texte: 'Tu promets. Hélène te regarde un long moment, comme si elle vérifiait quelque chose, puis elle lâche l’enveloppe.\n\n« Merci. Va, maintenant. Fernand n’aime pas attendre. »',
        suivant: 'ref_depart',
      },
      {
        label: 'Demander ce qu’il y a dedans',
        effets: { objet: ['enveloppe_helene', 1], quete: ['q_refuge', 'fin'] },
        texte: '« Si je te le disais, tu porterais ce que je porte. » Elle lâche l’enveloppe. « Une seule personne pour ça, c’est assez. Va, maintenant. Fernand n’aime pas attendre. »',
        suivant: 'ref_depart',
      },
    ],
  },

  ref_depart: {
    illu: 'refuge_porte', musique: 'calme', orateur: 'Fernand',
    texte: 'À huit heures, la porte Notre-Dame s’entrouvre pour vous laisser sortir. Malik, le cuisinier, t’attend dans le passage avec un torchon noué : dedans, il y a un pain rond encore tiède et une gourde pleine. « Le pain, c’est la farine de Paul, il la gardait pour Noël. Ne le lui dis pas, il pleurerait. »\n\nSur le rempart, Inès te fait un signe de la main, son casque de radio autour du cou. Elle crie quelque chose que le vent emporte à moitié ; tu crois comprendre : « Ramène pas que des médicaments ! »\n\nFernand t’attend en bas des marches. Il a soixante-seize ans, une casquette de toile, une veste de chasse aux poches déformées et un bâton de buis presque aussi grand que lui. Il te regarde de la tête aux pieds, comme on regarde une bête à la foire.\n\n« Tu marches vite ? » Il n’attend pas la réponse. « Tant pis. Moi, je marche longtemps. Ça revient au même. »\n\nIl part sans se retourner, par le sentier qui descend vers l’ouest et la plaine.',
    choix: [
      {
        label: 'Suivre Fernand',
        effets: {
          flag: 'depart_crau',
          quete: ['q_crau', 'route'],
          objets: [['pain', 1], ['gourde', 1]],
          voyage: { vers: 'bergerie', indication: true },
          journal: 'Noa, la fille de Karine, a une pneumonie, et Bastien n’a plus d’antibiotiques. Je pars avec Fernand, le vieux berger, chercher ceux que Gérard gardait pour ses brebis, à la bergerie de Cabassole, au milieu de la Crau. Hélène m’a donné une enveloppe : « À n’ouvrir que si le Refuge tombe. »',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA BRANCHE DE NUIT ───────────────────────────
  // On a ouvert l'enveloppe à la bergerie et convaincu Fernand de rentrer : arrivée au Refuge vers 1 h, jour 4.
  ref_retour_nuit: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: 'Yohan a failli tirer quand vos silhouettes sont sorties du noir au pied de la porte, et il a fallu que Fernand crie son nom deux fois pour qu’il ouvre.\n\nTu montes au donjon sans frapper. Hélène est assise à sa table, en gilet, et la couverture est repoussée : dessous, il y a un gros poste radio vert olive, avec un combiné et des voyants qui clignotent. Elle n’essaie pas de le cacher. Elle regarde l’enveloppe ouverte dans ta main, puis Fernand derrière toi, et elle enlève ses lunettes.\n\n« Tu n’as pas tenu parole. » Ce n’est pas un reproche ; elle le constate. « Assieds-toi. »\n\nElle te dit tout, sans se presser, avec sa voix de réunion de conseil municipal. La lieutenante Sabatier, au PC Durance, l’a appelée sur le poste des gendarmes le soir de ton arrivée. Les avions viendront à six heures du matin. Il y a du chlore dans les wagons de la gare, et personne ne sait ce que fera le vent. Elle a fait ses comptes : vingt kilomètres de plaine et des milliers de morts entre ici et l’est, une enfant à quarante de fièvre et deux vieux de quatre-vingts ans. Ici, au moins, il y a des murs.\n\n« J’ai parié sur les murs. Je parie toujours sur les murs. » Elle remet ses lunettes. « Mais tu as raison sur un point : ceux qui ne peuvent pas se battre n’ont rien à faire ici demain soir. À l’aube, je fais partir Karine et Noa, Paul et Josette, Céline et Théo par la poterne, vers la Poudrerie de Saint-Chamas. Les autres restent. Sœur Agnès aussi : elle ne quittera pas son église, je lui ai déjà demandé deux fois. »',
    choix: [
      {
        label: 'Donner les antibiotiques à Bastien pour Noa',
        si: { objet: 'antibio_veto', pasFlag: 'noa_traitee' },
        effets: { retirer: [['antibio_veto', 1]], flag: 'noa_traitee' },
        texte: 'Tu descends à l’infirmerie réveiller Bastien. Il prend le flacon de Gérard à deux mains, il lit l’étiquette sous sa lampe frontale, et ses yeux se remplissent de larmes. Il fait la première piqûre à Noa sans même la réveiller.\n\nQuand tu remontes au donjon, Hélène t’attend.',
        suivant: 'ref_retour_nuit_2',
      },
      {
        label: '« Vous auriez dû le dire à tout le monde. »',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: '« Et ensuite ? Quatorze personnes qui votent, à minuit, sur la place ? La moitié serait partie dans la plaine avec une lampe de poche, et l’autre moitié se serait barricadée ici en me détestant. » Elle referme son carnet. « Tu peux m’en vouloir. Je m’en veux bien assez toute seule. »',
        suivant: 'ref_retour_nuit_3',
      },
      {
        label: '« À votre place, j’aurais peut-être fait pareil. »',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: 'Hélène te regarde par-dessus ses lunettes, longtemps.\n\n« Non, dit-elle enfin. Toi, tu serais {parti|partie} avec tout le monde, et tu en aurais perdu la moitié en route. » Elle a presque un sourire. « Tu aurais peut-être eu raison. On le saura demain soir. »',
        suivant: 'ref_retour_nuit_3',
      },
      {
        label: 'Te taire et redescendre',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: 'Tu ne dis rien. Tu ranges l’enveloppe dans ta poche, et tu redescends l’escalier. Derrière toi, tu entends Hélène reprendre le combiné et dire, de sa voix ordinaire : « PC Durance, ici Beauvezer. »',
        suivant: 'ref_retour_nuit_3',
      },
    ],
  },

  // Après avoir donné les antibiotiques : la confrontation reprend.
  ref_retour_nuit_2: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: '« Merci pour Noa, dit Hélène. Elle partira à l’aube avec sa mère, avec un peu plus de chances. » Elle pose les mains à plat sur la table, de chaque côté du poste radio. « Maintenant, dis ce que tu as à me dire. »',
    choix: [
      {
        label: '« Vous auriez dû le dire à tout le monde. »',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: '« Et ensuite ? Quatorze personnes qui votent, à minuit, sur la place ? La moitié serait partie dans la plaine avec une lampe de poche, et l’autre moitié se serait barricadée ici en me détestant. » Elle referme son carnet. « Tu peux m’en vouloir. Je m’en veux bien assez toute seule. »',
        suivant: 'ref_retour_nuit_3',
      },
      {
        label: '« À votre place, j’aurais peut-être fait pareil. »',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: 'Hélène te regarde par-dessus ses lunettes, longtemps.\n\n« Non, dit-elle enfin. Toi, tu serais {parti|partie} avec tout le monde, et tu en aurais perdu la moitié en route. » Elle a presque un sourire. « Tu aurais peut-être eu raison. On le saura demain soir. »',
        suivant: 'ref_retour_nuit_3',
      },
      {
        label: 'Te taire et redescendre',
        effets: { flag: 'retour_nuit_fait', flags: { familles_parties: true } },
        texte: 'Tu ne dis rien. Tu ranges l’enveloppe dans ta poche, et tu redescends l’escalier. Derrière toi, tu entends Hélène reprendre le combiné et dire, de sa voix ordinaire : « PC Durance, ici Beauvezer. »',
        suivant: 'ref_retour_nuit_3',
      },
    ],
  },

  ref_retour_nuit_3: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: 'Fernand',
    texte: 'En bas de l’escalier du donjon, Fernand t’attend, assis sur une marche, son bâton entre les genoux.\n\n« Elle me l’a dit le premier soir, une heure avant que tu arrives à la porte, dit-il. Elle m’a demandé de t’emmener à Cabassole, et j’ai dit oui. Les antibiotiques, c’était vrai. Le reste aussi. » Il se relève en grimaçant. « Et toi, tu as ouvert la lettre, et me voilà revenu en pleine nuit à travers la Crau, à mon âge. »\n\nIl regarde le ciel, encore noir, du côté de la mer.\n\n« On a peut-être bien fait. On le saura à six heures. Va dormir un peu : demain, personne ne dormira. »',
    choix: [
      {
        label: 'Dormir quelques heures',
        effets: { teleporter: { lieu: 'miramas_le_vieux', entree: 'place' }, journal: '{Rentré|Rentrée} au Refuge en pleine nuit avec Fernand. J’ai mis Hélène face à sa lettre : elle a tout avoué. Les avions viendront à six heures sur la gare de triage, et il y a du chlore dans les wagons. À l’aube, Karine et Noa, Paul et Josette, Céline et Théo partent par la poterne vers la Poudrerie de Saint-Chamas. Les autres restent pour tenir les murs.' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE REFUGE TOMBÉ (acte V) ───────────────────────────
  // Déclencheur : entrée dans miramas_le_vieux après la fuite (refuge_fui), une fois.
  ref_ruines: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: null,
    texte: 'La porte Notre-Dame ne fermera plus jamais : un des battants pend sur un seul gond, et les palettes sont éparpillées sur l’esplanade, noircies par le feu. Dans le village, des toits se sont effondrés autour de la place. Ça sent le bois mouillé, la viande, et très faiblement, l’eau de Javel.\n\nLes morts qui sont restés tournent lentement dans les ruelles, sans but, et presque tous ont la tête tournée vers l’église.\n\nLa porte de l’église est ouverte. Au pied du clocher, la corde de la cloche pend jusqu’au sol, et en dessous, il y a Fernand. Tu le reconnais à son bâton de buis, encore serré dans sa main, et à sa casquette de toile. Le reste, les morts l’ont pris. Il a dû sonner très longtemps.\n\nEn bas de la place, dans la maison de la radio, le poste d’Inès est toujours allumé. Ses petits voyants verts clignotent dans le noir, et toutes les heures, branché sur sa batterie et sur le panneau solaire du toit, il envoie la voix d’une jeune fille sur toute la plaine : « Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants. Venez à la porte Notre-Dame… »\n\nEn haut du rocher, la fenêtre du donjon est noire.',
    choix: [
      { label: 'Monter au donjon', si: { flag: 'helene_sauvee' }, suivant: 'ref_ruines_vide' },
      { label: 'Monter au donjon', si: { pasFlag: 'helene_sauvee' }, suivant: 'ref_ruines_helene' },
    ],
  },

  ref_ruines_vide: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: null,
    texte: 'La porte du donjon a été enfoncée, et la pièce est sens dessus dessous : la chaise est renversée, le lit de camp retourné, le poste militaire arraché de la table et piétiné. Mais il n’y a pas de sang, et la fenêtre est grande ouverte sur le vide, avec une corde nouée au montant, qui descend vers les rochers de l’est.\n\nHélène est passée par là, comme elle l’avait dit.\n\nSous la table, il y a un cahier d’écolier à couverture bleue, tombé dans la bagarre : son cahier de radio. Tu reconnais sa petite écriture droite à chaque page.',
    choix: [{ label: 'Prendre le cahier', effets: { document: 'doc_carnet_helene' }, suivant: 'ref_ruines_radio' }],
  },

  ref_ruines_helene: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: null,
    texte: 'La porte du donjon a été enfoncée, puis quelqu’un l’a refermée de l’intérieur et l’a calée avec le lit de camp. Tu dois pousser de tout ton poids pour entrer.\n\nHélène est assise à sa table, la tête posée sur ses bras croisés, comme quelqu’un qui s’est endormi en travaillant. Elle a encore ses lunettes au bout de leur cordon. Sur son avant-bras gauche, à travers la manche déchirée de son pull, tu vois la morsure, bien nette. Par terre, sous sa main qui pend, il y a le pistolet des gendarmes.\n\nElle a été mordue en repoussant les morts dans l’escalier, elle a barricadé la porte, elle a fini ce qu’elle avait à dire à la radio, et elle n’a pas voulu se relever comme eux.\n\nÀ côté du combiné, il y a un cahier d’écolier à couverture bleue, refermé avec soin, et posé bien droit : son cahier de radio.',
    choix: [
      {
        label: 'Prendre le cahier, et fermer ses yeux',
        effets: { document: 'doc_carnet_helene' },
        suivant: 'ref_ruines_radio',
      },
      {
        label: 'Prendre le cahier et le pistolet',
        effets: { document: 'doc_carnet_helene', objet: ['pistolet_9mm', 1] },
        texte: 'Le chargeur ne contient plus que deux balles. Tu ranges le pistolet dans ton sac, et tu fermes les yeux d’Hélène, parce que quelqu’un doit le faire.',
        suivant: 'ref_ruines_radio',
      },
    ],
  },

  // La radio d'Inès appelle toujours les survivants vers le village mort.
  ref_ruines_radio: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: null,
    texte: 'En redescendant, tu entres dans la maison de la radio, à côté de l’infirmerie. Le poste d’Inès est toujours là, sur son bureau, avec son micro, le casque posé à côté et la feuille du message scotchée au mur. L’heure tourne sur le cadran, et l’enregistrement se relance tout seul :\n\n« Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants. Venez par la route de Saint-Chamas, à la porte Notre-Dame. Montrez vos mains. »\n\nQuelque part dans le pays, quelqu’un l’écoute peut-être en ce moment, et il se met en route.',
    choix: [
      {
        label: 'Couper la radio',
        effets: {
          flag: 'radio_coupee',
          flags: { refuge_revu: true },
          journal: 'Je suis {revenu|revenue} au Refuge. Fernand est mort au pied du clocher, son bâton à la main. J’ai trouvé le cahier de radio d’Hélène. Et j’ai coupé la radio d’Inès, qui appelait encore les survivants vers un village plein de morts.',
        },
        suivant: '#fin',
      },
      {
        label: 'Laisser la voix d’Inès appeler',
        effets: {
          flag: 'refuge_revu',
          journal: 'Je suis {revenu|revenue} au Refuge. Fernand est mort au pied du clocher, son bâton à la main. J’ai trouvé le cahier de radio d’Hélène. Je n’ai pas eu le courage de couper la radio d’Inès : elle appelle toujours les survivants vers le village.',
        },
        suivant: '#fin',
      },
    ],
  },
};
