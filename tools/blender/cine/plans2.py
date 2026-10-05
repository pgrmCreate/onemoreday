# ============ One More Day — plans tournés : souvenir, troupeau, chapitre 2, final et fins ============
import math, random, bpy
from mathutils import Vector
import omd_assets as A
import omd_ville as V
import omd_humains as H
import omd_nature as N
from plans import frames, foule_modeles, passant, immobile, foule_morts, PLANS

def statues_foule(n_modeles, graine, bras=False, allure='traine', phases=3):
    M = foule_modeles(n_modeles, graine, zombie=True)
    return H.statues_marche(M, phases, bras_tendus=bras, allure=allure), M

def points_bande(rnd, x0, x1, y0, y1, n):
    return [(rnd.uniform(x0, x1), rnd.uniform(y0, y1)) for _ in range(n)]

def lampe_tenue(rig, couleur=(1.0, 0.75, 0.4), energie=120):
    """Une lampe tenue à la main : lumière accrochée à la main droite."""
    ld = bpy.data.lights.new('lampe_main', 'POINT'); ld.energy = energie; ld.color = couleur; ld.shadow_soft_size = 0.1
    l = bpy.data.objects.new('lampe_main', ld); bpy.context.scene.collection.objects.link(l)
    l.parent = rig; l.parent_type = 'BONE'; l.parent_bone = 'wrist.R'; l.location = (0, 0.1, 0)
    return l

def salle(x0, x1, y0, y1, h, mur='painted_plaster_wall', teinte='#c8d4cc', sol='worn_tile_floor'):
    o = [V.boite((x0 + x1) / 2, (y0 + y1) / 2, -0.05, x1 - x0, y1 - y0, 0.05, A.mat_tex(sol, 0.6, teinte=V.lin('#dcdcd4'))),
         V.boite((x0 + x1) / 2, (y0 + y1) / 2, h, x1 - x0, y1 - y0, 0.05, A.mat_uni(V.lin('#d0cec4'), 0.8))]
    m = A.mat_tex(mur, 0.5, teinte=V.lin(teinte))
    o += [V.boite(x0, (y0 + y1) / 2, 0, 0.1, y1 - y0, h, m), V.boite(x1, (y0 + y1) / 2, 0, 0.1, y1 - y0, h, m),
          V.boite((x0 + x1) / 2, y1, 0, x1 - x0, 0.1, h, m), V.boite((x0 + x1) / 2, y0, 0, x1 - x0, 0.1, h, m)]
    return o

def neon(x, y, z, energie=300):
    V.boite(x, y, z - 0.06, 0.22, 1.25, 0.06, A.mat_uni((0.9, 0.95, 1.0), 0.2, emission=(0.85, 0.95, 1.0, 6.0)))
    ld = bpy.data.lights.new('neon', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 0.2; ld.size_y = 1.2; ld.energy = energie; ld.color = (0.85, 0.95, 1.0)
    l = bpy.data.objects.new('neon', ld); l.location = (x, y, z - 0.1); bpy.context.scene.collection.objects.link(l)
    return ld

# ───────────────────────── SOUVENIR : la clochette, les sangles, Jo ─────────────────────────
def souvenir(T, n):
    import omd_catalogue as C
    durees = [2500, 5000, 6000, 6000]; f1 = frames(durees[n])
    T.monde_uni((0.01, 0.01, 0.012), 0.2)
    salle(-3, 3, -3, 4, 2.8, teinte='#b8c8c0')
    nd = neon(0, 0.5, 2.8, 260)
    rnd = random.Random(70 + n)
    for f in range(1, f1 + 1, rnd.choice([3, 5])):   # le néon hésite
        nd.energy = 260 if rnd.random() > 0.25 else 15; nd.keyframe_insert('energy', frame=f)
    if n == 1:   # le lit à sangles (on y est attaché·e) : vu à la première personne
        lit = C.lit_hopital(0, rnd); g = A.regrouper(lit); g.location = (0, 0, 0)
        for k in range(3): V.boite(0, -0.7 + k * 0.5, 0.86, 1.0, 0.09, 0.03, A.mat_uni(V.lin('#3a3a34'), 0.7))
    if n == 0:   # une main qui agite une clochette dans l'embrasure
        inf = H.humain('infirmiere', 'f', 'adulte', vetements=['female_casualsuit02', 'toigo_flats'], cheveux='bob01', graine=301)
        inf.location = (0.9, 2.6, 0); H.orienter(inf, 0.2)
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.045, radius2=0.022, depth=0.07); cl = bpy.context.active_object
        cl.data.materials.append(A.mat_uni(V.lin('#b08a3a'), 0.3, 1.0)); cl.parent = inf; cl.parent_type = 'BONE'; cl.parent_bone = 'wrist.R'; cl.location = (0, 0.12, 0.03)
        for f in range(1, f1 + 1, 2):
            H.poser(inf, 'debout', {'upperarm01.R': [(H.X, -70)], 'lowerarm01.R': [(H.X, -40 + 25 * math.sin(f * 1.3))]}); H.figer(inf, f)
        T.camera([(1, (0.2, -0.8, 1.15), (0.9, 2.5, 1.45)), (f1, (0.25, -0.6, 1.15), (0.95, 2.5, 1.5))], lens=45, f_dof=True, ouverture=2.2)
    elif n == 1:  # baisser les yeux : les sangles, des bras gris qui tirent
        moi = H.humain('moi', 'h', 'adulte', graine=302, zombie=True, vetements=['elvs_crude_t-shirt_male', 'mindfront_male_trousers_1'])
        H.poser(moi, 'debout'); H.coucher(moi, True, 0); moi.location = (0, -0.85, 0.66)
        for f in range(1, f1 + 1, 4):
            H.poser(moi, 'debout', {'upperarm01.L': [(H.X, -6 * abs(math.sin(f * 0.4)))], 'upperarm01.R': [(H.X, -6 * abs(math.cos(f * 0.5)))]}); H.figer(moi, f)
        T.camera([(1, (0, 0.78, 1.0), (0, -1.2, 0.55)), (f1, (0.04, 0.74, 0.98), (0, -1.3, 0.5))], lens=22)
    elif n == 2:  # on pousse un brancard vers toi ; un homme dessus, la jambe dans une attelle
        b = C.brancard(0, rnd); gb = A.regrouper(b)
        jo = H.humain('jo', 'h', 'adulte', graine=303, vetements=['male_casualsuit03'], cheveux='short03')
        H.poser(jo, 'debout'); H.coucher(jo, True, 0)
        att = V.boite(0.12, 0.3, 0.9, 0.2, 0.7, 0.16, A.mat_uni(V.lin('#d8d4c4'), 0.6))
        inf = H.humain('infirmier', 'h', 'jeune', vetements=['male_worksuit01'], graine=304)
        for f in range(1, f1 + 1, 2):
            t = f / f1; yy = 3.2 - 2.4 * t
            gb.location = (0, yy, 0); jo.location = (0, yy - 0.1, 0.9); att.location = (0.12, yy + 0.4, 0.9)
            for o in (gb, jo, att): o.keyframe_insert('location', frame=f)
        H.marcher(inf, 1, f1, (0, 4.6), (0, 2.2), 'traine', base='debout')
        T.camera([(1, (1.9, -0.6, 1.6), (0, 2.6, 0.95)), (f1, (1.6, -0.9, 1.5), (0, 1.1, 0.95))], lens=28)
    else:         # son visage, tout près : « Jo. »
        jo = H.humain('jo', 'h', 'adulte', graine=303, vetements=['male_casualsuit03'], cheveux='short03')
        jo.location = (0, 0.6, 0.95); H.coucher(jo, True, 0)
        H.respirer(jo, 1, f1, 'debout', ampl=0.4, graine=9)
        bpy.context.scene.frame_set(1); bpy.context.view_layer.update()
        tete = jo.matrix_world @ jo.pose.bones['head'].head
        T.camera([(1, (0.55, tete.y + 0.25, tete.z + 0.15), (tete.x, tete.y, tete.z + 0.05)), (f1, (0.38, tete.y + 0.2, tete.z + 0.1), (tete.x, tete.y, tete.z + 0.05))], lens=60, f_dof=True, ouverture=1.6)
    return 1, f1

