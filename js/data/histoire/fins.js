// ============ LES FINS (écran de fin / bilan) ============
// Le drapeau posé par la dernière scène désigne la fin atteinte. Voir docs/HISTOIRE.md §8.
export const FINS = {
  cautere: {
    flag: 'fin_cautere', titre: 'Cautère', sousTitre: 'Le silence',
    cinematique: 'fin_cautere', scene: 'fin_cautere_1',
    resume: 'Tu as passé le pont, les manches baissées. Le pays salonais a brûlé, et la vérité avec lui. Tu vis parmi les vivants. Le dimanche, quand la cloche sonne, ta bouche se remplit.',
  },
  voix: {
    flag: 'fin_voix', titre: 'La Voix', sousTitre: 'La vérité',
    cinematique: 'fin_voix', scene: 'fin_voix_1',
    resume: 'Au milieu du pont, avec une barre de réseau, tu as dit au monde que les morts reviennent — et à quel prix. Cautère s’est arrêté. Le monde a eu un jour de plus pour décider. Il a décidé.',
  },
  transhumance_feu: {
    flag: 'fin_transhumance_feu', titre: 'La Transhumance', sousTitre: 'Vers le feu',
    cinematique: 'fin_transhumance_feu', scene: 'fin_feu_1',
    resume: 'Tu as pris le redon de Rose et tu as mené onze mille morts dans le feu, en marchant devant. Calès a passé le fleuve. Tu ne reviendras pas.',
  },
  transhumance_estive: {
    flag: 'fin_transhumance_estive', titre: 'La Transhumance', sousTitre: 'L’estive',
    cinematique: 'fin_transhumance_estive', scene: 'fin_estive_1',
    resume: 'Tu as pris le redon et tu as mené le troupeau au-delà de la Durance. Un pour un. Chaque matin, dans la foule, quelqu’un se redresse et demande de l’eau. Tu es le berger, maintenant.',
  },
};
