# ============ One More Day — INTÉRIEURS des cinématiques ============
# couloir_hopital(f1) : le couloir de l'hôpital du Pays salonais — lino, murs mi-hauteur vert d'eau, néons qui grésillent,
#   brancards alignés, corps sous les draps ; renvoie les points utiles (position de la médecin, du brancard du mort).
# housse(f1, ouverture) : l'intérieur d'une housse mortuaire noire, vue d'en dessous : le plastique respire, la fermeture
#   éclair s'ouvre sur une fente de lumière.
import bpy, math, random
from mathutils import Vector
import omd_assets as A
from omd_assets import cylindre, sphere, mat_tex, mat_uni, coussin

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
def boite(x, y, z, sx, sy, sz, mat=None, biseau=0.0, nom='boite'):
    return A.boite(x, y, z, sx, sy, sz, mat, biseau, nom)

def couloir_hopital(f1, rnd=None):
    rnd = rnd or random.Random(5)
    L, l, h = 34.0, 3.0, 2.8
    sol = mat_tex('worn_tile_floor', 0.6, teinte=lin('#d8dccf'))
    bas = mat_tex('painted_plaster_wall', 0.5, teinte=lin('#a9c4b4'))
    haut = mat_tex('white_plaster_rough_01', 0.5, teinte=lin('#e8e4d6'))
    plafond = mat_uni(lin('#d8d6cc'), 0.8)
    boite(0, L / 2 - 2, -0.05, l + 0.4, L, 0.05, sol)
    boite(0, L / 2 - 2, h, l + 0.4, L, 0.05, plafond)
    for sx in (-1, 1):
        boite(sx * (l / 2 + 0.05), L / 2 - 2, 0, 0.1, L, 1.25, bas)
        boite(sx * (l / 2 + 0.05), L / 2 - 2, 1.25, 0.1, L, h - 1.25, haut)
        boite(sx * (l / 2 - 0.02), L / 2 - 2, 0.95, 0.04, L, 0.06, mat_uni(lin('#b8b0a0'), 0.4))   # main courante
        for k in range(6):   # portes des chambres
            y = 2 + k * 5.2 + (0 if sx < 0 else 2.6)
            boite(sx * (l / 2 - 0.01), y, 0, 0.04, 1.1, 2.1, mat_tex('rough_pine_door', 1.0, teinte=lin('#c8c4b4')), 0.0)
            boite(sx * (l / 2 - 0.035), y + 0.4, 1.0, 0.03, 0.05, 0.12, mat_uni(lin('#a0a0a0'), 0.3, 1), 0)
            boite(sx * (l / 2 - 0.03), y - 0.2, 1.5, 0.02, 0.35, 0.45, mat_uni(lin('#202a30'), 0.1), 0)   # hublot
    boite(0, L - 2.1, 0, l, 0.1, h, haut)          # le fond, une double porte
    boite(0, L - 2.15, 0, 1.8, 0.04, 2.2, mat_uni(lin('#9aa6a8'), 0.5, 0.3), 0)
    # néons : tubes émissifs + lumières ; deux grésillent
    neons = []
    for k in range(8):
        y = 1 + k * 4.0
        tube = boite(0, y, h - 0.08, 0.22, 1.25, 0.06, mat_uni((0.9, 0.95, 1.0), 0.2, emission=(0.85, 0.95, 1.0, 6.0)), 0)
        ld = bpy.data.lights.new('neon', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 0.2; ld.size_y = 1.2; ld.energy = 260; ld.color = (0.85, 0.95, 1.0)
        lo = bpy.data.objects.new('neon', ld); lo.location = (0, y, h - 0.12); lo.rotation_euler = (0, 0, 0); bpy.context.scene.collection.objects.link(lo)
        neons.append((tube, ld, k in (2, 5)))
    for tube, ld, greslle in neons:
        if not greslle: continue
        m = tube.data.materials[0].copy(); tube.data.materials[0] = m
        p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        f = 1
        while f <= f1:
            on = rnd.random() > 0.35
            ld.energy = 260 if on else 6; ld.keyframe_insert('energy', frame=f)
            p.inputs['Emission Strength'].default_value = 6 if on else 0.2; p.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
            f += rnd.choice([1, 2, 3, 8, 14])
    # brancards le long des murs, corps sous des draps (l'un a une main qui dépasse)
    drap = mat_tex('rough_linen', 1.4, teinte=lin('#f4f2ec'))
    inox = mat_uni(lin('#b8bec2'), 0.3, 0.9)
    lits = []
    for k in range(6):
        sx = -1 if k % 2 == 0 else 1
        y = 3 + k * 4.4
        x = sx * (l / 2 - 0.45)
        boite(x, y, 0.75, 0.62, 1.95, 0.05, inox, 0.01)
        for dx in (-0.25, 0.25):
            for dy in (-0.85, 0.85): cylindre(x + dx, y + dy, 0, 0.015, 0.75, inox, 8)
        corps = coussin(x, y - 0.1, 0.8, 0.48, 1.55, 0.2, drap, 0.3); corps.rotation_euler.z = rnd.uniform(-0.03, 0.03)
        coussin(x, y + 0.78, 0.82, 0.26, 0.28, 0.2, drap, 0.6)
        lits.append((x, y))
    return {'L': L, 'l': l, 'h': h, 'lits': lits}

def housse(f1, ouverture=(0.0, 0.3)):
    """Vu d'en dessous, dans la housse : le plastique noir respire, la fermeture s'ouvre (ouverture : largeur de la fente début/fin)."""
    plast = bpy.data.materials.new('plastique_noir'); plast.use_nodes = True
    p = plast.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value = (0.02, 0.02, 0.022, 1); p.inputs['Roughness'].default_value = 0.3
    try: p.inputs['Coat Weight'].default_value = 0.6
    except Exception: pass
    # le plastique, drapé juste au-dessus du visage (on est couché dessous), avec de grands plis mous
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=160, y_subdivisions=220, size=1, location=(0, 0, 0.22))
    t = bpy.context.active_object; t.scale = (1.3, 2.2, 1); t.data.materials.append(plast)
    for v in t.data.vertices:   # retombe sur les côtés (le corps dessous)
        v.co.z = -0.9 * (v.co.x ** 2) * 1.2
    tx = bpy.data.textures.new('plis', 'CLOUDS'); tx.noise_scale = 0.28; tx.noise_depth = 2
    d = t.modifiers.new('plis', 'DISPLACE'); d.texture = tx; d.strength = 0.07; d.texture_coords = 'OBJECT'
    tx2 = bpy.data.textures.new('fripes', 'CLOUDS'); tx2.noise_scale = 0.05; tx2.noise_depth = 1
    d2 = t.modifiers.new('fripes', 'DISPLACE'); d2.texture = tx2; d2.strength = 0.008
    vide = bpy.data.objects.new('souffle', None); bpy.context.scene.collection.objects.link(vide); d.texture_coords_object = vide
    for f in range(1, f1 + 1, 4):    # le plastique respire (un cœur qui repart)
        vide.location = (0, 0, 0.015 * math.sin(f / 24 * 2.2)); vide.keyframe_insert('location', frame=f)
    bpy.ops.object.shade_smooth()
    # la fente de la fermeture : lumière froide au-dessus
    fente = boite(0, 0.1, 0.165, 0.008, 1.6, 0.01, mat_uni((1, 1, 1), 0.5, emission=(0.9, 0.95, 1.0, 40.0)), 0)
    fente.scale.x = 1 + ouverture[0] * 30; fente.keyframe_insert('scale', frame=1)
    fente.scale.x = 1 + ouverture[1] * 30; fente.keyframe_insert('scale', frame=f1)
    dents = boite(0, 0.1, 0.162, 0.025, 1.6, 0.008, mat_uni(lin('#5a5a5a'), 0.3, 1), 0)
    ld = bpy.data.lights.new('fente', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 0.05; ld.size_y = 1.8; ld.color = (0.85, 0.92, 1.0)
    lo = bpy.data.objects.new('fente', ld); lo.location = (0, 0.1, 0.15); lo.rotation_euler = (0, 0, 0); bpy.context.scene.collection.objects.link(lo)
    ld.energy = 4 + ouverture[0] * 30; ld.keyframe_insert('energy', frame=1); ld.energy = 4 + ouverture[1] * 30; ld.keyframe_insert('energy', frame=f1)
    # un reflet froid qui court sur les plis (la lumière passe à travers le plastique fin)
    lb = bpy.data.lights.new('reflet', 'POINT'); lb.energy = 30; lb.color = (0.7, 0.8, 1.0); lr = bpy.data.objects.new('reflet', lb); lr.location = (0.25, -0.5, 0.05); bpy.context.scene.collection.objects.link(lr)
    return t