# ───────────────────────── LA NUIT DES SONNAILLES : le troupeau sur le cours ─────────────────────────
def sonnailles(T, n):
    f1 = frames(7000)
    V.construire_salon('nuit', 7, arbres=(-8, 9))
    T.lumiere('nuit')
    rnd = random.Random(80 + n)
    S, M = statues_foule(8, 81, bras=True)
    vers = (1, 0) if n < 2 else (0.4, 1)
    N_ = [900, 700, 700][n]
    H.foule_statique(S, points_bande(rnd, -110, 30, -12.5, 12.5, N_), f1, 0.7, vers, rnd)
    # les sonnailleurs : en tête, droits, une cloche au cou, une lampe à la main
    for k in range(4):
        r = H.doubler(M[k % len(M)], f'sonn{k}')
        H.marcher(r, 1, f1, (32 + k * 2, -4 + k * 2.6), (32 + k * 2 + 7 * vers[0], -4 + k * 2.6 + 7 * vers[1]), 'marche')
        lampe_tenue(r)
    if n == 2:   # la grosse cloche : un éclair de lumière dans l'air à chaque « bong »
        pass
    cams = [[(1, (-50, -13.5, 5.5), (-10, 2, 1.5)), (f1, (-28, -13.5, 6), (10, 2, 1.5))],
            [(1, (20, -13, 3.0), (34, 0, 1.8)), (f1, (30, -12, 2.6), (40, 2, 1.8))],
            [(1, (40, -11, 8), (10, 6, 2)), (f1, (30, -14, 26), (65, 170, 30))]][n]
    T.camera(cams, lens=[28, 35, 28][n])
    return 1, f1

# ───────────────────────── L'AUBE : le troupeau quitte Salon ─────────────────────────
def aube_troupeau(T, n):
    f1 = frames([8000, 8000, 6000][n])
    V.construire_salon('marche', 7, arbres=(-6, 7))
    T.lumiere('aube')
    rnd = random.Random(90 + n)
    S, M = statues_foule(8, 91)
    # la route d'Avignon, vers le nord : la foule s'étire dans la plaine
    n_ = 600 if n != 1 else 220   # plan rapproché sur le berger : moins de monde (sinon le rendu traîne)
    pts = [(-58 + rnd.uniform(-7, 7), 184 - t * 0.11 * 600 / n_ + rnd.uniform(-2, 2)) for t in range(n_)]           # derrière le berger
    if n != 1: pts += [(-58 + rnd.uniform(-9, 9) + (t - 300) * 0.02, 200 + t * 0.6 + rnd.uniform(-3, 3)) for t in range(300)]   # devant, déjà loin
    H.foule_statique(S, pts, f1, 0.8, (0.05, 1), rnd)
    # le berger et la petite femme à la grosse cloche, en tête
    b = H.humain('berger', 'h', 'vieux', vetements=['mindfront_knitted_sweater_01', 'mindfront_male_trousers_2', 'mindfront_shoes_biker_boots_male'], graine=92)
    H.marcher(b, 1, f1, (-58, 186), (-57, 186 + f1 / 24 * 0.9), 'marche')
    baton = A.cylindre(0, 0, 0, 0.02, 1.5, A.mat_tex('bark_brown_01', 3), 6); baton.parent = b; baton.parent_type = 'BONE'; baton.parent_bone = 'wrist.R'
    r = H.humain('rose', 'f', 'vieux', vetements=['janexx_old_female_sweater', 'mindfront_female_trousers_1'], graine=93)
    H.marcher(r, 1, f1, (-56.5, 185), (-55.5, 185 + f1 / 24 * 0.9), 'traine', base='mains_bouche')
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.18, radius2=0.1, depth=0.3); cl = bpy.context.active_object
    cl.data.materials.append(A.mat_uni(V.lin('#8a6a32'), 0.35, 1.0)); cl.parent = r; cl.parent_type = 'BONE'; cl.parent_bone = 'spine01'; cl.location = (0, 0.25, -0.2)
    cams = [[(1, (62, 187.5, 38.8), (0, 520, 20)), (f1, (56, 187.5, 39.2), (-60, 560, 15))],
            [(1, (-50, 175, 14), (-57, 192, 1)), (f1, (-52, 180, 9), (-56, 196, 1))],
            [(1, (58, 187.5, 39), (-50, 240, 0)), (f1, (58, 187.5, 40), (-60, 330, 0))]][n]
    T.camera(cams, lens=[30, 45, 35][n])
    return 1, f1

