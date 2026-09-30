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
    texte: 'Le cirque de Calès s’ouvre au-dessus de Lamanon comme une bouche de pierre. Deux falaises de safre jaune, trouées de haut en bas de grottes creusées à la main il y a huit cents ans : des fenêtres carrées, des escaliers taillés dans la roche, des rigoles, des niches à pigeons. Dans les trous, des feux. Du linge. Des visages.\n\nUne échelle de corde descend du premier niveau. En haut, une femme t’attend, les bras croisés. Cinquante ans, solide, cheveux gris coupés court, un gilet de guide sur un tee-shirt délavé — GROTTES DE CALÈS, RÉOUVERTURE AVRIL 2025. Une carabine à plomb en bandoulière.\n\nDerrière elle, les gamins de l’Empéri, déjà arrivés, déjà nourris, qui te font des signes.\n\n« Montre tes bras », dit la femme. Puis, avant que tu obéisses, plus doucement : « Pardon. C’est la règle. Je m’appelle Joëlle. Ici, tout le monde m’appelle Jo. »',
    choix: [
      { label: 'Montrer la brûlure', si: { flag: 'cicatrice_brulee' }, suivant: 'cal_bras_ok' },
      { label: 'Montrer le bandage', si: { flag: 'bras_bande' }, suivant: 'cal_bras_ok' },
      { label: 'Montrer la morsure', si: { flag: 'bras_nu' }, suivant: 'cal_bras_morsure' },
      { label: 'Montrer tes bras', si: { pasFlag: 'bras_decide' }, suivant: 'cal_bras_morsure' },
    ],
  },

  cal_bras_ok: {
    illu: 'cales_falaises', musique: 'calme', orateur: 'Joëlle',
    texte: 'Joëlle regarde à peine. Elle regarde surtout les gamins de l’Empéri, qui parlent tous en même temps : la nuit des cloches, la poterne, toi.\n\n« Ils disent que sans toi, ils seraient tous morts. » Elle se pousse pour te laisser l’échelle. « Ça me suffit pour aujourd’hui. Monte. On a de la soupe. »',
    choix: [{ label: 'Monter', effets: { flag: 'cales_arrivee' }, suivant: 'cal_insuline' }],
  },

  cal_bras_morsure: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Joëlle',
    texte: 'Joëlle regarde la morsure cicatrisée. Longtemps. Les carabines se sont levées sur les corniches.\n\nC’est Lou qui parle, du haut de l’échelle. « C’est comme ça depuis le début. On a dormi à côté, au château. Il se passe rien. »\n\n« Une morsure qui a guéri. » Joëlle secoue la tête, lentement, comme devant une vache à deux têtes. « Tu dors à part, en haut, dans la grotte du guetteur. Tu ne touches pas aux enfants. Et si tu as de la fièvre, un jour, une seule fois, tu sautes. D’accord ? »',
    choix: [{ label: '« D’accord. »', effets: { flags: { cales_arrivee: true, cales_mefiance: true } }, suivant: 'cal_insuline' }],
  },

  cal_insuline: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Dans la première grotte, il fait chaud et ça sent la soupe de pois chiches, la fumée et les gens. Une petite fille est assise sur une caisse, une couverture sur les épaules. Neuf ans. Des cheveux blonds tirés en queue de cheval, des cernes violets, une pâleur qui n’est pas celle de la peur. Elle serre un lecteur de glycémie éteint comme une peluche.\n\n« Clémence », dit Joëlle. « Ma fille. Diabétique. Il lui reste un stylo d’insuline, qu’on coupe en quarts depuis dix jours. » Elle le dit très vite, pour que ça passe. « Son père est parti à Salon en chercher le 10 septembre. Il n’est pas revenu. »\n\nClémence te regarde.\n\n« T’as vu mon papa, à Salon ? »',
    choix: [
      { label: 'Sortir la boîte d’insuline', si: { objet: 'insuline_luc' }, suivant: 'cal_insuline_donnee' },
      { label: '« Non. »', suivant: 'cal_insuline_non' },
    ],
  },

  cal_insuline_non: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Clémence hoche la tête, sérieusement, et retourne à son lecteur. Joëlle pose la main sur sa tête.\n\n« L’hôpital de Salon, dit-elle. Luc voulait passer par la pharmacie du cours, et si elle était vide, par l’hôpital. Si un jour tu retournes là-bas… »\n\nElle ne finit pas.',
    choix: [{ label: 'Continuer', suivant: 'cal_jo_plan' }],
  },

  cal_insuline_donnee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu poses la boîte sur la caisse, à côté de Clémence. Quatre stylos d’insuline. Sur le couvercle, au feutre, l’écriture serrée et penchée de Maud : ARNAUD — À RENDRE.\n\nJoëlle ne bouge plus.\n\nElle prend la boîte. Elle lit le nom. Elle le lit deux fois. Puis elle serre la boîte contre son ventre, et elle se met à pleurer, sans bruit, debout, la bouche ouverte, et tout le monde dans la grotte fait semblant de ne pas voir.\n\n« C’est Luc », dit-elle enfin. « C’est Luc qui les a trouvées. Il les a trouvées. » Elle rit dans ses larmes. « Où ? Où tu les as eues ? »\n\nClémence tire sur ta manche.\n\n« Il est où, mon papa ? »',
    choix: [
      {
        label: '« À l’hôpital de Salon. Je n’ai trouvé que ses affaires. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_luc_hopital',
      },
      {
        label: '« Je ne sais pas. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_luc_mensonge',
      },
      {
        label: '« C’est moi qui l’ai mangé. »',
        effets: { objet: ['insuline_luc', -1], flag: 'insuline_donnee' },
        suivant: 'cal_aveu_precoce',
      },
    ],
  },

  cal_luc_hopital: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« L’hôpital… » Joëlle s’accroche au mot comme à une branche. « Il était blessé, alors. Il est allé se faire soigner. » Elle s’essuie le visage avec l’avant-bras. « Il avait laissé quelque chose ? Un mot ? »',
    choix: [
      { label: 'Lui donner l’enveloppe « Pour Jo »', si: { objet: 'lettre_luc' }, suivant: 'cal_lettre_donnee' },
      { label: '« Non. Rien. »', suivant: 'cal_lettre_gardee' },
    ],
  },

  cal_luc_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Tu ne sais pas. » Joëlle hoche la tête. Elle regarde la boîte, le nom au feutre, l’écriture de quelqu’un d’autre. « Quelqu’un les a gardées pour lui. Quelqu’un a écrit « à rendre ». Ça veut dire qu’il comptait revenir les chercher, non ? Ça veut dire ça. »\n\nTu ne réponds pas. Tu sens l’enveloppe dans ton sac comme une pierre chaude.',
    choix: [{ label: 'Continuer', effets: { flag: 'lettre_gardee' }, suivant: 'cal_jo_plan' }],
  },

  cal_lettre_gardee: {
    illu: 'cales_grande_salle', musique: 'sombre',
    texte: 'Tu dis non. Tu le dis bien, sans ciller. Tu as appris à mentir quelque part entre la housse et ici.\n\nL’enveloppe reste dans ton sac, contre le registre. Elles se tiennent compagnie.',
    choix: [{ label: 'Continuer', effets: { flag: 'lettre_gardee' }, suivant: 'cal_jo_plan' }],
  },

  cal_lettre_donnee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu lui tends l’enveloppe. POUR JO.\n\nElle l’ouvre avec l’ongle du pouce, lentement, pour ne pas l’abîmer. Elle lit debout. Tu regardes ses yeux descendre les lignes, remonter, redescendre. Tu sais ce qu’il y a dedans. La phrase sur la jambe. La phrase sur la docteure qui s’occupe bien de lui. La dernière ligne.\n\nJoëlle replie la lettre et la glisse sous son tee-shirt, contre sa peau.\n\n« Il dit qu’une docteure s’occupe de lui », dit-elle. « Il dit qu’il rentre dès qu’il pourra marcher. » Elle te regarde, et ses yeux sont pleins d’un espoir si nu que tu voudrais qu’elle te frappe. « Il est peut-être encore là-bas. Blessé. Quelque part. Tu crois ? »',
    choix: [
      { label: '« Peut-être. »', effets: { objet: ['lettre_luc', -1], flags: { lettre_donnee: true, espoir_donne: true } }, suivant: 'cal_jo_plan' },
      { label: '« Je ne crois pas, Jo. »', effets: { objet: ['lettre_luc', -1], flag: 'lettre_donnee' }, suivant: 'cal_pas_espoir' },
      { label: '« Jo… C’est moi qui l’ai mangé. »', effets: { objet: ['lettre_luc', -1], flag: 'lettre_donnee' }, suivant: 'cal_aveu_precoce' },
    ],
  },

  cal_pas_espoir: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle ferme les yeux. Elle hoche la tête, une fois, et quelque chose se referme en elle, une porte, doucement, sans claquer.\n\n« Je sais », dit-elle. « Je le sais depuis le 12. Je voulais juste que quelqu’un d’autre le dise. » Elle prend Clémence par la main. « Viens, ma puce. On va faire ta piqûre. Avec la vraie insuline de papa. »',
    choix: [{ label: 'Continuer', suivant: 'cal_jo_plan' }],
  },

  cal_aveu_precoce: {
    illu: 'cales_grande_salle', musique: 'sombre',
    texte: 'Les mots sortent avant toi. Ils sont petits, ils sont plats, ils ne font pas de bruit en tombant.\n\nJoëlle ne comprend pas. Tu le redis, avec d’autres mots : l’hôpital, la morsure, la housse, la docteure, la cloche, un homme sur un brancard avec une attelle, qui ne criait pas, qui disait « Jo ».\n\nClémence a lâché ta manche.\n\nJoëlle pose la boîte d’insuline sur la caisse, très doucement, comme si elle pouvait exploser. Puis elle te gifle. Une fois, à toute volée, main ouverte. Ta tête part sur le côté et tu as le goût du sang.\n\nElle ne te gifle pas une deuxième fois. Elle prend sa fille dans ses bras et sort de la grotte sans un mot. Personne ne te regarde. Personne ne te parle, jusqu’au soir.',
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
    texte: 'Elle revient à la nuit. Elle s’assoit à trois mètres de toi, au bord de la corniche, les jambes dans le vide.\n\n« Luc aurait voulu que je sois juste. » Elle parle aux toits de Lamanon, pas à toi. « Moi, je voudrais te pousser. Là. Ce serait facile, ce serait trois secondes. » Un temps. « On va faire comme Luc. »\n\nElle se relève.\n\n« Tu restes. Pas pour toi. Parce qu’on doit passer la Durance et que tu sais des choses. Tu nous fais traverser. Après, je ne veux plus jamais voir ta figure. »\n\nElle s’en va. Puis elle s’arrête, sans se retourner.\n\n« La docteure. Celle qui te l’a donné à manger. Elle est ici ? »',
    choix: [
      { label: '« Oui. Elle est ici. »', effets: { flags: { maud_captive: true, maud_medecin: false } }, suivant: 'cal_jo_plan_froid' },
    ],
  },

  cal_jo_plan_froid: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle fait attacher Maud dans la nuit, sans explication, dans la grotte du puits. Personne ne pose de question : quand Jo a cette tête-là, on ne pose pas de question.\n\nAu matin, elle déplie une carte routière sur une caisse, devant tout le monde, et elle parle à la carte, pas à toi.\n\n« Au sud, ce qui monte : huit, dix mille, avec des cloches. Au nord, la Durance, et l’armée qui tire sur tout ce qui approche des ponts. Le plus proche, c’est Mallemort. » Son doigt s’arrête sur le fleuve. « Quelqu’un doit aller voir. Quelqu’un qu’on peut perdre. »',
    choix: [
      {
        label: '« J’y vais. »',
        effets: {
          quete: ['q_traversee', 'mallemort'], decouvrir: ['mallemort'],
          journal: 'J’ai dit la vérité à Jo : j’ai mangé Luc. Elle me garde pour passer la Durance. Je vais voir le pont de Mallemort.',
        },
        suivant: '#fin',
      },
    ],
  },

  cal_jo_plan: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: 'Plus tard, dans la grotte du conseil, Joëlle déplie une carte routière sur une caisse et pose une bougie dessus.\n\n« On est coincés. Au sud, ce qui monte : les gamins disent huit, dix mille, avec des cloches. Au nord, la Durance. L’armée tient les ponts et tire sur tout ce qui approche. » Son doigt descend le fleuve. « Le plus proche, c’est Mallemort. Il y a le pont de la route et le vieux pont suspendu. Personne n’est allé voir depuis des jours. »\n\nElle lève les yeux vers toi.\n\n« Toi, tu as l’air de quelqu’un qui revient de partout. »',
    choix: [
      {
        label: '« J’y vais. »',
        effets: {
          quete: ['q_traversee', 'mallemort'], decouvrir: ['mallemort'],
          journal: 'Calès : une soixantaine de vivants dans les grottes, menés par Joëlle — Jo. Le troupeau monte vers le pertuis de Lamanon. Il faut passer la Durance. Je vais voir le pont de Mallemort.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── MALLEMORT — RECONNAISSANCE ───────────────────────────
  // Déclencheur : entrée dans 'mallemort' si quête à 'mallemort'.
  mal_arrivee: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'La Durance, enfin. Large, grise, tressée de bancs de galets blancs et de saulaies, avec son eau couleur de ciment qui descend des Alpes à toute vitesse. Deux ponts la traversent ici.\n\nLe pont routier, en béton, droit, moderne. Il est fermé à mi-longueur par un mur de conteneurs maritimes empilés sur deux étages, couronné de barbelés. Contre les conteneurs, des voitures calcinées, en tas, comme des jouets balayés.\n\nEt à côté, le vieux pont suspendu : deux paires de pylônes de pierre en forme d’arc de triomphe, des câbles d’acier qui descendent en courbes, un tablier étroit de planches neuves, restauré pour les promeneurs et les vélos. Il est ouvert. Rien ne le bloque. Au milieu, peint en rouge sur les planches, en lettres de deux mètres : 200 M. Plus loin, sur la rive nord, des sacs de sable sous des filets de camouflage, et des reflets de jumelles.\n\nSur les planches, entre la rive sud et le 200 M rouge, il y a des corps. Une vingtaine. Pas des morts : des gens. Des valises, un caddie, un vélo d’enfant.',
    choix: [{ label: 'Approcher', suivant: '#fin' }],
  },

  // Déclencheur : marqueur (zone) 'ligne_200m' sur le pont suspendu.
  mal_ligne: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Le haut-parleur',
    texte: 'Tu as fait trois pas sur les planches quand un haut-parleur grésille sur la rive nord. Une voix d’homme, jeune, sans colère :\n\n« Individu sur le pont suspendu, vous êtes dans la zone. Faites demi-tour immédiatement. Ceci est la seule sommation. »\n\nLe pont bouge un peu sous tes pieds, suspendu, vivant. Les câbles chantent dans l’air.',
    choix: [
      {
        label: 'Faire demi-tour',
        effets: { flag: 'mal_reco_faite', quete: ['q_traversee', 'retour'], journal: 'Mallemort : l’armée tient la rive nord. Le pont routier est muré, le pont suspendu est ouvert mais ils tirent au-delà de la marque des 200 mètres.' },
        suivant: '#fin',
      },
      { label: 'Lever les mains et crier que tu veux parler', suivant: 'mal_crier' },
      { label: 'Avancer encore', suivant: 'mal_tir' },
    ],
  },

  mal_crier: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Le haut-parleur',
    texte: '« On vient de Calès ! On est soixante ! Des enfants ! On veut parler à la commandante Orsini ! »\n\nUn silence. Le vent dans les câbles. Puis la voix, plus lente, comme quelqu’un qui lit :\n\n« Le PC Durance ne traite pas avec les civils non authentifiés. Aucun franchissement n’est autorisé. Faites demi-tour. »\n\nPuis, après un clic, une autre voix, plus basse, qui ne devait sans doute pas passer dans le haut-parleur : « …s’ils ont une radio, qu’ils appellent sur la 4, avec l’authentification. Coupe, coupe — »\n\nClic.',
    choix: [
      {
        label: 'Reculer',
        effets: {
          flags: { mal_reco_faite: true, frequence_4: true }, quete: ['q_traversee', 'retour'],
          journal: 'Mallemort : l’armée tient la rive nord et tire au-delà des 200 mètres. Un soldat a laissé échapper : « la fréquence 4, avec l’authentification ». Il nous faut une radio militaire et des codes.',
        },
        suivant: '#fin',
      },
    ],
  },

  mal_tir: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Le coup de feu part avant que ton pied touche la planche suivante. Tu ne l’entends même pas : tu le reçois. Un coup de marteau dans le haut du bras, qui te fait tourner sur toi-même, et les planches qui montent à ta rencontre.\n\nTu rampes jusqu’à la rive sud, lentement, en laissant une trace. Personne ne tire une deuxième fois. Ils n’ont pas besoin.',
    choix: [
      {
        label: 'Ramper jusqu’à la rive',
        effets: {
          blessure: { type: 'profonde', zone: 'au bras' }, pv: -30,
          flags: { mal_reco_faite: true, frequence_4: true }, quete: ['q_traversee', 'retour'],
          journal: 'Mallemort : ils m’ont tiré dessus au-delà des 200 mètres. Pour leur parler, il faudra une radio militaire et des codes.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LE PROCÈS ───────────────────────────
  // Déclencheur : entrée dans 'cales' si quête à 'retour'.
  cal_retour: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu rends compte à Joëlle, debout, devant tout le monde : le mur de conteneurs, les corps sur les planches, le 200 M rouge, la voix du haut-parleur. Une radio militaire. Un code.\n\n« Rien que ça », dit Joëlle.\n\nLou lève la main, comme en classe. « La base aérienne. La 701. Ils ont forcément des radios, là-bas. Et des codes. »\n\nIl y a un murmure. La BA 701, c’est au sud de Salon, en plein dans la zone, là où plus personne ne va.\n\nEt puis Joëlle se tourne vers le fond de la grotte, et sa voix change.\n\n« Mais d’abord, on a autre chose à régler. »',
    choix: [
      { label: 'Suivre son regard', si: { flag: 'aveu_precoce' }, suivant: 'cal_proces_a' },
      { label: 'Suivre son regard', si: { flag: 'maud_captive', pasFlag: 'aveu_precoce' }, suivant: 'cal_proces_b' },
      { label: 'Suivre son regard', si: { flag: 'maud_medecin', pasFlag: 'aveu_precoce' }, suivant: 'cal_proces_c' },
    ],
  },

  cal_proces_a: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La grande salle est une grotte haute comme une église, taillée dans le safre par des gens morts au quatorzième siècle. Ce soir, elle est pleine. Des torches. Des lampes frontales. L’odeur de la cire et de la peur.\n\nAu milieu, sur un tabouret, les poignets attachés, Maud.\n\nJoëlle ne s’assoit pas. Elle ne crie pas. Elle parle comme on lit une liste de courses.\n\n« Luc Arnaud. Cinquante et un ans. Électricien. Il avait une jambe cassée, et vous l’avez donné à manger. » Elle te désigne sans te regarder. « Cette personne-là me l’a dit. Au moins, elle, elle me l’a dit. »\n\nMaud te regarde. Il y a une espèce de respect dans ses yeux. Et de la fatigue.',
    choix: [{ label: 'Écouter Maud', suivant: 'cal_maud_defense' }],
  },

  cal_proces_b: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La grande salle est une grotte haute comme une église, taillée dans le safre par des gens morts au quatorzième siècle. Ce soir, elle est pleine. Quarante personnes de Calès, vingt de l’Empéri, assises par terre, debout contre les parois, des enfants sur les épaules. Des torches. L’odeur de la cire et de la peur.\n\nAu milieu, sur un tabouret, les poignets attachés, Maud.\n\nLes gamins de l’Empéri ont raconté Samir. Hugo a lu la ligne du registre à voix haute. Et puis Théo — ou un autre, peu importe — a dit : « Le monsieur de Lamanon aussi, à la jambe cassée, on l’avait amené à la docteure. »\n\nJoëlle s’approche de Maud. Elle se penche.\n\n« Luc Arnaud. »\n\nMaud ne détourne pas les yeux. « Page quatorze. » Elle glisse ses mains liées dans la doublure de sa blouse et en sort une feuille pliée en quatre. Elle la déplie. Puis, avant de lire, elle lève les yeux.\n\nVers toi.',
    choix: [
      { label: 'Te lever. « C’est moi. »', suivant: 'cal_aveu' },
      { label: 'Te taire', suivant: 'cal_maud_revele' },
      {
        label: 'Arracher la page des mains de Maud',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Tu traverses la salle en trois pas et tu lui arraches la feuille avant que quelqu’un comprenne. Tu la tends à la torche la plus proche. Le papier noircit, se tord, s’envole en flammèches vers la voûte.\n\nSoixante personnes te regardent. Joëlle aussi.',
          effets: { flag: 'page_brulee' },
          suivant: 'cal_page_brulee',
        },
        echec: {
          texte: 'Tu as fait deux pas quand Hugo t’attrape le bras. Maud n’a même pas bougé. Elle a simplement attendu, la page à la main.',
          suivant: 'cal_maud_revele',
        },
      },
    ],
  },

  cal_proces_c: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Ce soir, la grande salle est pleine, et ce n’est pas pour la soupe. Maud est debout près du feu, les mains libres, sa trousse à ses pieds. Depuis trois jours, elle a recousu, piqué, soigné. Elle a réglé la dose de Clémence. Les gens de Calès l’appellent « la docteure » avec une sorte de dévotion.\n\nMais les gamins de l’Empéri ont parlé. Ils ont dit, sans penser à mal : le monsieur de Lamanon, avec la jambe cassée, c’est à la docteure qu’on l’avait amené.\n\nJoëlle s’est plantée devant Maud.\n\n« Luc Arnaud. Vous l’avez soigné. »\n\n« Il est mort d’une hémorragie la nuit de son arrivée », dit Maud, sans ciller. « Je suis désolée. »\n\nJoëlle la regarde longtemps. Puis elle se tourne vers toi.\n\n« Tu étais à l’hôpital. Tu as trouvé ses affaires. Qu’est-ce que tu as trouvé d’autre ? »',
    choix: [
      { label: 'Sortir le registre', besoin: { objet: 'registre_protocole' }, suivant: 'cal_proces_c_registre' },
      { label: 'Mentir : « Rien. »', suivant: 'cal_proces_c_mensonge' },
    ],
  },

  cal_proces_c_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Rien. Ses affaires, l’insuline. C’est tout. »\n\nJoëlle te fixe. Tu soutiens son regard. Au bout d’un long moment, elle hoche la tête, et la salle respire, et les gens se lèvent en murmurant, et c’est fini.\n\nMaud ramasse sa trousse. En passant près de toi, sans tourner la tête, elle dit : « On est quittes. » Puis, plus bas : « Non. On ne l’est pas. On ne le sera jamais. »',
    choix: [
      {
        label: 'Laisser la nuit passer',
        effets: {
          flags: { mensonge_jo: true, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'J’ai menti à Jo, devant tout le monde. Maud a menti aussi. Luc est mort d’une hémorragie, pour Calès.',
        },
        suivant: '#fin',
      },
    ],
  },

  cal_proces_c_registre: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu poses le registre noir sur la caisse, devant Joëlle. PROTOCOLE — M. S.\n\nJoëlle lit. Il faut que quelqu’un lui explique les abréviations, et c’est Lou qui le fait, d’une voix blanche. Donneur. Nourri. Dormance. Un pour un. Samir. Et dans l’index, au début : ARNAUD L. — P. 14.\n\nLa page quatorze manque.\n\nMaud n’a pas bougé. Elle glisse la main dans la doublure de sa blouse et en sort une feuille pliée en quatre. Elle la déplie, la lit une dernière fois, en silence. Puis elle lève les yeux vers toi.',
    choix: [
      { label: 'Te lever. « C’est moi. »', suivant: 'cal_aveu' },
      { label: 'Te taire', suivant: 'cal_maud_mange_page' },
    ],
  },

  cal_maud_mange_page: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Tu vois tout dans ses yeux : la salle 4, la cloche, le brancard, la question.\n\nPuis Maud roule la page en boule, la met dans sa bouche, et la mâche.\n\nIl y a un cri dans la salle. Quelqu’un se jette sur elle, trop tard. Elle avale, avec la grimace d’une gamine qui prend un sirop.\n\n« Le patient est mort », dit-elle, la bouche vide. « Page quatorze, c’est moi que ça regarde. Un pour un, madame Arnaud. Pendez-moi si vous voulez. Ça fera le compte. »',
    choix: [{ label: 'Te taire encore', effets: { flags: { maud_a_mange_page: true, maud_captive: true, maud_medecin: false } }, suivant: 'cal_maud_defense' }],
  },

  cal_maud_revele: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud lit à voix haute, sans te quitter des yeux.\n\n« Quatorze. Arnaud, Luc. Cinquante et un ans. Fracture ouverte du tibia droit. Donneur pour P4. Nourrissage le 11 septembre, trois heures dix. » Elle replie la feuille. « P4 est dans cette salle. P4 vous a rapporté l’insuline. »\n\nSoixante têtes se tournent vers toi.\n\nJoëlle aussi. Elle ne comprend pas tout de suite. Puis elle regarde ton bras. La brûlure, le bandage, la cicatrice. Et elle comprend.',
    choix: [{ label: 'Ne rien nier', effets: { flags: { joelle_sait: true, revele_public: true } }, suivant: 'cal_revele_2' }],
  },

  cal_revele_2: {
    illu: 'cales_grande_salle', musique: 'combat', orateur: 'Joëlle',
    texte: 'Quelqu’un crie « UN MORT ! », et d’un coup la salle est debout, les torches levées, les couteaux sortis. Des mains t’agrippent, te poussent contre la paroi. Quelqu’un a une hachette. Quelqu’un pleure. Lou hurle ton prénom et se jette devant toi, bras écartés.\n\n« ARRÊTEZ ! »\n\nC’est Joëlle. Elle n’a pas crié très fort. Tout le monde s’arrête quand même.\n\n« Personne ne touche à personne ce soir. » Elle ne te regarde pas. « Ce soir, on juge la docteure. »',
    choix: [{ label: 'Rester contre la paroi', suivant: 'cal_maud_defense' }],
  },

  cal_aveu: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Tu te lèves. Tu le dis, avant que Maud le lise. Tu dis la salle 4, la cloche, l’homme sur le brancard, le mot qu’il a dit. Tu dis que tu savais en posant la boîte d’insuline sur la caisse.\n\nLa salle ne fait pas de bruit. Même les enfants.\n\nJoëlle s’approche de toi. Tout près. Elle sent la fumée et le savon.\n\n« Tu le savais », dit-elle. « Quand tu as donné l’insuline à ma fille. Tu le savais. »',
    choix: [
      { label: '« Oui. »', effets: { flags: { joelle_sait: true, aveu: true } }, suivant: 'cal_aveu_2' },
      { label: '« Je l’ai compris à l’hôpital. Je ne savais pas comment te le dire. »', effets: { flags: { joelle_sait: true, aveu: true } }, suivant: 'cal_aveu_2' },
    ],
  },

  cal_aveu_2: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle hoche la tête. Elle a l’air très calme, et c’est terrible.\n\n« D’accord », dit-elle. Elle se retourne vers Maud, et vers la salle. « Ça, c’est entre moi et… » Elle te désigne d’un mouvement du menton, sans trouver le mot. « Ça, on verra. Ce soir, on juge celle qui a choisi. »',
    choix: [{ label: 'Te rasseoir', suivant: 'cal_maud_defense' }],
  },

  cal_page_brulee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Pourquoi tu as fait ça ? » demande Joëlle. Très doucement.',
    choix: [
      { label: '« Parce que c’était moi, sur cette page. »', suivant: 'cal_aveu' },
      { label: '« Parce que personne ne mérite de savoir ça. »', effets: { flag: 'joelle_doute' }, suivant: 'cal_maud_defense' },
    ],
  },

  cal_maud_defense: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud parle debout, les mains croisées devant elle, comme à un staff du matin.\n\n« Il avait une fracture ouverte du tibia. Deux jours dans une cave avant qu’on me l’amène. Sans antibiotiques, c’était la gangrène en trois jours, la septicémie en cinq. Il allait mourir. Je n’ai pris que des gens qui allaient mourir. »\n\nJoëlle secoue la tête, lentement.\n\n« Il avait des antibiotiques. » Sa voix ne monte pas. « Dans la poche de son blouson. De l’amoxicilline, une boîte entière. C’est moi qui la lui avais donnée, le matin où il est parti. Je lui avais dit : si tu te coupes, tu en prends. »\n\nUn silence.\n\nMaud ouvre la bouche. La referme. Pour la première fois depuis la tour, tu la vois chercher ses mots, et ne pas les trouver.\n\n« Il me fallait quelqu’un », dit-elle enfin. Très bas. « Dans les quarante-huit heures. Il était là. »',
    choix: [{ label: 'Écouter la salle', suivant: 'cal_verdict' }],
  },

  cal_verdict: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: 'La salle gronde. Des voix, de plus en plus fortes : « La falaise ! » « Qu’elle marche vers eux ! » « On n’est pas des assassins ! » « Elle, si ! »\n\nJoëlle lève la main. Le silence revient, par vagues.\n\nElle se tourne vers toi. Pas par pitié, ni par confiance. Parce que tu es le seul, dans cette grotte, à savoir exactement ce que Maud a fait, et ce que ça donne.\n\n« Toi. Qu’est-ce qu’on en fait ? »',
    choix: [
      { label: '« Qu’on la pende. »', suivant: 'cal_maud_pendue' },
      { label: '« Qu’on la chasse, et que les morts décident. »', suivant: 'cal_maud_exilee' },
      { label: '« Qu’on la garde. L’armée la voudra. Elle nous fera passer le pont. »', suivant: 'cal_maud_gardee' },
    ],
  },

  cal_maud_pendue: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Maud',
    texte: 'Ils le font à l’aube, au sommet de la falaise, à un chêne kermès qui a poussé de travers dans une fissure. Il n’y a pas de discours. Quelqu’un a proposé une prière ; personne n’a su laquelle.\n\nAvant qu’on lui passe la corde, Maud demande une cigarette. On lui en trouve une. Elle la fume jusqu’au filtre, en regardant la plaine, le pertuis, et très loin au sud, la tache blanche de Salon.\n\nElle te fait signe d’approcher.\n\n« Tu es mon meilleur cas », dit-elle. « Ne gâche pas ça à avoir des remords. Les remords, c’est pour ceux qui ne sont jamais revenus de rien. »\n\nElle écrase le mégot sur la pierre, très soigneusement, jusqu’à ce qu’il n’en reste rien.',
    choix: [
      {
        label: 'Regarder, jusqu’au bout',
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
    texte: 'Ils la descendent au matin par l’échelle de corde, avec sa trousse, une gourde et rien d’autre. Personne ne lui détache les mains avant le bas de la falaise.\n\nElle part vers le sud. Vers le pertuis. Vers les cloches.\n\nAu bout du chemin, elle se retourne une fois, et te cherche des yeux sur la corniche.\n\n« Je vais aller voir ton berger ! » crie-t-elle, et elle a l’air presque heureuse. « Un troupeau entier, tu te rends compte ? Des centaines de cas ! »',
    choix: [
      {
        label: 'La regarder disparaître',
        effets: {
          flags: { maud_exilee: true, maud_berger: true, maud_captive: false, maud_medecin: false, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Calès a chassé Maud. Elle est partie vers le troupeau, heureuse. « Des centaines de cas. »',
        },
        suivant: 'cal_apres_proces',
      },
    ],
  },

  cal_maud_gardee: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« L’armée la voudra », répète Joëlle, et elle pèse les mots comme on pèse de la farine. « Une monnaie d’échange. » Elle regarde Maud. « Vous entendez ? Vous allez enfin servir à quelque chose. »\n\nOn enferme Maud au fond de la grotte du puits, derrière une grille de jardin. Elle s’assoit par terre, le dos à la roche, et ferme les yeux comme quelqu’un qui a enfin le droit de dormir.',
    choix: [
      {
        label: 'Continuer',
        effets: {
          flags: { maud_captive: true, maud_medecin: false, proces_fait: true },
          quete: ['q_traversee', 'ba701'], decouvrir: ['ba701'],
          journal: 'Calès garde Maud prisonnière, dans la grotte du puits, pour la livrer à l’armée.',
        },
        suivant: 'cal_apres_proces',
      },
    ],
  },

  cal_apres_proces: {
    illu: 'cales_falaises', musique: 'sombre',
    texte: 'Le reste de la journée, Calès vit comme on vit après un enterrement : on range, on cuisine, on fait semblant. Mais tout le monde a entendu Lou, tout à l’heure : la base aérienne 701, une radio, des codes.\n\nC’est au sud de Salon. Il faudra retraverser la plaine.',
    choix: [
      { label: 'Attendre la nuit', si: { flag: 'joelle_sait' }, suivant: 'cal_joelle_nuit' },
      { label: 'Préparer ton sac', si: { pasFlag: 'joelle_sait' }, suivant: '#fin' },
    ],
  },

  cal_joelle_nuit: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Elle vient tard, quand les feux sont bas. Elle s’assoit à côté de toi au bord de la corniche, les jambes dans le vide, au-dessus de Lamanon endormi. Elle ne te regarde pas.\n\n« Il avait peur des hôpitaux. Il tournait de l’œil devant une prise de sang. » Un temps. « Il est parti à pied, avec son vélo à la main parce que le pneu était crevé. Il m’a dit : je reviens avant la nuit. »\n\nLe vent se lève un peu, puis retombe.\n\n« Est-ce qu’il a eu mal ? »',
    choix: [
      { label: '« Non. »', effets: { flag: 'jo_mensonge_doux' }, suivant: 'cal_joelle_nuit_non' },
      { label: '« Je ne sais pas. Il ne criait pas. »', suivant: 'cal_joelle_nuit_verite' },
      { label: '« Il a dit ton nom. »', effets: { flag: 'jo_nom_dit' }, suivant: 'cal_joelle_nuit_nom' },
    ],
  },

  cal_joelle_nuit_non: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Menteur. » Elle le dit sans colère, presque avec tendresse. « Merci. »\n\nElle reste encore un moment. Puis elle se lève et rentre dans la grotte sans un mot de plus.',
    choix: [{ label: 'Rester au bord du vide', suivant: '#fin' }],
  },

  cal_joelle_nuit_verite: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Il ne criait jamais. » Elle a un petit rire mouillé. « Même quand il s’est pris le jus sur le chantier de Sénas, en 2011. Il a juste dit : oh, putain. » Elle essuie son nez avec le poignet. « C’est bien. Qu’il n’ait pas crié. C’est lui, ça. »\n\nElle se lève. Elle pose, une seconde, la main sur ton épaule. Puis elle l’enlève comme si elle s’était brûlée.',
    choix: [{ label: 'La regarder partir', suivant: '#fin' }],
  },

  cal_joelle_nuit_nom: {
    illu: 'cales_falaises', musique: 'sombre', orateur: 'Joëlle',
    texte: 'Joëlle ne dit rien pendant très longtemps.\n\n« Jo », dit-elle enfin. Pas une question.\n\nTu hoches la tête.\n\nElle se plie en deux, d’un coup, comme si on l’avait frappée au ventre, et elle pleure contre ses genoux, avec un bruit que tu n’avais jamais entendu faire à un être humain. Tu ne la touches pas. Tu restes là. C’est tout ce que tu peux faire, et c’est la seule chose qu’elle te laisse faire.\n\nQuand elle se relève, elle a le visage défait et les yeux secs.\n\n« Au pont, dit-elle. Tu passes derrière moi. Je veux te voir passer. »',
    choix: [{ label: 'Rester', effets: { flag: 'joelle_veut_te_voir_passer' }, suivant: '#fin' }],
  },

  // Dialogue avec Maud captive (grotte du puits) — voir scenes_pnj.js pour le menu.
  maud_liberer: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Tu ouvres la grille de jardin à trois heures du matin, quand le guetteur somnole. Maud ne se lève pas tout de suite.\n\n« Pourquoi ? »\n\nTu ne sais pas quoi répondre. Elle hoche la tête, comme si c’était la bonne réponse.\n\nElle se lève, ramasse sa trousse. Puis elle glisse la main dans sa blouse et te tend quelque chose.',
    choix: [{ label: 'Prendre ce qu’elle te tend', suivant: 'maud_liberer_2' }],
  },

  maud_liberer_2: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Une feuille pliée en quatre, douce comme un vieux billet à force d’avoir été touchée.\n\n« Tu savais déjà », dit-elle. « Mais tu as le droit de l’avoir. »\n\nElle descend l’échelle sans bruit. Au bas de la falaise, elle ne va pas vers le sud et les cloches. Elle va vers le nord. Vers le fleuve. Vers les soldats.\n\n« Je vais aller dire à Sabine qu’elle a tort », t’a-t-elle soufflé avant de partir. « Elle me doit bien ça. »',
    choix: [
      {
        label: 'Déplier la page',
        effets: {
          objet: ['page_14', 1], document: 'doc_page_14',
          flags: { maud_liberee: true, maud_captive: false },
          journal: 'J’ai libéré Maud. Elle m’a laissé la page quatorze et elle est partie vers la Durance, parler à Orsini.',
        },
        suivant: '#fin',
      },
    ],
  },

  maud_tuer: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Tu entres dans la grotte du puits à trois heures du matin. Maud ne dort pas. Elle te regarde t’approcher, et elle comprend avant toi.\n\n« Ah », dit-elle simplement. « Le patient qui tue son médecin. C’est un classique. »\n\nElle ne se débat pas. Elle ne crie pas. À la toute fin, elle te prend le poignet, pas pour t’arrêter : pour prendre ton pouls. Tu la sens compter.\n\n« Cinquante-deux », souffle-t-elle. « Tu es en pleine forme. »',
    choix: [
      {
        label: 'Finir',
        effets: {
          flags: { maud_morte: true, tu_as_tue_maud: true, maud_captive: false },
          journal: 'J’ai tué Maud Sérane dans la grotte du puits. Elle a pris mon pouls jusqu’au bout.',
        },
        suivant: '#fin',
      },
    ],
  },

  maud_film: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: 'Tu lui tends le téléphone. Elle se redresse, se passe la main dans les cheveux, ajuste sa blouse, et pour la première fois depuis que tu la connais, elle a l’air d’avoir peur de mal faire.\n\n« Docteure Maud Sérane, chef du service des urgences du centre hospitalier du Pays salonais. Nous sommes le… » Elle hésite. « Peu importe. Voici ce que j’ai fait. »\n\nElle parle onze minutes, sans une note, d’une voix de conférence. Les dates, les doses, les donneurs, les échecs. Elle ne s’excuse de rien. À la fin, elle regarde l’objectif, longtemps.\n\n« Ils reviennent. Ce n’est pas une bonne nouvelle. C’est une nouvelle. Faites-en ce que vous voudrez. »',
    choix: [{ label: 'Arrêter l’enregistrement', effets: { flags: { temoignage_maud: true, temoin_extra: true } }, suivant: '#fin' }],
  },

  maud_livrer_berger: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Le Berger veut te voir. Il a des centaines de patients. Deux sur trois reviennent mal. Il veut savoir pourquoi. »\n\nMaud te regarde à travers la grille. Et tu vois s’allumer dans ses yeux quelque chose que tu n’y avais jamais vu, pas même en haut de la tour : de la joie.\n\n« Des centaines », répète-t-elle. « Ouvre. »\n\nNadège attend en bas de la falaise, sans lampe, sa sonnaille bourrée de chiffon. Maud descend l’échelle comme une jeune fille qui fait le mur. Elle ne se retourne pas.',
    choix: [
      {
        label: 'Refermer la grille sur une grotte vide',
        effets: {
          flags: { maud_berger: true, maud_captive: false, berger_contourne: true, jour_gagne: true },
          journal: 'J’ai livré Maud au Berger. En échange, il a promis que le troupeau contournerait Calès. Elle est partie heureuse.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── VIEUX-VERNÈGUES ───────────────────────────
  // Déclencheur : entrée dans 'vernegues'.
  ver_arrivee: {
    illu: 'vernegues_ruines', musique: 'sombre',
    texte: 'Le vieux Vernègues est mort une première fois le 11 juin 1909, à vingt et une heures dix, quand la terre a bougé sous la chaîne des Côtes. Les gens sont descendus reconstruire dans la plaine, avec les pierres de leurs maisons. Ce qu’ils ont laissé en haut, c’est ça : des pans de murs, des arcs sans voûte, une église sans toit, un château qui n’est plus qu’une dent. Des figuiers poussent dans les cuisines.\n\nCe soir, il y a des bougies partout. Dans les niches, sur les murets, au fond des caves effondrées dont les bouches s’ouvrent au ras du sol. Des centaines de bougies. Et des gens, assis entre les ruines, qui mangent, qui parlent bas, qui recousent, qui jouent aux cartes.\n\nDes gens. Pas des morts. Tu le vois à leurs gestes.\n\nSur le mur de l’église, en lettres de chaux hautes comme un homme : UN POUR UN.',
    choix: [{ label: 'Avancer', effets: { cinematique: 'vernegues' }, suivant: 'ver_accueil' }],
  },

  ver_accueil: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: 'La femme en treillis de la rue de l’Horloge vient vers toi. Elle a enlevé sa sonnaille. Elle te tend la main, et sa main est froide, aussi froide que la tienne.\n\n« Nadège. Caporal-chef, escadron de protection, base 701. Mordue le 5, revenue le 19. » Elle sourit. « Toi, c’est quand ? »\n\nAutour, les autres ont levé la tête. Ils te regardent, et il n’y a ni peur ni méfiance dans leurs yeux. Il y a autre chose, que tu n’avais vu nulle part depuis ta housse.\n\nIls te reconnaissent.\n\n« Tu sens le froid », dit Nadège. « On le sent tous, entre nous. Les morts aussi, un peu : ils nous reniflent et ils passent. Viens. Le Berger t’attend. »',
    choix: [{ label: 'La suivre', effets: { flags: { revenus_rencontres: true, vernegues_visite: true } }, suivant: 'ver_berger' }],
  },

  ver_berger: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: 'Il est assis sur une pierre, devant un feu de sarments, dans ce qui était le chœur de l’église. Soixante-dix ans. Un visage de cuir plissé comme une noix, une moustache blanche jaunie par le tabac, un chapeau de feutre, une grande cape de laine brune. Une houlette en travers des genoux. Deux chiens couchés à ses pieds — un patou blanc énorme, un border noir — qui lèvent la tête ensemble quand tu approches. Ils sont vivants. Ils remuent la queue.\n\nIl te fait signe de t’asseoir en face. Il te sert du vin rouge dans un verre à moutarde.\n\n« Baptistin Castagne. Berger. Cinquante-deux transhumances. Je suis monté à pied de la Crau à l’Ubaye cinquante-deux fois, avec deux mille bêtes, et je n’en ai jamais perdu plus de dix. » Il boit. « Cette année, j’en ai perdu tout un pays. Alors je le ramène. »',
    choix: [
      { label: '« Ce sont des morts. Pas des brebis. »', suivant: 'ver_berger_morts' },
      { label: '« Où est-ce que tu les emmènes ? »', suivant: 'ver_berger_estive' },
      { label: '« Qu’est-ce que tu me veux ? »', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_morts: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Des morts. » Il hoche la tête, comme si tu disais une chose intéressante et un peu naïve. « La Rose était morte. Mordue le 1er, dans la bergerie, par un gars de la Crau qui cherchait de l’eau. Elle est tombée le soir. Le lendemain, elle marchait. Et le surlendemain… »\n\nIl s’arrête. Il boit.\n\n« Le surlendemain, elle a trouvé le petit des Ruiz, qui venait voir si on avait besoin de quelque chose. Seize ans. Elle l’a mangé dans la cour, sous le mûrier. Tout entier. Je regardais par la fenêtre. Je n’ai rien fait. »\n\nIl repose son verre.\n\n« Douze jours après, elle s’est réveillée dans la paille et elle m’a demandé pourquoi j’avais une tête pareille. » Il sourit. « Alors ne me dis pas que ce sont des morts. Ce sont des gens qui n’ont pas encore mangé. »',
    choix: [
      { label: '« Où est-ce que tu les emmènes ? »', suivant: 'ver_berger_estive' },
      { label: '« Qu’est-ce que tu me veux ? »', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_estive: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Au nord. » Il tend la main vers l’obscurité, là où la Durance coule sous les étoiles. « L’armée va brûler tout ce qui est au sud du fleuve au premier coup de mistral. Nadège l’a lu, à la base. Ils vont brûler mon troupeau comme on brûle des bêtes malades. Alors je passe avant le vent. »\n\nIl tisonne le feu.\n\n« De l’autre côté, il y a le Vaucluse, la Drôme, les Alpes. Des villes qui dorment dans leur lit. Des millions de gens qui n’ont rien perdu. » Il te regarde par-dessus les flammes. « Ils ne nous ont pas aidés. Ils nous ont enfermés. Ils ont tiré sur mon fils au barrage de la 113 parce qu’il avait de la fièvre, et c’était une angine. Alors chacun des miens en prendra un des leurs, et chacun des miens reviendra. Un pour un. C’est une estive. C’est juste une très grande estive. »',
    choix: [
      { label: '« Ce sont des morts. Pas des brebis. »', suivant: 'ver_berger_morts' },
      { label: '« Qu’est-ce que tu me veux ? »', suivant: 'ver_berger_toi' },
    ],
  },

  ver_berger_toi: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Parce que tu es des nôtres, et que tu ne le sais pas encore. » Il pose sa houlette. « Et parce que tu as vécu chez eux. Les vivants. Dans leur château, dans leurs grottes. Tu sais comment ils pensent. »\n\nIl se penche vers toi.\n\n« Et parce que tu connais la médecin. Celle qui tenait le registre. »',
    choix: [
      { label: 'Écouter', si: { flag: 'maud_berger' }, suivant: 'ver_maud_ici' },
      { label: 'Écouter', si: { flag: 'maud_morte' }, suivant: 'ver_berger_marche' },
      { label: 'Écouter', si: { flag: 'maud_liberee' }, suivant: 'ver_berger_marche' },
      { label: 'Écouter', si: { ou: [{ flag: 'maud_captive' }, { flag: 'maud_medecin' }] }, suivant: 'ver_berger_offre' },
    ],
  },

  ver_berger_offre: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Deux des miens sur trois reviennent mal. Ils se réveillent, ils disent leur nom, et puis ça les reprend. Elle, elle saurait pourquoi. Elle a des chiffres, des courbes, un registre. »\n\nIl te tend la main par-dessus le feu. Une main calleuse, tiède. La seule main tiède de tout Vernègues.\n\n« Amène-la-moi. Et je te donne ma parole de berger : le troupeau contournera les grottes. Tes vivants de Calès passeront le fleuve sans moi dans leur dos. » Il sourit. « Un pour un. Une médecin pour soixante vivants. C’est un bon prix. »',
    choix: [
      { label: '« J’y réfléchirai. »', effets: { flag: 'berger_offre_maud' }, suivant: 'ver_berger_marche' },
      { label: '« Jamais. »', effets: { flags: { berger_offre_maud: true, berger_refus_maud: true } }, suivant: 'ver_berger_marche' },
    ],
  },

  ver_maud_ici: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Maud',
    texte: '« Elle est ici », dit le Berger. « Elle est arrivée hier, à pied. Elle soigne mes ratés. »\n\nIl t’emmène jusqu’à la bouche d’une cave. En bas, à la lueur de vingt bougies, Maud est à genoux près d’un homme enchaîné qui grogne et claque des dents. Elle prend sa température. Elle note. Elle a les manches relevées, les cheveux attachés, et l’air plus vivant que tu ne l’as jamais vue.\n\nElle lève les yeux vers toi.\n\n« Tu vois ? » dit-elle simplement. « Ici, on me laisse travailler. »',
    choix: [{ label: 'Remonter', suivant: 'ver_berger_marche' }],
  },

  ver_berger_marche: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Et toi », dit le Berger. « Marche avec nous. Pas derrière : devant. Avec une cloche au cou, comme Nadège. Tu n’auras plus jamais à mentir sur ton bras. Tu n’auras plus jamais à baisser tes manches. »\n\nIl détache de sa ceinture une petite sonnaille de laiton, bosselée, avec son collier de cuir, et la pose sur la pierre entre vous.\n\n« Réfléchis. On part pour le fleuve quand le vent se lève. »',
    choix: [
      {
        label: 'Prendre la sonnaille',
        effets: {
          objet: ['sonnaille', 1], flags: { berger_sonnaille: true, vernegues_fait: true },
          quete: ['q_berger', 'rose'],
          journal: 'Vieux-Vernègues : le Berger, Baptistin Castagne, et ses « revenus ». Il veut mener le troupeau au-delà de la Durance, pour que chaque mort mange un vivant et revienne. J’ai pris sa sonnaille.',
        },
        suivant: 'ver_depart',
      },
      {
        label: 'La laisser sur la pierre',
        effets: {
          flags: { berger_refus: true, vernegues_fait: true },
          quete: ['q_berger', 'rose'],
          journal: 'Vieux-Vernègues : le Berger, Baptistin Castagne, et ses « revenus ». Il veut mener le troupeau au-delà de la Durance, pour que chaque mort mange un vivant et revienne. J’ai refusé sa sonnaille.',
        },
        suivant: 'ver_depart',
      },
    ],
  },

  ver_depart: {
    illu: 'vernegues_ruines', musique: 'sombre',
    texte: 'En repartant, tu passes devant la sacristie effondrée. Une petite femme est assise par terre, seule, une énorme cloche de bronze posée entre ses jambes. Elle ne te regarde pas. Elle t’attend.\n\nC’est Rose.',
    choix: [
      { label: 'T’asseoir près d’elle', suivant: 'ver_rose' },
      { label: 'Passer ton chemin', suivant: '#fin' },
    ],
  },

  ver_rose: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'De près, la cloche est plus grosse que sa tête : du bronze bosselé, verdi, un collier de cuir épais comme une ceinture, un battant de fer gros comme un poing. Elle la tient comme on tient un enfant malade.\n\nElle a soixante ans. Un visage fin, triste, des yeux très clairs.\n\n« Il t’a raconté le petit des Ruiz ? » Sa voix est très douce. « Il le raconte à tout le monde. Il en est fier. Il dit : elle l’a mangé tout entier. Comme si j’avais fini mon assiette. »',
    choix: [{ label: '« Et toi ? »', suivant: 'ver_rose_2' }],
  },

  ver_rose_2: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Moi, je me souviens de son goût. » Elle ne baisse pas la voix. « Je me souviens de tout. Il s’appelait Kylian. Il avait un appareil dentaire, et il m’apportait des œufs le dimanche. » Elle caresse la cloche. « Je ne suis pas revenue. On ne revient pas. On repart d’ailleurs, avec quelque chose en moins et quelqu’un en plus. »\n\nElle lève enfin les yeux vers toi.\n\n« Toi aussi, tu as quelqu’un en plus. Je le vois. »',
    choix: [
      { label: '« Il s’appelait Luc. »', si: { flag: 'lettre_luc_trouvee' }, suivant: 'ver_rose_luc' },
      { label: '« Je ne sais pas qui. »', si: { pasFlag: 'lettre_luc_trouvee' }, suivant: 'ver_rose_3' },
    ],
  },

  ver_rose_luc: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Luc. » Elle répète le prénom, comme pour le ranger quelque part où il ne se perdra pas. « C’est bien, que tu saches son nom. Baptistin ne veut pas que je dise celui de Kylian. Il dit que ça me fait du mal. » Elle sourit. « C’est à lui que ça fait du mal. »',
    choix: [{ label: 'Continuer', suivant: 'ver_rose_3' }],
  },

  ver_rose_3: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Le troupeau suit le redon. Pas lui : le redon. Ça a toujours été comme ça, même avec les brebis. La plus grosse cloche, la plus grave, c’est la voix de la mère. Là où elle va, elles vont. » Elle soulève la cloche, avec peine. « Baptistin croit que c’est lui qu’ils suivent. Il a besoin de le croire. »\n\nElle la repose.\n\n« Au fleuve, il va les jeter sur les soldats. Et de l’autre côté, il y aura des milliers de Kylian. » Elle te regarde. « Moi, je suis vieille, je suis fatiguée, et je ne peux pas le quitter. Cinquante ans, tu comprends. Mais toi, tu pourrais la porter. »',
    choix: [
      { label: '« Donne-la-moi. »', suivant: 'ver_rose_promesse' },
      { label: '« Qu’est-ce que j’en ferais ? »', suivant: 'ver_rose_choix' },
      { label: '« Je ne veux pas de ta cloche. »', effets: { flag: 'rose_refus' }, suivant: 'ver_rose_refus' },
    ],
  },

  ver_rose_choix: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Ce que tu voudras. » Elle a un petit rire. « C’est bien ça, le problème, hein ? Celui qui porte le redon, il choisit où va le troupeau. Au fleuve, dans le feu, dans la mer, à la montagne. Personne ne devrait avoir ça dans les mains. Mais il faut bien que quelqu’un l’ait. »',
    choix: [{ label: '« Donne-la-moi. »', suivant: 'ver_rose_promesse' }, { label: '« Pas moi. »', effets: { flag: 'rose_refus' }, suivant: 'ver_rose_refus' }],
  },

  ver_rose_promesse: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Pas ici. Il te tuerait, et il aurait raison, de son point de vue. » Elle pose la main sur la tienne. Froide. « Au pont. Quand il faudra. Si tu es là, je te la donne. Et après… »\n\nElle hausse ses maigres épaules.\n\n« Après, c’est toi, le berger. »',
    choix: [
      {
        label: '« Au pont. »',
        effets: {
          flag: 'rose_promesse', quete: ['q_berger', 'fin'],
          journal: 'Rose, la femme du Berger, porte le redon — la grosse cloche que suit tout le troupeau. Elle me le donnera au pont de Mallemort.',
        },
        suivant: '#fin',
      },
    ],
  },

  ver_rose_refus: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose hoche la tête. Elle ne t’en veut pas. Elle a l’air de quelqu’un qui a l’habitude qu’on ne l’aide pas.\n\n« Alors va-t’en vite », dit-elle. « Avant qu’il te demande encore. Il demande toujours trois fois. »',
    choix: [{ label: 'Partir', effets: { quete: ['q_berger', 'fin'] }, suivant: '#fin' }],
  },

  rose_film: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose regarde le téléphone comme un animal inconnu. Puis elle se tourne vers lui, bien en face, et elle parle.\n\n« Je m’appelle Rose Castagne. J’ai soixante-trois ans. Le 3 septembre, j’ai mangé Kylian Ruiz, seize ans, qui m’apportait des œufs le dimanche. Je suis revenue le 16. » Elle s’arrête. « Je voudrais que sa mère le sache. Qu’on ne lui a pas pris son fils pour rien. On le lui a pris pour moi. C’est pire. »\n\nElle se tait. Tu arrêtes l’enregistrement. Elle te remercie, poliment, comme à la fin d’une visite.',
    choix: [{ label: 'Ranger le téléphone', effets: { flags: { temoignage_rose: true, temoin_extra: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── BA 701 ───────────────────────────
  // Déclencheur : entrée dans 'ba701' si quête à 'ba701'.
  ba_arrivee: {
    illu: 'ba701_tarmac', musique: 'tension',
    texte: 'Au rond-point de l’École de l’air, le Fouga Magister est toujours sur son mât, ailes étendues, peint aux couleurs de la Patrouille de France, le nez pointé vers un ciel qu’il ne reverra pas. Quelqu’un a grimpé jusqu’à lui et a pendu au bout de l’aile un mannequin en uniforme. Non. Pas un mannequin.\n\nDerrière, la base. Des kilomètres de grillage, des miradors vides, des bâtiments bas et blancs, des hangars arrondis, et le terrain d’aviation, immense, jaune, plat, qui file jusqu’aux collines. Sur le tarmac, en rang parfait, comme pour un meeting, neuf Alphajets bleu-blanc-rouge, verrières fermées.\n\nLa barrière du poste de garde est levée. Le poste est vide. Sur le parking, trois cents paires de rangers sont alignées au cordeau, par pointure, cirées, comme pour une revue. Personne ne sait ce que ça veut dire. Personne n’est resté pour l’expliquer.',
    choix: [
      {
        label: 'Entrer dans la base',
        effets: { cinematique: 'ba701', journal: 'La base aérienne 701. D’après Nadège, la radio est dans l’armoire forte du PC de l’escadron de protection. La clé est sur l’officier de permanence.' },
        suivant: '#fin',
      },
    ],
  },

  // Marqueur 'pc_protection' (bâtiment de l'escadron de protection, salle de permanence).
  ba_pc: {
    illu: 'ba701_tarmac', musique: 'tension',
    texte: 'PC de l’escadron de protection. Stores baissés, écrans éteints, une carte de la base au mur couverte d’épingles rouges qui se sont multipliées jusqu’à la cacher.\n\nÀ la console, un lieutenant est assis, casque radio sur les oreilles, dos droit, les mains posées de chaque côté du clavier. Il a l’air d’attendre un appel. Il a une clé au cou, sur une chaînette, avec une étiquette : A.F. — ARMOIRE FORTE.\n\nIl ne bouge pas. Sa poitrine ne bouge pas. Les mouches, si.',
    choix: [
      {
        label: 'Prendre la clé à son cou',
        test: { skill: 'dexterite', difficulte: 2 },
        reussite: {
          texte: 'Tu soulèves la chaînette par-dessus le casque, millimètre par millimètre. La tête du lieutenant bascule doucement en avant, sur le clavier, et reste là. La clé est dans ta main.',
          effets: { objet: ['cle_armoire_forte', 1], xp: { dexterite: 12 } },
          suivant: '#fin',
        },
        echec: {
          texte: 'La chaînette accroche l’arceau du casque. La main du lieutenant se referme sur ton poignet, ferme, entraînée, et sa tête pivote vers toi avec un bruit de vertèbres.',
          effets: { combat: { zombies: ['militaire'] } },
          suivant: 'ba_pc_apres',
        },
      },
      { label: 'Le frapper d’abord', effets: { combat: { zombies: ['militaire'] } }, suivant: 'ba_pc_apres' },
    ],
  },

  ba_pc_apres: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Le lieutenant est à terre, le casque radio de travers. La clé a glissé dans son col. Tu la récupères. Sur la console, le voyant d’un micro est resté allumé, alimenté par une batterie qui n’en finit pas de mourir.',
    choix: [{ label: 'Prendre la clé', effets: { objet: ['cle_armoire_forte', 1] }, suivant: '#fin' }],
  },

  // Marqueur 'armoire_forte' (porte verrouillée : cle_armoire_forte).
  ba_armoire: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'L’armoire forte s’ouvre sur une odeur d’huile et de métal. Des râteliers vides — quelqu’un a tout pris, les fusils, les munitions — sauf, sur l’étagère du bas, ce que personne n’a pensé à emporter parce que ça ne tue personne : une valise radio tactique vert olive, avec son combiné et sa batterie de rechange. Et un classeur rouge à anneaux, cadenassé à une chaînette : AUTHENTIFICATION — DIFFUSION RESTREINTE.\n\nDessous, une chemise cartonnée, tamponnée SECRET, avec une mention au feutre : À DÉTRUIRE AVANT ÉVACUATION.\n\nPersonne ne l’a détruite. Il n’y a pas eu d’évacuation.',
    choix: [
      {
        label: 'Prendre la valise et le classeur',
        effets: { objets: [['valise_radio', 1], ['carnet_authentification', 1]], flag: 'ba_materiel' },
        suivant: 'ba_armoire_2',
      },
    ],
  },

  ba_armoire_2: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Tu ouvres la chemise, là, {accroupi|accroupie} devant l’armoire, la lampe entre les dents.\n\nDeux documents. Le premier s’appelle CAUTÈRE. Tu le connais déjà par cœur sans l’avoir lu : la ligne Durance, le premier épisode de mistral, la mise à feu. Il y a une référence en haut de la première page. RÉF. : RAPPORT DR M. S. (CH SALON), 08/09.\n\nLe second s’appelle PROTOCOLE R. Il est plus court. Il parle de « sujets revenus ». Il dit ce qu’il faut faire des gens qui en ont vu un.\n\nL’armée sait. Elle sait depuis le 8 septembre. Et c’est pour ça qu’elle brûle.',
    choix: [
      {
        label: 'Tout emporter',
        effets: {
          document: 'doc_ordre_cautere',
          flag: 'protocole_r_lu', quete: ['q_traversee', 'contact'],
          journal: 'BA 701 : une radio, les codes. Et l’ordre « Cautère » — qui cite le rapport de Maud du 8 septembre. L’armée sait que les morts reviennent. Elle ne brûle pas malgré ça. Elle brûle à cause de ça.',
        },
        suivant: 'ba_armoire_3',
      },
    ],
  },

  ba_armoire_3: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Tu glisses le second document dans le classeur rouge. PROTOCOLE R. Tu le reliras plus tard. Ou jamais.\n\nDehors, le vent a tourné. Pas encore le mistral. Juste une haleine froide, venue du nord, qui fait claquer les drapeaux sur le mât de la base.',
    choix: [{ label: 'Repartir', effets: { document: 'doc_protocole_r' }, suivant: '#fin' }],
  },

  // Marqueur 'hangar_paf' (hangar de la Patrouille de France).
  ba_hangar: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Le hangar de la Patrouille de France sent le kérosène et la poussière. Un dixième Alphajet est là, capot moteur ouvert, en révision. Verrière relevée.\n\nDans le cockpit, sanglé, casque sur la tête, un pilote. Sur le casque, au pochoir : ATHOS 6. Il a les mains sur les commandes. Il attendait l’ordre de décoller. Il l’a attendu jusqu’au bout, et après.\n\nIl tourne lentement la tête vers toi, dans son casque trop lourd. Les sangles le tiennent. Il ne peut pas sortir. Il ne pourra jamais sortir.\n\nDans son casier, à côté des combinaisons, une enveloppe.',
    choix: [
      { label: 'Prendre l’enveloppe', effets: { document: 'doc_lettre_pilote' }, suivant: 'ba_hangar_2' },
    ],
  },

  ba_hangar_2: {
    illu: 'ba701_tarmac', musique: 'sombre',
    texte: 'Athos 6 te regarde lire. Il ne peut rien faire d’autre.',
    choix: [
      { label: 'L’achever, à travers le cockpit', effets: { flag: 'athos_acheve', combat: { zombies: ['militaire'] } }, suivant: '#fin' },
      { label: 'Le laisser dans son avion', effets: { flag: 'athos_laisse' }, suivant: '#fin' },
    ],
  },

  // ─────────────────────────── L’APPEL ───────────────────────────
  // Marqueur 'antenne_cales' (sommet de la falaise), si valise_radio et carnet_authentification.
  cal_contact: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'La radio',
    texte: 'Au sommet de la falaise, Lou a tendu l’antenne de la valise entre deux chênes kermès. Joëlle est là, et une dizaine d’autres, accroupis dans un vent qui se lève à peine. Tu règles la fréquence 4. Tu ouvres le classeur rouge à la page du jour. Tu lis le groupe de lettres à voix haute, en articulant, comme à l’école.\n\nDu souffle. Puis une voix de femme. Pas l’enregistrement : une vraie voix, fatiguée, précise, qui respire.\n\n« Station inconnue, ici Orsini. Votre authentification vient d’une base qui n’existe plus. Vous avez trente secondes pour me donner une raison de ne pas couper. »',
    choix: [
      { label: '« Il y a soixante vivants à Calès. Des enfants. On veut passer le fleuve. »', suivant: 'cal_contact_civils' },
      { label: '« J’ai le registre de la docteure Sérane. »', si: { objet: 'registre_protocole' }, effets: { flag: 'orsini_sait_registre' }, suivant: 'cal_contact_registre' },
      { label: '« Mon cœur s’est arrêté le 6 septembre. Il est reparti. »', effets: { flag: 'orsini_sait' }, suivant: 'cal_contact_revenu' },
    ],
  },

  cal_contact_registre: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: '« Sérane. » Un silence d’une autre qualité. « Ne lisez rien de ce registre sur cette fréquence. Rien. Vous m’entendez ? Rien. »\n\nTu l’entends respirer. Tu l’entends réfléchir.',
    choix: [{ label: 'Attendre', suivant: 'cal_contact_civils' }],
  },

  cal_contact_revenu: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: 'Tu le dis. Autour de toi, ceux de Calès qui ne savaient pas se figent. Lou baisse les yeux.\n\nOrsini ne répond pas pendant dix secondes. Puis, très bas :\n\n« Ne dites plus jamais ça sur une fréquence ouverte. Plus jamais. »',
    choix: [{ label: 'Attendre', suivant: 'cal_contact_civils' }],
  },

  cal_contact_civils: {
    illu: 'cales_falaises', musique: 'tension', orateur: 'Orsini',
    texte: 'Tu entends, derrière elle, des voix, un téléphone qui sonne, une vie de bureau, une tasse qu’on pose. Le monde d’avant, à vingt kilomètres.\n\n« Écoutez-moi bien, parce que je ne répéterai pas. Au premier jour de mistral, à l’aube, le pont suspendu de Mallemort sera ouvert pendant une heure pour un contrôle sanitaire. Un par un. Les bras, le cou, les jambes. Toute morsure, toute plaie non expliquée : refoulé. Toute personne qui force : abattue. Après cette heure-là, il n’y aura plus de pont. »\n\nUn temps.\n\n« Et si la docteure Maud Sérane est vivante et avec vous, je la veux. Vivante. Terminé. »',
    choix: [
      {
        label: 'Couper',
        effets: {
          flag: 'orsini_contact', quete: ['q_traversee', 'depart'],
          journal: 'Orsini : le pont suspendu de Mallemort sera ouvert une heure, à l’aube du premier jour de mistral. Contrôle des bras. Elle veut Maud vivante.',
        },
        suivant: 'cal_contact_fin',
      },
    ],
  },

  cal_contact_fin: {
    illu: 'cales_falaises', musique: 'calme', orateur: 'Joëlle',
    texte: 'Personne ne parle. Joëlle regarde vers le nord.\n\nUn vieux de Lamanon — Fernand, quatre-vingt-quatre ans, une hanche en titane — lèche son index et le lève en l’air, comme on faisait avant les applications météo.\n\n« Demain soir, il sera là. Ou après-demain. Ça sent. Le vent a tourné sur le Ventoux. »\n\n« On part au premier coup », dit Joëlle. « Tout le monde prépare son sac. Pas plus de dix kilos. » Elle te regarde. « Tu nous diras quand tu es {prêt|prête}. »',
    choix: [{ label: 'Descendre de la falaise', suivant: '#fin' }],
  },

  // ─────────────────────────── UN JOUR DE PLUS ───────────────────────────
  // Marqueur 'martelliere_canal' (en bas du village, prise du canal de Craponne).
  cal_martelliere: {
    illu: 'cales_falaises', musique: 'calme',
    texte: 'En bas du village, le canal de Craponne passe sous un petit pont de pierre, entre deux rangées de cannes. Une martelière de fonte — une vanne à crémaillère avec son grand volant — commande une dérivation vers la plaine. Une plaque rouillée : ASA DU CANAL DE CRAPONNE — PRISE DU PERTUIS.\n\nSi tu ouvres en grand, l’eau quitte le canal et part dans les champs, sur la draille, là où le troupeau doit passer. Un marécage, en une nuit. Les morts marchent mal dans la boue. Ils se noient dans cinquante centimètres d’eau, parfois, parce qu’ils ne pensent pas à relever la tête.\n\nMais la citerne de Calès se remplit par la même dérivation. Plus d’eau dans les champs, moins d’eau pour les grottes.',
    choix: [
      {
        label: 'Ouvrir la martelière',
        test: { skill: 'force', difficulte: 1 },
        reussite: {
          texte: 'Le volant résiste, grince, puis tourne. L’eau quitte le canal dans un grondement de torrent et s’étale dans la nuit, sur les vergers, sur la route, sur la draille. Au matin, la plaine du pertuis est un miroir.\n\nUn jour de plus.',
          effets: { flags: { delai_canal: true, citerne_basse: true, jour_gagne: true }, xp: { force: 10 }, quete: ['q_jour_de_plus', 'debut'] },
          suivant: '#fin',
        },
        echec: {
          texte: 'Le volant est grippé. Il te faut une heure, une barre de fer en levier et tes dernières forces pour le faire tourner d’un quart. Puis d’un autre. L’eau finit par partir, en grondant.\n\nUn jour de plus. Tu ne sens plus tes bras.',
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
    texte: 'Sénas, c’est des vergers à perte de vue, des pommiers en rangs serrés sous des filets anti-grêle noirs, comme des voiles de deuil tendus sur toute la plaine. Les fruits sont tombés. Ils pourrissent par milliers dans l’herbe, et l’air sent le cidre et la guêpe.\n\nLe village est vide. Pas désert : sur le mur de la station fruitière, quelqu’un a tracé à la bombe rouge une flèche et un mot. NON.\n\nAu bout de la grand-rue, le clocher de l’église. Si la cloche sonne, toute la plaine l’entendra. Le troupeau aussi.',
    choix: [{ label: 'Explorer', effets: { quete: ['q_jour_de_plus', 'debut'] }, suivant: '#fin' }],
  },

  // Marqueur 'porte_chambre_froide' (station fruitière).
  sen_station: {
    illu: 'senas_station', musique: 'tension', orateur: 'Une voix',
    texte: 'La station fruitière est un grand hangar de tôle, froid et noir, plein de palox empilés — ces caisses de bois où l’on stocke les pommes. Au fond, la porte d’une chambre froide. Épaisse, isolée, sans poignée côté hangar.\n\nTu frappes. Rien. Tu frappes encore.\n\nUne voix, derrière, étouffée par vingt centimètres d’isolant : « Allez-vous-en. On n’ouvre pas. On ne vous connaît pas. »',
    choix: [{ label: '« Le troupeau arrive. Dans deux jours, il sera ici. »', suivant: 'sen_station_2' }],
  },

  sen_station_2: {
    illu: 'senas_station', musique: 'sombre', orateur: 'Imbert',
    texte: 'Un silence. Puis un verrou qui claque, et la porte s’entrouvre de dix centimètres. Un visage d’homme, soixante-dix ans, une casquette de coopérative, une barbe blanche. Derrière lui, dans le noir froid, des yeux. Beaucoup d’yeux. Des enfants.\n\n« Imbert », dit-il. « On est onze. Mes petits-enfants, ma belle-fille, les voisins. Ils sont passés deux fois, les morts, depuis le début. Deux fois, on a fermé, on a éteint, on n’a pas respiré, et ils sont passés devant sans nous voir. Ce frigo, c’est une tombe. Ça nous a sauvés. »\n\nIl te regarde.\n\n« On ne bouge pas. »',
    choix: [
      {
        label: '« Venez à Calès. On passe la Durance dans deux jours. »',
        test: { chance: 0.5 },
        reussite: {
          texte: 'Imbert regarde ses petits-enfants. Longtemps. Puis il enlève sa casquette et se gratte la tête.\n\n« La Durance », dit-il. « Ma femme est enterrée à Cavaillon. Ça fait trente ans que je dis que je la rejoindrai de l’autre côté. » Il remet sa casquette. « Donnez-nous une heure pour les sacs. »',
          effets: { flags: { senas_rencontres: true, senas_rejoints: true } },
          suivant: '#fin',
        },
        echec: {
          texte: '« Non. » La porte se referme de cinq centimètres. « Vous êtes {gentil|gentille}. Mais les gentils, dehors, ils sont tous morts. »\n\nLe verrou claque.',
          effets: { flags: { senas_rencontres: true, senas_restent: true } },
          suivant: '#fin',
        },
      },
      { label: '« Alors restez. Et ne respirez pas. »', effets: { flags: { senas_rencontres: true, senas_restent: true } }, suivant: '#fin' },
    ],
  },

  // Marqueur 'corde_clocher' (clocher de l'église de Sénas).
  sen_cloches: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Dans le clocher de Sénas, la corde de la cloche pend jusqu’au sol, effilochée, raide de crasse. Une seule cloche, là-haut. Pas grosse. Mais la plaine est plate et le son porte : de Lamanon jusqu’à la Durance, tout ce qui a des oreilles l’entendra.\n\nSi tu sonnes, le troupeau va tourner. Il va descendre sur Sénas, sur la cloche, au lieu de monter droit vers le pertuis et les grottes. Un jour de détour.\n\nEt il va passer devant la station fruitière. Pendant des heures.',
    choix: [
      { label: 'Sonner', si: { flag: 'senas_rejoints' }, suivant: 'sen_sonner_vide' },
      { label: 'Sonner', si: { flag: 'senas_restent' }, suivant: 'sen_sonner_imbert' },
      { label: 'Sonner', si: { pasFlag: 'senas_rencontres' }, suivant: 'sen_sonner_inconnu' },
      { label: 'Lâcher la corde', suivant: '#fin' },
    ],
  },

  sen_sonner_vide: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu tires. La cloche s’ébranle, là-haut, et sa voix roule sur les vergers, sur les filets noirs, sur les pommes pourries, jusqu’au pertuis.\n\nLa station fruitière est vide. Les Imbert sont déjà sur la route de Calès, avec leurs sacs et leurs enfants. Tu sonnes pour rien d’autre que le temps.\n\nUn jour de plus. Gratuit. Le seul de toute cette histoire.',
    choix: [{ label: 'Descendre du clocher en courant', effets: { flags: { delai_senas: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  sen_sonner_imbert: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu penses à la porte de la chambre froide. Aux onze paires d’yeux dans le noir. À ce qu’a dit Imbert : deux fois, ils sont passés devant sans nous voir.\n\nTu sonnes.\n\nLa voix de la cloche roule sur la plaine. Au sud, très loin, contre le vent, la grande cloche du troupeau répond. Bong.\n\nUn jour de plus pour Calès. Pour la station fruitière, une troisième fois.',
    choix: [{ label: 'Descendre du clocher en courant', effets: { flags: { delai_senas: true, senas_sonne_sur_eux: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  sen_sonner_inconnu: {
    illu: 'senas_station', musique: 'tension',
    texte: 'Tu tires. La cloche s’ébranle, et sa voix roule sur les vergers, sur les filets noirs, jusqu’au pertuis.\n\nEn descendant, tu passes devant la station fruitière et tu entends, derrière la tôle, quelque chose que tu prends d’abord pour le vent. Des voix. Une voix d’enfant, qui demande pourquoi ça sonne.\n\nTu ne t’arrêtes pas. Il est trop tard pour s’arrêter.',
    choix: [{ label: 'Partir', effets: { flags: { delai_senas: true, senas_sonne_sur_eux: true, jour_gagne: true }, quete: ['q_jour_de_plus', 'fin'] }, suivant: '#fin' }],
  },

  // ─────────────────────────── LE TÉMOIGNAGE ───────────────────────────
  // Via le dialogue de Lou à Calès, si 'telephone_charge'.
  cal_temoignage: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Lou tient ton téléphone à deux mains, en paysage, comme une pro. Derrière toi, la paroi de safre, une bougie. Batterie : 19 %.\n\n« Tu regardes l’objectif, pas moi. Tu dis ton nom, la date, et tu racontes. Pas de fioritures. Les gens décrochent au bout de trente secondes s’il n’y a pas de fioritures, mais toi, t’en as pas besoin. » Elle appuie. Le point rouge s’allume. « Vas-y. »',
    choix: [
      { label: 'Tout raconter. Luc aussi.', effets: { flags: { temoignage_filme: true, temoignage_luc: true } }, suivant: 'cal_temoignage_fin' },
      { label: 'Tout raconter, sauf Luc', effets: { flag: 'temoignage_filme' }, suivant: 'cal_temoignage_fin' },
      { label: 'Renoncer', suivant: '#fin' },
    ],
  },

  cal_temoignage_fin: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Tu parles dix minutes. Tu montres ton bras à l’objectif. Si tu as encore le registre, tu en filmes les pages une par une, sous la bougie, pendant que Lou tient la lampe.\n\nQuand le point rouge s’éteint, Lou regarde la batterie. 6 %.\n\n« De l’autre côté du fleuve, il y aura du réseau », dit-elle. « Une barre, peut-être deux. Assez pour l’envoyer à la terre entière. » Elle te rend le téléphone. « Après, c’est toi qui vois. »',
    choix: [
      {
        label: 'Éteindre le téléphone',
        effets: { quete: ['q_temoignage', 'fin'], journal: 'J’ai filmé mon témoignage, avec Lou. De l’autre côté de la Durance, il y aura du réseau.' },
        suivant: '#fin',
      },
    ],
  },

  // ─────────────────────────── LA VEILLE ───────────────────────────
  // Via le dialogue de Joëlle (« On part à l'aube »), exige 'vernegues_fait'.
  ch2_veille: {
    illu: 'cales_falaises', musique: 'calme',
    texte: 'La dernière nuit à Calès, personne ne dort. Quelqu’un a sorti une guitare à laquelle il manque une corde. On chante des chansons que tout le monde connaît à moitié : de la variété des années quatre-vingt, du rap marseillais que les gamins de l’Empéri savent par cœur, et un vieux noël provençal que les anciens de Lamanon chantent les yeux fermés, et que les jeunes apprennent en riant.\n\nClémence s’est endormie contre sa mère. Lou, assise à côté de toi, dessine. Tu ne regardes pas ce qu’elle dessine. Tu sais.\n\nVers trois heures, les chansons s’arrêtent d’un coup. Tout le monde lève la tête.\n\nDans les chênes kermès, en haut de la falaise, les feuilles se sont mises à parler.\n\nLe vent. Il arrive du nord, de la vallée du Rhône, sec et froid, et il ne va plus s’arrêter.',
    choix: [
      {
        label: 'Te lever',
        effets: {
          flag: 'mistral_leve', quete: ['q_traversee', 'fin'], cinematique: 'le_mistral',
          journal: 'Le mistral s’est levé cette nuit. À l’aube, Calès part pour le pont de Mallemort.',
        },
        suivant: 'fin_depart',
      },
    ],
  },
};
