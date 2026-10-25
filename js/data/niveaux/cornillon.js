// Cornillon-Confoux — le village perché, au-dessus de la brume : la BASE des survivants à l'acte V (docs/HISTOIRE.md §6).
// Le belvédère à l'ouest (garde-corps, bancs face au vide) : on y voit l'étang, la Crau, la fumée de Salon ; le carnet du
// guetteur est resté sur le muret. L'église Saint-Vincent, la maison du guetteur (sa chambre sert à la mission
// m_guetteur : on n'y touche pas), le bistrot, et LA MAISON DE LA PLACETTE, voisine : c'est là que vivent Inès et ceux
// qu'on retrouve (Karine et Noa, Bastien, Rudy), avec des couchages, une lanterne, une porte gardée. Au sud, la pinède
// que le guetteur abattait seul (troncs couchés). Sortie : la route qui descend (sud).
// Pourquoi ils sont vivants : la hauteur (la brume reste en bas), une seule porte, qui se referme derrière toi.
// Peuplement : aucun mort dans la maison (sansMorts) ; les deux errants de la placette s'en vont quand on s'installe.
// Format : le plan reste dessiné en ASCII (sans abords générés : un village hors de la ville, P1), puis la maison est
// habitée avec l'API à couches (le validateur, js/explore/niveau.js, refuse les figurants dans l'ancien format).
import { asciiVersPlan } from '../../carte/ascii.js';

const HABITEE = { flag: 'cornillon_arrivee', pasFlag: 'colonne_partie' };   // la base, de l'arrivée au départ de la colonne

const ASCII = {
  id: 'cornillon', nom: 'Cornillon-Confoux', exterieur: true, version: 1,   // version 1 : sans abords, la maison de la placette habitée
  sansSanitaires: ["L'église Saint-Vincent"],   // pas de toilettes, et c'est normal : l'église (tools/verifier_realisme.mjs)
  typeButin: 'village',
  pool: ['errant', 'rampant'],
  morts: { n: [1, 3] },
  etages: [
    { id: 'rdc', nom: 'Le village perché', monte: null, descend: null, plan: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T""""""",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,""""""T',
      'T""""""",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,""""T"T',
      'T""""""",,,,,,######||######,,############,,,,,,,""""T"T',
      'T      H,,,,,,#A...........#,,#b.wa#q.#.s#,,,,,,,""""T"T',
      'T      H,,,,,,#............#,,#....##+#..#,,,vvv,"TT"""T',
      'T      H,n,,,,#.nnnn..nnnn.#,,#....+..;..#,,,vvv,"""T""T',
      'T      H,,,,,,#............#,,##+###.....#,,,,,,,TT""T"T',
      'T      H,,,,,,#.nnnn..nnnn.#,,#kk.f#..m..#,,,,,,,T""TT"T',
      'T      H,D,,,,#............|,,#....+.....#,,,,,,,""""""T',
      'T      H,,,,,,#.nnnn..nnnn.#,,#t.c.#ssss.#,,,,,,,""""""T',
      'T      H,n,,,,#.......%....#,,#tc..#.....#,,,,,,,""""""T',
      'T      H,,,,,,######/#######,,###|####/###,,,,,,,""""""T',
      'T      H,,,,,,,,,,,,,,,,OO,,,,,,,,,,,,,,,,,,,,,,,"T"""TT',
      'T      H,,,,,,,,,,,,,,,,OOY,,,,,,,,,,,,,,,,,,,,,,T"T"TTT',
      'T      H,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T""TTTT',
      'T      H,n,,,,#####|#/#|######,,,####/#######,,,,""TTTTT',
      'T      H,,,,,,#rrrr.....#ss#q#,,,#pp...#b.b.#,,,,T""TTTT',
      'T      H,,,,,,#g........#..#.#,,,#.....#....#,,,,T"""""T',
      'T      H,,,,%,#.........+.s#+#,,,#..t..+..a.#,,,,T"""""T',
      'T      H,,,,,,#.t..t..t.#....#,,,#..tc.#....#,Y,,"TT"""T',
      'T      H,n,,,,#.c..c..c.#kkf.#,,,##+####+####,,,,""T""TT',
      'T      H,,,,,,#......%..#....#,,,#k.f..#.w.h#,,,,T"""""T',
      'T      H,,,,,,################,,,#k....#...q#,,,,TT"T""T',
      'T""""""",,,,,,"""""vvv"""""""""""####|#######""""""T"T"T',
      'T""""""",,,,,,,,,,,vvv,,,,,,,,,,,,,,,,,,,,,,,,,,,T"""TTT',
      'T""""""",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,""""""T',
      'T""""""x"""T"T""T""""TT"Tx"T"""""""""""",,""""""""T""""T',
      'T""T"""""T"""T"""T"TT"x""x"T"T"""""""""",,"""""T""""""TT',
      'TT"""""""""xT"""x""x""""TT"""""""x"T%;"",,"""""""T""Tx"T',
      'T"T""""""TTT"""T"""""T"""""""""""""Z"""",,"""""T"""""""T',
      'T""T"T""""""""T"""x""""""x"""""""T"""""",,""""x""""""""T',
      'T""TT"T""""TT"T""TT""""""""""T"""""""""",,""""""T""T"""T',
      'T""""""""""""""""""""""T""""T"T""""TT""",,"""""Z""T""""T',
      'T"""""""""""""""""T"""""""T""""""T"""""",,""""""T"T""""T',
      'T""T"T""""""""T"""""""Z"""""""""T"""T""",,""""T""T""""TT',
      'T"""""TTT"""T"""""TT""""""""T""""""""""",,""T""""""""""T',
      'T"""""""""""""T""T""""""""""""""""T""""",,"""T""T""""""T',
      'T"""T""T"T""""T"""""""""""T"TT""""T""T"",,"""""""""""""T',
      'T"T"""TTT""""""""""""T"""""""""""""""T""@,""T"""T"TT"""T',
      'T""""""TT""""""""""""""""T"TT"""""T""T"",,""""""T"""T""T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTEETTTTTTTTTTTTTT',
    ] },
  ],
  pieces: [
    { etage: 'rdc', x: 37, y: 4, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 28, y: 18, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 10, y: 14, nom: 'Le village perché', sol: 'paves' },
    { etage: 'rdc', x: 20, y: 6, nom: 'L\'église Saint-Vincent', sol: 'paves', sombre: 1 },
    { etage: 'rdc', x: 32, y: 5, nom: 'La chambre du guetteur', sol: 'tomettes', sombre: 1 },
    { etage: 'rdc', x: 38, y: 7, nom: 'L\'atelier du guetteur', sol: 'beton' },
    { etage: 'rdc', x: 34, y: 10, nom: 'La cuisine du guetteur', sol: 'tomettes' },
    { etage: 'rdc', x: 18, y: 19, nom: 'Le bistrot', sol: 'carrelage' },
    { etage: 'rdc', x: 26, y: 18, nom: 'L\'arrière-boutique', sol: 'beton', sombre: 1 },
    { etage: 'rdc', x: 36, y: 18, nom: 'La maison de la placette', sol: 'tomettes', sansMorts: true },
    { etage: 'rdc', x: 42, y: 18, nom: 'La chambre', sol: 'parquet', sombre: 1, sansMorts: true },
    { etage: 'rdc', x: 35, y: 22, nom: 'La cuisine', sol: 'tomettes', sombre: 1, sansMorts: true },
    { etage: 'rdc', x: 41, y: 22, nom: 'La salle de bain', sol: 'carrelage', sombre: 2, sansMorts: true },
  ],
  legende: {
    'A': { prop: 'autel' },
    'O': { prop: 'fontaine' },
    'H': { prop: 'barriere', nom: 'le garde-corps' },
    'D': { document: 'doc_cornillon', nom: 'le carnet' },
    'Y': { zombie: 'errant', etat: 'erre', si: { pasFlag: 'cornillon_arrivee' } },   // ils s'en vont quand on s'installe
  },
};

