// ============ CINÉMATIQUES — scripts (REFONTE §4.11) ============
// Écrit par le scénariste, mis en images par l'agent cinématiques (js/cine/). Chaque `decor` est un id de scène en
// parallaxe (js/cine/scenes/<id>.js) décrit dans docs/HISTOIRE.md, section « Briefs des décors ».
//
// Plan : { decor, camera: { de: {x, y?, zoom}, vers: {x, y?, zoom} }, duree (ms), effets: [...], anim: [...],
//          texte (sous-titre), attendre (bool : bouton « Continuer » à la fin du plan), titre? (carton de titre, optionnel) }
//   x, y : 0..1 (position du centre de la caméra dans le décor) ; zoom : 1 = décor entier.
// Effets globaux (communs à tous les décors) : grain, vignette_pulse, flash_rouge, fondu_noir, fondu_blanc, fumee,
//   braises, cendres, poussiere, mistral, chaleur, lueur_lampe, brouillard_bas, etoiles, secousse.
// Animations : propres à chaque décor (liste dans HISTOIRE.md). Musique : titre | calme | sombre | tension | combat | mort | refuge.
// Les anciennes cinématiques (panoramas js/art/panoramas/) sont remplacées.

export const DECORS = [
  // cinématiques
  'salon_marche', 'salon_mercredi', 'couloir_hopital', 'salon_mistral_vide', 'housse_noir',
  'place_crousillat_nuit', 'horloge_sommet', 'salon_aube_toits', 'salle_quatre', 'cours_troupeau',
  'emperi_siege', 'emperi_remparts_aube', 'route_jean_moulin', 'cales_falaises', 'vernegues_ruines',
  'ba701_tarmac', 'crau_mistral', 'durance_pont', 'ligne_de_feu', 'camp_refugies', 'gymnase_froid',
  'troupeau_feu', 'estive_ventoux',
  // vignettes de scènes (plans fixes, moins de couches)
  'cimetiere_caveau', 'saint_roch_nuit', 'cours_nuit', 'nostradamus_cabinet', 'emperi_cour', 'montee_puech',
  'collegiale_nef', 'hopital_parvis', 'hopital_sous_sol', 'cales_grande_salle', 'senas_station', 'plaine_route',
  'nuit_campagne',
];

