// ============ Icônes SVG ============
// Trait monochrome, 24×24, style brut. Aucun émoji dans l'interface :
// le monde est mort, pas mignon.
import { ITEMS } from './data/items.js';

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
  // Moyeu + rayons : le menu radial des actions de la case
  actions: P('M12 9.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8zM12 9.1V4m0 16v-5.1M14.9 12H20M4 12h5.1'),
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
  // Esquiver : une silhouette qui plonge sur le côté + un trait de mouvement
  esquiver: P('M14 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 7l-3 5 3 3-2 6m2-9 3 2', '<path d="M3 14q4 3 8-1"/>'),
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
  // Chevron : ouvrir/fermer une ligne d'inventaire (pivote en CSS quand .open).
  chevron: P('M7 10l5 5 5-5'),

  // ---------- ARMES (un dessin par type tenu en main) ----------
  // Main ouverte, doigts levés : se battre à mains nues.
  mains_nues: P('M8 12V6.6a1.1 1.1 0 0 1 2.2 0V11M10.2 11V5.4a1.1 1.1 0 0 1 2.2 0V11M12.4 11V5.7a1.1 1.1 0 0 1 2.2 0V11.6M14.6 11.6V8.2a1.1 1.1 0 0 1 2.2 0v5.4a6 6 0 0 1-6 6 5.7 5.7 0 0 1-4.4-2.1L5 15.2a1.2 1.2 0 0 1 1.9-1.6L8 14.8'),
  // Batte / club : un fût trapu, gros bout en haut, pommeau en bas.
  batte: P('M5.3 18.7a1 1 0 0 1 0-1.4l1.7-1.7c3.3-3.3 4.5-4.7 6.8-5.3 1.4-.3 2.6 0 3.2.6s.9 1.8.6 3.2c-.6 2.3-2 3.5-5.3 6.8l-1.7 1.7a1 1 0 0 1-1.4 0z'),
  // Masse de chantier : long manche + tête carrée.
  masse: P('M4.6 19.4 12.5 11.5', '<rect x="11" y="3.8" width="8.6" height="5" rx="1" transform="rotate(45 15.3 6.3)"/>'),
  // Lame longue (machette / sabre) : un grand fil incliné, garde et pommeau.
  lame_longue: P('M4.5 19.5 16 8m0 0 2.5-2.5a1.4 1.4 0 0 0-2-2L14 6m2 2-2-2M6 18l-2 2m9.5-9.5 2 2'),
  // Hache : manche + un fer en éventail au bout.
  hache: P('M6 19 13.5 11.5c1.3-3.4 3.6-5 6.5-4.6.4 2.9-1.2 5.2-4.6 6.5L13.5 11.5M5 19l1.5 1.5'),
  // Pied-de-biche : une barre coudée à crochet recourbé.
  pied_biche: P('M7 4c-2 0-3.5 1.5-3.5 3.5S5 11 7 11m-1.2-1L17 21.2m1.8-1.8L7.5 8'),
  // Clé à molette : mâchoires ouvertes, manche.
  cle_molette: P('M16.5 4.2a4 4 0 0 0-5 5L4 16.7 7.3 20l7.5-7.5a4 4 0 0 0 5-5l-2.6 2.6-2.5-.4-.4-2.5 2.6-2.5z'),
  // Lance : hampe + fer pointu.
  lance: P('M5 19 13.5 10.5m0 0-1-3.8L16 3.5l1 3.5-3.2 3.2.7 0.3m0 0L20 6M5 19l1.5 1.5'),
  // Marteau : manche + tête.
  marteau: P('M6 19 12.5 12.5', '<path d="M9.2 9.3 13.6 4.9a1.4 1.4 0 0 1 2 0l2.4 2.4a1.4 1.4 0 0 1 0 2l-4.4 4.4-1.5-1.5"/>'),
  // Tournevis : lame plate + manche.
  tournevis: P('M4 20l1.6-4.6 7.4-7.4 3 3-7.4 7.4L4 20zm10.6-12.4 3-3a1.8 1.8 0 0 1 2.5 2.5l-3 3'),
  // Fusil : crosse, fût et canon.
  fusil: P('M3 8h13l4-1v3l-4 0v2h-3l-1 2h-2l1-2H6a3 3 0 0 1-3-3zm9 0v3'),
  // Arbalète : arc, fût vertical et carreau.
  arbalete: P('M12 4v12m0-12-3 2.5m3-2.5 3 2.5M5 9a6 6 0 0 0 14 0M12 16l-2 4h4z'),
  // Brique : un parpaing au trait, joints de mortier.
  brique: P('M4 8h16v8H4zM4 12h16M9 8v4m6-4v4m-3 4v-4'),
  // Cocktail Molotov : bouteille + chiffon enflammé.
  molotov: P('M10 3h4l-.4 2.4 1.9 4A5 5 0 0 1 17 12.4V16a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-3.6a5 5 0 0 1 1.5-3l1.9-4zM7.5 14h9M14 3l3-1'),

  // ---------- catégories d'objets (pour la liste d'inventaire) ----------
  // Goutte : un contenant d'eau.
  goutte: P('M12 3.5s6 6.7 6 11.3a6 6 0 0 1-12 0C6 10.2 12 3.5 12 3.5zm-2.5 11.5a2.5 2.5 0 0 0 2.5 2.5'),
  // Outil générique : clé + tournevis croisés (réutilise le motif du craft).
  outil: P('M14.5 6.5a4 4 0 0 0-5.2 5.1l-5 5L7 19l5-5a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.1-.6-.6-2.1zM4.2 20.3l1.5-1.5'),
  // Matériau : des plaques empilées.
  materiau: P('M4 7h16v4H4zM4 13h16v4H4zM7 7v4m6-4v4m-3 6v-4'),
  // Munition : une balle (ogive + étui).
  munition: P('M9.5 8.5 12 4l2.5 4.5v8.5a2.5 2.5 0 0 1-5 0zM9.5 11h5'),
  // Clé : objet de quête (anneau + panneton).
  cle: P('M12.8 12.8 19.5 19.5m-2-2-1.5 1.5m-1.5-4.5 1.5 1.5', '<circle cx="9" cy="9" r="4.5"/>'),
};

