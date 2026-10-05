# ============ One More Day — le centre de SALON-DE-PROVENCE en 3D (décor commun des cinématiques) ============
# Géographie simplifiée mais fidèle : le COURS (ancienne ceinture des remparts) court d'ouest en est (axe X), large de 30 m,
# deux chaussées, une promenade centrale sous deux rangées de PLATANES. Au nord, la PLACE CROUSILLAT s'ouvre sur le cours :
# la FONTAINE MOUSSUE (le champignon de mousse), puis la TOUR DE L'HORLOGE (porte de la vieille ville, campanile de fer).
# Derrière, les toits de la vieille ville montent vers le rocher du Puech et le CHÂTEAU DE L'EMPÉRI.
# Repères (m) : cours y ∈ [-15, 15] ; façades sud y = -15, façades nord y = 15 ; place Crousillat x ∈ [-14, 14], y ∈ [15, 40] ;
# fontaine (0, 26) ; tour de l'Horloge (0, 42) ; Empéri (55, 150), sur un rocher de 25 m.
# construire_salon(etat='marche' | 'panique' | 'abandon' | 'nuit') pose tout dans la collection « Salon ».
import bpy, math, random
from mathutils import Vector
import omd_assets as A
from omd_assets import cylindre, sphere, mat_tex, mat_uni, importer_ph

def boite(x, y, z, sx, sy, sz, mat=None, biseau=0.0, nom='boite'):
    # en ville, pas de petits biseaux (des milliers de pièces : on garde le rendu rapide)
    return A.boite(x, y, z, sx, sy, sz, mat, biseau if biseau >= 0.04 else 0.0, nom)

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

# Enduits de Provence : ocre jaune, ocre rouge, sable, crème, rose fané, gris pierre.
ENDUITS = [('yellow_plaster', '#ffe2a8'), ('beige_wall_001', '#ffe7c8'), ('white_stucco', '#f4e3c4'), ('red_plaster_weathered', '#ffd2b0'),
           ('painted_plaster_wall', '#f8d9a8'), ('beige_wall_002', '#fff0d8'), ('yellow_plaster_02', '#ffd9a0'), ('worn_plaster_wall', '#e8dccb')]
VOLETS = ['#8c94a6', '#8fa889', '#5f7f99', '#6e3a34', '#b7a07a', '#4f6b5c', '#9aa7a2', '#c8c0b0']

COLL = None
def coll():
    global COLL
    COLL = bpy.data.collections.get('Salon')
    if not COLL:
        COLL = bpy.data.collections.new('Salon'); bpy.context.scene.collection.children.link(COLL)
    return COLL
def ranger(objs):
    c = coll()
    for o in objs:
        for u in list(o.users_collection): u.objects.unlink(o)
        c.objects.link(o)
    return objs

def joindre(objs, nom):
    """Réunit des primitives en un seul objet (rendu plus rapide, scène plus légère). Contexte explicite : seuls ces objets."""
    objs = [o for o in objs if o and o.type == 'MESH']
    if not objs: return None
    for o in objs:
        for m in list(o.modifiers):
            with bpy.context.temp_override(object=o, active_object=o):
                try: bpy.ops.object.modifier_apply(modifier=m.name)
                except Exception: o.modifiers.remove(m)
    if len(objs) > 1:
        with bpy.context.temp_override(active_object=objs[0], object=objs[0], selected_objects=objs, selected_editable_objects=objs):
            bpy.ops.object.join()
    o = objs[0]; o.name = nom
    return o

