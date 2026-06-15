# Architecture & réglages — *One More Day*

> But de ce fichier : permettre de **comprendre vite** comment le jeu est câblé et,
> surtout, **où changer quoi** pour ajuster le ressenti sans casser le reste.
> Compagnon du `README.md` (qui, lui, explique *comment jouer*). Web pur, sans build.

---

## 1. Carte mentale des modules

Le jeu est une appli web sans framework. `index.html` charge `js/main.js`, qui orchestre
tout le reste. Trois familles de fichiers :

| Famille | Rôle | Fichiers clés |
| --- | --- | --- |
| **Moteur** | la logique vivante | `state.js` (état+sauvegarde), `map.js` (cartes, déplacement, **les horloges**), `combat.js`, `survival.js`, `inventory.js`, `world.js` (accès au monde), `zombies_map.js` (morts en temps réel) |
| **Présentation** | ce qu'on voit/entend | `ui.js`, `cinema.js`, `scenes.js`, `audio.js`, `ambiance.js`, `illustrations.js`, `icons.js`, `js/art/**` |
| **Données** | tout le contenu | `js/data/**` (cartes, objets, zombies, événements, histoire…) **et `js/data/reglages.js`** |

> **Règle d'or de maintenabilité** : la **logique** vit dans `js/*.js`, les **nombres
> qui se règlent** vivent dans **`js/data/reglages.js`**. Si tu changes un chiffre en dur
> ailleurs (vitesse, durée, coût…), c'est probablement qu'il doit remonter dans `reglages.js`.

---

## 2. Le temps : TROIS horloges qui tournent en parallèle

Le jeu est en **temps réel**. Rien n'est « sauté par action » : le temps passe parce
qu'il passe. Trois boucles indépendantes, toutes dans `map.js` (sauf le combat) :

| Horloge | Période | Où | Ce qu'elle fait |
| --- | --- | --- | --- |
| **Battement du monde** | `BATTEMENT_MS` = **1000 ms** | `map.js → battementMonde` | avance l'horloge de jeu d'**1 minute** (donc 1 min de jeu = 1 s réelle), applique faim/soif/fatigue, bascule jour/nuit, sauvegarde tous les 20 battements |
| **Tick des morts** | `TICK_MS` = **900 ms** | `map.js → tickTempsReel` → `zombies_map.js → tickZombies` | les morts errent, perçoivent, poursuivent, frappent aux portes, déclenchent l'anneau de contact |
| **Tick de combat** | **100 ms** | `combat.js → tick` | remplit la jauge de menace, régénère l'endurance, anime la charge |

Elles se **figent** au bon moment : le battement et le tick des morts s'arrêtent pendant
un combat, une cinématique, une modale, ou quand l'onglet est caché (`mondeActif()`,
`modaleBloque()`). En **co-op**, seul l'**hôte** fait avancer l'horloge ; l'invité l'adopte.

> **Une seule horloge pour les morts.** Même quand tu **marches** (un pas animé toutes les
> ~190 ms), les morts ne jouent qu'**un tick par `TICK_MS`** (garde-temps `dernierTickZ` dans
> `map.js`). Sans ça, marcher accélérerait leur cadence ~5× et ferait s'effondrer la lenteur
> voulue en quartier : ils « pondéreraient » d'autant plus vite que tu bouges. Désormais leur
> vitesse ne dépend QUE de l'échelle et de leur type, jamais du fait que toi tu te déplaces.

> Pour **ralentir/accélérer tout le jeu** : `REGLAGES.temps.BATTEMENT_MS`.
> Pour rendre le monde des morts plus nerveux/lent **partout** : `REGLAGES.zombies.TICK_MS`.

---

## 3. L'échelle de carte change TOUT le rapport au temps

Quatre échelles (`carte.echelle`), un même moteur :

