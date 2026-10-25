# One More Day — Bible de l’histoire (version 2, octobre 2026)

> Document du **scénariste**. Il fait foi pour l’intrigue, les personnages, la structure, les drapeaux, les scènes et
> les **plans des cinématiques**. Données : `js/data/histoire/*.js`, `js/data/cinematiques.js`.
> Commande aux concepteurs de niveaux : `docs/NIVEAUX_BESOINS.md`. Vérification : `node tools/verifier_histoire.mjs`.
> L’ancienne histoire (le revenu, « un pour un », Maud, le Berger) est archivée dans `docs/HISTOIRE_ANCIENNE.md` :
> elle ne fait plus partie du jeu. Quelques lieux en gardent des traces (un camp à l’Empéri, des grottes habitées à
> Calès) : ce sont désormais de simples lieux du monde.

---

## 1. Pitch

Pays salonais, fin septembre 2026. Trois semaines après **le Mercredi**, le jour où le grand marché de Salon s’est mis
à mordre, tu survis {seul|seule} depuis vingt jours. Une voix de jeune fille, à la radio, répète la même chose toutes
les heures : *« Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants. Venez par la route de Saint-Chamas,
à la porte Notre-Dame. Montrez vos mains. »*

Tu y vas. Derrière les remparts d’un village perché au-dessus de l’étang de Berre, quatorze personnes tiennent
ensemble : une ancienne adjointe au maire qui note tout, un vieux berger, une lycéenne qui fait la radio, un
infirmier, une mère et sa petite fille malade, un chauffeur routier qui veut partir. Pendant trois jours, tu es l’un des
leurs : la quarantaine, les corvées, la garde de nuit. Puis on t’envoie dans la Crau chercher des antibiotiques pour
l’enfant, avec une enveloppe qu’on te défend d’ouvrir.

À l’aube, l’armée bombarde la gare de triage de Miramas, où les morts s’entassaient par milliers. Les wagons-citernes
de chlore éventrés crachent une **brume jaune** qui, chaque nuit sans vent, descend dans les terres basses. Les morts,
chassés du feu, montent à l’assaut du rocher. Le Refuge tombe en une nuit. Ce qu’il en reste se disperse avec une
seule promesse : l’armée ouvrira le pont de Mallemort, sur la Durance, **une heure, à l’aube du mercredi 7 octobre**.

D’ici là, il faut tenir. Quinze jours, à pied, entre la brume des nuits, les sirènes de l’armée et les morts.

**Logline** : trois jours après avoir été accueilli par un refuge, tu dois garder en vie, un jour de plus, ce qui
reste de ceux qui t’ont ouvert la porte, et comprendre pourquoi on t’a envoyé au loin la veille du bombardement.

## 2. Ce qui tient le joueur en haleine

| Moment | La question que se pose le joueur |
|---|---|
| Intro, arrivée | **« Vont-ils me laisser entrer ? »** — la porte, les mains levées, les bras qu’on retourne sous la lampe. |
| Acte I (le Refuge) | **« Qu’est-ce qu’Hélène cache ? »** — la nuit, une lumière dans le donjon, sa voix à une radio que personne d’autre n’a. Les sirènes de l’armée vers Miramas. |
| Acte II (la Crau) | **« Qu’y a-t-il dans l’enveloppe ? »** — « À n’ouvrir que si le Refuge tombe. » Fernand sait quelque chose. L’ouvrir ou tenir parole. |
| Acte III (la chute) | **« Qui je sauve ? »** — la porte ouverte par Rudy, la cloche de Fernand, une seule course possible : l’enfant, Hélène ou soi. |
| Acte IV (la brume) | **« Qu’est-ce que cette brume ? »** — elle sent l’eau de Javel, les oiseaux tombent, et les morts marchent dedans sans un bruit. |
| Acte V (le pont) | **« Serai-je à l’heure, et avec qui ? »** — un compte à rebours de huit jours, une région à traverser, des dispersés à retrouver ou à laisser. |
| Final | **« Pourquoi suis-je sur la liste ? »** — Hélène a rayé son nom et écrit : *ceux que j’ai envoyés à la bergerie*. |

## 3. Le thème : un jour de plus

Personne ne sauve tout le monde. Chacun achète **un jour de plus** à quelqu’un, au prix d’un autre :
- **Hélène** savait que l’armée frapperait. Elle ne pouvait pas faire descendre quatorze personnes dans la plaine
  (une enfant malade, deux octogénaires, des morts partout). Elle a parié sur les murs, et elle a envoyé au loin les deux
  seuls qui sauraient survivre dehors : Fernand, et toi.
- **Fernand** le savait aussi. Il t’a emmené, puis il est revenu sonner la cloche pour que les morts viennent à lui.
- **Rudy** a ouvert la porte pour sauver sa peau, et il a tué le Refuge.
- **L’armée** a bombardé une gare pleine de chlore pour tuer dix mille morts, en sachant ce que le vent ferait.
- **Toi** : à la fin, tu as une place sur le pont, et peut-être quelqu’un qui n’en a pas.

Le jeu est un jeu de **survie** (dans l’esprit de Project Zomboid) : peu de quêtes, chacune **longue** et liée au
temps (une nuit, deux jours, huit jours), et entre elles, manger, boire, dormir, se soigner, se cacher. On ne gagne rien
à tuer des morts : on gagne du temps.

## 4. Ce qui est arrivé au monde (la vérité)

- **La maladie** (jamais nommée ; « le Mercredi » pour les survivants, « l’agent » pour les soignants). Morsure →
  fièvre → mort en 3 à 30 heures → le corps se relève et mord. Les morts suivent le **bruit** et la **lumière** ; ils
  ne respirent presque plus. Une morsure condamne presque toujours (le « mal » du moteur, GAMEPLAY §5.4).
- **J0 = mercredi 2 septembre 2026**, jour de grand marché à Salon : la première morsure sur le cours Carnot.
  Confinement le lendemain, puis l’effondrement en trois jours.
