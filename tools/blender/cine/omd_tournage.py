# ============ One More Day — TOURNAGE des cinématiques (Blender → img/cine/clips/<plan>.webm) ============
# Un plan = un décor construit (omd_ville, intérieurs…), une LUMIÈRE (préréglage), une CAMÉRA (positions clés dans le temps),
# des ACTEURS (omd_humains) et une durée. On le décrit dans tools/blender/cine/plans.py ; on le tourne en arrière-plan :
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --python tools/blender/cine/tourner.py -- intro_1 [--image]
# --image : une seule image (milieu du plan) pour régler le cadre vite ; sinon la vidéo complète (24 i/s, 1280 × 536, VP9).
import bpy, math, os
from mathutils import Vector

FPS = 24
LARG, HAUT = 1280, 536                     # 2,39:1, comme le cadre du lecteur
CLIPS = r'D:\projects\One more day - Claude\img\cine\clips'
APERCUS = r'D:\projects 3D\OneMoreDay\apercus'

def reglages_rendu(qualite='film'):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    ee = sc.eevee
    for k, v in (('use_raytracing', qualite == 'film'), ('use_shadows', True), ('shadow_ray_count', 2), ('shadow_step_count', 8),
                 ('taa_render_samples', 14 if qualite == 'film' else 8), ('use_volumetric_shadows', True), ('volumetric_tile_size', '4'),
                 ('fast_gi_method', 'GLOBAL_ILLUMINATION'), ('use_fast_gi', True)):
        try: setattr(ee, k, v)
        except Exception: pass
    try: ee.ray_tracing_options.resolution_scale = '2'
    except Exception: pass
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = LARG, HAUT, 100
    sc.render.fps = FPS
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'
    try: sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception: pass
    sc.view_settings.exposure = -0.35
    compositeur()
    sc.render.use_motion_blur = True
    try: sc.render.motion_blur_shutter = 0.4
    except Exception: pass

def compositeur():
    """Halo des lumières fortes et légère aberration de l'objectif : l'image a l'air filmée (Blender 5 : groupe de compositing)."""
    sc = bpy.context.scene
    try:
        ng = bpy.data.node_groups.get('omd_compo') or bpy.data.node_groups.new('omd_compo', 'CompositorNodeTree')
        ng.nodes.clear()
        try: ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        except Exception: pass
        rl = ng.nodes.new('CompositorNodeRLayers'); out = ng.nodes.new('NodeGroupOutput')
        gl = ng.nodes.new('CompositorNodeGlare')
        for k, v in (('glare_type', 'FOG_GLOW'), ('quality', 'MEDIUM')):
            try: setattr(gl, k, v)
            except Exception: pass
        for k, v in (('Threshold', 3.0), ('Size', 0.5), ('Strength', 0.25)):
            try: gl.inputs[k].default_value = v
            except Exception: pass
        ng.links.new(rl.outputs['Image'], gl.inputs[0]); ng.links.new(gl.outputs[0], out.inputs[0])
        sc.compositing_node_group = ng
        sc.render.use_compositing = True
    except Exception as e: print('[compositeur]', e)

def sortie_video(nom):
    sc = bpy.context.scene
    os.makedirs(CLIPS, exist_ok=True)
    im = sc.render.image_settings
    try: im.media_type = 'VIDEO'
    except Exception: pass
    im.file_format = 'FFMPEG'
    ff = sc.render.ffmpeg
    ff.format = 'WEBM'; ff.codec = 'WEBM'
    try: ff.constant_rate_factor = 'MEDIUM'
    except Exception: pass
    ff.ffmpeg_preset = 'GOOD'
    ff.gopsize = 24
    ff.audio_codec = 'NONE'
    sc.render.filepath = os.path.join(CLIPS, nom + '.webm')

def sortie_image(nom):
    sc = bpy.context.scene
    os.makedirs(APERCUS, exist_ok=True)
    im = sc.render.image_settings
    try: im.media_type = 'IMAGE'
    except Exception: pass
    im.file_format = 'JPEG'; im.quality = 90
    sc.render.filepath = os.path.join(APERCUS, nom + '.jpg')

# ---------------------------------------------------------------- lumières
def monde_ciel(force=1.0, soleil_elev=20, soleil_az=110, air=1.0, poussiere=1.0, ozone=1.0):
    sc = bpy.context.scene
    w = sc.world or bpy.data.worlds.new('monde'); sc.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    sky = nt.nodes.new('ShaderNodeTexSky')
    for k, v in (('sky_type', 'MULTIPLE_SCATTERING'), ('sun_elevation', math.radians(soleil_elev)), ('sun_rotation', math.radians(soleil_az)),
                 ('air_density', air), ('aerosol_density', poussiere), ('dust_density', poussiere), ('ozone_density', ozone), ('sun_disc', True)):
        try: setattr(sky, k, v)
        except Exception: pass
    if getattr(sky, 'sky_type', '') not in ('MULTIPLE_SCATTERING', 'NISHITA'):
        try: sky.sky_type = 'NISHITA'
        except Exception: pass
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs[1].default_value = force
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(sky.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])

def monde_hdri(chemin, force=1.0, rot=0.0):
    sc = bpy.context.scene
    w = sc.world or bpy.data.worlds.new('monde'); sc.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value[2] = math.radians(rot)
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(chemin, check_existing=True)
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs[1].default_value = force
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); nt.links.new(mp.outputs[0], env.inputs[0]); nt.links.new(env.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])

