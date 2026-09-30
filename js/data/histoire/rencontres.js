// ============ RENCONTRES DE VOYAGE SCÉNARISÉES (REFONTE §4.10) ============
// Même format que js/data/rencontres.js (game designer). Préfixe 'rh_'.
// poids: 0 → jamais tirée au hasard : uniquement lancée par un déclencheur { quand: 'voyage' } (declencheurs.js).
// poids > 0 → s'ajoute au tirage aléatoire quand `si` est vrai (couleur de l'histoire en cours).
export const RENCONTRES_HISTOIRE = [
  // Scénarisées
  { id: 'rh_pro_marche',          poids: 0, type: 'choix', echelle: 'salon',  zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'cours_nuit', scene: 'rc_pro_marche' },
  { id: 'rh_pro_premier',         poids: 0, type: 'choix', echelle: 'salon',  zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'cours_nuit', scene: 'rc_pro_premier' },
  { id: 'rh_ch1_hautparleur',     poids: 0, type: 'choix', echelle: 'salon',  zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'cours_nuit', scene: 'rc_ch1_hautparleur' },
  { id: 'rh_ch1_ambulance',       poids: 0, type: 'choix', echelle: 'salon',  zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'hopital_parvis', scene: 'rc_ch1_ambulance' },
  { id: 'rh_ch1_cours',           poids: 0, type: 'pnj',   echelle: 'salon',  zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'cours_troupeau', scene: 'rc_ch1_cours' },
  { id: 'rh_ch2_jean_moulin',     poids: 0, type: 'choix', echelle: null,     zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'route_jean_moulin', scene: 'rc_ch2_jean_moulin' },
  { id: 'rh_ch2_troupeau_plaine', poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'plaine_route', scene: 'rc_ch2_troupeau_plaine' },
  { id: 'rh_ch2_revenus',         poids: 0, type: 'pnj',   echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'nuit_campagne', scene: 'rc_ch2_revenus' },
  { id: 'rh_ch2_lion',            poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true, hostile: true, illu: 'plaine_route', scene: 'rc_ch2_lion' },
  { id: 'rh_ch2_avions',          poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'plaine_route', scene: 'rc_ch2_avions' },
  { id: 'rh_fin_colonne',         poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, hostile: true, illu: 'crau_mistral', scene: 'rc_fin_colonne' },
  { id: 'rh_fin_feu',             poids: 0, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'ligne_de_feu', scene: 'rc_fin_feu' },

  // Couleur de l'histoire, tirées au hasard quand la condition est vraie
  { id: 'rh_tract', poids: 2, type: 'choix', echelle: null, zones: null, nuit: false, dangerMin: 0, unique: true, si: { flag: 'ch1_matin_fait' }, illu: 'plaine_route', scene: 'rc_tract' },
  { id: 'rh_revenu_solitaire', poids: 2, type: 'pnj', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true, si: { flag: 'revenus_rencontres' }, illu: 'plaine_route', scene: 'rc_revenu_solitaire' },
  {
    id: 'rh_trainards', poids: 4, type: 'combat', echelle: 'region', zones: null, nuit: null, dangerMin: 0.2,
    si: { flag: 'troupeau_passe', pasFlag: 'mistral_leve' }, illu: 'plaine_route', combat: { zombies: ['errant', 'errant', 'rampant'] },
    texte: 'Des traînards du troupeau. Ils ont perdu le son des cloches et tournent en rond dans un champ de foin, le nez en l’air. Ils ne tournent plus en rond : ils t’ont vu.',
  },
  {
    id: 'rh_sonnailles_nuit', poids: 3, type: 'ambiance', echelle: 'region', zones: null, nuit: true, dangerMin: 0,
    si: { flag: 'troupeau_passe', pasFlag: 'mistral_leve' }, illu: 'nuit_campagne',
    texte: 'Loin, dans le noir, des milliers de petites cloches. Et toutes les dix secondes, plus grave, la grande. Bong. Ta bouche se remplit. Tu attends que ça passe, {accroupi|accroupie} dans le fossé, les mains sur les oreilles.',
    effets: { tempsMin: 20 },
  },
  {
    id: 'rh_marche_fantome', poids: 2, type: 'ambiance', echelle: 'salon', zones: null, nuit: false, dangerMin: 0,
    si: { pasFlag: 'troupeau_passe' }, illu: 'cours_nuit',
    texte: 'À la terrasse d’un café du cours, trois morts sont assis autour d’une table ronde, devant des tasses vides. Ils ne bougent pas. Ils attendent l’addition depuis trois semaines.',
  },
  {
    id: 'rh_salon_vide', poids: 3, type: 'ambiance', echelle: 'salon', zones: null, nuit: null, dangerMin: 0,
    si: { flag: 'troupeau_passe' }, illu: 'salon_mistral_vide',
    texte: 'Salon est vide. Vraiment vide. Le troupeau a emporté ses morts en passant. Dans les rues, il ne reste que des chaussures, des sacs, et le bruit de tes pas qui revient des façades.',
  },
];