# ---------------------------------------------------------------- un immeuble provençal
def immeuble(x, y, larg, prof, etages, face=1, rnd=None, boutique=True, nuit=False, abime=0.0):
    """Façade sur la rue côté `face` (+1 : la façade regarde +Y ; -1 : regarde -Y). x = centre, y = alignement de la façade."""
    rnd = rnd or random.Random(int(x * 10 + y))
    h = etages * 3.0 + 0.6
    tid, teinte = ENDUITS[rnd.randrange(len(ENDUITS))]
    enduit = mat_tex(tid, 0.35, teinte=lin(teinte))
    cy = y - face * prof / 2
    parts = [boite(x, cy, 0, larg, prof, h, enduit, 0.0)]
    volet = mat_tex('wood_peeling_paint_weathered', 1.0, teinte=lin(VOLETS[rnd.randrange(len(VOLETS))]))
    vitre = mat_uni((0.02, 0.025, 0.03), 0.06, 0.0) if not nuit else None
    cadre = mat_uni(lin('#efe8da'), 0.5)
    pierre = mat_tex('white_sandstone_blocks_02', 0.6)
    lum = mat_uni((0.05, 0.03, 0.01), 0.4, emission=(1.0, 0.62, 0.3, 4.0))
    sombre = mat_uni((0.015, 0.015, 0.02), 0.3)
    n = max(1, int(larg / 2.6))
    pas = larg / n
    yf = y + face * 0.02
    # génoise : trois rangs de tuiles rondes sous le toit
    for k in range(3):
        parts.append(boite(x, y + face * (0.12 + k * 0.1), h - 0.15 - k * 0.12, larg + 0.1, 0.22 + k * 0.1 * 0, 0.12, mat_tex('clay_roof_tiles', 1.2), 0.02))
    # toit à deux pentes (tuiles canal)
    toit = mat_tex(['clay_roof_tiles', 'clay_roof_tiles_02', 'roof_tiles'][rnd.randrange(3)], 1.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, cy, h + prof * 0.12))
    t = bpy.context.active_object; t.scale = (larg + 0.4, prof + 0.9, prof * 0.24); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    me = t.data
    for v in me.vertices:   # faîtage au milieu
        if v.co.z > 0: v.co.y *= 0.02
    t.data.materials.append(toit); parts.append(t)
    for e in range(etages):
        z0 = 0.6 + e * 3.0
        if e == 0 and boutique:
            # rez-de-chaussée : vitrine, porte, store
            parts.append(boite(x, yf, 0, larg - 0.6, 0.12, 3.3, pierre, 0.01))
            parts.append(boite(x - larg * 0.15, y + face * 0.07, 0.25, larg * 0.5, 0.06, 2.4, sombre if not nuit else lum, 0.0))
            parts.append(boite(x + larg * 0.3, y + face * 0.07, 0, 1.1, 0.06, 2.3, mat_tex('rough_pine_door', 1.0, teinte=lin(VOLETS[rnd.randrange(len(VOLETS))])), 0.0))
            if rnd.random() < 0.7:
                store = mat_uni(lin(rnd.choice(['#9e2f26', '#2e5e8e', '#3c6e47', '#c98b2b', '#6e2a46', '#d8cbb0'])), 0.75)
                s = boite(x - larg * 0.15, y + face * 0.7, 2.75, larg * 0.62, 1.4, 0.05, store, 0.0); s.rotation_euler.x = face * 0.32; parts.append(s)
            continue
        for k in range(n):
            wx = x - larg / 2 + pas * (k + 0.5)
            if rnd.random() < 0.06: continue
            hw = 1.6 if e < etages - 1 else 1.3
            parts.append(boite(wx, yf, z0 + 0.7, 1.05, 0.08, hw + 0.15, cadre, 0.01))
            allume = nuit and rnd.random() < 0.18
            parts.append(boite(wx, y + face * 0.05, z0 + 0.78, 0.85, 0.06, hw, lum if allume else (vitre or sombre), 0.0))
            ouvert = rnd.random()
            if ouvert < 0.45:      # volets ouverts, plaqués contre le mur
                for sx in (-1, 1): parts.append(boite(wx + sx * 0.92, y + face * 0.06, z0 + 0.78, 0.45, 0.05, hw, volet, 0.005))
            elif ouvert < 0.85:    # fermés
                parts.append(boite(wx, y + face * 0.1, z0 + 0.78, 0.9, 0.05, hw, volet, 0.005))
            else:                  # entrebâillés
                for sx in (-1, 1):
                    v = boite(wx + sx * 0.36, y + face * 0.18, z0 + 0.78, 0.45, 0.05, hw, volet, 0.005); v.rotation_euler.z = sx * face * 0.5; parts.append(v)
            if e == 1 and rnd.random() < 0.35:   # balcon de fer forgé
                fer = mat_uni(lin('#202020'), 0.5, 0.8)
                parts.append(boite(wx, y + face * 0.35, z0 + 0.6, 1.3, 0.7, 0.08, pierre, 0.01))
                parts.append(boite(wx, y + face * 0.68, z0 + 0.68, 1.3, 0.03, 0.9, fer, 0.0))
            if abime > 0 and rnd.random() < abime * 0.3:
                parts.append(boite(wx, y + face * 0.12, z0 + 0.5, 0.9, 0.02, 0.6, mat_uni((0.02, 0.02, 0.02), 0.9), 0))  # vitre brisée, traces de suie
    parts.append(boite(x, y + face * 0.03, 0, larg, 0.1, 0.6, mat_tex('old_stone_wall', 0.8), 0))          # soubassement de pierre
    for sx in (-1, 1):
        if rnd.random() < 0.5: parts.append(cylindre(x + sx * (larg / 2 - 0.15), y + face * 0.12, 0, 0.05, h - 0.2, mat_uni(lin('#8a7a66'), 0.5, 0.6), 8))  # descente d'eau
    o = joindre(parts, f'immeuble_{x:.0f}_{y:.0f}')
    return ranger([o])

