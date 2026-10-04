// ============================================================================
//  RECHERCHE AU SOL — ce qu'on trouve en regardant par terre (façon Project Zomboid).
// ============================================================================
// Mode « Chercher par terre » (touche O, ou la loupe) : on avance lentement, les yeux au sol ; régulièrement, une case
// proche et visible est examinée. Ce qu'on y trouve dépend de la MATIÈRE du sol (catégorie ci-dessous), de la saison
// (mois), de la pluie récente, de la lumière et du niveau de « Chasse & cuisine ». Une case examinée ne redonne rien
// avant REPOUSSE minutes (la nature repousse, la ville ne se vide pas en une fois).
//
// Tables : [id, poids, qty?, conditions?]  conditions : { mois: [1..12], pluie: true (il a plu depuis 2 jours) }
export const RECHERCHE = {
  PERIODE_MS: 1100,        // une case examinée toutes les 1,1 s
  RAYON: 2.6,              // cases autour de soi
  CHANCE: 0.26,            // chance qu'une case examinée donne quelque chose (× lumière, × allure, × niveau)
  PAR_NIVEAU: 0.1,         // + 10 % par niveau de Chasse & cuisine
  NUIT: 0.3,               // dans le noir (case peu éclairée) : × 0,3
  ACCROUPI: 1.2, IMMOBILE: 1.1, MARCHE: 0.85,
  VITESSE: 0.55,           // on avance moins vite quand on cherche
  REPOUSSE: 3 * 1440,      // minutes avant qu'une case redonne
  XP: 1,                   // chasse, par trouvaille
};

// Matière du sol → catégorie de recherche.
export const CATEGORIE_SOL = {
  herbe: 'nature', herbe_seche: 'nature', terre: 'nature', boue: 'nature', sable: 'nature',
  gravier: 'cailloux',
  bitume: 'ville', paves: 'ville', trottoir: 'ville', dalles: 'ville', beton: 'ville',
  debris: 'gravats',
  parquet: 'maison', carrelage: 'maison', lino: 'maison', tomettes: 'maison', moquette: 'maison', marbre: 'maison',
  planches: 'maison', carrelage_damier: 'maison', metal: 'gravats',
};

export const TABLES_RECHERCHE = {
  nature: [
    ['brindilles', 24, 2], ['branche', 15], ['pierre', 16], ['fibres', 14, 2], ['herbes_simples', 6],
    ['mures', 10, 1, { mois: [8, 9] }], ['champignons', 8, 1, { mois: [9, 10, 11], pluie: true }],
    ['escargots', 8, 1, { pluie: true }], ['amandes', 3, 1, { mois: [8, 9] }], ['fruits_sauvages', 3, 1, { mois: [7, 8, 9] }],
    ['graines', 1], ['canette_vide', 3], ['sac_plastique', 2], ['cannes', 3],
  ],
  cailloux: [['pierre', 40], ['brindilles', 8], ['ferraille', 5], ['eclat_verre', 4], ['canette_vide', 3]],
  ville: [
    ['ferraille', 14], ['clous', 10, 3], ['eclat_verre', 12], ['canette_vide', 12], ['chiffon', 8], ['sac_plastique', 10],
    ['journal_papier', 10], ['visserie', 6], ['fil_de_fer', 4], ['pierre', 5], ['bouteille_vide', 6], ['brique', 4],
    ['piles', 1], ['briquet', 1], ['allumettes', 1], ['brindilles', 4],
  ],
  gravats: [['ferraille', 20], ['clous', 15, 4], ['brique', 12], ['eclat_verre', 12], ['fil_de_fer', 6], ['cable_electrique', 6], ['planche', 4], ['visserie', 6], ['pierre', 8]],
  maison: [['visserie', 10], ['clous', 6, 2], ['chiffon', 10], ['journal_papier', 10], ['piles', 2], ['allumettes', 2], ['eclat_verre', 5], ['canette_vide', 4], ['fil_de_fer', 2], ['cable_electrique', 3]],
};
