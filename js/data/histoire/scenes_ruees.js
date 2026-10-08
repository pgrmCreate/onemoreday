// ============ Scènes des SIRÈNES (le rabattage de l'armée) — voir js/data/histoire/ruees.js ============
// Préfixe 'ru_'. Jouées par les déclencheurs 'flag' (ruee_annonce_*) que pose js/game/ruees.js.
// Elles disent POURQUOI la ville devient intenable, et OÙ aller tenir : la chaîne des Côtes, la Crau, la Touloubre.

export const SCENES_RUEES = {

  // ─────────── Chapitre 1 : la radio de Vidal capte l'armée en clair ───────────
  ru_salon_annonce: {
    illu: 'emperi_cour', musique: 'tension',
    texte: 'Tu as déjà un pied dans l’escalier quand la radio se remet à grésiller toute seule.\n\nCe n’est plus le PC Durance, mais une voix de femme, posée, qui lit en clair, sans code, un message destiné à d’autres postes :\n\n« … opération de rabattage sonore sur l’agglomération salonaise, à partir de demain. Réseau d’alerte et vecteurs aériens. Durée estimée : trente heures. Les éléments seront dirigés plein sud, vers la Crau. Fin du message. »\n\nVidal est monté derrière toi, et il a entendu. Il ne dit rien pendant un long moment.\n\n« Les sirènes, finit-il par souffler. Celles qui sonnaient le premier mercredi du mois, à midi, pour les essais. L’armée les a reprises, et la semaine dernière, ils les ont fait hurler une nuit entière. » Il enlève ses lunettes. « Quand ça hurle, ils courent tous, même ceux qui dormaient debout depuis trois semaines. Ils courent vers le bruit, et ils ne s’arrêtent plus. »',
    choix: [{ label: '« Et vous, ici ? »', suivant: 'ru_salon_annonce_2' }],
  },
  ru_salon_annonce_2: {
    illu: 'emperi_cour', musique: 'sombre',
    texte: '« Nous, on ferme la grille, on monte les enfants dans la tour et on attend. Les murs ont neuf cents ans, ils tiendront bien une nuit de plus. » Il te regarde. « Mais toi, tu n’as pas de murs, en tout cas pas de vrais. »\n\nLou s’est glissée sur la dernière marche, les genoux sous le menton.\n\n« Il faut sortir de la ville, dit-elle, et monter là-haut. » Elle tend le bras vers le nord, par la meurtrière, vers une ligne de collines couvertes de pins, sombre sur le ciel. « La chaîne des Côtes. Mon grand-père avait un cabanon de chasse, après la carrière. Il n’y a rien là-haut, que des pins et des sangliers. »\n\nVidal hoche lentement la tête. « Ou la Crau, à l’ouest, avec des cailloux à perte de vue, une bergerie tous les trois kilomètres, et personne. Ou le long de la Touloubre, vers Grans : au moins, il y a de l’eau. »\n\nIl remet ses lunettes.\n\n« Ça durera une journée, peut-être deux. Après, ce sera plus calme : plus plein, mais plus calme. »',
    choix: [
      {
        label: 'Retenir les trois endroits',
        effets: {
          decouvrir: ['chaine_cotes', 'crau_coussouls', 'touloubre'],
          journal: 'La radio de Vidal : l’armée va faire hurler les sirènes sur Salon, à partir de demain, pendant plus d’une journée. Quand ça hurle, tous les morts courent vers le bruit. Il faudra être loin : la chaîne des Côtes (le cabanon du grand-père de Lou), la Crau, ou la Touloubre, vers Grans.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────── Chapitre 2 : la fréquence 4 annonce le rabattage de la plaine ───────────
  ru_plaine_annonce: {
    illu: 'cales_grande_salle', musique: 'tension',
    texte: 'Le soir, autour du poste de Calès, quelqu’un a monté le son de la fréquence 4, celle de l’armée et de la Durance.\n\n« … phase deux du rabattage. Pélissanne, Lamanon, Eyguières, Grans, les axes de la nationale. Demain, à partir de l’aube. Les vecteurs aériens remonteront ensuite vers le nord. Fin. »\n\nLe silence tombe sur la grande salle, et Joëlle pose sa louche.\n\n« Les sirènes, sur les villages, cette fois. » Elle balaie la salle des yeux : les enfants, les lits de camp, la citerne. « Ici, on ferme la falaise et on ne bouge plus, personne ne descend. » Puis, plus bas, pour toi seulement : « Si tu dois être dehors demain, ne prends pas les routes. Reste dans les collines ou dans la Crau, là où il n’y a rien à rabattre. »',
    choix: [
      {
        label: '« Compris. »',
        effets: {
          decouvrir: ['chaine_cotes', 'crau_coussouls', 'touloubre'],
          journal: 'La fréquence 4 annonce des sirènes sur les villages de la plaine et les routes, à partir de demain à l’aube. Éviter les bourgs et les nationales ; tenir dans les collines ou dans la Crau.',
        },
        suivant: '#fin',
      },
    ],
  },
};
