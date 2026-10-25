# Archive un plan tourné en « rush » autonome, pour pouvoir le rouvrir et le retoucher plus tard :
# la scène .blend gardée par tourner.py, avec ses images EMBARQUÉES (textures Poly Haven, peaux MPFB, carte…),
# la plage d'images du plan et une sortie vidéo réglée à côté du fichier (//rendu/<plan>.webm, jamais dans le jeu).
#   blender -b "<scène>.blend" --python tools/blender/cine/rushes.py -- <plan> <f0> <f1> "<rush>.blend"
#   (f0 = f1 = 0 : une scène d'incrustation de vignette, rendue en une image : //rendu/<nom>.png)
# (lancé pour tous les plans par tools/blender/cine/archiver_rushes.sh)
import sys, os, bpy
args = sys.argv[sys.argv.index('--') + 1:]
plan, f0, f1, dest = args[0], int(args[1]), int(args[2]), args[3]
sc = bpy.context.scene
image = f1 == 0          # une vignette (incrustation) : une seule image PNG transparente, réglages gardés tels quels
if image:
    sc.render.filepath = '//rendu/' + plan + '.png'
else:
    sc.frame_start, sc.frame_end = f0, f1
    sc.frame_set((f0 + f1) // 2)
im = sc.render.image_settings
if not image:
    try: im.media_type = 'VIDEO'
    except Exception: pass
    im.file_format = 'FFMPEG'
    ff = sc.render.ffmpeg
    ff.format = 'WEBM'; ff.codec = 'WEBM'
    try: ff.constant_rate_factor = 'MEDIUM'
    except Exception: pass
    ff.ffmpeg_preset = 'GOOD'; ff.gopsize = 24; ff.audio_codec = 'NONE'
    sc.render.filepath = '//rendu/' + plan + '.webm'
manquantes = [i.name for i in bpy.data.images if i.source == 'FILE' and not i.packed_file and i.filepath and not os.path.exists(bpy.path.abspath(i.filepath))]
if manquantes: print('[rush] images introuvables :', manquantes)
try: bpy.ops.file.pack_all()
except Exception as e: print('[rush] pack_all :', e)
os.makedirs(os.path.dirname(dest), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=dest, compress=True, relative_remap=True)
print(f'[rush] {plan} : {"image" if image else f"{f0}-{f1}"} → {dest} ({os.path.getsize(dest) // (1024 * 1024)} Mo)')
