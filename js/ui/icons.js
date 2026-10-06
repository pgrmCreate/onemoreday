// ============ Icônes SVG au trait (24×24, currentColor) — aucun émoji dans l'interface ============
// ico(nom, classe?) → chaîne SVG ; icoEl(nom) → élément ; iconeObjet(id) → nom d'icône d'un objet.
// Style : trait 1.7, bouts ronds, dessin brut ; la couleur vient du CSS (currentColor).
import { ITEMS } from '../data/items.js';
import { CLOTHES } from '../data/clothing.js';

const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
const P = (d, extra = '') => svg(`${extra}<path d="${d}"/>`);
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

export const ICONS = {
  // ---------- Navigation, panneaux ----------
  sac: P('M9 6.5V5a3 3 0 0 1 6 0v1.5M8 6.5h8c1 0 1.6.7 1.5 1.7L17 19a2.3 2.3 0 0 1-2.3 2H9.3A2.3 2.3 0 0 1 7 19L6.5 8.2c-.1-1 .5-1.7 1.5-1.7zM6.7 11H5v5.5h1.9M17.3 11H19v5.5h-1.9M9.5 21v-4.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21M8 10.5h8'),
  corps: P('M12 7v6.5m0 0-2.6 7.5m2.6-7.5 2.6 7.5M6.5 9.5 12 8l5.5 1.5', C(12, 4.4, 2.1)),
  fabrication: P('M14.5 6.5a4 4 0 0 0-5.4 5L4 16.6 7.4 20l5.1-5.1a4 4 0 0 0 5-5.4l-2.6 2.6-2.5-2.5 2.1-3.1z'),
  journal: P('M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17a3 3 0 0 1 3-3h11M9 8h6'),
  menu: P('M4 7h16M4 12h16M4 17h16'),
  options: P('M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 3-1.8.9.2 2-1.7 1.2-1.9-.7L13.5 17h-3l-1.3-1.6-1.9.7-1.7-1.2.2-2L4 12l1.8-.9-.2-2 1.7-1.2 1.9.7L10.5 7h3l1.3 1.6 1.9-.7 1.7 1.2-.2 2L20 12z'),
  fermer: P('M6 6l12 12M18 6 6 18'),
  retour: P('M15 5l-7 7 7 7'),
  chevron: P('M9 6l6 6-6 6'),
  carte: P('M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2zm0 0v14m6-12v14'),
  lieu: P('M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z', C(12, 9.8, 2.3)),
  objectif: P('M5 21V4m0 0h11l-2 3.5 2 3.5H5'),
  horloge: P('M12 7v5l3 2', C(12, 12, 8.5)),
  sablier: P('M6.5 3h11m-11 18h11M8 3v2.5c0 2 1.6 3.6 4 5.5 2.4-1.9 4-3.5 4-5.5V3M8 21v-2.5c0-2 1.6-3.6 4-5.5 2.4 1.9 4 3.5 4 5.5V21'),
  info: P('M12 11v5.5M12 7.6v.1', C(12, 12, 9)),
  alerte: P('M12 4 2.8 19.5h18.4L12 4zm0 6v4.5m0 2.6v.1'),
  coche: P('M5 12.5l4.5 4.5L19 7.5'),
  plus: P('M12 5v14M5 12h14'),
  moins: P('M5 12h14'),
  verrou: P('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9zm7 3v3'),
  inconnu: P('M9.2 9a2.9 2.9 0 1 1 4.3 2.5c-.9.5-1.5 1.2-1.5 2.2v.6m0 3v.1', C(12, 12, 9)),
  etoile: P('M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z'),

  // ---------- États du corps (moodles) ----------
  faim: P('M7 3v7a2 2 0 0 0 2 2v9M7 3v5m4-5v7m0-7v5m6.5 1c0-3 2-4 2-4v17m0-8h-3a8 8 0 0 1 3-9'),
  soif: P('M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3zm-2.5 12a2.5 2.5 0 0 0 2.5 2.5'),
  fatigue: P('M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5zM15 4h4l-4 4.5h4'),
  douleur: P('M13 3 8 12.5h4.5L10 21l7-10h-4.5L15 3z'),
  saignement: P('M9 3.5s4.5 5.2 4.5 8.6a4.5 4.5 0 0 1-9 0C4.5 8.7 9 3.5 9 3.5zM17 11s3 3.4 3 5.6a3 3 0 0 1-6 0c0-2.2 3-5.6 3-5.6z'),
  infection: P('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1'),
  fievre: P('M10 4a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0V4zm2 6v6.5M17 5h3m-3 3h2'),
  malade: P('M8.5 16a5 5 0 0 1 7 0M9 9.5l1.5 1.5m0-1.5L9 11m5-1.5 1.5 1.5m0-1.5L14 11', C(12, 12, 9)),
  rhume: P('M4 12h3m3.5-5.5L12 9m6.5-2.5L16 9M20 12h-3m-9.5 5.5 2-2m8 2-2-2', C(12, 12, 2.2)),
  mouille: P('M8 4s-3 4-3 6.2a3 3 0 0 0 6 0C11 8 8 4 8 4zm8 6s-3 4-3 6.2a3 3 0 0 0 6 0C19 14 16 10 16 10zM6.5 18.5l-1.5 2.5m5-2 -1.5 2.5'),
  froid: P('M12 3v18M12 3l-2 2m2-2 2 2m-2 14-2 2m2-2 2 2M4.2 7.5l15.6 9M4.2 7.5l.8 2.7m-.8-2.7 2.7-.7m12.9 9.7-.8-2.7m.8 2.7-2.7.7M19.8 7.5l-15.6 9m15.6-9-.8 2.7m.8-2.7-2.7-.7M4.2 16.5l.8-2.7m-.8 2.7 2.7.7'),
  surcharge: P('M6 21h12l-1.5-11h-9L6 21zm3-11V7a3 3 0 0 1 6 0v3M12 13v4m0 2.2v.1'),
  mal: P('M12 3c-1 3.5-4.5 4.5-4.5 9a4.5 4.5 0 0 0 9 0C16.5 7.5 13 6.5 12 3zM12 16.5V21M9.5 11.5l2.5 2 2.5-3.5M4 20c2-1 3-2.5 3.5-4.5m12.5 4.5c-2-1-3-2.5-3.5-4.5'),
  calme: P('M8.5 15.5 15.5 8.5M9.9 20.1a4.9 4.9 0 0 1-6.9-6.9l6.2-6.2a4.9 4.9 0 0 1 6.9 6.9l-6.2 6.2z'),
  mort: P('M12 3a8 8 0 0 0-8 8c0 3 2 5 4 6v4h8v-4c2-1 4-3 4-6a8 8 0 0 0-8-8zm-1 14v2m2-2v2', C(9, 10.6, 1.5) + C(15, 10.6, 1.5)),
  temperature: P('M10 4a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0V4z', C(12, 16.5, 1.2)),
  endurance: P('M4 12h3l2-5 3 10 2.5-7 1.5 2H20'),
  pv: P('M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z'),

  // ---------- Actions ----------
  manger: P('M5 3v7a2 2 0 0 0 2 2v9M5 3v5m4-5v7m0-7v5m9 0c0-3 1.5-5 1.5-5v18m0-8h-2.5a7 7 0 0 1 2.5-10'),
  boire: P('M6 3h12l-1.5 13a3 3 0 0 1-3 2.6h-3A3 3 0 0 1 7.5 16L6 3zm1 5h10m-5 10.5V21'),
  utiliser: P('M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15'),
  equiper: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V20H8V9.8L5.5 11l-2-4.5L9 4z'),
  retirer: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V13M8 9.8V20h5M5.5 11l-2-4.5L9 4m7 13h6'),
  ceinture: P('M3 11h7m4 0h7M3 15h7m4 0h7', '<rect x="10" y="9" width="4" height="8" rx="1"/>'),
  holster: P('M7 5h9l1 4-3 1-1 10H9L8 10 6 9z M9.5 13h3'),
  lire: P('M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zm0 0v13'),
  poser: P('M12 4v11m0 0-4-4m4 4 4-4M4 20h16'),
  ramasser: P('M12 20V9m0 0-4 4m4-4 4 4M4 4h16'),
  dechirer: P('M8.5 10.5 20 4M8.5 13.5 20 20', C(6, 7, 2.6) + C(6, 17, 2.6)),
  remplir: P('M12 3s5.5 6.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 9.3 12 3 12 3zm0 7.5v5.5m-2.7-2.7h5.4'),
  vider: P('M5 7h14M8 7V4.5h8V7M6.5 7l1 13h9l1-13M10 11v5m4-5v5'),
  jeter: P('M4 14c5-1 8-4 9-9l2 2c-.5 4-3 8-7 9l8 3-1 2-11-3-1-2 1-2zM18 5l2-2'),
  allumer: P('M9 16.5h6M10 20h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16.5h5V16c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z'),
  eteindre: P('M9 16.5h6M10 20h4M4 4l16 16M8.2 5.2A6 6 0 0 1 17.4 13M15.5 16.5V16c0-.4.1-.8.3-1.1M8.5 13.9A6 6 0 0 1 6.3 9'),
  recharger: P('M7 6h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm3-2h4M12.8 9.5 10.5 13.5h3l-2.3 4'),
  soin: P('M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z'),
  bander: P('M6 9.5 14.5 1M9.5 13 18 4.5M3.5 12.5l8 8M3 13l8 8m1-1 8.5-8.5a2.5 2.5 0 0 0-3.5-3.5L8.5 16.5'),
  desinfecter: P('M9 3h6M10 3v4.5L6.5 12v7.5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V12L14 7.5V3M10 15h4m-2-2v4'),
  suturer: P('M4 20C9 15 11 9 19 5m0 0-2.8 0M19 5v2.8M7 12l3 3m0-6 3 3m0-6 3 3'),
  attelle: P('M8 3v18M16 3v18M6 7h12M6 12h12M6 17h12'),
  cauteriser: P('M4 20 14 10m2-2 4-4M12 5c1.5 1.5 1.5 3 0 4.5C10.5 11 10.5 12.5 12 14', ''),
  fabriquer: P('M4 20l7-7M9.5 4.5l6 6 2-2-6-6zM13 8l-2 2m6 3 3 3-4 4-3-3'),
  reparer: P('M14.7 6.3a4 4 0 0 0-5.2 5.1L4 17l3 3 5.6-5.5a4 4 0 0 0 5.1-5.2L15.2 11.8l-2.6-.4-.4-2.6 2.5-2.5z'),
  dormir: P('M3 18V8m0 7h18v3M3 13h9.5a4 4 0 0 1 4 4M14 4h4l-4 4.5h4', C(7, 10.5, 1.4)),
  attendre: P('M12 7v5l3 2', C(12, 12, 8.5)),
  quitter: P('M11 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5m9-8H10m10 0-3.5-3.5M20 12l-3.5 3.5'),
  volume: P('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.5 4.5 0 0 1 0 6m2.5-9a8.5 8.5 0 0 1 0 12'),
  muet: P('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5m0-5-5 5'),
  vibration: P('M9 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 8v8m16-8v8M11 18h2'),
  texte: P('M4 19 8.5 6h1L14 19M5.8 14.5h6.4M15.5 19l3-8 3 8m-5-2.5h4'),
  clavier: P('M3 7h18v10H3zM6.5 10.5h.1m3.4 0h.1m3.4 0h.1m3.4 0h.1M8 14h8'),
  tactile: P('M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.6 15', ''),

  // ---------- Catégories d'objets ----------
  arme: P('M5 19 17 7m0 0 2.5-4L21 4.5 19.5 7 17 7zM7 15l2 2m-4 1 1 1'),
  munition: P('M9.5 8.5 12 4l2.5 4.5v8.5a2.5 2.5 0 0 1-5 0zM9.5 11h5'),
  nourriture: P('M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8zm0 0V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V8M6 12h12m-12 4h12'),
  boisson: P('M10 2.5h4v3l1.5 2.5V20a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V8L10 5.5zM8.5 11h7m-7 6h7'),
  outil: P('M14.5 6.5a4 4 0 0 0-5.2 5.1l-5 5L7 19l5-5a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.1-.6-.6-2.1zM4.2 20.3l1.5-1.5'),
  vetement: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V20H8V9.8L5.5 11l-2-4.5L9 4z'),
  materiau: P('M4 7h16v4H4zM4 13h16v4H4zM7 7v4m6-4v4m-3 6v-4'),
  livre: P('M6 3.5h11a1 1 0 0 1 1 1V18H7a2 2 0 0 0 0 4h11v-4M6 3.5A2 2 0 0 0 4 5.5V20a2 2 0 0 0 2 2M9 7.5h6'),
  quete: P('M12.8 12.8 19.5 19.5m-2-2-1.5 1.5m-1.5-4.5 1.5 1.5', C(9, 9, 4.5)),
  divers: P('M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8'),
  recipient: P('M9 3h6v3l2 3v10.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5V9l2-3zM7 13h10'),
  lumiere: P('M9 3h6l1 4a5 5 0 0 1-2 4v2h-4v-2a5 5 0 0 1-2-4l1-4zm1 13h4v3l-2 2-2-2v-3z'),
  pile: P('M7 7h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm3-3h4M12 11v5m-2.5-2.5h5'),
  radio: P('M4 9h16v11H4zm0 0 12-6M15 12h2m-2 3h2', C(8.5, 14.5, 2.4)),
  jumelles: P('M6.5 6h3l.5 8M17.5 6h-3l-.5 8M10 12h4', C(6.5, 16.5, 3.5) + C(17.5, 16.5, 3.5)),

  // ---------- Armes (dessins) ----------
  mains_nues: P('M8 12V6.6a1.1 1.1 0 0 1 2.2 0V11m0 0V5.4a1.1 1.1 0 0 1 2.2 0V11m0 0V5.7a1.1 1.1 0 0 1 2.2 0v5.9m0 0V8.2a1.1 1.1 0 0 1 2.2 0v5.4a6 6 0 0 1-6 6 5.7 5.7 0 0 1-4.4-2.1L5 15.2a1.2 1.2 0 0 1 1.9-1.6L8 14.8'),
  couteau: P('M5 19 17 7m0 0 2.5-4L21 4.5 19.5 7 17 7zM7 15l2 2m-4 1 1 1'),
  batte: P('M5.3 18.7a1 1 0 0 1 0-1.4l1.7-1.7c3.3-3.3 4.5-4.7 6.8-5.3 1.4-.3 2.6 0 3.2.6s.9 1.8.6 3.2c-.6 2.3-2 3.5-5.3 6.8l-1.7 1.7a1 1 0 0 1-1.4 0z'),
  masse: P('M4.6 19.4 12.5 11.5', '<rect x="11" y="3.8" width="8.6" height="5" rx="1" transform="rotate(45 15.3 6.3)"/>'),
  lame_longue: P('M4.5 19.5 16 8m0 0 2.5-2.5a1.4 1.4 0 0 0-2-2L14 6m2 2-2-2M6 18l-2 2m9.5-9.5 2 2'),
  hache: P('M6 19 13.5 11.5c1.3-3.4 3.6-5 6.5-4.6.4 2.9-1.2 5.2-4.6 6.5L13.5 11.5M5 19l1.5 1.5'),
  pied_biche: P('M7 4c-2 0-3.5 1.5-3.5 3.5S5 11 7 11m-1.2-1L17 21.2m1.8-1.8L7.5 8'),
  cle_molette: P('M16.5 4.2a4 4 0 0 0-5 5L4 16.7 7.3 20l7.5-7.5a4 4 0 0 0 5-5l-2.6 2.6-2.5-.4-.4-2.5 2.6-2.5z'),
  lance: P('M5 19 13.5 10.5m0 0-1-3.8L16 3.5l1 3.5-3.2 3.2m0 0L20 6M5 19l1.5 1.5'),
  marteau: P('M6 19 12.5 12.5', '<path d="M9.2 9.3 13.6 4.9a1.4 1.4 0 0 1 2 0l2.4 2.4a1.4 1.4 0 0 1 0 2l-4.4 4.4-1.5-1.5"/>'),
  tournevis: P('M4 20l1.6-4.6 7.4-7.4 3 3-7.4 7.4L4 20zm10.6-12.4 3-3a1.8 1.8 0 0 1 2.5 2.5l-3 3'),
  pistolet: P('M3 8h17v4h-7l-1 5H8l1.5-5H7a4 4 0 0 1-4-4zm14 4v2'),
  fusil: P('M3 8h13l4-1v3h-4v2h-3l-1 2h-2l1-2H6a3 3 0 0 1-3-3zm9 0v3'),
  arbalete: P('M12 4v12m0-12-3 2.5m3-2.5 3 2.5M5 9a6 6 0 0 0 14 0M12 16l-2 4h4z'),
  brique: P('M4 8h16v8H4zM4 12h16M9 8v4m6-4v4m-3 4v-4'),
  molotov: P('M10 3h4l-.4 2.4 1.9 4A5 5 0 0 1 17 12.4V16a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-3.6a5 5 0 0 1 1.5-3l1.9-4zM7.5 14h9M14 3l3-1'),

  // ---------- Emplacements (paper-doll) ----------
  tete: P('M6 13a6 6 0 1 1 12 0v1H6v-1zm-1.5 1h15M9 9.5c1-1 2-1.4 3-1.4'),
  torse: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V20H8V9.8L5.5 11l-2-4.5L9 4z'),
  mains: P('M8 12V6.6a1.1 1.1 0 0 1 2.2 0V11m0 0V5.4a1.1 1.1 0 0 1 2.2 0V11m0 0V5.7a1.1 1.1 0 0 1 2.2 0v5.9m0 0V8.2a1.1 1.1 0 0 1 2.2 0v5.4a6 6 0 0 1-6 6 5.7 5.7 0 0 1-4.4-2.1L5 15.2a1.2 1.2 0 0 1 1.9-1.6L8 14.8'),
  jambes: P('M7 3h10l1 18h-4l-2-11-2 11H6L7 3zm0 3.5h10'),
  pieds: P('M5 6h5v8c3 0 8 1.5 9 4v2H5V6zm0 10h14'),
  main_arme: P('M5 19 17 7m0 0 2.5-4L21 4.5 19.5 7 17 7zM7 15l2 2m-4 1 1 1'),
  lampe: P('M4 10h8l4-3v10l-4-3H4zM18.5 9l2-1.5m-2 4.5H21m-2.5 3 2 1.5'),

  // ---------- Postes et catégories de recettes ----------
  etabli: P('M3 9h18v3H3zM5 12v8m14-8v8M5 16h14M8 9V6h3v3m3 0V5.5h2.5V9'),
  feu: P('M12 21c-3.9 0-6.5-2.4-6.5-6 0-3 2.5-5 3.5-7.5 1 1.5 1.5 2.5 1.5 4C12 9 13 5 16 3c0 3 2.5 5.5 2.5 9 0 5-2.6 9-6.5 9z'),
  main: P('M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15'),
  soins: P('M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z'),
  armes: P('M4 20l9-9M13 11l6.5-6.5L21 6l-1 3-3 1-2 2M6 16l2 2m-4 0 2 2'),
  reparation: P('M14.7 6.3a4 4 0 0 0-5.2 5.1L4 17l3 3 5.6-5.5a4 4 0 0 0 5.1-5.2L15.2 11.8l-2.6-.4-.4-2.6 2.5-2.5z'),
  cuisine: P('M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2zm16 1h2M9 3c-1 1.5 1 2.5 0 4m3-4c-1 1.5 1 2.5 0 4m3-4c-1 1.5 1 2.5 0 4'),
  survie: P('M3 20 12 4l9 16H3zm6 0 3-5 3 5'),
  recyclage: P('M7 19H4.5l3.5-6m9 6h2.5L16 13m-6.5-7.5L12 3l2.5 4.5M8 13l-1.7-3M16 13l1.7-3M10 19h4M12 3v0'),
  equipement: P('M9 4a3 3 0 0 0 6 0l5.5 2.5-2 4.5L16 9.8V20H8V9.8L5.5 11l-2-4.5L9 4zm-1 9h8'),
  tout: P('M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z'),
  loupe: P('M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.3 15.3 20 20'),

  // ---------- Journal ----------
  recit: P('M6 3h9l3 3v15H6V3zm9 0v3h3M9 10h6m-6 3h6m-6 3h4'),
  document: P('M7 3h7l4 4v14H7V3zm7 0v4h4M9.5 12c1-1 2 1 3 0s2 1 3 0M9.5 16c1-1 2 1 3 0'),
  sms: P('M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm3 5h.1m3.9 0h.1m3.9 0h.1'),
  crane: P('M12 3a8 8 0 0 0-8 8c0 3 2 5 4 6v4h8v-4c2-1 4-3 4-6a8 8 0 0 0-8-8zm-1 14v2m2-2v2', C(9, 10.6, 1.5) + C(15, 10.6, 1.5)),
  competences: P('M4 20V14m5.3 6V10m5.4 10V6M20 20V3'),
  poids: P('M9 7a3 3 0 1 1 6 0M5 7h14l1.5 13h-17L5 7z'),
  encombrement: P('M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z'),
};

