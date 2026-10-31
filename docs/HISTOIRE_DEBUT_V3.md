# One More Day — Le nouveau début (proposition, 26 octobre 2026)

> **Statut : validée par le propriétaire le 26 oct. 2026, et construite dans le jeu** (étapes 1 à 7). Une nouvelle partie
> commence dans le bois de la Barben et s’arrête, pour l’instant, à la porte du Refuge du Vieux-Vernègues, sur un écran
> « À suivre » (fin provisoire `debut`) : le Refuge à Vernègues et la suite de l’histoire restent à reprendre (§5).
> `docs/HISTOIRE.md` reste la bible pour tout ce qui vient après la porte.
> Origine : retours du propriétaire du 26 oct. 2026 (`docs/RETOURS_JOUEUR.md` #55 à #62).
>
> **Où c’est dans le jeu** : niveaux `js/data/niveaux/bois_barben.js` et `vigie_barben.js` ; scènes
> `js/data/histoire/scenes_debut.js` (préfixes `bb_`, `vig_`, `rv_`) ; quête `q_debut` ; missions `m_vivres` (étape
> `deposer`) et `m_camp` (étape `construire`) ; déclencheurs en tête de `declencheurs.js` ; cinématique `ouverture`
> (trois plans sur fond noir, sans vidéo) ; sentiers du pare-feu et des vignes dans `js/data/sentiers.js`.
> **Les noms** : Thierry (le conducteur, plombier à Pélissanne), Martine (sa femme), Sandrine et son fils Mathis,
> René (ancien guetteur de la vigie), Laura (étudiante à Aix, blessée à la jambe) ; Lucien Moutte, le dernier guetteur,
> qui tient la porte du Refuge.

---

## 1. Ce qui ne marchait pas, et la règle qu’on en tire

Le propriétaire a joué le début : trop de dialogues avant de jouer, un interrogatoire à la porte (« d’où tu viens ? »)
qui ne sert à rien, un puits qui ressemble à une fontaine, vingt seaux remontés d’un clic, des morts qu’on attire à
l’intérieur d’un fort, une porte qu’on ouvre comme on veut, des bandeaux « Nouvelle mission » comme dans un RPG. Il
n’a « pas du tout l’impression d’y être ».

Ce jeu est triste et il doit faire peur. On n’y gagne pas de points en accomplissant une quête. D’où ces règles, qui
valent pour tout le début (et qu’on reportera dans `RETOURS_JOUEUR.md`, P18 à P20) :

- **On fait les choses, on ne les valide pas.** Une tâche se fait par de vrais gestes dans le monde : marcher, fouiller,
  porter, construire, puiser. Aucun bouton de scène ne fait passer le temps pour accomplir une tâche à ta place (le
  sommeil mis à part). Une étape se termine quand le monde a changé : la caisse est pleine, le feu est creusé.
- **Peu de mots, et seulement quand on va vers les gens.** Pas d’interrogatoire, pas de présentation en chaîne : au
  début, une scène dure au plus trois échanges. Les personnages parlent quand on s’approche d’eux, et l’on apprend qui
  ils sont en vivant avec eux.
- **Un lieu se comporte comme ses habitants l’auraient arrangé.** Un camp a quelqu’un qui guette, un refuge habité n’a
  aucun mort dans ses murs, et l’on ne franchit pas sa porte comme on veut. Les morts viennent de quelque part (le
  bruit, la lumière), jamais de l’intérieur d’un lieu protégé.
- **Le jeu guide par les pensées du personnage.** Plus de bandeau « Nouvelle mission », « Objectif rempli » ou
  « Mission accomplie » : à la place, une courte pensée à la première personne (« J’ai soif. Cette piste doit bien
  mener quelque part. »). Le menu **Objectifs** reste, rédigé de la même façon, pour qui veut relire où il en est.
- **Pas de vidéo** tant que le propriétaire n’a pas joué l’histoire de A à Z et jugé qu’elle tient. Les scènes
  s’appuient sur des images fixes (photos) ou sur le texte seul ; les clips actuels restent rangés.

## 2. Le cadre

- **Le bois de la Barben** : la pinède et la garrigue entre Pélissanne, La Barben et Vernègues, avec ses pistes de
  pompiers (les pistes DFCI), ses pare-feu, ses vallons, un mas dans le creux, une vigie des pompiers sur la crête. Au
  sud, la vallée de la Touloubre et le château de la Barben ; au loin, Salon.
- **Le Refuge** est déplacé au **Vieux-Vernègues** : le village perché, en ruines depuis le tremblement de terre du
  11 juin 1909, avec son château écroulé et sa chapelle, au-dessus du village neuf rebâti en contrebas. Un refuge plus
  pauvre et plus triste que Miramas-le-Vieux : on y vit dans des ruines qu’on a recouvertes de bâches.
- **La secte** : un groupe qui vit ailleurs et dépouille les voyageurs (véhicules, carburant, armes, et des gens). Au
  début, on ne sait pas qu’elle existe ; on en trouve seulement les traces. Le Refuge la craint.

## 3. Le déroulé

### Avant de jouer

Pas de vidéo, pas de questions : trois phrases sur un écran noir.

> Ça fait deux jours qu’ils t’ont {ramassé|ramassée} au bord de la route de Pélissanne : six inconnus dans un fourgon de
> plombier, qui roulent tous feux éteints. Ce soir, le moteur a toussé au milieu de la forêt, puis il s’est tu.

Puis on joue tout de suite.

### Le groupe

Six personnes, qu’on connaît d’abord par ce qu’elles font (les prénoms viendront au moment de l’écriture) :
- **le conducteur**, à qui appartient le fourgon : il décide, il veut réparer et repartir ;
- **sa femme**, qui compte les provisions et ne parle qu’à lui ;
- **une mère et son fils** de dix ans ;
- **un vieux du coin**, qui connaît les pistes, le mas du vallon et la vigie, mais qui a un mauvais genou ;
- **une jeune femme blessée à la jambe**, qui jure que ce n’est pas une morsure.

Tu n’as que ce que tu portes sur toi : tes vêtements, un couteau de poche, une bouteille presque vide. Les affaires du
groupe sont dans le fourgon.

### Étape 1 — Le soir de la panne (jour 1)

La piste au milieu des pins, à la tombée du jour, le capot ouvert, et le conducteur qui jure dedans. Personne ne
t’explique rien : on entend les gens se disputer à voix basse, et l’on comprend qu’il n’y a plus rien à manger. On
dort dans le fourgon ou par terre à côté. C’est ici qu’on apprend, sans le dire, à marcher, à regarder et à dormir.

*Ajout du 27 oct. 2026 (choix du propriétaire, RETOURS_JOUEUR #66)* : René demande du bois mort pour le tas, près du
creux, avant la nuit (mission `m_bois`) ; on ramasse les branches au pied des pins, on les pose sur le tas, puis on se
trouve un coin pour dormir près de lui. On n’allume rien ce soir ; le tas servira au feu et à l’abri du lendemain.
Autour, chacun fait quelque chose (RETOURS_JOUEUR #63) : Thierry sous le capot, Martine qui compte, Mathis qui joue,
Sandrine qui le surveille, René qui veille et fait sa ronde, Laura qui ne bouge presque pas.

*Refonte du 31 oct. 2026 (demande du propriétaire, RETOURS_JOUEUR #67-70)* : le premier soir est un didacticiel. Le joueur
arrive fatigué (fatigue 42). Dans l'ordre : **fouiller le fourgon** (toujours un sac d'écolier et une bâche, plus quelques
riens tirés au sort ; mission `m_fourgon`), **le bois mort** sur le tas (`m_bois`), **un coin pour la nuit** avec un toit de
bâche et un lit de feuilles (`m_coin`), puis **dormir**. L'horloge s'arrête à 19 h 45 (`temps.TENUE_DEBUT`) et l'on ne peut
pas dormir avant la fin des objectifs. La première nuit dure jusqu'à 7 h, René veille, puis le temps redevient normal.

### Étape 2 — Manger (jour 2)

Le vieux parle d’un mas en bas du vallon, avec des vignes que personne n’a vendangées et un potager. On y descend : c’est
la première vraie exploration et le premier mort. On rapporte ce qu’on trouve dans **la caisse du camp**. L’étape se
termine quand la caisse contient assez de nourriture, sans aucun bouton. Pensée : *« Ça ne tiendra pas plus de deux
jours. »*

### Étape 3 — Construire le camp (jour 2)

Le conducteur ne trouve pas la panne ; on va rester. Avec le menu Construire et de vrais matériaux (des branches, la
vieille bâche de la remise du mas, le fil de fer d’une clôture), tu creuses un **feu caché** dans un creux (la lumière attire les morts),
tu tends **une ligne de boîtes de conserve** autour du camp et tu montes **un abri**. La nuit suivante, les boîtes
sonnent pour la première fois.

### Étape 4 — La hauteur (jour 3)

Le téléphone ne capte plus. Le vieux parle de la vigie des pompiers sur la crête, où il y a une radio. Tu y montes
seul (ou à deux, en co-op) par le pare-feu, une longue marche. De là-haut, tu vois Salon qui fume au loin, la
Touloubre, le château de la Barben, et vers le nord, sur sa colline, les ruines du Vieux-Vernègues, d’où monte un mince
filet de fumée. La vigie est vide et la radio est morte. Il reste le cahier du guetteur, et rien d’autre.

### Étape 5 — Le retour (le soir du jour 3)

Le fourgon a disparu, et la moitié du groupe avec lui : le conducteur, sa femme et la mère. Ceux qui restent :
- **le fils**, caché dans un roncier parce que sa mère le lui a dit, et qui ne veut parler qu’à toi ;
- **le vieux**, une plaie au front, qui croit qu’un mort l’a fait tomber ;
- **la blessée**, fiévreuse, qui répète que « ce n’étaient pas des morts, ils parlaient ». Mais elle a de la fièvre :
  est-ce qu’on peut la croire ? Et si c’était une morsure ?

Le joueur doit hésiter entre une attaque des morts et un abandon. La caisse de nourriture est restée, comme si on vous
l’avait laissée. Le joueur attentif trouve pourtant ce qui cloche : le fil des boîtes est **coupé net**, à la pince ;
un mort, au bord du camp, a le crâne enfoncé, donc quelqu’un l’a tué ; et dans la terre, il y a les traces de pneus d’un
**deuxième véhicule**. Il n’apprendra que plus tard qu’une secte dépouille les gens.

La nuit, le transistor du vieux capte une voix de jeune fille : *« Ici le Refuge du Vieux-Vernègues… »*. Le filet de
fumée vu de la vigie prend son sens. On ne reverra jamais le conducteur.

### Étape 6 — La route de Vernègues (jour 4)

Une dizaine de kilomètres à pied, avec un enfant, un vieux qui boite et une blessée : la campagne, les vignes, le temple
romain de Château-Bas au milieu d’un domaine, puis le village neuf de Vernègues, abandonné et plein de morts, qu’il
faut traverser ou contourner avant de monter vers les ruines. Le trajet est guidé par ce qu’on a vu de la vigie et par
le vieux, sans carte.

### Étape 7 — La porte du Refuge

Une scène courte : la lampe, « Montre tes mains », les bras qu’on retourne sous le faisceau. Personne ne demande d’où
l’on vient. La vraie question est ailleurs : **la blessée**. Ils voient sa jambe. La faire entrer, la laisser dehors,
rester dehors avec elle : c’est ici que se joue le premier choix qui fait mal.

## 4. Ce que le moteur et les lieux devront faire

1. **Les pensées à la place des bandeaux** : `js/ui/notif.js`, `js/game/missions.js`, `js/game/quetes.js` ; le menu
   Objectifs rédigé à la première personne.
2. **Un vrai puits** (margelle, poulie, seau) et **puiser** comme une action qui dure et qu’on peut interrompre, avec un
   seau et une corde (au mas, puis au Refuge).
3. **La caisse du camp** : une étape qui se termine quand un conteneur contient assez de nourriture ; une étape qui se
   termine quand certaines constructions existent (le feu, la ligne de boîtes, l’abri).
4. **L’attaque hors champ** : au retour de la vigie, le camp change d’état (le fourgon et trois personnes retirés, les
   indices posés, ceux qui restent à leur place).
5. **Nouveaux lieux** : la piste et le camp dans le bois de la Barben, le mas du vallon, la crête et la vigie, la route
   de Vernègues (Château-Bas, le village neuf), le Vieux-Vernègues (le Refuge, refait selon les règles du §1).
6. **Le départ** : l’inventaire de départ réduit à ce qu’on porte sur soi.
7. **Le bug du sommeil** : la porte d’un WC fermé, sans autre issue, ne doit plus empêcher de dormir
   (`js/game/sommeil.js`, la boucle qui compte les portes ouvertes).

## 5. Conséquences sur la suite (à revoir plus tard, avec le propriétaire)

On garde les grandes étapes (le Refuge, la frappe, la brume, le pont), mais déplacer le Refuge à Vernègues en change la
géographie :
- **la bergerie de la Crau** est désormais à vingt kilomètres : faut-il une bergerie plus proche (le plateau de
  Vernègues, le côté de Lamanon) ?
- **la frappe sur la gare de triage de Miramas** se verrait de loin ; faut-il frapper plus près (un rassemblement de
  morts autour de Salon) ?
- **le pont de Mallemort** n’est qu’à une dizaine de kilomètres de Vernègues : la tension de l’acte V doit venir
  d’ailleurs que de la distance ;
- **les personnages du Refuge** (Hélène, Fernand, Inès…) avaient leur passé à Miramas : ils déménagent avec le Refuge, et
  leur histoire est à reprendre ;
- **la secte** prend une place dans la suite.

## 6. Questions encore ouvertes (pour l’écriture, pas pour maintenant)

- Les prénoms du groupe.
- La blessée : morsure ou non, et ce qu’on en sait à la porte.
- Ce qu’écrit le guetteur dans son cahier.
- Les dates : le prologue décale le calendrier (jour 1 avancé de trois ou quatre jours).
