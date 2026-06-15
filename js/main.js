// ============ Démarrage, menus, panneaux, mort & fin ============
import { G, newGame, save, load, hasSave, clearSave, skillLevel, SKILLS, heureTxt, getFlag, setFlag, noteJournal, chance } from './state.js';
import { render, updateHUD, showHUD, log, logHtml, btnAct, $, toast, showPanel, closePanel, panelOuvert, evtOuvert, closeEvt, attente } from './ui.js';
import { ico, ICONS } from './icons.js';
import { svgScene } from './illustrations.js';
import { item } from './data/items.js';
import { cloth, CLOTHES, SLOTS } from './data/clothing.js';
import { MORTS, SCENES } from './data/story.js';
import {
  poidsTotal, poidsMax, poidsPlafond, surcharge, enSurpoids, espaceUtilise, espaceMax, equiperArme, desequiperArme,
  equiperVetement, desequiperVetement, dropItem, protectionTotale, chaleurTotale, hasItem,
  accesRapide, nbSlotsAccesRapide, mettreEnAccesRapide, retirerAccesRapide, peutAccesRapide,
  countItem, defItem, removeItem, libelleJetes,
  estContenant, recipientOuvert, contenance, descEau, fmtL, verserEau, instancePourEau, consolider,
  estLampe, lampeAPiles, basculerLampe, tenirLampe, lumiereActive,
  etatPilesLampe, changerPilesLampe, retirerPilesLampe,
} from './inventory.js';
import {
  consommer, soigner, desinfecterAlcool, appliquerSoinCible, BLESSURES, nomBlessure, froidActuel,
  boireContenant, bouillirContenant, peutBouillirContenant, tempsBouillir, dechirerVetement, dechirerEquipe,
} from './survival.js';
import { solDe, keyCourante } from './world.js';
import { listeRecettes, fabriquer } from './crafting.js';
import { renderLieu, objectifActuel, initPosition, syncCaseCourante } from './map.js';
import { jouerScene } from './scenes.js';
import { jouerCine } from './cinema.js';
import { enCombat } from './combat.js';
import { demarrerAlertes, stopperAlertes } from './effects.js';
import { initAudio, playAmbiance, sfx, setMuted, isMuted, getVolume, setVolume, stopCombatMusic, setHeartbeat } from './audio.js';
import * as multi from './multi.js';
import { SERVEUR_EN_LIGNE } from './data/serveur.js';
import { majDisponible, appliquerMaj } from './version.js';

// La partie est-elle terminée (mort affichée, fin de chapitre, abandon) ?
// Tant que c'est vrai, l'autosauvegarde est coupée pour ne jamais écraser
// la dernière bonne sauvegarde avec un état mort.
let partieTerminee = false;

// ---------- Audio : démarre au premier geste ----------
document.addEventListener('pointerdown', function once() {
  initAudio();
  if (!G) playAmbiance('calme');
  document.removeEventListener('pointerdown', once);
}, { once: true });

// ---------- Plein écran (mobile) ----------
// API Fullscreen avec préfixes webkit ; sur iOS Safari (pas d'API), les boutons
// n'apparaissent pas. La préférence (omd_fullscreen) est rejouée au premier
// geste de la session — les navigateurs exigent un geste utilisateur.
const FS_KEY = 'omd_fullscreen';
function pleinEcranDispo() {
  const el = document.documentElement;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}
function estPleinEcran() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
// Verrou paysage : Android Chrome ne l'accepte QU'EN plein écran et après un geste.
// (iOS Safari n'a pas l'API : l'appel échoue en silence — l'app installée suit alors
// la directive `orientation` du manifest.)
function verrouillerPaysage() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      const p = screen.orientation.lock('landscape');
      if (p && p.catch) p.catch(() => {});
    }
  } catch (e) { /* non supporté : tant pis, le manifest fait le reste */ }
}
function entrerPleinEcran() {
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) {
      const p = el.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) p.then(verrouillerPaysage).catch(() => {});
      else verrouillerPaysage();
    } else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); verrouillerPaysage(); }
  } catch (e) { /* silencieux : certains contextes refusent */ }
}
function sortirPleinEcran() {
  try {
    if (document.exitFullscreen) {
      const p = document.exitFullscreen();
      if (p && p.catch) p.catch(() => {});
    } else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch (e) { /* silencieux */ }
}
function basculerPleinEcran() {
  if (estPleinEcran()) { sortirPleinEcran(); try { localStorage.setItem(FS_KEY, '0'); } catch (e) {} }
  else { entrerPleinEcran(); try { localStorage.setItem(FS_KEY, '1'); } catch (e) {} }
}
// Les libellés / icônes reflètent l'état réel (la touche Échap sort aussi du plein écran)
function majBoutonsPleinEcran() {
  const plein = estPleinEcran();
  const coin = $('#btn-fs-titre');
  if (coin) {
    coin.innerHTML = ico(plein ? 'reduire_ecran' : 'plein_ecran');
    coin.title = plein ? 'Quitter le plein écran' : 'Plein écran';
  }
  const opt = $('[data-o="plein-ecran"]');
  if (opt) opt.firstChild.textContent = plein ? 'Quitter le plein écran' : 'Plein écran';
}
document.addEventListener('fullscreenchange', majBoutonsPleinEcran);
document.addEventListener('webkitfullscreenchange', majBoutonsPleinEcran);
// Plein écran + paysage IMPOSÉS au premier geste : par défaut sur tactile (mobile),
// et toujours si la préférence a été activée. On peut y renoncer explicitement (FS_KEY='0').
const estTactile = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
if (pleinEcranDispo() && (localStorage.getItem(FS_KEY) === '1' || (estTactile && localStorage.getItem(FS_KEY) !== '0'))) {
  document.addEventListener('pointerdown', function fsOnce() {
    if (!estPleinEcran()) entrerPleinEcran();
    else verrouillerPaysage();
  }, { once: true });
}

// ---------- Écran titre ----------
function ecranTitre() {
  showHUD(false);
  stopCombatMusic();
  setHeartbeat(false);
  multi.arreter(); // on quitte toute session co-op en revenant au titre
  stopperAlertes(); // pas de voile d'infection sur l'écran titre
  render(`
    <div class="illu">${svgScene('titre')}</div>
    <h1 class="title">One More <em>Day</em></h1>
    <p class="subtitle">Salon-de-Provence. Jour 23. Survivre un jour de plus.</p>
    <div class="menu">
      ${hasSave() ? btnAct('data-m="continuer"', 'Continuer', 'reprendre ta partie', { classe: 'primary' }) : ''}
      ${btnAct('data-m="nouvelle"', 'Nouvelle partie', hasSave() ? 'efface la partie en cours' : '')}
      ${btnAct('data-m="aide"', 'Comment survivre')}
    </div>
    <div class="warn-adulte">Jeu pour adultes — violence et gore explicites.
    Sur Android : ouvre cette page dans Chrome puis « Ajouter à l'écran d'accueil » pour l'installer.</div>
    ${pleinEcranDispo() ? `<button class="fs-coin" id="btn-fs-titre" title="${estPleinEcran() ? 'Quitter le plein écran' : 'Plein écran'}">${ico(estPleinEcran() ? 'reduire_ecran' : 'plein_ecran')}</button>` : ''}`);
  const fsBtn = $('#btn-fs-titre');
  if (fsBtn) fsBtn.onclick = () => { sfx('clic'); basculerPleinEcran(); };
  const map = {
    continuer: () => {
      if (!load()) return toast('Sauvegarde illisible.');
      partieTerminee = false;
      showHUD(true);
      updateHUD();
      demarrerAlertes();
      if (G.world.sceneCourante) jouerScene(G.world.sceneCourante);
      else renderLieu();
    },
    nouvelle: ecranNouvelle,
    aide: ecranAide,
  };
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { sfx('clic'); map[b.dataset.m](); });
}

