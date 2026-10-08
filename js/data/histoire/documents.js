// ============ DOCUMENTS TROUVABLES (REFONTE §4.8) ============
// { titre, style: 'manuscrit'|'tape'|'imprime'|'sms'|'carnet', texte, lieu?, marqueur? }
// Avec `marqueur` : posé par le concepteur de niveau à cet endroit (voir docs/NIVEAUX_BESOINS.md).
// Sans `marqueur` mais avec `lieu` : à placer librement dans le niveau du lieu (bureau, table, mur, cadavre).
// Sans `lieu` : donné par une scène (effet `document`).
// Les documents manuscrits sont des objets du monde : ils ne s'accordent pas au genre du joueur.

export const DOCUMENTS = {

  // ═══════════════ PROLOGUE ═══════════════
  doc_etiquette: {
    titre: 'Étiquette d’identification — lot 14', style: 'imprime', lieu: 'cimetiere',
    texte: 'CELLULE MORTUAIRE PROVISOIRE — SAINT-ROCH\nZONE D’EXCLUSION SANITAIRE 13\n\nNOM / PRÉNOM : (ton nom, au feutre, en capitales)\nN° : 14-0371\nPROVENANCE : CENTRE HOSPITALIER DU PAYS SALONAIS — URGENCES\nDÉCÈS CONSTATÉ LE : 06/09\nCAUSE : MORSURE\nCONSTAT : à l’œil nu (pas de pouls au poignet, pupilles sans réaction)\nDESTINATION : LOT 14 — INCINÉRATION\n\nNe pas ouvrir la housse. Ne pas toucher sans gants.',
  },
  doc_mot_maud: {
    titre: 'Un mot plié en quatre', style: 'manuscrit', lieu: 'cimetiere',
    texte: 'Si tu lis ce mot, c’est que tu t’es réveillé. Ou réveillée : je l’ai écrit trois fois, pour trois personnes, et je n’ai plus la force de faire les accords.\n\nTu n’es pas en train de devenir fou, ni folle. Tu étais mort, et tu ne l’es plus. Je sais pourquoi, et je suis sans doute la seule à le savoir.\n\nNe bois pas l’eau des caniveaux, et ne reste pas dans le noir. Surtout, ne t’approche pas des morts : ils ne font plus la différence entre eux et toi, et au début, toi non plus.\n\nViens me retrouver à la Tour de l’Horloge, sur la place Crousillat. Allume une lumière au pied de la tour et lève-la vers les cloches : je guette tous les soirs.\n\nEt quoi que tu entendes ensuite, ne cours pas vers le bruit.\n\n— M.\n\n(Brûle ce papier.)',
  },
  doc_registre_saint_roch: {
    titre: 'Registre de la morgue provisoire — Saint-Roch', style: 'tape', lieu: 'cimetiere', marqueur: 'conteneur_frigo',
    texte: 'MORGUE PROVISOIRE SAINT-ROCH — 2e RÉGIMENT MÉDICAL / DÉTACHEMENT NRBC (DÉCONTAMINATION)\n\nLOT 11 — 198 corps — incinéré le 12/09 (site : carrière de la Crau)\nLOT 12 — 204 corps — incinéré le 13/09\nLOT 13 — 187 corps — incinéré le 14/09\nLOT 14 — 212 corps — EN ATTENTE D’INCINÉRATION — stockés dans les conteneurs A et B et dans des chapelles familiales (voir plan)\n\nGroupe électrogène des conteneurs frigorifiques : plein fait le 13/09 — autonomie 96 h\nPASSAGE DU 16/09 : ANNULÉ (convoi bloqué, rond-point de l’Anjou)\n\nEn bas de la page, quelqu’un a ajouté au stylo :\n« Mettre des corps dans les chapelles, ce n’est pas réglementaire, je sais. Mais les conteneurs sont pleins et il fait 34 degrés. Pardon aux familles. — Sgt B. »',
  },
  doc_consignes_ramassage: {
    titre: 'Fiche réflexe — équipes de ramassage', style: 'imprime', lieu: 'cimetiere', marqueur: 'soldat_nrbc',
    texte: 'FICHE RÉFLEXE N° 4 — RAMASSAGE DES CORPS EN ZONE D’EXCLUSION\n\n1. Tenue de protection NRBC complète (combinaison, masque, gants). Aucune exception.\n2. Travailler à deux. Le second tient l’arme.\n3. CORPS PRÉSENTANT UNE ACTIVITÉ (mouvement, son, ouverture des yeux) : TIR DANS LA TÊTE, puis mise en housse.\n4. CORPS INERTES : MISE EN HOUSSE DIRECTE. Ne pas gaspiller de munitions.\n5. Effets personnels : dans un sachet scellé, agrafé à la housse.\n6. Ne pas parler aux corps.\n\n(Quelqu’un a ajouté au feutre, en dessous : « Même quand ce sont eux qui vous parlent. SURTOUT quand ils vous parlent. »)',
  },
  doc_cahier_gardien: {
    titre: 'Le cahier du gardien', style: 'manuscrit', lieu: 'cimetiere', marqueur: 'loge_gardien',
    texte: '3 septembre. Les enterrements de la semaine sont reportés « jusqu’à nouvel ordre », d’après la mairie. Mme Isnard est quand même venue fleurir la tombe de son mari, et je l’ai laissée faire.\n\n10 septembre. Les militaires sont arrivés avec deux camions frigorifiques et m’ont annoncé que le cimetière était « réquisitionné ». Quand j’ai demandé pour combien de temps, ils ont ri.\n\n13 septembre. Il n’y a plus de place dans les camions, alors ils ont ouvert les chapelles des familles : les Roux-Bérenger, les Estève, les Isnard, les Castellan. Je leur ai donné les clés. Qu’est-ce que je pouvais faire d’autre ?\n\n14 septembre. C’est maintenant le sergent qui garde la clé de la grille : il ferme lui-même le soir et rouvre le matin. Il m’a demandé s’il existait un double, et je lui ai répondu que non. Je ne sais pas pourquoi j’ai menti. Je n’aime pas qu’on m’enferme, voilà tout.\n\n16 septembre. Ils ne sont pas revenus. La grille est fermée, et je suis enfermé dedans, avec eux. Heureusement que j’ai gardé le double. Le groupe électrogène s’est arrêté cette nuit, les frigos ne tournent plus, et ça commence à sentir.\n\n19 septembre. J’ai soif, mais je ne bois plus l’eau du robinet : elle a un drôle de goût.\n\n20 septembre. Tous les soirs, à la même heure, des cloches sonnent en ville. Je pourrais prendre le double et y aller, mais pour quoi faire ? Il n’y a plus personne chez nous.\n\n21 septembre. Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas.',
  },
  doc_plan_salon: {
    titre: 'Plan de Salon-de-Provence, annoté par le gardien', style: 'imprime', lieu: 'cimetiere',
    texte: 'SALON-DE-PROVENCE — PLAN DU CENTRE HISTORIQUE\nOffice de tourisme — « Salon, la ville de Nostradamus »\n\n1. Château de l’Empéri — musée d’art et d’histoire militaires\n2. Tour de l’Horloge — XVIIe siècle\n3. Fontaine Moussue — place Crousillat\n4. Maison de Nostradamus — musée\n5. Collégiale Saint-Laurent — tombeau de Nostradamus\n6. Église Saint-Michel\n7. Hôtel de Ville\n\nPar-dessus, le gardien a écrit au stylo bille bleu.\n\nTout en bas, sur le cimetière Saint-Roch, il a fait une croix avec le mot « ICI ».\n\nAutour de la Tour de l’Horloge, il a tracé un cercle repassé plusieurs fois : « Les cloches sonnent tous les soirs, à la même heure, et les morts y vont. Mais qui les fait sonner ? »\n\nSur la pharmacie du cours Carnot : « Pillée. »\n\nSur la supérette de la rue Kennedy : « Il y avait encore du pain le 8. »\n\nDans la marge de droite, une flèche sort du plan : « L’hôpital. L’armée l’a vidé, ne pas y aller. »\n\nDans la marge du bas : « L’armée a un barrage au rond-point de l’Anjou, et elle tire sur ceux qui approchent. »\n\nEnfin, dans une petite rue derrière la collégiale Saint-Laurent, il a entouré deux mots : « Chez nous. » Le stylo est passé tant de fois dessus qu’il a troué le papier.',
  },
  doc_plaque_1909: {
    titre: 'Plaque de la salle de l’horloge', style: 'imprime', lieu: 'tour_horloge', marqueur: 'mecanisme_horloge',
    texte: 'LA TOUR DE L’HORLOGE\n\nÉdifiée de 1626 à 1630 à l’emplacement de la porte Farreiroux, achevée en 1664. Le campanile en fer forgé est l’œuvre du serrurier salonais Joseph Rolland ; l’horloge à phases de lune, celle des frères Quintrand. Trois cloches : 2 563 kilogrammes de bronze.\n\nLe 11 juin 1909, à 21 h 10, un séisme d’une violence inouïe frappe la Provence. À Salon, les cheminées s’effondrent, les façades se lézardent, l’horloge s’arrête. Réparée en 1912, elle est classée Monument historique la même année.\n\n(En dessous, quelqu’un a ajouté au feutre noir, d’une écriture serrée et penchée : « ET LE 2 SEPTEMBRE 2026, À 21 H 10, ELLE S’EST ARRÊTÉE TOUTE SEULE. »)',
  },
  doc_carnet_maud_tour: {
    titre: 'Carnet de Maud — la tour', style: 'carnet', lieu: 'tour_horloge', marqueur: 'carnet_tour',
    texte: '15 septembre, treize jours après le Mercredi. Je me suis installée dans la tour, et j’ai sonné les cloches à 21 h 10. Tous les morts du quartier sont venus sur la place, mais aucun de mes patients.\n\n17 septembre. J’ai sonné, et rien. J’ai mal au dos, et je n’ai plus de blondes : je suis passée aux brunes de la supérette.\n\n19 septembre. J’ai sonné. Un chien est venu, il s’est assis et il a écouté jusqu’au bout.\n\n20 septembre. P3 et P4, mes deux derniers patients endormis, ont été emportés au cimetière après neuf et dix jours de dormance. Si mes courbes sont justes, ils devraient se réveiller entre le 21 et le 24. Si mes courbes sont justes.\n\n21 septembre. J’ai sonné, et toujours rien.\n\n22 septembre. J’ai encore sonné, pour rien. Je vais finir par sonner pour moi.',
  },

  // ═══════════════ CHAPITRE 1 — Nostradamus ═══════════════
  doc_cartel_peste: {
    titre: 'Cartel du musée — « Nostradamus et la peste »', style: 'imprime', lieu: 'nostradamus', marqueur: 'cartel_peste',
    texte: 'NOSTRADAMUS ET LA PESTE\n\nEn 1546, la peste ravage Aix-en-Provence. Michel de Nostredame, médecin, y est appelé. Il fait assainir les rues, brûler le linge des malades et distribue des « pilules de roses » — pétales de roses rouges cueillis avant l’aube, sciure de cyprès, girofle, ambre gris — que l’on garde sous la langue.\n\nL’efficacité de ces pilules est douteuse. Sa présence, elle, ne l’est pas : quand les notables fuyaient la ville, il est resté.\n\nL’année suivante, il s’installe à Salon, dans cette maison, où il écrira les Prophéties.\n\n(Au crayon, dans la marge, de l’écriture de Maud : « Il est resté. C’est tout ce qu’on retient de lui. »)',
  },
  doc_fiche_p5: {
    titre: 'Feuille de soins scotchée au pilier', style: 'manuscrit', lieu: 'nostradamus', marqueur: 'cave_patiente',
    texte: 'P5 — Mireille A., 44 ans, pharmacienne sur le cours Carnot.\nMordue le 09/09 à la main droite, par une cliente, au comptoir. Transformée en moins de 8 heures.\nCapturée à la perche le 10/09, dans sa pharmacie.\nNourrie le 12/09 à 22 h 40. Donneur : S. B., 17 ans (fracture du crâne, aucune chance de survie), mangé en entier.\nEn dormance depuis le 13/09.\n\nTempérature : 22,1 °C le 13/09, 23,0 le 15/09, 23,8 le 17/09, 24,6 le 19/09, 25,9 le 21/09.\nPouls : un battement par minute, puis deux, puis quatre.\n\nÀ noter : elle a une fille, Inès, 7 ans, gardée chez sa grand-mère à Pélissanne. Si elle se réveille lucide, NE PAS lui promettre qu’on retrouvera sa fille.',
  },
  doc_scanner_maud: {
    titre: 'Carnet d’écoute — fréquences militaires', style: 'carnet', lieu: 'nostradamus', marqueur: 'scanner_maud',
    texte: '14 septembre, 23 h 02. J’ai capté : « …confirmation Cautère, phase deux, déclenchement conditionné… », puis ça a coupé. Cautère, c’est donc le nom de leur opération.\n\n16 septembre, 4 h 40. Un opérateur fatigué a parlé en clair : « …ligne Durance, mise à feu au premier épisode de mistral supérieur à six-zéro… » Six-zéro, ça veut dire 60 km/h. Ils mettront le feu au premier coup de mistral, pour que le vent pousse les flammes sur nous. Quelqu’un lui a dit de passer sur la fréquence cryptée, et il a répondu : « Ça change quoi ? Ils sont tous morts, en face. »\n\n19 septembre, 22 h. La météo militaire, en clair, annonce un « anticyclone persistant, vent faible, pas de mistral prévu avant J plus dix ».\n\nJ plus dix : nous avons donc dix jours.\n\n21 septembre. J’ai réécouté l’enregistrement du 16. « Ils sont tous morts, en face. » Non, mon garçon, pas tous.',
  },

  // ═══════════════ CHAPITRE 1 — Empéri ═══════════════
  doc_journal_vidal: {
    titre: 'Registre du château — J. Vidal', style: 'manuscrit', lieu: 'emperi', marqueur: 'journal_vidal',
    texte: 'Mercredi 2. Le proviseur a ordonné l’évacuation du lycée à 11 h 20, mais les bus ne sont jamais venus. J’ai fait monter ma classe au château, pour les murs, la hauteur et la porte unique. Nous sommes 27 élèves et 4 collègues.\n\nJeudi 3. Les parents ne viennent pas, et les téléphones ne passent plus. Mehdi a trouvé une réserve d’eau dans les citernes du musée.\n\nSamedi 5. Deux élèves sont partis rejoindre leurs familles, et ils ne sont pas revenus.\n\nDimanche 6. La foule des morts est arrivée par la montée du Puech. J’ai fait entrer tous ceux que je pouvais, puis j’ai fermé la grille. Il restait quelqu’un dehors, juste devant, avec un sac rouge. Je ne sais pas son nom, et je ne veux pas le savoir.\n\nJeudi 10. Lou et Samir ont ramené un homme de Lamanon, la jambe cassée, qu’ils ont trouvé dans une cave de la rue Carnot. Il s’appelle Luc et il raconte des blagues. On l’a porté à l’hôpital, chez la docteure Sérane.\n\nSamedi 12. Samir est tombé du rempart, avec une fracture du crâne, et on l’a porté chez la docteure. Elle dit qu’il est mort sur la table, et Luc aussi, avant-hier. Elle dit qu’elle a tout essayé.\n\nLundi 21. Je fais cours tous les matins : tant qu’il y a un cours, il y a un lendemain.',
  },
  doc_regles_emperi: {
    titre: 'Règles du château', style: 'manuscrit', lieu: 'emperi', marqueur: 'panneau_regles',
    texte: 'RÈGLES DU CHÂTEAU (écrites au marqueur au dos d’une affiche du musée)\n\n1. À la porte, tout le monde montre ses bras pour prouver qu’il n’est pas mordu. Même moi.\n2. Personne ne sort seul.\n3. On ne boit pas l’eau de la fontaine sans l’avoir fait bouillir.\n4. On ne pleure pas devant les petits. On pleure la nuit.\n5. Si on est mordu, on le dit tout de suite. Personne ne vous en voudra.\n6. Cours tous les matins à 9 h, présence obligatoire.\n7. Les sabres du musée sont à tout le monde et à personne.\n\n(En dessous, quelqu’un a ajouté d’une écriture ronde : « 8. Nathan ne touche plus aux sabres. »)',
  },
  doc_carnet_lou: {
    titre: 'Le carnet à dessin de Lou', style: 'carnet', lieu: 'emperi',
    texte: '[Sur une double page, six dessins au stylo bille, avec une date dans le coin de chacun.]\n\n6/9 — Un mort au pied de la porte, en bas de la montée, avec un sac à dos rouge à la bretelle cassée, le visage levé vers la grille. En légende : « Il s’est relevé à 18 h. »\n\n7/9 — Le même. « Il est revenu à 17 h pile. Nathan l’appelle le Client. »\n\n7/9 — Le même, de profil. « Il n’a plus de chaussure au pied gauche. »\n\n7/9 — Le même, assis. « Maintenant, il s’assoit, comme s’il attendait qu’on lui ouvre. »\n\n8/9 — Le même, de dos. « Je crois qu’il était encore vivant quand Vidal a fermé la grille. Je crois que c’est le type qui est resté dehors. Je ne le dirai à personne. »\n\n8/9 — Une ambulance, et une femme avec une perche. Le mort au sac rouge la suit, un câble autour du cou. « Elle l’a emmené comme un chien. Elle lui parlait doucement. »',
  },
  doc_sms_telephone: {
    titre: 'Ton téléphone — messages', style: 'sms', lieu: 'emperi',
    texte: 'DOMAINE DES TROIS CYPRÈS (29/08) : Bonjour, c’est confirmé pour les vendanges à partir du jeudi 3/09, rdv 7 h à la cave du domaine, prévoir gants, casquette, eau. Hébergement à voir sur place. Bonne route !\n\nMAMAN (30/08) : Bien {arrivé|arrivée} ? Envoie une photo de ta chambre. Et mange.\n\nMAMAN (02/09, 12:14) : Tu es où ??? Ils parlent de Salon à la télé\nMAMAN (02/09, 12:15) : Réponds\nMAMAN (02/09, 12:31) : Appelle-moi\nDOMAINE DES TROIS CYPRÈS (02/09, 14:02) : Vendanges annulées. Restez chez vous. Désolés.\nMAMAN (02/09, 19:40) : Le téléphone sonne dans le vide. Je t’aime. Rappelle.\nALERTE GOUVERNEMENTALE (03/09) : CONFINEMENT STRICT — BOUCHES-DU-RHÔNE OUEST\nMAMAN (04/09, 03:12) : Je n’arrive pas à dormir. Dis-moi juste un mot. Un seul.\nMAMAN (06/09, 17:40) : Ils disent qu’il faut aller dans les lieux fermés, les écoles, les châteaux\nMAMAN (06/09, 23:58) : Je t’aime. N’importe quand. Même la nuit.\nALERTE GOUVERNEMENTALE (07/09) : ZONE D’EXCLUSION SANITAIRE — RESTEZ CONFINÉS — NE CHERCHEZ PAS À REJOINDRE LA DURANCE\nMAMAN (12/09) : Je t’écris quand même.\nMAMAN (19/09) : Je t’écris quand même.',
  },
  doc_video_6_septembre: {
    titre: 'Vidéo — 6 septembre, 17 h 52 (41 s)', style: 'tape', lieu: 'emperi',
    texte: '00:00 — L’image tremble : tu cours, en respirant fort. On entend ta voix : « Attendez ! Attendez ! »\n00:06 — On voit la montée du Puech filmée d’en bas. En haut, la porte du château est à moitié fermée par une grille, et des adolescents entrent en courant.\n00:11 — Un homme en pull bleu, Vidal, le professeur, les compte à voix haute : « Seize… dix-sept… dix-huit. »\n00:17 — Ta main entre dans l’image, tendue vers la grille.\n00:19 — L’homme se retourne et te regarde pendant une seconde.\n00:20 — Sa main s’abat sur ta poitrine et te repousse. L’image bascule : le ciel, les murs, les pavés.\n00:22 — On entend la grille claquer.\n00:23 — Ta voix crie : « Monsieur ! »\n00:25 — Quelqu’un grogne derrière toi, et l’image se remplit de mains.\n00:31 — On ne voit plus que le ciel bleu : le téléphone est tombé, l’écran vers le haut.\n00:31 à 00:41 — Toujours le ciel bleu, et le bruit de quelqu’un qu’on dévore. C’est toi.',
  },
  doc_cartel_sabre: {
    titre: 'Cartel — sabre de cavalerie légère', style: 'imprime', lieu: 'emperi', marqueur: 'vitrine_sabres',
    texte: 'SABRE DE CAVALERIE LÉGÈRE, MODÈLE AN XI\nManufacture de Klingenthal, vers 1810. Lame courbe à un tranchant, garde à trois branches.\nArme des hussards et chasseurs à cheval de la Grande Armée, conçue pour frapper du tranchant au galop, pendant les charges.\n\nMusée de l’Empéri — collection Raoul et Jean Brunon.\n\n(Il manque cinq sabres dans la vitrine, et le dernier a la lame ébréchée. Quelqu’un a scotché un mot sur la vitre : « EMPRUNTÉS. RENDUS QUAND CE SERA FINI. — M. VIDAL »)',
  },

  // ═══════════════ CHAPITRE 1 — Saint-Laurent ═══════════════
  doc_tombeau: {
    titre: 'Plaque de la chapelle de la Vierge', style: 'imprime', lieu: 'saint_laurent', marqueur: 'tombeau_nostradamus',
    texte: 'Ici reposent les restes de Michel NOSTRADAMUS (1503-1566), médecin et astrologue, auteur des Prophéties.\n\nD’abord inhumé dans l’église des Cordeliers, son tombeau fut profané en 1791 par des gardes nationaux. Ses ossements furent transférés en cette collégiale la même année.\n\nLa tradition rapporte que l’un des profanateurs but du vin dans son crâne, et qu’il fut tué le lendemain.\n\n(En dessous, Nathan a écrit au feutre : « La légende dit que celui qui ouvre le tombeau meurt dans l’année. J’ai vérifié, c’est faux : je ne l’ai pas ouvert, et je vais mourir quand même. N. »)',
  },
  doc_telephone_nathan: {
    titre: 'Le téléphone de Nathan', style: 'sms', lieu: 'saint_laurent', marqueur: 'sac_nathan',
    texte: 'NATHAN → MAMAN (22/09, 07:02) : on va a st laurent avec lou chercher des cierges. vidal a dit ok. je t’aime\nNATHAN → MAMAN (22/09, 09:48) : y a plein de monde dans l’eglise mais ils bougent pas. le curé agite une clochette. c’est ouf\nNATHAN → MAMAN (22/09, 10:15) : le curé m’a mordu\nNATHAN → MAMAN (22/09, 10:16) : c’est pas grave\nNATHAN → MAMAN (22/09, 10:31) : lou va m’enfermer dans la chapelle de nostradamus. c’est moi qui lui ai demandé. elle pleure\nNATHAN → MAMAN (22/09, 11:02) : j’ai froid\nNATHAN → MAMAN (22/09, 11:40) : dis a papa que j’ai pas eu peur. c’est faux mais dis-lui\n(Aucun message n’a été distribué.)',
  },
  doc_annonce_paroisse: {
    titre: 'Feuille paroissiale', style: 'imprime', lieu: 'saint_laurent', marqueur: 'presentoir',
    texte: 'PAROISSE SAINT-LAURENT — SAINT-MICHEL — SALON-DE-PROVENCE\n\nDIMANCHE 6 SEPTEMBRE — 18 H\nMESSE POUR LES VICTIMES DU 2 SEPTEMBRE ET POUR LEURS FAMILLES\n\nLa collégiale restera ouverte jour et nuit à tous ceux qui cherchent un abri.\nApportez ce que vous pouvez : eau, couvertures, bougies.\n« Venez à moi, vous tous qui peinez » (Mt 11, 28)\n\nLe père Antoine assurera une présence permanente.',
  },

  // ═══════════════ CHAPITRE 1 — Hôpital ═══════════════
  doc_registre_protocole: {
    titre: 'PROTOCOLE — M. S.', style: 'carnet', lieu: 'hopital',
    texte: 'INDEX DES DONNEURS (p. 1)\nFaure R., 81 ans — p. 3 (accidentel)\nDelpech G., 59 ans — p. 9\nInconnu X, 34 ans (polytraumatisé) — p. 11\nArnaud L., 51 ans — p. 14\nS. B., 17 ans — p. 17\n\np. 2 — Du 2 au 4 septembre, 300 morsures. Entre la morsure et l’arrêt du cœur, il se passe de 3 à 30 heures, et entre l’arrêt du cœur et le moment où ils se relèvent, moins d’une heure. Ce ne sont pas des morts : leur cœur bat 2 à 4 fois par minute, leur corps est à la température de la pièce, et leur cerveau garde une activité minimale. Ce sont des patients.\n\np. 3 — 03/09. P1 (patient n° 1, box 6) s’échappe, mord Karim B., le brancardier, puis dévore presque entièrement M. Faure (box 7, 81 ans, hospitalisé pour un AVC). Ensuite, P1 se calme, se couche, et ne bouge plus. Pouls : 1 par minute.\n\np. 5 — 07/09. Quatre jours plus tard, P1 se réveille. Il demande de l’eau, il donne son nom, son adresse et le nom de son chat. NOURRI. NOURRI. NOURRI.\n\np. 6 — Hypothèse à confirmer : l’agent se sature. Il faut un adulte entier, mangé dans les 48 heures qui suivent la transformation. Avec moins, le retour est peut-être partiel, et au-delà de 48 heures, il n’y a sans doute plus d’effet. Le patient s’endort alors comme un mort : c’est la dormance. Elle a duré 4 jours pour P1, dans un box à 30 degrés, et elle sera sans doute plus longue au froid de la morgue (10 à 14 jours ?). Ensuite vient le réveil. Un vivant mangé, un mort qui revient : un pour un.\n\np. 7 — P1 s’est jeté du toit. Il a laissé un mot : « Je me souviens du goût. »\n\np. 9 — P2, nourri avec G. D. (hémorragie interne impossible à arrêter). Réveil au bout de 12 jours, mais c’est un RATÉ : il est resté lucide 4 minutes, puis il a rechuté. Abattu.\n\np. 11 — P3 (Patrick Veyrier), nourri avec un inconnu de 34 ans. En dormance. Emporté par l’armée avec les corps du 12, avec un mot dans sa poche.\n\np. 13 — P4 (voir l’étiquette). Mordu à l’avant-bras gauche le 06/09, {capturé|capturée} à la perche le 08/09 dans la montée du Puech et gardé en salle 4. Nourri le 11/09 à 3 h 10. Donneur : voir p. 14. En dormance depuis le 11/09. Emporté avec les corps du 12, avec un mot dans sa poche.\n\n[La page 14 a été arrachée. Il ne reste qu’une bande de papier dans la reliure.]\n\np. 17 — P5 (Mireille A.), nourrie le 12/09 avec S. B., 17 ans, fracture du crâne après une chute du rempart de l’Empéri. Je l’ai emmenée avec moi, dans la cave de la rue Nostradamus.\n\np. 18 — Bilan : un réveil lucide (P1, qui s’est suicidé), un raté (P2), et trois en attente. Peut-être deux réveils réussis sur trois. Si c’est vrai, il y a entre la Durance et la mer quatre cent mille personnes qu’on peut ramener, chacune au prix d’une autre vie. Je ne sais pas si c’est une bonne nouvelle. C’est une nouvelle.',
  },
  doc_dossier_p4: {
    titre: 'Dossier des urgences — P4', style: 'imprime', lieu: 'hopital', marqueur: 'dossiers_urgences',
    texte: 'CENTRE HOSPITALIER DU PAYS SALONAIS — SERVICE DES URGENCES — DOSSIER PATIENT\n\nIdentité : (ton nom)\nÂge : (ton âge)\nAdresse : non renseignée (saisonnier — vendanges)\nAdmission : 08/09, 17 h 40, {amené|amenée} par le Dr Sérane (véhicule SAMU)\nMotif : {patient transformé|patiente transformée} depuis environ 48 h. Morsure à l’avant-bras gauche datée du 06/09.\n{Attaché|Attachée} en salle 4.\n\n11/09 : voir le registre « Protocole ».\n12/09 : évacuation par l’armée. Décès constaté à l’œil nu par l’équipe de décontamination (NRBC). Envoyé au cimetière avec le lot 14.\n\n(Maud a ajouté au stylo : « Pas {mort|morte}, seulement {endormi|endormie}. Je le prouverai. »)',
  },
  doc_dossier_luc: {
    titre: 'Dossier des urgences — ARNAUD Luc', style: 'imprime', lieu: 'hopital', marqueur: 'dossiers_urgences',
    texte: 'CENTRE HOSPITALIER DU PAYS SALONAIS — SERVICE DES URGENCES — DOSSIER PATIENT\n\nIdentité : ARNAUD Luc, 51 ans. Électricien. Lamanon.\nAdmission : 10/09, 19 h 15. Amené par deux élèves (Empéri).\nMotif : fracture ouverte du tibia droit (chute dans une cave, rue Carnot, 08/09). Plaie sale.\nÉtat : conscient, lucide, souffre beaucoup. Pas de morsure. Fièvre : 38,2 °C.\nTraitement : os remis en place, attelle. Antibiotiques : amoxicilline (boîte personnelle du patient, dans son blouson).\nPronostic : réservé. (Le mot « réservé » a été barré, et quelqu’un a écrit au-dessus, d’une autre encre : « nul ».)\n\nDécès : 11/09, 3 h 10. Cause : hémorragie.\nAffaires personnelles : dans son casier, « à rendre à la famille ».',
  },
  doc_lettre_luc: {
    titre: 'Pour Jo', style: 'manuscrit', lieu: 'hopital',
    texte: 'Ma Jo,\n\nJe t’écris depuis l’hôpital de Salon, mais ne t’inquiète pas. En me cachant, je suis tombé dans une cave comme un couillon, et ma jambe a pris cher. Deux gamins du château m’ont trouvé et m’ont porté sur une porte, tu imagines la tête du cortège. Ils sont bien, ces gamins.\n\nIci, il n’y a qu’une docteure, et elle fait tout. Elle dit que pour la jambe, ça va aller, et qu’il faut juste que j’attende un peu avant de remarcher. Elle a pris l’insuline de Clem pour la mettre au frais, et elle m’a promis qu’on me la rendrait.\n\nParce que l’insuline, je l’ai, Jo : quatre stylos. C’est la dame de la pharmacie du cours qui me les a donnés sans ordonnance, quand je lui ai montré la photo de Clem. Dis-le à Clem : papa a trouvé.\n\nJe rentre dès que je peux marcher, et si je ne peux pas marcher, je rentre quand même.\n\nDis aussi à Clem que je ne lui ai pas acheté de nougat parce que tout est fermé, mais que je lui en dois un gros.\n\nJe t’aime. Je sais que je ne le dis pas assez, alors voilà, c’est écrit : maintenant, tu ne pourras plus dire que je ne le dis jamais.\n\nTon Luc.',
  },
  doc_rapport_8_septembre: {
    titre: 'Rapport à la cellule de crise — brouillon', style: 'tape', lieu: 'hopital', marqueur: 'bureau_maud',
    texte: 'CH DU PAYS SALONAIS — SERVICE DES URGENCES\nÀ : Cellule interministérielle de crise, préfecture des Bouches-du-Rhône ; PC opérationnel « Durance »\nOBJET : Réversibilité de l’état qui suit la morsure — première observation\nDATE : 08/09\n\nMadame, Monsieur,\n\nJ’ai l’honneur de porter à votre connaissance l’observation suivante, dont je mesure le caractère extraordinaire.\n\nLe patient P1, transformé le 02/09, a ingéré le 03/09 la quasi-totalité d’un adulte. Il est alors entré dans un état d’inertie totale qui ressemble à la mort, et que j’appelle « dormance ». Le 07/09 au soir, il s’est réveillé lucide, orienté et capable de décliner son identité.\n\nJe demande en urgence : 1) la suspension de toute incinération de corps inertes ; 2) un appui matériel (chambres froides, moyens de contention) ; 3) l’envoi d’une équipe de l’Institut Pasteur.\n\nLes « morts » de la zone ne sont pas morts. Ce sont des patients, et ils peuvent revenir.\n\n(En bas, au stylo, une phrase raturée plusieurs fois : « Au prix d’un autre patient chacun. Ne pas l’écrire. L’écrire. Ne pas. » Puis, lisible : « Je l’écris. Ils ont le droit de savoir. »)\n\nDr M. Sérane, cheffe du service des urgences.',
  },
  doc_carnet_maud_p1: {
    titre: 'Carnet de Maud — P1', style: 'carnet', lieu: 'hopital', marqueur: 'bureau_maud',
    texte: 'P1, Guy F., 58 ans, disquaire rue de l’Horloge.\n\nEn se réveillant, il m’a demandé si j’avais un verre d’eau, puis si son chat avait mangé. Son chat s’appelle Mingus.\n\nAu début, il ne se souvenait de rien, et puis il s’est souvenu de tout. Ça a pris quarante minutes, et j’ai tout noté. Je n’aurais pas dû noter : j’aurais dû lui tenir la main.\n\nIl m’a dit : « Docteure, je connais le goût de M. Faure. »\n\nLe lendemain, il est monté sur le toit.\n\nJe ne sais pas si je l’ai sauvé. Je sais seulement qu’il s’est réveillé. Il faut que ça serve à quelque chose, sinon je ne sais pas ce que je fais là.',
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
    texte: 'CELLULE DE CRISE — HÔTEL DE VILLE — RÉUNION DU 03/09, 22 H\nPrésents : maire adjoint, directeur général des services, police municipale, pompiers, hôpital (Dr Sérane), gendarmerie, armée de terre (commandante Orsini).\n\n1. Le Dr Sérane signale 1 100 admissions en 36 h. Elle demande l’évacuation des malades hospitalisés. REFUSÉ (pas de véhicules).\n2. La commandante Orsini annonce le repli de l’armée derrière la Durance d’ici trois jours. Salon ne sera pas défendu.\n3. Le Dr Sérane demande que les corps ne soient pas incinérés « avant observation ». La commandante Orsini prend note.\n4. Le maire adjoint demande ce qu’il faut dire à la population. Pas de réponse.\n\nPROCHAINE RÉUNION : 04/09, 8 h.\n(Aucun autre relevé.)',
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
    titre: 'Ordonnance — ARNAUD Clémence', style: 'imprime', lieu: 'pharmacie_carnot',
    texte: 'Dr C. Roubaud — pédiatre — Salon-de-Provence\nPatiente : ARNAUD Clémence, 9 ans\nInsuline rapide : selon protocole\nInsuline lente : 12 unités au coucher\nRenouvelable 6 mois.\n\n(Au dos, la pharmacienne a écrit au stylo :)\n« 10/09. J’ai délivré 4 stylos à M. Arnaud, le père, sans l’ordonnance originale : il avait une photo de la petite et une tête de papa honnête. Je le note pour mémoire. Si quelqu’un contrôle un jour, qu’il vienne me chercher. — Mireille A. »',
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
    texte: '(Un livre de poche des Prophéties, ouvert et annoté au crayon par un survivant.)\n\n« Quand le grand vent viendra du septentrion… » — C’est peut-être un quatrain inventé : je ne le trouve pas dans l’index. Je l’ai peut-être rêvé.\n\n« Les morts seront vivants, les vivants mis à mort » — Je ne l’ai pas trouvé non plus, mais ça sonne juste.\n\nJ’ai relu tout le livre deux fois, et il n’a rien prévu. Personne ne prévoit jamais rien : on écrit des phrases assez floues pour que n’importe quelle catastrophe puisse s’y glisser.\n\nJ’ai quand même noté ça à la page 14 : « Un pour un, la bête mange son maître. » Ce n’est pas dans le livre, c’est moi qui l’ai écrit au crayon, sans savoir pourquoi. Je l’ai entendu crier dans la rue, par une femme qui portait une cloche.',
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
    texte: 'Sur le socle de la statue, des messages s’entassent :\n\n« CALÈS — PAR LES COLLINES — PAS LA ROUTE » (au goudron)\n« La famille Garcia est partie vers Lamanon le 9. Kevin, si tu lis ça, on t’attend. » (à la craie)\n« Le prof de l’Empéri est un héros » (au feutre)\n« NE SUIVEZ PAS LES CLOCHES » (au rouge à lèvres)\n« Jean, toi qui es tombé du ciel, dis-leur de venir nous chercher » (gravé au couteau dans le bronze)\n« 20/09 — Il y a des gens qui marchent DEVANT les morts, avec des cloches. Ils sont vivants, ou pas, je ne sais pas. » (à la craie)\n« UN POUR UN » (à la chaux, en énorme, par-dessus tout le reste)',
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

  // ═══════════════ CHAPITRE 2 — Calès, Vernègues, Mallemort, BA 701, Sénas ═══════════════
  doc_registre_cales: {
    titre: 'Registre de Calès', style: 'manuscrit', lieu: 'cales', marqueur: 'registre_cales',
    texte: 'GROTTES DE CALÈS — REGISTRE (tenu par Jo)\n\nHabitants : 43, dont 11 enfants.\nEau : citerne pleine aux deux tiers (on la remplit avec le canal de Craponne, en ouvrant la vanne).\nRations : un repas chaud et deux gobelets d’eau par jour.\n\n08/09 — Arrivée des Garcia, de Salon : 5 personnes.\n09/09 — On a refusé l’entrée à 7 personnes de Sénas, parce qu’il y avait deux mordus parmi eux. Ils sont repartis vers le nord. [Ajouté plus tard : Je n’aurais pas dû. Je ne sais pas. J’aurais dû.]\n10/09 — Luc est parti à Salon chercher l’insuline. Retour prévu le soir.\n11/09 — Luc n’est pas rentré.\n12/09 — Luc n’est pas rentré.\n(Et chaque jour, jusqu’au 22/09 : « Luc n’est pas rentré. »)\n23/09 — Arrivée des gens de l’Empéri : 19 enfants et adolescents, et 3 adultes.',
  },
  doc_bulletin_meteo: {
    titre: 'Bulletin — noté à la main', style: 'manuscrit', lieu: 'cales', marqueur: 'radio_cales',
    texte: '(Noté par Lou en écoutant une radio d’Avignon, de l’autre côté du fleuve.)\n\nMÉTÉO — Provence, vallée du Rhône\nFin du beau temps en milieu de semaine, avec une dégradation par le nord. Un épisode de mistral fort est attendu, avec des rafales de 80 à 100 km/h en basse vallée du Rhône et sur les Bouches-du-Rhône, pendant trois à six jours.\n\nAprès, il y a eu les infos : un festival reporté, un match de foot, le prix de l’essence. Le mot « zone » n’est passé qu’une fois, à la fin, entre la Bourse et la météo des plages.\n\nIls vivent, là-bas. Ils vivent comme si nous n’étions pas là.',
  },
  doc_carnet_berger: {
    titre: 'Carnet de comptes du berger', style: 'carnet', lieu: 'vernegues', marqueur: 'berger',
    texte: '(Un carnet de berger. En provençal, « l’avé », c’est le troupeau. Ici, le troupeau, ce sont les morts.)\n\nJe fais le compte, comme chaque soir, à la lampe.\n\n15/09 — Départ de la bergerie, avec la Rose en tête. Le troupeau compte 212 têtes.\n17/09 — Grans. 1 900 têtes, et un premier revenu à la vie : Nadège, de la base aérienne.\n19/09 — Miramas. 4 300 têtes, et 4 revenus.\n22/09 — Salon, la nuit des sonnailles. 11 200 têtes. On devait pâturer au château de l’Empéri, mais c’est raté : les petits se sont bien défendus.\n24/09 — 23 revenus, et 61 ratés gardés dans les caves.\n\nLa route : le vieux chemin des troupeaux par Lamanon, le passage entre les collines, la plaine de Sénas et les ponts de Mallemort. Puis les pâturages d’été : le Luberon, le Ventoux, et plus haut encore.\n\nMarius, mon fils, je les ramène tous, mais pas toi : toi, ils t’ont mis une balle dans la tête. Alors je les ramène tous, à ta place.',
  },
  doc_lettre_rose: {
    titre: 'Lettre à la famille Ruiz', style: 'manuscrit', lieu: 'vernegues', marqueur: 'rose',
    texte: 'Madame Ruiz,\n\nJe ne sais pas si vous êtes vivante, ni si vous voudrez me lire. Je vous écris quand même, et je garde la lettre, parce que je n’ai pas de timbre et qu’il n’y a plus de facteur.\n\nC’est moi qui ai mangé Kylian, le 3 septembre, sous le mûrier. Je n’étais plus moi-même, mais c’était mon corps, et c’était ma bouche.\n\nIl m’apportait des œufs, le saviez-vous ? Il me disait que vous faisiez les meilleures crêpes de la Crau.\n\nJe suis revenue, et tout le monde dit que c’est un miracle. Ce n’est pas un miracle, c’est un échange : on m’a rendue à mon mari en vous prenant votre fils.\n\nJe ne vous demande pas pardon, je n’en ai pas le droit. Je voulais seulement que vous sachiez qu’il n’est pas mort pour rien.\n\nC’est pire : il est mort pour moi.\n\nRose Castagne',
  },
  doc_credo_revenus: {
    titre: 'Sur le mur de l’église', style: 'manuscrit', lieu: 'vernegues', marqueur: 'mur_eglise',
    texte: '(Écrit à la chaux sur le mur de l’église en ruine de Vieux-Vernègues, en lettres hautes comme un homme.)\n\nUN POUR UN.\n\n(Plus bas et plus petit, d’autres mains ont ajouté :)\nNous étions morts, et nous sommes revenus.\nLe village est mort en 1909, et il est revenu.\nIls nous ont brûlés dans leur tête avant de nous brûler pour de bon.\nNous nous reconnaissons au froid.\nNous n’oublions pas qui nous a nourris.\n\n(Et dans un coin, quelqu’un a gravé au couteau : « Kylian Ruiz, 16 ans. » Personne n’a osé l’effacer.)',
  },
  doc_ordre_cautere: {
    titre: 'CAUTÈRE — ordre d’opération (extrait)', style: 'tape', lieu: 'ba701',
    texte: 'SECRET DÉFENSE — SPÉCIAL FRANCE\nÉTAT-MAJOR DES ARMÉES — CENTRE DE CONDUITE DES OPÉRATIONS\nORDRE D’OPÉRATION « CAUTÈRE »\nRÉF. : rapport du Dr M. Sérane (hôpital de Salon), 08/09 — note du ministère de la Santé, 11/09 — décision du Conseil de défense, 13/09\n\n1. SITUATION : zone d’exclusion sanitaire (ZES) au sud de la Durance. Population résiduelle non infectée estimée : < 2 000. Sujets infectés : > 400 000.\n2. MISSION : stériliser la ZES par le feu. Détruire l’ensemble des sujets, y compris INERTES.\n3. EXÉCUTION :\n   Phase 1 : tenue de la ligne Durance (PC Durance, Cdt Orsini). Aucun franchissement.\n   Phase 2 : au premier épisode de mistral ≥ 60 km/h, mise à feu le long de la Durance, le vent poussant le feu vers le sud, et largage de bombes incendiaires sur les rassemblements d’infectés (avions de la base aérienne 115, Orange).\n   Phase 3 : ratissage de la zone.\n4. POPULATION NON INFECTÉE : contrôle sanitaire au pont de Mallemort, à discrétion du commandant de secteur. Toute personne ayant été au contact d’un sujet « revenu » : cf. PROTOCOLE R.\n5. COMMUNICATION : « opération sanitaire d’ampleur exceptionnelle ». Aucune autre mention.',
  },
  doc_protocole_r: {
    titre: 'PROTOCOLE R', style: 'tape', lieu: 'ba701',
    texte: 'SECRET DÉFENSE — PROTOCOLE R (« REVENUS »)\n\nOBJET : conduite à tenir face aux sujets dits « revenus » et aux personnes informées.\n\n1. Il est établi (cf. rapport Sérane) qu’un sujet infecté ayant ingéré un adulte humain peut, après une phase d’inertie de 10 à 14 jours, retrouver sa conscience et sa mémoire.\n2. La divulgation de cette information hors de la ZES est de nature à provoquer : refus massif des familles de livrer les corps ; organisation de filières pour « nourrir » les infectés avec des vivants ; troubles graves à l’ordre public. Elle doit être empêchée PAR TOUS MOYENS.\n3. Les sujets « revenus » sont assimilés à des sujets infectés.\n4. Les personnes non infectées ayant connaissance de l’existence de sujets « revenus » seront isolées à l’issue du contrôle sanitaire. Durée : indéterminée.\n5. Le Dr M. Sérane doit être retrouvée et placée sous la garde du commandant de secteur.\n\n(Dans la marge, un officier a écrit au stylo : « Que Dieu nous pardonne. Moi, je ne me le pardonnerai pas. » La signature est illisible.)',
  },
  doc_lettre_pilote: {
    titre: 'Lettre d’Athos 6, pilote de la Patrouille', style: 'manuscrit', lieu: 'ba701', marqueur: 'hangar_paf',
    texte: 'Ma Zoé,\n\nPapa est toujours à la base, et on n’a toujours pas le droit de décoller. Les neuf avions sont au sol, en rang, comme pour le 14 Juillet. On les regarde, on les astique, on fait le plein, et tous les matins, on attend un ordre qui ne vient pas.\n\nIls disent qu’ils vont brûler la région. Pas nous, la Patrouille, mais d’autres avions, ceux de la base d’Orange. On nous a expliqué qu’on ne pouvait pas voler au-dessus de ce qu’on allait brûler, que c’était « une question d’image ». Je n’ai jamais été aussi fier de ne pas avoir le droit de voler.\n\nCe soir, je vais m’asseoir dans mon avion, juste pour m’asseoir. Si l’ordre vient, je serai prêt.\n\nTu te rappelles le meeting de Salon, et le cœur que j’avais dessiné en fumée rouge pour toi ? Je le redessinerai, promis.\n\nPapa (Athos 6)',
  },
  doc_tract_armee: {
    titre: 'AVIS À LA POPULATION', style: 'imprime',
    texte: 'RÉPUBLIQUE FRANÇAISE\nAVIS À LA POPULATION DE LA ZONE D’EXCLUSION SANITAIRE\n\nUne opération sanitaire d’ampleur exceptionnelle va être conduite dans les prochains jours.\n\nLes personnes NON INFECTÉES sont invitées à se présenter au point de contrôle du PONT DE MALLEMORT, à l’aube du premier jour de vent fort, munies d’un tissu blanc.\n\nToute personne présentant une morsure, une plaie inexpliquée ou de la fièvre ne pourra pas franchir.\n\nL’État ne vous oublie pas.\n\n(Au verso, en petits caractères : « Ce document ne peut être reproduit. »)',
  },
  doc_sms_mallemort: {
    titre: 'Un téléphone sur le pont', style: 'sms', lieu: 'mallemort', marqueur: 'voiture_refugies',
    texte: 'KARINE → CHRIS (18/09, 06:02) : on est au pont de mallemort. y a les soldats de l’autre côté\nKARINE → CHRIS (06:10) : ils disent de reculer. on est 30. y a des bébés\nKARINE → CHRIS (06:14) : un monsieur a traversé en courant avec son fils. ils ont tiré\nKARINE → CHRIS (06:15) : ils ont tiré sur le petit aussi\nKARINE → CHRIS (06:31) : on attend. personne bouge\nKARINE → CHRIS (09:47) : y a du réseau au milieu du pont. je t’envoie ça du milieu. ils me voient. ils tirent pas encore\nKARINE → CHRIS (09:48) : je t’aime. dis aux petits que maman a essa\n(Message partiellement distribué.)',
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
    texte: '(Peint en blanc sur la porte du village perché.)\n\nICI, IL Y AVAIT UN REFUGE.\nIl a tenu onze jours.\nLa radio continue de passer notre message en boucle, parce qu’on n’a pas eu le cœur de l’arrêter.\nSi vous êtes venus à cause de lui, pardon.\nLa voie ferrée ne mène plus nulle part.',
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
    titre: 'Lettre du moulin', style: 'manuscrit', lieu: 'grans',
    texte: 'On a remis en marche la roue du vieux moulin, sur la Touloubre. Elle fait jour et nuit un bruit de bois et d’eau, et les morts viennent l’écouter : ils se mettent en rang sur la berge et ils regardent tourner la roue.\n\nPendant ce temps-là, ils ne regardent pas nos fenêtres.\n\nC’est Baptistin, le berger, qui nous a appris ça, avant de partir avec ses cloches. Il nous a dit : « Ils aiment ce qui tourne en rond, comme nous. »',
  },
  doc_lancon: {
    titre: 'Ticket de péage', style: 'imprime', lieu: 'lancon',
    texte: 'AUTOROUTE A7 — BARRIÈRE DE LANÇON\nEntrée : SALON-NORD\nDate : 02/09/2026 — 11:48\nClasse : 1\n\n(Le ticket est coincé dans un pare-soleil. Dans la file, sur sept voies, trois kilomètres de voitures attendent, portières ouvertes. Au dos, quelqu’un a écrit au stylo bille : « On n’a pas pu payer. La barrière ne s’est jamais levée. »)',
  },
  doc_cornillon: {
    titre: 'Carnet d’un guetteur', style: 'carnet', lieu: 'cornillon',
    texte: 'Du haut de Cornillon, on voit tout : l’étang, la Crau, Istres, Miramas, et la fumée de Salon.\n\n15/09 — Un troupeau de moutons traverse la Crau vers le nord. Non, ce ne sont pas des moutons.\n17/09 — Il grossit, et il passe à Grans. Il y a des gens devant, avec des lumières.\n20/09 — Des avions tournent très haut. Ils prennent des photos.\n23/09 — Le vent n’est pas encore là. Les vieux disent que quand il arrivera, il faudra être loin des pins.\n24/09 — J’ai commencé à couper les pins autour du village, tout seul. Ça va prendre du temps.',
  },
  doc_cimetiere_manieres: {
    titre: 'Plan des chapelles réquisitionnées', style: 'imprime', lieu: 'cimetiere',
    texte: 'PLAN — CIMETIÈRE SAINT-ROCH — CHAPELLES RÉQUISITIONNÉES (LOT 14)\n\nAllée des Pins : ROUX-BÉRENGER (4 housses), ESTÈVE (6), CASTELLAN (5)\nAllée du Rocher : ISNARD (3), FAMILLE X (tombe sans nom, 2)\nEsplanade : conteneurs A et B (192)\n\nClés : loge du gardien.',
  },
  doc_page_14: {
    titre: 'Page quatorze', style: 'manuscrit',
    texte: 'p. 14 — DONNEUR POUR P4\n\nARNAUD Luc, 51 ans, électricien, Lamanon.\nFracture ouverte du tibia droit depuis 2 jours, plaie infectée, 38,2 °C de fièvre.\nAntibiotiques : de l’amoxicilline, sa propre boîte. Il s’en serait probablement sorti.\n\nP4 a été transformé il y a 5 jours. La fenêtre des 48 heures est dépassée pour P3, et à la limite pour P4. Il n’y aura pas d’autre donneur avant deux jours au moins.\n\nDÉCISION : je choisis M. Arnaud. Sédation profonde (morphine, 40 mg). Il n’a pas eu mal. Je me le répète : il n’a pas eu mal.\n\nIl s’est quand même réveillé au son de la cloche. Il a regardé P4 et il a dit « Jo ». Je ne sais pas qui est Jo.\n\nNourrissage : le 11/09, à 3 h 10.\n\nJ’arrache cette page. Si P4 se réveille, P4 n’a pas besoin de savoir ça, et personne d’autre non plus. Moi, je la garde : c’est à moi de la porter.\n\n— M. S.',
  },
};
