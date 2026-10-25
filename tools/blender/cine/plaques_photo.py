# Les vignettes fixes de la nouvelle histoire (img/cine/<décor>.webp) tirées de VRAIES photos 360° Poly Haven (CC0),
# comme les plaques de l'ancienne histoire : on cadre une vue rectiligne dans le panorama (cap, tangage, champ),
# puis on étalonne selon l'heure et la lumière de la scène (nuit, lanterne, brume…).
#   python tools/blender/cine/plaques_photo.py                → toutes les vignettes
#   python tools/blender/cine/plaques_photo.py refuge_place   → une seule
#   python tools/blender/cine/plaques_photo.py --tour stone_alley   → 8 vues autour d'un panorama (pour choisir le cap)
# Panoramas : « Tonemapped JPG » de Poly Haven, mis en cache dans D:\projects 3D\OneMoreDay\ph_cache\<id>_tm.jpg.
import os, sys, math, subprocess
import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
CACHE = r'D:\projects 3D\OneMoreDay\ph_cache'
APERCUS = r'D:\projects 3D\OneMoreDay\apercus'
SORTIE = os.path.join(RACINE, 'img', 'cine')
L, H = 1280, 536

from vignettes_photo import VIGNETTES

def panorama(pid):
    chemin = os.path.join(CACHE, pid + '_tm.jpg')
    if not os.path.exists(chemin):
        url = f'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/{pid}.jpg'
        subprocess.run(['curl', '-s', '-f', '-o', chemin, url], check=True)
    return chemin

_PANOS = {}
def charger(pid):
    if pid not in _PANOS:
        im = Image.open(panorama(pid)).convert('RGB')
        if im.width > 8192: im = im.resize((8192, 4096), Image.LANCZOS)
        _PANOS.clear(); _PANOS[pid] = np.asarray(im, dtype=np.float32) / 255.0
    return _PANOS[pid]

def vue(pid, cap, tangage, champ, l=L, h=H, sur=2):
    """Projection rectiligne d'un panorama équirectangulaire (sur-échantillonnée ×sur puis réduite : pas d'escalier)."""
    src = charger(pid); sh, sw, _ = src.shape
    W, Hh = l * sur, h * sur
    f = (W / 2) / math.tan(math.radians(champ) / 2)
    u, v = np.meshgrid(np.arange(W) + 0.5 - W / 2, np.arange(Hh) + 0.5 - Hh / 2)
    x, y, z = u / f, -v / f, np.ones_like(u)
    t = math.radians(tangage)
    y, z = y * math.cos(t) + z * math.sin(t), -y * math.sin(t) + z * math.cos(t)
    c = math.radians(cap)
    x, z = x * math.cos(c) + z * math.sin(c), -x * math.sin(c) + z * math.cos(c)
    n = np.sqrt(x * x + y * y + z * z)
    lon = np.arctan2(x, z); lat = np.arcsin(y / n)
    px = (lon / (2 * math.pi) + 0.5) * sw - 0.5
    py = (0.5 - lat / math.pi) * sh - 0.5
    x0 = np.floor(px).astype(np.int64); y0 = np.floor(py).astype(np.int64)
    fx = (px - x0)[..., None]; fy = (py - y0)[..., None]
    x0m, x1m = x0 % sw, (x0 + 1) % sw
    y0c, y1c = np.clip(y0, 0, sh - 1), np.clip(y0 + 1, 0, sh - 1)
    a = src[y0c, x0m] * (1 - fx) + src[y0c, x1m] * fx
    b = src[y1c, x0m] * (1 - fx) + src[y1c, x1m] * fx
    out = a * (1 - fy) + b * fy
    im = Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))
    return im.resize((l, h), Image.LANCZOS)

def _lin(a): return np.power(np.clip(a, 0, 1), 2.2)
def _srgb(a): return np.power(np.clip(a, 0, 1), 1 / 2.2)

