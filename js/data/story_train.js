// ============ Le voyage en train (temps long) ============
// Séquence narrative au rythme ralenti : plus de lecture, des choix plus lourds.
// Même schéma que story.js. Commence à 'train_depart' et finit vers 'fin_arrivee'.
// Structure : tronc commun jusqu'à 'train_lea', puis deux branches parallèles —
// solo (Léa morte ou abandonnée) et accompagnée (scènes suffixées _lea) —
// qui se rejoignent à 'fin_arrivee'. Le schéma ne lisant pas les flags,
// toute la logique passe par les cibles 'suivant'.
export const TRAIN_SCENES = {

  // ---------- TRONC COMMUN ----------

  train_depart: {
    illu: 'train', musique: 'combat',
    texte: 'Le locotracteur s\'ébranle, centimètre par centimètre, pendant que la marée morte déferle sur le quai. Des poings martèlent l\'acier sur toute la longueur de la machine — un tambour de chair, des centaines de coups à la fois.\n\nUn enragé se hisse sur le marchepied. Sa main se referme sur la rambarde de la portière restée ouverte, et son visage monte dans l\'encadrement : il n\'a plus de lèvres. Ses dents nues claquent à dix centimètres de ta cuisse.',
    timerMs: 9000,
    timeout: { suivant: 'train_depart_blesse', texte: 'Tu hésites une seconde de trop. Sa main se referme sur ta manche et te tire vers la portière ouverte — vers le quai, vers les autres. Ses dents traversent le tissu et mordent la chair de ton bras avant qu\'un cahot du train ne le décroche et ne le rende à la marée.', effets: { pv: -18, blessure: { type: 'entaille', zones: ['à l\'avant-bras'] } } },
    choix: [
      {
        label: 'Le frapper à coups de botte',
        test: { skill: 'force', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Ton talon lui écrase les doigts contre la rambarde — une fois, deux fois. Les phalanges craquent comme du petit bois. Au troisième coup, son visage encaisse plein fer et il bascule en arrière, avalé par la masse qui piétine déjà ce qui reste de lui. Tu claques la portière et tu pousses le verrou.', effets: { xp: { force: 10 } }, suivant: 'train_sortie' },
        echec: { texte: 'Tu frappes, et il encaisse comme si la douleur était une langue étrangère. Sa main libre fouette l\'air et ses ongles t\'ouvrent l\'avant-bras avant que ton talon ne trouve enfin sa gorge. Il tombe. Ton sang, lui, reste.', effets: { pv: -12, blessure: { type: 'egratignure', zones: ['à l\'avant-bras'] }, xp: { force: 4 } }, suivant: 'train_sortie' },
      },
      {
        label: 'Lui enfoncer le pouce dans l\'orbite',
        test: { skill: 'mainsNues', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu saisis son crâne à deux mains et ton pouce s\'enfonce dans l\'orbite jusqu\'à la deuxième phalange, dans un froid gélatineux que tu n\'oublieras jamais. La chose se cabre, lâche prise, disparaît sous les roues. Le train tressaute deux fois.', effets: { xp: { mainsNues: 18 } }, suivant: 'train_sortie' },
        echec: { texte: 'Ton pouce glisse sur l\'os du sourcil. Sa tête pivote, plus vive que prévu, et ses dents raclent le dos de ta main — la manche prend l\'essentiel, ta peau prend le reste. Tu le décroches à coups de coude et il tombe enfin.', effets: { pv: -10, blessure: { type: 'egratignure', zones: ['à la main'] }, xp: { mainsNues: 6 } }, suivant: 'train_sortie' },
      },
      {
        label: 'Claquer la portière sur lui',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu pivotes et jettes tout ton poids dans la portière. Le montant d\'acier lui prend la tête en étau — un bruit de pastèque qui cède. Tu rouvres de dix centimètres, tu pousses ce qui s\'accroche encore, et tu verrouilles dans le vacarme des poings sur la coque.', effets: { xp: { agilite: 8 } }, suivant: 'train_sortie' },
        echec: { texte: 'Il bloque la portière de l\'épaule, coincé à moitié dedans, à moitié dehors. Vous luttez, sa mâchoire claque dans le vide, ses ongles trouvent ton poignet — puis un cahot l\'arrache enfin et la portière claque sur le paysage qui défile.', effets: { pv: -10, blessure: { type: 'egratignure', zones: ['à l\'avant-bras', 'à la main'] } }, suivant: 'train_sortie' },
      },
    ],
  },

  train_depart_blesse: {
    illu: 'train', musique: 'sombre',
    texte: 'La manche a tenu le pire — pas de morsure franche, mais une déchirure qui saigne en nappes le long de ton poignet. Tu serres un chiffon dessus, les dents crispées, pendant que la gare de Salon rétrécit derrière toi, noire de monde jusque sur la passerelle.\n\nLe compteur grimpe. 20. 30. 40. Le vieux moteur donne tout ce qu\'il a. Les derniers poings lâchent la coque un à un.\n\nTu es sorti de Salon.',
    auto: { label: 'Souffler', suivant: 'train_sortie' },
  },

  train_sortie: {
    illu: 'train', musique: 'train',
    texte: 'Les immeubles laissent place aux entrepôts de la Gandonne, les entrepôts aux vergers, les vergers à la steppe — la Crau, plate et grise jusqu\'aux Alpilles posées au loin comme un décor. Pour la première fois depuis vingt-trois jours, le paysage bouge et pas toi.\n\nLe rythme des rails finit par ressembler à un battement de cœur. Tu réalises que tes mains tremblent encore sur la manette — pas de peur. De décompression. Tout ton corps rend les armes une à une.',
    choix: [
      {
        label: 'Vérifier les jauges et la machine',
        texte: 'Tu fais le tour de la cabine. Température : correcte. Pression : correcte. Carburant : le quart du réservoir, et l\'aiguille descend plus vite qu\'elle ne devrait — la vieille machine boit, ou fuit, ou les deux. Dix litres siphonnés, ça t\'a sorti de Salon — ça ne tiendra pas le moteur en vie jusqu\'à Miramas-le-Vieux, pas s\'il faut le garder au ralenti cette nuit.\n\nIl faudra trouver du gasoil en route. Tu ranges le problème dans un coin de ta tête, juste à côté de tous les autres.',
        effets: { xp: { mecanique: 5 }, tempsMin: 15 },
        suivant: 'train_obstacle',
      },
      {
        label: 'Regarder Salon disparaître',
        texte: 'Tu te retournes une dernière fois. Au-dessus de la ville, trois colonnes de fumée noire montent toutes droites dans l\'air immobile, et le rocher de l\'Empéri découpe sa silhouette dans le gris. Quelque part là-dedans, il y a la chambre 203, tes bouteilles vides, les murs qui t\'ont gardé en vie.\n\nTu ne ressens rien — et puis d\'un coup tu ressens tout, et tu laisses passer, les yeux secs, la gorge en pierre.',
        effets: { sta: 10, tempsMin: 15 },
        suivant: 'train_obstacle',
      },
    ],
  },

  train_obstacle: {
    illu: 'train', musique: 'sombre',
    texte: 'Devant, à cinq cents mètres, une berline grise est plantée en travers de la voie sur un passage à niveau de campagne, portières ouvertes. Pas un accident : quelqu\'un l\'a poussée là, exactement en travers, exactement à l\'endroit où le remblai interdit le contournement.\n\nUn barrage. Vieux ou récent, tendu par des vivants ou abandonné depuis des semaines — impossible à dire d\'ici. L\'aiguille du compteur attend ta décision.',
    choix: [
      {
        label: 'Passer en force, pleine vitesse',
        texte: 'Tu pousses la manette à fond et tu te cales dans le siège. L\'impact pulvérise la berline dans une explosion de tôle et de verre — la machine tangue, encaisse, retombe sur ses rails. Derrière toi, le capot de la voiture finit sa course dans un verger.\n\nQuelque chose siffle désormais dans le moteur, un sifflement qui n\'y était pas avant. Mais ça roule.',
        effets: { flag: 'loco_abimee', tempsMin: 5 },
        suivant: 'train_lea',
      },
      {
        label: 'Pousser la voiture au pas, tampons en avant',
        test: { skill: 'mecanique', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu réduis l\'allure jusqu\'au pas et tu laisses les tampons embrasser la tôle. Le métal gémit, la berline pivote, racle le rail, et bascule enfin dans le fossé dans un nuage de rouille. La machine n\'a pas une égratignure.\n\nTu te surprends à flatter le tableau de bord du plat de la main, comme l\'encolure d\'une bête.', effets: { xp: { mecanique: 12 }, tempsMin: 15 }, suivant: 'train_lea' },
        echec: { texte: 'La berline refuse de pivoter — son essieu accroche le rail. Le temps que tu comprennes, la machine l\'a chevauchée à moitié et quelque chose se tord sous le châssis avec un claquement sec. Le locotracteur s\'arrache, retombe, repart.\n\nLe sifflement qui sort du moteur, maintenant, ne s\'arrête plus.', effets: { flag: 'loco_abimee', tempsMin: 20 }, suivant: 'train_lea' },
      },
      {
        label: 'Freiner et dégager la voie à la main',
        test: { skill: 'force', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu descends, arme au poing, les yeux partout. La voiture est vide — un siège bébé à l\'arrière, vide aussi, sanglé avec soin. Tu t\'arc-boutes contre le montant, et la berline cède centimètre par centimètre jusqu\'à verser hors des rails.\n\nPersonne n\'est venu. Le barrage attendait quelqu\'un qui n\'existe plus.', effets: { sta: -20, tempsMin: 30, xp: { force: 10 } }, suivant: 'train_lea' },
        echec: { texte: 'Tu pousses depuis trente secondes quand des doigts jaillissent de sous la voiture et se referment sur ta cheville. Il est là-dessous depuis le début — coupé en deux à la taille, patient comme seule la mort sait l\'être.', effets: { sta: -15, tempsMin: 25, combat: 'rampant' }, suivant: 'train_lea' },
      },
    ],
  },

  train_lea: {
    illu: 'train', musique: 'train',
    texte: 'Un kilomètre plus loin, une silhouette dévale le remblai et court le long de la voie en agitant un bras. Une femme, la trentaine, un sac en bandoulière, une batte dans l\'autre main. Vivante.\n\n« EMMÈNE-MOI ! » Sa voix passe par-dessus le moteur, déchirée. « ILS ARRIVENT ! »\n\nDerrière elle, au fond de la steppe, une dizaine de points sombres convergent — et certains courent. S\'arrêter, c\'est leur offrir le train. Ne pas s\'arrêter, c\'est la leur offrir, elle.',
    timerMs: 10000,
    timeout: { suivant: 'train_lea_perdue', texte: 'Tu n\'arrives pas à décider. C\'est le train qui décide pour toi.\n\nElle comprend avant toi : elle s\'arrête de courir, les bras ballants, et te regarde passer. Dans le rétroviseur fendu, tu vois les points sombres se refermer sur elle comme une main.\n\nTu coupes le rétroviseur de ton champ de vision. Le bruit, lui, ne se coupe pas.', effets: { flag: 'lea_abandonnee' } },
    choix: [
      {
        label: 'Freiner et lui tendre la main',
        texte: 'Les freins hurlent. Elle saisit ta main et se hisse dans la cabine au moment où les premiers coureurs atteignent le ballast — tu relances la machine et des doigts morts raclent la coque sur dix mètres avant de lâcher.\n\nElle s\'effondre contre la paroi, hors d\'haleine, sa batte serrée contre la poitrine comme un enfant. « Léa, » dit-elle enfin. « Je te revaudrai ça. »',
        effets: { flag: 'lea_sauvee', tempsMin: 10 },
        suivant: 'train_lea_bord',
      },
      {
        label: 'Ralentir sans s\'arrêter — à elle de sauter',
        test: { skill: 'dexterite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu doses la vitesse au plus juste, l\'allure d\'un humain qui court. Elle comprend, ajuste sa foulée, jette la batte dans la cabine et saute. Tu la rattrapes par le col et vous vous écroulez ensemble sur le plancher.\n\n« T\'aurais pu freiner, » souffle-t-elle, allongée sur le dos entre deux quintes de toux. Elle tend une main à l\'horizontale, sans se relever : « Léa. »', effets: { flag: 'lea_sauvee', xp: { dexterite: 8 } }, suivant: 'train_lea_bord' },
        echec: { texte: 'Trop vite. Ses doigts frôlent les tiens — une demi-seconde de chaleur humaine — puis ils glissent et elle roule dans le ballast. Le temps qu\'elle se relève sur un genou, le train est trop loin et les coureurs trop près.\n\nTu n\'entends pas la fin. C\'est pire que de l\'entendre.', effets: { flag: 'lea_abandonnee' }, suivant: 'train_lea_perdue' },
      },
      {
        label: 'Ne pas ralentir',
        texte: 'Tu fixes la voie, les mâchoires soudées, et tu laisses la manette où elle est. Les arguments défilent tout seuls : un arrêt peut tuer le train, le train c\'est ta vie, tu ne lui dois rien, tu ne la connais pas.\n\nElle hurle encore une fois en te voyant passer. Pas une insulte. Juste : « S\'IL TE PLAÎT ! »\n\nLa steppe avale tout le reste.',
        effets: { flag: 'lea_abandonnee' },
        suivant: 'train_lea_perdue',
      },
    ],
  },

  // ---------- BRANCHE SOLO ----------

  train_lea_perdue: {
    illu: 'train', musique: 'sombre',
    texte: 'Le moteur ronronne. La Crau défile, identique, lavée de gris — des clôtures à moutons, des bergeries mortes, et les Alpilles qui n\'en finissent pas de regarder ailleurs. Tu te répètes que tu ne pouvais pas savoir, qu\'un arrêt pouvait te coûter le train, la vie, tout. Les arguments sont solides. Tu les empiles comme des sacs de sable.\n\nÇa ne tient pas l\'eau. Rien ne tient l\'eau.\n\nTu t\'inventes une chose à faire — vérifier un boulon, replier une bâche — parce que les mains occupées pensent moins.',
    auto: { label: 'Continuer vers le sud', suivant: 'train_tunnel' },
  },

  train_tunnel: {
    illu: 'train_nuit', musique: 'sombre',
    texte: 'Le jour baisse quand la voie s\'enfonce dans une tranchée, puis sous les tabliers accolés de l\'A54 — cent mètres de nuit en plein jour, un tunnel de béton et de piliers. Le phare avant y entre —\n\n— et accroche un amas à mi-distance. Un chariot d\'entretien renversé, des traverses en vrac, et des corps. Certains bougent encore, agglutinés sur quelque chose qu\'ils mangent. Des têtes se lèvent une à une dans le faisceau, les yeux blancs comme du papier.\n\nLa distance fond.',
    timerMs: 9000,
    timeout: { suivant: 'train_carburant', texte: 'Tu calcules trop longtemps. Le train choisit la pire vitesse : assez lancé pour percuter, trop lent pour trancher. L\'impact disloque le chariot, la machine chevauche les traverses dans un fracas d\'enclumes, et ton front rencontre le tableau de bord.\n\nQuand le locotracteur retombe sur ses rails, de l\'autre côté des ponts, le moteur a une nouvelle voix. Plus rauque. Toi aussi.', effets: { pv: -10, blessure: { type: 'egratignure', zones: ['au visage'] }, flag: 'loco_abimee' } },
    choix: [
      {
        label: 'Pleine vitesse — tout broyer',
        texte: 'Tu pousses la manette à fond. Le passage devient un tambour : les tampons fauchent le chariot, les traverses éclatent, et les corps — les corps font un bruit que le béton renvoie amplifié, multiplié, un bruit que tu entendras encore dans des années.\n\nLa sortie découpe un rectangle de crépuscule. La machine le franchit en crachant, et le sifflement du moteur a doublé de volume.',
        effets: { flag: 'loco_abimee', sta: -10 },
        suivant: 'train_carburant',
      },
      {
        label: 'Freiner à mort et dégager à la main',
        texte: 'Le train s\'immobilise à vingt mètres de l\'amas, le phare braqué dessus comme un projecteur de théâtre. Ils viennent à toi en titubant dans la lumière — et tu vas à eux, parce que ces traverses ne se déplaceront pas toutes seules et que la nuit tombe.',
        effets: { combat: ['rampant', 'errant'], tempsMin: 30, sta: -15 },
        suivant: 'train_carburant',
      },
    ],
  },

  train_carburant: {
    illu: 'gare', musique: 'sombre',
    texte: 'L\'aiguille du carburant est entrée dans le rouge au passage de la Touloubre. Et comme une réponse, la voie débouche sur une halte de fret au pied de Grans : un panneau rouillé, deux voies mortes, un hangar agricole éventré — et une cuve de gasoil montée sur pilotis, le genre qui ravitaillait les tracteurs des vergers.\n\nSi elle n\'est pas vide. Si rien ne niche dans le hangar. La nuit, elle, n\'attendra pas.',
    choix: [
      {
        label: 'Siphonner la cuve avec ton tuyau',
        besoin: { item: 'tuyau_plastique' },
        texte: 'Le tuyau, l\'amorçage à la bouche, le goût du gasoil qui te brûle la gorge — et le glouglou le plus rassurant du monde. La cuve est aux trois quarts pleine. Tu fais le plein en surveillant le hangar du coin de l\'œil ; des choses y remuent, mais rien n\'en sort.\n\nTu repars avec un réservoir lourd et le cœur un peu moins.',
        effets: { tempsMin: 35, sta: -12, xp: { mecanique: 6 } },
        suivant: 'train_nuit_solo',
      },
      {
        label: 'Forcer le local de la pompe',
        test: { skill: 'force', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'La porte cède au deuxième coup d\'épaule. À l\'intérieur : la pompe manuelle, intacte, et le cadavre sec du pompiste, assis bien droit, qui a fini ses jours une photo dans les mains. Tu pompes jusqu\'à la crampe.\n\nSur l\'étagère, son casse-croûte d\'éternité : une conserve et une bouteille, que tu prends en t\'excusant à voix basse.', effets: { tempsMin: 45, sta: -18, items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], xp: { force: 8 } }, suivant: 'train_nuit_solo' },
        echec: { texte: 'La porte cède d\'un coup — trop fort, trop de bruit. Le fracas roule à travers la halte, et le hangar répond : un cri qui n\'a rien d\'humain, puis des pas de course sur le béton.\n\nTu pompes le gasoil d\'une main, l\'oreille tendue. Ils arrivent avant la fin.', effets: { tempsMin: 50, sta: -20, combat: ['coureur', 'errant'] }, suivant: 'train_nuit_solo' },
      },
      {
        label: 'Repartir sans s\'arrêter — finir sur la réserve',
        test: { skill: 'mecanique', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu choisis le mouvement plutôt que le risque. Régime au plus bas, élan entretenu, roue libre dès que la voie le permet — tu conduis comme on retient son souffle, et la machine t\'écoute. L\'aiguille s\'enfonce dans le rouge, mais le moteur ne tousse pas.\n\nPas encore.', effets: { xp: { mecanique: 14 }, tempsMin: 10 }, suivant: 'train_nuit_solo' },
        echec: { texte: 'Trois kilomètres plus loin, le moteur tousse, hoquette — et meurt. Le silence qui suit est le pire bruit du monde.\n\nTu passes une heure dans le noir à purger les conduites pour récolter les fonds de réservoir, les mains poisseuses, la lampe entre les dents. Et la nuit t\'envoie ce qu\'elle envoie toujours : des pas traînants le long du ballast.', effets: { tempsMin: 90, sta: -20, combat: 'errant' }, suivant: 'train_nuit_solo' },
      },
    ],
  },

  train_nuit_solo: {
    illu: 'train_nuit', musique: 'train',
    texte: 'La nuit avale la steppe. Devant, quelque part, l\'immense triage de Miramas — le plus grand du sud-est, des kilomètres de wagons morts qu\'il faudra traverser, et sûrement pas dans le noir. Tu arrêtes la machine en pleine Crau, moteur au ralenti, phare braqué sur la voie : ici, au moins, rien ne peut approcher sans se montrer.\n\nC\'est la première nuit en vingt-trois jours où tu es à la fois au chaud, armé et en sécurité. Ton corps ne sait plus quoi faire de ça.',
    choix: [
      {
        label: 'Manger un morceau et surveiller la voie',
        texte: 'Tu grignotes en scrutant la nuit. Des silhouettes passent parfois dans le faisceau du phare, loin devant, sans même tourner la tête — le ralenti du moteur les intéresse moins que le sud qui les aimante.\n\nVers minuit, le phare accroche un troupeau de brebis — des vraies, vivantes, une trentaine, sans berger depuis vingt-trois jours. Elles traversent la voie sans hâte, et deux paires d\'yeux verts les suivent à distance dans le noir : des patous, redevenus loups. Tu mets dix minutes à comprendre pourquoi tu as les yeux humides.',
        effets: { faim: 12, sta: 20, tempsMin: 300 },
        suivant: 'train_horde',
      },
      {
        label: 'Dormir une vraie nuit, enfin',
        texte: 'Tu vérifies deux fois les verrous, tu laisses le moteur au ralenti et tu sombres comme une pierre dans un puits. Tes rêves sont pleins de mains — celles du quai, celle de la femme sur le ballast — mais au réveil, le jour se lève sur la steppe givrée, le moteur tourne toujours, et tu es vivant.\n\nCourbaturé, affamé, coupable. Vivant.',
        effets: { sta: 60, pv: 10, faim: -15, soif: -15, tempsMin: 420 },
        suivant: 'train_horde',
      },
      {
        label: 'Fouiller la cabine de fond en comble',
        texte: 'Sous le siège du conducteur, une boîte en fer : une barre de céréales fossile, une canette de soda, et un ticket de loto non gratté. Tu le grattes à l\'ongle, à la lueur du tableau de bord. Perdu.\n\nTu ris tout seul — un vrai rire, le premier depuis des semaines — et tu t\'arrêtes net en entendant le son que ça fait dans la cabine vide. Tu finis la nuit le front contre la vitre.',
        effets: { items: [{ id: 'barre_cereales', qty: 1 }, { id: 'soda', qty: 1 }], tempsMin: 360, sta: 25 },
        suivant: 'train_horde',
      },
    ],
  },

  train_horde: {
    illu: 'train', musique: 'combat',
    texte: 'À l\'aube, tu relances la machine — et au bout de la ligne droite, la steppe est noire.\n\nUne migration. Des milliers de morts en marche vers le sud, épaule contre épaule à perte de vue, tout ce que l\'A7 et l\'A54 ont vomi depuis des semaines — et ils couvrent les rails comme une marée. Le murmure de leurs pas arrive avant eux, un froissement continental.\n\nImpossible de s\'arrêter : ils noieraient le train en quelques minutes. Impossible de reculer : la voie ne va que dans un sens.',
    choix: [
      {
        label: 'Pleine vitesse, tête baissée',
        texte: 'Tu pousses la machine à fond et tu te baisses sous le pare-brise. L\'impact est un roulement de tonnerre ininterrompu — des corps explosent contre le museau de la machine, le pare-brise se fend en toile d\'araignée, une pluie noire et grasse macule les vitres jusqu\'au toit. Pendant deux minutes entières, le monde n\'est que ce bruit.\n\nPuis : le silence. La marée est derrière toi. La machine siffle, fume, mais avance.',
        effets: { flag: 'loco_abimee', sta: -10 },
        suivant: 'train_aube',
      },
      {
        label: 'Vitesse soutenue, trajectoire au cordeau',
        test: { skill: 'mecanique', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu trouves le régime exact où les tampons écartent les corps sans que les essieux ne bourrent — assez vite pour trancher, assez stable pour tenir le rail. Le locotracteur laboure la horde comme un chasse-neige patient, dans un concert de chocs sourds.\n\nC\'est interminable. C\'est abominable. Ça passe.', effets: { xp: { mecanique: 16 }, sta: -10 }, suivant: 'train_aube' },
        echec: { texte: 'Trop prudent. Les corps s\'accumulent sous le châssis, les roues patinent sur une bouillie dont tu refuses de connaître la composition. Le train ralentit, ralentit — des mains commencent à claquer contre la coque.\n\nTu écrases la manette au dernier moment. La machine s\'arrache dans un hurlement de métal, en laissant un morceau de carénage au milieu de la steppe.', effets: { flag: 'loco_abimee', sta: -15 }, suivant: 'train_aube' },
      },
    ],
  },

  train_aube: {
    illu: 'train', musique: 'calme',
    texte: 'La machine tousse mais tient. Et la voie s\'évase d\'un coup : deux voies, puis dix, puis trente — le triage de Miramas, des kilomètres de wagons rouillés figés à perte de vue dans le contre-jour. Un panneau criblé d\'impacts annonce : MIRAMAS. Tu traverses le labyrinthe au pas, entre les rames mortes, dans un silence de cathédrale.\n\nAu-dessus des toits de wagons, sur son rocher, un village de pierre. Et de la fumée. De la fumée droite, régulière, domestiquée — de la fumée d\'humains.\n\nTu penses à la femme sur le ballast, celle dont tu ne connaîtras jamais le nom. Tu te promets de le dire, là-haut : qu\'il y avait quelqu\'un, sur la voie de Salon. Que quelqu\'un devrait s\'en souvenir. C\'est tout ce qui reste à offrir, et c\'est presque rien, et tu t\'y accroches comme à une rambarde.',
    auto: { label: 'Miramas-le-Vieux droit devant', suivant: 'fin_arrivee' },
  },

  // ---------- BRANCHE LÉA ----------

  train_lea_bord: {
    illu: 'train', musique: 'train',
    texte: 'Elle reprend son souffle, adossée à la paroi, et te détaille sans s\'en cacher — tes blessures, tes armes, tes yeux. Un examen de professionnelle.\n\n« Infirmière, » dit-elle en réponse à la question que tu n\'as pas posée. « Hôpital du Pays Salonais, avenue Julien Fabre. Enfin. Avant. » Elle désigne ton bras du menton. « Ça, là. Ça date de quand ? »\n\nDehors, la pluie commence à rayer les vitres. Sa voix est la première voix humaine que tu entends d\'aussi près depuis des semaines.',
    choix: [
      {
        label: 'La laisser examiner tes plaies',
        texte: 'Ses gestes sont précis, économes — des gestes d\'avant, qui ont survécu intacts. Elle nettoie, presse, noue, commente à mi-voix pour elle-même comme au-dessus d\'un lit d\'hôpital.\n\n« Tu cicatrises mal. Tu manges mal, tu dors mal. » Un temps. « Comme tout le monde. »\n\nQuand elle a fini, ton bras te fait moins mal qu\'à aucun moment de ces trois dernières semaines.',
        effets: { pv: 8, tempsMin: 20 },
        suivant: 'train_tunnel_lea',
      },
      {
        label: 'Garder tes distances',
        texte: '« Ça va, » dis-tu, et ta voix ferme la porte. Elle hausse une épaule, sans se vexer — elle range juste ses mains dans ses manches et regarde la pluie.\n\n« Comme tu veux. L\'offre tient. » Un kilomètre passe. « Merci, au fait. La plupart des gens n\'auraient même pas ralenti. »\n\nTu ne réponds pas. Elle n\'insiste pas. C\'est reposant, quelqu\'un qui n\'insiste pas.',
        effets: { tempsMin: 10 },
        suivant: 'train_tunnel_lea',
      },
    ],
  },

  train_tunnel_lea: {
    illu: 'train_nuit', musique: 'sombre',
    texte: 'Le jour baisse quand la voie s\'enfonce dans une tranchée, puis sous les tabliers accolés de l\'A54 — cent mètres de nuit en plein jour, un tunnel de béton et de piliers. Le phare avant y entre —\n\n— et accroche un amas à mi-distance. Un chariot d\'entretien renversé, des traverses, des corps. Certains bougent encore, agglutinés sur quelque chose qu\'ils mangent.\n\nLéa est debout d\'un bond, la batte en main, la voix blanche : « Freine. FREINE ! Si on déraille là-dessous, on meurt dans le noir ! »\n\nLa distance fond.',
    timerMs: 9000,
    timeout: { suivant: 'train_carburant_lea', texte: 'Tu calcules trop longtemps. Le train choisit la pire vitesse : assez lancé pour percuter, trop lent pour trancher. L\'impact disloque le chariot, ton front rencontre le tableau de bord, et Léa traverse la cabine comme une poupée de chiffon.\n\nElle se relève en jurant, une arcade ouverte, et t\'aide à te redresser. « La prochaine fois, » souffle-t-elle, « décide. N\'importe quoi, mais décide. »', effets: { pv: -10, blessure: { type: 'egratignure', zones: ['au visage'] }, flag: 'loco_abimee' } },
    choix: [
      {
        label: 'L\'écouter : freiner et dégager ensemble',
        texte: 'Le train s\'immobilise à vingt mètres de l\'amas. Vous descendez ensemble, dos à dos dans le faisceau du phare. La batte de Léa siffle avec une précision d\'infirmière — elle sait exactement où l\'os cède.\n\n« Tempe, » dit-elle entre deux impacts, du ton d\'un cours magistral. « Pas le front. Le front, ça glisse. »',
        effets: { combat: 'rampant', tempsMin: 25, sta: -10 },
        suivant: 'train_carburant_lea',
      },
      {
        label: 'Passer en force',
        texte: 'Tu pousses la manette. « Non non non— » Léa se jette au sol entre les sièges. Le passage devient un tambour : chariot, traverses, corps — tout éclate contre les tampons dans un vacarme que le béton multiplie par cent.\n\nLa sortie découpe un rectangle de crépuscule. Léa se relève, livide, et ne dit rien pendant trois kilomètres. Le moteur, lui, siffle deux fois plus fort qu\'avant.',
        effets: { flag: 'loco_abimee', sta: -10 },
        suivant: 'train_carburant_lea',
      },
    ],
  },

  train_carburant_lea: {
    illu: 'gare', musique: 'sombre',
    texte: 'L\'aiguille du carburant est entrée dans le rouge au passage de la Touloubre. Léa l\'a vue avant toi.\n\nLa voie débouche sur une halte de fret au pied de Grans : un panneau rouillé, deux voies mortes, un hangar agricole éventré — et une cuve de gasoil montée sur pilotis, le genre qui ravitaillait les tracteurs des vergers. Léa jauge le hangar, puis toi.\n\n« On a besoin de ce gasoil. Dis-moi comment tu veux jouer ça. »',
    choix: [
      {
        label: 'Siphonner la cuve pendant qu\'elle couvre',
        besoin: { item: 'tuyau_plastique' },
        texte: 'Tu amorces le tuyau, le goût du gasoil plein la gorge, pendant que Léa tourne lentement autour de la cuve, la batte sur l\'épaule, les yeux sur le hangar. Deux silhouettes finissent par en sortir, attirées par le glouglou. Tu n\'as même pas à lever la tête : deux impacts mats, espacés, professionnels.\n\n« Plein fait ? » demande-t-elle. Le réservoir déborde presque.',
        effets: { tempsMin: 35, sta: -10 },
        suivant: 'train_nuit_lea',
      },
      {
        label: 'Fouiller le dépôt ensemble, train désert',
        texte: 'Vous forcez le local de la pompe à deux. À l\'intérieur, le cadavre sec du pompiste, assis bien droit, une photo dans les mains — Léa lui ferme le col de la veste d\'un geste machinal, comme on borde un patient. Vous pompez à tour de rôle jusqu\'à la crampe, et elle déniche une conserve oubliée sur l\'étagère.\n\nAu retour, une chose vous attend entre les voies, debout contre le locotracteur comme un voyageur en avance.',
        effets: { tempsMin: 50, sta: -15, combat: 'errant', items: [{ id: 'conserve_haricots', qty: 1 }] },
        suivant: 'train_nuit_lea',
      },
      {
        label: 'Y aller seul — Léa garde la machine',
        test: { skill: 'mecanique', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu improvises un siphon avec une durite arrachée au tracteur mort du dépôt. Le plein est long, le hangar reste muet. Quand tu reviens, il y a deux corps neufs près des roues, le crâne ouvert, et Léa assise sur le marchepied qui essuie sa batte avec un chiffon.\n\n« T\'as été long, » dit-elle simplement.', effets: { tempsMin: 45, sta: -15, xp: { mecanique: 10 } }, suivant: 'train_nuit_lea' },
        echec: { texte: 'Tu te bats avec une durite récalcitrante quand le cri de Léa traverse la halte. Tu sprintes — elle est acculée contre la motrice, la batte à deux mains, un coureur sur elle.\n\nVous le finissez ensemble. Elle saigne d\'une griffure à la tempe, longue mais propre. « Ça va, » coupe-t-elle avant ta question, la voix qui tremble juste assez pour mentir. « Ça va. Finis le plein. »', effets: { tempsMin: 55, sta: -18, combat: 'coureur' }, suivant: 'train_nuit_lea' },
      },
    ],
  },

  train_nuit_lea: {
    illu: 'train_nuit', musique: 'calme',
    texte: 'La nuit avale la steppe. Devant, quelque part, l\'immense triage de Miramas — et vous êtes d\'accord sans même en discuter : pas dans le noir. Tu arrêtes la machine en pleine Crau, moteur au ralenti, et la cabine se referme autour de vous, tiède, ronronnante. Léa déplie une couverture de survie sur vos jambes sans demander, d\'un geste qui dit que le monde d\'avant avait des wagons-couchettes.\n\n« Miramas-le-Vieux, » dit-elle au bout d\'un long silence. « La voix, à la radio. C\'est ma sœur. Je connais cette voix entre mille. » Elle fixe la nuit. « Elle ne sait pas que je suis en vie. »',
    choix: [
      {
        label: 'Partager ton repas et la faire parler',
        texte: 'Vous mangez à même la boîte, une cuillère pour deux. Elle parle — d\'abord du bout des lèvres, puis tout vient : le Pays Salonais, le deuxième étage, la pédiatrie barricadée avec des lits empilés. Quatre jours.\n\n« Le cinquième, c\'est moi qui ai ouvert la porte de l\'escalier pour sortir. » Sa voix ne tremble pas, c\'est pire. « Je n\'ai pas regardé derrière moi. Tu sais ce que c\'est, toi, de ne pas regarder derrière soi ? »\n\nTu sais. Vous regardez la voie, ensemble, très longtemps.',
        effets: { faim: 8, sta: 15, tempsMin: 300 },
        suivant: 'train_horde_lea',
      },
      {
        label: 'Dormir pendant qu\'elle veille',
        texte: '« Dors, » dit-elle. « J\'ai fait des gardes de nuit pendant dix ans. » Tu protestes pour la forme, et ton corps te trahit avant la fin de la phrase.\n\nTu dors huit heures pleines, sans rêves, pour la première fois depuis la chute. Quand tu ouvres les yeux, l\'aube givre les vitres et Léa est exactement dans la même position, la batte en travers des genoux, les yeux sur les rails.\n\n« Du passage vers quatre heures, » dit-elle. « Un troupeau de brebis, et deux morts qui le suivaient au pas. Aucun ne s\'est intéressé à nous. »',
        effets: { sta: 60, pv: 10, faim: -12, soif: -12, tempsMin: 480 },
        suivant: 'train_horde_lea',
      },
      {
        label: 'Veiller pendant qu\'elle dort',
        texte: 'Elle s\'endort entre deux phrases, d\'un coup, comme on coupe un courant — le sommeil de quelqu\'un qui n\'a pas dormi en sécurité depuis des semaines. Dans son sommeil, son visage lâche tout : la garde, l\'ironie, les années. Il reste quelqu\'un de très jeune qui fronce les sourcils.\n\nTu veilles toute la nuit, la voie dans une main, son sommeil dans l\'autre. C\'est étrange d\'avoir à nouveau quelque chose à perdre.',
        effets: { sta: -20, faim: -10, soif: -10, tempsMin: 480 },
        suivant: 'train_horde_lea',
      },
    ],
  },

  train_horde_lea: {
    illu: 'train', musique: 'combat',
    texte: 'À l\'aube, la voie file droit vers les premiers signaux du triage — et la steppe est noire. Une migration. Des milliers de morts en marche vers le sud, épaule contre épaule à perte de vue, qui couvrent les rails comme une marée.\n\nLéa écrase son visage contre la vitre, puis pointe le doigt : « Là ! L\'aiguillage ! » À deux cents mètres, un embranchement file vers une voie de ceinture qui contourne la plaine sur un remblai surélevé. « Elle contourne ! Quelqu\'un doit descendre basculer l\'aiguille — je suis plus rapide que toi. »\n\nElle a déjà la main sur la portière.',
    choix: [
      {
        label: 'La laisser y aller — ralentir au plus près',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu freines au seuil de l\'embranchement. Léa saute avant l\'arrêt complet, sprinte, s\'arc-boute sur le levier — l\'aiguille bascule avec un claquement de mâchoire. Elle remonte au vol pendant que la machine s\'engage sur le remblai, hors d\'haleine, hilare, terrifiée.\n\nEn contrebas, la marée passe sans lever la tête. Vous la longez pendant dix minutes, en silence, comme on longe un cauchemar endormi.', effets: { xp: { agilite: 10 }, tempsMin: 20 }, suivant: 'train_aube_lea' },
        echec: { texte: 'L\'aiguille bascule — mais ils l\'ont vue. Trois silhouettes se détachent de la marée pendant qu\'elle court vers le train, et la plus rapide la fauche aux jambes au pied du marchepied.\n\nTu sautes. Tu frappes. Tu la hisses à bord par le col pendant que la machine s\'engage sur le remblai.\n\nLéa saigne d\'une longue griffure au mollet. « Ça valait le coup, » souffle-t-elle. Tu n\'arrives pas à décider si tu veux l\'engueuler ou la remercier.', effets: { combat: 'errant', tempsMin: 25, sta: -10 }, suivant: 'train_aube_lea' },
      },
      {
        label: 'Refuser — pleine vitesse à travers',
        texte: '« Non. Personne ne descend. » Tu pousses la manette à fond et tu plaques Léa contre le siège d\'un bras tendu.\n\nL\'impact est un roulement de tonnerre ininterrompu — des corps explosent contre le museau de la machine, une pluie noire et grasse macule les vitres, et Léa hurle quelque chose que le vacarme efface. Pendant deux minutes entières, le monde n\'est que ce bruit.\n\nPuis : le silence. Elle se dégage de ton bras, tremblante, et regarde la steppe s\'éloigner. « La prochaine fois, » dit-elle enfin, « fais-moi confiance. »',
        effets: { flag: 'loco_abimee', sta: -10 },
        suivant: 'train_aube_lea',
      },
    ],
  },

  train_aube_lea: {
    illu: 'train', musique: 'calme',
    texte: 'La machine tousse mais tient. Et la voie s\'évase d\'un coup : deux voies, puis dix, puis trente — le triage de Miramas, des kilomètres de wagons rouillés figés dans le contre-jour. Vous le traversez au pas, entre les rames mortes, dans un silence de cathédrale. Au-dessus des toits de wagons, sur son rocher : un village de pierre, des remparts — et de la fumée droite, régulière, domestiquée. De la fumée d\'humains.\n\nLéa est debout contre la vitre, une main à plat sur le verre, comme pour toucher. Elle pleure sans bruit et sans bouger, à la façon des gens qui ont désappris à pleurer devant témoin. Puis elle fouille son sac, en sort son dernier bandage stérile, et te le fourre dans la main.\n\n« Tiens. Tu m\'as ramassée sur une voie ferrée. On sera quittes quand ma sœur t\'aura serré dans ses bras. »',
    choix: [
      {
        label: '« On est quittes depuis longtemps. »',
        texte: 'Elle rit — un rire mouillé, cassé au milieu. « Tais-toi et conduis. »\n\nDehors, le rocher de Miramas-le-Vieux grossit au-dessus des wagons morts, et pour la première fois depuis la chute du monde, sa fumée veut dire bienvenue.',
        effets: { items: [{ id: 'bandage', qty: 1 }] },
        suivant: 'fin_arrivee',
      },
      {
        label: 'Ne rien dire et tendre la main',
        texte: 'Elle la serre. Fort, à l\'ancienne, comme on signait un contrat avant. Vous restez comme ça trois secondes de trop, et aucun de vous deux ne fait de commentaire.\n\nDehors, le rocher de Miramas-le-Vieux grossit au-dessus des wagons morts. Vous arrivez à deux. C\'est un mot que tu croyais rayé du vocabulaire : à deux.',
        effets: { items: [{ id: 'bandage', qty: 1 }] },
        suivant: 'fin_arrivee',
      },
    ],
  },
};
