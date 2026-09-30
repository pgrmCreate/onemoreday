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
    texte: 'À l’aube, la colonne de Calès descend l’échelle sous un ciel lavé à l’eau de Javel. Le mistral souffle à soixante, soixante-dix kilomètres-heure, par rafales qui arrachent les chapeaux et plaquent les vêtements contre les corps. Il fait froid, d’un coup, comme si l’été avait été éteint à l’interrupteur.\n\nDu côté du pertuis, au sud, sourd, obstiné, contre le vent : bong. Bong. Bong.\n\nMallemort, c’est douze kilomètres. À pied, avec des enfants, des vieux, des blessés, dans le vent de face.\n\nJoëlle prend Clémence par la main et regarde la colonne. Puis toi.\n\n« Tu passes devant, ou derrière ? »',
    choix: [
      { label: 'Devant', effets: { flag: 'colonne_devant', quete: ['q_final', 'depart'] }, suivant: 'fin_depart_2' },
      { label: 'Derrière', effets: { flag: 'colonne_derriere', quete: ['q_final', 'depart'] }, suivant: 'fin_depart_2' },
    ],
  },

  fin_depart_2: {
    illu: 'crau_mistral', musique: 'tension',
    texte: 'Tu comptes, en descendant. Tu comptes ce que tu as fait pour ce matin-là.',
    choix: [
      { label: 'Le troupeau est loin', si: { flag: 'jour_gagne' }, suivant: 'fin_depart_loin' },
      { label: 'Le troupeau est tout proche', si: { pasFlag: 'jour_gagne' }, suivant: 'fin_depart_proche' },
    ],
  },

  fin_depart_loin: {
    illu: 'crau_mistral', musique: 'tension',
    texte: 'Le troupeau a pris du retard. Le canal noyé, la cloche de Sénas, une parole de berger : quelque chose l’a retenu. Les cloches sont loin, à des heures derrière. Assez pour marcher sans courir. Assez pour porter les petits à tour de rôle.\n\nUn jour de plus, que tu as gagné. Il se dépense ce matin, heure par heure.',
    choix: [{ label: 'Ouvrir la carte : le pont de Mallemort', effets: { flag: 'colonne_avance' }, suivant: '#fin' }],
  },

  fin_depart_proche: {
    illu: 'crau_mistral', musique: 'combat',
    texte: 'Le troupeau n’a rien perdu. Quand la colonne atteint la route, les premières silhouettes droites, avec leurs cloches, apparaissent déjà au sortir du pertuis, à moins de deux kilomètres. Derrière elles, la marée.\n\nIl va falloir marcher vite. Il va falloir laisser des choses. Peut-être des gens.',
    choix: [{ label: 'Ouvrir la carte : le pont de Mallemort', effets: { flag: 'colonne_talonnee' }, suivant: '#fin' }],
  },

  // Déclencheur : entrée dans 'mallemort' si 'mistral_leve'.
  fin_pont_1: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'Le pont suspendu de Mallemort chante.\n\nDans le mistral, ses câbles vibrent comme les cordes d’un instrument énorme, une note grave, continue, qui entre par les pieds. Le tablier de planches ondule. La Durance, en dessous, est blanche d’écume.\n\nSur la rive nord, les soldats ont ouvert une chicane de barbelés au bout du pont. Une tente blanche. Des projecteurs, malgré le jour. Des silhouettes en combinaison de protection qui attendent, fusils à l’épaule, comme des infirmières armées.\n\nLa colonne de Calès s’engage sur les planches, un par un. Joëlle en premier, Clémence dans les bras. Les gamins de l’Empéri. Lou, qui se retourne vers toi.\n\nDerrière, sur la rive sud, à la sortie du dernier virage de la route, le troupeau apparaît.\n\nEt au sud, tout le ciel brûle.',
    choix: [{ label: 'Monter sur le pont', effets: { cinematique: 'pont_mallemort', quete: ['q_final', 'pont'] }, suivant: 'fin_pont_2' }],
  },

  fin_pont_2: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Au milieu du pont, sur le 200 M rouge, une femme t’attend. Seule. Cinquante ans, treillis, parka, cheveux gris tirés en arrière, pas de casque, pas d’arme à la main. Elle a les yeux de quelqu’un qui n’a pas dormi depuis septembre.\n\n« Orsini », dit-elle. Et elle regarde par-dessus ton épaule.',
    choix: [
      { label: 'Suivre son regard', si: { ou: [{ flag: 'maud_captive' }, { flag: 'maud_medecin' }, { flag: 'maud_liberee' }] }, suivant: 'fin_orsini_maud' },
      { label: 'Suivre son regard', si: { flag: 'maud_berger' }, suivant: 'fin_orsini_maud_troupeau' },
      { label: 'Suivre son regard', si: { flag: 'maud_morte' }, suivant: 'fin_orsini_seule' },
    ],
  },

  fin_orsini_maud: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Maud est là, sur les planches, derrière toi — amenée par ceux de Calès, les mains liées, ou venue d’elle-même la veille jusqu’aux barbelés, peu importe. Les deux femmes se dévisagent un long moment dans le vent, comme deux vieilles collègues à un enterrement.\n\n« Maud.\n\n— Sabine. » Maud sourit. « Tu as reçu mon rapport.\n\n— Le 8 septembre, à vingt-deux heures. Je l’ai lu deux fois. Je l’ai transmis à Paris à minuit. » Orsini ne sourit pas. « Le 13, Paris a répondu. »\n\nElle tend le bras vers le sud. Vers l’horizon orange, vers les colonnes de fumée que le mistral couche vers la mer.\n\n« Voilà la réponse. »\n\nMaud ne comprend pas. Tu vois qu’elle ne comprend pas, elle, la plus intelligente de tous. Et puis tu vois le moment exact où elle comprend.\n\n« Vous le savez », dit Orsini. « Que les morts reviennent. Un pour un. Imaginez ça dehors. Quatre cent mille familles, rien qu’ici, qui voudraient récupérer les leurs. Et pour chacune, il faudrait quelqu’un. Un voisin. Un vieux. Un migrant. Un prisonnier. » Sa voix ne tremble pas. « On ne brûle pas des morts, docteure. On brûle une idée. Avant qu’elle passe le fleuve. »\n\nMaud s’assoit sur les planches. Juste comme ça. Elle regarde le feu, et elle ne dit plus rien.',
    choix: [{ label: 'Continuer', effets: { flag: 'maud_au_pont' }, suivant: 'fin_bras' }],
  },

  fin_orsini_maud_troupeau: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Sur la rive sud, au premier rang du troupeau, à côté du Berger, une silhouette en blouse blanche et anorak rouge. Maud. Elle regarde le pont, les soldats, Orsini. Elle lève la main, un salut ironique.\n\n« Sérane », dit Orsini, et c’est presque de la tendresse. « Elle est avec eux, alors. Évidemment. »\n\nElle se tourne vers toi.\n\n« Le 8 septembre, elle nous a écrit que les morts pouvaient revenir. Un pour un. Le 13, Paris a répondu. » Elle tend le bras vers le sud, vers le ciel orange. « Voilà la réponse. Imaginez ça dehors. Quatre cent mille familles, rien qu’ici, qui voudraient récupérer les leurs, et pour chacune il faudrait quelqu’un. » Sa voix ne tremble pas. « On ne brûle pas des morts. On brûle une idée. Avant qu’elle passe le fleuve. »',
    choix: [{ label: 'Continuer', suivant: 'fin_bras' }],
  },

  fin_orsini_seule: {
    illu: 'durance_pont', musique: 'sombre', orateur: 'Orsini',
    texte: 'Il n’y a personne derrière toi. Personne qu’elle cherche. Orsini comprend, et quelque chose passe sur son visage, vite rangé.\n\n« Sérane est morte. » Pas une question. « Tant mieux pour elle. »\n\nElle regarde le sud, le ciel qui brûle, les fumées que le mistral couche vers la mer.\n\n« Le 8 septembre, une médecin de Salon nous a écrit que les morts pouvaient revenir. Un pour un. Le 13, Paris a répondu. Voilà la réponse. » Elle se tourne vers toi. « Imaginez ça dehors. Quatre cent mille familles, rien qu’ici, qui voudraient récupérer les leurs, et pour chacune il faudrait quelqu’un. Un voisin. Un vieux. Un prisonnier. On ne brûle pas des morts. On brûle une idée. Avant qu’elle passe le fleuve. »',
    choix: [{ label: 'Continuer', suivant: 'fin_bras' }],
  },

  fin_bras: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Un soldat en combinaison s’approche avec une lampe. « Les bras. »\n\nTu remontes tes manches.',
    choix: [
      { label: 'Montrer la brûlure', si: { flag: 'cicatrice_brulee' }, suivant: 'fin_bras_brulure' },
      { label: 'Montrer ton bras', si: { pasFlag: 'cicatrice_brulee' }, suivant: 'fin_bras_morsure' },
    ],
  },

  fin_bras_brulure: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: '« Brûlure », dit le soldat.\n\nOrsini se penche, elle, et regarde longtemps. « Une brûlure bien propre. Bien ronde. Juste à l’endroit où l’on mord. » Elle se redresse. Elle te regarde dans les yeux, et tu sais qu’elle sait. Elle sait depuis la radio, peut-être. Elle sait depuis le 8 septembre.\n\n« Ça va », dit-elle au soldat. « C’est une brûlure. »',
    choix: [{ label: 'Rabattre ta manche', suivant: 'fin_choix' }],
  },

  fin_bras_morsure: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: '« Morsure », dit le soldat, et son fusil monte.\n\nOrsini pose la main sur le canon et l’abaisse, doucement, comme on baisse le son d’une radio.\n\n« Morsure cicatrisée. » Elle a un drôle de sourire, triste et curieux. « Voilà donc à quoi vous ressemblez. »',
    choix: [{ label: 'Rabattre ta manche', suivant: 'fin_choix' }],
  },

  fin_choix: {
    illu: 'durance_pont', musique: 'tension',
    texte: 'Derrière toi, sur la rive sud, le troupeau est arrivé au pont routier. Il pousse contre le mur de conteneurs. Les sonnailles, le mistral, le chant des câbles : tout se mélange. Au premier rang, le Berger, la houlette levée. À côté de lui, Rose, le redon contre la poitrine. Elle te cherche des yeux. Elle te trouve.\n\nDevant toi, la chicane, la tente, les soldats, et les vivants de Calès qui passent un par un de l’autre côté du monde. Joëlle est déjà passée. Elle s’est retournée.\n\nAu sud, le feu arrive. On le voit courir sur les collines, poussé par le vent, plus vite qu’un homme, plus vite qu’un cheval.\n\nOrsini attend. Elle a l’air de savoir exactement ce que tu vas faire, et de ne pas savoir ce qu’elle fera ensuite.',
    choix: [
      { label: 'Passer de l’autre côté. Et te taire.', suivant: 'fin_cautere_1' },
      {
        label: 'Sortir ton téléphone : une barre de réseau. Envoyer la vidéo.',
        besoin: { flag: 'temoignage_filme' },
        suivant: 'fin_voix_1',
      },
      {
        label: 'Redescendre vers Rose. Prendre le redon.',
        besoin: { flag: 'rose_promesse' },
        suivant: 'fin_troupeau_1',
      },
    ],
  },

  // ─────────────────────────── FIN A — CAUTÈRE ───────────────────────────
  fin_cautere_1: {
    illu: 'durance_pont', musique: 'sombre',
    texte: 'Tu passes la chicane. Le soldat te tamponne le dos de la main à l’encre violette, comme à l’entrée d’une boîte de nuit. Tu es de l’autre côté.\n\nDerrière toi, Orsini lève la main, et quelque part, quelqu’un appuie sur un bouton.\n\nLe vieux pont suspendu ne saute pas : on ne fait pas sauter un monument historique restauré l’an dernier. On le ferme. Une herse d’acier tombe au bout des planches avec un bruit de guillotine. Le pont routier, lui, saute. Le mur de conteneurs part dans la Durance avec les premiers rangs du troupeau.\n\nLe Berger est resté sur la rive sud. Il ne crie pas. Il regarde l’eau. Rose, à côté de lui, te regarde toi.\n\nEt puis le feu arrive.',
    choix: [{ label: 'Regarder', effets: { cinematique: 'fin_cautere', flag: 'fin_choisie_cautere' }, suivant: 'fin_cautere_2' }],
  },

  fin_cautere_2: {
    illu: 'ligne_de_feu', musique: 'sombre',
    texte: 'Le pays salonais brûle trois jours. Le mistral en souffle neuf. Les garrigues, les pinèdes, les oliveraies, les coussouls de la Crau, les villages, les morts. Salon, dit-on, a tenu mieux que le reste : la pierre ne brûle pas. Mais il n’y a plus rien dedans qui marche.\n\nLes communiqués parlent d’une « opération sanitaire d’ampleur exceptionnelle ». Personne, nulle part, ne parle de gens qui reviennent.',
    choix: [
      { label: 'Six semaines plus tard', si: { flag: 'joelle_sait' }, suivant: 'fin_cautere_jo_sait' },
      { label: 'Six semaines plus tard', si: { pasFlag: 'joelle_sait' }, suivant: 'fin_cautere_secret' },
    ],
  },

  fin_cautere_jo_sait: {
    illu: 'camp_refugies', musique: 'calme',
    texte: 'Dans un camp de toile au bord du Rhône, près de Montélimar, il y a une chapelle en préfabriqué, avec une cloche qu’un aumônier militaire fait sonner le dimanche à dix heures.\n\nTu épluches des pommes de terre à la cuisine collective, les manches baissées jusqu’aux poignets. Tu portes toujours les manches baissées. Joëlle ne te parle pas. Mais elle ne t’a jamais dénoncé, et, chaque soir, sans te regarder, elle pose une assiette à côté de la sienne.\n\nDimanche, dix heures. La cloche sonne.\n\nTa bouche se remplit.\n\nTu avales. Tu souris à la petite qui passe en courant avec son lecteur de glycémie autour du cou. Tu reprends une pomme de terre.\n\nUn jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_cautere: true } }, suivant: '#fin' }],
  },

  fin_cautere_secret: {
    illu: 'camp_refugies', musique: 'calme',
    texte: 'Dans un camp de toile au bord du Rhône, près de Montélimar, il y a une chapelle en préfabriqué, avec une cloche qu’un aumônier militaire fait sonner le dimanche à dix heures.\n\nTu épluches des pommes de terre à la cuisine collective, les manches baissées jusqu’aux poignets. Tu portes toujours les manches baissées. Joëlle t’appelle par ton prénom. Elle te garde une place à table. Elle te raconte Luc, parfois, le soir, des histoires de chantier et de vélo crevé, et tu écoutes, et tu hoches la tête, et tu ne dis rien. Tu ne diras jamais rien.\n\nDimanche, dix heures. La cloche sonne.\n\nTa bouche se remplit.\n\nTu avales. Tu souris à la petite qui passe en courant avec son lecteur de glycémie autour du cou. Tu reprends une pomme de terre.\n\nUn jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_cautere: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── FIN B — LA VOIX ───────────────────────────
  fin_voix_1: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Orsini',
    texte: 'Tu sors le téléphone. 4 %. Une barre, qui clignote, qui revient.\n\nTu ouvres la vidéo. Ton visage, la paroi de safre, la bougie. Tu appuies sur Partager. Tu choisis tout : tous les réseaux, tous les contacts, les quarante-trois numéros d’un répertoire dont tu ne te souviens plus, les adresses de rédactions que Lou a notées au dos d’un dessin.\n\nEnvoi en cours. 3 %.\n\n« Posez ça », dit Orsini. Elle n’a pas élevé la voix. Derrière elle, trois fusils se sont levés.',
    timerMs: 10000,
    timeout: { texte: 'Tu n’as pas bougé. Personne n’a tiré. La barre avance.', suivant: 'fin_voix_2' },
    choix: [
      { label: 'Tenir le téléphone', suivant: 'fin_voix_2' },
      { label: 'Le poser sur les planches', suivant: 'fin_cautere_1' },
    ],
  },

  fin_voix_2: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Tu tiens. Envoi en cours. 12 %. 31 %.\n\nUn soldat crie quelque chose. Orsini lève la main — pas pour ordonner : pour arrêter. Elle regarde l’écran de ton téléphone, qui avance, et elle ne fait rien. Tu ne sauras jamais si c’est de la lâcheté, de la pitié, ou autre chose.\n\n58 %. Le tablier ondule. 74 %. Le feu est sur la colline au-dessus de Charleval, juste au-dessus de la rive sud. 91 %.\n\nLe coup de feu part d’ailleurs. D’un soldat trop jeune, sur la rive, qui n’a pas vu la main levée. Quelque chose te frappe à l’épaule comme un coup de batte, et tu tombes sur les planches, et le téléphone glisse, tourne, s’arrête au bord du vide, contre un câble.\n\nEnvoyé.\n\nLe petit mot gris, sous la vidéo. Envoyé.',
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
    texte: 'Trois jours plus tard, la vidéo a été vue un milliard de fois.\n\nCautère a été suspendu le quatrième jour, par un communiqué de trois lignes. Il restait assez du pays salonais pour qu’on sache ce qu’on avait failli perdre. Le troupeau, bloqué sur la rive sud, a été encerclé, puis endormi au gaz, puis rangé. On a construit des hangars frigorifiques dans la Crau.\n\nTrois mois plus tard, dans un gymnase réfrigéré de la banlieue de Lyon, il y a quatre cents housses blanches alignées sur le parquet, entre les lignes du terrain de basket. Chacune a une étiquette, et un numéro. Devant la porte, une file de familles, dans le froid, qui attendent qu’on les appelle. Au mur, une affiche du ministère : LE DON, UN ACTE RESPONSABLE.\n\nPersonne ne dit ce qu’on donne.',
    choix: [
      { label: 'Et toi', si: { flag: 'temoin_extra' }, suivant: 'fin_voix_temoins' },
      { label: 'Et toi', si: { pasFlag: 'temoin_extra' }, suivant: 'fin_voix_4' },
    ],
  },

  fin_voix_temoins: {
    illu: 'gymnase_froid', musique: 'sombre',
    texte: 'Dans la vidéo, il n’y avait pas que toi. Il y avait la voix de conférence d’une urgentiste qui ne s’excusait de rien, ou celle, très douce, d’une vieille bergère qui voulait qu’une mère sache le nom de son fils. On les passe en boucle à la télévision. On les étudie dans les facultés. On se dispute sur leurs mots dans les parlements.\n\nLe monde n’a pas pu dire qu’il ne savait pas.',
    choix: [{ label: 'Continuer', suivant: 'fin_voix_4' }],
  },

  fin_voix_4: {
    illu: 'gymnase_froid', musique: 'calme',
    texte: 'Tu es là, toi aussi, parfois. On t’invite. Tu es le visage de tout ça. Le premier. Tu parles aux familles, dans la file. Tu leur dis ce que c’est, de revenir. Le froid dans les mains. La faim quand les cloches sonnent. Le nom de quelqu’un qu’on porte en soi.\n\nTu ne leur dis pas ce que ça coûte. Ils le savent. Ils font la queue quand même.\n\nLe monde a eu un jour de plus pour décider.\n\nIl a décidé.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_voix: true } }, suivant: '#fin' }],
  },

  // ─────────────────────────── FIN C — LA TRANSHUMANCE ───────────────────────────
  fin_troupeau_1: {
    illu: 'durance_pont', musique: 'tension', orateur: 'Rose',
    texte: 'Tu fais demi-tour. Tu redescends le pont à contre-courant, entre les derniers de Calès qui te regardent passer sans comprendre. Lou t’attrape le bras. Tu te dégages, doucement.\n\nOrsini ne dit rien. Elle te laisse passer. Elle a peut-être compris avant toi.\n\nRose t’attend au bout du pont, sur la rive sud, à trois pas du Berger qui ne l’a pas vue s’éloigner. Elle te tend le redon, à deux mains, comme on tend un enfant par-dessus une clôture. Il pèse lourd. Il pèse le poids d’une tête.\n\n« C’est toi, maintenant », dit-elle.\n\nLe Berger se retourne. Il voit la cloche dans tes mains. Il voit Rose. Il ouvre la bouche.\n\nTu lèves le redon.',
    choix: [
      { label: 'Sonner. Et marcher vers le feu.', effets: { objet: ['redon', 1] }, suivant: 'fin_feu_1' },
      { label: 'Sonner. Et marcher vers le pont.', effets: { objet: ['redon', 1] }, suivant: 'fin_estive_1' },
    ],
  },

  fin_feu_1: {
    illu: 'troupeau_feu', musique: 'sombre',
    texte: 'Bong.\n\nOnze mille têtes se tournent vers toi en même temps. Tu le sens dans ton dos comme un changement de pression, comme quand un orage arrive.\n\nTu marches vers le sud. Vers la route, vers les collines, vers le mur orange qui avance à travers les pinèdes. Bong. Tu ne cours pas. On ne court pas devant un troupeau. Bong. Derrière toi, ça suit. Ça se détache des conteneurs, du pont, de la rive, ça tourne comme un banc de poissons, ça te suit.\n\nLe Berger crie. Pour la première fois, il crie : il appelle ses bêtes par leur nom — des noms de gens, des centaines de noms. Elles ne l’entendent pas. Elles entendent la mère.\n\nRose marche à côté de toi. Elle te prend le bras, comme une vieille dame qu’on accompagne à l’église.',
    choix: [{ label: 'Marcher', effets: { cinematique: 'fin_transhumance_feu' }, suivant: 'fin_feu_2' }],
  },

  fin_feu_2: {
    illu: 'troupeau_feu', musique: 'mort',
    texte: 'La chaleur arrive avant le feu. Elle te sèche les yeux, les lèvres, la langue. Ta sueur s’évapore avant de couler. Tu sens l’odeur de tes cheveux.\n\nTu penses à Luc. C’est bizarre, mais c’est à lui que tu penses. À sa moustache, sur la photo. À Clem sur ses épaules. Tu te dis que tu l’emmènes avec toi, et que c’est peut-être la seule chose juste que tu aies faite depuis la housse : ne pas le garder de l’autre côté.\n\nTu connais le chemin. Tu l’as déjà fait. La différence, cette fois, c’est que tu marches devant, et que tu sais pourquoi.\n\nBong.\n\nCette fois, tu ne reviens pas.',
    choix: [{ label: 'Continuer', suivant: 'fin_feu_3' }],
  },

  fin_feu_3: {
    illu: 'troupeau_feu', musique: 'calme',
    texte: 'Le feu a brûlé le pays salonais trois jours. Quand on a pu y retourner, en novembre, des équipes en combinaison ont compté ce qu’elles trouvaient sur la route de Mallemort à Charleval. Elles ont arrêté de compter à onze mille.\n\nAu bout, au milieu de la route, il y avait une cloche. Une grosse cloche de bronze, noircie, fêlée, avec un reste de collier de cuir. Personne ne sait qui l’a ramassée.\n\nDans un dessin que Lou Mercadier a fait cet hiver-là, et qui est aujourd’hui punaisé dans l’entrée d’une école de Cavaillon, on voit une silhouette qui marche vers une colline en feu, une cloche à la main, suivie par une foule immense. On ne voit pas son visage. Elle est de dos.\n\nSous le dessin, il y a juste écrit : Un jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_transhumance_feu: true } }, suivant: '#fin' }],
  },

  fin_estive_1: {
    illu: 'durance_pont', musique: 'combat',
    texte: 'Bong.\n\nOnze mille têtes se tournent vers toi en même temps.\n\nTu marches vers le pont routier. Vers le mur de conteneurs. Le Berger comprend avant tout le monde. Il rit, il pleure, il lève sa houlette, et ses revenus font tinter leurs cloches avec la tienne, et le troupeau pousse.\n\nLes conteneurs tiennent une minute. Puis le premier bascule dans la Durance, et le second, et la marée passe.\n\nSur la rive nord, les soldats tirent. Ils tirent jusqu’à ce que leurs chargeurs soient vides. Ça ne change rien. Un pour un.\n\nOrsini, sur le pont suspendu, ne tire pas. Elle te regarde passer au-dessous d’elle, le redon dans les bras. Et elle salue. Personne ne saura jamais pourquoi.',
    choix: [{ label: 'Marcher', effets: { cinematique: 'fin_transhumance_estive' }, suivant: 'fin_estive_2' }],
  },

  fin_estive_2: {
    illu: 'estive_ventoux', musique: 'sombre',
    texte: 'Il faut au troupeau onze jours pour atteindre le pied du Ventoux. Il en laisse la moitié derrière lui, dans les villes du Vaucluse, dans les villages, dans les maisons où l’on dormait. Un pour un.\n\nEt chaque matin, dans la foule, il y en a qui se redressent. Qui s’arrêtent. Qui regardent leurs mains. Qui demandent de l’eau, et quel jour on est, et pourquoi tu as une tête pareille.\n\nIls seront des milliers, bientôt. Des dizaines de milliers. Ils reconnaissent le froid, entre eux. Ils te reconnaissent.\n\nLe Berger est mort à Carpentras, heureux, sur un banc. Rose porte des fleurs sur sa tombe. Toi, tu portes le redon.\n\nAu-dessus de toi, le Ventoux est blanc comme un os. Là-haut, à l’estive, il y a de l’herbe, du froid, et de l’autre côté des Alpes, l’Italie, qui dort dans son lit.\n\nBong.\n\nUn jour de plus.',
    choix: [{ label: 'Fin', effets: { flag: 'fin_choisie', flags: { fin_transhumance_estive: true } }, suivant: '#fin' }],
  },
};
