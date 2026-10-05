# ============ One More Day — HUMAINS des cinématiques (MPFB / MakeHuman, CC0) ============
# humain(...) crée un personnage complet (corps, peau, yeux, cheveux, vêtements, squelette « default ») ; on le pose et on
# l'anime ensuite os par os (rotation autour d'axes du MONDE, plus parlants que les axes locaux des os) :
#   poser(rig, 'debout' | 'penche' | 'genoux' | 'allonge' | 'bras_tendus' | 'assis' | 'mains_bouche')
#   marcher(rig, f0, f1, depart, arrivee, vitesse='marche' | 'course' | 'traine')   (cycle de pas + déplacement)
#   respirer(rig, f0, f1)   (attente vivante : souffle, tête qui bouge un peu)
# Le personnage regarde vers -Y à sa création ; `orienter(rig, angle)` le tourne (0 = vers -Y, pi/2 = vers +X).
# Copier un personnage déjà fait (doubler) est 50 fois plus rapide que d'en créer un : foule = une dizaine de modèles doublés.
import bpy, math, random
from mathutils import Matrix, Vector, Euler, Quaternion
from bl_ext.user_default.mpfb.services.humanservice import HumanService

VETEMENTS_H = [
    ['male_casualsuit01', 'culturalibre_male_boots'], ['male_casualsuit02'], ['male_casualsuit03'], ['male_casualsuit04'],
    ['male_casualsuit05'], ['male_casualsuit06'], ['male_worksuit01'], ['elvs_male_shirt_untucked_bd1', 'elvs_jeans_straight_leg'],
    ['namuhekam_male_polo_shirt', 'mindfront_male_trousers_1'], ['elvs_crude_t-shirt_male', 'cortu_cargo_pants'],
    ['mindfront_knitted_sweater_01', 'mindfront_male_trousers_2', 'mindfront_shoes_biker_boots_male'], ['male_elegantsuit01'],
]
VETEMENTS_F = [
    ['female_casualsuit01'], ['female_casualsuit02'], ['female_elegantsuit01'], ['female_sportsuit01'],
    ['janexx_old_female_sweater', 'mindfront_female_trousers_1'], ['joepal_crude_t-shirt_female', 'elvs_jeans_bootcut'],
    ['mindfront_cardigan_long_open_front', 'mindfront_female_trousers_1'], ['ews_striped_shirt', 'elvs_jeans_straight_leg'],
    ['mindfront_knitted_sweater_02', 'cortu_jeans_shorts'],
]
CHAUSSURES_H = ['shoes01', 'shoes02', 'shoes03', 'shoes05', 'toigo_ankle_boots_male', 'mindfront_shoes_biker_boots_male', 'toigo_mj_cloth_shoes']
CHAUSSURES_F = ['shoes04', 'shoes06', 'toigo_ballet_flats', 'toigo_flats', 'toigo_ankle_boots_female', 'punkduck_female_half-boots']
CHEVEUX_H = ['short01', 'short02', 'short03', 'short04', 'culturalibre_hair_11', None]
CHEVEUX_F = ['bob01', 'bob02', 'long01', 'ponytail01', 'braid01', 'culturalibre_hair_12', 'culturalibre_hair_14', 'o4saken_curly01']
PEAUX = {
    ('h', 'jeune'): ['young_caucasian_male', 'young_caucasian_male2', 'toigo_light_skin_male_bronze', 'young_african_male', 'young_asian_male'],
    ('h', 'adulte'): ['middleage_caucasian_male', 'middleage_african_male', 'onlytheghosts_old_eurasian_male', 'toigo_light_skin_male_freckles'],
    ('h', 'vieux'): ['old_caucasian_male', 'old_african_male', 'onlytheghosts_old_eurasian_male'],
    ('f', 'jeune'): ['young_caucasian_female', 'young_caucasian_female2', 'toigo_light_skin_female_bronze', 'young_african_female', 'young_asian_female'],
    ('f', 'adulte'): ['middleage_caucasian_female', 'middleage_african_female', 'onlytheghosts_middle_aged_eurasian_female', 'callharvey3d_midtoned_female'],
    ('f', 'vieux'): ['old_caucasian_female', 'onlytheghosts_old_eurasian_female', 'old_african_female'],
}
AGES = {'enfant': 0.12, 'jeune': 0.45, 'adulte': 0.62, 'vieux': 0.9}

