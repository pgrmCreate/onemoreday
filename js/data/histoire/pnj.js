// ============ PNJ (docs/HISTOIRE.md §5) ============
// Un personnage de l'histoire à qui l'on PARLE (scène `*_parler`, un menu à sujets qui revient à lui-même).
// `si` (CONDITION) : présent dans le niveau seulement si elle est vraie. Un même personnage a une entrée par lieu ou
// par moment. Le niveau pose le marqueur (pnj(id, x, y, { marqueur })) ; les figurants à une réplique sont dans les plans.
const AVANT_SIEGE = { flag: 'quarantaine_faite', pasFlag: 'siege_commence' };

export const PNJ = {
  // ─── Le Refuge (acte I) ───
  helene:   { nom: 'Hélène', portrait: 'helene', lieu: 'miramas_le_vieux', marqueur: 'helene', scene: 'helene_parler', si: AVANT_SIEGE },
  fernand:  { nom: 'Fernand', portrait: 'fernand', lieu: 'miramas_le_vieux', marqueur: 'fernand', scene: 'fernand_parler', si: { flag: 'quarantaine_faite', pasFlag: 'depart_crau' } },
  ines:     { nom: 'Inès', portrait: 'ines', lieu: 'miramas_le_vieux', marqueur: 'ines', scene: 'ines_parler', si: AVANT_SIEGE },
  bastien:  { nom: 'Bastien', portrait: 'bastien', lieu: 'miramas_le_vieux', marqueur: 'bastien', scene: 'bastien_parler', si: AVANT_SIEGE },
  karine:   { nom: 'Karine', portrait: 'karine', lieu: 'miramas_le_vieux', marqueur: 'karine', scene: 'karine_parler', si: AVANT_SIEGE },
  rudy_breche: { nom: 'Rudy', portrait: 'rudy', lieu: 'miramas_le_vieux', marqueur: 'rudy_breche', scene: 'ref_breche', si: { flag: 'quarantaine_faite', pasFlag: ['breche_fermee', 'siege_commence'] } },
  rudy:     { nom: 'Rudy', portrait: 'rudy', lieu: 'miramas_le_vieux', marqueur: 'rudy', scene: 'rudy_parler', si: { flag: 'breche_fermee', pasFlag: 'siege_commence' } },

  // ─── La bergerie (acte II) ───
  fernand_crau: { nom: 'Fernand', portrait: 'fernand', lieu: 'bergerie', marqueur: 'fernand_crau', scene: 'fernand_crau_parler', si: { flag: 'depart_crau', pasFlag: 'frappe_faite' } },

  // ─── La Poudrerie (acte IV) ───
  ines_pou: { nom: 'Inès', portrait: 'ines', lieu: 'saint_chamas', marqueur: 'ines_pou', scene: 'ines_pou_parler', si: { flag: 'refuge_fui', pasFlag: 'brume_vue' } },

  // ─── Cornillon, la base (acte V) ───
  ines_cor:    { nom: 'Inès', portrait: 'ines', lieu: 'cornillon', marqueur: 'ines_cor', scene: 'ines_cor_parler', si: { flag: 'cornillon_arrivee', pasFlag: 'colonne_partie' } },
  karine_cor:  { nom: 'Karine', portrait: 'karine', lieu: 'cornillon', marqueur: 'karine_cor', scene: 'karine_cor_parler', si: { flag: 'famille_cornillon', pasFlag: 'colonne_partie' } },
  bastien_cor: { nom: 'Bastien', portrait: 'bastien', lieu: 'cornillon', marqueur: 'bastien_cor', scene: 'bastien_cor_parler', si: { flag: 'bastien_cornillon', pasFlag: 'colonne_partie' } },
  rudy_cor:    { nom: 'Rudy', portrait: 'rudy', lieu: 'cornillon', marqueur: 'rudy_cor', scene: 'rudy_cor_parler', si: { flag: 'rudy_cornillon', pasFlag: 'colonne_partie' } },

  // ─── Les dispersés (acte V) ───
  bastien_ist: { nom: 'Bastien', portrait: 'bastien', lieu: 'istres', marqueur: 'bastien_ist', scene: 'ist_bastien', si: { flag: 'pont_annonce', pasFlag: 'bastien_trouve' } },
  karine_gra:  { nom: 'Karine', portrait: 'karine', lieu: 'grans', marqueur: 'karine_gra', scene: 'gra_karine', si: { flag: 'pont_annonce', pasFlag: ['noa_avec', 'familles_parties', 'famille_cornillon'] } },
  rudy_lan:    { nom: 'Rudy', portrait: 'rudy', lieu: 'lancon', marqueur: 'rudy_lan', scene: 'lan_rudy', si: { flag: 'pont_annonce', pasFlag: ['rudy_cornillon', 'rudy_mort', 'rudy_laisse'] } },
};
