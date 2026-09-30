// ============ PNJ (REFONTE §4.9) ============
// EXTENSION documentée : `si` (CONDITION) — le PNJ n'est présent dans le niveau que si la condition est vraie.
// Un même personnage peut avoir plusieurs entrées (lieux ou états différents). `portrait` : voir HISTOIRE.md §6.
export const PNJ = {
  maud:            { nom: 'Maud Sérane', portrait: 'maud', lieu: 'nostradamus', marqueur: 'maud', scene: 'maud_parler', si: { flag: 'ch1_matin_fait', pasFlag: 'sonnailles_commencees' } },
  vidal:           { nom: 'Julien Vidal', portrait: 'vidal', lieu: 'emperi', marqueur: 'vidal', scene: 'vidal_parler', si: { flag: 'emp_entree_ok', pasFlag: 'siege_fait' } },
  vidal_porte:     { nom: 'Julien Vidal', portrait: 'vidal', lieu: 'emperi', marqueur: 'porte_emperi', scene: 'vidal_parler', si: { flagEgal: ['emp_statut', 'rejete'], pasFlag: 'emp_entree_ok' } },
  lou_emperi:      { nom: 'Lou', portrait: 'lou', lieu: 'emperi', marqueur: 'lou_rempart', scene: 'lou_parler', si: { flag: 'lou_sauvee', pasFlag: 'siege_fait' } },
  lou_cales:       { nom: 'Lou', portrait: 'lou', lieu: 'cales', marqueur: 'lou_cales', scene: 'lou_parler_cales', si: { flag: 'ch1_fini', pasFlag: 'mistral_leve' } },
  joelle:          { nom: 'Joëlle', portrait: 'joelle', lieu: 'cales', marqueur: 'joelle', scene: 'joelle_parler', si: { flag: 'cales_arrivee', pasFlag: 'mistral_leve' } },
  clemence:        { nom: 'Clémence', portrait: 'clemence', lieu: 'cales', marqueur: 'clemence', scene: 'clemence_parler', si: { flag: 'cales_arrivee', pasFlag: 'mistral_leve' } },
  maud_captive:    { nom: 'Maud Sérane', portrait: 'maud', lieu: 'cales', marqueur: 'grotte_puits', scene: 'maud_captive_parler', si: { flag: 'maud_captive', pasFlag: 'mistral_leve' } },
  maud_medecin:    { nom: 'Maud Sérane', portrait: 'maud', lieu: 'cales', marqueur: 'grotte_infirmerie', scene: 'maud_medecin_parler', si: { flag: 'maud_medecin', pasFlag: 'mistral_leve' } },
  berger:          { nom: 'Le Berger', portrait: 'berger', lieu: 'vernegues', marqueur: 'berger', scene: 'berger_parler', si: { flag: 'vernegues_visite', pasFlag: 'mistral_leve' } },
  rose:            { nom: 'Rose', portrait: 'rose', lieu: 'vernegues', marqueur: 'rose', scene: 'rose_parler', si: { flag: 'vernegues_visite', pasFlag: 'mistral_leve' } },
  nadege:          { nom: 'Nadège', portrait: 'nadege', lieu: 'vernegues', marqueur: 'nadege', scene: 'nadege_parler', si: { flag: 'vernegues_visite', pasFlag: 'mistral_leve' } },
  imbert:          { nom: 'Imbert', portrait: 'imbert', lieu: 'senas', marqueur: 'imbert', scene: 'imbert_parler', si: { flag: 'senas_restent' } },
};
