# ============ One More Day — CATALOGUE des sprites d'objets (Blender) ============
# Chaque entrée : type de carte (js/carte/catalogue.js OBJETS, ou dessin de construction js/data/construction.js) →
#   { t: [w, h] cases, n: variantes, f: fonction(v, rnd) → [objets] (posés n'importe où : caler() les remet à l'échelle),
#     remplir (part de l'empreinte occupée), etirer (déformer pour remplir), plat (pas d'ombre portée), tourne (rotation
#     aléatoire en jeu, radians), couleurs ([#hex] des variantes : le jeu choisit la plus proche d'une couleur imposée),
#     etats { suffixe: fonction } (autres sprites : _vide, _ouverte) }
# Orientation 0 : le DOS de l'objet en haut de l'image (+Y). Unités : mètres.
import math, random
import omd_assets as A
from omd_assets import boite, cylindre, sphere, coussin, importer_ph, mat_tex, mat_uni

def hexc(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def lin(c):  # sRGB → linéaire (couleurs de base des matières)
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
def coul(h, rugo=0.5, metal=0.0): return mat_uni(lin(hexc(h)), rugo, metal)

def ph(*ids):
    """Fonction de variante : le modèle Poly Haven n° v."""
    def f(v, rnd): return importer_ph(ids[v % len(ids)])
    f.n = len(ids)
    return f

# ---------- petits objets posés sur un plateau ----------
PROPS_TABLE = ['wine_bottles_01', 'jug_01', 'wooden_bowl_01', 'carved_wooden_plate', 'tea_set_01', 'ceramic_pot', 'food_apple_01', 'lemon', 'binder_notebook', 'cigarette_pack', 'russian_food_cans_01', 'pot_enamel_01', 'brass_candleholders']
PROPS_BUREAU = ['binder_notebook', 'office_notepads', 'classic_laptop', 'stationery_supplies', 'clipboard', 'vintage_stapler', 'desk_lamp_arm_01']
PROPS_COMMODE = ['brass_vase_01', 'ceramic_vase_02', 'standing_picture_frame_01', 'mantel_clock_01', 'brass_candleholders', 'decorative_book_set_01', 'jug_01']
PROPS_ETAGERE = ['decorative_book_set_01', 'book_encyclopedia_set_01', 'ceramic_vase_01', 'cardboard_box_01', 'jug_01', 'wicker_basket_01', 'wooden_bowl_02', 'brass_pot_01']
PROPS_RAYON = ['russian_food_cans_01', 'long_life_food', 'cardboard_box_01', 'plastic_bottle_gallon', 'multi_cleaner_bottle', 'bleach_bottle', 'all_purpose_cleaner', 'can_rusted', 'oil_tin', 'plastic_container', 'spray_paint_bottles']

def poser_dessus(objs, liste, rnd, n, marge=0.08, zone=None, echelle=1.0, tourner=True):
    """Pose n petits objets (vraie taille Poly Haven) sur le dessus du groupe objs (après mise à l'échelle)."""
    mn, mx = A.bornes(objs)
    zx0, zy0, zx1, zy1 = zone or (mn.x + marge, mn.y + marge, mx.x - marge, mx.y - marge)
    out = []
    for k in range(n):
        pid = liste[rnd.randrange(len(liste))]
        try: ps = importer_ph(pid)
        except Exception as e: print('[props]', pid, e); continue
        g = A.regrouper(ps); g.scale = (echelle, echelle, echelle)
        if tourner: g.rotation_euler = (0, 0, rnd.random() * 6.283)
        import bpy; bpy.context.view_layer.update()
        a, b = A.bornes(ps)
        sx, sy = b.x - a.x, b.y - a.y
        if sx > (zx1 - zx0) * 0.9 or sy > (zy1 - zy0) * 0.9:   # trop grand pour ce plateau : on réduit
            s = min((zx1 - zx0) * 0.6 / max(sx, 1e-3), (zy1 - zy0) * 0.6 / max(sy, 1e-3)); g.scale = (echelle * s,) * 3; bpy.context.view_layer.update(); a, b = A.bornes(ps); sx, sy = b.x - a.x, b.y - a.y
        x = zx0 + sx / 2 + rnd.random() * max(0, (zx1 - zx0) - sx); y = zy0 + sy / 2 + rnd.random() * max(0, (zy1 - zy0) - sy)
        g.location.x += x - (a.x + b.x) / 2; g.location.y += y - (a.y + b.y) / 2; g.location.z += mx.z - a.z
        bpy.context.view_layer.update()
        out += ps
    return out

# ======================================================== constructions en code ========================================================
def bois(v=0, ech=1.0):
    return mat_tex(['wood_table_001', 'brown_planks_04', 'weathered_planks', 'old_planks_02', 'wood_planks_grey'][v % 5], ech)

def lit(v, rnd, simple=False):
    L = 0.95 if simple else 1.5; P = 2.0
    cadre = boite(0, 0, 0.18, L + 0.08, P + 0.06, 0.18, bois(v), 0.02)
    tete = boite(0, P / 2 + 0.02, 0.18, L + 0.1, 0.06, 0.75, bois(v), 0.02)
    mate = coussin(0, -0.02, 0.36, L, P - 0.04, 0.2, mat_uni(lin(hexc('#e8e2d4')), 0.8), 0.35)
    obj = [cadre, tete, mate]
    for k in range(1 if simple else 2):
        x = 0 if simple else (-L / 4 if k == 0 else L / 4)
        obj.append(coussin(x, P / 2 - 0.3, 0.56, (L * 0.8) if simple else L * 0.42, 0.42, 0.13, mat_uni(lin(hexc('#f2eee2')), 0.85), 0.5))
    tissus = ['floral_jacquard', 'gingham_check', 'fabric_pattern_05', 'quatrefoil_jacquard_fabric', 'rough_linen', 'fabric_pattern_07', 'denim_fabric', 'poly_wool_herringbone']
    couv = coussin(0, -0.25 - (0.12 if v % 3 == 2 else 0), 0.55, L + 0.06, P * 0.68, 0.08, mat_tex(tissus[v % len(tissus)], 1.2), 0.45)
    couv.rotation_euler.z = (rnd.random() - 0.5) * 0.08
    obj.append(couv)
    if v % 3 == 2:   # lit défait : la couverture rabattue
        obj.append(coussin(L * 0.15, -P * 0.42, 0.6, L * 0.7, 0.35, 0.14, mat_tex(tissus[v % len(tissus)], 1.2), 0.5))
    return obj
lit.n = 6
def lit_simple(v, rnd): return lit(v, rnd, simple=True)
lit_simple.n = 4

def lit_hopital(v, rnd):
    o = [boite(0, 0, 0.45, 0.95, 2.05, 0.08, mat_uni(lin(hexc('#9aa3a6')), 0.35, 0.8), 0.01)]
    o.append(coussin(0, 0, 0.53, 0.88, 1.95, 0.16, mat_uni(lin(hexc('#eef0ee')), 0.8), 0.3))
    o.append(coussin(0, 0.72, 0.68, 0.7, 0.38, 0.12, mat_uni(lin(hexc('#fbfbf8')), 0.85), 0.5))
    o.append(coussin(0, -0.32, 0.69, 0.92, 1.25, 0.05, mat_uni(lin(hexc(['#8fb0c0', '#a8c4b0', '#c0b0a0'][v % 3])), 0.85), 0.4))
    for sx in (-0.5, 0.5): o.append(boite(sx, -0.1, 0.62, 0.035, 1.2, 0.3, mat_uni(lin(hexc('#c8ccd0')), 0.3, 0.9), 0.01))
    o.append(boite(0, 1.04, 0.45, 0.98, 0.05, 0.5, mat_uni(lin(hexc('#c8ccd0')), 0.3, 0.6), 0.01))
    if v == 2: o.append(sphere(0.1, -0.2, 0.72, 0.18, mat_uni(lin(hexc('#5a0a0e')), 0.4), 0.08))   # une tache de sang
    return o
lit_hopital.n = 3

def brancard(v, rnd):
    o = [boite(0, 0, 0.75, 0.62, 1.95, 0.06, mat_uni(lin(hexc('#b8bec2')), 0.3, 0.9), 0.01)]
    o.append(coussin(0, 0, 0.8, 0.56, 1.85, 0.08, mat_uni(lin(hexc(['#2e4a6a', '#e86a20', '#3a3a3a'][v % 3])), 0.6), 0.3))
    if v == 1: o.append(coussin(0, 0.1, 0.9, 0.5, 1.1, 0.12, mat_uni(lin(hexc('#d8d2c2')), 0.85), 0.5))
    for sx in (-0.33, 0.33): o.append(boite(sx, 0, 0.78, 0.03, 1.95, 0.04, mat_uni(lin(hexc('#d0d4d8')), 0.25, 1), 0.005))
    return o
brancard.n = 3

def frigo(v, rnd):
    c = ['#e8e6de', '#b8bcbe', '#e0cfa6', '#7a1e1e'][v % 4]
    o = [boite(0, 0, 0, 0.62, 0.65, 1.8, mat_uni(lin(hexc(c)), 0.25, 0.1 if v != 1 else 0.7), 0.04)]
    o.append(boite(0.25, -0.33, 1.1, 0.03, 0.03, 0.5, mat_uni(lin(hexc('#c8c8c8')), 0.2, 1), 0.01))
    if v % 2 == 0: o.append(boite(-0.1, -0.05, 1.8, 0.2, 0.15, 0.06, mat_uni(lin(hexc('#c84a2a')), 0.4), 0.02))   # un aimant, un carton dessus
    return o
frigo.n = 4

def lavabo(v, rnd):
    bl = mat_uni(lin(hexc('#f2f0ea')), 0.12)
    o = [cylindre(0, -0.05, 0, 0.12, 0.75, bl), boite(0, 0, 0.75, 0.56, 0.44, 0.14, bl, 0.07)]
    cu = boite(0, -0.02, 0.79, 0.42, 0.3, 0.12, mat_uni(lin(hexc('#c8ccce')), 0.1, 0.0), 0.06)
    o.append(cu)
    o.append(boite(0, 0.17, 0.89, 0.04, 0.12, 0.12, mat_uni(lin(hexc('#d8dadc')), 0.1, 1), 0.01))
    o.append(boite(0, 0.24, 0.89, 0.6, 0.04, 0.5, mat_uni(lin(hexc('#dfe6e8')), 0.08, 0.2), 0.0))   # miroir / crédence
    return o
lavabo.n = 2

def wc(v, rnd):
    bl = mat_uni(lin(hexc('#f4f2ec')), 0.1)
    o = [boite(0, 0.22, 0.4, 0.42, 0.18, 0.42, bl, 0.04)]                          # réservoir (au mur)
    cuv = sphere(0, -0.05, 0.38, 0.22, bl, 1.0); cuv.scale = (0.85, 1.25, 0.9); o.append(cuv)
    o.append(cylindre(0, -0.05, 0, 0.13, 0.36, bl))
    ab = sphere(0, -0.06, 0.48, 0.2, mat_uni(lin(hexc(['#f8f6f0', '#d8d8d0'][v % 2])), 0.15), 0.12); ab.scale = (0.9, 1.25, 0.15); o.append(ab)
    return o
wc.n = 2

def baignoire(v, rnd):
    bl = mat_uni(lin(hexc('#f0eee6')), 0.1)
    o = [boite(0, 0, 0, 0.75, 1.65, 0.55, bl, 0.12)]
    o.append(boite(0, -0.02, 0.2, 0.6, 1.48, 0.4, mat_uni(lin(hexc('#c9cfd1')), 0.08), 0.18))
    o.append(boite(0, 0.72, 0.55, 0.08, 0.12, 0.08, mat_uni(lin(hexc('#d8dadc')), 0.1, 1), 0.01))
    if v == 1: o.append(boite(0, -0.1, 0.3, 0.56, 1.3, 0.12, mat_uni(lin(hexc('#3a4a40')), 0.05), 0.05))   # eau croupie
    return o
baignoire.n = 2

def comptoir(v, rnd):
    L = 2.3
    corps = boite(0, 0.02, 0, L, 0.62, 1.0, bois(v + 1) if v != 2 else mat_uni(lin(hexc('#b8b0a2')), 0.6), 0.02)
    dessus = boite(0, 0, 1.0, L + 0.06, 0.7, 0.05, [mat_tex('marble_01', 1.0), mat_uni(lin(hexc('#8a8a8c')), 0.25, 0.95), mat_tex('granite_tile', 1.0)][v % 3], 0.01)
    o = [corps, dessus]
    if v == 0 and rnd.random() < 1: o += poser_dessus([dessus], ['CashRegister_01'], rnd, 1, zone=(-L / 2 + 0.2, -0.3, -L / 2 + 0.8, 0.3), tourner=False)
    o += poser_dessus([dessus], PROPS_TABLE, rnd, 2)
    return o
comptoir.n = 3

def cuisine(v, rnd):
    L = 2.3
    caisson = mat_tex(['kitchen_wood', 'wood_cabinet_worn_long', 'white_planks_clean'][v % 3], 1.0)
    plan = [mat_tex('granite_tile_02', 1.0), mat_tex('marble_01', 1.0), mat_uni(lin(hexc('#c8b898')), 0.4)][v % 3]
    o = [boite(0, 0.02, 0, L, 0.6, 0.88, caisson, 0.01), boite(0, 0, 0.88, L + 0.04, 0.64, 0.04, plan, 0.005)]
    # évier (inox) et plaques (noires) à des places qui changent
    pe = [-0.6, 0.55, -0.1][v % 3]; pp = [0.6, -0.6, 0.75][v % 3]
    o.append(boite(pe, 0, 0.86, 0.55, 0.42, 0.08, mat_uni(lin(hexc('#b8bcc0')), 0.2, 1), 0.02))
    o.append(boite(pe, 0.02, 0.84, 0.46, 0.34, 0.1, mat_uni(lin(hexc('#8a8e92')), 0.25, 1), 0.04))
    o.append(boite(pe, 0.26, 0.92, 0.04, 0.12, 0.2, mat_uni(lin(hexc('#d0d2d4')), 0.1, 1), 0.01))
    o.append(boite(pp, -0.02, 0.92, 0.58, 0.52, 0.015, mat_uni(lin(hexc('#121212')), 0.08), 0.005))
    for dx in (-0.14, 0.14):
        for dy in (-0.13, 0.12): o.append(cylindre(pp + dx, -0.02 + dy, 0.935, 0.09 if dy > 0 else 0.07, 0.004, mat_uni(lin(hexc('#2a2a2a')), 0.4)))
    o += poser_dessus(o[:2], ['pot_enamel_01', 'jug_01', 'wooden_cutting_board', 'brass_pan_01', 'ceramic_pot', 'wine_bottles_01'], rnd, 2,
                      zone=(-L / 2 + 0.05, -0.25, L / 2 - 0.05, 0.28))
    return o
cuisine.n = 3

def caisse_enreg(v, rnd): return importer_ph('CashRegister_01')
caisse_enreg.n = 1

def vitrine_frigo(v, rnd):
    L = 2.3
    o = [boite(0, 0, 0, L, 0.85, 0.85, mat_uni(lin(hexc('#e8eae8')), 0.3, 0.2), 0.03)]
    o.append(boite(0, -0.05, 0.6, L - 0.1, 0.7, 0.2, mat_uni(lin(hexc('#2a3640')), 0.2), 0.02))
    vit = boite(0, -0.08, 0.85, L - 0.12, 0.62, 0.02, mat_uni(lin(hexc('#c8dce4')), 0.02, 0.0, verre=True), 0.0)
    o.append(vit)
    if v == 0: o += poser_dessus([o[1]], ['russian_food_cans_01', 'long_life_food', 'cheese_box' if False else 'CheeseBox_01'], rnd, 4)
    return o
vitrine_frigo.n = 2

def casier(v, rnd):
    c = ['#5a6a72', '#6a6e5a', '#7a5a4a', '#8a8e90'][v % 4]
    o = [boite(0, 0, 0, 0.6, 0.55, 1.9, mat_uni(lin(hexc(c)), 0.45, 0.6), 0.015)]
    for k in range(6): o.append(boite(0, -0.28, 1.6 + k * 0.03, 0.4, 0.01, 0.01, mat_uni(lin(hexc('#1a1a1a')), 0.6), 0.0))
    return o
casier.n = 4

def classeur(v, rnd):
    o = [boite(0, 0, 0, 0.5, 0.62, 1.3, mat_uni(lin(hexc(['#6a6e70', '#8a8478', '#4a5a4a'][v % 3])), 0.4, 0.7), 0.012)]
    o += poser_dessus(o, ['binder_notebook', 'office_notepads', 'clipboard'], rnd, 1)
    return o
classeur.n = 3

def machine(v, rnd):
    if v == 0:   # lave-linge (vu de dessus : le couvercle)
        o = [boite(0, 0, 0, 0.6, 0.6, 0.85, mat_uni(lin(hexc('#ecebe6')), 0.25), 0.03)]
        o.append(boite(0, 0.22, 0.85, 0.56, 0.12, 0.02, mat_uni(lin(hexc('#c8c8c4')), 0.3), 0.01))
        o.append(cylindre(0.18, 0.22, 0.86, 0.03, 0.02, mat_uni(lin(hexc('#3a3a3a')), 0.3)))
        return o
    if v == 1:   # distributeur de boissons
        o = [boite(0, 0, 0, 0.9, 0.8, 1.85, mat_uni(lin(hexc('#a8201c')), 0.35, 0.1), 0.02)]
        o.append(boite(0, -0.05, 1.85, 0.8, 0.6, 0.01, mat_uni(lin(hexc('#202020')), 0.5), 0.0))
        return o
    o = [boite(0, 0, 0, 0.75, 0.6, 1.05, mat_uni(lin(hexc('#c8c6c0')), 0.4), 0.03)]      # photocopieuse
    o.append(boite(0, 0, 1.05, 0.55, 0.42, 0.04, mat_uni(lin(hexc('#2a2c2e')), 0.2), 0.01))
    return o
machine.n = 3

def televiseur(v, rnd):
    if v < 2: return importer_ph(['Television_01', 'television_02'][v])
    o = [boite(0, 0, 0, 1.0, 0.4, 0.45, bois(2), 0.02), boite(0, 0.05, 0.45, 0.95, 0.06, 0.6, mat_uni(lin(hexc('#0e0e0e')), 0.15), 0.01)]
    return o
televiseur.n = 3

def piano(v, rnd):
    o = [boite(0, 0.05, 0, 1.5, 0.6, 1.25, mat_uni(lin(hexc(['#0c0b0b', '#3a2416'][v % 2])), 0.12), 0.02)]
    o.append(boite(0, -0.33, 0.7, 1.4, 0.25, 0.06, mat_uni(lin(hexc(['#0c0b0b', '#3a2416'][v % 2])), 0.15), 0.01))
    o += poser_dessus([o[0]], ['brass_candleholders', 'standing_picture_frame_02', 'ceramic_vase_03'], rnd, 2)
    return o
piano.n = 2

def cheminee(v, rnd):
    pierre = mat_tex(['old_stone_wall', 'white_sandstone_blocks_02', 'castle_brick_01'][v % 3], 1.2)
    o = [boite(0, 0.12, 0, 1.6, 0.5, 1.15, pierre, 0.02), boite(0, -0.1, 1.15, 1.8, 0.75, 0.08, mat_tex('marble_01'), 0.01)]
    o.append(boite(0, -0.35, 0, 1.3, 0.35, 0.04, pierre, 0.01))
    o.append(boite(0, -0.05, 0.02, 0.9, 0.3, 0.06, mat_uni(lin(hexc('#1a1612')), 0.9), 0.01))
    o += poser_dessus([o[1]], PROPS_COMMODE, rnd, 2)
    return o
cheminee.n = 3

def tapis(v, rnd):
    t = ['floral_jacquard', 'quatrefoil_jacquard_fabric', 'poly_wool_herringbone', 'fabric_pattern_07', 'curly_teddy_checkered', 'fabric_pattern_05'][v % 6]
    o = [boite(0, 0, 0, 2.3, 1.5, 0.012, mat_tex(t, 0.8), 0.003)]
    o.append(boite(0, 0, 0.012, 2.1, 1.3, 0.002, mat_tex(t, 1.6), 0.0))
    return o
tapis.n = 6

def banc_pierre(v, rnd):
    p = mat_tex('white_sandstone_blocks_02' if v else 'old_sandstone_02', 1.5)
    return [boite(0, 0, 0.4, 1.6, 0.45, 0.08, p, 0.02), boite(-0.6, 0, 0, 0.18, 0.4, 0.4, p, 0.01), boite(0.6, 0, 0, 0.18, 0.4, 0.4, p, 0.01)]

# ---------- véhicules ----------
def profil_extrude(pts, l, mats, belt, tumble=0.86, nom='caisse', galbe=0.07):
    """Carrosserie : profil latéral (x le long, z en haut) extrudé sur la largeur l ; le haut (z > belt) rentre un peu
    (tumblehome) ; les faces hautes non horizontales deviennent des vitres (matière 1), le toit reste peint."""
    import bpy, bmesh
    me = bpy.data.meshes.new(nom); o = bpy.data.objects.new(nom, me); bpy.context.scene.collection.objects.link(o)
    bm = bmesh.new()
    vs = [bm.verts.new((x, -l / 2, z)) for x, z in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, l, 0), verts=nv)
    x0 = min(x for x, z in pts); x1 = max(x for x, z in pts)
    for v in bm.verts:
        if v.co.z > belt: v.co.y *= tumble
        # vue de dessus : les bouts s'arrondissent (le pare-chocs est moins large que les portières)
        e = max(0.0, (abs(v.co.x - (x0 + x1) / 2) - ((x1 - x0) / 2 - 0.7)) / 0.7)
        v.co.y *= 1 - galbe * e * e
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    bv = o.modifiers.new('biseau', 'BEVEL'); bv.width = 0.06; bv.segments = 3; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(25)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.modifier_apply(modifier='biseau')
    for poly in me.polygons:
        c = sum((me.vertices[k].co for k in poly.vertices), __import__('mathutils').Vector()) / len(poly.vertices)
        if c.z > belt + 0.04 and abs(poly.normal.z) < 0.9: poly.material_index = 1
    sd = o.modifiers.new('sub', 'SUBSURF'); sd.levels = 1; sd.render_levels = 2
    bpy.ops.object.shade_smooth()
    return o

