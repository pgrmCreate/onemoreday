# ============ One More Day — les PLANS tournés (un plan = une fonction) ============
# Chaque plan reçoit (T) le module de tournage et renvoie (f0, f1). Il construit (ou charge) son décor, règle la lumière,
# place la caméra et les acteurs. Le nom du plan est celui du clip (img/cine/clips/<nom>.webm) et de la clé `clip` du script
# (js/data/cinematiques.js). Durées : celles des plans du script (ms → frames à 24 i/s).
import math, random, bpy
import omd_assets as A
import omd_ville as V
import omd_humains as H

def frames(ms): return max(24, round(ms / 1000 * 24))

def foule_modeles(n, graine, zombie=False, ages=('jeune', 'adulte', 'adulte', 'vieux')):
    rnd = random.Random(graine)
    out = []
    for k in range(n):
        sexe = 'h' if k % 2 == 0 else 'f'
        r = H.humain(f'm{graine}_{k}', sexe, rnd.choice(ages), poids=rnd.uniform(0.35, 0.75), muscle=rnd.uniform(0.3, 0.7),
                     taille=rnd.uniform(0.35, 0.7), graine=graine * 100 + k, zombie=zombie)
        r.location = (0, 0, -500); out.append(r)
    return out

def passant(modeles, k, f0, f1, de, vers, allure='marche', rnd=None):
    rnd = rnd or random.Random(k)
    r = H.doubler(modeles[k % len(modeles)], f'p{k}')
    H.marcher(r, f0, f1, de, vers, allure, phase=rnd.random() * 6)
    return r

def immobile(modeles, k, f0, f1, pos, angle, pose='debout'):
    r = H.doubler(modeles[k % len(modeles)], f'i{k}')
    r.location = (*pos, 0); H.orienter(r, angle)
    H.respirer(r, f0, f1, pose, graine=k)
    return r

# ───────────────────────── INTRO 1 : le cours un mercredi de grand marché ─────────────────────────
def intro_1(T):
    rnd = V.construire_salon('marche', 7, arbres=(-7, 4))
    T.lumiere('matin')
    f1 = frames(9000)
    # le marché, entre les deux rangées de platanes
    for k in range(-9, 3):     # deux rangs d'étals face à face, l'allée au milieu
        V.etal(k * 3.0, 2.3, math.pi, rnd); V.etal(k * 3.0 + 1.5, -2.3, 0, rnd)
    for x in (-46, -31, -20, -3, 12, 30):
        V.voiture_rue(x + rnd.uniform(-1, 1), -10.5, 0, rnd.choice(['#5a1e1e', '#1e2e4a', '#b8b4a8', '#8a8a86', '#2a4a3a']), rnd)
    for x in (-39, -26, -12, 6, 22):
        V.voiture_rue(x + rnd.uniform(-1, 1), 10.5, math.pi, rnd.choice(['#3a3a3a', '#b8b4a8', '#6a5a3a', '#1a1a1a']), rnd)
    print('[intro_1] décor posé', flush=True)
    M = foule_modeles(8, 11)
    print('[intro_1] modèles faits', flush=True)
    n = 0
    for k in range(16):
        y = rnd.uniform(-0.9, 0.9)
        x0 = rnd.uniform(-38, -5); sens = rnd.choice([-1, 1])
        passant(M, n, 1, f1, (x0, y), (x0 + sens * rnd.uniform(5, 9), y + rnd.uniform(-0.5, 0.5)), 'marche', random.Random(n)); n += 1
    for k in range(10):    # clients arrêtés devant les étals
        x = rnd.uniform(-30, 2)
        cote = rnd.choice([-1, 1])
        immobile(M, n, 1, f1, (x, cote * 1.25), 0 if cote > 0 else math.pi); n += 1
    T.camera([(1, (-36, -1.2, 3.4), (-14, 1.0, 1.6)), (110, (-22, -0.6, 3.0), (-6, 6, 2.6)), (f1, (-7, 4.5, 2.0), (0, 40, 16))], lens=24)
    return 1, f1

