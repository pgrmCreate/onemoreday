// Événements de rue supplémentaires — généré par agents (voir schéma dans events.js)
export const EVENTS_RUE = [
  {
    id: 'ev_r_voiture_alarme',
    types: ['rue'],
    texte: 'Un 4x4 abandonné au milieu du carrefour, vitres intactes. Sur la banquette arrière : des sacs de courses jamais déballés. Mais le voyant rouge de l\'alarme clignote encore sous le pare-brise — la batterie n\'est pas morte, elle.',
    choix: [
      {
        label: 'Désamorcer l\'alarme par le capot',
        besoin: { skill: { mecanique: 1 } },
        test: { skill: 'mecanique', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu glisses la main sous le capot entrouvert et tu arraches la cosse. Le voyant s\'éteint. La vitre cède sans un cri, et tu fais tes courses dans le silence.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'soda', qty: 1 }, { id: 'piles', qty: 1 }], xp: { mecanique: 14 }, tempsMin: 20 } },
        echec: { texte: 'Ton tournevis ripe. L\'alarme explose dans la rue déserte, stridente, obscène. Des silhouettes se décollent des murs, une à une, et convergent.', effets: { combat: ['errant', 'errant'], tempsMin: 5 } },
      },
      {
        label: 'Briser la vitre et rafler ce que tu peux',
        test: { skill: 'agilite', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'La vitre éclate, l\'alarme hurle. Tu as déjà plongé à mi-corps dans l\'habitacle. Dix secondes pour rafler un sac, et tu cours sans te retourner pendant que toute la rue se réveille derrière toi.', effets: { items: [{ id: 'soda', qty: 1 }, { id: 'biscuits', qty: 1 }], sta: -20, xp: { agilite: 8 }, tempsMin: 10 } },
        echec: { texte: 'L\'alarme te vrille les tympans. Le temps d\'attraper un sac, une main grise agrippe ton col par la portière opposée. Il était couché sur le plancher, à attendre.', effets: { combat: 'coureur', tempsMin: 5 } },
      },
      { label: 'Passer au large', texte: 'Des courses en boîte contre une sirène qui ameute le quartier. Le calcul est vite fait. Tu contournes.', effets: {} },
    ],
  },
  {
    id: 'ev_r_mourante',
    types: ['rue'], once: true,
    texte: 'Elle est assise contre une vitrine de boulangerie, les mains pressées sur son ventre. Entre ses doigts, la morsure est nette, profonde, déjà noire sur les bords. Elle te suit des yeux sans peur. « Approche. J\'ai plus rien à mordre, moi. » Elle pousse son sac vers toi du bout du pied. « Prends. Mais avant de partir... fais en sorte que je ne me relève pas. S\'il te plaît. »',
    choix: [
      {
        label: 'Tenir sa main, et faire vite',
        texte: 'Elle serre tes doigts une fois, fort, comme on dit merci. Tu fais ce qu\'elle demande pendant qu\'elle regarde le ciel. Dans son sac, il y a une photo : elle, un homme, deux enfants, une plage. Tu la gardes. Quelqu\'un doit se souvenir.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }, { id: 'bouteille_eau', qty: 1 }, { id: 'photo_famille', qty: 1 }], sta: -10, tempsMin: 15, flag: 'derniere_volonte' },
      },
      {
        label: 'Rester avec elle jusqu\'à la fin, sans frapper',
        texte: 'Tu n\'as pas pu. Tu t\'assieds à côté d\'elle et tu attends. Elle parle de Lille, d\'un chien qui s\'appelait Brio, puis elle ne parle plus. Quand ses yeux se rouvrent, laiteux, ta lâcheté a un prix : c\'est elle, et pourtant ce n\'est plus elle qu\'il faut affronter.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], tempsMin: 50, combat: 'errant' },
      },
      {
        label: 'Prendre le sac et partir sans répondre',
        texte: 'Tu ramasses le sac sans croiser son regard. Dans ton dos, sa voix ne tremble même pas : « J\'espère que quelqu\'un fera pareil pour toi. » Tu marches plus vite que nécessaire pendant un long moment.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], tempsMin: 5, flag: 'mourante_abandonnee' },
      },
    ],
  },
  {
    id: 'ev_r_troc',
    types: ['rue'], once: true,
    texte: 'Un sifflement bref, depuis un rez-de-chaussée muré. Derrière une grille de cave, un visage barbu t\'observe, une lampe à huile à la main. « Du calme. Je vends, j\'achète, je tire pas. » Il pousse une caisse contre les barreaux : des médicaments, du matériel. « On fait affaire, ou tu passes ton chemin. »',
    choix: [
      {
        label: 'Troquer une cartouche contre des antibiotiques',
        besoin: { item: 'cartouches' },
        texte: 'Il fait rouler la cartouche dans sa paume, l\'examine à la lumière de sa lampe, puis glisse la plaquette entre les barreaux. « Bonne affaire. Pour toi comme pour moi. Personne devrait crever d\'une griffure. »',
        effets: { retire: [{ id: 'cartouches', qty: 1 }], items: [{ id: 'antibiotiques', qty: 1 }], tempsMin: 10 },
      },
      {
        label: 'Troquer une bouteille d\'alcool contre un kit de suture',
        besoin: { item: 'alcool_fort' },
        texte: 'Ses yeux s\'allument en voyant l\'étiquette. « Ça, ça soigne ce que les médocs soignent pas. » Le kit de suture passe la grille, encore sous blister. Tu l\'entends déboucher la bouteille avant même d\'avoir tourné les talons.',
        effets: { retire: [{ id: 'alcool_fort', qty: 1 }], items: [{ id: 'kit_suture', qty: 1 }], tempsMin: 10 },
      },
      {
        label: 'Demander des nouvelles du monde',
        texte: 'Il hausse les épaules. « Le monde, il tient dans dix rues maintenant. » Puis, plus bas : « La radio parle d\'un Refuge, à Miramas-le-Vieux, sur son rocher. Moi j\'y crois pas — mais j\'ai vu passer des gens qui y croyaient, et ils avaient l\'air mieux nourris que toi. » Il souffle sa lampe. L\'entretien est terminé.',
        effets: { flag: 'rumeur_refuge', tempsMin: 15 },
      },
      { label: 'Continuer ta route', texte: 'Tu ne troques rien avec un homme dont tu ne vois pas les mains. La grille reste entre vous, et c\'est très bien comme ça.', effets: {} },
    ],
  },
  {
    id: 'ev_r_horde_carrefour',
    types: ['rue'],
    texte: 'Le carrefour est noir de monde. Une ambulance couchée sur le flanc, portes arrière béantes, et autour : trente corps debout, peut-être plus, agglutinés, oscillant sur place comme un champ de blé mort. Quelque chose dans l\'ambulance les retient là. Tu ne veux pas savoir quoi. Mais ta route passe de l\'autre côté.',
    choix: [
      {
        label: 'Ramper sous les voitures en stationnement',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Châssis après châssis, le nez dans l\'huile de vidange et le verre pilé, tu traverses le carrefour sous trente paires de jambes pourrissantes. Quand tu ressors de l\'autre côté, tes mains tremblent et tes coudes saignent un peu. Mais tu es passé.', effets: { sta: -18, xp: { agilite: 12 }, tempsMin: 25 } },
        echec: { texte: 'Sous la troisième voiture, une odeur te prévient une demi-seconde trop tard. Il vit là, dans l\'ombre du châssis, sectionné à la taille. Ses doigts se referment sur ta cheville et il ouvre la bouche en silence.', effets: { combat: 'rampant', tempsMin: 10 } },
      },
      {
        label: 'Traverser par-dessus les toits des voitures',
        test: { skill: 'force', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Capot, toit, coffre, capot. Tu enchaînes les carcasses en te hissant à la force des bras, hors de portée des mains tendues. La tôle gémit mais tient. De l\'autre côté, tu sautes et tu cours.', effets: { sta: -15, xp: { force: 10 }, tempsMin: 15 } },
        echec: { texte: 'Un toit rouillé crève sous ton poids dans un fracas de tôle. La horde entière pivote vers toi d\'un seul mouvement. Les plus frais se mettent à courir.', effets: { pv: -6, sta: -10, combat: ['coureur', 'errant'], tempsMin: 5 } },
      },
      {
        label: 'Faire le grand tour par les ruelles',
        texte: 'Une heure de détour dans des venelles qui puent l\'égout, à sursauter à chaque poubelle renversée. Mais la horde reste là-bas, autour de son ambulance, et toi tu restes entier.',
        effets: { tempsMin: 55, sta: -20 },
      },
    ],
  },
  {
    id: 'ev_r_soldat_bus',
    types: ['rue'],
    texte: 'Un bus articulé en travers de la chaussée, et dessous, coincé jusqu\'au sternum, un soldat. Le casque a roulé plus loin. Sur son gilet tactique, des pochettes de munitions encore fermées. Le corps ne bouge pas. Les corps ne bougent jamais — jusqu\'à ce qu\'ils bougent.',
    choix: [
      {
        label: 'Tirer le corps de sous le bus',
        test: { skill: 'force', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu saisis les sangles et tu tires d\'un coup sec, prêt à bondir en arrière. Le corps glisse, inerte, bien mort — la nuque est ouverte, quelqu\'un est passé avant l\'infection. Tu vides les pochettes en remerciant ce mort de l\'être resté.', effets: { items: [{ id: 'munitions_9mm', qty: 6 }, { id: 'bandage', qty: 1 }], xp: { force: 8 }, tempsMin: 15 } },
        echec: { texte: 'Le corps résiste, puis vient d\'un coup — et sa tête se redresse en claquant des dents. Sectionné au bassin par le bus, il se tracte vers toi sur les coudes, ses entrailles raclant l\'asphalte derrière lui.', effets: { combat: 'rampant', tempsMin: 5 } },
      },
      {
        label: 'Couper les sangles à distance avec la machette',
        besoin: { item: 'machette' },
        texte: 'Tu glisses la lame sous les sangles, un bras tendu, le reste du corps hors de portée. Deux coups secs. Les pochettes tombent dans ta main libre. Le soldat n\'a pas frémi — mais tu n\'avais aucun moyen de le savoir avant, et c\'est exactement pour ça qu\'on garde ses distances.',
        effets: { items: [{ id: 'munitions_9mm', qty: 4 }], sta: -5, tempsMin: 10 },
      },
      { label: 'Laisser le mort à son bus', texte: 'Des munitions, ça ne vaut pas une morsure à l\'aveugle sous trois tonnes de ferraille. Tu passes.', effets: {} },
    ],
  },
  {
    id: 'ev_r_planche_clous',
    types: ['rue'],
    texte: 'La ruelle est jonchée de journaux détrempés, étrangement réguliers, presque alignés. Trop alignés. Quelqu\'un a préparé ce passage — et les taches brunes sur certaines feuilles disent que ça a déjà fonctionné au moins une fois.',
    choix: [
      {
        label: 'Avancer en sondant chaque pas',
        test: { skill: 'dexterite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Du bout de ta semelle, tu soulèves les feuilles une à une. Là : une planche hérissée de clous de charpentier, pointes en l\'air, posée dans une flaque pour étouffer le bruit. Tu la désamorces et tu l\'emportes. Le piégeur repassera — pas toi.', effets: { items: [{ id: 'planche', qty: 1 }, { id: 'clous', qty: 1 }], xp: { dexterite: 10 }, tempsMin: 15 } },
        echec: { texte: 'Le clou traverse la semelle, puis le pied, d\'un seul coup sec. Tu mords ton poing pour ne pas hurler. Il faut un temps infini pour déclouer ta chaussure sans t\'évanouir.', effets: { pv: -10, blessure: { type: 'entaille', zones: ['au pied'] }, tempsMin: 20, sta: -10 } },
      },
      {
        label: 'Traverser en courant, au jugé',
        test: { skill: 'agilite', base: 0.3, parNiveau: 0.12 },
        reussite: { texte: 'Tu traverses la ruelle en trois foulées, au hasard et en apnée. Derrière toi, ton talon a fait voler une feuille de journal : dessous, les clous luisent. Tu as eu de la chance. La chance n\'est pas une stratégie.', effets: { sta: -10, xp: { agilite: 5 } } },
        echec: { texte: 'Deuxième foulée. La planche cloutée traverse ta semelle et le monde devient blanc. Tu t\'effondres dans les journaux mouillés, le pied cloué au bois, et tu dois tirer dessus pour te libérer.', effets: { pv: -16, blessure: { type: 'profonde', zones: ['au pied'] }, sta: -15, tempsMin: 15 } },
      },
      { label: 'Rebrousser chemin', texte: 'Un sol trop propre est un mensonge. Tu refuses l\'invitation et tu repars par où tu es venu.', effets: { tempsMin: 15 } },
    ],
  },
  {
    id: 'ev_r_coups_de_feu',
    types: ['rue'],
    texte: 'Trois détonations, sèches, quelque part au nord. Puis un cri humain — long, qui se casse net. Puis plus rien. Le silence d\'après est pire que les coups de feu. Toute la rue semble retenir son souffle, et toi avec.',
    choix: [
      {
        label: 'Remonter prudemment vers les tirs',
        test: { skill: 'chasse', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu suis les douilles comme des miettes de pain. Au coin d\'une laverie, tu trouves le tireur : il a gagné son combat contre les morts et perdu contre l\'hémorragie. Tu fermes ses yeux, tu vides ses poches. Les charognards approchent déjà — tu ne t\'attardes pas.', effets: { items: [{ id: 'munitions_9mm', qty: 3 }, { id: 'bandage_fortune', qty: 1 }], xp: { chasse: 10 }, tempsMin: 25, sta: -8 } },
        echec: { texte: 'Tu débouches sur la scène une minute trop tard. Deux silhouettes sont déjà penchées sur le tireur, et le bruit qu\'elles font en mangeant te retourne l\'estomac. Elles lèvent la tête vers toi en même temps.', effets: { combat: ['errant', 'errant'], tempsMin: 15 } },
      },
      {
        label: 'Profiter du vacarme pour filer à l\'opposé',
        texte: 'Chaque mort du quartier converge vers les détonations. Toi, tu prends la direction inverse, et pendant dix minutes les rues t\'appartiennent. Quelqu\'un, là-bas, a payé ton passage sans le savoir.',
        effets: { tempsMin: 10, flag: 'rues_degagees' },
      },
      { label: 'Te terrer en attendant', texte: 'Tu te glisses sous un porche et tu comptes les minutes. Personne ne vient. Le cri ne reprend pas. C\'est la réponse à la question que tu ne voulais pas poser.', effets: { tempsMin: 30 } },
    ],
  },
  {
    id: 'ev_r_draps_numerotes',
    types: ['rue'],
    texte: 'Devant l\'ancienne clinique, neuf formes allongées sur le trottoir, chacune sous un drap, chacune avec un numéro tracé au feutre : 1 à 9. Quelqu\'un a pris le temps de les aligner, de les couvrir, de les compter. Le drap du numéro 7 est le seul qui ne soit pas taché au niveau de la tête.',
    choix: [
      {
        label: 'Soulever les draps un à un',
        test: { skill: 'dexterite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu commences par le 7, à bout de bras, prêt à frapper. Il bouge. Bien sûr qu\'il bouge — celui qui les a alignés n\'a pas eu le courage de finir celui-là. Tu fais ce qu\'il n\'a pas fait, d\'un coup sec, avant qu\'il ne se redresse. Les autres ne sont que des morts. Dans leurs poches : de quoi continuer.', effets: { items: [{ id: 'allumettes', qty: 1 }, { id: 'soda', qty: 1 }, { id: 'chiffon', qty: 2 }], xp: { dexterite: 8 }, sta: -12, tempsMin: 25 } },
        echec: { texte: 'Tu commences par le numéro 1. Erreur. Derrière toi, le drap du 7 glisse sans bruit, et quand tu te retournes, la chose est déjà debout — gonflée de gaz, la peau verdâtre tendue à craquer sous la blouse d\'infirmier.', effets: { combat: 'putrefie', tempsMin: 10 } },
      },
      {
        label: 'Ne prendre que le sac posé près du mur',
        texte: 'Un sac de sport attend contre la façade, avec un mot épinglé : « Pour celui qui les enterrera. » Tu n\'enterreras personne et tu prends le sac quand même. Tu vis avec des choses pires que celle-là.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }, { id: 'chiffon', qty: 1 }], tempsMin: 5 },
      },
      { label: 'T\'éloigner de cette morgue à ciel ouvert', texte: 'Neuf draps, neuf histoires terminées. Tu n\'as pas besoin de connaître la fin. Tu changes de trottoir.', effets: {} },
    ],
  },
  {
    id: 'ev_r_lumiere_fenetre',
    types: ['rue'], nuit: true,
    texte: 'Une lueur de bougie au deuxième étage d\'un immeuble haussmannien. Derrière le rideau, une silhouette immobile semble te regarder. Une main se lève — lentement — et fait signe de monter. Dans une ville morte, en pleine nuit, une invitation est soit un miracle, soit un hameçon.',
    choix: [
      {
        label: 'Monter, mais en éclaireur méfiant',
        test: { skill: 'agilite', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Troisième marche du palier : un fil de fer tendu à hauteur de tibia, relié à un casier en équilibre. Tu l\'enjambes. L\'appartement est vide — la « silhouette », c\'est un mannequin de couture devant la bougie, et la main, un système de ficelle. Le piégeur est sorti chasser. Tu vides son garde-manger avant qu\'il ne rentre.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], xp: { agilite: 10 }, tempsMin: 25 } },
        echec: { texte: 'Le fil de fer te fauche en haut de l\'escalier. Tu dévales un demi-étage dans le noir, et pendant que tu cherches ton souffle, des pas légers descendent, fouillent ton sac, remontent. La bougie s\'éteint. La rue redevient noire.', effets: { pv: -12, blessure: { type: 'entaille', zones: ['au mollet', 'au genou'] }, volNourriture: true, sta: -15, tempsMin: 15 } },
      },
      {
        label: 'Observer depuis l\'ombre d\'un porche',
        texte: 'Vingt minutes sans bouger, le froid dans les os. La silhouette ne change jamais de position. Jamais. Aucun vivant ne tient si tranquille — et aucun mort n\'allume de bougie. C\'est un leurre, et quelque part, quelqu\'un attend que tu y croies. Tu repars par l\'arrière.',
        effets: { tempsMin: 25, sta: -8 },
      },
      { label: 'Presser le pas sans répondre', texte: 'Les miracles n\'existent plus depuis des semaines. Tu baisses la tête et tu disparais dans la nuit, en sentant le regard — réel ou non — peser entre tes omoplates.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_r_hurleur_noir',
    types: ['rue'], nuit: true,
    texte: 'Un cri déchire la nuit — pas humain, plus maintenant. Strident, modulé, qui rebondit entre les façades. Impossible de dire d\'où il vient : dix mètres, cinquante ? Le silence retombe. Puis tu entends sa respiration, quelque part dans le noir, sifflante, à travers une gorge qui n\'existe plus qu\'à moitié.',
    choix: [
      {
        label: 'Te figer contre un mur et attendre',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu te fonds dans l\'angle d\'un porche et tu cesses d\'exister. Il passe à trois mètres, tête penchée, la gorge ouverte palpitant à chaque inspiration. Une éternité plus tard, sa respiration s\'éloigne. Tes jambes tiennent à peine.', effets: { sta: -15, xp: { agilite: 10 }, tempsMin: 15 } },
        echec: { texte: 'Ton pied écrase une canette dans le noir. La respiration s\'arrête net. Puis le hurlement explose — droit sur toi — et d\'autres pas répondent déjà au bout de la rue.', effets: { combat: ['hurleur', 'errant'], tempsMin: 5 } },
      },
      {
        label: 'Courir avant qu\'il ne te repère',
        texte: 'Tu cours à l\'aveugle dans les rues noires, les bras devant toi, jusqu\'à ce que tes poumons brûlent. Derrière, le cri retentit — mais loin, et pas pour toi. Cette nuit, c\'est quelqu\'un d\'autre qui répondra à l\'appel.',
        effets: { sta: -28, tempsMin: 10 },
      },
    ],
  },
  {
    id: 'ev_r_peage',
    types: ['rue'],
    texte: 'Un barrage de caddies soudés et de palettes coupe la rue. Sur le toit plat d\'un garage, trois silhouettes encapuchonnées, dont une arme un lance-pierre de chantier avec un boulon gros comme un pouce. « Péage ! » lance une voix jeune, presque un gamin. « De la bouffe, et tu passes. Sinon demi-tour. On tire sur ce qui insiste. »',
    choix: [
      {
        label: 'Payer le passage en nourriture',
        texte: 'Tu poses une partie de tes provisions sur le bidon qui sert de comptoir, et tu recules de trois pas, comme on te l\'ordonne. Un gosse de quinze ans descend les ramasser, le regard dur derrière un foulard. Le barrage s\'ouvre. Personne ne te remercie.',
        effets: { volNourriture: true, tempsMin: 10 },
      },
      {
        label: 'Forcer le passage en sprintant',
        test: { skill: 'agilite', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu fonces dans l\'angle mort du barrage. Le premier boulon siffle à ton oreille, le second étincelle sur une carcasse, et tu es déjà de l\'autre côté, plié en deux entre deux camionnettes. Les insultes pleuvent plus loin que les projectiles.', effets: { sta: -20, xp: { agilite: 12 }, tempsMin: 5 } },
        echec: { texte: 'Le boulon te cueille en pleine course, sous l\'omoplate, avec un bruit de viande frappée. Tu termines la traversée plié de douleur, sous les rires. Ils ne te poursuivent pas. Ils n\'en ont pas besoin.', effets: { pv: -15, blessure: { type: 'entaille', zones: ['dans le dos'] }, sta: -15, tempsMin: 5 } },
      },
      {
        label: 'Rebrousser chemin sans discuter',
        texte: 'Trois tireurs en hauteur contre toi au sol : ce n\'est pas un péage, c\'est une leçon d\'arithmétique. Tu lèves une main ouverte et tu fais le grand tour.',
        effets: { tempsMin: 40, sta: -12 },
      },
    ],
  },
  {
    id: 'ev_r_fourgon_pharma',
    types: ['rue'],
    texte: 'Un fourgon de répartition pharmaceutique a foncé dans un abribus. Les portes arrière sont entrebâillées, retenues par une sangle, et des cartons éventrés laissent voir des boîtes blanches à croix verte. À l\'intérieur, quelque chose remue — un raclement lourd, mou, ponctué d\'un clapotis que tu n\'aimes pas du tout.',
    choix: [
      {
        label: 'Glisser le bras dans l\'entrebâillement',
        test: { skill: 'dexterite', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu plaques ton épaule contre la porte pour bloquer la sangle et tu pêches à l\'aveugle, les doigts entre les cartons, pendant que la chose racle et clapote à trente centimètres de ton coude. Trois boîtes. Ça suffira. Tu retires ton bras au moment où des dents claquent dans le vide.', effets: { items: [{ id: 'desinfectant', qty: 1 }, { id: 'antidouleur', qty: 1 }, { id: 'bandage', qty: 1 }], xp: { dexterite: 10 }, tempsMin: 15, sta: -8 } },
        echec: { texte: 'Des doigts boudinés, tendus à craquer, se referment sur ton avant-bras. Tu t\'arraches à la prise dans un bruit de succion — sa peau reste collée sur la tienne, pas l\'inverse. Ton bras est lacéré et la sangle commence à céder sous les coups de boutoir.', effets: { pv: -10, blessure: { type: 'entaille', zones: ['à l\'avant-bras'] }, sta: -10, tempsMin: 5 } },
      },
      {
        label: 'Trancher la sangle et l\'affronter à découvert',
        texte: 'Tu coupes la sangle et tu recules de cinq pas. Les portes s\'ouvrent sous son poids : un livreur en blouse, gonflé de gaz à faire craquer les coutures, dégringole du fourgon comme une outre pleine. Il se redresse. Le fourgon et tout ce qu\'il contient sont à ce prix.',
        effets: { items: [{ id: 'desinfectant', qty: 1 }, { id: 'antibiotiques', qty: 1 }, { id: 'bandage', qty: 2 }], combat: 'gonfle', tempsMin: 10 },
      },
      { label: 'Laisser le garde-manger à son gardien', texte: 'Une pharmacie ambulante gardée par une chose qui clapote. Tu as connu des marchés plus honnêtes. Tu passes.', effets: {} },
    ],
  },
];
