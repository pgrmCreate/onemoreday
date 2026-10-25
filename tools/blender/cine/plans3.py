# ============ One More Day — plans tournés de la NOUVELLE histoire (oct. 2026, docs/HISTOIRE.md §11) ============
# Le Refuge de Miramas-le-Vieux sur son rocher, la Crau, la gare de triage et la frappe, la brume jaune sur l'étang de
# Berre, la mer de brume vue de Cornillon, le pont de Mallemort ; et les MAINS à la première personne (omd_mains.py).
# (Les vignettes fixes des scènes sont des photos réelles : plaques_photo.py, composites.py.)
# Un plan = une fonction (T) → (f0, f1). Tourner : bash tools/blender/cine/file_rendu.sh intro_1 intro_2 …
import math, random, os, bpy
from mathutils import Vector, Matrix
import omd_assets as A
import omd_ville as V
import omd_humains as H
import omd_nature as N
import omd_mains as Mn
from plans import frames, foule_modeles, PLANS
from plans2 import statues_foule, points_bande

lin = V.lin
boite = V.boite
SCRATCH = r'D:\projects 3D\OneMoreDay\cine\tex'
POLICE_MAIN = r'C:\Windows\Fonts\Inkfree.ttf'

# ═══════════════════════════════════════════ outils ═══════════════════════════════════════════
def vol(nom, x, y, z, sx, sy, sz, coul='#c9c86a', densite=0.06, bruit=0.8, derive=None, f1=200, anis=0.2, emis=0.0, bord=0.0):
    """Un volume de brume (boîte à densité bruitée) ; derive=(dx, dy) en m sur le plan : la brume avance."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2))
    c = bpy.context.active_object; c.name = nom; c.scale = (sx, sy, sz)
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); v = nt.nodes.new('ShaderNodeVolumePrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 3; nz.inputs['Roughness'].default_value = 0.55
    # plus dense en bas : la nappe est lourde
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); haut = nt.nodes.new('ShaderNodeMapRange')
    haut.inputs['From Min'].default_value = -0.5; haut.inputs['From Max'].default_value = 0.5; haut.inputs['To Min'].default_value = 1.0; haut.inputs['To Max'].default_value = 0.0
    rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.35; rp.color_ramp.elements[1].position = 0.75
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    mul2 = nt.nodes.new('ShaderNodeMath'); mul2.operation = 'MULTIPLY'; mul2.inputs[1].default_value = densite
    mixb = nt.nodes.new('ShaderNodeMix'); mixb.data_type = 'FLOAT'; mixb.inputs['Factor'].default_value = bruit
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nt.links.new(tc.outputs['Object'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], haut.inputs['Value'])
    nt.links.new(nz.outputs['Fac'], rp.inputs['Fac'])
    mixb.inputs['A'].default_value = 1.0; nt.links.new(rp.outputs['Color'], mixb.inputs['B'])
    nt.links.new(mixb.outputs['Result'], mul.inputs[0]); nt.links.new(haut.outputs['Result'], mul.inputs[1])
    if bord:
        # fondu vers les bords, en rond sur le plan (une colonne de fumée, un nuage) : plus de boîte visible
        cx = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(sep.outputs['X'], cx.inputs['X']); nt.links.new(sep.outputs['Y'], cx.inputs['Y'])
        lg = nt.nodes.new('ShaderNodeVectorMath'); lg.operation = 'LENGTH'; nt.links.new(cx.outputs[0], lg.inputs[0])
        fb = nt.nodes.new('ShaderNodeMapRange'); fb.inputs['From Min'].default_value = 0.5 * (1 - bord); fb.inputs['From Max'].default_value = 0.5
        fb.inputs['To Min'].default_value = 1.0; fb.inputs['To Max'].default_value = 0.0; fb.clamp = True
        nt.links.new(lg.outputs['Value'], fb.inputs['Value'])
        mb = nt.nodes.new('ShaderNodeMath'); mb.operation = 'MULTIPLY'
        nt.links.new(mul.outputs[0], mb.inputs[0]); nt.links.new(fb.outputs['Result'], mb.inputs[1]); nt.links.new(mb.outputs[0], mul2.inputs[0])
    else:
        nt.links.new(mul.outputs[0], mul2.inputs[0])
    nt.links.new(mul2.outputs[0], v.inputs['Density'])
    v.inputs['Color'].default_value = (*lin(coul), 1); v.inputs['Anisotropy'].default_value = anis
    if emis: v.inputs['Emission Strength'].default_value = emis; v.inputs['Emission Color'].default_value = (*lin(coul), 1)
    nt.links.new(v.outputs['Volume'], out.inputs['Volume'])
    c.data.materials.append(m)
    if derive:
        mp.inputs['Location'].default_value = (0, 0, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=1)
        mp.inputs['Location'].default_value = (derive[0] / sx, derive[1] / sy, 0.05); mp.inputs['Location'].keyframe_insert('default_value', frame=f1)
    return c

def volumes_loin(fin=400):
    sc = bpy.context.scene
    for k, v in (('use_volume_custom_range', True), ('volumetric_end', fin), ('volumetric_start', 0.1), ('volumetric_tile_size', '4'),
                 ('volumetric_samples', 96), ('volumetric_sample_distribution', 0.7), ('use_volumetric_shadows', True)):
        try: setattr(sc.eevee, k, v)
        except Exception: pass

def nappe(z, taille, coul='#d8d49a', alpha=0.85, ech=0.004, nom='nappe', graine=0.0, derive=0.0, f1=200):
    """Une mer de brume vue d'en haut : plan émissif doux, bords effilochés par un bruit (alpha)."""
    bpy.ops.mesh.primitive_plane_add(size=taille, location=(0, 0, z))
    p = bpy.context.active_object; p.name = nom
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree
    pr = nt.nodes.get('Principled BSDF')
    pr.inputs['Base Color'].default_value = (*lin(coul), 1); pr.inputs['Roughness'].default_value = 1.0
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (ech, ech, ech)
    mp.inputs['Location'].default_value = (graine, graine * 0.7, 0)
    # deux bruits : de grandes nappes (bancs de brume) et un détail plus fin, tranchés net (sinon tout est uniforme)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 4; nz.inputs['Roughness'].default_value = 0.6
    nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 14.0; nz2.inputs['Detail'].default_value = 6
    rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.44; rp.color_ramp.elements[1].position = 0.56
    rp2 = nt.nodes.new('ShaderNodeValToRGB'); rp2.color_ramp.elements[0].position = 0.35; rp2.color_ramp.elements[1].position = 0.65
    rp2.color_ramp.elements[0].color = (0.55, 0.55, 0.55, 1)
    m2 = nt.nodes.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'
    mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = alpha
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz2.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], rp.inputs['Fac']); nt.links.new(nz2.outputs['Fac'], rp2.inputs['Fac'])
    nt.links.new(rp.outputs['Color'], m2.inputs[0]); nt.links.new(rp2.outputs['Color'], m2.inputs[1])
    nt.links.new(m2.outputs[0], mu.inputs[0]); nt.links.new(mu.outputs[0], pr.inputs['Alpha'])
    pr.inputs['Emission Color'].default_value = (*lin(coul), 1); pr.inputs['Emission Strength'].default_value = 0.4
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    if derive:
        mp.inputs['Location'].keyframe_insert('default_value', frame=1)
        mp.inputs['Location'].default_value = (graine + derive, graine * 0.7, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=f1)
    p.data.materials.append(m)
    return p

def _lisse(nt, a, b, entree):
    """smoothstep(a, b, entree) → 0..1"""
    m = nt.nodes.new('ShaderNodeMapRange'); m.interpolation_type = 'SMOOTHSTEP'; m.clamp = True
    m.inputs['From Min'].default_value = a; m.inputs['From Max'].default_value = b
    nt.links.new(entree, m.inputs['Value'])
    return m.outputs['Result']

def _math(nt, op, a, b=None, v=None):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op
    if isinstance(a, (int, float)): n.inputs[0].default_value = a
    else: nt.links.new(a, n.inputs[0])
    if b is not None:
        if isinstance(b, (int, float)): n.inputs[1].default_value = b
        else: nt.links.new(b, n.inputs[1])
    return n.outputs[0]

def nuee(nom, x, y, z, larg, haut, coul, alpha=0.8, f0=1, f1=200, depart=None, monte=0.3, emis=0.0, forme='nappe', graine=0.0, ech=(2.5, 1.4)):
    """Une nuée vue de loin (fumée, nappe de brume) : un plan tourné vers la caméra (qui regarde +Y), bruit qui évolue et
    qui monte, bords fondus. forme 'colonne' : étroite en bas, large en haut (fumée) ; 'nappe' : couchée, fondue vers le haut.
    depart=(larg, haut) : elle grandit de cette taille (à f0) jusqu'à (larg, haut) (à f1)."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y, z + haut / 2))
    p = bpy.context.active_object; p.name = nom; p.rotation_euler = (math.pi / 2, 0, 0); p.scale = (larg, haut, 1)
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree
    pr = nt.nodes.get('Principled BSDF')
    pr.inputs['Base Color'].default_value = (*lin(coul), 1); pr.inputs['Roughness'].default_value = 1.0
    if emis: pr.inputs['Emission Color'].default_value = (*lin(coul), 1); pr.inputs['Emission Strength'].default_value = emis
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    u, v = sep.outputs['X'], sep.outputs['Y']
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (ech[0], ech[0] * haut / max(larg, 0.01) * ech[1], 1)
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'
    nz.inputs['Scale'].default_value = 1.5; nz.inputs['Detail'].default_value = 6; nz.inputs['Roughness'].default_value = 0.58
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    for f, w, dy in ((f0, graine, 0.0), (f1, graine + (f1 - f0) * 0.006, -(f1 - f0) * 0.004 * monte)):
        nz.inputs['W'].default_value = w; nz.inputs['W'].keyframe_insert('default_value', frame=f)
        mp.inputs['Location'].default_value = (graine, dy, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=f)
    bruit = _lisse(nt, 0.3, 0.62, nz.outputs['Fac'])
    dx = _math(nt, 'MULTIPLY', _math(nt, 'ABSOLUTE', _math(nt, 'SUBTRACT', u, 0.5)), 2.0)
    if forme == 'colonne':
        largeur = _math(nt, 'ADD', _math(nt, 'MULTIPLY', v, 0.8), 0.2)   # 0,2 en bas → 1 en haut
        mx = _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.45, 1.0, _math(nt, 'DIVIDE', dx, largeur)))
        mv = _math(nt, 'MULTIPLY', _lisse(nt, 0.0, 0.06, v), _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.7, 1.0, v)))
    else:
        mx = _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.65, 1.0, dx))
        mv = _math(nt, 'MULTIPLY', _lisse(nt, 0.0, 0.04, v), _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.25, 1.0, v)))
    a = _math(nt, 'MULTIPLY', _math(nt, 'MULTIPLY', bruit, mx), _math(nt, 'MULTIPLY', mv, alpha))
    nt.links.new(a, pr.inputs['Alpha'])
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    p.data.materials.append(m)
    p.visible_shadow = False
    if depart:
        for f, (l_, h_) in ((max(1, f0 - 1), (0.01, 0.01)), (f0, depart), (f1, (larg, haut))):
            p.scale = (l_, h_, 1); p.location.z = z + h_ / 2
            p.keyframe_insert('scale', frame=f); p.keyframe_insert('location', frame=f)
    return p

def feu_volume(x, y, z, larg=0.34, haut=0.5, f1=240, force=28.0):
    """Un petit feu de bois en volume : flammes bruitées qui montent, jaune au cœur, orange puis rouge sombre au bord."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + haut / 2))
    c = bpy.context.active_object; c.name = 'feu'; c.scale = (larg, larg, haut)
    m = bpy.data.materials.new('feu'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); v = nt.nodes.new('ShaderNodeVolumePrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs[0])
    hz = _math(nt, 'ADD', sep.outputs['Z'], 0.5)                                         # 0 en bas, 1 en haut
    cx = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(sep.outputs['X'], cx.inputs['X']); nt.links.new(sep.outputs['Y'], cx.inputs['Y'])
    lg = nt.nodes.new('ShaderNodeVectorMath'); lg.operation = 'LENGTH'; nt.links.new(cx.outputs[0], lg.inputs[0])
    rayon = _math(nt, 'SUBTRACT', 0.5, _math(nt, 'MULTIPLY', hz, 0.38))                 # la flamme s'effile en montant
    forme = _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.25, 1.0, _math(nt, 'DIVIDE', lg.outputs['Value'], rayon)))
    forme = _math(nt, 'MULTIPLY', forme, _math(nt, 'SUBTRACT', 1.0, _lisse(nt, 0.2, 0.95, hz)))
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (3.0, 3.0, 1.6)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'; nz.inputs['Scale'].default_value = 2.6; nz.inputs['Detail'].default_value = 4
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    for f, dz, w in ((1, 0.0, 0.0), (f1, -f1 * 0.05, f1 * 0.04)):
        mp.inputs['Location'].default_value = (0, 0, dz); mp.inputs['Location'].keyframe_insert('default_value', frame=f)
        nz.inputs['W'].default_value = w; nz.inputs['W'].keyframe_insert('default_value', frame=f)
    try:
        for fc in Mn.fcourbes(m.node_tree.animation_data.action):
            for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    except Exception as e: print('[feu]', e)
    flamme = _math(nt, 'MULTIPLY', forme, _lisse(nt, 0.35, 0.75, nz.outputs['Fac']))
    rp = nt.nodes.new('ShaderNodeValToRGB'); el = rp.color_ramp.elements
    el[0].position = 0.0; el[0].color = (0.25, 0.02, 0.0, 1); e_ = el.new(0.35); e_.color = (1.0, 0.25, 0.02, 1)
    e_ = el.new(0.65); e_.color = (1.0, 0.55, 0.12, 1); el[-1].position = 1.0; el[-1].color = (1.0, 0.85, 0.5, 1)
    nt.links.new(flamme, rp.inputs['Fac'])
    nt.links.new(rp.outputs['Color'], v.inputs['Emission Color'])
    nt.links.new(_math(nt, 'MULTIPLY', flamme, force), v.inputs['Emission Strength'])
    nt.links.new(_math(nt, 'MULTIPLY', flamme, 6.0), v.inputs['Density'])
    v.inputs['Color'].default_value = (0.02, 0.015, 0.01, 1)
    nt.links.new(v.outputs['Volume'], out.inputs['Volume'])
    c.data.materials.append(m)
    return c

