// Miramas — la gare de triage (docs/HISTOIRE.md §4). Cinq voies du faisceau encombrées de wagons (le train 44721 :
// wagons frigorifiques ouverts, wagons couverts) et, sur la voie du milieu, le convoi de wagons-citernes de chlore,
// qu'on traverse par les trouées entre les rames. Au nord, l'atelier de maintenance (une BB 75000 sur la fosse) et le
// bâtiment administratif (bureau, réfectoire, vestiaires). Au sud, le quai de chargement et le poste d'aiguillage :
// le bulletin de composition, la lettre de voiture du convoi (marqueur `lettre_voiture`), le haut-parleur muet.
// Deux états (P2) :
//   - AVANT la frappe (`frappe_faite` absent ; on ne la voit que de loin, à l'acte II) : une foule de morts debout
//     entre les trains, rabattus par le haut-parleur ;
//   - APRÈS la frappe (jour 4 ; on ne vient ici qu'à l'acte V) : des cratères, des wagons calcinés, les citernes
//     éventrées, des dizaines de corps brûlés, et peu de morts debout : le feu en a tué des milliers. La nuit, c'est ici
//     que la brume est la plus épaisse (js/game/brume.js). Seuls les morts changent d'un état à l'autre : le décor
//     montre l'après, le seul que l'on explore.
// Format : le plan reste dessiné en ASCII, sans abords générés (P1) ; l'après de la frappe (cratères, corps, wagons
// calcinés, couleurs) et les morts conditionnels sont posés avec l'API à couches. Version 1 : l'après de la frappe.
import { asciiVersPlan } from '../../carte/ascii.js';

const AVANT = { pasFlag: 'frappe_faite' };
const APRES = { flag: 'frappe_faite' };

