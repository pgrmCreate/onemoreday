// ============ Outils communs aux panneaux ============
import { el, escapeHtml } from '../../core/util.js';
import { genrer } from '../../core/state.js';
import { ico, icoEl } from '../icons.js';

export { el, escapeHtml, ico, icoEl };
export const g = (s) => genrer(s || '');
export const fmtKg = (k) => `${(Math.round(k * 10) / 10).toFixed(k < 10 ? 1 : 0).replace('.', ',')} kg`;
export const fmtL = (l) => `${(Math.round(l * 100) / 100).toString().replace('.', ',')} L`;
export const pct = (x) => `${Math.round(Math.max(0, Math.min(1, x)) * 100)} %`;

// Barre d'onglets : liste [{ id, label, icone?, badge? }] → élément ; onChange(id).
export function onglets(liste, actif, onChange, cls = '') {
  const n = el('div', { class: `pn-onglets ${cls}`, role: 'tablist' });
  for (const o of liste) {
    const b = el('button', { type: 'button', role: 'tab', class: 'pn-onglet' + (o.id === actif ? ' actif' : ''), 'aria-selected': o.id === actif ? 'true' : 'false', onclick: () => onChange(o.id) });
    if (o.icone) b.append(icoEl(o.icone));
    b.append(el('span', {}, o.label));
    if (o.badge) b.append(el('em', { class: 'pn-badge' }, String(o.badge)));
    n.append(b);
  }
  return n;
}
// Jauge horizontale : { label, v (0..1), texte, cls, repere? (0..1), icone? }
export function jauge({ label, v, texte, cls = '', repere = null, icone = null, titre = null }) {
  const n = el('div', { class: `pn-jauge ${cls}`, title: titre || null });
  const tete = el('div', { class: 'pn-jauge-tete' });
  if (icone) tete.append(icoEl(icone));
  tete.append(el('span', { class: 'pn-jauge-label' }, label), el('span', { class: 'pn-jauge-val' }, texte));
  const barre = el('div', { class: 'pn-jauge-barre' }, el('i', { style: { width: `${Math.max(0, Math.min(1, v)) * 100}%` } }));
  if (repere != null) barre.append(el('b', { class: 'pn-jauge-repere', style: { left: `${repere * 100}%` } }));
  n.append(tete, barre);
  return n;
}
// Bouton d'action : { label, icone, onclick, cls, disabled, raison }
export function bouton({ label, icone, onclick, cls = '', disabled = false, raison = null, titre = null }) {
  const b = el('button', { type: 'button', class: `pn-btn ${cls}`, onclick: disabled ? null : onclick, title: titre || raison || null });
  if (disabled) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
  if (icone) b.append(icoEl(icone));
  b.append(el('span', {}, label));
  if (disabled && raison) b.append(el('small', {}, raison));
  return b;
}
// Conserve la position de défilement des éléments [data-scroll] lors d'un re-rendu.
export function avecScroll(racine, rendre) {
  const pos = {};
  racine.querySelectorAll('[data-scroll]').forEach(n => { pos[n.dataset.scroll] = n.scrollTop; });
  rendre();
  racine.querySelectorAll('[data-scroll]').forEach(n => { if (pos[n.dataset.scroll] != null) n.scrollTop = pos[n.dataset.scroll]; });
}
export function vide(texte, icone = 'divers') {
  return el('div', { class: 'pn-vide' }, icoEl(icone), el('p', {}, texte));
}