function ecranAide() {
  render(`
    <h2 class="lieu-nom">Comment survivre</h2>
    <div class="narration">• <em>La carte</em> : touche une case pour la repérer, touche-la encore pour t'y rendre. Tu avances d'une ou deux cases selon ta forme et ta charge. En intérieur, la carte est un plan : les murs disent où l'on ne passe pas, les battants dessinés sont des portes (rouille : verrouillée). Les intérieurs fouillés deviennent sûrs — les rues, jamais.
• <em>L'obscurité</em> a deux niveaux : la pénombre (violet pointillé — on fouille mal sans lampe) et le noir total (violet plein — sans lumière, fouiller devient un pari).
• <em>La fouille</em> se fait d'un seul trait : la barre se remplit et les objets sortent peu à peu, posés au sol. À 100 % la zone est vidée. Tu peux t'arrêter quand tu veux — tu ramasses alors ce que tu as déjà trouvé. À deux dans la même salle, ça va plus vite.
• <em>L'accès rapide</em> : sans ceinture (ou holster, ou gilet), pas question d'ouvrir le sac en plein combat. Tu te bats avec ce que tu as en main, point.
• <em>Ton état</em> se lit en haut à droite : douleur, fatigue, faim, soif, saignement. Pas de chiffres. Écoute ton corps.
• <em>Les blessures</em> : égratignure, entaille, blessure profonde, plaie ouverte. Bande ce qui saigne, désinfecte tout, recouds le reste. Une infection non soignée est une condamnation.
• <em>Mange, bois, dors.</em> L'eau croupie se boit bouillie. La viande crue se mange cuite.
• <em>Objectif</em> : la radio parle d'un refuge à Miramas-le-Vieux. La voie ferrée y mène — encore faut-il une machine qui roule.</div>
    <div class="menu">${btnAct('data-r="1"', 'Retour', '', { classe: 'primary' })}</div>`);
  $('[data-r]').onclick = () => ecranTitre();
}

function ecranNouvelle() {
  render(`
    <h2 class="lieu-nom">Nouvelle partie</h2>
    <div class="narration">Jour 23. Le Grand Hôtel de la Poste, place Crousillat, Salon-de-Provence. La réserve de la cuisine est morte hier soir : une boîte de flageolets, partagée avec personne.\n\nDehors, la Fontaine Moussue coule toujours. Eux aussi sont toujours là.\n\n<em>Une seule vie. Quand c'est fini, c'est fini — pas de seconde chance.</em></div>
    <div class="menu">
      <input type="text" id="inp-nom" maxlength="16" placeholder="Ton prénom (Sam)" autocomplete="off">
      ${btnAct('data-d="jouer"', 'Solo', 'une seule vie — la mort efface tout, sans retour', { classe: 'primary' })}
      ${btnAct('data-d="coop"', 'Multijoueur →', 'à deux : en ligne ou sur le même Wi-Fi')}
      ${btnAct('data-d="retour"', 'Retour')}
    </div>`);
  document.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
    sfx('clic');
    if (b.dataset.d === 'retour') return ecranTitre();
    const nom = ($('#inp-nom').value || 'Sam').trim().slice(0, 16);
    if (b.dataset.d === 'coop') return ecranCoop(nom);
    clearSave();
    newGame(nom);
    initPosition();
    partieTerminee = false;
    save();
    showHUD(true);
    updateHUD();
    demarrerAlertes();
    jouerIntro();
  });
}

// ---------- Co-op : héberger ou rejoindre (même Wi-Fi OU serveur en ligne) ----------
let coopUrl = null;  // null = co-op sur le même Wi-Fi ; sinon l'URL du serveur en ligne
let infosLan = null; // { port, ips } récupéré de /api/lan, pour afficher l'adresse à partager
function codeSalon() {
  const lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I/O/0/1 (ambigus)
  let c = '';
  for (let i = 0; i < 4; i++) c += lettres[Math.floor(Math.random() * lettres.length)];
  return c;
}
async function chargerLan() {
  if (infosLan) return infosLan;
  try { const r = await fetch('/api/lan'); if (r.ok) infosLan = await r.json(); } catch (e) {}
  return infosLan;
}
function adresseLan() {
  if (!infosLan || !infosLan.ips || !infosLan.ips.length) return null;
  return `http://${infosLan.ips[0]}:${infosLan.port}`;
}

// Porte de version : avant une partie EN LIGNE, on impose la dernière version (les deux
// joueurs doivent être à la même). Renvoie true si on peut continuer, false si une mise
// à jour est requise (l'écran de mise à jour est alors affiché). Le Wi-Fi/solo passent.
async function porteDeVersion(nom) {
  let maj = false;
  try { maj = await majDisponible(); } catch (e) {}
  if (maj) { ecranMajRequise(nom); return false; }
  return true;
}
function ecranMajRequise(nom) {
  render(`
    <h2 class="lieu-nom">Mise à jour requise</h2>
    <div class="narration">Une nouvelle version du jeu est disponible. Pour jouer <em>en ligne</em>, ton jeu et celui de ton coéquipier doivent être à la même version.\n\nMets à jour pour continuer — ta sauvegarde locale n'est pas touchée.</div>
    <div class="menu">
      ${btnAct('data-m="maj"', 'Mettre à jour maintenant', 'recharge la dernière version', { classe: 'primary' })}
      ${btnAct('data-m="retour"', 'Retour')}
    </div>`);
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
    sfx('clic');
    if (b.dataset.m === 'maj') { appliquerMaj(); return; }
    ecranCoop(nom);
  });
}

// Petite échappe HTML pour afficher sans risque un nom de joueur venu du réseau.
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

// ÉTAPE 1 du multi : EN LIGNE ou LOCAL (même Wi-Fi). Fixe coopUrl puis va à la liste des salons.
function ecranCoop(nom) {
  const enLigne = !!SERVEUR_EN_LIGNE; // un serveur permanent est-il configuré ?
  render(`
    <h2 class="lieu-nom">Multijoueur</h2>
    <div class="narration">Où voulez-vous jouer à deux ?\n\n<em>En ligne</em> : via le serveur permanent, chacun chez soi.\n<em>Local</em> : sur le même Wi-Fi, l'un héberge depuis son appareil.\n\nVous vous voyez sur la carte quand vous êtes dans le champ de vision l'un de l'autre, et vous pouvez vous épauler en combat.</div>
    <div class="menu">
      <input type="text" id="inp-nom" maxlength="16" placeholder="Ton prénom (Sam)" autocomplete="off" value="${(nom || '').replace(/"/g, '')}">
      ${enLigne ? btnAct('data-c="net"', 'En ligne', 'serveur permanent — où que vous soyez', { classe: 'primary' }) : ''}
      ${btnAct('data-c="lan"', 'Local — même Wi-Fi', enLigne ? 'sans Internet, sur votre réseau' : 'sur votre réseau, sans Internet', { classe: enLigne ? '' : 'primary' })}
      ${enLigne ? '' : '<p class="cap-line">Aucun serveur en ligne configuré : seul le jeu local (même Wi-Fi) est disponible.</p>'}
      ${btnAct('data-c="retour"', 'Retour')}
    </div>`);
  document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
    sfx('clic');
    const n = ($('#inp-nom').value || 'Sam').trim().slice(0, 16);
    if (b.dataset.c === 'retour') return ecranNouvelle();
    coopUrl = b.dataset.c === 'net' ? SERVEUR_EN_LIGNE : null; // cible : serveur en ligne ou LAN
    ecranSalons(n);
  });
}

// ÉTAPE 2 du multi : HÉBERGER une nouvelle partie, ou REJOINDRE l'un des salons ouverts.
// Le nom d'un salon = prénom de l'hôte + son jour/heure de jeu (rafraîchi en continu).
function ecranSalons(nom) {
  const enLigne = !!coopUrl;
  render(`
    <h2 class="lieu-nom">Parties — ${enLigne ? 'en ligne' : 'même Wi-Fi'}</h2>
    <div class="narration">Héberge ta propre partie, ou rejoins l'une des parties ouvertes ci-dessous.</div>
    <div class="menu">
      ${btnAct('data-s="hote"', 'Héberger une nouvelle partie', 'tu crées le monde, l\'autre te rejoint', { classe: 'primary' })}
    </div>
    <p class="cap-line" style="margin-top:14px"><b>Salons ouverts</b></p>
    <div id="salons-liste" class="item-list"><p class="cap-line">Recherche des parties…</p></div>
    <div id="salons-statut" class="cap-line"></div>
    <div class="menu">
      ${btnAct('data-s="refresh"', 'Rafraîchir la liste')}
      ${btnAct('data-s="retour"', 'Retour')}
    </div>`);
  const charger = async () => {
    const liste = $('#salons-liste');
    if (liste) liste.innerHTML = '<p class="cap-line">Recherche des parties…</p>';
    const salons = await multi.listerSalons(coopUrl);
    if (!$('#salons-liste')) return; // l'écran a changé entre-temps
    if (!salons.length) {
      $('#salons-liste').innerHTML = '<p class="cap-line">Aucune partie ouverte pour l\'instant. Héberge la tienne, ou demande à l\'autre joueur de le faire.</p>';
      return;
    }
    $('#salons-liste').innerHTML = salons.map(s => {
      const h = String(s.heure).padStart(2, '0'), m = String(s.minute).padStart(2, '0');
      return `<div class="item-card"><div class="item-line"><span class="item-nom">${escapeHtml(s.nom)} <span class="qty">Jour ${s.jour} — ${h}:${m}</span></span></div>
        <div class="item-btns"><button data-rejoindre="${escapeHtml(s.code)}">Rejoindre</button></div></div>`;
    }).join('');
    $('#salons-liste').querySelectorAll('[data-rejoindre]').forEach(b => b.onclick = async () => {
      sfx('clic');
      if (enLigne && !(await porteDeVersion(nom))) return; // en ligne : on impose la dernière version
      const statut = $('#salons-statut');
      if (statut) statut.textContent = 'Connexion à la partie…';
      rejoindrePartie(b.dataset.rejoindre, nom, statut);
    });
  };
  charger();
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
    sfx('clic');
    if (b.dataset.s === 'retour') return ecranCoop(nom);
    if (b.dataset.s === 'refresh') return charger();
    if (b.dataset.s === 'hote') return ecranCoopHote(nom);
  });
}