def rangee(x0, x1, y, face, rnd, etages=(3, 5), prof=12, nuit=False, abime=0.0, sauf=()):
    x = x0
    out = []
    while x < x1:
        l = rnd.uniform(6.5, 11.5)
        if any(a <= x + l / 2 <= b for a, b in sauf): x += l; continue
        out += immeuble(x + l / 2, y, l - 0.05, prof, rnd.randint(*etages), face, random.Random(rnd.random()), nuit=nuit, abime=abime)
        x += l
    return out

# ---------------------------------------------------------------- sol, platanes, mobilier urbain
def sol_cours():
    o = []
    # chaussées (bitume), promenade centrale (gravier stabilisé), trottoirs (dalles), bordures
    o.append(boite(0, -9, -0.02, 400, 6.5, 0.02, mat_tex('asphalt_floor', 0.25), 0))
    o.append(boite(0, 9, -0.02, 400, 6.5, 0.02, mat_tex('asphalt_floor', 0.25), 0))
    o.append(boite(0, 0, 0, 400, 11.5, 0.12, mat_tex('gravelly_sand', 0.3), 0.0))
    for sy in (-13.6, 13.6): o.append(boite(0, sy, 0, 400, 2.8, 0.14, mat_tex('concrete_pavers', 0.6), 0.0))
    for sy in (-12.2, -5.75, 5.75, 12.2): o.append(boite(0, sy, 0, 400, 0.22, 0.16, mat_tex('white_sandstone_blocks_02', 1.2), 0.01))
    # marquages
    blanc = mat_uni(lin('#d8d6cc'), 0.6)
    for sy in (-9, 9):
        for k in range(-60, 60): o.append(boite(k * 6.0, sy, 0.001, 3.0, 0.12, 0.003, blanc, 0))
    # place Crousillat (pavés) et au-delà, la vieille ville
    o.append(boite(0, 30, 0, 30, 32, 0.08, mat_tex('cobblestone_floor_04', 0.5), 0))
    o.append(boite(0, 200, -0.1, 600, 340, 0.1, mat_tex('cobblestone_floor_04', 0.3), 0))
    o.append(boite(0, -200, -0.1, 600, 340, 0.1, mat_tex('asphalt_floor', 0.2), 0))
    return ranger([joindre(o, 'sol_cours')])

