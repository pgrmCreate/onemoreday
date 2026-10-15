// Comparer AVANT de prendre un sac distant. La confirmation porte sur un aperçu précis et vérifié à nouveau.
import { G } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import { el } from '../core/util.js';
import * as clock from '../core/clock.js';
import * as inv from '../game/inventory.js';
import { commandeTransfert, transfertEnCours } from './transferts.js';

const nombre = n => String(Math.round(n * 100) / 100).replace('.', ',');
const signe = n => (n > 0 ? '+' : '') + nombre(n);
let annuler = null;
export function comparaisonSac(id, p = G.player) {
  if (inv.slotDe(id) !== 'sac') return '';
  const litres = inv.contenanceSac(id), porte = p.equip.sac;
  return porte ? `${litres} L (${litres === inv.contenanceSac(porte) ? '=' : signe(litres - inv.contenanceSac(porte)) + ' L'})` : `${litres} L`;
}
export function choisirSac(id, p = G.player, { index = null, valide = () => true } = {}) {
  if (inv.slotDe(id) !== 'sac' || !p.equip.sac) return Promise.resolve({});
  if (annuler || transfertEnCours()) return Promise.resolve(null);
  const plan = inv.prevoirSac(id, p, index); if (!plan) return Promise.resolve(null);
  const d = inv.def(id), ancien = inv.def(plan.ancien);
  const ici = p.position && p.position.mode === 'lieu';
  return new Promise(resolve => {
    const focus = document.activeElement;
    const dlg = el('dialog', { class: 'sac-dialog', 'aria-labelledby': 'sac-titre' });
    const corps = el('div', { class: 'sac-comparaison' });
    corps.append(el('p', { class: 'sac-noms' }, `Tu portes : ${ancien.nom}.`, el('br'), `L’autre sac : ${d.nom}.`));
    const table = el('table', {}, el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'Ton sac'), el('th', {}, 'Ce sac'))));
    const rows = [
      ['Contenance', inv.contenanceSac(plan.ancien), inv.contenanceSac(id), ' L'],
      ['Poids à vide', ancien.poids || 0, d.poids || 0, ' kg'],
      ['Charge en plus', ancien.portage || 0, d.portage || 0, ' kg'],
      ['Accès rapide', ancien.accesRapide || 0, d.accesRapide || 0, ''],
      ['Agilité', ancien.agilite || 0, d.agilite || 0, ''],
    ];
    const tbody = el('tbody');
    for (const [label, a, b, unite] of rows.filter((r, i) => i === 0 || r[1] !== r[2])) tbody.append(el('tr', {}, el('th', { scope: 'row' }, label), el('td', {}, nombre(a) + unite),
      el('td', {}, nombre(b) + unite, a !== b ? el('small', {}, ` (${signe(b - a)}${unite})`) : null)));
    table.append(tbody); corps.append(table);
    corps.append(el('p', {}, `Tes affaires occupent ${nombre(plan.volume)} L.${plan.surplus.length ? '' : ' Elles tiennent dans ce sac et tes poches.'}`));
    const poses = [...plan.surplus, { id: plan.ancien, qty: 1 }];
    const destination = ici ? 'à tes pieds' : 'dans « À trier »';
    corps.append(el('p', { class: 'sac-depot' }, plan.surplus.length
      ? `Ce sac est trop petit pour tout emporter. En confirmant, tu poses ${destination} : ${poses.map(it => inv.nomObjet(it.id) + ((it.qty || 1) > 1 ? ` ×${it.qty}` : '')).join(', ')}.`
      : `Si tu laisses l’ancien sac, il ${ici ? 'reste ici, à tes pieds' : 'va dans « À trier »'}.`));
    corps.append(el('p', {}, plan.garderPossible ? `Garder l’ancien sac prend ${nombre(inv.volumeDe(plan.ancien))} L de plus.` : 'Pour garder aussi l’ancien, libère de la place avant de changer.'));
    const actions = el('div', { class: 'sac-actions' });
    let fini = false;
    const offs = [];
    const fermer = choix => {
      if (fini) return;
      fini = true; annuler = null; offs.forEach(f => f());
      window.removeEventListener('keydown', clavier, true);
      dlg.close(); dlg.remove(); clock.reprendre('comparaison-sac');
      emit('sac:comparaison', { ouvert: false });
      if (focus && focus.isConnected) focus.focus({ preventScroll: true });
      resolve(choix);
    };
    const confirmer = ancien => {
      if (transfertEnCours()) return;
      if (G.player !== p || p.mort || !valide() || inv.prevoirSac(id, p, index)?.empreinte !== plan.empreinte) {
        emit('toast', { texte: 'La situation a changé. Compare les sacs à nouveau.', type: 'info' }); fermer(null); return;
      }
      fermer({ ancien, empreinte: plan.empreinte });
    };
    const action = (texte, fn, disabled = false) => commandeTransfert(el('button', { type: 'button', disabled: disabled || null, onclick: fn }, texte));
    actions.append(action('Changer et laisser l’ancien ici', () => confirmer('poser')),
      action('Changer et garder l’ancien', () => confirmer('garder'), !plan.garderPossible),
      el('button', { type: 'button', onclick: () => fermer(null) }, 'Annuler'));
    const clavier = e => { e.stopImmediatePropagation(); if (e.key === 'Escape') { e.preventDefault(); fermer(null); } };
    annuler = () => fermer(null);
    for (const ev of ['mort', 'sac:annuler', 'scene:debut', 'panneau']) offs.push(on(ev, annuler));
    dlg.addEventListener('cancel', e => { e.preventDefault(); fermer(null); });
    dlg.append(el('h2', { id: 'sac-titre' }, 'Changer de sac'), corps, actions);
    document.body.append(dlg); dlg.showModal();
    if (G.mode === 'solo') clock.pause('comparaison-sac');
    emit('sac:comparaison', { ouvert: true });
    window.addEventListener('keydown', clavier, true);
    actions.lastChild.focus();
  });
}
