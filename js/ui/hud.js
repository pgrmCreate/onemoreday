// ============ HUD — discret : heure, lieu, objectif, états du corps, le mal, boutons ronds ============
// montrerHUD(bool), majHUD(). Mis à jour par le bus ('minute', 'inventaire', 'blessure', 'quete', 'temps', 'survie', 'lieu:entre').
// Les moodles n'apparaissent que quand ça compte ; un toucher affiche leur détail.
import { G, genrer } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { lieu as lieuDe } from '../game/donnees.js';
import { QUETES } from '../data/histoire/quetes.js';
import { etatsCorps } from '../game/survival.js';
import { etatRuee, quandTexte } from '../game/ruees.js';
import { ico, ICONE_MOODLE } from './icons.js';
import { ouvrirPanneau, panneauOuvert } from './panels/index.js';

let racine = null, visible = false, offs = [], bulleTimer = null;
const els = {};

// Objectif courant de la quête principale (la plus avancée des chapitres ouverts).
export function objectifCourant() {
  if (!G) return null;
  let best = null;
  for (const [id, q] of Object.entries(QUETES)) {
    const e = G.world.quetes && G.world.quetes[id];
    if (!q.principale || !e || e.faite) continue;
    if (!best || (q.chapitre || 0) >= (best.q.chapitre || 0)) best = { id, q, e };
  }
  if (!best) return null;
  const etape = best.q.etapes[best.e.etape] || {};
  return { id: best.id, titre: best.q.titre, objectif: genrer(etape.objectif || ''), lieu: etape.lieu || null };
}
function texteLieu() {
  const pos = G && G.player && G.player.position;
  if (!pos) return '';
  if (pos.mode === 'lieu') { const l = lieuDe(pos.lieu); return l ? l.court || l.nom : ''; }
  if (pos.mode === 'voyage') { const v = pos.voyage || {}; const l = lieuDe(v.vers); return l ? `En route : ${l.court || l.nom}` : 'En route'; }
  return '';
}

function construire() {
  racine = document.createElement('div');
  racine.className = 'ui-hud';
  racine.innerHTML = `
    <div class="hud-haut-g">
      <div class="hud-carte">
        <div class="hud-heure"><span class="hud-jour"></span><span class="hud-h"></span></div>
        <div class="hud-lieu">${ico('lieu')}<span class="t"></span></div>
        <div class="hud-ruee" hidden>${ico('alerte')}<span class="t"></span></div>
      </div>
      <button class="hud-objectif" type="button" aria-label="Objectif">${ico('objectif')}<span class="t"></span></button>
    </div>
    <div class="hud-moodles" role="list" aria-label="États du corps"></div>
    <div class="hud-haut-d" role="toolbar" aria-label="Menus">
      <button class="hud-btn" data-p="corps" type="button" aria-label="Corps">${ico('corps')}<span class="hud-pastille" hidden></span></button>
      <button class="hud-btn" data-p="inventaire" type="button" aria-label="Sac">${ico('sac')}</button>
      <button class="hud-btn hud-btn-construire" data-p="construction" type="button" aria-label="Construire" title="Construire">${ico('marteau')}</button>
      <button class="hud-btn" data-p="journal" type="button" aria-label="Journal">${ico('journal')}<span class="hud-pastille" hidden></span></button>
      <button class="hud-btn" data-p="options" type="button" aria-label="Menu">${ico('menu')}</button>
    </div>
    <div class="hud-bulle" hidden></div>`;
  document.body.appendChild(racine);
  els.jour = racine.querySelector('.hud-jour'); els.h = racine.querySelector('.hud-h');
  els.lieu = racine.querySelector('.hud-lieu .t'); els.lieuBox = racine.querySelector('.hud-lieu');
  els.ruee = racine.querySelector('.hud-ruee'); els.rueeTxt = els.ruee.querySelector('.t');
  els.obj = racine.querySelector('.hud-objectif'); els.objTxt = els.obj.querySelector('.t');
  els.moodles = racine.querySelector('.hud-moodles'); els.bulle = racine.querySelector('.hud-bulle');
  els.pastCorps = racine.querySelector('[data-p=corps] .hud-pastille');
  els.pastJournal = racine.querySelector('[data-p=journal] .hud-pastille');
  racine.querySelectorAll('.hud-btn').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.p === 'journal') els.pastJournal.hidden = true;
    ouvrirPanneau(b.dataset.p);
  }));
  els.obj.addEventListener('click', () => ouvrirPanneau('journal', { onglet: 'objectifs' }));
  els.moodles.addEventListener('click', (e) => {
    const m = e.target.closest('.hud-moodle'); if (!m) return;
    montrerBulle(m, m.dataset.label, m.dataset.detail);
  });
}
function montrerBulle(ancre, titre, detail) {
  const b = els.bulle; b.innerHTML = '<strong></strong><span></span>';
  b.firstChild.textContent = titre; b.lastChild.textContent = detail || '';
  const r = ancre.getBoundingClientRect();
  b.style.left = `${Math.round(r.right + 8)}px`; b.style.top = `${Math.round(r.top)}px`;
  b.hidden = false; clearTimeout(bulleTimer);
  bulleTimer = setTimeout(() => { b.hidden = true; }, 3200);
}

