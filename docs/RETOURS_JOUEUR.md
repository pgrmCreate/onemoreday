# One More Day — Retours du propriétaire (carnet permanent)

> **À lire avant de concevoir ou de modifier un niveau, un système ou un texte.**
> Ce carnet garde la trace de ce que le propriétaire du jeu dit après avoir joué. On n'y efface rien : on ajoute.
> - §1 **Principes durables** : les règles tirées de ses remarques. Elles valent pour TOUT le jeu, y compris ce qui n'existe pas encore.
> - §2 **Journal des retours** : chaque retour, daté, avec sa cause probable et son statut.
> - §3 **Check-list de revue d'un niveau** : à passer avant de livrer un plan (nouveau ou refait).
> - §4 **Cahiers des charges de refonte** (Tour de l'Horloge, Empéri, Saint-Laurent).
> - §5 à §7 : sommeil selon le couchage (chiffres complets : `docs/GAMEPLAY.md` §5.7), carte locale, tri quand on manque de place.
> - §8 : ce que le moteur doit apprendre à faire pour appliquer tout ça.
>
> Statuts : **à faire** · **en cours** · **fait** (date, commit) · **abandonné** (pourquoi). 1 unité = 0,8 m ; marche = 3,2 unités/s.

---

## 1. Principes durables

### P1. La taille d'un lieu se justifie par sa fonction
- **En ville**, le vaste est normal : rues, places, quartiers, on n'a aucune raison d'y être bloqué. Les abords générés
  (×4, `js/carte/abords.js`) servent à ça.
- **Partout ailleurs**, et pour tout **lieu clé de l'histoire** (monument, château, église, hôpital, campement), le plan a
  la taille de ce qu'il contient, pas plus. Un petit campement, c'est un feu de camp au milieu d'une clairière, deux
  tentes, un tas de bois : pas de maisons autour.
- **Mesure** : hors ville, jamais plus d'environ **30 unités (24 m, ~10 s de marche)** sans quelque chose à voir ou à faire :
  pièce nommée, personnage, objet d'histoire, conteneur intéressant, repère visuel. Une pièce sans fonction est supprimée
  ou fusionnée avec sa voisine.
- **Abords** : `abords: false` pour les lieux clés et pour tout lieu hors de la ville. Un lieu clé en ville peut garder
  une petite bande de rues autour de lui, mais le cœur doit se suffire.

| Type de lieu | Taille cible du cœur (unités) | Abords |
|---|---|---|
| Campement, abri isolé | 20 × 16 à 30 × 24 | non |
| Maison, commerce | le bâtiment + sa rue (≈ 25 × 20) | oui (ville) |
| Monument, église, château (lieu clé) | le bâtiment + son parvis ou sa cour (40 × 30 à 72 × 50) | non, ou une rue |
| Quartier, cité, zone commerciale | grand (jusqu'à 300 × 200) | oui |

### P2. Le peuplement est cohérent avec l'histoire
- **Un personnage vivant a une raison visible d'être vivant** : une seule porte barrée de l'intérieur, une barricade, des
  gardes, une hauteur sans accès, une échelle retirée. Cette raison **se voit sur la carte** (planches, barre de chêne,
  guetteur sur le rempart) et **se dit** en une phrase quelque part (scène, document, message de porte).
- **Là où des vivants habitent, aucun mort procédural** : ni dans les pièces habitées, ni dans les étages qu'ils tiennent.
  Les morts « du lieu » (`lieux_gameplay.morts`, `repeuplement`) vont dehors, dans les abords, ou dans les zones que
  l'histoire dit infestées. Les morts procéduraux préfèrent les pièces sombres : un refuge sombre les attire, il faut
  donc l'interdire explicitement.
- **Les morts scénarisés suivent l'histoire** (condition `si`) : une foule n'est là qu'après la scène qui l'appelle ;
  quand un refuge tombe, les vivants disparaissent et les morts entrent.
- **Un lieu a un « avant » et un « après »** quand l'histoire le change. Le plan prévoit les deux états.

### P3. Des personnages et des traces de vie
- **Refuge habité** : au moins un personnage qui parle, et des **figurants** (silhouettes humaines non interactives, ou à
  une seule réplique) en nombre crédible, **au moins un par pièce habitée** ; un feu ou une lumière ; des couchages ; des
  réserves ; des règles écrites.
- **Lieu abandonné** : au moins **trois traces lisibles** qui racontent ce qui s'est passé : couchage, feu éteint,
  message écrit, corps récent, barricade, réserves vidées.
- **Lieu ordinaire** : au moins une trace.
- Les figurants ne se battent pas et les morts ne les ciblent pas (sauf si une scène le décide).

### P4. Toute porte visible mène quelque part, ou le jeu dit pourquoi pas
- **Une porte qui ne s'ouvrira jamais n'est pas une porte** : c'est un mur, une grille de décor, ou une porte murée
  dessinée comme telle. Si l'histoire tient à une porte close, elle **dit pourquoi** au premier essai.
- **Une porte fermée à clé dit ce qu'il faut**, et où le trouver si le personnage peut le savoir : « Fermée à clé. Le
  curé gardait ses clés sur lui. »
- **Une porte à drapeau** laisse comprendre ce qui l'ouvrira : « Barrée de l'intérieur. Quelqu'un, là-haut, peut t'ouvrir. »
- **Ouvrir une porte, c'est pouvoir passer** : derrière chaque porte, au moins **2 unités (1,6 m) de profondeur libres**
  sur la largeur de la porte, **aucun meuble collé au seuil, même en diagonale**.

### P5. Une clé s'ouvre près de là où on la trouve, ou le jeu dit où
- Clé et porte dans **la même zone**, à **12 unités au plus**, idéalement **en vue** l'une de l'autre.
- Si la porte est loin, la clé le dit (nom, étiquette, phrase de scène) **et** la porte a déjà été vue avant.
- On peut essayer la porte avant d'avoir la clé : le message relie les deux.
- Le trajet clé → porte **ne retraverse jamais** la zone dangereuse qu'on vient de franchir, sauf si une scène en fait
  explicitement l'enjeu.

### P6. La verticalité est lisible
- **Un escalier se reconnaît du premier coup** : marches dessinées (au moins 4 visibles), flèche ▲ ou ▼, et à l'approche
  le libellé « Monter : Salle de l'horloge (1er étage) » ou « Descendre : Rez-de-chaussée ».
- Tailles minimales : **escalier droit 2 × 3 unités**, **escalier à vis 2 × 2** (dessiné en spirale). Jamais une case
  isolée qui ressemble à des dalles.
- **Échelle** : montants et barreaux dessinés, libellé « Grimper ».
- Les escaliers d'une même cage sont **aux mêmes coordonnées** d'un étage à l'autre.
- **Pas d'étage-couloir** : chaque étage a une fonction (une pièce, une scène, un objet d'histoire).

### P7. On sait toujours où on est
- Une **carte locale** se dévoile au fur et à mesure (§6).
- Chaque pièce a un **nom affiché** quand on y entre ; chaque zone a un **repère fort** visible de loin (fontaine, feu,
  autel, cloche, grue).
- Une sortie **se voit** (flèche dorée) et **dit où elle mène**.

### P8. On ne perd jamais un objet sans l'avoir choisi
Rien ne tombe par terre ni ne disparaît sans que le joueur l'ait décidé (§7).

### P9. Les textes d'interface sont clairs
`docs/CHARTE_ECRITURE.md` règle le récit. Pour **tout texte d'interface** (toasts, messages d'exploration, libellés de
boutons, aides, fenêtres) on ajoute :
1. **Une phrase complète**, sujet et verbe. Pas de style télégraphique : « Construction : arrêtée. » → « Tu arrêtes la
   construction. » ; « Semé. Dans trois jours, de quoi manger. » → « C'est semé. Dans trois jours, tu pourras récolter. »
2. **La cause, puis ce qu'on peut faire** : « Fermée à clé. Le curé gardait ses clés sur lui. »
3. **Une idée par phrase.** Pas de parenthèse ni de tiret pour caser une deuxième idée : on fait deux phrases.
   « Le feu reprend (planche). » → « Tu ajoutes une planche. Le feu reprend. »
4. **Pas de métaphore** dans un message d'interface. Le récit en a, l'interface non.
5. **Touches clavier sur PC seulement**, nom du bouton sur mobile : « Vide. Recharge (R / bouton Recharger) — ou frappe à
   la crosse. » → PC : « Vide. Recharge avec R, ou frappe à la crosse. » ; mobile : « Vide. Touche Recharger, ou frappe
   à la crosse. »
6. **Accords de genre partout**, y compris dans les messages générés : « Trop lourd pour toi seul. » → « Trop lourd pour
   toi {seul|seule}. »
7. **Un mot par chose**, toujours le même : « mort » (jamais « zombie »), « sac », « dos », « ceinture », « fouiller »,
   « par terre ». Si un terme change, il change partout.
8. **Court** : un toast tient en 90 caractères, soit deux lignes sur un téléphone.
9. **Relire à voix haute.** Si on bute, on réécrit.

### P10. Le danger est annoncé avant d'être appliqué
Toute règle qui peut blesser ou tuer est **dite au moment où elle compte** (« Ta lampe allumée devant eux les
réveille. ») et **se voit à l'écran** (le « ? » qui se remplit au-dessus d'un mort). Le joueur comprend toujours
pourquoi il a été repéré.

### P11. Le confort se mérite, sans punir
Dormir, se chauffer, s'abriter : partout c'est possible, mais un vrai couchage, un feu, un toit changent nettement les
choses (§5). La préparation est récompensée ; l'improvisation coûte, sans jamais bloquer.

