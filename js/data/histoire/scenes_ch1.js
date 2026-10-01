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
    texte: 'Le matin entre par une fenêtre haute. Tu es dans la maison de Nostradamus, devenue un musée. Maud n’a pas dormi. Elle est assise au bureau de Nostradamus, au premier étage, entre une vieille sphère d’astronomie et un crâne en plâtre. Devant elle, un scanner radio — un récepteur qui capte les conversations de l’armée — est branché sur une batterie de voiture. Il crachote des chiffres.\n\nElle pousse vers toi une boîte de raviolis ouverte, froide, avec une cuillère plantée dedans.\n\n« Mange. Et écoute bien, parce que je ne répéterai pas : j’ai trop de choses à dire et plus beaucoup de voix. »',
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
    texte: '« Le mercredi 2 septembre, jour de marché, à 10 h 40, une femme a mordu son mari devant l’étal du fromager, cours Carnot. À midi, j’avais quarante personnes mordues aux urgences. Le soir, trois cents, et une partie de mes infirmières. Les mordus mouraient, puis se relevaient et mordaient à leur tour. » Elle tapote le scanner. « Au bout de trois jours, l’armée a reculé au nord de la Durance, la rivière. Tout ce qui est au sud, de la Crau jusqu’à Marseille, est devenu une zone interdite. Personne n’a le droit d’en sortir. »\n\nElle monte le son. Une voix de femme, nette et lasse, répète en boucle :\n\n« …ici le PC Durance. La zone d’exclusion sanitaire est maintenue. Il est interdit de franchir la Durance. Toute personne qui s’approchera de la ligne sera abattue… »\n\n« Le PC Durance, c’est le poste de commandement de l’armée, de l’autre côté de la rivière. Ça, c’est ce qu’ils disent en clair, pour tout le monde. » Maud baisse le son. « Leurs messages codés sont plus intéressants. »',
    choix: [{ label: '« Que disent les messages codés ? »', suivant: 'ch1_matin_cautere' }],
  },

  ch1_matin_cautere: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Je ne peux pas décoder leurs messages. Mais parfois, un opérateur fatigué laisse passer des mots en clair. » Elle tourne son carnet vers toi. Trois lignes, soulignées deux fois :\n\nCAUTÈRE.\nPREMIER ÉPISODE DE MISTRAL.\nLIGNE DURANCE — MISE À FEU.\n\n« Un cautère, c’est un fer rouge. On brûle une plaie pour qu’elle arrête de saigner. Cautère, c’est le nom de leur plan. » Elle referme le carnet. « Ils attendent le mistral, le grand vent du nord. Le premier jour où il soufflera, ils mettront le feu le long de la Durance, et le vent poussera l’incendie jusqu’à la mer. Les collines, les forêts, la Crau, les villages. Les morts. Et nous avec. »\n\nDehors, les platanes bougent à peine. Pour l’instant, il n’y a pas un souffle de vent.',
    choix: [
      { label: '« Il faut prévenir les vivants. »', suivant: 'ch1_matin_plan' },
      { label: '« Et moi, dans tout ça ? »', suivant: 'ch1_matin_plan' },
    ],
  },

  ch1_matin_plan: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Des vivants, il en reste une trentaine, au château de l’Empéri. Un prof du lycée et ses élèves. Ils se sont enfermés dans le château le premier jour, et ils n’en sont jamais ressortis. » Maud allume une cigarette, pour de vrai cette fois. « Ils ont une radio militaire, prise sur une patrouille morte. Avec elle, je peux parler à Orsini, la commandante du PC Durance. Je l’ai connue les trois premiers jours, à la cellule de crise de la préfecture. Elle m’écoutera. »\n\nElle te montre du menton, de la tête aux pieds.\n\n« Et c’est toi qui feras qu’elle m’écoute. Un mort qui parle. Si l’armée apprend que les morts peuvent revenir, elle ne mettra pas le feu. On ne brûle pas des malades qu’on peut sauver. » Elle souffle la fumée. « S’il leur faut des preuves, mon registre est resté à l’hôpital. On verra ça après. »\n\nElle écrase la cigarette à peine entamée.\n\n« Monte au château de l’Empéri. Demande la radio à Vidal, le prof. Mais d’abord, on va s’occuper de ton bras. Là-haut, ils vérifient les bras de tous ceux qui arrivent. »',
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
    texte: '« À l’Empéri, ils ont une seule règle : à la porte, on montre ses bras. S’ils voient une morsure, même ancienne, même cicatrisée, c’est une balle ou un coup de sabre, selon qui est de garde. »\n\nMaud descend dans la cuisine du musée. Dans la grande cheminée, il y a des braises. Dedans chauffe un long fer à manche de bois, dont le bout est rouge.\n\n« Un cautère. Un vrai, du seizième siècle, prêté par le musée de l’Empéri pour une exposition sur la peste. Personne ne s’en est servi depuis quatre cents ans. » Elle le retourne dans les braises. « Si je brûle ta morsure, elle disparaît. Une brûlure, ça s’explique facilement : une casserole, un incendie. Ça fait très mal, et ça dure trois secondes. »\n\nElle ne t’oblige à rien. Elle attend. Elle a l’habitude qu’on lui dise non.',
    choix: [
      { label: 'Brûler la morsure au fer rouge', suivant: 'nos_cautere' },
      { label: 'Cacher la morsure sous un bandage', suivant: 'nos_bandage' },
      { label: 'Ne rien faire et garder la morsure visible', suivant: 'nos_bras_nu' },
    ],
  },

  nos_cautere: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Tu poses ton avant-bras à plat sur la table de chêne. Maud te glisse une cuillère en bois entre les dents. « Mords. Ça, tu sais faire. »\n\nLe fer arrive.\n\nD’abord, ce n’est pas une douleur. C’est un bruit : un grésillement de viande dans la poêle. Puis l’odeur : ta propre chair, qui sent le barbecue du dimanche. Puis la douleur arrive, du coude jusqu’aux yeux. Tes dents s’enfoncent dans la cuillère jusqu’à la fendre.\n\nTrois secondes. Maud avait raison. Les trois secondes les plus longues de ta vie — de tes deux vies.\n\nQuand elle retire le fer, la marque des dents a disparu. À sa place, il y a une plaie luisante, rouge et blanche, qui ressemble à un accident.\n\n« Voilà », dit-elle en l’enveloppant de gaze. « Tu t’es {brûlé|brûlée} en faisant chauffer de l’eau. Répète. »',
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
    texte: 'Maud hausse les épaules et retire le fer des braises. Elle t’enroule l’avant-bras dans une bande serrée, avec trois tours de sparadrap.\n\n« Si on te demande : c’est une coupure, un éclat de vitre, et tu t’es {recousu|recousue} toi-même. Si on veut défaire le pansement, tu refuses : ça va se rouvrir. » Elle serre le dernier tour un peu trop fort. « Et si on insiste, cours. »',
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
    texte: '« Comme tu veux. » Elle retire le fer des braises et le pose sur la pierre, où il rougit pour rien. « Alors ne mens pas à moitié. Si tu montres ce bras, dis-leur que tu es {immunisé|immunisée} : que la maladie ne t’a pas {eu|eue}. C’est un mensonge qu’ils auront envie de croire. »',
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
    texte: '« Va. Le château de l’Empéri est à trois cents mètres, en haut de la montée du Puech. Tu ne peux pas le rater : c’est la seule chose à Salon qui tienne encore debout, et qui ait envie de le rester. »\n\nElle retourne à son scanner. Sans se retourner, elle ajoute :\n\n« Et ne descends pas à la cave. »',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  // Marqueur 'cave_patiente' (cave voûtée de la maison) : Mireille, P5, en dormance.
  nos_cave: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'La cave voûtée sent la pierre mouillée et le désinfectant. Des tonneaux du musée, une vieille lanterne. Et sur un lit de camp, sous un drap, une forme humaine.\n\nUne chaîne de vélo relie le pied du lit à un pilier. Sous le drap dépasse une cheville grise. Tu soulèves le bord.\n\nC’est une femme d’une quarantaine d’années, en blouse blanche de pharmacienne. Les yeux fermés, les lèvres bleues. Elle ne respire pas. Tu poses deux doigts sur son cou et tu attends longtemps. Enfin, sous tes doigts, son cœur bat. Une seule fois.\n\nElle est comme tu étais dans ta housse : ni morte ni vivante. Elle dort.\n\nScotchée au pilier, une feuille de soins couverte de l’écriture de Maud.',
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
    texte: '« P5 » : patiente numéro 5. Mireille A., pharmacienne sur le cours Carnot. Et une colonne de températures qui remonte, jour après jour, d’un demi-degré.\n\nTa température a dû remonter comme ça, avant ton réveil.\n\nTu rabats le drap. Tu remontes l’escalier sans faire de bruit, avec l’impression que quelqu’un te regarde dans le dos, les yeux fermés.',
    choix: [{ label: 'Remonter', suivant: '#fin' }],
  },

  // ─────────────────────────── L’EMPÉRI ───────────────────────────
  // Déclencheur : entrée dans 'emperi' si quête q_protocole à 'emperi' et pas 'emp_arrivee_faite'.
  emp_arrivee: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'La montée du Puech grimpe raide entre deux murs, sur des pavés polis par les siècles. À gauche, les grilles du lycée, un banc renversé, une banderole de rentrée — BIENVENUE AUX SECONDES — qui pend par un seul coin. Au-dessus, le château de l’Empéri : des murs de huit mètres, des tours carrées, une pierre couleur de pain brûlé.\n\nLa porte est barrée par une grille de chantier renforcée de palettes. Derrière, deux adolescents de quinze ou seize ans. L’un porte un casque de vélo, l’autre un vieux casque de soldat à crinière noire, pris au musée. Ils tiennent deux sabres de musée, qui tremblent un peu.\n\n« Stop. Pas un pas de plus. » La voix de l’adolescent mue encore. « Montre tes bras. Les deux. Remonte tes manches jusqu’aux épaules. »',
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
    texte: 'Tu remontes tes manches. Le bras droit : rien. Le gauche : tu défais toi-même la gaze. La brûlure est laide, luisante, couverte de cloques sur les bords.\n\nL’adolescent au casque à crinière se penche à travers la grille et grimace. « C’est quoi, ça ?\n\n— De l’eau bouillante.\n\n— Ça date de quand ?\n\n— D’hier. »\n\nIl te regarde longtemps. Derrière lui, un homme approche. Grand, maigre, barbe de trois semaines, lunettes réparées au sparadrap, pull de laine bleue trop chaud pour la saison. Il regarde la brûlure, puis tes yeux, puis encore la brûlure.\n\n« Ça a dû faire mal », dit-il simplement. Il fait un signe. « Ouvrez. »',
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
    texte: '« Et ça ? » L’adolescent pointe son sabre vers ton avant-bras gauche, bandé.\n\n« Une coupure. Un éclat de vitre.\n\n— Enlève le bandage.\n\n— Si je l’enlève, ça va se rouvrir. »',
    choix: [
      {
        label: 'Maintenir ton mensonge',
        test: { chance: 0.55 },
        reussite: {
          texte: 'L’adolescent hésite. Derrière lui, un homme grand et maigre, en pull de laine bleue, avec des lunettes réparées au sparadrap, lui pose une main sur l’épaule.\n\n« Laisse, Hugo. Une vitre, c’est une vitre. » Il te regarde droit dans les yeux, une seconde de trop. « Ouvrez. »',
          effets: { flags: { emp_arrivee_faite: true, emp_entree_ok: true, emp_statut: 'normal' } },
          suivant: 'emp_vidal_1',
        },
        echec: {
          texte: 'Hugo glisse la pointe de son sabre entre deux barreaux, sous la bande, et la tranche d’un coup sec. Le bandage tombe. Dessous, il n’y a pas de coupure : il y a une morsure.',
          suivant: 'emp_insp_morsure_vue',
        },
      },
      { label: 'Défaire le bandage', suivant: 'emp_insp_morsure_vue' },
    ],
  },

  emp_insp_morsure: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'Tu remontes tes manches. La morsure est là, en plein jour : la marque rose et luisante d’une mâchoire sur ton avant-bras.\n\nLes deux sabres se lèvent en même temps.',
    choix: [{ label: 'Ne pas bouger', suivant: 'emp_insp_morsure_vue' }],
  },

  emp_insp_morsure_vue: {
    illu: 'montee_puech', musique: 'tension',
    texte: '« MORSURE ! »\n\nLe cri résonne contre les murs. Des pas, des portes, des voix. En dix secondes, six adolescents sont sur le rempart au-dessus de la porte, et une arbalète bricolée vise ton front.\n\nUn homme en pull bleu arrive en courant et s’arrête net. Il regarde ton bras longtemps, sans rien dire. Si longtemps que l’adolescent à l’arbalète demande : « Monsieur ? On tire ? »\n\n« Elle est cicatrisée », dit l’homme. « Une morsure cicatrisée. » Il retire ses lunettes, les essuie sur son pull, les remet. « Ça n’existe pas. Les mordus meurent tous. »',
    choix: [
      { label: '« Je suis {immunisé|immunisée}. »', suivant: 'emp_immunise' },
      { label: '« Mon cœur s’est arrêté. Il est reparti. »', suivant: 'emp_verite' },
      { label: 'Reculer lentement', suivant: 'emp_recul' },
    ],
  },

  emp_immunise: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le mot tombe dans le silence. Là-haut, sur le rempart, les visages changent. Tu vois l’envie de te croire monter dans leurs yeux.\n\n« {Immunisé|Immunisée} », répète l’homme, pour lui-même, comme un mot étranger. Il ne te croit pas. Mais il ne croit pas non plus le contraire. Il est prof : il a appris à attendre la fin de la copie avant de juger.\n\n« Julien Vidal. Je m’occupe d’eux. » Il montre les murs, les adolescents. « Tu dormiras dans la chapelle, porte fermée à clé, et quelqu’un te surveillera toute la nuit. Si ça ne te va pas, tu redescends. »',
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
    texte: 'Tu racontes tout : la housse, l’étiquette, le cimetière, la tour. Tu le racontes mal, dans le désordre, et ça sonne exactement comme ce que c’est : de la folie.\n\nPersonne ne rit. C’est pire.\n\n« Redescends », dit Vidal, très doucement, comme on parle à quelqu’un au bord d’un toit. « Redescends, et ne reviens pas. Si tu reviens, ils tireront. »\n\nTu fais demi-tour. Au bout de dix pas, sa voix te rattrape, plus basse, cassée.\n\n« Attends. » Un silence. « Il me manque deux élèves, Lou et Nathan. Ils sont partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent, l’église du quartier. Ils ne sont pas revenus. » Tu l’entends avaler sa salive. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre la porte. »',
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
    texte: 'Tu recules d’un pas, les mains ouvertes. Puis d’un autre. L’arbalète te suit.\n\n« Attends », dit l’homme au pull bleu. Il a l’air de détester ce qu’il va dire. « Il me manque deux élèves, Lou et Nathan. Ils sont partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent, l’église du quartier. Ils ne sont pas revenus. » Il remonte ses lunettes. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre la porte. »',
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
    texte: 'Dans la grande cour du château, du linge sèche sur une corde tendue entre deux colonnes. Une marmite fume sur un feu de palettes. Et partout, des adolescents. Vingt, vingt-cinq. Des lycéens, et un petit de sixième qu’on a gardé quand même. Ils te regardent comme un animal au zoo : de loin, avec un peu de pitié et beaucoup de curiosité.\n\nL’homme au pull bleu te fait asseoir sur une marche.\n\n« Julien Vidal. Prof d’histoire-géographie. Dix-neuf élèves, six adultes, dont deux qui ne se lèvent plus. On tient parce que les murs tiennent. En 1909, un tremblement de terre a fendu la ville, et ces murs-là n’ont pas bougé. » Il parle comme en cours. C’est sa façon de tenir. « Qu’est-ce que tu veux ? »',
    choix: [{ label: '« La radio. Pour Maud Sérane. »', suivant: 'emp_vidal_radio' }],
  },

  emp_vidal_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Sérane. » Le nom fait passer une ombre sur son visage, vite effacée. « La docteure. Au début, elle a recousu deux de mes élèves. Après, on lui en a amené d’autres. Certains ne sont pas revenus. » Il retire ses lunettes. « On ne sauve pas tout le monde. »\n\nIl regarde la tour d’angle, où une antenne est fixée au bout d’un bâton de ski.\n\n« Cette radio, c’est mon seul lien avec l’extérieur. Je ne la prête pas. » Il remet ses lunettes. « Mais j’ai un problème, et toi, tu as des jambes. Lou et Nathan, deux de mes élèves, sont partis hier à l’aube à la collégiale Saint-Laurent. Ils allaient chercher des cierges pour s’éclairer, et du vin de messe pour désinfecter les plaies. Ils devaient rentrer à midi. »\n\nSa voix ne tremble pas. Ce sont ses mains qui tremblent.\n\n« Ramène-les-moi, et je te prête la radio pendant une heure. »',
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
    texte: 'La collégiale Saint-Laurent, la grande église du quartier, se dresse au bout du square. Elle est trop haute pour la place qu’on lui a laissée, avec son clocher à huit côtés. Sur le parvis, un vélo couché, un sac de sport ouvert et vide. Et un chien.\n\nUn petit chien roux, attaché à la grille du square par une corde. Il est terriblement maigre. Il n’aboie pas. Il remue la queue une fois, comme pour s’excuser.\n\nSur le lourd portail de bois, quelqu’un a écrit à la craie, en lettres rondes : ON EST DEDANS. L + N. 7 H. L et N : Lou et Nathan.',
    choix: [
      { label: 'Détacher le chien', suivant: 'stl_chien' },
      { label: 'Entrer', suivant: '#fin' },
    ],
  },

  stl_chien: {
    illu: 'collegiale_nef', musique: null,
    texte: 'Tu dénoues la corde. Le chien ne s’enfuit pas. Il boit dans ta main ce qui reste de ta gourde, sans lever les yeux. Puis il s’assoit devant le portail fermé, et il attend.\n\nSur son collier, une médaille en forme d’os : PISTACHE. Et un numéro de téléphone que plus personne n’appellera.',
    choix: [{ label: 'Entrer', effets: { flag: 'pistache_libre' }, suivant: '#fin' }],
  },

  // Déclencheur (zone) : entrée dans la nef.
  stl_nef: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'D’abord le froid. Puis l’odeur de cire. Puis les morts.\n\nLa nef est pleine. Quarante, cinquante morts debout entre les bancs, tournés vers l’autel, immobiles, épaule contre épaule, comme des fidèles qui attendent le début de la messe. Des gens du quartier, en vêtements de tous les jours. Une caissière en blouse. Un adolescent, un casque de scooter à la main. Ils étaient venus se réfugier ici le premier dimanche. Ils y sont restés.\n\nAu fond, derrière l’autel, se tient un prêtre mort, dans une longue robe blanche tachée. Il agite une clochette dorée. Ding. Ding. Ding. Sans s’arrêter, régulièrement, comme s’il attendait une réponse.\n\nToutes les têtes suivent le son. Aucune ne se tourne vers toi. Tant que la clochette sonne, elle couvre le bruit de tes pas.',
    choix: [
      {
        label: 'Avancer sans faire de bruit',
        effets: { journal: 'La collégiale Saint-Laurent est pleine de morts debout, tournés vers l’autel. Un prêtre mort agite sa clochette. Tant qu’elle sonne, ils ne m’entendent pas.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'cure_autel' : voler la clé de la sacristie à la ceinture du prêtre.
  stl_cure: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Tu es tout près du prêtre. Tu vois les veines noires sous la peau de ses mains, sa mâchoire qui mâche dans le vide, l’anneau de la clochette passé à son doigt. À sa ceinture de corde pend un trousseau de trois clés de fer. L’une d’elles, longue et ouvragée, porte une étiquette : SACRISTIE. La sacristie, c’est la pièce derrière l’autel ; elle a une porte sur la rue.\n\nDing. Ding. Ding.\n\nSi la clochette s’arrête, tous les morts se retourneront.',
    choix: [
      {
        label: 'Détacher les clés entre deux coups de clochette',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Ding. Tu soulèves l’anneau. Ding. Tu le fais glisser le long de la corde. Ding. Le trousseau est dans ta main, et le prêtre continue d’appeler un Dieu qui ne répond plus.',
          effets: { objet: ['cle_sacristie', 1], xp: { dexterite: 12 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'Les clés s’entrechoquent. Un petit bruit de ferraille, presque rien.\n\nLa clochette s’arrête.\n\nLe prêtre baisse les yeux vers toi. Derrière toi, cinquante têtes se tournent ensemble, dans un froissement de tissu.',
          effets: { objet: ['cle_sacristie', 1], combat: { zombies: ['errant'] } },
          suivant: 'stl_cure_apres',
        },
      },
      { label: 'Renoncer pour l’instant', suivant: '#fin' },
    ],
  },

  stl_cure_apres: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Le prêtre est à terre, la clochette dans la main. Elle ne sonne plus.\n\nEt tous les morts de la nef se mettent en marche vers toi.',
    choix: [{ label: 'Courir', effets: { bruit: 3 }, suivant: '#fin' }],
  },

  // Marqueur 'tombeau_nostradamus' (chapelle de la Vierge, fermée par une grille).
  stl_nathan: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'La chapelle de la Vierge, sur le côté de l’église, est fermée par une grille de fer forgé. Derrière la grille, contre le mur, il y a une plaque de marbre avec un portrait gravé et un nom : MICHEL NOSTRADAMUS. C’est son tombeau. Ses os reposent ici depuis 1791, depuis que des soldats de la Révolution ont ouvert sa première tombe et, dit-on, bu du vin dans son crâne.\n\nDevant la plaque, un garçon de seize ans est couché sur les dalles. Un sweat du lycée de l’Empéri, des baskets neuves. Sa main droite est enroulée dans un tee-shirt plein de sang. C’est sûrement Nathan.\n\nQuand ta lampe passe sur lui, il ouvre les yeux. Ils sont blancs. Il est mort.\n\nIl se lève sans hâte, comme après une sieste, et vient coller son visage contre la grille. Côté église, la grille est fermée par un antivol de vélo. Quelqu’un l’a enfermé là. Quelqu’un qui savait qu’il allait se transformer.',
    choix: [
      { label: 'Prendre un chandelier et l’achever à travers la grille', suivant: 'stl_nathan_acheve' },
      { label: 'Le laisser', effets: { flag: 'nathan_laisse' }, suivant: '#fin' },
    ],
  },

  stl_nathan_acheve: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'Le chandelier de bronze est lourd. Tu passes le bras entre deux barreaux. Nathan se laisse faire, bouche ouverte, les doigts accrochés au fer, tendu vers toi comme un enfant vers un gâteau.\n\nTu frappes une fois. Il recule d’un pas, surpris. Tu frappes encore. Il tombe à genoux devant le tombeau de Nostradamus, et tu frappes jusqu’à ce qu’il ne bouge plus.\n\nTout là-haut, quelque part dans le clocher, quelqu’un pleure sans bruit.',
    choix: [
      { label: 'Reposer le chandelier', effets: { flag: 'nathan_acheve', document: 'doc_tombeau' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'clocher_lou' (chambre des cloches du clocher octogonal).
  stl_lou: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Tout en haut de l’escalier en colimaçon, dans la salle des cloches, une fille est assise dos au mur. Elle tient un couteau à pain à deux mains, pointé vers toi. Quinze ans. Des cheveux coupés court, mal, aux ciseaux de cuisine. Un sweat trop grand, un carnet à dessin glissé dans la ceinture. À côté d’elle, un cabas plein de cierges et trois bouteilles de vin de messe.\n\nElle ne baisse pas le couteau.\n\n« Tu viens du château ? » Sa voix est cassée par la soif. « C’est Vidal qui t’envoie ? »\n\nTu dis oui. Elle baisse le couteau d’un centimètre. C’est Lou.\n\n« Nathan… » Elle regarde vers l’escalier. « Le curé l’a mordu. Hier. Il m’a demandé de l’enfermer dans la chapelle. Il disait que celui qui ouvre le tombeau de Nostradamus meurt dans l’année, et qu’il avait toujours voulu vérifier. » Elle rit, d’un rire sec, horrible. « C’était un con. C’était mon meilleur pote. »',
    choix: [
      { label: '« C’est fini, pour Nathan. »', si: { flag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_fini' },
      { label: '« Il est toujours derrière la grille. »', si: { pasFlag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_vivant' },
    ],
  },

  stl_lou_nathan_fini: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou regarde tes mains, et le sang dessus. Elle hoche la tête, une fois.\n\n« Merci », dit-elle. C’est le merci le plus dur que tu entendras de ta vie.',
    choix: [{ label: '« On sort. »', suivant: 'stl_lou_sortie' }],
  },

  stl_lou_nathan_vivant: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: '« Je sais. Je l’entends. » Elle serre le couteau. « Je voulais le faire. Je n’ai pas pu. » Elle te regarde. « Tu le ferais, toi ? »',
    choix: [
      { label: '« Oui. Je m’en occupe en descendant. »', suivant: 'stl_lou_nathan_faire' },
      { label: '« Non. On le laisse là. »', effets: { flag: 'nathan_laisse' }, suivant: 'stl_lou_sortie' },
    ],
  },

  stl_lou_nathan_faire: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'En descendant, tu t’arrêtes devant la grille de la chapelle. Lou reste en haut des marches. Elle ne regarde pas. Elle écoute.\n\nQuand tu reviens, elle a les yeux secs et la mâchoire serrée à se casser les dents.\n\n« Il disait que Nostradamus avait tout prédit, dit-elle. Même lui. »',
    choix: [{ label: '« On sort. »', effets: { flag: 'nathan_acheve' }, suivant: 'stl_lou_sortie' }],
  },

  stl_lou_sortie: {
    illu: 'collegiale_nef', musique: 'tension', orateur: 'Lou',
    texte: 'Elle se relève, s’appuie au mur, et regarde ton visage à la lumière de ta lampe. Longtemps. Elle fronce les sourcils.\n\n« On s’est déjà vus, nous deux.\n\n— Je ne crois pas.\n\n— Si. » Elle secoue la tête. « Laisse tomber. Je suis crevée, je vois des gens partout. »\n\nElle ramasse le cabas de cierges. « Par la grande porte, impossible : ils sont tous dans la nef. On sort par la sacristie, derrière l’autel. Mais la porte est fermée à clé, et c’est le curé qui a la clé. » Elle avale sa salive. « Et le curé, il est devant l’autel. Avec sa clochette. »',
    choix: [
      { label: '« J’ai la clé. »', besoin: { objet: 'cle_sacristie' }, effets: { flag: 'lou_trouvee' }, suivant: 'stl_sortie' },
      { label: '« Attends-moi ici. Je vais chercher la clé. »', effets: { flag: 'lou_trouvee' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'porte_sacristie' (si Lou trouvée et clé en poche) — ou directement depuis stl_lou_sortie.
  stl_sortie: {
    illu: 'collegiale_nef', musique: 'calme', orateur: 'Lou',
    texte: 'La clé tourne avec un grincement. Derrière la porte, la sacristie : des robes de prêtre pendues à des cintres, un lavabo, une odeur de naphtaline. Une porte basse donne sur la ruelle.\n\nLou passe devant toi, s’arrête sur le seuil et se retourne vers la nef. Là-bas, la clochette continue : ding, ding, ding.\n\n« Tu crois qu’ils savent qu’ils sont morts ? » demande-t-elle.\n\nElle n’attend pas la réponse. Dehors, il fait jour, et la lumière lui fait mal aux yeux. Elle rit, puis elle pleure, puis elle se met en marche.',
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
    texte: 'Quand Lou passe la grille du château, Vidal ne dit rien. Il la prend dans ses bras, maladroitement, comme un prof qui n’en a pas le droit. Il la serre longtemps, les yeux fermés, pendant que les autres élèves font semblant de regarder ailleurs.\n\nPuis il te regarde par-dessus l’épaule de Lou.\n\n« Et Nathan ? »',
    choix: [
      { label: '« Il avait été mordu. Je l’ai achevé. »', si: { flag: 'nathan_acheve' }, suivant: 'emp_retour_nathan' },
      { label: '« Il avait été mordu. Il est enfermé dans la chapelle de la Vierge. »', si: { flag: 'nathan_laisse' }, suivant: 'emp_retour_nathan' },
    ],
  },

  emp_retour_nathan: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Vidal ferme les yeux. Il reste debout, la main sur la tête de Lou, pendant de longues secondes.\n\n« Merci », dit-il enfin, du ton dont on signe un certificat de décès.',
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
    texte: '« Entre. » Il fait signe aux gardes de la porte. « Je ne sais toujours pas ce que tu es. Lou dit que ça n’a pas d’importance. » Il a un sourire fatigué. « Lou a quinze ans. »\n\nLa grille s’ouvre. Personne ne baisse son sabre, mais personne ne le lève.',
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
    texte: '« La radio est en haut de la tour d’angle. Tu as une heure. » Il lève un doigt, comme devant une classe. « Et on n’appelle jamais la nuit : l’armée aussi nous écoute. »',
    choix: [{ label: 'Monter à la radio, en haut de la tour', suivant: '#fin' }],
  },

  // Marqueur 'radio_emperi' (sommet de la tour d'angle), si 'radio_ok' et pas 'radio_essayee'.
  emp_radio: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'La radio est un poste militaire vert olive, lourd comme une valise de pierres, posé sur une table de camping en haut de la tour. Un combiné à fil en spirale. Une batterie de camion branchée avec des pinces. À côté, Vidal a scotché une liste de fréquences et d’horaires, avec une ligne soulignée : NE PAS APPELER LA NUIT — ILS ÉCOUTENT AUSSI.\n\nTu règles la fréquence que Maud t’a notée. Tu appuies sur le bouton pour parler.\n\n« PC Durance, PC Durance, ici Salon, château de l’Empéri. Message pour la commandante Orsini, de la part de la docteure Sérane. »\n\nUn souffle. Puis une voix d’homme, jeune, sans émotion :\n\n« Salon, ici PC Durance. Donnez votre code d’authentification. »\n\nL’armée ne parle qu’aux postes qui donnent un code secret. Tu n’en as pas.',
    choix: [{ label: '« Je n’ai pas de code. Dites-lui : Sérane a la preuve. »', suivant: 'emp_radio_2' }],
  },

  emp_radio_2: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'Un silence si long que tu crois la communication coupée.\n\n« Salon, le PC Durance ne répond pas aux postes sans code. » Encore un silence. Puis, plus bas, comme s’il se penchait vers le micro : « …Si la docteure a quelque chose, elle sait où nous trouver. Avec le code. Terminé. »\n\nLe souffle revient. Tu reposes le combiné.\n\nDerrière toi, Lou a tout entendu. Elle mâchonne une mèche de cheveux. « C’est quoi, la preuve ? »',
    choix: [
      { label: '« Rien. Une histoire entre la docteure et l’armée. »', suivant: 'emp_radio_fin' },
      { label: 'Ne rien répondre', suivant: 'emp_radio_fin' },
    ],
  },

  emp_radio_fin: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'Tu redescends l’escalier de la tour. Sans code, la radio ne sert à rien. Maud s’y attendait, tu en es {sûr|sûre} maintenant : « S’il leur faut des preuves, mon registre est resté à l’hôpital. »\n\nL’hôpital. Tu l’as vu du haut de la tour : un bâtiment blanc au bord de la ville, des ambulances garées en épi, et rien qui bouge. Ou alors, tout ce qui bouge est mort.',
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
    texte: 'Lou sort le carnet à dessin de sa ceinture et le feuillette sans te regarder. Des dessins au stylo bille, serrés, minutieux : les tours du château, les toits, des élèves endormis, Vidal de dos. Et des morts. Beaucoup de morts, dessinés avec une précision de scientifique.\n\nElle s’arrête sur une double page et la tourne vers toi.\n\nSix fois le même personnage, avec une date dans un coin : 4/9, 5/9, 5/9, 6/9, 7/9, 8/9. Un mort debout au pied de la porte du château, en bas de la montée. Un sac à dos rouge, une bretelle cassée. Le visage levé vers la grille.\n\nC’est toi. Après ta mort, avant ton réveil.\n\n« Tu revenais tous les jours, dit Lou. À la même heure. Tu restais là à regarder la porte. Nathan t’appelait “le Client”. » Elle referme le carnet. « Et un matin, une ambulance est montée, une femme est descendue avec une perche, et tu es {parti|partie} avec elle. Comme un chien. »',
    choix: [{ label: '« Tu vas le dire à Vidal ? »', suivant: 'emp_lou_secret' }],
  },

  emp_lou_secret: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Lou réfléchit sérieusement, comme devant un exercice.\n\n« Non. » Elle hausse les épaules. « D’abord, il ne me croirait pas. Ensuite, tu m’as sortie de là-bas. Et puis… » Elle tapote le dessin. « Ton sac. Il est toujours en bas, dans les ronces, sous le rempart, là où tu te tenais. Personne n’est allé le chercher. Personne ne va dans les ronces. »',
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
    texte: 'Il est là, dans les ronces, sous le rempart : un sac à dos rouge délavé, une bretelle arrachée, la toile raidie par la pluie et le soleil.\n\nTu le reconnais avant de t’en souvenir. Tes mains le reconnaissent : elles savent où est la fermeture, elles savent que la poche du haut coince.\n\nDedans : un pull gris roulé en boule, qui sent encore ta lessive. Une gourde d’eau croupie. Un livre de poche gonflé d’humidité — Colline, de Giono —, avec en marque-page un billet de train Marseille–Salon daté du 30 août. Une paire de gants de vendange neufs, avec l’étiquette. Tu étais {venu|venue} pour les vendanges. Et une batterie de secours pour téléphone, le câble enroulé autour.',
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
    texte: 'La batterie a gardé un tiers de sa charge. Le téléphone met une éternité à démarrer. Puis l’écran fendu s’allume et te demande ton code.\n\nTes pouces le tapent tout seuls.\n\nQuarante-trois notifications : des messages, des appels manqués, des alertes. La dernière alerte du gouvernement date du 7 septembre : ZONE D’EXCLUSION SANITAIRE — RESTEZ CONFINÉS — NE CHERCHEZ PAS À REJOINDRE LA DURANCE.\n\nEt dans la galerie, une dernière vidéo, filmée le 6 septembre à 17 h 52. Le jour de ta mort. Quarante et une secondes.',
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
    texte: 'Tu lis tout. Les messages d’avant, qui parlent de vendanges, de rendez-vous, d’un appartement. Les messages du Mercredi, de plus en plus courts. Et les derniers, qui n’attendaient plus de réponse.\n\nIl reste la vidéo.',
    choix: [{ label: 'Regarder la vidéo', suivant: 'emp_video' }],
  },

  emp_video: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'L’image tremble. Tu cours. On entend ta respiration, énorme dans le micro, et ta voix, que tu ne reconnais pas, aiguë, en larmes : « Attendez ! Attendez ! »\n\nC’est la montée du Puech, filmée d’en bas, de travers. En haut, la porte du château, à moitié fermée par une grille. Des élèves passent en courant. Un homme en pull bleu les pousse à l’intérieur un par un, en comptant à voix haute. Seize. Dix-sept. Dix-huit.\n\nC’est Vidal.\n\nTu arrives en haut. Ta main entre dans l’image, tendue vers la grille. Vidal se retourne. Il te voit. Pendant une seconde, il te voit.\n\nPuis sa main s’abat sur ta poitrine et te repousse, fort. L’image bascule — le ciel, les murs, les pavés — et là-haut, la grille se ferme avec un bruit de fer.\n\nTu cries « Monsieur ! ». Derrière toi, quelqu’un grogne, et l’image se remplit de mains.\n\nLes dix dernières secondes, on ne voit que le ciel. Un ciel bleu, vide. Et un bruit que tu reconnais maintenant : le bruit de quelqu’un qu’on mange.',
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
    texte: 'Tu tends le téléphone à Vidal sans rien dire. La vidéo défile. Tu regardes son visage pendant qu’il se regarde.\n\nAu moment où sa main te repousse, il ferme les yeux. Il ne les rouvre qu’à la fin.\n\n« Dix-huit », dit-il enfin. « J’avais dix-huit élèves à faire entrer, et il y avait de la place pour dix-huit. Pas un de plus. Je ne sais pas si c’était vrai. Je l’ai cru. » Il retire ses lunettes. « J’ai vu ton visage. Tu avais un sac rouge. Je le revois toutes les nuits depuis. »\n\nIl te regarde enfin, et tu vois qu’il a compris. Pas tout. Assez.\n\n« Ce jour-là, dans la montée… tu es {mort|morte}. Et pourtant, tu es là. »',
    choix: [
      { label: '« Je te pardonne. »', suivant: 'emp_vidal_pardon' },
      { label: '« Tu vas le dire aux gamins. Tout. »', suivant: 'emp_vidal_avoue' },
      { label: '« Un jour, je te ferai la même chose. »', suivant: 'emp_vidal_menace' },
    ],
  },

  emp_vidal_pardon: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Vidal te regarde comme s’il ne connaissait pas ce mot. Puis il hoche la tête, une fois, et se tourne très vite vers la cour, vers ses élèves, pour que tu ne voies pas son visage.\n\n« Ne fais pas ça », dit-il, la voix étranglée. « Ne me rends pas les choses faciles. »',
    choix: [{ label: 'Le laisser seul', effets: { flags: { vidal_confronte: true, vidal_pardonne: true } }, suivant: '#fin' }],
  },

  emp_vidal_avoue: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le soir, dans la cour du château, Vidal réunit tout le monde autour du feu. Il parle debout, les mains dans les poches, comme en classe. Il raconte le 6 septembre, la grille, le sac rouge, sa main. Il ne dit pas ce que tu es. Il dit seulement : « Cette personne-là, c’est moi qui l’ai tuée. Et elle est revenue quand même. »\n\nPersonne ne dit rien. Hugo pleure. Lou dessine.\n\nQuand il a fini, Vidal s’assoit un peu à l’écart. Pour la première fois depuis que tu le connais, il a l’air reposé.',
    choix: [{ label: 'Continuer', effets: { flags: { vidal_confronte: true, vidal_avoue: true } }, suivant: '#fin' }],
  },

  emp_vidal_menace: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: '« Je sais », dit Vidal. Il remet ses lunettes. « J’attendais que quelqu’un me dise ça. » Il te rend le téléphone. « Quand tu voudras. Mais pas devant eux. »',
    choix: [{ label: 'Partir', effets: { flags: { vidal_confronte: true, vidal_menace: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── L’HÔPITAL ───────────────────────────
  // Déclencheur : entrée dans 'hopital' si quête à 'hopital'.
  hop_entree: {
    illu: 'hopital_parvis', musique: 'tension',
    texte: 'L’hôpital de Salon a l’air d’avoir été évacué en pleine tempête. Devant les urgences, des ambulances garées en épi, portes arrière ouvertes, brancards à moitié sortis. Sur le parking, une tente militaire effondrée, sa toile verte tachée. Contre le mur, des dizaines de housses blanches alignées, que personne n’est venu chercher.\n\nAu-dessus de l’entrée des urgences, un drap est tendu entre deux fenêtres. Les lettres peintes au pinceau ont pâli au soleil :\n\nICI ON SOIGNE ENCORE.\n\nTu reconnais l’écriture serrée et penchée de Maud.',
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
    texte: 'SALLE 4 — PLÂTRES. La porte est ouverte.\n\nÀ l’intérieur, un lit d’examen à roulettes, poussé contre le mur. Aux montants, des menottes ouvertes et des sangles de cuir déchirées : on attachait quelqu’un ici. Le matelas en plastique est lacéré de longues griffures. Par terre, un seau. Au mur, une feuille de soins : P4.\n\nP4. C’est le numéro de ton bracelet. C’est ici qu’on t’a {gardé|gardée}.\n\nSur le chariot, à côté des bandes de plâtre, il y a une petite cloche de bronze à manche de bois, comme celles des instituteurs d’autrefois.\n\nTu la prends sans savoir pourquoi.',
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
    texte: 'Tu ne sais pas depuis combien de temps tu es à genoux sur le carrelage, la cloche serrée contre ta poitrine. Le son de la cloche a fait remonter un souvenir.\n\nTa bouche est pleine de salive. Tu craches, encore et encore. Le goût reste : le souvenir d’un goût salé, chaud, de cuivre, et dessous, quelque chose de gras qui colle au palais.\n\nUn homme sur un brancard. Une jambe dans une attelle. Un mot : « Jo. »\n\nTu ne sais pas qui est Jo. Mais tu sais une chose : tu as mangé l’homme qui a prononcé ce nom.',
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
    texte: 'Au bout du couloir de la morgue, sous un néon éteint, quelque chose de très grand est assis sur un chariot de linge sale, et se balance.\n\nUn mort de deux mètres. Une blouse verte de brancardier, tendue à craquer sur un torse de déménageur. Un badge : KARIM — BRANCARDAGE. Ses deux mains sont posées sagement sur ses genoux. La moitié de son visage a été mangée jusqu’à l’os.\n\nIl lève la tête. Il renifle. Il sourit, avec ce qui lui reste de bouche.\n\nIl bloque le passage vers la chambre froide.',
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
          texte: 'Ton talon heurte un seau. Le bruit roule dans le couloir comme un coup de tonnerre.\n\nKarim se lève.',
          effets: { combat: { zombies: ['colosse'] } },
          suivant: 'hop_brancardier_apres',
        },
      },
    ],
  },

  hop_brancardier_apres: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Karim est tombé en travers du couloir. Il faut l’enjamber pour passer. Couché, il paraît encore plus grand.\n\nDans la poche de sa blouse, avec un paquet de chewing-gums et une photo de mariage, il y a un badge magnétique : ACCÈS MORGUE — CHAMBRE FROIDE. C’est ce badge qui ouvre la porte de la chambre froide.',
    choix: [{ label: 'Prendre le badge de la morgue', effets: { objet: ['badge_morgue', 1] }, suivant: '#fin' }],
  },

  // Marqueur 'chambre_froide' (fermée : badge_morgue).
  hop_registre: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu entres dans la chambre froide de la morgue. Même sans électricité, il y fait plus froid qu’ailleurs : les murs épais gardent le froid. Des tiroirs en inox couvrent les murs, du sol au plafond. Certains sont entrouverts ; un pied dépasse, avec son étiquette. Sur la paillasse du fond, dans un sac de congélation fermé par un élastique, il y a un grand registre noir, un cahier de comptes comme ceux des commerçants.\n\nSur la couverture, au marqueur : PROTOCOLE — M. S. — NE PAS JETER. M. S. : Maud Sérane.',
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
    texte: 'Tu lis debout, la lampe coincée sous le menton. Le froid te monte dans les jambes sans que tu le sentes.\n\nMaud a numéroté ses patients : P1, P2, P3… Tu lis le jour où le patient P1 s’est échappé de son box et s’est jeté sur un vieil homme dans le couloir, pour le manger. Tu lis le jour où P1 s’est réveillé, quatre jours plus tard, et a demandé de l’eau. Lucide. Vivant. Dans la marge, ce jour-là, Maud a écrit en majuscules, souligné trois fois : NOURRI.\n\nPage 6, d’une écriture qui ne tremble pas, elle a noté la règle qu’elle en a tirée : pour qu’un mort revienne, il doit manger un adulte entier, dans les quarante-huit heures après sa transformation. Moins, il revient mal. Plus, ça ne sert à rien. Un mort contre un vivant : un pour un.\n\nTu cherches ta ligne. P4 — c’est toi. « Nourri le 11/09, à 3 h 10. Donneur : voir page 14. »\n\nLe « donneur », c’est la personne qu’on t’a donnée à manger.\n\nLa page 14 a été arrachée. Il n’en reste qu’une bande de papier dans la reliure.',
    choix: [
      { label: 'Chercher la page 14 dans la chambre froide', suivant: 'hop_registre_page' },
      { label: 'Refermer le registre', suivant: 'hop_registre_fin' },
    ],
  },

  hop_registre_page: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu fouilles la paillasse, les tiroirs, les poubelles. Rien. La page n’a pas été arrachée par accident, dans la panique d’un départ. Elle a été arrachée proprement, au ras de la couture, par quelqu’un qui savait exactement laquelle prendre.\n\nC’est Maud qui l’a prise.',
    choix: [{ label: 'Refermer le registre', suivant: 'hop_registre_fin' }],
  },

  hop_registre_fin: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu refermes le registre et tu le glisses dans ton sac. Il pèse bien plus lourd que du papier.\n\nEn haut de la tour, tu avais demandé à Maud : « Pourquoi est-ce que je respire ? »\n\nElle connaissait la réponse. Tu respires parce qu’on t’a fait manger quelqu’un.',
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
    texte: 'Le vestiaire du personnel. Une rangée de casiers en métal, portes cabossées, cadenas forcés. Un seul est encore fermé. Sur la porte, un sparadrap porte un nom au marqueur : ARNAUD — EFFETS — À RENDRE À LA FAMILLE. En dessous, en plus petit, souligné : M. S. Maud.\n\nC’est un petit cadenas de valise. Il cède au premier coup.',
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
    texte: 'Un blouson de travail bleu marine, avec un logo d’électricien brodé sur la poitrine. Un trousseau avec un porte-clés en forme de cigale. Une photo pliée en deux : un homme d’une cinquantaine d’années, moustache, coup de soleil, porte sur ses épaules une petite fille à qui il manque des dents. Derrière eux, une falaise jaune percée de grottes. Au dos : « Clem et moi, Calès, avril. »\n\nEt une enveloppe fermée, écrite d’une grosse écriture appliquée : POUR JO. Joëlle Arnaud, Lamanon — les grottes.\n\nJo. Le nom que l’homme de ton souvenir a prononcé.',
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
    texte: 'Sur l’étagère du haut, un sac isotherme de pharmacie, vide, avec une ordonnance agrafée : INSULINE RAPIDE ET LENTE — ARNAUD CLÉMENCE, 9 ANS. Clémence, la petite fille de la photo. Elle est diabétique.\n\nLe sac est vide. Quelqu’un a sorti l’insuline pour la mettre au frais.',
    choix: [{ label: 'Refermer le casier', suivant: '#fin' }],
  },

  // Marqueur 'frigo_pharmacie' (pharmacie centrale, sous-sol) : l'insuline de Luc.
  hop_frigo: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le grand frigo de la pharmacie de l’hôpital ne marche plus depuis longtemps. À l’intérieur, des flacons, des poches, des boîtes ramollies. Sur l’étagère du milieu, bien rangée, une boîte blanche marquée de l’écriture de Maud : ARNAUD — À RENDRE.\n\nQuatre stylos d’insuline. Ils ne seront pas périmés avant six mois. Hors du frigo, ils tiendront encore quelques semaines.',
    choix: [{ label: 'Prendre la boîte d’insuline', effets: { objet: ['insuline_luc', 1], flag: 'insuline_trouvee' }, suivant: '#fin' }],
  },

  // Marqueur 'bureau_maud' (1er étage, bureau du chef de service).
  hop_bureau: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le bureau de la cheffe des urgences : celui de Maud. Un canapé déplié, un sac de couchage, des pots de café soluble, des paquets de cigarettes vides empilés comme des briques. Sur le tableau blanc, des chiffres, des flèches, des courbes de température, et en haut, en rouge : 48 H.\n\nSur le bureau, un carnet à spirale ouvert à la première page, et une chemise cartonnée : RAPPORT CELLULE DE CRISE — 08/09 — BROUILLON.',
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
    texte: 'Tu lis le carnet. Puis tu ouvres la chemise. C’est un rapport tapé à la machine, corrigé au stylo, daté du 8 septembre. Il est adressé à la préfecture et à l’armée.\n\nMaud leur a tout dit, dès le 8 septembre. Que les morts pouvaient revenir. Comment. Et à quel prix.\n\nEt malgré ça, l’armée a décidé de tout brûler.',
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
    texte: 'Au secrétariat des urgences, les dossiers des patients sont empilés par terre en tours penchées, tachées de café et d’autre chose. Deux dossiers sont posés à part, sur le clavier d’un ordinateur éteint, comme si quelqu’un avait voulu les retrouver vite.\n\nLe premier porte ton nom. Le second : ARNAUD Luc, 51 ans.',
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
    texte: 'Luc Arnaud. Admis le 10 septembre, la jambe droite cassée, l’os sorti de la peau. Amené par deux élèves de l’Empéri.\n\nDécédé le 11 septembre, à 3 h 10.\n\n3 h 10. Tu connais cette heure. Tu l’as lue dans le registre, sur ta ligne : « P4 — nourri le 11/09, à 3 h 10. »\n\nL’homme du brancard, celui qui a dit « Jo », c’était Luc Arnaud.',
    choix: [{ label: 'Refermer le dossier', effets: { document: 'doc_dossier_luc', flag: 'dossier_luc_lu' }, suivant: '#fin' }],
  },

  // ─────────────────────────── LA CONFRONTATION ───────────────────────────
  // Déclencheur : entrée dans 'nostradamus' si quête à 'confrontation' (ou sujet « registre » avec Maud).
  ch1_confrontation: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'De retour chez Nostradamus, tu poses le registre sur le bureau, entre la sphère d’astronomie et le crâne en plâtre. Tu ne dis rien. Ce n’est pas la peine.\n\nMaud le regarde comme on regarde une radio qui confirme un diagnostic. Elle ne le touche pas. Elle allume une cigarette.\n\n« Tu l’as lu. »\n\nCe n’est pas une question.',
    choix: [
      { label: '« Tu m’as fait manger un homme. »', suivant: 'ch1_conf_homme' },
      { label: '« Un pour un. »', suivant: 'ch1_conf_un_pour_un' },
      { label: '« Qui j’ai mangé ? Qu’y a-t-il sur la page 14 ? »', suivant: 'ch1_conf_qui' },
    ],
  },

  ch1_conf_homme: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Oui. » Elle souffle la fumée. « Je t’ai fait manger un homme. Comme j’en ai fait manger un à Patrick, et un garçon à la pharmacienne qui dort dans ma cave. Et P1, mon premier patient, a mangé un vieux monsieur de quatre-vingt-un ans. Celui-là, je ne l’avais pas décidé. »\n\nElle hausse les épaules.\n\n« Quatre jours plus tard, P1 s’est réveillé, et il a demandé un verre d’eau. Il avait un fils à Montpellier, une collection de disques de jazz et un chat. Il s’est jeté du toit le lendemain. Mais il s’était réveillé. Tu comprends ? Il s’était réveillé. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_un_pour_un: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Un pour un. » Elle hoche la tête lentement, comme un prof dont l’élève a enfin trouvé. « C’est la seule règle de toute cette saloperie qui tombe juste. L’agent — la chose qui t’a {infecté|infectée} — a faim. Donne-lui un adulte entier en deux jours : il se gave, il s’endort, et il te laisse revenir. Donne-lui moins : il se réveille à moitié, et toi aussi. »\n\nElle tire sur sa cigarette.\n\n« Il y a quatre cent mille morts entre la Durance et la mer. Quatre cent mille personnes qu’on peut ramener. Chacune au prix d’une autre. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_qui: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Non. »\n\nElle le dit sans méchanceté, comme on refuse une dose de morphine de trop.\n\n« Tu veux un nom pour avoir quelqu’un à pleurer. Tu n’as pas le droit de pleurer quelqu’un que tu as mangé. C’est obscène. » Elle pose la main à plat sur sa blouse, sur la poche intérieure. « La page est ici. Elle y restera. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_2: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Ils allaient mourir », dit-elle. « Tous. Les donneurs. Je n’ai pris que des gens qui allaient mourir : une hémorragie qu’on n’arrêtait pas, une fracture ouverte sans antibiotiques, un traumatisme crânien. Ils allaient mourir dans l’heure, dans la nuit, dans la semaine. J’ai fait en sorte que leur mort serve à quelque chose. »\n\nElle soutient ton regard.\n\n« Et ce à quoi elle a servi, c’est toi. »\n\nSous vos pieds, dans la cave, quelque chose tombe. Un bruit de chaîne. Puis une voix rauque qui appelle.\n\nUne voix de femme. La pharmacienne s’est réveillée.',
    choix: [{ label: 'Descendre à la cave', suivant: 'ch1_p5' }],
  },

  ch1_p5: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Mireille',
    texte: 'Dans la cave, la femme qui dormait sous le drap s’est assise sur son lit de camp. La chaîne de vélo relie toujours sa cheville au pilier. Une quarantaine d’années, les cheveux collés, sa blouse de pharmacienne avec un badge : MIREILLE — PHARMACIE DU COURS.\n\nElle te regarde. Elle regarde Maud, qui descend derrière toi.\n\n« Où est ma fille ? » dit-elle. Sa voix est normale. Complètement normale. « Il est quelle heure ? J’ai laissé ma fille chez ma mère, il faut que j’aille la chercher avant six heures. »\n\nMaud s’arrête sur la dernière marche. Tu l’entends retenir son souffle.\n\nMireille sourit. Puis elle renifle, une fois, deux fois, le nez levé vers toi, vers Maud.\n\n« Ça sent bon, ici », dit-elle. Sa voix devient grave, et son sourire s’ouvre, s’ouvre, beaucoup trop grand. Elle redevient l’une d’eux.',
    choix: [
      { label: 'Te mettre entre elle et Maud', effets: { combat: { zombies: ['enrage'] } }, suivant: 'ch1_p5_apres' },
    ],
  },

  ch1_p5_apres: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Quand c’est fini, Maud s’agenouille près de ce qui reste de Mireille. Elle lui ferme les yeux avec deux doigts, par habitude. Puis elle sort un stylo et, tout en bas de la feuille de soins scotchée au pilier, elle écrit un seul mot, avec la date.\n\nRATÉ.\n\n« Samir », dit-elle sans se retourner. « Dix-sept ans. Un élève de Vidal, tombé du rempart de l’Empéri. Fracture du crâne. Ils me l’ont amené le 12. Il ne se serait jamais réveillé. Je l’ai donné à manger à Mireille. » Elle se relève. « Et il est mort pour rien. Ça rate deux fois sur trois. Toi, tu es la troisième fois. »',
    choix: [
      { label: '« Je garde ton secret. Pour l’instant. »', suivant: 'ch1_conf_protege' },
      { label: '« Je vais dire à Vidal ce que tu as fait de Samir. »', suivant: 'ch1_conf_denonce' },
    ],
  },

  ch1_conf_protege: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud hoche la tête, sans dire merci. Elle n’a pas l’air soulagée. Elle a l’air de quelqu’un qui vient de contracter une dette.\n\n« Pour l’instant, répète-t-elle. C’est honnête. » Elle remonte l’escalier de la cave et s’arrête à mi-hauteur. « Si l’armée voit le registre, et qu’elle te voit, toi, elle ne mettra pas le feu. Je n’ai pas fait tout ça pour que tout brûle. »\n\nTu ne réponds pas. Tu penses à la page 14, dans la poche de sa blouse, contre son cœur.',
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
    texte: 'Maud te regarde longtemps. Puis elle éteint sa cigarette dans le bénitier du musée, au pied de l’escalier.\n\n« Vas-y. Dis-lui. » Elle a un petit rire las. « Dis-lui que la docteure qui a recousu deux de ses élèves en a donné un troisième à manger. Il te croira. Il a besoin d’un monstre. Tout le monde a besoin d’un monstre : sinon, il faut se regarder dans le miroir. »\n\nElle s’assoit sur la dernière marche.\n\n« Je ne bougerai pas d’ici. Je n’ai nulle part où aller. Et quand ils viendront me chercher, je dirai tout, moi aussi. Tout ce que je sais. Sur tout le monde. »\n\nElle tapote la poche de sa blouse : la page 14.',
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
    texte: 'Tu ouvres le registre devant Vidal, à la page de Samir. Tu ne dis rien. Tu poses ton doigt sur la ligne.\n\nS. B. — 17 ANS — TRAUMA CRÂNIEN (CHUTE REMPART EMPÉRI) — DONNEUR P5 — 12/09.\n\n« Donneur P5 » : Samir a été donné à manger à la patiente numéro 5, Mireille.\n\nVidal lit. Il relit. Il retire ses lunettes et relit encore, le nez sur la page, comme s’il refusait d’y croire.\n\n« Elle m’a dit qu’il était mort sur la table d’opération. » Sa voix est calme. C’est ce qui fait peur. « Elle m’a dit qu’elle avait tout essayé. »\n\nIl referme le registre. Il appelle, sans élever la voix : « Hugo. Mehdi. Prenez les cordes. »',
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
    texte: 'Ils la trouvent là où elle avait dit qu’elle serait : assise sur la dernière marche de la cave, les mains sur les genoux. Elle tend les poignets avant qu’on le lui demande.\n\nDans la rue, entre deux élèves armés de sabres, elle marche droite. Elle ne te regarde qu’une fois. Sans colère. Avec une curiosité de médecin, comme on observe un symptôme.\n\nOn l’enferme dans la chapelle du château. Vidal ferme la porte à clé lui-même, et reste longtemps la main sur la poignée.\n\nLe soir tombe. Et du sud, de la plaine de la Crau, arrive un son que personne ici n’a jamais entendu.',
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
    texte: 'Des cloches. Des centaines de petites cloches de moutons, sourdes, désaccordées, qui tintent sans rythme, comme de la ferraille secouée dans un sac. Et dessous, plus grave, une seule cloche énorme, qui sonne toutes les dix secondes. Bong. Bong. Comme un cœur.\n\nDu rempart, tu vois arriver une marée de morts. Elle coule le long du cours Victor-Hugo, sous les platanes, d’un trottoir à l’autre, sans un trou. Des milliers. Et en tête, des silhouettes qui ne marchent pas comme les morts — droites, rapides — portent chacune une cloche au cou et une lampe à la main.\n\nLa marée tourne. Elle monte vers la vieille ville. Vers le rocher du château.\n\n« Ils viennent ici », dit Vidal. Il a l’air presque calme. « Ils savent qu’on est là. »\n\nTa bouche se remplit de salive.',
    choix: [{ label: 'Descendre dans la cour du château', suivant: 'ch1_siege_1' }],
  },

  // ─────────────────────────── LA NUIT DES SONNAILLES ───────────────────────────
  ch1_sonnailles_nos: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Le soir tombe sur la maison de Nostradamus. Maud a recouvert Mireille d’un drap propre. Vous mangez sans parler.\n\nPuis, par la fenêtre ouverte, du sud, de la plaine de la Crau, arrive un son que tu n’as jamais entendu.\n\nDes cloches. Pas celles de la Tour de l’Horloge : des centaines de petites cloches, sourdes, désaccordées, qui tintent sans rythme, comme de la ferraille secouée dans un sac. Et dessous, plus grave, une seule cloche énorme, qui sonne toutes les dix secondes. Bong. Bong. Comme un cœur.\n\nMaud s’est levée. Elle a pâli d’un coup.\n\n« Des sonnailles », dit-elle. « Les cloches qu’on met au cou des brebis. » Elle tourne vers toi un visage que tu ne lui connaissais pas. « C’est une transhumance : un troupeau qu’on déplace. Mais en septembre. Et dans le mauvais sens. »\n\nTa bouche se remplit de salive.',
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
    texte: 'Du haut de la maison, par la lucarne, tu vois arriver une marée de morts.\n\nElle coule le long du cours Victor-Hugo, sous les platanes, d’un trottoir à l’autre, sans un trou. Des milliers. Ils marchent au pas, tête basse. En tête, des silhouettes qui ne marchent pas comme les morts — droites, rapides — portent chacune une cloche au cou et une lampe à la main.\n\nLa marée ne s’arrête pas. Elle tourne. Elle monte vers la vieille ville. Vers le rocher. Vers le château.\n\n« L’Empéri », dit Maud. « Il y a trente vivants là-haut. Et ces morts le savent. » Elle attrape sa trousse. « Je viens avec toi. Il y aura des blessés. »',
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
    texte: 'Tout le château de l’Empéri est debout, de la cave aux remparts. Des torches sur le chemin de ronde. Des élèves qui courent avec des seaux, des planches, des bouteilles d’essence bouchées par un chiffon. Quelqu’un pleure dans la chapelle. Quelqu’un rit nerveusement, beaucoup trop fort.\n\nEn bas, la marée des morts a rempli la montée du Puech jusqu’au lycée. Elle ne crie pas. Elle ne gémit pas. Elle pousse. Les sonnailles tintent. Quelque part dans la foule, la grande cloche sonne toutes les dix secondes, et à chaque coup, la marée avance d’un pas.\n\nVidal est partout, un sabre de cavalerie dans une main, un talkie-walkie dans l’autre. Il te voit.\n\n« Il y a trois postes à tenir. La porte, avec moi. Les remparts, avec Lou : on jette des bouteilles enflammées et des pierres. La chapelle, avec les petits et les blessés. » Il ne te demande pas si tu restes. « Choisis. »',
    choix: [
      { label: 'Défendre la porte, avec Vidal', effets: { flags: { siege_poste: 'porte', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_porte' },
      { label: 'Défendre les remparts, avec Lou', effets: { flags: { siege_poste: 'remparts', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_remparts' },
      { label: 'Protéger la chapelle, avec les petits', effets: { flags: { siege_poste: 'chapelle', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_chapelle' },
    ],
  },

  ch1_siege_porte: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Vidal',
    texte: 'La porte du château tremble à chaque coup de la grande cloche. Les palettes craquent. La grille de chantier se tord d’un côté. Un coin se soulève, et des bras passent par l’ouverture. Puis une tête. Puis une épaule.\n\n« Ils passent à gauche ! » crie Hugo.\n\nVidal ne crie pas. Il lève son sabre et te regarde. Tu comprends qu’il compte sur toi autant que sur lui-même.',
    choix: [
      { label: 'Repousser les morts qui passent par la brèche', effets: { combat: { zombies: ['errant', 'errant', 'coureur'], lieu: 'emperi' } }, suivant: 'ch1_siege_crise' },
    ],
  },

  ch1_siege_remparts: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Lou',
    texte: 'Sur le chemin de ronde, Lou allume les chiffons au briquet et te passe les bouteilles une par une, sans trembler, comme on passe des assiettes à la vaisselle.\n\n« Vise ceux de devant, dit-elle. Pas le milieu. Si ceux de devant brûlent, ceux de derrière reculent. »\n\nEn bas, la marée lève le visage vers vous. Des centaines de visages, tous pareils, la bouche ouverte.',
    choix: [
      {
        label: 'Lancer la bouteille enflammée',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'La première bouteille éclate en plein sur les premiers rangs. Le feu court d’épaule en épaule dans les vêtements secs. La marée recule, se tord, se piétine. Ça sent le cochon grillé et le pneu brûlé. Lou te tend la bouteille suivante sans un mot. Vous en lancez onze. Le bas de la montée brûle pendant une heure.',
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
    texte: 'Dans la chapelle, sous les vieilles peintures murales, les petits sont assis en rond sur des couvertures. Quelqu’un leur lit un livre à voix haute, très fort, pour couvrir le bruit des cloches. Deux adultes blessés sont allongés sur des bancs, gris, trempés de sueur. Et Maud est là, à genoux près des bancs, les manches relevées — qu’on l’ait enfermée ici ou qu’elle soit venue d’elle-même.\n\nC’est elle qui le voit la première. Enzo, onze ans, le petit de sixième. Il tremble sous sa couverture. Il tremble trop. Il a relevé son pantalon de survêtement et regarde son mollet. Sur son mollet, il y a une marque de dents en demi-lune.\n\n« Pendant la corvée d’eau », dit-il. « J’ai rien dit. J’avais peur que Vidal… » Il claque des dents. « J’ai froid. »\n\nEnzo a été mordu. Il va se transformer.',
    choix: [{ label: 'Regarder Maud', suivant: 'ch1_siege_chapelle_2' }],
  },

  ch1_siege_chapelle_2: {
    illu: 'emperi_siege', musique: 'tension', orateur: 'Maud',
    texte: 'Maud s’approche de toi et parle très bas, pour que les petits n’entendent pas.\n\n« Il lui reste une heure. Peut-être moins. » Elle jette un regard vers les deux adultes allongés sur les bancs. « Et celui de gauche ne passera pas la nuit. Une infection du ventre. »\n\nElle ne finit pas sa phrase. Ce n’est pas nécessaire. Tu vois l’idée passer dans ses yeux : un mourant, un mordu. Un pour un.\n\nPuis elle secoue violemment la tête, comme pour chasser une guêpe.\n\n« Non. Il faut quarante-huit heures, des chaînes, un endroit sûr. On n’a rien de tout ça ce soir. » Elle retourne près d’Enzo, s’assoit à côté de lui et lui prend la main. « Occupe-toi des petits. Quand il se transformera, je te ferai signe. »',
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
    texte: 'Après, les petits ne pleurent pas. C’est le pire. Ils regardent le livre tombé par terre, ouvert à la page d’un lapin qui cherche sa maison.\n\nMaud se lave les mains dans le bénitier. Longtemps. Elle frotte encore quand l’eau est déjà propre.',
    choix: [{ label: 'Sortir', suivant: 'ch1_siege_crise' }],
  },

  ch1_siege_crise: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Vers trois heures du matin, la marée trouve un point faible.\n\nPas la grande porte : la poterne, une petite porte de service en bas du château, du côté du lycée. Au crépuscule, une équipe est sortie par là pour remplir des bidons à la fontaine. Quatre élèves et une brouette. Ils ne sont pas rentrés. Les voilà maintenant en bas de la poterne, collés contre la grille, avec la marée qui monte la ruelle derrière eux.\n\nVidal est déjà dans l’escalier. Tu le suis. Il lève la grille, tire le premier élève à l’intérieur, puis le deuxième…\n\nLa marée arrive.\n\nVidal sort, lui, dans la ruelle, le sabre levé. Il se met entre la marée et les deux derniers élèves, et il frappe.\n\n« LA GRILLE ! » hurle-t-il sans se retourner. « FERME-LA QUAND ILS SONT DEDANS ! »\n\nLe troisième élève passe. Le quatrième trébuche sur un bidon.\n\nLa manivelle de la grille est dans ta main. Si tu fermes maintenant, Vidal et le dernier élève restent dehors. Décide vite.',
    timerMs: 8000,
    timeout: {
      texte: 'Tu n’as pas choisi. La marée a choisi pour toi : le quatrième élève passe, Vidal recule, et des morts entrent avec lui, trois, quatre, accrochés à ses jambes.',
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
    texte: 'Tu tournes la manivelle.\n\nLa grille descend. Vidal l’entend. Il ne se retourne pas. Le quatrième élève — il s’appelait Théo, tu l’apprendras au matin — se relève et se jette vers la grille. Ses doigts passent entre les barreaux au moment où elle touche le sol.\n\nVidal recule jusqu’à lui, dos à la grille. Il frappe, il frappe, et la marée se referme sur eux comme une main.\n\nVidal ne crie pas. C’est Théo qui crie. Longtemps.\n\nTu tiens la manivelle jusqu’à ce que tes paumes saignent. Tu penses à une vidéo de quarante et une secondes. Tu ne sais pas si c’est de la justice. Tu sais que c’est le même geste que le sien, le 6 septembre.',
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
    texte: 'Tu attends. Une seconde. Deux. Théo se relève, se jette vers la grille et passe. Vidal recule, frappe, recule encore…\n\n« MAINTENANT ! »\n\nTrop tard. Des morts passent la grille avec lui. Trois, quatre, accrochés à ses jambes.',
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
          texte: 'Tu attrapes Théo par le col et tu le jettes à l’intérieur comme un sac. Vidal recule avec toi, pas à pas, en faisant tournoyer son sabre. La grille tombe juste devant vous. Vous êtes dedans, tous les deux, adossés au mur, à reprendre votre souffle.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', xp: { force: 15 } },
          suivant: 'ch1_siege_vidal',
        },
        echec: {
          texte: 'Tu attrapes Théo, mais une main t’attrape, toi, par l’épaule. Des ongles te déchirent le dos jusqu’à l’omoplate. Vidal frappe par-dessus ton épaule, une fois, deux fois. Vous passez la grille tous les trois, emmêlés. Elle tombe derrière vous.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', blessure: { type: 'entaille', zone: "à l'épaule" }, pv: -10 },
          suivant: 'ch1_siege_vidal',
        },
      },
    ],
  },

  ch1_siege_vidal: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'La grille est fermée. Les morts qui sont entrés sont à terre. Théo est vivant ; à genoux, il vomit dans l’escalier.\n\nVidal est assis contre le mur de la poterne, le sabre en travers des genoux. Il a relevé la manche de son pull bleu. Sur son avant-bras, une morsure. Nette, profonde. Elle saigne à peine.\n\nIl la regarde avec un intérêt presque professionnel. Puis il te regarde.\n\n« Tu fais une drôle de tête. Pas celle de quelqu’un qui a peur que je me transforme. Celle de quelqu’un qui sait. » Il a un sourire épuisé. « Alors dis-moi. Qu’est-ce qui m’attend ? »',
    choix: [
      { label: '« Tu vas mourir. Et te relever. »', suivant: 'ch1_vidal_simple' },
      { label: '« On peut revenir, mais il faut manger quelqu’un. »', si: { flag: 'registre_trouve' }, suivant: 'ch1_vidal_un_pour_un' },
    ],
  },

  ch1_vidal_simple: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: '« Tu vas mourir. Puis ton corps va se relever, et il reviendra tous les jours devant cette poterne, parce qu’ils retournent tous quelque part. »\n\nVidal hoche la tête. « Je sais où je reviendrai. » Il lève les yeux vers le haut de l’escalier : les têtes des élèves sont penchées au-dessus de la rampe. « Je ne veux pas qu’ils me voient revenir. »\n\nIl te tend le sabre, poignée en avant.\n\n« Achève-moi, proprement. Et après, emmène-les. Emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme celle-là. »',
    choix: [
      { label: 'Prendre le sabre', suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_un_pour_un: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu lui dis tout. La housse, le registre, la règle : un mort qui mange un adulte entier dans les quarante-huit heures peut revenir. Tu lui dis que tu as mangé un homme, et que c’est pour ça que tu es là.\n\nVidal écoute jusqu’au bout, comme on écoute un exposé. Il ne t’interrompt pas.\n\nPuis il lève les yeux vers le haut de l’escalier, vers les têtes des élèves penchées au-dessus de la rampe.\n\n« Lequel ? » demande-t-il doucement. « Lequel tu me donnerais à manger ? »\n\nIl rit. Il tousse. La fièvre monte déjà : tu la vois dans ses yeux.\n\n« Non. Personne ne mangera personne pour moi. » Il te tend le sabre, poignée en avant. « Achève-moi, proprement. Et après, emmène-les. Emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme celle-là. »',
    choix: [
      { label: 'Prendre le sabre', effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_fin: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Il ferme les yeux et récite quelque chose à mi-voix. D’abord, tu crois que c’est une prière. C’est une date : « Onze juin 1909, vingt et une heures dix. » Le soir du tremblement de terre. Il la répète comme une leçon, et tu comprends que c’est la dernière chose qu’il veut avoir en tête : un tremblement de terre, et des murs qui tiennent.\n\nTu le fais proprement. C’est ce qu’il avait demandé.',
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
    texte: 'Lou descend l’escalier. Elle a tout entendu. Elle ne pleure pas. Elle s’accroupit devant Vidal et lui prend doucement le sabre des mains, comme on retire ses lunettes à quelqu’un qui s’est endormi en lisant.\n\n« Vous m’avez toujours dit de finir ce que je commençais », dit-elle.\n\nVidal rit. Il lui touche la joue du dos de la main. « Pas sur ce ton, Mercadier. »\n\nTu remontes l’escalier. Tu ne regardes pas. Tu entends.',
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
    texte: 'L’aube arrive à l’est, grise et sale, et avec elle le silence.\n\nLa marée des morts a quitté la montée du Puech. Elle a laissé des corps — des morts et des nôtres — et des traînées sombres sur les pavés. Elle s’en va.',
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
    texte: 'Du haut du rempart, tu vois la marée des morts s’étirer vers le nord, sur la route d’Avignon. Une rivière de dos courbés, sans fin, jusqu’au rond-point, jusqu’aux champs, jusqu’à l’horizon. En passant, elle a emmené tous les morts de Salon. En bas, les rues de la vieille ville sont vides comme tu ne les as jamais vues.\n\nEn tête, très loin, deux silhouettes marchent côte à côte. Un vieil homme habillé en berger — grand bâton, chapeau, cape de laine — avec deux chiens qui tournent autour de lui. Et une petite femme, courbée sous le poids d’une cloche énorme qu’elle serre à deux mains contre sa poitrine, comme un enfant.\n\nBong. Toutes les dix secondes. Tous les morts de Salon se sont levés, et ils la suivent.',
    choix: [{ label: 'Redescendre', suivant: 'ch1_aube_radio' }],
  },

  ch1_aube_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'La radio',
    texte: 'Dans la tour d’angle, la radio grésille toute seule. Lou est assise devant, les genoux sous le menton. Elle monte le son quand tu entres.\n\nUne voix de femme. Pas celle de l’armée : une voix d’ici, avec l’accent, rauque d’avoir trop parlé.\n\n« …ici les grottes de Calès, au-dessus de Lamanon. On est quarante-trois. On a de l’eau, des murs et de la place. On prend les enfants. On prend tous ceux qui ne sont pas mordus. Si vous entendez ce message, venez par les collines, pas par la route : la route est à eux, maintenant. On écoute à chaque heure pile. Ici Jo, aux grottes de Calès… »\n\nJo. Le nom que Luc a prononcé avant que tu le manges.\n\nTu ne bouges plus. Lou te regarde bizarrement.\n\n« Quoi ? Tu la connais ? »',
    choix: [
      { label: '« Non. »', suivant: 'ch1_depart' },
      { label: '« J’ai une lettre pour elle. »', si: { objet: 'lettre_luc' }, suivant: 'ch1_aube_lettre' },
    ],
  },

  ch1_aube_lettre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: '« Une lettre ? » Lou fronce les sourcils. « De qui ?\n\n— D’un homme qui est mort. »\n\nElle te regarde longtemps, avec ses yeux de dessinatrice qui voient ce qu’on cache. Elle ne pose pas d’autre question. Elle se lève.\n\n« Alors on va à Calès. »',
    choix: [{ label: 'Continuer', suivant: 'ch1_depart' }],
  },

  ch1_depart: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'Vous partez à midi. Personne ne dit qu’on abandonne le château, mais tout le monde le sait. Le château ne tiendrait pas une deuxième nuit. Les grands portent les petits, les bidons, les couvertures, les sabres du musée. On enterre les morts de la nuit dans le Jardin des Simples, le jardin de plantes médicinales du château, parce que c’est là que la terre est la plus meuble.',
    choix: [
      { label: 'Regarder Maud', si: { flag: 'maud_captive' }, suivant: 'ch1_depart_captive' },
      { label: 'Regarder Maud', si: { flag: 'maud_protegee' }, suivant: 'ch1_depart_libre' },
    ],
  },

  ch1_depart_captive: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud marche au milieu de la file, les poignets attachés par une corde que tient Hugo. Les élèves ont décidé qu’elle serait jugée « par des adultes, là-bas ». Personne ne sait ce que ça veut dire. Tout le monde est soulagé de ne pas avoir à décider ce matin.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Tu as bien fait, tu sais », dit-elle. « C’est ce que j’aurais fait à ta place. » Un temps. « C’est bien ça, le problème. »',
    choix: [{ label: 'Partir vers le nord', suivant: 'ch1_fin' }],
  },

  ch1_depart_libre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Maud',
    texte: 'Maud marche en queue de file, sa trousse à l’épaule. À chaque halte, elle recoud les blessures de la nuit. Les élèves l’appellent « docteure », comme avant. Deux d’entre eux lui tiennent la main. Elle se laisse faire.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Merci », dit-elle. Puis, plus bas : « Ne me le fais pas regretter. Je ne te le ferai pas regretter non plus. »',
    choix: [{ label: 'Partir vers le nord', effets: { flag: 'maud_medecin' }, suivant: 'ch1_fin' }],
  },

  ch1_fin: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'Une vingtaine de survivants quittent l’Empéri par la poterne, en file. Ils descendent vers le nord par les jardins, entre les murets et les oliviers, loin de la route.\n\nTu te retournes une fois. Au-dessus des toits vides, le cadran de la Tour de l’Horloge marque toujours neuf heures dix.\n\n— FIN DU CHAPITRE 1 —',
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
    texte: 'Le groupe passera par les collines, en file, lentement, à cause des petits. Toi, tu prendras les chemins, plus vite. Vous vous retrouverez aux grottes de Calès.',
    choix: [
      {
        label: 'Ouvrir la carte pour rejoindre Calès',
        effets: { quete: ['q_traversee', 'cales'] },
        suivant: '#fin',
      },
    ],
  },
};