def humain(nom='perso', sexe='h', age='adulte', poids=0.5, muscle=0.5, taille=0.5, vetements=None, cheveux='?', peau=None,
           graine=None, zombie=False):
    rnd = random.Random(graine if graine is not None else nom)
    hi = HumanService._create_default_human_info_dict()
    ph = hi['phenotype']
    ph['gender'] = 1.0 if sexe == 'h' else 0.0
    ph['age'] = AGES.get(age, 0.6) + (rnd.random() - 0.5) * 0.08
    ph['weight'] = poids; ph['muscle'] = muscle; ph['height'] = taille
    r = rnd.random(); ph['race'] = {'caucasian': 0.8, 'african': 0.1, 'asian': 0.1} if r < 0.7 else ({'caucasian': 0.3, 'african': 0.6, 'asian': 0.1} if r < 0.85 else {'caucasian': 0.4, 'african': 0.1, 'asian': 0.5})
    hi['rig'] = 'default'
    hi['eyes'] = 'high-poly/high-poly.mhclo'; hi['eyebrows'] = 'eyebrow001/eyebrow001.mhclo'; hi['eyelashes'] = 'eyelashes01/eyelashes01.mhclo'
    if cheveux == '?': cheveux = rnd.choice(CHEVEUX_H if sexe == 'h' else CHEVEUX_F)
    if cheveux: hi['hair'] = f'{cheveux}/{cheveux}.mhclo'
    vet = list(vetements if vetements is not None else rnd.choice(VETEMENTS_H if sexe == 'h' else VETEMENTS_F))
    if not any(('boot' in v or 'shoe' in v or 'flats' in v) for v in vet):   # toujours des chaussures
        vet.append(rnd.choice(CHAUSSURES_H if sexe == 'h' else CHAUSSURES_F))
    hi['clothes'] = [f'{v}/{v}.mhclo' for v in vet]
    cle_age = 'jeune' if age in ('enfant', 'jeune') else age
    pe = peau or rnd.choice(PEAUX.get((sexe, cle_age), PEAUX[(sexe, 'adulte')]))
    hi['skin_mhmat'] = f'{pe}/{pe}.mhmat'; hi['skin_material_type'] = 'ENHANCED_SSS'
    hi['alternative_materials'] = {}
    st = HumanService.get_default_deserialization_settings(); st['subdiv_levels'] = 0
    avant = set(bpy.data.objects)
    bm = HumanService.deserialize_from_dict(hi, st)
    neufs = [o for o in bpy.data.objects if o not in avant]
    rig = next((o for o in neufs if o.type == 'ARMATURE'), None)
    rig.name = nom
    for o in neufs:
        if o is not rig and o.parent is None: o.parent = rig
    if zombie: zombifier(neufs, rnd)
    rig['omd_humain'] = 1
    return rig

def membres(rig):
    out = []
    def f(o):
        for c in o.children: out.append(c); f(c)
    f(rig); return out

def zombifier(objs, rnd):
    """Peau grise et marbrée, vêtements salis et tachés de sang (teinte sur les matières, sans changer de modèle)."""
    for o in objs:
        if any(k in o.name.lower() for k in ('hair', 'short', 'bob', 'long', 'braid', 'pony', 'curly', 'eyebrow', 'eyelash', 'high-poly', 'afro')): continue
        for slot in getattr(o, 'material_slots', []):
            m = slot.material
            if not m or not m.use_nodes or m.get('omd_z'): continue
            m = m.copy(); slot.material = m; m['omd_z'] = 1
            nt = m.node_tree
            bsdf = next((n for n in nt.nodes if n.type in ('BSDF_PRINCIPLED', 'GROUP')), None)
            peau = 'skin' in m.name.lower() or 'body' in m.name.lower() or o.name.endswith('Human')
            # nœud de mélange avant la sortie : couleur grise-verdâtre (peau) ou boue + sang (vêtements)
            sortie = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
            if not sortie or not sortie.inputs[0].links: continue
            src = sortie.inputs[0].links[0].from_socket
            mix = nt.nodes.new('ShaderNodeMixShader')
            p2 = nt.nodes.new('ShaderNodeBsdfPrincipled')
            noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 3.0 if peau else 6.0; noise.inputs['Detail'].default_value = 8
            ramp = nt.nodes.new('ShaderNodeValToRGB')
            ramp.color_ramp.elements[0].position = 0.45 if peau else 0.55; ramp.color_ramp.elements[1].position = 0.75
            nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
            if peau:   # gris cendre marbré de veines sombres : presque toute la peau change
                p2.inputs['Base Color'].default_value = (0.26, 0.27, 0.23, 1); p2.inputs['Roughness'].default_value = 0.5
                p2.inputs['Subsurface Weight'].default_value = 0.15
                ramp.color_ramp.elements[0].color = (0.62, 0.62, 0.62, 1); ramp.color_ramp.elements[1].color = (0.92, 0.92, 0.92, 1)
                nt.links.new(ramp.outputs['Color'], mix.inputs['Fac'])
            else:
                p2.inputs['Base Color'].default_value = (0.13, 0.015, 0.012, 1); p2.inputs['Roughness'].default_value = 0.35
                nt.links.new(ramp.outputs['Color'], mix.inputs['Fac'])
            nt.links.new(src, mix.inputs[1]); nt.links.new(p2.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], sortie.inputs[0])