def roues(L, l, xs, r=0.31, larg=0.21):
    noir = mat_uni(lin(hexc('#151515')), 0.75); jante = mat_uni(lin(hexc('#9a9a9a')), 0.3, 1)
    o = []
    for x in xs:
        for sy in (-1, 1):
            y = sy * (l / 2 - larg / 2 - 0.02)
            w = cylindre(x, y, 0, r, larg, noir, 24); w.rotation_euler.x = math.pi / 2; w.location = (x, y, r); o.append(w)
    return o

def peinture(c, metal=0.55): return mat_uni(lin(hexc(c)), 0.22, metal)
VITRE = None
def vitre():
    return mat_uni(lin(hexc('#16222a')), 0.04, 0.3)

def phares(L, l, z, avant=True):
    o = []
    for sy in (-1, 1):
        o.append(boite(L / 2 - 0.02 if avant else -L / 2 + 0.02, sy * (l / 2 - 0.25), z, 0.06, 0.28, 0.12, mat_uni(lin(hexc('#f2f0e4' if avant else '#a01010')), 0.05), 0.02))
    return o

COUL_VOITURES = ['#5a1e1e', '#1e2e4a', '#3a3a3a', '#b8b4a8', '#2a4a3a', '#6a5a3a', '#8a8a86', '#1a1a1a']
def voiture(v, rnd):
    c = COUL_VOITURES[v % len(COUL_VOITURES)]
    L, l = 4.1, 1.76
    if v % 2 == 0:   # berline
        pts = [(-2.05, 0.28), (-2.05, 0.78), (-1.9, 0.9), (-1.45, 0.95), (-1.05, 1.38), (0.3, 1.43), (0.95, 0.98), (1.9, 0.84), (2.05, 0.62), (2.05, 0.28)]
    else:            # citadine (hayon)
        pts = [(-2.05, 0.28), (-2.05, 0.95), (-1.85, 1.38), (0.25, 1.45), (0.95, 1.0), (1.9, 0.84), (2.05, 0.62), (2.05, 0.28)]
    o = [profil_extrude(pts, l, [peinture(c), vitre()], 0.97)]
    o += roues(L, l, (-1.3, 1.3))
    o += phares(L, l * 0.86, 0.62) + phares(L, l * 0.86, 0.75, avant=False)
    for sy in (-1, 1): o.append(boite(0.85, sy * (l / 2 + 0.06), 0.95, 0.12, 0.14, 0.09, peinture(c), 0.02))   # rétroviseurs
    if v % 4 == 3: o.append(coussin(-0.4, 0, 1.43, 0.9, 1.0, 0.03, mat_tex('rough_linen', 1.2, teinte=lin(hexc('#b8b0a0'))), 0.4))   # un drap jeté sur le toit
    if v % 3 == 1:   # des feuilles mortes sur le capot
        for k in range(8): o.append(sphere(1.2 + (rnd.random() - 0.5) * 1.0, (rnd.random() - 0.5) * 1.2, 0.93, 0.05, mat_uni(lin(hexc(['#8a5a22', '#a8782a', '#6a4a1a'][k % 3])), 0.8), 0.15))
    return o