### P12. Une mission impose une façon de jouer, pas un nombre de morts
Ce qui plaît à Saint-Laurent, ce n'est pas la foule : c'est qu'on est **obligé** de faire quelque chose de précis (se
taire, avancer en discrétion, faire un geste exact), puis que l'action éclate d'un coup.
- **Chaque mission a une contrainte qui change la manière de jouer** : discrétion, durée, protection, approvisionnement,
  nettoyage. Deux missions qui se jouent pareil sont une seule mission.
- **Varier les types** : éliminer (débarrasser un quartier), tenir (survivre N heures ou N jours dans un endroit),
  attendre (un signal, une heure, quelqu'un), protéger (un vivant qui peut mourir), nourrir (apporter à manger à
  quelqu'un, par exemple une personne cachée dans la nature, plusieurs fois), atteindre en discrétion, rapporter.
- **Un temps calme, puis une rupture** : la tension monte par la contrainte, l'action arrive quand elle cède.
- **L'avancement se sent sans se compter** : « Il en reste encore. », « Le quartier est presque calme. » plutôt qu'un
  compteur exact, sauf si le personnage peut savoir le nombre.
- **Un objectif rempli se notifie** : un bandeau bref « Objectif rempli », une phrase complète (P9), sans bloquer le jeu.

### P13. Le corps se gère petit à petit
Comme dans Project Zomboid, les besoins du corps se règlent dans la durée, pas d'un geste.
- **Manger prend du temps** : une action chronométrée, avec sa progression visible, qu'on peut interrompre (un mort
  approche) en gardant ce qui reste.
- **On ne se gave pas** : l'estomac se remplit et se vide. Quand on n'a plus faim, on est **repu**, et on ne peut pas
  enchaîner trois boîtes de soupe.
- **Le poids du corps** bouge lentement : on maigrit quand on a faim, on grossit quand on mange trop. Trop maigre ou trop
  enrobé, le corps le paie (force, endurance, froid), avec des seuils dits par un état lisible, sans chiffre imposé.

### P14. Ce que le personnage porte se voit sur lui
- Tout objet tenu en main est **lisible à l'écran** à la taille normale du jeu, sans être grossi au point de mentir sur
  sa taille (la pelle).
- Ce qui est **dans le dos** se dessine sur le personnage ; un sac se porte **dans le dos**, décalé seulement autant que
  son modèle le justifie.
- Les **vêtements se superposent** de façon réaliste : t-shirt, pull et veste en même temps sur le torse.

---

## 2. Journal des retours

### 7 octobre 2026 — partie du propriétaire (prologue et chapitre 1)

