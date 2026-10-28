// ============ ACTE V et FINAL — « Le pont » (jours 6 à 15, puis 22 ; quête q_pont) — docs/HISTOIRE.md §6-7 ============
// Les dispersés (Bastien à Istres, Karine et Noa à Grans, Rudy au péage de Lançon), la colonne du mardi soir,
// le camp de Mallemort, l'aube du mercredi, le contrôle, la liste d'Hélène, et les quatre fins
// (De l'autre côté, Sa place, La ligne, Encore un jour).
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.

const FIN_PONT = { cinematique: 'fin_pont' };

export const SCENES_PONT = {

  // ─────────────────────────── BASTIEN (Istres) ───────────────────────────
  // Marqueur 'bastien_ist' : l'arrière-boutique d'une pharmacie.
  ist_bastien: {
    illu: 'istres_pharmacie', musique: 'sombre', orateur: 'Bastien',
    texte: 'La pharmacie est au coin d’une rue du centre d’Istres, avec sa croix verte éteinte et sa vitrine étoilée. Derrière le comptoir, la porte de l’arrière-boutique est barricadée de l’intérieur, et tu dois dire ton nom à travers le bois avant qu’on te réponde.\n\n« C’est toi ? » La voix est rauque, cassée, et elle part dans une quinte de toux qui n’en finit pas. « Attends. J’arrive. »\n\nBastien a maigri. Il est assis par terre entre deux étagères de boîtes vides, une couverture de survie sur les épaules, et il respire avec un bruit de soufflet percé. Ses lèvres sont bleues. À côté de lui, il y a un masque à gaz noir de pompier, et deux cartouches filtrantes encore sous plastique.\n\n« La nuit de l’attaque, je suis sorti par la brèche en cherchant Karine et Noa, et je suis descendu vers l’étang. Le lendemain soir, le jaune m’a rattrapé dans les marais. J’ai couru dedans, en respirant à fond, comme un idiot. » Il rit, et la toux le reprend. « C’est du chlore. Au contact de l’eau des poumons, ça fait de l’acide. Les miens ne s’en remettront pas complètement. »\n\nIl reprend son souffle, longtemps. « Ma sœur n’était plus là. Son appartement était ouvert. » Il pousse le masque vers toi du bout du pied. « Je l’ai pris à la caserne des pompiers d’Istres, avec les cartouches. Une cartouche tient à peu près huit heures dans le jaune, et après, l’odeur revient : c’est qu’il faut la changer. Moi, je ne peux plus le porter, je n’ai plus assez de souffle pour respirer à travers. Prends-le. »',
    choix: [
      {
        label: 'Le ramener à Cornillon par les collines',
        effets: {
          flags: { bastien_trouve: true, bastien_cornillon: true },
          quete: ['q_bastien', 'fin'],
          objets: [['masque_gaz', 1], ['filtre_gaz', 2]],
          journal: 'J’ai retrouvé Bastien dans une pharmacie d’Istres, les poumons brûlés par la brume. Il m’a donné un masque à gaz de pompier et deux cartouches : une cartouche tient environ huit heures dans la brume. Il monte à Cornillon par les collines, de jour.',
        },
        suivant: 'ist_bastien_2',
      },
      {
        label: 'Le laisser se reposer ici',
        effets: {
          flag: 'bastien_trouve',
          quete: ['q_bastien', 'fin'],
          objets: [['masque_gaz', 1], ['filtre_gaz', 2]],
          journal: 'J’ai retrouvé Bastien dans une pharmacie d’Istres, les poumons brûlés par la brume. Il m’a donné un masque à gaz de pompier et deux cartouches : une cartouche tient environ huit heures dans la brume. Je l’ai laissé se reposer là-bas.',
        },
        suivant: 'ist_bastien_3',
      },
    ],
  },

  ist_bastien_2: {
    illu: 'istres_pharmacie', musique: 'calme', orateur: 'Bastien',
    texte: 'Bastien se relève en s’appuyant à l’étagère, et il reste un moment plié en deux, le temps de reprendre son souffle.\n\n« Par les collines, alors. Le jaune reste en bas, et moi, je marcherai de jour, lentement, comme un vieux. » Il essaie de sourire. « Deux jours, peut-être trois. Pars devant, je ne veux pas que tu m’attendes à chaque virage. »\n\nIl ramasse son sac, puis il s’arrête.\n\n« Noa, elle est… ? » Il ne finit pas sa question. Il a peur de la réponse, et tu le vois.',
    choix: [{ label: 'Lui donner rendez-vous à Cornillon', suivant: '#fin' }],
  },

  ist_bastien_3: {
    illu: 'istres_pharmacie', musique: 'sombre', orateur: 'Bastien',
    texte: '« Tu as raison, dit Bastien. Je ne tiendrais pas vingt kilomètres. » Il remonte la couverture de survie sur ses épaules, et elle crisse comme du papier. « Ici, j’ai un toit et une porte qui ferme. Et il reste des boîtes au fond dont je n’ai pas encore lu les étiquettes. »\n\nIl te regarde ranger le masque dans ton sac.\n\n« Ne cours jamais dans le jaune. Plus tu respires fort, plus il entre. Marche, et retiens ton souffle aussi longtemps que tu peux. »',
    choix: [{ label: 'Repartir', suivant: '#fin' }],
  },

  // ─────────────────────────── KARINE ET NOA (Grans) ───────────────────────────
  // Marqueur 'karine_gra' : le vieux moulin de Grans, au bord de la Touloubre.
  gra_karine: {
    illu: 'grans_moulin', musique: 'sombre', orateur: 'Karine',
    texte: 'Le vieux moulin de Grans est au bord de la Touloubre, à la sortie du village. C’est une grande bâtisse de pierre dont la roue tourne toute seule dans le courant, avec un grincement de bois mouillé. Sur la berge, une dizaine de morts sont alignés et immobiles ; ils regardent tourner la roue, et ils ne te regardent pas.\n\nTu frappes à la petite porte, côté rivière. Un œil apparaît au judas, puis des verrous claquent.\n\nC’est Karine qui ouvre, un couteau à pain à la main. Derrière elle se tient un vieil homme en tablier de meunier, blanc de farine jusqu’aux sourcils, qui serre une fourche.\n\n« C’est bon, Édouard. Je {le|la} connais. » Karine te fait entrer sans un mot de plus.\n\nDans la pièce du fond, Noa est couchée dans le lit du meunier, sous trois couvertures, à la lueur d’une bougie. Elle a les joues rouges et les yeux trop brillants, et elle respire en sifflant.\n\n« La nuit de l’attaque, on est sorties par la brèche du nord, dit Karine. J’ai couru jusqu’au matin avec elle sur le dos, et Édouard nous a ouvert. Il me livrait la farine, avant. » Elle s’assoit à côté de sa fille. « La fièvre est revenue avant-hier. Il lui faut des antibiotiques, ou Bastien. Ici, elle ne guérira pas toute seule. »',
    choix: [
      {
        label: 'Donner les antibiotiques de Gérard',
        si: { objet: 'antibio_veto', pasFlag: 'noa_traitee' },
        effets: {
          retirer: [['antibio_veto', 1]],
          flags: { noa_traitee: true, noa_retrouvee: true, famille_cornillon: true },
          quete: ['q_karine', 'fin'],
          journal: 'J’ai retrouvé Karine et Noa au vieux moulin de Grans, chez Édouard, le meunier. J’ai donné à Noa l’antibiotique de Gérard. Dès qu’elle tiendra debout, elles monteront à Cornillon.',
        },
        texte: 'Karine prend le flacon brun et le regarde comme si elle ne croyait pas qu’il existe. Édouard lui tend une seringue de vétérinaire qu’il gardait pour son âne. Elle fait la piqûre elle-même, d’une main qui ne tremble pas, pendant que Noa grimace sans se réveiller.',
        suivant: 'gra_karine_2',
      },
      {
        label: 'Donner la boîte d’amoxicilline',
        si: { objet: 'antibiotiques', pasFlag: 'noa_traitee', pasObjet: 'antibio_veto' },
        effets: {
          retirer: [['antibiotiques', 1]],
          flags: { noa_traitee: true, noa_retrouvee: true, famille_cornillon: true },
          quete: ['q_karine', 'fin'],
          journal: 'J’ai retrouvé Karine et Noa au vieux moulin de Grans, chez Édouard, le meunier. J’ai donné à Noa une boîte d’antibiotiques. Dès qu’elle tiendra debout, elles monteront à Cornillon.',
        },
        texte: 'Karine lit la notice deux fois, à voix basse, en suivant les lignes du doigt. Puis elle écrase un comprimé dans une cuillère de confiture et le fait avaler à sa fille, en lui promettant qu’il n’y en aura plus que onze.',
        suivant: 'gra_karine_2',
      },
      {
        label: 'Promettre de revenir avec des antibiotiques',
        si: { pasFlag: 'noa_traitee' },
        effets: {
          flag: 'noa_retrouvee',
          quete: ['q_karine', 'soigner'],
          journal: 'J’ai retrouvé Karine et Noa au vieux moulin de Grans, chez Édouard, le meunier. Noa a de nouveau de la fièvre : j’ai promis de revenir avec des antibiotiques (ceux de Gérard, ou une boîte trouvée dans une pharmacie).',
        },
        suivant: 'gra_karine_attente',
      },
      {
        label: 'Leur dire de monter à Cornillon',
        si: { flag: 'noa_traitee' },
        effets: {
          flags: { noa_retrouvee: true, famille_cornillon: true },
          quete: ['q_karine', 'fin'],
          journal: 'J’ai retrouvé Karine et Noa au vieux moulin de Grans, chez Édouard, le meunier. Noa a déjà eu les antibiotiques de Gérard ; elle s’en remettra. Elles vont monter à Cornillon.',
        },
        suivant: 'gra_karine_2',
      },
    ],
  },

  gra_karine_attente: {
    illu: 'grans_moulin', musique: 'sombre', orateur: 'Karine',
    texte: 'Karine hoche la tête sans te regarder.\n\n« Reviens vite, alors. » Elle remonte la couverture sur l’épaule de sa fille. « Je t’ai déjà dit ça une fois, et tu es {revenu|revenue}. »',
    choix: [{ label: 'Repartir', suivant: '#fin' }],
  },

  gra_karine_2: {
    illu: 'grans_moulin', musique: 'calme', orateur: 'Karine',
    texte: 'Plus tard, quand Noa dort enfin sans que sa respiration siffle, Karine vient s’asseoir à côté de toi, près du poêle. Édouard vous a servi une tisane de tilleul dans des bols ébréchés.\n\n« On montera à Cornillon dès qu’elle tiendra debout, dit-elle. Édouard connaît le chemin des collines, il nous accompagnera. Il dit qu’il a quatre-vingts ans et qu’il n’a jamais vu la Durance, alors il viendra jusqu’au pont. »\n\nElle boit une gorgée, et elle te regarde par-dessus le bol.\n\n« Merci. » Elle le dit sèchement, comme on paie une dette, et puis elle détourne les yeux.',
    choix: [{ label: 'Finir ta tisane', suivant: '#fin' }],
  },

  // ─────────────────────────── RUDY (le péage de Lançon) ───────────────────────────
  // Marqueur 'rudy_lan' : la cabine du camion, devant la barrière.
  lan_rudy: {
    illu: 'peage_lancon', musique: 'sombre', orateur: 'Rudy',
    texte: 'La barrière de péage de Lançon s’étend sur toute la largeur de l’autoroute, avec ses cabines de verre et ses voies bouchées par des voitures abandonnées, portières ouvertes, depuis le premier jour. Le camion de Rudy est là, dans la voie 4, juste devant la seule barrière que quelqu’un a arrachée : il a calé à dix mètres du passage. La bâche est déchirée, et le pare-brise est fendu en étoile et couvert de sang séché.\n\nRudy est assis sur le marchepied, à côté de la cabine, un fusil de chasse en travers des genoux. Il te voit venir de loin, et il ne lève pas le fusil.\n\nSur le siège passager, attaché par la ceinture de sécurité et par une sangle de chargement serrée autour de la poitrine, il y a Yohan. Il est mort. Il tourne la tête vers toi en claquant des dents, et la sangle le retient.\n\n« Mordu à la porte, en sortant, dit Rudy sans le regarder. Il ne l’a dit à personne, et il s’est transformé ici, à côté de moi, pendant que je dormais. » Il a les yeux rouges. « Je n’arrive pas à le faire. C’est un gamin. Alors je l’ai attaché. »\n\nIl tend le bras dans la cabine et tapote la jauge du tableau de bord, collée sous la réserve.\n\n« Plus une goutte. J’ai roulé jusqu’ici avec ce qui restait au fond du réservoir. Avec vingt litres de gasoil, je pourrais emmener tout le monde jusqu’au pont. »\n\nIl te regarde enfin.\n\n« J’ai ouvert pour sortir. Je comptais refermer derrière moi, je te le jure. Mais avec les morts devant le camion… » Il hausse les épaules. « Vas-y. Dis-le. »',
    choix: [
      {
        label: 'Lui promettre du gasoil',
        si: { pasFlag: 'rudy_trouve' },
        effets: {
          flag: 'rudy_trouve',
          quete: ['q_rudy', 'gasoil'],
          journal: 'J’ai retrouvé Rudy au péage de Lançon, dans son camion à sec, avec Yohan mort attaché sur le siège passager. Avec vingt litres de gasoil (deux jerricans), il pourrait emmener tout le monde de Cornillon jusqu’au pont. Je lui ai promis d’en trouver.',
        },
        suivant: 'lan_rudy_promesse',
      },
      {
        label: 'Lui donner le gasoil',
        besoin: { objet: ['jerrican_gasoil', 2] },
        effets: {
          retirer: [['jerrican_gasoil', 2]],
          flags: { camion_plein: true, rudy_cornillon: true, rudy_trouve: true },
          quete: ['q_rudy', 'fin'],
          journal: 'J’ai apporté vingt litres de gasoil à Rudy, au péage de Lançon. Le camion a redémarré. Rudy monte à Cornillon : le mardi soir, la colonne partira en camion.',
        },
        suivant: 'lan_rudy_plein',
      },
      {
        label: 'Le laisser là',
        effets: {
          flags: { rudy_laisse: true, rudy_trouve: true },
          quete: ['q_rudy', 'fin'],
          journal: 'J’ai laissé Rudy au péage de Lançon, dans son camion vide, avec Yohan attaché à côté de lui. C’est lui qui a ouvert la porte du Refuge.',
        },
        suivant: 'lan_rudy_laisse',
      },
      {
        label: 'Le tuer',
        effets: {
          flags: { rudy_mort: true, rudy_trouve: true },
          quete: ['q_rudy', 'fin'],
          bruit: 8,
          objets: [['fusil_chasse', 1], ['cartouches', 3]],
          journal: 'J’ai tué Rudy au péage de Lançon, avec son propre fusil. C’est lui qui a ouvert la porte du Refuge. Il n’a pas résisté.',
        },
        suivant: 'lan_rudy_mort',
      },
    ],
  },

  lan_rudy_promesse: {
    illu: 'peage_lancon', musique: 'sombre', orateur: 'Rudy',
    texte: 'Rudy te regarde comme s’il ne te croyait pas, puis comme s’il avait envie de te croire.\n\n« Du gasoil, pas de l’essence. Les voitures du péage roulent presque toutes à l’essence, et les camions de la file ont été siphonnés le premier jour. » Il se gratte la barbe. « Essaie la station de l’aire de Lançon, de l’autre côté, ou les engins d’un chantier, ou un tracteur dans une ferme. Il te faut un tuyau et un bidon. Deux jerricans de dix litres, ça pèse lourd, alors prends un bon sac. »\n\nIl se tourne vers Yohan, qui claque des dents dans le vide.\n\n« On t’attend. On n’a pas grand-chose d’autre à faire. »',
    choix: [{ label: 'Repartir', suivant: '#fin' }],
  },

  lan_rudy_plein: {
    illu: 'peage_lancon', musique: 'calme', orateur: 'Rudy',
    texte: 'Rudy vide les jerricans dans le réservoir sans en perdre une goutte, en tenant l’entonnoir comme un objet sacré. Il met le contact. Le moteur tousse deux fois, cale, et repart dans un nuage de fumée noire qui fait se retourner tous les morts du péage.\n\nIl coupe le moteur aussitôt, et il reste un moment les mains sur le volant.\n\nPuis il descend, fait le tour de la cabine et ouvre la portière passager. Yohan se tend vers lui contre la sangle.\n\n« Retourne-toi », te dit Rudy.\n\nTu te retournes. Tu entends un seul coup sourd, et puis Rudy qui pleure, longtemps, sans bruit, comme un homme qui n’a pas l’habitude.\n\nQuand il remonte dans la cabine, il a les yeux secs.\n\n« Je monte à Cornillon par la route de Lançon. Mardi soir, je prends tout le monde à l’arrière, sous la bâche. » Il te regarde. « Après, Karine pourra me cracher dessus autant qu’elle voudra. »',
    choix: [{ label: 'Le laisser partir', suivant: '#fin' }],
  },

  lan_rudy_laisse: {
    illu: 'peage_lancon', musique: 'sombre', orateur: 'Rudy',
    texte: 'Tu ne dis rien. Tu fais demi-tour, et tu repars entre les voitures du péage.\n\n« C’est ça, crie Rudy dans ton dos. Va le dire aux autres, que tu m’as vu. Dis-leur que je suis resté avec le gamin. »\n\nQuand tu te retournes, au bout de la file, il n’a pas bougé. Il est toujours dans sa cabine, le fusil sur les genoux, et à côté de lui, Yohan tourne la tête de droite à gauche, attaché.',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  lan_rudy_mort: {
    illu: 'peage_lancon', musique: 'mort', orateur: null,
    texte: 'Tu tends la main vers le fusil. Rudy te regarde faire, et il te le laisse prendre. Il ne dit plus rien.\n\nLe coup résonne contre les cabines de verre du péage et roule le long de l’autoroute, très loin. Tous les morts de la file lèvent la tête.\n\nAprès, il ne reste que Yohan, qui claque des dents contre la sangle, et qui ne comprend pas pourquoi plus personne ne bouge à côté de lui. Tu achèves Yohan aussi, parce qu’il n’y a personne d’autre pour le faire.\n\nDans la boîte à gants, tu trouves quelques cartouches, une photo d’un petit garçon sur un manège, et un ticket de péage du 2 septembre.',
    choix: [{ label: 'Partir avant que les morts n’arrivent', suivant: '#fin' }],
  },

  // ─────────────────────────── LA COLONNE ───────────────────────────
  // Déclencheur : jour 14 (mardi 6 octobre), 20 h, à Cornillon.
  cor_colonne: {
    illu: 'cornillon_belvedere', musique: 'tension', orateur: 'Inès',
    texte: 'Le mardi 6 octobre, à huit heures du soir, tous ceux de Cornillon sont sur la petite place, devant l’église Saint-Vincent, avec ce qu’ils peuvent porter. Il fait froid et le ciel est clair. En bas, dans la plaine, la brume commence déjà à monter des creux ; elle est plus pâle qu’il y a une semaine, mais elle est toujours là.\n\nInès a son poste sur le dos et son cahier à la main, où elle a noté l’itinéraire. Elle compte les gens du regard, comme Hélène le faisait, et cette fois, elle ne s’arrête pas.\n\n« Mallemort, c’est au nord, à une trentaine de kilomètres par les routes hautes. Si on marche toute la nuit, on y sera avant l’aube. » Elle referme son cahier. « Ceux qui sont là sont là. On ne peut plus attendre personne. »',
    choix: [
      {
        label: 'Partir en camion',
        si: { flag: 'camion_plein' },
        effets: {
          flags: { colonne_partie: true, colonne_avec_toi: true },
          quete: ['q_pont', 'attendre'],
          voyage: { vers: 'mallemort', indication: true },
          journal: 'Mardi 6 octobre, huit heures du soir : nous partons de Cornillon pour le pont de Mallemort, à l’arrière du camion de Rudy, par les routes hautes. Le pont ouvre demain à six heures.',
        },
        suivant: '#fin',
      },
      {
        label: 'Partir à pied',
        si: { pasFlag: 'camion_plein' },
        effets: {
          flags: { colonne_partie: true, colonne_avec_toi: true },
          quete: ['q_pont', 'attendre'],
          voyage: { vers: 'mallemort', indication: true },
          journal: 'Mardi 6 octobre, huit heures du soir : nous partons à pied de Cornillon pour le pont de Mallemort, par les routes hautes, toute la nuit. Le pont ouvre demain à six heures.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 14, 22 h, si la colonne est partie sans toi.
  colonne_sans_toi: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'Il est dix heures du soir, le mardi 6 octobre. Où que tu sois, tu sais qu’à Cornillon, la colonne est partie sans toi il y a deux heures, comme convenu avec Inès : on n’attendrait personne. Ils marchent maintenant vers le nord, vers la Durance, par les routes hautes, et ils seront au pont avant l’aube.\n\nLe pont s’ouvre demain matin à six heures, pendant une heure. Si tu n’es pas déjà au bord de la Durance, il te reste huit heures pour y arriver.',
    choix: [
      {
        label: 'Te remettre en route vers le pont',
        effets: {
          flags: { colonne_partie: true, colonne_sans_toi: true },
          journal: 'La colonne est partie de Cornillon sans moi, ce soir à huit heures, comme convenu. Le pont de Mallemort ouvre demain à six heures, pendant une heure.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── MALLEMORT ───────────────────────────
  // Déclencheur : entrée dans mallemort (une fois).
  pon_camp: {
    illu: 'mallemort_camp', musique: 'sombre', orateur: null,
    texte: 'Mallemort est un gros village au bord de la Durance, et sa rive est devenue un camp. Des centaines de gens attendent entre les platanes du bord de l’eau et sur le parking du pont : des familles assises sur leurs valises, des vieux sur des chaises pliantes, des enfants qui dorment par terre dans des sacs de couchage, des chiens. Il y a des voitures aux vitres masquées par des couvertures, des tentes de plage et un camping-car. Personne ne fait de feu. Près de la route, un panneau de bois dit en lettres rouges : PAS DE FEU — PAS DE LUMIÈRE — ORDRE DE L’ARMÉE.\n\nDe l’autre côté de l’eau, sur la rive nord, les projecteurs de l’armée éclairent le vieux pont suspendu, ses câbles et ses deux pylônes de pierre. Devant le pont, une rangée de barrières et de sacs de sable coupe la route, et sur le bitume, une large bande de peinture rouge marque la ligne des deux cents mètres.\n\nLes gens parlent à voix basse, et partout, tu entends revenir les mêmes mots, comme une prière : mercredi, six heures.',
    choix: [
      {
        label: 'Trouver une place pour attendre',
        effets: {
          quete: ['q_pont', 'attendre'],
          journal: 'Je suis au pont de Mallemort. Des centaines de gens attendent sur la rive sud, sans feu ni lumière. L’armée ouvre le pont suspendu le mercredi 7 octobre, de six heures à sept heures, aux civils recensés.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 15, entre 5 h et 7 h, à Mallemort.
  pon_aube: {
    illu: 'durance_pont', musique: 'tension', orateur: null,
    texte: 'Il fait encore nuit quand la foule se lève. Personne n’a donné de signal : tout le monde s’est réveillé en même temps, et des centaines de gens plient leurs couvertures sans un mot, mettent les enfants sur leurs épaules et avancent vers le pont.\n\nSur l’autre rive, un haut-parleur grésille, et une voix de femme que tu reconnais, calme et un peu métallique, se met à parler : « Le franchissement est ouvert de six heures à sept heures. Avancez un par un jusqu’à la ligne rouge. Préparez le mot de votre refuge. Toute personne qui court sera considérée comme hostile. »',
    choix: [{ label: 'Te lever', effets: { cinematique: 'pont' }, suivant: 'pon_controle' }],
  },

  // Déclencheur : jour 22, entre 5 h et 7 h, à Mallemort (le pont manqué une fois).
  pon_aube_dernier: {
    illu: 'durance_pont', musique: 'tension', orateur: null,
    texte: 'Le mercredi 14 octobre, la rive sud est presque vide. Il ne reste que quelques dizaines de personnes, assises sous les platanes, qui n’osent pas se regarder. Ceux de Cornillon sont passés il y a une semaine, sans toi.\n\nC’est la dernière ouverture : la radio l’a répété tous les jours, après ce matin, il n’y en aura plus.\n\nSur l’autre rive, le haut-parleur grésille, et la même voix de femme répète que le franchissement est ouvert de six heures à sept heures, qu’il faut avancer un par un, et que toute personne qui court sera considérée comme hostile.',
    choix: [{ label: 'Te lever', effets: { cinematique: 'pont' }, suivant: 'pon_controle' }],
  },

  pon_controle: {
    illu: 'durance_pont', musique: 'tension', orateur: 'La lieutenante Sabatier',
    texte: 'La ligne des deux cents mètres est une bande de peinture rouge en travers de la route, devant les barrières. Des soldats masqués, le fusil à l’épaule, font avancer les gens un par un, et on t’arrête devant une table pliante, sous un projecteur.\n\nDerrière la table, il y a une femme d’une quarantaine d’années en treillis, les cheveux tirés, les yeux cernés, avec une liasse de feuilles devant elle. Sur sa poitrine, une bande velcro porte un nom : SABATIER.\n\n« Refuge ? »\n\nTu réponds : « Beauvezer. »\n\nElle lève les yeux, et elle te regarde un peu plus longtemps que les autres. Puis elle fait un signe à un soldat.\n\n« Contrôle. Tout le monde se déshabille. Je suis désolée, il n’y a pas d’exception. »\n\nOn te fait passer derrière une bâche. Un infirmier militaire, ganté jusqu’aux coudes, te fait tourner sous une lampe, puis il regarde tes mains, tes chevilles, ta nuque et l’intérieur de tes cuisses, sans rien dire. C’est la même lumière que celle de Yohan, le premier soir, et ce sont les mêmes gestes : tu lèves les mains, et tu tournes les bras, lentement.',
    choix: [
      { label: 'Attendre le verdict', si: { mordu: true }, suivant: 'pon_mordu' },
      { label: 'Attendre le verdict', si: { mordu: false }, suivant: 'pon_liste' },
    ],
  },

  // ─────────────────────────── LA LIGNE (mordu) ───────────────────────────
  pon_mordu: {
    illu: 'durance_pont', musique: 'mort', orateur: 'La lieutenante Sabatier',
    texte: 'L’infirmier s’arrête sur ta morsure. Il ne dit rien : il lève simplement la main, et un soldat qui attendait derrière la bâche fait un pas en avant.\n\nSabatier vient voir elle-même. Elle regarde la plaie, puis toi.\n\n« Je suis désolée. » Tu sais qu’elle l’est, un peu, comme on l’est quand on le dit vingt fois par matin. « Les personnes mordues ne franchissent pas la ligne. Il n’y a pas d’exception. Vous pouvez repartir par où vous êtes {venu|venue}. Si vous courez vers le pont, on tire. »\n\nDerrière toi, la file continue d’avancer, et les autres passent la ligne rouge un par un. Certains se retournent pour te regarder. Toi, tu restes de ce côté-ci de la peinture, ta chemise à la main.',
    choix: [{ label: 'Reculer', effets: { cinematique: 'fin_seul' }, suivant: 'pon_mordu_fin' }],
  },

  pon_mordu_fin: {
    illu: 'mains_feu', musique: 'sombre', orateur: null,
    texte: 'Le soir, tu t’assois sous les platanes de la rive sud, quand le camp s’est vidé. De l’autre côté de l’eau, les projecteurs se rallument un à un.\n\nLa morsure te brûle sous le pansement, et tu sens la fièvre venir, lentement, de très loin. Tu as encore quelques jours, peut-être plus. Personne ne sait vraiment.\n\nTu ramasses du bois, et tu allumes un petit feu, parce qu’il n’y a plus personne pour te l’interdire. Un jour de plus, c’est encore un jour.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flags: { pont_fait: true, fin_ligne: true },
          journal: 'On m’a {refoulé|refoulée} à la ligne des deux cents mètres, au pont de Mallemort : les personnes mordues ne passent pas. Les autres ont traversé. Il me reste quelques jours, peut-être plus.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA LISTE ───────────────────────────
  pon_liste: {
    illu: 'mains_liste', musique: 'sombre', orateur: 'La lieutenante Sabatier',
    texte: 'Quand tu ressors de derrière la bâche, Sabatier a tiré une feuille de sa liasse. C’est une page de cahier à petits carreaux, couverte d’une écriture de femme penchée et rapide, au stylo bille : la sienne.\n\n« Beauvezer, dit-elle. Quatorze noms, transmis par radio le 20 septembre par Mme Garcin. » Elle fait courir son stylo sur la liste, et tu lis les noms à l’envers : Abrieu Fernand, Barret Céline, Barret Théo, Belkacem Inès, Chabert Rudy, Garcin Hélène… « Votre nom n’y est pas. »\n\nTon cœur s’arrête. Elle tourne la feuille vers toi.\n\nLe nom d’Hélène est rayé d’un trait net, à la règle. Et à côté, entre parenthèses, dans la même écriture penchée, il y a une ligne ajoutée :\n\n(ceux que j’ai envoyés à la bergerie)\n\n« Elle me l’a dictée le 25 au soir, mot pour mot, dit Sabatier. Je lui ai demandé si elle était sûre, et elle m’a répondu qu’elle avait compté. La nuit de l’attaque, elle m’a rappelée pour me confirmer la modification. » Elle te regarde. « Vous êtes {allé|allée} à la bergerie ? »\n\nTu fais oui de la tête. Tu ne peux rien dire.\n\n« Alors vous êtes sur la liste. » Elle tamponne la feuille et pose son stylo. « Je suis désolée pour votre refuge. Mme Garcin était quelqu’un de très précis. »',
    choix: [
      { label: 'Te retourner : une voix t’appelle', si: { flag: 'helene_sauvee' }, suivant: 'pon_helene' },
      { label: 'Avancer vers le pont', si: { pasFlag: 'helene_sauvee' }, suivant: 'pon_traverser' },
    ],
  },

  pon_helene: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Hélène',
    texte: 'Derrière toi, à la table, une voix basse et nette, une voix qui ne crie jamais, donne son nom.\n\n« Garcin, Hélène. Beauvezer. »\n\nElle est là, dans la file, en gilet sans manches, ses lunettes au bout de leur cordon, plus maigre que jamais, avec une écorchure sur la joue. Elle est descendue par les rochers, et elle a traversé le pays pour être là à l’heure.\n\nSabatier regarde sa liste, puis le trait tiré à la règle sur le nom, puis Hélène.\n\n« Madame Garcin. Vous vous êtes rayée vous-même. »\n\n« Je sais, répond Hélène. Je voulais seulement voir qui était passé. » Elle se retourne, et elle te voit. Quelque chose se détend dans son visage. « Ah. Bien. »\n\nSabatier tapote la table avec son stylo. Elle a l’air très fatiguée, tout d’un coup.\n\n« Une place par nom, dit-elle. C’est la règle. Si quelqu’un veut lui céder la sienne, c’est son affaire, pas la mienne. »',
    choix: [
      { label: 'Lui donner ta place', effets: { cinematique: 'fin_place' }, suivant: 'pon_place_fin' },
      { label: 'Traverser', suivant: 'pon_traverser' },
    ],
  },

  pon_place_fin: {
    illu: 'mains_feu', musique: 'sombre', orateur: null,
    texte: 'Quand tu as demandé à Sabatier de te rayer de la liste pour y remettre son nom, Hélène t’a {regardé|regardée} longtemps. Elle n’a pas discuté. Elle a enlevé ses lunettes, elle les a essuyées sur son gilet, et elle a seulement demandé : « Tu as compté ? » Tu as répondu oui.\n\nMaintenant, elle est de l’autre côté. Toi, tu es sur la rive sud, avec la Durance entre toi et le reste du monde, et tout un pays à traverser chaque jour pour rester {vivant|vivante}.\n\nLa nuit tombe. Tu allumes un petit feu sous les platanes, malgré l’ordre de l’armée, parce qu’il n’y a plus personne pour te le reprocher. Il faudra trouver de l’eau demain, et du bois, et un endroit où dormir.\n\nUn jour de plus.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flags: { pont_fait: true, fin_place: true },
          quete: ['q_pont', 'fin'],
          journal: 'Au pont de Mallemort, Hélène s’était rayée de la liste pour y mettre « ceux que j’ai envoyés à la bergerie ». Elle était là, sans place. Je lui ai donné la mienne. Elle a traversé, et je reste sur la rive sud.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── DE L'AUTRE CÔTÉ ───────────────────────────
  // On peut se retourner vers ceux qui sont là (le 7 octobre seulement), puis traverser.
  pon_traverser: {
    illu: 'durance_pont', musique: 'calme', orateur: null,
    texte: 'Un soldat écarte la barrière juste assez pour laisser passer une personne. Devant toi, il y a le vieux pont suspendu : trois cents mètres de planches entre ses deux pylônes de pierre, des câbles qui chantent dans le vent du matin, et au bout, la rive nord, les tentes de l’armée et la fumée d’une cuisine roulante.\n\nDerrière toi, la file continue d’avancer sous les projecteurs qui pâlissent. Tu as encore le temps de te retourner.',
    choix: [
      { label: 'Te retourner vers Inès', si: { flag: 'colonne_partie', jourMax: 15 }, suivant: 'pon_vu_ines' },
      { label: 'Te retourner vers Karine et Noa', si: { flag: ['famille_cornillon', 'noa_traitee'], jourMax: 15 }, suivant: 'pon_vu_noa' },
      { label: 'Te retourner vers Karine et Noa', si: { flag: 'famille_cornillon', pasFlag: 'noa_traitee', jourMax: 15 }, suivant: 'pon_vu_noa_malade' },
      { label: 'Te retourner vers Bastien', si: { flag: 'bastien_cornillon', jourMax: 15 }, suivant: 'pon_vu_bastien' },
      { label: 'Te retourner vers Rudy', si: { flag: 'rudy_cornillon', jourMax: 15 }, suivant: 'pon_vu_rudy' },
      { label: 'Te retourner vers Hélène', si: { flag: 'helene_sauvee', pasFlag: 'fin_place' }, suivant: 'pon_vu_helene' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_ines: {
    illu: 'durance_pont', musique: 'calme', orateur: 'Inès',
    texte: 'Inès est quelques places derrière toi dans la file, son poste sur le dos, l’antenne repliée qui dépasse au-dessus de sa tête. Elle a toujours dit qu’elle se fichait bien de traverser ou pas.\n\nQuand elle voit que tu la regardes, elle lève le pouce, puis elle fait semblant de se gratter l’œil.\n\n« Avance, crie-t-elle. Tu bouches le passage. »',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_noa: {
    illu: 'durance_pont', musique: 'calme', orateur: null,
    texte: 'Karine avance dans la file en tenant Noa par la main. La petite ne tousse presque plus. Elle a les joues roses de froid, et elle compte à voix haute les planches du pont qu’elle voit au loin, en se trompant exprès pour faire rire sa mère.\n\nKarine ne rit pas, mais elle ne la fait pas taire non plus. Quand elle croise ton regard, elle hoche la tête une fois, sèchement, comme on signe un reçu.',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_noa_malade: {
    illu: 'durance_pont', musique: 'sombre', orateur: null,
    texte: 'Karine avance dans la file avec Noa dans les bras, enroulée dans une couverture. La petite a encore de la fièvre, et elle tousse contre l’épaule de sa mère.\n\nUn infirmier militaire les a repérées : il fait signe à Karine de sortir du rang et de venir directement à la table. De l’autre côté, il y a des médecins, des antibiotiques, des lits.\n\nKarine passe devant tout le monde sans s’excuser, et pour une fois, personne ne proteste.',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_bastien: {
    illu: 'durance_pont', musique: 'calme', orateur: 'Bastien',
    texte: 'Bastien est dans la file, plié en deux par une quinte de toux. Un soldat s’approche, inquiet, la main sur son arme, et Bastien lui montre ses avant-bras intacts en reprenant son souffle.\n\n« C’est le chlore, pas une morsure, dit-il. J’étais infirmier. Je peux vous l’écrire, si vous voulez. »\n\nLe soldat le laisse avancer. Bastien te cherche des yeux, te trouve, et te fait un petit signe de la main, comme on dit au revoir sur un quai de gare.',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_rudy: {
    illu: 'durance_pont', musique: 'sombre', orateur: null,
    texte: 'Rudy est le dernier de ceux de Cornillon, loin derrière les autres, les mains dans les poches. Il a laissé son camion sur le parking de la rive sud, les clés sur le contact, pour celui qui en aura besoin.\n\nKarine ne lui a pas adressé la parole de toute la nuit. Il ne s’en plaint pas. Quand Sabatier lit son nom sur la liste, Chabert Rudy, il ferme les yeux une seconde, et il passe la ligne rouge sans se retourner.',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_vu_helene: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Hélène',
    texte: 'Hélène est restée de l’autre côté de la ligne rouge, sous le projecteur, à côté de la table de Sabatier. Elle ne cherche pas à passer. Elle regarde la file avancer, et ses lèvres bougent un peu : elle compte ceux qui traversent.\n\nQuand elle voit que tu la regardes, elle lève la main, comme on salue quelqu’un depuis un quai.\n\n« Va, dit-elle. J’ai compté. »',
    choix: [
      { label: 'Regarder les autres', suivant: 'pon_traverser' },
      { label: 'Traverser le pont', effets: FIN_PONT, suivant: 'pon_traverser_2' },
    ],
  },

  pon_traverser_2: {
    illu: 'camp_refugies', musique: 'calme', orateur: null,
    texte: 'Sur la rive nord, au camp de Mérindol, on te fait prendre une douche froide sous une tente, puis on te donne des vêtements qui sentent le désinfectant, une couverture, un gobelet de café qui est du vrai café, et un numéro. Toute la journée, une femme avec un mégaphone lit des listes de noms, et de temps en temps, quelqu’un se lève en criant parce qu’il a entendu le sien.\n\nLe soir, quelque part entre les tentes, quelqu’un allume une radio. Une voix de jeune fille, un peu nasillarde, se met à parler, et toutes les têtes se tournent.\n\n« Ici Inès, au camp de Mérindol. Si quelqu’un du pays salonais m’entend encore, de l’autre côté de la Durance : restez en hauteur la nuit, ne dormez pas dans le jaune, et tenez bon. Je répète ce message tous les soirs à huit heures. »\n\nTu fermes les yeux. Un jour de plus, et puis un autre.',
    choix: [
      {
        label: 'Dormir',
        effets: {
          flags: { pont_fait: true, fin_pont: true },
          quete: ['q_pont', 'fin'],
          journal: 'J’ai passé le pont de Mallemort. Hélène s’était rayée de la liste pour y mettre « ceux que j’ai envoyés à la bergerie » : c’est sa place que j’ai prise. De l’autre côté, il y a un camp, des listes, de la soupe chaude, et Inès qui parle à la radio tous les soirs.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE PONT MANQUÉ ───────────────────────────
  // Déclencheur : jour 15, 7 h, sans toi au pont.
  pont_rate: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'Il est sept heures du matin, le mercredi 7 octobre. Où que tu sois, tu sais qu’à cette heure-ci, au bord de la Durance, les soldats viennent de refermer la barrière du pont suspendu. Il s’est ouvert pendant une heure, et tu n’y étais pas.\n\nInès l’avait répété cent fois, à Cornillon : si on rate le 7, il reste le mercredi 14, une dernière fois, aux mêmes heures. Après, il n’y aura plus rien.\n\nTu as une semaine.',
    choix: [
      {
        label: 'Repartir',
        effets: {
          flag: 'pont_rate_1',
          quete: ['q_pont', 'dernier'],
          journal: 'J’ai manqué le pont de Mallemort. Il reste une dernière ouverture, le mercredi 14 octobre, de six heures à sept heures. Après, plus rien.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 22, 7 h, toujours pas passé.
  pont_rate_2: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'Le mercredi 14 octobre, à sept heures du matin, la barrière du pont de Mallemort se referme pour la dernière fois. Tu n’y étais pas.\n\nIl n’y aura plus d’autre ouverture. L’armée l’a dit, et l’armée ne revient pas sur ce qu’elle dit.',
    choix: [{ label: 'Rester', effets: { cinematique: 'fin_seul' }, suivant: 'pont_rate_2b' }],
  },

  pont_rate_2b: {
    illu: 'mains_feu', musique: 'sombre', orateur: null,
    texte: 'La radio ne dit plus rien de la Durance. Les nuits sans vent, la brume monte encore des terres basses, mais elle est plus pâle chaque soir, et un jour de mistral, elle ne reviendra pas.\n\nIl reste le pays, avec ses villages vides, ses morts qui errent et ses vergers dont personne ne cueille les fruits. Il reste ce que tu sais faire : trouver de l’eau, du bois, un endroit où dormir, et te lever le lendemain.\n\nEncore un jour.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flags: { pont_rate_2: true, fin_seul: true },
          journal: 'Le pont de Mallemort ne rouvrira plus. Je reste au sud de la Durance, avec le pays, la brume qui faiblit, et ce qu’il faut faire chaque jour pour survivre.',
        },
        suivant: '#fin',
      },
    ],
  },
};
