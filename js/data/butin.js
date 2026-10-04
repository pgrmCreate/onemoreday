// ============================================================================
//  BUTIN — tables par type de lieu × catégorie de meuble
// ============================================================================
// Une ligne : { id, q: [min, max], p }  — p = chance (0..1) que la ligne sorte à UNE passe.
// Une table de lieu REMPLACE la table `defaut` pour cette catégorie (les catégories absentes retombent sur `defaut`).
//
// RÈGLE DE TIRAGE (implémentée plus bas : tirerButin) — une seule fois par meuble, à sa 1re fouille,
// avec seedRng(G.world.seed + ':butin:' + lieuId + ':' + etage + ':' + x + ',' + y) :
//   passes = min(fouille.TIRAGES_MAX, ceil(fouille.TIRAGES + fouille.TIRAGES_PAR_CASE × (taille − 1)))  (taille = cases du meuble)
//   pour chaque passe, pour chaque ligne : sort si rng() < min(0,95, p × M), quantité uniforme dans q.
//   M = abondance(danger du lieu) × lieu.abondance (lieux_gameplay, défaut 1) × difficulté.butin
//       × (co-op ? coop.BUTIN_MULT : 1) × (à tâtons ? 0,75 : 1)
//       × (ligne « de base » — nourriture, boisson, bandages — ? courbe.butinBase du jour : 1)
//       × (catégorie frigo ? pourriture du jour : 1)
// Les objets sortent dans l'ordre de la table et se révèlent au fil de la barre de fouille.
//
// Types de lieux : ceux de js/data/lieux.js (+ 'savonnerie', 'route', 'nature', et 'voyage' pour les rencontres).
// Économie visée (docs/GAMEPLAY.md §Butin) : ~1 objet par meuble ordinaire ; 1 meuble sur 4 vide ;
// les lieux dangereux paient mieux ; l'arme à feu reste un événement.
// ============================================================================

import { REGLAGES } from './reglages.js';
import { ITEMS } from './items.js';

const L = (id, a, b, p) => ({ id, q: [a, b], p });
const plus = (...tables) => tables.flat();

// ---------------------------------------------------------------------------
// DÉFAUT — un appartement, un bureau, une rue ordinaires de Salon
// ---------------------------------------------------------------------------
const D = {
  vetements: [
    L('tshirt', 1, 1, 0.16), L('sweat_capuche', 1, 1, 0.1), L('pull_laine', 1, 1, 0.1), L('jean', 1, 1, 0.1),
    L('jogging', 1, 1, 0.08), L('gants_laine', 1, 1, 0.06), L('bonnet', 1, 1, 0.06), L('casquette', 1, 1, 0.05),
    L('manteau_hiver', 1, 1, 0.04), L('veste_cuir', 1, 1, 0.025), L('baskets', 1, 1, 0.05), L('bottes_cuir', 1, 1, 0.02),
    L('ceinture_cuir', 1, 1, 0.06), L('sacoche', 1, 1, 0.03), L('sac_a_dos', 1, 1, 0.03),
    L('drap', 1, 1, 0.12), L('chiffon', 1, 2, 0.15), L('trousse_couture', 1, 1, 0.04), L('photo_famille', 1, 1, 0.03),
  ],
  frigo: [
    L('bouteille_eau', 1, 2, 0.25), L('soda', 1, 2, 0.22), L('jus_fruits', 1, 1, 0.12), L('compote', 1, 2, 0.08),
    L('viande_crue', 1, 1, 0.06), L('olives', 1, 1, 0.05), L('alcool_fort', 1, 1, 0.04), L('poisson_cru', 1, 1, 0.03),
  ],
  cuisine: [
    L('conserve_haricots', 1, 2, 0.22), L('conserve_raviolis', 1, 1, 0.16), L('conserve_thon', 1, 2, 0.12),
    L('pates_seches', 1, 1, 0.2), L('biscuits', 1, 1, 0.12), L('cafe_soluble', 1, 1, 0.08), L('huile_olive', 1, 1, 0.1),
    L('miel', 1, 1, 0.05), L('casserole', 1, 1, 0.08), L('couteau_cuisine', 1, 1, 0.1), L('ouvre_boite', 1, 1, 0.1),
    L('allumettes', 1, 1, 0.1), L('briquet', 1, 1, 0.04), L('bouteille_vide', 1, 1, 0.12), L('sac_plastique', 1, 2, 0.15),
    L('alcool_fort', 1, 1, 0.05), L('boite_vide', 1, 2, 0.08), L('cabas_courses', 1, 1, 0.04),
  ],
  etagere: [
    L('journal_papier', 1, 2, 0.18), L('scotch', 1, 1, 0.1), L('piles', 1, 1, 0.08), L('clous', 2, 6, 0.06),
    L('corde', 1, 1, 0.04), L('lampe_torche', 1, 1, 0.03), L('visserie', 1, 2, 0.08), L('cable_electrique', 1, 1, 0.07),
    L('canette_vide', 1, 2, 0.08), L('bouteille_vide', 1, 1, 0.08), L('reveil', 1, 1, 0.05), L('telephone_mort', 1, 1, 0.07),
    L('fil_de_fer', 1, 1, 0.05), L('manche_balai', 1, 1, 0.04), L('guide_survie', 1, 1, 0.01),
  ],
  bureau: [
    L('journal_papier', 1, 2, 0.22), L('scotch', 1, 1, 0.14), L('piles', 1, 1, 0.13), L('telephone_mort', 1, 1, 0.14),
    L('visserie', 1, 1, 0.06), L('cable_electrique', 1, 1, 0.08), L('tournevis', 1, 1, 0.05), L('cafe_soluble', 1, 1, 0.06),
    L('barre_cereales', 1, 2, 0.1), L('chocolat', 1, 1, 0.07), L('lampe_torche', 1, 1, 0.03), L('reveil', 1, 1, 0.05),
    L('portefeuille', 1, 1, 0.06), L('antidouleur', 1, 1, 0.04), L('manuel_bricolage', 1, 1, 0.012), L('revue_mecanique', 1, 1, 0.012),
  ],
  comptoir: [
    L('barre_cereales', 1, 2, 0.18), L('chips', 1, 1, 0.14), L('soda', 1, 1, 0.14), L('briquet', 1, 1, 0.1),
    L('allumettes', 1, 1, 0.07), L('chocolat', 1, 1, 0.09), L('journal_papier', 1, 1, 0.1), L('scotch', 1, 1, 0.07),
    L('piles', 1, 1, 0.08), L('sac_plastique', 1, 3, 0.18),
  ],
  caisse: [
    L('portefeuille', 1, 1, 0.25), L('piles', 1, 1, 0.07), L('briquet', 1, 1, 0.08), L('scotch', 1, 1, 0.05),
    L('trousse_couture', 1, 1, 0.02),
  ],
  lit: [
    L('drap', 1, 1, 0.35), L('chiffon', 1, 1, 0.08), L('photo_famille', 1, 1, 0.05), L('lampe_torche', 1, 1, 0.03),
    L('reveil', 1, 1, 0.1), L('antidouleur', 1, 1, 0.05), L('cafe_soluble', 1, 1, 0.02), L('pistolet_9mm', 1, 1, 0.004),
    L('munitions_9mm', 2, 6, 0.01), L('couteau_cuisine', 1, 1, 0.02),
  ],
  salle_de_bain: [
    L('savon', 1, 1, 0.28), L('lingette', 1, 1, 0.14), L('bandage', 1, 1, 0.1), L('desinfectant', 1, 1, 0.09),
    L('antidouleur', 1, 1, 0.1), L('antibiotiques', 1, 1, 0.025), L('vitamines', 1, 1, 0.07), L('kit_suture', 1, 1, 0.015),
    L('chiffon', 1, 2, 0.12), L('charbon_actif', 1, 1, 0.03), L('eclat_verre', 1, 1, 0.05),
  ],
  voiture: [
    L('bouteille_eau', 1, 1, 0.14), L('soda', 1, 1, 0.08), L('barre_cereales', 1, 2, 0.12), L('chips', 1, 1, 0.07),
    L('lampe_torche', 1, 1, 0.07), L('piles', 1, 1, 0.06), L('tuyau_plastique', 1, 1, 0.05), L('cable_electrique', 1, 1, 0.07),
    L('trousse_outils', 1, 1, 0.025), L('cle_molette', 1, 1, 0.04), L('ressort', 1, 1, 0.07), L('chiffon', 1, 1, 0.08),
    L('briquet', 1, 1, 0.06), L('sac_a_dos', 1, 1, 0.03), L('photo_famille', 1, 1, 0.04), L('telephone_mort', 1, 1, 0.1),
    L('bidon_vide', 1, 1, 0.02), L('fusee_detresse', 1, 1, 0.02),
  ],
  poubelle: [
    L('canette_vide', 1, 2, 0.32), L('bouteille_vide', 1, 1, 0.22), L('sac_plastique', 1, 2, 0.28), L('journal_papier', 1, 1, 0.14),
    L('chiffon', 1, 1, 0.1), L('eclat_verre', 1, 1, 0.08), L('boite_vide', 1, 2, 0.2), L('telephone_mort', 1, 1, 0.04),
    L('manche_balai', 1, 1, 0.03),
  ],
  machine: [ // distributeurs automatiques, par défaut
    L('soda', 1, 2, 0.35), L('chips', 1, 2, 0.28), L('barre_cereales', 1, 2, 0.28), L('chocolat', 1, 1, 0.22),
    L('bouteille_eau', 1, 1, 0.15),
  ],
  table: [
    L('journal_papier', 1, 1, 0.14), L('briquet', 1, 1, 0.04), L('piles', 1, 1, 0.04), L('bouteille_vide', 1, 1, 0.08),
    L('canette_vide', 1, 1, 0.08), L('eclat_verre', 1, 1, 0.04), L('couteau_cuisine', 1, 1, 0.03), L('chiffon', 1, 1, 0.04),
    L('telephone_mort', 1, 1, 0.05), L('lampe_torche', 1, 1, 0.02), L('cafe_soluble', 1, 1, 0.03), L('barre_cereales', 1, 1, 0.05),
  ],
  canape: [
    L('portefeuille', 1, 1, 0.08), L('telephone_mort', 1, 1, 0.08), L('piles', 1, 1, 0.05), L('briquet', 1, 1, 0.05),
    L('chips', 1, 1, 0.05), L('chiffon', 1, 1, 0.05), L('munitions_9mm', 1, 3, 0.004),
  ],
};

