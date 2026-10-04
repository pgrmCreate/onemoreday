# ============ One More Day — atelier des ASSETS (Blender) ============
# Rend les meubles, objets, végétaux et constructions du jeu en sprites vus de dessus (img/objets/<type>[_<n>].webp),
# lumière du haut-gauche, fond transparent, sans ombre portée (le jeu la dessine d'après la silhouette, toujours vers le
# bas-droite, quelle que soit la rotation de l'objet).
#
# Usage (dans Blender, console Python ou MCP) :
#   import sys; sys.path.insert(0, r'D:\projects\One more day - Claude\tools\blender')
#   import importlib, omd_assets as A; importlib.reload(A)
#   A.preparer_scene(); A.rendre('table', A.CATALOGUE['table'])        # ou A.tout_rendre()
#
# Échelle : 1 case = 0,8 m (js/rendu/outils.js). Un objet t = [w, h] cases occupe w × 0,8 m sur x, h × 0,8 m sur y.
# Orientation 0 (celle du catalogue) : le DOS de l'objet (tête de lit, dossier, mur d'appui) est EN HAUT de l'image (+Y).
# Modèles : Poly Haven (CC0) téléchargés en glTF 1k dans D:\projects 3D\OneMoreDay\ph_cache\models\<id>\ ; les objets
# qui n'existent pas chez Poly Haven sont construits ici (boîtes biseautées + matières Poly Haven).
import bpy, bmesh, math, os, json, random, urllib.request
from mathutils import Vector, Matrix

CASE = 0.8                     # mètres par case
PX = 96                        # pixels par case dans les sprites (le jeu dessine à 48 px/case : 2× pour le zoom)
MARGE = 0.12                   # marge autour de l'empreinte (cases) : ce qui déborde un peu (accoudoirs, branches)
CACHE = r'D:\projects 3D\OneMoreDay\ph_cache'
SORTIE = r'D:\projects\One more day - Claude\img\objets'
UA = {'User-Agent': 'OneMoreDay/1.0 (jeu indie, rendu de sprites)'}

# ---------------------------------------------------------------- outils
def _get(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return dest
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, 'wb') as f: f.write(r.read())
    return dest

def _api(path):
    req = urllib.request.Request('https://api.polyhaven.com/' + path, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r: return json.loads(r.read().decode('utf-8'))

def telecharger_modele(pid, res='1k'):
    """glTF + textures d'un modèle Poly Haven dans le cache ; renvoie le chemin du .gltf."""
    d = os.path.join(CACHE, 'models', pid)
    g = os.path.join(d, f'{pid}_{res}.gltf')
    if os.path.exists(g): return g
    info = _api('files/' + pid)['gltf'][res]['gltf']
    _get(info['url'], g)
    for rel, inc in (info.get('include') or {}).items(): _get(inc['url'], os.path.join(d, rel))
    return g

def telecharger_texture(tid, res='1k'):
    """Textures (diff, nor_gl, rough/arm) d'une matière Poly Haven ; renvoie {diff, nor, rough, arm}."""
    d = os.path.join(CACHE, 'tex', tid)
    meta = os.path.join(d, 'meta.json')
    if os.path.exists(meta): return json.load(open(meta))
    f = _api('files/' + tid)
    out = {}
    for cle, noms in (('diff', ['Diffuse', 'diff']), ('nor', ['nor_gl']), ('rough', ['Rough', 'rough']), ('arm', ['arm']), ('metal', ['Metal', 'metal'])):
        for n in noms:
            if n in f and res in f[n]:
                fmt = 'jpg' if 'jpg' in f[n][res] else list(f[n][res].keys())[0]
                url = f[n][res][fmt]['url']
                out[cle] = _get(url, os.path.join(d, os.path.basename(url)))
                break
    json.dump(out, open(meta, 'w'))
    return out

def vider():
    for o in list(bpy.data.objects):
        if o.name.startswith('_omd_'): continue
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.curves):   # matières et images restent (cache _mats)
        for b in list(coll):
            if b.users == 0: coll.remove(b)

