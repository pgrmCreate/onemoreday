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
// vagues : { chaqueMin, n: [min, max], nuit?, types? } — des morts entrent par les bords et marchent vers la cible.
// preparer : { piece, n, etat } — à la première entrée pendant l'étape : les morts de la pièce passent dans cet état
//            ('dort' : endormis debout) et n autres y sont posés.

export const MISSIONS = {

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
    resume: 'Mireille, la pharmacienne du cours Carnot, cherche de l’insuline dans sa réserve : je dois la protéger le temps qu’elle la trouve.',
    si: { jourMin: 1 },
    pnj: { id: 'mireille', nom: 'Mireille', lieu: 'pharmacie_carnot', piece: 'La réserve', pv: 100,
      appel: 'Quelqu’un t’appelle à voix basse, quelque part dans la pharmacie : « Hé ! Par ici… »',
      style: { manteau: '#c4ccca', cheveux: '#8a8a86', coiffure: 'court' },
      repliques: ['Encore un peu… Je cherche une boîte bleue, dans le frigo ou dans les cartons.', 'Ne les laisse pas entrer dans la réserve !', 'Les antibiotiques, je les mets de côté pour toi.'] },
    offre: {
      lieu: 'pharmacie_carnot',
      texte: 'Dans la pharmacie du cours Carnot, une femme en blouse blanche fouille la réserve à la lampe frontale. Elle sursaute en te voyant, puis elle lève les mains, une boîte de médicaments dans chacune.\n\n« Je suis Mireille, c’est ma pharmacie. » Elle parle vite et à voix basse. « Mon mari est diabétique : il lui faut de l’insuline, et il en reste quelque part ici, dans le frigo ou dans les cartons. Il me faut trois quarts d’heure, peut-être moins. »\n\nElle jette un regard vers la vitrine. « Tout à l’heure, j’ai fait tomber un tiroir, et ils ont entendu. Ils vont venir. Tu peux les tenir loin de moi pendant que je cherche ? »',
      accepter: 'Monter la garde pendant qu’elle cherche',
      refuser: 'Lui dire de se débrouiller',
    },
    etapes: [
      { type: 'proteger', lieu: 'pharmacie_carnot', minutes: 45, vagues: { chaqueMin: 7, n: [2, 3] },
        texte: 'Protéger Mireille pendant qu’elle fouille la réserve de la pharmacie' },
    ],
    fin: {
      texte: 'Mireille sort de la réserve en serrant contre elle une glacière de camping. Il y a du sang sur sa blouse, et ce n’est pas le sien.\n\n« Je l’ai. » Elle ouvre la glacière pour te montrer les stylos d’insuline, puis elle pose sur le comptoir tout ce qu’elle a mis de côté pour toi. « Prends. Et si un jour tu te fais mordre, ne viens pas me voir : il n’y a rien à faire contre ça. »\n\nElle s’en va par la porte de service, et tu ne la revois pas.',
      effets: { objets: [['antibiotiques', 1], ['antidouleur', 2], ['desinfectant', 1], ['bandage', 3], ['kit_suture', 1]], xp: { medecine: 15 },
        journal: 'J’ai protégé Mireille, la pharmacienne du cours Carnot, le temps qu’elle trouve l’insuline de son mari. Elle m’a laissé des médicaments.' },
    },
    echec: {
      texte: 'Tu entends Mireille crier dans la réserve, puis plus rien. Les morts sont agenouillés autour d’elle, et la glacière a roulé sous un rayonnage.',
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
      effets: { objets: [['canne_peche', 1], ['nasse', 1], ['poisson_fume', 2], ['conserve_raviolis', 1], ['alcool_fort', 1]], xp: { chasse: 15 },
        journal: 'Aimé, le pêcheur de la Touloubre, a remarché grâce à moi. Il m’a donné sa canne à pêche et le contenu de sa cachette.' },
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
        journal: 'J’ai tenu trois jours à Cornillon. D’en haut, j’ai repéré Berre, Istres, Saint-Chamas, Lançon et Miramas, et compris par où passent les convois et les hordes.' },
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
      { type: 'agir', lieu: 'leclerc', piece: 'La direction', libelle: 'Ouvrir le coffre', ms: 7000, bruit: 70, reveil: { piece: 'L’hypermarché' },
        annonce: 'Le coffre s’ouvre, et une sonnerie stridente éclate dans tout le magasin. Les morts se réveillent.',
        texte: 'Ouvrir le coffre de la direction',
        effets: { objets: [['pistolet_9mm', 1], ['munitions_9mm', 12], ['crochets_serrure', 1]] } },
      { type: 'fuir', lieu: 'leclerc', texte: 'Sortir du Leclerc vivant{|e}' },
    ],
    fin: {
      texte: 'Dehors, tu t’adosses à un chariot renversé et tu reprends ton souffle. Le coffre contenait le pistolet du directeur, des balles et un étui de crochets de serrurier, au milieu d’enveloppes de billets qui ne valent plus rien.\n\nDerrière les portes vitrées, les morts tournent encore dans les allées, sous la sonnerie qui ne s’arrête pas.',
      effets: { xp: { discretion: 20 },
        journal: 'J’ai vidé le coffre du Leclerc des Viougues : le pistolet du directeur et des balles. Le magasin entier s’est réveillé.' },
    },
  },
};
