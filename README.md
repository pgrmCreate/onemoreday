# One More Day — v3 « Un pour un »

Survival-horror **adulte** (violent, gore) en français, dans le **vrai Salon-de-Provence** et le pays salonais.
Jouable sur **PC** et **Android** (PWA, hors-ligne), **seul ou à deux**. Web pur (HTML/CSS/JS, sans build).

> Salon, trois semaines après « le Mercredi », le jour de marché où la ville s'est mise à mordre.
> Tu te réveilles dans une housse mortuaire, au cimetière Saint-Roch. Ton étiquette dit : « décès constaté le 6 septembre ».

## Les deux temps (le combat se joue DANS l'exploration)

| Temps | Ce qu'on fait |
|---|---|
| **1. Exploration — et combat** | Dans un lieu (cimetière, Tour de l'Horloge, Empéri, hôpital…) : déplacement libre vue de dessus, lampe torche, obscurité réelle, morts qui voient et entendent, fouille des meubles en temps réel, documents, personnages. **On se bat sur place, en temps réel** : se déplacer, **frapper** (appui = coup rapide, maintenir = coup chargé), **pousser**. Les morts télégraphient (arc rouge = coup, ambre = empoignade) : on recule, on pousse, on les interrompt. À deux : côte à côte, dans le même lieu. |
| **2. La carte** | Carte illustrée « plan abîmé » de Salon et du pays salonais, **positions et distances réelles** (OpenStreetMap). On choisit une destination (distance, durée, risque, allure) ; l'écran de voyage affiche **« il te reste 640 m »** et les **rencontres** surgissent en chemin. Une rencontre qui tourne mal = une **embuscade jouable** sur un bout de route. |

**Contrôles** — PC : ZQSD, le personnage regarde la souris ; clic gauche = frapper (maintenir = coup chargé),
clic droit / Espace = pousser, E = interagir, X = échanger les mains, B = dos ↔ main, R = recharger, 1-4 = accès rapide.
Mobile : joystick n'importe où, gros bouton **Frapper** + **Pousser** à droite (visée assistée vers le mort le plus proche).

**Inventaire réaliste** (façon Project Zomboid) : **main droite, main gauche, deux mains, dos** ; volume en **litres**
(sac d'écolier 20 L, randonnée 45 L ; une planche fait 14 L) + poids. Les poches ne prennent que les petits objets.
Un gros objet sanglé dans le dos pèse 25 % de moins. Une arme à deux mains tenue d'une main frappe moins fort.

**Morts** : cinq types pour l'instant — Errant·e, Coureur·se, Rampant·e, Hurleur·se, Colosse — chacun en homme ou en femme.
**Horloge** : une journée dure ≈ 40 min réelles (40 % plus lente qu'avant).

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
personnage. Chacun se déplace librement ; dans le même lieu, on se bat ensemble, en temps réel.

## Pour les développeurs

- Spécification et contrats entre modules : **`docs/REFONTE.md`**
- Histoire (bible, personnages, fins, briefs des décors) : **`docs/HISTOIRE.md`** · besoins des niveaux : `docs/NIVEAUX_BESOINS.md`
- Game design chiffré : **`docs/GAMEPLAY.md`** · tous les réglages : `js/data/reglages.js`
- Format des plans d'exploration (ASCII) : **`docs/NIVEAUX.md`** · plans : `js/data/niveaux/*.js`
- Agents Claude du projet : `.claude/agents/scenariste.md`, `.claude/agents/game-designer.md`
- Bancs d'essai : `dev/explore.html` (combat compris), `dev/carte.html`, `dev/cine.html`, `dev/ui.html`
- Vérifications : `node tools/valider_niveaux.mjs`, `node tools/verifier_gameplay.mjs`, `node tools/verifier_histoire.mjs`,
  `node dev/test_combat.mjs`, `node dev/test_ui_regles.mjs`
- Après ajout de fichiers : `node tools/generer_sw.mjs` (liste hors-ligne du service worker)

Carte : © contributeurs OpenStreetMap (ODbL). Polices : Oswald, EB Garamond, Special Elite, Caveat (OFL).
