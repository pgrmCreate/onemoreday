# ============ One More Day — PAYSAGES et LIEUX hors de la ville (cinématiques des chapitres 1 à 3 et des fins) ============
# Terrain (Crau, garrigue, plaine), oliviers, cyprès, rochers, falaises de Calès et leurs grottes, la Durance et le pont
# suspendu de Mallemort, un front de feu, la base aérienne 701, le gymnase réfrigéré, un camp de tentes, le Ventoux,
# les ruines de Vieux-Vernègues, la statue de Jean Moulin. Tout est construit en code (matières Poly Haven, CC0).
import bpy, math, random
from mathutils import Vector
import omd_assets as A
from omd_assets import cylindre, sphere, mat_tex, mat_uni, coussin
import omd_ville as V
lin = V.lin
boite = V.boite
joindre = V.joindre

# ---------------------------------------------------------------- sol
def terrain(taille=1200, tex='aerial_grass_rock', teinte='#d8cfa8', relief=1.5, ech=0.03, sub=180, nom='terrain', z=0.0):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=sub, y_subdivisions=sub, size=taille, location=(0, 0, z))
    t = bpy.context.active_object; t.name = nom
    t.data.materials.append(mat_tex(tex, ech, teinte=lin(teinte)))
    if relief:
        tx = bpy.data.textures.new(nom + '_relief', 'CLOUDS'); tx.noise_scale = 0.35
        d = t.modifiers.new('relief', 'DISPLACE'); d.texture = tx; d.strength = relief; d.mid_level = 0.5
    bpy.ops.object.shade_smooth()
    return t

def collines(rnd, n=9, dmin=600, dmax=1300, teinte='#b8b8a0', hmax=160, angles=(0, 360)):
    roc = mat_tex('aerial_grass_rock', 0.004, teinte=lin(teinte))
    o = []
    for k in range(n):
        a = math.radians(rnd.uniform(*angles)); d = rnd.uniform(dmin, dmax)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=1, subdivisions=4, location=(math.cos(a) * d, math.sin(a) * d, -30))
        c = bpy.context.active_object; c.scale = (rnd.uniform(250, 500), rnd.uniform(150, 260), rnd.uniform(60, hmax)); c.data.materials.append(roc)
        dm = c.modifiers.new('relief', 'DISPLACE'); tx = bpy.data.textures.get('colline') or bpy.data.textures.new('colline', 'CLOUDS'); tx.noise_scale = 0.4; dm.texture = tx; dm.strength = 0.15
        o.append(c)
    return o

# ---------------------------------------------------------------- arbres en cartes de feuillage
_gabarits = {}
def gabarit_arbre(nom, rayon, h_centre, h_demi, n_cartes, taille, teinte, tronc_h, tronc_r, ecorce='bark_willow', branches=3, rnd_graine=3, tronc_tors=0.0):
    if nom in _gabarits and _gabarits[nom].name in bpy.data.objects: return _gabarits[nom]
    rnd = random.Random(rnd_graine)
    ec = mat_tex(ecorce, 1.5)
    parts = []
    bpy.ops.mesh.primitive_cone_add(vertices=14, radius1=tronc_r, radius2=tronc_r * 0.6, depth=tronc_h, location=(0, 0, tronc_h / 2))
    t = bpy.context.active_object; t.data.materials.append(ec)
    if tronc_tors:
        sw = t.modifiers.new('tors', 'SIMPLE_DEFORM'); sw.deform_method = 'TWIST'; sw.angle = tronc_tors
    parts.append(t)
    for k in range(branches):
        a = k * 2 * math.pi / branches + rnd.uniform(-0.3, 0.3)
        bout = Vector((math.cos(a) * rayon * 0.6, math.sin(a) * rayon * 0.6, h_centre + rnd.uniform(-0.3, 0.6) * h_demi)); base = Vector((0, 0, tronc_h * 0.85))
        d = bout - base
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=tronc_r * 0.5, radius2=tronc_r * 0.15, depth=d.length, location=(base + bout) / 2)
        b = bpy.context.active_object; b.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); b.data.materials.append(ec); parts.append(b)
    mats = [V.mat_feuillage(n, teinte) for n in ('touffe_a_dessus', 'touffe_a_face', 'touffe_b_face', 'touffe_b_cote')]
    for k in range(n_cartes):
        while True:
            u = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1)))
            if 0.3 < u.length <= 1: break
        pos = Vector((u.x * rayon, u.y * rayon, h_centre + u.z * h_demi))
        bpy.ops.mesh.primitive_plane_add(size=taille * rnd.uniform(0.75, 1.25), location=pos)
        c = bpy.context.active_object; c.rotation_euler = (rnd.uniform(0.6, 2.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0, 6.28))
        c.data.materials.append(mats[k % 4]); parts.append(c)
    o = joindre(parts, 'gabarit_' + nom); o.hide_render = True; o.hide_viewport = True; o.location = (0, 0, -2000)
    _gabarits[nom] = o
    return o

