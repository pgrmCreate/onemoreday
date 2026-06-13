// ============ La banque de sons — paysages sonores par lieu ============
// Chaque carte pointe vers une SCÈNE SONORE : un lit continu (vent + drones),
// des BRUITS PONCTUELS qui surgissent de temps en temps (corbeau, ferraille,
// gémissement au bout du couloir…), et un MOTIF MUSICAL génératif, rare,
// propre à l'endroit. La nuit ajoute ses propres bruits.
// Tout est synthétisé par js/audio.js — les noms de stingers y sont définis.

// Carte → scène sonore. Une carte absente retombe sur carte.ambiance (héritage).
export const CARTE_SCENE = {
  int_hotel: 'hotel',
  q_centre: 'rue', q_cours: 'rue', ville_salon: 'rue',
  int_casino: 'magasin', int_decathlon: 'magasin', int_weldom: 'magasin', int_leclerc: 'magasin',
  int_eglise: 'eglise',
  int_nostradamus: 'musee', int_emperi: 'musee',
  q_gare: 'gare', int_gare: 'gare', q_triage: 'triage',
  int_pharmacie: 'hopital', int_hopital: 'hopital',
  int_commissariat: 'commissariat', int_caserne: 'commissariat',
  int_garage: 'garage',
  int_mediatheque: 'mediatheque',
  int_cineplanet: 'cinema',
  region: 'region',
  q_miramas_vieux: 'village',
  int_refuge: 'refuge',
};

// Héritage : les anciens types passés par les scènes scriptées.
export const SCENES_LEGACY = { calme: 'interieur', rue: 'rue', sombre: 'sombre', train: 'train' };