# ───────────────────────── CHAPITRE 2 ─────────────────────────
def jean_moulin(T):
    f1 = frames(8000)
    T.lumiere('mistral')
    rnd = random.Random(101)
    N.terrain(1500, 'aerial_grass_rock', '#d8d0a8', 1.0, 0.03, 120)
    N.collines(rnd, 10)
    V.boite(0, 0, -0.02, 400, 9, 0.04, A.mat_tex('asphalt_floor', 0.25))
    A.cylindre(0, 18, 0, 9, 0.35, A.mat_tex('gravelly_sand', 0.3), 48)
    V.boite(0, 18, 0.35, 3.2, 3.2, 4.2, A.mat_tex('white_sandstone_blocks_02', 0.5))
    # la statue : un homme de bronze, les bras levés au ciel ; un drap blanc noué aux poignets
    st = H.humain('statue', 'h', 'adulte', vetements=['male_elegantsuit01'], cheveux='short02', graine=102)
    st.location = (0, 18, 4.55); st.scale = (2.3, 2.3, 2.3)
    H.poser(st, 'debout', {'upperarm01.L': [(H.Y, -60)], 'upperarm01.R': [(H.Y, 60)], 'lowerarm01.L': [(H.X, -20)], 'lowerarm01.R': [(H.X, -20)], 'head': [(H.X, -15)]}); H.figer(st, 1)
    bronze = A.mat_uni(V.lin('#5a4a34'), 0.35, 1.0)
    for o in H.membres(st):
        if o.type == 'MESH':
            for sl in o.material_slots: sl.material = bronze
    bpy.context.view_layer.update()
    mg = st.matrix_world @ st.pose.bones['wrist.L'].head; md = st.matrix_world @ st.pose.bones['wrist.R'].head
    bpy.ops.mesh.primitive_plane_add(size=1, location=((mg.x + md.x) / 2, 18.4, (mg.z + md.z) / 2 - 0.9)); drap = bpy.context.active_object
    drap.scale = (abs(mg.x - md.x), 1.8, 1); drap.rotation_euler = (math.pi / 2, 0, 0); drap.data.materials.append(A.mat_tex('rough_linen', 1, teinte=V.lin('#f4f2ea')))
    s = drap.modifiers.new('sub', 'SUBSURF'); s.levels = 3; s.subdivision_type = 'SIMPLE'
    w = drap.modifiers.new('vent', 'WAVE'); w.height = 0.18; w.width = 0.9; w.speed = 0.35; w.use_normal = True
    so = drap.modifiers.new('epaisseur', 'SOLIDIFY'); so.thickness = 0.02
    drap.data.materials.clear(); drap.data.materials.append(A.mat_uni(V.lin('#ecebe4'), 0.9))
    drap.location.y -= 0.6
    for k in range(10): V.platane(-30 + k * 12, -12, 1.0, k)
    T.camera([(1, (5, 2, 1.6), (0, 18, 7)), (f1, (2.5, 8, 2.0), (0, 18, 10))], lens=24)
    return 1, f1

def plaine_route(T):
    f1 = frames(8000)
    T.lumiere('matin')
    rnd = random.Random(111)
    N.terrain(1500, 'aerial_grass_rock', '#c8bc8a', 0.6, 0.03, 120)
    N.collines(rnd, 9, 500, 1100)
    N.oliveraie(-60, 18, 20, 9, 7, rnd)
    M = foule_modeles(6, 112)
    for k in range(12):   # la file : enfants et adultes, sacs, bidons
        x0 = -40 + k * 2.4
        r = H.doubler(M[k % len(M)], f'marcheur{k}')
        H.marcher(r, 1, f1, (x0, 12.5 + rnd.uniform(-0.4, 0.4)), (x0 + 9, 12.5 + rnd.uniform(-0.4, 0.4)), 'marche', phase=k)
        if k % 3 == 0: r.scale = (0.75, 0.75, 0.75)
    T.camera([(1, (-50, -6, 3.5), (-30, 14, 1.4)), (f1, (-22, -4, 3.0), (-5, 14, 1.4))], lens=35)
    return 1, f1

