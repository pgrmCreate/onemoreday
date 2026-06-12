// ============ Aides d'interface ============
import { G, heureTxt, estNuit } from './state.js';
import { poidsTotal, poidsMax } from './inventory.js';
import { froidActuel } from './survival.js';
import { ico } from './icons.js';

export const $ = (sel) => document.querySelector(sel);

export function render(html) {
  const sc = $('#screen');
  sc.innerHTML = html;
  sc.scrollTop = 0;
  return sc;
}

export function showHUD(visible) {
  $('#topbar').classList.toggle('hidden', !visible);
  $('#moodles').classList.toggle('hidden', !visible);
  $('#fabs').classList.toggle('hidden', !visible);
  $('#fabs-jeu').classList.toggle('hidden', !visible);
}

// ---------- États (façon Project Zomboid) ----------
// Pas de barres : des états gradués. niveau 1 (gêne) → 4 (urgence vitale).
function calculerEtats() {
  const p = G.player;
  const etats = [];
  const seuils = (v, s) => v <= s[3] ? 4 : v <= s[2] ? 3 : v <= s[1] ? 2 : v <= s[0] ? 1 : 0;

  // Douleur / état physique (les PV restent cachés : on ressent, on ne compte pas)
  const nPv = seuils(p.pv, [75, 50, 30, 15]);
  if (nPv) etats.push({ ico: 'douleur', n: nPv, label: ['Endolori', 'Souffrant', 'Très mal en point', 'Mourant'][nPv - 1], desc: 'Ton corps encaisse. Soigne-toi, mange, dors.' });

  const nSta = seuils(p.sta, [55, 35, 20, 8]);
  if (nSta) etats.push({ ico: 'fatigue', n: nSta, label: ['Fatigué', 'Épuisé', 'Exténué', 'À bout de forces'][nSta - 1], desc: 'Chaque action coûte. Repose-toi ou mets-toi en défense en combat.' });

  const nFaim = seuils(p.faim, [55, 35, 18, 6]);
  if (nFaim) etats.push({ ico: 'faim', n: nFaim, label: ['Petit creux', 'Affamé', 'Famélique', 'Mourant de faim'][nFaim - 1], desc: 'Trouve à manger. Vite.' });

  const nSoif = seuils(p.soif, [55, 35, 18, 6]);
  if (nSoif) etats.push({ ico: 'soif', n: nSoif, label: ['Soif', 'Assoiffé', 'Déshydraté', 'Mourant de soif'][nSoif - 1], desc: 'L\'eau passe avant tout le reste.' });

  if (p.blessures.some(b => b.saigne && !b.bandee)) {
    etats.push({ ico: 'saignement', n: 4, label: 'Saignement', desc: 'Tu perds du sang. Bande la plaie immédiatement.' });
  }
  if (p.blessures.length && !p.blessures.some(b => b.saigne && !b.bandee)) {
    const grave = p.blessures.some(b => b.type === 'profonde' || b.type === 'plaie');
    etats.push({ ico: 'blessure', n: grave ? 3 : 1, label: grave ? 'Gravement blessé' : 'Blessé', desc: 'Ouvre l\'écran Corps pour soigner tes blessures.' });
  }
  if (p.blessures.some(b => b.infecte)) etats.push({ ico: 'infection', n: 4, label: 'Infection', desc: 'Il te faut des antibiotiques, ou c\'est la fin.' });
  if (p.maladie === 'fievre') etats.push({ ico: 'fievre', n: 3, label: 'Fièvre', desc: 'Frissons, sueurs. Traite l\'infection et repose-toi.' });
  if (p.maladie === 'intoxication') etats.push({ ico: 'malade', n: 2, label: 'Intoxiqué', desc: 'Ton ventre se tord. Ça passera... probablement.' });

  const froid = froidActuel();
  if (froid >= 3) etats.push({ ico: 'froid', n: 3, label: 'Frigorifié', desc: 'Le froid te vide. Couvre-toi ou rentre à l\'abri.' });
  else if (froid > 0) etats.push({ ico: 'froid', n: 1, label: 'Froid', desc: 'Il te faudrait des vêtements plus chauds.' });

  const pt = poidsTotal(), pm = poidsMax();
  if (pt > pm) etats.push({ ico: 'surcharge', n: 3, label: 'Surchargé', desc: 'Trop lourd pour bouger. Allège ton sac.' });
  else if (pt > pm * 0.85) etats.push({ ico: 'surcharge', n: 1, label: 'Chargé', desc: 'Tu approches de la limite de poids.' });

  return etats;
}

