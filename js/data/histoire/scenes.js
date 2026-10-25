// ============ SCÈNES NARRATIVES — point d'entrée (REFONTE §4.5, docs/HISTOIRE.md §6) ============
// Les scènes sont réparties par acte ; ce module les fusionne dans SCENES.
// Fichiers : scenes_refuge.js (acte I), scenes_crau.js (acte II), scenes_chute.js (acte III),
//            scenes_brume.js (acte IV), scenes_pont.js (acte V et final),
//            scenes_pnj.js (dialogues à sujets), scenes_rencontres.js (rencontres de voyage scénarisées),
//            scenes_ruees.js (les sirènes : le rabattage de l'armée).
// Un id en double est signalé en console (le second écrase le premier) — tools/verifier_histoire.mjs le refuse.
import { SCENES_REFUGE } from './scenes_refuge.js';
import { SCENES_CRAU } from './scenes_crau.js';
import { SCENES_CHUTE } from './scenes_chute.js';
import { SCENES_BRUME } from './scenes_brume.js';
import { SCENES_PONT } from './scenes_pont.js';
import { SCENES_PNJ } from './scenes_pnj.js';
import { SCENES_RENCONTRES } from './scenes_rencontres.js';
import { SCENES_RUEES } from './scenes_ruees.js';

export const PARTIES_SCENES = { SCENES_REFUGE, SCENES_CRAU, SCENES_CHUTE, SCENES_BRUME, SCENES_PONT, SCENES_PNJ, SCENES_RENCONTRES, SCENES_RUEES };

export const SCENES = {};
for (const [nomPartie, partie] of Object.entries(PARTIES_SCENES)) {
  for (const [id, sc] of Object.entries(partie)) {
    if (SCENES[id]) console.warn(`[histoire] scène en double : ${id} (${nomPartie})`);
    SCENES[id] = sc;
  }
}
