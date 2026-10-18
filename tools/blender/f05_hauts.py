# ============ F05 — nouvelles variantes de houppiers (olivier, pin, platane) ============
# Lancé dans un Blender SÉPARÉ, en arrière-plan (la scène ouverte de l'utilisateur n'est jamais touchée) :
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python tools\blender\f05_hauts.py -- echantillon <dossier>
#   … -- produire            (écrit img/objets/haut_<type>_<n>.webp et met à jour objets.json, les variantes existantes gardées)
# Modèles : Poly Haven (CC0, https://polyhaven.com/license), cités dans img/objets/ATTRIBUTIONS.md ; l'olivier
# procédural essayé d'abord (bouquets de feuilles) a été écarté : trop clair et trop graphique en jeu (F05, tour 28).
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import omd_assets as A

# ---------------------------------------------------------------- les jeux à rendre
# (type, diamètre en cases, [(source, teinte, saturation, valeur)]) — 'proc:<fonction>' = un modèle construit dans ce fichier
ECHANTILLON = [
    ('olivier', 2.8, [('island_tree_01', 0.47, 0.42, 1.2), ('jacaranda_tree', 0.47, 0.38, 1.25), ('jacaranda_tree', 0.48, 0.30, 1.35)]),
]

def rendre(jeux, sortie, prefixe=''):
    A.SORTIE = sortie
    A.preparer_scene()
    faits = []
    for typ, diam, liste in jeux:
        for k, (src, hue, sat, val) in enumerate(liste):
            A.vider()
            try:
                if src.startswith('proc:'): objs = globals()[src[5:]](k)
                else: objs = A.importer_ph(src); A.teinter(objs, hue, sat, val)
                nom = f'{prefixe}haut_{typ}_{k}' if prefixe else f'cand_{typ}_{k}_{src.replace(":", "-")}'
                A.rendre_haut(nom, objs, diam)
                faits.append(nom)
            except Exception as e:
                print('[ERREUR]', typ, src, e)
    return faits

# Production : les CINQ variantes de F05, à des indices FIXES (refaire = réécrire ces cinq fichiers, rien d'autre) ;
# n vaut toujours le total ci-dessous, quel que soit le nombre d'appels. Les indices d'origine (< ORIGINAUX) ne sont
# jamais réécrits (référence F05 : .collaboration-ia/…/preuves/F05-baseline).
ORIGINAUX = {'olivier': 2, 'pin': 1, 'platane': 2}
PRODUCTION = [   # (type, diamètre, n total, [(indice, source, teinte, saturation, valeur)])
    ('olivier', 2.8, 4, [(2, 'island_tree_01', 0.47, 0.42, 1.2), (3, 'jacaranda_tree', 0.47, 0.38, 1.25)]),
    ('pin', 4.2, 2, [(1, 'pine_tree_01:pine_tree_01_a', 0.5, 0.9, 1.05)]),
    ('platane', 4.6, 4, [(2, 'jacaranda_tree', 0.49, 1.05, 1.3), (3, 'jacaranda_tree', 0.5, 0.85, 1.12)]),
]
def plan_production(types=None):
    """→ [(nom de fichier, type, indice, source…)], {type: n} — pur, vérifiable sans Blender."""
    plan, totaux = [], {}
    for typ, diam, n, liste in PRODUCTION:
        if types and typ not in types: continue
        for (k, src, hue, sat, val) in liste:
            assert k >= ORIGINAUX[typ], f'{typ} : l’indice {k} réécrirait un sprite d’origine'
            assert k < n, f'{typ} : indice {k} hors du total {n}'
            plan.append((f'haut_{typ}_{k}', typ, diam, src, hue, sat, val))
        totaux[typ] = n
    return plan, totaux
def produire(types=None):
    A.SORTIE = r'D:\projects\One more day - Claude\img\objets'
    A.preparer_scene()
    plan, totaux = plan_production(types)
    meta = A._meta_charger()
    for nom, typ, diam, src, hue, sat, val in plan:
        A.vider()
        objs = A.importer_ph(src); A.teinter(objs, hue, sat, val)
        A.rendre_haut(nom, objs, (meta.get('haut_' + typ) or {}).get('d', diam))
    for typ, n in totaux.items():
        m = meta.get('haut_' + typ) or {'m': 0, 'h': 6, 'd': dict((t, d) for t, d, _, _ in PRODUCTION)[typ]}
        m['n'] = n; meta['haut_' + typ] = m
    A._meta_ecrire(meta)
    print('PRODUIT', [p[0] for p in plan], totaux)
    return [p[0] for p in plan], totaux
def a_blanc():
    """Deux productions de suite, l'API Blender et l'écriture remplacées par une mémoire : mêmes fichiers, mêmes n."""
    meta = {k: dict(v) for k, v in A._meta_charger().items()}
    ecrits = []
    reel = {f: getattr(A, f) for f in ('preparer_scene', 'vider', 'importer_ph', 'teinter', 'rendre_haut', '_meta_charger', '_meta_ecrire')}
    A.preparer_scene = lambda *a, **k: None; A.vider = lambda: None; A.importer_ph = lambda src: []; A.teinter = lambda *a: None
    A.rendre_haut = lambda nom, objs, d: ecrits.append(nom)
    A._meta_charger = lambda: {k: dict(v) for k, v in meta.items()}
    A._meta_ecrire = lambda m: (meta.clear(), meta.update({k: dict(v) for k, v in m.items()}))
    try:
        r1 = produire(); n1 = {t: meta['haut_' + t]['n'] for t in ORIGINAUX}
        r2 = produire(); n2 = {t: meta['haut_' + t]['n'] for t in ORIGINAUX}
    finally:
        for f, v in reel.items(): setattr(A, f, v)
    assert r1 == r2 and n1 == n2 == {'olivier': 4, 'pin': 2, 'platane': 4}, (r1, r2, n1, n2)
    assert len(ecrits) == 10 and len(set(ecrits)) == 5, ecrits
    assert not any(int(e.rsplit('_', 1)[1]) < ORIGINAUX[e.split('_')[1]] for e in ecrits), ecrits
    print('A_BLANC OK', sorted(set(ecrits)), n2)

if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if args and args[0] == 'echantillon':
        print('RENDUS', rendre(ECHANTILLON, args[1]))
    elif args and args[0] == 'produire':
        produire(args[1:] or None)
    elif args and args[0] == 'a_blanc':
        a_blanc()
