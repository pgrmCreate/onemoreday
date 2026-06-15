// ============ Lecteur de scènes scriptées (prologue, train, fins de chapitre) ============
import { SCENES } from './data/story.js';
import { G, save, setFlag, getFlag, noteJournal } from './state.js';
import { DEPART_CH2 } from './data/world.js';
import { decouvrirAutour } from './world.js';
import { render, updateHUD, log, btnAct, $ } from './ui.js';
import { svgScene } from './illustrations.js';
import { appliquerEffets, besoinRempli, besoinTexte, jetReussi } from './effects.js';
import { playAmbiance, startCombatMusic, stopCombatMusic, sfx } from './audio.js';
import { jouerCine, jouerCineUneFois } from './cinema.js';
import * as multi from './multi.js';

let sceneTimer = null;
let timerAnim = null;

function stopTimers() {
  if (sceneTimer) { clearTimeout(sceneTimer); sceneTimer = null; }
  if (timerAnim) { clearInterval(timerAnim); timerAnim = null; }
}

function goTo(cible) {
  stopTimers();
  if (!cible) cible = '#retour';
  if (cible === '#retour') {
    stopCombatMusic();
    G.world.sceneCourante = null;
    save();
    // En co-op, le tout premier retour au monde (« Ouvrir les yeux ») n'entre PAS tout
    // de suite : on attend que les DEUX joueurs aient ouvert les yeux (départ commun).
    import('./map.js').then(m => {
      if (multi.estMulti() && !multi.partieDemarree()) m.coopEntrerOuAttendre();
      else m.renderLieu();
    });
    return;
  }
  if (cible === '#arrivee') {
    stopCombatMusic();
    G.world.sceneCourante = null;
    window.dispatchEvent(new CustomEvent('omd-fin'));
    return;
  }
  if (cible === '#chapitre2') {
    // L'aventure continue : le joueur s'installe à Miramas-le-Vieux.
    stopCombatMusic();
    G.world.sceneCourante = null;
    if (!getFlag('chapitre2')) noteJournal('Chapitre 2 — installé au Refuge de Miramas-le-Vieux.');
    setFlag('chapitre2');
    G.world.carte = DEPART_CH2.carte;
    G.world.x = DEPART_CH2.x;
    G.world.y = DEPART_CH2.y;
    decouvrirAutour(DEPART_CH2.carte, DEPART_CH2.x, DEPART_CH2.y);
    save();
    // Le rocher se découvre à la caméra avant de rendre la main au joueur.
    jouerCineUneFois('arrivee_miramas', () => import('./map.js').then(m => m.renderLieu()));
    return;
  }
  if (cible === '#mort') {
    window.dispatchEvent(new CustomEvent('omd-mort', { detail: { cause: 'combat' } }));
    return;
  }
  jouerScene(cible);
}

export function jouerScene(id) {
  stopTimers();
  const sc = SCENES[id];
  if (!sc) { console.error('Scène inconnue :', id); goTo('#retour'); return; }
  G.world.sceneCourante = id;
  save();

  if (sc.musique === 'combat') startCombatMusic();
  else { stopCombatMusic(); if (sc.musique) playAmbiance(sc.musique); }

  let html = `<div class="illu kb">${svgScene(sc.illu)}</div>`;
  if (sc.timerMs) html += `<div class="scene-timer"><div class="scene-timer-fill" id="scene-timer-fill"></div></div>`;
  html += `<div class="narration">${sc.texte}</div><div class="actions" id="scene-actions">`;
  if (sc.auto) {
    html += btnAct(`data-auto="1"`, sc.auto.label, '', { classe: 'primary' });
  }
  (sc.choix || []).forEach((c, i) => {
    const ok = besoinRempli(c.besoin);
    const sub = !ok ? `<span class="req">Requiert : ${besoinTexte(c.besoin)}</span>` : (c.sous || '');
    html += btnAct(`data-choix="${i}"`, c.label, sub, { disabled: !ok });
  });
  html += `</div>`;
  render(html);
  updateHUD();

  if (sc.auto) {
    $('[data-auto]').onclick = () => { sfx('clic'); goTo(sc.auto.suivant); };
  }
  document.querySelectorAll('[data-choix]').forEach(b => {
    b.onclick = () => { sfx('clic'); choisir(sc, parseInt(b.dataset.choix, 10)); };
  });

  // Choix chronométré
  if (sc.timerMs) {
    const debut = performance.now();
    const fill = $('#scene-timer-fill');
    timerAnim = setInterval(() => {
      const reste = Math.max(0, 1 - (performance.now() - debut) / sc.timerMs);
      if (fill) fill.style.width = (reste * 100) + '%';
    }, 80);
    sceneTimer = setTimeout(() => {
      stopTimers();
      const to = sc.timeout || { suivant: '#retour' };
      interstitiel(to.texte || 'Trop tard.', to.effets, to.suivant, sc.illu);
    }, sc.timerMs);
  }
}

function choisir(sc, idx) {
  stopTimers();
  const c = sc.choix[idx];
  if (!c) return;
  if (c.test) {
    const ok = jetReussi(c.test);
    const branche = ok ? c.reussite : c.echec;
    interstitiel(branche.texte, branche.effets, branche.suivant ?? c.suivant, sc.illu);
  } else {
    interstitiel(c.texte, c.effets, c.suivant, sc.illu, !c.texte);
  }
}

// Écran intermédiaire : montre le résultat du choix, puis continue
function interstitiel(texte, effets, suivant, illu, direct = false) {
  const continuer = () => {
    const combatLance = appliquerEffets(effets, () => goTo(suivant));
    if (!combatLance) goTo(suivant);
  };
  if (direct || !texte) { continuer(); return; }
  const html = `
    <div class="illu kb">${svgScene(illu)}</div>
    <div class="narration">${texte}</div>
    <div class="actions">${btnAct('data-cont="1"', 'Continuer', '', { classe: 'primary' })}</div>`;
  render(html);
  $('[data-cont]').onclick = () => { sfx('clic'); continuer(); };
}