voiture.n = 8
voiture.couleurs = COUL_VOITURES

def camionnette(v, rnd):
    c = ['#e8e6e0', '#3a4a5a', '#7a2a1a'][v % 3]
    L, l = 5.0, 1.95
    pts = [(-2.5, 0.3), (-2.5, 2.05), (1.25, 2.05), (1.7, 1.25), (2.4, 1.0), (2.5, 0.7), (2.5, 0.3)]
    o = [profil_extrude(pts, l, [peinture(c, 0.3), vitre()], 1.05, tumble=0.97)]
    # les vitres : seulement la cabine (le caisson est tôlé)
    me = o[0].data
    for poly in me.polygons:
        cc = sum((me.vertices[k].co for k in poly.vertices), __import__('mathutils').Vector()) / len(poly.vertices)
        if cc.x < 1.0: poly.material_index = 0
    o += roues(L, l, (-1.6, 1.6), 0.34, 0.23) + phares(L, l, 0.75)
    if v == 0:
        for sy in (-0.65, 0.65): o.append(boite(-0.6, sy, 2.08, 2.8, 0.05, 0.05, mat_uni(lin(hexc('#2a2a2a')), 0.5, 0.6), 0.01))   # galerie
    return o
camionnette.n = 3

def ambulance(v, rnd):
    L, l = 5.4, 2.0
    pts = [(-2.7, 0.3), (-2.7, 2.35), (1.3, 2.35), (1.75, 1.3), (2.6, 1.05), (2.7, 0.7), (2.7, 0.3)]
    o = [profil_extrude(pts, l, [peinture('#ecebe4', 0.2), vitre()], 1.1, tumble=0.98)]
    me = o[0].data
    for poly in me.polygons:
        cc = sum((me.vertices[k].co for k in poly.vertices), __import__('mathutils').Vector()) / len(poly.vertices)
        if cc.x < 1.1: poly.material_index = 0
    o += roues(L, l, (-1.8, 1.7), 0.34, 0.23) + phares(L, l, 0.8)
    for k in range(6): o.append(boite(-2.4 + k * 0.7, 0, 2.38, 0.35, 1.72, 0.005, mat_uni(lin(hexc('#2a5ac8' if k % 2 else '#e8c020')), 0.4), 0.0))
    o.append(boite(1.05, 0, 2.38, 0.28, 1.3, 0.12, mat_uni(lin(hexc('#3060ff')), 0.2, 0, emission=(0.2, 0.4, 1.0, 2.0)), 0.03))
    return o
ambulance.n = 1

def camion_mil(v, rnd):
    kaki = '#4a5236'
    L, l = 6.4, 2.35
    cab = [(1.6, 0.6), (1.6, 2.2), (2.25, 2.2), (2.55, 1.45), (3.2, 1.3), (3.2, 0.6)]
    o = [profil_extrude(cab, l * 0.98, [peinture(kaki, 0.2), vitre()], 1.5, tumble=0.97)]
    plateau = boite(-0.8, 0, 0.75, 4.6, l, 0.35, peinture(kaki, 0.2), 0.03)
    bache = coussin(-0.85, 0, 1.1, 4.5, l - 0.05, 1.35, mat_tex('hessian_230', 0.5, teinte=lin(hexc('#7a7e5a'))) if v else mat_uni(lin(hexc('#585c3c')), 0.9), 0.12)
    o += [plateau, bache]
    for k in range(5): o.append(cylindre(-2.9 + k * 1.05, 0, 2.38, 0.03, l - 0.02, mat_uni(lin(hexc('#3a3e2a')), 0.8), 8))
    for c in o[-5:]: c.rotation_euler.x = math.pi / 2; c.location.z = 2.42
    o += roues(L, l, (-2.0, -0.9, 2.3), 0.5, 0.32)
    for x in [o[0]]: x.location.x -= 0.0
    o.append(boite(2.3, 0, 2.22, 0.4, 0.4, 0.14, mat_uni(lin(hexc('#ff2010')), 0.2, 0, emission=(1, 0.1, 0.05, 1.5)), 0.03))
    return o
camion_mil.n = 2

# ---------- ville, extérieur ----------
def benne(v, rnd):
    vert = mat_uni(lin(hexc(['#2c4a2e', '#3a4a5a', '#6a5a2a'][v % 3])), 0.5, 0.6)
    o = [boite(0, 0, 0.1, 1.8, 1.05, 1.1, vert, 0.03)]
    for sx in (-0.45, 0.45): o.append(boite(sx, 0.02, 1.2, 0.86, 1.0, 0.05, mat_uni(lin(hexc('#222624')), 0.6), 0.02))
    if v == 2: o += poser_dessus(o[:1], ['trashbag'], rnd, 2)
    return o
benne.n = 3

def poubelle(v, rnd):
    if v == 0: return importer_ph('metal_trash_can')
    if v == 3: return importer_ph('trashbag')
    c = ['#2a5a2a', '#4a4a4c'][v % 2]
    o = [boite(0, 0, 0, 0.55, 0.6, 1.0, mat_uni(lin(hexc(c)), 0.55), 0.04), boite(0, 0.02, 1.0, 0.6, 0.66, 0.05, mat_uni(lin(hexc(c)), 0.5), 0.02)]
    return o