def collines(*a, **k):
    """Les collines du fond, adoucies (sinon on voit les facettes de la sphère, surtout au téléobjectif)."""
    o = N.collines(*a, **k)
    for c in o:
        sub = c.modifiers.new('doux', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
        for pg in c.data.polygons: pg.use_smooth = True
    return o

def lumiere_point(nom, x, y, z, energie, coul=(1.0, 0.6, 0.3), rayon=0.3, ombre=True, scintille=None, f1=240):
    ld = bpy.data.lights.new(nom, 'POINT'); ld.energy = energie; ld.color = coul; ld.shadow_soft_size = rayon; ld.use_shadow = ombre
    l = bpy.data.objects.new(nom, ld); l.location = (x, y, z); bpy.context.scene.collection.objects.link(l)
    if scintille:
        k = random.random() * 10
        for fr in range(1, f1 + 1, 3): ld.energy = energie * (1 - scintille + scintille * (0.5 + 0.5 * math.sin(fr * 0.9 + k) * math.sin(fr * 0.37 + k * 2))); ld.keyframe_insert('energy', frame=fr)
    return l

def spot(nom, pos, vise, energie, angle=30, coul=(1.0, 0.93, 0.8), flou=0.5, rayon=0.05):
    L = bpy.data.lights.new(nom, 'SPOT'); L.energy = energie; L.spot_size = math.radians(angle); L.spot_blend = flou; L.color = coul; L.shadow_soft_size = rayon
    o = bpy.data.objects.new(nom, L); bpy.context.scene.collection.objects.link(o)
    o.location = pos; o.rotation_euler = (Vector(vise) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    return o

def soleil_ciel(force, elev, az, sol_force, coul, angle=1.5, air=1.0, poussiere=1.0, az_ciel=None):
    import omd_tournage as T
    for o in list(bpy.data.objects):
        if o.name.startswith('soleil'): bpy.data.objects.remove(o, do_unlink=True)
    T.monde_ciel(force, elev, (90 - az) if az_ciel is None else az_ciel, air=air, poussiere=poussiere)
    return T.soleil(elev, az, sol_force, coul, angle)

def nuit_lune(force=1.0, lune=0.35, exposition=1.2):
    """La nuit : un ciel bleu nuit qui éclaire un peu, la lune (lumière froide, haute), et une exposition relevée
    (sinon tout est noir à l'écran : on voit la nuit comme l'œil s'y habitue)."""
    import omd_tournage as T
    for o in list(bpy.data.objects):
        if o.name.startswith('soleil'): bpy.data.objects.remove(o, do_unlink=True)
    T.monde_uni((0.03, 0.04, 0.075), force)
    bpy.context.scene.view_settings.exposure = exposition
    return T.soleil(50, 200, lune, (0.6, 0.7, 1.0), 2)

def lampe_visible(x, y, z, coul=(1.0, 0.85, 0.6), r=0.06, force=40.0):
    """La source elle-même (une lampe, une torche) : un petit point très lumineux qu'on voit dans le cadre."""
    return A.sphere(x, y, z, r, A.mat_uni(coul, 0.5, emission=(*coul, force)))

def appoint(pos, vise, energie=50, taille=2.0, coul=(0.7, 0.78, 1.0)):
    L = bpy.data.lights.new('appoint', 'AREA'); L.energy = energie; L.size = taille; L.color = coul
    o = bpy.data.objects.new('appoint', L); bpy.context.scene.collection.objects.link(o)
    o.location = pos; o.rotation_euler = (Vector(vise) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    return o

def texte(corps, x, y, z, taille, mat, rot=(0, 0, 0), police=None, parent=None):
    bpy.ops.object.text_add(location=(x, y, z))
    t = bpy.context.active_object; t.data.body = corps; t.data.size = taille; t.rotation_euler = rot
    if police and os.path.exists(police): t.data.font = bpy.data.fonts.load(police, check_existing=True)
    t.data.materials.append(mat)
    if parent: t.parent = parent
    return t

def papier(nom='papier', coul='#e8e0cc', sale=0.3):
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree; p = nt.nodes.get('Principled BSDF')
    p.inputs['Roughness'].default_value = 0.85
    try: p.inputs['Subsurface Weight'].default_value = 0.05
    except Exception: pass
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9; nz.inputs['Detail'].default_value = 8
    rp = nt.nodes.new('ShaderNodeValToRGB')
    rp.color_ramp.elements[0].color = (*lin(coul), 1); rp.color_ramp.elements[1].color = (*[c * (1 - sale * 0.6) for c in lin(coul)], 1)
    nt.links.new(nz.outputs['Fac'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], p.inputs['Base Color'])
    return m

def encre(coul='#1a2238'):
    return A.mat_uni(lin(coul), 0.6)

def dof(cam, distance, fstop=2.4):
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = distance; cam.data.dof.aperture_fstop = fstop

def secouer(cam, f0, f1, ampl=0.6, frequence=0.35, graine=1, base=None):
    """Caméra portée : petits tremblements (rotation, degrés) autour de sa rotation de base."""
    rnd = random.Random(graine)
    base = base or tuple(cam.rotation_euler)
    for f in range(f0, f1 + 1, 2):
        cam.rotation_euler = (base[0] + math.radians(ampl * math.sin(f * frequence + rnd.random())),
                              base[1] + math.radians(ampl * 0.3 * math.sin(f * frequence * 0.7)),
                              base[2] + math.radians(ampl * 0.8 * math.sin(f * frequence * 0.53 + 1.3)))
        cam.keyframe_insert('rotation_euler', frame=f)

def halo(seuil=3.0, force=0.25):
    ng = bpy.data.node_groups.get('omd_compo')
    if not ng: return
    for n in ng.nodes:
        if n.type == 'GLARE':
            for k, v in (('Threshold', seuil), ('Strength', force)):
                try: n.inputs[k].default_value = v
                except Exception: pass

def mat_pierre(teinte='#e0d2b8', ech=0.5, tex='old_stone_wall'):
    return A.mat_tex(tex, ech, teinte=lin(teinte))

# ═══════════════════════════════════════════ LE REFUGE (Miramas-le-Vieux) ═══════════════════════════════════════════
# Le village perché : un rocher dont le plateau est à 16 m, ceint d'un rempart ; la porte Notre-Dame à l'ouest (−X),
# l'église et son clocher-tour au milieu, des toits de tuiles, le donjon ruiné à l'est. Le chemin monte de l'ouest.
RP = {'cx': 0.0, 'cy': 0.0, 'r': 58.0, 'h': 16.0}

def rocher_refuge():
    cx, cy, r, h = RP['cx'], RP['cy'], RP['r'], RP['h']
    # un tronc de cône : flancs rocheux en pente, sommet plat (couvert par le plateau)
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=r * 1.8, radius2=r * 1.25, depth=h, location=(cx, cy, h / 2 - 0.4))
    ro = bpy.context.active_object; ro.name = 'rocher'
    ro.scale = (1.15, 0.85, 1)
    sub = ro.modifiers.new('sub', 'SUBSURF'); sub.levels = 3; sub.render_levels = 3; sub.subdivision_type = 'SIMPLE'
    tx = bpy.data.textures.new('rocher', 'CLOUDS'); tx.noise_scale = 4.0
    d = ro.modifiers.new('relief', 'DISPLACE'); d.texture = tx; d.strength = 2.5; d.mid_level = 0.6
    ro.data.materials.append(A.mat_tex('marble_cliff_01', 0.08, teinte=lin('#d9ccb0')))
    with bpy.context.temp_override(object=ro, active_object=ro, selected_objects=[ro], selected_editable_objects=[ro]): bpy.ops.object.shade_smooth()
    # le plateau
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=r * 1.25, depth=1.2, location=(cx, cy, h - 0.6))
    pl = bpy.context.active_object; pl.scale = (1.15, 0.85, 1); pl.data.materials.append(A.mat_tex('dirt', 0.3, teinte=lin('#c8b898')))
    return ro, pl

def rempart(ep=1.3, haut=6.5, nuit=False, porte_ouverte=False):
    """L'enceinte au bord du plateau, crénelée ; la porte Notre-Dame à l'ouest, bouchée de palettes et de tôles."""
    cx, cy, r, h = RP['cx'], RP['cy'], RP['r'], RP['h']
    pierre = mat_pierre('#d6c6a6', 0.45, 'castle_brick_01')
    o = []
    n = 40
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
        if abs(((a0 + a1) / 2 - math.pi + math.pi) % (2 * math.pi) - math.pi) < 0.09: continue   # l'ouverture de la porte (a = π)
        p0 = Vector((cx + math.cos(a0) * r * 1.13, cy + math.sin(a0) * r * 0.84, h)); p1 = Vector((cx + math.cos(a1) * r * 1.13, cy + math.sin(a1) * r * 0.84, h))
        m = (p0 + p1) / 2; L = (p1 - p0).length
        b = boite(m.x, m.y, h, L + 0.4, ep, haut, pierre); b.rotation_euler.z = math.atan2(p1.y - p0.y, p1.x - p0.x); o.append(b)
        for c in range(3):   # créneaux
            t = (c + 0.5) / 3
            q = p0 + (p1 - p0) * t
            cr = boite(q.x, q.y, h + haut, 1.1, ep, 0.9, pierre); cr.rotation_euler.z = b.rotation_euler.z; o.append(cr)
    # la porte : deux tours carrées, l'arc, les palettes et les tôles
    gx = cx - r * 1.13
    for sy in (-1, 1):
        o.append(boite(gx, cy + sy * 3.6, h - 2, 4.2, 3.2, haut + 5, pierre))
    o.append(boite(gx, cy, h + 4.2, 4.2, 4.2, haut - 2.7, pierre))
    if not porte_ouverte:
        bois = A.mat_tex('old_planks_02', 0.9, teinte=lin('#b8a080'))
        tole = A.mat_tex('rusty_metal_sheet', 0.5)
        for k in range(5):   # palettes empilées
            o.append(boite(gx - 0.4, cy - 1.6 + (k % 2) * 0.1, h + k * 0.85, 0.15, 2.0, 0.8, bois))
            o.append(boite(gx - 0.4, cy + 1.0 - (k % 3) * 0.1, h + k * 0.85, 0.15, 2.0, 0.8, bois))
        for k in range(3):
            t = boite(gx - 0.6, cy - 1.2 + k * 1.2, h + 0.2, 0.05, 1.3, 3.6, tole); t.rotation_euler.x = math.radians(random.uniform(-4, 4)); o.append(t)
    return o

def clocher(x, y, h0, haut=17.0):
    """Le clocher-tour de Notre-Dame-de-Beauvezer : pierre blonde, baies de la chambre des cloches, toit de tuiles."""
    pierre = mat_pierre('#e2d4b4', 0.4, 'white_sandstone_blocks_02')
    noir = A.mat_uni((0.01, 0.009, 0.008), 0.9)
    o = [boite(x, y, h0, 5.0, 5.0, haut, pierre)]
    for sx, sy in ((0, -2.52), (0, 2.52), (-2.52, 0), (2.52, 0)):
        o.append(boite(x + sx, y + sy, h0 + haut - 4.5, 1.4 if sx == 0 else 0.1, 0.1 if sx == 0 else 1.4, 2.6, noir))
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=4.1, radius2=0.2, depth=3.2, location=(x, y, h0 + haut + 1.6))
    t = bpy.context.active_object; t.rotation_euler.z = math.pi / 4; t.data.materials.append(A.mat_tex('clay_roof_tiles', 1.0)); o.append(t)
    return o