export function updateHUD() {
  if (!G) return;
  $('#hud-time').textContent = heureTxt() + (estNuit() ? ' — nuit' : '');
  const lieuEl = $('#hud-lieu');
  if (lieuEl) lieuEl.textContent = G.world.lieuLabel || '';
  $('#moodles').innerHTML = calculerEtats()
    .map(e => `<span class="moodle n${e.n}" title="${e.desc}">${ico(e.ico)}<span class="mlabel">${e.label}</span></span>`)
    .join('');
}

export function setLieuLabel(txt) {
  if (G) G.world.lieuLabel = txt;
  const el = $('#hud-lieu');
  if (el) el.textContent = txt || '';
}

// ---------- Journal de bord ----------
export function log(texte, cls = '') {
  if (!G) return;
  G.log.push({ t: texte, c: cls, h: heureTxt() });
  if (G.log.length > 80) G.log.splice(0, G.log.length - 80);
  const div = $('#gamelog');
  if (div) { div.innerHTML = logHtml(); }
}
export function logHtml(n = 14) {
  if (!G) return '';
  return G.log.slice(-n).reverse().map(l => `<p class="${l.c}"><em>${l.h}</em> — ${l.t}</p>`).join('');
}

// ---------- Panneaux ----------
// opts.plein : modale PLEIN ÉCRAN (inventaire, corps) — le jeu disparaît derrière.
export function showPanel(html, opts = {}) {
  const p = $('#panel');
  p.classList.toggle('plein', !!opts.plein);
  p.innerHTML = `<div class="panel-box">${html}</div>`;
  p.classList.remove('hidden');
  p.onclick = (e) => { if (e.target === p) closePanel(); };
  const x = p.querySelector('.panel-close');
  if (x) x.onclick = closePanel;
  return p.querySelector('.panel-box');
}
export function closePanel() {
  const p = $('#panel');
  p.classList.add('hidden');
  p.classList.remove('plein');
  p.innerHTML = '';
}
export function panelOuvert() { return !$('#panel').classList.contains('hidden'); }

// ---------- Fenêtre d'événement (par-dessus la carte) ----------
// Les événements se jouent dans une fenêtre à part : la carte reste derrière.
export function showEvt(html) {
  const e = $('#evt');
  e.innerHTML = `<div class="evt-box">${html}</div>`;
  e.classList.remove('hidden');
  return e.querySelector('.evt-box');
}
export function closeEvt() {
  const e = $('#evt');
  e.classList.add('hidden');
  e.innerHTML = '';
}
export function evtOuvert() { return !$('#evt').classList.contains('hidden'); }

// ---------- Attente : le temps des gestes ----------
// Chaque action a un poids : un petit voile avec spinner bloque l'écran un instant,
// d'autant plus longtemps que l'action mange de minutes de jeu (~0,3 s à 1,5 s max).
// done() ne s'exécute qu'à la fin : les conséquences (combat, butin, mort) attendent.
export function attente(label, minutes, done) {
  const a = $('#attente');
  if (!a) { done(); return; }
  const ms = Math.min(1500, Math.round(280 + (minutes || 0) * 14));
  a.querySelector('.attente-label').textContent = label;
  a.classList.remove('hidden');
  setTimeout(() => {
    a.classList.add('hidden');
    done();
  }, ms);
}

// ---------- Toast ----------
let toastTimer = null;
export function toast(msg, ms = 2400) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// ---------- Aides HTML ----------
export function btnAct(attrs, label, sub = '', opts = {}) {
  const dis = opts.disabled ? 'disabled' : '';
  const cls = opts.classe ? ' ' + opts.classe : '';
  return `<button class="act${cls}" ${attrs} ${dis}>${label}${sub ? `<small>${sub}</small>` : ''}</button>`;
}
