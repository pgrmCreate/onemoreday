// ============================================================================
//  BESTIAIRE — les morts (et quelques vivants) de Salon et du pays salonais
// ============================================================================
// Chiffres justifiés dans docs/GAMEPLAY.md §Temps 3 (tableau des morts).
//
// ── COMBAT ──
//   hp            points de vie.
//   dmg [min,max] dégâts d'une ruée qui porte (avant protection).
//   menace        ms pour remplir la jauge de menace (plus petit = plus agressif).
//   telegraphe    ms d'avertissement avant la ruée (fenêtre d'esquive / de garde / d'interruption).
//   saisie 0..1   chance qu'une ruée soit une EMPOIGNADE (tirée au début de la télégraphie : contour ambre).
//   saisieForce   martèlements nécessaires pour se dégager (avant bonus de Force / Mains nues).
//   esquive 0..0.3  retranché à ta chance de toucher (il se dérobe).
//   resistance 0..1 réduit le stagger (vaciller) et la mise à terre ; ≥ 0,75 : les interruptions ne sont plus garanties.
//   armure 0..1   (optionnel) réduction des dégâts NON critiques (moitié moins efficace contre une balle).
//   critMult      (optionnel) × chance de critique contre lui (casque : 0,5).
//   perceGarde    (optionnel) × réduction de ta garde (0,5 = ta garde ne bloque que la moitié de ce qu'elle bloquerait).
//   enchaine 0..1 (optionnel) après sa ruée, chance d'enchaîner une 2e télégraphie à demi-menace.
//   fracture 0..1 (optionnel) chance qu'une attaque de type 'coup' casse un os (blessure fracture).
//   blessureMax   gravité max des blessures qu'il inflige (1 égratignure/contusion, 2 entaille, 3 profonde/morsure, 4 fracture).
//   infection 0..1  virulence du MAL : points de contamination = reglages.survie.CONTAMINATION.POINTS[type de plaie] × infection
//                 (errant : morsure +60, égratignure +2,6 ; vivants : 0 ; animaux : faible).
//   souille       (optionnel) ses plaies sont sales : infection bactérienne × 2,5.
//   animal / vivant  (optionnel) animal : ses morsures sont 'morsure_animale' (dès la ruée) ; vivant : pas de contamination du tout.
//   fuitPV        (optionnel, vivants) fuit quand ses PV passent sous cette fraction : combat gagné, sans butin.
//   attaques      [{ desc, zones, type }] — type ∈ 'griffure' | 'coup' | 'morsure' | 'morsure_animale'.
//                 Un mort humain ne MORD qu'en empoignade ratée : ses attaques 'morsure' ne servent qu'à ce moment-là.
//   butin         (optionnel) [{ id, q:[min,max], p }] — ce qu'on trouve sur le cadavre (fouille 2 s).
//
// ── EXPLORATION ──
//   vitesse       cases/s en errance ;  vitesseChasse  cases/s en chasse (joueur : marche 3,2, course 5,4).
//   vue           portée de vue en cases, de jour (× lumière, voir reglages.exploration.PERCEPTION).
//   ouie          multiplicateur des rayons de bruit qu'il perçoit.
//   odorat        (optionnel) le repère à ≤ N cases à travers tout, sans lumière (animaux).
//   cogne         dégâts à une porte fermée toutes les 1,5 s.
//   grogne        rayon (cases) de ses grognements : le joueur l'« entend » dans ce rayon (indicateur d'onde).
//   etats         répartition des états de départ pour un mort procédural (dort|immobile|erre|fait_le_mort).
//   special       'hurle' | 'explose' | 'rampe' | 'charge' | null  (+ paramètres dans `params`).
//   png           image détourée (dossier /zombies/) ou null → silhouette SVG.
//   jourMin       jour à partir duquel il apparaît AU HASARD (zones de voyage, rencontres, repeuplement).
//                 Les pools explicites des lieux (lieux_gameplay.js) l'ignorent : la BA 701 est dangereuse dès le jour 1.
//   rarete        'commun' | 'peu_commun' | 'rare' — indicatif (poids dans les pools).
// ============================================================================

