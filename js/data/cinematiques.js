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
      texte: 'Salon-de-Provence. Mercredi 2 septembre. Jour de grand marché sur les cours.' },
    { decor: 'salon_mercredi', camera: { de: { x: 0.3, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.4 } }, duree: 8000,
      effets: ['grain', 'secousse'], anim: ['foule_court', 'etals_renverses', 'silhouette_penchee'],
      texte: 'À dix heures quarante, devant l’étal du fromager, une femme a mordu son mari. Il a fallu onze minutes pour que le cours Carnot se mette à hurler.' },
    { decor: 'couloir_hopital', camera: { de: { x: 0.2, zoom: 1.5 }, vers: { x: 0.6, zoom: 1.2 } }, duree: 8000,
      effets: ['grain', 'vignette_pulse'], anim: ['neon_clignote', 'clochette_tremble', 'main_billet'],
      texte: 'Une clochette sur un chariot. Une main qui glisse un billet plié en quatre dans une poche. Quelqu’un, déjà, préparait la suite.' },
    { decor: 'salon_mistral_vide', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['grain', 'poussiere'], anim: ['platanes_vent', 'journal_vole', 'drone_passe'],
      texte: 'Trois semaines plus tard. Plus de marché, plus d’hôpital, plus de ville. Au nord, derrière la Durance, l’armée attend le vent.' },
    { decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['fermeture_eclair', 'souffle_plastique'],
      texte: 'Et quelque part, sous une housse blanche, un cœur qui n’avait plus rien à faire là se remet à battre.', attendre: true },
    { decor: 'housse_noir', camera: { de: { x: 0.5, zoom: 1.25 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 4000,
      effets: ['fondu_noir'], anim: [], titre: 'One More Day', texte: '', attendre: true },
  ] },

  // ─────────── Prologue ───────────
  pro_cloches: { musique: 'tension', plans: [
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, y: 0.8, zoom: 1.5 }, vers: { x: 0.5, y: 0.25, zoom: 1.2 } }, duree: 6000,
      effets: ['lueur_lampe'], anim: ['cloches_balancent', 'fontaine_coule'],
      texte: 'La première cloche sonne si fort que tu la sens dans tes dents.' },
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.05 } }, duree: 7000,
      effets: ['grain'], anim: ['cloches_balancent', 'silhouettes_convergent'],
      texte: 'Puis la deuxième. Puis la troisième. Deux mille cinq cents kilos de bronze qui appellent tout Salon.' },
    { decor: 'place_crousillat_nuit', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.5, y: 0.6, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['silhouettes_convergent', 'porte_entrouverte'],
      texte: 'Des rues, des porches, des terrasses, ils arrivent.', attendre: true },
  ] },

  pro_sommet: { musique: 'sombre', plans: [
    { decor: 'horloge_sommet', camera: { de: { x: 0.1, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['etoiles'], anim: ['foule_immobile', 'cloches_immobiles'],
      texte: 'Sous la tour, la foule ne repart pas. Des centaines de visages levés vers les cloches qui se sont tues.' },
    { decor: 'horloge_sommet', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.25 } }, duree: 8000,
      effets: ['etoiles', 'fumee'], anim: ['incendie_lointain'],
      texte: 'Plus loin, sur son rocher, l’Empéri. Une seule fenêtre éclairée : des vivants.' },
    { decor: 'horloge_sommet', camera: { de: { x: 0.85, zoom: 1.25 }, vers: { x: 0.98, zoom: 1.45 } }, duree: 6000,
      effets: ['etoiles'], anim: ['cadran_21h10'],
      texte: 'Il est neuf heures dix. Il est toujours neuf heures dix, à Salon.', attendre: true },
  ] },

  // ─────────── Chapitre 1 ───────────
  ch1_intro: { musique: 'calme', plans: [
    { decor: 'salon_aube_toits', camera: { de: { x: 0.05, zoom: 1.3 }, vers: { x: 0.45, zoom: 1.1 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'fumees_droites'], titre: 'Chapitre 1 — Les vivants',
      texte: 'Mercredi 23 septembre. Trois semaines, jour pour jour, après le Mercredi.' },
    { decor: 'salon_aube_toits', camera: { de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['martinets', 'linge_emperi'],
      texte: 'Il reste à Salon une trentaine de vivants, tous dans le même château.' },
    { decor: 'salon_aube_toits', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.97, zoom: 1.4 } }, duree: 7000,
      effets: [], anim: ['platanes_immobiles'],
      texte: 'Et le vent, pour l’instant, ne souffle pas.', attendre: true },
  ] },

  souvenir_cloche: { musique: 'mort', plans: [
    { decor: 'salle_quatre', camera: { de: { x: 0.5, zoom: 1.6 }, vers: { x: 0.5, zoom: 1.5 } }, duree: 2500,
      effets: ['flash_rouge', 'grain'], anim: ['clochette_agitee'], texte: 'Ding.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.3, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.2 } }, duree: 5000,
      effets: ['vignette_pulse', 'grain'], anim: ['sangles_tirent'],
      texte: 'Le froid. Des sangles. Une faim si grande qu’elle a des dents.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.7, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.4 } }, duree: 6000,
      effets: ['vignette_pulse', 'grain'], anim: ['brancard_approche'],
      texte: 'Un brancard qu’on pousse vers toi. Un homme dessus, une jambe dans une attelle. Il ne crie pas.' },
    { decor: 'salle_quatre', camera: { de: { x: 0.6, zoom: 1.4 }, vers: { x: 0.6, zoom: 1.8 } }, duree: 6000,
      effets: ['fondu_noir'], anim: ['visage_homme'],
      texte: 'Il te regarde. Il dit un seul mot, doucement, comme on s’excuse : « Jo. »', attendre: true },
  ] },

  nuit_sonnailles: { musique: 'tension', plans: [
    { decor: 'cours_troupeau', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.35, zoom: 1.15 } }, duree: 7000,
      effets: ['etoiles', 'poussiere'], anim: ['troupeau_coule', 'lampes_de_tete'],
      texte: 'Ils arrivent par le cours Victor-Hugo, sous les platanes, d’un trottoir à l’autre. Des milliers.' },
    { decor: 'cours_troupeau', camera: { de: { x: 0.35, zoom: 1.15 }, vers: { x: 0.6, zoom: 1.45 } }, duree: 7000,
      effets: ['poussiere'], anim: ['sonnailleurs_marchent', 'troupeau_coule'],
      texte: 'Devant, des silhouettes droites, une cloche au cou, une lampe au poing. Elles ne marchent pas comme eux.' },
    { decor: 'cours_troupeau', camera: { de: { x: 0.6, zoom: 1.45 }, vers: { x: 0.95, zoom: 1.2 } }, duree: 7000,
      effets: ['vignette_pulse'], anim: ['troupeau_tourne', 'emperi_lointain'],
      texte: 'Et toutes les dix secondes, plus grave que les autres, une seule cloche. Bong. La marée tourne vers le rocher.', attendre: true },
  ] },

  aube_troupeau: { musique: 'sombre', plans: [
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 8000,
      effets: ['brouillard_bas', 'fumee'], anim: ['troupeau_s_eloigne'],
      texte: 'À l’aube, la marée quitte Salon par la route d’Avignon. Elle emporte les morts de la ville avec elle.' },
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.85, zoom: 1.6 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['berger_marche', 'chiens_tournent', 'redon_balance'],
      texte: 'En tête, un vieil homme avec une houlette et deux chiens. À côté de lui, une petite femme qui porte une cloche énorme contre sa poitrine, comme un enfant.' },
    { decor: 'emperi_remparts_aube', camera: { de: { x: 0.85, zoom: 1.6 }, vers: { x: 0.9, zoom: 1.2 } }, duree: 6000,
      effets: [], anim: ['troupeau_s_eloigne'],
      texte: 'Bong. Toutes les dix secondes. Vers le nord.', attendre: true },
  ] },

  // ─────────── Chapitre 2 ───────────
  ch2_intro: { musique: 'calme', plans: [
    { decor: 'route_jean_moulin', camera: { de: { x: 0.3, y: 0.7, zoom: 1.5 }, vers: { x: 0.5, y: 0.3, zoom: 1.15 } }, duree: 8000,
      effets: ['poussiere'], anim: ['drap_claque'], titre: 'Chapitre 2 — La transhumance',
      texte: 'À la sortie nord de Salon, Jean Moulin lève les bras au ciel. Quelqu’un lui a noué un drap blanc aux poignets.' },
    { decor: 'plaine_route', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 8000,
      effets: [], anim: ['file_marcheurs'],
      texte: 'Une file de gamins et d’adultes traverse les oliveraies, loin de la route, avec des sacs, des bidons, et des sabres de musée.' },
    { decor: 'cales_falaises', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.55, zoom: 1.1 } }, duree: 8000,
      effets: ['fumee'], anim: ['feux_grottes', 'echelle_corde', 'linge_seche'],
      texte: 'Au-dessus de Lamanon, deux falaises trouées de cent seize grottes. Dans les trous, des feux. Des vivants.' },
    { decor: 'cales_falaises', camera: { de: { x: 0.55, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.35 } }, duree: 6000,
      effets: [], anim: ['feux_grottes'],
      texte: 'Au sud, loin, contre le vent : bong.', attendre: true },
  ] },

  vernegues: { musique: 'sombre', plans: [
    { decor: 'vernegues_ruines', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.05 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent'],
      texte: 'Le vieux Vernègues est mort une première fois le 11 juin 1909, à neuf heures dix du soir.' },
    { decor: 'vernegues_ruines', camera: { de: { x: 0.4, zoom: 1.05 }, vers: { x: 0.75, zoom: 1.3 } }, duree: 8000,
      effets: ['etoiles'], anim: ['bougies_vacillent', 'revenus_assis'],
      texte: 'Ce soir, des centaines de bougies brûlent dans ses caves. Et des gens, entre les ruines, qui mangent et qui jouent aux cartes.' },
    { decor: 'vernegues_ruines', camera: { de: { x: 0.75, zoom: 1.3 }, vers: { x: 0.95, zoom: 1.6 } }, duree: 6000,
      effets: [], anim: ['inscription_chaux'],
      texte: 'Sur le mur de l’église, à la chaux : UN POUR UN.', attendre: true },
  ] },

  ba701: { musique: 'tension', plans: [
    { decor: 'ba701_tarmac', camera: { de: { x: 0.0, zoom: 1.4 }, vers: { x: 0.3, zoom: 1.15 } }, duree: 7000,
      effets: ['chaleur'], anim: ['fouga_mat', 'corps_balance'],
      texte: 'Au rond-point de l’École de l’air, le Fouga Magister pointe le nez vers un ciel qu’il ne reverra pas.' },
    { decor: 'ba701_tarmac', camera: { de: { x: 0.3, zoom: 1.15 }, vers: { x: 0.75, zoom: 1.1 } }, duree: 8000,
      effets: ['chaleur'], anim: ['manche_a_air', 'drapeau_mat'],
      texte: 'Sur le tarmac, en rang parfait, neuf Alphajets bleu-blanc-rouge. Verrières fermées.' },
    { decor: 'ba701_tarmac', camera: { de: { x: 0.75, zoom: 1.1 }, vers: { x: 0.95, zoom: 1.5 } }, duree: 6000,
      effets: [], anim: ['rangers_alignees'],
      texte: 'Sur le parking, trois cents paires de rangers cirées, alignées par pointure. Personne n’est resté pour expliquer.', attendre: true },
  ] },

  // ─────────── Final ───────────
  le_mistral: { musique: 'tension', plans: [
    { decor: 'crau_mistral', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'poussiere'], anim: ['herbes_couchees', 'nuages_filent'], titre: 'Le mistral',
      texte: 'Il arrive par la vallée du Rhône, sec et froid. Trois, six ou neuf jours, disent les vieux. L’armée n’en a besoin que d’un.' },
    { decor: 'crau_mistral', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.3 } }, duree: 7000,
      effets: ['mistral'], anim: ['cypres_plient', 'colonne_marche'],
      texte: 'Le ciel est lavé à l’eau de Javel. Les cyprès se plient. La colonne de Calès se met en marche vers le fleuve.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.2, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.2 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['avions_passent', 'flammes_avancent'],
      texte: 'Au nord, sur les terrains d’Orange, des moteurs chauffent.', attendre: true },
  ] },

  pont_mallemort: { musique: 'tension', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.4, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral'], anim: ['cables_vibrent', 'eau_ecume'],
      texte: 'Le pont suspendu de Mallemort chante dans le vent, une note grave qui entre par les pieds.' },
    { decor: 'durance_pont', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.35 } }, duree: 7000,
      effets: ['mistral'], anim: ['colonne_traverse', 'projecteurs'],
      texte: 'Un par un, les vivants de Calès s’engagent sur les planches vers les projecteurs de la rive nord.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.8, zoom: 1.2 }, vers: { x: 0.3, zoom: 1.05 } }, duree: 7000,
      effets: ['mistral', 'braises', 'fumee'], anim: ['troupeau_arrive', 'flammes_avancent'],
      texte: 'Derrière eux, le troupeau. Et derrière le troupeau, tout le ciel brûle.', attendre: true },
  ] },

  // ─────────── Les fins ───────────
  fin_cautere: { musique: 'sombre', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.6, zoom: 1.2 }, vers: { x: 0.2, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['herse_tombe', 'pont_routier_saute'],
      texte: 'La herse tombe au bout des planches. Le pont routier saute.' },
    { decor: 'ligne_de_feu', camera: { de: { x: 0.1, zoom: 1.1 }, vers: { x: 0.9, zoom: 1.15 } }, duree: 9000,
      effets: ['mistral', 'braises', 'cendres', 'chaleur'], anim: ['flammes_avancent', 'troupeau_brule', 'berger_immobile'],
      texte: 'Sur la rive sud, le Berger regarde l’eau. Puis le feu arrive.' },
    { decor: 'camp_refugies', camera: { de: { x: 0.1, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.1 } }, duree: 8000,
      effets: ['cendres'], anim: ['tentes_vent', 'fumee_cuisine'],
      texte: 'Six semaines plus tard, un camp de toile au bord du Rhône.' },
    { decor: 'camp_refugies', camera: { de: { x: 0.6, zoom: 1.1 }, vers: { x: 0.85, zoom: 1.5 } }, duree: 6000,
      effets: ['vignette_pulse'], anim: ['cloche_chapelle'],
      texte: 'Dimanche, dix heures. La cloche sonne.', attendre: true },
  ] },

  fin_voix: { musique: 'tension', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.5, y: 0.7, zoom: 1.8 }, vers: { x: 0.5, y: 0.7, zoom: 1.5 } }, duree: 5000,
      effets: ['mistral'], anim: ['telephone_envoye'],
      texte: 'Envoyé.' },
    { decor: 'durance_pont', camera: { de: { x: 0.5, zoom: 1.5 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 7000,
      effets: ['fondu_blanc'], anim: ['ecrans_s_allument'],
      texte: 'En une heure, cent mille. En une nuit, cent millions. En trois jours, la terre entière.' },
    { decor: 'gymnase_froid', camera: { de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.6, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['file_familles', 'buee_respiration'],
      texte: 'Trois mois plus tard, un gymnase réfrigéré. Quatre cents housses blanches entre les lignes du terrain de basket.' },
    { decor: 'gymnase_froid', camera: { de: { x: 0.6, zoom: 1.05 }, vers: { x: 0.95, zoom: 1.45 } }, duree: 6000,
      effets: [], anim: ['affiche_don'],
      texte: 'LE DON, UN ACTE RESPONSABLE. Personne ne dit ce qu’on donne.', attendre: true },
  ] },

  fin_transhumance_feu: { musique: 'mort', plans: [
    { decor: 'troupeau_feu', camera: { de: { x: 0.9, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['mistral', 'braises'], anim: ['troupeau_suit', 'redon_leve'],
      texte: 'Bong. Onze mille têtes se tournent en même temps.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.2, zoom: 1.3 } }, duree: 8000,
      effets: ['mistral', 'braises', 'chaleur'], anim: ['rose_bras', 'flammes_avancent'],
      texte: 'Tu marches devant. Rose te tient le bras, comme une vieille dame qu’on accompagne à l’église.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.2, zoom: 1.3 }, vers: { x: 0.05, zoom: 1.8 } }, duree: 7000,
      effets: ['chaleur', 'fondu_blanc'], anim: ['silhouette_dans_flammes'],
      texte: 'Tu connais le chemin.' },
    { decor: 'troupeau_feu', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 5000,
      effets: ['cendres'], anim: ['cloche_au_sol'],
      texte: 'Cette fois, tu ne reviens pas.', attendre: true },
  ] },

  fin_transhumance_estive: { musique: 'sombre', plans: [
    { decor: 'durance_pont', camera: { de: { x: 0.2, zoom: 1.2 }, vers: { x: 0.7, zoom: 1.1 } }, duree: 7000,
      effets: ['mistral', 'fumee'], anim: ['conteneurs_basculent', 'troupeau_traverse'],
      texte: 'Les conteneurs tiennent une minute. Puis la marée passe le fleuve.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.05 } }, duree: 9000,
      effets: ['brouillard_bas'], anim: ['troupeau_monte', 'redon_balance'],
      texte: 'Onze jours plus tard, au pied du Ventoux.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.7, zoom: 1.5 } }, duree: 8000,
      effets: ['brouillard_bas'], anim: ['revenus_se_redressent'],
      texte: 'Chaque matin, dans la foule, quelqu’un se redresse, regarde ses mains, et demande de l’eau.' },
    { decor: 'estive_ventoux', camera: { de: { x: 0.7, zoom: 1.5 }, vers: { x: 0.9, y: 0.2, zoom: 1.2 } }, duree: 7000,
      effets: [], anim: ['sommet_blanc'],
      texte: 'Là-haut, le Ventoux est blanc comme un os. Un jour de plus.', attendre: true },
  ] },
};
