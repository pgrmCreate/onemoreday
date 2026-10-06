// ============================================================================
//  RECHERCHE AU SOL — ce qu'on trouve en regardant par terre (façon Project Zomboid).
// ============================================================================
// Mode « Chercher par terre » (touche O, ou la loupe) : on avance lentement, les yeux au sol ; régulièrement, une case
// proche et visible est examinée. Ce qu'on y trouve dépend de la MATIÈRE du sol (catégorie ci-dessous), de la saison
// (mois), de la pluie récente, de la lumière et du niveau de la compétence « Recherche ».
//
// Débutant (niveau 0), on ne trouve presque rien, et rien de bon : dans la loge du gardien, un chiffon, un éclat de
// verre, et c'est tout. Avec les niveaux, on trouve plus souvent, et des objets de meilleure qualité (rang).
//  - chance de base faible, + PAR_NIVEAU par niveau ;
//  - un coin s'ÉPUISE : chaque trouvaille récente à moins de ZONE cases divise les chances (× EPUISE, moins sévère
//    avec le niveau) — une pièce ne donne plus quatre objets d'affilée ;
//  - RANG d'un objet (0 : rebut, 1 : utile, 2 : bon, 3 : précieux) : au-dessus du niveau, il devient très rare
//    (poids × HORS_NIVEAU par rang manquant) ;
//  - une case examinée ne redonne rien avant REPOUSSE minutes.
//
// Tables : [id, poids, qty?, conditions?]  conditions : { rang: 0..3, mois: [1..12], pluie: true (il a plu depuis 2 jours) }
export const RECHERCHE = {
  PERIODE_MS: 1100,        // une case examinée toutes les 1,1 s
  RAYON: 2.6,              // cases autour de soi
  CHANCE: 0.07,            // niveau 0 : chance qu'une case examinée donne quelque chose (× lumière, × allure, × sol)
  PAR_NIVEAU: 0.3,         // + 30 % par niveau de Recherche (niveau 5 : × 2,5)
  NUIT: 0.3,               // dans le noir (case peu éclairée) : × 0,3
  ACCROUPI: 1.2, IMMOBILE: 1.1, MARCHE: 0.85,
  VITESSE: 0.55,           // on avance moins vite quand on cherche
  REPOUSSE: 3 * 1440,      // minutes avant qu'une case redonne
  ZONE: 6,                 // un « coin » : trouvailles récentes à moins de 6 cases
  EPUISE: 0.3,             // × 0,3 par trouvaille récente dans le coin (niveau 0)…
  EPUISE_PAR_NIVEAU: 0.08, // … × 0,38 au niveau 1, … × 0,7 au niveau 5
  HORS_NIVEAU: 0.12,       // objet d'un rang au-dessus de son niveau : poids × 0,12 par rang manquant
  QTE_NIVEAU: 2,           // en dessous de ce niveau, une seule unité par trouvaille
  SOL: { maison: 0.6, ville: 0.9, gravats: 0.9, cailloux: 1, nature: 1.1 }, // un intérieur est déjà balayé
  XP: 4,                   // Recherche, par trouvaille
  XP_EXAMEN: 0.1,          // Recherche, par case examinée (même bredouille)
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

const R1 = { rang: 1 }, R2 = { rang: 2 }, R3 = { rang: 3 };
export const TABLES_RECHERCHE = {
  nature: [
    ['brindilles', 24, 2], ['branche', 15], ['pierre', 16], ['fibres', 14, 2], ['canette_vide', 3], ['sac_plastique', 2],
    ['mures', 10, 1, { mois: [8, 9] }],
    ['herbes_simples', 6, 1, R1], ['cannes', 3, 1, R1], ['escargots', 8, 1, { rang: 1, pluie: true }],
    ['amandes', 3, 1, { rang: 1, mois: [8, 9] }], ['fruits_sauvages', 3, 1, { rang: 1, mois: [7, 8, 9] }],
    ['champignons', 8, 1, { rang: 2, mois: [9, 10, 11], pluie: true }], ['graines', 1, 1, R2],
  ],
  cailloux: [['pierre', 40], ['brindilles', 8], ['eclat_verre', 4], ['canette_vide', 3], ['ferraille', 5, 1, R1]],
  ville: [
    ['canette_vide', 12], ['eclat_verre', 12], ['chiffon', 8], ['sac_plastique', 10], ['journal_papier', 10], ['pierre', 5], ['brindilles', 4],
    ['ferraille', 14, 1, R1], ['clous', 10, 3, R1], ['bouteille_vide', 6, 1, R1], ['brique', 4, 1, R1], ['visserie', 6, 1, R1],
    ['fil_de_fer', 4, 1, R2],
    ['piles', 1, 1, R3], ['briquet', 1, 1, R3], ['allumettes', 1, 1, R2],
  ],
  gravats: [
    ['brique', 12], ['eclat_verre', 12], ['pierre', 8],
    ['ferraille', 20, 1, R1], ['clous', 15, 4, R1], ['planche', 4, 1, R1], ['visserie', 6, 1, R1],
    ['fil_de_fer', 6, 1, R2], ['cable_electrique', 6, 1, R2],
  ],
  maison: [
    ['chiffon', 14], ['eclat_verre', 10], ['journal_papier', 10], ['canette_vide', 4],
    ['visserie', 8, 1, R1], ['clous', 6, 2, R1], ['fil_de_fer', 2, 1, R1],
    ['cable_electrique', 3, 1, R2], ['allumettes', 2, 1, R2], ['piles', 2, 1, R3],
  ],
};
