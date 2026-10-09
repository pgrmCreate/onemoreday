// ============================================================================
//  RÉGLAGES — tous les nombres « qui se règlent », au même endroit (refonte v3)
// ============================================================================
// Règle d'or : la LOGIQUE vit dans les modules (js/explore, js/travel, js/combat,
// js/game…), les NOMBRES vivent ici. Chaque valeur est commentée avec SON EFFET
// concret. Le raisonnement complet (pourquoi ce chiffre) est dans docs/GAMEPLAY.md,
// section par section — les deux fichiers se répondent.
//
// Unités (toujours précisées) :
//   ms      = millisecondes RÉELLES          s   = secondes réelles
//   min     = minutes DE JEU (1 min de jeu = temps.MS_PAR_MINUTE ms réelles)
//   h       = heures de jeu                  case = 0,8 m (plans d'exploration)
//   jauges  = 0..100, 100 = bien (faim, soif, fatigue) ; PV 0..pvMax ; sta 0..staMax
//
// Endurance (sta) : les débits sont exprimés PAR SECONDE RÉELLE (c'est un geste,
// pas un besoin vital). Faim / soif / fatigue / saignement : PAR MINUTE DE JEU.
// ----------------------------------------------------------------------------

export const REGLAGES = {

  // ===========================================================================
  //  TEMPS — l'horloge du monde
  // ===========================================================================
  temps: {
    MS_PAR_MINUTE: 2381,        // 2 381 ms réelles = 1 minute de jeu → une journée ≈ 57 min réelles
                                //   (encore 30 % plus lent qu'en v3 : 1 667 ms / 0,7).
                                //   ↑ = le monde vieillit moins vite (moins de repas, de piles) ; ↓ = plus pressant.
    DEPART_MINUTES: 480,        // la partie commence le jour 1 à 8 h 00.
    DATE_JOUR1: [2026, 9, 23],  // le jour 1 est le mercredi 23 septembre 2026 (docs/HISTOIRE.md : trois semaines après le Mercredi).
    HEURES: {                   // courbe de lumière (clock.lumiereJour) : 0 la nuit, rampe, 1 le jour
      AUBE: 6,                  //   6 h → la lumière commence à monter
      JOUR: 8,                  //   8 h → plein jour (lumiereJour = 1)
      CREPUSCULE: 19,           //  19 h → la lumière baisse
      NUIT: 21,                 //  21 h → nuit noire (lumiereJour = LUNE)
    },
    LUNE: 0.12,                 // lumière résiduelle d'une nuit dehors (0..1) : on devine les formes à ~3 cases.
    // Vitesse de l'horloge selon ce qu'on fait — SOLO UNIQUEMENT (en co-op le temps
    // coule toujours ×1, sauf sommeil commun). 0 = pause.
    VITESSE_SOLO: {
      exploration: 1,           // temps réel.
      voyage: 2.381,            // en voyage, l'horloge garde l'ancien rythme (1 min de jeu / s) : un trajet ne dure pas
                                //   plus longtemps en vrai qu'avant le ralentissement de l'horloge (×VOYAGE_ACCELERE au choix).
      combat: 1,                // le combat se joue dans l'exploration (plus d'écran séparé) : même vitesse.
      scene: 0,                 // une scène à choix (dialogue) met le monde en pause.
      panneau: 0,               // inventaire / corps / fabrication ouverts : pause en solo (écran plein sur mobile).
    },
    VOYAGE_ACCELERE: 4,         // bouton « Accélérer » du voyage (solo) : ×4.
    FABRICATION_ACCELERE: 10,   // pendant une barre de fabrication (solo), l'horloge tourne ×10 :
                                //   une recette de 30 min dure 5 s réelles (le monde, lui, avance de 30 min).
    SOMMEIL_ACCELERE: 90,       // dormir 8 h dure ~5 s réelles (solo, ou co-op quand les deux dorment).
    ATTENDRE_OPTIONS: [15, 30, 60, 120], // durées proposées par « Attendre » (min), accéléré ×FABRICATION_ACCELERE.
  },

  // ===========================================================================
  //  MÉTÉO — tirée par demi-journée (graine du monde), modifie tout le reste
  // ===========================================================================
  meteo: {
    CHANGE_A: [6, 18],          // la météo est retirée à 6 h et 18 h (seedRng(seed + ':meteo:' + jour + ':' + demi)).
    POIDS: { clair: 40, couvert: 25, mistral: 18, pluie: 12, brouillard: 5, orage: 4 }, // probabilités relatives (la radio les annonce).
    EFFETS: {                   // bruit = multiplicateur des rayons de bruit ; vue = portée de vue (joueur ET morts)
      clair:      { bruit: 1,   vue: 1,   froid: 0, rencontres: 1 },
      couvert:    { bruit: 1,   vue: 0.9, froid: 0, rencontres: 1 },
      mistral:    { bruit: 0.75, vue: 1,  froid: 2, rencontres: 0.9 },  // le vent couvre les pas, glace les os.
      pluie:      { bruit: 0.7, vue: 0.8, froid: 1, rencontres: 0.85, mouille: true }, // mouillé sans imperméable : +1 froid.
      brouillard: { bruit: 1,   vue: 0.5, froid: 1, rencontres: 1.1, surprise: true }, // combats de voyage « surpris ».
      orage:      { bruit: 0.55, vue: 0.7, froid: 2, rencontres: 0.8, mouille: true }, // pluie battante, tonnerre : on n'entend plus rien.
    },
  },

  // ===========================================================================
  //  TEMPS 1 — EXPLORATION (déplacement libre, vue de dessus)
  // ===========================================================================
  exploration: {
    CASE_M: 0.8,                // 1 case = 0,8 m (contrat des plans ASCII).
    // --- ÉTAGÈRES : les longues rangées sont découpées en petites étagères ; la plupart ont été VIDÉES (pillage) :
    //     dessinées vides, on ne peut pas les fouiller. Les garnies se voient (articles dessinés) et se fouillent.
    ETAGERES: {
      SEGMENT: 2,               // une étagère = 2 cases (une rangée de 7 → 2 + 2 + 3).
      VIDES: 0.65,              // part d'étagères vides par défaut…
      PAR_BUTIN: { hypermarche: 0.75, supermarche: 0.75, superette: 0.7, pharmacie: 0.6, bricolage: 0.6, librairie: 0.4 }, // … selon le lieu
    },
    VITESSE: {                  // cases par seconde réelle, joystick poussé à fond.
      marche: 3.2,              //   traverser une pièce de 6 m ≈ 2,3 s.
      course: 5.4,              //   plus rapide que tout mort humain sauf… aucun ; chiens et fauves vont plus vite.
      accroupi: 1.6,            //   lent, presque muet.
    },
    INERTIE_MS: 110,            // temps pour atteindre la vitesse visée (lisse le joystick, évite l'effet savonnette).
    COURSE_STA_S: 12,           // endurance/s en course au niveau 0 : 100 sta ≈ 8 s de sprint (on s'essouffle VITE au début)…
    COURSE_AGILITE: 0.08,       // … −8 % de dépense par niveau d'Agilité (niv 5 : ×0,6 ≈ 14 s ; plancher ×0,45)…
    COURSE_FATIGUE: 0.35,       // … +35 % si tu es fatigué(e) (fatigue < seuil « gêne »), × surpoids (inventaire.SURPOIDS.sta).
    COURSE_STA_MIN: 8,          // en dessous, la course s'arrête (le bouton l'indique : « À bout de souffle »).
    COURSE_REPRISE_MS: 1500,    // après une course, 1,5 s à reprendre ton souffle avant que l'endurance remonte.
    COURSE_XP_S: 12,            // 1 XP d'Agilité toutes les 12 s de course.
    ACCROUPI_VITESSE_AGILITE: 0.05, // +5 % de vitesse accroupie par niveau d'agilité.
    // --- SONS du corps : un pas toutes les « foulée » cases parcourues ; volume par allure ---
    PAS_FOULEE: { marche: 1.8, course: 2.1, accroupi: 1.4 },
    PAS_VOLUME: { marche: 0.22, course: 0.38, accroupi: 0.08 }, // discrets : on les entend sans qu'ils couvrent le monde
    SOUFFLE_SEUIL: 0.45,        // en course sous 45 % d'endurance, on entend le souffle court.
    // --- HORDE lointaine (boucle sonore) : morts du même étage entre DIST_MIN et DIST_MAX cases ---
    // Le dehors entendu depuis un bâtiment : ENTREE à la porte, divisé par e tous les DECROIT unités, jamais sous MIN.
    DEDANS_SON: { ENTREE: 0.12, DECROIT: 1.5, MIN: 0.008, PORTEE: 12 },
    CLOCHES_SOIR: { HEURE: 21 + 10 / 60, FIN_FLAG: 'prologue_fini' }, // les cloches de Maud, chaque soir, jusqu'à la fin du prologue.
    HORDE_SON: { DIST_MIN: 12, DIST_MAX: 80, CALME: 6, FORTE: 18, SALON_DEHORS: true }, // ≥ 6 → gémissements au loin ; ≥ 18 → la ville grouille ; dehors dans Salon : toujours au moins le fond calme.

    // --- BRUIT : rayon (cases) du bruit émis ; les morts dont (distance ≤ rayon × ouïe) l'entendent ---
    BRUIT: {
      marche: 2,                // un pas normal, émis en continu tant qu'on marche.
      course: 6,
      accroupi: 0.5,            // quasi muet : un mort DANS la case voisine peut l'entendre.
      porte: 4,                 // ouvrir / fermer une porte.
      porte_claque: 7,          // fermer une porte en courant.
      fouille: 3,               // par défaut ; varie par meuble (fouille.BRUIT), émis chaque seconde.
      combat: 8,                // émis à chaque seconde de combat (renforts : voir combat.RENFORTS).
      tir: 25,                  // coup de feu (arbalète : 0 → rayon 2, le claquement de la corde).
      porte_forcee: 10,         // pied-de-biche sur une porte verrouillée.
      vitre: 12,                // vitre brisée.
      barricade: 6,             // clouer (par seconde de travail).
      demonter: 6,              // démonter un meuble pour des planches (par seconde).
      chute: 5,                 // objet lâché, canette dans laquelle on shoote.
      toux: 5,                  // rhume (voir survie.MALADIES.rhume).
      vomir: 3,                 // intoxication.
    },
    BRUIT_SOL: {                // multiplicateur du bruit de PAS selon le sol de la pièce
      moquette: 0.6, parquet: 1.1, carrelage: 1, lino: 0.9, tomettes: 1, beton: 1,
      terre: 0.8, herbe: 0.8, gravier: 1.5, debris: 2.5,   // débris / verre (case ';') : on les entend craquer.
    },
    BRUIT_DISCRETION: 0.1,      // −10 % sur tous les bruits du joueur par niveau de Discrétion (max −50 %).
    ATTENUATION: {              // un bruit qui traverse un obstacle porte moins loin
      mur: 0.4,                 //   à travers un mur : rayon × 0,4.
      porte_fermee: 0.6,        //   à travers une porte fermée : rayon × 0,6.
    },

    // --- UN MORT APPROCHE : menus, plan, placement, chantier et fouille se ferment (js/explore/vue.js, alerteMort) ---
    ALERTE: {
      CHASSE: 9,                // un mort vu qui te chasse, à moins de 9 cases.
      PROCHE: 3.5,              // un mort vu, même tranquille, à moins de 3,5 cases.
      OUBLI_MS: 6000,           // un mort déjà signalé ne recoupe pas avant d'avoir disparu 6 s.
    },

    // --- PERCEPTION DES MORTS ---
    PERCEPTION: {
      CONE_DEG: 100,            // cône de vue des morts (degrés).
      VUE_LUMIERE: { eclaire: 1, penombre: 0.55, noir: 0.2 }, // × portée `vue` du mort selon la lumière SUR LE JOUEUR.
      LAMPE_ALLUMEE: 1.8,       // un joueur lampe allumée est vu de (vue × 1,8), même dans le noir, s'il est dans le cône.
      FAISCEAU_VU: 2.0,         // un mort DANS le faisceau de la lampe la voit à vue × 2 (on éclaire, on appelle).
      // La lampe réveille (docs/RETOURS_JOUEUR.md §4.3) : un faisceau braqué sur un mort à ≤ portee unités le « touche »,
      // même de dos (il voit la lumière) : il compte comme dans son champ de vision. Un mort ENDORMI éclairé ainsi se
      // réveille après ms de faisceau cumulé ; hors du faisceau, le compteur redescend de oubliParS secondes par seconde.
      FAISCEAU_REVEIL: { portee: 3.5, ms: 1500, oubliParS: 0.5 },
      ACCROUPI: 0.6,            // accroupi : on est vu de 60 % de la distance.
      DISCRETION_VUE: 0.06,     // −6 % de portée de vue des morts par niveau de Discrétion.
      DETECTION_MS: { pres: 350, loin: 2200 }, // temps de repérage : de 350 ms (collé) à 2,2 s (au bout de la vue).
                                // Un « ? » se remplit au-dessus du mort : on peut se cacher avant qu'il ne soit plein.
      DETECTION_OUBLI_S: 0.5,   // le « ? » se vide à 50 %/s quand on sort de son champ.
      MEMOIRE_MS: 9000,         // en chasse sans nous voir : il va à la dernière position connue et fouille 9 s.
      ALERTE_MS: 12000,         // alerté par un bruit : il y va, reste 12 s, puis retourne errer.
      OUIE_JOUEUR: 8,           // le JOUEUR « entend » un mort hors de vue à ≤ 8 cases (onde d'indicateur), 12 s'il grogne en chasse.
      CONTACT_CASES: 0.7,       // contact → Temps 3.
      REJOINDRE_CASES: 4,       // au déclenchement du combat, les morts EN CHASSE à ≤ 4 cases rejoignent la file.
      RENFORT_PENDANT_COMBAT: true, // un mort qui arrive au contact pendant un combat rejoint la file (le bruit du combat attire).
    },
    // Menace de départ du premier mort quand le combat s'ouvre (voir combat.MENACE_DEPART).
    // → « engage » (tu attaques), « normal » (il t'atteint de face), « surpris » (de dos / hors champ).

    // --- ATTAQUE FURTIVE (le prix de la patience) ---
    FURTIF: {
      MULT: 3,                  // attaquer un mort non alerté (dort / immobile / erre sans t'avoir vu) : 1er coup ×3.
      SILENCIEUX: true,         // si ce coup tue (dégâts ≥ PV), pas de combat : mise à mort silencieuse (bruit 1).
      DOS_DEG: 70,              // « non alerté » + angle joueur/regard du mort > 70° : garanti. Sinon il se retourne (combat normal).
      XP_DISCRETION: 6,
    },

    // --- ARRIVÉES : des morts entrent par les bords de la carte (les sorties, là où l'on fuit) ---
    // Chaque seconde, chance = taux / 60, avec taux (morts par minute réelle) = CONTEXTE × (DANGER_MIN + danger du lieu)
    // × NUIT (la nuit) × difficulté (mortsLieux) × COOP (à deux). Le contexte est le plus fort du moment :
    //   ALARME  une alarme de voiture hurle (ils viennent vers elle, alertés, du côté de la carte le plus proche) ;
    //   RUEE    les sirènes ou une horde sont sur le lieu ;
    //   BRUIT   un gros bruit récent (≥ BRUIT_FORT cases : vitre, coup de feu, porte forcée…) pendant BRUIT_MS ;
    //   CALME   le reste du temps : un mort qui passe de temps en temps.
    // Jamais à moins de DIST_JOUEUR unités d'un joueur, ni à sa vue (à moins de VUE unités sans obstacle entre eux).
    // Hors alarme, plus d'arrivée quand les morts présents atteignent PLAFOND × (ceux qu'il y avait à ton arrivée, ou les
    // morts max du lieu, au moins PLANCHER) : tuer les morts d'un quartier en fait venir d'autres, sans fin mais sans déluge.
    // Une alarme fait venir au plus ALARME_MAX[0] (danger 0) à ALARME_MAX[1] (danger 1) morts.
    // Ordres de grandeur (danger 0,5, de jour) : alarme de 45 s ≈ 3 à 4 morts ; un coup de feu ≈ 1 mort sur 2 ;
    // au calme ≈ 3 morts par heure réelle passée dans le lieu.
    ARRIVEES: {
      CALME: 0.06, BRUIT: 0.6, RUEE: 2.5, ALARME: 6,
      DANGER_MIN: 0.3, NUIT: 1.4, COOP: 1.2,
      BRUIT_FORT: 10, BRUIT_MS: 60000,
      PLAFOND: 1.2, PLANCHER: 3, ALARME_MAX: [2, 8],
      DIST_JOUEUR: 12, VUE: 24,
      ALERTE_MS: 30000,         // un mort arrivé à cause du bruit va jusqu'au bruit (30 s, ou toute la durée de l'alarme).
    },

    // --- VOITURES fermées à clé (js/data/voitures.js : part fermée et chance d'alarme par modèle) ---
    VOITURES: {
      VITRE_MS: 1600,           // casser une vitre (coude, crosse, outil) : 1,6 s, bruit BRUIT.vitre (12) d'un coup.
      COUPURE_MAINS_NUES: 0.35, // sans rien en main (le coude dans un vêtement) : 35 % de s'entailler la main sur le verre.
      FORCER: { MS: 7000, BRUIT_S: 2, ALARME_MULT: 0.4, OUTIL: 'forcer' }, // pied-de-biche dans la portière : lent, discret,
                                // et l'alarme ne se déclenche qu'une fois sur 2,5 par rapport à la vitre.
      ALARME: { MS: 45000, PERIODE_MS: 1000, RAYON: 30, SON_MS: 2100, APPEL: 100, APRES_MS: 20000 }, // l'alarme hurle 45 s :
                                // chaque seconde un bruit de 30 cases, et TOUS les morts à ≤ 100 unités (murs ou pas, même
                                // endormis) marchent vers la voiture, jusqu'à 20 s après la fin ; on l'entend à 40 cases.
    },

    // --- PORTES & VERROUS ---
    PORTES: {
      PV: 60,                   // PV d'une porte intérieure fermée.
      PV_BARRICADEE: 180,       // porte barricadée (planches + clous).
      PV_EXTERIEURE: 120,       // porte d'entrée / métallique.
      COGNE_PERIODE_MS: 1500,   // un mort qui cogne frappe toutes les 1,5 s (dégâts : zombies.cogne).
      FORCER_MS: 5000,          // forcer au pied-de-biche : 5 s, bruit porte_forcee, −2 dur de l'outil. −10 %/niv de Force.
      CROCHETER_MS: 9000,       // crocheter (crochets_serrure) : 9 s, bruit 1. −12 %/niv de Mécanique. Échoue si Méca < verrou.meca.
      BARRICADER_MIN: 20,       // barricader une porte (planche ×2, clous ×4, outil marteler) : 20 min (fabrication accélérée).
    },

    // --- DÉMONTER LE MOBILIER (source de planches) ---
    DEMONTER: {                 // outil requis : 'marteler' ou 'forcer'. Durée réelle, bruit BRUIT.demonter/s.
      chaise: { planche: 1, ms: 4000 },
      table:  { planche: 2, ms: 7000 },
      lit:    { planche: 2, ressort: 1, ms: 9000 },
      etagere:{ planche: 2, ms: 8000 },
    },

    // --- REPEUPLEMENT (le monde se remplit quand on n'y est pas) ---
    REPEUPLEMENT: {
      // Au retour dans un lieu : nouveaux morts = floor(lieu.repeuplement × jours d'absence × mult(nuit) + reste graine),
      // plafonnés à (lieu.morts.n[1] − morts vivants restants). Placés loin de l'entrée, dans les pièces sombres d'abord.
      NUIT: 1.5,                // on revient de nuit : × 1,5.
      DELAI_MIN_H: 6,           // rien ne revient avant 6 h d'absence.
      BARRICADE: 0,             // une pièce entièrement barricadée n'est jamais repeuplée.
    },
    // --- POINTS D'EAU (l'eau croupie s'obtient ici ; l'eau propre se fabrique : bouillir / filtrer) ---
    // Il faut un contenant (bouteille, gourde, jerrican, casserole, canette) ; « Remplir » depuis le sac, à côté du point d'eau.
    // Meubles : réserve tirée de la graine (même chose chez les deux joueurs) — p = chance qu'il en reste, sinon « plus rien
    // ne coule » ; L = litres au mieux (tirés entre 50 et 100 %). Une fois vidée, la réserve ne revient pas.
    EAU: {
      wc:        { L: 1.5, p: 0.8 },   // le réservoir de la chasse d'eau.
      baignoire: { L: 5,   p: 0.3 },   // 30 % des baignoires ont été remplies avant la coupure.
      lavabo:    { L: 0.5, p: 0.4 },   // salle de bain : fond de tuyauterie.
      evier:     { L: 0.5, p: 0.4 },   // meuble 'cuisine' : fond de tuyauterie.
      fontaine:  { L: null, p: 1 },    // fontaine, puits, meuble marqué eau, cases d'eau (rivière, canal, étang, lac) : inépuisable.
      PORTEE: 1.6,              // distance (m) au point d'eau pour pouvoir remplir.
    },
    // --- PÊCHE, COLLETS (marqueurs de niveau 'eau' / 'terrier', ou rencontres) ---
    CHASSE_PECHE: {
      PECHER_MIN: 30,           // canne à pêche : 30 min (accéléré), prise = 0,35 + 0,1 × Chasse (+0,2 avec un appât consommé).
      PECHE_BASE: 0.35, PECHE_NIVEAU: 0.1, PECHE_APPAT: 0.2,
      NASSE_H: 6, NASSE_P: 0.6, // nasse posée : relevée après 6 h, 60 % d'un poisson (1-2).
      COLLET_H: 8, COLLET_P: 0.4, COLLET_NIVEAU: 0.1, // collet posé : relevé après 8 h, 40 % + 10 %/niv → viande_crue.
      DEPECER_MIN: 20,          // dépecer un animal tué (sanglier) : 20 min ; viande × (1 + 0,2 × Chasse).
    },
    INTERACTION_CASES: 1.2,     // portée des interactions (dans le champ de vision).
    LANCER_PORTEE_MAX: 10,      // portée max d'un lancer (cases) ; chaque objet a sa portée (items.jet.portee).
  },

  // ===========================================================================
  //  FOUILLE — en temps réel, interruptible, butin révélé au fil de la barre
  // ===========================================================================
  fouille: {
    DUREE_S: {                  // durée d'une fouille COMPLÈTE d'un meuble d'UNE case (s réelles)
      table: 2, poubelle: 2.5, canape: 3, frigo: 3, caisse: 3, lit: 3.5, salle_de_bain: 3.5,
      comptoir: 4, etagere: 4, bureau: 4.5, vetements: 5, cuisine: 5, machine: 6, voiture: 7,
      defaut: 4,
    },
    PAR_CASE_S: 0.8,            // + 0,8 s par case de meuble au-delà de la première (un rayonnage 'ssss' = 4 + 2,4 s).
    TIRAGES: 1,                 // nombre de passes sur la table de butin pour un meuble d'1 case…
    TIRAGES_PAR_CASE: 0.5,      // … + 0,5 passe par case en plus (arrondi au supérieur : 'ssss' → 3 passes)…
    TIRAGES_MAX: 3,             // … jamais plus de 3 passes, même pour un rayonnage de 10 cases (sinon un supermarché = un entrepôt).
    SANS_LUMIERE: { duree: 1.5, chance: 0.75 }, // à tâtons (pièce noire, pas de lampe) : ×1,5 plus long, p × 0,75.
    BRUIT: {                    // rayon du bruit émis CHAQUE SECONDE de fouille (cases), avant Discrétion
      defaut: 3, voiture: 5, poubelle: 3.5, caisse: 4, machine: 4, cuisine: 3.5,
      lit: 2, canape: 2, vetements: 2, table: 2, salle_de_bain: 2.5,
    },
    REVELATION: 'progressive',  // les objets apparaissent aux fractions (i+1)/(n+1) de la barre : interrompre garde l'acquis.
    AIDE_COOP: 1.6,             // deux joueurs sur le même meuble : barre × 1,6 plus rapide.
    ABONDANCE: { base: 0.85, parDanger: 0.5 }, // p × (0,85 + 0,5 × danger du lieu) : le danger paie (0,2 → ×0,95 ; 0,8 → ×1,25).
    JOUR_NOURRITURE: [          // la nourriture fraîche (frigo) pourrit : p × facteur selon le jour
      { jourMin: 1, frigo: 1 }, { jourMin: 3, frigo: 0.6 }, { jourMin: 6, frigo: 0.3 },
    ],
  },

  // ===========================================================================
  //  LUMIÈRE — sources, piles, visibilité
  // ===========================================================================
  lumiere: {
    // forme 'cone' (orientable) ou 'halo' (cercle) ; portee en cases ; angle en degrés ;
    // minParCharge = minutes de jeu d'autonomie par charge (paire de piles, dose d'huile…) ;
    // mains = 1 si elle occupe la main libre (incompatible avec une arme à deux mains) ;
    // visibleDe = portée (cases) à laquelle les morts voient la flamme / le faisceau dans le noir.
    SOURCES: {
      lampe_torche:           { forme: 'cone', angle: 60, portee: 9, minParCharge: 600, charge: 'piles', mains: 1, visibleDe: 14 },
      lampe_frontale:         { forme: 'cone', angle: 70, portee: 7, minParCharge: 480, charge: 'piles', mains: 0, visibleDe: 12 },
      lampe_frontale_fortune: { forme: 'cone', angle: 50, portee: 7, minParCharge: 600, charge: 'piles', mains: 0, visibleDe: 12 },
      lampe_huile:            { forme: 'halo', portee: 4, minParCharge: 300, charge: 'huile_olive', mains: 1, visibleDe: 12 },
      torche:                 { forme: 'halo', portee: 5, minParCharge: 150, charge: null, mains: 1, visibleDe: 20 }, // se consume puis disparaît.
      feu_camp:               { forme: 'halo', portee: 6, minParCharge: 120, charge: null, mains: 0, visibleDe: 25 }, // posé au sol.
      fusee_detresse:         { forme: 'halo', portee: 8, minParCharge: 20,  charge: null, mains: 0, visibleDe: 40 }, // lancée.
      cocktail_molotov:       { forme: 'halo', portee: 5, minParCharge: 1,   charge: null, mains: 0, visibleDe: 25 }, // flaque qui brûle ~60 s.
    },
    // ≈ 10 min réelles de lampe par paire de piles : il en faut 2-3 pour un grand bâtiment sombre.
    PIECE_SOMBRE: { 0: 1, 1: 0.45, 2: 0 },  // lumière ambiante d'une pièce selon `sombre` (0 fenêtres, 1 pénombre, 2 noir), × lumiereJour.
    SEUILS: { penombre: 0.25, eclaire: 0.6 }, // lumière reçue par une case : < 0,25 = noir, < 0,6 = pénombre, sinon éclairé.
    VISION_JOUEUR: {            // portée de vue du joueur (cases) selon la lumière de la case regardée
      eclaire: 16, penombre: 6, noir: 1.5,  // dans le noir on devine ses mains ; les morts à 1,5 case se voient.
    },
    SOUVENIR: true,             // ce qui a été vu reste affiché en gris (sans les morts).
    FENETRE_PORTEE: 5,          // une fenêtre éclaire le sol jusqu'à 5 cases dans la pièce (× lumiereJour).
  },

  // ===========================================================================
  //  TEMPS 2 — VOYAGE (carte illustrée → écran de voyage à rencontres)
  // ===========================================================================
  voyage: {
    ALLURES: {
      // kmh : vitesse de base ; rencontres : × du taux de rencontres par km ;
      // fatigue : × usure de fatigue pendant le trajet ; staParMin : endurance perdue par minute de jeu ;
      // distance : part des rencontres HOSTILES qu'on « distance » (converties en ambiance) grâce à la vitesse.
      discrete: { kmh: 3, rencontres: 0.55, fatigue: 0.8, staParMin: 0,   distance: 0,    nom: 'Discrète' },
      normale:  { kmh: 5, rencontres: 1,    fatigue: 1,   staParMin: 0,   distance: 0,    nom: 'Normale' },
      rapide:   { kmh: 8, rencontres: 1.25, fatigue: 1.8, staParMin: 0.6, distance: 0.25, nom: 'Rapide' },
    },
    FACTEUR_DETOUR: { salon: 1.25, region: 1.2 }, // si l'itinéraire n'est pas routé : distance = vol d'oiseau × facteur.
    MALUS_VITESSE: {
      surpoids: 0.7,            // vitesse × lerp(1, 0,7, facteur de surpoids 0..1).
      jambe: { 2: 0.85, 3: 0.7, 4: 0.55 }, // pire blessure NON soignée à une jambe (gravité 2 = entaille…). Attelle/suture : ignorée.
      fatigue: 0.85,            // fatigue < 25.
      nuit: 0.9,
      pluie: 0.9,
      coop: 'min',              // à deux : on avance à la vitesse du plus lent.
    },
    RENCONTRES: {
      PAR_KM: { salon: 0.6, region: 0.17 }, // espérance de rencontres par km à danger 0,5 (× facteur danger 1,2), jour, allure normale, solo :
                                           //   ville ≈ 0,7/km (un trajet de 900 m : une rencontre une fois sur deux),
                                           //   région ≈ 0,2/km (Salon → Pélissanne, 5 km : une rencontre).  Voir GAMEPLAY §3.3.
      DANGER: { base: 0.4, pente: 1.6 },   // facteur danger = 0,4 + 1,6 × d  (d = 0 → ×0,4 ; 0,5 → ×1,2 ; 1 → ×2).
      DANGER_DEFAUT: { salon: 0.25, region: 0.12 }, // danger hors de toute zone (rues calmes, campagne).
      ECHANTILLON_M: { salon: 50, region: 250 }, // on lit la zone traversée tous les 50 m (ville) / 250 m (région).
      NUIT: 1.5, CREPUSCULE: 1.2,          // × taux la nuit / au crépuscule (l'heure de DÉPART fait foi).
      SAIGNEMENT: 1.2,                     // × si le joueur saigne (odeur : chiens, fauves).
      MAX: { salon: 3, region: 5 },        // plafond de rencontres par trajet.
      ESPACEMENT_M: { salon: 180, region: 1200 }, // écart minimal entre deux rencontres.
      FENETRE: [0.12, 0.92],               // les rencontres tombent entre 12 % et 92 % du trajet (jamais sur le seuil).
      DEMI_TOUR: 0.5,                      // retour après demi-tour : taux × 0,5 (on connaît le chemin).
      HOSTILE: ['combat', 'choix'],        // types comptés comme « hostiles » pour le risque (un 'choix' est hostile si sa rencontre a hostile:true).
    },
    // Jauge de risque (5 crans) = espérance du nombre de rencontres HOSTILES sur le trajet.
    RISQUE_CRANS: [0.2, 0.45, 0.8, 1.3],   // < 0,2 → 1 cran (« calme ») ; < 0,45 → 2 ; < 0,8 → 3 ; < 1,3 → 4 ; sinon 5 (« suicidaire »).
    RAISONS_SEUILS: {                       // raisons affichées sous la jauge (dans cet ordre, 2 max)
      zone: 0.6,                            //   une zone traversée a danger ≥ 0,6 → « quartier infesté » / « {nom de zone} ».
      nuit: true,                           //   départ de nuit → « de nuit ».
      allure: 'rapide',                     //   → « allure rapide : on t'entend venir ».
      coop: true,                           //   → « à deux, on se fait remarquer ».
      saigne: true,                         //   → « tu saignes ».
    },
    JUMELLES: { reperer: 1 },  // avec des jumelles, la 1re rencontre hostile est révélée sur l'itinéraire avant le départ.
    DETOUR_REPERE_M: { salon: 250, region: 1500 }, // contourner une rencontre repérée coûte ces mètres.
    FIN_DE_TRAJET_STA: 0,      // (réservé) sta perdue à l'arrivée.
  },

  // ===========================================================================
  //  COMBAT — en temps réel, DANS l'exploration (refonte « combat 2 »)
  // ===========================================================================
  // Ce que voit et fait le joueur :
  //   FRAPPER  appui court = coup rapide ; enchaîner 3 appuis en rythme = enchaînement (le 3e frappe fort et renverse) ;
  //            maintenir = coup chargé (anneau), relâcher = coup lourd qui fait vaciller et INTERROMPT une attaque.
  //            Un coup qui part TOUCHE si le mort est dans l'arc au moment de l'impact : AUCUN raté au hasard.
  //   POUSSER  repousse tout ce qui est devant, annule leurs attaques ; chance de les mettre à terre.
  //   PAS D'ESQUIVE : on évite un coup en RECULANT hors de sa portée, en le POUSSANT, ou en l'INTERROMPANT.
  //   ACHEVER  frapper un mort à terre = coup de grâce (dégâts × 2,2, toujours critique).
  // Ce que font les morts au contact : ils s'approchent → TÉLÉGRAPHIENT (bras levés + arc au sol : rouge = coup,
  // ambre = empoignade) → se FENDENT vers toi (courte ruée) → le coup porte à la fin de la fente si tu es encore devant →
  // ils récupèrent (`cadence`). Au plus JETONS morts attaquent la même personne en même temps : les autres tournent autour.
  combat: {
    // --- Les morts au corps à corps ---
    ARRET_CASES: 0.75,          // un mort en chasse s'arrête à 0,75 case de toi (centre à centre) : il ne te traverse pas.
    TOLERANCE_PORTEE: 0.3,      // au bout de la fente, il touche jusqu'à sa portée + 0,3 case…
    CONE_ATTAQUE_DEG: 110,      // … et seulement si tu es dans le cône de 110° devant lui.
    PIVOT_TELEGRAPHE: 3,        // rad/s : il te suit des yeux en armant son coup (un pas de côté rapide le déborde).
    TELEGRAPHE_MIN_MS: 450,     // aucune télégraphie ne descend sous 450 ms, quoi qu'il arrive (difficulté…).
    FENTE: { MS: 150, CASES: 0.45 }, // la fente : il se jette de 0,45 case en 150 ms ; le coup est jugé à la fin.
    PREMIERE_ATTAQUE_MS: [300, 700], // arrivé au contact, il attend 0,3 à 0,7 s avant sa première télégraphie.
    SURPRIS_MS: 150,            // attaqué de dos (hors de ton champ) : il arme presque aussitôt.
    JETONS: 2,                  // au plus 2 morts arment un coup contre la même personne en même temps…
    TOURNE_CASES: 1.35,         // … les autres attendent leur tour à 1,35 case, en tournant autour de toi.
    EQUILIBRE: {                // chaque mort a un « équilibre » : tes coups l'entament, à 0 il VACILLE (attaque annulée).
      PAR_PV: 0.7,              // équilibre = 0,7 × ses PV max (un colosse : 0,7 × 120 = 84).
      RECUP_S: 8,               // il le récupère en entier en 8 s sans être frappé.
    },
    FLINCH_MS: 140,             // un coup rapide qui touche un mort en train d'armer RETARDE son attaque de 0,14 s.

    // --- Tes coups ---
    PORTEE: [1.1, 1.45, 1.85],  // portée d'un coup (cases) selon l'allonge de l'arme 0 / 1 / 2.
    ARC_DEG: [110, 130, 70],    // arc couvert : court = 110°, moyen = 130° (balayage), long = 70° (estoc).
    CIBLES_MAX: [1, 2, 1],      // morts touchés par un coup : les armes moyennes balaient (2), les autres 1.
    IMPACT: 0.35,               // le coup porte à 35 % du geste (le reste : on ramène l'arme).
    TOLERANCE_ARC_CASES: 0.3,   // marge de portée (le mort est un corps, pas un point) ; protège aussi du décalage réseau.
    RECUL: { rapide: 0.28, lourd: 1.1 }, // recul (cases) d'un mort touché ; × (1 − résistance).
    RECUL_MS: 170,              // durée du recul.
    COMBO: {                    // enchaînement : appuyer de nouveau dans la fenêtre après l'impact
      FENETRE_MS: 420,          // fenêtre pour enchaîner (après l'impact du coup précédent).
      DEGATS: [1, 1.1, 1.5],    // dégâts du 1er, 2e, 3e coup.
      EQUILIBRE: [1, 1.25, 2.4],// entame d'équilibre du 1er, 2e, 3e coup (le 3e fait presque toujours vaciller).
      RECUL: [1, 1.1, 2.6],     // recul × …
      TERRE: 0.3,               // le 3e coup a 30 % de chances de mettre à terre (× (1 − résistance)).
    },
    CHARGE: {
      FACTEUR_DUREE: 1.5,       // temps de charge pleine = vitesse de l'arme × 1,5 (couteau 0,6 s, batte 0,93 s, masse 1,5 s).
      TAPE_MS: 170,             // un appui plus court = coup rapide.
      STA_MULT_PLEIN: 2.5,      // coût d'un coup chargé plein = sta de l'arme × 2,5.
      SEUIL_INTERRUPTION: 0.5,  // un coup chargé ≥ 50 % qui TOUCHE un mort qui télégraphie annule son attaque.
      SEUIL_LOURD: 0.9,         // ≥ 90 % = « coup lourd » : vacillement plein, recul lourd, usure 2.
      TERRE: 0.45,              // un coup lourd met à terre 45 % du temps (× (1 − résistance)).
      VITESSE: 0.5,             // on marche à 50 % en chargeant…
    },
    VITESSE_GESTE: 0.4,         // … et à 40 % pendant un coup.
    COUP: {
      STAGGER_RAPIDE: 0.3,      // (tir) chance de vaciller d'une balle × stagger de l'arme.
      CRIT_MULT: 2,             // critique (tête) : dégâts × 2.
      USURE: 1, USURE_LOURD: 2, // durabilité perdue par coup qui porte (lourd : 2).
      DUREE_LENTEUR_EPUISE: 1.5,// essoufflé : chaque geste dure × 1,5.
    },
    ACHEVER: { MULT: 2.2, PORTEE: 1.35 }, // un mort à terre devant toi : coup de grâce, × 2,2 et critique.
    HITSTOP_MS: { rapide: 45, combo: 70, lourd: 95, achever: 120, tue: 80 }, // micro-arrêt de l'image à l'impact (sensation de choc).
    VISEE_AUTO: { PORTEE: 2.8, ANGLE_DEG: 85 }, // tactile : en frappant, tu te tournes vers le mort le plus menaçant à ≤ 2,8 cases
                                // dans ±85° de ton regard (sinon, n'importe lequel à ≤ 1,4 case).
    TOUCHER: {                  // (armes de tir et attaques de scène uniquement : la mêlée ne rate JAMAIS au hasard)
      BASE: 0.9, PAR_NIVEAU: 0.03, MIN: 0.5, MAX: 0.98,
      ESSOUFFLE: -0.1, EPUISE: -0.08, NOIR: -0.15, DOULEUR_60: -0.05, DOULEUR_80: -0.1, SURPOIDS: -0.1,
    },
    DEGATS: {                   // dégâts = jet(dmg) × charge × enchaînement × (1 + PAR_NIVEAU × niv) × crit × états × armure
      PAR_NIVEAU: 0.06,         // +6 % par niveau de la compétence de l'arme (niveau 5 : +30 %).
      AFFAME: 0.85,             // faim < 15.
      USEE: 0.8, SEUIL_USEE: 0.2, // arme à < 20 % de durabilité : dégâts × 0,8.
    },
    CRIT: {
      PAR_DEXTERITE: 0.02,      // + 2 % de critique par niveau de Dextérité (toutes armes).
      CHARGE: 0.15,             // + 15 % × charge.
      VACILLE: 0.2,             // + 20 % contre un mort qui vacille.
    },
    VACILLER: {
      MS: 850,                  // un mort qui vacille : il titube 0,85 s, son attaque est annulée.
      RESISTANCE_INTERRUPTION: 0.75, // au-delà (colosse), un coup lourd n'interrompt que s'il casse son équilibre.
    },
    A_TERRE: {
      MS: 2200,                 // un mort à terre : 2,2 s au sol (le temps de l'achever)…
      DEGATS: 1.5,              // … tes coups ×1,5…
      CRIT: 0.25,               // … +25 % de critique.
    },

    // --- Défense ---
    POUSSEE: {                  // clic droit / Espace (PC) / bouton Pousser : repousse tout ce qui est devant toi.
      PORTEE: 1.5, ARC_DEG: 140,
      RECUL: 1.25,              // cases ; × (1 − résistance).
      VACILLE_MS: 850,          // les morts poussés vacillent (attaque annulée)…
      TERRE_BASE: 0.2,          // … chance de mise à terre : 0,2 + 0,05 × Force − 0,5 × résistance.
      TERRE_PAR_FORCE: 0.05,
      RESISTANCE_BLOQUE: 0.75,  // résistance ≥ 0,75 (colosse) : « il ne bouge pas ».
      STA: 7, COOLDOWN_MS: 750, GESTE_MS: 300,
    },
    EMPOIGNADE: {               // il t'agrippe : marteler Frapper ou Pousser avant la fin de l'anneau
      MS: 2400,                 // compte à rebours…
      MARGE_TACTILE_MS: 300,    // … + 300 ms sur tactile.
      TAPS_MIN: 3,              // jamais moins de 3 martèlements.
      FORCE_PAR_TAP: 2,         // 1 martèlement de moins tous les 2 niveaux de Force…
      MAINS_NUES_BONUS: 1,      // … et 1 de moins si Mains nues ≥ 3.
      STA_PAR_TAP: 1.5,         // chaque martèlement coûte 1,5 sta ; à 0 sta, il compte pour moitié.
      MORSURE_DEGATS: 1.2,      // raté : morsure, dégâts = dmg max × 1,2, blessure 'morsure' (seule source de morsure).
      AUTRES_ATTENDENT: true,   // pendant une empoignade, les autres morts ne frappent pas la même personne.
      AIDE_COOP: 2,             // à deux : un coup ou une poussée de ton coéquipier sur le mort qui te tient compte pour 2 martèlements.
    },
    BOUSCULE: { CASES: 1.4 },   // la charge d'un colosse qui te percute te projette de 1,4 case.

    // --- Tir ---
    TIR: {
      CONE_DEG: 24,             // un tir part vers ta visée ; il touche le premier mort dans ce cône (portée de l'arme).
      PORTEE: [6, 9, 12],       // portée (cases) selon tir.portee 0 / 1 / 2.
      VISEE_MS: 900,            // rester immobile en visant (PC : souris immobile, tactile : maintenir) : précision pleine en 0,9 s…
      VISEE_PAR_NIVEAU: 60,     // … −60 ms par niveau de Visée.
      HANCHE: 0.6,              // tirer sans viser garde 60 % de la précision.
      PREC_PAR_NIVEAU: 0.04,
      CRIT_VISEE: 0.25,         // critique = crit de l'arme + 0,25 × visée (tête).
      STA: 3,
      RECHARGE_PAR_NIVEAU: 0.06,// recharge −6 %/niveau de Visée.
      ARMURE_EFFICACE: 0.5,     // une armure de mort ne compte que pour moitié contre une balle.
      CRITIQUE_MIN: 0.05,
    },
    BRUIT_ARME: [1.5, 3, 8, 25], // bruit (cases) d'un coup qui porte selon le `bruit` de l'arme 0..3 (tir : 25).
    // Attaquer fait du bruit (le choc, le souffle, le corps qui tombe contre un meuble) : jamais moins de MIN cases quand le
    // coup porte, VIDE cases quand il fend l'air. ACCROUPI : frapper accroupi(e) ne fait AUCUN bruit, mais le coup est
    // retenu (× DEGATS). Une mise à mort furtive reste silencieuse dans tous les cas.
    BRUIT_ATTAQUE: { MIN: 4, VIDE: 2.5 },
    ACCROUPI: { DEGATS: 0.7 },
    // --- Endurance ---
    ENDURANCE: {
      SEUIL_ESSOUFFLE: 15,      // sta < 15 : ESSOUFFLÉ(E) — les coups partent quand même, ×0,6 dégâts, ×1,5 durée.
      ESSOUFFLE_DEGATS: 0.6,
      MIN_ACTION: 4,            // sous 4 d'endurance : plus de coup, plus de poussée (et plus de course : exploration.COURSE_STA_MIN).
                                // Seule la lutte pour se dégager d'une empoignade reste possible : on se débat jusqu'au bout.
    },
    MAINS_NUES: {               // « arme » par défaut quand la main est vide
      nom: 'Mains nues', dmg: [3, 6], vitesse: 380, sta: 4, allonge: 0, charge: 1.5,
      stagger: 0.15, crit: 0.05, skill: 'mainsNues', bruit: 0,
      PAR_NIVEAU_DEGATS: 1,     // + 1 dégât min et max par niveau de Mains nues (en plus du +6 %).
      A_TERRE_MULT: 2,          // piétiner un mort à terre à mains nues : ×2 au lieu de ×1,5.
    },
    // --- Blessures infligées par une attaque qui porte ---
    BLESSURES: {
      // type d'attaque (zombies.attaques[].type) → blessure. 'haut' = le jet de dégâts est dans le tiers supérieur.
      griffure: { defaut: 'egratignure', haut: 'entaille', max: 'profonde' },  // 'max' si blessureMax ≥ 3 et jet au max.
      coup:     { defaut: 'contusion',   haut: 'contusion', fracture: 'fracture' }, // fracture : si zombie.fracture.
      morsure:  { defaut: 'morsure' },                                          // uniquement via empoignade ratée.
      morsure_animale: { defaut: 'entaille', haut: 'morsure' },
    },
    PROTECTION: {
      REDUC_PAR_POINT: 2,       // chaque point de protection de la ZONE touchée retire 2 dégâts (min 1).
      MORSURE_BLOQUEE: 0.3,     // chance que les dents ne passent pas : 0,3 × protection → contusion.
      GRIFFURE_SEUIL: 2,        // protection ≥ 2 : une griffure devient une simple contusion.
      GRIFFURE_ALLEGE: 1,       // protection 1 : une entaille devient égratignure.
    },
    FUITE: { REPOUSSE_CASES: 4, ETOURDI_MS: 3000 }, // (scènes) morts repoussés et étourdis quand une scène te fait fuir.
    FIN_FUITE: { DISTANCE: 14, MS: 4000 }, // combat de scène : à ≥ 14 cases de tous pendant 4 s, tu leur as échappé.
    XP: {                       // gains d'expérience en combat
      touche: 2, tue: 5,        // compétence de l'arme
      poussee: 1,               // force
      empoignade: 4,            // force (dégagé)
      tir: 3,                   // visée, par tir qui touche
      charge_lourde: 2,         // force, par coup lourd
    },
  },

  // ===========================================================================
  //  SURVIE — besoins, corps, blessures, maladies
  // ===========================================================================
  survie: {
    PV_MAX: 100, STA_MAX: 100,
    // --- Besoins (par minute de jeu) ---
    FAIM_PAR_MIN: 0.035,        // 100 → 0 en 48 h (≈ 50 points par jour : un bon repas + un en-cas).
    // --- Repas : PAS de « +30 ». La faim est un ÉTAT (rassasié·e, un creux, faim, affamé·e) ; chaque aliment a ses calories
    //     réelles (items.kcal). On mange jusqu'à être calé·e, le reste est GARDÉ (exemplaire entamé : reste 0..1).
    REPAS: {
      KCAL_PAR_POINT: 16,       // 16 kcal = 1 point de faim (journée de jeu compressée : une conserve de haricots ≈ 20 points).
      RASSASIE: 92,             // au-delà : « Tu n'as plus faim. » (on peut se forcer → nausée).
      MIETTES: 0.08,            // s'il ne reste que 8 % de l'objet, on le finit.
      FORCER_POINTS: 10,        // se forcer : on mange jusqu'à 10 points de plus que la faim (ou que l'estomac)…
      NAUSEE_MIN: 90,           // … nausée 1 h 30 : endurance qui remonte moitié moins vite.
      // L'estomac (façon Project Zomboid) : on ne se gave pas d'un coup. Un repas le remplit, il se vide en digérant.
      ESTOMAC_MAX: 40,          // points de faim qu'on peut avaler d'affilée (≈ deux conserves de haricots)…
      ESTOMAC_VIDANGE_MIN: 0.45,// … qui se vident à 27 points par heure : un estomac plein se libère en 1 h 30.
      REPU: 0.8,                // estomac rempli à 80 % : « Repu·e » (état positif).
      BOUCHEE: 3,               // moins de 3 points de place : on ne peut plus rien avaler.
      // Manger prend du temps (action chronométrée, interrompue en bougeant : on garde le reste).
      MS_BASE: 1800, MS_PAR_POINT: 230, MS_MIN: 2200, MS_MAX: 12000,   // une conserve de 20 points ≈ 6,4 s réelles
      MIN_HORS_EXPLORATION: 5,  // manger sur la carte ou en voyage : 5 minutes passent
      NAUSEE_REGEN: 0.5,
      TOURNE_RISQUE: 0.5,       // entamé depuis plus de `perissable` h (items) : 50 % d'intoxication.
      MOTS: [                   // état de la faim, du plus calé au pire (seuil : faim ≥ …)
        [92, 'Rassasié{|e}'], [70, 'Bien nourri{|e}'], [55, 'Un petit creux'], [40, 'Faim'], [15, 'Affamé{|e}'], [1, 'Affamé{|e}, faible'], [0, 'Tu meurs de faim'],
      ],
      PORTIONS: [               // ce que représente un aliment pour quelqu'un d'affamé (points de faim qu'il peut caler)
        [6, 'une bouchée'], [16, 'un en-cas'], [32, 'un repas léger'], [55, 'un vrai repas'], [90, 'un gros repas'], [1e9, 'plusieurs repas'],
      ],
    },
    // --- Poids du corps : il suit la faim, jour après jour (accéléré : la partie dure des semaines, pas des mois) ---
    CORPS: {
      REF: { m: 74, f: 61 },    // poids de forme (kg) selon le genre
      BORNES: [0.62, 1.45],     // jamais en dessous / au-dessus de ces rapports
      SEUILS: [[0.8, 'emacie'], [0.91, 'maigre'], [1.1, 'normal'], [1.22, 'enrobe'], [99, 'obese']],   // rapport poids / forme < seuil
      KG_JOUR: [[88, 0.35], [55, 0], [40, -0.5], [15, -1], [0, -1.6]],   // faim ≥ seuil → kg par jour (bien calé·e : on prend)
      SOMMEIL: 0.6,             // en dormant, on perd moins vite
      GAVE_KG_PAR_POINT: 0.02,  // chaque point avalé de force (au-delà de la faim ou de l'estomac) : +20 g
      EFFETS: {                 // × vitesse, × coût en souffle, × récupération, × dégâts, + chaleur, + souffle max
        emacie: { vitesse: 0.94, staCout: 1.25, regenSta: 0.75, degats: 0.8, chaleur: -2, staMax: -15 },
        maigre: { vitesse: 1, staCout: 1.08, regenSta: 0.92, degats: 0.92, chaleur: -1, staMax: -5 },
        enrobe: { vitesse: 0.97, staCout: 1.15, regenSta: 0.9, degats: 1, chaleur: 1, staMax: -5 },
        obese: { vitesse: 0.9, staCout: 1.35, regenSta: 0.8, degats: 1.05, chaleur: 2, staMax: -15 },
      },
    },
    SOIF_PAR_MIN: 0.05,         // 100 → 0 en 33 h (≈ 1,5 L par jour).
    FATIGUE_PAR_MIN: 0.055,     // 100 → 0 en 30 h éveillé(e).
    MULT_ACTIVITE: {            // × usure selon l'activité (s'applique à soif et fatigue)
      course: 2, combat: 1.5, voyage_rapide: 1.8, fabrication: 1.1, repos: 0.6, sommeil: 0.5,
    },
    SEUILS: {                   // effets (voir GAMEPLAY §Survie). Jauges 100 = bien.
      faim:    { gene: 40, grave: 15 },   // < 40 : récup. sta ×0,85 ; < 15 : staMax −15, dégâts ×0,85 ; 0 : PV −0,04/min.
      soif:    { gene: 50, grave: 20 },   // < 50 : récup. sta ×0,85 ; < 20 : staMax −20, vue ×0,85 ; 0 : PV −0,1/min.
      fatigue: { gene: 35, grave: 15 },   // < 35 : staMax −15 ; < 15 : staMax −30, vitesse ×0,9, toucher −8 % ; 0 : évanouissement.
    },
    EFFETS: {
      REGEN_GENE: 0.85,
      STAMAX_FAIM: 15, STAMAX_SOIF: 20, STAMAX_FATIGUE: 15, STAMAX_EPUISE: 30,
      PV_FAIM_0: 0.04,          // PV/min à faim 0 (≈ 42 h pour mourir de faim une fois vide).
      PV_SOIF_0: 0.1,           // PV/min à soif 0 (≈ 17 h).
      EVANOUI_H: 2,             // fatigue 0 : tu t'effondres 2 h où tu es (sommeil forcé, lieu non sûr).
      VITESSE_EPUISE: 0.9,
    },
    // --- Récupération ---
    PV_REGEN: { eveille: 0.02, sommeil: 0.07 }, // PV/min si faim ≥ 40, soif ≥ 40, pas de saignement ni d'infection.
    STA_HORS_COMBAT: { repos: 10, marche: 6, accroupi: 7 }, // sta/s en exploration (0 en course).
    SOMMEIL: {
      FATIGUE_PAR_MIN: 0.22,    // 8 h de sommeil ≈ +105 fatigue.
      FATIGUE_MAX_POUR_DORMIR: 80, // on ne peut dormir que si fatigue < 80.
      DUREES: [2, 4, 6, 8, 10], // heures proposées.
      RISQUE_H: { base: 0.04, parDanger: 0.1 }, // lieu NON sûr avec des morts vivants dans le niveau : risque/h d'intrusion.
      PIEGE_SONORE: 'reveil',   // piège sonore posé : l'intrusion te réveille (combat « normal », pas « surpris »).
      SUR: ['barricade', 'refuge'], // pièce barricadée / refuge : risque 0.
      // --- Le couchage compte (docs/GAMEPLAY.md §5.7) ---
      // fatigue : × FATIGUE_PAR_MIN · plafond : on ne récupère pas au-delà (on se réveille) · pv : × PV_REGEN.sommeil ·
      // guerison : × durée de guérison des plaies pendant le sommeil (< 1 = plus vite) · froid : + besoin de chaleur ·
      // courbatures : au réveil, si on a dormi au moins apresH h → douleur pendant min minutes, endurance × regenSta.
      COUCHAGE: {
        sol:     { fatigue: 0.5,  plafond: 60,  pv: 0.5,  guerison: 1,   froid: 1, courbatures: { apresH: 2, douleur: 20, min: 240, regenSta: 0.85 } },
        mauvais: { fatigue: 0.75, plafond: 80,  pv: 0.75, guerison: 0.9, froid: 0, courbatures: { apresH: 4, douleur: 10, min: 120, regenSta: 1 } },
        moyen:   { fatigue: 0.9,  plafond: 95,  pv: 1,    guerison: 0.8, froid: 0 },
        correct: { fatigue: 1.2,  plafond: 100, pv: 1.25, guerison: 0.7, froid: 0 },
      },
      // la catégorie de chaque couchage (objets de plan et constructions) ; un plan peut la forcer : { couchage: 'moyen' }
      COUCHAGES: {
        fauteuil: 'mauvais', canape: 'mauvais', brancard: 'mauvais', abri_branches: 'mauvais',
        lit_fortune: 'moyen', lit_camp: 'moyen', matelas: 'moyen',
        lit: 'correct', lit_simple: 'correct', lit_hopital: 'correct',
      },
      SAC_COUCHAGE: 'sac_couchage', // par terre ou sur un mauvais couchage, un sac de couchage le fait passer à « moyen »
      CHALEUR_SOMMEIL: { sac_couchage: 3, couverture: 2 }, // chaleur ajoutée pendant le sommeil (on s'enroule dedans)
    },
    // --- Froid ---
    FROID: {
      BESOIN: { exterieur_jour: 2, exterieur_nuit: 4, interieur_jour: 0, interieur_nuit: 2 }, // chaleur de vêtements requise
      SAISON: { printemps: 0, ete: -2, fin_ete: -1, automne: 0, hiver: 2 },  // ajouté au besoin
      SAISON_DEFAUT: 'fin_ete', // fin septembre (le prologue se passe 17 jours après le 6/09) : journées douces,
                                // nuits fraîches — en t-shirt + jean (chaleur 1), déficit 2 la nuit dehors : on grelotte
                                // sans mourir. Le scénariste peut la changer (drapeau 'saison' = une des clés ci-dessus).
      FEU_PROCHE: -4,           // à ≤ 3 cases d'un feu / réchaud allumé.
      // Déficit d = besoin − chaleur (si > 0) :
      FATIGUE_PAR_POINT: 0.02,  // fatigue −0,02 × d /min en plus.
      REGEN_PAR_POINT: 0.1,     // récup. sta × (1 − 0,1 × d).
      PV_SEUIL: 3,              // d ≥ 3 : PV −0,015 × (d − 2) /min.
      PV_PAR_POINT: 0.015,
      RHUME_H: 0.015,           // chance/h d'attraper un rhume : 0,015 × d.
    },
    // --- Mouillé : une jauge 0..100 qui monte sous la pluie (dehors, sans toit) et sèche à l'abri ---
    MOUILLE: {
      PLUIE_PAR_MIN: { legere: 0.6, forte: 1.1 }, // /min de jeu sous la pluie : averse forte → mouillé ~30 min, trempé ~1 h (≈ 2 min 30 réelles)
      IMPERMEABLE: 0.25,        // un imperméable sur le dos (poncho, veste de feu) : on se mouille 4 fois moins vite…
      IMPERMEABLE_AUTRE: 0.85,  // … des bottes, un chapeau imperméables : un peu moins vite (chacun).
      SECHE_PAR_MIN: { abri: 0.45, dehors_sec: 0.6, feu: 2.5 }, // sécher : à l'abri, dehors sans pluie (vent, soleil), près d'un feu
      SEUILS: [10, 35, 65, 90],  // stades : Humide, Mouillé, Trempé, Trempé jusqu'aux os
      FROID: [0, 0, 1, 2, 3],    // + besoin de chaleur par stade (0 = sec) — les vêtements mouillés glacent, même à l'abri
      RHUME_H: [0, 0, 0.01, 0.02, 0.04], // chance/h EN PLUS d'attraper un rhume
      FATIGUE_PAR_MIN: [0, 0, 0.005, 0.01, 0.015], // un peu plus las
      REGEN_STA: [1, 1, 0.95, 0.9, 0.85], // le souffle revient moins vite
      VITESSE: [1, 1, 1, 0.94, 0.88],     // trempé, on se traîne
    },
    // --- Douleur (0..100 = somme des douleurs des blessures + maladies, moins les calmants) ---
    DOULEUR: {
      SEUILS: [30, 60, 80],     // > 30 : toucher −3 % ; > 60 : toucher −5 %, récup. sta ×0,75 ; > 80 : vue tremblée, toucher −10 %.
      ANTIDOULEUR: { reduc: 40, min: 240 },  // −40 pendant 4 h.
      ALCOOL: { reduc: 15, min: 60, toucher: -0.05 },
      TISANE: { reduc: 10, min: 120 },
    },
    // --- Blessures ---
    // saigne : PV/min tant que ça saigne ; pSaigne : chance que la plaie saigne à sa création ;
    // arret : chance/h que ça s'arrête seul ; douleur ; infH : chance/h de s'infecter (plaie non soignée) ;
    // guerisonH : heures pour guérir (bandée : ×0,75) ; suture : doit être recousue, sinon se rouvre et guérit ×2 plus lentement.
    BLESSURES: {
      egratignure: { nom: 'Égratignure',       gravite: 1, saigne: 0.01, pSaigne: 0.3, arret: 4,   douleur: 4,  infH: 0.006, guerisonH: 12 },
      contusion:   { nom: 'Contusion',         gravite: 1, saigne: 0,    pSaigne: 0,   arret: 0,   douleur: 8,  infH: 0,     guerisonH: 18 },
      entaille:    { nom: 'Entaille',          gravite: 2, saigne: 0.05, pSaigne: 0.8, arret: 0.3, douleur: 12, infH: 0.02,  guerisonH: 36 },
      profonde:    { nom: 'Blessure profonde', gravite: 3, saigne: 0.15, pSaigne: 1,   arret: 0,   douleur: 25, infH: 0.04,  guerisonH: 72, suture: true },
      morsure:     { nom: 'Morsure',           gravite: 3, saigne: 0.08, pSaigne: 1,   arret: 0.1, douleur: 22, infH: 0.05,  guerisonH: 72, pasDeSuture: true },
      fracture:    { nom: 'Fracture',          gravite: 4, saigne: 0,    pSaigne: 0,   arret: 0,   douleur: 40, infH: 0,     guerisonH: 168, attelle: true },
      brulure:     { nom: 'Brûlure',           gravite: 2, saigne: 0,    pSaigne: 0,   arret: 0,   douleur: 30, infH: 0.03,  guerisonH: 48 },
    },
    REOUVERTURE_H: 0.05,        // profonde non suturée ni bandée : 5 %/h de se remettre à saigner.
    // --- Soins : durée (min de jeu, −10 %/niv de Médecine) et effet ---
    SOINS: {
      bander:      { min: 3,  effet: 'arrête le saignement ; guérison × 0,75 ; infection × 0,6 (propre) ou × 1,5 (sale), × 0,3 (miel)' },
      nettoyer:    { min: 5,  effet: 'savon : infection × 0,5 pour toujours ; recul 3 %/h si déjà infectée' },
      desinfecter: { min: 2,  effet: 'désinfection active (DESINFECTION_MIN) ; ≤ 10 min après une griffure de mort : ses points de mal sont retirés' },
      suturer:     { min: 15, pv: -4, douleur: 15, effet: 'profonde : arrête le saignement, permet la guérison ; interdit sur une morsure' },
      attelle:     { min: 10, effet: 'fracture : supprime les malus FRACTURE_SANS_ATTELLE, guérison × 0,6' },
      cauteriser:  { min: 5,  effet: 'morsure ≤ 15 min : points de mal × 0,5 ; coût CONTAMINATION.CAUTERISER_COUT ; il faut une lame et une flamme' },
      antidouleur: { min: 1,  effet: 'douleur −40 pendant 4 h' },
      antibio:     { min: 1,  effet: 'toutes les infections guérissent 3 h après ; désinfection active 12 h sur chaque plaie ; fièvre levée' },
      vitamines:   { min: 1,  sta: 10, effet: 'maladies et déclin du mal × 1,25 plus rapides pendant 12 h' },
      tisane:      { min: 2,  soif: 10, effet: 'fièvre levée en 1 h (sans infection active) ; rhume × 0,5 ; douleur −10 pendant 2 h' },
      onguent:     { min: 3,  effet: 'brûlure / contusion : guérison × 1,5, douleur de la plaie −15, infection × 0,5' },
      charbon:     { min: 1,  effet: 'intoxication terminée 30 min après' },
      MEDECINE_EFFICACITE: 0.1, // +10 %/niv sur les durées d'effet et les réductions (antidouleur, onguent…).
    },
    FRACTURE_SANS_ATTELLE: { douleur: 20, guerison: 2, vitesse: 0.7, degats: 0.6 }, // jambe : vitesse ×0,7 ; bras : dégâts ×0,6.
    // --- Infection BACTÉRIENNE (la plaie sale — soignable, lente) ---
    INFECTION: {
      NETTOYEE: 0.5,            // plaie lavée (savon + eau) : risque × 0,5.
      DESINFECTION_ACTIVE: 0.05,// pendant une désinfection en cours : × 0,05.
      DESINFECTEE: 0.3,         // après : × 0,3 pour toujours.
      BANDAGE_PROPRE: 0.6, BANDAGE_SALE: 1.5, PANSEMENT_MIEL: 0.3,
      SOUILLEE: 2.5,            // infligée par un mort « souille » (putréfié, gonflé) ou en égout.
      ANIMALE: 2,               // morsure / griffure d'animal.
      DESINFECTION_MIN: { desinfectant: 240, lingette: 150, alcool_fort: 120, antibiotiques: 720 },
      ALCOOL_REUSSITE: 0.8,     // l'alcool fort « prend » 8 fois sur 10.
      // Une plaie infectée :
      PV_PAR_MIN: 0.008,        // −0,008 PV/min (≈ −11/jour) par plaie infectée.
      DOULEUR: 15,
      FIEVRE_H: 0.1,            // 10 %/h de déclencher la fièvre.
      RECUL_H: { desinfection: 0.2, nettoyee: 0.03 }, // chance/h que l'infection recule.
      ANTIBIO_DELAI_MIN: 180,   // les antibiotiques guérissent TOUTES les infections 3 h après la prise.
    },
    // --- LE MAL (contamination des morts) — une égratignure n'est pas une condamnation, une morsure l'est presque ---
    // Le protagoniste a DÉJÀ été mordu{|e}, est mort{|e} et revenu{|e} (prologue) : son sang résiste. Le mal n'est donc
    // pas un tirage caché « tu es condamné(e) ou non », mais une JAUGE visible (0..100) qui se charge à chaque plaie
    // souillée par un mort et se vide lentement. À 100 : la RECHUTE — tu redeviens l'un d'eux (mort définitive).
    CONTAMINATION: {
      // points ajoutés à la création de la blessure = POINTS[type] × zombie.infection × difficulté.contamination
      POINTS: { egratignure: 3, entaille: 6, profonde: 10, morsure: 70, contusion: 0, fracture: 0, brulure: 0 },
      //   errant (infection 0,85) : égratignure +2,6 · entaille +5 · morsure +60. Chien (0,08) : morsure animale +5.
      NETTOYAGE_MIN: 10,        // plaie de griffure désinfectée ≤ 10 min après : ses points sont RETIRÉS (le réflexe qui sauve).
      CAUTERISER_MIN: 15,       // morsure cautérisée (feu + lame, action « Cautériser ») ≤ 15 min après : ses points × 0,5…
      CAUTERISER_MULT: 0.5,
      CAUTERISER_COUT: { pv: 8, douleur: 50, blessure: 'brulure' }, // … au prix d'une brûlure au même endroit.
      DECLIN_PAR_MIN: { eveille: 0.006, sommeil: 0.012 }, // la jauge redescend : ≈ −9/jour éveillé(e), ≈ −17/nuit de 8 h en dormant.
      SEUILS: {                 // effets cumulatifs
        noirceur: 30,           //  ≥ 30 : veines noires autour des plaies ; staMax −10 ; faim × 1,25.
        fievre_noire: 50,       //  ≥ 50 : fièvre sèche — staMax −20, soif × 1,5, toucher −5 %, plus de régénération de PV.
        delire: 75,             //  ≥ 75 : vue voilée, bruits fantômes (faux indicateurs d'ouïe), PV −0,02/min.
        rechute: 100,           //  100  : la rechute. Solo : fin de partie. Co-op : tu te relèves, ton partenaire doit t'affronter.
      },
      // Une morsure seule (60) + le déclin : on s'en remet en ~4 jours. Une 2e morsure avant ≈ 2 jours : rechute.
      EFFET_SCENE: 35,          // effet de scène `infection: true` = +35 points.
      REMEDE_FLAG: 'remede_mal', // si l'histoire introduit un traitement, il pose ce drapeau / appelle reduireMal(n).
      VITAMINES: 1.25,          // vitamines / tisane : déclin × 1,25 pendant 12 h.
    },
    // --- Maladies ---
    MALADIES: {
      intoxication: { dureeMin: [180, 420], pvParMin: 0.02, soifParMin: 0.05, vomir: [60, 180] }, // vomir : bruit toutes les 60-180 s.
      fievre:       { soif: 1.5, fatigue: 1.3, toucher: -0.05, pvParMin: 0.01, finApresMin: 240 }, // finit 4 h après la dernière infection.
      rhume:        { dureeH: [24, 48], staMax: -10, toux: [40, 120] },  // toux : bruit 5 toutes les 40-120 s réelles.
    },
    RISQUES_ALIMENTS: { viande_crue: 0.55, poisson_cru: 0.4, eau_croupie: 0.4 }, // chance d'intoxication (repris des objets).
    EAU: { DOSE_L: 0.5, SOIF_PAR_L: { propre: 80, croupie: 60 } }, // boire à un contenant : 0,5 L par gorgée.
  },

  // ===========================================================================
  //  INVENTAIRE — poids (kg) + VOLUME (litres) ; mains gauche / droite / deux mains ; dos
  // ===========================================================================
  inventaire: {
    // --- Volume : ce qui RENTRE ---
    POCHES_L: 1.5,              // litres de poches de base (sans vêtement à poches). Jean +1 L, cargo +2 L, gilet tactique +3 L.
    POCHE_MAX_L: 1,             // une poche ne prend qu'un objet de ≤ 1 L (couteau, conserve, piles…). Au-delà : il faut un sac.
    VOLUME_DEFAUT: [0.2, 0.8, 4, 8], // filet de sécurité seulement : TOUS les objets ont un `volume` réel (items.js).
    CONTENANCE_PAR_ESPACE: 3.3, // sac sans `contenance` : espace × 3,3 L.
    // --- Poids : ce qui PÈSE ---
    POIDS_BASE: 10,             // kg portables sans sac…
    POIDS_PAR_FORCE: 2,         // … + 2 kg par niveau de Force, + portage des vêtements.
    PLAFOND: 1.5,               // au-delà de 1,5 × le max : impossible de bouger (il faut lâcher).
    SURPOIDS: {                 // entre max et plafond, facteur f = 0..1
      vitesse: 0.3,             //   vitesse × (1 − 0,3 f)
      sta: 0.5,                 //   coûts d'endurance × (1 + 0,5 f)
      fatigue: 1,               //   usure de fatigue × (1 + f)
    },
    // --- Mains et dos (façon Project Zomboid) ---
    DOS_POIDS: 0.75,            // un objet sanglé dans le dos (pelle, planche, fusil) ne pèse que 75 % de son poids.
    DOS_VOLUME_MIN: 3,          // seuls les objets LONGS (`long: true`) ou de ≥ 3 L se portent dans le dos.
    UNE_MAIN: {                 // une arme à DEUX mains tenue d'une seule main (l'autre est prise) :
      degats: 0.6,              //   dégâts × 0,6,
      vitesse: 1.35,            //   gestes × 1,35 plus lents,
      sta: 1.3,                 //   endurance × 1,3, et pas de coup chargé.
    },
    CHANGER_MAIN_MS: 450,       // passer un objet de la main au dos, au sac, ou d'une main à l'autre (exploration).
    EQUIPE_ESPACE: 0,           // ce qui est porté (vêtements, objets en main, dos) ne prend pas de place, mais pèse.
    ACCES_RAPIDE_MAX: 6,        // ceinture 3 + holster 1 + gilet 2 au mieux.
  },

  // ===========================================================================
  //  FABRICATION
  // ===========================================================================
  craft: {
    POSTES: {
      etabli: { meubles: ['table', 'bureau', 'machine'], marqueur: 'etabli', portee: 1.5, bonusMarqueur: 0.7 },
                                // à ≤ 1,5 case d'une table / d'un bureau / d'une machine ; un vrai établi (marqueur) : temps × 0,7.
      feu: { sources: ['feu_camp', 'rechaud_camping', 'cheminee'], portee: 2 },
                                // un feu de camp allumé, un réchaud (avec gaz, dans le sac) ou une cheminée (marqueur).
    },
    BRUIT_S: { defaut: 1, marteler: 4 }, // rayon de bruit par seconde de fabrication (4 si la recette demande 'marteler').
    QUALITE: { base: 0.8, parNiveau: 0.1, max: 1.2 }, // durabilité du résultat × (0,8 + 0,1 × (niveau − requis)), max ×1,2.
    LECTURE_MIN: 30,            // lire un livre : 30 min (accéléré), il faut de la lumière.
    GAZ_MIN_PAR_CARTOUCHE: 180, // un réchaud consomme 1 cartouche toutes les 180 min de cuisson.
    FEU_CAMP_MIN: 120,          // un feu de camp brûle 2 h.
    REPARATION: { plafond: 0.1, plancher: 0.5 }, // chaque réparation baisse la durabilité max de 10 % (jamais sous 50 %).
    ANNULATION_REND: 1,         // interrompre une fabrication rend 100 % des ingrédients (rien n'est consommé avant la fin).
  },

  // ===========================================================================
  //  COMPÉTENCES — niveaux 0 à 5
  // ===========================================================================
  competences: {
    PALIERS: [0, 40, 110, 220, 380, 600], // XP cumulée pour atteindre chaque niveau.
    DEPART: { force: 20, dexterite: 20, agilite: 20 },
    LISTE: {
      force:        { nom: 'Force',              desc: 'Armes lourdes et contondantes, poussée, se dégager, forcer, porter (+2 kg/niv).' },
      dexterite:    { nom: 'Dextérité',          desc: 'Lames et lances : dégâts, critiques (+2 %/niv, toutes armes).' },
      agilite:      { nom: 'Agilité',            desc: 'Souffle en course (dépense −8 %/niv), fuite (+6 %/niv), déplacement accroupi.' },
      mainsNues:    { nom: 'Mains nues',         desc: 'Frapper sans arme (+1 dégât/niv), se dégager d\'une empoignade.' },
      visee:        { nom: 'Visée',              desc: 'Armes à feu et arbalète : visée plus rapide, précision, recharge.' },
      discretion:   { nom: 'Discrétion',         desc: 'Bruit −10 %/niv, les morts te repèrent plus tard, attaques furtives.' },
      medecine:     { nom: 'Médecine',           desc: 'Soins plus rapides et plus efficaces, sutures, recettes de soin.' },
      construction: { nom: 'Construction',       desc: 'Barricades, armes et équipements fabriqués, qualité des objets.' },
      mecanique:    { nom: 'Mécanique',          desc: 'Crocheter, désamorcer, récupérer piles et pièces, réparer.' },
      entretien:    { nom: 'Entretien',          desc: 'Les armes s\'usent moins (−10 %/niv), réparations plus efficaces.' },
      chasse:       { nom: 'Chasse & cuisine',   desc: 'Pêche, collets, dépeçage, cuisine : plus de viande, meilleurs repas.' },
      recherche:    { nom: 'Recherche',          desc: 'Chercher par terre (loupe, O) : on trouve plus souvent (+30 %/niv) et des objets de meilleure qualité.' },
    },
    EFFETS: {                   // par niveau
      medecine: { vitesse: 0.1, efficacite: 0.1, douleurSuture: 0.2 }, // soins −10 % de temps ; +10 % d'effet ; suture −20 % de douleur.
      entretien: { usure: 0.1, reparation: 0.08 },  // chance de ne pas user l'arme (10 %/niv) ; réparation +8 %.
      chasse: { depecage: 0.2, peche: 0.1 },        // +20 % de viande au dépeçage ; +10 % de prises.
      mecanique: { crochetage: 0.12 },
    },
    XP_ACTIONS: {               // gains hors combat (combat : voir combat.XP)
      soin: { medecine: 4 }, suture: { medecine: 10 }, cauteriser: { medecine: 8 },
      furtif_5s: { discretion: 1 },  // 5 s accroupi à ≤ 4 cases d'un mort qui ne t'a pas repéré(e).
      attaque_furtive: { discretion: 6 },
      crocheter: { mecanique: 8 }, forcer: { force: 4 },
      barricader: { construction: 10 }, demonter: { construction: 2 },
      lecture: 'livre',         // voir items (livre.xp).
    },
  },

  // ===========================================================================
  //  SCÈNES À CHOIX — jets de compétence
  // ===========================================================================
  scenes: {
    TEST: { base: 0.6, parNiveau: 0.12, min: 0.1, max: 0.95 },
                                // test { skill, difficulte } : P = 0,6 + 0,12 × (niveau − difficulté), bornée.
                                //   niveau 0 / difficulté 1 → 48 % ; niveau 2 / diff. 2 → 60 % ; niveau 4 / diff. 2 → 84 %.
                                //   Le bouton AFFICHE le pourcentage (lisibilité).
    TEST_CHANCE_AFFICHE: true,  // test { chance: p } : afficher aussi le %.
  },

  // ===========================================================================
  //  COURBE — la difficulté monte avec les jours
  // ===========================================================================
  courbe: {
    // mortsMult : × morts procéduraux des lieux (1re visite) ; rencontres : × taux de voyage ;
    // danger : ajouté au danger des zones pour les rencontres ; typesMin : un type de mort n'apparaît
    // au hasard (zones, rencontres, repeuplement) qu'à partir de zombies[id].jourMin.
    JOURS: [
      { jourMin: 1, mortsMult: 0.7,  rencontres: 0.6,  danger: 0,    butinBase: 1.2 }, // jour 1 : on apprend.
      { jourMin: 2, mortsMult: 0.9,  rencontres: 0.85, danger: 0,    butinBase: 1.05 },
      { jourMin: 3, mortsMult: 1,    rencontres: 1,    danger: 0.05, butinBase: 1 },   // jours 2-4 : la ville s'ouvre.
      { jourMin: 5, mortsMult: 1.15, rencontres: 1.15, danger: 0.1,  butinBase: 0.95 },// la région durcit.
      { jourMin: 8, mortsMult: 1.3,  rencontres: 1.3,  danger: 0.15, butinBase: 0.9 },
      { jourMin: 12, mortsMult: 1.45, rencontres: 1.4, danger: 0.2,  butinBase: 0.85 },
    ],
    // butinBase multiplie seulement les lignes « de base » (nourriture, eau, bandages) : jour 1 généreux, ensuite on manque.
  },

  // ===========================================================================
  //  DIFFICULTÉ — les boutons (choisis à la création, modifiables dans Options sauf « permanent »)
  // ===========================================================================
  difficulte: {
    DEFAUT: 'survie',
    PRESETS: {
      recit: {                  // pour l'histoire : on meurt rarement
        nom: 'Récit', degatsMorts: 0.7, pvMorts: 0.85, menace: 1.25, telegraphe: 1.3,
        rencontres: 0.7, mortsLieux: 0.8, butin: 1.3, besoins: 0.75, infection: 0.5, contamination: 0.5,
        repeuplement: 0.5, permanent: false,
      },
      survie: {                 // l'équilibre de référence (tous les chiffres de ce fichier)
        nom: 'Survie', degatsMorts: 1, pvMorts: 1, menace: 1, telegraphe: 1,
        rencontres: 1, mortsLieux: 1, butin: 1, besoins: 1, infection: 1, contamination: 1,
        repeuplement: 1, permanent: false,
      },
      cauchemar: {              // pour qui connaît déjà Salon par cœur
        nom: 'Cauchemar', degatsMorts: 1.25, pvMorts: 1.15, menace: 0.85, telegraphe: 0.85,
        rencontres: 1.3, mortsLieux: 1.3, butin: 0.8, besoins: 1.2, infection: 1.3, contamination: 1,
        repeuplement: 1.5, permanent: true,   // mort définitive : la sauvegarde est effacée.
      },
    },
    // menace / telegraphe : × durées (1,25 = plus lent = plus facile). Jamais sous combat.TELEGRAPHE_MIN_MS.
  },

  // ===========================================================================
  //  CO-OP — deux joueurs : plus de morts et de rencontres, pas deux fois plus de butin
  // ===========================================================================
  // ---------- Les sirènes (« ruées ») : l'armée fait hurler une zone, tous les morts y courent ----------
  // Histoire et textes : js/data/histoire/ruees.js ; moteur : js/game/ruees.js.
  ruees: {
    INTERVALLE_J: [3, 5],       // après les premières sirènes de l'histoire, d'autres reviennent tous les 3 à 5 jours…
    DUREE_H: [18, 34],          // … et hurlent 18 à 34 h de jeu.
    PREMIERE_J: 3,              // les premiers événements « au hasard » (hordes) à partir du jour 3.
    ANNONCE_RADIO_H: 60,        // une radio (js/game/radio.js) prévient des sirènes ~2 jours et demi avant…
    SIGNES_H: 0.25,             // … sans radio : à peine un quart d'heure de drones, et seulement si l'on est dans la zone.
    HORDE: {                    // une horde traverse UN lieu (un bourg, un quartier, ta base)
      ANNONCE_H: 48,            //   la radio la voit venir ~2 jours avant (les éclaireurs de l'armée la suivent) ;
      SIGNES_H: 0.4,            //   sans radio : on l'entend ~25 min avant, sur place ;
      DUREE_H: [6, 14],         //   elle met 6 à 14 h à passer ;
      DENSITE: 1.8,             //   + 1,8 × (morts max du lieu) morts en plus, qui marchent (ils ne courent pas).
    },
    VITESSE_ERRE: 1.7,          // pendant les sirènes, un mort qui erre va (1 + 1,7) × plus vite : ils courent partout…
    VITESSE_ALERTE: 0.6,        // … × 1,6 quand il cherche…
    VITESSE_CHASSE: 0.35,       // … × 1,35 quand il te poursuit.
    DENSITE: 0.9,               // à l'arrivée des sirènes dans un lieu : + 0,9 × (morts max du lieu) morts en plus, réveillés.
    RENCONTRES_ZONE: 2.2,       // voyage dans la zone qui hurle : rencontres × 2,2…
    DANGER_ZONE: 0.3,           // … et danger + 0,3.
    RENCONTRES_NATURE: 0.6,     // ailleurs (les collines, la Crau) : × 0,6 — les morts des environs sont partis vers le bruit.
    SIRENE_S: [35, 80],         // dans la zone, une sirène s'entend toutes les 35 à 80 s réelles.
  },
  coop: {
    MORTS_MULT: 1.5,            // morts procéduraux d'un lieu (1re visite) × 1,5.
    RENCONTRES_MULT: 1.3,       // voyage à deux : taux × 1,3 (plus de bruit, plus visibles).
    COMBAT_MORT_EN_PLUS: 0.5,   // rencontre de combat à deux : +1 mort du pool avec 50 % de chance (deux fronts).
    BUTIN_MULT: 1.3,            // les conteneurs (partagés) ont p × 1,3 : ~0,65 × le butin solo par tête.
    REPEUPLEMENT_MULT: 1.3,
    FOUILLE_AIDE: 1.6,          // (rappel) deux sur le même meuble.
    A_TERRE_MS: 30000,          // à 0 PV en co-op : « À terre » 30 s réelles, rampant, au lieu de mourir…
    RELEVER_MS: 3000,           // … le partenaire te relève en maintenant 3 s (interrompu s'il est frappé)…
    PV_RELEVE: 20,              // … tu repars à 20 PV. Deuxième « à terre » en moins de 10 min de jeu : mort.
    A_TERRE_RELANCE_MIN: 10,
    REJOINDRE_CASES: 4,         // un combat est rejoint automatiquement par l'autre joueur à ≤ 4 cases.
    FLANC: { degats: 1.25, stagger: 0.2 }, // aider : frapper le mort de l'autre (ton propre mort continue de charger).
    SOMMEIL_COMMUN: true,       // l'horloge n'accélère que si les deux dorment (même lieu, ou chacun en lieu sûr).
    REPOS_SEUL_FATIGUE: 0.08,   // se reposer seul(e) sans accélérer : fatigue +0,08/min.
    CONTAMINE_SE_RELEVE: true,  // un joueur mort de contamination se relève : combat contre lui pour le partenaire.
  },
};

// ---------------------------------------------------------------------------
// Petits accès pratiques (lecture seule, aucune dépendance)
// ---------------------------------------------------------------------------
export function niveauDepuisXp(xp) {
  const P = REGLAGES.competences.PALIERS;
  let n = 0;
  for (let i = 1; i < P.length; i++) if ((xp || 0) >= P[i]) n = i;
  return n;
}
export function paramsJour(jour) {
  let r = REGLAGES.courbe.JOURS[0];
  for (const j of REGLAGES.courbe.JOURS) if (jour >= j.jourMin) r = j;
  return r;
}
export function presetDifficulte(id) {
  const P = REGLAGES.difficulte.PRESETS;
  return P[id] || P[REGLAGES.difficulte.DEFAUT];
}
export function chanceTest(niveau, difficulte) {
  const T = REGLAGES.scenes.TEST;
  return Math.max(T.min, Math.min(T.max, T.base + T.parNiveau * ((niveau || 0) - (difficulte || 0))));
}