_platane_modele = None
CARTES = r'D:\projects 3D\OneMoreDay\cartes'
def mat_feuillage(nom_img, teinte=(0.42, 0.55, 0.3)):
    m = bpy.data.materials.get('feuillage_' + nom_img)
    if m: return m
    m = bpy.data.materials.new('feuillage_' + nom_img); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes.get('Principled BSDF')
    im = nt.nodes.new('ShaderNodeTexImage'); im.image = bpy.data.images.load(CARTES + '/' + nom_img + '.png', check_existing=True)
    mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0; mx.inputs[2].default_value = (*teinte, 1)
    nt.links.new(im.outputs['Color'], mx.inputs[1]); nt.links.new(mx.outputs[0], p.inputs['Base Color']); nt.links.new(im.outputs['Alpha'], p.inputs['Alpha'])
    p.inputs['Roughness'].default_value = 0.6
    try: p.inputs['Subsurface Weight'].default_value = 0.0; p.inputs['Transmission Weight'].default_value = 0.15
    except Exception: pass
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False
    return m

def modele_platane():
    """Un platane : fût (écorce de platane), quatre maîtresses branches, houppier de cartes de feuillage photo."""
    rnd = random.Random(31)
    ec = mat_tex('bark_platanus', 1.2)
    parts = []
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.42, radius2=0.26, depth=6.0, location=(0, 0, 3.0))
    t = bpy.context.active_object; t.data.materials.append(ec); parts.append(t)
    for k in range(4):
        a = k * math.pi / 2 + rnd.uniform(-0.3, 0.3)
        bout = Vector((math.cos(a) * 3.6, math.sin(a) * 3.6, 10.5 + rnd.uniform(-1, 1))); base = Vector((0, 0, 5.6))
        d = bout - base
        bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.2, radius2=0.07, depth=d.length, location=(base + bout) / 2)
        b = bpy.context.active_object; b.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); b.data.materials.append(ec); parts.append(b)
    mats = [mat_feuillage(n) for n in ('touffe_a_dessus', 'touffe_a_face', 'touffe_b_face', 'touffe_b_cote')]
    for k in range(170):
        # point dans un ellipsoïde (plutôt vers la surface : le houppier est une coque)
        while True:
            u = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1)))
            if 0.35 < u.length <= 1: break
        pos = Vector((u.x * 5.6, u.y * 5.6, 10.8 + u.z * 3.6))
        taille = rnd.uniform(2.0, 3.4)
        bpy.ops.mesh.primitive_plane_add(size=taille, location=pos)
        c = bpy.context.active_object
        c.rotation_euler = (rnd.uniform(0.6, 2.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0, 6.28))
        c.data.materials.append(mats[k % 4]); parts.append(c)
    o = joindre(parts, 'platane_modele')
    return o

def platane(x, y, echelle=1.0, rot=0.0):
    global _platane_modele
    if _platane_modele is None or _platane_modele.name not in bpy.data.objects:
        _platane_modele = modele_platane(); ranger([_platane_modele])
        _platane_modele.hide_render = True; _platane_modele.hide_viewport = True
    o = _platane_modele.copy(); o.data = _platane_modele.data; o.hide_render = False; o.hide_viewport = False
    o.location = (x, y, 0); o.scale = (echelle, echelle, echelle); o.rotation_euler.z = rot
    coll().objects.link(o)
    return [o]