| échelle | ce qu'une « case » représente | morts en chair ? |
| --- | --- | --- |
| `interieur` | une **pièce** (quelques mètres) | **oui** — vitesse de référence |
| `quartier` | un **nœud de plan de rues** = un pâté de maisons entier | **oui** — il faut *beaucoup* plus de temps pour traverser |
| `ville` | un secteur de la ville | non (trop abstrait) |
| `region` | le pays salonais | non |

Seules `interieur` et `quartier` ont des morts vivants sur la grille (`carteVivante()`).
Comme une case de **quartier** est **bien plus grande** qu'une case d'**intérieur**, un mort
doit y mettre bien plus de temps à passer d'un point à l'autre — sinon il « téléporte ».
C'est réglé par **`REGLAGES.echelles`** :

```
echelles: {
  interieur: { cadenceZombie: 1, anneauZombie: 1, capDiv: 7 },
  quartier:  { cadenceZombie: 4, anneauZombie: 3, capDiv: 5 },
}
```

- **`cadenceZombie`** multiplie la *période du pas* : à 4, un mort met ~4× plus de ticks
  pour changer de case. En quartier, il **rampe** d'un nœud à l'autre.
- **`anneauZombie`** multiplie la durée de l'**anneau de contact** (`SPIN_TICKS`) : à 3,
  l'instant suspendu avant la morsure dure ~3× plus longtemps → tu as le temps de **t'écarter**.
- **`capDiv`** règle la **densité** de la horde (nb de cases ÷ capDiv) : plus petit = plus de morts.

> Mesuré en simulation (errant, à 4 cases, déjà en chasse, 1 tick = 0,9 s) :
> **intérieur** = 1er pas à ~1,8 s, morsure à ~9 s ; **quartier** = 1er pas à ~7 s,
> **anneau de contact ~8 s**, morsure à ~31 s. C'est l'effet voulu : en ville, *on a le temps*.

