# ============ One More Day — les MAINS à la première personne (cinématiques) ============
# Un corps MPFB (peau « enhanced SSS », lissé à la subdivision 2 au rendu) dont on ne garde que le cou et le dessous ; une
# caméra aux yeux. Les bras se posent par une IK analytique (épaule → coude → poignet) et la main par trois vecteurs :
#   poignet : où est le poignet ;  doigts : vers où pointent les doigts ;  paume : vers où regarde la paume.
# On écrit tout en REPÈRE CAMÉRA (x à droite, y en haut, z devant soi, en mètres) : c'est ainsi qu'on cadre un plan.
# Les doigts : une courbure par doigt (0 = tendu, 1 = poing), un écart, et le pouce (flexion, opposition).
#
#   fp = creer(sexe='h', vetements=[...], peau=...)       → { rig, cam, corps }
#   main(fp, 'D', poignet=(x, y, z), doigts=(…), paume=(…), coude=(…), courbe={…}, ecart=0.2, pouce=(0.2, 0.3))
#   figer(fp, frame)                                       → clés de la pose courante (bras, mains, doigts)
#   lacher(fp, 'G')                                        → le bras pend hors du cadre
# Repères : poignet à ~0,35-0,5 m devant les yeux ; le cadre 24 mm voit à peu près x ∈ [-0,35 ; 0,35] et y ∈ [-0,16 ; 0,16]
# à 0,4 m (format 2,39:1).
import bpy, math
from mathutils import Vector, Matrix, Quaternion
import omd_humains as H

DOIGTS = {'pouce': 1, 'index': 2, 'majeur': 3, 'annulaire': 4, 'auriculaire': 5}
COTES = {'G': 'L', 'D': 'R'}

def creer(sexe='h', age='adulte', vetements=None, peau=None, poids=0.42, muscle=0.5, graine=7, nom='fp'):
    rig = H.humain(nom, sexe, age, poids=poids, muscle=muscle, taille=0.5, vetements=vetements, cheveux=None, peau=peau, graine=graine)
    # le corps : le maillage qui porte le groupe « body » (les vêtements n'en ont pas)
    corps = next((o for o in rig.children if o.type == 'MESH' and o.vertex_groups.get('body')), None) \
        or max((o for o in rig.children if o.type == 'MESH'), key=lambda o: len(o.data.vertices))
    # ne garder que ce qui est sous le cou (la caméra est dans la tête)
    cou = (rig.data.bones['neck01'].head_local).z
    vg = corps.vertex_groups.new(name='fp_garder')
    vg.add([v.index for v in corps.data.vertices if v.co.z < cou - 0.02], 1.0, 'REPLACE')
    m = corps.modifiers.new('fp_tete', 'MASK'); m.vertex_group = 'fp_garder'
    for o in rig.children:
        if any(k in o.name for k in ('eyebrow', 'eyelash', 'high-poly', 'hair', 'short0', 'bob0', 'long0')): o.hide_render = True; o.hide_viewport = True
        if o.type == 'MESH':
            s = o.modifiers.new('fp_lisse', 'SUBSURF'); s.levels = 1; s.render_levels = 2
    for pb in rig.pose.bones:
        pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0)
        for c in list(pb.constraints): pb.constraints.remove(c)
    # la caméra aux yeux, qui regarde devant (−Y)
    B = rig.data.bones
    yeux = (B['eye.L'].head_local + B['eye.R'].head_local) / 2
    cam = bpy.data.objects.new(nom + '_cam', bpy.data.cameras.new(nom + '_cam'))
    bpy.context.scene.collection.objects.link(cam)
    cam.data.lens = 24; cam.data.clip_start = 0.04; cam.data.clip_end = 20000; cam.data.sensor_width = 36
    cam.parent = rig
    cam.location = yeux + Vector((0, -0.035, 0))
    cam.rotation_mode = 'XYZ'; cam.rotation_euler = (math.radians(90), 0, math.radians(180))
    bpy.context.scene.camera = cam
    fp = {'rig': rig, 'cam': cam, 'corps': corps, 'yeux': cam.location.copy(), 'cle': set()}
    regard(fp, 0, 0)
    return fp

