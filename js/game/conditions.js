// ============ Conditions (REFONTE §4.5) — partagées par scènes, déclencheurs, rencontres ============
import { G } from '../core/state.js';
import * as clock from '../core/clock.js';
import { niveauDepuisXp } from '../data/reglages.js';

let inv = null;
import('./inventory.js').then(m => { inv = m; }).catch(() => {});

export function compterObjet(id) {
  if (inv && inv.countItem) return inv.countItem(id);
  let n = 0;
  for (const it of G.player.inventaire) if (it.id === id) n += it.qty || 1;
  for (const s of Object.values(G.player.equip || {})) if (s === id) n++;
  return n;
}

export function verifier(c) {
  if (!c) return true;
  if (!G) return false;
  const W = G.world;
  for (const [k, v] of Object.entries(c)) {
    switch (k) {
      case 'flag': if (!W.flags[v]) return false; break;
      case 'pasFlag': if (W.flags[v]) return false; break;
      case 'flagEgal': if (W.flags[v[0]] !== v[1]) return false; break;
      case 'objet': { const [id, q] = Array.isArray(v) ? v : [v, 1]; if (compterObjet(id) < q) return false; break; }
      case 'pasObjet': if (compterObjet(v) > 0) return false; break;
      case 'skill': if (niveauDepuisXp((G.player.skillXp || {})[v[0]] || 0) < v[1]) return false; break;
      case 'nuit': if (clock.estNuit() !== !!v) return false; break;
      case 'jourMin': if (clock.jour() < v) return false; break;
      case 'jourMax': if (clock.jour() > v) return false; break;
      case 'heureMin': if (clock.heure() < v) return false; break;
      case 'heureMax': if (clock.heure() > v) return false; break;
      case 'lieuVisite': if (!(W.lieux[v] && W.lieux[v].visite)) return false; break;
      case 'quete': { const q = W.quetes[v[0]]; if (!q || q.etape !== v[1]) return false; break; }
      case 'queteFaite': { const q = W.quetes[v]; if (!q || !q.faite) return false; break; }
      case 'solo': if ((G.mode === 'solo') !== !!v) return false; break;
      case 'ou': if (!v.some(verifier)) return false; break;
      case 'et': if (!v.every(verifier)) return false; break;
      case 'non': if (verifier(v)) return false; break;
      default: break;
    }
  }
  return true;
}

// Texte lisible d'une condition non remplie (choix grisés).
export function raison(c) {
  if (!c) return '';
  const m = [];
  if (c.objet) { const [id, q] = Array.isArray(c.objet) ? c.objet : [c.objet, 1]; if (compterObjet(id) < q) m.push(`il te faut : ${nomObjet(id)}${q > 1 ? ' ×' + q : ''}`); }
  if (c.skill) m.push(`${c.skill[0]} niveau ${c.skill[1]}`);
  if (c.nuit != null) m.push(c.nuit ? 'de nuit seulement' : 'de jour seulement');
  return m.join(' · ') || 'impossible pour l’instant';
}
let ITEMS = null;
import('./donnees.js').then(m => { ITEMS = m; }).catch(() => {});
function nomObjet(id) { const o = ITEMS && ITEMS.objet(id); return o ? o.nom : id; }
