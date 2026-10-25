# Les cadrages des vignettes photo (lus par plaques_photo.py, et par composites.py dans Blender pour caler la caméra 3D
# sur la photo quand on y incruste quelque chose : une horde, des voitures, la bergerie).
# décor ← panorama, cap (°, 0 = milieu du panorama, + vers la droite), tangage (°, + vers le haut), champ horizontal (°),
#         étalonnage (voir plaques_photo.etalonner), options (foyer/rayon : la source chaude des nuits ; hauteur : de l'œil)
VIGNETTES = {
    'refuge_place':      ('stone_alley', 182, 3, 72, 'jour_chaud', {}),
    'refuge_cellule':    ('smelting_tower_interior', 60, -12, 90, 'bougie', {'foyer': (0.42, 0.9), 'rayon': 0.6}),
    'refuge_donjon':     ('old_room', 0, -8, 90, 'lanterne', {'foyer': (0.38, 0.85), 'rayon': 0.6}),
    'triage_horde':      ('freight_station', 340, 2, 66, 'soir', {'hauteur': 1.7, 'calque_sature': 0.5, 'calque_expo': 0.85}),
    'bergerie_crau':     ('lonely_road_afternoon', 183, 1, 62, 'jour_sec', {'hauteur': 1.7, 'calque_sature': 0.85}),
    'bergerie_nuit':     ('hayloft', 92, 2, 92, 'feu', {'foyer': (0.5, 0.95), 'rayon': 0.62}),
    'poudrerie_parc':    ('stone_pines', 60, 3, 70, 'matin', {}),
    'peage_lancon':      ('highway_bridge_sunset', 125, -2, 66, 'soir', {'hauteur': 1.6, 'calque_sature': 0.5, 'calque_expo': 0.9, 'feux_eteints': True}),
    'grans_moulin':      ('industrial_wooden_attic', 250, -4, 88, 'bougie', {'foyer': (0.45, 0.85), 'rayon': 0.75, 'gain': 1.3}),
    'istres_pharmacie':  ('gear_store', 300, -4, 88, 'penombre', {}),
}
