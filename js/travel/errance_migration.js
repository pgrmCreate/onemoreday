// Migration des rues v0 : préserver les possessions lorsque le plan change d'orientation.
import { parserNiveau } from '../explore/niveau.js';
import { migrerEtat } from '../carte/migrer.js';
import { tailleConstruction } from '../data/construction.js';
import { planCelluleV0 } from './errance_v0.js';

export function tournerPositionV0(p, sens, w = 0, h = 0) {
  const { x, y } = p;
  if (sens === 'n') { p.x = y; p.y = 44 - x - w; }
  else if (sens === 's') { p.x = 24 - y - h; p.y = x; }
  else if (sens === 'o') { p.x = 44 - x - w; p.y = 24 - y - h; }
  if (p.dir != null) p.dir += ({ e: 0, n: -Math.PI / 2, s: Math.PI / 2, o: Math.PI })[sens];
  return p;
}

export function migrerRueV0(etat, niveau, cellule, sens) {
  const ancien = parserNiveau(planCelluleV0(niveau.id, cellule));
  const remap = {}, libres = new Set(niveau.meubles);
  // Associer une seule fois chaque ancien meuble au meuble du même type le plus proche.
  // Les clés mémorisées passent en premier : aucun contenu ni démontage n'est écrasé.
  const cles = new Set([...Object.keys(etat.conteneurs || {}), ...(etat.retires || []), ...Object.keys(etat.eau || {})]);
  const meubles = ancien.meubles.slice().sort((a, b) => Number(cles.has(b.cle)) - Number(cles.has(a.cle)));
  for (const m of meubles) {
    const p = tournerPositionV0({ x: (m.x0 + m.x1 + 1) / 2, y: (m.y0 + m.y1 + 1) / 2 }, sens);
    const candidats = [...libres].filter(n => n.type === m.type && n.etage === m.etage);
    candidats.sort((a, b) => Math.hypot((a.x0 + a.x1 + 1) / 2 - p.x, (a.y0 + a.y1 + 1) / 2 - p.y)
      - Math.hypot((b.x0 + b.x1 + 1) / 2 - p.x, (b.y0 + b.y1 + 1) / 2 - p.y));
    if (candidats[0]) { remap[m.cle] = candidats[0].cle; libres.delete(candidats[0]); }
  }
  for (const liste of [etat.sol, etat.cadavres, etat.zombies]) for (const p of liste || []) tournerPositionV0(p, sens);
  for (const c of etat.constructions || []) {
    const [w, h] = tailleConstruction(c.type, c.rot);
    tournerPositionV0(c, sens, w, h);
    c.rot = ((c.rot || 0) + ({ e: 0, n: 3, s: 1, o: 2 })[sens]) % 4;
  }
  etat.sol ||= [];
  // Un meuble sans équivalent laisse son contenu au sol, avec son état (eau, usure…).
  let uid = Math.max(etat.uid || 1, ...etat.sol.map(o => Number(o.uid) + 1).filter(Number.isFinite));
  for (const [cle, c] of Object.entries(etat.conteneurs || {})) if (!remap[cle]) {
    const m = ancien.meubleParCle[cle];
    const p = tournerPositionV0({ x: m ? m.x0 + 0.5 : 12.5, y: m ? m.y0 + 0.5 : 12.5 }, sens);
    for (const item of c.items || []) etat.sol.push({ ...item, uid: uid++, etage: m?.etage || 'rue', ...p });
    delete etat.conteneurs[cle];
  }
  etat.uid = uid;
  etat.retires = (etat.retires || []).filter(cle => remap[cle]);
  for (const cle of Object.keys(etat.eau || {})) if (!remap[cle]) delete etat.eau[cle];
  return migrerEtat(etat, niveau, { remap, tailles: c => tailleConstruction(c.type, c.rot) });
}