# ---------------------------------------------------------------- scène
def preparer_scene(samples=48):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for t in ('OPTIX', 'CUDA'):
            try:
                prefs.compute_device_type = t; prefs.get_devices()
                for dv in prefs.devices: dv.use = True
                sc.cycles.device = 'GPU'; break
            except Exception: pass
    except Exception: pass
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'WEBP'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.quality = 88
    sc.view_settings.view_transform = 'AgX'
    try: sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception: pass
    sc.view_settings.exposure = 0.0
    # monde : ciel gris-bleu doux (lumière d'ambiance)
    w = sc.world or bpy.data.worlds.new('omd_monde'); sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get('Background') or w.node_tree.nodes.new('ShaderNodeBackground')
    bg.inputs[0].default_value = (0.62, 0.66, 0.72, 1); bg.inputs[1].default_value = 1.1
    # soleil du haut-gauche (comme les sols photo et les ombres du jeu)
    s = bpy.data.objects.get('_omd_soleil')
    if not s:
        ld = bpy.data.lights.new('_omd_soleil', 'SUN'); s = bpy.data.objects.new('_omd_soleil', ld); sc.collection.objects.link(s)
    s.data.energy = 5.5; s.data.angle = math.radians(6); s.data.color = (1.0, 0.96, 0.9)
    # direction : vient de (-x, +y, +z) → éclaire vers (+x, -y, -z)
    elev, az = math.radians(52), math.radians(135)   # azimut mesuré depuis +x
    d = Vector((math.cos(elev) * math.cos(az), math.cos(elev) * math.sin(az), math.sin(elev)))   # vers la lumière
    s.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    c = bpy.data.objects.get('_omd_cam')
    if not c:
        cd = bpy.data.cameras.new('_omd_cam'); c = bpy.data.objects.new('_omd_cam', cd); sc.collection.objects.link(c)
    c.data.type = 'ORTHO'; c.location = (0, 0, 30); c.rotation_euler = (0, 0, 0); c.data.clip_end = 100
    sc.camera = c
    # retirer ce qui traîne (cube, lampe de la scène par défaut)
    for n in ('Cube', 'Light', 'Camera'):
        o = bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o, do_unlink=True)

# ---------------------------------------------------------------- matières
_mats = {}
def _vivant(cle):
    m = _mats.get(cle)
    if m is None: return False
    try: return m.name in bpy.data.materials
    except ReferenceError: _mats.pop(cle, None); return False
def mat_tex(tid, echelle=1.0, teinte=None, rugo=None, nom=None):
    """Matière principled à partir d'une texture Poly Haven (coordonnées objet en mètres × echelle)."""
    cle = (tid, echelle, teinte, rugo, nom)
    if _vivant(cle): return _mats[cle]
    t = telecharger_texture(tid)
    m = bpy.data.materials.new(nom or f'omd_{tid}'); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    p = N.get('Principled BSDF')
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (echelle, echelle, echelle)
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    def img(path, non_color=False):
        n = N.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(path, check_existing=True)
        n.projection = 'BOX'; n.projection_blend = 0.25
        if non_color: n.image.colorspace_settings.name = 'Non-Color'
        L.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    if 'diff' in t:
        di = img(t['diff'])
        if teinte:
            mx = N.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
            mx.inputs[2].default_value = (*teinte, 1); L.new(di.outputs['Color'], mx.inputs[1]); L.new(mx.outputs[0], p.inputs['Base Color'])
        else: L.new(di.outputs['Color'], p.inputs['Base Color'])
    if 'rough' in t and rugo is None:
        ro = img(t['rough'], True); L.new(ro.outputs['Color'], p.inputs['Roughness'])
    elif 'arm' in t and rugo is None:
        ar = img(t['arm'], True); sp = N.new('ShaderNodeSeparateColor'); L.new(ar.outputs['Color'], sp.inputs[0]); L.new(sp.outputs[1], p.inputs['Roughness']); L.new(sp.outputs[2], p.inputs['Metallic'])
    else: p.inputs['Roughness'].default_value = rugo if rugo is not None else 0.6
    if 'nor' in t:
        no = img(t['nor'], True); nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 0.8
        L.new(no.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], p.inputs['Normal'])
    _mats[cle] = m
    return m

def mat_uni(coul, rugo=0.5, metal=0.0, nom=None, emission=None, verre=False):
    cle = ('uni', tuple(coul), rugo, metal, nom, emission, verre)
    if _vivant(cle): return _mats[cle]
    m = bpy.data.materials.new(nom or 'omd_uni'); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*coul[:3], 1); p.inputs['Roughness'].default_value = rugo; p.inputs['Metallic'].default_value = metal
    if verre:
        p.inputs['Transmission Weight'].default_value = 0.0; p.inputs['Roughness'].default_value = 0.05
        p.inputs['Coat Weight'].default_value = 1.0
    if emission:
        p.inputs['Emission Color'].default_value = (*emission[:3], 1); p.inputs['Emission Strength'].default_value = emission[3] if len(emission) > 3 else 2
    _mats[cle] = m
    return m

