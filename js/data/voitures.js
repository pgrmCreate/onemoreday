// ============================================================================
//  VOITURES — les modèles, leurs serrures, leurs alarmes et ce qu'on y trouve de plus
// ============================================================================
// Toutes les voitures sont des meubles de catégorie « voiture » (js/carte/catalogue.js) : la table de butin commune
// (js/data/butin.js, voiture) s'applique à toutes ; `butin` ajoute UNE passe propre au modèle (la trousse de la
// gendarmerie, le placard du camping-car).
//   verrou   part des voitures de ce modèle fermées à clé (tirée une fois, graine du lieu : les deux joueurs voient la même).
//            On ne les fouille qu'après avoir cassé une vitre (explore/interactions.js) — ou forcé la portière au
//            pied-de-biche, plus lentement et plus discrètement.
//   alarme   chance qu'une vitre cassée déclenche l'alarme (forcer la portière : × reglages VOITURES.FORCER.ALARME_MULT).
// Les réglages chiffrés communs (durées, bruit, durée de l'alarme) sont dans REGLAGES.exploration.VOITURES.
const L = (id, a, b, p) => ({ id, q: [a, b], p });

export const VOITURES = {
  voiture:        { verrou: 0.5, alarme: 0.35 },                     // la berline
  citadine:       { verrou: 0.45, alarme: 0.25 },
  break:          { verrou: 0.5, alarme: 0.3,
    butin: [L('couverture', 1, 1, 0.14), L('bouteille_eau', 1, 2, 0.12), L('biscuits', 1, 1, 0.1), L('sac_sport', 1, 1, 0.05), L('bache_plastique', 1, 1, 0.06)] },
  suv:            { verrou: 0.6, alarme: 0.5,
    butin: [L('lampe_torche', 1, 1, 0.08), L('corde', 1, 1, 0.08), L('trousse_outils', 1, 1, 0.04), L('gourde', 1, 1, 0.06), L('jumelles', 1, 1, 0.03)] },
  pickup:         { verrou: 0.35, alarme: 0.15,
    butin: [L('pelle', 1, 1, 0.05), L('corde', 1, 1, 0.1), L('bidon_vide', 1, 1, 0.08), L('essence', 1, 1, 0.06), L('planche', 1, 2, 0.12), L('fil_de_fer', 1, 2, 0.1), L('hachette', 1, 1, 0.03)] },
  voiture_police: { verrou: 0.7, alarme: 0.2,
    butin: [L('matraque', 1, 1, 0.18), L('lampe_torche', 1, 1, 0.2), L('bandage', 1, 2, 0.2), L('fusee_detresse', 1, 2, 0.15), L('sac_police', 1, 1, 0.05),
      L('munitions_9mm', 4, 10, 0.06), L('pistolet_9mm', 1, 1, 0.012), L('gilet_tactique', 1, 1, 0.02)] },
  camping_car:    { verrou: 0.55, alarme: 0.2,
    butin: [L('conserve_raviolis', 1, 3, 0.25), L('pates_seches', 1, 2, 0.2), L('cartouche_gaz', 1, 1, 0.12), L('rechaud_camping', 1, 1, 0.06), L('drap', 1, 1, 0.2),
      L('couverture', 1, 1, 0.15), L('bouteille_eau', 2, 4, 0.2), L('casserole', 1, 1, 0.08), L('sac_couchage', 1, 1, 0.05), L('guide_survie', 1, 1, 0.02)] },
  bus:            { verrou: 0.6, alarme: 0,                          // les portes à soufflet se bloquent ; pas d'alarme
    butin: [L('sac_a_dos', 1, 1, 0.08), L('sac_main', 1, 1, 0.08), L('portefeuille', 1, 1, 0.15), L('telephone_mort', 1, 2, 0.25),
      L('bouteille_eau', 1, 2, 0.15), L('journal_papier', 1, 2, 0.2), L('barre_cereales', 1, 1, 0.1), L('carte_routiere', 1, 1, 0.08)] },
  camionnette:    { verrou: 0.45, alarme: 0.1 },
  ambulance:      { verrou: 0.2, alarme: 0 },
  camion_mil:     { verrou: 0.3, alarme: 0 },
};
export const voitureDef = (type) => VOITURES[type] || null;
