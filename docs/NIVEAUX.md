# Concevoir un niveau d'exploration

> Pour les concepteurs de niveaux. Référence du format : `docs/REFONTE.md` §4.2 (ce document le détaille et
> ajoute les extensions demandées par le scénariste). Exemple complet : `js/data/niveaux/_test.js`.
> Vérifier : `node tools/valider_niveaux.mjs` (tous les plans) ou `node tools/valider_niveaux.mjs cimetiere --avertissements`.
> Voir le résultat : `dev/explore.html?lieu=cimetiere` (options : `&heure=22`, `&entree=caveau`, `&combat=faux`).

## 1. Le fichier

Un fichier par plan : `js/data/niveaux/<id>.js`, avec `export default { … }`. Par convention l'id du plan est
celui du lieu (`lieux.js`) ; sinon `niveau: 'autre_id'` dans le lieu. **1 case ≈ 0,8 m** : une pièce de 4 × 3 m fait
5 × 4 cases de sol, murs en plus.

```js
export default {
  id: 'pharmacie_carnot', nom: 'Pharmacie Carnot', exterieur: false,
  typeButin: 'pharmacie',          // table de butin des meubles (js/data/butin.js) ; sinon celle du lieu
  pool: ['errant', 'putrefie'],    // morts pour les 'Z' et le procédural (le lieu peut le surcharger)
  morts: { n: [1, 3] },            // morts procéduraux en plus des 'Z', à la 1re visite
  solDefaut: 'carrelage',          // (extension) matière de '.' hors pièce nommée — défaut : parquet (beton si exterieur)
  etages: [ { id: 'rdc', nom: 'Rez-de-chaussée', monte: null, descend: null, plan: [ '…' ] } ],
  pieces: [ { etage: 'rdc', x: 3, y: 2, nom: 'Officine', sol: 'carrelage', sombre: 0 } ],
  legende: { 'K': { porte: true, verrou: 'cle_reserve' } },
  declencheurs: [ { etage: 'rdc', x: 10, y: 4, w: 3, h: 2, scene: 'pha_reserve', unique: true } ],
};
```

## 2. Légende globale

| Car. | Sens | Bloque | Cache la vue |
|---|---|---|---|
| `#` | mur | oui | oui |
| ` ` (espace) | néant (hors bâtiment, noir) | oui | oui |
| `.` | sol intérieur (matière de la pièce) | | |
| `,` | sol extérieur (bitume ; `pavés`/`béton`/`terre` si la pièce le dit) | | |
| `"` | herbe (terre si la pièce dit `sol: 'terre'`) | | |
| `:` | gravier / ballast | | |
| `~` | eau | oui | |
| `+` `/` `X` | porte fermée / ouverte / verrouillée (forçable au pied-de-biche par défaut) | fermée | fermée |
| `\|` | fenêtre (dans un mur) : laisse passer la vue et la lumière | oui | |
| `<` `>` | escalier qui monte (vers `monte`) / descend (vers `descend`) | | |
| `E` | sortie vers la carte | | |
| `@` | entrée par défaut | | |
| `Z` | mort tiré dans le `pool`, état tiré selon `zombies.etats` | | |
| `t r k s a f d g o m` | table, comptoir, cuisine, étagère, armoire, frigo, bureau, caisse, poubelle, machine | oui | |
| `b p n w h` | lit, canapé, banc (pas un conteneur), lavabo/WC, baignoire | oui | |
| `c % ;` | chaise, corps (décor), débris/verre (bruit de pas ×2,5) | | |
| `v x T` | voiture (conteneur), gravats, arbre | oui | `T` |
| `=` | **(extension)** tombe | oui | |

Tout meuble conteneur a une catégorie de butin : a→vetements, f→frigo, k→cuisine, s→etagere, d→bureau, r→comptoir,
g→caisse, b→lit, w/h→salle_de_bain, v→voiture, o→poubelle, m→machine, t→table, p→canape.

**Cases identiques et adjacentes = un seul meuble** : `bb` est un lit, `ssss` un rayonnage (fouille plus longue,
plus de tirages, plafonnés à 3). Deux lits côte à côte doivent donc être séparés d'une case ou utiliser deux
caractères différents (définir `'B': { comme: 'b' }` dans la légende).

## 3. Légende du niveau (`legende`)

Toute lettre ou chiffre libre (et même un caractère global, pour le redéfinir). Les clés se combinent.

