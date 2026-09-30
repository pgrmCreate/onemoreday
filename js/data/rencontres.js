// ============================================================================
//  RENCONTRES DE VOYAGE ALÉATOIRES (Temps 2) — format REFONTE §4.10
// ============================================================================
// Les rencontres SCÉNARISÉES vivent chez le scénariste (js/data/histoire/rencontres.js).
// Tirage (docs/GAMEPLAY.md §Temps 2) : au départ, graine seedRng(seed + ':voyage:' + depart + '>' + arrivee + ':' + minutes),
// le nombre de rencontres suit la formule de risque ; chaque rencontre est choisie parmi les ÉLIGIBLES au point
// de l'itinéraire où elle tombe, au prorata de `poids`.
//
// Champs :
//   id            unique, préfixe 'r_'.
//   poids         poids relatif de tirage.
//   type          'combat' | 'choix' | 'butin' | 'ambiance' | 'pnj'.
//   echelle       NOUVEAU — 'salon' | 'region' | null (les deux).
//   zones         [ids de zones.js] : n'arrive que si le point tombe dans l'une d'elles ; null = partout.
//   nuit          null (toujours) | true (seulement la nuit) | false (seulement le jour).
//   dangerMin     danger minimal du point (0..1).
//   si            CONDITION (REFONTE §4.5) — ex. { jourMin: 2 }.
//   unique        NOUVEAU — une seule fois par partie (drapeau 'rencontre_vue:<id>').
//   hostile       NOUVEAU — compte dans le risque affiché (tous les 'combat' le sont d'office).
//   illu          NOUVEAU — clé d'illustration de la carte-événement (null = celle de la zone).
//   texte         texte de la carte-événement (combat, butin, ambiance ; les 'choix'/'pnj' ont celui de leur scène).
//   scene         id dans rencontres_scenes.js ('choix' | 'pnj').
//   combat        { zombies: [...], surprise? } — surprise : menace de départ « surpris ».
//   butin         { table: 'voyage.<cat>' (butin.js), n: passes }.
//   effets        NOUVEAU — EFFETS appliqués pour une rencontre 'ambiance' ou 'butin' (tempsMin, sta, detour…).
// En co-op, une rencontre de combat reçoit +1 mort du pool de la zone avec coop.COMBAT_MORT_EN_PLUS de chance.
// ============================================================================