// Petits ensembles réutilisés
const RAYON_EPICERIE = [ // rayons déjà écumés par la panique des derniers jours : on glane, on ne remplit pas un caddie
  L('conserve_haricots', 1, 2, 0.18), L('conserve_raviolis', 1, 1, 0.13), L('conserve_thon', 1, 2, 0.12),
  L('pates_seches', 1, 2, 0.18), L('biscuits', 1, 1, 0.12), L('chips', 1, 2, 0.1), L('chocolat', 1, 1, 0.08),
  L('barre_cereales', 1, 2, 0.1), L('cafe_soluble', 1, 1, 0.06), L('huile_olive', 1, 1, 0.07), L('miel', 1, 1, 0.04),
  L('olives', 1, 1, 0.06), L('compote', 1, 2, 0.06), L('croquettes', 1, 1, 0.04),
];
const RAYON_BOISSONS = [
  L('bouteille_eau', 1, 2, 0.35), L('soda', 1, 2, 0.28), L('jus_fruits', 1, 1, 0.15), L('alcool_fort', 1, 1, 0.08),
];
const RAYON_BAZAR = [
  L('piles', 1, 1, 0.12), L('briquet', 1, 1, 0.08), L('allumettes', 1, 1, 0.08), L('scotch', 1, 1, 0.1),
  L('sac_plastique', 1, 2, 0.12), L('lingette', 1, 1, 0.05), L('savon', 1, 1, 0.05), L('ouvre_boite', 1, 1, 0.05),
  L('lampe_torche', 1, 1, 0.03), L('petards', 1, 1, 0.02),
];
const OUTILLAGE = [
  L('clous', 3, 10, 0.35), L('visserie', 1, 3, 0.35), L('scotch', 1, 2, 0.3), L('fil_de_fer', 1, 2, 0.28),
  L('corde', 1, 1, 0.16), L('planche', 1, 2, 0.2), L('cable_electrique', 1, 2, 0.18), L('marteau', 1, 1, 0.08),
  L('tournevis', 1, 1, 0.1), L('cle_molette', 1, 1, 0.07), L('pied_de_biche', 1, 1, 0.05), L('pince_coupante', 1, 1, 0.05),
  L('trousse_outils', 1, 1, 0.03), L('pierre_aiguiser', 1, 1, 0.07), L('manche_balai', 1, 1, 0.1), L('bache_plastique', 1, 1, 0.1),
  L('gants_cuir', 1, 1, 0.06), L('casque_chantier', 1, 1, 0.05), L('tuyau_acier', 1, 1, 0.06), L('brique', 1, 2, 0.08),
];
const SECOURS = [
  L('bandage', 1, 2, 0.3), L('desinfectant', 1, 1, 0.22), L('lingette', 1, 2, 0.15), L('antidouleur', 1, 2, 0.2),
  L('attelle', 1, 1, 0.08), L('kit_suture', 1, 1, 0.06), L('antibiotiques', 1, 1, 0.05),
];

