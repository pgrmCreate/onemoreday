// ============================================================================
//  FABRICATION — recettes (refonte v3). Pourquoi fabriquer : docs/GAMEPLAY.md §Fabrication.
// ============================================================================
// Format (REFONTE §4.4, + champs documentés ici) :
//   id            unique, préfixe 'r_'.
//   cat           'soins' | 'armes' | 'reparation' | 'nourriture' | 'lumiere' | 'survie' | 'recyclage' | 'equipement'
//   nom, desc
//   resultat      { id, qty } — ou null pour une recette spéciale (voir `special`).
//   aussi         [{ id, qty }] — ce qu'on récupère EN PLUS (démonter un réveil : les piles, et un ressort, des vis).
//   ingredients   [{ id, qty }] consommés À LA FIN (interrompre ne coûte rien).
//   outils        [tags] requis, non consommés (tags `usage` des objets : 'cuisson', 'couper', 'marteler', 'visser',
//                 'affuter', 'coudre', 'allumer', 'filtrer', 'entretien_arme', 'ouvrir'…). Un seul objet peut en couvrir plusieurs.
//   poste         null (à la main, n'importe où) | 'etabli' (à ≤ 1,5 case d'une table / d'un bureau / d'une machine ;
//                 un vrai établi : temps × 0,7) | 'feu' (feu de camp allumé, réchaud avec gaz, cheminée).
//   skill         { competence: niveau } requis (toutes les clés), ou null.
//   tempsMin      minutes de jeu (barre réelle = tempsMin × MS_PAR_MINUTE / FABRICATION_ACCELERE : 30 min → 5 s).
//   xp            { competence: n } gagnés à la fin.
//   connue        true : visible et faisable dès le début.
//   apprise_par   NOUVEAU — [ids d'objets type 'livre'] : lire l'un d'eux apprend la recette.
//   apprise_niveau NOUVEAU — { competence: niveau, … } : atteindre L'UN de ces niveaux apprend la recette.
//                 (Une recette non connue reste cachée ; on voit « ??? — à découvrir » dans sa catégorie.)
//   special       'reparer' | 'feu_camp' | 'barricade' (resultat null) — feu de camp et barricades : voir js/data/construction.js :
//                   reparer   : cible [familles] (items.reparation), gain (fraction de la durabilité max rendue) ;
//                   feu_camp  : pose un feu (poste 'feu', lumière, chaleur) pour craft.FEU_CAMP_MIN minutes ;
//                   barricade : barricade la porte la plus proche (PV → exploration.PORTES.PV_BARRICADEE).
//   qualite       (implicite) la durabilité d'une arme fabriquée dépend du niveau (reglages.craft.QUALITE).
// ============================================================================

