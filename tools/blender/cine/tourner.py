# Tourne un plan en arrière-plan :  blender -b --python tools/blender/cine/tourner.py -- <plan> [--image] [--brouillon]
import sys, os, time, faulthandler
faulthandler.enable()
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI); sys.path.insert(0, os.path.dirname(ICI))
import bpy
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
nom = args[0]
image = '--image' in args
brouillon = '--brouillon' in args
import omd_assets as A
import omd_tournage as T
import plans as P
import plans2  # enregistre les autres plans dans P.PLANS
t0 = time.time()
# scène vide
bpy.ops.wm.read_factory_settings(use_empty=True)
try: bpy.ops.preferences.addon_enable(module='bl_ext.user_default.mpfb')
except Exception as e: print('[mpfb]', e)
T.reglages_rendu('brouillon' if brouillon else 'film')
f0, f1 = P.PLANS[nom](T)
print(f'[tournage] {nom} construit en {time.time() - t0:.0f} s ; frames {f0}-{f1}')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(r'D:\projects 3D\OneMoreDay\cine', nom + '.blend'))
T.tourner_plan(nom, f0, f1, image=image)
print(f'[tournage] {nom} terminé en {time.time() - t0:.0f} s')
