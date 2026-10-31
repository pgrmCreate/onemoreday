// Le bois de la Barben (LE DÉBUT, docs/HISTOIRE_DEBUT_V3.md §3) — format à couches (js/carte/plan.js).
// En une phrase : la piste de pompiers où le fourgon du groupe est tombé en panne, le camp qu'on monte à côté, et en bas du
// vallon le mas abandonné où l'on va chercher à manger.
// Réel : la pinède et la garrigue entre La Barben, Pélissanne et Vernègues — pins d'Alep, chênes verts, romarin, ronciers ;
// des pistes DFCI en terre stabilisée, des pare-feu qui montent droit vers les crêtes, et dans les creux, de vieux mas
// entourés de vignes et d'un puits.
//
// Organisation (96 × 84 unités, nord en haut) :
//   - LA PISTE DFCI (y 15..22) traverse le bois d'ouest en est ; ses deux bouts sont fermés tant que dure le début
//     (le conducteur attend que le fourgon reparte ; personne ne veut marcher de nuit sur la piste) ;
//   - LE FOURGON (x 38..41, y 15..16), arrêté au milieu de la piste : à l'arrière (marqueur `fourgon`), toujours un sac
//     d'écolier et une bâche, et un peu de bric-à-brac tiré au sort ; le fil que René a tendu en travers de la piste ;
//   - LE CAMP, au sud de la piste (autour de x 43, y 24) : la caisse du camp (marqueur `caisse_camp`, vide au départ),
//     la poubelle du groupe (les boîtes vides), le creux où faire un feu, du bois mort au pied des pins, des buissons à
//     couper ; René veille : on y dort en sûreté (meta veille) ;
//   - LE PARE-FEU (x 58..64) monte vers la crête et la vigie (au nord) : on y part par une scène (marqueur `pare_feu`) ;
//   - LE SENTIER descend du camp vers le sud, dans le vallon, jusqu'au MAS (x 40..59, y 52..63) : la salle, le cellier,
//     la chambre, la salle d'eau ; la remise ; la cour, son puits et son figuier ; le potager ; LES VIGNES (x 68..91) que
//     personne n'a vendangées. Deux morts : le vigneron dans ses rangs, sa femme dans la chambre.
// Après l'attaque (camp_attaque) : le fourgon, le conducteur, sa femme et la mère ne sont plus là ; les indices
// apparaissent (le fil coupé net, un mort au crâne enfoncé, les traces d'un deuxième véhicule) ; René, Laura et Mathis
// restent, chacun à une autre place.
//
// Check-list (docs/RETOURS_JOUEUR.md §3) :
//   [x] sens et taille : lieu clé du début, rien n'est à plus de ~25 unités d'un repère (la piste, le fourgon, le mas) ;
//   [x] chaque bâtiment a une fonction : le mas (manger, dormir), la remise (outils, fil de fer, la hotte), la salle d'eau ;
//   [x] le groupe vivant au camp, des traces de vie au mas (la table mise, le calendrier, le vin dans le cellier) ;
//   [x] morts : deux au mas (scénarisés), un procédural au plus, dehors ; aucun mort au camp ;
//   [x] portes : toutes s'ouvrent ; sorties fermées avec leur raison (P4, P16) ;
//   [x] réalisme (P15) : WC et lavabo dans la salle d'eau, évier dans la salle ; la remise et le cellier sans sanitaires ;
//   [x] repérage : toutes les pièces nommées ; repères : la piste, le fourgon, le pare-feu, le sentier, le mas, le puits.
import { plan } from '../../carte/plan.js';

