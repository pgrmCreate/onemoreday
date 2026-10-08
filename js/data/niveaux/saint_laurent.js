// Collégiale Saint-Laurent (CHAPITRE 1, discrétion) — refaite au format à couches d'après docs/RETOURS_JOUEUR.md §4.3.
// Réel : gothique provençal (1344-XVe s.), nef unique à croisées d'ogives, chapelles latérales, tombeau de Nostradamus
// dans la chapelle de la Vierge, clocher, sacristie ; à l'ouest le parvis et le square Jean-XXIII.
// En une phrase : une traversée silencieuse d'une nef pleine de morts debout ; au bout, tout se joue dans le chœur :
// Lou dans le clocher, la clé à la ceinture du prêtre, la sacristie juste derrière l'autel. On ne retraverse jamais la nef.
// Parcours : parvis (sac de Nathan) → portail → nef (lampe éteinte : les cierges suffisent ; on passe devant la grille de
// la chapelle de la Vierge où Nathan cogne) → chœur → clocher (Lou) → derrière l'autel (la clé) → sacristie → ruelle.
// Peuplement : les 46 morts de la nef (immobiles, tournés vers l'autel), le prêtre, Nathan. Aucun autre mort à
// l'intérieur ; les morts du lieu sont dehors (parvis, ruelle).
import { plan } from '../../carte/plan.js';

const W = 70, H = 36;
const EST = 0;                         // regard vers l'autel

