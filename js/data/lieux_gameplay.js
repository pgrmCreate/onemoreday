// ============================================================================
//  LIEUX — la part GAMEPLAY de chaque lieu (fusionnée avec lieux.js et histoire/lieux_recit.js)
// ============================================================================
//   danger 0..1      densité et dureté des morts ; abords (rencontres) ; abondance du butin (+danger = +butin).
//   pool [ids]       morts pour les cases 'Z' et le procédural. Un id répété = plus probable.
//                    Le pool d'un lieu IGNORE zombies[id].jourMin (un lieu dangereux l'est dès le jour 1).
//   morts { n }      [min, max] morts procéduraux en plus des 'Z' à la 1re visite (× courbe du jour × co-op × difficulté).
//   typeButin        clé de js/data/butin.js (table de butin par défaut des meubles).
//   repeuplement     morts qui reviennent par 24 h d'absence (voir reglages.exploration.REPEUPLEMENT).
//   abondance        (optionnel, défaut 1) × chances de butin du lieu : 0,7 = « déjà pillé » (supermarchés pris d'assaut
//                    les derniers jours), 1,2 = « personne n'a osé » (la base).
//   ambiance         scène sonore (hotel|rue|magasin|eglise|musee|gare|triage|hopital|commissariat|garage|
//                    mediatheque|cinema|region|village|refuge|interieur|sombre).
// Repères de danger : 0,15-0,25 calme · 0,3-0,45 ordinaire · 0,5-0,65 infesté · 0,75+ « NE PAS Y ALLER ».
// ============================================================================