- **L’armée** a reculé derrière la Durance : la **ligne Durance** (PC Durance à Mérindol). Les ponts sont fermés ou
  murés ; seul le **pont suspendu de Mallemort** est tenu, avec une ligne de tir à 200 mètres.
- **Le rabattage** : l’armée a repris le réseau des sirènes d’alerte et fait passer des drones à haut-parleurs. Quand
  une zone hurle, les morts courent vers le bruit. Elle les pousse ainsi vers des **zones de destruction**.
- **La gare de triage de Miramas** (la plus grande du Sud-Est) : depuis le 10 septembre, le haut-parleur d’un poste
  d’aiguillage, resté sur batterie, répète une annonce. Dix mille morts s’y sont entassés entre les trains, rabattus
  depuis la Crau. Sur une voie de garage attend un convoi de **wagons-citernes de chlore** (plaques orange « 268 / 1017 »).
- **La frappe** : le **samedi 26 septembre (jour 4) à 6 h**, deux avions bombardent le triage. Le feu tue des
  milliers de morts ; les citernes éventrées libèrent le chlore ; les survivants du feu fuient vers les hauteurs, donc
  vers le rocher de Miramas-le-Vieux. L’armée avait prévenu Hélène 72 heures avant (« évacuez vers l’est »).
- **La brume jaune** : le chlore est plus lourd que l’air. Le jour, le soleil et la brise le dispersent ; **la nuit,
  quand le vent tombe, il s’amasse dans les terres basses** (la gare, la Crau, les bords de l’étang, la Touloubre) en
  une brume jaune-vert qui sent l’eau de Javel. Elle brûle les yeux et les poumons ; elle tue les vivants qui y dorment.
  Les morts y marchent sans gêne, et elle étouffe les sons. Elle faiblit de jour en jour ; le **mistral** et la **pluie**
  la chassent. Les hauteurs (villages perchés, collines) et les étages en sont à l’abri.
- **Le pont** : le PC Durance ouvrira le pont suspendu aux civils **recensés** une heure, à l’aube du **mercredi
  7 octobre (jour 15)**, puis une dernière fois le **mercredi 14 octobre (jour 22)**. Contrôle des morsures, un mot de
  passe par refuge. Le mot du Refuge : **« Beauvezer »** (le nom de son église).

**Chronologie** (jour 1 = mercredi 23 septembre 2026 ; `temps.DATE_JOUR1`) :

| Date | Événement |
|---|---|
| J0, mer. 2/09 | Le Mercredi. |
| J3, sam. 5/09 | Hélène Garcin ferme la porte Notre-Dame de Miramas-le-Vieux sur onze habitants. Les gendarmes, en partant, lui laissent un poste radio. |
| 10/09 | Le haut-parleur du triage commence à appeler. Inès Belkacem arrive au Refuge et lance le message radio. |
| 16-20/09 | Arrivent Bastien, Karine et Noa, Rudy et Yohan. Quatorze personnes. Hélène envoie la liste des noms au PC Durance. |
| **Jour 1, mer. 23/09, 18 h 30** | **Tu arrives à la porte.** Le même soir, l’armée prévient Hélène : frappe sur le triage dans 60 heures. |
| Jour 2, jeu. 24/09 | Corvées, la brèche ; la nuit, la garde, les sirènes vers Miramas ; Hélène à la radio dans le donjon. |
| Jour 3, ven. 25/09 | Noa s’étouffe de fièvre. Fernand et toi partez pour la bergerie de Cabassole. Hélène te donne l’enveloppe. |
| **Jour 4, sam. 26/09, 6 h** | **La frappe.** Le soir, les morts montent à l’assaut du rocher. Vers 23 h, Rudy ouvre la porte pour fuir avec son camion : **le Refuge tombe**. |
| Jour 5, dim. 27/09 | La Poudrerie de Saint-Chamas. À 22 h, **la brume** monte de l’étang. |
| Jour 6, lun. 28/09 | Cornillon-Confoux, au-dessus de la brume. La radio confirme le pont. **Le pays s’ouvre.** |
| Jour 14, mar. 6/10, 20 h | Ceux de Cornillon partent pour Mallemort. |
| **Jour 15, mer. 7/10, 5 h - 7 h** | **Le pont.** (Sinon, dernière ouverture le jour 22, mer. 14/10.) |

## 5. Personnages

**Toi** — prénom et genre choisis. Tu survis {seul|seule} depuis le Mercredi (un mas de la Crau, puis des caves, des
voitures) ; ce que tu étais avant reste flou et le joueur le remplit. Tu as un petit poste à piles, et c’est par lui
que tu as entendu le Refuge. Les textes n’accordent jamais au genre sans `{masculin|féminin}`.

**Hélène Garcin** — 58 ans, ancienne adjointe au maire de Miramas chargée des écoles. Lunettes au bout d’un cordon,
gilet sans manches, un carnet à spirale où tout est compté (eau, conserves, tours de garde). Voix basse, ne crie
jamais, sourit rarement. *Veut* : que le Refuge tienne. *Secret* : un poste radio des gendarmes caché dans le donjon,
et la lieutenante Sabatier au bout ; elle sait la frappe depuis ton premier soir. *A tort, et raison* : elle a parié sur
les murs. Elle a envoyé au loin ceux qui pouvaient vivre, et à la fin, elle a **rayé son nom de la liste** pour y
écrire le tien. Sort : reste à sa radio pendant la chute (elle meurt), ou, si tu montes la chercher et insistes,
descend par les rochers et t’attend au pont (`helene_sauvee`).

**Fernand Abrieu** — 76 ans, berger de la Crau à la retraite, né au village. Casquette, bâton de buis, Opinel, il
connaît chaque puits et chaque draille (le chemin des moutons). Sec, drôle sans sourire, il appelle les morts « les
pauvres ». Ami d’Hélène depuis l’école. *Sait* la frappe, et accepte de t’emmener. Au retour, pendant la chute, il
court à l’église et **sonne la cloche** pour que les morts viennent à lui : il ne redescend pas.