// ---------------------------------------------------------------------------
export const BUTIN = {
  defaut: D,

  // ─────────── Salon ───────────
  hotel: {
    vetements: plus(D.vetements, [L('sac_a_dos', 1, 1, 0.06), L('sacoche', 1, 1, 0.05), L('trousse_couture', 1, 1, 0.08), L('manteau_hiver', 1, 1, 0.03)]),
    lit: [L('drap', 1, 1, 0.45), L('chiffon', 1, 1, 0.1), L('reveil', 1, 1, 0.14), L('photo_famille', 1, 1, 0.05), L('antidouleur', 1, 1, 0.05), L('lampe_torche', 1, 1, 0.03)],
    salle_de_bain: [L('savon', 1, 2, 0.5), L('lingette', 1, 1, 0.15), L('antidouleur', 1, 1, 0.1), L('bandage', 1, 1, 0.06), L('desinfectant', 1, 1, 0.05), L('trousse_couture', 1, 1, 0.1), L('chiffon', 1, 2, 0.15)],
    comptoir: [L('briquet', 1, 1, 0.12), L('allumettes', 1, 2, 0.15), L('journal_papier', 1, 2, 0.2), L('piles', 1, 2, 0.14), L('lampe_torche', 1, 1, 0.08), L('scotch', 1, 1, 0.1), L('bandage', 1, 1, 0.1), L('desinfectant', 1, 1, 0.06), L('trousse_couture', 1, 1, 0.05)],
    cuisine: plus(D.cuisine, [L('conserve_haricots', 2, 4, 0.2), L('pates_seches', 1, 3, 0.2), L('huile_olive', 1, 2, 0.15), L('casserole', 1, 1, 0.12), L('alcool_fort', 1, 2, 0.12)]),
    frigo: plus(D.frigo, [L('soda', 1, 2, 0.1), L('alcool_fort', 1, 1, 0.08)]),
  },
  place: {
    table: plus(D.table, [L('journal_papier', 1, 1, 0.15), L('canette_vide', 1, 2, 0.15), L('briquet', 1, 1, 0.05)]),
    comptoir: plus(D.comptoir, [L('journal_papier', 1, 3, 0.25), L('petards', 1, 1, 0.03)]),
    voiture: D.voiture,
  },
  monument: {
    etagere: [L('journal_papier', 1, 2, 0.2), L('corde', 1, 1, 0.08), L('lampe_torche', 1, 1, 0.05), L('chiffon', 1, 1, 0.1), L('planche', 1, 1, 0.08), L('fusee_detresse', 1, 1, 0.02)],
    bureau: plus(D.bureau, [L('journal_papier', 1, 2, 0.2)]),
  },
  mairie: {
    bureau: plus(D.bureau, [L('journal_papier', 1, 3, 0.25), L('piles', 1, 2, 0.1), L('scotch', 1, 2, 0.1), L('lampe_torche', 1, 1, 0.05)]),
    etagere: [L('journal_papier', 2, 4, 0.45), L('scotch', 1, 1, 0.12), L('piles', 1, 1, 0.08), L('visserie', 1, 1, 0.06), L('corde', 1, 1, 0.04)],
    cuisine: [L('cafe_soluble', 1, 2, 0.3), L('biscuits', 1, 1, 0.18), L('chocolat', 1, 1, 0.12), L('casserole', 1, 1, 0.05), L('bouteille_vide', 1, 2, 0.12), L('ouvre_boite', 1, 1, 0.05)],
    comptoir: plus(D.comptoir, [L('bandage', 1, 1, 0.08), L('desinfectant', 1, 1, 0.04)]),
  },
  chateau: { // l'Empéri : musée d'art et d'histoire militaire, jardin des Simples
    etagere: [L('sabre_cavalerie', 1, 1, 0.08), L('couteau_combat', 1, 1, 0.03), L('herbes_simples', 1, 3, 0.18), L('chiffon', 1, 2, 0.15), L('drap', 1, 1, 0.1), L('corde', 1, 1, 0.1), L('planche', 1, 1, 0.1), L('journal_papier', 1, 1, 0.12)],
    comptoir: [L('traite_confitures', 1, 1, 0.08), L('herbes_simples', 1, 2, 0.15), L('savon', 1, 2, 0.15), L('miel', 1, 1, 0.1), L('journal_papier', 1, 2, 0.15), L('barre_cereales', 1, 1, 0.1)],
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.06)]),
    table: [L('herbes_simples', 1, 2, 0.25), L('chiffon', 1, 1, 0.1), L('journal_papier', 1, 1, 0.1)],
  },
  musee: { // Maison de Nostradamus
    comptoir: [L('traite_confitures', 1, 1, 0.12), L('herbes_simples', 1, 2, 0.15), L('savon', 1, 2, 0.2), L('miel', 1, 1, 0.12), L('journal_papier', 1, 2, 0.15), L('chocolat', 1, 1, 0.08)],
    etagere: [L('herbes_simples', 1, 2, 0.15), L('journal_papier', 1, 2, 0.15), L('chiffon', 1, 1, 0.1), L('traite_confitures', 1, 1, 0.04), L('lampe_torche', 1, 1, 0.04), L('corde', 1, 1, 0.05)],
    bureau: plus(D.bureau, [L('traite_confitures', 1, 1, 0.03)]),
  },
  eglise: {
    etagere: [L('allumettes', 1, 2, 0.25), L('alcool_fort', 1, 1, 0.1), L('chiffon', 1, 2, 0.18), L('drap', 1, 1, 0.1), L('journal_papier', 1, 2, 0.12), L('huile_olive', 1, 1, 0.08), L('corde', 1, 1, 0.06), L('lampe_torche', 1, 1, 0.03)],
    bureau: plus(D.bureau, [L('allumettes', 1, 1, 0.1)]),
    table: [L('allumettes', 1, 1, 0.15), L('chiffon', 1, 1, 0.12), L('journal_papier', 1, 1, 0.08)],
    caisse: [L('portefeuille', 1, 1, 0.1), L('photo_famille', 1, 1, 0.1), L('briquet', 1, 1, 0.05)],
    cuisine: plus(D.cuisine, [L('alcool_fort', 1, 1, 0.1)]),
  },
  superette: {
    etagere: plus(RAYON_EPICERIE, RAYON_BAZAR),
    frigo: plus(RAYON_BOISSONS, [L('compote', 1, 2, 0.1)]),
    comptoir: [L('briquet', 1, 2, 0.3), L('allumettes', 1, 2, 0.18), L('journal_papier', 1, 2, 0.2), L('chocolat', 1, 2, 0.2), L('barre_cereales', 1, 2, 0.2), L('petards', 1, 1, 0.05), L('piles', 1, 1, 0.12)],
    caisse: plus(D.caisse, [L('sac_plastique', 1, 3, 0.2), L('cabas_courses', 1, 1, 0.12)]),
    machine: D.machine,
  },
  supermarche: {
    etagere: plus(RAYON_EPICERIE, RAYON_BAZAR, [
      L('casserole', 1, 1, 0.06), L('couteau_cuisine', 1, 1, 0.06), L('gourde', 1, 1, 0.04), L('thermos', 1, 1, 0.03),
      L('corde', 1, 1, 0.05), L('bache_plastique', 1, 1, 0.04), L('bouteille_vide', 1, 2, 0.08),
    ]),
    frigo: plus(RAYON_BOISSONS, [L('viande_crue', 1, 2, 0.12), L('poisson_cru', 1, 2, 0.06), L('compote', 1, 2, 0.1)]),
    comptoir: [L('briquet', 1, 2, 0.25), L('allumettes', 1, 1, 0.15), L('chocolat', 1, 2, 0.2), L('piles', 1, 2, 0.15), L('journal_papier', 1, 2, 0.15)],
    caisse: plus(D.caisse, [L('sac_plastique', 1, 3, 0.25), L('cabas_courses', 1, 1, 0.15)]),
    machine: D.machine,
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.05)]),
  },
  hypermarche: {
    etagere: plus(RAYON_EPICERIE, RAYON_BAZAR, [
      L('casserole', 1, 1, 0.07), L('couteau_cuisine', 1, 1, 0.07), L('gourde', 1, 1, 0.06), L('thermos', 1, 1, 0.04),
      L('rechaud_camping', 1, 1, 0.03), L('cartouche_gaz', 1, 2, 0.06), L('batte_baseball', 1, 1, 0.025),
      L('canne_peche', 1, 1, 0.025), L('jumelles', 1, 1, 0.015), L('lampe_frontale', 1, 1, 0.025), L('corde', 1, 1, 0.06),
      L('bache_plastique', 1, 1, 0.05), L('petards', 1, 1, 0.03), L('vitamines', 1, 1, 0.06), L('bidon_vide', 1, 1, 0.03),
    ]),
    vetements: [
      L('jean', 1, 1, 0.14), L('jogging', 1, 1, 0.14), L('pull_laine', 1, 1, 0.1), L('sweat_capuche', 1, 1, 0.12),
      L('manteau_hiver', 1, 1, 0.07), L('gants_laine', 1, 1, 0.1), L('bonnet', 1, 1, 0.1), L('baskets', 1, 1, 0.1),
      L('sac_a_dos', 1, 1, 0.08), L('sac_randonnee', 1, 1, 0.02), L('ceinture_cuir', 1, 1, 0.08), L('bottes_caoutchouc', 1, 1, 0.04),
      L('pantalon_cargo', 1, 1, 0.06), L('poncho_pluie', 1, 1, 0.03),
    ],
    frigo: plus(RAYON_BOISSONS, [L('viande_crue', 1, 2, 0.15), L('compote', 1, 2, 0.12)]),
    comptoir: [L('briquet', 1, 2, 0.25), L('allumettes', 1, 1, 0.15), L('chocolat', 1, 2, 0.2), L('piles', 1, 2, 0.18), L('journal_papier', 1, 2, 0.15), L('petards', 1, 1, 0.04)],
    caisse: plus(D.caisse, [L('sac_plastique', 1, 3, 0.25), L('cabas_courses', 1, 1, 0.15)]),
    machine: D.machine,
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.06)]),
  },
  pharmacie: {
    etagere: [
      L('bandage', 1, 3, 0.35), L('desinfectant', 1, 2, 0.3), L('lingette', 1, 2, 0.25), L('antidouleur', 1, 2, 0.3),
      L('vitamines', 1, 2, 0.25), L('charbon_actif', 1, 1, 0.15), L('antibiotiques', 1, 1, 0.08), L('kit_suture', 1, 1, 0.06),
      L('savon', 1, 2, 0.2), L('compote', 1, 2, 0.08), L('attelle', 1, 1, 0.04), L('herbes_simples', 1, 1, 0.05),
    ],
    comptoir: [L('antibiotiques', 1, 2, 0.12), L('antidouleur', 1, 2, 0.2), L('bandage', 1, 2, 0.2), L('kit_suture', 1, 1, 0.08), L('desinfectant', 1, 1, 0.15), L('charbon_actif', 1, 1, 0.08), L('precis_secourisme', 1, 1, 0.02)],
    bureau: plus(D.bureau, [L('antibiotiques', 1, 1, 0.05), L('precis_secourisme', 1, 1, 0.03)]),
    frigo: [L('bouteille_eau', 1, 1, 0.15), L('compote', 1, 2, 0.15), L('soda', 1, 1, 0.08)],
  },
  mediatheque: {
    etagere: [
      L('journal_papier', 1, 3, 0.5), L('manuel_bricolage', 1, 1, 0.05), L('guide_survie', 1, 1, 0.05),
      L('precis_secourisme', 1, 1, 0.04), L('carnet_chasseur', 1, 1, 0.02), L('revue_mecanique', 1, 1, 0.04),
      L('cuisine_provencale', 1, 1, 0.05), L('traite_confitures', 1, 1, 0.02), L('scotch', 1, 1, 0.06),
    ],
    bureau: plus(D.bureau, [L('journal_papier', 1, 2, 0.2), L('guide_survie', 1, 1, 0.03)]),
    comptoir: plus(D.comptoir, [L('journal_papier', 1, 2, 0.2)]),
    machine: D.machine,
  },
  cinema: {
    comptoir: [L('chips', 1, 3, 0.35), L('chocolat', 1, 3, 0.3), L('soda', 1, 3, 0.35), L('barre_cereales', 1, 2, 0.2), L('bouteille_eau', 1, 2, 0.15), L('briquet', 1, 1, 0.05)],
    bureau: [L('lampe_torche', 1, 1, 0.12), L('piles', 1, 2, 0.18), L('scotch', 1, 2, 0.18), L('cable_electrique', 1, 2, 0.18), L('trousse_outils', 1, 1, 0.04), L('tournevis', 1, 1, 0.08), L('cafe_soluble', 1, 1, 0.1)],
    etagere: [L('chips', 1, 2, 0.2), L('soda', 1, 3, 0.25), L('chocolat', 1, 2, 0.15), L('cable_electrique', 1, 1, 0.1), L('scotch', 1, 1, 0.08), L('journal_papier', 1, 2, 0.1)],
    machine: D.machine,
  },
  savonnerie: { // Marius Fabre
    etagere: [L('savon', 2, 6, 0.8), L('huile_olive', 1, 2, 0.35), L('herbes_simples', 1, 2, 0.12), L('chiffon', 1, 3, 0.2), L('bache_plastique', 1, 1, 0.08), L('corde', 1, 1, 0.08)],
    machine: [L('huile_olive', 1, 2, 0.3), L('savon', 1, 3, 0.3), L('visserie', 1, 2, 0.2), L('cle_molette', 1, 1, 0.08), L('tuyau_acier', 1, 1, 0.06)],
    comptoir: [L('savon', 2, 4, 0.6), L('huile_olive', 1, 1, 0.15), L('herbes_simples', 1, 1, 0.1), L('journal_papier', 1, 1, 0.1)],
    vetements: [L('gants_cuir', 1, 1, 0.15), L('pantalon_cargo', 1, 1, 0.1), L('bottes_caoutchouc', 1, 1, 0.1), L('chiffon', 1, 2, 0.2)],
  },
  usine: { // la Poudrerie de Saint-Chamas (et toute usine sans table dédiée)
    machine: [L('trousse_outils', 1, 1, 0.07), L('cle_molette', 1, 1, 0.12), L('visserie', 1, 3, 0.3), L('ressort', 1, 2, 0.15), L('cable_electrique', 1, 2, 0.2), L('tuyau_acier', 1, 1, 0.1), L('fil_de_fer', 1, 2, 0.15), L('essence', 1, 1, 0.05)],
    etagere: plus(OUTILLAGE.slice(0, 12), [L('fusee_detresse', 1, 1, 0.04)]),
    vetements: [L('pantalon_cargo', 1, 1, 0.12), L('gants_cuir', 1, 1, 0.15), L('rangers', 1, 1, 0.06), L('casque_chantier', 1, 1, 0.1), L('veste_cuir', 1, 1, 0.03)],
    bureau: plus(D.bureau, [L('revue_mecanique', 1, 1, 0.03)]),
  },
  cimetiere: {
    etagere: [L('pelle', 1, 1, 0.25), L('corde', 1, 1, 0.12), L('gants_cuir', 1, 1, 0.12), L('fil_de_fer', 1, 1, 0.1), L('planche', 1, 1, 0.12), L('bache_plastique', 1, 1, 0.1), L('herbes_simples', 1, 1, 0.08), L('allumettes', 1, 1, 0.08)],
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.06)]),
    table: [L('allumettes', 1, 1, 0.12), L('photo_famille', 1, 1, 0.15), L('bouteille_vide', 1, 1, 0.1)],
  },
  gare: {
    comptoir: [L('journal_papier', 1, 3, 0.3), L('piles', 1, 1, 0.1), L('briquet', 1, 1, 0.1), L('chocolat', 1, 1, 0.12), L('barre_cereales', 1, 2, 0.15), L('bouteille_eau', 1, 1, 0.12), L('lampe_torche', 1, 1, 0.04)],
    machine: plus(D.machine, [L('bouteille_eau', 1, 2, 0.15)]),
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.08), L('cle_molette', 1, 1, 0.05), L('radio_portable', 1, 1, 0.03), L('fusee_detresse', 1, 1, 0.06)]),
    vetements: [L('sac_a_dos', 1, 1, 0.1), L('sacoche', 1, 1, 0.1), L('manteau_hiver', 1, 1, 0.06), L('pull_laine', 1, 1, 0.08), L('sweat_capuche', 1, 1, 0.08), L('baskets', 1, 1, 0.05), L('gourde', 1, 1, 0.04), L('photo_famille', 1, 1, 0.06)],
    etagere: plus(D.etagere, [L('chips', 1, 2, 0.12), L('bouteille_eau', 1, 1, 0.1)]),
  },
  commissariat: {
    bureau: [L('munitions_9mm', 3, 10, 0.1), L('matraque', 1, 1, 0.05), L('lampe_torche', 1, 1, 0.12), L('piles', 1, 2, 0.15), L('kit_nettoyage', 1, 1, 0.04), L('radio_portable', 1, 1, 0.04), L('cafe_soluble', 1, 1, 0.18), L('journal_papier', 1, 2, 0.15), L('antidouleur', 1, 1, 0.05)],
    vetements: [L('gilet_tactique', 1, 1, 0.04), L('rangers', 1, 1, 0.12), L('ceinture_cuir', 1, 1, 0.12), L('holster_cuisse', 1, 1, 0.08), L('gants_cuir', 1, 1, 0.1), L('pantalon_cargo', 1, 1, 0.08), L('lampe_torche', 1, 1, 0.06)],
    etagere: [L('pistolet_9mm', 1, 1, 0.025), L('munitions_9mm', 4, 12, 0.14), L('matraque', 1, 1, 0.1), L('lampe_torche', 1, 1, 0.1), L('piles', 1, 2, 0.12), L('bandage', 1, 1, 0.08), L('kit_nettoyage', 1, 1, 0.05), L('couteau_combat', 1, 1, 0.03), L('batte_baseball', 1, 1, 0.03), L('pied_de_biche', 1, 1, 0.03)],
    comptoir: plus(D.comptoir, [L('bandage', 1, 1, 0.06)]),
  },
  gendarmerie: {
    bureau: [L('munitions_9mm', 3, 10, 0.1), L('lampe_torche', 1, 1, 0.12), L('piles', 1, 2, 0.15), L('jumelles', 1, 1, 0.05), L('kit_nettoyage', 1, 1, 0.05), L('radio_portable', 1, 1, 0.05), L('cafe_soluble', 1, 1, 0.15), L('cartouches', 2, 6, 0.04)],
    vetements: [L('gilet_tactique', 1, 1, 0.05), L('rangers', 1, 1, 0.14), L('ceinture_cuir', 1, 1, 0.12), L('holster_cuisse', 1, 1, 0.1), L('gants_cuir', 1, 1, 0.1), L('treillis', 1, 1, 0.08), L('manteau_hiver', 1, 1, 0.06)],
    etagere: [L('pistolet_9mm', 1, 1, 0.03), L('munitions_9mm', 4, 12, 0.15), L('fusil_chasse', 1, 1, 0.015), L('cartouches', 2, 8, 0.08), L('couteau_combat', 1, 1, 0.06), L('matraque', 1, 1, 0.08), L('jumelles', 1, 1, 0.05), L('bandage', 1, 2, 0.1), L('fusee_detresse', 1, 1, 0.06)],
    comptoir: D.comptoir,
  },
  caserne: {
    vetements: [L('veste_pompier', 1, 1, 0.22), L('casque_pompier', 1, 1, 0.12), L('rangers', 1, 1, 0.18), L('gants_cuir', 1, 1, 0.18), L('pantalon_cargo', 1, 1, 0.1), L('bottes_caoutchouc', 1, 1, 0.08)],
    etagere: plus(SECOURS, [L('hache_pompier', 1, 1, 0.07), L('pied_de_biche', 1, 1, 0.08), L('corde', 1, 2, 0.25), L('lampe_torche', 1, 1, 0.12), L('lampe_frontale', 1, 1, 0.05), L('piles', 1, 2, 0.14), L('precis_secourisme', 1, 1, 0.04), L('fusee_detresse', 1, 1, 0.05)]),
    machine: [L('trousse_outils', 1, 1, 0.1), L('cle_molette', 1, 1, 0.14), L('tuyau_plastique', 1, 1, 0.1), L('cable_electrique', 1, 1, 0.1), L('essence', 1, 1, 0.08), L('pince_coupante', 1, 1, 0.06)],
    cuisine: plus(D.cuisine, [L('conserve_haricots', 2, 4, 0.2), L('cafe_soluble', 1, 2, 0.2)]),
    lit: [L('drap', 1, 1, 0.4), L('reveil', 1, 1, 0.12), L('lampe_torche', 1, 1, 0.05), L('antidouleur', 1, 1, 0.05)],
    bureau: plus(D.bureau, [L('precis_secourisme', 1, 1, 0.03)]),
  },
  hopital: {
    etagere: [
      L('bandage', 1, 3, 0.38), L('desinfectant', 1, 2, 0.32), L('lingette', 1, 2, 0.2), L('antibiotiques', 1, 2, 0.14),
      L('antidouleur', 1, 2, 0.3), L('kit_suture', 1, 2, 0.14), L('attelle', 1, 1, 0.1), L('vitamines', 1, 1, 0.1),
      L('charbon_actif', 1, 1, 0.08), L('savon', 1, 1, 0.1),
    ],
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.06), L('precis_secourisme', 1, 1, 0.05), L('antidouleur', 1, 1, 0.06), L('antibiotiques', 1, 1, 0.03)]),
    lit: [L('drap', 1, 1, 0.4), L('chiffon', 1, 2, 0.12), L('antidouleur', 1, 1, 0.06), L('reveil', 1, 1, 0.05), L('photo_famille', 1, 1, 0.04)],
    salle_de_bain: plus(D.salle_de_bain, [L('desinfectant', 1, 1, 0.1), L('savon', 1, 1, 0.1)]),
    vetements: [L('blouse_medicale', 1, 1, 0.4), L('baskets', 1, 1, 0.06), L('sac_a_dos', 1, 1, 0.04), L('pull_laine', 1, 1, 0.05)],
    frigo: [L('antibiotiques', 1, 1, 0.05), L('compote', 1, 3, 0.2), L('bouteille_eau', 1, 2, 0.15), L('jus_fruits', 1, 2, 0.12)],
    cuisine: plus(D.cuisine, [L('compote', 2, 4, 0.25), L('conserve_haricots', 2, 4, 0.15)]),
    comptoir: plus(D.comptoir, [L('bandage', 1, 1, 0.08)]),
  },
  lycee: {
    bureau: plus(D.bureau, [L('journal_papier', 1, 2, 0.15), L('chocolat', 1, 1, 0.1)]),
    etagere: [L('journal_papier', 1, 3, 0.3), L('desinfectant', 1, 1, 0.08), L('cable_electrique', 1, 2, 0.12), L('piles', 1, 2, 0.12), L('eclat_verre', 1, 2, 0.12), L('scotch', 1, 2, 0.12), L('manuel_bricolage', 1, 1, 0.02), L('guide_survie', 1, 1, 0.02), L('cuisine_provencale', 1, 1, 0.02)],
    vetements: [L('sac_a_dos', 1, 1, 0.15), L('sweat_capuche', 1, 1, 0.12), L('jogging', 1, 1, 0.1), L('baskets', 1, 1, 0.08), L('bonnet', 1, 1, 0.06), L('telephone_mort', 1, 1, 0.15), L('chips', 1, 1, 0.1), L('barre_cereales', 1, 1, 0.1), L('batte_baseball', 1, 1, 0.02)],
    cuisine: [L('conserve_haricots', 2, 5, 0.3), L('compote', 2, 5, 0.3), L('pates_seches', 1, 3, 0.3), L('biscuits', 1, 2, 0.15), L('casserole', 1, 1, 0.12), L('couteau_cuisine', 1, 1, 0.1), L('ouvre_boite', 1, 1, 0.1), L('huile_olive', 1, 1, 0.1)],
    machine: D.machine,
  },
  bricolage: {
    etagere: plus(OUTILLAGE, [
      L('piles', 1, 2, 0.15), L('lampe_torche', 1, 1, 0.07), L('lampe_frontale', 1, 1, 0.04), L('cartouche_gaz', 1, 2, 0.08),
      L('rechaud_camping', 1, 1, 0.03), L('hache_pompier', 1, 1, 0.015), L('pelle', 1, 1, 0.05), L('machette', 1, 1, 0.03),
      L('essence', 1, 1, 0.04), L('manuel_bricolage', 1, 1, 0.04), L('ceinture_outils', 1, 1, 0.04), L('graines', 1, 3, 0.1),
      L('scie', 1, 1, 0.06), L('hachette', 1, 1, 0.03), L('sac_plastique', 1, 3, 0.1),
    ]),
    comptoir: plus(D.comptoir, [L('scotch', 1, 2, 0.15), L('piles', 1, 1, 0.1)]),
    caisse: D.caisse,
    machine: [L('trousse_outils', 1, 1, 0.1), L('visserie', 2, 4, 0.3), L('cle_molette', 1, 1, 0.1), L('ressort', 1, 2, 0.12), L('fil_de_fer', 1, 2, 0.15)],
    bureau: plus(D.bureau, [L('manuel_bricolage', 1, 1, 0.03), L('plans_arbalete', 1, 1, 0.015)]),
  },
  cite: { // Les Canourgues : barres d'immeubles, caves, parkings
    vetements: plus(D.vetements, [L('jogging', 1, 1, 0.12), L('sweat_capuche', 1, 1, 0.1), L('baskets', 1, 1, 0.08), L('casquette', 1, 1, 0.08), L('sac_a_dos', 1, 1, 0.05)]),
    lit: plus(D.lit, [L('batte_baseball', 1, 1, 0.03), L('munitions_9mm', 2, 6, 0.01), L('couteau_cuisine', 1, 1, 0.03)]),
    etagere: plus(D.etagere, [L('batte_baseball', 1, 1, 0.03), L('planche', 1, 1, 0.1), L('marteau', 1, 1, 0.04), L('pied_de_biche', 1, 1, 0.015), L('plans_arbalete', 1, 1, 0.01)]),
    canape: plus(D.canape, [L('chips', 1, 1, 0.08)]),
  },

  // ─────────── Le pays salonais ───────────
  village: {
    cuisine: plus(D.cuisine, [L('olives', 1, 2, 0.12), L('miel', 1, 1, 0.1), L('huile_olive', 1, 1, 0.12), L('fruits_sauvages', 1, 2, 0.1), L('herbes_simples', 1, 1, 0.08)]),
    etagere: [ // remises, granges, caves
      L('pelle', 1, 1, 0.06), L('corde', 1, 1, 0.18), L('planche', 1, 2, 0.2), L('bache_plastique', 1, 1, 0.14),
      L('fil_de_fer', 1, 2, 0.15), L('clous', 3, 8, 0.15), L('herbes_simples', 1, 2, 0.1), L('huile_olive', 1, 1, 0.08),
      L('fusil_chasse', 1, 1, 0.012), L('cartouches', 2, 6, 0.05), L('canne_peche', 1, 1, 0.05), L('jumelles', 1, 1, 0.025),
      L('carnet_chasseur', 1, 1, 0.02), L('collet', 1, 1, 0.04), L('essence', 1, 1, 0.04), L('pierre_aiguiser', 1, 1, 0.06), L('appat', 1, 3, 0.05),
      L('bouteille_vide', 1, 2, 0.12), L('alcool_fort', 1, 1, 0.08), L('graines', 1, 2, 0.12),
      L('scie', 1, 1, 0.04), L('hachette', 1, 1, 0.025), L('buche', 1, 2, 0.08), L('amandes', 1, 1, 0.06),
    ],
    vetements: plus(D.vetements, [L('bottes_caoutchouc', 1, 1, 0.08), L('manteau_hiver', 1, 1, 0.06), L('gants_cuir', 1, 1, 0.06)]),
    voiture: plus(D.voiture, [L('corde', 1, 1, 0.05)]),
  },
  ruines: { // Vieux-Vernègues, détruit par le séisme de 1909
    etagere: [L('chiffon', 1, 1, 0.1), L('planche', 1, 1, 0.12), L('eclat_verre', 1, 1, 0.12), L('corde', 1, 1, 0.06), L('herbes_simples', 1, 2, 0.2), L('fruits_sauvages', 1, 2, 0.15), L('bouteille_vide', 1, 1, 0.08)],
    table: [L('bouteille_vide', 1, 1, 0.1), L('allumettes', 1, 1, 0.08), L('boite_vide', 1, 2, 0.12), L('journal_papier', 1, 1, 0.08)],
    poubelle: D.poubelle,
  },
  grotte: { // Calès : habitats troglodytes, campements de fuyards
    table: [L('conserve_haricots', 1, 2, 0.2), L('allumettes', 1, 2, 0.18), L('casserole', 1, 1, 0.12), L('rechaud_camping', 1, 1, 0.05), L('cartouche_gaz', 1, 1, 0.1), L('bouteille_eau', 1, 2, 0.15), L('lampe_torche', 1, 1, 0.06), L('piles', 1, 1, 0.1)],
    lit: [L('drap', 1, 1, 0.3), L('chiffon', 1, 2, 0.15), L('photo_famille', 1, 1, 0.1), L('couteau_cuisine', 1, 1, 0.05), L('guide_survie', 1, 1, 0.03), L('plans_arbalete', 1, 1, 0.03)],
    etagere: [L('corde', 1, 1, 0.15), L('bache_plastique', 1, 1, 0.15), L('herbes_simples', 1, 2, 0.12), L('bouteille_vide', 1, 2, 0.15), L('boite_vide', 1, 2, 0.15)],
    poubelle: D.poubelle,
  },
  zoo: { // La Barben
    cuisine: [L('croquettes', 1, 2, 0.3), L('fruits_sauvages', 1, 3, 0.2), L('viande_crue', 1, 2, 0.08), L('poisson_cru', 1, 3, 0.15), L('casserole', 1, 1, 0.08), L('couteau_cuisine', 1, 1, 0.08), L('bouteille_eau', 1, 2, 0.12)],
    bureau: [L('antibiotiques', 1, 1, 0.1), L('bandage', 1, 2, 0.15), L('desinfectant', 1, 1, 0.15), L('antidouleur', 1, 1, 0.08), L('kit_suture', 1, 1, 0.1), L('lampe_torche', 1, 1, 0.08), L('journal_papier', 1, 1, 0.1)],
    vetements: [L('bottes_caoutchouc', 1, 1, 0.15), L('gants_cuir', 1, 1, 0.15), L('pantalon_cargo', 1, 1, 0.1), L('manteau_hiver', 1, 1, 0.05)],
    comptoir: plus(D.comptoir, [L('chips', 1, 2, 0.15), L('soda', 1, 2, 0.15)]),
    machine: D.machine,
    etagere: [L('corde', 1, 2, 0.2), L('fil_de_fer', 1, 2, 0.15), L('planche', 1, 1, 0.12), L('pelle', 1, 1, 0.06), L('bache_plastique', 1, 1, 0.1), L('croquettes', 1, 1, 0.12)],
  },
  base: { // BA 701
    vetements: [L('treillis', 1, 1, 0.2), L('rangers', 1, 1, 0.22), L('gilet_tactique', 1, 1, 0.06), L('casque_militaire', 1, 1, 0.1), L('gants_cuir', 1, 1, 0.15), L('sac_militaire', 1, 1, 0.06), L('ceinture_cuir', 1, 1, 0.1), L('holster_cuisse', 1, 1, 0.06), L('manteau_hiver', 1, 1, 0.06)],
    etagere: [
      L('munitions_556', 5, 15, 0.1), L('munitions_9mm', 4, 12, 0.12), L('pistolet_9mm', 1, 1, 0.035), L('fusil_assaut', 1, 1, 0.012),
      L('couteau_combat', 1, 1, 0.1), L('kit_nettoyage', 1, 1, 0.1), L('jumelles', 1, 1, 0.06), L('fusee_detresse', 1, 2, 0.1),
      L('ration_militaire', 1, 2, 0.25), L('bandage', 1, 2, 0.15), L('kit_suture', 1, 1, 0.08), L('antibiotiques', 1, 1, 0.05),
      L('lampe_frontale', 1, 1, 0.08), L('piles', 1, 3, 0.15),
    ],
    bureau: plus(D.bureau, [L('jumelles', 1, 1, 0.04), L('radio_portable', 1, 1, 0.05), L('munitions_9mm', 2, 6, 0.05)]),
    cuisine: [L('ration_militaire', 1, 2, 0.18), L('conserve_haricots', 2, 4, 0.2), L('conserve_raviolis', 2, 4, 0.15), L('cafe_soluble', 1, 2, 0.2), L('pates_seches', 1, 3, 0.2), L('casserole', 1, 1, 0.1)],
    machine: [L('trousse_outils', 1, 1, 0.1), L('essence', 1, 2, 0.12), L('cable_electrique', 1, 2, 0.15), L('visserie', 1, 3, 0.2), L('cle_molette', 1, 1, 0.1), L('tuyau_plastique', 1, 1, 0.08)],
    lit: [L('drap', 1, 1, 0.35), L('reveil', 1, 1, 0.1), L('photo_famille', 1, 1, 0.08), L('munitions_9mm', 1, 4, 0.03), L('ration_militaire', 1, 1, 0.05)],
  },
  triage: { // Miramas : faisceaux, ateliers, postes d'aiguillage, wagons
    machine: [L('trousse_outils', 1, 1, 0.06), L('cle_molette', 1, 1, 0.15), L('cable_electrique', 1, 2, 0.18), L('visserie', 1, 3, 0.25), L('fil_de_fer', 1, 2, 0.15), L('tuyau_acier', 1, 1, 0.1), L('essence', 1, 1, 0.05)],
    voiture: [L('planche', 1, 3, 0.3), L('bache_plastique', 1, 1, 0.12), L('conserve_haricots', 1, 4, 0.1), L('pates_seches', 1, 3, 0.08), L('bouteille_eau', 1, 4, 0.08), L('corde', 1, 1, 0.08), L('croquettes', 1, 2, 0.05)],
    etagere: plus(OUTILLAGE.slice(0, 10), [L('fusee_detresse', 1, 2, 0.12)]),
    bureau: plus(D.bureau, [L('lampe_torche', 1, 1, 0.1), L('radio_portable', 1, 1, 0.04), L('fusee_detresse', 1, 2, 0.15), L('cafe_soluble', 1, 1, 0.12)]),
  },
  aerodrome: {
    bureau: plus(D.bureau, [L('jumelles', 1, 1, 0.08), L('radio_portable', 1, 1, 0.06), L('lampe_torche', 1, 1, 0.08), L('cafe_soluble', 1, 1, 0.12)]),
    machine: [L('essence', 1, 2, 0.15), L('trousse_outils', 1, 1, 0.08), L('cable_electrique', 1, 2, 0.15), L('visserie', 1, 3, 0.2), L('bache_plastique', 1, 1, 0.1), L('corde', 1, 1, 0.1)],
    etagere: plus(SECOURS, [L('fusee_detresse', 1, 2, 0.15), L('corde', 1, 1, 0.1), L('lampe_torche', 1, 1, 0.08)]),
    comptoir: [L('alcool_fort', 1, 1, 0.2), L('soda', 1, 2, 0.2), L('chips', 1, 2, 0.15), L('chocolat', 1, 1, 0.1), L('briquet', 1, 1, 0.1)],
    vetements: [L('veste_cuir', 1, 1, 0.08), L('blouson_moto', 1, 1, 0.02), L('gants_cuir', 1, 1, 0.1), L('casquette', 1, 1, 0.1), L('sacoche', 1, 1, 0.06)],
  },
  route: { // péage de Lançon, aires, bouchons
    voiture: plus(D.voiture, [L('bouteille_eau', 1, 2, 0.1), L('sac_a_dos', 1, 1, 0.04), L('essence', 1, 1, 0.03), L('blouson_moto', 1, 1, 0.01), L('casque_moto', 1, 1, 0.015)]),
    comptoir: [L('piles', 1, 1, 0.12), L('lampe_torche', 1, 1, 0.08), L('fusee_detresse', 1, 1, 0.08), L('cafe_soluble', 1, 1, 0.12), L('journal_papier', 1, 2, 0.15), L('radio_portable', 1, 1, 0.03)],
    machine: D.machine,
  },
  nature: {
    table: [L('bouteille_vide', 1, 1, 0.12), L('canette_vide', 1, 2, 0.15), L('boite_vide', 1, 1, 0.1), L('allumettes', 1, 1, 0.04)],
    poubelle: D.poubelle,
  },

  // ─────────── Butin de VOYAGE (rencontres : butin { table: 'voyage.<cat>', n }) ───────────
  voyage: {
    cadavre: [L('bouteille_eau', 1, 1, 0.18), L('barre_cereales', 1, 2, 0.18), L('conserve_haricots', 1, 1, 0.12), L('bandage', 1, 1, 0.1), L('piles', 1, 1, 0.1), L('couteau_cuisine', 1, 1, 0.08), L('munitions_9mm', 2, 5, 0.04), L('photo_famille', 1, 1, 0.15), L('telephone_mort', 1, 1, 0.18), L('sac_a_dos', 1, 1, 0.04), L('antidouleur', 1, 1, 0.06)],
    voiture: plus(D.voiture, [L('bouteille_eau', 1, 1, 0.1)]),
    ferme: [L('olives', 1, 2, 0.2), L('miel', 1, 1, 0.12), L('huile_olive', 1, 1, 0.15), L('conserve_haricots', 1, 2, 0.15), L('fruits_sauvages', 1, 2, 0.15), L('corde', 1, 1, 0.1), L('planche', 1, 1, 0.1), L('cartouches', 2, 5, 0.05), L('alcool_fort', 1, 1, 0.1), L('herbes_simples', 1, 2, 0.1), L('pierre_aiguiser', 1, 1, 0.05)],
    convoi: [L('ration_militaire', 1, 2, 0.3), L('munitions_556', 3, 10, 0.15), L('munitions_9mm', 2, 8, 0.15), L('bandage', 1, 2, 0.25), L('kit_suture', 1, 1, 0.08), L('antibiotiques', 1, 1, 0.06), L('fusee_detresse', 1, 1, 0.12), L('couteau_combat', 1, 1, 0.08), L('casque_militaire', 1, 1, 0.05), L('essence', 1, 1, 0.1)],
    secours: SECOURS.map(l => ({ ...l, p: Math.min(0.9, l.p * 1.6) })),
    verger: [L('fruits_sauvages', 2, 4, 0.9), L('herbes_simples', 1, 2, 0.3), L('olives', 1, 1, 0.2), L('appat', 1, 3, 0.2)],
    campement: [L('conserve_haricots', 1, 2, 0.25), L('allumettes', 1, 1, 0.2), L('rechaud_camping', 1, 1, 0.06), L('cartouche_gaz', 1, 1, 0.12), L('corde', 1, 1, 0.15), L('bache_plastique', 1, 1, 0.15), L('drap', 1, 1, 0.15), L('bouteille_eau', 1, 2, 0.15), L('guide_survie', 1, 1, 0.03), L('plans_arbalete', 1, 1, 0.04), L('canne_peche', 1, 1, 0.06), L('poisson_cru', 1, 2, 0.08)],
  },
};