poubelle.n = 4

def borne(v, rnd):
    if v == 0:   # borne en fonte (centre ancien)
        f = mat_uni(lin(hexc('#2a2c2a')), 0.45, 0.8)
        return [cylindre(0, 0, 0, 0.12, 0.8, f), sphere(0, 0, 0.8, 0.13, f)]
    return [cylindre(0, 0, 0, 0.11, 0.9, mat_uni(lin(hexc('#d8d4c8')), 0.5)), cylindre(0, 0, 0.7, 0.115, 0.06, mat_uni(lin(hexc('#c02020')), 0.4))]
borne.n = 2

def poteau(v, rnd):
    return [cylindre(0, 0, 0, 0.13, 6, mat_tex('rough_wood', 1) if v == 0 else mat_uni(lin(hexc('#8a8a8a')), 0.5, 0.7)),
            boite(0, 0, 5.6, 1.2, 0.1, 0.1, mat_uni(lin(hexc('#3a2a1a')), 0.7), 0.01)]
poteau.n = 2

def barriere(v, rnd):
    if v == 0: return importer_ph('concrete_road_barrier')
    # barrière « Vauban » (grilles de foule)
    m = mat_uni(lin(hexc('#c8ccd0')), 0.35, 0.95)
    o = [boite(0, 0, 0.1, 1.95, 0.05, 0.04, m, 0.005), boite(0, 0, 1.05, 1.95, 0.05, 0.04, m, 0.005)]
    for k in range(13): o.append(cylindre(-0.9 + k * 0.15, 0, 0.1, 0.012, 0.96, m, 8))
    for sx in (-0.95, 0.95): o.append(boite(sx, 0, 0, 0.06, 0.55, 0.04, m, 0.005))
    return o
barriere.n = 2

def sacs_sable(v, rnd):
    h = mat_tex('hessian_230', 2.0)
    o = []
    for r in range(2):
        for k in range(3):
            s = coussin(-0.55 + k * 0.55 + (0.27 if r else 0) - (0.27 if r and k == 2 else 0), (rnd.random() - 0.5) * 0.06, r * 0.2, 0.58, 0.36, 0.22, h, 0.48)
            s.rotation_euler.z = (rnd.random() - 0.5) * 0.18; o.append(s)
    return o
sacs_sable.n = 2

def palette(v, rnd):
    b = mat_tex('weathered_planks', 2.0)
    o = []
    for k in range(5): o.append(boite(0, -0.5 + k * 0.25, 0.1, 1.2, 0.12, 0.02, b, 0.003))
    for sx in (-0.5, 0, 0.5): o.append(boite(sx, 0, 0, 0.1, 1.0, 0.1, b, 0.003))
    if v == 1: o += poser_dessus(o, ['cardboard_box_01', 'cement_bag', 'compost_bags'], rnd, 2, marge=0.05)
    if v == 2: o += poser_dessus(o, ['wooden_crate_01'], rnd, 1, marge=0.05)
    return o
palette.n = 3

def fut(v, rnd):
    if v < 2: return importer_ph(['Barrel_01', 'barrel_03'][v])
    return [cylindre(0, 0, 0, 0.29, 0.9, mat_uni(lin(hexc('#1e4aa0')), 0.4), biseau=0.02)]
fut.n = 3

def generateur(v, rnd): return importer_ph('portable_generator')
generateur.n = 1

def conteneur(v, rnd):
    c = ['#8a2a1e', '#2a4a6a', '#5a6a3a', '#a07a2a'][v % 4]
    m = mat_tex('container_side', 0.5, teinte=lin(hexc(c)))
    o = [boite(0, 0, 0, 6.05, 2.44, 2.6, m, 0.02)]
    o.append(boite(0, 0, 2.6, 5.9, 2.3, 0.02, mat_tex('rusty_metal_sheet', 0.5, teinte=lin(hexc(c))), 0.0))
    return o
conteneur.n = 4

def prisme(pts, l, mat, nom='prisme'):
    """Profil (x, z) extrudé sur l (y), centré."""
    import bpy, bmesh
    me = bpy.data.meshes.new(nom); o = bpy.data.objects.new(nom, me); bpy.context.scene.collection.objects.link(o)
    bm = bmesh.new(); vs = [bm.verts.new((x, -l / 2, z)) for x, z in pts]; f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, l, 0), verts=nv); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.materials.append(mat)
    return o
def tente(v, rnd):
    t = mat_tex('hessian_380', 0.8, teinte=lin(hexc(['#7a8058', '#f0eee6', '#5a7a9a'][v % 3])))
    o = [prisme([(-1.15, 0), (0, 1.7), (1.15, 0)], 2.3, t, 'toile')]
    o.append(cylindre(0, 0, 1.68, 0.03, 2.4, mat_uni(lin(hexc('#5a5a5a')), 0.5, 0.8), 8))
    o[-1].rotation_euler.x = math.pi / 2; o[-1].location = (0, 0, 1.7)
    for sy in (-1.25, 1.25):
        for sx in (-1.3, 1.3): o.append(cylindre(sx, sy, 0, 0.02, 0.15, mat_uni(lin(hexc('#8a8a8a')), 0.4, 1), 6))
    if v == 1:
        o.append(boite(0.62, 0, 0.88, 0.04, 0.6, 0.18, mat_uni(lin(hexc('#c02020')), 0.5), 0.005)); o[-1].rotation_euler.y = -0.6
        o.append(boite(0.62, 0, 0.88, 0.04, 0.18, 0.6, mat_uni(lin(hexc('#c02020')), 0.5), 0.005)); o[-1].rotation_euler.y = -0.6
    return o
tente.n = 3

def fontaine(v, rnd):
    """Fontaine de Provence : bassin rond de pierre, colonne, mousse (la Fontaine Moussue…)."""
    p = mat_tex('old_sandstone_02' if v == 0 else 'white_sandstone_blocks_02', 1.2)
    o = [cylindre(0, 0, 0, 0.78, 0.55, p, 48, biseau=0.04), cylindre(0, 0, 0.35, 0.68, 0.22, mat_uni(lin(hexc('#2e4046')), 0.04), 48)]
    if v == 0:
        mousse = mat_uni(lin(hexc('#6e8c3e')), 0.95)
        champ = sphere(0, 0, 0.9, 0.42, mousse, 0.7); o.append(champ); o.append(cylindre(0, 0, 0.3, 0.2, 0.6, mousse))
    else:
        o.append(cylindre(0, 0, 0.3, 0.12, 1.1, p)); o.append(sphere(0, 0, 1.45, 0.2, p))
    return o
fontaine.n = 2

def statue(v, rnd):
    socle = boite(0, 0, 0, 0.7, 0.7, 1.0, mat_tex('white_sandstone_blocks_02', 1.5), 0.02)
    s = importer_ph(['gothic_statue', 'marble_bust_01'][v % 2])
    g = A.regrouper(s); import bpy; bpy.context.view_layer.update()
    a, b = A.bornes(s); k = 0.6 / max(b.x - a.x, b.y - a.y, 1e-3)
    g.scale = (k, k, k); bpy.context.view_layer.update(); a, b = A.bornes(s)
    g.location.x -= (a.x + b.x) / 2; g.location.y -= (a.y + b.y) / 2; g.location.z += 1.0 - a.z
    return [socle] + s
statue.n = 2

def gravats(v, rnd):
    import bpy
    o = []
    beton = mat_tex('concrete_debris' if False else 'broken_brick_wall', 1.0)
    for k in range(9):
        s = 0.12 + rnd.random() * 0.25
        b = boite((rnd.random() - 0.5) * 0.6, (rnd.random() - 0.5) * 0.6, 0, s, s * (0.6 + rnd.random()), s * 0.6, [beton, mat_tex('red_brick', 2.0), mat_tex('concrete', 1)][k % 3], 0.02)
        b.rotation_euler = (rnd.random() * 0.6, rnd.random() * 0.6, rnd.random() * 3); o.append(b)
    try: o += importer_ph('namaqualand_stones_01')[:1]
    except Exception: pass
    return o
gravats.n = 3

def debris(v, rnd):
    o = []
    for k in range(7):
        p = boite((rnd.random() - 0.5) * 0.6, (rnd.random() - 0.5) * 0.6, 0, 0.18 + rnd.random() * 0.1, 0.22, 0.003, mat_uni(lin(hexc(['#e8e2d0', '#c8c0aa', '#d8d0bc'][k % 3])), 0.9), 0.0)
        p.rotation_euler.z = rnd.random() * 3; o.append(p)
    for pid in ['can_rusted', 'cigarette_pack', 'dry_branches_medium_01'][: 2 + v % 2]:
        try:
            ps = importer_ph(pid); g = A.regrouper(ps); g.location = ((rnd.random() - 0.5) * 0.5, (rnd.random() - 0.5) * 0.5, 0); g.rotation_euler.z = rnd.random() * 6
            if pid == 'dry_branches_medium_01': g.scale = (0.4, 0.4, 0.4)
            o += ps
        except Exception as e: print(e)
    return o
debris.n = 3

# ---------- végétaux ----------
BUISSONS = ['shrub_02:shrub_02_a', 'shrub_02:shrub_02_b', 'shrub_02:shrub_02_c', 'wild_rooibos_bush:wild_rooibos_bush_a', 'searsia_lucida:searsia_lucida_c', 'fern_02:fern_02_b']
def buisson(v, rnd): return importer_ph(BUISSONS[v % len(BUISSONS)])
buisson.n = 6
def roncier(v, rnd):
    o = importer_ph(['wild_rooibos_bush:wild_rooibos_bush_a', 'shrub_02:shrub_02_d'][v % 2])
    for k in range(14): o.append(sphere((rnd.random() - 0.5) * 0.7, (rnd.random() - 0.5) * 0.7, 0.4 + rnd.random() * 0.4, 0.025, mat_uni(lin(hexc('#1a0a1e')), 0.25)))
    return o
