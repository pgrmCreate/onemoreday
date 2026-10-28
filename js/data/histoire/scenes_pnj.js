// ============ Dialogues « à sujets » des PNJ (voir pnj.js, docs/HISTOIRE.md §5) ============
// Chaque PNJ ouvre une scène-menu : texte d'accueil court + sujets conditionnels (si:) + « Partir ».
// Les sujets renvoient vers une réponse courte, qui revient au menu ('#fin' pour quitter).
// Voix : Hélène sobre et précise, Fernand sec et drôle, Inès ironique, Bastien doux et inquiet,
// Rudy brutal, Karine sèche (sauf avec Noa).
// Plus : aime_cache (la boîte d'Aimé, mission m_aime) et emp_grille (la grille du château de l'Empéri).

const PARTIR = { label: 'Partir', suivant: '#fin' };
const retour = (menu) => ({ label: 'Parler d’autre chose', suivant: menu });
const VUE = { flag: 'helene_radio_vue' };
const PLANCHES = { quete: ['q_refuge', 'corvees'], pasFlag: 'breche_fermee' };

export const SCENES_PNJ = {

  // ═══════════════════════════ ACTE I — LE REFUGE ═══════════════════════════

  // ─────────── HÉLÈNE ───────────
  helene_parler: {
    illu: 'refuge_donjon', musique: 'calme', orateur: 'Hélène',
    texte: 'Hélène lève les yeux de son carnet. Elle ne sourit pas, mais elle t’écoute vraiment, comme si elle allait noter ce que tu vas dire.',
    choix: [
      { label: 'Demander où trouver des planches', si: PLANCHES, suivant: 'helene_planches' },
      { label: 'Lui demander ce qu’elle note dans son carnet', suivant: 'helene_carnet' },
      { label: 'Lui demander comment le Refuge a commencé', suivant: 'helene_debut' },
      { label: 'Lui parler de la lumière au donjon, cette nuit', si: VUE, suivant: 'helene_radio' },
      PARTIR,
    ],
  },
  helene_planches: {
    illu: 'refuge_donjon', musique: 'calme', orateur: 'Hélène',
    texte: '« Dans le bas du village, derrière la barrière, au sud-est de la place. Il y a trois bâtiments que personne n’a vidés : la maison du bas, la maison du forgeron et la remise. On y trouvera des planches, et des clous chez le forgeron. » Elle baisse la voix. « Il y a peut-être encore quelqu’un, en bas. Les Aubert ne sont jamais partis, je crois. Si tu les trouves, ne les appelle pas par leur nom. Ça ne sert à rien, et ça fait mal. »',
    choix: [retour('helene_parler')],
  },
  helene_carnet: {
    illu: 'refuge_donjon', musique: 'calme', orateur: 'Hélène',
    texte: '« Tout. L’eau qu’on boit, au litre près. Les conserves, à la boîte près. Les tours de garde, les températures du soir. » Elle tourne quelques pages couvertes de colonnes serrées. « Et les noms. Quand on compte les gens tous les soirs, on ne peut plus faire semblant de ne pas en avoir perdu un. »',
    choix: [retour('helene_parler')],
  },
  helene_debut: {
    illu: 'refuge_donjon', musique: 'calme', orateur: 'Hélène',
    texte: '« Le lendemain du marché, j’étais à la mairie de Miramas, avec des écoles à fermer et des parents qui hurlaient au téléphone. Le samedi, je suis montée ici, où je suis née, et j’ai trouvé onze personnes qui ne savaient pas quoi faire. » Elle ôte ses lunettes. « Les gendarmes de Miramas sont passés le soir même, en route pour la Durance. Ils nous ont laissé ce qu’ils ne pouvaient pas emporter. J’ai fait boucher la porte Notre-Dame avec tout ce qu’on avait. Elle a huit cents ans, elle ne fermait plus depuis longtemps. Maintenant, elle ferme. »',
    choix: [retour('helene_parler')],
  },
  helene_radio: {
    illu: 'refuge_donjon', musique: 'sombre', orateur: 'Hélène',
    texte: 'Hélène ne cille pas.\n\n« Je dors mal. La nuit, je fais mes comptes, à voix haute. Ça m’aide. » Elle referme son carnet d’un geste net. « Tu devrais dormir, toi aussi, quand tu n’es pas de garde. Ici, on a besoin de gens bien réveillés. »\n\nElle a déjà tourné la tête vers autre chose. La conversation est finie, et tu as l’impression très nette qu’elle vient de te mentir pour la première fois.',
    choix: [retour('helene_parler')],
  },

  // ─────────── FERNAND ───────────
  fernand_parler: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Fernand',
    texte: 'Fernand est assis sur le banc, sous le platane de la place, son bâton entre les genoux, et il regarde vers la Crau comme d’autres regardent la mer.\n\n« Tiens, {le nouveau|la nouvelle}. Assieds-toi, ça ne coûte rien. »',
    choix: [
      { label: 'Lui demander qui il est', suivant: 'fernand_qui' },
      { label: 'Demander où trouver des planches', si: PLANCHES, suivant: 'fernand_planches' },
      { label: 'Lui demander pourquoi il dit « les pauvres »', suivant: 'fernand_pauvres' },
      { label: 'Lui dire qu’Hélène parle à une radio, la nuit', si: VUE, suivant: 'fernand_radio' },
      PARTIR,
    ],
  },
  fernand_qui: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Fernand',
    texte: '« Fernand Abrieu, berger. Enfin, berger à la retraite : j’ai vendu mes bêtes il y a six ans à Gérard, un ami de Cabassole. » Il montre une maison au volet bleu, en bas de la place. « Je suis né là. J’en suis parti à quatorze ans derrière un troupeau, et je suis revenu à soixante-dix ans derrière un cercueil, celui de ma femme. »\n\nIl hausse les épaules.\n\n« Et maintenant, je garde des gens. C’est plus bête qu’une brebis, et ça mange davantage. »',
    choix: [retour('fernand_parler')],
  },
  fernand_planches: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Fernand',
    texte: '« En bas, derrière la barrière. La maison du forgeron, la maison du bas, et la remise au fond : il y a des planches qui traînent dans les trois. » Il tapote ton pied-de-biche du bout de son bâton. « Fais levier en bas, pas en haut, sinon tu casses tout. Et regarde dans les coins avant d’entrer : les pauvres, ils aiment bien les coins. »',
    choix: [retour('fernand_parler')],
  },
  fernand_pauvres: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Fernand',
    texte: '« Parce que c’est ce qu’ils sont. Un mercredi matin, ils sont allés au marché de Salon acheter des tomates, et ils n’avaient rien demandé, eux. » Il crache de côté. « Ça n’empêche pas de leur taper sur la tête. Une brebis malade, on l’abat aussi, mais on ne la déteste pas. »\n\nIl lève un doigt noueux.\n\n« Tape à la tête, et tape fort. Quand ils sont plusieurs, ne reste jamais au milieu : recule jusqu’à un mur, ou jusqu’à une porte. Et ne cours pas sans savoir où tu vas, parce qu’eux, ils ne se fatiguent pas. »',
    choix: [retour('fernand_parler')],
  },
  fernand_radio: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Fernand',
    texte: 'Fernand ne te regarde pas. Il regarde toujours la Crau.\n\n« Hélène parle à qui elle veut. » Il se tait longtemps. « Je la connais depuis soixante-dix ans. Si elle ne t’a rien dit, c’est qu’elle a ses raisons. Et elle a toujours ses raisons : c’est même ce qu’il y a de plus fatigant chez elle. »',
    choix: [retour('fernand_parler')],
  },

  // ─────────── INÈS ───────────
  ines_parler: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Inès',
    texte: 'Inès est assise devant son poste, dans la maison de la radio, son casque autour du cou, et elle grignote un biscuit sec en tournant une molette du bout du doigt.\n\n« Salut, {le nouveau|la nouvelle}. Tu viens me remercier ? Tout le monde vient me remercier. Ça devient gênant. »',
    choix: [
      { label: 'La remercier pour le message', suivant: 'ines_message' },
      { label: 'Lui demander comment marche sa radio', suivant: 'ines_radio' },
      { label: 'Lui parler d’Hélène', suivant: 'ines_helene' },
      { label: 'Lui demander si Hélène a une autre radio', si: VUE, suivant: 'ines_autre_radio' },
      PARTIR,
    ],
  },
  ines_message: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Inès',
    texte: '« Je sais. » Elle croque son biscuit. « Tu sais combien de gens sont venus grâce au message ? Bastien, Karine et Noa, Rudy et Yohan, et toi. Six personnes en deux semaines, dans un pays où il y avait cent mille habitants. »\n\nElle regarde la plaine.\n\n« Soit tout le monde est mort, soit plus personne n’a de piles. Moi, je préfère me dire que c’est une histoire de piles. »',
    choix: [retour('ines_parler')],
  },
  ines_radio: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Inès',
    texte: '« Mon père était radioamateur. Il m’a appris le morse presque avant de m’apprendre à lire. » Elle tripote le câble de son casque. « Le 2 septembre, il est allé au marché de Salon acheter des tomates. Je l’ai attendu deux jours avec la radio allumée, et puis j’ai compris. »\n\n« Mon poste, c’est celui-là, et l’antenne est tendue sur le toit de la maison. Le jour, je lis le message en direct quand j’ai le temps. La nuit, c’est un enregistrement qui passe toutes les heures, avec un vieux magnétophone, une minuterie de four et beaucoup de chatterton. » Elle a un petit sourire. « Mon père aurait détesté. Mais ça marche. »',
    choix: [retour('ines_parler')],
  },
  ines_helene: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Inès',
    texte: '« Hélène ? » Elle lève les yeux au ciel. « Quand je lui ai proposé de lancer un message à la radio, elle a dit oui en deux minutes, comme si elle attendait que quelqu’un le propose. Et elle a corrigé mon texte : c’est elle qui a ajouté « Montrez vos mains ». Elle corrige tout. »\n\nElle hausse les épaules.\n\n« Elle me parle comme à une adulte. C’est la seule ici. Je lui en veux aussi pour ça. »',
    choix: [retour('ines_parler')],
  },
  ines_autre_radio: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès fronce les sourcils.\n\n« Une autre radio ? Elle m’a interdit le donjon, je n’y suis jamais montée. » Elle réfléchit. « Une nuit, en cherchant des fréquences, je suis tombée sur une femme de l’armée qui parlait avec quelqu’un. Son interlocutrice répondait « Beauvezer ». J’ai cru que c’était un code militaire, et j’ai changé de fréquence. »\n\nElle te regarde, et elle ne sourit plus.\n\n« Beauvezer, c’est le nom de notre église. »',
    choix: [retour('ines_parler')],
  },

  // ─────────── BASTIEN ───────────
  bastien_parler: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Bastien',
    texte: 'Bastien est à l’infirmerie, en train de faire bouillir des compresses dans une casserole, sur un réchaud de camping. Il a l’air de ne pas avoir dormi depuis le Mercredi.\n\n« Ah, c’est toi. Tout va bien ? Tu n’as mal nulle part ? Montre-moi tes mains. » Il sourit, gêné. « Pardon. C’est devenu un réflexe. »',
    choix: [
      { label: 'Demander des nouvelles de Noa', suivant: 'bastien_noa' },
      { label: 'Lui demander comment se soigner sans matériel', suivant: 'bastien_soins' },
      { label: 'Lui demander comment c’était à l’hôpital, au début', suivant: 'bastien_hopital' },
      { label: 'Lui parler de la radio d’Hélène', si: VUE, suivant: 'bastien_radio' },
      PARTIR,
    ],
  },
  bastien_noa: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Bastien',
    texte: '« Mal. » Il baisse la voix pour que Karine n’entende pas. « C’est une pneumonie, sûrement bactérienne. Avec de l’amoxicilline, elle serait debout dans une semaine. Sans… » Il ne finit pas sa phrase.\n\n« Si tu trouves des antibiotiques, n’importe où, dans une voiture, une trousse de secours, une armoire de salle de bain, apporte-les-moi. Même périmés. Surtout ne les avale pas toi-même si tu as un rhume : ils sont pour elle. »',
    choix: [retour('bastien_parler')],
  },
  bastien_soins: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Bastien',
    texte: '« D’abord, l’eau : toujours bouillie, même celle du puits. La diarrhée tue plus vite que les morts, ici. » Il compte sur ses doigts. « Une plaie, tu la laves à l’eau propre, tu la désinfectes si tu peux, et tu la couvres. Tu changes le pansement tous les jours, et si ça devient rouge, chaud et que ça sent mauvais, tu viens me voir tout de suite. »\n\n« Pour les morsures, je ne peux rien faire. Personne ne peut rien faire. On meurt au bout de trois à trente heures, ça dépend des gens. » Il te regarde. « Si ça t’arrive, dis-le. Ici, on ne te jettera pas dehors : on restera avec toi jusqu’au bout. »',
    choix: [retour('bastien_parler')],
  },
  bastien_hopital: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Bastien',
    texte: 'Bastien éteint le réchaud et reste un moment à regarder la casserole.\n\n« Le Mercredi, à onze heures, on a reçu les premiers mordus du marché : une vieille dame, un fromager, un policier. À midi, on en avait quarante. À quatorze heures, le premier s’est relevé dans le box six, et il a mordu le brancardier qui lui prenait la tension. »\n\nIl parle doucement, sans te regarder.\n\n« Le soir, on attachait les patients avant qu’ils meurent. On savait que ça arriverait, alors on les attachait, et ils nous regardaient faire. Personne ne nous avait appris à faire ça. »',
    choix: [retour('bastien_parler')],
  },
  bastien_radio: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Bastien',
    texte: '« Je préfère ne pas savoir. » Il essore une compresse entre ses doigts. « Pour l’instant, ce que je ne sais pas me laisse dormir quatre heures par nuit. Je n’ai pas envie de descendre à trois. »',
    choix: [retour('bastien_parler')],
  },

  // ─────────── KARINE ───────────
  karine_parler: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Karine',
    texte: 'Karine est devant le four à pain de la salle commune, de la farine jusqu’aux coudes. Entre deux fournées, elle court à l’infirmerie voir Noa, puis elle revient pétrir. Elle te regarde à peine.\n\n« Quoi ? »',
    choix: [
      { label: 'Demander comment va Noa', suivant: 'karine_noa' },
      { label: 'Lui demander ce qu’elle faisait avant', suivant: 'karine_avant' },
      { label: 'Lui demander ce que Noa aime', suivant: 'karine_noa_parle' },
      { label: 'Lui parler de la radio d’Hélène', si: VUE, suivant: 'karine_radio' },
      PARTIR,
    ],
  },
  karine_noa: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Karine',
    texte: '« Mal. Tu as des antibiotiques ? »\n\nTu secoues la tête.\n\n« Alors tu ne peux rien. » Elle retourne la pâte sur la table et la frappe du plat de la main, très fort, comme si elle voulait faire mal à quelqu’un.',
    choix: [retour('karine_parler')],
  },
  karine_avant: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Karine',
    texte: '« Boulangère, avenue de Verdun, à Miramas. Pendant douze ans, je me suis levée à trois heures du matin. » Elle regarde ses mains. « La farine venait d’un vieux meunier de Grans, Édouard, qui livrait encore lui-même à quatre-vingts ans, dans une camionnette qui sentait le moulin. Il disait que le jour où il arrêterait de livrer, il mourrait. »\n\nElle hausse les épaules.\n\n« Il a dû arrêter de livrer. »',
    choix: [retour('karine_parler')],
  },
  karine_noa_parle: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Karine',
    texte: 'Karine s’arrête de pétrir. Pendant une seconde, son visage change complètement, et sa voix devient douce et basse, une voix que tu ne lui connaissais pas.\n\n« Les moutons. Fernand lui a raconté qu’il en reste encore, des vrais, dans la Crau, et depuis, elle ne parle que de ça. Elle veut en caresser un, et elle veut savoir si ça sent mauvais. » Elle a un petit sourire. « Je lui ai promis qu’on irait en voir quand elle ne tousserait plus. »\n\nPuis elle se remet à pétrir, et sa voix redevient sèche.\n\n« Si tu passes à l’infirmerie, ne la fatigue pas. »',
    choix: [retour('karine_parler')],
  },
  karine_radio: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Karine',
    texte: '« Je m’en fiche, de savoir à qui elle parle. » Elle ne lève pas les yeux. « Tant que ma fille a un toit et de l’eau chaude, Hélène peut bien parler au pape. »',
    choix: [retour('karine_parler')],
  },

  // ─────────── RUDY ───────────
  rudy_parler: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Rudy',
    texte: 'Rudy est assis sur les planches neuves de la brèche, à tailler un bout de bois au couteau pour passer le temps. Il ne lève pas les yeux.\n\n« Quoi ? Tu viens vérifier si ça tient ? Ça tient. »',
    choix: [
      { label: 'Lui parler de son camion', suivant: 'rudy_camion' },
      { label: 'Lui demander d’où il vient', suivant: 'rudy_origine' },
      { label: 'Reparler de la radio d’Hélène', si: VUE, suivant: 'rudy_radio' },
      PARTIR,
    ],
  },
  rudy_camion: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Rudy',
    texte: 'Rudy montre du menton le camion blanc, garé de travers sur la place.\n\n« Un porteur de dix-neuf tonnes. Je faisais Marseille-Lyon pour un transporteur de Rognac, trois fois par semaine. Le 2 septembre, j’étais chargé de couches pour bébés. J’en ai distribué tout un camion sur le parking du Leclerc de Miramas, gratuitement. Les gens pleuraient. Pour des couches. »\n\nIl souffle sur son bout de bois.\n\n« Il reste de quoi faire quarante bornes dans le réservoir. La Durance, par la route, c’est soixante. » Il refait le calcul à voix basse, et il n’arrive toujours pas au bon résultat.',
    choix: [retour('rudy_parler')],
  },
  rudy_origine: {
    illu: 'refuge_place', musique: 'calme', orateur: 'Rudy',
    texte: '« Rognac. Mon ex et mon fils vivent à Lyon, de l’autre côté de tout ça. Il a onze ans. » Il te regarde, comme pour vérifier que tu as compris. « Onze ans, et je ne sais pas s’il est vivant. »\n\n« Yohan, je l’ai ramassé sur la nationale. Il faisait du stop avec une truelle dans la main. Il est con comme un balai, mais il ne lâche jamais rien. » Il renifle. « Je l’aime bien, ce gamin. Ne lui dis pas. »',
    choix: [retour('rudy_parler')],
  },
  rudy_radio: {
    illu: 'refuge_place', musique: 'sombre', orateur: 'Rudy',
    texte: '« Si elle parle à l’armée, l’armée sait qu’on est là. Et si l’armée sait qu’on est là et qu’elle ne vient pas nous chercher, c’est qu’elle a autre chose à faire. » Il crache dans la poussière. « Je n’aime pas les gens qui ont autre chose à faire. Encore moins quand ils ont des avions. »',
    choix: [retour('rudy_parler')],
  },

  // ═══════════════════════════ ACTE II — LA BERGERIE ═══════════════════════════
  fernand_crau_parler: {
    illu: 'bergerie_crau', musique: 'calme', orateur: 'Fernand',
    texte: 'Fernand est assis sur la margelle du puits à balancier, son bâton sur les genoux, et il regarde la porte de la bergerie.\n\n« Quoi ? »',
    choix: [
      { label: 'Lui parler de Gérard', suivant: 'fernand_gerard' },
      { label: 'Lui demander comment il trouve son chemin', suivant: 'fernand_drailles' },
      { label: 'Lui parler d’Hélène', suivant: 'fernand_crau_helene' },
      { label: 'Lui redemander la dose pour Noa', si: { flag: 'antibio_trouves' }, suivant: 'fernand_dose' },
      { label: 'Lui parler de la radio d’Hélène', si: VUE, suivant: 'fernand_crau_radio' },
      PARTIR,
    ],
  },
  fernand_gerard: {
    illu: 'bergerie_crau', musique: 'sombre', orateur: 'Fernand',
    texte: '« Gérard Pons. On a fait notre première transhumance ensemble, à quatorze ans, jusqu’au col de Larche. Il avait des mains de géant, et il chantait faux. » Fernand sourit à moitié. « Je lui ai vendu mes bêtes il y a six ans, parce que je savais qu’il les aimerait. »\n\n« Il les a aimées jusqu’au bout. Tu as vu. »',
    choix: [retour('fernand_crau_parler')],
  },
  fernand_drailles: {
    illu: 'bergerie_crau', musique: 'calme', orateur: 'Fernand',
    texte: '« Les drailles, ce sont les chemins des moutons. Ils étaient déjà là avant les Romains, larges, droits, avec des murets de chaque côté, et des tas de pierres aux croisements pour qui sait les lire. »\n\nIl montre la plaine du bout de son bâton.\n\n« Dans la Crau, il y a un puits à chaque bergerie, et une bergerie tous les trois kilomètres. L’eau y est bonne, mais fais-la bouillir quand même. Et ne marche jamais la nuit avec une lampe : ici, on la voit à dix kilomètres. »',
    choix: [retour('fernand_crau_parler')],
  },
  fernand_crau_helene: {
    illu: 'bergerie_crau', musique: 'calme', orateur: 'Fernand',
    texte: '« Hélène ? » Il sourit sans que ses yeux sourient. « Elle a été adjointe aux écoles de Miramas pendant vingt ans. Elle connaissait le prénom de tous les enfants de la ville, le nom de leurs parents, et ce qu’ils devaient à la cantine. »\n\nIl regarde vers l’est, vers le rocher qu’on ne voit pas d’ici.\n\n« Elle fait ce qu’il faut. Ça ne veut pas dire que ça ne lui coûte rien. »',
    choix: [retour('fernand_crau_parler')],
  },
  fernand_dose: {
    illu: 'bergerie_crau', musique: 'calme', orateur: 'Fernand',
    texte: '« Deux millilitres et demi, une fois par jour, pendant cinq jours, dans la fesse. Gérard a écrit la dose des agneaux au crayon sur le bouchon, et c’est à peu près la même. » Il te regarde par-dessous sa casquette. « Tu le diras à Bastien, mais il saura mieux que moi. C’est son métier. Le mien, c’était les brebis. »',
    choix: [retour('fernand_crau_parler')],
  },
  fernand_crau_radio: {
    illu: 'bergerie_crau', musique: 'sombre', orateur: 'Fernand',
    texte: 'Fernand fait semblant de ne pas avoir entendu. Il ramasse un galet, le tourne dans ses doigts et le jette loin dans la plaine.\n\n« Demain, on rentre à l’aube, dit-il enfin. Le plus tôt possible. » Il te regarde. « Le plus tôt possible, tu m’entends ? Pas une minute de plus ici. »',
    choix: [retour('fernand_crau_parler')],
  },

  // ═══════════════════════════ ACTE IV — LA POUDRERIE ═══════════════════════════
  ines_pou_parler: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès est assise à la table de la cuisine du gardien, son poste devant elle, et elle tortille un bout de fil de cuivre entre ses doigts.\n\n« Si tu viens pour parler de ce qui s’est passé, non. Si tu viens pour autre chose, assieds-toi. »',
    choix: [
      { label: 'Lui demander ce qu’elle bricole', suivant: 'ines_antenne' },
      { label: 'Lui parler de son père', suivant: 'ines_pere' },
      { label: 'Lui parler d’Hélène', suivant: 'ines_pou_helene' },
      { label: 'Lui parler du message qui passe toujours', suivant: 'ines_boucle' },
      PARTIR,
    ],
  },
  ines_antenne: {
    illu: 'poudrerie_parc', musique: 'calme', orateur: 'Inès',
    texte: '« Une antenne. Avec un bon fil, tendu haut et droit, je peux capter Avignon, Marseille, et l’armée, si elle veut bien parler. » Elle tire sur le fil pour vérifier qu’il tient. « Mon père en aurait fait une meilleure en dix minutes, avec un cintre et une boîte de sardines. »\n\nElle lève les yeux vers le toit.\n\n« Il faudrait la monter plus haut. Ici, on est au ras de l’eau. Je n’aime pas être au ras de l’eau. »',
    choix: [retour('ines_pou_parler')],
  },
  ines_pere: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: '« Il s’appelait Karim. Il réparait des machines à laver, et le soir, il parlait avec des Japonais et des Brésiliens en morse, depuis le garage. » Elle sourit à peine. « Il disait que la radio, c’est la seule façon de parler à quelqu’un sans savoir s’il t’écoute, et de continuer quand même. »\n\n« C’est ce que j’ai fait pendant deux semaines, au Refuge. Parler sans savoir. » Elle hausse les épaules. « Il aurait été content, je crois. Ou il m’aurait dit de mieux articuler. »',
    choix: [retour('ines_pou_parler')],
  },
  ines_pou_helene: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès ne répond pas tout de suite. Elle enroule le fil de cuivre autour de son doigt, si serré que le bout devient blanc.\n\n« Je lui en veux, dit-elle enfin. Je lui en veux à un point que tu n’imagines pas. » Elle déroule le fil. « Et si elle était là, je lui demanderais quoi faire, et je ferais exactement ce qu’elle dirait. C’est ça le pire. »',
    choix: [retour('ines_pou_parler')],
  },
  ines_boucle: {
    illu: 'poudrerie_parc', musique: 'sombre', orateur: 'Inès',
    texte: '« Je l’entends dans ma tête même quand le poste est éteint. » Elle fixe l’étang. « Ici le Refuge de Miramas-le-Vieux, nous accueillons les survivants. Toutes les heures, avec ma voix de fille sympa. »\n\nElle a un rire bref, sans joie.\n\n« Si quelqu’un monte là-haut à cause de moi… Je vais devenir la première animatrice radio de l’histoire à tuer ses auditeurs. » Elle se tait. « Il faudrait que quelqu’un retourne la couper. Pas moi. Je ne peux pas. »',
    choix: [retour('ines_pou_parler')],
  },

  // ═══════════════════════════ ACTE V — CORNILLON, LA BASE ═══════════════════════════
  // ─────────── INÈS ───────────
  ines_cor_parler: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Inès s’est installée à la table de la maison de la placette, à côté de celle du guetteur, avec son poste, une lanterne et un cahier où elle note tout ce qu’elle capte. Elle ressemble à Hélène quand elle fait ça, et elle le sait, et ça l’énerve.\n\n« Alors, quoi de neuf, dehors ? »',
    choix: [
      { label: 'Lui demander ce que dit la radio', suivant: 'ines_cor_radio' },
      { label: 'Revoir le plan pour le pont', suivant: 'ines_cor_plan' },
      { label: 'Demander qui manque encore', suivant: 'ines_cor_manque' },
      { label: 'Lui parler du message qui passe toujours', si: { pasFlag: 'radio_coupee' }, suivant: 'ines_cor_boucle' },
      { label: 'Lui dire que tu as coupé sa radio', si: { flag: 'radio_coupee' }, suivant: 'ines_cor_coupee' },
      { label: 'Lui parler d’Hélène', si: { flag: 'helene_sauvee' }, suivant: 'ines_cor_helene_vivante' },
      { label: 'Lui parler d’Hélène', si: { pasFlag: 'helene_sauvee' }, suivant: 'ines_cor_helene' },
      PARTIR,
    ],
  },
  ines_cor_radio: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: '« Le PC Durance répète le même bulletin matin et soir : le jaune, c’est du chlore, la nuit il descend dans les creux, le jour il s’en va avec le vent et la pluie. Restez en hauteur la nuit, ne dormez jamais en plaine. Il est plus pâle tous les jours, mais il revient chaque nuit sans vent. » Elle consulte son cahier. « Et l’armée continue de faire hurler les sirènes sur des villages, pour pousser les morts. Quand j’entends qu’ils vont le faire, je le note. Passe me voir avant de partir loin. »\n\n« Le pont, c’est toujours le mercredi 7, de six heures à sept heures. Ils le répètent comme si on était sourds. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_plan: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: 'Inès te demande ta carte routière, la déplie sur la table et pose le doigt sur Cornillon, puis elle le fait remonter jusqu’à la Durance.\n\n« Mardi 6 octobre, huit heures du soir, on part d’ici. Par les routes hautes, on évite les creux où le jaune s’accumule. Une trentaine de kilomètres, une nuit entière de marche, et on arrive au pont avant l’aube. » Elle relève la tête. « Si tu n’es pas là mardi soir, on part sans toi. C’est la règle d’Hélène : on n’attend personne. Je déteste cette règle, mais elle est juste. »\n\n« Et si on le rate, il reste le mercredi 14. Après, c’est fini. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_manque: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: '« Bastien, sans doute chez sa sœur, à Istres. Il en parlait tout le temps. Rudy, au péage de Lançon, à sec, si personne ne l’a mangé. Il voulait prendre l’autoroute, et avec ce qui lui restait de gasoil, il n’a pas pu aller plus loin. » Elle tapote son cahier. « Et si Karine et Noa ne sont pas ici avec nous, cherche le vieux moulin de Grans, au bord de la Touloubre. Karine parlait de son meunier comme d’un grand-père. »\n\nElle referme son cahier.\n\n« Les autres, je ne sais pas. Je préfère ne pas faire de liste. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_boucle: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès tourne la molette de son poste, et ta gorge se serre : sa propre voix en sort, faible, au milieu des parasites. « … Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants… »\n\nElle éteint.\n\n« Toutes les heures. Depuis le village mort. » Elle ne te regarde pas. « Si tu passes par là-bas, coupe-la. Le poste est dans la maison de la radio, à côté de l’infirmerie. Il y a un gros interrupteur rouge. Moi, je ne peux pas y retourner. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_coupee: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès reste immobile un long moment. Puis elle allume son poste, cherche la fréquence du Refuge, et elle n’entend plus qu’un grésillement.\n\n« Merci », dit-elle. Elle l’écoute encore quelques secondes, sans se décider à couper, puis elle éteint. « C’était ma voix, tu sais. Elle va me manquer, c’est débile. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_helene_vivante: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Inès',
    texte: '« Elle a dit qu’elle nous retrouverait au pont ? » Inès hoche la tête. « Alors elle y sera. Elle est toujours à l’heure, c’est insupportable. »\n\nElle regarde vers le nord, vers la Durance qu’on ne voit pas.\n\n« Je vais lui dire tout ce que je pense, là-bas. Tout. Et après, je la laisserai me corriger. »',
    choix: [retour('ines_cor_parler')],
  },
  ines_cor_helene: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Inès',
    texte: 'Inès ouvre son cahier à la première page. Elle y a recopié quelque chose, de sa plus belle écriture : les règles du tableau noir du Refuge, toutes, dans l’ordre, jusqu’à celle sur le café de Rudy.\n\n« Je ne veux pas les oublier, dit-elle. Elle les avait écrites pour qu’on tienne. Ça a marché trois semaines. C’est déjà pas mal, trois semaines. »',
    choix: [retour('ines_cor_parler')],
  },

  // ─────────── KARINE ───────────
  karine_cor_parler: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Karine',
    texte: 'Karine a installé Noa dans le lit du coin, dans la chambre de la maison de la placette, et elle a déjà trouvé de la farine quelque part : toute la maison sent le pain chaud.\n\n« Entre. Ferme la porte, il y a un courant d’air. »',
    choix: [
      { label: 'Demander comment va Noa', si: { flag: 'noa_traitee' }, suivant: 'karine_cor_noa_mieux' },
      { label: 'Demander comment va Noa', si: { pasFlag: 'noa_traitee' }, suivant: 'karine_cor_noa_mal' },
      {
        label: 'Donner l’antibiotique de Gérard pour Noa',
        si: { objet: 'antibio_veto', pasFlag: 'noa_traitee' },
        effets: { retirer: [['antibio_veto', 1]], flag: 'noa_traitee', journal: 'J’ai donné à Karine l’antibiotique de Gérard pour Noa.' },
        suivant: 'karine_cor_soin',
      },
      {
        label: 'Donner la boîte d’amoxicilline pour Noa',
        si: { objet: 'antibiotiques', pasFlag: 'noa_traitee', pasObjet: 'antibio_veto' },
        effets: { retirer: [['antibiotiques', 1]], flag: 'noa_traitee', journal: 'J’ai donné à Karine une boîte d’antibiotiques pour Noa.' },
        suivant: 'karine_cor_soin',
      },
      { label: 'Lui parler de Rudy', suivant: 'karine_cor_rudy' },
      PARTIR,
    ],
  },
  karine_cor_noa_mieux: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Karine',
    texte: '« Mieux. » Karine le dit sèchement, mais elle ne peut pas s’empêcher de sourire. « La fièvre est tombée. Elle tousse encore, mais elle a mangé deux tartines ce matin et elle m’a demandé quand on irait voir les moutons. »\n\nPar la porte de la chambre, tu vois Noa assise dans son lit, en train de dessiner sur le mur avec un morceau de charbon.\n\n« Je la laisse faire, dit Karine. Ce n’est pas notre mur. »',
    choix: [retour('karine_cor_parler')],
  },
  karine_cor_noa_mal: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Karine',
    texte: '« Pas bien. » Karine regarde la porte de la chambre, d’où sort une toux sèche qui ne s’arrête pas. « La fièvre monte le soir et retombe le matin, et chaque soir elle monte un peu plus haut. Ici, au moins, l’air est propre. »\n\nElle se tourne vers toi.\n\n« Il lui faut des antibiotiques. Si tu en trouves, n’importe où, dans une pharmacie, une voiture, une maison, rapporte-les-moi avant tout le reste. Je ne te demanderai rien d’autre. »',
    choix: [retour('karine_cor_parler')],
  },
  karine_cor_soin: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Karine',
    texte: 'Karine prend le médicament à deux mains, et elle reste un moment sans bouger, à le regarder. Puis elle va dans la chambre, et tu l’entends parler à Noa avec sa voix douce, celle qu’elle n’a que pour elle, en lui promettant qu’après ça, elle ira mieux.\n\nQuand elle revient, elle s’essuie les yeux d’un revers de manche, furieuse contre elle-même.\n\n« Merci. » Elle te met dans les mains un pain encore chaud. « Prends ça, et ne discute pas. »',
    choix: [{ label: 'Prendre le pain', effets: { objet: ['pain', 1] }, suivant: 'karine_cor_parler' }],
  },
  karine_cor_rudy: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Karine',
    texte: 'Le visage de Karine se ferme d’un coup.\n\n« Il a ouvert la porte. Ma fille dormait à cent mètres de cette porte. » Elle pétrit une boule de pâte, très fort. « Je sais ce qu’il dit. Qu’il comptait refermer. Je m’en fiche de ce qu’il comptait faire. »\n\nElle s’arrête, les mains dans la farine.\n\n« Fais ce que tu veux de lui. Mais ne me demande pas de lui pardonner. Pas maintenant. »',
    choix: [retour('karine_cor_parler')],
  },

  // ─────────── BASTIEN ───────────
  bastien_cor_parler: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Bastien',
    texte: 'Bastien est assis près de la fenêtre de la maison de la placette, une couverture sur les genoux, et il respire lentement, en comptant à voix basse.\n\n« Quatre secondes pour inspirer, six pour expirer. C’est ce que je conseillais aux asthmatiques. Je n’y croyais pas trop. » Il sourit. « J’avais tort. »',
    choix: [
      { label: 'Lui demander ce que fait le chlore', suivant: 'bastien_chlore' },
      { label: 'Lui demander comment il va', suivant: 'bastien_cor_sante' },
      { label: 'Lui parler de la nuit de l’attaque', suivant: 'bastien_cor_porte' },
      { label: 'Lui parler du pont', suivant: 'bastien_cor_pont' },
      PARTIR,
    ],
  },
  bastien_chlore: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Bastien',
    texte: '« Le chlore attaque tout ce qui est humide : les yeux, la gorge, les poumons. Ça brûle, ça fait tousser, et si on en respire beaucoup, les poumons se remplissent d’eau. » Il parle comme un infirmier, calmement, en détachant chaque conseil.\n\n« Ne cours jamais dedans : plus tu respires fort, plus il entre. Un linge mouillé sur le nez et la bouche, ça retient une partie. Monte, toujours : il reste en bas. Si tu y as été {exposé|exposée}, rince-toi les yeux à l’eau claire pendant dix minutes, et change de vêtements, parce qu’il reste dans le tissu. Et ne dors jamais dans un creux, même si l’air te paraît propre au coucher du soleil. »',
    choix: [retour('bastien_cor_parler')],
  },
  bastien_cor_sante: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Bastien',
    texte: '« Je respire avec un poumon et demi. » Il tousse, et il attend que ça passe. « Je ne pourrai plus jamais courir, et je crois que je tousserai tous les hivers. Mais je ne suis pas mort, et j’ai vu des gens mourir de beaucoup moins. »\n\nIl regarde la plaine, où la brume se retire lentement vers l’étang.\n\n« Le jour, je vais bien. C’est le soir que c’est dur, quand l’odeur remonte. »',
    choix: [retour('bastien_cor_parler')],
  },
  bastien_cor_porte: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Bastien',
    texte: '« Yohan criait, près de la porte. J’ai couru, parce que c’est ce qu’on fait quand quelqu’un crie. » Il fixe ses mains. « Quand je suis arrivé, il n’y avait plus que des morts, et les feux rouges d’un camion qui descendait la route. J’ai reculé jusqu’à la brèche, et je suis passé par-dessus. Je n’ai pas pu revenir chercher Noa. »\n\nIl se tait longtemps.\n\n« J’étais infirmier. J’ai couru dans le mauvais sens. »',
    choix: [retour('bastien_cor_parler')],
  },
  bastien_cor_pont: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Bastien',
    texte: '« Au contrôle, ils cherchent les morsures. Ils ne regardent pas l’état des poumons. Ils me laisseront passer, avec ma toux, si je leur montre mes bras assez vite. » Il a un petit rire. « J’ai passé trois semaines à regarder les bras des autres, et maintenant c’est mon tour. »\n\n« Toi, fais attention à toi d’ici là. Une seule morsure, et ils ne te laisseront pas passer. Il n’y a pas d’exception, et je ne leur en veux même pas. »',
    choix: [retour('bastien_cor_parler')],
  },

  // ─────────── RUDY ───────────
  rudy_cor_parler: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Rudy',
    texte: 'Rudy est assis dehors, devant la porte de la maison de la placette, son fusil de chasse sur les genoux, et il surveille la route qui monte. Il a décidé tout seul de monter la garde. Personne ne vient s’asseoir près de lui.\n\n« Tu veux quoi ? »',
    choix: [
      { label: 'Lui parler de Yohan', suivant: 'rudy_cor_yohan' },
      { label: 'Lui parler de la porte', suivant: 'rudy_cor_porte' },
      { label: 'Lui parler du camion', suivant: 'rudy_cor_camion' },
      { label: 'Lui parler de Karine', suivant: 'rudy_cor_karine' },
      PARTIR,
    ],
  },
  rudy_cor_yohan: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Rudy',
    texte: '« Je l’ai enterré au bord de l’autoroute, avec sa truelle. » Rudy passe le chiffon sur le canon, encore et encore. « Il avait vingt ans. Il voulait monter sa boîte de maçonnerie à Martigues, avec un logo et tout. Il m’avait montré le dessin. »\n\n« Il s’est fait mordre en arrachant les sacs de sable de la porte. Pour moi. Pour que je puisse sortir. »',
    choix: [retour('rudy_cor_parler')],
  },
  rudy_cor_porte: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Rudy',
    texte: '« J’ai ouvert pour sortir. Je comptais refermer derrière moi. » Il le dit d’une voix plate, comme quelque chose qu’il s’est répété des centaines de fois. « Je le dirai jusqu’à ma mort, et ça ne changera rien. »\n\n« Tu sais ce qui est drôle ? J’avais raison. C’était une souricière. Et c’est moi qui ai ouvert la trappe. »',
    choix: [retour('rudy_cor_parler')],
  },
  rudy_cor_camion: {
    illu: 'cornillon_belvedere', musique: 'calme', orateur: 'Rudy',
    texte: '« Vingt litres, c’est quatre-vingts bornes à vide. Avec du monde à l’arrière, disons soixante. Mallemort, par les routes hautes, c’est une trentaine. » Il regarde le camion, garé sur la place. « Pour une fois, on a de la marge. »\n\n« Mardi soir, je mets tout le monde sous la bâche, je roule sans phares, et je ne m’arrête pas. Si quelque chose se met devant, tant pis pour lui. »',
    choix: [retour('rudy_cor_parler')],
  },
  rudy_cor_karine: {
    illu: 'cornillon_belvedere', musique: 'sombre', orateur: 'Rudy',
    texte: '« Elle ne me parle pas. Elle passe à côté de moi comme si j’étais un poteau. » Il hausse les épaules. « Elle a raison. Si quelqu’un m’avait fait ça, je l’attendrais dans un coin sombre, avec un couteau. »\n\n« Mais elle a pris le pain que j’ai rapporté de Lançon. Pour la petite. C’est déjà ça. »',
    choix: [retour('rudy_cor_parler')],
  },

  // ═══════════════════════════ LE MONDE ═══════════════════════════

  // ─────────── L'EMPÉRI : la grille du camp du professeur Vidal ───────────
  // Marqueur 'grille_emperi'. Un refuge du monde parmi d'autres : on montre ses bras, puis on entre.
  emp_grille: {
    illu: null, musique: 'tension', orateur: null,
    texte: 'Au sommet de la montée du Puech, la porte du château de l’Empéri est fermée par une grille doublée de tôles. Tu appelles. Sur le rempart, un garçon d’une quinzaine d’années coiffé d’un casque de vélo se penche, une lampe à la main, et derrière lui apparaît un homme en pull bleu, la cinquantaine, avec des lunettes rafistolées au sparadrap.\n\n« Je suis M. Vidal, professeur d’histoire. Ici, c’est un collège, plus ou moins. » Il parle avec la voix de quelqu’un qui a l’habitude de se faire entendre au fond d’une classe. « Nous avons vingt élèves, de l’eau et des murs. Si tu veux entrer, montre tes bras. Remonte tes manches jusqu’aux épaules, et montre tes bras de chaque côté sous la lampe. »',
    choix: [
      { label: 'Montrer tes bras sous la lampe', si: { mordu: false }, suivant: 'emp_grille_ok' },
      { label: 'Montrer tes bras sous la lampe', si: { mordu: true }, suivant: 'emp_grille_refus' },
      { label: 'Repartir', suivant: '#fin' },
    ],
  },
  emp_grille_ok: {
    illu: null, musique: 'calme', orateur: 'Vidal',
    texte: 'La lampe passe lentement sur tes avant-bras, tes poignets, tes mains. Le garçon au casque de vélo hoche la tête vers le professeur.\n\n« Bien. » Une chaîne cliquette derrière la grille, qui s’entrouvre juste assez. « Tu peux dormir dans la cour, et prendre de l’eau à la citerne, à condition de la faire bouillir. Tu ne touches pas aux rations des enfants, tu ne montes pas dans la tour, et tu ressors par où tu es {entré|entrée}. » Il remonte ses lunettes. « Et si tu as des nouvelles de quelque part, n’importe où, raconte-les aux élèves. Ils n’en ont plus. »',
    choix: [
      {
        label: 'Entrer dans le château',
        effets: { flag: 'emp_entree_ok', journal: 'Au château de l’Empéri, à Salon, un professeur, M. Vidal, tient un refuge avec ses élèves. On m’a regardé les bras, puis on m’a ouvert : je peux y dormir et y prendre de l’eau.' },
        suivant: '#fin',
      },
    ],
  },
  emp_grille_refus: {
    illu: null, musique: 'sombre', orateur: 'Vidal',
    texte: 'La lampe s’arrête sur ta morsure, et elle ne bouge plus.\n\nLe garçon recule d’un pas sur le rempart. Le professeur, lui, ne recule pas. Il te regarde un long moment, et sa voix, quand il parle, est très douce.\n\n« Je suis désolé. Pas ici. Il y a vingt enfants derrière ce mur. » Il hésite. « Si tu as faim, je peux te lancer quelque chose. C’est tout ce que je peux faire. »',
    choix: [
      { label: 'Repartir', effets: { journal: 'Au château de l’Empéri, on a vu ma morsure sous la lampe. Le professeur Vidal m’a refusé l’entrée : il y a vingt enfants derrière son mur.' }, suivant: '#fin' },
    ],
  },

  // ─────────── LA BOÎTE D'AIMÉ (mission m_aime) — à garder telle quelle ───────────
  aime_cache: {
    illu: null, musique: 'calme',
    texte: 'Au pied du troisième frêne, la terre est plus sombre qu’ailleurs, et quelqu’un l’a tassée du plat de la main. Tu creuses avec les doigts, puis avec une branche, et à une dizaine de centimètres de profondeur tu touches du métal : une vieille boîte à biscuits, enveloppée dans deux sacs plastique et serrée par un morceau de chambre à air.\n\nDedans, Aimé a rangé ce qu’un pêcheur garde pour les mauvais jours : deux poissons fumés roulés dans du papier journal, une boîte de raviolis et une bouteille d’eau-de-vie.',
    choix: [
      {
        label: 'Prendre ce qu’il y a dans la boîte',
        // un seul lot, même à deux : c'est l'hôte qui le donne (MISSIONS.m_aime.cache)
        effets: { mission: ['cache', 'm_aime'] },
        suivant: '#fin',
      },
    ],
  },
};
