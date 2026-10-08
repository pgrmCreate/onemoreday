// ============ Panneaux — cadre commun (plein écran sur mobile, latéral sur PC) ============
// ouvrirPanneau(nom, opts), fermerPanneau(), panneauOuvert() → nom|null.
// nom ∈ 'inventaire' | 'corps' | 'fabrication' | 'construction' | 'journal' | 'options'. En solo, l'horloge est en pause tant qu'un panneau est ouvert.
// Chaque panneau exporte monter(corps, opts, api) → { maj?(evt), demonter?() } ; api = { ouvrir, fermer, rafraichir }.
// Émet bus 'panneau' { nom|null }.
import { G } from '../../core/state.js';
import { on, emit } from '../../core/bus.js';
import * as clock from '../../core/clock.js';
import { ico } from '../icons.js';
import * as inventaire from './inventaire.js';
import * as corps from './corps.js';
import * as fabrication from './fabrication.js';
import * as construction from './construction.js';
import * as journal from './journal.js';
import * as options from './options.js';
import { listeATrier, finirTri } from '../../game/inventory.js';

const PANNEAUX = {
  inventaire: { titre: 'Sac', icone: 'sac', m: inventaire },
  corps: { titre: 'Corps', icone: 'corps', m: corps },
  fabrication: { titre: 'Fabriquer', icone: 'fabrication', m: fabrication },
  construction: { titre: 'Construire', icone: 'marteau', m: construction },
  journal: { titre: 'Journal', icone: 'journal', m: journal },
  options: { titre: 'Menu', icone: 'menu', m: options },
};
let racine = null, courant = null, instance = null, offs = [], dernierFocus = null;

function construire() {
  racine = document.createElement('div');
  racine.className = 'ui-panneau-voile';
  racine.innerHTML = `
    <section class="ui-panneau" role="dialog" aria-modal="true" tabindex="-1">
      <header class="pn-tete">
        <nav class="pn-rail" role="tablist">${Object.entries(PANNEAUX).map(([k, p]) =>
          `<button class="pn-rail-btn" type="button" role="tab" data-p="${k}" aria-label="${p.titre}">${ico(p.icone)}<span>${p.titre}</span></button>`).join('')}
        </nav>
        <button class="pn-fermer" type="button" aria-label="Fermer">${ico('fermer')}</button>
      </header>
      <div class="pn-corps"></div>
    </section>`;
  document.body.appendChild(racine);
  racine.addEventListener('pointerdown', (e) => { if (e.target === racine) fermerPanneau(); });
  racine.querySelector('.pn-fermer').addEventListener('click', fermerPanneau);
  racine.querySelectorAll('.pn-rail-btn').forEach(b => b.addEventListener('click', () => ouvrirPanneau(b.dataset.p)));
  document.addEventListener('keydown', (e) => {
    if (!courant) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermerPanneau(); }
  }, true);
}

export function ouvrirPanneau(nom, opts = {}) {
  const def = PANNEAUX[nom]; if (!def) { console.warn('[panneaux] inconnu', nom); return; }
  if (!racine) construire();
  const deja = !!courant;
  if (instance && instance.demonter) try { instance.demonter(); } catch (e) { console.error(e); }
  offs.forEach(f => f()); offs = [];
  if (!deja) { dernierFocus = document.activeElement; if (G && G.mode === 'solo') clock.pause('panneau'); }
  courant = nom;
  const sec = racine.querySelector('.ui-panneau');
  sec.dataset.panneau = nom; sec.setAttribute('aria-label', def.titre);
  racine.querySelectorAll('.pn-rail-btn').forEach(b => { const a = b.dataset.p === nom; b.classList.toggle('actif', a); b.setAttribute('aria-selected', a); });
  const corpsEl = racine.querySelector('.pn-corps');
  corpsEl.textContent = ''; corpsEl.className = `pn-corps pn-${nom}`;
  const api = { ouvrir: ouvrirPanneau, fermer: fermerPanneau, rafraichir: () => instance && instance.maj && instance.maj({}) };
  try { instance = def.m.monter(corpsEl, opts, api) || {}; }
  catch (e) { console.error('[panneaux]', nom, e); corpsEl.textContent = 'Ce panneau n\'a pas pu s\'ouvrir.'; instance = {}; }
  if (instance.maj) {
    const maj = (evt) => { if (courant === nom) try { instance.maj(evt || {}); } catch (e) { console.error(e); } };
    for (const ev of ['inventaire', 'blessure', 'survie', 'xp', 'journal', 'quete', 'document']) offs.push(on(ev, (d) => maj({ type: ev, ...(d || {}) })));
    if (G && G.mode !== 'solo') offs.push(on('minute', () => maj({ type: 'minute' })));
  }
  if (!deja) { racine.classList.add('ouvert'); requestAnimationFrame(() => racine.classList.add('visible')); }
  if (!deja) sec.focus({ preventScroll: true }); // le focus entre dans le panneau (Échap, Tab) sans surligner un bouton
  emit('panneau', { nom });
}
export function fermerPanneau() {
  if (!courant) return;
  if (instance && instance.demonter) try { instance.demonter(); } catch (e) { console.error(e); }
  offs.forEach(f => f()); offs = []; instance = null; courant = null;
  racine.classList.remove('visible');
  setTimeout(() => { if (!courant) { racine.classList.remove('ouvert'); racine.querySelector('.pn-corps').textContent = ''; } }, 200);
  clock.reprendre('panneau');
  if (dernierFocus && dernierFocus.focus) try { dernierFocus.focus({ preventScroll: true }); } catch (e) {}
  emit('panneau', { nom: null });
}
export function panneauOuvert() { return courant; }

// Une scène t'a donné plus que tu ne peux porter : dès qu'elle est finie (plus de scène, de combat ni de cinématique
// par-dessus) et qu'aucun panneau n'est ouvert, le sac s'ouvre sur l'onglet « À trier ».
let triPrevu = null;
on('mort', () => { finirTri(); });
on('tri', () => {
  if (triPrevu) return;
  triPrevu = setInterval(async () => {
    if (!listeATrier().length) { clearInterval(triPrevu); triPrevu = null; return; }
    const flow = await import('../../game/flow.js');
    if (flow.overlayOuvert() || courant) return;
    clearInterval(triPrevu); triPrevu = null;
    ouvrirPanneau('inventaire', { onglet: 'tri' });
  }, 400);
});