def maisons_refuge(rnd, nuit=False):
    cx, cy, r, h = RP['cx'], RP['cy'], RP['r'], RP['h']
    toit = A.mat_tex('clay_roof_tiles', 1.0)
    o = []
    for k in range(26):
        a = rnd.uniform(0, 2 * math.pi); d = rnd.uniform(0.25, 0.85) * r
        x, y = cx + math.cos(a) * d * 1.1, cy + math.sin(a) * d * 0.8
        if abs(x - cx) < 9 and abs(y - cy) < 9: continue
        w, l, ht = rnd.uniform(6, 10), rnd.uniform(5, 8), rnd.uniform(5, 8)
        mur = A.mat_tex(rnd.choice(['white_stucco', 'beige_wall_001', 'old_sandstone_02']), 0.5, teinte=lin(rnd.choice(['#efe2c8', '#e8d4b4', '#dccbb0'])))
        b = boite(x, y, h, w, l, ht, mur); b.rotation_euler.z = rnd.uniform(-0.3, 0.3); o.append(b)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=max(w, l) * 0.75, radius2=0.1, depth=2.0, location=(x, y, h + ht + 1.0))
        t = bpy.context.active_object; t.scale = (w / max(w, l), l / max(w, l), 1); t.rotation_euler.z = b.rotation_euler.z + math.pi / 4; t.data.materials.append(toit); o.append(t)
        if nuit and rnd.random() < 0.3:
            lumiere_point('fenetre', x + rnd.uniform(-2, 2), y + rnd.uniform(-2, 2), h + 2.5, 60, (1.0, 0.62, 0.3), 0.4, False)
    # le donjon ruiné, à l'est
    o.append(boite(cx + r * 0.9, cy + 6, h, 9, 9, 13, mat_pierre('#cdbf9f', 0.4, 'castle_brick_01')))
    return o

def refuge(rnd, nuit=False, porte_ouverte=False, oliviers=True):
    """Tout le village sur son rocher, la plaine autour, le chemin qui monte à la porte."""
    N.terrain(1600, 'aerial_grass_rock', '#bfb08c', 0.8, 0.03, 140)
    collines(rnd, 9, 700, 1400, teinte='#a8a088')
    rocher_refuge()
    rempart(nuit=nuit, porte_ouverte=porte_ouverte)
    clocher(RP['cx'] - 6, RP['cy'] + 2, RP['h'])
    maisons_refuge(rnd, nuit)
    # le chemin : une rampe de terre qui monte vers la terrasse devant la porte
    bord = RP['cx'] - RP['r'] * 1.25 * 1.15
    ch = boite(bord - 32, RP['cy'], 0, 66, 4.5, 0.3, A.mat_tex('dirt', 0.4, teinte=lin('#b8a888')))
    ch.rotation_euler.y = math.radians(-13.8); ch.location.z = RP['h'] / 2 - 0.2
    if oliviers:
        for k in range(36):
            a = rnd.uniform(0, 2 * math.pi); d = rnd.uniform(1.45, 2.6) * RP['r']
            N.olivier(math.cos(a) * d, math.sin(a) * d, rnd, rnd.uniform(0.8, 1.2))
    return ch

def garde_sur_rempart(x, y, z, vise, torche=True, energie=2500):
    """Un guetteur sur le rempart (silhouette), et le faisceau de sa lampe."""
    g = H.humain('guetteur', 'h', 'jeune', poids=0.4, muscle=0.6, vetements=['mindfront_knitted_sweater_01', 'mindfront_male_trousers_2'], cheveux='short02', graine=21)
    ang = math.atan2(vise[1] - y, vise[0] - x)
    g.location = (x, y, z); H.orienter(g, ang + math.pi / 2)
    H.poser(g, 'debout', {'upperarm01.R': [(H.X, -60)], 'lowerarm01.R': [(H.X, -20)]})
    av = Vector((math.cos(ang), math.sin(ang), 0)); dr = Vector((math.sin(ang), -math.cos(ang), 0))
    main = Vector((x, y, z)) + av * 0.55 + dr * 0.22 + Vector((0, 0, 1.38))
    l = spot('torche_guetteur', tuple(main + av * 0.08), vise, energie, 22, flou=0.4) if torche else None
    return g, l, tuple(main)

# ═══════════════════════════════════════════ LA CRAU ═══════════════════════════════════════════
def crau_sol(rnd, teinte='#bcae8e', galets=True):
    N.terrain(2000, 'aerial_grass_rock', teinte, 0.35, 0.03, 140)
    collines(rnd, 7, 900, 1700, teinte='#9a9888', hmax=120, angles=(20, 160))   # les Alpilles au nord
    if galets: N.galets(rnd, (-40, -30, 40, 50), 900)

def pylone(x, y, h=28, rot=0.0):
    fer = A.mat_uni(lin('#5a5e60'), 0.5, 0.7)
    o = []
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        a = Vector((x + sx * 2.6, y + sy * 2.6, 0)); b = Vector((x + sx * 0.5, y + sy * 0.5, h)); d = b - a
        c = A.cylindre(0, 0, 0, 0.12, d.length, fer, 6); c.location = (a + b) / 2; c.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.append(c)
    for z in (h * 0.3, h * 0.55, h * 0.78):
        w = 2.6 - 2.1 * z / h
        o.append(boite(x, y, z, w * 2, 0.1, 0.1, fer)); o.append(boite(x, y, z, 0.1, w * 2, 0.1, fer))
    o.append(boite(x, y, h * 0.86, 12, 0.3, 0.3, fer)); o.append(boite(x, y, h * 0.7, 9, 0.3, 0.3, fer))
    g = V.joindre(o, 'pylone'); g.rotation_euler.z = rot
    return g

def bergerie_crau(x, y, rot=0.0):
    """La bergerie de Cabassole : un long bâtiment bas de galets et de pierre, toit de tuiles à deux pentes, et le mas."""
    pierre = mat_pierre('#d8c8a8', 0.5, 'rustic_stone_wall')
    toit = A.mat_tex('clay_roof_tiles', 1.0, teinte=lin('#d8b8a0'))
    import omd_catalogue as C
    o = [boite(x, y, 0, 44, 9, 4.2, pierre)]
    pr = C.prisme([(-5.2, 0), (0, 2.6), (5.2, 0)], 45, toit, 'toit_bergerie'); pr.location = (x, y, 4.2); pr.rotation_euler.z = math.pi / 2; o.append(pr)
    o.append(boite(x + 26, y + 2, 0, 9, 8, 6.2, mat_pierre('#e0d0b0', 0.5, 'old_sandstone_02')))
    pr2 = C.prisme([(-4.6, 0), (0, 2.2), (4.6, 0)], 10, toit, 'toit_mas'); pr2.location = (x + 26, y + 2, 6.2); pr2.rotation_euler.z = math.pi / 2; o.append(pr2)
    noir = A.mat_uni((0.02, 0.018, 0.015), 0.9)
    for k in range(4): o.append(boite(x - 15 + k * 10, y - 4.55, 0, 2.6, 0.1, 3.0, noir))   # les grandes portes
    for o_ in o: o_.rotation_euler.z += rot
    return o

def fernand(x, y, angle, pose_extra=None):
    f = H.humain('fernand', 'h', 'vieux', poids=0.35, muscle=0.35, taille=0.4, vetements=['mindfront_knitted_sweater_01', 'mindfront_male_trousers_2'], cheveux='short01', graine=77)
    f.location = (x, y, 0); H.orienter(f, angle)
    H.poser(f, 'debout', pose_extra or {'upperarm01.R': [(H.X, -18)], 'lowerarm01.R': [(H.X, -40)]})
    baton = A.cylindre(0, 0, 0, 0.018, 1.35, A.mat_tex('dark_wood', 1.0), 8)
    baton.parent = f; baton.parent_type = 'BONE'; baton.parent_bone = 'wrist.R'; baton.location = (0, 0.05, 0); baton.rotation_euler = (math.radians(90), 0, 0)
    return f