roncier.n = 2
def cannier(v, rnd):
    o = []
    tige = mat_uni(lin(hexc('#a8a060')), 0.5); feuille = mat_uni(lin(hexc('#7a8a48')), 0.6)
    for k in range(26):
        x, y = (rnd.random() - 0.5) * 0.7, (rnd.random() - 0.5) * 0.7
        c = cylindre(x, y, 0, 0.012, 2.2 + rnd.random(), tige, 6); c.rotation_euler = ((rnd.random() - 0.5) * 0.3, (rnd.random() - 0.5) * 0.3, 0); o.append(c)
        f = boite(x, y, 1.6 + rnd.random() * 1.2, 0.5, 0.04, 0.005, feuille, 0); f.rotation_euler = ((rnd.random() - 0.5) * 0.6, 0.3, rnd.random() * 6.3); o.append(f)
    return o
cannier.n = 2
def haie(v, rnd):
    return importer_ph(['shrub_02:shrub_02_b', 'searsia_lucida:searsia_lucida_b'][v % 2])
haie.n = 2
def souche(v, rnd): return importer_ph(['tree_stump_01', 'tree_stump_02'][v % 2])
souche.n = 2

def tronc(coul_ecorce, r=0.18):
    def f(v, rnd):
        return [cylindre(0, 0, 0, r * (0.9 + 0.2 * v), 1.2, mat_tex(coul_ecorce, 2.0), 12)]
    f.n = 2
    return f

# ---------- cimetière, église, morgue ----------
GRANITS = ['granite_tile', 'granite_tile_03', 'marble_01', 'old_sandstone_02', 'granite_tile_04']
def tombe(v, rnd, croix=False):
    g = mat_tex(GRANITS[v % len(GRANITS)], 0.8)
    o = [boite(0, -0.1, 0, 0.78, 1.7, 0.22, g, 0.015), boite(0, -0.12, 0.22, 0.68, 1.55, 0.06, g, 0.02)]
    st = boite(0, 0.78, 0, 0.7, 0.14, 0.85 if not croix else 0.6, g, 0.02); o.append(st)
    if croix:
        o.append(boite(0, 0.78, 0.6, 0.09, 0.08, 0.55, g, 0.01)); o.append(boite(0, 0.78, 0.95, 0.38, 0.08, 0.09, g, 0.01))
    if v % 2 == 0:   # fleurs, plaque, vase
        try: o += poser_dessus(o[1:2], ['planter_pot_clay', 'brass_vase_02', 'ceramic_vase_04'], rnd, 1, zone=(-0.25, -0.7, 0.25, 0.4))
        except Exception: pass
        for k in range(7): o.append(sphere((rnd.random() - 0.5) * 0.4, 0.45 + (rnd.random() - 0.5) * 0.2, 0.3, 0.05, mat_uni(lin(hexc(['#c02a3a', '#e8d040', '#f0f0e8', '#8a3aa0'][k % 4])), 0.6)))
    if v == 3: o.append(boite(0, -0.1, 0.28, 0.5, 0.9, 0.01, mat_tex('forest_ground_05', 2, teinte=lin(hexc('#6a7a3a'))), 0.0))  # mousse
    return o
def tombe_simple(v, rnd): return tombe(v, rnd)
tombe_simple.n = 5
def tombe_croix(v, rnd): return tombe(v + 1, rnd, croix=True)
tombe_croix.n = 4
def stele(v, rnd):
    g = mat_tex(GRANITS[(v + 2) % len(GRANITS)], 0.8)
    o = [boite(0, 0.1, 0, 0.6, 0.18, 0.9, g, 0.02), boite(0, 0.1, 0, 0.75, 0.32, 0.12, g, 0.01)]
    if v == 1: o.append(boite(0, 0.1, 0.9, 0.12, 0.12, 0.3, g, 0.01))
    return o
stele.n = 3
def caveau(v, rnd):
    p = mat_tex(['old_sandstone_02', 'white_sandstone_blocks_02', 'granite_wall'][v % 3], 1.0)
    o = [boite(0, 0, 0, 1.55, 1.55, 1.3, p, 0.02)]
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.15, radius2=0.05, depth=0.5, location=(0, 0, 1.55))
    t = bpy.context.active_object; t.rotation_euler.z = math.pi / 4; t.data.materials.append(mat_tex('grey_roof_tiles', 1.0)); o.append(t)
    o.append(boite(0, 0, 1.75, 0.08, 0.08, 0.45, p, 0.01)); o.append(boite(0, 0, 1.95, 0.32, 0.08, 0.08, p, 0.01))
    return o
caveau.n = 3
def cercueil(v, rnd):
    b = mat_tex(['lacquered_cherry_wood', 'dark_wood', 'oak_veneer_01'][v % 3], 1.0)
    import bpy, bmesh
    o = coussin(0, 0, 0, 0.62, 1.95, 0.5, b, 0.06)
    o.scale = (1, 1, 1)
    c = boite(0, 0, 0.5, 0.66, 1.98, 0.08, b, 0.03)
    res = [o, c]
    res.append(boite(0, 0.5, 0.58, 0.1, 0.3, 0.01, mat_uni(lin(hexc('#c8a050')), 0.3, 1), 0.0))   # croix dorée sur le couvercle
    res.append(boite(0, 0.55, 0.58, 0.22, 0.08, 0.01, mat_uni(lin(hexc('#c8a050')), 0.3, 1), 0.0))
    for sx in (-0.34, 0.34):
        for sy in (-0.6, 0, 0.6): res.append(boite(sx, sy, 0.25, 0.04, 0.16, 0.03, mat_uni(lin(hexc('#c8a050')), 0.3, 1), 0.005))
    return res
cercueil.n = 3
def housse(v, rnd):
    m = mat_uni(lin(hexc(['#121314', '#e8e8e4', '#d8d8d0'][v % 3])), 0.25)
    o = [coussin(0, 0, 0, 0.62, 1.9, 0.16, m, 0.45)]
    o.append(coussin(0, 0.62, 0.1, 0.32, 0.38, 0.12, m, 0.5))                  # la tête sous le plastique
    o.append(coussin(0, -0.1, 0.1, 0.5, 0.9, 0.1, m, 0.5))                    # le torse
    o.append(boite(0.15, 0, 0.18, 0.015, 1.7, 0.01, mat_uni(lin(hexc('#8a8a8a')), 0.3, 1), 0.0))   # la fermeture éclair
    if v == 1: o.append(boite(-0.12, 0.3, 0.22, 0.18, 0.12, 0.002, mat_uni(lin(hexc('#e8c030')), 0.5), 0))  # étiquette
    return o
housse.n = 3
def autel(v, rnd):
    p = mat_tex('white_sandstone_blocks_02', 1.0)
    o = [boite(0, 0, 0, 2.2, 0.75, 1.0, p, 0.02), boite(0, -0.02, 1.0, 2.3, 0.8, 0.02, mat_uni(lin(hexc('#f0ece0')), 0.85), 0.005)]
    o += poser_dessus([o[1]], ['brass_candleholders', 'wooden_candlestick', 'brass_goblets'], rnd, 3)
    return o
autel.n = 1
def prie_dieu(v, rnd):
    b = bois(v + 1)
    o = [boite(0, 0, 0.42, 2.2, 0.4, 0.05, b, 0.01), boite(0, 0.22, 0.42, 2.2, 0.05, 0.5, b, 0.01), boite(0, -0.3, 0.75, 2.2, 0.18, 0.04, b, 0.01)]
    for sx in (-1.08, 1.08): o.append(boite(sx, 0, 0, 0.06, 0.75, 0.95, b, 0.01))
    return o
prie_dieu.n = 2
def cloche(v, rnd):
    br = mat_uni(lin(hexc('#8a6a32')), 0.35, 1.0)
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.75, radius2=0.42, depth=1.1, location=(0, 0, 0.55))
    c = bpy.context.active_object; c.data.materials.append(br); bpy.ops.object.shade_smooth()
    return [c, sphere(0, 0, 1.15, 0.42, br, 0.5), boite(0, 0, 1.3, 1.6, 0.15, 0.18, bois(1), 0.02)]
cloche.n = 1
def pilier(v, rnd):
    p = mat_tex(['white_sandstone_blocks_02', 'old_sandstone_02'][v % 2], 1.0)
    return [boite(0, 0, 0, 0.72, 0.72, 0.2, p, 0.02), cylindre(0, 0, 0.2, 0.3, 4, p, 32), boite(0, 0, 4.2, 0.72, 0.72, 0.25, p, 0.02)]
pilier.n = 2
def treteau(v, rnd):
    """Tréteaux de la morgue de fortune : un plateau sur deux chevalets, un sachet scellé dessus."""
    b = bois(3)
    o = [boite(0, 0, 0.75, 1.5, 0.6, 0.04, b, 0.005)]
    for sx in (-0.6, 0.6): o.append(boite(sx, 0, 0, 0.06, 0.55, 0.75, b, 0.005))
    s = coussin(-0.2, 0.05, 0.79, 0.32, 0.24, 0.05, mat_uni(lin(hexc('#dcdcd2')), 0.2), 0.4); o.append(s)
    o.append(boite(-0.2, 0.17, 0.83, 0.3, 0.03, 0.01, mat_uni(lin(hexc('#c02020')), 0.4), 0))   # scellé rouge
    o += poser_dessus(o[:1], ['clipboard', 'medical_box', 'medical_tape'], rnd, 2, zone=(0.05, -0.25, 0.7, 0.25))
    return o
treteau.n = 1
def chariot(v, rnd):
    inox = mat_uni(lin(hexc('#c4c8cc')), 0.25, 1.0)
    o = [boite(0, 0, 0.8, 0.7, 1.9, 0.03, inox, 0.01), boite(0, 0, 0.25, 0.65, 1.85, 0.02, inox, 0.005)]
    for sx in (-0.3, 0.3):
        for sy in (-0.88, 0.88): o.append(cylindre(sx, sy, 0, 0.018, 0.8, inox, 8))
    if v == 1: o += [coussin(0, 0, 0.83, 0.6, 1.8, 0.14, mat_uni(lin(hexc('#121314')), 0.25), 0.45)]
    return o
