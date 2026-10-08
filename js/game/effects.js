// ============ Effets déclaratifs (REFONTE §4.5) — scènes, rencontres, déclencheurs ============
// appliquerEffets(effets) applique ce qui est immédiat et RENVOIE ce qui doit être traité par l'appelant :
//   { combat, teleporter, detour, demiTour, cinematique }  (le dialogue enchaîne combat/cinématique,
//   le voyage lit detour/demiTour, le flow applique teleporter à la fermeture de la scène).
import { G, setFlag, retirerFlag, noteJournal } from '../core/state.js';
import { emit } from '../core/bus.js';
import * as clock from '../core/clock.js';
import * as quetes from './quetes.js';
import * as inv from './inventory.js';
import * as player from './player.js';
import * as survival from './survival.js';
import { objet } from './donnees.js';
import { tirerButinTable } from '../data/butin.js';
import { DOCUMENTS } from '../data/histoire/documents.js';

const nom = (id) => (objet(id) || {}).nom || id;

export function donner(id, qty = 1) {
  if (qty > 0) {
    // ce qui ne rentre pas attend dans « À trier » : le joueur choisit ce qu'il garde à la fin de la scène
    const r = inv.addItem(id, qty, {}, undefined, { siPlein: 'tri' });
    const ajoute = r && r.ajoute != null ? r.ajoute : qty;
    emit('toast', { texte: `+ ${nom(id)}${qty > 1 ? ' ×' + qty : ''}${r && r.aTrier ? ' (pas la place : à trier)' : ''}`, type: 'objet' });
    return ajoute;
  }
  if (qty < 0) { inv.removeItem(id, -qty); emit('toast', { texte: `− ${nom(id)}${qty < -1 ? ' ×' + (-qty) : ''}`, type: 'objet' }); }
  return 0;
}

export function appliquerEffets(effets, ctx = {}) {
  const res = {};
  if (!effets || !G) return res;
  const p = G.player;
  for (const [k, v] of Object.entries(effets)) {
    try {
      switch (k) {
        case 'flag': if (Array.isArray(v)) setFlag(v[0], v[1]); else setFlag(v, true); break;
        case 'flags': for (const [fk, fv] of Object.entries(v)) setFlag(fk, fv); break;
        case 'retirerFlag': (Array.isArray(v) ? v : [v]).forEach(retirerFlag); break;
        case 'objet': donner(v[0], v[1] ?? 1); break;
        case 'objets': for (const [id, q] of v) donner(id, q ?? 1); break;
        case 'blessure': survival.infligerBlessure(p, { ...v }, { degats: v.degats }); break;
        case 'pv': p.pv = Math.max(0, Math.min(p.pvMax, p.pv + v)); if (p.pv <= 0) { p._cause = p._cause || 'combat'; survival.causeMort(p) && emit('mort', { cause: 'combat' }); } break;
        case 'sta': p.sta = Math.max(0, Math.min(p.staMax, p.sta + v)); break;
        case 'faim': case 'soif': case 'fatigue': p[k] = Math.max(0, Math.min(100, (p[k] ?? 100) + v)); break;
        case 'mal': survival.ajouterMal(p, v); break;
        case 'infection': if (v) survival.ajouterMal(p, 15); break;
        case 'tempsMin': clock.avancer(v); break;
        case 'xp': player.gagnerXps(v); break;
        case 'decouvrir': for (const id of (Array.isArray(v) ? v : [v])) { const L = G.world.lieux[id] || (G.world.lieux[id] = {}); if (!L.decouvert) { L.decouvert = true; emit('lieu:decouvert', { id }); } } break;
        case 'quete': quetes.avancer(v[0], v[1]); break;
        case 'journal': noteJournal(v); break;
        case 'document': if (!G.documents.includes(v)) { G.documents.push(v); emit('toast', { texte: `Document : ${(DOCUMENTS[v] || {}).titre || v}`, type: 'document' }); } emit('document', { id: v, silencieux: true }); break;
        case 'butin': {
          const items = tirerButinTable(v.table, v.n || 1, Math.random, { jour: clock.jour(), coop: G.mode !== 'solo' });
          if (!items.length) emit('toast', { texte: 'Rien d’utile.', type: 'info' });
          for (const it of items) donner(it.id, it.qty);
          break;
        }
        case 'bruit': emit('bruit', { rayon: v * 4, source: 'scene' }); break;
        case 'combat': res.combat = v; break;
        case 'teleporter': res.teleporter = v; break;
        case 'cinematique': res.cinematique = v; break;
        case 'detour': res.detour = (res.detour || 0) + v; break;
        case 'demiTour': res.demiTour = !!v; break;
        default: break; // clé inconnue : ignorée sans casse
      }
    } catch (e) { console.warn('[effets]', k, v, e); }
  }
  return res;
}