# ---------------------------------------------------------------- primitives
def boite(x, y, z, sx, sy, sz, mat=None, biseau=0.01, nom='boite'):
    """Boîte de taille (sx, sy, sz) m dont le coin bas est en (x - sx/2, y - sy/2, z) : centrée en x, y, posée sur z."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2))
    o = bpy.context.active_object; o.name = nom; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    if biseau > 0:
        b = o.modifiers.new('biseau', 'BEVEL'); b.width = min(biseau, sx / 2.2, sy / 2.2, sz / 2.2); b.segments = 3; b.limit_method = 'ANGLE'
    if mat: o.data.materials.append(mat)
    return o

def cylindre(x, y, z, r, h, mat=None, n=32, nom='cyl', biseau=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=(x, y, z + h / 2))
    o = bpy.context.active_object; o.name = nom
    if biseau > 0: b = o.modifiers.new('biseau', 'BEVEL'); b.width = min(biseau, r / 2, h / 2.2); b.segments = 3; b.limit_method = 'ANGLE'
    bpy.ops.object.shade_smooth()
    if mat: o.data.materials.append(mat)
    return o

def sphere(x, y, z, r, mat=None, sz=1.0, nom='sph'):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, z), segments=32, ring_count=16)
    o = bpy.context.active_object; o.name = nom; o.scale = (1, 1, sz); bpy.ops.object.shade_smooth()
    if mat: o.data.materials.append(mat)
    return o

def coussin(x, y, z, sx, sy, sz, mat, rond=0.45, nom='coussin'):
    """Coussin / matelas / housse : boîte très biseautée puis subdivisée (forme molle)."""
    o = boite(x, y, z, sx, sy, sz, mat, biseau=min(sx, sy, sz) * rond, nom=nom)
    s = o.modifiers.new('sub', 'SUBSURF'); s.levels = 2; s.render_levels = 2
    bpy.ops.object.shade_smooth()
    return o

def importer_ph(pid):
    """Importe un modèle Poly Haven. 'pack:partie' : les packs de végétaux alignent plusieurs variantes côte à côte —
    on ne garde que les objets dont le nom commence par `partie` (recentrés)."""
    partie = None
    if ':' in pid: pid, partie = pid.split(':', 1)
    g = telecharger_modele(pid)
    avant = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=g)
    objs = [o for o in bpy.data.objects if o not in avant]
    if partie:
        garde = [o for o in objs if o.type == 'MESH' and o.name.startswith(partie)]
        jeter = [o for o in objs if o.type == 'MESH' and o not in garde]
        objs = [o for o in objs if o in garde or o.type != 'MESH']
        for o in jeter: bpy.data.objects.remove(o, do_unlink=True)
        for o in garde:
            mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
        bpy.context.view_layer.update()
        mn, mx = bornes(garde)
        for o in garde: o.location.x -= (mn.x + mx.x) / 2; o.location.y -= (mn.y + mx.y) / 2
    return [o for o in objs if o.type == 'MESH'] or objs

def bornes(objs):
    pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type != 'MESH': continue
        oe = o.evaluated_get(dg)
        mw = oe.matrix_world
        me = oe.data
        if len(me.vertices) <= 60000:      # sommets réels (le bound_box d'un objet tourné déborde)
            for v in me.vertices: pts.append(mw @ v.co)
        else:
            for v in oe.bound_box: pts.append(mw @ Vector(v))
    if not pts: return Vector((0, 0, 0)), Vector((0, 0, 0))
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx

def regrouper(objs):
    """Un vide parent pour déplacer / tourner / mettre à l'échelle un groupe d'objets."""
    racine = bpy.data.objects.new('groupe', None); bpy.context.scene.collection.objects.link(racine)
    for o in objs:
        if o.parent is None or o.parent not in objs:
            mw = o.matrix_world.copy(); o.parent = racine; o.matrix_world = mw
    return racine

def caler(objs, w, h, remplir=0.92, rot_z=0.0, etirer=False, hauteur=None):
    """Tourne (rot_z, degrés), met à l'échelle pour tenir dans w × h cases (uniforme, ou étiré si etirer),
    centre en (0, 0) et pose au sol. hauteur : force la hauteur (m) au lieu de l'échelle uniforme."""
    g = regrouper(objs)
    g.rotation_euler = (0, 0, math.radians(rot_z)); bpy.context.view_layer.update()
    mn, mx = bornes(objs)
    tx, ty = w * CASE * remplir, h * CASE * remplir
    dx, dy, dz = max(1e-4, mx.x - mn.x), max(1e-4, mx.y - mn.y), max(1e-4, mx.z - mn.z)
    if etirer: k = (tx / dx, ty / dy, (hauteur / dz) if hauteur else min(tx / dx, ty / dy))
    else: s = min(tx / dx, ty / dy); k = (s, s, (hauteur / dz) if hauteur else s)
    g.scale = k; bpy.context.view_layer.update()
    mn, mx = bornes(objs)
    g.location.x -= (mn.x + mx.x) / 2; g.location.y -= (mn.y + mx.y) / 2; g.location.z -= mn.z
    bpy.context.view_layer.update()
    return g

