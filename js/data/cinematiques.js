// ============ CINÉMATIQUES — scripts (REFONTE §4.11) ============
// Écrit par le scénariste, mis en images par l'agent cinématiques (js/cine/). Chaque `decor` est un id de scène en
// parallaxe (js/cine/scenes/<id>.js) décrit dans docs/HISTOIRE.md, section « Briefs des décors ».
//
// Plan : { clip?, decor, camera: { de: {x, y?, zoom}, vers: {x, y?, zoom} }, duree (ms), effets: [...], anim: [...],
//          texte (sous-titre), attendre (bool : bouton « Continuer » à la fin du plan), titre? (carton de titre, optionnel) }
//   x, y : 0..1 (position du centre de la caméra dans le décor) ; zoom : 1 = décor entier.
//   clip : plan TOURNÉ dans Blender (img/cine/clips/<clip>.webm, tools/blender/cine/plans.py) joué à la place du décor dessiné ;
//          le décor dessiné reste le repli si la vidéo manque.
//   clip : plan TOURNÉ dans Blender (img/cine/clips/<clip>.webm, tools/blender/cine/plans.py) joué à la place du décor dessiné ;
//          le décor dessiné reste le repli si la vidéo manque.
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
    { clip: 'intro_1', decor: 'salon_marche', camera: { de: { x: 0.08, zoom: 1.35 }, vers: { x: 0.55, zoom: 1.1 } }, duree: 9000,
      effets: ['grain'], anim: ['foule_marche', 'platanes_brise', 'pigeons_envol', 'fontaine_coule'],
      texte: 'Salon-de-Provence. Mercredi 2 septembre, jour de grand marché.' },
    { clip: 'intro_2', decor: 'salon_mercredi', camera: { de: { x: 0.3, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.4 } }, duree: 8000,
      effets: ['grain', 'secousse'], anim: ['foule_court', 'etals_renverses', 'silhouette_penchee'],
      texte: 'À 10 h 40, sur le cours Carnot, une femme mord son mari. Les gens mordus meurent en quelques heures, puis ils se relèvent et mordent à leur tour.' },
    { clip: 'intro_3', decor: 'couloir_hopital', camera: { de: { x: 0.2, y: 0.5, zoom: 1.5 }, vers: { x: 0.6, y: 0.95, zoom: 1.3 } }, duree: 8400,
      effets: ['grain', 'vignette_pulse'], anim: ['neon_clignote', 'clochette_tremble', 'main_billet'],
      texte: 'À l’hôpital, une médecin nourrit ses malades au son d’une clochette, puis elle glisse un mot plié dans la poche d’un mort.' },
    { clip: 'intro_4', decor: 'salon_mistral_vide', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['grain', 'poussiere'], anim: ['platanes_vent', 'journal_vole', 'drone_passe'],
      texte: 'Trois semaines plus tard, Salon est une ville morte. L’armée a reculé au nord, derrière la Durance, et elle attend le vent.' },
    { clip: 'intro_5', decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['fermeture_eclair', 'souffle_plastique'],
      texte: 'Au cimetière, dans une housse mortuaire, un cœur arrêté depuis des jours se remet à battre : c’est le tien.', attendre: true },
    { clip: 'intro_6', decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.25 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 4000,
      effets: ['fondu_noir'], anim: [], titre: 'One More Day', texte: '', attendre: true },
  ] },

  // ─────────── Prologue ───────────
  pro_cloches: { musique: 'tension', plans: [
    { clip: 'pro_cloches_1', decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, y: 0.8, zoom: 1.5 }, vers: { x: 0.5, y: 0.25, zoom: 1.2 } }, duree: 6000,
      effets: ['lueur_lampe'], anim: ['cloches_balancent', 'fontaine_coule'],
      texte: 'La première cloche sonne si fort que tu la sens vibrer dans tes dents.' },
    { clip: 'pro_cloches_2', decor: 'place_crousillat_nuit', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.05 } }, duree: 7000,
      effets: ['grain'], anim: ['cloches_balancent', 'silhouettes_convergent'],
      texte: 'Puis la deuxième sonne, et la troisième : des tonnes de bronze qui appellent tout Salon.' },
    { clip: 'pro_cloches_3', decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.5, y: 0.6, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['silhouettes_convergent', 'porte_entrouverte'],
      texte: 'Les morts sortent des rues, des porches et des terrasses, et ils viennent tous vers le bruit.', attendre: true },
  ] },

  pro_sommet: { musique: 'sombre', plans: [
    { clip: 'pro_sommet_1', decor: 'horloge_sommet', camera: { de: { x: 0.1, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['etoiles'], anim: ['foule_immobile', 'cloches_immobiles'],
      texte: 'Sous la tour, la foule des morts ne repart pas : des centaines de visages restent levés vers les cloches, qui se sont tues.' },
    { clip: 'pro_sommet_2', decor: 'horloge_sommet', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.25 } }, duree: 8000,
      effets: ['etoiles', 'fumee'], anim: ['incendie_lointain'],
      texte: 'Plus loin, sur son rocher, se dresse le château de l’Empéri, où une seule fenêtre est éclairée : là-bas, il y a des vivants.' },
    { clip: 'pro_sommet_3', decor: 'horloge_sommet', camera: { de: { x: 0.85, zoom: 1.25 }, vers: { x: 0.98, zoom: 1.45 } }, duree: 6000,
      effets: ['etoiles'], anim: ['cadran_21h10'],
      texte: 'L’horloge marque neuf heures dix. Elle s’est arrêtée le premier soir, et elle ne repartira plus.', attendre: true },
  ] },

  // ─────────── Chapitre 1 ───────────
  ch1_intro: { musique: 'calme', plans: [
    { clip: 'ch1_intro_1', decor: 'salon_aube_toits', camera: { de: { x: 0.05, zoom: 1.3 }, vers: { x: 0.45, zoom: 1.1 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'fumees_droites'], titre: 'Chapitre 1 — Les vivants',
      texte: 'Nous sommes le mercredi 23 septembre, trois semaines jour pour jour après le Mercredi, le jour où tout a commencé.' },
    { clip: 'ch1_intro_2', decor: 'salon_aube_toits', camera: { de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'linge_emperi'],
      texte: 'Il ne reste à Salon qu’une trentaine de vivants, tous réfugiés dans le château de l’Empéri.' },
    { clip: 'ch1_intro_3', decor: 'salon_aube_toits', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.97, zoom: 1.4 } }, duree: 7000,
      effets: [], anim: ['platanes_immobiles'],
      texte: 'Et le vent, pour l’instant, ne souffle pas.', attendre: true },
  ] },

  souvenir_cloche: { musique: 'mort', plans: [
    { clip: 'souvenir_cloche_1', decor: 'salle_quatre', camera: { de: { x: 0.5, zoom: 1.6 }, vers: { x: 0.5, zoom: 1.5 } }, duree: 2500,
      effets: ['flash_rouge', 'grain'], anim: ['clochette_agitee'], texte: 'Une clochette tinte, et un souvenir remonte.' },
    { clip: 'souvenir_cloche_2', decor: 'salle_quatre', camera: { de: { x: 0.3, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.2 } }, duree: 5000,
      effets: ['vignette_pulse', 'grain'], anim: ['sangles_tirent'],
      texte: 'Tu sens le froid, et les sangles qui t’attachent, et une faim si grande qu’elle a des dents.' },
    { clip: 'souvenir_cloche_3', decor: 'salle_quatre', camera: { de: { x: 0.7, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.4 } }, duree: 6000,
      effets: ['vignette_pulse', 'grain'], anim: ['brancard_approche'],
      texte: 'On pousse un brancard vers toi, avec un homme allongé dessus, une jambe dans une attelle. Il ne crie pas.' },
    { clip: 'souvenir_cloche_4', decor: 'salle_quatre', camera: { de: { x: 0.6, zoom: 1.4 }, vers: { x: 0.6, zoom: 1.8 } }, duree: 6000,
      effets: ['fondu_noir'], anim: ['visage_homme'],
      texte: 'Il te regarde et dit un seul mot, doucement, comme pour s’excuser : « Jo. »', attendre: true },
  ] },

  nuit_sonnailles: { musique: 'tension', plans: [
    { clip: 'nuit_sonnailles_1', decor: 'cours_troupeau', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.35, zoom: 1.15 } }, duree: 7000,
      effets: ['etoiles', 'poussiere'], anim: ['troupeau_coule', 'lampes_de_tete'],
      texte: 'Les morts arrivent par le cours Victor-Hugo, sous les platanes, par milliers, et ils remplissent la rue d’un trottoir à l’autre.' },
    { clip: 'nuit_sonnailles_2', decor: 'cours_troupeau', camera: { de: { x: 0.35, zoom: 1.15 }, vers: { x: 0.6, zoom: 1.45 } }, duree: 7000,
      effets: ['poussiere'], anim: ['sonnailleurs_marchent', 'troupeau_coule'],
      texte: 'En tête, des silhouettes marchent bien droit, une cloche de mouton au cou et une lampe à la main. Elles ne marchent pas comme des morts.' },
    { clip: 'nuit_sonnailles_3', decor: 'cours_troupeau', camera: { de: { x: 0.6, zoom: 1.45 }, vers: { x: 0.95, zoom: 1.2 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['troupeau_tourne', 'emperi_lointain'],
      texte: 'Toutes les dix secondes, une grosse cloche sonne, plus grave que les autres, et la foule tourne vers le rocher de l’Empéri.', attendre: true },
  ] },

  aube_troupeau: { musique: 'sombre', plans: [
    { clip: 'aube_troupeau_1', decor: 'emperi_remparts_aube', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 8000,
      effets: ['brouillard_bas', 'fumee'], anim: ['troupeau_s_eloigne'],
      texte: 'À l’aube, la foule quitte Salon par la route d’Avignon, en emmenant avec elle tous les morts de la ville.' },
    { clip: 'aube_troupeau_2', decor: 'emperi_remparts_aube', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.85, zoom: 1.6 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['berger_marche', 'chiens_tournent', 'redon_balance'],
      texte: 'En tête marche un vieux berger, avec son bâton et deux chiens. À côté de lui, une petite femme serre une énorme cloche contre sa poitrine, comme un enfant.' },
    { clip: 'aube_troupeau_3', decor: 'emperi_remparts_aube', camera: { de: { x: 0.85, zoom: 1.6 }, vers: { x: 0.9, zoom: 1.2 } }, duree: 6000,
      effets: [], anim: ['troupeau_s_eloigne'],
      texte: 'La grosse cloche sonne toutes les dix secondes, et le troupeau des morts part vers le nord.', attendre: true },
  ] },

  // ─────────── Chapitre 2 ───────────
  ch2_intro: { musique: 'calme', plans: [
    { clip: 'ch2_intro_1', decor: 'route_jean_moulin', camera: { de: { x: 0.3, y: 0.7, zoom: 1.5 }, vers: { x: 0.5, y: 0.3, zoom: 1.15 } }, duree: 8000,
      effets: ['poussiere'], anim: ['drap_claque'], titre: 'Chapitre 2 — La transhumance',
      texte: 'À la sortie nord de Salon, la statue de Jean Moulin lève les bras au ciel. Quelqu’un lui a noué un drap blanc aux poignets.' },
    { clip: 'ch2_intro_2', decor: 'plaine_route', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 8000,
      effets: [], anim: ['file_marcheurs'],
      texte: 'Une file d’enfants et d’adultes traverse les oliveraies, loin de la route. Ils portent des sacs, des bidons et des sabres pris dans un musée.' },
    { clip: 'ch2_intro_3', decor: 'cales_falaises', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.55, zoom: 1.1 } }, duree: 8000,
      effets: ['fumee'], anim: ['feux_grottes', 'echelle_corde', 'linge_seche'],
      texte: 'Au-dessus de Lamanon, deux falaises sont percées de cent seize grottes, et des feux y brûlent : il y a des vivants.' },
    { clip: 'ch2_intro_4', decor: 'cales_falaises', camera: { de: { x: 0.55, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.35 } }, duree: 6000,
      effets: [], anim: ['feux_grottes'],
      texte: 'Au sud, au loin, le vent porte le son de la grosse cloche : le troupeau n’est pas loin.', attendre: true },
  ] },

  vernegues: { musique: 'sombre', plans: [
    { clip: 'vernegues_1', decor: 'vernegues_ruines', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.05 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent'],
      texte: 'Le village de Vieux-Vernègues a été détruit une première fois par le tremblement de terre du 11 juin 1909, à neuf heures dix du soir.' },
    { clip: 'vernegues_2', decor: 'vernegues_ruines', camera: { de: { x: 0.4, zoom: 1.05 }, vers: { x: 0.75, zoom: 1.3 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent', 'revenus_assis'],
      texte: 'Ce soir, des centaines de bougies brûlent dans ses caves, et entre les ruines, des gens mangent et jouent aux cartes. Ce sont des revenus, comme toi.' },
    { clip: 'vernegues_3', decor: 'vernegues_ruines', camera: { de: { x: 0.75, zoom: 1.3 }, vers: { x: 0.95, zoom: 1.6 } }, duree: 6000,
      effets: [], anim: ['inscription_chaux'],
      texte: 'Sur le mur de l’église, écrit à la chaux : UN POUR UN.', attendre: true },
  ] },

  ba701: { musique: 'tension', plans: [
    { clip: 'ba701_1', decor: 'ba701_tarmac', camera: { de: { x: 0.0, zoom: 1.4 }, vers: { x: 0.3, zoom: 1.15 } }, duree: 7000,
      effets: ['chaleur'], anim: ['fouga_mat', 'corps_balance'],
      texte: 'Au rond-point de l’École de l’air, le vieil avion-monument pointe le nez vers le ciel, mais il ne volera plus.' },
    { clip: 'ba701_2', decor: 'ba701_tarmac', camera: { de: { x: 0.3, zoom: 1.15 }, vers: { x: 0.75, zoom: 1.1 } }, duree: 8000,
      effets: ['chaleur'], anim: ['manche_a_air', 'drapeau_mat'],
      texte: 'Sur la piste, les neuf avions de la Patrouille de France sont alignés, cockpits fermés.' },
    { clip: 'ba701_3', decor: 'ba701_tarmac', camera: { de: { x: 0.75, zoom: 1.1 }, vers: { x: 0.95, zoom: 1.5 } }, duree: 6000,
      effets: [], anim: ['rangers_alignees'],
      texte: 'Sur le parking, trois cents paires de chaussures militaires cirées sont rangées par pointure, et personne n’est resté pour expliquer pourquoi.', attendre: true },
  ] },

  // ─────────── Final ───────────
  le_mistral: { musique: 'tension', plans: [
    { clip: 'le_mistral_1', decor: 'crau_mistral', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'poussiere'], anim: ['herbes_couchees', 'nuages_filent'], titre: 'Le mistral',
      texte: 'Le mistral descend la vallée du Rhône, sec et froid. Les anciens disent qu’il souffle trois, six ou neuf jours, mais pour tout brûler, l’armée n’a besoin que d’un seul.' },
    { clip: 'le_mistral_2', decor: 'crau_mistral', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.3 } }, duree: 7000,
      effets: ['mistral'], anim: ['cypres_plient', 'colonne_marche'],
      texte: 'Sous un ciel d’un bleu dur, les cyprès se plient, et la colonne des réfugiés de Calès se met en marche vers la Durance.' },
    { clip: 'le_mistral_3', decor: 'ligne_de_feu', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['avions_passent', 'flammes_avancent'],
      texte: 'Au nord, sur la base aérienne d’Orange, des avions font chauffer leurs moteurs.', attendre: true },
  ] },

  pont_mallemort: { musique: 'tension', plans: [
    { clip: 'pont_mallemort_1', decor: 'durance_pont', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral'], anim: ['cables_vibrent', 'eau_ecume'],
      texte: 'Le pont suspendu de Mallemort vibre dans le vent, en chantant une note grave qu’on sent monter par les pieds.' },
    { clip: 'pont_mallemort_2', decor: 'durance_pont', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.35 } }, duree: 7000,
      effets: ['mistral'], anim: ['colonne_traverse', 'projecteurs'],
      texte: 'Un par un, les vivants de Calès avancent sur les planches, vers les projecteurs de la rive nord.' },
    { clip: 'pont_mallemort_3', decor: 'ligne_de_feu', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.3, zoom: 1.05 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['troupeau_arrive', 'flammes_avancent'],
      texte: 'Derrière eux arrive le troupeau des morts, et derrière le troupeau, tout le ciel brûle.', attendre: true },
  ] },

  // ─────────── Les fins ───────────
  fin_cautere: { musique: 'sombre', plans: [
    { clip: 'fin_cautere_1', decor: 'durance_pont', camera: { de: { x: 0.6, zoom: 1.2 }, vers: { x: 0.2, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['herse_tombe', 'pont_routier_saute'],
      texte: 'Au bout du pont, la grille de fer tombe, et plus loin, le pont routier explose.' },
    { clip: 'fin_cautere_2', decor: 'ligne_de_feu', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['mistral', 'braises', 'cendres', 'chaleur'], anim: ['flammes_avancent', 'troupeau_brule', 'berger_immobile'],
      texte: 'Sur la rive sud, le Berger regarde l’eau, puis le feu arrive.' },
    { clip: 'fin_cautere_3', decor: 'camp_refugies', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.1 } }, duree: 8000,
      effets: ['cendres'], anim: ['tentes_vent', 'fumee_cuisine'],
      texte: 'Six semaines plus tard, dans un camp de tentes au bord du Rhône…' },
    { clip: 'fin_cautere_4', decor: 'camp_refugies', camera: { de: { x: 0.6, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['cloche_chapelle'],
      texte: 'Le dimanche, à dix heures, la cloche de l’église sonne.', attendre: true },
  ] },

  fin_voix: { musique: 'tension', plans: [
    { clip: 'fin_voix_1', decor: 'durance_pont', camera: { de: { x: 0.5, y: 0.7, zoom: 1.8 }, vers: { x: 0.5, y: 0.7, zoom: 1.5 } }, duree: 5000,
      effets: ['mistral'], anim: ['telephone_envoye'],
      texte: 'Vidéo envoyée.' },
    { clip: 'fin_voix_2', decor: 'durance_pont', camera: { de: { x: 0.5, zoom: 1.5 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 7000,
      effets: ['fondu_blanc'], anim: ['ecrans_s_allument'],
      texte: 'En une heure, cent mille personnes l’ont vue, en une nuit, cent millions, et en trois jours, la terre entière.' },
    { clip: 'fin_voix_3', decor: 'gymnase_froid', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.6, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['file_familles', 'buee_respiration'],
      texte: 'Trois mois plus tard, dans un gymnase réfrigéré, quatre cents housses blanches sont alignées sur le terrain de basket.' },
    { clip: 'fin_voix_4', decor: 'gymnase_froid', camera: { de: { x: 0.6, zoom: 1.05 }, vers: { x: 0.95, zoom: 1.45 } }, duree: 6000,
      effets: [], anim: ['affiche_don'],
      texte: 'L’affiche dit : LE DON, UN ACTE RESPONSABLE. Personne ne dit ce qu’on donne.', attendre: true },
  ] },

  fin_transhumance_feu: { musique: 'mort', plans: [
    { clip: 'fin_transhumance_feu_1', decor: 'troupeau_feu', camera: { de: { x: 0.9, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['mistral', 'braises'], anim: ['troupeau_suit', 'redon_leve'],
      texte: 'La cloche sonne, et onze mille morts tournent la tête en même temps.' },
    { clip: 'fin_transhumance_feu_2', decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.2, zoom: 1.3 } }, duree: 8000,
      effets: ['mistral', 'braises', 'chaleur'], anim: ['rose_bras', 'flammes_avancent'],
      texte: 'Tu marches devant eux, vers le feu. Rose te tient le bras, comme une vieille dame qu’on accompagne à l’église.' },
    { clip: 'fin_transhumance_feu_3', decor: 'troupeau_feu', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.05, zoom: 1.8 } }, duree: 7000,
      effets: ['chaleur', 'fondu_blanc'], anim: ['silhouette_dans_flammes'],
      texte: 'Tu connais le chemin.' },
    { clip: 'fin_transhumance_feu_4', decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 5000,
      effets: ['cendres'], anim: ['cloche_au_sol'],
      texte: 'Cette fois, tu ne reviendras pas.', attendre: true },
  ] },

  fin_transhumance_estive: { musique: 'sombre', plans: [
    { clip: 'fin_transhumance_estive_1', decor: 'durance_pont', camera: { de: { x: 0.2, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['conteneurs_basculent', 'troupeau_traverse'],
      texte: 'Le mur de conteneurs tient une minute, puis la marée des morts passe le fleuve.' },
    { clip: 'fin_transhumance_estive_2', decor: 'estive_ventoux', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['troupeau_monte', 'redon_balance'],
      texte: 'Onze jours plus tard, le troupeau arrive au pied du mont Ventoux.' },
    { clip: 'fin_transhumance_estive_3', decor: 'estive_ventoux', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.7, zoom: 1.5 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['revenus_se_redressent'],
      texte: 'Chaque matin, dans la foule, quelqu’un se redresse, regarde ses mains et demande de l’eau.' },
    { clip: 'fin_transhumance_estive_4', decor: 'estive_ventoux', camera: { de: { x: 0.7, zoom: 1.5 }, vers: { x: 0.9, y: 0.2, zoom: 1.2 } }, duree: 7000,
      effets: [], anim: ['sommet_blanc'],
      texte: 'Là-haut, le sommet du Ventoux est blanc comme un os. C’est un jour de plus.', attendre: true },
  ] },
};
