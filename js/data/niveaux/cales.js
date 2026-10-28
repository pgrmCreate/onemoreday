// Grottes de Calès, Lamanon — un refuge VIVANT du monde : des familles de Lamanon dans les grottes troglodytiques.
// Réel : cirque entre deux falaises de safre, 116 grottes creusées (58 habitats troglodytiques XIIe-XVe s.), escaliers
// taillés, niches à pigeons, sentier depuis le village ; le canal de Craponne passe au pied du village (martelière).
// En une phrase : une vingtaine d'habitants de Lamanon sont montés dans les grottes le lendemain du Mercredi, avec leurs
// matelas et leurs réserves ; on monte les voir par l'échelle de corde et l'escalier taillé, on repart quand on veut.
// Pourquoi ils sont vivants : la falaise, une échelle qu'on remonte la nuit, un escalier taillé étroit, un guetteur sur
// la corniche haute, des règles écrites dans la grande salle. Tout cela se voit.
// Plan : « bas » = village (église, maisons, canal et martelière, passerelle) et cirque (échelle de corde + escalier
// taillé vers la 1re corniche) ; « n1 » = corniche : infirmerie, grande salle (≈ 13 × 11, bancs, feu), grotte du conseil
// (carte, réserves), grotte du puits derrière sa grille de jardin ; « n2 » = dortoirs, niche du fond, poste du guetteur ;
// « sommet » = plateau de chênes kermès et l’antenne. Le vide au sud des corniches = la falaise.
// Peuplement : 2 errants dans le village, rien dans les grottes (refuge habité, pièces sansMorts) ; un figurant à une
// ou deux répliques dans chaque grotte habitée.
// Format : le plan reste dessiné en ASCII (sans abords générés : un lieu hors de la ville, P1), puis les vivants, les feux
// et les règles sont posés avec l'API à couches (l'ancien format ne sait pas porter de figurants : le validateur,
// js/explore/niveau.js, les prendrait pour des PNJ inconnus).
import { asciiVersPlan } from '../../carte/ascii.js';