// ======================= La maison de la placette, habitée (API à couches) =======================
const P = asciiVersPlan(ASCII, (m) => console.warn(`[cornillon] ${m}`));
P.meta.refuge = HABITEE;                       // tant qu'elle est habitée : on y dort en sûreté, aucun mort n'y reste
const e = P.etages[0];
// la porte sur la rue : gardée tant que la maison est habitée (aucun mort ne la passe ; elle se referme derrière toi)
const porte = e.portes.get(16 * e.w + 37);
if (porte) Object.assign(porte, { nom: 'la porte de la maison', gardee: HABITEE });
// les couchages : deux lits et un canapé, plus trois matelas apportés des maisons voisines
e.objet('matelas', 34, 18, { nom: 'un matelas' });
e.objet('matelas', 41, 17, { nom: 'un matelas' });
e.objet('matelas', 43, 17, { nom: 'un matelas' });
// la lumière : une lanterne sur la table, une bougie dans la chambre (volets clos : elle ne se voit pas d'en bas)
e.lumiere('lanterne', 36.5, 19.5, { r: 5, i: 0.75 });
e.lumiere('bougie', 42.5, 18.5);
e.decal('papiers', 37.2, 19.6, { n: 2 });
// les survivants (conditions dans js/data/histoire/pnj.js : pas de `si` ici)
e.pnj('ines_cor', 35, 18, { marqueur: 'ines_cor' });
e.pnj('karine_cor', 42, 18, { marqueur: 'karine_cor' });
e.pnj('bastien_cor', 37, 23, { marqueur: 'bastien_cor' });
e.pnj('rudy_cor', 41, 14, { marqueur: 'rudy_cor' });   // dehors, devant la porte, à surveiller la route
// Noa, couchée dans le lit du coin, tant que sa mère et elle vivent ici
e.pnj('cor_noa', 40, 17, { nom: 'Noa', si: { flag: 'famille_cornillon', pasFlag: 'colonne_partie' }, dir: Math.PI / 2,
  style: { manteau: '#c8a0b0', pantalon: '#3a3440', cheveux: '#3a2414', coiffure: 'long', taille: 0.7 },
  repliques: ['Je ne dors pas. Je fais semblant, pour que maman se repose.', 'Inès m’a montré la radio. On entend des soldats, des fois.', 'Quand on passera le pont, je veux voir la mer de l’autre côté. Il y a une mer, de l’autre côté ?'] });

export default {
  id: 'cornillon', nom: ASCII.nom, exterieur: true, version: ASCII.version, typeButin: ASCII.typeButin, pool: ASCII.pool, morts: ASCII.morts,
  sansSanitaires: ASCII.sansSanitaires, refuge: HABITEE,
  format: 'couches', plan: P,
  etages: P.etages.map(et => ({ id: et.id, nom: et.nom, monte: et.monte, descend: et.descend, w: et.w, h: et.h })),
};