const ASCII = {
  id: 'miramas', nom: 'Miramas — gare de triage', exterieur: true, version: 1,
  sansSanitaires: ["Le poste d'aiguillage"],   // pas de toilettes, et c'est normal : le poste d'aiguillage (tools/verifier_realisme.mjs)
  typeButin: 'triage',
  pool: ['errant', 'errant', 'coureur', 'hurleur', 'putrefie', 'enrage', 'chien_infecte'],
  morts: { n: [4, 8] },
  solDefaut: 'beton',
  etages: [
    { id: 'rdc', nom: 'Le triage', monte: null, descend: null, plan: [
      'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'G,,##########||########||########,,,,,,,######||######||######,,,,,,,,,,,,,G',
      'G,,#ss#q#.m..................#a.#,,,,,,,#d.d.s#kkkf....#a.a.a#,,,,,,,,,,,,,G',
      'G,,#ss#.#.m..................#a.#,,,,,,,#.....#........#.....#,,,,,,,,,,,,,G',
      'G,,#..#+#....LLLLLLLLLL......+..#,,,,,,,#..c..+..t..t..+.....#,,,,,,,,,,,,,G',
      'G,,#.........LLLLLLLLLL......#..#,,,,,,,#.....#..tc.tc.#w...w#,,,,,,,,,,,,,G',
      'G,,#.....%...................#w.#,,,,,,,#dd...#........###...#,,,,,,,,,,,,,G',
      'G,,#mm.....................;.####,,,,,,,#s..%.#..t..t..#.+...#,,,,,,,,,,,,,G',
      'G,,#mm.........................s#,,,,,,,#.....#.;......#q#...#,,,,,,,,,,,,,G',
      'G,,#...........g..........ssss.s#,,,,,,,###+#####/#########+##,,,,,,,,,,,,,G',
      'G,,#####/##############/#########,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'E,@,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'E,::::::::Z:::::::::::::::::::::::::::::::::::::::::Z::::::::::::::::::::::G',
      'G:::::WWWWWW:WWWWWW::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G:::::WWWWWW:WWWWWW::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G:::::::::::%:::::::::;:::::Z:::::::::::::::::::::::::::::::%::::::::::::::G',
      'G::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::G',
      'G:::::CCCCC::::::::::CCCCC:CCCCC:::::::CCCCC:CCCCC:::::::CCCCC:CCCCC:::::::G',
      'G:::::CCCCC::::::::::CCCCC:CCCCC:::::::CCCCC:CCCCC:::::::CCCCC:CCCCC:::::::G',
      'G:::::::::::::::::::::::::::::::::::::::::::::Z:::::::::::::::::::::%::::::G',
      'G:::::::::::::::::::::::Z::::::::::::::::::::::::::::::::::::::::::::::::::G',
      'G:WWWWWW:WWWWWW::::::WWWWWW::::WWWWWW::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G:WWWWWW:WWWWWW::::::WWWWWW::::WWWWWW::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G:::::::::::::::::::::::::::::::::::::::::::%::::::::::::::::::Z:::::::::::G',
      'G::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::G',
      'G::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::G',
      'G::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::VVVVVV:VVVVVV:::::G',
      'G::::::::::::::Z::::::::::::::%:::::::::;::::::::::::::::::::::::::::::::::G',
      'G:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::Z::::G',
      'G:::WWWWWW:WWWWWW::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G:::WWWWWW:WWWWWW::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::WWWWWW:WWWWWW:::::G',
      'G::::::::::::::::::::::::::::::::Z::::::::::::::::::::::::;::::::::::::::::G',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,E',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,E',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,##||||||||||##,,,,,,PP,,PP,,PP,,PP,,,,,,,,,,,G',
      'G,,,UUUUU,,,vvv,,,,,,,,,,,,,,,#mmmmmmmmmm..#,,,,,,,,,,,,,,,,,,,,,,vvv,,,,,,G',
      'G,,,UUUUU,,,vvv,,,,,,,,,,,,,,,#......d.....#,,,K,,,,,,,,,,,,,,,,,,vvv,,,,,,G',
      'G,,,,,,,,,,,,,,,,,,,Z,,,,,,,,,#.D..c.....s.#,,,,,,PP,,PP,,,,,,,,,,,,,,,,,,,G',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#..........s.#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,######/#######,,,,,,,,,,,,Z,,,,,,,,,,,,,,,,,,G',
      'G,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,G',
      'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    ] },
  ],
  pieces: [
    { etage: 'rdc', x: 56, y: 8, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 7, y: 4, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 2, y: 12, nom: 'Le triage de Miramas', sol: 'beton' },
    { etage: 'rdc', x: 6, y: 6, nom: 'L\'atelier de maintenance', sol: 'beton', sombre: 1 },
    { etage: 'rdc', x: 30, y: 5, nom: 'Le vestiaire des cheminots', sol: 'carrelage', sombre: 2 },
    { etage: 'rdc', x: 43, y: 4, nom: 'Le bureau du chef de triage', sol: 'lino' },
    { etage: 'rdc', x: 51, y: 5, nom: 'Le réfectoire', sol: 'carrelage' },
    { etage: 'rdc', x: 58, y: 5, nom: 'Les vestiaires', sol: 'carrelage', sombre: 1 },
    { etage: 'rdc', x: 36, y: 38, nom: 'Le poste d\'aiguillage', sol: 'lino' },
  ],
  legende: {
    'G': { prop: 'grille', nom: 'le grillage' },
    'L': { prop: 'conteneur', nom: 'la locomotive BB 75000', categorie: 'machine' },
    'W': { prop: 'conteneur', nom: 'le wagon frigorifique', categorie: 'voiture' },
    'V': { prop: 'conteneur', nom: 'le wagon couvert', categorie: 'voiture' },
    'C': { prop: 'conteneur', nom: 'le wagon-citerne de chlore', conteneur: false },   // éventré : plaques orange « 268 / 1017 »
    'U': { comme: 'v', nom: 'le camion' },
    'P': { prop: 'palette' },
    'K': { zombie: 'chien_infecte', etat: 'dort' },
    'D': { document: 'doc_triage', nom: 'le bulletin de composition' },
    'Z': { zombie: 'errant', etat: 'erre', si: AVANT },             // avant la frappe seulement
  },
};

// ======================= L'après de la frappe (API à couches, par-dessus le plan ASCII) =======================
const P = asciiVersPlan(ASCII, (m) => console.warn(`[miramas] ${m}`));
const e = P.etages[0];
const car = (x, y) => (x >= 0 && y >= 0 && x < e.w && y < e.h ? e.car[y * e.w + x] : '#');
const occupe = new Set();
const libre = (x, y) => car(x, y) === ':' && !occupe.has(x + ',' + y);
const poser = (type, x, y, o = {}) => { if (!libre(x, y)) return false; occupe.add(x + ',' + y); e.objet(type, x, y, o); return true; };

// --- les wagons du milieu du faisceau ont brûlé ; les citernes sont noircies et éventrées ---
for (const o of e.objets) {
  if (o.type !== 'conteneur') continue;
  if (o.nom === 'le wagon-citerne de chlore') { o.variante = 1; continue; }
  if (o.x >= 30 && o.x <= 52 && o.y >= 14 && o.y <= 27) Object.assign(o, { nom: 'le wagon calciné', conteneur: false, variante: 1 });
}
for (const o of e.objets.filter(o => o.nom === 'le wagon-citerne de chlore')) {
  e.decal('cendres', o.x + 2.5, o.y + 1, { r: 1.6 });
  e.decal('fissure', o.x + 1.5, o.y + 2.4, { r: 0.8 });
  poser('debris', o.x + 1, o.y + 2); poser('debris', o.x + 3, o.y - 1);
}

// --- les cratères : de la cendre, des fissures, un anneau de gravats, des débris au fond ---
for (const [cx, cy] of [[35.5, 20.5], [53.5, 16.5], [17.5, 24.5], [60.5, 28.5], [24.5, 32.5]]) {
  e.decal('cendres', cx, cy, { r: 2.4 }); e.decal('fissure', cx - 1, cy + 0.5, { r: 1.2 }); e.decal('fissure', cx + 1.2, cy - 0.6, { r: 1 });
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; poser('gravats', Math.floor(cx + Math.cos(a) * 2.2), Math.floor(cy + Math.sin(a) * 1.6)); }
  poser('debris', Math.floor(cx), Math.floor(cy)); poser('debris', Math.floor(cx) + 1, Math.floor(cy));
}

// --- les corps brûlés : des dizaines, entre les rames ---
let n = 0;
for (let essai = 0; essai < 900 && n < 48; essai++) {
  const x = 2 + Math.floor(e.rng() * 72), y = 13 + Math.floor(e.rng() * 20);
  if (poser('cadavre', x, y, { nom: 'un corps brûlé' })) { n++; if (n % 4 === 0) e.decal('cendres', x + 0.5, y + 0.5, { r: 0.7 }); }
}

// --- les morts ---
// avant la frappe : la foule entre les trains, debout, tournée vers le poste d'aiguillage et son haut-parleur
let m = 0;
for (let essai = 0; essai < 900 && m < 40; essai++) {
  const x = 2 + Math.floor(e.rng() * 72), y = 13 + Math.floor(e.rng() * 20);
  if (!libre(x, y)) continue;
  occupe.add(x + ',' + y);
  e.zombie(m % 6 === 0 ? 'putrefie' : 'errant', x, y, { etat: 'immobile', dir: Math.PI / 2, si: AVANT }); m++;
}
// après : peu de morts debout, des brûlés qui rampent
for (const [type, x, y, etat] of [['rampant', 12, 17, 'erre'], ['rampant', 44, 21, 'erre'], ['putrefie', 58, 25, 'erre'],
  ['errant', 27, 29, 'erre'], ['errant', 66, 13, 'erre'], ['rampant', 37, 32, 'erre']]) e.zombie(type, x, y, { etat, si: APRES });

// --- le poste d'aiguillage : la lettre de voiture du convoi, le haut-parleur muet ---
e.marqueur('lettre_voiture', 38, 38, { nom: 'la lettre de voiture' });
e.objet('poteau', 29, 36, { nom: 'le haut-parleur du poste, muet depuis la frappe' });

export default {
  id: 'miramas', nom: ASCII.nom, exterieur: true, version: ASCII.version, typeButin: ASCII.typeButin, pool: ASCII.pool, morts: ASCII.morts,
  sansSanitaires: ASCII.sansSanitaires,
  format: 'couches', plan: P,
  etages: P.etages.map(et => ({ id: et.id, nom: et.nom, monte: et.monte, descend: et.descend, w: et.w, h: et.h })),
};
