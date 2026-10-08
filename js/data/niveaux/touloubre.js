// Les berges de la Touloubre (NATURE : tenir pendant les sirènes, js/data/histoire/ruees.js).
// Réel : la petite rivière qui sort de Salon et file vers Grans et Saint-Chamas, bordée de peupliers, de frênes et de
// cannes de Provence ; d'anciens moulins à huile et à blé, des jardins ouvriers au bord de l'eau.
// Ici : une grande parcelle (≈ 102 × 77 m) coupée du nord au sud par la rivière (eau inépuisable, à boire bouillie),
// une passerelle de planches sur le chemin, le vieux moulin (un toit, une meule), des jardins ouvriers et leur cabane
// à outils, la tente d'un pêcheur. De l'eau, du bois, des figues en saison : de quoi tenir.
import { parcelle } from '../../carte/parcelle.js';

export default parcelle({
  id: 'touloubre', nom: 'Les berges de la Touloubre', typeButin: 'nature',
  pool: ['errant', 'errant', 'rampant'], morts: { n: [2, 4] },
}, { W: 128, H: 96, milieu: 'riviere' }, (e, P) => {
  const { W, H, rnd } = P;
  const lit = P.lit;

  // ---------- Le vieux moulin, sur la rive ouest ----------
  // au bord de l'eau, rive ouest : on longe la rivière jusqu'à trouver la place (hors du chemin)
  let ym = -1, xm = -1;
  for (let k = 0; k < H - 20 && ym < 0; k++) {
    const y = 6 + ((Math.floor(H * 0.12) + k * 7) % (H - 20)), x = lit[y] - 15;
    if (P.libre(x - 1, y - 1, 14, 11)) { ym = y; xm = x; }
  }
  let m = null;
  if (ym >= 0) {
    P.reserver(xm - 2, ym - 2, 16, 13);
    m = e.piece(xm, ym, 12, 9, { nom: 'Le vieux moulin', sol: 'dalles', mur: 'pierre', toit: 'tuiles', sombre: 1,
      portes: [{ cote: 's', a: 4, nom: 'la porte du moulin' }], fenetres: [{ cote: 'e', a: 2 }, { cote: 'o', a: 3 }] });
    e.objet('machine', m.x0 + 4, m.y0 + 2, { w: 2, h: 2, nom: 'la meule', conteneur: false });
    e.objet('etagere', m.x0, m.y0, { w: 2, h: 1, nom: 'l’étagère du meunier' });
    e.objet('caisse', m.x1, m.y0, { nom: 'le coffre du moulin' });
    e.objet('lit_camp', m.x1, m.y1 - 1, { w: 1, h: 2, nom: 'le lit de camp' });
    e.objet('cuisine', m.x0, m.y1, { w: 3, h: 1, nom: 'l’évier de pierre' });
    e.decal('papiers', m.x0 + 6, m.y1 - 0.5, { n: 2 });
    e.zombie('errant', m.x0 + 8, m.y0 + 4, { etat: 'dort' });
  }

  // ---------- Les jardins ouvriers, rive est ----------
  const pj = P.trouver(16, 10, [Math.floor(W * 0.62), Math.floor(H * 0.5), W - 4, H - 4], 1);
  if (pj) {
    for (let k = 0; k < 3; k++) { e.solRect('terre', pj.x + k * 5, pj.y, 4, 6); e.semer('herbes', pj.x + k * 5, pj.y, 4, 6, 3); }
    e.objet('barriere', pj.x, pj.y + 7, { w: 2, h: 1 }); e.objet('barriere', pj.x + 9, pj.y + 7, { w: 2, h: 1 });
    const c = e.piece(pj.x + 11, pj.y + 6, 5, 4, { nom: 'La cabane à outils', sol: 'planches', mur: 'bois', toit: 'tole', sombre: 1, portes: [{ cote: 'o', a: 1 }] });
    e.objet('etagere', c.x0, c.y0, { w: 2, h: 1, nom: 'l’étagère à outils' });
    e.objet('caisse', c.x1, c.y1, { nom: 'la caisse de graines' });
    e.objet('fut', pj.x + 15, pj.y + 1, { nom: 'le bidon de récupération' });
  }

  // ---------- La tente d'un pêcheur, sur la berge ----------
  const yt = Math.floor(H * 0.62) + Math.floor(rnd() * 8), xt = lit[yt] + P.largeurLit + 4;
  if (P.libre(xt - 1, yt - 1, 5, 5)) {
    P.reserver(xt - 1, yt - 1, 5, 5);
    e.objet('tente', xt, yt, { conteneur: { nom: 'la tente du pêcheur', items: [{ id: 'canne_peche', qty: 1 }, { id: 'appat', qty: 2 }], table: 'nature.caisse' } });
    e.decal('cendres', xt + 3.6, yt + 3.5, { r: 0.4 });
  }

  // ---------- Des morts au bord de l'eau, des fruitiers ----------
  for (let k = 0; k < 3; k++) { const y = 8 + Math.floor(rnd() * (H - 16)), x = lit[y] + (rnd() < 0.5 ? -4 : P.largeurLit + 3); if (P.libre(x, y)) e.zombie('errant', x + 0.5, y + 0.5, { etat: 'erre' }); }
  { const y = Math.floor(H * 0.4), x = lit[y] - 3; if (P.libre(x, y)) e.zombie('rampant', x + 0.5, y + 0.5, { etat: 'fait_le_mort', dir: 0 }); }
  for (let k = 0; k < 3; k++) P.semis(k % 2 ? 'figuier' : 'amandier', 4, 4, W - 8, H - 8, 1, 2);
  for (let k = 0; k < 5; k++) { const x = 6 + Math.floor(rnd() * (W - 12)), y = 6 + Math.floor(rnd() * (H - 12)); if (P.libre(x, y)) e.objetSol('branche', x, y); }
});