export default plan({
  id: 'saint_laurent', nom: 'Collégiale Saint-Laurent', exterieur: true, version: 2, typeButin: 'eglise',
  pool: ['errant', 'errant', 'putrefie'], morts: { n: [0, 1] }, mortsDehorsSeulement: true,
}, (p) => {
  const e = p.etage('rdc', 'La collégiale', W, H, { sol: 'paves', monte: 'clocher' });

  // --- le quartier autour : maisons closes (on n'en voit que les toits) ---
  const close = (x, y, w, h) => { e.murRect('crepi', x, y, w, h); e.toit(x, y, w, h, 'tuiles'); };
  close(14, 0, 15, 11); close(29, 0, 8, 4); close(37, 0, 19, 6); close(56, 0, 8, 6); close(62, 6, 2, 5); close(63, 11, 1, 21); close(51, 6, 5, 5); close(37, 6, 14, 5); close(64, 0, 6, 32);
  e.murRect('pierre', 14, 25, 39, 7);                       // les chapelles latérales sud, murées
  e.toit(14, 25, 39, 7, 'tuiles');

  // --- le square Jean-XXIII et le parvis (dehors) ---
  e.solRect('herbe', 0, 0, 13, 9); e.taches('terre', 0, 0, 13, 9, 0.2, 1.3);
  e.murRect('haie', 0, 9, 6, 1); e.murRect('haie', 8, 9, 5, 1);
  for (const [x, y] of [[2, 2], [9, 3], [5, 6]]) e.objet('platane', x, y);
  e.objet('banc', 3, 4, { w: 2, h: 1 });
  e.solRect('dalles', 0, 10, 14, 22);
  e.marqueur('sac_nathan', 8, 22, { nom: 'le sac de sport' });
  e.objet('debris', 9, 24, { nom: 'le vélo couché', conteneur: false });
  e.semer('feuilles', 0, 10, 14, 22, 10);
  e.entree('defaut', 3, 20);
  e.sortie(0, 12, 1, 18);

  // --- la nef (36 × 12) : 46 morts debout entre les bancs, tournés vers l'autel ---
  const nef = e.piece(14, 11, 38, 14, { nom: 'La nef', sol: 'marbre', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'o', a: 5, nom: 'le portail' }, { cote: 'o', a: 6, nom: 'le portail' }],
    ouvertures: [{ cote: 'e', a: 2, l: 8 }] });           // l'arc du chœur
  e.marqueur('presentoir', nef.x0 + 1, nef.y0 + 3, { nom: 'la feuille paroissiale' });
  e.objet('etagere', nef.x0, nef.y0 + 1, { w: 1, h: 2, nom: 'le présentoir', conteneur: false });
  e.declencheur(nef.x0, nef.y0, 3, 12, { marqueur: 'nef_entree' });
  // bancs : de x 19 à 43, deux blocs (allée centrale y 17-18, bas-côtés y 12-13 et 22-23 dégagés)
  const places = [];
  for (let x = 19; x <= 43; x += 2) {
    e.objet('banc', x, 14, { rot: 1, w: 1, h: 3, nom: 'un banc' }); e.objet('banc', x, 19, { rot: 1, w: 1, h: 3, nom: 'un banc' });
    for (const y of [14, 15, 16, 19, 20, 21]) places.push([x + 1, y]);
  }
  // 46 morts, répartis de façon déterministe dans les rangs
  let k = 0;
  for (let i = 0; i < places.length && k < 46; i++) {
    if ((i * 37) % 10 < 6) { const [x, y] = places[i]; e.zombie(k % 7 === 3 ? 'putrefie' : 'errant', x, y, { etat: 'immobile', dir: EST }); k++; }
  }
  for (let i = 0; i < places.length && k < 46; i++) { const [x, y] = places[i]; if ((i * 37) % 10 >= 6) { e.zombie('errant', x, y, { etat: 'immobile', dir: EST }); k++; } }
  // les cierges : on traverse la nef lampe éteinte
  for (const x of [18, 24, 30, 36, 42, 48]) { e.decal('bougies', x + 0.5, nef.y0 + 0.4); e.lumiere('bougie', x + 0.5, nef.y0 + 0.5, { r: 4, i: 0.7 }); }
  for (const x of [21, 33, 45]) { e.decal('bougies', x + 0.5, nef.y1 + 0.5); e.lumiere('bougie', x + 0.5, nef.y1 + 0.5, { r: 3.5, i: 0.6 }); }

  // --- la chapelle de la Vierge (au milieu de la nef, côté nord) : Nathan derrière la grille ---
  const vi = e.piece(29, 4, 8, 8, { nom: 'La chapelle de la Vierge', sol: 'marbre', mur: 'pierre', sombre: 1, toit: 'tuiles' });
  e.porte(32, 11, { verrou: { flag: 'grille_vierge_scellee' }, style: 'grille', marqueur: 'tombeau_nostradamus', nom: 'la grille cadenassée de la chapelle',
    message: 'Un antivol de vélo ferme la grille. Tu ne peux pas l’ouvrir.' });
  e.objet('caveau', vi.x0 + 2, vi.y0, { w: 3, h: 2, nom: 'le tombeau de Nostradamus' });
  e.objet('statue', vi.x1, vi.y0, { nom: 'la Vierge de plâtre' });
  e.zombie('coureur', 32, 10, { etat: 'cogne', dir: Math.PI / 2 });
  e.decal('bougies', vi.x0 + 0.5, vi.y1 + 0.3); e.lumiere('bougie', vi.x0 + 0.5, vi.y1 + 0.5, { r: 3, i: 0.6 });

  // --- le chœur (10 × 12) : l'autel, le prêtre ; le clocher au nord, la sacristie au sud ---
  const ch = e.piece(51, 11, 12, 14, { sol: 'marbre', mur: 'pierre', sombre: 1, toit: 'tuiles',
    ouvertures: [{ cote: 'o', a: 2, l: 8 }],
    portes: [{ cote: 'n', a: 6, nom: 'la porte du clocher' },
      { cote: 's', a: 5, verrou: 'cle_sacristie', marqueur: 'porte_sacristie', nom: 'la porte de la sacristie',
        message: 'Fermée à clé. Une plaque : SACRISTIE. Le curé gardait ses clés sur lui.' }] });
  e.objet('autel', 56, 16, { w: 2, h: 4, nom: 'l’autel', marqueur: 'cure_autel', conteneur: false });
  e.zombie('errant', 59, 18, { etat: 'immobile', dir: Math.PI });        // le prêtre, tourné vers la nef, sa clochette
  e.objet('pilier', ch.x0 + 1, ch.y0 + 1, { nom: 'un pilier du chœur' }); e.objet('pilier', ch.x0 + 1, ch.y1 - 1, { nom: 'un pilier du chœur' });
  for (const [x, y] of [[55.5, 15.5], [58.5, 15.5], [55.5, 20.5], [58.5, 20.5]]) { e.decal('bougies', x, y); e.lumiere('bougie', x, y, { r: 3.2, i: 0.7 }); }
  e.decal('flaque_sang', 59.4, 19.2, { r: 0.5 });

  // --- le pied du clocher (4 × 4) ---
  const pc = e.piece(56, 6, 6, 6, { nom: 'Le pied du clocher', sol: 'paves', mur: 'pierre', sombre: 2, sansMorts: true });
  e.escalier('monte', 59, 7, 2, 2);
  e.decal('bougies', pc.x0 + 0.5, pc.y1 + 0.2); e.decal('traces', pc.x0 + 1.5, pc.y1, { a: -Math.PI / 2 });
  e.objet('poubelle', pc.x0, pc.y0, { nom: 'une bouteille de vin de messe vide', conteneur: false });

  // --- la sacristie (8 × 6) : porte basse sur la ruelle ---
  const sa = e.piece(53, 24, 10, 8, { nom: 'La sacristie', sol: 'parquet', mur: 'pierre', sombre: 2, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 's', a: 2, nom: 'la porte basse' }] });
  e.objet('armoire', sa.x0, sa.y0 + 1, { rot: 1, w: 1, h: 2, nom: 'l’armoire aux vêtements liturgiques' });
  e.objet('lavabo', sa.x1, sa.y0, { nom: 'le lavabo de la sacristie' });
  e.objet('caisse', sa.x1, sa.y1, { nom: 'le coffre de la sacristie', conteneur: { nom: 'le coffre de la sacristie', items: [{ id: 'allumettes', qty: 1 }, { id: 'alcool_fort', qty: 1 }], table: 'eglise.caisse' } });

  // --- la ruelle (dehors, au sud) : sortie est, et retour vers le parvis ---
  e.solRect('paves', 14, 32, 56, 4);
  e.nommer(40, 33, 'La ruelle', { sol: 'paves', exterieur: true });
  e.sortie(W - 1, 32, 1, 4);
  e.objet('poubelle', 46, 33); e.semer('papiers', 20, 32, 40, 4, 6);

  // ======================= LE CLOCHER : la chambre des cloches (7 × 7) =======================
  const c = p.etage('clocher', 'Le clocher', W, H, { sol: null, descend: 'rdc' });
  const cl = c.piece(55, 3, 9, 9, { nom: 'La chambre des cloches', sol: 'planches', mur: 'pierre', sombre: 1, sansMorts: true,
    fenetres: [{ cote: 'n', a: 3 }, { cote: 'o', a: 2 }, { cote: 'e', a: 4 }] });
  c.escalier('descend', 59, 7, 2, 2);
  c.objet('cloche', cl.x0, cl.y0, { nom: 'le bourdon' });
  c.objet('cloche', cl.x0 + 3, cl.y0, { w: 1, h: 1, nom: 'la cloche' });
  c.objet('cloche', cl.x0, cl.y1 - 1, { w: 1, h: 1, nom: 'la petite cloche' });
  c.marqueur('clocher_lou', cl.x0 + 1, cl.y1);
  c.decal('bougies', cl.x0 + 2.4, cl.y1 + 0.4); c.lumiere('bougie', cl.x0 + 2.5, cl.y1 + 0.5, { r: 3, i: 0.6 });
});