function ecranCoopHote(nom) {
  const code = codeSalon();
  const enLigne = !!coopUrl;
  const afficher = (adr) => {
    render(`
      <h2 class="lieu-nom">Héberger la partie${enLigne ? ' — en ligne' : ''}</h2>
      <div class="narration">${enLigne
        ? 'Tu héberges sur le serveur permanent. Ton coéquipier n\'a qu\'à ouvrir « Multijoueur → En ligne » et choisir <b>ta partie</b> dans la liste. Tu peux commencer tout de suite — il atterrira là où tu en seras.'
        : `Donne à l'autre joueur ${adr ? `l'adresse <b class="code">${adr}</b> à ouvrir dans son navigateur (même Wi-Fi)` : 'ton adresse réseau (visible dans la fenêtre du serveur)'}.\n\nIl ouvre « Multijoueur → Local » et choisit <b>ta partie</b> dans la liste — sans code. Tu peux commencer tout de suite — il atterrira là où tu en seras.`}
      \n\n<em>Ta partie apparaîtra sous : ${escapeHtml(nom)} — Jour 1, 08:00.</em></div>
      <div class="menu">
        ${btnAct('data-d="jouer"', 'Créer et jouer', 'une seule vie — la mort efface tout, sans retour', { classe: 'primary' })}
        ${btnAct('data-d="retour"', 'Retour')}
      </div>`);
    document.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => {
      sfx('clic');
      if (b.dataset.d === 'retour') return ecranSalons(nom);
      if (enLigne && !(await porteDeVersion(nom))) return; // en ligne : on impose la dernière version
      const r = await multi.demarrer({ code, role: 'host', nom, url: coopUrl, meta: { jour: 1, heure: 8, minute: 0 } });
      if (!r.ok) { toast('Hébergement impossible : ' + (r.raison || 'serveur injoignable.')); return; }
      clearSave();
      newGame(nom);
      initPosition();
      partieTerminee = false;
      save();
      showHUD(true);
      updateHUD();
      demarrerAlertes();
      toast('Partie hébergée. L\'autre joueur n\'a qu\'à rejoindre.', 7000);
      log(enLigne
        ? 'Co-op en ligne : tu héberges sur le serveur permanent. Ton coéquipier choisit « Rejoindre — en ligne » et te rejoint directement. En attente d\'un coéquipier…'
        : 'Co-op : tu héberges la partie. Sur l\'autre appareil (même Wi-Fi, ton adresse), il choisit « Rejoindre une partie » et te rejoint directement. En attente d\'un coéquipier…', 'good');
      jouerIntro();
    });
  };
  if (enLigne) afficher(null);
  else chargerLan().then(() => afficher(adresseLan()));
}

// Le flux invité : on prépare un joueur neuf, on se connecte, et on ADOPTE le monde
// de l'hôte dès qu'il arrive (onMonde). On n'entre dans le jeu qu'à ce moment-là.
function rejoindrePartie(code, nom, statut) {
  let entre = false;
  clearSave();
  newGame(nom); // un joueur neuf ; le MONDE viendra de l'hôte
  multi.poser('onMonde', (world, nomHote) => {
    if (entre) return; // une seule adoption
    entre = true;
    G.world = JSON.parse(JSON.stringify(world)); // copie profonde du monde de l'hôte
    partieTerminee = false;
    save();
    showHUD(true);
    updateHUD();
    demarrerAlertes();
    log(`Tu rejoins la partie de ${nomHote || 'l\'hôte'}. Vous voilà dans le même Salon.`, 'good');
    // L'invité regarde lui aussi l'intro et « ouvre les yeux » — le monde ne démarre
    // qu'une fois les DEUX prêts (cf. multi.signalerPret / coopEntrerOuAttendre).
    jouerIntro();
  });
  multi.demarrer({ code, role: 'guest', nom, url: coopUrl }).then((r) => {
    if (!r.ok) { if (statut) statut.textContent = 'Échec : ' + (r.raison || 'connexion impossible.'); return; }
    if (statut) statut.textContent = 'Connecté — en attente du monde de l\'hôte…';
    // garde-fou : si le monde n'arrive pas, on prévient
    setTimeout(() => { if (!entre && statut) statut.textContent = 'Toujours en attente de l\'hôte… (est-il bien dans une partie ?)'; }, 7000);
  });
}

// La grande introduction : Salon paisible (cinématique) → la vie d'avant (texte)
// Intro CINÉMATIQUE, peu de texte : la caméra raconte. Trois volets enchaînés —
// Salon paisible → la ville en feu → la fuite et le terrier barricadé — puis un seul
// court panneau de réveil (l'objectif). Chaque volet se saute avec « Passer ▸ ».
// L'intro est PERSONNELLE : chacun la regarde de son côté (on passe distant=true pour
// ne PAS la diffuser au coéquipier, sinon elle se rejouerait en double chez lui).
function jouerIntro() {
  jouerCine('intro_avant', () =>
    jouerCine('intro_chaos', () =>
      jouerCine('intro_fuite', () =>
        jouerScene('intro_reveil'), true), true), true);
}

// ---------- Boutons fixes ----------
// Coin bas droit : le PERSONNAGE (corps, inventaire+fabrication).
// Coin bas gauche : le MENU DU JEU (journal, options).
function lierHUD() {
  const fabs = [
    ['#btn-inv', 'sac', () => panneauInventaire()],
    ['#btn-perso', 'corps', () => panneauCorps()],
    ['#btn-journal', 'journal', panneauJournal],
    ['#btn-options', 'options', panneauOptions],
  ];
  for (const [sel, icone, fn] of fabs) {
    const b = $(sel);
    b.innerHTML = ico(icone);
    b.onclick = () => {
      if (!G) return;
      if (enCombat()) return toast('Pas pendant un combat !');
      if (evtOuvert()) return; // un événement attend une décision
      sfx('clic');
      if (panelOuvert()) { closePanel(); return; }
      fn();
    };
  }
}

// ---------- Inventaire PLEIN ÉCRAN : onglets Sac / Porter / Fabrication ----------
let ongletInv = 'sac'; // 'sac' | 'porter' | 'craft'

function panneauInventaire(tab = null) {
  if (tab) ongletInv = tab;
  const titres = { sac: 'Inventaire', porter: 'Porter', craft: 'Fabrication' };
  const entete = `<div class="panel-head"><h2>${titres[ongletInv]}</h2><button class="panel-close">×</button></div>
    <div class="onglets">
      <button class="onglet ${ongletInv === 'sac' ? 'on' : ''}" data-onglet="sac">${ico('sac')} Sac</button>
      <button class="onglet ${ongletInv === 'porter' ? 'on' : ''}" data-onglet="porter">${ico('porter')} Porter</button>
      <button class="onglet ${ongletInv === 'craft' ? 'on' : ''}" data-onglet="craft">${ico('craft')} Fabrication</button>
    </div>`;
  const box = ongletInv === 'craft' ? remplirCraft(entete)
    : ongletInv === 'porter' ? remplirPorter(entete)
    : remplirInventaire(entete);
  box.querySelectorAll('[data-onglet]').forEach(b => {
    b.onclick = () => { sfx('clic'); panneauInventaire(b.dataset.onglet); };
  });
}

// ---------- Contenants d'eau : actions communes aux onglets Sac et Porter ----------
// spec : un index d'inventaire (chaîne numérique) ou 'main' (l'objet tenu en main).
function refContenant(spec) {
  return spec === 'main' ? G.player.equip.arme : G.player.inventaire[parseInt(spec, 10)];
}
function boutonsContenant(spec, entry) {
  if (!entry || !entry.eau) return '';
  let b = `<button data-c-boire="${spec}">Boire (~0,5 L)</button>`;
  if (entry.eau.q !== 'bouillie') {
    b += `<button data-c-bouillir="${spec}" ${peutBouillirContenant(entry) ? '' : 'disabled'}>Faire bouillir (${tempsBouillir(entry)} min)</button>`;
  }
  b += `<button data-c-verser="${spec}">Transvaser</button>`;
  b += `<button data-c-vider="${spec}">Vider</button>`;
  return b;
}
function lierContenants(box) {
  box.querySelectorAll('[data-c-boire]').forEach(b => {
    b.onclick = () => {
      const spec = b.dataset.cBoire;
      attente('Tu bois…', 5, () => {
        const res = boireContenant(refContenant(spec));
        if (res.ok) sfx('boire');
        res.messages.forEach(m => log(m.t, m.c));
        updateHUD(); save(); panneauInventaire();
      });
    };
  });
  box.querySelectorAll('[data-c-bouillir]').forEach(b => {
    b.onclick = () => {
      const ref = refContenant(b.dataset.cBouillir);
      if (!ref || !ref.eau) return;
      attente('L\'eau chauffe, frémit, roule…', tempsBouillir(ref), () => {
        const res = bouillirContenant(ref);
        res.messages.forEach(m => log(m.t, m.c));
        if (res.ok) sfx('craft');
        if (res.mort) { closePanel(); return; } // mort pendant l'ébullition : ne pas écraser la sauvegarde
        updateHUD(); save(); panneauInventaire();
      });
    };
  });
  box.querySelectorAll('[data-c-verser]').forEach(b => {
    b.onclick = () => { sfx('clic'); panneauTransvaser(b.dataset.cVerser); };
  });
  box.querySelectorAll('[data-c-vider]').forEach(b => {
    b.onclick = () => {
      const ref = refContenant(b.dataset.cVider);
      if (!ref || !ref.eau) return;
      delete ref.eau;
      consolider();
      sfx('eau_verse');
      log('Tu vides l\'eau au sol. Elle file entre les pierres, déjà perdue.', '');
      updateHUD(); save(); panneauInventaire();
    };
  });
}

// Choisir le récipient qui reçoit, puis verser (limité aux capacités).
function panneauTransvaser(srcSpec) {
  const src = refContenant(srcSpec);
  if (!src || !src.eau) { panneauInventaire(); return; }
  const dSrc = defItem(src.id);
  let html = `<div class="panel-head"><h2>Transvaser</h2><button class="panel-close">×</button></div>
    <p class="cap-line">Depuis : <b>${dSrc.nom}</b> — ${descEau(src)}. Choisis le récipient qui reçoit.</p>
    <div class="item-list">`;
  const cibles = [];
  // l'objet tenu en main peut recevoir (c'est le seul moyen de remplir un récipient ouvert)
  const main = G.player.equip.arme;
  if (srcSpec !== 'main' && main && estContenant(main.id) && (main.eau ? main.eau.L : 0) < contenance(main.id)) {
    cibles.push(['main', main, 'en main']);
  }
  G.player.inventaire.forEach((it, i) => {
    if (String(i) === srcSpec || !estContenant(it.id)) return;
    if (recipientOuvert(it.id)) return; // un récipient ouvert ne se remplit pas DANS le sac
    if ((it.eau ? it.eau.L : 0) >= contenance(it.id)) return;
    cibles.push([String(i), it, 'dans le sac']);
  });
  if (!cibles.length) html += `<p class="cap-line">Aucun récipient libre. Un récipient ouvert (canette, casserole) ne se remplit que tenu en main.</p>`;
  cibles.forEach(([spec, it, ou]) => {
    const d = defItem(it.id);
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${(it.qty || 1) > 1 ? ` <span class="qty">×${it.qty}</span>` : ''}</span>
      <span class="item-meta">${it.eau ? descEau(it) : `vide — ${fmtL(contenance(it.id))} L`} · ${ou}</span></div>
      <div class="item-btns"><button data-verser-vers="${spec}">Verser ici</button></div></div>`;
  });
  html += `</div><div class="actions">${btnAct('data-verser-retour="1"', 'Retour')}</div>`;
  const box = showPanel(html, { plein: true });
  box.querySelectorAll('[data-verser-vers]').forEach(b => {
    b.onclick = () => {
      const dstSpec = b.dataset.verserVers;
      const source = refContenant(srcSpec);
      const dst = dstSpec === 'main' ? G.player.equip.arme : instancePourEau(parseInt(dstSpec, 10));
      const r = verserEau(source, dst);
      if (!r.ok) { toast(r.raison || 'Impossible de verser.'); return; }
      sfx('eau_verse');
      log(`Tu transvases ${fmtL(r.L)} L sans en perdre une goutte.${r.gache ? ' Le mélange est à rebouillir : eau croupie.' : ''}`, r.gache ? 'warn' : '');
      consolider();
      updateHUD(); save(); panneauInventaire();
    };
  });
  box.querySelector('[data-verser-retour]').onclick = () => { sfx('clic'); panneauInventaire(); };
  return box;
}

