# Architecture — One More Day v4

La référence détaillée des contrats reste **`docs/REFONTE.md`** ; ce fichier donne la carte du code.

```
js/main.js              écran titre, création, mort, fins, démarrage
js/core/                état + sauvegarde (state), horloge (clock), bus d'événements, hasard, utilitaires, préférences
js/game/                flow (enchaîne les temps), données fusionnées, conditions, effets, quêtes, déclencheurs,
                        autorité co-op, personnage (player, survival, inventory, crafting, stats_combat), météo

js/carte/               ★ LE FORMAT DES CARTES (sans DOM, utilisable sous Node)
  catalogue.js            tout ce qu'on peut poser : SOLS, MURS, OBJETS, DECALS, LUMIERES, TOITS
  plan.js                 l'API de construction par couches : plan(meta, (p) => { const e = p.etage(…); e.piece(…); e.objet(…) })
  ascii.js                ancien format ASCII → couches (les 45 plans historiques en profitent sans réécriture)
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

js/explore/             Temps 1 : l'exploration — et le combat sur place
  vue.js                  le cœur de l'écran : entrer/sortir, boucle, déplacement, ruée, micro-arrêt, caméra, guide d'objectif
  interactions.js         la touche E : portes (et portes « à deux »), fouille, PNJ, documents, déclencheurs, escaliers, relever
  butin.js                fouille en temps réel, fenêtre de butin, sol
  combat_vue.js           gestes du joueur (tape, enchaînement, charge, esquive, poussée, tir) et retours d'impact
  combat_lieu.js          combats de scène (des morts surgissent) et embuscades de voyage
  hud_explore.js          HUD de l'écran (vitaux, guide, coéquipier, mains, aide des commandes)
  commun.js               outils partagés (sons situés, messages, conditions, comptes d'objets)
  sim.js                  la simulation du lieu (headless) : IA des morts, jetons d'attaque, fente, équilibre, portes, butin
  combat.js               règles pures du combat · niveau.js : point d'entrée des plans · vision, physique, entrées, canal_local

js/travel/              Temps 2 : géographie réelle, carte illustrée SVG, voyage et rencontres
js/cine/                cinématiques en parallaxe (36 décors)
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