Toute échelle non listée retombe sur le défaut sûr `{1,1,7}` (= « comme l'intérieur »).

---

## 4. Les morts en temps réel (`js/zombies_map.js`)

Persistés par carte dans `G.world.zmap[carteId] = { t, z:[…], morts:[…] }`. Chaque mort a
une identité stable (`uid`), un **regard** (`dir`, cône ~90°), une **mémoire** (`mx,my` =
dernier endroit où il t'a vu/entendu) et, au contact, un **anneau** (`spin`, compte à rebours).

Cycle d'un tick (`tickZombies`), par mort :
1. **anneau en cours ?** il se fige, décompte ; à 0, si toujours au contact → **combat**.
2. **perception** : il te voit (cône + ligne de vue + distance ≤ `CONE_PORTEE`), ou te
   sent (nuit, distance ≤ 2), ou te touche → il passe **en chasse** (`ag=1`) et te mémorise.
3. **au contact** (passage ouvert) **et** en chasse → il s'immobilise, **l'anneau démarre**.
4. **cadence** : en chasse il presse le pas, en errance il flâne — le tout **étiré par l'échelle**.
5. **mouvement** : il descend le gradient vers toi (plan à nœuds) ou vers sa mémoire (grille) ;
   chemin bouché par une **porte fermée** → il **tape dedans** (le bois finit par céder).

Le **bruit attire** : un pas qui craque, une fouille brutale, un coup de feu, une cloche →
`attirerZombies()` tourne les têtes du voisinage vers la source.

> Réglages associés : `REGLAGES.zombies.*` (perception, mémoire, cadence de base, anneau)
> et `REGLAGES.echelles.*` (le facteur d'échelle). Le bestiaire (vitesse/dégâts/esquive
> par type) reste dans `js/data/zombies.js` — `vitesse ≥ SEUIL_LENT` classe un mort « lent ».

---

## 5. Le combat : une horde, mais **un mort à la fois**

`combat.js` ne gère qu'**un** adversaire actif (`C.z`) ; les autres patientent dans une
**file** (`C.queue`). Quand `C.z` tombe, le **suivant de la file** surgit (`zombieMort`).
Tu n'es donc **jamais frappé par plusieurs à la fois** — tu les abats **l'un après l'autre**.

- À l'entrée en combat (`map.js → lancerCombatContact`), **toute la meute collée à toi**
  (`meuteAuContact`) entre dans la rencontre : le premier au contact + sa file.
- La taille de la horde s'affiche dans le panneau de combat (« horde de N · ils viennent
  l'un après l'autre »). **Sur la carte**, les morts peuvent désormais s'**EMPILER sur un
  même nœud** (on a retiré le blocage d'occupation dans `tickZombies`) : un seul pion porte
  alors un **chiffre** (2, 3, 20…) — `pionZombie(..., n)`. Une horde qui te fonce dessus se
  lit donc d'un coup d'œil, sans trois silhouettes superposées. Les morts hors de vue mais
  tout proches restent signalés par un **point d'ouïe** estompé (`pointOuie`), à distance de
  **sauts de rue** sur un plan de quartier (`champOuieJoueur` → `distOuie`).
- Renforts possibles en cours de combat : le **hurleur** appelle, un **coup de feu** attire.

L'attaque se **charge** (maintenir = armer, relâcher = frapper) ; chaque geste coûte de
l'**endurance**. Réglages : `REGLAGES.combat.COUTS` (coûts) et `REGLAGES.combat.CHARGE` (profil de charge).

> **HUD de combat** : la **santé du mort actif** se lit sur une **barre horizontale en bas
> au centre** (`#cb-zhp`, pilotée par `majBarres`) ; le bouton **Esquiver** est à **droite de
> Se défendre** (`.cb-def-row`) — un tap qui vaut l'esquive réflexe pendant une ruée, sinon un
> pas de côté délibéré (`resoudreEsquive`). **Visuel des morts** : si une **photo détourée**
> existe dans `/zombies/` (`combat_art.js → pngZombie`, table `ZOMBIE_PNG` car `gonfle`→`gonfleur.png`,
> `enrage`→`enrage.png`), elle s'affiche à la place de la silhouette SVG (`hordeHTML → creatureMarkup`) ;
> sinon on retombe sur `combat_creatures.js`. Les 6 PNG sont précachés dans `sw.js`.

> **Co-op — rejoindre un combat (anti-course)** : la tuile « Rejoindre » n'ouvre PLUS un combat
> à l'aveugle. Le joueur **DEMANDE** (`map.js → rejoindreCombatPair` envoie `demande-rejoindre`),
> et seul l'**hôte de la rencontre** — s'il a un combat VIVANT au même `enc` — répond `rejoindre-ok`
> avec la **file à jour** (`combat.js → repondreDemandeRejoindre`) ; un combat fini répond
> `rejoindre-non` (ou le timeout de 1,8 s tranche). Un mort tué ne laisse donc plus de bouton fantôme.

---

## 6. Le dessin (cinématiques & ambiances)

Tout est du **SVG généré en JS**, style silhouettes plates hiver désaturé (voir l'en-tête
de `js/art/ambiance_lib.js`).

- **Panoramas** (cinématiques) : `js/art/panoramas/*.js`, chacun `export default (a) => "<fragment SVG 1600×340>"`.
  Enregistrés dans `js/art/panoramas/index.js`. Enveloppés en `<svg>` par `ambiance.js → svgPano(id, heure)`.
- **Ambiances de carte** : `js/art/ambiances/*.js`, même principe (fond derrière la grille).
- L'objet **`a`** passé à chaque dessin = `{ ...ciel(heure), heure, p }` →
  `{ haut, bas, lum (0→1), nuit, heure, p (préfixe d'ids) }`. Le **ciel est dynamique** :
  sa couleur suit l'heure de jeu (`ambiance_lib.js → ciel/ARRETS`).
- **Helpers communs** dans `ambiance_lib.js` : `batisse`, `toits`, `zfig` (errant), `halo`,
  `brume`, `neige`, `astre`, `carcasse`, `lampadaire`, `pin`…

**Bancs d'essai** : pour regarder un panorama sans lancer toute la partie, ouvrir
`/_pano_harness.html?p=<id>` (rendu à plusieurs heures côte à côte). *(Fichier temporaire,
à recréer au besoin : il importe `ambiance_lib.js` + `panoramas/index.js`.)*

> Pièges récurrents quand on dessine une rue : ne **jamais laisser une trouée de ciel
> piégée entre deux immeubles** (fermer l'horizon par un mur de bâtiments continu, et faire
> *fuir* une rue par un coin sombre plutôt qu'un rectangle noir). Espacer les figures
> (oiseaux, errants) pour qu'elles ne s'**empilent** pas ; varier leur taille = profondeur.

---

## 7. Réglages — le tableau de bord (`js/data/reglages.js`)

Tout ce qui suit se change **à un seul endroit**, chaque champ est commenté *avec son effet*.

| Pour obtenir… | Change… | Effet |
| --- | --- | --- |
| Temps de jeu plus lent/rapide | `temps.BATTEMENT_MS` | ms réelles pour 1 minute de jeu |
| Morts plus/moins nerveux **partout** | `zombies.TICK_MS` | période du tick des morts |
| **Plus de temps avant la morsure** | `zombies.SPIN_TICKS` (× `echelles.*.anneauZombie`) | durée de l'anneau de contact |
| Morts plus/moins voyants | `zombies.CONE_PORTEE`, `OUIE_JOUEUR`, `MEMOIRE_TICKS` | vue, ouïe, ténacité |
| Pas de base plus lent | `zombies.PERIODE_LENT/VIF`, `SEUIL_LENT` | cadence selon la lourdeur du mort |
| **Zombies en ville (quartier) plus lents** | `echelles.quartier.cadenceZombie` | ↑ = il rampe davantage |
| **Anneau plus long en ville** | `echelles.quartier.anneauZombie` | ↑ = plus de temps de réagir |
| Hordes plus/moins denses | `echelles.*.capDiv` | ↓ = plus de morts par carte |
| Combat plus/moins coûteux | `combat.COUTS`, `combat.CHARGE` | endurance, profil de charge |
| **Piles qui durent plus/moins** | `lumiere.MIN_PAR_PILES` (déf. 1440 = 24 h), `MIN_TORCHE` | minutes de jeu par paire / par torche |
| **Portée d'une lampe** | `lumiere.RAYONS` (par id : `lampe_torche` 2…) | nb de cases éclairées autour (intérieur) |
| **Fouille plus/moins longue** | `fouille.DUREE_MS` (par échelle), `TATONS_MULT` | durée d'une fouille COMPLÈTE (barre 0→100 %) |
| **Aide à la fouille à deux** | `fouille.COOP_MULT` | ↑ = la barre se remplit plus vite à deux |

### Recettes express
- **« En ville, ils vont encore trop vite »** → augmente `echelles.quartier.cadenceZombie`
  (5–6) et/ou `anneauZombie` (4).
- **« Je veux de vraies hordes (≈20) »** → baisse `echelles.quartier.capDiv` (3–4).
  *Attention* : la horde reste plafonnée par le nombre de cases de la carte.
- **« L'intérieur aussi est trop brutal »** → augmente `zombies.SPIN_TICKS` (4).
- **« Le temps file trop vite »** → augmente `temps.BATTEMENT_MS` (ex. 1500).

---

## 8. Vérifier qu'on n'a rien cassé

- **Données** (liens entre cartes, ids, connexité, graphe des scènes) :
  `node --input-type=module -e "import('file:///<chemin>/tools/validate_data.js')"`.
- **Chargement** : ouvrir le jeu, vérifier la console (aucune erreur d'import = tous les
  modules se lient).
- **Comportement temps réel** : on peut piloter `zombies_map.js → tickZombies` sur une carte
  synthétique (`echelle` + `ouvert:true` pour la passabilité en intérieur) et compter les
  ticks jusqu'au 1er pas / à l'anneau / au contact — c'est ainsi qu'ont été mesurées les
  valeurs du §3.