// ---------- Lampes : état (allumée + piles) et actions, communs aux onglets ----------
// La lumière était « invisible » : impossible de savoir, depuis le sac, si une lampe
// était allumée, combien de pile il restait, ni de l'allumer sans bidouille. Tout est
// désormais explicite ici (état, jauge de piles, allumer/éteindre, changer/retirer piles).

// Résout l'objet-lampe désigné par un descripteur : 'main', 'ar:<i>' ou 'sac:<i>'.
function lampeRef(desc) {
  if (desc === 'main') return G.player.equip.arme;
  const [zone, i] = desc.split(':');
  if (zone === 'ar') return accesRapide()[parseInt(i, 10)];
  return G.player.inventaire[parseInt(i, 10)];
}
// Bloc visuel : pastille allumée/éteinte + jauge de piles (ou de flamme, torche).
function lampeInfo(ref) {
  const ep = etatPilesLampe(ref);
  const eclaire = ref.on && (G.player.equip.arme === ref || accesRapide().includes(ref));
  const etiq = ref.on
    ? `<span class="lampe-on">allumée${eclaire ? ' — elle éclaire' : ' — mais dans le sac, n\'éclaire pas'}</span>`
    : `<span class="lampe-off">éteinte</span>`;
  let bat = '';
  if (ep) {
    const cls = ep.pct > 50 ? 'bon' : ep.pct > 20 ? 'moyen' : 'bas';
    bat = `<div class="pile-bar"><i class="${cls}" style="width:${ep.pct}%"></i></div>
      <small class="pile-lib">${ep.torche ? 'flamme' : 'piles'} ${ep.pct}% · ~${ep.minutes} min</small>`;
  } else if (lampeAPiles(ref.id)) {
    bat = `<small class="pile-lib">piles non entamées</small>`;
  }
  return `<div class="lampe-info">${ico('lumiere')} ${etiq}${bat}</div>`;
}
// Boutons d'action d'une lampe (zone : 'sac' | 'ar' | 'main').
function boutonsLampe(desc, ref, zone) {
  let b = '';
  const ep = etatPilesLampe(ref);
  if (ref.on) {
    b += `<button data-lact="eteindre" data-lref="${desc}">Éteindre</button>`;
    if (zone === 'sac') b += `<button data-lact="main" data-lref="${desc}" title="Pour éclairer, garde-la en main ou à la ceinture">Prendre en main</button>`;
  } else if (zone === 'sac') {
    b += `<button data-lact="allumer-main" data-lref="${desc}" title="Sortie du sac, prise en main et allumée">Allumer</button>`;
    b += `<button data-lact="main" data-lref="${desc}">Prendre en main</button>`;
  } else {
    b += `<button data-lact="allumer" data-lref="${desc}">Allumer</button>`;
  }
  if (lampeAPiles(ref.id)) {
    if (ep && ep.pct < 100 && hasItem('piles')) b += `<button data-lact="changer" data-lref="${desc}" title="Une paire neuve à la place de l'entamée (−1 en réserve)">Changer les piles</button>`;
    if (ep) b += `<button data-lact="retirer" data-lref="${desc}" title="Sort la paire ; tu la récupères si elle est encore neuve">Retirer les piles</button>`;
  }
  return b;
}
// Câblage commun des boutons de lampe pour un panneau (Sac ou Porter).
function lierLampes(box) {
  box.querySelectorAll('[data-lact]').forEach(b => {
    b.onclick = () => {
      const ref = lampeRef(b.dataset.lref);
      if (!ref) { panneauInventaire(); return; }
      const nom = defItem(ref.id).nom;
      switch (b.dataset.lact) {
        case 'allumer': case 'eteindre': {
          const r = basculerLampe(ref);
          if (!r.ok) { toast(r.raison || 'Impossible.'); return; }
          sfx('clic'); log(r.on ? `${nom} : allumée.` : `${nom} : éteinte.`, '');
          break;
        }
        case 'allumer-main': {
          const idx = G.player.inventaire.indexOf(ref);
          const t = tenirLampe(idx);
          if (t && t.renverse) log(`${t.renverse} : l'eau se renverse — tu avais les mains prises.`, 'warn');
          const main = G.player.equip.arme;
          const r = basculerLampe(main);
          sfx('clic');
          if (!r.ok) { toast(r.raison || 'Impossible.'); log(`${nom} en main, mais ${(r.raison || '').toLowerCase()}`, 'warn'); }
          else log(`${nom} en main, allumée — elle éclaire.`, '');
          break;
        }
        case 'main': {
          const idx = G.player.inventaire.indexOf(ref);
          const t = tenirLampe(idx);
          if (t && t.renverse) log(`${t.renverse} : l'eau se renverse — tu avais les mains prises.`, 'warn');
          sfx('clic'); log(`${nom} en main.`, '');
          break;
        }
        case 'changer': {
          const r = changerPilesLampe(ref);
          if (!r.ok) { toast(r.raison || 'Impossible.'); return; }
          sfx('clic'); log(`${nom} : piles neuves. Le faisceau redevient franc.`, 'good');
          break;
        }
        case 'retirer': {
          const r = retirerPilesLampe(ref);
          if (!r.ok) { toast(r.raison || 'Impossible.'); return; }
          sfx('clic');
          log(r.rendue ? 'Tu récupères la paire (encore bonne) : elle retourne dans ta réserve.' : `Tu retires les piles usées de ${nom.toLowerCase()}.`, '');
          break;
        }
      }
      // renderLieu() : la lumière change le halo ET l'indicateur permanent sous la carte
      // (derrière le panneau) — on les rafraîchit pour qu'ils soient justes à la fermeture.
      updateHUD(); save(); renderLieu(); panneauInventaire();
    };
  });
}