_modeles = {}
def modele(pid, x, y, rot=0.0, echelle=1.0, z=0.0):
    """Double lié d'un modèle Poly Haven (importé une seule fois, joint)."""
    m = _modeles.get(pid)
    if m is None or m.name not in bpy.data.objects:
        objs = importer_ph(pid)
        m = joindre(objs, 'modele_' + pid); ranger([m]); m.hide_render = True; m.hide_viewport = True
        _modeles[pid] = m
    o = m.copy(); o.data = m.data; o.hide_render = False; o.hide_viewport = False
    o.location = (x, y, z); o.rotation_euler = (0, 0, rot); o.scale = (echelle,) * 3
    coll().objects.link(o)
    return o

def lampadaire(x, y, rot=0.0, nuit=False):
    # réverbère de fonte façon centre ancien : fût cannelé, crosse, lanterne
    fonte = mat_uni(lin('#1e211e'), 0.45, 0.7)
    parts = [cylindre(x, y, 0, 0.09, 4.3, fonte, 12), cylindre(x, y, 0, 0.16, 0.6, fonte, 12)]
    parts.append(boite(x, y, 4.3, 0.36, 0.36, 0.06, fonte, 0))
    lan = boite(x, y, 4.36, 0.28, 0.28, 0.5, mat_uni(lin('#f2e2b8'), 0.2, emission=(1.0, 0.8, 0.5, 6.0 if nuit else 0.3)), 0)
    parts.append(lan); parts.append(boite(x, y, 4.86, 0.42, 0.42, 0.08, fonte, 0))
    o = joindre(parts, 'reverbere'); ranger([o])
    if nuit:
        ld = bpy.data.lights.new('lampe', 'POINT'); ld.energy = 2400; ld.color = (1.0, 0.72, 0.42); ld.shadow_soft_size = 0.3
        l = bpy.data.objects.new('lampe', ld); l.location = (x, y, 4.6); coll().objects.link(l)
    return o

def voiture_rue(x, y, rot, coul, rnd):
    import omd_catalogue as C
    objs = C.voiture(C.COUL_VOITURES.index(coul) if coul in C.COUL_VOITURES else 0, rnd)
    g = A.regrouper(objs); g.location = (x, y, 0); g.rotation_euler.z = rot
    bpy.context.view_layer.update()
    return ranger(objs + [g])

# ---------------------------------------------------------------- les monuments
def fontaine_moussue(x, y):
    """La Fontaine Moussue (1750) : un bassin rond, et dessus un énorme champignon de mousse et de concrétions."""
    pierre = mat_tex('old_sandstone_02', 0.8)
    mousse = mat_tex('forest_ground_05', 0.6, teinte=lin('#b8d890'))
    o = [cylindre(x, y, 0, 4.2, 0.8, pierre, 64, biseau=0.06), cylindre(x, y, 0.5, 3.9, 0.15, mat_uni((0.03, 0.05, 0.05), 0.04), 64)]
    o.append(cylindre(x, y, 0.5, 1.0, 2.2, mousse, 24))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=2.6, location=(x, y, 3.0), segments=48, ring_count=24)
    ch = bpy.context.active_object; ch.scale = (1, 1, 0.62); ch.data.materials.append(mousse)
    d = ch.modifiers.new('relief', 'DISPLACE'); tx = bpy.data.textures.new('mousse_bruit', 'CLOUDS'); tx.noise_scale = 0.6; d.texture = tx; d.strength = 0.45
    s = ch.modifiers.new('sub', 'SUBSURF'); s.levels = 2; s.render_levels = 2
    bpy.ops.object.shade_smooth()
    o.append(ch)
    # filets d'eau qui tombent de la mousse
    eau = mat_uni((0.6, 0.7, 0.75), 0.02)
    for k in range(10):
        a = k / 10 * 6.283
        o.append(cylindre(x + math.cos(a) * 2.4, y + math.sin(a) * 2.4, 0.6, 0.02, 1.9, eau, 6))
    return ranger(o)

