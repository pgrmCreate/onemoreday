// ============ LES SIRÈNES — les « ruées » (le rabattage de l'armée) ============
// Pourquoi : avant Cautère, l'armée RABAT les morts vers le sud. Elle a pris la main sur le réseau des sirènes
// d'alerte (celles qui sonnaient à midi le premier mercredi du mois) et fait passer des drones à haut-parleurs.
// Quand une zone hurle, tous les morts qui l'entendent se lèvent et COURENT vers le bruit, pendant un jour ou deux :
// la zone devient un abattoir. Ceux des collines, eux, descendent vers le bruit : la nature se vide.
// Il faut donc sortir — monter dans la chaîne des Côtes, s'enfoncer dans la Crau, suivre la Touloubre — et TENIR.
//
// Le moteur : js/game/ruees.js (état du monde, annonces, quête), js/explore/sim.js (les morts courent, d'autres
// arrivent), js/travel/rencontres_voyage.js (les routes de la zone grouillent). Nombres : REGLAGES.ruees.
//
//   zone  'salon'    toute la feuille de la ville ;
//         'villages' les villages, la base, l'aérodrome, le triage, les routes du pays salonais.
//   Les lieux de NATURE (type 'nature', ruines, grottes) ne hurlent jamais : on y tient.

// Les sirènes écrites par l'histoire (une seule fois chacune). `si` : condition (js/game/conditions.js) ;
// delaiH : heures entre l'annonce et les premières sirènes ; dureeH : combien de temps la zone hurle.
// annonce : drapeau posé à l'annonce (un déclencheur 'flag' joue la scène) ; quete : quête suivie (debut → tenir → fin).
export const RUEES_HISTOIRE = [
  // Chapitre 1 : la radio de Vidal, une fois essayée, capte l'armée en clair (scène ru_salon_annonce).
  { id: 'salon_1', zone: 'salon', si: { flag: 'radio_essayee', pasFlag: 'troupeau_passe' }, delaiH: 16, dureeH: 30,
    annonce: 'ruee_annonce_salon_1', quete: 'q_sirenes' },
  // Chapitre 2 : sur la fréquence 4, l'armée annonce le rabattage de la plaine (scène ru_plaine_annonce).
  { id: 'plaine_1', zone: 'villages', si: { quete: ['q_traversee', 'ba701'] }, delaiH: 10, dureeH: 30,
    annonce: 'ruee_annonce_plaine_1', quete: 'q_sirenes_plaine' },
];

// Jamais de sirènes à ces moments-là (la nuit des sonnailles, le siège, le final).
export const SANS_RUEE = [
  { quete: ['q_protocole', 'sonnailles'] }, { quete: ['q_protocole', 'siege'] },
  { flag: 'mistral_leve' },
];

export const ZONES_RUEE = {
  salon: { nom: 'Salon', dans: 'sur Salon', types: null },
  villages: { nom: 'les villages de la plaine', dans: 'sur la plaine et les villages',
    types: ['village', 'base', 'aerodrome', 'triage', 'route', 'usine', 'zoo'] },
};

// Ce que dit la radio (une radio portable et des piles dans le sac) quelques heures avant. {quand} : « demain à 6 h »…
export const RADIO_RUEE = {
  salon: [
    '« … opération de rabattage sonore sur l’agglomération salonaise, {quand}. Réseau d’alerte et vecteurs aériens. Durée estimée : plus d’une journée. Toute personne encore présente dans la zone… » Le reste se perd dans le souffle.',
    'Une voix d’homme, fatiguée, lit une liste de codes. Puis, en clair : « Rabattage Salon, {quand}. Confirmez les sirènes du centre et de la zone nord. » Quelqu’un répond « Reçu ». Personne ne parle des vivants.',
    '« Ici Jo, à Calès. Si quelqu’un m’entend à Salon : ils vont faire hurler la ville {quand}. Sortez. Montez dans les collines, et ne redescendez pas avant que ça se taise. »',
  ],
  villages: [
    '« … rabattage de la plaine : Pélissanne, Lamanon, Eyguières, Grans, les axes de la RN 113. {quand}. Les vecteurs aériens remonteront vers le nord. » Puis un sifflement, et plus rien.',
    'Sur la fréquence 4, la voix calme d’une femme : « Phase deux du rabattage {quand}. Les villages de la plaine. Restez à l’écart des bourgs et des routes. » Elle répète deux fois, comme pour quelqu’un qui note.',
  ],
};

// Sans radio : ce qu'on remarque un peu avant (dans la zone, ou en la regardant de loin).
export const SIGNES_RUEE = {
  salon: 'Au-dessus des toits, un drone passe très haut, puis un deuxième. Partout autour, les morts ont cessé de bouger : ils écoutent.',
  villages: 'Vers la plaine, un bourdonnement de drones va et vient. Les morts lèvent la tête, tous dans la même direction.',
};
export const DEBUT_RUEE = {
  salon: 'Les sirènes hurlent sur Salon. Toutes en même temps, une longue note qui monte et ne redescend pas. Les morts se mettent à courir.',
  villages: 'Les sirènes hurlent sur la plaine. De village en village, la même note longue ; sur les routes, les morts courent vers le bruit.',
};
export const FIN_RUEE = {
  salon: 'Les sirènes se sont tues sur Salon. Le silence qui suit est presque pire. Les morts ralentissent, s’arrêtent où ils sont.',
  villages: 'Les sirènes se sont tues sur la plaine. Les morts restent là où le bruit les a laissés, hagards.',
};
// Journal (première personne, sans accord).
export const JOURNAL_RUEE = {
  annonce: 'La radio annonce des sirènes {dans}, {quand}. Quand ça hurle, les morts courent tous vers le bruit. Il faudra être loin.',
  debut: 'Les sirènes hurlent {dans}. Ne pas y aller. Tenir dehors, dans les collines, le temps que ça passe.',
  fin: 'Les sirènes se sont tues {dans}. On peut redescendre, prudemment : il y a plus de morts qu’avant, et ils sont partout.',
};