def regard(fp, tangage=0.0, lacet=0.0, roulis=0.0):
    """Oriente la tête (la caméra) : tangage en degrés (négatif = regarder vers le bas), lacet (positif = à gauche)."""
    fp['cam'].rotation_euler = (math.radians(90 + tangage), math.radians(roulis), math.radians(180 + lacet))
    fp['_regard'] = (tangage, lacet, roulis)

def _cam_mat(fp):
    t, l, r = fp.get('_regard', (0, 0, 0))
    e = fp['cam'].rotation_euler
    return e.to_matrix()

def c2a(fp, v, point=True):
    """Repère caméra (x droite, y haut, z devant) → espace du squelette."""
    M = _cam_mat(fp)
    d = M @ Vector((v[0], v[1], -v[2]))         # la caméra regarde selon son −Z
    return (fp['cam'].location + d) if point else d.normalized()

def c2w(fp, v, point=True):
    """Repère caméra → MONDE (pour poser un objet tenu, un décor) : le squelette peut être déplacé et tourné."""
    rig = fp['rig']
    M = Matrix.Translation(rig.location) @ rig.rotation_euler.to_matrix().to_4x4()
    a = c2a(fp, v, point)
    return (M @ a) if point else (M.to_3x3() @ a).normalized()

def _base(a, b):
    """Base orthonormée (colonnes) dont la 1re colonne est a, la 2e la part de b orthogonale à a."""
    a = a.normalized(); b = (b - a * a.dot(b)).normalized(); c = a.cross(b)
    return Matrix((a, b, c)).transposed()

def _repere(Y, ref, ref_local):
    """Matrice 3×3 d'un os dont l'axe Y local pointe vers Y et dont l'axe local ref_local pointe au mieux vers ref."""
    A = _base(Y, ref)                              # monde : (Y, ref⊥)
    Bl = _base(Vector((0, 1, 0)), ref_local)       # local : (Y, ref_local⊥)
    return A @ Bl.inverted()

def _local(rig, nom, M_abs, M_parent_abs):
    """Rotation locale (quaternion) d'un os pour obtenir l'orientation absolue M_abs, sous un parent orienté M_parent_abs."""
    b = rig.data.bones[nom]
    Rb = b.matrix_local.to_3x3(); Rp = b.parent.matrix_local.to_3x3()
    base = M_parent_abs @ Rp.inverted() @ Rb
    return (base.inverted() @ M_abs).to_quaternion()

def _abs_repos(rig, nom):
    return rig.data.bones[nom].matrix_local.to_3x3()

def _paume_repos(rig, c):
    """Normale de la paume au repos (vers l'extérieur de la paume) : l'axe +Z local des phalanges, vers où elles se plient."""
    B = rig.data.bones
    z = Vector()
    for k in (2, 3, 4):
        z += B[f'finger{k}-1.{c}'].matrix_local.to_3x3() @ Vector((0, 0, 1))
    return z.normalized()