def poser(gab, x, y, ech=1.0, rot=None, rnd=None, z=0.0):
    o = gab.copy(); o.data = gab.data; o.hide_render = False; o.hide_viewport = False
    o.location = (x, y, z); s = ech * (rnd.uniform(0.85, 1.15) if rnd else 1); o.scale = (s, s, s)
    o.rotation_euler.z = rot if rot is not None else (rnd.random() * 6.28 if rnd else 0)
    bpy.context.scene.collection.objects.link(o)
    return o

def olivier(x, y, rnd, ech=1.0):
    g = gabarit_arbre('olivier', 2.3, 3.4, 1.4, 70, 1.8, (0.48, 0.55, 0.42), 2.2, 0.28, 'bark_willow_02', 4, 11, tronc_tors=0.6)
    return poser(g, x, y, ech, rnd=rnd)
def cypres(x, y, rnd, ech=1.0):
    g = gabarit_arbre('cypres', 0.9, 5.5, 4.8, 80, 1.4, (0.16, 0.25, 0.13), 1.2, 0.2, 'bark_brown_01', 0, 13)
    return poser(g, x, y, ech, rnd=rnd)
def pin(x, y, rnd, ech=1.0):
    g = gabarit_arbre('pin', 4.5, 9.0, 1.6, 90, 2.2, (0.3, 0.42, 0.24), 8.0, 0.32, 'pine_bark', 3, 17)
    return poser(g, x, y, ech, rnd=rnd)

def oliveraie(x0, y0, nx, ny, pas, rnd):
    for i in range(nx):
        for j in range(ny):
            if rnd.random() < 0.9: olivier(x0 + i * pas + rnd.uniform(-0.6, 0.6), y0 + j * pas + rnd.uniform(-0.6, 0.6), rnd)

def rocher(x, y, ech, rnd, pid=None):
    pid = pid or rnd.choice(['namaqualand_boulder_02', 'namaqualand_boulder_03', 'namaqualand_boulder_04', 'namaqualand_boulder_05'])
    o = V.modele(pid, x, y, rnd.random() * 6.28, ech)
    return o

def galets(rnd, zone, n=400):
    """La Crau : un sol de galets ronds."""
    m = mat_tex('gravel_stones', 0.6, teinte=lin('#d0c8b8'))
    o = []
    for k in range(n):
        x, y = rnd.uniform(zone[0], zone[2]), rnd.uniform(zone[1], zone[3])
        s = sphere(x, y, 0.02, rnd.uniform(0.06, 0.18), m, 0.55); o.append(s)
    return joindre(o, 'galets')

# ---------------------------------------------------------------- eau, falaises, pont
def eau(x, y, sx, sy, z=0.0, coul='#3a5a52'):
    m = bpy.data.materials.new('eau'); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value = (*lin(coul), 1); p.inputs['Roughness'].default_value = 0.12; p.inputs['Specular IOR Level'].default_value = 0.3
    nt = m.node_tree; tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.6
    bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.25
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector']); nt.links.new(nz.outputs['Fac'], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], p.inputs['Normal'])
    return boite(x, y, z - 0.05, sx, sy, 0.05, m, 0)

