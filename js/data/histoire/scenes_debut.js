// ============ LE DÉBUT — « Le bois » (docs/HISTOIRE_DEBUT_V3.md §3, quête q_debut) ============
// Le fourgon en panne sur la piste du bois de la Barben, le camp, le mas du vallon, la vigie dont la radio ne marche
// pas, le camp attaqué pendant qu'on était là-haut, la voix du Refuge à la radio de René, la route de Vernègues, la porte.
// Règles du propriétaire (RETOURS_JOUEUR #55-62) : au plus trois échanges par scène, pas d'interrogatoire, les gens ne
// parlent que si l'on va vers eux ; on fait les choses dans le monde, une scène ne les fait jamais à ta place.
// Préfixes : bb_ (le bois), vig_ (la vigie), rv_ (la route, rencontres de voyage). Format : docs/REFONTE.md §4.5.
// Charte : docs/CHARTE_ECRITURE.md (récit fluide, phrases liées, sensations par le personnage). Genre : {masculin|féminin}.

export const SCENES_DEBUT = {

  // ─────────────────────────── CO-OP : le second joueur ───────────────────────────
  bb_coop: {
    illu: null, musique: 'sombre', orateur: null,
    texte: 'Ça fait deux jours que le fourgon vous a {ramassé|ramassée}, {coequipier} et toi, au bord de la route de Pélissanne. Six inconnus qui roulaient tous feux éteints se sont serrés à l’arrière pour vous faire de la place, sans poser de questions.\n\nCe soir, pour éviter les morts de la nationale, Thierry a pris une piste de pompiers à travers le bois. Le moteur a toussé au milieu des pins, puis il s’est tu, et personne n’a rien dit pendant un long moment.',
    choix: [{ label: 'Descendre du fourgon', suivant: '#fin' }],
  },

  // ─────────────────────────── RENÉ ───────────────────────────
  // Le vieux du coin : ancien guetteur des pompiers, mauvais genou. Il veille sur le camp.
  bb_rene: {
    illu: null, musique: null, orateur: 'René',
    texte: 'Le vieux est assis sur une souche, une canne de châtaignier entre les genoux. Il a une veste kaki trop grande, avec un écusson des pompiers forestiers à moitié décousu, et il regarde le bois comme on regarde la mer.',
    choix: [
      {
        label: 'Lui demander qui il est', si: { pasFlag: 'rene_presente' },
        texte: '« René. J’ai été guetteur à la vigie pendant vingt-deux étés, là-haut, sur la crête. Je voyais les fumées avant tout le monde. » Il tapote son genou. « Maintenant, je ne monte plus nulle part. Ils m’ont pris à Pélissanne, avec la petite blessée. Sans eux, je serais encore assis devant ma porte. »',
        effets: { flag: 'rene_presente' }, suivant: 'bb_rene',
      },
      {
        label: 'Parler du fourgon', si: { pasFlag: 'vivres_faits' },
        texte: '« Thierry dit que c’est la pompe, ou le filtre. » René hausse les épaules. « Moi, je dis qu’il n’y a plus de gasoil propre nulle part depuis trois semaines, et qu’il a rempli son réservoir avec n’importe quoi. Ce soir, on dort ici. J’ai tendu un fil en travers de la piste : si quelque chose passe, on l’entendra. »',
        suivant: 'bb_rene',
      },
      {
        label: 'Parler du mas', si: { quete: ['q_debut', 'vivres'] },
        texte: '« Le mas des Arnaud, en bas du sentier. Il y a des vignes que personne n’aura vendangées, un figuier, un puits, et Paulette faisait des conserves pour tout le quartier. » Il se tait un moment. « Ils étaient vieux, tous les deux. S’ils sont encore là, ils ne sont plus eux-mêmes. Prends ce que tu trouves et range-le dans la caisse, près du fourgon. Martine comptera. »',
        suivant: 'bb_rene',
      },
      {
        label: 'Parler du camp', si: { quete: ['q_debut', 'camp'] },
        texte: '« Le feu, tu le fais dans le creux, sous les trois pins : de la piste, on ne le verra pas. Des branches, tu en coupes dans les buissons, et il y a du bois mort partout. Pour les boîtes, Martine garde les vides dans son sac, et du fil de fer, il y en a sur les vignes du mas et dans la remise. La bâche est à l’arrière du fourgon. » Il a un petit sourire. « Toi, tu construis. Moi, je te regarde, et je critique. »',
        suivant: 'bb_rene',
      },
      { label: 'Parler de la vigie', si: { quete: ['q_debut', 'vigie'] }, suivant: 'bb_rene_vigie' },
      { label: 'Partir', suivant: '#fin' },
    ],
  },
  bb_rene_vigie: {
    illu: null, musique: null, orateur: 'René',
    texte: '« Tout droit par le pare-feu, au nord de la piste, et tu ne le quittes pas jusqu’en haut. Une heure de marche, si tu ne traînes pas. Le poste radio est dans la cabine, sur la table : tu l’allumes, tu prends le combiné, et tu parles. »',
    choix: [
      { label: 'Y monter maintenant', effets: { voyage: { vers: 'vigie_barben', indication: true }, journal: 'Je monte à la vigie par le pare-feu, pour appeler à l’aide avec la radio des pompiers.' }, suivant: '#fin' },
      { label: 'Pas tout de suite', suivant: 'bb_rene' },
    ],
  },

  // ─────────────────────────── LAURA ───────────────────────────
  bb_laura: {
    illu: null, musique: null, orateur: 'Laura',
    texte: 'La jeune femme est allongée sur une couverture, adossée à un pin, la jambe gauche enroulée dans un tee-shirt noué. Elle a une vingtaine d’années, un sweat de la fac d’Aix, et les lèvres sèches de quelqu’un qui a de la fièvre. Quand tu t’approches, elle tire la couverture sur sa jambe.\n\n« C’est du barbelé, dit-elle avant que tu aies ouvert la bouche. Une clôture, à Pélissanne, en sautant. Je te jure que c’est du barbelé. »',
    choix: [
      {
        label: 'Regarder sa jambe', si: { pasFlag: 'laura_jambe_vue' },
        texte: 'Elle hésite, puis elle te laisse dénouer le tee-shirt. Sur le mollet, il y a une plaie en croissant, profonde, aux bords violacés, qui suinte un peu. Ça pourrait être un fil de fer qui a déchiré la chair en tournant. Ça pourrait aussi être autre chose.\n\nTu renoues le tee-shirt sans rien dire, et elle te regarde faire sans rien dire non plus.',
        effets: { flag: 'laura_jambe_vue' }, suivant: '#fin',
      },
      {
        label: 'Lui demander d’où elle vient',
        texte: '« D’Aix. J’étais en master de lettres, je rentrais chez mes parents à Salon pour le week-end. » Elle sourit à moitié. « C’était le premier week-end de septembre. Je ne suis jamais arrivée chez eux. »',
        suivant: '#fin',
      },
      { label: 'La laisser se reposer', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LE MATIN DU JOUR 2 : manger ───────────────────────────
  // Déclencheur : jour 2, 7 h, pendant l'étape « panne ».
  bb_matin: {
    illu: null, musique: 'calme', orateur: 'René',
    texte: 'Le jour se lève gris et froid sur les pins. Thierry est déjà sous le capot, et à côté de la caisse, Martine compte à voix basse ce qui reste : un demi-paquet de biscuits et une boîte de thon, pour sept.\n\nRené vient s’asseoir près de toi en grimaçant à cause de son genou. « En bas du sentier, dans le vallon, il y a le mas des Arnaud, avec des vignes, un puits et un potager. Je viendrais bien, mais je te ralentirais. » Il regarde le gamin qui joue avec un bâton près du fourgon. « Rapporte ce que tu peux, et range-le dans la caisse. »',
    choix: [
      {
        label: 'Descendre au mas',
        effets: {
          quete: ['q_debut', 'vivres'], mission: ['accepter', 'm_vivres'],
          journal: 'Le fourgon ne repart pas, et il n’y a plus rien à manger pour sept. René m’envoie au mas des Arnaud, en bas du sentier du vallon : des vignes, un potager, un puits. Je dois ranger ce que je rapporte dans la caisse du camp.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE CAMP ───────────────────────────
  // Déclencheur : flag vivres_faits (la mission m_vivres est remplie).
  bb_camp: {
    illu: null, musique: 'calme', orateur: 'René',
    texte: 'Martine sort tout de la caisse et le range par terre, en rangées, pour compter. Elle compte deux fois, en remuant les lèvres, puis elle remet tout dans la caisse sans rien dire, et elle te serre le bras, très fort, une seconde.\n\nC’est à ce moment-là que Thierry referme le capot, si fort que tout le monde sursaute. Il reste un moment les deux mains posées dessus, la tête baissée. « La pompe est morte, dit-il sans se retourner. Sans pièce, il ne repartira pas. »\n\nPersonne ne répond. Au bout d’un moment, René plante sa canne dans la terre et se relève. « Alors on reste quelques jours, et si on reste, il faut un vrai camp : un feu qu’on ne voie pas de la piste, une ligne de boîtes tout autour, et un abri pour la petite. » Il sort un briquet de sa poche et te le met dans la main. « Le feu, tu le fais dans le creux, sous les trois pins. »',
    choix: [
      {
        label: 'Prendre le briquet',
        effets: {
          objet: ['briquet', 1], quete: ['q_debut', 'camp'], mission: ['accepter', 'm_camp'],
          journal: 'Thierry dit que la pompe du fourgon est morte. On reste. René m’a donné son briquet : il faut un feu dans le creux, sous les pins, une ligne de boîtes de conserve sur un fil tout autour du camp, et un abri de branches et de bâche pour Laura.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LES BOÎTES ───────────────────────────
  // Déclencheur : le soir (21 h), une fois le camp monté.
  bb_boites: {
    illu: null, musique: 'tension', orateur: null,
    texte: 'Il fait nuit noire quand les boîtes se mettent à sonner. C’est un petit bruit de ferraille, ridicule, qui part du côté des pins et qui ne s’arrête pas.\n\nAutour du feu, plus personne ne bouge. Sandrine a plaqué la main sur la bouche de son fils. René s’est levé sans un bruit, sa canne tenue à deux mains comme un manche de pioche, et il te fait signe de venir.\n\nEntre les troncs, une silhouette avance en traînant les pieds, la tête penchée sur l’épaule, et les boîtes lui pendent encore à la cheville.',
    choix: [
      { label: 'Aller au-devant du mort', effets: { combat: { zombies: ['errant'] } }, suivant: 'bb_boites_2' },
    ],
  },
  bb_boites_2: {
    illu: null, musique: 'sombre', orateur: 'René',
    texte: 'Après, tu restes un long moment debout dans le noir, le souffle court, avec cette odeur sur les mains. René ramasse les boîtes et retend le fil sans rien dire. Quand il a fini, il te pose la main sur l’épaule.\n\n« Tu vois, ça sert. » Puis il se rassoit près du feu, et il ne dort pas de la nuit.',
    choix: [
      { label: 'Retourner près du feu', effets: { flag: 'boites_sonnees', journal: 'Cette nuit, les boîtes ont sonné : un mort est sorti des pins, attiré par nous. Je l’ai arrêté avant le camp. René dit que ça sert.' }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LA VIGIE (le départ) ───────────────────────────
  // Déclencheur : le matin qui suit la nuit des boîtes (7 h - 10 h).
  bb_vigie: {
    illu: null, musique: 'calme', orateur: 'René',
    texte: 'Au matin, René te tend une bouteille d’eau qu’il a fait bouillir sur le feu, et il te montre le nord, où le pare-feu monte tout droit entre deux murs de pins.\n\n« Il n’y a plus de réseau depuis le 6. Mais là-haut, sur la crête, il y a la vigie des pompiers, avec un poste radio qui marche sur batterie. Si quelqu’un écoute encore, l’armée, les pompiers, n’importe qui, c’est là qu’on l’entendra. » Il frotte son genou. « Moi, je ne monterai pas. Une heure de marche par le pare-feu, et tu ne le quittes pas. »\n\nDerrière lui, Mathis demande s’il peut venir, et sa mère répond non avant qu’il ait fini sa phrase.',
    choix: [
      {
        label: 'Monter à la vigie',
        effets: { objet: ['bouteille_eau', 1], quete: ['q_debut', 'vigie'], voyage: { vers: 'vigie_barben', indication: true }, journal: 'René m’envoie à la vigie des pompiers, sur la crête, par le pare-feu : il y a là-haut une radio sur batterie. Si quelqu’un écoute encore, on viendra peut-être nous chercher.' },
        suivant: '#fin',
      },
      {
        label: 'Partir plus tard',
        effets: { objet: ['bouteille_eau', 1], quete: ['q_debut', 'vigie'], journal: 'René voudrait que je monte à la vigie des pompiers, sur la crête, par le pare-feu, pour appeler à l’aide avec la radio. Je partirai quand je serai {prêt|prête}.' },
        suivant: '#fin',
      },
    ],
  },
  // Marqueur 'pare_feu' (le bas du pare-feu), pendant l'étape « vigie ».
  bb_pare_feu: {
    illu: null, musique: null, orateur: null,
    texte: 'Le pare-feu monte tout droit vers la crête, une large bande de cailloux et d’herbe sèche entre deux murs de pins. Tout en haut, contre le ciel, tu devines la silhouette carrée de la vigie.',
    choix: [
      { label: 'Monter à la vigie', effets: { voyage: { vers: 'vigie_barben', indication: true } }, suivant: '#fin' },
      { label: 'Pas maintenant', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LA VIGIE ───────────────────────────
  // Déclencheur : entrée dans vigie_barben pendant l'étape « vigie ». Pendant ce temps, au camp… (camp_attaque)
  vig_arrivee: {
    illu: null, musique: 'calme', orateur: null,
    texte: 'Le pare-feu monte plus raide que tu ne l’aurais cru. Tu t’arrêtes trois fois pour reprendre ton souffle, et à chaque fois, le camp est plus petit en bas, jusqu’à ce qu’il disparaisse sous les pins.\n\nAu sommet, le vent souffle fort et sent le romarin. La vigie est une tour de pierre carrée, avec une cabine vitrée tout en haut. La porte du bas est fermée, mais pas à clé.',
    choix: [
      { label: 'Approcher de la tour', effets: { flag: 'camp_attaque', quete: ['q_debut', 'vigie_haut'] }, suivant: '#fin' },
    ],
  },
  // Déclencheur : entrée dans la cabine.
  vig_cabine: {
    illu: null, musique: 'calme', orateur: null,
    texte: 'La cabine est vitrée sur les quatre côtés, et d’ici, tu vois tout le pays. Au sud-ouest, Salon fume encore, une longue traînée grise couchée par le vent. Plus près, le château de la Barben s’accroche à son rocher au-dessus de la Touloubre, et au fond, l’étang de Berre brille comme une tôle.\n\nAu nord, sur une colline pelée, il y a des ruines, un village entier sans toits, avec un morceau de clocher. C’est le Vieux-Vernègues, tombé pendant le tremblement de terre de 1909. Et au-dessus des ruines, en plein jour, monte un filet de fumée mince et droit, comme celle d’un feu qu’on entretient.',
    choix: [
      { label: 'Regarder la fumée', effets: { flag: 'vigie_vue', journal: 'De la vigie, on voit tout : Salon qui fume, le château de la Barben, l’étang. Au nord, au-dessus des ruines du Vieux-Vernègues, un filet de fumée monte en plein jour, comme d’un feu qu’on entretient.' }, suivant: '#fin' },
    ],
  },
  // Marqueur 'radio_vigie' (le poste radio de la cabine).
  vig_radio: {
    illu: null, musique: null, orateur: null,
    texte: 'Le poste radio des pompiers est posé sur la table, un gros boîtier gris avec un combiné au bout d’un fil en spirale. Quand tu appuies sur l’interrupteur, un voyant vert s’allume : la batterie marche.\n\nTu prends le combiné, tu appuies sur le bouton et tu parles. Tu dis où tu es, combien vous êtes, qu’il y a un enfant et une blessée. Personne ne répond. Il n’y a même pas de grésillement, seulement un silence plat, parce que le poste n’entend rien.\n\nTu suis le câble de l’antenne jusqu’à la fenêtre, puis dehors : il a été coupé net, à hauteur d’homme, d’un seul coup de pince.',
    choix: [
      { label: 'Reposer le combiné', effets: { flag: 'radio_vigie_vue', pensee: 'Quelqu’un a coupé ce câble. Pas le vent.', journal: 'La radio de la vigie ne capte rien : le câble de l’antenne a été coupé net, d’un coup de pince. Personne ne viendra nous chercher.' }, suivant: '#fin' },
    ],
  },
  // Zone au bout du chemin, une fois la cabine vue.
  vig_redescendre: {
    illu: null, musique: null, orateur: null,
    texte: 'En bas, le pare-feu redescend vers la piste et vers le camp. Le soleil a déjà bien tourné.',
    choix: [
      { label: 'Redescendre au camp', effets: { quete: ['q_debut', 'retour'], voyage: { vers: 'bois_barben', indication: true } }, suivant: '#fin' },
      { label: 'Rester encore un peu', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LE RETOUR ───────────────────────────
  // Déclencheur : entrée dans bois_barben après l'attaque.
  bb_retour: {
    illu: null, musique: 'sombre', orateur: null,
    texte: 'Tu entends le silence avant de voir quoi que ce soit. Il n’y a pas de voix autour du feu, pas de clé qui cogne sous le capot, rien que le vent dans les pins.\n\nLe fourgon n’est plus sur la piste. Le feu a été piétiné, et les cendres sont froides. Sous un pin, René est assis par terre, une main contre son front, et du sang a séché le long de sa joue jusque dans son col.\n\n« Ils sont partis, dit-il quand il te voit. Je ne sais pas. Un mort m’a fait tomber, je crois, et quand je me suis relevé, il n’y avait plus le fourgon. » Il te regarde sans te voir. « Le petit. Je ne sais pas où est le petit. »',
    choix: [
      {
        label: 'Chercher Mathis',
        effets: {
          flag: 'retour_vu', quete: ['q_debut', 'chercher'],
          journal: 'En redescendant de la vigie, j’ai trouvé le camp vide. Le fourgon est parti, et avec lui Thierry, Martine et Sandrine. René est blessé au front et ne se souvient de rien. Laura est toujours là. Mathis a disparu.',
        },
        suivant: '#fin',
      },
    ],
  },
  bb_rene_apres: {
    illu: null, musique: null, orateur: 'René',
    texte: 'René est assis sous son pin, sa canne en travers des genoux. Il a nettoyé le sang de son visage avec de l’eau de la gourde, mais pas celui de son col.',
    choix: [
      {
        label: 'Lui demander ce qu’il a vu',
        texte: '« Des lumières, peut-être. Un moteur. » Il secoue la tête et grimace. « Je ne sais plus, je te dis. J’étais au fil, je regardais la piste, et après, j’étais par terre avec la tête qui sonnait. Un mort, sûrement. Qu’est-ce que tu veux que ce soit d’autre ? »',
        suivant: 'bb_rene_apres',
      },
      {
        label: 'Parler de la caisse',
        texte: '« Ils ont laissé la caisse. » Il a un petit rire sans joie. « Tu comprends ça, toi ? Ils prennent le fourgon, ils laissent un vieux, une blessée et un gosse, et ils nous laissent à manger. Comme on laisse une gamelle au chien qu’on abandonne sur l’autoroute. »',
        suivant: 'bb_rene_apres',
      },
      { label: 'Partir', suivant: '#fin' },
    ],
  },
  bb_laura_apres: {
    illu: null, musique: null, orateur: 'Laura',
    texte: 'Laura n’a pas bougé de sa couverture. Elle tremble, alors qu’il ne fait pas froid, et elle te prend le poignet quand tu te penches sur elle.\n\n« Ce n’étaient pas des morts, souffle-t-elle. Ils parlaient. Il y en a un qui riait. » Ses yeux brillent de fièvre. « Je les ai entendus. Tu me crois, toi ? »',
    choix: [
      { label: 'Lui dire que tu la crois', effets: { flag: 'laura_crue' }, suivant: '#fin' },
      { label: 'Lui dire qu’elle a de la fièvre', suivant: '#fin' },
    ],
  },
  // Mathis, caché dans le roncier
  bb_mathis: {
    illu: null, musique: 'sombre', orateur: 'Mathis',
    texte: 'Tu entends d’abord un reniflement, tout au fond du roncier. Mathis est roulé en boule sous les ronces, les bras griffés jusqu’au sang, et il ne veut pas sortir.\n\n« Maman a dit de me cacher et de pas sortir, même si elle m’appelait. » Il parle très vite, à voix basse. « Il y avait des moteurs, et des gens qui parlaient fort, et maman qui disait mon prénom tout doucement, pour que je reste caché. Après, ils sont partis. »',
    choix: [
      {
        label: 'Lui tendre la main',
        texte: 'Il met longtemps à la prendre. Quand il sort enfin des ronces, il se colle contre toi et ne te lâche plus la manche.',
        effets: { flag: 'mathis_trouve', quete: ['q_debut', 'nuit3'], pensee: 'Sa mère lui a dit de se cacher. Elle savait.', journal: 'J’ai trouvé Mathis caché au fond d’un roncier. Sa mère lui avait dit de ne pas sortir, même si elle l’appelait. Il a entendu des moteurs et des gens qui parlaient fort. Ce n’est pas ce que les morts font.' },
        suivant: '#fin',
      },
    ],
  },
  // Si l'on ne l'a pas trouvé à la nuit : il sort tout seul.
  bb_mathis_sort: {
    illu: null, musique: 'sombre', orateur: null,
    texte: 'Quand la nuit tombe, tu entends des pas dans les ronces, derrière le camp. C’est Mathis. Il sort tout seul de sa cachette, les bras griffés, et il vient s’asseoir contre toi sans un mot.\n\nPlus tard, à voix basse, il te raconte que sa mère lui avait dit de se cacher et de ne pas sortir, même si elle l’appelait. Il a entendu des moteurs, et des gens qui parlaient fort. Après, ils sont partis.',
    choix: [
      { label: 'Le garder près de toi', effets: { flag: 'mathis_trouve', quete: ['q_debut', 'nuit3'], journal: 'À la nuit, Mathis est sorti tout seul du roncier où il se cachait. Sa mère lui avait dit de ne pas sortir, même si elle l’appelait. Il a entendu des moteurs et des gens qui parlaient fort.' }, suivant: '#fin' },
    ],
  },
  bb_mathis_apres: {
    illu: null, musique: null, orateur: 'Mathis',
    texte: 'Mathis est assis près de toi, les genoux sous le menton.',
    choix: [
      {
        label: 'Lui demander s’il a faim',
        texte: 'Il fait non de la tête, puis il prend quand même ce que tu lui tends, et il le mange très lentement, en regardant la piste.',
        suivant: '#fin',
      },
      {
        label: 'Lui parler de sa mère',
        texte: '« Elle va revenir, dit-il. Elle a dit de rester caché, alors elle va revenir. » Il te regarde. « Hein ? »',
        suivant: '#fin',
      },
      { label: 'Le laisser tranquille', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LA RADIO ───────────────────────────
  // Déclencheur : la nuit qui suit le retour (22 h), une fois Mathis retrouvé.
  bb_radio: {
    illu: null, musique: 'sombre', orateur: 'René',
    texte: 'Il est tard. Mathis s’est endormi contre toi, et Laura gémit doucement dans son sommeil. René a sorti de sa poche un petit transistor qu’il écoute tous les soirs pour la météo, par habitude, même quand il n’y a plus de météo, et il tourne la molette lentement, de grésillement en grésillement.\n\nTout à coup, une voix de jeune fille sort du haut-parleur, faible et un peu nasillarde : « … Ici le Refuge du Vieux-Vernègues. Nous accueillons les survivants. Montez par le chemin du château, jusqu’à la porte de la chapelle. Montrez vos mains. » Puis le message recommence, mot pour mot.\n\nRené lève les yeux vers toi. « Vernègues. Ta fumée de là-haut. »',
    choix: [
      {
        label: 'Partir à l’aube',
        effets: {
          flag: 'radio_refuge', decouvrir: ['vernegues'], quete: ['q_debut', 'route'],
          journal: 'Cette nuit, le transistor de René a capté une voix de jeune fille : « Ici le Refuge du Vieux-Vernègues. Nous accueillons les survivants. » C’était donc ça, la fumée que j’ai vue de la vigie. Nous partirons à l’aube, René, Laura, Mathis et moi.',
        },
        suivant: '#fin',
      },
    ],
  },
  // Déclencheur : l'aube qui suit la radio.
  bb_depart: {
    illu: null, musique: 'calme', orateur: null,
    texte: 'À l’aube, vous rassemblez ce qui reste. René coupe une deuxième canne pour Laura, qui ne pose presque plus le pied par terre, et Mathis s’accroche à ta manche sans qu’on le lui demande.\n\nAvant de partir, René regarde longtemps la place vide du fourgon, puis il crache par terre et tourne le dos à la piste. « Une dizaine de kilomètres, par les vignes et le temple de Château-Bas. Avec nous deux, il faudra la journée. »',
    choix: [
      { label: 'Partir pour Vernègues', effets: { flag: 'depart_vernegues', voyage: { vers: 'vernegues', indication: true }, journal: 'Nous partons pour le Vieux-Vernègues, à pied, par les vignes et le temple de Château-Bas.' }, suivant: '#fin' },
      { label: 'Prendre encore quelques affaires', suivant: '#fin' },
    ],
  },
  // René, au moment du départ (si l'on a voulu prendre encore des affaires)
  bb_rene_depart: {
    illu: null, musique: null, orateur: 'René',
    texte: 'René est debout sur la piste, appuyé sur sa canne. Laura s’est assise sur la caisse, et Mathis lance des cailloux dans les pins, un par un.\n\n« Quand tu veux. Mais pas trop tard : je ne veux pas marcher de nuit avec eux. »',
    choix: [
      { label: 'Partir pour Vernègues', effets: { flag: 'depart_vernegues', voyage: { vers: 'vernegues', indication: true }, journal: 'Nous partons pour le Vieux-Vernègues, à pied, par les vignes et le temple de Château-Bas.' }, suivant: '#fin' },
      { label: 'Encore un moment', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LA ROUTE DE VERNÈGUES (rencontres de voyage) ───────────────────────────
  rv_chateau_bas: {
    illu: 'plaine_route', musique: 'calme', orateur: null,
    texte: 'Au milieu des vignes de Château-Bas, il y a un temple romain, ou ce qu’il en reste : une colonne debout, un morceau de mur, des blocs couchés dans l’herbe. Vous vous arrêtez à l’ombre de la colonne, parce que Laura ne peut plus avancer.\n\nMathis fait le tour des pierres en comptant ses pas. Puis il revient s’asseoir près de René. « Maman, elle sera à Vernègues ? » René met longtemps à répondre. « Peut-être, petit. »',
    choix: [
      { label: 'Laisser Laura se reposer une heure', effets: { tempsMin: 60, journal: 'Nous nous sommes arrêtés au temple romain de Château-Bas, au milieu des vignes. Laura ne tient presque plus debout. Mathis a demandé si sa mère serait à Vernègues.' }, suivant: '#fin' },
      { label: 'Repartir tout de suite', suivant: '#fin' },
    ],
  },
  rv_village_neuf: {
    illu: 'plaine_route', musique: 'tension', orateur: null,
    texte: 'Le village neuf de Vernègues est au pied de la colline, et il est plein de morts. Ils sont une dizaine dans la grand-rue, debout entre les voitures, immobiles, la tête tournée vers quelque chose que tu ne vois pas. Au-dessus des toits, sur la colline, tu reconnais les ruines et le filet de fumée.\n\nRené pose la main sur l’épaule de Mathis. « Par la grand-rue, c’est cinq minutes. Par les vergers, c’est une heure, et Laura ne la tiendra pas. »',
    choix: [
      { label: 'Traverser la grand-rue en silence', effets: { combat: { zombies: ['errant', 'errant'] }, journal: 'Nous avons traversé le village neuf de Vernègues par la grand-rue, au milieu des morts. Deux nous ont vus.' }, suivant: '#fin' },
      { label: 'Contourner par les vergers', effets: { tempsMin: 60, fatigue: -10, journal: 'Nous avons contourné le village neuf de Vernègues par les vergers. Laura a marché une heure de plus, appuyée sur moi.' }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── LA PORTE ───────────────────────────
  rv_porte_vernegues: {
    illu: 'nuit_campagne', musique: 'tension', orateur: null,
    texte: 'Le chemin monte entre les ruines, des murs sans toit où poussent des figuiers. Le soleil se couche quand vous arrivez devant la chapelle, dont la porte est murée de parpaings jusqu’à hauteur d’homme. Une lampe s’allume au-dessus et vous prend en plein visage.\n\n« Stop ! Montrez vos mains ! » C’est une voix d’homme, vieille et rauque. Vous levez les mains, vous remontez vos manches, et vous tournez vos bras dans la lumière, l’un après l’autre. Mathis le fait aussi, très sérieusement, comme s’il avait toujours su qu’il faudrait le faire.\n\nPuis la lampe s’arrête sur la jambe de Laura, et elle ne bouge plus. « Elle, qu’est-ce qu’elle a, à la jambe ? »\n\nÀ côté de toi, René plisse les yeux vers la lumière. « Lucien ? C’est toi, Lucien ? » La lampe tremble un peu. « René… » Puis la voix reprend, plus basse : « René, je ne peux pas laisser entrer quelqu’un avec une jambe comme ça. Tu le sais. »',
    choix: [
      { label: 'Jurer que c’est du barbelé', effets: { flag: 'laura_quarantaine', journal: 'À la porte du Refuge du Vieux-Vernègues, j’ai juré que la jambe de Laura, c’était du barbelé. On l’a mise en quarantaine dans une cave, seule. René connaît le guetteur de la porte : Lucien, celui de la vigie.' }, suivant: 'rv_porte_barbele' },
      { label: 'Entrer, et laisser Laura dehors', effets: { flag: 'laura_dehors', journal: 'À la porte du Refuge du Vieux-Vernègues, on n’a pas voulu de Laura à cause de sa jambe. Je suis {entré|entrée} avec René et Mathis, et je l’ai laissée dehors, assise sur une pierre.' }, suivant: 'rv_porte_dehors' },
      { label: 'Rester dehors avec elle', effets: { flag: 'reste_avec_laura', journal: 'À la porte du Refuge du Vieux-Vernègues, on n’a pas voulu de Laura à cause de sa jambe. René et Mathis sont entrés. Moi, je suis {resté|restée} dehors avec elle, contre le mur de la chapelle.' }, suivant: 'rv_porte_reste' },
    ],
  },
  // Les trois façons de finir la nuit à la porte : chacune dit ce qui s'est passé, puis ce qui reste (le début s'arrête ici).
  rv_porte_barbele: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'Tu dis que c’est du barbelé, une clôture à Pélissanne, que tu as vu la plaie, que tu en es {sûr|sûre}. Tu le dis trop vite, et tout le monde l’entend. Là-haut, il y a un long silence, puis on discute à voix basse derrière les parpaings.\n\n« Quarantaine, dit enfin Lucien. Elle passe la nuit dans la cave à côté, seule, enfermée, et si elle a encore de la fièvre demain, elle repart. » Laura ne dit rien. Elle serre ta main si fort que ça te fait mal, puis elle la lâche et elle suit l’homme qui descend lui ouvrir la cave.\n\nCette nuit-là, pour la première fois depuis longtemps, il y a des murs entre toi et les morts. Ce ne sont que des ruines couvertes de bâches, mais quelqu’un veille dessus. Tu penses au fourgon, à Sandrine qui disait le prénom de son fils tout bas, au câble coupé net de la vigie, et à ces traces de pneus trop larges qui repartaient vers l’est. Tu ne sais toujours pas ce qui est arrivé au camp, mais tu sais que ce n’étaient pas les morts.',
    choix: [{ label: 'Continuer', effets: { flag: 'fin_debut' }, suivant: '#fin' }],
  },
  rv_porte_dehors: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'Tu ne dis rien. René non plus. Laura comprend avant tout le monde : elle lâche ton bras, et elle s’assoit sur une pierre au bord du chemin, sa canne en travers des genoux, comme René au camp. « Ça va, dit-elle. Allez-y. Je vais attendre un peu, et je verrai demain. »\n\nCette nuit-là, pour la première fois depuis longtemps, il y a des murs entre toi et les morts, et Laura est de l’autre côté. Tu ne dors pas. Tu penses au fourgon, à Sandrine qui disait le prénom de son fils tout bas, au câble coupé net de la vigie, et à ces traces de pneus trop larges qui repartaient vers l’est. Tu ne sais toujours pas ce qui est arrivé au camp, mais tu sais que ce n’étaient pas les morts.',
    choix: [{ label: 'Continuer', effets: { flag: 'fin_debut' }, suivant: '#fin' }],
  },
  rv_porte_reste: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: '« Alors je reste avec elle cette nuit », dis-tu. René te regarde longtemps, puis il pousse Mathis vers la porte, et le petit se retourne trois fois avant de disparaître derrière les parpaings.\n\nTu t’assois contre le mur de la chapelle, Laura contre ton épaule, dans le noir qui tombe sur les ruines. Au bout d’un moment, quelqu’un fait descendre au bout d’une corde une couverture et une bouteille d’eau, sans un mot. Il n’y a qu’un mur entre toi et les morts, cette nuit, et tu es du mauvais côté.\n\nLaura finit par s’endormir. Toi, tu penses au fourgon, à Sandrine qui disait le prénom de son fils tout bas, au câble coupé net de la vigie, et à ces traces de pneus trop larges qui repartaient vers l’est. Tu ne sais toujours pas ce qui est arrivé au camp, mais tu sais que ce n’étaient pas les morts.',
    choix: [{ label: 'Continuer', effets: { flag: 'fin_debut' }, suivant: '#fin' }],
  },
};
