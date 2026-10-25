// Lançon — la barrière de péage de l'A7, jamais levée. Sept voies de voitures à l'arrêt, portières ouvertes (toutes
// fouillables) ; on circule dans les allées entre les files. Une seule barrière a été arrachée (voie 4). Au nord, le
// bâtiment d'exploitation et la boutique de l'aire (pompes) ; au sud, l'aire de repos et ses sanitaires. Certains morts
// assis dans les files font les morts. Le ticket de péage traîne dans une allée. Sorties : aire de repos (sud) et A7 (est).
// Acte V : dans la voie 4, juste avant la barrière arrachée, le camion bâché de Rudy, à sec ; Rudy à côté (marqueur
// `rudy_lan`, scène lan_rudy) et, contre la cabine, le corps de Yohan.
// Format : le plan reste dessiné en ASCII, sans abords générés (un péage d'autoroute, hors de la ville : P1) ; le corps
// de Yohan est posé avec l'API à couches (l'ancien format ne sait pas nommer un objet de décor).
// Version 1 : le camion de Rudy, plus d'abords.
import { asciiVersPlan } from '../../carte/ascii.js';

const ASCII = {
  id: 'lancon', nom: 'Lançon — péage de l\'A7', exterieur: true, version: 1,
  sansSanitaires: ['La salle des caisses'],   // pas de toilettes, et c'est normal : les cabines de péage (les toilettes sont à la boutique de l'aire) (tools/verifier_realisme.mjs)
  typeButin: 'route',
  pool: ['errant', 'errant', 'coureur', 'enrage', 'hurleur'],
  morts: { n: [4, 7] },
  solDefaut: 'bitume',
  etages: [
    { id: 'rdc', nom: 'Le péage', monte: null, descend: null, plan: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T,,########################,,,,,,,,,,,,,,,,,,,##################,,,,,,,T',
      'T,,#dd..s.#g.ss#kkk.f##a.a#,,,,,,,,,,,,,,,,,,,#ffff.....#ssss#q#,,,,,,,T',
      'T,,#d.....#....#....#q#q..#,,,,,P,P,P,,,,,,,,,#.........#....#.#,,,,,,,T',
      'T,,#......#..%.#.tt.+.#...#,,,,,,,,,,,,,,,,,,,#.ss..ss..+..ss#+#,,,,,,,T',
      'T,,#..c.#+#....#.tt.c##w.w#,,,,,,,,,,,,,,,,,,,#.ss..ss..#..ss..#,,,,,,,T',
      'T,,#....#.#....#......#...#,,,,,P,P,P,,,,,,,,,#.........#......#,,,,,,,T',
      'T,,#....#q#....#.p....#...#,,,,,,,,,,,,,,,,,,,#rrrg.....#.;....#,,,,,,,T',
      'T,,###+#######+#####+###+##,,,,,,,,,,,,,,,,,,,####/###||####+###,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'THHHH,,HHHHHHHHHHH,,HHHHHHHHHHH,,HHHHHHHHHHH,,HHHHHHHHHHH,,HHHHHHHHHHH,T',
      'T,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,Z,,,,,,,,,,,,,,,,,,,,,,,,Z,,,,,,,,,,,,,,%,CC,,,,,,,,,,,,,,,,,T',
      'T,vvv,UUUUU,vvv,vvv,vvv,,,vvv,vvv,,,vvv,UUUUU,vvv,,,B,,,,,,,vvv,,,,,,,,T',
      'T,vvv,UUUUU,vvv,vvv,vvv,,,vvv,vvv,,,vvv,UUUUU,vvv,,,B,,,,,,,vvv,,,,,,,,T',
      'T,,,,;,,,,,,,,,,,,,,,,,,Z,,,,,,,,,,,,,,,,,,,,,,,Z,,,CC,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,vvv,UUUUU,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,B,,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,vvv,UUUUU,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,B,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,%,,,,,,,,Q,,,,,,D,,,,,,,,Z,,,,,,,,,,,,,CC,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,vvv,vvv,vvv,vvv,UUUUU,vvv,vvv,vvv,vvvKKKK,;,,,,,,,,,,,,,,,,,,E',
      'T,vvv,vvv,vvv,vvv,vvv,vvv,UUUUU,vvv,vvv,vvv,vvvKKKK,;,,,,,,,,,,,,,,,,,,E',
      'T,,,,,,,,,,,,,,,,,Z,,,,,,,,,,,,,,;,,,,,,,,,,,,%,,,J,CC,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,,,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,,,B,,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,,,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,,,B,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,;,,,,,,,,,,,%,,,,,,,,,Q,,,,,,Z,,,,,,,CC,,,,,,,,,,,,,,,,,T',
      'T,vvv,vvv,vvv,vvv,vvv,UUUUU,,,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,vvv,,,,,,,,T',
      'T,vvv,vvv,vvv,vvv,vvv,UUUUU,,,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,vvv,,,,,,,,T',
      'T,,,,,,,,,,,Q,,,,,,,,,,,,,,,,,Z,,,,,,,,,,%,,,,,,,,,,CC,,,,,,,,,,,,,,,,,T',
      'T,,,UUUUU,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,,,,,,,,,,,,T',
      'T,,,UUUUU,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,vvv,,,B,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,Z,,,,,,,,,,,,,%,,,,,,,,,,,,,,,,,,,,,;,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'THH,,HHHHHHHHH,,HHHHHHHHH,,HHHHHHHHH,,HHHHHHHHH,,HHHHHHHHH,,HHHHHHHHH,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,############,,T,,,,,,,,,,,,,,,,,,,,,,,,,,,T,,,,,,,,,,T',
      'T,,T,,,,,,,,,,,,,,#w.wq#w.w.q#,,,,,,ntn,,,,,ntn,,,,,ntn,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,#....#.....#,,,,,,,,,,,,,,,,,,,,,,,,,,T,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,T,,,,#o...#...%.#,,,,T,,,,,,T,,,,,,T,,,,,,,,,vvv,,,T,,,,,,T',
      'T,,,,,@,,,,,,,,,,,###/###/####,,,,,,,,,,,,,,,,Z,,,,,,,,,,,vvv,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'TTTTTTEETTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ] },
  ],
  pieces: [
    { etage: 'rdc', x: 9, y: 7, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 62, y: 4, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 60, y: 21, nom: 'Le péage de Lançon', sol: 'bitume' },
    { etage: 'rdc', x: 5, y: 5, nom: 'Le bureau du chef de péage', sol: 'lino' },
    { etage: 'rdc', x: 12, y: 5, nom: 'La salle des caisses', sol: 'lino', sombre: 1 },
    { etage: 'rdc', x: 18, y: 4, nom: 'La salle de repos', sol: 'carrelage' },
    { etage: 'rdc', x: 21, y: 5, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 24, y: 7, nom: 'Les vestiaires', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 50, y: 5, nom: 'La boutique de l\'aire', sol: 'carrelage' },
    { etage: 'rdc', x: 59, y: 4, nom: 'La réserve de la boutique', sol: 'beton', sombre: 1 },
    { etage: 'rdc', x: 20, y: 37, nom: 'Les toilettes (hommes)', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 26, y: 37, nom: 'Les toilettes (femmes)', sol: 'carrelage', sombre: 1 },
  ],
  legende: {
    'U': { comme: 'v', nom: 'le camping-car' },
    'B': { prop: 'barriere', nom: 'la barrière du péage' },
    'C': { comme: 'r', nom: 'la cabine de péage' },
    'H': { prop: 'barriere', nom: 'la glissière' },
    'P': { comme: 'm', nom: 'la pompe à essence', conteneur: { nom: 'la pompe à essence', items: [{ id: 'essence', qty: 1 }], table: null } },
    'Q': { zombie: 'errant', etat: 'fait_le_mort' },
    'D': { document: 'doc_lancon', nom: 'le ticket de péage' },
    // le camion de Rudy (un porteur bâché, réservoir vide), Rudy, Yohan
    'K': { prop: 'camionnette', nom: 'le camion de Rudy', conteneur: false },
    'J': { pnj: 'rudy_lan', marqueur: 'rudy_lan' },
  },
};

const P = asciiVersPlan(ASCII, (m) => console.warn(`[lancon] ${m}`));
const e = P.etages[0];
// Yohan : mordu, mort, attaché dans la cabine, sur le siège passager (la scène lan_rudy le raconte ; on ne le voit pas d'ici)
e.decal('flaque_sang', 51.4, 22.6, { r: 0.45 });

export default {
  id: 'lancon', nom: ASCII.nom, exterieur: true, version: ASCII.version, typeButin: ASCII.typeButin, pool: ASCII.pool, morts: ASCII.morts,
  sansSanitaires: ASCII.sansSanitaires,
  format: 'couches', plan: P,
  etages: P.etages.map(et => ({ id: et.id, nom: et.nom, monte: et.monte, descend: et.descend, w: et.w, h: et.h })),
};
