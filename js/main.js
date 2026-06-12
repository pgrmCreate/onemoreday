// ============ Démarrage, menus, panneaux, mort & fin ============
import { G, newGame, save, load, hasSave, clearSave, skillLevel, SKILLS, heureTxt, getFlag, setFlag, noteJournal, chance } from './state.js';
import { render, updateHUD, showHUD, log, btnAct, $, toast, showPanel, closePanel, panelOuvert, evtOuvert, closeEvt, attente } from './ui.js';
import { ico, ICONS } from './icons.js';
import { svgScene } from './illustrations.js';
import { item } from './data/items.js';
import { cloth, CLOTHES, SLOTS } from './data/clothing.js';
import { MORTS } from './data/story.js';
import {
  poidsTotal, poidsMax, espaceUtilise, espaceMax, equiperArme, desequiperArme,
  equiperVetement, desequiperVetement, dropItem, protectionTotale, chaleurTotale, hasItem,
  accesRapide, nbSlotsAccesRapide, mettreEnAccesRapide, retirerAccesRapide, peutAccesRapide,
  countItem, defItem, removeItem,
} from './inventory.js';
import { consommer, soigner, desinfecterAlcool, appliquerSoinCible, BLESSURES, nomBlessure, froidActuel, advanceTime } from './survival.js';
import { listeRecettes, fabriquer } from './crafting.js';
import { renderLieu, objectifActuel, initPosition } from './map.js';
import { jouerScene } from './scenes.js';
import { enCombat } from './combat.js';
import { initAudio, playAmbiance, sfx, setMuted, isMuted, getVolume, setVolume, stopCombatMusic, setHeartbeat } from './audio.js';

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

