// ============================================================================
//  OBJETS — armes, munitions, lancers, nourriture, soins, outils, matériaux, livres
// ============================================================================
// Champs communs :
//   nom, type, poids (kg), espace (emplacements d'encombrement ; 0 = tient dans une poche sans compter), desc
//   type ∈ arme | munition | jet | nourriture | boisson | soin | outil | materiau | recipient | livre | lore
//        ('quete' est réservé aux objets du scénariste : js/data/histoire/objets_quete.js)
//   usage [tags]    ce que l'objet permet quand il est dans le sac / en main (outils des recettes, actions) :
//                   allumer, cuisson, couper, ouvrir, visser, marteler, affuter, coudre, forcer, couper_chaine,
//                   crocheter, siphon, lumiere, peche, piege, alarme, filtrer, creuser, observer, radio,
//                   entretien_arme, escalade, desinfecter, combustible, abattre (hache : arbres), elaguer (buissons), scier
//
// ── ARMES (type 'arme') — voir docs/GAMEPLAY.md §Temps 3 ──
//   dmg [min,max]   dégâts d'un coup rapide (arme à feu : d'un tir).
//   vitesse         NOUVEAU — ms d'un coup rapide (durée du geste ; pas d'autre action pendant).
//   sta             NOUVEAU — endurance d'un coup rapide (coup chargé plein : × 2,5).
//   allonge 0..2    NOUVEAU — 0 court (couteau), 1 moyen (batte), 2 long (lance, pelle, armes à feu).
//                   Chaque point ralentit la jauge de menace de 8 % et repousse de +4 % par coup.
//   charge          NOUVEAU — multiplicateur de dégâts d'un coup chargé plein (1 = pas de charge).
//   stagger 0..1    NOUVEAU — chance qu'un coup chargé plein fasse VACILLER (coup rapide : × 0,3 ; × (1 − résistance)).
//   crit 0..1       NOUVEAU — chance de critique de base (× 2 dégâts).
//   dur             durabilité (coups qui portent ; coup lourd : 2).
//   bruit 0..3      bruit à l'impact (0 muet, 1 sourd, 2 résonne, 3 détonation) → rayon : 0 / 3 / 8 / 25 cases.
//   skill           compétence : force (contondant, lourd) | dexterite (lames, lances) | visee (tir) | mainsNues
//   deux_mains      NOUVEAU — occupe les deux mains : pas de lampe torche en main (frontale conseillée).
//   reparation      NOUVEAU — famille de réparation : 'lame' | 'bois' | 'metal' | 'arme_feu' (recettes spéciales).
//   tir { munition, capacite, precision, recharge (ms), portee (0..2), recuperable? }  armes à feu / arbalète.
//   crosse [min,max] NOUVEAU — dégâts de « Frapper » avec une arme à feu en main (coup de crosse).
//
// ── LANCERS (champ `jet`, sur type 'jet' ou tout objet lançable) ──
//   jet { portee (cases), bruit (rayon à l'impact), dmg?, stagger?, crit?, feu? {ms, dps}, lumiere?,
//         duree_s? (bruit ou lumière qui dure), delai_s?, recuperable? (0..1), combat (utilisable en combat ?) }
//   En exploration, lancer un objet crée un bruit à l'impact : les morts vont voir (LEURRE).
//
// ── NOURRITURE / BOISSONS ──
//   kcal (calories RÉELLES de l'objet entier → cale la faim : survie.REPAS), cru (part utile si mangé cru), perissable (h avant
//   qu'il tourne une fois entamé), soif, fatigue (+ = te redonne), besoinOuvre (ouvre-boîte ou lame), risque { type, p }, rend
// ── SOINS ── soin ∈ bandage | desinfectant | nettoyer | antibio | antidouleur | suture | attelle | vitamines |
//                     tisane | onguent | charbon ;  qualite (bandage : 1 propre, 0,5 sale), antiseptique (pansement)
// ── EAU ── contenance (L) + recipient 'ferme' | 'ouvert' ; l'eau vit sur l'instance : { eau: { q, L } }.
// ── LUMIÈRE ── usage 'lumiere' ; réglages dans reglages.lumiere.SOURCES[id] ; carburant : 'piles' | 'huile_olive'.
// ── LIVRES (type 'livre') ── lecture (min), xp { skill: n } une fois ; apprend les recettes dont apprise_par le cite.
// ============================================================================

