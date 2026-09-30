// ============================================================================
//  ZONES DE DANGER — ce que traverse un voyage (Temps 2)
// ============================================================================
// Cercles géographiques RÉELS (lat/lon WGS84, rayon en mètres). Le voyage échantillonne
// l'itinéraire (tous les 50 m en ville, 250 m en région, cf. reglages.voyage.RENCONTRES) :
// le danger d'un point = MAX des zones qui le contiennent (même échelle), sinon DANGER_DEFAUT.
// Le pool de la zone la plus dangereuse sert aux rencontres de combat « du pool » (renforts, co-op),
// filtré par zombies[id].jourMin. Les rencontres (rencontres.js) peuvent se restreindre à des zones.
//
//   id, nom, echelle ('salon' | 'region'), centre { lat, lon }, rayon_m, danger 0..1, pool [ids], desc
// Positions : relevées sur les lieux géocodés de js/data/lieux.js et le tracé réel des routes.
// ============================================================================

export const ZONES = [
  // ─────────────────────────── SALON (feuille de la ville) ───────────────────────────
  {
    id: 'centre_ancien', nom: 'Le centre ancien', echelle: 'salon',
    centre: { lat: 43.64130, lon: 5.09710 }, rayon_m: 230, danger: 0.45,
    pool: ['errant', 'errant', 'errant', 'rampant', 'coureur', 'hurleur'],
    desc: 'Ruelles de pierre, portes cochères, la Tour de l\'Horloge. On s\'y est réfugié les premiers jours. Ceux qui s\'y sont réfugiés y sont encore.',
  },
  {
    id: 'cours', nom: 'Les cours', echelle: 'salon',
    centre: { lat: 43.64110, lon: 5.09650 }, rayon_m: 430, danger: 0.4,
    pool: ['errant', 'errant', 'coureur', 'rampant'],
    desc: 'Le cours Carnot, le cours Pelletan, le cours Victor-Hugo : l\'anneau de platanes autour du vieux Salon. Des voitures en travers, des terrasses renversées.',
  },
  {
    id: 'place_morgan', nom: 'Place Morgan', echelle: 'salon',
    centre: { lat: 43.63850, lon: 5.09440 }, rayon_m: 220, danger: 0.5,
    pool: ['errant', 'errant', 'coureur', 'putrefie', 'gonfleur'],
    desc: 'Le cinéma, le supermarché, le parking. Là où tout le monde est venu faire ses courses le dernier jour.',
  },
  {
    id: 'gare_salon', nom: 'Le quartier de la gare', echelle: 'salon',
    centre: { lat: 43.63910, lon: 5.08840 }, rayon_m: 270, danger: 0.55,
    pool: ['errant', 'errant', 'coureur', 'hurleur', 'chien_infecte'],
    desc: 'On attendait des trains d\'évacuation. Ils ne sont pas venus. La foule, elle, n\'est pas repartie.',
  },
  {
    id: 'hopital_zone', nom: 'Les abords de l\'hôpital', echelle: 'salon',
    centre: { lat: 43.64030, lon: 5.10330 }, rayon_m: 290, danger: 0.75,
    pool: ['errant', 'putrefie', 'putrefie', 'coureur', 'gonfleur', 'enrage'],
    desc: 'Des ambulances en file jusqu\'au rond-point, portes ouvertes. Les brancards sont vides. Leurs occupants marchent.',
  },
  {
    id: 'lycee_quartier', nom: 'Le lycée Adam-de-Craponne', echelle: 'salon',
    centre: { lat: 43.63525, lon: 5.09775 }, rayon_m: 220, danger: 0.5,
    pool: ['errant', 'coureur', 'coureur', 'hurleur'],
    desc: 'Des sacs à dos abandonnés sur le parvis. Ils étaient jeunes, ils courent vite.',
  },
  {
    id: 'cimetiere_zone', nom: 'Saint-Roch', echelle: 'salon',
    centre: { lat: 43.63687, lon: 5.09466 }, rayon_m: 170, danger: 0.35,
    pool: ['errant', 'putrefie', 'rampant'],
    desc: 'Les grilles du cimetière sont fermées. Ça n\'a pas empêché le cimetière de se remplir de l\'intérieur.',
  },
  {
    id: 'canourgues_zone', nom: 'Les Canourgues', echelle: 'salon',
    centre: { lat: 43.65202, lon: 5.10027 }, rayon_m: 450, danger: 0.6,
    pool: ['errant', 'errant', 'coureur', 'chien_infecte', 'hurleur', 'enrage'],
    desc: 'Les barres d\'immeubles au nord. Mille fenêtres, et derrière chacune, peut-être quelqu\'un qui te regarde passer.',
  },
  {
    id: 'nord_commissariat', nom: 'Le quartier du commissariat', echelle: 'salon',
    centre: { lat: 43.65428, lon: 5.09799 }, rayon_m: 260, danger: 0.5,
    pool: ['errant', 'errant', 'coureur', 'colosse'],
    desc: 'Un barrage de police abandonné, des barrières Vauban, des fourgons. Les CRS sont restés à leur poste.',
  },
  {
    id: 'gandonne', nom: 'La Gandonne', echelle: 'salon',
    centre: { lat: 43.63142, lon: 5.09709 }, rayon_m: 380, danger: 0.4,
    pool: ['errant', 'errant', 'rampant', 'coureur'],
    desc: 'Hangars, parkings, enseignes éteintes. Du matériel partout, et de la place pour se faire encercler.',
  },
  {
    id: 'viougues', nom: 'Les Viougues', echelle: 'salon',
    centre: { lat: 43.62853, lon: 5.11606 }, rayon_m: 520, danger: 0.6,
    pool: ['errant', 'errant', 'coureur', 'gonfleur', 'hurleur', 'enrage', 'colosse'],
    desc: 'La zone commerciale du sud-est, l\'hypermarché, la caserne, la gendarmerie. Tout ce qu\'il fallait pour tenir — et tout le monde l\'a su en même temps.',
  },
  {
    id: 'bel_air', nom: 'Bel-Air', echelle: 'salon',
    centre: { lat: 43.63606, lon: 5.07741 }, rayon_m: 420, danger: 0.4,
    pool: ['errant', 'errant', 'putrefie', 'coureur'],
    desc: 'Les pavillons de l\'ouest, les haies de cyprès, l\'Intermarché. Plus calme. Pas calme.',
  },
  {
    id: 'a7_salon', nom: 'L\'A7 à l\'est de la ville', echelle: 'salon',
    centre: { lat: 43.64300, lon: 5.12600 }, rayon_m: 650, danger: 0.55,
    pool: ['errant', 'errant', 'coureur', 'enrage'],
    desc: 'L\'autoroute longe la ville, figée dans l\'exode. Des milliers de voitures, et ceux qui n\'en sont jamais sortis.',
  },
  {
    id: 'colline_nord', nom: 'Les collines du nord', echelle: 'salon',
    centre: { lat: 43.66526, lon: 5.09511 }, rayon_m: 700, danger: 0.15,
    pool: ['errant'],
    desc: 'Pinèdes et chemins de la colline, vers le Mémorial Jean-Moulin. Le mistral dans les pins, et presque personne.',
  },

  // ─────────────────────────── LE PAYS SALONAIS (feuille régionale) ───────────────────────────
  {
    id: 'salon_ville', nom: 'Salon-de-Provence', echelle: 'region',
    centre: { lat: 43.64050, lon: 5.09750 }, rayon_m: 2600, danger: 0.45,
    pool: ['errant', 'errant', 'coureur', 'hurleur', 'rampant'],
    desc: 'La ville elle-même, vue de loin : les sorties bouchées, les ronds-points encombrés.',
  },
  {
    id: 'a7_nord', nom: 'L\'A7 vers Sénas', echelle: 'region',
    centre: { lat: 43.70200, lon: 5.09800 }, rayon_m: 3000, danger: 0.5,
    pool: ['errant', 'errant', 'coureur', 'enrage'],
    desc: 'L\'autoroute du Soleil, direction Lyon. Ils fuyaient vers le nord. Le bouchon commence au péage et ne finit pas.',
  },
  {
    id: 'a7_lancon', nom: 'Le péage de Lançon', echelle: 'region',
    centre: { lat: 43.59131, lon: 5.12586 }, rayon_m: 2200, danger: 0.6,
    pool: ['errant', 'errant', 'coureur', 'enrage', 'hurleur'],
    desc: 'Vingt voies de péage, des barrières baissées, l\'armée qui filtrait. Le filtre a cédé.',
  },
  {
    id: 'a54', nom: 'L\'A54 vers Arles', echelle: 'region',
    centre: { lat: 43.61200, lon: 5.06000 }, rayon_m: 2400, danger: 0.45,
    pool: ['errant', 'errant', 'coureur', 'militaire'],
    desc: 'La voie rapide qui part vers la Crau et la Camargue, entre Salon et Grans. Des camions en portefeuille.',
  },
  {
    id: 'ba701_zone', nom: 'La base aérienne 701', echelle: 'region',
    centre: { lat: 43.60630, lon: 5.10920 }, rayon_m: 1900, danger: 0.8,
    pool: ['militaire', 'militaire', 'errant', 'colosse', 'enrage'],
    desc: 'Les clôtures de l\'École de l\'air, les miradors, les pistes. Ils se sont battus jusqu\'au bout. Ils portent encore l\'uniforme.',
  },
  {
    id: 'crau', nom: 'La plaine de la Crau', echelle: 'region',
    centre: { lat: 43.59000, lon: 4.93000 }, rayon_m: 9000, danger: 0.2,
    pool: ['errant', 'chien_infecte', 'sanglier'],
    desc: 'Le coussoul à perte de vue, les galets, les bergeries. Peu de morts — mais rien pour se cacher, et on te voit venir de loin.',
  },
  {
    id: 'miramas_zone', nom: 'Le triage de Miramas', echelle: 'region',
    centre: { lat: 43.58081, lon: 4.99916 }, rayon_m: 1900, danger: 0.65,
    pool: ['errant', 'errant', 'coureur', 'hurleur', 'putrefie', 'chien_infecte'],
    desc: 'Des kilomètres de voies, des trains de fret à l\'arrêt, des cheminots qui n\'ont pas quitté les ateliers.',
  },
  {
    id: 'istres_zone', nom: 'Istres', echelle: 'region',
    centre: { lat: 43.51391, lon: 4.98843 }, rayon_m: 2600, danger: 0.5,
    pool: ['errant', 'errant', 'coureur', 'militaire', 'hurleur'],
    desc: 'La ville et sa base, au bord de l\'étang de l\'Olivier. De la fumée, certains matins.',
  },
  {
    id: 'saint_chamas_zone', nom: 'Saint-Chamas', echelle: 'region',
    centre: { lat: 43.55265, lon: 5.03126 }, rayon_m: 1600, danger: 0.45,
    pool: ['errant', 'errant', 'putrefie', 'gonfleur'],
    desc: 'Le village troglodyte, le pont Flavien, la vieille Poudrerie au bord de l\'étang.',
  },
  {
    id: 'etang_berre', nom: 'L\'étang de Berre', echelle: 'region',
    centre: { lat: 43.47571, lon: 5.16760 }, rayon_m: 3200, danger: 0.45,
    pool: ['errant', 'errant', 'putrefie', 'gonfleur'],
    desc: 'Les torchères de la raffinerie éteintes, l\'eau grise, l\'odeur de soufre. Les noyés reviennent sur la rive.',
  },
  {
    id: 'la_barben_zone', nom: 'La Barben', echelle: 'region',
    centre: { lat: 43.62597, lon: 5.20839 }, rayon_m: 1600, danger: 0.55,
    pool: ['errant', 'fauve', 'chien_infecte', 'sanglier'],
    desc: 'Le château sur son rocher, le parc animalier en contrebas. Les enclos sont ouverts. Personne ne sait ce qui en est sorti.',
  },
  {
    id: 'pelissanne_zone', nom: 'Pélissanne', echelle: 'region',
    centre: { lat: 43.63067, lon: 5.14967 }, rayon_m: 1200, danger: 0.4,
    pool: ['errant', 'errant', 'coureur', 'chien_infecte'],
    desc: 'Le gros village voisin, ses platanes, sa fontaine. À une heure de marche, un autre monde qui a fini pareil.',
  },
  {
    id: 'durance', nom: 'La Durance', echelle: 'region',
    centre: { lat: 43.74000, lon: 5.13000 }, rayon_m: 4200, danger: 0.35,
    pool: ['errant', 'errant', 'putrefie', 'sanglier'],
    desc: 'La rivière large et grise au nord, les ponts de Mallemort et de Cavaillon, les digues. La frontière du pays.',
  },
  {
    id: 'alpilles', nom: 'Le piémont des Alpilles', echelle: 'region',
    centre: { lat: 43.71000, lon: 4.97000 }, rayon_m: 5000, danger: 0.2,
    pool: ['errant', 'sanglier', 'chien_infecte'],
    desc: 'Oliveraies, garrigue, les crêtes blanches à l\'ouest d\'Eyguières. Des mas isolés, certains encore fermés de l\'intérieur.',
  },
  {
    id: 'costes', nom: 'La chaîne des Côtes', echelle: 'region',
    centre: { lat: 43.68500, lon: 5.14500 }, rayon_m: 4000, danger: 0.2,
    pool: ['errant', 'rampant', 'sanglier'],
    desc: 'Les collines calcaires entre Lamanon, Vernègues et Aurons. Des ruines de 1909, des grottes, le silence.',
  },
  {
    id: 'aerodrome_zone', nom: 'L\'aérodrome', echelle: 'region',
    centre: { lat: 43.65719, lon: 5.01027 }, rayon_m: 1300, danger: 0.4,
    pool: ['errant', 'coureur', 'militaire'],
    desc: 'Des petits avions cloués au sol, une manche à air déchirée. Quelqu\'un a essayé de décoller.',
  },
];

export const ECHELLES = ['salon', 'region'];
export function zone(id) { return ZONES.find(z => z.id === id) || null; }

// Distance approximative (m) entre deux points lat/lon (équirectangulaire — suffisant à cette échelle).
export function distanceM(a, b) {
  const R = 6371000, rad = Math.PI / 180;
  const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * R;
}
// Zones contenant un point, pour une échelle donnée.
export function zonesEn(point, echelle) {
  return ZONES.filter(z => z.echelle === echelle && distanceM(point, z.centre) <= z.rayon_m);
}