// ---------- Onglet SAC : la liste des objets et la jauge poids/espace ----------
function remplirInventaire(entete) {
  const inv = G.player.inventaire;
  const eq = G.player.equip;
  const slotsAR = nbSlotsAccesRapide();
  const pt = poidsTotal(), pm = poidsMax(), eu = espaceUtilise(), em = espaceMax();
  const sacEq = eq.sac ? cloth(eq.sac) : null;
  let html = `${entete}
    <p class="cap-line">Poids : <b class="${surcharge() ? 'over' : enSurpoids() ? 'warn' : ''}">${pt.toFixed(1)} / ${pm} kg</b>${enSurpoids() ? ` <small>(surpoids — plafond ${poidsPlafond()})</small>` : ''} — Espace : <b class="${eu > em ? 'over' : ''}">${eu} / ${em}</b></p>
    <p class="cap-line">Sac : <b>${sacEq ? sacEq.nom : 'aucun'}</b>${sacEq
      ? ` — espace +${sacEq.espace}, portage +${sacEq.portage || 0} kg`
      : ' — tes poches et tes bras, c\'est tout. Trouve ou fabrique un sac : chacun donne de l\'espace et du portage.'}</p>`;

  html += `<h3>Dans le sac</h3><div class="item-list">`;
  if (!inv.length) html += `<p class="cap-line">Ton sac est vide.</p>`;
  inv.forEach((it, i) => {
    const d = item(it.id) || cloth(it.id);
    if (!d) return;
    const meta = `${it.eau ? descEau(it) + ' · ' : ''}${((d.poids || 0) * it.qty + (it.eau ? it.eau.L : 0)).toFixed(1)} kg · ${(d.espace || 0) * it.qty} esp.`;
    const estUneLampe = estLampe(it.id);
    let boutons = '';
    if (estUneLampe) boutons += boutonsLampe('sac:' + i, it, 'sac');
    if (d.type === 'nourriture') boutons += `<button data-act="manger" data-i="${i}">Manger</button>`;
    if (d.type === 'boisson') boutons += `<button data-act="manger" data-i="${i}">Boire</button>`;
    if (d.type === 'soin') boutons += `<button data-act="soigner" data-i="${i}">Utiliser</button>`;
    if (d.dmg) boutons += `<button data-act="equiper-arme" data-i="${i}">Prendre en main</button>`;
    if (d.slot) boutons += `<button data-act="equiper-vet" data-i="${i}">Porter</button>`;
    if (d.slot && d.tissu) boutons += `<button data-act="dechirer" data-i="${i}">Déchirer (${d.tissu} chiffon${d.tissu > 1 ? 's' : ''})</button>`;
    boutons += boutonsContenant(String(i), it);
    if (peutAccesRapide(it.id) && slotsAR > accesRapide().length) boutons += `<button data-act="ceinture" data-i="${i}">À la ceinture</button>`;
    if (it.id === 'alcool_fort') boutons += `<button data-act="desinfecter" data-i="${i}">Désinfecter une plaie</button>`;
    if (it.id === 'radio_portable') boutons += `<button data-act="radio" data-i="${i}" ${countItem('piles') ? '' : 'disabled'}>Écouter${countItem('piles') ? '' : ' (piles requises)'}</button>`;
    boutons += `<button data-act="jeter" data-i="${i}">Jeter</button>`;
    const durBar = it.dur !== undefined && d.dur
      ? `<div class="dur-bar"><div class="dur-fill" style="width:${(it.dur / d.dur) * 100}%"></div></div>` : '';
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${it.qty > 1 ? ` <span class="qty">×${it.qty}</span>` : ''}</span><span class="item-meta">${meta}</span></div>
      <div class="item-desc">${d.desc}</div>${estUneLampe ? lampeInfo(it) : ''}${durBar}
      <div class="item-btns">${boutons}</div>
    </div>`;
  });
  html += '</div>';
  const box = showPanel(html, { plein: true });
  lierContenants(box);
  lierLampes(box);
  box.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = () => {
      const i = parseInt(b.dataset.i, 10);
      const finir = (res) => {
        if (res) res.messages.forEach(m => log(m.t, m.c));
        if (res && res.mort) { closePanel(); return; } // mort pendant l'action : ne pas écraser la sauvegarde
        updateHUD(); save(); panneauInventaire();
      };
      // Les gestes qui prennent du temps passent par le spinner ; manipuler son sac est immédiat.
      switch (b.dataset.act) {
        case 'manger': {
          const d = defItem(G.player.inventaire[i]?.id);
          const boisson = d && d.type === 'boisson';
          attente(boisson ? 'Tu bois…' : 'Tu manges…', 5, () => {
            const res = consommer(i);
            if (res.ok) sfx(res.type === 'boisson' ? 'boire' : 'manger');
            finir(res);
          });
          return;
        }
        case 'soigner':
          attente('Tu te soignes…', 10, () => { const res = soigner(i); if (res.ok) sfx('soin'); finir(res); });
          return;
        case 'desinfecter':
          attente('Tu désinfectes la plaie…', 5, () => { const res = desinfecterAlcool(); if (res.ok) sfx('soin'); finir(res); });
          return;
        case 'radio':
          attente('Tu balaies les fréquences…', 10, () => finir(ecouterRadio()));
          return;
        case 'dechirer':
          attente('Tu déchires le tissu…', 5, () => {
            const res = dechirerVetement(i);
            if (res.ok) sfx('tissu_dechire');
            finir(res);
          });
          return;
        case 'equiper-arme': {
          const r = equiperArme(i);
          if (r.ok && r.renverse) {
            sfx('eau_verse');
            log(`${r.renverse} : l'eau se renverse sur tes chaussures. Le récipient vide retourne dans le sac.`, 'warn');
          } else sfx('clic');
          break;
        }
        case 'equiper-vet': {
          const r = equiperVetement(i);
          if (!r.ok) { toast('Impossible de porter ça.'); break; }
          sfx('clic');
          if (r.auSol.length) { log(`Plus de place : tu poses au sol — ${libelleJetes(r.auSol)}.`, 'warn'); syncCaseCourante(); renderLieu(); }
          break;
        }
        case 'ceinture': {
          const r = mettreEnAccesRapide(i);
          if (!r.ok) toast(r.raison);
          else sfx('clic');
          break;
        }
        case 'jeter': dropItem(i, 1); sfx('clic'); syncCaseCourante(); break;
      }
      finir(null);
    };
  });
  return box;
}

