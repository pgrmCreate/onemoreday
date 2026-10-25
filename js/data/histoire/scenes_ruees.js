// ============ Scènes des SIRÈNES (le rabattage de l'armée) — voir js/data/histoire/ruees.js ============
// Préfixe 'ru_'. Jouées par les déclencheurs 'flag' (ruee_annonce_*) que pose js/game/ruees.js, à l'acte V
// (après l'annonce du pont). Elles disent POURQUOI une zone devient intenable, et OÙ aller tenir :
// la chaîne des Côtes, la Crau, la Touloubre. On peut les recevoir n'importe où : l'annonce tombe d'un drone.

export const SCENES_RUEES = {

  // ─────────── Les premières sirènes de l'acte V : Salon ───────────
  ru_salon_annonce: {
    illu: 'plaine_route', musique: 'tension', orateur: null,
    texte: 'Un bourdonnement passe au-dessus de toi, très haut, et une voix d’homme enregistrée tombe du ciel, si fort que les oiseaux s’envolent des arbres.\n\n« Avis à la population civile. Une opération de rabattage sonore aura lieu sur l’agglomération de Salon-de-Provence à partir de demain. Les sirènes d’alerte seront déclenchées pendant plus d’une journée. Toute personne présente dans la zone doit s’en éloigner. »\n\nLe drone répète le message deux fois, puis il s’éloigne vers le nord, et sa voix se perd au-dessus de la plaine.\n\nTu sais ce que ça veut dire, parce que Rudy te l’a expliqué une nuit, sur le rempart du Refuge. Quand les sirènes hurlent, tous les morts qui les entendent se mettent à courir vers le bruit, même ceux qui dormaient debout depuis des semaines, et ils ne s’arrêtent plus. Pendant un jour ou deux, Salon et ses routes vont devenir un abattoir.\n\nIl faudra être loin, là où il n’y a rien à rabattre : dans les pins de la chaîne des Côtes, au nord de la ville, dans les galets de la Crau, ou le long de la Touloubre, vers Grans, où il y a au moins de l’eau.',
    choix: [
      {
        label: 'Retenir les endroits où tenir',
        effets: {
          decouvrir: ['chaine_cotes', 'crau_coussouls', 'touloubre'],
          journal: 'Un drone de l’armée annonce des sirènes sur Salon à partir de demain, pendant plus d’une journée. Quand ça hurle, tous les morts courent vers le bruit. Il faudra être loin : dans les collines de la chaîne des Côtes, dans la Crau, ou le long de la Touloubre, vers Grans.',
        },
        suivant: '#fin',
      },
    ],
  },

  // ─────────── Les sirènes sur les villages de la plaine ───────────
  ru_plaine_annonce: {
    illu: 'plaine_route', musique: 'tension', orateur: null,
    texte: 'Le soir, le bourdonnement des drones revient, plus bas cette fois, et la même voix enregistrée tombe sur la campagne.\n\n« Avis à la population civile. Phase deux de l’opération de rabattage : Pélissanne, Lamanon, Eyguières, Grans et les axes de la nationale, à partir de demain à l’aube. Toute personne présente dans ces zones doit s’en éloigner et éviter les routes. »\n\nCette fois, ce sont les villages qui vont hurler, et les routes qui les relient. Les morts de toute la plaine vont se lever en même temps et courir d’un bourg à l’autre en suivant le bruit.\n\nDemain, il ne faudra prendre ni les routes ni les villages. Les collines, la Crau ou les berges de la Touloubre, là où il n’y a rien à rabattre, seront plus sûres que n’importe quel mur.',
    choix: [
      {
        label: 'Retenir l’avertissement',
        effets: {
          decouvrir: ['chaine_cotes', 'crau_coussouls', 'touloubre'],
          journal: 'Un drone annonce des sirènes sur les villages de la plaine (Pélissanne, Lamanon, Eyguières, Grans) et sur les routes, à partir de demain à l’aube. Éviter les bourgs et les routes ; tenir dans les collines, la Crau ou le long de la Touloubre.',
        },
        suivant: '#fin',
      },
    ],
  },
};
