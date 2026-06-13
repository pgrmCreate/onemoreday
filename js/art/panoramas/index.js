// ============ Panoramas de cinématiques — 1600×340, faits pour le travelling ============
// Chaque module exporte par défaut : (a) => fragment SVG 1600×340.
import sortie_hotel from './sortie_hotel.js';
import gare from './gare.js';
import miramas from './miramas.js';
import salon_avant from './salon_avant.js';
import salon_chaos from './salon_chaos.js';
import clocher from './clocher.js';
import premiere_nuit from './premiere_nuit.js';
import hopital from './hopital.js';
import emperi from './emperi.js';
import depart_train from './depart_train.js';
import refuge_miramas from './refuge_miramas.js';

export const PANORAMAS = {
  sortie_hotel, gare, miramas, salon_avant, salon_chaos,
  clocher, premiere_nuit, hopital, emperi, depart_train, refuge_miramas,
};
export const PANO_W = 1600, PANO_H = 340;