# ═══════════════════════════════════════════ LA GARE DE TRIAGE ═══════════════════════════════════════════
def triage(rnd, y0=0.0, n_voies=12, longueur=600, citernes=True):
    ballast = A.mat_tex('gravel_stones', 0.4, teinte=lin('#9a9488'))
    boite(0, y0 + n_voies * 2.5, -0.02, longueur * 1.3, n_voies * 6, 0.04, ballast)
    couleurs = ['#6a3a2a', '#4a4e52', '#7a6a4a', '#3a4a5a', '#8a8a86']
    o = []
    for v in range(n_voies):
        y = y0 + v * 5.0
        x = -longueur / 2
        while x < longueur / 2:
            if rnd.random() < 0.18: x += rnd.uniform(10, 40); continue
            L = rnd.uniform(14, 19)
            if citernes and v in (n_voies // 2, n_voies // 2 + 1) and abs(x) < 120:
                c = A.cylindre(x + L / 2, y, 1.1, 1.35, L - 1, A.mat_uni(lin('#e8e8e2'), 0.4, 0.2), 20)
                c.rotation_euler.y = math.pi / 2; c.location = (x + L / 2, y, 2.4)
                o.append(boite(x + L / 2, y, 0.9, L - 0.6, 2.6, 0.2, A.mat_uni(lin('#2a2a2a'), 0.6)))
                o.append(boite(x + L / 2, y - 1.36, 2.2, 0.5, 0.02, 0.35, A.mat_uni(lin('#e86a10'), 0.5)))
                o.append(c)
            else:
                o.append(boite(x + L / 2, y, 0.9, L - 0.6, 2.9, rnd.uniform(2.8, 3.6), A.mat_tex('container_side', 0.5, teinte=lin(rnd.choice(couleurs)))))
            x += L
    return o

def explosion(x, y, z, f0, rayon=18, energie=6e7, fumee=True):
    """Une bombe : éclair, boule de feu qui gonfle puis s'éteint, colonne de fumée noire qui monte."""
    feu = A.mat_uni((0.035, 0.03, 0.026), 0.9, emission=(1.0, 0.5, 0.12, 0.0))      # éteinte, c'est de la fumée
    p = next(n for n in feu.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bpy.ops.mesh.primitive_ico_sphere_add(radius=1, subdivisions=3, location=(x, y, z))
    b = bpy.context.active_object; b.data.materials.append(feu)
    d = b.modifiers.new('relief', 'DISPLACE'); tx = bpy.data.textures.new('boule', 'CLOUDS'); tx.noise_scale = 0.4; d.texture = tx; d.strength = 0.35
    for f, s, e in ((f0 - 1, 0.01, 0), (f0, 0.3, 60), (f0 + 6, rayon * 0.8, 40), (f0 + 16, rayon, 14), (f0 + 28, rayon * 0.75, 3), (f0 + 40, 0.01, 0)):
        b.scale = (s, s, s * 0.8); b.keyframe_insert('scale', frame=max(1, f))
        b.location.z = z + max(0, f - f0) * rayon * 0.03; b.keyframe_insert('location', frame=max(1, f))
        p.inputs['Emission Strength'].default_value = e; p.inputs['Emission Strength'].keyframe_insert('default_value', frame=max(1, f))
    ld = bpy.data.lights.new('eclair', 'POINT'); ld.color = (1.0, 0.62, 0.3); ld.shadow_soft_size = rayon
    l = bpy.data.objects.new('eclair', ld); l.location = (x, y, z + 8); bpy.context.scene.collection.objects.link(l)
    for f, e in ((f0 - 1, 0), (f0, energie), (f0 + 10, energie * 0.4), (f0 + 40, energie * 0.08), (f0 + 80, 0)): ld.energy = e; ld.keyframe_insert('energy', frame=max(1, f))
    if fumee:
        nuee('fumee_' + str(f0), x, y + rayon, 0, rayon * 6, rayon * 9, '#0d0b0a', 1.0, f0 + 2, f0 + 150, depart=(rayon * 2.2, rayon * 1.6),
             monte=0.6, forme='colonne', graine=f0 * 0.37, ech=(2.2, 1.0))
    return b

def nuage_chlore(x, y, f0, f1, depart=30, fin=420, h=14, coul='#c8c45a', densite=0.05):
    """Le nuage jaune-vert qui ne monte pas : une nappe qui s'étale au ras du sol."""
    c = vol('chlore', x, y, 0, depart, depart, h, coul, densite, 0.75, derive=(40, 10), f1=f1, emis=0.01, bord=0.7)
    c.scale = (depart, depart * 0.7, h * 0.4); c.keyframe_insert('scale', frame=max(1, f0))
    c.scale = (fin, fin * 0.55, h); c.keyframe_insert('scale', frame=f1)
    return c

# ═══════════════════════════════════════════ MAINS ═══════════════════════════════════════════
def corps_fp(sexe='h', age='adulte', vetements=None, peau='middleage_caucasian_male', sale=0.45, graine=3, nom='fp'):
    fp = Mn.creer(sexe, age, vetements or ['elvs_crude_t-shirt_male', 'elvs_jeans_straight_leg'], peau, graine=graine, nom=nom)
    if sale: Mn.salir(fp, sale)
    return fp

def respiration(fp, f0, f1, ampl=0.006):
    rig = fp['rig']
    for f in range(f0, f1 + 1, 4):
        rig.location = (0, 0, ampl * math.sin(f / 24 * 1.6)); rig.keyframe_insert('location', frame=f)

def radio_poche():
    """Un petit poste à piles (années 1990) : boîtier de plastique noir, grille, cadran éclairé, molette, antenne."""
    noir = A.mat_uni(lin('#16171a'), 0.45)
    o = [boite(0, 0, 0, 0.16, 0.045, 0.095, noir)]
    grille = A.mat_uni(lin('#0a0a0b'), 0.8)
    o.append(boite(-0.035, -0.0226, 0.012, 0.075, 0.002, 0.07, grille))
    o.append(boite(0.045, -0.0226, 0.055, 0.055, 0.002, 0.022, A.mat_uni((0.3, 0.18, 0.05), 0.3, emission=(1.0, 0.55, 0.15, 3.0))))
    mol = A.cylindre(0.075, 0, 0.03, 0.016, 0.012, A.mat_uni(lin('#2a2a2c'), 0.5, 0.3), 24); mol.rotation_euler.y = math.pi / 2; mol.location = (0.086, 0, 0.035); o.append(mol)
    o.append(A.cylindre(-0.07, 0.01, 0.095, 0.003, 0.32, A.mat_uni(lin('#b8b8bc'), 0.25, 0.9), 8))
    g = V.joindre([x for x in o if x is not mol], 'radio'); mol.parent = g
    return g, mol

# ═══════════════════════════════════════════ LES PLANS ═══════════════════════════════════════════
# ─── intro_1 : la Crau au lever du jour ───
def intro_1(T):
    f1 = frames(8500)
    rnd = random.Random(301)
    soleil_ciel(0.55, 2.5, 80, 2.4, (1.0, 0.6, 0.38), 2, poussiere=3.0)
    crau_sol(rnd)
    route = boite(0, 300, 0.01, 7.5, 1600, 0.04, A.mat_tex('asphalt_floor', 0.4, teinte=lin('#a8a49c')))
    for k in range(-2, 14): pylone(14, k * 120, 28, 0.0)
    V.voiture_rue(-2.2, 40, 0.3, '#1a1a1a', rnd)
    cal = [o for o in bpy.data.objects if o.name.startswith('groupe')]
    for o in bpy.data.objects:
        if o.parent in cal and o.type == 'MESH':
            for s in o.material_slots:
                if s.material: s.material = A.mat_uni(lin('#1c1814'), 0.95)
    for k in range(18): N.cypres(-60 + rnd.uniform(-3, 3), 60 + k * 9, rnd, rnd.uniform(0.9, 1.2))
    T.camera([(1, (2.0, -6, 1.7), (1, 80, 2.4)), (f1, (1.2, 6, 1.75), (0, 90, 2.6))], lens=28)
    return 1, f1

# ─── intro_2 : les mains et la radio, la nuit, dans une ruine ───
def intro_2(T):
    f1 = frames(8000)
    T.monde_uni((0.004, 0.005, 0.008), 1.0)
    fp = corps_fp(vetements=['mindfront_knitted_sweater_01', 'elvs_jeans_straight_leg'])
    Mn.regard(fp, -58, 0)
    fp['cam'].data.lens = 26
    # le sol de la ruine, une bougie
    boite(0, -0.3, 0, 4, 4, 0.02, A.mat_tex('old_planks_02', 0.9, teinte=lin('#8a7a62')))
    boite(0, -1.6, 0, 4, 0.3, 2.5, mat_pierre('#a89878', 0.6, 'rustic_stone_wall'))
    cire = A.cylindre(0.35, -0.55, 0.0, 0.025, 0.09, A.mat_uni(lin('#e8e0c8'), 0.6), 16)
    flamme = A.sphere(0.35, -0.55, 0.105, 0.008, A.mat_uni((1, 0.6, 0.2), 0.5, emission=(1.0, 0.6, 0.2, 30.0)), 1.8)
    lumiere_point('bougie', 0.35, -0.55, 0.14, 25, (1.0, 0.62, 0.3), 0.02, True, 0.25, f1)
    appoint((0.0, 0.6, 2.2), (0, -0.4, 1.1), 12, 1.0, (0.55, 0.62, 0.9))
    bpy.context.scene.view_settings.exposure = 1.0
    # la radio tenue à deux mains, à hauteur de poitrine
    rad, mol = radio_poche()
    base = Mn.c2w(fp, (0.0, -0.025, 0.33))
    rad.location = base; rad.rotation_euler = (math.radians(-32), 0, math.radians(180))
    for f in range(1, f1 + 1, 4):
        t = f / f1
        Mn.main(fp, 'G', poignet=(-0.1, -0.075, 0.3), doigts=(0.75, 0.35, 0.5), paume=(0.2, 0.9, -0.2), courbe={'tous': 0.55, 'index': 0.45}, ecart=0.1, pouce=(0.3, 0.6))
        pouce = 0.25 + 0.25 * math.sin(f / 24 * 2.2)
        Mn.main(fp, 'D', poignet=(0.13, -0.06, 0.31), doigts=(-0.4, 0.55, 0.5), paume=(-0.85, 0.2, -0.3), courbe={'tous': 0.5, 'index': 0.35}, ecart=0.08, pouce=(pouce, 0.5))
        Mn.figer(fp, f)
        mol.rotation_euler.x = 1.2 * t; mol.keyframe_insert('rotation_euler', frame=f)
    respiration(fp, 1, f1, 0.004)
    Mn.lisser_cles(fp)
    dof(fp['cam'], 0.33, 2.8)
    return 1, f1

# ─── intro_3 : la voie ferrée vers le village perché, au soleil couchant ───
def intro_3(T):
    f1 = frames(9000)
    rnd = random.Random(303)
    soleil_ciel(0.6, 3, 160, 2.6, (1.0, 0.52, 0.3), 2.5, poussiere=3.5)
    refuge(rnd, nuit=False)
    ballast = A.mat_tex('gravel_stones', 0.6, teinte=lin('#a49c8e'))
    fer = A.mat_uni(lin('#5a4a40'), 0.35, 0.8)
    bois = A.mat_tex('old_planks_02', 1.2, teinte=lin('#6a5a48'))
    x0 = -RP['r'] * 1.13 - 60
    boite(x0, -260, 0.02, 4.2, 520, 0.25, ballast)
    for sx in (-0.72, 0.72): boite(x0 + sx, -260, 0.3, 0.07, 520, 0.14, fer)
    for k in range(700): boite(x0, -520 + k * 0.6 + 0.3, 0.27, 2.6, 0.22, 0.12, bois)
    for k in range(20): N.olivier(x0 + rnd.choice([-1, 1]) * rnd.uniform(6, 30), -rnd.uniform(20, 400), rnd)
    # on marche : la caméra avance au pas, elle balance un peu
    sc = bpy.context.scene
    cles = []
    for f in range(1, f1 + 1, 6):
        y = -360 + (f / 24) * 1.35
        z = 1.66 + 0.03 * abs(math.sin(f / 24 * 1.8 * math.pi))
        x = x0 + 0.04 * math.sin(f / 24 * 0.9 * math.pi)
        cles.append((f, (x, y, z), (x0 + 30, 40, 22)))
    T.camera(cles, lens=30)
    return 1, f1

# ─── intro_4 : la porte Notre-Dame, la lampe qui descend sur toi ───
def intro_4(T):
    f1 = frames(7000)
    rnd = random.Random(304)
    nuit_lune(1.0, 0.35)
    refuge(rnd, nuit=True)
    gx = RP['cx'] - RP['r'] * 1.13
    # le dessus du bloc de la porte (entre les deux tours) est à h + 8 : le guetteur s'y tient, la lampe braquée sur toi
    g, l, main = garde_sur_rempart(gx + 0.5, 0.4, RP['h'] + 8.0, (gx - 15, -3.0, RP['h'] + 1.2), True, 15000)
    lampe_visible(*main, (1.0, 0.85, 0.6), 0.05, 60)
    lumiere_point('torche_mur', gx - 1, 4.5, RP['h'] + 3.0, 300, (1.0, 0.55, 0.25), 0.3, True, 0.3, f1)
    appoint((gx - 30, -10, 30), (gx, 0, RP['h']), 400, 20, (0.45, 0.55, 0.85))
    appoint((gx - 4, -2, RP['h'] + 9.5), (gx + 0.5, 0.4, RP['h'] + 9.0), 60, 2.0, (0.6, 0.66, 0.9))   # la lune sur le guetteur
    T.camera([(1, (gx - 15, -3.0, RP['h'] + 1.65), (gx, 0.5, RP['h'] + 3.0)), (f1, (gx - 13.5, -2.4, RP['h'] + 1.6), (gx + 0.3, 0.4, RP['h'] + 8.4))], lens=26)
    return 1, f1

# ─── intro_5 : les mains levées dans le faisceau, puis les avant-bras qu'on tourne ───
def intro_5(T):
    f1 = frames(8000)
    rnd = random.Random(305)
    nuit_lune(1.0, 0.35)
    refuge(rnd, nuit=True, oliviers=False)
    gx = RP['cx'] - RP['r'] * 1.13
    _g, _l, main = garde_sur_rempart(gx + 0.5, 0.4, RP['h'] + 8.0, (gx - 6, 0, RP['h'] + 1.2), False)
    fp = corps_fp()
    # le corps se tient sur la terrasse, face à la porte (le personnage regarde −Y : on le tourne vers +X)
    rig = fp['rig']; rig.location = (gx - 6, 0, RP['h']); H.orienter(rig, math.pi / 2)
    fp['cam'].data.lens = 28
    Mn.regard(fp, 10, 0)
    spot('torche', main, (gx - 6, 0, RP['h'] + 1.3), 15000, 20, flou=0.35)
    lampe_visible(*main, (1.0, 0.85, 0.6), 0.05, 60)
    lumiere_point('torche_mur', gx - 1, 4.5, RP['h'] + 3.0, 400, (1.0, 0.55, 0.25), 0.3, True, 0.3, f1)
    appoint((gx - 9, 0.5, RP['h'] + 3), (gx - 6, 0, RP['h'] + 1.4), 450, 1.5, (0.82, 0.8, 0.92))
    for f in range(1, f1 + 1, 2):
        t = f / f1
        monte = min(1, t / 0.18)                        # les mains montent dans le cadre
        tourne = max(0, min(1, (t - 0.45) / 0.25))      # puis on tourne les avant-bras
        y = -0.42 + 0.38 * (1 - (1 - monte) ** 2)
        for c, s in (('G', -1), ('D', 1)):
            x = s * (0.15 - 0.04 * tourne)
            dz = 0.52 - 0.15 * tourne
            doigts = Vector((s * (0.1 + 0.05 * tourne), 1, 0.08 + 0.2 * tourne))
            paume = Vector((0, 0.1, 1)).lerp(Vector((s * -0.1, 0.0, -1)), tourne)
            Mn.main(fp, c, poignet=(x, y - 0.07 * tourne, dz), doigts=tuple(doigts), paume=tuple(paume), courbe={'tous': 0.15 + 0.05 * tourne}, ecart=0.45 - 0.15 * tourne, pouce=(0.1, 0.15))
        Mn.figer(fp, f)
    respiration(fp, 1, f1, 0.008)
    Mn.lisser_cles(fp)
    secouer(fp['cam'], 1, f1, 0.35, 0.22, 5)
    dof(fp['cam'], 0.5, 4.5)
    return 1, f1

# ─── frappe_1 : l'aube sur la Crau, Fernand de dos, deux avions très bas ───
def frappe_1(T):
    f1 = frames(7000)
    rnd = random.Random(311)
    soleil_ciel(0.5, 2, 95, 2.2, (1.0, 0.6, 0.4), 2, poussiere=3.0)
    crau_sol(rnd)
    bergerie_crau(-70, -30, 0)
    for k in range(16): N.cypres(-70 + k * 4.1, 62, rnd, rnd.uniform(1.4, 1.8))
    fernand(4.8, 5.5, math.pi)
    for k in range(2):
        N.avion(-900, 900 + k * 40, 45 + k * 6, 0, ('#5a5e60', '#5a5e60', '#5a5e60'), 1.2)
        g = [o for o in bpy.data.objects if o.name.startswith('groupe')][-1]
        # ~250 m/s, à trente mètres du sol : une seconde pour traverser le cadre
        g.location = (-520 - k * 60, 260 + k * 30, 30 + k * 5); g.keyframe_insert('location', frame=40)
        g.location = (520 - k * 60, 260 + k * 30, 28 + k * 5); g.keyframe_insert('location', frame=140)
        for fc in Mn.fcourbes(g.animation_data.action):
            for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    T.camera([(1, (4.0, 1.0, 1.6), (-2, 120, 9)), (f1, (3.9, 1.3, 1.58), (6, 120, 10.5))], lens=35)
    secouer(bpy.data.objects['cam_plan'], 70, 140, 0.6, 1.3, 2)
    return 1, f1

# ─── frappe_2 : la gare de triage au loin — le feu, puis le jaune qui ne monte pas ───
def frappe_2(T):
    f1 = frames(9000)
    rnd = random.Random(312)
    soleil_ciel(0.5, 3, 95, 2.0, (1.0, 0.6, 0.42), 2, poussiere=3.5)
    volumes_loin(900)
    crau_sol(rnd, galets=False)
    triage(rnd, 420, 10, 420)
    for k, (dx, f0) in enumerate(((-110, 18), (-30, 30), (50, 40), (-70, 52), (100, 60), (10, 70))):
        explosion(dx, 440 + rnd.uniform(0, 30), 3, f0, rnd.uniform(9, 15), 3e7)
    for k, (dy, dx) in enumerate(((-12, -20), (14, 30), (40, -60))):   # le jaune : trois nappes qui s'étalent au ras du sol
        nuee(f'chlore{k}', dx, 450 + dy, 0, 420 - k * 60, 18 - k * 2, '#c4be56', 0.95 - k * 0.1, 70 + k * 8, f1, depart=(40, 4),
             monte=0.05, emis=0.1, forme='nappe', graine=k * 2.3, ech=(6.0, 1.0))
    T.camera([(1, (0, -10, 5), (0, 440, 12)), (f1, (0, 20, 5.2), (14, 440, 10))], lens=45)
    secouer(bpy.data.objects['cam_plan'], 20, 90, 0.25, 1.1, 3)
    return 1, f1

# ─── frappe_3 : l'enveloppe entre les mains, le nuage flou derrière ───
def frappe_3(T):
    f1 = frames(7000)
    rnd = random.Random(313)
    soleil_ciel(0.5, 4, 95, 2.0, (1.0, 0.62, 0.42), 2, poussiere=3.5)
    volumes_loin(2500)
    crau_sol(rnd, galets=True)
    nuage_chlore(0, 1500, 1, f1, 400, 520, 18, '#c8c45a', 0.035)
    fp = corps_fp(vetements=['mindfront_knitted_sweater_01', 'elvs_jeans_straight_leg'])
    rig = fp['rig']; H.orienter(rig, math.pi)    # face à +Y (vers la gare)
    Mn.regard(fp, -42, 0); fp['cam'].data.lens = 28
    env = boite(0, 0, 0, 0.23, 0.115, 0.0015, papier('enveloppe', '#e6dcc4', 0.35))
    env.location = Mn.c2w(fp, (0.0, -0.01, 0.34)); env.rotation_euler = (math.radians(-48), 0, rig.rotation_euler.z)
    env.rotation_mode = 'XYZ'
    t = texte('À n’ouvrir que si\nle Refuge tombe.\n           H.', 0, 0, 0, 0.018, encre(), police=POLICE_MAIN, parent=env)
    t.location = (0.05, -0.012, 0.0009); t.rotation_euler = (0, 0, math.pi); t.scale = (1, 1, 1)
    for f in range(1, f1 + 1, 3):
        serre = 0.5 + 0.15 * max(0, math.sin(f / 24 * 1.4))
        Mn.main(fp, 'G', poignet=(-0.15, -0.075, 0.33), doigts=(0.3, 0.75, 0.6), paume=(0.85, 0.0, 0.5), courbe={'tous': serre * 0.7}, ecart=0.08, pouce=(0.2, 0.85))
        Mn.main(fp, 'D', poignet=(0.15, -0.075, 0.33), doigts=(-0.3, 0.75, 0.6), paume=(-0.85, 0.0, 0.5), courbe={'tous': serre * 0.7}, ecart=0.08, pouce=(0.2, 0.85))
        Mn.figer(fp, f)
    respiration(fp, 1, f1, 0.006)
    Mn.lisser_cles(fp)
    dof(fp['cam'], 0.34, 2.8)
    return 1, f1

# ─── chute_1 : le rocher la nuit, les torches, la marée qui monte, le camion qui fuit ───
def chute_1(T):
    f1 = frames(7000)
    rnd = random.Random(321)
    nuit_lune(1.0, 0.4, 1.0)
    refuge(rnd, nuit=True, porte_ouverte=True)
    gx = RP['cx'] - RP['r'] * 1.13
    for k in range(10):
        a = math.pi + rnd.uniform(-0.9, 0.9)
        lumiere_point('torche', RP['cx'] + math.cos(a) * RP['r'] * 1.1, RP['cy'] + math.sin(a) * RP['r'] * 0.82, RP['h'] + 7.5, 800, (1.0, 0.5, 0.2), 0.3, k < 3, 0.35, f1)
    S, M = statues_foule(6, 322)
    pts = [(gx - rnd.uniform(12, 75), rnd.uniform(-40, 40)) for _ in range(500)]
    pied, bord = RP['cx'] - RP['r'] * 1.8 * 1.15, RP['cx'] - RP['r'] * 1.25 * 1.15
    pente = lambda x: max(0.0, min(RP['h'], (x - pied) / (bord - pied) * RP['h']))
    for o in H.foule_statique(S, pts, None, 0, (1, 0), rnd):   # ils montent la pente : la hauteur suit le rocher
        x0, y0 = o.location.x, o.location.y; v = rnd.uniform(3.5, 6.5)
        for f in (1, f1):
            x = x0 + v * f / f1; o.location = (x, y0, pente(x)); o.keyframe_insert('location', frame=f)
    # le camion qui descend le chemin, phares allumés
    cam_ = boite(gx - 4, 0, RP['h'], 7.5, 2.5, 3.2, A.mat_tex('hessian_380', 0.5, teinte=lin('#6a7058')))
    cam_.keyframe_insert('location', frame=20); cam_.location = (gx - 45, 0, RP['h'] - 11); cam_.keyframe_insert('location', frame=f1)
    for sy in (-0.9, 0.9):
        p = spot('phare', (0, 0, 0), (-10, sy * 2, -2.5), 30000, 40, (1.0, 0.92, 0.75), 0.4)
        p.parent = cam_; p.location = (-3.9, sy, 1.0); p.rotation_euler = (math.radians(95), 0, math.radians(90))
    appoint((gx - 200, -150, 120), (gx, 0, RP['h']), 3000, 80, (0.35, 0.45, 0.8))
    T.camera([(1, (gx - 120, -70, 4), (gx - 10, 0, RP['h'])), (f1, (gx - 110, -60, 5), (gx - 20, 5, RP['h'] + 2))], lens=35)
    return 1, f1

# ─── chute_2 : les vieilles mains de Fernand sur la corde de la cloche ───
def chute_2(T):
    f1 = frames(7000)
    T.monde_uni((0.01, 0.012, 0.02), 1.0)
    bpy.context.scene.view_settings.exposure = 1.3
    fp = corps_fp('h', 'vieux', ['mindfront_knitted_sweater_01', 'mindfront_male_trousers_2'], 'old_caucasian_male', 0.5, graine=77, nom='fernand_fp')
    rig = fp['rig']
    Mn.regard(fp, 40, 0)
    # la chambre des cloches : des murs de pierre, la corde qui monte, la cloche en haut
    pierre = mat_pierre('#b8a888', 0.5, 'castle_brick_01')
    for x, y, sx, sy in ((0, -1.7, 4, 0.4), (0, 1.7, 4, 0.4), (-1.9, 0, 0.4, 4), (1.9, 0, 0.4, 4)):
        boite(x, y, 0, sx, sy, 7, pierre)
    corde = A.cylindre(0, 0, 0, 0.016, 6.5, A.mat_tex('hessian_230', 2.0, teinte=lin('#a89070')), 10)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.65, radius2=0.35, depth=0.9, location=(0, -0.62, 5.9))
    cl = bpy.context.active_object; cl.data.materials.append(A.mat_uni(lin('#5a4a2a'), 0.35, 0.9))
    lumiere_point('lanterne', 0.8, -1.2, 0.3, 60, (1.0, 0.6, 0.28), 0.1, True, 0.2, f1)
    appoint((1.6, -0.6, 3.5), (0, -0.6, 1.7), 40, 0.6, (0.5, 0.6, 0.95))
    yeux = Mn.c2w(fp, (0, 0, 0.42))
    corde_x, corde_y = yeux.x, yeux.y
    corde.location = (corde_x, corde_y, 0)
    cl.location = (corde_x, corde_y, 6.4)
    for f in range(1, f1 + 1, 2):
        ph = f / 24 * 2 * math.pi / 1.7
        tire = 0.5 + 0.5 * math.sin(ph)                  # 0 = bras en haut, 1 = tiré en bas
        yh = 0.28 - 0.32 * tire
        Mn.main(fp, 'G', poignet=(-0.02, yh + 0.07, 0.42), doigts=(0.95, 0.1, 0.2), paume=(0.1, 0, -1), courbe={'tous': 0.72}, ecart=0.0, pouce=(0.6, 0.8))
        Mn.main(fp, 'D', poignet=(0.02, yh - 0.05, 0.42), doigts=(-0.95, 0.1, 0.2), paume=(-0.1, 0, -1), courbe={'tous': 0.72}, ecart=0.0, pouce=(0.6, 0.8))
        Mn.figer(fp, f)
        corde.location.z = -0.32 * tire; corde.keyframe_insert('location', frame=f)
        cl.rotation_euler.x = math.radians(26 * math.sin(ph - 0.6)); cl.keyframe_insert('rotation_euler', frame=f)
    Mn.lisser_cles(fp)
    secouer(fp['cam'], 1, f1, 0.8, 0.45, 9, base=tuple(fp['cam'].rotation_euler))
    dof(fp['cam'], 0.42, 2.4)
    return 1, f1

# ─── chute_3 : la rue, les morts qui tournent tous la tête vers l'église ───
def chute_3(T):
    f1 = frames(7500)
    rnd = random.Random(323)
    nuit_lune(1.0, 0.4, 1.0)
    pave = A.mat_tex('cobblestone_floor_04', 0.6, teinte=lin('#9a9284'))
    boite(0, 40, -0.05, 12, 120, 0.05, pave)
    for sx in (-1, 1):
        for k in range(10):
            mur = A.mat_tex(rnd.choice(['white_stucco', 'old_sandstone_02', 'beige_wall_001']), 0.5, teinte=lin(rnd.choice(['#d8cab0', '#cfc0a2'])))
            boite(sx * 6.5, -10 + k * 9, 0, 1.0, 8.6, rnd.uniform(6, 9), mur)
    clocher(0, 80, 0, 20)
    lumiere_point('torche_eglise', 1.5, 72, 3, 2500, (1.0, 0.55, 0.22), 0.4, True, 0.3, f1)
    lumiere_point('feu_rue', -3, 6, 1.5, 600, (1.0, 0.5, 0.2), 0.4, True, 0.4, f1)
    appoint((0, 0, 30), (0, 40, 0), 800, 30, (0.4, 0.5, 0.85))
    S, M = statues_foule(6, 324)
    H.foule_statique(S, points_bande(rnd, -4.5, 4.5, 4, 60, 120), f1, 0.9, (0, 1), rnd)
    T.camera([(1, (1.2, -6, 1.2), (0, 60, 6)), (f1, (0.6, -4, 1.3), (0, 70, 9))], lens=28)
    return 1, f1

# ─── brume_1 : l'étang la nuit, la brume jaune qui avance sur l'eau ───
def brume_1(T):
    f1 = frames(8000)
    rnd = random.Random(331)
    nuit_lune(1.0, 0.4, 1.2)
    volumes_loin(800)
    N.terrain(1400, 'aerial_grass_rock', '#6a6a58', 0.3, 0.03, 80, z=-0.2)
    N.eau(0, 400, 2000, 800, 0.0, '#1e2a2e')
    collines(rnd, 6, 900, 1400, teinte='#3a3e40', hmax=90, angles=(60, 120))
    roseaux = [A.mat_uni(lin(c_), 0.85) for c_ in ('#2e3220', '#3a3a26', '#48442e', '#262a1c')]
    for k in range(30):   # les touffes de roseaux, surtout sur les côtés (on voit l'étang au milieu)
        cx = rnd.choice([-1, 1]) * rnd.uniform(1.2, 11) if rnd.random() < 0.85 else rnd.uniform(-1.2, 1.2); cy = rnd.uniform(-2.0, 2.5)
        for j in range(rnd.randint(5, 11)):
            h_ = rnd.uniform(0.8, 2.2)
            bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.012, radius2=0.002, depth=h_, location=(cx + rnd.uniform(-0.35, 0.35), cy + rnd.uniform(-0.35, 0.35), h_ / 2))
            r = bpy.context.active_object; r.rotation_euler = (rnd.uniform(-0.2, 0.2), rnd.uniform(-0.2, 0.2), rnd.uniform(0, 6.28)); r.data.materials.append(rnd.choice(roseaux))
            sd = r.modifiers.new('seg', 'SUBSURF'); sd.subdivision_type = 'SIMPLE'; sd.levels = 3; sd.render_levels = 3
            bd = r.modifiers.new('ploie', 'SIMPLE_DEFORM'); bd.deform_method = 'BEND'; bd.deform_axis = 'Y'; bd.angle = rnd.uniform(0.2, 0.8)
    for k in range(11):   # des bancs épars sur l'eau, qui dérivent lentement vers la rive (on voit l'étang noir entre eux)
        yy = rnd.uniform(35, 260); ww = rnd.uniform(40, 120); hh = rnd.uniform(3, 6) + yy * 0.012
        b = nuee(f'banc{k}', rnd.uniform(-0.6, 0.6) * yy * 1.2, yy, 0, ww, hh, '#bcb862', rnd.uniform(0.75, 0.95), 1, f1, monte=0.02, emis=0.09,
                 forme='nappe', graine=k * 3.7, ech=(2.0, 1.0))
        b.keyframe_insert('location', frame=1); b.location.y -= rnd.uniform(6, 14); b.keyframe_insert('location', frame=f1)
    lampe_visible(-220, 900, 260, (0.9, 0.92, 1.0), 9, 6)    # la lune
    T.camera([(1, (0, -6, 1.15), (-30, 300, 9)), (f1, (0, -5, 1.15), (30, 300, 10))], lens=30)
    return 1, f1

