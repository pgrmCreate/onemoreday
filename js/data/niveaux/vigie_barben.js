// La vigie de la crête (LE DÉBUT, docs/HISTOIRE_DEBUT_V3.md §3, étape 4) — format à couches (js/carte/plan.js).
// En une phrase : la tour de guet des pompiers au sommet de la crête, où le joueur monte chercher de l'aide par la radio,
// et d'où il voit tout le pays ; la radio ne marche pas.
// Réel : une vigie DFCI de Provence, c'est une tour de pierre ou de béton de deux niveaux, au point le plus haut d'une crête
// de garrigue ; en haut, une cabine vitrée sur les quatre côtés, une table d'orientation, un poste radio, un cahier où le
// guetteur note chaque fumée ; en bas, le pied de la tour, un réservoir, une citerne d'eau pour les camions.
//
// Organisation (48 × 40 unités, nord en haut) :
//   - le sommet : garrigue, cailloux, chênes kermès, quelques pins tordus par le mistral ; le chemin arrive du sud (le haut
//     du pare-feu, entrée `pare_feu`) ;
//   - LE PIED DE LA VIGIE (x 21..26, y 15..20) : la porte au sud, l'escalier, le placard du guetteur ;
//   - LA CABINE (étage `cabine`, même emprise) : vitrée sur les quatre côtés ; la table du poste radio (marqueur
//     `radio_vigie`), le cahier du guetteur, les jumelles ; en y entrant : la scène de la vue (vig_cabine) ;
//   - la citerne des pompiers (eau croupie, inépuisable) ;
//   - redescendre : au bout du chemin, une fois la cabine vue (vig_redescendre).
// Personne ici : le guetteur est parti, son lit de camp est fait. Un mort au plus, dehors.
import { plan } from '../../carte/plan.js';

const W = 48, H = 40;

export default plan({
  id: 'vigie_barben', nom: 'La vigie de la crête', exterieur: true, abords: false, version: 1, typeButin: 'nature',
  sansSanitaires: true,   // une tour de guet : le guetteur descendait derrière les chênes (tools/verifier_realisme.mjs)
  pool: ['errant'], morts: { n: [0, 1] }, mortsDehorsSeulement: true,
}, (p) => {
  const e = p.etage('rdc', 'Le sommet de la crête', W, H, { sol: 'cailloux', monte: 'cabine' });
  const r = e.rng;
  e.taches('herbe_seche', 1, 1, W - 2, H - 2, 0.3, 2);
  e.taches('terre', 1, 1, W - 2, H - 2, 0.06, 1.4);
  e.semer('gravillons', 1, 1, W - 2, H - 2, 80);
  e.semer('herbes', 1, 1, W - 2, H - 2, 40);
  // le chemin qui monte du pare-feu
  e.chemin('terre', [[24, 39], [24, 31], [23, 25], [23, 22]], 2);

  // ======================= Le pied de la vigie =======================
  const pied = e.piece(21, 15, 6, 6, { nom: 'Le pied de la vigie', sol: 'beton', mur: 'pierre', toit: 'terrasse', sombre: 1,
    portes: [{ cote: 's', a: 1, nom: 'la porte de la vigie' }], fenetres: [{ cote: 'e', a: 1 }] });
  e.escalier('monte', pied.x1 - 1, pied.y0, 2, 2);
  e.objet('armoire', pied.x0, pied.y0, { w: 1, h: 2, rot: 1, nom: 'le placard du guetteur', conteneur: { nom: 'le placard du guetteur', items: [{ id: 'gourde', qty: 1 }, { id: 'barre_cereales', qty: 2 }], table: null } });
  e.objet('lit_camp', pied.x0, pied.y1 - 1, { nom: 'le lit de camp du guetteur', message: 'Le lit de camp est fait au carré, la couverture tirée. Le guetteur est parti sans défaire son lit.' });

  // la citerne des pompiers
  e.objet('fut', 31, 22, { w: 2, h: 2, nom: 'la citerne des pompiers', eau: true, conteneur: false, message: 'Une citerne verte pour les camions-citernes, à moitié pleine d’une eau verte qui sent la vase.' });
  e.objet('poteau', 18, 18, { nom: 'l’antenne de la vigie', message: 'Un mât d’antenne haubané, au pied de la tour. Le câble qui descend vers la cabine pend, coupé net à hauteur d’homme. Le vent ne coupe pas les câbles comme ça.' });

  // ======================= La garrigue du sommet =======================
  const libre = (x, y) => !(x >= 17 && x <= 30 && y >= 12 && y <= 25) && !(Math.abs(x - 24) < 3 && y > 24) && !(x >= 29 && x <= 34 && y >= 20 && y <= 25);
  for (let y = 1; y < H - 1; y += 3) for (let x = 1; x < W - 1; x += 3) {
    const tx = x + Math.floor(r() * 2), ty = y + Math.floor(r() * 2);
    if (!libre(tx, ty) || r() < 0.45) continue;
    const v = r();
    e.objet(v < 0.5 ? 'buisson' : v < 0.75 ? 'romarin' : v < 0.9 ? 'chene_vert' : 'pin', tx, ty);
  }
  e.nommer(10, 30, 'La crête', { exterieur: true });
  // un mort accroché aux chênes kermès, en contrebas, côté nord (il est tombé de la crête et n'en remonte pas)
  e.zombie('rampant', 12, 6, { etat: 'erre' });

  // ======================= Arriver, redescendre =======================
  e.entree('pare_feu', 24, 34);
  e.entree('defaut', 24, 34);
  e.declencheur(21, 37, 6, 2, { scene: 'vig_redescendre', unique: false, si: { flag: 'vigie_vue' } });
  e.sortie(21, H - 1, 6, 1, { si: { flag: 'debut_fini' }, message: 'Le chemin redescend vers le pare-feu et le camp.' });

  // ======================= La cabine (étage) =======================
  const c = p.etage('cabine', 'La cabine de la vigie', W, H, { sol: null, descend: 'rdc' });
  const cab = c.piece(21, 15, 6, 6, { nom: 'La cabine du guetteur', sol: 'planches', mur: 'beton', toit: 'tole', sombre: 0,
    fenetres: [{ cote: 'n', a: 0, l: 4 }, { cote: 's', a: 0, l: 4 }, { cote: 'o', a: 0, l: 4 }, { cote: 'e', a: 2, l: 2 }] });
  c.escalier('descend', cab.x1 - 1, cab.y0, 2, 2);
  c.objet('bureau', cab.x0, cab.y0 + 1, { w: 1, h: 2, rot: 1, nom: 'le poste radio des pompiers', marqueur: 'radio_vigie', conteneur: false });
  c.document('doc_cahier_guetteur', cab.x0 + 1, cab.y0 + 2);
  c.objet('chaise', cab.x0 + 1, cab.y0 + 1);
  c.objet('table_ronde', cab.x0 + 1, cab.y1, { nom: 'la table d’orientation', conteneur: false, message: 'Une table d’orientation en lave émaillée : Salon, La Barben, Vernègues, la Sainte-Victoire, les Alpilles, l’étang de Berre. Les noms sont usés par les doigts.' });
  c.objetSol('jumelles', cab.x0 + 2, cab.y1, 1);
  c.declencheur(cab.x0, cab.y0, cab.w, cab.h, { scene: 'vig_cabine', unique: true, si: { pasFlag: 'vigie_vue' } });
});
