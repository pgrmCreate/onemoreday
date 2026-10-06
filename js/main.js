// ============ One More Day — démarrage, écran titre, création, mort, fin ============
import { G, nouvellePartie, charger, sauver, aSauvegarde, effacerSauvegarde, genrer, noteJournal } from './core/state.js';
import { on, emit } from './core/bus.js';
import * as clock from './core/clock.js';
import { el, $, texteHtml, escapeHtml } from './core/util.js';
import { pref, setPref } from './core/prefs.js';
import * as flow from './game/flow.js';
import * as quetes from './game/quetes.js';
import { normaliserJoueur } from './game/player.js';
import { demarrerSurvie, arreterSurvie } from './game/survival.js';
import { demarrerDeclencheurs, arreterDeclencheurs } from './game/declencheurs.js';
import { demarrerMeteo, arreterMeteo } from './game/meteo.js';
import { demarrerRuees, arreterRuees } from './game/ruees.js';
import { montrerHUD, majHUD } from './ui/hud.js';
import { demarrerToasts } from './ui/toast.js';
import { installerTapFiable } from './ui/tap.js';
import { fermerPanneau } from './ui/panels/index.js';
import { REGLAGES, presetDifficulte } from './data/reglages.js';
import { MORTS } from './data/histoire/morts.js';
import { FINS } from './data/histoire/fins.js';
import { BUILD_VERSION } from './version_build.js';
import * as audio from './audio.js';
import * as coop from './net/coop.js';

const ecran = $('#ecran');
let partieEnCours = false;
let finMontree = false;

// ---------- Audio : débloqué au premier geste ----------
document.addEventListener('pointerdown', function once() {
  document.removeEventListener('pointerdown', once);
  try { audio.initAudio(); audio.setVolume(pref('volume')); audio.setMuted(!!pref('muet')); if (!partieEnCours) audio.playAmbiance('titre'); } catch (e) {}
}, { once: false });

// ---------- Plein écran + paysage (mobile) ----------
function pleinEcran() {
  const d = document.documentElement;
  try { if (!document.fullscreenElement && d.requestFullscreen && matchMedia('(pointer: coarse)').matches) d.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { screen.orientation.lock('landscape'); } catch (e) {} }).catch(() => {}); } catch (e) {}
}

// ---------- Écrans ----------
async function fond(decor) {
  const f = ecran.querySelector('.ecran-fond');
  if (!f) return;
  try {
    const m = await import('./cine/scenes/index.js');
    const svg = await m.vignette(decor, { ratio: 16 / 9, x: 0.5 });
    if (svg && f.isConnected) f.innerHTML = svg;
  } catch (e) {}
}
function afficher(html, decor = 'salon_aube_toits') {
  ecran.innerHTML = `<div class="ecran-fond"></div><div class="ecran-voile"></div><div class="ecran-grain"></div><div class="ecran-contenu">${html}</div><div class="pied">v${escapeHtml(BUILD_VERSION || '3')} · © contributeurs OpenStreetMap</div>`;
  ecran.classList.add('actif');
  fond(decor);
  return ecran.querySelector('.ecran-contenu');
}
function cacherEcran() { ecran.classList.remove('actif'); ecran.innerHTML = ''; }
const btn = (attrs, label, sous = '') => `<button class="btn ${attrs.cls || ''}" ${attrs.data || ''}>${label}${sous ? `<small>${sous}</small>` : ''}</button>`;