export function ico(nom, cls = '') {
  return `<span class="ico${cls ? ' ' + cls : ''}">${ICONS[nom] || ICONS.divers}</span>`;
}
export function icoEl(nom, cls = '') {
  const s = document.createElement('span'); s.className = 'ico' + (cls ? ' ' + cls : ''); s.innerHTML = ICONS[nom] || ICONS.divers; return s;
}

// ---------- Icône d'un objet ----------
const ARME = {
  couteau_cuisine: 'couteau', couteau_artisanal: 'couteau', couteau_combat: 'couteau', couteau_lancer: 'couteau', tournevis: 'tournevis',
  batte_baseball: 'batte', batte_cloutee: 'batte', tuyau_acier: 'batte', matraque: 'batte',
  masse_chantier: 'masse', machette: 'lame_longue', machette_aiguisee: 'lame_longue', sabre_cavalerie: 'lame_longue',
  hache_pompier: 'hache', pied_de_biche: 'pied_biche', cle_molette: 'cle_molette', pelle: 'lance',
  lance_artisanale: 'lance', lance_renforcee: 'lance', marteau: 'marteau',
  pistolet_9mm: 'pistolet', fusil_chasse: 'fusil', fusil_assaut: 'fusil', arbalete_fortune: 'arbalete',
  brique: 'brique', cocktail_molotov: 'molotov',
};
const PAR_ID = {
  piles: 'pile', radio_portable: 'radio', radio_manivelle: 'radio', jumelles: 'jumelles', briquet: 'feu', allumettes: 'feu', torche: 'feu',
  rechaud_camping: 'feu', casserole: 'cuisine', bouteille_vide: 'recipient', gourde: 'recipient', thermos: 'recipient', bidon_vide: 'recipient',
  canette_vide: 'recipient', bandage: 'bander', bandage_fortune: 'bander', pansement_miel: 'bander', desinfectant: 'desinfecter',
  lingette: 'desinfecter', kit_suture: 'suturer', attelle: 'attelle', trousse_outils: 'outil', pierre_aiguiser: 'reparer',
};
const SLOT_ICONE = { tete: 'tete', torse: 'torse', mains: 'mains', jambes: 'jambes', pieds: 'pieds', sac: 'sac', ceinture: 'ceinture', holster: 'holster' };
export function iconeObjet(id) {
  if (ARME[id]) return ARME[id];
  if (PAR_ID[id]) return PAR_ID[id];
  const c = CLOTHES[id]; if (c) return SLOT_ICONE[c.slot] || 'vetement';
  const d = ITEMS[id]; if (!d) return 'quete';
  if ((d.usage || []).includes('lumiere')) return 'lumiere';
  return { arme: 'arme', munition: 'munition', jet: 'jeter', nourriture: 'nourriture', boisson: 'boisson', soin: 'soin', outil: 'outil',
    materiau: 'materiau', recipient: 'recipient', livre: 'livre', lore: 'document', quete: 'quete' }[d.type] || 'divers';
}
export const ICONE_CATEGORIE_RECETTE = { soins: 'soins', armes: 'armes', reparation: 'reparation', nourriture: 'cuisine', lumiere: 'lumiere', survie: 'survie', recyclage: 'recyclage', equipement: 'equipement' };
export const ICONE_MOODLE = { faim: 'faim', soif: 'soif', fatigue: 'fatigue', douleur: 'douleur', saignement: 'saignement', infection: 'infection', fievre: 'fievre', malade: 'malade', rhume: 'rhume', mouille: 'mouille', froid: 'froid', surcharge: 'surcharge', mal: 'mal', calme: 'calme' };
export const nombreIcones = () => Object.keys(ICONS).length;