def cales(T, n):
    f1 = frames([8000, 6000][n])
    T.lumiere('aube' if n == 0 else 'mistral')
    rnd = random.Random(121)
    N.terrain(1500, 'aerial_grass_rock', '#c8bc96', 1.0, 0.03, 120)
    N.collines(rnd, 8, 600, 1200)
    N.falaise(0, 40, 140, 32, 14, rnd, grottes=58, feux=12)
    N.falaise(-40, 95, 120, 40, 14, rnd, grottes=58, feux=10)
    for k in range(40): N.pin(rnd.uniform(-80, 80), rnd.uniform(-10, 25), rnd, 0.8)
    for k in range(30): N.cypres(rnd.uniform(-90, 90), rnd.uniform(-40, -5), rnd)
    cams = [[(1, (-70, -50, 8), (-20, 40, 14)), (f1, (-20, -45, 10), (20, 40, 16))],
            [(1, (-20, -45, 10), (20, 40, 16)), (f1, (5, -40, 12), (-40, -400, 20))]][n]
    T.camera(cams, lens=[30, 35][n])
    return 1, f1

# ───────────────────────── VIEUX-VERNÈGUES : les bougies dans les ruines ─────────────────────────
def vernegues(T, n):
    f1 = frames([8000, 8000, 6000][n])
    T.lumiere('nuit')
    rnd = random.Random(131)
    N.terrain(800, 'aerial_grass_rock', '#a8a088', 2.0, 0.04, 100)
    pierre = A.mat_tex('old_stone_wall', 0.4)
    for k in range(26):   # pans de murs effondrés
        x, y = rnd.uniform(-30, 30), rnd.uniform(-10, 40); l = rnd.uniform(3, 9); h = rnd.uniform(1.5, 6)
        m = V.boite(x, y, 0, l, 0.6, h, pierre); m.rotation_euler.z = rnd.choice([0, math.pi / 2]) + rnd.uniform(-0.05, 0.05)
        for v in m.data.vertices:
            if v.co.z > 0: v.co.z += rnd.uniform(-h * 0.5, h * 0.2)
    eglise = V.boite(0, 30, 0, 14, 0.8, 9, A.mat_tex('white_sandstone_blocks_02', 0.4))
    bpy.ops.object.text_add(location=(-4.2, 29.55, 3.2)); tx = bpy.context.active_object; tx.data.body = 'UN POUR UN'
    tx.rotation_euler = (math.pi / 2, 0, 0); tx.scale = (1.1, 1.1, 1.1); tx.data.materials.append(A.mat_uni(V.lin('#f2f0e8'), 0.95))
    cire = A.mat_uni(V.lin('#f0e8d0'), 0.6, emission=(1.0, 0.6, 0.25, 3.0))
    for k in range(260):   # des centaines de bougies
        x, y = rnd.uniform(-25, 25), rnd.uniform(-8, 29)
        A.cylindre(x, y, 0, 0.025, rnd.uniform(0.06, 0.18), cire, 6)
        if k % 10 == 0:
            ld = bpy.data.lights.new('bougies', 'POINT'); ld.energy = 30; ld.color = (1.0, 0.6, 0.28)
            l = bpy.data.objects.new('bougies', ld); l.location = (x, y, 0.4); bpy.context.scene.collection.objects.link(l)
            for f in range(1, f1 + 1, 5): ld.energy = 30 * (0.8 + 0.2 * math.sin(f * 1.1 + k)); ld.keyframe_insert('energy', frame=f)
    if n >= 1:   # des revenus assis, qui mangent, jouent aux cartes
        M = foule_modeles(6, 132, zombie=True)
        for k in range(10):
            r = H.doubler(M[k % len(M)], f'rev{k}'); r.location = (rnd.uniform(-10, 10), rnd.uniform(0, 16), 0.0)
            H.orienter(r, rnd.random() * 6.28); H.respirer(r, 1, f1, 'genoux', graine=k)
    cams = [[(1, (-30, -20, 6), (0, 10, 1)), (f1, (-10, -18, 5), (5, 15, 1))],
            [(1, (-6, -4, 2.4), (2, 8, 0.8)), (f1, (4, -2, 2.2), (2, 14, 1))],
            [(1, (1, 18, 2.0), (0, 29.5, 4)), (f1, (0.5, 24, 3.5), (0, 29.5, 3.8))]][n]
    T.camera(cams, lens=[30, 32, 30][n])
    return 1, f1

# ───────────────────────── BA 701 ─────────────────────────
def ba701(T, n):
    f1 = frames([7000, 8000, 6000][n])
    T.lumiere('mistral')
    rnd = random.Random(141)
    N.terrain(2000, 'aerial_grass_rock', '#d8cc9a', 0.3, 0.03, 80)
    N.collines(rnd, 7, 900, 1500, hmax=120)
    V.boite(0, 0, 0, 1200, 45, 0.05, A.mat_tex('asphalt_floor', 0.08, teinte=V.lin('#c8c8c4')))
    for k in range(-60, 60): V.boite(k * 10, 0, 0.051, 5, 0.6, 0.002, A.mat_uni(V.lin('#e8e8e0'), 0.6))
    for k in range(9): N.avion(-40 + k * 12, 14, 0, -math.pi / 2)
    # le rond-point de l'École de l'air : le Fouga Magister cabré sur son mât
    A.cylindre(-120, -60, 0, 8, 0.4, A.mat_tex('gravelly_sand', 0.3), 40)
    A.cylindre(-120, -60, 0, 0.3, 6, A.mat_uni(V.lin('#c8c8c8'), 0.4, 0.8), 12)
    N.avion(-120, -60, 6, 0.4, ('#d8d8d0', '#d8d8d0', '#c0182a'), 0.9)
    av = [o for o in bpy.data.objects if o.name.startswith('groupe')][-1]; av.rotation_euler = (0, math.radians(-35), 0.4)
    # les chaussures militaires, rangées par pointure
    cuir = A.mat_uni(V.lin('#141210'), 0.35, 0.1)
    for i in range(30):
        for j in range(20):
            for s in (-0.08, 0.08): V.boite(60 + i * 0.6 + s, -40 + j * 0.45, 0, 0.11, 0.3, 0.18, cuir)
    cams = [[(1, (-135, -78, 3), (-120, -60, 7)), (f1, (-128, -76, 2.2), (-120, -60, 9))],
            [(1, (-60, -12, 2.5), (0, 14, 2)), (f1, (40, -14, 2.8), (40, 14, 2))],
            [(1, (55, -48, 1.8), (66, -36, 0)), (f1, (62, -46, 1.2), (70, -34, 0))]][n]
    T.camera(cams, lens=[30, 28, 35][n])
    return 1, f1

