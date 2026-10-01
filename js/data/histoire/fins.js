// ============ LES FINS (écran de fin / bilan) ============
// Le drapeau posé par la dernière scène désigne la fin atteinte. Voir docs/HISTOIRE.md §8.
export const FINS = {
  cautere: {
    flag: 'fin_cautere', titre: 'Cautère', sousTitre: 'Le silence',
    cinematique: 'fin_cautere', scene: 'fin_cautere_1',
    resume: 'Tu as passé le pont en cachant ta morsure, et tu t’es {tu|tue}. Le pays salonais a brûlé, et la vérité avec lui. Tu vis parmi les vivants. Mais le dimanche, quand la cloche de l’église sonne, ta bouche se remplit de salive.',
  },
  voix: {
    flag: 'fin_voix', titre: 'La Voix', sousTitre: 'La vérité',
    cinematique: 'fin_voix', scene: 'fin_voix_1',
    resume: 'Au milieu du pont, dès que ton téléphone a capté le réseau, tu as dit au monde que les morts peuvent revenir, et à quel prix : un vivant pour chaque mort. L’incendie s’est arrêté. Le monde a eu un jour de plus pour décider. Il a décidé.',
  },
  transhumance_feu: {
    flag: 'fin_transhumance_feu', titre: 'La Transhumance', sousTitre: 'Vers le feu',
    cinematique: 'fin_transhumance_feu', scene: 'fin_feu_1',
    resume: 'Tu as pris le redon, la grosse cloche de Rose, et tu as mené onze mille morts dans le feu, en marchant devant eux. Les vivants de Calès ont passé le fleuve. Toi, tu ne reviendras pas.',
  },
  transhumance_estive: {
    flag: 'fin_transhumance_estive', titre: 'La Transhumance', sousTitre: 'L’estive',
    cinematique: 'fin_transhumance_estive', scene: 'fin_estive_1',
    resume: 'Tu as pris le redon, la grosse cloche de Rose, et tu as mené le troupeau des morts de l’autre côté de la Durance. Là-bas, ils ont mangé des vivants : un pour un. Chaque matin, dans la foule, quelqu’un se relève et demande de l’eau. C’est toi qui mènes le troupeau, maintenant.',
  },
};
