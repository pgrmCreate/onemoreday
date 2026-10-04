// ============================================================================
//  CONSTRUCTION — ce qu'on peut bâtir sur une carte (façon Project Zomboid). Règles : docs/GAMEPLAY.md §Construction.
// ============================================================================
// On choisit une construction (panneau Fabrication → Construire), on la place sur la grille (fantôme vert / rouge,
// rotation), puis on bâtit en temps réel : il faut rester sur place, ça fait du bruit (les morts entendent le marteau).
// Les constructions vivent dans la simulation du lieu (l'hôte en co-op) et restent dans la sauvegarde.
//
// Champs :
//   nom, cat ('murs' | 'defense' | 'mobilier' | 'survie'), desc
//   t [w, h]       cases occupées (rotation : w ↔ h)
//   pose           'sol' (case libre, défaut) | 'fenetre' (sur une fenêtre)
//   bloque, opaque bloque le passage / la vue
//   pv             points de vie : les morts cognent dessus quand elle leur barre la route (cassable)
//   ingredients    [{ id, qty }] consommés à la fin ; outils [tags] ; skill { competence: niveau } ; tempsMin ; xp
//   rendu          moitié des planches et des clous rendus quand on démonte (arrondi en dessous)
//   dessin         clé de js/rendu/objets.js (DESSINS)
//   Fonctions : porte (s'ouvre / se ferme), contenance (litres : caisse de rangement), poste ('etabli' | 'feu'),
//   lit (on y dort), feu { minutes } (lumière, chaleur, cuisine ; on remet du bois), eau { cap } (récupérateur : se remplit
//   quand il pleut), potager { jours, recolte } (on plante des graines), piege { degats } (les morts s'y empalent).
export const CONSTRUCTIONS = {
  // ─────────── Murs et clôtures ───────────
  mur_planches: {
    nom: 'Mur de planches', cat: 'murs', t: [1, 1], bloque: 1, opaque: 1, pv: 150, dessin: 'mur_planches',
    ingredients: [{ id: 'planche', qty: 3 }, { id: 'clous', qty: 6 }], outils: ['marteler'], skill: null, tempsMin: 30, xp: { construction: 6 },
    desc: 'Trois planches clouées sur deux traverses. Ça ne tient pas un siège, mais ça ferme un passage.',
  },
  mur_renforce: {
    nom: 'Mur renforcé', cat: 'murs', t: [1, 1], bloque: 1, opaque: 1, pv: 340, dessin: 'mur_renforce',
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 10 }, { id: 'fil_de_fer', qty: 1 }], outils: ['marteler'],
    skill: { construction: 2 }, tempsMin: 50, xp: { construction: 10 },
    desc: 'Double épaisseur, croisillons, fil de fer serré. Il faudra plusieurs morts et beaucoup de temps pour en venir à bout.',
  },
  palissade: {
    nom: 'Palissade', cat: 'murs', t: [1, 1], bloque: 1, opaque: 0, pv: 110, dessin: 'palissade',
    ingredients: [{ id: 'planche', qty: 2 }, { id: 'clous', qty: 4 }], outils: ['marteler'], skill: null, tempsMin: 20, xp: { construction: 4 },
    desc: 'Des piquets pointus plantés serrés. On voit à travers, on ne passe pas.',
  },
  porte_planches: {
    nom: 'Porte en planches', cat: 'murs', t: [1, 1], bloque: 1, opaque: 1, pv: 140, porte: true, dessin: 'porte_planches',
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 8 }, { id: 'visserie', qty: 1 }], outils: ['marteler'],
    skill: { construction: 1 }, tempsMin: 40, xp: { construction: 8 },
    desc: 'Un battant cloué sur deux gonds de récupération. Pour entrer chez soi sans démonter le mur.',
  },
  barricade_fenetre: {
    nom: 'Barricader une fenêtre', cat: 'defense', t: [1, 1], pose: 'fenetre', bloque: 1, opaque: 1, pv: 160, dessin: 'barricade_fenetre',
    ingredients: [{ id: 'planche', qty: 2 }, { id: 'clous', qty: 4 }], outils: ['marteler'], skill: null, tempsMin: 15, xp: { construction: 5 },
    desc: 'Deux planches en croix sur le cadre. Plus personne ne voit dedans, plus rien n\'entre par là.',
  },
  pieux: {
    nom: 'Pieux', cat: 'defense', t: [1, 1], bloque: 0, opaque: 0, pv: 6, piege: { degats: 14 }, dessin: 'pieux',
    ingredients: [{ id: 'planche', qty: 2 }], outils: ['couper'], skill: { construction: 1 }, tempsMin: 20, xp: { construction: 5 },
    desc: 'Des pieux taillés en biseau, plantés de travers. Les morts ne regardent pas où ils marchent.',
  },
  mur_rondins: {
    nom: 'Mur de rondins', cat: 'murs', t: [1, 1], bloque: 1, opaque: 1, pv: 300, dessin: 'mur_rondins',
    ingredients: [{ id: 'buche', qty: 2 }, { id: 'clous', qty: 4 }], outils: ['marteler'], skill: { construction: 1 }, tempsMin: 45, xp: { construction: 9 },
    desc: 'Deux bûches couchées l\'une sur l\'autre, calées et clouées à des pieux. Lourd à monter, presque impossible à défoncer.',
  },
  cloture_branches: {
    nom: 'Clôture de branches', cat: 'murs', t: [1, 1], bloque: 1, opaque: 0, pv: 55, dessin: 'cloture_branches',
    ingredients: [{ id: 'branche', qty: 4 }, { id: 'fibres', qty: 2 }], outils: [], skill: null, tempsMin: 20, xp: { construction: 3 },
    desc: 'Des branches entrecroisées et liées de fibres, comme une haie morte. Ça ralentit plus que ça n\'arrête.',
  },
  palissade_cannes: {
    nom: 'Palissade de cannes', cat: 'murs', t: [1, 1], bloque: 1, opaque: 1, pv: 70, dessin: 'palissade_cannes',
    ingredients: [{ id: 'cannes', qty: 5 }, { id: 'fil_de_fer', qty: 1 }], outils: [], skill: null, tempsMin: 20, xp: { construction: 3 },
    desc: 'Des cannes de Provence serrées et ligaturées, comme les brise-vent des maraîchers. On ne voit plus à travers.',
  },
  mur_sacs: {
    nom: 'Mur de sacs de terre', cat: 'murs', t: [1, 1], bloque: 1, opaque: 0, pv: 420, dessin: 'mur_sacs',
    ingredients: [{ id: 'sac_sable', qty: 3 }], outils: [], skill: null, tempsMin: 25, xp: { construction: 4, force: 3 },
    desc: 'Trois sacs de terre empilés en quinconce, à hauteur de poitrine. On tire par-dessus ; eux, ils cognent dans le vide.',
  },
  muret_pierres: {
    nom: 'Muret de pierres sèches', cat: 'murs', t: [1, 1], bloque: 1, opaque: 0, pv: 380, dessin: 'muret_pierres',
    ingredients: [{ id: 'pierre', qty: 8 }], outils: [], skill: { construction: 1 }, tempsMin: 50, xp: { construction: 8 },
    desc: 'Les pierres de la Crau, ajustées sans mortier comme les bergers le font depuis deux mille ans. Rien ne le fait tomber.',
  },
  portail_bois: {
    nom: 'Portail en bois', cat: 'murs', t: [2, 1], bloque: 1, opaque: 1, pv: 180, porte: true, dessin: 'portail_bois',
    ingredients: [{ id: 'planche', qty: 6 }, { id: 'clous', qty: 10 }, { id: 'visserie', qty: 2 }], outils: ['marteler'],
    skill: { construction: 2 }, tempsMin: 60, xp: { construction: 12 },
    desc: 'Deux battants larges et un loquet. Assez grand pour passer à deux — ou avec un caddie plein.',
  },
  // ─────────── Défense et pièges ───────────
  barbeles: {
    nom: 'Barbelés', cat: 'defense', t: [1, 1], bloque: 0, opaque: 0, pv: 30, piege: { degats: 4, empetre: 1600, vacille: 400 }, dessin: 'barbeles',
    ingredients: [{ id: 'fil_de_fer', qty: 3 }, { id: 'branche', qty: 2 }], outils: [], skill: null, tempsMin: 25, xp: { construction: 5 },
    desc: 'Du fil de fer tordu en boucles entre deux piquets. Les morts s\'y prennent les jambes et restent plantés là, à tirer.',
  },
  alarme_conserves: {
    nom: 'Alarme de boîtes', cat: 'defense', t: [1, 1], bloque: 0, opaque: 0, pv: 12, piege: { alarme: 14, usure: 0.5 }, dessin: 'alarme_conserves',
    ingredients: [{ id: 'canette_vide', qty: 4 }, { id: 'fil_de_fer', qty: 1 }], outils: [], skill: null, tempsMin: 10, xp: { construction: 2 },
    desc: 'Un fil tendu à hauteur de cheville, des boîtes vides qui pendent. Si ça tinte la nuit, c\'est que quelqu\'un est passé.',
  },
  fosse: {
    nom: 'Fosse', cat: 'defense', t: [1, 1], bloque: 0, opaque: 0, pv: 20, piege: { chute: 9000, degats: 6 }, dessin: 'fosse', plat: true,
    ingredients: [{ id: 'branche', qty: 2 }], outils: ['creuser'], skill: { construction: 1 }, tempsMin: 60, xp: { construction: 6, force: 4 },
    desc: 'Un trou d\'un mètre, des branches en travers, de la terre dessus. Le mort qui tombe dedans y reste le temps qu\'on l\'achève.',
  },
  chevaux_frise: {
    nom: 'Cheval de frise', cat: 'defense', t: [2, 1], bloque: 1, opaque: 0, pv: 200, dessin: 'chevaux_frise',
    ingredients: [{ id: 'planche', qty: 3 }, { id: 'branche', qty: 4 }, { id: 'clous', qty: 6 }], outils: ['marteler', 'couper'],
    skill: { construction: 1 }, tempsMin: 40, xp: { construction: 8 },
    desc: 'Une poutre hérissée de pieux croisés. Ça barre une rue — et ceux qui poussent dessus s\'y blessent.',
  },
  // ─────────── Mobilier ───────────
  caisse_bois: {
    nom: 'Caisse de rangement', cat: 'mobilier', t: [1, 1], bloque: 1, opaque: 0, pv: 80, contenance: 60, dessin: 'caisse_bois',
    ingredients: [{ id: 'planche', qty: 3 }, { id: 'clous', qty: 6 }], outils: ['marteler'], skill: null, tempsMin: 25, xp: { construction: 5 },
    desc: 'Une caisse à couvercle. 60 litres pour mettre ses réserves à l\'abri, ici, dans ta base.',
  },
  etabli: {
    nom: 'Établi', cat: 'mobilier', t: [2, 1], bloque: 1, opaque: 0, pv: 120, poste: 'etabli', dessin: 'etabli',
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 8 }], outils: ['marteler'], skill: { construction: 1 }, tempsMin: 40, xp: { construction: 8 },
    desc: 'Un plateau épais sur des tréteaux, un étau de fortune. Tout ce qui se fabrique « à l\'établi » se fait ici, et plus vite.',
  },
  lit_fortune: {
    nom: 'Lit de fortune', cat: 'mobilier', t: [1, 2], bloque: 1, opaque: 0, pv: 60, lit: true, dessin: 'lit_fortune',
    ingredients: [{ id: 'planche', qty: 2 }, { id: 'drap', qty: 2 }], outils: [], skill: null, tempsMin: 20, xp: { construction: 3 },
    desc: 'Deux planches pour ne pas dormir par terre, deux draps roulés. On y dort mieux qu\'au sol.',
  },
  coffre: {
    nom: 'Coffre', cat: 'mobilier', t: [2, 1], bloque: 1, opaque: 0, pv: 110, contenance: 140, dessin: 'coffre',
    ingredients: [{ id: 'planche', qty: 5 }, { id: 'clous', qty: 8 }, { id: 'visserie', qty: 1 }], outils: ['marteler'], skill: { construction: 1 }, tempsMin: 40, xp: { construction: 8 },
    desc: 'Un grand coffre à charnières, de quoi mettre la moitié d\'une maison à l\'abri : 140 litres.',
  },
  etagere_bois: {
    nom: 'Étagère', cat: 'mobilier', t: [2, 1], bloque: 1, opaque: 0, pv: 70, contenance: 80, dessin: 'etagere_bois',
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 8 }], outils: ['marteler'], skill: null, tempsMin: 30, xp: { construction: 5 },
    desc: 'Trois rayons contre un mur, pour ranger les boîtes, les bocaux, les piles. On voit d\'un coup d\'œil ce qui reste.',
  },
  table_bois: {
    nom: 'Table', cat: 'mobilier', t: [2, 1], bloque: 1, opaque: 0, pv: 60, poste: 'table', dessin: 'table_bois',
    ingredients: [{ id: 'planche', qty: 3 }, { id: 'clous', qty: 6 }], outils: ['marteler'], skill: null, tempsMin: 25, xp: { construction: 4 },
    desc: 'Un plateau et quatre pieds. On y mange, on y répare, on y bricole ce qui se fabrique « sur une table ».',
  },
  chaise_bois: {
    nom: 'Chaise', cat: 'mobilier', t: [1, 1], bloque: 0, opaque: 0, pv: 30, dessin: 'chaise_bois',
    ingredients: [{ id: 'planche', qty: 1 }, { id: 'clous', qty: 4 }], outils: ['marteler'], skill: null, tempsMin: 15, xp: { construction: 2 },
    desc: 'Une chaise bancale, mais une chaise. S\'asseoir, c\'est déjà un peu être chez soi.',
  },
  torche_murale: {
    nom: 'Torche plantée', cat: 'mobilier', t: [1, 1], bloque: 1, opaque: 0, pv: 20, feu: { minutes: 180, bois: 90, petit: true }, dessin: 'torche_murale',
    ingredients: [{ id: 'branche', qty: 1 }, { id: 'chiffon', qty: 2 }], outils: ['allumer'], skill: null, tempsMin: 5, xp: { construction: 1 },
    desc: 'Une branche plantée en terre, un chiffon gras au bout. De la lumière pour trois heures — et un phare pour les morts.',
  },
  // ─────────── Survie ───────────
  feu_camp: {
    nom: 'Feu de camp', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 999, feu: { minutes: 120, bois: 60 }, poste: 'feu', dessin: 'feu_camp',
    ingredients: [{ id: 'planche', qty: 2 }, { id: 'journal_papier', qty: 1 }], outils: ['allumer'], skill: null, tempsMin: 10, xp: {},
    desc: 'Un cercle de pierres, du bois cassé, du papier. Deux heures de chaleur, de cuisine — et une lumière qu\'on voit de loin. Une planche de plus : une heure de plus.',
  },
  recuperateur: {
    nom: 'Récupérateur d\'eau de pluie', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 70, eau: { cap: 20, lParMin: 0.04 }, dessin: 'recuperateur',
    ingredients: [{ id: 'bache_plastique', qty: 1 }, { id: 'bidon_vide', qty: 1 }, { id: 'planche', qty: 2 }, { id: 'clous', qty: 4 }], outils: ['marteler'],
    skill: { construction: 1 }, tempsMin: 30, xp: { construction: 8 },
    desc: 'Une bâche tendue en entonnoir au-dessus d\'un jerrican. Chaque averse le remplit : 2,4 litres par heure de pluie, jusqu\'à 20 litres. Eau de pluie : buvable.',
  },
  feu_branches: {
    nom: 'Feu de branches', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 999, feu: { minutes: 60, bois: 40 }, poste: 'feu', dessin: 'feu_camp',
    ingredients: [{ id: 'branche', qty: 3 }, { id: 'brindilles', qty: 2 }], outils: ['allumer'], skill: null, tempsMin: 8, xp: {},
    desc: 'Des brindilles en pyramide, les branches par-dessus. Une heure de feu sans une seule planche.',
  },
  four_pierre: {
    nom: 'Four de pierres', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 999, feu: { minutes: 240, bois: 120, discret: true }, poste: 'feu', dessin: 'four_pierre',
    ingredients: [{ id: 'pierre', qty: 10 }, { id: 'brindilles', qty: 2 }], outils: ['allumer'], skill: { construction: 1 }, tempsMin: 50, xp: { construction: 6 },
    desc: 'Un cercle de pierres monté en voûte, une ouverture devant. Il garde la braise des heures et ne se voit presque pas de loin.',
  },
  fumoir: {
    nom: 'Fumoir', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 80, feu: { minutes: 180, bois: 90, petit: true }, poste: 'feu', dessin: 'fumoir',
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'branche', qty: 3 }, { id: 'bache_plastique', qty: 1 }], outils: ['marteler', 'allumer'], skill: { construction: 2 }, tempsMin: 45, xp: { construction: 8, chasse: 4 },
    desc: 'Une cabane étroite sur un foyer couvert. La viande et le poisson y sèchent dans la fumée et se gardent des semaines.',
  },
  tonneau: {
    nom: 'Tonneau de pluie', cat: 'survie', t: [1, 1], bloque: 1, opaque: 0, pv: 90, eau: { cap: 60, lParMin: 0.07 }, dessin: 'tonneau',
    ingredients: [{ id: 'planche', qty: 6 }, { id: 'fil_de_fer', qty: 2 }, { id: 'bache_plastique', qty: 1 }], outils: ['marteler'],
    skill: { construction: 2 }, tempsMin: 60, xp: { construction: 10 },
    desc: 'Un tonneau cerclé de fil de fer et doublé d\'une bâche. 60 litres de pluie qui attendent la soif.',
  },
  abri_branches: {
    nom: 'Abri de branches', cat: 'survie', t: [2, 2], bloque: 1, opaque: 1, pv: 90, lit: true, dessin: 'abri_branches',
    ingredients: [{ id: 'branche', qty: 10 }, { id: 'fibres', qty: 4 }, { id: 'bache_plastique', qty: 1 }], outils: [], skill: null, tempsMin: 60, xp: { construction: 6 },
    desc: 'Des branches appuyées contre une perche, une bâche dessus, des feuilles par-dessus. On y dort au sec, caché.',
  },
  potager: {
    nom: 'Potager', cat: 'survie', t: [2, 2], bloque: 0, opaque: 0, pv: 999, potager: { jours: 3, recolte: 4 }, dessin: 'potager', plat: true,
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 4 }, { id: 'graines', qty: 1 }], outils: ['creuser'], skill: null, tempsMin: 40, xp: { construction: 4 },
    desc: 'Un carré de terre retournée entre quatre planches. Trois jours plus tard, de quoi manger. On replante avec un sachet de graines.',
  },
};
export const CATS_CONSTRUCTION = { murs: 'Murs et clôtures', defense: 'Défense et pièges', mobilier: 'Mobilier', survie: 'Survie' };