# ───────────────────────── LE MISTRAL, LA LIGNE DE FEU ─────────────────────────
def crau(T, n, colonne=False):
    f1 = frames(7000)
    T.lumiere('mistral')
    rnd = random.Random(151 + n)
    N.terrain(1500, 'aerial_grass_rock', '#c8c0a0', 0.5, 0.03, 120)
    N.collines(rnd, 9, 600, 1300)
    N.galets(rnd, (-60, -30, 60, 30), 700)
    cyp = []
    for k in range(16): cyp.append(N.cypres(-30 + k * 4.2, 22, rnd))      # une haie de cyprès coupe-vent
    for k, c in enumerate(cyp):   # les cyprès se plient dans le vent
        for f in range(1, f1 + 1, 6):
            c.rotation_euler = (math.radians(6 + 4 * math.sin(f * 0.25 + k)), 0, c.rotation_euler.z); c.keyframe_insert('rotation_euler', frame=f)
    if colonne:
        M = foule_modeles(6, 152)
        for k in range(14):
            r = H.doubler(M[k % len(M)], f'col{k}')
            H.marcher(r, 1, f1, (-10 + k * 2.6, 60), (-2 + k * 2.6, 64), 'marche', phase=k)
    cams = [[(1, (-40, -20, 1.4), (0, 20, 6)), (f1, (-20, -18, 1.6), (10, 22, 6))],
            [(1, (-10, -10, 2), (10, 40, 3)), (f1, (6, -6, 2.4), (20, 60, 2))]][n]
    T.camera(cams, lens=[24, 32][n])
    return 1, f1

def ligne_de_feu(T, variante):
    f1 = frames(9000 if variante == 'berger' else 7000)
    T.lumiere('incendie')
    rnd = random.Random(161)
    N.terrain(1500, 'aerial_grass_rock', '#a89a78', 0.6, 0.03, 120)
    N.collines(rnd, 8, 600, 1200, teinte='#8a8270')
    for k in range(60): N.pin(rnd.uniform(-120, 120), rnd.uniform(30, 120), rnd, 0.8)
    N.front_de_feu(-150, 150, 60, rnd)
    if variante in ('troupeau', 'berger'):
        S, M = statues_foule(6, 162)
        H.foule_statique(S, points_bande(rnd, -80, 80, -10, 30, 600), f1, 0.6, (0, -1), rnd)
    if variante == 'avions':
        for k in range(3):
            a = N.avion(-400, 300 + k * 30, 120, 0, ('#5a5e60', '#5a5e60', '#5a5e60'))
            g = [o for o in bpy.data.objects if o.name.startswith('groupe')][-1]
            g.keyframe_insert('location', frame=1); g.location = (400, 300 + k * 30, 120); g.keyframe_insert('location', frame=f1)
    cams = {'avions': [(1, (-60, -60, 4), (0, 60, 20)), (f1, (40, -60, 4), (60, 60, 25))],
            'troupeau': [(1, (40, -70, 6), (0, 20, 3)), (f1, (-20, -70, 5), (-10, 30, 4))],
            'berger': [(1, (-80, -70, 5), (0, 60, 10)), (f1, (80, -70, 6), (20, 60, 12))]}[variante]
    T.camera(cams, lens=26)
    return 1, f1

