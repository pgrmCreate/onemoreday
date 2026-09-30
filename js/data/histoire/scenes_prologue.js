// ============ PROLOGUE — « Lot 14 » ============
// Le tutoriel : on apprend les trois temps UN PAR UN.
//   1. Exploration : le cimetière Saint-Roch (réveil dans un caveau, lampe, fouille, eau, discrétion, clé).
//   2. Carte + voyage : du cimetière à la Tour de l'Horloge (≈ 550 m), deux rencontres scénarisées
//      (rc_pro_marche : un choix ; rc_pro_premier : le premier combat, tutoriel) — voir scenes_rencontres.js.
//   3. Combat : le serveur du Tabac du Fontenoy.
// Puis la tour, les cloches, Maud. Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}.
// Toutes les scènes utilisent ’ (apostrophe typographique) dans le texte affiché.

export const SCENES_PROLOGUE = {

  // ─────────────────────────── LE RÉVEIL ───────────────────────────
  // Déclencheur : entrée dans 'cimetiere' (entrée 'caveau'), une seule fois, juste après la cinématique 'intro'.
  pro_reveil: {
    illu: 'housse_noir', musique: null, orateur: null,
    texte: 'Du plastique contre ta bouche.\n\nTu inspires, et il se colle à tes lèvres, froid, humide de ton propre souffle. Tu inspires encore. L’air a un goût de chlore et de quelque chose de sucré, de tourné, que tu reconnais sans pouvoir le nommer.\n\nTu ne sens pas tes mains. Puis tu les sens trop : mille aiguilles sous les ongles, dans les poignets, jusqu’aux coudes. Ton cœur cogne une fois. Attend. Cogne encore — lent, lourd, comme quelqu’un qui frappe à une porte qu’on a murée.\n\nEt sous tout ça, plus bas que le ventre, une faim. Pas la faim d’un repas sauté. Une faim qui n’a pas de fond.',
    choix: [
      { label: 'Chercher la fermeture éclair', suivant: 'pro_reveil_2' },
    ],
  },

  pro_reveil_2: {
    illu: 'cimetiere_caveau', musique: null,
    texte: 'Tes doigts trouvent le curseur, en haut, près de ta tête. Il résiste. Tu tires, tu tires — et la fermeture s’ouvre d’un coup, avec le bruit d’un drap qu’on déchire.\n\nDu noir. Un noir de pierre. Une odeur de cire, de chrysanthèmes secs, de ciment.\n\nTu es sur une étagère de marbre, dans une housse blanche, entre deux cercueils de chêne. Au-dessus de toi, gravé dans la dalle : FAMILLE ROUX-BÉRENGER — PRIEZ POUR EUX. Sur le sol du caveau, trois autres housses blanches, fermées, alignées comme des sacs de linge.\n\nIl te faut longtemps pour bouger. Des heures. Tu réapprends tes jambes une à une, tu les plies, tu les laisses retomber. Le filet de lumière sous la porte du caveau passe du blanc au jaune, puis au rouge.\n\nÀ ton poignet gauche, un bracelet d’hôpital en plastique jaune. À ton pied, une étiquette en carton attachée par un fil de fer.',
    choix: [
      {
        label: 'Lire l’étiquette',
        effets: {
          tempsMin: 660, faim: -35, soif: -45, fatigue: -15,
          flag: 'pro_reveil_fait',
          objets: [['etiquette_orteil', 1], ['bracelet_p4', 1]],
          document: 'doc_etiquette',
        },
        suivant: 'pro_reveil_3',
      },
    ],
  },

  pro_reveil_3: {
    illu: 'cimetiere_caveau', musique: 'sombre',
    texte: 'Ton nom. Écrit au feutre noir, en capitales, par quelqu’un qui avait froid aux doigts.\n\nDÉCÈS CONSTATÉ LE 06/09. CAUSE : MORSURE. LOT 14 — INCINÉRATION.\n\nTu relis. Tu relis encore. Les mots ne changent pas.\n\nSur le bracelet jaune, trois lettres et un chiffre : URG — P4.\n\nAgrafé à la housse, à hauteur de ta poitrine, un sachet de scellés en plastique. Dedans, des choses qui t’appartiennent peut-être.',
    choix: [
      {
        label: 'Te lever',
        effets: {
          quete: ['q_prologue', 'scelle'],
          journal: 'Réveil dans une housse mortuaire, dans un caveau du cimetière Saint-Roch. Une étiquette à mon pied : décès constaté le 6 septembre. Cause : morsure.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'scelle_effets' (le sachet agrafé sur la housse, dans le caveau).
  pro_scelle: {
    illu: 'cimetiere_caveau', musique: 'sombre',
    texte: 'Le sachet porte un numéro — 14-0371 — et une mention imprimée : EFFETS PERSONNELS — NE PAS OUVRIR (RISQUE NRBC).\n\nTu l’ouvres avec les dents.\n\nUn portefeuille à ton nom. Un téléphone à l’écran fendu en étoile, mort. Un trousseau de trois clés que tu ne reconnais pas. Et, plié en quatre au fond, un papier qui n’a rien d’officiel : une feuille d’ordonnance arrachée à un bloc, couverte d’une écriture serrée, penchée, pressée.',
    choix: [
      {
        label: 'Déplier le papier',
        effets: {
          objets: [['telephone_perso', 1], ['portefeuille_perso', 1], ['trousseau_inconnu', 1]],
          document: 'doc_mot_maud',
          flag: 'pro_note_lue',
        },
        suivant: 'pro_scelle_2',
      },
    ],
  },

  pro_scelle_2: {
    illu: 'cimetiere_caveau', musique: 'sombre',
    texte: 'Tu relis la dernière ligne. Quoi que tu entendes ensuite, ne cours pas vers le bruit.\n\nTu ne brûles pas le papier. C’est la seule chose au monde qui te parle.\n\nDehors, derrière la porte du caveau, le soir tombe sur quelque chose de très grand et de très silencieux.',
    choix: [
      {
        label: 'Pousser la porte du caveau',
        effets: {
          quete: ['q_prologue', 'sortir'],
          decouvrir: ['tour_horloge'],
          journal: 'Dans mes effets, un mot signé « M. » : « Viens à la Tour de l’Horloge. Allume une lumière au pied de la tour. » Quelqu’un savait que je me réveillerais.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'soldat_nrbc' (allée des mausolées, près du caveau) : la lampe frontale.
  pro_soldat: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Un soldat est assis contre un mausolée, en combinaison de protection vert olive, le masque à gaz encore sur le visage. La vitre du masque est opaque de l’intérieur. Pas de buée : autre chose, de plus sombre, qui a séché.\n\nSon fusil n’est plus là. Sa lampe frontale, si : elle pend à sa capuche, l’élastique entortillé dans le caoutchouc.\n\nSur sa poitrine, scotchée à la combinaison, une fiche plastifiée, cornée, tachée.',
    choix: [
      {
        label: 'Prendre la lampe et la fiche',
        effets: {
          objets: [['lampe_frontale', 1], ['piles', 1]],
          document: 'doc_consignes_ramassage',
          flag: 'pro_lampe',
          journal: 'Une lampe frontale sur un soldat mort. Il y avait une fiche sur lui : les consignes des équipes qui ramassaient les corps.',
        },
        suivant: 'pro_soldat_2',
      },
    ],
  },

  pro_soldat_2: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Tu lis la fiche à la lumière de sa propre lampe.\n\nCORPS PRÉSENTANT UNE ACTIVITÉ : NEUTRALISATION CRÂNIENNE. CORPS INERTES : ENSACHAGE DIRECT.\n\nTu touches ton crâne. Pas de trou. Tu étais inerte. Tu avais l’air assez mort pour qu’on ne gaspille pas une balle.',
    choix: [{ label: 'Allumer la lampe', suivant: '#fin' }],
  },

  // Marqueur 'robinet_fleurs' (contre le mur d'enceinte) : première eau.
  pro_robinet: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Contre le mur d’enceinte, le robinet où les veuves remplissaient leurs arrosoirs. Un arrosoir vert est encore accroché au bec, et une paire de gants de jardin sèche sur le rebord depuis trois semaines.\n\nTu tournes. Un hoquet, un raclement dans les tuyaux — puis l’eau vient, d’abord rousse, ensuite claire, glacée, avec un goût de fer et de pierre. Elle descend de la Durance par des canaux plus vieux que tous les morts d’ici, et elle se moque bien de savoir si le monde est fini.\n\nTu bois jusqu’à avoir mal aux dents.',
    choix: [
      { label: 'Boire encore', effets: { soif: 55, flag: 'pro_eau_bue' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'housse_patrick' (une housse posée contre la chapelle voisine) : un « raté ».
  pro_patrick: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Une voix',
    texte: 'Contre le mur de la chapelle voisine, une housse blanche bouge.\n\nPas comme ils bougent, eux — par à-coups, sans but. Elle se tortille, elle s’arc-boute. De l’intérieur, une voix d’homme, enrouée, étouffée par le plastique :\n\n« Y a quelqu’un ? Je vous entends marcher. La fermeture est coincée. Je m’appelle Patrick. Patrick Veyrier. J’habite rue… j’habite… »\n\nUn silence. Puis, plus bas, presque vexé :\n\n« J’ai faim. C’est bête, hein. J’ai tellement faim. »',
    choix: [
      { label: 'Ouvrir la housse', suivant: 'pro_patrick_ouvre' },
      { label: 'Lui parler sans ouvrir', suivant: 'pro_patrick_parle' },
      { label: 'Reculer sans un bruit', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_parle: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: '« Patrick. Vous étiez à l’hôpital ? »\n\n« L’hôpital. Oui. La dame. La docteure. » Il rit, un petit rire mouillé. « Elle avait une clochette. Elle agitait sa clochette et on avait à manger. »\n\nLe plastique se tend. Une forme de visage se dessine contre la housse, bouche ouverte, et le plastique s’enfonce dans la bouche, et la bouche mord le plastique.\n\n« Tu sens bon », dit la voix, et ce n’est plus tout à fait une voix.',
    choix: [
      { label: 'Prendre le vase de granit sur la tombe d’à côté', suivant: 'pro_patrick_achever' },
      { label: 'Partir', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_ouvre: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: 'Tu tires sur le curseur coincé. Il cède d’un coup.\n\nPatrick a cinquante ans, peut-être. Des lunettes tordues sur le nez, une blouse d’hôpital, un bracelet jaune au poignet — le même que le tien. Il te regarde et, pendant une seconde, il y a quelqu’un derrière ses yeux : un homme gêné d’être vu en chemise de nuit. Il ouvre la bouche pour te remercier.\n\nLa seconde passe.\n\nSes yeux descendent sur ta gorge. Il ne te voit plus. Il voit à manger.',
    choix: [
      { label: 'Le frapper avec le vase de granit avant qu’il se lève', suivant: 'pro_patrick_achever' },
      { label: 'Rabattre la housse et t’éloigner', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_achever: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Sur la tombe d’à côté, un vase funéraire en granit, lourd comme un enfant endormi. Tu le soulèves à deux mains.',
    choix: [
      {
        label: 'Frapper',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: 'Le premier coup fait un bruit de noix. Le second, un bruit mouillé. Au troisième, la housse ne bouge plus, et tu restes là, {penché|penchée} au-dessus, à écouter ton propre cœur qui cogne trop vite, comme s’il voulait rattraper le temps perdu.\n\nSur le bracelet jaune de Patrick : URG — P3.\n\nToi, tu es P4.',
          effets: { flag: 'patrick_acheve', xp: { force: 10 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Le vase glisse sur le plastique, ricoche sur son épaule. Sa main jaillit de la housse et se referme sur ton poignet, et ses ongles t’entament la peau avant que le deuxième coup ne tombe, puis le troisième, jusqu’à ce que la main s’ouvre.\n\nSur le bracelet jaune de Patrick : URG — P3.\n\nToi, tu es P4.',
          effets: { flag: 'patrick_acheve', blessure: { type: 'egratignure', zone: 'à la main' }, xp: { force: 4 } },
          suivant: '#fin',
        },
      },
    ],
  },

  pro_patrick_part: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Tu t’éloignes. Derrière toi, la housse continue de parler — ton pas, la faim, une rue dont il ne se souvient plus. Puis elle ne parle plus.\n\nElle gratte.',
    choix: [{ label: 'Continuer', effets: { flag: 'patrick_laisse' }, suivant: '#fin' }],
  },

  // Marqueur 'conteneur_frigo' (esplanade) : la morgue provisoire.
  pro_conteneur: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Deux conteneurs frigorifiques blancs, de ceux qui montent les tomates d’Espagne par l’A7, garés de travers sur l’esplanade. Le groupe électrogène, entre les deux, est froid. L’odeur, elle, est chaude.\n\nSur la porte du premier, un porte-bloc pend au bout d’une ficelle. Derrière la porte, des coups. Pas forts. Réguliers. Quelqu’un, à l’intérieur, frappe comme on frappe quand on a oublié pourquoi.',
    choix: [
      {
        label: 'Prendre le porte-bloc',
        effets: { document: 'doc_registre_saint_roch', flag: 'pro_registre_lu' },
        suivant: 'pro_conteneur_2',
      },
      { label: 'Poser la main sur la barre de la porte', suivant: 'pro_conteneur_barre' },
    ],
  },

  pro_conteneur_2: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'LOT 14 — 212 CORPS. Et une colonne de dates. Le dernier plein du groupe électrogène a été fait le 13 septembre. À la ligne suivante, quelqu’un a écrit PASSAGE DU 16 : ANNULÉ, et n’a plus rien écrit du tout.\n\nPersonne n’est revenu brûler le lot 14. C’est pour ça que tu es là.',
    choix: [{ label: 'Reculer', suivant: '#fin' }],
  },

  pro_conteneur_barre: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu poses la main sur la barre de fermeture.\n\nLes coups s’arrêtent. Tous. En même temps.\n\nTu retires ta main très lentement. Pendant une longue minute, rien. Puis, doucement, ça recommence.',
    choix: [{ label: 'Laisser le lot 14 où il est', suivant: '#fin' }],
  },

  // Marqueur 'loge_gardien' (bureau de la loge, près de la grille) : la clé. Un mort DORT dans le fauteuil.
  pro_loge: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La loge du gardien sent le café froid et la pisse de chat. Sur le bureau, un cahier ouvert, un stylo posé en travers. Au mur, un tableau de clés, toutes à leur crochet — et une seule qui compte : GRILLE PRINCIPALE, une grosse clé de laiton à un anneau rouge.\n\nDans le fauteuil, face à la fenêtre, quelqu’un dort. La tête sur l’épaule. Il ne ronfle pas.',
    choix: [
      { label: 'Lire le cahier ouvert', effets: { document: 'doc_cahier_gardien' }, suivant: 'pro_loge_2' },
      { label: 'Décrocher la clé', suivant: 'pro_loge_cle' },
    ],
  },

  pro_loge_2: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La dernière ligne du cahier est datée d’avant-hier. Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas.\n\nLa chapelle des Roux-Bérenger. Ton caveau.\n\nDans le fauteuil, la tête a glissé un peu plus sur l’épaule.',
    choix: [{ label: 'Décrocher la clé', suivant: 'pro_loge_cle' }],
  },

  pro_loge_cle: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Le tableau est juste derrière le fauteuil. Tu passes le bras au-dessus du dossier, au-dessus de la nuque grise, des cheveux collés.',
    choix: [
      {
        label: 'Décrocher la clé sans un bruit',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'L’anneau glisse du crochet sans un tintement. Tu refermes les doigts dessus. Dans le fauteuil, rien ne bouge.',
          effets: { objet: ['cle_grille_saint_roch', 1], xp: { agilite: 8 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'La clé accroche sa voisine. Un tintement minuscule, clair comme une cuillère sur un verre.\n\nDans le fauteuil, la tête se redresse.',
          effets: { objet: ['cle_grille_saint_roch', 1], bruit: 2 },
          suivant: '#fin',
        },
      },
    ],
  },

  // Marqueur 'grille_sortie' (grille principale, boulevard du Roi-René).
  pro_grille: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'La grille principale donne sur le boulevard du Roi-René. Une chaîne, un cadenas. De l’autre côté, les platanes, les voitures garées pour toujours, et la ville qui descend vers le centre dans la dernière lumière.\n\nSalon. Tu ne sais pas si tu la connais. Tu sais où est l’Horloge : on la voit d’ici, au-dessus des toits, sa cage de fer forgé noire contre le ciel rouge.\n\nCinq cents mètres. Un peu plus.',
    choix: [
      {
        label: 'Ouvrir le cadenas',
        besoin: { objet: 'cle_grille_saint_roch' },
        effets: {
          flag: 'pro_grille_ouverte',
          quete: ['q_prologue', 'horloge'],
          journal: 'Sorti du cimetière Saint-Roch. L’Horloge est à cinq cents mètres, au-dessus des toits.',
        },
        suivant: '#fin',
      },
      {
        label: 'Escalader la grille',
        test: { skill: 'agilite', difficulte: 2 },
        reussite: {
          texte: 'Tu passes un pied dans les volutes de fer, puis l’autre, et tu te laisses retomber de l’autre côté sur le trottoir, souple, silencieux. Ton corps se souvient de choses que ta tête a oubliées.',
          effets: { flag: 'pro_grille_ouverte', quete: ['q_prologue', 'horloge'], xp: { agilite: 10 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Une pointe de la grille t’ouvre la paume en passant. Tu retombes mal, sur le côté, et tu restes un moment sur le dos, sur le trottoir, à regarder les feuilles de platane tourner au-dessus de toi.',
          effets: { flag: 'pro_grille_ouverte', quete: ['q_prologue', 'horloge'], blessure: { type: 'entaille', zone: 'à la main' }, xp: { agilite: 4 } },
          suivant: '#fin',
        },
      },
    ],
  },

  // ─────────────────────────── LA TOUR ───────────────────────────
  // Déclencheur : entrée dans 'tour_horloge' (si pro_note_lue, pas encore pro_cloches_faites).
  pro_horloge: {
    illu: 'place_crousillat_nuit', musique: null,
    texte: 'La place Crousillat.\n\nLa Fontaine Moussue est là, au milieu, énorme champignon de pierre verte, barbu de mousse, qui crache son eau par quatre bouches dans un bassin que personne ne vide plus. Le bruit de l’eau est le seul bruit. Autour, les terrasses : les tables rondes, les chaises renversées, un parasol plié comme une aile cassée. La façade du Grand Hôtel de la Poste, toutes fenêtres noires.\n\nEt la Tour de l’Horloge, qui ferme la place au sud : trois étages de pierre blonde posés l’un sur l’autre, et tout en haut, la cage de fer forgé où dorment les cloches.\n\nLe cadran marque neuf heures dix. Tu regardes longtemps. L’aiguille ne bouge pas.',
    choix: [
      {
        label: 'Allumer une lumière et la lever vers les cloches',
        besoin: { ou: [{ objet: 'lampe_frontale' }, { objet: 'lampe_torche' }, { objet: 'torche' }, { objet: 'briquet' }, { objet: 'allumettes' }] },
        effets: { flag: 'pro_signal', cinematique: 'pro_cloches' },
        suivant: 'pro_cloches',
      },
      { label: 'Frapper à la porte de la tour', suivant: 'pro_horloge_porte' },
    ],
  },

  pro_horloge_porte: {
    illu: 'place_crousillat_nuit', musique: null,
    texte: 'La petite porte au pied de la tour est en chêne clouté. Tu frappes. Le bruit part sur la place, ricoche sur les façades, revient.\n\nRien. Puis, tout en haut, entre les cloches, une lueur s’allume. S’éteint. S’allume.\n\nQuelqu’un t’a vu.',
    choix: [{ label: 'Lever les yeux', effets: { flag: 'pro_signal', cinematique: 'pro_cloches' }, suivant: 'pro_cloches' }],
  },

  pro_cloches: {
    illu: 'place_crousillat_nuit', musique: 'tension',
    texte: 'Ils sortent de partout. De la rue de l’Horloge, du cours, des portes cochères, des terrasses. Des dizaines. Ils marchent vers la tour comme on va à la messe, le visage levé vers le bruit.\n\nEt toi aussi.\n\nTes pieds ont fait trois pas vers la fontaine avant que tu décides quoi que ce soit. Ta bouche est pleine. Tu avales, et ça revient aussitôt, épais, chaud, comme devant la vitrine d’un boulanger quand on a sept ans. Chaque coup de cloche te descend dans le ventre et tire.\n\nLa porte au pied de la tour vient de s’entrouvrir. Une main. Un geste sec : viens.',
    timerMs: 9000,
    timeout: {
      texte: 'Tu as attendu une seconde de trop — ou tu n’attendais pas : tu avançais. Quand tu reprends le contrôle de tes jambes, tu es au bord du bassin, au milieu d’eux, et l’un d’eux vient de sentir que tu n’es pas comme lui.',
      effets: { flag: 'pro_suivi_cloches', combat: { zombies: ['coureur'] } },
      suivant: 'pro_cloches_porte',
    },
    choix: [
      {
        label: 'Courir vers la porte',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu fends la place en diagonale, entre les dos, les épaules, les mains qui se lèvent trop tard. Personne ne te suit. Personne ne regarde autre chose que les cloches.',
          effets: { xp: { agilite: 8 } },
          suivant: 'pro_cloches_porte',
        },
        echec: {
          texte: 'Une main t’accroche la manche au passage, tire, lâche. Tu sens des ongles sur ton avant-bras, un souffle froid dans ton cou. Tu arraches ton bras et tu cours.',
          effets: { blessure: { type: 'egratignure', zone: "à l'avant-bras" } },
          suivant: 'pro_cloches_porte',
        },
      },
      {
        label: 'Marcher vers la porte, lentement, au milieu d’eux',
        suivant: 'pro_cloches_marcher',
      },
      {
        label: 'Aller vers les cloches',
        effets: { flag: 'pro_suivi_cloches', combat: { zombies: ['coureur'] } },
        suivant: 'pro_cloches_porte',
      },
    ],
  },

  pro_cloches_marcher: {
    illu: 'place_crousillat_nuit', musique: 'tension',
    texte: 'Tu marches. Tu ne cours pas. Tu marches à leur rythme, la tête levée comme eux, au milieu d’eux, et ils te frôlent, et leurs épaules touchent les tiennes, et une femme en robe de chambre te renifle le cou au passage — longuement — puis détourne la tête vers les cloches, comme on se désintéresse d’un plat qui n’est pas le sien.\n\nTu ne sauras que plus tard pourquoi elle a fait ça.',
    choix: [{ label: 'Atteindre la porte', effets: { flag: 'pro_marche_parmi_eux' }, suivant: 'pro_cloches_porte' }],
  },

  pro_cloches_porte: {
    illu: 'place_crousillat_nuit', musique: 'sombre',
    texte: 'La porte claque derrière toi. Le noir, l’odeur de pierre froide, de fiente de pigeon et de cire. Des coups contre le bois — trois, quatre — puis ils se lassent : là-haut, les cloches sonnent encore, et elles sont plus intéressantes que toi.\n\nPersonne dans le porche. Juste un escalier de pierre qui monte en tournant, et, collé sur la première marche, un morceau de sparadrap où quelqu’un a écrit au stylo : MONTE.',
    choix: [
      {
        label: 'Monter',
        effets: { flag: 'pro_cloches_faites', quete: ['q_prologue', 'monter'], teleporter: { lieu: 'tour_horloge', entree: 'porche' } },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'mecanisme_horloge' (salle de l'horloge, 1er étage de la tour).
  pro_mecanisme: {
    illu: 'horloge_sommet', musique: null,
    texte: 'La salle de l’horloge. Une cage de fer peinte en vert, des roues dentées grandes comme des roues de charrette, des poids suspendus à des câbles qui descendent dans le noir. Tout est immobile. Au mur, derrière le mécanisme, le revers du cadran : les chiffres à l’envers, les aiguilles vues de dos.\n\nNeuf heures dix.\n\nSur une poutre, une plaque émaillée pour les visiteurs, piquée de rouille. Quelqu’un a écrit dessous, au feutre.',
    choix: [{ label: 'Lire la plaque', effets: { document: 'doc_plaque_1909' }, suivant: '#fin' }],
  },

  // Marqueur 'sommet_maud' (terrasse sous la cage des cloches) : Maud.
  pro_maud: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'La femme',
    texte: 'Tout en haut, sous la cage de fer, le vent. Les trois cloches se balancent encore, de moins en moins, et chaque fois qu’elles frôlent le silence, ta bouche se remplit.\n\nUne femme est assise sur la dernière marche, le dos contre un pilier. Cinquante-cinq ans, peut-être moins — l’âge des gens qui n’ont pas dormi depuis longtemps. Une blouse de médecin sous un anorak rouge, un stéthoscope autour du cou comme un chapelet. Une paire de jumelles dans une main, une cigarette éteinte dans l’autre.\n\nElle ne se lève pas. Elle braque une lampe-stylo sur ton visage, puis dans tes yeux, l’un après l’autre.\n\n« Suis la lumière. Non. Avec les yeux, pas avec la tête. » Elle éteint. « Bien. Donne ton bras gauche. »',
    choix: [
      { label: 'Tendre le bras', suivant: 'pro_maud_bras' },
      { label: '« Qui êtes-vous ? »', suivant: 'pro_maud_qui' },
    ],
  },

  pro_maud_qui: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Maud Sérane. Chef des urgences du centre hospitalier du Pays salonais. » Elle tire une bouffée de la cigarette qui n’est pas allumée, par habitude. « Il n’y a plus de centre hospitalier et il n’y a plus d’urgences. Il reste le chef. Ton bras. »',
    choix: [{ label: 'Tendre le bras', suivant: 'pro_maud_bras' }],
  },

  pro_maud_bras: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Elle remonte ta manche. Sur ton avant-bras gauche, là où tu n’avais pas osé regarder : une morsure. Un croissant de dents, net, profond, refermé. La chair a cicatrisé en bourrelets roses et luisants, comme une vieille brûlure. Ça ne fait pas mal. Ça devrait.\n\nMaud passe le pouce dessus, doucement, comme sur la joue d’un enfant.\n\n« Dix-sept jours », dit-elle. Et puis, plus bas, pour elle seule : « Tu parles. Tu es {venu|venue} à la porte. Tu me regardes. »\n\nSa voix se casse sur le dernier mot. Elle s’allume enfin la cigarette, à la troisième allumette, les mains tremblantes.',
    choix: [
      { label: '« Qu’est-ce qui m’est arrivé ? »', suivant: 'pro_maud_verite' },
    ],
  },

  pro_maud_verite: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Le 6 septembre, un mort t’a pris le bras entre ses dents. Ton cœur s’est arrêté dans la soirée. » Elle le dit comme on lit une fiche. « Et puis ton corps s’est remis debout, comme les leurs, et il a marché avec eux. Deux jours. Le 8, je t’ai passé une perche à chiens autour du cou, en haut de la montée du Puech. Tu revenais tous les jours devant la porte du château. Ils reviennent tous quelque part. »\n\nElle te laisse le temps. Elle a l’habitude d’annoncer les choses, et de laisser le temps.\n\n« Ensuite, je me suis occupée de toi. Ensuite, l’armée a vidé l’hôpital, et on a fermé une housse sur toi parce que tu avais l’air d’un cadavre. Tu en étais un. Et ce soir, te voilà. »',
    choix: [
      { label: '« Pourquoi est-ce que je respire ? »', suivant: 'pro_maud_pourquoi' },
      {
        label: '« Il y avait un homme dans une housse. Patrick. »',
        si: { ou: [{ flag: 'patrick_acheve' }, { flag: 'patrick_laisse' }] },
        suivant: 'pro_maud_patrick',
      },
    ],
  },

  pro_maud_patrick: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud ferme les yeux une seconde.\n\n« Patrick Veyrier. Cinquante-deux ans. Chauffeur de car scolaire, ligne de Pélissanne. » Elle rouvre les yeux. « Il y a ceux qui reviennent, et ceux qui reviennent mal. Lui, il est revenu mal. »\n\nElle écrase la cigarette sur la pierre, très soigneusement, jusqu’à ce qu’il n’en reste rien.',
    choix: [{ label: '« Pourquoi est-ce que je respire, moi ? »', suivant: 'pro_maud_pourquoi' }],
  },

  pro_maud_pourquoi: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Tu respires parce que ton cœur bat. Ton cœur bat parce que quelque chose, dans ton sang, a lâché prise. » Elle hausse les épaules. « Pourquoi il a lâché prise chez toi et pas chez les quatre cent mille autres entre la Durance et la mer… »\n\nElle ne finit pas la phrase. Elle regarde ailleurs, vers le noir, vers l’Empéri éteint sur son rocher.\n\n« Ce que je sais, c’est que tu n’es pas le seul cas. Et que si quelqu’un l’apprend avant qu’on ait une preuve, on te met une balle dans la tête, et moi à côté. Les vivants n’aiment pas qu’on leur rende leurs morts. »',
    choix: [{ label: '« Et maintenant ? »', suivant: 'pro_maud_fin' }],
  },

  pro_maud_fin: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud se lève, péniblement, une main sur les reins.\n\n« Maintenant, on descend par l’autre escalier, on longe le mur jusqu’à la maison de Nostradamus, et tu dors. Chez un médecin de la peste, c’est de circonstance. » Elle reprend ses jumelles et regarde en bas, la place, la foule immobile tournée vers la tour, le visage levé vers les cloches qui se sont tues. « Demain, je t’expliquerai pourquoi l’armée attend le vent. »\n\nElle te regarde une dernière fois, longuement, avec quelque chose que tu mettras des jours à nommer. Pas de la tendresse. De la fierté. La fierté d’un artisan devant une pièce réussie.\n\n« Bienvenue parmi les vivants. N’en parle à personne. »',
    choix: [
      { label: 'Regarder en bas', effets: { cinematique: 'pro_sommet' }, suivant: 'pro_fin' },
    ],
  },

  pro_fin: {
    illu: 'nostradamus_cabinet', musique: 'calme',
    texte: 'Tu dors dans une pièce basse qui sent l’encens et la poussière, sous une fausse fenêtre peinte en trompe-l’œil, entre un astrolabe de musée et un mannequin de cire en robe de docteur du seizième siècle. Maud a verrouillé la porte de l’extérieur. Tu l’entends tousser, longtemps, dans l’escalier.\n\nTu n’as pas peur du noir. C’est la première chose que tu remarques. Le noir, tu y étais hier.\n\nLa deuxième chose, c’est que tu as encore faim.',
    choix: [
      {
        label: 'Dormir',
        effets: {
          flag: 'prologue_fini',
          quete: ['q_prologue', 'fin'],
          journal: 'La femme de la tour s’appelle Maud Sérane. Médecin. Elle dit que mon cœur s’est arrêté le 6 septembre, que j’ai marché avec eux, et qu’il est reparti. Elle ne dit pas pourquoi.',
          cinematique: 'ch1_intro',
          teleporter: { lieu: 'nostradamus', entree: 'chambre' },
          tempsMin: 540,
          fatigue: 70,
        },
        suivant: '#fin',
      },
    ],
  },
};