**Inès Belkacem** — 17 ans, lycéenne d’Istres, radioamatrice avec son père (mort le Mercredi). C’est sa voix,
le message. Casque sur le cou, sweat trop grand, ironique, courageuse, en colère contre les adultes. Elle s’échappe
avec toi par la poterne et devient ta compagne de route (elle reste à la Poudrerie, puis à Cornillon : la base).

**Bastien Moreau** — 33 ans, infirmier aux urgences de l’hôpital de Salon. Doux, anxieux, épuisé ; il soigne Noa
avec ce qu’il n’a pas. Pendant la chute, il court vers la porte aider les autres et se perd. On le retrouve à
**Istres**, les poumons brûlés par la brume, caché dans une pharmacie : il sait ce qu’est le chlore.

**Karine Ollivier** — 39 ans, boulangère à Miramas, et sa fille **Noa**, 8 ans, qui fait une pneumonie. Karine est
sèche avec tout le monde sauf sa fille. Selon la chute : elles fuient avec toi (`noa_avec`), partent avant à l’aube
(`familles_parties`), ou se perdent vers **Grans**, où un vieux meunier les cache (`q_karine`).

**Rudy Chabert** — 46 ans, chauffeur routier ; son camion (un porteur bâché) est garé sur la place, réservoir presque
vide. Brutal, honnête à sa façon, il veut partir depuis le premier jour. Pendant le siège, il **ouvre la porte** pour
fuir avec Yohan : les morts entrent. On le retrouve au **péage de Lançon**, à sec de gasoil, Yohan mort. Le pardonner,
le laisser, ou le tuer.

**Figurants du Refuge** (une réplique ou deux) : Yohan (20 ans, apprenti maçon, garde), Paul et Josette Mendès
(81 et 79 ans), Malik Haddad (52 ans, cuisinier), Céline Barret (44 ans, le potager, la lessive) et son fils Théo
(12 ans), sœur Agnès (71 ans, l’église).

**La lieutenante Claire Sabatier** — PC Durance. Une voix à la radio, puis une femme en treillis au bout du pont,
une liste à la main. Ni bonne ni mauvaise : elle applique.

**Gérard Pons** — le berger de Cabassole, ami de Fernand ; mort dans sa bergerie, parmi ses brebis.

## 6. Structure

Durée visée : **acte I ≈ 1 h**, **acte II ≈ 45 min**, **acte III ≈ 30 min**, **acte IV ≈ 30 min**, **acte V : libre**
(8 jours de jeu, 3 à 8 h selon le joueur). Le joueur ne choisit sa route qu’à partir de l’acte V : avant, chaque acte
tient dans **un seul lieu**, et on passe de l’un à l’autre par un **voyage guidé** (sur indication, sans carte).

### Les lieux de l’histoire

| Lieu | Acte | Rôle |
|---|---|---|
| `miramas_le_vieux` (Le Refuge) | I, III | le village fortifié : la porte Notre-Dame, la tour-porte (quarantaine), la place, la salle commune, l’infirmerie, l’église, le donjon d’Hélène, la brèche nord, le bas du village (maisons abandonnées), la poterne sud |
| `bergerie` (Cabassole, la Crau) | II | la bergerie de Gérard, le mas, l’armoire du vétérinaire, le puits à balancier, la nuit au feu avec Fernand |
| `miramas` (la gare de triage) | II (vue de loin), V | dix mille morts entre les trains ; après la frappe, cratères, citernes, la brume la plus épaisse |
| `saint_chamas` (la Poudrerie) | IV | le point de ralliement au bord de l’étang ; la maison du gardien ; la brume qui monte |
| `cornillon` | IV, V | le village perché au-dessus de la brume : la base de l’acte V |
| `grans`, `istres`, `lancon` | V | les dispersés : Karine et Noa, Bastien, Rudy |
| `mallemort` | V, final | le camp d’attente, le pont suspendu, la ligne de l’armée |

### ACTE I — « Le Refuge » (jours 1 à 3, `q_refuge`)

Démarrage : cinématique `intro` → `explorer('miramas_le_vieux', { entree: 'porte' })` → scène `ref_porte`.
L’heure de départ est **18 h 30** (`temps.DEPART_MINUTES`).

1. **La porte** (`ref_porte` → `ref_porte_2` → `ref_porte_3`). Yohan sur le rempart, une lampe dans les yeux.
   « Montre tes mains ! Plus haut. Remonte tes manches. » Hélène descend, pose trois questions (d’où tu viens, depuis
   quand tu es {seul|seule}, si quelqu’un t’a suivi). La porte s’entrouvre. Règle : 24 heures de quarantaine dans la
   tour-porte. Effets : `refuge_arrivee`, `q_refuge.quarantaine`, téléportation sur l’entrée `quarantaine`.
   En co-op, l’invité a `ref_porte_coop` (vous êtes arrivés ensemble).
2. **La nuit de quarantaine** : une cellule dans la tour-porte (matelas, cruche, seau, bougie), porte fermée de
   l’extérieur. À 19 h, une demi-heure après qu’on t’a enfermé (`ref_nuit_bastien`), Bastien ouvre le judas, prend ta
   température, parle de Noa ; à travers le mur, tu reconnais la voix de la radio : Inès, qui lit le message. « Dormir »
   fait passer la nuit (`tempsMin`, on se réveille vers 6 h 30, reposé) : on n’attend pas des heures dans le noir.
3. **Le matin** (jour 2, 7 h ; `ref_matin` → `ref_regles`) : Hélène ouvre. Le tableau des règles (`doc_regles_refuge`),
   le carnet, les corvées : remonter l’eau du puits, et **fermer la brèche du rempart nord avant la nuit** avec Rudy.
   Effets : `quarantaine_faite` (la porte de la tour s’ouvre), `q_refuge.corvees`, le pied-de-biche d’Hélène, et l’on se
   retrouve sur la place (entrée `place`).
