# One More Day — v4

Survival-horror **adulte** (violent, gore) en français, dans le **vrai Salon-de-Provence** et le pays salonais.
Jouable sur **PC** et **Android** (PWA, hors-ligne), **seul ou à deux**. Web pur (HTML/CSS/JS, sans build).

> Salon, trois semaines après « le Mercredi », le jour de marché où la ville s'est mise à mordre.
> Tu te réveilles dans une housse mortuaire, au cimetière Saint-Roch. Ton étiquette dit : « décès constaté le 6 septembre ».

## Les deux temps (le combat se joue DANS l'exploration)

| Temps | Ce qu'on fait |
|---|---|
| **1. Exploration — et combat** | Dans un lieu (cimetière, Tour de l'Horloge, Empéri, hôpital…) : déplacement libre vue de dessus, lampe torche, obscurité réelle, morts qui voient et entendent, fouille des meubles en temps réel, documents, personnages. **On se bat sur place, en temps réel** : **frapper** (tape = coup rapide, 3 tapes en rythme = enchaînement, maintenir = coup chargé), **esquiver**, **pousser**, **achever** un mort à terre. Aucun raté au hasard : si le coup atteint le mort, il porte. Les morts arment leur coup (bras levés, arc rouge = coup, ambre = empoignade) puis se jettent sur toi : on esquive au dernier moment, on pousse, on les interrompt. À deux : côte à côte, on se relève l'un l'autre. |
| **2. La carte** | Carte illustrée « plan abîmé » de Salon et du pays salonais, **positions et distances réelles** (OpenStreetMap). On choisit une destination (distance, durée, risque, allure) ; l'écran de voyage affiche **« il te reste 640 m »** et les **rencontres** surgissent en chemin. Une rencontre qui tourne mal = une **embuscade jouable** sur un bout de route. |

**Contrôles** — PC : ZQSD, le personnage regarde la souris ; clic gauche = frapper (maintenir = coup chargé), Espace = esquiver,
clic droit = pousser, E = interagir, F = lampe, I = sac, Tab = plan du lieu, X = échanger les mains, B = dos ↔ main,
R = recharger, 1-4 = accès rapide, H = aide des commandes.
Mobile : joystick n'importe où, gros bouton **Frapper**, **Esquiver** et **Pousser** à droite (visée assistée).
Un **guide d'objectif** en haut de l'écran dit où aller, un losange marque l'endroit (une flèche au bord s'il est hors champ).

**Inventaire réaliste** (façon Project Zomboid) : **main droite, main gauche, deux mains, dos** ; volume en **litres**
(sac d'écolier 20 L, randonnée 45 L ; une planche fait 14 L) + poids. Les poches ne prennent que les petits objets.
Un gros objet sanglé dans le dos pèse 25 % de moins. Une arme à deux mains tenue d'une main frappe moins fort.

**Morts** : cinq types pour l'instant — Errant·e, Coureur·se, Rampant·e, Hurleur·se, Colosse — chacun en homme ou en femme.
**Horloge** : une journée dure ≈ 57 min réelles (30 % plus lente qu'en v3).
**Cartes** : couches (sol, murs, ouvertures, objets, décals, lumières) décrites en JS (`js/carte/plan.js`, voir `docs/NIVEAUX.md`) ;
le moteur dessine textures, transitions, ombres, toits vus de dehors, feux et néons qui éclairent pour de vrai.

Plus : cinématiques en parallaxe animée, scènes à choix, quêtes, 72 documents, fabrication repensée, survie (faim, soif,
fatigue, blessures localisées, « le mal »), 3 difficultés (Récit, Survie, Cauchemar = mort définitive), plusieurs fins.

## Lancer

- **PC** : double-clic sur `Lancer le jeu.bat` (Node.js), puis http://localhost:8420.
- **En ligne** : https://pgrmcreate.github.io/onemoreday/ (redéployé à chaque push sur `master`).
- **Android** : ouvrir l'adresse dans Chrome → « Ajouter à l'écran d'accueil ». Se joue en paysage.
- **Publier** : double-clic sur `Publier la mise a jour.bat` (fait un `git push origin master`).

## Jouer à deux

« Jouer à deux » → En ligne (serveur `js/data/serveur.js`) ou Même Wi-Fi. L'un **héberge** : sa machine tient le monde
(horloge, morts, portes, conteneurs, combats — *hôte-autoritaire*, plus de désynchro). L'autre **rejoint** avec son propre
personnage et **arrive auprès de l'hôte**. Chacun se déplace librement ; dans le même lieu, on se bat ensemble, en temps réel.
- **On se voit toujours** : silhouette bleue et nom au-dessus de la tête (même dans le noir), flèche au bord de l'écran,
  encart « Sam · 12 m / à l'étage / à terre ! ». Loin dans un autre lieu : bouton **Rejoindre** en bas de l'écran.
- **On se relève** : à 0 PV on tombe à terre 30 s ; l'autre te relève (E, 3 s). Personne pour te relever : c'est la mort.
- **L'histoire à deux** : drapeaux, quêtes, lieux découverts, déclencheurs et cinématiques sont partagés ; quand l'un vit
  une scène, l'autre la **suit en direct** dans un panneau sans être bloqué ; certains passages (la grille du cimetière,
  des portes lourdes) **ne s'ouvrent qu'à deux**.

## Pour les développeurs

- Spécification et contrats entre modules : **`docs/REFONTE.md`**
- Histoire (bible, personnages, fins, briefs des décors) : **`docs/HISTOIRE.md`** · besoins des niveaux : `docs/NIVEAUX_BESOINS.md`
- Game design chiffré : **`docs/GAMEPLAY.md`** · tous les réglages : `js/data/reglages.js`
- Format des plans (couches, API `js/carte/plan.js` ; ancien ASCII toujours lu) : **`docs/NIVEAUX.md`** · plans : `js/data/niveaux/*.js`
- Agents Claude du projet : `.claude/agents/scenariste.md`, `.claude/agents/game-designer.md`
- Bancs d'essai : `dev/explore.html` (combat compris), `dev/carte.html`, `dev/cine.html`, `dev/ui.html`
- Vérifications : `node tools/valider_niveaux.mjs`, `node tools/verifier_gameplay.mjs`, `node tools/verifier_histoire.mjs`,
  `node dev/test_combat.mjs`, `node dev/test_ui_regles.mjs`
- Après ajout de fichiers : `node tools/generer_sw.mjs` (liste hors-ligne du service worker)

Carte : © contributeurs OpenStreetMap (ODbL). Polices : Oswald, EB Garamond, Special Elite, Caveat (OFL).