def tour_horloge(x, y):
    """La Tour de l'Horloge (1626-1630) : massive tour carrée de pierre blonde, porte en arc, cadran, campanile de fer forgé."""
    pierre = mat_tex('white_sandstone_bricks', 0.35)
    o = [boite(x, y, 0, 9, 8, 26, pierre, 0.05)]
    o.append(boite(x, y - 4.05, 0, 4.2, 0.4, 6.5, mat_uni((0.02, 0.02, 0.02), 0.8), 0.0))               # passage (porte)
    o.append(cylindre(x, y - 4.05, 6.5, 2.1, 0.4, mat_uni((0.02, 0.02, 0.02), 0.8), 24))
    o[-1].rotation_euler.x = math.pi / 2; o[-1].location = (x, y - 4.05, 6.4)
    for z in (9, 17, 24): o.append(boite(x, y - 4.15, z, 9.4, 0.3, 0.45, pierre, 0.02))                   # cordons
    cad = cylindre(x, y - 4.2, 0, 1.7, 0.15, mat_uni(lin('#e8e2cf'), 0.4), 48); cad.rotation_euler.x = math.pi / 2; cad.location = (x, y - 4.2, 20.5); o.append(cad)
    noir = mat_uni((0.015, 0.015, 0.015), 0.4, 0.6)
    for k in range(12):   # les heures
        a = k / 12 * 6.283
        o.append(boite(x + math.sin(a) * 1.45, y - 4.32, 20.5 + math.cos(a) * 1.45 - 0.12, 0.07, 0.03, 0.24, noir, 0))
    for ang, l in ((-90 + 5, 1.15), (300, 0.8)):   # neuf heures dix : la grande aiguille sur le 2, la petite sur le 9
        a = math.radians(ang if ang > 0 else 360 + ang)
        aig = boite(x, y - 4.36, 20.5, 0.1, 0.03, l, noir, 0)
        for v in aig.data.vertices: v.co.z += l / 2      # pivot au centre du cadran
        aig.location.z = 20.5; aig.rotation_euler.y = a; o.append(aig)
    o.append(boite(x, y, 26, 9.6, 8.6, 0.7, pierre, 0.03))                                                  # corniche, balustrade
    # campanile : une cage de fer forgé en bulbe, avec sa cloche
    fer = mat_uni((0.03, 0.03, 0.03), 0.5, 0.8)
    for k in range(12):
        a = k / 12 * 6.283
        b = cylindre(x + math.cos(a) * 1.4, y + math.sin(a) * 1.4, 26.7, 0.04, 4.2, fer, 8); b.rotation_euler = (math.sin(a) * -0.25, math.cos(a) * 0.25, 0); o.append(b)
    o.append(sphere(x, y, 31.0, 0.35, fer)); o.append(cylindre(x, y, 31.2, 0.03, 1.8, fer, 8))
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.8, radius2=0.45, depth=1.0, location=(x, y, 28.2))
    cl = bpy.context.active_object; cl.data.materials.append(mat_uni(lin('#8a6a32'), 0.35, 1.0)); o.append(cl)
    return ranger(o)

def emperi(x, y):
    """Le château de l'Empéri sur le rocher du Puech : murailles crénelées, donjon, tours."""
    roc = mat_tex('rock_face' if False else 'rustic_stone_wall', 0.08, teinte=lin('#d8ccb0'))
    pierre = mat_tex('stone_wall_04' if False else 'old_stone_wall', 0.12, teinte=lin('#f0e2c8'))
    o = []
    bpy.ops.mesh.primitive_ico_sphere_add(radius=40, subdivisions=4, location=(x, y, -14))
    r = bpy.context.active_object; r.scale = (1.6, 0.9, 0.95); r.data.materials.append(roc)
    d = r.modifiers.new('relief', 'DISPLACE'); tx = bpy.data.textures.new('roc', 'VORONOI'); tx.noise_scale = 6; d.texture = tx; d.strength = 4
    o.append(r)
    zc = 22
    o.append(boite(x, y, zc, 46, 22, 14, pierre, 0.1))
    for k in range(-11, 12): o.append(boite(x + k * 2.0, y - 11.1, zc + 14, 1.0, 0.8, 1.2, pierre, 0.02))  # créneaux
    o.append(boite(x - 16, y + 2, zc, 12, 12, 26, pierre, 0.1))                                           # donjon
    for k in range(-2, 3): o.append(boite(x - 16 + k * 2.4, y - 4.1, zc + 26, 1.2, 0.8, 1.4, pierre, 0.02))
    for tx_ in (-23, 23): o.append(cylindre(x + tx_, y - 10, zc - 2, 4, 20, pierre, 24))
    o.append(boite(x + 10, y + 2, zc + 14, 18, 14, 0.4, mat_tex('clay_roof_tiles', 0.4), 0))
    return ranger(o)

