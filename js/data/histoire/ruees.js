// ============ LES SIRÈNES — les « ruées » (le rabattage de l'armée) ============
// Pourquoi : l'armée a reculé derrière la Durance et elle RABAT les morts vers des zones de destruction (docs/HISTOIRE.md §4).
// Elle a pris la main sur le réseau des sirènes d'alerte (celles qui sonnaient à midi le premier mercredi du mois) et fait
// passer des drones à haut-parleurs. Quand une zone hurle, tous les morts qui l'entendent se lèvent et COURENT vers le
// bruit, pendant un jour ou deux : la zone devient un abattoir. Ceux des collines, eux, descendent vers le bruit : la
// nature se vide. Il faut donc sortir — monter dans la chaîne des Côtes, s'enfoncer dans la Crau, suivre la Touloubre —
// et TENIR. Les sirènes de l'histoire ne commencent qu'à l'acte V (après l'annonce du pont, drapeau pont_annonce).
//
// Le moteur : js/game/ruees.js (état du monde, annonces, quête), js/explore/sim.js (les morts courent, d'autres
// arrivent), js/travel/rencontres_voyage.js (les routes de la zone grouillent). Nombres : REGLAGES.ruees.
//
//   zone  'salon'    toute la feuille de la ville ;
//         'villages' les villages, la base, l'aérodrome, le triage, les routes du pays salonais.
//   Les lieux de NATURE (type 'nature', ruines, grottes) ne hurlent jamais : on y tient.

// Les sirènes écrites par l'histoire (une seule fois chacune). `si` : condition (js/game/conditions.js) ;
// delaiH : heures entre l'annonce et les premières sirènes ; dureeH : combien de temps la zone hurle.
// annonce : drapeau posé à l'annonce (un déclencheur 'flag' joue la scène ru_*) ; quete : quête suivie (aucune ici).
export const RUEES_HISTOIRE = [
  // Acte V, à partir du jour 8 : un drone annonce les sirènes sur Salon (scène ru_salon_annonce).
  { id: 'salon_1', zone: 'salon', si: { flag: 'pont_annonce', jourMin: 8 }, delaiH: 16, dureeH: 30,
    annonce: 'ruee_annonce_salon_1', quete: null },
  // Acte V, à partir du jour 10 : la phase deux, sur les villages de la plaine (scène ru_plaine_annonce).
  { id: 'plaine_1', zone: 'villages', si: { flag: 'pont_annonce', jourMin: 10 }, delaiH: 10, dureeH: 30,
    annonce: 'ruee_annonce_plaine_1', quete: null },
];

// Jamais de sirènes à ces moments-là : le siège du Refuge, la fuite dans la brume, et après le pont.
export const SANS_RUEE = [
  { pasFlag: 'pont_annonce' },          // ni sirènes ni hordes avant l'acte V : les actes I à IV ont leurs propres sorties forcées
  { quete: ['q_chute', 'siege'] }, { quete: ['q_brume', 'fuir'] },
  { flag: 'pont_fait' },
];
export const PAS_DE_RUEE = SANS_RUEE;   // même liste (nom employé par le cahier des scènes)

export const ZONES_RUEE = {
  salon: { nom: 'Salon', dans: 'sur Salon', types: null },
  villages: { nom: 'les villages de la plaine', dans: 'sur la plaine et les villages',
    types: ['village', 'base', 'aerodrome', 'triage', 'route', 'usine', 'zoo'] },
};

// Ce que dit la radio (une radio portable et des piles dans le sac) quelques heures avant. {quand} : « demain à 6 h »…
export const RADIO_RUEE = {
  salon: [
    '« … opération de rabattage sonore sur l’agglomération salonaise, {quand}. Déclenchement des sirènes et survol de drones. Durée estimée : plus d’une journée. Toute personne encore présente dans la zone… » Le reste se perd dans les grésillements.',
    'Une voix d’homme, fatiguée, lit une liste de codes. Puis, en clair : « Rabattage Salon, {quand}. Confirmez les sirènes du centre et de la zone nord. » Quelqu’un répond « Reçu ». Personne ne parle des vivants.',
    '« Ici Lamanon, sur la fréquence des radioamateurs. Si quelqu’un m’entend à Salon : ils vont faire hurler la ville {quand}. Sortez. Montez dans les collines, et ne redescendez pas avant que ça se taise. »',
  ],
  villages: [
    '« … rabattage de la plaine : Pélissanne, Lamanon, Eyguières, Grans, les axes de la nationale. {quand}. Les drones remonteront vers le nord. » Puis un sifflement, et plus rien.',
    'Sur la fréquence de l’armée, la voix calme d’une femme : « Phase deux du rabattage {quand}. Les villages de la plaine. Restez à l’écart des bourgs et des routes. » Elle répète deux fois, comme pour quelqu’un qui note.',
  ],
};