export function ecranTitre() {
  arreterPartie();
  document.body.classList.remove('en-jeu');
  const peutContinuer = aSauvegarde('solo');
  const c = afficher(`
    <h1 class="titre-jeu">One More<br><b>Day</b></h1>
    <p class="sous-titre">Salon-de-Provence. Trois semaines après le Mercredi.</p>
    <div class="menu">
      ${peutContinuer ? btn({ cls: 'primaire', data: 'data-a="continuer"' }, 'Continuer', 'reprendre la partie en cours') : ''}
      ${btn({ cls: peutContinuer ? '' : 'primaire', data: 'data-a="nouvelle"' }, 'Nouvelle partie', 'seul')}
      ${btn({ data: 'data-a="coop"' }, 'Jouer à deux', 'en ligne ou sur le même Wi-Fi')}
    </div>
    <p class="aide">Jeu pour adultes : violence et gore explicites.</p>`, 'salon_mistral_vide');
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    try { audio.sfx('clic'); } catch (e) {}
    pleinEcran();
    const a = b.dataset.a;
    if (a === 'continuer') continuer('solo');
    else if (a === 'nouvelle') ecranCreation({ mode: 'solo' });
    else if (a === 'coop') coop.ecranCoop({ afficher, ecranTitre, ecranCreation, demarrerInvite, nouvelleAventure });
  });
}

export function ecranCreation({ mode = 'solo', apres } = {}) {
  const presets = REGLAGES.difficulte.PRESETS;
  let genre = 'm', diff = pref('difficulte');
  if (!presets[diff]) diff = REGLAGES.difficulte.DEFAUT || 'survie';   // une ancienne préférence inconnue : la difficulté par défaut
  const aide = { recit: 'Les morts frappent moins fort. Pour l’histoire.', survie: 'L’équilibre voulu : chaque erreur se paie.', cauchemar: 'Mort définitive : la sauvegarde est effacée.' };
  // Tout tient sur un écran de téléphone (paysage comme portrait) : une carte, deux colonnes, les boutons en bas.
  const c = afficher(`
    <div class="creation">
      <header class="cr-tete"><small>${mode === 'hote' ? 'Héberger une partie' : mode === 'invite' ? 'Rejoindre la partie' : 'Nouvelle partie'}</small><h2>Qui se réveille ?</h2></header>
      <div class="cr-grille">
        <section>
          <label class="champ" for="c-nom">Ton prénom</label>
          <input class="saisie" id="c-nom" maxlength="16" placeholder="Sam" autocomplete="off" enterkeyhint="done">
          <div class="champ">Tu es</div>
          <div class="cr-seg" id="c-genre"><button type="button" data-g="m" class="on">Un homme</button><button type="button" data-g="f">Une femme</button></div>
        </section>
        <section>
          <div class="champ">Difficulté</div>
          <div class="cr-diff" id="c-diff">${Object.entries(presets).map(([id, p]) => `<button type="button" data-d="${id}" class="${id === diff ? 'on' : ''}"><b>${escapeHtml(p.nom)}</b><small>${escapeHtml(aide[id] || '')}</small></button>`).join('')}</div>
        </section>
      </div>
      <div class="cr-actions">
        <button type="button" class="btn cr-retour" data-a="retour">Retour</button>
        <button type="button" class="btn primaire cr-go" data-a="go">${mode === 'hote' ? 'Ouvrir le salon' : 'Commencer'}</button>
      </div>
    </div>`, 'cimetiere_caveau');
  c.classList.add('ec-creation');
  c.querySelectorAll('#c-genre button').forEach(b => b.onclick = () => { genre = b.dataset.g; c.querySelectorAll('#c-genre button').forEach(x => x.classList.toggle('on', x === b)); });
  c.querySelectorAll('#c-diff button').forEach(b => b.onclick = () => { diff = b.dataset.d; setPref('difficulte', diff); c.querySelectorAll('#c-diff button').forEach(x => x.classList.toggle('on', x === b)); });
  c.querySelector('[data-a="retour"]').onclick = () => ecranTitre();
  const go = () => {
    const nom = ($('#c-nom').value || 'Sam').trim().slice(0, 16) || 'Sam';
    if (apres) return apres({ nom, genre, difficulte: diff });
    nouvelleAventure({ nom, genre, difficulte: diff, mode });
  };
  c.querySelector('[data-a="go"]').onclick = go;
  $('#c-nom').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
  setTimeout(() => { const i = $('#c-nom'); if (i && !matchMedia('(pointer: coarse)').matches) i.focus(); }, 100);
}

