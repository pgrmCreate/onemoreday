# Les plaques photo des décors des cinématiques de la nouvelle histoire (img/cine/<décor>.webp) : une image prise dans le
# plan tourné dans Blender (le maître, avant compression). Les vignettes fixes (refuge_place, triage_horde…) sont, elles,
# tirées de vraies photos 360° : tools/blender/cine/plaques_photo.py.
#   python tools/blender/cine/plaques_histoire.py
import os, subprocess
from PIL import Image

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
APERCUS = r'D:\projects 3D\OneMoreDay\apercus'
MAITRES = r'D:\projects 3D\OneMoreDay\cine\maitres'
SORTIE = os.path.join(RACINE, 'img', 'cine')
# décor ← (plan tourné, fraction du plan où prendre l'image)
DES_CLIPS = {
    'crau_aube': ('intro_1', 0.5), 'mains_radio': ('intro_2', 0.6), 'voie_ferree': ('intro_3', 0.7), 'refuge_porte': ('intro_4', 0.8),
    'mains_levees': ('intro_5', 0.85), 'triage_feu': ('frappe_2', 0.75), 'mains_enveloppe': ('frappe_3', 0.5), 'refuge_nuit': ('chute_1', 0.6),
    'mains_corde': ('chute_2', 0.4), 'etang_nuit': ('brume_1', 0.6), 'poudrerie_brume': ('brume_2', 0.7), 'mains_foulard': ('brume_3', 0.14),
    'cornillon_belvedere': ('cornillon_1', 0.5), 'mains_carte': ('cornillon_2', 0.7), 'mallemort_camp': ('pont_2', 0.5),
    'mains_liste': ('pont_3', 0.8), 'mains_feu': ('fin_place_2', 0.5),
}

def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

def duree(f):
    r = subprocess.run([ffmpeg(), '-i', f], capture_output=True, text=True)
    for l in r.stderr.splitlines():
        if 'Duration:' in l:
            h, m, s = l.split('Duration:')[1].split(',')[0].strip().split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 4.0

def ecrire(im, decor):
    im = im.convert('RGB')
    if im.width != 1280: im = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS)
    chemin = os.path.join(SORTIE, decor + '.webp')
    im.save(chemin, 'WEBP', quality=82, method=6)
    print('[plaque]', decor, os.path.getsize(chemin) // 1024, 'Ko')

def main():
    tmp = os.path.join(APERCUS, '_image.png')
    for d, (plan, frac) in DES_CLIPS.items():
        src = os.path.join(MAITRES, plan + '.webm')
        if not os.path.exists(src): print('[plaque] manque', src); continue
        t = duree(src) * frac
        subprocess.run([ffmpeg(), '-y', '-loglevel', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1', tmp], check=True)
        ecrire(Image.open(tmp), d)

if __name__ == '__main__':
    main()