const ASCII = {
  id: 'cales', nom: 'Grottes de Calès', exterieur: true, version: 1,   // version 1 : sans abords générés, des vivants dans les grottes
  sansSanitaires: ['L’église de Lamanon', 'Le garage', 'La grande salle', 'La grotte du conseil', 'La grotte du puits', 'Le grand dortoir', 'Le dortoir des familles', 'La niche du fond', 'Le poste du guetteur', 'L’infirmerie'],   // pas de toilettes, et c'est normal : l'église, le garage et le campement troglodyte (les latrines sont dehors, au fond du cirque) (tools/verifier_realisme.mjs)
  typeButin: 'grotte', pool: ['errant', 'rampant', 'putrefie', 'rampant'], morts: { n: [0, 1] }, solDefaut: 'terre',
  etages: [
    { id: 'bas', nom: 'Lamanon et le cirque', monte: 'n1', descend: null, plan: [
      '##################################,,,,,,,,,,,,,,,,,,,,,,,,,,',
      '##################################,,,,,,,,,,,,,,,,,,,,,,,,,,',
      '##################################,,,,,#####|#####,,########',
      '##################################,,,,,#....e....#,,#kkf...#',
      '##################################,,,,,#.........#,,#......#',
      '##################################,,,,,#nnn...nnn#,,+.tt.b.#',
      '##################################,,,,,|.........|,,####.b.#',
      '##################################,,,,,#nnn...nnn#,,#q.+..w#',
      '##################################,,,,,#.........#,,####|###',
      '##################################,,,,,#.%.......#,,,,,,,,,,',
      '##################################,,,,,#####+#####,,,,,,,,,,',
      '##################################,,,,,,,,,,,,,,,,,,,,,,,,,,',
      '##################################,,,,,,,,,,,,,,,,,,###|####',
      '##################################,v,,,,,,T,,,,,,,,,#aakkf.#',
      '##################################,v,,,,,,,,,,,,,,,,#......#',
      '##################################,,,,,,,,,,,,,,,,,,#.t..bb#',
      '##################################,,,,,,,Z,,,,,,,,,,+.c....#',
      '##################################,,,,,,,,,,,,,,,,,,#...#+##',
      '##################################,,,,,,,,,,,,,,,,,,#s.w#.q#',
      '##################################,,,,,,,,,,,,,,,,,,########',
      '####""""%"""""""""""""""""""""""""#,,,,,,,,,,,,,,,,,,,,,,,,,',
      '####""""""""<"""""""""""""<"""""""#,,,,,,,,,,,,,,,,,,,,,,,,E',
      '####"""""""""""""""""""""""""o""""#,,,,,,,,,,,,T,,,o,,,,,,,E',
      '####""T""""""""""T"""""""T""""""""#,,,,,,,,,,,,,,,,,,,,,,,,E',
      '####""""""""""""""""""""""""""""""#,,,,,,,,,,,,,,Z,,,,,,@,,E',
      '####""""T"""""""""""""""""x"""""""#,;,,,,,,,,,,,,,,,,,,,,,,E',
      '#####"""""""""::::::::""""""""""""#,,,,,,,,,,,,,,,,,,,,,,,,E',
      '####""""::::::::::::::::::::::::::/,,,,,,,,,,,,,,,,,,,,,,,,E',
      '####"""xx""""""""""""T""""""""""""#,,,Vx,,,,,,,,,,,,,,,,,,,,',
      '####""""""""""""""""""""""""""""""#~~~~~~~~~,,~~~~~~~~~~~~~~',
      '####"""T""""""T"""""""""""""""""""#~~~~~~~~~,,~~~~~~~~~~~~~~',
      '####""""""""""""""""""""""""""""""#,,,,,,,,,,,,,,,,,,,,,,,,,',
      '####"#"""""""""""""""""""""""""""##,,,,,,,,,,,,,,,,,,,,,,,,,',
      '####"""""#""""""""""""""""""""#"""#,,,####+#####,,,,,,,,,,,,',
      '##################################,,,,#ss....ss#,,,,,,,,,,,,',
      '##################################,,,,#........#,,,,,,,,,,,,',
      '##################################,,,,#vv......#,,,,,,,,,,,,',
      '##################################,,,,#vv....gg#,,,,,,,,,,,,',
      '##################################,,,,#........#,,,,,,,,,,,,',
      '##################################,,,,##########,,EEEEEEEEE,',
    ] },
    { id: 'n1', nom: 'La première corniche', monte: 'n2', descend: 'bas', plan: [
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '##################ss.........FF#############################',
      '##################.............#############################',
      '##################.nnnn...nnnn.#############################',
      '##################.............#############################',
      '##################.............##ss....s####################',
      '######b.b.b.b.b###.nnnn...nnnn.##.......###P.....###########',
      '######b.b.b.b.b###.............##.gg....###......###########',
      '######.........###tt.....J.....##.g.....###......###########',
      '######ss.......###R............##.......###......###########',
      '######.........###.c...........##.......###......###########',
      '######.c...t...###.............##.t...ss###b.....###########',
      '######w......ss#######/####/#####.c.....###b.....###########',
      '####,#####/#####,,,,,,,,,,,,,,,,####/####,###G####,#########',
      '####,,,,,,,,>,,,,,,,,,,,,,>,,,,,,,,,,,<,,,,,,,,,,,,#########',
      '####,,,,x,,,,,,,,,,o,,,,,,,,,,,,,,,,,,x,,,,,,,,,,,,#########',
      '####,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
      '####                                               #########',
    ] },
    { id: 'n2', nom: 'La corniche haute', monte: 'sommet', descend: 'n1', plan: [
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '############################################################',
      '###########b.b.b.b.b.###b.b.b.b.############################',
      '###########b.b.b.b.b.###b.b.b.b.############################',
      '###########..........###........###b...#####################',
      '###########b.b...b.b.###b.b.b.b.###b...#####################',
      '###########b.b...b.b.###b.b.b.b.###....#####################',
      '###########a........s###........###..s.#####################',
      '###########..c....o..###t.....s.###....#####c....###########',
      '###############/######,#####/####,###/##,,,#.....|##########',
      '##########,,,,,,,,,,<,,,,,,,,,,,,,,,,,>,,,,/.nn..###########',
      '##########,,,,,,,,,,,x,,,,,,,,,,,,,,,,x,,,,#.o...|##########',
      '##########,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,###|#############',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
      '##########                                        ##########',
    ] },
    { id: 'sommet', nom: 'Le plateau', monte: null, descend: 'n2', plan: [
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""',
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""T"""""',
      '"""""""""""""""""""""""""""""""""""""""""""""T""""""T"""H"""',
      '""""""""""""""""""T"""""""""""""""""""""""""""""""""""""""""',
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""',
      '"""""""""""""""T""""""""""""""""""""""""""""""H"T"""""T""H""',
      '"""""""""""""""""H"""""""""""x"x""""""""""T"H"""""""""""""""',
      '"""""""""""""""T"""T""""""""""""""""""""""""""""""""""""""""',
      '""""""""""""""""""""""""""""""A""""""T"H"""""""""""""""T""T"',
      '"""""""""""""""""T"""""""""""""g"""""""""""""""""""TH"""T"""',
      '"""""""""T""T""""H"""""""""""x"x""""""T"""""""""T"""""""""""',
      '"T"T""""""""""""""""""""""""""""""""""T""H"""""""""""H""""""',
      '""""""""H"""""T"TT""""""""""T"""""T""""""""""TH""""""""""T""',
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""',
      '"T"""H"""""""""""H""""""""""""""""""""""""""""""T"""""""""""',
      '"""""""""""""""""""""""""""""""""""""""""T""H"""""""H"""""""',
      '""""""""""H"""""""""""""""""""""""""""""""""""""""""""""""""',
      '""""""T"""""T""""""""""""""""""""""T""""""""""""""""""""""""',
      '"""""T"""""""""""""""""""""""H""T""""""H"""""""""""T""""""H"',
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""',
      '"""""""":::::::::::::::::::::::::::::::::::::::::::::"""""""',
      '""""""""::::::::::::>::::::::::::::::::::::::::::::::"""""""',
      '"""""""":::::::::::::::::::::::::::::::::::::%:::::::"""""""',
      '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
      '                                                            ',
    ] },
  ],
  pieces: [
    { etage: 'bas', x: 54, y: 7, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'bas', x: 57, y: 18, nom: 'Les toilettes', sol: 'carrelage', sombre: 1 },
    { etage: 'bas', x: 18, y: 30, nom: 'Le cirque de Calès', sol: 'terre' },
    { etage: 'bas', x: 40, y: 20, nom: 'Lamanon', sol: 'bitume' },
    { etage: 'bas', x: 44, y: 8, nom: 'L’église de Lamanon', sol: 'tomettes', sombre: 1 },
    { etage: 'bas', x: 55, y: 5, nom: 'Une maison', sol: 'tomettes', sombre: 1 },
    { etage: 'bas', x: 55, y: 17, nom: 'La maison du canal', sol: 'tomettes', sombre: 1 },
    { etage: 'bas', x: 44, y: 36, nom: 'Le garage', sol: 'beton', sombre: 1 },
    { etage: 'n1', x: 20, y: 21, nom: 'La corniche', sol: 'terre', sansMorts: true },
    { etage: 'n1', x: 10, y: 16, nom: 'L’infirmerie', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n1', x: 24, y: 13, nom: 'La grande salle', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n1', x: 36, y: 17, nom: 'La grotte du conseil', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n1', x: 46, y: 15, nom: 'La grotte du puits', sol: 'terre', sombre: 2, sansMorts: true },
    { etage: 'n2', x: 25, y: 21, nom: 'La corniche haute', sol: 'terre', sansMorts: true },
    { etage: 'n2', x: 15, y: 16, nom: 'Le grand dortoir', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n2', x: 27, y: 16, nom: 'Le dortoir des familles', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n2', x: 37, y: 16, nom: 'La niche du fond', sol: 'terre', sombre: 1, sansMorts: true },
    { etage: 'n2', x: 46, y: 20, nom: 'Le poste du guetteur', sol: 'terre', sansMorts: true },
    { etage: 'sommet', x: 30, y: 12, nom: 'Le plateau', sol: 'terre', sansMorts: true },
  ],
  legende: {
    'V': { prop: 'machine', nom: 'la martelière', conteneur: false },
    'e': { prop: 'autel', nom: 'l’autel' },
    'Z': { zombie: 'errant', etat: 'erre' },
    'G': { porte: true, nom: 'la grille de jardin' },
    'F': { prop: 'cheminee', nom: 'le feu', conteneur: false },
    'R': { prop: 'table', nom: 'le poste radio', conteneur: false },
    'J': { prop: 'cheminee', nom: 'le foyer', conteneur: false },
    'P': { prop: 'fontaine', nom: 'le puits', conteneur: false },
    'H': { prop: 'haie', nom: 'les chênes kermès' },
    'A': { prop: 'pilier', nom: 'l’antenne' },
  },
  declencheurs: [
  ],
};

// ======================= Les vivants de Calès (API à couches, par-dessus le plan ASCII) =======================
const P = asciiVersPlan(ASCII, (m) => console.warn(`[cales] ${m}`));
P.meta.refuge = {};                                               // habité, toujours : aucun mort ne reste dans les grottes
const DX = 0, DY = 0;                                             // (décalage du plan dessiné, si un jour on lui rend des abords)
const etage = (id) => P.etages.find(e => e.id === id);
const n1 = etage('n1'), n2 = etage('n2');
// des silhouettes de villageois (couleurs, coiffures) ; un enfant est plus petit
const S = {
  vieille: { manteau: '#5a4a52', pantalon: '#2e2a2c', cheveux: '#c8c4bc', coiffure: 'long' },
  pere: { manteau: '#3f4a3a', pantalon: '#2c2a26', cheveux: '#2a1c12', coiffure: 'court' },
  mere: { manteau: '#7a4a3a', pantalon: '#26282e', cheveux: '#4a2e1a', coiffure: 'long' },
  ado: { manteau: '#2c3f66', pantalon: '#22262c', cheveux: '#1a1410', coiffure: 'court' },
  enfant: { manteau: '#a0502a', pantalon: '#2a3440', cheveux: '#6b4a2a', coiffure: 'court', taille: 0.72 },
  infirmiere: { manteau: '#8a9aa6', pantalon: '#2a3036', cheveux: '#3a2a1a', coiffure: 'long' },
  guetteur: { manteau: '#4a4a3a', pantalon: '#2a2622', cheveux: '#5a5048', coiffure: 'court' },
};
const fig = (et, id, x, y, nom, style, dir, repliques) => et.pnj(id, x + DX, y + DY, { nom, style, dir, repliques });

// --- 1re corniche : la grande salle (le feu, la radio, les règles), l'infirmerie, le conseil, le puits ---
n1.lumiere('feu', 30 + DX, 8.6 + DY);
n1.lumiere('braises', 25.5 + DX, 15.5 + DY);
n1.lumiere('lanterne', 10.5 + DX, 15.5 + DY, { r: 4.5, i: 0.7 });
n1.lumiere('lanterne', 36.5 + DX, 14.5 + DY, { r: 4, i: 0.65 });
n1.lumiere('lanterne', 46 + DX, 14.5 + DY, { r: 3.5, i: 0.6 });
n1.objet('caisson', 20 + DX, 9 + DY, { nom: 'la planche des règles', conteneur: false,
  message: 'Une planche peinte à la main : « La nuit, l’échelle reste en haut. On fait bouillir l’eau du puits. On partage tout. Les morts, on les brûle en bas. »' });
fig(n1, 'cal_gisele', 28, 9, 'Gisèle', S.vieille, Math.PI / 2, [
  'J’ai quatre-vingt-un ans, et c’est la troisième fois que je dors dans ces grottes. La première, c’était en 44.',
  'Le feu ne s’éteint jamais. C’est la seule règle que je fais respecter moi-même.']);
fig(n1, 'cal_remi', 24, 12, 'Rémi', S.pere, Math.PI / 2, [
  'On est montés le jeudi matin, avec les matelas sur les épaules. Le village, on le regarde d’en haut.',
  'Le pont de Mallemort ? À pied, par la plaine, avec les petits et les anciens ? Non. On reste ici.']);
fig(n1, 'cal_lucie', 26, 14, 'Lucie', S.enfant, -Math.PI / 2, [
  'Tu as vu le chien du boulanger ? Il est resté en bas. Papa dit qu’il se débrouille.',
  'Je sais monter l’échelle sans les mains. Presque.']);
fig(n1, 'cal_arnaud', 19, 16, 'Arnaud', S.pere, Math.PI, [
  'La radio capte l’armée certains soirs. Un pont sur la Durance, une heure, à l’aube. Ça revient en boucle.',
  'Les piles, c’est ce qui nous manque le plus. Plus que le pain.']);
fig(n1, 'cal_martine', 12, 17, 'Martine', S.infirmiere, -Math.PI / 2, [
  'J’étais infirmière à domicile, à Lamanon. Maintenant, je suis infirmière tout court.',
  'Si tu trouves des antibiotiques, même périmés, apporte-les ici. On en manque toujours.']);
fig(n1, 'cal_fanny', 10, 16, 'Fanny', S.ado, 0, [
  'Je fais bouillir les pansements. Martine dit que c’est le métier qui rentre.']);
fig(n1, 'cal_herve', 35, 15, 'Hervé', S.pere, Math.PI / 2, [
  'Je tiens les comptes : ce qui entre, ce qui sort, qui monte la garde. Ici, rien ne se perd.',
  'On n’a pas fermé la porte aux gens de passage. On leur demande seulement de montrer leurs bras.']);
fig(n1, 'cal_yasmine', 45, 16, 'Yasmine', S.mere, -Math.PI / 2, [
  'Le puits est au fond de la grotte, derrière la grille du jardin. L’eau est froide, et le puits ne tarit pas.']);
fig(n1, 'cal_aurelien', 30, 22, 'Aurélien', S.ado, 0, [
  'Je monte le bois du cirque. Quarante fagots par jour, et l’hiver n’est pas encore là.']);

// --- 2e corniche : les dortoirs, la niche du fond, le guetteur ---
n2.lumiere('lanterne', 16 + DX, 16.5 + DY, { r: 4.5, i: 0.6 });
n2.lumiere('lanterne', 27.5 + DX, 16.5 + DY, { r: 4.5, i: 0.6 });
n2.lumiere('bougie', 36.5 + DX, 16.5 + DY);
fig(n2, 'cal_odette', 16, 15, 'Odette', S.vieille, Math.PI / 2, [
  'Chut. Ceux de la garde de nuit dorment encore.']);
fig(n2, 'cal_timeo', 15, 18, 'Timéo', S.enfant, -Math.PI / 2, [
  'Mon lit, c’est celui du coin. Avant, cette pièce servait de cave à vin, il paraît.']);
fig(n2, 'cal_sandrine', 27, 15, 'Sandrine', S.mere, Math.PI / 2, [
  'Ici, on dort à quatre familles. On s’entend mieux qu’au village, finalement.',
  'Si tu restes pour la nuit, tu prends une couverture dans la caisse, et tu la rends le matin.']);
fig(n2, 'cal_jules', 36, 17, 'Jules', S.ado, Math.PI, [
  'Je lis les livres de la bibliothèque du village, dans l’ordre. J’en suis à la lettre D.']);
fig(n2, 'cal_bruno', 46, 19, 'Bruno', S.guetteur, Math.PI / 2, [
  'D’ici, je vois toute la route de Lamanon. Quand ils montent, on remonte l’échelle.',
  'Les sirènes, la nuit, viennent du côté de Salon. Les morts y vont tous. Tant mieux pour nous.']);

export default {
  id: 'cales', nom: ASCII.nom, exterieur: true, version: ASCII.version, typeButin: ASCII.typeButin, pool: ASCII.pool, morts: ASCII.morts,
  sansSanitaires: ASCII.sansSanitaires, refuge: {},
  format: 'couches', plan: P,
  etages: P.etages.map(e => ({ id: e.id, nom: e.nom, monte: e.monte, descend: e.descend, w: e.w, h: e.h })),
};