# ─── brume_2 : le parc de la Poudrerie, quelqu'un marche dans la brume ───
def brume_2(T):
    f1 = frames(8000)
    rnd = random.Random(332)
    nuit_lune(1.0, 0.4, 0.2)
    volumes_loin(300)
    N.terrain(600, 'forest_ground_05', '#6a6650', 0.2, 0.06, 60)
    allee = boite(0, 30, 0.02, 6, 120, 0.03, A.mat_tex('gravelly_sand', 0.5, teinte=lin('#8a8270')))
    for k in range(10):
        for sx in (-5.5, 5.5): V.platane(sx + rnd.uniform(-0.4, 0.4), -4 + k * 11, rnd.uniform(0.9, 1.1), rnd.uniform(0, 6))
    vol('brume', 0, 30, 0, 60, 120, 6, '#a8a450', 0.09, 0.85, derive=(4, -12), f1=f1, emis=0.02)
    lumiere_point('lune_bas', 20, 60, 30, 9000, (0.6, 0.7, 1.0), 4, True)
    z = H.humain('mort_brume', 'h', 'adulte', poids=0.5, zombie=True, graine=331)
    H.marcher(z, 1, f1, (0.6, 50), (0.2, 34), 'traine')
    T.camera([(1, (-1.0, 8, 1.6), (0.4, 50, 1.4)), (f1, (-0.8, 9.5, 1.6), (0.3, 40, 1.5))], lens=40)
    return 1, f1

