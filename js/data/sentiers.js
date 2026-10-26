// ============ Sentiers — les chemins à pied que la carte routière d'OpenStreetMap n'a pas ============
// Le graphe du pays salonais (js/data/carte_region.js) ne garde que les routes ; certains trajets de l'histoire passent
// par des pistes de pompiers, des pare-feu, des chemins de vigne. Chacun est ajouté au graphe de sa feuille
// (js/travel/geo.js, feuille) comme une petite voie (classe 5), reliée à ses deux bouts au carrefour le plus proche.
//   { nom, pts: [[lat, lon], …] } — les deux bouts sont, en général, les lieux qu'il relie.
export const SENTIERS = {
  region: [
    // le début (docs/HISTOIRE_DEBUT_V3.md) : du camp à la vigie, tout droit par le pare-feu
    { nom: 'le pare-feu de la crête', pts: [[43.64180, 5.20120], [43.64700, 5.20500], [43.65200, 5.20900], [43.65560, 5.21150]] },
    // du camp au Vieux-Vernègues, par les vignes et le temple de Château-Bas, puis le village neuf
    { nom: 'le chemin des vignes de Château-Bas', pts: [[43.64180, 5.20120], [43.65200, 5.19300], [43.66300, 5.18300], [43.67050, 5.17450], [43.68000, 5.17550], [43.68600, 5.17600], [43.69020, 5.16746]] },
  ],
};
