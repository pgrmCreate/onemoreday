// ============ Dialogues « à sujets » des PNJ (voir pnj.js) ============
// Chaque PNJ ouvre une scène-menu : texte d'accueil court + sujets conditionnels (si:) + « Partir ».
// Les sujets renvoient vers une réponse courte, qui revient au menu ('#fin' pour quitter).

const PARTIR = { label: 'Partir', suivant: '#fin' };

export const SCENES_PNJ = {

  // ─────────── MAUD (maison de Nostradamus, chapitre 1) ───────────
  maud_parler: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: 'Maud lève les yeux de son carnet. Elle a l’air d’avoir cent ans, et d’être pressée.',
    choix: [
      { label: 'Lui dire : « J’ai trouvé ton registre. »', si: { quete: ['q_protocole', 'confrontation'] }, suivant: 'ch1_confrontation' },
      { label: 'Demander comment entrer à l’Empéri', si: { quete: ['q_protocole', 'emperi'] }, suivant: 'maud_sujet_emperi' },
      { label: 'Demander où est son registre à l’hôpital', si: { quete: ['q_protocole', 'hopital'] }, suivant: 'maud_sujet_hopital' },
      { label: 'Demander qui est enfermé dans la cave', si: { flag: 'cave_vue', pasFlag: 'confrontation_faite' }, suivant: 'maud_sujet_cave' },
      { label: 'Parler de la vidéo : Vidal t’a fermé la grille', si: { flag: 'video_vue' }, suivant: 'maud_sujet_video' },
      { label: 'Demander pourquoi l’horloge est arrêtée', suivant: 'maud_sujet_horloge' },
      { label: 'Demander pourquoi se cacher chez Nostradamus', suivant: 'maud_sujet_nostradamus' },
      PARTIR,
    ],
  },
  maud_sujet_emperi: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Vidal, le prof qui tient le château avec ses élèves, est un type bien, et c’est justement ce qui le rend dangereux : il a des principes, et il les défend comme avec un sabre. » Elle tapote ton bras. « Il a fermé sa porte le premier jour, et il ne l’a plus jamais rouverte à un inconnu. Si tu veux entrer, il faut qu’il ait besoin de toi. Trouve pour quoi. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_hopital: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Au sous-sol, dans la chambre froide de la morgue, sur la paillasse du fond, dans un sac de congélation. La porte s’ouvre avec un badge. » Elle hésite. « Le badge est sur Karim, mon brancardier, qui est toujours là-bas. Il est… grand, et il n’est plus vivant. » Elle détourne les yeux. « Et ne traîne pas en salle 4. »',
    choix: [{ label: 'Demander ce qu’il y a en salle 4', suivant: 'maud_sujet_salle4' }, { label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_salle4: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Toi. » Elle allume une cigarette. « Dans la salle 4, il y avait toi. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_cave: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: '« Une patiente. » Elle ne lève pas les yeux. « Elle dort, et elle se réveillera peut-être. » Elle se tait un moment. « Je t’avais dit de ne pas descendre, mais tu ne m’écoutes jamais. C’est bon signe : les morts, eux, obéissent. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_video: {
    illu: 'nostradamus_cabinet', musique: 'sombre', orateur: 'Maud',
    texte: 'Maud regarde la vidéo sans ciller, jusqu’au ciel bleu de la fin.\n\n« Dix-huit gamins derrière lui, et un inconnu devant. » Elle te rend le téléphone. « Je ne te dirai pas qu’il a eu raison, ni qu’il a eu tort. Je te dirai seulement que sans ce geste-là, personne ne t’aurait {mordu|mordue}, tu ne serais pas mon patient, et je ne sais pas si je dois l’en remercier. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_horloge: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Le 11 juin 1909, à vingt et une heures dix, la terre a tremblé, et l’horloge de la Tour s’est arrêtée. Le 2 septembre dernier, le jour où tout a commencé, elle s’est arrêtée toute seule à vingt et une heures dix, sans que personne y touche. » Elle hausse les épaules. « Je suis médecin, je ne crois pas aux signes. Mais je fais sonner les cloches à cette heure-là, parce qu’on ne sait jamais qui écoute. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },
  maud_sujet_nostradamus: {
    illu: 'nostradamus_cabinet', musique: 'calme', orateur: 'Maud',
    texte: '« Trois étages, une seule porte, des murs de soixante centimètres d’épaisseur, et un propriétaire qui soignait la peste. » Elle désigne le mannequin de cire, avec sa robe noire et son chapeau. « En 1546, à Aix, Nostradamus fabriquait des pilules de pétales de rose pour les malades. Ça ne marchait pas, mais il est resté quand les autres fuyaient. » Elle écrase sa cigarette. « À la fin, c’est tout ce qu’on retient d’un médecin : s’il est resté. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_parler' }],
  },

  // ─────────── VIDAL (Empéri) ───────────
  vidal_parler: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: 'Vidal remonte ses lunettes réparées au sparadrap. « Oui ? »',
    choix: [
      { label: 'Lui demander qui sont Lou et Nathan', si: { quete: ['q_protocole', 'saint_laurent'] }, suivant: 'vidal_sujet_lou' },
      { label: 'Parler de la radio', si: { flag: 'radio_ok', pasFlag: 'radio_essayee' }, suivant: 'emp_retour_radio' },
      { label: 'Parler du 6 septembre, à la grille', si: { flag: 'video_vue', pasFlag: 'vidal_confronte' }, suivant: 'emp_vidal_6sept' },
      { label: 'L’interroger sur le château', suivant: 'vidal_sujet_chateau' },
      { label: 'Lui demander comment il tient le coup', suivant: 'vidal_sujet_tenir' },
      PARTIR,
    ],
  },
  vidal_sujet_lou: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Lou Mercadier, quinze ans. Elle dessine pendant mes cours, et elle a dix-huit de moyenne. Nathan, c’est son ombre, un grand drôle qui lit tout ce qui parle de Nostradamus. » Il se tait un instant. « Ils sont partis à la collégiale Saint-Laurent, à trois cents mètres au nord, en dehors de la vieille ville, parce que les églises ont des cierges et du vin de messe pour désinfecter. Ce sont des idées de gamins intelligents. Mais ils ne sont pas revenus. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'vidal_parler' }],
  },
  vidal_sujet_chateau: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Le premier texte qui parle de ce château date de 975. Les archevêques d’Arles y ont vécu, puis des soldats, puis des touristes. » Il sourit. « En 1909, le tremblement de terre a fendu les cheminées de toute la ville, et ces murs-là n’ont pas bougé d’un centimètre. Je le répète aux gamins tous les soirs. Je ne sais pas si ça les rassure, mais moi, ça me rassure. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'vidal_parler' }],
  },
  vidal_sujet_tenir: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Vidal',
    texte: '« Je fais cours. » Il te montre le tableau d’ardoise posé contre un mur de la cour, couvert de dates. « Tous les matins, pendant une heure : histoire, géographie, et un peu de maths quand Mehdi veut bien. » Il hausse les épaules. « Tant qu’il y a un cours, il y a un lendemain. C’est l’idée. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'vidal_parler' }],
  },

  // ─────────── LOU (Empéri) ───────────
  lou_parler: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Lou est assise sur le rempart, les jambes dans le vide et son carnet sur les genoux. Elle ne lève pas les yeux. « Quoi ? »',
    choix: [
      { label: 'Lui demander où elle t’a déjà vu', si: { pasFlag: 'lou_sait' }, suivant: 'emp_lou_carnet' },
      { label: 'Lui demander comment elle va, pour Nathan', suivant: 'lou_sujet_nathan' },
      { label: 'Lui demander ce qu’elle dessine', suivant: 'lou_sujet_dessin' },
      PARTIR,
    ],
  },
  lou_sujet_nathan: {
    illu: 'emperi_cour', musique: 'sombre', orateur: 'Lou',
    texte: '« Non, ça ne va pas. » Elle continue de dessiner. « Mais je ne vais pas pleurer devant les petits. Vidal dit qu’ici, on pleure la nuit : c’est une règle. » Elle hausse une épaule. « C’est une bonne règle. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'lou_parler' }],
  },
  lou_sujet_dessin: {
    illu: 'emperi_cour', musique: 'calme', orateur: 'Lou',
    texte: 'Elle tourne le carnet vers toi. Tu y vois la vieille ville vue d’en haut, les toits et la Tour de l’Horloge, et dans les rues, des centaines de silhouettes minuscules, des morts, toutes tournées vers la Tour.\n\n« Je dessine ce qui reste. Plus tard, quand ce sera fini, il faudra bien que quelqu’un se souvienne de quoi ça avait l’air. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'lou_parler' }],
  },

  // ─────────── LOU (Calès) ───────────
  lou_parler_cales: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Lou s’est installée dans une petite grotte à pigeons, avec une couverture, une bougie, et le chien roux quand il veut bien. « Salut. »',
    choix: [
      { label: 'Lui demander de filmer ton témoignage', si: { flag: 'telephone_charge', pasFlag: 'temoignage_filme' }, suivant: 'cal_temoignage' },
      { label: 'Lui demander si elle t’en veut', si: { flag: 'joelle_sait' }, suivant: 'lou_sujet_rancune' },
      { label: 'Lui parler de Vidal', si: { ou: [{ flag: 'vidal_mort' }, { flag: 'vidal_acheve' }, { flag: 'vidal_acheve_lou' }] }, suivant: 'lou_sujet_vidal' },
      { label: 'Lui demander ce qu’elle dessine', si: { pasFlag: 'dessin_recu' }, suivant: 'lou_sujet_dessin_cales' },
      PARTIR,
    ],
  },
  lou_sujet_rancune: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Lou',
    texte: '« Pour Luc ? Je ne le connaissais pas. C’est nous qui l’avons amené à la docteure, Samir et moi. On l’a porté sur une porte, comme sur un brancard, et il nous racontait des blagues nulles pour qu’on ait moins peur. » Elle se tait longtemps. « Non, je ne t’en veux pas. Je m’en veux à moi, c’est plus pratique, j’ai l’habitude. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'lou_parler_cales' }],
  },
  lou_sujet_vidal: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Lou',
    texte: '« Il m’avait mis un 11 en juin. Un 11, à moi ! » Elle rit, les larmes aux yeux. « J’étais tellement furieuse. Je ne lui ai jamais dit que j’avais copié. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'lou_parler_cales' }],
  },
  lou_sujet_dessin_cales: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Lou',
    texte: 'Elle détache une page de son carnet et te la tend. C’est toi, de dos, debout au bord de la falaise face à la plaine, avec tout en bas, très loin, des centaines de toutes petites silhouettes.\n\n« Garde-le, si un jour tu oublies à quoi tu ressembles. »',
    choix: [{ label: 'Prendre le dessin', effets: { objet: ['dessin_lou', 1], flag: 'dessin_recu' }, suivant: 'lou_parler_cales' }],
  },

  // ─────────── JOËLLE (Calès) ───────────
  joelle_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: 'Joëlle compte des boîtes de conserve sur une caisse, un crayon coincé derrière l’oreille.',
    choix: [
      { label: 'Essayer de lui parler : « Jo… »', si: { flag: 'joelle_sait' }, suivant: 'joelle_sujet_froid' },
      { label: 'Lui demander de te parler de Luc', si: { pasFlag: 'joelle_sait' }, suivant: 'joelle_sujet_luc' },
      { label: 'Parler du pont de Mallemort', si: { quete: ['q_traversee', 'mallemort'] }, suivant: 'joelle_sujet_pont' },
      { label: 'Parler de la base aérienne 701', si: { quete: ['q_traversee', 'ba701'] }, suivant: 'joelle_sujet_base' },
      { label: 'Lui dire que tu as la radio et les codes', si: { quete: ['q_traversee', 'contact'] }, suivant: 'joelle_sujet_radio' },
      { label: 'Demander comment ralentir le troupeau', si: { flag: 'cales_arrivee' }, suivant: 'joelle_sujet_troupeau' },
      { label: 'Lui demander ce qu’elle pense de Maud', si: { flag: 'maud_captive' }, suivant: 'joelle_sujet_maud' },
      {
        label: 'Lui dire que tu es {prêt|prête} à partir',
        si: { quete: ['q_traversee', 'depart'] },
        besoin: { flag: 'vernegues_fait' },
        suivant: 'ch2_veille',
      },
      PARTIR,
    ],
  },
  joelle_sujet_froid: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Pas maintenant. » Elle ne lève pas les yeux de ses conserves. « Dis-moi ce qu’il faut faire pour passer le fleuve. Le reste, pas maintenant, et peut-être jamais. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },
  joelle_sujet_luc: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: '« Luc ? » Elle sourit malgré elle. « Il était électricien, il a refait l’électricité de la moitié des fermes entre Lamanon et Alleins. Il chantait faux, il ronflait, et il faisait les meilleurs pieds-paquets du département. » Son sourire s’efface. « Il avait peur du sang, et il est parti chercher l’insuline à Salon avec son vélo au pneu crevé. Si tu l’avais connu, tu l’aurais aimé. Tout le monde l’aimait. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },
  joelle_sujet_pont: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Joëlle',
    texte: '« C’est à Mallemort, à l’est de Sénas, sur la Durance. Il y a le vieux pont suspendu et le pont de la route. » Elle trace le chemin sur la carte avec son crayon. « Va voir, ne te fais pas tuer, et reviens me raconter. Dans cet ordre. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },
  joelle_sujet_base: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« La base aérienne 701 est au sud de Salon. Au début, il y avait trois mille personnes là-dedans. » Elle se mord la lèvre. « Des gamins de vingt ans en uniforme, qui sont tous morts maintenant, ou pire. Prends ce qu’il te faut, et ne descends dans aucun endroit sombre. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },
  joelle_sujet_radio: {
    illu: 'cales_grande_salle', musique: 'tension', orateur: 'Joëlle',
    texte: '« Alors monte installer l’antenne en haut de la falaise, Lou t’aidera à la tendre. » Elle pose son crayon. « Et parle bien, parce qu’on n’aura qu’une seule chance. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },
  joelle_sujet_troupeau: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« J’ai deux idées, et aucune n’est bonne. » Elle lève un doigt. « Le canal de Craponne passe au pied du village, avec une grosse vanne. Si tu l’ouvres, l’eau inonde le chemin des morts et le transforme en marais, mais c’est aussi notre eau qui part. » Elle lève un deuxième doigt. « Il y a Sénas, au nord-ouest, avec une cloche d’église en plein milieu de la plaine. Si les morts l’entendent, ils descendront sur Sénas avant de monter vers nous. » Elle baisse la main. « Il paraît qu’il reste des gens à Sénas. Je ne suis pas allée vérifier, et je ne veux pas savoir. »',
    choix: [
      { label: 'Parler d’autre chose', effets: { quete: ['q_jour_de_plus', 'debut'], decouvrir: ['senas'] }, suivant: 'joelle_parler' },
    ],
  },
  joelle_sujet_maud: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Joëlle',
    texte: '« Elle mange, elle dort, et elle me regarde. » Joëlle serre son crayon à le faire craquer. « Tous les jours, j’ai envie de descendre dans la grotte du puits avec le couteau à pain, et tous les jours, je remonte. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'joelle_parler' }],
  },

  // ─────────── CLÉMENCE (Calès) ───────────
  clemence_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Clémence est assise en tailleur et essaie d’apprendre au chien roux à donner la patte, mais le chien ne veut pas.',
    choix: [
      { label: 'Lui demander si son taux de sucre va bien', si: { flag: 'insuline_donnee' }, suivant: 'clem_glycemie' },
      { label: 'Lui demander le nom de son chien', suivant: 'clem_chien' },
      { label: 'L’écouter', si: { flag: 'joelle_sait' }, suivant: 'clem_question' },
      PARTIR,
    ],
  },
  clem_glycemie: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Elle te montre fièrement l’écran de son lecteur, qui affiche 1,12 gramme de sucre par litre de sang, un bon chiffre. « C’est bien, hein ? Maman dit que c’est papa qui me soigne de loin, avec ses stylos. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'clemence_parler' }],
  },
  clem_chien: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: '« Lou dit qu’il s’appelle Pistache, mais moi je l’appelle Monsieur. » Elle le gratte derrière l’oreille. « Il est arrivé tout seul, en suivant les grands, et il a l’air d’avoir attendu quelqu’un très longtemps. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'clemence_parler' }],
  },
  clem_question: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Clémence',
    texte: 'Clémence te regarde longtemps, avec la gravité des enfants qui ont décidé de poser la vraie question.\n\n« Maman dit que papa est dans toi. » Elle hésite. « Est-ce qu’il te parle ? »',
    choix: [
      { label: 'Répondre : « Non. »', suivant: 'clem_question_non' },
      { label: 'Répondre : « Parfois, je crois. »', effets: { flag: 'clem_papa_parle' }, suivant: 'clem_question_oui' },
      { label: 'Répondre : « Je ne sais pas. »', suivant: 'clem_question_non' },
    ],
  },
  clem_question_non: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Clémence',
    texte: '« Ah. » Elle hoche la tête, déçue mais polie. « Il parlait tout le temps, pourtant. » Elle retourne au chien. « Monsieur, la patte. La PATTE ! »',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },
  clem_question_oui: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Clémence',
    texte: 'Son visage s’éclaire d’un coup.\n\n« Tu lui diras que j’ai eu 1,12 ? »\n\nTu le lui promets, et elle retourne au chien, rassurée. Toi, tu restes là avec ta promesse, à écouter en toi un silence qui ne répond pas.',
    choix: [{ label: 'Partir', suivant: '#fin' }],
  },

  // ─────────── MAUD (Calès : captive, ou médecin) ───────────
  maud_captive_parler: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: 'Derrière la grille de jardin, au fond de la grotte du puits, Maud est assise par terre, le dos contre la roche. Elle a l’air de quelqu’un qui a enfin le temps de réfléchir, et qui s’en passerait bien.\n\n« Mon meilleur cas. Tu viens rendre visite à ton médecin ? »',
    choix: [
      { label: 'Lui demander : « Pourquoi Luc ? »', suivant: 'maud_sujet_pourquoi_luc' },
      { label: 'Lui demander de témoigner devant ton téléphone', si: { flag: 'telephone_charge', pasFlag: 'temoignage_maud' }, suivant: 'maud_film' },
      { label: 'Lui dire que le Berger la réclame', si: { flag: 'berger_offre_maud', pasFlag: 'berger_refus_maud' }, suivant: 'maud_livrer_berger' },
      { label: 'La libérer cette nuit', si: { nuit: true }, suivant: 'maud_liberer' },
      { label: 'Revenir cette nuit pour la tuer', si: { nuit: true }, suivant: 'maud_tuer' },
      PARTIR,
    ],
  },
  maud_sujet_pourquoi_luc: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Parce que tu en étais à ton cinquième jour, et qu’ensuite il aurait été trop tard. Parce qu’il est arrivé le bon soir, et qu’il était seul, sans famille à Salon pour venir le réclamer. » Elle te regarde. « Parce que c’était lui ou personne, et que personne, pour toi, ça voulait dire la housse et l’incinérateur. Je t’ai {choisi|choisie}, toi, et je te choisirais encore. Ne me demande pas de le regretter : je ne sais pas faire. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_captive_parler' }],
  },
  maud_medecin_parler: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: 'Dans la grotte qui sert d’infirmerie, Maud recoud le sourcil d’un gamin, qui ne pleure pas parce qu’elle lui a dit que c’était interdit. Elle ne lève pas les yeux. « Deux minutes. »',
    choix: [
      { label: 'Lui demander comment va Clémence', suivant: 'maud_sujet_clemence' },
      { label: 'Parler du mensonge fait à Jo', si: { flag: 'mensonge_jo' }, suivant: 'maud_sujet_mensonge' },
      { label: 'Lui demander de témoigner devant ton téléphone', si: { flag: 'telephone_charge', pasFlag: 'temoignage_maud' }, suivant: 'maud_film' },
      PARTIR,
    ],
  },
  maud_sujet_clemence: {
    illu: 'cales_grande_salle', musique: 'calme', orateur: 'Maud',
    texte: '« Elle est stable. C’est une gamine intelligente, qui compte ses sucres mieux que moi. » Elle coupe son fil. « L’insuline de son père la tiendra jusqu’en novembre, et après, il faudra être de l’autre côté du fleuve. » Elle se tait un moment. « C’est ironique, hein ? Ce qu’il était venu faire, il l’a fait. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_medecin_parler' }],
  },
  maud_sujet_mensonge: {
    illu: 'cales_grande_salle', musique: 'sombre', orateur: 'Maud',
    texte: '« Oui, on lui a menti. » Elle retire ses gants. « Et on va vivre avec : ça s’appelle être adulte. » Elle te regarde enfin. « Elle ne l’apprendra jamais par moi. Si elle l’apprend un jour, ce sera par toi. C’est ta dette, maintenant, plus la mienne. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'maud_medecin_parler' }],
  },

  // ─────────── LE BERGER, ROSE, NADÈGE (Vieux-Vernègues) ───────────
  berger_parler: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: 'Le Berger remue les braises de son feu, et ses deux chiens lèvent la tête. « Te revoilà. Tu as réfléchi ? »',
    choix: [
      { label: 'Lui demander de te parler de Rose', suivant: 'ver_berger_morts' },
      { label: 'Lui demander où il va, exactement', suivant: 'ver_berger_estive' },
      { label: 'Reparler de son marché : la médecin', si: { flag: 'berger_offre_maud', pasFlag: 'maud_berger' }, suivant: 'berger_rappel_offre' },
      { label: 'Reparler de sa sonnaille', si: { pasFlag: 'vernegues_fait' }, suivant: 'ver_berger_marche' },
      PARTIR,
    ],
  },
  berger_rappel_offre: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Le Berger',
    texte: '« Elle est chez vous, à Calès, dans une grotte, derrière une grille. » Il sourit. « Nadège passera une nuit, avec du chiffon dans sa clochette pour ne pas faire de bruit. Tout ce que je te demande, c’est d’ouvrir la grille. En échange, le troupeau contournera les grottes, parole de berger. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'berger_parler' }],
  },
  rose_parler: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: 'Rose est assise dans la sacristie effondrée, avec le redon, la grande cloche du troupeau, posé entre ses jambes. Elle te sourit un peu.',
    choix: [
      { label: 'T’asseoir près d’elle', si: { pasFlag: 'rose_promesse' }, suivant: 'ver_rose' },
      { label: 'Lui rappeler sa promesse : « Au pont. »', si: { flag: 'rose_promesse' }, suivant: 'rose_rappel' },
      { label: 'Lui demander de témoigner devant ton téléphone', si: { flag: 'telephone_charge', pasFlag: 'temoignage_rose' }, suivant: 'rose_film' },
      PARTIR,
    ],
  },
  rose_rappel: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Rose',
    texte: '« Au pont. » Elle caresse le bronze. « Je garderai la cloche jusque-là. Ne sois pas en retard : Baptistin, lui, n’est jamais en retard. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'rose_parler' }],
  },
  nadege_parler: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: 'Nadège graisse sa clochette avec un bout de chiffon. « Oui ? »',
    choix: [
      { label: 'Lui demander où trouver la radio à la base 701', suivant: 'nadege_sujet_base' },
      { label: 'Lui demander comment elle est revenue', suivant: 'nadege_sujet_histoire' },
      { label: 'Lui demander combien ils sont, comme vous', suivant: 'nadege_sujet_revenus' },
      PARTIR,
    ],
  },
  nadege_sujet_base: {
    illu: 'vernegues_ruines', musique: 'calme', orateur: 'Nadège',
    texte: '« Va au bâtiment de la sécurité, derrière le poste de garde. Les radios militaires sont dans l’armoire forte du poste de commandement, avec le classeur des codes, et la clé est au cou de l’officier de garde. » Elle sourit. « Je pense qu’il y est toujours. Il était assis à sa console, et il doit toujours y être assis, mort, mais assis. »',
    choix: [{ label: 'Parler d’autre chose', effets: { flag: 'info_ba701' }, suivant: 'nadege_parler' }],
  },
  nadege_sujet_histoire: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Nadège',
    texte: '« J’ai été mordue le 5 septembre, au poste de garde. Le 7, j’étais morte, et j’ai suivi le troupeau sans le savoir. Le 8, le troupeau a trouvé une famille dans une ferme d’Eyguières. » Elle arrête de frotter. « Le 19, je me suis réveillée dans une grange, et le Berger m’a donné du café. Je ne sais pas qui j’ai mangé : il y avait trois personnes dans cette ferme, et je ne saurai jamais laquelle. » Elle reprend son chiffon. « C’est peut-être mieux, ou peut-être pire. Je change d’avis tous les jours. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'nadege_parler' }],
  },
  nadege_sujet_revenus: {
    illu: 'vernegues_ruines', musique: 'sombre', orateur: 'Nadège',
    texte: '« Ce matin, on avait vingt-trois revenus, et soixante et un ratés, ceux qui se sont réveillés puis sont retombés, qu’on garde enchaînés dans les caves au cas où la médecin trouverait un remède. » Elle montre les bougies. « Chaque semaine, il en revient quelques-uns de plus. Le troupeau mange, et le troupeau revient. C’est lent, et c’est le prix. »',
    choix: [{ label: 'Parler d’autre chose', suivant: 'nadege_parler' }],
  },

  // ─────────── IMBERT (Sénas) ───────────
  imbert_parler: {
    illu: 'senas_station', musique: 'sombre', orateur: 'Imbert',
    texte: 'La porte de la chambre froide s’entrouvre de dix centimètres. « Encore vous ? »',
    choix: [
      {
        label: 'Insister : venir à Calès, dernière chance',
        test: { chance: 0.35 },
        reussite: { texte: 'Imbert soupire. « Vous êtes {têtu|têtue}. Ma femme aussi l’était. » Il ouvre la porte en grand. « Donnez-nous une heure pour faire les sacs. »', effets: { flags: { senas_rejoints: true, senas_restent: false } }, suivant: '#fin' },
        echec: { texte: '« Non. » La porte se referme doucement, sans claquer, presque avec gentillesse.', suivant: '#fin' },
      },
      PARTIR,
    ],
  },
};