# ───────────────────────── LE PONT DE MALLEMORT ─────────────────────────
def ecrans(T):
    """En une nuit, la vidéo fait le tour du monde : Salon de nuit, vu d'en haut, où des milliers d'écrans s'allument."""
    f1 = frames(7000)
    V.construire_salon('nuit', 7, arbres=(-6, 7))
    T.lumiere('nuit')
    rnd = random.Random(175)
    lum = A.mat_uni((0.02, 0.03, 0.05), 0.3, emission=(0.6, 0.75, 1.0, 0.0))
    p = next(n for n in lum.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    # chaque écran : un petit rectangle bleuté dans une fenêtre, sur une terrasse, dans la rue ; ils s'allument en vague
    ecr = []
    for k in range(1600):
        x = rnd.uniform(-110, 110); y = rnd.choice([rnd.uniform(-15.2, -14.9), rnd.uniform(14.9, 15.2), rnd.uniform(40, 140), rnd.uniform(-12, 12)])
        z = rnd.choice([1.0, 3.8, 6.8, 9.8, 12.8]) if abs(y) > 14 else (rnd.uniform(9, 20) if y > 30 else 1.2)
        ecr.append(V.boite(x, y, z, 0.35, 0.35, 0.25, None, 0))
    groupes = 8
    for g in range(groupes):
        mg = lum.copy(); pg = next(n for n in mg.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        f_on = 1 + int(f1 * 0.8 * g / groupes)
        pg.inputs['Emission Strength'].default_value = 0.0; pg.inputs['Emission Strength'].keyframe_insert('default_value', frame=max(1, f_on - 1))
        pg.inputs['Emission Strength'].default_value = 14.0; pg.inputs['Emission Strength'].keyframe_insert('default_value', frame=f_on + 6)
        for o in ecr[g::groupes]: o.data.materials.append(mg)
    T.camera([(1, (-30, -60, 70), (0, 30, 0)), (f1, (-10, -95, 120), (0, 40, 0))], lens=30)
    return 1, f1

def durance(T, variante):
    f1 = frames({'vibre': 7000, 'colonne': 7000, 'herse': 7000, 'telephone': 5000, 'ecrans': 7000, 'conteneurs': 7000}[variante])
    T.lumiere('mistral' if variante in ('vibre', 'colonne', 'conteneurs') else 'voile')
    rnd = random.Random(171)
    N.terrain(1500, 'aerial_grass_rock', '#b8b08a', 0.5, 0.03, 120, z=0)
    N.collines(rnd, 9, 600, 1300)
    N.eau(0, 0, 1500, 120, z=0.1, coul='#4a6a5e')
    for k in range(40): N.cypres(rnd.uniform(-200, 200), rnd.choice([-70, 75]) + rnd.uniform(-8, 8), rnd)
    N.pont_suspendu(-110, 110, 0, 9, rnd)
    if variante == 'colonne':
        M = foule_modeles(6, 172)
        for k in range(12):
            r = H.doubler(M[k % len(M)], f'pont{k}'); r.location.z = 9.4
            H.marcher(r, 1, f1, (-40 + k * 3, 0.5 * (-1) ** k), (-30 + k * 3, 0.5 * (-1) ** k), 'marche', phase=k)
            r.location.z = 9.4
        for k in range(3):
            ld = bpy.data.lights.new('projecteur', 'SPOT'); ld.energy = 2e6; ld.spot_size = 0.25; ld.color = (0.9, 0.95, 1.0)
            l = bpy.data.objects.new('projecteur', ld); l.location = (140, -30 + k * 30, 20); bpy.context.scene.collection.objects.link(l)
            l.rotation_euler = (math.radians(80), 0, math.radians(90))
    if variante == 'conteneurs':
        for k in range(6):
            c = V.boite(105, -3 + k * 1.2, 9.4, 2.4, 1.1, 2.6, A.mat_tex('container_side', 0.5, teinte=V.lin(rnd.choice(['#8a2a1e', '#2a4a6a', '#5a6a3a']))))
            c.keyframe_insert('rotation_euler', frame=1); c.rotation_euler.x = math.radians(rnd.choice([70, -70])); c.keyframe_insert('rotation_euler', frame=f1)
        S, M = statues_foule(6, 173)
        for o in H.foule_statique(S, points_bande(rnd, -100, 60, -3, 3, 300), None, 0, (1, 0), rnd):
            x0 = o.location.x
            for f in list(range(1, f1, 6)) + [f1]: o.location = (x0 + 1.2 * f / 24, o.location.y, 9.4); o.keyframe_insert('location', frame=f)
    if variante == 'herse':
        h = V.boite(108, 0, 18, 7, 0.3, 9, A.mat_uni(V.lin('#2a2c2e'), 0.5, 0.8))
        h.keyframe_insert('location', frame=1); h.location.z = 9.4; h.keyframe_insert('location', frame=40)
        ld = bpy.data.lights.new('explosion', 'POINT'); ld.color = (1.0, 0.6, 0.3); ld.shadow_soft_size = 30
        l = bpy.data.objects.new('explosion', ld); l.location = (600, 200, 20); bpy.context.scene.collection.objects.link(l)
        for f, e in ((1, 0), (90, 0), (96, 8e7), (130, 1e7), (f1, 2e6)): ld.energy = e; ld.keyframe_insert('energy', frame=f)
    if variante == 'telephone':   # le téléphone posé sur les planches du pont : « Vidéo envoyée. »
        tel = V.boite(0, 0, 9.4, 0.075, 0.155, 0.009, A.mat_uni((0.02, 0.02, 0.02), 0.2, 0.5))
        ecran = V.boite(0, 0, 9.409, 0.068, 0.145, 0.001, A.mat_uni((0.05, 0.07, 0.1), 0.2, emission=(0.35, 0.45, 0.6, 0.6)))
        bpy.ops.object.text_add(location=(-0.026, -0.005, 9.4105)); tx = bpy.context.active_object; tx.data.body = 'Vidéo envoyée'
        tx.data.size = 0.0085; tx.data.materials.append(A.mat_uni((1, 1, 1), 0.3, emission=(1, 1, 1, 2.0)))
        coche = V.boite(0, 0.02, 9.4105, 0.012, 0.012, 0.0005, A.mat_uni((0.1, 0.8, 0.3), 0.3, emission=(0.2, 1.0, 0.4, 2.0)))
    cams = {'vibre': [(1, (-150, -60, 6), (-110, 0, 18)), (f1, (-140, -40, 5), (0, 0, 10))],
            'colonne': [(1, (-60, -14, 11), (0, 0, 10)), (f1, (-30, -12, 11), (40, 0, 10))],
            'herse': [(1, (80, -20, 11), (108, 0, 13)), (f1, (70, -24, 12), (300, 120, 15))],
            'telephone': [(1, (0.02, -0.22, 9.62), (0, 0.0, 9.41)), (f1, (0.015, -0.17, 9.56), (0, 0.0, 9.41))],
            'ecrans': [(1, (0, -40, 30), (0, 60, 10)), (f1, (0, -80, 60), (0, 80, 0))],
            'conteneurs': [(1, (60, -30, 14), (105, 0, 10)), (f1, (40, -34, 16), (90, 0, 10))]}[variante]
    T.camera(cams, lens=30 if variante != 'telephone' else 50, f_dof=variante == 'telephone', ouverture=2.0)
    return 1, f1

# ───────────────────────── LE CAMP, LE GYMNASE ─────────────────────────
def camp(T, n):
    f1 = frames([8000, 6000][n])
    T.lumiere('voile')
    rnd = random.Random(181)
    N.terrain(1500, 'aerial_grass_rock', '#b8b090', 0.4, 0.03, 100)
    N.collines(rnd, 8, 700, 1300)
    N.eau(0, 120, 1500, 140, z=0.1, coul='#5a6a6a')
    for i in range(12):
        for j in range(8): N.tente_camp(-60 + i * 9 + rnd.uniform(-1, 1), -20 + j * 9 + rnd.uniform(-1, 1), rnd.choice([0, math.pi / 2]), rnd)
    _, cloche = N.chapelle(30, 62, 0.0)                                                    # la chapelle et sa cloche
    if n == 1:
        cloche.rotation_mode = 'XYZ'
        for f in range(1, f1 + 1, 3): cloche.rotation_euler.x = math.radians(25 * math.sin(f / 24 * 2.4)); cloche.keyframe_insert('rotation_euler', frame=f)
    M = foule_modeles(6, 182)
    for k in range(10):
        r = H.doubler(M[k % len(M)], f'refugie{k}'); x0, y0 = rnd.uniform(-50, 30), rnd.uniform(-20, 40)
        H.marcher(r, 1, f1, (x0, y0), (x0 + rnd.uniform(-5, 5), y0 + rnd.uniform(-5, 5)), 'traine', phase=k)
    cams = [[(1, (-80, -50, 10), (-10, 20, 0)), (f1, (-40, -50, 8), (20, 30, 0))],
            [(1, (14, 26, 2.0), (30, 54, 8)), (f1, (22, 38, 1.8), (30, 54, 9))]][n]
    T.camera(cams, lens=[28, 30][n])
    return 1, f1

def gymnase(T, n):
    f1 = frames([9000, 6000][n])
    T.monde_uni((0.03, 0.035, 0.04), 0.3)
    rnd = random.Random(191)
    salle(-20, 20, -12, 12, 9, mur='concrete', teinte='#e4e6e2', sol='old_wooden_floor_01')   # béton peint, parquet de salle de sport
    for i in range(6):
        for j in range(3): neon(-15 + i * 6, -8 + j * 8, 9, 900)
    for i in range(40):
        for j in range(10): N.housse_blanche(-18.5 + i * 0.95, -10 + j * 2.3, 0, rnd)
    affiche = V.boite(0, 11.9, 3, 4, 0.02, 2.6, A.mat_uni(V.lin('#f0ece0'), 0.7))
    bpy.ops.object.text_add(location=(-1.85, 11.85, 4.6)); tx = bpy.context.active_object; tx.data.body = 'LE DON,\nUN ACTE RESPONSABLE'
    tx.rotation_euler = (math.pi / 2, 0, 0); tx.scale = (0.32, 0.32, 0.32); tx.data.materials.append(A.mat_uni(V.lin('#1e3a8a'), 0.5))
    # buée : un léger brouillard froid au ras du sol
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.6)); c = bpy.context.active_object; c.scale = (40, 24, 1.2)
    mm = bpy.data.materials.new('buee'); mm.use_nodes = True; nt = mm.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); v = nt.nodes.new('ShaderNodeVolumePrincipled'); v.inputs['Density'].default_value = 0.08
    nt.links.new(v.outputs[0], out.inputs['Volume']); c.data.materials.append(mm)
    if n == 0:
        M = foule_modeles(6, 192)
        for k in range(8):
            r = H.doubler(M[k % len(M)], f'famille{k}')
            H.marcher(r, 1, f1, (-19 + k * 0.9, -11.3), (-14 + k * 0.9, -11.3), 'traine', phase=k)
    cams = [[(1, (-19, -11, 4), (0, 2, 0)), (f1, (-10, -11, 5), (10, 4, 0))],
            [(1, (0, 4, 2), (0, 11.9, 4)), (f1, (0, 8, 3), (0, 11.9, 4.2))]][n]
    T.camera(cams, lens=[24, 35][n])
    return 1, f1