let signatureMoodles = '', dernierObjectif = '';
export function majHUD() {
  if (!racine || !G) return;
  els.jour.textContent = `Jour ${clock.jour()} · ${clock.dateTexte()}`;
  els.h.textContent = `${String(clock.heure()).padStart(2, '0')}:${String(clock.minute()).padStart(2, '0')}`;
  racine.classList.toggle('nuit', clock.estNuit());
  const l = texteLieu(); els.lieu.textContent = l; els.lieuBox.hidden = !l;
  // Les sirènes : quand elles hurlent (et quand la radio les a annoncées)
  const ru = etatRuee();
  const quoi = ru && ru.type === 'horde' ? 'Horde' : 'Sirènes';
  const rt = !ru ? '' : ru.active ? `${quoi} : ${ru.nom}` : `${quoi} · ${ru.nom} · ${quandTexte(ru.debut).replace('vers ', '')}`;
  if (els.rueeTxt.textContent !== rt) els.rueeTxt.textContent = rt;
  els.ruee.hidden = !rt; els.ruee.classList.toggle('active', !!(ru && ru.active));
  const o = objectifCourant();
  const ot = o ? o.objectif : '';
  els.obj.hidden = !ot; els.objTxt.textContent = ot;
  if (ot && ot !== dernierObjectif && dernierObjectif) {
    els.obj.classList.remove('neuf'); void els.obj.offsetWidth; els.obj.classList.add('neuf');
    // En exploration l'objectif n'est pas affiché en permanence : on l'annonce une fois.
    if (document.body.dataset.temps !== 'carte') emit('toast', { texte: `Nouvel objectif : ${ot}`, duree: 4200 });
  }
  dernierObjectif = ot;
  // Moodles (le mal a sa propre jauge)
  const p = G.player; const ms = etatsCorps(p).filter(m => m.id !== 'mal');
  const mal = Math.round(p.mal || 0);
  const sig = ms.map(m => m.id + m.niveau).join('|') + '|mal' + mal;
  if (sig !== signatureMoodles) {
    signatureMoodles = sig;
    els.moodles.textContent = '';
    for (const m of ms) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `hud-moodle n${m.niveau}${m.mauvais ? '' : ' bon'} m-${m.id}`;
      b.dataset.label = genrer(m.label); b.dataset.detail = genrer(m.detail || '');
      b.setAttribute('aria-label', genrer(m.label));
      b.innerHTML = ico(ICONE_MOODLE[m.id] || 'alerte') + `<i class="hud-crans">${'<b></b>'.repeat(m.niveau)}</i>`;
      els.moodles.appendChild(b);
    }
    if (mal > 0) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hud-moodle hud-mal' + (mal >= 75 ? ' n4' : mal >= 50 ? ' n3' : mal >= 30 ? ' n2' : ' n1');
      b.dataset.label = `Le mal : ${mal}/100`; b.dataset.detail = 'Il redescend lentement, surtout en dormant. À 100, tu redeviens l\'un d\'eux.';
      b.setAttribute('aria-label', `Le mal ${mal} sur 100`);
      b.style.setProperty('--mal', (mal / 100).toFixed(3));
      b.innerHTML = `<svg class="hud-mal-anneau" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" pathLength="100"/><circle class="v" cx="18" cy="18" r="15.5" pathLength="100" style="stroke-dasharray:${mal} 100"/></svg>${ico('mal')}<em>${mal}</em>`;
      els.moodles.appendChild(b);
    }
    const urgent = p.blessures.some(w => w.saigne || w.infecte) || ms.some(m => m.niveau >= 3);
    els.pastCorps.hidden = !urgent;
  }
}
export function montrerHUD(on_ = true) {
  if (typeof document === 'undefined') return;
  if (!racine) construire();
  visible = !!on_;
  racine.classList.toggle('visible', visible);
  if (visible) {
    if (!offs.length) {
      const maj = () => { if (visible) majHUD(); };
      for (const e of ['minute', 'flag', 'inventaire', 'blessure', 'quete', 'temps', 'survie', 'lieu:entre', 'lieu:sort', 'voyage:debut', 'voyage:fin'])
        offs.push(on(e, maj));
      offs.push(on('journal', () => { if (!panneauOuvert()) els.pastJournal.hidden = false; }));
      offs.push(on('document', () => { els.pastJournal.hidden = false; }));
    }
    signatureMoodles = ''; majHUD();
  } else { offs.forEach(f => f()); offs = []; }
}
