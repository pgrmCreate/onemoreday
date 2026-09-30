// ============ Scènes des rencontres de voyage SCÉNARISÉES (voir rencontres.js) ============
// Préfixe 'rc_'. Chaque rencontre de rencontres.js pointe vers l'une de ces scènes.

export const SCENES_RENCONTRES = {

  // ─────────── Prologue : cimetière → Tour de l'Horloge ───────────
  rc_pro_marche: {
    illu: 'cours_nuit', musique: 'tension',
    texte: 'Sur le cours Carnot, le marché est resté.\n\nTrois semaines que personne n’a replié les étals. Les bâches rayées pendent, les cageots débordent d’une bouillie noire où il y avait des pêches, des tomates, des figues. Les mouches font un bruit de moteur. Sur l’étal du fromager, sous la cloche de plastique, quelque chose a fondu puis repris, vert et blanc, comme un poumon.\n\nEt entre les étals, ils attendent.\n\nUne dizaine. Debout, tournés vers les marchandises, immobiles, comme des clients qui patientent. Une femme tient encore un cabas à roulettes. Un homme a la main tendue au-dessus des melons, figé au moment de choisir.\n\nAucune tête ne s’est tournée vers toi. Pas encore.',
    choix: [
      {
        label: 'Traverser entre les étals (plus court)',
        test: { skill: 'agilite', difficulte: 1 },
        reussite: {
          texte: 'Tu passes entre deux étals, {courbé|courbée}, sous les bâches. Au passage, ta main ramasse ce qu’il y a de mangeable sur le stand d’un confiseur : des sachets sous cellophane, intacts. Personne ne se retourne.',
          effets: { objets: [['barre_cereales', 2], ['chocolat', 1]], xp: { agilite: 8 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Ton pied accroche un cageot. Il bascule, les pêches pourries éclatent sur le bitume comme des bouches. Dix têtes pivotent. Tu cours. Tu cours jusqu’à ce que le cours soit loin et que tes poumons brûlent.',
          effets: { sta: -25, tempsMin: 10 },
          suivant: '#fin',
        },
      },
      { label: 'Contourner par les ruelles (plus long)', effets: { tempsMin: 8, detour: 220 }, suivant: '#fin' },
      { label: 'Les regarder un moment', suivant: 'rc_pro_marche_regarder' },
    ],
  },
  rc_pro_marche_regarder: {
    illu: 'cours_nuit', musique: 'sombre',
    texte: 'Tu restes dans l’ombre d’un platane, et tu regardes.\n\nIls ne mangent pas les fruits pourris. Ils ne cherchent rien. Ils attendent, simplement, chacun devant son étal, à la place exacte où ils étaient le mercredi 2 septembre à dix heures quarante.\n\nIls attendent d’être servis.\n\nTu ne sauras que plus tard que c’est ce qu’ils font tous : ils reviennent quelque part. Toi aussi, tu revenais quelque part.',
    choix: [{ label: 'Contourner par les ruelles', effets: { tempsMin: 10, detour: 220, flag: 'vu_marche_mort' }, suivant: '#fin' }],
  },

  rc_pro_premier: {
    illu: 'cours_nuit', musique: 'combat',
    texte: 'Devant le Tabac du Fontenoy, un serveur.\n\nTablier noir noué deux fois autour de la taille, un plateau encore à la main, vide. Il est debout au milieu de la chaussée et il tourne sur lui-même, lentement, comme s’il cherchait la table qui l’a appelé.\n\nPuis il te voit.\n\nLe plateau tombe et sonne sur le bitume comme un gong. Le serveur vient vers toi en traînant une jambe, la bouche grande ouverte, avec une application terrible : celle de quelqu’un qui a enfin trouvé son client.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['errant'], tutoriel: true } }, suivant: 'rc_pro_premier_apres' },
    ],
  },
  rc_pro_premier_apres: {
    illu: 'cours_nuit', musique: 'sombre',
    texte: 'Quand tu t’arrêtes enfin, tu as le souffle d’un coureur de fond et le goût du fer dans la bouche.\n\nLe badge du serveur a roulé jusqu’au caniveau : JÉRÉMY — À VOTRE SERVICE.\n\nTu t’aperçois que tu as la bouche pleine de salive. Tu craches. Tu craches encore. Tu te dis que c’est la peur.',
    choix: [{ label: 'Repartir vers l’Horloge', effets: { flag: 'premier_combat_fait', journal: 'Premier combat, devant le Tabac du Fontenoy. Un serveur. Après, j’avais la bouche pleine de salive.' }, suivant: '#fin' }],
  },

  // ─────────── Chapitre 1 ───────────
  rc_ch1_hautparleur: {
    illu: 'cours_nuit', musique: 'tension',
    texte: 'Un bourdonnement d’insecte géant, au-dessus des toits. Tu lèves la tête.\n\nUn drone militaire, gris, gros comme une table, passe lentement au-dessus du cours à cinquante mètres de haut. Sous son ventre, un haut-parleur. Il répète, d’une voix de femme enregistrée, calme, maternelle :\n\n« Zone d’exclusion sanitaire. Restez confinés. Ne cherchez pas à rejoindre la Durance. Toute approche de la ligne sera neutralisée. Zone d’exclusion sanitaire… »\n\nDans toutes les rues autour, des têtes se lèvent. Et commencent à le suivre.',
    choix: [
      { label: 'Laisser passer le cortège, à l’abri d’un porche', effets: { tempsMin: 15 }, suivant: '#fin' },
      { label: 'Profiter qu’ils le suivent pour filer', effets: { sta: -10 }, suivant: '#fin' },
    ],
  },

  rc_ch1_ambulance: {
    illu: 'hopital_parvis', musique: 'sombre',
    texte: 'Avenue Julien-Fabre, une ambulance du SAMU est garée de travers sur le trottoir, gyrophares éteints, portes arrière ouvertes.\n\nÀ l’arrière, sanglé sur le brancard, un ambulancier mort dans sa tenue jaune fluo. Il tourne la tête vers toi et tire sur ses sangles, poliment, sans insister. Au plancher, une longue perche d’aluminium terminée par un nœud coulant de câble gainé : une perche de fourrière, pour attraper les chiens.\n\nSur le tableau de bord, collée au scotch, une liste au feutre : P1, P2, P3, P4, P5. Quatre sont barrés. En face de P4, une adresse : « Montée du Puech — porte du château — 17 h tous les jours ».\n\nC’est avec ça qu’elle t’a attrapé.',
    choix: [
      { label: 'Prendre la perche', effets: { objet: ['perche_fourriere', 1], flag: 'ambulance_vue' }, suivant: '#fin' },
      { label: 'Refermer les portes et continuer', effets: { flag: 'ambulance_vue' }, suivant: '#fin' },
    ],
  },

  rc_ch1_cours: {
    illu: 'cours_troupeau', musique: 'combat',
    texte: 'Tu coupes par la rue de l’Horloge. Trop tard : la marée est déjà là, au bout de la rue, et elle monte.\n\nUne des silhouettes de tête s’est arrêtée au carrefour. Une femme, jeune, en treillis déchiré, une sonnaille de laiton pendue au cou par une lanière de cuir, une lampe torche dans une main et une houlette de berger dans l’autre. Elle balaie la rue avec sa lampe. Le faisceau passe sur toi.\n\nElle s’arrête. Elle te regarde. Pas comme ils regardent : comme une personne.\n\nElle porte un doigt à ses lèvres. Chut. Et elle sourit.\n\nPuis elle fait tinter sa cloche, deux fois, et la marée derrière elle tourne à gauche, vers la place des Centuries, et te laisse le passage.',
    choix: [{ label: 'Passer', effets: { flag: 'revenue_croisee', journal: 'Dans la rue de l’Horloge, une femme en treillis menait les morts avec une cloche. Elle m’a vu. Elle m’a laissé passer, un doigt sur les lèvres.' }, suivant: '#fin' }],
  },

  // ─────────── Chapitre 2 ───────────
  rc_ch2_jean_moulin: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'À la sortie nord de Salon, sur le rond-point de la route d’Avignon, Jean Moulin lève les bras au ciel.\n\nSix mètres de bronze noir, le corps tendu vers le haut, les mains ouvertes, comme au moment où le parachute l’a lâché dans la nuit du 1er janvier 1942, quelque part dans ces champs. Quelqu’un est monté là-haut. Quelqu’un a noué un drap blanc à ses poignets, et le drap claque, et dessus, au goudron : CALÈS → PAR LES COLLINES. PAS LA ROUTE.\n\nLa route, justement. Elle est piétinée sur toute sa largeur, les bas-côtés écrasés, les glissières tordues. Des chaussures perdues. Une poussette. Le troupeau est passé par là cette nuit.\n\nAu pied de la statue, sur le socle, d’autres messages : à la craie, au rouge à lèvres, au couteau.',
    choix: [
      { label: 'Lire les messages du socle', effets: { document: 'doc_socle_jean_moulin' }, suivant: '#fin' },
      { label: 'Prendre par les collines', effets: { tempsMin: 20, detour: 400 }, suivant: '#fin' },
    ],
  },

  rc_ch2_troupeau_plaine: {
    illu: 'plaine_route', musique: 'sombre',
    texte: 'Du haut d’une restanque, entre deux oliviers, tu le vois en entier pour la première fois.\n\nLe troupeau couvre la plaine entre la voie ferrée et le canal comme une inondation. Il avance au pas d’un homme fatigué. Il ne se disperse pas. Sur ses flancs, des silhouettes droites trottent, rabattent les traînards à coups de houlette, font tinter leurs cloches. Des chiens, aussi — ou ce qui a été des chiens.\n\nÀ la tête, la grande cloche. Bong. Toutes les dix secondes.\n\nIl va vers le nord. Vers Lamanon. Vers le pertuis, le seul passage entre les Alpilles et les collines. Vers les grottes.',
    choix: [
      { label: 'Observer, compter', effets: { tempsMin: 30, flag: 'troupeau_observe', journal: 'Le troupeau : peut-être dix mille morts, menés par des vivants — ou des revenus — avec des cloches. Il monte vers le pertuis de Lamanon. Deux jours, trois au plus.' }, suivant: '#fin' },
      { label: 'Te dépêcher', suivant: '#fin' },
    ],
  },

  rc_ch2_revenus: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: 'Nadège',
    texte: 'Au bord du chemin, assise sur une borne, une femme en treillis t’attend. Pas de lampe. Une sonnaille à son cou, bourrée de chiffon pour ne pas sonner.\n\nLa femme de la rue de l’Horloge.\n\n« Nadège », dit-elle, et elle tend une main froide. « Le Berger voudrait te parler. Il est à Vieux-Vernègues, sur la montagne, dans les ruines. » Elle sourit. « Tu peux venir quand tu veux. Personne ne te fera de mal, là-haut. Tu es des nôtres. Tu le sens, non ? Le froid. »\n\nElle se lève, remet son sac à l’épaule.\n\n« Viens avant que le vent se lève. Après, on sera partis. »',
    choix: [
      {
        label: '« J’irai. »',
        effets: {
          flag: 'revenus_rencontres', decouvrir: ['vernegues'], quete: ['q_berger', 'debut'],
          journal: 'La femme à la cloche s’appelle Nadège. Elle dit que je suis « des leurs ». Le Berger m’attend à Vieux-Vernègues.',
        },
        suivant: '#fin',
      },
    ],
  },

  rc_ch2_lion: {
    illu: 'plaine_route', musique: 'tension',
    texte: 'Au milieu de la départementale, au soleil, un lion mange un mort.\n\nUn vrai lion, fauve, maigre, la crinière pleine de bardanes, échappé du parc animalier de La Barben quand plus personne n’est venu fermer les enclos. Il tient le cadavre entre ses pattes comme un chat tient une souris, et il arrache, et il mâche, avec un bruit de branche mouillée.\n\nIl lève la tête. Il te regarde. Ses yeux sont jaunes, parfaitement vivants.\n\nLui, au moins, sait ce qu’il mange.',
    choix: [
      { label: 'Reculer lentement, sans lui tourner le dos', test: { skill: 'agilite', difficulte: 1 }, reussite: { texte: 'Il te suit des yeux jusqu’au virage, puis retourne à son repas. Il n’avait pas faim de toi. Pas aujourd’hui.', suivant: '#fin' }, echec: { texte: 'Tu trébuches sur le bas-côté. Le lion se lève.', effets: { combat: { zombies: ['fauve'] } }, suivant: '#fin' } },
      { label: 'Faire un large détour par les vergers', effets: { tempsMin: 25, detour: 600 }, suivant: '#fin' },
    ],
  },

  rc_ch2_avions: {
    illu: 'plaine_route', musique: 'tension',
    texte: 'Deux avions passent très haut, en silence d’abord, puis le bruit arrive, avec du retard, énorme, qui roule d’un bout à l’autre de la Crau. Ils tournent au-dessus de Salon. Ils tournent au-dessus de la base. Ils photographient.\n\nIls comptent ce qu’il y aura à brûler.',
    choix: [{ label: 'Continuer', suivant: '#fin' }],
  },

  // ─────────── Final : Calès → Mallemort ───────────
  rc_fin_colonne: {
    illu: 'crau_mistral', musique: 'combat', orateur: 'Fernand',
    texte: 'À mi-chemin, sur la D17d, entre deux rangées de platanes que le vent tord comme des roseaux, la colonne s’étire. Les vieux traînent. Les enfants pleurent de froid. Et derrière, de plus en plus fort, la grande cloche.\n\nLe vieux Fernand, de Lamanon — quatre-vingt-quatre ans, une hanche en titane —, s’arrête au bord de la route, s’assoit sur une borne kilométrique et fait signe aux autres de continuer.\n\n« J’ai mon âge et je vous ralentis. Allez. Allez, je vous dis. »\n\nDerrière lui, sur la route, les premières silhouettes droites du troupeau apparaissent, avec leurs cloches.',
    choix: [
      {
        label: 'Le porter sur ton dos',
        test: { skill: 'force', difficulte: 2 },
        reussite: { texte: 'Fernand pèse le poids d’un sac de ciment et jure comme un charretier pendant trois kilomètres. Tu ne le poses qu’au pont. Il t’embrasse sur les deux joues, sans rien dire.', effets: { sta: -45, flag: 'fernand_sauve', xp: { force: 15 } }, suivant: '#fin' },
        echec: { texte: 'Tes jambes lâchent au deuxième kilomètre. Deux gamins de l’Empéri reviennent en courant et le portent avec toi, à trois, en titubant. Vous arrivez au pont les derniers. Mais vous arrivez.', effets: { sta: -60, fatigue: -20, flag: 'fernand_sauve' }, suivant: '#fin' },
      },
      { label: 'Lui laisser ton arme', effets: { flag: 'fernand_reste' }, suivant: 'rc_fin_fernand_reste' },
      { label: 'Continuer', effets: { flag: 'fernand_reste' }, suivant: 'rc_fin_fernand_reste' },
    ],
  },
  rc_fin_fernand_reste: {
    illu: 'crau_mistral', musique: 'sombre',
    texte: 'Fernand allume une cigarette, dos au vent, les mains en coupe. Il la tient comme les vieux la tiennent, à l’envers, la braise dans la paume.\n\nQuand tu te retournes, au virage, il est toujours assis sur sa borne, face aux cloches, et il fume.',
    choix: [{ label: 'Ne plus te retourner', suivant: '#fin' }],
  },

  rc_fin_feu: {
    illu: 'ligne_de_feu', musique: 'combat',
    texte: 'Les avions passent au-dessus de toi, si bas que tu vois les rivets sous les ailes. Deux. Quatre. Ils viennent du nord, ils filent vers le sud, vers la Crau, vers Salon, et ils lâchent au ras des collines des chapelets de choses qui tombent en tournoyant.\n\nPuis, sur l’horizon sud, là où est Salon, là où est l’Empéri, là où est la Tour de l’Horloge arrêtée sur neuf heures dix, le ciel devient orange.\n\nLe mistral se jette dessus comme un chien.\n\nCautère a commencé.',
    choix: [{ label: 'Courir vers le pont', effets: { flag: 'cautere_commence', sta: -15 }, suivant: '#fin' }],
  },

  // ─────────── Rencontres « d'ambiance » de l'histoire (tirées au hasard) ───────────
  rc_tract: {
    illu: 'plaine_route', musique: null,
    texte: 'Il neige du papier. Un avion est passé trop haut pour qu’on l’entende, et des milliers de feuilles descendent en tourbillonnant sur les toits, sur les champs, sur les morts qui lèvent la tête pour les regarder tomber.\n\nTu en attrapes une au vol.',
    choix: [{ label: 'Lire', effets: { document: 'doc_tract_armee' }, suivant: '#fin' }],
  },

  rc_revenu_solitaire: {
    illu: 'plaine_route', musique: 'calme',
    texte: 'À la fontaine d’un hameau, un homme boit dans ses mains. Il porte une sonnaille au cou et un blouson de chantier. Il te voit, et ne bouge pas.\n\n« T’inquiète », dit-il. « Je suis comme toi. » Il s’essuie la bouche. « Je m’appelle Yanis. J’étais cariste à Clésud. Je suis revenu il y a quatre jours. Je ne sais pas encore ce que je vais faire de ça. » Il désigne son propre corps d’un geste vague. « Le Berger dit qu’on a une mission. Moi, je voudrais juste revoir ma mère. Elle est aux Canourgues. Tu crois qu’elle me reconnaîtrait ? »',
    choix: [
      { label: '« Oui. »', suivant: '#fin' },
      { label: '« Ne va pas la voir. »', suivant: '#fin' },
    ],
  },
};
