// ============ FINAL — « Le mistral » (pont de Mallemort) ============
// Départ de Calès au lever du mistral → voyage (rc_fin_colonne, rc_fin_feu) → le pont.
// Retournement final : Orsini révèle que c'est le rapport de Maud (8 sept.) qui a déclenché Cautère :
//   « On ne brûle pas des morts. On brûle une idée. »
// Trois fins (fins.js) :
//   A « Cautère »        — passer, se taire (toujours possible).
//   B « La Voix »        — envoyer la vidéo (exige 'temoignage_filme').
//   C « La Transhumance » — prendre le redon de Rose (exige 'rose_promesse') : vers le feu, ou vers le pont.

export const SCENES_FINAL = {

  fin_depart: {
    illu: 'crau_mistral', musique: 'tension', orateur: 'Joëlle',
    texte: 'À l’aube, la colonne de Calès descend l’échelle sous un ciel d’un bleu dur, comme lavé. Le mistral souffle à soixante-dix kilomètres à l’heure, et ses rafales arrachent les chapeaux et plaquent les vêtements contre les corps. Il fait froid d’un coup, comme si quelqu’un avait éteint l’été.\n\nAu sud, malgré le vent, on entend les cloches du troupeau de morts, sourdes et obstinées.\n\nLe pont de Mallemort est à douze kilomètres, et il faut les faire à pied, avec des enfants, des vieux et des blessés, et le vent de face. Derrière vous, l’armée a commencé à mettre le feu au pays.\n\nJoëlle prend Clémence par la main et regarde la colonne, puis elle te regarde.\n\n« Tu passes devant, ou derrière ? »',
    choix: [
      { label: 'Marcher en tête de la colonne', effets: { flag: 'colonne_devant', quete: ['q_final', 'depart'] }, suivant: 'fin_depart_2' },
      { label: 'Fermer la marche, face au troupeau', effets: { flag: 'colonne_derriere', quete: ['q_final', 'depart'] }, suivant: 'fin_depart_2' },
    ],
  },

  fin_depart_2: {
    illu: 'crau_mistral', musique: 'tension',
    texte: 'En descendant, tu fais le compte : as-tu réussi à retarder le troupeau ?',
    choix: [
      { label: 'Écouter les cloches : le troupeau est loin', si: { flag: 'jour_gagne' }, suivant: 'fin_depart_loin' },
      { label: 'Écouter les cloches : le troupeau est tout près', si: { pasFlag: 'jour_gagne' }, suivant: 'fin_depart_proche' },
    ],
  },

  fin_depart_loin: {
    illu: 'crau_mistral', musique: 'tension',
    texte: 'Le troupeau a pris du retard : le canal qui a inondé son chemin, la cloche de Sénas ou la promesse du Berger l’ont retenu. Ses cloches sont loin, à plusieurs heures derrière, assez pour marcher sans courir et pour porter les petits à tour de rôle.\n\nC’est le jour de plus que tu as gagné, et ce matin, il se dépense heure par heure.',
    choix: [{ label: 'Ouvrir la carte et rejoindre le pont de Mallemort', effets: { flag: 'colonne_avance' }, suivant: '#fin' }],
  },

  fin_depart_proche: {
    illu: 'crau_mistral', musique: 'combat',
    texte: 'Le troupeau n’a pas été retardé. Quand la colonne atteint la route, les premiers morts, avec leurs cloches, sortent déjà du défilé entre les collines, à moins de deux kilomètres, et derrière eux arrive une marée.\n\nIl va falloir marcher vite, et abandonner des choses. Peut-être même des gens.',
    choix: [{ label: 'Ouvrir la carte et rejoindre le pont de Mallemort', effets: { flag: 'colonne_talonnee' }, suivant: '#fin' }],
  },

  // Déclencheur : entrée dans 'mallemort' si 'mistral_leve'.
  fin_pont_1: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'Dans le mistral, le pont suspendu de Mallemort se met à chanter : ses câbles vibrent comme les cordes d’un instrument géant, en une note grave et continue que tu sens monter par les pieds. Le tablier de planches ondule, et en dessous, la Durance est blanche d’écume.\n\nSur la rive nord, au bout du pont, les soldats ont ouvert un passage étroit entre les barbelés. Il y a une tente blanche, des projecteurs allumés malgré le jour, et des soldats en combinaison de protection qui attendent, le fusil à l’épaule, comme des infirmiers armés. C’est le contrôle promis par Orsini.\n\nLa colonne de Calès s’engage sur les planches, une personne après l’autre : Joëlle en premier, Clémence dans les bras, puis les enfants de l’Empéri. Lou se retourne vers toi.\n\nDerrière, sur la rive sud, au dernier virage de la route, le troupeau de morts apparaît.\n\nEt plus au sud, tout le ciel brûle.',
    choix: [{ label: 'Monter sur le pont', effets: { cinematique: 'pont_mallemort', quete: ['q_final', 'pont'] }, suivant: 'fin_pont_2' }],
  },

  fin_pont_2: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Au milieu du pont, sur la marque rouge des 200 mètres, une femme t’attend seule. Elle a la cinquantaine, une tenue militaire et une parka, les cheveux gris tirés en arrière, et ni casque ni arme à la main. Elle a les yeux de quelqu’un qui n’a pas dormi depuis septembre.\n\n« Commandante Orsini », dit-elle, et tu reconnais la voix de la radio. Puis elle regarde par-dessus ton épaule.',
    choix: [
      { label: 'Suivre son regard', si: { ou: [{ flag: 'maud_captive' }, { flag: 'maud_medecin' }, { flag: 'maud_liberee' }] }, suivant: 'fin_orsini_maud' },
      { label: 'Suivre son regard', si: { flag: 'maud_berger' }, suivant: 'fin_orsini_maud_troupeau' },
      { label: 'Suivre son regard', si: { flag: 'maud_morte' }, suivant: 'fin_orsini_seule' },
    ],
  },

  fin_orsini_maud: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Maud est là, sur les planches, derrière toi. Peu importe que les gens de Calès l’aient amenée les mains liées, ou qu’elle soit venue seule jusqu’aux barbelés. Les deux femmes se dévisagent longtemps dans le vent, comme deux vieilles collègues à un enterrement.\n\n« Maud.\n\n— Sabine. » Maud sourit. « Tu as reçu mon rapport.\n\n— Le 8 septembre, à vingt-deux heures. Je l’ai lu deux fois, et je l’ai transmis au gouvernement, à Paris, à minuit. » Orsini ne sourit pas. « Le 13, Paris a répondu. »\n\nElle tend le bras vers le sud, vers l’horizon orange et les colonnes de fumée que le mistral couche vers la mer.\n\n« Voilà la réponse. »\n\nMaud, la plus intelligente de tous, ne comprend pas. Puis tu vois l’instant exact où elle comprend.\n\n« Vous l’avez prouvé, dit Orsini : les morts peuvent revenir, à condition de manger un vivant. Un pour un. Imaginez que ça se sache. Rien qu’ici, quatre cent mille familles voudraient récupérer leurs morts, et pour chacune, il faudrait donner quelqu’un : un voisin, un vieux, un migrant, un prisonnier. » Sa voix ne tremble pas. « On ne brûle pas des morts, docteure. On brûle une idée, avant qu’elle traverse le fleuve. »\n\nLe feu, c’est son rapport qui l’a déclenché.\n\nMaud s’assoit simplement sur les planches. Elle regarde le feu et ne dit plus rien.',
    choix: [{ label: 'Continuer', effets: { flag: 'maud_au_pont' }, suivant: 'fin_bras' }],
  },

  fin_orsini_maud_troupeau: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Sur la rive sud, au premier rang du troupeau, à côté du Berger, tu reconnais une silhouette en blouse blanche et anorak rouge : c’est Maud. Elle regarde le pont, les soldats et Orsini, puis elle lève la main dans un salut ironique.\n\n« Sérane », dit Orsini, presque avec tendresse. « Elle est avec eux, alors. Évidemment. »\n\nElle se tourne vers toi.\n\n« Le 8 septembre, elle nous a envoyé un rapport : les morts peuvent revenir, à condition de manger un vivant. Un pour un. Je l’ai transmis au gouvernement, et le 13, Paris a répondu. » Elle tend le bras vers le sud, vers le ciel orange. « Voilà la réponse. Imaginez que ça se sache. Rien qu’ici, quatre cent mille familles voudraient récupérer leurs morts, et pour chacune, il faudrait donner quelqu’un. » Sa voix ne tremble pas. « On ne brûle pas des morts. On brûle une idée, avant qu’elle traverse le fleuve. »\n\nLe feu, c’est le rapport de Maud qui l’a déclenché.',
    choix: [{ label: 'Continuer', suivant: 'fin_bras' }],
  },

  fin_orsini_seule: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Il n’y a personne derrière toi, en tout cas pas la personne qu’elle cherche, et Orsini comprend. Une émotion passe sur son visage, vite rangée.\n\n« Sérane est morte. » Ce n’est pas une question. « Tant mieux pour elle. »\n\nElle regarde le sud, le ciel qui brûle et les fumées que le mistral couche vers la mer.\n\n« Le 8 septembre, une médecin de Salon nous a envoyé un rapport : les morts peuvent revenir, à condition de manger un vivant. Un pour un. Je l’ai transmis au gouvernement, et le 13, Paris a répondu. Voilà la réponse. » Elle se tourne vers toi. « Imaginez que ça se sache. Rien qu’ici, quatre cent mille familles voudraient récupérer leurs morts, et pour chacune, il faudrait donner quelqu’un : un voisin, un vieux, un prisonnier. On ne brûle pas des morts. On brûle une idée, avant qu’elle traverse le fleuve. »\n\nLe feu, c’est le rapport de Maud qui l’a déclenché.',
    choix: [{ label: 'Continuer', suivant: 'fin_bras' }],
  },

  fin_bras: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Un soldat en combinaison s’approche avec une lampe. « Les bras. »\n\nTu remontes tes manches. S’il voit la morsure, tu ne passeras pas.',
    choix: [
      { label: 'Montrer ton bras brûlé', si: { flag: 'cicatrice_brulee' }, suivant: 'fin_bras_brulure' },
      { label: 'Montrer ton bras', si: { pasFlag: 'cicatrice_brulee' }, suivant: 'fin_bras_morsure' },
    ],
  },

  fin_bras_brulure: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: '« Brûlure », dit le soldat.\n\nOrsini se penche et regarde longtemps. « Une brûlure bien propre, bien ronde, juste à l’endroit où l’on se fait mordre. » Elle se redresse et te regarde dans les yeux, et tu sais qu’elle sait ce que tu es, depuis l’appel radio peut-être, ou depuis le 8 septembre.\n\n« C’est bon, dit-elle au soldat. C’est une brûlure. »\n\nElle te laisse passer.',
    choix: [{ label: 'Rabattre ta manche', suivant: 'fin_choix' }],
  },

  fin_bras_morsure: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: '« Morsure ! » dit le soldat, et son fusil se lève.\n\nOrsini pose la main sur le canon et l’abaisse doucement, comme on baisse le son d’une radio.\n\n« Morsure cicatrisée. » Elle a un drôle de sourire, triste et curieux. « Voilà donc à quoi vous ressemblez. »\n\nElle te laisse passer.',
    choix: [{ label: 'Rabattre ta manche', suivant: 'fin_choix' }],
  },

  fin_choix: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'Derrière toi, sur la rive sud, le troupeau est arrivé au pont de la route et pousse contre le mur de conteneurs. Les cloches, le mistral et le chant des câbles se mélangent. Au premier rang, le Berger lève son bâton, et à côté de lui, Rose serre le redon, la grosse cloche que tout le troupeau suit. Elle te cherche des yeux, et elle te trouve.\n\nDevant toi, il y a le contrôle, la tente, les soldats, et les vivants de Calès qui passent un par un de l’autre côté. Joëlle est déjà passée, et elle s’est retournée vers toi.\n\nAu sud, le feu arrive : tu le vois courir sur les collines, poussé par le vent, plus vite qu’un cheval.\n\nOrsini attend, et c’est le moment de choisir. Tu peux passer le pont et te taire : l’armée brûlera tout, et personne ne saura jamais que les morts peuvent revenir. Si tu as filmé ton témoignage, tu peux l’envoyer au monde entier, et la vérité sera connue, quoi qu’il en coûte. Et si Rose te l’a promis, tu peux retourner prendre le redon, pour décider toi-même du sort des onze mille morts.',
    choix: [
      { label: 'Passer le pont et garder le secret', suivant: 'fin_cautere_1' },
      {
        label: 'Envoyer la vidéo : révéler la vérité au monde',
        besoin: { flag: 'temoignage_filme' },
        suivant: 'fin_voix_1',
      },
      {
        label: 'Retourner vers Rose et prendre le redon',
        besoin: { flag: 'rose_promesse' },
        suivant: 'fin_troupeau_1',
      },
    ],
  },

  // ─────────────────────────── FIN A — CAUTÈRE ───────────────────────────
  fin_cautere_1: {
    illu: 'durance_pont', musique: 'sombre',
    texte: 'Tu passes le contrôle, et le soldat te tamponne le dos de la main à l’encre violette, comme à l’entrée d’une boîte de nuit. Te voilà de l’autre côté, et tu n’as rien dit.\n\nDerrière toi, Orsini lève la main, et quelque part, quelqu’un appuie sur un bouton.\n\nOn ne fait pas sauter le vieux pont suspendu, parce que c’est un monument historique restauré l’an dernier : on le ferme. Une grille d’acier tombe au bout des planches avec un bruit de guillotine. Le pont de la route, lui, saute, et le mur de conteneurs part dans la Durance avec les premiers rangs du troupeau.\n\nLe Berger est resté sur la rive sud. Il ne crie pas, il regarde l’eau. À côté de lui, Rose te regarde, toi.\n\nEt puis le feu arrive.',
    choix: [{ label: 'Regarder le feu arriver', effets: { cinematique: 'fin_cautere', flag: 'fin_choisie_cautere' }, suivant: 'fin_cautere_2' }],
  },

  fin_cautere_2: {
    illu: 'ligne_de_feu', musique: 'sombre',
    texte: 'Le pays salonais brûle pendant trois jours, et le mistral souffle pendant neuf. Les garrigues, les pinèdes, les oliveraies, les plaines de la Crau, les villages et les morts, tout brûle. On dit que Salon a mieux résisté que le reste, parce que la pierre ne brûle pas, mais il n’y reste plus rien qui marche.\n\nLes communiqués officiels parlent d’une « opération sanitaire d’ampleur exceptionnelle ». Personne, nulle part, ne parle de morts qui reviennent : le secret est gardé.',
    choix: [
      { label: 'Six semaines plus tard', si: { flag: 'joelle_sait' }, suivant: 'fin_cautere_jo_sait' },
      { label: 'Six semaines plus tard', si: { pasFlag: 'joelle_sait' }, suivant: 'fin_cautere_secret' },
    ],
  },

  fin_cautere_jo_sait: {
    illu: 'camp_refugies', musique: 'calme',
    texte: 'Six semaines plus tard, tu vis dans un camp de tentes au bord du Rhône, près de Montélimar. Il y a là une chapelle en préfabriqué, avec une cloche qu’un aumônier militaire fait sonner le dimanche à dix heures.\n\nTu épluches des pommes de terre à la cuisine collective, les manches baissées jusqu’aux poignets, comme toujours. Joëlle ne te parle pas. Mais elle ne t’a jamais {dénoncé|dénoncée}, et chaque soir, sans te regarder, elle pose une assiette à côté de la sienne.\n\nLe dimanche, à dix heures, la cloche sonne.\n\nTa bouche se remplit de salive, et la faim revient.\n\nTu avales, tu souris à la petite qui passe en courant avec son lecteur de glycémie autour du cou, et tu reprends une pomme de terre.\n\nC’est un jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_cautere: true } }, suivant: '#fin' }],
  },

  fin_cautere_secret: {
    illu: 'camp_refugies', musique: 'calme',
    texte: 'Six semaines plus tard, tu vis dans un camp de tentes au bord du Rhône, près de Montélimar. Il y a là une chapelle en préfabriqué, avec une cloche qu’un aumônier militaire fait sonner le dimanche à dix heures.\n\nTu épluches des pommes de terre à la cuisine collective, les manches baissées jusqu’aux poignets, comme toujours. Joëlle t’appelle par ton prénom et te garde une place à table. Certains soirs, elle te parle de Luc, de ses histoires de chantier et de son vélo crevé. Tu écoutes en hochant la tête, sans rien dire : tu ne lui diras jamais que tu l’as mangé.\n\nLe dimanche, à dix heures, la cloche sonne.\n\nTa bouche se remplit de salive, et la faim revient.\n\nTu avales, tu souris à la petite qui passe en courant avec son lecteur de glycémie autour du cou, et tu reprends une pomme de terre.\n\nC’est un jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_cautere: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── FIN B — LA VOIX ───────────────────────────
  fin_voix_1: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Tu sors le téléphone. La batterie est à 4 %, et une seule barre de réseau clignote, disparaît et revient.\n\nTu ouvres la vidéo de ton témoignage, avec ton visage, la paroi de pierre et la bougie, et tu appuies sur « Partager ». Tu choisis tout : tous les réseaux sociaux, tous les contacts, les quarante-trois numéros d’un répertoire dont tu ne te souviens plus, et les adresses des journaux que Lou a notées au dos d’un dessin.\n\nL’envoi commence. 3 %.\n\n« Posez ça », dit Orsini sans élever la voix. Derrière elle, trois fusils se sont levés vers toi.',
    timerMs: 10000,
    timeout: { texte: 'Tu n’as pas bougé, et personne n’a tiré. La barre continue d’avancer.', suivant: 'fin_voix_2' },
    choix: [
      { label: 'Garder le téléphone et continuer l’envoi', suivant: 'fin_voix_2' },
      { label: 'Poser le téléphone sur les planches', suivant: 'fin_cautere_1' },
    ],
  },

  fin_voix_2: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Tu tiens bon, et l’envoi avance : 12 %, puis 31 %.\n\nUn soldat crie quelque chose. Orsini lève la main, non pas pour donner l’ordre de tirer, mais pour l’interdire. Elle regarde la barre avancer sur l’écran et ne fait rien, et tu ne sauras jamais si c’est de la lâcheté, de la pitié ou autre chose.\n\n58 %. Le pont ondule. 74 %. Le feu atteint la colline de Charleval, juste au-dessus de la rive sud. 91 %.\n\nLe coup de feu vient d’ailleurs : d’un soldat trop jeune, sur la rive, qui n’a pas vu la main levée. Quelque chose te frappe à l’épaule comme un coup de batte, et tu tombes sur les planches. Le téléphone glisse, tourne sur lui-même et s’arrête au bord du vide, contre un câble.\n\nSous la vidéo s’affiche un petit mot gris : « Envoyé ».\n\nLa vérité est partie.',
    choix: [
      {
        label: 'Fermer les yeux',
        effets: { blessure: { type: 'profonde', zone: "à l'épaule" }, cinematique: 'fin_voix' },
        suivant: 'fin_voix_3',
      },
    ],
  },

  fin_voix_3: {
    illu: 'gymnase_froid', musique: 'sombre',
    texte: 'Trois jours plus tard, la vidéo a été vue un milliard de fois, et le monde entier sait que les morts peuvent revenir, et à quel prix.\n\nLe quatrième jour, Cautère est suspendu par un communiqué de trois lignes, et on arrête le feu. Il reste assez du pays salonais pour qu’on mesure ce qu’on a failli perdre. Le troupeau, bloqué sur la rive sud, est encerclé, endormi au gaz, puis stocké dans des hangars frigorifiques qu’on construit dans la Crau.\n\nTrois mois plus tard, dans un gymnase réfrigéré de la banlieue de Lyon, quatre cents housses blanches sont alignées sur le parquet, entre les lignes du terrain de basket. Chacune porte une étiquette et un numéro : ce sont des morts qui attendent. Devant la porte, des familles font la queue dans le froid en attendant qu’on les appelle, sous une affiche du ministère qui dit : « LE DON, UN ACTE RESPONSABLE ».\n\nPersonne ne dit ce qu’on donne : un vivant, pour que leur mort revienne.',
    choix: [
      { label: 'Et toi, dans tout ça', si: { flag: 'temoin_extra' }, suivant: 'fin_voix_temoins' },
      { label: 'Et toi, dans tout ça', si: { pasFlag: 'temoin_extra' }, suivant: 'fin_voix_4' },
    ],
  },

  fin_voix_temoins: {
    illu: 'gymnase_froid', musique: 'sombre',
    texte: 'Dans la vidéo, il n’y avait pas que toi. On y entendait aussi la voix posée d’une médecin urgentiste qui ne s’excusait de rien, ou celle, très douce, d’une vieille bergère qui voulait qu’une mère sache le nom de son fils. Ces témoignages passent en boucle à la télévision, on les étudie à l’université, et dans les parlements, on se dispute sur chacun de leurs mots.\n\nLe monde ne pourra pas dire qu’il ne savait pas.',
    choix: [{ label: 'Continuer', suivant: 'fin_voix_4' }],
  },

  fin_voix_4: {
    illu: 'gymnase_froid', musique: 'calme',
    texte: 'Toi aussi, il t’arrive de venir, parce qu’on t’invite : tu es le visage de tout ça, la première personne revenue que le monde ait vue. Tu parles aux familles qui font la queue, et tu leur dis ce que c’est, de revenir : le froid dans les mains, la faim quand les cloches sonnent, et le nom de quelqu’un qu’on porte en soi pour toujours.\n\nTu ne leur dis pas ce que ça coûte, parce qu’ils le savent, et ils font la queue quand même.\n\nLe monde a eu un jour de plus pour décider, et il a décidé.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_voix: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── FIN C — LA TRANSHUMANCE ───────────────────────────
  fin_troupeau_1: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Rose',
    texte: 'Tu fais demi-tour et tu redescends le pont à contre-courant, entre les derniers de Calès qui te regardent passer sans comprendre. Lou t’attrape le bras, et tu te dégages doucement.\n\nOrsini ne dit rien et te laisse partir. Elle a peut-être compris avant toi.\n\nRose t’attend au bout du pont, sur la rive sud, à trois pas du Berger qui ne l’a pas vue s’éloigner. Elle te tend le redon à deux mains, comme on passe un enfant par-dessus une clôture, et tu le sens peser aussi lourd qu’une tête.\n\n« C’est toi, maintenant », dit-elle. « Là où tu iras, ils iront. »\n\nLe Berger se retourne. Il voit la cloche dans tes mains, il voit Rose, et il ouvre la bouche.\n\nTu lèves le redon. Deux chemins s’offrent à toi : vers le feu, tu emmènes les morts brûler avec toi, et plus personne ne mangera personne ; vers le pont, tu fais passer le troupeau de l’autre côté, chez les vivants, pour que chaque mort mange et revienne.',
    choix: [
      { label: 'Sonner et mener les morts dans le feu', effets: { objet: ['redon', 1] }, suivant: 'fin_feu_1' },
      { label: 'Sonner et mener les morts de l’autre côté', effets: { objet: ['redon', 1] }, suivant: 'fin_estive_1' },
    ],
  },

  fin_feu_1: {
    illu: 'troupeau_feu', musique: 'sombre',
    texte: 'Tu fais sonner la cloche.\n\nOnze mille têtes se tournent vers toi en même temps, et tu le sens dans ton dos comme un changement de pression avant un orage.\n\nTu marches vers le sud, vers la route, vers les collines et vers le mur orange qui avance à travers les pinèdes, en faisant sonner la cloche à chaque pas. Tu ne cours pas, parce qu’on ne court jamais devant un troupeau. Derrière toi, ils suivent : ils se détachent des conteneurs, du pont et de la rive, et ils tournent tous ensemble, comme un banc de poissons, pour te suivre.\n\nLe Berger crie, pour la première fois. Il appelle ses bêtes par leur nom, des noms de gens, des centaines de noms, mais elles ne l’entendent pas : elles n’entendent que la cloche.\n\nRose marche à côté de toi et te prend le bras, comme une vieille dame qu’on accompagne à l’église.',
    choix: [{ label: 'Marcher vers le feu', effets: { cinematique: 'fin_transhumance_feu' }, suivant: 'fin_feu_2' }],
  },

  fin_feu_2: {
    illu: 'troupeau_feu', musique: 'mort',
    texte: 'La chaleur arrive avant le feu. Elle te sèche les yeux, les lèvres et la langue, ta sueur s’évapore avant de couler, et tu sens l’odeur de tes cheveux qui roussissent.\n\nC’est étrange, mais c’est à Luc que tu penses : à sa moustache sur la photo, et à Clémence sur ses épaules. Tu te dis que tu l’emmènes avec toi, et que c’est peut-être la seule chose juste que tu aies faite depuis ton réveil : ne pas le garder en vie à travers toi, de l’autre côté.\n\nCe chemin vers la mort, tu l’as déjà fait une fois. La différence, cette fois, c’est que tu marches devant, et que tu sais pourquoi.\n\nLa cloche sonne encore.\n\nCette fois, tu ne reviendras pas.',
    choix: [{ label: 'Continuer', suivant: 'fin_feu_3' }],
  },

  fin_feu_3: {
    illu: 'troupeau_feu', musique: 'calme',
    texte: 'Le feu a brûlé le pays salonais pendant trois jours. Quand on a pu y retourner, en novembre, des équipes en combinaison ont compté les corps sur la route de Mallemort à Charleval, et elles ont arrêté de compter à onze mille.\n\nAu bout, au milieu de la route, il y avait une grosse cloche de bronze, noircie et fêlée, avec un reste de collier de cuir. Personne ne sait qui l’a ramassée.\n\nCet hiver-là, Lou Mercadier a fait un dessin, qui est aujourd’hui punaisé dans l’entrée d’une école de Cavaillon. On y voit une silhouette de dos qui marche vers une colline en feu, une cloche à la main, suivie par une foule immense. On ne voit pas son visage.\n\nSous le dessin, il est juste écrit : « Un jour de plus ».',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_transhumance_feu: true } }, suivant: '#fin' }],
  },

  fin_estive_1: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Tu fais sonner la cloche.\n\nOnze mille têtes se tournent vers toi en même temps.\n\nTu marches vers le pont de la route, vers le mur de conteneurs. Le Berger comprend avant tout le monde : il rit, il pleure, il lève son bâton. Ses revenus font sonner leurs clochettes avec ta cloche, et le troupeau se met à pousser.\n\nLes conteneurs tiennent une minute. Puis le premier bascule dans la Durance, puis le deuxième, et la marée des morts passe le fleuve.\n\nSur la rive nord, les soldats tirent jusqu’à vider leurs chargeurs, mais ça ne change rien : ils sont trop nombreux.\n\nSur le pont suspendu, Orsini ne tire pas. Elle te regarde passer en dessous d’elle, le redon dans les bras, et elle te salue. Personne ne saura jamais pourquoi.',
    choix: [{ label: 'Marcher vers le nord', effets: { cinematique: 'fin_transhumance_estive' }, suivant: 'fin_estive_2' }],
  },

  fin_estive_2: {
    illu: 'estive_ventoux', musique: 'sombre',
    texte: 'Il faut onze jours au troupeau pour atteindre le pied du mont Ventoux. En chemin, dans les villes et les villages du Vaucluse, dans les maisons où les gens dormaient, chaque mort mange un vivant, un pour un, et la moitié du troupeau reste en arrière, endormie sur ses victimes.\n\nEt chaque matin, dans la foule, certains se redressent et s’arrêtent pour regarder leurs mains. Ils demandent de l’eau, quel jour on est, et pourquoi tu fais cette tête : ils sont revenus.\n\nBientôt, ils seront des milliers, puis des dizaines de milliers. Entre eux, ils reconnaissent le froid, et ils te reconnaissent.\n\nLe Berger est mort à Carpentras, heureux, sur un banc, et Rose porte des fleurs sur sa tombe. Toi, tu portes le redon : c’est toi, le berger, maintenant.\n\nAu-dessus de toi, le Ventoux est blanc comme un os. Là-haut, il y a l’herbe et le froid des pâturages d’été, et de l’autre côté des Alpes, l’Italie dort dans son lit.\n\nLa cloche sonne.\n\nC’est un jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_transhumance_estive: true } }, suivant: '#fin' }],
  },
};
