// ============ Les lieux — géographie RÉELLE (géocodée OpenStreetMap, © contributeurs OSM, ODbL) ============
// Ce fichier ne porte que la GÉOGRAPHIE et la nature des lieux. Le reste est fusionné au chargement :
//   - js/data/histoire/lieux_recit.js   (scénariste)  : nom affiché, description, découverte initiale, rôle
//   - js/data/lieux_gameplay.js         (game design) : danger, morts, butin, repeuplement
// echelle : 'salon' = feuille de la ville ; 'region' = feuille du pays salonais.
// niveau  : id du plan d'exploration (js/data/niveaux/<id>.js) — null tant qu'il n'existe pas.
// type    : hotel|place|monument|mairie|chateau|musee|eglise|superette|supermarche|hypermarche|pharmacie|
//           mediatheque|cinema|usine|cimetiere|gare|commissariat|gendarmerie|caserne|hopital|lycee|
//           bricolage|cite|village|ruines|grotte|zoo|base|triage|aerodrome|route|nature

export const LIEUX_GEO = {
  // ─────────── Salon — le centre ancien (tout tient dans 300 m) ───────────
  hotel_poste:      { nom: 'Grand Hôtel de la Poste', echelle: 'salon', lat: 43.64153, lon: 5.09680, type: 'hotel' },
  place_crousillat: { nom: 'Place Crousillat — Fontaine Moussue', echelle: 'salon', lat: 43.64158, lon: 5.09712, type: 'place' },
  tour_horloge:     { nom: 'Tour de l\'Horloge', echelle: 'salon', lat: 43.64131, lon: 5.09701, type: 'monument' },
  casino_shop:      { nom: 'Supérette de la rue Kennedy', echelle: 'salon', lat: 43.64193, lon: 5.09654, type: 'superette' },
  pharmacie_carnot: { nom: 'Pharmacie du cours Carnot', echelle: 'salon', lat: 43.64098, lon: 5.09612, type: 'pharmacie' },
  hotel_de_ville:   { nom: 'Hôtel de Ville', echelle: 'salon', lat: 43.64066, lon: 5.09906, type: 'mairie' },
  nostradamus:      { nom: 'Maison de Nostradamus', echelle: 'salon', lat: 43.64086, lon: 5.09765, type: 'musee' },
  saint_michel:     { nom: 'Église Saint-Michel', echelle: 'salon', lat: 43.64050, lon: 5.09827, type: 'eglise' },
  emperi:           { nom: 'Château de l\'Empéri', echelle: 'salon', lat: 43.64012, lon: 5.09708, type: 'chateau' },
  place_de_gaulle:  { nom: 'Place du Général-de-Gaulle', echelle: 'salon', lat: 43.64157, lon: 5.09523, type: 'place' },
  saint_laurent:    { nom: 'Collégiale Saint-Laurent', echelle: 'salon', lat: 43.64352, lon: 5.09704, type: 'eglise' },

  // ─────────── Salon — autour du centre ───────────
  cineplanet:       { nom: 'Cinéplanet — place Morgan', echelle: 'salon', lat: 43.63929, lon: 5.09360, type: 'cinema' },
  carrefour_morgan: { nom: 'Carrefour Market de la place Morgan', echelle: 'salon', lat: 43.63801, lon: 5.09505, type: 'supermarche' },
  mediatheque:      { nom: 'Médiathèque', echelle: 'salon', lat: 43.63820, lon: 5.09222, type: 'mediatheque' },
  marius_fabre:     { nom: 'Savonnerie Marius Fabre', echelle: 'salon', lat: 43.63763, lon: 5.09026, type: 'usine' },
  cimetiere:        { nom: 'Cimetière Saint-Roch', echelle: 'salon', lat: 43.63687, lon: 5.09466, type: 'cimetiere' },
  gare:             { nom: 'Gare SNCF', echelle: 'salon', lat: 43.63907, lon: 5.08844, type: 'gare' },
  hopital:          { nom: 'Centre hospitalier du Pays salonais', echelle: 'salon', lat: 43.64029, lon: 5.10333, type: 'hopital' },
  lycee:            { nom: 'Lycée Adam-de-Craponne', echelle: 'salon', lat: 43.63525, lon: 5.09775, type: 'lycee' },
  canourgues:       { nom: 'Les Canourgues', echelle: 'salon', lat: 43.65202, lon: 5.10027, type: 'cite' },
  commissariat:     { nom: 'Commissariat', echelle: 'salon', lat: 43.65428, lon: 5.09799, type: 'commissariat' },
  weldom:           { nom: 'Zone de la Gandonne — Weldom', echelle: 'salon', lat: 43.63142, lon: 5.09709, type: 'bricolage' },
  intermarche:      { nom: 'Intermarché de Bel-Air', echelle: 'salon', lat: 43.63606, lon: 5.07741, type: 'hypermarche' },
  leclerc:          { nom: 'Leclerc des Viougues', echelle: 'salon', lat: 43.62853, lon: 5.11606, type: 'hypermarche' },
  pompiers:         { nom: 'Caserne des pompiers', echelle: 'salon', lat: 43.62926, lon: 5.11414, type: 'caserne' },
  gendarmerie:      { nom: 'Gendarmerie — avenue du 18-Juin', echelle: 'salon', lat: 43.62782, lon: 5.11634, type: 'gendarmerie' },
  jean_moulin:      { nom: 'Mémorial Jean-Moulin', echelle: 'salon', lat: 43.66526, lon: 5.09511, type: 'monument' },

  // ─────────── Le pays salonais ───────────
  pelissanne:       { nom: 'Pélissanne', echelle: 'region', lat: 43.63067, lon: 5.14967, type: 'village' },
  la_barben:        { nom: 'La Barben — château et parc animalier', echelle: 'region', lat: 43.62597, lon: 5.20839, type: 'zoo' },
  aurons:           { nom: 'Aurons', echelle: 'region', lat: 43.66492, lon: 5.15690, type: 'village' },
  vernegues:        { nom: 'Vieux-Vernègues', echelle: 'region', lat: 43.69020, lon: 5.16746, type: 'ruines' },
  cales:            { nom: 'Grottes de Calès — Lamanon', echelle: 'region', lat: 43.70411, lon: 5.08199, type: 'grotte' },
  eyguieres:        { nom: 'Eyguières', echelle: 'region', lat: 43.69513, lon: 5.02972, type: 'village' },
  aerodrome:        { nom: 'Aérodrome de Salon-Eyguières', echelle: 'region', lat: 43.65719, lon: 5.01027, type: 'aerodrome' },
  senas:            { nom: 'Sénas', echelle: 'region', lat: 43.74467, lon: 5.07862, type: 'village' },
  mallemort:        { nom: 'Mallemort — pont sur la Durance', echelle: 'region', lat: 43.73147, lon: 5.18029, type: 'village' },
  grans:            { nom: 'Grans', echelle: 'region', lat: 43.60676, lon: 5.06338, type: 'village' },
  ba701:            { nom: 'Base aérienne 701', echelle: 'region', lat: 43.60630, lon: 5.10920, type: 'base' },
  lancon:           { nom: 'Lançon — péage de l\'A7', echelle: 'region', lat: 43.59131, lon: 5.12586, type: 'village' },
  cornillon:        { nom: 'Cornillon-Confoux', echelle: 'region', lat: 43.56191, lon: 5.07230, type: 'village' },
  miramas:          { nom: 'Miramas — gare de triage', echelle: 'region', lat: 43.58081, lon: 4.99916, type: 'triage' },
  miramas_le_vieux: { nom: 'Miramas-le-Vieux', echelle: 'region', lat: 43.56323, lon: 5.02442, type: 'village' },
  saint_chamas:     { nom: 'Saint-Chamas — la Poudrerie', echelle: 'region', lat: 43.55265, lon: 5.03126, type: 'usine' },
  istres:           { nom: 'Istres', echelle: 'region', lat: 43.51391, lon: 4.98843, type: 'village' },
  berre:            { nom: 'Berre-l\'Étang', echelle: 'region', lat: 43.47571, lon: 5.16760, type: 'village' },
};

// La ville de Salon vue depuis la carte régionale (centre de la feuille « salon »).
export const SALON_SUR_REGION = { lat: 43.6405, lon: 5.0975 };
