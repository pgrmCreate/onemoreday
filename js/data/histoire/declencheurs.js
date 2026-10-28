// ============ DÉCLENCHEURS (docs/HISTOIRE.md §6) ============
// Ordre = priorité : pour un même événement, le premier déclencheur dont la condition est vraie est joué.
// `unique: true` : joué une seule fois par partie (mémorisé par le moteur). Les déclencheurs 'heure' et 'flag' sont
// toujours uniques ; un déclencheur 'heure' attend que sa condition soit vraie (il se joue à la première minute où
// l'heure est passée ET la condition tient : un joueur qui arrive en retard le déclenche en arrivant).
// `invite: false` : jamais chez l'invité co-op (il a sa propre version).
// NB : la cinématique 'intro' est jouée par l'intégrateur à la création de la partie, AVANT
//      explorer('miramas_le_vieux', { entree: 'porte' }).

const AU_REFUGE = { lieu: 'miramas_le_vieux' };

export const DECLENCHEURS = [
  // ═══════════════════════ LE DÉBUT — LE BOIS (docs/HISTOIRE_DEBUT_V3.md) ═══════════════════════
  // La cinématique 'ouverture' (trois phrases sur un écran noir) est jouée à la création de la partie, puis on arrive sur
  // la piste, à côté du fourgon (explorer('bois_barben', { entree: 'fourgon' })) : on joue tout de suite, sans scène.
  // le matin du jour 2 : il n'y a plus rien à manger, René parle du mas (le tas de bois du premier soir, fait ou pas)
  { quand: 'heure', jourMin: 2, heure: 7, si: { ou: [{ quete: ['q_debut', 'bois'] }, { quete: ['q_debut', 'panne'] }] }, scene: 'bb_matin' },
  // la caisse est assez pleine : le fourgon ne repartira pas, on monte le camp
  { quand: 'flag', flag: 'vivres_faits', scene: 'bb_camp' },
  // le soir, une fois le camp monté : les boîtes sonnent
  { quand: 'heure', heure: 21, si: { flag: 'camp_monte', pasFlag: 'boites_sonnees', lieu: 'bois_barben' }, scene: 'bb_boites' },
  // le matin qui suit : la vigie
  { quand: 'heure', heure: 7, si: { flag: 'boites_sonnees', heureMax: 10, quete: ['q_debut', 'nuit'] }, scene: 'bb_vigie' },
  { quand: 'marqueur', lieu: 'bois_barben', marqueur: 'pare_feu', si: { quete: ['q_debut', 'vigie'] }, scene: 'bb_pare_feu', libelle: 'Monter à la vigie' },
  // la vigie : en arrivant, pendant ce temps, au camp… (camp_attaque) ; la radio de la cabine
  { quand: 'entree_lieu', lieu: 'vigie_barben', si: { quete: ['q_debut', 'vigie'] }, scene: 'vig_arrivee', unique: true },
  { quand: 'marqueur', lieu: 'vigie_barben', marqueur: 'radio_vigie', si: { pasFlag: 'radio_vigie_vue' }, scene: 'vig_radio', libelle: 'Allumer le poste radio' },
  // le retour : le camp vide, Mathis caché, la radio de René, le départ
  { quand: 'entree_lieu', lieu: 'bois_barben', si: { flag: 'camp_attaque', pasFlag: 'retour_vu' }, scene: 'bb_retour', unique: true },
  { quand: 'heure', heure: 21, si: { flag: 'retour_vu', pasFlag: 'mathis_trouve', lieu: 'bois_barben' }, scene: 'bb_mathis_sort' },
  { quand: 'heure', heure: 22, si: { flag: 'mathis_trouve', pasFlag: 'radio_refuge', lieu: 'bois_barben' }, scene: 'bb_radio' },
  { quand: 'heure', heure: 6, si: { flag: 'radio_refuge', heureMax: 11, pasFlag: 'depart_vernegues', lieu: 'bois_barben' }, scene: 'bb_depart' },
  { quand: 'marqueur', lieu: 'bois_barben', marqueur: 'rene_apres', si: { flag: 'radio_refuge', pasFlag: 'depart_vernegues' }, scene: 'bb_rene_depart', libelle: 'Parler à René' },
  // la route de Vernègues : le temple de Château-Bas, le village neuf, la porte du Refuge
  { quand: 'voyage', de: 'bois_barben', vers: 'vernegues', a: 0.35, si: { flag: 'depart_vernegues' }, rencontre: 'rh_chateau_bas', unique: true },
  { quand: 'voyage', de: 'bois_barben', vers: 'vernegues', a: 0.75, si: { flag: 'depart_vernegues' }, rencontre: 'rh_village_neuf', unique: true },
  { quand: 'voyage', de: 'bois_barben', vers: 'vernegues', a: 0.96, si: { flag: 'depart_vernegues' }, rencontre: 'rh_porte_vernegues', unique: true },

  // ═══════════════════════ ACTE I — LE REFUGE ═══════════════════════
  { quand: 'entree_lieu', lieu: 'miramas_le_vieux', si: { pasFlag: 'refuge_arrivee' }, scene: 'ref_porte', unique: true, invite: false },
  // Bastien passe une demi-heure après qu'on t'a enfermé (on ne reste pas des heures à attendre dans le noir) ; « dormir » fait passer la nuit
  { quand: 'heure', jourMin: 1, heure: 19, si: { quete: ['q_refuge', 'quarantaine'], ...AU_REFUGE }, scene: 'ref_nuit_bastien' },
  { quand: 'heure', jourMin: 2, heure: 7, si: { quete: ['q_refuge', 'quarantaine'] }, scene: 'ref_matin' },
  // les corvées (rejouables tant qu'elles ne sont pas faites : une partie fermée en pleine scène ne bloque rien)
  { quand: 'marqueur', lieu: 'miramas_le_vieux', marqueur: 'puits', si: { flag: 'quarantaine_faite', pasFlag: 'eau_faite' }, scene: 'ref_puits', libelle: 'Remonter de l’eau' },
  // la brèche : on parle à Rudy (PNJ `rudy_breche`, scène ref_breche), ou on la barricade soi-même (la porte « la brèche »)
  // la garde de la deuxième nuit
  { quand: 'heure', jourMin: 2, heure: 21, si: { quete: ['q_refuge', 'corvees'] }, scene: 'ref_garde' },
  { quand: 'heure', jourMin: 2, heure: 23, si: { quete: ['q_refuge', 'garde'], ...AU_REFUGE }, scene: 'ref_sirenes' },
  { quand: 'heure', jourMin: 3, heure: 1, si: { quete: ['q_refuge', 'garde'], ...AU_REFUGE }, scene: 'ref_helene_radio' },
  // Noa, l'enveloppe, le départ (même si la garde a mal tourné)
  { quand: 'heure', jourMin: 3, heure: 7, si: { flag: 'quarantaine_faite', pasFlag: 'depart_crau' }, scene: 'ref_noa' },

  // ═══════════════════════ ACTE II — LA BERGERIE ═══════════════════════
  { quand: 'voyage', de: 'miramas_le_vieux', vers: 'bergerie', a: 0.3, si: { pasFlag: 'frappe_faite' }, rencontre: 'rh_triage', unique: true },
  { quand: 'voyage', de: 'miramas_le_vieux', vers: 'bergerie', a: 0.75, si: { pasFlag: 'frappe_faite' }, rencontre: 'rh_draille', unique: true },
  { quand: 'entree_lieu', lieu: 'bergerie', si: { quete: ['q_crau', 'route'] }, scene: 'ber_arrivee', unique: true },
  // Gérard : la zone de la porte de la bergerie lance `ber_gerard` (déclencheur posé par le plan, js/data/niveaux/bergerie.js)
  { quand: 'marqueur', lieu: 'bergerie', marqueur: 'armoire_veto', si: { pasFlag: 'antibio_trouves' }, scene: 'ber_armoire', libelle: 'Examiner l’armoire du vétérinaire' },
  { quand: 'heure', jourMin: 3, heure: 19, si: { lieu: 'bergerie', pasFlag: 'frappe_faite' }, scene: 'ber_soir' },
  // la branche de nuit : on a ouvert l'enveloppe et on rentre avant l'aube
  { quand: 'voyage', de: 'bergerie', vers: 'miramas_le_vieux', a: 0.5, si: { flag: 'retour_nuit', pasFlag: 'frappe_faite' }, rencontre: 'rh_nuit_crau', unique: true },
  { quand: 'entree_lieu', lieu: 'miramas_le_vieux', si: { flag: 'retour_nuit', pasFlag: 'retour_nuit_fait' }, scene: 'ref_retour_nuit', unique: true },
  // la frappe (jour 4, 6 h) : où que l'on soit
  { quand: 'heure', jourMin: 4, heure: 6, si: { flag: 'depart_crau', pasFlag: 'frappe_faite' }, scene: 'frappe_reveil' },
  { quand: 'voyage', de: 'bergerie', vers: 'miramas_le_vieux', a: 0.35, si: { flag: 'frappe_faite', pasFlag: 'retour_nuit' }, rencontre: 'rh_nuage', unique: true },
  { quand: 'voyage', de: 'bergerie', vers: 'miramas_le_vieux', a: 0.75, si: { flag: 'frappe_faite', pasFlag: 'retour_nuit' }, rencontre: 'rh_maree', unique: true },

  // ═══════════════════════ ACTE III — LA CHUTE ═══════════════════════
  { quand: 'entree_lieu', lieu: 'miramas_le_vieux', si: { flag: 'frappe_faite', et: [{ pasFlag: 'siege_commence' }, { pasFlag: 'retour_nuit' }] }, scene: 'siege_debut', unique: true },
  { quand: 'heure', jourMin: 4, heure: 19, si: { flag: 'retour_nuit_fait', pasFlag: 'siege_commence', ...AU_REFUGE }, scene: 'siege_debut_nuit' },
  { quand: 'flag', flag: 'siege_tenu', si: { pasFlag: 'refuge_tombe' }, scene: 'chute' },
  { quand: 'heure', jourMin: 4, heure: 23, si: { flag: 'siege_commence', pasFlag: 'refuge_tombe', ...AU_REFUGE }, scene: 'chute' },
  { quand: 'marqueur', lieu: 'miramas_le_vieux', marqueur: 'infirmerie', si: { flag: 'refuge_tombe', et: [{ pasFlag: 'noa_avec' }, { pasFlag: 'familles_parties' }] }, scene: 'chute_infirmerie', unique: true, libelle: 'Entrer dans l’infirmerie' },
  { quand: 'marqueur', lieu: 'miramas_le_vieux', marqueur: 'radio_helene', si: { flag: 'refuge_tombe', pasFlag: 'helene_vue_chute' }, scene: 'chute_helene', unique: true, libelle: 'Appeler Hélène' },
  { quand: 'marqueur', lieu: 'miramas_le_vieux', marqueur: 'poterne', si: { flag: 'refuge_tombe', pasFlag: 'refuge_fui' }, scene: 'chute_poterne', libelle: 'Passer la poterne' },
  // après la chute : le Refuge mort (on peut y revenir)
  { quand: 'entree_lieu', lieu: 'miramas_le_vieux', si: { flag: 'refuge_fui', pasFlag: 'refuge_revu' }, scene: 'ref_ruines', unique: true },

  // ═══════════════════════ ACTE IV — LA BRUME ═══════════════════════
  { quand: 'voyage', de: 'miramas_le_vieux', vers: 'saint_chamas', a: 0.5, si: { flag: 'refuge_fui', pasFlag: 'brume_vue' }, rencontre: 'rh_sentier', unique: true },
  { quand: 'entree_lieu', lieu: 'saint_chamas', si: { quete: ['q_brume', 'poudrerie'] }, scene: 'pou_arrivee', unique: true },
  { quand: 'heure', jourMin: 5, heure: 14, si: { quete: ['q_brume', 'attendre'], lieu: 'saint_chamas' }, scene: 'pou_jour' },
  { quand: 'heure', jourMin: 5, heure: 20, si: { quete: ['q_brume', 'attendre'], lieu: 'saint_chamas' }, scene: 'pou_odeur' },
  { quand: 'heure', jourMin: 5, heure: 22, si: { quete: ['q_brume', 'attendre'], lieu: 'saint_chamas' }, scene: 'pou_brume' },
  { quand: 'voyage', de: 'saint_chamas', vers: 'cornillon', a: 0.45, si: { flag: 'brume_vue', pasFlag: 'cornillon_arrivee' }, rencontre: 'rh_brume_montee', unique: true },
  { quand: 'entree_lieu', lieu: 'cornillon', si: { quete: ['q_brume', 'fuir'] }, scene: 'cor_arrivee', unique: true },
  { quand: 'heure', jourMin: 6, heure: 7, si: { flag: 'cornillon_arrivee', pasFlag: 'pont_annonce' }, scene: 'cor_aube' },

  // ═══════════════════════ ACTE V — LE PONT ═══════════════════════
  // la colonne (mardi 6 octobre, 20 h) : avec toi si tu es à Cornillon, sinon sans toi
  { quand: 'heure', jourMin: 14, heure: 20, si: { flag: 'pont_annonce', pasFlag: 'colonne_partie', lieu: 'cornillon' }, scene: 'cor_colonne' },
  { quand: 'heure', jourMin: 14, heure: 22, si: { flag: 'pont_annonce', pasFlag: 'colonne_partie' }, scene: 'colonne_sans_toi' },
  { quand: 'voyage', vers: 'mallemort', a: 0.5, si: { flag: 'colonne_avec_toi', pasFlag: 'pont_fait' }, rencontre: 'rh_colonne', unique: true },
  { quand: 'entree_lieu', lieu: 'mallemort', si: { flag: 'pont_annonce', pasFlag: 'pont_fait' }, scene: 'pon_camp', unique: true },
  // l'aube du jour 15 (5 h - 7 h), puis la dernière, le jour 22
  { quand: 'heure', jourMin: 15, heure: 5, si: { lieu: 'mallemort', jourMax: 15, heureMax: 6, pasFlag: 'pont_fait' }, scene: 'pon_aube' },
  { quand: 'heure', jourMin: 15, heure: 7, si: { flag: 'pont_annonce', et: [{ pasFlag: 'pont_fait' }, { pasFlag: 'pont_rate_1' }] }, scene: 'pont_rate' },
  { quand: 'heure', jourMin: 22, heure: 5, si: { lieu: 'mallemort', jourMax: 22, heureMax: 6, flag: 'pont_rate_1', pasFlag: 'pont_fait' }, scene: 'pon_aube_dernier' },
  { quand: 'heure', jourMin: 22, heure: 7, si: { flag: 'pont_rate_1', et: [{ pasFlag: 'pont_fait' }, { pasFlag: 'pont_rate_2' }] }, scene: 'pont_rate_2' },

  // ─────────── LES SIRÈNES (js/data/histoire/ruees.js, posés par js/game/ruees.js) ───────────
  { quand: 'flag', flag: 'ruee_annonce_salon_1', scene: 'ru_salon_annonce', unique: true },
  { quand: 'flag', flag: 'ruee_annonce_plaine_1', scene: 'ru_plaine_annonce', unique: true },

  // ─────────── MISSIONS ───────────
  // La boîte d'Aimé (m_aime) : sous le troisième frêne après la passerelle de la Touloubre, une fois qu'il l'a promise.
  // Pas `unique` : c'est le drapeau posé en la prenant qui la vide (une partie fermée en pleine scène ne la perd pas).
  { quand: 'marqueur', lieu: 'touloubre', marqueur: 'cache_aime', si: { flag: 'aime_cache_promise', pasFlag: 'aime_cache_prise' }, scene: 'aime_cache', libelle: 'Creuser au pied du frêne' },
  // L'Empéri : le camp du professeur Vidal (un refuge habité du monde, on y entre en montrant ses bras)
  { quand: 'marqueur', lieu: 'emperi', marqueur: 'grille_emperi', si: { pasFlag: 'emp_entree_ok' }, scene: 'emp_grille', libelle: 'Appeler les guetteurs', parvis: 8,
    refus: 'Du haut du rempart, un garçon casqué te fait signe de reculer : « On n’ouvre pas avec des morts devant la grille ! Débarrasse-toi d’abord de ceux-là. »' },
];
