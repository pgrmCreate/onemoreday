# Architecture — One More Day v3

La référence complète est **`docs/REFONTE.md`** (arborescence, contrats entre modules, schémas de données, co-op).
Résumé :

```
js/main.js            écran titre, création, mort, fins, démarrage
js/core/              état + sauvegarde (state), horloge (clock), bus d'événements, hasard, utilitaires, préférences
js/game/flow.js       enchaîne les temps (explorer / ouvrirCarte / voyager / combattre / scene / cinematique)
                      combattre = des morts surgissent dans le lieu, ou une embuscade jouable pendant un voyage
js/game/              données fusionnées, effets, conditions, quêtes, déclencheurs, autorité co-op,
                      personnage (player, survival, inventory — mains, dos, volume —, crafting, stats_combat)
js/explore/           Temps 1 : plans ASCII, sim headless (IA des morts + COMBAT temps réel), vision, rendu canvas, entrées,
                      combat.js (règles), combat_vue.js (gestes du joueur), embuscade.js (bout de route généré)
js/travel/            Temps 2 : géographie réelle, carte illustrée SVG, voyage et rencontres
js/cine/              cinématiques en parallaxe (36 décors)
js/ui/                HUD, panneaux (inventaire, corps, fabrication, journal, options), scènes à choix
js/net/               transport WebSocket + session co-op hôte-autoritaire
js/data/              tout le contenu (réglages, objets, morts, butin, lieux, niveaux, histoire…)
server.js             serveur statique + relais WebSocket des salons co-op
```

Règle d'or : la **logique** vit dans les modules, les **nombres** dans `js/data/reglages.js`, le **contenu** dans `js/data/`.