export const RENCONTRES = [
  // ═══════════════════════════ COMBATS ═══════════════════════════
  {
    id: 'r_errant_isole', poids: 8, type: 'combat', echelle: null, zones: null, nuit: null, dangerMin: 0,
    illu: 'rue', combat: { zombies: ['errant'] },
    texte: "Il sort d'un porche au moment où tu passes. Trop près pour l'éviter. Ses doigts se tendent déjà.",
  },
  {
    id: 'r_errants_paire', poids: 5, type: 'combat', echelle: 'salon', zones: null, nuit: null, dangerMin: 0.3,
    illu: 'rue', combat: { zombies: ['errant', 'errant'] },
    texte: "Deux silhouettes se décollent d'un abribus et marchent sur toi en même temps, épaule contre épaule, comme un couple qui rentre du marché.",
  },
  {
    id: 'r_coureur', poids: 4, type: 'combat', echelle: null, zones: null, nuit: null, dangerMin: 0.35, si: { jourMin: 2 },
    illu: 'rue', combat: { zombies: ['coureur'], surprise: true },
    texte: "Un bruit de course derrière toi. Pas des pas de vivant : trop réguliers, trop lourds. Tu te retournes juste à temps — presque.",
  },
  {
    id: 'r_meute_ville', poids: 2, type: 'combat', echelle: 'salon', zones: null, nuit: true, dangerMin: 0.2, si: { jourMin: 2 },
    illu: 'rue_nuit', combat: { zombies: ['chien_infecte'] },
    texte: "Des grognements dans le noir. Un chien, puis la silhouette du chien, puis ses dents.",
  },
  {
    id: 'r_hopital_evades', poids: 4, type: 'combat', echelle: 'salon', zones: ['hopital_zone'], nuit: null, dangerMin: 0,
    illu: 'hopital', combat: { zombies: ['errant', 'putrefie'] },
    texte: "Des blouses de patients ouvertes dans le dos, des perfusions arrachées qui pendent encore aux bras. Ils sortent du parking de l'hôpital en file indienne. Vers toi.",
  },
  {
    id: 'r_errant_champ', poids: 5, type: 'combat', echelle: 'region', zones: null, nuit: null, dangerMin: 0,
    illu: 'champ', combat: { zombies: ['errant'] },
    texte: "Un errant au milieu d'un champ de blé que personne n'a moissonné. Il t'a vu{|e}. Il fend les épis vers toi, lentement, sans détour.",
  },
  {
    id: 'r_sanglier', poids: 2, type: 'combat', echelle: 'region', zones: null, nuit: null, dangerMin: 0,
    illu: 'garrigue', combat: { zombies: ['sanglier'] },
    texte: "Un froissement dans les chênes kermès. Un grognement bas. Il sort du fourré tête baissée — et il ne s'arrête pas.",
  },
  {
    id: 'r_meute_campagne', poids: 2, type: 'combat', echelle: 'region', zones: null, nuit: true, dangerMin: 0, si: { jourMin: 2 },
    illu: 'champ_nuit', combat: { zombies: ['chien_infecte', 'chien_infecte'] },
    texte: "Des yeux dans le noir, à hauteur de genou. Deux paires. Ils ne grognent plus : ils ont faim, et ils t'ont encerclé{|e}.",
  },
  {
    id: 'r_fauve_route', poids: 3, type: 'combat', echelle: 'region', zones: ['la_barben_zone'], nuit: null, dangerMin: 0, si: { jourMin: 3 },
    illu: 'route_region', combat: { zombies: ['fauve'] },
    texte: "Sur le bas-côté, un cheval éventré. Quelque chose de fauve relève la tête de la carcasse, le museau rouge jusqu'aux yeux. Elle ne rugit pas. Elle baisse les épaules.",
  },
  {
    id: 'r_soldat_perdu', poids: 2, type: 'combat', echelle: 'region', zones: ['ba701_zone', 'a54', 'istres_zone', 'aerodrome_zone'], nuit: null, dangerMin: 0, si: { jourMin: 3 },
    illu: 'route_region', combat: { zombies: ['militaire'] },
    texte: "Un soldat seul sur la route, le fusil en bandoulière qu'il ne sait plus utiliser. Il marche au pas, droit vers toi, comme si on lui en avait donné l'ordre.",
  },

  // ═══════════════════════════ CHOIX & RENCONTRES HUMAINES ═══════════════════════════
  { id: 'r_horde_carrefour', poids: 3, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0.4, hostile: true, illu: 'carrefour', scene: 'rv_horde_carrefour' },
  { id: 'r_alarme_voiture', poids: 3, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0, hostile: true, illu: 'voiture', scene: 'rv_alarme_voiture' },
  { id: 'r_rampant_voiture', poids: 3, type: 'choix', echelle: null, zones: null, nuit: null, dangerMin: 0, hostile: true, illu: 'voiture', scene: 'rv_rampant_voiture' },
  { id: 'r_hurleur_balcon', poids: 2, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0.25, si: { jourMin: 2 }, hostile: true, illu: 'facade', scene: 'rv_hurleur_balcon' },
  { id: 'r_gonfleur_ruelle', poids: 2, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0.25, si: { jourMin: 2 }, hostile: true, illu: 'ruelle', scene: 'rv_gonfleur_ruelle' },
  { id: 'r_pillards_barrage', poids: 2, type: 'choix', echelle: 'salon', zones: null, nuit: false, dangerMin: 0.2, si: { jourMin: 2 }, hostile: true, illu: 'barricade', scene: 'rv_pillards_barrage' },
  { id: 'r_fil_tendu', poids: 2, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0, hostile: true, illu: 'rue', scene: 'rv_fil_tendu' },
  { id: 'r_colosse_barrage', poids: 2, type: 'choix', echelle: 'salon', zones: ['nord_commissariat', 'viougues', 'cours', 'canourgues_zone'], nuit: null, dangerMin: 0.45, si: { jourMin: 3 }, hostile: true, illu: 'barrage_police', scene: 'rv_colosse_barrage' },
  { id: 'r_ambulance', poids: 2, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0.3, hostile: true, illu: 'ambulance', scene: 'rv_ambulance' },
  { id: 'r_incendie', poids: 1, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0, hostile: true, illu: 'incendie', scene: 'rv_incendie' },
  { id: 'r_babyphone', poids: 1, type: 'choix', echelle: 'salon', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'facade', scene: 'rv_babyphone' },
  { id: 'r_signal_miroir', poids: 1, type: 'choix', echelle: 'salon', zones: null, nuit: false, dangerMin: 0, unique: true, illu: 'facade', scene: 'rv_signal_miroir' },
  { id: 'r_mourante', poids: 2, type: 'pnj', echelle: 'salon', zones: null, nuit: null, dangerMin: 0, unique: true, illu: 'vitrine', scene: 'rv_mourante' },
  { id: 'r_marchand_grille', poids: 2, type: 'pnj', echelle: 'salon', zones: null, nuit: false, dangerMin: 0, unique: true, illu: 'soupirail', scene: 'rv_marchand_grille' },
  { id: 'r_survivant_mordu', poids: 1, type: 'pnj', echelle: null, zones: null, nuit: false, dangerMin: 0, unique: true, illu: 'fontaine', scene: 'rv_survivant_mordu' },

  { id: 'r_bouchon_a7', poids: 4, type: 'choix', echelle: 'region', zones: ['a7_nord', 'a7_lancon', 'a54'], nuit: null, dangerMin: 0, hostile: true, illu: 'autoroute', scene: 'rv_bouchon_a7' },
  { id: 'r_troupeau_crau', poids: 3, type: 'choix', echelle: 'region', zones: ['crau', 'alpilles'], nuit: false, dangerMin: 0, illu: 'crau', scene: 'rv_troupeau_crau' },
  { id: 'r_convoi_militaire', poids: 2, type: 'choix', echelle: 'region', zones: ['ba701_zone', 'a54', 'a7_lancon', 'istres_zone'], nuit: null, dangerMin: 0, si: { jourMin: 2 }, hostile: true, illu: 'convoi', scene: 'rv_convoi_militaire' },
  { id: 'r_canal_craponne', poids: 2, type: 'choix', echelle: 'region', zones: ['costes', 'salon_ville', 'a54', 'crau', 'alpilles'], nuit: null, dangerMin: 0, illu: 'canal', scene: 'rv_canal_craponne' },
  { id: 'r_orage', poids: 2, type: 'choix', echelle: 'region', zones: null, nuit: false, dangerMin: 0, illu: 'orage', scene: 'rv_orage' },
  { id: 'r_ferme_abandonnee', poids: 3, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, hostile: true, illu: 'mas', scene: 'rv_ferme_abandonnee' },
  { id: 'r_puits', poids: 2, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, illu: 'puits', scene: 'rv_puits' },
  { id: 'r_horde_migration', poids: 2, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0.15, si: { jourMin: 3 }, hostile: true, illu: 'horde_plaine', scene: 'rv_horde_migration' },
  { id: 'r_peage_pillards', poids: 2, type: 'choix', echelle: 'region', zones: ['a7_lancon', 'pelissanne_zone', 'salon_ville', 'a54'], nuit: false, dangerMin: 0, si: { jourMin: 2 }, hostile: true, illu: 'barricade', scene: 'rv_peage_pillards' },
  { id: 'r_campement', poids: 2, type: 'choix', echelle: 'region', zones: null, nuit: null, dangerMin: 0, illu: 'pinede', scene: 'rv_campement' },
  { id: 'r_mas_fortifie', poids: 2, type: 'pnj', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true, illu: 'mas', scene: 'rv_mas_fortifie' },

  // ═══════════════════════════ BUTIN ═══════════════════════════
  {
    id: 'r_sac_cadavre', poids: 4, type: 'butin', echelle: null, zones: null, nuit: null, dangerMin: 0,
    illu: 'rue', butin: { table: 'voyage.cadavre', n: 1 }, effets: { tempsMin: 3 },
    texte: "Un corps sur le trottoir, face contre terre, un sac encore sur le dos. Il ne bouge pas. Tu vérifies deux fois, du bout du pied, avant de défaire les sangles.",
  },
  {
    id: 'r_boite_gants', poids: 3, type: 'butin', echelle: null, zones: null, nuit: null, dangerMin: 0,
    illu: 'voiture', butin: { table: 'voyage.voiture', n: 1 }, effets: { tempsMin: 3 },
    texte: "Une voiture encastrée dans un platane, le capot en accordéon. Le conducteur n'est plus là. La boîte à gants, si.",
  },
  {
    id: 'r_verger', poids: 3, type: 'butin', echelle: 'region', zones: null, nuit: false, dangerMin: 0,
    illu: 'verger', butin: { table: 'voyage.verger', n: 1 }, effets: { tempsMin: 15 },
    texte: "Un verger abandonné au bord du chemin, figuiers et amandiers. Les fruits pourrissent dans l'herbe, mais pas tous. Tu remplis tes poches en surveillant la route.",
  },

  // ═══════════════════════════ AMBIANCE ═══════════════════════════
  {
    id: 'r_cloches', poids: 1, type: 'ambiance', echelle: 'salon', zones: ['centre_ancien', 'cours'], nuit: null, dangerMin: 0,
    illu: 'clocher',
    texte: "Quelque part vers Saint-Michel, une cloche sonne. Une fois. Deux fois. Personne ne sonne plus les cloches. Au bout de la rue, des têtes se tournent toutes dans la même direction, et tu en profites pour passer.",
  },
  {
    id: 'r_mistral_volets', poids: 2, type: 'ambiance', echelle: 'salon', zones: null, nuit: null, dangerMin: 0,
    illu: 'rue', effets: { sta: -5 },
    texte: "Une rafale de mistral fait claquer tous les volets de la rue en même temps. Tu t'es plaqué{|e} contre un mur avant même de comprendre. Ton cœur met longtemps à redescendre.",
  },
  {
    id: 'r_graffiti', poids: 1, type: 'ambiance', echelle: 'salon', zones: null, nuit: false, dangerMin: 0,
    illu: 'vitrine',
    texte: "Sur la vitrine d'une banque, à la bombe rouge : « ILS ENTENDENT TOUT. MARCHEZ PIEDS NUS. » Juste en dessous, une paire de chaussures bien rangée, lacets dénoués.",
  },
  {
    id: 'r_helicoptere', poids: 1, type: 'ambiance', echelle: 'region', zones: null, nuit: false, dangerMin: 0, unique: true,
    illu: 'ciel',
    texte: "Un bruit de rotor, loin. Un hélicoptère passe très haut, cap au nord, sans ralentir. Tu agites les bras longtemps après qu'il a disparu derrière les Alpilles.",
  },
  {
    id: 'r_pendus', poids: 1, type: 'ambiance', echelle: 'region', zones: null, nuit: null, dangerMin: 0, unique: true,
    illu: 'platane',
    texte: "Trois corps pendus à un platane au bord de la départementale, mains liées dans le dos. Un carton au cou du premier : « PILLARD ». Les trois pieds bougent encore, doucement, à hauteur de ton visage. Personne ne les a achevés. C'était peut-être le but.",
  },
  {
    id: 'r_brouillard', poids: 1, type: 'ambiance', echelle: null, zones: null, nuit: null, dangerMin: 0,
    illu: 'brouillard', effets: { tempsMin: 5 },
    texte: "Le brouillard monte du canal et avale la route. Tu n'y vois plus à dix mètres. Tu entends tout, en revanche. Surtout ce qui n'est pas là.",
  },
];

export const TYPES_RENCONTRE = ['combat', 'choix', 'butin', 'ambiance', 'pnj'];
export function rencontre(id) { return RENCONTRES.find(r => r.id === id) || null; }
