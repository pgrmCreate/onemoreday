// Attente d'une confirmation de l'hôte : quantité issue de rpcAttente, jamais un délai de remboursement.
import { on } from '../core/bus.js';
import { el } from '../core/util.js';

let nombre = 0, delai = null, indication = null, panneau = null;
export const transfertEnCours = () => nombre > 0;

function majCommande(b) {
  if (nombre && !b.disabled) { b.dataset.attenteTransfert = '1'; b.disabled = true; }
  else if (!nombre && b.dataset.attenteTransfert) { delete b.dataset.attenteTransfert; b.disabled = false; }
}
// À appeler aussi pour les boutons recréés pendant l'attente ; les autres raisons de désactivation restent intactes.
export function commandeTransfert(b) { b.classList.add('action-transfert'); majCommande(b); return b; }

function placer() {
  if (!indication) return;
  const sec = panneau && document.querySelector('.ui-panneau');
  if (sec) sec.insertBefore(indication, sec.querySelector('.pn-corps'));
  else document.body.append(indication);
}
on('panneau', ({ nom }) => { panneau = nom; placer(); });

export function afficherEtatTransferts(n) {
  nombre = n;
  document.body.classList.toggle('transfert-en-cours', nombre > 0);
  document.querySelectorAll('.action-transfert').forEach(majCommande);
  if (!nombre) {
    clearTimeout(delai); delai = null;
    if (indication) { indication.remove(); indication = null; }
    return;
  }
  if (indication || delai) return;
  delai = setTimeout(() => {
    delai = null;
    if (!nombre) return;
    indication = el('div', { class: 'coop-transfert', role: 'status' }, 'On attend la réponse…');
    placer();
  }, 300);
}
