# One More Day — Design de gameplay (refonte v3)

> Document du **game designer**. Il justifie chaque nombre de `js/data/reglages.js` et des données
> (`zombies.js`, `items.js`, `clothing.js`, `recipes.js`, `butin.js`, `lieux_gameplay.js`, `zones.js`,
> `rencontres.js`, `rencontres_scenes.js`). Les moteurs (exploration, voyage, combat, interface) lisent
> **les nombres dans `reglages.js`** et **les règles ici**. Si les deux divergent, `reglages.js` fait foi
> pour le chiffre, ce document pour l'intention.
>
> Vérification des données : `node tools/verifier_gameplay.mjs` (code ≠ 0 en cas d'erreur).

---

## 0. Ce qui change, et pourquoi

Les parties réelles de l'ancienne version ont montré quatre défauts. Chacun a une réponse précise :

| Symptôme observé | Cause | Réponse de la refonte |
|---|---|---|
| **15 coups, dont la moitié ratés**, contre un simple errant à mains nues | toucher de base 62 %, pénalisé par la charge ; dégâts à mains nues 3-6 contre 30 PV | toucher de base **88 %** (jamais sous 50 %), plus de malus de charge ; mains nues **≈ 8 coups / 3 s**, couteau **≈ 4 coups / 1,6 s** (§4.9) |
| **« Trop épuisé »** en boucle, le bouton ne fait rien | chaque geste était refusé sous son coût | **on ne refuse jamais un coup** : sous 15 d'endurance, il part quand même, mou (×0,6) et lent (×1,5). Seule l'**esquive** est bloquée, et le bouton l'affiche (« À bout de souffle ») |
| **Mort d'infection au jour 1** après deux combats | ~45 % des coups encaissés faisaient une plaie, qui s'infectait vite et tuait (0,045 PV/min) | l'infection bactérienne est **lente** (−11 PV/jour par plaie infectée) et **soignable** ; la contamination par les morts devient une **jauge visible** (« le mal »), et un mort humain **ne mord qu'en empoignade ratée** (§5.4) |
| **La garde s'effondre** sans qu'on comprenne | la garde tombait à zéro 2 s après sa charge pleine, sans avertissement | la garde ne **tombe plus au bout d'un temps**. Elle ne cède que **quand l'endurance est vide**, et la barre montre en permanence ce que coûtera le prochain blocage |

Les principes, dans l'ordre : **lisible** (on sait toujours pourquoi on a pris un coup) → **des choix plutôt que du hasard** (bruit contre temps, risque contre butin) → **une rareté maîtrisée** (on manque d'une chose à la fois) → **une courbe** (le jour 1 apprend) → **jouable au doigt** (marges sur mobile) → **à deux, plus de monde mais pas deux fois plus de butin**.

---

## 1. La boucle de jeu