def doubler(rig, nom=None):
    """Copie (données partagées : rapide et léger) d'un personnage, avec son propre squelette (pose indépendante).
    Copie directe des objets (pas d'opérateur : sûr en arrière-plan)."""
    coll = rig.users_collection[0] if rig.users_collection else bpy.context.scene.collection
    neuf = rig.copy(); neuf.data = rig.data.copy()      # squelette propre (sinon les poses se mélangent)
    neuf.animation_data_clear()
    if nom: neuf.name = nom
    coll.objects.link(neuf)
    def copier(src, parent):
        for c in src.children:
            o = c.copy(); o.parent = parent; o.matrix_parent_inverse = c.matrix_parent_inverse.copy()
            for m in o.modifiers:
                if m.type == 'ARMATURE': m.object = neuf
            coll.objects.link(o)
            copier(c, o)
    copier(rig, neuf)
    for pb in neuf.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
    return neuf

# ---------------------------------------------------------------- poses (rotations autour d'axes du monde)
ORDRE = ['root', 'pelvis.L', 'pelvis.R', 'upperleg01.L', 'upperleg01.R', 'upperleg02.L', 'upperleg02.R', 'lowerleg01.L', 'lowerleg01.R',
         'lowerleg02.L', 'lowerleg02.R', 'foot.L', 'foot.R', 'spine05', 'spine04', 'spine03', 'spine02', 'spine01', 'clavicle.L', 'clavicle.R',
         'shoulder01.L', 'shoulder01.R', 'upperarm01.L', 'upperarm01.R', 'upperarm02.L', 'upperarm02.R', 'lowerarm01.L', 'lowerarm01.R',
         'lowerarm02.L', 'lowerarm02.R', 'wrist.L', 'wrist.R', 'neck01', 'neck02', 'neck03', 'head']
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))

def remettre(rig):
    for pb in rig.pose.bones:
        pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)

_AXES = {}
def tourner(rig, os_, axe, deg):
    """Tourne un os autour d'un axe exprimé dans l'espace du squelette AU REPOS (personnage face à -Y), en degrés.
    Calcul direct dans le repère local de l'os (aucune mise à jour de la scène : rapide même dans une ville entière)."""
    pb = rig.pose.bones.get(os_)
    if not pb or not deg: return
    cle = (rig.data.name, os_, tuple(axe))
    a = _AXES.get(cle)
    if a is None:
        a = (pb.bone.matrix_local.to_3x3().inverted() @ axe).normalized(); _AXES[cle] = a
    pb.rotation_mode = 'QUATERNION'
    pb.rotation_quaternion = Quaternion(a, math.radians(deg)) @ pb.rotation_quaternion

