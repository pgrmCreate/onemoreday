// Miramas-le-Vieux — LE REFUGE (actes I et III, docs/HISTOIRE.md §6). Format à couches (js/carte/plan.js), version 2.
// En une phrase : un village fortifié sur son rocher, au-dessus de l'étang de Berre, où quatorze survivants tiennent derrière
// le rempart ; on y arrive à la porte Notre-Dame, on y passe la quarantaine, on y fait ses corvées, on y monte la garde, et
// une nuit, il tombe.
// Organisation (64 × 50 de rempart, tout se voit d'un coup d'œil, rien à plus de 30 unités d'une chose à faire) :
//   ouest   la terrasse devant la porte Notre-Dame (arrivée), le chemin qui descend vers la plaine (sortie ouest) ;
//   la tour-porte : le passage voûté, la cellule de quarantaine (au nord), le poste de garde (au sud) ;
//   centre  la place : le puits (corvée d'eau), le camion de Rudy, le platane et son banc (Fernand), le tableau des règles ;
//   nord    l'église Notre-Dame-de-Beauvezer (le dortoir des familles, sœur Agnès), le clocher ; la salle commune (cuisine,
//           le four à pain de Karine, Malik) ; au nord-est, LA BRÈCHE du rempart (Rudy, la garde de nuit) ;
//   sud     l'infirmerie (Bastien, Noa), la maison de la radio (Inès) ; la poterne dans le rempart sud (la fuite) ;
//   est     le donjon d'Hélène (sa table, son lit, la caisse sous la couverture : la radio des gendarmes) ;
//   sud-est LE BAS DU VILLAGE : trois maisons abandonnées derrière une barrière, des planches, deux ou trois morts.
// États (drapeaux) : VIVANT (avant `siege_commence`) — figurants, lumières, refuge habité (aucun mort dans les pièces sûres) ;
//   SIÈGE (`siege_commence`, avant `refuge_tombe`) — les défenseurs à leurs postes, des morts au pied du rempart ;
//   TOMBÉ (`refuge_tombe`) — les morts sont dedans, partout. La porte Notre-Dame reste barrée jusqu'à la fuite (on part par
//   la poterne) ; après (`refuge_fui`), le village mort se visite.
// Check-list RETOURS_JOUEUR §3 : toutes les pièces nommées ; portes à 2 unités libres ; la brèche est une ouverture qu'on
//   barricade soi-même (planches, clous, marteau) ou que la scène de Rudy fait fermer ; la clé de la cellule = Hélène
//   (porte à drapeau qui dit pourquoi) ; WC dans la salle commune, l'infirmerie, le donjon, le poste de garde (seau) et les
//   maisons ; l'église et la tour-porte sans sanitaires (déclarées).
import { plan } from '../../carte/plan.js';

// Des toilettes dans le coin sud-est d'une pièce r (intérieur 2 × 2, porte dans la cloison ouest, WC au fond) — P15.
function cabinet(e, r, nom) {
  const x = r.x1 - 2, y = r.y1 - 2;
  e.cloison('platre', x, y, r.x1, y);
  e.cloison('platre', x, y + 1, x, r.y1);
  e.porte(x, r.y1, { nom: 'la porte des toilettes' });
  e.objet('wc', r.x1, r.y1 - 1);
  e.nommer(r.x1 - 1, r.y1, nom, { sol: 'carrelage', sombre: 2, sansMorts: true });
}

