// ============ Scènes narratives à choix (REFONTE §4.5) ============
// jouerScene(id) → Promise<{ fin, combat?, detour?, demiTour?, teleporter? }>
// Gère : texte (genre), orateur, illustration (vignette de décor de cinématique), choix conditionnels
// (si / besoin), jets (test), effets immédiats, combats enchaînés (effet `combat` → on se bat puis on
// reprend à `suivant`), cinématiques enchaînées, choix chronométrés, '#fin' / '#mort' / '#combat'.
import { G, genrer } from '../core/state.js';
import { emit } from '../core/bus.js';
import { el, texteHtml, escapeHtml } from '../core/util.js';
import { scene as defScene } from '../game/donnees.js';
import { verifier, raison } from '../game/conditions.js';
import { appliquerEffets } from '../game/effects.js';
import { chanceTest } from '../data/reglages.js';
import { niveauDepuisXp } from '../data/reglages.js';
import * as flow from '../game/flow.js';

let audio = null;
import('../audio.js').then(m => { audio = m; }).catch(() => {});
const sfx = (n) => { try { audio && audio.sfx(n); } catch (e) {} };

let vignetteMod = null;
async function illustration(id) {
  if (!id) return null;
  try {
    if (!vignetteMod) vignetteMod = await import('../cine/scenes/index.js');
    return await vignetteMod.vignette(id, { ratio: 21 / 9 });
  } catch (e) { return null; }
}

function normaliserCombat(c) {
  if (!c) return null;
  const s = { ...c };
  if (s.surprise === true) s.surprise = 'surpris';
  if (s.tutoriel) s.tuto = true;
  return s;
}

function jet(test) {
  if (!test) return true;
  if (test.chance != null) return Math.random() < test.chance;
  const niv = niveauDepuisXp((G.player.skillXp || {})[test.skill] || 0);
  return Math.random() < chanceTest(niv, test.difficulte || 0);
}

// ---------- Le panneau ----------
let racine = null;
function monter() {
  if (racine) return racine;
  racine = el('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' },
    el('div', { class: 'dlg-cadre' },
      el('div', { class: 'dlg-illu' }),
      el('div', { class: 'dlg-corps' },
        el('div', { class: 'dlg-orateur' }),
        el('div', { class: 'dlg-texte' }),
        el('div', { class: 'dlg-resultat' }),
        el('div', { class: 'dlg-timer' }, el('i')),
        el('div', { class: 'dlg-choix' }))));
  document.body.append(racine);
  requestAnimationFrame(() => racine && racine.classList.add('ouvert'));
  return racine;
}
function demonter() { if (racine) { const r = racine; racine = null; r.classList.remove('ouvert'); setTimeout(() => r.remove(), 200); } }
function masquer(b) { if (racine) racine.style.display = b ? 'none' : ''; }

// Affiche la scène et attend un choix. Renvoie le choix (objet) — ou le timeout.
async function afficher(def, texteAvant) {
  const R = monter();
  const q = (s) => R.querySelector(s);
  const illuId = def.illu;
  const ill = q('.dlg-illu');
  if (illuId && ill.dataset.id !== illuId) {
    ill.dataset.id = illuId; ill.innerHTML = '';
    illustration(illuId).then(svg => { if (svg && ill.dataset.id === illuId) { ill.innerHTML = svg; ill.classList.add('vu'); } });
  } else if (!illuId) { ill.dataset.id = ''; ill.innerHTML = ''; ill.classList.remove('vu'); }
  R.classList.toggle('sans-illu', !illuId);
  q('.dlg-orateur').textContent = def.orateur ? genrer(def.orateur) : '';
  q('.dlg-orateur').style.display = def.orateur ? '' : 'none';
  q('.dlg-resultat').innerHTML = texteAvant ? texteHtml(genrer(texteAvant)) : '';
  q('.dlg-resultat').style.display = texteAvant ? '' : 'none';
  const t = q('.dlg-texte');
  t.innerHTML = texteHtml(genrer(def.texte || ''));
  t.scrollTop = 0; q('.dlg-corps').scrollTop = 0;
  t.classList.remove('apparait'); void t.offsetWidth; t.classList.add('apparait');

  const zone = q('.dlg-choix'); zone.innerHTML = '';
  const choix = [];
  if (def.choix) for (const c of def.choix) { if (c.si && !verifier(c.si)) continue; choix.push(c); }
  if (!choix.length) choix.push(def.auto ? { label: def.auto.label || 'Continuer', suivant: def.auto.suivant, effets: def.auto.effets } : { label: 'Continuer', suivant: '#fin' });

  return new Promise((ok) => {
    let fini = false, timer = null;
    const choisir = (c) => { if (fini) return; fini = true; if (timer) clearInterval(timer); document.removeEventListener('keydown', clavier); sfx('clic'); ok(c); };
    choix.forEach((c, i) => {
      const bloque = c.besoin && !verifier(c.besoin);
      const b = el('button', { class: 'dlg-bouton' + (bloque ? ' bloque' : '') + (c.test ? ' jet' : ''), disabled: bloque || undefined, onclick: () => !bloque && choisir(c) },
        el('span', { class: 'dlg-num' }, String(i + 1)),
        el('span', { class: 'dlg-label' }, genrer(c.label)),
        bloque ? el('span', { class: 'dlg-raison' }, raison(c.besoin)) : null,
        c.test && c.test.skill ? el('span', { class: 'dlg-raison' }, `jet : ${c.test.skill}`) : null);
      zone.append(b);
    });
    const clavier = (e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= zone.children.length) { const b = zone.children[n - 1]; if (!b.disabled) b.click(); } else if ((e.key === 'Enter' || e.key === ' ') && zone.children.length === 1) zone.children[0].click(); };
    document.addEventListener('keydown', clavier);
    const tb = q('.dlg-timer');
    if (def.timerMs && def.timeout) {
      tb.style.display = ''; const i = tb.firstChild; const t0 = performance.now();
      timer = setInterval(() => {
        const f = (performance.now() - t0) / def.timerMs; i.style.width = `${Math.max(0, 100 - f * 100)}%`;
        if (f >= 1) choisir({ ...def.timeout, _timeout: true });
      }, 50);
    } else tb.style.display = 'none';
    setTimeout(() => { const b = zone.querySelector('button:not([disabled])'); if (b && !('ontouchstart' in window)) b.focus({ preventScroll: true }); }, 50);
  });
}

