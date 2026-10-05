# Architecture — One More Day v4

La référence détaillée des contrats reste **`docs/REFONTE.md`** ; ce fichier donne la carte du code.

```
js/main.js              écran titre, création, mort, fins, démarrage
js/core/                état + sauvegarde (state), horloge (clock), bus d'événements, hasard, utilitaires, préférences
js/game/                flow (enchaîne les temps), données fusionnées, conditions, effets, quêtes, déclencheurs,
                        autorité co-op, personnage (player, survival, inventory, crafting, stats_combat), météo

js/carte/               ★ LE FORMAT DES CARTES (sans DOM, utilisable sous Node)
  catalogue.js            tout ce qu'on peut poser : SOLS, MURS, OBJETS, DECALS, LUMIERES, TOITS ; GRILLE FINE (FIN = 2) :
                          les plans s'écrivent en UNITÉS (0,8 m), le compilateur découpe chaque unité en 2 × 2 petites cases
                          (0,4 m) — murs minces (treillis haut-gauche), portes d'une unité, empreintes réelles (tf) ;
                          positions, réglages et sauvegardes restent en unités, seules les grilles d'un étage sont fines
                          (icase(E, x, y), sousCases, cxCase/cyCase)
  plan.js                 l'API de construction par couches : plan(meta, (p) => { const e = p.etage(…); e.piece(…); e.objet(…) })
  ascii.js                ancien format ASCII → couches (les 45 plans historiques en profitent sans réécriture)
  (construction)          js/data/construction.js (catalogue), js/game/construction.js (matériaux, XP), js/explore/construction.js (placement, gestes)
  abords.js               abords générés (×4) autour de chaque plan ASCII : rues, maisons, parkings, champs (NIVEAUX §7 bis)
  compiler.js             couches → niveau jouable (grilles, pièces, meubles, portes, escaliers, lumières cuites, toits)

js/rendu/               ★ LE MOTEUR DE RENDU (canvas 2D)
  rendu.js                l'orchestrateur : blocs pré-rendus (LRU), dynamique triée en profondeur, houppiers, obscurité,
                          toits vus de dehors, repères (cible, objectif, coéquipier, ondes), météo, étalonnage, grain
  textures.js             textures procédurales SANS COUTURE (sols, dessus de murs, toits), bruit périodique, Voronoï
  sols.js                 sol : matières, transitions irrégulières, variations, occlusion au pied des murs, décals
  murs.js                 murs : dessus texturé, arêtes, face avant (hauteur), murets, grilles, haies, fenêtres, escaliers
  objets.js               ~70 meubles et objets dessinés (véhicules, tombes, tentes…) + houppiers en sprites
  personnages.js          squelettes animés : vivants (armes, gestes, enchaînements), morts (5 types), cadavres
  lumiere.js              masque d'obscurité COLORÉ : jour, sources fixes qui vacillent (feu, néon, gyrophare), lampes
  effets.js               particules (sang, braises, fumée, feuilles, éclaboussures), calque de sang persistant, traînées
  atmosphere.js           le soleil (ombres portées selon l'heure), ombres des nuages, brume, sol mouillé, vent selon le
                          biome (ville / sec / vert), poussière dans le faisceau de la lampe

js/explore/             Temps 1 : l'exploration — et le combat sur place
  vue.js                  le cœur de l'écran : entrer/sortir, boucle, déplacement, micro-arrêt, caméra, guide d'objectif
  interactions.js         la touche E : portes (et portes « à deux »), fouille, PNJ, documents, déclencheurs, escaliers, relever
  butin.js                fouille en temps réel, fenêtre de butin, sol
  combat_vue.js           gestes du joueur (tape, enchaînement, charge, esquive, poussée, tir) et retours d'impact
  combat_lieu.js          combats de scène (des morts surgissent) et embuscades de voyage
  hud_explore.js          HUD de l'écran (vitaux, guide, coéquipier, mains, aide des commandes)
  commun.js               outils partagés (sons situés, messages, conditions, comptes d'objets)
  sim.js                  la simulation du lieu (headless) : IA des morts, jetons d'attaque, fente, équilibre, portes, butin
  combat.js               règles pures du combat · niveau.js : point d'entrée des plans · vision, physique, entrées, canal_local

js/travel/              Temps 2 : géographie réelle, carte illustrée SVG, voyage et rencontres ; brouillard de la carte
                        (geo.js : zonesVues, reveler — le plan de Salon dévoile le centre, la carte routière le pays salonais,
                        chaque trajet un couloir ; G.world.brouillard / carteVue)
js/cine/                cinématiques en parallaxe (36 décors) ; lib.js : personnages dessinés comme des corps (membres galbés,
                        pieds, mains, visage de profil, vraie foulée) ; main.js : main articulée (doigts, pouce, ongles)
                        de l'hôpital ; banc d'essai dev/humains.html
js/ui/                  HUD général, panneaux (inventaire, corps, fabrication, journal, options), scènes à choix, toasts
js/net/                 transport WebSocket (net.js) + co-op (coop.js) : hôte-autoritaire, instantanés différentiels,
                        coéquipier visible, relève, histoire partagée, scène suivie en direct, « Rejoindre »
js/data/                tout le contenu (réglages, objets, morts, butin, lieux, niveaux, histoire…)
server.js               serveur statique + relais WebSocket des salons co-op
```

