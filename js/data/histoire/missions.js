// ============ MISSIONS — des situations qui imposent une façon de jouer (docs/RETOURS_JOUEUR.md, P12) ============
// Le modèle, c'est la collégiale Saint-Laurent : ce n'est pas le nombre de morts qui compte, c'est qu'on est OBLIGÉ de faire
// quelque chose de précis (se faire discret, tenir, protéger, nourrir…), et qu'à un moment tout bascule dans l'action.
// Moteur : js/game/missions.js (règles, état, notifications) et js/explore/missions_vue.js (ce qui se joue sur place).
//
// Une mission :
//   titre, resume (une phrase pour le journal), si (CONDITION pour qu'elle soit proposée)
//   offre : { lieu, piece, pres?, texte, accepter, refuser } — proposée quand on arrive À PORTÉE de la pièce nommée
//           (pres : distance en unités, 0 = dedans), jamais en arrivant de loin. « Plus tard » : reproposée à la visite
//           suivante. Mission avec un PNJ : c'est en lui PARLANT qu'on reçoit l'offre (il faut aller le voir).
//   pnj   : { id, nom, lieu, piece, style, appel, pv?, repliques? } — présent tant que la mission est proposée ou en cours ;
//           un cercle le montre dans le lieu, et en arrivant on l'entend (appel)
//   etapes: [ { type, texte, lieu, …paramètres } ] dans l'ordre ; `effets` d'une étape : donnés quand elle est remplie
//   fin / echec : { texte, effets } — la scène de réussite, le texte d'échec ; nettoye : jours de calme du lieu nettoyé
//
// Types d'étapes :
//   eliminer  { lieu, piece? }                 tuer tous les morts du lieu (ou de la pièce) ; le lieu est bouclé pendant ce temps
//                                              (plus aucun mort n'arrive tranquillement). L'avancée se dit en mots, sans nombre.
//   tenir     { lieu, minutes, quitter, vagues? } rester sur place (quitter : 'zero' = le compte repart de zéro, 'echec')
//   attendre  { lieu, heure }                  être sur place quand sonne cette heure (0-23)
//   proteger  { lieu, minutes, vagues }        garder le PNJ de la mission en vie ; il attire les morts ; partir = échec
//   nourrir   { lieu, jours, points }          lui apporter chaque jour de quoi caler `points` de faim (parler → donner)
//   atteindre { lieu, piece?, discret?, siRepere?, preparer? }  y arriver ; discret : si un mort te prend en chasse, le lieu
//                                              se réveille (siRepere.texte) et il faut finir quand même
//   agir      { lieu, piece, libelle, ms, bruit?, reveil?, annonce? }  un geste chronométré sur place (bruit : rayon du
//                                              vacarme ; reveil : { piece } — tous les morts de la pièce se réveillent et viennent)
//   fuir      { lieu }                         sortir du lieu vivant·e
//   deposer   { lieu, marqueur, points }       ranger dans le conteneur du plan (son marqueur) de quoi caler `points` de faim :
//                                              on ne « donne » rien, la caisse se remplit et l'étape avec (dit en mots)
//             { lieu, marqueur, objets: { ids, n } }  … ou n objets parmi ces ids (le tas de bois : des branches, des brindilles)
//   construire { lieu, besoins: [{ types, n?, nom }] }  bâtir sur place ce qui est demandé (constructions du lieu : un feu de
//                                              l'un des types, n alarmes…) ; le guide dit ce qui manque encore
// Ce n'est pas un RPG (docs/RETOURS_JOUEUR.md #60) : aucun bandeau « Nouvelle mission ». Une étape peut porter `pensee`
// (au début) et `penseeFaite` (remplie), la mission `penseeFin` : une ligne de pensée du personnage (js/ui/notif.js).
// vagues : { chaqueMin, n: [min, max], nuit?, types? } — des morts entrent par les bords et marchent vers la cible.
// preparer : { piece, n, etat } — à la première entrée pendant l'étape : les morts de la pièce passent dans cet état
//            ('dort' : endormis debout) et n autres y sont posés.

