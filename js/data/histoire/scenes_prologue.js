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
    texte: 'Tu sens quelque chose de froid contre ta bouche : du plastique.\n\nTu prends une inspiration, et le plastique vient se coller à tes lèvres, froid et humide. L’air que tu respires sent le chlore, avec en dessous une odeur sucrée, comme quelque chose qui pourrit.\n\nTu comprends peu à peu que tu es {enfermé|enfermée} dans un grand sac fermé jusqu’en haut, un sac blanc et épais, comme ceux dans lesquels on met les morts.\n\nAu début, tu ne sens plus tes mains. Puis elles se mettent à te brûler, comme si des fourmis te couraient sous les ongles et remontaient jusqu’aux coudes. Ton cœur donne un coup, s’arrête un long moment, puis en donne un autre, lent et lourd.\n\nEt tout au fond de ton ventre, il y a une faim. Pas l’envie de manger un repas : une faim énorme, qui n’a pas de fond.',
    choix: [
      { label: 'Chercher la fermeture éclair du sac', suivant: 'pro_reveil_2' },
    ],
  },

  pro_reveil_2: {
    illu: 'cimetiere_caveau', musique: null,
    texte: 'Tes doigts finissent par trouver la tirette de la fermeture éclair, près de ta tête. Elle résiste, alors tu tires de toutes tes forces, et le sac s’ouvre d’un coup.\n\nIl fait noir. Ça sent la pierre, la cire de bougie et les fleurs fanées.\n\nTu te trouves dans un caveau de cimetière, une de ces petites chapelles de famille où l’on range les cercueils. Tu es {allongé|allongée} sur une étagère de marbre, entre deux cercueils. Sur la dalle au-dessus de toi, tu lis une inscription : FAMILLE ROUX-BÉRENGER — PRIEZ POUR EUX. Par terre, trois autres sacs blancs sont posés en rang, toujours fermés.\n\nCe sac, c’est une housse mortuaire. On t’a mis dedans comme un cadavre.\n\nTon corps met des heures à se réveiller, et tu dois réapprendre à bouger tes jambes, l’une après l’autre. Sous la porte du caveau, tu vois le filet de lumière passer du blanc au jaune, puis au rouge : la journée se termine.\n\nTu remarques un bracelet d’hôpital en plastique jaune à ton poignet gauche, et une étiquette en carton attachée à ton pied par un fil de fer.',
    choix: [
      {
        label: 'Lire l’étiquette attachée à ton pied',
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
    texte: 'Ton nom est écrit sur l’étiquette, au feutre noir et en majuscules. En dessous, on a ajouté :\n\nDÉCÈS CONSTATÉ LE 06/09. CAUSE : MORSURE. LOT 14 — INCINÉRATION.\n\nTu relis plusieurs fois, mais les mots ne changent pas. Quelqu’un a constaté ta mort le 6 septembre : tu as été {mordu|mordue}, tu es {mort|morte}, et on t’a {rangé|rangée} ici avec d’autres corps en attendant de les brûler.\n\nSur le bracelet jaune, il est écrit : URG — P4, c’est-à-dire Urgences, patient numéro 4. Pourtant, tu ne te souviens d’aucun hôpital.\n\nUn petit sachet en plastique est agrafé à la housse, à hauteur de ta poitrine. Tes affaires sont peut-être dedans.',
    choix: [
      {
        label: 'Te lever',
        effets: {
          quete: ['q_prologue', 'scelle'],
          journal: 'Je me suis {réveillé|réveillée} dans une housse mortuaire, dans un caveau du cimetière Saint-Roch. L’étiquette à mon pied dit : décès constaté le 6 septembre, cause : morsure. On m’a {cru|crue} {mort|morte}. Il y a un sachet agrafé à la housse.',
        },
        suivant: '#fin',
      },
    ],
  },

  // CO-OP : le second joueur arrive dans la partie (il se réveille près de l'hôte).
  coop_reveil: {
    illu: 'housse_noir', musique: 'sombre', orateur: null,
    texte: 'Tu sens du plastique contre ta bouche, et le froid. Puis, de l’autre côté, une main se met à tirer sur ta fermeture éclair.\n\nLe sac s’ouvre d’un coup. Au-dessus de toi, il y a un visage que tu connais sans savoir d’où : {coequipier}. Tu remarques le même bracelet jaune à son poignet, et la même étiquette à son pied, avec un autre nom.\n\n« Tu respires. Toi aussi, tu respires. »\n\nVous êtes deux à être revenus, et deux à sentir cette faim au fond du ventre. Autour de vous, le cimetière est silencieux, mais pas tout à fait.',
    choix: [
      {
        label: 'Te relever',
        effets: { journal: 'Je me suis {réveillé|réveillée} dans une housse mortuaire. {coequipier} m’a ouvert. Nous sommes deux. Ce qui marche dehors ne respire pas.' },
        suivant: 'coop_reveil_2',
      },
    ],
  },
  coop_reveil_2: {
    illu: 'cimetiere_caveau', musique: 'sombre', orateur: '{coequipier}',
    texte: '« Reste près de moi. Si l’un de nous tombe, l’autre le relève. D’accord ? »\n\nIci, certaines grilles sont trop lourdes pour une seule personne, et certaines nuits trop longues pour veiller seul. Vous n’avez que l’un et l’autre.',
    choix: [{ label: 'D’accord', suivant: '#fin' }],
  },

  // Marqueur 'scelle_effets' (le sachet agrafé sur la housse, dans le caveau).
  pro_scelle: {
    illu: 'cimetiere_caveau', musique: 'sombre',
    texte: 'Sur le sachet, il y a un numéro, 14-0371, et une mention imprimée : EFFETS PERSONNELS — NE PAS OUVRIR (RISQUE NRBC). NRBC, c’est le sigle qu’utilise l’armée pour les dangers nucléaires, radiologiques, biologiques et chimiques. Ici, il veut dire qu’il y a un risque de contagion.\n\nTu l’ouvres avec les dents.\n\nTu y trouves un portefeuille à ton nom, un téléphone éteint à l’écran fendu, et un trousseau de trois clés que tu ne reconnais pas. Tout au fond, plié en quatre, il y a un papier écrit à la main : une feuille d’ordonnance couverte d’une écriture serrée, tracée à la hâte.',
    choix: [
      {
        label: 'Déplier le papier et le lire',
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
    texte: 'Quelqu’un savait que tu allais te réveiller, et cette personne, qui signe « M. », t’a laissé ce mot.\n\nLe message est clair : tu dois aller à la Tour de l’Horloge, sur la place Crousillat, dans le centre de Salon. Là-bas, il faut allumer une lumière au pied de la tour et la lever vers les cloches. Et quoi que tu entendes ensuite, tu ne dois pas courir vers le bruit.\n\nLe mot te demande de le brûler, mais tu le gardes : c’est la seule chose au monde qui te parle.\n\nAvant tout, il va te falloir une lumière, et ensuite trouver comment sortir du cimetière.\n\nDehors, derrière la porte du caveau, le soir tombe dans un silence complet.',
    choix: [
      {
        label: 'Pousser la porte du caveau',
        effets: {
          quete: ['q_prologue', 'sortir'],
          decouvrir: ['tour_horloge'],
          journal: 'Dans mes affaires, un mot signé « M. » : « Viens à la Tour de l’Horloge, place Crousillat. Allume une lumière au pied de la tour et lève-la vers les cloches. » Quelqu’un savait que je me réveillerais. Il me faut une lumière, puis sortir du cimetière.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Zone devant la porte de la chapelle : le premier regard sur le cimetière.
  pro_dehors: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'En sortant, l’air du soir te frappe le visage. Ça sent le pin chauffé par le soleil, la cendre, et la viande qui a tourné.\n\nÀ quelques pas, tu vois une lueur rouge qui palpite entre les tombes : c’est une fusée de détresse plantée dans le gravier, qui crache ses dernières étincelles. Sa lumière tremble sur un homme assis contre une stèle, en combinaison vert olive, avec un masque à gaz sur le visage. Il ne bouge pas.\n\nContre ses jambes, autre chose est couché par terre, et tu es presque {sûr|sûre} de l’avoir vu bouger.\n\nPlus loin, vers l’esplanade, un fût brûle encore. Et derrière une porte en métal, tu entends des coups, lents et réguliers.',
    choix: [
      { label: 'Approcher sans bruit (accroupi : C, ou le bouton)', effets: { journal: 'Dehors : une fusée rouge, un soldat mort, et quelque chose couché contre lui. Au loin, des coups contre une porte de métal.' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'soldat_nrbc' (allée des mausolées, près du caveau) : la lampe frontale.
  pro_soldat: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Un soldat mort est assis contre un tombeau. Il porte une combinaison de protection vert olive et un masque à gaz, dont la vitre est noircie de l’intérieur par quelque chose de sombre qui a séché.\n\nSon fusil a disparu, mais sa lampe frontale est toujours là, accrochée à sa capuche.\n\nTu remarques aussi une fiche plastifiée scotchée sur sa poitrine.',
    choix: [
      {
        label: 'Prendre la lampe frontale et la fiche',
        effets: {
          objets: [['lampe_frontale', 1], ['piles', 1]],
          document: 'doc_consignes_ramassage',
          flag: 'pro_lampe',
          journal: 'J’ai pris la lampe frontale d’un soldat mort. Sur lui, une fiche : les consignes des équipes qui ramassaient les corps.',
        },
        suivant: 'pro_soldat_2',
      },
    ],
  },

  pro_soldat_2: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Tu lis la fiche à la lumière de la lampe :\n\nCORPS PRÉSENTANT UNE ACTIVITÉ : NEUTRALISATION CRÂNIENNE. CORPS INERTES : ENSACHAGE DIRECT.\n\nAutrement dit, on tirait une balle dans la tête des corps qui bougeaient, et on mettait directement en housse ceux qui ne bougeaient pas.\n\nTu passes la main sur ton crâne : il n’y a pas de trou. Quand ils t’ont {trouvé|trouvée}, tu ne bougeais pas, et tu avais l’air assez {mort|morte} pour qu’on ne gaspille pas une balle.',
    choix: [{ label: 'Allumer la lampe', suivant: '#fin' }],
  },

  // Marqueur 'robinet_fleurs' (contre le mur d'enceinte) : première eau.
  pro_robinet: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Contre le mur du cimetière, il y a le robinet où les familles remplissaient leurs arrosoirs pour les fleurs. Un arrosoir vert y pend encore, et une paire de gants de jardin sèche sur le rebord depuis trois semaines.\n\nQuand tu ouvres le robinet, les tuyaux toussent un moment, puis l’eau arrive, rouillée au début, et ensuite claire et glacée, avec un goût de fer.\n\nTu as terriblement soif, et tu bois jusqu’à en avoir mal aux dents.',
    choix: [
      { label: 'Boire encore', effets: { soif: 55, flag: 'pro_eau_bue' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'housse_patrick' (une housse posée contre la chapelle voisine) : un « raté ».
  pro_patrick: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Une voix',
    texte: 'Contre le mur de la chapelle voisine, une housse blanche est en train de bouger. Quelqu’un est vivant là-dedans, comme toi tout à l’heure.\n\nTu entends une voix d’homme, enrouée et étouffée par le plastique :\n\n« Il y a quelqu’un ? Je vous entends marcher. La fermeture est coincée. Je m’appelle Patrick, Patrick Veyrier. J’habite rue… j’habite… »\n\nIl se tait un moment, puis reprend plus bas, presque gêné :\n\n« J’ai faim. C’est bête, hein ? J’ai tellement faim. »',
    choix: [
      { label: 'Ouvrir la housse', suivant: 'pro_patrick_ouvre' },
      { label: 'Lui parler sans ouvrir', suivant: 'pro_patrick_parle' },
      { label: 'Reculer sans faire de bruit', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_parle: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: '« Patrick, vous étiez à l’hôpital ? »\n\n« L’hôpital. Oui. La dame. La docteure. » Il a un petit rire mouillé. « Elle avait une clochette. Elle agitait sa clochette, et on avait à manger. »\n\nLe plastique se tend, et tu vois un visage s’y dessiner, la bouche grande ouverte, qui se met à mordre la housse.\n\n« Tu sens bon », dit la voix, qui n’a déjà plus grand-chose d’humain. Patrick n’est plus là : ce qui reste dans la housse veut te manger.',
    choix: [
      { label: 'Prendre le lourd vase de la tombe voisine', suivant: 'pro_patrick_achever' },
      { label: 'Partir', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_ouvre: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: 'Tu tires sur la fermeture coincée, et elle finit par céder d’un coup.\n\nPatrick a une cinquantaine d’années. Il porte des lunettes tordues, une blouse d’hôpital, et au poignet le même bracelet jaune que toi. Pendant une seconde, il te regarde vraiment, comme un homme gêné qu’on le voie en chemise de nuit, et il ouvre la bouche pour te remercier.\n\nMais la seconde passe.\n\nSes yeux descendent vers ta gorge, et tu comprends qu’il ne te voit plus : il ne voit plus que de la viande.',
    choix: [
      { label: 'Le frapper avec un vase avant qu’il se lève', suivant: 'pro_patrick_achever' },
      { label: 'Refermer la housse et t’éloigner', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_achever: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Sur la tombe voisine, il y a un vase funéraire en granit, très lourd. Tu le soulèves à deux mains et tu le tiens au-dessus de la tête de Patrick.',
    choix: [
      {
        label: 'Frapper',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: 'Le premier coup fait le bruit d’une noix qu’on écrase, le deuxième un bruit mouillé, et au troisième la housse ne bouge plus. Tu restes {penché|penchée} au-dessus, à écouter ton cœur qui cogne beaucoup trop vite.\n\nSur le bracelet jaune de Patrick, tu lis : URG — P3, patient numéro 3.\n\nToi, tu es le numéro 4.',
          effets: { flag: 'patrick_acheve', xp: { force: 10 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Le vase glisse sur le plastique et rebondit sur son épaule. Sa main jaillit alors de la housse et t’attrape le poignet, et ses ongles t’entaillent la peau. Tu frappes une deuxième fois, puis une troisième, jusqu’à ce que la main te lâche.\n\nSur le bracelet jaune de Patrick, tu lis : URG — P3, patient numéro 3.\n\nToi, tu es le numéro 4.',
          effets: { flag: 'patrick_acheve', blessure: { type: 'egratignure', zone: 'à la main' }, xp: { force: 4 } },
          suivant: '#fin',
        },
      },
    ],
  },

  pro_patrick_part: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Tu t’éloignes. Derrière toi, la housse continue de parler de tes pas, de sa faim et d’une rue dont il ne se souvient plus. Puis elle se tait, et tu l’entends se mettre à gratter.',
    choix: [{ label: 'Continuer', effets: { flag: 'patrick_laisse' }, suivant: '#fin' }],
  },

  // Marqueur 'conteneur_frigo' (esplanade) : la morgue provisoire.
  pro_conteneur: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Sur l’esplanade, deux conteneurs frigorifiques blancs, comme ceux des camions de fruits et légumes, sont garés de travers : on s’en est servi de morgue. Entre les deux, le groupe électrogène qui les refroidissait est éteint. Il fait chaud, et l’odeur de mort est partout.\n\nUn porte-bloc pend au bout d’une ficelle sur la porte du premier conteneur.\n\nDerrière cette porte, quelqu’un frappe. Ce sont de petits coups réguliers, sans force, comme si celui qui frappe avait oublié pourquoi il le fait.',
    choix: [
      {
        label: 'Prendre le porte-bloc et le lire',
        effets: { document: 'doc_registre_saint_roch', flag: 'pro_registre_lu' },
        suivant: 'pro_conteneur_2',
      },
      { label: 'Poser la main sur la barre de la porte', suivant: 'pro_conteneur_barre' },
    ],
  },

  pro_conteneur_2: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'C’est le registre des corps. Tu lis : « LOT 14 — 212 CORPS. » C’est ton lot. Les lots 11, 12 et 13 ont été brûlés, à raison d’un par jour, et le lot 14 devait suivre.\n\nLe groupe électrogène a reçu son dernier plein le 13 septembre. Un peu plus bas, quelqu’un a écrit « PASSAGE DU 16 : ANNULÉ », et ensuite il n’y a plus rien.\n\nPersonne n’est jamais revenu brûler le lot 14, et c’est pour ça que tu es encore là.',
    choix: [{ label: 'Reculer', suivant: '#fin' }],
  },

  pro_conteneur_barre: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu poses la main sur la barre qui ferme la porte.\n\nÀ l’intérieur, les coups s’arrêtent tous en même temps.\n\nTu retires ta main très lentement. Pendant une longue minute, tu n’entends plus rien, puis les coups reprennent doucement.',
    choix: [{ label: 'Laisser la porte fermée', suivant: '#fin' }],
  },

  // Marqueur 'loge_gardien' (bureau de la loge, près de la grille) : le plan de Salon, et derrière lui, la clé.
  // Mise en scène : le crochet GRILLE PRINCIPALE du tableau est vide (le sergent a emporté la clé). Le gardien a
  // caché le DOUBLE sur un clou, derrière le plan de Salon punaisé au mur, au-dessus du bureau, et il l'a noué à son
  // poignet par une ficelle. Il est mort dans son fauteuil : un corps du décor, qu'on ne peut ni frapper ni contourner.
  // Tous les chemins passent par le plan, puis par la ficelle : emporter la clé le RÉVEILLE, toujours (pas de discrétion
  // possible). Le mort qui se lève est posé par le plan (js/data/niveaux/cimetiere.js, si pro_cle_prise, reveil).
  pro_loge: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La loge du gardien sent le café froid, le tabac et la pisse de chat. Il n’y a qu’une pièce, avec un lit étroit, un coin cuisine et un bureau poussé sous la fenêtre.\n\nPrès de la porte, sur un tableau, les clés des chapelles pendent à leurs crochets, chacune avec son étiquette. Un seul crochet est vide, le plus gros, et son étiquette dit : GRILLE PRINCIPALE.\n\nDevant le bureau, le gardien est assis dans son fauteuil, en gilet de laine et en pantoufles, la tête tombée sur l’épaule. Il est mort, et depuis plusieurs jours : sa peau a pris la couleur de la cire, et des mouches marchent sur ses mains sans qu’il bouge un doigt. Lui ne s’est pas relevé. Peut-être que certains ne se relèvent pas.\n\nIl est tourné vers le mur au-dessus du bureau, comme s’il regardait encore ce qui y est punaisé : un grand plan de Salon-de-Provence couvert de notes au stylo. Sur le bureau, juste à portée de sa main, un cahier est resté ouvert.',
    choix: [
      { label: 'Lire le cahier ouvert', effets: { document: 'doc_cahier_gardien' }, suivant: 'pro_loge_2' },
      { label: 'Décrocher le plan de Salon', si: { pasFlag: 'pro_plan_pris' }, suivant: 'pro_loge_plan' },
      // (scène interrompue puis rejouée : le plan est déjà pris, la clé attend sur son clou)
      { label: 'Regarder la clé, sur le clou derrière le plan', si: { flag: 'pro_plan_pris' }, suivant: 'pro_loge_cle' },
    ],
  },

  pro_loge_2: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La dernière ligne du cahier date d’avant-hier : « Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas. »\n\nLa chapelle des Roux-Bérenger, c’est le caveau où tu t’es {réveillé|réveillée}. Le gardien t’a {entendu|entendue} bouger, et il a eu peur.\n\nQuelques lignes plus haut, il raconte que les soldats sont partis avec la clé de la grille, mais qu’il leur a caché le double. Il n’écrit pas où.\n\nÀ côté du cahier, sa main repose sur l’accoudoir, la paume ouverte, comme s’il attendait qu’on lui rende quelque chose.',
    choix: [
      { label: 'Chercher le double dans la loge', suivant: 'pro_loge_fouille' },
      { label: 'Décrocher le plan de Salon', suivant: 'pro_loge_plan' },
    ],
  },

  pro_loge_fouille: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu fouilles la loge. Le tiroir du bureau bute contre les genoux du mort, et tu dois pousser le fauteuil pour l’ouvrir : il pèse plus lourd que tu ne le pensais, et la tête du gardien roule un peu sur son épaule. Dans le tiroir, tu ne trouves que des factures, des pastilles Valda et un briquet vide, mais pas de clé. Il n’y a rien non plus sous l’oreiller, ni dans la veste pendue derrière la porte.\n\nLes soldats voulaient toutes les clés. S’ils ont fouillé la loge, ils ont regardé dans les tiroirs et dans les poches, mais pas sur le mur, sous les yeux de tout le monde.\n\nTu relèves les yeux vers le plan de Salon.',
    choix: [{ label: 'Décrocher le plan de Salon', suivant: 'pro_loge_plan' }],
  },

  pro_loge_plan: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Le plan est punaisé au mur, juste au-dessus de la tête du mort. Pour l’atteindre, tu dois te pencher par-dessus le fauteuil, le ventre contre le dossier et le visage à quelques centimètres de sa nuque grise, qui sent le tabac froid et la viande tournée.\n\nTu retires les punaises une à une et tu roules le papier contre ta poitrine. C’est le plan du centre-ville que donne l’office de tourisme, en papier glacé, avec les monuments numérotés. Tout en bas, sur le cimetière Saint-Roch, le gardien a dessiné une croix au stylo.\n\nDerrière, le mur est plus clair : il reste un rectangle propre au milieu du plâtre jauni par la fumée. Dans le coin, il y a un clou, et sur ce clou est accrochée une grosse clé de laiton.',
    choix: [{
      label: 'Regarder la clé de plus près',
      effets: { objet: ['plan_salon', 1], flag: 'pro_plan_pris', document: 'doc_plan_salon' },
      suivant: 'pro_loge_cle',
    }],
  },

  pro_loge_cle: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'La clé est lourde, plus longue que ta main. Une étiquette en carton pend à l’anneau, avec ces mots écrits au stylo bille : DOUBLE GRILLE — NE PAS DONNER.\n\nÀ l’anneau est aussi nouée une ficelle de cuisine. Elle descend le long du mur, passe derrière le dossier du fauteuil et finit serrée de trois tours autour du poignet du gardien.\n\nIl avait de quoi sortir, mais il ne l’a jamais fait. Il a préféré s’attacher à sa clé et rester assis là, devant son plan, jusqu’à la fin. Pour l’emporter, il faudra la lui reprendre.',
    choix: [{ label: 'Décrocher la clé', suivant: 'pro_loge_reveil' }],
  },

  pro_loge_reveil: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu décroches la clé du clou, et la ficelle se tend. Le bras du gardien se soulève avec elle, mou comme celui d’une poupée, puis il retombe sur l’accoudoir. Tu tires d’un coup sec, et la ficelle casse.\n\nDans le fauteuil, la tête se redresse.\n\nLes doigts du gardien se referment sur les accoudoirs, ses pantoufles raclent le lino, et il se lève. Il n’était pas mort pour de bon : il attendait, comme toi au fond de ton caveau, que quelque chose le réveille.\n\nIl se tourne vers toi, et il ouvre la bouche.',
    choix: [
      {
        label: 'Serrer la clé et reculer',
        effets: {
          objet: ['cle_grille_saint_roch', 1],
          flag: 'pro_cle_prise',
          journal: 'Dans la loge, le gardien était mort dans son fauteuil, face à un plan de Salon punaisé au mur. Derrière le plan, il avait caché le double de la clé de la grille, et il l’avait attaché à son poignet par une ficelle. Quand j’ai pris la clé, il s’est relevé.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'grille_sortie' (grille principale, boulevard du Roi-René). Rejouable tant que la grille est fermée.
  // On ne passe pas par-dessus : pointes de lance + barbelé à lames posé par l'armée. Seule la clé ouvre.
  pro_grille: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'La grille principale donne sur le boulevard du Roi-René. Ses deux battants de fer forgé, deux fois plus hauts que toi, se terminent par des pointes de lance, et ils sont fermés à clé.\n\nAu-dessus des pointes, l’armée a déroulé du barbelé à lames, celui des clôtures de prison, qui coupe comme un rasoir, et ce barbelé court sur tout le mur d’enceinte. Un panneau rouge est attaché aux barreaux : ZONE D’EXCLUSION SANITAIRE — ACCÈS INTERDIT. Les soldats ont fermé le cimetière pour que rien n’en sorte, ni les morts du lot 14 ni personne d’autre. Passer par-dessus, ce serait s’ouvrir les mains et le ventre.\n\nSur le pilier, une plaque émaillée indique : CIMETIÈRE SAINT-ROCH — OUVERT DE 7 H 30 À 19 H — FERMETURE DES PORTES PAR LE GARDIEN.\n\nDe l’autre côté, tu vois les platanes, des voitures abandonnées et la ville qui descend vers le centre. Au-dessus des toits se dresse la Tour de l’Horloge, avec la cage de fer noire où pendent les cloches. C’est là que le mot de « M. » te dit d’aller, et elle n’a pas l’air loin.',
    choix: [
      {
        label: 'Ouvrir la grille avec la clé',
        besoin: { objet: 'cle_grille_saint_roch' },
        effets: {
          flag: 'pro_grille_ouverte',
          quete: ['q_prologue', 'horloge'],
          journal: 'Je suis {sorti|sortie} du cimetière Saint-Roch. La Tour de l’Horloge est à cinq cents mètres. C’est là que m’attend « M. ».',
        },
        suivant: '#fin',
      },
      { label: 'Secouer la grille', si: { pasFlag: 'pro_plan_pris' }, effets: { bruit: 2 }, suivant: 'pro_grille_secouer' },
      { label: 'Faire demi-tour', suivant: '#fin' },
    ],
  },

  pro_grille_secouer: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu prends les barreaux à deux mains et tu tires de toutes tes forces, mais la serrure tient, et les gonds aussi. Le fer gronde et résonne sur tout le boulevard, et le barbelé tinte au-dessus de ta tête.\n\nCette grille ne s’ouvrira qu’avec sa clé. Quelqu’un l’ouvrait chaque matin et la refermait chaque soir, quelqu’un qui vivait ici.\n\nDerrière toi, entre les tombes, quelque chose a entendu le bruit.',
    choix: [{ label: 'Reculer dans l’ombre', suivant: '#fin' }],
  },

  // ─────────────────────────── LA TOUR ───────────────────────────
  // Déclencheur : entrée dans 'tour_horloge' (si pro_note_lue, pas encore pro_cloches_faites).
  pro_horloge: {
    illu: 'place_crousillat_nuit', musique: null,
    texte: 'Te voici sur la place Crousillat.\n\nAu milieu se trouve la Fontaine Moussue, un gros champignon de pierre couvert de mousse verte qui crache son eau dans un bassin. Le bruit de l’eau est le seul que tu entends. Autour, les terrasses des cafés sont à l’abandon, avec leurs chaises renversées et un parasol cassé, et toutes les fenêtres sont noires.\n\nAu bout de la place se dresse la Tour de l’Horloge : trois étages de pierre blonde et, tout en haut, une cage de fer où pendent les cloches.\n\nLe cadran indique neuf heures dix. Tu le regardes longtemps avant de comprendre que l’aiguille ne bouge pas : l’horloge est arrêtée.\n\nLe mot de « M. » disait d’allumer une lumière au pied de la tour et de la lever vers les cloches.',
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
    texte: 'Au pied de la tour, il y a une petite porte en chêne. Tu frappes, et le bruit résonne sur toute la place.\n\nD’abord, rien ne se passe. Puis, tout en haut, entre les cloches, tu vois une lumière s’allumer, s’éteindre et se rallumer.\n\nQuelqu’un, là-haut, t’a {vu|vue}.',
    choix: [{ label: 'Lever les yeux vers les cloches', effets: { flag: 'pro_signal', cinematique: 'pro_cloches' }, suivant: 'pro_cloches' }],
  },

  pro_cloches: {
    illu: 'place_crousillat_nuit', musique: 'tension',
    texte: 'Les cloches se mettent à sonner, et les morts arrivent. Ils sortent de partout, des rues, des porches, des terrasses, par dizaines, et ils marchent tous vers la tour, le visage levé vers les cloches.\n\nEt toi aussi, tu avances.\n\nTes pieds ont fait trois pas vers eux sans que tu l’aies décidé. Ta bouche se remplit de salive, et chaque fois que tu avales, elle revient aussitôt, comme devant la vitrine d’une boulangerie. À chaque coup de cloche, la faim te tire vers le bruit.\n\nAu pied de la tour, la petite porte s’entrouvre, et une main en sort pour te faire signe de venir, vite.\n\nIl faut décider maintenant.',
    timerMs: 9000,
    timeout: {
      texte: 'Tu as trop attendu, ou plutôt tu n’attendais pas : tu avançais vers les cloches sans t’en rendre compte. Quand tu reprends le contrôle de tes jambes, tu te trouves au bord du bassin, au milieu des morts, et l’un d’eux vient de sentir que tu n’es pas comme lui. Il se jette sur toi.',
      effets: { flag: 'pro_suivi_cloches', combat: { zombies: ['coureur'] } },
      suivant: 'pro_cloches_porte',
    },
    choix: [
      {
        label: 'Courir jusqu’à la porte de la tour',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu traverses la place en courant, entre les dos et les épaules. Des mains se lèvent, mais trop tard, et personne ne te suit : ils ne regardent que les cloches.',
          effets: { xp: { agilite: 8 } },
          suivant: 'pro_cloches_porte',
        },
        echec: {
          texte: 'Au passage, une main t’attrape par la manche et tire. Tu sens des ongles griffer ton avant-bras et un souffle froid passer sur ta nuque, mais tu arraches ton bras et tu cours jusqu’à la porte.',
          effets: { blessure: { type: 'egratignure', zone: "à l'avant-bras" } },
          suivant: 'pro_cloches_porte',
        },
      },
      {
        label: 'Marcher lentement au milieu d’eux jusqu’à la porte',
        suivant: 'pro_cloches_marcher',
      },
      {
        label: 'Céder à la faim et suivre les cloches',
        effets: { flag: 'pro_suivi_cloches', combat: { zombies: ['coureur'] } },
        suivant: 'pro_cloches_porte',
      },
    ],
  },

  pro_cloches_marcher: {
    illu: 'place_crousillat_nuit', musique: 'tension',
    texte: 'Tu ne cours pas. Tu marches à leur rythme au milieu d’eux, la tête levée comme eux, et leurs épaules frôlent les tiennes. Une morte en robe de chambre approche son nez de ton cou et te renifle longuement, puis elle se détourne vers les cloches, comme si tu n’étais pas à son goût.\n\nTu ne comprendras que plus tard pourquoi elle t’a laissé passer.',
    choix: [{ label: 'Atteindre la porte', effets: { flag: 'pro_marche_parmi_eux' }, suivant: 'pro_cloches_porte' }],
  },

  pro_cloches_porte: {
    illu: 'place_crousillat_nuit', musique: 'sombre',
    texte: 'Tu entres dans la tour, et la porte claque derrière toi. Il fait noir, et ça sent la pierre froide et la fiente de pigeon. Tu entends trois ou quatre coups frapper contre le bois, puis plus rien : là-haut, les cloches sonnent encore, et elles les intéressent davantage que toi.\n\nIl n’y a personne en bas, seulement un escalier de pierre qui monte en tournant. Sur la première marche, quelqu’un a collé un morceau de sparadrap avec un mot écrit au stylo : MONTE.',
    choix: [
      {
        label: 'Monter l’escalier',
        effets: { flag: 'pro_cloches_faites', quete: ['q_prologue', 'monter'], teleporter: { lieu: 'tour_horloge', entree: 'porche' } },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'mecanisme_horloge' (salle de l'horloge, 1er étage de la tour).
  pro_mecanisme: {
    illu: 'horloge_sommet', musique: null,
    texte: 'Tu arrives dans la salle de l’horloge. Il y a là une cage de fer peinte en vert, des roues dentées grandes comme des roues de charrette et des poids suspendus à des câbles, et tout est immobile. Contre le mur, tu vois le cadran de l’intérieur, avec les chiffres à l’envers et les aiguilles de dos.\n\nIl est arrêté sur neuf heures dix.\n\nSur une poutre, une plaque pour les visiteurs est rongée par la rouille, et quelqu’un a écrit dessous au feutre.',
    choix: [{ label: 'Lire la plaque', effets: { document: 'doc_plaque_1909' }, suivant: '#fin' }],
  },

  // Marqueur 'sommet_maud' (terrasse sous la cage des cloches) : Maud.
  pro_maud: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'La femme',
    texte: 'Tout en haut de la tour, sous la cage des cloches, le vent souffle. Les trois cloches se balancent encore, de moins en moins fort, et chaque fois qu’elles tintent, ta bouche se remplit de salive.\n\nUne femme est assise sur la dernière marche, le dos contre un pilier. Elle doit avoir cinquante-cinq ans, et elle a l’air de quelqu’un qui n’a pas dormi depuis longtemps. Elle porte une blouse de médecin sous un anorak rouge et un stéthoscope autour du cou, et elle tient des jumelles dans une main et une cigarette éteinte dans l’autre.\n\nC’est sans doute « M. », celle qui t’a laissé le mot.\n\nElle ne se lève pas. Elle braque une petite lampe sur ton visage, puis dans tes yeux, l’un après l’autre.\n\n« Suis la lumière. Non, avec les yeux, pas avec la tête. » Elle éteint. « Bien. Donne-moi ton bras gauche. »',
    choix: [
      { label: 'Tendre le bras', suivant: 'pro_maud_bras' },
      { label: '« Qui êtes-vous ? »', suivant: 'pro_maud_qui' },
    ],
  },

  pro_maud_qui: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Maud Sérane, cheffe des urgences de l’hôpital de Salon. C’est moi qui t’ai écrit. » Elle tire sur sa cigarette éteinte, par habitude. « Il n’y a plus d’hôpital ni d’urgences. Il ne reste que la cheffe. Ton bras. »',
    choix: [{ label: 'Tendre le bras', suivant: 'pro_maud_bras' }],
  },

  pro_maud_bras: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Elle remonte ta manche. Sur ton avant-bras gauche, là où tu n’avais pas osé regarder, il y a une morsure : la marque profonde d’une mâchoire humaine, qui s’est refermée. La peau a cicatrisé en bourrelets roses et luisants. Ça ne te fait pas mal, alors que ça devrait.\n\nMaud passe doucement le pouce dessus, comme on caresse la joue d’un enfant.\n\n« Dix-sept jours », dit-elle. Puis, plus bas, pour elle-même : « Tu parles. Tu es {venu|venue} jusqu’à moi. Tu me regardes. »\n\nSa voix se brise. Elle finit par allumer sa cigarette, à la troisième allumette, avec des mains qui tremblent.',
    choix: [
      { label: '« Qu’est-ce qui m’est arrivé ? »', suivant: 'pro_maud_verite' },
    ],
  },

  pro_maud_verite: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Le 6 septembre, un mort t’a mordu le bras, et le soir même ton cœur s’est arrêté. » Elle le dit sur le ton qu’on prend pour lire un dossier médical. « Ensuite, ton corps s’est relevé comme les leurs, et il a marché avec eux pendant deux jours. Tu revenais chaque jour devant la porte du château de l’Empéri : ils retournent tous quelque part. Le 8, je t’ai {attrapé|attrapée} en haut de la montée du Puech avec une perche de fourrière, un lasso au bout d’un bâton. »\n\nElle te laisse le temps d’encaisser : elle a l’habitude d’annoncer les mauvaises nouvelles.\n\n« Après, je t’ai {soigné|soignée}. Puis l’armée a vidé l’hôpital, et les soldats t’ont {mis|mise} dans une housse parce que tu avais l’air d’un cadavre. Tu en étais un. Et ce soir, te voilà debout. »',
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
    texte: 'Maud ferme les yeux une seconde.\n\n« Patrick Veyrier, cinquante-deux ans, chauffeur de car scolaire sur la ligne de Pélissanne. » Elle rouvre les yeux. « Certains reviennent bien, comme toi, et d’autres reviennent mal. Lui est revenu mal : il a eu quelques minutes de lucidité, et après il ne lui restait plus que la faim. »\n\nElle écrase sa cigarette sur la pierre, très soigneusement, jusqu’à ce qu’il n’en reste rien.',
    choix: [{ label: '« Et moi, pourquoi est-ce que je respire ? »', suivant: 'pro_maud_pourquoi' }],
  },

  pro_maud_pourquoi: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Tu respires parce que ton cœur bat. Et ton cœur bat parce que la maladie qui est dans ton sang s’est endormie. » Elle hausse les épaules. « Pourquoi chez toi, et pas chez les quatre cent mille autres, entre la Durance et la mer… »\n\nElle ne finit pas sa phrase et regarde au loin, vers le château de l’Empéri, sombre sur son rocher.\n\n« Ce que je sais, c’est que tu n’es pas le seul cas. Et que si quelqu’un l’apprend avant que j’aie une preuve, on te mettra une balle dans la tête, et à moi aussi. Les vivants n’aiment pas qu’on leur rende leurs morts. »',
    choix: [{ label: '« Et maintenant ? »', suivant: 'pro_maud_fin' }],
  },

  pro_maud_fin: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud se lève avec peine, une main dans le dos.\n\n« Maintenant, on descend par l’autre escalier, on longe le mur jusqu’à la maison de Nostradamus, et tu dors. C’est là que je me cache. Nostradamus soignait la peste, alors le lieu est bien choisi. » Elle reprend ses jumelles et regarde la place en contrebas, où la foule des morts est toujours là, immobile, le visage levé vers les cloches qui se sont tues. « Demain, je t’expliquerai pourquoi l’armée attend le vent. »\n\nElle te regarde une dernière fois, longuement. Il te faudra des jours pour comprendre ce qu’il y avait dans ce regard : ce n’était pas de la tendresse, mais de la fierté, celle d’un artisan devant une pièce réussie.\n\n« Bienvenue parmi les vivants. N’en parle à personne. »',
    choix: [
      { label: 'Regarder la place en bas', effets: { cinematique: 'pro_sommet' }, suivant: 'pro_fin' },
    ],
  },

  pro_fin: {
    illu: 'nostradamus_cabinet', musique: 'calme',
    texte: 'Tu dors dans la maison de Nostradamus, qui est devenue un musée. La pièce est basse et sent l’encens et la poussière. À côté de toi, il y a un vieil instrument d’astronomie et un mannequin de cire habillé en médecin d’il y a cinq siècles. Maud a fermé la porte à clé de l’extérieur, et tu l’entends tousser longtemps dans l’escalier.\n\nLa première chose que tu remarques, c’est que tu n’as pas peur du noir. Le noir, tu y étais encore ce matin.\n\nLa deuxième, c’est que tu as toujours faim.',
    choix: [
      {
        label: 'Dormir',
        effets: {
          flag: 'prologue_fini',
          quete: ['q_prologue', 'fin'],
          journal: 'La femme de la tour s’appelle Maud Sérane. Elle était cheffe des urgences. Elle dit que j’ai été {mordu|mordue} le 6 septembre, que mon cœur s’est arrêté, que j’ai marché avec les morts, puis que mon cœur est reparti. Elle ne sait pas pourquoi, ou ne veut pas le dire. Je dors chez Nostradamus, où elle se cache.',
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
