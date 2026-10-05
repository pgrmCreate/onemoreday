import json, os, glob
from PIL import Image, ImageEnhance
TEX = r'D:\projects 3D\OneMoreDay\ph_cache\tex'
OUT = r'D:\projects\One more day - Claude\img\murs'
os.makedirs(OUT, exist_ok=True)
# style de mur (js/carte/catalogue.js MURS) → (matière Poly Haven, mètres par tuile, luminosité, saturation)
MURS = {
    'platre': ('white_stucco', 2.0, 0.92, 0.85),
    'crepi': ('yellow_plaster', 2.0, 0.95, 0.95),
    'pierre': ('old_stone_wall', 2.0, 0.9, 0.9),
    'brique': ('red_brick', 1.6, 0.9, 0.9),
    'beton': ('concrete', 2.0, 0.9, 0.8),
    'bois': ('weathered_planks', 1.6, 0.9, 0.9),
    'rocher': ('sandstone_cracks', 2.5, 0.88, 0.85),
    'tole': ('rusty_metal_sheet', 2.0, 0.9, 0.85),
}
meta = {}
for style, (tid, m, lum, sat) in MURS.items():
    f = (glob.glob(os.path.join(TEX, tid, '*diff*.jpg')) + glob.glob(os.path.join(TEX, tid, '*Diff*.jpg')) + glob.glob(os.path.join(TEX, tid, '*.jpg')))
    f = [x for x in f if 'nor' not in x and 'rough' not in x and 'arm' not in x]
    if not f: print('manque', style, tid); continue
    im = Image.open(f[0]).convert('RGB').resize((384, 384), Image.LANCZOS)
    im = ImageEnhance.Brightness(im).enhance(lum); im = ImageEnhance.Color(im).enhance(sat)
    im.save(os.path.join(OUT, style + '.jpg'), quality=82)
    meta[style] = {'asset': tid, 'm': m}
json.dump(meta, open(os.path.join(OUT, 'murs.json'), 'w'), indent=1)
print(meta.keys())