// ---------------------------------------------------------------------------
// SACS — chaque lieu a les siens : le joueur les découvre en fouillant.
// (Ajoutés après coup aux tables : une catégorie absente part de la table par défaut.)
// ---------------------------------------------------------------------------
const SACS = {
  defaut: { vetements: [L('sac_banane', 1, 1, 0.025), L('tote_bag', 1, 1, 0.03), L('sac_main', 1, 1, 0.025), L('sac_sport', 1, 1, 0.015), L('sac_enfant', 1, 1, 0.01)],
    bureau: [L('sac_ordinateur', 1, 1, 0.03)], voiture: [L('sac_sport', 1, 1, 0.02), L('sac_isotherme', 1, 1, 0.02), L('sac_voyage', 1, 1, 0.01)],
    lit: [L('sac_main', 1, 1, 0.015)], canape: [L('sac_main', 1, 1, 0.02), L('tote_bag', 1, 1, 0.02)] },
  hotel: { vetements: [L('sac_voyage', 1, 1, 0.06), L('valise_cabine', 1, 1, 0.04), L('sac_main', 1, 1, 0.04)], lit: [L('valise_cabine', 1, 1, 0.03)] },
  gare: { vetements: [L('valise_cabine', 1, 1, 0.06), L('sac_voyage', 1, 1, 0.06), L('sac_alpinisme', 1, 1, 0.015)], comptoir: [L('sacoche_facteur', 1, 1, 0.03)] },
  aerodrome: { vetements: [L('valise_cabine', 1, 1, 0.07), L('sac_voyage', 1, 1, 0.05), L('sac_photo', 1, 1, 0.03)] },
  mairie: { bureau: [L('sac_ordinateur', 1, 1, 0.05), L('cartable_cuir', 1, 1, 0.03), L('sacoche_facteur', 1, 1, 0.02)] },
  mediatheque: { comptoir: [L('tote_bag', 1, 1, 0.15)], bureau: [L('cartable_cuir', 1, 1, 0.04), L('sac_ordinateur', 1, 1, 0.04)] },
  lycee: { vetements: [L('sac_enfant', 1, 1, 0.04), L('sac_sport', 1, 1, 0.06), L('sac_banane', 1, 1, 0.04)], bureau: [L('cartable_cuir', 1, 1, 0.06), L('sac_ordinateur', 1, 1, 0.04)] },
  musee: { comptoir: [L('tote_bag', 1, 1, 0.1), L('sac_photo', 1, 1, 0.03)] },
  chateau: { etagere: [L('musette', 1, 1, 0.05)], comptoir: [L('tote_bag', 1, 1, 0.06)] },
  hopital: { vetements: [L('sac_samu', 1, 1, 0.05), L('sac_main', 1, 1, 0.03)], etagere: [L('sac_samu', 1, 1, 0.025)] },
  caserne: { vetements: [L('sac_samu', 1, 1, 0.06), L('sac_sport', 1, 1, 0.05)], etagere: [L('sac_samu', 1, 1, 0.03)] },
  commissariat: { vetements: [L('sac_police', 1, 1, 0.06), L('sac_sport', 1, 1, 0.04)] },
  gendarmerie: { vetements: [L('sac_police', 1, 1, 0.06), L('musette', 1, 1, 0.03)] },
  base: { vetements: [L('musette', 1, 1, 0.06), L('sac_expedition', 1, 1, 0.015)], etagere: [L('musette', 1, 1, 0.04)] },
  hypermarche: { vetements: [L('sac_sport', 1, 1, 0.06), L('sac_banane', 1, 1, 0.05), L('sac_trail', 1, 1, 0.04), L('sac_alpinisme', 1, 1, 0.02), L('sac_isotherme', 1, 1, 0.05), L('sac_enfant', 1, 1, 0.04)],
    caisse: [L('sac_isotherme', 1, 1, 0.04)] },
  supermarche: { caisse: [L('sac_isotherme', 1, 1, 0.05), L('tote_bag', 1, 1, 0.05)], frigo: [L('sac_isotherme', 1, 1, 0.03)] },
  superette: { caisse: [L('tote_bag', 1, 1, 0.06)] },
  bricolage: { etagere: [L('sac_jute', 1, 1, 0.06)], caisse: [L('sac_jute', 1, 1, 0.04)] },
  savonnerie: { etagere: [L('sac_jute', 1, 1, 0.08)], vetements: [L('tote_bag', 1, 1, 0.05)] },
  usine: { vetements: [L('musette', 1, 1, 0.03), L('sac_sport', 1, 1, 0.04)], etagere: [L('sac_jute', 1, 1, 0.05)] },
  village: { vetements: [L('gibeciere', 1, 1, 0.06), L('hotte_vendange', 1, 1, 0.04), L('sac_jute', 1, 1, 0.05)], etagere: [L('hotte_vendange', 1, 1, 0.03), L('sac_jute', 1, 1, 0.04)],
    voiture: [L('gibeciere', 1, 1, 0.03)] },
  cite: { vetements: [L('sac_livreur', 1, 1, 0.04), L('sac_sport', 1, 1, 0.05), L('sac_banane', 1, 1, 0.04), L('sac_enfant', 1, 1, 0.03)], canape: [L('sac_livreur', 1, 1, 0.03)] },
  place: { voiture: [L('sac_livreur', 1, 1, 0.03), L('sac_main', 1, 1, 0.03)], table: [L('sac_main', 1, 1, 0.03)] },
  route: { voiture: [L('sac_livreur', 1, 1, 0.03), L('sac_voyage', 1, 1, 0.05), L('valise_cabine', 1, 1, 0.03), L('sac_alpinisme', 1, 1, 0.02)] },
  nature: { table: [L('sac_trail', 1, 1, 0.05), L('sac_alpinisme', 1, 1, 0.03), L('gibeciere', 1, 1, 0.03), L('sac_expedition', 1, 1, 0.01)] },
  grotte: { lit: [L('sac_alpinisme', 1, 1, 0.04), L('sac_expedition', 1, 1, 0.02)], table: [L('sac_trail', 1, 1, 0.03)] },
  zoo: { vetements: [L('sac_enfant', 1, 1, 0.05), L('sac_isotherme', 1, 1, 0.04)] },
  cinema: { comptoir: [L('sac_main', 1, 1, 0.04), L('sac_banane', 1, 1, 0.04)] },
  voyage: { cadavre: [L('sac_trail', 1, 1, 0.02), L('sac_alpinisme', 1, 1, 0.015), L('sac_voyage', 1, 1, 0.02), L('sac_main', 1, 1, 0.02)],
    voiture: [L('valise_cabine', 1, 1, 0.04), L('sac_voyage', 1, 1, 0.04), L('sac_isotherme', 1, 1, 0.03)], ferme: [L('hotte_vendange', 1, 1, 0.06), L('gibeciere', 1, 1, 0.04), L('sac_jute', 1, 1, 0.08)],
    convoi: [L('musette', 1, 1, 0.06), L('sac_samu', 1, 1, 0.03)], secours: [L('sac_samu', 1, 1, 0.1)], campement: [L('sac_alpinisme', 1, 1, 0.06), L('sac_expedition', 1, 1, 0.03), L('sac_trail', 1, 1, 0.04)] },
};
// Le défaut d'abord (ses nouvelles lignes profitent aux lieux qui n'ont pas la catégorie),
// en mémorisant les tables d'origine pour ne pas compter deux fois.
{
  const origineDefaut = { ...BUTIN.defaut };
  for (const [type, cats] of Object.entries(SACS)) {
    if (!BUTIN[type]) BUTIN[type] = {};
    for (const [cat, lignes] of Object.entries(cats)) {
      const base = type === 'defaut' ? origineDefaut[cat] : (BUTIN[type][cat] || BUTIN.defaut[cat]);
      BUTIN[type][cat] = plus(base || [], lignes);
    }
  }
}

