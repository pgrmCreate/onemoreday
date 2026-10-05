// ============ DÉCLENCHEURS (REFONTE §4.7) ============
// Ordre = priorité : pour un même événement, le premier déclencheur dont la condition est vraie est joué.
// `unique: true` : joué une seule fois par partie (mémorisé par le moteur).
// NB : la cinématique 'intro' est jouée par l'intégrateur à la création de la partie, AVANT explorer('cimetiere', { entree: 'caveau' }).

export const DECLENCHEURS = [
  // ─────────── PROLOGUE : cimetière Saint-Roch ───────────
  { quand: 'entree_lieu', lieu: 'cimetiere', si: { pasFlag: 'pro_reveil_fait' }, scene: 'pro_reveil', unique: true },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'scelle_effets', scene: 'pro_scelle', unique: true },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'soldat_nrbc', scene: 'pro_soldat', unique: true },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'robinet_fleurs', scene: 'pro_robinet', unique: true },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'housse_patrick', scene: 'pro_patrick', unique: true },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'conteneur_frigo', scene: 'pro_conteneur', unique: true },
  // (rejouable tant que la clé n'est pas prise : une partie fermée en pleine scène ne bloque pas la sortie)
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'loge_gardien', si: { pasFlag: 'pro_cle_prise' }, scene: 'pro_loge', libelle: 'Examiner le bureau du gardien' },
  { quand: 'marqueur', lieu: 'cimetiere', marqueur: 'grille_sortie', si: { pasFlag: 'pro_grille_ouverte' }, scene: 'pro_grille', deux: true, libelle: 'Examiner la grille' },

  // Voyage cimetière → Tour de l'Horloge (tutoriel de la carte, puis du combat)
  { quand: 'voyage', de: 'cimetiere', vers: 'tour_horloge', a: 0.35, si: { pasFlag: 'prologue_fini' }, rencontre: 'rh_pro_marche', unique: true },
  { quand: 'voyage', de: 'cimetiere', vers: 'tour_horloge', a: 0.75, si: { pasFlag: 'prologue_fini' }, rencontre: 'rh_pro_premier', unique: true },

  // ─────────── PROLOGUE : Tour de l'Horloge ───────────
  { quand: 'entree_lieu', lieu: 'tour_horloge', si: { flag: 'pro_note_lue', pasFlag: 'pro_cloches_faites' }, scene: 'pro_horloge' },
  { quand: 'marqueur', lieu: 'tour_horloge', marqueur: 'mecanisme_horloge', scene: 'pro_mecanisme', unique: true },
  { quand: 'marqueur', lieu: 'tour_horloge', marqueur: 'sommet_maud', si: { flag: 'pro_cloches_faites', pasFlag: 'prologue_fini' }, scene: 'pro_maud' },

  // ─────────── CHAPITRE 1 : maison de Nostradamus ───────────
  { quand: 'entree_lieu', lieu: 'nostradamus', si: { flag: 'prologue_fini', pasFlag: 'ch1_matin_fait' }, scene: 'ch1_matin', unique: true },
  { quand: 'entree_lieu', lieu: 'nostradamus', si: { quete: ['q_protocole', 'confrontation'] }, scene: 'ch1_confrontation', unique: true },
  { quand: 'marqueur', lieu: 'nostradamus', marqueur: 'cave_patiente', si: { pasFlag: 'confrontation_faite' }, scene: 'nos_cave', unique: true },

  // ─────────── CHAPITRE 1 : l'Empéri ───────────
  { quand: 'entree_lieu', lieu: 'emperi', si: { quete: ['q_protocole', 'emperi'], pasFlag: 'emp_arrivee_faite' }, scene: 'emp_arrivee' },
  { quand: 'entree_lieu', lieu: 'emperi', si: { flag: 'lou_sauvee', pasFlag: 'emp_retour_fait' }, scene: 'emp_retour_lou', unique: true },
  { quand: 'entree_lieu', lieu: 'emperi', si: { quete: ['q_protocole', 'vidal_maud'] }, scene: 'emp_denonciation', unique: true },
  { quand: 'entree_lieu', lieu: 'emperi', si: { quete: ['q_protocole', 'sonnailles'] }, scene: 'ch1_siege_1', unique: true },
  { quand: 'marqueur', lieu: 'emperi', marqueur: 'radio_emperi', si: { flag: 'radio_ok', pasFlag: 'radio_essayee' }, scene: 'emp_radio', unique: true },
  { quand: 'marqueur', lieu: 'emperi', marqueur: 'sac_rouge', scene: 'emp_sac_rouge', unique: true },

  // Voyages du chapitre 1
  { quand: 'voyage', vers: 'emperi', a: 0.5, si: { quete: ['q_protocole', 'emperi'] }, rencontre: 'rh_ch1_hautparleur', unique: true },
  { quand: 'voyage', vers: 'hopital', a: 0.6, si: { quete: ['q_protocole', 'hopital'] }, rencontre: 'rh_ch1_ambulance', unique: true },
  { quand: 'voyage', vers: 'emperi', a: 0.5, si: { quete: ['q_protocole', 'sonnailles'] }, rencontre: 'rh_ch1_cours', unique: true },

  // ─────────── CHAPITRE 1 : Saint-Laurent ───────────
  { quand: 'entree_lieu', lieu: 'saint_laurent', si: { quete: ['q_protocole', 'saint_laurent'] }, scene: 'stl_entree', unique: true },
  { quand: 'marqueur', lieu: 'saint_laurent', marqueur: 'nef_entree', scene: 'stl_nef', unique: true },
  { quand: 'marqueur', lieu: 'saint_laurent', marqueur: 'cure_autel', si: { pasFlag: 'lou_sauvee' }, scene: 'stl_cure' },
  { quand: 'marqueur', lieu: 'saint_laurent', marqueur: 'tombeau_nostradamus', si: { pasFlag: 'nathan_acheve' }, scene: 'stl_nathan' },
  { quand: 'marqueur', lieu: 'saint_laurent', marqueur: 'clocher_lou', si: { pasFlag: 'lou_trouvee' }, scene: 'stl_lou' },
  { quand: 'marqueur', lieu: 'saint_laurent', marqueur: 'porte_sacristie', si: { flag: 'lou_trouvee', objet: 'cle_sacristie', pasFlag: 'lou_sauvee' }, scene: 'stl_sortie' },

  // ─────────── CHAPITRE 1 : l'hôpital ───────────
  { quand: 'entree_lieu', lieu: 'hopital', si: { quete: ['q_protocole', 'hopital'] }, scene: 'hop_entree', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'salle_4', scene: 'hop_salle4', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'morgue_couloir', scene: 'hop_brancardier', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'chambre_froide', scene: 'hop_registre', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'casier_luc', scene: 'hop_casier', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'frigo_pharmacie', scene: 'hop_frigo', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'bureau_maud', scene: 'hop_bureau', unique: true },
  { quand: 'marqueur', lieu: 'hopital', marqueur: 'dossiers_urgences', scene: 'hop_dossiers', unique: true },

  // ─────────── CHAPITRE 2 : Calès ───────────
  { quand: 'voyage', vers: 'cales', a: 0.15, si: { quete: ['q_traversee', 'cales'] }, rencontre: 'rh_ch2_jean_moulin', unique: true },
  { quand: 'voyage', vers: 'cales', a: 0.6, si: { quete: ['q_traversee', 'cales'] }, rencontre: 'rh_ch2_troupeau_plaine', unique: true },
  { quand: 'entree_lieu', lieu: 'cales', si: { quete: ['q_traversee', 'cales'] }, scene: 'cal_arrivee', unique: true },
  { quand: 'entree_lieu', lieu: 'cales', si: { quete: ['q_traversee', 'retour'] }, scene: 'cal_retour', unique: true },
  { quand: 'marqueur', lieu: 'cales', marqueur: 'antenne_cales', si: { quete: ['q_traversee', 'contact'], objet: 'valise_radio' }, scene: 'cal_contact', unique: true },
  { quand: 'marqueur', lieu: 'cales', marqueur: 'martelliere_canal', si: { flag: 'cales_arrivee', pasFlag: 'delai_canal' }, scene: 'cal_martelliere' },

  // ─────────── CHAPITRE 2 : Mallemort (reconnaissance) ───────────
  { quand: 'entree_lieu', lieu: 'mallemort', si: { quete: ['q_traversee', 'mallemort'] }, scene: 'mal_arrivee', unique: true },
  { quand: 'marqueur', lieu: 'mallemort', marqueur: 'ligne_200m', si: { quete: ['q_traversee', 'mallemort'] }, scene: 'mal_ligne' },

  // ─────────── CHAPITRE 2 : les revenus, Vernègues ───────────
  { quand: 'voyage', a: 0.4, si: { flag: 'proces_fait', pasFlag: 'revenus_rencontres' }, rencontre: 'rh_ch2_revenus', unique: true },
  { quand: 'entree_lieu', lieu: 'vernegues', si: { pasFlag: 'vernegues_visite' }, scene: 'ver_arrivee', unique: true },
  { quand: 'voyage', vers: 'vernegues', a: 0.5, si: { pasFlag: 'vernegues_visite' }, rencontre: 'rh_ch2_lion', unique: true },

  // ─────────── CHAPITRE 2 : BA 701 ───────────
  { quand: 'voyage', vers: 'ba701', a: 0.5, rencontre: 'rh_ch2_avions', unique: true },
  { quand: 'entree_lieu', lieu: 'ba701', si: { quete: ['q_traversee', 'ba701'] }, scene: 'ba_arrivee', unique: true },
  { quand: 'marqueur', lieu: 'ba701', marqueur: 'pc_protection', si: { pasFlag: 'ba_materiel' }, scene: 'ba_pc', unique: true },
  { quand: 'marqueur', lieu: 'ba701', marqueur: 'armoire_forte', si: { objet: 'cle_armoire_forte' }, scene: 'ba_armoire', unique: true },
  { quand: 'marqueur', lieu: 'ba701', marqueur: 'hangar_paf', scene: 'ba_hangar', unique: true },

  // ─────────── CHAPITRE 2 : Sénas ───────────
  { quand: 'entree_lieu', lieu: 'senas', scene: 'sen_arrivee', unique: true },
  { quand: 'marqueur', lieu: 'senas', marqueur: 'porte_chambre_froide', si: { pasFlag: 'senas_rencontres' }, scene: 'sen_station', unique: true },
  { quand: 'marqueur', lieu: 'senas', marqueur: 'corde_clocher', si: { pasFlag: 'delai_senas' }, scene: 'sen_cloches' },

  // ─────────── FINAL ───────────
  { quand: 'voyage', de: 'cales', vers: 'mallemort', a: 0.5, si: { flag: 'mistral_leve' }, rencontre: 'rh_fin_colonne', unique: true },
  { quand: 'voyage', de: 'cales', vers: 'mallemort', a: 0.85, si: { flag: 'mistral_leve' }, rencontre: 'rh_fin_feu', unique: true },
  { quand: 'entree_lieu', lieu: 'mallemort', si: { flag: 'mistral_leve' }, scene: 'fin_pont_1', unique: true },
];
