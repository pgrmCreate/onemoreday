// ============ Marcher sans carte — les tronçons (données) ============
// Sans carte en poche, on ne choisit pas une destination sur une feuille : on part à pied par un côté de la carte, rue
// après rue (js/travel/errance.js). Ce fichier donne ce que le personnage peut RECONNAÎTRE en chemin.
//
//   REPERES   ce qu'on aperçoit d'un lieu de loin, droit devant, de jour et par temps clair (clocher, rocher, enseigne…).
//   IMPASSES  les culs-de-sac des rues latérales : de vraies barrières (armée, chantier, canal, voie ferrée, maquis).
//   TRACES    ce que d'autres survivants ont laissé sur les murs, près d'un lieu : des indications et un peu d'histoire.
//   ERRANCE   les réglages : longueur des tronçons, temps compté à chaque rue, danger.

export const ERRANCE = {
  M_PAR_CELLULE: { salon: 400, region: 2500 },
  CELLULES: { salon: [1, 3], region: [2, 3] },
  M_PAR_MIN: 75,                 // marche prudente, sans carte : 4,5 km/h
  MIN_MARCHE_CELLULE: 2,         // ce que coûte déjà la traversée à pied d'une cellule (ôté du temps compté)
  DANGER: { salon: 0.4, region: 0.3 },
  MORTS: { salon: [1, 3], region: [0, 2] },
  POOL: ['errant', 'errant', 'errant', 'rampant'],
};

// Ce qu'on reconnaît de loin (sujet d’une phrase : « Droit devant, au loin, tu reconnais … »).
export const REPERES = {
  tour_horloge: 'le campanile de fer de la Tour de l’Horloge',
  place_crousillat: 'le gros champignon de mousse de la Fontaine Moussue',
  emperi: 'les remparts de l’Empéri, sur leur rocher',
  saint_michel: 'le clocher à arcades de Saint-Michel',
  saint_laurent: 'la tour carrée de la collégiale Saint-Laurent',
  hotel_de_ville: 'la façade claire de l’hôtel de ville et ses drapeaux',
  nostradamus: 'les toits serrés de la vieille ville, autour de la maison de Nostradamus',
  cimetiere: 'la rangée de cyprès du cimetière Saint-Roch',
  gare: 'les caténaires de la gare, au-dessus des toits',
  hopital: 'les étages blancs de l’hôpital',
  canourgues: 'les grandes tours des Canourgues',
  leclerc: 'l’enseigne du Leclerc, plantée sur son mât',
  intermarche: 'l’enseigne de l’Intermarché, au bout de l’avenue',
  cineplanet: 'le cube noir du cinéma',
  ba701: 'les hangars de la base aérienne',
  chaine_cotes: 'la crête boisée de la chaîne des Côtes',
  pelissanne: 'le clocher de Pélissanne',
  grans: 'le clocher de Grans, au-dessus des platanes',
  lancon: 'le vieux château de Lançon, sur sa colline',
  touloubre: 'le rideau de peupliers qui suit la Touloubre',
  crau_coussouls: 'la plaine rase de la Crau, à perte de vue',
  aerodrome: 'la manche à air de l’aérodrome',
  la_barben: 'le château de la Barben, accroché à son rocher',
  cornillon: 'le village perché de Cornillon',
  miramas_le_vieux: 'le village fortifié de Miramas-le-Vieux',
};

// Les culs-de-sac : nom du lieu, ce qui barre la route (dessin), et la phrase qu'on lit en arrivant.
export const IMPASSES = {
  salon: [
    { id: 'barrage', nom: 'Une rue barrée', obstacle: 'barriere',
      texte: 'Des blocs de béton et des rouleaux de barbelé ferment la rue d’un trottoir à l’autre : l’armée a bouclé le quartier. Il faut revenir sur tes pas.' },
    { id: 'chantier', nom: 'Un chantier clôturé', obstacle: 'grille',
      texte: 'Une palissade de chantier coupe la rue, et derrière, la tranchée est pleine d’eau noire. Tu ne passeras pas par là.' },
    { id: 'canal', nom: 'Le bord du canal', obstacle: 'eau',
      texte: 'La rue finit au bord du canal de Craponne. La passerelle s’est effondrée dans l’eau, et le courant est trop fort pour traverser.' },
  ],
  region: [
    { id: 'voie_ferree', nom: 'La voie ferrée', obstacle: 'grille',
      texte: 'Le chemin bute contre la voie ferrée, derrière un grillage de deux mètres surmonté de barbelé. Il faut faire demi-tour.' },
    { id: 'canal_edf', nom: 'Le canal EDF', obstacle: 'eau',
      texte: 'Le chemin s’arrête devant le canal EDF, un grand fossé de béton où l’eau file sans bruit. Personne ne traverse ça à la nage.' },
    { id: 'maquis', nom: 'Le maquis', obstacle: 'roncier',
      texte: 'Le sentier se perd dans un maquis de chênes kermès et de ronces, si serré que tu n’y avances plus. Tu reviens sur tes pas.' },
  ],
};

// Ce que d'autres ont écrit sur les murs. doc : id dans js/data/histoire/documents.js ; pres : la trace est dans la
// première rue qui part de ce lieu (vers son voisin le plus proche).
export const TRACES = [
  { doc: 'doc_trace_emperi', pres: 'emperi' },
  { doc: 'doc_trace_horloge', pres: 'tour_horloge' },
  { doc: 'doc_trace_gare', pres: 'gare' },
  { doc: 'doc_trace_hopital', pres: 'hopital' },
  { doc: 'doc_trace_route', pres: 'pelissanne' },
];