4. **Les corvées** (librement, dans le village) :
   - le **puits** (marqueur `puits`, `ref_puits`) : remonter vingt seaux (40 min, fatigue) → `eau_faite` ;
   - la **brèche** (marqueur `breche`, `ref_breche`) : Rudy a le marteau et les clous ; il faut **quatre planches**,
     à prendre dans **le bas du village** (maisons abandonnées, deux ou trois morts — personne n’y est descendu depuis
     une semaine). Avec les planches : 50 min de travail → `breche_fermee` (le plan montre les planches à la place des
     gravats). Sans : la brèche reste ouverte, et la garde sera plus dure.
   - parler aux gens (Hélène, Fernand, Inès, Bastien, Karine, Rudy ; les figurants) : facultatif.
5. **La garde** (jour 2, 21 h ; `ref_garde`) : le repas du soir en deux phrases, puis Rudy et toi à la brèche
   jusqu’à 2 h (la scène t’y amène : entrée `poste_breche`). Mission `m_garde` (tenir, quitter = échec ; des morts
   isolés montent par la pente et entrent PAR LA BRÈCHE : vagues `proche: true`, la sortie la plus proche). À 23 h
   (`ref_sirenes`) : les sirènes hurlent au loin vers Miramas, des drones passent ; Rudy explique le rabattage. À 1 h
   (`ref_helene_radio`) : une lumière au donjon, la voix d’Hélène : « … Beauvezer. Je répète, Beauvezer… Soixante
   heures… Non. Personne ne descendra. » → `helene_radio_vue`. À 2 h, Yohan et Malik vous relèvent (`garde_faite`) ;
   abandonner la garde → `garde_ratee` (un mort entre dans le bas du village, Céline est blessée ; on t’en parle).
6. **Noa** (jour 3, 7 h ; `ref_noa` → `ref_enveloppe`) : Noa a 40 de fièvre et respire mal. Bastien n’a plus
   d’antibiotiques. Fernand : Gérard, à Cabassole, soignait ses brebis avec de l’oxytétracycline, « la même chose, à
   la dose près ». Hélène envoie Fernand **et toi** ; personne d’autre. Dans le donjon, seule avec toi, elle te donne
   une enveloppe : **« À n’ouvrir que si le Refuge tombe. »** Malik te donne du pain et une gourde.
   Effets : `enveloppe_helene`, `depart_crau`, `q_refuge.fin`, `q_crau.route`, **voyage guidé** vers `bergerie`.

### ACTE II — « La bergerie » (jours 3 et 4, `q_crau`)

1. **La route** (voyage guidé `miramas_le_vieux` → `bergerie`, ≈ 6 km) :
   - à 30 % `rh_triage` (`rv_triage`) : du pont routier au-dessus des voies, la gare de triage ; des milliers de morts
     entre les trains, le haut-parleur, et sur une voie de garage les wagons blancs aux plaques orange. Fernand : « Gérard
     disait qu’il fallait jamais s’approcher des blancs. » Choix : regarder longtemps (`triage_vu`), passer vite.
   - à 75 % `rh_draille` (`rv_draille`) : sur la draille, un mort assis dans un cabanon ; premier combat à découvert,
     ou un détour par les murets.
2. **La bergerie** (`ber_arrivee`) : le silence, une odeur de suint et de mort, le chien enterré sous les pierres.
   Fernand appelle Gérard. → `q_crau.bergerie`.
3. **Gérard** (marqueur `gerard` ; `ber_gerard`) : il est debout parmi ses brebis mortes, dans la bergerie ; trois
   brebis vivantes serrées dans l’enclos du fond. Fernand ne peut pas : « Fais-le, toi. Moi, je le connaissais. » Le
   mort `gerard` du plan porte `flagMort: 'gerard_acheve'`.
4. **L’armoire du vétérinaire** (marqueur `armoire_veto`, dans le mas ; `ber_armoire`) : fermée à clé ; la clé est à
   la ceinture de Gérard (`gerard_acheve`), ou on force au pied-de-biche. Dedans : `antibio_veto` ×2, compresses,
   seringues, et le carnet de Gérard (`doc_carnet_gerard`). → `antibio_trouves`, `q_crau.nuit`.
5. **Le soir** (jour 3, 19 h, si l’on est à la bergerie ; `ber_soir` → `ber_soir_2`) : le feu dans la cheminée du mas,
   la soupe, Fernand qui parle (la Crau, Gérard, Hélène à quinze ans). Il voit l’enveloppe. « Elle te l’a donnée à
   toi ? Alors garde-la fermée. » Choix : **l’ouvrir** (`ber_enveloppe` → `doc_lettre_helene`, `enveloppe_ouverte`,
   puis **rentrer cette nuit** avec Fernand — `retour_nuit`, voyage guidé — ou attendre l’aube) ; **tenir parole**.
   Les sorties de la bergerie sont fermées tant que dure la nuit (« Fernand ne marche pas de nuit dans la Crau »).
6. **La frappe** (jour 4, 6 h ; `frappe_reveil` → cinématique `frappe` → `frappe`) : deux avions bas, les explosions
   sur la gare, une boule de feu, puis un nuage jaune qui ne monte pas. Fernand ne dit rien ; il regarde la fumée
   comme une chose attendue (le joueur attentif le remarque). « Ils vont fuir le feu. Et le seul endroit haut, c’est
   chez nous. On rentre. » → `frappe_faite` (la brume commence), `q_crau.retour`, voyage guidé vers le Refuge.
   - `rh_nuage` (`rv_nuage`) : le nuage couché sur la route, des oiseaux morts ; les yeux qui brûlent. Choix :
     contourner par le nord (détour, du temps) ou traverser en retenant son souffle (une brûlure aux poumons :
     toux, quelques PV). **C’est là que le jeu apprend la règle de la brume** (P10).
   - `rh_maree` (`rv_maree`) : les morts traversent les champs vers le rocher. Se cacher dans un fossé.
   - variante de nuit (`retour_nuit`) : `rh_nuit_crau` (`rv_nuit_crau`) en allant, puis la frappe vue **depuis
     les remparts** (`frappe_refuge`).