# Une pose = { os: [(axe, degrés), …] } — appliquée dans l'ORDRE parent → enfant.
#   Axe X : bascule avant/arrière (négatif = vers l'avant pour une jambe ; positif = le buste se penche en avant)
#   Axe Y : écarte / rapproche un bras du corps ; Axe Z : rotation sur soi.
BRAS_BAS = {'upperarm01.L': [(Y, 35), (X, 7)], 'upperarm01.R': [(Y, -35), (X, 7)], 'lowerarm01.L': [(X, -10)], 'lowerarm01.R': [(X, -10)]}
POSES = {
    'debout': dict(BRAS_BAS),
    'penche': {**BRAS_BAS, 'spine03': [(X, 22)], 'spine02': [(X, 18)], 'spine01': [(X, 10)], 'neck01': [(X, 10)],
               'upperleg01.L': [(X, -18)], 'upperleg01.R': [(X, -18)], 'lowerleg01.L': [(X, 26)], 'lowerleg01.R': [(X, 26)],
               'upperarm01.L': [(Y, 35), (X, -30)], 'upperarm01.R': [(Y, -35), (X, -30)]},
    'genoux': {**BRAS_BAS, 'upperleg01.L': [(X, -85)], 'upperleg01.R': [(X, -85)], 'lowerleg01.L': [(X, 140)], 'lowerleg01.R': [(X, 140)],
               'spine03': [(X, 14)], 'upperarm01.L': [(Y, 50), (X, -35)], 'upperarm01.R': [(Y, -50), (X, -35)], 'lowerarm01.L': [(X, -30)], 'lowerarm01.R': [(X, -30)]},
    'bras_tendus': {'upperarm01.L': [(Z, -82), (X, -32)], 'upperarm01.R': [(Z, 82), (X, -32)], 'lowerarm01.L': [(X, -10)], 'lowerarm01.R': [(X, -10)],
                    'spine03': [(X, 8)], 'neck01': [(X, 14)], 'head': [(Z, 8)]},
    'assis': {**BRAS_BAS, 'upperleg01.L': [(X, -88)], 'upperleg01.R': [(X, -88)], 'lowerleg01.L': [(X, 88)], 'lowerleg01.R': [(X, 88)],
              'upperarm01.L': [(Y, 50), (X, -25)], 'upperarm01.R': [(Y, -50), (X, -25)], 'lowerarm01.L': [(X, -45)], 'lowerarm01.R': [(X, -45)]},
    'mains_bouche': {'upperarm01.L': [(Y, 40), (X, -40)], 'upperarm01.R': [(Y, -40), (X, -40)], 'lowerarm01.L': [(X, -120)], 'lowerarm01.R': [(X, -120)], 'neck01': [(X, 6)]},
    'allonge': dict(BRAS_BAS),   # + le squelette couché (voir coucher)
}
def poser(rig, nom, extra=None):
    remettre(rig)
    P = dict(POSES.get(nom, {}))
    for k, v in (extra or {}).items(): P[k] = P.get(k, []) + v
    for os_ in ORDRE + [k for k in P if k not in ORDRE]:
        for axe, deg in P.get(os_, []): tourner(rig, os_, axe, deg)

def figer(rig, frame):
    """Enregistre la pose courante à la frame donnée (toutes les rotations d'os)."""
    for pb in rig.pose.bones:
        pb.keyframe_insert('rotation_quaternion', frame=frame)
    rig.keyframe_insert('location', frame=frame); rig.keyframe_insert('rotation_euler', frame=frame)

def orienter(rig, angle):
    rig.rotation_mode = 'XYZ'; rig.rotation_euler = (0, 0, angle)

def coucher(rig, sur_le_dos=True, angle=0.0):
    rig.rotation_mode = 'XYZ'
    rig.rotation_euler = (math.radians(-90 if sur_le_dos else 90), 0, angle)
    rig.location.z = 0.12

# ---------------------------------------------------------------- animation
ALLURES = {   # amplitude jambe, genou, bras, pas (m), cadence (pas/s), buste
    'marche': (24, 32, 22, 0.72, 1.8, 3), 'course': (42, 75, 55, 1.4, 2.9, 12), 'traine': (12, 18, 6, 0.45, 1.2, 14),
    'panique': (46, 80, 70, 1.5, 3.2, 16),
}
def marcher(rig, f0, f1, depart, arrivee, allure='marche', fps=24, phase=0.0, bras_tendus=False, base='debout'):
    """Fait marcher le personnage de depart (x, y) à arrivee entre les frames f0 et f1, cycle de pas compris."""
    A, Gn, B, pas, cad, buste = ALLURES[allure]
    dx, dy = arrivee[0] - depart[0], arrivee[1] - depart[1]
    ang = math.atan2(dy, dx) + math.pi / 2       # 0 = face à -Y : marcher vers -Y
    orienter(rig, ang)
    n = max(1, f1 - f0)
    for f in range(f0, f1 + 1, 2):
        t = (f - f0) / n
        ph = (f - f0) / fps * cad * math.pi + phase
        s = math.sin(ph); c = math.cos(ph)
        extra = {
            'upperleg01.L': [(X, -A * s)], 'upperleg01.R': [(X, A * s)],
            'lowerleg01.L': [(X, Gn * max(0, -c))], 'lowerleg01.R': [(X, Gn * max(0, c))],
            'spine03': [(X, buste), (Z, 4 * s)], 'neck01': [(X, -buste * 0.6)],
        }
        if not bras_tendus:
            extra['upperarm01.L'] = [(X, B * s)]; extra['upperarm01.R'] = [(X, -B * s)]
            extra['lowerarm01.L'] = [(X, -10 - B * 0.4 * max(0, s))]; extra['lowerarm01.R'] = [(X, -10 - B * 0.4 * max(0, -s))]
        poser(rig, 'bras_tendus' if bras_tendus else base, extra)
        rig.location.x = depart[0] + dx * t; rig.location.y = depart[1] + dy * t
        rig.location.z = abs(math.sin(ph)) * (0.025 if allure == 'marche' else 0.06)
        figer(rig, f)