// ---------- Onglet PORTER : en main, vêtements portés, accès rapide ----------
function remplirPorter(entete) {
  const eq = G.player.equip;
  const ar = accesRapide();
  const slotsAR = nbSlotsAccesRapide();
  const pt = poidsTotal(), pm = poidsMax();
  let html = `${entete}
    <p class="cap-line">Poids : <b class="${surcharge() ? 'over' : enSurpoids() ? 'warn' : ''}">${pt.toFixed(1)} / ${pm} kg</b>${enSurpoids() ? ` <small>(surpoids)</small>` : ''} — Protection : <b>${protectionTotale()}</b> — Chaleur : <b>${chaleurTotale()}</b></p>`;

  // --- En main ---
  html += `<h3>En main</h3><div class="item-list">`;
  if (eq.arme) {
    const d = item(eq.arme.id);
    const cont = estContenant(eq.arme.id);
    const meta = eq.arme.eau ? descEau(eq.arme)
      : d.dmg ? `${d.dmg[0]}–${d.dmg[1]} dégâts`
      : cont ? `vide — ${fmtL(contenance(eq.arme.id))} L` : '';
    const lampeEnMain = estLampe(eq.arme.id);
    html += `<div class="item-card equipped">
      <div class="item-line"><span class="item-nom">${d.nom}</span><span class="item-meta">${meta}</span></div>
      ${d.dur && eq.arme.dur !== undefined ? `<div class="dur-bar"><div class="dur-fill" style="width:${(eq.arme.dur / d.dur) * 100}%"></div></div>` : ''}
      ${lampeEnMain ? lampeInfo(eq.arme) : ''}
      <div class="item-btns">
        ${lampeEnMain ? boutonsLampe('main', eq.arme, 'main') : ''}
        ${cont ? boutonsContenant('main', eq.arme) : ''}
        ${cont && eq.arme.eau && recipientOuvert(eq.arme.id) ? `<button data-poser-main="1">Poser au sol</button>` : ''}
        <button data-deq="arme">Ranger dans le sac</button>
      </div></div>`;
  } else {
    html += `<div class="item-card"><div class="item-line"><span class="item-nom">Rien</span></div>
      <div class="item-desc">Équipe une arme depuis le sac — ou porte un récipient ouvert plein d'eau, à deux mains, en priant pour ne croiser personne.</div></div>`;
  }
  html += `</div>`;

  // --- Vêtements portés ---
  html += `<h3>Sur toi</h3><div class="item-list">`;
  for (const [slot, nomSlot] of Object.entries(SLOTS)) {
    const id = eq[slot];
    if (id) {
      const c = cloth(id);
      html += `<div class="item-card equipped">
        <div class="item-line"><span class="item-nom">${nomSlot} : ${c.nom}</span>
        <span class="item-meta">${c.poids} kg · prot. ${c.protection}${c.espace ? ' · espace +' + c.espace : ''}${c.portage ? ' · portage +' + c.portage + ' kg' : ''}${c.accesRapide ? ' · accès rapide +' + c.accesRapide : ''}</span></div>
        <div class="item-btns"><button data-deq="${slot}">Retirer</button>${c.tissu ? `<button data-dech-eq="${slot}">Déchirer (${c.tissu} chiffon${c.tissu > 1 ? 's' : ''})</button>` : ''}</div></div>`;
    } else {
      html += `<div class="item-card"><div class="item-line"><span class="item-nom">${nomSlot} : —</span></div></div>`;
    }
  }
  html += `</div>`;

  // --- Accès rapide ---
  html += `<h3>Accès rapide — ${ar.length}/${slotsAR} emplacement${slotsAR > 1 ? 's' : ''}</h3><div class="item-list">`;
  if (!slotsAR) html += `<p class="cap-line">Aucun emplacement : trouve une <b>ceinture</b>, un holster ou un gilet. Sans ça, en combat, tu te bats avec ce que tu as en main.</p>`;
  else if (!ar.length) html += `<p class="cap-line">Vide. Seuls les objets d'accès rapide sont utilisables en combat.</p>`;
  ar.forEach((it, i) => {
    const d = defItem(it.id);
    if (!d) return;
    const lampeAR = estLampe(it.id);
    html += `<div class="item-card acces-rapide">
      <div class="item-line"><span class="item-nom">${d.nom}</span><span class="item-meta">${it.eau ? descEau(it) : d.dmg ? `${d.dmg[0]}–${d.dmg[1]} dégâts` : (d.type || '')}</span></div>
      ${lampeAR ? lampeInfo(it) : ''}
      <div class="item-btns">${lampeAR ? boutonsLampe('ar:' + i, it, 'ar') : ''}<button data-ar-retire="${i}">Remettre dans le sac</button></div></div>`;
  });
  html += `</div>`;

  const box = showPanel(html, { plein: true });
  lierContenants(box);
  lierLampes(box);
  box.querySelectorAll('[data-deq]').forEach(b => {
    b.onclick = () => {
      const slot = b.dataset.deq;
      let auSol = [];
      if (slot === 'arme') {
        if (!desequiperArme()) { toast('Un récipient ouvert plein ne va pas dans le sac : bois-le, vide-le ou pose-le au sol.'); return; }
      } else {
        auSol = desequiperVetement(slot).auSol;
      }
      sfx('clic');
      if (auSol.length) { log(`Tu poses au sol ce qui ne rentre plus — ${libelleJetes(auSol)}.`, 'warn'); syncCaseCourante(); renderLieu(); }
      updateHUD(); save(); panneauInventaire();
    };
  });
  box.querySelectorAll('[data-ar-retire]').forEach(b => {
    b.onclick = () => {
      if (!retirerAccesRapide(parseInt(b.dataset.arRetire, 10))) toast('Pas de place dans le sac.');
      sfx('clic');
      updateHUD(); save(); panneauInventaire();
    };
  });
  box.querySelectorAll('[data-dech-eq]').forEach(b => {
    b.onclick = () => {
      const slot = b.dataset.dechEq;
      attente('Tu déchires le tissu…', 5, () => {
        const res = dechirerEquipe(slot);
        res.messages.forEach(m => log(m.t, m.c));
        if (res.ok) sfx('tissu_dechire');
        if (res.mort) { closePanel(); return; }
        updateHUD(); save(); panneauInventaire();
      });
    };
  });
  const poser = box.querySelector('[data-poser-main]');
  if (poser) poser.onclick = () => {
    const cur = G.player.equip.arme;
    if (!cur) return;
    // posé sur la case : le mécanisme « objets au sol » de la fouille le garde au chaud
    solDe(keyCourante()).push({ id: cur.id, qty: 1, eau: cur.eau });
    G.player.equip.arme = null;
    const d = defItem(cur.id);
    // les récipients ouverts actuels (canette, casserole) sont tous féminins
    log(`Tu poses la ${d ? d.nom.toLowerCase() : 'casserole'} au sol, doucement, sans renverser une goutte.`, '');
    sfx('clic');
    updateHUD(); save();
    syncCaseCourante();
    renderLieu(); // la carte derrière montre le point ocre des objets au sol
    panneauInventaire();
  };
  return box;
}

// ---------- Radio portable : écouter les ondes ----------
function ecouterRadio() {
  if (!hasItem('piles')) return { ok: false, messages: [{ t: 'La radio reste muette : il lui faut des piles.', c: 'warn' }] };
  const msgs = []; // le temps d'écoute s'écoule en temps réel (barre d'attente), plus de saut d'horloge
  if (getFlag('chapitre2')) {
    msgs.push({ t: '« …ici le Refuge de Miramas-le-Vieux… la citerne est basse… si vous entendez ceci, méfiez-vous de la plaine : des bêtes échappées du zoo de La Barben rôdent le long de la Touloubre… »', c: '' });
  } else {
    msgs.push({ t: '« …Miramas-le-Vieux… le Refuge accueille les vivants… suivez la voie ferrée, elle est dégagée jusqu\'au triage… » Le même message, en boucle, d\'une voix calme et épuisée.', c: '' });
  }
  if (!getFlag('radio_ecoutee')) {
    setFlag('radio_ecoutee');
    noteJournal('La radio répète un message : le Refuge de Miramas-le-Vieux accueille les vivants, par la voie ferrée.');
    msgs.push({ t: 'Quelqu\'un, quelque part, parle encore. Tu notes l\'essentiel — un but, c\'est déjà la moitié d\'une raison de tenir.', c: 'good' });
  }
  if (chance(0.15)) {
    removeItem('piles', 1);
    msgs.push({ t: 'La voix s\'étire, ralentit, meurt : les piles de la radio ont rendu l\'âme.', c: 'warn' });
  }
  return { ok: true, messages: msgs };
}

