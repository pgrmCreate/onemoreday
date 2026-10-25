// ============ ACTE II — « La bergerie » (jours 3 et 4, quête q_crau) — docs/HISTOIRE.md §6 ============
// La bergerie de Cabassole : Gérard parmi ses brebis, l'armoire du vétérinaire, le soir au feu avec Fernand,
// l'enveloppe (l'ouvrir ou tenir parole), puis la frappe sur la gare de triage (jour 4, 6 h), vue de la bergerie
// ou des remparts (branche de nuit). Menu de Fernand à la bergerie : fernand_crau_parler (scenes_pnj.js).
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.

export const SCENES_CRAU = {

  // ─────────────────────────── L'ARRIVÉE ───────────────────────────
  // Déclencheur : entrée dans 'bergerie' pendant q_crau.route.
  ber_arrivee: {
    illu: 'bergerie_crau', musique: 'sombre', orateur: null,
    texte: 'La bergerie de Cabassole apparaît d’un coup au bout de la draille, au milieu de rien. C’est un long bâtiment de pierre au toit de tuiles, bas comme une bête couchée, avec un mas accolé à un bout et un puits à balancier dont la perche pointe vers le ciel. Autour, il n’y a que les galets de la Crau et l’herbe rase, à perte de vue, jusqu’aux Alpilles bleues tout au nord.\n\nC’est le silence qui te frappe d’abord. Une bergerie, ça bêle, ça tousse, ça cogne contre les barrières ; celle-ci ne fait aucun bruit. Puis le vent tourne, et l’odeur te prend à la gorge : le suint, la laine mouillée, et par-dessus, l’odeur sucrée de ce qui pourrit depuis des jours.\n\nDans la cour, sous un amandier, quelqu’un a monté avec soin un petit tas de pierres plates, et il a posé dessus un collier de chien.\n\nLa porte du mas est ouverte, et elle bat doucement dans le vent.\n\nFernand s’arrête et met ses mains en porte-voix.\n\n« Gérard ! Gérard, c’est Fernand ! »\n\nRien ne répond. Il attend encore un peu, puis il baisse les mains.\n\n« Bon. Les médicaments sont dans la souillarde du mas, dans une armoire en fer que Gérard fermait à clé à cause de ses petits-enfants. » Il regarde la grande porte de la bergerie, fermée par une barre. « Et Gérard, il est quelque part là-dedans. »',
    choix: [
      {
        label: 'Chercher l’armoire du vétérinaire',
        effets: {
          quete: ['q_crau', 'bergerie'],
          journal: 'La bergerie de Cabassole est silencieuse, et Gérard ne répond pas. Les antibiotiques sont dans une armoire en fer, dans la souillarde du mas, fermée à clé. Gérard gardait la clé sur lui.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'gerard' (dans la bergerie). Le combat se joue ensuite pour de vrai : Gérard est un mort du plan
  // (flagMort 'gerard_acheve').
  ber_gerard: {
    illu: 'bergerie_crau', musique: 'tension', orateur: 'Fernand',
    texte: 'Quand tu pousses la grande porte de la bergerie, la lumière entre en biais dans la longue salle de pierre, et tu vois les brebis. Elles sont couchées partout dans la paille, des dizaines, raides, le ventre ouvert, la laine collée de noir, et les mouches se lèvent en nuage quand l’air entre.\n\nTout au fond, près de l’enclos, il y a un homme debout. C’est un vieil homme en veste de velours, coiffé d’un chapeau de feutre, avec une barbe de trois semaines. Il se tient voûté au-dessus d’une brebis morte, et il mâche lentement, sans faim, comme on mâche par habitude. À sa ceinture pendent un trousseau de clés et un couteau dans son étui.\n\nDerrière le muret bas de l’enclos, trois brebis vivantes sont serrées les unes contre les autres dans un coin, la tête basse, sans bêler.\n\nGérard lève la tête vers la lumière.\n\nFernand ne bouge pas. À côté de toi, tu l’entends respirer, d’une longue respiration de vieil homme qui vient de monter une côte.\n\n« Fais-le, toi, dit-il sans te regarder. Moi, je le connaissais. »',
    choix: [
      {
        label: 'Avancer vers Gérard',
        effets: {
          flag: 'gerard_vu',
          journal: 'Gérard est mort, et il s’est relevé au milieu de ses brebis. Fernand ne peut pas le faire : « Moi, je le connaissais. » La clé de l’armoire est à sa ceinture.',
        },
        suivant: '#fin',
      },
      {
        label: 'Reculer et refermer la porte',
        effets: {
          flag: 'gerard_vu',
          journal: 'Gérard est mort, et il s’est relevé au milieu de ses brebis. J’ai refermé la porte de la bergerie sur lui. La clé de l’armoire est à sa ceinture ; sinon, il faudra forcer l’armoire.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'armoire_veto' (la souillarde du mas).
  ber_armoire: {
    illu: 'bergerie_crau', musique: null, orateur: null,
    texte: 'La souillarde est une petite pièce fraîche derrière la cuisine du mas, avec un évier de pierre et des étagères de bocaux. Contre le mur du fond, il y a une armoire métallique grise, du genre qu’on trouve dans les vestiaires d’usine, avec un autocollant à moitié arraché : CABINET VÉTÉRINAIRE DE LA CRAU — SAINT-MARTIN. La porte est fermée par une serrure solide.\n\n« Gérard gardait la clé à sa ceinture, avec son couteau, dit Fernand. Il disait qu’un berger qui perd sa clé, c’est un berger qui perd ses bêtes. »',
    choix: [
      {
        label: 'Ouvrir avec la clé de Gérard',
        si: { flag: 'gerard_acheve' },
        effets: {
          objets: [['antibio_veto', 2], ['bandage', 2]],
          document: 'doc_carnet_gerard',
          flag: 'antibio_trouves',
          quete: ['q_crau', 'nuit'],
          journal: 'J’ai ouvert l’armoire du vétérinaire avec la clé de Gérard. Dedans : deux flacons d’oxytétracycline pour Noa, des pansements, et le carnet de Gérard.',
        },
        suivant: 'ber_armoire_2',
      },
      {
        label: 'Forcer la porte au pied-de-biche',
        si: { pasFlag: 'gerard_acheve' },
        besoin: { objet: 'pied_de_biche' },
        effets: {
          objets: [['antibio_veto', 2], ['bandage', 2]],
          document: 'doc_carnet_gerard',
          flag: 'antibio_trouves',
          quete: ['q_crau', 'nuit'],
          bruit: 6,
          journal: 'J’ai forcé l’armoire du vétérinaire au pied-de-biche, dans un vacarme de tôle. Dedans : deux flacons d’oxytétracycline pour Noa, des pansements, et le carnet de Gérard.',
        },
        suivant: 'ber_armoire_2',
      },
      { label: 'Laisser l’armoire pour l’instant', si: { pasFlag: 'gerard_acheve' }, suivant: '#fin' },
    ],
  },

  ber_armoire_2: {
    illu: 'bergerie_crau', musique: 'calme', orateur: 'Fernand',
    texte: 'Sur l’étagère du milieu, il y a deux flacons bruns à bouchon de caoutchouc, des seringues encore sous plastique, des compresses, et un carnet à spirale taché de graisse : celui de Gérard.\n\nFernand prend un flacon et le tient à bout de bras dans la lumière pour lire l’étiquette, les yeux plissés.\n\n« Oxytétracycline, deux cents milligrammes par millilitre. Pour une brebis, c’est un millilitre pour dix kilos. » Il compte sur ses doigts, et ses lèvres bougent. « La petite, elle fait quoi, vingt-cinq kilos ? Alors deux millilitres et demi par jour, pendant cinq jours, dans la fesse. Ça lui jaunira peut-être les dents. Les dents, ça se remplace mieux qu’une petite fille. »\n\nIl pose le flacon dans ta main et referme tes doigts dessus.\n\n« On dort ici, et on rentre à l’aube. La Crau, la nuit, c’est à eux. »',
    choix: [{ label: 'Ranger les flacons dans ton sac', suivant: '#fin' }],
  },

  // ─────────────────────────── LE SOIR AU FEU ───────────────────────────
  // Déclencheur : jour 3, 19 h, si l'on est à la bergerie.
  ber_soir: {
    illu: 'bergerie_nuit', musique: 'calme', orateur: 'Fernand',
    texte: 'Le soir tombe vite sur la Crau. Fernand a barré la porte du mas avec la table et allumé dans la grande cheminée un petit feu de sarments, qui ne fume presque pas. Dans le placard de Gérard, il a trouvé un bocal de pois chiches, de l’huile et une tête d’ail, et il fait une soupe dans une marmite noire en remuant avec son Opinel.\n\n« Mange. Gérard ne la mangera plus, et il aurait détesté qu’on la jette. »\n\nIl parle en regardant le feu, plus qu’il n’a parlé de toute la journée. Il raconte la Crau d’avant, les transhumances de juin, quand on montait les bêtes à pied jusqu’aux Alpes par les drailles, trois semaines de marche avec les sonnailles et les chiens. Gérard et lui avaient fait la première ensemble, à quatorze ans. Il raconte les coussouls au printemps, quand l’herbe sent le thym et que les outardes dansent pour les femelles en gonflant le cou.\n\n« Et Hélène, elle était dans la classe au-dessus de la mienne, à l’école du village. » Il a un petit rire sec. « Elle comptait déjà tout : les billes, les bonbons, les points de la marelle. Un jour, elle m’a dénoncé à la maîtresse parce que j’avais triché d’un point. Un point ! Je ne l’ai jamais oublié. Elle non plus, je pense. »\n\nIl remue la soupe, et il ne rit plus.\n\n« Elle a toujours su ce qu’il fallait faire. Ce n’est pas pareil que de faire ce qu’on voudrait. »',
    choix: [{ label: 'Manger ta soupe en silence', effets: { faim: 25, fatigue: 5 }, suivant: 'ber_soir_2' }],
  },

  ber_soir_2: {
    illu: 'bergerie_nuit', musique: 'sombre', orateur: 'Fernand',
    texte: 'Quand tu ouvres ton sac pour ranger la gourde, l’enveloppe d’Hélène glisse sur la table, entre vous deux, dans la lumière du feu : À N’OUVRIR QUE SI LE REFUGE TOMBE.\n\nFernand la regarde longtemps, sans la toucher.\n\n« Elle te l’a donnée à toi ? » Il ne pose pas vraiment la question ; il hoche la tête tout seul. « Alors garde-la fermée. »\n\nIl se lève pour remettre un sarment dans le feu, et tu remarques qu’il te tourne le dos plus longtemps qu’il n’en faut pour ça. Quand il se rassoit, il ne parle plus de l’enveloppe. Il parle des loups qu’on dit revenus dans les Alpilles, de la pluie qui ne vient pas, de tout sauf de demain.\n\nTu en es {sûr|sûre} : il en sait plus qu’il ne le dit.',
    choix: [
      { label: 'Ouvrir l’enveloppe', effets: { document: 'doc_lettre_helene', flag: 'enveloppe_ouverte' }, suivant: 'ber_enveloppe' },
      {
        label: 'Tenir parole et dormir',
        effets: { journal: 'J’ai gardé l’enveloppe d’Hélène fermée, comme promis. Fernand l’a regardée longtemps : il sait quelque chose qu’il ne dit pas. Nous rentrons au Refuge à l’aube.' },
        suivant: '#fin',
      },
    ],
  },

  ber_enveloppe: {
    illu: 'bergerie_nuit', musique: 'sombre', orateur: null,
    texte: 'Tu déchires l’enveloppe avec le pouce. Fernand ne t’en empêche pas : il te regarde faire, les mains posées à plat sur les genoux.\n\nDedans, il y a deux feuilles de cahier pliées en trois, couvertes de la petite écriture droite d’Hélène. Tu lis tout, deux fois.\n\nHélène savait. Le soir de ton arrivée, une lieutenante de l’armée l’a prévenue, sur une radio cachée dans le donjon : l’armée va bombarder la gare de triage de Miramas samedi à l’aube, c’est-à-dire demain matin, pour brûler les milliers de morts qui s’y entassent, et il y a du chlore dans les wagons. On lui a dit d’évacuer vers l’est. Elle a choisi de rester derrière les murs, avec une enfant malade et deux vieillards, et elle t’a {envoyé|envoyée} au loin avec Fernand, parce que vous savez vivre dehors, au cas où le Refuge tomberait.\n\nElle te dit où aller s’il tombe : la Poudrerie de Saint-Chamas d’abord, puis le pont de Mallemort, le mercredi 7 octobre à l’aube. Elle te donne le mot à dire à l’armée : Beauvezer. Et à la fin, elle te demande de prendre soin d’Inès.\n\nTu lèves les yeux. Fernand n’a pas bougé.\n\n« Je sais, dit-il. Elle me l’a dit le soir où tu es {arrivé|arrivée}, avant même que Yohan allume sa lampe. »',
    choix: [
      { label: 'Convaincre Fernand de rentrer cette nuit', suivant: 'ber_enveloppe_nuit' },
      {
        label: 'Attendre l’aube, comme il le veut',
        effets: { journal: 'J’ai ouvert l’enveloppe d’Hélène. Elle savait depuis mon premier soir : l’armée va bombarder la gare de triage de Miramas demain à l’aube, et il y a du chlore dans les wagons. Si le Refuge tombe : la Poudrerie de Saint-Chamas, puis le pont de Mallemort le mercredi 7 octobre à l’aube, avec le mot « Beauvezer ». Fernand le savait aussi. Nous rentrons à l’aube, comme il le veut.' },
        suivant: '#fin',
      },
    ],
  },

  ber_enveloppe_nuit: {
    illu: 'bergerie_nuit', musique: 'tension', orateur: 'Fernand',
    texte: 'Fernand t’écoute jusqu’au bout sans t’interrompre. Il regarde le feu, puis la porte barrée, puis le flacon de Gérard que tu as posé sur la table.\n\n« La Crau, la nuit, c’est à eux, dit-il enfin. Je te l’ai dit, et je ne l’ai pas dit pour faire joli. » Il se lève, lentement, en s’appuyant sur la table. « Mais si on attend l’aube, on arrivera après le bruit, avec tous les pauvres de la plaine sur nos talons. Et la petite aura ses médicaments six heures plus tôt. »\n\nIl éteint le feu en jetant dessus le fond de la soupe, et la pièce plonge dans le noir.\n\n« Tu marches derrière moi, sans lampe. Quand je m’arrête, tu t’arrêtes. Quand je me couche, tu te couches. Et tu ne poses pas de question. »',
    choix: [
      {
        label: 'Partir dans la nuit avec Fernand',
        effets: {
          flag: 'retour_nuit',
          quete: ['q_crau', 'retour'],
          voyage: { vers: 'miramas_le_vieux', indication: true },
          journal: 'J’ai ouvert l’enveloppe d’Hélène. Elle savait depuis mon premier soir : l’armée va bombarder la gare de triage de Miramas demain à six heures, et il y a du chlore dans les wagons. Fernand le savait aussi. Je l’ai convaincu de rentrer au Refuge cette nuit, à travers la Crau, sans lampe.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA FRAPPE ───────────────────────────
  // Déclencheur : jour 4, 6 h, où que l'on soit. Fernand est avec toi dans les deux branches
  // (à la bergerie, ou rentré au Refuge dans la nuit).
  frappe_reveil: {
    illu: 'crau_aube', musique: 'tension', orateur: 'Fernand',
    texte: 'Fernand te secoue l’épaule. Il fait encore nuit, avec à peine une ligne grise à l’est, et il a déjà sa casquette sur la tête et son bâton à la main, comme s’il ne s’était jamais couché.\n\n« Écoute. »\n\nTu tends l’oreille. D’abord, tu n’entends rien, que le vent et un chien très loin. Puis il arrive : un grondement sourd qui vient du sud-ouest, de la mer, qui grossit, et qui fait trembler les vitres.\n\nFernand regarde la vieille montre à gousset qu’il tient au creux de sa main.\n\n« Six heures, dit-il. Elle était précise. »',
    choix: [{ label: 'Sortir', effets: { cinematique: 'frappe' }, suivant: 'frappe_apres' }],
  },

  // Après la cinématique : la suite dépend de l'endroit où l'on est (choix complémentaires).
  frappe_apres: {
    illu: 'triage_feu', musique: 'tension', orateur: null,
    texte: 'Quand le grondement des avions s’éloigne enfin vers la mer, il reste un silence épais, et au loin, du côté de Miramas, une lueur orange qui monte dans le ciel du matin.',
    choix: [
      { label: 'Regarder', si: { lieu: 'bergerie' }, suivant: 'frappe' },
      { label: 'Regarder', si: { lieu: 'miramas_le_vieux' }, suivant: 'frappe_refuge' },
      { label: 'Regarder', si: { non: { ou: [{ lieu: 'bergerie' }, { lieu: 'miramas_le_vieux' }] } }, suivant: 'frappe' },
    ],
  },

  frappe: {
    illu: 'triage_feu', musique: 'tension', orateur: 'Fernand',
    texte: 'Au sud-ouest, là où la plaine touche l’étang, la gare de triage de Miramas brûle. Ce n’est pas un incendie : c’est un mur de feu de deux kilomètres de long, d’où montent des colonnes de fumée noire si épaisses qu’elles cachent le lever du jour. De temps en temps, quelque chose explose encore au milieu, un wagon ou une cuve, et le bruit met une seconde à arriver jusqu’à toi.\n\nEt sous la fumée noire, il y a autre chose. C’est un nuage jaune pâle, presque vert, qui sort d’entre les voies et qui ne monte pas. Il roule au ras du sol, lentement, comme de l’eau qu’on aurait renversée, et il s’étale sur la plaine en avalant les haies une à une.\n\nFernand regarde tout ça sans un mot, appuyé sur son bâton. Il n’a pas l’air surpris. Il a l’air de quelqu’un qui voit arriver un train à l’heure.\n\nPuis il montre de son bâton les petites taches noires qui bougent devant le feu, des centaines, des milliers, qui s’écartent des flammes et remontent la plaine vers l’est.\n\n« Les pauvres, dit-il. Ils fuient le feu. Et le seul endroit haut dans tout le coin, c’est chez nous. » Il ajuste sa casquette. « On rentre. Tout de suite, et sans traîner. »',
    choix: [
      {
        label: 'Suivre Fernand',
        effets: {
          flag: 'frappe_faite',
          quete: ['q_crau', 'retour'],
          voyage: { vers: 'miramas_le_vieux', indication: true },
          journal: 'Samedi, six heures : deux avions ont bombardé la gare de triage de Miramas. Elle brûle, et il en sort un nuage jaune qui roule au ras du sol au lieu de monter. Les morts fuient le feu vers les hauteurs, c’est-à-dire vers le Refuge. Fernand n’a pas eu l’air surpris. Nous rentrons.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Branche de nuit : la frappe vue des remparts, les familles parties à l'aube.
  frappe_refuge: {
    illu: 'triage_feu', musique: 'tension', orateur: 'Hélène',
    texte: 'Du rempart sud, la gare de triage est à six kilomètres, et pourtant tu sens la chaleur sur ton visage quand la deuxième série de bombes tombe. Les explosions se suivent le long des voies comme des pétards sur une ficelle, puis une boule de feu monte au-dessus des trains, et le jour se lève d’un coup, orange.\n\nSous la fumée noire, quelque chose de jaune se met à couler hors de la gare, au ras du sol.\n\nHélène est à côté de toi, les mains posées sur le parapet. Elle ne regarde pas le feu : elle regarde le nuage jaune, et ses lèvres bougent, comme si elle comptait.\n\n« Le vent vient de la mer, dit-elle. Il le pousse vers la Crau, pas vers nous. Pour l’instant. »\n\nDerrière vous, la poterne est refermée. Il y a une heure, avant le jour, Karine y est passée avec Noa sur le dos, puis Céline et Théo, puis Paul et Josette, qui se tenaient par le bras. Ils descendent vers la Poudrerie de Saint-Chamas par le sentier de la falaise, et aucun d’eux ne s’est retourné. Sœur Agnès les a bénis depuis le seuil de l’église, et elle est rentrée prier.\n\nHélène finit par enlever ses lunettes.\n\n« Maintenant, ils vont fuir le feu, et ils vont monter. Nous avons la journée pour nous préparer. »',
    choix: [
      {
        label: 'Descendre te préparer',
        effets: {
          flag: 'frappe_faite',
          quete: ['q_crau', 'fin'],
          journal: 'Six heures : des remparts, j’ai vu les avions bombarder la gare de triage de Miramas, et un nuage jaune couler hors de la gare, au ras du sol. Les familles sont parties avant le jour par la poterne, vers la Poudrerie de Saint-Chamas. Les morts vont fuir le feu et monter vers le rocher : nous avons la journée pour nous préparer.',
        },
        suivant: '#fin',
      },
    ],
  },
};
