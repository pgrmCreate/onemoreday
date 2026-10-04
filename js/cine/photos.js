// ============ Cinématiques — décors PHOTORÉALISTES ============
// Chaque décor listé ici reçoit une plaque photographique (img/cine/<décor>.webp) rendue dans Blender à partir d'un HDRI
// Poly Haven (vraies photos 360°, CC0), cadrée et étalonnée selon l'ambiance (pipeline : D:\projects 3D\OneMoreDay\omd_cine.blend,
// plaques.json). Le lecteur la pose comme couche de fond (profondeur 0,15 : elle glisse doucement) et retire les couches
// dessinées qu'elle remplace : celles de profondeur < `jusqua` (sauf les couches nommées qu'on garde, ex. les foules
// animées) et celles nommées dans `retirer`. Les couches restantes (personnages, foules, objets proches) passent en
// silhouettes : luminosité × `ombre`, saturation réduite — elles se détachent sur la photo comme à contre-jour ; une couche
// marquée `naturel` (la main de l'hôpital) garde ses couleurs, simplement étalonnées.
// Un décor absent de la liste (housse_noir…) reste entièrement dessiné.
const NUIT = 0.26, SOIR = 0.32, JOUR = 0.36;
export const PHOTOS = {
  ba701_tarmac: { ombre: JOUR }, cales_falaises: { ombre: SOIR }, cales_grande_salle: { ombre: NUIT }, camp_refugies: { ombre: JOUR },
  cimetiere_caveau: { ombre: NUIT }, collegiale_nef: { ombre: NUIT }, couloir_hopital: { ombre: SOIR }, cours_nuit: { ombre: NUIT },
  cours_troupeau: { ombre: NUIT }, crau_mistral: { ombre: JOUR }, durance_pont: { ombre: SOIR }, emperi_cour: { ombre: JOUR },
  emperi_remparts_aube: { ombre: SOIR }, emperi_siege: { ombre: NUIT }, estive_ventoux: { ombre: JOUR }, gymnase_froid: { ombre: SOIR },
  hopital_parvis: { ombre: SOIR }, hopital_sous_sol: { ombre: NUIT }, horloge_sommet: { ombre: NUIT }, ligne_de_feu: { ombre: NUIT },
  montee_puech: { ombre: JOUR }, nostradamus_cabinet: { ombre: SOIR }, nuit_campagne: { ombre: NUIT }, place_crousillat_nuit: { ombre: NUIT },
  plaine_route: { ombre: JOUR }, route_jean_moulin: { ombre: JOUR }, saint_roch_nuit: { ombre: NUIT }, salle_quatre: { ombre: SOIR },
  salon_aube_toits: { ombre: SOIR }, salon_marche: { ombre: JOUR, retirer: ['voute'] }, salon_mercredi: { ombre: JOUR, retirer: ['voute'] },
  salon_mistral_vide: { ombre: JOUR, retirer: ['voute'] }, senas_station: { ombre: SOIR }, troupeau_feu: { ombre: NUIT }, vernegues_ruines: { ombre: NUIT },
};
const BASE = new URL('../../img/cine/', import.meta.url);
export const PROFONDEUR_PHOTO = 0.15;
// → { photo: couche, couches: couches gardées (marquées silhouette) } ou null si le décor reste dessiné.
export function appliquerPhoto(id, couches) {
  const P = PHOTOS[id]; if (!P) return null;
  const jusqua = P.jusqua ?? 0.5, retirer = new Set(P.retirer || []);
  const src = new URL(`${id}.webp`, BASE).href;
  const photo = { profondeur: PROFONDEUR_PHOTO, photo: true,
    svg: (L, H) => `<image href="${src}" x="0" y="0" width="${L}" height="${H}" preserveAspectRatio="xMidYMid slice"/>` };
  const gardees = (couches || []).filter(c => !(c.nom && retirer.has(c.nom)) && ((c.profondeur ?? 0.5) >= jusqua || c.nom));
  return { photo, couches: gardees, ombre: P.ombre ?? JOUR };
}
