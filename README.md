# One More Day

Jeu de survie post-apocalyptique en français, pour adultes (descriptions violentes et gore),
qui se déroule dans des lieux **réels** : **Salon-de-Provence** et le pays salonais
(château de l'Empéri, Fontaine Moussue, BA 701, Leclerc des Viougues, la Crau, Miramas...).
Cartes cliquables à quatre échelles (pièce → quartier → ville → région), inventaire, craft,
combats en temps réel, faim/soif, blessures et états façon Project Zomboid.
Technologie 100 % web (HTML/CSS/JS, sans framework ni build), jouable sur **PC** et **Android** (PWA).

## Lancer le jeu

### Sur PC
Double-clique sur **`Lancer le jeu.bat`** : le serveur démarre (Node.js, ou Python en secours)
et le jeu s'ouvre dans ton navigateur sur `http://localhost:8420`.

### Sur Android (même Wi-Fi que le PC)
Double-clique sur **`Jouer sur Android.bat`** : une page d'installation s'ouvre avec l'adresse
à taper dans Chrome sur le téléphone et les étapes illustrées. Une fois « Ajouter à l'écran
d'accueil » validé, le jeu s'installe comme une application (icône de l'horloge arrêtée),
jouable ensuite **hors-ligne** grâce au service worker.

## Comment jouer

- **Objectif du chapitre 1** : quitter le Grand Hôtel de la Poste, traverser Salon, faire démarrer
  le locotracteur de la gare et rejoindre le Refuge de **Miramas-le-Vieux** par la voie ferrée.
  Il faudra une clé, une batterie (garage de la Gandonne), du gasoil... et survivre.
- **La carte** : touche une case pour la repérer, touche-la encore pour t'y rendre — une ou deux
  cases par déplacement selon ta forme, ta charge et tes blessures. Quatre échelles : pièces,
  quartier, ville, région. Les intérieurs fouillés deviennent *sécurisés* ; les rues, **jamais**.
  En intérieur, **on ne traverse pas les murs** : on circule par les couloirs, escaliers et portes
  (ou par les pièces qui communiquent vraiment — champ `passages` des cartes).
- **La fouille** : répétable jusqu'à une limite par zone ; chaque passage coûte plus de temps
  mais rapporte plus. Les trouvailles tombent *au sol* — on ramasse à la main.
- **États (pas de barres)** : douleur, fatigue, faim, soif, saignement, froid... s'affichent
  en haut à droite, façon Project Zomboid. Écoute ton corps.
- **Inventaire à double limite** : chaque objet a un *poids* (kg) et un *encombrement* (cases).
  Trop lourd = impossible de se déplacer. Sacs et vêtements à poches augmentent l'espace.
- **Accès rapide** : sans **ceinture** (puis holster, gilet...), impossible d'ouvrir le sac en
  combat — on se bat avec ce qu'on a en main. Les objets glissés à la ceinture, eux, se dégainent.
- **Combat en temps réel** : la jauge de **menace** du zombie se remplit — pleine, il attaque.
  Chaque action coûte de l'**endurance**. Épuisé ? *Se défendre* pour récupérer (mais sans bouger).
  Une arme jetée se retrouve en **fouillant** la zone après le combat (sauf si le jet a raté :
  elle peut être perdue). Tirer fait du bruit, et le bruit attire.
- **Blessures** (façon Project Zomboid) : égratignure → entaille → blessure profonde → plaie ouverte.
  Bander ce qui saigne, désinfecter, suturer les plaies profondes, antibiotiques contre l'infection.
  Chaque blessure tombe **là où le coup a porté** : un rampant mord les chevilles, un chien les
  mollets, une chute ouvre les genoux — et une jambe blessée non bandée ralentit le déplacement.
- **Le temps des gestes** : fouiller, se déplacer, se soigner, manger, dormir, fabriquer...
  chaque action affiche un court spinner, d'autant plus long que l'action mange de minutes de jeu.
- **Survie** : manger, boire (l'eau croupie se fait bouillir), dormir (en lieu sûr ou barricadé),
  se couvrir contre le froid.
- **Compétences** : force, dextérité, agilité, mains nues, visée, construction, mécanique,
  entretien, pêche/chasse — progressent à l'usage.

## Structure du code

```
index.html                 coquille de l'app
css/style.css              styles (sombre, mobile-first)
js/main.js                 démarrage, menus, panneaux (inventaire, craft, corps...)
js/state.js                état global, sauvegarde (localStorage), RNG, compétences
js/icons.js                icônes SVG de l'interface (aucun émoji)
js/world.js                accès au monde : cartes, cases, sol, fouilles
js/map.js                  cartes multi-échelles : déplacement, fouille, verrous, événements
js/combat.js               combat temps réel (jauge de menace + endurance)
js/survival.js             temps, faim/soif, blessures, maladies, sommeil, froid
js/inventory.js            inventaire (poids + espace), équipement, vêtements
js/crafting.js             fabrication
js/scenes.js               lecteur de scènes scriptées (prologue, train, fin)
js/effects.js              résolveur d'effets déclaratifs (événements & scènes)
js/audio.js                sons et musiques générés en Web Audio (remplaçables par des fichiers)
js/illustrations.js        illustrations SVG d'ambiance et de combat
js/data/*.js               contenu : objets, vêtements, recettes, zombies, lieux, événements, histoire
server.js                  mini serveur statique Node (aucune dépendance)
sw.js + manifest.webmanifest   PWA (hors-ligne + installation Android)
```

### Ajouter du contenu
- **Cartes et lieux** : schéma documenté en tête de `js/data/cartes_salon_centre.js`
  (fichiers `cartes_salon_*.js`, `cartes_region.js`, registre dans `js/data/world.js`).
- **Événements** : suivre le schéma documenté en tête de `js/data/events.js`
  (fichiers `events_rue.js`, `events_interieur.js`, `events_parc.js`).
- **Scènes du train** : schéma en tête de `js/data/story.js` (fichier `story_train.js`).
- **Objets / zombies** : ajouter une entrée dans le fichier de données correspondant.
- **Validation** : `node --input-type=module -e "import('file:///<chemin>/tools/validate_data.js')"`
  vérifie tout (liens entre cartes, connexité, ids, graphe des scènes).

## Feuille de route
- Mode 2 joueurs (prévu pour une phase ultérieure).
- Chapitre 2 (commencé) : la vie au Refuge de Miramas-le-Vieux — la citerne à remplir au triage,
  les fauves échappés du zoo de La Barben, la BA 701 silencieuse.
- Remplacement optionnel des sons synthétiques par de vrais enregistrements.
