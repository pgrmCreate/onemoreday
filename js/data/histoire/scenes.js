// ============ SCÈNES NARRATIVES — point d'entrée (REFONTE §4.5) ============
// Les scènes sont réparties par partie de l'histoire ; ce module les fusionne dans SCENES.
// Fichiers : scenes_prologue.js, scenes_ch1.js, scenes_ch2.js, scenes_final.js,
//            scenes_pnj.js (dialogues à sujets), scenes_rencontres.js (rencontres de voyage scénarisées),
//            scenes_ruees.js (les sirènes : le rabattage de l'armée).
// Un id en double est signalé en console (le second écrase le premier) — tools/verifier_histoire.mjs le refuse.
import { SCENES_PROLOGUE } from './scenes_prologue.js';
import { SCENES_CH1 } from './scenes_ch1.js';
import { SCENES_CH2 } from './scenes_ch2.js';
import { SCENES_FINAL } from './scenes_final.js';
import { SCENES_PNJ } from './scenes_pnj.js';
import { SCENES_RENCONTRES } from './scenes_rencontres.js';
import { SCENES_RUEES } from './scenes_ruees.js';

export const PARTIES_SCENES = { SCENES_PROLOGUE, SCENES_CH1, SCENES_CH2, SCENES_FINAL, SCENES_PNJ, SCENES_RENCONTRES, SCENES_RUEES };

export const SCENES = {};
for (const [nomPartie, partie] of Object.entries(PARTIES_SCENES)) {
  for (const [id, sc] of Object.entries(partie)) {
    if (SCENES[id]) console.warn(`[histoire] scène en double : ${id} (${nomPartie})`);
    SCENES[id] = sc;
  }
}