# ─── brume_3 : le foulard mouillé contre la bouche, la main sur le tronc ───
def brume_3(T):
    f1 = frames(6500)
    rnd = random.Random(333)
    nuit_lune(1.0, 0.4, 1.3)
    volumes_loin(120)
    N.terrain(300, 'forest_ground_05', '#6a6650', 0.2, 0.06, 40)
    fp = corps_fp(vetements=['mindfront_knitted_sweater_01', 'elvs_jeans_straight_leg'])
    Mn.regard(fp, -14, 14)
    fp['cam'].data.lens = 24
    tronc = A.cylindre(0, 0, 0, 0.36, 9, A.mat_tex('bark_platanus', 1.2), 24)
    tronc.location = Mn.c2w(fp, (-0.62, 0.0, 0.75)); tronc.location.z = 0
    for k in range(14): V.platane(rnd.uniform(-16, 10), -rnd.uniform(5, 45), rnd.uniform(0.9, 1.1))
    vol('brume', 0, -20, 0, 60, 60, 5, '#b8b45a', 0.017, 0.85, derive=(3, 2), f1=f1, emis=0.008)
    lumiere_point('lune_bas', 15, -30, 25, 6000, (0.6, 0.7, 1.0), 4, True)
    appoint((0.5, 0.8, 2.2), (0, -0.4, 1.4), 60, 1.0, (0.65, 0.7, 0.9))
    # le foulard : un chiffon froissé, trempé (sombre, un peu luisant), qui pend de la main droite
    bpy.ops.mesh.primitive_plane_add(size=1)
    tissu = bpy.context.active_object; tissu.scale = (0.15, 0.13, 1)
    sub = tissu.modifiers.new('sub', 'SUBSURF'); sub.levels = 4; sub.render_levels = 4; sub.subdivision_type = 'SIMPLE'
    tx = bpy.data.textures.new('froisse', 'CLOUDS'); tx.noise_scale = 0.06
    d_ = tissu.modifiers.new('froisse', 'DISPLACE'); d_.texture = tx; d_.strength = 0.03
    tissu.modifiers.new('lisse', 'SUBSURF').levels = 1
    mt = A.mat_tex('rough_linen', 3.0, teinte=lin('#3a464e'))
    pr_ = next((n for n in mt.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if pr_: pr_.inputs['Roughness'].default_value = 0.45
    tissu.data.materials.append(mt)
    bpy.context.view_layer.update()
    cam = fp['cam']
    for f in range(1, f1 + 1, 2):
        t = f / f1
        porte = max(0.0, min(1.0, (t - 0.22) / 0.18)); porte = porte * porte * (3 - 2 * porte)   # on le porte au visage
        tousse = max(0, math.sin(f / 24 * 7)) * (1 if 0.42 < t < 0.7 else 0.2) * porte
        Mn.main(fp, 'G', poignet=(-0.27, -0.06, 0.42), doigts=(-0.3, 0.9, 0.35), paume=(-0.9, 0, 0.3), courbe={'tous': 0.3}, ecart=0.35, pouce=(0.2, 0.3))
        pg = Vector((0.11, -0.17, 0.37)).lerp(Vector((0.03, -0.2, 0.13)), porte)
        Mn.main(fp, 'D', poignet=tuple(pg + Vector((0, -0.015 * tousse, 0))), doigts=(-0.3, 0.9, 0.25), paume=(-0.3, 0.15, -0.95), courbe={'tous': 0.6}, ecart=0.05, pouce=(0.45, 0.55))
        Mn.figer(fp, f)
        pt = Vector((0.075, -0.105, 0.37)).lerp(Vector((0.0, -0.108, 0.13)), porte) + Vector((0, -0.012 * tousse, 0))
        tissu.location = Mn.c2w(fp, tuple(pt))
        tissu.rotation_euler = (cam.matrix_world.to_3x3() @ Matrix.Rotation(math.radians(-15 - 25 * porte), 3, 'X')).to_euler()
        tissu.keyframe_insert('location', frame=f); tissu.keyframe_insert('rotation_euler', frame=f)
    Mn.lisser_cles(fp)
    secouer(fp['cam'], 1, f1, 0.9, 0.6, 11, base=tuple(fp['cam'].rotation_euler))
    dof(fp['cam'], 0.4, 3.2)
    return 1, f1

# ─── cornillon_1 / fin_seul_1 : la mer de brume jaune vue du belvédère ───
def belvedere(T, aube=True, pale=False, f1=None):
    rnd = random.Random(341)
    if aube: soleil_ciel(0.6, 4, 100, 2.4, (1.0, 0.65, 0.45), 2, poussiere=2.5, az_ciel=100)
    else: soleil_ciel(0.45, 3, 255, 1.8, (1.0, 0.55, 0.35), 2, poussiere=2.5, az_ciel=255)
    N.terrain(6000, 'aerial_grass_rock', '#8a8670', 0.6, 0.002, 120, z=-150)
    N.eau(-300, 3600, 6000, 2400, -148, '#6a8a9a')                                         # l'étang de Berre, au loin
    # les clochers, les pylônes et la cheminée de l'usine dépassent de la nappe (dessus vers −132)
    for (x, y) in ((-260, 420), (190, 560), (-60, 820), (430, 960), (-540, 1150), (760, 1400)): clocher(x, y, -150, 30)
    for k in range(8):
        py = pylone(-1100 + k * 300, 700 + (k % 2) * 260, 62, 0.25)
        py.location.z += -150
    A.cylindre(700, 1700, -150, 7, 185, A.mat_uni(lin('#a8a49c'), 0.6), 24)
    lampe_visible(700, 1700, 37, (1.0, 0.55, 0.25), 1.6, 25)
    lumiere_point('torchere', 700, 1700, 40, 4e5, (1.0, 0.5, 0.2), 6, False)
    a = 0.6 if pale else 0.95
    # le fond de la mer de brume : une nappe pleine (sinon on voit le sol sombre par les trous des nappes du dessus)
    fond = boite(0, 0, -143.5, 9000, 9000, 0.1, A.mat_uni(lin('#d2ca88' if aube else '#bcb882'), 1.0, emission=(*lin('#d2ca88' if aube else '#bcb882'), 0.35)))
    for k, z in enumerate((-142, -138, -135, -132)):
        nappe(z, 9000, '#dcd48c' if aube else '#c8c48a', a * (0.95 - k * 0.2), 0.006 + k * 0.004, f'nappe{k}', k * 3.1, 0.6, f1 or 240)
    # la brume s'épaissit au loin et se fond dans le ciel (pas de ligne d'horizon nette, pas d'étang bleu au-dessus de la brume)
    for k, (yy, aa) in enumerate(((1300, 0.45), (2600, 0.9))):
        nuee(f'voile{k}', 0, yy, -150, 12000, 330, '#e2d9a8' if aube else '#c9c2a4', aa, 1, f1 or 240, monte=0.01,
             emis=0.55 if aube else 0.35, forme='nappe', graine=k * 1.9, ech=(1.2, 1.0))
    pierre = mat_pierre('#cfc2a4', 0.5, 'old_stone_wall')
    boite(0, 1.6, 0, 20, 0.6, 0.95, pierre)
    boite(0, 0, -1, 30, 6, 1, A.mat_tex('cobblestone_floor_04', 0.6))

def cornillon_1(T):
    f1 = frames(9500)
    belvedere(T, True, False, f1)
    T.camera([(1, (-2, -0.8, 1.75), (-420, 1500, -125)), (f1, (2, -0.6, 1.75), (380, 1500, -122))], lens=32)
    return 1, f1

def fin_seul_1(T):
    f1 = frames(9000)
    belvedere(T, False, True, f1)
    T.camera([(1, (2, -0.8, 1.75), (380, 1500, -122)), (f1, (-2, -0.6, 1.75), (-420, 1500, -125))], lens=32)
    return 1, f1

def carte_routiere_tex():
    """La carte Michelin, dessinée : routes, la Durance, l'étang, les villages (PIL → image)."""
    os.makedirs(SCRATCH, exist_ok=True)
    chemin = os.path.join(SCRATCH, 'carte_routiere.png')
    if os.path.exists(chemin): return chemin
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        raise RuntimeError('carte_routiere.png manquante : lancer python tools/blender/cine/carte_routiere.py')
    W, Hh = 2048, 1400
    im = Image.new('RGB', (W, Hh), (238, 232, 214)); d = ImageDraw.Draw(im)
    rnd = random.Random(7)
    for k in range(70): d.ellipse([rnd.randint(0, W), rnd.randint(0, Hh), rnd.randint(0, W), rnd.randint(0, Hh)], outline=(226, 222, 200))
    d.polygon([(0, 1100), (520, 1000), (760, 1180), (980, 1400), (0, 1400)], fill=(170, 200, 214))             # l'étang
    d.line([(0, 140), (500, 210), (900, 160), (1400, 230), (2048, 120)], fill=(120, 160, 200), width=26)     # la Durance
    try: f = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', 34); fs = ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf', 28)
    except Exception: f = fs = None
    routes = [[(300, 1000), (700, 700), (1100, 520), (1500, 300), (1700, 180)], [(100, 700), (700, 700), (1300, 760), (2000, 820)],
              [(1100, 520), (1150, 900), (1250, 1300)], [(700, 700), (600, 400), (520, 180)]]
    for r in routes: d.line(r, fill=(200, 60, 40), width=14); d.line(r, fill=(250, 200, 70), width=6)
    for nom, (x, y) in {'SALON-DE-PROVENCE': (1080, 480), 'Mallemort': (1480, 250), 'Cornillon-Confoux': (720, 960), 'Miramas': (300, 780),
                        'Saint-Chamas': (520, 1060), 'Grans': (900, 730), 'Lançon': (1380, 900), 'Pélissanne': (1500, 600), 'Lamanon': (900, 300),
                        'La Durance': (1650, 110), 'Étang de Berre': (180, 1250)}.items():
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(40, 40, 40))
        d.text((x + 14, y - 18), nom, fill=(30, 30, 40), font=f if nom.isupper() else fs)
    for x in range(0, W, 256): d.line([(x, 0), (x, Hh)], fill=(200, 196, 180), width=2)
    im.save(chemin)
    return chemin

