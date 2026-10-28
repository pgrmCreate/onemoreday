// ============ LES FINS (écran de fin / bilan) — docs/HISTOIRE.md §7 ============
// Le drapeau posé par la dernière scène désigne la fin atteinte.
// continuer : true → l'écran de fin propose « Continuer à survivre » : la partie reprend là où elle en est, sans quête.
export const FINS = {
  // provisoire : le nouveau début s'arrête à la porte du Refuge du Vieux-Vernègues, que l'on reconstruit ensuite
  // (docs/HISTOIRE_DEBUT_V3.md §5) ; quand le Refuge sera prêt, cette fin disparaîtra et l'histoire continuera
  debut: {
    flag: 'fin_debut', titre: 'À suivre', sousTitre: 'La porte du Vieux-Vernègues', continuer: false, decor: 'nuit_campagne',
    resume: 'Le début de l’histoire s’arrête ici pour l’instant. Le Refuge du Vieux-Vernègues, ceux qui y vivent et ce qui t’y attend sont en train d’être construits.',
  },
  pont: {
    flag: 'fin_pont', titre: 'De l’autre côté', sousTitre: 'Le pont de Mallemort',
    cinematique: 'fin_pont', scene: 'pon_traverser_2', continuer: false,
    resume: 'Tu as passé le pont suspendu de Mallemort à l’aube, grâce à la place qu’Hélène t’avait cédée. De l’autre côté, il y a un camp, une douche froide, des listes de noms qu’on lit à voix haute, et le soir, la voix d’Inès à la radio. Tu as gardé en vie ceux que tu as pu, un jour de plus.',
  },
  place: {
    flag: 'fin_place', titre: 'Sa place', sousTitre: 'La rive sud',
    cinematique: 'fin_place', scene: 'pon_place_fin', continuer: true,
    resume: 'Hélène s’était rayée de la liste pour toi. Au pont, tu lui as rendu sa place, et elle a traversé. Tu restes sur la rive sud, avec la Durance entre toi et le reste du monde, et tout un pays à traverser chaque jour pour rester {vivant|vivante}.',
  },
  ligne: {
    flag: 'fin_ligne', titre: 'La ligne', sousTitre: 'Deux cents mètres',
    cinematique: 'fin_seul', scene: 'pon_mordu_fin', continuer: true,
    resume: 'À la ligne des deux cents mètres, l’infirmier militaire a trouvé ta morsure, et l’armée t’a {refoulé|refoulée}. Les autres ont traversé. Toi, tu as encore quelques jours, peut-être plus, et un petit feu sur la rive sud.',
  },
  seul: {
    flag: 'fin_seul', titre: 'Encore un jour', sousTitre: 'Le pays',
    cinematique: 'fin_seul', scene: 'pont_rate_2b', continuer: true,
    resume: 'Le pont de Mallemort ne rouvrira plus. La radio s’est tue, la brume pâlit un peu chaque nuit, et il reste le pays, ses villages vides et ses morts. Il reste aussi ce que tu sais faire : trouver de l’eau, du bois, un endroit où dormir, et te lever le lendemain.',
  },
};
