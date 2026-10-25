// Grans — la grand-rue, le pont sur la Touloubre et, au bord de l'eau, le vieux moulin dont le meunier, Édouard,
// 80 ans, a remis la roue en marche. Sur la berge d'en face, les morts en rang la regardent tourner (immobiles tant qu'on
// ne les dérange pas) ; pendant ce temps, ils ne regardent pas ses fenêtres. Il cache chez lui ceux qui frappent
// doucement : à l'acte V, Karine et Noa (marqueur `karine_gra`, scène gra_karine), si elles se sont perdues par là.
// Ouverts : l'épicerie-boulangerie (fournil, réserve), une maison, le moulin (le logement du meunier, la salle des
// meules ; la lettre est sur la table), le bar du Cercle sur la place. Sorties : ouest (Salon) et est (Miramas).
// Pourquoi ils sont vivants : la roue qui attire les morts sur l'autre rive, deux portes que le meunier tient fermées.
// Format : le plan reste dessiné en ASCII (sans abords générés : un village hors de la ville, P1), puis le moulin est
// habité avec l'API à couches (le validateur, js/explore/niveau.js, refuse les figurants dans l'ancien format).
import { asciiVersPlan } from '../../carte/ascii.js';

// Karine et Noa sont chez le meunier tant qu'on ne les a pas ramenées (même condition que karine_gra, pnj.js)
const CACHEES = { flag: 'pont_annonce', pasFlag: ['noa_avec', 'familles_parties', 'famille_cornillon'] };

