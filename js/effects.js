// ============ Résolveur d'effets déclaratifs (événements & scènes) ============
// effets : { pv, sta, faim, soif, items:[{id,qty}], retire:[{id,qty}],
//   blessure:'entaille' | { type:'entaille', zones:['à la main', ...] } — zones : où la
//     blessure tombe, cohérent avec la narration (chute → jambes, verre brisé → mains...),
//   combat:'errant'|[...], tempsMin, xp:{skill:n}, flag:'x', maladie:'intoxication',
//   volNourriture:true, bruit:true }
import { G, gainSkill, rng, setFlag, pick, skillLevel as skillLvl } from './state.js';
import { item } from './data/items.js';
import { addItem, removeItem, countItem } from './inventory.js';
import { ajouterBlessure, mortJoueur } from './survival.js';
import { log, updateHUD, panelOuvert, evtOuvert } from './ui.js';
import { demarrerCombat, enCombat } from './combat.js';
import { sfx } from './audio.js';

// ---------- Alertes d'infection : le corps rappelle qu'il pourrit ----------
// Tant qu'une blessure est infectée, un voile vert-jaunâtre pulse à l'écran
// toutes les 25 à 40 s réelles (jamais en combat, jamais sous une modale),
// avec un son discret. Et un pulse immédiat à l'instant où une blessure
// DEVIENT infectée (événement 'omd-infection' émis par survival.js).
let timerInfection = null; // timer unique : jamais en double

export function pulseInfection() {
  const el = document.getElementById('voile-infection');
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth; // force le reflow : l'animation peut se rejouer
  el.classList.add('pulse');
  sfx('alerte_infection');
}

function alerteInfectionPossible() {
  if (!G || !G.player || !G.player.blessures.some(b => b.infecte)) return false;
  const topbar = document.getElementById('topbar');
  if (!topbar || topbar.classList.contains('hidden')) return false; // HUD caché : titre, mort...
  return !enCombat() && !panelOuvert() && !evtOuvert();
}

export function demarrerAlertes() {
  stopperAlertes();
  const planifier = () => {
    timerInfection = setTimeout(() => {
      if (alerteInfectionPossible()) pulseInfection();
      planifier();
    }, rng(25000, 40000));
  };
  planifier();
}
export function stopperAlertes() {
  if (timerInfection) { clearTimeout(timerInfection); timerInfection = null; }
}

// Le moment précis où une blessure tourne : le voile pulse tout de suite.
if (typeof window !== 'undefined') {
  window.addEventListener('omd-infection', () => { if (G) pulseInfection(); });
}

// Applique les effets. Si effets.combat : lance le combat et appelle apresCombat(resultat) à la fin.
// Retourne true si un combat a été lancé (l'appelant ne doit alors PAS re-rendre l'écran).
export function appliquerEffets(effets, apresCombat = null) {
  if (!effets) return false;
  const p = G.player;

  if (effets.pv) {
    p.pv = Math.min(p.pvMax, Math.max(0, p.pv + effets.pv));
    if (effets.pv < 0) { log(`Tu encaisses (${effets.pv} PV).`, 'bad'); sfx('degats'); }
    if (p.pv <= 0) { mortJoueur('hemorragie'); return true; } // l'appelant doit s'arrêter là
  }
  if (effets.sta) p.sta = Math.min(p.staMax, Math.max(0, p.sta + effets.sta));
  if (effets.faim) p.faim = Math.min(100, Math.max(0, p.faim + effets.faim));
  if (effets.soif) p.soif = Math.min(100, Math.max(0, p.soif + effets.soif));

  if (effets.retire) {
    for (const r of effets.retire) removeItem(r.id, r.qty || 1);
  }
  if (effets.items) {
    for (const g of effets.items) {
      const d = item(g.id);
      if (!d) { console.warn('Effet : objet inconnu', g.id); continue; }
      if (addItem(g.id, g.qty || 1)) {
        log(`Obtenu : ${d.nom}${(g.qty || 1) > 1 ? ' ×' + g.qty : ''}.`, 'good');
        sfx('loot');
      } else {
        log(`${d.nom} ne rentre pas dans ton inventaire — laissé sur place.`, 'warn');
      }
    }
  }
  if (effets.volNourriture) {
    // un pillard prend de la nourriture / eau
    const cibles = G.player.inventaire.filter(i => {
      const d = item(i.id);
      return d && (d.type === 'nourriture' || d.type === 'boisson');
    });
    if (cibles.length) {
      const c = pick(cibles);
      removeItem(c.id, 1);
      log(`On t'a volé : ${item(c.id).nom}.`, 'bad');
    }
  }
  if (effets.blessure) {
    const bl = effets.blessure;
    const msgs = typeof bl === 'string'
      ? ajouterBlessure(bl)
      : ajouterBlessure(bl.type, bl.zones || bl.zone || null);
    msgs.forEach(m => log(m.t, m.c));
  }
  if (effets.maladie) {
    p.maladie = effets.maladie;
    p.maladieDuree = rng(180, 420);
    log('Tu te sens mal. Très mal.', 'bad');
  }
  if (effets.xp) {
    for (const [sk, n] of Object.entries(effets.xp)) {
      const up = gainSkill(sk, n);
      if (up) log(`Compétence améliorée : niveau ${up.niveau} !`, 'good');
    }
  }
  if (effets.flag) setFlag(effets.flag);
  // effets.tempsMin ne « saute » plus l'horloge : le temps s'écoule en temps réel
  // (pendant la barre d'attente de l'événement). On garde le champ pour calibrer
  // la durée de cette barre côté appelant.
  updateHUD();

  if (effets.combat) {
    const ids = Array.isArray(effets.combat) ? effets.combat : [effets.combat];
    demarrerCombat(ids, { onFin: (res) => { if (apresCombat) apresCombat(res); } });
    return true;
  }
  return false;
}

// Vérifie un "besoin" : { skill:{agilite:2}, item:'corde' }
export function besoinRempli(besoin) {
  if (!besoin) return true;
  if (besoin.item && countItem(besoin.item) < 1) return false;
  if (besoin.skill) {
    for (const [sk, lvl] of Object.entries(besoin.skill)) {
      if (skillLvl(sk) < lvl) return false;
    }
  }
  return true;
}
export function besoinTexte(besoin) {
  if (!besoin) return '';
  const parts = [];
  if (besoin.skill) for (const [sk, lvl] of Object.entries(besoin.skill)) parts.push(`${sk} ${lvl}`);
  if (besoin.item) parts.push(item(besoin.item)?.nom || besoin.item);
  return parts.join(' + ');
}

// Jet de compétence : { skill:'agilite', base:0.4, parNiveau:0.15 }
export function jetReussi(test) {
  if (!test) return true;
  const pSucces = Math.min(0.95, test.base + skillLvl(test.skill) * test.parNiveau);
  return Math.random() < pSucces;
}