// ---------- Boucle d'une scène ----------
export async function jouerScene(id) {
  const sortie = { fin: '#fin' };
  let courant = id, texteAvant = null, garde = 0;
  emit('scene:debut', { id });
  try {
    while (courant && !courant.startsWith('#') && garde++ < 200) {
      const def = defScene(courant);
      if (!def) { console.warn('[dialogue] scène inconnue', courant); break; }
      if (def.effetsEntree) Object.assign(sortie, await appliquer(def.effetsEntree, sortie));
      const c = await afficher(def, texteAvant);
      texteAvant = null;
      let suivant = c.suivant, effets = c.effets, texte = c.texte;
      if (c.test) {
        const ok = jet(c.test);
        const br = ok ? c.reussite : c.echec;
        if (br) { suivant = br.suivant ?? suivant; effets = { ...(effets || {}), ...(br.effets || {}) }; texte = br.texte; }
        emit('toast', { texte: ok ? 'Réussi.' : 'Raté.', type: ok ? 'ok' : 'rate' });
      }
      const r = await appliquer(effets, sortie, suivant);
      if (r === 'mort') { sortie.fin = '#mort'; break; }
      if (suivant === '#combat') { sortie.fin = '#combat'; break; }
      if (suivant && suivant.startsWith('#')) { sortie.fin = suivant; break; }
      // Texte de résultat : affiché en tête de la scène suivante ; s'il n'y en a pas, petite page.
      if (texte) {
        if (suivant) texteAvant = texte;
        else { await afficher({ texte, illu: def.illu, auto: { label: 'Continuer', suivant: '#fin' } }); }
      }
      courant = suivant || '#fin';
      if (courant === '#fin' && texteAvant) { await afficher({ texte: texteAvant, illu: def.illu }); texteAvant = null; }
    }
  } finally {
    demonter();
    emit('scene:fin', { id, sortie });
  }
  if (sortie.fin === '#mort') emit('mort', { cause: sortie.causeMort || 'scene' });
  return sortie;
}

// Applique des effets, enchaîne cinématique/combat inline. Renvoie 'mort' si le joueur y est resté.
async function appliquer(effets, sortie, suivant) {
  if (!effets) return null;
  const r = appliquerEffets(effets);
  if (r.detour) sortie.detour = (sortie.detour || 0) + r.detour;
  if (r.demiTour) sortie.demiTour = true;
  if (r.teleporter) sortie.teleporter = r.teleporter;
  if (r.cinematique) { masquer(true); await flow.cinematique(r.cinematique); masquer(false); }
  if (r.combat) {
    const spec = normaliserCombat(r.combat);
    if (suivant === '#combat') { sortie.combat = spec; return null; }
    masquer(true);
    const res = await flow.combattre(spec);
    masquer(false);
    if (res && res.issue === 'mort') return 'mort';
  }
  if (G && G.player && G.player.mort) return 'mort';
  return null;
}
