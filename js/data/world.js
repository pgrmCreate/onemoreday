// ============ Le monde — registre des cartes et point de départ ============
// Quatre échelles : intérieurs (pièces) → quartiers (rues) → ville → région.
// Le contenu est réparti par zone géographique :
import { CARTES_SALON_CENTRE } from './cartes_salon_centre.js';
import { CARTES_SALON_QUARTIERS } from './cartes_salon_quartiers.js';
import { CARTES_SALON_VILLE } from './cartes_salon_ville.js';
import { CARTES_SALON_INTERIEURS } from './cartes_salon_interieurs.js';
import { CARTES_REGION } from './cartes_region.js';
import { CARTES_MIRAMAS, DEPART_CH2 } from './cartes_miramas.js';

export const CARTES = {
  ...CARTES_SALON_CENTRE,
  ...CARTES_SALON_QUARTIERS,
  ...CARTES_SALON_VILLE,
  ...CARTES_SALON_INTERIEURS,
  ...CARTES_REGION,
  ...CARTES_MIRAMAS,
};

// Jour 23 : la chambre 203 du Grand Hôtel de la Poste, place Crousillat.
export const DEPART = { carte: 'int_hotel', x: 3, y: 0 };
// Chapitre 2 : la placette de Miramas-le-Vieux.
export { DEPART_CH2 };