# ───────────────────────── INTRO 2 : 10 h 40, la panique ─────────────────────────
def intro_2(T):
    rnd = V.construire_salon('panique', 7, arbres=(-6, 3))
    T.lumiere('voile')
    f1 = frames(8000)
    for k in range(-7, 3):
        V.etal(k * 4.2 - 2, 1.6, 0, rnd, renverse=rnd.random() < 0.5); V.etal(k * 4.2, -1.6, math.pi, rnd, renverse=rnd.random() < 0.5)
    for x in (-46, -31, -20, -3, 12):
        V.voiture_rue(x, -10.5, rnd.uniform(-0.3, 0.3), rnd.choice(['#5a1e1e', '#1e2e4a', '#b8b4a8']), rnd)
    M = foule_modeles(8, 23)
    n = 0
    for k in range(18):    # on fuit dans les deux sens
        y = rnd.uniform(-8, 8); x0 = rnd.uniform(-40, -8); sens = rnd.choice([-1, 1])
        passant(M, n, 1, f1, (x0, y), (x0 + sens * rnd.uniform(14, 22), y + rnd.uniform(-3, 3)), 'panique', random.Random(n)); n += 1
    # la silhouette penchée sur un corps, au premier plan
    corps = H.doubler(M[1], 'corps'); H.poser(corps, 'allonge'); H.coucher(corps, True, 1.2); corps.location = (-22, -4.8, 0.12)
    pen = H.doubler(M[2], 'penchee'); pen.location = (-21.6, -4.2, 0); H.orienter(pen, 2.6); H.respirer(pen, 1, f1, 'penche', ampl=4)
    # au fond, une voiture de police, gyrophare bleu
    V.voiture_rue(6, 8, 0.4, '#e8e6e0', rnd)
    ld = bpy.data.lights.new('gyro', 'POINT'); ld.color = (0.15, 0.3, 1.0); g = bpy.data.objects.new('gyro', ld); g.location = (6, 8, 1.8); bpy.context.scene.collection.objects.link(g)
    for f in range(1, f1 + 1, 6): ld.energy = 4000 if (f // 6) % 2 else 0; ld.keyframe_insert('energy', frame=f)
    cle = []
    for f in range(1, f1 + 1, 8):   # caméra à l'épaule : légère secousse
        t = f / f1
        cle.append((f, (-35 + 7 * t + rnd.uniform(-0.06, 0.06), -9.2 + 0.8 * t + rnd.uniform(-0.05, 0.05), 2.4 - 0.4 * t + rnd.uniform(-0.05, 0.05)), (-22.5 + 0.7 * t, -4.6, 1.2 - 0.4 * t)))
    T.camera(cle, lens=32)
    return 1, f1

# ───────────────────────── INTRO 4 : trois semaines plus tard, la ville morte ─────────────────────────
def intro_4(T):
    rnd = V.construire_salon('abandon', 7, arbres=(-7, 6))
    T.lumiere('mistral')
    f1 = frames(9000)
    for k in range(-7, 3):
        if rnd.random() < 0.6: V.etal(k * 4.2 - 2, 1.6, rnd.uniform(-0.4, 0.4), rnd, renverse=rnd.random() < 0.6)
    for x in (-50, -33, -18, -5, 9, 24):
        V.voiture_rue(x, rnd.choice([-10.5, -7.5, 10.5]), rnd.uniform(-0.6, 0.6), rnd.choice(['#5a1e1e', '#1e2e4a', '#3a3a3a', '#b8b4a8']), rnd)
    # papiers et feuilles mortes qui filent dans le vent
    feuille = A.mat_uni(V.lin('#9a6a2a'), 0.8); papier = A.mat_uni(V.lin('#e8e2d0'), 0.9)
    for k in range(80):
        p = A.boite(rnd.uniform(-45, 10), rnd.uniform(-12, 12), 0.01, 0.3 if k % 3 == 0 else 0.08, 0.22 if k % 3 == 0 else 0.06, 0.002, papier if k % 3 == 0 else feuille, 0)
        x0 = p.location.x
        for f in range(1, f1 + 1, 12):
            p.location.x = x0 + f * 0.05 * (1 + (k % 5) * 0.4); p.location.z = 0.05 + abs(math.sin(f * 0.07 + k)) * (0.6 if k % 3 == 0 else 0.3)
            p.rotation_euler = (f * 0.1 + k, f * 0.13, f * 0.05); p.keyframe_insert('location', frame=f); p.keyframe_insert('rotation_euler', frame=f)
    # un drone militaire qui passe haut
    dr = A.boite(-80, 20, 40, 0.9, 0.9, 0.18, A.mat_uni((0.05, 0.05, 0.05), 0.5, 0.6), 0)
    dr.keyframe_insert('location', frame=1); dr.location = (60, -10, 45); dr.keyframe_insert('location', frame=f1)
    T.camera([(1, (-42, 7.5, 1.7), (-10, -2, 4)), (f1, (-10, 6.5, 1.9), (25, -6, 5))], lens=30)
    return 1, f1

PLANS = {'intro_1': intro_1, 'intro_2': intro_2, 'intro_4': intro_4}

# ───────────────────────── INTRO 3 : à l'hôpital, la clochette ─────────────────────────
def intro_3(T):
    import omd_interieurs as I
    f1 = frames(8400)
    T.monde_uni((0.02, 0.022, 0.025), 0.3)
    c = I.couloir_hopital(f1)
    # la médecin, penchée sur le troisième brancard ; une clochette posée près de la main du mort
    med = H.humain('medecin', 'f', 'adulte', poids=0.45, vetements=['female_elegantsuit01', 'toigo_flats'], cheveux='ponytail01', graine=77)
    x, y = c['lits'][2]
    med.location = (x + 0.75, y - 0.1, 0); H.orienter(med, -math.pi / 2)
    H.respirer(med, 1, f1, 'penche', ampl=2.5, graine=3)
    cl = A.mat_uni(V.lin('#b08a3a'), 0.3, 1.0)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.035, radius2=0.018, depth=0.06, location=(x + 0.12, y + 0.35, 1.0))
    bpy.context.active_object.data.materials.append(cl)
    papier = A.boite(x + 0.18, y + 0.05, 1.03, 0.07, 0.045, 0.004, A.mat_uni(V.lin('#ece6d4'), 0.8), 0)
    papier.rotation_euler.z = 0.4
    # au fond du couloir, un autre malade debout, attaché à son lit roulant (un mort : il tire sur la sangle)
    z = H.humain('malade', 'h', 'vieux', graine=91, zombie=True, vetements=['elvs_crude_t-shirt_male', 'mindfront_male_trousers_1'])
    z.location = (-0.6, 26, 0); H.orienter(z, math.pi * 0.9); H.respirer(z, 1, f1, 'bras_tendus', ampl=3, graine=5)
    T.camera([(1, (0.2, -1.5, 1.65), (0.1, 20, 1.4)), (f1, (x + 1.2, y - 2.6, 1.25), (x + 0.15, y + 0.1, 0.95))], lens=35, f_dof=True, ouverture=2.8)
    return 1, f1

