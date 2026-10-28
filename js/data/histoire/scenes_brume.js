// ============ ACTE IV — « La brume » (jours 5 et 6, quête q_brume) — docs/HISTOIRE.md §6 ============
// La Poudrerie de Saint-Chamas (qui est là dépend de la chute), l'enveloppe enfin ouverte, l'attente,
// l'odeur d'eau de Javel (le danger dit avant d'être appliqué, P10), la brume qui sort de l'étang,
// la montée à Cornillon-Confoux, la mer jaune à l'aube et la radio du PC Durance : le pont.
// Menus d'Inès, de Karine, de Bastien et de Rudy : scenes_pnj.js.
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.

const FIN_ATTENTE = {
  quete: ['q_brume', 'attendre'], flag: 'poudrerie_arrivee',
  journal: 'Nous sommes à la Poudrerie de Saint-Chamas, dans la maison du gardien. Hélène a dit d’attendre deux jours ceux qui sortiraient du Refuge. Il faut manger, boire (l’eau du canal est douce, mais il faut la faire bouillir) et dormir.',
};

export const SCENES_BRUME = {

  // ─────────────────────────── LA POUDRERIE ───────────────────────────
  // Déclencheur : entrée dans saint_chamas pendant q_brume.poudrerie. Trois choix complémentaires.
  pou_arrivee: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: null,
    texte: 'Vous arrivez à la Poudrerie de Saint-Chamas trempés de rosée, les jambes en coton, avec l’odeur du village brûlé encore accrochée à vos vêtements.\n\nC’est un grand parc au bord de l’étang, fermé par un mur, où les ruines de l’ancienne fabrique de poudre disparaissent sous les arbres : des platanes immenses, des pins, des roseaux, et des bâtiments de pierre sans toit envahis par le lierre. Un petit canal coule sous les arbres jusqu’à l’étang. L’eau de l’étang est grise et lisse comme une plaque de zinc, et de l’autre côté, très loin, tu devines les cuves blanches de Berre.\n\nLa maison du gardien est à l’entrée du parc. C’est une maison basse aux volets verts, avec un potager retourné par les sangliers.',
    choix: [
      { label: 'Frapper à la maison du gardien', si: { flag: 'familles_parties' }, suivant: 'pou_familles' },
      { label: 'Entrer dans la maison du gardien', si: { flag: 'noa_avec' }, suivant: 'pou_noa' },
      { label: 'Entrer dans la maison du gardien', si: { pasFlag: ['familles_parties', 'noa_avec'] }, suivant: 'pou_seuls' },
    ],
  },

  // Les familles sont parties à l'aube du jour 4 par la poterne (branche de nuit).
  pou_familles: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Karine',
    texte: 'La porte s’ouvre avant que tu frappes. Céline est derrière, un tisonnier à la main, et quand elle te reconnaît, elle le laisse tomber.\n\nIls sont tous là, dans la grande pièce de la maison du gardien : Karine assise par terre contre le mur, avec Noa endormie sur ses genoux, Théo roulé dans un rideau, Paul et Josette sur le canapé, une couverture sur les jambes. Ils sont arrivés au lever du jour, avant le feu, et ils attendent depuis. Ils ont vu le village brûler de l’autre côté de la colline. Ils ont entendu la cloche une partie de la nuit, et puis plus rien.\n\nPersonne ne demande ce que sont devenus les autres. Ils regardent seulement qui entre derrière toi : Inès, et personne d’autre.\n\nJosette se met à pleurer sans bruit, la main de Paul serrée dans les siennes. Karine ne pleure pas. Elle serre sa fille un peu plus fort, et elle demande :\n\n« Fernand ? »\n\nTu secoues la tête. Karine ferme les yeux, une seconde, et elle les rouvre.\n\n« Assieds-toi. Il reste du café. Enfin, ce que Céline appelle du café. »',
    choix: [
      {
        label: 'Donner les antibiotiques à Karine pour Noa',
        si: { objet: 'antibio_veto', pasFlag: 'noa_traitee' },
        effets: { retirer: [['antibio_veto', 1]], flag: 'noa_traitee' },
        texte: 'Karine prend le flacon et le regarde comme si elle ne croyait pas qu’il existe. Puis elle sort une seringue de sa poche, celle que Bastien lui a donnée au cas où, et elle fait la piqûre elle-même, d’une main qui ne tremble pas.\n\n« Fernand a dit combien ? » Tu lui répètes la dose. Elle hoche la tête. « Merci », dit-elle, et c’est la première fois.',
        suivant: 'pou_attente',
      },
      { label: 'T’asseoir avec eux', suivant: 'pou_attente' },
    ],
  },

  // Karine et Noa sont sorties avec toi par la poterne.
  pou_noa: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: null,
    texte: 'La maison du gardien est vide. Quelqu’un est passé avant vous, il y a longtemps : les placards sont ouverts et les matelas éventrés, mais la porte ferme, et il reste du bois sec sous l’évier.\n\nKarine couche Noa sur le canapé, sous toutes les couvertures qu’elle trouve, et elle s’assoit par terre à côté d’elle sans lâcher sa main. Pendant toute la descente, la petite n’a pas toussé une seule fois : elle a joué le jeu jusqu’au bout. Maintenant, elle tousse à s’en déchirer la poitrine, et Karine lui caresse les cheveux en lui disant qu’elle a gagné.\n\nPersonne d’autre n’est là, et personne d’autre n’arrive.',
    choix: [
      {
        label: 'Donner les antibiotiques à Karine pour Noa',
        si: { objet: 'antibio_veto', pasFlag: 'noa_traitee' },
        effets: { retirer: [['antibio_veto', 1]], flag: 'noa_traitee' },
        texte: 'Karine prend le flacon et le regarde comme si elle ne croyait pas qu’il existe. Puis elle sort une seringue de sa poche, celle que Bastien lui a donnée au cas où, et elle fait la piqûre elle-même, d’une main qui ne tremble pas.\n\n« Fernand a dit combien ? » Tu lui répètes la dose. Elle hoche la tête. « Merci », dit-elle, et c’est la première fois.',
        suivant: 'pou_attente',
      },
      { label: 'T’asseoir près de la fenêtre', suivant: 'pou_attente' },
    ],
  },

  // Personne d'autre.
  pou_seuls: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'La maison du gardien est vide. Quelqu’un est passé avant vous, il y a longtemps : les placards sont ouverts et les matelas éventrés, mais la porte ferme, et il reste du bois sec sous l’évier.\n\nInès fait le tour des pièces en appelant à voix basse : « Karine ? Céline ? Il y a quelqu’un ? » Personne ne répond. Elle revient s’asseoir sur la dernière marche de l’escalier, son sac entre les genoux.\n\n« Hélène a dit d’attendre deux jours, dit-elle. Alors on attend deux jours. »',
    choix: [{ label: 'T’asseoir près d’elle', suivant: 'pou_attente' }],
  },

  pou_attente: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'Plus tard, Inès vient s’asseoir en face de toi, à la table de la cuisine du gardien. Elle regarde ton sac. Tout le monde au Refuge savait qu’Hélène t’avait donné quelque chose avant ton départ pour la Crau.\n\n« Hélène t’a donné une lettre, dit-elle. Le Refuge est tombé. Si tu ne l’as pas encore ouverte, tu peux l’ouvrir sans trahir ta promesse. Et si tu l’as déjà lue, je veux savoir ce qu’il y a dedans. »',
    choix: [
      { label: 'Ouvrir l’enveloppe', si: { pasFlag: 'enveloppe_ouverte' }, effets: { document: 'doc_lettre_helene', flag: 'enveloppe_ouverte' }, suivant: 'pou_enveloppe' },
      { label: 'Lui tendre la lettre', si: { flag: 'enveloppe_ouverte' }, suivant: 'pou_enveloppe_lue' },
    ],
  },

  pou_enveloppe: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'Tu déchires l’enveloppe. Inès a fait le tour de la table pour lire par-dessus ton épaule, et tu sens son souffle s’arrêter à la troisième ligne.\n\nHélène savait. Le soir même de ton arrivée, une lieutenante de l’armée, au PC Durance, l’a prévenue sur une radio cachée dans le donjon : l’armée allait bombarder la gare de triage de Miramas soixante heures plus tard, et il y avait du chlore dans les wagons. On lui a dit d’évacuer vers l’est. Elle a choisi de rester derrière les murs, avec une enfant malade et deux vieillards, et elle t’a {envoyé|envoyée} au loin avec Fernand, parce que vous saviez survivre dehors, au cas où le Refuge tomberait.\n\nElle te dit quoi faire : attendre ici deux jours, pas plus, puis aller au pont suspendu de Mallemort, sur la Durance, que l’armée ouvrira aux civils le mercredi 7 octobre à l’aube, pendant une heure. À la ligne de contrôle, il faudra donner le mot du Refuge : Beauvezer. Et à la fin, elle te demande de prendre soin d’Inès.\n\nQuand tu as fini, Inès se redresse. Elle va jusqu’à la fenêtre et elle regarde l’étang longtemps.\n\n« Soixante heures, dit-elle enfin. Elle savait depuis le premier soir. Et pendant soixante heures, elle m’a laissée lire mon message à la radio pour dire aux gens de venir. » Elle se retourne. Elle a les yeux secs, très brillants. « Et elle te demande de prendre soin de moi. Elle est vraiment très forte. »',
    choix: [{ label: 'Te reposer', effets: FIN_ATTENTE, suivant: '#fin' }],
  },

  pou_enveloppe_lue: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès lit la lettre d’Hélène debout, près de la fenêtre, en tenant les deux feuilles à deux mains. Tu la vois relire certaines lignes deux fois, puis trois.\n\nQuand elle a fini, elle replie les feuilles avec soin et te les rend.\n\n« Soixante heures, dit-elle. Elle savait depuis le premier soir. Et pendant soixante heures, elle m’a laissée lire mon message à la radio pour dire aux gens de venir. » Elle a les yeux secs, très brillants. « Et elle te demande de prendre soin de moi. Elle est vraiment très forte. »\n\nElle regarde l’étang, gris et immobile.\n\n« Deux jours ici, et après, le pont de Mallemort. D’accord. On fera comme elle a dit. Mais c’est la dernière fois. »',
    choix: [{ label: 'Te reposer', effets: FIN_ATTENTE, suivant: '#fin' }],
  },

  // ─────────────────────────── L'ATTENTE ───────────────────────────
  // Déclencheur : jour 5, 14 h, à la Poudrerie.
  pou_jour: {
    illu: 'poudrerie_parc', musique: 'calme', orateur: 'Inès',
    texte: 'L’après-midi passe sans que personne d’autre arrive. Le parc est si calme qu’on entend les carpes sauter dans le canal.\n\nInès a passé la matinée sur le toit de la maison du gardien, à tendre un fil de cuivre entre la cheminée et un platane avec du chatterton, en jurant contre le monde entier. Vers deux heures, elle redescend, s’assoit sur la marche, et elle tourne la molette de son poste en fronçant les sourcils.\n\nEntre deux sifflements, la voix lointaine d’un militaire se fait entendre par bribes : « … zone de Miramas… épisode… cette nuit… restez… vent faible… » Puis il ne reste que des grésillements.\n\n« Restez quoi ? » demande Inès au poste. « Restez quoi, espèce de… »\n\nElle l’éteint pour économiser les piles.',
    choix: [
      {
        label: 'Profiter de la journée',
        effets: { journal: 'Personne d’autre n’est arrivé à la Poudrerie. Inès a monté une antenne sur le toit. La radio de l’armée parle de Miramas, de la nuit, du vent faible, mais le message est coupé.' },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 5, 20 h. Le danger est dit avant d'être appliqué (P10).
  pou_odeur: {
    illu: 'etang_nuit', musique: 'tension', orateur: 'Inès',
    texte: 'Le soleil se couche derrière la Crau, et le vent tombe d’un coup, comme on ferme une porte. L’étang devient lisse comme un miroir.\n\nC’est Inès qui sent l’odeur la première. Elle lève le nez, comme un chien.\n\n« Tu sens ? »\n\nTu la sens aussi : une odeur légère de piscine, d’eau de Javel, qui monte de l’étang avec l’humidité du soir. Inès se met à tousser, une petite toux sèche qui ne s’arrête plus.\n\nElle trempe deux foulards dans le seau d’eau du canal, les essore, et t’en lance un.\n\n« C’est le truc jaune de la gare. Il est là, quelque part au-dessus de l’eau. » Elle noue le sien sur son nez. « Écoute-moi bien, parce que la radio l’a dit tout à l’heure et que je viens seulement de comprendre. C’est lourd, ça reste en bas, au ras de l’eau et dans les creux, et la nuit, quand il n’y a pas de vent, ça s’étale. Ça brûle les yeux et les poumons. Le foulard mouillé, ça aide, mais pas beaucoup. Il faut être en hauteur, ou au moins à l’étage. Et surtout, on ne dort pas dedans : les gens qui dorment dedans ne se réveillent pas. »\n\nElle regarde l’escalier de la maison du gardien, puis le parc, puis toi.\n\n« L’étage n’est qu’à trois mètres du sol. Je ne sais pas si ça suffira. »',
    choix: [
      {
        label: 'Nouer le foulard mouillé',
        effets: {
          objet: ['foulard_mouille', 1],
          journal: 'Le soir, une odeur d’eau de Javel monte de l’étang. Inès dit que la brume jaune va venir : elle reste en bas, s’étale la nuit quand il n’y a pas de vent, et brûle les yeux et les poumons. Un foulard mouillé sur le nez aide un peu. Il faut se mettre en hauteur, au moins à l’étage, et ne jamais dormir dedans.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 5, 22 h.
  pou_brume: {
    illu: 'etang_nuit', musique: 'tension', orateur: null,
    texte: 'Vers dix heures, Inès te secoue. Elle est à la fenêtre de l’étage, le foulard sur le nez, et elle ne dit rien : elle te montre l’étang du doigt.',
    choix: [{ label: 'Regarder', effets: { cinematique: 'brume' }, suivant: 'pou_brume_2' }],
  },

  pou_brume_2: {
    illu: 'poudrerie_brume', musique: 'tension', orateur: 'Inès',
    texte: 'La brume est sortie de l’étang. Elle a d’abord couvert la grève, puis les roseaux, et maintenant elle entre dans le parc, entre les platanes, épaisse et jaune sous la lune, à hauteur d’homme. Elle coule autour des ruines comme une eau qui monterait. Le canal a disparu, le potager aussi, et elle touche déjà le bas des volets.\n\nEt dans la brume, quelque chose marche. Tu en vois un, puis trois, puis tu arrêtes de compter : des morts sortent de l’étang, de la vase et des roseaux, et ils traversent le parc sans un bruit, sans un grognement, comme si la brume avalait tous les sons. Ils ne toussent pas. Ils ne respirent presque plus.\n\nDerrière toi, quelqu’un tousse dans la maison, et tu entends la brume siffler doucement sous la porte d’entrée.\n\nInès a les larmes qui coulent sous son foulard, à cause du chlore ou d’autre chose.\n\n« On ne peut pas rester. » Elle montre une colline noire, de l’autre côté de la route, avec quelques toits et un clocher au sommet. « Là-haut, c’est Cornillon, le village perché. Trois kilomètres, et ça monte tout le temps. Le jaune n’arrivera pas jusque-là. Il faut partir maintenant, tous. »',
    choix: [
      {
        label: 'Monter à Cornillon',
        effets: {
          flag: 'brume_vue',
          quete: ['q_brume', 'fuir'],
          voyage: { vers: 'cornillon', indication: true },
          journal: 'La brume jaune est sortie de l’étang et a noyé le parc de la Poudrerie. Des morts marchent dedans sans un bruit. Nous montons à Cornillon-Confoux, le village perché, à trois kilomètres : là-haut, elle n’arrivera pas.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── CORNILLON ───────────────────────────
  // Déclencheur : entrée dans cornillon pendant q_brume.fuir.
  cor_arrivee: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Cornillon-Confoux est un village de crête : une seule rue de maisons de pierre serrées autour d’une petite église, Saint-Vincent, au sommet d’une colline couverte de pins. Vous y arrivez au milieu de la nuit, à bout de souffle, les yeux en feu, et vous vous retournez au bord du belvédère.\n\nEn bas, la brume a tout recouvert. Elle remplit la plaine d’un bord à l’autre, comme une mer jaune et immobile sous la lune, et le village flotte au-dessus, au sec, dans un air froid et propre qui sent le pin. Tu respires à fond pour la première fois depuis des heures, et tu tousses longtemps.\n\nLe village est vide. Les portes et les volets sont fermés, sauf ceux d’une maison près de l’église, dont la fenêtre donne sur la plaine. Inès pousse la porte, qui n’est pas verrouillée. C’est la maison du guetteur : il est là, assis devant sa fenêtre, mort depuis des jours, ses jumelles sur les genoux, avec un cahier ouvert sur la table.\n\nInès referme doucement la porte de sa chambre, et elle ressort.\n\n« On ne dort pas chez lui. » Elle montre la maison voisine, sur la petite placette, avec une porte solide et des volets clos. « Celle-là. Il n’y a qu’une entrée, et la porte ferme bien. »',
    choix: [
      {
        label: 'Dormir enfin',
        effets: {
          flag: 'cornillon_arrivee',
          quete: ['q_brume', 'fin'],
          journal: 'Nous sommes à Cornillon-Confoux, au-dessus de la brume. En bas, la plaine est noyée sous une mer jaune. Le village est vide ; le guetteur est mort à sa fenêtre, et son cahier est resté ouvert sur la table.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : jour 6, 7 h.
  cor_aube: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Au matin, c’est Inès qui te réveille, les cheveux en bataille, son poste radio serré contre la poitrine.\n\n« Viens voir. Il faut que tu voies ça. Et j’ai quelqu’un à la radio. J’ai le PC Durance ! »',
    choix: [{ label: 'Sortir sur le belvédère', effets: { cinematique: 'cornillon_aube' }, suivant: 'cor_aube_2' }],
  },

  cor_aube_2: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Inès pose son poste sur le muret du belvédère, monte le son, et elle tend l’antenne à bout de bras vers le nord, comme une offrande. Une voix de femme sort du haut-parleur, calme, posée, un peu métallique. Elle lit un bulletin, puis elle le relit, pour ceux qui n’auraient pas eu le temps de noter.\n\n« Ici le PC Durance. Message à toutes les personnes présentes au sud de la Durance. Le nuage observé depuis samedi sur la plaine de la Crau et les bords de l’étang de Berre est composé de chlore, libéré par la destruction de wagons-citernes en gare de Miramas. Le chlore est plus lourd que l’air. Il se disperse le jour, avec le vent et la pluie, et il s’accumule la nuit dans les zones basses. Restez en hauteur la nuit. Ne dormez pas en plaine. Un linge mouillé sur le visage réduit l’exposition. Les civils recensés pourront franchir la Durance par le pont suspendu de Mallemort le mercredi 7 octobre, de six heures à sept heures. Une dernière ouverture aura lieu le mercredi 14 octobre, aux mêmes heures. Présentez-vous à la ligne de contrôle, à deux cents mètres du pont, avec le mot de votre refuge. Les personnes mordues ne seront pas admises. Fin du message. »\n\nInès baisse l’antenne.\n\n« C’est elle, dit-elle. Une nuit, au Refuge, j’avais capté par hasard une femme de l’armée qui parlait avec quelqu’un sur une fréquence bizarre. Son interlocutrice disait « Beauvezer ». J’avais cru que c’était un code. » Elle a un rire bref. « C’était Hélène. »\n\nPuis elle sort de son sac une carte routière toute neuve, qu’elle a trouvée dans un tiroir du guetteur, et elle la déplie sur le muret. Mallemort est au nord, au bout du pays salonais, sur la Durance, à une vingtaine de kilomètres à vol d’oiseau par la Crau, les collines ou les routes. Le mercredi 7 octobre, c’est dans neuf jours.\n\n« Cornillon, c’est notre base, dit Inès. Ici, le jaune ne monte pas. On mange, on dort, on cherche ceux qui manquent, et on part d’ici le mardi 6 au soir, pour être au pont à l’aube. » Elle replie la carte et te la met dans les mains. « Moi, je ne bouge pas d’ici : il faut quelqu’un pour garder la radio. Toi, tu vas chercher les autres. »',
    choix: [
      {
        label: 'Demander où chercher les autres',
        effets: {
          flag: 'pont_annonce',
          quete: [['q_pont', 'preparer'], ['q_bastien', 'debut'], ['q_rudy', 'debut']],
          objet: ['carte_routiere', 1],
          decouvrir: ['mallemort', 'istres', 'grans', 'lancon', 'miramas', 'saint_chamas', 'cornillon', 'miramas_le_vieux'],
          journal: 'La radio du PC Durance confirme : la brume jaune, c’est du chlore, sorti des wagons de la gare de Miramas. Il se disperse le jour avec le vent et la pluie, et il s’amasse la nuit dans les terres basses : la nuit, rester en hauteur. Le pont suspendu de Mallemort ouvrira aux civils recensés le mercredi 7 octobre, de 6 h à 7 h, et une dernière fois le mercredi 14. Cornillon est notre base ; nous partirons d’ici le mardi 6 au soir.',
        },
        suivant: 'cor_aube_3',
      },
    ],
  },

  // Qui manque ? Choix complémentaires selon le sort de Karine et Noa.
  cor_aube_3: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Inès compte sur ses doigts, comme Hélène le faisait. Elle s’en rend compte, elle fronce les sourcils, et elle continue quand même.\n\n« Bastien, il parlait tout le temps de sa sœur, à Istres. S’il est sorti, c’est là qu’il est allé. » Elle replie un deuxième doigt. « Rudy, il voulait prendre l’autoroute à Lançon, il l’a dit cent fois. Avec ce qui lui restait de gasoil, il n’a pas pu aller beaucoup plus loin que le péage. Si tu le trouves… » Elle ne finit pas sa phrase.',
    choix: [
      { label: 'Demander ce que sont devenues Karine et Noa', si: { pasFlag: ['noa_avec', 'familles_parties'] }, effets: { quete: ['q_karine', 'debut'] }, suivant: 'cor_aube_karine' },
      {
        label: 'Aller voir Karine et Noa',
        si: { ou: [{ flag: 'noa_avec' }, { flag: 'familles_parties' }] },
        effets: { flag: 'famille_cornillon', journal: 'Ceux qui manquent : Bastien est peut-être chez sa sœur, à Istres. Rudy a dû tomber en panne au péage de Lançon. Karine et Noa sont ici, à Cornillon, avec nous.' },
        suivant: '#fin',
      },
    ],
  },

  cor_aube_karine: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Inès',
    texte: '« Karine ? » Inès réfléchit. « Si elle est sortie, elle aura cherché l’endroit le plus proche où elle connaissait quelqu’un, avec la petite sur le dos. Elle parlait d’Édouard, un vieux meunier de Grans qui livrait la farine à sa boulangerie de Miramas, et de son moulin au bord de la Touloubre. C’est le seul endroit dont elle parlait comme si elle y était chez elle. »\n\nElle regarde la plaine jaune, en bas, qui commence à pâlir au soleil.\n\n« Noa a besoin d’antibiotiques. Si tu en trouves, garde-les pour elle, même si tu as de la fièvre. »',
    choix: [
      {
        label: 'Noter où chercher Karine et Noa',
        effets: { journal: 'Ceux qui manquent : Bastien est peut-être chez sa sœur, à Istres. Rudy a dû tomber en panne au péage de Lançon. Karine et Noa se sont peut-être cachées chez Édouard, un vieux meunier de Grans, au bord de la Touloubre ; Noa a besoin d’antibiotiques.' },
        suivant: '#fin',
      },
    ],
  },
};
