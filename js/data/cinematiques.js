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