// ---------- Corps : états, blessures, compétences ----------
function silhouette(blessures) {
  const zonesTouchees = new Set(blessures.map(b => b.zone));
  const c = (zones, cx, cy, r) => zonesTouchees.size && zones.some(z => [...zonesTouchees].some(t => t.includes(z)))
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#a32020" opacity=".8"/>` : '';
  return `<svg viewBox="0 0 60 130" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#5a544a" stroke-width="2.4" stroke-linecap="round" fill="none">
      <circle cx="30" cy="14" r="9"/>
      <path d="M30 23v44M30 33l-15 14m15-14 15 14M30 67l-12 40m12-40 12 40"/>
    </g>
    ${c(['visage', 'tête'], 30, 14, 5)}${c(['cou'], 30, 24, 4)}${c(['épaule'], 30, 34, 5)}
    ${c(['bras', 'avant-bras', 'main'], 18, 44, 5)}${c(['torse', 'poitrine'], 30, 43, 5)}${c(['flanc', 'dos'], 30, 53, 6)}
    ${c(['cuisse'], 24, 85, 5)}${c(['genou'], 36, 88, 4)}${c(['mollet'], 38, 100, 5)}${c(['cheville', 'pied'], 20, 105, 4)}
  </svg>`;
}

function optionsSoin(b, i) {
  const def = BLESSURES[b.type];
  const opts = [];
  const opt = (action, itemId, label) => {
    const n = countItem(itemId);
    opts.push(`<button data-soin="${action}:${itemId}" data-bidx="${i}" ${n > 0 ? '' : 'disabled'}>${label} (×${n})</button>`);
  };
  if (b.infecte) { opt('antibio', 'antibiotiques', 'Antibiotiques'); }
  if (!b.bandee) { opt('bander', 'bandage', 'Bander'); opt('bander', 'bandage_fortune', 'Bander (fortune)'); }
  if (!b.nettoyee) { opt('nettoyer', 'savon', 'Nettoyer (savon)'); }
  // Désinfecter reste utile MÊME sur une plaie infectée : ça lance une « désinfection en
  // cours » qui la fait reculer (les antibiotiques, eux, la foudroient d'un coup).
  if (!b.desinfectee || b.infecte) { opt('desinfecter', 'desinfectant', 'Désinfecter'); opt('desinfecter', 'lingette', 'Lingette'); opt('desinfecter', 'alcool_fort', 'À l\'alcool'); }
  if (def.suture && !b.suturee) { opt('suturer', 'kit_suture', 'Suturer'); }
  if (!opts.length) return '<div class="item-desc">Rien à faire de plus : elle guérira avec le temps.</div>';
  return `<div class="item-btns soin-opts">${opts.join('')}</div>`;
}

function panneauCorps(selBlessure = null) {
  const p = G.player;
  let html = `<div class="panel-head"><h2>${p.nom}</h2><button class="panel-close">×</button></div>
    <p class="cap-line">${heureTxt()} — ${p.morts} zombie${p.morts > 1 ? 's' : ''} abattu${p.morts > 1 ? 's' : ''} — une seule vie</p>
    <div class="corps-silhouette">${silhouette(p.blessures)}</div>
    <h3>État</h3>`;
  const etats = [];
  if (p.pv <= 30) etats.push(['douleur', 'Très mal en point', 'Ton corps lâche. Soins, nourriture, sommeil — vite.']);
  else if (p.pv <= 75) etats.push(['douleur', 'Endolori', 'Tu tiens debout, mais tout te tire.']);
  if (p.sta <= 35) etats.push(['fatigue', 'Épuisé', 'Repose-toi avant un combat.']);
  if (p.faim <= 35) etats.push(['faim', 'Affamé', 'Trouve à manger.']);
  if (p.soif <= 35) etats.push(['soif', 'Assoiffé', 'L\'eau d\'abord. Toujours.']);
  if (froidActuel() > 0) etats.push(['froid', 'Frigorifié', 'Couvre-toi ou rentre à l\'abri.']);
  if (p.maladie === 'intoxication') etats.push(['malade', 'Intoxication', 'Crampes, nausées. Ça passera... probablement.']);
  if (p.maladie === 'fievre') etats.push(['fievre', 'Fièvre', 'Il te faut des antibiotiques, vite.']);
  if (!etats.length && !p.blessures.length) html += `<p class="cap-line">Tu tiens debout. Profites-en, ça ne durera pas.</p>`;
  etats.forEach(([icone, nom, desc]) => {
    html += `<div class="etat-card">${ico(icone)}<span>${nom}<small>${desc}</small></span></div>`;
  });
  html += `<h3>Blessures — touche pour soigner</h3>`;
  if (!p.blessures.length) html += `<p class="cap-line">Aucune blessure ouverte.</p>`;
  p.blessures.forEach((b, i) => {
    const def = BLESSURES[b.type];
    const sel = selBlessure === i;
    html += `<div class="blessure-card clickable ${sel ? 'sel' : ''}" data-blessure="${i}">${def.nom} ${b.zone}
      ${b.saigne && !b.bandee ? '<span class="tag saigne">saigne</span>' : ''}
      ${b.bandee ? '<span class="tag soigne">bandée</span>' : ''}
      ${b.nettoyee ? '<span class="tag propre">nettoyée</span>' : ''}
      ${b.desinfectee ? '<span class="tag soigne">désinfectée</span>' : ''}
      ${b.desinfectionMin > 0 ? '<span class="tag desinfection">désinfection en cours</span>' : ''}
      ${b.suturee ? '<span class="tag soigne">suturée</span>' : ''}
      ${b.infecte ? '<span class="tag infecte">INFECTÉE</span>' : ''}
      ${def.suture && !b.suturee ? '<span class="tag infecte">à suturer</span>' : ''}
      ${sel ? optionsSoin(b, i) : ''}
    </div>`;
  });
  html += `<h3>Compétences</h3>`;
  for (const [id, def] of Object.entries(SKILLS)) {
    const lvl = skillLevel(id);
    html += `<div class="skill-row"><span class="skill-nom" title="${def.desc}">${def.nom}</span>
      <span class="skill-pips">${[1, 2, 3, 4, 5].map(n => `<span class="pip ${n <= lvl ? 'on' : ''}"></span>`).join('')}</span></div>`;
  }
  const box = showPanel(html, { plein: true });
  box.querySelectorAll('[data-blessure]').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('[data-soin]')) return;
      const i = parseInt(card.dataset.blessure, 10);
      sfx('clic');
      panneauCorps(selBlessure === i ? null : i);
    };
  });
  box.querySelectorAll('[data-soin]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const [action, itemId] = btn.dataset.soin.split(':');
      const i = parseInt(btn.dataset.bidx, 10);
      const labels = {
        bander: 'Tu bandes la plaie…', desinfecter: 'Tu désinfectes…', nettoyer: 'Tu laves la plaie au savon…',
        suturer: 'Tu recouds, point par point…', antibio: 'Tu avales les antibiotiques…',
      };
      attente(labels[action] || 'Tu te soignes…', action === 'suturer' ? 20 : 8, () => {
        const res = appliquerSoinCible(i, action, itemId);
        res.messages.forEach(m => log(m.t, m.c));
        if (res.ok) sfx('soin');
        updateHUD(); save();
        panneauCorps(G.player.blessures[i] ? i : null);
      });
    };
  });
}

// ---------- Fabrication (onglet de l'inventaire, triée par catégories) ----------
const CRAFT_CATS = [
  ['tous', 'Tous'], ['armes', 'Armes'], ['soins', 'Soins'],
  ['nourriture', 'Manger'], ['survie', 'Survie'], ['equipement', 'Équipement'],
];
let craftCat = 'tous';