Règles d'or :
- la **logique** vit dans les modules, les **nombres** dans `js/data/reglages.js`, le **contenu** dans `js/data/` ;
- une carte se **décrit** (couches + objets) et le moteur la **dessine** : aucun dessin dans les fichiers de niveaux ;
- l'exploration parle au monde **uniquement par un canal** (local en solo, partagé chez l'hôte, distant chez l'invité) ;
- rien n'est alloué à 60 Hz dans le rendu (blocs pré-rendus, buffers réutilisés) ; aucun `innerHTML` dans la boucle.

Vérifications : `node tools/valider_niveaux.mjs` · `node dev/test_combat.mjs` · `node dev/test_ui_regles.mjs` ·
`node tools/verifier_gameplay.mjs` · `node tools/verifier_histoire.mjs` · après ajout de fichiers : `node tools/generer_sw.mjs`.

## Graphismes photoréalistes (Blender + Poly Haven, CC0)

- `img/sols/*.jpg`, `img/toits/*.jpg` : tuiles sans couture rendues dans Blender (vue de dessus, lumière du haut-gauche, normales,
  rugosité, occlusion) à partir de matières Poly Haven ; `sols.json` / `toits.json` donnent la taille réelle d'une tuile (m).
  Chargées par `js/rendu/textures.js` (`chargerSolsPhoto`) ; le procédural sert tant qu'elles ne sont pas arrivées.
- `img/cine/<décor>.webp` : plaques photographiques des cinématiques, rendues avec une caméra panoramique dans un HDRI Poly Haven
  (vraie photo 360°), cadrées et étalonnées par ambiance ; `js/cine/photos.js` dit quelles couches dessinées elles remplacent
  (les couches proches restent, en silhouettes ; une couche `naturel` garde ses couleurs : la main de l'hôpital).
  Non préchargées par le service worker (6 Mo, chargées à la demande).
- `img/objets/<type>_<n>.webp` + `objets.json` : TOUS les meubles, objets, véhicules, végétaux et constructions, rendus vus de
  dessus dans Blender (modèles Poly Haven CC0 ou construits en code), fond transparent, SANS ombre : `js/rendu/objets.js` dessine
  l'ombre portée d'après la silhouette (toujours vers le bas-droite) et retombe sur le dessin procédural tant qu'un sprite manque.
  `haut_<type>_<n>.webp` : houppiers des arbres. États : `_vide` (étagère pillée), `_ouverte` (portes construites).
  Atelier : `tools/blender/omd_assets.py` (scène, import Poly Haven, mise à l'échelle sur la grille, rendu) et
  `tools/blender/omd_catalogue.py` (un type = une fonction de variante). Ajouter un objet : une entrée au CATALOGUE, puis
  `A.tout_rendre(types=['mon_type'])` dans Blender. Échelle : 1 case = 0,8 m ; dos de l'objet en haut de l'image.
- Sources Blender (hors dépôt) : `D:\projects 3D\OneMoreDay\omd_textures_sol.blend`, `omd_cine.blend`, `plaques.json`
  (décor → HDRI, angle, inclinaison, étalonnage).

## Cinématiques TOURNÉES dans Blender (`tools/blender/cine/`)

Une cinématique reste un script de plans (`js/data/cinematiques.js`) ; un plan qui porte `clip: 'intro_1'` joue la vidéo
`img/cine/clips/intro_1.webm` (VP9, 1280 × 536, 24 i/s) à la place du décor dessiné ; sous-titres, titres, effets, fondus et
bouton Passer restent ceux du lecteur (`js/cine/lecteur.js`). Si la vidéo manque ou ne se lit pas : repli sur le décor dessiné.

Faire un plan :
1. une fonction dans `tools/blender/cine/plans.py` (ou `plans2.py`) : décor + lumière + caméra + acteurs, renvoie (f0, f1) ;
2. vérifier le cadre sur une image : `blender -b --python tools/blender/cine/tourner.py -- <plan> --image --brouillon`
   (aperçu dans `D:\projects 3D\OneMoreDaypercus\<plan>.jpg`) ;
3. tourner : `bash tools/blender/cine/file_rendu.sh <plan> …` (rendu Eevee, maître gardé hors dépôt, clip léger réencodé) ;
4. ajouter `clip: '<plan>'` au plan du script.

Briques : `omd_ville.py` (le centre de Salon : cours et platanes, façades provençales, place Crousillat et Fontaine Moussue,
Tour de l'Horloge à 21 h 10, vieille ville, château de l'Empéri, campagne et collines), `omd_interieurs.py` (couloir de
l'hôpital, intérieur de la housse), `omd_nature.py` (Crau, oliviers, cyprès, pins en cartes de feuillage, falaises de Calès,
Durance et pont de Mallemort, front de feu, Alpha Jets, camp, gymnase, Ventoux, ruines), `omd_humains.py` (humains MPFB :
vêtements, peaux, cheveux, morts grisés ; poses, marche, course, foules « figées » par milliers), `omd_tournage.py`
(lumières : matin, voile, mistral, nuit, aube, incendie ; caméra ; sortie vidéo). Cartes de feuillage :
`D:\projects 3D\OneMoreDay\cartes`.
