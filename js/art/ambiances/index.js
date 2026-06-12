// ============ Registre des dessins d'ambiance — un par carte ============
// Chaque module exporte par défaut : (a) => fragment SVG 800×340.
// a = { haut, bas, lum, nuit, heure, p } — voir js/art/ambiance_lib.js.
import int_hotel from './int_hotel.js';
import q_centre from './q_centre.js';
import int_casino from './int_casino.js';
import int_eglise from './int_eglise.js';
import int_nostradamus from './int_nostradamus.js';
import int_emperi from './int_emperi.js';
import q_cours from './q_cours.js';
import q_gare from './q_gare.js';
import int_gare from './int_gare.js';
import ville_salon from './ville_salon.js';
import int_pharmacie from './int_pharmacie.js';
import int_decathlon from './int_decathlon.js';
import int_mediatheque from './int_mediatheque.js';
import int_cineplanet from './int_cineplanet.js';
import int_hopital from './int_hopital.js';
import int_commissariat from './int_commissariat.js';
import int_leclerc from './int_leclerc.js';
import int_weldom from './int_weldom.js';
import int_garage from './int_garage.js';
import int_caserne from './int_caserne.js';
import region from './region.js';
import q_miramas_vieux from './q_miramas_vieux.js';
import q_triage from './q_triage.js';
import int_refuge from './int_refuge.js';

export const AMBIANCES = {
  int_hotel, q_centre, int_casino, int_eglise, int_nostradamus, int_emperi,
  q_cours, q_gare, int_gare, ville_salon, int_pharmacie, int_decathlon,
  int_mediatheque, int_cineplanet, int_hopital, int_commissariat, int_leclerc,
  int_weldom, int_garage, int_caserne, region, q_miramas_vieux, q_triage, int_refuge,
};
