# La carte routière de la cinématique `cornillon_2` (dessinée hors de Blender, qui n'a pas PIL) :
#   python tools/blender/cine/carte_routiere.py  →  D:\projects 3D\OneMoreDay\cine\tex\carte_routiere.png
import os, random
from PIL import Image, ImageDraw, ImageFont

SORTIE = r'D:\projects 3D\OneMoreDay\cine\tex\carte_routiere.png'

def dessiner():
    os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
    W, H = 2048, 1400
    im = Image.new('RGB', (W, H), (238, 232, 214)); d = ImageDraw.Draw(im)
    rnd = random.Random(7)
    for _ in range(60):
        x0, y0 = rnd.randint(0, W - 200), rnd.randint(0, H - 200)
        d.ellipse([x0, y0, x0 + rnd.randint(80, 400), y0 + rnd.randint(60, 300)], outline=(228, 222, 202), width=2)    # les courbes de niveau
    d.polygon([(0, 1100), (520, 1000), (760, 1180), (980, 1400), (0, 1400)], fill=(170, 200, 214))                 # l'étang de Berre
    d.line([(0, 140), (500, 210), (900, 160), (1400, 230), (2048, 120)], fill=(120, 160, 200), width=26)         # la Durance
    try:
        f = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', 34); fs = ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf', 28)
    except Exception:
        f = fs = ImageFont.load_default()
    routes = [[(300, 1000), (700, 700), (1100, 520), (1500, 300), (1700, 180)], [(100, 700), (700, 700), (1300, 760), (2000, 820)],
              [(1100, 520), (1150, 900), (1250, 1300)], [(700, 700), (600, 400), (520, 180)]]
    for r in routes:
        d.line(r, fill=(200, 60, 40), width=14); d.line(r, fill=(250, 200, 70), width=6)
    for nom, (x, y) in {'SALON-DE-PROVENCE': (1080, 480), 'Mallemort': (1480, 250), 'Cornillon-Confoux': (720, 960), 'Miramas': (300, 780),
                        'Saint-Chamas': (520, 1060), 'Grans': (900, 730), 'Lançon': (1380, 900), 'Pélissanne': (1500, 600), 'Lamanon': (900, 300),
                        'La Durance': (1650, 110), 'Étang de Berre': (180, 1250)}.items():
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(40, 40, 40))
        d.text((x + 14, y - 18), nom, fill=(30, 30, 40), font=f if nom.isupper() else fs)
    for x in range(0, W, 256): d.line([(x, 0), (x, H)], fill=(200, 196, 180), width=2)        # les plis de la carte
    for y in range(0, H, 350): d.line([(0, y), (W, y)], fill=(205, 200, 184), width=2)
    im.save(SORTIE)
    return SORTIE

if __name__ == '__main__':
    print(dessiner())