def falaise(x, y, longueur, hauteur, epaisseur, rnd, grottes=0, feux=0):
    """Falaise de calcaire (Calès) percée de grottes ; quelques feux y brûlent."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, hauteur / 2))
    f = bpy.context.active_object; f.scale = (longueur, epaisseur, hauteur)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sub = f.modifiers.new('sub', 'SUBSURF'); sub.levels = 4; sub.render_levels = 4; sub.subdivision_type = 'SIMPLE'
    tx = bpy.data.textures.new('roche', 'VORONOI'); tx.noise_scale = 3.0
    d = f.modifiers.new('roche', 'DISPLACE'); d.texture = tx; d.strength = 2.2
    f.data.materials.append(mat_tex('sandstone_cracks', 0.12, teinte=lin('#efe6d2')))
    o = [f]
    noir = mat_uni((0.01, 0.009, 0.008), 0.9)
    for k in range(grottes):
        gx = x + rnd.uniform(-longueur / 2 + 3, longueur / 2 - 3); gz = rnd.uniform(2, hauteur - 4)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=10, location=(gx, y - epaisseur / 2 - 0.2, gz))
        g = bpy.context.active_object; g.scale = (rnd.uniform(0.9, 2.0), 1.6, rnd.uniform(0.8, 1.5)); g.data.materials.append(noir); o.append(g)
        if k < feux:
            ld = bpy.data.lights.new('feu_grotte', 'POINT'); ld.energy = 900; ld.color = (1.0, 0.5, 0.18); ld.shadow_soft_size = 0.4
            l = bpy.data.objects.new('feu_grotte', ld); l.location = (gx, y - epaisseur / 2 - 1.4, gz + 0.4); bpy.context.scene.collection.objects.link(l)
            for fr in range(1, 400, 3): ld.energy = 900 * (0.75 + 0.25 * math.sin(fr * 0.9 + k) * math.sin(fr * 0.31 + k * 2)); ld.keyframe_insert('energy', frame=fr)
    return o

def pont_suspendu(x0, x1, y, z, rnd):
    """Le pont suspendu de Mallemort (1847) : deux piles de pierre en arc, tablier de planches, câbles et suspentes."""
    pierre = mat_tex('white_sandstone_blocks_02', 0.4)
    fer = mat_uni(lin('#2a2c2e'), 0.45, 0.8)
    o = []
    for px in (x0, x1):
        o.append(boite(px - 3.2, y, 0, 2.2, 8, z + 16, pierre, 0)); o.append(boite(px + 3.2, y, 0, 2.2, 8, z + 16, pierre, 0))
        o.append(boite(px, y, z + 12, 8.6, 8, 4, pierre, 0))
    L = x1 - x0
    o.append(boite((x0 + x1) / 2, y, z, L, 7, 0.4, mat_tex('weathered_planks', 0.6), 0))
    for sy in (-3.4, 3.4):
        o.append(boite((x0 + x1) / 2, y + sy, z + 0.4, L, 0.08, 1.1, fer, 0))   # garde-corps
        prev = None
        for k in range(61):
            t = k / 60; xx = x0 + L * t; zz = z + 15 - 13.5 * (1 - (2 * t - 1) ** 2)
            if prev:
                a = Vector(prev); b = Vector((xx, y + sy, zz)); d = b - a
                c = cylindre(0, 0, 0, 0.08, d.length, fer, 8); c.location = (a + b) / 2; c.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.append(c)
            if k % 2 == 0 and 0 < k < 60: o.append(cylindre(xx, y + sy, z + 0.4, 0.02, zz - z - 0.4, fer, 6))
            prev = (xx, y + sy, zz)
    return o

# ---------------------------------------------------------------- le feu
def mat_flamme():
    """Nappe de flammes : bruit qui monte, plus dense et plus chaud en bas, transparent en haut (coordonnées du plan : Y = hauteur)."""
    m = bpy.data.materials.get('flamme')
    if m: return m
    m = bpy.data.materials.new('flamme'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (3.0, 1.2, 1.0)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 8; nz.inputs['Roughness'].default_value = 0.6
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    haut = nt.nodes.new('ShaderNodeMath'); haut.operation = 'SUBTRACT'; haut.inputs[0].default_value = 1.0          # 1 en bas, 0 en haut
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'MULTIPLY_ADD'; pw.inputs[1].default_value = 1.7; pw.inputs[2].default_value = -0.35
    rp = nt.nodes.new('ShaderNodeValToRGB')
    el = rp.color_ramp.elements; el[0].position = 0.0; el[0].color = (0, 0, 0, 0)
    e = el.new(0.2); e.color = (0.6, 0.06, 0.0, 0.6)
    e = el.new(0.45); e.color = (1.0, 0.32, 0.03, 0.95)
    el[-1].position = 0.85; el[-1].color = (1.0, 0.8, 0.4, 1.0)
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); nt.links.new(mp.outputs[0], nz.inputs['Vector'])
    nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Y'], haut.inputs[1])
    nt.links.new(nz.outputs['Fac'], mul.inputs[0]); nt.links.new(haut.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], pw.inputs[0]); nt.links.new(pw.outputs[0], rp.inputs['Fac'])
    nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 5.0
    nt.links.new(rp.outputs['Alpha'], mx.inputs['Fac']); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs['Surface'])
    for f in range(1, 600, 10):   # les flammes montent
        mp.inputs['Location'].default_value = (0, -f * 0.035, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=f)
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    return m

def front_de_feu(x0, x1, y, rnd, hauteur=11, n=110, lumieres=10, fumee=True):
    """Une ligne de feu : des nappes de flammes, des lumières qui vacillent, une fumée épaisse au-dessus."""
    m = mat_flamme(); o = []
    for k in range(n):
        x = x0 + (x1 - x0) * k / n + rnd.uniform(-3, 3)
        h = hauteur * rnd.uniform(0.45, 1.5)
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y + rnd.uniform(-8, 8), h / 2))
        p = bpy.context.active_object; p.scale = (rnd.uniform(4, 9), h, 1); p.rotation_euler = (math.pi / 2, 0, rnd.uniform(-0.4, 0.4)); p.data.materials.append(m); o.append(p)
    for k in range(lumieres):
        ld = bpy.data.lights.new('feu', 'POINT'); ld.energy = 2e5; ld.color = (1.0, 0.42, 0.12); ld.shadow_soft_size = 4
        l = bpy.data.objects.new('feu', ld); l.location = (x0 + (x1 - x0) * (k + 0.5) / lumieres, y, 4); bpy.context.scene.collection.objects.link(l)
        for fr in range(1, 500, 4): ld.energy = 2e5 * (0.7 + 0.3 * math.sin(fr * 0.8 + k) * math.sin(fr * 0.27 + k)); ld.keyframe_insert('energy', frame=fr)
    if fumee:
        bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, y + 30, 45))
        c = bpy.context.active_object; c.scale = (abs(x1 - x0) * 1.2, 90, 80)
        mm = bpy.data.materials.new('fumee_feu'); mm.use_nodes = True; nt = mm.node_tree; nt.nodes.clear()
        out = nt.nodes.new('ShaderNodeOutputMaterial'); v = nt.nodes.new('ShaderNodeVolumePrincipled'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.2; nz.inputs['Detail'].default_value = 4
        mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0.012
        nt.links.new(nz.outputs['Fac'], mul.inputs[0]); nt.links.new(mul.outputs[0], v.inputs['Density']); v.inputs['Color'].default_value = (0.12, 0.1, 0.09, 1)
        nt.links.new(v.outputs[0], out.inputs['Volume']); c.data.materials.append(mm); o.append(c)
    return o

# ---------------------------------------------------------------- avions, tentes, housses
def plaque(pts, ep, z, mat, plan='XY', nom='plaque'):
    """Polygone extrudé (aile, empennage) : pts dans le plan XY (ou XZ pour une dérive)."""
    import bmesh
    me = bpy.data.meshes.new(nom); o = bpy.data.objects.new(nom, me); bpy.context.scene.collection.objects.link(o)
    bm = bmesh.new()
    vs = [bm.verts.new((a, b, z) if plan == 'XY' else (a, -ep / 2, b)) for a, b in pts]
    f = bm.faces.new(vs); r = bmesh.ops.extrude_face_region(bm, geom=[f]); nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, ep) if plan == 'XY' else (0, ep, 0), verts=nv); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.materials.append(mat)
    return o

def avion(x, y, z, rot, couleurs=('#1a2752', '#ecebe6', '#b0182a'), echelle=1.0):
    """Un Alpha Jet (Patrouille de France) : fuselage profilé, verrière, ailes hautes en flèche, dérive, train sorti."""
    import omd_catalogue as C
    c1, c2, c3 = (mat_uni(lin(c), 0.25, 0.35) for c in couleurs)
    vitre = mat_uni(lin('#1a2a36'), 0.04, 0.3)
    pts = [(6.0, 1.45), (5.2, 1.8), (3.6, 2.15), (2.6, 2.7), (1.0, 2.75), (-0.6, 2.35), (-4.0, 2.05), (-6.0, 2.0), (-6.0, 1.5), (-4.2, 1.15), (0.0, 1.0), (4.2, 1.15)]
    f = C.profil_extrude(pts, 1.25, [c1, vitre], 2.2, tumble=0.62, nom='fuselage', galbe=0.35)
    o = [f]
    for sy in (-1, 1):
        o.append(plaque([(1.6, 0.4 * sy), (-1.2, 0.4 * sy), (-2.6, 4.6 * sy), (-1.6, 4.6 * sy)], 0.14, 2.05, c1, nom='aile'))
        o.append(plaque([(-0.2, 3.0 * sy), (-1.2, 3.0 * sy), (-1.8, 3.6 * sy), (-0.9, 3.6 * sy)], 0.142, 2.06, c3, nom='bande'))
        o.append(plaque([(-4.4, 0.3 * sy), (-5.6, 0.3 * sy), (-6.3, 2.2 * sy), (-5.7, 2.2 * sy)], 0.1, 2.35, c1, nom='empennage'))
        o.append(cylindre(-0.5, 0.85 * sy, 1.1, 0.42, 3.4, c1, 16)); o[-1].rotation_euler.y = math.pi / 2; o[-1].location = (-0.5, 0.85 * sy, 1.45)   # nacelles
        o.append(cylindre(-0.4, 1.3 * sy, 0, 0.2, 0.9, mat_uni((0.02, 0.02, 0.02), 0.7), 12))
    o.append(plaque([(-3.6, 2.2), (-5.9, 2.2), (-6.6, 4.4), (-5.6, 4.4)], 0.12, 0, c1, plan='XZ', nom='derive'))
    o.append(plaque([(-4.6, 2.6), (-5.8, 2.6), (-6.2, 3.6), (-5.5, 3.6)], 0.125, 0, c2, plan='XZ', nom='bande_derive'))
    o.append(cylindre(4.4, 0, 0, 0.16, 1.05, mat_uni((0.02, 0.02, 0.02), 0.7), 12))
    g = A.regrouper(o); g.location = (x, y, z); g.rotation_euler.z = rot; g.scale = (echelle,) * 3
    return o

def tente_camp(x, y, rot, rnd, coul=None):
    t = mat_tex('hessian_380', 0.5, teinte=lin(coul or rnd.choice(['#e8e6de', '#a8b8c8', '#7a8058', '#d8d0b8'])))
    import omd_catalogue as C
    o = C.prisme([(-1.4, 0), (0, 2.0), (1.4, 0)], 4.0, t, 'tente')
    o.location = (x, y, 0); o.rotation_euler.z = rot
    return o

def housse_blanche(x, y, rot, rnd):
    m = mat_uni(lin('#eeeeea'), 0.35)
    o = coussin(x, y, 0, 0.6, 1.75, 0.2, m, 0.3)
    t = coussin(x, y + 0.72, 0.08, 0.3, 0.32, 0.14, m, 0.5)
    return [o, t]

def chapelle(x, y, rot=0.0):
    """Chapelle de Provence : nef de pierre blonde, toit de tuiles à deux pentes, porte en arc, oculus, clocher-mur et sa cloche."""
    pierre = mat_tex('white_sandstone_blocks_02', 0.35)
    toit = mat_tex('clay_roof_tiles', 1.2)
    noir = mat_uni((0.02, 0.018, 0.016), 0.8)
    o = [boite(0, 0, 0, 9, 16, 7, pierre, 0)]
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 8.4)); t = bpy.context.active_object; t.scale = (10, 17, 2.8)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for v in t.data.vertices:
        if v.co.z > 0: v.co.x *= 0.02
    t.data.materials.append(toit); o.append(t)
    o.append(boite(0, -8.05, 0, 2.2, 0.2, 3.2, noir, 0))                                     # la porte
    c = cylindre(0, -8.05, 0, 1.1, 0.2, noir, 24); c.rotation_euler.x = math.pi / 2; c.location = (0, -8.05, 3.2); o.append(c)
    oc = cylindre(0, -8.05, 0, 0.6, 0.2, noir, 24); oc.rotation_euler.x = math.pi / 2; oc.location = (0, -8.05, 5.6); o.append(oc)
    # clocher-mur au-dessus de la façade, une baie, la cloche
    o.append(boite(0, -7.6, 7, 3.4, 0.9, 4.6, pierre, 0))
    o.append(boite(0, -7.6, 8.2, 1.4, 1.0, 2.0, noir, 0))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.55, radius2=0.3, depth=0.8, location=(0, -7.6, 8.9))
    b = bpy.context.active_object; b.data.materials.append(mat_uni(lin('#8a6a32'), 0.35, 1.0)); o.append(b)
    g = A.regrouper(o); g.location = (x, y, 0); g.rotation_euler.z = rot
    return o, b
