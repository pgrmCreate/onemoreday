# Ce qu'on incruste dans les vignettes photo (plaques_photo.py) : la horde de la gare de triage, les voitures du péage de
# Lançon, la bergerie de Cabassole. Rendu Cycles sur fond transparent, avec la caméra calée sur le cadrage de la photo
# (vignettes_photo.py) et la LUMIÈRE DU MÊME PANORAMA (le HDRI Poly Haven 2k) : les ombres et les teintes collent à la photo.
# Un plan « attrape-ombres » au sol pose les ombres portées sur la photo.
#   blender -b --python tools/blender/cine/composites.py -- triage_horde [--brouillon] [--fond]
#   → D:\projects 3D\OneMoreDay\apercus\calque_<décor>.png  (--fond : avec le panorama derrière, pour vérifier le calage)
# Puis : python tools/blender/cine/plaques_photo.py <décor>
import sys, os, math, random, time, urllib.request
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI); sys.path.insert(0, os.path.dirname(ICI))
import bpy
from mathutils import Vector
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
decor = args[0]
brouillon = '--brouillon' in args
fond = '--fond' in args
from vignettes_photo import VIGNETTES
CACHE = r'D:\projects 3D\OneMoreDay\ph_cache'
APERCUS = r'D:\projects 3D\OneMoreDay\apercus'

t0 = time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
try: bpy.ops.preferences.addon_enable(module='bl_ext.user_default.mpfb')
except Exception as e: print('[mpfb]', e)
import omd_assets as A
import omd_ville as V
import omd_humains as H
import omd_nature as N
import plans3 as P3
from plans2 import statues_foule

pid, CAP, TANG, CHAMP, _mode, OPTS = VIGNETTES[decor]
HAUTEUR = OPTS.get('hauteur', 1.7)
c = math.radians(CAP)
AVANT = Vector((math.cos(c), -math.sin(c), 0))      # le cap 0 de la photo regarde +X, la droite de la photo va vers −Y (Blender)
DROITE = Vector((AVANT.y, -AVANT.x, 0))

def sol(av, cote):
    """Un point au sol, en mètres devant la caméra (av) et à sa droite (cote)."""
    p = AVANT * av + DROITE * cote
    return p.x, p.y

def cap_vers(av, cote):
    """L'angle (rotation Z) d'un objet dont l'axe +X doit suivre la direction (av, cote) du repère caméra."""
    d = AVANT * av + DROITE * cote
    return math.atan2(d.y, d.x)

def monde_photo(force=1.0):
    chemin = os.path.join(CACHE, pid + '_2k.hdr')
    if not os.path.exists(chemin):
        urllib.request.urlretrieve(f'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/{pid}_2k.hdr', chemin)
    sc = bpy.context.scene
    w = bpy.data.worlds.new('photo'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(chemin)
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs[1].default_value = force
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(env.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])

def camera():
    cd = bpy.data.cameras.new('cam'); cd.sensor_fit = 'HORIZONTAL'; cd.angle = math.radians(CHAMP); cd.clip_end = 3000
    cam = bpy.data.objects.new('cam', cd); bpy.context.scene.collection.objects.link(cam); bpy.context.scene.camera = cam
    t = math.radians(TANG)
    f = Vector((AVANT.x * math.cos(t), AVANT.y * math.cos(t), math.sin(t)))
    cam.location = (0, 0, HAUTEUR); cam.rotation_euler = f.to_track_quat('-Z', 'Y').to_euler()
    return cam

def attrape_ombres(taille=4000):
    bpy.ops.mesh.primitive_plane_add(size=taille, location=(0, 0, 0))
    p = bpy.context.active_object; p.name = 'attrape_ombres'; p.is_shadow_catcher = True
    return p

def reglages():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for typ in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
            try:
                prefs.compute_device_type = typ; prefs.get_devices()
                if any(d.type == typ for d in prefs.devices):
                    for d in prefs.devices: d.use = d.type == typ
                    sc.cycles.device = 'GPU'; print('[cycles]', typ); break
            except Exception: pass
    except Exception as e: print('[cycles]', e)
    sc.cycles.samples = 48 if brouillon else 192
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1280, 536, 100
    sc.render.film_transparent = not fond
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'

# ─── la horde : des centaines de morts debout entre les voies, tous tournés vers le haut-parleur ───
def horde():
    rnd = random.Random(611)
    S, M = statues_foule(8, 612)
    pts = []
    for _ in range(420):
        av = 10 + (rnd.random() ** 0.8) * 24 if rnd.random() < 0.85 else rnd.uniform(36, 55)   # sur le ballast, et quelques-uns dans les herbes
        lim = av * math.tan(math.radians(CHAMP / 2)) + 3
        pts.append(sol(av, rnd.uniform(-lim, lim)))
    regard = sol(160, 40)
    H.foule_statique(S, pts, None, 0, (0, -1), rnd, regard=regard)

# ─── le péage : la file de voitures abandonnées est sur la photo ; on y ajoute les morts qui errent entre elles ───
def peage():
    rnd = random.Random(621)
    S, M = statues_foule(6, 622)
    # sur la voie de droite, libre, devant soi : quelques-uns qui s'éloignent, un qui revient vers toi
    # (près du milieu de l'image : les scènes n'en montrent que la bande centrale)
    pts = [(10.0, 1.4), (13.0, 2.8), (16.5, 0.8), (20.0, 2.4), (25.0, 1.2), (32.0, 3.0)]
    H.foule_statique(S, [sol(a, c_) for a, c_ in pts[1:]], None, 0, (0, -1), rnd, regard=sol(220, -8))
    H.foule_statique(S, [sol(*pts[0])], None, 0, (0, -1), rnd, regard=(0, 0))

# ─── la bergerie de Cabassole : le long bâtiment de galets et le mas, au bout de la draille ───
def bergerie():
    rnd = random.Random(631)
    avant = set(bpy.data.objects)
    P3.bergerie_crau(0, 0, 0)
    groupe = [o for o in bpy.data.objects if o not in avant and o.parent is None]
    pivot = bpy.data.objects.new('bergerie', None); bpy.context.scene.collection.objects.link(pivot)
    for o in groupe: o.parent = pivot
    # au bout de la draille, au milieu de l'image (les scènes n'en montrent que la bande centrale)
    x, y = sol(175, -4)
    pivot.location = (x, y, 0); pivot.rotation_euler.z = cap_vers(0, 1) - math.radians(16)

CONTENU = {'triage_horde': horde, 'peage_lancon': peage, 'bergerie_crau': bergerie}

reglages()
monde_photo()
camera()
attrape_ombres()
CONTENU[decor]()
print(f'[composite] {decor} construit en {time.time() - t0:.0f} s')
bpy.context.scene.render.filepath = os.path.join(APERCUS, ('fond_' if fond else 'calque_') + decor + '.png')
bpy.ops.render.render(write_still=True)
print(f'[composite] {decor} rendu en {time.time() - t0:.0f} s')
