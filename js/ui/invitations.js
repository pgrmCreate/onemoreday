// ============ Invitations du coéquipier (co-op) : jamais cachées sous une scène ============
// Une invitation (dormir ensemble, regarder une cinématique) reçue pendant qu'on lit une scène ou qu'on regarde une
// cinématique attend la fin pour s'afficher. Un bandeau déjà visible se range quand une scène s'ouvre, et son délai
// s'arrête : il revient ensuite avec le temps qu'il lui restait. Une seule invitation par sorte : la plus récente
// remplace l'autre, sans rien envoyer pour l'ancienne. Restée cachée trop longtemps (MASQUE_MAX_MS en tout, scènes
// successives comprises), elle est abandonnée. Rien de tout cela en solo : seul js/net/coop.js et js/game/sommeil.js
// en créent.
import * as flow from '../game/flow.js';

const MASQUE_MAX_MS = 120000;
const PAS_MS = 250;
const actives = new Map();     // sorte → invitation en cours
let veille = null;

// inviter(sorte, { element, dureeMs, expire(), abandon(), masquee(), annule() }) → { retirer() }
//   expire  : le délai de réponse est écoulé alors qu'elle était affichée
//   abandon : elle est restée cachée plus de MASQUE_MAX_MS
//   masquee : appelé une fois, la première fois qu'elle doit attendre (prévenir celui qui l'a envoyée)
//   annule  : la partie à deux s'arrête (annulerInvitations)
export function inviter(sorte, o) {
  const ancienne = actives.get(sorte);
  if (ancienne) ancienne.retirer();
  const inv = { ...o, sorte, reste: o.dureeMs, cache: 0, visible: false, prevenu: false, dernier: performance.now(), fini: false };
  inv.retirer = () => {
    if (inv.fini) return;
    inv.fini = true;
    if (inv.visible) inv.element.remove();
    inv.visible = false;
    if (actives.get(sorte) === inv) actives.delete(sorte);
  };
  actives.set(sorte, inv);
  majInvitation(inv, 0);
  if (!veille) veille = setInterval(tic, PAS_MS);
  return { retirer: inv.retirer };
}

function tic() {
  const t = performance.now();
  for (const inv of [...actives.values()]) { const dt = t - inv.dernier; inv.dernier = t; majInvitation(inv, dt); }
  if (!actives.size) { clearInterval(veille); veille = null; }
}

function majInvitation(inv, dt) {
  if (inv.fini) return;
  if (flow.enRecit()) {
    // une scène ou une cinématique est ouverte : on se range, et le temps de réponse ne compte pas
    if (inv.visible) { inv.element.remove(); inv.visible = false; }
    if (!inv.prevenu) { inv.prevenu = true; try { inv.masquee && inv.masquee(); } catch (e) {} }
    inv.cache += dt;
    if (inv.cache > MASQUE_MAX_MS) { inv.retirer(); try { inv.abandon && inv.abandon(); } catch (e) {} }
    return;
  }
  if (!inv.visible) { document.body.append(inv.element); inv.visible = true; }
  inv.reste -= dt;
  if (inv.reste <= 0) { inv.retirer(); try { inv.expire && inv.expire(); } catch (e) {} }
}

// La partie à deux s'arrête, la liaison tombe, le coéquipier part : plus aucune invitation de lui.
export function annulerInvitations() {
  for (const inv of [...actives.values()]) { inv.retirer(); try { inv.annule && inv.annule(); } catch (e) {} }
}
// Combien de temps lui reste-t-il (ms) ? (vérifications)
export function etatInvitations() {
  return [...actives.values()].map(i => ({ sorte: i.sorte, visible: i.visible, resteMs: Math.round(i.reste), cacheMs: Math.round(i.cache) }));
}
