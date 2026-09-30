// Supérette de la rue Kennedy — rideau à moitié levé, rayons à moitié vides.
// Boutique (gondoles, frigos, comptoir), réserve verrouillée et noire (palettes), bureau et WC.
// La liste de courses de « Maman » est restée sur le comptoir.
export default {
  id: 'casino_shop', nom: 'Supérette de la rue Kennedy', exterieur: false,
  typeButin: 'superette',
  pool: ['errant', 'errant', 'putrefie', 'rampant'],
  morts: { n: [2, 4] },
  etages: [
    { id: 'rdc', nom: 'Rez-de-chaussée', monte: null, descend: null, plan: [
      '##########################',
      '#PP..ss.ss#ffffFFFF#dd.a.#',
      '#.........#........#.....#',
      '#..R......X........+..c..#',
      '#PP..ss.ss#........###+###',
      '#.........#........#w.K.h#',
      '#oo.......#........#.....#',
      '###########........#######',
      '#........................#',
      '#.ssss.ssss..ssss.ssss...#',
      '#.SSSS.SSSS..SSSS.SSSS...#',
      '#........................#',
      '#rrrrg......Z....oo..m...#',
      '#D.......................#',
      '#|||||##/###|||||###|||||#',
      'E,,,,,,,@,,,,,,,,,,,,,,,,E',
      'E,,,,,,,,,,,,,,,,,o,,,,,,E',
      '##########################',
    ] },
  ],
  pieces: [
    { etage: 'rdc', x: 4, y: 2, nom: 'La réserve', sol: 'beton', sombre: 2 },
    { etage: 'rdc', x: 21, y: 2, nom: 'Le bureau du gérant', sol: 'lino', sombre: 1 },
    { etage: 'rdc', x: 22, y: 6, nom: 'Les toilettes', sol: 'carrelage', sombre: 2 },
    { etage: 'rdc', x: 12, y: 11, nom: 'La supérette', sol: 'lino', sombre: 0 },
    { etage: 'rdc', x: 10, y: 15, nom: 'Rue Kennedy', sol: 'paves' },
  ],
  legende: {
    'S': { comme: 's', nom: 'la gondole' },
    'F': { comme: 'f', nom: 'le frigo des laitages' },
    'P': { prop: 'palette', nom: 'la palette', conteneur: { categorie: 'etagere' } },
    'X': { porte: true, verrou: { forcer: 'pied_de_biche', crocheter: true }, nom: 'la porte de la réserve' },
    'R': { zombie: 'rampant', etat: 'fait_le_mort' },
    'K': { zombie: 'putrefie', etat: 'cogne' },
    'D': { document: 'doc_liste_casino' },
  },
  declencheurs: [],
};
