// ============================================================================
//  VÊTEMENTS & ÉQUIPEMENT PORTÉ
// ============================================================================
// Champs :
//   nom, slot            slot ∈ tete | torse | mains | jambes | pieds | sac | ceinture | holster
//   poids                kg (un vêtement porté pèse mais n'occupe pas d'emplacement).
//   espace               EMPLACEMENTS offerts (poches, sac) — c'est l'« encombrement » que tu peux porter.
//   portage              kg de charge en plus (sacs, harnais).
//   protection 0..4      protection de chaque ZONE couverte (voir `couvre`). Par point : −2 dégâts sur un coup
//                        qui touche cette zone ; 30 % de chance que les dents ne passent pas ; ≥ 2 : une griffure
//                        ne fait plus de plaie (voir reglages.combat.PROTECTION).
//   couvre [zones]       NOUVEAU — les zones du corps protégées (vocabulaire ZONES_CORPS ci-dessous). Si absent : COUVRE_DEFAUT[slot].
//   chaleur              points de chaleur (froid : voir reglages.survie.FROID).
//   agilite              NOUVEAU (ou ±1) — compte comme des niveaux d'agilité (esquive, fuite). Encombrant : −1.
//   bruitPas             NOUVEAU — × bruit de tes pas (rangers 1,2 ; baskets 0,9).
//   impermeable          NOUVEAU — protège de la pluie (pas de +1 froid « mouillé »).
//   ouie                 NOUVEAU — × portée à laquelle TU entends les morts (casque intégral : 0,7).
//   accesRapide          emplacements d'accès rapide (seuls ces objets sont utilisables en combat, avec l'arme en main).
//   tissu                chiffons rendus si on DÉCHIRE le vêtement (cuir, synthétique, métal : rien).
//   desc
// ============================================================================

// Vocabulaire des zones — les attaques des morts (zombies.js) n'emploient QUE ces zones.
export const ZONES_CORPS = [
  'à la tête', 'au visage', 'au cou', 'à l\'épaule', 'au bras', 'à l\'avant-bras', 'à la main',
  'au torse', 'au flanc', 'au ventre', 'dans le dos',
  'à la cuisse', 'au genou', 'au mollet', 'à la cheville', 'au pied',
];
// Zones « jambe » (blessure à une jambe → vitesse de voyage, fuite) et « bras » (fracture → dégâts).
export const ZONES_JAMBE = ['à la cuisse', 'au genou', 'au mollet', 'à la cheville', 'au pied'];
export const ZONES_BRAS = ['à l\'épaule', 'au bras', 'à l\'avant-bras', 'à la main'];

export const COUVRE_DEFAUT = {
  tete: ['à la tête'],
  torse: ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule'],
  mains: ['à la main'],
  jambes: ['à la cuisse', 'au genou', 'au mollet'],
  pieds: ['au pied', 'à la cheville'],
  sac: [], ceinture: [], holster: [],
};
const MANCHES = ['au torse', 'au flanc', 'au ventre', 'dans le dos', 'à l\'épaule', 'au bras', 'à l\'avant-bras'];

