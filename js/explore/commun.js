// ============ Exploration — outils partagés par les modules de l'écran (vue, interactions, butin, combat, HUD) ============
// Chaque module reçoit l'état de la vue courante (V) par lier(V) à l'entrée dans un lieu, lier(null) à la sortie.
import { G } from '../core/state.js';
import { pref } from '../core/prefs.js';
import { objet } from '../game/donnees.js';
import { niveauDepuisXp } from '../data/reglages.js';
import { K } from './niveau.js';

// Modules optionnels (tolère leur absence : bancs d'essai)
export const mod = { inv: null, player: null, audio: null, survie: null, panneaux: null };
export async function chargerOptionnels() {
  const essai = async (p) => { try { return await import(p); } catch (e) { return null; } };
  if (mod._charge) return;
  [mod.inv, mod.player, mod.audio, mod.survie] = await Promise.all([essai('../game/inventory.js'), essai('../game/player.js'), essai('../audio.js'), essai('../game/survival.js')]);
  mod._charge = true;
}

let V = null;
export function lierCommun(v) { V = v; }
export const vueCourante = () => V;

export const vib = (ms) => { try { if (pref('vibrations') !== false && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
export const sfx = (n, o) => { try { mod.audio && mod.audio.sfx && mod.audio.sfx(n, o); } catch (e) {} };
// Son situé dans le lieu : plus on est loin, moins on l'entend (au-delà de la portée : rien). Un étage d'écart = étouffé.
export function sfxA(nom, x, y, etage, portee = 14) {
  if (!V) return;
  let d = Math.hypot(x - V.j.x, y - V.j.y);
  if (etage && etage !== V.j.etage) d = d * 1.6 + 6;
  const f = 1 - d / portee;
  if (f <= 0) return;
  sfx(nom, { volume: Math.pow(f, 1.6), pan: Math.max(-0.8, Math.min(0.8, (x - V.j.x) / 10)) });
}
export function posPorte(cle) { const p = V && V.niveau.porteParCle[cle]; return p ? [p.x + 0.5, p.y + 0.5, p.etage] : null; }

// ---------- Conditions (REFONTE §4.5) : un seul module pour tout le jeu ----------
export { verifier as verifierCondition } from '../game/conditions.js';
export function compter(id) {
  if (mod.inv && mod.inv.countItem) return mod.inv.countItem(id);
  let n = 0; for (const it of G.player.inventaire) if (it.id === id) n += it.qty || 1;
  for (const s of Object.values(G.player.equip || {})) if (s === id) n++;
  return n;
}
export const niv = (s) => { try { return mod.player && mod.player.niveau ? mod.player.niveau(s) : niveauDepuisXp((G.player.skillXp || {})[s]); } catch (e) { return 0; } };
export const nomObjet = (id) => { const o = objet(id); return o ? o.nom : id; };
export function outil(id) { return compter(id) > 0 || (G.player.equip && G.player.equip.arme === id); }
export const capitaliser = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

export function message(t, ms = 2600) { if (!V) return; V.hud.msg.textContent = t; V.hud.msg.classList.add('on'); V.msgT = ms; }
export function afficherLieu(t) { if (!V) return; const h = V.hud.lieu; h.textContent = t; h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }

// Case libre la plus proche d'un marqueur (PNJ posé sur un meuble, entrée sur un objet…).
export function caseLibrePres(niveau, m) {
  if (!m) return null;
  const E = niveau.etages[niveau.etageIdx[m.etage]];
  if (!E.bloque[m.y * E.w + m.x]) return m;
  for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = m.x + dx, y = m.y + dy;
    if (x >= 0 && y >= 0 && x < E.w && y < E.h && !E.bloque[y * E.w + x] && E.code[y * E.w + x] === K.SOL) return { etage: m.etage, x, y };
  }
  return null;
}