// Sans radio : ce qu'on remarque un peu avant (dans la zone, ou en la regardant de loin).
export const SIGNES_RUEE = {
  salon: 'Au-dessus des toits, un drone passe très haut, puis un deuxième. Partout autour, les morts ont cessé de bouger : ils écoutent.',
  villages: 'Vers la plaine, un bourdonnement de drones va et vient. Les morts lèvent la tête, tous dans la même direction.',
};
export const DEBUT_RUEE = {
  salon: 'Les sirènes hurlent sur Salon, toutes en même temps, d’une longue note qui monte et ne redescend pas. Les morts se mettent à courir.',
  villages: 'Les sirènes hurlent sur la plaine. De village en village, c’est la même note longue, et sur les routes, les morts courent vers le bruit.',
};
export const FIN_RUEE = {
  salon: 'Les sirènes se sont tues sur Salon. Le silence qui suit est presque pire : les morts ralentissent et s’arrêtent là où ils sont.',
  villages: 'Les sirènes se sont tues sur la plaine. Les morts restent hagards, là où le bruit les a laissés.',
};
// Journal (première personne, sans accord).
export const JOURNAL_RUEE = {
  annonce: 'La radio annonce des sirènes {dans}, {quand}. Quand ça hurle, les morts courent tous vers le bruit. Il faudra être loin.',
  debut: 'Les sirènes hurlent {dans}. Ne pas y aller. Tenir dehors, dans les collines, le temps que ça passe.',
  fin: 'Les sirènes se sont tues {dans}. On peut redescendre, prudemment : il y a plus de morts qu’avant, et ils sont partout.',
};

// ─────────── Les HORDES de passage : une colonne de morts traverse un lieu (un village, un quartier, ta base) ───────────
// Une radio les annonce (les guetteurs des collines, les drones de l'armée) ; sans radio, on les entend arriver… tard.
export const RADIO_HORDE = [
  '« Ici les grottes de Calès. Nos guetteurs, sur la falaise, ont vu une colonne de morts, deux cents peut-être, ou plus. Ils vont vers {lieu}, et ils y seront {quand}. Si vous êtes là-bas, partez. »',
  'Une voix militaire, monocorde : « Contact. Groupe d’éléments, effectif estimé deux cents, axe {lieu}. Arrivée estimée {quand}. Pas d’engagement. » Un bip, puis des grésillements.',
  '« … quelqu’un m’entend ? Je suis sur la route. Il y en a plein la route, ils descendent tous vers {lieu}. Ils y seront {quand}, je pense. Je me cache. Je me cache. »',
];
export const SIGNES_HORDE = 'Au loin, un grondement de voix monte, de plus en plus près. Il n’y a pas qu’un mort : ils sont des centaines.';
export const DEBUT_HORDE = 'La horde arrive sur {lieu}. Les rues se remplissent de morts qui marchent tous dans le même sens.';
export const FIN_HORDE = 'La horde a quitté {lieu}. Il en reste derrière elle, accrochés aux portes.';
export const JOURNAL_HORDE = {
  annonce: 'La radio annonce une horde vers {lieu}, {quand}. Ne pas y être.',
  debut: 'Une horde traverse {lieu}.',
  fin: 'La horde est passée sur {lieu}. Il en reste.',
};

// ─────────── La MÉTÉO à la radio : le bulletin de la veille (France Bleu tourne en boucle sur un groupe électrogène) ───────────
// Annoncé une heure avant que le temps change (5 h et 17 h) : de quoi rentrer, s'abriter, faire du feu.
// Depuis la frappe, le mistral et la pluie chassent la brume jaune : ces bulletins-là sont aussi de bonnes nouvelles.
export const METEO_RADIO = {
  pluie: 'Le bulletin enregistré, toujours le même présentateur : « … averses en fin de période sur le pays salonais. » Il pleuvra bientôt : mets-toi à l’abri, au sec. La pluie, au moins, dissipe la brume.',
  orage: '« … vigilance orange orages sur les Bouches-du-Rhône : pluies intenses, rafales, grêle par endroits. » Un gros orage arrive. Trouve un toit.',
  mistral: '« … mistral fort, rafales à cent kilomètres-heure dans la vallée du Rhône et sur la Crau. » Le vent va se lever : il couvrira le bruit de tes pas et te glacera jusqu’aux os, mais tant qu’il soufflera, la brume ne restera pas.',
  brouillard: '« … brouillards denses en plaine au lever du jour, visibilité réduite. » On ne verra rien venir.',
};