export function ico(name, cls = '') {
  return `<span class="ico ${cls}">${ICONS[name] || ICONS.oeil}</span>`;
}

// ---------- Icône d'une ARME tenue en main ----------
// Chaque id d'arme pointe vers un dessin. Des armes proches partagent le même
// (les couteaux → la lame ; battes/tuyau → le club…). Les mains nues ont la leur.
const ARME_ICONES = {
  couteau_cuisine: 'arme_blanche', couteau_artisanal: 'arme_blanche', couteau_lancer: 'arme_blanche',
  batte_baseball: 'batte', batte_cloutee: 'batte', tuyau_acier: 'batte',
  masse_chantier: 'masse',
  machette: 'lame_longue', machette_aiguisee: 'lame_longue', sabre_cavalerie: 'lame_longue',
  hache_pompier: 'hache',
  pied_de_biche: 'pied_biche',
  cle_molette: 'cle_molette',
  lance_artisanale: 'lance', lance_renforcee: 'lance',
  marteau: 'marteau', tournevis: 'tournevis',
  pistolet_9mm: 'pistolet', fusil_chasse: 'fusil', arbalete_fortune: 'arbalete',
  brique: 'brique', cocktail_molotov: 'molotov',
  lampe_torche: 'lumiere', lampe_frontale: 'lumiere', torche: 'feu',
};
// Le NOM d'icône d'une arme (ou un repli si on ne la connaît pas). null → mains nues.
export function iconeArme(id, repli = 'attaque') {
  if (!id) return 'mains_nues';
  return ARME_ICONES[id] || repli;
}

// ---------- Icône de catégorie d'un objet (liste d'inventaire) ----------
const ICONE_TYPE = {
  munition: 'munition', nourriture: 'manger', boisson: 'boire', soin: 'soin',
  outil: 'outil', materiau: 'materiau', quete: 'cle', lore: 'journal', recipient: 'goutte',
};
// d : la définition de l'objet (peut venir d'ITEMS ou d'un vêtement). Tout ce qui frappe
// (d.dmg) prend l'icône de son arme ; sinon on choisit par type / usage.
export function iconeObjet(id, d) {
  d = d || ITEMS[id];
  if (!d) return 'sac';
  if (d.dmg) return iconeArme(id, d.feu ? 'pistolet' : 'attaque');
  if (d.slot) return 'porter';                                  // vêtement
  if (id === 'radio_portable') return 'radio';
  if (d.usage && d.usage.includes('lumiere')) return 'lumiere';
  if (d.usage && d.usage.includes('feu')) return 'feu';
  return ICONE_TYPE[d.type] || 'sac';
}

// Catégorie « couleur » d'un objet, pour la pastille de la liste (cf. CSS .cat-*).
export function categorieObjet(id, d) {
  d = d || ITEMS[id];
  if (!d) return 'autre';
  if (d.slot) return 'vetement';
  if (d.dmg || d.type === 'arme' || d.type === 'munition') return 'arme';
  if (d.type === 'nourriture') return 'nourriture';
  if (d.type === 'boisson' || d.type === 'recipient') return 'eau';
  if (d.type === 'soin') return 'soin';
  if (d.type === 'outil') return 'outil';
  if (d.type === 'quete') return 'quete';
  return 'autre';
}
