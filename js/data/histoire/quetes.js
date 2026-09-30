// ============ QUÊTES (REFONTE §4.6) ============
// Une seule quête « principale » active à la fois par chapitre (q_prologue → q_protocole → q_traversee → q_final).
// Convention : la condition { quete: ['id', 'etape'] } est vraie si l'étape COURANTE de la quête est 'etape'.
// Les étapes sont listées dans l'ordre d'affichage ; certaines sont des embranchements (ex. 'vidal_maud').

export const QUETES = {
  q_prologue: {
    titre: 'Lot 14', chapitre: 0, principale: true,
    etapes: {
      debut:   { objectif: 'Sortir de la housse', lieu: 'cimetiere' },
      scelle:  { objectif: 'Fouiller le sachet de scellés agrafé à ta housse', lieu: 'cimetiere' },
      sortir:  { objectif: 'Trouver de la lumière et sortir du cimetière Saint-Roch', lieu: 'cimetiere' },
      horloge: { objectif: 'Rejoindre la Tour de l’Horloge, place Crousillat', lieu: 'tour_horloge' },
      monter:  { objectif: 'Monter jusqu’aux cloches', lieu: 'tour_horloge' },
      fin:     { objectif: 'Dormir chez Nostradamus' },
    },
  },
  q_protocole: {
    titre: 'Les vivants', chapitre: 1, principale: true,
    etapes: {
      debut:         { objectif: 'Écouter ce que Maud a à dire', lieu: 'nostradamus' },
      emperi:        { objectif: 'Monter à l’Empéri et obtenir la radio de Vidal', lieu: 'emperi' },
      saint_laurent: { objectif: 'Retrouver Lou et Nathan à la collégiale Saint-Laurent', lieu: 'saint_laurent' },
      radio:         { objectif: 'Ramener Lou à l’Empéri, puis essayer la radio', lieu: 'emperi' },
      hopital:       { objectif: 'Récupérer le registre de Maud, au sous-sol de l’hôpital', lieu: 'hopital' },
      confrontation: { objectif: 'Rapporter le registre à Maud — et lui demander des comptes', lieu: 'nostradamus' },
      vidal_maud:    { objectif: 'Dire à Vidal ce que Maud a fait de Samir', lieu: 'emperi' },
      sonnailles:    { objectif: 'Des cloches dans la Crau : rejoindre l’Empéri avant elles', lieu: 'emperi' },
      siege:         { objectif: 'Tenir l’Empéri jusqu’à l’aube', lieu: 'emperi' },
      fin:           { objectif: 'Partir vers le nord' },
    },
  },
  q_sac_rouge: {
    titre: 'Le mort au sac rouge', chapitre: 1, principale: false,
    etapes: {
      debut: { objectif: 'Retrouver ton sac rouge dans les ronces, sous le rempart de l’Empéri', lieu: 'emperi' },
      fin:   { objectif: 'Tu sais ce qui s’est passé le 6 septembre' },
    },
  },
  q_traversee: {
    titre: 'La transhumance', chapitre: 2, principale: true,
    etapes: {
      cales:     { objectif: 'Rejoindre les grottes de Calès, au-dessus de Lamanon', lieu: 'cales' },
      mallemort: { objectif: 'Reconnaître le pont de Mallemort', lieu: 'mallemort' },
      retour:    { objectif: 'Rendre compte à Joëlle', lieu: 'cales' },
      ba701:     { objectif: 'Trouver une radio militaire et le classeur d’authentification à la BA 701', lieu: 'ba701' },
      contact:   { objectif: 'Appeler le PC Durance depuis l’antenne, en haut de la falaise de Calès', lieu: 'cales' },
      depart:    { objectif: 'Dire à Joëlle quand partir (le Berger t’attend encore à Vieux-Vernègues ?)', lieu: 'cales' },
      fin:       { objectif: 'Le mistral se lève' },
    },
  },
  q_berger: {
    titre: 'Le Berger', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Le Berger t’attend à Vieux-Vernègues', lieu: 'vernegues' },
      rose:  { objectif: 'Parler à Rose, seule, dans la sacristie', lieu: 'vernegues' },
      fin:   { objectif: 'Tu connais le secret du redon' },
    },
  },
  q_jour_de_plus: {
    titre: 'Un jour de plus', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Retarder le troupeau : la martelière du canal (Calès), la cloche de Sénas', lieu: 'senas' },
      fin:   { objectif: 'Le troupeau a pris du retard' },
    },
  },
  q_temoignage: {
    titre: 'La preuve', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Filmer ton témoignage avec Lou (téléphone chargé)', lieu: 'cales' },
      fin:   { objectif: 'Le témoignage est dans ton téléphone' },
    },
  },
  q_final: {
    titre: 'Le mistral', chapitre: 3, principale: true,
    etapes: {
      depart: { objectif: 'Conduire la colonne de Calès jusqu’au pont de Mallemort', lieu: 'mallemort' },
      pont:   { objectif: 'Le pont', lieu: 'mallemort' },
      fin:    { objectif: '—' },
    },
  },
};
