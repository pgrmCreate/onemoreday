// ============ DOCUMENTS TROUVABLES (REFONTE §4.8, docs/HISTOIRE.md) ============
// { titre, style: 'manuscrit'|'tape'|'imprime'|'sms'|'carnet', texte, lieu?, marqueur? }
// Avec `marqueur` : posé par le concepteur de niveau à cet endroit (voir docs/NIVEAUX_BESOINS.md).
// Sans `marqueur` mais avec `lieu` : à placer librement dans le niveau du lieu (bureau, table, mur, cadavre).
// Sans `lieu` : donné par une scène (effet `document`).
// Les documents qui s'adressent au joueur (la lettre d'Hélène, son cahier de radio) s'accordent avec {masculin|féminin}.

export const DOCUMENTS = {

  // ═══════════════ LE REFUGE DE MIRAMAS-LE-VIEUX (actes I et III) — donnés par les scènes ═══════════════
  doc_message_refuge: {
    titre: 'Le message de la radio', style: 'carnet',
    texte: '(Tu l’as recopié au crayon, sur ton genou, le premier soir où ta radio l’a capté, pendant que la voix le répétait. Depuis, tu le connais par cœur.)\n\n« Ici le Refuge de Miramas-le-Vieux. Ici le Refuge de Miramas-le-Vieux.\n\nNous accueillons les survivants. Nous avons de l’eau et des murs.\n\nVenez par la route de Saint-Chamas, jusqu’à la porte Notre-Dame, en haut du village. Venez de jour, et ne courez pas.\n\nMontrez vos mains. Nous ne pouvons pas faire entrer les personnes mordues.\n\nJe m’appelle Inès. Je répète ce message toutes les heures. Si vous m’entendez, tenez bon.\n\nIci le Refuge de Miramas-le-Vieux. »',
  },
  doc_regles_refuge: {
    titre: 'Les règles du Refuge', style: 'manuscrit',
    texte: '(Écrites à la craie sur le tableau noir vissé contre le mur de l’église, d’une écriture ronde et appliquée.)\n\nLE REFUGE — LES RÈGLES\n\n1. L’eau se boit bouillie. Toujours, même celle du puits.\n2. Personne ne sort seul. Personne ne sort la nuit.\n3. Tous les soirs, après le repas, chacun montre ses bras à Bastien, sur la place. Tout le monde, même Hélène.\n4. Une morsure, ça se dit tout de suite. On ne vous mettra pas dehors : on restera avec vous dans la tour, jusqu’au bout.\n5. Les tours de garde sont dans le carnet d’Hélène. On ne dort pas à son poste, et on n’allume rien sur les remparts.\n6. La cloche de l’église, c’est l’alerte. Quand elle sonne, chacun court à son poste, et les enfants vont dans l’église.\n7. La nourriture est à tout le monde. On ne cache rien, on ne gaspille rien.\n8. On ne descend pas dans le bas du village sans prévenir.\n\n(En dessous, d’une autre écriture, plus petite : « 9. On ne parle pas à Rudy avant son café. » Et plus bas encore, à la craie rouge : « Il n’y a plus de café. »)',
  },
  doc_lettre_helene: {
    titre: '« À n’ouvrir que si le Refuge tombe »', style: 'manuscrit',
    texte: 'Si tu lis cette lettre, c’est que le Refuge est tombé, ou bien que tu n’as pas tenu parole. Dans les deux cas, je ne t’en veux pas.\n\nLe soir de ton arrivée, une heure avant que Yohan allume sa lampe sur toi, la lieutenante Sabatier m’a appelée. Elle commande le PC Durance, de l’autre côté de la rivière, et je lui parle chaque nuit sur le poste que les gendarmes m’ont laissé et que je cache au donjon. Elle m’a dit que l’armée bombarderait la gare de triage de Miramas soixante heures plus tard, le samedi à six heures du matin, pour brûler les milliers de morts que les sirènes y ont poussés. Elle m’a dit aussi qu’il y avait douze wagons de chlore sur une voie de garage, et que je devais évacuer le Refuge vers l’est. Elle ne m’a pas dit ce que ferait le chlore. Je n’ai pas eu besoin qu’elle me le dise.\n\nJe n’ai fait descendre personne. Noa ne tient pas debout, Paul et Josette ont quatre-vingts ans, et entre nous et l’est, il y a vingt kilomètres de plaine et des milliers de morts. Ici, les murs ont tenu trois semaines. J’ai parié sur les murs. Si tu lis ceci, j’ai perdu.\n\nJe t’ai {envoyé|envoyée} à la bergerie avec Fernand parce que vous savez vivre dehors, lui et toi. Fernand connaît la Crau mieux que les morts, et toi, tu as tenu vingt jours sans un mur. Les antibiotiques sont vrais : Noa en a besoin. Mais je voulais surtout que vous soyez loin d’ici le samedi soir. Fernand le sait. Je ne lui ai pas demandé de se taire ; il se tait tout seul.\n\nMaintenant, voici ce que tu dois faire.\n\nVa à la Poudrerie de Saint-Chamas, au bord de l’étang, à la maison du gardien. Ceux qui sortiront d’ici iront là. Attends-les deux jours, pas plus.\n\nEnsuite, va au pont suspendu de Mallemort, sur la Durance. L’armée l’ouvrira aux civils recensés le mercredi 7 octobre, à l’aube, pendant une heure, et pas une minute de plus. Sabatier ne plaisante pas.\n\nÀ la ligne de contrôle, on te demandera le mot de notre refuge. C’est « Beauvezer », le nom de notre église.\n\nLe 20 septembre, j’ai transmis à l’armée la liste de nos quatorze noms. Le tien n’y est pas, puisque tu n’étais pas encore là. Ne t’en inquiète pas : je m’en suis occupée.\n\nPrends soin d’Inès. Elle fera semblant de ne pas en avoir besoin.\n\nEt ne reviens pas ici.\n\nHélène Garcin',
  },
  doc_carnet_helene: {
    titre: 'Cahier de radio — Beauvezer', style: 'carnet',
    texte: '(Un cahier d’écolier à couverture bleue. Sur la première page, de la petite écriture droite d’Hélène : « Poste des gendarmes de Miramas. Indicatif : Beauvezer. Vacations à 18 h et à 1 h. N’émettre en dehors que si c’est la fin. »)\n\n5 sept. Les gendarmes partent pour la Durance et me laissent le poste. Le brigadier m’a montré comment m’en servir, puis il m’a dit de ne le dire à personne : « Sinon, ils voudront tous appeler leur famille, et la batterie ne durera pas trois jours. »\n\n10 sept. Une jeune fille d’Istres est arrivée avec la radio de son père. Inès. Elle veut lancer un appel aux survivants. J’ai dit oui. Je ne lui ai pas dit que j’avais déjà une radio.\n\n18 sept. Le PC Durance recense les refuges. Lieutenante Sabatier. Elle veut la liste des noms, les âges, les blessures. Le jour du passage, le mot de passe sera notre indicatif.\n\n20 sept. Liste transmise, épelée lettre par lettre : quatorze noms. S. : « La liste est close au 20. Ordre du commandement. »\n\n23 sept, 18 h. S. : frappe aérienne sur le triage de Miramas, samedi 6 h. Soixante heures. Douze wagons de chlore sur la voie 34. « Évacuez vers l’est. » Avec qui ? Une enfant à quarante de fièvre, deux octogénaires, et vingt kilomètres de morts entre nous et l’est. « C’est un conseil, madame, pas un ordre. »\n\n23 sept, 18 h 40. Quelqu’un à la porte. Quinze. Non. Quatorze, et {le nouveau|la nouvelle}. La liste est close.\n\n24 sept, 1 h. J’ai demandé ce que ferait le vent. S. : « S’il souffle, il emportera le chlore vers la mer. » Et s’il ne souffle pas ? Silence. Puis : « Restez en hauteur. » Nous sommes en hauteur.\n\n25 sept, 1 h. S. me redemande si nous évacuons. Non. Personne ne descendra. Il reste vingt-neuf heures.\n\n25 sept, 7 h. Noa. J’envoie Fernand à Cabassole, avec {le nouveau|la nouvelle}. Fernand sait. L’autre non : une enveloppe.\n\n25 sept, 18 h. Ils sont partis. J’ai fait modifier une ligne de la liste. S. m’a demandé si j’étais sûre. J’ai répondu que j’avais compté.\n\n26 sept, 6 h. La gare brûle. Le nuage est jaune. Il ne monte pas.\n\n26 sept, nuit. La porte est ouverte. Fernand sonne.\n\n(Le reste du cahier est blanc.)',
  },

  // ═══════════════ LA CRAU (acte II) ═══════════════
  doc_carnet_gerard: {
    titre: 'Le carnet de Gérard Pons — bergerie de Cabassole', style: 'carnet',
    texte: '(Un carnet à spirale taché de graisse, tenu au crayon à papier. Les premières pages sont des comptes de bêtes et de foin. Les dernières sont autre chose.)\n\n2 septembre. La radio parle du marché de Salon. Je ne descends pas, j’ai les agneaux à trier.\n\n4 septembre. Le maquignon n’est pas venu, et personne ne répond au téléphone. Rentré toutes les bêtes : 312 têtes.\n\n8 septembre. Des agneaux toussent dans le parc du fond. Oxytétracycline : 1 ml pour 10 kg, une fois par jour, cinq jours, dans la fesse. Agnelle 14 : 2 ml. Agnelle 22 : 2,5 ml. (Souligné deux fois : « Ça jaunit les dents des petits. Tant pis. »)\n\n10 septembre. Un haut-parleur s’est mis à parler à la gare de Miramas. Quand le vent vient de l’ouest, je l’entends d’ici. La nuit, des gens passent sur la draille sans lampe, en direction du bruit. Ce ne sont pas des gens.\n\n14 septembre. Pastis en a tenu trois à l’entrée de l’enclos. Le quatrième l’a eu. Je l’ai enterré sous l’amandier de la cour, sous des pierres plates, avec son collier dessus.\n\n16 septembre. Il y en avait un au fond de l’abreuvoir, couché dans l’eau. Il m’a pris le mollet quand je me suis penché. Je l’ai tué avec le seau.\n\n16 septembre, le soir. Fièvre. Je me suis fait 8 ml d’oxytétracycline, pour mes 80 kilos. Je sais bien que ça ne fait rien contre ça. C’est pour avoir fait quelque chose.\n\n17 septembre. J’ai ouvert l’enclos pour que les bêtes s’en aillent. Elles ne s’en vont pas. Elles restent devant la porte, et elles m’attendent.\n\n(La dernière ligne est tracée d’une main qui tremble.)\n\nFernand, si c’est toi qui lis ça : la clé de l’armoire est à ma ceinture. Ne me laisse pas comme ça.',
  },
  doc_lettre_voiture: {
    titre: 'Lettre de voiture — convoi 51208', style: 'tape', lieu: 'miramas', marqueur: 'lettre_voiture',
    texte: 'SNCF FRET — LETTRE DE VOITURE — TRANSPORT DE MARCHANDISES DANGEREUSES\n\nConvoi : 51208\nExpéditeur : plateforme chimique de Fos-sur-Mer\nDestinataire : station de traitement des eaux, Lyon\nMarchandise : UN 1017 — CHLORE — classe 2 — gaz toxique et corrosif\nNuméro de danger : 268\nComposition : 12 wagons-citernes, 60 tonnes chacun\nArrivée au triage de Miramas : 02/09, 09 h 40\nStationnement : voie 34, faisceau de garage\nSituation : EN ATTENTE D’INSTRUCTIONS depuis le 03/09\n\n(En marge, au stylo, de l’écriture d’un agent du poste d’aiguillage :)\n\n« 03/09 — Instructions : néant. Personnel évacué. Les citernes sont pleines.\n\nSi quelqu’un trouve ce papier et qu’il y a le feu dans la gare : ne restez pas en bas. Le chlore est plus lourd que l’air, il coule comme de l’eau. Partez face au vent, et montez. »',
  },

  // ═══════════════ SALON — le cimetière Saint-Roch ═══════════════
  doc_etiquette: {
    titre: 'Étiquette d’identification', style: 'imprime', lieu: 'cimetiere',
    texte: 'CELLULE MORTUAIRE PROVISOIRE — SAINT-ROCH\nZONE D’EXCLUSION SANITAIRE 13\n\nNOM / PRÉNOM : INCONNU (homme, 40-50 ans)\nN° : 12-0188\nPROVENANCE : VOIE PUBLIQUE — COURS CARNOT\nDÉCÈS CONSTATÉ LE : 09/09\nCAUSE : MORSURE — NEUTRALISÉ (TÊTE)\nDESTINATION : LOT 12 — INCINÉRATION\n\nNe pas ouvrir la housse. Ne pas toucher sans gants.',
  },
  doc_registre_saint_roch: {
    titre: 'Registre de la morgue provisoire — Saint-Roch', style: 'tape', lieu: 'cimetiere', marqueur: 'conteneur_frigo',
    texte: 'MORGUE PROVISOIRE SAINT-ROCH — 2e RÉGIMENT MÉDICAL / DÉTACHEMENT DE DÉCONTAMINATION\n\nLOT 9 — 198 corps — incinéré le 10/09 (site : carrière de la Crau)\nLOT 10 — 204 corps — incinéré le 11/09\nLOT 11 — 187 corps — incinéré le 12/09\nLOT 12 — 212 corps — EN ATTENTE D’INCINÉRATION — stockés dans les conteneurs A et B et dans des chapelles familiales (voir plan)\n\nGroupe électrogène des conteneurs frigorifiques : plein fait le 13/09 — autonomie 96 h\nPASSAGE DU 16/09 : ANNULÉ (convoi bloqué, rond-point de l’Anjou)\n\nEn bas de la page, quelqu’un a ajouté au stylo :\n« Mettre des corps dans les chapelles, ce n’est pas réglementaire, je sais. Mais les conteneurs sont pleins et il fait 34 degrés. Pardon aux familles. — Sgt B. »',
  },
  doc_consignes_ramassage: {
    titre: 'Fiche réflexe — équipes de ramassage', style: 'imprime', lieu: 'cimetiere', marqueur: 'soldat_nrbc',
    texte: 'FICHE RÉFLEXE N° 4 — RAMASSAGE DES CORPS EN ZONE D’EXCLUSION\n\n1. Tenue de protection complète (combinaison, masque, gants). Aucune exception.\n2. Travailler à deux. Le second tient l’arme.\n3. CORPS PRÉSENTANT UNE ACTIVITÉ (mouvement, son, ouverture des yeux) : TIR DANS LA TÊTE, puis mise en housse.\n4. CORPS INERTES : TIR DANS LA TÊTE QUAND MÊME, puis mise en housse. Un corps inerte peut se relever dans l’heure.\n5. Effets personnels : dans un sachet scellé, agrafé à la housse.\n6. Ne pas parler aux corps.\n\n(Quelqu’un a ajouté au feutre, en dessous : « Même quand c’est ta mère. Surtout quand c’est ta mère. »)',
  },
  doc_cahier_gardien: {
    titre: 'Le cahier du gardien', style: 'manuscrit', lieu: 'cimetiere', marqueur: 'loge_gardien',
    texte: '3 septembre. Les enterrements de la semaine sont reportés « jusqu’à nouvel ordre », d’après la mairie. Mme Isnard est quand même venue fleurir la tombe de son mari, et je l’ai laissée faire.\n\n10 septembre. Les militaires sont arrivés avec deux camions frigorifiques et m’ont annoncé que le cimetière était « réquisitionné ». Quand j’ai demandé pour combien de temps, ils ont ri.\n\n13 septembre. Il n’y a plus de place dans les camions, alors ils ont ouvert les chapelles des familles : les Roux-Bérenger, les Estève, les Isnard, les Castellan. Je leur ai donné les clés. Qu’est-ce que je pouvais faire d’autre ?\n\n14 septembre. C’est maintenant le sergent qui garde la clé de la grille : il ferme lui-même le soir et rouvre le matin. Il m’a demandé s’il existait un double, et je lui ai répondu que non. Je ne sais pas pourquoi j’ai menti. Je n’aime pas qu’on m’enferme, voilà tout.\n\n16 septembre. Ils ne sont pas revenus. La grille est fermée, et je suis enfermé dedans, avec eux. Heureusement que j’ai gardé le double. Le groupe électrogène s’est arrêté, les frigos ne tournent plus, et ça commence à sentir. Cette nuit, les sirènes ont hurlé du côté de Miramas, et tous les morts du quartier sont passés devant la grille en courant vers l’ouest.\n\n19 septembre. J’ai soif, mais je ne bois plus l’eau du robinet : elle a un drôle de goût.\n\n22 septembre. Sur mon petit poste, une jeune fille appelle les survivants à Miramas-le-Vieux. Je pourrais prendre le double et y aller. Mais pour quoi faire ? Il n’y a plus personne chez nous.\n\n23 septembre. Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas.',
  },
  doc_cimetiere_manieres: {
    titre: 'Plan des chapelles réquisitionnées', style: 'imprime', lieu: 'cimetiere',
    texte: 'PLAN — CIMETIÈRE SAINT-ROCH — CHAPELLES RÉQUISITIONNÉES (LOT 12)\n\nAllée des Pins : ROUX-BÉRENGER (4 housses), ESTÈVE (6), CASTELLAN (5)\nAllée du Rocher : ISNARD (3), FAMILLE X (tombe sans nom, 2)\nEsplanade : conteneurs A et B (192)\n\nClés : loge du gardien.',
  },

  // ═══════════════ SALON — la Tour de l’Horloge, la maison de Nostradamus ═══════════════
  doc_plaque_1909: {
    titre: 'Plaque de la salle de l’horloge', style: 'imprime', lieu: 'tour_horloge', marqueur: 'mecanisme_horloge',
    texte: 'LA TOUR DE L’HORLOGE\n\nÉdifiée de 1626 à 1630 à l’emplacement de la porte Farreiroux, achevée en 1664. Le campanile en fer forgé est l’œuvre du serrurier salonais Joseph Rolland ; l’horloge à phases de lune, celle des frères Quintrand. Trois cloches : 2 563 kilogrammes de bronze.\n\nLe 11 juin 1909, à 21 h 10, un séisme d’une violence inouïe frappe la Provence. À Salon, les cheminées s’effondrent, les façades se lézardent, l’horloge s’arrête. Réparée en 1912, elle est classée Monument historique la même année.\n\n(En dessous, quelqu’un a ajouté au feutre noir, d’une écriture serrée et penchée : « ET LE MERCREDI 2 SEPTEMBRE 2026, À 10 H 52, PERSONNE N’EST VENU LA REMONTER. »)',
  },
  doc_carnet_maud_tour: {
    titre: 'Carnet trouvé dans la tour', style: 'carnet', lieu: 'tour_horloge', marqueur: 'carnet_tour',
    texte: '(Un petit carnet à couverture noire, oublié sur une marche de l’escalier de la Tour de l’Horloge.)\n\n5 septembre. Je suis monté dans la tour avec de l’eau et des biscuits. D’en haut, on voit tout Salon. Ils sont partout.\n\n10 septembre. Un chien a aboyé une heure au pied de la tour, et tous les morts de la place sont venus l’entourer. Je n’ai pas regardé la fin.\n\n16 septembre. Les sirènes vers Miramas, toute la nuit. La place s’est vidée en une heure. Ils couraient. Je n’avais jamais vu un mort courir.\n\n22 septembre. À la radio, une jeune fille : le Refuge de Miramas-le-Vieux accueille les survivants, il faut montrer ses mains à la porte. Je l’ai écoutée six fois de suite.\n\n23 septembre. Trente kilomètres. Je n’ai que des chaussures de ville.\n\n24 septembre. J’y vais demain.\n\n(Les pages suivantes sont blanches.)',
  },
  doc_cartel_peste: {
    titre: 'Cartel du musée — « Nostradamus et la peste »', style: 'imprime', lieu: 'nostradamus', marqueur: 'cartel_peste',
    texte: 'NOSTRADAMUS ET LA PESTE\n\nEn 1546, la peste ravage Aix-en-Provence. Michel de Nostredame, médecin, y est appelé. Il fait assainir les rues, brûler le linge des malades et distribue des « pilules de roses » — pétales de roses rouges cueillis avant l’aube, sciure de cyprès, girofle, ambre gris — que l’on garde sous la langue.\n\nL’efficacité de ces pilules est douteuse. Sa présence, elle, ne l’est pas : quand les notables fuyaient la ville, il est resté.\n\nL’année suivante, il s’installe à Salon, dans cette maison, où il écrira les Prophéties.\n\n(Au crayon, dans la marge, quelqu’un a écrit : « Il est resté. C’est tout ce qu’on retient de lui. »)',
  },
  doc_fiche_p5: {
    titre: 'Feuille scotchée au pilier', style: 'manuscrit', lieu: 'nostradamus', marqueur: 'cave_patiente',
    texte: 'Sylvie R., 44 ans. Ma femme.\n\nMordue le 9 septembre à la main droite, par une cliente, au guichet de la poste. Fièvre le soir. Morte le 10, à 4 h 20. Relevée à 4 h 50.\n\nJe l’ai attachée au pilier avec la sangle de la remorque. Je ne peux pas faire ce qu’il faudrait faire. À la radio, ils disent qu’on cherche un remède, à Marseille. Alors je la garde pour quand ils l’auront trouvé.\n\nJe lui donne de l’eau. Elle ne la boit pas.\n\n13 septembre. Elle me reconnaît, je crois. Elle tourne la tête quand je chante.\n\n16 septembre. Elle ne tourne plus la tête.\n\n19 septembre. Je pars chercher de quoi manger. Si je ne reviens pas, et que vous lisez ça : ne lui faites pas de mal. Ou alors, faites-le vite.\n\n— Thierry',
  },
  doc_scanner_maud: {
    titre: 'Carnet d’écoute — fréquences militaires', style: 'carnet', lieu: 'nostradamus', marqueur: 'scanner_maud',
    texte: '(Un cahier d’écolier couvert de fréquences et d’heures, tenu par quelqu’un qui passait ses nuits sur un scanner radio.)\n\n10 septembre, 23 h 02. En clair : « … rabattage, phase un, axe Crau. Les éléments convergent vers le triage. » Le triage, c’est la gare de Miramas.\n\n14 septembre, 4 h 40. Un opérateur fatigué : « Combien, là-dedans ? » Réponse : « Huit mille, peut-être dix. Ils ne bougent plus, ils écoutent le haut-parleur. »\n\n19 septembre, 22 h. « … le convoi 51208 est toujours voie 34. Personne ne veut aller le chercher. » Quelqu’un rit.\n\n23 septembre, 18 h. Une femme, très calme, sur une fréquence que je n’avais jamais entendue : « Beauvezer, ici PC Durance. Soixante heures. Je répète, soixante heures. » Je ne sais pas ce que veut dire Beauvezer.\n\n24 septembre. J’ai réécouté l’enregistrement. Soixante heures avant quoi ?',
  },

  // ═══════════════ SALON — l’Empéri (le camp du professeur Vidal), Saint-Laurent ═══════════════
  doc_journal_vidal: {
    titre: 'Registre du château — J. Vidal', style: 'manuscrit', lieu: 'emperi', marqueur: 'journal_vidal',
    texte: 'Mercredi 2. Le proviseur a ordonné l’évacuation du lycée à 11 h 20, mais les bus ne sont jamais venus. J’ai fait monter ma classe au château, pour les murs, la hauteur et la porte unique. Nous sommes 27 élèves et 4 collègues.\n\nJeudi 3. Les parents ne viennent pas, et les téléphones ne passent plus. Mehdi a trouvé de l’eau dans les citernes du musée.\n\nSamedi 5. Deux élèves sont partis rejoindre leurs familles. Ils ne sont pas revenus.\n\nDimanche 6. La foule est arrivée par la montée du Puech. J’ai fait entrer tous ceux que je pouvais, puis j’ai fermé la grille.\n\nSamedi 12. Samir est tombé du rempart. Nous l’avons enterré dans la cour, sous le micocoulier.\n\nMercredi 16. Les sirènes, toute la nuit, vers Miramas. Les morts du Puech sont partis en courant. Au matin, la montée était vide pour la première fois depuis dix jours.\n\nMardi 22. Les grands ont capté à la radio une jeune fille de Miramas-le-Vieux qui appelle les survivants. Ils voulaient y aller. J’ai dit non : nous avons des murs, et je ne les échangerai pas contre trente kilomètres de route.\n\nJe fais cours tous les matins : tant qu’il y a un cours, il y a un lendemain.',
  },
  doc_regles_emperi: {
    titre: 'Règles du château', style: 'manuscrit', lieu: 'emperi', marqueur: 'panneau_regles',
    texte: 'RÈGLES DU CHÂTEAU (écrites au marqueur au dos d’une affiche du musée)\n\n1. À la porte, tout le monde montre ses bras pour prouver qu’il n’est pas mordu. Même moi.\n2. Personne ne sort seul.\n3. On ne boit pas l’eau de la fontaine sans l’avoir fait bouillir.\n4. On ne pleure pas devant les petits. On pleure la nuit.\n5. Si on est mordu, on le dit tout de suite. Personne ne vous en voudra.\n6. Cours tous les matins à 9 h, présence obligatoire.\n7. Les sabres du musée sont à tout le monde et à personne.\n\n(En dessous, quelqu’un a ajouté d’une écriture ronde : « 8. Nathan ne touche plus aux sabres. »)',
  },
  doc_cartel_sabre: {
    titre: 'Cartel — sabre de cavalerie légère', style: 'imprime', lieu: 'emperi', marqueur: 'vitrine_sabres',
    texte: 'SABRE DE CAVALERIE LÉGÈRE, MODÈLE AN XI\nManufacture de Klingenthal, vers 1810. Lame courbe à un tranchant, garde à trois branches.\nArme des hussards et chasseurs à cheval de la Grande Armée, conçue pour frapper du tranchant au galop, pendant les charges.\n\nMusée de l’Empéri — collection Raoul et Jean Brunon.\n\n(Il manque cinq sabres dans la vitrine, et le dernier a la lame ébréchée. Quelqu’un a scotché un mot sur la vitre : « EMPRUNTÉS. RENDUS QUAND CE SERA FINI. — M. VIDAL »)',
  },
  doc_tombeau: {
    titre: 'Plaque de la chapelle de la Vierge', style: 'imprime', lieu: 'saint_laurent', marqueur: 'tombeau_nostradamus',
    texte: 'Ici reposent les restes de Michel NOSTRADAMUS (1503-1566), médecin et astrologue, auteur des Prophéties.\n\nD’abord inhumé dans l’église des Cordeliers, son tombeau fut profané en 1791 par des gardes nationaux. Ses ossements furent transférés en cette collégiale la même année.\n\nLa tradition rapporte que l’un des profanateurs but du vin dans son crâne, et qu’il fut tué le lendemain.\n\n(En dessous, Nathan a écrit au feutre : « La légende dit que celui qui ouvre le tombeau meurt dans l’année. J’ai vérifié, c’est faux : je ne l’ai pas ouvert, et je vais mourir quand même. N. »)',
  },
  doc_telephone_nathan: {
    titre: 'Le téléphone de Nathan', style: 'sms', lieu: 'saint_laurent', marqueur: 'sac_nathan',
    texte: 'NATHAN → MAMAN (22/09, 07:02) : on va a st laurent avec elodie chercher des cierges. vidal a dit ok. je t’aime\nNATHAN → MAMAN (22/09, 09:48) : y a plein de monde dans l’eglise mais ils bougent pas. le curé agite une clochette. c’est ouf\nNATHAN → MAMAN (22/09, 10:15) : le curé m’a mordu\nNATHAN → MAMAN (22/09, 10:16) : c’est pas grave\nNATHAN → MAMAN (22/09, 10:31) : elodie va m’enfermer dans la chapelle de nostradamus. c’est moi qui lui ai demandé. elle pleure\nNATHAN → MAMAN (22/09, 11:02) : j’ai froid\nNATHAN → MAMAN (22/09, 11:40) : dis a papa que j’ai pas eu peur. c’est faux mais dis-lui\n(Aucun message n’a été distribué.)',
  },
  doc_annonce_paroisse: {
    titre: 'Feuille paroissiale', style: 'imprime', lieu: 'saint_laurent', marqueur: 'presentoir',
    texte: 'PAROISSE SAINT-LAURENT — SAINT-MICHEL — SALON-DE-PROVENCE\n\nDIMANCHE 6 SEPTEMBRE — 18 H\nMESSE POUR LES VICTIMES DU 2 SEPTEMBRE ET POUR LEURS FAMILLES\n\nLa collégiale restera ouverte jour et nuit à tous ceux qui cherchent un abri.\nApportez ce que vous pouvez : eau, couvertures, bougies.\n« Venez à moi, vous tous qui peinez » (Mt 11, 28)\n\nLe père Antoine assurera une présence permanente.',
  },

  // ═══════════════ SALON — l’hôpital ═══════════════
  doc_garde_urgences: {
    titre: 'Tableau de garde des urgences', style: 'imprime', lieu: 'hopital', marqueur: 'dossiers_urgences',
    texte: 'CENTRE HOSPITALIER DU PAYS SALONAIS — URGENCES — TABLEAU DE GARDE DE NUIT\n\n(Un tableau imprimé, scotché sur la porte du bureau infirmier. Les noms ont été barrés un par un, au feutre rouge.)\n\nNuit du 7 : DUMAS L. (infirmière) — barré. KHELIF S. (aide-soignant) — barré. MOREAU B. (infirmier).\nNuit du 8 : MOREAU B.\nNuit du 9 : MOREAU B.\nNuit du 10 : MOREAU B.\nNuit du 11 : MOREAU B.\n\n(En bas, au stylo bille, d’une écriture fatiguée :) « Le 12, l’armée a tout pris : les médicaments, le matériel, et ceux qui voulaient monter dans les camions. Je reste avec ceux qu’ils ont laissés : M. Bertrand au box 3, Mme Giraud au box 9, et le petit du box 11. On fera ce qu’on pourra. — B. M. »',
  },
  doc_rapport_8_septembre: {
    titre: 'Rapport à la cellule de crise — brouillon', style: 'tape', lieu: 'hopital', marqueur: 'bureau_maud',
    texte: 'CH DU PAYS SALONAIS — SERVICE DES URGENCES\nÀ : Cellule interministérielle de crise, préfecture des Bouches-du-Rhône\nOBJET : Évolution de l’état des personnes mordues — observations\nDATE : 08/09\n\nMadame, Monsieur,\n\nDepuis le 2 septembre, notre service a pris en charge plus de 1 100 personnes mordues. Les constats sont les mêmes pour toutes.\n\n1. Après la morsure, la fièvre apparaît en une à six heures. Le décès survient entre trois et trente heures.\n2. Moins d’une heure après le décès, le corps se relève. Il ne répond à aucun soin, ne reconnaît personne et cherche à mordre. Il est attiré par le bruit et par la lumière.\n3. Aucun antibiotique, aucun antiviral, aucun sérum n’a modifié l’évolution.\n4. Ces corps restent actifs malgré des blessures incompatibles avec la vie. Seule une atteinte grave du cerveau les arrête.\n\nJe demande en urgence l’évacuation des patients non mordus, des moyens de contention, et l’envoi d’une équipe de l’Institut Pasteur.\n\n(En bas, au stylo : « Envoyé trois fois. Aucune réponse. On attache les patients avant qu’ils meurent. Je ne sais pas combien de temps l’équipe tiendra. »)\n\nDr A. Ferrand, chef du service des urgences.',
  },

  // ═══════════════ SALON — lieux secondaires ═══════════════
  doc_affiche_marche: {
    titre: 'Grand marché du mercredi — plan des emplacements', style: 'imprime', lieu: 'place_de_gaulle',
    texte: 'VILLE DE SALON-DE-PROVENCE — GRAND MARCHÉ DU MERCREDI (8 h – 12 h 30)\nPlan des emplacements — septembre 2026\n\nCours Carnot : fruits et légumes (emplacements 1 à 34), fromages (35-38), charcuterie (39-42)\nCours Victor-Hugo : textile, maroquinerie, bazar\nPlace du Général-de-Gaulle : fleurs, plants, producteurs locaux\nCours Gimon : poissonnerie, rôtisserie, huile d’olive de la vallée des Baux\n\n(Quelqu’un a fait des croix au stylo rouge sur une dizaine d’emplacements du cours Carnot, et a écrit à côté de l’emplacement 36, la fromagerie : « C’EST LÀ QUE TOUT A COMMENCÉ ».)',
  },
  doc_addition_crousillat: {
    titre: 'Une addition', style: 'imprime', lieu: 'place_crousillat',
    texte: 'CAFÉ — PLACE CROUSILLAT — TABLE 7\nMERCREDI 02/09/2026 — 10:38\n\n2 CAFÉ ............ 3,60\n1 PASTIS .......... 3,20\n1 CROISSANT ....... 1,40\n\nTOTAL ............. 8,20 €\n\nMERCI DE VOTRE VISITE — À BIENTÔT\n\n(L’addition n’a jamais été payée. Un euro de pourboire est resté posé dessus, sous une soucoupe.)',
  },
  doc_arrete_prefectoral: {
    titre: 'Arrêté préfectoral n° 2026-09-03', style: 'imprime', lieu: 'hotel_de_ville',
    texte: 'PRÉFECTURE DES BOUCHES-DU-RHÔNE\nARRÊTÉ portant mesures d’urgence sanitaire sur le territoire de l’arrondissement d’Aix-en-Provence\n\nArticle 1er : Le confinement strict de la population est ordonné sur les communes de Salon-de-Provence, Pélissanne, Lançon-Provence, Grans, Eyguières, Lamanon, Sénas, Alleins, Aurons, Vernègues, La Barben, Miramas, Saint-Chamas, Cornillon-Confoux.\nArticle 2 : Tout déplacement est interdit sauf autorisation des forces de l’ordre.\nArticle 3 : Toute personne présentant une morsure doit se signaler immédiatement.\nArticle 4 : Les établissements recevant du public sont fermés.\n\nFait à Marseille, le 3 septembre 2026.\n\n(Quelqu’un a écrit en travers, au feutre : « ET APRÈS ? »)',
  },
  doc_pv_cellule_crise: {
    titre: 'Cellule de crise communale — relevé de décisions', style: 'tape', lieu: 'hotel_de_ville',
    texte: 'CELLULE DE CRISE — HÔTEL DE VILLE — RÉUNION DU 03/09, 22 H\nPrésents : maire adjoint, directeur général des services, police municipale, pompiers, hôpital (Dr Ferrand), gendarmerie, armée de terre (commandante Orsini).\n\n1. Le Dr Ferrand signale 1 100 admissions en 36 h. Il demande l’évacuation des malades hospitalisés. REFUSÉ (pas de véhicules).\n2. La commandante Orsini annonce le repli de l’armée derrière la Durance d’ici trois jours. Salon ne sera pas défendu.\n3. Le Dr Ferrand demande des moyens de contention et des sacs mortuaires. La commandante Orsini prend note.\n4. Le maire adjoint demande ce qu’il faut dire à la population. Pas de réponse.\n\nPROCHAINE RÉUNION : 04/09, 8 h.\n(Aucun autre relevé.)',
  },
  doc_main_courante: {
    titre: 'Main courante — commissariat', style: 'tape', lieu: 'commissariat',
    texte: 'MAIN COURANTE — CIRCONSCRIPTION DE SALON\n\n02/09 10:52 — Appel : bagarre au marché, cours Carnot, « une femme mord son mari ». Patrouille envoyée.\n02/09 11:04 — Patrouille : « plusieurs individus agressifs, morsures, demande de renfort ».\n02/09 11:09 — La patrouille ne répond plus.\n02/09 11:30 — 146 appels en attente.\n02/09 13:15 — Ordre préfectoral : regroupement au commissariat.\n03/09 02:40 — Le brigadier L. a été mordu pendant une interpellation. Il dit qu’il va bien.\n03/09 09:00 — Le brigadier L. ne va pas bien.\n04/09 — Repli vers la Durance ordonné. On laisse les clés sur le comptoir, au cas où quelqu’un en aurait besoin.',
  },
  doc_entailles_203: {
    titre: 'Chambre 203', style: 'manuscrit', lieu: 'hotel_poste',
    texte: '(Au mur de la chambre 203, au-dessus du lit, quelqu’un a fait vingt-trois entailles au canif dans le papier peint. En dessous, il a écrit au stylo :)\n\nJour 23. J’ai mangé ma dernière conserve. La radio dit que Miramas-le-Vieux tient toujours, alors je pars pour la gare. S’il y a un locotracteur sur la voie de service, je le ferai démarrer.\n\nSi tu lis ça et que tu as besoin d’un lit, celui-ci est bon, et le verrou doré tient.\n\nUn jour de plus, c’est tout ce que je demande.',
  },
  doc_sms_parents: {
    titre: 'Groupe « Parents 2nde 4 — Craponne »', style: 'sms', lieu: 'lycee',
    texte: 'Sandrine B. (02/09, 11:05) : Quelqu’un sait ce qui se passe sur le cours ?? Les pompiers passent en boucle\nKarim T. (11:07) : Le lycée confine, les enfants sont en classe\nSandrine B. (11:12) : On peut aller les chercher ?\nProf principal (11:20) : NE VENEZ PAS. Les grilles sont fermées. On gère. Les enfants sont en sécurité.\nNathalie R. (12:40) : Ma fille dit qu’il y a des gens qui tapent aux vitres du gymnase\nKarim T. (12:41) : Des gens ?\nNathalie R. (12:58) : Elle ne répond plus\nSandrine B. (13:30) : Quelqu’un est sur place ??\nSandrine B. (15:02) : Je suis devant. Les grilles sont ouvertes.\nSandrine B. (15:03) : Il n’y a personne dans la cour\nSandrine B. (15:04) : Si. Il y a quelqu’un.\n(Plus aucun message.)',
  },
  doc_liste_casino: {
    titre: 'Liste de courses', style: 'manuscrit', lieu: 'casino_shop',
    texte: 'De l’eau (BEAUCOUP)\nDes piles\nDu riz, des pâtes\nDes croquettes pour Filou\nDes bougies\nDu sucre\nDu lait en poudre (pour la petite)\nRIEN D’AUTRE\nNe pas parler aux gens\nNe pas traîner\nRevenir avant midi\n\nMaman',
  },
  doc_ordonnance_luc: {
    titre: 'Ordonnance — insuline', style: 'imprime', lieu: 'pharmacie_carnot',
    texte: 'Dr C. Roubaud — médecine générale — Salon-de-Provence\nPatient : A. Jean-Pierre, 62 ans\nInsuline rapide : selon glycémie\nInsuline lente : 24 unités au coucher\nRenouvelable 6 mois.\n\n(Au dos, la pharmacienne a écrit au stylo :)\n« Mon mari. Ses stylos sont au frigo du préparatoire, et le frigo ne marche plus depuis le 6. Il en reste peut-être dans les cartons de la réserve, au fond. Je reviendrai les chercher. — Mireille A. »',
  },
  doc_programme_cine: {
    titre: 'Programme du mercredi 2 septembre', style: 'imprime', lieu: 'cineplanet',
    texte: 'CINÉPLANET — PLACE MORGAN — MERCREDI 2 SEPTEMBRE\nSéances du matin (dernier jour des vacances !) :\n10:00 — Film d’animation (salle 3) — COMPLET\n10:15 — Film d’animation, VF (salle 5)\n10:30 — Avant-première (salle 1)\n\n(Sur la porte de la salle 3, quelqu’un a écrit au rouge à lèvres, de l’intérieur : « NE PAS OUVRIR. ILS SONT TOUS DEDANS. ON A FERMÉ À 11 H. PARDON »)',
  },
  doc_carnet_pompier: {
    titre: 'Carnet d’interventions — ambulance des pompiers n° 2', style: 'carnet', lieu: 'pompiers',
    texte: '02/09, 10:58, cours Carnot : « morsure humaine ». Victime de 60 ans, mordue à l’avant-bras, transportée à l’hôpital.\n02/09, 11:20, cours Carnot : quatre victimes. L’une d’elles devient agressive dans le véhicule, et on doit l’attacher.\n02/09, 11:45 : la victime attachée n’a plus de pouls. À 11:52, elle bouge, mais les sangles tiennent.\n02/09, 13:10 : Jeannot s’est fait mordre la main en déchargeant. Il dit que ce n’est rien.\n03/09 : Jeannot n’est pas venu à la relève.\n04/09 : ordre de faire partir tous les engins vers la Durance pour tenir les ponts. On s’en va.\n04/09 : on laisse les haches ici. Le lieutenant a dit : « Ils en auront plus besoin que nous. »',
  },
  doc_repli_gendarmerie: {
    titre: 'Message — ordre de repli', style: 'tape', lieu: 'gendarmerie',
    texte: 'MESSAGE — URGENT — GROUPEMENT 13\nDESTINATAIRES : toutes brigades arrondissement d’Aix\n\n1. Repli immédiat de tous les personnels et familles sur la rive nord de la Durance (Mérindol, Cavaillon).\n2. Armement et munitions emportés ou détruits.\n3. Les personnels présentant une morsure ne sont PAS autorisés à franchir. Ils resteront en poste.\n4. Aucune exception.\n\n(Au bas du télex, quelqu’un a écrit au stylo : « Adjudant M., mordu le 3. Je reste en poste. J’ai fermé le portail, les familles sont parties. Tout va bien. Il fait beau. »)',
  },
  doc_centuries: {
    titre: 'Les Prophéties — édition annotée', style: 'manuscrit', lieu: 'mediatheque',
    texte: '(Un livre de poche des Prophéties, ouvert et annoté au crayon par un survivant.)\n\n« Quand le grand vent viendra du septentrion… » — C’est peut-être un quatrain inventé : je ne le trouve pas dans l’index. Je l’ai peut-être rêvé.\n\n« Les morts seront vivants, les vivants mis à mort » — Je ne l’ai pas trouvé non plus, mais ça sonne juste.\n\nJ’ai relu tout le livre deux fois, et il n’a rien prévu. Personne ne prévoit jamais rien : on écrit des phrases assez floues pour que n’importe quelle catastrophe puisse s’y glisser.\n\nJ’ai quand même écrit une chose, au crayon, sur la dernière page : « Un jour de plus. » Ce n’est pas une prophétie. C’est tout ce que je demande.',
  },
  doc_savonnerie: {
    titre: 'Mot sur la porte de la savonnerie', style: 'manuscrit', lieu: 'marius_fabre',
    texte: 'Servez-vous en savon. Lavez-vous les mains, lavez les plaies, lavez tout : le savon de Marseille tue ce que l’eau seule ne tue pas.\n\nOn fait du savon ici depuis 1900, et on en a fait pendant deux guerres. On aurait continué pendant celle-là, mais on n’a plus d’huile.\n\nPrenez-en autant que vous pouvez en porter, il ne se périme pas.\n\n— L’équipe',
  },
  doc_lettre_canourgues: {
    titre: 'Lettre à Yanis', style: 'manuscrit', lieu: 'canourgues',
    texte: 'Yanis,\n\nJe laisse cette lettre sur la table, au cas où tu reviendrais du travail à Clésud. Je suis chez ta tante, au 4e étage du bâtiment C, et on a barricadé l’escalier avec les machines à laver.\n\nSi tu es mordu, ne viens pas. Je t’aime, mais ne viens pas, parce que je ne pourrais pas.\n\nSi tu n’es pas mordu, frappe trois coups, puis deux coups, et je t’ouvrirai.\n\nJ’ai fait des cornes de gazelle, et je t’en garde.\n\nMaman',
  },
  doc_annonce_gare: {
    titre: 'Avis aux voyageurs', style: 'imprime', lieu: 'gare',
    texte: 'SNCF VOYAGEURS — TER SUD\n\nEN RAISON D’UN ÉVÉNEMENT EXCEPTIONNEL, LE TRAFIC EST INTERROMPU ENTRE AVIGNON ET MIRAMAS JUSQU’À NOUVEL ORDRE.\n\nLES VOYAGEURS SONT INVITÉS À NE PAS SE RENDRE EN GARE.\n\nNOUS VOUS PRIONS DE NOUS EXCUSER POUR LA GÊNE OCCASIONNÉE.\n\n(Quelqu’un a scotché en dessous un papier à carreaux : « Le locotracteur de la voie de service marche. Il lui faut une batterie de camion et du gasoil. Bonne chance. »)',
  },
  doc_socle_jean_moulin: {
    titre: 'Messages sur le socle', style: 'manuscrit', lieu: 'jean_moulin',
    texte: 'Sur le socle de la statue, des messages s’entassent :\n\n« CALÈS — PAR LES COLLINES — PAS LA ROUTE » (au goudron)\n« La famille Garcia est partie vers Lamanon le 9. Kevin, si tu lis ça, on t’attend. » (à la craie)\n« Le prof de l’Empéri ouvre à ceux qui ne sont pas mordus » (au feutre)\n« QUAND LES SIRÈNES HURLENT, MONTEZ DANS LES COLLINES » (au rouge à lèvres)\n« Jean, toi qui es tombé du ciel, dis-leur de venir nous chercher » (gravé au couteau dans le bronze)\n« RADIO : MIRAMAS-LE-VIEUX ACCUEILLE LES SURVIVANTS — ROUTE DE SAINT-CHAMAS — MONTREZ VOS MAINS » (à la chaux, en énorme, par-dessus tout le reste)',
  },
  doc_leclerc: {
    titre: 'Note de service — direction', style: 'tape', lieu: 'leclerc',
    texte: 'NOTE DE SERVICE — 02/09 — 14 H\nÀ l’attention de tous les collaborateurs\n\nSuite aux événements du centre-ville, le magasin est fermé au public à compter d’aujourd’hui, 14 h.\nLes collaborateurs qui le souhaitent peuvent rester dans l’enceinte du magasin. Les rideaux seront baissés.\nMerci de ne pas vous servir dans les rayons sans passer en caisse. Un relevé sera fait.\n\nLa Direction\n\n(En dessous, quelqu’un a répondu au feutre : « Relevé fait le 9/09 : on s’est servis de tout. Pardon. — Les 14 de la réserve »)',
  },
  doc_weldom: {
    titre: 'Inventaire de fortune', style: 'manuscrit', lieu: 'weldom',
    texte: 'Ce qu’on a pris le 11/09 :\n- 3 haches\n- 12 pieds-de-biche\n- 10 kg de clous de 70 mm\n- 40 planches de coffrage\n- 6 bâches\n- 2 groupes électrogènes (le troisième ne marche pas)\n- toute la corde\n- les gants\n\nOn est à la piscine des Canourgues, et on se barricade. Si tu as besoin de quelque chose, viens, on partage. Frappe fort : le chien aboiera avant nous.',
  },
  doc_intermarche: {
    titre: 'Ticket de caisse du 2 septembre', style: 'imprime', lieu: 'intermarche',
    texte: 'INTERMARCHÉ SUPER — SALON BEL-AIR\n02/09/2026 — 10:47 — CAISSE 4\n\nPAIN DE MIE ........... 1,89\nJAMBON x4 ............. 3,45\nCOMPOTES x12 .......... 4,20\nBOUGIE ANNIVERSAIRE 8 . 1,99\nGÂTEAU CHOCOLAT ....... 6,90\n\nTOTAL ................ 18,43 €\n\n(Au dos, quelqu’un a écrit au stylo : « Bon anniversaire, Noé. Maman arrive. »)',
  },
  doc_saint_michel: {
    titre: 'Sur le portail de Saint-Michel', style: 'manuscrit', lieu: 'saint_michel',
    texte: '(Écrit à la craie, sous les deux diables sculptés au sommet du portail roman :)\n\nEn 1239, ils ont mis les diables dehors pour que le Mal reste dehors, et ils avaient raison.\n\nON EST DEDANS. ON N’OUVRE PAS, MÊME AUX CURÉS.',
  },

  // ═══════════════ PAYS SALONAIS — Calès, Vernègues, la BA 701, Mallemort, Sénas ═══════════════
  doc_registre_cales: {
    titre: 'Registre de Calès', style: 'manuscrit', lieu: 'cales', marqueur: 'registre_cales',
    texte: 'GROTTES DE CALÈS — REGISTRE (tenu par Marcelle, ancienne secrétaire de mairie de Lamanon)\n\nHabitants : 43, dont 11 enfants.\nEau : citerne pleine aux deux tiers (on la remplit avec le canal de Craponne, en ouvrant la vanne).\nRations : un repas chaud et deux gobelets d’eau par jour.\n\n08/09 — Arrivée des Garcia, de Salon : 5 personnes.\n09/09 — On a refusé l’entrée à 7 personnes de Sénas, parce qu’il y avait deux mordus parmi eux. Ils sont repartis vers le nord. [Ajouté plus tard : Je n’aurais pas dû. Je ne sais pas. J’aurais dû.]\n16/09 — Les sirènes sur Miramas, toute la nuit. Les morts de la plaine sont partis vers le sud. On a respiré.\n22/09 — Une jeune fille, à la radio, appelle les survivants à Miramas-le-Vieux. Trois des nôtres veulent y aller. J’ai dit non : c’est à trente kilomètres. Ils sont partis quand même.\n26/09 — Une fumée noire au sud, toute la journée, et le soir, une odeur de piscine qui monte de la plaine. Plus personne ne descend.',
  },
  doc_bulletin_meteo: {
    titre: 'Bulletin — noté à la main', style: 'manuscrit', lieu: 'cales', marqueur: 'radio_cales',
    texte: '(Noté au crayon en écoutant une radio d’Avignon, de l’autre côté de la Durance.)\n\nMÉTÉO — Provence, vallée du Rhône\nAnticyclone persistant, vent faible, nuits calmes et fraîches avec brouillards en plaine au lever du jour. Pas de mistral attendu avant le début du mois d’octobre.\n\nAprès, il y a eu les infos : un festival reporté, un match de foot, le prix de l’essence. Le mot « zone » n’est passé qu’une fois, à la fin, entre la Bourse et la météo des plages.\n\nIls vivent, là-bas. Ils vivent comme si nous n’étions pas là.',
  },
  doc_carnet_berger: {
    titre: 'Carnet de comptes d’un berger', style: 'carnet', lieu: 'vernegues', marqueur: 'berger',
    texte: '(Un carnet de berger, tenu à la lampe dans les ruines de Vieux-Vernègues. Les comptes sont faits en bâtons, par paquets de cinq.)\n\n3/09 — Monté les bêtes au vieux village, où il n’y a plus personne depuis 1909. 212 têtes. Les murs tiennent encore, et il y a de l’herbe entre les maisons.\n\n9/09 — Un mort est monté par le chemin du château. Je l’ai poussé dans le ravin avec la fourche. 212 têtes.\n\n16/09 — La nuit, les sirènes, au sud. Tous les morts de la plaine sont partis en courant vers Miramas. Les brebis ont tremblé jusqu’au matin. 209 têtes.\n\n20/09 — Trois morts ont sauté le muret de l’enclos. J’en ai tué deux. Le troisième a eu le temps de faire son carnage. 187 têtes.\n\n24/09 — Le loup aurait fait moins de dégâts. 187 têtes.\n\nSi vous êtes vivant et que vous savez traire, montez. Il y a du lait pour deux, et je n’en peux plus de le boire tout seul.',
  },
  doc_lettre_rose: {
    titre: 'Lettre à la famille Ruiz', style: 'manuscrit', lieu: 'vernegues', marqueur: 'rose',
    texte: 'Madame Ruiz,\n\nJe ne sais pas si vous êtes vivante, ni si vous voudrez me lire. Je vous écris quand même, et je garde la lettre, parce que je n’ai pas de timbre et qu’il n’y a plus de facteur.\n\nLe 3 septembre, Kylian est monté m’apporter des œufs, comme tous les jeudis. Il y avait un homme sous le mûrier, un homme du marché de Salon qui était venu mourir chez nous. Kylian s’est mis entre lui et moi, et il a été mordu à l’épaule.\n\nIl est resté chez moi jusqu’au soir. Il me parlait de vos crêpes ; il disait que c’étaient les meilleures de la Crau. Quand la fièvre est montée, il m’a demandé de fermer la porte de la cave sur lui, et je l’ai fait.\n\nIl y est toujours. Je l’entends.\n\nJe ne vous demande pas pardon, je n’en ai pas le droit. Je voulais seulement que vous sachiez qu’il est mort pour quelqu’un, et que ce quelqu’un ne le méritait pas.\n\nRose Castagne',
  },
  doc_mur_vernegues: {
    titre: 'Sur le mur de l’église', style: 'manuscrit', lieu: 'vernegues', marqueur: 'mur_eglise',
    texte: '(Écrit à la chaux sur le mur de l’église en ruine de Vieux-Vernègues, en lettres hautes comme un homme.)\n\nLE VILLAGE EST MORT LE 11 JUIN 1909. IL NOUS A ABRITÉS QUAND MÊME.\n\n(Plus bas, d’autres mains ont ajouté des noms, des dates et des conseils :)\nLes Castagne, 5/09.\nIci, il n’y a rien à prendre, alors les morts ne montent presque pas.\nQuand les sirènes hurlent, descendez dans les caves et ne bougez plus.\nOn ne fait pas de feu le soir : on le voit depuis Salon.\n\n(Et dans un coin, quelqu’un a gravé au couteau : « Kylian Ruiz, 16 ans. » Personne n’a osé l’effacer.)',
  },
  doc_lettre_pilote: {
    titre: 'Lettre d’Athos 6, pilote de la Patrouille', style: 'manuscrit', lieu: 'ba701', marqueur: 'hangar_paf',
    texte: 'Ma Zoé,\n\nPapa est toujours à la base, et on n’a toujours pas le droit de décoller. Les neuf avions de la Patrouille sont au sol, en rang, comme pour le 14 Juillet. On les regarde, on les astique, on fait le plein, et tous les matins, on attend un ordre qui ne vient pas.\n\nHier, j’ai entendu des officiers parler de la gare de triage de Miramas, où l’armée pousse les morts avec les sirènes depuis des jours. Ils disent qu’ils la bombarderont quand il y en aura assez. Pas nous : d’autres avions, venus d’ailleurs. Quelqu’un a parlé des wagons de chlore garés là-bas, et un colonel a répondu que le vent s’en chargerait. Personne n’a demandé de quel côté il soufflerait.\n\nJe n’ai jamais été aussi fier de ne pas avoir le droit de voler.\n\nCe soir, je vais m’asseoir dans mon avion, juste pour m’asseoir. Tu te rappelles le meeting de Salon, et le cœur que j’avais dessiné en fumée rouge pour toi ? Je le redessinerai, promis.\n\nPapa (Athos 6)',
  },
  doc_sms_mallemort: {
    titre: 'Un téléphone sur le pont', style: 'sms', lieu: 'mallemort', marqueur: 'voiture_refugies',
    texte: 'SANDRA → CHRIS (18/09, 06:02) : on est au pont de mallemort. y a les soldats de l’autre côté\nSANDRA → CHRIS (06:10) : ils disent de reculer. on est 30. y a des bébés\nSANDRA → CHRIS (06:14) : un monsieur a traversé en courant avec son fils. ils ont tiré\nSANDRA → CHRIS (06:15) : ils ont tiré sur le petit aussi\nSANDRA → CHRIS (06:31) : on attend. personne bouge\nSANDRA → CHRIS (09:47) : y a du réseau au milieu du pont. je t’envoie ça du milieu. ils me voient. ils tirent pas encore\nSANDRA → CHRIS (09:48) : je t’aime. dis aux petits que maman a essa\n(Message partiellement distribué.)',
  },
  doc_imbert: {
    titre: 'Sur la porte de la chambre froide', style: 'manuscrit', lieu: 'senas', marqueur: 'porte_chambre_froide',
    texte: '(Écrit à la craie sur l’isolant de la porte de la chambre froide, à l’intérieur.)\n\nJour 1 — Nous sommes 11, avec 400 kg de pommes et 60 litres d’eau.\nJour 6 — Les morts sont passés. On a retenu notre souffle, et ils sont repartis.\nJour 14 — Ils sont repassés, et c’était pareil.\nJour 20 — Il ne reste plus que 12 litres d’eau, et on n’en peut plus des pommes.\nJour 21 — Lina a eu 5 ans. On lui a fait une compote avec une bougie dedans.\n\nLa règle : on ne sort pas, on n’ouvre pas, on ne fait pas de bruit, et on attend que ça passe.\n\nÇa va passer.',
  },

  // ═══════════════ PAYS SALONAIS — lieux secondaires ═══════════════
  doc_soigneur_barben: {
    titre: 'Cahier de soins — secteur fauves', style: 'carnet', lieu: 'la_barben',
    texte: 'PARC ANIMALIER — SECTEUR FAUVES — CAHIER DE SOINS\n\n03/09 — Nourrissage normal. Les lions sont nerveux à cause des sirènes.\n05/09 — Plus de livraison de viande. Je donne les poulets du stock.\n08/09 — Le stock est épuisé, et je suis seul : les autres sont partis.\n10/09 — J’ai ouvert les enclos des lions, des loups et des hyènes. Je ne pouvais pas les regarder mourir de faim derrière un grillage. Qu’ils aillent chasser : il y a de la viande partout, maintenant.\n10/09 — Les lions sont sortis en marchant, sans se presser. Le vieux mâle s’est retourné une fois, et je jure qu’il m’a remercié.\n11/09 — Un mort rôde autour de ma cabane. Je le reconnais : c’était un visiteur, il portait une casquette du parc.',
  },
  doc_aerodrome: {
    titre: 'Plan de vol déposé', style: 'tape', lieu: 'aerodrome',
    texte: 'AÉRODROME SALON-EYGUIÈRES (LFNE) — PLAN DE VOL\nAppareil : DR400, F-G…\nDépart : LFNE, 04/09, 06:40 locale\nDestination : Ajaccio (LFKJ)\nPersonnes à bord : 4 (dont 2 enfants)\nAutonomie : 5 h\nRemarques : NON AUTORISÉ — ESPACE AÉRIEN FERMÉ\n\n(Quelqu’un a écrit en travers, au stylo : « On a décollé quand même. Si on nous abat, tant pis : c’est mieux que d’attendre. » L’avion n’est plus dans le hangar.)',
  },
  doc_istres: {
    titre: 'Dernier message de la BA 125', style: 'tape', lieu: 'istres',
    texte: 'MESSAGE — BA 125 ISTRES — FLASH\n10/09 — 23:52\n\nLA BASE N’EST PLUS TENABLE. INFECTION À L’INTÉRIEUR DU PÉRIMÈTRE DEPUIS 20:00. DERNIER RAVITAILLEUR DÉCOLLÉ À 23:30 AVEC 211 PERSONNES.\nIL RESTE AU SOL ENVIRON 900 PERSONNELS. NOUS FERMONS LES HANGARS DE L’INTÉRIEUR.\nNE PAS ENVOYER D’APPAREIL.\nFIN DE MESSAGE.\n\nVIVE LA RÉPUBLIQUE. ET DITES À NOS FAMILLES…\n(Transmission interrompue.)',
  },
  doc_poudrerie: {
    titre: 'Plaque commémorative — 1936', style: 'imprime', lieu: 'saint_chamas',
    texte: 'POUDRERIE ROYALE DE SAINT-CHAMAS\n1690 — 1974\n\nÀ la mémoire des 53 ouvrières et ouvriers morts dans l’explosion du 16 septembre 1936.\n\n(Quelqu’un a ajouté à la peinture, en dessous : « ET DES AUTRES. Le 15/09, on a tout fait sauter pour arrêter les morts sur le pont. Ça a marché pendant une heure. »)',
  },
  doc_berre: {
    titre: 'Alerte Seveso — consignes', style: 'imprime', lieu: 'berre',
    texte: 'SITE CLASSÉ SEVESO SEUIL HAUT\nEN CAS D’ALERTE (sirène : son montant et descendant de 1 min 41 s) :\n- Mettez-vous à l’abri dans un bâtiment\n- Fermez portes et fenêtres\n- N’allez pas chercher vos enfants à l’école\n- Écoutez la radio\n\n(Alimentée par une batterie de secours, la sirène sonne sans arrêt depuis des jours, et tous les morts de l’étang tournent autour du site, le nez en l’air. Quelqu’un a écrit sur le panneau : « Merci pour la sirène. Elle nous a sauvé la vie en les attirant tous ici, loin de nos maisons. »)',
  },
  doc_triage: {
    titre: 'Bulletin de composition — train 44721', style: 'tape', lieu: 'miramas',
    texte: 'SNCF FRET — TRIAGE DE MIRAMAS\nTrain 44721 — Miramas → Lyon-Sibelin\nComposition : 22 wagons frigorifiques (fruits, Sénas), 8 citernes\nDépart prévu : 02/09, 14:10\nDépart réel : —\n\n(Quelqu’un a ajouté au stylo : « Le train n’est jamais parti, et les wagons frigorifiques ne refroidissent plus depuis le 6. Alors on les a ouverts, et tout Miramas a mangé des pêches pendant trois jours. C’était la dernière bonne chose. »)',
  },
  doc_miramas_vieux: {
    titre: 'Sur la porte Notre-Dame', style: 'manuscrit', lieu: 'miramas_le_vieux',
    texte: '(Peint en blanc sur une tôle, au pied de la porte du village perché.)\n\nREFUGE DE MIRAMAS-LE-VIEUX\nMONTREZ VOS MAINS.\n\nApprochez de jour, sans courir, les mains vides et levées.\nOn ne fait pas entrer les personnes mordues. On ne les chasse pas non plus : on leur descendra de l’eau.\nSi personne ne répond, attendez. Quelqu’un vous regarde.\n\n(Plus bas, d’une petite écriture droite, au feutre : « Si vous lisez ceci et que la porte est ouverte, ne montez pas. »)',
  },
  doc_pelissanne: {
    titre: 'Mot du boulanger', style: 'manuscrit', lieu: 'pelissanne',
    texte: 'FERMÉ.\n\nJ’ai fait une dernière fournée le 3 au matin. Il reste du pain dans la réserve, mais il est devenu dur comme du bois : trempez-le.\n\nJe pars chez ma fille, à Pertuis. Si le pont est fermé, je traverserai à la nage.\n\nLe levain est dans le frigo. Il est vivant, et il a quarante ans. Si quelqu’un sait s’en occuper, qu’il le garde en vie : c’est tout ce que je demande.',
  },
  doc_aurons: {
    titre: 'Registre de la mairie d’Aurons', style: 'manuscrit', lieu: 'aurons',
    texte: 'MAIRIE D’AURONS — REGISTRE DES DÉLIBÉRATIONS\nSéance extraordinaire du 4 septembre\nPrésents : tout le village (84 habitants)\n\nDélibération n° 1 : la route d’accès sera coupée par deux tracteurs et une moissonneuse. Adopté à l’unanimité.\nDélibération n° 2 : personne n’entre. Adopté (81 pour, 3 contre).\nDélibération n° 3 : personne ne sort. Adopté.\n\nSéance du 20 septembre\nPrésents : 71.\nDélibération n° 1 : les 13 absents sont excusés.',
  },
  doc_eyguieres: {
    titre: 'Carte postale', style: 'manuscrit', lieu: 'eyguieres',
    texte: '(Une carte postale des Alpilles, jamais postée.)\n\nChère Mamie,\nIci c’est super, il fait beau, on a fait la rando des Opies avec papa, on voit jusqu’à la mer. Demain on va au marché de Salon.\nGros bisous,\nEmma\n\n(Datée du 1er septembre.)',
  },
  doc_grans: {
    titre: 'Mot sur la porte du moulin', style: 'manuscrit', lieu: 'grans',
    texte: 'On a remis en marche la roue du vieux moulin, sur la Touloubre. Jour et nuit, elle fait un bruit de bois et d’eau, et les morts viennent l’écouter : ils se mettent en rang sur la berge et ils regardent tourner la roue.\n\nPendant ce temps-là, ils ne regardent pas nos fenêtres.\n\nSi vous êtes vivants et que vous avez des enfants, frappez trois coups à la petite porte, côté rivière. Il reste de la farine.\n\n— Édouard, meunier',
  },
  doc_lancon: {
    titre: 'Ticket de péage', style: 'imprime', lieu: 'lancon',
    texte: 'AUTOROUTE A7 — BARRIÈRE DE LANÇON\nEntrée : SALON-NORD\nDate : 02/09/2026 — 11:48\nClasse : 1\n\n(Le ticket est coincé dans un pare-soleil. Dans la file, sur sept voies, trois kilomètres de voitures attendent, portières ouvertes. Au dos, quelqu’un a écrit au stylo bille : « On n’a pas pu payer. La barrière ne s’est jamais levée. »)',
  },
  doc_cornillon: {
    titre: 'Carnet d’un guetteur', style: 'carnet', lieu: 'cornillon',
    texte: 'Du haut de Cornillon, on voit tout : l’étang, la Crau, Istres, Miramas, et la fumée de Salon.\n\n10/09 — Le haut-parleur de la gare de triage s’est mis à parler tout seul. Quand le vent vient de l’ouest, on l’entend d’ici. Les morts de la Crau marchent vers lui.\n\n16/09 — Les sirènes sur Miramas, toute la nuit, et des drones en file au-dessus de la plaine. Les morts courent.\n\n20/09 — Aux jumelles, il y en a des milliers entre les trains. On dirait un champ de blé noir.\n\n22/09 — À la radio, une voix de jeune fille : le Refuge de Miramas-le-Vieux accueille les survivants. J’ai failli y aller. Je suis trop vieux pour la route de Saint-Chamas.\n\n23/09 — Sur une voie de garage, à l’écart, il y a des wagons blancs que je n’avais jamais remarqués. Personne ne s’en approche, même pas les morts.',
  },

  // ═══════════════ TRACES SUR LES MURS (marcher sans carte : js/data/troncons.js, TRACES) ═══════════════
  doc_trace_emperi: {
    titre: 'Une inscription au pied du Puech', style: 'manuscrit', lieu: 'emperi',
    texte: 'Quelqu’un a écrit à la bombe rouge, sur le mur d’une maison, au pied de la montée du Puech : « CHÂTEAU → ON VOUS OUVRE SI VOUS N’ÊTES PAS MORDUS. MONTREZ VOS BRAS À LA PORTE. »\n\nEn dessous, une autre main a ajouté au marqueur : « Ils ont refusé ma sœur pour une griffure de chat. »\n\nEt plus bas encore, à la craie, en lettres qui penchent : « N’y montez pas après la tombée de la nuit, parce qu’ils lancent des pierres sur tout ce qui bouge. »',
  },
  doc_trace_horloge: {
    titre: 'Une inscription sur un rideau de fer', style: 'manuscrit', lieu: 'tour_horloge',
    texte: 'Sur le rideau de fer d’une boutique, quelqu’un a écrit à la craie, en grosses lettres : « LA RADIO : MIRAMAS-LE-VIEUX ACCUEILLE LES SURVIVANTS. PAR LA ROUTE DE SAINT-CHAMAS. MONTREZ VOS MAINS. »\n\nEn dessous, une autre personne a ajouté, plus petit : « Trente kilomètres à pied avec des morts partout. Bonne chance. »',
  },
  doc_trace_gare: {
    titre: 'Un mot sur le panneau des horaires', style: 'manuscrit', lieu: 'gare',
    texte: 'Sur le panneau des horaires de la gare, entre les trains annulés, quelqu’un a écrit au feutre noir :\n\n« Il n’y a plus de train depuis le 4. L’armée a coupé la voie à Lamanon. Ne suivez pas les rails vers le nord, parce qu’ils mènent tout droit à la Durance, et là-bas les soldats tirent sur tout ce qui approche du pont, vivant ou pas. — Kevin, cheminot »',
  },
  doc_trace_hopital: {
    titre: 'Un drap tendu devant les urgences', style: 'manuscrit', lieu: 'hopital',
    texte: 'Quelqu’un a tendu un drap entre deux lampadaires, devant l’entrée des urgences, et l’a peint en lettres noires : « IL N’Y A PLUS DE MÉDECINS NI DE MÉDICAMENTS. L’ARMÉE A TOUT EMPORTÉ LE 12. »\n\nTout en bas, au feutre, une petite écriture serrée a ajouté : « Je suis resté jusqu’au 14 avec ceux qu’ils n’ont pas pris. Je pars pour Istres, chez ma sœur. Si vous êtes blessé, lavez la plaie à l’eau bouillie et couvrez-la. Pour les morsures, je suis désolé. — Bastien, infirmier de nuit »',
  },
  doc_trace_route: {
    titre: 'Un panneau routier repeint', style: 'manuscrit', lieu: 'pelissanne',
    texte: 'Sous le panneau de Pélissanne, quelqu’un a cloué une planche et y a peint en blanc :\n\n« Le 16 au soir, les sirènes ont hurlé sur Miramas, et des drones sont passés très haut au-dessus de nous, avec des haut-parleurs. Tous les morts du village sont partis vers l’ouest en courant. Nous, nous partons vers l’est, vers Lambesc, tant que la route est vide. — La famille Roux »',
  },
};
