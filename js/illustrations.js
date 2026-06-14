// ============ Illustrations — point d'entrée ============
// L'art est réparti dans js/art/ :
//   scenes_art.js  → svgScene(nom)  : décors des lieux et scènes narratives
//   combat_art.js  → svgCombatDecor(zid) / svgCombatZombie(zid) : décor + créatures en combat
export { svgScene } from './art/scenes_art.js';
export { svgCombatDecor, svgCombatZombie } from './art/combat_art.js';