# ───────────────────────── INTRO 5-6 : dans la housse, un cœur repart ─────────────────────────
def intro_5(T):
    import omd_interieurs as I
    f1 = frames(7000)
    T.monde_uni((0, 0, 0), 0)
    I.housse(f1, (0.0, 0.18))
    T.camera([(1, (0.02, -0.55, 0.02), (0, 0.6, 0.26)), (f1, (0.0, -0.45, 0.03), (0, 0.6, 0.24))], lens=20)
    return 1, f1

def intro_6(T):
    import omd_interieurs as I
    f1 = frames(4000)
    T.monde_uni((0, 0, 0), 0)
    I.housse(f1, (0.18, 0.6))
    T.camera([(1, (0.0, -0.45, 0.03), (0, 0.6, 0.24)), (f1, (0.0, -0.4, 0.035), (0, 0.5, 0.3))], lens=20)
    return 1, f1

PLANS.update({'intro_3': intro_3, 'intro_5': intro_5, 'intro_6': intro_6})

# ───────────────────────── PROLOGUE : les cloches de la Tour de l'Horloge ─────────────────────────
def cloches_balancent(f1, amp=28):
    """La cloche du campanile se balance (et la lumière de la place vibre un peu avec)."""
    cl = [o for o in bpy.data.objects if o.name.startswith('Cone') and o.location.z > 25]
    for o in cl:
        o.rotation_mode = 'XYZ'
        for f in range(1, f1 + 1, 3):
            o.rotation_euler.x = math.radians(amp * math.sin(f / 24 * 2.6)); o.keyframe_insert('rotation_euler', frame=f)