export const RECIPES = [

  // ======================== SOINS ========================
  {
    id: 'r_bandage_fortune', cat: 'soins', nom: 'Bandage de fortune',
    resultat: { id: 'bandage_fortune', qty: 1 },
    ingredients: [{ id: 'chiffon', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 5, xp: { medecine: 2 }, connue: true,
    desc: 'Déchirer, nouer, serrer. Mieux que de se vider.',
  },
  {
    id: 'r_bandages_bouillis', cat: 'soins', nom: 'Bandages bouillis',
    resultat: { id: 'bandage', qty: 2 },
    ingredients: [{ id: 'chiffon', qty: 3 }, { id: 'eau_croupie', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 25, xp: { medecine: 5 },
    connue: false, apprise_par: ['precis_secourisme', 'guide_survie'], apprise_niveau: { medecine: 1 },
    desc: 'Faire bouillir les chiffons, les sécher à la flamme, les rouler serré. Presque aussi propres qu\'avant.',
  },
  {
    id: 'r_desinfectant_alcool', cat: 'soins', nom: 'Doses de désinfectant',
    resultat: { id: 'desinfectant', qty: 2 },
    ingredients: [{ id: 'alcool_fort', qty: 1 }, { id: 'chiffon', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { medecine: 3 }, connue: true,
    desc: 'Filtrer le tord-boyaux au chiffon et le partager en doses. À verser sur les plaies, pas dans le gosier.',
  },
  {
    id: 'r_pansement_miel', cat: 'soins', nom: 'Pansements au miel',
    resultat: { id: 'pansement_miel', qty: 2 },
    ingredients: [{ id: 'bandage', qty: 1 }, { id: 'miel', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { medecine: 5 },
    connue: false, apprise_par: ['traite_confitures', 'precis_secourisme'], apprise_niveau: { medecine: 3 },
    desc: 'Couper la compresse en deux, l\'enduire de miel épais. Nostradamus soignait la peste avec moins que ça.',
  },
  {
    id: 'r_attelle', cat: 'soins', nom: 'Attelle',
    resultat: { id: 'attelle', qty: 1 },
    ingredients: [{ id: 'planche', qty: 1 }, { id: 'chiffon', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { medecine: 4, construction: 2 }, connue: true,
    desc: 'Fendre une planche, caler, serrer fort. Le membre proteste, puis se tait.',
  },
  {
    id: 'r_kit_suture', cat: 'soins', nom: 'Kits de suture',
    resultat: { id: 'kit_suture', qty: 2 },
    ingredients: [{ id: 'trousse_couture', qty: 1 }, { id: 'desinfectant', qty: 1 }],
    outils: [], poste: null, skill: { medecine: 1 }, tempsMin: 15, xp: { medecine: 6 },
    connue: false, apprise_par: ['precis_secourisme'], apprise_niveau: { medecine: 2 },
    desc: 'Tremper le fil et les aiguilles, courber les aiguilles à la flamme, les piquer dans un carré de tissu propre. Tu espères ne jamais t\'en servir.',
  },
  {
    id: 'r_tisane', cat: 'soins', nom: 'Tisane des Simples',
    resultat: { id: 'tisane_emperi', qty: 1 },
    ingredients: [{ id: 'herbes_simples', qty: 2 }, { id: 'eau_croupie', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 15, xp: { medecine: 3 },
    connue: false, apprise_par: ['traite_confitures'], apprise_niveau: { medecine: 2 },
    desc: 'Faire infuser sauge et millepertuis comme au temps de Nostradamus. L\'eau bout, la fièvre tombe.',
  },
  {
    id: 'r_onguent', cat: 'soins', nom: 'Onguent aux herbes',
    resultat: { id: 'onguent', qty: 2 },
    ingredients: [{ id: 'herbes_simples', qty: 2 }, { id: 'huile_olive', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { medecine: 4 },
    connue: false, apprise_par: ['traite_confitures'],
    desc: 'Piler les herbes au fond d\'un bol, noyer dans l\'huile, laisser reposer. Ça sent la garrigue après la pluie.',
  },

  // ======================== ARMES ========================
  {
    id: 'r_couteau_artisanal', cat: 'armes', nom: 'Couteau artisanal',
    resultat: { id: 'couteau_artisanal', qty: 1 },
    ingredients: [{ id: 'eclat_verre', qty: 1 }, { id: 'chiffon', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { construction: 4 }, connue: true,
    desc: 'Un éclat de verre emmailloté dans un manche de fortune. Première arme, pas la dernière.',
  },
  {
    id: 'r_lance', cat: 'armes', nom: 'Lance artisanale',
    resultat: { id: 'lance_artisanale', qty: 1 },
    ingredients: [{ id: 'manche_balai', qty: 1 }, { id: 'couteau_cuisine', qty: 1 }, { id: 'fil_de_fer', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { construction: 8 }, connue: true,
    desc: 'Ligaturer un couteau au bout d\'un manche. Garder les dents loin de la peau — et les gonflés loin du visage.',
  },
  {
    id: 'r_lance_verre', cat: 'armes', nom: 'Lance à pointe de verre',
    resultat: { id: 'lance_artisanale', qty: 1 },
    ingredients: [{ id: 'manche_balai', qty: 1 }, { id: 'eclat_verre', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { dexterite: 3 }, connue: true,
    desc: 'Fendre le bout du manche, y coincer le plus long éclat, ligaturer serré au scotch. Elle cassera plus vite qu\'une lame — mais tu gardes ton couteau.',
  },
  {
    id: 'r_lance_renforcee', cat: 'armes', nom: 'Lance renforcée',
    resultat: { id: 'lance_renforcee', qty: 1 },
    ingredients: [{ id: 'lance_artisanale', qty: 1 }, { id: 'fil_de_fer', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: 'etabli', skill: { construction: 1 }, tempsMin: 25, xp: { construction: 12 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { construction: 2 },
    desc: 'Reprendre chaque ligature au fil de fer, serrer à la pince, noyer dans le scotch. Solide comme une vraie.',
  },
  {
    id: 'r_batte_cloutee', cat: 'armes', nom: 'Batte cloutée',
    resultat: { id: 'batte_cloutee', qty: 1 },
    ingredients: [{ id: 'batte_baseball', qty: 1 }, { id: 'clous', qty: 6 }],
    outils: ['marteler'], poste: null, skill: null, tempsMin: 15, xp: { construction: 8 }, connue: true,
    desc: 'Chaque clou planté est une promesse. Le bruit du marteau, lui, en est une autre — pour les voisins.',
  },
  {
    id: 'r_masse', cat: 'armes', nom: 'Masse de fortune',
    resultat: { id: 'masse_chantier', qty: 1 },
    ingredients: [{ id: 'tuyau_acier', qty: 1 }, { id: 'brique', qty: 1 }, { id: 'scotch', qty: 2 }],
    outils: [], poste: 'etabli', skill: { construction: 1 }, tempsMin: 30, xp: { construction: 14 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { construction: 2 },
    desc: 'Scotcher une brique au bout d\'un tuyau jusqu\'à ce que rien ne bouge. Subtil comme un éboulement.',
  },
  {
    id: 'r_machette_aiguisee', cat: 'armes', nom: 'Aiguiser la machette',
    resultat: { id: 'machette_aiguisee', qty: 1 },
    ingredients: [{ id: 'machette', qty: 1 }],
    outils: ['affuter'], poste: null, skill: { entretien: 1 }, tempsMin: 20, xp: { entretien: 10 }, connue: true,
    desc: 'Reprendre le fil à la pierre, patiemment, dans le sens de la lame. Elle chante quand on l\'effleure.',
  },
  {
    id: 'r_arbalete', cat: 'armes', nom: 'Arbalète de fortune',
    resultat: { id: 'arbalete_fortune', qty: 1 },
    ingredients: [{ id: 'planche', qty: 2 }, { id: 'ressort', qty: 2 }, { id: 'cable_electrique', qty: 1 }, { id: 'visserie', qty: 2 }],
    outils: ['visser'], poste: 'etabli', skill: { construction: 2 }, tempsMin: 60, xp: { construction: 25 },
    connue: false, apprise_par: ['plans_arbalete'],
    desc: 'Un arc de planche bandé par des ressorts de sommier. Une heure de boulot pour tuer sans réveiller le quartier.',
  },
  {
    id: 'r_carreaux', cat: 'armes', nom: 'Carreaux de fortune',
    resultat: { id: 'carreau_fortune', qty: 4 },
    ingredients: [{ id: 'manche_balai', qty: 1 }, { id: 'visserie', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 20, xp: { construction: 6 },
    connue: false, apprise_par: ['plans_arbalete'], apprise_niveau: { construction: 3 },
    desc: 'Débiter le manche en quatre fûts, limer une vis en pointe sur chacun. Munitions maison, silencieuses, et on les ramasse.',
  },
  {
    id: 'r_molotov_alcool', cat: 'armes', nom: 'Cocktail Molotov (alcool)',
    resultat: { id: 'cocktail_molotov', qty: 1 },
    ingredients: [{ id: 'alcool_fort', qty: 1 }, { id: 'chiffon', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 5, xp: { construction: 3 }, connue: true,
    desc: 'Gâcher de l\'alcool pareil… mais quel feu d\'artifice.',
  },
  {
    id: 'r_molotov_essence', cat: 'armes', nom: 'Cocktail Molotov (essence)',
    resultat: { id: 'cocktail_molotov', qty: 2 },
    ingredients: [{ id: 'essence', qty: 1 }, { id: 'bouteille_vide', qty: 2 }, { id: 'chiffon', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { construction: 4 }, connue: true,
    desc: 'Un litre de sans-plomb partagé en deux bouteilles, deux mèches enfoncées au goulot. Les mains qui sentent l\'essence jusqu\'au soir.',
  },
  {
    id: 'r_couteau_lancer', cat: 'armes', nom: 'Couteau de lancer',
    resultat: { id: 'couteau_lancer', qty: 1 },
    ingredients: [{ id: 'eclat_verre', qty: 1 }, { id: 'ressort', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: { construction: 1 }, tempsMin: 15, xp: { construction: 6 },
    connue: false, apprise_par: ['guide_survie'], apprise_niveau: { dexterite: 2 },
    desc: 'Lester l\'éclat d\'un ressort pour qu\'il tourne juste. Un seul jet — après, va le ramasser.',
  },
  {
    id: 'r_leurre_sonore', cat: 'armes', nom: 'Réveil piégé',
    resultat: { id: 'leurre_sonore', qty: 1 },
    ingredients: [{ id: 'reveil', qty: 1 }, { id: 'piles', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { mecanique: 6 },
    connue: false, apprise_par: ['guide_survie', 'revue_mecanique'], apprise_niveau: { mecanique: 1, discretion: 1 },
    desc: 'Régler l\'alarme trois secondes plus tard, bloquer le bouton au scotch, emballer en boule pour qu\'il roule. Le meilleur ami du rôdeur.',
  },

  // ======================== RÉPARATION (spéciales) ========================
  {
    id: 'r_reparer_scotch', cat: 'reparation', nom: 'Rafistoler au scotch',
    special: 'reparer', cible: ['bois'], gain: 0.3, resultat: null,
    ingredients: [{ id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 5, xp: { entretien: 3 }, connue: true,
    desc: 'Serrer la fente du manche sous dix tours de scotch. Ça tiendra. Un temps.',
  },
  {
    id: 'r_reparer_ligature', cat: 'reparation', nom: 'Ligaturer au fil de fer',
    special: 'reparer', cible: ['bois', 'metal'], gain: 0.5, resultat: null,
    ingredients: [{ id: 'fil_de_fer', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: 'etabli', skill: { entretien: 1 }, tempsMin: 15, xp: { entretien: 6 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { entretien: 1 },
    desc: 'Cercler le manche de fil de fer serré à la pince, reprendre le jeu du fer. Du travail d\'artisan.',
  },
  {
    id: 'r_affuter', cat: 'reparation', nom: 'Affûter une lame',
    special: 'reparer', cible: ['lame'], gain: 0.4, resultat: null,
    ingredients: [],
    outils: ['affuter'], poste: null, skill: null, tempsMin: 10, xp: { entretien: 4 }, connue: true,
    desc: 'Un peu d\'eau sur la pierre, le bon angle, vingt passes de chaque côté. Le fil revient.',
  },
  {
    id: 'r_entretien_arme_feu', cat: 'reparation', nom: 'Entretenir une arme à feu',
    special: 'reparer', cible: ['arme_feu'], gain: 0.5, resultat: null,
    ingredients: [{ id: 'chiffon', qty: 1 }],
    outils: ['entretien_arme'], poste: null, skill: null, tempsMin: 20, xp: { entretien: 5, visee: 2 }, connue: true,
    desc: 'Démonter, écouvillonner, huiler, remonter. Les gestes reviennent, même à qui ne les a jamais appris.',
  },

  // ======================== NOURRITURE & EAU ========================
  {
    id: 'r_eau_bouillie', cat: 'nourriture', nom: 'Faire bouillir l\'eau',
    resultat: { id: 'eau_purifiee', qty: 1 },
    ingredients: [{ id: 'eau_croupie', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 15, xp: {}, connue: true,
    desc: 'Dix minutes d\'ébullition tuent ce qui grouille dedans.',
  },
  {
    id: 'r_eau_filtree', cat: 'nourriture', nom: 'Filtrer l\'eau croupie',
    resultat: { id: 'eau_purifiee', qty: 1 },
    ingredients: [{ id: 'eau_croupie', qty: 1 }],
    outils: ['filtrer'], poste: null, skill: null, tempsMin: 10, xp: {}, connue: true,
    desc: 'Verser, attendre, récupérer goutte à goutte. Pas de feu, pas de fumée, pas d\'invités.',
  },
  {
    id: 'r_viande_cuite', cat: 'nourriture', nom: 'Cuire la viande',
    resultat: { id: 'viande_cuite', qty: 1 },
    ingredients: [{ id: 'viande_crue', qty: 1 }],
    outils: [], poste: 'feu', skill: null, tempsMin: 20, xp: { chasse: 3 }, connue: true,
    desc: 'L\'odeur porte loin. Mange vite.',
  },
  {
    id: 'r_poisson_cuit', cat: 'nourriture', nom: 'Griller le poisson',
    resultat: { id: 'poisson_cuit', qty: 1 },
    ingredients: [{ id: 'poisson_cru', qty: 1 }],
    outils: [], poste: 'feu', skill: null, tempsMin: 15, xp: { chasse: 3 }, connue: true,
    desc: 'Grillé sur la flamme, arêtes comprises.',
  },
  {
    id: 'r_pates', cat: 'nourriture', nom: 'Cuire des pâtes',
    resultat: { id: 'pates_cuites', qty: 2 },
    ingredients: [{ id: 'pates_seches', qty: 1 }, { id: 'eau_croupie', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 20, xp: { chasse: 2 }, connue: true,
    desc: 'L\'eau croupie bout assez longtemps pour ne plus rien craindre. Deux gamelles pleines pour un paquet.',
  },
  {
    id: 'r_soupe', cat: 'nourriture', nom: 'Soupe de conserves',
    resultat: { id: 'soupe_conserve', qty: 1 },
    ingredients: [{ id: 'conserve_haricots', qty: 1 }, { id: 'eau_croupie', qty: 1 }],
    outils: ['cuisson', 'ouvrir'], poste: 'feu', skill: null, tempsMin: 20, xp: { chasse: 2 }, connue: true,
    desc: 'Une boîte allongée d\'eau et mijotée. Ça nourrit plus, ça réchauffe, et ça hydrate par-dessus le marché.',
  },
  {
    id: 'r_ragout', cat: 'nourriture', nom: 'Ragoût du survivant',
    resultat: { id: 'ragout', qty: 1 },
    ingredients: [{ id: 'viande_crue', qty: 1 }, { id: 'conserve_haricots', qty: 1 }],
    outils: ['cuisson', 'ouvrir'], poste: 'feu', skill: null, tempsMin: 40, xp: { chasse: 6 },
    connue: false, apprise_par: ['cuisine_provencale'], apprise_niveau: { chasse: 2 },
    desc: 'Viande et haricots dans la même casserole, à petit feu. Un vrai repas, comme avant.',
  },
  {
    id: 'r_viande_fumee', cat: 'nourriture', nom: 'Fumer la viande',
    resultat: { id: 'viande_fumee', qty: 2 },
    ingredients: [{ id: 'viande_crue', qty: 2 }, { id: 'planche', qty: 1 }],
    outils: ['couper'], poste: 'feu', skill: null, tempsMin: 60, xp: { chasse: 10 },
    connue: false, apprise_par: ['carnet_chasseur'], apprise_niveau: { chasse: 2 },
    desc: 'Des lanières fines au-dessus d\'un feu étouffé, une heure à surveiller la fumée. Des provisions qui ne pourrissent pas.',
  },
  {
    id: 'r_poisson_fume', cat: 'nourriture', nom: 'Fumer le poisson',
    resultat: { id: 'poisson_fume', qty: 2 },
    ingredients: [{ id: 'poisson_cru', qty: 2 }, { id: 'planche', qty: 1 }],
    outils: ['couper'], poste: 'feu', skill: null, tempsMin: 50, xp: { chasse: 8 },
    connue: false, apprise_par: ['carnet_chasseur'], apprise_niveau: { chasse: 1 },
    desc: 'Ouvrir, vider, suspendre au-dessus des braises couvertes. Léger, nourrissant, et il se garde.',
  },
  {
    id: 'r_ragout_poisson', cat: 'nourriture', nom: 'Bouillabaisse du pauvre',
    resultat: { id: 'ragout_poisson', qty: 1 },
    ingredients: [{ id: 'poisson_cru', qty: 2 }, { id: 'eau_croupie', qty: 1 }, { id: 'herbes_simples', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 35, xp: { chasse: 6 },
    connue: false, apprise_par: ['cuisine_provencale'],
    desc: 'Deux poissons mijotés dans leur bouillon avec une poignée de thym. Toute la bête y passe, têtes comprises.',
  },
  {
    id: 'r_confiture', cat: 'nourriture', nom: 'Confiture de Nostradamus',
    resultat: { id: 'confiture', qty: 2 },
    ingredients: [{ id: 'fruits_sauvages', qty: 2 }, { id: 'miel', qty: 1 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 30, xp: { chasse: 4, medecine: 2 },
    connue: false, apprise_par: ['traite_confitures'],
    desc: '« Faites-les bouillir dans le miel écumé jusqu\'à ce qu\'ils soient confits. » Quatre cent soixante-dix ans plus tard, la recette marche.',
  },
  {
    id: 'r_escargots_grilles', cat: 'nourriture', nom: 'Escargots grillés',
    resultat: { id: 'escargots_grilles', qty: 1 },
    ingredients: [{ id: 'escargots', qty: 2 }],
    outils: [], poste: 'feu', skill: null, tempsMin: 15, xp: { chasse: 1 }, connue: true,
    desc: 'Les poser coquille en bas au bord des braises. Quand ils ne bavent plus, c\'est prêt — et ça ne rend plus malade.',
  },
  {
    id: 'r_champignons_poeles', cat: 'nourriture', nom: 'Champignons poêlés',
    resultat: { id: 'champignons_poeles', qty: 1 },
    ingredients: [{ id: 'champignons', qty: 2 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 15, xp: {}, connue: true,
    desc: 'Les couper, les laisser rendre leur eau à feu doux. Bien cuits, ils passent mieux.',
  },
  {
    id: 'r_soupe_sauvage', cat: 'nourriture', nom: 'Soupe des collines',
    resultat: { id: 'soupe_sauvage', qty: 2 },
    ingredients: [{ id: 'herbes_simples', qty: 1 }, { id: 'champignons', qty: 1 }, { id: 'eau_croupie', qty: 2 }],
    outils: ['cuisson'], poste: 'feu', skill: null, tempsMin: 30, xp: { medecine: 1 }, connue: true,
    desc: 'Tout dans la casserole, et laisser frémir longtemps : l\'eau bouillie ne rend plus malade. Une soupe de rien, pour deux.',
  },
  {
    id: 'r_tapenade', cat: 'nourriture', nom: 'Tapenade',
    resultat: { id: 'tapenade', qty: 3 },
    ingredients: [{ id: 'olives', qty: 1 }, { id: 'huile_olive', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 10, xp: { chasse: 2 },
    connue: false, apprise_par: ['cuisine_provencale'],
    desc: 'Dénoyauter, hacher au couteau jusqu\'à la pâte, noyer d\'huile. Trois pots qui se gardent et ne demandent pas de feu.',
  },

  // ======================== BOIS ET NATURE ========================
  {
    id: 'r_planches_scie', cat: 'recyclage', nom: 'Scier une bûche en planches',
    resultat: { id: 'planche', qty: 3 },
    ingredients: [{ id: 'buche', qty: 1 }],
    outils: ['scier'], poste: null, skill: null, tempsMin: 25, xp: { construction: 4 }, connue: true,
    desc: 'Caler la bûche du pied, scier dans le fil, trois fois. Trois planches un peu gauches, mais des planches.',
  },
  {
    id: 'r_planches_hache', cat: 'recyclage', nom: 'Fendre une bûche',
    resultat: { id: 'planche', qty: 2 },
    ingredients: [{ id: 'buche', qty: 1 }],
    outils: ['abattre'], poste: null, skill: null, tempsMin: 30, xp: { construction: 3, force: 2 }, connue: true,
    desc: 'Fendre au coin de la hache, dégrossir les faces. Deux planches épaisses — le reste part en copeaux.',
  },
  {
    id: 'r_brindilles', cat: 'survie', nom: 'Casser du petit bois',
    resultat: { id: 'brindilles', qty: 3 },
    ingredients: [{ id: 'branche', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 3, xp: {}, connue: true,
    desc: 'Casser la branche sur le genou, encore, encore. De quoi démarrer un feu.',
  },
  {
    id: 'r_corde_fibres', cat: 'survie', nom: 'Tresser une corde',
    resultat: { id: 'corde', qty: 1 },
    ingredients: [{ id: 'fibres', qty: 6 }],
    outils: [], poste: null, skill: null, tempsMin: 40, xp: { chasse: 4 }, connue: true,
    desc: 'Rouler les fibres sur la cuisse, deux brins, puis trois, tordus en sens contraire. Lent, mais ça tient un homme.',
  },
  {
    id: 'r_epieu', cat: 'armes', nom: 'Épieu',
    resultat: { id: 'epieu', qty: 1 },
    ingredients: [{ id: 'branche', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 15, xp: { construction: 3 }, connue: true,
    desc: 'Choisir la branche la plus droite, tailler la pointe en biseau, la durcir au feu si on peut. L\'arme d\'avant les armes.',
  },
  {
    id: 'r_lance_cannes', cat: 'armes', nom: 'Lance en canne',
    resultat: { id: 'lance_artisanale', qty: 1 },
    ingredients: [{ id: 'cannes', qty: 1 }, { id: 'couteau_cuisine', qty: 1 }, { id: 'fibres', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { construction: 6 }, connue: true,
    desc: 'Fendre le bout de la canne, y glisser le manche du couteau, ligaturer serré. Légère, longue, fragile.',
  },
  {
    id: 'r_torche_branche', cat: 'lumiere', nom: 'Torche de branche',
    resultat: { id: 'torche', qty: 1 },
    ingredients: [{ id: 'branche', qty: 1 }, { id: 'chiffon', qty: 1 }, { id: 'huile_olive', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 6, xp: { construction: 2 }, connue: true,
    desc: 'Un chiffon imbibé d\'huile serré au bout d\'une branche. Ça fume, ça éclaire, ça sent la friture.',
  },
  {
    id: 'r_appat_escargots', cat: 'survie', nom: 'Appâts d\'escargots',
    resultat: { id: 'appat', qty: 2 },
    ingredients: [{ id: 'escargots', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 5, xp: { chasse: 1 }, connue: true,
    desc: 'Écraser les coquilles, hacher la chair. Les poissons de la Touloubre ne font pas les difficiles.',
  },
  {
    id: 'r_charbon_actif', cat: 'survie', nom: 'Charbon de bois broyé',
    resultat: { id: 'charbon_actif', qty: 1 },
    ingredients: [{ id: 'branche', qty: 2 }],
    outils: [], poste: 'feu', skill: null, tempsMin: 40, xp: { medecine: 3 },
    connue: false, apprise_par: ['guide_survie', 'precis_secourisme'], apprise_niveau: { medecine: 1 },
    desc: 'Laisser les branches charbonner à l\'étouffée sous la cendre, puis piler le charbon fin. Contre le ventre qui se tord, ça vaut des gélules.',
  },
  {
    id: 'r_sac_sable', cat: 'survie', nom: 'Remplir un sac de terre',
    resultat: { id: 'sac_sable', qty: 1 },
    ingredients: [{ id: 'sac_plastique', qty: 1 }],
    outils: ['creuser'], poste: null, skill: null, tempsMin: 10, xp: { force: 2 }, connue: true,
    desc: 'Pelleter la terre dans le sac, tasser, nouer. Douze kilos qui arrêtent un mort — et une balle.',
  },
  {
    id: 'r_hachette', cat: 'armes', nom: 'Hachette de fortune',
    resultat: { id: 'hachette', qty: 1 },
    ingredients: [{ id: 'ferraille', qty: 2 }, { id: 'branche', qty: 1 }, { id: 'fil_de_fer', qty: 1 }],
    outils: ['marteler', 'affuter'], poste: 'etabli', skill: { construction: 2 }, tempsMin: 45, xp: { construction: 12 },
    connue: false, apprise_par: ['manuel_bricolage', 'guide_survie'], apprise_niveau: { construction: 3 },
    desc: 'Marteler une cornière en coin, l\'affûter, l\'emmancher dans une fourche de branche. Elle coupe du bois. Et le reste.',
  },

  // ======================== LUMIÈRE ========================
  {
    id: 'r_torche', cat: 'lumiere', nom: 'Torche',
    resultat: { id: 'torche', qty: 1 },
    ingredients: [{ id: 'manche_balai', qty: 1 }, { id: 'chiffon', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 5, xp: { construction: 2 }, connue: true,
    desc: 'De la lumière sans piles, pour deux heures et demie. Mais une flamme se voit de loin…',
  },
  {
    id: 'r_lampe_huile', cat: 'lumiere', nom: 'Lampe à huile',
    resultat: { id: 'lampe_huile', qty: 1 },
    ingredients: [{ id: 'boite_vide', qty: 1 }, { id: 'chiffon', qty: 1 }, { id: 'huile_olive', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 10, xp: { construction: 4 },
    connue: false, apprise_par: ['guide_survie', 'cuisine_provencale'], apprise_niveau: { construction: 1 },
    desc: 'Percer le couvercle, passer une mèche tressée, remplir d\'huile. Une lumière de crèche qui ne dépend de personne.',
  },
  {
    id: 'r_frontale_fortune', cat: 'lumiere', nom: 'Frontale de fortune',
    resultat: { id: 'lampe_frontale_fortune', qty: 1 },
    ingredients: [{ id: 'lampe_torche', qty: 1 }, { id: 'scotch', qty: 2 }, { id: 'chiffon', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { construction: 4 },
    connue: false, apprise_par: ['manuel_bricolage', 'guide_survie'], apprise_niveau: { construction: 1 },
    desc: 'Scotcher la lampe sur un bandeau de chiffon, régler l\'angle en la calant. Tes deux mains sont enfin à toi.',
  },
  {
    id: 'r_piles_recup', cat: 'lumiere', nom: 'Piles de récupération',
    resultat: { id: 'piles', qty: 1 },
    ingredients: [{ id: 'batterie_telephone', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { mecanique: 6 }, connue: true,
    desc: 'Ponter deux batteries de téléphone encore vives, isoler au scotch, tordre les languettes pour qu\'elles touchent. De quoi rallumer une lampe.',
  },

  // ======================== SURVIE ========================
  {
    id: 'r_piege_sonore', cat: 'survie', nom: 'Piège sonore',
    resultat: { id: 'piege_sonore', qty: 1 },
    ingredients: [{ id: 'bouteille_vide', qty: 2 }, { id: 'fil_de_fer', qty: 1 }, { id: 'clous', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { construction: 6 }, connue: true,
    desc: 'Tendu en travers d\'un passage avant de dormir : tu seras debout avant qu\'on te morde.',
  },
  {
    id: 'r_collet', cat: 'survie', nom: 'Collet',
    resultat: { id: 'collet', qty: 1 },
    ingredients: [{ id: 'fil_de_fer', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 10, xp: { chasse: 6 },
    connue: false, apprise_par: ['carnet_chasseur', 'guide_survie'], apprise_niveau: { chasse: 1 },
    desc: 'Un nœud coulant posé au bon endroit nourrit son homme.',
  },
  {
    id: 'r_canne_peche', cat: 'survie', nom: 'Canne à pêche de fortune',
    resultat: { id: 'canne_peche', qty: 1 },
    ingredients: [{ id: 'manche_balai', qty: 1 }, { id: 'fil_de_fer', qty: 2 }, { id: 'clous', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { chasse: 8 },
    connue: false, apprise_par: ['carnet_chasseur', 'guide_survie'], apprise_niveau: { chasse: 1 },
    desc: 'Un manche, du fil, un clou tordu en hameçon. Les carpes du canal n\'y verront que du feu.',
  },
  {
    id: 'r_nasse', cat: 'survie', nom: 'Nasse',
    resultat: { id: 'nasse', qty: 1 },
    ingredients: [{ id: 'bouteille_vide', qty: 2 }, { id: 'fil_de_fer', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 25, xp: { chasse: 10 },
    connue: false, apprise_par: ['carnet_chasseur'], apprise_niveau: { chasse: 2 },
    desc: 'Découper, emboîter en entonnoir, armer de fil de fer. Le poisson entre, le poisson ne sort plus.',
  },
  {
    id: 'r_filtre', cat: 'survie', nom: 'Filtre de fortune',
    resultat: { id: 'filtre_fortune', qty: 1 },
    ingredients: [{ id: 'bouteille_vide', qty: 1 }, { id: 'chiffon', qty: 2 }, { id: 'sac_plastique', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 15, xp: { construction: 5 },
    connue: false, apprise_par: ['guide_survie', 'precis_secourisme'], apprise_niveau: { construction: 1, chasse: 1 },
    desc: 'Couper la bouteille, tasser le chiffon en couches, gainer de plastique. L\'eau croupie ressort buvable.',
  },
  {
    id: 'r_crochets', cat: 'survie', nom: 'Crochets de serrurier',
    resultat: { id: 'crochets_serrure', qty: 1 },
    ingredients: [{ id: 'fil_de_fer', qty: 2 }],
    outils: ['visser'], poste: 'etabli', skill: { mecanique: 1 }, tempsMin: 20, xp: { mecanique: 8 },
    connue: false, apprise_par: ['revue_mecanique'], apprise_niveau: { mecanique: 2 },
    desc: 'Aplatir le fil au marteau, le limer, le tordre en crochet et en tension. Une heure de patience contre toutes les portes de Salon.',
  },

  // ======================== RECYCLAGE ========================
  {
    id: 'r_dechirer_drap', cat: 'recyclage', nom: 'Déchirer un drap',
    resultat: { id: 'chiffon', qty: 4 },
    ingredients: [{ id: 'drap', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 5, xp: {}, connue: true,
    desc: 'Entailler l\'ourlet des dents, tirer. Le bruit du tissu qui cède. Quatre bandes propres.',
  },
  {
    id: 'r_fil_cable', cat: 'recyclage', nom: 'Dénuder un câble',
    resultat: { id: 'fil_de_fer', qty: 2 },
    ingredients: [{ id: 'cable_electrique', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 10, xp: { mecanique: 3 }, connue: true,
    desc: 'Sous la gaine, du bon fil de cuivre. Long, pénible, mais ça occupe les mains.',
  },
  {
    id: 'r_batterie_telephone', cat: 'recyclage', nom: 'Sortir la batterie d\'un téléphone',
    resultat: { id: 'batterie_telephone', qty: 1 },
    ingredients: [{ id: 'telephone_mort', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 3, xp: { mecanique: 1 }, connue: true,
    desc: 'Faire sauter la coque à l\'ongle, décoller la batterie sans la plier. L\'écran noir te renvoie ta figure.',
  },
  {
    id: 'r_demonter_reveil', cat: 'recyclage', nom: 'Démonter un réveil',
    resultat: { id: 'piles', qty: 1 }, aussi: [{ id: 'ressort', qty: 1 }, { id: 'visserie', qty: 1 }],
    ingredients: [{ id: 'reveil', qty: 1 }],
    outils: ['visser'], poste: null, skill: null, tempsMin: 8, xp: { mecanique: 3 }, connue: true,
    desc: 'Les piles d\'abord. Puis quatre vis, le mécanisme, le petit ressort de la sonnerie. Il ne réveillera plus personne.',
  },
  {
    id: 'r_clous_ferraille', cat: 'recyclage', nom: 'Tirer des clous de la ferraille',
    resultat: { id: 'clous', qty: 5 },
    ingredients: [{ id: 'ferraille', qty: 1 }],
    outils: ['marteler'], poste: 'etabli', skill: null, tempsMin: 15, xp: { construction: 3, mecanique: 2 }, connue: true,
    desc: 'Arracher les rivets, redresser les tiges tordues à petits coups sur le plat de l\'établi. Ils ne sont pas beaux, ils tiennent.',
  },
  {
    id: 'r_ferraille_boites', cat: 'recyclage', nom: 'Aplatir des boîtes de conserve',
    resultat: { id: 'ferraille', qty: 1 },
    ingredients: [{ id: 'boite_vide', qty: 3 }],
    outils: ['marteler'], poste: null, skill: null, tempsMin: 10, xp: { mecanique: 1 }, connue: true,
    desc: 'Écraser, replier, marteler les boîtes vides en plaques. Du fer-blanc qui servira de rustine.',
  },
  {
    id: 'r_eclats_bouteille', cat: 'recyclage', nom: 'Casser une bouteille',
    resultat: { id: 'eclat_verre', qty: 2 },
    ingredients: [{ id: 'bouteille_vide', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 2, xp: {}, connue: true,
    desc: 'Envelopper la bouteille dans un tissu, un coup sec contre une pierre. Garder les deux plus longs éclats.',
  },
  {
    id: 'r_corde_chiffons', cat: 'recyclage', nom: 'Tresser une corde de chiffons',
    resultat: { id: 'corde', qty: 1 },
    ingredients: [{ id: 'chiffon', qty: 6 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { construction: 2 }, connue: true,
    desc: 'Nouer les bandes bout à bout, tresser serré à trois brins. La corde des évasions, celle qui descend des fenêtres.',
  },
  {
    id: 'r_bache_sacs', cat: 'recyclage', nom: 'Bâche de sacs plastique',
    resultat: { id: 'bache_plastique', qty: 1 },
    ingredients: [{ id: 'sac_plastique', qty: 8 }, { id: 'scotch', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 20, xp: { construction: 2 }, connue: true,
    desc: 'Fendre les sacs, les étaler à plat en écailles, tout souder au scotch. Ça ne fera pas un beau toit, mais un toit sec.',
  },

  // ======================== ÉQUIPEMENT ========================
  {
    id: 'r_sac_fortune', cat: 'equipement', nom: 'Sac de fortune',
    resultat: { id: 'sac_fortune', qty: 1 },
    ingredients: [{ id: 'chiffon', qty: 4 }, { id: 'corde', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 25, xp: { construction: 6 }, connue: true,
    desc: 'Cousu gros, mais ça porte. En attendant de trouver un vrai sac.',
  },
  {
    id: 'r_sac_bache', cat: 'equipement', nom: 'Baluchon de bâche',
    resultat: { id: 'sac_fortune', qty: 1 },
    ingredients: [{ id: 'bache_plastique', qty: 1 }, { id: 'corde', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 25, xp: { construction: 2 }, connue: true,
    desc: 'Plier la bâche en poche, percer les coins, passer la corde en bretelles. Imperméable, au moins.',
  },
  {
    id: 'r_ceinture_fortune', cat: 'equipement', nom: 'Ceinture de fortune',
    resultat: { id: 'ceinture_fortune', qty: 1 },
    ingredients: [{ id: 'corde', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { construction: 4 }, connue: true,
    desc: 'De la corde doublée de scotch, et de quoi coincer UN objet à portée de main. En combat, ça change tout.',
  },
  {
    id: 'r_holster_fortune', cat: 'equipement', nom: 'Holster de fortune',
    resultat: { id: 'holster_fortune', qty: 1 },
    ingredients: [{ id: 'chiffon', qty: 2 }, { id: 'corde', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { construction: 4 }, connue: true,
    desc: 'Un étui cousu gros, noué à la cuisse. Un objet de plus à dégainer sans ouvrir le sac.',
  },
  {
    id: 'r_ceinture_renforcee', cat: 'equipement', nom: 'Ceinture renforcée',
    resultat: { id: 'ceinture_renforcee', qty: 1 },
    ingredients: [{ id: 'ceinture_cuir', qty: 1 }, { id: 'fil_de_fer', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: { construction: 1 }, tempsMin: 30, xp: { construction: 10 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { construction: 2 },
    desc: 'Tordre des boucles de fil de fer dans le cuir, une par étui. Trois objets contre les reins, prêts à sortir.',
  },
  {
    id: 'r_brassards', cat: 'equipement', nom: 'Brassards de magazines',
    resultat: { id: 'brassards_journaux', qty: 1 },
    ingredients: [{ id: 'journal_papier', qty: 4 }, { id: 'scotch', qty: 2 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { construction: 5 }, connue: true,
    desc: 'Rouler les journaux serré autour de chaque avant-bras, scotcher jusqu\'à ce que ça sonne creux. Les dents s\'y cassent.',
  },
  {
    id: 'r_jambieres', cat: 'equipement', nom: 'Jean à jambières',
    resultat: { id: 'jean_genouilleres', qty: 1 },
    ingredients: [{ id: 'jean', qty: 1 }, { id: 'journal_papier', qty: 2 }, { id: 'chiffon', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 20, xp: { construction: 6 }, connue: true,
    desc: 'Du journal plié serré sous le tissu, scotché des genoux aux tibias. Les rampants visent toujours là.',
  },
  {
    id: 'r_gants_renforces', cat: 'equipement', nom: 'Gants renforcés',
    resultat: { id: 'gants_renforces', qty: 1 },
    ingredients: [{ id: 'gants_cuir', qty: 1 }, { id: 'fil_de_fer', qty: 2 }, { id: 'chiffon', qty: 1 }],
    outils: ['coudre'], poste: null, skill: { construction: 1 }, tempsMin: 25, xp: { construction: 10 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { construction: 1 },
    desc: 'Tresser du fil de fer sur les phalanges, coudre une manchette jusqu\'au coude. Les morsures glissent.',
  },
  {
    id: 'r_veste_renforcee', cat: 'equipement', nom: 'Veste renforcée',
    resultat: { id: 'veste_renforcee', qty: 1 },
    ingredients: [{ id: 'veste_cuir', qty: 1 }, { id: 'fil_de_fer', qty: 3 }, { id: 'scotch', qty: 1 }],
    outils: ['coudre'], poste: 'etabli', skill: { construction: 2 }, tempsMin: 40, xp: { construction: 16 },
    connue: false, apprise_par: ['manuel_bricolage'], apprise_niveau: { construction: 3 },
    desc: 'Coudre des renforts dans le cuir, une plaque de fortune sur chaque avant-bras. Lourd sur les épaules, léger sur la conscience.',
  },
  {
    id: 'r_casque_fortune', cat: 'equipement', nom: 'Casque de fortune',
    resultat: { id: 'casque_fortune', qty: 1 },
    ingredients: [{ id: 'casserole', qty: 1 }, { id: 'chiffon', qty: 2 }, { id: 'scotch', qty: 1 }],
    outils: [], poste: null, skill: null, tempsMin: 15, xp: { construction: 6 }, connue: true,
    desc: 'Rembourrer la casserole, scotcher une jugulaire, une visière de bouteille découpée. Tu as l\'air idiot — mais entier.',
  },
  {
    id: 'r_poncho', cat: 'equipement', nom: 'Poncho de pluie',
    resultat: { id: 'poncho_pluie', qty: 1 },
    ingredients: [{ id: 'bache_plastique', qty: 1 }, { id: 'scotch', qty: 1 }],
    outils: ['couper'], poste: null, skill: null, tempsMin: 10, xp: { construction: 3 }, connue: true,
    desc: 'Un trou pour la tête, du scotch aux épaules. La pluie tue plus lentement que les morts, mais elle tue aussi.',
  },
];

export const CATEGORIES_RECETTES = {
  soins: 'Soins', armes: 'Armes', reparation: 'Réparation', nourriture: 'Cuisine & eau',
  lumiere: 'Lumière', survie: 'Survie', recyclage: 'Recyclage', equipement: 'Équipement',
};
export const POSTES = { etabli: 'Établi', feu: 'Feu' };

export function recette(id) { return RECIPES.find(r => r.id === id) || null; }