# ---------------------------------------------------------------- rendu
def rendre_fichier(nom, w, h, objs=None):
    sc = bpy.context.scene
    c = sc.camera
    W, H = w + 2 * MARGE, h + 2 * MARGE
    sc.render.resolution_x = max(8, round(W * PX)); sc.render.resolution_y = max(8, round(H * PX)); sc.render.resolution_percentage = 100
    c.data.ortho_scale = max(W, H) * CASE
    c.data.sensor_fit = 'AUTO'
    os.makedirs(SORTIE, exist_ok=True)
    sc.render.filepath = os.path.join(SORTIE, nom + '.webp')
    bpy.ops.render.render(write_still=True)
    mn, mx = bornes(objs or [o for o in bpy.data.objects if o.type == 'MESH'])
    return {'hauteur': round(mx.z, 3)}

# ---------------------------------------------------------------- production
ROT_MODELES = {}   # pid → degrés : modèles Poly Haven dont le dos n'est pas vers +Y (rempli au fil des planches de contrôle)

def _meta_charger():
    p = os.path.join(SORTIE, 'objets.json')
    try: return json.load(open(p, encoding='utf-8'))
    except Exception: return {}
def _meta_ecrire(m):
    os.makedirs(SORTIE, exist_ok=True)
    json.dump(m, open(os.path.join(SORTIE, 'objets.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)

def rendre(typ, spec, seulement=None):
    """Rend toutes les variantes (et états : _vide, _ouverte) d'un type ; met à jour img/objets/objets.json."""
    import omd_catalogue as C
    w, h = spec['t']; n = spec['n']
    meta = _meta_charger()
    jeux = [(typ, spec['f'], False)]
    if spec.get('vide'): jeux.append((typ + '_vide', spec['f'], True))
    for suf, fn in (spec.get('etats') or {}).items(): jeux.append((typ + '_' + suf, fn, False))
    for nom, fn, vide in jeux:
        hs = []
        for v in range(n):
            if seulement is not None and v not in seulement: continue
            vider()
            rnd = random.Random(f'{typ}:{v}')
            objs = [o for o in (fn(v, rnd) or []) if o]
            pid = None
            caler(objs, w, h, remplir=spec.get('remplir', 0.92), etirer=spec.get('etirer', False), rot_z=spec.get('rot', 0))
            mn, mx = bornes(objs); hs.append(mx.z)
            tout = list(objs)
            pr = spec.get('props')
            if pr and not vide: tout += C.poser_dessus(objs, pr[0], rnd, pr[1])
            rendre_fichier(f'{nom}_{v}', w, h, tout)
        d = meta.get(nom, {})
        d.update({'n': n, 'm': MARGE, 't': spec['t'], 'h': round(sum(hs) / max(1, len(hs)), 2) if hs else d.get('h', 0.5)})
        if spec.get('plat'): d['plat'] = 1
        if spec.get('tourne'): d['tourne'] = spec['tourne']
        if spec.get('couleurs'): d['c'] = spec['couleurs']
        meta[nom] = d
    _meta_ecrire(meta)

def tout_rendre(types=None, sauf=()):
    import omd_catalogue as C, importlib; importlib.reload(C)
    preparer_scene()
    faits = []
    for typ, spec in C.CATALOGUE.items():
        if types and typ not in types: continue
        if typ in sauf: continue
        try: rendre(typ, spec); faits.append(typ)
        except Exception as e:
            import traceback; print('[ERREUR]', typ, e); traceback.print_exc()
    return faits

# ---------------------------------------------------------------- houppiers (partie haute des arbres, au-dessus des personnages)
def teinter(objs, hue=0.5, sat=1.0, val=1.0):
    """Décale la couleur des matières (feuillage) : nœud Teinte/Saturation/Valeur après la couleur de base."""
    vus = set()
    for o in objs:
        for slot in o.material_slots:
            m = slot.material
            if not m or m.name in vus or not m.use_nodes: continue
            vus.add(m.name)
            nt = m.node_tree; p = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
            if not p or not p.inputs['Base Color'].links: continue
            l = p.inputs['Base Color'].links[0]; src = l.from_socket
            h = nt.nodes.new('ShaderNodeHueSaturation'); h.inputs['Hue'].default_value = hue; h.inputs['Saturation'].default_value = sat; h.inputs['Value'].default_value = val
            nt.links.remove(l); nt.links.new(src, h.inputs['Color']); nt.links.new(h.outputs['Color'], p.inputs['Base Color'])

def rendre_haut(nom, objs, diam):
    """Houppier : l'arbre vu de dessus, cadré sur un carré de `diam` cases (sans marge)."""
    sc = bpy.context.scene; c = sc.camera
    g = regrouper(objs); bpy.context.view_layer.update()
    mn, mx = bornes(objs)
    k = diam * CASE * 0.98 / max(mx.x - mn.x, mx.y - mn.y, 1e-3)
    g.scale = (k, k, k); bpy.context.view_layer.update(); mn, mx = bornes(objs)
    g.location.x -= (mn.x + mx.x) / 2; g.location.y -= (mn.y + mx.y) / 2; g.location.z -= mn.z; bpy.context.view_layer.update()
    sc.render.resolution_x = sc.render.resolution_y = max(16, round(diam * PX * 0.75))
    c.data.ortho_scale = diam * CASE
    sc.render.filepath = os.path.join(SORTIE, nom + '.webp')
    bpy.ops.render.render(write_still=True)

HAUTS = {   # type de houppier (js/rendu/objets.js spriteHaut) → (diamètre en cases, [(modèle, teinte, saturation, valeur)])
    'platane': (4.6, [('island_tree_01', 0.5, 1.0, 1.05), ('island_tree_02', 0.52, 0.95, 1.1)]),
    'houppier': (3.4, [('island_tree_02', 0.5, 1.0, 0.95), ('tree_small_02', 0.5, 1.0, 1.0), ('island_tree_01', 0.49, 1.05, 0.9)]),
    'pin': (4.2, [('pine_tree_01:pine_tree_01_b', 0.5, 0.9, 1.05), ('pine_tree_01:pine_tree_01_c', 0.5, 0.85, 1.05)]),
    'olivier': (2.8, [('tree_small_02', 0.47, 0.42, 1.2), ('island_tree_02', 0.46, 0.38, 1.2)]),
    'figuier': (3.0, [('island_tree_02', 0.53, 1.15, 0.95), ('tree_small_02', 0.53, 1.2, 0.9)]),
    'amandier': (2.7, [('tree_small_02', 0.49, 0.8, 1.12), ('island_tree_01', 0.48, 0.75, 1.15)]),
}
def cypres(v):
    mats = mat_uni((0.03, 0.07, 0.025), 0.8)
    o = []
    for k in range(40):
        a = random.random() * 6.283; r = random.random() * 0.25
        z = 0.5 + random.random() * 5
        rr = 0.45 * (1 - (z - 0.5) / 5.5) + 0.15
        bpy.ops.mesh.primitive_ico_sphere_add(radius=rr * (0.6 + random.random() * 0.5), subdivisions=2, location=(math.cos(a) * r, math.sin(a) * r, z))
        s = bpy.context.active_object; s.data.materials.append(mat_uni((0.03 + random.random() * 0.02, 0.07 + random.random() * 0.03, 0.025), 0.8)); o.append(s)
    return o

def tout_rendre_hauts(types=None, cypres_aussi=True):
    preparer_scene()
    for typ, (diam, liste) in HAUTS.items():
        if types and typ not in types: continue
        for v, (pid, hue, sat, val) in enumerate(liste):
            vider(); objs = importer_ph(pid); teinter(objs, hue, sat, val)
            rendre_haut(f'haut_{typ}_{v}', objs, diam)
        meta = _meta_charger(); meta['haut_' + typ] = {'n': len(liste), 'm': 0, 'h': 6, 'd': diam}; _meta_ecrire(meta)
    if not cypres_aussi: return
    meta = _meta_charger()
    random.seed(4)
    for v in range(2):
        vider(); objs = cypres(v); rendre_haut(f'haut_cypres_{v}', objs, 1.5)
    meta['haut_cypres'] = {'n': 2, 'm': 0, 'h': 6, 'd': 1.5}
    _meta_ecrire(meta)
