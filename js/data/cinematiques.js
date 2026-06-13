// ============ Cinématiques — plans caméra sur les panoramas ============
// SCHÉMA :
// id: {
//   musique: scène sonore jouée pendant la cinématique,
//   plans: [{
//     pano: id du panorama (js/art/panoramas/),
//     de:   { x: 0..1, zoom },   // position de départ de la caméra (x = balayage horizontal)
//     vers: { x: 0..1, zoom },   // position d'arrivée
//     duree: ms du travelling,
//     texte: légende affichée pendant le plan (optionnel),
//     attendre: true             // plan « important » : on appuie sur Continuer pour la suite
//   }, ...]
// }
// Un plan sans `attendre` enchaîne tout seul à la fin du travelling.

export const CINEMATIQUES = {

  // Grande introduction, 1er volet : Salon paisible au crépuscule, un mois avant.
  intro_avant: {
    musique: 'calme',
    plans: [
      {
        pano: 'salon_avant', de: { x: 0.02, zoom: 1.3 }, vers: { x: 0.5, zoom: 1.08 }, duree: 9000,
        texte: 'Il y a un mois à peine. Le soir tombe sur Salon-de-Provence, et les fenêtres s\'allument une à une.',
      },
      {
        pano: 'salon_avant', de: { x: 0.5, zoom: 1.08 }, vers: { x: 0.96, zoom: 1.3 }, duree: 8500,
        texte: 'Les terrasses, les phares sur le cours, l\'eau de la Fontaine Moussue. Une ville tranquille, sûre de le rester.',
        attendre: true,
      },
    ],
  },

  // Grande introduction, 2e volet : les mêmes toits en feu, et la rue de l'exode.
  intro_chaos: {
    musique: 'sombre',
    plans: [
      {
        pano: 'salon_chaos', de: { x: 0.02, zoom: 1.35 }, vers: { x: 0.42, zoom: 1.1 }, duree: 8000,
        texte: 'Quatre jours ont suffi. Les mêmes toits — en feu. Et personne au bout du fil.',
      },
      {
        pano: 'salon_chaos', de: { x: 0.42, zoom: 1.1 }, vers: { x: 0.78, zoom: 1.14 }, duree: 8000,
        texte: 'Les sirènes se sont tues une à une. L\'armée a tenu un carrefour, puis plus rien.',
      },
      {
        pano: 'salon_chaos', de: { x: 0.78, zoom: 1.14 }, vers: { x: 0.97, zoom: 1.45 }, duree: 7000,
        texte: 'Le cours, ce mercredi-là : ceux qui couraient — et ce qui ne courait plus comme un vivant.',
        attendre: true,
      },
    ],
  },

  // La première sortie de l'hôtel : la ville ravagée se découvre, lentement.
  sortie_hotel: {
    musique: 'rue',
    plans: [
      {
        pano: 'sortie_hotel', de: { x: 0.02, zoom: 1.45 }, vers: { x: 0.04, zoom: 1.18 }, duree: 4200,
        texte: 'Vingt-trois jours derrière une porte barricadée. Tu pousses le battant du porche.',
      },
      {
        pano: 'sortie_hotel', de: { x: 0.04, zoom: 1.15 }, vers: { x: 0.55, zoom: 1.08 }, duree: 9000,
        texte: 'La place Crousillat. La Fontaine Moussue coule toujours, pour personne.',
      },
      {
        pano: 'sortie_hotel', de: { x: 0.55, zoom: 1.08 }, vers: { x: 0.97, zoom: 1.32 }, duree: 9000,
        texte: 'Salon est morte. Et ce qui marche encore dans ses rues n\'a plus de nom.',
        attendre: true,
      },
    ],
  },

  // Les quais de la gare : la machine apparaît au bout du travelling.
  quais_gare: {
    musique: 'gare',
    plans: [
      {
        pano: 'gare', de: { x: 0.02, zoom: 1.2 }, vers: { x: 0.6, zoom: 1.08 }, duree: 8500,
        texte: 'La halle sent le gasoil froid, la poussière et le silence.',
      },
      {
        pano: 'gare', de: { x: 0.6, zoom: 1.1 }, vers: { x: 0.96, zoom: 1.5 }, duree: 6500,
        texte: 'Et au bout de la voie de service : lui. Le locotracteur. L\'espoir, en orange délavé.',
        attendre: true,
      },
    ],
  },

  // Du haut de la Tour de l'Horloge : toute la ville morte d'un seul regard.
  clocher: {
    musique: 'rue',
    plans: [
      {
        pano: 'clocher', de: { x: 0.0, zoom: 1.3 }, vers: { x: 0.45, zoom: 1.1 }, duree: 8500,
        texte: 'Du haut de la Tour de l\'Horloge — le seul endroit d\'où l\'on voit tout. Salon, en contrebas, n\'est plus qu\'une mer de toits.',
      },
      {
        pano: 'clocher', de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.82, zoom: 1.22 }, duree: 8000,
        texte: 'Des fumées que personne n\'éteint. Des ruelles où des silhouettes minuscules restent figées. Et là-bas, l\'Empéri, éteint sur son rocher.',
      },
      {
        pano: 'clocher', de: { x: 0.82, zoom: 1.22 }, vers: { x: 0.99, zoom: 1.4 }, duree: 6500,
        texte: 'Au-delà des remparts, la plaine de la Crau, vide jusqu\'aux collines. Quelque part là-dedans : une voie ferrée, et une raison de descendre.',
        attendre: true,
      },
    ],
  },

  // La première nuit, derrière la vitre d'une chambre du Grand Hôtel.
  premiere_nuit: {
    musique: 'sombre',
    plans: [
      {
        pano: 'premiere_nuit', de: { x: 0.0, zoom: 1.25 }, vers: { x: 0.5, zoom: 1.12 }, duree: 8000,
        texte: 'La nuit tombe sur la place Crousillat. Le courant vient de mourir — plus une seule lumière dans toute la ville.',
      },
      {
        pano: 'premiere_nuit', de: { x: 0.5, zoom: 1.12 }, vers: { x: 0.96, zoom: 1.3 }, duree: 8000,
        texte: 'Derrière la vitre, tu comptes les silhouettes qui titubent entre les carcasses. Au loin, un incendie que personne n\'ira éteindre. Ta première nuit.',
        attendre: true,
      },
    ],
  },

  // L'hôpital du Pays Salonais : tout converge vers le hall.
  hopital: {
    musique: 'sombre',
    plans: [
      {
        pano: 'hopital', de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.5, zoom: 1.08 }, duree: 8500,
        texte: 'L\'hôpital du Pays Salonais. Les ambulances sont restées portes ouvertes, là où on les a abandonnées.',
      },
      {
        pano: 'hopital', de: { x: 0.5, zoom: 1.08 }, vers: { x: 0.86, zoom: 1.18 }, duree: 7500,
        texte: 'Toutes les traînées sombres remontent vers le hall. Un drap pend à une fenêtre, un mot délavé dessus.',
      },
      {
        pano: 'hopital', de: { x: 0.86, zoom: 1.18 }, vers: { x: 0.99, zoom: 1.42 }, duree: 6000,
        texte: 'La baie des urgences a été barricadée de l\'intérieur. Des mains séchées sur les vitres. Ce qu\'il y a derrière n\'attend que toi.',
        attendre: true,
      },
    ],
  },

  // Le chemin de ronde de l'Empéri, et sa cour d'honneur désertée.
  emperi: {
    musique: 'rue',
    plans: [
      {
        pano: 'emperi', de: { x: 0.0, zoom: 1.25 }, vers: { x: 0.45, zoom: 1.1 }, duree: 8000,
        texte: 'Le château de l\'Empéri. Du chemin de ronde, tout Salon fume à tes pieds, jusqu\'aux Alpilles.',
      },
      {
        pano: 'emperi', de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.8, zoom: 1.15 }, duree: 7500,
        texte: 'La tour d\'angle pivote vers la cour d\'honneur. Le chantier de restauration, abandonné en plein élan.',
      },
      {
        pano: 'emperi', de: { x: 0.8, zoom: 1.15 }, vers: { x: 0.99, zoom: 1.4 }, duree: 6500,
        texte: 'La cour est vide. Une forme sous une bâche. Et, au-dessus, les charognards qui tournent — patients.',
        attendre: true,
      },
    ],
  },

  // Le départ du Y 8000 : la gare s'efface, la plaine s'ouvre.
  depart_train: {
    musique: 'gare',
    plans: [
      {
        pano: 'depart_train', de: { x: 0.0, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.1 }, duree: 7500,
        texte: 'Le locotracteur s\'arrache de la gare. Sur le quai qui défile, un dernier errant resté planté dans le ciment.',
      },
      {
        pano: 'depart_train', de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.72, zoom: 1.12 }, duree: 7000,
        texte: 'Les caténaires mortes, un câble arraché qui pend. Le passage à niveau figé. Puis plus rien que la voie.',
      },
      {
        pano: 'depart_train', de: { x: 0.72, zoom: 1.12 }, vers: { x: 0.99, zoom: 1.3 }, duree: 7000,
        texte: 'Devant : la plaine de la Crau, les Alpilles posées au loin comme un décor. Derrière : Salon, qui fume. Tu ne te retournes pas.',
        attendre: true,
      },
    ],
  },

  // L'intérieur de Miramas-le-Vieux : le seul endroit qui respire encore.
  refuge_miramas: {
    musique: 'village',
    plans: [
      {
        pano: 'refuge_miramas', de: { x: 0.0, zoom: 1.22 }, vers: { x: 0.45, zoom: 1.08 }, duree: 8000,
        texte: 'La herse retombe derrière toi, sur le monde mort. La calade monte entre les pierres chaudes.',
      },
      {
        pano: 'refuge_miramas', de: { x: 0.45, zoom: 1.08 }, vers: { x: 0.82, zoom: 1.2 }, duree: 7500,
        texte: 'Du linge propre. Une marelle à la craie. Des fenêtres où brûle un vrai feu.',
      },
      {
        pano: 'refuge_miramas', de: { x: 0.82, zoom: 1.2 }, vers: { x: 0.97, zoom: 1.35 }, duree: 6500,
        texte: 'La placette, le micocoulier, la salle commune fumante — et autour du brasero, des vivants. Le seul endroit du jeu qui respire encore.',
        attendre: true,
      },
    ],
  },

  // Chapitre 2 : le rocher de Miramas-le-Vieux, des murs et des vivants.
  arrivee_miramas: {
    musique: 'village',
    plans: [
      {
        pano: 'miramas', de: { x: 0.02, zoom: 1.25 }, vers: { x: 0.55, zoom: 1.08 }, duree: 8500,
        texte: 'Le triage s\'éloigne derrière toi. La plaine de la Touloubre, grise et muette.',
      },
      {
        pano: 'miramas', de: { x: 0.55, zoom: 1.08 }, vers: { x: 0.94, zoom: 1.42 }, duree: 7500,
        texte: 'Miramas-le-Vieux. Des murs. Des fumées de cuisine. Des vivants.',
        attendre: true,
      },
    ],
  },
};