export const CLOTHES = {

  // ---------- TÊTE ----------
  bonnet: {
    nom: 'Bonnet de laine', slot: 'tete', poids: 0.2, espace: 0, protection: 0, chaleur: 2, tissu: 1,
    desc: 'Gratte un peu. Garde les oreilles.',
  },
  casquette: {
    nom: 'Casquette', slot: 'tete', poids: 0.15, espace: 0, protection: 0, chaleur: 1, tissu: 1,
    desc: 'Logo d\'une équipe qui ne jouera plus jamais.',
  },
  casque_chantier: {
    nom: 'Casque de chantier', slot: 'tete', poids: 0.4, espace: 0, protection: 1, chaleur: 0,
    desc: 'Jaune, fendu, la sangle réglée sur la tête d\'un autre. Un coup de poing mort glisse dessus.',
  },
  casque_fortune: {
    nom: 'Casque de fortune', slot: 'tete', poids: 0.9, espace: 0, protection: 1, chaleur: 1, couvre: ['à la tête', 'au visage'],
    desc: 'Une casserole rembourrée de chiffons, jugulaire en scotch, une visière de plastique découpée. Ridicule jusqu\'au premier coup que tu ne sens pas.',
  },
  casque_pompier: {
    nom: 'Casque de pompier', slot: 'tete', poids: 1.4, espace: 0, protection: 2, chaleur: 1, couvre: ['à la tête', 'au visage'],
    desc: 'Le casque chromé des sapeurs de Salon, visière dorée rabattue. Il a vu des feux. Il verra pire.',
  },
  casque_militaire: {
    nom: 'Casque de combat', slot: 'tete', poids: 1.5, espace: 0, protection: 3, chaleur: 1,
    desc: 'Composite, couvre-casque camouflé, une étiquette « BA 701 » à l\'intérieur. La tête est à l\'abri. Le visage, non.',
  },
  casque_moto: {
    nom: 'Casque de moto intégral', slot: 'tete', poids: 1.5, espace: 0, protection: 3, chaleur: 1, ouie: 0.7,
    couvre: ['à la tête', 'au visage', 'au cou'],
    desc: 'Les dents ne passent pas à travers. La visière est fendue, et tu entends le monde comme au fond d\'une piscine.',
  },

  // ---------- TORSE ----------
  tshirt: {
    nom: 'T-shirt', slot: 'torse', poids: 0.2, espace: 0, protection: 0, chaleur: 0, tissu: 1,
    desc: 'Du coton fin. Autant dire rien.',
  },
  sweat_capuche: {
    nom: 'Sweat à capuche', slot: 'torse', poids: 0.5, espace: 1, protection: 0, chaleur: 2, tissu: 2, couvre: MANCHES,
    desc: 'Une poche kangourou, une capuche, une odeur de lessive qui s\'en va. Le vêtement de tous les jours d\'avant.',
  },
  pull_laine: {
    nom: 'Pull en laine', slot: 'torse', poids: 0.6, espace: 0, protection: 0, chaleur: 3, tissu: 2, couvre: MANCHES,
    desc: 'Tricoté par quelqu\'un qui aimait quelqu\'un.',
  },
  blouse_medicale: {
    nom: 'Blouse d\'hôpital', slot: 'torse', poids: 0.3, espace: 1, protection: 0, chaleur: 0, tissu: 2, couvre: MANCHES,
    desc: 'Blanche, enfin elle l\'était. Un badge au nom d\'une interne. Deux poches, et c\'est tout ce qu\'elle a pour elle.',
  },
  veste_cuir: {
    nom: 'Veste en cuir', slot: 'torse', poids: 2.0, espace: 1, protection: 2, chaleur: 1, couvre: MANCHES,
    desc: 'Le cuir épais arrête les ongles et amortit les dents.',
  },
  blouson_moto: {
    nom: 'Blouson de moto', slot: 'torse', poids: 2.4, espace: 1, protection: 3, chaleur: 2, couvre: MANCHES,
    desc: 'Cuir épais, coques aux coudes et aux épaules. Il a déjà frotté le bitume de la nationale. Il frottera des dents.',
  },
  manteau_hiver: {
    nom: 'Manteau d\'hiver', slot: 'torse', poids: 2.6, espace: 2, protection: 1, chaleur: 4, tissu: 3, agilite: -1, couvre: MANCHES,
    desc: 'Encombrant mais chaud. Le mistral tue autant que les morts.',
  },
  veste_pompier: {
    nom: 'Veste de feu', slot: 'torse', poids: 2.5, espace: 2, protection: 2, chaleur: 3, impermeable: true, couvre: MANCHES,
    desc: 'La veste d\'intervention d\'un sapeur-pompier, bandes réfléchissantes et tissu ignifugé. Ça ne brûle pas, ça ne se déchire pas, ça ne sèche jamais.',
  },
  gilet_tactique: {
    nom: 'Gilet tactique', slot: 'torse', poids: 3.2, espace: 3, protection: 3, chaleur: 0, accesRapide: 2, portage: 2, agilite: -1,
    couvre: ['au torse', 'au flanc', 'au ventre', 'dans le dos'],
    desc: 'Plaques et sangles. Trouvé sur quelqu\'un qui n\'en a plus besoin. Les bras restent nus, mais deux objets restent à portée de main.',
  },
  veste_renforcee: {
    nom: 'Veste renforcée', slot: 'torse', poids: 2.8, espace: 1, protection: 3, chaleur: 1, agilite: -1, couvre: MANCHES,
    desc: 'Une veste en cuir cousue de fil de fer et de plaques de fortune. Lourde, raide, rassurante.',
  },
  poncho_pluie: {
    nom: 'Poncho de pluie', slot: 'torse', poids: 0.5, espace: 0, protection: 0, chaleur: 1, impermeable: true,
    desc: 'Une bâche de chantier découpée et scotchée aux épaules. Tu ressembles à un sac poubelle, mais un sac poubelle sec.',
  },

  // ---------- MAINS (et avant-bras) ----------
  gants_laine: {
    nom: 'Gants de laine', slot: 'mains', poids: 0.1, espace: 0, protection: 0, chaleur: 2, tissu: 1,
    desc: 'Doigts au chaud, prise moyenne.',
  },
  gants_cuir: {
    nom: 'Gants de cuir', slot: 'mains', poids: 0.25, espace: 0, protection: 1, chaleur: 1,
    desc: 'Protègent des éclats de verre et des griffures superficielles.',
  },
  gants_renforces: {
    nom: 'Gants renforcés', slot: 'mains', poids: 0.45, espace: 0, protection: 2, chaleur: 1, couvre: ['à la main', 'à l\'avant-bras'],
    desc: 'Du cuir doublé de fil de fer tressé, remonté en manchette jusqu\'au coude. Les dents glissent dessus.',
  },
  brassards_journaux: {
    nom: 'Brassards de magazines', slot: 'mains', poids: 0.6, espace: 0, protection: 2, chaleur: 1, couvre: ['à l\'avant-bras', 'à la main'],
    desc: 'Des magazines télé roulés serré autour des avant-bras, scotchés jusqu\'aux doigts. Trois cents pages de programmes que personne ne regardera. Les dents s\'y cassent.',
  },

  // ---------- JAMBES ----------
  jogging: {
    nom: 'Pantalon de jogging', slot: 'jambes', poids: 0.4, espace: 0, protection: 0, chaleur: 1, agilite: 1, tissu: 2,
    desc: 'Souple. On court bien dedans.',
  },
  jean: {
    nom: 'Jean', slot: 'jambes', poids: 0.7, espace: 1, protection: 1, chaleur: 1, tissu: 2,
    desc: 'La toile épaisse a déjà sauvé bien des mollets.',
  },
  pantalon_cargo: {
    nom: 'Pantalon cargo', slot: 'jambes', poids: 0.8, espace: 2, protection: 1, chaleur: 1, tissu: 2,
    desc: 'Des poches partout. Le vêtement du pillard.',
  },
  treillis: {
    nom: 'Pantalon de treillis', slot: 'jambes', poids: 0.9, espace: 2, protection: 1, chaleur: 2, tissu: 2,
    desc: 'Toile ripstop, genoux renforcés, poches à rabat. Il a été repassé, un jour.',
  },
  jean_genouilleres: {
    nom: 'Jean à jambières', slot: 'jambes', poids: 1.1, espace: 1, protection: 2, chaleur: 1, tissu: 2,
    desc: 'Un jean blindé de journaux pliés et de chiffons scotchés aux genoux et aux tibias. Les rampants mordent là d\'abord.',
  },

  // ---------- PIEDS ----------
  baskets: {
    nom: 'Baskets', slot: 'pieds', poids: 0.6, espace: 0, protection: 0, chaleur: 0, agilite: 1, bruitPas: 0.9,
    desc: 'Silencieuses et rapides.',
  },
  rangers: {
    nom: 'Rangers', slot: 'pieds', poids: 1.4, espace: 0, protection: 2, chaleur: 1, bruitPas: 1.2,
    desc: 'Bouts coqués. Écraser une tête ne laisse même pas de marque dessus. On t\'entend venir.',
  },
  bottes_cuir: {
    nom: 'Bottes en cuir', slot: 'pieds', poids: 1.2, espace: 0, protection: 2, chaleur: 2, couvre: ['au pied', 'à la cheville', 'au mollet'],
    desc: 'Montantes jusqu\'au mollet. Les chevilles sont la cible préférée des rampants.',
  },
  bottes_caoutchouc: {
    nom: 'Bottes en caoutchouc', slot: 'pieds', poids: 1.3, espace: 0, protection: 1, chaleur: 1, impermeable: true, bruitPas: 1.1,
    couvre: ['au pied', 'à la cheville', 'au mollet'],
    desc: 'Les bottes vertes du jardinier, montantes. Elles couinent à chaque pas et ne laissent rien passer — ni l\'eau, ni les incisives.',
  },

  // ---------- CEINTURES ----------
  // Sans ceinture (ou holster, gilet, sac militaire), AUCUN objet en accès rapide :
  // en combat, tu te bats avec ce que tu as en main, point.
  ceinture_fortune: {
    nom: 'Ceinture de fortune', slot: 'ceinture', poids: 0.3, espace: 0, protection: 0, chaleur: 0, accesRapide: 1,
    desc: 'De la corde et du scotch. Un objet coincé dedans, à portée de main.',
  },
  ceinture_cuir: {
    nom: 'Ceinture en cuir', slot: 'ceinture', poids: 0.4, espace: 0, protection: 0, chaleur: 0, accesRapide: 2,
    desc: 'Une bonne ceinture épaisse. Deux objets glissés dedans, dégainés en une seconde.',
  },
  ceinture_outils: {
    nom: 'Ceinture porte-outils', slot: 'ceinture', poids: 0.9, espace: 1, protection: 0, chaleur: 0, accesRapide: 3, portage: 1,
    desc: 'Boucles, étuis, mousquetons. Le harnais d\'un artisan — ou d\'un survivant organisé.',
  },
  ceinture_renforcee: {
    nom: 'Ceinture renforcée', slot: 'ceinture', poids: 0.6, espace: 0, protection: 0, chaleur: 0, accesRapide: 3,
    desc: 'Une ceinture en cuir doublée de boucles en fil de fer scotché. Trois objets calés contre les reins, dégainés sans regarder.',
  },

  // ---------- HOLSTERS ----------
  holster_cuisse: {
    nom: 'Holster de cuisse', slot: 'holster', poids: 0.4, espace: 0, protection: 0, chaleur: 0, accesRapide: 1,
    desc: 'Sanglé sur la cuisse. Une arme de plus, prête à sortir.',
  },
  holster_fortune: {
    nom: 'Holster de fortune', slot: 'holster', poids: 0.25, espace: 0, protection: 0, chaleur: 0, accesRapide: 1, tissu: 1,
    desc: 'Des chiffons cousus en étui, noués à la cuisse par de la corde. Pas élégant, mais l\'objet sort vite.',
  },

  // ---------- SACS ----------
  // Sans sac : les 4 poches, les bras, et c'est tout. Chaque sac donne de l'ESPACE
  // (emplacements) et du PORTAGE (kg en plus). Du sac plastique au sac militaire.
  cabas_courses: {
    nom: 'Cabas de courses', slot: 'sac', poids: 0.2, espace: 3, protection: 0, chaleur: 0, portage: 2,
    desc: 'Un cabas réutilisable « préservons la planète ». La planète a d\'autres soucis, mais il porte encore.',
  },
  sac_fortune: {
    nom: 'Sac de fortune', slot: 'sac', poids: 0.3, espace: 3, protection: 0, chaleur: 0, portage: 2, tissu: 2,
    desc: 'Des chiffons cousus à la corde. Moche, fragile, mais des poches sont des poches.',
  },
  sacoche: {
    nom: 'Sacoche en bandoulière', slot: 'sac', poids: 0.5, espace: 4, protection: 0, chaleur: 0, portage: 3,
    desc: 'Petite mais pratique. Elle bat contre la hanche quand tu cours.',
  },
  sac_a_dos: {
    nom: 'Sac à dos d\'écolier', slot: 'sac', poids: 0.9, espace: 6, protection: 0, chaleur: 0, portage: 5,
    desc: 'Un cartable à bretelles, des initiales au feutre sur le rabat. Le cartable de la fin du monde.',
  },
  sac_randonnee: {
    nom: 'Sac de randonnée', slot: 'sac', poids: 2.0, espace: 10, protection: 0, chaleur: 0, portage: 8, agilite: -1,
    desc: '60 litres, armatures et sangle ventrale. Tout ce que tu possèdes tiendra dedans — et tout ça te tirera en arrière quand il faudra plonger.',
  },
  sac_militaire: {
    nom: 'Sac militaire', slot: 'sac', poids: 2.6, espace: 12, protection: 0, chaleur: 0, portage: 10, accesRapide: 1, agilite: -1,
    desc: 'Un sac de paquetage de la base aérienne 701. Sanglé serré, il porte une maison — et garde un objet à portée de main.',
  },
};

export const SLOTS = {
  tete: 'Tête', torse: 'Torse', mains: 'Mains',
  jambes: 'Jambes', pieds: 'Pieds', sac: 'Sac',
  ceinture: 'Ceinture', holster: 'Holster',
};

export function cloth(id) { return CLOTHES[id] || null; }
// Zones couvertes par un vêtement (champ `couvre`, sinon celles de son slot).
export function zonesCouvertes(id) {
  const c = CLOTHES[id];
  if (!c) return [];
  return c.couvre || COUVRE_DEFAUT[c.slot] || [];
}