const W = 80, H = 60;
const VIVANT = { pasFlag: 'siege_commence' };
const SIEGE = { flag: 'siege_commence', pasFlag: 'refuge_tombe' };
const TOMBE = { flag: 'refuge_tombe' };
// silhouettes des survivants (couleurs, coiffures)
const S = {
  helene: { manteau: '#5a5048', pantalon: '#2c2a28', cheveux: '#b8b4ac', coiffure: 'court' },
  fernand: { manteau: '#6a5a40', pantalon: '#3a3428', cheveux: '#d8d4cc', coiffure: 'court' },
  ines: { manteau: '#3a4a6a', pantalon: '#22262c', cheveux: '#1a1410', coiffure: 'long' },
  bastien: { manteau: '#7a8a92', pantalon: '#2a3038', cheveux: '#5a4028', coiffure: 'court' },
  karine: { manteau: '#8a6a5a', pantalon: '#2c2824', cheveux: '#3a2418', coiffure: 'long' },
  rudy: { manteau: '#3a3a36', pantalon: '#2a2c30', cheveux: '#2a2420', coiffure: 'court' },
  vieux: { manteau: '#6a6258', pantalon: '#3a3632', cheveux: '#e0dcd4', coiffure: 'court' },
  vieille: { manteau: '#7a5a6a', pantalon: '#3a3036', cheveux: '#d8d2ca', coiffure: 'long' },
  jeune: { manteau: '#5a6a3a', pantalon: '#2a2c26', cheveux: '#2a1c12', coiffure: 'court' },
  enfant: { manteau: '#b8a040', pantalon: '#2a3a5a', cheveux: '#6a4a2a', coiffure: 'court' },
  soeur: { manteau: '#2a2e3a', pantalon: '#2a2e3a', cheveux: '#e8e8e8', coiffure: 'long' },
};

