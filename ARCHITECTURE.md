# Architecture — One More Day v3

La référence complète est **`docs/REFONTE.md`** (arborescence, contrats entre modules, schémas de données, co-op).
Résumé :

```
js/main.js            écran titre, création, mort, fins, démarrage
js/core/              état + sauvegarde (state), horloge (clock), bus d'événements, hasard, utilitaires, préférences
js/game/flow.js       enchaîne les trois temps (explorer / ouvrirCarte / voyager / combattre / scene / cinematique)
js/game/              données fusionnées, effets, conditions, quêtes, déclencheurs, autorité co-op,
                      personnage (player, survival, inventory, crafting)
js/explore/           Temps 1 : plans ASCII, sim headless, IA des morts, vision, rendu canvas, entrées
js/travel/            Temps 2 : géographie réelle, carte illustrée SVG, voyage et rencontres
js/combat/            Temps 3 : sim headless déterministe, écran de combat
js/cine/              cinématiques en parallaxe (36 décors)
js/ui/                HUD, panneaux (inventaire, corps, fabrication, journal, options), scènes à choix
js/net/               transport WebSocket + session co-op hôte-autoritaire
js/data/              tout le contenu (réglages, objets, morts, butin, lieux, niveaux, histoire…)
server.js             serveur statique + relais WebSocket des salons co-op
```

Règle d'or : la **logique** vit dans les modules, les **nombres** dans `js/data/reglages.js`, le **contenu** dans `js/data/`.