const W = 96, H = 84;
const AVANT = { pasFlag: 'camp_attaque' }, APRES = { flag: 'camp_attaque' };
// les gens du groupe (docs/HISTOIRE_DEBUT_V3.md §3)
const S = {
  thierry: { manteau: '#2c3a5a', pantalon: '#2a2c30', cheveux: '#3a3430', coiffure: 'court' },     // bleu de travail du plombier
  martine: { manteau: '#7a5a5a', pantalon: '#2c2826', cheveux: '#8a7058', coiffure: 'long' },
  sandrine: { manteau: '#4a5a4a', pantalon: '#22262c', cheveux: '#2a1c14', coiffure: 'long' },
  mathis: { manteau: '#b05a2a', pantalon: '#2a3a5a', cheveux: '#5a3a1e', coiffure: 'court', taille: 0.78 },   // dix ans
  rene: { manteau: '#5a5a3a', pantalon: '#3a3428', cheveux: '#e0dcd4', coiffure: 'court' },          // la vieille veste des pompiers forestiers
  laura: { manteau: '#8a8a92', pantalon: '#1e2230', cheveux: '#6a4426', coiffure: 'long' },
};
// ─── Ce qu'ils font de leurs journées (js/explore/pnj_vie.js ; docs/RETOURS_JOUEUR.md #63) ───
// Personne ne reste planté : Thierry cherche la panne sous le capot (la clé à cliquet, le démarreur qui ne prend pas),
// Martine compte les provisions, Sandrine ne quitte pas son fils des yeux, Mathis joue avec un bâton, René veille sur sa
// souche et fait sa ronde jusqu'au fil, Laura ne bouge presque pas. La nuit, ils dorment près du fourgon ; René veille,
// et Thierry reste assis sur le marchepied.
const PI = Math.PI;
const COUV = { martine: '#6a4a3a', sandrine: '#3a4a5a', laura: '#5a5e3a', mathis: '#3a4a5a' };
const VIE = {
  thierry: {
    vitesse: 2.2,
    moments: [
      { a: [42.65, 15.6], dir: PI, geste: 'meca', outil: 'cle', ms: [9000, 16000], poids: 4, sons: { n: ['cle', 'cle', 'metal'], chaque: [700, 2200], vol: 0.85, portee: 16 },
        bulle: ['La pompe à gasoil, je te dis…', 'Saloperie de filtre.', 'Sans outils, va savoir.'] },
      { a: [42.65, 16.45], dir: PI, geste: 'meca', outil: 'cle', ms: [7000, 13000], poids: 3, sons: { n: ['cle', 'metal', 'metal'], chaque: [800, 2400], vol: 0.85, portee: 16 } },
      { a: [40.3, 17.6], dir: -PI / 2, geste: 'fouille', ms: [3000, 5000], poids: 1, sons: { n: ['metal', 'fouille'], chaque: [900, 1800], vol: 0.55 } },
      { a: [40.85, 14.35], dir: PI / 2, geste: 'verifier', son: 'demarreur', ms: [3200, 4200], poids: 0.8, bulle: ['Démarre, saloperie. Démarre…', 'Allez… allez…'] },
      { a: [43.7, 15.1], regard: [52, 19], geste: 'bras', ms: [3000, 5000], poids: 0.8, son: 'outil_tombe', bulle: ['On repart dès que j’ai trouvé la panne.'] },
    ],
    nuit: { a: [40.6, 17.5], dir: PI / 2 + 0.5, pose: 'assis', ms: [30000, 60000] },
  },
  thierry_assis: {    // la pompe est morte : il ne parle plus à personne, assis sur le marchepied, les yeux sur la piste
    vitesse: 2,
    moments: [
      { a: [40.6, 17.5], dir: PI / 2 + 0.5, pose: 'assis', ms: [15000, 30000], poids: 4 },
      { a: [46.5, 19.2], regard: [57, 20], geste: 'bras', ms: [4000, 7000], poids: 1 },
    ],
    nuit: { a: [40.6, 17.5], dir: PI / 2 + 0.5, pose: 'assis', ms: [30000, 60000] },
  },
  martine: {
    vitesse: 1.9,
    moments: [
      { a: [37.5, 22.45], dir: -PI / 2, pose: 'accroupi', geste: 'compter', ms: [9000, 16000], poids: 3, sons: { n: ['fouille'], chaque: [3000, 6000], vol: 0.3, portee: 10 },
        bulle: ['Un demi-paquet de biscuits. Une boîte de thon.', 'Pour sept…'] },
      { a: [37.45, 19.6], dir: PI, pose: 'accroupi', geste: 'fouille', ms: [4000, 7000], poids: 1, sons: { n: ['canettes'], chaque: [1500, 3500], vol: 0.55, portee: 11 } },
      { a: [37.25, 16.0], dir: 0, geste: 'fouille', ms: [3500, 6000], poids: 1.5, sons: { n: ['fouille'], chaque: [2000, 3500], vol: 0.4 } },
      { a: 'bb_thierry', regard: 'bb_thierry', ms: [3000, 5000], poids: 0.7, si: { pasFlag: 'vivres_faits' }, bulle: ['Thierry, mange quelque chose.', 'Laisse ce moteur. Viens t’asseoir.'] },
    ],
    nuit: { a: [39.6, 18.4], dir: 0, pose: 'dort', couverture: COUV.martine, ms: [60000, 90000] },
  },
  sandrine: {
    vitesse: 2.1,
    moments: [
      { a: [46.2, 25.6], regard: 'bb_mathis', geste: 'bras', ms: [6000, 11000], poids: 3 },
      { a: [44.6, 25.8], regard: 'bb_mathis', pose: 'assis', ms: [9000, 15000], poids: 2 },
      { a: 'bb_mathis', regard: 'bb_mathis', ms: [2500, 4000], poids: 1, bulle: ['Mathis, reste près du fourgon.', 'Pas plus loin que les pins, tu m’entends ?', 'Viens là, mon grand.'] },
    ],
    nuit: { a: [41.9, 18.5], dir: 0, pose: 'dort', couverture: COUV.sandrine, ms: [60000, 90000] },
  },
  mathis: {
    vitesse: 2.6,
    moments: [
      { a: [46.5, 24.2], errer: 2.6, ms: [1500, 3500], poids: 3 },
      { a: [46.5, 24.2], errer: 2, pose: 'accroupi', geste: 'gratter', outil: 'baton', ms: [5000, 9000], poids: 2, sons: { n: ['gratter'], chaque: [700, 1600], vol: 0.5, portee: 9 } },
      { a: [46.5, 24.2], errer: 1.5, regard: [41, 32], geste: 'lancer', ms: [4400, 6600], poids: 1, sons: { n: ['caillou'], chaque: [2200, 2200], vol: 0.5, portee: 10 } },
      { a: 'bb_sandrine', regard: 'bb_sandrine', ms: [2500, 4000], poids: 0.8, bulle: ['J’ai faim.', 'Maman, on part quand ?'] },
    ],
    nuit: { a: [42.7, 18.9], dir: 0, pose: 'dort', couverture: COUV.mathis, ms: [60000, 90000] },
  },
  rene: {
    vitesse: 1.1, canne: true,
    moments: [
      { a: [43.25, 22.3], dir: PI / 2 + 0.3, pose: 'assis', ms: [18000, 30000], poids: 3 },
      { par: [[46.8, 20.6]], a: [49.1, 18.6], dir: 0, pose: 'accroupi', geste: 'verifier', ms: [3000, 4500], poids: 1, sons: { n: ['canettes'], chaque: [1500, 2500], vol: 0.5 }, bulle: ['Il tient.'] },
      { par: [[48.2, 23.4], [47.8, 26.6]], a: [44.6, 29.1], regard: [44, 37], ms: [3000, 5000], poids: 1 },
      { a: [41.6, 25.4], regard: 'laura', ms: [4000, 6000], poids: 0.6, bulle: ['Bois un peu, petite.', 'Repose ta jambe.'] },
    ],
    nuit: { a: [43.25, 22.3], dir: PI / 2 + 0.3, pose: 'assis', ms: [30000, 60000] },   // il veille
  },
  laura: {
    vitesse: 0.6,
    moments: [
      { a: [40.5, 25.75], dir: -PI / 2, pose: 'assis_tendu', couverture: COUV.laura, ms: [20000, 35000], poids: 3 },
      { a: [40.5, 25.75], dir: -PI / 2, pose: 'assis_tendu', couverture: COUV.laura, geste: 'jambe', ms: [4000, 7000], poids: 1, sons: { n: ['gemit_f'], chaque: [7000, 12000], vol: 0.45, portee: 9 } },
      { a: [40.5, 25.45], dir: PI / 2, pose: 'allonge', couverture: COUV.laura, ms: [10000, 20000], poids: 1.5 },
    ],
    nuit: { a: [40.5, 25.45], dir: PI / 2, pose: 'dort', couverture: COUV.laura, ms: [60000, 90000] },
  },
  // ─── après l'attaque ───
  rene_apres: {
    vitesse: 1, canne: true,
    moments: [
      { a: [44.5, 26.5], dir: -PI / 2, pose: 'assis', ms: [15000, 25000], poids: 3 },
      { a: [44.5, 26.5], dir: -PI / 2, pose: 'assis', geste: 'tete', ms: [3000, 5000], poids: 1, sons: { n: ['gemit_h'], chaque: [6000, 9000], vol: 0.4, portee: 9 } },
      { a: [44.0, 20.6], regard: [53, 18.5], ms: [4000, 6000], poids: 1, bulle: ['Je n’ai rien vu venir.', 'Ils étaient trop nombreux…'] },
    ],
  },
  laura_apres: { vitesse: 0.5, moments: [{ a: [39.5, 25.5], dir: PI / 2, pose: 'allonge', couverture: COUV.laura, tremble: true, ms: [20000, 40000], sons: { n: ['gemit_f'], chaque: [8000, 14000], vol: 0.45, portee: 9 } }],
    nuit: { a: [39.5, 25.5], dir: PI / 2, pose: 'dort', couverture: COUV.laura, tremble: true, ms: [60000, 90000] } },
  mathis_cache: { vitesse: 0.5, moments: [{ a: [28.5, 29.5], dir: 0, pose: 'accroupi', tremble: true, ms: [30000, 60000] }] },
  mathis_apres: {
    vitesse: 2,
    moments: [
      { a: [43.3, 27.4], regard: 'rene_apres', pose: 'assis', ms: [12000, 22000], poids: 3 },
      { a: 'rene_apres', regard: 'rene_apres', ms: [2500, 4000], poids: 1 },
    ],
    nuit: { a: [43.3, 27.4], dir: -PI / 2, pose: 'dort', couverture: COUV.mathis, ms: [60000, 90000] },
  },
};
const toitSur = (e, x, y, w, h, refs, type = 'tuiles') => { for (const ref of refs) e.toits.push({ x, y, w, h, type, ref }); };