# ───────────────────────── LES FINS DE LA TRANSHUMANCE ─────────────────────────
def troupeau_feu(T, n):
    f1 = frames([8000, 8000, 7000, 5000][n])
    T.lumiere('incendie')
    rnd = random.Random(201)
    N.terrain(1500, 'aerial_grass_rock', '#8a7a60', 0.6, 0.03, 120)
    N.collines(rnd, 8, 600, 1200, teinte='#6a6050')
    N.front_de_feu(-150, 150, 70, rnd, hauteur=12)
    S, M = statues_foule(8, 202)
    if n < 3: H.foule_statique(S, points_bande(rnd, -60, 60, -60, 20, 900), f1, 0.5 if n else 0.0, (0, 1), rnd, regard=(0, 40) if n == 0 else None)
    moi = H.humain('moi', 'h', 'adulte', graine=203, zombie=True); rose = H.humain('rose', 'f', 'vieux', graine=93, vetements=['janexx_old_female_sweater', 'mindfront_female_trousers_1'])
    if n in (1, 2):
        H.marcher(moi, 1, f1, (0, 24), (0, 24 + f1 / 24 * 0.9), 'marche'); H.marcher(rose, 1, f1, (0.55, 24), (0.55, 24 + f1 / 24 * 0.9), 'traine')
    if n == 3:   # la cloche au sol, dans la cendre
        bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.25, radius2=0.14, depth=0.4, location=(0, 30, 0.2)); cl = bpy.context.active_object
        cl.rotation_euler = (math.radians(80), 0, 0.4); cl.data.materials.append(A.mat_uni(V.lin('#5a4422'), 0.5, 1.0))
        moi.location = (0, -50, 0); rose.location = (2, -50, 0)
    cams = [[(1, (0, -20, 6), (0, 40, 2)), (f1, (0, -10, 4), (0, 40, 3))],
            [(1, (4, 18, 1.8), (0, 30, 1.4)), (f1, (4, 26, 1.8), (0, 40, 1.4))],
            [(1, (0, 16, 1.6), (0, 60, 4)), (f1, (0, 22, 1.7), (0, 70, 8))],
            [(1, (1.7, 28.2, 1.0), (0, 30, 0.2)), (f1, (1.4, 28.5, 0.85), (0, 30, 0.2))]][n]
    T.camera(cams, lens=[28, 35, 30, 40][n], f_dof=n == 3, ouverture=2.8)
    return 1, f1

