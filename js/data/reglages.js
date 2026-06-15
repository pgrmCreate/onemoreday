// ============================================================================
//  RÉGLAGES — tous les nombres « qui se règlent » réunis ici, au même endroit
// ============================================================================
// But : pouvoir AJUSTER le ressenti du jeu (vitesse des morts, durée des gestes,
// dureté du combat, densité des hordes…) sans aller fouiller dans la logique.
// Chaque champ est commenté avec SON EFFET concret. Pour comprendre comment ces
// réglages s'enchaînent, lire `ARCHITECTURE.md` (section « Réglages »).
//
// Règle d'or : la LOGIQUE vit dans js/*.js, les NOMBRES vivent ici. Si tu te
// surprends à changer un chiffre en dur ailleurs, remonte-le dans ce fichier.
// ----------------------------------------------------------------------------

export const REGLAGES = {

  // ===========================================================================
  //  LE TEMPS DU MONDE
  // ===========================================================================
  // Le temps ne « saute » plus par action : il COULE en temps réel. Une horloge
  // de fond (js/map.js → battementMonde) avance le jeu d'une minute toutes les
  // BATTEMENT_MS. Tout le reste (faim, soif, fatigue) en découle.
  temps: {
    BATTEMENT_MS: 1000,   // 1 000 ms réelles = 1 minute de jeu (12 min réelles = une demi-journée).
  },                      // ↑ pour ralentir l'écoulement du temps, ↓ pour l'accélérer.

  // ===========================================================================
  //  LA LUMIÈRE — durée des piles / torche et PORTÉE du halo de lampe
  // ===========================================================================
  // L'usure s'applique EN CONTINU (js/inventory.js → usureLampes, appelé par le
  // battement du monde) : une lampe allumée vide ses piles que tu agisses ou non.
  lumiere: {
    MIN_PAR_PILES: 1440,  // minutes de jeu par paire de piles. 1440 = 24 h NON-STOP avant de changer.
                          //   ↑ pour des piles qui durent plus longtemps, ↓ pour plus de tension.
    MIN_TORCHE: 45,       // une torche enflammée se consume en ~45 min (volontairement courte).

    // PORTÉE (en cases) du halo de chaque lampe à l'intérieur. La lampe torche
    // (de poche) porte loin ; la torche enflammée éclaire au plus près. Défaut : 1.
    RAYONS: { lampe_torche: 2, lampe_frontale: 2, torche: 1 },
  },

  // ===========================================================================
  //  LA FOUILLE — une action CONTINUE qui découvre le butin au fil de la barre
  // ===========================================================================
  // Fouiller une case se fait d'un seul trait : la barre se remplit, les objets
  // se révèlent peu à peu et tombent « au sol ». À 100 % la case est vide. On peut
  // annuler à tout moment et ramasser ce qui a déjà été trouvé.
  fouille: {
    // Durée d'une fouille COMPLÈTE (0→100 %), en ms réelles, par échelle de carte.
    DUREE_MS: { interieur: 11000, quartier: 15000, ville: 18000, region: 24000 },
    TATONS_MULT: 1.25,    // fouiller à tâtons (sans lumière) est plus lent ET moins payant.
    COOP_MULT: 1.7,       // à DEUX dans la même salle, la barre se remplit COOP_MULT fois plus vite.
  },

  // ===========================================================================
  //  LES MORTS EN TEMPS RÉEL SUR LA CARTE  (js/zombies_map.js)
  // ===========================================================================
  // Les morts errent, te repèrent (cône de vue / ouïe), te poursuivent et, au
  // contact, déclenchent un ANNEAU qui se vide avant la morsure → combat.
  zombies: {
    TICK_MS: 900,         // horloge des morts : un « tick » de réflexion/mouvement toutes les 900 ms.
                          //   ↑ = monde au ralenti général ; ↓ = monde nerveux. (Affecte TOUTES les échelles.)

    // L'ANNEAU DE CONTACT — le compte à rebours, une fois le mort collé à toi,
    // avant la morsure. C'est TON temps de réaction : t'écarter, frapper, fuir.
    SPIN_TICKS: 3,        // 3 ticks ≈ 2,7 s en intérieur. (Multiplié par échelle, voir `echelles`.)
                          //   ↑ pour avoir plus de temps de gérer ; ↓ pour des morts plus brutaux.

    // L'ERRANCE — quand le mort ne t'a pas (encore) repéré, il flâne.
    P_ERRANCE: 0.4,       // probabilité de faire un pas à un tick d'errance. (Divisée par échelle.)

    MEMOIRE_TICKS: 8,     // ticks de poursuite sans te revoir avant qu'il renonce et reparte errer.
    CONE_PORTEE: 7,       // portée max (en cases/sauts) du cône de vue d'un mort.
    OUIE_JOUEUR: 5,       // distance à laquelle TOI tu ENTENDS un mort bouger hors de vue (point estompé).

    // La CADENCE DU PAS selon la lourdeur du mort (champ `vitesse` du bestiaire,
    // js/data/zombies.js : plus le nombre est grand, plus le mort est « lent »).
    //   - un mort « lent »  avance un tick sur PERIODE_LENT,
    //   - un mort « vif »   avance un tick sur PERIODE_VIF.
    // (Ces périodes sont elles aussi étirées par l'échelle, voir `echelles`.)
    SEUIL_LENT: 6000,     // vitesse ≥ 6000 → le mort est « lent » (la majorité du bestiaire l'est).
    PERIODE_VIF: 1,       // un mort vif (coureur, enragé, chien) avance presque à chaque tick utile.
    PERIODE_LENT: 2,      // un mort lent traîne : un pas sur deux. De base, un mort se déplace LENTEMENT.
  },

  // ===========================================================================
  //  L'ÉCHELLE DE LA CARTE CHANGE TOUT LE RAPPORT AU TEMPS
  // ===========================================================================
  // Une case n'a pas la même TAILLE selon l'échelle :
  //   • intérieur = des PIÈCES (quelques mètres) → un mort traverse une case vite :
  //     c'est la vitesse « normale », de référence.
  //   • quartier  = un PLAN DE RUES où un nœud est tout un pâté de maisons :
  //     traverser une case, c'est marcher des dizaines de mètres. Le mort doit donc
  //     mettre BEAUCOUP plus de temps à passer d'un nœud à l'autre — il rampe — et
  //     l'anneau de contact dure d'autant plus longtemps (tu as le temps de t'écarter).
  // (ville / région : pas de morts en chair → ces échelles n'ont pas d'entrée.)
  //
  // cadenceZombie : multiplie la PÉRIODE du pas (4 = quatre fois plus lent à se déplacer).
  // anneauZombie  : multiplie SPIN_TICKS (3 = anneau de contact trois fois plus long).
  // capDiv        : densité de peuplement = nb de cases ÷ capDiv (plus petit = plus de morts).
  echelles: {
    interieur: { cadenceZombie: 1, anneauZombie: 1, capDiv: 7 },
    quartier:  { cadenceZombie: 4, anneauZombie: 3, capDiv: 5 },
    // valeurs par défaut si une échelle n'est pas listée : { cadenceZombie:1, anneauZombie:1, capDiv:7 }
  },

  // ===========================================================================
  //  LE COMBAT EN TEMPS RÉEL  (js/combat.js)
  // ===========================================================================
  // La jauge de MENACE du mort se remplit ; pleine, il attaque. Chaque geste coûte
  // de l'ENDURANCE. L'attaque se CHARGE (maintenir = armer, relâcher = frapper).
  combat: {
    // Coût en endurance de chaque action.
    COUTS: { tir: 8, pousser: 10, jeter: 12, fuir: 22, changer: 5, bander: 16, esquive: 6 },

    // RÉCUPÉRATION D'ENDURANCE (par seconde). On récupère LE PLUS VITE quand on ne
    // fait RIEN : ni charge d'attaque, ni garde, ni bouton maintenu. Dès qu'on agit
    // (on charge un coup, on lève la garde, on s'arc-boute), la récupération chute.
    REGEN: { repos: 9, actif: 2.2 },

    // SE DÉFENDRE — la garde se CHARGE comme une arme : plus on maintient, meilleure
    // est la protection (réduction des dégâts, esquive, blocage). Mais une garde poussée
    // à fond ne tient pas : arrivée au max, elle ne dure que `tenueMax`, puis les bras
    // lâchent et TOUTE la protection tombe d'un coup (comme si l'on ne se défendait pas).
    DEFENSE: {
      duree: 5000,        // ms pour charger la garde de 0 (nulle) à 1 (maximale) — ~2× l'attaque.
      tenueMax: 2000,     // ms de maintien au maximum avant que la garde ne s'effondre à zéro.
      reducMax: 0.6,      // réduction des dégâts à garde pleine (proportionnelle à la charge).
      esquiveMax: 0.32,   // bonus d'esquive à garde pleine (proportionnel à la charge).
    },

    // CHAQUE bouton rond se MAINTIENT : une jauge se remplit, l'action n'a lieu
    // qu'une fois la jauge pleine (relâcher avant = rien). Durée de remplissage (ms).
    MAINTIEN: { pousser: 850, fuir: 1150, acces: 600 },

    // ÊTRE À TERRE — un mort repoussé avec succès tombe et ne peut plus attaquer
    // un court instant ; pendant ce temps tes coups portent plus fort et critiquent
    // davantage. Mais rater la poussée, c'est s'exposer à une morsure.
    ATERRE: {
      duree: 4200,        // ms pendant lesquelles le mort reste au sol (menace gelée).
      multiDeg: 1.6,      // tes dégâts sont multipliés tant qu'il est à terre.
      bonusCrit: 0.25,    // chance de critique ajoutée tant qu'il est à terre.
      risqueMorsure: 0.55,// proba de se faire mordre si la poussée échoue.
    },

    // L'attaque chargée : maintenir arme le coup (ou la visée), relâcher le déclenche.
    CHARGE: {
      duree: 1300,        // ms pour charger un coup de mêlée de 0 à 1.
      coutMin: 8,         // endurance d'un coup relâché aussitôt.
      coutPlein: 24,      // endurance AJOUTÉE à pleine charge (8 + 24 = 32 au total).
      delaiMin: 120,      // ms entre relâcher et toucher, à charge nulle.
      delaiMax: 650,      // ... à pleine charge : un coup de fléau, ça s'annonce.
      viseeDuree: 1600,   // ms de visée pleine (armes à feu) — la compétence « visée » l'accélère.
    },
  },
};

// ---------------------------------------------------------------------------
// Accès pratique à la config d'une échelle, avec valeurs par défaut sûres
// (toute échelle non listée se comporte « comme l'intérieur » : vitesse normale).
export const ECHELLE_DEFAUT = { cadenceZombie: 1, anneauZombie: 1, capDiv: 7 };
export function reglageEchelle(echelle) {
  return REGLAGES.echelles[echelle] || ECHELLE_DEFAUT;
}