// vent : [fréquence du filtre, gain, vitesse des rafales]
// drones : [[fréquence, timbre, gain], ...]
// stingers : [[nom, poids], ...] — tirés au sort toutes les intervalle[0..1] secondes
// stingersNuit : s'AJOUTENT au pool la nuit (le monde mort se réveille)
// stingersJour : s'AJOUTENT au pool le jour seulement (cigales, fontaine, mistral du Sud)
// musique — deux formes possibles :
//   { theme: 'titre' }  → thème COMPOSÉ (partition de js/data/musiques.js,
//                         joué en boucle par le séquenceur, avec des silences
//                         de respiration ; variante de nuit automatique si
//                         la partition en déclare une)
//   { base, gamme OU gammes (liste de gammes en demi-tons, tirées au sort),
//     p (chance par cycle), timbre, doux } → motif GÉNÉRATIF du lieu
export const SCENES_SONORES = {
  hotel: {
    vent: [300, 0.10, 0.07],
    drones: [[55, 'triangle', 0.034], [82.5, 'sine', 0.026]],
    stingers: [['craquement', 3], ['vent_rafale', 2], ['volet', 1], ['goutte', 1], ['fontaine', 1]],
    stingersNuit: [['gemissement', 2], ['grattement', 2]],
    stingersJour: [['cigales', 3], ['fontaine', 2]], // place Crousillat, la Fontaine Moussue à deux pas
    intervalle: [9, 24],
    musique: { base: 110, gammes: [[0, 3, 5, 7, 10], [0, 2, 3, 7, 9]], p: 0.55, timbre: 'triangle' },
  },
  interieur: {
    vent: [320, 0.10, 0.07],
    drones: [[55, 'triangle', 0.034], [82.5, 'sine', 0.026]],
    stingers: [['craquement', 3], ['vent_rafale', 1], ['goutte', 1]],
    stingersNuit: [['gemissement', 1], ['grattement', 2]],
    intervalle: [10, 26],
    musique: { theme: 'titre' }, // le générique — joue partout où 'calme' joue (écran titre compris)
  },
  rue: {
    vent: [480, 0.16, 0.07],
    drones: [[49, 'triangle', 0.030], [73.5, 'sine', 0.024]],
    stingers: [['corbeau', 3], ['vent_rafale', 3], ['mistral', 2], ['volet', 2], ['verre', 1], ['ferraille', 1], ['tole', 2], ['klaxon_loin', 1], ['effondrement', 1], ['gemissement', 1], ['chien', 1]],
    stingersNuit: [['gemissement', 3], ['hibou', 1], ['cloche_morte', 1]],
    stingersJour: [['cigales', 3], ['fontaine', 1]],
    intervalle: [7, 18],
    musique: { theme: 'exploration' }, // discret le jour, transposé et ralenti la nuit
  },
  magasin: {
    vent: [260, 0.08, 0.05],
    drones: [[49, 'triangle', 0.032], [98, 'sine', 0.014]],
    stingers: [['ferraille', 3], ['chariot', 2], ['verre', 2], ['rideau_fer', 2], ['tole', 1], ['craquement', 1], ['goutte', 1]],
    stingersNuit: [['grattement', 2], ['gemissement', 1]],
    intervalle: [8, 22],
    musique: { base: 104, gammes: [[0, 3, 5, 8, 10], [0, 3, 7, 8, 10]], p: 0.4, timbre: 'triangle' },
  },
  eglise: {
    vent: [220, 0.07, 0.04],
    drones: [[41.2, 'sine', 0.040], [82.4, 'sine', 0.020], [123.5, 'sine', 0.010]],
    stingers: [['pigeons', 2], ['craquement', 2], ['goutte', 2], ['cloche_morte', 1]],
    stingersNuit: [['gemissement', 1], ['hibou', 1]],
    intervalle: [10, 28],
    musique: { base: 82.4, gammes: [[0, 2, 3, 7, 8], [0, 2, 5, 7, 8]], p: 0.6, timbre: 'sine', doux: true },
  },
  musee: {
    vent: [240, 0.08, 0.05],
    drones: [[55, 'sine', 0.034], [110, 'sine', 0.012]],
    stingers: [['craquement', 4], ['vent_rafale', 1], ['goutte', 1], ['grattement', 1]],
    stingersNuit: [['gemissement', 1], ['grattement', 2]],
    intervalle: [9, 26],
    musique: { base: 92.5, gammes: [[0, 2, 3, 5, 7], [0, 2, 5, 7, 9]], p: 0.5, timbre: 'sine' },
  },
  gare: {
    vent: [520, 0.16, 0.09],
    drones: [[49, 'triangle', 0.032], [65, 'sine', 0.020]],
    stingers: [['ferraille', 3], ['corbeau', 2], ['train_loin', 2], ['goutte', 2], ['volet', 1], ['pigeons', 1], ['tole', 2], ['rideau_fer', 1], ['mistral', 1]],
    stingersNuit: [['gemissement', 2], ['grattement', 1]],
    stingersJour: [['cigales', 2]],
    intervalle: [7, 19],
    musique: { base: 98, gammes: [[0, 3, 5, 7, 10], [0, 3, 5, 6, 10]], p: 0.45, timbre: 'triangle' },
  },
  triage: {
    vent: [560, 0.18, 0.10],
    drones: [[46, 'triangle', 0.034], [69, 'sine', 0.018]],
    stingers: [['ferraille', 4], ['train_loin', 3], ['corbeau', 2], ['vent_rafale', 2], ['mistral', 2], ['tole', 2], ['effondrement', 1], ['gemissement', 1]],
    stingersNuit: [['gemissement', 3], ['hibou', 1]],
    stingersJour: [['cigales', 2]],
    intervalle: [6, 16],
    musique: { base: 87.3, gammes: [[0, 3, 5, 6, 10], [0, 1, 3, 6, 8]], p: 0.45, timbre: 'triangle' },
  },
  hopital: {
    vent: [200, 0.06, 0.04],
    drones: [[58, 'sine', 0.030], [116, 'sine', 0.012]],
    stingers: [['neon', 3], ['goutte', 3], ['ferraille', 1], ['gemissement', 1], ['grattement', 1]],
    stingersNuit: [['gemissement', 3], ['grattement', 2]],
    intervalle: [6, 16],
    musique: { base: 116.5, gammes: [[0, 1, 5, 7, 8], [0, 1, 3, 7, 8]], p: 0.4, timbre: 'sine' },
  },
  commissariat: {
    vent: [240, 0.08, 0.05],
    drones: [[52, 'triangle', 0.032], [78, 'sine', 0.016]],
    stingers: [['radio_statique', 2], ['craquement', 2], ['ferraille', 1], ['goutte', 1], ['volet', 1]],
    stingersNuit: [['gemissement', 2], ['grattement', 1]],
    intervalle: [8, 22],
    musique: { base: 98, gammes: [[0, 3, 5, 7, 10], [0, 1, 5, 7, 8]], p: 0.4, timbre: 'triangle' },
  },
  garage: {
    vent: [300, 0.09, 0.05],
    drones: [[49, 'triangle', 0.032], [98, 'sine', 0.012]],
    stingers: [['goutte', 3], ['ferraille', 3], ['tole', 2], ['rideau_fer', 1], ['craquement', 1], ['chariot', 1]],
    stingersNuit: [['grattement', 2], ['gemissement', 1]],
    intervalle: [7, 20],
    musique: { base: 92.5, gammes: [[0, 3, 5, 7, 10], [0, 3, 5, 8, 10]], p: 0.35, timbre: 'triangle' },
  },
  mediatheque: {
    vent: [230, 0.07, 0.04],
    drones: [[55, 'sine', 0.032], [110, 'sine', 0.010]],
    stingers: [['pages', 3], ['craquement', 2], ['goutte', 1], ['pigeons', 1]],
    stingersNuit: [['grattement', 2], ['gemissement', 1]],
    intervalle: [9, 24],
    musique: { base: 110, gammes: [[0, 2, 5, 7, 9], [0, 2, 4, 7, 9]], p: 0.55, timbre: 'sine', doux: true },
  },
  cinema: {
    vent: [150, 0.05, 0.03],
    drones: [[41.2, 'sine', 0.044], [55, 'sine', 0.020]],
    stingers: [['craquement', 2], ['grattement', 2], ['goutte', 1], ['mouches', 1]],
    stingersNuit: [['gemissement', 2]],
    intervalle: [8, 20],
    musique: { base: 82.4, gammes: [[0, 1, 3, 7, 8], [0, 1, 5, 6, 8]], p: 0.35, timbre: 'sine' },
  },
  region: {
    vent: [640, 0.20, 0.05],
    drones: [[49, 'triangle', 0.026], [73.5, 'sine', 0.018]],
    stingers: [['vent_rafale', 4], ['mistral', 3], ['rapace', 2], ['corbeau', 2], ['branche', 2], ['ferraille', 1], ['chien', 1]],
    stingersNuit: [['hibou', 2], ['gemissement', 1], ['chien', 1]],
    stingersJour: [['cigales', 4]], // la garrigue salonaise en plein cagnard
    intervalle: [8, 20],
    musique: { theme: 'exploration' }, // la route est longue — même thème que la rue
  },
  village: {
    vent: [420, 0.12, 0.05],
    drones: [[65.4, 'triangle', 0.026], [98, 'sine', 0.016]],
    stingers: [['vent_rafale', 2], ['mistral', 2], ['volet', 1], ['pigeons', 2], ['branche', 1], ['cloche_morte', 1], ['chien', 1]],
    stingersNuit: [['hibou', 2], ['feu_crepite', 1]],
    stingersJour: [['cigales', 4], ['fontaine', 1]], // Miramas-le-Vieux perché, ses ruelles écrasées de soleil
    intervalle: [9, 24],
    musique: { base: 130.8, gammes: [[0, 2, 4, 7, 9], [0, 2, 4, 5, 9]], p: 0.65, timbre: 'triangle', doux: true },
  },
  refuge: {
    vent: [200, 0.05, 0.04],
    drones: [[65.4, 'triangle', 0.024], [130.8, 'sine', 0.012]],
    stingers: [['feu_crepite', 5], ['murmures', 2], ['craquement', 1], ['pages', 1]],
    stingersNuit: [['feu_crepite', 3], ['hibou', 1]],
    intervalle: [3, 9],
    musique: { theme: 'refuge' }, // le seul endroit où la musique ose être chaleureuse
  },
  sombre: {
    vent: [240, 0.12, 0.07],
    drones: [[41.2, 'sine', 0.050], [61.8, 'sine', 0.030]],
    stingers: [['goutte', 3], ['grattement', 2], ['gemissement', 2], ['craquement', 1]],
    stingersNuit: [['gemissement', 2]],
    intervalle: [6, 15],
    musique: { theme: 'mort' }, // un glas discret, beaucoup de silence
  },
  train: {
    vent: [700, 0.22, 1.6],
    drones: [[58, 'triangle', 0.035], [87, 'sine', 0.030]],
    rail: true,
    stingers: [['ferraille', 2], ['train_loin', 1]],
    stingersNuit: [],
    intervalle: [8, 18],
    musique: { theme: 'train' }, // le voyage : une basse qui roule avec les rails
  },
};