// ---------- Écran titre ----------
function ecranTitre() {
  showHUD(false);
  stopCombatMusic();
  setHeartbeat(false);
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
    Sur Android : ouvre cette page dans Chrome puis « Ajouter à l'écran d'accueil » pour l'installer.</div>`);
  const map = {
    continuer: () => {
      if (!load()) return toast('Sauvegarde illisible.');
      partieTerminee = false;
      showHUD(true);
      updateHUD();
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
• <em>La fouille</em> prend du temps, et chaque passage en prend davantage — mais tu trouves de plus en plus. Chaque zone a une limite : après, elle est retournée de fond en comble.
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
    <div class="narration">Jour 23. Le Grand Hôtel de la Poste, place Crousillat, Salon-de-Provence. La réserve de la cuisine est morte hier soir : une boîte de flageolets, partagée avec personne.\n\nDehors, la Fontaine Moussue coule toujours. Eux aussi sont toujours là.</div>
    <div class="menu">
      <input type="text" id="inp-nom" maxlength="16" placeholder="Ton prénom (Sam)" autocomplete="off">
      ${btnAct('data-d="normal"', 'Commencer — Survivant', 'la mort te ramène à ta dernière sauvegarde', { classe: 'primary' })}
      ${btnAct('data-d="extreme"', 'Commencer — Un seul jour', 'mort permanente : la mort efface ta partie')}
      ${btnAct('data-d="retour"', 'Retour')}
    </div>`);
  document.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
    sfx('clic');
    if (b.dataset.d === 'retour') return ecranTitre();
    const nom = ($('#inp-nom').value || 'Sam').trim().slice(0, 16);
    clearSave();
    newGame(nom, b.dataset.d);
    initPosition();
    partieTerminee = false;
    save();
    showHUD(true);
    updateHUD();
    jouerScene('intro_1');
  });
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

// ---------- Inventaire PLEIN ÉCRAN : onglets Inventaire / Fabrication ----------
let ongletInv = 'sac'; // 'sac' | 'craft'

function panneauInventaire(tab = null) {
  if (tab) ongletInv = tab;
  const entete = `<div class="panel-head"><h2>${ongletInv === 'craft' ? 'Fabrication' : 'Inventaire'}</h2><button class="panel-close">×</button></div>
    <div class="onglets">
      <button class="onglet ${ongletInv === 'sac' ? 'on' : ''}" data-onglet="sac">${ico('sac')} Inventaire</button>
      <button class="onglet ${ongletInv === 'craft' ? 'on' : ''}" data-onglet="craft">${ico('craft')} Fabrication</button>
    </div>`;
  const box = ongletInv === 'craft' ? remplirCraft(entete) : remplirInventaire(entete);
  box.querySelectorAll('[data-onglet]').forEach(b => {
    b.onclick = () => { sfx('clic'); panneauInventaire(b.dataset.onglet); };
  });
}

function remplirInventaire(entete) {
  const inv = G.player.inventaire;
  const eq = G.player.equip;
  const ar = accesRapide();
  const slotsAR = nbSlotsAccesRapide();
  const pt = poidsTotal(), pm = poidsMax(), eu = espaceUtilise(), em = espaceMax();
  const sacEq = eq.sac ? cloth(eq.sac) : null;
  let html = `${entete}
    <p class="cap-line">Poids : <b class="${pt > pm ? 'over' : ''}">${pt.toFixed(1)} / ${pm} kg</b> — Espace : <b class="${eu > em ? 'over' : ''}">${eu} / ${em}</b> — Protection : <b>${protectionTotale()}</b> — Chaleur : <b>${chaleurTotale()}</b></p>
    <p class="cap-line">Sac : <b>${sacEq ? sacEq.nom : 'aucun'}</b>${sacEq
      ? ` — espace +${sacEq.espace}, portage +${sacEq.portage || 0} kg`
      : ' — tes poches et tes bras, c\'est tout. Trouve ou fabrique un sac : chacun donne de l\'espace et du portage.'}</p>`;

  // --- Équipé ---
  html += `<h3>Sur toi</h3><div class="item-list">`;
  if (eq.arme) {
    const d = item(eq.arme.id);
    html += `<div class="item-card equipped">
      <div class="item-line"><span class="item-nom">En main : ${d.nom}</span><span class="item-meta">${d.dmg[0]}–${d.dmg[1]} dégâts</span></div>
      ${d.dur ? `<div class="dur-bar"><div class="dur-fill" style="width:${(eq.arme.dur / d.dur) * 100}%"></div></div>` : ''}
      <div class="item-btns"><button data-deq="arme">Ranger dans le sac</button></div></div>`;
  } else {
    html += `<div class="item-card"><div class="item-line"><span class="item-nom">En main : rien</span></div>
      <div class="item-desc">Équipe une arme depuis le sac.</div></div>`;
  }
  for (const [slot, nomSlot] of Object.entries(SLOTS)) {
    const id = eq[slot];
    if (id) {
      const c = cloth(id);
      html += `<div class="item-card equipped">
        <div class="item-line"><span class="item-nom">${nomSlot} : ${c.nom}</span>
        <span class="item-meta">${c.poids} kg · prot. ${c.protection}${c.espace ? ' · espace +' + c.espace : ''}${c.portage ? ' · portage +' + c.portage + ' kg' : ''}${c.accesRapide ? ' · accès rapide +' + c.accesRapide : ''}</span></div>
        <div class="item-btns"><button data-deq="${slot}">Retirer</button></div></div>`;
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
    html += `<div class="item-card acces-rapide">
      <div class="item-line"><span class="item-nom">${d.nom}</span><span class="item-meta">${d.dmg ? `${d.dmg[0]}–${d.dmg[1]} dégâts` : (d.type || '')}</span></div>
      <div class="item-btns"><button data-ar-retire="${i}">Remettre dans le sac</button></div></div>`;
  });
  html += `</div>`;

  // --- Sac ---
  html += `<h3>Dans le sac</h3><div class="item-list">`;
  if (!inv.length) html += `<p class="cap-line">Ton sac est vide.</p>`;
  inv.forEach((it, i) => {
    const d = item(it.id) || cloth(it.id);
    if (!d) return;
    const meta = `${((d.poids || 0) * it.qty).toFixed(1)} kg · ${(d.espace || 0) * it.qty} esp.`;
    let boutons = '';
    if (d.type === 'nourriture') boutons += `<button data-act="manger" data-i="${i}">Manger</button>`;
    if (d.type === 'boisson') boutons += `<button data-act="manger" data-i="${i}">Boire</button>`;
    if (d.type === 'soin') boutons += `<button data-act="soigner" data-i="${i}">Utiliser</button>`;
    if (d.dmg) boutons += `<button data-act="equiper-arme" data-i="${i}">Prendre en main</button>`;
    if (d.slot) boutons += `<button data-act="equiper-vet" data-i="${i}">Porter</button>`;
    if (peutAccesRapide(it.id) && slotsAR > accesRapide().length) boutons += `<button data-act="ceinture" data-i="${i}">À la ceinture</button>`;
    if (it.id === 'alcool_fort') boutons += `<button data-act="desinfecter" data-i="${i}">Désinfecter une plaie</button>`;
    if (it.id === 'radio_portable') boutons += `<button data-act="radio" data-i="${i}" ${countItem('piles') ? '' : 'disabled'}>Écouter${countItem('piles') ? '' : ' (piles requises)'}</button>`;
    boutons += `<button data-act="jeter" data-i="${i}">Jeter</button>`;
    const durBar = it.dur !== undefined && d.dur
      ? `<div class="dur-bar"><div class="dur-fill" style="width:${(it.dur / d.dur) * 100}%"></div></div>` : '';
    html += `<div class="item-card">
      <div class="item-line"><span class="item-nom">${d.nom}${it.qty > 1 ? ` <span class="qty">×${it.qty}</span>` : ''}</span><span class="item-meta">${meta}</span></div>
      <div class="item-desc">${d.desc}</div>${durBar}
      <div class="item-btns">${boutons}</div>
    </div>`;
  });
  html += '</div>';
  const box = showPanel(html, { plein: true });
  box.querySelectorAll('[data-deq]').forEach(b => {
    b.onclick = () => {
      const slot = b.dataset.deq;
      if (slot === 'arme') desequiperArme();
      else if (!desequiperVetement(slot)) toast('Pas assez de place : ce vêtement portait ton inventaire ou ta ceinture est pleine.');
      sfx('clic');
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
        case 'equiper-arme': equiperArme(i); sfx('clic'); break;
        case 'equiper-vet':
          if (!equiperVetement(i)) toast('Impossible de porter ça (place ou ceinture pleine).');
          else sfx('clic');
          break;
        case 'ceinture': {
          const r = mettreEnAccesRapide(i);
          if (!r.ok) toast(r.raison);
          else sfx('clic');
          break;
        }
        case 'jeter': dropItem(i, 1); sfx('clic'); break;
      }
      finir(null);
    };
  });
  return box;
}

// ---------- Radio portable : écouter les ondes ----------
function ecouterRadio() {
  if (!hasItem('piles')) return { ok: false, messages: [{ t: 'La radio reste muette : il lui faut des piles.', c: 'warn' }] };
  const msgs = [];
  const r = advanceTime(10); // dix minutes à balayer les fréquences, l'oreille collée au haut-parleur
  msgs.push(...r.messages);
  if (r.mort) return { ok: true, messages: msgs, mort: true };
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
  if (!b.desinfectee && !b.infecte) { opt('desinfecter', 'desinfectant', 'Désinfecter'); opt('desinfecter', 'alcool_fort', 'À l\'alcool'); }
  if (def.suture && !b.suturee) { opt('suturer', 'kit_suture', 'Suturer'); }
  if (!opts.length) return '<div class="item-desc">Rien à faire de plus : elle guérira avec le temps.</div>';
  return `<div class="item-btns soin-opts">${opts.join('')}</div>`;
}

function panneauCorps(selBlessure = null) {
  const p = G.player;
  let html = `<div class="panel-head"><h2>${p.nom}</h2><button class="panel-close">×</button></div>
    <p class="cap-line">${heureTxt()} — ${p.morts} zombie${p.morts > 1 ? 's' : ''} abattu${p.morts > 1 ? 's' : ''} — ${G.difficulte === 'extreme' ? 'Un seul jour (mort permanente)' : 'Survivant'}</p>
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
      ${b.desinfectee ? '<span class="tag soigne">désinfectée</span>' : ''}
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
        bander: 'Tu bandes la plaie…', desinfecter: 'Tu désinfectes…',
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
  showPanel(html);
}

// ---------- Options ----------
function panneauOptions() {
  const box = showPanel(`<div class="panel-head"><h2>Options</h2><button class="panel-close">×</button></div>
    <div class="opt-row"><span>Volume</span><input type="range" id="opt-vol" min="0" max="1" step="0.05" value="${getVolume()}" style="max-width:160px"></div>
    <div class="opt-row"><span>Son coupé</span><input type="checkbox" id="opt-mute" ${isMuted() ? 'checked' : ''}></div>
    <div class="actions">
      ${btnAct('data-o="save"', 'Sauvegarder', 'la partie se sauvegarde aussi toute seule')}
      ${btnAct('data-o="titre"', 'Sauvegarder et retourner au titre')}
      ${btnAct('data-o="reset"', 'Abandonner la partie', 'efface définitivement la sauvegarde')}
    </div>
    <p class="cap-line">One More Day — Salon-de-Provence, jour 23. Les intérieurs fouillés sont sûrs ; les rues ne le sont jamais.</p>`);
  box.querySelector('#opt-vol').oninput = (e) => setVolume(parseFloat(e.target.value));
  box.querySelector('#opt-mute').onchange = (e) => setMuted(e.target.checked);
  box.querySelectorAll('[data-o]').forEach(b => {
    b.onclick = () => {
      switch (b.dataset.o) {
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
  partieTerminee = true; // coupe l'autosauvegarde : la dernière bonne sauvegarde est préservée
  closeEvt();
  closePanel();
  stopCombatMusic();
  setHeartbeat(false);
  sfx('mort');
  playAmbiance('sombre');
  const extreme = G.difficulte === 'extreme';
  if (extreme) clearSave();
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
      ${extreme
        ? btnAct('data-fin="nouvelle"', 'Recommencer', 'la mort est permanente — tout est perdu', { classe: 'primary' })
        : btnAct('data-fin="charger"', 'Reprendre à la dernière sauvegarde', '', { classe: 'primary' })}
      ${btnAct('data-fin="titre"', 'Retour au titre')}
    </div>`);
  showHUD(false);
  document.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => {
    sfx('clic');
    switch (b.dataset.fin) {
      case 'charger':
        if (load()) {
          partieTerminee = false;
          showHUD(true); updateHUD();
          if (G.world.sceneCourante) jouerScene(G.world.sceneCourante);
          else renderLieu();
        } else ecranTitre();
        break;
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

// ---------- Démarrage ----------
lierHUD();
ecranTitre();
