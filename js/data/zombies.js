// ============================================================================
//  BESTIAIRE — les morts de Salon et du pays salonais (refonte « combat dans l'exploration »)
// ============================================================================
// Pour l'instant, CINQ types humains, chacun en homme OU en femme (tiré à l'apparition, sur la graine).
// Le combat se joue en temps réel dans l'exploration (js/explore/combat.js) : un mort en chasse
// s'approche, et à portée il TÉLÉGRAPHIE (arc rouge = coup, ambre = empoignade) puis frappe.
// On recule, on le pousse, ou on l'interrompt d'un coup chargé.
//
// ── COMBAT ──
//   hp            points de vie.
//   dmg [min,max] dégâts d'une attaque qui porte (avant protection).
//   portee        allonge de son attaque, en cases (0,8 m) depuis son centre. Hors de portée à la fin
//                 de la télégraphie (tu as reculé, roulé) : il frappe dans le vide.
//   telegraphe    ms d'avertissement avant l'attaque (fenêtre pour reculer / pousser / interrompre).
//   cadence       ms de récupération après une attaque (avant de pouvoir en relancer une).
//   saisie 0..1   chance qu'une attaque soit une EMPOIGNADE (ambre) : il t'agrippe, tu dois marteler.
//   saisieForce   martèlements nécessaires pour se dégager (avant bonus de Force / Mains nues).
//   esquive 0..0.3  retranché à ta chance de toucher AU TIR (il se dérobe) — les morts esquivent, pas toi.
//   resistance 0..1 réduit le recul, le vacillement et la mise à terre ; ≥ 0,75 : la poussée ne le bouge pas.
//   armure 0..1   (optionnel) réduction des dégâts NON critiques (moitié moins efficace contre une balle).
//   fracture 0..1 (optionnel) chance qu'une attaque de type 'coup' casse un os.
//   blessureMax   gravité max des blessures qu'il inflige (1 égratignure/contusion, 2 entaille, 3 profonde/morsure, 4 fracture).
//   infection 0..1  virulence du MAL (points = reglages.survie.CONTAMINATION.POINTS[plaie] × infection).
//   attaques      [{ desc, zones, type }] — type ∈ 'griffure' | 'coup' | 'morsure'.
//                 Un mort ne MORD qu'en empoignade ratée : ses attaques 'morsure' ne servent qu'à ce moment-là.
//   butin         (optionnel) [{ id, q:[min,max], p }] — ce qu'on trouve sur le cadavre (fouille 2 s).
//
// ── EXPLORATION ──
//   vitesse       cases/s en errance ;  vitesseChasse  cases/s en chasse (joueur : marche 3,2, course 5,4).
//   vue           portée de vue en cases, de jour.     ouie  multiplicateur des bruits perçus.
//   cogne         dégâts à une porte fermée toutes les 1,5 s.   grogne  rayon (cases) de ses grognements.
//   etats         répartition des états de départ (dort|immobile|erre|fait_le_mort).
//   special       'hurle' | 'rampe' | 'charge' | null  (+ paramètres dans `params`).
//
// ── HOMMES ET FEMMES ──
//   sexes { h, f }  probabilité de chaque sexe à l'apparition (graine du mort : identique chez les deux joueurs).
//   noms  { h, f }  nom affiché selon le sexe.  `nom` = nom générique (bestiaire, outils).
//   allure          silhouette pour le rendu : { taille (échelle), carrure (épaules), peau: [teintes], vetements: [couleurs] }.
//
// Les anciens types (putréfié, gonflé, enragé, soldat, chien, lionne, sanglier) sont RANGÉS pour plus tard :
// leurs ids restent valides (histoire, rencontres, pools) et désignent le type le plus proche (ALIAS_MORTS).
// ============================================================================

export const TYPES_ATTAQUE = ['griffure', 'coup', 'morsure', 'morsure_animale'];

