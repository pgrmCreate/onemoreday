// ============ Scènes des RENCONTRES DE VOYAGE de l'histoire (préfixe rv_) ============
// Lancées par les rencontres rh_* de js/data/histoire/rencontres.js (type 'choix'), elles-mêmes déclenchées par
// les déclencheurs { quand: 'voyage' } de declencheurs.js, ou tirées au hasard quand leur condition est vraie.
// Effets propres au voyage : `detour` (mètres ajoutés au trajet), `combat` (on se bat puis on reprend).
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.

const JOURNAL_BRUME = 'Le nuage jaune de la gare brûle les yeux et les poumons. Il est plus lourd que l’air : il reste en bas, dans les creux, au ras du sol, et la nuit, quand il n’y a pas de vent, il s’étale. Un linge mouillé sur la bouche aide un peu. En hauteur, on ne risque rien.';

export const SCENES_RENCONTRES = {

  // ─────────────────────────── ACTE II : la route de la Crau ───────────────────────────
  // rh_triage : à 30 % du trajet Refuge → bergerie.
  rv_triage: {
    illu: 'triage_horde', musique: 'tension', orateur: 'Fernand',
    texte: 'La route de la Crau passe sur un pont au-dessus des voies, et Fernand s’arrête au milieu, appuyé au parapet. En dessous, la gare de triage de Miramas s’étale sur des kilomètres : des dizaines de voies parallèles, des trains de marchandises immobiles, des wagons rouillés et des entrepôts aux toits plats.\n\nEt entre les trains, partout, il y a des morts. Il y en a des milliers, serrés comme la foule d’un concert, debout entre les rails, sur les quais, et même sur le toit des wagons, où ils ont grimpé on ne sait comment. Ils regardent tous dans la même direction, vers un poteau planté au milieu des voies, où un haut-parleur répète d’une voix de femme enregistrée : « … le train à destination de… est annoncé voie… Éloignez-vous de la bordure du quai… »\n\nPersonne ne l’a éteint. La batterie d’un poste d’aiguillage le fait parler depuis trois semaines, et tous les morts de la Crau sont venus l’écouter.\n\n« Les sirènes de l’armée les poussent jusqu’ici, dit Fernand à voix basse, et le haut-parleur les retient là. »',
    choix: [
      { label: 'Regarder longtemps', effets: { flag: 'triage_vu', tempsMin: 10 }, suivant: 'rv_triage_2' },
      { label: 'Passer vite', suivant: '#fin' },
    ],
  },

  rv_triage_2: {
    illu: 'triage_horde', musique: 'sombre', orateur: 'Fernand',
    texte: 'Tu restes au parapet jusqu’à ce que tes yeux s’habituent. Au bout de la gare, sur une voie de garage à l’écart, il y a un train qui ne ressemble pas aux autres : une douzaine de wagons-citernes blancs, propres, sans un tag, alignés comme à la parade. Les morts ne s’en approchent pas, ou peut-être qu’ils ne s’en soucient pas. Sur le flanc de chaque citerne, une plaque orange porte deux nombres que tu arrives à lire en plissant les yeux : 268 en haut, 1017 en bas.\n\nFernand a suivi ton regard.\n\n« Les blancs, dit-il. Gérard disait qu’il ne fallait jamais s’en approcher. Il avait fait son service dans le génie, il connaissait les plaques. » Il se redresse. « Viens. Ici, on est trop haut, et on nous voit de trop loin. »',
    choix: [
      {
        label: 'Reprendre la route',
        effets: { journal: 'Du pont au-dessus de la gare de triage de Miramas : des milliers de morts entre les trains, attirés par un haut-parleur qui parle tout seul. À l’écart, sur une voie de garage, une douzaine de wagons-citernes blancs avec des plaques orange : 268 et 1017. Fernand dit que Gérard ne s’en approchait jamais.' },
        suivant: '#fin',
      },
    ],
  },

  // rh_draille : à 75 % du trajet Refuge → bergerie.
  rv_draille: {
    illu: 'crau_mistral', musique: 'tension', orateur: 'Fernand',
    texte: 'La draille est un vieux chemin de moutons, large et droit, bordé de murets de pierre sèche, qui traverse la Crau vers l’ouest. Fernand la suit sans hésiter, en lisant les tas de pierres comme des panneaux.\n\nÀ mi-chemin, il lève la main, et tu t’arrêtes. Cinquante mètres devant, un cabanon de berger, quatre murs et un toit de tuiles, ouvre sa porte sur la draille. Sur le seuil, un mort est assis, adossé au chambranle, les jambes allongées dans la poussière. Il tourne la tête de droite à gauche, lentement, comme quelqu’un qui cherche d’où vient un bruit.\n\nIl n’y a pas d’autre chemin que la draille, à moins d’enjamber les murets et de faire le tour par les champs de galets.\n\n« Fais comme tu veux, chuchote Fernand. Mais si tu frappes, frappe fort. Ici, le bruit porte à trois kilomètres. »',
    choix: [
      { label: 'L’achever', effets: { combat: { zombies: ['errant'] } }, suivant: 'rv_draille_2' },
      { label: 'Faire le tour par les murets', effets: { detour: 600, tempsMin: 15 }, suivant: '#fin' },
    ],
  },

  rv_draille_2: {
    illu: 'crau_mistral', musique: 'calme', orateur: 'Fernand',
    texte: 'Quand c’est fini, Fernand s’approche et retourne le corps du bout de son bâton. C’était un homme jeune, en tenue de cycliste, avec des chaussures à cales et un bidon encore accroché à la ceinture.\n\n« Un de ceux qui faisaient le tour de la Crau à vélo le dimanche, dit Fernand. Ils nous doublaient sur la route en faisant sonner leur sonnette, et les brebis s’affolaient. » Il décroche le bidon, le débouche, le renifle, et te le tend. « Les pauvres. Allez, viens. »',
    choix: [{ label: 'Prendre le bidon et repartir', effets: { objet: ['bouteille_eau', 1] }, suivant: '#fin' }],
  },

  // rh_nuit_crau : branche de nuit, à mi-chemin du retour bergerie → Refuge.
  rv_nuit_crau: {
    illu: 'nuit_campagne', musique: 'tension', orateur: 'Fernand',
    texte: 'La Crau, la nuit, ne ressemble à rien de ce que tu connais. Il n’y a pas de lune, pas un arbre, pas une lumière, seulement les galets qui crissent sous tes pieds et un ciel si plein d’étoiles qu’il a l’air posé sur la plaine. Fernand marche devant toi sans lampe, et tu suis le petit bruit de son bâton.\n\nSoudain, il s’arrête et s’accroupit. Tu fais pareil.\n\nSur ta gauche, à deux cents mètres peut-être, des silhouettes se découpent sur le ciel, à peine plus noires que la nuit. Elles avancent en file, lentement, toutes dans la même direction, vers la gare de triage, d’où leur parvient très loin la voix du haut-parleur. Tu en comptes vingt, puis tu arrêtes de compter.\n\n« Ils vont au haut-parleur, souffle Fernand. Ne bouge plus. Ils regardent devant eux. »',
    choix: [
      { label: 'Attendre à plat ventre qu’ils soient passés', effets: { tempsMin: 30 }, suivant: '#fin' },
      { label: 'Continuer en rampant derrière les murets', effets: { detour: 400, tempsMin: 15 }, suivant: '#fin' },
    ],
  },

  // rh_nuage : après la frappe, sur le retour bergerie → Refuge. LA RÈGLE DE LA BRUME (P10).
  rv_nuage: {
    illu: 'triage_feu', musique: 'tension', orateur: 'Fernand',
    texte: 'À mi-chemin du Refuge, la route descend dans un creux de la plaine, et le nuage est là, couché en travers du chemin.\n\nC’est un brouillard jaune pâle, presque vert, épais comme du lait, qui remplit le creux sur un kilomètre et qui ne bouge presque pas. Il ne monte pas plus haut qu’un homme : au-dessus, l’air est clair, et dedans, on ne voit pas à dix mètres. Il sent l’eau de Javel, si fort que tes yeux se mettent à pleurer avant même que tu arrives au bord.\n\nSur la route, à tes pieds, il y a des oiseaux morts, des moineaux, des étourneaux et même un héron, tombés en plein vol, le bec ouvert.\n\nFernand a remonté son foulard sur son nez, et il parle vite, la voix étouffée.\n\n« C’est ce qui sortait de la gare, le jaune. Ça brûle les yeux et la gorge, et ça te ronge les poumons de l’intérieur. C’est plus lourd que l’air : ça reste en bas, dans les creux, au ras du sol, et quand il n’y a pas de vent, ça ne bouge plus. Un linge mouillé sur la bouche, ça aide un peu, pas beaucoup. En hauteur, on ne craint rien. » Il regarde le soleil voilé par la fumée. « Et cette nuit, s’il n’y a pas de vent, ça va s’étaler partout dans la plaine. Il faudra se mettre en hauteur. »\n\nIl montre au nord une ligne de collines basses.\n\n« On peut faire le tour par là. Ça nous coûtera une heure. »',
    choix: [
      { label: 'Contourner par le nord', effets: { detour: 2500, tempsMin: 45, journal: JOURNAL_BRUME }, suivant: '#fin' },
      {
        label: 'Traverser en retenant ton souffle',
        effets: { blessure: { type: 'brulure', zone: 'au torse' }, pv: -6, journal: JOURNAL_BRUME },
        suivant: 'rv_nuage_2',
      },
    ],
  },

  rv_nuage_2: {
    illu: 'triage_feu', musique: 'tension', orateur: null,
    texte: 'Tu prends une grande inspiration et tu t’enfonces dans le jaune, derrière Fernand, en courant.\n\nTu tiens trente pas. Au trente et unième, ta poitrine te force à respirer, et c’est comme si tu avalais du verre pilé. Tu tousses, tu craches, tes yeux brûlent au point que tu ne vois plus la route, et c’est la main de Fernand, accrochée à ta manche, qui te tire jusqu’à l’air clair.\n\nDe l’autre côté, tu tombes à genoux dans l’herbe et tu tousses pendant de longues minutes. Ta salive a un goût de piscine et de sang.\n\n« Voilà, dit Fernand, plié en deux à côté de toi. Maintenant, tu sais. »',
    choix: [{ label: 'Te relever', suivant: '#fin' }],
  },

  // rh_maree : après la frappe, à 75 % du retour bergerie → Refuge.
  rv_maree: {
    illu: 'plaine_route', musique: 'tension', orateur: 'Fernand',
    texte: 'Vous êtes à moins de deux kilomètres du rocher quand Fernand te tire par la manche dans le fossé.\n\nSur la plaine, entre la route et le rocher de Miramas-le-Vieux, les morts traversent les champs. Ils viennent de la gare, du feu, par centaines, et ils marchent tous dans la même direction, vers le village perché. Certains ont les vêtements qui fument encore. Un homme sans bras passe à vingt mètres du fossé, la peau du dos cloquée et noire, et il ne vous regarde pas : il regarde le rocher.\n\n« Ils montent chez nous, souffle Fernand. Comme je disais. »\n\nIls sont trop nombreux pour passer au milieu. Dans une heure, peut-être, le gros sera passé.',
    choix: [
      { label: 'Te jeter dans le fossé et attendre', effets: { tempsMin: 60 }, suivant: '#fin' },
      { label: 'Courir devant eux', effets: { combat: { zombies: ['coureur', 'errant'] } }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── ACTE III → IV : la fuite ───────────────────────────
  // rh_sentier : à mi-chemin du Refuge à la Poudrerie, après la chute.
  rv_sentier: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: 'Inès',
    texte: 'Le sentier de la falaise descend en lacets vers l’étang, entre les chênes kermès et les rochers. Inès passe devant, parce qu’elle le connaît : c’est par là qu’elle descendait relever les nasses de Malik.\n\nÀ mi-pente, tu te retournes. Au-dessus de vous, le village brûle. Les flammes sortent des toits autour de la place, et le clocher se découpe en noir sur le ciel orange, muet. Le vent t’apporte une odeur de bois, de graisse et de cheveux brûlés.\n\nAlors, dans le sac d’Inès, le petit récepteur qu’elle a laissé allumé se met à crachoter, et une voix de jeune fille en sort, nasillarde, si claire que tu en as la chair de poule :\n\n« Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants. Venez par la route de Saint-Chamas, à la porte Notre-Dame. Montrez vos mains… »\n\nInès s’est arrêtée. Elle écoute sa propre voix sortir de son sac, pendant qu’au-dessus d’elle le village brûle.\n\n« Je l’avais mise en boucle pour la nuit, comme tous les soirs, dit-elle. Je n’ai pas eu le temps de l’éteindre. » Elle a un petit rire horrible. « Elle va continuer. La batterie tient une semaine, et il y a le panneau solaire. Elle va dire aux gens de venir. Chez eux. »\n\nElle se remet à descendre, très vite, sans se retourner.',
    choix: [
      {
        label: 'La suivre',
        effets: { journal: 'En descendant le sentier de la falaise, nous avons entendu le message d’Inès sortir de son récepteur : il passe en boucle depuis le village en feu, et il va continuer pendant des jours à appeler les survivants vers le Refuge.' },
        suivant: '#fin',
      },
    ],
  },

  // rh_brume_montee : à 45 % de la montée Poudrerie → Cornillon, dans la brume.
  rv_brume: {
    illu: 'poudrerie_brume', musique: 'tension', orateur: 'Inès',
    texte: 'Le chemin de Cornillon monte à travers les oliviers, mais la brume monte plus vite que vous. Elle vous a rattrapés au premier virage, et maintenant vous marchez dedans jusqu’à la poitrine, dans une lumière de lune toute jaune. Le foulard mouillé ne sert presque plus à rien. Tu respires par petites inspirations, et chacune te brûle la gorge.\n\nInès s’arrête net et lève la main.\n\nDevant, la brume bouge. Une forme en sort, puis une autre, puis une troisième, et tu n’entends rien : pas un grognement, pas un pas, comme si la brume avalait les sons. Les morts y marchent tranquillement, la bouche ouverte, le jaune glissant sur eux comme de l’eau. Ils ne toussent pas, parce qu’ils ne respirent presque plus.\n\n« Ils ne nous ont pas vus, chuchote Inès. Pas encore. »\n\nSur la droite, une pinède grimpe raide vers le haut de la colline, au-dessus du jaune.',
    choix: [
      { label: 'Retenir ton souffle et courir', effets: { pv: -4 }, suivant: '#fin' },
      { label: 'Passer par la pinède, plus haut', effets: { detour: 800, tempsMin: 25 }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── ACTE V : la colonne ───────────────────────────
  // rh_colonne : à mi-chemin vers Mallemort, la nuit du mardi 6 octobre, avec la colonne.
  rv_colonne: {
    illu: 'nuit_campagne', musique: 'tension', orateur: 'Inès',
    texte: 'Vers minuit, la colonne s’arrête au bord de la vallée de la Touloubre. La route descend vers le pont, et le fond de la vallée est rempli de brume jaune, immobile sous les étoiles, comme du lait dans un bol. De l’autre côté, la route remonte, et l’air redevient clair.\n\nIl faut traverser trois cents mètres de jaune.\n\nPendant que chacun remouille son foulard et le noue sur son visage, une voix appelle au secours, en bas, dans la brume. C’est une voix d’homme, faible, qui tousse entre chaque mot. Tu le vois enfin : un homme assis au milieu de la route, au fond du jaune, à côté d’un vélo couché. Il essaie de se lever, il retombe, et il appelle encore.\n\n« Il a dû y descendre au crépuscule sans savoir, dit Inès. Il ne pourra plus remonter tout seul. » Elle te regarde. « On ne peut pas tous y aller. »',
    choix: [
      {
        label: 'Mettre le masque à gaz et aller le chercher',
        si: { objet: 'masque_gaz' },
        effets: { tempsMin: 15, fatigue: -10 },
        suivant: 'rv_colonne_2',
      },
      {
        label: 'Aller le chercher en retenant ton souffle',
        effets: { tempsMin: 15, fatigue: -10, blessure: { type: 'brulure', zone: 'au torse' }, pv: -5 },
        suivant: 'rv_colonne_2',
      },
      {
        label: 'Le laisser et traverser vite',
        effets: { journal: 'Cette nuit, dans la vallée de la Touloubre, un homme appelait au secours au fond de la brume. Nous ne sommes pas allés le chercher.' },
        suivant: 'rv_colonne_3',
      },
    ],
  },

  rv_colonne_2: {
    illu: 'nuit_campagne', musique: 'calme', orateur: 'Inès',
    texte: 'Tu descends dans le jaune, tu passes son bras sur tes épaules, et tu l’aides à remonter de l’autre côté en le portant à moitié, pendant qu’il tousse contre ton cou. Il ne pèse presque rien. Il s’appelle Lucien, il a soixante ans, et il venait de Saint-Chamas à vélo parce qu’il avait entendu, à la radio, qu’un pont allait ouvrir.\n\nEn haut, il reste longtemps assis dans l’herbe, à reprendre son souffle par petites inspirations.\n\nInès te tend une gourde sans rien dire, et la colonne repart, un peu plus lente qu’avant.',
    choix: [
      {
        label: 'Repartir avec la colonne',
        effets: { journal: 'Cette nuit, dans la vallée de la Touloubre, je suis {descendu|descendue} dans la brume chercher un homme qui appelait au secours. Il s’appelle Lucien, et il marche avec nous jusqu’au pont.' },
        suivant: '#fin',
      },
    ],
  },

  rv_colonne_3: {
    illu: 'nuit_campagne', musique: 'sombre', orateur: null,
    texte: 'La colonne traverse le fond de la vallée en file, vite, en silence, chacun la main plaquée sur son foulard. Tu passes à vingt mètres de l’homme assis sur la route. Il te voit. Il lève la main vers toi, et il ne dit plus rien.\n\nDe l’autre côté, quand la route remonte dans l’air clair, personne ne parle pendant longtemps.',
    choix: [{ label: 'Continuer', suivant: '#fin' }],
  },

  // ─────────────────────────── Rencontres tirées au hasard (acte V) ───────────────────────────
  // rh_appel_refuge : des survivants qui montent vers le Refuge, appelés par la radio d'Inès.
  rv_appel_refuge: {
    illu: 'plaine_route', musique: 'sombre', orateur: null,
    texte: 'Sur la route, un homme et une femme marchent vers toi en poussant un caddie plein de sacs, avec un petit garçon assis dessus. Ils te voient de loin, et ils lèvent les mains bien haut, paumes ouvertes, comme on le leur a appris à la radio.\n\n« On va à Miramas-le-Vieux, dit l’homme. Au Refuge. Il y a une fille, à la radio, qui dit qu’ils accueillent les survivants. » Il montre le petit poste accroché à la poignée du caddie. « Elle le répète toutes les heures. C’est encore loin ? »',
    choix: [
      {
        label: 'Leur dire que le Refuge est tombé',
        texte: 'Tu leur racontes la porte, la cloche et le feu. La femme met la main sur la bouche. L’homme éteint le poste, très lentement, comme si la voix pouvait l’entendre.\n\n« Et elle, alors ? La fille ? »\n\nTu leur parles de Cornillon, du pont de Mallemort, du mercredi à l’aube. Ils font demi-tour avec toi jusqu’au premier carrefour, puis ils prennent la route du nord.',
        effets: { journal: 'J’ai croisé une famille qui montait vers le Refuge, appelée par la radio d’Inès. Je leur ai dit la vérité, et je les ai envoyés vers le pont de Mallemort.' },
        suivant: 'rv_appel_refuge_fin',
      },
      {
        label: 'Ne rien dire et les laisser passer',
        effets: { journal: 'J’ai croisé une famille qui montait vers le Refuge, appelée par la radio d’Inès. Je ne leur ai rien dit.' },
        suivant: '#fin',
      },
    ],
  },

  rv_appel_refuge_fin: {
    illu: 'plaine_route', musique: 'sombre', orateur: null,
    texte: 'Tu les regardes s’éloigner sur la route du nord, le caddie qui cahote et le petit garçon qui se retourne pour te faire au revoir de la main.\n\nLa radio d’Inès continue d’appeler, quelque part derrière toi. Tant qu’elle parlera, il y en aura d’autres.',
    choix: [{ label: 'Reprendre la route', suivant: '#fin' }],
  },
};