export default plan({
  id: 'bois_barben', nom: 'Le bois de la Barben', exterieur: true, abords: false, version: 1, typeButin: 'nature',
  sansSanitaires: ['Le cellier', 'La remise', 'La chambre'],   // la salle d'eau du mas a son WC et son lavabo, à côté
  pool: ['errant'], morts: { n: [0, 1] }, mortsDehorsSeulement: true,
  // René veille sur le camp (même après l'attaque, il ne dort plus) : on dort en sûreté près de lui
  veille: { si: { pasFlag: 'debut_fini' }, x: 43, y: 24, rayon: 11 },
}, (p) => {
  const e = p.etage('rdc', 'Le bois de la Barben', W, H, { sol: 'sous_bois' });
  const r = e.rng;

  // ======================= Le sol : sous-bois, aiguilles, garrigue =======================
  // un sol de pinède : des aiguilles partout, quelques plaques d'herbe sèche (pas de plaques de cailloux : elles font des
  // dalles grises au milieu du bois)
  e.taches('herbe_seche', 1, 1, W - 2, H - 2, 0.05, 2.6);
  e.semer('aiguilles', 1, 1, W - 2, H - 2, 320);
  e.semer('herbes', 1, 1, W - 2, H - 2, 60);

  // ======================= La piste DFCI =======================
  const PISTE = [[0, 16.5], [18, 16], [34, 17.5], [50, 18.5], [66, 20], [82, 21.5], [95, 21.5]];
  e.chemin('stabilise', PISTE, 4);
  e.semer('traces', 2, 15, 92, 7, 26);
  e.semer('gravillons', 2, 15, 92, 7, 40);
  // les bouts de la piste : fermés tant que dure le début, et le jeu dit pourquoi (P4, P16)
  e.sortie(0, 14, 1, 5, { si: { flag: 'debut_fini' }, message: 'La piste redescend vers Pélissanne et la nationale, là où il y avait trop de morts. Personne ne repartira à pied par là.' });
  e.sortie(W - 1, 19, 1, 5, { si: { flag: 'debut_fini' }, message: 'La piste s’enfonce vers l’est à travers les pins, sans un panneau. Le vieux René dit qu’elle ne mène nulle part avant des kilomètres.' });
  // le panneau DFCI (repère)
  e.objet('poteau', 30, 14, { nom: 'le panneau de la piste', message: 'Une plaque verte vissée sur un poteau : « PISTE DFCI BA 112 — BOIS DE LA BARBEN — INTERDITE À LA CIRCULATION ». Dessous, quelqu’un a gratté au couteau : « NE PAS ALLER À PÉLISSANNE ».' });

  // ======================= Le fourgon, et le fil de René =======================
  e.objet('camionnette', 38, 15, { nom: 'le fourgon de Thierry', couleur: '#e8e6e0', marqueur: 'fourgon', si: AVANT,
    conteneur: { nom: 'l’arrière du fourgon', items: [{ id: 'sac_a_dos', qty: 1 }, { id: 'bache_plastique', qty: 1 }], table: 'fourgon.voiture' } });
  // le capot levé, tant que Thierry cherche la panne (il le referme quand il comprend que la pompe est morte : bb_camp)
  e.objet('capot_ouvert', 41, 15, { nom: 'le capot du fourgon', couleur: '#e8e6e0', si: { pasFlag: ['vivres_faits', 'camp_attaque'] },
    message: 'Le capot est levé sur un moteur noir de cambouis. Thierry a démonté la moitié de ce qu’il pouvait démonter avec trois clés et un tournevis, et il a les mains noires jusqu’aux coudes.' });
  e.decal('huile', 42.6, 16.6, { r: 0.6 });
  // en travers de la piste, à l'est : un fil de fer entre deux pins, deux boîtes de conserve (l'alarme de René)
  e.objet('pin', 50, 16); e.objet('pin', 50, 21);
  e.objet('debris', 50, 18, { nom: 'le fil de René', si: AVANT, message: 'Un fil de fer tendu en travers de la piste, à hauteur de cheville, entre deux pins. Deux boîtes de conserve y pendent. René l’a posé dès que le moteur s’est tu.' });
  e.objet('debris', 50, 18, { nom: 'le fil coupé', si: APRES, message: 'Le fil de René pend en deux bouts de chaque côté de la piste, avec ses boîtes dans la poussière. Il n’a pas cassé : il a été coupé net, d’un seul coup de pince. Un mort ne fait pas ça.' });

  // ======================= Le camp =======================
  e.disque('terre', 43, 24, 5.5);
  e.semer('aiguilles', 36, 19, 14, 12, 40);
  // la caisse du camp : on y range ce qu'on rapporte à manger (vide au départ)
  e.objet('caisson', 37, 21, { nom: 'la caisse du camp', marqueur: 'caisse_camp', conteneur: { nom: 'la caisse du camp', items: [], table: null } });
  // le tas de bois, près du creux : René veut du bois mort dessus avant la nuit (mission m_bois) ; on y reprend le bois
  // pour le feu et l'abri, le lendemain
  e.objet('tas_bois', 49, 29, { nom: 'le tas de bois', marqueur: 'tas_bois', conteneur: { nom: 'le tas de bois', items: [], table: null } });
  // la souche où René s'assoit pour veiller
  e.objet('souche', 43, 22, { nom: 'la souche de René' });
  // la poubelle du groupe : on ne jette rien, Martine garde les boîtes vides
  e.objet('poubelle', 36, 19, { nom: 'le sac des boîtes vides', conteneur: { nom: 'le sac des boîtes vides', items: [{ id: 'canette_vide', qty: 5 }, { id: 'journal_papier', qty: 1 }], table: null } });
  // le creux, sous les pins, où un feu ne se voit pas de la piste
  e.disque('terre_battue', 46.5, 28.5, 1.8);
  e.objet('rochers', 48, 30, { nom: 'les pierres du creux', message: 'Un creux de terre sous trois gros pins, à l’abri de la piste. Un feu, là, ne se verrait pas de loin.' });
  e.objetSol('pierre', 45, 30, 3); e.objetSol('pierre', 49, 27, 3); e.objetSol('pierre', 44, 27, 2); e.objetSol('pierre', 48, 26, 2);
  // le bois mort au pied des pins
  for (const [x, y, q] of [[35, 25, 2], [39, 29, 2], [51, 24, 1], [33, 21, 1], [47, 32, 2], [53, 27, 1], [41, 33, 2], [34, 31, 1]]) e.objetSol('branche', x, y, q);
  e.objetSol('brindilles', 41, 30, 3); e.objetSol('brindilles', 52, 22, 2);
  // ce qu'il faut pour un coin de nuit : des feuilles mortes au pied des buissons, des fibres
  for (const [x, y, q] of [[34, 26, 2], [39, 31, 2], [50, 26, 2], [53, 31, 2], [37, 33, 2]]) e.objetSol('feuilles', x, y, q);
  e.objetSol('fibres', 35, 29, 2); e.objetSol('fibres', 51, 31, 2);
  // des pierres sur la piste et sur le talus : le gravier se ramasse
  for (const [x, y, q] of [[32, 19, 2], [46, 20, 2], [55, 22, 2], [26, 18, 1], [36, 21, 1], [52, 20, 1], [60, 13, 2], [62, 6, 2], [59, 10, 1]]) e.objetSol('pierre', x, y, q);
  // des buissons et des ronciers autour du camp : des branches, des fibres (et des mûres)
  for (const [x, y, t] of [[33, 24, 'buisson'], [34, 28, 'buisson'], [38, 32, 'buisson'], [52, 30, 'buisson'], [54, 25, 'buisson'], [50, 33, 'buisson'],
    [31, 27, 'roncier'], [30, 30, 'roncier'], [29, 31, 'roncier'], [55, 29, 'romarin'], [36, 33, 'romarin'], [42, 34, 'buisson']]) e.objet(t, x, y);
  for (const [x, y] of [[36, 23], [45, 21], [49, 25], [40, 27], [44, 31], [37, 30], [51, 28]]) e.objet('pin', x, y);

  // ─── le groupe, avant l'attaque ───
  e.pnj('bb_thierry', 43, 15, { nom: 'Thierry', style: S.thierry, dir: Math.PI,
    vie: VIE.thierry, si: { pasFlag: ['camp_attaque', 'vivres_faits'] },
    repliques: ['La pompe à gasoil, je te dis. Ou le filtre. Sans outils, va savoir.', 'Démarre, saloperie. Démarre…', 'On repart dès que j’ai trouvé la panne. On ne va pas camper ici une semaine.'] });
  e.pnj('bb_thierry', 40, 17, { nom: 'Thierry', style: S.thierry, dir: Math.PI / 2, vie: VIE.thierry_assis, si: { flag: 'vivres_faits', pasFlag: 'camp_attaque' },
    repliques: ['…', 'La pompe est morte. Laisse-moi.', 'On aurait dû rester sur la nationale.'] });
  e.pnj('bb_martine', 38, 22, { nom: 'Martine', style: S.martine, dir: 0, si: AVANT,
    vie: VIE.martine, repliques: ['Il reste un demi-paquet de biscuits et une boîte de thon. Pour sept.', 'Je garde les boîtes vides. On ne sait jamais à quoi ça peut servir.', 'Thierry ne dort plus depuis Salon.'] });
  e.pnj('bb_sandrine', 46, 25, { nom: 'Sandrine', style: S.sandrine, dir: Math.PI, si: AVANT,
    vie: VIE.sandrine, repliques: ['Mathis, reste près du fourgon. Je ne le répéterai pas.', 'Son père est resté à Salon. Il ne sait pas encore ce que ça veut dire.', 'Merci de nous avoir aidés à pousser, tout à l’heure.'] });
  e.pnj('bb_mathis', 47, 24, { nom: 'Mathis', style: S.mathis, dir: Math.PI, si: AVANT,
    vie: VIE.mathis, repliques: ['T’en as déjà tué, toi, des morts ?', 'Maman dit qu’on va dans un endroit avec des murs.', 'J’ai faim.'] });
  e.pnj('rene', 43, 22, { marqueur: 'rene', style: S.rene, dir: Math.PI / 2, si: AVANT, vie: VIE.rene });
  e.pnj('laura', 40, 26, { marqueur: 'laura', style: S.laura, dir: 0, si: AVANT, vie: VIE.laura });
  // ─── après l'attaque ───
  e.pnj('rene_apres', 44, 26, { marqueur: 'rene_apres', style: S.rene, dir: -Math.PI / 2, si: APRES, vie: VIE.rene_apres });
  e.pnj('laura_apres', 39, 25, { marqueur: 'laura_apres', style: S.laura, dir: 0, si: APRES, vie: VIE.laura_apres });
  e.pnj('mathis_cache', 28, 29, { marqueur: 'mathis_cache', style: S.mathis, dir: 0, si: { flag: 'camp_attaque', pasFlag: 'mathis_trouve' }, vie: VIE.mathis_cache });
  e.pnj('mathis_apres', 42, 27, { marqueur: 'mathis_apres', style: S.mathis, dir: -Math.PI / 2, si: { flag: 'mathis_trouve' }, vie: VIE.mathis_apres });
  // ─── les indices de l'attaque ───
  e.objet('cadavre', 55, 19, { nom: 'un mort', si: APRES, message: 'Un mort couché en travers de la piste, les bras en croix. Son crâne a été enfoncé d’un seul coup, par quelque chose de lourd et de plat, une pelle ou une crosse. Les morts ne se tuent pas entre eux.' });
  e.objet('traces_pneus', 52, 18, { nom: 'les traces de pneus', si: APRES, message: 'Dans la terre de la piste, il y a les traces du fourgon, que tu connais, et à côté, d’autres traces, plus larges, aux crampons profonds : un 4 × 4, ou un camion. Elles arrivent de l’est, tournent sur place autour de l’endroit où était le fourgon, et repartent vers l’est.' });
  e.objet('debris', 40, 17, { nom: 'la place du fourgon', si: APRES, message: 'À la place du fourgon, il ne reste qu’une tache d’huile et un gobelet écrasé. Pas un éclat de verre, pas une goutte de sang.' });

  // ======================= Le pare-feu (vers la crête et la vigie) =======================
  e.solRect('herbe_seche', 58, 0, 7, 15);
  e.taches('cailloux', 58, 0, 7, 15, 0.25, 1.2);
  e.chemin('terre', [[61, 15], [61, 0]], 2);
  e.marqueur('pare_feu', 61, 9);
  e.sortie(58, 0, 7, 1, { si: { flag: 'debut_fini' }, message: 'Le pare-feu monte tout droit vers la crête, entre deux murs de pins. René a dit qu’il fallait partir le matin, avec de l’eau.' });
  e.entree('pare_feu', 61, 12);

  // ======================= Le sentier du vallon =======================
  e.chemin('terre', [[44, 30], [45, 36], [42, 41], [46, 46], [49, 51]], 1.5);
  e.semer('traces', 41, 34, 8, 16, 8);

  // ======================= Le mas du vallon =======================
  // extérieur x 40..59, y 52..63 ; dedans x 41..58, y 53..62
  const ma = e.batiment(40, 52, 20, 12, { nom: 'Le mas — la salle', sol: 'tomettes', mur: 'pierre', toit: 'tuiles', sombre: 1,
    portes: [{ cote: 'n', a: 8, nom: 'la porte du mas' }, { cote: 's', a: 8, nom: 'la porte de la cour' }],
    fenetres: [{ cote: 'n', a: 3 }, { cote: 'n', a: 14 }, { cote: 's', a: 2 }, { cote: 'e', a: 2 }, { cote: 'o', a: 3 }] });
  toitSur(e, 40, 52, 20, 12, [[56, 55], [56, 61], [43, 61]]);
  // la chambre et la salle d'eau, à l'est ; le cellier, au sud-ouest
  e.cloison('pierre', 53, ma.y0, 53, ma.y1);
  e.porte(53, 56, { nom: 'la porte de la chambre' });
  e.cloison('platre', 54, 59, ma.x1, 59);
  e.porte(56, 59, { nom: 'la porte de la salle d’eau' });
  e.cloison('pierre', ma.x0, 59, 47, 59);
  e.cloison('pierre', 47, 60, 47, ma.y1);
  e.porte(44, 59, { nom: 'la porte du cellier' });
  // la salle : la cuisine, la table encore mise pour deux, la cheminée
  e.objet('cuisine', 41, 53, { w: 3, h: 1, nom: 'l’évier et les placards', conteneur: { nom: 'les placards de la cuisine', items: [{ id: 'pates_seches', qty: 1 }, { id: 'conserve_haricots', qty: 2 }, { id: 'cafe_soluble', qty: 1 }], table: null } });
  e.objet('frigo', 44, 53, { nom: 'le frigo', conteneur: false, message: 'Le frigo est mort depuis des semaines. En ouvrant, l’odeur te prend à la gorge : tu le refermes aussitôt.' });
  e.objet('poubelle', 45, 53, { nom: 'la poubelle de la cuisine', conteneur: { nom: 'la poubelle de la cuisine', items: [{ id: 'canette_vide', qty: 3 }, { id: 'journal_papier', qty: 1 }], table: null } });
  e.objet('cheminee', 49, 53, { nom: 'la cheminée', conteneur: false });
  e.objet('table', 47, 57, { w: 3, h: 1, nom: 'la table mise', conteneur: false, message: 'Deux assiettes, deux verres, une bouteille de rosé à moitié bue, et dans les assiettes, quelque chose de noir que les mouches ont fini. Ils se sont levés de table et ne se sont jamais rassis.' });
  e.objet('chaise', 47, 58); e.objet('chaise', 49, 58); e.objet('chaise', 48, 56);
  e.objet('commode', 52, 61, { nom: 'le buffet', conteneur: { nom: 'le buffet', items: [{ id: 'lampe_huile', qty: 1 }, { id: 'allumettes', qty: 1 }], table: null } });
  e.objet('plan_mural', 51, 52, { nom: 'le calendrier des Postes', message: 'Un calendrier des Postes avec une photo de Lourmarin. Le mois d’août est barré jour par jour au stylo bille, jusqu’au 2 septembre. Après, plus rien.' });
  // le cellier : les bocaux, le vin, la hotte de vendange
  e.nommer(43, 61, 'Le cellier', { sol: 'terre_battue', sombre: 2 });
  e.objet('etagere', 41, 60, { w: 1, h: 3, rot: 1, nom: 'les étagères du cellier', conteneur: { nom: 'les étagères du cellier', items: [{ id: 'olives', qty: 2 }, { id: 'confiture', qty: 1 }, { id: 'conserve_thon', qty: 2 }, { id: 'soupe_conserve', qty: 1 }], table: null } });
  e.objet('fut', 46, 62, { nom: 'le tonneau de vin', message: 'Un tonneau de vin de la propriété, bien entamé. Le robinet de bois goutte encore.' });
  e.objetSol('hotte_vendange', 45, 61, 1);
  // la chambre : la vigneronne, couchée
  e.nommer(56, 55, 'La chambre', { sol: 'tomettes', sombre: 2 });
  e.objet('lit', 55, 53, { w: 2, h: 3, nom: 'le lit' });
  e.objet('armoire', 57, 57, { w: 2, h: 1, nom: 'l’armoire' });
  e.zombie('errant', 55.5, 57, { etat: 'immobile', dir: Math.PI / 2 });
  // la salle d'eau
  e.nommer(56, 61, 'La salle d’eau', { sol: 'carrelage', sombre: 2 });
  e.objet('wc', 58, 62); e.objet('lavabo', 54, 60, { nom: 'le lavabo' });

  // ─── la remise ───
  const re = e.batiment(62, 53, 7, 6, { nom: 'La remise', sol: 'terre_battue', mur: 'pierre', toit: 'tuiles', sombre: 1,
    portes: [{ cote: 's', a: 2, nom: 'la porte de la remise' }] });
  e.objet('etabli_meuble', re.x0, re.y0, { nom: 'l’établi', conteneur: { nom: 'l’établi', items: [{ id: 'marteau', qty: 1 }, { id: 'clous', qty: 6 }], table: null } });
  e.objetSol('fil_de_fer', re.x0 + 3, re.y0 + 2, 2);
  e.objet('palette', re.x1, re.y1, { nom: 'les caisses de vendange' });
  e.objetSol('bache_plastique', re.x0 + 1, re.y1, 1);    // la bâche de l'abri de Laura : celle du fourgon sert au premier soir

  // ─── la cour, le puits, le figuier, le potager ───
  e.solRect('terre', 41, 64, 24, 9);
  e.taches('gravier', 41, 64, 24, 9, 0.04, 1.0);
  e.objet('puits', 51, 66, { nom: 'le puits du mas', eau: true, conteneur: false });
  e.objet('figuier', 62, 67);
  e.objet('banc', 44, 65, { w: 2, h: 1, nom: 'le banc' });
  e.solRect('terre', 41, 69, 8, 5);
  e.objetSol('legumes', 42, 70, 1); e.objetSol('legumes', 46, 72, 1);
  e.decal('fleurs', 43.5, 72.5, { r: 0.4 });

  // ─── les vignes ───
  e.solRect('terre', 67, 50, 26, 28);
  for (let k = 0; k < 9; k++) {
    const y = 51 + k * 3;
    e.objet('vigne', 68, y, { w: 10, h: 1 });
    e.objet('vigne', 81, y, { w: 10, h: 1 });
  }
  e.zombie('errant', 79.5, 62.5, { etat: 'erre', dir: 0 });   // le vigneron, dans ses rangs

  // ======================= Le bois tout autour =======================
  // des pins d'Alep et des chênes verts, plus clairs vers le vallon ; rien sur la piste, le camp, le pare-feu, le sentier,
  // le mas, la cour et les vignes
  const libre = (x, y) => {
    if (y >= 13 && y <= 23) return false;                                    // la piste et ses bas-côtés
    if (Math.hypot(x - 43, y - 25) < 10.5) return false;                     // le camp
    if (x >= 57 && x <= 65 && y <= 15) return false;                         // le pare-feu
    if (x >= 39 && x <= 51 && y >= 30 && y <= 52) return false;              // le sentier
    if (x >= 37 && x <= 94 && y >= 48 && y <= 79) return false;              // le mas, la cour, les vignes
    return true;
  };
  for (let y = 1; y < H - 1; y += 3) for (let x = 1; x < W - 1; x += 3) {
    const tx = x + Math.floor(r() * 2), ty = y + Math.floor(r() * 2);
    if (!libre(tx, ty) || r() < 0.18) continue;
    const v = r();
    e.objet(v < 0.62 ? 'pin' : v < 0.86 ? 'chene_vert' : v < 0.93 ? 'romarin' : 'buisson', tx, ty);
  }
  // dehors, tout le bois est d'un seul tenant : une seule zone, un seul nom (le camp, la cour, les vignes en font partie)
  e.nommer(20, 40, 'Le bois de la Barben', { exterieur: true });

  // ======================= Entrées =======================
  e.entree('fourgon', 44, 18);
  e.entree('defaut', 44, 18);
});
