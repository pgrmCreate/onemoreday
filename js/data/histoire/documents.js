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
    texte: 'Si tu lis ça, tu t’es réveillé. Ou réveillée : j’ai écrit ce mot trois fois, pour trois personnes, et je n’ai plus la force de faire les accords.\n\nTu n’es pas fou. Ni folle. Rien de tout ça.\n\nTu étais mort. Tu ne l’es plus. Je sais pourquoi, et je suis sans doute la seule à le savoir.\n\nNe bois pas l’eau des caniveaux. Ne reste pas dans le noir. Ne t’approche pas des morts : ils ne font plus la différence entre eux et toi. Et toi non plus, au début.\n\nViens à la Tour de l’Horloge, place Crousillat. Allume une lumière au pied de la tour et lève-la vers les cloches. Je guette tous les soirs.\n\nQuoi que tu entendes ensuite, ne cours pas vers le bruit.\n\n— M.\n\n(Brûle ce papier.)',
  },
  doc_registre_saint_roch: {
    titre: 'Registre de la morgue provisoire — Saint-Roch', style: 'tape', lieu: 'cimetiere', marqueur: 'conteneur_frigo',
    texte: 'MORGUE PROVISOIRE SAINT-ROCH — 2e RÉGIMENT MÉDICAL / DÉTACHEMENT NRBC (DÉCONTAMINATION)\n\nLOT 11 — 198 corps — incinéré le 12/09 (site : carrière de la Crau)\nLOT 12 — 204 corps — incinéré le 13/09\nLOT 13 — 187 corps — incinéré le 14/09\nLOT 14 — 212 corps — EN ATTENTE D’INCINÉRATION — stockés dans les conteneurs A et B et dans des chapelles familiales (voir plan)\n\nGroupe électrogène des conteneurs frigorifiques : plein fait le 13/09 — autonomie 96 h\nPASSAGE DU 16/09 : ANNULÉ (convoi bloqué, rond-point de l’Anjou)\n\nNote au stylo, en bas de page :\nMettre des corps dans les chapelles, c’est pas réglementaire. Mais les conteneurs sont pleins et il fait 34 degrés. Pardon aux familles. — Sgt B.',
  },
  doc_consignes_ramassage: {
    titre: 'Fiche réflexe — équipes de ramassage', style: 'imprime', lieu: 'cimetiere', marqueur: 'soldat_nrbc',
    texte: 'FICHE RÉFLEXE N° 4 — RAMASSAGE DES CORPS EN ZONE D’EXCLUSION\n\n1. Tenue de protection NRBC complète (combinaison, masque, gants). Aucune exception.\n2. Travailler à deux. Le second tient l’arme.\n3. CORPS PRÉSENTANT UNE ACTIVITÉ (mouvement, son, ouverture des yeux) : TIR DANS LA TÊTE, puis mise en housse.\n4. CORPS INERTES : MISE EN HOUSSE DIRECTE. Ne pas gaspiller de munitions.\n5. Effets personnels : dans un sachet scellé, agrafé à la housse.\n6. Ne pas parler aux corps.\n\n(Au feutre, rajouté par quelqu’un : « Même quand ils parlent. SURTOUT quand ils parlent. »)',
  },
  doc_cahier_gardien: {
    titre: 'Le cahier du gardien', style: 'manuscrit', lieu: 'cimetiere', marqueur: 'loge_gardien',
    texte: '3 sept. Les enterrements de la semaine sont reportés. La mairie dit : « jusqu’à nouvel ordre ». Mme Isnard est venue quand même fleurir son mari. Je l’ai laissée.\n\n10 sept. Les militaires sont arrivés avec deux camions frigos. Ils ont dit que le cimetière était « réquisitionné ». J’ai demandé pour combien de temps. Ils ont ri.\n\n13 sept. Plus de place dans les camions. Ils ont ouvert les chapelles des familles : les Roux-Bérenger, les Estève, les Isnard, les Castellan. Je leur ai donné les clés. Qu’est-ce que je pouvais faire ?\n\n14 sept. Le sergent garde maintenant la clé de la grille. Il ferme lui-même le soir et il rouvre le matin. Il m’a demandé s’il existait un double. J’ai dit non. Je ne sais pas pourquoi. Je n’aime pas qu’on m’enferme.\n\n16 sept. Ils ne sont pas revenus. La grille est fermée, et je suis dedans, avec eux. Heureusement qu’il y a le double. Le groupe électrogène s’est arrêté cette nuit. Les frigos ne tournent plus. Ça commence à sentir.\n\n19 sept. J’ai soif. Je ne bois plus l’eau du robinet, elle a un drôle de goût.\n\n20 sept. Des cloches sonnent en ville tous les soirs, à la même heure. Je pourrais prendre le double et y aller. Pour quoi faire ? Il n’y a plus personne chez nous.\n\n21 sept. Ça bouge dans la chapelle des Roux-Bérenger. Je n’ouvre pas.',
  },
  doc_plan_salon: {
    titre: 'Plan de Salon-de-Provence, annoté par le gardien', style: 'imprime', lieu: 'cimetiere',
    texte: 'SALON-DE-PROVENCE — PLAN DU CENTRE HISTORIQUE\nOffice de tourisme — « Salon, la ville de Nostradamus »\n\n1. Château de l’Empéri — musée d’art et d’histoire militaires\n2. Tour de l’Horloge — XVIIe siècle\n3. Fontaine Moussue — place Crousillat\n4. Maison de Nostradamus — musée\n5. Collégiale Saint-Laurent — tombeau de Nostradamus\n6. Église Saint-Michel\n7. Hôtel de Ville\n\n(Par-dessus, au stylo bille bleu, l’écriture du gardien :)\n\nTout en bas, sur le cimetière Saint-Roch, une croix : ICI.\n\nSur la Tour de l’Horloge, un cercle repassé plusieurs fois : « Les cloches. Tous les soirs, même heure. Les morts y vont. Qui sonne ? »\n\nSur la pharmacie du cours Carnot : « Pillée. »\n\nSur la supérette de la rue Kennedy : « Encore du pain le 8. »\n\nDans la marge de droite, une flèche qui sort du plan : « Hôpital. L’armée l’a vidé. Ne pas y aller. »\n\nDans la marge du bas : « Barrage de l’armée au rond-point de l’Anjou. Ils tirent sur ceux qui approchent. »\n\nDans une petite rue derrière la collégiale Saint-Laurent, deux mots entourés : « Chez nous. » Le stylo est passé tant de fois dessus qu’il a troué le papier.',
  },
  doc_plaque_1909: {
    titre: 'Plaque de la salle de l’horloge', style: 'imprime', lieu: 'tour_horloge', marqueur: 'mecanisme_horloge',
    texte: 'LA TOUR DE L’HORLOGE\n\nÉdifiée de 1626 à 1630 à l’emplacement de la porte Farreiroux, achevée en 1664. Le campanile en fer forgé est l’œuvre du serrurier salonais Joseph Rolland ; l’horloge à phases de lune, celle des frères Quintrand. Trois cloches : 2 563 kilogrammes de bronze.\n\nLe 11 juin 1909, à 21 h 10, un séisme d’une violence inouïe frappe la Provence. À Salon, les cheminées s’effondrent, les façades se lézardent, l’horloge s’arrête. Réparée en 1912, elle est classée Monument historique la même année.\n\n(Dessous, au feutre noir, une écriture serrée, penchée :)\nET LE 2 SEPTEMBRE 2026. 21 H 10. ELLE S’EST ARRÊTÉE TOUTE SEULE.',
  },
  doc_carnet_maud_tour: {
    titre: 'Carnet de Maud — la tour', style: 'carnet', lieu: 'tour_horloge', marqueur: 'carnet_tour',
    texte: 'J+13 (15/09 — treize jours après le Mercredi). Je me suis installée dans la tour. J’ai sonné les cloches à 21 h 10. Tous les morts du quartier viennent sur la place. Aucun de mes patients.\n\nJ+15. Sonné. Rien. Mal au dos. Plus de blondes : je suis passée aux brunes de la supérette.\n\nJ+17. Sonné. Un chien est venu. Il s’est assis et il a écouté jusqu’au bout.\n\nJ+18. P3 et P4, mes deux derniers patients endormis, emportés au cimetière : 9 et 10 jours de dormance. Si mes courbes sont justes, ils se réveilleront entre J+19 et J+22. Si mes courbes sont justes.\n\nJ+19. Sonné. Rien.\n\nJ+20. Sonné. Rien. Je vais finir par sonner pour moi.',
  },

  // ═══════════════ CHAPITRE 1 — Nostradamus ═══════════════
  doc_cartel_peste: {
    titre: 'Cartel du musée — « Nostradamus et la peste »', style: 'imprime', lieu: 'nostradamus', marqueur: 'cartel_peste',
    texte: 'NOSTRADAMUS ET LA PESTE\n\nEn 1546, la peste ravage Aix-en-Provence. Michel de Nostredame, médecin, y est appelé. Il fait assainir les rues, brûler le linge des malades et distribue des « pilules de roses » — pétales de roses rouges cueillis avant l’aube, sciure de cyprès, girofle, ambre gris — que l’on garde sous la langue.\n\nL’efficacité de ces pilules est douteuse. Sa présence, elle, ne l’est pas : quand les notables fuyaient la ville, il est resté.\n\nL’année suivante, il s’installe à Salon, dans cette maison, où il écrira les Prophéties.\n\n(Au crayon, dans la marge, de l’écriture de Maud : « Il est resté. C’est tout ce qu’on retient de lui. »)',
  },
  doc_fiche_p5: {
    titre: 'Feuille de soins scotchée au pilier', style: 'manuscrit', lieu: 'nostradamus', marqueur: 'cave_patiente',
    texte: 'P5 — Mireille A., 44 ans. Pharmacienne, cours Carnot.\nMordue le 09/09 à la main droite, par une cliente, au comptoir. Transformée en moins de 8 h.\nCapturée le 10/09 à la perche, dans sa pharmacie.\nNourrie le 12/09 à 22 h 40. Donneur : S. B., 17 ans (fracture du crâne, aucune chance de survie). Donneur consommé en entier.\nEn dormance depuis le 13/09.\n\nTempérature : 22,1 °C le 13/09 — 23,0 le 15/09 — 23,8 le 17/09 — 24,6 le 19/09 — 25,9 le 21/09.\nPouls : 1 battement par minute… puis 2… puis 4.\n\nNote : elle a une fille, Inès, 7 ans, gardée chez sa grand-mère à Pélissanne. Si elle se réveille lucide : NE PAS lui promettre qu’on retrouvera sa fille.',
  },
  doc_scanner_maud: {
    titre: 'Carnet d’écoute — fréquences militaires', style: 'carnet', lieu: 'nostradamus', marqueur: 'scanner_maud',
    texte: '14/09 — 23 h 02. « …confirmation Cautère, phase deux, déclenchement conditionné… » Coupé. Cautère : c’est le nom de leur opération.\n\n16/09 — 04 h 40. Un opérateur fatigué. « …ligne Durance, mise à feu au premier épisode de mistral supérieur à six-zéro… » Six-zéro : 60 km/h. Ils mettront le feu au premier coup de mistral, pour que le vent pousse les flammes sur nous. Quelqu’un lui dit de passer sur la fréquence cryptée. Il répond : « Ça change quoi ? Ils sont tous morts, en face. »\n\n19/09 — 22 h. Météo militaire, en clair : « anticyclone persistant, vent faible, pas de mistral prévu avant J plus dix ».\n\nJ plus dix. On a dix jours.\n\n21/09. Je réécoute l’enregistrement du 16. « Ils sont tous morts, en face. » Non, mon garçon. Pas tous.',
  },

  // ═══════════════ CHAPITRE 1 — Empéri ═══════════════
  doc_journal_vidal: {
    titre: 'Registre du château — J. Vidal', style: 'manuscrit', lieu: 'emperi', marqueur: 'journal_vidal',
    texte: 'Mercredi 2. Évacuation du lycée à 11 h 20 sur ordre du proviseur. Les bus ne sont jamais venus. J’ai fait monter ma classe au château : les murs, la hauteur, une seule porte. 27 élèves, 4 collègues.\n\nJeudi 3. Les parents ne viennent pas. Les téléphones ne passent plus. Mehdi a trouvé une réserve d’eau dans les citernes du musée.\n\nSamedi 5. Deux élèves partis rejoindre leurs familles. Pas revenus.\n\nDimanche 6. La foule des morts est arrivée par la montée du Puech. J’ai fait entrer ceux que je pouvais. J’ai fermé la grille. Il restait quelqu’un dehors, juste devant. Un sac rouge. Je ne sais pas son nom. Je ne veux pas le savoir.\n\nJeudi 10. Lou et Samir ont ramené un homme de Lamanon, jambe cassée, trouvé dans une cave rue Carnot. Luc. Il raconte des blagues. On l’a porté à l’hôpital, chez la docteure Sérane.\n\nSamedi 12. Samir est tombé du rempart. Fracture du crâne. On l’a porté chez la docteure. Mort sur la table, dit-elle. Luc aussi, avant-hier. Elle a tout essayé, dit-elle.\n\nLundi 21. Je fais cours tous les matins. Tant qu’il y a un cours, il y a un lendemain.',
  },
  doc_regles_emperi: {
    titre: 'Règles du château', style: 'manuscrit', lieu: 'emperi', marqueur: 'panneau_regles',
    texte: 'RÈGLES DU CHÂTEAU (au marqueur, sur une affiche du musée retournée)\n\n1. On montre ses bras à la porte, pour prouver qu’on n’est pas mordu. Tout le monde. Même moi.\n2. Personne ne sort seul.\n3. On ne boit pas l’eau de la fontaine sans l’avoir fait bouillir.\n4. On ne pleure pas devant les petits. On pleure la nuit.\n5. Une morsure = on le dit. Tout de suite. On ne vous en voudra pas.\n6. Cours tous les matins à 9 h. Présence obligatoire.\n7. Les sabres du musée sont à tout le monde et à personne.\n\n(En dessous, d’une autre écriture, ronde : « 8. Nathan ne touche plus aux sabres. »)',
  },
  doc_carnet_lou: {
    titre: 'Le carnet à dessin de Lou', style: 'carnet', lieu: 'emperi',
    texte: '[Une double page. Six dessins au stylo bille, datés dans le coin.]\n\n6/9 — Un mort au pied de la porte, en bas de la montée. Un sac à dos rouge, une bretelle cassée. Le visage levé vers la grille. Légende : « Il s’est relevé. 18 h. »\n\n7/9 — Le même. « Il est revenu. 17 h pile. Nathan l’appelle le Client. »\n\n7/9 — Le même, de profil. « Il a pas de chaussure gauche. »\n\n7/9 — Le même, assis. « Il s’assoit, maintenant. Comme s’il attendait qu’on lui ouvre. »\n\n8/9 — Le même, de dos. « Je crois qu’il était vivant quand Vidal a fermé la grille. Je crois que c’est le type qui est resté dehors. Je le dirai à personne. »\n\n8/9 — Une ambulance. Une femme avec une perche. Le mort au sac rouge, un câble autour du cou, suit la femme. « Elle l’a emmené comme un chien. Elle lui parlait doucement. »',
  },
  doc_sms_telephone: {
    titre: 'Ton téléphone — messages', style: 'sms', lieu: 'emperi',
    texte: 'DOMAINE DES TROIS CYPRÈS (29/08) : Bonjour, c’est confirmé pour les vendanges à partir du jeudi 3/09, rdv 7 h à la cave du domaine, prévoir gants, casquette, eau. Hébergement à voir sur place. Bonne route !\n\nMAMAN (30/08) : Bien {arrivé|arrivée} ? Envoie une photo de ta chambre. Et mange.\n\nMAMAN (02/09, 12:14) : Tu es où ??? Ils parlent de Salon à la télé\nMAMAN (02/09, 12:15) : Réponds\nMAMAN (02/09, 12:31) : Appelle-moi\nDOMAINE DES TROIS CYPRÈS (02/09, 14:02) : Vendanges annulées. Restez chez vous. Désolés.\nMAMAN (02/09, 19:40) : Le téléphone sonne dans le vide. Je t’aime. Rappelle.\nALERTE GOUVERNEMENTALE (03/09) : CONFINEMENT STRICT — BOUCHES-DU-RHÔNE OUEST\nMAMAN (04/09, 03:12) : Je n’arrive pas à dormir. Dis-moi juste un mot. Un seul.\nMAMAN (06/09, 17:40) : Ils disent qu’il faut aller dans les lieux fermés, les écoles, les châteaux\nMAMAN (06/09, 23:58) : Je t’aime. N’importe quand. Même la nuit.\nALERTE GOUVERNEMENTALE (07/09) : ZONE D’EXCLUSION SANITAIRE — RESTEZ CONFINÉS — NE CHERCHEZ PAS À REJOINDRE LA DURANCE\nMAMAN (12/09) : Je t’écris quand même.\nMAMAN (19/09) : Je t’écris quand même.',
  },
  doc_video_6_septembre: {
    titre: 'Vidéo — 6 septembre, 17 h 52 (41 s)', style: 'tape', lieu: 'emperi',
    texte: '00:00 — Image qui tremble. Course. Respiration forte. Ta voix : « Attendez ! Attendez ! »\n00:06 — La montée du Puech, filmée d’en bas. En haut, la porte du château, une grille à moitié fermée. Des adolescents entrent en courant.\n00:11 — Un homme en pull bleu — Vidal, le professeur — les compte à voix haute : « Seize… dix-sept… dix-huit. »\n00:17 — Ta main entre dans le champ, tendue vers la grille.\n00:19 — L’homme se retourne. Il te regarde. Une seconde.\n00:20 — Sa main s’abat sur ta poitrine. Il pousse. L’image bascule : ciel, murs, pavés.\n00:22 — Bruit de grille qui claque.\n00:23 — Ta voix : « Monsieur ! »\n00:25 — Grognement, derrière. L’image se remplit de mains.\n00:31 — Ciel bleu. Le téléphone est tombé, écran vers le haut.\n00:31 à 00:41 — Ciel bleu. Son : quelqu’un qu’on dévore. Toi.',
  },
  doc_cartel_sabre: {
    titre: 'Cartel — sabre de cavalerie légère', style: 'imprime', lieu: 'emperi', marqueur: 'vitrine_sabres',
    texte: 'SABRE DE CAVALERIE LÉGÈRE, MODÈLE AN XI\nManufacture de Klingenthal, vers 1810. Lame courbe à un tranchant, garde à trois branches.\nArme des hussards et chasseurs à cheval de la Grande Armée, conçue pour frapper du tranchant au galop, pendant les charges.\n\nMusée de l’Empéri — collection Raoul et Jean Brunon.\n\n(La vitrine est vide. Quelqu’un a scotché sur la vitre : « EMPRUNTÉ. RENDU QUAND C’EST FINI. — M. VIDAL »)',
  },

  // ═══════════════ CHAPITRE 1 — Saint-Laurent ═══════════════
  doc_tombeau: {
    titre: 'Plaque de la chapelle de la Vierge', style: 'imprime', lieu: 'saint_laurent', marqueur: 'tombeau_nostradamus',
    texte: 'Ici reposent les restes de Michel NOSTRADAMUS (1503-1566), médecin et astrologue, auteur des Prophéties.\n\nD’abord inhumé dans l’église des Cordeliers, son tombeau fut profané en 1791 par des gardes nationaux. Ses ossements furent transférés en cette collégiale la même année.\n\nLa tradition rapporte que l’un des profanateurs but du vin dans son crâne, et qu’il fut tué le lendemain.\n\n(Au feutre, de l’écriture de Nathan : « La légende dit que celui qui ouvre le tombeau meurt dans l’année. Vérifié : c’est faux. Je l’ai pas ouvert et je vais mourir quand même. N. »)',
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
    texte: 'INDEX DES DONNEURS (p. 1)\nFaure R., 81 ans — p. 3 (accidentel)\nDelpech G., 59 ans — p. 9\nInconnu X, 34 ans (polytraumatisé) — p. 11\nArnaud L., 51 ans — p. 14\nS. B., 17 ans — p. 17\n\np. 2 — Du 2 au 4 septembre : 300 morsures. Entre la morsure et l’arrêt du cœur : 3 à 30 h. Entre l’arrêt du cœur et le moment où ils se relèvent : moins d’une heure. Ce ne sont pas des morts. Leur cœur bat 2 à 4 fois par minute, leur corps est à la température de la pièce, leur cerveau garde une activité minimale. Ce sont des patients.\n\np. 3 — 03/09. P1 (patient n° 1, box 6) s’échappe, mord Karim B. (brancardier) et dévore M. Faure (box 7, 81 ans, hospitalisé pour un AVC). Presque en entier. Ensuite, P1 se calme. Il se couche. Il ne bouge plus. Pouls : 1 par minute.\n\np. 5 — 07/09. Quatre jours après. P1 se réveille. Il demande de l’eau. Il donne son nom, son adresse, le nom de son chat. NOURRI. NOURRI. NOURRI.\n\np. 6 — Hypothèse, à confirmer : l’agent se sature. Il faut un adulte entier, mangé dans les 48 h qui suivent la transformation. Moins : retour partiel (?). Au-delà de 48 h : aucun effet (?). Le patient s’endort alors comme un mort : c’est la dormance. 4 jours pour P1, dans un box à 30 degrés. Au froid de la morgue, sans doute plus longue (10 à 14 jours ?). Ensuite, réveil. Un vivant mangé, un mort qui revient. Un pour un.\n\np. 7 — P1 s’est jeté du toit. Il a laissé un mot : « Je me souviens du goût. »\n\np. 9 — P2. Nourri avec G. D. (hémorragie interne impossible à arrêter). Réveil au bout de 12 jours : RATÉ. Lucide 4 minutes, puis rechute. Abattu.\n\np. 11 — P3 (Patrick Veyrier). Nourri avec un inconnu de 34 ans. En dormance. Emporté par l’armée avec les corps du 12. Un mot dans sa poche.\n\np. 13 — P4 (voir l’étiquette). Morsure le 06/09, avant-bras gauche. {Capturé|Capturée} le 08/09 dans la montée du Puech, à la perche. Salle 4. Nourri le 11/09 à 03 h 10. Donneur : voir p. 14. En dormance depuis le 11/09. Emporté avec les corps du 12. Un mot dans sa poche.\n\n[La page 14 a été arrachée. Il reste une frange de papier dans la reliure.]\n\np. 17 — P5 (Mireille A.). Nourrie le 12/09 avec S. B., 17 ans, fracture du crâne (chute du rempart de l’Empéri). Emmenée avec moi. Cave, rue Nostradamus.\n\np. 18 — Bilan : 1 réveil lucide (P1, suicidé), 1 raté (P2), 3 en attente. Peut-être deux réveils réussis sur trois. Si c’est vrai, entre la Durance et la mer, il y a quatre cent mille personnes qu’on peut ramener. Au prix d’une autre vie chacune. Je ne sais pas si c’est une bonne nouvelle. C’est une nouvelle.',
  },
  doc_dossier_p4: {
    titre: 'Dossier des urgences — P4', style: 'imprime', lieu: 'hopital', marqueur: 'dossiers_urgences',
    texte: 'CENTRE HOSPITALIER DU PAYS SALONAIS — SERVICE DES URGENCES — DOSSIER PATIENT\n\nIdentité : (ton nom)\nÂge : (ton âge)\nAdresse : non renseignée (saisonnier — vendanges)\nAdmission : 08/09, 17 h 40, {amené|amenée} par le Dr Sérane (véhicule SAMU)\nMotif : {patient transformé|patiente transformée} depuis environ 48 h. Morsure à l’avant-bras gauche datée du 06/09.\nAttaché en salle 4.\n\n11/09 : voir le registre « Protocole ».\n12/09 : évacuation par l’armée. Décès constaté à l’œil nu par l’équipe de décontamination (NRBC). Envoyé au cimetière avec le lot 14.\n\n(Au stylo, de l’écriture de Maud : « Pas {mort|morte}. {Endormi|Endormie}. Je le prouverai. »)',
  },
  doc_dossier_luc: {
    titre: 'Dossier des urgences — ARNAUD Luc', style: 'imprime', lieu: 'hopital', marqueur: 'dossiers_urgences',
    texte: 'CENTRE HOSPITALIER DU PAYS SALONAIS — SERVICE DES URGENCES — DOSSIER PATIENT\n\nIdentité : ARNAUD Luc, 51 ans. Électricien. Lamanon.\nAdmission : 10/09, 19 h 15. Amené par deux élèves (Empéri).\nMotif : fracture ouverte du tibia droit (chute dans une cave, rue Carnot, 08/09). Plaie sale.\nÉtat : conscient, lucide, souffre beaucoup. Pas de morsure. Fièvre : 38,2 °C.\nTraitement : os remis en place, attelle. Antibiotiques : amoxicilline (boîte personnelle du patient, dans son blouson).\nPronostic : réservé (incertain). [« réservé » est barré. Au-dessus, d’une autre encre : « nul »]\n\nDécès : 11/09, 03 h 10. Cause : hémorragie.\nAffaires personnelles : dans son casier, « à rendre à la famille ».',
  },
  doc_lettre_luc: {
    titre: 'Pour Jo', style: 'manuscrit', lieu: 'hopital',
    texte: 'Ma Jo,\n\nJe t’écris depuis l’hôpital de Salon, ne t’inquiète pas. Je suis tombé dans une cave comme un couillon en me cachant, et ma jambe a pris cher. Deux gamins du château m’ont trouvé et m’ont porté sur une porte, tu imagines la tête du cortège. Ils sont bien, ces gamins.\n\nIci il y a une docteure, une seule, elle fait tout. Elle dit que la jambe, ça va aller, qu’il faut juste que j’attende un peu avant de marcher. Elle m’a pris l’insuline de Clem pour la mettre au frais, elle m’a promis qu’on me la rendrait.\n\nL’insuline, je l’ai, Jo. Quatre stylos. Je les ai eus à la pharmacie du cours, la dame me les a donnés sans ordonnance quand je lui ai montré la photo de Clem. Dis-le à Clem : papa a trouvé.\n\nJe rentre dès que je peux marcher. Si je peux pas marcher, je rentre quand même.\n\nDis à Clem que je lui ai pas acheté de nougat, tout est fermé, mais que je lui en dois un gros.\n\nJe t’aime. Je sais que je le dis pas assez. Voilà, c’est écrit, maintenant tu pourras plus dire que je le dis jamais.\n\nTon Luc.',
  },
  doc_rapport_8_septembre: {
    titre: 'Rapport à la cellule de crise — brouillon', style: 'tape', lieu: 'hopital', marqueur: 'bureau_maud',
    texte: 'CH DU PAYS SALONAIS — SERVICE DES URGENCES\nÀ : Cellule interministérielle de crise, préfecture des Bouches-du-Rhône ; PC opérationnel « Durance »\nOBJET : Réversibilité de l’état qui suit la morsure — première observation\nDATE : 08/09\n\nMadame, Monsieur,\n\nJ’ai l’honneur de porter à votre connaissance l’observation suivante, dont je mesure le caractère extraordinaire.\n\nLe patient P1, transformé le 02/09, a ingéré le 03/09 la quasi-totalité d’un adulte. Il est alors entré dans un état d’inertie totale qui ressemble à la mort (je l’appelle « dormance »). Le 07/09 au soir, il s’est réveillé, lucide, orienté, capable de décliner son identité.\n\nJe demande en urgence : 1) la suspension de toute incinération de corps inertes ; 2) un appui matériel (chambres froides, moyens de contention) ; 3) l’envoi d’une équipe de l’Institut Pasteur.\n\nLes « morts » de la zone ne sont pas morts. Ce sont des patients. Ils peuvent revenir.\n\n(Au stylo, en bas, raturé plusieurs fois : « Au prix d’un autre patient chacun. Ne pas l’écrire. L’écrire. Ne pas. » Puis, lisible : « Je l’écris. Ils ont le droit de savoir. »)\n\nDr M. Sérane, cheffe du service des urgences.',
  },
  doc_carnet_maud_p1: {
    titre: 'Carnet de Maud — P1', style: 'carnet', lieu: 'hopital', marqueur: 'bureau_maud',
    texte: 'P1. Guy F., 58 ans. Disquaire, rue de l’Horloge.\n\nIl s’est réveillé et il m’a demandé si j’avais un verre d’eau. Puis si son chat avait mangé. Il s’appelle Mingus. Le chat.\n\nIl ne se souvenait de rien, puis il s’est souvenu de tout. Ça a pris quarante minutes. J’ai tout noté. Je n’aurais pas dû noter. J’aurais dû lui tenir la main.\n\nIl m’a dit : « Docteure, je connais le goût de M. Faure. »\n\nLe lendemain, il est monté sur le toit.\n\nJe ne sais pas si je l’ai sauvé. Je sais qu’il s’est réveillé. Il faut que ça serve. Il faut que ça serve à quelque chose, sinon je ne sais pas ce que je fais là.',
  },

  // ═══════════════ SALON — lieux secondaires ═══════════════
  doc_affiche_marche: {
    titre: 'Grand marché du mercredi — plan des emplacements', style: 'imprime', lieu: 'place_de_gaulle',
    texte: 'VILLE DE SALON-DE-PROVENCE — GRAND MARCHÉ DU MERCREDI (8 h – 12 h 30)\nPlan des emplacements — septembre 2026\n\nCours Carnot : fruits et légumes (emplacements 1 à 34), fromages (35-38), charcuterie (39-42)\nCours Victor-Hugo : textile, maroquinerie, bazar\nPlace du Général-de-Gaulle : fleurs, plants, producteurs locaux\nCours Gimon : poissonnerie, rôtisserie, huile d’olive de la vallée des Baux\n\n(Des croix au stylo rouge sur une dizaine d’emplacements du cours Carnot. À côté de l’emplacement 36 — fromagerie —, quelqu’un a écrit : « C’EST LÀ QUE ÇA A COMMENCÉ ».)',
  },
  doc_addition_crousillat: {
    titre: 'Une addition', style: 'imprime', lieu: 'place_crousillat',
    texte: 'CAFÉ — PLACE CROUSILLAT — TABLE 7\nMERCREDI 02/09/2026 — 10:38\n\n2 CAFÉ ............ 3,60\n1 PASTIS .......... 3,20\n1 CROISSANT ....... 1,40\n\nTOTAL ............. 8,20 €\n\nMERCI DE VOTRE VISITE — À BIENTÔT\n\n(Non payée. Un euro de pourboire posé dessus, sous une soucoupe.)',
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
    texte: 'MAIN COURANTE — CIRCONSCRIPTION DE SALON\n\n02/09 10:52 — Appel : bagarre marché cours Carnot, « une femme mord son mari ». Patrouille envoyée.\n02/09 11:04 — Patrouille : « plusieurs individus agressifs, morsures, demande renfort ».\n02/09 11:09 — La patrouille ne répond plus.\n02/09 11:30 — 146 appels en attente.\n02/09 13:15 — Ordre préfectoral : regroupement au commissariat.\n03/09 02:40 — Le brigadier L. a été mordu pendant une interpellation. Il dit qu’il va bien.\n03/09 09:00 — Le brigadier L. ne va pas bien.\n04/09 — Repli vers la Durance ordonné. On laisse les clés sur le comptoir. Si quelqu’un en a besoin.',
  },
  doc_entailles_203: {
    titre: 'Chambre 203', style: 'manuscrit', lieu: 'hotel_poste',
    texte: '(Au mur de la chambre 203, au-dessus du lit, vingt-trois entailles au canif dans le papier peint. Dessous, au stylo :)\n\nJour 23. J’ai mangé ma dernière conserve. La radio dit que Miramas-le-Vieux tient. Je pars pour la gare. S’il y a un locotracteur sur la voie de service, je le fais démarrer.\n\nSi tu lis ça et que tu as besoin d’un lit, il est bon. Le verrou doré tient.\n\nUn jour de plus. C’est tout ce que je demande.',
  },
  doc_sms_parents: {
    titre: 'Groupe « Parents 2nde 4 — Craponne »', style: 'sms', lieu: 'lycee',
    texte: 'Sandrine B. (02/09, 11:05) : Quelqu’un sait ce qui se passe sur le cours ?? Les pompiers passent en boucle\nKarim T. (11:07) : Le lycée confine, les enfants sont en classe\nSandrine B. (11:12) : On peut aller les chercher ?\nProf principal (11:20) : NE VENEZ PAS. Les grilles sont fermées. On gère. Les enfants sont en sécurité.\nNathalie R. (12:40) : Ma fille dit qu’il y a des gens qui tapent aux vitres du gymnase\nKarim T. (12:41) : Des gens ?\nNathalie R. (12:58) : Elle ne répond plus\nSandrine B. (13:30) : Quelqu’un est sur place ??\nSandrine B. (15:02) : Je suis devant. Les grilles sont ouvertes.\nSandrine B. (15:03) : Il n’y a personne dans la cour\nSandrine B. (15:04) : Si. Il y a quelqu’un.\n(Plus aucun message.)',
  },
  doc_liste_casino: {
    titre: 'Liste de courses', style: 'manuscrit', lieu: 'casino_shop',
    texte: 'eau (BEAUCOUP)\npiles\nriz, pâtes\ncroquettes pour Filou\nbougies\nsucre\nlait en poudre (pour la petite)\nRIEN D’AUTRE\nne pas parler aux gens\nne pas traîner\nrevenir avant midi\n\nMaman',
  },
  doc_ordonnance_luc: {
    titre: 'Ordonnance — ARNAUD Clémence', style: 'imprime', lieu: 'pharmacie_carnot',
    texte: 'Dr C. Roubaud — pédiatre — Salon-de-Provence\nPatiente : ARNAUD Clémence, 9 ans\nInsuline rapide : selon protocole\nInsuline lente : 12 unités au coucher\nRenouvelable 6 mois.\n\n(Au dos, au stylo, de la main de la pharmacienne :)\n10/09 — J’ai délivré 4 stylos à M. Arnaud (le père) sans l’ordonnance originale : il avait une photo de la petite et une tête de papa honnête. Je note pour mémoire. Si quelqu’un contrôle un jour, qu’il me cherche. — Mireille A.',
  },
  doc_programme_cine: {
    titre: 'Programme du mercredi 2 septembre', style: 'imprime', lieu: 'cineplanet',
    texte: 'CINÉPLANET — PLACE MORGAN — MERCREDI 2 SEPTEMBRE\nSéances du matin (dernier jour des vacances !) :\n10:00 — Film d’animation (salle 3) — COMPLET\n10:15 — Film d’animation, VF (salle 5)\n10:30 — Avant-première (salle 1)\n\n(Sur la porte de la salle 3, au rouge à lèvres, de l’intérieur :)\nNE PAS OUVRIR — ILS SONT TOUS DEDANS — ON A FERMÉ À 11 H — PARDON',
  },
  doc_carnet_pompier: {
    titre: 'Carnet d’interventions — ambulance des pompiers n° 2', style: 'carnet', lieu: 'pompiers',
    texte: '02/09 — 10:58 — cours Carnot — « morsure humaine », victime de 60 ans, mordue à l’avant-bras. Transportée à l’hôpital.\n02/09 — 11:20 — cours Carnot — 4 victimes. L’une d’elles devient agressive dans le véhicule. On l’attache.\n02/09 — 11:45 — la victime sanglée n’a plus de pouls. 11:52 : elle bouge. Les sangles tiennent.\n02/09 — 13:10 — Jeannot mordu à la main en déchargeant. « C’est rien. »\n03/09 — Jeannot n’est pas venu à la relève.\n04/09 — Ordre : tous les engins vers la Durance, pour tenir les ponts. On part.\n04/09 — On laisse les haches. Le lieutenant dit : « Ils en auront plus besoin que nous. »',
  },
  doc_repli_gendarmerie: {
    titre: 'Message — ordre de repli', style: 'tape', lieu: 'gendarmerie',
    texte: 'MESSAGE — URGENT — GROUPEMENT 13\nDESTINATAIRES : toutes brigades arrondissement d’Aix\n\n1. Repli immédiat de tous les personnels et familles sur la rive nord de la Durance (Mérindol, Cavaillon).\n2. Armement et munitions emportés ou détruits.\n3. Les personnels présentant une morsure ne sont PAS autorisés à franchir. Ils resteront en poste.\n4. Aucune exception.\n\n(Au bas du télex, au stylo : « Adjudant M., mordu le 3. Je reste en poste. J’ai fermé le portail. Les familles sont parties. Tout va bien. Il fait beau. »)',
  },
  doc_centuries: {
    titre: 'Les Prophéties — édition annotée', style: 'manuscrit', lieu: 'mediatheque',
    texte: '(Un livre de poche des Prophéties, ouvert, annoté au crayon par un survivant.)\n\n« Quand le grand vent viendra du septentrion… » — Un quatrain inventé ? Je ne le trouve pas dans l’index. Je l’ai peut-être rêvé.\n\n« Les morts seront vivants, les vivants mis à mort » — pas trouvé non plus. Mais ça sonne juste.\n\nJ’ai relu tout le livre deux fois. Il n’a rien prévu. Personne ne prévoit rien. On écrit des phrases assez floues pour que n’importe quelle catastrophe s’y glisse.\n\nMais j’ai quand même noté ça, page 14 : « Un pour un, la bête mange son maître. » Ce n’est pas dans le livre : c’est moi qui l’ai écrit, au crayon. Je ne sais pas pourquoi. Je l’ai entendu crier dans la rue, par une femme qui portait une cloche.',
  },
  doc_savonnerie: {
    titre: 'Mot sur la porte de la savonnerie', style: 'manuscrit', lieu: 'marius_fabre',
    texte: 'Servez-vous en savon. Lavez-vous les mains, lavez les plaies, lavez tout. Le savon de Marseille tue ce que l’eau seule ne tue pas.\n\nOn fait du savon ici depuis 1900. On a fait du savon pendant deux guerres. On aurait continué pendant celle-là, mais on n’a plus d’huile.\n\nPrenez-en autant que vous pouvez porter. Il ne se périme pas.\n\n— L’équipe',
  },
  doc_lettre_canourgues: {
    titre: 'Lettre à Yanis', style: 'manuscrit', lieu: 'canourgues',
    texte: 'Yanis,\n\nJe laisse cette lettre sur la table au cas où tu reviendrais du travail, à Clésud. Je suis chez ta tante au 4e, bâtiment C. On a barricadé l’escalier avec les machines à laver.\n\nSi tu es mordu, ne viens pas. Je t’aime, mais ne viens pas. Je ne pourrais pas.\n\nSi tu n’es pas mordu, frappe trois coups, puis deux coups. Je t’ouvrirai.\n\nJ’ai fait des cornes de gazelle. Je t’en garde.\n\nMaman',
  },
  doc_annonce_gare: {
    titre: 'Avis aux voyageurs', style: 'imprime', lieu: 'gare',
    texte: 'SNCF VOYAGEURS — TER SUD\n\nEN RAISON D’UN ÉVÉNEMENT EXCEPTIONNEL, LE TRAFIC EST INTERROMPU ENTRE AVIGNON ET MIRAMAS JUSQU’À NOUVEL ORDRE.\n\nLES VOYAGEURS SONT INVITÉS À NE PAS SE RENDRE EN GARE.\n\nNOUS VOUS PRIONS DE NOUS EXCUSER POUR LA GÊNE OCCASIONNÉE.\n\n(Scotché dessous, un papier à carreaux : « Le locotracteur de la voie de service marche. Il faut une batterie de camion et du gasoil. Bonne chance. »)',
  },
  doc_socle_jean_moulin: {
    titre: 'Messages sur le socle', style: 'manuscrit', lieu: 'jean_moulin',
    texte: '« CALÈS — PAR LES COLLINES — PAS LA ROUTE » (au goudron)\n« Famille Garcia partie vers Lamanon le 9. Kevin, si tu lis, on t’attend. » (craie)\n« Le prof de l’Empéri est un héros » (feutre)\n« NE SUIVEZ PAS LES CLOCHES » (rouge à lèvres)\n« Jean, toi qui es tombé du ciel, dis-leur de venir nous chercher » (couteau, dans le bronze)\n« 20/09 — Des gens marchent DEVANT les morts avec des cloches. Ils sont vivants. Ou pas. Je sais pas. » (craie)\n« UN POUR UN » (à la chaux, énorme, par-dessus tout le reste)',
  },
  doc_leclerc: {
    titre: 'Note de service — direction', style: 'tape', lieu: 'leclerc',
    texte: 'NOTE DE SERVICE — 02/09 — 14 H\nÀ l’attention de tous les collaborateurs\n\nSuite aux événements du centre-ville, le magasin est fermé au public à compter d’aujourd’hui, 14 h.\nLes collaborateurs qui le souhaitent peuvent rester dans l’enceinte du magasin. Les rideaux seront baissés.\nMerci de ne pas vous servir dans les rayons sans passer en caisse. Un relevé sera fait.\n\nLa Direction\n\n(Au feutre, en dessous : « Relevé fait le 9/09 : tout. On s’est servis de tout. Pardon. — Les 14 de la réserve »)',
  },
  doc_weldom: {
    titre: 'Inventaire de fortune', style: 'manuscrit', lieu: 'weldom',
    texte: 'Pris le 11/09 :\n- 3 haches\n- 12 pieds-de-biche\n- clous 70 mm, 10 kg\n- 40 planches de coffrage\n- 6 bâches\n- 2 groupes électrogènes (le 3e marche pas)\n- toute la corde\n- les gants\n\nOn est à la piscine des Canourgues, on barricade. Si t’as besoin, viens, on partage. Frappe fort, le chien aboie avant nous.',
  },
  doc_intermarche: {
    titre: 'Ticket de caisse du 2 septembre', style: 'imprime', lieu: 'intermarche',
    texte: 'INTERMARCHÉ SUPER — SALON BEL-AIR\n02/09/2026 — 10:47 — CAISSE 4\n\nPAIN DE MIE ........... 1,89\nJAMBON x4 ............. 3,45\nCOMPOTES x12 .......... 4,20\nBOUGIE ANNIVERSAIRE 8 . 1,99\nGÂTEAU CHOCOLAT ....... 6,90\n\nTOTAL ................ 18,43 €\n\n(Au dos, au stylo : « Bon anniversaire Noé. Maman arrive. »)',
  },
  doc_saint_michel: {
    titre: 'Sur le portail de Saint-Michel', style: 'manuscrit', lieu: 'saint_michel',
    texte: '(À la craie, sous les deux diables sculptés au sommet du portail roman :)\n\nIls ont mis les diables dehors en 1239 pour que le Mal reste dehors.\n\nIls avaient raison.\n\nON EST DEDANS. ON N’OUVRE PAS. MÊME AUX CURÉS.',
  },

  // ═══════════════ CHAPITRE 2 — Calès, Vernègues, Mallemort, BA 701, Sénas ═══════════════
  doc_registre_cales: {
    titre: 'Registre de Calès', style: 'manuscrit', lieu: 'cales', marqueur: 'registre_cales',
    texte: 'GROTTES DE CALÈS — REGISTRE (tenu par Jo)\n\nHabitants : 43 (dont 11 enfants)\nEau : citerne pleine aux deux tiers (remplie par le canal de Craponne, en ouvrant la vanne)\nRations : 1 repas chaud par jour, 2 gobelets d’eau\n\n08/09 — Arrivée des Garcia, de Salon : 5 personnes.\n09/09 — On a refusé l’entrée à 7 personnes de Sénas (deux mordus parmi eux). Ils sont repartis vers le nord. [Ajouté plus tard : Je n’aurais pas dû. Je ne sais pas. J’aurais dû.]\n10/09 — Luc parti pour Salon (insuline). Retour prévu le soir.\n11/09 — Luc pas rentré.\n12/09 — Luc pas rentré.\n(Chaque jour, jusqu’au 22/09 : « Luc pas rentré. »)\n23/09 — Arrivée des gens de l’Empéri : 19 enfants et adolescents, 3 adultes.',
  },
  doc_bulletin_meteo: {
    titre: 'Bulletin — noté à la main', style: 'manuscrit', lieu: 'cales', marqueur: 'radio_cales',
    texte: '(Noté par Lou, en écoutant une radio d’Avignon, au-delà du fleuve.)\n\nMÉTÉO — Provence, Vallée du Rhône\nFin du beau temps en milieu de semaine. Dégradation par le nord. Épisode de mistral fort attendu, rafales de 80 à 100 km/h en basse vallée du Rhône et sur les Bouches-du-Rhône. Durée : trois à six jours.\n\nEt après, les infos. Un festival reporté. Un match de foot. Les prix de l’essence. Le mot « zone » une seule fois, à la fin, entre la bourse et la météo des plages.\n\nIls vivent, là-bas. Ils vivent comme si on n’était pas là.',
  },
  doc_carnet_berger: {
    titre: 'Carnet de comptes du berger', style: 'carnet', lieu: 'vernegues', marqueur: 'berger',
    texte: '(Un carnet de berger. « L’avé », en provençal, c’est le troupeau. Ici, le troupeau, ce sont les morts.)\n\nLe compte, comme chaque soir, à la lampe.\n\n15/09 — Départ de la bergerie. En tête : la Rose. Avé : 212 têtes.\n17/09 — Grans. Avé : 1 900. Revenus à la vie : 1 (Nadège, de la base aérienne).\n19/09 — Miramas. Avé : 4 300. Revenus : 4.\n22/09 — Salon, la nuit des sonnailles. Avé : 11 200. Pâture prévue : le château de l’Empéri. Ratée : les petits se sont bien défendus.\n24/09 — Revenus : 23. Ratés : 61, dans les caves.\n\nRoute : le vieux chemin des troupeaux par Lamanon, le passage entre les collines, la plaine de Sénas, les ponts de Mallemort. Puis les pâturages d’été : le Luberon, le Ventoux, et plus haut.\n\nMarius, mon fils, je les ramène tous. Pas toi. Toi, ils t’ont mis une balle dans la tête. Alors je les ramène tous, à ta place.',
  },
  doc_lettre_rose: {
    titre: 'Lettre à la famille Ruiz', style: 'manuscrit', lieu: 'vernegues', marqueur: 'rose',
    texte: 'Madame Ruiz,\n\nJe ne sais pas si vous êtes vivante. Je ne sais pas si vous voudrez lire. Je l’écris quand même, et je la garde, parce que je n’ai pas de timbre et qu’il n’y a plus de facteur.\n\nC’est moi. C’est moi qui ai mangé Kylian, le 3 septembre, sous le mûrier. Je n’étais plus moi, mais c’était mon corps et c’était ma bouche.\n\nIl m’apportait des œufs, vous le saviez ? Il me disait que vous faisiez les meilleures crêpes de la Crau.\n\nJe suis revenue. Tout le monde dit que c’est un miracle. Ce n’est pas un miracle. C’est un échange. On m’a rendue à mon mari en vous prenant votre fils.\n\nJe ne vous demande pas pardon. Je n’ai pas le droit. Je voulais que vous sachiez qu’il n’est pas mort pour rien.\n\nC’est pire. Il est mort pour moi.\n\nRose Castagne',
  },
  doc_credo_revenus: {
    titre: 'Sur le mur de l’église', style: 'manuscrit', lieu: 'vernegues', marqueur: 'mur_eglise',
    texte: '(À la chaux, sur le mur de l’église en ruine de Vieux-Vernègues, en lettres hautes comme un homme.)\n\nUN POUR UN.\n\n(Plus bas, plus petit, d’autres mains :)\nNous étions morts. Nous sommes revenus.\nLe village est mort en 1909. Il est revenu.\nIls nous ont brûlés dans leurs têtes avant de nous brûler.\nNous nous reconnaissons au froid.\nNous n’oublions pas qui nous a nourris.\n\n(Et, dans un coin, gratté au couteau : « Kylian Ruiz, 16 ans. » Personne n’a osé l’effacer.)',
  },
  doc_ordre_cautere: {
    titre: 'CAUTÈRE — ordre d’opération (extrait)', style: 'tape', lieu: 'ba701',
    texte: 'SECRET DÉFENSE — SPÉCIAL FRANCE\nÉTAT-MAJOR DES ARMÉES — CENTRE DE CONDUITE DES OPÉRATIONS\nORDRE D’OPÉRATION « CAUTÈRE »\nRÉF. : rapport du Dr M. Sérane (hôpital de Salon), 08/09 — note du ministère de la Santé, 11/09 — décision du Conseil de défense, 13/09\n\n1. SITUATION : zone d’exclusion sanitaire (ZES) au sud de la Durance. Population résiduelle non infectée estimée : < 2 000. Sujets infectés : > 400 000.\n2. MISSION : stériliser la ZES par le feu. Détruire l’ensemble des sujets, y compris INERTES.\n3. EXÉCUTION :\n   Phase 1 : tenue de la ligne Durance (PC Durance, Cdt Orsini). Aucun franchissement.\n   Phase 2 : au premier épisode de mistral ≥ 60 km/h, mise à feu le long de la Durance, le vent poussant le feu vers le sud, et largage de bombes incendiaires sur les rassemblements d’infectés (avions de la base aérienne 115, Orange).\n   Phase 3 : ratissage de la zone.\n4. POPULATION NON INFECTÉE : contrôle sanitaire au pont de Mallemort, à discrétion du commandant de secteur. Toute personne ayant été au contact d’un sujet « revenu » : cf. PROTOCOLE R.\n5. COMMUNICATION : « opération sanitaire d’ampleur exceptionnelle ». Aucune autre mention.',
  },
  doc_protocole_r: {
    titre: 'PROTOCOLE R', style: 'tape', lieu: 'ba701',
    texte: 'SECRET DÉFENSE — PROTOCOLE R (« REVENUS »)\n\nOBJET : conduite à tenir face aux sujets dits « revenus » et aux personnes informées.\n\n1. Il est établi (cf. rapport Sérane) qu’un sujet infecté ayant ingéré un adulte humain peut, après une phase d’inertie de 10 à 14 jours, retrouver sa conscience et sa mémoire.\n2. La divulgation de cette information hors de la ZES est de nature à provoquer : refus massif des familles de livrer les corps ; organisation de filières pour « nourrir » les infectés avec des vivants ; troubles graves à l’ordre public. Elle doit être empêchée PAR TOUS MOYENS.\n3. Les sujets « revenus » sont assimilés à des sujets infectés.\n4. Les personnes non infectées ayant connaissance de l’existence de sujets « revenus » seront isolées à l’issue du contrôle sanitaire. Durée : indéterminée.\n5. Le Dr M. Sérane doit être retrouvée et placée sous la garde du commandant de secteur.\n\n(Au stylo, en marge, une écriture d’officier : « Dieu nous pardonne. Moi, je ne me pardonnerai pas. » Signé d’un paraphe illisible.)',
  },
  doc_lettre_pilote: {
    titre: 'Lettre d’Athos 6, pilote de la Patrouille', style: 'manuscrit', lieu: 'ba701', marqueur: 'hangar_paf',
    texte: 'Ma Zoé,\n\nPapa est toujours à la base. On n’a pas le droit de décoller. Les avions sont au sol, tous les neuf, en rang, comme pour le 14 Juillet. On les regarde. On les astique. On fait le plein. Tous les matins, on attend l’ordre. Il ne vient pas.\n\nIls disent qu’ils vont brûler la région. Pas nous, la Patrouille : d’autres avions, ceux de la base d’Orange. On nous a dit qu’on ne pouvait pas voler au-dessus de ce qu’on allait brûler, que c’était « une question d’image ». Je n’ai jamais été aussi fier de ne pas avoir le droit de voler.\n\nJe vais m’asseoir dans mon avion ce soir. Juste pour m’asseoir. Si l’ordre vient, je serai prêt.\n\nTu te rappelles le meeting de Salon ? Le cœur que j’avais dessiné en fumée rouge, pour toi ? Je le redessinerai. Promis.\n\nPapa (Athos 6)',
  },
  doc_tract_armee: {
    titre: 'AVIS À LA POPULATION', style: 'imprime',
    texte: 'RÉPUBLIQUE FRANÇAISE\nAVIS À LA POPULATION DE LA ZONE D’EXCLUSION SANITAIRE\n\nUne opération sanitaire d’ampleur exceptionnelle va être conduite dans les prochains jours.\n\nLes personnes NON INFECTÉES sont invitées à se signaler au point de contrôle du PONT DE MALLEMORT, à l’aube du premier jour de vent fort, munies d’un tissu blanc.\n\nToute personne présentant une morsure, une plaie non expliquée ou de la fièvre ne pourra pas franchir.\n\nL’État ne vous oublie pas.\n\n(Au verso, imprimé en petits caractères : « Ce document ne peut être reproduit. »)',
  },
  doc_sms_mallemort: {
    titre: 'Un téléphone sur le pont', style: 'sms', lieu: 'mallemort', marqueur: 'voiture_refugies',
    texte: 'KARINE → CHRIS (18/09, 06:02) : on est au pont de mallemort. y a les soldats de l’autre côté\nKARINE → CHRIS (06:10) : ils disent de reculer. on est 30. y a des bébés\nKARINE → CHRIS (06:14) : un monsieur a traversé en courant avec son fils. ils ont tiré\nKARINE → CHRIS (06:15) : ils ont tiré sur le petit aussi\nKARINE → CHRIS (06:31) : on attend. personne bouge\nKARINE → CHRIS (09:47) : y a du réseau au milieu du pont. je t’envoie ça du milieu. ils me voient. ils tirent pas encore\nKARINE → CHRIS (09:48) : je t’aime. dis aux petits que maman a essa\n(Message partiellement distribué.)',
  },
  doc_imbert: {
    titre: 'Sur la porte de la chambre froide', style: 'manuscrit', lieu: 'senas', marqueur: 'porte_chambre_froide',
    texte: '(À la craie, sur l’isolant de la porte de la chambre froide, à l’intérieur.)\n\nJour 1 — 11 personnes. 400 kg de pommes. 60 L d’eau.\nJour 6 — Les morts sont passés. On n’a pas respiré. Ils sont repartis.\nJour 14 — Ils sont repassés. Pareil.\nJour 20 — Plus que 12 L d’eau. Les pommes, on n’en peut plus.\nJour 21 — Lina a eu 5 ans. On lui a fait une compote avec une bougie dedans.\n\nLa règle : on ne sort pas. On n’ouvre pas. On ne sonne pas. On attend que ça passe.\n\nÇa va passer.',
  },

  // ═══════════════ PAYS SALONAIS — lieux secondaires ═══════════════
  doc_soigneur_barben: {
    titre: 'Cahier de soins — secteur fauves', style: 'carnet', lieu: 'la_barben',
    texte: 'PARC ANIMALIER — SECTEUR FAUVES — CAHIER DE SOINS\n\n03/09 — Nourrissage normal. Les lions sont nerveux à cause des sirènes.\n05/09 — Plus de livraison de viande. Poulets du stock.\n08/09 — Stock épuisé. Je suis seul. Les autres sont partis.\n10/09 — J’ai ouvert les enclos. Les lions, les loups, les hyènes. Je ne pouvais pas les regarder mourir de faim derrière un grillage. Qu’ils aillent chasser. Il y a de la viande partout, maintenant.\n10/09 — Les lions sont sortis en marchant, sans se presser. Le vieux mâle s’est retourné une fois. Je jure qu’il m’a remercié.\n11/09 — Il y a un mort qui rôde autour de ma cabane. Je le connais : c’était un visiteur, il avait une casquette du parc.',
  },
  doc_aerodrome: {
    titre: 'Plan de vol déposé', style: 'tape', lieu: 'aerodrome',
    texte: 'AÉRODROME SALON-EYGUIÈRES (LFNE) — PLAN DE VOL\nAppareil : DR400, F-G…\nDépart : LFNE, 04/09, 06:40 locale\nDestination : Ajaccio (LFKJ)\nPersonnes à bord : 4 (dont 2 enfants)\nAutonomie : 5 h\nRemarques : NON AUTORISÉ — ESPACE AÉRIEN FERMÉ\n\n(Au stylo, en travers : « Décollé quand même. Si on nous abat, on nous abat. Mieux que d’attendre. » L’avion n’est plus dans le hangar.)',
  },
  doc_istres: {
    titre: 'Dernier message de la BA 125', style: 'tape', lieu: 'istres',
    texte: 'MESSAGE — BA 125 ISTRES — FLASH\n10/09 — 23:52\n\nLA BASE N’EST PLUS TENABLE. INFECTION À L’INTÉRIEUR DU PÉRIMÈTRE DEPUIS 20:00. DERNIER RAVITAILLEUR DÉCOLLÉ À 23:30 AVEC 211 PERSONNES.\nIL RESTE AU SOL ENVIRON 900 PERSONNELS. NOUS FERMONS LES HANGARS DE L’INTÉRIEUR.\nNE PAS ENVOYER D’APPAREIL.\nFIN DE MESSAGE.\n\nVIVE LA RÉPUBLIQUE. ET DITES À NOS FAMILLES…\n(Transmission interrompue.)',
  },
  doc_poudrerie: {
    titre: 'Plaque commémorative — 1936', style: 'imprime', lieu: 'saint_chamas',
    texte: 'POUDRERIE ROYALE DE SAINT-CHAMAS\n1690 — 1974\n\nÀ la mémoire des 53 ouvrières et ouvriers morts dans l’explosion du 16 septembre 1936.\n\n(Quelqu’un a écrit dessous, à la peinture : « ET DES AUTRES. On a tout fait sauter le 15/09 pour arrêter les morts sur le pont. Ça a marché une heure. »)',
  },
  doc_berre: {
    titre: 'Alerte Seveso — consignes', style: 'imprime', lieu: 'berre',
    texte: 'SITE CLASSÉ SEVESO SEUIL HAUT\nEN CAS D’ALERTE (sirène : son montant et descendant de 1 min 41 s) :\n- Mettez-vous à l’abri dans un bâtiment\n- Fermez portes et fenêtres\n- N’allez pas chercher vos enfants à l’école\n- Écoutez la radio\n\n(La sirène sonne en continu depuis des jours, alimentée par une batterie de secours. Les morts de tout l’étang tournent autour du site, le nez en l’air. Quelqu’un a écrit sur le panneau : « Merci pour la sirène. Elle nous a sauvé la vie : elle les attire tous ici, loin de nos maisons. »)',
  },
  doc_triage: {
    titre: 'Bulletin de composition — train 44721', style: 'tape', lieu: 'miramas',
    texte: 'SNCF FRET — TRIAGE DE MIRAMAS\nTrain 44721 — Miramas → Lyon-Sibelin\nComposition : 22 wagons frigorifiques (fruits, Sénas), 8 citernes\nDépart prévu : 02/09, 14:10\nDépart réel : —\n\n(Au stylo : « Le train n’est pas parti. Les wagons frigo ne sont plus froids depuis le 6. On a ouvert. Tout Miramas a mangé des pêches pendant trois jours. C’était la dernière bonne chose. »)',
  },
  doc_miramas_vieux: {
    titre: 'Sur la porte Notre-Dame', style: 'manuscrit', lieu: 'miramas_le_vieux',
    texte: '(Sur la porte du village perché, à la peinture blanche.)\n\nICI IL Y AVAIT UN REFUGE.\nIl a tenu onze jours.\nLa radio continue de passer notre message en boucle. On n’a pas eu le cœur de l’arrêter.\nSi vous êtes venus pour ça : pardon.\nLa voie ferrée ne mène plus nulle part.',
  },
  doc_pelissanne: {
    titre: 'Mot du boulanger', style: 'manuscrit', lieu: 'pelissanne',
    texte: 'FERMÉ.\n\nJ’ai fait une dernière fournée le 3 au matin. Il reste du pain dans la réserve, il est dur comme du bois. Trempez-le.\n\nJe pars chez ma fille à Pertuis. Si le pont est fermé, je nagerai.\n\nLe levain est dans le frigo. Il est vivant. Il a quarante ans. Si quelqu’un sait faire, qu’il le garde en vie. C’est tout ce que je demande.',
  },
  doc_aurons: {
    titre: 'Registre de la mairie d’Aurons', style: 'manuscrit', lieu: 'aurons',
    texte: 'MAIRIE D’AURONS — REGISTRE DES DÉLIBÉRATIONS\nSéance extraordinaire du 4 septembre\nPrésents : tout le village (84 habitants)\n\nDélibération n° 1 : la route d’accès est coupée par deux tracteurs et une moissonneuse. Adopté à l’unanimité.\nDélibération n° 2 : personne n’entre. Adopté (81 pour, 3 contre).\nDélibération n° 3 : personne ne sort. Adopté.\n\nSéance du 20 septembre\nPrésents : 71.\nDélibération n° 1 : les 13 absents sont excusés.',
  },
  doc_eyguieres: {
    titre: 'Carte postale', style: 'manuscrit', lieu: 'eyguieres',
    texte: '(Une carte postale des Alpilles, jamais postée.)\n\nChère Mamie,\nIci c’est super, il fait beau, on a fait la rando des Opies avec papa, on voit jusqu’à la mer. Demain on va au marché de Salon.\nGros bisous,\nEmma\n\n(Datée du 1er septembre.)',
  },
  doc_grans: {
    titre: 'Lettre du moulin', style: 'manuscrit', lieu: 'grans',
    texte: 'On a remis la roue du vieux moulin en marche, sur la Touloubre. Ça fait du bruit, un bruit de bois et d’eau, jour et nuit. Les morts viennent l’écouter, ils se mettent en rang sur la berge et ils regardent tourner la roue.\n\nPendant ce temps-là, ils ne regardent pas nos fenêtres.\n\nC’est Baptistin, le berger, qui nous a appris ça, avant de partir avec ses cloches. Il a dit : « Ils aiment ce qui tourne en rond. Comme nous. »',
  },
  doc_lancon: {
    titre: 'Ticket de péage', style: 'imprime', lieu: 'lancon',
    texte: 'AUTOROUTE A7 — BARRIÈRE DE LANÇON\nEntrée : SALON-NORD\nDate : 02/09/2026 — 11:48\nClasse : 1\n\n(Le ticket est coincé dans un pare-soleil. Dans la file, sur sept voies, trois kilomètres de voitures, portières ouvertes. Au dos du ticket, au stylo bille : « On n’a pas pu payer. La barrière ne s’est jamais levée. »)',
  },
  doc_cornillon: {
    titre: 'Carnet d’un guetteur', style: 'carnet', lieu: 'cornillon',
    texte: 'Du haut de Cornillon, on voit tout : l’étang, la Crau, Istres, Miramas, la fumée de Salon.\n\n15/09 — Un troupeau de moutons traverse la Crau vers le nord. Non. Pas des moutons.\n17/09 — Il grossit. Il passe à Grans. Il y a des gens devant, avec des lumières.\n20/09 — Des avions très haut. Ils tournent. Ils photographient.\n23/09 — Le vent n’est pas encore là. Les vieux disent que quand il arrivera, il faudra être loin des pins.\n24/09 — J’ai commencé à couper les pins autour du village. Seul. Ça va prendre du temps.',
  },
  doc_cimetiere_manieres: {
    titre: 'Plan des chapelles réquisitionnées', style: 'imprime', lieu: 'cimetiere',
    texte: 'PLAN — CIMETIÈRE SAINT-ROCH — CHAPELLES RÉQUISITIONNÉES (LOT 14)\n\nAllée des Pins : ROUX-BÉRENGER (4 housses), ESTÈVE (6), CASTELLAN (5)\nAllée du Rocher : ISNARD (3), FAMILLE X (tombe sans nom, 2)\nEsplanade : conteneurs A et B (192)\n\nClés : loge du gardien.',
  },
  doc_page_14: {
    titre: 'Page quatorze', style: 'manuscrit',
    texte: 'p. 14 — DONNEUR POUR P4\n\nARNAUD Luc, 51 ans, électricien, Lamanon.\nFracture ouverte du tibia droit depuis 2 jours. Plaie infectée. Fièvre : 38,2 °C.\nAntibiotiques : amoxicilline (sa propre boîte). Il s’en serait probablement sorti.\n\nP4 : transformation il y a 5 jours. La fenêtre des 48 h est dépassée pour P3, à la limite pour P4. Aucun autre donneur avant deux jours au moins.\n\nDÉCISION : je choisis M. Arnaud. Sédation profonde (morphine, 40 mg). Il n’a pas eu mal. Je me le répète : il n’a pas eu mal.\n\nIl s’est quand même réveillé au son de la cloche. Il a regardé P4. Il a dit « Jo ». Je ne sais pas qui est Jo.\n\nNourrissage : 11/09, 03 h 10.\n\nJ’arrache cette page. Si P4 se réveille, P4 n’a pas besoin de savoir ça. Personne n’a besoin de savoir ça. Moi, je la garde. C’est à moi de la porter.\n\n— M. S.',
  },
};