function remplirCraft(entete) {
  const recettes = listeRecettes().filter(({ r }) => craftCat === 'tous' || r.cat === craftCat);
  let html = `${entete}
    <p class="cap-line">Fabriquer prend du temps — et le temps, dehors, se paie.</p>
    <div class="chips">${CRAFT_CATS.map(([id, nom]) => `<button class="chip ${craftCat === id ? 'on' : ''}" data-cat="${id}">${nom}</button>`).join('')}</div>
    <div class="item-list">`;
  if (!recettes.length) html += `<p class="cap-line">Rien dans cette catégorie pour l'instant.</p>`;
  recettes.forEach(({ r, manque, skillKo, possible }) => {
    const ing = r.ingredients.map(x => `${defItem(x.id)?.nom || x.id} ×${x.qty}`).join(', ');
    const outils = r.outils.length ? ` — outils : ${r.outils.map(o => o === 'feu' ? 'feu' : (defItem(o)?.nom || o)).join(', ')}` : '';
    let probleme = '';
    if (skillKo) probleme = `<span class="req">Requiert : ${SKILLS[skillKo.id].nom} niveau ${skillKo.niveau}</span>`;
    else if (manque.length) probleme = `<span class="req">Manque : ${manque.join(', ')}</span>`;
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${r.nom}</span><span class="item-meta">${r.tempsMin} min</span></div>
      <div class="item-desc">${r.desc}<br>${ing}${outils}</div>
      ${probleme ? `<div class="item-desc">${probleme}</div>` : ''}
      <div class="item-btns"><button data-craft="${r.id}" ${possible ? '' : 'disabled'}>Fabriquer</button></div>
    </div>`;
  });
  html += '</div>';
  const box = showPanel(html, { plein: true });
  box.querySelectorAll('[data-cat]').forEach(b => {
    b.onclick = () => { craftCat = b.dataset.cat; sfx('clic'); panneauInventaire('craft'); };
  });
  box.querySelectorAll('[data-craft]').forEach(b => {
    b.onclick = () => {
      const entry = listeRecettes().find(x => x.r.id === b.dataset.craft);
      attente('Tu fabriques…', entry ? entry.r.tempsMin : 10, () => {
        const res = fabriquer(b.dataset.craft);
        res.messages.forEach(m => log(m.t, m.c));
        (res.niveaux || []).forEach(n => log(`${SKILLS[n.skill].nom} : niveau ${n.niveau} !`, 'good'));
        if (res.ok) sfx('craft');
        if (res.mort) { closePanel(); return; } // mort pendant le craft : ne pas écraser la sauvegarde
        updateHUD(); save(); panneauInventaire('craft');
      });
    };
  });
  return box;
}

// ---------- Journal ----------
function panneauJournal() {
  let html = `<div class="panel-head"><h2>Journal</h2><button class="panel-close">×</button></div>
    <div class="blessure-card" style="border-color:var(--rust);background:#191307">${ico('carte')} ${objectifActuel()}</div>`;
  const notes = [...G.journal].reverse();
  if (!notes.length) html += `<p class="cap-line">Rien encore. Tout reste à écrire.</p>`;
  notes.forEach(n => {
    html += `<div class="item-card"><div class="item-line"><span class="item-nom">${n.texte}</span><span class="item-meta">Jour ${n.jour}, ${String(n.heure).padStart(2, '0')} h</span></div></div>`;
  });
  // Le journal de bord (flux d'événements) : plus affiché en permanence sous la carte,
  // il se consulte ici, sur appui, pour laisser toute la place à la carte.
  const flux = logHtml(30);
  if (flux) html += `<h3>Journal de bord</h3><div class="gamelog gamelog-panel">${flux}</div>`;
  showPanel(html);
}

// ---------- Options ----------
function panneauOptions() {
  const box = showPanel(`<div class="panel-head"><h2>Options</h2><button class="panel-close">×</button></div>
    <div class="opt-row"><span>Volume</span><input type="range" id="opt-vol" min="0" max="1" step="0.05" value="${getVolume()}" style="max-width:160px"></div>
    <div class="opt-row"><span>Son coupé</span><input type="checkbox" id="opt-mute" ${isMuted() ? 'checked' : ''}></div>
    <div class="actions">
      ${pleinEcranDispo() ? btnAct('data-o="plein-ecran"', estPleinEcran() ? 'Quitter le plein écran' : 'Plein écran', 'idéal sur mobile') : ''}
      ${btnAct('data-o="save"', 'Sauvegarder', 'la partie se sauvegarde aussi toute seule')}
      ${btnAct('data-o="titre"', 'Sauvegarder et retourner au titre')}
      ${btnAct('data-o="reset"', 'Abandonner la partie', 'efface définitivement la sauvegarde')}
    </div>
    ${multi.estMulti() ? `<p class="cap-line">Co-op : tu es <b>${multi.estHote() ? 'l\'hôte' : 'invité'}</b>${multi.estHote() ? (multi.pairPresent() ? ' — coéquipier connecté' : ' — en attente d\'un joueur') : multi.pairPresent() ? ' — connecté à l\'hôte' : ' — hôte déconnecté'}.</p>` : ''}
    <p class="cap-line">One More Day — Salon-de-Provence, jour 23. Les intérieurs fouillés sont sûrs ; les rues ne le sont jamais.</p>`);
  box.querySelector('#opt-vol').oninput = (e) => setVolume(parseFloat(e.target.value));
  box.querySelector('#opt-mute').onchange = (e) => setMuted(e.target.checked);
  box.querySelectorAll('[data-o]').forEach(b => {
    b.onclick = () => {
      switch (b.dataset.o) {
        case 'plein-ecran': sfx('clic'); basculerPleinEcran(); break;
        case 'save': save(); toast('Partie sauvegardée.'); break;
        case 'titre': save(); closePanel(); ecranTitre(); break;
        case 'reset':
          if (b.dataset.confirme) { clearSave(); partieTerminee = true; closePanel(); ecranTitre(); }
          else { b.dataset.confirme = '1'; b.innerHTML = 'Vraiment tout effacer ? (cliquer à nouveau pour confirmer)'; }
          break;
      }
    };
  });
}

// ---------- Mort ----------
window.addEventListener('omd-mort', (e) => {
  const cause = e.detail?.cause || 'combat';
  partieTerminee = true; // plus aucune autosauvegarde : la partie est finie
  closeEvt();
  closePanel();
  stopCombatMusic();
  setHeartbeat(false);
  sfx('mort');
  playAmbiance('sombre');
  clearSave(); // permadeath : la mort efface la partie — il ne reste rien à reprendre
  render(`
    <div class="illu">${svgScene('mort')}</div>
    <h2 class="mort-titre">Tu es mort</h2>
    <div class="narration">${MORTS[cause] || MORTS.combat}</div>
    <div class="stats-fin">
      <div><span>Jours survécus</span><span>${G.world.jour}</span></div>
      <div><span>Zombies abattus</span><span>${G.player.morts}</span></div>
      <div><span>Heures dehors</span><span>${Math.round(G.world.statsTemps / 60)}</span></div>
    </div>
    <div class="menu">
      ${btnAct('data-fin="nouvelle"', 'Recommencer', 'la mort est définitive — tout est perdu', { classe: 'primary' })}
      ${btnAct('data-fin="titre"', 'Retour au titre')}
    </div>`);
  showHUD(false);
  document.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => {
    sfx('clic');
    switch (b.dataset.fin) {
      case 'nouvelle': ecranNouvelle(); break;
      case 'titre': ecranTitre(); break;
    }
  });
});

// ---------- Fin du chapitre 1 : l'aventure CONTINUE au Refuge ----------
window.addEventListener('omd-fin', () => {
  playAmbiance('calme');
  showHUD(false);
  // Si on recharge la partie ici, on reprend directement à l'ouverture du chapitre 2.
  G.world.sceneCourante = 'ch2_intro_1';
  save();
  const lea = G.world.flags['lea_sauvee'];
  render(`
    <div class="illu">${svgScene('camp')}</div>
    <h2 class="mort-titre" style="color:#c9b98a">Tu as survécu</h2>
    <div class="narration">Miramas-le-Vieux. Un village médiéval perché sur son rocher, une seule rampe d'accès, des murs de pierre sèche — et des vivants derrière.${lea ? '\n\nLéa te retrouve près du feu et te tend un quart de café. « On a réussi », dit-elle simplement. On.' : ''}\n\nTu as tenu ${G.world.jour} jour${G.world.jour > 1 ? 's' : ''} dans Salon. En contrebas, la plaine fume encore. Maintenant commence le chapitre 2 : la vie derrière les murs — et ce qui finit toujours par grimper.</div>
    <div class="stats-fin">
      <div><span>Jours survécus</span><span>${G.world.jour}</span></div>
      <div><span>Zombies abattus</span><span>${G.player.morts}</span></div>
      <div><span>Léa</span><span>${lea ? 'sauvée' : '—'}</span></div>
    </div>
    <div class="menu">
      ${btnAct('data-fin2="ch2"', 'Entrer au Refuge — chapitre 2', 'l\'aventure continue', { classe: 'primary' })}
      ${btnAct('data-fin2="titre"', 'Sauvegarder et retourner au titre')}
    </div>`);
  document.querySelectorAll('[data-fin2]').forEach(b => b.onclick = () => {
    sfx('clic');
    if (b.dataset.fin2 === 'ch2') {
      partieTerminee = false;
      showHUD(true);
      updateHUD();
      jouerScene('ch2_intro_1');
    } else {
      save();
      ecranTitre();
    }
  });
});

// ---------- Service worker (PWA) ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW non enregistré :', err));
  });
}

// ---------- Sauvegarde automatique ----------
// Jamais en combat, jamais après la fin de partie, jamais avec un joueur mort :
// la dernière bonne sauvegarde ne doit pas pouvoir être écrasée par un état perdu.
setInterval(() => { if (G && !enCombat() && !partieTerminee && G.player.pv > 0) save(); }, 90000);

// ---------- Co-op : messages système (arrivée/départ du coéquipier, perte du lien) ----------
multi.poser('onSysteme', (txt, c) => { if (G && document.querySelector('#gamelog')) log(txt, c || ''); else toast(txt); });

// ---------- Démarrage ----------
lierHUD();
ecranTitre();
