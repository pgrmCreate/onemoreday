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
    texte: 'Du plastique contre ta bouche.\n\nTu inspires. Le plastique se colle à tes lèvres, froid et humide. L’air sent le chlore et quelque chose de sucré, de pourri.\n\nTu es {enfermé|enfermée} dans un grand sac fermé jusqu’en haut. Un sac blanc, épais, comme ceux où l’on met les morts.\n\nD’abord, tu ne sens plus tes mains. Puis elles te brûlent : des fourmis sous les ongles, jusqu’aux coudes. Ton cœur cogne un coup. Puis rien. Puis un autre coup, lent et lourd.\n\nEt au fond du ventre, une faim. Pas l’envie d’un repas. Une faim énorme, sans fond.',
    choix: [
      { label: 'Chercher la fermeture éclair du sac', suivant: 'pro_reveil_2' },
    ],
  },

  pro_reveil_2: {
    illu: 'cimetiere_caveau', musique: null,
    texte: 'Tes doigts trouvent la tirette de la fermeture éclair, près de ta tête. Elle résiste. Tu tires de toutes tes forces, et le sac s’ouvre d’un coup.\n\nIl fait noir. Ça sent la pierre, la cire et les fleurs fanées.\n\nTu es dans un caveau de cimetière : une petite chapelle de famille, où l’on range les cercueils. Tu es {allongé|allongée} sur une étagère de marbre, entre deux cercueils. Sur la dalle, au-dessus de toi, une inscription : FAMILLE ROUX-BÉRENGER — PRIEZ POUR EUX. Par terre, trois autres sacs blancs, fermés, posés en rang.\n\nCe sac, c’est une housse mortuaire. On t’a mis dedans comme un cadavre.\n\nTon corps met des heures à se réveiller. Tu réapprends à bouger tes jambes, une à la fois. Sous la porte du caveau, le rai de lumière passe du blanc au jaune, puis au rouge : la journée se termine.\n\nÀ ton poignet gauche, un bracelet d’hôpital en plastique jaune. À ton pied, une étiquette en carton, attachée par un fil de fer.',
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
    texte: 'Ton nom est écrit sur l’étiquette, au feutre noir, en majuscules. Et dessous :\n\nDÉCÈS CONSTATÉ LE 06/09. CAUSE : MORSURE. LOT 14 — INCINÉRATION.\n\nTu relis. Les mots ne changent pas. Quelqu’un a constaté ta mort le 6 septembre. Tu as été {mordu|mordue}, tu es {mort|morte}, et on t’a {rangé|rangée} ici avec d’autres corps, en attendant de les brûler.\n\nSur le bracelet jaune, il est écrit : URG — P4. Urgences, patient numéro 4. Tu ne te souviens d’aucun hôpital.\n\nUn petit sachet en plastique est agrafé à la housse, à hauteur de ta poitrine. Dedans, il y a peut-être tes affaires.',
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
    texte: 'Du plastique contre ta bouche. Le froid. Puis une main, dehors, qui tire sur ta fermeture éclair.\n\nLe sac s’ouvre d’un coup. Au-dessus de toi, un visage que tu connais sans savoir d’où : {coequipier}. Le même bracelet jaune au poignet. La même étiquette au pied, avec un autre nom.\n\n« Tu respires. Toi aussi, tu respires. »\n\nVous êtes deux à être revenus. Deux à avoir cette faim au fond du ventre. Autour de vous, le cimetière se tait — pas tout à fait.',
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
    texte: '« Reste près de moi. Si l’un de nous tombe, l’autre le relève. D’accord ? »\n\nIl y a des grilles trop lourdes pour une seule paire de bras, et des nuits trop longues pour une seule paire d’yeux. Ici, vous n’avez que vous.',
    choix: [{ label: 'D’accord', suivant: '#fin' }],
  },

  // Marqueur 'scelle_effets' (le sachet agrafé sur la housse, dans le caveau).
  pro_scelle: {
    illu: 'cimetiere_caveau', musique: 'sombre',
    texte: 'Le sachet porte un numéro, 14-0371, et une mention imprimée : EFFETS PERSONNELS — NE PAS OUVRIR (RISQUE NRBC). NRBC, c’est le sigle de l’armée pour les dangers nucléaires, radiologiques, biologiques et chimiques. Ici, il veut dire : risque de contagion.\n\nTu l’ouvres avec les dents.\n\nDedans : un portefeuille à ton nom. Un téléphone à l’écran fendu, éteint. Un trousseau de trois clés que tu ne reconnais pas. Et, plié en quatre au fond, un papier écrit à la main : une feuille d’ordonnance de médecin, couverte d’une écriture serrée et pressée.',
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
    texte: 'Quelqu’un savait que tu allais te réveiller. Quelqu’un qui signe « M. » et qui t’a laissé ce mot.\n\nLe message est clair : va à la Tour de l’Horloge, sur la place Crousillat, dans le centre de Salon. Allume une lumière au pied de la tour et lève-la vers les cloches. Et quoi que tu entendes ensuite, ne cours pas vers le bruit.\n\nLe mot dit de le brûler. Tu le gardes. C’est la seule chose au monde qui te parle.\n\nAvant tout, il te faut une lumière. Puis il faudra trouver la sortie du cimetière.\n\nDehors, derrière la porte du caveau, le soir tombe. Tout est silencieux.',
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
    texte: 'L’air du soir te gifle. Ça sent le pin chaud, la cendre et la viande qui tourne.\n\nÀ quelques pas, une lueur rouge palpite entre les tombes : une fusée de détresse plantée dans le gravier, qui crache ses dernières étincelles. Sa lumière tremble sur un homme assis contre une stèle — une combinaison vert olive, un masque à gaz. Il ne bouge pas.\n\nContre ses jambes, quelque chose d’autre est couché. Quelque chose qui, lui, a bougé. Tu en es presque {sûr|sûre}.\n\nPlus loin, vers l’esplanade, un fût brûle encore. Et derrière une porte de métal, des coups. Lents. Réguliers.',
    choix: [
      { label: 'Approcher sans bruit (accroupi : C, ou le bouton)', effets: { journal: 'Dehors : une fusée rouge, un soldat mort, et quelque chose couché contre lui. Au loin, des coups contre une porte de métal.' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'soldat_nrbc' (allée des mausolées, près du caveau) : la lampe frontale.
  pro_soldat: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Un soldat est assis contre un tombeau, mort. Il porte une combinaison de protection vert olive et un masque à gaz. La vitre du masque est noircie de l’intérieur, par quelque chose de sombre qui a séché.\n\nSon fusil a disparu. Mais sa lampe frontale est toujours là, accrochée à sa capuche.\n\nSur sa poitrine, une fiche plastifiée est scotchée à la combinaison.',
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
    texte: 'Tu lis la fiche à la lumière de la lampe.\n\nCORPS PRÉSENTANT UNE ACTIVITÉ : NEUTRALISATION CRÂNIENNE. CORPS INERTES : ENSACHAGE DIRECT.\n\nAutrement dit : les corps qui bougent, on leur tire une balle dans la tête. Ceux qui ne bougent pas, on les met directement dans une housse.\n\nTu touches ton crâne. Pas de trou. Quand ils t’ont {trouvé|trouvée}, tu ne bougeais pas. Tu avais l’air assez {mort|morte} pour qu’on ne gaspille pas une balle.',
    choix: [{ label: 'Allumer la lampe', suivant: '#fin' }],
  },

  // Marqueur 'robinet_fleurs' (contre le mur d'enceinte) : première eau.
  pro_robinet: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'Contre le mur du cimetière, il y a le robinet où les familles remplissaient leurs arrosoirs pour les fleurs. Un arrosoir vert pend encore au robinet. Une paire de gants de jardin sèche sur le rebord depuis trois semaines.\n\nTu ouvres le robinet. Les tuyaux toussent, puis l’eau arrive : rouillée d’abord, puis claire et glacée, avec un goût de fer.\n\nTu as terriblement soif. Tu bois jusqu’à avoir mal aux dents.',
    choix: [
      { label: 'Boire encore', effets: { soif: 55, flag: 'pro_eau_bue' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'housse_patrick' (une housse posée contre la chapelle voisine) : un « raté ».
  pro_patrick: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Une voix',
    texte: 'Contre le mur de la chapelle voisine, une housse blanche bouge. Quelqu’un est vivant là-dedans, comme toi tout à l’heure.\n\nUne voix d’homme, enrouée, étouffée par le plastique :\n\n« Il y a quelqu’un ? Je vous entends marcher. La fermeture est coincée. Je m’appelle Patrick. Patrick Veyrier. J’habite rue… j’habite… »\n\nUn silence. Puis, plus bas, presque gêné :\n\n« J’ai faim. C’est bête, hein ? J’ai tellement faim. »',
    choix: [
      { label: 'Ouvrir la housse', suivant: 'pro_patrick_ouvre' },
      { label: 'Lui parler sans ouvrir', suivant: 'pro_patrick_parle' },
      { label: 'Reculer sans faire de bruit', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_parle: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: '« Patrick, vous étiez à l’hôpital ? »\n\n« L’hôpital. Oui. La dame. La docteure. » Il a un petit rire mouillé. « Elle avait une clochette. Elle agitait sa clochette, et on avait à manger. »\n\nLe plastique se tend. Un visage s’y dessine, la bouche grande ouverte. La bouche mord le plastique.\n\n« Tu sens bon », dit la voix. Ce n’est plus vraiment une voix humaine. Patrick n’est plus là. Ce qui reste dans la housse veut te manger.',
    choix: [
      { label: 'Prendre le lourd vase de la tombe voisine', suivant: 'pro_patrick_achever' },
      { label: 'Partir', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_ouvre: {
    illu: 'saint_roch_nuit', musique: 'tension', orateur: 'Patrick',
    texte: 'Tu tires sur la fermeture coincée. Elle cède d’un coup.\n\nPatrick a une cinquantaine d’années. Des lunettes tordues, une blouse d’hôpital, et au poignet un bracelet jaune, le même que le tien. Pendant une seconde, il te regarde vraiment : un homme gêné qu’on le voie en chemise de nuit. Il ouvre la bouche pour te remercier.\n\nPuis la seconde passe.\n\nSes yeux descendent sur ta gorge. Il ne te voit plus. Il voit de la viande.',
    choix: [
      { label: 'Le frapper avec un vase avant qu’il se lève', suivant: 'pro_patrick_achever' },
      { label: 'Refermer la housse et t’éloigner', suivant: 'pro_patrick_part' },
    ],
  },

  pro_patrick_achever: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Sur la tombe voisine, il y a un vase funéraire en granit, très lourd. Tu le soulèves à deux mains, au-dessus de la tête de Patrick.',
    choix: [
      {
        label: 'Frapper',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: 'Le premier coup fait un bruit de noix qu’on écrase. Le deuxième, un bruit mouillé. Au troisième, la housse ne bouge plus. Tu restes {penché|penchée} au-dessus, à écouter ton cœur cogner trop vite.\n\nSur le bracelet jaune de Patrick, il est écrit : URG — P3. Patient numéro 3.\n\nToi, tu es le numéro 4.',
          effets: { flag: 'patrick_acheve', xp: { force: 10 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Le vase glisse sur le plastique et rebondit sur son épaule. Sa main jaillit de la housse et t’attrape le poignet. Ses ongles t’entaillent la peau. Tu frappes une deuxième fois, puis une troisième, jusqu’à ce que la main lâche.\n\nSur le bracelet jaune de Patrick, il est écrit : URG — P3. Patient numéro 3.\n\nToi, tu es le numéro 4.',
          effets: { flag: 'patrick_acheve', blessure: { type: 'egratignure', zone: 'à la main' }, xp: { force: 4 } },
          suivant: '#fin',
        },
      },
    ],
  },

  pro_patrick_part: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Tu t’éloignes. Derrière toi, la housse continue de parler : de tes pas, de sa faim, d’une rue dont il ne se souvient plus. Puis elle se tait.\n\nEt elle se met à gratter.',
    choix: [{ label: 'Continuer', effets: { flag: 'patrick_laisse' }, suivant: '#fin' }],
  },

  // Marqueur 'conteneur_frigo' (esplanade) : la morgue provisoire.
  pro_conteneur: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'Sur l’esplanade, deux conteneurs frigorifiques blancs, comme ceux des camions de fruits et légumes, sont garés de travers. On s’en est servi de morgue. Entre les deux, le groupe électrogène qui les refroidissait est éteint. Il fait chaud, et ça sent la mort.\n\nSur la porte du premier conteneur, un porte-bloc pend au bout d’une ficelle.\n\nDerrière la porte, quelqu’un frappe. Des petits coups réguliers, sans force, comme si on avait oublié pourquoi on frappe.',
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
    texte: 'C’est le registre des corps. « LOT 14 — 212 CORPS. » Ton lot. Les lots 11, 12 et 13 ont été brûlés, un par jour. Le lot 14 devait suivre.\n\nLe groupe électrogène a reçu son dernier plein le 13 septembre. Plus bas, quelqu’un a écrit : « PASSAGE DU 16 : ANNULÉ ». Puis plus rien.\n\nPersonne n’est revenu brûler le lot 14. C’est pour ça que tu es encore là.',
    choix: [{ label: 'Reculer', suivant: '#fin' }],
  },

  pro_conteneur_barre: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu poses la main sur la barre qui ferme la porte.\n\nÀ l’intérieur, les coups s’arrêtent. Tous en même temps.\n\nTu retires ta main, très lentement. Pendant une longue minute, plus rien. Puis, doucement, les coups reprennent.',
    choix: [{ label: 'Laisser la porte fermée', suivant: '#fin' }],
  },

  // Marqueur 'loge_gardien' (bureau de la loge, près de la grille) : le plan de Salon, et derrière lui, la clé.
  // Mise en scène : le crochet GRILLE PRINCIPALE du tableau est vide (le sergent a emporté la clé). Le gardien a
  // caché le DOUBLE sur un clou, derrière le plan de Salon punaisé au mur, au-dessus du bureau. Un mort DORT dans
  // le fauteuil, tourné vers ce plan. Tous les chemins passent par le plan : on ne peut pas avoir la clé sans lui.
  pro_loge: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La loge du gardien sent le café froid, le tabac et la pisse de chat. Une seule pièce : un lit étroit, un coin cuisine, un bureau poussé sous la fenêtre.\n\nPrès de la porte, un tableau de clés. Les clés des chapelles pendent à leurs crochets, chacune avec son étiquette. Un seul crochet est vide, le plus gros. Son étiquette dit : GRILLE PRINCIPALE.\n\nDevant le bureau, un homme est assis dans un fauteuil, de dos. Sa tête penche sur son épaule. Il ne respire pas. C’est un mort, mais il dort : tant que rien ne le réveille, il ne bougera pas.\n\nIl est tourné vers le mur, au-dessus du bureau, comme s’il regardait encore ce qui y est punaisé : un grand plan de Salon-de-Provence, couvert de notes au stylo. Sur le bureau, à portée de sa main, un cahier est ouvert.',
    choix: [
      { label: 'Lire le cahier ouvert', effets: { document: 'doc_cahier_gardien' }, suivant: 'pro_loge_2' },
      { label: 'Décrocher le plan de Salon', si: { pasFlag: 'pro_plan_pris' }, suivant: 'pro_loge_plan' },
      // (scène interrompue puis rejouée : le plan est déjà pris, la clé attend sur son clou)
      { label: 'Prendre la clé, sur le clou derrière le plan', si: { flag: 'pro_plan_pris' }, suivant: 'pro_loge_cle' },
    ],
  },

  pro_loge_2: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La dernière ligne du cahier date d’avant-hier : « Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas. »\n\nLa chapelle des Roux-Bérenger, c’est le caveau où tu t’es {réveillé|réveillée}. Le gardien t’a {entendu|entendue} bouger, et il a eu peur.\n\nQuelques lignes plus haut, il raconte que les soldats sont partis avec la clé de la grille, et qu’il leur a caché le double. Il n’écrit pas où.\n\nDans le fauteuil, la tête du mort glisse un peu plus sur son épaule.',
    choix: [
      { label: 'Chercher le double sans réveiller le mort', suivant: 'pro_loge_fouille' },
      { label: 'Décrocher le plan de Salon', suivant: 'pro_loge_plan' },
    ],
  },

  pro_loge_fouille: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Tu cherches sans un bruit. Le tiroir du bureau s’ouvre contre les genoux du mort, centimètre par centimètre : des factures, des pastilles Valda, un briquet vide. Pas de clé. Sous l’oreiller du lit, rien. Dans la veste pendue derrière la porte, rien.\n\nLes soldats voulaient toutes les clés. S’ils avaient fouillé la loge, ils auraient regardé dans les tiroirs et dans les poches. Pas sur le mur, sous les yeux de tout le monde.\n\nTu relèves les yeux vers le plan de Salon.',
    choix: [{ label: 'Décrocher le plan de Salon', suivant: 'pro_loge_plan' }],
  },

  pro_loge_plan: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'Le plan est punaisé au mur, juste au-dessus de la tête du mort. Pour l’atteindre, tu dois te pencher par-dessus le fauteuil, le ventre contre le dossier, le visage à quelques centimètres de sa nuque grise. Il sent le tabac froid et la viande tournée.\n\nC’est un plan du centre-ville, celui que donne l’office de tourisme, en papier glacé. Quatre punaises le tiennent. Les monuments sont numérotés. Tout en bas, sur le cimetière Saint-Roch, le gardien a dessiné une croix au stylo.\n\nDans le coin inférieur droit, le papier fait une bosse. Petite et allongée, comme si quelque chose était accroché au mur, derrière le plan.',
    choix: [
      {
        label: 'Retirer les punaises sans faire de bruit',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu retires les punaises une à une, du bout des ongles, et tu les gardes dans ta paume. Le papier se décolle du mur avec un petit froissement. Tu le roules contre ta poitrine.\n\nDerrière, le mur est plus clair : un rectangle propre au milieu du plâtre jauni par la fumée. Dans le coin, un clou. Et sur le clou, une grosse clé de laiton.',
          effets: { objet: ['plan_salon', 1], flag: 'pro_plan_pris', document: 'doc_plan_salon', xp: { agilite: 8 } },
          suivant: 'pro_loge_cle',
        },
        echec: {
          texte: 'La dernière punaise résiste. Tu tires un peu trop fort. Le plan se décolle d’un coup, et quelque chose, derrière, s’arrache du mur avec lui : une grosse clé de laiton. Elle tombe sur le bureau avec un bruit de cloche, rebondit et roule par terre.\n\nDans le fauteuil, la tête se redresse.',
          effets: { objet: ['plan_salon', 1], flag: 'pro_plan_pris', document: 'doc_plan_salon', bruit: 2 },
          suivant: 'pro_loge_cle_vite',
        },
      },
    ],
  },

  pro_loge_cle: {
    illu: 'saint_roch_nuit', musique: 'sombre',
    texte: 'La clé est lourde, plus longue que ta main. Une étiquette en carton pend à l’anneau, écrite au stylo bille : DOUBLE GRILLE — NE PAS DONNER.\n\nLe gardien avait de quoi sortir. Il ne l’a jamais fait. Il est resté assis là, devant son plan, jusqu’à la fin.\n\nDans le fauteuil, rien ne bouge.',
    choix: [
      {
        label: 'Prendre la clé',
        effets: {
          objet: ['cle_grille_saint_roch', 1],
          flag: 'pro_cle_prise',
          journal: 'Dans la loge, le gardien est mort assis dans son fauteuil, face à un plan de Salon punaisé au mur. Derrière le plan, il avait caché le double de la clé de la grille. J’ai pris le plan et la clé.',
        },
        suivant: '#fin',
      },
    ],
  },

  pro_loge_cle_vite: {
    illu: 'saint_roch_nuit', musique: 'tension',
    texte: 'La clé est par terre, entre les pieds du fauteuil. Entre ses pantoufles.\n\nAu-dessus, les mains du mort se referment sur les accoudoirs. Il essaie de se lever.',
    choix: [
      {
        label: 'Ramasser la clé et reculer',
        effets: {
          objet: ['cle_grille_saint_roch', 1],
          flag: 'pro_cle_prise',
          journal: 'Dans la loge, le gardien était mort dans son fauteuil, face à un plan de Salon punaisé au mur. Derrière le plan, il avait caché le double de la clé de la grille. J’ai pris le plan et la clé. Je l’ai réveillé.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'grille_sortie' (grille principale, boulevard du Roi-René). Rejouable tant que la grille est fermée.
  // On ne passe pas par-dessus : pointes de lance + barbelé à lames posé par l'armée. Seule la clé ouvre.
  pro_grille: {
    illu: 'saint_roch_nuit', musique: null,
    texte: 'La grille principale donne sur le boulevard du Roi-René. Deux battants de fer forgé, deux fois plus hauts que toi, terminés par des pointes de lance. Ils sont fermés à clé.\n\nAu-dessus des pointes, l’armée a déroulé du barbelé à lames, celui des clôtures de prison, qui coupe comme un rasoir. Le même barbelé court sur tout le mur d’enceinte. Un panneau rouge est attaché aux barreaux : ZONE D’EXCLUSION SANITAIRE — ACCÈS INTERDIT. Les soldats ont fermé le cimetière pour que rien n’en sorte. Ni les morts du lot 14, ni personne. Passer par-dessus, ce serait s’ouvrir les mains et le ventre.\n\nSur le pilier, une plaque émaillée : CIMETIÈRE SAINT-ROCH — OUVERT DE 7 H 30 À 19 H — FERMETURE DES PORTES PAR LE GARDIEN.\n\nDe l’autre côté : les platanes, des voitures abandonnées, et la ville qui descend vers le centre. Au-dessus des toits, tu vois la Tour de l’Horloge et sa cage de fer noire, où sont les cloches. C’est là que le mot de « M. » te dit d’aller. Elle n’a pas l’air loin.',
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
    texte: 'Tu prends les barreaux à deux mains et tu tires de toutes tes forces. La serrure tient. Les gonds aussi. Le fer gronde et résonne sur tout le boulevard, et le barbelé tinte au-dessus de ta tête.\n\nCette grille ne s’ouvrira qu’avec sa clé. Quelqu’un l’ouvrait chaque matin et la fermait chaque soir. Quelqu’un qui vivait ici.\n\nDerrière toi, entre les tombes, quelque chose a entendu.',
    choix: [{ label: 'Reculer dans l’ombre', suivant: '#fin' }],
  },

  // ─────────────────────────── LA TOUR ───────────────────────────
  // Déclencheur : entrée dans 'tour_horloge' (si pro_note_lue, pas encore pro_cloches_faites).
  pro_horloge: {
    illu: 'place_crousillat_nuit', musique: null,
    texte: 'Te voici sur la place Crousillat.\n\nAu milieu, la Fontaine Moussue : un gros champignon de pierre couvert de mousse verte, qui crache son eau dans un bassin. Le bruit de l’eau est le seul bruit. Autour, les terrasses des cafés sont à l’abandon : chaises renversées, un parasol cassé. Toutes les fenêtres sont noires.\n\nAu bout de la place se dresse la Tour de l’Horloge : trois étages de pierre blonde et, tout en haut, une cage de fer où pendent les cloches.\n\nLe cadran indique neuf heures dix. Tu le regardes longtemps. L’aiguille ne bouge pas : l’horloge est arrêtée.\n\nLe mot de « M. » disait : allume une lumière au pied de la tour et lève-la vers les cloches.',
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
    texte: 'Au pied de la tour, il y a une petite porte en chêne. Tu frappes. Le bruit résonne sur toute la place.\n\nRien. Puis, tout en haut, entre les cloches, une lumière s’allume, s’éteint, se rallume.\n\nQuelqu’un, là-haut, t’a {vu|vue}.',
    choix: [{ label: 'Lever les yeux vers les cloches', effets: { flag: 'pro_signal', cinematique: 'pro_cloches' }, suivant: 'pro_cloches' }],
  },

  pro_cloches: {
    illu: 'place_crousillat_nuit', musique: 'tension',
    texte: 'Les cloches sonnent, et les morts arrivent. Ils sortent de partout : des rues, des porches, des terrasses. Des dizaines. Ils marchent vers la tour, le visage levé vers les cloches.\n\nEt toi aussi, tu avances.\n\nTes pieds ont fait trois pas vers eux sans que tu le décides. Ta bouche se remplit de salive. Tu avales, et elle revient aussitôt, comme devant la vitrine d’une boulangerie. À chaque coup de cloche, la faim te tire vers le bruit.\n\nAu pied de la tour, la petite porte s’entrouvre. Une main en sort et te fait signe : viens, vite.\n\nDécide maintenant.',
    timerMs: 9000,
    timeout: {
      texte: 'Tu as trop attendu. Ou plutôt, tu n’attendais pas : tu avançais vers les cloches. Quand tu reprends le contrôle de tes jambes, tu es au bord du bassin, au milieu des morts. L’un d’eux vient de sentir que tu n’es pas comme lui. Il se jette sur toi.',
      effets: { flag: 'pro_suivi_cloches', combat: { zombies: ['coureur'] } },
      suivant: 'pro_cloches_porte',
    },
    choix: [
      {
        label: 'Courir jusqu’à la porte de la tour',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu traverses la place en courant, entre les dos et les épaules. Des mains se lèvent, trop tard. Personne ne te suit. Ils ne regardent que les cloches.',
          effets: { xp: { agilite: 8 } },
          suivant: 'pro_cloches_porte',
        },
        echec: {
          texte: 'Au passage, une main t’attrape la manche et tire. Des ongles griffent ton avant-bras, un souffle froid passe sur ta nuque. Tu arraches ton bras et tu cours jusqu’à la porte.',
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
    texte: 'Tu ne cours pas. Tu marches à leur rythme, la tête levée comme eux, au milieu d’eux. Leurs épaules frôlent les tiennes. Une morte en robe de chambre approche son nez de ton cou et te renifle longuement. Puis elle se détourne vers les cloches, comme si tu n’étais pas à son goût.\n\nTu ne comprendras que plus tard pourquoi elle t’a laissé passer.',
    choix: [{ label: 'Atteindre la porte', effets: { flag: 'pro_marche_parmi_eux' }, suivant: 'pro_cloches_porte' }],
  },

  pro_cloches_porte: {
    illu: 'place_crousillat_nuit', musique: 'sombre',
    texte: 'Tu entres dans la tour. La porte claque derrière toi. Il fait noir, ça sent la pierre froide et la fiente de pigeon. Des coups frappent contre le bois — trois, quatre — puis s’arrêtent : là-haut, les cloches sonnent encore, et elles les intéressent plus que toi.\n\nIl n’y a personne en bas. Seulement un escalier de pierre qui monte en tournant. Sur la première marche, un morceau de sparadrap porte un mot écrit au stylo : MONTE.',
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
    texte: 'Tu arrives dans la salle de l’horloge. Une cage de fer peinte en vert, des roues dentées grandes comme des roues de charrette, des poids suspendus à des câbles. Tout est immobile. Contre le mur, tu vois le cadran de l’intérieur : les chiffres à l’envers, les aiguilles de dos.\n\nNeuf heures dix.\n\nSur une poutre, une plaque pour les visiteurs, rongée par la rouille. Quelqu’un a écrit dessous, au feutre.',
    choix: [{ label: 'Lire la plaque', effets: { document: 'doc_plaque_1909' }, suivant: '#fin' }],
  },

  // Marqueur 'sommet_maud' (terrasse sous la cage des cloches) : Maud.
  pro_maud: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'La femme',
    texte: 'Tout en haut de la tour, sous la cage des cloches, le vent souffle. Les trois cloches se balancent encore, de moins en moins. Chaque fois qu’elles tintent, ta bouche se remplit de salive.\n\nUne femme est assise sur la dernière marche, le dos contre un pilier. Elle a peut-être cinquante-cinq ans, l’air de quelqu’un qui n’a pas dormi depuis longtemps. Une blouse de médecin sous un anorak rouge, un stéthoscope autour du cou. Des jumelles dans une main, une cigarette éteinte dans l’autre.\n\nC’est sans doute « M. », celle qui t’a laissé le mot.\n\nElle ne se lève pas. Elle braque une petite lampe sur ton visage, puis dans tes yeux, l’un après l’autre.\n\n« Suis la lumière. Non, avec les yeux, pas avec la tête. » Elle éteint. « Bien. Donne-moi ton bras gauche. »',
    choix: [
      { label: 'Tendre le bras', suivant: 'pro_maud_bras' },
      { label: '« Qui êtes-vous ? »', suivant: 'pro_maud_qui' },
    ],
  },

  pro_maud_qui: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Maud Sérane. Cheffe des urgences de l’hôpital de Salon. C’est moi qui t’ai écrit. » Elle tire sur sa cigarette éteinte, par habitude. « Il n’y a plus d’hôpital, et plus d’urgences. Il ne reste que la cheffe. Ton bras. »',
    choix: [{ label: 'Tendre le bras', suivant: 'pro_maud_bras' }],
  },

  pro_maud_bras: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Elle remonte ta manche. Sur ton avant-bras gauche, là où tu n’avais pas osé regarder, il y a une morsure : la marque d’une mâchoire humaine, profonde, refermée. La peau a cicatrisé en bourrelets roses et luisants. Ça ne fait pas mal. Ça devrait.\n\nMaud passe le pouce dessus, doucement, comme sur la joue d’un enfant.\n\n« Dix-sept jours », dit-elle. Puis, plus bas, pour elle-même : « Tu parles. Tu es {venu|venue} jusqu’à moi. Tu me regardes. »\n\nSa voix se brise. Elle allume enfin sa cigarette, à la troisième allumette, les mains tremblantes.',
    choix: [
      { label: '« Qu’est-ce qui m’est arrivé ? »', suivant: 'pro_maud_verite' },
    ],
  },

  pro_maud_verite: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Le 6 septembre, un mort t’a mordu le bras. Le soir même, ton cœur s’est arrêté. » Elle le dit comme on lit un dossier médical. « Ensuite, ton corps s’est relevé, comme les leurs, et il a marché avec eux. Pendant deux jours. Tu revenais chaque jour devant la porte du château de l’Empéri. Ils retournent tous quelque part. Le 8, je t’ai {attrapé|attrapée} avec une perche de fourrière, un lasso au bout d’un bâton, en haut de la montée du Puech. »\n\nElle te laisse le temps d’encaisser. Elle a l’habitude d’annoncer les mauvaises nouvelles.\n\n« Ensuite, je t’ai {soigné|soignée}. Puis l’armée a vidé l’hôpital. Les soldats t’ont {mis|mise} dans une housse, parce que tu avais l’air d’un cadavre. Tu en étais un. Et ce soir, te voilà debout. »',
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
    texte: 'Maud ferme les yeux une seconde.\n\n« Patrick Veyrier. Cinquante-deux ans. Chauffeur de car scolaire, sur la ligne de Pélissanne. » Elle rouvre les yeux. « Certains reviennent bien, comme toi. D’autres reviennent mal. Lui, il est revenu mal : quelques minutes de lucidité, puis plus rien que la faim. »\n\nElle écrase sa cigarette sur la pierre, très soigneusement, jusqu’à ce qu’il n’en reste rien.',
    choix: [{ label: '« Et moi, pourquoi est-ce que je respire ? »', suivant: 'pro_maud_pourquoi' }],
  },

  pro_maud_pourquoi: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: '« Tu respires parce que ton cœur bat. Et ton cœur bat parce que la maladie, dans ton sang, s’est endormie. » Elle hausse les épaules. « Pourquoi chez toi, et pas chez les quatre cent mille autres, entre la Durance et la mer… »\n\nElle ne finit pas sa phrase. Elle regarde au loin, vers le château de l’Empéri, sombre sur son rocher.\n\n« Ce que je sais, c’est que tu n’es pas le seul cas. Et que si quelqu’un l’apprend avant que j’aie une preuve, on te met une balle dans la tête, et moi à côté. Les vivants n’aiment pas qu’on leur rende leurs morts. »',
    choix: [{ label: '« Et maintenant ? »', suivant: 'pro_maud_fin' }],
  },

  pro_maud_fin: {
    illu: 'horloge_sommet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud se lève avec peine, une main dans le dos.\n\n« Maintenant, on descend par l’autre escalier, on longe le mur jusqu’à la maison de Nostradamus, et tu dors. C’est là que je me cache. Nostradamus soignait la peste : le lieu est bien choisi. » Elle reprend ses jumelles et regarde la place, en bas. La foule des morts est toujours là, immobile, le visage levé vers les cloches qui se sont tues. « Demain, je t’expliquerai pourquoi l’armée attend le vent. »\n\nElle te regarde une dernière fois, longuement. Il te faudra des jours pour comprendre ce qu’il y a dans ce regard. Pas de la tendresse. De la fierté : celle d’un artisan devant une pièce réussie.\n\n« Bienvenue parmi les vivants. N’en parle à personne. »',
    choix: [
      { label: 'Regarder la place en bas', effets: { cinematique: 'pro_sommet' }, suivant: 'pro_fin' },
    ],
  },

  pro_fin: {
    illu: 'nostradamus_cabinet', musique: 'calme',
    texte: 'Tu dors dans la maison de Nostradamus, devenue un musée. La pièce est basse et sent l’encens et la poussière. À côté de toi, un vieil instrument d’astronomie et un mannequin de cire habillé en médecin d’il y a cinq siècles. Maud a fermé la porte à clé, de l’extérieur. Tu l’entends tousser longtemps dans l’escalier.\n\nTu n’as pas peur du noir. C’est la première chose que tu remarques. Le noir, tu y étais encore ce matin.\n\nLa deuxième chose, c’est que tu as toujours faim.',
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
