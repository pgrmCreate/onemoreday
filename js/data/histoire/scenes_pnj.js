// ============ Dialogues « à sujets » des PNJ (voir pnj.js) ============
// Chaque PNJ ouvre une scène-menu : texte d'accueil court + sujets conditionnels (si:) + « Partir ».
// Les sujets renvoient vers une réponse courte, qui revient au menu ('#fin' pour quitter).

const PARTIR = { label: 'Partir', suivant: '#fin' };

export const SCENES_PNJ = {

  // ─────────── MAUD (maison de Nostradamus, chapitre 1) ───────────
  maud_parler: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: 'Maud lève les yeux de son carnet. Elle a l’air d’avoir cent ans et d’être pressée.',
    choix: [
      { label: '« J’ai trouvé ton registre. »', si: { quete: ['q_protocole', 'confrontation'] }, suivant: 'ch1_confrontation' },
      { label: '« Parle-moi de l’Empéri. »', si: { quete: ['q_protocole', 'emperi'] }, suivant: 'maud_sujet_emperi' },
      { label: '« L’hôpital. Où est ton registre, exactement ? »', si: { quete: ['q_protocole', 'hopital'] }, suivant: 'maud_sujet_hopital' },
      { label: '« Qui est dans la cave ? »', si: { flag: 'cave_vue', pasFlag: 'confrontation_faite' }, suivant: 'maud_sujet_cave' },
      { label: '« J’ai vu une vidéo. Vidal m’a fermé la grille au nez. »', si: { flag: 'video_vue' }, suivant: 'maud_sujet_video' },
      { label: '« Pourquoi l’horloge est arrêtée ? »', suivant: 'maud_sujet_horloge' },
      { label: '« Pourquoi ici, chez Nostradamus ? »', suivant: 'maud_sujet_nostradamus' },
      PARTIR,
    ],
  },
  maud_sujet_emperi: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Vidal est un type bien. C’est ce qui le rend dangereux : il a des principes, et il les tient avec un sabre. » Elle tapote ton bras. « Il a fermé sa porte le premier jour et il ne l’a plus jamais rouverte à un inconnu. Si tu entres, c’est qu’il aura besoin de toi. Trouve pour quoi. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_hopital: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Sous-sol. La chambre froide de la morgue, sur la paillasse du fond, dans un sac de congélation. La porte s’ouvre au badge. » Elle hésite. « Le badge est sur Karim. Mon brancardier. Il est toujours là-bas. Il est… grand. » Elle détourne les yeux. « Et ne traîne pas en salle 4. »',
    choix: [{ label: '« Qu’est-ce qu’il y a en salle 4 ? »', suivant: 'maud_sujet_salle4' }, { label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_salle4: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Toi. » Elle allume une cigarette. « Il y avait toi, en salle 4. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_cave: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Une patiente. » Elle ne lève pas les yeux. « Elle dort. Elle se réveillera peut-être. » Un temps. « Je t’avais dit de ne pas descendre. Tu ne m’écoutes jamais. C’est bon signe : les morts, eux, obéissent. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_video: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud regarde la vidéo sans ciller, jusqu’au ciel bleu de la fin.\n\n« Dix-huit gamins derrière lui. Un inconnu devant. » Elle te rend le téléphone. « Je ne te dirai pas qu’il a eu raison. Je ne te dirai pas qu’il a eu tort. Je te dirai que sans cette main-là, tu ne serais pas mon patient, et que je ne sais pas si je dois l’en remercier. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_horloge: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Le 11 juin 1909, à vingt et une heures dix, la terre a tremblé et l’horloge s’est arrêtée. Le 2 septembre, à vingt et une heures dix, elle s’est arrêtée toute seule. Personne n’y a touché. » Elle hausse les épaules. « Je suis médecin. Je ne crois pas aux signes. Mais je sonne les cloches à cette heure-là. On ne sait jamais qui écoute. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },
  maud_sujet_nostradamus: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Trois étages, une porte, des murs de soixante centimètres. Et le propriétaire était médecin de la peste. » Elle désigne le mannequin de cire, sa robe noire, son chapeau. « En 1546, à Aix, il faisait des pilules de pétales de roses pour soigner les pestiférés. Ça ne marchait pas. Mais il est resté, quand les autres fuyaient. » Elle écrase sa cigarette. « C’est tout ce qu’on retient des médecins, à la fin : s’ils sont restés. »',
    choix: [{ label: 'Revenir', suivant: 'maud_parler' }],
  },

  // ─────────── VIDAL (Empéri) ───────────
  vidal_parler: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Vidal remonte ses lunettes réparées au sparadrap. « Oui ? »',
    choix: [
      { label: '« Lou et Nathan. Dis-m’en plus. »', si: { quete: ['q_protocole', 'saint_laurent'] }, suivant: 'vidal_sujet_lou' },
      { label: '« La radio. »', si: { flag: 'radio_ok', pasFlag: 'radio_essayee' }, suivant: 'emp_retour_radio' },
      { label: '« Le 6 septembre. La grille. »', si: { flag: 'video_vue', pasFlag: 'vidal_confronte' }, suivant: 'emp_vidal_6sept' },
      { label: '« Parle-moi du château. »', suivant: 'vidal_sujet_chateau' },
      { label: '« Comment tu tiens ? »', suivant: 'vidal_sujet_tenir' },
      PARTIR,
    ],
  },
  vidal_sujet_lou: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Lou Mercadier. Quinze ans. Elle dessine pendant mes cours, et elle a dix-huit de moyenne. Nathan, c’est son ombre. Un grand, drôle, qui lit tout ce qui parle de Nostradamus. » Il se tait. « La collégiale, c’est à trois cents mètres au nord, hors de l’anneau des cours. Ils y sont allés parce que les églises ont des cierges, et du vin de messe pour désinfecter. Des idées de gamins intelligents. »',
    choix: [{ label: 'Revenir', suivant: 'vidal_parler' }],
  },
  vidal_sujet_chateau: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Le premier texte qui en parle date de 975. Castrum de Sallone. Les archevêques d’Arles y ont vécu, puis des soldats, puis des touristes. » Il sourit. « En 1909, la terre a tremblé à en fendre les cheminées de toute la ville, et ces murs-là n’ont pas bougé d’un centimètre. Je le répète aux gamins tous les soirs. Je ne sais pas si ça les rassure. Moi, oui. »',
    choix: [{ label: 'Revenir', suivant: 'vidal_parler' }],
  },
  vidal_sujet_tenir: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Je fais cours. » Il te montre le tableau d’ardoise contre un mur de la cour, couvert de dates. « Tous les matins, une heure. Histoire, géographie, un peu de maths quand Mehdi veut bien. » Il hausse les épaules. « Tant qu’il y a un cours, il y a un lendemain. C’est l’idée. »',
    choix: [{ label: 'Revenir', suivant: 'vidal_parler' }],
  },

  // ─────────── LOU (Empéri) ───────────
  lou_parler: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Lou est assise sur le rempart, les jambes dans le vide, le carnet sur les genoux. Elle ne lève pas les yeux. « Quoi ? »',
    choix: [
      { label: '« Tu disais qu’on s’était déjà vus. »', si: { pasFlag: 'lou_sait' }, suivant: 'emp_lou_carnet' },
      { label: '« Ça va, pour Nathan ? »', suivant: 'lou_sujet_nathan' },
      { label: '« Qu’est-ce que tu dessines ? »', suivant: 'lou_sujet_dessin' },
      PARTIR,
    ],
  },
  lou_sujet_nathan: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Lou',
    texte: '« Non. » Elle continue de dessiner. « Mais je vais pas pleurer devant les petits. Vidal dit qu’on pleure la nuit, ici. C’est une règle. » Elle hausse une épaule. « C’est une bonne règle. »',
    choix: [{ label: 'Revenir', suivant: 'lou_parler' }],
  },
  lou_sujet_dessin: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Elle tourne le carnet vers toi. La vieille ville vue d’en haut, les toits, la Tour de l’Horloge, et dans les rues, des centaines de petites silhouettes minuscules, toutes tournées vers la tour.\n\n« Je dessine ce qui reste. Plus tard, quand ce sera fini, il faudra que quelqu’un se souvienne de quoi ça avait l’air. »',
    choix: [{ label: 'Revenir', suivant: 'lou_parler' }],
  },

  // ─────────── LOU (Calès) ───────────
  lou_parler_cales: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Lou s’est fait une niche dans une grotte à pigeons, avec une couverture, une bougie et le chien roux quand il veut bien. « Salut. »',
    choix: [
      { label: '« J’ai besoin de toi pour filmer quelque chose. »', si: { flag: 'telephone_charge', pasFlag: 'temoignage_filme' }, suivant: 'cal_temoignage' },
      { label: '« Tu m’en veux ? »', si: { flag: 'joelle_sait' }, suivant: 'lou_sujet_rancune' },
      { label: '« Vidal… »', si: { ou: [{ flag: 'vidal_mort' }, { flag: 'vidal_acheve' }, { flag: 'vidal_acheve_lou' }] }, suivant: 'lou_sujet_vidal' },
      { label: '« Qu’est-ce que tu dessines ? »', si: { pasFlag: 'dessin_recu' }, suivant: 'lou_sujet_dessin_cales' },
      PARTIR,
    ],
  },
  lou_sujet_rancune: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Lou',
    texte: '« Pour Luc ? Je le connaissais pas. C’est nous qui l’avons amené à la docteure, Samir et moi. Sur une porte, comme brancard. Il nous racontait des blagues nulles pour qu’on ait moins peur. » Elle se tait longtemps. « Non. Je t’en veux pas. Je m’en veux à moi. C’est plus pratique, j’ai l’habitude. »',
    choix: [{ label: 'Revenir', suivant: 'lou_parler_cales' }],
  },
  lou_sujet_vidal: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Lou',
    texte: '« Il m’avait mis un 11 en juin. Un 11, à moi. » Elle rit, avec des larmes. « J’étais tellement vénère. Je lui ai jamais dit que j’avais recopié. »',
    choix: [{ label: 'Revenir', suivant: 'lou_parler_cales' }],
  },
  lou_sujet_dessin_cales: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Elle déchire une page de son carnet et te la tend. C’est toi, de dos, debout au bord de la falaise, face à la plaine, avec des centaines de toutes petites silhouettes en bas, très loin.\n\n« Garde-le. Si un jour tu oublies à quoi tu ressembles. »',
    choix: [{ label: 'Prendre le dessin', effets: { objet: ['dessin_lou', 1], flag: 'dessin_recu' }, suivant: 'lou_parler_cales' }],
  },

  // ─────────── JOËLLE (Calès) ───────────
  joelle_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: 'Joëlle compte des boîtes de conserve sur une caisse, un crayon derrière l’oreille.',
    choix: [
      { label: '« Jo… »', si: { flag: 'joelle_sait' }, suivant: 'joelle_sujet_froid' },
      { label: '« Parle-moi de Luc. »', si: { pasFlag: 'joelle_sait' }, suivant: 'joelle_sujet_luc' },
      { label: '« Le pont de Mallemort. »', si: { quete: ['q_traversee', 'mallemort'] }, suivant: 'joelle_sujet_pont' },
      { label: '« La base aérienne. »', si: { quete: ['q_traversee', 'ba701'] }, suivant: 'joelle_sujet_base' },
      { label: '« J’ai la radio et les codes. »', si: { quete: ['q_traversee', 'contact'] }, suivant: 'joelle_sujet_radio' },
      { label: '« Le troupeau. On peut le ralentir ? »', si: { flag: 'cales_arrivee' }, suivant: 'joelle_sujet_troupeau' },
      { label: '« Et Maud ? »', si: { flag: 'maud_captive' }, suivant: 'joelle_sujet_maud' },
      {
        label: '« On part au premier coup de vent. Je suis {prêt|prête}. »',
        si: { quete: ['q_traversee', 'depart'] },
        besoin: { flag: 'vernegues_fait' },
        suivant: 'ch2_veille',
      },
      PARTIR,
    ],
  },
  joelle_sujet_froid: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Pas maintenant. » Elle ne lève pas les yeux de ses conserves. « Dis-moi ce qu’il faut faire pour passer le fleuve. Le reste, pas maintenant. Peut-être jamais. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },
  joelle_sujet_luc: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: '« Luc ? » Elle sourit malgré elle. « Électricien. Il a câblé la moitié des mas entre Lamanon et Alleins. Il chantait faux, il ronflait, il faisait les meilleurs pieds-paquets du département. » Son sourire tombe. « Il avait peur du sang. Il est parti chercher l’insuline à Salon à vélo, le pneu crevé. Si tu l’avais vu… Tu l’aurais aimé. Tout le monde l’aimait. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },
  joelle_sujet_pont: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: '« Mallemort, à l’est de Sénas. Le vieux pont suspendu et le pont de la route. » Elle trace le chemin sur la carte avec son crayon. « Va voir, ne te fais pas tuer, et reviens me dire. Dans cet ordre. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },
  joelle_sujet_base: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« La 701, au sud de Salon. Il y avait trois mille personnes, là-dedans, au début. » Elle se mord la lèvre. « Des gamins de vingt ans en uniforme. Prends ce qu’il faut, et ne descends dans rien de noir. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },
  joelle_sujet_radio: {
    illu: 'cales_grande_salle', musique: 'tension', orateur: 'Joëlle',
    texte: '« Alors monte à l’antenne, en haut de la falaise. Lou t’aidera à la tendre. » Elle pose son crayon. « Et parle bien. On n’aura qu’une fois. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },
  joelle_sujet_troupeau: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Deux idées. Aucune bonne. » Elle lève un doigt. « Le canal de Craponne passe au pied du village. Il y a une martelière. Ouvre-la, et la draille devient un marais. Mais c’est notre eau qui part avec. » Deuxième doigt. « Sénas, au nord-ouest. Une cloche d’église, en plein milieu de la plaine. S’ils l’entendent, ils descendront sur Sénas avant de monter sur nous. » Elle baisse la main. « Il paraît qu’il reste des gens, à Sénas. Je ne suis pas allée vérifier. Je ne veux pas savoir. »',
    choix: [
      { label: 'Revenir', effets: { quete: ['q_jour_de_plus', 'debut'], decouvrir: ['senas'] }, suivant: 'joelle_parler' },
    ],
  },
  joelle_sujet_maud: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Elle mange, elle dort, elle me regarde. » Joëlle serre son crayon jusqu’à le faire craquer. « Tous les jours, j’ai envie de descendre dans la grotte du puits avec le couteau à pain. Et tous les jours, je remonte. »',
    choix: [{ label: 'Revenir', suivant: 'joelle_parler' }],
  },

  // ─────────── CLÉMENCE (Calès) ───────────
  clemence_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Clémence est assise en tailleur, occupée à apprendre au chien roux à donner la patte. Le chien ne veut pas.',
    choix: [
      { label: '« Ça va, ta glycémie ? »', si: { flag: 'insuline_donnee' }, suivant: 'clem_glycemie' },
      { label: '« Il s’appelle comment, ton chien ? »', suivant: 'clem_chien' },
      { label: 'L’écouter', si: { flag: 'joelle_sait' }, suivant: 'clem_question' },
      PARTIR,
    ],
  },
  clem_glycemie: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Elle te montre fièrement l’écran de son lecteur. 1,12. « C’est bien, hein ? Maman dit que c’est papa qui me soigne de loin. Avec ses stylos. »',
    choix: [{ label: 'Revenir', suivant: 'clemence_parler' }],
  },
  clem_chien: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: '« Lou dit qu’il s’appelle Pistache, mais moi je l’appelle Monsieur. » Elle le gratte derrière l’oreille. « Il est arrivé tout seul. Il suivait les grands. Il a l’air d’avoir attendu quelqu’un très longtemps. »',
    choix: [{ label: 'Revenir', suivant: 'clemence_parler' }],
  },
  clem_question: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Clémence',
    texte: 'Clémence te regarde longtemps, avec cette gravité qu’ont les enfants quand ils ont décidé de poser la vraie question.\n\n« Maman dit que papa est dans toi. » Elle hésite. « Est-ce qu’il te parle ? »',
    choix: [
      { label: '« Non. »', suivant: 'clem_question_non' },
      { label: '« Parfois, je crois. »', effets: { flag: 'clem_papa_parle' }, suivant: 'clem_question_oui' },
      { label: '« Je ne sais pas. »', suivant: 'clem_question_non' },
    ],
  },
  clem_question_non: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Clémence',
    texte: '« Ah. » Elle hoche la tête, déçue, mais polie. « Il parlait tout le temps, pourtant. » Elle retourne au chien. « Monsieur, la patte. La PATTE. »',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },
  clem_question_oui: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Son visage s’éclaire d’un coup.\n\n« Tu lui diras que j’ai eu 1,12 ? »\n\nTu promets. Elle retourne au chien, rassurée, et tu restes là, avec ta promesse, à écouter en toi un silence qui ne répond pas.',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  // ─────────── MAUD (Calès : captive, ou médecin) ───────────
  maud_captive_parler: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Derrière la grille de jardin, au fond de la grotte du puits, Maud est assise par terre, le dos à la roche. Elle a l’air de quelqu’un qui a enfin le temps de penser, et qui s’en passerait.\n\n« Mon meilleur cas. Tu viens voir ton médecin ? »',
    choix: [
      { label: '« Pourquoi Luc ? Pourquoi lui ? »', suivant: 'maud_sujet_pourquoi_luc' },
      { label: '« Parle devant mon téléphone. »', si: { flag: 'telephone_charge', pasFlag: 'temoignage_maud' }, suivant: 'maud_film' },
      { label: '« Le Berger te veut. »', si: { flag: 'berger_offre_maud', pasFlag: 'berger_refus_maud' }, suivant: 'maud_livrer_berger' },
      { label: 'Ouvrir la grille, cette nuit', si: { nuit: true }, suivant: 'maud_liberer' },
      { label: 'Entrer dans la grotte, cette nuit, pour en finir', si: { nuit: true }, suivant: 'maud_tuer' },
      PARTIR,
    ],
  },
  maud_sujet_pourquoi_luc: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Parce que tu étais à J+5 et que ça ne pouvait pas attendre. Parce qu’il est arrivé le bon soir. Parce qu’il était seul, sans famille à Salon pour venir demander. » Elle te regarde. « Parce que c’était lui ou personne, et que personne, pour toi, ça voulait dire la housse et l’incinérateur. J’ai choisi toi. Je te choisirais encore. Ne me demande pas de le regretter : je ne sais pas faire. »',
    choix: [{ label: 'Revenir', suivant: 'maud_captive_parler' }],
  },
  maud_medecin_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: 'Dans la grotte qui sert d’infirmerie, Maud recoud l’arcade d’un gamin qui ne pleure pas parce qu’elle lui a dit que c’était interdit. Elle ne lève pas les yeux. « Deux minutes. »',
    choix: [
      { label: '« Comment va Clémence ? »', suivant: 'maud_sujet_clemence' },
      { label: '« On a menti à Jo. »', si: { flag: 'mensonge_jo' }, suivant: 'maud_sujet_mensonge' },
      { label: '« Parle devant mon téléphone. »', si: { flag: 'telephone_charge', pasFlag: 'temoignage_maud' }, suivant: 'maud_film' },
      PARTIR,
    ],
  },
  maud_sujet_clemence: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: '« Stable. Une gamine intelligente, qui compte ses glucides mieux que moi. » Elle coupe son fil. « L’insuline de son père la tiendra jusqu’en novembre. Après, il faudra l’autre côté du fleuve. » Un temps. « Ironique, hein ? Tout ce qu’il a fait, il l’a fait. »',
    choix: [{ label: 'Revenir', suivant: 'maud_medecin_parler' }],
  },
  maud_sujet_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Oui. » Elle enlève ses gants. « Et on va vivre avec. Ça s’appelle être adulte. » Elle te regarde enfin. « Elle ne le saura jamais par moi. Si elle le sait un jour, ce sera par toi. C’est ta dette, maintenant. Pas la mienne. »',
    choix: [{ label: 'Revenir', suivant: 'maud_medecin_parler' }],
  },

  // ─────────── LE BERGER, ROSE, NADÈGE (Vieux-Vernègues) ───────────
  berger_parler: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: 'Le Berger tisonne son feu de sarments. Les deux chiens lèvent la tête. « Te revoilà. Tu as réfléchi ? »',
    choix: [
      { label: '« Parle-moi encore de Rose. »', suivant: 'ver_berger_morts' },
      { label: '« Où vas-tu, au juste ? »', suivant: 'ver_berger_estive' },
      { label: '« Ta proposition, pour la médecin. »', si: { flag: 'berger_offre_maud', pasFlag: 'maud_berger' }, suivant: 'berger_rappel_offre' },
      { label: '« Ta sonnaille. »', si: { pasFlag: 'vernegues_fait' }, suivant: 'ver_berger_marche' },
      PARTIR,
    ],
  },
  berger_rappel_offre: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Elle est dans votre trou, à Calès, derrière une grille. » Il sourit. « Nadège passera une nuit. Elle mettra du chiffon dans sa cloche. Ouvre la grille, c’est tout ce que je te demande. Et le troupeau contournera les grottes, parole de berger. »',
    choix: [{ label: 'Revenir', suivant: 'berger_parler' }],
  },
  rose_parler: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose est assise dans la sacristie effondrée, le redon entre les jambes. Elle te sourit, un peu.',
    choix: [
      { label: 'T’asseoir près d’elle', si: { pasFlag: 'rose_promesse' }, suivant: 'ver_rose' },
      { label: '« Au pont, alors. »', si: { flag: 'rose_promesse' }, suivant: 'rose_rappel' },
      { label: '« Je peux te filmer ? Pour que ça se sache. »', si: { flag: 'telephone_charge', pasFlag: 'temoignage_rose' }, suivant: 'rose_film' },
      PARTIR,
    ],
  },
  rose_rappel: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Au pont. » Elle caresse le bronze. « Je la tiendrai jusque-là. Ne sois pas en retard. Baptistin, lui, n’est jamais en retard. »',
    choix: [{ label: 'Revenir', suivant: 'rose_parler' }],
  },
  nadege_parler: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: 'Nadège graisse sa sonnaille avec un bout de chiffon. « Oui ? »',
    choix: [
      { label: '« La base 701. Je cherche une radio et des codes. »', suivant: 'nadege_sujet_base' },
      { label: '« Comment tu es revenue ? »', suivant: 'nadege_sujet_histoire' },
      { label: '« Vous êtes combien, comme nous ? »', suivant: 'nadege_sujet_revenus' },
      PARTIR,
    ],
  },
  nadege_sujet_base: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: '« Bâtiment de l’escadron de protection, derrière le poste de garde. Les radios tactiques sont dans l’armoire forte du PC. Le classeur d’authentification aussi. La clé est au cou du lieutenant de permanence. » Elle sourit. « Il y est toujours, je pense. Il était assis. Il doit toujours être assis. »',
    choix: [{ label: 'Revenir', effets: { flag: 'info_ba701' }, suivant: 'nadege_parler' }],
  },
  nadege_sujet_histoire: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Nadège',
    texte: '« Mordue le 5, au poste de garde. Le 7, j’ai rejoint le troupeau sans le savoir. Le 8, le troupeau a trouvé une famille dans un mas d’Eyguières. » Elle s’arrête de frotter. « Le 19, je me suis réveillée dans une grange, et le Berger m’a donné du café. Je ne sais pas qui j’ai mangé. Il y avait trois personnes dans ce mas. Je ne saurai jamais laquelle. » Elle reprend son chiffon. « C’est peut-être mieux. C’est peut-être pire. Je change d’avis tous les jours. »',
    choix: [{ label: 'Revenir', suivant: 'nadege_parler' }],
  },
  nadege_sujet_revenus: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Nadège',
    texte: '« Vingt-trois, ce matin. Soixante et un ratés, qu’on garde enchaînés dans les caves, au cas où la médecin trouverait. » Elle montre les bougies. « Et chaque semaine, quelques-uns de plus. Le troupeau mange, et le troupeau revient. C’est lent. C’est le prix. »',
    choix: [{ label: 'Revenir', suivant: 'nadege_parler' }],
  },

  // ─────────── IMBERT (Sénas) ───────────
  imbert_parler: {
    illu: 'senas_station', musique: 'sombre', orateur: 'Imbert',
    texte: 'La porte de la chambre froide s’entrouvre de dix centimètres. « Encore vous ? »',
    choix: [
      {
        label: '« Venez à Calès. Dernière chance. »',
        test: { chance: 0.35 },
        reussite: { texte: 'Imbert soupire. « Vous êtes têtu. Ma femme aussi l’était. » Il ouvre la porte en grand. « Une heure pour les sacs. »', effets: { flags: { senas_rejoints: true, senas_restent: false } }, suivant: '#fin' },
        echec: { texte: '« Non. » La porte se referme doucement, sans claquer. Presque avec gentillesse.', suivant: '#fin' },
      },
      PARTIR,
    ],
  },
};
