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
    texte: 'Le matin entre par une fenêtre haute, en biais, avec la poussière. Maud est déjà debout — ou pas encore couchée — dans le cabinet reconstitué du premier étage, assise au bureau de Nostradamus entre la sphère armillaire et le crâne en plâtre. Devant elle, un scanner radio branché sur une batterie de voiture chuchote des chiffres.\n\nElle pousse vers toi une boîte de raviolis ouverte, froide, une cuillère plantée dedans.\n\n« Mange. Et écoute, parce que je ne répéterai pas : j’ai trop de choses à dire et plus assez de voix. »',
    choix: [
      {
        label: 'Manger, et écouter',
        effets: { faim: 30, flag: 'ch1_matin_fait', quete: ['q_protocole', 'debut'] },
        suivant: 'ch1_matin_2',
      },
    ],
  },

  ch1_matin_2: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Le 2 septembre, un mercredi, jour de marché, à dix heures quarante, une femme a mordu son mari devant l’étal du fromager, cours Carnot. À midi, j’avais quarante morsures aux urgences. Le soir, trois cents, et une partie de mes infirmières. » Elle tapote le scanner. « Au bout de trois jours, l’armée s’est repliée derrière la Durance. Tout ce qui est au sud du fleuve, de la Crau à Marseille, c’est la zone. Rien n’en sort. »\n\nElle monte le son. Une voix de femme, nette, lasse, en boucle :\n\n« …ici le PC Durance. La zone d’exclusion sanitaire est maintenue. Tout franchissement de la Durance est interdit. Toute personne s’approchant de la ligne sera neutralisée… »\n\n« Ça, c’est ce qu’elle dit en clair. » Maud baisse le son. « En chiffré, c’est plus intéressant. »',
    choix: [{ label: '« Qu’est-ce qu’elle dit, en chiffré ? »', suivant: 'ch1_matin_cautere' }],
  },

  ch1_matin_cautere: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Mon scanner n’a pas les clés. Mais il y a des mots qui passent en clair, parce qu’un opérateur est fatigué. » Elle retourne un carnet vers toi. Trois lignes, soulignées deux fois.\n\nCAUTÈRE.\nPREMIER ÉPISODE DE MISTRAL.\nLIGNE DURANCE — MISE À FEU.\n\n« Un cautère, c’est un fer rouge. On brûle la plaie pour qu’elle arrête de saigner. » Elle referme le carnet. « Ils attendent le vent. Au premier mistral, ils allument la Durance, et le vent pousse le feu jusqu’à la mer. Les garrigues, les pinèdes, la Crau, les villages. Les morts. Et nous, par la même occasion. »\n\nDehors, les platanes du cours bougent à peine. Pas un souffle.',
    choix: [
      { label: '« Il faut prévenir les vivants. »', suivant: 'ch1_matin_plan' },
      { label: '« Et moi, dans tout ça ? »', suivant: 'ch1_matin_plan' },
    ],
  },

  ch1_matin_plan: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Les vivants ? Il y en a une trentaine à l’Empéri. Un prof du lycée et ses élèves, qui se sont enfermés dans le château le premier jour et qui n’en sont jamais ressortis. » Maud allume une cigarette, cette fois pour de vrai. « Ils ont une radio militaire, prise sur une patrouille morte. Avec ça, je peux parler à Orsini — la commandante du PC Durance. Je l’ai connue à la cellule de crise, les trois premiers jours. Elle m’écoutera. »\n\nElle te désigne du menton, de haut en bas.\n\n« Et toi, tu es la raison pour laquelle elle m’écoutera. Un mort qui parle. Si l’armée sait que les morts peuvent revenir, elle n’allume pas la Durance. On ne brûle pas des patients. » Elle souffle la fumée. « S’ils veulent des preuves, mon registre est resté à l’hôpital. On verra ça après. »\n\nElle écrase la cigarette à peine entamée.\n\n« Monte à l’Empéri. Demande la radio à Vidal, le prof. Et avant, on va s’occuper de ton bras. Là-haut, ils regardent les bras. »',
    choix: [
      {
        label: 'Continuer',
        effets: {
          quete: ['q_protocole', 'emperi'], decouvrir: ['emperi', 'hopital'],
          journal: 'Maud : l’armée tient la Durance et attend le premier mistral pour tout brûler (« Cautère »). Elle veut une radio pour parler à la commandante Orsini, et me montrer comme preuve. La radio est à l’Empéri, chez un prof, Vidal.',
        },
        suivant: 'nos_bras',
      },
    ],
  },

  nos_bras: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« À l’Empéri, ils ont une règle, une seule : on montre ses bras à la porte. Une morsure, même vieille, même refermée, et c’est une balle, ou un coup de sabre, selon qui est de garde. »\n\nMaud descend jusqu’à la cuisine reconstituée du musée. Dans la grande cheminée, des braises. Dedans, un fer long à manche de bois dont le bout rougeoie.\n\n« Un cautère. Un vrai, du seizième, prêté par le musée de l’Empéri pour l’exposition sur la peste. Il n’avait pas servi depuis quatre cents ans. » Elle le retourne dans les braises. « Une brûlure, ça cache une morsure. Une brûlure, ça s’explique : une casserole, un incendie. Ça fait très mal, et ça dure trois secondes. »\n\nElle ne te pousse pas. Elle attend. Elle a l’habitude qu’on dise non.',
    choix: [
      { label: 'Poser ton bras sur la table', suivant: 'nos_cautere' },
      { label: 'Cacher la morsure sous un bandage', suivant: 'nos_bandage' },
      { label: 'Garder ton bras tel qu’il est', suivant: 'nos_bras_nu' },
    ],
  },

  nos_cautere: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Tu poses l’avant-bras à plat sur la table de chêne. Maud te glisse une cuillère en bois entre les dents. « Mords. Ça, tu sais faire. »\n\nLe fer arrive.\n\nCe n’est pas une douleur, d’abord. C’est un bruit : un grésillement de poêle, gras, joyeux, obscène. Puis l’odeur — ta propre viande, qui sent le dimanche, le barbecue, la côte de porc. Puis la douleur, qui entre par le coude et remonte jusqu’aux yeux, et tes dents s’enfoncent dans la cuillère jusqu’à la fendre.\n\nTrois secondes. Maud avait raison. Les trois secondes les plus longues de ta vie — de tes deux vies.\n\nQuand elle retire le fer, le croissant de dents a disparu. À sa place, une plaie luisante, rouge et blanche, qui ne ressemble à rien, sauf à un accident.\n\n« Voilà », dit-elle en l’enveloppant de gaze grasse. « Tu t’es {brûlé|brûlée} en faisant chauffer de l’eau. Répète. »',
    choix: [
      {
        label: '« Je me suis {brûlé|brûlée} en faisant chauffer de l’eau. »',
        effets: {
          flags: { cicatrice_brulee: true, bras_decide: true },
          blessure: { type: 'brulure', zone: "à l'avant-bras" },
          pv: -12,
          journal: 'Maud a effacé la morsure au fer rouge. Si on demande : de l’eau bouillante.',
        },
        suivant: 'nos_bras_fin',
      },
    ],
  },

  nos_bandage: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud hausse les épaules et retire le fer des braises. Elle te tend une bande de crêpe, serrée, trois tours de sparadrap.\n\n« Si on te demande : une entaille, un éclat de vitre, des points de suture que tu t’es faits toi-même. Si on veut défaire le pansement, tu refuses, ça se rouvre. » Elle serre le dernier tour un peu plus fort que nécessaire. « Et si on insiste, cours. »',
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
    texte: '« Comme tu veux. » Elle retire le fer des braises et le pose sur la pierre, où il continue de rougir pour personne. « Alors ne mens pas à moitié. Si tu montres ce bras, dis-leur que tu es {immunisé|immunisée}. C’est un mensonge qu’ils ont envie de croire. »',
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
    texte: '« Va. Le château est à trois cents mètres, en haut de la montée du Puech. Tu ne peux pas le rater : c’est la seule chose de Salon qui soit encore debout et qui ait envie de le rester. »\n\nElle retourne à son scanner. Sans se retourner :\n\n« Et ne descends pas à la cave. »',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  // Marqueur 'cave_patiente' (cave voûtée de la maison) : Mireille, P5, en dormance.
  nos_cave: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'La cave voûtée sent la pierre mouillée et le désinfectant. Des tonneaux de décor, une lanterne de musée. Et, sur un lit de camp, sous un drap, une forme.\n\nUne chaîne de vélo court du pied du lit de camp jusqu’à un pilier. Sous le drap, une cheville, grise. Tu soulèves le bord.\n\nUne femme, la quarantaine, en blouse blanche de pharmacienne. Les yeux fermés. Les lèvres bleues. Elle ne respire pas. Tu poses deux doigts sur son cou et tu attends, longtemps, et au bout d’une éternité, sous tes doigts, quelque chose bat. Une fois.\n\nScotchée au pilier, une feuille de soins, couverte de l’écriture de Maud.',
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
    texte: 'P5. Mireille A. Pharmacienne, cours Carnot. Et une colonne de températures qui remonte, jour après jour, d’un demi-degré.\n\nComme la tienne a dû remonter.\n\nTu rabats le drap. Tu remontes l’escalier sans faire de bruit, et tu as l’impression, tout du long, que quelqu’un te regarde dans le dos avec des yeux fermés.',
    choix: [{ label: 'Remonter', suivant: '#fin' }],
  },

  // ─────────────────────────── L’EMPÉRI ───────────────────────────
  // Déclencheur : entrée dans 'emperi' si quête q_protocole à 'emperi' et pas 'emp_arrivee_faite'.
  emp_arrivee: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'La montée du Puech grimpe raide entre deux murs, pavée de galets polis par des siècles de semelles. À gauche, les grilles du lycée de l’Empéri, un banc renversé, une banderole de rentrée — BIENVENUE AUX SECONDES — qui pend d’un seul coin. Au-dessus, le château : des murs de huit mètres, des tours carrées, une pierre couleur de pain brûlé.\n\nLa porte est fermée par une grille de chantier doublée de palettes. Derrière, deux visages. Des gamins. Quinze ans, seize. Un casque de vélo. Un casque de cuirassier du Premier Empire, avec sa crinière noire. Et deux sabres de musée, dégainés, qui tremblent un peu.\n\n« Stop. Pas un pas de plus. » La voix mue encore. « Montre tes bras. Les deux. Remonte les manches jusqu’aux épaules. »',
    choix: [
      { label: 'Montrer ton bras brûlé', si: { flag: 'cicatrice_brulee' }, suivant: 'emp_insp_brulure' },
      { label: 'Montrer le bandage', si: { flag: 'bras_bande' }, suivant: 'emp_insp_bandage' },
      { label: 'Montrer ton bras, et la morsure', si: { flag: 'bras_nu' }, suivant: 'emp_insp_morsure' },
      { label: 'Montrer ton bras', si: { pasFlag: 'bras_decide' }, suivant: 'emp_insp_morsure' },
      { label: 'Redescendre', suivant: '#fin' },
    ],
  },

  emp_insp_brulure: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'Tu remontes tes manches. Le bras droit : rien. Le gauche : la gaze, que tu défais toi-même. La brûlure est laide, luisante, cloquée sur les bords.\n\nLe gamin au casque de cuirassier se penche à travers la grille et fait la grimace. « C’est quoi, ça ?\n\n— De l’eau bouillante.\n\n— Ça date de quand ?\n\n— D’hier. »\n\nIl te regarde longtemps. Derrière lui, un homme approche. Grand, maigre, une barbe de trois semaines, des lunettes réparées au sparadrap, un pull de laine bleue trop chaud pour la saison. Il regarde la brûlure, puis tes yeux, puis la brûlure.\n\n« Ça a dû faire mal », dit-il simplement. Il fait un signe. « Ouvrez. »',
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
    texte: '« Et ça ? » Le gamin pointe son sabre vers ton avant-bras gauche.\n\n« Une entaille. Un éclat de vitre.\n\n— Enlève.\n\n— Si j’enlève, ça se rouvre. »',
    choix: [
      {
        label: 'Tenir ton mensonge',
        test: { chance: 0.55 },
        reussite: {
          texte: 'Le gamin hésite. Derrière lui, un homme grand et maigre, en pull de laine bleue, des lunettes réparées au sparadrap, pose une main sur son épaule.\n\n« Laisse, Hugo. Une vitre, c’est une vitre. » Il te regarde droit dans les yeux, une seconde de trop. « Ouvrez. »',
          effets: { flags: { emp_arrivee_faite: true, emp_entree_ok: true, emp_statut: 'normal' } },
          suivant: 'emp_vidal_1',
        },
        echec: {
          texte: 'Hugo passe la pointe de son sabre sous la bande, entre deux barreaux, et tranche d’un coup sec. Le crêpe tombe. Il n’y a pas d’entaille dessous.',
          suivant: 'emp_insp_morsure_vue',
        },
      },
      { label: 'Défaire le bandage', suivant: 'emp_insp_morsure_vue' },
    ],
  },

  emp_insp_morsure: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'Tu remontes tes manches. La morsure est là, en plein jour : un croissant de dents rose et luisant sur la peau de ton avant-bras.\n\nLes deux sabres se lèvent en même temps.',
    choix: [{ label: 'Ne pas bouger', suivant: 'emp_insp_morsure_vue' }],
  },

  emp_insp_morsure_vue: {
    illu: 'montee_puech', musique: 'tension',
    texte: '« MORSURE ! »\n\nLe cri ricoche sur les murs. Des pas, des portes, des voix. En dix secondes, il y a six gamins sur le rempart au-dessus de la porte, et une arbalète de fortune braquée sur ton front.\n\nUn homme au pull bleu arrive en courant et s’arrête net. Il regarde ton bras. Longtemps. Il ne dit rien pendant si longtemps que le gamin à l’arbalète demande : « Monsieur ? On tire ? »\n\n« Elle est cicatrisée », dit l’homme. « Une morsure cicatrisée. » Il ôte ses lunettes, les essuie sur son pull, les remet. « Ça n’existe pas. »',
    choix: [
      { label: '« Je suis {immunisé|immunisée}. »', suivant: 'emp_immunise' },
      { label: '« Mon cœur s’est arrêté. Il est reparti. »', suivant: 'emp_verite' },
      { label: 'Reculer lentement', suivant: 'emp_recul' },
    ],
  },

  emp_immunise: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le mot tombe dans le silence comme une pièce dans un puits. Là-haut, sur le rempart, tu vois les visages changer. Tu vois l’envie de te croire monter dans leurs yeux comme de l’eau dans un verre.\n\n« {Immunisé|Immunisée} », répète l’homme, pour lui-même, comme on essaie un mot étranger. Il ne te croit pas. Il ne te croit pas non plus le contraire. Il est prof : il a appris à suspendre son jugement jusqu’à la dernière ligne de la copie.\n\n« Julien Vidal. Je m’occupe d’eux. » Un geste vers les murs, vers les gamins. « Tu dormiras dans la chapelle, porte fermée à clé, et quelqu’un te regardera respirer toute la nuit. Si ça ne te va pas, tu redescends. »',
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
    texte: 'Tu le dis. Tu dis la housse, l’étiquette, le cimetière, la tour. Tu le dis mal, dans le désordre, et ça sonne exactement comme ce que c’est : de la folie.\n\nPersonne ne rit. C’est pire.\n\n« Descends », dit Vidal, très doucement, comme on parle à quelqu’un au bord d’un toit. « Descends la montée, et ne reviens pas. Si tu reviens, ils tirent. »\n\nTu fais demi-tour. Tu as fait dix pas quand sa voix te rattrape, plus basse, cassée.\n\n« Attends. » Un silence. « Il me manque deux élèves. Lou et Nathan. Partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent. Pas revenus. » Tu l’entends avaler sa salive. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre. »',
    choix: [
      {
        label: '« Je te les ramène. »',
        effets: {
          flags: { emp_arrivee_faite: true, emp_statut: 'rejete' },
          quete: ['q_protocole', 'saint_laurent'], decouvrir: ['saint_laurent'],
          journal: 'L’Empéri m’a refermé sa porte au nez. Vidal, le prof, m’ouvrira si je ramène deux de ses élèves, Lou et Nathan, partis à la collégiale Saint-Laurent.',
        },
        suivant: '#fin',
      },
    ],
  },

  emp_recul: {
    illu: 'montee_puech', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu recules d’un pas, les mains ouvertes. Puis d’un autre. L’arbalète te suit.\n\n« Attends », dit l’homme au pull bleu. Il a l’air de se détester de dire ce qu’il va dire. « Il me manque deux élèves. Lou et Nathan. Partis hier à l’aube chercher des cierges à la collégiale Saint-Laurent. Pas revenus. » Il remonte ses lunettes. « Je ne sais pas ce que tu es. Mais si tu me les ramènes, je t’ouvre. »',
    choix: [
      {
        label: '« Je te les ramène. »',
        effets: {
          flags: { emp_arrivee_faite: true, emp_statut: 'rejete' },
          quete: ['q_protocole', 'saint_laurent'], decouvrir: ['saint_laurent'],
          journal: 'L’Empéri m’a refermé sa porte au nez. Vidal m’ouvrira si je ramène Lou et Nathan, partis à la collégiale Saint-Laurent.',
        },
        suivant: '#fin',
      },
    ],
  },

  emp_vidal_1: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Dans la cour d’honneur, sous la galerie Renaissance, du linge sèche sur une corde tendue entre deux colonnes. Une marmite fume sur un feu de palettes. Et des gamins. Vingt, vingt-cinq. Des secondes, des terminales, un petit de sixième qui n’a rien à faire là et qu’on a gardé quand même. Ils te regardent comme on regarde un animal au zoo : de loin, avec un peu de pitié et beaucoup d’envie de voir ce qu’il va faire.\n\nL’homme au pull bleu te fait asseoir sur une marche.\n\n« Julien Vidal. Histoire-géographie. Dix-neuf élèves, six adultes, dont deux qui ne se lèvent plus. On tient parce que les murs tiennent. En 1909, le tremblement de terre a fendu la ville, et ces murs-là n’ont pas bougé. » Il dit ça comme un cours. C’est comme ça qu’il tient, lui. « Qu’est-ce que tu veux ? »',
    choix: [{ label: '« La radio. Pour Maud Sérane. »', suivant: 'emp_vidal_radio' }],
  },

  emp_vidal_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Sérane. » Le nom lui fait quelque chose, une ombre sur le visage, vite rangée. « La docteure. Elle nous a recousu deux gamins, au début. On lui en a amené d’autres, après. Certains ne sont pas revenus. » Il ôte ses lunettes. « On ne ramène pas tout le monde de la guerre. »\n\nIl regarde vers la tour d’angle, où une antenne pend au bout d’un bâton de ski.\n\n« La radio, c’est ma seule ligne vers dehors. Je ne la prête pas. » Il remet ses lunettes. « Mais j’ai un problème, et tu as des jambes. Lou et Nathan. Partis hier à l’aube chercher des cierges et du vin de messe à la collégiale Saint-Laurent — pour la lumière, et pour désinfecter. Ils devaient être rentrés à midi. »\n\nSa voix ne tremble pas. Ce sont ses mains.\n\n« Ramène-les-moi, et la radio est à toi pour une heure. »',
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
    texte: 'La collégiale Saint-Laurent se dresse au bout du square, trop haute pour la place qu’on lui a laissée, avec ses contreforts comme des côtes et son clocher octogonal. Sur le parvis, un vélo couché, un sac de sport ouvert, vide. Et un chien.\n\nUn petit bâtard roux, attaché à la grille du square par une laisse de corde. Maigre à faire peur. Il ne jappe pas. Il remue la queue, une fois, sans conviction, comme on s’excuse.\n\nSur le lourd portail de bois, quelqu’un a écrit à la craie, en lettres rondes : ON EST DEDANS. L + N. 7 H.',
    choix: [
      { label: 'Détacher le chien', suivant: 'stl_chien' },
      { label: 'Entrer', suivant: '#fin' },
    ],
  },

  stl_chien: {
    illu: 'collegiale_nef', musique: null,
    texte: 'Tu dénoues la corde. Le chien ne s’enfuit pas. Il boit dans ta main ce qui reste de ta gourde, sans lever les yeux, puis il s’assoit devant le portail, face aux battants fermés, et il attend.\n\nSur son collier, une médaille en forme d’os : PISTACHE. Et un numéro de téléphone que plus personne n’appellera.',
    choix: [{ label: 'Entrer', effets: { flag: 'pistache_libre' }, suivant: '#fin' }],
  },

  // Déclencheur (zone) : entrée dans la nef.
  stl_nef: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Le froid d’abord. Puis l’odeur de cire. Puis eux.\n\nLa nef est pleine. Quarante, cinquante silhouettes debout entre les bancs, tournées vers l’autel, immobiles, épaule contre épaule, comme une assemblée qui attend que la messe commence. Des gens du quartier, en vêtements de tous les jours. Une femme en blouse de caissière. Un adolescent, un casque de scooter à la main. Ils sont venus se réfugier ici le premier dimanche. Ils y sont restés.\n\nAu fond, sous la voûte, un prêtre en aube blanche tachée se tient derrière l’autel. Il agite une clochette dorée. Ding. Ding. Ding. Sans s’arrêter, avec la régularité d’un métronome, comme s’il attendait qu’on lui réponde.\n\nToutes les têtes suivent le son. Aucune ne se tourne vers toi. Pour l’instant, la clochette parle plus fort que tes pas.',
    choix: [
      {
        label: 'Avancer, sans un bruit',
        effets: { journal: 'La collégiale Saint-Laurent est pleine de morts debout, tournés vers l’autel. Un prêtre mort agite sa clochette. Tant qu’elle sonne, ils ne m’entendent pas.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'cure_autel' : voler la clé de la sacristie à la ceinture du prêtre.
  stl_cure: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Le prêtre est tout près. Tu vois les veines noires sous la peau de ses mains, la mâchoire qui travaille à vide, l’anneau de la clochette passé à son index. À sa ceinture de corde, un trousseau : trois clés de fer, dont une longue, ouvragée, avec une étiquette de carton : SACRISTIE.\n\nDing. Ding. Ding.\n\nSi la clochette s’arrête, tout le monde se retournera.',
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
          texte: 'Les clés s’entrechoquent. Un petit bruit de ferraille, rien du tout.\n\nLa clochette s’arrête.\n\nLe prêtre baisse les yeux vers toi. Derrière toi, cinquante têtes pivotent ensemble, dans un froissement de tissu, comme une foule qui se lève à la fin d’un office.',
          effets: { objet: ['cle_sacristie', 1], combat: { zombies: ['errant'] } },
          suivant: 'stl_cure_apres',
        },
      },
      { label: 'Renoncer pour l’instant', suivant: '#fin' },
    ],
  },

  stl_cure_apres: {
    illu: 'collegiale_nef', musique: 'tension',
    texte: 'Le prêtre est à terre, la clochette dans la main. Il n’y a plus de ding.\n\nEt la nef s’est mise en marche.',
    choix: [{ label: 'Courir', effets: { bruit: 3 }, suivant: '#fin' }],
  },

  // Marqueur 'tombeau_nostradamus' (chapelle de la Vierge, fermée par une grille).
  stl_nathan: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'La chapelle de la Vierge est fermée par une grille de fer forgé. Derrière la grille, contre le mur : une plaque de marbre, un portrait gravé, un nom. MICHEL NOSTRADAMUS. Ses os sont là depuis 1791, depuis que des gardes nationaux ont ouvert sa première tombe et, dit-on, bu du vin dans son crâne.\n\nDevant la plaque, un garçon est couché sur le dallage. Seize ans. Un sweat du lycée de l’Empéri, un bas de survêtement, des baskets neuves. Sa main droite est enroulée dans un tee-shirt noir de sang.\n\nIl ouvre les yeux quand ta lampe passe sur lui. Ils sont blancs.\n\nIl se lève comme on se lève d’une sieste, sans hâte, et vient coller son visage contre la grille. La grille est fermée par un antivol de vélo, côté nef. Quelqu’un l’a enfermé. Quelqu’un qui savait.',
    choix: [
      { label: 'Prendre un chandelier sur l’autel voisin', suivant: 'stl_nathan_acheve' },
      { label: 'Le laisser', effets: { flag: 'nathan_laisse' }, suivant: '#fin' },
    ],
  },

  stl_nathan_acheve: {
    illu: 'collegiale_nef', musique: 'sombre',
    texte: 'Le chandelier de bronze pèse lourd. Tu passes le bras entre deux barreaux, et Nathan te laisse faire, bouche ouverte, les doigts accrochés au fer, tendu vers toi de tout son corps comme un gamin vers un gâteau.\n\nTu frappes une fois. Il recule d’un pas, surpris. Tu frappes encore. Il tombe à genoux devant le tombeau de Nostradamus, et tu frappes jusqu’à ce qu’il se couche.\n\nLà-haut, quelque part dans le clocher, quelqu’un pleure sans bruit.',
    choix: [
      { label: 'Reposer le chandelier', effets: { flag: 'nathan_acheve', document: 'doc_tombeau' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'clocher_lou' (chambre des cloches du clocher octogonal).
  stl_lou: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Tout en haut de l’escalier à vis, dans la chambre des cloches, une fille est assise dos au mur, un couteau à pain tendu devant elle à deux mains. Quinze ans. Des cheveux coupés court, mal, aux ciseaux de cuisine. Un sweat trop grand, un carnet à dessin glissé dans la ceinture. À côté d’elle, un cabas plein de cierges et trois bouteilles de vin de messe.\n\nElle ne baisse pas le couteau.\n\n« Tu viens du château ? » Sa voix est cassée par la soif. « Vidal t’envoie ? »\n\nTu dis oui. Elle baisse le couteau d’un centimètre.\n\n« Nathan… » Elle regarde vers l’escalier. « Il s’est fait mordre par le curé. Hier. Il m’a demandé de l’enfermer dans la chapelle. Il disait que celui qui ouvre le tombeau de Nostradamus meurt dans l’année, et qu’il avait toujours voulu vérifier. » Elle rit, un rire horrible, sec. « C’était un con. C’était mon meilleur pote. »',
    choix: [
      { label: '« C’est fini, pour Nathan. »', si: { flag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_fini' },
      { label: '« Il est toujours derrière la grille. »', si: { pasFlag: 'nathan_acheve' }, suivant: 'stl_lou_nathan_vivant' },
    ],
  },

  stl_lou_nathan_fini: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou regarde tes mains. Le sang sur tes mains. Elle hoche la tête, une fois.\n\n« Merci », dit-elle. Et c’est le merci le plus dur que tu entendras de ta vie.',
    choix: [{ label: '« On sort. »', suivant: 'stl_lou_sortie' }],
  },

  stl_lou_nathan_vivant: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: '« Je sais. Je l’entends. » Elle serre le couteau. « Je voulais le faire. J’ai pas pu. » Elle te regarde. « Tu le ferais, toi ? »',
    choix: [
      { label: '« Oui. En descendant. »', suivant: 'stl_lou_nathan_faire' },
      { label: '« Non. On le laisse. »', effets: { flag: 'nathan_laisse' }, suivant: 'stl_lou_sortie' },
    ],
  },

  stl_lou_nathan_faire: {
    illu: 'collegiale_nef', musique: 'sombre', orateur: 'Lou',
    texte: 'En descendant, tu t’arrêtes devant la grille de la chapelle. Lou reste en haut des marches. Elle ne regarde pas. Elle écoute.\n\nQuand tu reviens, elle a les yeux secs et la mâchoire serrée à se casser les dents.\n\n« Il disait que Nostradamus avait tout prévu, dit-elle. Même lui. »',
    choix: [{ label: '« On sort. »', effets: { flag: 'nathan_acheve' }, suivant: 'stl_lou_sortie' }],
  },

  stl_lou_sortie: {
    illu: 'collegiale_nef', musique: 'tension', orateur: 'Lou',
    texte: 'Elle se relève, s’appuie au mur, et regarde ton visage à la lumière de ta lampe. Longtemps. Ses sourcils se froncent.\n\n« On s’est déjà vus, nous deux.\n\n— Je ne crois pas.\n\n— Si. » Elle secoue la tête. « Laisse. Je suis crevée, je vois des gens partout. »\n\nElle ramasse le cabas de cierges. « La grande porte, c’est mort : ils sont tous dans la nef. On sort par la sacristie, derrière le chœur. Mais c’est fermé à clé, et la clé, c’est le curé qui l’a. » Elle déglutit. « Et le curé, il est à l’autel. Avec sa clochette. »',
    choix: [
      { label: '« J’ai la clé. »', besoin: { objet: 'cle_sacristie' }, effets: { flag: 'lou_trouvee' }, suivant: 'stl_sortie' },
      { label: '« Attends-moi ici. Je vais la chercher. »', effets: { flag: 'lou_trouvee' }, suivant: '#fin' },
    ],
  },

  // Marqueur 'porte_sacristie' (si Lou trouvée et clé en poche) — ou directement depuis stl_lou_sortie.
  stl_sortie: {
    illu: 'collegiale_nef', musique: 'calme', orateur: 'Lou',
    texte: 'La clé tourne avec un bruit de vieille mâchoire. Derrière, la sacristie : des aubes pendues à des cintres comme des pendus, un lavabo, une odeur de naphtaline. Une porte basse sur la ruelle.\n\nLou passe devant toi, s’arrête sur le seuil, se retourne vers la nef. Là-bas, ding, ding, ding, la clochette continue.\n\n« Tu crois qu’ils savent qu’ils sont morts ? » demande-t-elle.\n\nElle n’attend pas la réponse. Dehors, il fait jour, et le jour lui fait mal aux yeux. Elle rit, puis elle pleure, puis elle marche.',
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
    texte: 'Quand Lou passe la grille, Vidal ne dit rien. Il la prend dans ses bras, maladroitement, comme un prof qui n’en a pas le droit, et il la garde là longtemps, les yeux fermés, pendant que les autres gamins font semblant de regarder ailleurs.\n\nPuis il te regarde par-dessus son épaule.\n\n« Nathan ? »',
    choix: [
      { label: '« Il avait été mordu. C’est fait. »', si: { flag: 'nathan_acheve' }, suivant: 'emp_retour_nathan' },
      { label: '« Il avait été mordu. Il est enfermé dans la chapelle de la Vierge. »', si: { flag: 'nathan_laisse' }, suivant: 'emp_retour_nathan' },
    ],
  },

  emp_retour_nathan: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Vidal ferme les yeux. Il reste comme ça, debout, la main sur la tête de Lou, pendant quelques secondes qui s’étirent.\n\n« Merci », dit-il enfin, et il le dit comme on signe un registre de décès.',
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
    texte: '« Entre. » Il fait signe aux gamins de la porte. « Je ne sais toujours pas ce que tu es. Lou dit que ça n’a pas d’importance. » Il a un sourire fatigué. « Lou a quinze ans. »\n\nLa grille s’ouvre. Personne ne baisse son sabre, mais personne ne le lève.',
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
    texte: '« La radio est au sommet de la tour d’angle. Une heure. » Il lève un doigt, comme devant une classe. « Et tu n’appelles pas la nuit : ils écoutent aussi. »',
    choix: [{ label: 'Monter à la tour', suivant: '#fin' }],
  },

  // Marqueur 'radio_emperi' (sommet de la tour d'angle), si 'radio_ok' et pas 'radio_essayee'.
  emp_radio: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'La radio est un poste militaire vert olive, lourd comme une valise de pierres, posé sur une table de camping au sommet de la tour d’angle. Un combiné à cordon spiralé. Une batterie de camion reliée par des pinces crocodile. Vidal a scotché à côté une feuille de fréquences, d’heures, et une seule ligne soulignée : NE PAS APPELER LA NUIT — ILS ÉCOUTENT AUSSI.\n\nTu règles la fréquence que Maud t’a notée. Tu appuies sur l’alternat.\n\n« PC Durance, PC Durance, ici Salon, l’Empéri. Message pour la commandante Orsini, de la part de la docteure Sérane. »\n\nDu souffle. Puis une voix d’homme, jeune, plate :\n\n« Salon, ici PC Durance. Authentifiez. »',
    choix: [{ label: '« Je n’ai pas de code. Dites-lui : Sérane a la preuve. »', suivant: 'emp_radio_2' }],
  },

  emp_radio_2: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'Un silence si long que tu crois la liaison coupée.\n\n« Salon, le PC Durance ne traite pas avec les stations non authentifiées. » Encore un silence. Puis, presque bas, comme s’il se penchait sur le micro : « …Si la docteure a quelque chose, elle sait où nous trouver. Avec l’authentification. Terminé. »\n\nLe souffle revient. Tu reposes le combiné.\n\nDerrière toi, Lou, qui a tout entendu, mâchonne une mèche de ses cheveux. « C’est quoi, la preuve ? »',
    choix: [
      { label: '« Rien. Une histoire de docteure. »', suivant: 'emp_radio_fin' },
      { label: 'Ne rien répondre', suivant: 'emp_radio_fin' },
    ],
  },

  emp_radio_fin: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'Tu redescends l’escalier de la tour. Maud avait prévu ce refus, tu en es {sûr|sûre} maintenant : « S’ils veulent des preuves, mon registre est resté à l’hôpital. »\n\nL’hôpital. Tu l’as vu du haut de la tour : un bloc blanc au bord de la ville, des ambulances en épi, et rien qui bouge. Ou tout ce qui bouge.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flag: 'radio_essayee', quete: ['q_protocole', 'hopital'], decouvrir: ['hopital'],
          journal: 'La radio de l’Empéri ne sert à rien sans code d’authentification. Il faut une preuve : le registre de Maud, resté au sous-sol de l’hôpital.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE SAC ROUGE ───────────────────────────
  // Via le dialogue de Lou (scenes_pnj.js) : le carnet à dessin.
  emp_lou_carnet: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou sort le carnet à dessin de sa ceinture et le feuillette sans te regarder. Des dessins au stylo bille, serrés, obsessionnels : les tours du château, les toits, des gamins endormis, Vidal de dos. Et des morts. Beaucoup de morts, dessinés avec une précision de naturaliste.\n\nElle s’arrête sur une double page et la tourne vers toi.\n\nSix fois le même personnage, daté dans un coin : 4/9, 5/9, 5/9, 6/9, 7/9, 8/9. Un mort debout au pied de la porte du château, en bas de la montée. Un sac à dos rouge, une bretelle cassée. Le visage levé vers la grille.\n\nC’est toi.\n\n« Tu revenais tous les jours, dit Lou. À la même heure. Tu restais là, tu regardais la porte. Nathan t’appelait le Client. » Elle referme le carnet. « Et un matin, une ambulance est montée, une femme est descendue avec une perche, et tu es {parti|partie} avec elle. Comme un chien. »',
    choix: [{ label: '« Tu vas le dire à Vidal ? »', suivant: 'emp_lou_secret' }],
  },

  emp_lou_secret: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Lou réfléchit, sérieusement, comme devant un exercice.\n\n« Non. » Elle hausse les épaules. « D’abord, il me croirait pas. Ensuite, tu m’as sortie de là-bas. Et puis… » Elle tapote le dessin. « Ton sac. Il est toujours en bas. Dans les ronces, sous le rempart, là où tu te tenais. Personne n’est allé le chercher. Personne ne va dans les ronces. »',
    choix: [
      {
        label: '« Merci, Lou. »',
        effets: {
          flag: 'lou_sait', document: 'doc_carnet_lou', quete: ['q_sac_rouge', 'debut'],
          journal: 'Lou m’a dessiné mort, six fois, au pied de la porte du château. J’avais un sac à dos rouge. Il est toujours dans les ronces, sous le rempart.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'sac_rouge' (ronces sous le rempart, au pied de la porte, côté montée du Puech).
  emp_sac_rouge: {
    illu: 'montee_puech', musique: 'calme',
    texte: 'Il est là, dans les ronces, sous le rempart. Un sac à dos rouge délavé, une bretelle arrachée, la toile raidie de pluie et de soleil.\n\nTu le reconnais avant de te souvenir de lui. Tes mains le reconnaissent : elles savent où est la fermeture, elles savent que la poche du haut coince.\n\nDedans : un pull gris roulé en boule, qui sent encore une lessive que tu ne sais plus où tu as achetée. Une gourde d’eau tournée. Un livre de poche gonflé d’humidité — Colline, de Giono — avec un billet de train Marseille–Salon en marque-page, daté du 30 août. Une paire de gants de vendange neufs, l’étiquette encore attachée. Et une batterie externe, le câble enroulé autour.',
    choix: [
      {
        label: 'Brancher ton téléphone',
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
    texte: 'La batterie a gardé un tiers de sa charge. Le téléphone met une éternité à accepter de vivre — le logo, le noir, le logo — puis l’écran s’allume, fendu en étoile, et te demande ton code.\n\nTes pouces le tapent tout seuls.\n\nQuarante-trois notifications. Des messages, des appels manqués, des alertes. La dernière alerte gouvernementale date du 7 septembre : ZONE D’EXCLUSION SANITAIRE — RESTEZ CONFINÉS — NE CHERCHEZ PAS À REJOINDRE LA DURANCE.\n\nEt, dans la galerie, une dernière vidéo. 6 septembre, 17 h 52. Quarante et une secondes.',
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
    texte: 'Tu lis tout. Les messages d’avant, qui parlent de vendanges, de rendez-vous, d’un appartement. Les messages du Mercredi, qui deviennent de plus en plus courts. Et les derniers, qui n’attendaient plus de réponse.\n\nIl reste la vidéo.',
    choix: [{ label: 'Regarder la vidéo', suivant: 'emp_video' }],
  },

  emp_video: {
    illu: 'montee_puech', musique: 'tension',
    texte: 'L’image tremble. Ça court. Ta respiration, énorme dans le micro, et ta voix — ta voix, que tu ne reconnais pas, aiguë, en larmes : « Attendez ! Attendez ! »\n\nLa montée du Puech, filmée d’en bas, de travers. En haut, la porte du château, à moitié fermée par une grille. Des gamins qui passent en courant. Un homme en pull bleu qui les pousse dedans un par un, qui compte à voix haute. Seize. Dix-sept. Dix-huit.\n\nToi, tu arrives. Ta main entre dans le champ, tendue vers la grille. Le pull bleu se retourne. Il te voit. Une seconde, il te voit.\n\nPuis sa main s’abat sur ta poitrine et pousse. Fort. L’image bascule — le ciel, les murs, le pavé — et la grille claque, là-haut, avec un bruit de fer.\n\nTu cries « Monsieur ! », et derrière toi quelqu’un grogne, et l’image se remplit de mains.\n\nLes dix dernières secondes, c’est le ciel. Du ciel bleu, parfaitement vide, et un bruit que tu reconnais maintenant. Le bruit de quelqu’un qu’on mange.',
    choix: [
      {
        label: 'Éteindre',
        effets: {
          flag: 'video_vue', document: 'doc_video_6_septembre', quete: ['q_sac_rouge', 'fin'],
          journal: 'La dernière vidéo de mon téléphone : le 6 septembre, devant la porte de l’Empéri, c’est la main de Vidal qui a fermé la grille, avec moi dehors. C’est là que tout s’est fini.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Via le dialogue de Vidal, si 'video_vue'.
  emp_vidal_6sept: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu tends le téléphone à Vidal sans rien dire. La vidéo tourne. Tu regardes son visage pendant qu’il se regarde.\n\nÀ la seconde où sa main pousse, il ferme les yeux. Il ne les rouvre pas avant la fin.\n\n« Dix-huit », dit-il enfin. « J’en avais dix-huit à faire entrer, et il y avait de la place pour dix-huit. Pas un de plus. Je ne sais pas si c’était vrai. Je l’ai cru. » Il ôte ses lunettes. « J’ai vu ton visage. Tu avais un sac rouge. Je le vois toutes les nuits depuis. »\n\nIl te regarde enfin, et tu vois qu’il a compris. Pas tout. Assez.\n\n« Ce jour-là, dans la montée… ça s’est fini pour toi. Et pourtant tu es là. »',
    choix: [
      { label: '« Je te pardonne. »', suivant: 'emp_vidal_pardon' },
      { label: '« Tu vas le dire aux gamins. Tout. »', suivant: 'emp_vidal_avoue' },
      { label: '« Un jour, je te rendrai la pareille. »', suivant: 'emp_vidal_menace' },
    ],
  },

  emp_vidal_pardon: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Vidal te regarde comme s’il ne connaissait pas le mot. Puis il hoche la tête, une fois, et se détourne très vite vers la cour, vers ses gamins, pour que tu ne voies pas son visage.\n\n« Ne fais pas ça », dit-il, la voix étranglée. « Ne me facilite pas les choses. »',
    choix: [{ label: 'Le laisser', effets: { flags: { vidal_confronte: true, vidal_pardonne: true } }, suivant: '#fin' }],
  },

  emp_vidal_avoue: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Le soir, dans la cour d’honneur, Vidal réunit tout le monde autour du feu. Il parle debout, les mains dans les poches, comme en classe. Il raconte le 6 septembre, la grille, le sac rouge, sa main. Il ne dit pas ce que tu es. Il dit seulement : « Cette personne-là, c’est moi qui l’ai tuée. Et elle est revenue quand même. »\n\nPersonne ne dit rien. Hugo pleure. Lou dessine.\n\nQuand il a fini, Vidal s’assoit un peu à l’écart, et, pour la première fois depuis que tu le connais, il a l’air d’avoir dormi.',
    choix: [{ label: 'Continuer', effets: { flags: { vidal_confronte: true, vidal_avoue: true } }, suivant: '#fin' }],
  },

  emp_vidal_menace: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: '« Je sais », dit Vidal. Il remet ses lunettes. « J’attendais quelqu’un pour me dire ça. » Il te rend le téléphone. « Quand tu voudras. Pas devant eux. »',
    choix: [{ label: 'Partir', effets: { flags: { vidal_confronte: true, vidal_menace: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── L’HÔPITAL ───────────────────────────
  // Déclencheur : entrée dans 'hopital' si quête à 'hopital'.
  hop_entree: {
    illu: 'hopital_parvis', musique: 'tension',
    texte: 'Le centre hospitalier du Pays salonais a l’air d’avoir été évacué par une tornade. Des ambulances garées en épi devant les urgences, portes arrière ouvertes, brancards à moitié sortis. Une tente militaire effondrée sur le parking, sa toile verte tachée. Et des housses blanches alignées contre le mur, par dizaines, que les équipes de ramassage n’ont jamais emportées.\n\nAu-dessus de l’entrée des urgences, un drap de lit est tendu entre deux fenêtres du premier étage. Les lettres, peintes au pinceau, ont été délavées par trois semaines de soleil :\n\nICI ON SOIGNE ENCORE.\n\nTu reconnais l’écriture. Serrée, penchée, pressée.',
    choix: [
      {
        label: 'Entrer',
        effets: { journal: 'L’hôpital. Le registre de Maud est dans la chambre froide de la morgue, au sous-sol.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'salle_4' (sous-sol, salle des plâtres) : le souvenir.
  hop_salle4: {
    illu: 'salle_quatre', musique: 'sombre',
    texte: 'SALLE 4 — PLÂTRES. La porte est ouverte.\n\nÀ l’intérieur, un lit d’examen à roulettes, poussé contre le mur. Aux montants, des menottes de police, ouvertes, et des sangles de contention en cuir, déchirées. Le matelas de plastique est lacéré de longues griffures parallèles, comme les pages d’un livre. Par terre, un seau. Au mur, une feuille de soins scotchée : P4.\n\nEt sur le chariot, à côté des bandes plâtrées, une petite cloche de bronze à manche de bois, comme on en voyait sur le bureau des instituteurs.\n\nTu la prends. Tu ne sais pas pourquoi tu la prends.',
    choix: [
      {
        label: 'Agiter la cloche',
        effets: { objet: ['cloche_maud', 1], cinematique: 'souvenir_cloche' },
        suivant: 'hop_souvenir',
      },
    ],
  },

  hop_souvenir: {
    illu: 'salle_quatre', musique: 'sombre',
    texte: 'Tu ne sais pas depuis combien de temps tu es à genoux sur le carrelage, la cloche serrée contre ta poitrine.\n\nTa bouche est pleine. Tu craches. Tu craches encore. Le goût reste — pas un goût : un souvenir de goût, salé, chaud, cuivré, et en dessous quelque chose de gras qui colle au palais.\n\nUn homme. Une attelle. « Jo. »\n\nTu ne sais pas qui est Jo. Tu sais que tu as mangé l’homme qui l’appelait.',
    choix: [
      {
        label: 'Te relever',
        effets: {
          flag: 'souvenir_vu', pv: -5,
          journal: 'Salle 4. La cloche. Je me souviens : un homme attaché sur un brancard, une jambe dans une attelle. Il a dit « Jo ». Je l’ai mangé.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'morgue_couloir' (zone, couloir de la morgue) : le Brancardier.
  hop_brancardier: {
    illu: 'hopital_sous_sol', musique: 'tension',
    texte: 'Au bout du couloir de la morgue, sous le néon mort, quelque chose de très grand est assis sur un chariot de linge sale, et se balance.\n\nDeux mètres. Une blouse verte de brancardier tendue à craquer sur un torse de déménageur. Un badge : KARIM — BRANCARDAGE. Il a les deux mains posées sur les genoux, sages, et la moitié du visage mangée jusqu’à l’os.\n\nIl lève la tête. Il renifle. Il sourit, avec ce qui lui reste de bouche.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['colosse'] } }, suivant: 'hop_brancardier_apres' },
      {
        label: 'Reculer dans l’ombre',
        test: { skill: 'agilite', difficulte: 2 },
        reussite: {
          texte: 'Tu recules pas à pas, sans lui tourner le dos. Il renifle encore, déçu, et se remet à se balancer. Il faudra passer autrement — ou revenir mieux armé.',
          suivant: '#fin',
        },
        echec: {
          texte: 'Ton talon heurte un seau de ménage. Le bruit roule dans le couloir comme un coup de tonnerre.\n\nKarim se lève.',
          effets: { combat: { zombies: ['colosse'] } },
          suivant: 'hop_brancardier_apres',
        },
      },
    ],
  },

  hop_brancardier_apres: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Karim est tombé en travers du couloir, et il faut l’enjamber pour passer. Il est encore plus grand couché.\n\nDans la poche de sa blouse, avec un paquet de chewing-gums et une photo de mariage, un badge magnétique : ACCÈS MORGUE — CHAMBRE FROIDE.',
    choix: [{ label: 'Prendre le badge', effets: { objet: ['badge_morgue', 1] }, suivant: '#fin' }],
  },

  // Marqueur 'chambre_froide' (fermée : badge_morgue).
  hop_registre: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'La chambre froide de la morgue. Plus froide que le reste du sous-sol, même sans courant : les murs épais gardent le froid comme une rancune. Des tiroirs d’inox du sol au plafond, certains entrouverts, un pied qui dépasse avec son étiquette. Et sur la paillasse du fond, dans un sac de congélation fermé par un élastique, un grand registre noir à dos toilé, de ceux qu’on achetait pour tenir les comptes d’un commerce.\n\nSur la couverture, au marqueur : PROTOCOLE — M. S. — NE PAS JETER.',
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
    texte: 'Tu lis debout, la lampe coincée sous le menton, et le froid te monte dans les jambes sans que tu le sentes.\n\nTu lis la date où le patient P1 s’est échappé de son box et s’est jeté sur un vieil homme dans le couloir. Tu lis la date où P1 s’est réveillé, quatre jours plus tard, et a demandé de l’eau. Tu lis le mot que Maud a écrit dans la marge ce jour-là, en capitales, souligné trois fois : NOURRI.\n\nTu lis la règle qu’elle en a tirée, page 6, d’une écriture qui ne tremble pas : un adulte entier, dans les quarante-huit heures. Moins, ils reviennent mal. Plus, c’est inutile. Un pour un.\n\nTu lis ta ligne. P4. Nourri le 11/09, 03 h 10. Donneur : voir page 14.\n\nLa page 14 a été arrachée. Il reste une frange de papier dans la reliure.',
    choix: [
      { label: 'Chercher la page 14 dans la chambre froide', suivant: 'hop_registre_page' },
      { label: 'Refermer le registre', suivant: 'hop_registre_fin' },
    ],
  },

  hop_registre_page: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu retournes la paillasse, les tiroirs, les poubelles. Rien. La page n’a pas été arrachée par accident, dans la hâte d’un départ. Elle a été arrachée proprement, au ras de la couture, par quelqu’un qui savait exactement laquelle prendre.\n\nMaud l’a prise.',
    choix: [{ label: 'Refermer le registre', suivant: 'hop_registre_fin' }],
  },

  hop_registre_fin: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Tu refermes le registre. Tu le glisses dans ton sac, contre ton dos, et il pèse beaucoup plus lourd que du papier.\n\nPourquoi est-ce que je respire, avais-tu demandé à Maud, en haut de la tour.\n\nElle le savait.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          quete: ['q_protocole', 'confrontation'],
          journal: 'Le registre de Maud. On revient si on mange un adulte entier dans les deux jours : « un pour un ». Elle m’a fait manger quelqu’un. La page du « donneur » a été arrachée. Maud le savait depuis le début.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'casier_luc' (vestiaire du personnel).
  hop_casier: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le vestiaire du personnel. Une rangée de casiers métalliques, portes cabossées, cadenas forcés. Un seul est encore fermé. Quelqu’un a collé dessus un sparadrap avec un nom au marqueur : ARNAUD — EFFETS — À RENDRE À LA FAMILLE. En dessous, plus petit, souligné : M. S.\n\nLe cadenas est un petit cadenas de valise. Il cède au premier coup.',
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
    texte: 'Un blouson de travail bleu marine, un logo d’électricien brodé sur la poitrine. Un trousseau avec un porte-clés en forme de cigale. Une photo pliée en deux : un homme de cinquante ans, moustache, coup de soleil, qui porte sur ses épaules une petite fille édentée ; derrière eux, une falaise jaune trouée de grottes. Au dos : Clem et moi, Calès, avril.\n\nEt une enveloppe, fermée, adressée d’une grosse écriture appliquée : POUR JO. Joëlle Arnaud, Lamanon — les grottes.\n\nJo.',
    choix: [
      {
        label: 'Prendre l’enveloppe',
        effets: {
          flag: 'lettre_luc_trouvee', decouvrir: ['cales'],
          journal: 'Un casier au nom d’Arnaud. Une lettre « Pour Jo » — Joëlle Arnaud, Lamanon, les grottes. Une photo : un homme et une petite fille devant une falaise de Calès.',
        },
        suivant: 'hop_casier_3',
      },
    ],
  },

  hop_casier_3: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Sur l’étagère du haut, un sac isotherme de pharmacie, vide, avec une ordonnance agrafée : INSULINE RAPIDE ET LENTE — ARNAUD CLÉMENCE, 9 ANS.\n\nLe sac est vide. Quelqu’un a pris ce qu’il contenait pour le mettre au frais.',
    choix: [{ label: 'Refermer le casier', suivant: '#fin' }],
  },

  // Marqueur 'frigo_pharmacie' (pharmacie centrale, sous-sol) : l'insuline de Luc.
  hop_frigo: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le grand frigo de la pharmacie centrale est mort depuis longtemps. À l’intérieur, des flacons, des poches, des boîtes ramollies. Et, sur la clayette du milieu, bien rangée, une boîte blanche marquée au feutre de l’écriture de Maud : ARNAUD — À RENDRE.\n\nQuatre stylos d’insuline. La date limite est dans six mois. Hors du froid, ils tiendront encore quelques semaines.',
    choix: [{ label: 'Prendre la boîte', effets: { objet: ['insuline_luc', 1], flag: 'insuline_trouvee' }, suivant: '#fin' }],
  },

  // Marqueur 'bureau_maud' (1er étage, bureau du chef de service).
  hop_bureau: {
    illu: 'hopital_sous_sol', musique: 'sombre',
    texte: 'Le bureau du chef de service des urgences. Un canapé déplié, un sac de couchage, des pots de café soluble, des paquets de cigarettes vides empilés comme des briques. Sur le tableau blanc, des chiffres, des flèches, des courbes de température, et en haut, en rouge : 48 H.\n\nSur le bureau, deux choses : un carnet à spirale ouvert à la première page, et une chemise cartonnée — RAPPORT CELLULE DE CRISE — 08/09 — BROUILLON.',
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
    texte: 'Tu lis le carnet. Puis tu ouvres la chemise. Le rapport est tapé à la machine de la secrétaire du service, raturé au stylo, daté du 8 septembre, adressé à la cellule de crise de la préfecture et au PC de l’armée.\n\nMaud leur a tout dit. Dès le 8. Que les morts pouvaient revenir. Comment. À quel prix.\n\nEt l’armée a quand même décidé de brûler.',
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
    texte: 'Au secrétariat des urgences, les dossiers papier sont empilés par terre en tours penchées, tachées de café et d’autre chose. Deux chemises sont posées à part, sur le clavier d’un ordinateur mort, comme si quelqu’un avait voulu les retrouver vite.\n\nLa première porte ton nom. La seconde : ARNAUD Luc, 51 ans.',
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
    texte: 'Luc Arnaud. Admis le 10 septembre. Fracture ouverte du tibia droit. Amené par deux élèves de l’Empéri.\n\nDécédé le 11 septembre, à 3 h 10.\n\n3 h 10. Tu connais cette heure-là. Tu l’as lue dans le registre, sur ta propre ligne.',
    choix: [{ label: 'Refermer le dossier', effets: { document: 'doc_dossier_luc', flag: 'dossier_luc_lu' }, suivant: '#fin' }],
  },

  // ─────────────────────────── LA CONFRONTATION ───────────────────────────
  // Déclencheur : entrée dans 'nostradamus' si quête à 'confrontation' (ou sujet « registre » avec Maud).
  ch1_confrontation: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Tu poses le registre sur le bureau de Nostradamus, entre la sphère armillaire et le crâne de plâtre. Tu ne dis rien. Tu n’as pas besoin.\n\nMaud le regarde comme on regarde une radio qui confirme ce qu’on savait déjà. Elle ne le touche pas. Elle allume une cigarette.\n\n« Tu l’as lu. »\n\nCe n’est pas une question.',
    choix: [
      { label: '« Tu m’as fait manger un homme. »', suivant: 'ch1_conf_homme' },
      { label: '« Un pour un. »', suivant: 'ch1_conf_un_pour_un' },
      { label: '« Qui ? Page quatorze. Qui ? »', suivant: 'ch1_conf_qui' },
    ],
  },

  ch1_conf_homme: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Oui. » Elle souffle la fumée. « Je t’ai fait manger un homme, comme j’en ai fait manger un à Patrick, et un garçon à la pharmacienne qui dort dans ma cave. Et un vieux monsieur de quatre-vingt-un ans à P1, sauf que celui-là, je ne l’avais pas décidé. »\n\nElle hausse les épaules.\n\n« P1 s’est réveillé quatre jours plus tard, et il a demandé un verre d’eau. Il avait un fils à Montpellier, une collection de disques de jazz et un chat. Il s’est jeté du toit le lendemain. Mais il s’était réveillé. Tu comprends ? Il s’était réveillé. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_un_pour_un: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Un pour un. » Elle hoche la tête, lentement, comme un prof dont l’élève a enfin trouvé. « C’est la seule équation de toute cette saloperie qui tombe juste. L’agent, dans ton sang, il a faim. Donne-lui un adulte entier en deux jours : il se gave, il s’endort, il te lâche. Donne-lui moins : il se réveille à moitié, et toi aussi. »\n\nElle tire sur sa cigarette.\n\n« Il y a quatre cent mille morts entre la Durance et la mer. Quatre cent mille personnes qu’on peut ramener. Au prix d’une autre. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_qui: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Non. »\n\nElle le dit sans méchanceté. Elle le dit comme on refuse une morphine de trop.\n\n« Tu veux un nom pour avoir quelqu’un à pleurer. Tu n’as pas le droit de pleurer quelqu’un que tu as mangé. C’est obscène. » Elle pose la main à plat sur sa poitrine, sur sa blouse, là où il y a une poche intérieure. « La page est ici. Elle y restera. »',
    choix: [{ label: 'Te taire', suivant: 'ch1_conf_2' }],
  },

  ch1_conf_2: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Ils allaient mourir », dit-elle. « Tous. Les donneurs. Je n’ai pris que des gens qui allaient mourir. Une hémorragie qu’on n’arrêtait pas, une fracture ouverte sans antibiotiques, un traumatisme crânien. Ils allaient mourir dans l’heure, dans la nuit, dans la semaine. J’ai fait en sorte que ça serve. »\n\nElle soutient ton regard.\n\n« Toi, tu es ce à quoi ça a servi. »\n\nEn bas, sous vos pieds, dans la cave, quelque chose tombe. Un bruit de chaîne. Puis une voix, rauque, enrouée, qui appelle.\n\nUne voix de femme.',
    choix: [{ label: 'Descendre à la cave', suivant: 'ch1_p5' }],
  },

  ch1_p5: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Mireille',
    texte: 'Dans la cave voûtée, la femme qui dormait sous un drap s’est assise sur son lit de camp. La chaîne de vélo relie toujours sa cheville au pilier. Quarante ans. Des cheveux collés. Sa blouse de pharmacienne, avec un badge : MIREILLE — PHARMACIE DU COURS.\n\nElle te regarde. Elle regarde Maud, qui descend derrière toi.\n\n« Où est ma fille ? » dit-elle. Sa voix est normale. Complètement normale. « Il est quelle heure ? J’ai laissé ma fille chez ma mère, il faut que j’aille la chercher avant six heures. »\n\nMaud s’arrête sur la dernière marche. Tu l’entends retenir sa respiration.\n\nMireille sourit. Puis elle renifle. Une fois, deux fois, le nez levé vers toi, vers Maud.\n\n« Ça sent bon, ici », dit-elle — et sa voix descend d’une octave, et son sourire s’ouvre, s’ouvre, beaucoup trop large.',
    choix: [
      { label: 'Te mettre entre elle et Maud', effets: { combat: { zombies: ['enrage'] } }, suivant: 'ch1_p5_apres' },
    ],
  },

  ch1_p5_apres: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Quand c’est fini, Maud s’agenouille à côté de ce qui reste de Mireille. Elle lui ferme les yeux, deux doigts, par habitude. Puis elle sort un stylo de sa poche et, sur la feuille de soins scotchée au pilier, tout en bas, elle écrit un seul mot, et la date.\n\nRATÉ.\n\n« Samir, dit-elle sans se retourner. Dix-sept ans. Tombé du rempart de l’Empéri. Fracture du crâne. Ils me l’ont amené le 12. Il ne se serait jamais réveillé. » Elle se relève. « Il est mort pour rien. Ça arrive deux fois sur trois. Toi, tu es la troisième fois. »',
    choix: [
      { label: '« Je garde ton secret. Pour l’instant. »', suivant: 'ch1_conf_protege' },
      { label: '« Vidal va savoir ce que tu as fait de Samir. »', suivant: 'ch1_conf_denonce' },
    ],
  },

  ch1_conf_protege: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud hoche la tête, sans remercier. Elle n’a pas l’air soulagée. Elle a l’air de quelqu’un à qui on vient de confier une dette.\n\n« Pour l’instant, répète-t-elle. C’est honnête. » Elle remonte l’escalier de la cave, s’arrête à mi-hauteur. « Si l’armée voit le registre et qu’elle te voit, toi, elle n’allumera pas la Durance. Je n’ai pas fait tout ça pour que ça brûle. »\n\nTu ne réponds pas. Tu penses à la page quatorze, dans la poche de sa blouse, contre son cœur.',
    choix: [
      {
        label: 'Remonter',
        effets: {
          flags: { maud_protegee: true, confrontation_faite: true },
          tempsMin: 180,
          journal: 'Maud ne nie rien : elle nourrit ses patients avec des mourants. Mireille, sa patiente de la cave, est revenue « mal ». J’ai choisi de me taire. Pour l’instant.',
        },
        suivant: 'ch1_sonnailles_nos',
      },
    ],
  },

  ch1_conf_denonce: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud te regarde longtemps. Puis elle éteint sa cigarette dans le bénitier de décor, au pied de l’escalier.\n\n« Vas-y. Dis-lui. » Elle a un petit rire las. « Dis-lui que la docteure qui lui a recousu deux gamins en a donné un troisième à manger. Il te croira. Il a besoin d’un monstre. Tout le monde a besoin d’un monstre, sinon il faut regarder dans le miroir. »\n\nElle s’assoit sur la dernière marche.\n\n« Je ne bougerai pas d’ici. Je n’ai nulle part où aller. Et quand ils viendront me chercher, je dirai tout, moi aussi. Tout ce que je sais. Sur tout le monde. »\n\nElle tapote la poche de sa blouse. La page quatorze.',
    choix: [
      {
        label: 'Partir pour l’Empéri',
        effets: {
          flags: { maud_denoncee: true, confrontation_faite: true },
          quete: ['q_protocole', 'vidal_maud'],
          journal: 'Maud ne nie rien : elle nourrit ses patients avec des mourants. Samir, un élève de Vidal, a servi à nourrir la pharmacienne de la cave, qui est revenue « mal ». Je vais tout dire à Vidal.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : entrée dans 'emperi' si quête à 'vidal_maud'.
  emp_denonciation: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu ouvres le registre devant Vidal, à la page de Samir. Tu ne dis rien. Tu poses ton doigt sur la ligne.\n\nS. B. — 17 ANS — TRAUMA CRÂNIEN (CHUTE REMPART EMPÉRI) — DONNEUR P5 — 12/09.\n\nVidal lit. Il relit. Il ôte ses lunettes et relit sans elles, le nez sur la page, comme un myope qui ne veut pas croire.\n\n« Elle m’a dit qu’il était mort sur la table. » Sa voix est calme. C’est ce qui fait peur. « Elle m’a dit qu’elle avait tout essayé. »\n\nIl referme le registre. Il appelle, sans élever la voix : « Hugo. Mehdi. Prenez les cordes. »',
    choix: [
      {
        label: 'Les accompagner',
        effets: { flags: { maud_arretee: true, maud_captive: true }, tempsMin: 180 },
        suivant: 'emp_arrestation',
      },
    ],
  },

  emp_arrestation: {
    illu: 'nostradamus_cabinet', musique: 'sombre',
    texte: 'Ils la trouvent là où elle avait dit qu’elle serait : assise sur la dernière marche de la cave, les mains posées sur les genoux. Elle tend les poignets avant qu’on les lui demande.\n\nEn remontant la rue, entre deux gamins armés de sabres, elle marche droite, et elle ne te regarde qu’une fois. Pas avec colère. Avec une sorte de curiosité clinique, comme on suit l’évolution d’un symptôme.\n\nOn l’enferme dans la chapelle du château. Vidal ferme la porte à clé lui-même, et reste un long moment la main sur la poignée.\n\nLe soir tombe. Et du sud, de la Crau, porté par un air qui n’est pas encore du vent, arrive un son que personne ici n’a jamais entendu.',
    choix: [
      {
        label: 'Monter sur le rempart',
        effets: {
          flag: 'sonnailles_commencees', quete: ['q_protocole', 'siege'], cinematique: 'nuit_sonnailles',
          journal: 'Maud est enfermée dans la chapelle de l’Empéri. Et au soir, des cloches de troupeau sont montées de la Crau.',
        },
        suivant: 'ch1_sonnailles_emp',
      },
    ],
  },

  ch1_sonnailles_emp: {
    illu: 'cours_troupeau', musique: 'tension', orateur: 'Vidal',
    texte: 'Des cloches. Des centaines de petites cloches, sourdes, désaccordées, qui tintent sans rythme, comme de la ferraille qu’on secoue dans un sac. Et en dessous, plus grave, une seule, énorme, qui sonne toutes les dix secondes. Bong. Bong. Comme un cœur.\n\nDu rempart, tu la vois arriver. La marée. Elle coule le long du cours Victor-Hugo sous les platanes, d’un trottoir à l’autre, sans une trouée. Des milliers. Et devant, à la tête, des silhouettes qui ne marchent pas comme eux — droites, rapides — portent chacune une cloche au cou et une lampe au poing.\n\nLa marée tourne. Elle monte vers la vieille ville. Vers le rocher.\n\n« Ils viennent ici », dit Vidal. Il a l’air presque calme. « Ils savent qu’on est là. »\n\nTa bouche se remplit.',
    choix: [{ label: 'Descendre dans la cour', suivant: 'ch1_siege_1' }],
  },

  // ─────────────────────────── LA NUIT DES SONNAILLES ───────────────────────────
  ch1_sonnailles_nos: {
    illu: 'nostradamus_cabinet', musique: 'tension', orateur: 'Maud',
    texte: 'Le soir tombe sur la maison de Nostradamus. Maud a recouvert Mireille d’un drap propre. Vous mangez sans parler.\n\nEt puis, par la fenêtre ouverte, du sud, de la Crau, arrive un son que tu n’as jamais entendu.\n\nDes cloches. Pas celles de l’Horloge : des centaines de petites cloches, sourdes, désaccordées, qui tintent sans rythme, comme de la ferraille qu’on secoue dans un sac. Et en dessous, plus grave, une seule, énorme, qui sonne toutes les dix secondes. Bong. Bong. Comme un cœur.\n\nMaud s’est levée. Elle a pâli d’un coup.\n\n« Des sonnailles, dit-elle. Des sonnailles de brebis. » Elle tourne vers toi un visage que tu ne lui connaissais pas. « C’est une transhumance. En septembre. Dans le mauvais sens. »\n\nTa bouche se remplit.',
    choix: [
      {
        label: 'Monter voir',
        effets: { flag: 'sonnailles_commencees', quete: ['q_protocole', 'sonnailles'], cinematique: 'nuit_sonnailles' },
        suivant: 'ch1_sonnailles_nos_2',
      },
    ],
  },

  ch1_sonnailles_nos_2: {
    illu: 'cours_troupeau', musique: 'tension', orateur: 'Maud',
    texte: 'Du haut de la maison, par la lucarne, tu la vois arriver. La marée.\n\nElle coule le long du cours Victor-Hugo sous les platanes, d’un trottoir à l’autre, sans une trouée. Des milliers. Ils marchent au pas, tête basse, et devant, à la tête, des silhouettes qui ne marchent pas comme eux — droites, rapides — portent chacune une cloche au cou et une lampe au poing.\n\nLa marée ne s’arrête pas. Elle tourne. Elle monte vers la vieille ville. Vers le rocher. Vers le château.\n\n« L’Empéri », dit Maud. « Il y a trente vivants là-haut, et ils le savent. » Elle attrape sa trousse. « Je viens. Il y aura des blessés. »',
    choix: [
      {
        label: 'Courir prévenir l’Empéri',
        effets: {
          flag: 'maud_a_lemperi',
          journal: 'Des milliers de morts entrent dans Salon au son de cloches de brebis, menés par des silhouettes qui marchent comme des vivants. Ils montent vers l’Empéri.',
        },
        suivant: '#fin',
      },
    ],
  },

  // Déclencheur : entrée dans 'emperi' si 'sonnailles_commencees' et pas 'siege_fait' (et pas déjà dans la cour).
  ch1_siege_1: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Vidal',
    texte: 'L’Empéri est éveillé de la cave aux créneaux. Des torches sur le chemin de ronde. Des gamins qui courent avec des seaux, des planches, des bouteilles d’essence au goulot bourré de chiffon. Quelqu’un pleure dans la chapelle. Quelqu’un rit, nerveusement, beaucoup trop fort.\n\nEn bas, la marée a rempli la montée du Puech jusqu’au lycée. Elle ne crie pas. Elle ne gémit pas. Elle pousse. Les sonnailles tintent, et la grande cloche, quelque part dans la foule, sonne toutes les dix secondes, et à chaque coup, la marée avance d’un pas.\n\nVidal est partout, un sabre de cavalerie dans une main, un talkie-walkie dans l’autre. Il te voit.\n\n« Trois postes. La porte, avec moi. Les remparts, avec Lou : les bouteilles et les pierres. La chapelle, avec les petits et les blessés. » Il ne te demande pas si tu restes. « Choisis. »',
    choix: [
      { label: 'La porte, avec Vidal', effets: { flags: { siege_poste: 'porte', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_porte' },
      { label: 'Les remparts, avec Lou', effets: { flags: { siege_poste: 'remparts', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_remparts' },
      { label: 'La chapelle, avec les petits', effets: { flags: { siege_poste: 'chapelle', sonnailles_commencees: true }, quete: ['q_protocole', 'siege'] }, suivant: 'ch1_siege_chapelle' },
    ],
  },

  ch1_siege_porte: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Vidal',
    texte: 'La porte du château tremble à chaque coup de la grande cloche, comme si la cloche elle-même cognait dessus. Les palettes gémissent. La grille de chantier se tord d’un côté, un angle se soulève, et par l’angle, des bras passent. Puis une tête. Puis une épaule.\n\n« Ils passent à gauche ! » crie Hugo.\n\nVidal ne crie pas. Il lève son sabre et te regarde, et tu comprends qu’il compte sur toi exactement autant que sur lui-même.',
    choix: [
      { label: 'Tenir la brèche', effets: { combat: { zombies: ['errant', 'errant', 'coureur'], lieu: 'emperi' } }, suivant: 'ch1_siege_crise' },
    ],
  },

  ch1_siege_remparts: {
    illu: 'emperi_siege', musique: 'combat', orateur: 'Lou',
    texte: 'Sur le chemin de ronde, Lou allume les chiffons au briquet et te passe les bouteilles une par une, sans trembler, comme on passe des assiettes à la plonge.\n\n« Vise les têtes de la file, dit-elle. Pas le milieu. Si ceux de devant brûlent, ceux de derrière se poussent. »\n\nEn bas, la marée lève le visage vers vous. Des centaines de visages, tous pareils, tous ouverts.',
    choix: [
      {
        label: 'Lancer',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'La première bouteille éclate en plein sur la tête de la file, et le feu court d’épaule en épaule dans les vêtements secs. La marée recule, se tord, se piétine. Ça sent le cochon grillé et le pneu. Lou te tend la suivante sans un mot. Vous en lancez onze. Le bas de la montée brûle une heure.',
          effets: { xp: { dexterite: 15 }, flag: 'siege_feu_reussi' },
          suivant: 'ch1_siege_crise',
        },
        echec: {
          texte: 'La bouteille éclate trop près du mur. Le feu prend dans le lierre et remonte vers vous en rugissant, et dans la fumée, quelque chose en flammes grimpe les pierres avec ses ongles, franchit le parapet, et se relève sur le chemin de ronde.',
          effets: { combat: { zombies: ['enrage'], lieu: 'emperi' } },
          suivant: 'ch1_siege_crise',
        },
      },
    ],
  },

  ch1_siege_chapelle: {
    illu: 'emperi_siege', musique: 'tension',
    texte: 'Dans la chapelle, sous les fresques pâlies, les petits sont assis en rond sur des couvertures, et quelqu’un leur lit un livre à voix haute, très fort, pour couvrir les cloches. Deux adultes sont allongés sur des bancs, gris, trempés de sueur. Et Maud est là — qu’elle ait été enfermée ici ou qu’elle soit venue d’elle-même, elle est à genoux près des bancs, les manches relevées.\n\nC’est elle qui le voit la première. Enzo, onze ans, le petit de sixième. Il tremble sous sa couverture. Il tremble trop. Il a relevé son bas de survêtement et il regarde son mollet, et sur son mollet, il y a une demi-lune de dents.\n\n« Pendant la corvée d’eau », dit-il. « J’ai rien dit. J’avais peur que Vidal… » Il claque des dents. « J’ai froid. »',
    choix: [{ label: 'Regarder Maud', suivant: 'ch1_siege_chapelle_2' }],
  },

  ch1_siege_chapelle_2: {
    illu: 'emperi_siege', musique: 'tension', orateur: 'Maud',
    texte: 'Maud s’approche de toi, très près, et parle très bas, pour que les petits n’entendent pas.\n\n« Il a une heure. Peut-être moins. » Elle jette un regard vers les deux adultes allongés sur les bancs. « Et lui, là, à gauche, il ne passera pas la nuit. Péritonite. »\n\nElle ne finit pas. Elle n’a pas besoin. Tu vois la pensée passer dans ses yeux, le calcul, la balance.\n\nPuis elle secoue la tête, violemment, comme on chasse une guêpe.\n\n« Non. Il faut quarante-huit heures, des chaînes, un endroit. On n’a rien de tout ça ce soir. » Elle retourne vers Enzo, s’assoit à côté de lui, lui prend la main. « Occupe-toi des petits. Quand ce sera le moment, je te ferai signe. »',
    choix: [
      {
        label: 'Attendre le signe',
        effets: { combat: { zombies: ['coureur'], lieu: 'emperi' }, flag: 'enzo_perdu' },
        suivant: 'ch1_siege_chapelle_3',
      },
    ],
  },

  ch1_siege_chapelle_3: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Après, les petits ne pleurent pas. C’est le pire. Ils regardent le livre que quelqu’un a laissé tomber, ouvert à la page d’un lapin qui cherche sa maison.\n\nMaud se lave les mains dans le bénitier. Longtemps. Elle frotte encore quand l’eau est déjà propre.',
    choix: [{ label: 'Sortir', suivant: 'ch1_siege_crise' }],
  },

  ch1_siege_crise: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Vers trois heures, la marée trouve la faille.\n\nPas la porte : la poterne, en contrebas, du côté du lycée, par où l’équipe d’eau était sortie au crépuscule remplir des bidons à la fontaine. L’équipe n’est pas rentrée. L’équipe, c’est quatre gamins et une brouette, et ils sont là, maintenant, en bas de la poterne, collés contre la grille, avec la marée qui monte la ruelle derrière eux.\n\nVidal est déjà dans l’escalier. Tu le suis. Il ouvre la grille, tire le premier gamin, le deuxième —\n\nLa marée arrive.\n\nVidal sort. Il sort, lui, dehors, dans la ruelle, le sabre levé, il se met entre la marée et les deux derniers gamins, et il frappe.\n\n« LA GRILLE ! » hurle-t-il sans se retourner. « FERME-LA QUAND ILS SONT DEDANS ! »\n\nLe troisième gamin passe. Le quatrième trébuche sur un bidon.\n\nLa manivelle de la grille est dans ta main.',
    timerMs: 8000,
    timeout: {
      texte: 'Tu n’as pas choisi. La marée a choisi pour toi : le quatrième gamin passe, Vidal recule, et ils passent avec lui, trois, quatre, emmêlés à ses jambes.',
      effets: { combat: { zombies: ['errant', 'coureur', 'enrage'], lieu: 'emperi' }, flag: 'theo_sauve' },
      suivant: 'ch1_siege_vidal',
    },
    choix: [
      { label: 'Fermer la grille. Maintenant.', suivant: 'ch1_siege_fermer' },
      { label: 'Attendre le gamin', suivant: 'ch1_siege_attendre' },
      { label: 'Sortir aider Vidal', suivant: 'ch1_siege_sortir' },
    ],
  },

  ch1_siege_fermer: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Tu tournes la manivelle.\n\nLa grille descend. Vidal l’entend. Il ne se retourne pas. Le quatrième gamin — Théo, il s’appelait Théo, tu l’apprendras au matin — se relève, se jette vers la grille, et ses doigts passent entre les barreaux au moment où elle touche le sol.\n\nVidal recule jusqu’à lui, dos à la grille, et il frappe, et il frappe, et la marée se referme sur eux comme une main.\n\nIl ne crie pas. C’est Théo qui crie. Longtemps.\n\nTu tiens la manivelle jusqu’à ce que tes paumes saignent. Tu penses à une vidéo de quarante et une secondes. Tu ne sais pas si c’est de la justice. Tu sais que c’est le même geste.',
    choix: [
      {
        label: 'Lâcher la manivelle',
        effets: {
          flags: { vidal_mort: true, theo_perdu: true, siege_fait: true },
          journal: 'La nuit des sonnailles. J’ai fermé la grille de la poterne sur Vidal et sur Théo, pour que la marée n’entre pas. Le même geste que lui, le 6 septembre.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  ch1_siege_attendre: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Tu attends. Une seconde. Deux. Théo se relève, se jette vers la grille, passe. Vidal recule, recule, frappe, recule —\n\n« MAINTENANT ! »\n\nTrop tard pour que ce soit propre. Ils passent la grille avec lui. Trois, quatre, emmêlés à ses jambes.',
    choix: [
      { label: 'Te battre', effets: { combat: { zombies: ['errant', 'coureur', 'enrage'], lieu: 'emperi' }, flag: 'theo_sauve' }, suivant: 'ch1_siege_vidal' },
    ],
  },

  ch1_siege_sortir: {
    illu: 'emperi_siege', musique: 'combat',
    texte: 'Tu lâches la manivelle et tu sors dans la ruelle, à côté de lui.',
    choix: [
      {
        label: 'Attraper Théo et le traîner à l’intérieur',
        test: { skill: 'force', difficulte: 2 },
        reussite: {
          texte: 'Tu empoignes Théo par le col et tu le jettes à l’intérieur comme un sac. Vidal recule avec toi, pas à pas, le sabre en moulinet. La grille tombe devant vos nez. Vous êtes dedans, tous les deux, adossés au mur, à respirer comme des noyés.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', xp: { force: 15 } },
          suivant: 'ch1_siege_vidal',
        },
        echec: {
          texte: 'Tu empoignes Théo, mais une main t’empoigne, toi, par l’épaule, et des ongles te labourent jusqu’à l’omoplate. Vidal frappe par-dessus ton épaule, une fois, deux fois. Vous passez la grille tous les trois dans un enchevêtrement de bras. Elle tombe.\n\nPuis Vidal regarde son bras.',
          effets: { flag: 'theo_sauve', blessure: { type: 'entaille', zone: "à l'épaule" }, pv: -10 },
          suivant: 'ch1_siege_vidal',
        },
      },
    ],
  },

  ch1_siege_vidal: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'La grille est fermée. Les morts qui sont passés sont à terre. Théo est vivant, à genoux, il vomit dans l’escalier.\n\nVidal est assis contre le mur de la poterne, le sabre en travers des genoux. Il a relevé la manche de son pull bleu. Sur son avant-bras, une morsure. Franche, profonde, qui saigne à peine.\n\nIl la regarde avec une espèce d’intérêt professionnel. Puis il te regarde, toi.\n\n« Tu as une drôle de tête. Pas la tête de quelqu’un qui a peur que je me transforme. La tête de quelqu’un qui sait. » Il sourit, un sourire épuisé. « Alors dis-moi. Qu’est-ce qui m’attend ? »',
    choix: [
      { label: '« Tu vas mourir. Et te relever. »', suivant: 'ch1_vidal_simple' },
      { label: '« Il existe un moyen de revenir. Un pour un. »', si: { flag: 'registre_trouve' }, suivant: 'ch1_vidal_un_pour_un' },
    ],
  },

  ch1_vidal_simple: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: '« Tu vas mourir. Et puis ton corps va se relever, et il reviendra tous les jours devant cette poterne, parce qu’ils reviennent tous quelque part. »\n\nVidal hoche la tête. « Je sais où je reviendrai. » Il regarde en haut de l’escalier, les têtes des gamins penchées au-dessus de la rambarde. « Je ne veux pas qu’ils me voient revenir. »\n\nIl te tend le sabre, poignée en avant.\n\n« Fais-le proprement. Et après, emmène-les. Emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme ça. »',
    choix: [
      { label: 'Prendre le sabre', suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_un_pour_un: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Vidal',
    texte: 'Tu lui dis. La housse, le registre, l’équation. Un adulte entier, dans les quarante-huit heures. Tu lui dis que tu as mangé un homme, et que tu es là.\n\nVidal écoute jusqu’au bout, comme on écoute un exposé. Il ne t’interrompt pas.\n\nPuis il regarde, en haut de l’escalier, les têtes des gamins penchées au-dessus de la rambarde.\n\n« Lequel ? » demande-t-il doucement. « Lequel tu me donnerais ? »\n\nIl rit. Il tousse. La fièvre monte déjà, tu la vois monter dans ses yeux.\n\n« Non. Personne ne me mange personne. » Il te tend le sabre, poignée en avant. « Fais-le proprement. Et après, emmène-les. Emmène-les loin de ces murs. Ils ne tiendront pas une deuxième nuit comme ça. »',
    choix: [
      { label: 'Prendre le sabre', effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_fin' },
      { label: 'Laisser Lou décider', si: { flag: 'lou_sauvee' }, effets: { flag: 'vidal_sait_un_pour_un' }, suivant: 'ch1_vidal_lou' },
    ],
  },

  ch1_vidal_fin: {
    illu: 'emperi_siege', musique: 'sombre',
    texte: 'Il ferme les yeux. Il récite quelque chose à mi-voix. Tu crois d’abord que c’est une prière. C’est une date. Onze juin 1909, vingt et une heures dix. Il la répète comme on répète une leçon, et tu comprends que c’est la dernière chose qu’il veut avoir en tête : un tremblement de terre, et des murs qui tiennent.\n\nTu le fais proprement. Il avait demandé ça.',
    choix: [
      {
        label: 'Garder le sabre',
        effets: {
          flags: { vidal_acheve: true, siege_fait: true },
          objet: ['sabre_cavalerie', 1],
          journal: 'Vidal a été mordu en tenant la poterne. Il m’a demandé de le finir, proprement. Je l’ai fait. Il récitait la date du tremblement de terre de 1909.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  ch1_vidal_lou: {
    illu: 'emperi_siege', musique: 'sombre', orateur: 'Lou',
    texte: 'Lou descend l’escalier. Elle a tout entendu. Elle ne pleure pas. Elle s’accroupit devant Vidal et elle lui prend le sabre des mains, doucement, comme on retire des lunettes à quelqu’un qui s’est endormi en lisant.\n\n« Vous m’avez toujours dit de finir ce que je commençais », dit-elle.\n\nVidal rit. Il lui touche la joue avec le dos de la main. « Pas sur ce ton, Mercadier. »\n\nTu remontes l’escalier. Tu ne regardes pas. Tu entends.',
    choix: [
      {
        label: 'Attendre l’aube',
        effets: {
          flags: { vidal_acheve_lou: true, siege_fait: true },
          journal: 'Vidal a été mordu en tenant la poterne. C’est Lou qui l’a fini. Il l’a appelée par son nom de famille, comme en classe.',
        },
        suivant: 'ch1_aube',
      },
    ],
  },

  // ─────────────────────────── L’AUBE ───────────────────────────
  ch1_aube: {
    illu: 'emperi_remparts_aube', musique: 'sombre',
    texte: 'L’aube arrive par l’est, grise, sale, et avec elle le silence.\n\nLa marée s’est retirée de la montée du Puech. Elle a laissé des corps — les siens, les nôtres — et des traînées sombres sur les galets. Et elle s’en va.',
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
    texte: 'Du haut du rempart, tu la vois s’étirer vers le nord, sur la route d’Avignon : une rivière de dos courbés qui n’en finit pas, jusqu’au rond-point, jusqu’aux champs, jusqu’à l’horizon. Elle a vidé Salon en passant. Les rues de la vieille ville, en bas, sont vides comme tu ne les as jamais vues.\n\nEn tête, loin, deux silhouettes marchent côte à côte. Un vieil homme avec un grand bâton de berger, un chapeau, une cape de laine, et deux chiens qui tournent autour de lui. Et une femme, petite, courbée sous le poids d’une cloche énorme qu’elle porte à deux mains contre sa poitrine, comme un enfant.\n\nBong. Toutes les dix secondes. Tout Salon s’est levé, et la suit.',
    choix: [{ label: 'Redescendre', suivant: 'ch1_aube_radio' }],
  },

  ch1_aube_radio: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'La radio',
    texte: 'Dans la tour d’angle, la radio grésille toute seule. Lou est assise devant, les genoux sous le menton, et elle monte le son quand tu entres.\n\nUne voix de femme. Pas celle de l’armée. Une voix d’ici, avec l’accent, rauque d’avoir trop parlé :\n\n« …ici les grottes de Calès, au-dessus de Lamanon. On est quarante-trois. On a de l’eau, on a des murs, on a de la place. On prend les enfants. On prend tout le monde qui n’est pas mordu. Si vous entendez ça, venez par les collines, pas par la route : la route, c’est à eux, maintenant. On écoute à chaque heure pile. Ici Jo, les grottes de Calès… »\n\nJo.\n\nTu ne bouges plus. Lou te regarde bizarrement.\n\n« Quoi ? Tu la connais ? »',
    choix: [
      { label: '« Non. »', suivant: 'ch1_depart' },
      { label: '« J’ai une lettre pour elle. »', si: { objet: 'lettre_luc' }, suivant: 'ch1_aube_lettre' },
    ],
  },

  ch1_aube_lettre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: '« Une lettre ? » Lou fronce les sourcils. « De qui ?\n\n— D’un homme qui est mort. »\n\nElle te regarde longtemps, avec ses yeux de dessinatrice qui voient ce qu’on ne montre pas. Elle ne pose pas la question suivante. Elle se lève.\n\n« Alors on va à Calès. »',
    choix: [{ label: 'Continuer', suivant: 'ch1_depart' }],
  },

  ch1_depart: {
    illu: 'emperi_cour', musique: 'calme',
    texte: 'On part à midi. Personne ne dit qu’on abandonne le château ; tout le monde le sait. Les grands portent les petits, les bidons, les couvertures, les sabres du musée. On enterre les morts de la nuit dans le Jardin des Simples, entre la sauge et le millepertuis, parce que c’est là que la terre est la plus meuble.',
    choix: [
      { label: 'Regarder Maud', si: { flag: 'maud_captive' }, suivant: 'ch1_depart_captive' },
      { label: 'Regarder Maud', si: { flag: 'maud_protegee' }, suivant: 'ch1_depart_libre' },
    ],
  },

  ch1_depart_captive: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud marche au milieu de la file, les poignets attachés par une corde que tient Hugo. Les gamins ont décidé qu’elle serait jugée « par des adultes, là-bas ». Personne ne sait ce que ça veut dire. Tout le monde a l’air soulagé de ne pas avoir à le décider ce matin.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Tu as bien fait, tu sais », dit-elle. « C’est ce que j’aurais fait à ta place. » Un temps. « C’est bien ça le problème. »',
    choix: [{ label: 'Partir vers le nord', suivant: 'ch1_fin' }],
  },

  ch1_depart_libre: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Maud',
    texte: 'Maud marche en queue de file, sa trousse à l’épaule, et elle recoud au fil des haltes ce que la nuit a ouvert. Les gamins l’appellent « docteure », comme avant. Deux d’entre eux lui tiennent la main. Elle se laisse faire.\n\nEn passant la poterne, elle se tourne vers toi.\n\n« Merci », dit-elle. Et puis, plus bas : « Ne me le fais pas regretter. Je ne te le ferai pas regretter non plus. »',
    choix: [{ label: 'Partir vers le nord', effets: { flag: 'maud_medecin' }, suivant: 'ch1_fin' }],
  },

  ch1_fin: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'Une vingtaine de personnes sortent de l’Empéri par la poterne, en file, et descendent vers le nord par les jardins, entre les murets et les oliviers, loin de la route.\n\nTu te retournes une fois. Sur la Tour de l’Horloge, au-dessus des toits vides, le cadran marque toujours neuf heures dix.\n\n— FIN DU CHAPITRE 1 —',
    choix: [
      {
        label: 'Chapitre 2 : La transhumance',
        effets: {
          flag: 'ch1_fini',
          quete: ['q_protocole', 'fin'],
          decouvrir: ['cales'],
          cinematique: 'ch2_intro',
          journal: 'Nous quittons Salon pour les grottes de Calès, au-dessus de Lamanon. La femme de la radio s’appelle Jo. J’ai dans mon sac une lettre « Pour Jo ».',
        },
        suivant: 'ch1_fin_2',
      },
    ],
  },

  ch1_fin_2: {
    illu: 'route_jean_moulin', musique: 'calme',
    texte: 'Les gamins et les adultes passeront par les collines, en file, lentement, avec les petits. Toi, tu prendras les chemins, plus vite. Rendez-vous aux grottes.',
    choix: [
      {
        label: 'Ouvrir la carte',
        effets: { quete: ['q_traversee', 'cales'] },
        suivant: '#fin',
      },
    ],
  },
};
