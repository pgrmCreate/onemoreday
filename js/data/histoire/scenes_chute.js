// ============ ACTE III — « La chute » (nuit du jour 4, quête q_chute) — docs/HISTOIRE.md §6 ============
// Le retour au Refuge assiégé, « Tu le savais », le rempart (mission m_siege), la porte ouverte par Rudy,
// la cloche de Fernand, une seule course possible (l'infirmerie, le donjon, la poterne), puis la fuite avec Inès.
// Format : docs/REFONTE.md §4.5. Genre : {masculin|féminin}. Apostrophe typographique ’ partout.

const EFFETS_CHUTE = { flag: 'refuge_tombe', flags: { fernand_cloche: true }, quete: ['q_chute', 'fuir'] };

export const SCENES_CHUTE = {

  // ─────────────────────────── LE RETOUR ───────────────────────────
  // Déclencheur : entrée au Refuge après la frappe (branche du jour).
  siege_debut: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Hélène',
    texte: 'Le rocher de Miramas-le-Vieux est en vue, et à son pied, la plaine grouille de morts. Des centaines de morts sortent des vergers et des fossés et convergent vers la pente, sans se presser, comme une marée qui monte. Le ciel est jaune-gris de fumée, si bien qu’on ne sait plus très bien quelle heure il est.\n\nVous montez par le sentier de la falaise, le seul côté qu’ils n’ont pas encore atteint, et Yohan vous ouvre la poterne juste assez pour vous laisser passer, en jurant entre ses dents.\n\nDans le village, tout le monde court. On porte des pierres sur les remparts, on remplit des seaux, on cloue des volets sur les fenêtres basses. Hélène est au milieu de la place avec son carnet, et elle envoie chacun à son poste comme elle distribuait les corvées, sans élever la voix.\n\nElle te voit, et pour la première fois depuis que tu la connais, elle a l’air soulagée.\n\n« Vous êtes là. Bien. » Puis, tout de suite : « Les médicaments ? »',
    choix: [
      {
        label: 'Donner les antibiotiques à Bastien',
        si: { objet: 'antibio_veto' },
        effets: { retirer: [['antibio_veto', 1]], flag: 'noa_traitee' },
        texte: 'Bastien est sorti de l’infirmerie en courant. Il prend le flacon de Gérard à deux mains, comme quelque chose qui pourrait s’envoler, il lit l’étiquette, et il repart sans un mot vers le lit de Noa. Par la porte ouverte, tu vois Karine se lever d’un bond.',
        suivant: 'siege_debut_2',
      },
      { label: 'Prendre ton poste', suivant: 'siege_debut_2' },
    ],
  },

  siege_debut_2: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Fernand, puis Hélène',
    texte: 'Fernand a monté derrière toi les marches du rempart. Il regarde la pente noire de morts, puis il se tourne vers Hélène, et il dit, assez fort pour que Rudy l’entende :\n\n« Tu le savais. »\n\nHélène ne répond pas. Elle referme son carnet, elle glisse son crayon derrière l’oreille, et elle continue de distribuer les postes, comme si elle n’avait rien entendu. Rudy, lui, a entendu. Il regarde Hélène longtemps, puis son camion, garé sur la place.\n\n« Yohan et Rudy, la porte. Bastien, l’infirmerie. Malik et Céline, les pierres. Fernand, le clocher : si ça passe, tu sonnes. » Hélène se tourne vers toi. « Toi, le rempart nord, au-dessus de la brèche. C’est par là qu’ils seront les plus nombreux à monter. Tiens deux heures. Après, on verra. »',
    choix: [
      {
        label: 'Monter au rempart',
        effets: {
          flag: 'siege_commence',
          quete: [['q_crau', 'fin'], ['q_chute', 'siege']],
          mission: ['accepter', 'm_siege'],
          teleporter: { lieu: 'miramas_le_vieux', entree: 'poste_breche' },
          journal: 'Le Refuge est assiégé : les morts fuient le feu de la gare et montent vers le rocher. Fernand a dit à Hélène : « Tu le savais. » Elle n’a pas répondu. Je dois tenir le rempart nord, au-dessus de la brèche.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Branche de nuit : jour 4, 19 h. On est au Refuge depuis la nuit ; les familles sont parties à l'aube.
  siege_debut_nuit: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Hélène',
    texte: 'Toute la journée, vous avez regardé la plaine se remplir. Ils sont sortis de la fumée par petits groupes, puis par centaines, et maintenant que la nuit tombe, le pied du rocher est noir de morts qui commencent à monter.\n\nVous avez eu le temps de vous préparer. Les pierres sont empilées sur le rempart, les seaux sont pleins, des volets sont cloués sur les fenêtres basses, et la poterne est barrée. Karine, Noa et les autres sont partis à l’aube par la falaise : si tout va bien, ils sont à la Poudrerie depuis longtemps. Ici, il ne reste que ceux qui peuvent se battre, et sœur Agnès, qui prie dans l’église.\n\nFernand remonte le rempart avec son bâton et s’arrête à côté d’Hélène.\n\n« Tu aurais pu le leur dire à tous, dit-il. Avant. »\n\n« Je sais », répond Hélène. Elle ouvre son carnet. « Yohan et Rudy, la porte. Bastien et Malik, les pierres. Fernand, le clocher : si ça passe, tu sonnes. » Elle se tourne vers toi. « Toi, le rempart nord, au-dessus de la brèche. Tiens deux heures. Après, on verra. »',
    choix: [
      {
        label: 'Monter au rempart',
        effets: {
          flag: 'siege_commence',
          quete: ['q_chute', 'siege'],
          mission: ['accepter', 'm_siege'],
          teleporter: { lieu: 'miramas_le_vieux', entree: 'poste_breche' },
          journal: 'La nuit tombe, et les morts montent à l’assaut du rocher. Les familles sont parties ce matin vers la Poudrerie. Je dois tenir le rempart nord, au-dessus de la brèche.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA PORTE ───────────────────────────
  // Déclencheur : fin de m_siege (siege_tenu), ou 23 h au plus tard.
  chute: {
    illu: 'refuge_nuit', musique: 'combat', orateur: null,
    texte: 'Tu entends le moteur avant de comprendre. C’est un diesel qui tousse, qui cale, qui repart et qui rugit, quelque part derrière toi, sur la place. Des phares s’allument et balaient les façades.\n\nC’est le camion de Rudy.\n\nTu cours au bout du rempart à temps pour le voir dévaler la ruelle vers la porte Notre-Dame, la bâche qui claque, Yohan debout sur le marchepied. Rudy ne freine pas. Le pare-chocs prend les palettes de plein fouet, les tôles volent, les sacs de sable éclatent, la porte s’ouvre en grand dans un fracas de bois et de ferraille, et le camion passe. Il descend la route de Saint-Chamas au milieu des morts, en les fauchant comme des quilles, et ses feux rouges disparaissent dans le premier virage.\n\nDerrière lui, la porte reste ouverte.\n\nPendant une seconde, il ne se passe rien. Puis, sur la pente, les morts tournent la tête vers le trou noir de la porte, tous en même temps, et ils commencent à entrer.',
    choix: [{ label: 'Courir', effets: { cinematique: 'chute' }, suivant: 'chute_2' }],
  },

  chute_2: {
    illu: 'refuge_nuit', musique: 'combat', orateur: 'Fernand',
    texte: 'La cloche de Notre-Dame-de-Beauvezer sonne à toute volée au-dessus du village, et chaque coup te traverse la poitrine.\n\nPar la porte ouverte de l’église, tu vois Fernand pendu à la corde de tout son poids, sa casquette tombée par terre. Il se laisse soulever quand la corde remonte, il retombe, et il tire encore. Entre deux coups, il tourne la tête vers toi.\n\n« Ils viendront tous à moi ! crie-t-il. C’est comme ça qu’on rassemble un troupeau ! Toi, file ! »\n\nDans la ruelle, les morts qui entraient par la porte ont tourné la tête vers le clocher, et ils marchent vers l’église. Ils passent à deux mètres de toi sans te voir, les yeux levés vers le bruit.\n\nTu as une minute, peut-être deux, avant qu’ils ne remarquent autre chose.',
    choix: [{ label: 'Le laisser sonner', suivant: 'chute_choix' }],
  },

  chute_choix: {
    illu: 'refuge_nuit', musique: 'combat', orateur: null,
    timerMs: 15000,
    texte: 'Le village se remplit de morts, et le son de la cloche les attire tous vers la place de l’église. Ils vont bloquer les ruelles. Tu n’as le temps de passer qu’à un seul endroit avant de fuir, et tu n’as pas le temps de réfléchir.\n\nLa poterne est au sud, dans le rempart, et c’est par là qu’on sort. L’infirmerie est sur le chemin, juste avant, mais il faudra s’y arrêter. Le donjon, lui, est à l’est, tout en haut du rocher, à l’opposé de la poterne, et sa fenêtre est encore éclairée.',
    choix: [
      {
        label: 'Courir à l’infirmerie : Karine et Noa',
        si: { pasFlag: 'familles_parties' },
        effets: { ...EFFETS_CHUTE, journal: 'Rudy a ouvert la porte Notre-Dame pour fuir avec son camion, et les morts sont entrés. Fernand sonne la cloche pour les attirer tous à lui. Je cours à l’infirmerie chercher Karine et Noa, puis à la poterne, au sud du village.' },
        suivant: '#fin',
      },
      {
        label: 'Monter au donjon chercher Hélène',
        effets: { ...EFFETS_CHUTE, journal: 'Rudy a ouvert la porte Notre-Dame pour fuir avec son camion, et les morts sont entrés. Fernand sonne la cloche pour les attirer tous à lui. Je monte au donjon chercher Hélène, puis je file à la poterne, au sud du village.' },
        suivant: '#fin',
      },
      {
        label: 'Courir à la poterne',
        effets: { ...EFFETS_CHUTE, journal: 'Rudy a ouvert la porte Notre-Dame pour fuir avec son camion, et les morts sont entrés. Fernand sonne la cloche pour les attirer tous à lui. Je cours à la poterne, au sud du village.' },
        suivant: '#fin',
      },
    ],
    timeout: {
      effets: { ...EFFETS_CHUTE, journal: 'Rudy a ouvert la porte Notre-Dame pour fuir avec son camion, et les morts sont entrés. Fernand sonne la cloche pour les attirer tous à lui. Mes jambes ont choisi pour moi : la poterne, au sud du village.' },
      suivant: 'chute_fige',
    },
  },

  chute_fige: {
    illu: 'refuge_nuit', musique: 'combat', orateur: null,
    texte: 'Tu restes {figé|figée} une seconde de trop, à regarder la porte de l’église et la corde qui monte et qui descend. Puis un mort te frôle l’épaule en passant, et tes jambes décident pour toi : tu cours vers le sud, vers la poterne.',
    choix: [{ label: 'Courir', suivant: '#fin' }],
  },

  // Marqueur 'infirmerie'.
  chute_infirmerie: {
    illu: 'refuge_nuit', musique: 'tension', orateur: 'Karine',
    texte: 'L’infirmerie est plongée dans le noir. Tu entends d’abord une respiration sifflante, puis un froissement de couverture.\n\n« C’est toi. » Karine est accroupie entre deux lits de camp, Noa enroulée dans une couverture contre sa poitrine, et elle tient un couteau à pain dans l’autre main. « Bastien est parti vers la porte aider les autres. Il a dit de ne pas bouger. Il n’est pas revenu. »\n\nDehors, la cloche sonne toujours, et des pas traînent le long du mur, nombreux.\n\nKarine se lève. Elle ne te demande rien. Elle remonte la couverture sur la tête de sa fille, très doucement, et elle lui parle à l’oreille, d’une voix que tu ne lui connaissais pas, basse et tendre :\n\n« On va faire un jeu, ma puce. On ferme les yeux, et on ne tousse pas. D’accord ? On ne tousse pas du tout, même si ça gratte. »\n\nPuis elle se tourne vers toi, et sa voix redevient sèche.\n\n« Passe devant. Je te suis. »',
    choix: [
      {
        label: 'Ouvrir la marche vers la poterne',
        effets: { flag: 'noa_avec', journal: 'J’ai trouvé Karine et Noa dans l’infirmerie. Bastien était parti vers la porte aider les autres. Elles me suivent vers la poterne.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'radio_helene' (le donjon).
  chute_helene: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: 'La porte du donjon n’est pas fermée. Hélène est assise à sa table, sous une lampe de poche accrochée au plafond, le combiné du poste militaire contre l’oreille. Elle a mis ses lunettes, et elle parle de sa voix ordinaire, nette, comme si elle dictait un compte rendu de réunion.\n\n« PC Durance, ici Beauvezer. Le Refuge est tombé. Je répète : le Refuge est tombé. La porte Notre-Dame a été ouverte de l’intérieur il y a dix minutes. » Un grésillement lui répond. « Je ne sais pas. Quelques-uns, par la poterne, je pense. » Elle écoute. « Oui. Je maintiens la modification de la liste. Mot pour mot. »\n\nElle te voit enfin, dans l’encadrement de la porte, et elle pose le combiné sans raccrocher.\n\n« Qu’est-ce que tu fais là ? La poterne est en bas. »\n\nTu lui dis de venir. Elle secoue la tête.\n\n« Quelqu’un doit leur dire ce qui se passe, jusqu’au bout, pour qu’ils sachent qui attendre au pont. Et je ne cours plus très vite. » Elle montre l’escalier, où montent déjà des bruits de pas. « Va. »',
    choix: [
      { label: 'L’attraper par le bras et l’emmener', suivant: 'chute_helene_2' },
      {
        label: 'La laisser à sa radio',
        effets: { flag: 'helene_restee', flags: { helene_vue_chute: true } },
        suivant: 'chute_helene_adieu',
      },
    ],
  },

  chute_helene_2: {
    illu: 'refuge_donjon', musique: 'tension', orateur: 'Hélène',
    texte: 'Tu l’attrapes par le bras, et sous le gilet, tu sens un bras maigre et dur comme un bâton. Elle se raidit, et pendant une seconde, tu crois qu’elle va te gifler.\n\nPuis quelque chose cède dans son visage.\n\n« Pas par la poterne, dit-elle. Le bruit va les attirer jusque-là. » Elle décroche du mur une corde enroulée que tu n’avais jamais remarquée, et elle ouvre la fenêtre du donjon. Derrière, il n’y a que le vide et les rochers éclairés par le feu. « Côté est, il y a une vire et un chemin de chèvres. Je le prenais à quinze ans pour aller fumer en cachette avec Fernand. Je le connais par cœur. »\n\nElle noue la corde au montant de la fenêtre et l’enjambe avec une raideur de vieille dame. Elle te regarde une dernière fois par-dessus ses lunettes.\n\n« Va. Je vous retrouverai au pont. Ne m’attendez pas à la Poudrerie. »\n\nElle disparaît dans le noir.',
    choix: [
      {
        label: 'Redescendre vers la poterne',
        effets: {
          flag: 'helene_sauvee', flags: { helene_vue_chute: true },
          journal: 'Hélène ne voulait pas quitter sa radio. Je l’ai prise par le bras, et elle a fini par céder : elle est descendue par la fenêtre du donjon et les rochers de l’est, par un chemin de chèvres qu’elle connaît depuis l’enfance. « Je vous retrouverai au pont. »',
        },
        suivant: '#fin',
      },
    ],
  },

  chute_helene_adieu: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: 'Hélène hoche la tête, comme si tu venais de répondre juste à une question difficile. Elle reprend le combiné.\n\n« En bas, ouvre l’enveloppe, ou relis-la, dit-elle encore. Tout y est : où aller, quand, et le mot à dire. »\n\nTu redescends l’escalier en courant. Derrière toi, au-dessus des pas et de la cloche, tu entends sa voix qui continue, calme, précise, jusqu’au bout : « PC Durance, ici Beauvezer… »',
    choix: [
      {
        label: 'Courir vers la poterne',
        effets: { journal: 'J’ai laissé Hélène à sa radio, dans le donjon. Elle voulait que quelqu’un dise à l’armée ce qui se passait, jusqu’au bout. Ses derniers mots : « Tout est dans l’enveloppe. »' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA POTERNE ───────────────────────────
  // Marqueur 'poterne' (au sud du village).
  chute_poterne: {
    illu: 'refuge_nuit', musique: 'sombre', orateur: 'Inès',
    texte: 'La poterne est une petite porte basse au bout de la ruelle des remparts, si étroite qu’il faut se baisser pour la passer. Quelqu’un a déjà retiré la barre. Devant, une silhouette t’attend, accroupie contre le mur, avec un gros sac à dos d’où dépasse une antenne repliée.\n\n« T’en as mis, du temps », souffle Inès. Elle a son casque autour du cou, et sur la manche de son sweat, du sang qui n’est pas le sien. Elle a la voix moqueuse, comme toujours, mais elle tremble. « J’ai attendu. Je savais pas qui viendrait. J’espérais que quelqu’un viendrait. »\n\nDerrière vous, la cloche sonne toujours. Puis elle s’interrompt brusquement, au milieu d’une volée.\n\nLe silence tombe sur le village. Inès ferme les yeux.\n\n« Fernand », dit-elle, et ce n’est pas une question.\n\nDans les ruelles, les morts qui se pressaient vers l’église s’arrêtent tous ensemble, et ils se mettent à tourner la tête, lentement, à la recherche d’un autre bruit.\n\nInès renifle et remonte son sac sur ses épaules. « Hélène m’a dit, hier : si un jour ça tombe, on descend à la Poudrerie de Saint-Chamas, à la maison du gardien, et on attend. » Elle laisse échapper un petit rire entre deux sanglots. « Elle avait prévu ça aussi. Elle prévoyait tout. »',
    choix: [
      {
        label: 'Descendre le sentier avec Karine et Noa',
        si: { flag: 'noa_avec' },
        effets: {
          flag: 'refuge_fui',
          quete: [['q_chute', 'fin'], ['q_brume', 'poudrerie']],
          voyage: { vers: 'saint_chamas', indication: true },
          journal: 'Le Refuge est tombé. Fernand a sonné la cloche jusqu’au bout pour attirer les morts, puis elle s’est tue. Je suis {sorti|sortie} par la poterne avec Inès, Karine et Noa. Nous descendons vers la Poudrerie de Saint-Chamas, au bord de l’étang, comme Hélène l’avait prévu.',
        },
        suivant: '#fin',
      },
      {
        label: 'Descendre le sentier de la falaise',
        si: { pasFlag: 'noa_avec' },
        effets: {
          flag: 'refuge_fui',
          quete: [['q_chute', 'fin'], ['q_brume', 'poudrerie']],
          voyage: { vers: 'saint_chamas', indication: true },
          journal: 'Le Refuge est tombé. Fernand a sonné la cloche jusqu’au bout pour attirer les morts, puis elle s’est tue. Je suis {sorti|sortie} par la poterne avec Inès. Nous descendons vers la Poudrerie de Saint-Chamas, au bord de l’étang, comme Hélène l’avait prévu.',
        },
        suivant: '#fin',
      },
    ],
  },
};
