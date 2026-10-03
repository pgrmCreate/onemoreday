# One More Day — Spécification de la refonte (v3)

> Document de référence **commun à tous les agents** (scénariste, game designer, moteurs,
> interface, cinématiques, niveaux). Si un point n'est pas couvert ici, choisis la solution
> la plus simple et **documente-la** dans ton rendu. Ne casse jamais un contrat décrit ici
> sans le signaler explicitement dans ton rapport final.

---

## 0. Vision en une phrase

Un survival-horror **adulte** (violent, gore, mélancolique) en **français**, dans le vrai
**Salon-de-Provence** et le pays salonais, jouable **PC + Android (PWA paysage)**, seul ou à
deux, articulé en **trois temps** :

| Temps | Quoi | Contrôle | Où dans le code |
|---|---|---|---|
| **1. Exploration** | on est DANS un lieu (hôtel, pharmacie, place…) | **déplacement libre** (joystick / clavier), vue de dessus, lumière & champ de vision façon *Darkwood*, morts en temps réel | `js/explore/` |
| **2. La carte** | on passe d'un lieu à l'autre | **pas de déplacement en direct** : on choisit une destination sur une **carte illustrée** (distance en mètres, durée, risque), puis un écran de **voyage** fait défiler les mètres restants et déclenche des **rencontres** | `js/travel/` |
| ~~3. Le combat~~ | **supprimé comme écran à part** (refonte « combat dans l'exploration ») : on se bat SUR PLACE, en temps réel — se déplacer, frapper (rapide / chargé), pousser, tirer. Voir §7. | | `js/explore/` |

Plus : **cinématiques en parallaxe animée** (`js/cine/`), **scènes narratives à choix**
(`js/ui/dialogue.js`), **interface** inventaire / corps / fabrication / journal refaite (`js/ui/`).

Co-op à deux : **déplacement libre pour chacun, combats partagés**, monde tenu par l'hôte
(**hôte-autoritaire** — fin des désynchros, voir §9).

---

## 1. Principes techniques (non négociables)

- **Web pur** : HTML + CSS + JS **modules ES** natifs, **aucune dépendance, aucun build**
  (le jeu est publié tel quel sur GitHub Pages). Pas de framework, pas de npm côté client.
- **Tout en français** : textes, noms de variables/fonctions métier (comme l'existant), commentaires.
- **Aucun émoji** dans l'interface (icônes SVG de `js/ui/icons.js`).
- **Mobile d'abord, en paysage** (≈ 740×360 CSS px minimum) **et** PC (clavier + souris).
  Tactile : cibles ≥ 44 px. Tester les deux.
- **Hors-ligne** : tout fichier ajouté doit être listé dans `sw.js` (précache) — l'intégrateur s'en charge,
  mais signale tes nouveaux fichiers.
- **Performance** : 60 fps visés sur un Android moyen. Canvas 2D pour l'exploration, SVG pour
  la carte et les cinématiques, DOM pour l'interface. Pas de `innerHTML` à 60 Hz.
- **Déterminisme** : tout tirage qui doit être identique chez les deux joueurs passe par
  `seedRng(G.world.seed + ':' + contexte)` (`js/core/rng.js`).
- **Les nombres qui se règlent vivent dans `js/data/reglages.js`** (commentés avec leur effet).
- **Le contenu vit dans `js/data/**`**, la logique dans les modules. Un contenu mal formé ne doit
  jamais faire planter le jeu : on logue un avertissement et on continue.
- Pas de `localStorage` ailleurs que dans `js/core/state.js` (sauvegarde) et `js/core/prefs.js` (options).

---

## 2. Arborescence cible et propriétaires

```
index.html                    coquille (intégrateur)
css/base.css                  design system : variables, typo, boutons, panneaux (intégrateur)
css/explore.css  css/carte.css  css/combat.css  css/cine.css  css/ui.css   (un par agent)
fonts/                        polices auto-hébergées (OFL)
js/main.js                    démarrage, écran titre, menus (intégrateur)
js/core/                      state.js, bus.js, clock.js, rng.js, util.js, prefs.js, log.js (intégrateur)
js/game/                      flow.js (enchaînement des temps), autorite.js (monde local/hôte/invité),
                              player.js, survival.js, inventory.js, crafting.js, effects.js,
                              conditions.js, quetes.js
js/ui/                        screens.js, hud.js, dialogue.js (scènes à choix), toast.js, icons.js,
                              panels/inventaire.js, panels/corps.js, panels/fabrication.js,
                              panels/journal.js, panels/options.js
js/explore/                   niveau.js (parseur ASCII), sim.js (monde headless), ia.js (morts),
                              vision.js (champ de vision), rendu.js (canvas), entrees.js (joystick/clavier),
                              vue.js (écran d'exploration), tuiles.js (dessin procédural)
js/travel/                    geo.js (projection, distances, itinéraires), carte.js (carte illustrée SVG),
                              voyage.js (écran de voyage + rencontres), art_carte.js
js/combat/                    sim.js (combat headless), vue.js (écran de combat)
js/cine/                      lecteur.js (parallaxe), lib.js (primitives SVG), scenes/*.js
js/net/                       net.js (WebSocket), coop.js (session, routage des messages)
js/audio.js                   moteur audio EXISTANT, conservé (API stable, voir §8)
js/data/                      reglages.js, lieux.js, zombies.js, items.js, clothing.js, recipes.js,
                              butin.js, rencontres.js, niveaux/*.js, histoire/*.js, cinematiques.js,
                              carte_salon.js, carte_region.js
docs/                         REFONTE.md (ce fichier), HISTOIRE.md, GAMEPLAY.md, NIVEAUX.md
```

L'ancien code (`js/map.js`, `js/combat.js`, `js/freemove.js`, `js/zombies_map.js`, `js/world.js`,
`js/scenes.js`, `js/cinema.js`, `js/ui.js`, `js/data/cartes_*.js`, `js/data/events*.js`, `js/data/story*.js`,
`js/art/**`, `editeur.html`…) est **référence en lecture seule** : on y pioche des idées, du texte, des
dessins SVG réutilisables, mais **aucun module neuf n'importe un module ancien**. L'intégrateur
supprimera l'ancien code à la fin.

---

## 3. Contrats du cœur (écrits par l'intégrateur, à utiliser tels quels)

### 3.1 `js/core/state.js`
```js
export let G;                       // la partie en cours (null au titre)
export function nouvellePartie({ nom, mode: 'solo'|'hote'|'invite', seed? }) → G
export function sauver(), charger() → G|null, aSauvegarde(), effacerSauvegarde()
export function getFlag(k) → any ; setFlag(k, v = true)   // émet bus 'flag'
export function noteJournal(texte, type = 'recit')          // émet bus 'journal'
```
Forme de `G` :
```js
G = {
  v: 3, mode, nomPartie,
  world: {                     // PARTAGÉ en co-op (tenu par l'hôte, miroir chez l'invité)
    seed, minutes,             // minutes de jeu écoulées depuis le Jour 1 00:00 (départ : 8h du jour 1 → 480)
    flags: {},                 // drapeaux d'histoire / de monde
    lieux: { [lieuId]: { decouvert, visite, etat /* état du niveau, cf. explore */ } },
    quetes: { [queteId]: { etape, faite } },
  },
  player: {                    // PROPRE à chaque joueur
    nom, pv, pvMax, sta, staMax, faim, soif, fatigue, // jauges 0..100 (100 = bien)
    skillXp: {}, inventaire: [ {id, qty, dur?, eau?} ], equip: { arme, tete, torse, mains, jambes, pieds, sac, ceinture, holster },
    accesRapide: [], blessures: [ {type, zone, gravite, saigne, infecte, bandee, suturee, age} ], maladie,
    position: { mode: 'lieu', lieu, etage, x, y } | { mode: 'voyage', voyage: {...} },
    stats: { morts, joursSurvecus, distance },
  },
  journal: [], documents: [ids lus], carteNotes: {},
}
```
Horloge : `jour = floor(minutes/1440)+1`, `heure = floor(minutes%1440/60)`.

### 3.2 `js/core/bus.js`
`on(evt, fn) → off()`, `once(evt, fn)`, `emit(evt, data)`. Événements standard :
`'minute'` ({delta}), `'flag'` ({k,v}), `'journal'`, `'inventaire'`, `'blessure'`, `'mort'` ({cause}),
`'lieu:entre'` ({lieu}), `'lieu:sort'`, `'combat:debut'`, `'combat:fin'` ({resultat}), `'voyage:debut'`,
`'voyage:fin'`, `'document'` ({id}), `'quete'` ({id, etape}), `'toast'` ({texte}).

### 3.3 `js/core/clock.js`
`demarrer()`, `arreter()`, `pause(raison)` / `reprendre(raison)` (solo uniquement — en co-op le temps ne
s'arrête jamais sauf sommeil commun), `setVitesse(mult)`, `minutes()`, `jour()`, `heure()`, `minute()`,
`texteHeure()` → « Jour 3 — 21:40 », `estNuit()`, `lumiereJour()` → 0 (nuit noire) … 1 (plein jour).
Cadence de base : `REGLAGES.temps.MS_PAR_MINUTE` (1000 ms réelles = 1 min de jeu). Émet `'minute'`.

### 3.4 `js/core/rng.js`
`seedRng(chaine) → () => [0,1)`, `hashStr`, `rng(min,max)`, `chance(p)`, `pick(arr)`, `melanger(arr)` —
les versions non-seedées utilisent `Math.random`. Chaque fonction accepte un générateur optionnel en dernier argument.

### 3.5 `js/core/util.js`
`$`, `$$`, `el(tag, attrs, ...enfants)`, `clamp`, `lerp`, `dist`, `fmtDistance(m)` → « 640 m » / « 2,4 km »,
`fmtDuree(min)` → « 12 min » / « 1 h 20 », `escapeHtml`, `debounce`, `attendre(ms)`.

### 3.6 `js/game/flow.js` — l'enchaînement des trois temps
```js
explorer(lieuId, { entree? })            // → Temps 1 (monte js/explore/vue.js)
ouvrirCarte({ echelle: 'salon'|'region' }) // → Temps 2, sélection de destination
voyager({ vers, allure, groupe? })       // → Temps 2, écran de voyage (js/travel/voyage.js)
combattre(spec) → Promise<resultat>      // → Temps 3 par-dessus le temps courant, puis retour
scene(id) → Promise<finId>               // scène narrative (dialogue.js), par-dessus tout
cinematique(id) → Promise                // cinématique (js/cine/lecteur.js)
```
Chaque « temps » est un module qui exporte `entrer(params)` et `sortir()` et ne connaît pas les autres :
il **demande** au flow d'enchaîner (ex. l'exploration appelle `flow.ouvrirCarte()` quand on franchit une sortie).

### 3.7 `js/game/autorite.js` — qui fait foi pour le monde
Le monde (morts dans les niveaux, portes, conteneurs, combats, horloge, drapeaux) est **simulé par une
seule machine** : le joueur solo, ou l'**hôte** en co-op. Chaque temps parle au monde **uniquement via un
« canal »** fourni par `autorite.js`, jamais en touchant la simulation directement. Ainsi solo, hôte et
invité passent par **le même code** (voir §9).

---

## 4. Schémas de données

### 4.1 Lieux — `js/data/lieux.js`
```js
export const LIEUX = {
  hotel_poste: {
    nom: 'Grand Hôtel de la Poste', court: 'Hôtel de la Poste',
    echelle: 'salon',                 // 'salon' (carte de la ville) | 'region' (carte du pays salonais)
    lat: 43.64153, lon: 5.09680,      // position RÉELLE (géocodée OpenStreetMap)
    type: 'hotel',                    // sert au butin par défaut, à l'ambiance sonore, à l'icône de carte
    niveau: 'hotel_poste',            // id du plan d'exploration (js/data/niveaux/) — null = pas explorable
    danger: 0.2,                      // 0..1 : densité de morts, rencontres aux abords
    decouvert: true,                  // visible sur la carte dès le début ?
    desc: 'Texte court affiché sur la carte.',
    ambiance: 'hotel',                // scène sonore (js/data/soundscapes.js)
    illustration: 'hotel',            // décor de fond du combat / vignette
  },
}
```

### 4.2 Plans d'exploration — `js/data/niveaux/<id>.js` (format ASCII)
Un fichier par lieu (`export default { ... }`). **1 case ≈ 0,8 m.** Le plan est une liste de chaînes
de même longueur. **Légende globale** (modifiable par niveau via `legende`) :

| Car. | Sens | Bloque ? | Opaque ? |
|---|---|---|---|
| `#` | mur | oui | oui |
| `.` | sol intérieur (matière = celle de la pièce) | non | non |
| `,` | sol extérieur (bitume, pavés) | non | non |
| `"` | herbe / terre | non | non |
| `:` | gravier / ballast | non | non |
| `~` | eau | oui | non |
| `+` | porte fermée (s'ouvre) | fermée : oui | fermée : oui |
| `/` | porte ouverte | non | non |
| `X` | porte verrouillée (à forcer / clé, cf. `verrous`) | oui | oui |
| `|` | fenêtre (dans un mur) | oui | **non** |
| `<` `>` | escalier qui monte / descend (vers `etage.monte` / `etage.descend`) | non | non |
| `E` | sortie du lieu → carte | non | non |
| `@` | point d'entrée par défaut | non | non |
| `Z` | mort du pool du niveau | non | non |
| `t` table · `r` comptoir · `k` cuisine · `s` étagère/rayonnage · `a` armoire · `f` frigo · `d` bureau · `g` caisse · `o` poubelle · `m` machine | mobilier / conteneur | oui | non |
| `b` lit · `p` canapé · `n` banc · `w` lavabo/WC · `h` baignoire/douche | mobilier / conteneur | oui | non |
| `c` chaise · `%` cadavre (décor) · `;` débris / sang | décor | non | non |
| `v` voiture · `x` gravats / barricade · `T` arbre | obstacle / conteneur (`v`) | oui | `T` : oui |

Cases de mobilier **identiques et adjacentes** = **un seul meuble** (un lit `bb`, un rayonnage `ssss`).
Tout meuble conteneur a une **catégorie de butin** par défaut (a→`vetements`, f→`frigo`, k→`cuisine`,
s→`etagere`, d→`bureau`, r→`comptoir`, g→`caisse`, b→`lit`, w→`salle_de_bain`, v→`voiture`, o→`poubelle`,
m→`machine`, t→`table`, p→`canape`, h→`salle_de_bain`). **Toute autre lettre/chiffre** peut être
défini dans `legende` du niveau (marqueurs : PNJ, objets de quête, déclencheurs, morts particuliers).

```js
export default {
  id: 'hotel_poste', nom: 'Grand Hôtel de la Poste', exterieur: false,
  typeButin: 'hotel',                           // table de butin par défaut (js/data/butin.js)
  pool: ['errant'],                             // morts pour 'Z' et le procédural
  morts: { n: [1, 3] },                         // morts procéduraux en plus des 'Z' (1re visite)
  etages: [
    { id: 'e2', nom: '2e étage', monte: null, descend: 'rdc', plan: [
      '##########',
      '#b..#...s#',
      '#b..+.@..#',
      '###>######',
    ] },
    { id: 'rdc', nom: 'Rez-de-chaussée', monte: 'e2', descend: 'cave', plan: [ /* … */ ] },
  ],
  pieces: [                                     // nomme les pièces : n'importe quelle case DEDANS
    { etage: 'e2', x: 1, y: 1, nom: 'Chambre 203', sol: 'moquette', sombre: 0 },
  ],                                            // sol : parquet|carrelage|moquette|beton|lino|tomettes|terre
                                                // sombre : 0 éclairé par les fenêtres, 1 pénombre, 2 noir complet
  legende: {
    '1': { marqueur: 'radio_203', prop: 'table', conteneur: { nom: 'Table de chevet', items: [{ id: 'radio_piles', qty: 1 }], table: null } },
    'R': { zombie: 'rampant', etat: 'dort' },   // etat : erre|immobile|dort|fait_le_mort|cogne
    'K': { porte: true, verrou: 'cle_cave' },   // porte verrouillée (clé), ou verrou: { forcer: 'pied_de_biche', skill: {force: 2} }
  },
  declencheurs: [                               // zones qui lancent une scène / cinématique (voir §4.7)
    { etage: 'rdc', x: 3, y: 2, w: 4, h: 2, scene: 'hotel_reception', unique: true, si: { flag: 'x' } },
  ],
}
```
Le parseur (`js/explore/niveau.js`) valide : lignes de même longueur, entrées/sorties présentes,
escaliers appariés, tout l'espace marchable relié à une entrée. Un **validateur** (`tools/valider.mjs`)
le fait hors navigateur.

### 4.3 Butin — `js/data/butin.js`
```js
export const BUTIN = {
  defaut:  { cuisine: [ { id: 'conserve_haricots', q: [1,2], p: 0.4 }, … ], … },
  hotel:   { vetements: […], lit: […] },       // surcharge par type de lieu
  pharmacie: { etagere: […], comptoir: […] },
};
```
Chaque conteneur tire `ceil(n)` lignes selon `p`, une seule fois (première fouille, graine du lieu).

### 4.4 Objets, vêtements, morts, recettes
Formats existants **conservés** (`js/data/items.js`, `clothing.js`, `zombies.js`, `recipes.js`) — le game
designer les réécrit/équilibre et **documente tout champ ajouté**. Champs attendus par les moteurs :

- **Arme** (`type: 'arme'`) : `dmg: [min,max]`, `dur`, `bruit` (0..3), `skill`, `poids`,
  **nouveaux** : `vitesse` (ms d'un coup rapide), `allonge` (0..2), `sta` (coût d'endurance d'un coup),
  `charge` (multiplicateur max du coup chargé), `stagger` (0..1, chance de faire vaciller), `crit` (0..1).
  Arme à feu : `tir: { munition, capacite, precision, recharge (ms), portee }`.
- **Mort** (`zombies.js`) : `nom, hp, dmg, blessureMax, infection, desc, gore, attaques[{desc, zones}]`,
  **combat** : `menace` (ms pour remplir la jauge), `telegraphe` (ms d'avertissement avant la ruée),
  `saisie` (0..1 : chance que la ruée soit une empoignade), `esquive` (0..0.3), `resistance` (réduction de stagger),
  **exploration** : `vitesse` (cases/s en errance), `vitesseChasse` (cases/s), `vue` (portée en cases, de jour),
  `ouie` (multiplicateur), `special` ('hurle'|'explose'|'rampe'|'charge'|null), `png` (image de /zombies/ si dispo).
- **Recette** : `id, cat, nom, resultat{id,qty}, ingredients[{id,qty}], outils[tags], poste ('etabli'|'feu'|null),
  skill {id: niveau}|null, tempsMin, xp{}, desc, connue (bool, sinon à découvrir via `apprise_par`)`.

### 4.5 Scènes narratives — `js/data/histoire/scenes.js`
Format (conservé de l'existant, étendu) :
```js
export const SCENES = {
  id_scene: {
    illu: 'clé d’illustration' | null, musique: 'calme'|'sombre'|'tension'|'combat'|null,
    orateur: 'nom du PNJ' | null,      // affiché en tête (dialogues)
    texte: 'Narration… (\n\n = paragraphe)',
    choix: [ {
      label: 'Texte du bouton',
      si: CONDITION,                   // le choix n'apparaît que si… (optionnel)
      besoin: CONDITION,               // visible mais grisé si non rempli, avec la raison (optionnel)
      test: { skill: 'force', difficulte: 2 } | { chance: 0.5 },  // jet (optionnel)
      effets: EFFETS, suivant: 'id' | '#fin' | '#mort' | '#combat',
      reussite: { texte, effets, suivant }, echec: { texte, effets, suivant },
    } ],
    auto: { label: 'Continuer', suivant: 'id' },   // simple enchaînement
    timerMs: 8000, timeout: { texte, effets, suivant },  // choix chronométré (optionnel)
  },
};
```
**CONDITION** (objet, toutes les clés doivent être vraies) : `{ flag: 'k' }`, `{ pasFlag: 'k' }`,
`{ flagEgal: ['k', v] }`, `{ objet: 'id' }`, `{ objet: ['id', qty] }`, `{ skill: ['force', 2] }`,
`{ nuit: true }`, `{ jourMin: 3 }`, `{ lieuVisite: 'id' }`, `{ quete: ['id', 'etape'] }`, `{ ou: [COND, COND] }`.

**EFFETS** (objet, appliqués dans l'ordre des clés) : `flag: 'k' | ['k', v]`, `flags: {k:v}`, `retirerFlag`,
`objet: ['id', qty]` (ajout, qty<0 = retrait), `objets: [['id',q], …]`, `blessure: { type, zone }`,
`pv: -10`, `sta`, `faim`, `soif`, `fatigue`, `tempsMin: 30`, `xp: { skill: n }`, `decouvrir: ['lieu_id', …]`,
`quete: ['id', 'etape']`, `journal: 'texte'`, `document: 'doc_id'`, `combat: { zombies: ['errant', …], lieu? }`,
`cinematique: 'id'`, `teleporter: { lieu, entree? }`, `bruit: 3`, `infection: true`.

### 4.6 Quêtes — `js/data/histoire/quetes.js`
```js
export const QUETES = {
  q_id: { titre, chapitre: 1, principale: true,
    etapes: { debut: { objectif: 'Texte court affiché dans le HUD', lieu?: 'lieu_id' }, … , fin: {…} },
  },
};
```
L'objectif courant de la quête principale s'affiche dans le HUD ; le lieu ciblé est marqué sur la carte.

### 4.7 Déclencheurs — `js/data/histoire/declencheurs.js`
```js
export const DECLENCHEURS = [
  { quand: 'entree_lieu', lieu: 'gare', si: CONDITION, scene: 'id' | cinematique: 'id', unique: true },
  { quand: 'marqueur', lieu: 'hotel_poste', marqueur: 'radio_203', scene: 'id', unique: true }, // interaction
  { quand: 'flag', flag: 'k', scene: 'id' },
  { quand: 'heure', jourMin: 2, heure: 21, si: {…}, scene: 'id' },
  { quand: 'voyage', de?: 'lieu', vers?: 'lieu', a: 0.5 /* à mi-chemin */, rencontre: 'id' },
];
```

### 4.8 Documents (notes, lettres, carnets) — `js/data/histoire/documents.js`
`{ id: { titre, style: 'manuscrit'|'tape'|'imprime'|'sms'|'carnet', texte, lieu?, marqueur? } }` — ramassés,
ils restent lisibles dans le journal.

### 4.9 PNJ — `js/data/histoire/pnj.js`
`{ id: { nom, portrait: 'clé', lieu, marqueur, scene: 'scene_de_dialogue', hostile?: bool } }`.

### 4.10 Rencontres de voyage — `js/data/rencontres.js` (aléatoires) et `histoire/rencontres.js` (scénarisées)
```js
{ id, poids: 3, si: CONDITION, zones: ['centre','nord',…] | null, nuit: null|true|false, dangerMin: 0,
  type: 'combat'|'choix'|'butin'|'ambiance'|'pnj',
  scene: 'id_scene' /* pour 'choix'/'pnj' */ | combat: { zombies: [...] } | butin: { table, n } | texte,
}
```

### 4.11 Cinématiques — `js/data/cinematiques.js`
Script (écrit par le scénariste, mis en images par l'agent cinématiques) :
```js
export const CINEMATIQUES = {
  intro_1: { musique: 'titre', plans: [
    { decor: 'salon_crepuscule', camera: { de: {x:0.1, zoom:1.3}, vers: {x:0.6, zoom:1.05} }, duree: 9000,
      effets: ['pluie', 'fumee'], anim: ['silhouettes_marchent'], texte: 'Sous-titre…', attendre: false },
  ] },
};
```
`decor` = id d'une scène en parallaxe de `js/cine/scenes/`. Le scénariste **décrit** chaque décor dans
`docs/HISTOIRE.md` (plans, couches, éléments animés) pour que l'agent cinématiques le dessine.

---

## 5. Temps 1 — Exploration (déplacement libre)

- Vue de dessus, **canvas 2D**, caméra qui suit le joueur (lissée), zoom réglable (molette / pincement).
  Style visuel **Darkwood** : sol texturé procédural, murs épais avec arête claire, grain, vignette,
  **obscurité** réelle : ce qui n'est pas dans le champ de vision est noir (ou gris « souvenir » si déjà vu).
- **Lumière** : jour (fenêtres = puits de lumière), pénombre, noir ; **lampe** = cône orientable (suit la
  direction de marche, ou la souris sur PC), piles qui s'usent (`inventory`), torche = halo court.
- **Champ de vision** : ombre portée par les murs/portes fermées (shadowcasting sur la grille), limité par
  la lumière. Les morts hors du champ sont invisibles ; ceux qu'on **entend** laissent un **indicateur** (onde).
- **Contrôles** — PC : ZQSD/WASD/flèches, Maj = courir (bruit, endurance), Ctrl/C = accroupi (lent, discret),
  E = interagir (le plus proche), F = lampe, I = inventaire, Tab = carte du lieu, Échap = menu.
  Mobile : **joystick virtuel** à gauche (poussée = vitesse), boutons à droite : **Interagir** (contextuel,
  libellé explicite : « Fouiller l'armoire », « Ouvrir », « Monter », « Sortir »), Courir, Accroupi, Lampe.
- **Interactions** (≤ 1,2 case, dans le champ) : portes (ouvrir/fermer/barricader), conteneurs (**fouille en
  temps réel** : barre, bruit, interruptible ; puis fenêtre de butin « Prendre / Tout prendre »), objets au sol,
  escaliers, sorties (→ `flow.ouvrirCarte()`), marqueurs d'histoire (→ déclencheurs), PNJ, documents.
- **Morts (IA temps réel)** : états `dort` → `immobile` → `erre` → `alerte` (va vers un bruit) → `chasse`
  (chemin BFS vers le joueur) → `contact`. Vue en cône (≈100°) + portée selon lumière ; ouïe selon bruits
  (marche 2, course 6, porte 4, fouille 3, combat 8, coup de feu 25 cases). Portes fermées : ils **cognent**
  (PV de porte, elle cède). Contact (≤ 0,7 case) → la sim émet `{ type: 'contact', joueur, zombies }` avec
  les morts proches en chasse → **Temps 3**. Après le combat : morts tués retirés (cadavres au sol), fuite =
  morts repoussés.
- **Persistance** par lieu (`G.world.lieux[id].etat`) : morts (positions, PV), portes, conteneurs fouillés,
  objets au sol, cadavres, déclencheurs joués. Au retour, on retrouve le lieu tel qu'on l'a laissé
  (avec un **repeuplement** léger selon le temps écoulé et le danger).
- **Pas de brouillard de guerre sur la carte du monde** : il est à l'intérieur des lieux uniquement.

## 6. Temps 2 — La carte et le voyage

- **Carte illustrée** (choix du joueur : *« plan touristique abîmé »*) : papier jauni, plis, taches de
  café et de sang, brûlures, annotations au feutre (cercles, croix, flèches, « NE PAS Y ALLER »), pictogrammes
  dessinés à la main, routes au tracé légèrement tremblé. **Les positions sont RÉELLES** (lat/lon géocodées) et
  les **distances sont réelles** (mètres), seules les formes sont illustrées. Deux feuilles : **Salon** et
  **le pays salonais** (Salon y est un lieu ; on passe de l'une à l'autre par les sorties de ville).
- Toucher un lieu → **fiche** : nom, illustration, description, état (inconnu / visité / fouillé / refuge),
  **distance**, **durée estimée**, **risque** (jauge 5 crans avec la raison : « quartier infesté », « de nuit »),
  bouton **Partir**. Choix de l'**allure** : Discrète (lente, moins de rencontres), Normale, Rapide (bruit,
  endurance, plus de rencontres mais moins longtemps exposé).
- **Voyage** : la carte zoome sur l'itinéraire, un pion avance, bandeau « **Il te reste 640 m** — ~8 min ».
  Le temps de jeu coule pendant le trajet (solo : bouton accélérer ×4). Les **rencontres** sont tirées au départ
  (graine) à des points de l'itinéraire selon : danger des zones traversées, nuit, allure, bruit, météo.
  À l'arrivée d'une rencontre, le pion s'arrête et une **carte-événement** s'ouvre (illustration + texte + choix)
  → peut basculer en **combat** (Temps 3), faire perdre du temps, faire un détour (+ mètres), rapporter du butin.
  On peut **faire demi-tour** à tout moment. Arrivée → `flow.explorer(vers)`.
- **Aucun déplacement libre sur la carte.**

## 7. Le combat — DANS l'exploration (refonte)

Il n'y a plus d'écran de combat. Les morts se battent là où ils sont, dans la simulation du lieu (`js/explore/sim.js`,
règles dans `js/explore/combat.js`, nombres dans `REGLAGES.combat`). Trois gestes seulement : **se déplacer, frapper, pousser**
(pas d'esquive, pas de garde).

- **Un mort en chasse** s'approche et s'arrête à bout de bras (0,7 case). À portée (`portee`), il **télégraphie**
  (`telegraphe` ms) : un **arc au sol** devant lui, **rouge = coup**, **ambre = empoignade**. À la fin, il frappe : touché si tu es
  encore à portée (+0,25) et dans son cône de 120°. Puis il récupère (`cadence` ms). On l'évite en **reculant**, on l'annule en
  le **poussant** ou d'un **coup chargé** (≥ 50 %) qui touche.
- **Empoignade** : il t'agrippe ; marteler Frapper / Pousser avant la fin de l'anneau (sinon **morsure** — la seule source de morsure).
  Les autres morts attendent leur tour.
- **Frapper** : appui court = coup rapide ; maintenir = coup chargé (anneau), relâcher = coup lourd (recul, vacillement, usure 2).
  Portée / arc / cibles selon l'allonge de l'arme (court 1,05 case 100° 1 cible ; moyen 1,4 case 120° balayage 2 cibles ; long 1,8 case 60°).
  Furtif (mort non alerté, de dos) : ×3, silencieux s'il tue.
- **Pousser** : tout ce qui est devant (1,5 case, 130°) recule et vacille (télégraphie annulée), chance de mise à terre ; un colosse ne bouge pas.
- **Tir** : maintenir = viser (immobile = précision pleine), relâcher = tirer vers ta visée ; R = recharger.
- **Visée** : PC = la souris ; tactile = **visée assistée** vers le mort le plus menaçant devant toi.
- **Retours** : chiffres de dégâts, sang, secousse, voile rouge, vibrations, « Dégage-toi ! » ; zoom qui se rapproche quand un mort charge.
- **Combats scénarisés** (`flow.combattre(spec)`) : dans un lieu, les morts **surgissent autour du joueur** (`vue.combatIci`) ;
  pendant un voyage, une **embuscade** : un bout de route généré (`explore/embuscade.js`), on s'en sort en tuant ou par un bord.
  Résultat inchangé : `{ issue: 'victoire'|'fuite'|'mort', tues, fuis }`.
- **Co-op** : la sim du lieu est tenue par l'hôte ; l'invité envoie ses gestes (`x:act`), l'hôte relaie les événements de combat.

## 8. Interface & direction artistique

- **Ton visuel** : nuit, encre, papier sale, lumière chaude rare (ambre `#c9a227`), sang (`#8e1b24`/`#d6303e`),
  texte crème (`#e6dfcc`) sur quasi-noir (`#0b0b0c`). Grain léger, vignette.
- **Polices** (auto-hébergées dans `/fonts`, licence OFL) : titres & UI « **Oswald** » (condensée),
  narration « **EB Garamond** », documents tapés « **Special Elite** », annotations de carte « **Caveat** ».
- **HUD** discret : heure + jour, lieu, objectif courant, **états du corps façon Project Zomboid** (icônes qui
  apparaissent seulement quand ça compte : faim, soif, fatigue, douleur, saignement, infection, froid, surpoids).
- Panneaux (inventaire, corps, fabrication, journal) : **plein écran sur mobile, latéraux sur PC**, onglets.
- **Audio** : `js/audio.js` existant conservé. API : `initAudio()`, `playAmbiance(sceneId)`, `sfx(nom)`,
  `startCombatMusic()`, `stopCombatMusic()`, `setTension(0..1)`, `setHeartbeat(bool)`, `setMuted`, `setVolume`.
  Sons disponibles (`sfx`) : clic, pas, pas_craque, porte, porte_coup, porte_casse, coup, coup_critique, rate,
  esquive, puissance_charge, puissance, alerte, degats, zombie, zombie_loin, hurlement, tir, manger, boire, soin,
  craft, loot, mort, explosion, cloche, alerte_infection, alerte_contact, eau_verse, tissu_dechire, chrono.
  Scènes d'ambiance : hotel, rue, magasin, eglise, musee, gare, triage, hopital, commissariat, garage,
  mediatheque, cinema, region, village, refuge, interieur, sombre, train.

## 9. Co-op : hôte-autoritaire

- L'hôte simule **tout le monde partagé** : horloge, drapeaux, quêtes, et **chaque lieu occupé par au moins un
  joueur** (morts, portes, conteneurs, sol) + **tous les combats**. L'invité est un **client** : il possède son
  personnage (position, inventaire, corps) et envoie ses intentions.
- Messages invité → hôte : `pos` (10 Hz dans un lieu), `entrer`/`sortir`, `bruit`, `porte`, `fouiller`, `prendre`,
  `deposer`, `combat:action`, `combat:rejoindre`, `voyage:debut/fin`, `flag`, `quete`, `scene:effets`.
  Hôte → invité : `monde` (état initial), `horloge` (1 Hz), `niveau` (instantané 10 Hz du lieu de l'invité :
  morts, portes, pair), `conteneur`, `combat:etat` (20 Hz), `combat:evt`, `combat:fin`, `flag`, `quete`, `pair`.
- **Déplacement libre pour chacun** (lieux différents possibles). Deux joueurs dans le même lieu se voient.
  Un combat dans un lieu est **rejoignable** par l'autre joueur présent dans ce lieu (bouton « Rejoindre le combat »,
  ou automatiquement s'il est à ≤ 4 cases). **Voyage à deux** optionnel : si les deux sont au même lieu, l'un peut
  proposer « Partir ensemble » → mêmes rencontres, combats communs.
- Dégâts reçus par un joueur : calculés par la sim de l'hôte, **appliqués par le client du joueur** (son corps).
- Relais : `server.js` existant (WebSocket, salons à code) — inchangé côté protocole de salon.

## 10. Ton d'écriture

- Adulte, **sensoriel**, sec, jamais pompeux. Violence et gore **concrets** mais jamais gratuits : ils disent
  quelque chose des personnages. Humour noir rare. Tutoiement du joueur.
- Ancré dans le **réel salonais** (noms de rues, lieux, commerces, mistral, platanes, Crau, Alpilles, canal de
  Craponne, BA 701, Nostradamus, séisme de 1909) — sans jamais faire guide touristique.
- Phrases courtes en action, plus amples dans les moments calmes. Pas d'anglicismes inutiles.
- Aucun personnage réel vivant nommé. Commerces réels : présents comme décor, sans les dénigrer.

---

## 11. Qui écrit quoi (répartition des fichiers — ne jamais écrire dans le fichier d'un autre)

| Agent | Fichiers |
|---|---|
| **Intégrateur** | `index.html`, `css/base.css`, `js/main.js`, `js/core/**`, `js/game/flow.js`, `js/game/autorite.js`, `js/net/**`, `js/data/lieux.js`, `sw.js`, `server.js` |
| **Scénariste** | `docs/HISTOIRE.md`, `docs/NIVEAUX_BESOINS.md`, `js/data/histoire/*.js` (dont `lieux_recit.js`, `objets_quete.js`, `morts.js`), `js/data/cinematiques.js` |
| **Game designer** | `docs/GAMEPLAY.md`, `js/data/reglages.js`, `zombies.js`, `items.js`, `clothing.js`, `recipes.js`, `butin.js`, `rencontres.js`, `rencontres_scenes.js`, `lieux_gameplay.js`, `zones.js`, `tools/verifier_gameplay.mjs` |
| **Exploration** | `js/explore/**`, `css/explore.css`, `tools/valider_niveaux.mjs`, `docs/NIVEAUX.md` (format + conseils) |
| **Carte & voyage** | `js/travel/**`, `css/carte.css`, `js/data/carte_salon.js`, `js/data/carte_region.js`, `tools/osm_vers_carte.mjs` |
| **Combat** | `js/combat/**`, `css/combat.css` |
| **Interface** | `js/ui/**` (sauf `dialogue.js`, `screens.js`, `hud.js` : intégrateur), `js/game/player.js`, `survival.js`, `inventory.js`, `crafting.js`, `css/ui.css` |
| **Cinématiques** | `js/cine/**`, `css/cine.css` |
| **Niveaux** | `js/data/niveaux/*.js` |

Fusions au chargement (faites par l'intégrateur) :
- `LIEUX` = `LIEUX_GEO` (lieux.js) ⊕ `LIEUX_RECIT` (histoire/lieux_recit.js : `{ id: { nom?, court?, desc, decouvert, role } }`)
  ⊕ `LIEUX_GAMEPLAY` (lieux_gameplay.js : `{ id: { danger, pool, morts, typeButin, repeuplement, ambiance } }`).
- `ITEMS` = items.js ⊕ histoire/objets_quete.js (`OBJETS_QUETE`, même format, `type: 'quete'|'lore'`).
- `SCENES` = histoire/scenes.js ⊕ rencontres_scenes.js.

**Lieux clés** : l'histoire s'appuie sur **au plus 14 lieux clés** (niveaux faits main, riches). Tous les autres
lieux de `lieux.js` restent visitables avec des niveaux plus simples, orientés butin et ambiance.

**Genre du joueur** : choisi à la création. Dans tout texte affiché, `{masculin|féminin}` est remplacé selon ce choix.

---

## 12. Contrats précis entre modules (à respecter à la lettre)

### 12.1 Données
Toujours lire le contenu via `js/game/donnees.js` : `LIEUX`, `ITEMS`, `SCENES`, `ZOMBIES`, `CLOTHES`, `lieu(id)`,
`objet(id)`, `scene(id)`, `mort(id)`, `chargerNiveau(id) → Promise<def|null>` (import dynamique de
`js/data/niveaux/<id>.js`). Réglages : `import { REGLAGES } from '../data/reglages.js'`. Lire **docs/GAMEPLAY.md**
(surtout §13 « ce que les moteurs doivent implémenter ») : c'est la référence des règles et des nombres.

### 12.2 Le flow (`js/game/flow.js`, intégrateur) — ce que les temps appellent
```js
import * as flow from '../game/flow.js';
flow.explorer(lieuId, { entree })          // entrer dans un lieu (entree = id de marqueur/entrée nommée, optionnel)
flow.ouvrirCarte({ echelle })              // 'salon' | 'region'
flow.voyager({ vers, allure, groupe })     // allure 'discrete'|'normale'|'rapide'
flow.combattre(spec) → Promise<resultat>   // spec : { zombies: [{uid?, type, hp?}] | ['errant', …], lieuId?, decor?, surprise?: 'engage'|'normal'|'surpris', tuto?: bool }
flow.scene(id) → Promise<{ fin: '#fin'|'#mort'|'#combat'|…, combat?: spec }>
flow.cinematique(id) → Promise
flow.appliquerEffets(effets)               // EFFETS §4.5 (délègue à js/game/effects.js)
flow.toast(texte)
flow.stage()                               // → l'élément DOM plein écran où monter sa vue (#stage)
```
Chaque temps exporte `entrer(params)` et `sortir()`. `sortir()` doit tout nettoyer (boucles rAF, écouteurs clavier,
timers, DOM). Le flow appelle `sortir()` du temps courant avant d'en ouvrir un autre ; le **combat** et les **scènes**
s'ouvrent PAR-DESSUS l'exploration/le voyage (l'exploration se met en pause via `vue.pause()/reprise()` — l'exporter).

### 12.3 Exploration (agent Exploration)
- `js/explore/niveau.js` : `parserNiveau(def) → niveau` (grille de tuiles par étage, pièces, meubles groupés avec clé
  `'etage:x,y'`, portes, escaliers, entrées, sorties, marqueurs, spawns) + `validerNiveau(def) → [erreurs]`.
- `js/explore/sim.js` : `creerSimLieu({ lieuId, niveau, etat, seed, danger, pool })` → objet **sans DOM** :
  `ajouterJoueur(id, pos)`, `majJoueur(id, { x, y, etage, dir, allure: 'marche'|'course'|'accroupi'|'immobile', lumiere: 0..1 })`,
  `retirerJoueur(id)`, `bruit({ etage, x, y, rayon, source })`, `porte(cle, action, joueurId) → { ok, raison? }`,
  `fouiller(joueurId, cle) → { items, dureeMs }` (tirage une seule fois, butin via `js/data/butin.js`),
  `prendre(joueurId, cle, index) → item|null`, `deposer(joueurId, pos, item)`, `retirerZombies(uids, { tues })`,
  `repousserZombies(uids, depuis)`, `tick(dtMs) → evenements[]` (dont `{ type: 'contact', joueur, zombies: [{uid,type,hp}], surprise }`),
  `instantane() → { zombies: [{uid,type,x,y,etage,dir,etat,alerte}], portes, sol, cadavres }`, `sauver() → etat JSON`.
- `js/explore/canal_local.js` : `creerCanalLocal(sim, joueurId)` → le **canal** utilisé par la vue :
  `majJoueur(patch)`, `bruit(b)`, `porte(cle, action) → Promise`, `fouiller(cle) → Promise`, `prendre(cle, i) → Promise`,
  `deposer(pos, item) → Promise`, `instantane()`, `pairs() → [{ id, nom, x, y, etage, dir, enCombat }]`, `on(evt, fn) → off`.
  L'intégrateur fera un canal **distant** (invité) avec exactement la même interface.
- `js/explore/vue.js` : `entrer({ lieuId, entree })` (crée/récupère la sim via `js/game/autorite.js → canalLieu(lieuId)`
  — tant que l'autorité n'existe pas, crée ta sim + canal local toi-même derrière une fonction `obtenirCanal(lieuId)`
  facile à remplacer), `sortir()`, `pause()`, `reprise()`. Sur `contact` → `await flow.combattre({...})` puis applique
  le résultat (`retirerZombies` / `repousserZombies`). Sur sortie `E` → `flow.ouvrirCarte({ echelle: lieu.echelle })`.
  Marqueurs / entrée de lieu / zones → déclencheurs (`js/data/histoire/declencheurs.js`) → `flow.scene(id)`.
  Documents au sol → lecture (émettre `bus 'document'` + `G.documents.push(id)`).

### 12.4 Combat (dans l'exploration — remplace l'ancien `js/combat/`)
- `js/explore/combat.js` : règles pures (`resoudreCoup`, `resoudreAttaque`, `geometrie`, `chargeDepuisAppui`…).
- `js/explore/sim.js` : `action(joueurId, { type: 'frapper'|'pousser'|'tirer'|'marteler', charge?, visee?, x, y, dir, ess, stats? })`,
  `faireApparaitre(liste, { joueurId, surprise })`, événements `telegraphe`, `attaque`, `blessure` (appliquée par le client du joueur visé),
  `saisie`, `martele`, `degage`, `coup`, `rate`, `coup_vide`, `mort_zombie`, `poussee`, `tir`, `bouscule`.
- `js/explore/combat_vue.js` : gestes, endurance, retours, blessures appliquées au corps (`survival.infligerBlessure`).
- `js/game/stats_combat.js` : `statsCombat(player)` (arme de la main droite, protection par zone, compétences) — envoyé via `canal.majJoueur({ stats })`.

(Ancien contrat, conservé pour mémoire :)
- `js/combat/sim.js` : `creerCombat({ id, lieuId, participants: [{ id, nom, stats }], zombies: [{ uid, type, hp? }], seed, danger, surprise })`
  → `action(joueurId, a)`, `ajouterParticipant(p)`, `ajouterZombies(liste)`, `tick(dtMs) → evenements[]`, `etat()`,
  `fini()`, `resultat(joueurId)`. Événements : `coup`, `rate`, `bloque`, `esquive`, `contre`, `saisie`, `blessure`
  (`{ joueur, blessure: { type, zone, gravite, saigne }, degats, mal }`), `mort_zombie`, `renfort`, `fuite`, `fin`.
- `js/combat/stats.js` : `statsCombat(player) → stats` (arme en main, protection par zone, compétences, endurance).
- `js/combat/canal_local.js` : `creerCanalCombat(sim, joueurId)` → `action(a)`, `etat()`, `on('evt'|'fin', fn)`.
- `js/combat/vue.js` : `ouvrir({ spec }) → Promise<resultat>` (monte l'écran par-dessus tout, gère clavier/tactile,
  applique au **joueur local** les événements `blessure` via `survival.infligerBlessure(G.player, b)` et l'usure de l'arme via
  `inventory`). Résultat : `{ issue: 'victoire'|'fuite'|'mort', tues: [uids], fuis: [uids], xp, bruit }`.

### 12.5 Carte & voyage (agent Carte)
- `js/travel/carte.js` : `entrer({ echelle, depuis })`, `sortir()`. `js/travel/voyage.js` : `entrer({ de, vers, allure, groupe })`, `sortir()`.
- `js/travel/geo.js` : `projeter(lat, lon, echelle) → {x,y}`, `distanceM(a, b)`, `itineraire(deLieu, versLieu) → { points, metres, troncons: [{ metres, zones }] }`.
- Rencontres : `js/data/rencontres.js` (aléatoires) + `js/data/histoire/rencontres.js` (scénarisées) ; résolution par `flow.scene` / `flow.combattre`.
- Découverte : un lieu est affiché si `LIEUX[id].decouvert || G.world.lieux[id]?.decouvert`.

### 12.6 Interface (agent Interface) — `js/game/*` du personnage et `js/ui/*`
- `js/game/survival.js` : `tickMinutes(delta, activite)`, `infligerBlessure(p, b)`, `soigner(p, blessureIndex, objetId)`,
  `etatsCorps(p) → [{ id, niveau, label }]` (moodles), `causeMort(p) → null|cause`, `dormir(heures)`, `manger(id)`, `boire(...)`.
- `js/game/inventory.js` : ajout/retrait, poids/encombrement, équipement, accès rapide, lampes (piles), usure.
- `js/game/crafting.js` : recettes disponibles/connues, `fabriquer(id, qty)`.
- `js/game/player.js` : compétences (`niveau(skill)`, `gagnerXp(skill, n)`), dérivés (vitesse, charge).
- `js/ui/hud.js`, `js/ui/icons.js`, `js/ui/panels/*.js` : `ouvrirPanneau('inventaire'|'corps'|'fabrication'|'journal'|'options')`.

### 12.7 Cinématiques (agent Cinématiques)
- `js/cine/lecteur.js` : `jouer(id) → Promise` (lit `js/data/cinematiques.js`), bouton Passer, sous-titres, `attendre`.
- `js/cine/scenes/<decor>.js` : `export default { largeur, hauteur, couches: [...], animer(t, etat) }` — libre à toi.