| Clé | Effet |
|---|---|
| `comme: 's'` | se comporte comme ce caractère global (utile pour marquer un meuble précis) |
| `prop: 'table'` | meuble par nom : les noms globaux (`table`, `etagere`, `lit`…) plus `caveau`, `pilier`, `haie`, `grille`, `barriere`, `cheminee`, `autel`, `statue`, `fontaine`, `tente`, `generateur`, `conteneur`, `cercueil`, `brancard`, `cloche`, `piano`, `palette`, `caisson` |
| `conteneur: { nom, items: [{id, qty}], table }` | contenu fixe ; `table: null` = rien d'autre ; `table: 'hotel.lit'` = tirage dans cette table ; absent = table du lieu + catégorie ; `conteneur: false` = meuble non fouillable ; `categorie: 'bureau'` pour changer la catégorie |
| `nom: 'le secrétaire'` | libellé du bouton (« Fouiller le secrétaire ») — mettre l'article |
| `marqueur: 'id'` | marqueur d'histoire (déclencheurs `quand: 'marqueur'`, PNJ, documents, entrées de `teleporter`) |
| `entree: 'nom'` | **entrée nommée** (`flow.explorer(lieu, { entree: 'nom' })`, effet `teleporter`) |
| `zombie: 'type', etat, hp, dir` | mort particulier ; `etat` : `dort` · `immobile` · `erre` · `fait_le_mort` · `cogne` |
| `porte: true` | porte ; `verrou: 'cle_id'` (clé) ou `verrou: { forcer: 'pied_de_biche', crocheter: true, meca: 2, flag: 'x' }`, `exterieure: true` (120 PV), `etat: 'ouverte'` |
| `porte: true, flag: 'x'` (ou `verrou: { flag: 'x' }`) | **porte à drapeau** : verrouillée tant que le drapeau n'est pas posé, s'ouvre ensuite (vérifié chaque seconde) |
| `pnj: 'id', si: CONDITION` | **PNJ** présent seulement si la condition est vraie ; `nom` optionnel ; parler lance le déclencheur de son `marqueur`, sinon `PNJ[id].scene` |
| `document: 'doc_id'` | **document posé au sol** (lu → bus `document`, ajouté à `G.documents`) |
| `objet: ['id', qty]` | **objet posé au sol** (ramassable) |
| `sol: 'marbre'` | matière sous cette case |
| `bloque`, `opaque` | forcer ces propriétés |
| `echelle: 'region'` | (sur une case `E` redéfinie) la sortie ouvre la carte de la région |

Les PNJ de `js/data/histoire/pnj.js` dont `lieu` et `marqueur` correspondent sont aussi placés automatiquement
sur leur marqueur (ou à côté s'il est sur un meuble). Idem pour les documents de `documents.js` qui ont un `marqueur`.

## 4. Pièces, matières, lumière

Les pièces sont trouvées automatiquement (zones reliées ; **portes et fenêtres séparent**). On les nomme dans
`pieces` avec n'importe quelle case intérieure. Le nom s'affiche quand on y entre.

- `sol` : `parquet` · `carrelage` · `moquette` · `beton` · `lino` · `tomettes` · `terre` · `bitume` · `paves` ·
  `herbe` · `gravier` · `marbre`. La moquette étouffe les pas (×0,6), le gravier les trahit (×1,5).
- `sombre` : `0` éclairée par les fenêtres (× heure du jour), `1` pénombre, `2` noir complet (lampe obligatoire).
  Sans valeur : `0` si la pièce a une fenêtre, sinon `1`. Une fenêtre éclaire ~5 cases.
- `exterieur: true/false` : forcer. Une zone faite surtout de `,` `"` `:` est extérieure (lumière du jour, lune la nuit).

## 5. Étages et escaliers

Chaque étage a `monte` et `descend` (ids d'étages ou `null`). Un `<` sur l'étage A mène au `>` le plus proche
(à vol d'oiseau) sur l'étage `A.monte`, qui doit avoir `descend: A`. On arrive **à côté** de l'escalier d'en face :
laisser une case libre autour. Plusieurs escaliers entre deux mêmes étages : placez-les aux mêmes coordonnées.

## 6. Déclencheurs de zone

`{ etage, x, y, w, h, scene | cinematique | marqueur, unique: true, si: CONDITION }` : joué quand on **entre** dans le
rectangle. Avec `marqueur`, c'est une zone-marqueur : le déclencheur `quand: 'marqueur'` correspondant de
`declencheurs.js` est joué au passage. `unique` est mémorisé dans l'état du lieu.

## 7. Morts

- `Z` et les morts procéduraux (`morts.n`) sont tirés du `pool` avec la graine du monde : les deux joueurs voient les mêmes.
- Les procéduraux évitent 6 cases autour des entrées et des arrivées d'escalier et préfèrent les pièces sombres.
- `cogne` : le mort frappe la porte la plus proche (≤ 2 cases) sans la casser — pour les « ils sont derrière » ; s'il
  vous voit une fois la porte ouverte, il chasse. Un mort en chasse, lui, **enfonce** les portes (PV).
- `fait_le_mort` : immobile, se relève si on passe à 1,5 case.

## 8. Pièges fréquents

1. **Lignes de longueurs différentes** : le validateur le signale ligne par ligne. Complétez avec des espaces (néant).
2. **Espace marchable inaccessible** : toute case de sol doit être atteignable depuis une entrée (portes, même
   verrouillées, et escaliers comptent comme passages). Un jardin clos décoratif : entourez-le de `x`/`T` ou mettez du néant.
3. **Meubles fusionnés** : deux armoires collées `aa` = une seule armoire de 2 cases.
4. **Porte hors d'un mur** : une porte doit être entre deux murs (sinon elle est dessinée dans le mauvais sens).
5. **Escalier sans case libre autour** : on ne peut pas y arriver.
6. **Marqueur sur un meuble de plusieurs cases** : le marqueur vaut pour tout le meuble ; mettez le caractère
   marqueur sur une seule case (`sss1` → définissez `'1': { comme: 's', marqueur: 'x' }`, ce sera un meuble à part).
7. **Pièce nommée sur une porte ou un mur** : le point `x, y` doit tomber sur une case intérieure.
8. **Noir partout** : une pièce `sombre: 2` sans lampe, c'est 1,5 case de vue. Réservez-le aux caves et aux climax.
9. **Sortie `E` derrière une porte à drapeau** : c'est voulu pour le cimetière ; vérifiez qu'une scène pose bien le drapeau.
