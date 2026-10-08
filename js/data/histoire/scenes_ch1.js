// ============ CHAPITRE 1 — « Les vivants » (Salon) ============
// Hub : la maison de Nostradamus (Maud). Lieux clés : nostradamus, emperi, saint_laurent, hopital.
// Fil : la radio de Vidal → Lou et Nathan à Saint-Laurent → la radio ne répond qu'authentifiée →
//       le registre de Maud à l'hôpital (la vérité : « un pour un ») → confrontation → la nuit des sonnailles.
// Secondaire : le sac rouge (le téléphone, la vidéo du 6 septembre : Vidal a fermé la grille sur toi).
// Dialogues « à sujets » des PNJ (Maud, Vidal, Lou) : voir scenes_pnj.js.

export const SCENES_CH1 = {

  // ─────────────────────────── LE MATIN CHEZ NOSTRADAMUS ───────────────────────────
  // Déclencheur : entrée dans 'nostradamus' si 'prologue_fini' et pas 'ch1_matin_fait'.
  ch1_matin: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: 'Le matin entre par une fenêtre haute. Tu te réveilles dans la maison de Nostradamus, qui est devenue un musée. Maud, elle, n’a pas dormi. Elle est assise au bureau de Nostradamus, au premier étage, entre une vieille sphère d’astronomie et un crâne en plâtre. Devant elle, un scanner radio, un récepteur qui capte les conversations de l’armée, est branché sur une batterie de voiture et crachote des chiffres.\n\nElle pousse vers toi une boîte de raviolis ouverte et froide, avec une cuillère plantée dedans.\n\n« Mange. Et écoute bien, parce que je ne répéterai pas : j’ai trop de choses à dire, et il ne me reste plus beaucoup de voix. »',
    choix: [
      {
        label: 'Manger et écouter',
        effets: { faim: 30, flag: 'ch1_matin_fait', quete: ['q_protocole', 'debut'] },
        suivant: 'ch1_matin_2',
      },
    ],
  },

  ch1_matin_2: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Le mercredi 2 septembre, jour de marché, à 10 h 40, une femme a mordu son mari devant l’étal du fromager, cours Carnot. À midi, j’avais quarante personnes mordues aux urgences, et le soir trois cents, dont une partie de mes infirmières. Les mordus mouraient, puis ils se relevaient et mordaient à leur tour. » Elle tapote le scanner. « Au bout de trois jours, l’armée a reculé au nord de la Durance, la rivière. Tout ce qui se trouve au sud, de la Crau jusqu’à Marseille, est devenu une zone interdite, et personne n’a le droit d’en sortir. »\n\nElle monte le son, et tu entends une voix de femme, nette et lasse, qui répète en boucle :\n\n« …ici le PC Durance. La zone d’exclusion sanitaire est maintenue. Il est interdit de franchir la Durance. Toute personne qui s’approchera de la ligne sera abattue… »\n\n« Le PC Durance, c’est le poste de commandement de l’armée, de l’autre côté de la rivière. Ça, c’est ce qu’ils disent en clair, pour que tout le monde l’entende. » Maud baisse le son. « Leurs messages codés sont plus intéressants. »',
    choix: [{ label: '« Que disent les messages codés ? »', suivant: 'ch1_matin_cautere' }],
  },

  ch1_matin_cautere: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Je ne sais pas décoder leurs messages, mais il arrive qu’un opérateur fatigué laisse passer des mots en clair. » Elle tourne son carnet vers toi, et tu lis trois lignes soulignées deux fois :\n\nCAUTÈRE.\nPREMIER ÉPISODE DE MISTRAL.\nLIGNE DURANCE — MISE À FEU.\n\n« Un cautère, c’est un fer rouge : on brûle une plaie pour qu’elle arrête de saigner. Cautère, c’est le nom de leur plan. » Elle referme le carnet. « Ils attendent le mistral, le grand vent du nord. Le premier jour où il soufflera, ils mettront le feu le long de la Durance, et le vent poussera l’incendie jusqu’à la mer. Il brûlera les collines, les forêts, la Crau, les villages et les morts. Et nous avec. »\n\nDehors, les platanes bougent à peine : pour l’instant, il n’y a pas un souffle de vent.',
    choix: [
      { label: '« Il faut prévenir les vivants. »', suivant: 'ch1_matin_plan' },
      { label: '« Et moi, dans tout ça ? »', suivant: 'ch1_matin_plan' },
    ],
  },

  ch1_matin_plan: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Il reste une trentaine de vivants au château de l’Empéri : un prof du lycée et ses élèves. Ils se sont enfermés dans le château le premier jour, et ils n’en sont jamais ressortis. » Maud allume une cigarette, pour de vrai cette fois. « Ils ont une radio militaire, récupérée sur une patrouille morte. Avec elle, je peux parler à Orsini, la commandante du PC Durance. Je l’ai connue pendant les trois premiers jours, à la cellule de crise de la préfecture, et elle m’écoutera. »\n\nElle te désigne du menton, de la tête aux pieds.\n\n« Et c’est toi qui feras qu’elle m’écoute : un mort qui parle. Si l’armée apprend que les morts peuvent revenir, elle ne mettra pas le feu, parce qu’on ne brûle pas des malades qu’on peut sauver. » Elle souffle la fumée. « S’il leur faut des preuves, mon registre est resté à l’hôpital. On verra ça après. »\n\nElle écrase sa cigarette à peine entamée.\n\n« Monte au château de l’Empéri et demande la radio à Vidal, le prof. Mais d’abord, on va s’occuper de ton bras, parce que là-haut, ils vérifient les bras de tous ceux qui arrivent. »',
    choix: [
      {
        label: 'Continuer',
        effets: {
          quete: ['q_protocole', 'emperi'], decouvrir: ['emperi', 'hopital'],
          journal: 'Maud : l’armée garde la Durance et attend le premier jour de mistral pour tout brûler (plan « Cautère »). Elle veut une radio pour parler à la commandante Orsini, et me montrer comme preuve que les morts peuvent revenir. La radio est au château de l’Empéri, chez un prof, Vidal.',
        },
        suivant: 'nos_bras',
      },
    ],
  },

  nos_bras: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« À l’Empéri, ils n’ont qu’une règle : à la porte, on montre ses bras. S’ils voient une morsure, même ancienne, même cicatrisée, c’est une balle ou un coup de sabre, selon qui est de garde. »\n\nMaud descend dans la cuisine du musée. Dans la grande cheminée, un long fer à manche de bois chauffe dans les braises, et son bout est déjà rouge.\n\n« C’est un cautère, un vrai, du seizième siècle, que le musée de l’Empéri avait prêté pour une exposition sur la peste. Personne ne s’en est servi depuis quatre cents ans. » Elle le retourne dans les braises. « Si je brûle ta morsure, elle disparaît. Une brûlure, ça s’explique facilement : une casserole, un incendie. Ça fait très mal, mais ça ne dure que trois secondes. »\n\nElle ne t’oblige à rien. Elle attend, en femme qui a l’habitude qu’on lui dise non.',
    choix: [
      { label: 'Brûler la morsure au fer rouge', suivant: 'nos_cautere' },
      { label: 'Cacher la morsure sous un bandage', suivant: 'nos_bandage' },
      { label: 'Ne rien faire et garder la morsure visible', suivant: 'nos_bras_nu' },
    ],
  },

  nos_cautere: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Tu poses ton avant-bras à plat sur la table de chêne, et Maud te glisse une cuillère en bois entre les dents. « Mords. Ça, tu sais faire. »\n\nLe fer arrive.\n\nAu début, ce n’est pas une douleur, c’est un bruit : le grésillement de la viande dans une poêle. Ensuite vient l’odeur, celle de ta propre chair, qui sent le barbecue du dimanche. Et enfin la douleur, qui monte du coude jusqu’aux yeux, si fort que tes dents s’enfoncent dans la cuillère jusqu’à la fendre.\n\nMaud avait raison, ça ne dure que trois secondes. Mais ce sont les trois secondes les plus longues de ta vie, de tes deux vies.\n\nQuand elle retire le fer, la marque des dents a disparu. À la place, il y a une plaie luisante, rouge et blanche, qui ressemble à un accident.\n\n« Voilà », dit-elle en l’enveloppant de gaze. « Tu t’es {brûlé|brûlée} en faisant chauffer de l’eau. Répète. »',
    choix: [
      {
        label: '« Je me suis {brûlé|brûlée} en faisant chauffer de l’eau. »',
        effets: {
          flags: { cicatrice_brulee: true, bras_decide: true },
          blessure: { type: 'brulure', zone: "à l'avant-bras" },
          pv: -12,
          journal: 'Maud a effacé ma morsure au fer rouge. Si on me demande : je me suis {brûlé|brûlée} avec de l’eau bouillante.',
        },
        suivant: 'nos_bras_fin',
      },
    ],
  },

  nos_bandage: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud hausse les épaules et retire le fer des braises. Elle t’enroule l’avant-bras dans une bande bien serrée, qu’elle ferme avec trois tours de sparadrap.\n\n« Si on te pose la question, c’est une coupure : un éclat de vitre, et tu t’es {recousu|recousue} toi-même. Si on veut défaire le pansement, tu refuses en disant que ça va se rouvrir. » Elle serre le dernier tour un peu trop fort. « Et si on insiste, tu cours. »',
    choix: [
      {
        label: 'Rabattre ta manche',
        effets: { flags: { bras_bande: true, bras_decide: true } },
        suivant: 'nos_bras_fin',
      },
    ],
  },

  nos_bras_nu: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Comme tu veux. » Elle retire le fer des braises et le pose sur la pierre, où il continue de rougir pour rien. « Alors ne mens pas à moitié. Si tu montres ce bras, dis-leur que tu es {immunisé|immunisée}, que la maladie ne t’a pas {eu|eue}. C’est un mensonge qu’ils auront envie de croire. »',
    choix: [
      {
        label: 'Rabattre ta manche',
        effets: { flags: { bras_nu: true, bras_decide: true } },
        suivant: 'nos_bras_fin',
      },
    ],
  },

  nos_bras_fin: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Va. Le château de l’Empéri est à trois cents mètres, en haut de la montée du Puech. Tu ne peux pas le rater : c’est la seule chose à Salon qui tienne encore debout, et qui ait envie de le rester. »\n\nElle retourne à son scanner, et ajoute sans se retourner :\n\n« Et ne descends pas à la cave. »',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  // Marqueur 'cave_patiente' (cave voûtée de la maison) : Mireille, P5, en dormance.
  nos_cave: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'La cave voûtée sent la pierre mouillée et le désinfectant. Tu y vois des tonneaux du musée, une vieille lanterne et, sur un lit de camp, une forme humaine sous un drap.\n\nUne chaîne de vélo relie le pied du lit à un pilier, et une cheville grise dépasse du drap. Tu en soulèves le bord.\n\nC’est une femme d’une quarantaine d’années, en blouse blanche de pharmacienne, les yeux fermés et les lèvres bleues. Elle ne respire pas. Tu poses deux doigts sur son cou et tu attends longtemps, jusqu’à sentir enfin son cœur battre sous tes doigts, une seule fois.\n\nElle est dans l’état où tu étais dans ta housse, ni morte ni vivante : elle dort.\n\nSur le pilier, quelqu’un a scotché une feuille de soins couverte de l’écriture de Maud.',
    choix: [
      {
        label: 'Lire la feuille',
        effets: { flag: 'cave_vue', document: 'doc_fiche_p5' },
        suivant: 'nos_cave_2',
      },
    ],
  },

  nos_cave_2: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'Tu lis « P5 », patiente numéro 5 : Mireille A., pharmacienne sur le cours Carnot. En dessous, une colonne de températures remonte jour après jour, d’un demi-degré à chaque fois.\n\nTa température a dû remonter de la même façon, avant ton réveil.\n\nTu rabats le drap et tu remontes l’escalier sans faire de bruit, avec l’impression que quelqu’un te regarde dans le dos, les yeux fermés.',
    choix: [{ label: 'Remonter', suivant: '#fin' }],
  },

  // ─────────────────────────── L’EMPÉRI ───────────────────────────
  // Déclencheur : entrée dans 'emperi' si quête q_protocole à 'emperi' et pas 'emp_arrivee_faite'.
  emp_arrivee: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'La montée du Puech grimpe raide entre deux murs, sur des pavés polis par les siècles. Sur la gauche, tu passes devant les grilles du lycée, un banc renversé et une banderole de rentrée, BIENVENUE AUX SECONDES, qui ne tient plus que par un coin. Au-dessus se dresse le château de l’Empéri, avec ses murs de huit mètres, ses tours carrées et sa pierre couleur de pain brûlé.\n\nLa porte est barrée par une grille de chantier renforcée de palettes. Derrière, deux adolescents de quinze ou seize ans montent la garde, l’un avec un casque de vélo, l’autre avec un vieux casque de soldat à crinière noire pris au musée. Ils tiennent chacun un sabre du musée, et leurs lames tremblent un peu.\n\n« Stop. Pas un pas de plus. » La voix de l’adolescent est encore en train de muer. « Montre tes bras, les deux. Remonte tes manches jusqu’aux épaules. »',
    choix: [
      { label: 'Montrer ton bras brûlé', si: { flag: 'cicatrice_brulee' }, suivant: 'emp_insp_brulure' },
      { label: 'Montrer le bandage', si: { flag: 'bras_bande' }, suivant: 'emp_insp_bandage' },
      { label: 'Montrer ton bras et la morsure', si: { flag: 'bras_nu' }, suivant: 'emp_insp_morsure' },
      { label: 'Montrer ton bras', si: { pasFlag: 'bras_decide' }, suivant: 'emp_insp_morsure' },
      { label: 'Redescendre', suivant: '#fin' },
    ],
  },

  emp_insp_brulure: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'Tu remontes tes manches. Sur le bras droit, il n’y a rien. Sur le gauche, tu défais toi-même la gaze et tu montres la brûlure, laide et luisante, couverte de cloques sur les bords.\n\nL’adolescent au casque à crinière se penche à travers la grille en grimaçant. « C’est quoi, ça ?\n\n— De l’eau bouillante.\n\n— Ça date de quand ?\n\n— D’hier. »\n\nIl te regarde longtemps. Derrière lui, un homme approche : il est grand et maigre, avec une barbe de trois semaines, des lunettes réparées au sparadrap et un pull de laine bleue trop chaud pour la saison. Il regarde la brûlure, puis tes yeux, puis de nouveau la brûlure.\n\n« Ça a dû faire mal », dit-il simplement. Puis il fait un signe. « Ouvrez. »',
    choix: [
      {
        label: 'Entrer',
        effets: { flags: { emp_arrivee_faite: true, emp_entree_ok: true, emp_statut: 'normal' } },
        suivant: 'emp_vidal_1',
      },
    ],
  },

  emp_insp_bandage: {
    illu: 'montee_puech', musique: 'tension',
    texte: '« Et ça ? » L’adolescent pointe son sabre vers ton avant-bras gauche, qui est bandé.\n\n« C’est une coupure, un éclat de vitre.\n\n— Enlève le bandage.\n\n— Si je l’enlève, ça va se rouvrir. »',
    choix: [
      {
        label: 'Maintenir ton mensonge',
        test: { chance: 0.55 },
        reussite: {
          texte: 'L’adolescent hésite. Derrière lui, un homme grand et maigre, en pull de laine bleue, avec des lunettes réparées au sparadrap, lui pose une main sur l’épaule.\n\n« Laisse, Hugo. Une vitre, c’est une vitre. » Il te regarde droit dans les yeux, une seconde de trop, puis il dit : « Ouvrez. »',
          effets: { flags: { emp_arrivee_faite: true, emp_entree_ok: true, emp_statut: 'normal' } },
          suivant: 'emp_vidal_1',
        },
        echec: {
          texte: 'Hugo glisse la pointe de son sabre entre deux barreaux, sous la bande, et la tranche d’un coup sec. Le bandage tombe, et en dessous, il n’y a pas de coupure : il y a une morsure.',
          suivant: 'emp_insp_morsure_vue',
        },
      },
      { label: 'Défaire le bandage', suivant: 'emp_insp_morsure_vue' },
    ],
  },

  emp_insp_morsure: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'Tu remontes tes manches, et la morsure apparaît en plein jour : la marque rose et luisante d’une mâchoire sur ton avant-bras.\n\nLes deux sabres se lèvent en même temps.',
    choix: [{ label: 'Ne pas bouger', suivant: 'emp_insp_morsure_vue' }],
  },

  emp_insp_morsure_vue: {
    illu: 'montee_puech', musique: 'tension',
    texte: '« MORSURE ! »\n\nLe cri résonne contre les murs, et aussitôt tu entends des pas, des portes, des voix. En dix secondes, six adolescents sont sur le rempart au-dessus de la porte, et une arbalète bricolée vise ton front.\n\nUn homme en pull bleu arrive en courant et s’arrête net. Il regarde ton bras sans rien dire, si longtemps que l’adolescent à l’arbalète finit par demander : « Monsieur ? On tire ? »\n\n« Elle est cicatrisée », dit l’homme. « C’est une morsure cicatrisée. » Il retire ses lunettes, les essuie sur son pull et les remet. « Ça n’existe pas. Les mordus meurent tous. »',
    choix: [
      { label: '« Je suis {immunisé|immunisée}. »', suivant: 'emp_immunise' },
      { label: '« Mon cœur s’est arrêté. Il est reparti. »', suivant: 'emp_verite' },
      { label: 'Reculer lentement', suivant: 'emp_recul' },
    ],
  },

  emp_immunise: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le mot tombe dans le silence. Là-haut, sur le rempart, les visages changent, et tu vois monter dans leurs yeux l’envie de te croire.\n\n« {Immunisé|Immunisée} », répète l’homme pour lui-même, comme un mot d’une langue étrangère. Il ne te croit pas, mais il ne croit pas non plus le contraire : il est prof, et il a appris à lire une copie jusqu’au bout avant de juger.\n\n« Julien Vidal. Je m’occupe d’eux. » Il montre les murs et les adolescents. « Tu dormiras dans la chapelle, porte fermée à clé, et quelqu’un te surveillera toute la nuit. Si ça ne te va pas, tu redescends. »',
    choix: [
      {
        label: 'Accepter',
        effets: { flags: { emp_arrivee_faite: true, emp_entree_ok: true, emp_statut: 'immunise' } },
        suivant: 'emp_vidal_1',
      },
    ],
  },

  emp_verite: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu racontes tout : la housse, l’étiquette, le cimetière, la tour. Tu le racontes mal et dans le désordre, et ça sonne exactement comme ce que c’est : de la folie.\n\nPersonne ne rit, et c’est pire.\n\n« Redescends », dit Vidal, très doucement, comme on parle à quelqu’un qui se tient au bord d’un toit. « Redescends, et ne reviens pas. Si tu reviens, ils tireront. »\n\nTu fais demi-tour. Au bout de dix pas, sa voix te rattrape, plus basse et cassée.\n\n« Attends. » Il se tait un moment. « Il me manque deux élèves, Lou et Nathan. Ils sont partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent, l’église du quartier, et ils ne sont pas revenus. » Tu l’entends avaler sa salive. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre la porte. »',
    choix: [
      {
        label: '« Je te les ramène. »',
        effets: {
          flags: { emp_arrivee_faite: true, emp_statut: 'rejete' },
          quete: ['q_protocole', 'saint_laurent'], decouvrir: ['saint_laurent'],
          journal: 'L’Empéri m’a fermé sa porte. Vidal, le prof, m’ouvrira si je lui ramène deux de ses élèves, Lou et Nathan, partis à la collégiale Saint-Laurent.',
        },
        suivant: '#fin',
      },
    ],
  },

  emp_recul: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu recules d’un pas, les mains ouvertes, puis d’un autre, et l’arbalète te suit.\n\n« Attends », dit l’homme au pull bleu, qui a l’air de détester ce qu’il va dire. « Il me manque deux élèves, Lou et Nathan. Ils sont partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent, l’église du quartier, et ils ne sont pas revenus. » Il remonte ses lunettes. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre la porte. »',
    choix: [
      {
        label: '« Je te les ramène. »',
        effets: {
          flags: { emp_arrivee_faite: true, emp_statut: 'rejete' },
          quete: ['q_protocole', 'saint_laurent'], decouvrir: ['saint_laurent'],
          journal: 'L’Empéri m’a fermé sa porte. Vidal m’ouvrira si je lui ramène Lou et Nathan, partis à la collégiale Saint-Laurent.',
        },
        suivant: '#fin',
      },
    ],
  },

  emp_vidal_1: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Dans la grande cour du château, du linge sèche sur une corde tendue entre deux colonnes, et une marmite fume sur un feu de palettes. Il y a des adolescents partout, vingt ou vingt-cinq, des lycéens et un petit de sixième qu’on a gardé quand même. Ils te regardent comme un animal au zoo : de loin, avec un peu de pitié et beaucoup de curiosité.\n\nL’homme au pull bleu te fait asseoir sur une marche.\n\n« Julien Vidal, prof d’histoire-géographie. J’ai dix-neuf élèves et six adultes, dont deux qui ne se lèvent plus. On tient parce que les murs tiennent : en 1909, un tremblement de terre a fendu la ville, et ces murs-là n’ont pas bougé. » Il parle comme en cours, parce que c’est sa façon de tenir. « Qu’est-ce que tu veux ? »',
    choix: [{ label: '« La radio. Pour Maud Sérane. »', suivant: 'emp_vidal_radio' }],
  },

  emp_vidal_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Sérane. » Le nom fait passer une ombre sur son visage, qui s’efface aussitôt. « La docteure. Au début, elle a recousu deux de mes élèves. Après, on lui en a amené d’autres, et certains ne sont pas revenus. » Il retire ses lunettes. « On ne sauve pas tout le monde. »\n\nIl regarde la tour d’angle, où une antenne est fixée au bout d’un bâton de ski.\n\n« Cette radio, c’est mon seul lien avec l’extérieur, et je ne la prête pas. » Il remet ses lunettes. « Mais j’ai un problème, et toi, tu as des jambes. Lou et Nathan, deux de mes élèves, sont partis hier à l’aube à la collégiale Saint-Laurent. Ils allaient chercher des cierges pour s’éclairer, et du vin de messe pour désinfecter les plaies. Ils devaient rentrer à midi. »\n\nSa voix ne tremble pas, mais ses mains, elles, tremblent.\n\n« Ramène-les-moi, et je te prête la radio pendant une heure. »',
    choix: [
      {
        label: '« Je te les ramène. »',
        effets: {
          quete: ['q_protocole', 'saint_laurent'], decouvrir: ['saint_laurent'],
          journal: 'Vidal prêtera sa radio si je lui ramène Lou et Nathan, partis à la collégiale Saint-Laurent.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── SAINT-LAURENT ───────────────────────────
  // Déclencheur : entrée dans 'saint_laurent' si quête à 'saint_laurent'.
  stl_entree: {
    illu: 'collegiale_nef', musique: null,
    texte: 'La collégiale Saint-Laurent, la grande église du quartier, se dresse au bout du square, trop haute pour la place qu’on lui a laissée, avec son clocher à huit côtés. Sur le parvis, tu vois un vélo couché, un sac de sport ouvert et vide, et un chien.\n\nC’est un petit chien roux, attaché à la grille du square par une corde, terriblement maigre. Il n’aboie pas : il remue la queue une fois, comme pour s’excuser.\n\nSur le lourd portail de bois, quelqu’un a écrit à la craie, en lettres rondes : ON EST DEDANS. L + N. 7 H. L et N, ce sont Lou et Nathan.',
    choix: [
      { label: 'Détacher le chien', suivant: 'stl_chien' },
      { label: 'Entrer', suivant: '#fin' },
    ],
  },

  stl_chien: {
    illu: 'collegiale_nef', musique: null,
    texte: 'Tu dénoues la corde, mais le chien ne s’enfuit pas. Il boit dans ta main ce qui reste de ta gourde, sans lever les yeux, puis il s’assoit devant le portail fermé et il attend.\n\nSur son collier pend une médaille en forme d’os, où tu lis PISTACHE, avec un numéro de téléphone que plus personne n’appellera.',
    choix: [{ label: 'Entrer', effets: { flag: 'pistache_libre' }, suivant: '#fin' }],
  },

  // Déclencheur (zone) : entrée dans la nef.
  stl_nef: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'En entrant, tu sens d’abord le froid, puis l’odeur de cire, et ensuite tu vois les morts.\n\nLa nef est pleine : quarante ou cinquante morts se tiennent debout entre les bancs, immobiles, épaule contre épaule, tournés vers l’autel comme des fidèles qui attendent le début de la messe. Ce sont des gens du quartier, en vêtements de tous les jours, une caissière en blouse, un adolescent avec un casque de scooter à la main. Ils étaient venus se réfugier ici le premier dimanche, et ils y sont restés.\n\nAu fond, derrière l’autel, un prêtre mort en longue robe blanche tachée agite une clochette dorée. Il la fait sonner sans s’arrêter, régulièrement, comme s’il attendait une réponse.\n\nToutes les têtes suivent le son, et aucune ne se tourne vers toi. Tant que la clochette sonne, elle couvre le bruit de tes pas.\n\nTa lampe, en revanche, peut les réveiller : si son faisceau passe sur eux de trop près, ils verront la lumière et se retourneront. Éteins-la, ou ne la braque jamais sur eux.',
    choix: [
      {
        label: 'Avancer sans faire de bruit',
        effets: { journal: 'La collégiale Saint-Laurent est pleine de morts debout, tournés vers l’autel. Un prêtre mort agite sa clochette. Tant qu’elle sonne, ils ne m’entendent pas. Mais si ma lampe les éclaire de près, ils se retourneront.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'cure_autel' : voler la clé de la sacristie à la ceinture du prêtre.
  stl_cure: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Tu es tout près du prêtre. Tu vois les veines noires sous la peau de ses mains, sa mâchoire qui mâche dans le vide et l’anneau de la clochette passé à son doigt. À sa ceinture de corde pend un trousseau de trois clés de fer, et l’une d’elles, longue et ouvragée, porte une étiquette : SACRISTIE. La sacristie, c’est la pièce derrière l’autel, qui a une porte donnant sur la rue.\n\nLa clochette continue de sonner.\n\nSi elle s’arrête, tous les morts se retourneront.',
    choix: [
      {
        label: 'Détacher les clés entre deux coups de clochette',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Au rythme de la clochette, tu soulèves l’anneau, puis tu le fais glisser lentement le long de la corde, un coup après l’autre. Le trousseau finit dans ta main, et le prêtre continue d’appeler un Dieu qui ne répond plus.',
          effets: { objet: ['cle_sacristie', 1], xp: { dexterite: 12 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Les clés s’entrechoquent avec un petit bruit de ferraille, presque rien.\n\nMais la clochette s’arrête.\n\nLe prêtre baisse les yeux vers toi, et derrière toi, tu entends cinquante têtes se tourner ensemble dans un froissement de tissu.',
          effets: { objet: ['cle_sacristie', 1], combat: { zombies: ['errant'] } },
          suivant: 'stl_cure_apres',
        },
      },
      { label: 'Renoncer pour l’instant', suivant: '#fin' },
    ],
  },

  stl_cure_apres: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Le prêtre est à terre, la clochette dans la main, et elle ne sonne plus.\n\nAlors tous les morts de la nef se mettent en marche vers toi.',
    choix: [{ label: 'Courir', effets: { bruit: 3 }, suivant: '#fin' }],
  },

  // Marqueur 'tombeau_nostradamus' (chapelle de la Vierge, fermée par une grille).
  stl_nathan: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'La chapelle de la Vierge, sur le côté de l’église, est fermée par une grille de fer forgé. Derrière, contre le mur, une plaque de marbre porte un portrait gravé et un nom : MICHEL NOSTRADAMUS. C’est son tombeau. Ses os reposent ici depuis 1791, depuis que des soldats de la Révolution ont ouvert sa première tombe et, dit-on, bu du vin dans son crâne.\n\nDevant la plaque, un garçon de seize ans est couché sur les dalles. Il porte un sweat du lycée de l’Empéri et des baskets neuves, et sa main droite est enroulée dans un tee-shirt plein de sang. C’est sûrement Nathan.\n\nQuand ta lampe passe sur lui, il ouvre les yeux, et tu vois qu’ils sont blancs : il est mort.\n\nIl se lève sans se presser, comme au sortir d’une sieste, et vient coller son visage contre la grille. De ton côté, la grille est fermée par un antivol de vélo. Quelqu’un l’a enfermé là, quelqu’un qui savait qu’il allait se transformer.',
    choix: [
      { label: 'Prendre un chandelier et l’achever à travers la grille', suivant: 'stl_nathan_acheve' },
      { label: 'Le laisser', effets: { flag: 'nathan_laisse' }, suivant: '#fin' },
    ],
  },

  stl_nathan_acheve: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'Le chandelier de bronze est lourd. Tu passes le bras entre deux barreaux, et Nathan se laisse faire, la bouche ouverte et les doigts accrochés au fer, tendu vers toi comme un enfant vers un gâteau.\n\nTu frappes une première fois, et il recule d’un pas, surpris. Tu frappes encore, il tombe à genoux devant le tombeau de Nostradamus, et tu continues jusqu’à ce qu’il ne bouge plus.\n\nTout là-haut, quelque part dans le clocher, tu entends quelqu’un pleurer sans bruit.',
    choix: [
      { label: 'Reposer le chandelier', effets: { flag: 'nathan_acheve', document: 'doc_tombeau' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'clocher_lou' (chambre des cloches du clocher octogonal).
  stl_lou: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Tout en haut de l’escalier en colimaçon, dans la salle des cloches, une fille est assise dos au mur, un couteau à pain tenu à deux mains et pointé vers toi. Elle a quinze ans, des cheveux coupés court et mal, aux ciseaux de cuisine, un sweat trop grand et un carnet à dessin glissé dans la ceinture. À côté d’elle, il y a un cabas plein de cierges et trois bouteilles de vin de messe.\n\nElle ne baisse pas le couteau.\n\n« Tu viens du château ? » Sa voix est cassée par la soif. « C’est Vidal qui t’envoie ? »\n\nQuand tu dis oui, elle baisse le couteau d’un centimètre. C’est Lou.\n\n« Nathan… » Elle regarde vers l’escalier. « Le curé l’a mordu hier. Il m’a demandé de l’enfermer dans la chapelle. Il disait que celui qui ouvre le tombeau de Nostradamus meurt dans l’année, et qu’il avait toujours voulu vérifier. » Elle rit d’un rire sec, horrible. « C’était un con. C’était mon meilleur pote. »',
    choix: [
      { label: '« C’est fini, pour Nathan. »', si: { flag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_fini' },
      { label: '« Il est toujours derrière la grille. »', si: { pasFlag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_vivant' },
    ],
  },

  stl_lou_nathan_fini: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou regarde tes mains et le sang qui les couvre, puis elle hoche la tête, une seule fois.\n\n« Merci », dit-elle, et c’est le merci le plus dur que tu entendras de ta vie.',
    choix: [{ label: '« On sort. »', suivant: 'stl_lou_sortie' }],
  },

  stl_lou_nathan_vivant: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: '« Je sais. Je l’entends. » Elle serre le couteau. « Je voulais le faire, mais je n’ai pas pu. » Elle te regarde. « Tu le ferais, toi ? »',
    choix: [
      { label: '« Oui. Je m’en occupe en descendant. »', suivant: 'stl_lou_nathan_faire' },
      { label: '« Non. On le laisse là. »', effets: { flag: 'nathan_laisse' }, suivant: 'stl_lou_sortie' },
    ],
  },

  stl_lou_nathan_faire: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'En descendant, tu t’arrêtes devant la grille de la chapelle. Lou reste en haut des marches : elle ne regarde pas, elle écoute.\n\nQuand tu remontes, elle a les yeux secs et la mâchoire serrée à s’en casser les dents.\n\n« Il disait que Nostradamus avait tout prédit, dit-elle. Même lui. »',
    choix: [{ label: '« On sort. »', effets: { flag: 'nathan_acheve' }, suivant: 'stl_lou_sortie' }],
  },

  stl_lou_sortie: {
    illu: 'collegiale_nef', musique: 'tension', orateur: 'Lou',
    texte: 'Elle se relève en s’appuyant au mur, et elle regarde longuement ton visage à la lumière de ta lampe, les sourcils froncés.\n\n« On s’est déjà vus, nous deux.\n\n— Je ne crois pas.\n\n— Si. » Elle secoue la tête. « Laisse tomber. Je suis crevée, je vois des gens partout. »\n\nElle ramasse le cabas de cierges. « Par la grande porte, c’est impossible, ils sont tous dans la nef. On va sortir par la sacristie, derrière l’autel. Sauf que la porte est fermée à clé, et que c’est le curé qui a la clé. » Elle avale sa salive. « Et le curé, il est devant l’autel, avec sa clochette. »',
    choix: [
      { label: '« J’ai la clé. »', besoin: { objet: 'cle_sacristie' }, effets: { flag: 'lou_trouvee' }, suivant: 'stl_sortie' },
      { label: '« Attends-moi ici. Je vais chercher la clé. »', effets: { flag: 'lou_trouvee' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'porte_sacristie' (si Lou trouvée et clé en poche) — ou directement depuis stl_lou_sortie.
  stl_sortie: {
    illu: 'collegiale_nef', musique: 'calme', orateur: 'Lou',
    texte: 'La clé tourne avec un grincement, et la porte s’ouvre sur la sacristie : des robes de prêtre pendues à des cintres, un lavabo, une odeur de naphtaline, et une porte basse qui donne sur la ruelle.\n\nLou passe devant toi, s’arrête sur le seuil et se retourne vers la nef, où la clochette continue de sonner.\n\n« Tu crois qu’ils savent qu’ils sont morts ? » demande-t-elle.\n\nElle n’attend pas la réponse. Dehors, il fait jour, et la lumière lui fait mal aux yeux. Elle rit, puis elle pleure, puis elle se met en marche.',
    choix: [
      {
        label: 'Ramener Lou à l’Empéri',
        effets: {
          flag: 'lou_sauvee', quete: ['q_protocole', 'radio'],
          journal: 'Lou est vivante. Nathan ne l’est plus. Je la ramène à l’Empéri.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── RETOUR À L’EMPÉRI ───────────────────────────
  // Déclencheur : entrée dans 'emperi' si 'lou_sauvee' et pas 'emp_retour_fait'.
  emp_retour_lou: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Quand Lou passe la grille du château, Vidal ne dit rien. Il la prend dans ses bras, maladroitement, comme un prof qui sait qu’il n’en a pas le droit, et il la serre longtemps, les yeux fermés, pendant que les autres élèves font semblant de regarder ailleurs.\n\nPuis il te regarde par-dessus l’épaule de Lou.\n\n« Et Nathan ? »',
    choix: [
      { label: '« Il avait été mordu. Je l’ai achevé. »', si: { flag: 'nathan_acheve' }, suivant: 'emp_retour_nathan' },
      { label: '« Il avait été mordu. Il est enfermé dans la chapelle de la Vierge. »', si: { flag: 'nathan_laisse' }, suivant: 'emp_retour_nathan' },
    ],
  },

  emp_retour_nathan: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Vidal ferme les yeux et reste debout de longues secondes, la main posée sur la tête de Lou.\n\n« Merci », finit-il par dire, du ton qu’on prend pour signer un certificat de décès.',
    choix: [
      {
        label: '« La radio. »',
        si: { flagEgal: ['emp_statut', 'rejete'] },
        suivant: 'emp_retour_ouvre',
      },
      {
        label: '« La radio. »',
        si: { flag: 'emp_entree_ok' },
        effets: { flags: { emp_retour_fait: true, radio_ok: true } },
        suivant: 'emp_retour_radio',
      },
    ],
  },

  emp_retour_ouvre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Entre. » Il fait signe aux gardes de la porte. « Je ne sais toujours pas ce que tu es. Lou dit que ça n’a pas d’importance. » Il a un sourire fatigué. « Mais Lou a quinze ans. »\n\nLa grille s’ouvre. Personne ne baisse son sabre, mais personne ne le lève non plus.',
    choix: [
      {
        label: 'Entrer',
        effets: { flags: { emp_entree_ok: true, emp_retour_fait: true, radio_ok: true } },
        suivant: 'emp_retour_radio',
      },
    ],
  },

  emp_retour_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« La radio est en haut de la tour d’angle, et tu as une heure. » Il lève un doigt, comme devant une classe. « On n’appelle jamais la nuit : l’armée aussi nous écoute. »',
    choix: [{ label: 'Monter à la radio, en haut de la tour', suivant: '#fin' }],
  },

  // Marqueur 'radio_emperi' (sommet de la tour d'angle), si 'radio_ok' et pas 'radio_essayee'.
  emp_radio: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'La radio est un poste militaire vert olive, lourd comme une valise remplie de pierres, posé sur une table de camping en haut de la tour. Il a un combiné à fil en spirale et il est relié par des pinces à une batterie de camion. À côté, Vidal a scotché une liste de fréquences et d’horaires, avec une ligne soulignée : NE PAS APPELER LA NUIT — ILS ÉCOUTENT AUSSI.\n\nTu règles la fréquence que Maud t’a notée, et tu appuies sur le bouton pour parler.\n\n« PC Durance, PC Durance, ici Salon, château de l’Empéri. Message pour la commandante Orsini, de la part de la docteure Sérane. »\n\nTu n’entends d’abord qu’un souffle, puis une voix d’homme, jeune et sans émotion :\n\n« Salon, ici PC Durance. Donnez votre code d’authentification. »\n\nL’armée ne parle qu’aux postes qui donnent un code secret, et tu n’en as pas.',
    choix: [{ label: '« Je n’ai pas de code. Dites-lui : Sérane a la preuve. »', suivant: 'emp_radio_2' }],
  },

  emp_radio_2: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'Le silence dure si longtemps que tu crois la communication coupée.\n\n« Salon, le PC Durance ne répond pas aux postes sans code. » Il y a encore un silence, puis la voix reprend plus bas, comme si l’homme se penchait vers le micro : « …Si la docteure a quelque chose, elle sait où nous trouver. Avec le code. Terminé. »\n\nLe souffle revient, et tu reposes le combiné.\n\nDerrière toi, Lou a tout entendu. Elle mâchonne une mèche de cheveux. « C’est quoi, la preuve ? »',
    choix: [
      { label: '« Rien. Une histoire entre la docteure et l’armée. »', suivant: 'emp_radio_fin' },
      { label: 'Ne rien répondre', suivant: 'emp_radio_fin' },
    ],
  },

  emp_radio_fin: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'Tu redescends l’escalier de la tour. Sans code, la radio ne sert à rien, et tu es {sûr|sûre} maintenant que Maud s’y attendait : « S’il leur faut des preuves, mon registre est resté à l’hôpital. »\n\nL’hôpital, tu l’as vu du haut de la tour : un bâtiment blanc au bord de la ville, avec des ambulances garées en épi et rien qui bouge. Ou alors, tout ce qui y bouge est mort.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flag: 'radio_essayee', quete: ['q_protocole', 'hopital'], decouvrir: ['hopital'],
          journal: 'La radio de l’Empéri ne sert à rien sans le code de l’armée. Il faut une preuve : le registre de Maud, resté au sous-sol de l’hôpital.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE SAC ROUGE ───────────────────────────
  // Via le dialogue de Lou (scenes_pnj.js) : le carnet à dessin.
  emp_lou_carnet: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou sort le carnet à dessin de sa ceinture et le feuillette sans te regarder. Ce sont des dessins au stylo bille, serrés et minutieux : les tours du château, les toits, des élèves endormis, Vidal de dos. Et des morts, beaucoup de morts, dessinés avec une précision de scientifique.\n\nElle s’arrête sur une double page et la tourne vers toi.\n\nTu y vois six fois le même personnage, avec une date dans un coin : 4/9, 5/9, 5/9, 6/9, 7/9, 8/9. C’est un mort debout au pied de la porte du château, en bas de la montée, avec un sac à dos rouge à la bretelle cassée, le visage levé vers la grille.\n\nC’est toi, après ta mort et avant ton réveil.\n\n« Tu revenais tous les jours, dit Lou, à la même heure, et tu restais là à regarder la porte. Nathan t’appelait “le Client”. » Elle referme le carnet. « Et un matin, une ambulance est montée, une femme en est descendue avec une perche, et tu es {parti|partie} avec elle, comme un chien. »',
    choix: [{ label: '« Tu vas le dire à Vidal ? »', suivant: 'emp_lou_secret' }],
  },

  emp_lou_secret: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Lou réfléchit sérieusement, comme devant un exercice.\n\n« Non. » Elle hausse les épaules. « D’abord, il ne me croirait pas. Ensuite, c’est toi qui m’as sortie de là-bas. Et puis… » Elle tapote le dessin. « Ton sac est toujours en bas, dans les ronces sous le rempart, là où tu te tenais. Personne n’est allé le chercher, parce que personne ne va dans les ronces. »',
    choix: [
      {
        label: '« Merci, Lou. »',
        effets: {
          flag: 'lou_sait', document: 'doc_carnet_lou', quete: ['q_sac_rouge', 'debut'],
          journal: 'Lou m’a {dessiné|dessinée} six fois, {mort|morte}, au pied de la porte du château. J’avais un sac à dos rouge. Il est toujours dans les ronces, sous le rempart.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'sac_rouge' (ronces sous le rempart, au pied de la porte, côté montée du Puech).
  emp_sac_rouge: {
    illu: 'montee_puech', musique: 'calme',
    texte: 'Il est bien là, dans les ronces sous le rempart : un sac à dos rouge délavé, à la bretelle arrachée, dont la toile a durci à force de pluie et de soleil.\n\nTu le reconnais avant même de t’en souvenir. Ce sont tes mains qui le reconnaissent : elles savent où se trouve la fermeture, et que la poche du haut coince.\n\nDedans, tu trouves un pull gris roulé en boule qui sent encore ta lessive, une gourde d’eau croupie, et un livre de poche gonflé d’humidité, Colline, de Giono, avec pour marque-page un billet de train Marseille–Salon daté du 30 août. Il y a aussi une paire de gants de vendange neufs, encore avec leur étiquette : tu étais {venu|venue} pour les vendanges. Et enfin une batterie de secours pour téléphone, avec son câble enroulé autour.',
    choix: [
      {
        label: 'Brancher ton téléphone sur la batterie',
        effets: {
          objets: [['livre_colline', 1], ['batterie_externe', 1], ['gants_vendange', 1]],
          flag: 'sac_rouge_trouve',
        },
        suivant: 'emp_telephone',
      },
    ],
  },

  emp_telephone: {
    illu: 'montee_puech', musique: 'calme',
    texte: 'La batterie a gardé un tiers de sa charge. Le téléphone met une éternité à démarrer, puis l’écran fendu s’allume et te demande ton code.\n\nTes pouces le tapent tout seuls.\n\nTu as quarante-trois notifications : des messages, des appels manqués, des alertes. La dernière alerte du gouvernement date du 7 septembre : ZONE D’EXCLUSION SANITAIRE — RESTEZ CONFINÉS — NE CHERCHEZ PAS À REJOINDRE LA DURANCE.\n\nDans la galerie, il y a une dernière vidéo, filmée le 6 septembre à 17 h 52, le jour de ta mort. Elle dure quarante et une secondes.',
    choix: [
      {
        label: 'Lire les messages',
        effets: { flag: 'telephone_charge', document: 'doc_sms_telephone' },
        suivant: 'emp_telephone_2',
      },
      {
        label: 'Regarder la vidéo',
        effets: { flag: 'telephone_charge' },
        suivant: 'emp_video',
      },
    ],
  },

  emp_telephone_2: {
    illu: 'montee_puech', musique: 'sombre',
    texte: 'Tu lis tout : les messages d’avant, qui parlent de vendanges, de rendez-vous et d’un appartement, puis ceux du Mercredi, de plus en plus courts, et enfin les derniers, qui n’attendaient plus de réponse.\n\nIl ne reste plus que la vidéo.',
    choix: [{ label: 'Regarder la vidéo', suivant: 'emp_video' }],
  },

  emp_video: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'L’image tremble, parce que tu cours. On entend ta respiration, énorme dans le micro, et ta voix, que tu ne reconnais pas, aiguë et en larmes : « Attendez ! Attendez ! »\n\nC’est la montée du Puech, filmée d’en bas, de travers. En haut, la porte du château est à moitié fermée par une grille, et des élèves passent en courant. Un homme en pull bleu les pousse à l’intérieur un par un en comptant à voix haute : seize, dix-sept, dix-huit.\n\nC’est Vidal.\n\nTu arrives en haut, et ta main entre dans l’image, tendue vers la grille. Vidal se retourne, et pendant une seconde, il te voit.\n\nPuis sa main s’abat sur ta poitrine et te repousse violemment. L’image bascule, le ciel, les murs, les pavés, et là-haut, la grille se referme avec un bruit de fer.\n\nTu cries « Monsieur ! ». Derrière toi, quelqu’un grogne, et l’image se remplit de mains.\n\nPendant les dix dernières secondes, on ne voit plus que le ciel, un ciel bleu et vide. On entend aussi un bruit que tu reconnais maintenant : le bruit de quelqu’un qu’on mange.',
    choix: [
      {
        label: 'Éteindre le téléphone',
        effets: {
          flag: 'video_vue', document: 'doc_video_6_septembre', quete: ['q_sac_rouge', 'fin'],
          journal: 'La dernière vidéo de mon téléphone : le 6 septembre, devant la porte de l’Empéri, Vidal m’a {repoussé|repoussée} et a fermé la grille, avec moi dehors. Les morts m’ont {attrapé|attrapée}. C’est là que je suis {mort|morte}.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Via le dialogue de Vidal, si 'video_vue'.
  emp_vidal_6sept: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu tends le téléphone à Vidal sans rien dire, et pendant que la vidéo défile, tu regardes son visage pendant qu’il se regarde.\n\nAu moment où sa main te repousse, il ferme les yeux, et il ne les rouvre qu’à la fin.\n\n« Dix-huit », finit-il par dire. « J’avais dix-huit élèves à faire entrer, et il y avait de la place pour dix-huit, pas un de plus. Je ne sais pas si c’était vrai, mais je l’ai cru. » Il retire ses lunettes. « J’ai vu ton visage. Tu avais un sac rouge. Je le revois toutes les nuits depuis. »\n\nQuand il te regarde enfin, tu vois qu’il a compris, pas tout, mais assez.\n\n« Ce jour-là, dans la montée… tu es {mort|morte}. Et pourtant, tu es là. »',
    choix: [
      { label: '« Je te pardonne. »', suivant: 'emp_vidal_pardon' },
      { label: '« Tu vas le dire aux gamins. Tout. »', suivant: 'emp_vidal_avoue' },
      { label: '« Un jour, je te ferai la même chose. »', suivant: 'emp_vidal_menace' },
    ],
  },

  emp_vidal_pardon: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Vidal te regarde comme s’il ne connaissait pas ce mot. Puis il hoche la tête une fois et se tourne très vite vers la cour, vers ses élèves, pour que tu ne voies pas son visage.\n\n« Ne fais pas ça », dit-il d’une voix étranglée. « Ne me rends pas les choses faciles. »',
    choix: [{ label: 'Le laisser seul', effets: { flags: { vidal_confronte: true, vidal_pardonne: true } }, suivant: '#fin' }],
  },

  emp_vidal_avoue: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le soir, dans la cour du château, Vidal réunit tout le monde autour du feu. Il parle debout, les mains dans les poches, comme en classe. Il raconte le 6 septembre, la grille, le sac rouge et sa main. Il ne dit pas ce que tu es, il dit seulement : « Cette personne-là, c’est moi qui l’ai tuée. Et elle est revenue quand même. »\n\nPersonne ne dit rien. Hugo pleure, et Lou dessine.\n\nQuand il a fini, Vidal va s’asseoir un peu à l’écart, et pour la première fois depuis que tu le connais, il a l’air reposé.',
    choix: [{ label: 'Continuer', effets: { flags: { vidal_confronte: true, vidal_avoue: true } }, suivant: '#fin' }],
  },

  emp_vidal_menace: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: '« Je sais », dit Vidal en remettant ses lunettes. « J’attendais que quelqu’un me le dise. » Il te rend le téléphone. « Quand tu voudras. Mais pas devant eux. »',
    choix: [{ label: 'Partir', effets: { flags: { vidal_confronte: true, vidal_menace: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── L’HÔPITAL ───────────────────────────
  // Déclencheur : entrée dans 'hopital' si quête à 'hopital'.
  hop_entree: {
    illu: 'hopital_parvis', musique: 'tension',
    texte: 'L’hôpital de Salon a l’air d’avoir été évacué en pleine tempête. Devant les urgences, des ambulances sont garées en épi, portes arrière ouvertes, avec des brancards à moitié sortis. Sur le parking, une tente militaire s’est effondrée, sa toile verte couverte de taches, et contre le mur, des dizaines de housses blanches sont alignées sans que personne soit venu les chercher.\n\nAu-dessus de l’entrée des urgences, un drap est tendu entre deux fenêtres, et ses lettres peintes au pinceau ont pâli au soleil :\n\nICI ON SOIGNE ENCORE.\n\nTu reconnais l’écriture serrée et penchée de Maud.',
    choix: [
      {
        label: 'Entrer',
        effets: { journal: 'L’hôpital. Le registre de Maud est au sous-sol, dans la chambre froide de la morgue.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'salle_4' (sous-sol, salle des plâtres) : le souvenir.
  hop_salle4: {
    illu: 'salle_quatre', musique: 'sombre',
    texte: 'Sur la porte, tu lis : SALLE 4 — PLÂTRES. Elle est ouverte.\n\nÀ l’intérieur, un lit d’examen à roulettes est poussé contre le mur. Aux montants pendent des menottes ouvertes et des sangles de cuir déchirées : on attachait quelqu’un ici. Le matelas en plastique est lacéré de longues griffures, il y a un seau par terre, et au mur une feuille de soins porte l’inscription P4.\n\nP4, c’est le numéro de ton bracelet. C’est ici qu’on t’a {gardé|gardée}.\n\nSur le chariot, à côté des bandes de plâtre, tu vois une petite cloche de bronze à manche de bois, comme celles qu’agitaient les instituteurs d’autrefois.\n\nTu la prends sans savoir pourquoi.',
    choix: [
      {
        label: 'Agiter la petite cloche',
        effets: { objet: ['cloche_maud', 1], cinematique: 'souvenir_cloche' },
        suivant: 'hop_souvenir',
      },
    ],
  },

  hop_souvenir: {
    illu: 'salle_quatre', musique: 'sombre',
    texte: 'Tu ne sais pas depuis combien de temps tu es à genoux sur le carrelage, la cloche serrée contre ta poitrine : son tintement a fait remonter un souvenir.\n\nTa bouche est pleine de salive, et tu craches encore et encore, mais le goût reste. C’est le souvenir d’un goût salé, chaud, de cuivre, avec en dessous quelque chose de gras qui colle au palais.\n\nTu revois un homme sur un brancard, une jambe dans une attelle, et tu l’entends dire un mot : « Jo. »\n\nTu ne sais pas qui est Jo. Mais tu sais une chose : tu as mangé l’homme qui a prononcé ce nom.',
    choix: [
      {
        label: 'Te relever',
        effets: {
          flag: 'souvenir_vu', pv: -5,
          journal: 'Salle 4. Au son de la cloche, je me suis {souvenu|souvenue} : un homme attaché sur un brancard, une jambe dans une attelle. Il a dit « Jo ». Je l’ai mangé.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'morgue_couloir' (zone, couloir de la morgue) : le Brancardier.
  hop_brancardier: {
    illu: 'hopital_sous_sol', musique: 'tension',
    texte: 'Au bout du couloir de la morgue, sous un néon éteint, quelque chose de très grand est assis sur un chariot de linge sale et se balance d’avant en arrière.\n\nC’est un mort de deux mètres, dans une blouse verte de brancardier tendue à craquer sur un torse de déménageur, avec un badge où tu lis : KARIM — BRANCARDAGE. Ses deux mains sont posées sagement sur ses genoux, et la moitié de son visage a été mangée jusqu’à l’os.\n\nIl lève la tête, renifle, et sourit avec ce qui lui reste de bouche.\n\nIl bloque le passage vers la chambre froide.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['colosse'] } }, suivant: 'hop_brancardier_apres' },
      {
        label: 'Reculer dans l’ombre sans te faire voir',
        test: { skill: 'agilite', difficulte: 2 },
        reussite: {
          texte: 'Tu recules pas à pas, sans lui tourner le dos. Il renifle encore, déçu, et se remet à se balancer. Il faudra passer autrement, ou revenir mieux {armé|armée}.',
          suivant: '#fin',
        },
        echec: {
          texte: 'Ton talon heurte un seau, et le bruit roule dans le couloir comme un coup de tonnerre.\n\nKarim se lève.',
          effets: { combat: { zombies: ['colosse'] } },
          suivant: 'hop_brancardier_apres',
        },
      },
    ],
  },

  hop_brancardier_apres: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Karim est tombé en travers du couloir, et il faut l’enjamber pour passer. Couché, il paraît encore plus grand.\n\nDans la poche de sa blouse, avec un paquet de chewing-gums et une photo de mariage, tu trouves un badge magnétique : ACCÈS MORGUE — CHAMBRE FROIDE. C’est ce badge qui ouvre la porte de la chambre froide.',
    choix: [{ label: 'Prendre le badge de la morgue', effets: { objet: ['badge_morgue', 1] }, suivant: '#fin' }],
  },

  // Marqueur 'chambre_froide' (fermée : badge_morgue).
  hop_registre: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu entres dans la chambre froide de la morgue. Même sans électricité, il y fait plus froid qu’ailleurs, parce que les murs épais gardent le froid. Des tiroirs en inox couvrent les murs du sol au plafond. Certains sont entrouverts, et un pied en dépasse, avec son étiquette. Sur la paillasse du fond, dans un sac de congélation fermé par un élastique, tu trouves un grand registre noir, un cahier de comptes comme ceux des commerçants.\n\nSur la couverture, quelqu’un a écrit au marqueur : PROTOCOLE — M. S. — NE PAS JETER. M. S., c’est Maud Sérane.',
    choix: [
      {
        label: 'Ouvrir le registre',
        effets: { objet: ['registre_protocole', 1], document: 'doc_registre_protocole', flag: 'registre_trouve' },
        suivant: 'hop_registre_2',
      },
    ],
  },

  hop_registre_2: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu lis debout, la lampe coincée sous le menton, et le froid te monte dans les jambes sans que tu t’en rendes compte.\n\nMaud a numéroté ses patients : P1, P2, P3… Tu lis le jour où le patient P1 s’est échappé de son box et s’est jeté sur un vieil homme dans le couloir pour le manger. Puis tu lis le jour où P1 s’est réveillé, quatre jours plus tard, et a demandé de l’eau, lucide et vivant. Dans la marge, ce jour-là, Maud a écrit en majuscules et souligné trois fois : NOURRI.\n\nÀ la page 6, d’une écriture qui ne tremble pas, elle a noté la règle qu’elle en a tirée : pour qu’un mort revienne, il doit manger un adulte entier dans les quarante-huit heures qui suivent sa transformation. S’il mange moins, il revient mal, et au-delà, ça ne sert à rien. Un mort contre un vivant : un pour un.\n\nTu cherches ta ligne et tu la trouves : P4, c’est toi. « Nourri le 11/09, à 3 h 10. Donneur : voir page 14. »\n\nLe « donneur », c’est la personne qu’on t’a donnée à manger.\n\nMais la page 14 a été arrachée, et il n’en reste qu’une bande de papier dans la reliure.',
    choix: [
      { label: 'Chercher la page 14 dans la chambre froide', suivant: 'hop_registre_page' },
      { label: 'Refermer le registre', suivant: 'hop_registre_fin' },
    ],
  },

  hop_registre_page: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu fouilles la paillasse, les tiroirs et les poubelles, sans rien trouver. La page n’a pas été arrachée par accident, dans la panique d’un départ : elle a été découpée proprement, au ras de la couture, par quelqu’un qui savait exactement laquelle prendre.\n\nC’est Maud qui l’a prise.',
    choix: [{ label: 'Refermer le registre', suivant: 'hop_registre_fin' }],
  },

  hop_registre_fin: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu refermes le registre et tu le glisses dans ton sac. Il te paraît bien plus lourd que du papier.\n\nEn haut de la tour, tu avais demandé à Maud : « Pourquoi est-ce que je respire ? »\n\nElle connaissait la réponse : tu respires parce qu’on t’a fait manger quelqu’un.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          quete: ['q_protocole', 'confrontation'],
          journal: 'Le registre de Maud. Un mort peut revenir s’il mange un adulte entier dans les deux jours : « un pour un ». Maud m’a fait manger quelqu’un. La page qui dit qui (page 14) a été arrachée. Maud savait tout depuis le début.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'casier_luc' (vestiaire du personnel).
  hop_casier: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu entres dans le vestiaire du personnel, où une rangée de casiers en métal aux portes cabossées a été forcée. Un seul est encore fermé. Sur sa porte, un sparadrap porte un nom écrit au marqueur : ARNAUD — EFFETS — À RENDRE À LA FAMILLE. En dessous, plus petit et souligné : M. S. C’est Maud.\n\nLe casier n’est fermé que par un petit cadenas de valise, qui cède au premier coup.',
    choix: [
      {
        label: 'Ouvrir le casier',
        effets: { objets: [['lettre_luc', 1], ['photo_luc', 1]], document: 'doc_lettre_luc' },
        suivant: 'hop_casier_2',
      },
    ],
  },

  hop_casier_2: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu y trouves un blouson de travail bleu marine avec un logo d’électricien brodé sur la poitrine, et un trousseau avec un porte-clés en forme de cigale. Il y a aussi une photo pliée en deux : un homme d’une cinquantaine d’années, moustachu et rougi par le soleil, porte sur ses épaules une petite fille à qui il manque des dents. Derrière eux s’élève une falaise jaune percée de grottes. Au dos, tu lis : « Clem et moi, Calès, avril. »\n\nEnfin, il y a une enveloppe fermée, adressée d’une grosse écriture appliquée : POUR JO. Joëlle Arnaud, Lamanon — les grottes.\n\nJo, c’est le nom qu’a prononcé l’homme de ton souvenir.',
    choix: [
      {
        label: 'Prendre l’enveloppe',
        effets: {
          flag: 'lettre_luc_trouvee', decouvrir: ['cales'],
          journal: 'Un casier au nom d’Arnaud. Une lettre « Pour Jo » — Joëlle Arnaud, aux grottes de Calès, à Lamanon. Une photo d’un homme et d’une petite fille devant les falaises de Calès. Jo : le nom de mon souvenir.',
        },
        suivant: 'hop_casier_3',
      },
    ],
  },

  hop_casier_3: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Sur l’étagère du haut, un sac isotherme de pharmacie est vide, avec une ordonnance agrafée dessus : INSULINE RAPIDE ET LENTE — ARNAUD CLÉMENCE, 9 ANS. Clémence, c’est la petite fille de la photo, et elle est diabétique.\n\nLe sac est vide parce que quelqu’un a sorti l’insuline pour la mettre au frais.',
    choix: [{ label: 'Refermer le casier', suivant: '#fin' }],
  },

  // Marqueur 'frigo_pharmacie' (pharmacie centrale, sous-sol) : l'insuline de Luc.
  hop_frigo: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le grand frigo de la pharmacie de l’hôpital ne marche plus depuis longtemps, et à l’intérieur, les flacons, les poches et les boîtes ont ramolli. Sur l’étagère du milieu, bien rangée, une boîte blanche porte l’écriture de Maud : ARNAUD — À RENDRE.\n\nDedans, il y a quatre stylos d’insuline. Ils ne seront pas périmés avant six mois, et hors du frigo, ils tiendront encore quelques semaines.',
    choix: [{ label: 'Prendre la boîte d’insuline', effets: { objet: ['insuline_luc', 1], flag: 'insuline_trouvee' }, suivant: '#fin' }],
  },

  // Marqueur 'bureau_maud' (1er étage, bureau du chef de service).
  hop_bureau: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'C’est le bureau de la cheffe des urgences, celui de Maud. Il y a un canapé déplié, un sac de couchage, des pots de café soluble et des paquets de cigarettes vides empilés comme des briques. Le tableau blanc est couvert de chiffres, de flèches et de courbes de température, et tout en haut, en rouge, elle a écrit : 48 H.\n\nSur le bureau, tu trouves un carnet à spirale ouvert à la première page, et une chemise cartonnée : RAPPORT CELLULE DE CRISE — 08/09 — BROUILLON.',
    choix: [
      {
        label: 'Lire le carnet et le rapport',
        effets: { document: 'doc_carnet_maud_p1', flag: 'bureau_maud_vu' },
        suivant: 'hop_bureau_2',
      },
    ],
  },

  hop_bureau_2: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu lis le carnet, puis tu ouvres la chemise. C’est un rapport tapé à la machine et corrigé au stylo, daté du 8 septembre et adressé à la préfecture et à l’armée.\n\nMaud leur a tout dit dès le 8 septembre : que les morts pouvaient revenir, comment, et à quel prix.\n\nEt malgré ça, l’armée a décidé de tout brûler.',
    choix: [
      {
        label: 'Garder le rapport',
        effets: { document: 'doc_rapport_8_septembre', flag: 'rapport_lu' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'dossiers_urgences' (secrétariat des urgences, rez-de-chaussée).
  hop_dossiers: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Au secrétariat des urgences, les dossiers des patients sont empilés par terre en tours penchées, tachées de café et d’autre chose. Deux dossiers ont été posés à part, sur le clavier d’un ordinateur éteint, comme si quelqu’un avait voulu les retrouver vite.\n\nLe premier porte ton nom, et le second celui de ARNAUD Luc, 51 ans.',
    choix: [
      {
        label: 'Lire les deux dossiers',
        effets: { document: 'doc_dossier_p4', flag: 'dossiers_lus' },
        suivant: 'hop_dossiers_2',
      },
    ],
  },

  hop_dossiers_2: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Luc Arnaud a été admis le 10 septembre, la jambe droite cassée, avec l’os sorti de la peau. Ce sont deux élèves de l’Empéri qui l’ont amené.\n\nIl est décédé le 11 septembre, à 3 h 10.\n\nCette heure-là, tu la connais : tu l’as lue dans le registre, sur ta ligne. « P4 — nourri le 11/09, à 3 h 10. »\n\nL’homme du brancard, celui qui a dit « Jo », c’était Luc Arnaud.',
    choix: [{ label: 'Refermer le dossier', effets: { document: 'doc_dossier_luc', flag: 'dossier_luc_lu' }, suivant: '#fin' }],
  },

  // ─────────────────────────── LA CONFRONTATION ───────────────────────────
  // Déclencheur : entrée dans 'nostradamus' si quête à 'confrontation' (ou sujet « registre » avec Maud).
  ch1_confrontation: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'De retour chez Nostradamus, tu poses le registre sur le bureau, entre la sphère d’astronomie et le crâne en plâtre. Tu ne dis rien, parce que ce n’est pas la peine.\n\nMaud le regarde comme on regarde une radio qui confirme un diagnostic. Elle n’y touche pas et allume une cigarette.\n\n« Tu l’as lu. »\n\nCe n’est pas une question.',
    choix: [
      { label: '« Tu m’as fait manger un homme. »', suivant: 'ch1_conf_homme' },
      { label: '« Un pour un. »', suivant: 'ch1_conf_un_pour_un' },
      { label: '« Qui j’ai mangé ? Qu’y a-t-il sur la page 14 ? »', suivant: 'ch1_conf_qui' },
    ],
  },

  ch1_conf_homme: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Oui. » Elle souffle la fumée. « Je t’ai fait manger un homme, comme j’en ai fait manger un à Patrick, et un garçon à la pharmacienne qui dort dans ma cave. P1, mon premier patient, a mangé un vieux monsieur de quatre-vingt-un ans, mais celui-là, je ne l’avais pas décidé. »\n\nElle hausse les épaules.\n\n« Quatre jours plus tard, P1 s’est réveillé et a demandé un verre d’eau. Il avait un fils à Montpellier, une collection de disques de jazz et un chat. Il s’est jeté du toit le lendemain. Mais il s’était réveillé. Tu comprends ? Il s’était réveillé. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_un_pour_un: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Un pour un. » Elle hoche lentement la tête, comme un prof dont l’élève a enfin trouvé la réponse. « C’est la seule règle de toute cette saloperie qui tombe juste. L’agent, la chose qui t’a {infecté|infectée}, a faim. Si tu lui donnes un adulte entier en deux jours, il se gave, il s’endort, et il te laisse revenir. Si tu lui en donnes moins, il ne se réveille qu’à moitié, et toi aussi. »\n\nElle tire sur sa cigarette.\n\n« Il y a quatre cent mille morts entre la Durance et la mer : quatre cent mille personnes qu’on peut ramener, chacune au prix d’une autre. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_qui: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Non. »\n\nElle le dit sans méchanceté, comme on refuse une dose de morphine de trop.\n\n« Tu veux un nom pour avoir quelqu’un à pleurer. Mais tu n’as pas le droit de pleurer quelqu’un que tu as mangé, ce serait obscène. » Elle pose la main à plat sur sa blouse, sur la poche intérieure. « La page est ici, et elle y restera. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_2: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Ils allaient mourir », dit-elle. « Tous, les donneurs. Je n’ai pris que des gens qui allaient mourir : une hémorragie qu’on n’arrivait pas à arrêter, une fracture ouverte sans antibiotiques, un traumatisme crânien. Ils allaient mourir dans l’heure, dans la nuit ou dans la semaine, et j’ai fait en sorte que leur mort serve à quelque chose. »\n\nElle soutient ton regard.\n\n« Et ce à quoi elle a servi, c’est toi. »\n\nSous vos pieds, dans la cave, quelque chose tombe avec un bruit de chaîne, puis une voix rauque se met à appeler.\n\nC’est une voix de femme : la pharmacienne s’est réveillée.',
    choix: [{ label: 'Descendre à la cave', suivant: 'ch1_p5' }],
  },

  ch1_p5: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Mireille',
    texte: 'Dans la cave, la femme qui dormait sous le drap s’est assise sur son lit de camp, la cheville toujours reliée au pilier par la chaîne de vélo. Elle a une quarantaine d’années, les cheveux collés, et sur sa blouse de pharmacienne, un badge indique : MIREILLE — PHARMACIE DU COURS.\n\nElle te regarde, puis elle regarde Maud, qui descend derrière toi.\n\n« Où est ma fille ? » demande-t-elle d’une voix normale, complètement normale. « Il est quelle heure ? J’ai laissé ma fille chez ma mère, il faut que j’aille la chercher avant six heures. »\n\nMaud s’arrête sur la dernière marche, et tu l’entends retenir son souffle.\n\nMireille sourit. Puis elle renifle une fois, deux fois, le nez levé vers toi et vers Maud.\n\n« Ça sent bon, ici », dit-elle d’une voix devenue grave, et son sourire s’ouvre, de plus en plus, beaucoup trop grand. Elle redevient l’une d’eux.',
    choix: [
      { label: 'Te mettre entre elle et Maud', effets: { combat: { zombies: ['enrage'] } }, suivant: 'ch1_p5_apres' },
    ],
  },

  ch1_p5_apres: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Quand c’est fini, Maud s’agenouille près de ce qui reste de Mireille et lui ferme les yeux avec deux doigts, par habitude. Puis elle sort un stylo et écrit, tout en bas de la feuille de soins scotchée au pilier, un seul mot avec la date.\n\nRATÉ.\n\n« Samir », dit-elle sans se retourner. « Dix-sept ans, un élève de Vidal, tombé du rempart de l’Empéri avec une fracture du crâne. Ils me l’ont amené le 12, et il ne se serait jamais réveillé. Je l’ai donné à manger à Mireille. » Elle se relève. « Et il est mort pour rien. Ça rate deux fois sur trois. Toi, tu es la troisième fois. »',
    choix: [
      { label: '« Je garde ton secret. Pour l’instant. »', suivant: 'ch1_conf_protege' },
      { label: '« Je vais dire à Vidal ce que tu as fait de Samir. »', suivant: 'ch1_conf_denonce' },
    ],
  },

  ch1_conf_protege: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud hoche la tête sans dire merci. Elle n’a pas l’air soulagée, mais plutôt de quelqu’un qui vient de contracter une dette.\n\n« Pour l’instant, répète-t-elle. C’est honnête. » Elle remonte l’escalier de la cave et s’arrête à mi-hauteur. « Si l’armée voit le registre, et qu’elle te voit, toi, elle ne mettra pas le feu. Je n’ai pas fait tout ça pour que tout brûle. »\n\nTu ne réponds pas : tu penses à la page 14, rangée dans la poche de sa blouse, contre son cœur.',
    choix: [
      {
        label: 'Remonter',
        effets: {
          flags: { maud_protegee: true, confrontation_faite: true },
          tempsMin: 180,
          journal: 'Maud ne nie rien : elle nourrit ses patients morts avec des mourants. Mireille, la pharmacienne de la cave, est revenue « mal », puis a rechuté. J’ai choisi de me taire. Pour l’instant.',
        },
        suivant: 'ch1_sonnailles_nos',
      },
    ],
  },

  ch1_conf_denonce: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud te regarde longtemps, puis elle éteint sa cigarette dans le bénitier du musée, au pied de l’escalier.\n\n« Vas-y, dis-lui. » Elle a un petit rire las. « Dis-lui que la docteure qui a recousu deux de ses élèves en a donné un troisième à manger. Il te croira, parce qu’il a besoin d’un monstre. Tout le monde a besoin d’un monstre, sinon il faut se regarder dans le miroir. »\n\nElle s’assoit sur la dernière marche.\n\n« Je ne bougerai pas d’ici, je n’ai nulle part où aller. Et quand ils viendront me chercher, je dirai tout, moi aussi : tout ce que je sais, sur tout le monde. »\n\nElle tapote la poche de sa blouse, où se trouve la page 14.',
    choix: [
      {
        label: 'Partir pour l’Empéri',
        effets: {
          flags: { maud_denoncee: true, confrontation_faite: true },
          quete: ['q_protocole', 'vidal_maud'],
          journal: 'Maud ne nie rien : elle nourrit ses patients morts avec des mourants. Samir, un élève de Vidal, a servi à nourrir la pharmacienne de la cave, qui est revenue « mal ». Je vais tout dire à Vidal.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : entrée dans 'emperi' si quête à 'vidal_maud'.
  emp_denonciation: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu ouvres le registre devant Vidal, à la page de Samir, et sans rien dire, tu poses ton doigt sur la ligne.\n\nS. B. — 17 ANS — TRAUMA CRÂNIEN (CHUTE REMPART EMPÉRI) — DONNEUR P5 — 12/09.\n\n« Donneur P5 » veut dire que Samir a été donné à manger à la patiente numéro 5, Mireille.\n\nVidal lit, puis il relit. Il retire ses lunettes et relit encore, le nez sur la page, comme s’il refusait d’y croire.\n\n« Elle m’a dit qu’il était mort sur la table d’opération. » Sa voix est calme, et c’est ce qui fait peur. « Elle m’a dit qu’elle avait tout essayé. »\n\nIl referme le registre et appelle sans élever la voix : « Hugo. Mehdi. Prenez les cordes. »',
    choix: [
      {
        label: 'Les accompagner chez Maud',
        effets: { flags: { maud_arretee: true, maud_captive: true }, tempsMin: 180 },
        suivant: 'emp_arrestation',
      },
    ],
  },

  emp_arrestation: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'Ils la trouvent là où elle avait dit qu’elle serait : assise sur la dernière marche de la cave, les mains sur les genoux. Elle tend les poignets avant qu’on le lui demande.\n\nDans la rue, entre deux élèves armés de sabres, elle marche droite. Elle ne te regarde qu’une seule fois, sans colère, avec la curiosité d’un médecin qui observe un symptôme.\n\nOn l’enferme dans la chapelle du château. Vidal ferme lui-même la porte à clé, et il reste longtemps la main sur la poignée.\n\nLe soir tombe. Et du sud, de la plaine de la Crau, arrive un son que personne ici n’a jamais entendu.',
    choix: [
      {
        label: 'Monter sur le rempart',
        effets: {
          flag: 'sonnailles_commencees', quete: ['q_protocole', 'siege'], cinematique: 'nuit_sonnailles',
          journal: 'Maud est enfermée dans la chapelle de l’Empéri. Le soir, des cloches de troupeau sont arrivées de la Crau.',
        },
        suivant: 'ch1_sonnailles_emp',
      },
    ],
  },

  ch1_sonnailles_emp: {
    illu: 'cours_troupeau', musique: 'tension', orateur: 'Vidal',
    texte: 'Ce sont des cloches : des centaines de petites cloches de moutons, sourdes et désaccordées, qui tintent sans rythme, comme de la ferraille secouée dans un sac. En dessous, plus grave, une seule cloche énorme sonne toutes les dix secondes, régulière comme un cœur.\n\nDu haut du rempart, tu vois arriver une marée de morts. Elle coule le long du cours Victor-Hugo, sous les platanes, et remplit la rue d’un trottoir à l’autre, sans laisser un seul trou. Ils sont des milliers. En tête, des silhouettes qui ne marchent pas comme des morts, droites et rapides, portent chacune une cloche au cou et une lampe à la main.\n\nLa marée tourne et se met à monter vers la vieille ville, vers le rocher du château.\n\n« Ils viennent ici », dit Vidal, qui a l’air presque calme. « Ils savent qu’on est là. »\n\nTa bouche se remplit de salive.',
    choix: [{ label: 'Descendre dans la cour du château', suivant: 'ch1_siege_1' }],
  },

  // ─────────────────────────── LA NUIT DES SONNAILLES ───────────────────────────
  ch1_sonnailles_nos: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Le soir tombe sur la maison de Nostradamus. Maud a recouvert Mireille d’un drap propre, et vous mangez sans parler.\n\nPuis, par la fenêtre ouverte, un son que tu n’as jamais entendu arrive du sud, de la plaine de la Crau.\n\nCe sont des cloches, mais pas celles de la Tour de l’Horloge : des centaines de petites cloches sourdes et désaccordées, qui tintent sans rythme, comme de la ferraille secouée dans un sac. En dessous, plus grave, une seule cloche énorme sonne toutes les dix secondes, régulière comme un cœur.\n\nMaud s’est levée, soudain toute pâle.\n\n« Des sonnailles », dit-elle. « Ce sont les cloches qu’on met au cou des brebis. » Elle tourne vers toi un visage que tu ne lui connaissais pas. « C’est une transhumance, un troupeau qu’on déplace. Mais en septembre, et dans le mauvais sens. »\n\nTa bouche se remplit de salive.',
    choix: [
      {
        label: 'Monter regarder par la lucarne',
        effets: { flag: 'sonnailles_commencees', quete: ['q_protocole', 'sonnailles'], cinematique: 'nuit_sonnailles' },
        suivant: 'ch1_sonnailles_nos_2',
      },
    ],
  },

  ch1_sonnailles_nos_2: {
    illu: 'cours_troupeau', musique: 'tension', orateur: 'Maud',
    texte: 'Du haut de la maison, par la lucarne, tu vois arriver une marée de morts.\n\nElle coule le long du cours Victor-Hugo, sous les platanes, et remplit la rue d’un trottoir à l’autre sans laisser un seul trou. Ils sont des milliers et marchent au pas, la tête basse. En tête, des silhouettes qui ne marchent pas comme des morts, droites et rapides, portent chacune une cloche au cou et une lampe à la main.\n\nLa marée ne s’arrête pas : elle tourne et se met à monter vers la vieille ville, vers le rocher et le château.\n\n« L’Empéri », dit Maud. « Il y a trente vivants là-haut, et ces morts le savent. » Elle attrape sa trousse. « Je viens avec toi. Il y aura des blessés. »',
    choix: [
      {
        label: 'Courir prévenir l’Empéri',
        effets: {
          flag: 'maud_a_lemperi',
          journal: 'Des milliers de morts entrent dans Salon au son de cloches de brebis. Des silhouettes qui marchent comme des vivants les guident. Ils montent vers l’Empéri. Il faut y courir.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : entrée dans 'emperi' si 'sonnailles_commencees' et pas 'siege_fait' (et pas déjà dans la cour).
  ch1_siege_1: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Vidal',
    texte: 'Tout le château de l’Empéri est debout, de la cave jusqu’aux remparts. Des torches brûlent sur le chemin de ronde, et des élèves courent avec des seaux, des planches et des bouteilles d’essence bouchées par un chiffon. Quelqu’un pleure dans la chapelle, et quelqu’un d’autre rit nerveusement, beaucoup trop fort.\n\nEn bas, la marée des morts a rempli la montée du Puech jusqu’au lycée. Elle ne crie pas et ne gémit pas : elle pousse. Les sonnailles tintent, et quelque part dans la foule, la grande cloche sonne toutes les dix secondes. À chaque coup, la marée avance d’un pas.\n\nVidal est partout à la fois, un sabre de cavalerie dans une main et un talkie-walkie dans l’autre. Quand il te voit, il vient vers toi.\n\n« Il y a trois postes à tenir. La porte, avec moi. Les remparts, avec Lou : on jette des bouteilles enflammées et des pierres. Et la chapelle, avec les petits et les blessés. » Il ne te demande pas si tu restes. « Choisis. »',
    choix: [
      { label: 'Défendre la porte, avec Vidal', effets: { flags: { siege_poste: 'porte', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_porte' },
      { label: 'Défendre les remparts, avec Lou', effets: { flags: { siege_poste: 'remparts', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_remparts' },
      { label: 'Protéger la chapelle, avec les petits', effets: { flags: { siege_poste: 'chapelle', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_chapelle' },
    ],
  },

  ch1_siege_porte: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Vidal',
    texte: 'La porte du château tremble à chaque coup de la grande cloche. Les palettes craquent, et la grille de chantier se tord d’un côté, jusqu’à ce qu’un coin se soulève. Des bras passent par l’ouverture, puis une tête, puis une épaule.\n\n« Ils passent à gauche ! » crie Hugo.\n\nVidal, lui, ne crie pas. Il lève son sabre et te regarde, et tu comprends qu’il compte sur toi autant que sur lui-même.',
    choix: [
      { label: 'Repousser les morts qui passent par la brèche', effets: { combat: { zombies: ['errant', 'errant', 'coureur'], lieu: 'emperi' } }, suivant: 'ch1_siege_crise' },
    ],
  },

  ch1_siege_remparts: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Lou',
    texte: 'Sur le chemin de ronde, Lou allume les chiffons au briquet et te passe les bouteilles une par une, sans trembler, comme on passe des assiettes pendant la vaisselle.\n\n« Vise ceux de devant, dit-elle, pas le milieu. Si ceux de devant brûlent, ceux de derrière reculent. »\n\nEn bas, la marée lève le visage vers vous : des centaines de visages tous pareils, la bouche ouverte.',
    choix: [
      {
        label: 'Lancer la bouteille enflammée',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'La première bouteille éclate en plein sur les premiers rangs, et le feu court d’épaule en épaule dans les vêtements secs. La marée recule, se tord et se piétine, dans une odeur de cochon grillé et de pneu brûlé. Lou te tend la bouteille suivante sans un mot. Vous en lancez onze, et le bas de la montée brûle pendant une heure.',
          effets: { xp: { dexterite: 15 }, flag: 'siege_feu_reussi' },
          suivant: 'ch1_siege_crise',
        },
        echec: {
          texte: 'La bouteille éclate trop près du mur. Le feu prend dans le lierre et remonte vers vous en rugissant. Dans la fumée, un mort en flammes escalade les pierres avec ses ongles, passe par-dessus le parapet et se redresse sur le chemin de ronde.',
          effets: { combat: { zombies: ['enrage'], lieu: 'emperi' } },
          suivant: 'ch1_siege_crise',
        },
      },
    ],
  },

  ch1_siege_chapelle: {
    illu: 'emperi_siege', musique: 'tension',
    texte: 'Dans la chapelle, sous les vieilles peintures murales, les petits sont assis en rond sur des couvertures, et quelqu’un leur lit un livre à voix haute, très fort, pour couvrir le bruit des cloches. Deux adultes blessés sont allongés sur des bancs, le teint gris et trempés de sueur. Maud est là elle aussi, à genoux près des bancs, les manches relevées, qu’on l’ait enfermée ici ou qu’elle soit venue d’elle-même.\n\nC’est elle qui le remarque la première. Enzo, onze ans, le petit de sixième, tremble sous sa couverture, beaucoup trop fort. Il a relevé son pantalon de survêtement et regarde son mollet, où tu vois une marque de dents en demi-lune.\n\n« C’était pendant la corvée d’eau », dit-il. « J’ai rien dit, j’avais peur que Vidal… » Ses dents claquent. « J’ai froid. »\n\nEnzo a été mordu, et il va se transformer.',
    choix: [{ label: 'Regarder Maud', suivant: 'ch1_siege_chapelle_2' }],
  },

  ch1_siege_chapelle_2: {
    illu: 'emperi_siege', musique: 'tension', orateur: 'Maud',
    texte: 'Maud s’approche de toi et parle très bas, pour que les petits n’entendent pas.\n\n« Il lui reste une heure, peut-être moins. » Elle jette un regard vers les deux adultes allongés sur les bancs. « Et celui de gauche ne passera pas la nuit : il a une infection du ventre. »\n\nElle ne finit pas sa phrase, et ce n’est pas nécessaire : tu vois l’idée passer dans ses yeux. Un mourant et un mordu. Un pour un.\n\nPuis elle secoue violemment la tête, comme pour chasser une guêpe.\n\n« Non. Il faut quarante-huit heures, des chaînes et un endroit sûr, et on n’a rien de tout ça ce soir. » Elle retourne près d’Enzo, s’assoit à côté de lui et lui prend la main. « Occupe-toi des petits. Quand il se transformera, je te ferai signe. »',
    choix: [
      {
        label: 'Attendre le signe de Maud',
        effets: { combat: { zombies: ['coureur'], lieu: 'emperi' }, flag: 'enzo_perdu' },
        suivant: 'ch1_siege_chapelle_3',
      },
    ],
  },

  ch1_siege_chapelle_3: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Après, les petits ne pleurent pas, et c’est le pire. Ils regardent le livre tombé par terre, ouvert à la page d’un lapin qui cherche sa maison.\n\nMaud se lave les mains dans le bénitier, longtemps. Elle continue de frotter alors que l’eau est déjà propre.',
    choix: [{ label: 'Sortir', suivant: 'ch1_siege_crise' }],
  },

  ch1_siege_crise: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Vers trois heures du matin, la marée trouve un point faible.\n\nCe n’est pas la grande porte, mais la poterne, une petite porte de service en bas du château, du côté du lycée. Au crépuscule, une équipe de quatre élèves est sortie par là avec une brouette pour remplir des bidons à la fontaine, et elle n’est pas rentrée. Les voilà maintenant en bas de la poterne, collés contre la grille, avec la marée qui monte la ruelle derrière eux.\n\nVidal est déjà dans l’escalier, et tu le suis. Il lève la grille, tire le premier élève à l’intérieur, puis le deuxième…\n\nC’est alors que la marée arrive.\n\nVidal sort dans la ruelle, le sabre levé, et se place entre la marée et les deux derniers élèves pour frapper.\n\n« LA GRILLE ! » hurle-t-il sans se retourner. « FERME-LA QUAND ILS SONT DEDANS ! »\n\nLe troisième élève passe, mais le quatrième trébuche sur un bidon.\n\nTu as la manivelle de la grille dans la main. Si tu fermes maintenant, Vidal et le dernier élève resteront dehors. Il faut décider vite.',
    timerMs: 8000,
    timeout: {
      texte: 'Tu n’as pas choisi, alors la marée a choisi pour toi : le quatrième élève passe, Vidal recule, et des morts entrent avec lui, trois ou quatre, accrochés à ses jambes.',
      effets: { combat: { zombies: ['errant', 'coureur', 'enrage'], lieu: 'emperi' }, flag: 'theo_sauve' },
      suivant: 'ch1_siege_vidal',
    },
    choix: [
      { label: 'Fermer la grille tout de suite', suivant: 'ch1_siege_fermer' },
      { label: 'Attendre que le dernier élève passe', suivant: 'ch1_siege_attendre' },
      { label: 'Sortir dans la ruelle pour aider Vidal', suivant: 'ch1_siege_sortir' },
    ],
  },

  ch1_siege_fermer: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Tu tournes la manivelle.\n\nLa grille descend, et Vidal l’entend, mais il ne se retourne pas. Le quatrième élève, qui s’appelait Théo, tu l’apprendras au matin, se relève et se jette vers la grille. Ses doigts passent entre les barreaux au moment où elle touche le sol.\n\nVidal recule jusqu’à lui, dos à la grille, et il frappe encore et encore, jusqu’à ce que la marée se referme sur eux comme une main.\n\nVidal ne crie pas. C’est Théo qui crie, longtemps.\n\nTu tiens la manivelle jusqu’à ce que tes paumes saignent, en pensant à une vidéo de quarante et une secondes. Tu ne sais pas si c’est de la justice. Tu sais seulement que c’est le même geste que le sien, le 6 septembre.',
    choix: [
      {
        label: 'Lâcher la manivelle',
        effets: {
          flags: { vidal_mort: true, theo_perdu: true, siege_fait: true },
          journal: 'La nuit des sonnailles. J’ai fermé la grille de la poterne sur Vidal et sur Théo, pour que les morts n’entrent pas. Le même geste que Vidal le 6 septembre, quand il m’a {laissé|laissée} dehors.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  ch1_siege_attendre: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Tu attends une seconde, puis deux. Théo se relève, se jette vers la grille et passe. Vidal recule, frappe, recule encore…\n\n« MAINTENANT ! »\n\nMais c’est trop tard : des morts passent la grille avec lui, trois ou quatre, accrochés à ses jambes.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['errant', 'coureur', 'enrage'], lieu: 'emperi' }, flag: 'theo_sauve' }, suivant: 'ch1_siege_vidal' },
    ],
  },

  ch1_siege_sortir: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Tu lâches la manivelle et tu sors dans la ruelle, à côté de Vidal. Théo est à terre, à deux pas des morts.',
    choix: [
      {
        label: 'Attraper Théo et le traîner à l’intérieur',
        test: { skill: 'force', difficulte: 2 },
        reussite: {
          texte: 'Tu attrapes Théo par le col et tu le jettes à l’intérieur comme un sac. Vidal recule avec toi, pas à pas, en faisant tournoyer son sabre, et la grille tombe juste devant vous. Vous voilà dedans tous les deux, adossés au mur, à reprendre votre souffle.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', xp: { force: 15 } },
          suivant: 'ch1_siege_vidal',
        },
        echec: {
          texte: 'Tu attrapes Théo, mais une main t’attrape, toi, par l’épaule, et des ongles te déchirent le dos jusqu’à l’omoplate. Vidal frappe par-dessus ton épaule, une fois, deux fois, et vous passez la grille tous les trois, emmêlés, juste avant qu’elle tombe derrière vous.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', blessure: { type: 'entaille', zone: "à l'épaule" }, pv: -10 },
          suivant: 'ch1_siege_vidal',
        },
      },
    ],
  },

  ch1_siege_vidal: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'La grille est fermée, et les morts qui sont entrés gisent à terre. Théo est vivant : à genoux, il vomit dans l’escalier.\n\nVidal est assis contre le mur de la poterne, le sabre en travers des genoux. Il a relevé la manche de son pull bleu, et sur son avant-bras, tu vois une morsure nette et profonde, qui saigne à peine.\n\nIl la regarde avec un intérêt presque professionnel, puis il te regarde.\n\n« Tu fais une drôle de tête. Pas celle de quelqu’un qui a peur que je me transforme, mais celle de quelqu’un qui sait. » Il a un sourire épuisé. « Alors dis-moi : qu’est-ce qui m’attend ? »',
    choix: [
      { label: '« Tu vas mourir. Et te relever. »', suivant: 'ch1_vidal_simple' },
      { label: '« On peut revenir, mais il faut manger quelqu’un. »', si: { flag: 'registre_trouve' }, suivant: 'ch1_vidal_un_pour_un' },
    ],
  },

  ch1_vidal_simple: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: '« Tu vas mourir. Ensuite, ton corps va se relever, et il reviendra tous les jours devant cette poterne, parce qu’ils retournent tous quelque part. »\n\nVidal hoche la tête. « Je sais où je reviendrai. » Il lève les yeux vers le haut de l’escalier, où les têtes des élèves sont penchées au-dessus de la rampe. « Je ne veux pas qu’ils me voient revenir. »\n\nIl te tend le sabre, la poignée en avant.\n\n« Achève-moi proprement. Et après, emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme celle-là. »',
    choix: [
      { label: 'Prendre le sabre', suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_un_pour_un: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu lui dis tout : la housse, le registre, et la règle selon laquelle un mort qui mange un adulte entier dans les quarante-huit heures peut revenir. Tu lui dis que tu as mangé un homme, et que c’est pour ça que tu es là.\n\nVidal écoute jusqu’au bout sans t’interrompre, comme on écoute un exposé.\n\nPuis il lève les yeux vers le haut de l’escalier, vers les têtes des élèves penchées au-dessus de la rampe.\n\n« Lequel ? » demande-t-il doucement. « Lequel tu me donnerais à manger ? »\n\nIl rit, puis il tousse. La fièvre monte déjà, tu la vois dans ses yeux.\n\n« Non. Personne ne mangera personne pour moi. » Il te tend le sabre, la poignée en avant. « Achève-moi proprement. Et après, emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme celle-là. »',
    choix: [
      { label: 'Prendre le sabre', effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_fin: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Il ferme les yeux et récite quelque chose à mi-voix. Tu crois d’abord que c’est une prière, mais c’est une date : « Onze juin 1909, vingt et une heures dix. » C’est le soir du tremblement de terre. Il la répète comme une leçon, et tu comprends que c’est la dernière chose qu’il veut avoir en tête : un tremblement de terre, et des murs qui tiennent.\n\nTu le fais proprement, comme il te l’avait demandé.',
    choix: [
      {
        label: 'Garder le sabre',
        effets: {
          flags: { vidal_acheve: true, siege_fait: true },
          objet: ['sabre_cavalerie', 1],
          journal: 'Vidal a été mordu en défendant la poterne. Il m’a demandé de l’achever, proprement. Je l’ai fait. Il récitait la date du tremblement de terre de 1909.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  ch1_vidal_lou: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou descend l’escalier : elle a tout entendu. Elle ne pleure pas. Elle s’accroupit devant Vidal et lui prend doucement le sabre des mains, comme on retire ses lunettes à quelqu’un qui s’est endormi en lisant.\n\n« Vous m’avez toujours dit de finir ce que je commençais », dit-elle.\n\nVidal rit et lui touche la joue du dos de la main. « Pas sur ce ton, Mercadier. »\n\nTu remontes l’escalier sans regarder, mais tu entends.',
    choix: [
      {
        label: 'Attendre l’aube',
        effets: {
          flags: { vidal_acheve_lou: true, siege_fait: true },
          journal: 'Vidal a été mordu en défendant la poterne. C’est Lou qui l’a achevé. Il l’a appelée par son nom de famille, comme en classe.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  // ─────────────────────────── L’AUBE ───────────────────────────
  ch1_aube: {
    illu: 'emperi_remparts_aube', musique: 'sombre',
    texte: 'L’aube se lève à l’est, grise et sale, et le silence revient avec elle.\n\nLa marée des morts a quitté la montée du Puech. Elle s’en va, en laissant derrière elle des corps, des morts et des nôtres, et des traînées sombres sur les pavés.',
    choix: [
      {
        label: 'Monter sur le rempart',
        effets: { cinematique: 'aube_troupeau', flags: { troupeau_passe: true, berger_vu: true } },
        suivant: 'ch1_aube_troupeau',
      },
    ],
  },

  ch1_aube_troupeau: {
    illu: 'emperi_remparts_aube', musique: 'sombre',
    texte: 'Du haut du rempart, tu vois la marée des morts s’étirer vers le nord, sur la route d’Avignon : une rivière de dos courbés, sans fin, qui va jusqu’au rond-point, jusqu’aux champs et jusqu’à l’horizon. En passant, elle a emmené tous les morts de Salon, et en bas, les rues de la vieille ville sont plus vides que tu ne les as jamais vues.\n\nTout à l’avant, très loin, deux silhouettes marchent côte à côte. L’une est un vieil homme habillé en berger, avec un grand bâton, un chapeau et une cape de laine, et deux chiens qui tournent autour de lui. L’autre est une petite femme, courbée sous le poids d’une cloche énorme qu’elle serre à deux mains contre sa poitrine, comme un enfant.\n\nLa cloche sonne toutes les dix secondes, et tous les morts de Salon se sont levés pour la suivre.',
    choix: [{ label: 'Redescendre', suivant: 'ch1_aube_radio' }],
  },

  ch1_aube_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'La radio',
    texte: 'Dans la tour d’angle, la radio grésille toute seule. Lou est assise devant, les genoux sous le menton, et elle monte le son quand tu entres.\n\nTu entends une voix de femme qui n’est pas celle de l’armée : une voix d’ici, avec l’accent, rauque d’avoir trop parlé.\n\n« …ici les grottes de Calès, au-dessus de Lamanon. On est quarante-trois. On a de l’eau, des murs et de la place. On prend les enfants, et tous ceux qui ne sont pas mordus. Si vous entendez ce message, venez par les collines, pas par la route : la route est à eux, maintenant. On écoute à chaque heure pile. Ici Jo, aux grottes de Calès… »\n\nJo. C’est le nom que Luc a prononcé avant que tu le manges.\n\nTu restes figé, et Lou te regarde bizarrement.\n\n« Quoi ? Tu la connais ? »',
    choix: [
      { label: '« Non. »', suivant: 'ch1_depart' },
      { label: '« J’ai une lettre pour elle. »', si: { objet: 'lettre_luc' }, suivant: 'ch1_aube_lettre' },
    ],
  },

  ch1_aube_lettre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: '« Une lettre ? » Lou fronce les sourcils. « De qui ?\n\n— D’un homme qui est mort. »\n\nElle te regarde longtemps, avec ses yeux de dessinatrice qui voient ce qu’on cache, mais elle ne pose pas d’autre question. Elle se lève.\n\n« Alors on va à Calès. »',
    choix: [{ label: 'Continuer', suivant: 'ch1_depart' }],
  },

  ch1_depart: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'Vous partez à midi. Personne ne dit qu’on abandonne le château, mais tout le monde le sait : il ne tiendrait pas une deuxième nuit. Les grands portent les petits, les bidons, les couvertures et les sabres du musée. On enterre les morts de la nuit dans le Jardin des Simples, le jardin de plantes médicinales du château, parce que c’est là que la terre est la plus meuble.',
    choix: [
      { label: 'Regarder Maud', si: { flag: 'maud_captive' }, suivant: 'ch1_depart_captive' },
      { label: 'Regarder Maud', si: { flag: 'maud_protegee' }, suivant: 'ch1_depart_libre' },
    ],
  },

  ch1_depart_captive: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud marche au milieu de la file, les poignets attachés par une corde que tient Hugo. Les élèves ont décidé qu’elle serait jugée « par des adultes, là-bas ». Personne ne sait ce que ça veut dire, mais tout le monde est soulagé de ne pas avoir à décider ce matin.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Tu as bien fait, tu sais », dit-elle. « C’est ce que j’aurais fait à ta place. » Elle marque un temps. « C’est bien ça, le problème. »',
    choix: [{ label: 'Partir vers le nord', suivant: 'ch1_fin' }],
  },

  ch1_depart_libre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Maud',
    texte: 'Maud marche en queue de file, sa trousse à l’épaule, et à chaque halte, elle recoud les blessures de la nuit. Les élèves l’appellent « docteure », comme avant, et deux d’entre eux lui tiennent la main. Elle se laisse faire.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Merci », dit-elle. Puis, plus bas : « Ne me le fais pas regretter, et je ne te le ferai pas regretter non plus. »',
    choix: [{ label: 'Partir vers le nord', effets: { flag: 'maud_medecin' }, suivant: 'ch1_fin' }],
  },

  ch1_fin: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'Une vingtaine de survivants quittent l’Empéri en file par la poterne, et descendent vers le nord par les jardins, entre les murets et les oliviers, loin de la route.\n\nTu te retournes une seule fois. Au-dessus des toits vides, le cadran de la Tour de l’Horloge marque toujours neuf heures dix.\n\n— FIN DU CHAPITRE 1 —',
    choix: [
      {
        label: 'Chapitre 2 : La transhumance',
        effets: {
          flag: 'ch1_fini',
          quete: ['q_protocole', 'fin'],
          decouvrir: ['cales'],
          cinematique: 'ch2_intro',
          journal: 'Nous quittons Salon pour les grottes de Calès, au-dessus de Lamanon. La femme de la radio s’appelle Jo. Dans mon sac, j’ai une lettre « Pour Jo » : celle de Luc, l’homme que j’ai mangé.',
        },
        suivant: 'ch1_fin_2',
      },
    ],
  },

  ch1_fin_2: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'Le groupe passera par les collines, en file et lentement, à cause des petits. Toi, tu prendras les chemins pour aller plus vite, et vous vous retrouverez aux grottes de Calès.',
    choix: [
      {
        label: 'Ouvrir la carte pour rejoindre Calès',
        effets: { quete: ['q_traversee', 'cales'] },
        suivant: '#fin',
      },
    ],
  },
};