### ACTE III — « La chute » (nuit du jour 4, `q_chute`)

1. **Le retour** (`siege_debut`, en entrant au Refuge après la frappe ; ou `siege_debut_nuit` à 19 h dans la
   variante de nuit) : les morts sont au pied du rocher. Hélène distribue les postes. Fernand la regarde : « Tu le
   savais. » Elle ne répond pas. → `siege_commence`, `q_chute.siege`, mission `m_siege` (tenir deux heures ; les
   morts montent par la pente, plus nombreux par la brèche si elle est restée ouverte).
   - Variante de nuit (`ref_retour_nuit`, en arrivant vers 1 h) : dans le donjon, Hélène avoue. Elle fait partir à
     l’aube par la poterne ceux qui ne peuvent pas se battre (Karine, Noa, les Mendès, Céline, Théo) vers la Poudrerie
     → `familles_parties`.
2. **La porte** (fin de `m_siege` → `siege_tenu`, ou 23 h 30 au plus tard ; `chute` → cinématique `chute` →
   `chute_2` → `chute_choix`) : un moteur rugit derrière toi. Rudy a ouvert la porte Notre-Dame et file avec son
   camion et Yohan. Les morts entrent. Fernand court à l’église : « Je vais sonner. Ils viendront tous à moi. » La
   cloche sonne. Une seule course possible :
   - **l’infirmerie** (Karine et Noa) — si les familles ne sont pas déjà parties ; marqueur `infirmerie`,
     `chute_infirmerie` → `noa_avec` ;
   - **le donjon** (Hélène) — marqueur `radio_helene`, `chute_helene` → `helene_sauvee` (elle descend par les
     rochers : « Je vous retrouverai au pont ») ou `helene_restee` ; elle te dit d’ouvrir l’enveloppe en bas ;
   - **la poterne**, directement.
   → `refuge_tombe`, `fernand_cloche`, `q_chute.fuir`. Le village est plein de morts : il faut courir pour de vrai.
3. **La poterne** (marqueur `poterne`, `chute_poterne`) : Inès t’attend avec la radio sur le dos. La cloche se tait.
   → `refuge_fui`, `q_brume.poudrerie`, voyage guidé vers `saint_chamas` (`rh_sentier` / `rv_sentier` : le sentier
   de la falaise, le village qui brûle au-dessus).

### ACTE IV — « La brume » (jours 5 et 6, `q_brume`)

1. **La Poudrerie** (`pou_arrivee`) : le parc et ses platanes, la maison du gardien. Qui est là dépend de la chute
   (Karine et Noa, les familles parties à l’aube, ou personne). Si l’enveloppe est fermée, Inès : « Ouvre-la. »
   (`pou_enveloppe` → `doc_lettre_helene`). → `q_brume.attendre`. Les sorties de la Poudrerie sont fermées
   (« Hélène a dit d’attendre deux jours ici »).
2. **La journée** (jour 5, 14 h ; `pou_jour`) : personne d’autre ne vient. Inès bricole une antenne sur le toit ; la
   radio crache des bouts de bulletin. Survivre : manger, dormir, l’étang.
3. **L’odeur** (jour 5, 20 h ; `pou_odeur`) : l’eau de Javel, le soir qui tombe sans vent ; Inès tousse. On te donne
   un foulard mouillé (`foulard_mouille`). **Le danger est dit avant d’être appliqué** (P10).
4. **La brume** (jour 5, 22 h ; `pou_brume` → cinématique `brume` → `pou_brume_2`) : elle sort de l’étang, couvre la
   grève, puis le parc. Des morts en sortent sans bruit. Il faut monter : Cornillon-Confoux, le village perché, à
   trois kilomètres. → `brume_vue`, `q_brume.fuir`, voyage guidé vers `cornillon` (`rh_brume_montee` / `rv_brume`).
5. **Cornillon** (`cor_arrivee`) : un village vide au-dessus de la mer jaune ; la maison du guetteur. → `cornillon_arrivee`.
   À l’aube (jour 6, 7 h ; `cor_aube` → cinématique `cornillon_aube` → `cor_aube_2`) : la plaine noyée de brume
   jaune, les clochers qui dépassent. La radio d’Inès capte enfin le PC Durance : c’est du **chlore** ; restez en
   hauteur la nuit ; **le pont, mercredi 7 octobre, de 6 h à 7 h**. Inès a trouvé une **carte routière** chez le
   guetteur. → `pont_annonce`, `q_brume.fin`, `q_pont.preparer`, et les quêtes des dispersés (`q_bastien`, `q_rudy`,
   `q_karine`) selon qui manque.

### ACTE V — « Le pont » (jours 6 à 15, `q_pont`) : le pays est ouvert

Le joueur va où il veut. La base est Cornillon (Inès y reste ; ceux qu’on retrouve y montent). Le monde presse :
**la brume** les nuits sans vent dans les terres basses ; **les sirènes** et **les hordes** (`js/game/ruees.js`) ;
la météo ; la faim. Les missions de survie déjà écrites (`m_guetteur` à Cornillon, `m_aime`, `m_mireille`,
`m_marche`, `m_draisine`, `m_coffre`) sont ouvertes.

- **Bastien** (`q_bastien`, Istres, marqueur `bastien_ist`, `ist_bastien`) : dans l’arrière-boutique d’une pharmacie,
  les poumons brûlés. Il sait le chlore ; il a un **masque à gaz** et deux filtres (pris aux pompiers d’Istres) qu’il
  ne peut plus porter assez longtemps pour marcher. Le ramener (il montera à Cornillon par les collines,
  `bastien_cornillon`) ou le laisser.