chariot.n = 2
def etabli_meuble(v, rnd):
    b = mat_tex('rough_wood', 1.0)
    o = [boite(0, 0, 0.85, 2.2, 0.75, 0.07, b, 0.01)]
    for sx in (-1.0, 1.0):
        for sy in (-0.3, 0.3): o.append(boite(sx, sy, 0, 0.08, 0.08, 0.85, b, 0.005))
    o.append(boite(0, 0, 0.2, 2.1, 0.7, 0.03, b, 0.005))
    o += poser_dessus(o[:1], ['bench_vice_01', 'wooden_hammer_01', 'handsaw_wood', 'metal_toolbox', 'measuring_tape_01', 'hand_plane_no4', 'flathead_screwdriver', 'pliers'], rnd, 4)
    return o
etabli_meuble.n = 2
def couronne(v, rnd):
    o = []
    for k in range(18):
        a = k / 18 * 6.283
        o.append(sphere(math.cos(a) * 0.32, math.sin(a) * 0.32, 0.08, 0.09, mat_uni(lin(hexc(['#2a4a24', '#3a5a2a', '#e8e0d0', '#c02a3a'][k % 4])), 0.7)))
    return o
couronne.n = 1

# ---------- constructions du joueur (js/data/construction.js, dessin) ----------
def planche_m(v=0): return mat_tex(['weathered_planks', 'brown_planks_04', 'old_planks_02'][v % 3], 1.5)
def clou_m(): return mat_uni(lin(hexc('#9a9a9a')), 0.3, 1)
def mur_planches(v, rnd):
    o = []
    for k in range(4):   # quatre planches de chant, serrées, qui ferment la case
        p = boite(0, -0.3 + k * 0.2, 0, 0.84, 0.17, 1.9 + rnd.random() * 0.1, planche_m(k + v), 0.012); p.rotation_euler.z = (rnd.random() - 0.5) * 0.04; o.append(p)
    for sx in (-0.34, 0.34):
        for sy in (-0.36, 0.36): o.append(boite(sx, sy, 0, 0.08, 0.08, 2.0, planche_m(2), 0.01))
    for k in range(4):
        for sx in (-0.34, 0.34): o.append(cylindre(sx, -0.3 + k * 0.2, 2.0, 0.012, 0.02, clou_m(), 8))
    return o
mur_planches.n = 3
def mur_renforce(v, rnd):
    o = mur_planches(v, rnd)
    for a in (0.6, -0.6):
        p = boite(0, 0, 2.02, 1.05, 0.14, 0.05, planche_m(1), 0.01); p.rotation_euler.z = a; o.append(p)
    for k in range(3): o.append(cylindre(-0.4, -0.25 + k * 0.25, 2.06, 0.007, 0.86, mat_uni(lin(hexc('#a8a8a4')), 0.4, 1), 6))
    for c in o[-3:]: c.rotation_euler.y = math.pi / 2; c.location.x = 0; c.location.z = 2.06
    return o
mur_renforce.n = 2
def palissade(v, rnd):
    o = []
    import bpy
    for r in range(2):
        for k in range(5):
            x = -0.32 + k * 0.16 + (0.08 if r else 0); y = -0.15 + r * 0.3
            if x > 0.4: continue
            h = 1.7 + rnd.random() * 0.3
            o.append(cylindre(x, y, 0, 0.07, h, mat_tex('bark_brown_01', 3), 10))
            bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.07, depth=0.22, location=(x, y, h + 0.11)); t = bpy.context.active_object; t.data.materials.append(planche_m(k)); o.append(t)
    o.append(boite(0, 0, 1.0, 0.86, 0.06, 0.1, planche_m(2), 0.01))
    return o
palissade.n = 2
def porte_planches(v, rnd, ouverte=False):
    o = [boite(-0.38, 0, 0, 0.1, 0.3, 2.1, planche_m(2), 0.01), boite(0.38, 0, 0, 0.1, 0.3, 2.1, planche_m(2), 0.01)]
    battant = []
    for k in range(5): battant.append(boite(-0.28 + k * 0.14, 0, 0.02, 0.13, 0.07, 2.0, planche_m(k), 0.01))
    battant.append(boite(0, -0.04, 1.0, 0.7, 0.03, 0.12, planche_m(1), 0.01))
    if ouverte:
        import bpy
        g = A.regrouper(battant); g.location = (-0.35, 0, 0)
        for o2 in battant: o2.location.x += 0.35
        g.rotation_euler.z = -1.3
    return o + battant
porte_planches.n = 2
def porte_planches_ouverte(v, rnd): return porte_planches(v, rnd, True)
porte_planches_ouverte.n = 2
def barricade_fenetre(v, rnd):
    o = []
    for a in (0.5, -0.5):
        p = boite(0, -0.1, 0.9, 1.05, 0.04, 0.18, planche_m(int(a > 0) + v), 0.01); p.rotation_euler.y = a; o.append(p)
    o.append(boite(0, -0.13, 1.25, 0.95, 0.04, 0.16, planche_m(2), 0.01))
    return o
barricade_fenetre.n = 2
def pieux(v, rnd):
    o = []
    for k in range(6):
        p = boite((rnd.random() - 0.5) * 0.5, (rnd.random() - 0.5) * 0.5, 0.15, 0.6, 0.06, 0.06, planche_m(k), 0.01)
        p.rotation_euler = (0, -0.5, rnd.random() * 6.3); o.append(p)
    return o
pieux.n = 2
def caisse_bois(v, rnd): return importer_ph(['wooden_crate_01', 'wooden_crate_02'][v % 2])
caisse_bois.n = 2
def lit_fortune(v, rnd):
    o = [boite(-0.25, 0, 0.12, 0.3, 1.95, 0.05, planche_m(0), 0.01), boite(0.25, 0, 0.12, 0.3, 1.95, 0.05, planche_m(1), 0.01)]
    for sy in (-0.8, 0.8): o.append(boite(0, sy, 0, 0.75, 0.1, 0.12, planche_m(2), 0.01))
    o.append(coussin(0, 0, 0.17, 0.7, 1.85, 0.08, mat_tex('rough_linen', 1.5), 0.4))
    o.append(coussin(0, -0.25, 0.25, 0.75, 1.1, 0.05, mat_tex(['gingham_check', 'denim_fabric'][v % 2], 1.2), 0.4))
    return o
lit_fortune.n = 2
def feu_camp(v, rnd):
    if v == 0: return importer_ph('stone_fire_pit')
    o = []
    for k in range(10):
        a = k / 10 * 6.283
        s = sphere(math.cos(a) * 0.38, math.sin(a) * 0.38, 0.06, 0.1 + rnd.random() * 0.04, mat_tex('rock_pitted_mossy' if False else 'old_stone_wall', 2.0), 0.7); o.append(s)
    for k in range(4):
        b = cylindre(0, 0, 0.08, 0.045, 0.6, mat_tex('bark_brown_01', 3), 8); b.rotation_euler = (math.pi / 2, 0, k * 0.8 + rnd.random()); b.location.z = 0.1; o.append(b)
    o.append(cylindre(0, 0, 0, 0.26, 0.02, mat_uni(lin(hexc('#1a1410')), 0.95)))
    return o
feu_camp.n = 2
def recuperateur(v, rnd):
    o = [boite(0, 0, 0, 0.45, 0.32, 0.55, mat_uni(lin(hexc('#2a4a8a')), 0.4), 0.04)]
    for sx in (-0.38, 0.38):
        for sy in (-0.38, 0.38): o.append(cylindre(sx, sy, 0, 0.025, 1.3, planche_m(1), 8))
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.6, radius2=0.08, depth=0.3, location=(0, 0, 1.0)); t = bpy.context.active_object
    t.rotation_euler = (math.pi, 0, math.pi / 4); t.data.materials.append(mat_uni(lin(hexc('#3a6a9a')), 0.5)); o.append(t)
    return o
recuperateur.n = 1
def potager(v, rnd):
    o = []
    for sx, sy, w, h in ((0, 0.75, 1.6, 0.1), (0, -0.75, 1.6, 0.1), (0.75, 0, 0.1, 1.6), (-0.75, 0, 0.1, 1.6)): o.append(boite(sx, sy, 0, w, h, 0.18, planche_m(1), 0.01))
    o.append(boite(0, 0, 0, 1.45, 1.45, 0.14, mat_tex('dirt', 1.5), 0.0))
    return o
potager.n = 1
def mur_rondins(v, rnd):
    o = []
    for r in range(2):        # deux rondins côte à côte, deux de haut
        for k in range(2):
            c = cylindre(0, 0, 0, 0.19, 0.84, mat_tex('bark_brown_02', 2), 16); c.rotation_euler.y = math.pi / 2; c.location = (0, -0.19 + r * 0.38, 0.2 + k * 0.36); o.append(c)
    for sx in (-0.36, 0.36):
        for sy in (-0.4, 0.4): o.append(cylindre(sx, sy, 0, 0.05, 1.0, mat_tex('bark_brown_01', 3), 8))
    return o
mur_rondins.n = 2
def cloture_branches(v, rnd):
    o = []
    for k in range(9):
        c = cylindre(0, (rnd.random() - 0.5) * 0.15, 0, 0.022, 0.95, mat_tex('bark_brown_01', 4), 6)
        c.rotation_euler = (0, math.pi / 2 + (rnd.random() - 0.5) * 0.5, (rnd.random() - 0.5) * 0.3); c.location = ((rnd.random() - 0.5) * 0.1, c.location.y, 0.2 + rnd.random() * 0.8); o.append(c)
    for sx in (-0.38, 0.38): o.append(cylindre(sx, 0, 0, 0.04, 1.2, mat_tex('bark_brown_02', 3), 8))
    return o
cloture_branches.n = 2
def palissade_cannes(v, rnd):
    o = []
    for r in range(7):
        for k in range(30): o.append(cylindre(-0.4 + k * 0.027 + (0.013 if r % 2 else 0), -0.33 + r * 0.11 + (rnd.random() - 0.5) * 0.03, 0, 0.022, 1.9 + rnd.random() * 0.25, mat_uni(lin(hexc(['#b8b07a', '#a89e66', '#c4bc88'][k % 3])), 0.5), 8))
    for z in (0.5, 1.4): o.append(cylindre(0, -0.04, z, 0.006, 0.85, mat_uni(lin(hexc('#8a8a86')), 0.4, 1), 6))
    for c in o[-2:]: c.rotation_euler.y = math.pi / 2; c.location.x = 0
    return o
