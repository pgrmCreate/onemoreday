// ============ Migrer l'état d'un lieu vers une nouvelle version de son plan ============
// Un plan refait garde normalement ses coordonnées ; on décrit seulement ce qui a bougé :
//   remap : { 'rdc:22,15': 'rdc:25,15', … } — clés de meubles déplacés (fouille, eau, meubles démontés, portes)
//   et l'on remet à une case libre ce qui se trouve désormais dans un mur ou hors du plan (objets posés, cadavres,
//   morts, constructions avec leur emprise), en les étalant au lieu de les empiler.
//   migrerEtat(etat, niveau, { remap, tailles }) → etat (modifié). tailles(c) → [w, h] en unités pour une construction.
import { FIN, K } from './catalogue.js';

export function migrerEtat(etat, niveau, { remap = {}, tailles = () => [1, 1] } = {}) {
  const cle = (k) => remap[k] || k;
  const cles = (obj) => { const out = {}; for (const [k, v] of Object.entries(obj || {})) out[cle(k)] = v; return out; };
  etat.portes = cles(etat.portes); etat.conteneurs = cles(etat.conteneurs); etat.eau = cles(etat.eau);
  etat.retires = (etat.retires || []).map(cle);
  const pris = new Set();      // unités déjà attribuées pendant la migration (on étale)
  const E = (etage) => niveau.etages[niveau.etageIdx[etage]];
  const libre = (Et, x, y) => {
    if (!Et || x < 0 || y < 0 || x >= Et.w / FIN || y >= Et.h / FIN) return false;
    for (let dy = 0; dy < FIN; dy++) for (let dx = 0; dx < FIN; dx++) {
      const i = (y * FIN + dy) * Et.w + x * FIN + dx;
      if (Et.bloque[i] || Et.code[i] !== K.SOL) return false;     // du sol ordinaire : ni mur, ni sortie, ni porte, ni eau
    }
    return true;
  };
  const emprise = (Et, x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (!libre(Et, xx, yy) || pris.has(`${Et.id}:${xx},${yy}`)) return false; return true; };
  const reserver = (Et, x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) pris.add(`${Et.id}:${xx},${yy}`); };
  const valable = (o, w, h) => { const Et = E(o.etage); if (!Et) return false; const x0 = Math.floor(o.x), y0 = Math.floor(o.y);
    for (let yy = y0; yy < y0 + h; yy++) for (let xx = x0; xx < x0 + w; xx++) if (!libre(Et, xx, yy)) return false; return true; };
  // la case libre la plus proche (anneaux croissants), assez grande pour w × h, hors de ce qui est déjà réservé
  // (emprises des constructions, objets déjà relogés) ; ce qui est à une place valable n'est pas passé par ici
  const placer = (o, w = 1, h = 1) => {
    const Et = E(o.etage); if (!Et) return false;
    const x0 = Math.floor(o.x), y0 = Math.floor(o.y);
    const W = Et.w / FIN, H = Et.h / FIN;
    for (let r = 1; r < Math.max(W, H); r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = Math.min(W - w, Math.max(0, x0 + dx)), y = Math.min(H - h, Math.max(0, y0 + dy));
        if (!emprise(Et, x, y, w, h)) continue;
        for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) pris.add(`${Et.id}:${xx},${yy}`);
        o.x += x - x0; o.y += y - y0;
        return true;
      }
    }
    return false;
  };
  // 1. les constructions toujours bien placées réservent d'abord leur emprise ; 2. on reloge les autres autour ;
  // 3. objets posés, cadavres, morts : une place valable est gardée (une pile reste une pile), sinon on les reloge sans
  //    les poser sous une construction ni les uns sur les autres
  const cons = etat.constructions || [], aReloger = [];
  for (const c of cons) { const [w, h] = tailles(c); if (valable(c, w, h)) reserver(E(c.etage), Math.floor(c.x), Math.floor(c.y), w, h); else aReloger.push([c, w, h]); }
  for (const [c, w, h] of aReloger) placer(c, w, h);
  const poser = (o) => valable(o, 1, 1) || placer(o);
  for (const o of etat.sol || []) poser(o);
  for (const o of etat.cadavres || []) poser(o);
  etat.zombies = (etat.zombies || []).filter(z => poser(z));
  etat.planV = niveau.planVersion || 0;
  return etat;
}