def cornillon_2(T):
    f1 = frames(8000)
    soleil_ciel(0.6, 5, 100, 2.4, (1.0, 0.68, 0.48), 2, poussiere=2.5)
    belvedere_court = True
    fp = corps_fp(vetements=['mindfront_knitted_sweater_01', 'elvs_jeans_straight_leg'])
    Mn.regard(fp, -62, 0); fp['cam'].data.lens = 24
    rig = fp['rig']
    haut = Mn.c2w(fp, (0, -0.02, 0.5)).z
    pierre = mat_pierre('#cfc2a4', 0.5, 'old_stone_wall')
    boite(0, -0.55, 0, 3.0, 1.2, haut - 0.003, pierre)
    N.terrain(5000, 'aerial_grass_rock', '#8a8670', 0.6, 0.002, 80, z=-150)
    nappe(-120, 9000, '#dcd69a', 0.9, 0.0022, 'nappe', 1.0, 0.2, f1)
    img = bpy.data.images.load(carte_routiere_tex(), check_existing=True)
    m = bpy.data.materials.new('carte'); m.use_nodes = True; nt = m.node_tree; p = nt.nodes.get('Principled BSDF')
    ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = img; nt.links.new(ti.outputs['Color'], p.inputs['Base Color']); p.inputs['Roughness'].default_value = 0.7
    centre = Mn.c2w(fp, (0, 0.0, 0.5))
    bpy.ops.mesh.primitive_plane_add(size=1, location=(centre.x, centre.y, haut + 0.002))
    carte = bpy.context.active_object; carte.scale = (0.62, 0.42, 1); carte.data.materials.append(m)
    carte.rotation_euler.z = math.radians(180)
    carte.keyframe_insert('scale', frame=1); carte.scale = (0.2, 0.42, 1); carte.keyframe_insert('scale', frame=1)
    carte.scale = (0.62, 0.42, 1); carte.keyframe_insert('scale', frame=40)
    for f in range(1, f1 + 1, 2):
        t = f / f1
        ouvre = min(1, t / 0.2)
        suit = max(0, min(1, (t - 0.35) / 0.5))
        # les paumes à plat sur la carte (regard baissé de 62° : « vers le bas » vaut (0, −0,47, 0,88) dans le repère caméra)
        Mn.main(fp, 'G', poignet=(-0.06 - 0.12 * ouvre, -0.06, 0.42), doigts=(0.1, 0.85, 0.5), paume=(0, -0.47, 0.88), courbe={'tous': 0.12}, ecart=0.3, pouce=(0.1, 0.2))
        ix = 0.03 + 0.08 * suit; iy = -0.07 + 0.08 * suit
        Mn.main(fp, 'D', poignet=(ix + 0.04 * (1 - ouvre) + 0.05, iy, 0.4), doigts=(-0.2, 0.85, 0.5), paume=(0, -0.47, 0.88),
                courbe={'tous': 0.85, 'index': 0.05}, ecart=0.0, pouce=(0.6, 0.6))
        Mn.figer(fp, f)
    Mn.lisser_cles(fp)
    dof(fp['cam'], 0.5, 3.2)
    return 1, f1

# ─── pont_1 : la Durance à l'aube, le pont suspendu, les projecteurs ───
def pont_1(T, eteints=True):
    f1 = frames(8000)
    rnd = random.Random(351)
    soleil_ciel(0.5, 3, 85, 2.0, (1.0, 0.62, 0.45), 2, poussiere=3.0)
    volumes_loin(500)
    N.terrain(1500, 'aerial_grass_rock', '#b8b08a', 0.5, 0.03, 120, z=0)
    collines(rnd, 9, 600, 1300)
    eau = N.eau(0, 0, 1500, 120, z=0.1, coul='#2e3e3a')
    for s_ in eau.material_slots:
        pr = s_.material.node_tree.nodes.get('Principled BSDF'); pr.inputs['Roughness'].default_value = 0.55
    bpy.context.scene.view_settings.exposure = -0.45
    halo(6.0, 0.18)
    for k in range(40): N.cypres(rnd.uniform(-200, 200), rnd.choice([-70, 75]) + rnd.uniform(-8, 8), rnd)
    N.pont_suspendu(-110, 110, 0, 9, rnd)
    for k in range(4):
        ld = bpy.data.lights.new('projecteur', 'SPOT'); ld.spot_size = 0.3; ld.color = (0.9, 0.95, 1.0)
        l = bpy.data.objects.new('projecteur', ld); l.location = (130, -30 + k * 20, 16); bpy.context.scene.collection.objects.link(l)
        l.rotation_euler = (math.radians(82), 0, math.radians(90))
        for f, e in ((1, 3e6), (60 + k * 25, 3e6), (66 + k * 25, 0)): ld.energy = e if eteints else 3e6; ld.keyframe_insert('energy', frame=f)
    vol('brume_eau', 0, 0, 0, 900, 110, 4, '#c8c4bc', 0.012, 0.8, derive=(30, 0), f1=f1)
    T.camera([(1, (-175, 80, 6), (-60, 0, 10)), (f1, (-165, 68, 6), (20, 0, 11))], lens=32)
    return 1, f1