// ---------- Démarrer / reprendre ----------
function demarrerSystemes({ invite = false } = {}) {
  partieEnCours = true; finMontree = false;
  document.body.classList.add('en-jeu');
  normaliserJoueur(G.player);
  clock.viderPauses();
  clock.demarrer({ invite });
  demarrerSurvie();
  demarrerMeteo();
  if (!invite) { demarrerDeclencheurs(); demarrerRuees(); }
  montrerHUD(true); majHUD();
}
function arreterPartie() {
  if (!partieEnCours) return;
  partieEnCours = false;
  try { fermerPanneau(); } catch (e) {}
  clock.arreter(); arreterSurvie(); arreterDeclencheurs(); arreterRuees(); arreterMeteo();
  montrerHUD(false);
  flow.quitter && flow.quitter();
  try { coop.arreter(); } catch (e) {}
}

export async function nouvelleAventure({ nom, genre, difficulte, mode = 'solo', seed }) {
  effacerSauvegarde(mode);
  nouvellePartie({ nom, genre, mode, seed });
  G.world.difficulte = difficulte;
  cacherEcran();
  demarrerSystemes();
  quetes.avancer('q_prologue', 'debut');
  sauver();
  await flow.cinematique('intro');
  await flow.explorer('cimetiere', { entree: 'caveau' });
}

export async function continuer(mode = 'solo') {
  if (!charger(mode)) { ecranTitre(); return; }
  cacherEcran();
  demarrerSystemes();
  await reprendrePosition();
}
async function reprendrePosition() {
  const pos = G.player.position || {};
  if (pos.mode === 'lieu' && pos.lieu) {
    if (pos.sorti) await flow.ouvrirCarte({ echelle: lieuEchelle(pos.lieu), depuis: pos.lieu });
    else await flow.explorer(pos.lieu, { entree: pos.entree || undefined });
  } else if (pos.mode === 'voyage' && pos.voyage) {
    const v = pos.voyage;
    await flow.ouvrirCarte({ echelle: lieuEchelle(v.de), depuis: v.de });
  } else {
    await flow.explorer('cimetiere', { entree: 'caveau' });
  }
}
function lieuEchelle(id) { try { return (flow.lieuDe && flow.lieuDe(id) || {}).echelle || 'salon'; } catch (e) { return 'salon'; } }

// Invité co-op : le monde arrive de l'hôte, le personnage est le sien.
export async function demarrerInvite({ position, neuf } = {}) {
  cacherEcran();
  demarrerSystemes({ invite: true });
  if (position && position.lieu) await flow.explorer(position.lieu, { entree: position.entree || undefined });
  else await flow.explorer('cimetiere', { entree: 'caveau' });
  // premier soir à deux : on se réveille l'un près de l'autre
  if (neuf && G && !G.world.flags.prologue_fini) setTimeout(() => flow.scene('coop_reveil').catch(() => {}), 600);
}