export const CINEMATIQUES = {

  // ─────────── Nouvelle partie ───────────
  intro: { musique: 'titre', plans: [
    { decor: 'salon_marche', camera: { de: { x: 0.08, zoom: 1.35 }, vers: { x: 0.55, zoom: 1.1 } }, duree: 9000,
      effets: ['grain'], anim: ['foule_marche', 'platanes_brise', 'pigeons_envol', 'fontaine_coule'],
      texte: 'Salon-de-Provence. Mercredi 2 septembre, jour de grand marché.' },
    { decor: 'salon_mercredi', camera: { de: { x: 0.3, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.4 } }, duree: 8000,
      effets: ['grain', 'secousse'], anim: ['foule_court', 'etals_renverses', 'silhouette_penchee'],
      texte: 'À 10 h 40, sur le cours Carnot, une femme mord son mari. Les gens mordus meurent en quelques heures… puis se relèvent, et mordent à leur tour.' },
    { decor: 'couloir_hopital', camera: { de: { x: 0.2, zoom: 1.5 }, vers: { x: 0.6, zoom: 1.2 } }, duree: 8000,
      effets: ['grain', 'vignette_pulse'], anim: ['neon_clignote', 'clochette_tremble', 'main_billet'],
      texte: 'À l’hôpital, une médecin nourrit ses malades au son d’une clochette. Puis elle glisse un mot plié dans la poche d’un mort.' },
    { decor: 'salon_mistral_vide', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['grain', 'poussiere'], anim: ['platanes_vent', 'journal_vole', 'drone_passe'],
      texte: 'Trois semaines plus tard, Salon est une ville morte. L’armée a reculé au nord, derrière la Durance. Elle attend le vent.' },
    { decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['fermeture_eclair', 'souffle_plastique'],
      texte: 'Au cimetière, dans une housse mortuaire, un cœur arrêté depuis des jours se remet à battre. C’est le tien.', attendre: true },
    { decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.25 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 4000,
      effets: ['fondu_noir'], anim: [], titre: 'One More Day', texte: '', attendre: true },
  ] },

  // ─────────── Prologue ───────────
  pro_cloches: { musique: 'tension', plans: [
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, y: 0.8, zoom: 1.5 }, vers: { x: 0.5, y: 0.25, zoom: 1.2 } }, duree: 6000,
      effets: ['lueur_lampe'], anim: ['cloches_balancent', 'fontaine_coule'],
      texte: 'La première cloche sonne si fort que tu la sens vibrer dans tes dents.' },
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.05 } }, duree: 7000,
      effets: ['grain'], anim: ['cloches_balancent', 'silhouettes_convergent'],
      texte: 'Puis la deuxième, puis la troisième : des tonnes de bronze qui appellent tout Salon.' },
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.5, y: 0.6, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['silhouettes_convergent', 'porte_entrouverte'],
      texte: 'Les morts sortent des rues, des porches, des terrasses. Ils viennent tous vers le bruit.', attendre: true },
  ] },

  pro_sommet: { musique: 'sombre', plans: [
    { decor: 'horloge_sommet', camera: { de: { x: 0.1, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['etoiles'], anim: ['foule_immobile', 'cloches_immobiles'],
      texte: 'Sous la tour, la foule des morts ne repart pas. Des centaines de visages restent levés vers les cloches, qui se sont tues.' },
    { decor: 'horloge_sommet', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.25 } }, duree: 8000,
      effets: ['etoiles', 'fumee'], anim: ['incendie_lointain'],
      texte: 'Plus loin, sur son rocher, le château de l’Empéri. Une seule fenêtre est éclairée : là-bas, il y a des vivants.' },
    { decor: 'horloge_sommet', camera: { de: { x: 0.85, zoom: 1.25 }, vers: { x: 0.98, zoom: 1.45 } }, duree: 6000,
      effets: ['etoiles'], anim: ['cadran_21h10'],
      texte: 'L’horloge marque neuf heures dix. Elle s’est arrêtée le premier soir, et elle ne repartira plus.', attendre: true },
  ] },

  // ─────────── Chapitre 1 ───────────
  ch1_intro: { musique: 'calme', plans: [
    { decor: 'salon_aube_toits', camera: { de: { x: 0.05, zoom: 1.3 }, vers: { x: 0.45, zoom: 1.1 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'fumees_droites'], titre: 'Chapitre 1 — Les vivants',
      texte: 'Mercredi 23 septembre. Trois semaines jour pour jour après le Mercredi, le jour où tout a commencé.' },
    { decor: 'salon_aube_toits', camera: { de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'linge_emperi'],
      texte: 'Il ne reste à Salon qu’une trentaine de vivants, tous réfugiés dans le château de l’Empéri.' },
    { decor: 'salon_aube_toits', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.97, zoom: 1.4 } }, duree: 7000,
      effets: [], anim: ['platanes_immobiles'],
      texte: 'Et le vent, pour l’instant, ne souffle pas.', attendre: true },
  ] },

  souvenir_cloche: { musique: 'mort', plans: [
    { decor: 'salle_quatre', camera: { de: { x: 0.5, zoom: 1.6 }, vers: { x: 0.5, zoom: 1.5 } }, duree: 2500,
      effets: ['flash_rouge', 'grain'], anim: ['clochette_agitee'], texte: 'Une clochette tinte. Un souvenir remonte.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.3, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.2 } }, duree: 5000,
      effets: ['vignette_pulse', 'grain'], anim: ['sangles_tirent'],
      texte: 'Le froid. Des sangles qui t’attachent. Une faim si grande qu’elle a des dents.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.7, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.4 } }, duree: 6000,
      effets: ['vignette_pulse', 'grain'], anim: ['brancard_approche'],
      texte: 'On pousse un brancard vers toi. Un homme est allongé dessus, une jambe dans une attelle. Il ne crie pas.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.6, zoom: 1.4 }, vers: { x: 0.6, zoom: 1.8 } }, duree: 6000,
      effets: ['fondu_noir'], anim: ['visage_homme'],
      texte: 'Il te regarde et dit un seul mot, doucement, comme pour s’excuser : « Jo. »', attendre: true },
  ] },

  nuit_sonnailles: { musique: 'tension', plans: [
    { decor: 'cours_troupeau', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.35, zoom: 1.15 } }, duree: 7000,
      effets: ['etoiles', 'poussiere'], anim: ['troupeau_coule', 'lampes_de_tete'],
      texte: 'Les morts arrivent par le cours Victor-Hugo, sous les platanes. Ils remplissent la rue d’un trottoir à l’autre. Des milliers.' },
    { decor: 'cours_troupeau', camera: { de: { x: 0.35, zoom: 1.15 }, vers: { x: 0.6, zoom: 1.45 } }, duree: 7000,
      effets: ['poussiere'], anim: ['sonnailleurs_marchent', 'troupeau_coule'],
      texte: 'En tête, des silhouettes marchent bien droit, une cloche de mouton au cou et une lampe à la main. Elles ne marchent pas comme les morts.' },
    { decor: 'cours_troupeau', camera: { de: { x: 0.6, zoom: 1.45 }, vers: { x: 0.95, zoom: 1.2 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['troupeau_tourne', 'emperi_lointain'],
      texte: 'Toutes les dix secondes, une grosse cloche sonne, plus grave que les autres. Bong. La foule tourne vers le rocher de l’Empéri.', attendre: true },
  ] },

  aube_troupeau: { musique: 'sombre', plans: [
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 8000,
      effets: ['brouillard_bas', 'fumee'], anim: ['troupeau_s_eloigne'],
      texte: 'À l’aube, la foule des morts quitte Salon par la route d’Avignon. Elle emmène avec elle tous les morts de la ville.' },
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.85, zoom: 1.6 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['berger_marche', 'chiens_tournent', 'redon_balance'],
      texte: 'En tête marche un vieux berger, avec son bâton et deux chiens. À côté de lui, une petite femme serre une énorme cloche contre sa poitrine, comme un enfant.' },
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.85, zoom: 1.6 }, vers: { x: 0.9, zoom: 1.2 } }, duree: 6000,
      effets: [], anim: ['troupeau_s_eloigne'],
      texte: 'Bong. Toutes les dix secondes. Le troupeau des morts part vers le nord.', attendre: true },
  ] },

  // ─────────── Chapitre 2 ───────────
  ch2_intro: { musique: 'calme', plans: [
    { decor: 'route_jean_moulin', camera: { de: { x: 0.3, y: 0.7, zoom: 1.5 }, vers: { x: 0.5, y: 0.3, zoom: 1.15 } }, duree: 8000,
      effets: ['poussiere'], anim: ['drap_claque'], titre: 'Chapitre 2 — La transhumance',
      texte: 'À la sortie nord de Salon, la statue de Jean Moulin lève les bras au ciel. Quelqu’un lui a noué un drap blanc aux poignets.' },
    { decor: 'plaine_route', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 8000,
      effets: [], anim: ['file_marcheurs'],
      texte: 'Une file d’enfants et d’adultes traverse les oliveraies, loin de la route. Ils portent des sacs, des bidons et des sabres pris dans un musée.' },
    { decor: 'cales_falaises', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.55, zoom: 1.1 } }, duree: 8000,
      effets: ['fumee'], anim: ['feux_grottes', 'echelle_corde', 'linge_seche'],
      texte: 'Au-dessus de Lamanon, deux falaises percées de cent seize grottes. Des feux y brûlent : il y a des vivants.' },
    { decor: 'cales_falaises', camera: { de: { x: 0.55, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.35 } }, duree: 6000,
      effets: [], anim: ['feux_grottes'],
      texte: 'Au sud, au loin, porté par le vent : bong. Le troupeau n’est pas loin.', attendre: true },
  ] },

  vernegues: { musique: 'sombre', plans: [
    { decor: 'vernegues_ruines', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.05 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent'],
      texte: 'Le village de Vieux-Vernègues a été détruit une première fois par le tremblement de terre du 11 juin 1909, à neuf heures dix du soir.' },
    { decor: 'vernegues_ruines', camera: { de: { x: 0.4, zoom: 1.05 }, vers: { x: 0.75, zoom: 1.3 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent', 'revenus_assis'],
      texte: 'Ce soir, des centaines de bougies brûlent dans ses caves. Entre les ruines, des gens mangent et jouent aux cartes. Ce sont des revenus, comme toi.' },
    { decor: 'vernegues_ruines', camera: { de: { x: 0.75, zoom: 1.3 }, vers: { x: 0.95, zoom: 1.6 } }, duree: 6000,
      effets: [], anim: ['inscription_chaux'],
      texte: 'Sur le mur de l’église, écrit à la chaux : UN POUR UN.', attendre: true },
  ] },

  ba701: { musique: 'tension', plans: [
    { decor: 'ba701_tarmac', camera: { de: { x: 0.0, zoom: 1.4 }, vers: { x: 0.3, zoom: 1.15 } }, duree: 7000,
      effets: ['chaleur'], anim: ['fouga_mat', 'corps_balance'],
      texte: 'Au rond-point de l’École de l’air, le vieil avion-monument pointe le nez vers le ciel. Il ne volera plus.' },
    { decor: 'ba701_tarmac', camera: { de: { x: 0.3, zoom: 1.15 }, vers: { x: 0.75, zoom: 1.1 } }, duree: 8000,
      effets: ['chaleur'], anim: ['manche_a_air', 'drapeau_mat'],
      texte: 'Sur la piste, les neuf avions de la Patrouille de France sont alignés, cockpits fermés.' },
    { decor: 'ba701_tarmac', camera: { de: { x: 0.75, zoom: 1.1 }, vers: { x: 0.95, zoom: 1.5 } }, duree: 6000,
      effets: [], anim: ['rangers_alignees'],
      texte: 'Sur le parking, trois cents paires de chaussures militaires cirées, rangées par pointure. Personne n’est resté pour expliquer.', attendre: true },
  ] },

  // ─────────── Final ───────────
  le_mistral: { musique: 'tension', plans: [
    { decor: 'crau_mistral', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'poussiere'], anim: ['herbes_couchees', 'nuages_filent'], titre: 'Le mistral',
      texte: 'Le mistral descend la vallée du Rhône, sec et froid. Il souffle trois, six ou neuf jours, disent les anciens. Pour tout brûler, l’armée n’a besoin que d’un jour.' },
    { decor: 'crau_mistral', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.3 } }, duree: 7000,
      effets: ['mistral'], anim: ['cypres_plient', 'colonne_marche'],
      texte: 'Le ciel est d’un bleu dur. Les cyprès se plient. La colonne des réfugiés de Calès se met en marche vers la Durance.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['avions_passent', 'flammes_avancent'],
      texte: 'Au nord, sur la base aérienne d’Orange, des avions font chauffer leurs moteurs.', attendre: true },
  ] },

  pont_mallemort: { musique: 'tension', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral'], anim: ['cables_vibrent', 'eau_ecume'],
      texte: 'Le pont suspendu de Mallemort vibre dans le vent. Il chante une note grave qu’on sent monter par les pieds.' },
    { decor: 'durance_pont', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.35 } }, duree: 7000,
      effets: ['mistral'], anim: ['colonne_traverse', 'projecteurs'],
      texte: 'Un par un, les vivants de Calès avancent sur les planches, vers les projecteurs de la rive nord.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.3, zoom: 1.05 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['troupeau_arrive', 'flammes_avancent'],
      texte: 'Derrière eux arrive le troupeau des morts. Et derrière le troupeau, tout le ciel brûle.', attendre: true },
  ] },

  // ─────────── Les fins ───────────
  fin_cautere: { musique: 'sombre', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.6, zoom: 1.2 }, vers: { x: 0.2, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['herse_tombe', 'pont_routier_saute'],
      texte: 'Au bout du pont, la grille de fer tombe. Plus loin, le pont routier explose.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['mistral', 'braises', 'cendres', 'chaleur'], anim: ['flammes_avancent', 'troupeau_brule', 'berger_immobile'],
      texte: 'Sur la rive sud, le Berger regarde l’eau. Puis le feu arrive.' },
    { decor: 'camp_refugies', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.1 } }, duree: 8000,
      effets: ['cendres'], anim: ['tentes_vent', 'fumee_cuisine'],
      texte: 'Six semaines plus tard, dans un camp de tentes au bord du Rhône.' },
    { decor: 'camp_refugies', camera: { de: { x: 0.6, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['cloche_chapelle'],
      texte: 'Dimanche, dix heures. La cloche de l’église sonne.', attendre: true },
  ] },

  fin_voix: { musique: 'tension', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.5, y: 0.7, zoom: 1.8 }, vers: { x: 0.5, y: 0.7, zoom: 1.5 } }, duree: 5000,
      effets: ['mistral'], anim: ['telephone_envoye'],
      texte: 'Vidéo envoyée.' },
    { decor: 'durance_pont', camera: { de: { x: 0.5, zoom: 1.5 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 7000,
      effets: ['fondu_blanc'], anim: ['ecrans_s_allument'],
      texte: 'En une heure, cent mille personnes l’ont vue. En une nuit, cent millions. En trois jours, la terre entière.' },
    { decor: 'gymnase_froid', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.6, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['file_familles', 'buee_respiration'],
      texte: 'Trois mois plus tard, dans un gymnase réfrigéré, quatre cents housses blanches sont alignées sur le terrain de basket.' },
    { decor: 'gymnase_froid', camera: { de: { x: 0.6, zoom: 1.05 }, vers: { x: 0.95, zoom: 1.45 } }, duree: 6000,
      effets: [], anim: ['affiche_don'],
      texte: 'Sur l’affiche : LE DON, UN ACTE RESPONSABLE. Personne ne dit ce qu’on donne.', attendre: true },
  ] },

  fin_transhumance_feu: { musique: 'mort', plans: [
    { decor: 'troupeau_feu', camera: { de: { x: 0.9, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['mistral', 'braises'], anim: ['troupeau_suit', 'redon_leve'],
      texte: 'Bong. Onze mille morts tournent la tête en même temps.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.2, zoom: 1.3 } }, duree: 8000,
      effets: ['mistral', 'braises', 'chaleur'], anim: ['rose_bras', 'flammes_avancent'],
      texte: 'Tu marches devant eux, vers le feu. Rose te tient le bras, comme une vieille dame qu’on accompagne à l’église.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.05, zoom: 1.8 } }, duree: 7000,
      effets: ['chaleur', 'fondu_blanc'], anim: ['silhouette_dans_flammes'],
      texte: 'Tu connais le chemin.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 5000,
      effets: ['cendres'], anim: ['cloche_au_sol'],
      texte: 'Cette fois, tu ne reviendras pas.', attendre: true },
  ] },

  fin_transhumance_estive: { musique: 'sombre', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.2, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['conteneurs_basculent', 'troupeau_traverse'],
      texte: 'Le mur de conteneurs tient une minute. Puis la marée des morts passe le fleuve.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['troupeau_monte', 'redon_balance'],
      texte: 'Onze jours plus tard, au pied du mont Ventoux.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.7, zoom: 1.5 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['revenus_se_redressent'],
      texte: 'Chaque matin, dans la foule, quelqu’un se redresse, regarde ses mains, et demande de l’eau.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.7, zoom: 1.5 }, vers: { x: 0.9, y: 0.2, zoom: 1.2 } }, duree: 7000,
      effets: [], anim: ['sommet_blanc'],
      texte: 'Là-haut, le sommet du Ventoux est blanc comme un os. Un jour de plus.', attendre: true },
  ] },
};