// Bois qu'on met au feu (minutes de feu gagnées par pièce), dans l'ordre où on le prend.
export const COMBUSTIBLES = [['buche', 180], ['planche', 60], ['branche', 30], ['brindilles', 10]];

// Ce que la nature donne : arbres qu'on abat (hache), buissons qu'on coupe ou qu'on cueille. type d'objet de carte →
//   { geste, outil (tag ; mainsNues : facteur de durée sans outil), ms, rendu { id: qty },
//     cueillette? { id, qty, mois: [1..12] } (sans outil, une fois tous les 3 jours), souche (l'arbre laisse une souche),
//     bruit (rayon : on entend la hache de loin) }
export const RECOLTES = {
  arbre:   { geste: 'Abattre', outil: 'abattre', ms: 26000, rendu: { buche: 3, branche: 4, brindilles: 3 }, souche: true, bruit: 9 },
  platane: { geste: 'Abattre', outil: 'abattre', ms: 34000, rendu: { buche: 4, branche: 5, brindilles: 3 }, souche: true, bruit: 9 },
  pin:     { geste: 'Abattre', outil: 'abattre', ms: 28000, rendu: { buche: 3, branche: 4, brindilles: 4 }, souche: true, bruit: 9,
             cueillette: { id: 'pignons', qty: 2, mois: [8, 9, 10, 11] } },
  cypres:  { geste: 'Abattre', outil: 'abattre', ms: 20000, rendu: { buche: 2, branche: 3, brindilles: 2 }, souche: true, bruit: 8 },
  olivier: { geste: 'Abattre', outil: 'abattre', ms: 30000, rendu: { buche: 3, branche: 3, brindilles: 2 }, souche: true, bruit: 9,
             cueillette: { id: 'olives', qty: 1, mois: [10, 11, 12] } },
  figuier: { geste: 'Abattre', outil: 'abattre', ms: 22000, rendu: { buche: 2, branche: 4, brindilles: 2 }, souche: true, bruit: 8,
             cueillette: { id: 'figues', qty: 2, mois: [8, 9, 10] } },
  amandier: { geste: 'Abattre', outil: 'abattre', ms: 22000, rendu: { buche: 2, branche: 4, brindilles: 2 }, souche: true, bruit: 8,
             cueillette: { id: 'amandes', qty: 2, mois: [8, 9] } },
  buisson: { geste: 'Couper', outil: 'elaguer', mainsNues: 2.2, ms: 7000, rendu: { branche: 2, brindilles: 2, fibres: 2 }, bruit: 2,
             cueillette: { id: 'mures', qty: 2, mois: [8, 9] } },
  roncier: { geste: 'Couper', outil: 'elaguer', mainsNues: 3, ms: 8000, rendu: { branche: 1, brindilles: 3, fibres: 1 }, bruit: 2,
             cueillette: { id: 'mures', qty: 3, mois: [8, 9] } },
  cannier: { geste: 'Couper', outil: 'elaguer', mainsNues: 2.5, ms: 8000, rendu: { cannes: 4, fibres: 2 }, bruit: 2 },
  haie:    { geste: 'Couper', outil: 'elaguer', mainsNues: 2.5, ms: 9000, rendu: { branche: 2, brindilles: 3 }, bruit: 2 },
};

