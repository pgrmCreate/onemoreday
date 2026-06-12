// ============ Vêtements ============
// Caractéristiques (cf. instructions) :
//   poids (négatif — il pèse), espace (positif — poches/sacs),
//   protection (positif — réduit les dégâts), chaleur (négatif ou positif selon la situation),
//   accesRapide (emplacements d'accès rapide : seuls ces objets sont utilisables en combat),
//   portage (kg de charge en plus — façon Project Zomboid : sans sac, on ne porte presque rien),
//   tissu (nombre de chiffons rendus si on DÉCHIRE le vêtement — cuir et synthétique : rien)
// slots : tete, torse, mains, jambes, pieds, sac, ceinture, holster
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
  casque_moto: {
    nom: 'Casque de moto', slot: 'tete', poids: 1.5, espace: 0, protection: 3, chaleur: 1,
    desc: 'Les dents ne passent pas à travers. La visière est fendue.',
  },
  casque_fortune: {
    nom: 'Casque de fortune', slot: 'tete', poids: 0.9, espace: 0, protection: 2, chaleur: 1,
    desc: 'Une casserole rembourrée de chiffons, jugulaire en scotch. Ridicule jusqu\'au premier coup que tu ne sens pas.',
  },

  // ---------- TORSE ----------
  tshirt: {
    nom: 'T-shirt', slot: 'torse', poids: 0.2, espace: 0, protection: 0, chaleur: 0, tissu: 1,
    desc: 'Du coton fin. Autant dire rien.',
  },
  pull_laine: {
    nom: 'Pull en laine', slot: 'torse', poids: 0.6, espace: 0, protection: 0, chaleur: 3, tissu: 2,
    desc: 'Tricoté par quelqu\'un qui aimait quelqu\'un.',
  },
  veste_cuir: {
    nom: 'Veste en cuir', slot: 'torse', poids: 2.0, espace: 1, protection: 3, chaleur: 1,
    desc: 'Le cuir épais arrête les ongles et amortit les dents.',
  },
  manteau_hiver: {
    nom: 'Manteau d\'hiver', slot: 'torse', poids: 2.6, espace: 2, protection: 1, chaleur: 4, tissu: 3,
    desc: 'Encombrant mais chaud. L\'hiver tue autant que les morts.',
  },
  gilet_tactique: {
    nom: 'Gilet tactique', slot: 'torse', poids: 3.2, espace: 3, protection: 4, chaleur: 0, accesRapide: 2, portage: 2,
    desc: 'Kevlar et sangles. Trouvé sur quelqu\'un qui n\'en a plus besoin. Les sangles gardent deux objets à portée de main.',
  },
  veste_renforcee: {
    nom: 'Veste renforcée', slot: 'torse', poids: 2.8, espace: 1, protection: 4, chaleur: 1,
    desc: 'Une veste en cuir cousue de fil de fer et de plaques de fortune. Lourde, raide, rassurante.',
  },
  poncho_pluie: {
    nom: 'Poncho de pluie', slot: 'torse', poids: 0.5, espace: 0, protection: 0, chaleur: 1,
    desc: 'Une bâche de chantier découpée et scotchée aux épaules. Tu ressembles à un sac poubelle, mais un sac poubelle sec.',
  },

  // ---------- MAINS ----------
  gants_laine: {
    nom: 'Gants de laine', slot: 'mains', poids: 0.1, espace: 0, protection: 0, chaleur: 2, tissu: 1,
    desc: 'Doigts au chaud, prise moyenne.',
  },
  gants_cuir: {
    nom: 'Gants de cuir', slot: 'mains', poids: 0.25, espace: 0, protection: 1, chaleur: 1,
    desc: 'Protègent des éclats de verre et des morsures superficielles.',
  },
  gants_renforces: {
    nom: 'Gants renforcés', slot: 'mains', poids: 0.4, espace: 0, protection: 2, chaleur: 1,
    desc: 'Du cuir doublé de fil de fer tressé sur les phalanges. Les dents glissent dessus.',
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
  jean_genouilleres: {
    nom: 'Jean à genouillères', slot: 'jambes', poids: 1.0, espace: 1, protection: 2, chaleur: 1, tissu: 2,
    desc: 'Un jean blindé de journaux pliés et de chiffons scotchés aux genoux et aux tibias. Les rampants mordent là d\'abord.',
  },

  // ---------- PIEDS ----------
  baskets: {
    nom: 'Baskets', slot: 'pieds', poids: 0.6, espace: 0, protection: 0, chaleur: 0, agilite: 1,
    desc: 'Silencieuses et rapides.',
  },
  rangers: {
    nom: 'Rangers', slot: 'pieds', poids: 1.4, espace: 0, protection: 2, chaleur: 1,
    desc: 'Bouts coqués. Écraser une tête ne laisse même pas de marque dessus.',
  },
  bottes_cuir: {
    nom: 'Bottes en cuir', slot: 'pieds', poids: 1.2, espace: 0, protection: 2, chaleur: 2,
    desc: 'Montantes. Les chevilles sont la cible préférée des rampants.',
  },

  // ---------- CEINTURES ----------
  // Sans ceinture (ou équivalent), AUCUN objet en accès rapide : en combat,
  // tu te bats avec ce que tu as en main, point.
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
  holster_cuisse: {
    nom: 'Holster de cuisse', slot: 'holster', poids: 0.4, espace: 0, protection: 0, chaleur: 0, accesRapide: 1,
    desc: 'Sanglé sur la cuisse. Une arme de plus, prête à sortir.',
  },
  holster_fortune: {
    nom: 'Holster de fortune', slot: 'holster', poids: 0.25, espace: 0, protection: 0, chaleur: 0, accesRapide: 1, tissu: 1,
    desc: 'Des chiffons cousus en étui, noués à la cuisse par de la corde. Pas élégant, mais l\'objet sort vite.',
  },

  // ---------- SACS ----------
  // Sans sac : les poches, les bras, et c'est tout. Chaque sac donne de l'ESPACE
  // (emplacements) et du PORTAGE (kg en plus). Du sac plastique au sac militaire.
  cabas_courses: {
    nom: 'Cabas de courses', slot: 'sac', poids: 0.2, espace: 3, protection: 0, chaleur: 0, portage: 2,
    desc: 'Un cabas réutilisable « préservons la planète ». La planète a d\'autres soucis, mais il porte encore.',
  },
  sac_fortune: {
    nom: 'Sac de fortune', slot: 'sac', poids: 0.3, espace: 2, protection: 0, chaleur: 0, portage: 2, tissu: 2,
    desc: 'Des chiffons cousus à la corde. Moche, fragile, mais des poches sont des poches.',
  },
  sacoche: {
    nom: 'Sacoche en bandoulière', slot: 'sac', poids: 0.5, espace: 3, protection: 0, chaleur: 0, portage: 3,
    desc: 'Petite mais pratique.',
  },
  sac_a_dos: {
    nom: 'Sac à dos d\'écolier', slot: 'sac', poids: 0.9, espace: 6, protection: 0, chaleur: 0, portage: 5,
    desc: 'Un sac d\'écolier. Le cartable de la fin du monde.',
  },
  sac_randonnee: {
    nom: 'Sac de randonnée', slot: 'sac', poids: 2.0, espace: 10, protection: 1, chaleur: 0, portage: 8,
    desc: '60 litres, armatures et sangle ventrale. Tout ce que tu possèdes tiendra dedans.',
  },
  sac_militaire: {
    nom: 'Sac militaire', slot: 'sac', poids: 2.6, espace: 12, protection: 1, chaleur: 0, portage: 10, accesRapide: 1,
    desc: 'Un sac de paquetage de la base aérienne 701. Sanglé serré, il porte une maison — et garde un objet à portée de main.',
  },
};

export const SLOTS = {
  tete: 'Tête', torse: 'Torse', mains: 'Mains',
  jambes: 'Jambes', pieds: 'Pieds', sac: 'Sac',
  ceinture: 'Ceinture', holster: 'Holster',
};

export function cloth(id) { return CLOTHES[id]; }