def foule_morts(M, n, zone, f1, regard=None, rnd=None, marche=0, vers=None, pose='debout'):
    """n morts dans la zone (x0, y0, x1, y1). marche : combien avancent vers `vers` ; les autres restent, visage levé si regard."""
    rnd = rnd or random.Random(n)
    out = []
    for k in range(n):
        r = H.doubler(M[k % len(M)], f'z{k}')
        x, y = rnd.uniform(zone[0], zone[2]), rnd.uniform(zone[1], zone[3])
        if k < marche and vers:
            tx, ty = vers[0] + rnd.uniform(-4, 4), vers[1] + rnd.uniform(-3, 3)
            d = math.hypot(tx - x, ty - y); v = rnd.uniform(0.5, 0.9)
            fin = min(f1, int(d / v * 24))
            H.marcher(r, 1, max(24, fin), (x, y), (x + (tx - x) * min(1, f1 / 24 * v / max(d, 0.1)), y + (ty - y) * min(1, f1 / 24 * v / max(d, 0.1))), 'traine', phase=rnd.random() * 6, bras_tendus=k % 3 == 0)
        else:
            r.location = (x, y, 0)
            ang = math.atan2((regard or (0, 44))[1] - y, (regard or (0, 44))[0] - x) + math.pi / 2
            H.orienter(r, ang + rnd.uniform(-0.3, 0.3))
            extra = {'neck01': [(H.X, -18)], 'head': [(H.X, -22 + rnd.uniform(-6, 6))]} if regard else {}
            H.poser(r, pose, extra); H.figer(r, 1)
        out.append(r)
    return out

def pro_cloches_1(T):
    V.construire_salon('nuit', 7, arbres=(-4, 5))
    T.lumiere('nuit')
    f1 = frames(6000)
    cloches_balancent(f1)
    M = foule_modeles(6, 41, zombie=True)
    foule_morts(M, 10, (-30, -10, 30, 12), f1, rnd=random.Random(3), marche=10, vers=(0, 22))
    T.camera([(1, (2, 16, 1.4), (0, 38, 6)), (f1, (1.5, 18, 1.6), (0, 44, 27))], lens=24)
    return 1, f1

def pro_cloches_2(T):
    V.construire_salon('nuit', 7, arbres=(-5, 6))
    T.lumiere('nuit')
    f1 = frames(7000)
    cloches_balancent(f1)
    M = foule_modeles(8, 42, zombie=True)
    foule_morts(M, 34, (-45, -12, 45, 12), f1, rnd=random.Random(4), marche=34, vers=(0, 20))
    T.camera([(1, (-24, -13.5, 3.2), (-2, 14, 4)), (f1, (22, -13.5, 3.4), (2, 16, 4))], lens=26)
    return 1, f1

def pro_cloches_3(T):
    V.construire_salon('nuit', 7, arbres=(-3, 4))
    T.lumiere('nuit')
    f1 = frames(6000)
    M = foule_modeles(6, 43, zombie=True)
    foule_morts(M, 16, (-14, 14, 14, 30), f1, rnd=random.Random(5), marche=16, vers=(0, 30))
    # la porte entrouverte d'une maison de la place, un rai de lumière
    ld = bpy.data.lights.new('rai', 'SPOT'); ld.energy = 600; ld.color = (1.0, 0.7, 0.4); ld.spot_size = 0.5
    l = bpy.data.objects.new('rai', ld); l.location = (-16.0, 25, 1.6); l.rotation_euler = (math.radians(90), 0, math.radians(-90)); bpy.context.scene.collection.objects.link(l)
    T.camera([(1, (-2, 12, 1.7), (-14, 25, 1.6)), (f1, (-8, 19, 1.5), (-16, 25, 1.4))], lens=30, f_dof=True, ouverture=2.0)
    return 1, f1

# ───────────────────────── PROLOGUE : du haut de la tour ─────────────────────────
def pro_sommet_1(T):
    V.construire_salon('nuit', 7, arbres=(-5, 6))
    T.lumiere('nuit')
    f1 = frames(8000)
    M = foule_modeles(10, 51, zombie=True)
    foule_morts(M, 220, (-16, 8, 16, 36), f1, regard=(0, 44, 28), rnd=random.Random(6))
    foule_morts(M, 140, (-40, -12, 40, 10), f1, regard=(0, 44, 28), rnd=random.Random(7))
    T.camera([(1, (-3.5, 40.5, 27.8), (-10, 10, 0)), (f1, (0.5, 40.5, 28.2), (0, 14, 0))], lens=30)
    return 1, f1

def pro_sommet_2(T):
    V.construire_salon('nuit', 7, arbres=(-3, 9))
    T.lumiere('nuit')
    f1 = frames(8000)
    # l'Empéri : une seule fenêtre éclairée ; plus loin, un incendie
    fen = A.boite(64, 163.7, 30, 1.2, 0.3, 1.6, A.mat_uni((0.05, 0.03, 0.01), 0.4, emission=(1.0, 0.65, 0.3, 30.0)), 0)
    ld = bpy.data.lights.new('incendie', 'POINT'); ld.energy = 3e6; ld.color = (1.0, 0.4, 0.12); ld.shadow_soft_size = 20
    lo = bpy.data.objects.new('incendie', ld); lo.location = (180, 260, 10); bpy.context.scene.collection.objects.link(lo)
    for f in range(1, f1 + 1, 4): ld.energy = 3e6 * (0.8 + 0.3 * math.sin(f * 0.7) * math.sin(f * 0.23)); ld.keyframe_insert('energy', frame=f)
    T.camera([(1, (2.0, 46.5, 27.8), (40, 150, 18)), (f1, (3.5, 47.0, 28.0), (75, 170, 28))], lens=45)
    return 1, f1