export const ITEMS = {

  // =========================== ARMES DE MÊLÉE ===========================
  // --- Lames (dextérité) : rapides, critiques, s'usent ---
  couteau_cuisine: {
    nom: 'Couteau de cuisine', type: 'arme', poids: 0.3, espace: 1, volume: 0.25,
    dmg: [7, 11], vitesse: 400, sta: 5, allonge: 0, charge: 1.4, stagger: 0.05, crit: 0.15,
    dur: 40, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper', 'ouvrir'],
    desc: 'La lame est encore propre. Ça ne durera pas — mais bien aiguisée, elle tient plus longtemps qu\'on ne croit.',
  },
  couteau_artisanal: {
    nom: 'Couteau artisanal', type: 'arme', poids: 0.3, espace: 1, volume: 0.2,
    dmg: [5, 9], vitesse: 420, sta: 5, allonge: 0, charge: 1.3, stagger: 0.03, crit: 0.12,
    dur: 18, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper'],
    desc: 'Un éclat de verre, un chiffon, du scotch. Ça coupe la chair — et parfois la main qui le tient.',
  },
  couteau_combat: {
    nom: 'Couteau de combat', type: 'arme', poids: 0.35, espace: 1, volume: 0.3,
    dmg: [10, 15], vitesse: 380, sta: 5, allonge: 0, charge: 1.5, stagger: 0.08, crit: 0.2,
    dur: 90, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper', 'ouvrir'],
    desc: 'Lame noire, dos dentelé, garde en croix. Fait pour ça. Il glisse entre deux vertèbres comme une clé dans sa serrure.',
  },
  tournevis: {
    nom: 'Tournevis', type: 'arme', poids: 0.15, espace: 0, volume: 0.08,
    dmg: [4, 8], vitesse: 380, sta: 4, allonge: 0, charge: 1.4, stagger: 0.02, crit: 0.2,
    dur: 25, bruit: 0, skill: 'dexterite', reparation: 'metal', usage: ['visser'],
    desc: 'Dans l\'œil, jusqu\'au manche, ça marche aussi. Sinon, ça visse.',
  },
  epieu: {
    nom: 'Épieu', type: 'arme', poids: 0.9, espace: 2, volume: 3, long: true,
    dmg: [7, 12], vitesse: 600, sta: 7, allonge: 2, charge: 1.5, stagger: 0.2, crit: 0.1,
    dur: 16, bruit: 0, skill: 'dexterite', reparation: 'bois',
    desc: 'Une branche taillée en pointe. Ça tient un mort à distance — le temps qu\'elle ne casse pas.',
  },
  hachette: {
    nom: 'Hachette', type: 'arme', poids: 0.9, espace: 2, volume: 1.2,
    dmg: [11, 17], vitesse: 620, sta: 9, allonge: 0, charge: 1.8, stagger: 0.3, crit: 0.12,
    dur: 55, bruit: 1, skill: 'force', reparation: 'bois', usage: ['couper', 'abattre', 'elaguer'],
    desc: 'Une hachette de camping au manche verni. Elle fend une bûche, elle ouvre un crâne : c\'est la même main qui décide.',
  },
  machette: {
    nom: 'Machette', type: 'arme', poids: 0.8, espace: 2, volume: 1.5, long: true,
    dmg: [13, 20], vitesse: 560, sta: 9, allonge: 1, charge: 1.6, stagger: 0.2, crit: 0.15,
    dur: 50, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper', 'elaguer'],
    desc: 'Tranche net. Elle tranche net. Chez eux, les moignons ne saignent même plus.',
  },
  machette_aiguisee: {
    nom: 'Machette aiguisée', type: 'arme', poids: 0.8, espace: 2, volume: 1.5, long: true,
    dmg: [15, 22], vitesse: 560, sta: 9, allonge: 1, charge: 1.6, stagger: 0.2, crit: 0.22,
    dur: 42, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper'],
    desc: 'Le fil repris à la pierre, affûté à raser. Il tranche les vertèbres — et s\'use plus vite.',
  },
  sabre_cavalerie: {
    nom: 'Sabre de cavalerie', type: 'arme', poids: 1.1, espace: 2, volume: 2, long: true,
    dmg: [15, 23], vitesse: 520, sta: 8, allonge: 1, charge: 1.6, stagger: 0.2, crit: 0.2,
    dur: 35, bruit: 0, skill: 'dexterite', reparation: 'lame', usage: ['couper'],
    desc: 'Sorti d\'une vitrine du musée de l\'Empéri. Cent cinquante ans qu\'il attendait de resservir.',
  },
  lance_artisanale: {
    nom: 'Lance artisanale', type: 'arme', poids: 1.3, espace: 3, volume: 8, long: true,
    dmg: [10, 16], vitesse: 560, sta: 8, allonge: 2, charge: 1.5, stagger: 0.15, crit: 0.12,
    dur: 20, bruit: 0, skill: 'dexterite', deux_mains: true, reparation: 'bois',
    desc: 'Un couteau ligaturé au bout d\'un manche à balai. Il tient les dents à distance.',
  },
  lance_renforcee: {
    nom: 'Lance renforcée', type: 'arme', poids: 1.5, espace: 3, volume: 8, long: true,
    dmg: [12, 18], vitesse: 560, sta: 8, allonge: 2, charge: 1.5, stagger: 0.18, crit: 0.14,
    dur: 40, bruit: 0, skill: 'dexterite', deux_mains: true, reparation: 'bois',
    desc: 'Ligatures de fil de fer, pointe resserrée. Elle ne bougera plus, même plantée dans un sternum.',
  },

  // --- Contondants (force) : font vaciller, durent ---
  marteau: {
    nom: 'Marteau', type: 'arme', poids: 0.6, espace: 1, volume: 0.5,
    dmg: [7, 12], vitesse: 520, sta: 7, allonge: 0, charge: 1.6, stagger: 0.25, crit: 0.1,
    dur: 60, bruit: 1, skill: 'force', reparation: 'bois', usage: ['marteler'],
    desc: 'Plante les clous. Dépanne en combat, et pas qu\'un peu : un crâne, c\'est une planche comme une autre.',
  },
  cle_molette: {
    nom: 'Clé à molette', type: 'arme', poids: 0.9, espace: 1, volume: 0.3,
    dmg: [8, 13], vitesse: 560, sta: 8, allonge: 0, charge: 1.6, stagger: 0.25, crit: 0.08,
    dur: 80, bruit: 1, skill: 'force', reparation: 'metal', usage: ['visser'],
    desc: 'Un outil honnête. Casse les mâchoires et démonte les boulons.',
  },
  matraque: {
    nom: 'Tonfa', type: 'arme', poids: 0.6, espace: 1, volume: 0.8,
    dmg: [8, 13], vitesse: 460, sta: 6, allonge: 0, charge: 1.6, stagger: 0.35, crit: 0.05,
    dur: 150, bruit: 1, skill: 'force', reparation: 'metal',
    desc: 'Le bâton à poignée latérale de la police nationale. Increvable. Il ne tue pas vite, mais il fait reculer, et il ne casse jamais.',
  },
  batte_baseball: {
    nom: 'Batte de baseball', type: 'arme', poids: 1.1, espace: 2, volume: 3.5, long: true,
    dmg: [11, 17], vitesse: 620, sta: 9, allonge: 1, charge: 1.8, stagger: 0.35, crit: 0.08,
    dur: 45, bruit: 1, skill: 'force', reparation: 'bois',
    desc: 'Le bois est fendu sur le manche. Quelqu\'un s\'en est déjà servi pour autre chose que du sport.',
  },
  batte_cloutee: {
    nom: 'Batte cloutée', type: 'arme', poids: 1.4, espace: 2, volume: 4, long: true,
    dmg: [14, 21], vitesse: 660, sta: 10, allonge: 1, charge: 1.8, stagger: 0.35, crit: 0.14,
    dur: 38, bruit: 1, skill: 'force', reparation: 'bois',
    desc: 'Les clous accrochent l\'os et arrachent des lambeaux à chaque coup.',
  },
  tuyau_acier: {
    nom: 'Tuyau d\'acier', type: 'arme', poids: 1.6, espace: 2, volume: 2.5, long: true,
    dmg: [10, 16], vitesse: 640, sta: 9, allonge: 1, charge: 1.8, stagger: 0.35, crit: 0.06,
    dur: 90, bruit: 2, skill: 'force', reparation: 'metal',
    desc: 'Résonne comme une cloche à chaque impact. Pas discret. Presque indestructible.',
  },
  pied_de_biche: {
    nom: 'Pied-de-biche', type: 'arme', poids: 2.2, espace: 2, volume: 1.5, long: true,
    dmg: [11, 17], vitesse: 600, sta: 9, allonge: 1, charge: 1.9, stagger: 0.4, crit: 0.1,
    dur: 120, bruit: 1, skill: 'force', reparation: 'metal', usage: ['forcer'],
    desc: 'Ouvre les portes comme les crânes. L\'outil ultime de la fin du monde.',
  },
  pelle: {
    nom: 'Pelle', type: 'arme', poids: 2.0, espace: 3, volume: 10, long: true,
    dmg: [10, 16], vitesse: 720, sta: 11, allonge: 2, charge: 1.8, stagger: 0.4, crit: 0.06,
    dur: 80, bruit: 2, skill: 'force', deux_mains: true, reparation: 'bois', usage: ['creuser'],
    desc: 'La pelle du fossoyeur de Saint-Roch, le fer poli par des milliers de pelletées. Le tranchant sur la nuque, à bout de bras, et ils ne se relèvent plus.',
  },
  hache_pompier: {
    nom: 'Hache de pompier', type: 'arme', poids: 3.2, espace: 3, volume: 6, long: true,
    dmg: [18, 27], vitesse: 880, sta: 14, allonge: 1, charge: 2.2, stagger: 0.55, crit: 0.12,
    dur: 70, bruit: 1, skill: 'force', deux_mains: true, reparation: 'bois', usage: ['forcer', 'couper', 'abattre'],
    desc: 'Lourde, lente, définitive. Un seul bon coup suffit souvent.',
  },
  masse_chantier: {
    nom: 'Masse de fortune', type: 'arme', poids: 3.4, espace: 3, volume: 6, long: true,
    dmg: [16, 25], vitesse: 1000, sta: 16, allonge: 1, charge: 2.3, stagger: 0.7, crit: 0.08,
    dur: 55, bruit: 2, skill: 'force', deux_mains: true, reparation: 'bois', usage: ['marteler', 'forcer'],
    desc: 'Une brique scotchée au bout d\'un tuyau d\'acier. Chaque impact sonne comme un accident de chantier. Rien ne reste debout.',
  },

  // =========================== ARMES À FEU & TRAIT ===========================
  pistolet_9mm: {
    nom: 'Pistolet 9 mm', type: 'arme', poids: 0.9, espace: 1, volume: 0.6,
    dmg: [22, 34], vitesse: 450, sta: 3, allonge: 2, charge: 1, stagger: 0.5, crit: 0.2,
    dur: 200, bruit: 3, skill: 'visee', reparation: 'arme_feu', crosse: [4, 8],
    tir: { munition: 'munitions_9mm', capacite: 15, precision: 0.75, recharge: 1600, portee: 2 },
    desc: 'Le métal est froid et rassurant. Chaque coup de feu s\'entend de loin, et tous les morts du quartier viennent voir.',
  },
  fusil_chasse: {
    nom: 'Fusil de chasse', type: 'arme', poids: 3.4, espace: 3, volume: 8, long: true,
    dmg: [38, 56], vitesse: 900, sta: 4, allonge: 2, charge: 1, stagger: 0.9, crit: 0.25,
    dur: 150, bruit: 3, skill: 'visee', deux_mains: true, reparation: 'arme_feu', crosse: [6, 11],
    tir: { munition: 'cartouches', capacite: 2, precision: 0.88, recharge: 2600, portee: 1 },
    desc: 'Un superposé de chasseur de la Crau, crosse en noyer. À bout portant, il ne reste plus grand-chose au-dessus des épaules.',
  },
  fusil_assaut: {
    nom: 'Fusil d\'assaut', type: 'arme', poids: 3.6, espace: 3, volume: 8, long: true,
    dmg: [26, 36], vitesse: 350, sta: 3, allonge: 2, charge: 1, stagger: 0.6, crit: 0.2,
    dur: 250, bruit: 3, skill: 'visee', deux_mains: true, reparation: 'arme_feu', crosse: [6, 10],
    tir: { munition: 'munitions_556', capacite: 25, precision: 0.82, recharge: 2200, portee: 2 },
    desc: 'Arraché aux mains d\'un soldat de la 701 qui ne le lâchait pas. Chaque rafale réveille la moitié de la plaine.',
  },
  arbalete_fortune: {
    nom: 'Arbalète de fortune', type: 'arme', poids: 2.6, espace: 3, volume: 10, long: true,
    dmg: [22, 32], vitesse: 1200, sta: 5, allonge: 2, charge: 1, stagger: 0.5, crit: 0.25,
    dur: 30, bruit: 0, skill: 'visee', deux_mains: true, reparation: 'bois', crosse: [3, 6],
    tir: { munition: 'carreau_fortune', capacite: 1, precision: 0.7, recharge: 3200, portee: 2, recuperable: 0.6 },
    desc: 'Un arc de planche, des ressorts de sommier, un câble en guise de corde. Lente à armer, silencieuse comme la mort.',
  },

  // =========================== MUNITIONS ===========================
  munitions_9mm: {
    nom: 'Munitions 9 mm', type: 'munition', poids: 0.012, espace: 0, volume: 0.001,
    desc: 'Chaque balle est un choix.',
  },
  cartouches: {
    nom: 'Cartouches de calibre 12', type: 'munition', poids: 0.04, espace: 0, volume: 0.005,
    desc: 'De la chevrotine. Pour le gros gibier.',
  },
  munitions_556: {
    nom: 'Munitions 5,56 mm', type: 'munition', poids: 0.012, espace: 0, volume: 0.0015,
    desc: 'Des cartouches militaires en vrac, encore grasses d\'huile. Rares, bruyantes, décisives.',
  },
  carreau_fortune: {
    nom: 'Carreau de fortune', type: 'munition', poids: 0.06, espace: 0, volume: 0.05,
    desc: 'Du bois taillé, une vis limée en pointe. Ça part de travers, mais ça part sans bruit — et ça se ramasse.',
  },

  // =========================== LANCERS & LEURRES ===========================
  brique: {
    nom: 'Brique', type: 'jet', poids: 1.8, espace: 1, volume: 1.4,
    jet: { portee: 6, bruit: 6, dmg: [7, 13], stagger: 0.4, combat: true },
    desc: 'L\'arme la plus vieille du monde. Vise la tête — ou la vitrine d\'en face, pour qu\'ils regardent ailleurs.',
  },
  cocktail_molotov: {
    nom: 'Cocktail Molotov', type: 'jet', poids: 0.8, espace: 1, volume: 0.8,
    jet: { portee: 7, bruit: 8, dmg: [28, 40], feu: { ms: 4000, dps: 5, suivant: true }, lumiere: 5, duree_s: 60, combat: true },
    desc: 'Une bouteille d\'essence, un chiffon pour mèche. Lancé, il embrase le mort touché et ceux qui sont collés à lui. La chair brûlée pue pendant des heures.',
  },
  couteau_lancer: {
    nom: 'Couteau de lancer', type: 'jet', poids: 0.25, espace: 0, volume: 0.08,
    jet: { portee: 6, bruit: 0, dmg: [9, 15], crit: 0.2, recuperable: 0.7, combat: true },
    desc: 'Un éclat de verre lesté d\'un ressort, équilibré au scotch. Dans l\'œil ou dans le mur — question d\'entraînement.',
  },
  petards: {
    nom: 'Pétards', type: 'jet', poids: 0.1, espace: 0, volume: 0.05,
    jet: { portee: 8, bruit: 18, duree_s: 6, combat: false },
    desc: 'Un chapelet de pétards chinois oublié depuis le 14 Juillet. Six secondes de fusillade : tous les morts du quartier vont voir.',
  },
  fusee_detresse: {
    nom: 'Fusée de détresse', type: 'jet', poids: 0.3, espace: 1, volume: 0.3,
    jet: { portee: 10, bruit: 4, lumiere: 8, duree_s: 120, combat: false },
    desc: 'Une torche de signalisation rouge. Elle brûle deux minutes d\'une lumière de fin du monde, et les morts marchent vers elle comme des papillons.',
  },
  leurre_sonore: {
    nom: 'Réveil piégé', type: 'jet', poids: 0.3, espace: 1, volume: 0.4,
    jet: { portee: 8, bruit: 12, duree_s: 10, delai_s: 3, recuperable: 0.8, combat: false },
    desc: 'Un réveil à piles scotché en boule, sonnerie réglée sur trois secondes. Tu le lances, tu comptes, et tu passes pendant qu\'ils regardent ailleurs.',
  },

  // =========================== NOURRITURE ===========================
  conserve_haricots: {
    nom: 'Conserve de haricots', type: 'nourriture', poids: 0.45, espace: 1, volume: 0.45,
    kcal: 320, perissable: 24, soif: -2, besoinOuvre: true, rend: 'boite_vide',
    desc: 'Froids et gluants, mais c\'est de la vie en boîte.',
  },
  conserve_raviolis: {
    nom: 'Conserve de raviolis', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.45,
    kcal: 400, perissable: 24, besoinOuvre: true, rend: 'boite_vide',
    desc: 'La date de péremption a cessé d\'avoir un sens.',
  },
  conserve_thon: {
    nom: 'Boîte de thon', type: 'nourriture', poids: 0.2, espace: 0, volume: 0.15,
    kcal: 230, perissable: 24, soif: -3,
    desc: 'Une petite boîte à ouverture facile. L\'huile coule sur les doigts, et tu les lèches, sans honte.',
  },
  barre_cereales: {
    nom: 'Barre de céréales', type: 'nourriture', poids: 0.05, espace: 0, volume: 0.05,
    kcal: 100,
    desc: 'Sèche comme du plâtre. Des calories, rien de plus.',
  },
  chips: {
    nom: 'Paquet de chips', type: 'nourriture', poids: 0.15, espace: 1, volume: 1.2,
    kcal: 800, soif: -5,
    desc: 'Le bruit du sachet s\'entend à dix mètres.',
  },
  chocolat: {
    nom: 'Tablette de chocolat', type: 'nourriture', poids: 0.1, espace: 0, volume: 0.12,
    kcal: 540, fatigue: 3,
    desc: 'Blanchi par le temps. Un luxe d\'avant.',
  },
  biscuits: {
    nom: 'Paquet de biscuits', type: 'nourriture', poids: 0.3, espace: 1, volume: 0.5,
    kcal: 1400, soif: -3,
    desc: 'Émiettés, mais sucrés.',
  },
  pates_seches: {
    nom: 'Paquet de pâtes', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.8,
    kcal: 1750, cru: 0.3, soif: -4,
    desc: 'Cinq cents grammes de coquillettes. Crues, ça se croque et ça ne nourrit pas. Cuites, c\'est deux vrais repas.',
  },
  pates_cuites: {
    nom: 'Gamelle de pâtes', type: 'nourriture', poids: 0.4, espace: 1, volume: 0.6,
    kcal: 600, perissable: 12, soif: 4,
    desc: 'Des coquillettes trop cuites, sans sel, sans rien. Tu n\'as jamais rien mangé d\'aussi bon.',
  },
  compote: {
    nom: 'Gourde de compote', type: 'nourriture', poids: 0.1, espace: 0, volume: 0.1,
    kcal: 70, perissable: 24, soif: 6,
    desc: 'Pomme-banane, pour les goûters d\'enfants. Tu la presses jusqu\'à la dernière goutte.',
  },
  miel: {
    nom: 'Pot de miel de lavande', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.4,
    kcal: 1500,
    desc: 'Du miel de Provence, étiquette d\'un apiculteur de Lamanon. Il ne se périme jamais, et il soigne les plaies : les anciens le savaient.',
  },
  olives: {
    nom: 'Bocal d\'olives', type: 'nourriture', poids: 0.4, espace: 1, volume: 0.45,
    kcal: 450, soif: -4,
    desc: 'Des picholines en saumure. Salées à en pleurer, mais elles tiennent au corps.',
  },
  legumes: {
    nom: 'Légumes du potager', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.8,
    kcal: 180, perissable: 72, soif: 4,
    desc: 'Tomates fendues, courgettes tordues, une poignée de haricots verts. Ça a poussé dans ta terre : ça a un autre goût.',
  },
  fruits_sauvages: {
    nom: 'Fruits cueillis', type: 'nourriture', poids: 0.3, espace: 1, volume: 0.5,
    kcal: 150, perissable: 24, soif: 3,
    desc: 'Figues, mûres, quelques amandes dans leur coque. Le pays nourrit encore qui sait se baisser.',
  },
  confiture: {
    nom: 'Confiture de Nostradamus', type: 'nourriture', poids: 0.4, espace: 1, volume: 0.4,
    kcal: 1000, soif: 2,
    desc: 'Des fruits cuits dans le miel, selon une recette de 1555. Ça colle aux dents et ça redonne envie de vivre.',
  },
  tapenade: {
    nom: 'Tapenade maison', type: 'nourriture', poids: 0.25, espace: 1, volume: 0.2,
    kcal: 600, perissable: 48,
    desc: 'Olives écrasées à l\'huile, au couteau, dans un bol ébréché. Un goût de dimanche, d\'avant.',
  },
  croquettes: {
    nom: 'Sac de croquettes', type: 'nourriture', poids: 0.8, espace: 2, volume: 5,
    kcal: 2800, soif: -6,
    desc: '« Adulte, au poulet ». Tu te dis que c\'est pareil que des biscuits. Ça ne l\'est pas.',
  },
  ration_militaire: {
    nom: 'Ration de combat', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.6,
    kcal: 1200, perissable: 24, soif: 5, fatigue: 5,
    desc: 'Un repas complet sous vide avec son sachet chauffant. Bœuf-carottes, biscuits, café soluble. Un banquet.',
  },
  cafe_soluble: {
    nom: 'Café soluble', type: 'nourriture', poids: 0.1, espace: 0, volume: 0.15,
    kcal: 10, soif: -2, fatigue: 15,
    desc: 'Tu le manges à la cuillère, à sec, en grimaçant. Le cœur s\'emballe. Les paupières tiennent encore une heure.',
  },
  viande_crue: {
    nom: 'Viande crue', type: 'nourriture', poids: 0.6, espace: 1, volume: 0.6,
    kcal: 900, cru: 0.5, perissable: 6, risque: { type: 'intoxication', p: 0.55 },
    desc: 'Crue, elle te rendra probablement malade. Fais-la cuire.',
  },
  viande_cuite: {
    nom: 'Viande cuite', type: 'nourriture', poids: 0.5, espace: 1, volume: 0.5,
    kcal: 900, perissable: 12,
    desc: 'L\'odeur te fait saliver — et peut-être pas que toi.',
  },
  viande_fumee: {
    nom: 'Viande fumée', type: 'nourriture', poids: 0.35, espace: 1, volume: 0.35,
    kcal: 900,
    desc: 'Des lanières noircies au fumoir improvisé. Dure sous la dent, mais elle voyage et elle se garde.',
  },
  poisson_cru: {
    nom: 'Poisson cru', type: 'nourriture', poids: 0.4, espace: 1, volume: 0.5,
    kcal: 400, cru: 0.6, perissable: 6, risque: { type: 'intoxication', p: 0.4 },
    desc: 'Frais de l\'étang ou du canal. À cuire, sauf si tu aimes les parasites.',
  },
  poisson_cuit: {
    nom: 'Poisson cuit', type: 'nourriture', poids: 0.35, espace: 1, volume: 0.4,
    kcal: 400, perissable: 12,
    desc: 'Grillé sur un feu de fortune. Presque un bon souvenir.',
  },
  poisson_fume: {
    nom: 'Poisson fumé', type: 'nourriture', poids: 0.25, espace: 1, volume: 0.3,
    kcal: 450,
    desc: 'Fumé lentement sur des copeaux. Léger, nourrissant, et il se garde.',
  },
  ragout: {
    nom: 'Ragoût du survivant', type: 'nourriture', poids: 0.6, espace: 1, volume: 0.7,
    kcal: 900, perissable: 12, soif: 6, fatigue: 5,
    desc: 'Viande et haricots mijotés dans la même casserole. Le meilleur repas depuis la fin du monde.',
  },
  soupe_conserve: {
    nom: 'Soupe de conserves', type: 'nourriture', poids: 0.7, espace: 1, volume: 0.8,
    kcal: 500, perissable: 12, soif: 15,
    desc: 'Une boîte allongée d\'eau et bouillie. Chaud dans le ventre, ça vaut tous les discours.',
  },
  ragout_poisson: {
    nom: 'Bouillabaisse du pauvre', type: 'nourriture', poids: 0.6, espace: 1, volume: 0.7,
    kcal: 700, perissable: 12, soif: 12,
    desc: 'Deux poissons mijotés entiers dans leur bouillon, un filet d\'huile, des herbes. Marseille n\'est pas loin. Elle ne répond plus, mais elle n\'est pas loin.',
  },

  // =========================== BOISSONS ===========================
  bouteille_eau: {
    nom: 'Bouteille d\'eau', type: 'boisson', poids: 0.55, espace: 1, volume: 0.55,
    soif: 40, rend: 'bouteille_vide',
    desc: 'Claire. Propre. Précieuse.',
  },
  eau_croupie: {
    nom: 'Eau croupie', type: 'boisson', poids: 0.55, espace: 1, volume: 0.55,
    soif: 30, risque: { type: 'intoxication', p: 0.4 }, rend: 'bouteille_vide',
    desc: 'Trouble, avec des choses qui flottent. À faire bouillir, ou à filtrer.',
  },
  eau_purifiee: {
    nom: 'Eau bouillie', type: 'boisson', poids: 0.55, espace: 1, volume: 0.55,
    soif: 40, rend: 'bouteille_vide',
    desc: 'Un goût de casserole, mais elle ne te tuera pas.',
  },
  soda: {
    nom: 'Canette de soda', type: 'boisson', poids: 0.35, espace: 1, volume: 0.35,
    soif: 20, kcal: 140, rend: 'canette_vide',
    desc: 'Tiède et trop sucré. Le sucre, ça se respecte maintenant.',
  },
  jus_fruits: {
    nom: 'Brique de jus', type: 'boisson', poids: 0.3, espace: 1, volume: 0.3,
    soif: 25, kcal: 120,
    desc: 'Orange « sans sucres ajoutés ». La paille est encore collée sur le côté.',
  },
  alcool_fort: {
    nom: 'Bouteille d\'alcool fort', type: 'boisson', poids: 0.9, espace: 1, volume: 0.8,
    soif: -8, special: 'alcool', usage: ['desinfecter', 'combustible'],
    desc: 'Pastis, marc ou eau-de-vie. Désinfecte les plaies, calme la douleur, ou brûle les morts. Polyvalent.',
  },

  // =========================== CONTENANTS D'EAU ===========================
  gourde: {
    nom: 'Gourde', type: 'recipient', poids: 0.15, espace: 1, volume: 0.8,
    contenance: 1, recipient: 'ferme',
    desc: 'Un litre, bouchon à vis, mousqueton au col. Légère, étanche — l\'amie du marcheur, l\'assurance-vie du survivant.',
  },
  thermos: {
    nom: 'Thermos', type: 'recipient', poids: 0.35, espace: 1, volume: 0.6,
    contenance: 0.5, recipient: 'ferme',
    desc: 'Un demi-litre sous double paroi d\'acier brossé. Il sent encore le café d\'avant.',
  },
  bouteille_vide: {
    nom: 'Bouteille vide', type: 'recipient', poids: 0.1, espace: 1, volume: 0.55,
    contenance: 1.5, recipient: 'ferme',
    jet: { portee: 8, bruit: 9, combat: false },
    desc: 'À remplir — d\'eau ou de quelque chose qui brûle. Lancée au loin, elle éclate et ils vont voir.',
  },
  bidon_vide: {
    nom: 'Jerrican', type: 'recipient', poids: 0.6, espace: 2, volume: 10,
    contenance: 10, recipient: 'ferme',
    desc: 'Un jerrican de 10 litres, bouchon à baïonnette. Dix kilos d\'eau à ras bord — remplis-le à la mesure de ton dos.',
  },
  canette_vide: {
    nom: 'Canette vide', type: 'recipient', poids: 0.02, espace: 0, volume: 0.35,
    contenance: 0.25, recipient: 'ouvert',
    jet: { portee: 8, bruit: 5, recuperable: 1, combat: false },
    desc: 'Écrasée, rouillée. Accrochée à un fil, elle fait du bruit — lancée dans un couloir aussi.',
  },

  // =========================== SOINS ===========================
  bandage: {
    nom: 'Bandage stérile', type: 'soin', poids: 0.05, espace: 0, volume: 0.05, soin: 'bandage', qualite: 1,
    desc: 'Encore sous plastique. De l\'or blanc.',
  },
  bandage_fortune: {
    nom: 'Bandage de fortune', type: 'soin', poids: 0.05, espace: 0, volume: 0.08, soin: 'bandage', qualite: 0.5,
    desc: 'Des chiffons noués. Ça arrête le sang, pas les microbes.',
  },
  pansement_miel: {
    nom: 'Pansement au miel', type: 'soin', poids: 0.1, espace: 0, volume: 0.05, soin: 'bandage', qualite: 1, antiseptique: true,
    desc: 'Une compresse bouillie enduite de miel de lavande. Ça colle, ça attire les mouches, et ça empêche la plaie de pourrir mieux que bien des flacons.',
  },
  desinfectant: {
    nom: 'Désinfectant', type: 'soin', poids: 0.25, espace: 1, volume: 0.3, soin: 'desinfectant',
    desc: 'Ça pique à hurler. C\'est bon signe. Tient l\'infection à distance des heures durant — et, versé tout de suite sur une griffure, écarte le pire.',
  },
  lingette: {
    nom: 'Lingettes désinfectantes', type: 'soin', poids: 0.1, espace: 0, volume: 0.15, soin: 'desinfectant',
    desc: 'Un paquet à moitié plein. Ça nettoie vite et sans eau — une désinfection de terrain, le temps de souffler.',
  },
  savon: {
    nom: 'Savon de Marseille', type: 'soin', poids: 0.3, espace: 0, volume: 0.25, soin: 'nettoyer',
    desc: 'Un cube vert estampillé « Salon-de-Provence ». Laver une plaie à l\'eau et au savon : la base, depuis toujours. Le risque d\'infection est divisé par deux.',
  },
  antibiotiques: {
    nom: 'Antibiotiques', type: 'soin', poids: 0.05, espace: 0, volume: 0.03, soin: 'antibio',
    desc: 'Une boîte d\'amoxicilline entamée. La seule chose qui arrête une infection déjà installée. Contre le mal des morts, rien.',
  },
  antidouleur: {
    nom: 'Antidouleurs', type: 'soin', poids: 0.05, espace: 0, volume: 0.03, soin: 'antidouleur',
    desc: 'Le monde devient cotonneux pendant quelques heures.',
  },
  kit_suture: {
    nom: 'Kit de suture', type: 'soin', poids: 0.15, espace: 1, volume: 0.15, soin: 'suture',
    desc: 'Aiguille courbe et fil. Recoudre sa propre chair demande du cran. Ne se fait pas sur une morsure.',
  },
  attelle: {
    nom: 'Attelle', type: 'soin', poids: 0.4, espace: 1, volume: 1, soin: 'attelle',
    desc: 'Une planche fendue, des chiffons, du scotch. Ça immobilise un os cassé — du travail propre.',
  },
  vitamines: {
    nom: 'Vitamines', type: 'soin', poids: 0.05, espace: 0, volume: 0.05, soin: 'vitamines',
    desc: 'Mieux que rien quand on mange des chips depuis trois jours. Les maladies passent un peu plus vite.',
  },
  tisane_emperi: {
    nom: 'Tisane des Simples', type: 'soin', poids: 0.3, espace: 1, volume: 0.3, soin: 'tisane',
    desc: 'Sauge, thym et millepertuis infusés à la mode de Nostradamus. Quatre siècles plus tard, ça fait encore tomber la fièvre.',
  },
  onguent: {
    nom: 'Onguent aux herbes', type: 'soin', poids: 0.15, espace: 0, volume: 0.08, soin: 'onguent',
    desc: 'Huile d\'olive et plantes pilées. Sur une brûlure ou un bleu, la douleur recule et la peau se refait plus vite.',
  },
  charbon_actif: {
    nom: 'Charbon actif', type: 'soin', poids: 0.05, espace: 0, volume: 0.05, soin: 'charbon',
    desc: 'Des gélules noires. Le ventre qui se tord se calme en une demi-heure.',
  },

  // =========================== OUTILS ===========================
  ouvre_boite: {
    nom: 'Ouvre-boîte', type: 'outil', poids: 0.1, espace: 0, volume: 0.05, usage: ['ouvrir'],
    desc: 'Le plus important des objets, d\'après les survivants.',
  },
  briquet: {
    nom: 'Briquet', type: 'outil', poids: 0.02, espace: 0, volume: 0.02, usage: ['allumer'],
    desc: 'À moitié plein. Ou à moitié vide.',
  },
  allumettes: {
    nom: 'Boîte d\'allumettes', type: 'outil', poids: 0.02, espace: 0, volume: 0.02, usage: ['allumer'],
    desc: 'Une vingtaine. Garde-les au sec.',
  },
  lampe_torche: {
    nom: 'Lampe torche', type: 'outil', poids: 0.3, espace: 1, volume: 0.3, usage: ['lumiere'], carburant: 'piles',
    desc: 'Un cône de lumière dans le noir — et tout ce que la lumière attire. Elle occupe une main : il n\'en reste qu\'une pour l\'arme. Une paire de piles tient environ dix heures.',
  },
  lampe_frontale: {
    nom: 'Lampe frontale', type: 'outil', poids: 0.15, espace: 0, volume: 0.2, usage: ['lumiere'], carburant: 'piles',
    desc: 'L\'élastique est distendu mais la LED est vaillante. Les deux mains libres dans le noir — un luxe inestimable.',
  },
  lampe_frontale_fortune: {
    nom: 'Frontale de fortune', type: 'outil', poids: 0.35, espace: 1, volume: 0.4, usage: ['lumiere'], carburant: 'piles',
    desc: 'Une lampe torche scotchée sur le côté d\'un bonnet. Le faisceau est de travers, tu as l\'air d\'un mineur ivre, et tes deux mains sont libres.',
  },
  lampe_huile: {
    nom: 'Lampe à huile', type: 'outil', poids: 0.4, espace: 1, volume: 1.2, usage: ['lumiere'], carburant: 'huile_olive',
    desc: 'Une boîte de conserve, une mèche de chiffon, un fond d\'huile d\'olive. Une lumière de crèche, douce et courte. Pas de piles, jamais.',
  },
  torche: {
    nom: 'Torche', type: 'outil', poids: 0.6, espace: 1, volume: 1, usage: ['lumiere', 'allumer'],
    desc: 'Des chiffons serrés au bout d\'un manche. Deux heures et demie d\'une lumière qui danse — et qui dit à tout le quartier où tu es.',
  },
  piles: {
    nom: 'Piles', type: 'outil', poids: 0.05, espace: 0, volume: 0.02,
    desc: 'Une paire. Encore du jus dedans. Lampes et radio en mangent : garde-en en réserve.',
  },
  casserole: {
    nom: 'Casserole', type: 'outil', poids: 0.7, espace: 2, volume: 3, usage: ['cuisson'],
    melee: { dmg: [3, 6], vitesse: 480, sta: 6, allonge: 0, charge: 1.5, stagger: 0.25, crit: 0.04, skill: 'force', bruit: 2 },
    contenance: 1.5, recipient: 'ouvert',
    desc: 'Pour faire bouillir l\'eau ou cuire ce que tu attrapes. En dernier recours, elle assomme.',
  },
  rechaud_camping: {
    nom: 'Réchaud de camping', type: 'outil', poids: 1.1, espace: 2, volume: 2, usage: ['cuisson'], carburant: 'cartouche_gaz',
    desc: 'Avec une cartouche de gaz, un vrai feu qu\'on transporte : on cuisine partout, sans fumée, sans bois.',
  },
  cartouche_gaz: {
    nom: 'Cartouche de gaz', type: 'outil', poids: 0.4, espace: 1, volume: 0.45,
    desc: 'Secoue-la : il en reste. Trois heures de flamme bleue.',
  },
  pince_coupante: {
    nom: 'Pince coupante', type: 'outil', poids: 0.8, espace: 1, volume: 0.3, usage: ['couper_chaine'],
    desc: 'Coupe chaînes et cadenas. La clé universelle.',
  },
  trousse_outils: {
    nom: 'Trousse à outils', type: 'outil', poids: 2.5, espace: 3, volume: 7, usage: ['visser', 'marteler', 'affuter'],
    desc: 'Clés, pinces, douilles, une lime : tout le nécessaire du mécanicien.',
  },
  pierre_aiguiser: {
    nom: 'Pierre à aiguiser', type: 'outil', poids: 0.2, espace: 0, volume: 0.1, usage: ['affuter'],
    desc: 'Une pierre à faux usée en creux par des années de lames. Un peu d\'eau, de la patience, et le fil revient.',
  },
  trousse_couture: {
    nom: 'Trousse de couture', type: 'outil', poids: 0.1, espace: 0, volume: 0.15, usage: ['coudre'],
    desc: 'Le petit nécessaire des chambres d\'hôtel : aiguilles, fil blanc, fil noir, deux boutons. Pour les ourlets — ou pour la peau.',
  },
  crochets_serrure: {
    nom: 'Crochets de serrurier', type: 'outil', poids: 0.05, espace: 0, volume: 0.02, usage: ['crocheter'],
    desc: 'Du fil de fer aplati et tordu, patiemment. Les serrures s\'ouvrent sans un bruit, pour qui a les doigts et le temps.',
  },
  tuyau_plastique: {
    nom: 'Tuyau en plastique', type: 'outil', poids: 0.3, espace: 1, volume: 1, usage: ['siphon'],
    desc: 'Un mètre de tuyau souple. Pour siphonner les réservoirs — le goût de l\'essence reste deux jours.',
  },
  canne_peche: {
    nom: 'Canne à pêche', type: 'outil', poids: 0.8, espace: 2, volume: 3, long: true, usage: ['peche'],
    desc: 'Le fil est encore bon. Les étangs et le canal regorgent de poissons que plus personne ne pêche.',
  },
  nasse: {
    nom: 'Nasse', type: 'outil', poids: 0.6, espace: 2, volume: 8, usage: ['peche'],
    desc: 'Deux bouteilles emboîtées en entonnoir, armées de fil de fer. Posée près de la berge, elle piège ce que ta ligne rate.',
  },
  collet: {
    nom: 'Collet', type: 'outil', poids: 0.2, espace: 1, volume: 0.1, usage: ['piege'],
    desc: 'Un nœud coulant en fil de fer. À poser près des terriers.',
  },
  corde: {
    nom: 'Corde', type: 'materiau', poids: 0.8, espace: 1, volume: 1.5, usage: ['escalade'],
    desc: 'Dix mètres de corde solide. Mille usages.',
  },
  piege_sonore: {
    nom: 'Piège sonore', type: 'outil', poids: 0.4, espace: 1, volume: 0.5, usage: ['alarme'],
    desc: 'Bouteilles, clous et fil de fer tendus en travers d\'un passage. Si quelque chose approche pendant ton sommeil, tu le sauras.',
  },
  filtre_fortune: {
    nom: 'Filtre de fortune', type: 'outil', poids: 0.2, espace: 1, volume: 0.6, usage: ['filtrer'],
    desc: 'Une bouteille coupée, bourrée de chiffon et gainée de plastique. L\'eau ressort claire — sans feu, sans bruit.',
  },
  jumelles: {
    nom: 'Jumelles', type: 'outil', poids: 0.6, espace: 1, volume: 0.7, usage: ['observer'],
    desc: 'Des 10×50 de chasseur. Avant de partir, tu balaies la route : ce que tu vois de loin ne te surprend pas de près.',
  },
  // Les radios sont LOURDES et ENCOMBRANTES (encombrant : ni sac ni dos, on les porte à deux mains, ou on les pose au
  // camp — posées tout près, elles parlent encore). Elles annoncent ce qui vient : sirènes, hordes, orages (js/game/radio.js).
  radio_portable: {
    nom: 'Poste radio', type: 'outil', poids: 3.2, espace: 3, volume: 9, usage: ['radio'], carburant: 'piles', radio: 'piles',
    encombrant: true, deux_mains: true,
    desc: 'Un gros poste de chantier à antenne télescopique, poignée de métal, haut-parleur grillagé. Il mange des piles, il pèse comme une pierre — et il entend l’armée, Calès, les bulletins. Ça se porte à deux mains.',
  },
  radio_manivelle: {
    nom: 'Radio à manivelle (bricolée)', type: 'outil', poids: 2.4, espace: 3, volume: 7, usage: ['radio'], radio: 'manivelle',
    encombrant: true, deux_mains: true,
    desc: 'Une boîte de conserve, le mécanisme d’un réveil en guise de dynamo, une bobine de cuivre et le haut-parleur d’un téléphone. Trente tours de manivelle pour deux minutes de voix. Pas besoin de piles. À deux mains, et c’est fragile.',
  },
  kit_nettoyage: {
    nom: 'Kit de nettoyage d\'arme', type: 'outil', poids: 0.3, espace: 1, volume: 0.3, usage: ['entretien_arme'],
    desc: 'Écouvillons, huile, chiffons dans une trousse de toile. Une arme à feu entretenue ne s\'enraye pas.',
  },

  // =========================== LIVRES (apprennent des recettes) ===========================
  manuel_bricolage: {
    nom: 'Manuel du bricoleur', type: 'livre', poids: 0.6, espace: 1, volume: 1, lecture: 30, xp: { construction: 30 },
    desc: '« Tout faire soi-même », édition 1987, cornée aux chapitres « assemblages » et « charpente ». Les dessins sont clairs. Les usages que tu en feras, moins.',
  },
  guide_survie: {
    nom: 'Guide de survie', type: 'livre', poids: 0.4, espace: 1, volume: 0.6, lecture: 30, xp: { chasse: 15, construction: 10, recherche: 15 },
    desc: 'Un guide de randonneur fanfaron, « survivre en milieu hostile ». Écrit pour les Cévennes, pas pour ça. Mais les nœuds sont les mêmes.',
  },
  precis_secourisme: {
    nom: 'Précis de secourisme', type: 'livre', poids: 0.4, espace: 1, volume: 0.6, lecture: 30, xp: { medecine: 30 },
    desc: 'Le manuel des sapeurs-pompiers, stabilo jaune partout. Plaies, garrots, fractures. Personne ne viendra : c\'est toi, les secours.',
  },
  carnet_chasseur: {
    nom: 'Carnet d\'un chasseur de la Crau', type: 'livre', poids: 0.2, espace: 0, volume: 0.15, lecture: 30, xp: { chasse: 30 },
    desc: 'Un carnet à spirale, écriture serrée : où passent les lapins, comment poser un collet, comment fumer la viande. Signé d\'un prénom et d\'une date de 1994.',
  },
  revue_mecanique: {
    nom: 'Revue technique', type: 'livre', poids: 0.5, espace: 1, volume: 0.5, lecture: 30, xp: { mecanique: 30 },
    desc: 'Une revue technique automobile tachée de cambouis. Tout ce qui s\'ouvre avec un tournevis, expliqué pas à pas.',
  },
  cuisine_provencale: {
    nom: 'La Cuisinière provençale', type: 'livre', poids: 0.7, espace: 1, volume: 1.2, lecture: 30, xp: { chasse: 20 },
    desc: 'Le Reboul, bible des grands-mères de Marseille à Salon. Mille recettes d\'avant. Quelques-unes marchent encore avec ce qu\'on trouve.',
  },
  traite_confitures: {
    nom: 'Traité des confitures', type: 'livre', poids: 0.3, espace: 0, volume: 0.4, lecture: 30, xp: { medecine: 15, chasse: 10 },
    desc: 'Un fac-similé de l\'« Excellent et moult utile opuscule » de Nostradamus, 1555 : fards, confitures, remèdes. Le prophète était apothicaire. Ses recettes, elles, ne mentent pas.',
  },
  plans_arbalete: {
    nom: 'Plans griffonnés', type: 'livre', poids: 0.05, espace: 0, volume: 0.02, lecture: 15, xp: { construction: 10 },
    desc: 'Trois feuilles quadrillées, un croquis d\'arbalète coté au crayon, des flèches, des ratures. En bas : « ça marche. Pas de bruit. »',
  },

  // =========================== MATÉRIAUX ===========================
  chiffon: {
    nom: 'Chiffon', type: 'materiau', poids: 0.1, espace: 0, volume: 0.1,
    desc: 'Du tissu déchiré. Bandage, mèche, filtre.',
  },
  drap: {
    nom: 'Drap', type: 'materiau', poids: 0.5, espace: 1, volume: 2,
    desc: 'Un drap de lit roulé en boule. Déchiré en bandes, il fait quatre chiffons propres.',
  },
  planche: {
    nom: 'Planche', type: 'materiau', poids: 1.8, espace: 2, volume: 6, long: true,
    melee: { dmg: [5, 9], vitesse: 640, sta: 8, allonge: 1, charge: 1.6, stagger: 0.3, crit: 0.05, skill: 'force', bruit: 1 },
    desc: 'Du bois brut. Pour barricader, construire, ou faire du feu.',
  },
  clous: {
    nom: 'Clous', type: 'materiau', poids: 0.05, espace: 0, volume: 0.05,
    desc: 'Une poignée de clous rouillés.',
  },
  scotch: {
    nom: 'Rouleau de scotch', type: 'materiau', poids: 0.2, espace: 0, volume: 0.2,
    desc: 'La civilisation tenait avec ça, en vrai.',
  },
  fil_de_fer: {
    nom: 'Fil de fer', type: 'materiau', poids: 0.2, espace: 0, volume: 0.2,
    desc: 'Souple et solide. Collets, ligatures, réparations.',
  },
  eclat_verre: {
    nom: 'Éclat de verre', type: 'materiau', poids: 0.2, espace: 0, volume: 0.05, usage: ['couper'],
    desc: 'Long comme la main, coupant comme un rasoir.',
  },
  // --- Ce que donne la nature (recherche au sol, arbres abattus, buissons) ---
  buche: {
    nom: 'Bûche', type: 'materiau', poids: 6, espace: 3, volume: 12, long: true, usage: ['combustible'],
    desc: 'Un tronçon de tronc fendu à la hache, encore humide de sève. Trois heures de feu, ou deux planches avec une scie.',
  },
  branche: {
    nom: 'Branche', type: 'materiau', poids: 0.7, espace: 2, volume: 3, long: true, usage: ['combustible'],
    melee: { dmg: [3, 6], vitesse: 560, sta: 6, allonge: 1, charge: 1.4, stagger: 0.2, crit: 0.03, skill: 'force', bruit: 0 },
    desc: 'Une branche droite, longue comme un bras. Du petit bois, une clôture, un manche de lance.',
  },
  brindilles: {
    nom: 'Brindilles', type: 'materiau', poids: 0.15, espace: 0, volume: 0.8, usage: ['combustible'],
    desc: 'Du bois mort sec, cassé menu. Ça prend au premier coup de briquet.',
  },
  pierre: {
    nom: 'Pierre', type: 'jet', poids: 0.9, espace: 1, volume: 0.5,
    jet: { portee: 7, bruit: 5, dmg: [4, 8], stagger: 0.25, combat: true, recuperable: 0.9 },
    desc: 'Un caillou de la Crau, lisse et lourd. Ça se lance, ça cale, ça monte un muret.',
  },
  fibres: {
    nom: 'Fibres végétales', type: 'materiau', poids: 0.1, espace: 0, volume: 0.4,
    desc: 'De l\'herbe sèche et des tiges d\'ortie, battues et effilées. Tressées, elles font une ficelle qui tient.',
  },
  cannes: {
    nom: 'Cannes de Provence', type: 'materiau', poids: 0.5, espace: 2, volume: 3, long: true,
    desc: 'Des roseaux géants coupés au bord d\'un fossé, droits et creux. Une palissade, une lance légère, des tuteurs.',
  },
  mures: {
    nom: 'Mûres', type: 'nourriture', poids: 0.15, espace: 0, volume: 0.25,
    kcal: 65, perissable: 18, soif: 2,
    desc: 'Une poignée de mûres noires cueillies dans les ronces. Les doigts violets, les avant-bras griffés : ça valait le coup.',
  },
  figues: {
    nom: 'Figues', type: 'nourriture', poids: 0.25, espace: 1, volume: 0.35,
    kcal: 180, perissable: 30, soif: 2,
    desc: 'Des figues violettes, éclatées par le soleil de septembre. Personne n\'est venu les ramasser cette année.',
  },
  amandes: {
    nom: 'Amandes', type: 'nourriture', poids: 0.12, espace: 0, volume: 0.15,
    kcal: 300,
    desc: 'Des amandes tombées sous l\'amandier, dans leur coque dure. Ça se garde des mois.',
  },
  champignons: {
    nom: 'Champignons', type: 'nourriture', poids: 0.2, espace: 1, volume: 0.4,
    kcal: 40, cru: 0.5, perissable: 20, risque: { type: 'intoxication', p: 0.18 },
    desc: 'Des champignons de garrigue sortis après la pluie. Presque sûr que ce sont des bons. Presque.',
  },
  escargots: {
    nom: 'Escargots', type: 'nourriture', poids: 0.2, espace: 1, volume: 0.3,
    kcal: 90, cru: 0.2, perissable: 48, risque: { type: 'intoxication', p: 0.5 },
    desc: 'Des petits-gris ramassés sous les pierres humides. Cuits à la poêle avec un peu d\'ail, c\'est un repas de fête.',
  },
  pignons: {
    nom: 'Pignons de pin', type: 'nourriture', poids: 0.08, espace: 0, volume: 0.1,
    kcal: 190,
    desc: 'Sortis un à un des pommes de pin, à la pointe du couteau. Long à récolter, mais ça nourrit.',
  },
  ferraille: {
    nom: 'Ferraille', type: 'materiau', poids: 0.8, espace: 1, volume: 0.8,
    desc: 'Un bout de cornière, une tôle tordue, des boulons rouillés. Le fer ne se perd jamais tout à fait.',
  },
  sac_sable: {
    nom: 'Sac de terre', type: 'materiau', poids: 12, espace: 4, volume: 18,
    desc: 'Un sac plastique bourré de terre et noué serré. Empilés, ils arrêtent les morts et les balles.',
  },
  scie: {
    nom: 'Scie égoïne', type: 'outil', poids: 0.7, espace: 2, volume: 1.5, long: true, usage: ['scier', 'couper'],
    desc: 'Une scie de menuisier aux dents encore vives. Une bûche devient des planches, un meuble devient du bois.',
  },
  manche_balai: {
    nom: 'Manche à balai', type: 'materiau', poids: 0.5, espace: 2, volume: 1.5, long: true,
    melee: { dmg: [3, 6], vitesse: 520, sta: 6, allonge: 2, charge: 1.4, stagger: 0.15, crit: 0.04, skill: 'dexterite', bruit: 0 },
    desc: 'Un bon manche en bois dur.',
  },
  bache_plastique: {
    nom: 'Bâche plastique', type: 'materiau', poids: 0.6, espace: 1, volume: 2.5,
    desc: 'Une bâche de chantier raide de poussière. Toit, sol, linceul — au choix.',
  },
  sac_plastique: {
    nom: 'Sac plastique', type: 'materiau', poids: 0.01, espace: 0, volume: 0.02,
    desc: 'Il en traîne partout, comme avant. Garde l\'eau dehors — ou dedans.',
  },
  journal_papier: {
    nom: 'Vieux journaux', type: 'materiau', poids: 0.1, espace: 0, volume: 0.4,
    desc: '« L\'ÉTAT D\'URGENCE DÉCRÉTÉ DANS LES BOUCHES-DU-RHÔNE ». Bon pour allumer un feu.',
  },
  cable_electrique: {
    nom: 'Câble électrique', type: 'materiau', poids: 0.3, espace: 1, volume: 0.5,
    desc: 'Deux mètres de câble arraché d\'un mur. Sous la gaine, du bon fil de cuivre.',
  },
  ressort: {
    nom: 'Ressort', type: 'materiau', poids: 0.1, espace: 0, volume: 0.05,
    desc: 'Arraché d\'un sommier ou d\'une carcasse de voiture. Un jour, ça servira.',
  },
  visserie: {
    nom: 'Vis et boulons', type: 'materiau', poids: 0.1, espace: 0, volume: 0.05,
    desc: 'Une poignée de quincaillerie dépareillée au fond d\'une boîte de conserve.',
  },
  telephone_mort: {
    nom: 'Téléphone mort', type: 'materiau', poids: 0.15, espace: 0, volume: 0.08,
    desc: 'Écran fendu, batterie à plat depuis des semaines. Le dernier SMS restera non lu.',
  },
  batterie_telephone: {
    nom: 'Batterie de téléphone', type: 'materiau', poids: 0.05, espace: 0, volume: 0.02,
    desc: 'Un rectangle plat sorti d\'un téléphone mort. Il reste du jus dans les cellules : deux, pontées au scotch, font tourner une lampe.',
  },
  reveil: {
    nom: 'Réveil à piles', type: 'materiau', poids: 0.25, espace: 1, volume: 0.4,
    desc: 'Un réveil de chevet en plastique, sonnerie stridente. Avant, il faisait lever les gens. Maintenant, il fait lever les morts.',
  },
  boite_vide: {
    nom: 'Boîte de conserve vide', type: 'materiau', poids: 0.05, espace: 0, volume: 0.45,
    desc: 'Rincée, le couvercle replié. Elle peut servir de bougeoir, de piège sonore ou de lampe à huile.',
  },
  graines: {
    nom: 'Sachet de graines', type: 'materiau', poids: 0.02, espace: 0, volume: 0.02,
    desc: 'Tomates, courgettes, haricots : un sachet de jardinerie, la date limite dépassée de deux ans. Ça germera quand même. Il faut un potager.',
  },
  herbes_simples: {
    nom: 'Herbes médicinales', type: 'materiau', poids: 0.05, espace: 0, volume: 0.1,
    desc: 'Sauge, thym, millepertuis — cueillis au jardin des Simples de l\'Empéri ou dans la garrigue. Les vieux remèdes n\'ont pas de date de péremption.',
  },
  huile_olive: {
    nom: 'Bouteille d\'huile d\'olive', type: 'materiau', poids: 0.8, espace: 1, volume: 1.1, usage: ['combustible'],
    desc: 'Un litre d\'huile de la vallée des Baux. Pour cuisiner, soigner, ou brûler dans une lampe : cinq heures de lumière par fond de bouteille.',
  },
  essence: {
    nom: 'Bouteille d\'essence', type: 'materiau', poids: 0.8, espace: 1, volume: 1.1, usage: ['combustible'],
    desc: 'Un litre de sans-plomb siphonné, dans une bouteille d\'eau minérale. Ne pas confondre.',
  },
  escargots_grilles: {
    nom: 'Escargots grillés', type: 'nourriture', poids: 0.2, espace: 1, volume: 0.3,
    kcal: 180, perissable: 10,
    desc: 'Grillés dans leur coquille au bord des braises jusqu\'à ce qu\'ils cessent de mousser. Un peu de sel aurait été parfait.',
  },
  champignons_poeles: {
    nom: 'Champignons poêlés', type: 'nourriture', poids: 0.2, espace: 1, volume: 0.4,
    kcal: 120, perissable: 8, risque: { type: 'intoxication', p: 0.05 },
    desc: 'Revenus longtemps, jusqu\'à ce qu\'ils rendent leur eau. La cuisson ne sauve pas d\'un mauvais champignon, mais elle aide.',
  },
  soupe_sauvage: {
    nom: 'Soupe des collines', type: 'nourriture', poids: 0.7, espace: 1, volume: 0.8,
    kcal: 260, perissable: 10, soif: 20,
    desc: 'Des herbes, ce qu\'on a trouvé sous les pins, de l\'eau bouillie longtemps. Ça ne tient pas au ventre, mais ça réchauffe et ça désaltère.',
  },
  appat: {
    nom: 'Appâts', type: 'materiau', poids: 0.1, espace: 0, volume: 0.1,
    desc: 'Des vers gras déterrés sous une pierre.',
  },

  // =========================== DÉCHETS & SOUVENIRS ===========================
  portefeuille: {
    nom: 'Portefeuille', type: 'lore', poids: 0.1, espace: 0, volume: 0.1,
    desc: 'Cartes bleues, billets, photos de famille. Tout ce qui valait quelque chose ne vaut plus rien.',
  },
  carte_routiere: {
    nom: 'Carte routière', type: 'lore', poids: 0.15, espace: 0, volume: 0.15,
    desc: 'Une carte Michelin des Bouches-du-Rhône, pliée à l’envers, le coin mangé par le soleil d’une plage arrière. Les villages autour de Salon, les routes, l’étang de Berre, la Durance au nord. Avec elle, le pays salonais n’est plus une page blanche.',
  },
  photo_famille: {
    nom: 'Photo de famille', type: 'lore', poids: 0, espace: 0, volume: 0.001,
    desc: 'Des inconnus qui sourient sur une plage. Tu la gardes quand même.',
  },
};

// Les familles de réparation et les catégories d'objets (pour les validateurs et l'interface).
export const TYPES_OBJET = ['arme', 'munition', 'jet', 'nourriture', 'boisson', 'soin', 'outil', 'materiau', 'recipient', 'livre', 'lore', 'quete'];
export const FAMILLES_REPARATION = ['lame', 'bois', 'metal', 'arme_feu'];

export function item(id) { return ITEMS[id] || null; }
