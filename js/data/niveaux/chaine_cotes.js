// La chaîne des Côtes — pinède (NATURE : tenir pendant les sirènes, js/data/histoire/ruees.js).
// Réel : la petite chaîne calcaire qui ferme la plaine de Salon au nord, de Lamanon à Rognes : pins d'Alep, chênes
// kermès, affleurements blancs, vieilles carrières, cabanons de chasse au bout des pistes DFCI.
// Ici : une grande parcelle de pinède (≈ 105 × 80 m) — le cabanon du grand-père de Lou (un vrai toit, une cheminée),
// une source sous les rochers (eau inépuisable), une carrière abandonnée, un campement de fuyards qui a mal fini.
// Peu de morts : ceux qui erraient là-haut sont descendus vers les sirènes.
import { parcelle } from '../../carte/parcelle.js';

export default parcelle({
  id: 'chaine_cotes', nom: 'La chaîne des Côtes', typeButin: 'nature',
  pool: ['errant', 'errant', 'rampant'], morts: { n: [2, 4] },
}, { W: 132, H: 100, milieu: 'pinede' }, (e, P) => {
  const { W, H, rnd } = P;

  // ---------- Le cabanon de chasse (le grand-père de Lou), au bout de la traverse ----------
  const pc = P.trouver(10, 8, [P.xT - 22, 6, P.xT + 22, Math.floor(H * 0.32)]) || { x: 10, y: 8 };
  const cab = e.piece(pc.x, pc.y, 10, 8, { nom: 'Le cabanon de chasse', sol: 'tomettes', mur: 'pierre', toit: 'tuiles', sombre: 1,
    portes: [{ cote: 's', a: 3, nom: 'la porte du cabanon' }], fenetres: [{ cote: 'e', a: 2 }, { cote: 'n', a: 4, l: 2 }] });
  e.objet('cheminee', cab.x0 + 3, cab.y0, { w: 2, h: 1, nom: 'la cheminée', conteneur: false });
  e.objet('lit_simple', cab.x0, cab.y0, { w: 1, h: 2 });
  e.objet('armoire', cab.x1 - 1, cab.y0, { w: 2, h: 1 });
  e.objet('etagere', cab.x1 - 1, cab.y1, { w: 2, h: 1, nom: 'l’étagère du chasseur' });
  e.objet('table', cab.x0 + 2, cab.y0 + 3, { w: 2, h: 1 });
  e.objet('chaise', cab.x0 + 4, cab.y0 + 3);
  e.objet('caisse', cab.x0, cab.y1, { nom: 'la caisse à cartouches' });
  e.decal('papiers', cab.x0 + 2.5, cab.y0 + 4.2, { n: 2 });
  e.objet('caisson', pc.x + 10, pc.y + 5, { nom: 'le tas de bois', conteneur: { nom: 'le tas de bois', items: [{ id: 'buche', qty: 2 }, { id: 'branche', qty: 3 }], table: null } });

  // ---------- La source, sous les rochers ----------
  const ps = P.trouver(5, 4, [Math.floor(W * 0.55), Math.floor(H * 0.55), W - 6, H - 6]) || { x: W - 20, y: H - 16 };
  e.murRect('rocher', ps.x, ps.y, 5, 1); e.murRect('rocher', ps.x, ps.y + 1, 1, 2);
  e.objet('fontaine', ps.x + 2, ps.y + 1, { nom: 'la source', conteneur: false });
  e.decal('mousse', ps.x + 2.5, ps.y + 3.4, { r: 0.8 }); e.decal('flaque', ps.x + 3, ps.y + 3.2, { r: 0.6 });
  e.objet('figuier', ps.x + 6, ps.y + 2);

  // ---------- La carrière abandonnée (ouest) ----------
  const pq = P.trouver(16, 12, [4, Math.floor(H * 0.55), Math.floor(W * 0.4), H - 4], 1) || { x: 6, y: H - 18 };
  e.murRect('rocher', pq.x, pq.y, 16, 2); e.murRect('rocher', pq.x, pq.y, 2, 12); e.murRect('rocher', pq.x + 14, pq.y, 2, 8);
  e.solRect('gravier', pq.x + 2, pq.y + 2, 12, 10); e.taches('debris', pq.x + 2, pq.y + 2, 12, 10, 0.2, 1.2);
  e.objet('camionnette', pq.x + 4, pq.y + 4, { w: 4, h: 2, nom: 'la camionnette rouillée' });
  e.objet('palette', pq.x + 10, pq.y + 3); e.objet('palette', pq.x + 11, pq.y + 3); e.objet('fut', pq.x + 3, pq.y + 9);
  e.objet('benne', pq.x + 9, pq.y + 8, { w: 2, h: 1 });
  e.zombie('errant', pq.x + 7, pq.y + 7, { etat: 'immobile' });

  // ---------- Le campement de fuyards (une clairière) ----------
  const pt = P.trouver(8, 7, [Math.floor(W * 0.35), Math.floor(H * 0.12), Math.floor(W * 0.9), Math.floor(H * 0.5)], 2) || { x: 70, y: 20 };
  e.solRect('terre', pt.x, pt.y, 8, 7);
  e.objet('tente', pt.x + 1, pt.y + 1, { conteneur: { nom: 'la tente déchirée', items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'allumettes', qty: 1 }, { id: 'drap', qty: 1 }], table: 'nature.caisse' } });
  e.decal('cendres', pt.x + 6, pt.y + 5, { r: 0.6 }); e.objet('gravats', pt.x + 6, pt.y + 2, { nom: 'des pierres noircies' });
  e.objet('cadavre', pt.x + 5, pt.y + 4, { nom: 'un fuyard' }); e.decal('flaque_sang', pt.x + 5.3, pt.y + 4.6, { r: 0.5 });
  e.zombie('rampant', pt.x + 4, pt.y + 5, { etat: 'fait_le_mort', dir: 2 });

  // ---------- Quelques arbres fruitiers, des morts qui errent encore ----------
  for (let k = 0; k < 4; k++) P.semis(k % 2 ? 'amandier' : 'olivier', 4, 4, W - 8, H - 8, 1, 2);
  for (let k = 0; k < 3; k++) { const x = 10 + Math.floor(rnd() * (W - 20)), y = 10 + Math.floor(rnd() * (H - 20)); if (P.libre(x, y)) e.zombie('errant', x + 0.5, y + 0.5, { etat: 'erre' }); }
  for (let k = 0; k < 5; k++) { const x = 6 + Math.floor(rnd() * (W - 12)), y = 6 + Math.floor(rnd() * (H - 12)); if (P.libre(x, y)) e.objetSol(k % 2 ? 'branche' : 'pierre', x, y); }
});
