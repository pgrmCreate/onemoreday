// ============ Cadence d'affichage : 60 images/s au plus, 30 en mode économie ============
// Les écrans à 90/120 Hz feraient tourner les boucles requestAnimationFrame à 90/120 images/s : deux fois plus de travail
// pour une image que l'œil ne distingue pas dans ce jeu. Le mode économie (Options, mémorisé dans les préférences)
// descend à 30 images/s ; les animations suivent le temps écoulé, elles gardent donc la même vitesse.
import { pref } from './prefs.js';

export const imagesParSeconde = () => (pref('economie') ? 30 : 60);

// limiteur() → sauter(t) : true quand l'image de cet instant t (horodatage de requestAnimationFrame) doit être sautée.
// La marge de 2 ms absorbe le léger flottement des horodatages (60 Hz plafonné à 60 : aucune image sautée).
export function limiteur() {
  let dernier = -Infinity;
  return (t) => {
    if (t - dernier < 1000 / imagesParSeconde() - 2) return true;
    dernier = t;
    return false;
  };
}
