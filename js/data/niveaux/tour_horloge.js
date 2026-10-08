// Tour de l'Horloge (PROLOGUE) — refaite au format à couches d'après docs/RETOURS_JOUEUR.md §4.1.
// Réel : tour-porte 1626-1664 à l'entrée nord de la vieille ville ; porche voûté, corps en retrait, campanile de fer forgé
// et trois cloches ; au nord la place Crousillat et la Fontaine Moussue, au sud la rue de l'Horloge.
// En une phrase : une tour-porte qui sert de refuge à UNE personne, Maud. Une seule porte (la petite porte de chêne du
// porche), barrée de l'intérieur ; dedans, son campement ; en haut, les cloches qu'elle fait sonner.
// Parcours : place (nuit, lune) → la porte de chêne (drapeau pro_signal : Maud l'ouvre ; entrée « porche » juste derrière)
// → escalier à vis (colonne 2 × 4, au même endroit à chaque étage) → salle de l'horloge (mécanisme, campement de Maud)
// → palier des meurtrières (carnet) → terrasse du campanile (Maud).
// Peuplement : JAMAIS de mort dans la tour. Sur la place : 0 à 2 errants à l'arrivée ; la foule (immobile, tournée vers
// la tour) n'apparaît qu'avec pro_signal et se disperse après le prologue (3 à 5 errants).
import { plan } from '../../carte/plan.js';

const W = 48, H = 40;
const SUD = Math.PI / 2;                     // regard vers le sud (vers la tour, depuis la place)
const FOULE = { flag: 'pro_signal', pasFlag: 'prologue_fini' };
const APRES = { flag: 'prologue_fini' };