def vieille_ville(rnd, nuit=False):
    """Les toits de la vieille ville derrière la place, qui montent en désordre vers le rocher."""
    out = []
    for ix in range(-6, 7):
        for iy in range(0, 4):
            x = ix * 11 + rnd.uniform(-2, 2); y = 52 + iy * 16 + rnd.uniform(-3, 3)
            if abs(x) < 8 and iy == 0: continue
            out += immeuble(x, y, rnd.uniform(8, 12), 14, rnd.randint(3, 5) + iy // 2, -1, random.Random(rnd.random()), boutique=False, nuit=nuit)
    return out

# ---------------------------------------------------------------- le marché
FRUITS = ['food_apple_01', 'lemon', 'food_pomegranate_01', 'food_pears_asian_01', 'food_lime_01', 'yellow_onion', 'sweet_potato']
def etal(x, y, rot, rnd, renverse=False):
    """Étal de marché : tréteaux, cagettes de fruits, bâche de couleur sur des piquets."""
    o = []
    b = mat_tex('weathered_planks', 1.0)
    o.append(boite(0, 0, 0.82, 2.4, 1.0, 0.04, b, 0.01))
    for sx in (-1.0, 1.0): o.append(boite(sx, 0, 0, 0.06, 0.9, 0.82, b, 0.005))
    bache = mat_uni(lin(rnd.choice(['#b8322a', '#d9772a', '#2a6fa8', '#2f8a4c', '#e0b42a', '#7a3a8e', '#c4521e', '#e8e0cc'])), 0.7)
    for sx in (-1.25, 1.25):
        for sy in (-0.5, 0.5): o.append(cylindre(sx, sy, 0, 0.025, 2.3, mat_uni((0.2, 0.2, 0.2), 0.5, 0.8), 8))
    bc = boite(0, 0, 2.3, 2.7, 1.3, 0.03, bache, 0.0); bc.rotation_euler.x = 0.12; o.append(bc)
    nappe = mat_tex(rnd.choice(['gingham_check', 'fabric_pattern_07', 'floral_jacquard']), 0.8)
    o.append(boite(0, 0, 0.86, 2.5, 1.05, 0.01, nappe, 0))
    for k in range(4):
        cx = -0.9 + k * 0.6
        o.append(boite(cx, 0, 0.87, 0.55, 0.4, 0.13, mat_tex('weathered_planks', 3), 0))
        fr = FRUITS[rnd.randrange(len(FRUITS))]
        coul = {'food_apple_01': '#9a1a14', 'lemon': '#e8c82a', 'food_pomegranate_01': '#8a1a1e', 'food_pears_asian_01': '#c8a850', 'food_lime_01': '#5a8a2a', 'yellow_onion': '#b8823a', 'sweet_potato': '#7a3a2a'}[fr]
        o.append(boite(cx, 0, 0.99, 0.5, 0.36, 0.02, mat_uni(lin(coul), 0.5), 0))     # la cagette pleine (le dessus)
        for j in range(7):
            try: o.append(modele(fr, cx + rnd.uniform(-0.2, 0.2), rnd.uniform(-0.14, 0.14), rnd.random() * 6, 1.1, 1.0))
            except Exception: pass
    g = A.regrouper(o); g.location = (x, y, 0); g.rotation_euler.z = rot
    if renverse: g.rotation_euler = (math.radians(rnd.choice([-80, 80])), 0, rot); g.location.z = 0.5
    bpy.context.view_layer.update()
    return ranger(o + [g])

def campagne_autour(rnd):
    """Au-delà de la ville : la plaine (herbe sèche, cultures), des bosquets, et les collines calcaires à l'horizon."""
    o = [boite(0, 0, -0.25, 3000, 3000, 0.1, mat_tex('aerial_grass_rock', 0.02, teinte=lin('#d8d0a8')), 0)]
    roc = mat_tex('aerial_grass_rock', 0.004, teinte=lin('#b8b8a0'))
    for k in range(9):   # collines (les Alpilles au nord-ouest, la chaîne de Lamanon au nord, la Crau au sud)
        a = math.radians(40 + k * 22 + rnd.uniform(-8, 8)); d = rnd.uniform(700, 1300)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=1, subdivisions=4, location=(math.cos(a) * d, math.sin(a) * d, -30))
        c = bpy.context.active_object; c.scale = (rnd.uniform(250, 500), rnd.uniform(150, 260), rnd.uniform(60, 160)); c.data.materials.append(roc)
        dm = c.modifiers.new('relief', 'DISPLACE'); tx = bpy.data.textures.get('colline') or bpy.data.textures.new('colline', 'CLOUDS'); tx.noise_scale = 0.4; dm.texture = tx; dm.strength = 0.15
        o.append(c)
    vert = mat_uni(lin('#3e4a2c'), 0.9)
    for k in range(160):   # bosquets et haies de cyprès dans la plaine
        a = rnd.random() * 6.283; d = rnd.uniform(260, 900)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=1, subdivisions=1, location=(math.cos(a) * d, math.sin(a) * d, 4))
        b = bpy.context.active_object; b.scale = (rnd.uniform(4, 12), rnd.uniform(4, 12), rnd.uniform(4, 9)); b.data.materials.append(vert); o.append(b)
    return ranger([joindre(o, 'campagne')])

