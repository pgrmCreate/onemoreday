// ============ RENCONTRES DE VOYAGE DE L'HISTOIRE (REFONTE §4.10, docs/HISTOIRE.md §6) ============
// Même format que js/data/rencontres.js (game designer). Préfixe 'rh_'. Scènes : scenes_rencontres.js (préfixe rv_).
// poids: 0 → jamais tirée au hasard : uniquement lancée par un déclencheur { quand: 'voyage' } (declencheurs.js).
// poids > 0 → s'ajoute au tirage aléatoire quand `si` est vrai (couleur de l'histoire en cours).
export const RENCONTRES_HISTOIRE = [
  // ─── Scénarisées (déclencheurs 'voyage') ───
  // Le début : la route du bois de la Barben au Vieux-Vernègues, avec René, Laura et Mathis
  { id: 'rh_chateau_bas',     poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'plaine_route', scene: 'rv_chateau_bas' },
  { id: 'rh_village_neuf',    poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'plaine_route', scene: 'rv_village_neuf' },
  { id: 'rh_porte_vernegues', poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'nuit_campagne', scene: 'rv_porte_vernegues' },
  // Acte II : la route de la Crau, avec Fernand
  { id: 'rh_triage',       poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'triage_horde', scene: 'rv_triage' },
  { id: 'rh_draille',      poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'crau_mistral', scene: 'rv_draille' },
  { id: 'rh_nuit_crau',    poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'nuit_campagne', scene: 'rv_nuit_crau' },
  { id: 'rh_nuage',        poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'triage_feu', scene: 'rv_nuage' },
  { id: 'rh_maree',        poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'plaine_route', scene: 'rv_maree' },
  // Actes III et IV : la fuite
  { id: 'rh_sentier',      poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'refuge_nuit', scene: 'rv_sentier' },
  { id: 'rh_brume_montee', poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'poudrerie_brume', scene: 'rv_brume' },
  // Acte V : la colonne vers la Durance
  { id: 'rh_colonne',      poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'nuit_campagne', scene: 'rv_colonne' },

  // ─── Couleur de l'histoire, tirées au hasard quand la condition est vraie ───
  // La radio d'Inès appelle toujours les survivants vers le village mort (tant qu'on ne l'a pas coupée).
  { id: 'rh_appel_refuge', poids: 2, type: 'choix', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true,
    si: { flag: 'refuge_fui', pasFlag: ['radio_coupee', 'pont_fait'] }, illu: 'plaine_route', scene: 'rv_appel_refuge' },
  {
    id: 'rh_autoradio', poids: 2, type: 'ambiance', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true,
    si: { flag: 'refuge_fui', pasFlag: 'radio_coupee' }, illu: 'plaine_route',
    texte: 'Au bord de la route, une voiture est restée portières ouvertes, avec l’autoradio encore allumé grâce aux dernières réserves de la batterie. En passant, tu entends une voix de jeune fille, faible et grésillante : « … Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants… » La voix d’Inès appelle toujours les gens vers un village plein de morts.',
  },
  // Après la frappe : les traces du chlore, et la règle redite (P10).
  {
    id: 'rh_oiseaux', poids: 2, type: 'ambiance', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true,
    si: { flag: 'frappe_faite' }, illu: 'crau_aube',
    texte: 'Dans le fossé, il y a des dizaines d’oiseaux morts, des étourneaux pour la plupart, tombés tous ensemble pendant la nuit. L’herbe autour est jaunie, comme brûlée, et ça sent encore un peu l’eau de Javel. La brume est passée par ce creux. Le jour, elle se dissipe ; la nuit, sans vent, elle revient dans les terres basses.',
  },
  // Après l'annonce du pont : les tracts de l'armée.
  {
    id: 'rh_tracts', poids: 2, type: 'ambiance', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true,
    si: { flag: 'pont_annonce', pasFlag: 'pont_fait' }, illu: 'plaine_route',
    texte: 'Des feuilles blanches jonchent la route sur des centaines de mètres, collées au bitume par la rosée. Un drone de l’armée les a lâchées pendant la nuit. Tu en ramasses une : « PONT DE MALLEMORT — FRANCHISSEMENT DES CIVILS RECENSÉS LE MERCREDI 7 OCTOBRE, DE 6 H À 7 H. PRÉSENTEZ-VOUS À LA LIGNE DES 200 MÈTRES. LES PERSONNES MORDUES NE SERONT PAS ADMISES. »',
  },
  // Salon : ambiance (sans condition).
  {
    id: 'rh_marche_fantome', poids: 2, type: 'ambiance', echelle: 'salon', zones: null, nuit: false, dangerMin: 0, illu: null,
    texte: 'À la terrasse d’un café du cours, trois morts sont assis autour d’une table ronde, devant des tasses vides. Ils ne bougent pas. On dirait qu’ils attendent l’addition depuis trois semaines.',
  },
];