| # | Ce qu'il dit | Cause probable (analyse du 7 oct.) | Décision | Statut |
|---|---|---|---|---|
| 1 | Certaines phrases et explications sont en français bizarre, on ne comprend pas bien. | La charte ne couvrait que le récit. Les messages d'interface sont souvent télégraphiques (« Construction : arrêtée. »), mêlent touches clavier et boutons, glissent une deuxième idée entre parenthèses, oublient les accords (« Trop lourd pour toi seul. »). | P9. Passe de relecture de tous les messages de `js/explore/*.js`, `js/game/*.js`, `js/ui/**/*.js`. | partiel (8 oct.) : messages du sac, du sommeil, des escaliers, des portes et du tri réécrits ; relecture complète à faire avec des exemples du propriétaire |
| 2a | Tour de l'Horloge : la cuisine est inaccessible, on ouvre la porte et on ne peut pas passer. | **Non reproduit par l'analyse statique** : dans les plans compilés (abords compris), toutes les portes de la tour ont leurs deux côtés atteignables au gabarit du joueur (rayon 0,3 unité). Hypothèses : une maison générée des abords (la fonction `maison()` d'`abords.js` n'interdit un meuble qu'au contact direct d'une porte, pas en diagonale ni à deux cases) ; ou le Café de la Fontaine (une seule pièce, placards collés au mur du fond). | Reproduire en jeu (`dev/explore.html?lieu=tour_horloge`). Appliquer P4 (2 unités libres derrière toute porte) au générateur d'abords et à la check-list. Café refait avec une vraie arrière-cuisine (§4.1). | fait (8 oct.) : cause trouvée dans `abords.js` — la porte d’une maison pouvait tomber pile en face de sa cloison intérieure ; corrigé, et Café refait avec son arrière-cuisine |
| 2b | Il y a un personnage dans la tour, et en même temps plein de morts partout dedans : incohérent. | Trois causes. (1) `lieux_gameplay.tour_horloge.morts.n = [0, 2]` écrase le `[0, 0]` du plan (le lieu passe avant le plan dans `vue.js`), puis ×3 à cause des abords ; les morts procéduraux préfèrent les pièces sombres, et toute la tour est `sombre: 2`. (2) La foule de la place porte `si: { flag: 'pro_signal' }`, mais le moteur ignore `si` pour les morts : 19 morts sont là dès l'arrivée, et pour toujours. (3) `repeuplement: 0.2`. | P2. Tour = sanctuaire sans mort ; foule conditionnelle (§4.1, §8). | fait (8 oct.) : tour sans mort (`sansMorts`, `mortsDehorsSeulement`, `morts [0, 0]`), morts conditionnels (`si`) réévalués chaque seconde |
| 2c | La façon de grimper (des « dalles en bois ») est incompréhensible. | Escaliers d'une seule unité (`<`, `>`), dessinés par `marche()` (`js/rendu/murs.js`) en deux lattes brunes par petite case : quatre rectangles qui ressemblent à des dalles. Ni flèche ni libellé. Un étage entier (`e2`) nommé « L'escalier à vis » est en fait une pièce vide de 10 × 8. | P6. Rendu des escaliers refait (§8) ; escalier à vis aligné sur tous les étages (§4.1). | fait (8 oct.) : escaliers dessinés d’un bloc (marches, limons, flèche) ; bouton « Monter : <étage> » ; colonne 2 × 4 alignée |
| 3 | Les grandes zones de brouillard, c'est bien, mais une fois explorées on ne s'y repère pas. Il veut une carte locale du lieu qui se dévoile, en plus de la carte de Salon. | Le « plan du lieu » existe (touche Tab, `dessinerCarte` de `js/rendu/rendu.js`) mais : pas de bouton sur mobile ; toute la carte (160 × 116 pour la tour, 240 × 160 pour l'Empéri) est réduite à l'écran, donc illisible ; ni noms de pièces, ni escaliers, ni autres étages ; mémoire perdue en quittant le lieu. | §6. | fait (8 oct.) : `js/explore/plan_lieu.js` — bouton Plan + Tab/M, cadré sur l’exploré, noms de pièces, escaliers, sorties, allié, onglets d’étages, mémoire sauvegardée. Reste : portes verrouillées, repères, plans muraux, zoom au doigt |
| 4 | L'Empéri est énorme, vide, sans personnage ; on ne comprend pas ce qu'on y fait. « Des lieux vastes, oui, mais il faut que ça ait un sens. » Plus de personnages, de survivants, de traces de vie. | Le château (60 × 40) est posé au centre d'une ville générée de 240 × 160 (75 s de marche d'un bord à l'autre). Un seul personnage visible (Vidal, et seulement après `emp_entree_ok`) alors que l'histoire en annonce 25 (19 élèves, 6 adultes). Avant la quête, rien n'explique la porte fermée. Anneau complet de remparts et cinq salles de musée sans rôle. `lieux_gameplay.emperi.morts.n = [2, 5]` ×3 : 6 à 15 morts procéduraux placés… dans les pièces sombres du refuge. | P1, P2, P3. Refonte complète (§4.2). | fait (8 oct.) : Empéri refait (72 × 50, sans abords), 16 figurants avec répliques, porte qui explique pourquoi elle est fermée |
| 5a | L'église : il adore se cacher parmi des morts qui dorment ; il faut dire clairement que la lumière de la lampe peut les réveiller. | Le moteur fait déjà qu'un mort `immobile` qui te voit avec une lampe allumée te repère à 1,8 fois sa vue, même dans le noir ; un mort `dort` ignore complètement la lumière. Rien ne le dit au joueur. | P10. Le dire (scène et aide), le montrer (« ? »), et une règle « faisceau qui réveille » pour les dormeurs (§4.3, §8). | fait (8 oct.) : phrase dans `stl_nef` + règle `FAISCEAU_REVEIL` (dormeurs ET morts de dos éclairés à ≤ 3,5 u). Reste : le « ? » qui se remplit |
| 5b | La clé du prêtre n'a pas de sens : on la prend sur l'autel, et la porte qu'elle ouvre est à l'autre bout, il a dû refaire tout le tour. | Collégiale Saint-Laurent (`saint_laurent.js`). La clé est au chœur (est) ; Lou est dans le clocher, au pied de la nef **côté entrée** (ouest) : si l'on prend la clé d'abord, il faut retraverser la nef deux fois. Et près de l'entrée, la grille de la chapelle de la Vierge est une porte verrouillée par un drapeau jamais posé (`grille_vierge_scellee`) : elle ressemble à la porte de la clé. | P4, P5. Tout regrouper autour du chœur (§4.3). | fait (8 oct.) : Saint-Laurent refait autour du chœur ; grille de la Vierge avec son message |
| 6 | Le 4×4 : quand on prend le contenu sans avoir la place, le surplus tombe par terre sans qu'on puisse trier. | Rencontre de voyage `rv_alarme_voiture` (`rencontres_scenes.js`) : objets donnés pendant le voyage, surplus abandonné sans choix. L'onglet « À trier » est en cours d'implémentation (`siPlein: 'tri'`). En exploration, ramasser avec un sac plein affiche « plus de place, posé au sol » (`js/explore/butin.js`), ce qui laisse croire que l'objet a bougé. | P8, §7. | fait (8 oct.) : onglet « À trier » du sac (prendre, porter, laisser 1 / tout, Terminé) ouvert à la fin de la scène. Reste : « Consommer ici », confirmation avant d’abandonner, partage en co-op |
| 7 | Le sommeil doit dépendre du couchage, façon Project Zomboid. Par terre on ne récupère pas, on se réveille avec des douleurs. | Un seul bonus « lit » (+4 de fatigue par heure, codé en dur dans `js/game/sommeil.js`) ; dormir par terre récupère presque comme dans un lit. | P11. `GAMEPLAY.md` §5.7, résumé §5. | fait (8 oct.) : §5.7 implémenté (4 couchages, plafond, courbatures, froid, `sac_couchage`, `couverture`, `lit_camp`, `matelas`) |
| 8 | Appui long qui clique « Fermer » ; onglets du sac qui cassent au défilement horizontal. | Bugs d'interface. | Corrigés directement par l'agent principal. | fait (8 oct.) : clic fantôme bloqué (`js/ui/tap.js`), types du sac en colonne verticale, fiche plus étroite |

### 8 octobre 2026 (après-midi) — carte du lieu, combat, voitures, sacs

| # | Ce qu'il dit | Cause probable | Décision | Statut |
|---|---|---|---|---|
| 9 | Sur la petite carte du lieu, le bouton « Fermer » est caché par le menu de navigation du haut. | Le HUD général (`.ui-hud`, z-index 40, fixe) passe au-dessus de l'écran d'exploration (#stage, z-index 1) et donc du plan. | Le HUD général est masqué tant que le plan est ouvert (`body.plan-lieu-ouvert`) ; le plan passe aussi au-dessus de la fenêtre de fouille. | fait (8 oct.) |
| 10 | La carte doit s'ouvrir centrée sur le joueur, avec 3 niveaux de zoom, et on doit pouvoir s'y déplacer pour tout voir. | Le plan était cadré d'office sur toute la partie explorée, sans zoom ni déplacement. | §6 : centré sur toi au cran moyen ; 3 crans (boutons + / −, molette, pincer, touches + / −) ; glisser au doigt ou à la souris (flèches au clavier) ; bouton « Me recentrer ». Le plan suit ta position tant que tu ne l'as pas fait glisser. | fait (8 oct.) |
| 11 | Attaquer fait du bruit ; attaquer accroupi n'en fait pas, mais les coups sont moins forts. | Seul un coup qui portait faisait du bruit, et à mains nues il était presque muet (1,5 case). | `combat.BRUIT_ATTAQUE` : au moins 4 cases quand le coup porte, 2,5 dans le vide ; accroupi(e) : aucun bruit, dégâts × 0,7 (`combat.ACCROUPI`). La mise à mort furtive reste silencieuse. | fait (8 oct.) |
| 12 | Pousser, attaquer et courir coûtent de l'endurance ; sans endurance, on ne peut plus ni attaquer, ni courir, ni pousser. | Les coups partaient même à 0 d'endurance (seulement plus faibles et plus lents). | `combat.ENDURANCE.MIN_ACTION` (4) : en dessous, ni coup ni poussée (le bouton affiche « À bout », un message le dit) ; la course s'arrêtait déjà (`COURSE_STA_MIN`). Seule la lutte contre une empoignade reste possible, pour ne pas condamner le joueur. | fait (8 oct.) |
| 13 | Pouvoir faire un sac de base avec des tissus ou un drap. | Le « sac de fortune » existait, mais demandait une corde en plus des chiffons. | Baluchon (12 L) noué avec un drap ou une couverture, sans rien d'autre ; sac de fortune faisable avec 6 chiffons seuls (plus long qu'avec une corde). | fait (8 oct.) |
| 14 | Certaines voitures ne s'ouvrent qu'en cassant une vitre ; casser une vitre peut déclencher une alarme qui rameute les morts autour. | Toutes les voitures fouillables s'ouvraient. | `js/data/voitures.js` : part fermée à clé et chance d'alarme par modèle (graine du lieu, la même pour les deux joueurs ; jamais une voiture qui porte un objet de l'histoire). « Casser une vitre » (1,6 s, bruit 12, risque de s'entailler la main à mains nues) ou « Forcer la portière » au pied-de-biche (7 s, discret, alarme 2,5 fois plus rare). L'alarme hurle 45 s : un bruit de 30 cases chaque seconde, entendu de loin. | fait (8 oct.) — son d'alarme synthétisé, à remplacer par un vrai enregistrement choisi à l'écoute |
| 15 | Il faut d'autres types de voitures. | Berline, camionnette, ambulance et camion militaire seulement. | Citadine, break, 4 × 4, pick-up, voiture de gendarmerie, camping-car : sprites Blender, dessin de repli, butin propre (trousse de la gendarmerie, placard du camping-car, benne du pick-up). Les abords tirent le modèle selon le milieu, sans changer le plan (sauvegardes valables). | fait (8 oct.) |
| 16 | En prenant un sac plus petit, on peut dépasser la limite : le surplus doit être posé par terre. | `equiper` changeait de sac sans vérifier ce qui tenait encore. | `inventory.deborder` : ce qui ne tient plus (les plus gros objets d'abord) est posé au sol, à tes pieds, et un message dit quoi ; pareil en retirant son sac ou un vêtement à poches. Conforme à P8 : c'est le joueur qui change de sac, et rien ne disparaît. | fait (8 oct.) |
| 17 | Pendant une alarme, faire venir des morts de l'extérieur de la carte (par les sorties), au hasard, selon la dangerosité du lieu et le contexte. | Les morts d'un lieu étaient tous placés à l'arrivée ; seul le bruit déplaçait ceux qui étaient déjà là. | `exploration.ARRIVEES` + `sim.tickArrivees` : chaque seconde, une chance qu'un mort entre par une sortie cachée du joueur (à plus de 12 unités et hors de sa vue). Taux selon le contexte (calme, gros bruit récent, sirènes ou horde, alarme) × danger du lieu × nuit × difficulté. Pendant une alarme, ils arrivent alertés, du côté de la voiture, et marchent jusqu'à elle (2 à 8 morts par alarme selon le danger). Hors alarme, plafond à 1,2 × la population de départ. Pas dans les arènes ni par une pièce sûre. | fait (8 oct.) — mesuré à la gare : alarme 2 (danger 0,2) à 5 (danger 0,9) morts en une minute ; coup de feu 0,3 à 0,8 |
| 18 | Le surlignage orange de certains meubles (armoires…) est un gros carré alors que le meuble dessiné est petit. | Un plan pose souvent un objet sur une empreinte qui n'a pas ses proportions (comptoir de 5 × 1, bus de 10 × 2 dessiné comme une voiture de 3 × 2, armoire sur une seule case) : le dessin se réduisait pour les garder, le surlignage et la collision prenaient toute l'empreinte. Environ 2 000 objets concernés dans les 49 plans. | Une règle unique, `disposition()` dans `js/carte/catalogue.js`, suivie par le compilateur (collision, surlignage), le rendu (dessin) et les ombres : proportions proches → le dessin s'étire ; objet de rang (bancs, étagères, gravats, frigos, comptoirs…) → plusieurs exemplaires côte à côte qui remplissent l'empreinte ; objet unique (véhicule, baignoire, autel…) ou exemplaire trop petit → dessin centré (tourné d'un quart s'il remplit mieux), et l'empreinte réelle réduite à ce qui est dessiné. | fait (8 oct.) — vérifié : sur 19 433 objets bloquants, aucune collision ne dépasse plus le dessin |
| 19 | Dans l'église, on est parfois bloqué par des objets invisibles. | Même cause : les 26 rangées de bancs de Saint-Laurent (3 unités de long) étaient dessinées sur 2 unités, le dernier tiers bloquait sans rien montrer ; même chose pour l'autel et le caveau. Aucun autre blocage invisible trouvé dans les plans (hors quelques coins de murs isolés et les berges volontairement fermées de Mallemort). | Corrigé par la règle de la ligne 18 : les bancs sont dessinés sur toute leur longueur, l'autel est tourné pour remplir le chœur. | fait (8 oct.) |
| 20 | Casser une vitre : pas besoin de message (« le bruit porte loin »), juste le son ; l'alarme : le son, et de la lumière tout le temps qu'elle dure, phares qui clignotent. | Messages ajoutés le 8 oct. | Plus de message (sauf une coupure à la main, qui est une blessure). Pendant l'alarme, phares et clignotants battent ≈ 1 fois par seconde : deux vrais faisceaux qui éclairent la rue et la lueur des quatre feux (`vue.feuxAlarmes`, rendu). | fait (8 oct.) |
| 21 | À l'alarme, aucun mort ne vient : tous les morts du coin doivent se ramener, et il doit en arriver d'autres. | Mesuré : la plupart des morts étaient à plus de 60 unités ; les murs étouffaient le bruit (rayon 30) ; et un mort alerté ne cherche son chemin qu'à 50 unités : au-delà, il restait planté. | `sim.appelAlarme` : chaque seconde, tous les morts à ≤ 100 unités (murs ou pas, même endormis) marchent vers la voiture jusqu'à 20 s après la fin ; recherche de chemin « au plus près » quand la cible est trop loin. Les arrivées par les bords (ligne 17) s'y ajoutent. | fait (8 oct.) |
| 22 | Une migration : dire juste que c'est dangereux, « forte migration », et le niveau de danger inconnu (on entend les morts au loin, on ne sait pas où ils sont). La radio permet de savoir plusieurs jours à l'avance. | Le risque du trajet restait chiffré pendant les sirènes ; la radio ne prévenait que 8 à 12 h avant. | Carte : pendant une migration connue (sirènes, ou horde annoncée / vécue) sur le trajet ou à l'arrivée, la jauge devient « ? ? ? ? ? », risque « inconnu », raison « forte migration ». La radio annonce les sirènes ~2 jours et demi avant, les hordes ~2 jours avant (`ruees.ANNONCE_RADIO_H`, `HORDE.ANNONCE_H`) ; les événements sont prévus assez tôt pour ça. | fait (8 oct.) |
| 23 | Une notion de date, pas seulement jour / nuit. | Seul « Jour N » était affiché. | Jour 1 = mercredi 23 septembre 2026 (`temps.DATE_JOUR1`, `clock.dateTexte`) : « Jour 3 · ven. 25 sept. » dans le HUD, la carte et le voyage ; « Jour 3 — vendredi 25 septembre » dans le journal. | fait (8 oct.) |
| 24 | Carte : le bouton Partir hors de la colonne, collé en bas de l'écran au centre ; il n'existe que quand un lieu est choisi. | Il était au bas de la fiche. | `.carte-partir` : en bas au centre, recréé à chaque lieu choisi, retiré quand la fiche se ferme. | fait (8 oct.) |
| 25 | En arrivant dans un lieu, on apparaît au milieu, pas par où l'on arrive. | L'arrivée utilisait toujours l'entrée par défaut du plan. | `vue.arriveeParSortie` : la sortie du bord d'où vient la route (dernier point de l'itinéraire), deux unités à l'intérieur, tourné vers le centre ; « Rester ici » ramène à la sortie qu'on avait prise. | fait (8 oct.) |
| 26 | Tour de l'Horloge : on arrive à 8 h et d'un coup c'est le soir. Il faudrait n'y aller que le soir, et que l'objectif le dise. | La scène et la cinématique de la tour sont de nuit (le mot de Maud : « je guette tous les soirs »), quelle que soit l'heure. | Étape `q_prologue.horloge` : objectif « Attendre le soir, puis rejoindre la Tour… » ; la carte n'y mène qu'entre 19 h et 5 h (`heures` d'une étape de quête, générique) et propose « Attendre 19 h ». | fait (8 oct.) |
| 27 | Les voitures de police : impossible de les fouiller ou de casser une vitre. | Les voitures « déjà fouillées » des rues (8 sur 10) n'étaient pas des conteneurs : aucune action proposée. | Elles deviennent « pillées » : ouvertes, fouillables, presque vides (`defaut.voiture_pillee`). | fait (8 oct.) |

### 9 octobre 2026 — missions, repas, poids du corps, ce qu'on porte

| # | Ce qu'il dit | Cause probable | Décision (session de code du 9 oct.) | Statut |
|---|---|---|---|---|
| 28 | Il a aimé Saint-Laurent (`saint_laurent.js`, scènes `stl_*` de `scenes_ch1.js`) non pour le nombre de morts, mais parce qu'on est obligé de faire quelque chose de précis : être discret, se déplacer en discrétion, faire un geste exact… et d'un coup, l'action. Il veut des missions de ce genre, de types vraiment différents : débarrasser un quartier (« il en reste encore », sans forcément le nombre), survivre trois jours quelque part, attendre, protéger quelqu'un, nourrir quelqu'un (une personne cachée dans la nature). | Les quêtes ne savent dire que « aller à », « parler à », « trouver » : la contrainte de Saint-Laurent est écrite à la main dans un seul niveau, sans moteur pour la réutiliser. | P12. Moteur de missions à **objectifs typés** : `eliminer`, `tenir` (N minutes ou N jours), `attendre`, `proteger`, `nourrir`, `atteindre` en discrétion, `rapporter`. Avancement en phrases (« Il en reste encore. ») plutôt qu'en compteur. | en cours |
| 29 | Il faut une notification quand on remplit un objectif. | Une étape de quête passe à la suivante sans rien signaler. | P12. Bandeau « Objectif rempli » bref, sans pause, phrase complète (P9). | en cours |
| 30 | Manger doit prendre du temps (on voit la progression) ; on ne peut pas se gaver (pas trois boîtes de soupe d'affilée) ; on mange petit à petit comme dans Project Zomboid, et quand on n'a plus faim, on est repu. | Manger est instantané et la faim n'a pas de plafond par repas. | P13. Repas = **action chronométrée interruptible** (la part non mangée reste) ; **estomac** qui se remplit et se vide ; état « Repu » qui empêche de continuer. | en cours |
| 31 | Ajouter le poids du corps : on en perd quand on a faim, on en prend si on mange trop ; effets quand on est trop maigre ou trop enrobé. | Aucune notion de poids corporel. | P13. Poids du corps à **seuils relatifs** : émacié, maigre, normal, enrobé, obèse, chacun avec ses effets ; évolution lente, dite par un état. | en cours |
| 32 | La pelle en main est presque invisible : la rendre plus visible sans qu'elle soit trop grande. | Dessin trop fin à l'échelle du jeu. | P14. Pelle redessinée plus lisible (contraste, épaisseur), à sa taille. | en cours |
| 33 | Afficher sur le personnage les objets portés dans le dos (emplacement « dos »). | L'emplacement « dos » n'est pas dessiné. | P14. Objet du dos dessiné sur le personnage. | en cours |
| 34 | Les sacs sont encore trop sur le côté : les mettre plus dans le dos (pas forcément au centre, selon le sac). | Décalage latéral trop fort et commun à tous les sacs. | P14. Position du sac rapprochée du dos, réglée par modèle. | en cours |
| 35 | Vêtements en couches : porter un t-shirt, un pull **et** une veste en même temps. | Un seul emplacement pour le haut du corps. | P14. Torse découpé en **3 couches** : haut, pull, veste. | en cours |

### 10 octobre 2026 — la loge et la grille du cimetière

| # | Ce qu'il dit | Cause probable | Décision (session de code du 10 oct.) | Statut |
|---|---|---|---|---|
| 36 | Le gardien de la loge doit être un cadavre, un simple élément du décor qu'on ne peut pas tuer ; il se réveille obligatoirement quand on prend la clé, sans action de discrétion possible. Revoir la scène en conséquence. | Le gardien était un mort du plan qui « dort » : on pouvait le tuer avant, et le test d'agilité des punaises laissait la clé sans le réveiller. | P2, P10. Corps de décor `gardien_mort` (masqué au drapeau `pro_cle_prise`) + mort conditionnel `reveil` qui se lève à sa place, même sous ton nez. Scène réécrite : la clé est nouée à son poignet par une ficelle, la décrocher le relève (`pro_loge_reveil`). Plus de test d'agilité. | fait |
| 37 | Pour la grille, il faut se placer une case avant la porte pour l'examiner, puis s'y coller pour l'ouvrir : c'est bizarre. Collé à la grille, on doit pouvoir l'examiner **et** l'ouvrir, comme une porte. | Le marqueur de la scène était posé une case devant la grille, pas sur elle. | P4. Marqueur sur la porte même : E = « Examiner la grille », le menu des actions propose « Ouvrir la grille principale » (à la clé, ou « fermée à clé : il faudrait la clé du gardien »). Ouvrir à la clé applique les mêmes effets que la scène (`verrou.effets`). | fait |

### 10 octobre 2026 (suite) — mains en bas, heure et date à mériter

| # | Ce qu'il dit | Cause probable | Décision (session de code du 10 oct.) | Statut |
|---|---|---|---|---|
| 38 | La barre des mains (main droite, gauche, dos, ceinture) doit aller en bas à gauche, juste à droite du zoom et du bouton du plan, collée en bas. | Elle était en haut à droite, loin des autres repères d'exploration. | `.ex-mains` en bas à gauche (left 54 px, bottom 6 px) ; ceinture sur deux rangs pour ne pas dépasser la hauteur des mains ; vie et souffle remontés juste au-dessus ; invite « E » remontée à 60 px. | fait |
| 39 | La date ne doit plus être affichée en permanence en haut à gauche, mais dans le Menu ; en haut à gauche, seulement le lieu et l'heure. | Le HUD montrait « Jour N · date » à côté de l'heure. | HUD : heure + lieu seulement. Menu (onglet Réglages) : section « Aujourd'hui » avec le jour, la date et l'heure. | fait |
| 40 | Pour avoir l'heure, il faut une montre qu'on enfile ; une montre digitale donne aussi la date ; un calendrier trouvé donne la date du jour. | L'heure et la date étaient connues d'office. | Emplacement **Poignet** : `montre` (heure) et `montre_digitale` (heure + date) ; objets `calendrier` et `agenda` (`date: true`, la date tant qu'ils sont dans le sac, « Regarder la date »). Sans montre, le HUD, le sommeil et les cartes de voyage disent un moment vague (« Fin d'après-midi ») ; le numéro du jour reste connu. « Enfiler la montre » dans le sac, au sol et dans le Menu ; « Regarder l'heure » sur l'emplacement. Logique : `js/game/temps_connu.js`. | fait |
| 41 | Vie et endurance ne doivent pas apparaître à l'écran ; la barre des mains doit être discrète, petite, avec des libellés courts (« Dos » et non « Dans le dos »). | Les vitaux restaient affichés en bas à gauche ; la barre des mains gardait la taille de son ancienne place en haut. | Barres Vie / Souffle masquées (la jauge de lampe reste) ; barre des mains réduite et un peu transparente ; libellés « Droite », « Gauche ⇄ », « 2 mains », « Dos », « ↩ ceint. ». | fait |

---

## 3. Check-list de revue d'un niveau

À passer **avant de livrer un plan**, nouveau ou refait. Cocher chaque ligne ; une ligne non cochée se justifie par écrit
dans l'en-tête du fichier du niveau.

**Sens et taille (P1)**
- [ ] Je sais dire en une phrase **à quoi sert ce lieu** pour le joueur et pour l'histoire.
- [ ] Chaque pièce a une fonction (scène, personnage, butin, passage, repère). Aucune pièce « pour faire grand ».
- [ ] Hors ville : jamais plus de ~30 unités sans rien à voir ou à faire. `abords: false` si le lieu n'est pas en ville
      ou si c'est un lieu clé.

**Peuplement (P2, P3)**
- [ ] Chaque personnage vivant a une raison **visible** d'être vivant (barricade, barre, gardes, hauteur), dite quelque part.
- [ ] Aucune pièce habitée ne peut recevoir de mort procédural ni de repeuplement (`sansMorts`).
- [ ] `lieux_gameplay.<id>.morts` est cohérent avec le plan (il l'emporte aujourd'hui sur le plan).
- [ ] Les morts scénarisés ont leur condition `si` (avant / après la scène) ; l'état « après » du lieu est prévu.
- [ ] Traces de vie : refuge ≥ 1 personnage qui parle + 1 figurant par pièce habitée ; lieu abandonné ≥ 3 traces ;
      lieu ordinaire ≥ 1.

**Portes et clés (P4, P5)**
- [ ] Chaque porte visible s'ouvre un jour, ou dit pourquoi pas au premier essai.
- [ ] Chaque porte verrouillée a un message qui dit ce qu'il faut (clé, outil, drapeau) en clair.
- [ ] Derrière chaque porte : 2 unités libres en profondeur, aucun meuble au seuil, même en diagonale.
- [ ] Chaque clé : porte à ≤ 12 unités et en vue, ou la clé dit où ; le trajet clé → porte ne retraverse pas la zone
      dangereuse.

**Verticalité (P6)**
- [ ] Escaliers droits ≥ 2 × 3, escaliers à vis 2 × 2, aux mêmes coordonnées d'un étage à l'autre, avec une case libre
      autour de l'arrivée.
- [ ] Chaque étage a une fonction ; son nom (affiché dans le libellé « Monter : … ») est clair.

**Repérage (P7)**
- [ ] Toutes les pièces où l'on peut entrer sont nommées (`nom`), avec un nom que le joueur comprend.
- [ ] Un repère fort par zone, visible de loin.
- [ ] Les sorties sont au bord, visibles, et mènent là où le joueur s'y attend.

**Danger lisible (P10)**
- [ ] Les morts `dort` / `immobile` placés pour une séquence de discrétion : la règle (lumière, bruit) est dite dans la
      scène d'entrée ou par une aide, et la pièce est assez éclairée (bougies, cierges, lune) pour la traverser lampe éteinte.
- [ ] Le joueur ne peut pas mourir d'une règle qu'on ne lui a pas annoncée (bruit, lumière, piège).

**Mission (P12)**
- [ ] Si le niveau porte une mission : je sais dire **quelle contrainte** elle impose (discrétion, durée, protection,
      approvisionnement, nettoyage) et en quoi elle ne se joue pas comme la précédente.
- [ ] L'avancement se lit en phrases, et chaque objectif rempli déclenche le bandeau « Objectif rempli ».

**Textes (P9)**
- [ ] Noms de pièces, de portes, de meubles, messages : relus selon P9 et `CHARTE_ECRITURE.md` (articles « le », « la »,
      accords `{m|f}`).

**Histoire**
- [ ] Les ids attendus par `declencheurs.js`, `pnj.js`, `documents.js`, `quetes.js` et les scènes (`teleporter`,
      `combat: { lieu }`) sont présents : `node tools/verifier_histoire.mjs` sans erreur.

**Technique**
- [ ] `node tools/valider_niveaux.mjs <id> --avertissements` : aucune erreur, avertissements lus.
- [ ] Partie test dans `dev/explore.html?lieu=<id>` de jour **et** de nuit (`&heure=22`), chaque entrée nommée testée
      (`&entree=…`), chaque porte franchie, chaque escalier pris dans les deux sens.
- [ ] Partie test à deux (co-op) : les deux joueurs voient les mêmes morts, portes et figurants.
- [ ] Sur téléphone : on passe toutes les portes et tous les couloirs au joystick sans accrocher.

---

## 4. Cahiers des charges de refonte

Format conseillé : **format à couches** (`js/carte/plan.js`, exemple `cimetiere.js`). Les plans à couches ne reçoivent
pas d'abords générés : le cadre (rues, place, rocher) est dessiné à la main. Les cotes ci-dessous sont des **dimensions
intérieures en unités** (murs non compris), sauf mention contraire.

### 4.1 Tour de l'Horloge (`tour_horloge`, prologue)

**En une phrase** : une tour-porte qui sert de refuge à une seule personne, Maud. Une seule porte, barrée de
l'intérieur ; dedans, son campement ; en haut, les cloches qu'elle fait sonner.

**Pourquoi Maud est vivante (P2)** : la tour n'a qu'une entrée, la petite porte de chêne du porche, fermée par une barre
de chêne posée de l'intérieur ; les morts ne montent pas les escaliers d'eux-mêmes ; elle a de l'eau et des conserves
pour des jours. On le voit : la barre posée contre le mur derrière la porte, le campement au premier étage. On le dit :
message de la porte vue du dehors (« Une petite porte en chêne, barrée de l'intérieur. Quelqu'un, là-haut, peut
t'ouvrir. »).

**Cadre** : cœur ≈ 48 × 40, sans abords générés (la place est fermée par ses façades ; deux rues mènent aux sorties).
Au rez-de-chaussée, la tour fait **14 × 12 de l'extérieur**, murs compris : massif ouest (2), porche (4), pied de
l'escalier (4). Les étages, plus petits (comme les « corps en retrait » de la vraie tour), sont posés sur sa moitié est.
L'escalier à vis occupe une **colonne de 2 × 4 au même endroit à tous les étages**, dans le coin nord-est du pied de
l'escalier : 2 × 2 « monte » au nord, 2 × 2 « descend » au sud (au rez-de-chaussée, seulement « monte » ; au sommet,
seulement « descend »), avec au moins une case libre devant chaque arrivée.

| Étage / pièce | Dimensions | Contenu | Lumière |
|---|---|---|---|
| **rdc** — Place Crousillat (dehors, pavés) | 36 × 12, au nord de la tour | Fontaine Moussue 2 × 2 au centre (point d'eau, non fouillable) ; deux terrasses (6 tables, 12 chaises renversées) ; 2 platanes ; 2 lampadaires éteints ; façades fermées au nord et à l'est (maisons closes). Arrivée `defaut` à l'ouest. | lune |
| rdc — Café de la Fontaine | salle 8 × 4 + arrière-cuisine 3 × 4 | Porte vitrée sur la place, deux fenêtres ; comptoir 3 × 1, trois tables ; cloison avec une porte vers l'arrière-cuisine, **2 unités libres derrière elle** ; placards le long du mur du fond (pas du mur de la porte), frigo. Trace : ardoise « FERMÉ » tombée. | `sombre: 1` |
| rdc — Le porche | passage 4 × 10, nord-sud sous la tour | Arches ouvertes aux deux bouts (pas de portes) ; la **petite porte de chêne** (`K`) dans le mur est. | `sombre: 1` |
| rdc — Le pied de l'escalier | 4 × 5, à l'est du porche, dans la tour (le reste de la travée est est plein) | Entrée nommée `porche` à 1 unité derrière `K` ; escalier à vis « monte » ; la barre de chêne contre le mur ; sparadrap « MONTE » sur la première marche (décal) ; une lampe-tempête éteinte. | `sombre: 2` |
| rdc — massif ouest de la tour | — | **Plein** (maçonnerie). La « salle basse » actuelle disparaît : elle s'ouvrait sur le porche sans rôle ni raison. | — |
| rdc — Rue de l'Horloge (dehors) | 10 × 8, au sud | Sortie sud (vers le cours). Seconde sortie : bord ouest de la place. | lune |
| **e1** — La salle de l'horloge | 8 × 8 | Mécanisme 3 × 2 au centre (marqueur `mecanisme_horloge`) ; le cadran vu de dos (fenêtre au nord) ; **le campement de Maud** : lit de camp (`lit_camp`, couchage moyen) et couverture, réchaud à gaz, deux jerricans (un fouillable : 1 bouteille d'eau), carton de conserves vides, cendrier plein, carte de Salon punaisée avec des croix (`plan_mural`), jumelles sur une caisse. | lanterne allumée, `sombre: 1` |
| **e2** — Le palier des meurtrières | 6 × 6 (au lieu de 10 × 8) | L'escalier à vis ; trois meurtrières (fenêtres d'une unité) ; le carnet de Maud posé sur une marche (marqueur `carnet_tour`) ; plumes et fientes de pigeons (décals). | lune par les meurtrières, `sombre: 1` |
| **sommet** — La terrasse du campanile (dehors) | 8 × 8 | Parapet en muret (on voit la place en contrebas) ; 4 piliers de la cage de fer ; 3 cloches (bourdon 2 × 2 au centre, cloche des heures, cloche des quarts) ; **Maud** (marqueur `sommet_maud`) assise contre le pilier sud-est, face à l'arrivée de l'escalier ; sa petite lampe posée près d'elle. | lune + lanterne faible |

**Peuplement**

| Moment | Place | Café | Tour (tous les étages) |
|---|---|---|---|
| Arrivée (pas `pro_signal`) | 0 à 2 morts `erre` à l'est de la place, loin de l'arrivée | 0 ou 1 `dort` derrière le comptoir (il apprend « dort ») | **0** |
| Après `pro_signal`, avant `prologue_fini` | la foule : 15 à 20 `immobile` tournés vers la tour (`si: { flag: 'pro_signal', pasFlag: 'prologue_fini' }`) | idem | **0** |
| Après `prologue_fini` | 3 à 5 `erre` : la foule s'est dispersée (`si: { flag: 'prologue_fini' }`) | 0 ou 1 | **0**, repeuplement interdit |

- Toutes les pièces de la tour : `sansMorts` (§8). `lieux_gameplay.tour_horloge.morts.n` passe à `[0, 0]`, ou bien les
  morts du lieu ne vont que dehors.
- Après le prologue, la tour devient un **refuge possible** : une seule porte qu'on peut fermer, le lit de camp de Maud.
  C'est une belle récompense pour le jour 1 (sommeil sûr si la porte est fermée, règle déjà en place).

**Ids à garder** (référencés par l'histoire) : lieu `tour_horloge` ; étages `rdc`, `e1`, `e2`, `sommet` ; entrées
`defaut` et `porche` (la scène `pro_cloches_porte` téléporte sur `porche`) ; marqueurs `mecanisme_horloge`
(→ `pro_mecanisme`, `doc_plaque_1909`), `carnet_tour` (→ `doc_carnet_maud_tour`), `sommet_maud` (→ `pro_maud`) ; porte
`K` avec `verrou: { flag: 'pro_signal' }`. Les noms de pièces ne sont référencés nulle part : on peut les changer.

### 4.2 Château de l'Empéri (`emperi`, chapitre 1)

**En une phrase** : un château-musée sur son rocher, tenu par un prof et ses élèves ; un camp vivant autour d'un feu,
dans une cour fermée. On y vient pour la radio ; on y reste parce qu'on y est accueilli.

**Pourquoi ils sont vivants (P2)** : le rocher et des murs de huit mètres ; une seule porte, barrée par une grille de
chantier et des palettes ; une poterne cadenassée ; des guetteurs jour et nuit sur le rempart ; des règles strictes
(l'ardoise). Tout cela se voit.

**Cadre** : `abords: false`. Un seul plan de **72 × 50** (58 × 40 m) : la montée du Puech au sud (dehors), l'enceinte
du château au-dessus (**60 × 33** de l'extérieur). **Deux étages seulement** : `rdc` (montée + château) et `e1` (musée +
chemin de ronde + tour d'angle). Les étages `montee` et `remparts` disparaissent (aucune référence dans l'histoire ;
sauvegardes en cours : remettre le joueur à l'entrée `defaut` et réinitialiser l'état du lieu).

**rdc**

| Pièce | Dimensions | Contenu | Lumière |
|---|---|---|---|
| La montée du Puech (dehors, pavés) | bande 72 × 13 au sud | Rampe de 5 de large en lacet, du sud-ouest à la porte (au centre du mur sud). À l'ouest, la grille du lycée (mur `grille`, on voit la cour vide), banderole « BIENVENUE AUX SECONDES », banc renversé. **Ronces** (`roncier` ×8) au pied du rempart ; le **sac rouge** (marqueur `sac_rouge`) dans les ronces, 6 à 8 unités à l'ouest de la porte. Entrée `defaut` et sortie au sud (vers le centre-ville), seconde sortie à l'est. | jour |
| La porte du château (`K`) | 1 porte, mur sud | `verrou: { flag: 'emp_entree_ok' }`, `exterieure`. Grille de chantier et palettes visibles derrière. Marqueur `porte_emperi` **juste derrière la grille, côté porche** (Vidal parle à travers ; interaction possible à 2 unités à travers une porte `style: 'grille'`, §8). Message sans le drapeau : « Une grille de chantier et des palettes. Derrière, deux adolescents armés te regardent. On ne passe pas sans leur accord. » | — |
| Le porche | 8 × 6 | Hugo et Mehdi (figurants, sabres du musée, casques) de part et d'autre ; escalier droit 2 × 4 contre le mur ouest, vers le chemin de ronde (`e1`). | `sombre: 1` |
| **La cour d'honneur** (dehors, pavés) — le cœur | 24 × 14 | **Feu de camp** au centre avec une marmite (lumière `feu`) ; **Vidal** (marqueur `vidal`) près du feu ; deux tables sur tréteaux et leurs bancs ; le linge qui sèche entre deux colonnes ; la galerie Renaissance au nord (6 piliers) ; l'**ardoise des règles** (marqueur `panneau_regles`) sur le mur, à droite en sortant du porche ; tonneaux d'eau. **8 figurants** : trois au feu, deux qui épluchent à la table, un qui lit, un qui porte un seau, « le petit de sixième » près du linge. | jour ; le feu la nuit |
| La cour Nord, Jardin des Simples (dehors, terre) | 26 × 6, derrière la galerie (arche) | 4 carrés de simples (conteneurs `herbes_simples` ×2, `table: null`), bordures de buis ; le **puits** avec un seau et une pancarte « FAIRE BOUILLIR » (règle 3 de l'ardoise) ; un carré de potager. Un figurant qui arrose. | jour |
| La chapelle Sainte-Catherine | 10 × 7 | **La chambre d'isolement** : on y fait dormir les nouveaux venus suspects (`emp_immunise` : « porte fermée à clé »), Maud y est enfermée (`emp_arrestation`), les petits et les blessés s'y réfugient pendant le siège. Autel, deux bancs, un lit de camp, un seau, bougies allumées. Porte normale (fermée, pas verrouillée tant qu'une scène ne la ferme pas). | bougies, `sombre: 1` |
| Le dortoir | 12 × 8 | 12 matelas au sol (`matelas`, couchage moyen) en deux rangées, sacs, vêtements qui sèchent ; deux figurants qui dorment (ceux qui ont veillé). Le joueur y dort une fois accepté. | `sombre: 1` |
| Le réfectoire et la salle de classe | 12 × 6 | Longue table et bancs, cheminée-cuisinière ; tableau noir « Cours 9 h » (règle 6) et chaises alignées ; les réserves du groupe sur une étagère, **non fouillables**, avec un message : « Les réserves du groupe. Tout est compté sur l'ardoise : on ne se sert pas. » (La « réserve » actuelle, pièce sans rôle, y est fusionnée.) | `sombre: 1` |
| La poterne (`G`) | 1 porte, mur ouest, près du réfectoire | `verrou: { flag: 'emp_entree_ok' }` : raccourci vers le lycée. Message sans le drapeau : « La poterne est cadenassée de l'intérieur. » | — |
| La salle des gardes, bureau de Vidal | 12 × 8 | Bureau avec le registre (marqueur `journal_vidal`), lit de camp de Vidal, armoire, carte du quartier épinglée, lanterne ; un adulte figurant qui fait l'inventaire ; escalier droit 2 × 4 vers le musée (`e1`). | lanterne, `sombre: 1` |
| L'infirmerie | 8 × 6 | Deux lits (couchage correct) avec les deux adultes « qui ne se lèvent plus » (figurants allongés) ; une élève à leur chevet ; table avec des boîtes de médicaments vides. | `sombre: 1` |

**e1**

| Pièce | Dimensions | Contenu | Lumière |
|---|---|---|---|
| Le chemin de ronde (dehors) | 2 de large : au-dessus du mur sud (~58) puis du mur est jusqu'à la tour d'angle (~28) | Créneaux (`muret`) : on voit la montée en contrebas ; **Lou** (marqueur `lou_rempart`) au-dessus de la porte ; deux guetteurs figurants avec l'arbalète bricolée ; seaux de pierres et bouteilles (préparés pour le siège) ; torches (lumière `feu`) la nuit. Arrivée de l'escalier du porche. | jour ; torches la nuit |
| La tour d'angle (nord-est) | 5 × 5 | La radio sur une table (marqueur `radio_emperi`), l'antenne au bout d'un bâton de ski (décor), une chaise, un carnet de fréquences. | `sombre: 1` |
| La salle des armes blanches | 12 × 8, au-dessus de la salle des gardes | Vitrine des sabres (conteneur `sabre_cavalerie` ×1) et cartel (marqueur `vitrine_sabres`) ; râtelier vide ; arrivée de l'escalier de la salle des gardes. | `sombre: 1` |
| La salle des uniformes | 10 × 8 | Mannequins à moitié déshabillés (les élèves ont pris casques et cuirasses), une caisse fouillable (`chateau`) ; porte vers le chemin de ronde est : la boucle cour → porche → rempart → tour d'angle → musée → salle des gardes → cour se ferme. | `sombre: 1` |

Supprimés : salle de l'Empire, salle de la Grande Guerre, salle d'honneur, chemins de ronde ouest et nord.

**Peuplement**

| Moment | Montée | Château |
|---|---|---|
| Avant `emp_entree_ok` (y compris une visite avant la quête) | 2 `erre` près de la grille du lycée, + 0 à 2 procéduraux | **0 mort**. Figurants visibles : Hugo et Mehdi au porche, deux guetteurs sur le rempart. Visite avant la quête : **demande au scénariste** d'une courte scène à la porte (« On n'ouvre à personne. »), pour qu'on sache ce qu'est ce lieu. |
| Accueilli (`emp_entree_ok`, pas `sonnailles_commencees`) | idem | 0 mort ; Vidal, Lou (si `lou_sauvee`), **15 figurants** (l'histoire en annonce 25 : les autres sont « ailleurs », de garde ou endormis) |
| Siège (`sonnailles_commencees`, pas `siege_fait`) | foule de 20 à 30 morts, `cogne` contre la porte et `erre` | 0 mort dedans ; figurants à leur poste (torches, seaux) |
| Après `siege_fait` | 4 à 6 `erre` | **Le château est tombé** : 8 à 12 morts (`erre`, `dort`) dans la cour, le dortoir, la chapelle ; figurants retirés ; corps au sol, feu éteint (cendres) |

- `lieux_gameplay.emperi.morts.n` passe à `[0, 2]`, **montée seulement** ; tout le château est `sansMorts` tant que
  `siege_fait` n'est pas posé.
- **Incohérence à signaler au scénariste** : le cartel `doc_cartel_sabre` dit « La vitrine est vide », mais la vitrine
  contient un sabre. Proposition : « Il en manque cinq. Le dernier a la lame ébréchée. »

**Ids à garder** : lieu `emperi` ; étages `rdc`, `e1` ; entrée `defaut` (ajouter une entrée nommée `cour` pour de futures
scènes) ; marqueurs `porte_emperi`, `vidal`, `lou_rempart`, `radio_emperi`, `sac_rouge`, `journal_vidal`,
`panneau_regles`, `vitrine_sabres` ; portes `K` et `G` avec `verrou: { flag: 'emp_entree_ok' }` ; objets
`herbes_simples`, `sabre_cavalerie` ; PNJ `vidal`, `vidal_porte`, `lou_emperi` ; documents `doc_journal_vidal`,
`doc_regles_emperi`, `doc_cartel_sabre` ; déclencheurs `emp_arrivee`, `emp_retour_lou`, `emp_denonciation`,
`ch1_siege_1`, `emp_radio`, `emp_sac_rouge` ; combats de scène `lieu: 'emperi'`.

### 4.3 Collégiale Saint-Laurent (`saint_laurent`, chapitre 1)

**En une phrase** : une traversée silencieuse d'une nef pleine de morts debout ; au bout, tout se joue dans le chœur :
Lou dans le clocher, la clé à la ceinture du prêtre, la sacristie juste derrière l'autel. **On ne retraverse jamais la nef.**

**Parcours cible (P5)** : parvis → portail → nef, par le bas-côté nord, lampe éteinte (on passe devant la grille de la
chapelle de la Vierge : Nathan cogne) → chœur → clocher (Lou) → derrière l'autel (la clé) → sacristie → ruelle → sortie.
L'ordre clocher / clé est libre : les deux sont à moins de 6 unités l'un de l'autre.

| Pièce | Dimensions | Contenu | Lumière |
|---|---|---|---|
| Square Jean-XXIII et parvis (dehors) | 13 × 9 et 13 × 22 (inchangés) | Sac de sport de Nathan (marqueur `sac_nathan`), vélo couché, le chien Pistache attaché à la grille du square (figurant animal) ; entrée `defaut`, sortie ouest. | jour |
| Le portail | 2 portes, mur ouest | Fermées, pas verrouillées. Juste derrière : la zone `nef_entree` (3 × 8) et le présentoir (marqueur `presentoir`). | — |
| **La nef** | 36 × 12 | 46 morts `immobile` tournés vers l'autel (`dir: 0`), entre les rangs de bancs ; **allée centrale et bas-côtés de 2 unités, dégagés**. **Cierges** (lumière `bougie`) tous les 6 unités le long du mur nord, et quatre autour de l'autel : on y voit assez pour traverser **lampe éteinte**. | cierges, `sombre: 1` |
| La chapelle de la Vierge | 6 × 5, côté nord, **au milieu de la nef** (et non plus près de l'entrée) | Tombeau de Nostradamus (`caveau`) ; Nathan (`coureur`, `cogne`, à 2 unités au plus de la grille). Fermée par une **grille** (porte `style: 'grille'`, `verrou: { flag: 'grille_vierge_scellee' }`, marqueur `tombeau_nostradamus`), nommée « la grille cadenassée de la chapelle ». Message : « Un antivol de vélo ferme la grille. Tu ne peux pas l'ouvrir. » Elle ne peut plus être prise pour la porte de la clé. | `sombre: 1` |
| **Le chœur** | 10 × 12 | Autel 2 × 4 au centre, **2 unités de passage entre l'autel et le mur du chevet** ; le prêtre (`errant`, `immobile`, `dir: 3.14`, tourné vers la nef) derrière l'autel avec sa clochette ; marqueur `cure_autel` sur l'autel. On l'approche **par derrière, côté chevet**, hors de son regard. Deux piliers. | cierges |
| La porte du clocher | mur nord du chœur, **à 4 unités de l'autel** | Porte normale. | — |
| Le pied du clocher | 4 × 4 | Escalier à vis 2 × 2 « monte » ; traces : cierges écrasés, une bouteille de vin de messe vide, des pas dans la poussière (décals) : Lou est passée par là. | `sombre: 2` |
| **clocher** — La chambre des cloches | 7 × 7, aligné au-dessus | Trois cloches ; Lou (marqueur `clocher_lou`) assise dos au mur, son cabas de cierges, ses bouteilles ; abat-sons (fenêtres) ; escalier « descend » aux mêmes coordonnées. | `sombre: 1` |
| La porte de la sacristie (`X`) | mur sud du chœur, **à 3 unités de l'autel**, en vue | `verrou: 'cle_sacristie'`, marqueur `porte_sacristie`. Message sans la clé : « Fermée à clé. Une plaque : SACRISTIE. Le curé gardait ses clés sur lui. » | — |
| La sacristie | 8 × 6 | Armoire des vêtements liturgiques, lavabo, coffre (cierges, vin de messe), porte basse vers la ruelle. | `sombre: 2` |
| La ruelle (dehors) | 3 de large, au sud | Sortie est ; elle revient aussi vers le parvis à l'ouest. | jour |

**Lumière et réveil (P10)**
- **Le dire** : le scénariste ajoute à `stl_nef` une phrase claire, par exemple : « Ils regardent tous l'autel. Dans ton
  dos, ils ne te voient pas. Mais s'ils te voient avec une lampe allumée, ils se retourneront. »
- **L'aide** : la première fois qu'on entre dans la nef lampe allumée, message : « Éteins ta lampe : ici, sa lumière les
  réveille. » (sur PC : « Éteins ta lampe avec F : ici, sa lumière les réveille. »).
- **La règle**, déjà vraie pour les `immobile` : un mort qui te voit avec une lampe allumée te repère à 1,8 fois sa vue,
  même dans le noir. Dans leur dos, rien. Devant eux (dans le chœur), lampe allumée = repéré.
- **Nouvelle règle pour les dormeurs (`dort`), partout dans le jeu** : le faisceau de la lampe les réveille. Un mort qui
  dort, éclairé par le faisceau à 3,5 unités ou moins pendant 1,5 s cumulées, passe en `alerte` ; le compteur redescend
  de 0,5 s par seconde hors du faisceau. Le « ? » se remplit au-dessus de lui pendant qu'on l'éclaire. Réglage proposé :
  `exploration.PERCEPTION.FAISCEAU_REVEIL: { portee: 3.5, ms: 1500, oubliParS: 0.5 }`. C'est cette règle qui rend vraie
  l'idée du propriétaire : « se planquer parmi des morts qui dorment ».

**Peuplement** : la nef (46 + le prêtre) et Nathan, inchangés. Morts procéduraux et repeuplement (`lieux_gameplay
[1, 3]`) : **dehors seulement** (parvis, ruelle). `sansMorts` : chœur, pied du clocher, clocher, sacristie, chapelle de
la Vierge (Nathan seul). Lou s'y cache depuis la veille : un mort dans le clocher serait incohérent.

**Ids à garder** : lieu `saint_laurent` ; étages `rdc`, `clocher` ; zone-marqueur `nef_entree` ; marqueurs `cure_autel`,
`tombeau_nostradamus`, `clocher_lou`, `porte_sacristie`, `sac_nathan`, `presentoir` ; clé `cle_sacristie` sur `X` ;
drapeau `grille_vierge_scellee` (la grille reste fermée pour toujours, et le dit) ; Nathan `coureur` `cogne` ; le prêtre
`errant` `immobile` ; documents `doc_tombeau`, `doc_telephone_nathan`, `doc_annonce_paroisse` ; déclencheurs
`stl_entree`, `stl_nef`, `stl_cure`, `stl_nathan`, `stl_lou`, `stl_sortie`. Les textes `stl_cure` (« la pièce derrière
l'autel ») et `stl_lou_sortie` (« par la sacristie, derrière l'autel ») restent justes. À mettre à jour :
`NIVEAUX_BESOINS.md` §5 (le clocher part du chœur, plus du bas-côté).

---

## 5. Sommeil selon le couchage (résumé ; chiffres complets dans `GAMEPLAY.md` §5.7)

| Catégorie | Couchages (types réels) | Fatigue | Plafond | PV | Au réveil |
|---|---|---|---|---|---|
| Par terre | aucun (« Dormir » depuis le panneau Corps) | ×0,5 (8 h : +53) | **60** | ×0,5 | courbatures : douleur +20 pendant 4 h, endurance ×0,85 |
| Mauvais | `fauteuil`, `canape`, `brancard`, `abri_branches` ; siège de voiture (action à ajouter) | ×0,75 (8 h : +79) | 80 | ×0,75 | si ≥ 4 h : douleur +10 pendant 2 h |
| Moyen | `lit_fortune`, nouveaux `lit_camp` et `matelas`, `tente` fouillée ; **tout couchage par terre ou mauvais + un sac de couchage** | ×0,9 (8 h : +95) | 95 | ×1 | rien |
| Correct | `lit`, `lit_simple`, `lit_hopital` | ×1,2 (8 h : +127) | 100 | ×1,25 | rien |

- Le plafond remplace l'ancien `+4/h` du lit. Si la fatigue est déjà au plafond, on ne s'endort pas.
- Nouveaux objets : `sac_couchage` (1,6 kg, 10 L, +3 de chaleur en dormant, fait passer à « moyen ») et `couverture`
  (1,2 kg, 6 L, +2 de chaleur en dormant). Dormir par terre : +1 au besoin de chaleur.
- Textes : fenêtre « Dormir » (« Par terre. Tu dormiras mal : tu ne seras pas vraiment {reposé|reposée}, et tu te
  réveilleras {courbaturé|courbaturée}. »), toast de réveil sans chiffres, état « Courbatures ».

---

## 6. La carte locale (le « plan du lieu »)

**But** : savoir où l'on est dans un lieu exploré. La carte de Salon montre les lieux ; le plan montre l'intérieur du
lieu où l'on est.

- **Ouvrir** : un bouton rond « Plan » dans le HUD d'exploration (mobile, au moins 48 px, en haut à droite) ; sur PC,
  Tab (existe déjà) ou M. **Fermer** : le même bouton, un appui hors du plan, ou Échap.
- **Pas de pause** (temps réel, co-op). Le plan se ferme tout seul quand un mort approche (`couperTout`, déjà en place).
- **Aucun objet requis** : ce que tu as vu, tu t'en souviens. **Bonus** : un plan affiché au mur (`plan_mural`, ou un
  nouveau `plan_evacuation`), qu'on lit avec « Lire le plan », révèle d'un coup les murs, portes, escaliers et noms de
  pièces de l'étage, en gris clair (« connu, pas encore vu »). Lieux qui en ont un : hôpital, lycée, médiathèque, gare,
  grandes surfaces, musée de l'Empéri.

**Ce qu'il montre**
1. Les cases vues (mémoire `C.vu`), étage par étage : sol en deux tons (dedans clair, dehors plus sombre), murs, fenêtres.
2. Les portes avec leur dernier état connu : ouverte, fermée, verrouillée (petit cadenas), barricadée, cassée.
3. Les escaliers et les échelles (▲ ou ▼, avec en petit le nom de l'étage d'arrivée) ; les sorties (flèche dorée et
   destination, par exemple « vers la carte de Salon »).
4. Le nom des pièces découvertes, écrit dans la pièce (dès qu'on y est entré, ou qu'on en a vu la moitié).
5. Ta position et ton orientation (flèche dorée) ; ton allié en co-op (flèche bleue). S'il est à un autre étage, un
   point bleu sur l'onglet de cet étage.
6. Les repères : personnages rencontrés (silhouette et prénom), points d'eau trouvés (goutte), tes constructions (feu,
   lit, caisse).
7. Les meubles déjà fouillés, d'une coche discrète : c'est ta mémoire, pas une information cachée.
8. Des onglets d'étages (seulement ceux visités ou connus par un plan au mur), du plus haut au plus bas.

**Ce qu'il ne montre pas** : les morts (jamais, même ceux qu'on a vus : le plan est un souvenir, pas un radar) ; le
contenu des meubles et les objets par terre ; ce qu'on n'a jamais vu ; les objectifs (pas de flèche d'objectif, décision
du 5 oct. 2026), sauf un repère d'histoire demandé explicitement (`{ repere: true }`).

**Cadrage et mémoire** : centré sur toi et cadré sur la partie explorée (pas sur toute la carte) ; pincer pour zoomer
(3 crans), glisser pour se déplacer, bouton « Me centrer » ; légende repliable en bas (porte, cadenas, escalier, sortie,
eau). Mémoire **sauvegardée** par lieu et par étage (bitset compressé dans `G.world.lieux[id]`) ; en co-op, le plan
réunit ce qu'ont vu les deux joueurs, en direct.

---

## 7. Le tri quand on manque de place

**Principe (P8)** : rien ne tombe par terre et rien ne disparaît sans que le joueur l'ait choisi.

**Où ça s'applique** : récompenses de scène et de rencontre (le 4×4 de `rv_alarme_voiture`) ; « Tout prendre » d'un
meuble ou d'un corps ; ramasser par terre ; démontage, abattage, récolte qui rendent plus que le sac ne tient.

**Scènes et rencontres** (pendant le voyage, il n'y a pas de sol) :
- Ce qui ne rentre pas va dans **« À trier »** (déjà amorcé : `siPlein: 'tri'`). L'écran de tri s'ouvre **à la fin de
  la scène, avant que le voyage reprenne** : le voyage attend. En solo, l'horloge est en pause ; à deux, l'allié voit
  « Lucas trie son butin. ».
- L'écran : en haut **« Trouvé »**, en bas **« Ton sac »**, avec les jauges de poids et de volume en direct. Pour chaque
  objet trouvé : **Prendre**, **Porter** (en main, dans le dos), **Consommer ici** (nourriture, boisson, soin : on boit le
  soda sur place). Si ça ne rentre pas, le bouton dit pourquoi : « Il manque 3 L de place. » ou « 1,2 kg de trop. ».
  Pour chaque objet du sac : **Laisser 1** ou **Tout laisser**, pour faire de la place.
- Ordre d'affichage : objets d'histoire, armes, soins, nourriture et eau, outils, matériaux, divers.
- Bouton de fin : **« Repartir »** (rencontre) ou **« Terminé »** (scène sur place). S'il reste des objets, une
  confirmation : « Laisser ici : 2 conserves, 1 soda ? » [Laisser] [Revenir au tri]. Rien n'est abandonné sans elle
  (sauf à la mort du joueur).

**En exploration** (il y a un sol) :
- Un meuble garde ce qu'on ne prend pas (déjà le cas : « Sac plein : … restent ici. »).
- Ramasser par terre avec un sac plein ne prend rien et le dit : « Pas la place : il manque 2 L. » L'objet reste où il
  est (aujourd'hui : « plus de place, posé au sol », qui laisse croire qu'il a bougé).
- Ce que rend un démontage et qui ne rentre pas est posé à tes pieds, avec un message qui le dit : « La planche ne
  rentre pas dans ton sac : tu la poses à tes pieds. »

**À deux** : dans une rencontre commune, ce que l'un laisse est proposé à l'autre (« Laissé par Lucas ») avant d'être
abandonné. Pas de doublon : le butin n'est pas tiré deux fois.

---

## 8. Ce que le moteur doit apprendre à faire

Récapitulatif pour l'implémentation (chaque point renvoie au principe qui l'exige).

1. **Morts conditionnels** (P2) : `si` sur un mort du plan (`zombie(type, x, y, { si })`, légende `si`), évalué au
   chargement **et** quand un drapeau change (la foule apparaît après la cinématique).
2. **Zones sans morts** (P2) : `sansMorts: true` sur une pièce (`piece(…, { sansMorts })`, `pieces[]` de l'ASCII) :
   ni procéduraux ni repeuplement. Option de plan `mortsDehorsSeulement: true`.
3. **Priorité des morts** (P2) : pour les lieux clés, le `morts` du plan l'emporte sur `lieux_gameplay` ; à défaut,
   corriger `lieux_gameplay` (tour `[0, 0]`, Empéri `[0, 2]` montée seulement, Saint-Laurent dehors seulement).
4. **Figurants** (P3) : `pnj(id, x, y, { figurant: true, pose: 'assis' | 'debout' | 'allonge' | 'dort', ligne: '…', si })`.
   Dessinés comme des humains ; une réplique d'au plus 60 caractères en bulle quand on s'approche ; jamais ciblés par les
   morts ; synchronisés en co-op par la graine.
5. **Message de porte** (P4) : champ `message` sur une porte (`porte(x, y, { verrou, message })`, légende `message`),
   affiché à l'essai tant qu'elle ne s'ouvre pas.
6. **Parler à travers une grille** (P4) : interaction avec un personnage jusqu'à 2 unités à travers une porte
   `style: 'grille'` fermée (Vidal à la porte de l'Empéri).
7. **Rendu des escaliers et des échelles** (P6) : marches dégradées, flèche, spirale pour l'escalier à vis, libellé
   « Monter : <nom de l'étage> » à l'approche.
8. **Faisceau qui réveille les dormeurs** (P10) : §4.3.
9. **Contrôles automatiques** (P4) dans `tools/valider_niveaux.mjs` : avertissement si une porte a moins de 2 unités
   libres derrière elle ou un meuble en diagonale du seuil ; dans `abords.js`, `maison()` réserve ces cases.
10. **Couchage** (P11) : `GAMEPLAY.md` §5.7.
11. **Carte locale** (P7) : §6.
12. **Tri** (P8) : §7.
13. **Nouveaux types** : objets de plan `lit_camp` et `matelas` (1 × 2, couchage moyen) ; objets `sac_couchage` et
    `couverture` ; option `couchage` sur un objet de plan.