def main(fp, cote, poignet, doigts=(0, 0.2, 1), paume=(0, 0, 1), coude=None, courbe=None, ecart=0.15, pouce=(0.25, 0.35), flexion_poignet=None):
    """Pose un bras et sa main (repère caméra). doigts = direction des doigts, paume = direction où regarde la paume."""
    rig = fp['rig']; c = COTES[cote]; B = rig.data.bones
    sg = 1 if cote == 'G' else -1                  # le bras gauche est du côté +X du squelette (personnage face à −Y)
    W = c2a(fp, poignet)
    Hd = c2a(fp, doigts, point=False); P = c2a(fp, paume, point=False)
    if coude is None: coude = (sg * -0.45, -0.55, 0.05)       # repère caméra : en dehors et en bas (sg inversé : caméra regarde −Y)
    Eh = c2a(fp, coude, point=False)
    S = B[f'upperarm01.{c}'].head_local
    Lu = B[f'upperarm01.{c}'].length + B[f'upperarm02.{c}'].length
    Lf = B[f'lowerarm01.{c}'].length + B[f'lowerarm02.{c}'].length
    v = W - S; d = min(v.length, (Lu + Lf) * 0.995); a = v.normalized()
    W = S + a * d
    b = (Eh - a * a.dot(Eh)).normalized()
    ca = max(-1, min(1, (Lu * Lu + d * d - Lf * Lf) / (2 * Lu * d)))
    al = math.acos(ca)
    E = S + Lu * (math.cos(al) * a + math.sin(al) * b)
    u = (E - S).normalized(); f = (W - E).normalized()
    charniere = u.cross(f)
    if charniere.length < 1e-4: charniere = a.cross(b)
    charniere.normalize()
    # bras : axe X local = charnière du coude (le coude plie dans le bon plan)
    M_ua = _repere(u, charniere, Vector((1, 0, 0)))
    if M_ua.col[0].dot(charniere) < 0: M_ua = _repere(u, -charniere, Vector((1, 0, 0)))
    # main : axe Y = doigts, normale de paume = P
    Rw = _abs_repos(rig, f'wrist.{c}')
    p_loc = (Rw.inverted() @ _paume_repos(rig, c)).normalized()
    M_w = _repere(Hd, P, p_loc)
    # avant-bras : le repère qui tiendrait le poignet sans torsion, ramené dans l'axe de l'avant-bras
    R_l02 = _abs_repos(rig, f'lowerarm02.{c}'); R_l01 = _abs_repos(rig, f'lowerarm01.{c}')
    M_tenant = M_w @ (R_l02.inverted() @ Rw).inverted()
    Q = (M_tenant @ Vector((0, 1, 0))).rotation_difference(f)
    M_l02 = Q.to_matrix() @ M_tenant
    # lowerarm01 : à mi-chemin entre la torsion du bras et celle du poignet
    R_ua2 = _abs_repos(rig, f'upperarm02.{c}')
    M_l01_bras = M_ua @ (R_ua2.inverted() @ R_l01)
    M_l01_bras = (M_l01_bras @ Vector((0, 1, 0))).rotation_difference(f).to_matrix() @ M_l01_bras
    M_l01_main = M_l02 @ (R_l02.inverted() @ R_l01)
    q1 = M_l01_bras.to_quaternion(); q2 = M_l01_main.to_quaternion()
    if q1.dot(q2) < 0: q2.negate()
    M_l01 = q1.slerp(q2, 0.5).to_matrix()
    M_l01 = (M_l01 @ Vector((0, 1, 0))).rotation_difference(f).to_matrix() @ M_l01
    # rotations locales, du parent vers l'enfant
    R_sh = _abs_repos(rig, f'shoulder01.{c}')
    M_ua1 = M_ua @ (_abs_repos(rig, f'upperarm02.{c}').inverted() @ _abs_repos(rig, f'upperarm01.{c}'))
    M_ua1 = (M_ua1 @ Vector((0, 1, 0))).rotation_difference(u).to_matrix() @ M_ua1
    pose = {}
    pose[f'upperarm01.{c}'] = _local(rig, f'upperarm01.{c}', M_ua1, R_sh)
    pose[f'upperarm02.{c}'] = _local(rig, f'upperarm02.{c}', M_ua, M_ua1)
    pose[f'lowerarm01.{c}'] = _local(rig, f'lowerarm01.{c}', M_l01, M_ua)
    pose[f'lowerarm02.{c}'] = _local(rig, f'lowerarm02.{c}', M_l02, M_l01)
    pose[f'wrist.{c}'] = _local(rig, f'wrist.{c}', M_w, M_l02)
    for k, q in pose.items():
        pb = rig.pose.bones[k]; pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = q; fp['cle'].add(k)
    poser_doigts(fp, cote, courbe or {}, ecart, pouce)