// ---------- Mort ----------
on('mort', ({ cause } = {}) => {
  if (!partieEnCours || !G || G._mortTraitee) return;
  G._mortTraitee = true;
  // Laisse le combat / la scène en cours se fermer avant l'écran de mort.
  const attendre = () => (flow.overlayOuvert() ? setTimeout(attendre, 200) : ecranMort(cause));
  setTimeout(attendre, 600);
});
function ecranMort(cause = 'combat') {
  const diff = presetDifficulte(G.world.difficulte);
  const permanent = !!(diff && diff.permanent) && G.mode === 'solo';
  const texte = genrer((MORTS[cause] && (MORTS[cause].texte || MORTS[cause])) || MORTS.combat || 'Tu es mort.');
  const st = G.player.stats || {};
  const jours = clock.jour();
  arreterPartie();
  try { audio.playAmbiance('mort'); audio.sfx('mort'); } catch (e) {}
  if (permanent) effacerSauvegarde('solo');
  const c = afficher(`
    <h2 class="gros-titre sang">${escapeHtml(genrer(G.player.genre === 'f' ? 'Morte' : 'Mort'))}</h2>
    <div class="recit">${texteHtml(typeof texte === 'string' ? texte : String(texte))}</div>
    <div class="bilan"><span><b>${jours}</b> jour${jours > 1 ? 's' : ''}</span><span><b>${st.morts || 0}</b> morts abattus</span><span><b>${Math.round((st.distance || 0) / 100) / 10} km</b> parcourus</span></div>
    <div class="menu">
      ${!permanent && G.mode === 'solo' && aSauvegarde('solo') ? btn({ cls: 'primaire', data: 'data-a="recharger"' }, 'Revenir en arrière', 'à la dernière sauvegarde (entrée dans un lieu)') : ''}
      ${btn({ data: 'data-a="titre"' }, 'Écran titre')}
    </div>`, 'saint_roch_nuit');
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = () => (b.dataset.a === 'recharger' ? continuer('solo') : ecranTitre()));
}

// ---------- Fins ----------
on('flag', ({ k, v }) => {
  if (!v || finMontree || !partieEnCours) return;
  const fin = Object.values(FINS).find(f => f.flag === k);
  if (!fin) return;
  finMontree = true;
  const attendre = () => (flow.overlayOuvert() ? setTimeout(attendre, 300) : ecranFin(fin));
  setTimeout(attendre, 400);
});
function ecranFin(fin) {
  const st = G.player.stats || {};
  const jours = clock.jour();
  noteJournal(`Fin — ${fin.titre} : ${fin.sousTitre}`, 'fin');
  sauver();
  arreterPartie();
  try { audio.playAmbiance('refuge'); } catch (e) {}
  const c = afficher(`
    <p class="sous-titre" style="margin:0 0 4px">${escapeHtml(fin.sousTitre || '')}</p>
    <h2 class="gros-titre">${escapeHtml(fin.titre)}</h2>
    <div class="recit">${texteHtml(genrer(fin.resume || ''))}</div>
    <div class="bilan"><span><b>${jours}</b> jours</span><span><b>${st.morts || 0}</b> morts abattus</span><span><b>${(G.documents || []).length}</b> documents</span></div>
    <div class="menu">${btn({ cls: 'primaire', data: 'data-a="titre"' }, 'Écran titre')}</div>`, fin.decor || 'emperi_remparts_aube');
  c.querySelector('[data-a]').onclick = () => ecranTitre();
}

// ---------- Menu → titre ----------
on('menu:titre', () => { if (G && G.mode === 'solo') sauver(); ecranTitre(); });

// ---------- Sauvegarde auto ----------
setInterval(() => { if (partieEnCours && G && G.mode !== 'invite' && !flow.overlayOuvert()) sauver(); }, 60000);
window.addEventListener('pagehide', () => { if (partieEnCours && G) sauver(); });

// ---------- Service worker (hors-ligne) ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !/^\/dev\//.test(location.pathname)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ---------- Invite de rotation (mobile en portrait) ----------
document.body.append(el('div', { class: 'tourner' }, el('div', {}, 'Tourne ton téléphone'), el('div', { style: { fontSize: '13px', color: '#7d776c' } }, 'One More Day se joue en paysage')));

demarrerToasts();
installerTapFiable();
window.__omd = { get G() { return G; }, flow, clock, emit };
try { sessionStorage.removeItem('omd_secours'); } catch (e) {}
const q = new URLSearchParams(location.search);
if (q.get('continuer')) continuer('solo'); else ecranTitre();
// Version en ligne plus récente que celle en cache : on recharge une fois, à l'écran titre.
import('./version.js').then(async (v) => {
  try { if (sessionStorage.getItem('omd_maj')) return; if (await v.majDisponible() && !partieEnCours) { sessionStorage.setItem('omd_maj', '1'); v.appliquerMaj(); } } catch (e) {}
}).catch(() => {});
