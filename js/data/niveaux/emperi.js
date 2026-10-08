// Château de l'Empéri et montée du Puech (CHAPITRE 1) — refait au format à couches d'après docs/RETOURS_JOUEUR.md §4.2.
// Réel : forteresse (Xe-XVIIe s.) sur le rocher du Puech ; cour d'honneur à galerie Renaissance, cour Nord (Jardin des
// Simples), chapelle Sainte-Catherine, musée ; remparts et tour d'angle ; en contrebas la montée du Puech et le lycée.
// En une phrase : un château-musée sur son rocher, tenu par un prof (Vidal) et ses élèves ; un camp VIVANT autour d'un
// feu, dans une cour fermée. On y vient pour la radio ; on y reste parce qu'on y est accueilli.
// Pourquoi ils sont vivants : le rocher, des murs de huit mètres, UNE porte barrée (grille de chantier, palettes), une
// poterne cadenassée, des guetteurs sur le rempart, des règles (l'ardoise). Tout cela se voit.
// Taille : 72 × 50, deux étages seulement. La montée (dehors) au sud ; l'enceinte (60 × 33) au-dessus.
// Boucle : cour → porche → chemin de ronde (Lou) → tour d'angle (radio) → salle des uniformes → salle des armes →
// salle des gardes (Vidal) → cour.
// Peuplement : JAMAIS de mort dans le château avant la chute (siege_fait) ; morts du lieu dans la montée seulement.
import { plan } from '../../carte/plan.js';

const W = 72, H = 50;
const VIVANTS = { pasFlag: 'siege_fait' };                        // le camp, tant que le château tient
const SIEGE = { flag: 'sonnailles_commencees', pasFlag: 'siege_fait' };
const TOMBE = { flag: 'siege_fait' };
// quelques silhouettes d'adolescents et d'adultes (couleurs, coiffures)
const S = {
  sweat_rouge: { manteau: '#7a2a26', pantalon: '#2c3440', cheveux: '#2a1c12', coiffure: 'court' },
  sweat_gris: { manteau: '#5e6066', pantalon: '#24272c', cheveux: '#6b4a2a', coiffure: 'long' },
  parka: { manteau: '#3d4a36', pantalon: '#3a3530', cheveux: '#1a1410', coiffure: 'court' },
  doudoune: { manteau: '#2c3f66', pantalon: '#22262c', cheveux: '#c9a35a', coiffure: 'long' },
  pull: { manteau: '#7a6a4a', pantalon: '#2f2a24', cheveux: '#3a2a1a', coiffure: 'court' },
  adulte: { manteau: '#4a3a30', pantalon: '#2a2622', cheveux: '#7a7068', coiffure: 'court' },
  casque: { manteau: '#5a5a52', pantalon: '#2a2c30', cheveux: '#241a12', coiffure: 'court' },
};

