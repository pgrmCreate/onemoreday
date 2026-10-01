// ============ Scènes des rencontres de voyage SCÉNARISÉES (voir rencontres.js) ============
// Préfixe 'rc_'. Chaque rencontre de rencontres.js pointe vers l'une de ces scènes.

export const SCENES_RENCONTRES = {

  // ─────────── Prologue : cimetière → Tour de l'Horloge ───────────
  rc_pro_marche: {
    illu: 'cours_nuit', musique: 'tension',
    texte: 'Sur le cours Carnot, le grand marché du mercredi est toujours là.\n\nDepuis trois semaines, personne n’a replié les étals. Les bâches rayées pendent. Les cageots débordent d’une bouillie noire qui était des pêches, des tomates, des figues. Les mouches bourdonnent comme un moteur. Sur l’étal du fromager, sous la cloche en plastique, le fromage a fondu puis durci, vert et blanc, comme un poumon.\n\nEt entre les étals, des morts attendent.\n\nUne dizaine. Debout, tournés vers les marchandises, immobiles, comme des clients qui patientent. Une femme tient encore son cabas à roulettes. Un homme a la main tendue au-dessus des melons, figé au moment de choisir.\n\nAucune tête ne s’est tournée vers toi. Pas encore.',
    choix: [
      {
        label: 'Traverser le marché entre les étals (plus court)',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu passes entre deux étals, {courbé|courbée}, sous les bâches. Au passage, tu ramasses ce qui se mange encore sur le stand d’un confiseur : des sachets de bonbons sous cellophane, intacts. Aucun mort ne se retourne.',
          effets: { objets: [['barre_cereales', 2], ['chocolat', 1]], xp: { agilite: 8 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Ton pied accroche un cageot. Il bascule. Les pêches pourries éclatent sur le bitume. Dix têtes se tournent vers toi d’un coup. Tu cours. Tu cours jusqu’à ce que le marché soit loin et que tes poumons brûlent.',
          effets: { sta: -25, tempsMin: 10 },
          suivant: '#fin',
        },
      },
      { label: 'Contourner par les ruelles (plus long)', effets: { tempsMin: 8, detour: 220 }, suivant: '#fin' },
      { label: 'Les observer un moment', suivant: 'rc_pro_marche_regarder' },
    ],
  },
  rc_pro_marche_regarder: {
    illu: 'cours_nuit', musique: 'sombre',
    texte: 'Tu restes dans l’ombre d’un platane, et tu observes.\n\nIls ne mangent pas les fruits pourris. Ils ne cherchent rien. Ils attendent, chacun devant son étal, à l’endroit exact où ils se trouvaient le mercredi 2 septembre à dix heures quarante, quand tout a commencé.\n\nIls attendent d’être servis.\n\nTu ne le comprendras que plus tard : tous les morts font ça. Ils reviennent à un endroit qui comptait pour eux. Toi aussi, tu revenais quelque part.',
    choix: [{ label: 'Contourner par les ruelles', effets: { tempsMin: 10, detour: 220, flag: 'vu_marche_mort' }, suivant: '#fin' }],
  },

  rc_pro_premier: {
    illu: 'cours_nuit', musique: 'combat',
    texte: 'Devant le Tabac du Fontenoy, il y a un serveur.\n\nTablier noir noué deux fois autour de la taille, un plateau vide encore à la main. Il est debout au milieu de la rue et tourne lentement sur lui-même, comme s’il cherchait la table qui l’a appelé.\n\nPuis il te voit.\n\nLe plateau tombe et résonne sur le bitume comme un gong. Le serveur vient vers toi en traînant une jambe, la bouche grande ouverte, avec une avidité terrible : celle de quelqu’un qui a enfin trouvé son client.\n\nIl est mort, et il veut te mordre. Il faut te défendre.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['errant'], tutoriel: true } }, suivant: 'rc_pro_premier_apres' },
    ],
  },
  rc_pro_premier_apres: {
    illu: 'cours_nuit', musique: 'sombre',
    texte: 'Quand tu t’arrêtes enfin, tu es à bout de souffle et tu as le goût du fer dans la bouche.\n\nLe badge du serveur a roulé jusqu’au caniveau : « JÉRÉMY — À VOTRE SERVICE ».\n\nTu t’aperçois que ta bouche est pleine de salive. Tu craches. Tu craches encore. Tu te dis que c’est la peur.',
    choix: [{ label: 'Repartir vers la Tour de l’Horloge', effets: { flag: 'premier_combat_fait', journal: 'Premier combat, devant le Tabac du Fontenoy, contre un serveur mort. Après, j’avais la bouche pleine de salive.' }, suivant: '#fin' }],
  },

  // ─────────── Chapitre 1 ───────────
  rc_ch1_hautparleur: {
    illu: 'cours_nuit', musique: 'tension',
    texte: 'Un bourdonnement d’insecte géant passe au-dessus des toits. Tu lèves la tête.\n\nUn drone militaire, gris, gros comme une table, survole lentement le cours à cinquante mètres de haut. Sous son ventre, un haut-parleur répète, avec une voix de femme enregistrée, calme et maternelle :\n\n« Zone d’exclusion sanitaire. Restez chez vous. N’essayez pas de rejoindre la Durance. Toute personne qui s’approchera de la ligne sera abattue. Zone d’exclusion sanitaire… »\n\nDans toutes les rues autour, des morts lèvent la tête. Et ils se mettent à suivre le bruit.',
    choix: [
      { label: 'T’abriter sous un porche et laisser passer les morts', effets: { tempsMin: 15 }, suivant: '#fin' },
      { label: 'Filer pendant qu’ils suivent le drone', effets: { sta: -10 }, suivant: '#fin' },
    ],
  },

  rc_ch1_ambulance: {
    illu: 'hopital_parvis', musique: 'sombre',
    texte: 'Avenue Julien-Fabre, une ambulance du SAMU est garée de travers sur le trottoir, gyrophares éteints, portes arrière ouvertes.\n\nÀ l’arrière, un ambulancier mort, en tenue jaune fluo, est attaché sur le brancard. Il tourne la tête vers toi et tire sur ses sangles, poliment, sans insister. Par terre, il y a une longue perche d’aluminium terminée par un nœud coulant en câble : une perche de fourrière, celle qui sert à attraper les chiens.\n\nSur le tableau de bord, une liste écrite au feutre est scotchée : P1, P2, P3, P4, P5. Les patients de Maud. Quatre noms sont barrés. En face de P4, une adresse : « Montée du Puech — porte du château — 17 h tous les jours ».\n\nP4, c’était toi. Après ta mort, tu revenais chaque jour à 17 h devant la porte du château. C’est avec cette perche que Maud t’a {attrapé|attrapée}.',
    choix: [
      { label: 'Prendre la perche', effets: { objet: ['perche_fourriere', 1], flag: 'ambulance_vue' }, suivant: '#fin' },
      { label: 'Refermer les portes et continuer', effets: { flag: 'ambulance_vue' }, suivant: '#fin' },
    ],
  },

  rc_ch1_cours: {
    illu: 'cours_troupeau', musique: 'combat',
    texte: 'Tu coupes par la rue de l’Horloge. Trop tard : la marée des morts est déjà au bout de la rue, et elle monte vers toi.\n\nEn tête, une silhouette s’est arrêtée au carrefour. Une jeune femme en tenue militaire déchirée, avec une clochette de berger en laiton pendue au cou par une lanière de cuir. Elle tient une lampe torche dans une main et un bâton de berger dans l’autre. Elle balaie la rue avec sa lampe. Le faisceau passe sur toi.\n\nElle s’arrête. Elle te regarde. Pas comme les morts regardent : comme une personne vivante.\n\nElle pose un doigt sur ses lèvres. Chut. Et elle sourit.\n\nPuis elle fait tinter sa cloche deux fois. Derrière elle, la marée des morts tourne à gauche, vers la place des Centuries, et te laisse passer.',
    choix: [{ label: 'Passer', effets: { flag: 'revenue_croisee', journal: 'Rue de l’Horloge, une femme en tenue militaire menait les morts avec une cloche. Elle n’était pas comme eux. Elle m’a vu et m’a laissé passer, un doigt sur les lèvres.' }, suivant: '#fin' }],
  },

  // ─────────── Chapitre 2 ───────────
  rc_ch2_jean_moulin: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'À la sortie nord de Salon, sur le rond-point de la route d’Avignon, la statue de Jean Moulin lève les bras au ciel.\n\nSix mètres de bronze noir, le corps tendu vers le haut, les mains ouvertes, comme au moment où il a été parachuté dans la nuit du 1er janvier 1942, quelque part dans ces champs. Quelqu’un est monté là-haut et a noué un drap blanc à ses poignets. Le drap claque au vent. Dessus, écrit au goudron : « CALÈS → PAR LES COLLINES. PAS LA ROUTE. »\n\nLa route, justement, est piétinée sur toute sa largeur. Les bas-côtés sont écrasés, les glissières tordues. Des chaussures perdues. Une poussette. Le troupeau de morts est passé par là cette nuit.\n\nAu pied de la statue, sur le socle, il y a d’autres messages : à la craie, au rouge à lèvres, gravés au couteau.',
    choix: [
      { label: 'Lire les messages sur le socle', effets: { document: 'doc_socle_jean_moulin' }, suivant: '#fin' },
      { label: 'Passer par les collines', effets: { tempsMin: 20, detour: 400 }, suivant: '#fin' },
    ],
  },

  rc_ch2_troupeau_plaine: {
    illu: 'plaine_route', musique: 'sombre',
    texte: 'Du haut d’une terrasse de pierres sèches, entre deux oliviers, tu vois le troupeau en entier pour la première fois.\n\nIl recouvre la plaine entre la voie ferrée et le canal, comme une inondation. Des milliers de morts. Ils avancent au pas d’un homme fatigué, sans se disperser. Sur les côtés, des silhouettes droites trottent et ramènent les traînards à coups de bâton, en faisant tinter leurs cloches. Ce sont des revenus, comme toi. Il y a des chiens, aussi — ou ce qui a été des chiens.\n\nEn tête, la grande cloche sonne. Bong. Toutes les dix secondes.\n\nLe troupeau va vers le nord. Vers Lamanon et le pertuis, le seul passage entre les Alpilles et les collines. Vers les grottes de Calès.',
    choix: [
      { label: 'Observer le troupeau et l’estimer', effets: { tempsMin: 30, flag: 'troupeau_observe', journal: 'Le troupeau : peut-être dix mille morts, menés par des vivants — ou des revenus — qui portent des cloches. Il monte vers Lamanon et les grottes de Calès. Il y sera dans deux jours, trois au plus.' }, suivant: '#fin' },
      { label: 'Te dépêcher de repartir', suivant: '#fin' },
    ],
  },

  rc_ch2_revenus: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: 'Nadège',
    texte: 'Au bord du chemin, une femme en tenue militaire est assise sur une borne. Elle t’attend. Pas de lampe. Sa clochette est bourrée de chiffon pour ne pas sonner.\n\nC’est la femme de la rue de l’Horloge, celle qui menait les morts.\n\n« Nadège », dit-elle, en tendant une main froide. Aussi froide que la tienne. « Le Berger, celui qui mène le troupeau, voudrait te parler. Il est à Vieux-Vernègues, sur la colline, dans les ruines du vieux village. » Elle sourit. « Tu peux venir quand tu veux. Personne ne te fera de mal là-haut. Tu es des nôtres : un revenu, comme moi. Tu le sens, non ? Le froid. »\n\nElle se lève et remet son sac à l’épaule.\n\n« Viens avant que le mistral se lève. Après, on sera partis. »',
    choix: [
      {
        label: 'Promettre : « J’irai. »',
        effets: {
          flag: 'revenus_rencontres', decouvrir: ['vernegues'], quete: ['q_berger', 'debut'],
          journal: 'La femme à la cloche s’appelle Nadège. Elle est revenue, comme moi : elle dit que je suis « des leurs ». Le Berger m’attend à Vieux-Vernègues.',
        },
        suivant: '#fin',
      },
    ],
  },

  rc_ch2_lion: {
    illu: 'plaine_route', musique: 'tension',
    texte: 'Au milieu de la route départementale, en plein soleil, un lion mange un mort.\n\nUn vrai lion, maigre, la crinière pleine de bardanes. Il s’est échappé du zoo de La Barben quand plus personne n’est venu fermer les enclos. Il tient le cadavre entre ses pattes comme un chat tient une souris. Il arrache, il mâche, avec un bruit de branche mouillée.\n\nIl lève la tête. Il te regarde. Ses yeux sont jaunes et parfaitement vivants.\n\nLui, au moins, sait ce qu’il mange.',
    choix: [
      { label: 'Reculer lentement, sans lui tourner le dos', test: { skill: 'agilite', difficulte: 1 }, reussite: { texte: 'Il te suit des yeux jusqu’au virage, puis retourne à son repas. Il n’avait pas faim de toi. Pas aujourd’hui.', suivant: '#fin' }, echec: { texte: 'Tu trébuches sur le bas-côté. Le lion se lève et bondit vers toi.', effets: { combat: { zombies: ['fauve'] } }, suivant: '#fin' } },
      { label: 'Faire un large détour par les vergers', effets: { tempsMin: 25, detour: 600 }, suivant: '#fin' },
    ],
  },

  rc_ch2_avions: {
    illu: 'plaine_route', musique: 'tension',
    texte: 'Deux avions passent très haut. D’abord en silence ; puis le bruit arrive, en retard, énorme, et roule d’un bout à l’autre de la plaine de la Crau. Ils tournent au-dessus de Salon, au-dessus de la base. Ils prennent des photos.\n\nIls repèrent ce qu’il faudra brûler.',
    choix: [{ label: 'Continuer', suivant: '#fin' }],
  },

  // ─────────── Final : Calès → Mallemort ───────────
  rc_fin_colonne: {
    illu: 'crau_mistral', musique: 'combat', orateur: 'Fernand',
    texte: 'À mi-chemin du pont, sur la petite route bordée de platanes que le vent tord comme des roseaux, la colonne de Calès s’étire. Les vieux traînent. Les enfants pleurent de froid. Et derrière, de plus en plus fort, on entend la grande cloche du troupeau.\n\nLe vieux Fernand, de Lamanon — quatre-vingt-quatre ans, une hanche en titane —, s’arrête au bord de la route. Il s’assoit sur une borne et fait signe aux autres de continuer.\n\n« Je suis trop vieux et je vous ralentis. Allez. Allez, je vous dis ! »\n\nDerrière lui, sur la route, les premiers morts du troupeau apparaissent, avec leurs cloches.',
    choix: [
      {
        label: 'Porter Fernand sur ton dos',
        test: { skill: 'force', difficulte: 2 },
        reussite: { texte: 'Fernand pèse autant qu’un sac de ciment et jure comme un charretier pendant trois kilomètres. Tu ne le poses qu’au pont. Il t’embrasse sur les deux joues, sans rien dire.', effets: { sta: -45, flag: 'fernand_sauve', xp: { force: 15 } }, suivant: '#fin' },
        echec: { texte: 'Tes jambes lâchent au deuxième kilomètre. Deux enfants de l’Empéri reviennent en courant et le portent avec toi, à trois, en titubant. Vous arrivez au pont les derniers. Mais vous arrivez.', effets: { sta: -60, fatigue: -20, flag: 'fernand_sauve' }, suivant: '#fin' },
      },
      { label: 'Lui laisser ton arme et partir', effets: { flag: 'fernand_reste' }, suivant: 'rc_fin_fernand_reste' },
      { label: 'L’abandonner et continuer', effets: { flag: 'fernand_reste' }, suivant: 'rc_fin_fernand_reste' },
    ],
  },
  rc_fin_fernand_reste: {
    illu: 'crau_mistral', musique: 'sombre',
    texte: 'Fernand allume une cigarette, dos au vent, les mains en coupe. Il la tient comme les vieux, à l’envers, la braise au creux de la paume.\n\nQuand tu te retournes, au virage, il est toujours assis sur sa borne, face aux cloches. Il fume.',
    choix: [{ label: 'Ne plus te retourner', suivant: '#fin' }],
  },

  rc_fin_feu: {
    illu: 'ligne_de_feu', musique: 'combat',
    texte: 'Des avions passent au-dessus de toi, si bas que tu vois les rivets sous leurs ailes. Deux. Quatre. Ils arrivent du nord et filent vers le sud, vers la Crau, vers Salon. Au ras des collines, ils lâchent des chapelets de bombes incendiaires qui tombent en tournoyant.\n\nPuis, à l’horizon sud, là où se trouvent Salon, l’Empéri et la Tour de l’Horloge arrêtée sur neuf heures dix, le ciel devient orange.\n\nLe mistral se jette sur le feu comme un chien.\n\nCautère a commencé : l’armée brûle le pays.',
    choix: [{ label: 'Courir vers le pont', effets: { flag: 'cautere_commence', sta: -15 }, suivant: '#fin' }],
  },

  // ─────────── Rencontres « d'ambiance » de l'histoire (tirées au hasard) ───────────
  rc_tract: {
    illu: 'plaine_route', musique: null,
    texte: 'Il neige du papier. Un avion est passé trop haut pour qu’on l’entende, et des milliers de feuilles descendent en tourbillonnant sur les toits, sur les champs, sur les morts qui lèvent la tête pour les regarder tomber.\n\nTu en attrapes une au vol.',
    choix: [{ label: 'Lire la feuille', effets: { document: 'doc_tract_armee' }, suivant: '#fin' }],
  },

  rc_revenu_solitaire: {
    illu: 'plaine_route', musique: 'calme',
    texte: 'À la fontaine d’un hameau, un homme boit dans ses mains. Il porte une clochette au cou et un blouson de chantier. Il te voit et ne bouge pas.\n\n« T’inquiète, dit-il. Je suis comme toi. » Il s’essuie la bouche. « Je m’appelle Yanis. J’étais cariste à Clésud, la grande zone d’entrepôts. Je suis revenu il y a quatre jours. Je ne sais pas encore ce que je vais faire de ça. » D’un geste vague, il montre son propre corps. « Le Berger dit qu’on a une mission. Moi, je voudrais juste revoir ma mère. Elle habite aux Canourgues, à Salon. Tu crois qu’elle me reconnaîtrait ? »',
    choix: [
      { label: 'Le rassurer : « Oui. »', suivant: '#fin' },
      { label: 'L’en dissuader : « N’y va pas. »', suivant: '#fin' },
    ],
  },
};