const ASCII = {
  id: 'grans', nom: 'Grans', exterieur: true, version: 1,   // version 1 : sans abords, le logement du meunier habité
  typeButin: 'village',
  pool: ['errant', 'errant', 'rampant', 'coureur'],
  morts: { n: [2, 5] },
  etages: [
    { id: 'rdc', nom: 'Le village', monte: null, descend: null, plan: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T""""""""""""""""""""""""",""""""""""""""~~~"""""""""""""""T',
      'T""""""""""""""""""""""""",""""""""""""""~~~""""T""""""""""T',
      'T"########################,##############~~~"Y""""""T""""""T',
      'T"#FF..kk#ssss.##b.a#w..h#,#b...a#q.+.mm#RR~"""Y"""""""""""T',
      'T"#FF....#.....##b..#....#,#.....####.mm|RR~"Y""""vvv"""T""T',
      'T"#......+..ss.##...+...q#,#.....+......#RR~""""""vvv""""""T',
      'T"#m..f..#..ss.####+######,#kk.fw#....ss#~~~"Y"""""""""""""T',
      'T"#......#.....##pp......#,#.....#..;.ss#~~~"""Y"""""""""""T',
      'T"###+####.....##....t...#,#tcD..#......#~~~"Y"""""""""""""T',
      'T"#o.....#.....##k...tc..#,#tc...#g.....#~~~"""""""""""""""T',
      'T"#o..#+##rrg..##kf......#,#.....#......#~~~""""""T""""T"""T',
      'T"#...#.q#..%..##....%...#,###/######/###~~~"""""""""""""""T',
      'T"###||###|/|######/##||##,""""""""""""""~~~"""""""""""""""T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,~~~,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,vvv,,,,,,,,,,,,,;,,,,~~~,,,,,,,,,,vvv,,T',
      'T,,,,,,,,,,,,,,,,,,,vvv,,,,,,,,,,,,,,,,,,HHH,,,,,,,,,,vvv,,T',
      'E,@,,,,,vvv,,,,,,,,,,,,,,,,,,%,,,,,,,,,,,,,,,,,vvv,,,,,,,,,E',
      'E,,,,,,,vvv,,,,Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,vvv,,Z,,,,,,E',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,HHH,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,",,,,,,,,,,,,,,,,,,"~~~"""""""""""""""T',
      'T"###||#/#||########"",T,,,,,,T,,,,,,,T,"~~~"""""""""""""""T',
      'T"#rrrrr....#kk.f..#"",,,,,,,,,,,,,,,,,,"~~~"""""""""""""""T',
      'T"#g........#......#"",,,,,n,,,,,,n,,,,,"~~~"""T"""""""T"""T',
      'T"#.........+..o...#"",,,,,,,,,,,,,vvv,,"~~~"""""""""""""""T',
      'T"#.t.t..t..#......#"",,,,,,,,OO,,,vvv,,"~~~"""""""T"""""""T',
      'T"#.c.c..c..######+#"",,,%,,,,OO,Z,,,,,,"~~~""""""""""Z""""T',
      'T"#.........#wq#ss.#"",,,,,,,,,,,,,,,,,,"~~~"""""""""""""""T',
      'T"#.t.t..t..+..#...#"",,,,,n,,,,,,n,,,,,"~~~"""""""""""""T"T',
      'T"#.c.c.%c..#..#..s#"",T,,,,,,,,,,,,,,T,"~~~""""T""""""""""T',
      'T"##################"",,,,,,,,,,,,,,,,,,"~~~"""""""""T"""""T',
      'T""""""""""""""""""""""""""""""""""""""""~~~"""""""""""""""T',
      'T"""""""""%"""""""""T""""""""""""""""""""~~~"""""""""""""""T',
      'T"""""""""""T"""""""""""""""""T""""""""""~~~"""""""""""""""T',
      'T""""""""""""""""""""""""""""""""""""""""~~~"""""""""""""""T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ] },
  ],
  pieces: [
    { etage: 'rdc', x: 7, y: 12, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 35, y: 4, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 6, y: 17, nom: 'La grand-rue', sol: 'bitume' },
    { etage: 'rdc', x: 5, y: 5, nom: 'Le fournil', sol: 'tomettes', sombre: 1 },
    { etage: 'rdc', x: 11, y: 9, nom: 'L\'épicerie-boulangerie', sol: 'carrelage' },
    { etage: 'rdc', x: 4, y: 11, nom: 'La réserve du fournil', sol: 'beton', sombre: 2 },
    { etage: 'rdc', x: 18, y: 5, nom: 'La chambre', sol: 'parquet', sombre: 1 },
    { etage: 'rdc', x: 22, y: 5, nom: 'La salle d\'eau', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 20, y: 11, nom: 'La salle commune', sol: 'tomettes' },
    { etage: 'rdc', x: 30, y: 5, nom: 'Le logement du meunier', sol: 'tomettes', sombre: 1, sansMorts: true },
    { etage: 'rdc', x: 36, y: 7, nom: 'La salle des meules', sol: 'paves' },
    { etage: 'rdc', x: 6, y: 23, nom: 'Le Cercle', sol: 'carrelage' },
    { etage: 'rdc', x: 14, y: 24, nom: 'La cuisine du Cercle', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 13, y: 28, nom: 'Les toilettes', sol: 'carrelage', sombre: 2 },
    { etage: 'rdc', x: 16, y: 28, nom: 'La cave du Cercle', sol: 'beton', sombre: 2 },
  ],
  legende: {
    'F': { comme: 'm', nom: 'le four à pain' },
    'R': { comme: 'm', nom: 'la roue du moulin', conteneur: false },
    'O': { prop: 'fontaine' },
    'H': { prop: 'barriere', nom: 'le parapet' },
    'Y': { zombie: 'errant', etat: 'immobile' },
    'D': { document: 'doc_grans', nom: 'la lettre' },
  },
};

// ======================= Le logement du meunier, habité (API à couches) =======================
const P = asciiVersPlan(ASCII, (m) => console.warn(`[grans] ${m}`));
P.meta.refuge = {};                            // Édouard y vit : on y dort en sûreté, aucun mort n'y reste
const e = P.etages[0];
// ses deux portes (la rue, la salle des meules) : gardées, elles se referment derrière toi
for (const [x, y, nom] of [[30, 12, 'la porte du meunier'], [33, 6, 'la porte de la salle des meules']]) {
  const pd = e.portes.get(y * e.w + x);
  if (pd) Object.assign(pd, { nom, gardee: {} });
}
e.objet('matelas', 32, 9, { nom: 'le matelas de Karine' });
e.lumiere('bougie', 30.5, 9.5);
e.decal('papiers', 31.3, 9.4, { n: 2 });
// Karine (conditions dans js/data/histoire/pnj.js), Édouard le meunier, et Noa couchée dans le lit, fiévreuse
e.pnj('karine_gra', 31, 8, { marqueur: 'karine_gra' });
e.pnj('gra_meunier', 29, 6, { nom: 'Édouard, le meunier', dir: Math.PI / 2,
  style: { manteau: '#5a5040', pantalon: '#2e2a24', cheveux: '#d8d4cc', coiffure: 'court' },
  repliques: ['J’ai quatre-vingts ans, et ce moulin en a trois cents. Il tient mieux que moi.',
    'La roue tourne jour et nuit. Les morts vont la regarder sur l’autre berge, et pendant ce temps, ils ne regardent pas mes fenêtres.',
    'Je cache qui frappe doucement. Ceux qui cognent, je les laisse dehors.'] });
e.pnj('gra_noa', 28, 4, { nom: 'Noa', si: CACHEES, dir: Math.PI / 2,
  style: { manteau: '#c8a0b0', pantalon: '#3a3440', cheveux: '#3a2414', coiffure: 'long', taille: 0.7 },
  repliques: ['Maman dit qu’il ne faut pas faire de bruit.', 'J’ai chaud et j’ai froid en même temps. C’est bizarre.'] });

export default {
  id: 'grans', nom: ASCII.nom, exterieur: true, version: ASCII.version, typeButin: ASCII.typeButin, pool: ASCII.pool, morts: ASCII.morts,
  refuge: {},
  format: 'couches', plan: P,
  etages: P.etages.map(et => ({ id: et.id, nom: et.nom, monte: et.monte, descend: et.descend, w: et.w, h: et.h })),
};
