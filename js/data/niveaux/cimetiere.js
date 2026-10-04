// Cimetière Saint-Roch (PROLOGUE) — refait avec l'API à couches (js/carte/plan.js).
// Réel : cimetière en terrasses sur le rocher, bd du Roi-René ; chapelles funéraires en rangs, grille ouvragée.
// Plus compact et plus dense que l'ancien plan (46 × 34 au lieu de 60 × 45), lisible dès la première minute :
//   la chapelle Roux-Bérenger (on s'y réveille, des bougies brûlent encore) → dehors, une FUSÉE ROUGE qui finit de brûler
//   près d'un soldat mort (sa lampe frontale ; un rampant fait le mort à côté : premier combat) → l'esplanade NRBC
//   (housses en rang, fût enflammé, camion au gyrophare, conteneur A où « ça cogne », tente, robinet) → la remise
//   (une pelle : de quoi se défendre) → la loge du gardien (la clé ; il dort dans son fauteuil) → la grille (à deux en co-op).
// Chemin discret : le carré ancien, à l'ouest (herbe haute, ossuaire noir où se logent les morts procéduraux).
import { plan } from '../../carte/plan.js';

export default plan({
  id: 'cimetiere', nom: 'Cimetière Saint-Roch', exterieur: true, typeButin: 'cimetiere',
  pool: ['errant', 'errant', 'rampant'], morts: { n: [1, 3] },
}, (p) => {
  const W = 46, H = 34;
  const e = p.etage('sol', 'Cimetière', W, H, { sol: 'herbe' });

  // ---------- Le sol : herbe, terre retournée, allées de gravier ----------
  e.taches('terre', 1, 1, W - 2, 27, 0.08, 1.4);
  e.taches('herbe_seche', 1, 1, 18, 27, 0.12, 2);
  e.chemin('gravier', [[2, 10], [43, 10]], 2);          // l'allée des Pins (est-ouest)
  e.chemin('gravier', [[21, 11], [21, 28]], 2);          // l'allée centrale (vers la grille)
  e.chemin('gravier', [[23, 19], [43, 19]], 1);          // vers l'esplanade
  e.chemin('gravier', [[9, 24], [20, 24]], 1);           // vers la loge
  e.chemin('gravier', [[37, 9], [37, 10]], 1);           // devant la chapelle
  e.solRect('beton', 24, 13, 20, 11);                    // l'esplanade NRBC
  e.taches('gravier', 24, 13, 20, 11, 0.1, 1.2);
  e.solRect('gravier', 17, 25, 10, 4);                   // la placette de l'entrée
  // le boulevard du Roi-René, derrière la grille
  e.solRect('trottoir', 0, 30, W, 1);
  e.solRect('bitume', 0, 31, W, 3);

  // ---------- L'enceinte (pierre sèche), la grille ----------
  e.contour('pierre', 0, 0, W, 30);
  e.porte(22, 29, { verrou: { flag: 'pro_grille_ouverte' }, exterieure: true, nom: 'la grille principale', style: 'grille' });
  e.murRect('grille', 18, 29, 4, 1); e.murRect('grille', 23, 29, 4, 1); // la grille ouvragée laisse voir le boulevard
  e.marqueur('grille_sortie', 22, 28);

  // ---------- La chapelle Roux-Bérenger (le réveil) ----------
  const ch = e.piece(34, 2, 8, 7, { nom: 'Chapelle Roux-Bérenger', sol: 'marbre', mur: 'pierre', sombre: 1, toit: 'ardoise',
    portes: [{ cote: 's', a: 2, nom: 'la porte de la chapelle' }], fenetres: [{ cote: 's', a: 4 }] });
  e.objet('cercueil', ch.x0, ch.y0, { rot: 1, w: 2, h: 1 });
  e.objet('cercueil', ch.x1 - 1, ch.y0, { rot: 1, w: 2, h: 1 });
  e.objet('treteau', ch.x0 + 2, ch.y0, { nom: 'le sachet agrafé à ta housse', marqueur: 'scelle_effets', conteneur: false, w: 2, h: 1 });
  e.objet('couronne', ch.x0 + 5, ch.y0 + 1);
  e.objet('housse', ch.x0 + 1, ch.y0 + 2);
  e.objet('housse', ch.x0 + 4, ch.y0 + 2);
  e.objet('housse', ch.x0, ch.y0 + 2, { rot: 1, w: 1, h: 1 });
  e.decal('bougies', ch.x0 + 0.6, ch.y0 + 1.4); e.decal('bougies', ch.x1 + 0.3, ch.y0 + 1.5);
  e.decal('fleurs', ch.x0 + 2.5, ch.y0 + 1.3, { r: 0.4 });
  e.entree('caveau', ch.x0 + 3, ch.y0 + 3);
  // la sortie de la chapelle : la fusée rouge, le soldat — le premier choc
  e.declencheur(35, 9, 5, 1, { scene: 'pro_dehors', unique: true });

  // ---------- La chapelle voisine (Estève) et la housse de Patrick ----------
  const es = e.piece(26, 2, 7, 6, { nom: 'Chapelle Estève', sol: 'marbre', mur: 'pierre', sombre: 2, toit: 'ardoise',
    portes: [{ cote: 's', a: 2, etat: 'ouverte' }] });
  e.objet('cercueil', es.x0, es.y0, { rot: 1, w: 2, h: 1 }); e.objet('autel', es.x0 + 2, es.y0, { w: 3, h: 1 });
  e.objet('housse', 31, 8, { rot: 1, w: 1, h: 1 }); e.marqueur('housse_patrick', 31, 8);
  e.decal('traces', 28.5, 8.6, { a: 0.2 });

  // ---------- L'allée des mausolées : le soldat NRBC, la fusée ----------
  e.objet('cadavre', 41, 11); e.marqueur('soldat_nrbc', 41, 11, { nom: 'le soldat' });
  e.lumiere('fusee', 40.4, 12.3); e.decal('cendres', 40.4, 12.3, { r: 0.35 });
  e.decal('flaque_sang', 41.3, 11.6, { r: 0.6 });
  e.zombie('rampant', 39, 12, { etat: 'fait_le_mort', dir: 0 });          // il « dort » contre le soldat
  e.objet('stele', 42, 12); e.objet('tombe', 43, 12, { rot: 0, w: 1, h: 2 });
  // mausolées de part et d'autre de l'allée
  for (const [x, y] of [[3, 2], [8, 2], [14, 2], [19, 2]]) {
    e.piece(x, y, 5, 6, { sol: 'marbre', mur: 'pierre', sombre: 2, toit: 'ardoise', portes: [{ cote: 's', a: 1, etat: x === 14 ? 'verrouillee' : 'fermee' }] });
    e.objet('cercueil', x + 1, y + 1, { rot: 1, w: 2, h: 1 });
  }
  e.decal('fleurs', 5.5, 8.3); e.decal('fleurs', 16.5, 8.4); e.decal('papiers', 10.5, 8.7, { n: 4 });
  // pins le long de l'allée
  for (const x of [6, 12, 18, 25, 31, 44]) { e.objet('pin', x, 12); e.semer('aiguilles', x - 1, 11, 3, 3, 3); }

  // ---------- Les tombes du milieu (rangées), cyprès ----------
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) if (!(r === 1 && k === 2)) e.objet(k % 3 === 0 ? 'tombe_croix' : 'tombe', 12 + k * 2, 13 + r * 3);
  for (const [x, y] of [[11, 14], [19, 17], [11, 20], [19, 23]]) e.objet('cypres', x, y);
  e.decal('fleurs', 14.5, 14.8); e.decal('fleurs', 16.5, 20.8); e.decal('feuilles', 15, 19, { r: 0.8 });

  // ---------- Le carré ancien (ouest) et l'ossuaire ----------
  const os = e.piece(1, 12, 7, 6, { nom: 'L’ossuaire', sol: 'terre', mur: 'pierre', sombre: 2, toit: 'tuiles', portes: [{ cote: 'e', a: 2 }] });
  e.objet('caisson', os.x0, os.y0); e.objet('caisson', os.x0 + 1, os.y0); e.objet('cercueil', os.x0 + 3, os.y0 + 1);
  e.objet('debris', os.x0 + 2, os.y0 + 3);
  for (let k = 0; k < 4; k++) e.objet('stele', 2 + k * 2, 19 + (k % 2));
  e.objet('olivier', 4, 22);
  e.taches('herbe_seche', 1, 18, 8, 3, 0.4, 1.2);
  e.zombie('errant', 6, 20, { etat: 'erre' });

  // ---------- L'esplanade NRBC ----------
  const ca = e.piece(32, 14, 8, 4, { nom: 'Conteneur frigorifique A', sol: 'metal', mur: 'tole', sombre: 2, toit: 'tole',
    portes: [{ cote: 'o', a: 0, verrou: { forcer: 'pied_de_biche' }, marqueur: 'conteneur_frigo', nom: 'la porte du conteneur A', style: 'metal' }] });
  e.zombie('errant', ca.x0 + 2, ca.y0, { etat: 'cogne' }); e.zombie('errant', ca.x0 + 4, ca.y0 + 1, { etat: 'cogne' });
  e.objet('housse', ca.x0 + 3, ca.y0 + 1, { rot: 1, w: 1, h: 1 });
  e.decal('trainee_sang', 30, 15.6, { l: 2, a: 0 });
  e.objet('conteneur', 32, 20, { nom: 'le conteneur B', conteneur: false });
  e.objet('generateur', 40, 18, { conteneur: { nom: 'le groupe électrogène', items: [{ id: 'essence', qty: 1 }], table: null } });
  e.objet('tente', 25, 14, { conteneur: { nom: 'la tente NRBC effondrée', items: [{ id: 'bandage', qty: 2 }, { id: 'desinfectant', qty: 1 }], table: 'defaut.caisse' } });
  for (let k = 0; k < 6; k++) e.objet('housse', 25 + k, 18, { rot: 0, w: 1, h: 1 });
  e.zombie('rampant', 28, 19, { etat: 'fait_le_mort', dir: 1.5 });
  e.objet('brasero', 29, 16);
  e.objet('camion_mil', 24, 21, { w: 5, h: 2 });
  e.objet('sacs_sable', 38, 22, { w: 3, h: 1 }); e.objet('barriere', 42, 21, { rot: 1, w: 1, h: 2 });
  e.objet('lavabo', 43, 14, { nom: 'le robinet', marqueur: 'robinet_fleurs', conteneur: false });
  e.semer('papiers', 26, 13, 12, 9, 6, { n: 3 });
  e.decal('flaque', 42.8, 15.2, { r: 0.5 });
  e.zombie('errant', 38, 20, { etat: 'erre' });

  // ---------- La loge du gardien (sud-ouest) ----------
  const lo = e.batiment(2, 22, 8, 7, { nom: 'Loge du gardien', sol: 'lino', toit: 'tuiles', sombre: 1,
    portes: [{ cote: 'e', a: 1 }], fenetres: [{ cote: 'n', a: 2, l: 2 }, { cote: 'e', a: 3 }] });
  e.objet('bureau', lo.x0 + 2, lo.y0, { nom: 'le bureau du gardien', marqueur: 'loge_gardien', conteneur: false, w: 2, h: 1 });
  e.objet('chaise', lo.x0 + 2, lo.y0 + 1); e.zombie('errant', lo.x0 + 2, lo.y0 + 1, { etat: 'dort', dir: -1.57 });
  e.objet('lit_simple', lo.x0, lo.y0 + 3, { w: 1, h: 2 });
  e.objet('armoire', lo.x0, lo.y0, { w: 1, h: 2, rot: 1 });
  e.objet('cuisine', lo.x0 + 3, lo.y1, { w: 3, h: 1 });
  e.document('doc_cimetiere_manieres', lo.x0 + 4, lo.y0 + 2);
  e.lumiere('lanterne', lo.x0 + 4.5, lo.y0 + 0.6, { r: 4, i: 0.6 });
  e.decal('papiers', lo.x0 + 3.2, lo.y0 + 0.8, { n: 3 });

  // ---------- La remise (une pelle : de quoi se défendre) ----------
  const re = e.piece(11, 25, 6, 4, { nom: 'La remise', sol: 'beton', mur: 'bois', sombre: 1, toit: 'tole', portes: [{ cote: 'n', a: 1 }] });
  e.objet('etabli_meuble', re.x0 + 1, re.y1, { w: 3, h: 1, nom: 'l’établi', marqueur: 'remise_etabli', conteneur: { nom: 'l’établi', items: [{ id: 'pelle', qty: 1 }], table: 'cimetiere.etagere' } });
  e.objet('poubelle', re.x1, re.y0);
  e.objet('fut', re.x0, re.y1);

  // ---------- La placette et le boulevard ----------
  e.objet('banc_pierre', 17, 26, { w: 2, h: 1 }); e.objet('banc_pierre', 25, 26, { w: 2, h: 1 });
  e.objet('fontaine', 27, 27, { w: 1, h: 1 });
  e.decal('feuilles', 20, 27, { r: 0.9 }); e.decal('feuilles', 24.5, 25.5, { r: 0.7 });
  for (const x of [3, 11, 33, 41]) e.objet('platane', x, 31);
  e.objet('lampadaire', 19, 30); e.lumiere('lampadaire', 19.5, 30.5, { r: 6.5 });
  e.objet('lampadaire', 26, 30);
  e.objet('voiture', 6, 31, { w: 3, h: 2, couleur: '#3a3a3a' });
  e.objet('voiture', 29, 31, { w: 3, h: 2 });
  e.objet('ambulance', 36, 31, { w: 4, h: 2 }); e.lumiere('gyro_bleu', 38, 32, { r: 5 });
  e.decal('marquage', 15, 32.5, { a: 0, r: 0.8 }); e.decal('marquage', 23, 32.5, { a: 0, r: 0.8 });
  e.semer('feuilles', 0, 30, W, 4, 10);
  e.entree('defaut', 22, 31);
  e.sortie(0, 31, 1, 3); e.sortie(W - 1, 31, 1, 3);
});