export default plan({
  id: 'miramas_le_vieux', nom: 'Miramas-le-Vieux — le Refuge', exterieur: true, version: 2, typeButin: 'village',
  refuge: VIVANT,                       // refuge habité tant que le siège n'a pas commencé : aucun mort dans les pièces sûres
  sansSanitaires: ['Notre-Dame-de-Beauvezer', 'Le clocher', 'Le passage de la porte', 'La cellule de quarantaine', 'La remise'],   // l'église, le clocher, le passage voûté ; la cellule a un seau ; la remise
  pool: ['errant', 'errant', 'rampant'], morts: { n: [0, 0] }, mortsDehorsSeulement: true,
}, (p) => {
  const e = p.etage('rdc', 'Le village fortifié', W, H, { sol: 'herbe_seche' });

  // ═══════════ Le rocher, dehors : la terrasse, le chemin, les pentes ═══════════
  e.taches('cailloux', 0, 0, W, H, 0.12, 1.6);
  e.taches('herbe_jaunie', 0, 0, W, H, 0.15, 2);
  e.solRect('terre_battue', 1, 24, 9, 9);                                  // la terrasse devant la porte
  e.chemin('terre', [[0, 28], [8, 28]], 3);                                // le chemin qui descend vers la plaine (ouest)
  e.chemin('terre', [[33, 55], [33, 59]], 2);                              // le sentier de la falaise, sous la poterne (sud)
  for (const [x, y] of [[2, 18], [4, 40], [1, 46], [6, 12], [3, 52], [76, 10], [77, 30], [76, 50], [20, 57], [56, 58], [44, 1], [24, 1]]) e.objet('olivier', x, y);
  for (const [x, y] of [[0, 6], [5, 2], [74, 3], [78, 22], [71, 57], [12, 58]]) e.objet('pin', x, y);
  e.semer('aiguilles', 0, 0, 10, 20, 8); e.semer('feuilles', 0, 34, 10, 20, 6);
  e.entree('porte', 5, 28); e.entree('defaut', 5, 28);
  e.sortie(0, 26, 1, 5);                                                   // vers Miramas et la plaine (ouest)
  e.sortie(31, 59, 4, 1);                                                  // le sentier qui descend vers Saint-Chamas (sud)
  e.sortie(60, 0, 4, 1);                                                   // le pied du rocher, sous la brèche (nord) : aucune route

  // ═══════════ Le rempart (x 9..73, y 4..55) ═══════════
  e.contour('pierre', 9, 4, 65, 52);

  // ═══════════ La tour-porte : le passage, la cellule, le poste de garde ═══════════
  e.murRect('pierre', 9, 21, 9, 15);
  const pass = e.piece(9, 26, 9, 5, { nom: 'Le passage de la porte', sol: 'paves_vieux', mur: 'pierre', sombre: 1, sansMorts: true,
    ouvertures: [{ cote: 'e', a: 0, l: 3 }] });
  e.porte(9, 28, { nom: 'la porte Notre-Dame', style: 'bois', exterieure: true,
    verrou: { flag: 'refuge_fui' },
    message: 'La porte Notre-Dame est barrée de l’intérieur. Personne ne sort sans l’accord d’Hélène, et personne n’entre sans montrer ses bras.' });
  e.objet('palette', pass.x0, pass.y0, { nom: 'les palettes du barrage' }); e.objet('palette', pass.x0, pass.y1, { nom: 'les palettes du barrage' });
  const cel = e.piece(10, 21, 7, 6, { nom: 'La cellule de quarantaine', sol: 'dalles', mur: 'pierre', sombre: 2, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 's', a: 2, nom: 'la porte de la cellule', verrou: { flag: 'quarantaine_faite' },
      message: 'Fermée de l’extérieur. C’est la quarantaine : Hélène t’ouvrira demain matin, si tu n’as pas de fièvre.' }] });
  e.objet('matelas', cel.x0, cel.y0, { w: 2, h: 1, nom: 'le matelas de la cellule' });
  e.objet('wc', cel.x1, cel.y0, { nom: 'le seau' });
  e.objet('fut', cel.x1, cel.y1, { nom: 'la cruche d’eau', eau: true, conteneur: false });
  e.decal('bougies', cel.x0 + 2.5, cel.y1 + 0.4); e.lumiere('bougie', cel.x0 + 2.5, cel.y1 + 0.4, { r: 3, i: 0.5 });
  e.entree('quarantaine', cel.x0 + 2, cel.y0 + 2);
  const gar = e.piece(10, 30, 7, 6, { nom: 'Le poste de garde', sol: 'dalles', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'n', a: 2, nom: 'la porte du poste de garde' }] });
  e.objet('table', gar.x0 + 1, gar.y0 + 2, { w: 2, h: 1 }); e.objet('chaise', gar.x0, gar.y0 + 2);
  e.objet('lit_camp', gar.x1, gar.y0, { w: 1, h: 2 });
  e.objet('wc', gar.x1, gar.y1, { nom: 'le seau du poste' });
  e.lumiere('lanterne', gar.x0 + 2, gar.y0 + 2, { r: 4, i: 0.6 });

  // ═══════════ La place ═══════════
  e.solRect('paves_vieux', 17, 17, 34, 21);
  e.nommer(30, 28, 'La place de l’église', { sol: 'paves_vieux', exterieur: true, sansMorts: true });
  e.objet('fontaine', 33, 26, { w: 2, h: 2, nom: 'le puits', marqueur: 'puits', conteneur: false, eau: true });
  e.objet('treteau', 30, 25, { w: 2, h: 1, nom: 'les seaux du puits' });
  e.objet('camionnette', 20, 33, { w: 4, h: 2, nom: 'le camion de Rudy', conteneur: false, couleur: '#4a5040' });
  e.objet('platane', 43, 21); e.objet('banc', 42, 23, { w: 2, h: 1, nom: 'le banc sous le platane' });
  e.objet('plan_mural', 26, 17, { nom: 'le tableau des règles' });
  e.document('doc_regles_refuge', 26, 18);
  e.objet('table', 37, 30, { w: 3, h: 1, nom: 'la grande table' }); e.rangee('chaise', 37, 31, 3, 1, 0);
  e.objet('brasero', 40, 33, { nom: 'le brasero' });
  for (const x of [22, 23, 24]) e.objet('barriere', x, 27, { w: 1, h: 1, nom: 'le linge qui sèche', conteneur: false });
  e.semer('feuilles', 40, 18, 8, 6, 6); e.semer('papiers', 18, 18, 30, 18, 3);
  e.entree('place', 30, 30);
  // la nuit, un feu sur la place tant que le Refuge vit
  e.lumiere('feu', 40.5, 33.5, { r: 7, i: 0.8, si: { pasFlag: 'refuge_tombe' } });
  // la nuit de la chute : le camion de Rudy a renversé le brasero, des toits brûlent près de la porte
  e.lumiere('feu', 18, 24, { r: 8, i: 0.9, si: TOMBE }); e.lumiere('feu', 21, 35, { r: 6, i: 0.8, si: TOMBE }); e.lumiere('feu', 47, 12, { r: 7, i: 0.8, si: TOMBE });

  // ═══════════ L'église Notre-Dame-de-Beauvezer (le dortoir des familles) et le clocher ═══════════
  const egl = e.piece(17, 4, 20, 13, { nom: 'Notre-Dame-de-Beauvezer', sol: 'dalles_calcaire', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 's', a: 9, nom: 'le portail de l’église' }], fenetres: [{ cote: 's', a: 3 }, { cote: 's', a: 15 }] });
  e.objet('autel', egl.x1 - 1, egl.y0 + 4, { w: 1, h: 3 });
  e.rangee('banc', egl.x0 + 5, egl.y0 + 1, 4, 3, 0, { w: 2, h: 1 });
  for (let k = 0; k < 4; k++) e.objet('matelas', egl.x0 + 5 + k * 3, egl.y0 + 4, { w: 2, h: 1, nom: 'un matelas' });
  for (let k = 0; k < 3; k++) e.objet('matelas', egl.x0 + 5 + k * 3, egl.y0 + 7, { w: 2, h: 1, nom: 'un matelas' });
  e.objet('caisse', egl.x0 + 5, egl.y1, { nom: 'les affaires des familles' }); e.objet('caisse', egl.x0 + 7, egl.y1, { nom: 'les affaires des familles' });
  e.decal('bougies', egl.x1 - 0.5, egl.y0 + 3.4); e.decal('bougies', egl.x1 - 0.5, egl.y0 + 7.6);
  e.lumiere('bougie', egl.x1 - 0.6, egl.y0 + 5.5, { r: 5, i: 0.6 });
  // le clocher, dans l'angle ouest de l'église : la corde de la cloche
  e.cloison('pierre', egl.x0 + 3, egl.y0, egl.x0 + 3, egl.y0 + 4);
  e.cloison('pierre', egl.x0, egl.y0 + 4, egl.x0 + 2, egl.y0 + 4);
  e.porte(egl.x0 + 3, egl.y0 + 2, { nom: 'la porte du clocher' });
  e.nommer(egl.x0, egl.y0, 'Le clocher', { sol: 'dalles', sombre: 2, sansMorts: true });
  e.objet('cloche', egl.x0, egl.y0, { w: 2, h: 2, nom: 'la corde de la cloche' });

  // ═══════════ La salle commune (cuisine, le four à pain) ═══════════
  const sc = e.piece(39, 5, 16, 12, { nom: 'La salle commune', sol: 'tomettes', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 's', a: 4, nom: 'la porte de la salle commune' }], fenetres: [{ cote: 's', a: 9, l: 2 }] });
  e.objet('cheminee', sc.x0 + 1, sc.y0, { w: 2, h: 1, nom: 'le four à pain' }); e.lumiere('feu', sc.x0 + 2, sc.y0 + 1, { r: 5, i: 0.7 });
  e.objet('cuisine', sc.x0 + 4, sc.y0, { w: 3, h: 1, nom: 'le plan de travail' });
  e.objet('frigo', sc.x0 + 7, sc.y0, { nom: 'le garde-manger' });
  e.objet('etagere', sc.x0 + 8, sc.y0, { w: 2, h: 1, nom: 'les réserves du Refuge', conteneur: false });
  e.objet('table', sc.x0 + 3, sc.y0 + 4, { w: 4, h: 1, nom: 'la table commune' }); e.rangee('chaise', sc.x0 + 3, sc.y0 + 5, 4, 1, 0);
  e.objet('lavabo', sc.x0, sc.y1, { nom: 'l’évier' });
  cabinet(e, sc, 'Les toilettes de la salle commune');
  e.lumiere('lanterne', sc.x0 + 5, sc.y0 + 4, { r: 5, i: 0.6 });

  // ═══════════ La brèche (rempart nord-est) ═══════════
  // une ouverture dans le rempart : on la barricade soi-même (planches, clous, marteau), ou avec Rudy (scène ref_breche)
  e.murRect('muret', 55, 5, 1, 8); e.murRect('muret', 55, 12, 18, 1);
  e.porte(63, 12, { nom: 'la barrière de la brèche', style: 'bois', etat: 'ouverte' });
  e.nommer(60, 9, 'La cour de la brèche', { sol: 'terre', exterieur: true });
  e.solRect('debris', 58, 5, 6, 3);
  e.porte(61, 4, { nom: 'la brèche', style: 'bois', etat: 'ouverte', barricadeSi: { flag: 'breche_fermee' }, flagBarricade: 'breche_fermee' });
  e.porte(62, 4, { nom: 'la brèche', style: 'bois', etat: 'ouverte', barricadeSi: { flag: 'breche_fermee' }, flagBarricade: 'breche_fermee' });
  e.objet('gravats', 59, 5, { w: 2, h: 1, nom: 'les pierres tombées du rempart' }); e.objet('gravats', 64, 5, { w: 2, h: 1, nom: 'les pierres tombées du rempart' });
  // Rudy, assis sur les pierres tombées : avant que la brèche soit fermée, lui parler, c'est parler de la brèche
  e.pnj('rudy_breche', 64, 8, { marqueur: 'rudy_breche' });
  e.pnj('rudy', 64, 8, { marqueur: 'rudy' });
  e.lumiere('lanterne', 60, 8, { r: 4, i: 0.5 });
  e.entree('poste_breche', 60, 9);                                         // le siège : ton poste, au-dessus de la brèche
  // dehors, tout autour du rempart : la terrasse, les pentes, le pied du rempart (d'où montent les morts la nuit)
  e.nommer(5, 28, 'Au pied du rempart', { sol: 'terre_battue', exterieur: true });

  // ═══════════ L'infirmerie (Bastien, Noa) ═══════════
  const inf = e.piece(18, 40, 13, 10, { nom: 'L’infirmerie', sol: 'carrelage', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'n', a: 5, nom: 'la porte de l’infirmerie', marqueur: 'infirmerie' }], fenetres: [{ cote: 'n', a: 1, l: 2 }] });
  e.objet('lit_simple', inf.x0, inf.y0 + 2, { w: 1, h: 2, nom: 'le lit de Noa' });
  e.objet('lit_simple', inf.x0 + 3, inf.y0 + 2, { w: 1, h: 2 });
  e.objet('armoire', inf.x1, inf.y0, { w: 1, h: 2, nom: 'l’armoire à pharmacie', conteneur: { nom: 'l’armoire à pharmacie', items: [{ id: 'bandage', qty: 2 }, { id: 'desinfectant', qty: 1 }], table: null } });
  e.objet('table', inf.x0 + 6, inf.y0 + 3, { w: 2, h: 1, nom: 'la table de soins' });
  e.objet('lavabo', inf.x1 - 4, inf.y1);
  cabinet(e, inf, 'Les toilettes de l’infirmerie');
  e.lumiere('lanterne', inf.x0 + 4, inf.y0 + 1, { r: 4, i: 0.55 });
  e.pnj('bastien', inf.x0 + 2, inf.y0 + 4, { marqueur: 'bastien' });
  e.pnj('ref_noa', inf.x0 + 1, inf.y0 + 3, { nom: 'Noa', style: S.enfant, dir: Math.PI, si: { pasFlag: ['siege_commence', 'familles_parties'] },
    repliques: ['(Assise au bord de son lit, elle tousse longtemps, puis elle te regarde.) C’est toi qui viens d’arriver ?', '(Elle a les joues rouges et le souffle qui siffle.) Maman dit que ça va passer.'] });

  // ═══════════ La maison de la radio (Inès) ═══════════
  const rad = e.piece(33, 40, 10, 8, { nom: 'La maison de la radio', sol: 'tomettes', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'n', a: 3, nom: 'la porte de la radio' }], fenetres: [{ cote: 'n', a: 6 }] });
  e.objet('bureau', rad.x0, rad.y0, { w: 3, h: 1, nom: 'le poste radio d’Inès', conteneur: false });
  e.objet('chaise', rad.x0 + 1, rad.y0 + 1); e.objet('lit_camp', rad.x1, rad.y0, { w: 1, h: 2 });
  e.objet('etagere', rad.x0, rad.y1, { w: 2, h: 1, nom: 'les piles et les fils', conteneur: { nom: 'l’étagère de la radio', items: [{ id: 'piles', qty: 2 }], table: null } });
  cabinet(e, rad, 'Les toilettes de la radio');
  e.objet('cuisine', rad.x0 + 2, rad.y1, { w: 2, h: 1, nom: 'le réchaud' }); e.objet('lavabo', rad.x0, rad.y1 - 1);
  e.lumiere('lanterne', rad.x0 + 3, rad.y0 + 1, { r: 3.5, i: 0.5 });
  e.pnj('ines', rad.x0 + 2, rad.y0 + 1, { marqueur: 'ines' });

  // ═══════════ Le donjon (Hélène) ═══════════
  const don = e.piece(56, 18, 15, 13, { nom: 'Le donjon', sol: 'dalles', mur: 'pierre', sombre: 1, sansMorts: true, toit: 'tuiles',
    portes: [{ cote: 'o', a: 6, nom: 'la porte du donjon' }], fenetres: [{ cote: 'e', a: 5 }] });
  e.objet('table', don.x0 + 4, don.y0 + 4, { w: 3, h: 1, nom: 'la table d’Hélène' }); e.objet('chaise', don.x0 + 5, don.y0 + 5);
  e.objet('lit_camp', don.x1, don.y0, { w: 1, h: 2 });
  e.objet('armoire', don.x0, don.y0, { w: 1, h: 2, nom: 'l’armoire d’Hélène' });
  e.objet('caisse', don.x1, don.y0 + 4, { nom: 'une caisse sous une couverture', marqueur: 'radio_helene', conteneur: false });
  e.objet('classeur', don.x0, don.y1 - 3, { nom: 'les cahiers d’Hélène', conteneur: false });
  e.objet('lavabo', don.x1 - 4, don.y1);
  cabinet(e, don, 'Le cabinet de toilette du donjon');
  e.lumiere('lanterne', don.x0 + 5, don.y0 + 4, { r: 4.5, i: 0.6 });
  e.pnj('helene', don.x0 + 6, don.y0 + 3, { marqueur: 'helene' });

  // ═══════════ Le bas du village (abandonné : planches, morts) ═══════════
  // une barrière de bois sépare la place du bas du village ; derrière, trois maisons qu'on n'a pas encore vidées
  e.murRect('muret', 45, 38, 28, 1); e.murRect('muret', 45, 38, 1, 17);
  e.porte(52, 38, { nom: 'la barrière du bas du village', style: 'bois', message: null });
  e.nommer(46, 39, 'Le bas du village', { sol: 'paves_vieux', exterieur: true });
  const m1 = e.batiment(47, 42, 11, 8, { nom: 'La maison du bas — la cuisine', sol: 'tomettes', sombre: 2, portes: [{ cote: 'n', a: 3 }], fenetres: [{ cote: 'n', a: 7 }] });
  e.objet('cuisine', m1.x0, m1.y1, { w: 3, h: 1 }); e.objet('table', m1.x0 + 3, m1.y0 + 2, { w: 2, h: 1 });
  e.objet('etagere', m1.x1 - 1, m1.y0, { w: 2, h: 1, nom: 'l’étagère branlante' });
  e.objetSol('planche', m1.x0 + 1, m1.y0 + 1, 2);
  cabinet(e, m1, 'Les toilettes de la maison du bas');
  e.zombie('errant', m1.x0 + 5, m1.y0 + 4, { etat: 'dort', dir: 1 });
  const m2 = e.batiment(59, 41, 13, 9, { nom: 'La maison du forgeron', sol: 'beton', sombre: 2, portes: [{ cote: 'n', a: 2 }], fenetres: [{ cote: 'n', a: 8, l: 2 }] });
  e.objet('etabli_meuble', m2.x0, m2.y1, { w: 3, h: 1, nom: 'l’établi', conteneur: { nom: 'l’établi', items: [{ id: 'clous', qty: 8 }], table: 'village.etagere' } });
  e.objet('etagere', m2.x0 + 4, m2.y1, { w: 2, h: 1 }); e.objet('armoire', m2.x1, m2.y0, { w: 1, h: 2 });
  e.objet('lit_simple', m2.x1, m2.y0 + 2, { w: 1, h: 2 });
  e.objetSol('planche', m2.x0 + 6, m2.y0 + 2, 2);
  cabinet(e, m2, 'Les toilettes du forgeron');
  e.objet('cuisine', m2.x0, m2.y0 + 3, { w: 1, h: 2 }); e.objet('lavabo', m2.x0, m2.y0 + 2);
  e.zombie('errant', m2.x0 + 3, m2.y0 + 3, { etat: 'erre' });
  e.zombie('rampant', m2.x0 + 8, m2.y0 + 5, { etat: 'fait_le_mort' });
  const re = e.piece(66, 51, 7, 5, { nom: 'La remise', sol: 'terre', mur: 'bois', sombre: 1, toit: 'tole', portes: [{ cote: 'n', a: 2 }] });
  e.objetSol('planche', re.x0 + 1, re.y0 + 1, 2); e.objet('fut', re.x1, re.y0); e.objet('caisse', re.x0, re.y1);
  e.semer('papiers', 47, 39, 25, 3, 4); e.semer('verre', 50, 40, 8, 2, 3);

  // ═══════════ La poterne (rempart sud) ═══════════
  e.porte(33, 55, { nom: 'la poterne', style: 'bois', exterieure: true, marqueur: 'poterne',
    verrou: { flag: 'refuge_tombe' },
    message: 'La poterne est fermée à clé, et c’est Hélène qui a la clé. On ne sort par là qu’en cas de malheur.' });

  // ═══════════ Les gens du Refuge (figurants), tant qu'il vit ═══════════
  e.pnj('fernand', 42, 24, { marqueur: 'fernand' });
  e.pnj('karine', sc.x0 + 3, sc.y0 + 2, { marqueur: 'karine' });
  e.pnj('ref_yohan', pass.x0 + 3, pass.y0 + 1, { nom: 'Yohan', style: S.jeune, dir: Math.PI, si: VIVANT,
    repliques: ['L’autre soir, j’ai gardé ma lampe braquée sur toi pendant cinq minutes. Ne le prends pas mal.', 'La nuit, on tourne sur le rempart : deux heures chacun.'] });
  e.pnj('ref_malik', sc.x0 + 7, sc.y0 + 3, { nom: 'Malik', style: S.vieux, dir: Math.PI / 2, si: VIVANT,
    repliques: ['Pois chiches, riz, et ce que Fernand ramène des collines. Ne te plains pas du menu.', 'Avant, j’avais un restaurant à Istres. Trente couverts le midi.'] });
  e.pnj('ref_celine', 31, 28, { nom: 'Céline', style: S.karine, dir: -Math.PI / 2, si: VIVANT,
    repliques: ['Vingt seaux par jour, et on fait bouillir. Toujours.', 'Théo, lâche ce bâton, tu vas te crever un œil !'] });
  e.pnj('ref_theo', 28, 30, { nom: 'Théo', style: S.enfant, dir: 0, si: VIVANT, repliques: ['Tu as tué combien de morts, toi ?', 'Rudy m’a promis de m’apprendre à conduire le camion.'] });
  e.pnj('ref_paul', egl.x0 + 9, egl.y0 + 4, { nom: 'Paul', style: S.vieux, dir: Math.PI / 2, si: VIVANT, repliques: ['Belote ? Non ? Tant pis.', 'Je suis né dans cette rue. Je mourrai dans cette rue, mais pas tout de suite.'] });
  e.pnj('ref_josette', egl.x0 + 10, egl.y0 + 5, { nom: 'Josette', style: S.vieille, dir: -Math.PI / 2, si: VIVANT, repliques: ['Je tricote des chaussettes pour l’hiver. L’hiver finira bien par arriver, non ?'] });
  e.pnj('ref_agnes', egl.x1 - 2, egl.y0 + 5, { nom: 'Sœur Agnès', style: S.soeur, dir: Math.PI, si: VIVANT,
    repliques: ['La cloche ne sonne plus, sauf pour l’alarme. Même le dimanche.', 'Je prie pour les vivants. Pour les autres, je ne sais plus quoi dire.'] });

  // ═══════════ Le siège ═══════════
  e.pnj('ref_helene_siege', 14, 33, { nom: 'Hélène', style: S.helene, dir: -Math.PI / 2, si: SIEGE, repliques: ['Tiens ton poste. Je compte sur toi.', 'S’ils passent la porte, c’est fini. Alors ils ne la passent pas.'] });
  e.pnj('ref_yohan_siege', 15, 29, { nom: 'Yohan', style: S.jeune, dir: Math.PI, si: SIEGE, repliques: ['Ça cogne. Ça cogne depuis une heure.'] });
  e.pnj('ref_malik_siege', 58, 9, { nom: 'Malik', style: S.vieux, dir: -Math.PI / 2, si: SIEGE, repliques: ['J’ai une fourche. Je n’ai jamais tué personne avec une fourche.'] });
  e.pnj('ref_fernand_siege', 30, 18, { nom: 'Fernand', style: S.fernand, dir: -Math.PI / 2, si: SIEGE, repliques: ['Fais ce qu’elle dit, petit. Ce soir, elle a raison.'] });
  for (let k = 0; k < 14; k++) e.zombie(k % 5 === 0 ? 'coureur' : 'errant', 1 + (k * 3) % 8, 22 + (k * 5) % 14, { etat: k < 6 ? 'cogne' : 'erre', si: SIEGE, dir: 0 });
  for (let k = 0; k < 8; k++) e.zombie('errant', 55 + (k * 3) % 12, 1 + (k % 3), { etat: 'erre', si: SIEGE, dir: Math.PI / 2 });

  // ═══════════ Tombé : les morts sont dedans ═══════════
  // Par la porte Notre-Dame grande ouverte, ils remplissent le passage et l'ouest de la place ; la cloche de Fernand en
  // attire la plupart devant l'église. Le chemin vers l'infirmerie, le donjon et la poterne reste possible, en courant.
  const TOMBE_MORTS = [
    // le passage et l'ouest de la place (par la porte)
    [12, 28, 'errant', 'chasse'], [14, 27, 'errant', 'erre'], [15, 29, 'coureur', 'chasse'], [19, 26, 'errant', 'erre'], [19, 31, 'errant', 'erre'],
    // devant l'église, attirés par la cloche
    [24, 18, 'errant', 'erre'], [27, 18, 'errant', 'erre'], [29, 17, 'errant', 'erre'], [31, 19, 'enrage', 'erre'], [26, 20, 'errant', 'erre'],
    [33, 18, 'errant', 'erre'], [22, 19, 'errant', 'erre'],
    // dans la place et vers la salle commune
    [36, 26, 'errant', 'erre'], [44, 18, 'coureur', 'chasse'], [47, 25, 'errant', 'erre'],
    // le sud : un ou deux sur le chemin de la poterne et de l'infirmerie
    [29, 38, 'errant', 'erre'], [40, 50, 'errant', 'erre'],
    // vers le donjon
    [52, 22, 'errant', 'erre'],
  ];
  for (const [x, y, t, et] of TOMBE_MORTS) e.zombie(t, x, y, { etat: et, si: TOMBE });
  // (pas de sang peint sur la place : les décors n'ont pas d'état, il se verrait aussi quand le Refuge vit)
});
