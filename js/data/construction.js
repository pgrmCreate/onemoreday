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
  potager: {
    nom: 'Potager', cat: 'survie', t: [2, 2], bloque: 0, opaque: 0, pv: 999, potager: { jours: 3, recolte: 4 }, dessin: 'potager', plat: true,
    ingredients: [{ id: 'planche', qty: 4 }, { id: 'clous', qty: 4 }, { id: 'graines', qty: 1 }], outils: ['creuser'], skill: null, tempsMin: 40, xp: { construction: 4 },
    desc: 'Un carré de terre retournée entre quatre planches. Trois jours plus tard, de quoi manger. On replante avec un sachet de graines.',
  },
};
export const CATS_CONSTRUCTION = { murs: 'Murs et clôtures', defense: 'Défense', mobilier: 'Mobilier', survie: 'Survie' };

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