def etalonner(im, mode, opts):
    a = np.asarray(im, dtype=np.float32) / 255.0
    hh, ww, _ = a.shape
    yy, xx = np.mgrid[0:hh, 0:ww]
    nx, ny = xx / ww, yy / hh
    lum = (a * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
    if opts.get('feux_eteints'):
        # les feux rouges des voitures de la photo : plus personne n'appuie sur le frein
        rouge = np.clip((a[..., :1] - np.maximum(a[..., 1:2], a[..., 2:3]) - 0.25) / 0.2, 0, 1)
        a = a * (1 - rouge) + (lum * [0.55, 0.42, 0.4]) * rouge
        lum = (a * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)

    def sature(a, s): return lum + (a - lum) * s
    def vignette(a, force=0.35):
        d = np.sqrt(((nx - 0.5) / 0.75) ** 2 + ((ny - 0.5) / 0.6) ** 2)
        return a * (1 - force * np.clip(d, 0, 1.4)[..., None] ** 2)
    def foyer(a, coul, base, gain):
        """Une seule source chaude (bougie, lanterne, feu) : tout est sombre sauf autour d'elle."""
        fx, fy = opts.get('foyer', (0.5, 0.7)); r = opts.get('rayon', 0.55)
        d = np.sqrt(((nx - fx) * ww / hh) ** 2 + (ny - fy) ** 2) / r
        m = np.exp(-d * d * 2.2)[..., None]
        # ce qui était très clair sur la photo (fenêtres, jours entre les planches) devient la nuit dehors : un bleu froid
        fen = np.clip((lum - 0.84) / 0.12, 0, 1)
        li = _lin(a) * (base + gain * m) * np.array(coul) * (1 - fen) + fen * _lin(a) * 0.09 * np.array([0.5, 0.66, 1.0])
        return _srgb(li)

    if mode == 'jour_chaud':
        a = sature(a, 0.92) * [1.04, 1.0, 0.92]; a = np.clip((a - 0.5) * 1.06 + 0.5, 0, 1); a = vignette(a, 0.25)
    elif mode == 'jour_sec':
        a = sature(a, 0.78) * [1.05, 1.0, 0.88]; a = np.clip((a - 0.5) * 1.04 + 0.52, 0, 1); a = vignette(a, 0.3)
    elif mode == 'jour_doux':
        a = sature(a, 0.82) * [1.02, 1.0, 0.94]; a = vignette(a, 0.28)
    elif mode == 'soir':
        a = sature(a, 0.8) * [1.06, 0.92, 0.8]; a = _srgb(_lin(a) * 0.62); a = vignette(a, 0.4)
    elif mode == 'soir_dore':
        a = sature(a, 0.85) * [1.05, 0.97, 0.86]; a = _srgb(_lin(a) * 0.85); a = vignette(a, 0.35)
    elif mode == 'matin':
        # un matin de brume ordinaire sur l'étang : contraste adouci, voile pâle au loin
        voile = np.array([0.74, 0.74, 0.68])
        prof = np.clip(1.0 - (ny - 0.35) / 0.55, 0.1, 1.0)[..., None]
        a = sature(a, 0.62) * [1.02, 1.0, 0.95]
        a = a * (1 - 0.45 * prof) + voile * 0.45 * prof
        a = vignette(a, 0.35)
    elif mode == 'brume':
        # la brume jaune : contraste écrasé, voile jaune-vert plus épais au loin (en haut du sol), lumière basse
        voile = np.array([0.66, 0.64, 0.38])
        prof = np.clip(1.0 - (ny - 0.35) / 0.55, 0.15, 1.0)[..., None]
        a = sature(a, 0.5); a = _srgb(_lin(a) * 0.55)
        a = a * (1 - 0.72 * prof) + voile * 0.72 * prof
        a = vignette(a, 0.45)
    elif mode == 'bougie':
        a = foyer(sature(a, 0.7), [1.0, 0.72, 0.42], 0.035, opts.get('gain', 0.75)); a = vignette(a, 0.5)
    elif mode == 'lanterne':
        a = foyer(sature(a, 0.72), [1.0, 0.78, 0.5], 0.05, 0.8); a = vignette(a, 0.45)
    elif mode == 'feu':
        a = foyer(sature(a, 0.75), [1.0, 0.66, 0.36], 0.04, 0.95); a = vignette(a, 0.5)
    elif mode == 'penombre':
        a = sature(a, 0.55) * [0.9, 0.96, 1.04]; a = _srgb(_lin(a) * 0.32); a = vignette(a, 0.5)
    elif mode == 'nuit':
        a = sature(a, 0.35) * [0.72, 0.84, 1.1]; a = _srgb(_lin(a) * 0.12); a = vignette(a, 0.5)
    a = np.clip(a, 0, 1)
    # un grain très fin, comme une photo
    rng = np.random.default_rng(7)
    a = np.clip(a + rng.normal(0, 0.012, a.shape[:2])[..., None], 0, 1)
    return Image.fromarray((a * 255).astype(np.uint8))

def faire(decor, sortie_webp=True):
    pid, cap, tang, champ, mode, opts = VIGNETTES[decor]
    im = vue(pid, cap, tang, champ)
    # ce qu'on a incrusté dans Blender (composites.py : la horde, les voitures, la bergerie), éclairé par le même panorama
    calque = os.path.join(APERCUS, f'calque_{decor}.png')
    if os.path.exists(calque):
        c = Image.open(calque).convert('RGBA')
        if c.size != im.size: c = c.resize(im.size, Image.LANCZOS)
        # les morts et les carcasses ne sont pas neufs : couleurs ternies, un peu assombries (calque_sature, calque_expo)
        ca = np.asarray(c, dtype=np.float32) / 255.0
        rgb = ca[..., :3]; l_ = (rgb * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
        rgb = (l_ + (rgb - l_) * opts.get('calque_sature', 1.0)) * opts.get('calque_expo', 1.0)
        c = Image.fromarray((np.clip(np.concatenate([rgb, ca[..., 3:]], -1), 0, 1) * 255).astype(np.uint8), 'RGBA')
        im = Image.alpha_composite(im.convert('RGBA'), c).convert('RGB')
    im = etalonner(im, mode, opts)
    im.save(os.path.join(APERCUS, f'plaque_{decor}.jpg'), quality=88)
    if sortie_webp:
        chemin = os.path.join(SORTIE, decor + '.webp'); im.save(chemin, 'WEBP', quality=82, method=6)
        print('[plaque]', decor, os.path.getsize(chemin) // 1024, 'Ko')

def tour(pid, tangage=0, champ=70):
    """8 vues (caps 0, 45 … 315) en planche, pour choisir le cadrage."""
    pl = Image.new('RGB', (640 * 2, 268 * 4))
    for k in range(8):
        im = vue(pid, k * 45, tangage, champ, 640, 268, 1)
        pl.paste(im, ((k % 2) * 640, (k // 2) * 268))
    pl.save(os.path.join(APERCUS, f'tour_{pid}.jpg'), quality=80)

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--tour':
        for p in args[1:]: tour(p)
    else:
        for d in (args or list(VIGNETTES)): faire(d)