**Horloge** : `temps.MS_PAR_MINUTE = 1667` : 1,67 seconde réelle = 1 minute de jeu, **une journée ≈ 40 minutes réelles**
(40 % plus lente qu'à l'origine). En voyage, l'horloge garde l'ancien rythme (×1,667) pour que les trajets ne s'allongent pas.
En solo, le temps s'arrête pendant les scènes et les panneaux (inventaire, corps, fabrication) ; le combat se joue en temps réel.
Fabriquer et attendre **accélèrent** l'horloge (×10 : une recette de 30 min dure toujours ~5 s réelles). En co-op, le temps coule toujours à ×1
(le sommeil n'accélère que si **les deux** dorment).

| Échelle | Temps réel | Ce qu'on y fait | Ce qui la rend tendue |
|---|---|---|---|
| **La minute** (le geste) | 5 à 60 s | écouter une onde, avancer accroupi(e), fouiller un placard (2-7 s), un combat (10-40 s) | chaque action fait du **bruit**, la lumière **se voit**, la fouille est **interruptible** |
| **L'heure** (le lieu, le trajet) | 1 à 10 min | vider un étage, choisir une destination, traverser 1 km (≈ 12 s + rencontres) | **risque contre butin**, piles qui baissent, endurance, blessures qui saignent |
| **Le jour** (le plan) | ≈ 20 min | 2-4 lieux, 2-4 trajets, 2 repas, 2-3 gorgées d'eau, 1 nuit (5 s si on dort en lieu sûr) | l'eau propre, la nuit qui tombe à 21 h, **où dormir**, la courbe qui monte |
| **La partie** | 3 à 6 h | 10-15 jours de jeu, quêtes du scénariste | la région qui durcit, le mal, les armes qui s'usent |

**Journée type (jour 3, solo)** : réveil 7 h en lieu barricadé → boire, manger une conserve (−1 eau, −1 conserve) →
trajet de 900 m vers la gare (≈ 11 min, une rencontre une fois sur deux) → 15 min réelles dans la gare (8-12 meubles,
2-4 combats, 1-2 paires de piles consommées si c'est sombre) → retour ou refuge avant 21 h → cuisiner au feu
(pâtes, eau bouillie) → barricader → dormir 8 h. **Besoins du jour** : ≈ 50 de faim (un repas cuisiné + un en-cas),
≈ 72 de soif (≈ 0,9 L), une nuit de sommeil.

---

## 2. Temps 1 — Exploration

### 2.1 Se déplacer (`exploration.VITESSE`, en cases/s ; 1 case = 0,8 m)

| Allure | Vitesse | Bruit (rayon) | Endurance | Pourquoi |
|---|---|---|---|---|
| Accroupi(e) | 1,6 (+5 %/niv d'Agilité) | 0,5 | +7/s | lent mais quasi muet : on passe à 1 case d'un mort qui dort |
| Marche | 3,2 | 2 | +6/s | on traverse une pièce de 6 m en ≈ 2,3 s ; **plus rapide que tout mort humain qui erre** |
| Course | 5,4 | 6 | −5/s (20 s de sprint) | plus rapide que tout mort humain en chasse (coureur 4,6, enragé 4,2). **Chiens (6,2) et fauve (6,5) vont plus vite** : il faut une porte |

- Le **sol** multiplie le bruit des pas (`BRUIT_SOL`) : moquette ×0,6, gravier ×1,5, **débris/verre (`;`) ×2,5**.
- La **Discrétion** retire 10 % par niveau à tous les bruits du joueur (−50 % au niveau 5).
- **Surpoids** : vitesse ×(1 − 0,3 f), f = 0..1 entre le poids max et le plafond (§8).

### 2.2 Le bruit (`exploration.BRUIT`)

Un bruit est un **cercle** : tout mort à une distance ≤ rayon × `ouie` du mort l'entend (un mur divise le rayon par 2,5
(`ATTENUATION.mur` 0,4), une porte fermée ×0,6). Un mort qui entend passe en **alerte** : il va voir, reste 12 s, repart.

| Source | Rayon (cases) | | Source | Rayon |
|---|---|---|---|---|
| Pas accroupi | 0,5 | | Fouille (par seconde) | 2 à 5 selon meuble |
| Pas | 2 | | Combat (par seconde) | 8 |
| Course | 6 | | Porte forcée | 10 |
| Porte ouverte/fermée | 4 (7 si claquée en courant) | | Vitre brisée | 12 |
| Toux (rhume) | 5 | | Coup de feu | **25** |
| Clouer / démonter | 6 par seconde | | Hurleur qui te repère | **30** |

**Leurres** : tout objet avec un champ `jet` se **lance** en exploration (portée 6-10 cases) et fait du bruit **là où il
tombe** : bouteille 9, canette 5, brique 6, réveil piégé 12 pendant 10 s, pétards 18 pendant 6 s, fusée de détresse
(lumière 8 cases pendant 2 min, les morts vont vers elle). C'est **l'outil de la discrétion** : on fait regarder ailleurs.

### 2.3 Les morts voient, entendent, oublient (`exploration.PERCEPTION`)

États : `dort` → `immobile` → `erre` → `alerte` (va vers un bruit) → `chasse` (chemin vers le joueur) → `contact`.
Un rampant peut aussi « faire le mort » (`fait_le_mort`) : il ne se lève que lorsqu'on passe à côté de lui.

- **Vue** : cône de 100°, portée = `vue` du mort (5 à 12 cases) × lumière **sur le joueur** (éclairé ×1, pénombre ×0,55,
  noir ×0,2) × accroupi(e) ×0,6 × Discrétion (−6 %/niv) × météo. **Une lampe allumée trahit** : vu(e) à `vue` × 1,8
  même dans le noir ; un mort **dans le faisceau** voit à ×2.
- **Repérage progressif** : un « ? » se remplit au-dessus du mort, de **350 ms** collé à **2,2 s** au bout de sa vue.
  Sortir du cône le vide (50 %/s). **C'est la lisibilité de la discrétion** : on voit qu'on est vu(e) *avant* de l'être.
- **Mémoire** : en chasse sans te voir, il va à ta dernière position et fouille 9 s.
- **Odorat** (chiens, fauve, sanglier) : repère à 5-6 cases à travers tout, sans lumière.
- **Ce que TU entends** : un mort hors de vue à ≤ 8 cases (12 s'il grogne en chasse) laisse une **onde** sur le bord
  de l'écran. `grogne` = rayon de ses grognements.
- **Contact** à ≤ 0,7 case → combat. Les morts **en chasse** à ≤ 4 cases rejoignent la file ; un mort qui arrive au
  contact pendant le combat rejoint aussi la file.

**Attaque furtive** (`FURTIF`) : frapper un mort **non alerté**, de dos (angle > 70°) → 1er coup **×3**. Si ce coup tue
(errant de 30 PV : couteau 7-11 ×3 = 21-33, soit 55 % de chances ; machette : toujours), **pas de combat** : mise à mort
silencieuse (bruit 1), +6 XP de Discrétion. Sinon le combat s'ouvre avec la menace à 0 (« engagé »).

### 2.4 Fouiller (`fouille`)

Fouille **en temps réel** : une barre, un bruit émis chaque seconde, **interruptible à tout moment**. Les objets se
**révèlent au fil de la barre** (à (i+1)/(n+1) de sa longueur), donc interrompre garde ce qui a déjà été trouvé, et le
reste attend dans le meuble.

| Meuble (catégorie) | Durée (1 case) | Bruit/s | | Meuble | Durée | Bruit/s |
|---|---|---|---|---|---|---|
| table | 2 s | 2 | | comptoir | 4 s | 3 |
| poubelle | 2,5 s | 3,5 | | étagère / rayonnage | 4 s | 3 |
| canapé | 3 s | 2 | | bureau | 4,5 s | 3 |
| frigo | 3 s | 3 | | armoire (vêtements) | 5 s | 2 |
| caisse | 3 s | 4 | | cuisine (placards) | 5 s | 3,5 |
| lit | 3,5 s | 2 | | machine | 6 s | 4 |
| salle de bain | 3,5 s | 2,5 | | **voiture** | **7 s** | **5** |

- **+0,8 s par case** de meuble au-delà de la première (un rayonnage `ssss` : 6,4 s).
- **À tâtons** (pièce noire, pas de lampe) : ×1,5 plus long, chances ×0,75.
- **À deux** sur le même meuble : ×1,6 plus vite.
- Tirage : `tirerButin()` dans `butin.js` (§9), **une seule fois**, à la première fouille, sur la graine du lieu :
  les deux joueurs voient le même contenu.

### 2.5 Lumière et piles (`lumiere`)

| Source | Forme | Portée | Autonomie | Main | Vue par les morts à |
|---|---|---|---|---|---|
| Lampe torche | cône 60° | 9 cases | **600 min / paire de piles** (≈ 10 min réelles) | 1 | 14 |
| Lampe frontale | cône 70° | 7 | 480 min | 0 | 12 |
| Frontale de fortune | cône 50° | 7 | 600 min | 0 | 12 |
| Lampe à huile | halo | 4 | 300 min / huile | 1 | 12 |
| Torche | halo | 5 | 150 min puis détruite | 1 | **20** |
| Feu de camp (posé) | halo | 6 | 120 min | — | 25 |
| Fusée de détresse (lancée) | halo | 8 | 20 min | — | 40 |

- **Pourquoi 600 min** : un grand bâtiment sombre (hôpital, cinéma) demande 10 à 20 minutes réelles → **2 à 3 paires
  de piles**. On en trouve régulièrement (bureaux, comptoirs, bricolage), mais pas assez pour laisser la lampe allumée
  en permanence. **Éteindre la lampe** devient donc un vrai choix.
- **Mains** : une arme **à deux mains** (hache, masse, lance, pelle, fusils) interdit la lampe torche → frontale,
  lampe posée, ou on se bat dans le noir (toucher −15 %).
- Lumière ambiante : pièce `sombre` 0 = fenêtres (×lumiereJour), 1 = pénombre (×0,45), 2 = noir. Une fenêtre éclaire
  5 cases. **Vision du joueur** : 16 cases éclairé, 6 en pénombre, 1,5 dans le noir. Ce qui a été vu reste en gris.
- **Nuit dehors** : lumiereJour tombe à 0,12 (la lune) : on devine les formes à ~3 cases.

### 2.6 Portes, verrous, mobilier

- **Porte** : 60 PV (extérieure 120, barricadée 180). Un mort qui cogne frappe toutes les 1,5 s pour `cogne` dégâts
  (errant 4 → 22 s pour une porte intérieure ; colosse 25 → 4 s ; il **enfonce** en charge).
- **Forcer** au pied-de-biche : 5 s (−10 %/niv de Force), bruit 10, −2 durabilité de l'outil.
  **Crocheter** : 9 s (−12 %/niv de Mécanique), bruit 1, il faut des crochets et le niveau de Mécanique du verrou.
- **Barricader** une porte : 2 planches + 4 clous + un outil `marteler`, 20 min (≈ 3 s réelles), bruit 6/s.
  Une pièce **entièrement** barricadée est un **lieu sûr** pour dormir et n'est jamais repeuplée.
- **Démonter** du mobilier (outil `marteler` ou `forcer`) : chaise 1 planche (4 s), table 2 (7 s), lit 2 planches + 1
  ressort (9 s), étagère 2 (8 s). Bruit 6/s. C'est **la source de planches** hors des magasins de bricolage.

### 2.7 L'eau et la pêche (`exploration.EAU`, `CHASSE_PECHE`)

- **Eau croupie** (à faire bouillir ou filtrer) : réservoir de WC `w` (1,5 L, 80 %), baignoire `h` (5 L, 30 %),
  évier `k` (0,5 L, 40 %), une fois chacun. **Points d'eau inépuisables** (marqueur de niveau `eau`) : la Fontaine
  Moussue de la place Crousillat, le canal de Craponne, les puits. Remplir : 2 min, bruit 1.
- **Pêche** : canne, 30 min → poisson à 35 % + 10 %/niv de Chasse (+20 % avec un appât). **Nasse** : 60 % en 6 h.
  **Collet** : 40 % + 10 %/niv en 8 h → viande crue. **Dépecer** un sanglier : 20 min, 3-5 viandes × (1 + 0,2 × Chasse).

### 2.8 Repeuplement (`exploration.REPEUPLEMENT`, `lieux_gameplay.repeuplement`)

Au retour dans un lieu, après au moins **6 h** d'absence :
`nouveaux = floor(repeuplement × jours d'absence × (retour de nuit ? 1,5 : 1) × difficulté × (co-op ? 1,3 : 1) + reste graine)`,
plafonnés pour qu'il n'y ait jamais plus de `morts.n[1]` morts procéduraux vivants. Ils apparaissent **loin de l'entrée,
dans les pièces sombres d'abord**. Valeurs : de 0,2/jour (musée, tour, ruines) à 1,2/jour (hôpital, Canourgues, Leclerc).
Un refuge qu'on garde barricadé reste propre ; **les grands lieux publics se remplissent de nouveau**.

---

## 3. Temps 2 — La carte et le voyage

### 3.1 La vitesse de marche (`voyage.ALLURES`, `MALUS_VITESSE`)

| Allure | km/h | m/min | Rencontres | Fatigue | Endurance | Spécial |
|---|---|---|---|---|---|---|
| **Discrète** | 3 | 50 | ×0,55 | ×0,8 | — | la nuit tombe plus vite sur toi |
| **Normale** | 5 | 83 | ×1 | ×1 | — | |
| **Rapide** | 8 | 133 | ×1,25 | ×1,8 | −0,6/min | **25 % des rencontres hostiles sont « distancées »** (converties en ambiance : « des silhouettes se retournent ; tu es déjà loin ») |

Multiplicateurs de vitesse (cumulatifs) : surpoids ×lerp(1 ; 0,7 ; f) · pire blessure **non soignée** à une jambe
(gravité 2 : ×0,85 ; 3 : ×0,7 ; 4 : ×0,55 — attelle ou suture l'annulent) · fatigue < 25 : ×0,85 · nuit ×0,9 · pluie ×0,9.
**À deux** : on avance au pas du plus lent.
Distance : itinéraire routé si la carte en fournit un, sinon vol d'oiseau × 1,25 (ville) / × 1,2 (région).

### 3.2 La formule des rencontres

L'itinéraire est découpé en tronçons de **50 m** (ville) / **250 m** (région). Pour chaque tronçon :

```
d        = MAX(danger des zones de même échelle contenant le point) ou DANGER_DEFAUT (ville 0,25 ; région 0,12)
d        = min(1, d + courbe.danger(jour))
λ_tronçon = PAR_KM[échelle] × (0,4 + 1,6 d) × km
           × (départ de nuit ? 1,5 : crépuscule ? 1,2 : 1)
           × allure.rencontres × (co-op ? 1,3 : 1) × courbe.rencontres(jour)
           × météo.rencontres × (le joueur saigne ? 1,2 : 1) × difficulté.rencontres
Λ        = Σ λ_tronçon   (demi-tour : × 0,5)
N        = Poisson(Λ) tiré sur seedRng(seed + ':voyage:' + de + '>' + vers + ':' + minuteDeDépart), plafonné à MAX (3 ville, 5 région)
```

`PAR_KM` = **0,6** (ville) et **0,17** (région). Les N rencontres sont placées entre **12 % et 92 %** du trajet,
à **180 m** (ville) / **1 200 m** (région) d'écart au moins. Chacune est tirée parmi les rencontres **éligibles au point
où elle tombe** (échelle, zones, nuit, dangerMin, condition `si`, `unique` pas déjà vue), au prorata de `poids`.
Une rencontre de **combat** reçoit en co-op +1 mort du pool de la zone (50 %). La rencontre « surprise » (brouillard,
`combat.surprise`) démarre la jauge de menace à 70 %.

### 3.3 La jauge de risque (5 crans)

Risque = **espérance du nombre de rencontres hostiles** (combats + choix marqués `hostile`), en tenant compte de la part
« distancée » à allure rapide. Seuils `RISQUE_CRANS = [0,2 ; 0,45 ; 0,8 ; 1,3]`. On affiche deux raisons au plus :
« quartier infesté » (une zone traversée ≥ 0,6, nommée), « de nuit », « allure rapide : on t'entend venir »,
« à deux, on se fait remarquer », « tu saignes ».

Trajets réels simulés (`reglages` actuels, solo, allure normale) :

| Trajet | Distance | Durée | Jour 1 | Jour 3 | Jour 3, nuit | Jour 3, discrète | Jour 3, co-op | Jour 8 |
|---|---|---|---|---|---|---|---|---|
| Cimetière → Tour de l'Horloge | 660 m | 8 min | 1/5 (0,28 renc.) | 2/5 | 3/5 | 1/5 | 2/5 | 3/5 |
| Hôtel de la Poste → Gare | 910 m | 11 min | 2/5 (0,38) | 3/5 (0,67) | 3/5 | 2/5 | 3/5 | 3/5 |
| Hôtel → Canourgues | 1,5 km | 18 min | 2/5 | 3/5 (1,05) | 4/5 | 2/5 | 4/5 | 4/5 |
| Hôtel → Leclerc des Viougues | 2,65 km | 32 min | 3/5 (1,03) | 4/5 (1,84) | 5/5 | 3/5 | 5/5 | 5/5 |
| Salon → Pélissanne | 5,2 km | 62 min | 2/5 (0,56) | 3/5 (1,0) | 4/5 | 2/5 | 3/5 | 4/5 |
| Salon → BA 701 | 4,7 km | 56 min | 2/5 | 3/5 | 4/5 | 2/5 | 4/5 | 4/5 |
| Salon → La Barben | 10,9 km | 2 h 11 | 3/5 (1,1) | 4/5 (2,0) | 5/5 | 3/5 | 5/5 | 5/5 |
| Salon → triage de Miramas | 12,4 km | 2 h 29 | 3/5 (1,4) | 5/5 (2,5) | 5/5 | 3/5 | 5/5 | 5/5 |

En ville, un trajet sur deux est interrompu une fois. Un long trajet dans la région donne deux ou trois cartes-événements.
La nuit ajoute environ un cran, l'allure discrète en retire un.

> Le **prologue** du scénariste (cimetière → tour, rencontres scénarisées) devrait désactiver les rencontres
> aléatoires : proposition de drapeau `voyage_sans_aleatoire` posé par ses déclencheurs.

### 3.4 Les rencontres (`rencontres.js`, 45 entrées) et leurs conséquences

| Type | Nombre | Ce qui se passe | Conséquences possibles |
|---|---|---|---|
| `combat` | 10 | carte-événement (texte) → Temps 3 | blessures, usure, XP ; fuite = on repart avec les morts derrière |
| `choix` | 22 | scène à choix (`rencontres_scenes.js`) | **détour** (+m), **demi-tour**, temps perdu, butin, combat, blessure, découverte d'un lieu |
| `pnj` | 4 | scène avec orateur, **unique** | troc (on donne pour recevoir), découverte de lieux, drapeaux |
| `butin` | 3 | carte + `tirerButinTable('voyage.x', n)` | objets, quelques minutes |
| `ambiance` | 6 | carte de texte seule | parfois −5 sta, quelques minutes ; aucune perte « gratuite » |

Répartition voulue : **≈ 55-65 % hostiles**, le reste respire (ambiance, butin, PNJ). Les choix ont **toujours** une
sortie sans jet (détour, demi-tour, passer), **payée en mètres ou en temps**, jamais en PV. Un jet affiche son
pourcentage : `P = 0,6 + 0,12 × (niveau − difficulté)`, bornée 10-95 % (`scenes.TEST`). Au niveau 0, difficulté 1 : 48 %.

**Extensions d'EFFETS utilisées par les scènes de voyage** (à implémenter par `dialogue.js` / `voyage.js`) :
`detour: m` (ajoute des mètres restants) · `demiTour: true` (retour = distance parcourue, rencontres × 0,5) ·
`butin: { table: 'voyage.cadavre', n }` · `combat: { zombies, surprise }` · `choix.texte` (texte de résultat d'un choix
sans test, affiché comme `reussite.texte`) · `suivant: '#combat'` (ferme la scène, lance `effets.combat`).
**Jumelles** : avant le départ, la 1re rencontre hostile est montrée sur l'itinéraire, avec l'option de la contourner
(+250 m ville, +1 500 m région).

### 3.5 Les zones (`zones.js`)

30 cercles réels : 14 en ville (centre ancien 0,45, cours 0,4, place Morgan 0,5, gare 0,55, **abords de l'hôpital 0,75**,
lycée 0,5, Saint-Roch 0,35, Canourgues 0,6, commissariat 0,5, Gandonne 0,4, **Viougues 0,6**, Bel-Air 0,4,
A7 0,55, collines du nord 0,15) et 16 dans la région (Salon 0,45, A7 nord 0,5, **péage de Lançon 0,6**, A54 0,45,
**BA 701 0,8**, Crau 0,2, triage de Miramas 0,65, Istres 0,5, Saint-Chamas 0,45, étang de Berre 0,45, La Barben 0,55,
Pélissanne 0,4, Durance 0,35, Alpilles 0,2, chaîne des Côtes 0,2, aérodrome 0,4). Chaque zone a un **pool** : les
rencontres de combat « du pool » et les renforts y puisent, filtrés par `jourMin`.

---

## 4. Le combat — dans l'exploration, en temps réel

> Refonte : il n'y a plus d'écran de combat. Trois gestes : **se déplacer, frapper, pousser** (pas d'esquive ni de garde).
> Les règles sont dans `REGLAGES.combat` et `js/explore/combat.js` ; ce chapitre en donne l'intention.

### 4.1 Le cycle d'un mort au contact

```
 [CHASSE : il s'approche, s'arrête à 0,7 case] → [à portée : 0,25-0,7 s] → [TÉLÉGRAPHIE `telegraphe` ms : arc au sol] → [ATTAQUE] → [RÉCUP `cadence` ms] ↺
                                                                         rouge = COUP · ambre = EMPOIGNADE
```
- L'attaque **touche** si, à la fin de la télégraphie, tu es encore à `portee` + 0,25 case et dans son cône de 120° (il pivote
  pendant la télégraphie, pas assez vite pour une sortie sur le côté). **Reculer d'un pas suffit** : c'est le cœur du combat.
- **Poussée** (recharge 0,8 s, 7 sta) : annule les télégraphies devant toi, fait reculer (1,2 case) et vaciller ; 20 % + 5 %/Force
  de mise à terre. Résistance ≥ 0,75 (colosse) : il ne bouge pas.
- **Coup chargé** ≥ 50 % qui touche un mort qui télégraphie : **interruption**. Coup lourd (≥ 90 %) : gros recul.
- **Empoignade** : anneau de 2,4 s (+0,3 s au doigt), marteler Frapper/Pousser. Pendant ce temps les autres morts attendent.
  Raté : **morsure** (seule source de morsure humaine).
- Toucher garanti : mort à terre, qui vacille, attaque furtive (×3, silencieuse si elle tue).

### 4.2 Les morts (`zombies.js`) — cinq types, hommes et femmes

Pour l'instant : **Errant·e** (l'étalon), **Coureur·se** (rapide, fragile), **Rampant·e** (au sol, empoigne les chevilles),
**Hurleur·se** (alerte tout le niveau, à tuer en premier), **Colosse** (95 PV, charge, casse des os). Chaque mort est un homme ou
une femme (tiré sur sa graine : silhouette, cheveux, nom affiché). Les autres types ci-dessous sont **rangés** : leurs ids restent
valides (`ALIAS_MORTS`) et désignent le type actif le plus proche.

(Tableau d'origine, conservé comme référence :)

| Mort | PV | Dégâts | Menace | Télégr. | Cycle | Saisie (taps) | Esquive | Résist. | Spécial | Vitesse errance/chasse | Vue | Ouïe | Jour |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Errant** `errant` | 30 | 6–10 | 3200 | 900 | 4100 | 35 % (7) | 0 | 0,1 |  | 0,5 / 1,8 | 8 | 1 | 1 |
| **Rampant** `rampant` | 18 | 5–9 | 3600 | 1000 | 4600 | 60 % (5) | 0,05 | 0 | rampe | 0,25 / 0,9 | 5 | 1,2 | 1 |
| **Putréfié** `putrefie` | 20 | 4–8 | 3400 | 1000 | 4400 | 40 % (5) | 0 | 0 | souille | 0,35 / 1,4 | 5 | 0,9 | 1 |
| **Coureur** `coureur` | 26 | 7–12 | 2000 | 700 | 2700 | 30 % (6) | 0,15 | 0,1 | enchaîne 0,15 | 0,8 / 4,6 | 10 | 1 | 2 |
| **Hurleur** `hurleur` | 24 | 5–9 | 2800 | 900 | 3700 | 35 % (6) | 0,05 | 0,1 | hurle | 0,6 / 2,4 | 11 | 1,4 | 2 |
| **Gonflé** `gonfleur` | 50 | 6–11 | 3800 | 1100 | 4900 | 50 % (8) | 0 | 0,5 | explose ; souille | 0,35 / 1,3 | 6 | 0,8 | 2 |
| **Chien infecté** `chien_infecte` | 22 | 7–12 | 1800 | 650 | 2450 | — | 0,25 | 0 |  | 1,2 / 6,2 | 9 (+odorat 5) | 1,6 | 2 |
| **Enragé** `enrage` | 44 | 11–17 | 1700 | 600 | 2300 | 25 % (9) | 0,05 | 0,35 | enchaîne 0,4 | 0,9 / 4,2 | 9 | 1,1 | 4 |
| **Colosse** `colosse` | 95 | 18–28 | 4200 | 1300 | 5500 | 20 % (12) | 0 | 0,8 | charge ; armure 0,2, perce-garde, fracture 0,35 | 0,5 / 2 | 7 | 0,8 | 3 |
| **Soldat de la 701** `militaire` | 55 | 9–15 | 2600 | 850 | 3450 | 35 % (9) | 0,05 | 0,5 | armure 0,35, casque | 0,6 / 2,4 | 9 | 1 | 3 |
| **Lionne de La Barben** `fauve` | 70 | 13–20 | 1900 | 700 | 2600 | 45 % (10) | 0,2 | 0,6 | charge | 1 / 6,5 | 12 (+odorat 6) | 1,3 | 3 |
| **Sanglier** `sanglier` (vivant) | 60 | 10–16 | 2400 | 800 | 3200 | — | 0,1 | 0,7 | charge ; fuit à 30 % | 0,8 / 5,8 | 6 (+odorat 5) | 1,2 | 1 |

**Ce que chacun enseigne** :
- **Errant** : l'étalon. Un cycle de 4,1 s laisse le temps de lire.
- **Rampant** : il est bas, il fait le mort et empoigne les chevilles (60 %). Des bottes ou des jambières le rendent presque inoffensif.
- **Putréfié** : faible, mais ses plaies sont **sales** (infection ×2,5). Le soigner tout de suite paie.
- **Coureur** : il faut réagir vite (700 ms) et il esquive (15 %).
- **Hurleur** : à tuer en premier. Une jauge de **cri de 2,5 s** démarre 1 s après son entrée ; un coup qui le fait
  vaciller, une poussée ou sa mort la coupent. Si le cri va au bout, 1 ou 2 renforts arrivent 4 s plus tard. En
  exploration, il hurle quand il te repère (bruit 30).
- **Gonflé** : s'il meurt d'un coup de mêlée d'allonge < 2, il **éclate** : 10-16 dégâts, −20 sta, toutes tes plaies
  ouvertes deviennent sales. Il faut une lance, une pelle, une arme de tir, ou le pousser puis frapper à bout de bras.
- **Chien** : télégraphie courte, il esquive beaucoup et mord dès la ruée (morsure *animale* : peu de mal, beaucoup
  d'infection). On ne le distance pas en courant.
- **Enragé** (jour 4) : 600 ms de télégraphie et 40 % de chance d'**enchaîner** une deuxième ruée à mi-jauge.
- **Colosse** : lent (5,5 s par cycle) mais énorme. **Ta garde ne bloque que la moitié** de ce qu'elle bloque d'habitude,
  la poussée ne marche pas, ses coups cassent des os (35 %). Réponses : esquiver, frapper chargé, ou éviter le combat.
- **Soldat de la 701** : armure (−35 % des dégâts non critiques, moitié moins contre une balle), casque (critiques ×0,5).
  Il paie : munitions 5,56, rations, parfois un casque, très rarement un fusil d'assaut.
- **Lionne de La Barben** : prédatrice (vue 12, odorat 6), elle bondit de 5 cases et plaque au sol (empoignade à 10 taps).
- **Sanglier** (vivant) : il ne transmet pas le mal, il **fuit à 30 % de PV**, et une fois tué il donne 3 à 5 viandes.
  Territorial : il ne charge qu'à 5 cases ou moins.

### 4.3 Les armes (`items.js`)

| Arme | Dégâts | Vitesse ms | Sta | Allonge | Charge | Stagger | Crit | Dur | Bruit | Comp. | Mains | Poids |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mains nues | 3–6 (+1/niv) | 380 | 4 | 0 | 1,5 | 0,15 | 0,05 | — | 0 | mainsNues | — | — |
| Couteau de cuisine | 7–11 | 400 | 5 | 0 | 1,4 | 0,05 | 0,15 | 40 | 0 | dexterite | 1 | 0,3 |
| Couteau artisanal | 5–9 | 420 | 5 | 0 | 1,3 | 0,03 | 0,12 | 18 | 0 | dexterite | 1 | 0,3 |
| Couteau de combat | 10–15 | 380 | 5 | 0 | 1,5 | 0,08 | 0,2 | 90 | 0 | dexterite | 1 | 0,35 |
| Tournevis | 4–8 | 380 | 4 | 0 | 1,4 | 0,02 | 0,2 | 25 | 0 | dexterite | 1 | 0,15 |
| Machette | 13–20 | 560 | 9 | 1 | 1,6 | 0,2 | 0,15 | 50 | 0 | dexterite | 1 | 0,8 |
| Machette aiguisée | 15–22 | 560 | 9 | 1 | 1,6 | 0,2 | 0,22 | 42 | 0 | dexterite | 1 | 0,8 |
| Sabre de cavalerie | 15–23 | 520 | 8 | 1 | 1,6 | 0,2 | 0,2 | 35 | 0 | dexterite | 1 | 1,1 |
| Lance artisanale | 10–16 | 560 | 8 | 2 | 1,5 | 0,15 | 0,12 | 20 | 0 | dexterite | 2 | 1,3 |
| Lance renforcée | 12–18 | 560 | 8 | 2 | 1,5 | 0,18 | 0,14 | 40 | 0 | dexterite | 2 | 1,5 |
| Marteau | 7–12 | 520 | 7 | 0 | 1,6 | 0,25 | 0,1 | 60 | 1 | force | 1 | 0,6 |
| Clé à molette | 8–13 | 560 | 8 | 0 | 1,6 | 0,25 | 0,08 | 80 | 1 | force | 1 | 0,9 |
| Tonfa | 8–13 | 460 | 6 | 0 | 1,6 | 0,35 | 0,05 | 150 | 1 | force | 1 | 0,6 |
| Batte de baseball | 11–17 | 620 | 9 | 1 | 1,8 | 0,35 | 0,08 | 45 | 1 | force | 1 | 1,1 |
| Batte cloutée | 14–21 | 660 | 10 | 1 | 1,8 | 0,35 | 0,14 | 38 | 1 | force | 1 | 1,4 |
| Tuyau d'acier | 10–16 | 640 | 9 | 1 | 1,8 | 0,35 | 0,06 | 90 | 2 | force | 1 | 1,6 |
| Pied-de-biche | 11–17 | 600 | 9 | 1 | 1,9 | 0,4 | 0,1 | 120 | 1 | force | 1 | 2,2 |
| Pelle | 10–16 | 720 | 11 | 2 | 1,8 | 0,4 | 0,06 | 80 | 2 | force | 2 | 2 |
| Hache de pompier | 18–27 | 880 | 14 | 1 | 2,2 | 0,55 | 0,12 | 70 | 1 | force | 2 | 3,2 |
| Masse de fortune | 16–25 | 1000 | 16 | 1 | 2,3 | 0,7 | 0,08 | 55 | 2 | force | 2 | 3,4 |

| Arme de tir | Munition | Capacité | Précision | Recharge ms | Portée | Crosse | Dégâts | Crit | Bruit |
|---|---|---|---|---|---|---|---|---|---|
| Pistolet 9 mm | munitions_9mm | 15 | 0,75 | 1600 | 2 | 4–8 | 22–34 | 0,2 | 3 (25 cases) |
| Fusil de chasse | cartouches | 2 | 0,88 | 2600 | 1 | 6–11 | 38–56 | 0,25 | 3 |
| Fusil d'assaut | munitions_556 | 25 | 0,82 | 2200 | 2 | 6–10 | 26–36 | 0,2 | 3 |
| Arbalète de fortune | carreau_fortune (récupéré à 60 %) | 1 | 0,7 | 3200 | 2 | 3–6 | 22–32 | 0,25 | **0** |

**Familles** : les **lames** (Dextérité) sont rapides, critiques et s'usent vite. Les **contondants** (Force) font
vaciller et durent. Les **armes lourdes à deux mains** tuent en un coup chargé mais coûtent 35-40 sta. Les **armes de
tir** règlent tout et appellent la horde. Le pied-de-biche (120 de durabilité, `forcer`) reste l'arme honnête de la fin
du monde ; la hache de pompier en est le luxe.

> **Note (refonte)** : les §4.4 à 4.11 décrivent l'ancien écran de combat (esquive, garde, fuite, renforts de file) et sont
> gardés comme référence. Ce qui reste vrai : endurance (coups jamais refusés, essoufflé ×0,6), empoignade, toucher et dégâts,
> blessures par zone. Les nombres actifs sont dans `REGLAGES.combat`.

### 4.4 L'endurance (`combat.ENDURANCE`, par seconde réelle)

| Action | Coût | | Action | Coût |
|---|---|---|---|---|
| Coup rapide | `sta` de l'arme (4 à 16) | | Esquive | 10 (parfaite : rend 6) |
| Coup chargé | sta × (1 + 1,5 × charge) → ×2,5 à fond | | Garde | 2/s + 1 par point de dégât bloqué |
| Poussée | 12 | | Martèlement (empoignade) | 1,5 par appui |
| Tir | 3 (visée comprise) | | Lancer | 8 |
| Fuite | 20 (à la réussite) | | Changer d'arme | 0 (600 ms) |

**Récupération** : **+14/s** après 0,7 s sans geste, **+4/s** entre deux coups, 0 en garde ou en charge. Surpoids : coûts ×(1 + 0,5 f).
**Essoufflé(e)** (< 15) : les coups **partent quand même**, ×0,6 dégâts, gestes ×1,5 plus lents. **À bout de souffle** (< 10) :
l'esquive est grisée. Le bouton affiche le mot, et c'est le seul geste refusé.

Cadence : à la batte (9 sta en 0,62 s), on frappe **≈ 9 s en continu** avant l'essoufflement ; au couteau ≈ 12 s ;
à la masse ≈ 6 s. Un souffle de 3 s rend ≈ 32 sta. **Le combat a un rythme** : frapper, souffler, lire la télégraphie.

### 4.5 L'empoignade (`combat.EMPOIGNADE`)

Le mort t'agrippe : un **anneau de 2,4 s** (+300 ms au doigt) se referme. **Marteler** Frapper ou Pousser :
`taps = max(3, saisieForce − floor(Force/2) − (Mains nues ≥ 3 ? 1 : 0))`, garde levée : −2 taps et anneau ×1,5.
Errant : 7 taps en 2,4 s = 3 appuis/s, facile. Colosse : 12 taps = 5/s, dur mais faisable. À 0 sta, un appui compte pour moitié.
**Dégagé(e)** : le mort tombe (**à terre** 1,8 s : jauge figée, tes coups ×1,5, +25 % de critique, toucher garanti ; à mains
nues on le piétine ×2). **Raté** : **morsure** (dégâts max ×1,2, plaie « morsure » à la zone de l'attaque `morsure`).
**Règle d'or, affichée au premier combat : un mort ne te mord que s'il te tient.**

### 4.6 Toucher et dégâts

```
P(toucher) = clamp(0,88 + 0,03 × niv(compétence de l'arme) − esquive du mort
                   − 0,10 [essoufflé] − 0,08 [épuisé : fatigue < 15] − 0,15 [noir sans lampe]
                   − 0,05/0,10 [douleur > 60 / > 80] − 0,10 × f [surpoids] , 0,50 , 0,98)
             = 1 (garanti) si : contre, mort à terre, mort qui vacille, attaque furtive.

Dégâts = jet(dmg) × (1 + (charge_arme − 1) × c)             c = charge 0..1
         × (1 + 0,06 × niv)                                  compétence de l'arme (+30 % au niveau 5)
         × (critique ? 2 : 1)                                P(crit) = crit_arme + 0,02 × Dextérité + 0,15 × c (+0,25 contre, +0,2 vacille, +0,25 à terre) × critMult du mort
         × (contre ? 1,6) × (à terre ? 1,5) × (furtif ? 3) × (flanc co-op ? 1,25)
         × (essoufflé ? 0,6) × (affamé ? 0,85) × (arme < 20 % de durabilité ? 0,8)
         × (non critique : 1 − armure du mort ; tir : 1 − armure/2)
         mains nues : + niv(Mains nues) au jet.

Vaciller : P = stagger_arme × (c ≥ 0,9 ? 1 : coup rapide ? 0,3 : c) × (1 − résistance) (+0,2 en flanc co-op)
           → jauge figée 1 s, télégraphie annulée, +20 % de critique.
Usure : −1 durabilité par coup qui porte, −2 pour un coup lourd (≥ 90 %) ; Entretien : 10 %/niv de ne rien user.
Tir : P = précision_arme × (0,6 + 0,4 × visée) + 0,04 × Visée − esquive ; visée 0 → 1 en 1,2 s (−80 ms/niv) ;
      critique = crit + 0,25 × visée ; recharge −6 %/niv de Visée.
```

### 4.7 Le bruit appelle la horde (`combat.RENFORTS`)

Chaque coup de feu : 35 % × (0,5 + danger du lieu) qu'un mort du pool rejoigne la file **4 à 8 s plus tard**. Un combat
**bruyant** (arme de bruit ≥ 2) qui dure plus de 30 s : un renfort possible (25 %) toutes les 15 s. **Jamais plus de 4
renforts par combat.** En exploration, le coup de feu fait en plus un bruit de 25 cases : les morts du niveau accourent.

### 4.8 Blessures reçues, protection par zone

Une ruée qui porte touche **une zone du corps** tirée dans `attaque.zones` (16 zones, `ZONES_CORPS`). Chaque vêtement
**couvre** des zones (`couvre`) avec sa `protection` :

- dégâts **−2 par point** de protection de la zone (minimum 1) ;
- **griffure** : protection ≥ 2 → simple contusion ; 1 → une entaille devient égratignure ;
- **morsure** : 30 % × protection que les dents ne passent pas (p3 = 90 %, p4 = 100 %) → contusion.

Type de plaie (`combat.BLESSURES`) :

| Attaque | Jet normal | Jet dans le tiers haut | Au max (si blessureMax ≥ 3) |
|---|---|---|---|
| griffure | égratignure | entaille | blessure profonde |
| coup | contusion | contusion | **fracture** si le mort a `fracture` (colosse 35 %) |
| morsure (humaine, empoignade ratée) | morsure | morsure | morsure |
| morsure animale (chien, fauve) | entaille | morsure | morsure |

Un **coup bloqué** ne fait **jamais** de plaie. Exemple : un rampant mord la cheville, des bottes en cuir (p2) donnent
60 % de chances que les dents ne passent pas, et un jean à jambières (p2) protège aussi le mollet.

### 4.9 Combats types (simulés, compétence 0, solo)

| Contre | Mains nues | Couteau de cuisine | Batte | Machette | Hache (coup chargé) |
|---|---|---|---|---|---|
| Errant (30 PV) | 7,8 coups · 3,0 s | **3,9 · 1,6 s** | 2,9 · 1,8 s | 2,3 · 1,3 s | 1 coup (1,3 s de charge) |
| Coureur (26, esquive 15 %) | 8,2 · 3,1 s | 4,0 · 1,6 s | 2,9 · 1,8 s | 2,6 · 1,4 s | 1 |
| Enragé (44) | 11,7 · 4,4 s | 5,7 · 2,3 s | 4,2 · 2,6 s | 3,3 · 1,9 s | 1 |
| Colosse (95, armure) | 28 · 11 s | 13 · 5,2 s | 9,3 · 5,7 s | 7,3 · 4,1 s | 2 |
| Soldat (55, armure 35 %) | 22 · 8,5 s | 10,6 · 4,2 s | 7,4 · 4,6 s | 6,1 · 3,4 s | 1-2 |

Et en face, les ruées qu'il faut encaisser **sans aucune défense** pour tomber de 100 à 0 PV : errant 12,5
(25 avec une protection de 2), coureur 10,5, enragé 7, soldat 8, colosse 4,3.
**Un errant seul ne tue plus personne. Trois errants dans le noir, avec 20 d'endurance, oui.**

### 4.10 Fuir (`combat.FUITE`)

Maintenir **1,5 s** (interrompu si on encaisse). `P = 0,55 + 0,06 × Agilité − 0,08 × (morts en file − 1) + 0,3 × (sta/staMax − 0,5)
− 0,2 [jambe blessée] − 0,2 × f [surpoids] + 0,3 [mort actif à terre / qui vacille]`, bornée 10-95 %. Coût 20 sta.
Réussite en exploration : les morts sont repoussés de 4 cases et étourdis 3 s, tu as 2 s d'avance (fermer une porte !).
En voyage : la rencontre est laissée derrière. **Échec** : il enchaîne aussitôt une ruée à demi-télégraphie.

### 4.11 Ce que l'écran doit montrer (lisibilité)

Chiffres de dégâts, « Critique », « Vacille », « Esquivé » (et **par quoi** : « il se dérobe », « trop essoufflé(e) »,
« dans le noir »), contour rouge / **ambre** de télégraphie, anneau d'empoignade avec le nombre d'appuis restants,
repère du coût du prochain blocage sur la barre d'endurance, file numérotée de la horde, jauge de cri du hurleur,
icône d'arme usée (< 20 %). Au premier combat : trois conseils, pas plus (esquive rouge / martèle ambre / souffle).

---

## 5. Survie

### 5.1 Besoins (`survie`, par minute de jeu ; jauges 100 = bien)

| Jauge | Baisse | Vide en | Gêne (effet) | Grave (effet) | À zéro |
|---|---|---|---|---|---|
| Faim | 0,035/min | 48 h | < 40 : récup. sta ×0,85 | < 15 : staMax −15, dégâts ×0,85 | −0,04 PV/min |
| Soif | 0,05/min | 33 h | < 50 : récup. sta ×0,85 | < 20 : staMax −20, vue ×0,85 | −0,1 PV/min (≈ 17 h) |
| Fatigue | 0,055/min | 30 h | < 35 : staMax −15, esquive parfaite ×0,85 | < 15 : staMax −30, vitesse ×0,9, toucher −8 % | évanouissement 2 h sur place |

Activité : course et voyage rapide ×2 et ×1,8 (soif, fatigue), combat ×1,5, repos ×0,6, sommeil ×0,5.
**PV** : +0,02/min éveillé (≈ 29/jour), +0,07/min en dormant (≈ 34 par nuit), si faim et soif ≥ 40 et aucune plaie qui
saigne ou infectée. **Endurance hors combat** : +10/s immobile, +6/s en marchant.

Repères de nourriture : conserve 30-32, pâtes cuites 30 (un paquet → 2 gamelles), ragoût 55, ration militaire 50,
barre 10. **Eau** : bouteille 40 (0,5 L), 1 L d'eau propre = 80. Un jour = ≈ 50 de faim et 0,9 L d'eau.

### 5.2 Blessures et soins (`survie.BLESSURES`, `SOINS`)

| Plaie | Saignement PV/min | Saigne à la création | Arrêt spontané | Douleur | Infection /h (non soignée) | Guérison |
|---|---|---|---|---|---|---|
| Égratignure | 0,01 | 30 % | 4/h (≈ 15 min) | 4 | 0,6 % | 12 h |
| Contusion | — | — | — | 8 | — | 18 h |
| Entaille | 0,05 | 80 % | 30 %/h | 12 | 2 % | 36 h |
| Blessure profonde | **0,15** | 100 % | non | 25 | 4 % | 72 h, **suture requise** (sinon se rouvre 5 %/h, guérison ×2) |
| Morsure | 0,08 | 100 % | 10 %/h | 22 | 5 % | 72 h, **pas de suture** |
| Fracture | — | — | — | 40 | — | 7 jours, **attelle** (sans : douleur +20, jambe vitesse ×0,7, bras dégâts ×0,6) |
| Brûlure | — | — | — | 30 | 3 % | 48 h (onguent ×1,5) |

Bandée : guérison ×0,75. Soins (minutes de jeu, −10 %/niv de Médecine) : bander 3 · laver 5 · désinfecter 2 ·
suturer 15 (−4 PV, douleur +15) · attelle 10 · cautériser 5. Une plaie **profonde non bandée** fait perdre 9 PV/h :
elle tue en une demi-journée, et c'est **la** raison de porter un bandage à la ceinture.

### 5.3 L'infection bactérienne : la plaie sale, lente et soignable

Chance par heure = `infH` de la plaie × multiplicateurs : lavée au savon ×0,5 · désinfection **active** ×0,05
(désinfectant 4 h, lingette 2 h 30, alcool fort 2 h avec 80 % de réussite, antibiotiques 12 h), puis ×0,3 à vie ·
bandage propre ×0,6, sale ×1,5, **pansement au miel ×0,3** · plaie **souillée** (putréfié, gonflé) ×2,5 · animale ×2.
**Infectée** : −0,008 PV/min (≈ −11/jour), douleur +15, 10 %/h de fièvre. Elle recule de 20 %/h sous désinfection
active, de 3 %/h si elle a été lavée. **Antibiotiques** : toutes les infections guéries 3 h après la prise.
→ Une égratignure oubliée ne tue pas : **au pire, elle coûte quelques jours de PV**.

### 5.4 Le mal : la contamination par les morts (`survie.CONTAMINATION`)

**Alignement avec le prologue du scénariste** : le personnage a déjà été mordu, est mort, a marché avec eux, puis
« quelque chose, dans ton sang, a lâché prise ». Le mal n'est donc **pas un tirage caché** (condamné ou non). C'est une
**jauge visible de 0 à 100** qui se charge à chaque plaie souillée par un mort et se vide lentement. **À 100, c'est la
rechute** : on redevient l'un d'eux.

`points = POINTS[type de plaie] × infection du mort × difficulté.contamination`

| Plaie | POINTS | Errant (0,85) | Putréfié (0,95) | Chien (0,08) |
|---|---|---|---|---|
| Égratignure | 3 | +2,6 | +2,9 | — |
| Entaille | 6 | +5 | +5,7 | +0,5 |
| Profonde | 10 | +8,5 | +9,5 | — |
| **Morsure** | **70** | **+60** | **+66** | +5,6 |

- **Le réflexe qui sauve** : une griffure **désinfectée dans les 10 minutes** perd ses points. **Cautériser** une morsure
  dans les 15 minutes (lame + flamme, 5 min) divise ses points par 2, au prix d'une brûlure, de 8 PV et de 50 de douleur.
- **Déclin** : −0,006/min éveillé(e) (≈ −9/jour), −0,012/min en dormant (≈ −6 par nuit de 8 h). Vitamines ou tisane : ×1,25 pendant 12 h.
- **Seuils** : ≥ 30 veines noires, staMax −10, **faim ×1,25** · ≥ 50 **fièvre noire** : staMax −20, soif ×1,5, toucher −5 %,
  plus de régénération de PV · ≥ 75 **délire** : vue voilée, **fausses ondes d'ouïe**, −0,02 PV/min · **100 rechute** :
  fin de partie en solo ; en co-op, le joueur se relève et son partenaire doit l'affronter.
- **Lecture** : une égratignure pèse 3 points, rien. **Une morsure (60) se surmonte**, en ≈ 4 jours de déclin avec la
  fièvre noire pour compagne. **Une deuxième morsure avant ≈ 2 jours, c'est la rechute.** Des griffures multiples
  jamais désinfectées finissent par peser. Les antibiotiques n'y font **rien** (c'est dit dans leur description).
- Effet de scène `infection: true` = +35 points. Si l'histoire introduit un traitement, elle pose `remede_mal`
  (ou appelle `reduireMal(n)` côté survie).

### 5.5 Maladies

| Maladie | Cause | Effet | Durée / fin |
|---|---|---|---|
| **Intoxication** | viande crue 55 %, poisson cru 40 %, eau croupie 40 % | −0,02 PV/min, soif −0,05/min, **vomit** (bruit 3) toutes les 60-180 s | 3 à 7 h ; charbon actif : fin en 30 min |
| **Fièvre** | une plaie infectée (10 %/h) | soif ×1,5, fatigue ×1,3, toucher −5 %, −0,01 PV/min | 4 h après la dernière infection ; tisane : levée en 1 h |
| **Rhume** | froid : 1,5 %/h par point de déficit | staMax −10, **toux** (bruit 5) toutes les 40-120 s réelles | 24-48 h (tisane ×0,5) |

### 5.6 Froid, douleur, sommeil

- **Froid** : chaleur requise = dehors 2 le jour, 4 la nuit ; dedans 0 et 2 ; saison **fin d'été −1** (défaut, le prologue
  se passe fin septembre), hiver +2 ; mistral +2, pluie +1, mouillé(e) +1 ; feu ou réchaud à ≤ 3 cases −4.
  En t-shirt et jean (chaleur 1), on a un déficit de 2 la nuit dehors : on grelotte (fatigue, rhume), on n'en meurt
  pas. Un pull ou un sweat règle la question. **Déficit ≥ 3 : −0,015 PV/min par point au-delà de 2.**
- **Douleur** (somme des plaies, moins les calmants) : > 30 toucher −3 %, > 60 −5 % et récup. sta ×0,75, > 80 −10 %
  et vue tremblée. Antidouleurs −40 pendant 4 h ; alcool −15 pendant 1 h (toucher −5 %).
- **Sommeil** : possible si fatigue < 80 ; 2 à 10 h ; +0,22 fatigue/min (8 h ≈ +105). Lieu **non sûr** avec des morts
  vivants dans le niveau : intrusion à (4 % + 10 % × danger) par heure. Un **piège sonore** te réveille avant (combat
  « normal » au lieu de « surpris »). Pièce barricadée ou refuge : aucun risque.

---

## 6. La fabrication, repensée

### 6.1 Pourquoi fabriquer

Le butin couvre **les besoins**. La fabrication couvre **les manques** : ce qu'on ne trouve pas, ou pas assez, ou pas
comme ça.

1. **Réparer, c'est garder son arme préférée.** Les armes s'usent (1 durabilité par coup qui porte). Scotch +30 %
   (bois), ligature au fil de fer +50 % (bois ou métal, à l'établi), pierre à aiguiser +40 % (lames), kit de nettoyage
   +50 % (armes à feu). Chaque réparation baisse la durabilité max de 10 % (jamais sous 50 %) : on retarde la casse,
   on ne l'évite pas.
2. **L'eau propre et les vrais repas passent par le feu.** Les pâtes sèches et l'eau croupie abondent ; cuites et
   bouillies, elles valent deux repas et une bouteille propre. Le feu fait de la lumière et du bruit.
3. **Des pièces introuvables** : lance (allonge 2, contre les gonflés), arbalète **silencieuse** et munitions ramassées,
   brassards de magazines (protection 2 aux avant-bras pour 4 journaux), jambières contre les rampants, frontale de
   fortune (mains libres), lampe à huile (sans piles, jamais), réveil piégé (leurre).
4. **Un savoir qui se découvre** : 23 recettes sont connues au départ et 37 **s'apprennent**, dans les **livres** trouvés
   (médiathèque, bricolage, pharmacie, Maison de Nostradamus…) ou en montant un niveau. Un livre lu apprend 3 à 8 recettes
   d'un coup et donne 10-30 XP. **Trouver le Traité des confitures de Nostradamus** donne 5 recettes d'herboristerie.
5. **La qualité suit la compétence** : durabilité du résultat × (0,8 + 0,1 × (niveau − niveau requis)), max ×1,2.
   Une lance fabriquée au niveau 4 dure 20 % de plus qu'au niveau requis.

### 6.2 Règles

- **Postes** : à la main (partout) · **établi** (à ≤ 1,5 case d'une table, d'un bureau ou d'une machine ; un vrai établi,
  marqueur `etabli`, donne un temps ×0,7) · **feu** (feu de camp allumé, réchaud avec gaz dans le sac, cheminée).
- **Outils = tags** (`usage` des objets) : `cuisson` (casserole, réchaud), `couper` (couteaux, machette, hache, éclat
  de verre), `marteler` (marteau, masse, trousse), `visser` (tournevis, clé, trousse), `affuter` (pierre, trousse),
  `coudre` (trousse de couture), `allumer` (briquet, allumettes, torche), `filtrer`, `entretien_arme`.
- **Temps** : la barre dure `tempsMin` × 1 s ÷ 6 (30 min → 5 s), et l'horloge tourne ×6 en solo pendant ce temps.
  En co-op, l'horloge ne change pas : les besoins de celui qui fabrique sont débités du temps complet.
  **Rien n'est consommé avant la fin** : interrompre ne coûte rien. Marteler fait du bruit (4 cases/s).
- **Catégories** (60 recettes) : soins 8 · armes 12 · réparation 4 · cuisine & eau 12 · lumière 4 · survie 8 · recyclage 2 · équipement 10.
- Recettes **spéciales** : `reparer` (choisir l'arme cible), `feu_camp` (pose un feu 2 h), `barricade` (porte la plus proche).

### 6.3 Livres et ce qu'ils apprennent

| Livre | Où | XP | Apprend |
|---|---|---|---|
| Manuel du bricoleur | bricolage, médiathèque, bureaux | Construction 30 | lance renforcée, masse, ligature, frontale, gants et veste renforcés, ceinture renforcée |
| Guide de survie | médiathèque, lycée, grottes | Chasse 15, Construction 10 | bandages bouillis, couteau de lancer, réveil piégé, lampe à huile, frontale, collet, canne, filtre |
| Précis de secourisme | pharmacie, caserne, hôpital | Médecine 30 | bandages bouillis, pansement au miel, kits de suture, filtre |
| Carnet d'un chasseur | villages, médiathèque | Chasse 30 | viande et poisson fumés, collet, canne, nasse |
| Revue technique | bureaux, usine | Mécanique 30 | réveil piégé, piles récupérées, crochets |
| La Cuisinière provençale | médiathèque, lycée | Chasse 20 | ragoût, bouillabaisse du pauvre, tapenade, lampe à huile |
| Traité des confitures (Nostradamus) | Maison de Nostradamus, Empéri | Médecine 15, Chasse 10 | tisane, onguent, pansement au miel, confiture |
| Plans griffonnés | caves, grottes, campements | Construction 10 | arbalète, carreaux |

---

## 7. Compétences et progression (`competences`)

Onze compétences, niveaux 0 à 5, paliers d'XP `[0, 40, 110, 220, 380, 600]`. Au départ : Force, Dextérité et
Agilité à 20 XP (le niveau 1 est proche).

| Compétence | Effet par niveau | Se gagne en… |
|---|---|---|
| Force | armes `force` +6 % dégâts ; −1 martèlement / 2 niv ; mise à terre +5 % ; forcer −10 % ; +2 kg | frapper (contondant), bloquer, se dégager, forcer |
| Dextérité | armes `dexterite` +6 % ; **+2 % critique toutes armes** | frapper (lames, lances) |
| Agilité | **fenêtre d'esquive parfaite +25 ms** ; fuite +6 % ; accroupi +5 % | esquiver (3, parfaite 5), fuir (6) |
| Mains nues | +1 dégât et +6 % ; niv 3 : −1 martèlement | frapper sans arme |
| Visée | visée −80 ms ; précision +4 % ; recharge −6 % | tirer (3 par tir qui touche) |
| Discrétion | bruits −10 % ; vue des morts −6 % | 5 s accroupi près d'un mort qui ne t'a pas vu (1), attaque furtive (6) |
| Médecine | soins −10 % de temps, +10 % d'effet ; suture −20 % de douleur | chaque soin (4), suture (10), cautériser (8) |
| Construction | recettes ; qualité des objets | fabriquer, barricader (10), démonter (2) |
| Mécanique | crocheter −12 % ; recettes | crocheter (8), recettes |
| Entretien | 10 %/niv de ne pas user l'arme ; réparations +8 % | réparer, aiguiser |
| Chasse & cuisine | dépeçage +20 % ; pêche +10 % | cuisiner, pêcher, poser des collets |

Rythme visé : **niveau 1 en une journée** dans les compétences qu'on utilise, **niveau 3 vers le jour 5-6**, niveau 5
seulement si on se spécialise. Chaque niveau se sent (une arme +6 %, une fenêtre d'esquive +25 ms) sans rendre le jeu
facile.

---

## 8. Inventaire : poids, VOLUME, mains et dos (`inventaire`) — façon Project Zomboid

- **Volume (litres)** : chaque objet a un `volume` (planche 14 L, pelle 15 L, batte 6 L, conserve 0,8 L, couteau 0,4 L ;
  à défaut, selon l'ancien `espace` : 0,2 / 0,8 / 4 / 8 L). Les **poches** (1,5 L + jean 1 L, cargo 2 L, gilet 3 L) ne prennent
  que les **petits objets** (≤ 1 L). Le **sac** a une `contenance` : cabas 12 L, écolier 20 L, randonnée 45 L, militaire 55 L,
  expédition 70 L. **Une planche remplit 70 % d'un sac d'écolier.**
- **Mains** : main droite, main gauche, ou **les deux**. Tout objet peut se tenir (une planche dans chaque main). Une arme à
  `deux_mains` (pelle, hache, masse, lance, fusils) tenue d'**une seule main** : dégâts ×0,6, gestes ×1,35 plus lents, pas de coup
  chargé. Une lampe torche / à huile se tient dans la main gauche. Certains objets servent d'arme improvisée (`melee` : planche,
  manche à balai, casserole).
- **Dos** : un gros objet sanglé (objets `long` ou ≥ 3 L) : il ne prend pas de place au sac et **ne pèse que 75 %**. X = échanger
  les mains, B = passer l'objet de la main au dos et inversement.
- **Poids** : max = 10 kg + 2 kg/niv de Force + `portage` (sacs 2 à 12 kg). Entre le max et 1,5 × max : **surpoids** f = 0..1 :
  vitesse ×(1 − 0,3 f), coûts d'endurance ×(1 + 0,5 f), fatigue ×(1 + f), toucher −0,1 f. Au-delà de 1,5 × max : on ne bouge plus.
- **Accès rapide** (ceinture, holster, gilet) : touches 1-4 pour prendre en main une arme accrochée.
- L'**eau** pèse : 1 L = 1 kg, sur l'instance du contenant (`eau: { q, L }`).

## 9. L'économie du butin (`butin.js`)

**Tirage** : `tirerButin(typeLieu, catégorie, rng, { taille, danger, jour, coop, sansLumiere, mult })`, déterministe sur
la graine. `passes = min(3, ceil(1 + 0,5 × (taille − 1)))` ; pour chaque passe, chaque ligne sort avec `p × M`
(plafonnée à 95 %) : `M = (0,85 + 0,5 × danger) × lieu.abondance × difficulté.butin × (co-op 1,3) × (à tâtons 0,75)`.
Les lignes **de base** (nourriture, boissons, bandages) sont en plus multipliées par la courbe du jour (×1,2 au jour 1,
×0,85 au jour 12), et le **frigo** pourrit (×0,6 à partir du jour 3, ×0,3 à partir du jour 6).

Rendement mesuré (danger 0,35, jour 3, meuble d'une case) : cuisine ≈ 1,9 objet (12 % vides) · armoire 1,4 · étagère 1,0 ·
bureau 1,3 · salle de bain 1,0 · voiture 1,2 · poubelle 1,5 (des déchets utiles) · lit 0,7 · table 0,65 · frigo 0,5
(58 % vides) · caisse 0,5 · canapé 0,4. Rayonnage de supérette de 4 cases ≈ 6 objets.

**Rareté par zone** : chaque type de lieu remplace les tables par défaut de ses meubles. **On va à la pharmacie pour
soigner, au Weldom pour construire, à la caserne pour une hache, au commissariat pour un 9 mm, à la BA 701 pour tout, si on en revient.**
`abondance` baisse le butin des lieux pillés pendant la panique (supermarchés 0,65-0,75, pharmacie 0,75, commissariat
0,8) et le monte là où personne n'a osé aller (BA 701 1,2, grottes, La Barben, aérodrome 1,1).

| Rareté | Exemples | Où |
|---|---|---|
| Courant | conserves, pâtes, chiffons, journaux, canettes, scotch | partout |
| Recherché | piles, bandages, désinfectant, eau propre, briquet, planches, clous | bureaux, salles de bain, bricolage, comptoirs |
| Rare | antibiotiques, kit de suture, lampe frontale, sac de randonnée, hache, machette, livres | pharmacie, hôpital, caserne, médiathèque, hypermarché |
| Très rare | pistolet 9 mm (≈ 1 par commissariat), fusil de chasse (≈ 1 % par remise de village), gilet tactique, casque militaire | commissariat, gendarmerie, BA 701, villages |
| Unique ou presque | fusil d'assaut (1-2 % à la BA 701, 3 % sur un soldat), sabre de cavalerie (Empéri), Traité des confitures | lieux désignés |

**Ce qui manque toujours un peu**, et c'est voulu : l'**eau propre** (il faut du feu ou un filtre), les **piles** (la
lumière), les **antibiotiques**, les **munitions**, et une **arme en bon état**. La nourriture n'est pas rare, elle est
**lourde** : c'est le sac qui décide combien on en emporte.

---

## 10. La courbe de difficulté (`courbe.JOURS`, `zombies.jourMin`)

| Jour | Morts des lieux | Rencontres | Danger des zones | Butin « de base » | Nouveaux types au hasard |
|---|---|---|---|---|---|
| 1 | ×0,7 | ×0,6 | +0 | ×1,2 | errant, rampant, putréfié (sanglier dehors) |
| 2 | ×0,9 | ×0,85 | +0 | ×1,05 | + coureur, hurleur, gonflé, chien |
| 3-4 | ×1 | ×1 | +0,05 | ×1 | + colosse, soldat, lionne |
| 5-7 | ×1,15 | ×1,15 | +0,1 | ×0,95 | + enragé (dès le jour 4) |
| 8-11 | ×1,3 | ×1,3 | +0,15 | ×0,9 | — |
| 12+ | ×1,45 | ×1,4 | +0,2 | ×0,85 | — |

**Jour 1, on apprend** : des morts lents dans des lieux calmes (hôtel 0,2, Nostradamus 0,2), un butin généreux, des
trajets à 1-2 crans. **Jours 2 à 4, la ville s'ouvre** : coureurs et hurleurs, la gare, l'hôpital, les Canourgues.
**Ensuite, la région durcit** : enragés, colosses, soldats, et des trajets à 4-5 crans. Les **pools des lieux**
ignorent `jourMin` : la BA 701 est mortelle dès le jour 1, **c'est au joueur de ne pas y aller**, et la carte le dit.

---

## 11. La co-op (`coop`)

| Aspect | Solo | À deux | Pourquoi |
|---|---|---|---|
| Morts procéduraux d'un lieu | ×1 | **×1,5** | deux fronts, deux lampes, deux fois plus de bruit |
| Rencontres de voyage (ensemble) | ×1 | **×1,3**, +1 mort (50 %) par combat | on se fait remarquer |
| Butin des meubles (partagé) | ×1 | **×1,3** au total, soit ≈ 0,65 par tête | « pas deux fois plus de butin » : on explore plus vite, pas plus riche |
| Repeuplement | ×1 | ×1,3 | |
| Fouille du même meuble | — | ×1,6 plus vite | |
| Combat | 1 mort actif | **1 mort actif par joueur** ; frapper celui de l'autre : **flanc** ×1,25 dégâts, +20 % de vacillement (ton propre mort continue de charger) | aider coûte quelque chose |
| 0 PV | mort | **« À terre » 30 s**, rampant ; le partenaire te relève en maintenant 3 s → 20 PV. Deuxième « à terre » en moins de 10 min de jeu : mort | la co-op doit pardonner une erreur, pas deux |
| Rechute (mal à 100) | fin de partie | tu te relèves, ton partenaire doit t'affronter | un moment qu'on n'oublie pas |
| Sommeil | accéléré | accéléré seulement si les deux dorment ; sinon repos lent (+0,08 fatigue/min) | le temps est commun |
| Fabrication | horloge ×6 | horloge ×1 ; les besoins du fabricant sont débités du temps complet | |

---

## 12. Les boutons de difficulté (`difficulte.PRESETS`)

| Bouton | Récit | **Survie** (référence) | Cauchemar |
|---|---|---|---|
| Dégâts des morts | ×0,7 | ×1 | ×1,25 |
| PV des morts | ×0,85 | ×1 | ×1,15 |
| Menace (durée : + = plus lent) | ×1,25 | ×1 | ×0,85 |
| Télégraphie (durée) | ×1,3 | ×1 | ×0,85 (jamais < 450 ms) |
| Fenêtre d'esquive parfaite | ×1,4 | ×1 | ×0,8 |
| Rencontres | ×0,7 | ×1 | ×1,3 |
| Morts des lieux | ×0,8 | ×1 | ×1,3 |
| Butin | ×1,3 | ×1 | ×0,8 |
| Besoins (faim, soif, fatigue) | ×0,75 | ×1 | ×1,2 |
| Infection bactérienne | ×0,5 | ×1 | ×1,3 |
| Mal (points) | ×0,5 | ×1 | ×1 |
| Repeuplement | ×0,5 | ×1 | ×1,5 |
| Mort définitive | non | non | **oui** |

Tous les nombres de `reglages.js` restent réglables à la main. Les préréglages ne font que multiplier.

---

## 13. Ce que les moteurs doivent implémenter (non évident)

**Exploration (`js/explore/`)**
- Repérage **progressif** (« ? » qui se remplit, 350 ms → 2,2 s), pas instantané ; lampe = on est vu(e) de loin.
- Bruit = cercle, **atténué par les murs** (×0,4) et les portes (×0,6) ; bruit de pas × sol × Discrétion × chaussures (`bruitPas`).
- **Lancer** tout objet à champ `jet` (leurre sonore / lumineux à l'impact) ; réveil piégé : délai 3 s puis bruit 10 s.
- Fouille : révélation **progressive**, bruit **par seconde**, interruption sans perte ; `tirerButin` sur la graine du meuble.
- Attaque **furtive** (×3, mise à mort silencieuse si elle tue) ; menace de départ selon engagé / face / surpris.
- Points d'eau (`EAU`), démontage (`DEMONTER`), barricade, crochetage, pêche et collets, repeuplement plafonné.
- Rampant `visibleA: 3` ; colosse **charge** et enfonce les portes ; hurleur crie à 30 cases quand il te repère ;
  gonflé explose à 1,5 case.

**Voyage (`js/travel/`)**
- Tronçons de 50/250 m, danger = **max** des zones de même échelle, formule §3.2, Poisson sur la graine, plafond,
  espacement, fenêtre 12-92 %.
- Jauge de risque = espérance des **hostiles** (types `combat` + rencontres `hostile: true`), seuils `RISQUE_CRANS`, deux raisons.
- Allure rapide : 25 % des hostiles tirés deviennent de l'ambiance. Jumelles : révéler la première hostile, détour.
- Effets `detour`, `demiTour`, `butin`, `combat.surprise` ; rencontres `unique` → drapeau `rencontre_vue:<id>`.
- Co-op : +1 mort du pool de la zone (50 %) sur les combats.

**Combat (`js/combat/`)**
- **Jamais refuser un coup** faute d'endurance (essoufflé ×0,6 / ×1,5) ; seule l'esquive est grisée sous 10.
- Type de ruée tiré **au début** de la télégraphie et **affiché** (rouge / ambre). Télégraphie ≥ 450 ms.
- Esquive = toute la télégraphie ; parfaite = 250 ms finales (+25/niv d'Agilité, +60 ms au doigt) → contre 1 s.
- Garde : montée 150 ms, pas de minuterie d'effondrement ; brisée **seulement** à 0 sta (repère du coût du prochain blocage) ; `perceGarde`.
- Coup chargé ≥ 50 % pendant la télégraphie = **interruption** (sauf résistance ≥ 0,75). Temps de charge = vitesse × 1,5.
- Poussée pendant la télégraphie = annulation (sauf résistant). Empoignade : taps, anneau, garde −2 taps.
- **Morsure humaine uniquement via empoignade ratée** ; morsure animale dès la ruée.
- Zones et protection (`couvre`, −2/point, morsure bloquée 30 %/point) ; types de plaies §4.8.
- Hurleur (jauge de cri), gonflé (explosion si mêlée d'allonge < 2), sanglier (fuite à 30 %), enragé (`enchaine`),
  colosse (`fracture`), soldat (armure, `critMult`).
- Renforts : tir 35 % × (0,5 + danger), combat bruyant long, max 4.
- Résultat : `{ issue, tues, blessures, xp, usure, munitions }` + points de mal (§5.4) calculés au moment de la plaie.

**Interface / survie (`js/game/`, `js/ui/`)**
- La **jauge du mal** est visible dès qu'elle dépasse 0 (icône + valeur au panneau Corps) ; le réflexe « désinfecter
  dans les 10 min » doit être proposé tout de suite après le combat (bouton sur la plaie fraîche, minuteur visible).
- Soins **ciblés** par plaie, suture interdite sur une morsure, attelle sur une fracture, cautériser (lame + flamme).
- Recettes : cachées si non connues (« ??? » dans la catégorie), apprises par livre lu **ou** par niveau (`apprise_niveau`,
  n'importe laquelle des compétences listées) ; tags d'outils ; postes ; rien consommé avant la fin ; qualité ; réparations.
- Livres : 30 min de lecture, lumière nécessaire, XP une seule fois.
- Ceinture = accès rapide ; sans ceinture, rien en combat.

**Dialogue (`js/ui/dialogue.js`, intégrateur)** : `choix.texte` (texte de résultat sans test), `suivant: '#combat'`,
effets `detour`, `demiTour`, `butin`, pourcentage affiché sur les tests (`chanceTest(niv, diff)` dans `reglages.js`).

---

## 14. Pour le scénariste

- **Les ids de morts** pour ses scènes : `errant`, `rampant`, `putrefie`, `coureur`, `hurleur`, `gonfleur`, `chien_infecte`,
  `enrage`, `colosse`, `militaire`, `fauve`, `sanglier`. Ses scènes peuvent imposer un type avant son `jourMin`
  (le prologue utilise un coureur au jour 1 : c'est voulu et accepté).
- **Plaies** utilisables dans `blessure` : `egratignure`, `contusion`, `entaille`, `profonde`, `morsure`, `fracture`, `brulure` ;
  zones : `ZONES_CORPS` de `clothing.js` (16 zones, dont « à la tête » et « au ventre »).
- **Le mal** : `infection: true` = +35 points. Une morsure scénarisée, `blessure: { type: 'morsure', zone }`, ne donne des
  points que si un mort est désigné, sinon aucun (proposition : ajouter `mal: n` aux EFFETS si besoin).
- Les objets de quête de l'ancien jeu (batterie de camion, bidon de gasoil, clé du locotracteur, plan annoté, code de
  l'armurerie, carnet du cheminot) **ont été retirés** de `items.js` : ils appartiennent à `histoire/objets_quete.js`.
  `radio_portable` reste un outil générique (piles) que l'histoire peut utiliser.
- Questions ouvertes : le protagoniste « revenu » a-t-il d'autres particularités de gameplay (morts moins attentifs à
  lui, vision de nuit, « faim » spéciale) ? Si oui, elles se branchent ici : `PERCEPTION.VUE_LUMIERE`,
  `lumiere.VISION_JOUEUR.noir`, `CONTAMINATION.SEUILS.noirceur` (faim ×1,25 déjà liée au mal).