def monde_uni(coul, force):
    sc = bpy.context.scene
    w = sc.world or bpy.data.worlds.new('monde'); sc.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs[0].default_value = (*coul, 1); bg.inputs[1].default_value = force
    out = nt.nodes.new('ShaderNodeOutputWorld'); nt.links.new(bg.outputs[0], out.inputs[0])

def soleil(elev, az, force=4.0, coul=(1.0, 0.93, 0.82), angle=1.2):
    s = bpy.data.objects.get('soleil')
    if not s:
        s = bpy.data.objects.new('soleil', bpy.data.lights.new('soleil', 'SUN')); bpy.context.scene.collection.objects.link(s)
    s.data.energy = force; s.data.color = coul; s.data.angle = math.radians(angle)
    e, a = math.radians(elev), math.radians(az)
    d = Vector((math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)))
    s.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return s

def brume(densite=0.004, coul=(0.9, 0.85, 0.75), anisotropie=0.4):
    """Brume : désactivée (le volume du monde noircit le ciel dans Eevee) — la profondeur vient du ciel et des effets du lecteur."""
    return
    sc = bpy.context.scene
    w = sc.world; nt = w.node_tree
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_WORLD')
    v = nt.nodes.new('ShaderNodeVolumePrincipled'); v.inputs['Density'].default_value = densite; v.inputs['Color'].default_value = (*coul, 1)
    v.inputs['Anisotropy'].default_value = anisotropie
    nt.links.new(v.outputs[0], out.inputs['Volume'])

LUMIERES = {
    # matin de marché : soleil bas d'est, ciel clair, un peu de poussière dans l'air
    'matin': lambda: (monde_ciel(0.9, 24, -40, poussiere=2.0), soleil(24, -40, 4.5, (1.0, 0.88, 0.72)), brume(0.0025, (1.0, 0.92, 0.8))),
    # ciel voilé, couleurs lavées (la panique)
    'voile': lambda: (monde_ciel(0.38, 35, 140, air=1.6, poussiere=4.0), soleil(35, 140, 1.6, (1.0, 0.97, 0.92), 8), brume(0.004, (0.85, 0.85, 0.82))),
    # mistral : bleu dur, soleil haut, aucune brume, ombres nettes
    'mistral': lambda: (monde_ciel(0.32, 48, 200, air=0.8, poussiere=0.4), soleil(48, 200, 3.6, (1.0, 0.97, 0.92), 0.6)),
    # nuit : lune froide, lampadaires orangés (posés par le décor)
    'nuit': lambda: (monde_uni((0.03, 0.04, 0.075), 1.0), soleil(35, 250, 0.3, (0.6, 0.7, 1.0), 2), brume(0.006, (0.55, 0.6, 0.75))),
    # incendie : ciel bas, brun-roux, la lumière vient du feu
    'incendie': lambda: (monde_uni((0.09, 0.045, 0.025), 1.0), soleil(8, 90, 0.6, (1.0, 0.45, 0.25), 6)),
    # aube : ciel rose-gris, soleil rasant
    'aube': lambda: (monde_ciel(0.5, 3, 85, poussiere=3.0), soleil(3, 85, 2.2, (1.0, 0.62, 0.42), 2), brume(0.006, (1.0, 0.8, 0.7))),
}
def lumiere(nom):
    for o in list(bpy.data.objects):
        if o.name.startswith('soleil'): bpy.data.objects.remove(o, do_unlink=True)
    LUMIERES[nom]()

# ---------------------------------------------------------------- caméra
def camera(cles, lens=35, f_dof=None, ouverture=None):
    """cles : [(frame, (x, y, z), (cible_x, cible_y, cible_z)), …] — la caméra va d'une position à l'autre en regardant sa cible."""
    sc = bpy.context.scene
    c = bpy.data.objects.get('cam_plan')
    if not c:
        c = bpy.data.objects.new('cam_plan', bpy.data.cameras.new('cam_plan')); sc.collection.objects.link(c)
    c.animation_data_clear()
    c.data.lens = lens; c.data.clip_start = 0.1; c.data.clip_end = 20000; c.data.sensor_width = 36
    cible = bpy.data.objects.get('cam_cible')
    if not cible:
        cible = bpy.data.objects.new('cam_cible', None); sc.collection.objects.link(cible)
    cible.animation_data_clear()
    for cn in list(c.constraints): c.constraints.remove(cn)
    tr = c.constraints.new('TRACK_TO'); tr.target = cible; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'
    for f, pos, vise in cles:
        c.location = pos; c.keyframe_insert('location', frame=f)
        cible.location = vise; cible.keyframe_insert('location', frame=f)
    if f_dof:
        c.data.dof.use_dof = True; c.data.dof.focus_object = cible; c.data.dof.aperture_fstop = ouverture or 4.0
    else: c.data.dof.use_dof = False
    sc.camera = c
    return c

def tourner_plan(nom, f0, f1, image=False):
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = f0, f1
    if image:
        sc.frame_set((f0 + f1) // 2); sortie_image(nom); bpy.ops.render.render(write_still=True)
    else:
        sortie_video(nom); bpy.ops.render.render(animation=True)