export const MISSIONS = {

  // ═══════════════ LE DÉBUT : le bois de la Barben (docs/HISTOIRE_DEBUT_V3.md, scènes bb_matin et bb_camp) ═══════════════
  // le premier soir : René veut du bois mort sur le tas, près du creux (pas de feu ce soir, mais demain on en aura besoin).
  // Acceptée au début de la partie (js/main.js) ; close sans un mot le lendemain matin si le tas n'est pas fait (bb_matin).
  m_bois: {
    titre: 'Le tas de bois',
    resume: 'René veut du bois mort sur le tas, près du creux, avant qu’il fasse noir. Pas de feu ce soir, la lumière se voit de loin, mais demain on en aura besoin.',
    etapes: [
      { type: 'deposer', lieu: 'bois_barben', marqueur: 'tas_bois', objets: { ids: ['branche', 'brindilles', 'buche'], n: 5 }, texte: 'Poser du bois mort sur le tas, près du creux',
        libelle: 'Poser du bois sur le tas',
        penseeFaite: 'Ça fera pour demain. Maintenant, dormir, si j’y arrive.' },
    ],
    fin: {
      effets: { flag: 'bois_fait', quete: ['q_debut', 'panne'], journal: 'J’ai ramassé du bois mort au pied des pins et je l’ai posé sur le tas, près du creux. René dit qu’on n’allumera rien ce soir : la lumière se voit de loin.' },
    },
  },
  m_vivres: {
    titre: 'La caisse du camp',
    resume: 'Il n’y a plus rien à manger pour sept. Je dois rapporter du mas du vallon de quoi tenir quelques jours, et le ranger dans la caisse du camp, près du fourgon.',
    etapes: [
      { type: 'deposer', lieu: 'bois_barben', marqueur: 'caisse_camp', points: 90, texte: 'Ranger de quoi manger dans la caisse du camp',
        libelle: 'Ranger à manger dans la caisse du camp',
        penseeFaite: 'Ça ne tiendra pas plus de deux jours.' },
    ],
    fin: {   // le récit de la fin (Martine qui compte) ouvre la scène suivante, bb_camp : l'ordre reste juste
      effets: { flag: 'vivres_faits', journal: 'J’ai rapporté du mas de quoi tenir deux ou trois jours, et je l’ai rangé dans la caisse du camp. Aujourd’hui, tout le monde a mangé.' },
    },
  },
  m_camp: {
    titre: 'Le camp',
    resume: 'Le fourgon ne repartira pas. René veut un vrai camp : un feu dans le creux, sous les pins, qu’on ne voie pas de la piste, une ligne de boîtes de conserve sur un fil tout autour, et un abri de branches et de bâche pour Laura.',
    etapes: [
      { type: 'construire', lieu: 'bois_barben', texte: 'Monter le camp',
        besoins: [
          { types: ['feu_branches', 'feu_camp', 'four_pierre'], nom: 'un feu' },
          { types: ['alarme_conserves'], n: 2, nom: 'la ligne de boîtes' },
          { types: ['abri_branches'], nom: 'l’abri' },
        ],
        penseeFaite: 'Ça ne tiendrait pas contre grand-chose. Mais on les entendra venir.' },
    ],
    fin: {
      texte: 'Ça ne ressemble pas à grand-chose, mais c’est un camp. Laura s’est glissée sous l’abri, et Mathis s’est assis contre sa mère, à côté du feu qui ne fait presque pas de lumière. Sandrine lui caresse les cheveux sans y penser.\n\nThierry, lui, reste assis à l’écart sur le marchepied du fourgon, les yeux sur la piste. Il ne mange pas, et il ne parle à personne.',
      effets: { flag: 'camp_monte', quete: ['q_debut', 'nuit'], journal: 'Le camp est monté : un feu dans le creux, une ligne de boîtes autour, et l’abri pour Laura. Thierry ne parle plus à personne.' },
    },
  },

  // ═══════════════ LES MISSIONS DE L'HISTOIRE (sans offre : acceptées par une scène, docs/HISTOIRE.md §6) ═══════════════

  // ─────────────── TENIR : la garde de la deuxième nuit (acte I, scène ref_garde) ───────────────
  m_garde: {
    titre: 'La garde à la brèche',
    resume: 'Je monte la garde à la brèche du rempart nord avec Rudy, de neuf heures du soir à deux heures du matin. On ne dort pas, on n’allume pas, et on ne quitte pas son poste.',
    etapes: [
      { type: 'tenir', lieu: 'miramas_le_vieux', minutes: 300, quitter: 'echec', vagues: { chaqueMin: 35, n: [1, 2], proche: true },
        texte: 'Monter la garde à la brèche jusqu’à deux heures' },
    ],
    fin: {
      texte: 'À deux heures, tu entends des pas dans la ruelle, et deux silhouettes sortent du noir : Yohan, son fusil en travers des épaules, et Malik, avec un thermos de tisane qu’il te met dans les mains sans un mot.\n\nRudy se lève en faisant craquer son dos. Il passe devant toi, s’arrête, et il grogne quelque chose qui ressemble à un merci, puis il s’en va dormir sans se retourner.\n\nLa tisane est tiède et trop sucrée. C’est la meilleure chose que tu aies bue depuis trois semaines.',
      effets: { flag: 'garde_faite',
        journal: 'J’ai tenu la garde à la brèche jusqu’à deux heures, avec Rudy. Yohan et Malik nous ont relevés.' },
    },
    echec: {
      texte: 'Le lendemain matin, tout le Refuge sait que tu as quitté ton poste pendant la nuit.\n\nUn mort est passé par la brèche pendant que tu n’y étais pas, et il est descendu dans le bas du village. Céline l’a trouvé au matin dans la ruelle du lavoir, en allant chercher du linge. Rudy l’a achevé à coups de marteau, mais il a eu le temps de griffer Céline au bras. Ce n’est qu’une griffure, et Bastien jure qu’une griffure ne transmet rien, mais Céline la regarde toutes les dix minutes, et tout le monde la regarde avec elle.\n\nPersonne ne te dit rien. C’est pire.',
      effets: { flag: 'garde_ratee',
        journal: 'J’ai quitté mon poste à la brèche pendant la garde. Un mort est entré dans le bas du village et a griffé Céline au bras. Tout le Refuge le sait.' },
    },
  },

  // ─────────────── TENIR : le siège du Refuge (acte III, scènes siege_debut_2 / siege_debut_nuit) ───────────────
  // Réussie ou ratée, la chute suit : c'est Rudy qui ouvre la porte (déclencheur 'flag' siege_tenu → scène chute).
  m_siege: {
    titre: 'Le siège',
    resume: 'Les morts fuient le feu de la gare et montent à l’assaut du rocher. Je dois tenir le rempart nord, au-dessus de la brèche, pendant deux heures.',
    etapes: [
      { type: 'tenir', lieu: 'miramas_le_vieux', minutes: 120, quitter: 'echec', vagues: { chaqueMin: 6, n: [2, 4], proche: true },
        texte: 'Tenir le rempart : repousser les morts qui montent' },
    ],
    fin: {
      texte: 'Pendant quelques minutes, plus rien ne monte. Sur la pente, les morts tombés forment un talus noir, et ceux d’en bas tournent en rond, comme s’ils avaient oublié pourquoi ils étaient venus.\n\nTu t’assois contre le parapet, les mains tremblantes, et tu bois de l’eau tiède à même le seau. Sur la place, Hélène passe de poste en poste avec sa lampe, et elle compte ses gens à voix basse, un par un, sur les doigts. Elle arrive au bout, et elle recommence, comme si le compte ne tombait pas juste.',
      effets: { flag: 'siege_tenu' },
    },
    echec: {
      effets: { flag: 'siege_tenu' },
    },
  },

  // ═══════════════ LES MISSIONS DU MONDE (proposées sur place, acte V) ═══════════════

  // ─────────────── NETTOYER : le marché du mercredi ───────────────
  m_marche: {
    titre: 'Le marché du mercredi',
    resume: 'Odile, la buraliste de la place du Général-de-Gaulle, m’ouvrira sa réserve si je vide la place de ses morts.',
    si: { jourMin: 2 },
    offre: {
      lieu: 'place_de_gaulle', piece: 'Le tabac-presse', pres: 7,
      texte: 'Sous les platanes de la place du Général-de-Gaulle, le marché du mercredi est resté monté. Les bâches claquent au vent au-dessus des cageots, et les morts se tiennent entre les étals comme s’ils attendaient leur tour.\n\nAu-dessus du tabac-presse, une fenêtre s’entrouvre, et une vieille femme se penche avec un torchon à la main.\n\n« Vous, là ! Je m’appelle Odile. Ça fait des jours que je les regarde tourner sous ma fenêtre. » Elle baisse la voix. « Si vous videz la place, tous, jusqu’au dernier, je vous ouvre ma réserve. Il me reste des conserves et des piles, et je n’ai plus la force de descendre. »',
      accepter: 'Promettre de vider la place',
      refuser: 'Passer son chemin',
    },
    etapes: [
      { type: 'eliminer', lieu: 'place_de_gaulle', texte: 'Débarrasser la place du Général-de-Gaulle de tous ses morts, jusqu’au dernier' },
      { type: 'atteindre', lieu: 'place_de_gaulle', piece: 'Le tabac-presse', texte: 'Frapper à la porte du tabac-presse, sous la fenêtre d’Odile' },
    ],
    nettoye: 4,
    fin: {
      texte: 'La porte du tabac s’ouvre sur une chaîne de sécurité, puis la chaîne tombe. Odile te regarde longtemps, comme pour vérifier que tu es bien vivant{|e}, et elle te tend un carton de supermarché.\n\n« Le marché, c’était mon mari qui le tenait, le stand des olives, au fond de la place. » Elle renifle. « Maintenant, je pourrai aller jusqu’à la fontaine. »\n\nPendant quelques jours, la place restera calme : les morts du quartier ne savent pas encore qu’elle est vide.',
      effets: { objets: [['conserve_haricots', 2], ['conserve_thon', 1], ['olives', 1], ['piles', 2], ['allumettes', 1]], xp: { force: 15 },
        journal: 'J’ai vidé la place du Général-de-Gaulle. Odile m’a donné ce qui lui restait, et la place restera calme quelques jours.' },
    },
  },

  // ─────────────── PROTÉGER : Mireille, la pharmacienne ───────────────
  m_mireille: {
    titre: 'L’insuline de Mireille',
    resume: 'Mireille, la pharmacienne du cours Carnot, cherche de l’insuline dans son préparatoire : je dois la protéger le temps qu’elle la trouve.',
    si: { jourMin: 1 },
    pnj: { id: 'mireille', nom: 'Mireille', lieu: 'pharmacie_carnot', piece: 'Le préparatoire', pv: 100,
      appel: 'Quelqu’un t’appelle à voix basse, quelque part dans la pharmacie : « Hé ! Par ici… »',
      style: { manteau: '#c4ccca', cheveux: '#8a8a86', coiffure: 'court' },
      repliques: ['Encore un peu… Je cherche une boîte bleue, dans le frigo ou dans les cartons.', 'Ne les laisse pas entrer ici !', 'Les antibiotiques, je les mets de côté pour toi.'] },
    offre: {
      lieu: 'pharmacie_carnot',
      texte: 'Dans la pharmacie du cours Carnot, une femme en blouse blanche fouille le préparatoire à la lampe frontale. Elle sursaute en te voyant, puis elle lève les mains, une boîte de médicaments dans chacune.\n\n« Je suis Mireille, c’est ma pharmacie. » Elle parle vite et à voix basse. « Mon mari est diabétique : il lui faut de l’insuline, et il en reste quelque part ici, dans le frigo ou dans les cartons. Il me faut trois quarts d’heure, peut-être moins. »\n\nElle jette un regard vers la vitrine. « Tout à l’heure, j’ai fait tomber un tiroir, et ils ont entendu. Ils vont venir. Tu peux les tenir loin de moi pendant que je cherche ? »',
      accepter: 'Monter la garde pendant qu’elle cherche',
      refuser: 'Lui dire de se débrouiller',
    },
    etapes: [
      { type: 'proteger', lieu: 'pharmacie_carnot', minutes: 45, vagues: { chaqueMin: 7, n: [2, 3] },
        texte: 'Protéger Mireille pendant qu’elle fouille le préparatoire de la pharmacie' },
    ],
    fin: {
      texte: 'Mireille sort du préparatoire en serrant contre elle une glacière de camping. Il y a du sang sur sa blouse, et ce n’est pas le sien.\n\n« Je l’ai. » Elle ouvre la glacière pour te montrer les stylos d’insuline, puis elle pose sur le comptoir tout ce qu’elle a mis de côté pour toi. « Prends. Et si un jour tu te fais mordre, ne viens pas me voir : il n’y a rien à faire contre ça. »\n\nElle s’en va par la porte de service, et tu ne la revois pas.',
      effets: { objets: [['antibiotiques', 1], ['antidouleur', 2], ['desinfectant', 1], ['bandage', 3], ['kit_suture', 1]], xp: { medecine: 15 },
        journal: 'J’ai protégé Mireille, la pharmacienne du cours Carnot, le temps qu’elle trouve l’insuline de son mari. Elle m’a laissé des médicaments.' },
    },
    echec: {
      texte: 'Tu entends Mireille crier dans le préparatoire, puis plus rien. Les morts sont agenouillés autour d’elle, et la glacière a roulé sous la paillasse.',
      effets: { journal: 'Je n’ai pas su protéger Mireille. Son mari attendra l’insuline pour rien.' },
    },
  },

  // ─────────────── NOURRIR : Aimé, le pêcheur de la Touloubre ───────────────
  m_aime: {
    titre: 'Le pêcheur de la Touloubre',
    resume: 'Aimé, un vieux pêcheur à la jambe cassée, est coincé dans le moulin de la Touloubre : je dois lui apporter à manger chaque jour pendant trois jours.',
    si: { jourMin: 2 },
    pnj: { id: 'aime', nom: 'Aimé', lieu: 'touloubre', piece: 'Le vieux moulin',
      appel: 'Une voix d’homme, faible, monte du vieux moulin : « Il y a quelqu’un ? »',
      style: { manteau: '#4a5a3a', cheveux: '#c8c4bc', coiffure: 'court' },
      repliques: ['Les truites remontent le soir. Si j’avais encore mes jambes…', 'Tu entends la roue ? Elle tourne toute seule depuis que l’eau est montée.'] },
    offre: {
      lieu: 'touloubre',
      texte: 'Dans le vieux moulin de la Touloubre, sous la roue qui grince, un vieil homme est allongé sur des sacs de farine vides, la jambe gauche tenue par deux planches et du fil de pêche. Il serre un couteau à écailler, mais il le pose dès qu’il voit que tu es vivant{|e}.\n\n« Je m’appelle Aimé. Je pêchais là quand ça a commencé, et je suis tombé du talus en fuyant. » Il montre sa jambe. « Ça se ressoude, je crois, mais je ne peux pas marcher, et j’ai fini mes biscuits il y a deux jours. »\n\nIl essaie de sourire. « Si tu m’apportes chaque jour de quoi faire un repas, dans trois jours je tiendrai debout. Je ne te demande pas plus. »',
      accepter: 'Promettre de le nourrir',
      refuser: 'Lui dire que tu ne peux pas',
    },
    etapes: [
      { type: 'nourrir', lieu: 'touloubre', jours: 3, points: 30,
        texte: 'Apporter chaque jour à Aimé, dans le vieux moulin de la Touloubre, de quoi faire un repas' },
    ],
    fin: {
      texte: 'Ce matin-là, Aimé se lève tout seul en s’appuyant sur une branche de frêne, et il fait trois pas jusqu’à la porte du moulin. Il rit comme un enfant.\n\n« Je vais remonter vers Grans, chez ma fille, si elle est encore là. » Il te met dans les mains sa canne à pêche et sa nasse. « La Touloubre nourrit ceux qui savent attendre. Sous le troisième frêne, après le pont, j’ai enterré une boîte : prends-la, je n’en aurai plus besoin. »',
      // la boîte n'est pas donnée : elle attend sous le troisième frêne (scène aime_cache, js/data/histoire/scenes_pnj.js).
      // Les parties où Aimé a déjà donné tout le contenu n'ont pas ce drapeau : pas de seconde boîte.
      effets: { objets: [['canne_peche', 1], ['nasse', 1]], xp: { chasse: 15 }, flag: 'aime_cache_promise',
        journal: 'Aimé, le pêcheur de la Touloubre, a remarché grâce à moi. Il m’a donné sa canne à pêche et sa nasse. Il m’a aussi laissé une boîte qu’il a enterrée au pied du troisième frêne, après la passerelle, sur la rive opposée au moulin.' },
    },
    // la boîte promise : un seul lot pour la partie, attribué par l'hôte en co-op (js/game/missions.js prendreCache) ;
    // on la déterre au marqueur 'cache_aime' de la Touloubre (scène aime_cache, js/data/histoire/scenes_pnj.js).
    cache: {
      flag: 'aime_cache_prise',
      effets: { objets: [['poisson_fume', 2], ['conserve_raviolis', 1], ['alcool_fort', 1]],
        journal: 'J’ai déterré la boîte d’Aimé au pied du troisième frêne, après la passerelle de la Touloubre : deux poissons fumés, des raviolis et de l’eau-de-vie.' },
      deja: '{coequipier} a été plus rapide que toi : la boîte d’Aimé est déjà entre ses mains, et il n’y a plus rien dans le trou.',
    },
    echec: {
      texte: 'Aimé a passé deux jours sans rien manger. Quand on ne peut pas marcher, c’est assez pour mourir, au bord d’une rivière pleine de truites.',
      effets: { journal: 'Je n’ai pas nourri Aimé assez souvent. Il est mort dans son moulin.' },
    },
  },

  // ─────────────── SURVIVRE TROIS JOURS : le guetteur de Cornillon ───────────────
  m_guetteur: {
    titre: 'Le cahier du guetteur',
    resume: 'Le guetteur de Cornillon-Confoux est mort à son poste. Pour comprendre où vont les convois et les hordes, il faut tenir trois jours et trois nuits là-haut.',
    si: { jourMin: 2 },
    offre: {
      lieu: 'cornillon', piece: 'La chambre du guetteur',
      texte: 'Dans la chambre du guetteur, à côté de l’église Saint-Vincent, un homme est assis devant la fenêtre, ses jumelles sur les genoux. Il est mort depuis plusieurs jours, d’une balle qu’il s’est tirée lui-même, et il a laissé un cahier ouvert sur la table.\n\nLa dernière page dit : « À celui qui trouvera ce cahier. Quelqu’un doit continuer à regarder. D’ici, on voit les convois de l’armée sur la route de Lançon et les hordes qui traversent la Crau. Trois jours et trois nuits suffisent pour comprendre où ils vont. Après, tu sauras par où passer. Les nuits, ils montent jusqu’au village. »',
      accepter: 'Prendre la relève du guetteur',
      refuser: 'Refermer le cahier',
    },
    etapes: [
      { type: 'tenir', lieu: 'cornillon', minutes: 4320, quitter: 'zero', vagues: { nuit: true, chaqueMin: 50, n: [2, 4] },
        texte: 'Tenir trois jours et trois nuits à Cornillon-Confoux sans quitter le village' },
    ],
    fin: {
      texte: 'Au matin du quatrième jour, tu sais lire la plaine. Les convois de l’armée passent sur la route de Lançon à l’aube, toujours vers le nord, et les hordes descendent de la Crau vers l’étang de Berre chaque fois que le mistral tombe.\n\nTu recopies tout dans le cahier du guetteur, sous sa dernière ligne, puis tu prends ses jumelles, parce qu’il n’en aura plus besoin.',
      effets: { objets: [['jumelles', 1]], decouvrir: ['berre', 'istres', 'saint_chamas', 'lancon', 'miramas'], xp: { recherche: 15, discretion: 10 },
        journal: 'J’ai tenu trois jours à Cornillon. D’en haut, j’ai repéré Berre, Istres, Saint-Chamas, Lançon et Miramas. J’ai noté les convois sur la route de Lançon à l’aube et les hordes qui descendent de la Crau vers Berre quand le mistral tombe. Sur la carte du pays salonais, je peux maintenant suivre les chemins du guetteur : des détours par les passages notés dans son cahier, plus longs et moins exposés. Ils ne garantissent pas un trajet sans mauvaise rencontre.' },
    },
  },

  // ─────────────── ATTENDRE, PUIS L'ACTION : la draisine de 22 h ───────────────
  m_draisine: {
    titre: 'La draisine de 22 h',
    resume: 'Chaque soir à 22 h, une draisine de l’armée passe à la gare sans s’arrêter et jette des caisses de rations sur le quai 2.',
    si: { jourMin: 2 },
    offre: {
      lieu: 'gare', piece: 'Le hall des voyageurs', pres: 2,
      texte: 'Sur la porte du hall de la gare, quelqu’un a scotché une feuille arrachée à un cahier d’écolier : « DRAISINE DE L’ARMÉE — VOIE 2 — CHAQUE SOIR À 22 H. ELLE NE S’ARRÊTE PAS. ILS JETTENT DES CAISSES DE RATIONS POUR LES CIVILS. ATTENDEZ SOUS L’ABRI DU QUAI 2. »\n\nEn dessous, une autre main a ajouté au crayon : « Le klaxon les fait tous venir. Ramassez et courez. »',
      accepter: 'Attendre la draisine de 22 h',
      refuser: 'Laisser tomber',
    },
    etapes: [
      { type: 'attendre', lieu: 'gare', heure: 22, texte: 'Être à la gare à 22 h, quand passe la draisine' },
      { type: 'atteindre', lieu: 'gare', piece: 'L’abri du quai 2', debut: { bruit: 60, vagues: { n: [5, 7] } },
        annonce: 'Un klaxon déchire la nuit, la draisine passe sans ralentir, et une caisse rebondit sur le quai 2. Tout le quartier l’a entendue.',
        texte: 'Ramasser la caisse tombée près de l’abri du quai 2',
        effets: { objets: [['ration_militaire', 3], ['bouteille_eau', 2], ['bandage', 2]] } },
      { type: 'fuir', lieu: 'gare', texte: 'Quitter la gare avant d’être encerclé{|e}' },
    ],
    fin: {
      texte: 'Tu cours jusqu’à ce que tu n’entendes plus que ton souffle. Sur le couvercle de la caisse, quelqu’un a écrit au pochoir : POUR LES CIVILS DE SALON.\n\nL’armée sait donc qu’il y a encore des vivants ici.',
      effets: { xp: { agilite: 15 }, flag: 'draisine_vue',
        journal: 'J’ai attrapé une caisse de la draisine de 22 h, à la gare. L’armée jette des rations « pour les civils de Salon » : elle sait qu’on est là.' },
    },
  },

  // ─────────────── DISCRÉTION, PUIS L'ACTION : le coffre du Leclerc ───────────────
  m_coffre: {
    titre: 'Le coffre de la direction',
    resume: 'Au Leclerc des Viougues, les morts dorment debout dans les rayons. Le coffre de la direction n’a jamais été vidé, mais il sonne quand on l’ouvre.',
    si: { jourMin: 2 },
    offre: {
      lieu: 'leclerc', piece: 'L’hypermarché', pres: 3,
      texte: 'Sur les portes vitrées du Leclerc des Viougues, quelqu’un a écrit au feutre rouge, en lettres capitales : « ILS DORMENT DEBOUT DANS LES RAYONS. NE COUREZ PAS. NE PARLEZ PAS. » En dessous, plus petit : « Le coffre de la direction n’a jamais été vidé. La combinaison est sur le bureau. Il sonne quand on l’ouvre. »\n\nÀ travers la vitre, dans la pénombre des allées, tu vois des dizaines de silhouettes immobiles, la tête basse, entre les gondoles.',
      accepter: 'Tenter le coffre',
      refuser: 'Ne pas entrer',
    },
    etapes: [
      { type: 'atteindre', lieu: 'leclerc', piece: 'La direction', discret: true,
        preparer: { piece: 'L’hypermarché', n: 14, etat: 'dort' },
        siRepere: { texte: 'Repéré{|e} ! Un mort t’a vu{|e}, et ses grognements réveillent tout le magasin.', reveil: { piece: 'L’hypermarché' } },
        texte: 'Traverser l’hypermarché sans réveiller les morts et gagner le bureau de la direction' },
      // Deux façons d'ouvrir, choisies devant le coffre (js/explore/missions_vue.js choisir) : vite, et la sirène réveille
      // le magasin ; ou en coupant d'abord la sirène avec un outil qui visse, plus long et presque sans bruit. Le vacarme
      // et le journal suivent la façon acceptée par l'hôte (js/game/missions.js effetsEtape) ; la récompense est la même.
      { type: 'agir', lieu: 'leclerc', piece: 'La direction', libelle: 'Examiner le coffre', libelleVite: 'Ouvrir le coffre', ms: 7000, bruit: 70, reveil: { piece: 'L’hypermarché' },
        annonce: 'Le coffre s’ouvre, et une sonnerie stridente éclate dans tout le magasin. Les morts se réveillent.',
        texte: 'Ouvrir le coffre de la direction',
        effets: { objets: [['pistolet_9mm', 1], ['munitions_9mm', 12], ['crochets_serrure', 1]] },
        choix: {
          texte: 'Le coffre est scellé dans le mur, sous le bureau. La combinaison est écrite au feutre au dos du sous-main, comme promis. Sur le flanc du coffre, un boîtier gris est vissé, et un fil en part pour monter jusqu’au plafond : c’est la sirène.',
          vite: { label: 'Composer la combinaison et ouvrir tout de suite', bruit: 'la sirène réveillera le magasin',
            journal: 'J’ai ouvert le coffre du Leclerc à la combinaison, et la sirène a réveillé tout le magasin.' },
          silence: { tag: 'visser', ms: 40000, bruitAction: 2, bruit: 'presque sans bruit',
            label: 'Dévisser le boîtier et couper la sirène d’abord', reprendre: 'Finir de couper la sirène', libelle: 'Tu coupes la sirène du coffre',
            sansOutil: 'Pour couper la sirène avant d’ouvrir, il te faudrait de quoi dévisser le boîtier, un tournevis par exemple.',
            interrompu: 'Tu t’arrêtes. Le boîtier est en partie démonté : tu pourras reprendre là où tu en étais.',
            annonce: 'Le dernier fil cède, et le boîtier se tait. La porte du coffre s’ouvre avec un simple déclic, sans que la sirène sonne.',
            journal: 'J’ai coupé la sirène du coffre du Leclerc avant de l’ouvrir : il s’est ouvert sans sonner.' },
          fait: '{coequipier} a déjà ouvert le coffre avant toi.',
        } },
      { type: 'fuir', lieu: 'leclerc', texte: 'Sortir du Leclerc vivant{|e}' },
    ],
    fin: {
      texte: 'Dehors, tu t’adosses à un chariot renversé et tu reprends ton souffle. Le coffre contenait le pistolet du directeur, des balles et un étui de crochets de serrurier, au milieu d’enveloppes de billets qui ne valent plus rien.\n\nDerrière les portes vitrées, les morts sont toujours là, dans la pénombre des allées.',
      // neutre : la façon d'ouvrir (sirène ou non) est dite par l'annonce et le journal de l'étape « agir »
      effets: { xp: { discretion: 20 },
        journal: 'J’ai vidé le coffre du Leclerc des Viougues : le pistolet du directeur et des balles.' },
    },
  },
};