- **Karine et Noa** (`q_karine`, Grans, marqueur `karine_gra`, `gra_karine`) — si elles ne sont pas déjà avec toi :
  cachées chez le meunier. Noa a encore de la fièvre : il faut les antibiotiques de Gérard (ou d’autres).
  → `noa_soignee`, `famille_cornillon`.
- **Rudy** (`q_rudy`, péage de Lançon, marqueur `rudy_lan`, `lan_rudy`) : dans sa cabine, à sec ; Yohan est mort
  (mordu) et attaché sur le siège passager. Rudy se justifie (« J’ai ouvert pour sortir. Je comptais refermer. »).
  Lui apporter **20 litres de gasoil** (`jerrican_gasoil`) → `camion_plein`, il monte à Cornillon, et la colonne
  partira en camion ; le laisser ; le tuer (`rudy_mort`).
- **La colonne** (jour 14, 20 h, si tu es à Cornillon ; `cor_colonne`) : on part, en camion (`camion_plein`) ou à
  pied. → `colonne_partie`, `colonne_avec_toi`, `q_pont.attendre`, voyage guidé vers `mallemort`
  (`rh_colonne` / `rv_colonne`). Si tu n’es pas à Cornillon, ils partent sans toi (`colonne_sans_toi`).
- **Le camp** (`pon_camp`, en arrivant à Mallemort) : des centaines de gens sur la rive sud, des feux interdits, les
  projecteurs de l’armée en face. Attendre l’aube.
- **L’aube** (jour 15, entre 5 h et 7 h, à Mallemort ; `pon_aube` → cinématique `pont` → `pon_controle`) : la ligne
  des 200 mètres, la lieutenante Sabatier, la liste. On se déshabille sous la lampe : **une morsure, et c’est non**
  (`pon_mordu` → fin « La ligne »). Puis la liste (`pon_liste`) : quatorze noms ; celui d’Hélène est rayé, et à sa
  place, de sa main : *ceux que j’ai envoyés à la bergerie*. Si Hélène est là (`helene_sauvee`, `pon_helene`) : elle
  n’a plus de place. Lui donner la tienne (fin « Sa place ») ou traverser (`pon_traverser` → fin « De l’autre côté »).
- **Le pont manqué** (jour 15, 7 h, sans toi ; `pont_rate`) : la radio annonce la dernière ouverture, le jour 22
  (`pont_rate_1`, `q_pont.dernier`). Le jour 22 à l’aube : `pon_aube_dernier` (tu es {seul|seule} ; la colonne est
  passée sans toi), puis le même contrôle. Manqué deux fois : `pont_rate_2` → fin « Encore un jour ».

## 7. Les fins

| Fin | Drapeau | Ce qui arrive | Continuer ? |
|---|---|---|---|
| **De l’autre côté** | `fin_pont` | Tu passes le pont avec ceux que tu as gardés en vie. Un camp de l’armée à Mérindol, une douche froide, une liste qu’on appelle. Variantes : Noa guérie, Bastien, Rudy, Inès qui rallume sa radio. | non |
| **Sa place** | `fin_place` | Tu donnes ta place à Hélène. Elle passe ; tu restes sur la rive sud, avec la Durance entre toi et le reste du monde. « Un jour de plus. » | **oui** : la partie continue, sans quête |
| **La ligne** | `fin_ligne` | Mordu{|e}, tu es {refoulé|refoulée} à la ligne des 200 mètres. Ceux que tu as amenés passent. Toi, tu as encore quelques jours. | **oui** |
| **Encore un jour** | `fin_seul` | Le pont ne rouvrira plus. La radio se tait. Il reste le pays, la brume qui faiblit, et toi. | **oui** |

L’écran de fin d’une fin « continuer » propose **« Continuer à survivre »** : on reprend la partie là où elle en est
(bac à sable, comme Project Zomboid).

## 8. Drapeaux importants

| Drapeau | Posé par | Sert à |
|---|---|---|
| `refuge_arrivee`, `quarantaine_faite` | acte I | porte de la tour-porte, présence des PNJ |
| `eau_faite`, `breche_fermee`, `planches_demandees` | corvées | brèche (plan), garde, siège |
| `garde_faite` / `garde_ratee`, `helene_radio_vue` | la garde | répliques, soupçons |
| `depart_crau` | `ref_enveloppe` | la frappe, les PNJ |
| `triage_vu`, `gerard_vu`, `gerard_acheve`, `antibio_trouves` | acte II | armoire, Noa |
| `enveloppe_ouverte`, `retour_nuit`, `retour_nuit_fait`, `familles_parties` | l’enveloppe | branche de nuit |
| `frappe_faite` | la frappe | **la brume commence** (`js/game/brume.js`) |
| `siege_commence`, `siege_tenu`, `refuge_tombe`, `fernand_cloche`, `refuge_fui` | acte III | états du Refuge (vivant / siège / tombé) |
| `noa_avec`, `helene_sauvee`, `helene_restee`, `helene_vue_chute` | la chute | qui vit, qui est où |
| `brume_vue`, `cornillon_arrivee`, `pont_annonce` | acte IV | ouverture du pays, sirènes |
| `bastien_trouve`, `bastien_cornillon`, `noa_retrouvee`, `noa_soignee`, `famille_cornillon`, `rudy_trouve`, `camion_plein`, `rudy_cornillon`, `rudy_mort` | acte V | la colonne, les variantes de fin |
| `colonne_partie`, `colonne_avec_toi`, `colonne_sans_toi`, `pont_fait`, `pont_rate_1`, `pont_rate_2` | le pont | final |
| `fin_pont`, `fin_place`, `fin_ligne`, `fin_seul` | fins | écran de fin |

## 9. Systèmes que l’histoire demande au moteur