def poser_doigts(fp, cote, courbe, ecart=0.15, pouce=(0.25, 0.35)):
    """courbe : { 'index': 0..1, … } (0 = tendu, 1 = poing serré) ; défaut 0,25 (main au repos, légèrement pliée).
    ecart : 0..1 (doigts écartés) ; pouce : (flexion 0..1, opposition 0..1)."""
    rig = fp['rig']; c = COTES[cote]
    for nom, k in DOIGTS.items():
        if k == 1: continue
        cb = courbe.get(nom, courbe.get('tous', 0.25))
        # une main au repos n'est jamais plate : l'auriculaire plie toujours un peu plus que l'index
        cb = max(0.0, min(1.0, cb + (k - 2) * 0.025 * (1 - cb)))
        ang = [62, 88, 58]
        for j in (1, 2, 3):
            pb = rig.pose.bones[f'finger{k}-{j}.{c}']; pb.rotation_mode = 'QUATERNION'
            q = Quaternion((1, 0, 0), math.radians(ang[j - 1] * cb))
            if j == 1:
                sp = (k - 3.2) * 6.5 * ecart * (1 if c == 'L' else -1)
                q = Quaternion((0, 0, 1), math.radians(sp)) @ q
            pb.rotation_quaternion = q; fp['cle'].add(pb.name)
    fl, op = pouce
    for j, (ax, ay, az) in ((1, (35 * op, 0, -25 * op)), (2, (30 * fl, 0, 0)), (3, (45 * fl, 0, 0))):
        pb = rig.pose.bones[f'finger1-{j}.{c}']; pb.rotation_mode = 'QUATERNION'
        s = 1 if c == 'L' else -1
        pb.rotation_quaternion = Quaternion((1, 0, 0), math.radians(ax)) @ Quaternion((0, 0, 1), math.radians(az * s)); fp['cle'].add(pb.name)

def lacher(fp, cote):
    """Le bras pend, hors du cadre."""
    main(fp, cote, poignet=(0.28 if cote == 'G' else -0.28, -0.75, 0.12), doigts=(0, -1, 0.1), paume=(-1 if cote == 'G' else 1, 0, 0), courbe={'tous': 0.3})

def figer(fp, frame):
    rig = fp['rig']
    for k in fp['cle']:
        rig.pose.bones[k].keyframe_insert('rotation_quaternion', frame=frame)
    cam = fp['cam']
    cam.keyframe_insert('rotation_euler', frame=frame); cam.keyframe_insert('location', frame=frame)

def fcourbes(action):
    """Les courbes d'une action (Blender 5 : rangées par calques, bandes et sacs de canaux)."""
    try:
        l = list(action.fcurves)
        if l: return l
    except Exception: pass
    out = []
    for calque in getattr(action, 'layers', []):
        for bande in calque.strips:
            for sac in getattr(bande, 'channelbags', []): out.extend(sac.fcurves)
    return out

def lisser_cles(fp):
    """Interpolation douce (Bézier auto) sur toutes les clés du squelette et de la caméra."""
    for o in (fp['rig'], fp['cam']):
        ad = o.animation_data
        if not ad or not ad.action: continue
        for fc in fcourbes(ad.action):
            for k in fc.keyframe_points: k.interpolation = 'BEZIER'; k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'

def salir(fp, force=0.5):
    """Mains de survivant : terre dans les plis et sous les ongles, un peu de rouge aux jointures (teinte sur la peau)."""
    corps = fp['corps']
    for slot in corps.material_slots:
        m = slot.material
        if not m or not m.use_nodes or m.get('omd_sale'): continue
        m = m.copy(); slot.material = m; m['omd_sale'] = 1
        nt = m.node_tree
        sortie = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        if not sortie or not sortie.inputs[0].links: continue
        src = sortie.inputs[0].links[0].from_socket
        mix = nt.nodes.new('ShaderNodeMixShader')
        sale = nt.nodes.new('ShaderNodeBsdfPrincipled')
        sale.inputs['Base Color'].default_value = (0.11, 0.075, 0.05, 1); sale.inputs['Roughness'].default_value = 0.85
        bruit = nt.nodes.new('ShaderNodeTexNoise'); bruit.inputs['Scale'].default_value = 38; bruit.inputs['Detail'].default_value = 12
        rampe = nt.nodes.new('ShaderNodeValToRGB')
        rampe.color_ramp.elements[0].position = 0.62 - 0.12 * force; rampe.color_ramp.elements[1].position = 0.78
        rampe.color_ramp.elements[0].color = (0, 0, 0, 1); rampe.color_ramp.elements[1].color = (0.55 * force + 0.2, 0, 0, 1)
        nt.links.new(bruit.outputs['Fac'], rampe.inputs['Fac'])
        nt.links.new(rampe.outputs['Color'], mix.inputs['Fac'])
        nt.links.new(src, mix.inputs[1]); nt.links.new(sale.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], sortie.inputs[0])