export const CATEGORIES_MEUBLE = ['vetements', 'frigo', 'cuisine', 'etagere', 'bureau', 'comptoir', 'caisse', 'lit',
  'salle_de_bain', 'voiture', 'poubelle', 'machine', 'table', 'canape'];

// ---------------------------------------------------------------------------
// Tirage
// ---------------------------------------------------------------------------
// Renvoie la table pour (typeLieu, catégorie) — surcharge du type, sinon défaut, sinon [].
export function tableButin(typeLieu, categorie) {
  const t = BUTIN[typeLieu];
  if (t && t[categorie]) return t[categorie];
  return BUTIN.defaut[categorie] || [];
}
// 'voyage.cadavre' → la table ; tolère aussi 'hotel.lit'.
export function tableParCle(cle) {
  const [type, cat] = String(cle).split('.');
  return (BUTIN[type] && BUTIN[type][cat]) || null;
}

const ESTDEBASE = (id) => {
  const d = ITEMS[id];
  return !!d && (d.type === 'nourriture' || d.type === 'boisson' || id === 'bandage' || id === 'bandage_fortune');
};

// opts : { taille (cases du meuble), danger (0..1), jour, coop, sansLumiere, mult (difficulté × lieu.abondance), passes? }
// rng  : générateur [0,1) — seedRng(...) pour que les deux joueurs voient le même butin.
export function tirerLignes(table, rng = Math.random, opts = {}) {
  const F = REGLAGES.fouille;
  const { taille = 1, danger = 0.3, jour = 1, coop = false, sansLumiere = false, mult = 1, categorie = null } = opts;
  const passes = opts.passes ?? Math.min(F.TIRAGES_MAX, Math.ceil(F.TIRAGES + F.TIRAGES_PAR_CASE * Math.max(0, taille - 1)));
  let M = (F.ABONDANCE.base + F.ABONDANCE.parDanger * danger) * mult;
  if (coop) M *= REGLAGES.coop.BUTIN_MULT;
  if (sansLumiere) M *= F.SANS_LUMIERE.chance;
  let pourri = 1;
  if (categorie === 'frigo') for (const j of F.JOUR_NOURRITURE) if (jour >= j.jourMin) pourri = j.frigo;
  let base = 1;
  for (const j of REGLAGES.courbe.JOURS) if (jour >= j.jourMin) base = j.butinBase;
  const out = new Map();
  for (let i = 0; i < passes; i++) {
    for (const l of table || []) {
      let p = l.p * M;
      if (ESTDEBASE(l.id)) p *= base;
      if (categorie === 'frigo' && ESTDEBASE(l.id)) p *= pourri;
      if (rng() < Math.min(0.95, p)) {
        const q = l.q[0] + Math.floor(rng() * (l.q[1] - l.q[0] + 1));
        out.set(l.id, (out.get(l.id) || 0) + q);
      }
    }
  }
  return [...out].map(([id, qty]) => ({ id, qty }));
}

export function tirerButin(typeLieu, categorie, rng = Math.random, opts = {}) {
  return tirerLignes(tableButin(typeLieu, categorie), rng, { ...opts, categorie });
}
// Rencontres de voyage : butin { table: 'voyage.cadavre', n } → n passes.
export function tirerButinTable(cle, n = 1, rng = Math.random, opts = {}) {
  return tirerLignes(tableParCle(cle) || [], rng, { ...opts, passes: n });
}