def respirer(rig, f0, f1, pose='debout', fps=24, ampl=1.0, graine=0):
    rnd = random.Random(graine)
    p0 = rnd.random() * 6
    for f in range(f0, f1 + 1, 6):
        t = (f - f0) / fps
        extra = {'spine03': [(X, 1.2 * ampl * math.sin(t * 1.6 + p0))], 'head': [(Z, 6 * ampl * math.sin(t * 0.35 + p0)), (X, 2 * math.sin(t * 0.5))]}
        poser(rig, pose, extra)
        figer(rig, f)

def lisser(rig):
    pass

# ---------------------------------------------------------------- foules : personnages figés en maillages statiques
def figer_maillage(rig, nom='statue'):
    """Un personnage posé → un seul maillage statique (armature appliquée) : se recopie par milliers sans coût d'animation."""
    dg = bpy.context.evaluated_depsgraph_get()
    pieces = []
    for o in membres(rig):
        if o.type != 'MESH' or o.hide_render: continue
        oe = o.evaluated_get(dg)
        me = bpy.data.meshes.new_from_object(oe, preserve_all_data_layers=False, depsgraph=dg)
        p = bpy.data.objects.new(o.name + '_f', me); p.matrix_world = o.matrix_world.copy()
        bpy.context.scene.collection.objects.link(p); pieces.append(p)
    if not pieces: return None
    with bpy.context.temp_override(active_object=pieces[0], object=pieces[0], selected_objects=pieces, selected_editable_objects=pieces):
        bpy.ops.object.join()
    s = pieces[0]; s.name = nom
    # origine aux pieds
    with bpy.context.temp_override(active_object=s, object=s, selected_objects=[s], selected_editable_objects=[s]):
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return s

def statues_marche(modeles, n_phases=4, bras_tendus=False, allure='traine'):
    """Pour chaque modèle, n_phases instantanés d'un pas (statues) : une foule qui marche « en gros plan lointain »."""
    out = []
    A_, Gn, B, pas, cad, buste = ALLURES[allure]
    for i, rig in enumerate(modeles):
        rig.location = (0, 0, 0); orienter(rig, 0)
        for k in range(n_phases):
            ph = k / n_phases * 2 * math.pi
            s, c = math.sin(ph), math.cos(ph)
            extra = {'upperleg01.L': [(X, -A_ * s)], 'upperleg01.R': [(X, A_ * s)], 'lowerleg01.L': [(X, Gn * max(0, -c))], 'lowerleg01.R': [(X, Gn * max(0, c))],
                     'spine03': [(X, buste)], 'neck01': [(X, -buste * 0.4)]}
            if not bras_tendus: extra['upperarm01.L'] = [(X, B * s)]; extra['upperarm01.R'] = [(X, -B * s)]
            poser(rig, 'bras_tendus' if bras_tendus and (i + k) % 2 == 0 else 'debout', extra)
            bpy.context.view_layer.update()
            st = figer_maillage(rig, f'statue_{i}_{k}'); st.hide_render = True; st.hide_viewport = True
            st.location = (0, 0, -900)
            out.append(st)
        rig.location = (0, 0, -500)
    return out

def foule_statique(statues, points, f1=None, vitesse=0.0, direction=(0.0, -1.0), rnd=None, regard=None):
    """Recopie (données partagées) une statue à chaque point (x, y) ; elles avancent ensemble à `vitesse` m/s le long de
    `direction` entre la frame 1 et f1 (avec un léger balancement), orientées dans le sens de la marche (ou vers `regard`)."""
    rnd = rnd or random.Random(1)
    coll = bpy.context.scene.collection
    dx, dy = direction; n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n
    ang = math.atan2(dy, dx) + math.pi / 2
    out = []
    for (x, y) in points:
        st = statues[rnd.randrange(len(statues))]
        o = bpy.data.objects.new('m', st.data); coll.objects.link(o)
        o.rotation_euler = (0, 0, (math.atan2(regard[1] - y, regard[0] - x) + math.pi / 2) if regard else ang + rnd.uniform(-0.25, 0.25))
        v = vitesse * rnd.uniform(0.8, 1.2)
        o.location = (x, y, 0)
        if f1 and v:
            ph = rnd.random() * 6
            for f in list(range(1, f1, 6)) + [f1]:
                o.location = (x + dx * v * f / 24, y + dy * v * f / 24, abs(math.sin(f / 24 * 4 + ph)) * 0.03)
                o.keyframe_insert('location', frame=f)
        out.append(o)
    return out
