# Sources des sprites d'objets et de houppiers

Les sprites de `img/objets/` sont rendus vus de dessus dans Blender par `tools/blender/omd_assets.py` (meubles, objets,
végétaux) et `tools/blender/f05_hauts.py` (variantes de houppiers ajoutées en F05, octobre 2026). Aucun modèle 3D n'est
chargé par le jeu : seules les images rendues sont livrées.

## Modèles Poly Haven — licence CC0 (domaine public), https://polyhaven.com/license

Téléchargés depuis l'API Poly Haven (glTF 1k) dans le cache local `D:\projects 3D\OneMoreDay\ph_cache\models\`.
L'attribution n'est pas exigée par la licence ; elle est donnée ici par honnêteté et pour pouvoir refaire les rendus.

| Sprite | Modèle Poly Haven | Page |
| --- | --- | --- |
| `haut_olivier_2` | `island_tree_01` (teinte désaturée, gris-vert) | https://polyhaven.com/a/island_tree_01 |
| `haut_olivier_3` | `jacaranda_tree` (teinte désaturée, gris-vert) | https://polyhaven.com/a/jacaranda_tree |
| `haut_pin_1` | `pine_tree_01`, partie `pine_tree_01_a` | https://polyhaven.com/a/pine_tree_01 |
| `haut_platane_2`, `haut_platane_3` | `jacaranda_tree` (deux teintes de vert) | https://polyhaven.com/a/jacaranda_tree |

Les autres houppiers et objets rendus par `omd_assets.py` proviennent aussi de Poly Haven (CC0) ou sont construits dans
le script (boîtes, sphères, matières Poly Haven) ; la liste des modèles utilisés figure dans `HAUTS` et le catalogue
(`tools/blender/omd_catalogue.py`).

## Refaire les rendus

```
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python tools\blender\f05_hauts.py -- produire [olivier pin platane]
```

Le script tourne dans un Blender séparé, en arrière-plan : la scène ouverte dans l'interface de Blender n'est jamais
touchée. Refaire réécrit exactement les cinq fichiers de F05 (indices fixes), avec des totaux n stables (olivier 4, pin 2,
platane 4), et ne réécrit jamais un sprite d'origine. Vérification sans rendu : `-- a_blanc` (deux productions simulées).