// Meubles qu'on démonte pour récupérer des planches (outil 'marteler' ou 'forcer'). type de meuble → { planche, autres, ms }.
export const DEMONTABLES = {
  chaise: { planche: 1, ms: 4000 }, table: { planche: 2, ms: 7000 }, table_ronde: { planche: 1, ms: 5000 },
  lit: { planche: 2, ressort: 1, ms: 9000 }, lit_simple: { planche: 1, ressort: 1, ms: 7000 },
  etagere: { planche: 2, ms: 8000 }, rayonnage: { planche: 1, visserie: 1, ms: 8000 }, armoire: { planche: 3, ms: 9000 },
  commode: { planche: 2, ms: 8000 }, bureau: { planche: 2, ms: 8000 }, banc: { planche: 1, ms: 5000 }, palette: { planche: 2, clous: 2, ms: 6000 },
  caisson: { planche: 1, ms: 5000 }, prie_dieu: { planche: 2, ms: 8000 }, canape: { planche: 1, ressort: 2, chiffon: 2, ms: 9000 },
};

// Cases couvertes par une construction posée en (x, y) avec la rotation rot (0 : t = [w, h] ; 1 : [h, w]).
export function casesConstruction(type, x, y, rot = 0) {
  const d = CONSTRUCTIONS[type]; if (!d) return [];
  const [w, h] = rot % 2 ? [d.t[1], d.t[0]] : d.t;
  const out = []; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) out.push([xx, yy]);
  return out;
}
export function tailleConstruction(type, rot = 0) { const d = CONSTRUCTIONS[type]; return d ? (rot % 2 ? [d.t[1], d.t[0]] : d.t.slice()) : [1, 1]; }
// Bloque-t-elle (une porte ouverte laisse passer) ?
export const bloqueC = (c, d = CONSTRUCTIONS[c.type]) => !!(d && d.bloque && !(d.porte && c.ouverte));
export const opaqueC = (c, d = CONSTRUCTIONS[c.type]) => !!(d && d.opaque && !(d.porte && c.ouverte));
// Une construction que les morts cognent quand elle leur barre la route.
export const cassableC = (c, d = CONSTRUCTIONS[c.type]) => !!(d && d.pv < 999 && bloqueC(c, d));

// Grilles dynamiques : réapplique toutes les constructions (base = grilles du niveau + portes déjà posées dans dyn).
// Utilisé par la simulation et par l'invité en co-op (même résultat des deux côtés).
export function appliquerConstructions(niveau, dyn, constructions) {
  for (const c of constructions || []) {
    const ei = niveau.etageIdx[c.etage]; if (ei == null) continue;
    const E = niveau.etages[ei], D = dyn[ei], d = CONSTRUCTIONS[c.type];
    for (const [x, y] of casesConstruction(c.type, c.x, c.y, c.rot)) {
      if (x < 0 || y < 0 || x >= E.w || y >= E.h) continue;
      const i = y * E.w + x;
      if (bloqueC(c, d)) D.bloque[i] = 1;
      if (opaqueC(c, d)) D.opaque[i] = 1;
    }
  }
}
// Calories et poids des récoltes : voir items.js (legumes).
