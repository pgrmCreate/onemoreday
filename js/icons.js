// ============ Icônes SVG ============
// Trait monochrome, 24×24, style brut. Aucun émoji dans l'interface :
// le monde est mort, pas mignon.
const P = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${extra}<path d="${d}"/></svg>`;

export const ICONS = {
  // ---------- HUD / panneaux ----------
  // Sac à dos de randonnée : bretelles, rabat, poches latérales, poche frontale.
  sac: P('M9 6.5V5a3 3 0 0 1 6 0v1.5M8 6.5h8c1 0 1.6.7 1.5 1.7L17 19a2.3 2.3 0 0 1-2.3 2H9.3A2.3 2.3 0 0 1 7 19L6.5 8.2c-.1-1 .5-1.7 1.5-1.7zM6.7 11H5v5.5h1.9M17.3 11H19v5.5h-1.9M9.5 21v-4.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21M8 10.5h8'),
  corps: P('M12 7a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 12 7zM12 7v7m0 0-3 7m3-7 3 7M7 10l5-2 5 2'),
  craft: P('M14.5 6.5a4 4 0 0 0-5.4 5L4 16.6 7.4 20l5.1-5.1a4 4 0 0 0 5-5.4l-2.6 2.6-2.5-2.5 2.1-3.1z'),
  // T-shirt au trait : l'onglet « Porter » (équipement sur soi)
  porter: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V20H8V9.8L5.5 11l-2-4.5L9 4z'),
  journal: P('M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17V4m4 4h6m-6 4h6'),
  options: P('M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 3-1.8.9.2 2-1.7 1.2-1.9-.7L13.5 17l-3 0-1.3-1.6-1.9.7-1.7-1.2.2-2L4 12l1.8-.9-.2-2 1.7-1.2 1.9.7L10.5 7l3 0 1.3 1.6 1.9-.7 1.7 1.2-.2 2L20 12z'),
  carte: P('M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2zm0 0v14m6-12v14'),
  croix: P('M6 6l12 12M18 6 6 18'),
  // ---------- exploration ----------
  fouille: P('M10.5 4a6.5 6.5 0 1 0 4.6 11.1L20 20m-9.5-13v4m-2-2h4'),
  oeil: P('M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'),
  verrou: P('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9zm7 3v3'),
  porte: P('M6 20V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15M6 20h12M6 20H4m14 0h2M14 11.5v1'),
  entrer: P('M13 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M4 12h10m0 0-3.5-3.5M14 12l-3.5 3.5'),
  sortir: P('M11 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5m9-8H10m10 0-3.5-3.5M20 12l-3.5 3.5'),
  aller: P('M6 20h5l1.5-4.5L16 17l3 3M8 4l3 1-1 5 4 2-1 4M11 5l4-1 2 3'),
  monter: P('M4 20h4v-4h4v-4h4V8h4M12 4l4 4-4 0'),
  dormir: P('M4 18V8m0 7h16v3M4 13h9a4 4 0 0 1 4 4M7 10.5h.5'),
  ramasser: P('M5 13l4 4 9-9M5 13l-1 5 5-1m5-11 4 4'),
  feu: P('M12 21c-3.9 0-6.5-2.4-6.5-6 0-3 2.5-5 3.5-7.5 1 1.5 1.5 2.5 1.5 4C12 9 13 5 16 3c0 3 2.5 5.5 2.5 9 0 5-2.6 9-6.5 9z'),
  // ---------- combat ----------
  attaque: P('M4 20l9-9M13 11l6.5-6.5L21 6l-1 3-3 1-2 2M6 16l2 2m-4 0 2 2'),
  // Bouclier net avec coche centrale : la garde, le blocage
  defense: P('M12 3l7 2.5v5c0 4.6-3 7.4-7 8.7-4-1.3-7-4.1-7-8.7v-5L12 3zM8.7 11.5l2.2 2.2 4.4-4.6'),
  // Petit bonhomme arc-bouté qui pousse un mur (les traits = le mur qui recule)
  pousser: P('M5 7 7.5 13 4.5 19M7.5 13 11 18.5M6 8.5 14.5 9.5M7 10 14.5 12M16.5 4.5v15M18.5 8.5h2.5M18.5 12.5h2.5', '<circle cx="5" cy="5" r="2"/>'),
  jeter: P('M4 14c5-1 8-4 9-9l2 2c-.5 4-3 8-7 9l8 3-1 2-11-3-1-2 1-2zM18 5l2-2'),
  fuir: P('M5 20l4-5m4-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 9l4-2 3 3 4 1m-6-4-1 6 4 3-1 5'),
  changer: P('M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3'),
  pistolet: P('M3 8h17v4h-7l-1 5H8l1.5-5H7a4 4 0 0 1-4-4zm14 4v2'),
  cible: P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-4h.01M12 3v2m0 14v2M3 12h2m14 0h2'),
  ceinture: P('M3 12h18M3 12c2-1.5 4-2 6-2m12 2c-2-1.5-4-2-6-2m-6 0V8h6v2m-6 0h6m-4 2v3h2v-3'),
  // ---------- états (moodles) ----------
  douleur: P('M12 3l2 5 5-2-2 5 5 1-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-1 5-2-2-5 5 2z'),
  blessure: P('M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10zM9 11h2l1-2 1.5 4 1-2h1.5'),
  fatigue: P('M5 5h14l-9 14h9M9 3h6'),
  faim: P('M7 3v7a2 2 0 0 0 2 2v9M7 3v5m4-5v7m0-7v5m6 1c0-3 2-4 2-4v17m0-8h-3a8 8 0 0 1 3-9'),
  soif: P('M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3zm-2 12a2.5 2.5 0 0 0 2.5 2.5'),
  saignement: P('M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3zm0 6v6m-3-3h6'),
  infection: P('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v3m0 12v3M4 12h3m10 0h3M6 6l2 2m8 8 2 2M18 6l-2 2M8 16l-2 2'),
  fievre: P('M10 4a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0V4zm2 5v7m0 0a2 2 0 1 0 0 .01M17 5h4m-4 3h3'),
  malade: P('M8 15a8 8 0 0 1 8 0M9 9l1.5 1.5M9 10.5 10.5 9m4.5 0 1.5 1.5m-1.5 0L16.5 9M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'),
  froid: P('M12 3v18M12 3l-2 2m2-2 2 2m-2 14-2 2m2-2 2 2M4 7l16 10M4 7l0 3M4 7l3-.5M20 17l0-3m0 3-3 .5M20 7 4 17m16-10 0 3m0-3-3-.5M4 17l0-3m0 3 3 .5'),
  surcharge: P('M6 21h12l-1.5-11h-9L6 21zm3-11V7a3 3 0 0 1 6 0v3M4 4l3 2m13-2-3 2'),
  mort: P('M12 3a8 8 0 0 0-8 8c0 3 2 5 4 6v4h8v-4c2-1 4-3 4-6a8 8 0 0 0-8-8zM9 12a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 9 12zm6 0a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 15 12zm-4 5v2m2-2v2'),
  // ---------- objets / actions ----------
  manger: P('M5 3v7a2 2 0 0 0 2 2v9M5 3v5m4-5v7m0-7v5m9 0c0-3 1.5-5 1.5-5v18m0-8h-2.5a7 7 0 0 1 2.5-10'),
  boire: P('M6 3h12l-1.5 13a3 3 0 0 1-3 2.6h-3A3 3 0 0 1 7.5 16L6 3zm1 5h10m-5 10.5V21'),
  soin: P('M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z'),
  arme_blanche: P('M5 19 17 7m0 0 2.5-4L21 4.5 19.5 7 17 7zM7 15l2 2m-4 1 1 1'),
  loupe_plus: P('M10.5 4a6.5 6.5 0 1 0 4.6 11.1L20 20'),
  poids: P('M9 7a3 3 0 1 1 6 0M5 7h14l1.5 13h-17L5 7z'),
  lumiere: P('M9 3h6l1 4a5 5 0 0 1-2 4v2h-4v-2a5 5 0 0 1-2-4l1-4zm1 13h4v3l-2 2-2-2v-3z'),
  radio: P('M4 9h16v11H4V9zm0 0 12-6M8 13a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm7-1h4m-4 3h4'),
  marche: P('M12 4a1.8 1.8 0 1 0 0-3.6M9.5 21l1.5-6-2-4 1-5 3 1 1.5 3 3 1M8 10l-3 1m5 4-4 6'),
  // Sablier : attendre, laisser filer le temps
  sablier: P('M6.5 3h11m-11 18h11M8 3v2.5c0 2 1.6 3.6 4 5.5 2.4-1.9 4-3.5 4-5.5V3M8 21v-2.5c0-2 1.6-3.6 4-5.5 2.4 1.9 4 3.5 4 5.5V21m-4-8.5v1.5m-2.5 5.5h5'),
  // Plein écran : entrer / sortir (flèches vers les coins, puis vers le centre)
  plein_ecran: P('M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5'),
  reduire_ecran: P('M9 4v5H4m16 0h-5V4M4 15h5v5m6 0v-5h5'),
};

export function ico(name, cls = '') {
  return `<span class="ico ${cls}">${ICONS[name] || ICONS.oeil}</span>`;
}
