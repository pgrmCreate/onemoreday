// ============ La radio — savoir à l'avance (sirènes, hordes, orages) ; sans elle, on est pris par surprise (sans DOM) ============
// Une radio, c'est LOURD (items.js : encombrant, à deux mains) : on la porte dans les mains, ou on la laisse au camp —
// posée tout près (par terre, dans un rangement à portée de bras), elle parle encore. Le poste à piles veut des piles
// (dans le sac ou à portée) ; la radio à manivelle (bricolée, js/data/recipes.js) n'en veut pas.
// Les messages des sirènes et des hordes : js/game/ruees.js ; ici : qui a une radio, et le bulletin météo.
import { G, noteJournal } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { METEO_RADIO } from '../data/histoire/ruees.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import * as inv from './inventory.js';

const estRadio = (id) => !!(id && ITEMS[id] && ITEMS[id].radio);
// La radio qui peut parler maintenant : { id, nom } | null (mains, sac, dos, ou posée à portée de main ; piles s'il en faut).
export function radioDispo(p = G && G.player) {
  if (!p) return null;
  const aPortee = inv.aPortee();
  const ids = [p.equip && p.equip.arme, p.equip && p.equip.mainG, p.equip && p.equip.dos, ...p.inventaire.map(x => x.id), ...aPortee.map(x => x.id)].filter(estRadio);
  for (const id of ids) {
    if (ITEMS[id].radio === 'piles' && !(inv.hasItem('piles', 1, p) || aPortee.some(x => x.id === 'piles'))) continue;
    return { id, nom: ITEMS[id].nom };
  }
  return null;
}
export const aUneRadio = () => !!radioDispo();
// Un message capté : un bruit de friture, le texte, une ligne au journal.
export function capter(texte, journal) {
  emit('toast', { texte: `Ta radio grésille. ${texte}`, type: 'alerte' });
  if (journal) noteJournal(journal, 'objectif');
  import('../audio.js').then(a => a.sfx && a.sfx('radio')).catch(() => {});
  emit('radio', { texte });
}

// ---------- Le bulletin météo : à 5 h et 17 h, ce qui vient pour la demi-journée suivante ----------
let off = null;
export function demarrerRadio() {
  arreterRadio();
  off = on('minute', ({ delta } = {}) => { try { bulletin(delta || 1); } catch (e) { console.warn('[radio]', e); } });
}
export function arreterRadio() { if (off) off(); off = null; }
// À 5 h et 17 h (une heure avant que le temps change) : si le temps va tourner, la radio le dit.
// (une nuit de sommeil fait sauter l'heure : le bulletin passé pendant qu'on dormait est perdu — c'est la vie)
function bulletin(delta) {
  if (!G || G.mode === 'invite' || delta > 90) return;
  const t = G.world.minutes;
  let b = -1;
  for (const h of [5, 17]) { const m = Math.floor(t / 1440) * 1440 + h * 60; if (m <= t && m > t - delta - 1) b = m; }
  if (b < 0 || G.world.radioMeteo === b) return;
  G.world.radioMeteo = b;
  const vient = meteoCourante(b + 70);
  const txt = METEO_RADIO[vient];
  if (!txt || vient === meteoCourante(b) || !aUneRadio()) return;
  capter(txt, `La radio annonce : ${({ pluie: 'de la pluie', orage: 'un orage', mistral: 'le mistral', brouillard: 'du brouillard' })[vient] || vient} dans l’heure.`);
}