palissade_cannes.n = 1
def mur_sacs(v, rnd):
    h = mat_tex('hessian_230', 2.0); o = []
    for c in range(2):
        for r in range(3):
            for k in range(2):
                s2 = coussin(-0.2 + k * 0.42, -0.2 + c * 0.4 + (0.03 if r % 2 else -0.03), r * 0.24, 0.44, 0.38, 0.26, h, 0.48)
                s2.rotation_euler.z = (rnd.random() - 0.5) * 0.2 + (0.1 if r % 2 else 0); o.append(s2)
    return o
mur_sacs.n = 2
def muret_pierres(v, rnd):
    o = []
    for k in range(24):
        s = sphere((rnd.random() - 0.5) * 0.7, (rnd.random() - 0.5) * 0.65, 0.1 + (k // 8) * 0.22, 0.13 + rnd.random() * 0.06, mat_tex(['old_stone_wall', 'rustic_stone_wall'][k % 2], 2), 0.65)
        s.scale = (1.3, 1, 0.7); s.rotation_euler.z = rnd.random() * 3; o.append(s)
    return o
muret_pierres.n = 2
def portail_bois(v, rnd, ouverte=False):
    o = [boite(-0.78, 0, 0, 0.12, 0.3, 1.7, planche_m(2), 0.01), boite(0.78, 0, 0, 0.12, 0.3, 1.7, planche_m(2), 0.01)]
    for side in (-1, 1):
        bat = []
        for k in range(5): bat.append(boite(side * (0.08 + k * 0.14), 0, 0.05, 0.13, 0.05, 1.55, planche_m(k), 0.01))
        bat.append(boite(side * 0.37, -0.04, 0.8, 0.7, 0.03, 0.12, planche_m(1), 0.01))
        if ouverte:
            g = A.regrouper(bat); g.location = (side * 0.74, 0, 0)
            for o2 in bat: o2.location.x -= side * 0.74
            g.rotation_euler.z = side * 1.3
        o += bat
    return o
portail_bois.n = 1
def portail_bois_ouverte(v, rnd): return portail_bois(v, rnd, True)
portail_bois_ouverte.n = 1
def barbeles(v, rnd):
    o = [cylindre(-0.36, 0, 0, 0.03, 0.9, mat_tex('bark_brown_01', 3), 6), cylindre(0.36, 0, 0, 0.03, 0.9, mat_tex('bark_brown_01', 3), 6)]
    import bpy
    fer = mat_uni(lin(hexc('#9a9a96')), 0.45, 1)
    for k in range(3):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.32, minor_radius=0.006, major_segments=48, minor_segments=6, location=(-0.2 + k * 0.2, 0, 0.35))
        t = bpy.context.active_object; t.rotation_euler = (0, math.pi / 2, (rnd.random() - 0.5) * 0.4); t.data.materials.append(fer); o.append(t)
    return o
barbeles.n = 1
def alarme_conserves(v, rnd):
    o = [cylindre(-0.38, 0, 0, 0.02, 0.4, mat_tex('bark_brown_01', 3), 6), cylindre(0.38, 0, 0, 0.02, 0.4, mat_tex('bark_brown_01', 3), 6)]
    f = cylindre(-0.4, 0, 0.3, 0.003, 0.8, mat_uni(lin(hexc('#aaaaaa')), 0.4, 1), 4); f.rotation_euler.y = math.pi / 2; f.location = (0, 0, 0.3); o.append(f)
    for k in range(4):
        try: ps = importer_ph('can_rusted'); g = A.regrouper(ps); g.location = (-0.25 + k * 0.17, 0, 0.15); g.rotation_euler = (rnd.random() * 0.5, 0, rnd.random() * 3); o += ps
        except Exception: pass
    return o
alarme_conserves.n = 1
def fosse(v, rnd):
    o = [boite(0, 0, 0, 0.78, 0.78, 0.02, mat_tex('dirt', 2, teinte=lin(hexc('#8a7a64'))), 0.01)]
    for k in range(5):
        c = cylindre(0, 0, 0.02, 0.025, 0.8, mat_tex('bark_brown_01', 4), 6); c.rotation_euler = (math.pi / 2, 0, rnd.random() * 3); c.location = ((rnd.random() - 0.5) * 0.3, (rnd.random() - 0.5) * 0.3, 0.04); o.append(c)
    for k in range(12): o.append(sphere((rnd.random() - 0.5) * 0.6, (rnd.random() - 0.5) * 0.6, 0.05, 0.06, mat_uni(lin(hexc('#5a6a2a')), 0.8), 0.4))
    return o
fosse.n = 1
def chevaux_frise(v, rnd):
    o = [cylindre(-0.8, 0, 0.45, 0.09, 1.6, mat_tex('rough_wood', 2), 8)]
    o[0].rotation_euler.y = math.pi / 2; o[0].location = (0, 0, 0.45)
    for k in range(5):
        for a in (0.7, -0.7):
            p = boite(-0.6 + k * 0.3, 0, 0.45, 0.05, 0.05, 1.2, planche_m(k), 0.005); p.rotation_euler.x = a; o.append(p)
    return o
chevaux_frise.n = 1
def coffre(v, rnd):
    if v == 0: return importer_ph('treasure_chest')
    b = planche_m(1)
    return [boite(0, 0, 0, 1.4, 0.65, 0.6, b, 0.02), boite(0, 0, 0.6, 1.44, 0.69, 0.06, planche_m(0), 0.02), boite(0, -0.35, 0.45, 0.12, 0.03, 0.12, mat_uni(lin(hexc('#8a7a4a')), 0.4, 1), 0.01)]
coffre.n = 2
def etagere_bois(v, rnd):
    b = planche_m(v)
    o = [boite(0, 0.05, 0, 1.5, 0.45, 0.04, b, 0.005), boite(0, 0.05, 0.6, 1.5, 0.45, 0.04, b, 0.005), boite(0, 0.05, 1.2, 1.5, 0.45, 0.04, b, 0.005)]
    for sx in (-0.73, 0.73): o.append(boite(sx, 0.05, 0, 0.04, 0.45, 1.25, b, 0.005))
    return o
etagere_bois.n = 2
def table_bois(v, rnd):
    b = planche_m(v)
    o = [boite(0, 0, 0.72, 1.5, 0.75, 0.05, b, 0.01)]
    for sx in (-0.65, 0.65):
        for sy in (-0.28, 0.28): o.append(boite(sx, sy, 0, 0.07, 0.07, 0.72, planche_m(2), 0.005))
    return o
table_bois.n = 2
def chaise_bois(v, rnd):
    b = planche_m(v)
    o = [boite(0, 0, 0.45, 0.45, 0.45, 0.04, b, 0.005), boite(0, 0.2, 0.45, 0.45, 0.04, 0.5, b, 0.005)]
    for sx in (-0.19, 0.19):
        for sy in (-0.19, 0.19): o.append(boite(sx, sy, 0, 0.04, 0.04, 0.45, planche_m(2), 0.003))
    return o
chaise_bois.n = 2
def torche_murale(v, rnd):
    return [cylindre(0, 0, 0, 0.03, 1.6, mat_tex('bark_brown_01', 4), 8), coussin(0, 0, 1.55, 0.12, 0.12, 0.2, mat_uni(lin(hexc('#2a241e')), 0.9), 0.5)]
torche_murale.n = 1
def four_pierre(v, rnd):
    o = []
    for r in range(4):
        n = 12 - r * 2
        for k in range(n):
            a = k / n * 6.283
            if r < 2 and abs(a - 4.71) < 0.5: continue   # l'ouverture, devant
            rr = 0.45 - r * 0.1
            s = sphere(math.cos(a) * rr, math.sin(a) * rr, 0.1 + r * 0.17, 0.11, mat_tex('old_stone_wall', 2), 0.7); s.scale = (1.2, 1, 0.75); o.append(s)
    o.append(cylindre(0, 0, 0, 0.3, 0.02, mat_uni(lin(hexc('#1a1410')), 0.95)))
    return o
four_pierre.n = 1
def fumoir(v, rnd):
    o = [boite(0, 0, 0, 0.75, 0.75, 1.6, planche_m(1), 0.01)]
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.62, radius2=0.05, depth=0.35, location=(0, 0, 1.78)); t = bpy.context.active_object; t.rotation_euler.z = math.pi / 4
    t.data.materials.append(mat_uni(lin(hexc('#3a4a3a')), 0.6)); o.append(t)
    o.append(cylindre(0.2, 0.2, 1.7, 0.06, 0.5, mat_uni(lin(hexc('#4a4a4a')), 0.5, 0.9)))
    return o
fumoir.n = 1
def tonneau(v, rnd): return importer_ph('wine_barrel_01')
tonneau.n = 1
def abri_branches(v, rnd):
    o = [cylindre(-0.9, 0, 1.0, 0.05, 1.8, mat_tex('bark_brown_02', 3), 8)]
    o[0].rotation_euler.y = math.pi / 2; o[0].location = (0, 0, 1.15)
    for k in range(13):
        for side in (-1, 1):
            c = cylindre(-0.85 + k * 0.14, 0, 0, 0.03, 1.55, mat_tex('bark_brown_01', 4), 6); c.rotation_euler.x = side * 0.75; c.location = (-0.85 + k * 0.14, side * 0.55, 0); o.append(c)
    b = boite(0, 0, 0.9, 1.9, 1.6, 0.02, mat_uni(lin(hexc('#3a5a7a')), 0.6), 0.0); o.append(b)
    for k in range(30): o.append(sphere((rnd.random() - 0.5) * 1.8, (rnd.random() - 0.5) * 1.5, 0.9 + rnd.random() * 0.4, 0.08 + rnd.random() * 0.06, mat_uni(lin(hexc(['#4e5e30', '#6a6a3a', '#3e4a28'][k % 3])), 0.8), 0.5))
    return o
abri_branches.n = 1
def etabli_constr(v, rnd): return etabli_meuble(v + 1, rnd)
etabli_constr.n = 1

# ======================================================== LE CATALOGUE ========================================================
def E(t, f, n=None, **kw):
    d = {'t': t, 'f': f, 'n': n or getattr(f, 'n', 1)}; d.update(kw); return d