- **Voyage guidé** : effet de scène `voyage: { vers, indication: true }` — on part tout de suite, sans carte, sur un
  trajet tracé ; les rencontres scénarisées se déclenchent aux fractions `a` du trajet.
- **Sorties gardées** : `e.sortie(x, y, w, h, { si, message })` — une sortie fermée tant que la condition est fausse,
  qui dit pourquoi (la bergerie la nuit, la Poudrerie pendant l’attente).
- **Mort qui pose un drapeau** : `e.zombie(type, x, y, { flagMort })` (Gérard).
- **Conditions** : `lieu` (le lieu où l’on est), `et`, `non`, `jourMax`, `heureMin`, `heureMax`, `mordu`.
- **Effet** `retirer: [['planche', 4]]` (consommer des objets dans une scène).
- **La brume** (`js/game/brume.js`, `REGLAGES.brume`) : active après `frappe_faite` ; la nuit (21 h → 8 h), sans
  mistral ni pluie, dans les lieux bas (`BAS`), de plus en plus faible ; le jour 4, la gare seulement, puis elle
  s’étend. Dans un lieu touché : un voile jaune-vert, la vue réduite, la toux, des PV perdus et le mal de poitrine ;
  rien au premier étage ; à moitié avec un foulard mouillé ; rien avec un **masque à gaz** muni d’un filtre (un filtre
  dure 8 heures de brume). Annoncée par l’odeur un peu avant, et par la radio. Mort : `brume`.
- **Fins qui continuent** : `continuer: true` dans `fins.js`.
- **Sirènes** : elles ne commencent qu’à l’acte V (`pont_annonce`), sauf celles de la nuit du jour 2, qui ne sont
  qu’un son et une scène.

## 10. Conventions d’écriture et de données

- **Tutoiement**, co-op compatible : aucun texte ne suppose qu’on est seul ou à deux. Genre : `{masculin|féminin}`.
- **Charte** : `docs/CHARTE_ECRITURE.md` (récit fluide, phrases liées, sensations par le personnage, aucune
  phrase sans verbe en série) et `docs/RETOURS_JOUEUR.md` P9 pour l’interface.
- Apostrophe typographique `’` dans les textes. Le mot « mort » désigne les créatures (jamais « zombie »).
- `illu` d’une scène = un id de **décor** (§11). Musique des scènes : `calme | sombre | tension | combat | mort | null`.
- Conditions : `{ quete: ['id', 'etape'] }` = étape **courante**. Plusieurs drapeaux : `et: [{…}, {…}]`.
- Les scènes-menus des PNJ (`*_parler`) reviennent à elles-mêmes ; « Partir » → `#fin`.
- Un effet `combat` reprend à `suivant` quand le combat se termine (victoire **ou** fuite).

## 11. Cinématiques et décors

Direction (demande du propriétaire, 25 oct. 2026) : **des plans tournés dans Blender**, sobres, crédibles, sans
réalisme extrême mais **sans dessin animé** ; des **mains bien faites** (vue à la première personne : peau, ongles,
plis, poussière, poignets, manches). Lumière naturelle, caméra portée, grain léger. Rendu : `tools/blender/cine/`
(`plans3.py`, `omd_mains.py`). Chaque plan a un `clip` ; le décor est le repli si la vidéo manque, et sert de vignette
aux scènes (plaque photo `img/cine/<décor>.webp` : une image du clip tourné, `plaques_histoire.py`).
Les **vignettes fixes** des scènes (`refuge_place`, `triage_horde`…) sont de **vraies photos 360°** Poly Haven, cadrées
et étalonnées (`plaques_photo.py`, cadrages dans `vignettes_photo.py`), avec, quand il le faut, des éléments 3D
incrustés sous la lumière de la photo (`composites.py` : la horde, les morts du péage, la bergerie). Les scènes n'en
montrent souvent que la bande centrale (panneau vertical) : ce qui compte doit être au milieu.

### Les cinématiques

**`intro`** (titre) — *Le message.*
1. `intro_1` (`crau_aube`) — La Crau au lever du jour, une route droite, une voiture brûlée, des pylônes. « Pays
   salonais. Trois semaines après le Mercredi, le jour où le marché de Salon s’est mis à mordre. »
2. `intro_2` (`mains_radio`) — Gros plan, première personne : deux mains sales tiennent un petit poste à piles ; le
   pouce tourne la molette ; le grésillement. « Depuis vingt jours, tu survis {seul|seule}. Il y a deux jours, ta radio
   a capté une voix. »
3. `intro_3` (`voie_ferree`) — Première personne, on marche sur le ballast d’une voie unique vers une colline ; en
   haut, des remparts et un clocher dans le soir. « “Ici le Refuge de Miramas-le-Vieux. Nous accueillons les
   survivants. Venez à la porte Notre-Dame. Montrez vos mains.” »
4. `intro_4` (`refuge_porte`) — Contre-plongée sur la porte : un arc de pierre doublé de palettes et de tôles, une
   silhouette sur le rempart, le faisceau d’une lampe qui descend sur toi. « “Stop ! Montre tes mains !” »
5. `intro_5` (`mains_levees`) — Première personne : les mains se lèvent dans le faisceau, paumes ouvertes, puis
   retroussent les manches et tournent les avant-bras, lentement. « Pas de morsure. Pas encore. » (attendre)
6. `intro_6` (`noir`) — Carton « One More Day ». (attendre)

**`frappe`** (tension) — *La gare.*
1. `frappe_1` (`crau_aube`) — L’aube sur la Crau depuis la bergerie ; Fernand de dos, bâton en main ; deux avions
   passent très bas. « Le grondement arrive avant les avions. »
2. `frappe_2` (`triage_feu`) — Au loin, la gare de triage : explosions en chapelet, une boule de feu, puis un nuage
   jaune-vert qui roule au ras du sol au lieu de monter. « Puis le feu, et après le feu, quelque chose de jaune qui ne
   monte pas. »