export const LIEUX_GAMEPLAY = {
  // ─────────── Salon — le centre ancien ───────────
  hotel_poste:      { danger: 0.2,  pool: ['errant', 'errant', 'errant', 'rampant', 'putrefie'], morts: { n: [1, 3] }, typeButin: 'hotel', repeuplement: 0.3, ambiance: 'hotel' },
  place_crousillat: { danger: 0.3,  pool: ['errant', 'errant', 'errant', 'rampant', 'coureur'], morts: { n: [2, 4] }, typeButin: 'place', repeuplement: 0.8, ambiance: 'rue' },
  tour_horloge:     { danger: 0.2,  pool: ['errant', 'rampant'], morts: { n: [0, 2] }, typeButin: 'monument', repeuplement: 0.2, ambiance: 'sombre' },
  casino_shop:      { danger: 0.35, pool: ['errant', 'errant', 'putrefie', 'rampant'], morts: { n: [2, 4] }, typeButin: 'superette', repeuplement: 0.5, abondance: 0.8, ambiance: 'magasin' },
  pharmacie_carnot: { danger: 0.4,  pool: ['errant', 'errant', 'putrefie', 'coureur'], morts: { n: [2, 4] }, typeButin: 'pharmacie', repeuplement: 0.5, abondance: 0.75, ambiance: 'magasin' },
  hotel_de_ville:   { danger: 0.35, pool: ['errant', 'errant', 'errant', 'hurleur', 'rampant'], morts: { n: [2, 5] }, typeButin: 'mairie', repeuplement: 0.4, ambiance: 'interieur' },
  nostradamus:      { danger: 0.2,  pool: ['errant', 'rampant'], morts: { n: [1, 2] }, typeButin: 'musee', repeuplement: 0.2, ambiance: 'musee' },
  saint_michel:     { danger: 0.3,  pool: ['errant', 'errant', 'putrefie', 'rampant'], morts: { n: [1, 4] }, typeButin: 'eglise', repeuplement: 0.4, ambiance: 'eglise' },
  emperi:           { danger: 0.35, pool: ['errant', 'errant', 'rampant', 'hurleur'], morts: { n: [2, 5] }, typeButin: 'chateau', repeuplement: 0.4, ambiance: 'musee' },
  place_de_gaulle:  { danger: 0.35, pool: ['errant', 'errant', 'coureur', 'rampant'], morts: { n: [3, 6] }, typeButin: 'place', repeuplement: 1, ambiance: 'rue' },
  saint_laurent:    { danger: 0.3,  pool: ['errant', 'errant', 'putrefie'], morts: { n: [1, 3] }, typeButin: 'eglise', repeuplement: 0.3, ambiance: 'eglise' },

  // ─────────── Salon — autour du centre ───────────
  cineplanet:       { danger: 0.5,  pool: ['errant', 'errant', 'coureur', 'hurleur', 'rampant'], morts: { n: [3, 6] }, typeButin: 'cinema', repeuplement: 0.6, ambiance: 'cinema' },
  carrefour_morgan: { danger: 0.5,  pool: ['errant', 'errant', 'coureur', 'putrefie', 'gonfleur'], morts: { n: [4, 7] }, typeButin: 'supermarche', repeuplement: 0.8, abondance: 0.65, ambiance: 'magasin' },
  mediatheque:      { danger: 0.3,  pool: ['errant', 'errant', 'rampant'], morts: { n: [1, 3] }, typeButin: 'mediatheque', repeuplement: 0.3, ambiance: 'mediatheque' },
  marius_fabre:     { danger: 0.3,  pool: ['errant', 'errant', 'putrefie'], morts: { n: [2, 4] }, typeButin: 'savonnerie', repeuplement: 0.3, ambiance: 'interieur' },
  cimetiere:        { danger: 0.35, pool: ['errant', 'errant', 'putrefie', 'putrefie', 'rampant'], morts: { n: [2, 5] }, typeButin: 'cimetiere', repeuplement: 0.8, ambiance: 'region' },
  gare:             { danger: 0.55, pool: ['errant', 'errant', 'coureur', 'hurleur', 'rampant', 'chien_infecte'], morts: { n: [4, 7] }, typeButin: 'gare', repeuplement: 1, ambiance: 'gare' },
  hopital:          { danger: 0.75, pool: ['errant', 'errant', 'putrefie', 'putrefie', 'coureur', 'gonfleur', 'hurleur', 'enrage'], morts: { n: [6, 10] }, typeButin: 'hopital', repeuplement: 1.2, abondance: 0.9, ambiance: 'hopital' },
  lycee:            { danger: 0.5,  pool: ['errant', 'coureur', 'coureur', 'hurleur'], morts: { n: [4, 7] }, typeButin: 'lycee', repeuplement: 0.6, ambiance: 'interieur' },
  canourgues:       { danger: 0.6,  pool: ['errant', 'errant', 'coureur', 'chien_infecte', 'hurleur', 'enrage'], morts: { n: [5, 9] }, typeButin: 'cite', repeuplement: 1.2, ambiance: 'rue' },
  commissariat:     { danger: 0.55, pool: ['errant', 'errant', 'coureur', 'colosse'], morts: { n: [3, 6] }, typeButin: 'commissariat', repeuplement: 0.5, abondance: 0.8, ambiance: 'commissariat' },
  weldom:           { danger: 0.4,  pool: ['errant', 'errant', 'rampant', 'coureur'], morts: { n: [3, 5] }, typeButin: 'bricolage', repeuplement: 0.6, ambiance: 'garage' },
  intermarche:      { danger: 0.45, pool: ['errant', 'errant', 'putrefie', 'coureur', 'gonfleur'], morts: { n: [4, 8] }, typeButin: 'hypermarche', repeuplement: 0.8, abondance: 0.7, ambiance: 'magasin' },
  leclerc:          { danger: 0.6,  pool: ['errant', 'errant', 'coureur', 'gonfleur', 'hurleur', 'enrage'], morts: { n: [6, 10] }, typeButin: 'hypermarche', repeuplement: 1.2, abondance: 0.75, ambiance: 'magasin' },
  pompiers:         { danger: 0.45, pool: ['errant', 'errant', 'coureur', 'enrage'], morts: { n: [2, 5] }, typeButin: 'caserne', repeuplement: 0.4, ambiance: 'garage' },
  gendarmerie:      { danger: 0.55, pool: ['errant', 'errant', 'coureur', 'colosse', 'chien_infecte'], morts: { n: [3, 6] }, typeButin: 'gendarmerie', repeuplement: 0.5, abondance: 0.8, ambiance: 'commissariat' },
  jean_moulin:      { danger: 0.15, pool: ['errant'], morts: { n: [0, 2] }, typeButin: 'monument', repeuplement: 0.3, ambiance: 'region' },

  // ─────────── Le pays salonais ───────────
  pelissanne:       { danger: 0.4,  pool: ['errant', 'errant', 'coureur', 'chien_infecte', 'rampant'], morts: { n: [3, 6] }, typeButin: 'village', repeuplement: 0.6, ambiance: 'village' },
  la_barben:        { danger: 0.6,  pool: ['errant', 'fauve', 'chien_infecte', 'errant', 'sanglier'], morts: { n: [3, 6] }, typeButin: 'zoo', repeuplement: 0.4, abondance: 1.1, ambiance: 'region' },
  aurons:           { danger: 0.2,  pool: ['errant', 'rampant'], morts: { n: [1, 3] }, typeButin: 'village', repeuplement: 0.3, ambiance: 'village' },
  vernegues:        { danger: 0.25, pool: ['errant', 'rampant', 'putrefie'], morts: { n: [1, 3] }, typeButin: 'ruines', repeuplement: 0.2, ambiance: 'region' },
  cales:            { danger: 0.4,  pool: ['errant', 'rampant', 'putrefie', 'rampant'], morts: { n: [2, 4] }, typeButin: 'grotte', repeuplement: 0.3, abondance: 1.1, ambiance: 'sombre' },
  eyguieres:        { danger: 0.35, pool: ['errant', 'errant', 'coureur', 'rampant'], morts: { n: [2, 5] }, typeButin: 'village', repeuplement: 0.5, ambiance: 'village' },
  aerodrome:        { danger: 0.4,  pool: ['errant', 'errant', 'coureur', 'militaire'], morts: { n: [2, 4] }, typeButin: 'aerodrome', repeuplement: 0.3, abondance: 1.1, ambiance: 'region' },
  senas:            { danger: 0.35, pool: ['errant', 'errant', 'coureur', 'chien_infecte'], morts: { n: [2, 5] }, typeButin: 'village', repeuplement: 0.5, ambiance: 'village' },
  mallemort:        { danger: 0.4,  pool: ['errant', 'errant', 'coureur', 'putrefie', 'gonfleur'], morts: { n: [2, 5] }, typeButin: 'village', repeuplement: 0.5, ambiance: 'village' },
  grans:            { danger: 0.35, pool: ['errant', 'errant', 'rampant', 'coureur'], morts: { n: [2, 5] }, typeButin: 'village', repeuplement: 0.5, ambiance: 'village' },
  ba701:            { danger: 0.85, pool: ['militaire', 'militaire', 'militaire', 'errant', 'coureur', 'colosse', 'enrage'], morts: { n: [6, 10] }, typeButin: 'base', repeuplement: 0.8, abondance: 1.2, ambiance: 'garage' },
  lancon:           { danger: 0.6,  pool: ['errant', 'errant', 'coureur', 'enrage', 'hurleur'], morts: { n: [4, 7] }, typeButin: 'route', repeuplement: 1, ambiance: 'region' },
  cornillon:        { danger: 0.2,  pool: ['errant', 'rampant'], morts: { n: [1, 3] }, typeButin: 'village', repeuplement: 0.3, ambiance: 'village' },
  miramas:          { danger: 0.65, pool: ['errant', 'errant', 'coureur', 'hurleur', 'putrefie', 'enrage', 'chien_infecte'], morts: { n: [4, 8] }, typeButin: 'triage', repeuplement: 1, ambiance: 'triage' },
  miramas_le_vieux: { danger: 0.15, pool: ['errant', 'rampant'], morts: { n: [0, 2] }, typeButin: 'village', repeuplement: 0.2, ambiance: 'village' },
  saint_chamas:     { danger: 0.5,  pool: ['errant', 'errant', 'putrefie', 'coureur', 'gonfleur'], morts: { n: [3, 6] }, typeButin: 'usine', repeuplement: 0.5, ambiance: 'interieur' },
  istres:           { danger: 0.55, pool: ['errant', 'errant', 'coureur', 'hurleur', 'militaire', 'enrage'], morts: { n: [4, 8] }, typeButin: 'village', repeuplement: 1, ambiance: 'rue' },
  berre:            { danger: 0.5,  pool: ['errant', 'errant', 'putrefie', 'gonfleur', 'coureur'], morts: { n: [3, 7] }, typeButin: 'village', repeuplement: 0.8, ambiance: 'rue' },
};

export const AMBIANCES = ['hotel', 'rue', 'magasin', 'eglise', 'musee', 'gare', 'triage', 'hopital', 'commissariat',
  'garage', 'mediatheque', 'cinema', 'region', 'village', 'refuge', 'interieur', 'sombre'];
