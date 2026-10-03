// ============ QUÊTES (REFONTE §4.6) ============
// Une seule quête « principale » active à la fois par chapitre (q_prologue → q_protocole → q_traversee → q_final).
// Convention : la condition { quete: ['id', 'etape'] } est vraie si l'étape COURANTE de la quête est 'etape'.
// Les étapes sont listées dans l'ordre d'affichage ; certaines sont des embranchements (ex. 'vidal_maud').

export const QUETES = {
  q_prologue: {
    titre: 'Lot 14', chapitre: 0, principale: true,
    etapes: {
      debut:   { objectif: 'Sortir de la housse mortuaire', lieu: 'cimetiere' },
      scelle:  { objectif: 'Fouiller le sachet agrafé à ta housse, dans le caveau', lieu: 'cimetiere',
        guide: [{ lieu: 'cimetiere', marqueur: 'scelle_effets', texte: 'Fouille le sachet agrafé à ta housse (au fond du caveau)' }] },
      // guide : le premier dont la condition est vraie s'affiche en haut de l'écran, et un losange marque l'endroit.
      sortir:  { objectif: 'Trouver une lumière, puis sortir du cimetière Saint-Roch', lieu: 'cimetiere',
        guide: [
          { lieu: 'cimetiere', si: { pasFlag: 'pro_lampe' }, marqueur: 'soldat_nrbc', texte: 'Dehors, la lueur rouge : le soldat a une lampe' },
          { lieu: 'cimetiere', si: { non: { ou: [{ objet: 'pelle' }, { objet: 'cle_grille_saint_roch' }, { flag: 'pro_grille_ouverte' }] } }, marqueur: 'remise_etabli', texte: 'Trouve de quoi te défendre : la remise, près de la loge' },
          { lieu: 'cimetiere', si: { pasObjet: 'cle_grille_saint_roch' }, marqueur: 'loge_gardien', texte: 'La clé de la grille est dans la loge du gardien (il dort)' },
          { lieu: 'cimetiere', marqueur: 'grille_sortie', texte: 'Ouvre la grille principale, au sud' },
        ] },
      horloge: { objectif: 'Rejoindre la Tour de l’Horloge, place Crousillat, et y allumer une lumière', lieu: 'tour_horloge',
        guide: [{ lieu: 'cimetiere', sortie: true, texte: 'Sors sur le boulevard : la carte de Salon t’attend' }] },
      monter:  { objectif: 'Monter en haut de la Tour de l’Horloge', lieu: 'tour_horloge' },
      fin:     { objectif: 'Dormir dans la maison de Nostradamus' },
    },
  },
  q_protocole: {
    titre: 'Les vivants', chapitre: 1, principale: true,
    etapes: {
      debut:         { objectif: 'Écouter ce que Maud a à dire, chez Nostradamus', lieu: 'nostradamus' },
      emperi:        { objectif: 'Monter au château de l’Empéri et obtenir la radio de Vidal', lieu: 'emperi' },
      saint_laurent: { objectif: 'Retrouver Lou et Nathan à la collégiale Saint-Laurent', lieu: 'saint_laurent' },
      radio:         { objectif: 'Ramener Lou à l’Empéri, puis essayer la radio', lieu: 'emperi' },
      hopital:       { objectif: 'Récupérer le registre de Maud, au sous-sol de l’hôpital', lieu: 'hopital' },
      confrontation: { objectif: 'Rapporter le registre à Maud, chez Nostradamus, et exiger la vérité', lieu: 'nostradamus' },
      vidal_maud:    { objectif: 'Dire à Vidal, à l’Empéri, ce que Maud a fait de Samir', lieu: 'emperi' },
      sonnailles:    { objectif: 'Les morts arrivent : rentrer à l’Empéri avant eux', lieu: 'emperi' },
      siege:         { objectif: 'Défendre l’Empéri jusqu’à l’aube', lieu: 'emperi' },
      fin:           { objectif: 'Quitter Salon vers le nord' },
    },
  },
  q_sac_rouge: {
    titre: 'Le mort au sac rouge', chapitre: 1, principale: false,
    etapes: {
      debut: { objectif: 'Retrouver ton sac rouge dans les ronces, sous le rempart de l’Empéri', lieu: 'emperi' },
      fin:   { objectif: 'Tu sais maintenant ce qui t’est arrivé le 6 septembre' },
    },
  },
  q_traversee: {
    titre: 'La transhumance', chapitre: 2, principale: true,
    etapes: {
      cales:     { objectif: 'Rejoindre les grottes de Calès, au-dessus de Lamanon', lieu: 'cales' },
      mallemort: { objectif: 'Aller observer le pont de Mallemort et la ligne de l’armée', lieu: 'mallemort' },
      retour:    { objectif: 'Retourner à Calès et faire ton rapport à Joëlle', lieu: 'cales' },
      ba701:     { objectif: 'Trouver une radio militaire et le classeur des codes à la base aérienne 701', lieu: 'ba701' },
      contact:   { objectif: 'Appeler l’armée (le PC Durance) depuis l’antenne, en haut de la falaise de Calès', lieu: 'cales' },
      depart:    { objectif: 'Dire à Joëlle quand partir (le Berger t’attend peut-être encore à Vieux-Vernègues)', lieu: 'cales' },
      fin:       { objectif: 'Le mistral se lève' },
    },
  },
  q_berger: {
    titre: 'Le Berger', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Retrouver le Berger à Vieux-Vernègues', lieu: 'vernegues' },
      rose:  { objectif: 'Parler à Rose en tête-à-tête, dans la sacristie', lieu: 'vernegues' },
      fin:   { objectif: 'Tu connais le secret du redon, la grosse cloche de Rose' },
    },
  },
  q_jour_de_plus: {
    titre: 'Un jour de plus', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Retarder le troupeau : ouvrir la vanne du canal (Calès) ou sonner la cloche de Sénas', lieu: 'senas' },
      fin:   { objectif: 'Le troupeau a pris du retard' },
    },
  },
  q_temoignage: {
    titre: 'La preuve', chapitre: 2, principale: false,
    etapes: {
      debut: { objectif: 'Filmer ton témoignage avec Lou (il faut un téléphone chargé)', lieu: 'cales' },
      fin:   { objectif: 'Ton témoignage est enregistré dans ton téléphone' },
    },
  },
  q_final: {
    titre: 'Le mistral', chapitre: 3, principale: true,
    etapes: {
      depart: { objectif: 'Conduire la colonne de Calès jusqu’au pont de Mallemort', lieu: 'mallemort' },
      pont:   { objectif: 'Traverser le pont de Mallemort', lieu: 'mallemort' },
      fin:    { objectif: '—' },
    },
  },
};