3. `frappe_3` (`mains_enveloppe`) — Première personne : une main tient l’enveloppe d’Hélène, l’autre se crispe
   dessus ; au fond, flou, le nuage. « “À n’ouvrir que si le Refuge tombe.” » (attendre)

**`chute`** (combat) — *La porte.*
1. `chute_1` (`refuge_nuit`) — Le rocher de nuit, les remparts éclairés par des torches, une masse sombre qui monte
   la pente. « Ils montent par centaines. »
2. `chute_2` (`mains_corde`) — Gros plan : de vieilles mains noueuses tirent la corde d’une cloche ; la corde
   remonte, retombe. « Fernand sonne. »
3. `chute_3` (`refuge_nuit`) — Dans la rue, les morts tournent tous la tête vers l’église et s’y dirigent. « Et ils
   vont tous vers lui. » (attendre)

**`brume`** (sombre) — *L’étang.*
1. `brume_1` (`etang_nuit`) — L’étang de Berre sous la lune ; une brume basse, jaunâtre, avance sur l’eau.
2. `brume_2` (`poudrerie_brume`) — Le parc de la Poudrerie : la brume coule entre les platanes ; une silhouette en
   sort, sans bruit.
3. `brume_3` (`mains_foulard`) — Première personne : une main plaque un foulard mouillé sur le bas du visage ; l’autre
   s’appuie au tronc ; la toux. (attendre)

**`cornillon_aube`** (calme) — *La mer jaune.*
1. `cornillon_1` (`cornillon_belvedere`) — Du belvédère de Cornillon : la plaine noyée sous une brume jaune, d’où
   dépassent des clochers, des pylônes, la tour d’une usine ; l’étang qui brille.
2. `cornillon_2` (`mains_carte`) — Première personne : des mains déplient une carte routière sur le muret ; un doigt
   suit la route jusqu’à la Durance. (attendre)

**`pont`** (tension) — *L’aube du mercredi.*
1. `pont_1` (`durance_pont`) — La Durance à l’aube, le pont suspendu entre ses pylônes de pierre, les projecteurs.
2. `pont_2` (`mallemort_camp`) — La foule de la rive sud qui se lève, des couvertures, des enfants portés.
3. `pont_3` (`mains_liste`) — Première personne : une main gantée de soldat tend une feuille ; tes mains la prennent.
   (attendre)

**Fins** : `fin_pont` (`mallemort_camp` puis `camp_refugies`), `fin_place` (`durance_pont`, `mains_feu`),
`fin_seul` (`cornillon_belvedere`, `mains_feu`). La fin « La ligne » reprend `fin_seul`.

### Les décors (vignettes et replis)

Images des plans tournés, ou photos réelles pour les vignettes fixes. Les anciens décors encore utiles sont gardés
(`durance_pont`, `camp_refugies`, `plaine_route`, `nuit_campagne`, `crau_mistral`).

- **`crau_aube`** — la Crau à l’aube : galets, herbe rase, une route droite, des pylônes, une voiture brûlée.
- **`mains_radio`** — gros plan sur des mains qui tiennent un poste à piles.
- **`voie_ferree`** — une voie unique dans le soir, la colline de Miramas-le-Vieux et ses remparts.
- **`refuge_porte`** — la porte Notre-Dame la nuit : arc de pierre, palettes, tôles, la lampe du guetteur.
- **`mains_levees`** — mains levées dans un faisceau de lampe, manches retroussées.
- **`noir`** — fond noir (cartons de titre).
- **`refuge_place`** — la place du Refuge le jour : l’église, le linge, le camion bâché, le puits.
- **`refuge_nuit`** — les remparts la nuit, les torches, la pente en contrebas.
- **`refuge_cellule`** — la cellule de quarantaine : voûte, matelas, bougie, judas.
- **`refuge_donjon`** — le donjon d’Hélène : une table, le poste radio des gendarmes, le carnet.
- **`triage_horde`** — la gare de triage vue du pont : des trains, des milliers de silhouettes, les wagons blancs.
- **`triage_feu`** — la gare de triage en feu, le nuage jaune.
- **`bergerie_crau`** — la bergerie de Cabassole : long bâtiment de pierre, puits à balancier, enclos.
- **`bergerie_nuit`** — le mas la nuit : la cheminée, Fernand, la soupe.
- **`mains_enveloppe`** — une enveloppe entre deux mains.
- **`mains_corde`** — des mains âgées sur une corde de cloche.
- **`etang_nuit`** — l’étang de Berre la nuit, une brume basse.
- **`poudrerie_parc`** — le parc de la Poudrerie : platanes, canal, maison du gardien.
- **`poudrerie_brume`** — le même parc noyé de brume jaune.
- **`mains_foulard`** — un foulard mouillé plaqué sur le visage.
- **`cornillon_belvedere`** — la plaine sous la brume vue de Cornillon.
- **`mains_carte`** — une carte routière dépliée sur un muret.
- **`mallemort_camp`** — le camp de la rive sud à l’aube.
- **`mains_liste`** — une feuille tendue par une main gantée.
- **`mains_feu`** — des mains au-dessus d’un petit feu.
- **`peage_lancon`** — le péage de Lançon : sept voies de voitures, un camion bâché.
- **`grans_moulin`** — le vieux moulin de Grans au bord de la Touloubre.
- **`istres_pharmacie`** — l’arrière-boutique d’une pharmacie, des rideaux tirés.
- **`durance_pont`** — la Durance, le pont suspendu et ses pylônes de pierre, la rive nord tenue par l’armée.
- **`camp_refugies`** — un camp de toile au bord du Rhône, l’automne.
- **`plaine_route`** — une départementale entre oliviers et vergers, les Alpilles au loin.
- **`nuit_campagne`** — un chemin de campagne la nuit, une borne kilométrique.
- **`crau_mistral`** — la plaine de la Crau sous le mistral.