export default plan({
  id: 'emperi', nom: 'Château de l’Empéri', exterieur: true, version: 2, typeButin: 'chateau',
  pool: ['errant', 'errant', 'rampant', 'hurleur'], morts: { n: [0, 2] }, mortsDehorsSeulement: false,
}, (p) => {
  // ======================= REZ-DE-CHAUSSÉE : la montée et le château =======================
  const e = p.etage('rdc', 'Le château', W, H, { sol: 'terre', monte: 'e1' });

  // --- le rocher du Puech autour de l'enceinte ---
  e.murRect('rocher', 0, 0, W, 4); e.murRect('rocher', 0, 0, 6, 24); e.murRect('rocher', 66, 0, 6, 37);
  e.murRect('rocher', 0, 24, 1, 13);
  // --- l'enceinte (60 × 33, x 6..65, y 4..36) : tout ce qui n'est pas une pièce est maçonnerie pleine ---
  e.murRect('pierre', 6, 4, 60, 33);

  // --- la cour d'honneur (24 × 14, dehors) : le cœur du camp ---
  const cour = e.piece(19, 11, 26, 16, { nom: 'La cour d’honneur', sol: 'paves', mur: 'pierre', exterieur: true, sansMorts: true });
  e.objet('feu_camp', 31, 19, { nom: 'le feu de camp' }); e.lumiere('feu', 31.5, 19.5);
  e.objet('fut', 32, 18, { nom: 'la marmite' });
  e.marqueur('vidal', 29, 19);
  e.objet('table', 22, 15, { w: 3, h: 1, nom: 'la table sur tréteaux' }); e.objet('banc', 22, 16, { w: 3, h: 1 });
  e.objet('table', 22, 19, { w: 3, h: 1, nom: 'la table sur tréteaux' }); e.objet('banc', 22, 20, { w: 3, h: 1 });
  for (const x of [22, 26, 30, 34, 38, 42]) e.objet('pilier', x, cour.y0, { nom: 'une colonne de la galerie' });   // la galerie Renaissance
  for (const x of [21, 22, 23]) e.objet('barriere', x, 24, { w: 1, h: 1, nom: 'le linge qui sèche', conteneur: false });
  e.objet('fut', 42, 23, { nom: 'le tonneau d’eau', eau: true }); e.objet('fut', 43, 23, { nom: 'le tonneau d’eau', eau: true });
  e.marqueur('panneau_regles', 36, 25, { nom: 'l’ardoise des règles' });
  e.entree('cour', 31, 22);
  e.semer('cendres', 30, 18, 3, 3, 3); e.semer('papiers', 20, 13, 23, 12, 4);
  // le camp : huit figurants
  e.pnj('emp_feu_1', 33, 20, { nom: 'Inès', style: S.doudoune, dir: Math.PI, si: VIVANTS, repliques: ['On fait tourner le feu toute la nuit. Deux heures chacun.', 'Si tu as des piles, Vidal te dira merci. Il ne le dit jamais.'] });
  e.pnj('emp_feu_2', 30, 21, { nom: 'Théo', style: S.sweat_rouge, dir: -Math.PI / 2, si: VIVANTS, repliques: ['Pois chiches ce soir. Et demain. Et après-demain.', 'Le réchaud ? Plus de gaz depuis lundi.'] });
  e.pnj('emp_feu_3', 33, 18, { nom: 'Sami', style: S.parka, dir: Math.PI * 0.8, si: VIVANTS, repliques: ['Tu viens d’où, toi ? Personne ne monte jusqu’ici.', 'Mon frère est en bas, au lycée. Enfin, il était.'] });
  e.pnj('emp_table_1', 23, 14, { nom: 'Chloé', style: S.sweat_gris, dir: Math.PI / 2, si: VIVANTS, repliques: ['On épluche ce qu’on trouve. Même les orties.', 'Règle numéro trois : on fait bouillir l’eau. Toujours.'] });
  e.pnj('emp_table_2', 25, 18, { nom: 'Yanis', style: S.pull, dir: Math.PI / 2, si: VIVANTS, repliques: ['Le couteau, tu le rends quand tu as fini.', 'Vidal note tout, même les patates.'] });
  e.pnj('emp_lecteur', 40, 22, { nom: 'Mathis', style: S.parka, dir: Math.PI, si: VIVANTS, repliques: ['« Le Comte de Monte-Cristo ». J’en suis au tome deux. On a le temps.', 'Chut. Je lis.'] });
  e.pnj('emp_seau', 37, 14, { nom: 'Léa', style: S.sweat_rouge, dir: -Math.PI / 2, si: VIVANTS, repliques: ['Le puits est dans le jardin, derrière la galerie.', 'Vingt seaux par jour. Je les compte.'] });
  e.pnj('emp_petit', 21, 23, { nom: 'Enzo', style: S.doudoune, dir: 0, si: VIVANTS, repliques: ['Je suis en sixième. Enfin, j’étais.', 'Tu as vu des chiens, dehors ? J’avais un chien.'] });

  // --- le porche (8 × 9) : la porte barrée, Hugo et Mehdi ---
  const po = e.piece(27, 26, 10, 11, { nom: 'Le porche', sol: 'paves', mur: 'pierre', sombre: 1, sansMorts: true });
  e.porte(31, 26, { etat: 'ouverte', nom: 'le passage voûté' }); e.porte(32, 26, { etat: 'ouverte', nom: 'le passage voûté' });
  e.porte(31, 36, { verrou: { flag: 'emp_entree_ok' }, exterieure: true, style: 'grille', nom: 'la porte du château',
    message: 'Une grille de chantier et des palettes. Derrière, deux adolescents armés te regardent. On ne passe pas sans leur accord.' });
  e.escalier('monte', po.x0, po.y0 + 1, 2, 4);
  e.objet('barriere', 33, 35, { w: 2, h: 1, nom: 'la grille de chantier', conteneur: false });
  e.objet('palette', 34, 33, { w: 2, h: 1, nom: 'les palettes', conteneur: false });
  e.marqueur('porte_emperi', 31, 35);
  e.pnj('emp_hugo', 30, 34, { nom: 'Hugo', style: S.casque, dir: Math.PI / 2, si: VIVANTS, repliques: ['On ouvre à qui Vidal dit d’ouvrir.', 'Le sabre ? Il vient du musée. Il coupe encore.'] });
  e.pnj('emp_mehdi', 33, 32, { nom: 'Mehdi', style: S.casque, dir: Math.PI / 2, si: VIVANTS, repliques: ['Pas de morsure ? Montre tes bras.', 'La nuit, on entend la ville. Ça ne s’arrête jamais.'] });

  // --- la cour Nord, Jardin des Simples (26 × 6, dehors) ---
  e.piece(17, 4, 28, 8, { nom: 'Le Jardin des Simples', sol: 'terre', mur: 'pierre', exterieur: true, sansMorts: true });
  e.porte(35, 11, { etat: 'ouverte', nom: 'l’arche de la galerie' }); e.porte(36, 11, { etat: 'ouverte', nom: 'l’arche de la galerie' });
  for (const [x, y] of [[20, 6], [25, 6], [20, 9], [25, 9]]) e.objet('buisson', x, y, { w: 3, h: 1, nom: 'le carré de simples', conteneur: { nom: 'le carré de simples', items: [{ id: 'herbes_simples', qty: 2 }], table: null } });
  e.objet('fontaine', 37, 6, { w: 1, h: 1, nom: 'le puits', eau: true, conteneur: false });
  e.objet('caisson', 38, 6, { nom: 'la pancarte', conteneur: false, message: 'Une pancarte peinte à la main : « FAIRE BOUILLIR. TOUJOURS. »' });
  e.objet('buisson', 41, 8, { w: 3, h: 2, nom: 'le carré de potager', conteneur: false });
  e.pnj('emp_jardin', 30, 8, { nom: 'Rose', style: S.sweat_gris, dir: 0, si: VIVANTS, repliques: ['La sauge, c’est pour les plaies. Le thym, pour la toux.', 'Ne marche pas sur les carrés, s’il te plaît.'] });

  // --- la chapelle Sainte-Catherine : la chambre d'isolement ---
  const ch = e.piece(6, 4, 12, 9, { nom: 'La chapelle Sainte-Catherine', sol: 'dalles', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'e', a: 2, nom: 'la porte de la chapelle' }] });
  e.objet('autel', ch.x0, ch.y0 + 2, { rot: 1, w: 1, h: 3, nom: 'l’autel' });
  e.objet('banc', ch.x0 + 3, ch.y0 + 1, { w: 3, h: 1 }); e.objet('banc', ch.x0 + 3, ch.y0 + 4, { w: 3, h: 1 });
  e.objet('lit_camp', ch.x1, ch.y0, { nom: 'le lit de camp de la chapelle' });
  e.objet('poubelle', ch.x1, ch.y1, { nom: 'le seau' });
  e.decal('bougies', ch.x0 + 0.8, ch.y0 + 1.5); e.decal('bougies', ch.x0 + 0.8, ch.y0 + 5.2);

  // --- le dortoir : douze matelas ---
  const dor = e.piece(6, 12, 14, 10, { nom: 'Le dortoir', sol: 'parquet', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'e', a: 3, nom: 'la porte du dortoir' }] });
  for (let k = 0; k < 6; k++) { e.objet('matelas', dor.x0 + k * 2, dor.y0, { nom: 'un matelas' }); e.objet('matelas', dor.x0 + k * 2, dor.y1 - 1, { nom: 'un matelas' }); }
  e.semer('papiers', dor.x0, dor.y0 + 2, 12, 4, 3);
  e.pnj('emp_dortoir', dor.x0 + 6, dor.y0 + 4, { nom: 'Nora', style: S.pull, dir: Math.PI / 2, si: VIVANTS, repliques: ['Chut. Ceux de la nuit dorment.', 'Si Vidal t’accepte, tu auras un matelas. Le dernier, près de la fenêtre.'] });

  // --- le réfectoire et la salle de classe ---
  const ref = e.piece(6, 21, 14, 8, { nom: 'Le réfectoire', sol: 'tomettes', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'e', a: 2, nom: 'la porte du réfectoire' }, { cote: 'o', a: 3, verrou: { flag: 'emp_entree_ok' }, exterieure: true, nom: 'la poterne', style: 'metal',
      message: 'La poterne est cadenassée de l’intérieur.' }] });
  e.objet('table', ref.x0 + 3, ref.y0 + 2, { w: 6, h: 1, nom: 'la longue table' });
  e.objet('banc', ref.x0 + 3, ref.y0 + 1, { w: 6, h: 1 }); e.objet('banc', ref.x0 + 3, ref.y0 + 3, { w: 6, h: 1 });
  e.objet('cheminee', ref.x0, ref.y0, { nom: 'la cheminée-cuisinière', conteneur: false });
  e.objet('plan_mural', ref.x0 + 6, ref.y0 - 1, { nom: 'le tableau noir', message: 'Le tableau noir. À la craie : « Cours 9 h. Histoire : les sièges de Salon. »' });
  e.objet('caisson', ref.x1, ref.y1, { nom: 'les réserves du groupe', conteneur: false, message: 'Les réserves du groupe. Tout est compté sur l’ardoise : on ne se sert pas.' });
  e.objet('caisson', ref.x1 - 1, ref.y1, { nom: 'les réserves du groupe', conteneur: false, message: 'Les réserves du groupe. Tout est compté sur l’ardoise : on ne se sert pas.' });

  // --- la salle des gardes, le bureau de Vidal ---
  const ga = e.piece(44, 11, 14, 10, { nom: 'La salle des gardes', sol: 'dalles', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'o', a: 3, nom: 'la porte de la salle des gardes' }] });
  e.objet('bureau', ga.x0 + 1, ga.y0, { w: 2, h: 1, nom: 'le bureau de Vidal', marqueur: 'journal_vidal', conteneur: false });
  e.objet('lit_camp', ga.x0, ga.y1 - 1, { nom: 'le lit de camp de Vidal' });
  e.objet('armoire', ga.x0 + 4, ga.y1, { w: 2, h: 1 });
  e.objet('plan_mural', ga.x0 + 4, ga.y0 - 1, { nom: 'la carte du quartier', message: 'Une carte du quartier, épinglée. Des croix rouges sur le lycée, la mairie, la place Crousillat. Une croix verte sur le château.' });
  e.escalier('monte', ga.x1 - 1, ga.y0, 2, 4);
  e.lumiere('lanterne', ga.x0 + 2.5, ga.y0 + 1.2, { r: 4.5, i: 0.7 });
  e.pnj('emp_inventaire', ga.x0 + 6, ga.y0 + 4, { nom: 'M. Ferrand', style: S.adulte, dir: Math.PI, si: VIVANTS, repliques: ['Quarante-deux conserves. Trente et une bouteilles. Je recompte demain.', 'J’étais intendant au lycée. Je le suis toujours, en somme.'] });

  // --- l'infirmerie ---
  const inf = e.piece(44, 4, 10, 8, { nom: 'L’infirmerie', sol: 'carrelage', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'o', a: 2, nom: 'la porte de l’infirmerie' }] });
  e.objet('lit_simple', inf.x0 + 2, inf.y0, { nom: 'le lit de Mme Aubert (elle ne se lève plus)' });
  e.objet('lit_simple', inf.x0 + 5, inf.y0, { nom: 'le lit de M. Roux (il ne se lève plus)' });
  e.objet('table', inf.x0 + 2, inf.y1, { w: 2, h: 1, nom: 'la table aux boîtes vides', conteneur: false, message: 'Des boîtes de médicaments, toutes vides. Quelqu’un a écrit sur l’une d’elles : « garder pour la fin ».' });
  e.pnj('emp_infirmiere', inf.x0 + 4, inf.y0 + 3, { nom: 'Jade', style: S.sweat_gris, dir: -Math.PI / 2, si: VIVANTS, repliques: ['Ils ont de la fièvre depuis trois jours. Il faudrait des antibiotiques.', 'Si tu trouves de l’amoxicilline, c’est ici qu’il faut l’apporter.'] });

  // --- la montée du Puech (dehors, au sud) ---
  e.solRect('terre', 0, 37, W, 13);
  e.chemin('paves', [[18, 47], [44, 44], [44, 40], [31, 38]], 4);           // la rampe en lacet, jusqu'à la porte
  e.taches('herbe_seche', 0, 37, W, 13, 0.25, 1.6);
  e.solRect('terre', 1, 24, 5, 13);                                          // le sentier de la poterne
  // le lycée de l'Empéri (à l'ouest) : sa cour vide derrière la grille
  e.solRect('bitume', 0, 38, 10, 12);
  e.murRect('grille', 10, 38, 1, 12);
  e.porte(10, 44, { etat: 'ouverte', style: 'grille', nom: 'le portail du lycée' });
  e.objet('barriere', 3, 39, { w: 4, h: 1, nom: 'la banderole « BIENVENUE AUX SECONDES »', conteneur: false });
  e.objet('banc', 4, 44, { w: 2, h: 1, nom: 'le banc renversé' });
  // les ronces au pied du rempart, et le sac rouge
  for (const x of [12, 14, 17, 19, 21, 37, 40, 43]) e.objet('roncier', x, 37);
  e.objet('roncier', 24, 37, { nom: 'le sac rouge dans les ronces', marqueur: 'sac_rouge', conteneur: false });
  for (const x of [15, 33, 52, 60]) e.objet('pin', x, 46);
  e.entree('defaut', 16, 46);
  e.sortie(14, H - 1, 16, 1); e.sortie(W - 1, 40, 1, 7);
  // les morts de la montée
  e.zombie('errant', 12, 41, { etat: 'erre' }); e.zombie('errant', 8, 46, { etat: 'erre' });
  // le siège : la foule contre la porte
  for (let k = 0; k < 22; k++) e.zombie(k % 6 === 0 ? 'hurleur' : 'errant', 22 + (k * 7) % 20, 38 + (k * 3) % 8, { etat: k < 8 ? 'cogne' : 'erre', si: SIEGE });
  // après la chute : quelques morts dans la montée…
  for (const [x, y] of [[20, 42], [36, 44], [50, 41], [58, 46]]) e.zombie('errant', x, y, { etat: 'erre', si: TOMBE });
  // …et dans le château
  for (const [x, y, et] of [[25, 17, 'erre'], [35, 22, 'erre'], [40, 15, 'dort'], [10, 15, 'dort'], [15, 18, 'erre'], [10, 8, 'dort'], [12, 26, 'erre'], [30, 8, 'erre'], [50, 15, 'erre'], [31, 30, 'erre']]) {
    e.zombie('errant', x, y, { etat: et, si: TOMBE });
  }

  // ======================= 1er ÉTAGE : chemin de ronde, tour d'angle, musée =======================
  const e1 = p.etage('e1', 'Le rempart et le musée', W, H, { sol: null, descend: 'rdc' });
  // le palier du porche, puis le chemin de ronde sud et est (dehors), créneaux côté extérieur
  e1.solRect('paves', 27, 27, 6, 7); e1.escalier('descend', 28, 28, 2, 4);
  e1.solRect('paves', 7, 34, 57, 2); e1.murRect('muret', 6, 36, 60, 1); e1.murRect('muret', 6, 33, 1, 3);
  e1.solRect('paves', 62, 12, 2, 22); e1.murRect('muret', 64, 11, 1, 26);
  e1.nommer(40, 34, 'Le chemin de ronde', { sol: 'paves', exterieur: true, sansMorts: true });
  e1.marqueur('lou_rempart', 31, 34);
  for (const x of [12, 24, 40, 52]) e1.lumiere('lanterne', x + 0.5, 34.5, { r: 3.5, i: 0.55 });
  e1.objet('fut', 36, 35, { nom: 'le seau de pierres' }); e1.objet('fut', 18, 35, { nom: 'les bouteilles d’essence' });
  e1.pnj('emp_guet_1', 20, 35, { nom: 'Baptiste', style: S.parka, dir: Math.PI / 2, si: VIVANTS, repliques: ['D’ici, on voit toute la montée. Rien ne passe sans qu’on le voie.', 'L’arbalète, c’est Mehdi qui l’a faite. Elle tire à peu près droit.'] });
  e1.pnj('emp_guet_2', 62, 20, { nom: 'Sarah', style: S.doudoune, dir: 0, si: VIVANTS, repliques: ['Je compte les morts sur l’avenue. Hier, trente. Aujourd’hui, quarante et un.', 'Ne reste pas en haut des créneaux, on te verrait de loin.'] });
  // la tour d'angle (nord-est) : la radio
  const to = e1.piece(57, 4, 8, 8, { nom: 'La tour d’angle', sol: 'planches', mur: 'pierre', sombre: 1, sansMorts: true,
    portes: [{ cote: 's', a: 4 }], fenetres: [{ cote: 'n', a: 2 }, { cote: 'e', a: 2 }] });
  e1.objet('table', to.x0 + 1, to.y0 + 1, { w: 2, h: 1, nom: 'la radio', marqueur: 'radio_emperi', conteneur: false });
  e1.objet('chaise', to.x0 + 1, to.y0 + 2);
  // la salle des armes blanches (au-dessus de la salle des gardes)
  const ar = e1.piece(44, 11, 14, 10, { nom: 'La salle des armes blanches', sol: 'parquet', mur: 'pierre', sombre: 1, sansMorts: true,
    portes: [{ cote: 's', a: 4 }] });
  e1.escalier('descend', ar.x1 - 1, ar.y0, 2, 4);
  e1.objet('etagere', ar.x0 + 1, ar.y0, { w: 3, h: 1, nom: 'la vitrine des sabres', conteneur: { nom: 'la vitrine des sabres', items: [{ id: 'sabre_cavalerie', qty: 1 }], table: 'chateau.etagere' } });
  e1.marqueur('vitrine_sabres', ar.x0 + 2, ar.y0 + 1, { nom: 'le cartel' });
  e1.objet('rayonnage', ar.x0, ar.y1, { w: 4, h: 1, nom: 'le râtelier vide', conteneur: false });
  // la salle des uniformes : porte sur le chemin de ronde est (la boucle se ferme)
  const un = e1.piece(44, 20, 18, 10, { nom: 'La salle des uniformes', sol: 'parquet', mur: 'pierre', sombre: 1, sansMorts: true,
    portes: [{ cote: 'e', a: 3 }] });
  for (const [x, y] of [[un.x0 + 1, un.y0 + 1], [un.x0 + 4, un.y0 + 1], [un.x0 + 7, un.y0 + 1], [un.x0 + 10, un.y0 + 1]]) e1.objet('statue', x, y, { nom: 'un mannequin à moitié déshabillé' });
  e1.objet('caisse', un.x1, un.y1, { nom: 'la caisse du musée' });
  e1.decal('papiers', un.x0 + 6, un.y0 + 5, { n: 3 });
});
