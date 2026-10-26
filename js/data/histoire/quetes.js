// ============ QUÊTES (docs/HISTOIRE.md §6) ============
// Une quête « principale » par acte (q_refuge → q_crau → q_chute → q_brume → q_pont) : le HUD montre l'objectif de la
// principale du chapitre le plus avancé. Les dispersés de l'acte V ont chacun leur petite quête secondaire.
// Convention : la condition { quete: ['id', 'etape'] } est vraie si l'étape COURANTE de la quête est 'etape'.
// `heures` d'une étape : la carte n'y mène qu'à ces heures-là (générique, voir js/travel/carte.js).

export const QUETES = {
  // Le début (docs/HISTOIRE_DEBUT_V3.md) : pas de « Nouvel objectif » — chaque étape porte une pensée du personnage, dite
  // une fois (js/ui/notif.js) ; l'objectif reste lisible dans le menu Objectifs.
  q_debut: {
    titre: 'Le bois', chapitre: 0, principale: true,
    etapes: {
      panne:      { objectif: 'Passer la nuit au camp, près du fourgon, sur la piste du bois de la Barben', lieu: 'bois_barben',
                    pensee: 'Le moteur ne repartira pas ce soir. On va dormir ici, au bord de la piste.' },
      vivres:     { objectif: 'Rapporter à manger du mas, en bas du sentier du vallon, et le ranger dans la caisse du camp', lieu: 'bois_barben',
                    pensee: 'Il faut trouver à manger pour tout le monde. René parle d’un mas, en bas du vallon.' },
      camp:       { objectif: 'Monter le camp : un feu dans le creux sous les pins, une ligne de boîtes sur un fil, un abri', lieu: 'bois_barben',
                    pensee: 'Si on reste, il faut un vrai camp. Un feu qu’on ne voit pas, des boîtes sur un fil, un abri pour Laura.' },
      nuit:       { objectif: 'Passer la nuit au camp', lieu: 'bois_barben' },
      vigie:      { objectif: 'Monter à la vigie par le pare-feu, au nord de la piste, et appeler à l’aide avec la radio', lieu: 'vigie_barben',
                    pensee: 'La vigie, en haut du pare-feu. Si la radio marche, quelqu’un viendra peut-être nous chercher.' },
      vigie_haut: { objectif: 'Monter dans la cabine de la vigie et appeler à l’aide avec la radio', lieu: 'vigie_barben' },
      retour:     { objectif: 'Redescendre au camp par le pare-feu', lieu: 'bois_barben' },
      chercher:   { objectif: 'Chercher Mathis autour du camp', lieu: 'bois_barben', pensee: 'Mathis. Où est Mathis ?' },
      nuit3:      { objectif: 'Passer la nuit au camp avec ceux qui restent', lieu: 'bois_barben' },
      route:      { objectif: 'Aller au Vieux-Vernègues avec René, Laura et Mathis', lieu: 'vernegues',
                    pensee: 'Vernègues. On partira à l’aube, avec ce qui reste.' },
      fin:        { objectif: 'Le Refuge du Vieux-Vernègues' },
    },
  },
  q_refuge: {
    titre: 'Le Refuge', chapitre: 1, principale: true,
    etapes: {
      arrivee:     { objectif: 'Te présenter à la porte Notre-Dame du Refuge, à Miramas-le-Vieux', lieu: 'miramas_le_vieux' },
      quarantaine: { objectif: 'Passer la nuit en quarantaine dans la tour-porte', lieu: 'miramas_le_vieux' },
      corvees:     { objectif: 'Avant la nuit : remonter l’eau du puits, et fermer la brèche du rempart nord avec Rudy', lieu: 'miramas_le_vieux' },
      garde:       { objectif: 'Monter la garde à la brèche avec Rudy jusqu’à deux heures du matin', lieu: 'miramas_le_vieux' },
      fin:         { objectif: 'Suivre Fernand jusqu’à la bergerie de Cabassole' },
    },
  },
  q_crau: {
    titre: 'La bergerie', chapitre: 2, principale: true,
    etapes: {
      route:    { objectif: 'Suivre Fernand jusqu’à la bergerie de Cabassole, dans la Crau', lieu: 'bergerie' },
      bergerie: { objectif: 'Trouver les antibiotiques de Gérard dans la bergerie de Cabassole', lieu: 'bergerie' },
      nuit:     { objectif: 'Passer la nuit au mas avec Fernand : on rentrera à l’aube', lieu: 'bergerie' },
      retour:   { objectif: 'Rentrer au Refuge avec Fernand', lieu: 'miramas_le_vieux' },
      fin:      { objectif: 'Défendre le Refuge' },
    },
  },
  q_chute: {
    titre: 'La chute', chapitre: 3, principale: true,
    etapes: {
      siege: { objectif: 'Tenir le rempart avec les autres : les morts montent', lieu: 'miramas_le_vieux' },
      fuir:  { objectif: 'Le Refuge est perdu : fuir par la poterne, au sud du village', lieu: 'miramas_le_vieux' },
      fin:   { objectif: 'Rejoindre la Poudrerie de Saint-Chamas' },
    },
  },
  q_brume: {
    titre: 'La brume', chapitre: 4, principale: true,
    etapes: {
      poudrerie: { objectif: 'Descendre jusqu’à la Poudrerie de Saint-Chamas, au bord de l’étang', lieu: 'saint_chamas' },
      attendre:  { objectif: 'Attendre les autres à la Poudrerie, comme l’a demandé Hélène', lieu: 'saint_chamas' },
      fuir:      { objectif: 'La brume monte : grimper jusqu’à Cornillon-Confoux, le village perché', lieu: 'cornillon' },
      fin:       { objectif: 'Passer la nuit à Cornillon, au-dessus de la brume' },
    },
  },
  q_pont: {
    titre: 'Le pont', chapitre: 5, principale: true,
    etapes: {
      preparer: { objectif: 'Être au pont de Mallemort le mercredi 7 octobre avant 6 h : l’armée ne l’ouvre qu’une heure. Ceux de Cornillon partiront le mardi soir.', lieu: 'mallemort' },
      attendre: { objectif: 'Attendre l’aube au bord du pont de Mallemort', lieu: 'mallemort' },
      dernier:  { objectif: 'Dernière chance : être au pont de Mallemort le mercredi 14 octobre avant 6 h', lieu: 'mallemort' },
      fin:      { objectif: 'Le pont est derrière toi' },
    },
  },
  q_bastien: {
    titre: 'Bastien', chapitre: 5, principale: false,
    etapes: {
      debut: { objectif: 'Retrouver Bastien : il a fui vers Istres, où vit sa sœur', lieu: 'istres' },
      fin:   { objectif: 'Tu sais ce qu’est devenu Bastien' },
    },
  },
  q_karine: {
    titre: 'Karine et Noa', chapitre: 5, principale: false,
    etapes: {
      debut:  { objectif: 'Retrouver Karine et Noa : Karine parlait d’un meunier, à Grans', lieu: 'grans' },
      soigner: { objectif: 'Rapporter des antibiotiques à Noa, au moulin de Grans', lieu: 'grans' },
      fin:    { objectif: 'Tu sais ce que sont devenues Karine et Noa' },
    },
  },
  q_rudy: {
    titre: 'Rudy', chapitre: 5, principale: false,
    etapes: {
      debut:   { objectif: 'Retrouver Rudy et son camion : il voulait prendre l’autoroute à Lançon', lieu: 'lancon' },
      gasoil:  { objectif: 'Rapporter vingt litres de gasoil à Rudy, au péage de Lançon', lieu: 'lancon' },
      fin:     { objectif: 'Tu as réglé ton compte avec Rudy' },
    },
  },
};