# ---------------------------------------------------------------- tout le décor
def construire_salon(etat='marche', graine=7, arbres=(-14, 15)):
    nuit = etat == 'nuit'
    abime = 0.6 if etat == 'abandon' else 0.0
    rnd = random.Random(graine)
    A.vider()
    global _platane_modele; _platane_modele = None; _modeles.clear()
    sol_cours()
    campagne_autour(random.Random(graine + 1))
    rangee(-120, 120, -15.0, 1, rnd, (3, 5), nuit=nuit, abime=abime)                        # façades sud (regardent le nord)
    rangee(-120, 120, 15.0, -1, rnd, (3, 5), nuit=nuit, abime=abime, sauf=[(-15, 15)])     # façades nord, ouvertes sur la place
    # la place Crousillat : bordée de maisons, la fontaine, la tour, la vieille ville derrière
    for sx in (-1, 1):
        for k in range(3): immeuble(sx * 19.5, 21 + k * 7.5, 6.8, 9, 4, -1, random.Random(rnd.random()), nuit=nuit)
    fontaine_moussue(0, 26)
    tour_horloge(0, 44)
    vieille_ville(rnd, nuit)
    emperi(70, 175)
    for k in range(*arbres):    # deux rangées de platanes sur la promenade centrale
        for sy in (-4.2, 4.2): platane(k * 8.5 + rnd.uniform(-0.6, 0.6), sy + rnd.uniform(-0.3, 0.3), rnd.uniform(0.9, 1.15), rnd.random() * 6.3)
    for k in range(-10, 11): lampadaire(k * 12 + 4, -12.6, 0, nuit); lampadaire(k * 12 - 2, 12.6, math.pi, nuit)
    return rnd