export default plan({
  id: 'tour_horloge', nom: 'Tour de l’Horloge', exterieur: true, version: 2, typeButin: 'monument',
  pool: ['errant', 'rampant'], morts: { n: [0, 0] }, mortsDehorsSeulement: true,
}, (p) => {
  // ================= REZ-DE-CHAUSSÉE : place, café, tour, rue =================
  const e = p.etage('rdc', 'Rez-de-chaussée', W, H, { sol: 'paves', monte: 'e1' });

  // --- le cadre : façades closes au nord et à l'est, la rue d'arrivée à l'ouest ---
  // une maison close : on n'en voit que le toit (volets fermés, portes murées)
  const close = (et, x, y, w, h) => { et.murRect('crepi', x, y, w, h); et.toit(x, y, w, h, 'tuiles'); };
  for (const [x, w] of [[0, 4], [18, 10], [28, 12]]) close(e, x, 0, w, 7);
  close(e, 40, 0, 8, 10); close(e, 40, 10, 8, 10); close(e, 4, 0, 14, 1);
  close(e, 0, 7, 4, 4); close(e, 0, 16, 4, 4);
  e.solRect('trottoir', 4, 7, 36, 1);
  e.sortie(0, 11, 1, 5);                                   // vers la carte (rue Moussue, à l'ouest)

  // --- le Café de la Fontaine : salle 8 × 4 + arrière-cuisine 3 × 4 ---
  const cafe = e.batiment(4, 1, 14, 6, { nom: 'Le Café de la Fontaine', sol: 'carrelage', sombre: 1,
    portes: [{ cote: 's', a: 3, style: 'vitree' }], fenetres: [{ cote: 's', a: 0, l: 2 }, { cote: 's', a: 5, l: 2 }] });
  e.cloison('platre', 13, 2, 13, 5);
  e.porte(13, 3, { nom: 'la porte de l’arrière-cuisine' });   // derrière elle : deux unités libres
  e.nommer(14, 2, 'L’arrière-cuisine', { sol: 'tomettes', sombre: 2 });
  e.objet('cuisine', 16, 2, { rot: 1, w: 1, h: 3, nom: 'les placards de l’arrière-cuisine' });   // le long du mur du fond
  e.objet('frigo', 16, 5);
  e.objet('comptoir', cafe.x0 + 4, cafe.y0 + 1, { w: 3, h: 1, nom: 'le comptoir du café' });
  e.objet('table_ronde', cafe.x0, cafe.y0); e.objet('table_ronde', cafe.x0 + 2, cafe.y0 + 2); e.objet('table_ronde', cafe.x0, cafe.y0 + 3);
  e.objet('chaise', cafe.x0 + 1, cafe.y0); e.objet('chaise', cafe.x0 + 1, cafe.y0 + 3);
  e.zombie('errant', cafe.x0 + 5, cafe.y0, { etat: 'dort', dir: 0 });      // derrière le comptoir : il apprend « il dort »
  e.decal('verre', cafe.x0 + 2.5, cafe.y0 + 1.2, { r: 0.4 }); e.decal('papiers', cafe.x0 + 3, cafe.y0 + 3.4);

  // --- la place Crousillat (36 × 12) ---
  e.objet('fontaine', 21, 12, { nom: 'la Fontaine Moussue', eau: true });
  e.decal('mousse', 22, 13, { r: 1.1 }); e.decal('flaque', 20.6, 14.2, { r: 0.6 });
  // terrasses : tables et chaises renversées
  for (const [x, y] of [[6, 9], [10, 9], [6, 12]]) { e.objet('table_ronde', x, y); e.objet('chaise', x + 1, y); }
  for (const [x, y] of [[30, 9], [34, 9], [32, 12]]) { e.objet('table_ronde', x, y); e.objet('chaise', x - 1, y + 1); }
  e.objet('platane', 8, 16); e.objet('platane', 34, 16);
  e.semer('feuilles', 4, 8, 36, 11, 18);
  e.objet('lampadaire', 14, 8); e.objet('lampadaire', 28, 8);
  e.lumiere('lune', 22, 11, { r: 14, i: 0.35 });
  e.nommer(20, 10, 'Place Crousillat', { sol: 'paves', exterieur: true });
  e.entree('defaut', 5, 13);

  // --- la tour : 14 × 12 de l'extérieur (x 17..30, y 19..30) ---
  // massif ouest plein, porche voûté ouvert aux deux bouts, pied de l'escalier derrière la petite porte de chêne
  e.murRect('pierre', 17, 19, 4, 12);                       // mur ouest + massif (plein)
  e.murRect('pierre', 25, 19, 6, 1); e.murRect('pierre', 25, 19, 1, 12); e.murRect('pierre', 30, 19, 1, 12);
  e.murRect('pierre', 25, 30, 6, 1); e.murRect('pierre', 26, 25, 4, 5);   // la travée est, pleine sous le pied de l'escalier
  e.solRect('paves', 21, 19, 4, 12);
  // (le porche est ouvert sur la place et sur la rue : c'est le même « dehors », nommé Place Crousillat)
  e.toit(17, 19, 14, 12, 'tuiles');
  e.porte(25, 22, { verrou: { flag: 'pro_signal' }, nom: 'la petite porte de la tour', style: 'bois',
    message: 'Une petite porte en chêne, barrée de l’intérieur. Quelqu’un, là-haut, peut t’ouvrir.' });
  // le pied de l'escalier (4 × 5)
  e.solRect('paves', 26, 20, 4, 5);
  e.nommer(26, 22, 'Le pied de l’escalier', { sol: 'paves', sombre: 2, sansMorts: true });
  e.escalier('monte', 28, 20, 2, 2);
  e.entree('porche', 26, 22);
  e.objet('palette', 26, 24, { nom: 'la barre de chêne', w: 2, h: 1, conteneur: false });
  e.objet('fut', 29, 24, { nom: 'la lampe-tempête éteinte' });

  // --- la rue de l'Horloge (au sud) ---
  close(e, 13, 31, 8, 9); close(e, 30, 31, 8, 9);
  close(e, 0, 20, 17, 20); close(e, 31, 20, 17, 11); close(e, 38, 31, 10, 9); close(e, 4, 20, 13, 11);
  e.sortie(21, 39, 9, 1);                                   // vers le cours (carte)
  e.objet('poubelle', 22, 33); e.semer('papiers', 21, 31, 9, 8, 6);

  // --- les morts de la place ---
  // à l'arrivée (avant le signal) : deux errants à l'est, loin de l'arrivée
  e.zombie('errant', 36, 11, { etat: 'erre', si: { pasFlag: 'pro_signal' } });
  e.zombie('errant', 37, 15, { etat: 'erre', si: { pasFlag: 'pro_signal' } });
  // la foule : immobile, tournée vers la tour ; elle laisse libre le chemin le long des façades sud-ouest vers le porche
  for (const [x, y] of [[26, 13], [28, 13], [30, 14], [32, 13], [27, 15], [29, 16], [31, 16], [33, 15], [35, 14], [36, 17],
    [25, 17], [28, 18], [33, 18], [12, 11], [14, 13], [16, 11], [17, 14], [11, 15]]) {
    e.zombie((x * 7 + y) % 5 === 0 ? 'putrefie' : 'errant', x, y, { etat: 'immobile', dir: SUD, si: FOULE });
  }
  // après le prologue : la foule s'est dispersée
  for (const [x, y] of [[30, 11], [12, 16], [36, 16], [24, 9]]) e.zombie('errant', x, y, { etat: 'erre', si: APRES });

  // ================= 1er ÉTAGE : la salle de l'horloge (8 × 8), le campement de Maud =================
  const e1 = p.etage('e1', 'Salle de l’horloge', W, H, { sol: null, monte: 'e2', descend: 'rdc', interieur: true });
  const sa = e1.piece(21, 19, 10, 10, { nom: 'La salle de l’horloge', sol: 'parquet', mur: 'pierre', sombre: 1, sansMorts: true,
    fenetres: [{ cote: 'n', a: 3, l: 2 }] });               // le cadran, vu de dos
  e1.escalier('monte', 28, 20, 2, 2); e1.escalier('descend', 28, 22, 2, 2);
  e1.objet('machine', 23, 23, { w: 3, h: 2, nom: 'le mécanisme de l’horloge', marqueur: 'mecanisme_horloge', conteneur: false });
  e1.objet('lit_camp', sa.x0, sa.y1 - 1, { nom: 'le lit de camp de Maud' });
  e1.objet('caisse', sa.x0 + 1, sa.y0, { nom: 'la caisse de Maud', conteneur: { nom: 'la caisse de Maud', items: [{ id: 'bouteille_eau', qty: 1 }], table: null } });
  e1.objet('fut', sa.x0, sa.y0, { nom: 'le jerrican vide' });
  e1.objet('etagere', sa.x0 + 3, sa.y1, { nom: 'le carton de conserves vides', conteneur: false });
  e1.objet('plan_mural', sa.x0 + 5, sa.y0 - 1, { nom: 'la carte de Salon couverte de croix' });
  e1.decal('cendres', sa.x0 + 2.4, sa.y1 - 0.4, { r: 0.3 }); e1.decal('papiers', sa.x0 + 1.6, sa.y1 + 0.3);
  e1.lumiere('lanterne', sa.x0 + 1.5, sa.y1 - 0.5, { r: 4.5, i: 0.7 });

  // ================= 2e ÉTAGE : le palier des meurtrières (6 × 6) =================
  const e2 = p.etage('e2', 'Le palier des meurtrières', W, H, { sol: null, monte: 'sommet', descend: 'e1', interieur: true });
  const pa = e2.piece(23, 19, 8, 8, { nom: 'Le palier des meurtrières', sol: 'paves', mur: 'pierre', sombre: 1, sansMorts: true,
    fenetres: [{ cote: 'o', a: 2 }, { cote: 's', a: 2 }, { cote: 'n', a: 1 }] });
  e2.escalier('monte', 28, 20, 2, 2); e2.escalier('descend', 28, 22, 2, 2);
  e2.marqueur('carnet_tour', 27, 23, { nom: 'le carnet de Maud' });
  e2.semer('feuilles', pa.x0, pa.y0, 5, 6, 4); e2.decal('ordures', pa.x0 + 1, pa.y1, { r: 0.4 });
  e2.lumiere('lune', pa.x0 + 0.6, pa.y0 + 2.5, { r: 3, i: 0.35 });

  // ================= SOMMET : la terrasse du campanile (8 × 8, dehors) =================
  const so = p.etage('sommet', 'Le campanile', W, H, { sol: null, descend: 'e2' });
  so.solRect('paves', 22, 20, 8, 8);
  so.contour('muret', 21, 19, 10, 10);                     // le parapet : on voit la place en contrebas
  so.nommer(23, 25, 'La terrasse du campanile', { sol: 'paves', exterieur: true, sansMorts: true });
  so.escalier('descend', 28, 22, 2, 2);
  for (const [x, y] of [[22, 20], [22, 27], [29, 27], [26, 20]]) so.objet('pilier', x, y, { nom: 'un pilier du campanile' });
  so.objet('cloche', 24, 23, { nom: 'le bourdon' });
  so.objet('cloche', 23, 21, { w: 1, h: 1, nom: 'la cloche des heures' });
  so.objet('cloche', 26, 26, { w: 1, h: 1, nom: 'la cloche des quarts' });
  so.marqueur('sommet_maud', 28, 26);
  so.lumiere('lanterne', 28.5, 26.5, { r: 3, i: 0.45 });
  so.lumiere('lune', 25, 24, { r: 9, i: 0.45 });
  so.semer('feuilles', 22, 20, 8, 8, 5);
});
