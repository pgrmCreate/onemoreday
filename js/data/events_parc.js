// Événements de parc supplémentaires — généré par agents (voir schéma dans events.js)
export const EVENTS_PARC = [
  {
    id: 'ev_p_chevreuil',
    types: ['parc'],
    texte: 'Un chevreuil s\'est pris les pattes arrière dans le grillage affaissé qui borde le parc. Il se débat par à-coups, les flancs écumants, le fil de fer enfoncé dans la chair jusqu\'au tendon. Des kilos de viande, vivants, à portée de main.',
    choix: [
      {
        label: 'L\'achever et le dépecer',
        test: { skill: 'chasse', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu saisis les bois, tu tires la tête en arrière et tu tranches. La bête s\'affaisse contre le grillage. Le dépeçage est long, poisseux, et l\'odeur du sang chaud te colle aux mains — mais ce soir, tu ne fouilleras pas les poubelles.', effets: { items: [{ id: 'viande_crue', qty: 3 }], xp: { chasse: 18 }, sta: -18, tempsMin: 45 } },
        echec: { texte: 'Au moment où tu te penches, l\'animal trouve une dernière réserve de panique. Un sabot te cueille en pleines côtes et le grillage cède d\'un coup. Tu le regardes détaler en zigzag, plié en deux, le souffle coupé.', effets: { pv: -10, sta: -15, xp: { chasse: 6 } } },
      },
      {
        label: 'Couper le fil et le libérer',
        texte: 'Tu démêles le fil de fer en parlant à voix basse, sans trop savoir pourquoi. La bête te fixe d\'un œil fou, puis disparaît dans les taillis en trois bonds. Tu enroules le fil. Au moins, lui, il aura eu sa journée de plus.',
        effets: { items: [{ id: 'fil_de_fer', qty: 1 }], sta: -6, tempsMin: 15, xp: { chasse: 3 } },
      },
      { label: 'Passer au large', texte: 'Le raffut qu\'il fait va finir par attirer autre chose que toi. Tu t\'éloignes sans te retourner.', effets: {} },
    ],
  },
  {
    id: 'ev_p_campement',
    types: ['parc'],
    texte: 'Derrière une haie sauvage, une tente igloo affaissée, délavée par les pluies. Un cercle de pierres noircies, une casserole renversée pleine d\'eau de pluie, un fil à linge où pend encore une chaussette. Quelqu\'un a tenu ici un moment. Plus maintenant.',
    choix: [
      {
        label: 'Soulever la toile et fouiller la tente',
        test: { skill: 'dexterite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu écartes la toile centimètre par centimètre, prêt à bondir en arrière. Rien que des affaires moisies — et, au fond du duvet, une boîte de conserve et des allumettes gardées au sec dans un sac de congélation.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'allumettes', qty: 1 }], xp: { dexterite: 5 }, tempsMin: 15 } },
        echec: { texte: 'La toile se gonfle d\'un coup sous ta main. Une figure grise jaillit de la tente effondrée, emmêlée dans le duvet, la mâchoire claquant à dix centimètres de ton poignet. Le propriétaire n\'était jamais parti.', effets: { combat: 'errant', tempsMin: 5 } },
      },
      {
        label: 'Récupérer cordes et sardines du campement',
        texte: 'Tu démontes le campement méthodiquement : les haubans noués bout à bout font une corde honnête, et tu découpes un pan de toile à peu près propre. Le travail te prend du temps, et le cliquetis des sardines arrachées résonne plus que tu ne voudrais.',
        effets: { items: [{ id: 'corde', qty: 1 }, { id: 'chiffon', qty: 1 }], sta: -12, tempsMin: 30 },
      },
      { label: 'Ne toucher à rien', texte: 'Une tente fermée, c\'est une boîte dont tu ne connais pas le contenu. Tu laisses la chaussette sécher pour l\'éternité.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_p_noye',
    types: ['parc'],
    texte: 'Dans l\'étang, parmi les algues et les canettes, un corps flotte face contre l\'eau, les bras en croix. Son sac à dos gonflé d\'air lui fait une bosse de noyé. Il dérive à quelques mètres de la berge, juste trop loin pour l\'atteindre au sec.',
    choix: [
      {
        label: 'Entrer dans l\'eau et le tirer jusqu\'à la berge',
        test: { skill: 'force', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'L\'eau glacée te monte jusqu\'aux cuisses. Tu agrippes une bretelle et tu hales le corps vers la rive, lourd comme une souche gorgée d\'eau. Dans le sac : une conserve intacte et un bandage encore sous plastique. Le visage, tu évites de le regarder.', effets: { items: [{ id: 'conserve_raviolis', qty: 1 }, { id: 'bandage', qty: 1 }], sta: -20, tempsMin: 20, xp: { force: 8 } } },
        echec: { texte: 'Au moment où tu saisis la bretelle, la tête se redresse hors de l\'eau dans un bruit de ventouse. Des doigts blanchis par des semaines d\'étang se referment sur ta cheville. La chose se tracte vers toi, à moitié dissoute, la bouche pleine de vase.', effets: { combat: 'rampant', sta: -15 } },
      },
      {
        label: 'Le crocheter depuis la berge',
        besoin: { item: 'corde' },
        texte: 'Tu lestes un bout de corde, tu lances, et au troisième essai la boucle accroche le sac. Tu ramènes le tout sans mouiller tes chaussures ni approcher tes mains de sa bouche. Le sac rend une conserve et un bandage. Le corps, tu le repousses au large du bout du pied.',
        effets: { items: [{ id: 'conserve_raviolis', qty: 1 }, { id: 'bandage', qty: 1 }], sta: -8, tempsMin: 15 },
      },
      { label: 'Le laisser à l\'étang', texte: 'L\'étang l\'a pris, l\'étang le garde. Tu n\'iras pas marchander avec l\'eau noire.', effets: {} },
    ],
  },
  {
    id: 'ev_p_corbeaux',
    types: ['parc'],
    texte: 'Une vingtaine de corbeaux se disputent quelque chose dans l\'herbe haute, à coups de bec et de claquements d\'ailes. Quand tu approches, ils s\'immobilisent tous en même temps et te regardent. Sous eux, tu devines une forme allongée, une manche, une main.',
    choix: [
      {
        label: 'Approcher pas à pas, sans les effrayer',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu avances comme on traverse une pièce où dort quelqu\'un. Les oiseaux s\'écartent en sautillant, sans un cri, et te regardent fouiller leur garde-manger : un randonneur, mort depuis peu, deux barres de céréales et une canette dans ses poches. Tu laisses le reste aux corbeaux.', effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'soda', qty: 1 }], xp: { agilite: 6 }, tempsMin: 10 } },
        echec: { texte: 'Une brindille casse sous ton pied. Le champ explose en un nuage hurlant d\'ailes noires, un vacarme à réveiller tout le quartier. Quelque part derrière le kiosque, un cri y répond — un cri qui n\'a rien d\'un oiseau.', effets: { combat: 'hurleur', tempsMin: 5 } },
      },
      {
        label: 'Jeter une pierre et fouiller vite',
        texte: 'La pierre disperse la nuée dans un raffut de croassements furieux. Tu fonces, tu retournes les poches — une barre de céréales — et tu files sans demander ton reste pendant que les corbeaux tournent au-dessus de toi en te maudissant.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }], sta: -10, tempsMin: 5 },
      },
      { label: 'Les laisser à leur festin', texte: 'Eux aussi survivent comme ils peuvent. Tu contournes le banquet en silence.', effets: {} },
    ],
  },
  {
    id: 'ev_p_sanglier',
    types: ['parc'],
    texte: 'Un sanglier massif fouille un cadavre au pied d\'un chêne, le groin rouge jusqu\'aux yeux. Les bêtes des bois ont repris la ville, et celles-là ont appris à aimer ce qu\'elles y trouvent. Il relève la tête. Il t\'a senti.',
    choix: [
      {
        label: 'L\'abattre au fusil',
        besoin: { item: 'fusil_chasse' },
        test: { skill: 'visee', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'La détonation roule sur tout le parc. Le sanglier fait trois pas de côté et s\'effondre, une épaule emportée. Tu travailles vite, l\'oreille tendue — un coup de feu, c\'est une invitation, et le découpage te laisse les bras tremblants. Mais quelle viande.', effets: { retire: [{ id: 'cartouches', qty: 1 }], items: [{ id: 'viande_crue', qty: 4 }], xp: { visee: 15, chasse: 8 }, sta: -20, tempsMin: 50 } },
        echec: { texte: 'La gerbe de plomb lui laboure le flanc sans l\'arrêter. Cent kilos de muscles furieux te percutent de plein fouet et une défense t\'ouvre la cuisse avant qu\'il ne disparaisse dans les fourrés, en saignant autant que toi.', effets: { retire: [{ id: 'cartouches', qty: 1 }], pv: -18, blessure: { type: 'entaille', zones: ['à la cuisse'] }, sta: -15, xp: { visee: 5 } } },
      },
      {
        label: 'Reculer sans gestes brusques',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu recules un pas après l\'autre, les yeux baissés, jusqu\'à ce qu\'un massif de ronces te sépare de lui. Le sanglier souffle un grand coup par les naseaux et retourne à son repas.', effets: { sta: -8, tempsMin: 10 } },
        echec: { texte: 'Il charge sans prévenir, plus vite qu\'une bête de ce poids n\'en a le droit. Le choc te jette au sol et une défense te taille le mollet pendant que tu rampes derrière un banc. Il renâcle, satisfait, et repart vers son cadavre.', effets: { pv: -15, blessure: { type: 'entaille', zones: ['au mollet'] }, sta: -20 } },
      },
      {
        label: 'Attendre qu\'il parte et fouiller le cadavre',
        texte: 'Tu t\'accroupis sous le vent et tu attends. Longtemps. Quand le sanglier s\'éloigne enfin en se dandinant, il ne reste du mort que des habits déchirés et ce que les poches ont gardé : quelques balles et un chiffon à peu près propre.',
        effets: { items: [{ id: 'munitions_9mm', qty: 2 }, { id: 'chiffon', qty: 1 }], tempsMin: 50, sta: -5 },
      },
    ],
  },
  {
    id: 'ev_p_baies',
    types: ['parc'],
    texte: 'Un buisson ploie sous des grappes de baies d\'un noir violacé, luisantes de pluie. Ton estomac se tord rien qu\'à les regarder. Sureau ou belladone — tu as su la différence, un jour, dans une autre vie.',
    choix: [
      {
        label: 'Se fier à son instinct et manger',
        test: { skill: 'chasse', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Grappes en ombelle, tiges rougeâtres : du sureau, tu en mettrais ta main au feu. Tu manges à pleines poignées, le jus noir te coule sur le menton, et pendant dix minutes le monde redevient simple.', effets: { faim: 20, xp: { chasse: 8 }, tempsMin: 15 } },
        echec: { texte: 'Les premières poignées passent. C\'est l\'arrière-goût qui te trahit — une amertume métallique qui te remplit la bouche bien après avoir avalé. Tu recraches ce que tu peux. Trop tard. Ton ventre commence déjà à gronder sourdement.', effets: { faim: 8, maladie: 'intoxication', tempsMin: 15 } },
      },
      {
        label: 'Identifier les baies avant tout',
        besoin: { skill: { chasse: 2 } },
        texte: 'Tu écrases une baie entre tes doigts, tu sens le jus, tu comptes les folioles. Du sureau noir, sans le moindre doute. Tu cueilles posément, tu manges lentement, et tu remercies en silence le vieux qui t\'a appris ça.',
        effets: { faim: 18, xp: { chasse: 4 }, tempsMin: 20 },
      },
      { label: 'S\'abstenir', texte: 'Dans le doute, ton estomac attendra. Les morts du parc n\'ont pas tous été mordus.', effets: {} },
    ],
  },
  {
    id: 'ev_p_trainee',
    types: ['parc'], once: true,
    texte: 'Une large traînée brune coupe le sentier en deux, sèche depuis des jours, semée de douilles de 9 mm. Quelque chose — quelqu\'un — a été traîné depuis l\'allée jusqu\'à la remise des jardiniers, là-bas, derrière les ifs. La porte de la remise est entrouverte. Rien n\'en sort. Rien n\'y entre.',
    choix: [
      {
        label: 'Lire les traces et suivre la traînée',
        test: { skill: 'chasse', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Les traces racontent tout : deux personnes, un combat, l\'une tirant l\'autre par les chevilles. Derrière la remise, sous une bâche, leur cache est intacte — munitions, conserve, désinfectant. Du corps traîné, il ne reste qu\'une chaussure. Tu ne cherches pas la suite de l\'histoire.', effets: { items: [{ id: 'munitions_9mm', qty: 5 }, { id: 'conserve_haricots', qty: 1 }, { id: 'desinfectant', qty: 1 }], xp: { chasse: 12 }, tempsMin: 30 } },
        echec: { texte: 'Tu suis la traînée jusqu\'à la remise, et tu pousses la porte du bout du pied. L\'erreur, c\'est d\'avoir cru que ce qui traîne les corps s\'en va ensuite. Ça t\'attendait dans le noir, entre les tondeuses, la bouche encore pleine de son dernier repas.', effets: { combat: 'enrage', tempsMin: 10 } },
      },
      {
        label: 'S\'éloigner sans bruit',
        texte: 'Certaines histoires n\'ont pas besoin d\'être connues. Tu enjambes la traînée comme on enjambe une tombe, et tu presses le pas.',
        effets: { tempsMin: 10 },
      },
    ],
  },
  {
    id: 'ev_p_chat_nuit',
    types: ['parc'], nuit: true,
    texte: 'Deux yeux verts s\'allument dans le noir, à hauteur de cheville. Un chat sort du fourré — gras, lustré, le poil impeccable. Le seul être bien nourri à des kilomètres à la ronde. Il te jauge un instant, miaule une fois, puis trotte vers les arbres avant de s\'arrêter pour vérifier que tu suis.',
    choix: [
      {
        label: 'Le suivre dans le noir',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu le suis de souche en racine jusqu\'à un abri de branchages au cœur d\'un bosquet. À l\'intérieur, un duvet, une lampe, et son maître — sec et paisible, mort depuis des semaines. En voyant la gamelle vide et le chat si gras, tu comprends. Tu prends la conserve et les piles. Lui garde le reste.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'piles', qty: 1 }], sta: -10, tempsMin: 25, xp: { agilite: 6 } } },
        echec: { texte: 'Une racine te fauche en pleine foulée. Le temps de te relever, paumes en sang, les yeux verts ont disparu — et tu es seul au milieu du parc, dans le noir complet, sans plus savoir d\'où tu viens.', effets: { pv: -6, blessure: { type: 'egratignure', zones: ['à la main'] }, sta: -14, tempsMin: 20 } },
      },
      {
        label: 'L\'attraper pour le manger',
        test: { skill: 'chasse', base: 0.3, parNiveau: 0.13 },
        reussite: { texte: 'Tu ne regardes pas ce que font tes mains. Ça ne dure pas longtemps. La faim a gagné cette bataille-là il y a des semaines déjà — il ne reste qu\'à vivre avec, et à manger.', effets: { items: [{ id: 'viande_crue', qty: 1 }], xp: { chasse: 8 }, sta: -10 } },
        echec: { texte: 'Tes doigts se referment sur du vide et quatre griffes te répondent, profondes, précises. Le chat disparaît dans la nuit sans un bruit. Lui, ça fait longtemps qu\'il a appris à survivre aux affamés.', effets: { pv: -4, blessure: { type: 'egratignure', zones: ['à la main', 'à l\'avant-bras'] }, sta: -10, xp: { chasse: 3 } } },
      },
      { label: 'Le regarder disparaître', texte: 'Les yeux verts clignent une fois, puis s\'éteignent dans le fourré. Tu n\'en es pas encore à manger les chats. Pas encore.', effets: {} },
    ],
  },
];