export const ZOMBIES = {

  // ─────────────────────────── LES COMMUNS ───────────────────────────
  errant: {
    nom: 'Errant', rarete: 'commun', jourMin: 1,
    hp: 30, dmg: [6, 10], menace: 3200, telegraphe: 900,
    saisie: 0.35, saisieForce: 7, esquive: 0, resistance: 0.1,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.5, vitesseChasse: 1.8, vue: 8, ouie: 1, cogne: 4, grogne: 6,
    etats: { erre: 0.5, immobile: 0.35, dort: 0.15 },
    special: null, png: 'zombies/errant.png',
    desc: 'Il avance d\'un pas traînant, la mâchoire pendante, un bras tordu dans le mauvais sens. Ses yeux laiteux te fixent sans te voir.',
    gore: 'Le crâne cède avec un craquement humide. Il s\'effondre, enfin immobile.',
    attaques: [
      { type: 'griffure', desc: 'Ses ongles noirs accrochent la main que tu lèves pour le repousser.', zones: ['à la main', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Il s\'abat sur toi de tout son poids morne ; ses doigts se plantent dans ton épaule et tirent.', zones: ['à l\'épaule', 'au bras'] },
      { type: 'coup', desc: 'Son front heurte le tien. Un bruit de noix qu\'on écrase — le sien, pas le tien. Pas encore.', zones: ['à la tête'] },
      { type: 'morsure', desc: 'Il te tient. Ses dents trouvent ton avant-bras et serrent, lentement, jusqu\'à ce que la peau cède.', zones: ['à l\'avant-bras', 'au bras'] },
      { type: 'morsure', desc: 'Sa tête plonge dans le creux de ton épaule. Tu sens les dents avant la douleur.', zones: ['à l\'épaule'] },
    ],
  },

  rampant: {
    nom: 'Rampant', rarete: 'commun', jourMin: 1,
    hp: 18, dmg: [5, 9], menace: 3600, telegraphe: 1000,
    saisie: 0.6, saisieForce: 5, esquive: 0.05, resistance: 0,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.25, vitesseChasse: 0.9, vue: 5, ouie: 1.2, cogne: 1, grogne: 3,
    etats: { fait_le_mort: 0.5, immobile: 0.3, erre: 0.2 },
    special: 'rampe',
    params: { visibleA: 3 },    // au ras du sol : invisible au-delà de 3 cases sans lumière directe ; ne peut pas être mis à terre.
    png: 'zombies/rampant.png',
    desc: 'Sectionné à la taille, il se tracte sur les coudes en laissant une traînée noire. Ses doigts rongés jusqu\'à l\'os griffent le sol vers tes chevilles.',
    gore: 'Tu écrases ce qui reste de sa tête. Le silence revient, épais.',
    attaques: [
      { type: 'griffure', desc: 'Ses doigts rongés jusqu\'à l\'os se referment sur ton mollet et serrent jusqu\'au sang.', zones: ['au mollet'] },
      { type: 'griffure', desc: 'Il racle ta cheville du bout de ses phalanges nues. Le tissu part, la peau suit.', zones: ['à la cheville', 'au pied'] },
      { type: 'morsure', desc: 'Il agrippe ta cheville et y plante ce qui lui reste de dents.', zones: ['à la cheville'] },
      { type: 'morsure', desc: 'Il se hisse le long de ta jambe et mord, juste au-dessus du genou.', zones: ['au genou', 'à la cuisse'] },
    ],
  },

  putrefie: {
    nom: 'Putréfié', rarete: 'commun', jourMin: 1,
    hp: 20, dmg: [4, 8], menace: 3400, telegraphe: 1000,
    saisie: 0.4, saisieForce: 5, esquive: 0, resistance: 0,
    blessureMax: 2, infection: 0.95, souille: true,
    vitesse: 0.35, vitesseChasse: 1.4, vue: 5, ouie: 0.9, cogne: 2, grogne: 4,
    etats: { immobile: 0.5, erre: 0.3, dort: 0.2 },
    special: null, png: null,
    desc: 'Il tombe en morceaux en marchant. La chair noircie suinte, grouillante. La moindre griffure de cette chose s\'infectera.',
    gore: 'Il s\'affaisse comme un sac de boue. Quelque chose continue de grouiller à l\'intérieur.',
    attaques: [
      { type: 'griffure', desc: 'Sa main suintante glisse le long de ton bras — ses ongles, eux, accrochent.', zones: ['au bras', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Ses doigts noircis griffent ta main avant que tu n\'arraches ton poignet à sa prise.', zones: ['à la main'] },
      { type: 'morsure', desc: 'Il s\'effondre sur toi plus qu\'il n\'attaque, et mord ce qu\'il trouve : ton épaule. Ses dents se déchaussent dans ta chair.', zones: ['à l\'épaule', 'au cou'] },
    ],
  },

  // ─────────────────────────── LES PEU COMMUNS ───────────────────────────
  coureur: {
    nom: 'Coureur', rarete: 'peu_commun', jourMin: 2,
    hp: 26, dmg: [7, 12], menace: 2000, telegraphe: 700,
    saisie: 0.3, saisieForce: 6, esquive: 0.15, resistance: 0.1, enchaine: 0.15,
    blessureMax: 3, infection: 0.85,
    vitesse: 0.8, vitesseChasse: 4.6, vue: 10, ouie: 1, cogne: 5, grogne: 8,
    etats: { erre: 0.6, immobile: 0.3, dort: 0.1 },
    special: null, png: 'zombies/coureur.png',
    desc: 'Récent. Trop récent. Il court presque comme un vivant, la bouche grande ouverte sur un hurlement muet.',
    gore: 'Il s\'écroule en pleine course et glisse jusqu\'à tes pieds. Tu recules d\'instinct.',
    attaques: [
      { type: 'coup', desc: 'Il te percute de plein fouet — vous roulez au sol et ton flanc heurte le bitume.', zones: ['au flanc', 'au torse'] },
      { type: 'griffure', desc: 'Lancé à pleine vitesse, il happe ton bras au passage. La peau part avec.', zones: ['au bras', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Ses ongles te labourent le dos pendant que tu te dégages.', zones: ['dans le dos', 'au flanc'] },
      { type: 'morsure', desc: 'Sa mâchoire claque vers ta gorge — tu te dégages d\'un sursaut, pas tout à fait assez vite.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },

  hurleur: {
    nom: 'Hurleur', rarete: 'peu_commun', jourMin: 2,
    hp: 24, dmg: [5, 9], menace: 2800, telegraphe: 900,
    saisie: 0.35, saisieForce: 6, esquive: 0.05, resistance: 0.1,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.6, vitesseChasse: 2.4, vue: 11, ouie: 1.4, cogne: 3, grogne: 10,
    etats: { immobile: 0.5, erre: 0.4, dort: 0.1 },
    special: 'hurle',
    params: {
      criMs: 2500,              // combat : 1 s après son entrée, il gonfle la gorge — une jauge de cri de 2,5 s.
      interrompu: 'stagger',    // un coup qui le fait vaciller, une poussée ou sa mort coupe le cri.
      renforts: [1, 2],         // cri complet : 1 à 2 morts du pool rejoignent la file 4 s plus tard.
      bruitExploration: 30,     // exploration : quand il te repère, il hurle (bruit 30 cases, tous alertés).
    },
    png: 'zombies/hurleur.png',
    desc: 'Sa gorge déchiquetée vibre. Quand il te repère, il pousse un cri strident qui porte loin — trop loin.',
    gore: 'Le cri s\'éteint dans un gargouillis. Mais qui l\'a entendu ?',
    attaques: [
      { type: 'griffure', desc: 'Ses ongles fendent l\'air et déchirent l\'avant-bras que tu lèves en protection.', zones: ['à l\'avant-bras', 'à la main'] },
      { type: 'coup', desc: 'Il se jette contre toi, tout en os, et ton épaule prend le choc.', zones: ['à l\'épaule'] },
      { type: 'morsure', desc: 'Il s\'accroche à ton col et mord, entre le cou et l\'épaule. Son cri te vibre dans les os.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },

  gonfleur: {
    nom: 'Gonflé', rarete: 'peu_commun', jourMin: 2,
    hp: 50, dmg: [6, 11], menace: 3800, telegraphe: 1100,
    saisie: 0.5, saisieForce: 8, esquive: 0, resistance: 0.5,
    blessureMax: 2, infection: 0.8, souille: true,
    vitesse: 0.35, vitesseChasse: 1.3, vue: 6, ouie: 0.8, cogne: 5, grogne: 5,
    etats: { immobile: 0.6, erre: 0.3, dort: 0.1 },
    special: 'explose',
    params: {
      dmg: [10, 16],            // s'il meurt d'un coup de mêlée d'allonge < 2 : il t'éclate dessus…
      souille: true,            // … et salit toutes tes plaies ouvertes (infection × 2,5 pendant 12 h).
      nausee: 20,               // −20 sta.
      rayonExploration: 1.5,    // exploration : explosion dans 1,5 case (bruit 10).
      bruit: 10,
    },
    png: 'zombies/gonfleur.png',
    desc: 'Boursouflé de gaz, la peau tendue à craquer, verdâtre. Chaque pas fait un bruit de poche qui clapote. Ne le crève pas trop près.',
    gore: 'Il éclate dans une gerbe de gaz putride et de fluides noirs. L\'odeur te poursuivra des heures.',
    attaques: [
      { type: 'coup', desc: 'Sa main boursouflée s\'écrase sur ton bras — sa peau à lui se déchire, la tienne aussi.', zones: ['au bras', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Il t\'effleure le visage de doigts gonflés comme des saucisses. Ce qui coule dessus te brûle les yeux.', zones: ['au visage'] },
      { type: 'morsure', desc: 'Il t\'enveloppe de ses bras gonflés et ses dents cherchent ton cou. Il est tiède. Tu n\'oublieras pas ça.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },

  chien_infecte: {
    nom: 'Chien infecté', rarete: 'peu_commun', jourMin: 2, animal: true,
    hp: 22, dmg: [7, 12], menace: 1800, telegraphe: 650,
    saisie: 0, saisieForce: 0, esquive: 0.25, resistance: 0,
    blessureMax: 3, infection: 0.08,
    vitesse: 1.2, vitesseChasse: 6.2, vue: 9, ouie: 1.6, odorat: 5, cogne: 3, grogne: 10,
    etats: { erre: 0.6, dort: 0.3, immobile: 0.1 },
    special: null, png: null,
    desc: 'Un berger allemand, ou ce qu\'il en reste. Le museau fendu jusqu\'aux oreilles, il tourne autour de toi en grondant.',
    gore: 'Le chien pousse un dernier jappement presque normal. Presque triste.',
    attaques: [
      { type: 'morsure_animale', desc: 'Les crocs se plantent dans ton mollet et il secoue la tête comme pour arracher.', zones: ['au mollet'] },
      { type: 'morsure_animale', desc: 'Il bondit et referme sa gueule sur l\'avant-bras que tu lui jettes en pâture.', zones: ['à l\'avant-bras'] },
      { type: 'griffure', desc: 'Il te fauche les jambes et ses griffes te taillent la cuisse au passage.', zones: ['à la cuisse', 'au genou'] },
    ],
  },

  // ─────────────────────────── LES DANGEREUX ───────────────────────────
  enrage: {
    nom: 'Enragé', rarete: 'peu_commun', jourMin: 4,
    hp: 44, dmg: [11, 17], menace: 1700, telegraphe: 600,
    saisie: 0.25, saisieForce: 9, esquive: 0.05, resistance: 0.35, enchaine: 0.4,
    blessureMax: 3, infection: 0.9,
    vitesse: 0.9, vitesseChasse: 4.2, vue: 9, ouie: 1.1, cogne: 9, grogne: 12,
    etats: { erre: 0.5, immobile: 0.4, dort: 0.1 },
    special: null, png: 'zombies/enrage.png',
    desc: 'Il se jette contre les murs pour t\'atteindre. Sa peau est déchirée par ses propres ongles, ses dents claquent à vide comme un piège à loup.',
    gore: 'Il faut trois coups de plus, même à terre, pour qu\'il arrête de bouger.',
    attaques: [
      { type: 'griffure', desc: 'Il frappe, griffe, tout à la fois — ses ongles t\'ouvrent le visage.', zones: ['au visage'] },
      { type: 'griffure', desc: 'Une rafale de coups désordonnés — l\'un d\'eux te lacère le torse.', zones: ['au torse', 'au flanc'] },
      { type: 'coup', desc: 'Son poing tombe sur ta tempe comme un marteau mal emmanché. Le monde vire au blanc.', zones: ['à la tête'] },
      { type: 'morsure', desc: 'Il te saisit à deux mains et ses dents déchirent ton épaule à travers le tissu.', zones: ['à l\'épaule', 'au cou'] },
    ],
  },

  colosse: {
    nom: 'Colosse', rarete: 'rare', jourMin: 3,
    hp: 95, dmg: [18, 28], menace: 4200, telegraphe: 1300,
    saisie: 0.2, saisieForce: 12, esquive: 0, resistance: 0.8, armure: 0.2, perceGarde: 0.5, fracture: 0.35,
    blessureMax: 4, infection: 0.85,
    vitesse: 0.5, vitesseChasse: 2.0, vue: 7, ouie: 0.8, cogne: 25, grogne: 8,
    etats: { immobile: 0.6, erre: 0.4 },
    special: 'charge',
    params: { declenche: 6, vitesse: 4.5, dureeMs: 1500, porte: 'enfonce' }, // à ≤ 6 cases en te voyant : charge en ligne droite 1,5 s, enfonce les portes.
    png: null,
    butin: [
      { id: 'matraque', q: [1, 1], p: 0.3 },
      { id: 'casque_moto', q: [1, 1], p: 0.12 },
      { id: 'rangers', q: [1, 1], p: 0.25 },
      { id: 'gants_cuir', q: [1, 1], p: 0.2 },
    ],
    desc: 'Un ancien CRS, encore en tenue anti-émeute. Deux mètres de muscles morts sous les coques de protection. Les coups l\'agacent à peine.',
    gore: 'La montagne s\'écroule. Le sol tremble. Tu restes immobile un long moment, à reprendre ton souffle.',
    attaques: [
      { type: 'coup', desc: 'Son poing s\'abat sur toi comme une enclume. Le sol tangue — quelque chose a craqué dans ton dos en tombant.', zones: ['dans le dos', 'au flanc'] },
      { type: 'coup', desc: 'Il te soulève d\'une seule main et te jette contre le mur. Le monde clignote.', zones: ['à la tête', 'à l\'épaule'] },
      { type: 'coup', desc: 'Son revers te cueille en pleine poitrine et t\'envoie au tapis, le souffle coupé.', zones: ['au torse'] },
      { type: 'morsure', desc: 'Il te ceinture comme pour une interpellation, te plaque contre lui, et mord. Tes côtes plient.', zones: ['à l\'épaule', 'au cou'] },
    ],
  },

  // ─────────────────────────── LES RARES ET MÉMORABLES ───────────────────────────
  militaire: {
    nom: 'Soldat de la 701', rarete: 'rare', jourMin: 3,
    hp: 55, dmg: [9, 15], menace: 2600, telegraphe: 850,
    saisie: 0.35, saisieForce: 9, esquive: 0.05, resistance: 0.5, armure: 0.35, critMult: 0.5,
    blessureMax: 3, infection: 0.85,
    vitesse: 0.6, vitesseChasse: 2.4, vue: 9, ouie: 1, cogne: 8, grogne: 6,
    etats: { immobile: 0.6, erre: 0.4 },
    special: null, png: null,
    butin: [
      { id: 'munitions_556', q: [3, 8], p: 0.35 },
      { id: 'munitions_9mm', q: [2, 6], p: 0.2 },
      { id: 'ration_militaire', q: [1, 1], p: 0.3 },
      { id: 'bandage', q: [1, 2], p: 0.25 },
      { id: 'couteau_combat', q: [1, 1], p: 0.12 },
      { id: 'fusee_detresse', q: [1, 1], p: 0.08 },
      { id: 'casque_militaire', q: [1, 1], p: 0.08 },
      { id: 'fusil_assaut', q: [1, 1], p: 0.03 },
    ],
    desc: 'Treillis de l\'armée de l\'Air, gilet pare-éclats, le nom brodé illisible sous le sang. Il marche encore au pas, presque, et le casque lui tient la tête droite. On ne sait pas contre quoi ils se battaient, à la base. On sait qu\'ils ont perdu.',
    gore: 'Il tombe raide, comme à la parade. Le casque roule sur le bitume avec un son de gamelle.',
    attaques: [
      { type: 'coup', desc: 'Un coup de crosse imaginaire, un réflexe de caserne : son avant-bras blindé te cueille à la mâchoire.', zones: ['à la tête', 'au visage'] },
      { type: 'griffure', desc: 'Ses gants tactiques déchirés laissent passer des ongles noirs qui te lacèrent le flanc.', zones: ['au flanc', 'au torse'] },
      { type: 'coup', desc: 'Il te charge épaule en avant, tout le poids du gilet derrière. Tes côtes encaissent.', zones: ['au torse', 'à l\'épaule'] },
      { type: 'morsure', desc: 'Il te fait une clé de bras presque parfaite et mord au pli du coude.', zones: ['au bras', 'à l\'avant-bras'] },
    ],
  },

  fauve: {
    nom: 'Lionne de La Barben', rarete: 'rare', jourMin: 3, animal: true,
    hp: 70, dmg: [13, 20], menace: 1900, telegraphe: 700,
    saisie: 0.45, saisieForce: 10, esquive: 0.2, resistance: 0.6,
    blessureMax: 4, infection: 0.1,
    vitesse: 1.0, vitesseChasse: 6.5, vue: 12, ouie: 1.3, odorat: 6, cogne: 12, grogne: 14,
    etats: { immobile: 0.5, erre: 0.3, dort: 0.2 },
    special: 'charge',
    params: { declenche: 5, vitesse: 8, dureeMs: 700, bond: true }, // bondit de 5 cases : empoignade immédiate si non esquivée.
    png: null,
    desc: 'Une lionne du parc, la robe pelée par plaques, les côtes comme des barreaux. L\'infection ne l\'a pas tuée : elle l\'a affamée. Elle ne rugit pas. Elle te regarde, et elle baisse les épaules.',
    gore: 'Elle s\'affaisse sur le flanc, une patte encore tendue vers toi. Plus grande, morte, qu\'elle n\'en avait l\'air vivante.',
    attaques: [
      { type: 'griffure', desc: 'Un revers de patte, griffes sorties. Ta cuisse s\'ouvre sur trois sillons parallèles.', zones: ['à la cuisse', 'au genou'] },
      { type: 'griffure', desc: 'Elle se dresse et te laboure le dos en retombant.', zones: ['dans le dos', 'à l\'épaule'] },
      { type: 'morsure_animale', desc: 'Ses crocs se referment sur ton avant-bras. Elle ne mord pas : elle tient, et elle tire.', zones: ['à l\'avant-bras', 'au bras'] },
      { type: 'morsure_animale', desc: 'Elle t\'a plaqué{|e} au sol. Son haleine. Ses crocs cherchent ta gorge et trouvent ton épaule.', zones: ['à l\'épaule', 'au cou'] },
    ],
  },

  sanglier: {
    nom: 'Sanglier', rarete: 'peu_commun', jourMin: 1, animal: true, vivant: true,
    hp: 60, dmg: [10, 16], menace: 2400, telegraphe: 800,
    saisie: 0, saisieForce: 0, esquive: 0.1, resistance: 0.7,
    blessureMax: 3, infection: 0, fuitPV: 0.3,
    vitesse: 0.8, vitesseChasse: 5.8, vue: 6, ouie: 1.2, odorat: 5, cogne: 6, grogne: 6,
    etats: { erre: 0.7, dort: 0.3 },
    special: 'charge',
    params: { declenche: 5, vitesse: 7, dureeMs: 900, territorial: 5 }, // n'attaque qu'à ≤ 5 cases, ou blessé.
    png: null,
    butin: [
      { id: 'viande_crue', q: [3, 5], p: 1 },
    ],
    desc: 'Vivant, lui. Cent kilos de soies noires et de muscle, les défenses jaunes, l\'œil petit et mauvais. Personne n\'a chassé dans la Crau depuis des semaines : ils sont devenus nombreux, et ils n\'ont plus peur.',
    gore: 'Il tombe sur les genoux avant, souffle deux fois par les naseaux, et se couche. De la viande pour une semaine — si tu arrives à la porter.',
    attaques: [
      { type: 'coup', desc: 'Il te charge tête basse et te fauche. Tu décolles, tu retombes, ta hanche d\'abord.', zones: ['au flanc', 'à la cuisse'] },
      { type: 'griffure', desc: 'Une défense te taille la cuisse en passant, net comme un couteau de boucher.', zones: ['à la cuisse', 'au mollet'] },
      { type: 'griffure', desc: 'Il fouaille du groin et de la défense dans ton mollet, à ras de terre.', zones: ['au mollet', 'à la cheville'] },
    ],
  },
};

// Types de mort connus du combat (pour les validateurs) : attaques[].type
export const TYPES_ATTAQUE = ['griffure', 'coup', 'morsure', 'morsure_animale'];

export function zombie(id) { return ZOMBIES[id] || null; }