def pro_sommet_3(T):
    V.construire_salon('nuit', 7, arbres=(-1, 2))
    T.lumiere('nuit')
    f1 = frames(6000)
    ld = bpy.data.lights.new('lune_cadran', 'SPOT'); ld.energy = 900; ld.color = (0.75, 0.82, 1.0); ld.spot_size = 0.4
    l = bpy.data.objects.new('lune_cadran', ld); l.location = (-6, 30, 26); bpy.context.scene.collection.objects.link(l)
    tr = l.constraints.new('TRACK_TO'); tr.target = bpy.data.objects.get('cam_cible') or l; tr.track_axis = 'TRACK_NEGATIVE_Z'
    T.camera([(1, (3, 30, 19), (0, 39.8, 20.5)), (f1, (1.2, 35.5, 20.3), (0, 39.8, 20.5))], lens=40)
    tr.target = bpy.data.objects['cam_cible']
    return 1, f1

PLANS.update({'pro_cloches_1': pro_cloches_1, 'pro_cloches_2': pro_cloches_2, 'pro_cloches_3': pro_cloches_3,
              'pro_sommet_1': pro_sommet_1, 'pro_sommet_2': pro_sommet_2, 'pro_sommet_3': pro_sommet_3})

# ───────────────────────── CHAPITRE 1 : l'aube sur les toits ─────────────────────────
def martinets(n, f1, centre, rnd):
    """Des martinets qui tournent en criant au-dessus des toits (petites ailes en croissant, très rapides)."""
    noir = A.mat_uni((0.02, 0.02, 0.02), 0.6)
    for k in range(n):
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.25, depth=0.05, location=centre)
        o = bpy.context.active_object; o.scale = (1.6, 0.35, 1); o.data.materials.append(noir)
        r = rnd.uniform(8, 30); h = rnd.uniform(-4, 8); ph = rnd.random() * 6; v = rnd.uniform(0.6, 1.2) * (1 if k % 2 else -1)
        for f in range(1, f1 + 1, 2):
            a = ph + f / 24 * v
            o.location = (centre[0] + math.cos(a) * r, centre[1] + math.sin(a) * r * 0.6, centre[2] + h + math.sin(a * 3) * 2)
            o.rotation_euler = (0, math.sin(f) * 0.3, a + math.pi / 2 * (1 if v > 0 else -1)); o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)

def fumee(x, y, z, h=14):
    """Une fumée de cheminée qui monte droite (pas de vent) : colonne de volume."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.8, depth=h, location=(x, y, z + h / 2))
    o = bpy.context.active_object
    m = bpy.data.materials.new('fumee'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); v = nt.nodes.new('ShaderNodeVolumePrincipled')
    v.inputs['Density'].default_value = 0.35; v.inputs['Color'].default_value = (0.75, 0.72, 0.7, 1)
    nt.links.new(v.outputs[0], out.inputs['Volume']); o.data.materials.append(m)

def ch1_intro(T, n):
    V.construire_salon('marche', 7, arbres=(-5, 9))
    T.lumiere('aube')
    rnd = random.Random(60 + n)
    f1 = frames([8000, 8000, 7000][n])
    martinets(18, f1, (10, 70, 30), rnd)
    cams = [
        [(1, (-48, 30, 26), (-10, 90, 16)), (f1, (-28, 34, 27), (20, 120, 20))],
        [(1, (-28, 34, 27), (20, 120, 20)), (f1, (-4, 38, 28), (60, 165, 30))],
        [(1, (-4, 38, 28), (60, 165, 30)), (f1, (6, 40, 27.5), (70, 175, 26))],
    ][n]
    T.camera(cams, lens=[30, 35, 50][n])
    return 1, f1
PLANS.update({'ch1_intro_1': lambda T: ch1_intro(T, 0), 'ch1_intro_2': lambda T: ch1_intro(T, 1), 'ch1_intro_3': lambda T: ch1_intro(T, 2)})