export const ZOMBIES = {

  // ─────────────────────────── 1. ERRANT · ERRANTE — l'étalon ───────────────────────────
  errant: {
    nom: 'Errant', noms: { h: 'Errant', f: 'Errante' }, sexes: { h: 0.5, f: 0.5 }, rarete: 'commun', jourMin: 1,
    hp: 30, dmg: [6, 10], portee: 0.95, telegraphe: 800, cadence: 1300,
    saisie: 0.35, saisieForce: 7, esquive: 0, resistance: 0.1,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.5, vitesseChasse: 1.8, vue: 8, ouie: 1, cogne: 4, grogne: 6,
    etats: { erre: 0.5, immobile: 0.35, dort: 0.15 },
    special: null, png: 'zombies/errant.png',
    allure: { taille: 1, carrure: 1, peau: ['#7d8070', '#86836f', '#737a6c'], vetements: ['#3b3128', '#2e3136', '#463a36', '#3a4048', '#4a3a42'] },
    butin: [
      { id: 'briquet', q: [1, 1], p: 0.06 },
      { id: 'piles', q: [1, 2], p: 0.08 },
      { id: 'chiffon', q: [1, 2], p: 0.15 },
    ],
    desc: 'Il avance d\'un pas traînant, la mâchoire pendante, un bras tordu dans le mauvais sens. Ses yeux laiteux te fixent sans te voir.',
    gore: 'Le crâne cède avec un craquement humide. Il s\'effondre, enfin immobile.',
    attaques: [
      { type: 'griffure', desc: 'Des ongles noirs accrochent la main que tu lèves pour le repousser.', zones: ['à la main', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Tout son poids morne s\'abat sur toi ; des doigts se plantent dans ton épaule et tirent.', zones: ['à l\'épaule', 'au bras'] },
      { type: 'coup', desc: 'Un front heurte le tien. Un bruit de noix qu\'on écrase.', zones: ['à la tête'] },
      { type: 'morsure', desc: 'Des dents trouvent ton avant-bras et serrent, lentement, jusqu\'à ce que la peau cède.', zones: ['à l\'avant-bras', 'au bras'] },
      { type: 'morsure', desc: 'Une tête plonge dans le creux de ton épaule. Tu sens les dents avant la douleur.', zones: ['à l\'épaule'] },
    ],
  },

  // ─────────────────────────── 2. COUREUR · COUREUSE — rapide et fragile ───────────────────────────
  coureur: {
    nom: 'Coureur', noms: { h: 'Coureur', f: 'Coureuse' }, sexes: { h: 0.5, f: 0.5 }, rarete: 'peu_commun', jourMin: 2,
    hp: 24, dmg: [6, 11], portee: 1.0, telegraphe: 600, cadence: 900,
    saisie: 0.3, saisieForce: 6, esquive: 0.1, resistance: 0.05,
    blessureMax: 3, infection: 0.85,
    vitesse: 0.8, vitesseChasse: 4.4, vue: 10, ouie: 1, cogne: 5, grogne: 8,
    etats: { erre: 0.6, immobile: 0.3, dort: 0.1 },
    special: null, png: 'zombies/coureur.png',
    allure: { taille: 0.96, carrure: 0.88, peau: ['#8a8676', '#918b78'], vetements: ['#2a3b52', '#5a2a2a', '#2e2e2e', '#3c4a2e', '#6a5a3a'] },
    desc: 'Récent. Trop récent. Ça court presque comme un vivant, la bouche grande ouverte sur un hurlement muet.',
    gore: 'Le corps s\'écroule en pleine course et glisse jusqu\'à tes pieds.',
    attaques: [
      { type: 'coup', desc: 'Un choc de plein fouet ; ton flanc heurte le sol.', zones: ['au flanc', 'au torse'] },
      { type: 'griffure', desc: 'Lancé à pleine vitesse, il happe ton bras au passage. La peau part avec.', zones: ['au bras', 'à l\'avant-bras'] },
      { type: 'griffure', desc: 'Des ongles te labourent le dos pendant que tu te dégages.', zones: ['dans le dos', 'au flanc'] },
      { type: 'morsure', desc: 'Une mâchoire claque vers ta gorge — tu te dégages d\'un sursaut, pas tout à fait assez vite.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },

  // ─────────────────────────── 3. RAMPANT · RAMPANTE — au ras du sol ───────────────────────────
  rampant: {
    nom: 'Rampant', noms: { h: 'Rampant', f: 'Rampante' }, sexes: { h: 0.5, f: 0.5 }, rarete: 'commun', jourMin: 1,
    hp: 18, dmg: [5, 9], portee: 0.85, telegraphe: 900, cadence: 1400,
    saisie: 0.6, saisieForce: 5, esquive: 0.05, resistance: 0,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.25, vitesseChasse: 0.9, vue: 5, ouie: 1.2, cogne: 1, grogne: 3,
    etats: { fait_le_mort: 0.5, immobile: 0.3, erre: 0.2 },
    special: 'rampe',
    params: { visibleA: 3 },    // au ras du sol : invisible au-delà de 3 cases sans lumière directe ; ne peut pas être mis à terre.
    png: 'zombies/rampant.png',
    allure: { taille: 1, carrure: 0.95, peau: ['#6f6a5a', '#77705e'], vetements: ['#2e2a26', '#3a3330', '#2a2e33'] },
    desc: 'Sectionné à la taille, ça se tracte sur les coudes en laissant une traînée noire. Des doigts rongés jusqu\'à l\'os griffent le sol vers tes chevilles.',
    gore: 'Tu écrases ce qui reste de la tête. Le silence revient, épais.',
    attaques: [
      { type: 'griffure', desc: 'Des doigts rongés se referment sur ton mollet et serrent jusqu\'au sang.', zones: ['au mollet'] },
      { type: 'griffure', desc: 'Des phalanges nues raclent ta cheville. Le tissu part, la peau suit.', zones: ['à la cheville', 'au pied'] },
      { type: 'morsure', desc: 'Ça agrippe ta cheville et y plante ce qui reste de dents.', zones: ['à la cheville'] },
      { type: 'morsure', desc: 'Ça se hisse le long de ta jambe et mord, juste au-dessus du genou.', zones: ['au genou', 'à la cuisse'] },
    ],
  },

  // ─────────────────────────── 4. HURLEUR · HURLEUSE — à tuer en premier ───────────────────────────
  hurleur: {
    nom: 'Hurleur', noms: { h: 'Hurleur', f: 'Hurleuse' }, sexes: { h: 0.4, f: 0.6 }, rarete: 'peu_commun', jourMin: 2,
    hp: 22, dmg: [5, 9], portee: 0.95, telegraphe: 800, cadence: 1200,
    saisie: 0.35, saisieForce: 6, esquive: 0.05, resistance: 0.1,
    blessureMax: 2, infection: 0.85,
    vitesse: 0.6, vitesseChasse: 2.4, vue: 11, ouie: 1.4, cogne: 3, grogne: 10,
    etats: { immobile: 0.5, erre: 0.4, dort: 0.1 },
    special: 'hurle',
    params: {
      bruitExploration: 30,     // quand il te repère, il hurle : bruit de 30 cases, tout le niveau est alerté.
      relanceMs: 9000,          // s'il te garde en vue, il hurle de nouveau toutes les 9 s…
      coupeSi: 'vacille',       // … sauf si un coup le fait vaciller, ou une poussée : ça lui coupe le souffle.
    },
    png: 'zombies/hurleur.png',
    allure: { taille: 0.98, carrure: 0.85, peau: ['#8c8478', '#958c80'], vetements: ['#4a2e3a', '#2f3a45', '#5a4a3a', '#3a2a2a'], bouche: true },
    desc: 'Une gorge déchiquetée qui vibre. Quand ça te repère, ça pousse un cri strident qui porte loin — trop loin.',
    gore: 'Le cri s\'éteint dans un gargouillis. Mais qui l\'a entendu ?',
    attaques: [
      { type: 'griffure', desc: 'Des ongles fendent l\'air et déchirent l\'avant-bras que tu lèves en protection.', zones: ['à l\'avant-bras', 'à la main'] },
      { type: 'coup', desc: 'Un corps tout en os se jette contre toi ; ton épaule prend le choc.', zones: ['à l\'épaule'] },
      { type: 'morsure', desc: 'Des dents se plantent entre le cou et l\'épaule. Le cri te vibre dans les os.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },

  // ─────────────────────────── 5. COLOSSE — lent, énorme ───────────────────────────
  colosse: {
    nom: 'Colosse', noms: { h: 'Colosse', f: 'Colosse' }, sexes: { h: 0.85, f: 0.15 }, rarete: 'rare', jourMin: 3,
    hp: 95, dmg: [16, 26], portee: 1.15, telegraphe: 1200, cadence: 2000,
    saisie: 0.2, saisieForce: 12, esquive: 0, resistance: 0.8, armure: 0.2, fracture: 0.35,
    blessureMax: 4, infection: 0.85,
    vitesse: 0.5, vitesseChasse: 2.0, vue: 7, ouie: 0.8, cogne: 25, grogne: 8,
    etats: { immobile: 0.6, erre: 0.4 },
    special: 'charge',
    params: { declenche: 6, vitesse: 4.5, dureeMs: 1500, porte: 'enfonce' }, // à ≤ 6 cases en te voyant : charge 1,5 s, enfonce les portes.
    png: null,
    allure: { taille: 1.32, carrure: 1.3, peau: ['#6e7064', '#77786a'], vetements: ['#1e2328', '#2a2e26', '#33302a'] },
    butin: [
      { id: 'matraque', q: [1, 1], p: 0.3 },
      { id: 'casque_moto', q: [1, 1], p: 0.12 },
      { id: 'rangers', q: [1, 1], p: 0.25 },
      { id: 'gants_cuir', q: [1, 1], p: 0.2 },
      { id: 'munitions_9mm', q: [2, 6], p: 0.12 },
      { id: 'bandage', q: [1, 2], p: 0.2 },
    ],
    desc: 'Deux mètres de muscles morts, encore sanglés dans des coques anti-émeute. Les coups l\'agacent à peine.',
    gore: 'La montagne s\'écroule. Le sol tremble. Tu restes immobile un long moment, à reprendre ton souffle.',
    attaques: [
      { type: 'coup', desc: 'Un poing s\'abat sur toi comme une enclume. Quelque chose a craqué dans ton dos en tombant.', zones: ['dans le dos', 'au flanc'] },
      { type: 'coup', desc: 'Une seule main te soulève et te jette contre le mur. Le monde clignote.', zones: ['à la tête', 'à l\'épaule'] },
      { type: 'coup', desc: 'Un revers te cueille en pleine poitrine et t\'envoie au tapis, le souffle coupé.', zones: ['au torse'] },
      { type: 'morsure', desc: 'Il te ceinture, te plaque contre lui, et mord. Tes côtes plient.', zones: ['à l\'épaule', 'au cou'] },
    ],
  },
};

// Anciens types → type actif le plus proche. Les ids restent utilisables partout (histoire, rencontres, pools) :
// ZOMBIES[ancien] renvoie la fiche du type actif (propriété non énumérable : le bestiaire n'en compte que cinq).
export const ALIAS_MORTS = {
  putrefie: 'errant',
  gonfleur: 'errant',
  enrage: 'coureur',
  militaire: 'errant',
  chien_infecte: 'coureur',
  fauve: 'coureur',
  sanglier: 'errant',
};
for (const [ancien, actif] of Object.entries(ALIAS_MORTS)) {
  Object.defineProperty(ZOMBIES, ancien, { value: ZOMBIES[actif], enumerable: false, configurable: true });
}

// Type actif d'un id (alias résolu ; inconnu → 'errant').
export function typeMort(id) {
  if (ALIAS_MORTS[id]) return ALIAS_MORTS[id];
  return Object.prototype.hasOwnProperty.call(ZOMBIES, id) ? id : 'errant';
}
// Sexe d'un mort, tiré sur son identifiant (stable d'une sauvegarde à l'autre et chez les deux joueurs).
export function sexeMort(type, uid) {
  const d = ZOMBIES[type] || ZOMBIES.errant;
  const s = d.sexes || { h: 0.5, f: 0.5 };
  let h = 2166136261;
  const u = String(uid || '');
  for (let i = 0; i < u.length; i++) { h ^= u.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = ((h >>> 0) % 10000) / 10000;
  return r < (s.f || 0) ? 'f' : 'h';
}
// Nom affiché d'un mort selon son sexe.
export function nomMort(type, sexe) {
  const d = ZOMBIES[type] || ZOMBIES.errant;
  return (d.noms && d.noms[sexe]) || d.nom;
}