CATALOGUE = {
    # — mobilier d'intérieur —
    'table':        E([2, 1], ph('wooden_table_02', 'painted_wooden_table', 'WoodenTable_01', 'dining_table', 'small_wooden_table_01'), remplir=0.95, etirer=True, props=(PROPS_TABLE, 2)),
    'table_ronde':  E([1, 1], ph('round_wooden_table_01', 'round_wooden_table_02', 'coffee_table_round_01'), remplir=0.92, props=(PROPS_TABLE, 1)),
    'comptoir':     E([3, 1], comptoir, remplir=0.97, etirer=True),
    'cuisine':      E([3, 1], cuisine, remplir=0.98, etirer=True),
    'etagere':      E([2, 1], ph('wooden_bookshelf_worn', 'Shelf_01', 'painted_wooden_shelves', 'wooden_display_shelves_01'), remplir=0.95, etirer=True, props=(PROPS_ETAGERE, 3), vide=True),
    'rayonnage':    E([4, 1], ph('steel_frame_shelves_01', 'steel_frame_shelves_03', 'worn_metal_rack'), remplir=0.97, etirer=True, props=(PROPS_RAYON, 6), vide=True),
    'armoire':      E([2, 1], ph('vintage_cabinet_01', 'GothicCabinet_01', 'painted_wooden_cabinet_02', 'chinese_cabinet'), remplir=0.95, etirer=True),
    'commode':      E([2, 1], ph('GothicCommode_01', 'painted_wooden_cabinet', 'vintage_wooden_drawer_01', 'chinese_commode', 'modern_wooden_cabinet'), remplir=0.94, etirer=True, props=(PROPS_COMMODE, 2)),
    'frigo':        E([1, 1], frigo, remplir=0.9),
    'bureau':       E([2, 1], ph('metal_office_desk', 'small_wooden_table_01', 'SchoolDesk_01'), remplir=0.95, etirer=True, props=(PROPS_BUREAU, 3)),
    'caisse':       E([1, 1], ph('wooden_crate_01', 'wooden_crate_02', 'wooden_military_crate', 'cardboard_box_01', 'old_military_crate', 'plastic_crate_01'), remplir=0.82),
    'poubelle':     E([1, 1], poubelle, remplir=0.75),
    'machine':      E([1, 1], machine, remplir=0.9),
    'lit':          E([2, 3], lit, remplir=0.96, etirer=True),
    'lit_simple':   E([1, 2], lit_simple, remplir=0.96, etirer=True),
    'canape':       E([3, 1], ph('Sofa_01', 'sofa_02', 'sofa_03', 'painted_wooden_sofa', 'chinese_sofa'), remplir=0.96, etirer=True),
    'fauteuil':     E([1, 1], ph('ArmChair_01', 'modern_arm_chair_01', 'GreenChair_01', 'mid_century_lounge_chair'), remplir=0.94),
    'banc':         E([2, 1], ph('painted_wooden_bench', 'modular_street_seating'), remplir=0.95, etirer=True),
    'lavabo':       E([1, 1], lavabo, remplir=0.8),
    'wc':           E([1, 1], wc, remplir=0.75),
    'baignoire':    E([1, 2], baignoire, remplir=0.97, etirer=True),
    'chaise':       E([1, 1], ph('dining_chair_02', 'painted_wooden_chair_01', 'plastic_monobloc_chair_01', 'SchoolChair_01', 'wooden_stool_01', 'metal_stool_01'), remplir=0.62, tourne=0.6),
    'tapis':        E([3, 2], tapis, remplir=0.98, etirer=True, plat=True),
    'piano':        E([2, 1], piano, remplir=0.96, etirer=True),
    'cheminee':     E([2, 1], cheminee, remplir=0.97, etirer=True),
    'televiseur':   E([1, 1], televiseur, remplir=0.9),
    # — commerce, bureaux, hôpital —
    'caisse_enreg': E([1, 1], caisse_enreg, remplir=0.8),
    'vitrine_frigo':E([3, 1], vitrine_frigo, remplir=0.97, etirer=True),
    'brancard':     E([1, 2], brancard, remplir=0.92, etirer=True),
    'lit_hopital':  E([1, 2], lit_hopital, remplir=0.95, etirer=True),
    'casier':       E([1, 1], casier, remplir=0.88, etirer=True),
    'classeur':     E([1, 1], classeur, remplir=0.82),
    # — extérieur, ville —
    'voiture':      E([3, 2], voiture, remplir=0.98, etirer=True, couleurs=COUL_VOITURES),
    'camionnette':  E([4, 2], camionnette, remplir=0.98, etirer=True),
    'camion_mil':   E([5, 2], camion_mil, remplir=0.98, etirer=True),
    'ambulance':    E([4, 2], ambulance, remplir=0.98, etirer=True),
    'gravats':      E([1, 1], gravats, remplir=0.95),
    'buisson':      E([1, 1], buisson, remplir=1.05),
    'roncier':      E([1, 1], roncier, remplir=1.05),
    'cannier':      E([1, 1], cannier, remplir=1.05),
    'haie':         E([1, 1], haie, remplir=1.05, etirer=True),
    'souche':       E([1, 1], souche, remplir=0.7),
    'borne':        E([1, 1], borne, remplir=0.35),
    'poteau':       E([1, 1], poteau, remplir=0.4),
    'benne':        E([2, 1], benne, remplir=0.98, etirer=True),
    'barriere':     E([2, 1], barriere, remplir=0.98, etirer=True),
    'sacs_sable':   E([2, 1], sacs_sable, remplir=0.98, etirer=True),
    'palette':      E([1, 1], palette, remplir=0.95, etirer=True),
    'caisson':      E([1, 1], ph('wooden_military_crate', 'old_military_crate', 'ammo_box'), remplir=0.85),
    'fut':          E([1, 1], fut, remplir=0.78),
    'brasero':      E([1, 1], ph('barrel_stove'), remplir=0.8),
    'feu_camp':     E([1, 1], feu_camp, remplir=0.95),
    'fontaine':     E([2, 2], fontaine, remplir=0.96),
    'statue':       E([1, 1], statue, remplir=0.9),
    'tente':        E([3, 3], tente, remplir=0.98),
    'generateur':   E([2, 1], generateur, remplir=0.9),
    'conteneur':    E([5, 2], conteneur, remplir=0.99, etirer=True),
    # — cimetière, église —
    'tombe':        E([1, 2], tombe_simple, remplir=0.97, etirer=True),
    'tombe_croix':  E([1, 2], tombe_croix, remplir=0.97, etirer=True),
    'stele':        E([1, 1], stele, remplir=0.9),
    'caveau':       E([2, 2], caveau, remplir=0.98, etirer=True),
    'cercueil':     E([1, 2], cercueil, remplir=0.92, etirer=True),
    'housse':       E([1, 2], housse, remplir=0.92, etirer=True, plat=False),
    'autel':        E([3, 1], autel, remplir=0.96, etirer=True),
    'prie_dieu':    E([3, 1], prie_dieu, remplir=0.97, etirer=True),
    'cloche':       E([2, 2], cloche, remplir=0.95),
    'pilier':       E([1, 1], pilier, remplir=0.95),
    'treteau':      E([2, 1], treteau, remplir=0.95, etirer=True),
    'chariot':      E([1, 2], chariot, remplir=0.92, etirer=True),
    'etabli_meuble':E([3, 1], etabli_meuble, remplir=0.96, etirer=True),
    'couronne':     E([1, 1], couronne, remplir=0.8, plat=True),
    'debris':       E([1, 1], debris, remplir=0.95, plat=True),
    'banc_pierre':  E([2, 1], banc_pierre, n=2, remplir=0.95, etirer=True),
    # — constructions (clé = dessin) —
    'mur_planches': E([1, 1], mur_planches, remplir=1.0, etirer=True),
    'mur_renforce': E([1, 1], mur_renforce, remplir=1.0, etirer=True),
    'palissade':    E([1, 1], palissade, remplir=1.0, etirer=True),
    'porte_planches': E([1, 1], porte_planches, remplir=1.0, etats={'ouverte': porte_planches_ouverte}),
    'barricade_fenetre': E([1, 1], barricade_fenetre, remplir=1.05, etirer=True),
    'pieux':        E([1, 1], pieux, remplir=0.95),
    'caisse_bois':  E([1, 1], caisse_bois, remplir=0.85),
    'etabli':       E([2, 1], etabli_constr, remplir=0.95, etirer=True),
    'lit_fortune':  E([1, 2], lit_fortune, remplir=0.95, etirer=True),
    'recuperateur': E([1, 1], recuperateur, remplir=0.95),
    'potager':      E([2, 2], potager, remplir=0.98, etirer=True, plat=True),
    'mur_rondins':  E([1, 1], mur_rondins, remplir=1.0, etirer=True),
    'cloture_branches': E([1, 1], cloture_branches, remplir=1.0, etirer=True),
    'palissade_cannes': E([1, 1], palissade_cannes, remplir=1.0, etirer=True),
    'mur_sacs':     E([1, 1], mur_sacs, remplir=1.0, etirer=True),
    'muret_pierres':E([1, 1], muret_pierres, remplir=1.0, etirer=True),
    'portail_bois': E([2, 1], portail_bois, remplir=1.0, etats={'ouverte': portail_bois_ouverte}),
    'barbeles':     E([1, 1], barbeles, remplir=1.0),
    'alarme_conserves': E([1, 1], alarme_conserves, remplir=1.0),
    'fosse':        E([1, 1], fosse, remplir=0.98, plat=True),
    'chevaux_frise':E([2, 1], chevaux_frise, remplir=1.0, etirer=True),
    'coffre':       E([2, 1], coffre, remplir=0.95, etirer=True),
    'etagere_bois': E([2, 1], etagere_bois, remplir=0.95, etirer=True),
    'table_bois':   E([2, 1], table_bois, remplir=0.95, etirer=True),
    'chaise_bois':  E([1, 1], chaise_bois, remplir=0.62),
    'torche_murale':E([1, 1], torche_murale, remplir=0.3),
    'four_pierre':  E([1, 1], four_pierre, remplir=0.98),
    'fumoir':       E([1, 1], fumoir, remplir=0.95),
    'tonneau':      E([1, 1], tonneau, remplir=0.85),
    'abri_branches':E([2, 2], abri_branches, remplir=1.0, etirer=True),
}