def ventoux(T, n):
    f1 = frames([9000, 8000, 7000][n])
    T.lumiere('aube' if n == 0 else 'matin')
    rnd = random.Random(211)
    N.terrain(3000, 'aerial_grass_rock', '#b8b090', 3.0, 0.02, 150)
    bpy.ops.mesh.primitive_cone_add(vertices=96, radius1=2600, radius2=60, depth=1700, location=(0, 4200, 850))
    mt = bpy.context.active_object
    m = bpy.data.materials.new('ventoux'); m.use_nodes = True; nt = m.node_tree; p = nt.nodes.get('Principled BSDF')
    gr = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); rp = nt.nodes.new('ShaderNodeValToRGB')
    rp.color_ramp.elements[0].position = 0.55; rp.color_ramp.elements[0].color = (*V.lin('#5a6a3a'), 1); rp.color_ramp.elements[1].position = 0.72; rp.color_ramp.elements[1].color = (*V.lin('#f0ece2'), 1)
    nt.links.new(gr.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], p.inputs['Base Color'])
    mt.data.materials.append(m)
    with bpy.context.temp_override(object=mt, active_object=mt, selected_objects=[mt], selected_editable_objects=[mt]): bpy.ops.object.shade_smooth()
    tx = bpy.data.textures.new('ventoux', 'CLOUDS'); tx.noise_scale = 0.3
    s = mt.modifiers.new('sub', 'SUBSURF'); s.levels = 3; s.subdivision_type = 'SIMPLE'; d = mt.modifiers.new('relief', 'DISPLACE'); d.texture = tx; d.strength = 120
    S, M = statues_foule(6, 212)
    H.foule_statique(S, points_bande(rnd, -40, 40, 20, 160, 700), f1, 0.4, (0, 1), rnd)
    if n == 1:
        r = H.doubler(M[0], 'revenu'); r.location = (2, 18, 0); H.orienter(r, math.pi)
        for f in range(1, f1 + 1, 3):
            t = min(1, f / (f1 * 0.7)); H.poser(r, 'genoux' if t < 0.4 else 'debout', {'head': [(H.X, 20 * (1 - t))]}); H.figer(r, f)
    cams = [[(1, (-30, -40, 3), (0, 4000, 500)), (f1, (-10, -30, 4), (0, 4000, 800))],
            [(1, (6, 12, 1.6), (2, 18, 0.9)), (f1, (5, 13, 1.8), (2, 18, 1.4))],
            [(1, (0, -20, 3), (0, 3000, 900)), (f1, (0, -10, 3), (0, 4200, 1650))]][n]
    T.camera(cams, lens=[26, 40, 60][n])
    return 1, f1

PLANS.update({
    'souvenir_cloche_1': lambda T: souvenir(T, 0), 'souvenir_cloche_2': lambda T: souvenir(T, 1),
    'souvenir_cloche_3': lambda T: souvenir(T, 2), 'souvenir_cloche_4': lambda T: souvenir(T, 3),
    'nuit_sonnailles_1': lambda T: sonnailles(T, 0), 'nuit_sonnailles_2': lambda T: sonnailles(T, 1), 'nuit_sonnailles_3': lambda T: sonnailles(T, 2),
    'aube_troupeau_1': lambda T: aube_troupeau(T, 0), 'aube_troupeau_2': lambda T: aube_troupeau(T, 1), 'aube_troupeau_3': lambda T: aube_troupeau(T, 2),
    'ch2_intro_1': jean_moulin, 'ch2_intro_2': plaine_route, 'ch2_intro_3': lambda T: cales(T, 0), 'ch2_intro_4': lambda T: cales(T, 1),
    'vernegues_1': lambda T: vernegues(T, 0), 'vernegues_2': lambda T: vernegues(T, 1), 'vernegues_3': lambda T: vernegues(T, 2),
    'ba701_1': lambda T: ba701(T, 0), 'ba701_2': lambda T: ba701(T, 1), 'ba701_3': lambda T: ba701(T, 2),
    'le_mistral_1': lambda T: crau(T, 0), 'le_mistral_2': lambda T: crau(T, 1, colonne=True), 'le_mistral_3': lambda T: ligne_de_feu(T, 'avions'),
    'pont_mallemort_1': lambda T: durance(T, 'vibre'), 'pont_mallemort_2': lambda T: durance(T, 'colonne'), 'pont_mallemort_3': lambda T: ligne_de_feu(T, 'troupeau'),
    'fin_cautere_1': lambda T: durance(T, 'herse'), 'fin_cautere_2': lambda T: ligne_de_feu(T, 'berger'), 'fin_cautere_3': lambda T: camp(T, 0), 'fin_cautere_4': lambda T: camp(T, 1),
    'fin_voix_1': lambda T: durance(T, 'telephone'), 'fin_voix_2': ecrans, 'fin_voix_3': lambda T: gymnase(T, 0), 'fin_voix_4': lambda T: gymnase(T, 1),
    'fin_transhumance_feu_1': lambda T: troupeau_feu(T, 0), 'fin_transhumance_feu_2': lambda T: troupeau_feu(T, 1),
    'fin_transhumance_feu_3': lambda T: troupeau_feu(T, 2), 'fin_transhumance_feu_4': lambda T: troupeau_feu(T, 3),
    'fin_transhumance_estive_1': lambda T: durance(T, 'conteneurs'), 'fin_transhumance_estive_2': lambda T: ventoux(T, 0),
    'fin_transhumance_estive_3': lambda T: ventoux(T, 1), 'fin_transhumance_estive_4': lambda T: ventoux(T, 2),
})
