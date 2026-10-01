// ============ CHAPITRE 2 — « La transhumance » (le pays salonais) ============
// Hub : les grottes de Calès (Joëlle, Clémence, Lou, Maud captive ou médecin).
// Fil principal (q_traversee) : Calès → reconnaissance du pont de Mallemort → retour et PROCÈS de Maud
//   (le joueur a mangé Luc, le mari de Joëlle) → BA 701 (radio + authentification ; ordre Cautère, Protocole R)
//   → appel à Orsini → la veille du mistral (exige d'être allé à Vieux-Vernègues voir le Berger).
// Secondaires : q_berger (Vernègues, Rose, le redon), q_jour_de_plus (canal de Craponne, cloches de Sénas),
//   q_temoignage (filmer la vérité).

export const SCENES_CH2 = {

  // ─────────────────────────── CALÈS ───────────────────────────
  // Déclencheur : entrée dans 'cales' si quête q_traversee à 'cales'.
  cal_arrivee: {
    illu: 'cales_falaises', musique: 'calme', orateur: 'Joëlle',
    texte: 'Les grottes de Calès, au-dessus du village de Lamanon. Deux falaises de pierre jaune et tendre, percées de haut en bas de pièces creusées à la main il y a huit cents ans. On voit des fenêtres carrées, des escaliers taillés dans la roche, des niches à pigeons. Dans les trous, il y a des feux, du linge qui sèche, des visages. Des vivants.\n\nUne échelle de corde descend du premier niveau. En haut, une femme t’attend, les bras croisés. La cinquantaine, solide, les cheveux gris coupés court. Elle porte un gilet de guide sur un tee-shirt délavé : « GROTTES DE CALÈS — RÉOUVERTURE AVRIL 2025 ». Une carabine à plombs pend à son épaule.\n\nDerrière elle, les enfants de l’Empéri sont déjà là. Ils ont mangé. Ils te font des signes.\n\n« Montre tes bras », dit la femme. Puis, avant que tu obéisses, plus doucement : « Pardon. C’est la règle ici. Je m’appelle Joëlle. Tout le monde m’appelle Jo. »',
    choix: [
      { label: 'Montrer ton bras brûlé', si: { flag: 'cicatrice_brulee' }, suivant: 'cal_bras_ok' },
      { label: 'Montrer ton bras bandé', si: { flag: 'bras_bande' }, suivant: 'cal_bras_ok' },
      { label: 'Montrer la morsure', si: { flag: 'bras_nu' }, suivant: 'cal_bras_morsure' },
      { label: 'Montrer tes bras', si: { pasFlag: 'bras_decide' }, suivant: 'cal_bras_morsure' },
    ],
  },

  cal_bras_ok: {
    illu: 'cales_falaises', musique: 'calme', orateur: 'Joëlle',
    texte: 'Joëlle jette à peine un œil à ton bras. Elle écoute surtout les enfants de l’Empéri, qui parlent tous en même temps : la nuit des cloches, la petite porte du rempart, toi.\n\n« Ils disent que sans toi, ils seraient tous morts. » Elle s’écarte pour te laisser l’échelle. « Ça me suffit pour aujourd’hui. Monte. Il y a de la soupe. »',
    choix: [{ label: 'Monter à l’échelle', effets: { flag: 'cales_arrivee' }, suivant: 'cal_insuline' }],
  },

  cal_bras_morsure: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Joëlle',
    texte: 'Joëlle fixe la morsure cicatrisée. Longtemps. Sur les corniches, au-dessus, des carabines se lèvent vers toi.\n\nC’est Lou qui parle, du haut de l’échelle : « C’est comme ça depuis le début. On a dormi à côté de cette personne au château. Il ne s’est rien passé. »\n\n« Une morsure qui a guéri… » Joëlle secoue lentement la tête, comme devant quelque chose d’impossible. « Tu dormiras à part, tout en haut, dans la grotte du guetteur. Tu ne touches pas aux enfants. Et le jour où tu as de la fièvre, même une seule fois, tu sautes de la falaise. D’accord ? »',
    choix: [{ label: 'Accepter ses conditions', effets: { flags: { cales_arrivee: true, cales_mefiance: true } }, suivant: 'cal_insuline' }],
  },

  cal_insuline: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Dans la première grotte, il fait chaud. Ça sent la soupe de pois chiches, la fumée et les gens. Une petite fille est assise sur une caisse, une couverture sur les épaules. Neuf ans, une queue de cheval blonde, des cernes violets. Elle est très pâle, et ce n’est pas de peur : elle est malade. Elle serre contre elle un lecteur de glycémie éteint, comme une peluche.\n\n« C’est Clémence, dit Joëlle. Ma fille. Elle est diabétique. Il lui reste un seul stylo d’insuline : depuis dix jours, on lui donne des quarts de dose. » Elle le dit très vite, pour en finir. « Son père est parti en chercher à Salon le 10 septembre. Il n’est jamais revenu. »\n\nClémence te regarde.\n\n« Tu as vu mon papa, à Salon ? »',
    choix: [
      { label: 'Sortir la boîte d’insuline de l’hôpital', si: { objet: 'insuline_luc' }, suivant: 'cal_insuline_donnee' },
      { label: 'Répondre : « Non. »', suivant: 'cal_insuline_non' },
    ],
  },

  cal_insuline_non: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Clémence hoche la tête, très sérieuse, et retourne à son lecteur. Joëlle lui pose la main sur la tête.\n\n« Il voulait essayer la pharmacie du cours, dit-elle. Et si elle était vide, l’hôpital de Salon. Si un jour tu y retournes… »\n\nElle ne finit pas sa phrase.',
    choix: [{ label: 'Continuer', suivant: 'cal_jo_plan' }],
  },

  cal_insuline_donnee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu poses la boîte sur la caisse, à côté de Clémence. Quatre stylos d’insuline. Sur le couvercle, au feutre, l’écriture serrée de Maud : « ARNAUD — À RENDRE ».\n\nJoëlle se fige.\n\nElle prend la boîte. Elle lit le nom, deux fois. Puis elle serre la boîte contre son ventre et se met à pleurer, debout, sans un bruit, la bouche ouverte. Dans la grotte, tout le monde fait semblant de ne pas voir.\n\n« C’est Luc, dit-elle enfin. Mon mari. C’est lui qui les a trouvées. Il les a trouvées ! » Elle rit à travers ses larmes. « Où ? Où est-ce que tu les as eues ? »\n\nClémence tire sur ta manche.\n\n« Il est où, mon papa ? »',
    choix: [
      {
        label: 'Mentir à moitié : « À l’hôpital. Je n’ai trouvé que ça. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_luc_hopital',
      },
      {
        label: 'Esquiver : « Je ne sais pas. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_luc_mensonge',
      },
      {
        label: 'Avouer : « C’est moi qui l’ai mangé. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_aveu_precoce',
      },
    ],
  },

  cal_luc_hopital: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« À l’hôpital… » Joëlle s’accroche à ce mot. « Alors il était blessé. Il est allé se faire soigner. » Elle s’essuie le visage avec l’avant-bras. « Il a laissé quelque chose ? Un mot ? »',
    choix: [
      { label: 'Lui donner l’enveloppe « Pour Jo »', si: { objet: 'lettre_luc' }, suivant: 'cal_lettre_donnee' },
      { label: 'Garder l’enveloppe : « Non. Rien. »', suivant: 'cal_lettre_gardee' },
    ],
  },

  cal_luc_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Tu ne sais pas. » Joëlle hoche la tête. Elle regarde la boîte, le nom écrit au feutre par quelqu’un d’autre. « Quelqu’un les a mises de côté pour lui. Quelqu’un a écrit “à rendre”. Ça veut dire qu’il comptait revenir les chercher, non ? Ça veut forcément dire ça. »\n\nTu ne réponds pas. Dans ton sac, l’enveloppe de Luc pèse comme une pierre.',
    choix: [{ label: 'Continuer', effets: { flag: 'lettre_gardee' }, suivant: 'cal_jo_plan' }],
  },

  cal_lettre_gardee: {
    illu: 'cales_grande_salle', musique: 'sombre',
    texte: 'Tu dis non. Tu le dis bien, sans ciller. Tu as appris à mentir quelque part entre la housse mortuaire et ici.\n\nL’enveloppe reste dans ton sac, à côté du registre de Maud.',
    choix: [{ label: 'Continuer', effets: { flag: 'lettre_gardee' }, suivant: 'cal_jo_plan' }],
  },

  cal_lettre_donnee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu lui tends l’enveloppe. « POUR JO ».\n\nElle l’ouvre avec l’ongle du pouce, lentement, pour ne pas l’abîmer. Elle lit debout. Ses yeux descendent les lignes, remontent, redescendent. Tu sais ce qu’il y a dedans : la jambe cassée, la docteure qui s’occupe bien de lui, et la dernière ligne.\n\nJoëlle replie la lettre et la glisse sous son tee-shirt, contre sa peau.\n\n« Il dit qu’une docteure s’occupe de lui. Il dit qu’il rentre dès qu’il pourra marcher. » Elle te regarde avec un espoir si nu que tu préférerais qu’elle te frappe. « Il est peut-être encore là-bas. Blessé, quelque part. Tu crois ? »',
    choix: [
      { label: 'Lui laisser l’espoir : « Peut-être. »', effets: { objet: ['lettre_luc', -1], flags: { lettre_donnee: true, espoir_donne: true } }, suivant: 'cal_jo_plan' },
      { label: 'Lui dire qu’il est mort : « Je ne crois pas, Jo. »', effets: { objet: ['lettre_luc', -1], flag: 'lettre_donnee' }, suivant: 'cal_pas_espoir' },
      { label: 'Avouer : « Jo… C’est moi qui l’ai mangé. »', effets: { objet: ['lettre_luc', -1], flag: 'lettre_donnee' }, suivant: 'cal_aveu_precoce' },
    ],
  },

  cal_pas_espoir: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle ferme les yeux. Elle hoche la tête, une fois. Quelque chose se referme en elle, doucement, sans bruit.\n\n« Je sais, dit-elle. Je le sais depuis le 12. Je voulais juste l’entendre de quelqu’un d’autre. » Elle prend Clémence par la main. « Viens, ma puce. On va faire ta piqûre. Avec la vraie insuline de papa. »',
    choix: [{ label: 'Continuer', suivant: 'cal_jo_plan' }],
  },

  cal_aveu_precoce: {
    illu: 'cales_grande_salle', musique: 'sombre',
    texte: 'Les mots sortent tout seuls. Ils sont petits, plats. Ils ne font aucun bruit.\n\nJoëlle ne comprend pas. Alors tu répètes, autrement : l’hôpital, la morsure, la housse, la docteure, la cloche. Et l’homme sur le brancard, une attelle à la jambe, qui ne criait pas, qui disait seulement « Jo ».\n\nClémence a lâché ta manche.\n\nJoëlle pose la boîte d’insuline sur la caisse, très doucement, comme si elle allait exploser. Puis elle te gifle. Une seule fois, de toutes ses forces, main ouverte. Ta tête part sur le côté. Tu as le goût du sang dans la bouche.\n\nElle ne frappe pas une deuxième fois. Elle prend sa fille dans ses bras et quitte la grotte sans un mot. Personne ne te regarde. Personne ne te parle jusqu’au soir.',
    choix: [
      {
        label: 'Attendre le soir',
        effets: { flags: { joelle_sait: true, aveu: true, aveu_precoce: true }, pv: -3, tempsMin: 300 },
        suivant: 'cal_aveu_precoce_soir',
      },
    ],
  },

  cal_aveu_precoce_soir: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Elle revient à la nuit tombée. Elle s’assoit à trois mètres de toi, au bord de la corniche, les jambes dans le vide.\n\n« Luc aurait voulu que je sois juste. » Elle parle aux toits de Lamanon, pas à toi. « Moi, j’ai envie de te pousser. Là, dans le vide. Ce serait facile. Trois secondes. » Un silence. « On va faire comme Luc aurait voulu. »\n\nElle se relève.\n\n« Tu restes. Pas pour toi. Parce qu’on doit traverser la Durance et que tu sais des choses. Tu nous aides à passer. Après, je ne veux plus jamais voir ta tête. »\n\nElle s’éloigne. Puis elle s’arrête, sans se retourner.\n\n« La docteure. Celle qui t’a donné Luc à manger. Elle est ici ? »',
    choix: [
      { label: 'Répondre : « Oui. Elle est ici. »', effets: { flags: { maud_captive: true, maud_medecin: false } }, suivant: 'cal_jo_plan_froid' },
    ],
  },

  cal_jo_plan_froid: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Dans la nuit, Joëlle fait attacher Maud dans la grotte du puits, sans rien expliquer. Personne ne pose de question : quand Jo a cette tête-là, on se tait.\n\nLe matin, elle déplie une carte routière sur une caisse, devant tout le monde. Elle parle à la carte, pas à toi.\n\n« Au sud, les morts montent vers nous : huit ou dix mille, avec des cloches. Au nord, il y a la Durance, et l’armée tire sur tout ce qui s’approche des ponts. Le pont le plus proche, c’est Mallemort. » Son doigt s’arrête sur le fleuve. « Quelqu’un doit aller voir. Quelqu’un qu’on peut se permettre de perdre. »',
    choix: [
      {
        label: 'Se porter volontaire pour Mallemort',
        effets: {
          quete: ['q_traversee', 'mallemort'], decouvrir: ['mallemort'],
          journal: 'J’ai dit la vérité à Jo : j’ai mangé Luc, son mari. Elle me garde seulement pour l’aider à traverser la Durance. Je pars voir le pont de Mallemort.',
        },
        suivant: '#fin',
      },
    ],
  },

  cal_jo_plan: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: 'Plus tard, dans la grotte du conseil, Joëlle déplie une carte routière sur une caisse et pose une bougie dessus.\n\n« On est coincés. Au sud, les morts montent vers nous : les enfants disent huit ou dix mille, avec des cloches. Au nord, il y a la Durance. L’armée tient les ponts et tire sur tout ce qui approche. » Son doigt suit le fleuve. « Le plus proche, c’est Mallemort. Il y a le pont de la route et le vieux pont suspendu. Personne n’est allé voir depuis des jours. »\n\nElle lève les yeux vers toi.\n\n« Toi, tu as l’air de quelqu’un qui revient de partout. »',
    choix: [
      {
        label: 'Se porter volontaire pour Mallemort',
        effets: {
          quete: ['q_traversee', 'mallemort'], decouvrir: ['mallemort'],
          journal: 'Calès : une soixantaine de survivants vivent dans les grottes, menés par Joëlle (« Jo »). Le troupeau de morts monte vers nous. Il faut traverser la Durance. Je pars voir le pont de Mallemort.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── MALLEMORT — RECONNAISSANCE ───────────────────────────
  // Déclencheur : entrée dans 'mallemort' si quête à 'mallemort'.
  mal_arrivee: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'La Durance, enfin. Un fleuve large et gris, coupé de bancs de galets blancs, avec une eau couleur de ciment qui descend des Alpes à toute vitesse. Ici, deux ponts le traversent.\n\nLe pont de la route est en béton, droit, moderne. À mi-longueur, il est fermé par un mur de conteneurs empilés sur deux étages, avec des barbelés au sommet. Contre les conteneurs, des voitures brûlées sont entassées comme des jouets.\n\nJuste à côté, il y a le vieux pont suspendu. Ses piliers de pierre ont la forme d’arcs de triomphe, et des câbles d’acier retiennent un tablier étroit en planches, rénové pour les promeneurs et les vélos. Lui est ouvert : rien ne le bloque. Au milieu, peint en rouge sur les planches, en lettres de deux mètres : « 200 M ». Au bout, sur la rive nord, des sacs de sable sous des filets de camouflage. Des jumelles brillent au soleil : l’armée.\n\nSur les planches, entre ta rive et le « 200 M » rouge, il y a une vingtaine de corps. Ce ne sont pas des morts-vivants. Ce sont des gens, abattus en essayant de passer. Des valises, un caddie, un vélo d’enfant.',
    choix: [{ label: 'S’approcher du pont suspendu', suivant: '#fin' }],
  },

  // Déclencheur : marqueur (zone) 'ligne_200m' sur le pont suspendu.
  mal_ligne: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Le haut-parleur',
    texte: 'Tu as fait trois pas sur les planches quand un haut-parleur grésille sur la rive nord. Une voix d’homme, jeune, sans colère :\n\n« Individu sur le pont suspendu, vous êtes en zone interdite. Faites demi-tour immédiatement. Ceci est le seul avertissement. »\n\nLe pont oscille un peu sous tes pieds. Le vent fait chanter les câbles.',
    choix: [
      {
        label: 'Faire demi-tour',
        effets: { flag: 'mal_reco_faite', quete: ['q_traversee', 'retour'], journal: 'Mallemort : l’armée tient la rive nord. Le pont de la route est muré. Le pont suspendu est ouvert, mais les soldats tirent sur quiconque dépasse la marque des 200 mètres.' },
        suivant: '#fin',
      },
      { label: 'Lever les mains et crier que tu veux parler', suivant: 'mal_crier' },
      { label: 'Continuer d’avancer sur le pont', suivant: 'mal_tir' },
    ],
  },

  mal_crier: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Le haut-parleur',
    texte: '« On vient de Calès ! On est soixante, avec des enfants ! On veut parler à la commandante Orsini ! »\n\nUn silence. Le vent dans les câbles. Puis la voix revient, plus lente, comme si elle lisait un papier :\n\n« Le PC Durance — le poste de commandement de l’armée — ne parle pas aux civils non identifiés. Aucun passage n’est autorisé. Faites demi-tour. »\n\nUn clic. Puis une autre voix, plus basse, qui n’aurait sans doute pas dû passer dans le haut-parleur : « … s’ils ont une radio, qu’ils appellent sur la fréquence 4, avec les codes d’identification. Coupe, coupe ! »\n\nClic.',
    choix: [
      {
        label: 'Reculer jusqu’à la rive',
        effets: {
          flags: { mal_reco_faite: true, frequence_4: true }, quete: ['q_traversee', 'retour'],
          journal: 'Mallemort : l’armée tient la rive nord et tire au-delà des 200 mètres. Un soldat a laissé échapper l’info : il faut appeler sur la fréquence 4, avec les codes d’identification. Il nous faut donc une radio militaire et ces codes.',
        },
        suivant: '#fin',
      },
    ],
  },

  mal_tir: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Le coup de feu part avant que ton pied touche la planche suivante. Tu ne l’entends même pas : tu le reçois. C’est comme un coup de marteau dans le haut du bras. Tu tournes sur toi-même et les planches montent vers ton visage.\n\nTu rampes jusqu’à la rive sud, lentement, en laissant une traînée de sang. Personne ne tire une deuxième fois. Ils n’en ont pas besoin.',
    choix: [
      {
        label: 'Ramper jusqu’à la rive',
        effets: {
          blessure: { type: 'profonde', zone: 'au bras' }, pv: -30,
          flags: { mal_reco_faite: true, frequence_4: true }, quete: ['q_traversee', 'retour'],
          journal: 'Mallemort : l’armée m’a tiré dessus quand j’ai dépassé la marque des 200 mètres. Pour leur parler, il faudra une radio militaire et leurs codes.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE PROCÈS ───────────────────────────
  // Déclencheur : entrée dans 'cales' si quête à 'retour'.
  cal_retour: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu fais ton rapport à Joëlle, debout, devant tout le monde : le mur de conteneurs, les corps sur les planches, la marque rouge des 200 mètres, la voix du haut-parleur. Pour parler à l’armée, il faut une radio militaire et des codes.\n\n« Rien que ça », dit Joëlle.\n\nLou lève la main, comme en classe. « La base aérienne 701, à Salon. Ils ont forcément des radios là-bas. Et des codes. »\n\nUn murmure parcourt la grotte. La BA 701 est au sud de Salon, en plein territoire des morts, là où plus personne ne va.\n\nPuis Joëlle se tourne vers le fond de la grotte, et sa voix change.\n\n« Mais d’abord, on a autre chose à régler. »',
    choix: [
      { label: 'Suivre son regard', si: { flag: 'aveu_precoce' }, suivant: 'cal_proces_a' },
      { label: 'Suivre son regard', si: { flag: 'maud_captive', pasFlag: 'aveu_precoce' }, suivant: 'cal_proces_b' },
      { label: 'Suivre son regard', si: { flag: 'maud_medecin', pasFlag: 'aveu_precoce' }, suivant: 'cal_proces_c' },
    ],
  },

  cal_proces_a: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La grande salle est une grotte haute comme une église, creusée dans la roche il y a sept siècles. Ce soir, elle est pleine. Des torches, des lampes frontales. Ça sent la cire et la peur. C’est un procès.\n\nAu milieu, sur un tabouret, les poignets attachés : Maud.\n\nJoëlle reste debout. Elle ne crie pas. Elle parle comme on lit une liste de courses.\n\n« Luc Arnaud. Cinquante et un ans. Électricien. Il avait une jambe cassée, et vous l’avez donné à manger à un mort. » Elle te montre du doigt sans te regarder. « À cette personne-là. Elle me l’a avoué. Au moins, elle, elle me l’a dit. »\n\nMaud te regarde. Il y a une sorte de respect dans ses yeux. Et de la fatigue.',
    choix: [{ label: 'Écouter ce que Maud a à dire', suivant: 'cal_maud_defense' }],
  },

  cal_proces_b: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La grande salle est une grotte haute comme une église, creusée dans la roche il y a sept siècles. Ce soir, elle est pleine : quarante personnes de Calès, vingt de l’Empéri, assises par terre, debout contre les parois, des enfants sur les épaules. Des torches. Ça sent la cire et la peur. C’est un procès.\n\nAu milieu, sur un tabouret, les poignets attachés : Maud.\n\nLes enfants de l’Empéri ont raconté l’histoire de Samir, donné à manger à un mort. Hugo a lu à voix haute la ligne du registre. Et puis Théo, ou un autre, a ajouté : « Le monsieur de Lamanon aussi, celui à la jambe cassée, on l’avait amené à la docteure. »\n\nJoëlle s’approche de Maud et se penche vers elle.\n\n« Luc Arnaud. »\n\nMaud ne baisse pas les yeux. « Page quatorze du registre. » De ses mains liées, elle sort de la doublure de sa blouse une feuille pliée en quatre et la déplie. Cette page dit qui a mangé Luc. Avant de la lire, Maud lève les yeux.\n\nVers toi.',
    choix: [
      { label: 'Te lever et avouer : « C’est moi. »', suivant: 'cal_aveu' },
      { label: 'Te taire et la laisser lire', suivant: 'cal_maud_revele' },
      {
        label: 'Arracher la page des mains de Maud',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Tu traverses la salle en trois pas et tu lui arraches la feuille avant que quiconque réagisse. Tu la tends vers la torche la plus proche. Le papier noircit, se tord, s’envole en flammèches vers la voûte. La preuve a disparu.\n\nSoixante personnes te regardent. Joëlle aussi.',
          effets: { flag: 'page_brulee' },
          suivant: 'cal_page_brulee',
        },
        echec: {
          texte: 'Tu as fait deux pas quand Hugo t’attrape par le bras. Maud n’a même pas bougé. Elle a attendu, la page à la main.',
          suivant: 'cal_maud_revele',
        },
      },
    ],
  },

  cal_proces_c: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Ce soir, la grande salle est pleine, et ce n’est pas pour la soupe. Maud est debout près du feu, les mains libres, sa trousse à ses pieds. Depuis trois jours, elle recoud, fait des piqûres, soigne. Elle a réglé la dose d’insuline de Clémence. Les gens de Calès l’appellent « la docteure », presque avec dévotion.\n\nMais les enfants de l’Empéri ont parlé. Sans penser à mal, ils ont dit que le monsieur de Lamanon à la jambe cassée, on l’avait amené à la docteure.\n\nJoëlle s’est plantée devant Maud.\n\n« Luc Arnaud. Vous l’avez soigné. »\n\n« Il est mort d’une hémorragie la nuit de son arrivée, répond Maud sans ciller. Je suis désolée. »\n\nJoëlle la regarde longtemps. Puis elle se tourne vers toi.\n\n« Tu étais à l’hôpital. Tu as trouvé ses affaires. Qu’est-ce que tu as trouvé d’autre ? »',
    choix: [
      { label: 'Montrer le registre de Maud', besoin: { objet: 'registre_protocole' }, suivant: 'cal_proces_c_registre' },
      { label: 'Mentir pour couvrir Maud : « Rien. »', suivant: 'cal_proces_c_mensonge' },
    ],
  },

  cal_proces_c_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Rien. Ses affaires et l’insuline. C’est tout. »\n\nJoëlle te fixe. Tu soutiens son regard. Au bout d’un long moment, elle hoche la tête. La salle respire. Les gens se lèvent en murmurant. C’est fini.\n\nMaud ramasse sa trousse. En passant près de toi, sans tourner la tête, elle murmure : « On est quittes. » Puis, plus bas : « Non. On ne l’est pas. On ne le sera jamais. »',
    choix: [
      {
        label: 'Laisser passer la nuit',
        effets: {
          flags: { mensonge_jo: true, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'J’ai menti à Jo devant tout le monde, et Maud a menti aussi. Pour Calès, Luc est mort d’une hémorragie. Personne ne sait que je l’ai mangé.',
        },
        suivant: '#fin',
      },
    ],
  },

  cal_proces_c_registre: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu poses le registre noir sur la caisse, devant Joëlle. Sur la couverture : « PROTOCOLE — M. S. ». C’est le cahier où Maud notait ses expériences.\n\nJoëlle lit. Il faut que quelqu’un lui explique les abréviations, et c’est Lou qui le fait, d’une voix blanche. Donneur : le vivant qu’on donne à manger. Nourri : le mort qui l’a mangé. Dormance : le sommeil qui suit. « Un pour un » : un vivant mangé pour un mort qui revient. Samir. Et dans l’index, au début : « ARNAUD L. — P. 14 ».\n\nLa page quatorze a été arrachée.\n\nMaud n’a pas bougé. Elle glisse la main dans la doublure de sa blouse et en sort une feuille pliée en quatre. La page manquante. Elle la déplie, la relit en silence. Puis elle lève les yeux vers toi.',
    choix: [
      { label: 'Te lever et avouer : « C’est moi. »', suivant: 'cal_aveu' },
      { label: 'Te taire et la laisser lire', suivant: 'cal_maud_mange_page' },
    ],
  },

  cal_maud_mange_page: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Tu lis tout dans ses yeux : la salle 4, la cloche, le brancard. Et la question : est-ce que tu veux qu’elle parle ?\n\nMaud roule la page en boule, la met dans sa bouche et la mâche.\n\nQuelqu’un crie dans la salle. Un homme se jette sur elle, trop tard. Elle avale, avec la grimace d’une gamine qui prend son sirop. La seule preuve contre toi a disparu.\n\n« Le patient est mort, dit-elle, la bouche vide. La page quatorze, c’est mon affaire. Un pour un, madame Arnaud. Pendez-moi si vous voulez. Ça fera le compte. »',
    choix: [{ label: 'Continuer de te taire', effets: { flags: { maud_a_mange_page: true, maud_captive: true, maud_medecin: false } }, suivant: 'cal_maud_defense' }],
  },

  cal_maud_revele: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud lit à voix haute, sans te quitter des yeux.\n\n« Quatorze. Arnaud, Luc. Cinquante et un ans. Fracture ouverte du tibia droit. Donneur pour P4. Donné à manger le 11 septembre, à trois heures dix du matin. » Elle replie la feuille. « P4, c’était le numéro de mon quatrième patient mort. P4 est dans cette salle. C’est P4 qui vous a rapporté l’insuline. »\n\nSoixante têtes se tournent vers toi.\n\nJoëlle aussi. Elle ne comprend pas tout de suite. Puis elle regarde ton bras : la marque de la morsure. Et elle comprend que c’est toi qui as mangé son mari.',
    choix: [{ label: 'Ne rien nier', effets: { flags: { joelle_sait: true, revele_public: true } }, suivant: 'cal_revele_2' }],
  },

  cal_revele_2: {
    illu: 'cales_grande_salle', musique: 'combat', orateur: 'Joëlle',
    texte: 'Quelqu’un crie : « C’est un mort ! » D’un coup, toute la salle est debout, les torches levées, les couteaux sortis. Des mains t’agrippent et te plaquent contre la paroi. Quelqu’un brandit une hachette. Quelqu’un pleure. Lou hurle ton prénom et se jette devant toi, les bras écartés.\n\n« ARRÊTEZ ! »\n\nC’est Joëlle. Elle n’a pas crié très fort, mais tout le monde s’arrête.\n\n« Personne ne touche à personne ce soir. » Elle ne te regarde pas. « Ce soir, on juge la docteure. »',
    choix: [{ label: 'Rester contre la paroi', suivant: 'cal_maud_defense' }],
  },

  cal_aveu: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu te lèves. Tu le dis avant que Maud lise la page. Tu racontes la salle 4, la cloche, l’homme sur le brancard, le mot qu’il a dit. Tu dis que tu savais déjà tout quand tu as posé la boîte d’insuline sur la caisse.\n\nLa salle est silencieuse. Même les enfants.\n\nJoëlle s’approche, tout près. Elle sent la fumée et le savon.\n\n« Tu le savais, dit-elle. Quand tu as donné l’insuline à ma fille, tu le savais. »',
    choix: [
      { label: 'Répondre : « Oui. »', effets: { flags: { joelle_sait: true, aveu: true } }, suivant: 'cal_aveu_2' },
      { label: 'Expliquer : « Je ne savais pas comment te le dire. »', effets: { flags: { joelle_sait: true, aveu: true } }, suivant: 'cal_aveu_2' },
    ],
  },

  cal_aveu_2: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle hoche la tête. Elle a l’air très calme, et c’est terrible.\n\n« D’accord », dit-elle. Elle se tourne vers Maud, puis vers la salle. « Ça, c’est entre moi et… » Elle te désigne du menton, sans trouver le mot. « On verra plus tard. Ce soir, on juge celle qui a choisi de le donner. »',
    choix: [{ label: 'Te rasseoir', suivant: 'cal_maud_defense' }],
  },

  cal_page_brulee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Pourquoi tu as fait ça ? » demande Joëlle, très doucement.',
    choix: [
      { label: 'Avouer : « Parce que c’était moi, sur cette page. »', suivant: 'cal_aveu' },
      { label: 'Te taire sur toi : « Personne ne doit savoir ça. »', effets: { flag: 'joelle_doute' }, suivant: 'cal_maud_defense' },
    ],
  },

  cal_maud_defense: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud se défend debout, les mains croisées devant elle, comme à une réunion de service.\n\n« Il avait une fracture ouverte du tibia. Il était resté deux jours dans une cave avant qu’on me l’amène. Sans antibiotiques, la plaie pourrissait en trois jours, l’infection gagnait le sang en cinq. Il allait mourir. Je n’ai choisi que des gens qui allaient mourir. »\n\nJoëlle secoue lentement la tête.\n\n« Il avait des antibiotiques. » Sa voix ne monte pas. « Dans la poche de son blouson. Une boîte entière d’amoxicilline. C’est moi qui la lui avais donnée, le matin où il est parti. Je lui avais dit : si tu te blesses, tu en prends. »\n\nUn silence.\n\nMaud ouvre la bouche, puis la referme. Pour la première fois, tu la vois chercher ses mots sans les trouver. Elle le savait. Luc aurait pu vivre.\n\n« Il me fallait quelqu’un, dit-elle enfin, très bas. Dans les quarante-huit heures. Il était là. »',
    choix: [{ label: 'Écouter la réaction de la salle', suivant: 'cal_verdict' }],
  },

  cal_verdict: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La salle gronde. Les voix montent : « La falaise ! » « Qu’elle aille rejoindre les morts ! » « On n’est pas des assassins ! » « Elle, si ! »\n\nJoëlle lève la main. Le silence revient peu à peu.\n\nElle se tourne vers toi. Ni par pitié ni par confiance : tu es la seule personne ici à savoir exactement ce que Maud a fait, et ce que ça produit.\n\n« Toi. Qu’est-ce qu’on fait d’elle ? »',
    choix: [
      { label: 'La condamner : « Qu’on la pende. »', suivant: 'cal_maud_pendue' },
      { label: 'La bannir : « Qu’on la chasse chez les morts. »', suivant: 'cal_maud_exilee' },
      { label: 'La garder pour l’échanger à l’armée', suivant: 'cal_maud_gardee' },
    ],
  },

  cal_maud_pendue: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Maud',
    texte: 'Ils la pendent à l’aube, au sommet de la falaise, à un petit chêne qui a poussé de travers dans une fissure. Il n’y a pas de discours. Quelqu’un a proposé une prière ; personne n’a su laquelle dire.\n\nAvant qu’on lui passe la corde, Maud demande une cigarette. On lui en trouve une. Elle la fume jusqu’au filtre en regardant la plaine et, très loin au sud, la tache blanche de Salon.\n\nElle te fait signe d’approcher.\n\n« Tu es mon meilleur cas, dit-elle. Ne gâche pas ça avec des remords. Les remords, c’est pour ceux qui ne sont jamais revenus de rien. »\n\nElle écrase le mégot sur la pierre, très soigneusement, jusqu’à ce qu’il n’en reste rien.',
    choix: [
      {
        label: 'Regarder jusqu’au bout',
        effets: {
          flags: { maud_morte: true, maud_captive: false, maud_medecin: false, maud_pendue: true, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Maud Sérane a été pendue à l’aube au sommet de la falaise de Calès. Ses dernières paroles étaient pour moi.',
        },
        suivant: 'cal_apres_proces',
      },
      {
        label: 'Détourner les yeux',
        effets: {
          flags: { maud_morte: true, maud_captive: false, maud_medecin: false, maud_pendue: true, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Maud Sérane a été pendue à l’aube au sommet de la falaise de Calès.',
        },
        suivant: 'cal_apres_proces',
      },
    ],
  },

  cal_maud_exilee: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Maud',
    texte: 'Au matin, ils la font descendre par l’échelle de corde, avec sa trousse, une gourde et rien d’autre. On ne lui détache les mains qu’au pied de la falaise.\n\nElle part vers le sud. Vers les morts et leurs cloches.\n\nAu bout du chemin, elle se retourne une fois et te cherche des yeux sur la corniche.\n\n« Je vais voir ton berger ! » crie-t-elle. Elle a l’air presque heureuse. « Un troupeau entier, tu te rends compte ? Des centaines de patients à étudier ! »',
    choix: [
      {
        label: 'La regarder disparaître',
        effets: {
          flags: { maud_exilee: true, maud_berger: true, maud_captive: false, maud_medecin: false, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Calès a chassé Maud. Elle est partie rejoindre le troupeau du Berger, presque heureuse : « Des centaines de patients. »',
        },
        suivant: 'cal_apres_proces',
      },
    ],
  },

  cal_maud_gardee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« L’armée la voudra », répète Joëlle, en pesant chaque mot. « Elle nous servira de monnaie d’échange. » Elle regarde Maud. « Vous entendez ? Vous allez enfin servir à quelque chose. »\n\nOn enferme Maud au fond de la grotte du puits, derrière une grille de jardin. Elle s’assoit par terre, le dos contre la roche, et ferme les yeux comme quelqu’un qui a enfin le droit de dormir.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flags: { maud_captive: true, maud_medecin: false, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Calès garde Maud prisonnière dans la grotte du puits, pour l’échanger à l’armée.',
        },
        suivant: 'cal_apres_proces',
      },
    ],
  },

  cal_apres_proces: {
    illu: 'cales_falaises', musique: 'sombre',
    texte: 'Le reste de la journée, Calès vit comme après un enterrement : on range, on cuisine, on fait semblant. Mais tout le monde a entendu Lou : à la base aérienne 701, il y a une radio militaire et des codes.\n\nLa base est au sud de Salon. Il faudra retraverser la plaine, chez les morts.',
    choix: [
      { label: 'Attendre la nuit', si: { flag: 'joelle_sait' }, suivant: 'cal_joelle_nuit' },
      { label: 'Préparer ton sac pour la base 701', si: { pasFlag: 'joelle_sait' }, suivant: '#fin' },
    ],
  },

  cal_joelle_nuit: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Elle vient tard, quand les feux sont presque éteints. Elle s’assoit à côté de toi au bord de la corniche, les jambes dans le vide, au-dessus de Lamanon endormi. Elle ne te regarde pas.\n\n« Il avait peur des hôpitaux. Il tombait dans les pommes pour une prise de sang. » Un silence. « Il est parti à pied, son vélo à la main, parce qu’il avait un pneu crevé. Il m’a dit : je reviens avant la nuit. »\n\nLe vent se lève un peu, puis retombe.\n\n« Est-ce qu’il a eu mal ? »',
    choix: [
      { label: 'Mentir pour l’apaiser : « Non. »', effets: { flag: 'jo_mensonge_doux' }, suivant: 'cal_joelle_nuit_non' },
      { label: 'Dire la vérité : « Je ne sais pas. Il ne criait pas. »', suivant: 'cal_joelle_nuit_verite' },
      { label: 'Lui dire : « Il a dit ton nom. »', effets: { flag: 'jo_nom_dit' }, suivant: 'cal_joelle_nuit_nom' },
    ],
  },

  cal_joelle_nuit_non: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Menteur. » Elle le dit sans colère, presque avec tendresse. « Merci. »\n\nElle reste encore un moment. Puis elle se lève et rentre dans la grotte sans rien ajouter.',
    choix: [{ label: 'Rester au bord du vide', suivant: '#fin' }],
  },

  cal_joelle_nuit_verite: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Il ne criait jamais. » Elle rit un peu, les yeux mouillés. « Même le jour où il a pris une décharge sur un chantier à Sénas, en 2011. Il a juste dit : “Oh, putain.” » Elle s’essuie le nez avec le poignet. « C’est bien, qu’il n’ait pas crié. C’est tout lui. »\n\nElle se lève. Une seconde, elle pose la main sur ton épaule. Puis elle la retire, comme si elle s’était brûlée.',
    choix: [{ label: 'La regarder partir', suivant: '#fin' }],
  },

  cal_joelle_nuit_nom: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle reste silencieuse très longtemps.\n\n« Jo », dit-elle enfin. Ce n’est pas une question.\n\nTu hoches la tête.\n\nD’un coup, elle se plie en deux, comme frappée au ventre, et pleure contre ses genoux avec un bruit que tu n’avais jamais entendu sortir d’un être humain. Tu ne la touches pas. Tu restes là. C’est tout ce que tu peux faire, et c’est tout ce qu’elle te laisse faire.\n\nQuand elle se redresse, son visage est défait, mais ses yeux sont secs.\n\n« Au pont, dit-elle, tu passeras derrière moi. Je veux te voir passer. »',
    choix: [{ label: 'Rester près d’elle', effets: { flag: 'joelle_veut_te_voir_passer' }, suivant: '#fin' }],
  },

  // Dialogue avec Maud captive (grotte du puits) — voir scenes_pnj.js pour le menu.
  maud_liberer: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'À trois heures du matin, pendant que le guetteur somnole, tu ouvres la grille de la grotte du puits. Maud ne se lève pas tout de suite.\n\n« Pourquoi ? »\n\nTu ne sais pas quoi répondre. Elle hoche la tête, comme si c’était la bonne réponse.\n\nElle se lève et ramasse sa trousse. Puis elle glisse la main dans sa blouse et te tend quelque chose.',
    choix: [{ label: 'Prendre ce qu’elle te tend', suivant: 'maud_liberer_2' }],
  },

  maud_liberer_2: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'C’est une feuille pliée en quatre, douce comme un vieux billet à force d’avoir été manipulée. La page quatorze du registre : celle qui dit que tu as mangé Luc.\n\n« Tu le savais déjà, dit-elle. Mais tu as le droit de l’avoir. »\n\nAvant de partir, elle te souffle : « Je vais dire à Sabine Orsini qu’elle a tort. Elle me doit bien ça. »\n\nElle descend l’échelle sans bruit. Au pied de la falaise, elle ne part pas vers le sud et les cloches. Elle part vers le nord, vers le fleuve et les soldats de la commandante.',
    choix: [
      {
        label: 'Déplier la page',
        effets: {
          objet: ['page_14', 1], document: 'doc_page_14',
          flags: { maud_liberee: true, maud_captive: false },
          journal: 'J’ai libéré Maud. Elle m’a laissé la page quatorze et elle est partie vers la Durance pour parler à la commandante Orsini.',
        },
        suivant: '#fin',
      },
    ],
  },

  maud_tuer: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'À trois heures du matin, tu entres dans la grotte du puits. Maud ne dort pas. Elle te regarde approcher et comprend avant toi ce que tu viens faire.\n\n« Ah, dit-elle simplement. Le patient qui tue son médecin. Un classique. »\n\nElle ne se débat pas. Elle ne crie pas. À la toute fin, elle te prend le poignet. Pas pour t’arrêter : pour prendre ton pouls. Tu la sens compter.\n\n« Cinquante-deux, souffle-t-elle. Tu es en pleine forme. »',
    choix: [
      {
        label: 'Achever Maud',
        effets: {
          flags: { maud_morte: true, tu_as_tue_maud: true, maud_captive: false },
          journal: 'J’ai tué Maud Sérane dans la grotte du puits. Jusqu’au bout, elle a pris mon pouls.',
        },
        suivant: '#fin',
      },
    ],
  },

  maud_film: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: 'Tu lui tends le téléphone pour qu’elle témoigne. Elle se redresse, se recoiffe avec les doigts, ajuste sa blouse. Pour la première fois depuis que tu la connais, elle a l’air d’avoir peur de mal faire.\n\n« Docteure Maud Sérane, cheffe des urgences de l’hôpital de Salon-de-Provence. Nous sommes le… » Elle hésite. « Peu importe. Voici ce que j’ai fait. »\n\nElle parle onze minutes, sans notes, d’une voix de conférencière. Les dates, les doses, les vivants donnés, les échecs. Elle ne s’excuse de rien. À la fin, elle fixe l’objectif longtemps.\n\n« Les morts peuvent revenir. Ce n’est pas une bonne nouvelle. C’est une nouvelle. Faites-en ce que vous voudrez. »',
    choix: [{ label: 'Arrêter l’enregistrement', effets: { flags: { temoignage_maud: true, temoin_extra: true } }, suivant: '#fin' }],
  },

  maud_livrer_berger: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Le Berger veut te voir. Il a des centaines de patients. Deux sur trois reviennent mal. Il veut savoir pourquoi. »\n\nMaud te regarde à travers la grille. Dans ses yeux s’allume quelque chose que tu n’y avais jamais vu, pas même en haut de la tour : de la joie.\n\n« Des centaines », répète-t-elle. « Ouvre. »\n\nNadège attend au pied de la falaise, sans lampe, sa clochette bourrée de chiffon pour qu’elle ne sonne pas. Maud descend l’échelle comme une adolescente qui fait le mur. Elle ne se retourne pas.',
    choix: [
      {
        label: 'Refermer la grille sur la grotte vide',
        effets: {
          flags: { maud_berger: true, maud_captive: false, berger_contourne: true, jour_gagne: true },
          journal: 'J’ai livré Maud au Berger. En échange, il a promis que son troupeau de morts contournerait Calès. Elle est partie heureuse.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── VIEUX-VERNÈGUES ───────────────────────────
  // Déclencheur : entrée dans 'vernegues'.
  ver_arrivee: {
    illu: 'vernegues_ruines', musique: 'sombre',
    texte: 'Le vieux village de Vernègues est mort une première fois le 11 juin 1909, à vingt et une heures dix, pendant le grand tremblement de terre de Provence. Ses habitants sont allés reconstruire plus bas, dans la plaine, avec les pierres de leurs maisons. En haut, il ne reste que ça : des pans de murs, des arches sans plafond, une église sans toit, un château réduit à une seule tour. Des figuiers poussent dans les anciennes cuisines.\n\nCe soir, il y a des bougies partout. Dans les niches, sur les murets, au fond des caves effondrées. Des centaines de bougies. Et des gens, assis entre les ruines, qui mangent, parlent bas, recousent leurs vêtements, jouent aux cartes.\n\nCe sont des gens, pas des morts : tu le vois à leurs gestes. Pourtant, ils sont comme toi. Ils sont revenus.\n\nSur le mur de l’église, en lettres de chaux hautes comme un homme : « UN POUR UN ».',
    choix: [{ label: 'Entrer dans le village en ruine', effets: { cinematique: 'vernegues' }, suivant: 'ver_accueil' }],
  },

  ver_accueil: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: 'La femme en tenue militaire que tu as croisée rue de l’Horloge vient vers toi. Elle a ôté sa clochette. Elle te tend la main : une main froide, aussi froide que la tienne.\n\n« Nadège. Caporal-chef, chargée de la sécurité de la base aérienne 701. Mordue le 5, revenue le 19. » Elle sourit. « Et toi, c’était quand ? »\n\nAutour, les autres ont levé la tête. Ils te regardent sans peur et sans méfiance. Il y a dans leurs yeux quelque chose que tu n’avais vu nulle part depuis ton réveil.\n\nIls te reconnaissent : tu es des leurs.\n\n« Tu sens le froid, dit Nadège. Entre nous, on le sent tous. Les morts aussi, un peu : ils nous reniflent, puis ils passent leur chemin. Viens. Le Berger t’attend. »',
    choix: [{ label: 'Suivre Nadège jusqu’au Berger', effets: { flags: { revenus_rencontres: true, vernegues_visite: true } }, suivant: 'ver_berger' }],
  },

  ver_berger: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: 'Il est assis sur une pierre, devant un feu de sarments, au fond de l’église en ruine. Soixante-dix ans. Un visage ridé comme une noix, une moustache blanche jaunie par le tabac, un chapeau de feutre, une grande cape de laine brune. Un bâton de berger en travers des genoux. À ses pieds, deux chiens couchés — un énorme chien de montagne blanc, un border collie noir — lèvent la tête quand tu approches. Eux sont vivants. Ils remuent la queue.\n\nIl te fait signe de t’asseoir en face de lui et te sert du vin rouge dans un verre à moutarde.\n\n« Baptistin Castagne. Berger. Cinquante-deux fois, j’ai mené mes bêtes à pied de la Crau jusqu’aux montagnes de l’Ubaye, pour l’été. Deux mille bêtes, et jamais plus de dix de perdues. » Il boit. « Cette année, j’ai perdu tout un pays. Alors je le ramène. »\n\nCe troupeau de morts qui a traversé Salon, c’est le sien.',
    choix: [
      { label: 'Objecter : « Ce sont des morts, pas des brebis. »', suivant: 'ver_berger_morts' },
      { label: 'Demander où il emmène les morts', suivant: 'ver_berger_estive' },
      { label: 'Demander ce qu’il te veut', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_morts: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Des morts. » Il hoche la tête, comme si tu disais une chose intéressante mais un peu naïve. « Ma Rose était morte. Mordue le 1er septembre, dans la bergerie, par un gars de la Crau qui cherchait de l’eau. Elle est tombée le soir. Le lendemain, elle marchait. Et le surlendemain… »\n\nIl s’arrête et boit.\n\n« Le surlendemain, elle a trouvé le petit Ruiz, qui passait voir si on avait besoin de quelque chose. Seize ans. Elle l’a mangé dans la cour, sous le mûrier. Tout entier. Je regardais par la fenêtre. Je n’ai rien fait. »\n\nIl repose son verre.\n\n« Douze jours plus tard, elle s’est réveillée dans la paille et elle m’a demandé pourquoi je faisais cette tête. » Il sourit. « Alors ne me dis pas que ce sont des morts. Ce sont des gens qui n’ont pas encore mangé. »',
    choix: [
      { label: 'Demander où il emmène les morts', suivant: 'ver_berger_estive' },
      { label: 'Demander ce qu’il te veut', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_estive: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Au nord. » Il tend la main vers l’obscurité, là où la Durance coule sous les étoiles. « Au premier coup de mistral, l’armée va brûler tout ce qui se trouve au sud du fleuve. Nadège l’a lu à la base. Ils vont brûler mon troupeau comme on brûle des bêtes malades. Alors je passe le fleuve avant le vent. »\n\nIl remue les braises.\n\n« De l’autre côté, il y a le Vaucluse, la Drôme, les Alpes. Des villes où les gens dorment dans leur lit. Des millions de gens qui n’ont rien perdu. » Il te regarde par-dessus les flammes. « Ils ne nous ont pas aidés. Ils nous ont enfermés. Ils ont abattu mon fils à un barrage sur la route 113 parce qu’il avait de la fièvre. C’était une angine. Alors chacun de mes morts mangera un de leurs vivants, et chacun de mes morts reviendra. Un pour un. »\n\nIl sourit. « Chaque été, je mène mes bêtes à l’estive, dans les pâturages de montagne. Celle-là sera juste plus grande. »',
    choix: [
      { label: 'Objecter : « Ce sont des morts, pas des brebis. »', suivant: 'ver_berger_morts' },
      { label: 'Demander ce qu’il te veut', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_toi: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« D’abord parce que tu es des nôtres, et que tu ne le sais pas encore. » Il pose son bâton. « Ensuite parce que tu as vécu chez les vivants. Dans leur château, dans leurs grottes. Tu sais comment ils pensent. »\n\nIl se penche vers toi.\n\n« Et parce que tu connais la médecin. Celle qui tenait le registre. »',
    choix: [
      { label: 'Écouter la suite', si: { flag: 'maud_berger' }, suivant: 'ver_maud_ici' },
      { label: 'Écouter la suite', si: { flag: 'maud_morte' }, suivant: 'ver_berger_marche' },
      { label: 'Écouter la suite', si: { flag: 'maud_liberee' }, suivant: 'ver_berger_marche' },
      { label: 'Écouter la suite', si: { ou: [{ flag: 'maud_captive' }, { flag: 'maud_medecin' }] }, suivant: 'ver_berger_offre' },
    ],
  },

  ver_berger_offre: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Sur trois des miens, deux reviennent mal. Ils se réveillent, ils disent leur nom, et puis la maladie les reprend. Elle, elle saurait pourquoi. Elle a des chiffres, des courbes, un registre. »\n\nIl te tend la main par-dessus le feu. Une main calleuse, tiède. La seule main tiède de tout Vernègues.\n\n« Amène-la-moi. En échange, je te donne ma parole de berger : mon troupeau contournera les grottes de Calès. Tes vivants pourront passer le fleuve sans avoir les morts dans le dos. » Il sourit. « Un pour un. Une médecin contre soixante vivants. C’est un bon prix. »',
    choix: [
      { label: 'Répondre : « J’y réfléchirai. »', effets: { flag: 'berger_offre_maud' }, suivant: 'ver_berger_marche' },
      { label: 'Refuser : « Jamais. »', effets: { flags: { berger_offre_maud: true, berger_refus_maud: true } }, suivant: 'ver_berger_marche' },
    ],
  },

  ver_maud_ici: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Maud',
    texte: '« Elle est déjà ici, dit le Berger. Elle est arrivée hier, à pied. Elle soigne mes ratés, ceux qui reviennent mal. »\n\nIl t’emmène jusqu’à l’entrée d’une cave. En bas, à la lueur de vingt bougies, Maud est à genoux près d’un homme enchaîné qui grogne et claque des dents. Elle prend sa température. Elle note. Les manches relevées, les cheveux attachés, elle a l’air plus vivante que tu ne l’as jamais vue.\n\nElle lève les yeux vers toi.\n\n« Tu vois ? dit-elle simplement. Ici, on me laisse travailler. »',
    choix: [{ label: 'Remonter', suivant: 'ver_berger_marche' }],
  },

  ver_berger_marche: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Et toi, dit le Berger, marche avec nous. Pas derrière : devant. Avec une cloche au cou, comme Nadège. Tu n’auras plus jamais à mentir sur ton bras. Plus jamais à baisser tes manches. »\n\nIl détache de sa ceinture une petite clochette de berger en laiton, cabossée, avec son collier de cuir. Une sonnaille. Il la pose sur la pierre entre vous.\n\n« Réfléchis. On part vers le fleuve quand le vent se lèvera. »',
    choix: [
      {
        label: 'Prendre la sonnaille et rejoindre le troupeau',
        effets: {
          objet: ['sonnaille', 1], flags: { berger_sonnaille: true, vernegues_fait: true },
          quete: ['q_berger', 'rose'],
          journal: 'Vieux-Vernègues : le Berger, Baptistin Castagne, vit avec des « revenus » comme moi. Il veut mener son troupeau de morts de l’autre côté de la Durance, pour que chaque mort mange un vivant et revienne. J’ai pris sa sonnaille.',
        },
        suivant: 'ver_depart',
      },
      {
        label: 'Laisser la sonnaille sur la pierre',
        effets: {
          flags: { berger_refus: true, vernegues_fait: true },
          quete: ['q_berger', 'rose'],
          journal: 'Vieux-Vernègues : le Berger, Baptistin Castagne, vit avec des « revenus » comme moi. Il veut mener son troupeau de morts de l’autre côté de la Durance, pour que chaque mort mange un vivant et revienne. J’ai refusé sa sonnaille.',
        },
        suivant: 'ver_depart',
      },
    ],
  },

  ver_depart: {
    illu: 'vernegues_ruines', musique: 'sombre',
    texte: 'En repartant, tu passes devant la sacristie effondrée. Une petite femme est assise par terre, seule, une énorme cloche de bronze posée entre ses jambes. Elle ne te regarde pas, mais c’est toi qu’elle attend.\n\nC’est Rose, la femme du Berger.',
    choix: [
      { label: 'T’asseoir près de Rose', suivant: 'ver_rose' },
      { label: 'Passer ton chemin', suivant: '#fin' },
    ],
  },

  ver_rose: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'De près, la cloche est plus grosse que sa tête : du bronze cabossé, verdi, un collier de cuir épais comme une ceinture, un battant de fer gros comme un poing. Elle la tient comme on tient un enfant malade.\n\nUne soixantaine d’années. Un visage fin, triste, des yeux très clairs. Elle aussi est revenue.\n\n« Il t’a raconté pour le petit Ruiz ? » Sa voix est très douce. « Il le raconte à tout le monde. Il en est fier. Il dit : “Elle l’a mangé tout entier.” Comme si j’avais fini mon assiette. »',
    choix: [{ label: 'Lui demander : « Et toi, qu’en penses-tu ? »', suivant: 'ver_rose_2' }],
  },

  ver_rose_2: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Moi, je me souviens de son goût. » Elle ne baisse pas la voix. « Je me souviens de tout. Il s’appelait Kylian. Il portait un appareil dentaire et il m’apportait des œufs le dimanche. » Elle caresse la cloche. « Je ne suis pas revenue. On ne revient pas. On repart d’ailleurs, avec quelque chose en moins et quelqu’un en plus. »\n\nElle lève enfin les yeux vers toi.\n\n« Toi aussi, tu as quelqu’un en plus. Je le vois. »',
    choix: [
      { label: 'Lui dire : « Il s’appelait Luc. »', si: { flag: 'lettre_luc_trouvee' }, suivant: 'ver_rose_luc' },
      { label: 'Avouer : « Je ne sais pas qui c’était. »', si: { pasFlag: 'lettre_luc_trouvee' }, suivant: 'ver_rose_3' },
    ],
  },

  ver_rose_luc: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Luc. » Elle répète le prénom, comme pour le ranger quelque part où il ne se perdra pas. « C’est bien que tu saches son nom. Baptistin ne veut pas que je prononce celui de Kylian. Il dit que ça me fait du mal. » Elle sourit. « C’est à lui que ça fait du mal. »',
    choix: [{ label: 'Continuer', suivant: 'ver_rose_3' }],
  },

  ver_rose_3: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Le troupeau suit cette cloche. Pas mon mari : la cloche. On l’appelle le redon. Ça a toujours été comme ça, même avec les brebis : la plus grosse cloche, la plus grave, c’est la voix de la mère. Là où elle va, le troupeau va. » Elle soulève la cloche, avec peine. « Baptistin croit que c’est lui qu’ils suivent. Il a besoin de le croire. »\n\nElle la repose.\n\n« Au fleuve, il va lancer les morts sur les soldats. Et de l’autre côté, il y aura des milliers de Kylian. » Elle te regarde. « Moi, je suis vieille, je suis fatiguée, et je ne peux pas le quitter. Cinquante ans de mariage, tu comprends. Mais toi, tu pourrais la porter. »',
    choix: [
      { label: 'Accepter : « Donne-la-moi. »', suivant: 'ver_rose_promesse' },
      { label: 'Demander : « Qu’est-ce que j’en ferais ? »', suivant: 'ver_rose_choix' },
      { label: 'Refuser : « Je ne veux pas de ta cloche. »', effets: { flag: 'rose_refus' }, suivant: 'ver_rose_refus' },
    ],
  },

  ver_rose_choix: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Ce que tu voudras. » Elle rit doucement. « C’est bien ça, le problème, hein ? Celui qui porte le redon choisit où va le troupeau. Au fleuve, dans le feu, dans la mer, à la montagne. Personne ne devrait avoir ce pouvoir entre les mains. Mais il faut bien que quelqu’un l’ait. »',
    choix: [{ label: 'Accepter : « Donne-la-moi. »', suivant: 'ver_rose_promesse' }, { label: 'Refuser : « Pas moi. »', effets: { flag: 'rose_refus' }, suivant: 'ver_rose_refus' }],
  },

  ver_rose_promesse: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Pas ici. Il te tuerait, et de son point de vue, il aurait raison. » Elle pose sur ta main une main froide. « Au pont de Mallemort. Quand il le faudra. Si tu es là, je te la donne. Et après… »\n\nElle hausse ses maigres épaules.\n\n« Après, le berger, ce sera toi. Onze mille morts te suivront. »',
    choix: [
      {
        label: 'Promettre : « Au pont. »',
        effets: {
          flag: 'rose_promesse', quete: ['q_berger', 'fin'],
          journal: 'Rose, la femme du Berger, porte le redon : la grosse cloche que suit tout le troupeau de morts. Elle me le donnera au pont de Mallemort. Celui qui le porte décide où va le troupeau.',
        },
        suivant: '#fin',
      },
    ],
  },

  ver_rose_refus: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose hoche la tête. Elle ne t’en veut pas. Elle a l’air habituée à ce qu’on ne l’aide pas.\n\n« Alors pars vite, dit-elle. Avant qu’il te redemande. Il demande toujours trois fois. »',
    choix: [{ label: 'Quitter Vernègues', effets: { quete: ['q_berger', 'fin'] }, suivant: '#fin' }],
  },

  rose_film: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose regarde le téléphone comme un animal inconnu. Puis elle se tourne bien en face de l’objectif, et elle parle.\n\n« Je m’appelle Rose Castagne. J’ai soixante-trois ans. Le 3 septembre, j’ai mangé Kylian Ruiz, seize ans, qui m’apportait des œufs le dimanche. Je suis revenue le 16. » Elle s’arrête. « Je voudrais que sa mère le sache. On ne lui a pas pris son fils pour rien. On le lui a pris pour moi. C’est pire. »\n\nElle se tait. Tu arrêtes l’enregistrement. Elle te remercie poliment, comme à la fin d’une visite.',
    choix: [{ label: 'Ranger le téléphone', effets: { flags: { temoignage_rose: true, temoin_extra: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── BA 701 ───────────────────────────
  // Déclencheur : entrée dans 'ba701' si quête à 'ba701'.
  ba_arrivee: {
    illu: 'ba701_tarmac', musique: 'tension',
    texte: 'La base aérienne 701, l’ancienne maison de l’École de l’air et de la Patrouille de France. Au rond-point de l’entrée, un vieil avion d’école, un Fouga Magister, est toujours perché sur son mât, ailes étendues, aux couleurs de la Patrouille. Quelqu’un a grimpé jusqu’à lui et a pendu au bout de l’aile un mannequin en uniforme. Non. Ce n’est pas un mannequin.\n\nDerrière, la base : des kilomètres de grillage, des miradors vides, des bâtiments bas et blancs, des hangars arrondis. La piste, immense, jaune et plate, file jusqu’aux collines. Sur le tarmac, neuf avions de chasse Alphajet bleu-blanc-rouge sont alignés comme pour un meeting aérien, cockpits fermés.\n\nLa barrière du poste de garde est levée. Le poste est vide. Sur le parking, trois cents paires de chaussures militaires sont alignées au cordeau, par pointure, cirées, comme pour une revue. Personne ne sait ce que ça veut dire. Personne n’est resté pour l’expliquer.',
    choix: [
      {
        label: 'Entrer dans la base',
        effets: { cinematique: 'ba701', journal: 'Base aérienne 701. D’après Nadège, la radio est dans l’armoire forte (un coffre blindé) du poste de commandement de la sécurité. La clé est sur l’officier de garde.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'pc_protection' (bâtiment de l'escadron de protection, salle de permanence).
  ba_pc: {
    illu: 'ba701_tarmac', musique: 'tension',
    texte: 'Le poste de commandement de la sécurité de la base. Stores baissés, écrans éteints. Au mur, une carte de la base, couverte de punaises rouges si nombreuses qu’on ne la voit presque plus.\n\nDevant la console, un lieutenant est assis, casque radio sur les oreilles, le dos droit, les mains posées de chaque côté du clavier. On dirait qu’il attend un appel. À son cou pend une clé sur une chaînette, avec une étiquette : « A.F. — ARMOIRE FORTE ».\n\nIl ne bouge pas. Sa poitrine ne se soulève pas. Les mouches, elles, bougent.',
    choix: [
      {
        label: 'Retirer doucement la clé de son cou',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Tu fais passer la chaînette par-dessus le casque, millimètre par millimètre. La tête du lieutenant bascule doucement en avant, sur le clavier, et reste là. Tu as la clé.',
          effets: { objet: ['cle_armoire_forte', 1], xp: { dexterite: 12 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'La chaînette accroche le casque. La main du lieutenant se referme sur ton poignet, ferme, entraînée. Sa tête pivote vers toi avec un craquement de vertèbres. Il est mort, et il se réveille.',
          effets: { combat: { zombies: ['militaire'] } },
          suivant: 'ba_pc_apres',
        },
      },
      { label: 'Le frapper d’abord', effets: { combat: { zombies: ['militaire'] } }, suivant: 'ba_pc_apres' },
    ],
  },

  ba_pc_apres: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Le lieutenant est à terre, le casque radio de travers. La clé a glissé dans son col. Tu la récupères. Sur la console, le voyant d’un micro brille encore, alimenté par une batterie presque morte.',
    choix: [{ label: 'Prendre la clé', effets: { objet: ['cle_armoire_forte', 1] }, suivant: '#fin' }],
  },

  // Marqueur 'armoire_forte' (porte verrouillée : cle_armoire_forte).
  ba_armoire: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'L’armoire forte s’ouvre sur une odeur d’huile et de métal. Les râteliers sont vides : quelqu’un a emporté les fusils et les munitions. Mais sur l’étagère du bas, il reste ce que personne n’a pensé à prendre, parce que ça ne tue personne : une radio militaire en valise, vert olive, avec son combiné et une batterie de rechange. Et un classeur rouge, cadenassé à une chaînette : « AUTHENTIFICATION — DIFFUSION RESTREINTE ». Ce sont les codes pour se faire reconnaître par l’armée.\n\nEn dessous, une chemise cartonnée tamponnée « SECRET », avec une mention au feutre : « À DÉTRUIRE AVANT ÉVACUATION ».\n\nPersonne ne l’a détruite. Il n’y a pas eu d’évacuation.',
    choix: [
      {
        label: 'Prendre la radio et le classeur des codes',
        effets: { objets: [['valise_radio', 1], ['carnet_authentification', 1]], flag: 'ba_materiel' },
        suivant: 'ba_armoire_2',
      },
    ],
  },

  ba_armoire_2: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Tu ouvres la chemise sur place, {accroupi|accroupie} devant l’armoire, la lampe entre les dents.\n\nIl y a deux documents. Le premier s’appelle « CAUTÈRE ». C’est le plan que Maud t’a décrit : au premier jour de mistral, l’armée mettra le feu à tout le pays au sud de la Durance. En haut de la première page, une référence : « RÉF. : RAPPORT DR M. S. (HÔPITAL DE SALON), 08/09 ». Le rapport de Maud Sérane.\n\nLe second document s’appelle « PROTOCOLE R ». Il est plus court. Il parle des « sujets revenus » — les morts qui reviennent à eux, comme toi. Et il explique ce qu’il faut faire des gens qui en ont vu un : les faire taire.\n\nL’armée sait que les morts peuvent revenir. Elle le sait depuis le 8 septembre, grâce à Maud. Et c’est pour ça qu’elle veut tout brûler.',
    choix: [
      {
        label: 'Tout emporter',
        effets: {
          document: 'doc_ordre_cautere',
          flag: 'protocole_r_lu', quete: ['q_traversee', 'contact'],
          journal: 'BA 701 : j’ai la radio et les codes. J’ai aussi trouvé l’ordre « Cautère » : il cite le rapport de Maud du 8 septembre. L’armée sait que les morts peuvent revenir. Elle ne brûle pas le pays malgré ça : elle le brûle à cause de ça.',
        },
        suivant: 'ba_armoire_3',
      },
    ],
  },

  ba_armoire_3: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Tu glisses le « Protocole R » dans le classeur rouge. Tu le reliras plus tard. Ou jamais.\n\nDehors, le vent a tourné. Ce n’est pas encore le mistral. Juste un souffle froid venu du nord, qui fait claquer les drapeaux au mât de la base. Le feu approche.',
    choix: [{ label: 'Quitter la base', effets: { document: 'doc_protocole_r' }, suivant: '#fin' }],
  },

  // Marqueur 'hangar_paf' (hangar de la Patrouille de France).
  ba_hangar: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Le hangar de la Patrouille de France sent le kérosène et la poussière. Un dixième Alphajet est là, en réparation, capot moteur ouvert, verrière relevée.\n\nDans le cockpit, un pilote est attaché à son siège, casque sur la tête. Sur le casque, au pochoir : « ATHOS 6 ». Ses mains sont sur les commandes. Il attendait l’ordre de décoller. Il l’a attendu jusqu’à sa mort, et après.\n\nIl tourne lentement vers toi sa tête alourdie par le casque. Les sangles le retiennent. Il ne peut pas sortir. Il ne pourra jamais sortir.\n\nDans son casier, à côté des combinaisons, il y a une enveloppe.',
    choix: [
      { label: 'Prendre l’enveloppe', effets: { document: 'doc_lettre_pilote' }, suivant: 'ba_hangar_2' },
    ],
  },

  ba_hangar_2: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Athos 6 te regarde lire. Il ne peut rien faire d’autre.',
    choix: [
      { label: 'L’achever à travers le cockpit', effets: { flag: 'athos_acheve', combat: { zombies: ['militaire'] } }, suivant: '#fin' },
      { label: 'Le laisser dans son avion', effets: { flag: 'athos_laisse' }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── L’APPEL ───────────────────────────
  // Marqueur 'antenne_cales' (sommet de la falaise), si valise_radio et carnet_authentification.
  cal_contact: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'La radio',
    texte: 'Au sommet de la falaise de Calès, Lou a tendu l’antenne de la radio entre deux petits chênes. Joëlle est là, avec une dizaine d’autres, accroupis dans un vent qui se lève à peine. Tu règles la fréquence 4. Tu ouvres le classeur rouge à la page du jour et tu lis à voix haute le code de la journée, en articulant, comme à l’école.\n\nUn souffle. Puis une voix de femme. Ce n’est pas un message enregistré : c’est une vraie voix, fatiguée, précise.\n\n« Station inconnue, ici la commandante Orsini. Votre code vient d’une base qui n’existe plus. Vous avez trente secondes pour me donner une raison de ne pas couper. »',
    choix: [
      { label: 'Parler des 60 survivants qui veulent passer', suivant: 'cal_contact_civils' },
      { label: 'Dire que tu as le registre de Maud Sérane', si: { objet: 'registre_protocole' }, effets: { flag: 'orsini_sait_registre' }, suivant: 'cal_contact_registre' },
      { label: 'Avouer que tu es mort, puis revenu', effets: { flag: 'orsini_sait' }, suivant: 'cal_contact_revenu' },
    ],
  },

  cal_contact_registre: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: '« Sérane. » Le silence change de nature. « Ne lisez rien de ce registre sur cette fréquence. Rien. Vous m’entendez ? Rien. »\n\nTu l’entends respirer. Tu l’entends réfléchir. Elle sait ce que contient ce registre.',
    choix: [{ label: 'Attendre sa réponse', suivant: 'cal_contact_civils' }],
  },

  cal_contact_revenu: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: '« Mon cœur s’est arrêté le 6 septembre. Il est reparti. » Autour de toi, les gens de Calès qui ne savaient pas se figent. Lou baisse les yeux.\n\nOrsini se tait pendant dix secondes. Puis, très bas :\n\n« Ne dites plus jamais ça sur une fréquence ouverte. Plus jamais. »\n\nElle ne semble pas surprise.',
    choix: [{ label: 'Attendre sa réponse', suivant: 'cal_contact_civils' }],
  },

  cal_contact_civils: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: 'Derrière elle, tu entends des voix, un téléphone qui sonne, une tasse qu’on pose. Une vie de bureau. Le monde d’avant, à vingt kilomètres.\n\n« Écoutez-moi bien, je ne répéterai pas. Au premier jour de mistral, à l’aube, le pont suspendu de Mallemort sera ouvert pendant une heure. Les soldats contrôleront chaque personne, une par une : les bras, le cou, les jambes. Toute morsure, toute blessure inexpliquée : refusé. Quiconque force le passage : abattu. Après cette heure, il n’y aura plus de pont. »\n\nUn silence.\n\n« Et si la docteure Maud Sérane est vivante et avec vous, je la veux. Vivante. Terminé. »',
    choix: [
      {
        label: 'Couper la radio',
        effets: {
          flag: 'orsini_contact', quete: ['q_traversee', 'depart'],
          journal: 'Orsini : à l’aube du premier jour de mistral, le pont suspendu de Mallemort sera ouvert une heure. Les soldats vérifieront les bras de chacun : toute morsure sera refusée. Elle veut Maud vivante.',
        },
        suivant: 'cal_contact_fin',
      },
    ],
  },

  cal_contact_fin: {
    illu: 'cales_falaises', musique: 'calme', orateur: 'Joëlle',
    texte: 'Personne ne parle. Joëlle regarde vers le nord.\n\nUn vieux de Lamanon — Fernand, quatre-vingt-quatre ans, une hanche en titane — lèche son index et le lève en l’air, comme on faisait avant les applis météo.\n\n« Demain soir, il sera là. Ou après-demain. Ça se sent. Le vent a tourné sur le Ventoux. » Il parle du mistral.\n\n« On part dès qu’il se lève, dit Joëlle. Tout le monde prépare son sac. Pas plus de dix kilos. » Elle te regarde. « Tu nous diras quand tu seras {prêt|prête}. »',
    choix: [{ label: 'Descendre de la falaise', suivant: '#fin' }],
  },

  // ─────────────────────────── UN JOUR DE PLUS ───────────────────────────
  // Marqueur 'martelliere_canal' (en bas du village, prise du canal de Craponne).
  cal_martelliere: {
    illu: 'cales_falaises', musique: 'calme',
    texte: 'En bas du village, le canal de Craponne passe sous un petit pont de pierre, entre deux rangées de roseaux. Une grosse vanne de fonte, avec son grand volant — une martelière —, permet d’envoyer l’eau du canal vers la plaine. Une plaque rouillée : « CANAL DE CRAPONNE — PRISE DU PERTUIS ».\n\nSi tu ouvres la vanne en grand, l’eau quittera le canal et inondera les champs et le chemin du troupeau, là où les morts doivent passer. En une nuit, ce sera un marécage. Les morts marchent mal dans la boue. Parfois, ils se noient dans cinquante centimètres d’eau, parce qu’ils ne pensent pas à relever la tête. Le troupeau perdrait un jour.\n\nMais la citerne de Calès se remplit par la même vanne. Plus d’eau dans les champs, c’est moins d’eau pour les grottes.',
    choix: [
      {
        label: 'Ouvrir la vanne pour inonder le chemin',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: 'Le volant résiste, grince, puis tourne. L’eau quitte le canal avec un bruit de torrent et s’étale dans la nuit, sur les vergers, sur la route, sur le chemin du troupeau. Au matin, la plaine est un miroir.\n\nLe troupeau est retardé. Tu as gagné un jour de plus.',
          effets: { flags: { delai_canal: true, citerne_basse: true, jour_gagne: true }, xp: { force: 10 }, quete: ['q_jour_de_plus', 'debut'] },
          suivant: '#fin',
        },
        echec: {
          texte: 'Le volant est grippé. Il te faut une heure, une barre de fer comme levier et tes dernières forces pour lui faire faire un quart de tour. Puis un autre. L’eau finit par partir, en grondant.\n\nLe troupeau est retardé : un jour de plus. Tu ne sens plus tes bras.',
          effets: { flags: { delai_canal: true, citerne_basse: true, jour_gagne: true }, sta: -40, fatigue: -20, quete: ['q_jour_de_plus', 'debut'] },
          suivant: '#fin',
        },
      },
      { label: 'Laisser l’eau à Calès', suivant: '#fin' },
    ],
  },

  // ─────────────────────────── SÉNAS ───────────────────────────
  sen_arrivee: {
    illu: 'senas_station', musique: 'sombre',
    texte: 'Sénas, ce sont des vergers à perte de vue : des pommiers en rangs serrés sous des filets anti-grêle noirs, tendus comme des voiles de deuil sur toute la plaine. Les fruits sont tombés. Ils pourrissent par milliers dans l’herbe. L’air sent le cidre et les guêpes.\n\nLe village semble vide. Pourtant, sur le mur de la coopérative fruitière, quelqu’un a peint à la bombe rouge une flèche et un mot : « NON ».\n\nAu bout de la grand-rue se dresse le clocher de l’église. Si sa cloche sonne, toute la plaine l’entendra. Le troupeau aussi.',
    choix: [{ label: 'Explorer le village', effets: { quete: ['q_jour_de_plus', 'debut'] }, suivant: '#fin' }],
  },

  // Marqueur 'porte_chambre_froide' (station fruitière).
  sen_station: {
    illu: 'senas_station', musique: 'tension', orateur: 'Une voix',
    texte: 'La coopérative fruitière est un grand hangar de tôle, froid et sombre, plein de grandes caisses de bois où l’on stockait les pommes. Au fond, il y a la porte d’une chambre froide. Épaisse, isolée, sans poignée de ce côté.\n\nTu frappes. Rien. Tu frappes encore.\n\nUne voix répond, étouffée par vingt centimètres d’isolant : « Allez-vous-en. On n’ouvre pas. On ne vous connaît pas. »',
    choix: [{ label: 'Prévenir : « Le troupeau sera ici dans deux jours. »', suivant: 'sen_station_2' }],
  },

  sen_station_2: {
    illu: 'senas_station', musique: 'sombre', orateur: 'Imbert',
    texte: 'Un silence. Puis un verrou claque, et la porte s’entrouvre de dix centimètres. Un visage d’homme de soixante-dix ans, casquette de coopérative, barbe blanche. Derrière lui, dans le noir glacé, des yeux. Beaucoup d’yeux. Des enfants.\n\n« Imbert, dit-il. On est onze. Mes petits-enfants, ma belle-fille, les voisins. Les morts sont passés deux fois depuis le début. Les deux fois, on a fermé, on a éteint, on a retenu notre souffle, et ils sont passés devant sans nous voir. Ce frigo, c’est une tombe. C’est ce qui nous a sauvés. »\n\nIl te regarde.\n\n« On ne bouge pas. »',
    choix: [
      {
        label: 'Les convaincre de venir à Calès passer la Durance',
        test: { chance: 0.5 },
        reussite: {
          texte: 'Imbert regarde longuement ses petits-enfants. Puis il enlève sa casquette et se gratte la tête.\n\n« La Durance… Ma femme est enterrée à Cavaillon, de l’autre côté. Ça fait trente ans que je dis que je la rejoindrai. » Il remet sa casquette. « Donnez-nous une heure pour faire les sacs. »',
          effets: { flags: { senas_rencontres: true, senas_rejoints: true } },
          suivant: '#fin',
        },
        echec: {
          texte: '« Non. » La porte se referme de cinq centimètres. « Vous êtes {gentil|gentille}. Mais dehors, les gentils sont tous morts. »\n\nLe verrou claque.',
          effets: { flags: { senas_rencontres: true, senas_restent: true } },
          suivant: '#fin',
        },
      },
      { label: 'Les laisser : « Alors restez. Et ne respirez pas. »', effets: { flags: { senas_rencontres: true, senas_restent: true } }, suivant: '#fin' },
    ],
  },

  // Marqueur 'corde_clocher' (clocher de l'église de Sénas).
  sen_cloches: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Dans le clocher de Sénas, la corde de la cloche pend jusqu’au sol, effilochée, raide de crasse. Il n’y a qu’une cloche, là-haut, et pas bien grosse. Mais la plaine est plate et le son porte loin : de Lamanon jusqu’à la Durance, tous les morts l’entendront.\n\nSi tu sonnes, le troupeau va changer de route. Il va descendre vers Sénas et sa cloche, au lieu de monter tout droit vers les grottes de Calès. Un jour de détour, gagné pour Calès.\n\nMais il passera aussi devant la coopérative fruitière, et sa chambre froide. Pendant des heures.',
    choix: [
      { label: 'Sonner la cloche', si: { flag: 'senas_rejoints' }, suivant: 'sen_sonner_vide' },
      { label: 'Sonner la cloche', si: { flag: 'senas_restent' }, suivant: 'sen_sonner_imbert' },
      { label: 'Sonner la cloche', si: { pasFlag: 'senas_rencontres' }, suivant: 'sen_sonner_inconnu' },
      { label: 'Lâcher la corde sans sonner', suivant: '#fin' },
    ],
  },

  sen_sonner_vide: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu tires. Là-haut, la cloche s’ébranle. Sa voix roule sur les vergers, sur les filets noirs, sur les pommes pourries, jusqu’au pied des collines.\n\nLa coopérative est vide : les Imbert sont déjà sur la route de Calès, avec leurs sacs et leurs enfants. Le troupeau ne trouvera personne ici. Tu sonnes seulement pour gagner du temps.\n\nUn jour de plus. Gratuit. Le seul de toute cette histoire.',
    choix: [{ label: 'Descendre du clocher en courant', effets: { flags: { delai_senas: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  sen_sonner_imbert: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu penses à la porte de la chambre froide. Aux onze paires d’yeux dans le noir. À la phrase d’Imbert : « Ils sont passés devant sans nous voir. »\n\nTu sonnes.\n\nLa voix de la cloche roule sur la plaine. Très loin au sud, contre le vent, la grande cloche du troupeau répond. Le troupeau a entendu. Il vient.\n\nUn jour de plus pour Calès. Pour la famille Imbert, une troisième fois les morts devant leur porte. Tu ne sauras jamais si elle aura tenu.',
    choix: [{ label: 'Descendre du clocher en courant', effets: { flags: { delai_senas: true, senas_sonne_sur_eux: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  sen_sonner_inconnu: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu tires. La cloche s’ébranle, et sa voix roule sur les vergers, sur les filets noirs, jusqu’au pied des collines. Le troupeau va venir ici.\n\nEn descendant, tu passes devant la coopérative fruitière. Derrière la tôle, tu entends quelque chose que tu prends d’abord pour le vent. Des voix. Une voix d’enfant qui demande pourquoi ça sonne. Il y avait des vivants cachés ici.\n\nTu ne t’arrêtes pas. Il est trop tard.',
    choix: [{ label: 'Quitter Sénas', effets: { flags: { delai_senas: true, senas_sonne_sur_eux: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  // ─────────────────────────── LE TÉMOIGNAGE ───────────────────────────
  // Via le dialogue de Lou à Calès, si 'telephone_charge'.
  cal_temoignage: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Lou tient ton téléphone à deux mains, à l’horizontale, comme une pro. Derrière toi, la paroi de pierre jaune et une bougie. Batterie : 19 %.\n\n« L’idée, c’est que le monde entier sache ce qui se passe ici. Tu regardes l’objectif, pas moi. Tu dis ton nom, la date, et tu racontes. Sans en rajouter. D’habitude, les gens décrochent au bout de trente secondes, mais toi, tu n’auras pas besoin d’en rajouter. » Elle appuie. Le point rouge s’allume. « Vas-y. »',
    choix: [
      { label: 'Tout raconter, y compris Luc', effets: { flags: { temoignage_filme: true, temoignage_luc: true } }, suivant: 'cal_temoignage_fin' },
      { label: 'Tout raconter, sauf Luc', effets: { flag: 'temoignage_filme' }, suivant: 'cal_temoignage_fin' },
      { label: 'Renoncer à témoigner', suivant: '#fin' },
    ],
  },

  cal_temoignage_fin: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Tu parles dix minutes. Tu montres ton bras à la caméra. Si tu as encore le registre de Maud, tu en filmes les pages une par une, pendant que Lou tient la lampe.\n\nQuand le point rouge s’éteint, Lou regarde la batterie : 6 %.\n\n« De l’autre côté du fleuve, il y aura du réseau, dit-elle. Une barre, peut-être deux. Assez pour l’envoyer au monde entier. » Elle te rend le téléphone. « Après, c’est toi qui décides. »',
    choix: [
      {
        label: 'Éteindre le téléphone',
        effets: { quete: ['q_temoignage', 'fin'], journal: 'J’ai filmé mon témoignage avec Lou. De l’autre côté de la Durance, il y aura du réseau pour l’envoyer au monde entier.' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA VEILLE ───────────────────────────
  // Via le dialogue de Joëlle (« On part à l'aube »), exige 'vernegues_fait'.
  ch2_veille: {
    illu: 'cales_falaises', musique: 'calme',
    texte: 'La dernière nuit à Calès, personne ne dort. Quelqu’un a sorti une guitare à laquelle il manque une corde. On chante des chansons que tout le monde connaît à moitié : de la variété des années quatre-vingt, du rap marseillais que les enfants de l’Empéri savent par cœur, et un vieux chant de Noël provençal que les anciens de Lamanon chantent les yeux fermés et que les jeunes apprennent en riant.\n\nClémence s’est endormie contre sa mère. Lou, assise à côté de toi, dessine. Tu ne regardes pas ce qu’elle dessine. Tu le sais.\n\nVers trois heures, les chansons s’arrêtent d’un coup. Tout le monde lève la tête.\n\nEn haut de la falaise, les feuilles des chênes se sont mises à bruisser.\n\nC’est le mistral. Il arrive du nord, par la vallée du Rhône, sec et froid, et il ne va plus s’arrêter. Pour l’armée, c’est le signal : demain, elle mettra le feu.',
    choix: [
      {
        label: 'Te lever',
        effets: {
          flag: 'mistral_leve', quete: ['q_traversee', 'fin'], cinematique: 'le_mistral',
          journal: 'Le mistral s’est levé cette nuit. L’armée va mettre le feu au pays. À l’aube, Calès part pour le pont de Mallemort.',
        },
        suivant: 'fin_depart',
      },
    ],
  },
};
