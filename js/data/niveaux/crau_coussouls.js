// Les coussouls de la Crau (NATURE : tenir pendant les sirènes, js/data/histoire/ruees.js).
// Réel : la steppe de galets entre Salon, Miramas et Saint-Martin-de-Crau ; herbe rase, cailloux roulés par l'ancienne
// Durance, murets de pierre sèche, grandes bergeries voûtées où l'on hivernait les troupeaux, puits à balancier.
// Ici : une grande parcelle ouverte (≈ 112 × 80 m) — on voit venir de loin, et on est vu de loin. La bergerie (un toit,
// des enclos), le puits (eau inépuisable), un abri de berger, les moutons morts du Berger quand le troupeau est passé.
import { parcelle } from '../../carte/parcelle.js';

export default parcelle({
  id: 'crau_coussouls', nom: 'Les coussouls de la Crau', typeButin: 'nature',
  pool: ['errant', 'errant', 'rampant'], morts: { n: [2, 4] },
}, { W: 140, H: 100, milieu: 'crau' }, (e, P) => {
  const { W, H, rnd } = P;

  // ---------- La bergerie : un long bâtiment de pierre, des enclos dedans ----------
  const pb = P.trouver(18, 11, [Math.floor(W * 0.3), 6, Math.floor(W * 0.75), Math.floor(H * 0.45)]) || { x: 50, y: 10 };
  const b = e.piece(pb.x, pb.y, 18, 11, { nom: 'La bergerie', sol: 'terre', mur: 'pierre', toit: 'tuiles', sombre: 1,
    portes: [{ cote: 's', a: 7, nom: 'le grand portail' }, { cote: 'e', a: 3 }], fenetres: [{ cote: 'n', a: 3 }, { cote: 'n', a: 11 }] });
  // enclos (murets bas) et paille
  e.murRect('muret', b.x0 + 5, b.y0, 1, 5); e.murRect('muret', b.x0 + 10, b.y0, 1, 5);
  e.taches('herbe_seche', b.x0, b.y0, b.w, b.h, 0.3, 1.4);
  e.objet('lit_simple', b.x1, b.y1 - 1, { w: 1, h: 2, nom: 'la paillasse du berger' });
  e.objet('table', b.x1 - 3, b.y1, { w: 2, h: 1 }); e.objet('chaise', b.x1 - 4, b.y1);
  e.objet('etagere', b.x0, b.y1, { w: 2, h: 1, nom: 'l’étagère du berger' });
  e.objet('caisse', b.x0 + 2, b.y1, { nom: 'le coffre à grain' });
  e.objet('armoire', b.x1 - 1, b.y0, { w: 2, h: 1, nom: 'l’armoire aux capes' });
  for (const [x, y] of [[b.x0 + 1, b.y0 + 1], [b.x0 + 7, b.y0 + 2], [b.x0 + 12, b.y0 + 1]]) e.objet('cadavre', x, y, { nom: 'un mouton mort' });
  e.semer('herbes', b.x0, b.y0, b.w, b.h, 8);

  // ---------- Le puits, devant la bergerie ----------
  let puits = [[pb.x + 4, pb.y + 13], [pb.x - 4, pb.y + 4], [pb.x + 20, pb.y + 6], [pb.x + 12, pb.y + 14]].find(([x, y]) => P.poser('fontaine', x, y, { nom: 'le puits', conteneur: false }, 1));
  if (!puits) { const q = P.trouver(2, 2); if (q) { e.objet('fontaine', q.x, q.y, { nom: 'le puits', conteneur: false }); puits = [q.x, q.y]; } }   // toujours de l'eau
  if (puits) e.decal('flaque', puits[0] + 1, puits[1] + 2.3, { r: 0.5 });
  for (const [dx, dy] of [[-3, 3], [-5, 5], [22, 2]]) P.poser('olivier', pb.x + dx, pb.y + dy, {}, 1);

  // ---------- L'abri du berger (à l'est), un enclos de pierre sèche ----------
  const pa = P.trouver(7, 6, [Math.floor(W * 0.7), Math.floor(H * 0.5), W - 6, H - 6]) || { x: W - 16, y: H - 14 };
  const a = e.piece(pa.x, pa.y, 7, 6, { nom: 'L’abri du berger', sol: 'terre', mur: 'pierre', toit: 'tuiles', sombre: 1, portes: [{ cote: 'o', a: 1 }] });
  e.objet('lit_simple', a.x1, a.y0, { w: 1, h: 2, nom: 'la couche de fougères' });
  e.objet('caisse', a.x0, a.y1, { nom: 'la caisse du berger' });
  e.decal('cendres', a.cx, a.cy + 0.5, { r: 0.4 });
  const pe = P.trouver(12, 9, [Math.floor(W * 0.08), Math.floor(H * 0.55), Math.floor(W * 0.5), H - 6], 1);
  if (pe) { e.contour('muret', pe.x, pe.y, 12, 9); e.solRect('herbe_seche', pe.x + 1, pe.y + 1, 10, 7); for (let k = 0; k < 3; k++) e.objet('cadavre', pe.x + 2 + k * 3, pe.y + 3 + (k % 2), { nom: 'un mouton mort' });
    // une brèche dans l'enclos
    for (const i of [(pe.y + 4) * W + pe.x, (pe.y + 5) * W + pe.x]) e.mur[i] = 0; }

  // ---------- Sur la piste : une voiture brûlée, des traces du troupeau ----------
  const [cx, cy] = P.chemin[2];
  if (P.libre(cx + 3, cy - 4, 4, 3)) { e.objet('voiture', cx + 3, cy - 4, { nom: 'la voiture brûlée' }); P.reserver(cx + 3, cy - 4, 3, 2); }
  e.semer('traces', 4, P.yA - 4, W - 8, 8, 30);

  // ---------- Des traînards du troupeau ----------
  for (let k = 0; k < 4; k++) { const x = 10 + Math.floor(rnd() * (W - 20)), y = 10 + Math.floor(rnd() * (H - 20)); if (P.libre(x, y)) e.zombie('errant', x + 0.5, y + 0.5, { etat: 'erre' }); }
  e.zombie('rampant', pb.x + 9, pb.y + 13, { etat: 'fait_le_mort', dir: 1 });
  for (let k = 0; k < 6; k++) { const x = 6 + Math.floor(rnd() * (W - 12)), y = 6 + Math.floor(rnd() * (H - 12)); if (P.libre(x, y)) e.objetSol('pierre', x, y); }
});