# ─── pont_2 / fin_pont_1 : le camp de la rive sud ───
def camp_rive(T, n):
    f1 = frames(8000)
    rnd = random.Random(352 + n)
    soleil_ciel(0.5, 4, 85, 2.0, (1.0, 0.64, 0.46), 2, poussiere=3.0)
    N.terrain(1500, 'aerial_grass_rock', '#b0a888', 0.4, 0.03, 100)
    N.eau(0, 90, 1500, 70, z=0.05, coul='#4a6058')
    N.pont_suspendu(-60, 160, 90, 9, rnd)
    M = foule_modeles(8, 353)
    couv = [A.mat_tex(t, 1.2, teinte=lin(c)) for t, c in (('fabric_pattern_05', '#8a7a6a'), ('rough_linen', '#6a7a8a'), ('hessian_230', '#8a7a5a'))]
    bpy.context.scene.view_settings.exposure = -0.7
    halo(8.0, 0.15)
    for k in range(110):
        x, y = rnd.uniform(-34, 34), rnd.uniform(-18, 40)
        r = H.doubler(M[k % len(M)], f'refugie{k}'); r.location = (x, y, 0); H.orienter(r, rnd.uniform(2.6, 3.6))
        if n == 0 and k < 24:
            debout_a = rnd.randint(20, int(f1 * 0.7))
            for f in range(1, f1 + 1, 6):
                t = max(0, min(1, (f - debout_a) / 40))
                H.poser(r, 'assis' if t < 0.5 else 'debout'); H.figer(r, f)
        else:
            H.poser(r, rnd.choice(['debout', 'debout', 'assis'])); H.figer(r, 1)
        if rnd.random() < 0.5:
            boite(x + rnd.uniform(-1, 1), y + rnd.uniform(-1, 1), 0.01, 1.6, 2.0, 0.03, rnd.choice(couv)).rotation_euler.z = rnd.uniform(0, 3)
    for k in range(8): V.voiture_rue(rnd.uniform(-60, 60), rnd.uniform(-40, -15), rnd.uniform(0, 6), rnd.choice(['#5a1e1e', '#1e2e4a', '#b8b4a8', '#8a8a86']), rnd)
    for k in range(6): N.tente_camp(rnd.uniform(-50, 50), rnd.uniform(0, 50), rnd.uniform(0, 3), rnd)
    cams = [[(1, (-22, -30, 2.2), (0, 20, 1.6)), (f1, (-14, -31, 2.3), (8, 22, 1.7))],
            [(1, (-58, 90, 10.6), (160, 90, 10)), (f1, (-40, 90, 10.6), (160, 90, 10))]][n]
    if n == 1:   # le bout du pont : sacs de sable, soldats, la tente blanche
        for k in range(8): boite(150 + k * 0.1, 84 + k * 1.6, 9.4, 1.2, 1.4, 0.6, A.mat_tex('hessian_380', 0.6, teinte=lin('#9a8a6a')))
        S2 = foule_modeles(3, 357)
        for k in range(4):
            r = H.doubler(S2[k % 3], f'soldat{k}'); r.location = (152 + k * 1.5, 88 + k * 1.2, 9.4); H.orienter(r, math.pi / 2); H.poser(r, 'debout'); H.figer(r, 1)
    T.camera(cams, lens=[28, 30][n])
    return 1, f1

# ─── pont_3 : la main gantée qui tend la liste ───
def pont_3(T):
    f1 = frames(7000)
    rnd = random.Random(355)
    soleil_ciel(0.5, 5, 85, 2.0, (1.0, 0.66, 0.48), 2, poussiere=3.0)
    boite(0, -2, -0.02, 20, 30, 0.04, A.mat_tex('weathered_planks', 0.6))
    fp = corps_fp()
    Mn.regard(fp, -26, 0); fp['cam'].data.lens = 24
    sol = H.humain('soldat', 'f', 'adulte', poids=0.45, muscle=0.6, vetements=['male_worksuit01'], cheveux='ponytail01', graine=61)
    sol.location = (0.25, -1.7, 0); H.orienter(sol, math.pi)
    H.poser(sol, 'debout')
    for o in H.membres(sol):
        if 'worksuit' in o.name:
            for s_ in o.material_slots:
                if s_.material: s_.material = A.mat_tex('rough_linen', 1.5, teinte=lin('#5a6248'))
    feuille = boite(0, 0, 0, 0.21, 0.297, 0.0008, papier('liste', '#f2efe6', 0.15))
    t = texte('REFUGE DE MIRAMAS-LE-VIEUX — 14\n\nGARCIN Hélène\nABRIEU Fernand\nBELKACEM Inès\nMOREAU Bastien\nOLLIVIER Karine\nOLLIVIER Noa\nCHABERT Rudy\n…', 0, 0, 0, 0.011, encre('#20202a'), parent=feuille)
    t.location = (-0.09, 0.12, 0.0006); t.rotation_euler = (0, 0, 0)
    spot('jour', (3, -6, 4), (0, -0.6, 1.3), 300, 40, (1.0, 0.85, 0.7), 0.8, 1.0)
    appoint((0.4, 0.5, 1.9), (0, -0.4, 1.3), 30, 1.0, (1.0, 0.92, 0.82))
    bpy.context.view_layer.update()
    cam = fp['cam']
    for f in range(1, f1 + 1, 2):
        t_ = f / f1; leve = max(0.0, min(1.0, (t_ - 0.15) / 0.35)); leve = leve * leve * (3 - 2 * leve)
        # la feuille face à toi, le haut un peu penché en arrière ; on la lève du bas du cadre jusqu'à hauteur de lecture
        yc, zc, tilt = -0.17 + 0.15 * leve, 0.46 - 0.02 * leve, math.radians(-30 + 10 * leve)
        R = cam.matrix_world.to_3x3() @ Matrix.Rotation(tilt, 3, 'X')
        feuille.location = Mn.c2w(fp, (0.0, yc, zc)); feuille.rotation_euler = R.to_euler()
        feuille.keyframe_insert('location', frame=f); feuille.keyframe_insert('rotation_euler', frame=f)
        # tenue par les bords, un peu sous le milieu : les pouces devant, les doigts derrière la feuille
        gy = yc - 0.05 * math.cos(tilt); gz = zc + 0.05 * math.sin(tilt)
        for c_, sx in (('G', -1), ('D', 1)):
            Mn.main(fp, c_, poignet=(sx * 0.17, gy - 0.09, gz - 0.005), doigts=(-sx * 0.45, 0.78, 0.45), paume=(-sx * 0.35, 0.05, -0.95),
                    courbe={'tous': 0.06}, ecart=0.06, pouce=(0.35, 0.85))
        Mn.figer(fp, f)
    Mn.lisser_cles(fp)
    dof(fp['cam'], 0.45, 3.2)
    return 1, f1

# ─── fin_place_1 : du bord sud, une silhouette seule sur le pont ───
def fin_place_1(T):
    f1 = frames(8500)
    rnd = random.Random(361)
    soleil_ciel(0.5, 6, 25, 2.1, (1.0, 0.68, 0.5), 2, poussiere=3.0)
    N.terrain(1500, 'aerial_grass_rock', '#b8b08a', 0.5, 0.03, 120, z=0)
    eau = N.eau(0, 0, 1500, 120, z=0.1, coul='#3a5048')
    for s_ in eau.material_slots:
        pr = s_.material.node_tree.nodes.get('Principled BSDF'); pr.inputs['Roughness'].default_value = 0.5
    halo(6.0, 0.18)
    N.pont_suspendu(-110, 110, 0, 9, rnd)
    h = H.humain('helene', 'f', 'vieux', poids=0.45, muscle=0.4, vetements=['janexx_old_female_sweater', 'mindfront_female_trousers_1'], cheveux='bob02', graine=88)
    H.marcher(h, 1, f1, (-80, 0.3), (-62, 0.3), 'marche')
    h.location.z = 9.4
    ad = h.animation_data
    if ad and ad.action:
        for fc in Mn.fcourbes(ad.action):
            if fc.data_path == 'location' and fc.array_index == 2:
                for k in fc.keyframe_points: k.co.y += 9.4; k.handle_left.y += 9.4; k.handle_right.y += 9.4
    bpy.context.scene.view_settings.exposure = -0.35
    T.camera([(1, (-50, -82, 7.8), (-79, 0.3, 11.6)), (f1, (-49.5, -82, 7.8), (-63, 0.3, 11.6))], lens=120)
    return 1, f1

# ─── mains_feu : les mains au-dessus d'un petit feu, le soir ───
def mains_feu(T):
    f1 = frames(8000)
    T.monde_uni((0.015, 0.018, 0.03), 1.0)
    bpy.context.scene.view_settings.exposure = 0.55
    N.terrain(200, 'dirt', '#6a5a48', 0.2, 0.3, 40)
    fp = corps_fp()
    rig = fp['rig']; rig.location.z = -0.75                 # accroupi
    Mn.regard(fp, -50, 0); fp['cam'].data.lens = 24
    centre = Mn.c2w(fp, (0, -0.05, 0.9)); centre.z = 0
    try:
        f = V.modele('stone_fire_pit', centre.x, centre.y, 0, 0.8)
    except Exception: pass
    sc_ = bpy.context.scene
    for k_, v_ in (('use_volume_custom_range', True), ('volumetric_start', 0.05), ('volumetric_end', 6.0), ('volumetric_tile_size', '2'), ('volumetric_samples', 128)):
        try: setattr(sc_.eevee, k_, v_)
        except Exception: pass
    feu_volume(centre.x, centre.y, 0.04, 0.36, 0.55, f1)
    bois = A.mat_tex('bark_brown_01', 2.0, teinte=lin('#3a2a1e'))
    for k in range(5):   # les bûchettes, en tipi
        b_ = A.cylindre(0, 0, 0, 0.014, 0.26, bois, 8); a_ = k * 2 * math.pi / 5
        b_.location = (centre.x + math.cos(a_) * 0.07, centre.y + math.sin(a_) * 0.07, 0.03)
        b_.rotation_euler = (math.radians(55) * math.sin(a_), -math.radians(55) * math.cos(a_), 0)
    lumiere_point('feu', centre.x, centre.y, 0.55, 55, (1.0, 0.5, 0.18), 0.2, True, 0.35, f1)
    appoint((centre.x + 1.5, centre.y + 1.5, 2.0), (centre.x, centre.y, 0.3), 6, 2.0, (0.5, 0.58, 0.85))
    for f in range(1, f1 + 1, 3):
        b = 0.01 * math.sin(f / 24 * 1.3)
        Mn.main(fp, 'G', poignet=(-0.14, -0.07 + b, 0.42), doigts=(0.25, 0.4, 1), paume=(0, -0.7, 0.7), courbe={'tous': 0.2}, ecart=0.3, pouce=(0.1, 0.2))
        Mn.main(fp, 'D', poignet=(0.14, -0.07 - b, 0.42), doigts=(-0.25, 0.4, 1), paume=(0, -0.7, 0.7), courbe={'tous': 0.2}, ecart=0.3, pouce=(0.1, 0.2))
        Mn.figer(fp, f)
    Mn.lisser_cles(fp)
    dof(fp['cam'], 0.45, 3.5)
    return 1, f1

def noir(T):
    T.monde_uni((0, 0, 0), 0.0)
    T.camera([(1, (0, 0, 0), (0, 1, 0))], lens=35)
    return 1, frames(4000)

import plans2 as P2
PLANS.update({
    'intro_1': intro_1, 'intro_2': intro_2, 'intro_3': intro_3, 'intro_4': intro_4, 'intro_5': intro_5, 'intro_6': noir,
    'frappe_1': frappe_1, 'frappe_2': frappe_2, 'frappe_3': frappe_3,
    'chute_1': chute_1, 'chute_2': chute_2, 'chute_3': chute_3,
    'brume_1': brume_1, 'brume_2': brume_2, 'brume_3': brume_3,
    'cornillon_1': cornillon_1, 'cornillon_2': cornillon_2,
    'pont_1': pont_1, 'pont_2': lambda T: camp_rive(T, 0), 'pont_3': pont_3,
    'fin_pont_1': lambda T: camp_rive(T, 1), 'fin_pont_2': lambda T: P2.camp(T, 0),
    'fin_place_1': fin_place_1, 'fin_place_2': mains_feu, 'fin_seul_1': fin_seul_1, 'fin_seul_2': mains_feu,
})
