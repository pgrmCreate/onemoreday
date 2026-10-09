# ============ Tuiles de SOL photographiques supplémentaires (img/sols/<sol>.jpg + sols.json) ============
# À partir des matières Poly Haven (CC0) déjà dans le cache (D:\projects 3D\OneMoreDay\ph_cache) : couleur × relief éclairé
# du haut-gauche (carte de normales) × occlusion (canal R de la carte « arm »), teinte, luminosité, saturation. Tuiles
# sans couture (les matières Poly Haven le sont), 512 px. Les sols rendus dans Blender (omd_textures_sol.blend) ne sont
# pas touchés : seules les entrées de SOLS ci-dessous sont (re)faites, et fusionnées dans sols.json.
# Lancer : python tools/sols_photo.py
import json, os, glob
import numpy as np
from PIL import Image, ImageEnhance

CACHE = r'D:\projects 3D\OneMoreDay\ph_cache'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img', 'sols')
TAILLE = 512
LUMIERE = np.array([-0.55, 0.55, 0.65]); LUMIERE /= np.linalg.norm(LUMIERE)   # du haut-gauche (normales OpenGL : +y = haut)

# sol (js/carte/catalogue.js) → (matière, mètres par tuile, luminosité, saturation, teinte multiplicative RGB, relief)
SOLS = {
    'bitume_use':      ('sol:bitume', 4.5, 1.06, 0.7, (1.03, 1.0, 0.94), 0),          # le bitume d'origine, éclairci et rapiécé
    'bitume_neuf':     ('asphalt_floor', 2.6, 0.66, 0.35, (1.0, 1.0, 1.04), 0.8),
    'paves_vieux':     ('cobblestone_floor_04', 2.2, 0.86, 0.8, (1.04, 1.0, 0.94), 1.1),
    'dalles_calcaire': ('white_sandstone_blocks_02', 3.2, 0.86, 0.75, (1.03, 1.0, 0.93), 1.0),
    'dalles_granit':   ('granite_tile_03', 2.4, 0.84, 0.6, (1.0, 1.0, 1.0), 0.9),
    'trottoir_rouge':  ('concrete_pavers', 1.92, 0.88, 0.9, (1.18, 0.9, 0.82), 1.0),
    'stabilise':       ('gravelly_sand', 2.6, 0.92, 0.8, (1.06, 1.0, 0.9), 0.8),
    'cailloux':        ('gravel_stones', 1.8, 1.3, 0.7, (1.04, 1.0, 0.95), 1.1),
    'sous_bois':       ('forest_ground_05', 2.4, 0.84, 0.85, (1.02, 0.98, 0.9), 1.0),
    'terre_battue':    ('dirt', 2.0, 0.98, 0.78, (1.18, 0.96, 0.8), 0.9),     # la terre rouge de Provence
    'pelouse':         ('aerial_grass_rock', 9.0, 0.95, 1.25, (0.92, 1.06, 0.86), 0.8),
    'herbe_jaunie':    ('aerial_grass_rock', 12.0, 0.98, 0.75, (1.16, 1.04, 0.72), 0.8),
    'beton_peint':     ('painted_concrete', 3.0, 0.8, 0.6, (1.0, 1.0, 1.0), 0.7),
}

def fichier(tid, genre):
    for d in (os.path.join(CACHE, 'tex', tid), CACHE):
        f = [x for x in glob.glob(os.path.join(d, f'{tid}_{genre}*.jpg'))]
        if f: return f[0]
    return None

def rapiecer(im, graine=7):
    # des rustines de bitume plus sombre, aux bords nets, loin des bords de la tuile (elle reste sans couture)
    import random
    from PIL import ImageDraw, ImageFilter
    r = random.Random(graine); m = Image.new('L', im.size, 0); d = ImageDraw.Draw(m)
    for k in range(4):
        w, h = r.randint(60, 170), r.randint(40, 120); x, y = r.randint(24, TAILLE - w - 24), r.randint(24, TAILLE - h - 24)
        d.rectangle([x, y, x + w, y + h], fill=r.randint(70, 120))
    m = m.filter(ImageFilter.GaussianBlur(1.2))
    return Image.composite(ImageEnhance.Brightness(im).enhance(0.62), im, m)

def tuile(tid, lum, sat, teinte, relief):
    if tid.startswith('sol:'):
        im = Image.open(os.path.join(OUT, tid[4:] + '.jpg')).convert('RGB').resize((TAILLE, TAILLE), Image.LANCZOS)
        im = Image.fromarray(np.clip(np.asarray(im).astype(np.float32) * np.array(teinte, dtype=np.float32), 0, 255).astype(np.uint8))
        im = rapiecer(ImageEnhance.Color(ImageEnhance.Brightness(im).enhance(lum)).enhance(sat))
        return im
    diff = Image.open(fichier(tid, 'diff')).convert('RGB').resize((TAILLE, TAILLE), Image.LANCZOS)
    c = np.asarray(diff).astype(np.float32) / 255.0
    nf = fichier(tid, 'nor_gl')
    if nf:
        n = np.asarray(Image.open(nf).convert('RGB').resize((TAILLE, TAILLE), Image.LANCZOS)).astype(np.float32) / 127.5 - 1.0
        n /= np.maximum(1e-6, np.linalg.norm(n, axis=2, keepdims=True))
        ombre = (n @ LUMIERE) / LUMIERE[2]                      # 1 = à plat
        c *= np.clip(1.0 + (ombre[..., None] - 1.0) * relief, 0.55, 1.35)
    af = fichier(tid, 'arm')
    if af:
        ao = np.asarray(Image.open(af).convert('RGB').resize((TAILLE, TAILLE), Image.LANCZOS)).astype(np.float32)[..., 0] / 255.0
        c *= (0.55 + 0.45 * ao)[..., None]
    c *= np.array(teinte, dtype=np.float32)
    im = Image.fromarray(np.clip(c * 255, 0, 255).astype(np.uint8))
    im = ImageEnhance.Brightness(im).enhance(lum)
    return ImageEnhance.Color(im).enhance(sat)

if __name__ == '__main__':
    meta_f = os.path.join(OUT, 'sols.json')
    meta = json.load(open(meta_f, encoding='utf-8'))
    for sol, (tid, m, lum, sat, teinte, relief) in SOLS.items():
        if not tid.startswith('sol:') and not fichier(tid, 'diff'): print('manque', sol, tid); continue
        tuile(tid, lum, sat, teinte, relief).save(os.path.join(OUT, sol + '.jpg'), quality=80)
        meta[sol] = {'asset': tid, 'm': m}
        print('ok', sol)
    json.dump(meta, open(meta_f, 'w', encoding='utf-8'), indent=1)
