# One More Day — Bible de l’histoire

> Document du **scénariste**. Il fait foi pour l’intrigue, les personnages, la structure, les drapeaux et les
> **briefs des décors** de cinématiques. Données : `js/data/histoire/*.js`, `js/data/cinematiques.js`.
> Commande aux concepteurs de niveaux : `docs/NIVEAUX_BESOINS.md`. Vérification : `node tools/verifier_histoire.mjs`.

---

## 1. Pitch

Salon-de-Provence, septembre. Trois semaines après le Mercredi — le jour où le grand marché s’est mis à mordre —,
tu te réveilles dans une housse mortuaire, dans un caveau du cimetière Saint-Roch, avec ton nom sur une étiquette au
pied : *décès constaté le 6 septembre, cause : morsure*. Tu étais mort. Tu es revenu. Dans ta poche, le mot d’une
inconnue : *« Viens à la Tour de l’Horloge. »* Quelqu’un t’attendait — et ce qu’elle sait tient en quatre mots :
**un pour un**. Les morts peuvent revenir, à condition de manger un vivant. Toi, tu en as mangé un. Et l’armée, massée
derrière la Durance, attend le premier coup de mistral pour brûler tout le pays salonais… et le secret avec.

**Logline** : un·e revenant·e doit choisir ce que vaut un mort — alors qu’il ou elle en est la preuve vivante.

## 2. La question centrale (et ses relances)

| Moment | La question que se pose le joueur |
|---|---|
| Prologue (5 premières minutes) | **« J’étais mort. Pourquoi est-ce que je respire ? »** — et *qui m’attendait* ? |
| Chapitre 1 | **« Qu’est-ce que Maud m’a fait ? »** → réponse (hôpital) : *on m’a fait manger quelqu’un*. Relance : **« Qui ? »** (page 14 arrachée ; l’index du registre dit *Arnaud L.* ; le casier dit *Pour Jo* ; le souvenir dit *« Jo »*). |
| Chapitre 2 | **« Est-ce que je vais le lui dire ? »** — Joëlle, la veuve de Luc, t’accueille ; Clémence, sa fille, reçoit l’insuline pour laquelle son père est mort. Puis : **« Que vaut un mort ? »** (le Berger, les revenus, Rose). |
| Final | **« Que faire de la vérité ? »** — Orsini révèle que l’armée sait tout depuis le rapport de Maud : *« On ne brûle pas des morts. On brûle une idée. »* Se taire, parler, ou mener le troupeau. |

## 3. Le thème : « Un pour un »

Tout le monde, dans cette histoire, a payé une vie avec une autre, et a tort d’une manière compréhensible :
- **Vidal** a fermé la grille sur un inconnu (toi) pour sauver dix-huit élèves.
- **Maud** a donné des mourants — et un homme qui ne l’était pas tout à fait — à ses patients morts.
- **Joëlle** a refusé sept réfugiés de Sénas pour que Calès tienne.
- **Le Berger** mène les morts vers les vivants pour que chacun des siens revienne.
- **Orsini** brûle une région pour qu’une idée ne passe pas le fleuve.
- **Toi** : tu respires parce que Luc Arnaud ne respire plus.
Le titre dit ce que chacun achète : **un jour de plus**.

## 4. Ce qui est arrivé au monde (la vérité)

**L’agent** (jamais nommé ; les soignants disent « l’agent », les survivants « le Mercredi », les militaires « agent M »).
- Morsure → fièvre → arrêt cardiaque en 3 à 30 h → « l’état » : cœur à 2-4/min, température ambiante, activité cérébrale
  de base, faim. Ce ne sont pas des morts : ce sont des **patients** (Maud) — mais on ne peut pas les soigner.
- Les morts **reviennent quelque part** : chacun retourne là où il est mort ou à un geste d’habitude (le marché, la messe,
  la porte du château). Ils suivent le **bruit** — et les **cloches** plus que tout.
- **Un pour un** : si un infecté mange un adulte entier dans les 48 h suivant sa transformation, l’agent se sature et
  s’endort : **dormance** (inerte, glacé, apparemment mort) de **4 à 14 jours** — plus longue au froid —, puis **réveil**.
  Une fois sur trois environ, le réveil est **lucide** (« revenu ») ; sinon **raté** (quelques minutes de conscience,
  puis rechute, puis mort). Le revenu garde **le souvenir du goût** et de la personne mangée.
- Un revenu : mains froides, ~35 °C, la bouche qui se remplit quand une cloche sonne (conditionnement : Maud agitait une
  clochette pour nourrir ses patients ; le Berger mène les siens aux sonnailles). Les morts le **reniflent et passent**
  plus volontiers (« il sent le froid »). Mordu de nouveau, l’agent se réveille : le « mal » remonte (cf. GAMEPLAY §5.4).

**Chronologie** (J0 = mercredi 2 septembre 2026, jour de grand marché) :

| Date | Événement |
|---|---|
| J0, 10 h 40 | Cours Carnot, devant l’étal du fromager : première morsure. 21 h 10 : l’horloge de la Tour s’arrête, comme en 1909. |
| J1 (3/09) | Confinement préfectoral. Cellule de crise (Maud, Orsini). Vidal enfermé à l’Empéri avec sa classe depuis J0. Aux urgences, P1 dévore un vieil homme et s’endort. |
| J2-J3 | Repli de l’armée sur la **ligne Durance** (PC Durance à Mérindol, Cdt Sabine Orsini). Le fils du Berger est abattu à un barrage de la D113. Rose Castagne est mordue (1/09 au soir) puis mange Kylian Ruiz (3/09). |
| J4 (6/09), 17 h 52 | **Toi** : pour la vidéo de ton téléphone, devant la grille de l’Empéri, Vidal te repousse. Tu es mordu, tu meurs, tu te relèves. Tu reviens tous les jours à 17 h devant la porte (dessins de Lou). |
| J5 (7/09) | P1 se réveille lucide (4 jours de dormance, box à 30 °C). |
| J6 (8/09) | Maud capture P4 (toi) à la perche. **Elle envoie son rapport** à la cellule de crise et au PC Durance. P1 se jette du toit. |
| J8 (10/09) | Luc Arnaud (Lamanon), venu chercher de l’insuline, blessé à la jambe, est amené par Lou et Samir à l’Empéri puis à l’hôpital. |
| J9 (11/09), 3 h 10 | Maud **nourrit P4 avec Luc** (sédation). Page 14. |
| J10 (12/09) | Samir tombe du rempart ; donné à P5 (Mireille, la pharmacienne). L’armée vide l’hôpital : les corps inertes (P3, P4) partent au cimetière Saint-Roch, « lot 14 ». Maud glisse un mot dans leurs poches et se réfugie chez Nostradamus avec P5. |
| J11 (13/09) | Paris décide **Cautère** (incendie de la zone au premier mistral) et le **Protocole R** (cacher les revenus). |
| J14-J16 | Rose se réveille lucide. Le Berger comprend, prend ses sonnailles et commence la **transhumance à rebours** dans la Crau. La BA 701 tombe (J14-15). |
| **J21 (mer. 23/09)** | **Jour 1 du jeu** : tu te réveilles. Trois semaines jour pour jour après le Mercredi. |

## 5. Ce que le joueur découvre, et quand

| Découverte | Où | Par quoi |
|---|---|---|
| Déclaré mort, lot 14 | Prologue, cimetière | étiquette, registre, fiche de ramassage |
| Quelqu’un attend les réveils | Prologue | mot de « M. » ; Patrick (P3) qui revient « mal » |
| La faim devant les cloches | Prologue, Tour | scène `pro_cloches` (salive) |
| Cautère, le mistral | Ch1 matin | Maud, scanner |
| Tu étais « le Client » au pied du château ; Vidal t’a repoussé | Ch1, Empéri | carnet de Lou, sac rouge, vidéo |
| **Un pour un** ; tu as mangé quelqu’un | Ch1, hôpital | registre, souvenir de la salle 4 |
| Le donneur s’appelle Arnaud, sa femme « Jo » | Ch1, hôpital (lecture attentive) | index du registre, casier « Pour Jo », dossier (3 h 10) |
| Deux fois sur trois, c’est raté | Ch1 | Mireille (P5) |
| Le Berger et son troupeau | Ch1 fin | nuit des sonnailles, aube |
| Jo, c’est Joëlle ; Clémence ; l’insuline | Ch2, Calès | arrivée |
| Luc avait des antibiotiques : Maud a *choisi* | Ch2, procès | Joëlle |
| Les revenus existent en nombre | Ch2, Vernègues | Nadège, le Berger, Rose |
| L’armée sait (Protocole R), Cautère cite le rapport de Maud | Ch2, BA 701 | documents |
| **C’est le rapport de Maud qui a déclenché Cautère** : on brûle l’idée | Final | Orsini |

## 6. Personnages

**Toi** — prénom et genre choisis. Arrivé·e à Salon le 30 août pour les vendanges (un domaine près de Pélissanne), sans
attaches ici. Téléphone, sac rouge, *Colline* de Giono. Mordu·e le 6/09, revenu·e le 23/09. Arc : de « pourquoi moi ? »
à « qu’est-ce que je fais de ce que je suis ? ». Les textes n’accordent jamais au genre sans `{masculin|féminin}`.

**Maud Sérane** — 55 ans, cheffe des urgences. Anorak rouge sur blouse, stéthoscope en chapelet, cigarettes brunes
qu’elle écrase « jusqu’à ce qu’il n’en reste rien ». Sèche, précise, drôle à froid. *Veut* : prouver que les morts sont
des patients et empêcher qu’on les brûle ; te garder, toi, son « meilleur cas ». *A tort* : elle s’est donné le droit
de choisir qui sert de nourriture — et elle a choisi Luc, qui aurait pu vivre. *Secret* : la page 14 dans sa blouse.
*Ironie* : son rapport a déclenché Cautère. *Sort* : pendue à Calès, chassée (elle rejoint le Berger, heureuse :
« des centaines de cas »), gardée pour l’armée, libérée (elle part vers Orsini et te laisse la page 14), livrée au Berger,
ou tuée par toi (« Cinquante-deux. Tu es en pleine forme. »). Au procès, si tu l’as protégée, **elle mange la page 14**
pour te couvrir. Portrait `maud`.

**Julien Vidal** — 44 ans, prof d’histoire-géo au lycée de l’Empéri, pull de laine bleue, lunettes au sparadrap. Fait
cours tous les matins « tant qu’il y a un cours, il y a un lendemain ». *Veut* : garder ses élèves en vie. *A tort* :
sa règle (« montre tes bras ») et sa main du 6 septembre. *Arc* : confronté à la vidéo (pardon, aveu, menace). Mordu en
tenant la poterne pendant la nuit des sonnailles (ou abandonné derrière la grille — *le même geste*). Refuse d’être
ramené : « Lequel tu me donnerais ? » Meurt en récitant « onze juin 1909, vingt et une heures dix ». Portrait `vidal`.

**Lou (Louise) Mercadier** — 15 ans, élève de Vidal, cheveux coupés aux ciseaux de cuisine, carnet à dessin. Elle t’a
dessiné mort six fois (« le Client »). La première à savoir ce que tu es, et à garder le secret. Elle filme ton
témoignage et note les adresses des rédactions. Survit dans toutes les fins ; son dessin clôt la fin « vers le feu ».
Portrait `lou`.

**Joëlle « Jo » Arnaud** — 50 ans, ancienne guide des grottes de Calès (rouvertes en avril 2025), cheffe du refuge.
Chaleureuse, dure, drôle. *Veut* : Clémence en vie, passer la Durance. *A tort* : elle a refusé sept réfugiés de Sénas
(« Je n’aurais pas dû. J’aurais dû. »). *Secret du joueur* : son mari Luc est celui que tu as mangé. Réactions selon la
manière dont elle l’apprend : aveu immédiat (gifle, puis « On va faire comme Luc »), aveu au procès, révélation par
Maud (la salle veut te tuer, elle l’empêche), ou jamais (tu lui mens, elle te raconte Luc le soir). Portrait `joelle`.

**Clémence Arnaud** — 9 ans, diabétique de type 1. « T’as vu mon papa, à Salon ? » ; « Est-ce qu’il te parle ? ».
Apprend au chien roux (Pistache) à donner la patte. Portrait `clemence`.

**Luc Arnaud** — 51 ans, électricien, moustache, peur du sang. N’existe que par ses traces : la lettre « Pour Jo », la
photo de Calès, l’insuline, le dossier (« réservé » barré, « nul » au-dessus), la page 14, et un mot dans ta mémoire :
« Jo ».

**Le Berger — Baptistin Castagne** — 70 ans, berger de la Crau, cinquante-deux transhumances jusqu’à l’Ubaye. Chapeau
de feutre, cape de laine, houlette, un patou et un border colley vivants. Doux, courtois, terrifiant. *Veut* : ramener
« tout un pays » — chacun des siens mangera un vivant au-delà de la Durance (« une très grande estive »), et venger son
fils Marius, abattu à un barrage pour une angine. *A tort* : il échange des vivants contre ses morts. Propose un marché :
la médecin contre le salut de Calès. Portrait `berger`.

**Rose Castagne** — 63 ans, première revenue. Porte le **redon**, la grosse cloche que suit tout le troupeau (« la voix
de la mère »). Se souvient du goût de Kylian, 16 ans, qui lui apportait des œufs. « On ne revient pas. On repart
d’ailleurs, avec quelque chose en moins et quelqu’un en plus. » Si tu l’écoutes, elle te promet le redon au pont.
Portrait `rose`.

**Nadège** — caporal-chef de l’escadron de protection de la BA 701, revenue le 19. Sonnaille au cou, main froide.
Messagère du Berger, t’épargne dans la rue de l’Horloge, te guide à la base. Portrait `nadege`.

**Commandante Sabine Orsini** — 50 ans, cheffe du PC Durance. Voix de la radio. Pas un monstre : une officière qui
exécute Cautère en sachant ce que c’est. Laisse passer ta brûlure « bien ronde ». Salue, dans la fin sombre.
Portrait `orsini`.

**Seconds rôles** : Patrick Veyrier (P3, chauffeur de car, revient « mal » dans sa housse) ; Mireille (P5,
pharmacienne, « Où est ma fille ? ») ; Karim (brancardier devenu colosse) ; Nathan (meilleur ami de Lou, enfermé devant
le tombeau de Nostradamus) ; Samir (donné à P5) ; Enzo (11 ans, mordu en silence) ; Théo (la poterne) ; Hugo, Mehdi ;
Fernand (84 ans, hanche en titane) ; Imbert (Sénas, la chambre froide) ; Athos 6 (pilote de la Patrouille, sanglé dans
son Alphajet) ; Yanis (revenu, cariste à Clésud, qui veut revoir sa mère aux Canourgues).

**Portraits** (clé `portrait` des PNJ) : buste, trois-quarts, fond sombre, lumière chaude latérale ; mêmes palettes que
les décors. `maud` (anorak rouge, blouse, stéthoscope, cigarette), `vidal` (pull bleu, lunettes sparadrap, barbe),
`lou` (cheveux courts irréguliers, sweat trop grand, stylo derrière l’oreille), `joelle` (gilet de guide, cheveux gris
courts, carabine en bandoulière), `clemence` (queue de cheval, lecteur de glycémie au cou), `berger` (feutre,
moustache jaunie, cape brune), `rose` (visage fin, yeux très clairs, le redon contre la poitrine), `nadege` (treillis,
sonnaille), `imbert` (casquette de coopérative, barbe blanche), `orsini` (treillis, parka, cheveux gris tirés).

## 7. Structure

Durée visée : **4 h 30 à 6 h** (prologue 30-40 min, chapitre 1 ≈ 1 h 45-2 h, chapitre 2 ≈ 1 h 45-2 h 15, final 20-30 min).

### Lieux clés (11, tous dans `lieux.js`)

| Lieu | Chapitre | Rôle |
|---|---|---|
| `cimetiere` (Saint-Roch) | Prologue | réveil, tutoriel d’exploration |
| `tour_horloge` | Prologue | les cloches, Maud |
| `nostradamus` | Ch1 | refuge de Maud (hub), la cave de P5 |
| `emperi` | Ch1 | Vidal, Lou, la radio, le sac rouge, le siège |
| `saint_laurent` | Ch1 | la nef des morts debout, Nathan, Lou |
| `hopital` | Ch1 | le registre, la salle 4, Luc |
| `cales` | Ch2 | hub des vivants, Joëlle, le procès, l’antenne |
| `mallemort` | Ch2 + final | le pont, la ligne Durance |
| `vernegues` | Ch2 | les revenus, le Berger, Rose |
| `ba701` | Ch2 | la radio, les codes, Cautère, Protocole R |
| `senas` | Ch2 (facultatif) | la cloche, la chambre froide |

Aucun lieu supplémentaire n’est nécessaire. (Proposition facultative, si l’on veut un 12e lieu : le **pont suspendu de
Mallemort** comme lieu distinct du pont routier — aujourd’hui les deux sont dans `mallemort`.)

### PROLOGUE — « Lot 14 » (tutoriel : les trois temps un par un)

Démarrage : cinématique `intro` → `explorer('cimetiere', { entree: 'caveau' })` → `pro_reveil` (avance le temps de 11 h :
on sort du caveau vers 19 h, lumière de fin de jour).
1. **Exploration** (cimetière) — apprendre : se lever, fouiller (`pro_scelle` : téléphone, portefeuille, mot de Maud),
   trouver de la lumière (`pro_soldat` : lampe frontale), boire (`pro_robinet`), lire (registre, cahier du gardien),
   décrocher le plan de Salon punaisé au mur de la loge, derrière lequel le gardien, mort dans son fauteuil, a caché le double de la clé, noué à son poignet par une ficelle : la prendre le réveille, toujours (`pro_loge_plan` → `pro_loge_cle` → `pro_loge_reveil`), sortir (`pro_grille` : la clé seulement — barbelé de l’armée, pas d’escalade).
   Moment fort facultatif : Patrick (P3) dans sa housse (`pro_patrick`).
2. **Carte + voyage** — une seule destination marquée : la Tour. Rencontre `rh_pro_marche` (choix : traverser le marché
   mort, contourner = détour, regarder) puis `rh_pro_premier` (**premier combat**, un serveur, `tutoriel: true`).
3. **La Tour** — `pro_horloge` (lumière levée), cinématique `pro_cloches`, choix **chronométré** `pro_cloches` (courir,
   marcher parmi eux, ou céder à la faim et aller vers les cloches → combat), montée, `pro_mecanisme`, `pro_maud`,
   cinématique `pro_sommet`, `pro_fin` (téléportation chez Nostradamus, cinématique `ch1_intro`).
Drapeaux : `pro_note_lue`, `patrick_acheve`/`patrick_laisse`, `pro_suivi_cloches`, `pro_marche_parmi_eux`, `prologue_fini`.

### CHAPITRE 1 — « Les vivants » (Salon)

Quête principale `q_protocole` :
1. `ch1_matin` — Maud : le Mercredi, la ligne Durance, **Cautère**, la radio de Vidal. `nos_bras` : **cautériser la
   morsure au fer rouge** (brûlure, drapeau `cicatrice_brulee`), la bander (`bras_bande`) ou la montrer (`bras_nu`).
2. `emp_arrivee` — l’inspection des bras à la porte de l’Empéri. Statuts : `emp_statut` = `normal`, `immunise`
   (quarantaine) ou `rejete` (Vidal ne parle qu’à travers la grille).
3. **Saint-Laurent** — la nef pleine de morts debout ; la clochette du prêtre couvre tes pas (**discrétion** : tant
   qu’elle sonne) ; voler la clé de la sacristie (`stl_cure`) ; Nathan derrière la grille du tombeau (`stl_nathan`) ;
   Lou dans le clocher (`stl_lou`) ; sortie par la sacristie (`stl_sortie`).
4. `emp_retour_lou` puis `emp_radio` : le PC Durance ne répond qu’**authentifié**.
5. **L’hôpital** — `hop_brancardier` (boss : Karim), `hop_salle4` + cinématique `souvenir_cloche` (« Jo »),
   `hop_registre` (**un pour un**, page 14 arrachée), `hop_casier` (« Pour Jo »), `hop_frigo` (l’insuline),
   `hop_bureau` (rapport du 8/09), `hop_dossiers` (Luc : 3 h 10).
6. **Retournement** — `ch1_confrontation` : Maud avoue ; Mireille (P5) se réveille, dit « Où est ma fille ? », rechute
   (combat) ; « RATÉ ». Choix : **garder le secret** (`maud_protegee`) ou **dénoncer à Vidal** (`maud_denoncee` →
   `emp_denonciation`, `emp_arrestation` : Maud enfermée dans la chapelle).
7. **La nuit des sonnailles** — cinématique `nuit_sonnailles` ; en chemin, `rh_ch1_cours` (Nadège t’épargne) ;
   `ch1_siege_1` : trois postes (porte / remparts / chapelle — Enzo), puis `ch1_siege_crise`, **choix chronométré** :
   fermer la grille sur Vidal (le même geste que lui), attendre, ou sortir. Vidal mordu : « Lequel tu me donnerais ? »
8. **L’aube** — cinématique `aube_troupeau` (le Berger et Rose en tête) ; la radio de Calès : « Ici Jo » ; départ vers
   le nord (`ch1_fin`, cinématique `ch2_intro`). Le troupeau a **vidé Salon** de ses morts (`troupeau_passe`).
Secondaire `q_sac_rouge` : le carnet de Lou → le sac dans les ronces → téléphone chargé → **la vidéo du 6 septembre**
→ confrontation avec Vidal (`emp_vidal_6sept`).

### CHAPITRE 2 — « La transhumance » (le pays salonais)

Quête principale `q_traversee` :
1. **Calès** — `cal_arrivee` (les bras, encore) ; `cal_insuline` : tu donnes à Clémence l’insuline de son père.
   Choix décisif : dire « À l’hôpital », « Je ne sais pas », ou **« C’est moi qui l’ai mangé »** (`aveu_precoce`).
   La lettre « Pour Jo » : la donner (espoir ou vérité) ou la garder.
2. **Mallemort (reconnaissance)** — le mur de conteneurs, le pont suspendu qui chante, le 200 M rouge, les corps ;
   `mal_ligne` : reculer, crier (fréquence 4), ou avancer (balle).
3. **Le procès** (`cal_retour`) — trois ouvertures selon l’état : `cal_proces_a` (tu as déjà avoué), `cal_proces_b`
   (Maud captive : elle tient la page 14 et te regarde), `cal_proces_c` (Maud médecin adorée : tu peux mentir pour elle).
   Retournements : **Luc avait des antibiotiques** (Maud a choisi) ; **Maud mange la page 14** pour te couvrir.
   Verdict : pendre, chasser, garder pour l’armée. Nuit avec Joëlle : « Est-ce qu’il a eu mal ? » — « Il a dit ton nom. »
4. **Les revenus** — `rh_ch2_revenus` (Nadège t’invite) ; **Vieux-Vernègues** (cinématique `vernegues`) : une
   communauté de revenus qui te **reconnaît** ; le Berger (marché : la médecin contre le salut de Calès ; une sonnaille
   pour marcher devant) ; **Rose** et le secret du **redon** (`rose_promesse`).
5. **BA 701** (cinématique `ba701`) — Fouga pendu, rangers alignées, Alphajets ; le lieutenant de permanence ;
   l’armoire forte : **valise radio**, **classeur d’authentification**, **ordre Cautère** (« Réf. : rapport Dr M. S.,
   08/09 ») et **Protocole R** ; Athos 6 sanglé dans son cockpit.
6. **L’appel** (`cal_contact`) — Orsini : le pont suspendu ouvert **une heure**, à l’aube du premier mistral ;
   contrôle des bras ; « Sérane, je la veux vivante ».
7. **Un jour de plus** (facultatif, `q_jour_de_plus`) — ouvrir la **martelière du canal de Craponne** (la draille
   noyée, mais la citerne de Calès baisse) ; sonner la **cloche de Sénas** (détourner le troupeau… vers la chambre froide
   des Imbert — ou pour rien, si tu les as convaincus de partir). Ou : livrer Maud au Berger (`berger_contourne`).
   Chaque délai (`jour_gagne`) donne de l’avance à la colonne au final.
8. **Le témoignage** (facultatif, `q_temoignage`) — Lou filme ta confession ; tu peux filmer aussi Maud et Rose.
9. `ch2_veille` — exige d’être allé à Vernègues — la dernière nuit, la guitare à cinq cordes, le vent qui arrive.

### TRANSVERSAL — « Les sirènes » (le rabattage de l’armée : tenir dans la nature)

Avant Cautère, l’armée **rabat** les morts vers le sud : elle a repris le réseau des sirènes d’alerte (celles du
premier mercredi du mois) et fait passer des drones à haut-parleurs. Quand une zone hurle, **tous** les morts qui
l’entendent se lèvent et **courent** vers le bruit pendant un jour ou deux, d’autres accourent : la zone devient un
abattoir, et les collines se vident. Il faut sortir et **tenir** : la **chaîne des Côtes** (pinède, le cabanon de chasse
du grand-père de Lou, une source), la **Crau** (coussouls, bergerie, puits) ou la **Touloubre** (rivière, vieux moulin,
jardins ouvriers). Données : `js/data/histoire/ruees.js`, scènes `scenes_ruees.js`, moteur `js/game/ruees.js`.
- Ch1 : une fois la radio de l’Empéri essayée (`radio_essayee`), elle capte l’armée en clair (`ru_salon_annonce`) :
  sirènes sur **Salon** 16 h plus tard, pendant 30 h (quête `q_sirenes` : quitter la ville → tenir → fin).
- Ch2 : à l’étape `ba701`, la fréquence 4 annonce le rabattage des **villages de la plaine** (`ru_plaine_annonce`,
  quête `q_sirenes_plaine`).
- Ensuite, tous les 3 à 5 jours (dès le jour 3 pour les hordes) : des **sirènes** (Salon avant `troupeau_passe`, la
  plaine après) ou une **horde** qui traverse un lieu connu (un bourg, un quartier — souvent un lieu où l'on est déjà
  allé : ta base). Jamais pendant la nuit des sonnailles, le siège, ni après `mistral_leve`.
- **La radio** (`js/game/radio.js`) : sans radio, on est **pris par surprise** (un quart d'heure de drones, 25 min de
  grondement, et seulement sur place). Avec une radio, on le sait ~12 h (sirènes) ou ~8 h (horde) avant, et le
  bulletin météo annonce pluie, **orage**, mistral, brouillard une heure avant. Une radio est **lourde et encombrante** :
  ni sac ni dos, on la porte à deux mains, ou on la pose au camp (posée à portée de bras, elle parle encore). Le
  **poste radio** (trouvé) veut des piles ; la **radio à manivelle** se bricole (mécanique 2, ou la revue de mécanique,
  le manuel de bricolage, le guide de survie).

### FINAL — « Le mistral »

Cinématique `le_mistral` → `fin_depart` (devant ou derrière la colonne ; le troupeau loin ou proche selon
`jour_gagne`) → voyage Calès → Mallemort : `rh_fin_colonne` (Fernand), `rh_fin_feu` (**Cautère commence**) →
`fin_pont_1` + cinématique `pont_mallemort` → **retournement final** `fin_orsini_*` : *le rapport de Maud a signé
Cautère ; on brûle une idée* → `fin_bras` (Orsini voit ta brûlure « bien ronde » et laisse passer) → `fin_choix`.

## 8. Les fins

| Fin | Condition | Ce qui arrive | Variantes |
|---|---|---|---|
| **A — Cautère** (« le silence ») | toujours | Tu passes, manches baissées. Herse, pont routier sauté, le feu. Six semaines plus tard, un camp au bord du Rhône : le dimanche, la cloche sonne, ta bouche se remplit. « Un jour de plus. » | Joëlle sait (elle pose une assiette à côté de la sienne sans te parler) / ne sait pas (elle te raconte Luc le soir, tu te tais pour toujours). |
| **B — La Voix** (« la vérité ») | `temoignage_filme` | Une barre de réseau au milieu du pont ; Orsini lève la main pour qu’on ne tire pas ; un soldat tire quand même ; « Envoyé ». Cautère suspendu. Trois mois plus tard : un gymnase réfrigéré, des familles en file, « LE DON, UN ACTE RESPONSABLE ». « Le monde a eu un jour de plus pour décider. Il a décidé. » | Témoignages de Maud / Rose en plus. |
| **C — La Transhumance** | `rose_promesse` | Rose te donne le redon. **Vers le feu** : tu mènes onze mille morts dans les flammes, Rose à ton bras ; le dessin de Lou, « Un jour de plus ». **Vers le pont** : les conteneurs basculent, le troupeau passe la Durance ; au pied du Ventoux, chaque matin, des revenus se redressent ; tu es le berger. | Deux faces d’un même choix. |

Écran de fin : `js/data/histoire/fins.js` (drapeaux `fin_cautere`, `fin_voix`, `fin_transhumance_feu`,
`fin_transhumance_estive`).

## 9. Drapeaux importants

| Drapeau | Posé par | Sert à |
|---|---|---|
| `prologue_fini`, `ch1_fini`, `mistral_leve` | fin de chaque partie | présence des PNJ, déclencheurs |
| `cicatrice_brulee` / `bras_bande` / `bras_nu` | `nos_bras` | inspections (Empéri, Calès, pont) |
| `emp_statut` = normal \| immunise \| rejete | Empéri | accès, textes |
| `lou_sait`, `video_vue`, `vidal_confronte` (+ `vidal_pardonne`/`vidal_avoue`/`vidal_menace`) | sac rouge | Vidal |
| `registre_trouve`, `souvenir_vu`, `lettre_luc_trouvee`, `insuline_trouvee`, `rapport_lu` | hôpital | procès, radio, Vidal |
| `maud_protegee` / `maud_denoncee` → `maud_captive` / `maud_medecin` | confrontation | branche du procès |
| `vidal_mort` / `vidal_acheve` / `vidal_acheve_lou`, `theo_sauve` | siège | Lou, textes |
| `troupeau_passe` | aube | **Salon se vide** (danger ↓), traînards en région |
| `aveu_precoce`, `aveu`, `joelle_sait`, `revele_public`, `mensonge_jo`, `maud_a_mange_page`, `page_brulee` | Calès | Joëlle, fins |
| `maud_morte`, `maud_exilee`, `maud_berger`, `maud_liberee`, `tu_as_tue_maud` | procès et après | Vernègues, pont |
| `vernegues_fait`, `rose_promesse`, `berger_sonnaille`, `berger_offre_maud`, `berger_contourne` | Vernègues | départ, fin C |
| `orsini_contact`, `orsini_sait`, `protocole_r_lu` | BA 701, appel | final |
| `delai_canal`, `delai_senas`, `jour_gagne`, `citerne_basse`, `senas_*` | un jour de plus | final (avance de la colonne) |
| `telephone_charge`, `temoignage_filme`, `temoignage_maud`, `temoignage_rose`, `temoin_extra` | témoignage | fin B |
| `cautere_commence` | voyage final | carte : le sud brûle |

## 10. Conventions d’écriture et de données

- **Tutoiement**, co-op compatible : aucun texte ne suppose qu’on est seul ou à deux. Genre : `{masculin|féminin}`,
  avec parcimonie ; les écrits du monde (mot de Maud, registre) ne s’accordent pas, sauf ceux qui connaissent le joueur.
  Le journal est à la **première personne**, sans accord.
- Apostrophe typographique `’` dans les textes ; zones du corps : vocabulaire `ZONES_CORPS` de `clothing.js`.
- **`illu`** d’une scène = un id de **décor** (§13) — la bibliothèque de décors sert aussi de vignettes fixes.
- **Musique** des scènes : `calme | sombre | tension | combat | mort | null` ; des cinématiques : `titre | calme | sombre | tension | combat | mort | refuge`.
- Conditions : `{ quete: ['id','etape'] }` = étape **courante**. Pour un « et » de deux drapeaux : `flag` + `flagEgal`, ou
  un drapeau composite (`jour_gagne`, `temoin_extra`).
- Les scènes-menus des PNJ (`*_parler`) reviennent à elles-mêmes ; « Partir » → `#fin`.
- Les effets `combat` reprennent à `suivant` quand le combat se termine (victoire **ou** fuite) ; les textes qui
  suivent un combat sont écrits pour convenir aux deux issues.

## 11. Extensions de format utilisées (à implémenter ou ignorer sans casse)

| Extension | Où | Effet attendu |
|---|---|---|
| `combat.tutoriel: true` | `rc_pro_premier` | combat guidé (bulles d’aide, mort unique lent, pas de mort du joueur) |
| effet `detour: mètres` | rencontres | ajoute des mètres au trajet (déjà prévu par GAMEPLAY) |
| `si` sur un PNJ | `pnj.js` | présence conditionnelle du PNJ |
| `titre` dans un plan de cinématique | `intro`, `ch1_intro`, `ch2_intro`, `le_mistral` | carton de titre |
| `DECORS` exporté par `cinematiques.js` | vérification | liste des décors attendus |
| `PARTIES_SCENES` exporté par `scenes.js` | vérification | détection des doublons |
| verrou de porte par drapeau `verrou: { flag: 'x' }` | niveaux (voir NIVEAUX_BESOINS) | porte de l’Empéri |
| entrées nommées `{ entree: 'nom' }` | niveaux | `teleporter: { lieu, entree }` |

## 12. Besoins pour le gameplay (à l’attention du game designer et des moteurs)

- **Morts utilisés** : `errant`, `coureur`, `enrage`, `colosse`, `militaire`, `rampant`, `fauve` (tous présents dans
  `zombies.js`). Souhaits : un **« sonnailleur »** (mort portant une cloche : fait du bruit en marchant, attire les
  autres) pour le troupeau et les traînards ; un **« raté »** (revenu qui rechute : parle une phrase, puis enragé) pour
  Mireille et Patrick — à défaut `enrage` convient.
- **Plaies** : `brulure` (cautère, pont), `profonde` (balle), `entaille`, `egratignure`.
- **Le revenu** (réponse à GAMEPLAY §14) : proposition légère — les morts détectent un peu moins le joueur à l’odeur
  (« il sent le froid »), jamais au bruit ni à la vue ; le son `cloche` (et les sonnailles) déclenche un toast
  « Ta bouche se remplit. » et +faim légère. Le « mal » de GAMEPLAY §5.4 colle à l’histoire : à 100, c’est la mort
  `infection`/`rechute` (texte dans `morts.js`).
- **Causes de mort** supplémentaires écrites : `rechute`, `froid`, `feu`, `balle`, `chute`, `noyade`, `execution`,
  `fauve`, `epuisement`.
- **Drapeaux → monde** : `troupeau_passe` : danger de Salon fortement réduit (le troupeau a emporté ses morts), rues
  « vides » ; traînards dans la région nord. `cautere_commence` / `mistral_leve` : mistral (bruit ambiant fort : ouïe
  des morts et du joueur réduites), feu au sud de la carte. `citerne_basse` : l’eau de Calès rationnée.
- **Rencontres aléatoires** : désactivées pendant le prologue (hors scénarisées) ; `poids: 0` = scénarisée uniquement.
- **Objets** : tous les objets d’histoire sont dans `objets_quete.js` (dont `valise_radio` 8,5 kg, `redon` 4 kg).
  La `perche_fourriere` (lore) pourrait devenir une arme d’allonge (poussée) si le game designer le souhaite.
- **Temps** : `pro_reveil` avance de 11 h (réveil à 8 h → sortie du caveau vers 19 h). Le reste de l’histoire ne
  dépend pas de l’heure, sauf la libération/l’exécution de Maud (`nuit: true`).

## 13. Briefs des décors de cinématiques

Direction commune (REFONTE §8) : nuit, encre, papier sale, lumière chaude rare (ambre `#c9a227`), sang
(`#8e1b24`/`#d6303e`), crème `#e6dfcc` sur quasi-noir `#0b0b0c`. SVG en **4 à 6 couches** de parallaxe (L1 = fond, le
plus lent ; L5-L6 = premier plan, le plus rapide). Silhouettes découpées, peu de détails internes, textures de grain.
Largeur ≈ 3 écrans pour les travellings (`x` 0 → 1). Les décors « vignettes » (fin de liste) servent d’illustrations
fixes aux scènes : 3 couches suffisent, cadrage 16:9 centré.

### Décors de cinématiques

**`salon_marche`** — *Le cours Carnot, mercredi 2 septembre, 10 h, avant.* L1 ciel bleu pâle, rocher et château de
l’Empéri au loin. L2 façades provençales ocre et crème, volets bleus, toits de tuiles, enseignes (tabac, pharmacie).
L3 voûte de platanes, troncs tachetés. L4 étals et bâches rayées rouge/blanc/vert, cageots de pêches, fromages sous
cloche, fleurs. L5 foule en silhouettes colorées (cabas, poussettes). Palette chaude : ocre `#d9a45b`, vert platane
`#6f8a3e`, bâches `#b8322c`. Anim : `foule_marche` (glissement lent des silhouettes), `platanes_brise`,
`pigeons_envol`, `fontaine_coule` (fontaine de la place de Gaulle à gauche).

**`salon_mercredi`** — *Même cadre, 10 h 51 : la panique.* Même composition que `salon_marche` mais ciel voilé, étals
renversés, fruits écrasés, une bâche arrachée, une silhouette penchée sur une autre au premier plan (lecture floue,
pas de gore explicite), un gyrophare bleu lointain. Palette désaturée, rouges plus sombres. Anim : `foule_court`
(silhouettes qui filent dans les deux sens), `etals_renverses` (un étal bascule), `silhouette_penchee` (mouvement de tête
saccadé).

**`couloir_hopital`** — *Urgences, la nuit.* L1 couloir en perspective, portes de box numérotées, néons. L2 brancards
contre les murs, un drap. L3 chariot de soins avec une petite **clochette** de bronze à manche de bois. L4 une main
(manche de blouse, anorak rouge au poignet) qui glisse un papier plié dans la poche d’une housse blanche. Palette
vert d’eau `#8fb3a8`, blanc sale, un seul accent rouge. Anim : `neon_clignote`, `clochette_tremble`, `main_billet`.

**`salon_mistral_vide`** — *Salon trois semaines après, jour, vent.* L1 ciel très bleu, nuages étirés. L2 toits,
Tour de l’Horloge (cadran 21 h 10), château. L3 cours désert, voitures abandonnées portières ouvertes. L4 platanes qui
ploient. L5 un journal qui vole, feuilles. Palette froide lumineuse `#5d8fb8`, ocres lavés. Anim : `platanes_vent`,
`journal_vole`, `drone_passe` (petit drone gris au loin).

**`housse_noir`** — *L’intérieur de la housse.* Quasi-noir, un léger dégradé blanc laiteux (plastique vu de dedans),
une ligne verticale de fermeture éclair. Anim : `souffle_plastique` (le plastique se gonfle et se colle en rythme),
`fermeture_eclair` (la ligne s’ouvre de haut en bas, lumière orangée qui entre). Sert aussi au carton de titre.

**`place_crousillat_nuit`** — *La place, la nuit.* L1 ciel nocturne indigo. L2 Tour de l’Horloge trois étages de pierre
blonde, campanile de fer forgé et trois cloches, cadran 21 h 10. L3 façade du Grand Hôtel de la Poste (fenêtres noires),
maisons. L4 **la Fontaine Moussue** : champignon de pierre verte barbu de mousse, quatre mascarons crachant l’eau.
L5 terrasses : tables rondes, chaises renversées, un parasol plié. Accent : un cône de lampe au sol (joueur hors champ).
Palette `#1c2230`, pierre `#b9a27a`, mousse `#4d6b3a`, lampe `#e8d49a`. Anim : `cloches_balancent`, `fontaine_coule`,
`silhouettes_convergent` (des dizaines de silhouettes sortent des rues et marchent vers la tour, visages levés),
`porte_entrouverte` (rai de lumière au pied de la tour, une main).

**`horloge_sommet`** — *Du sommet de la tour, nuit.* L1 horizon : Alpilles en ombre, lueur d’incendie lointaine.
L2 toits de la vieille ville, l’Empéri éteint sur son rocher (une fenêtre allumée). L3 la place en contrebas : foule
immobile, visages levés, la fontaine. L4 ferronnerie du campanile, une cloche en amorce, cadran vu de dos (21 h 10).
Palette bleu nuit, points ambre. Anim : `foule_immobile` (très léger balancement), `cloches_immobiles`,
`incendie_lointain`, `cadran_21h10` (reflet sur l’aiguille).

**`salon_aube_toits`** — *Aube depuis la maison de Nostradamus.* L1 ciel rose-gris, brume basse. L2 le rocher du Puech
et le château, linge qui sèche sur les remparts. L3 mer de toits de tuiles, cheminées, fumées droites (pas de vent).
L4 lucarne et rebord de pierre au premier plan. Palette `#d8a79a`, `#7c6f78`. Anim : `martinets`, `fumees_droites`,
`linge_emperi`, `platanes_immobiles`.

**`salle_quatre`** — *Salle des plâtres, souvenir.* Cadrage serré, rouge dominant. L1 carrelage mural. L2 lit
d’examen, sangles de cuir, menottes. L3 chariot, bandes plâtrées, clochette. L4 brancard qui entre par la droite : un
homme moustachu, jambe en attelle, qui ne crie pas. Palette `#3a0f12`, `#8e1b24`, blanc cassé. Anim :
`clochette_agitee`, `sangles_tirent`, `brancard_approche`, `visage_homme` (gros plan flou, lèvres qui forment « Jo »).

**`cours_troupeau`** — *Le cours Victor-Hugo, nuit des sonnailles.* L1 ciel noir, étoiles. L2 façades, rocher de
l’Empéri au fond (torches sur les remparts). L3 voûte de platanes. L4 **la marée** : masse compacte de silhouettes qui
remplit le cours d’un trottoir à l’autre. L5 en tête, silhouettes droites avec cloche au cou et lampe au poing
(faisceaux). Palette `#0e1016`, faisceaux `#e8d49a`. Anim : `troupeau_coule` (défilement continu), `lampes_de_tete`
(faisceaux qui balaient), `sonnailleurs_marchent`, `troupeau_tourne` (la masse s’incurve vers le rocher),
`emperi_lointain` (torches qui vacillent).

**`emperi_siege`** — *L’Empéri pendant le siège (vignette et fond).* L1 ciel rougi. L2 murs et tours, torches sur le
chemin de ronde, gamins en silhouette avec sabres et bouteilles. L3 porte et grille de chantier doublée de palettes.
L4 marée au pied, bras levés. Effets compatibles : braises, fumée. Palette noir/ambre/rouge.

**`emperi_remparts_aube`** — *Du rempart, à l’aube.* L1 ciel gris perle. L2 plaine vers le nord, route d’Avignon, rond-
point, champs, horizon. L3 **le troupeau** qui s’éloigne en rivière de dos courbés. L4 en tête, minuscules : le Berger
(chapeau, houlette, cape), deux chiens, Rose portant **le redon** contre sa poitrine. L5 créneaux du rempart au
premier plan. Palette froide `#9aa3a8`. Anim : `troupeau_s_eloigne`, `berger_marche`, `chiens_tournent`, `redon_balance`.

**`route_jean_moulin`** — *Sortie nord de Salon, matin.* L1 ciel clair, Alpilles au loin. L2 rond-point, **statue de
Jean Moulin** (bronze noir, bras tendus vers le ciel), un drap blanc noué aux poignets (« CALÈS → PAR LES COLLINES »).
L3 route piétinée, glissières tordues, chaussures, poussette. L4 herbes du bas-côté. Anim : `drap_claque`.

**`cales_falaises`** — *Le cirque de Calès au-dessus de Lamanon.* L1 ciel. L2 deux falaises de safre jaune `#d7b36a`
trouées de grottes carrées sur plusieurs niveaux, escaliers taillés. L3 feux dans les grottes, linge, silhouettes,
une échelle de corde. L4 chênes kermès, antenne tendue au sommet. Soir : ciel orangé, lueurs ambre. Anim :
`feux_grottes`, `echelle_corde`, `linge_seche`.

**`vernegues_ruines`** — *Vieux-Vernègues, la nuit.* L1 ciel étoilé, plaine en contrebas (lumières nulles). L2 dent
du château ruiné. L3 église sans toit, arcs sans voûte ; sur le mur, à la chaux, **UN POUR UN**. L4 figuiers dans les
ruines, bouches de caves au ras du sol. L5 centaines de bougies (niches, murets) ; silhouettes assises (revenus) qui
jouent aux cartes. Palette bleu-noir, bougies `#f0c26a`. Anim : `bougies_vacillent`, `revenus_assis`,
`inscription_chaux` (lumière qui glisse sur l’inscription).

**`ba701_tarmac`** — *Base aérienne 701, jour de chaleur.* L1 ciel blanc de chaleur, collines. L2 tour de contrôle,
hangars arrondis, grillage, miradors vides. L3 neuf **Alphajets** bleu-blanc-rouge alignés, verrières fermées.
L4 rond-point : **Fouga Magister** sur son mât, un corps en uniforme pendu au bout de l’aile. L5 parking : trois cents
paires de rangers alignées. Palette `#d9d2bd`, tricolore délavé. Anim : `fouga_mat`, `corps_balance`, `manche_a_air`,
`drapeau_mat`, `rangers_alignees` (léger miroitement), effet `chaleur`.

**`crau_mistral`** — *La plaine sous le mistral.* L1 ciel lavé bleu cobalt `#2f6db3`, nuages déchiquetés qui filent.
L2 Alpilles nettes. L3 plaine caillouteuse, haies de cyprès pliées. L4 herbes couchées, poussière. L5 la colonne de
Calès (silhouettes courbées, enfants portés). Anim : `herbes_couchees`, `nuages_filent`, `cypres_plient`,
`colonne_marche`.

**`durance_pont`** — *Mallemort, le fleuve.* L1 ciel (bleu de mistral ou gris). L2 rive nord : sacs de sable, filets
de camouflage, projecteurs, tente blanche, silhouettes en combinaison. L3 **pont suspendu** : pylônes de pierre en arc
de triomphe, câbles en courbe, tablier de planches, « 200 M » peint en rouge. À côté, le pont routier béton muré de
conteneurs empilés. L4 Durance grise, écume, bancs de galets. L5 rive sud, roseaux. Anim : `cables_vibrent`,
`eau_ecume`, `colonne_traverse`, `projecteurs`, `troupeau_arrive`, `herse_tombe`, `pont_routier_saute`,
`conteneurs_basculent`, `troupeau_traverse`, `telephone_envoye` (gros plan : écran, barre de progression),
`ecrans_s_allument` (fondu vers mosaïque d’écrans).

**`ligne_de_feu`** — *Cautère.* L1 ciel noir-orange. L2 collines de pins en feu. L3 mur de flammes couché par le vent
vers la droite (sud). L4 silhouettes (troupeau) et, selon le plan, le Berger immobile. L5 braises. Passage d’avions
(silhouettes basses). Palette `#1a0a05`, `#e2551c`, `#f4b23c`. Anim : `flammes_avancent`, `avions_passent`,
`troupeau_brule`, `berger_immobile`, `troupeau_arrive`.

**`camp_refugies`** — *Camp de toile au bord du Rhône, six semaines après.* L1 ciel gris d’automne, platanes jaunes.
L2 Rhône, peupliers. L3 rangées de tentes blanches, une chapelle en préfabriqué avec une petite cloche. L4 cuisine
collective, fumée. Anim : `tentes_vent`, `fumee_cuisine`, `cloche_chapelle`.

**`gymnase_froid`** — *Gymnase réfrigéré, banlieue de Lyon.* L1 murs, paniers de basket relevés, lignes du terrain.
L2 **quatre cents housses blanches** alignées sur le parquet, étiquettes. L3 affiche « LE DON, UN ACTE RESPONSABLE ».
L4 file de familles à la porte, buée. Palette blanc bleuté `#cfdbe3`, lumière de néon. Anim : `file_familles`,
`buee_respiration`, `affiche_don`.

**`troupeau_feu`** — *Fin C, vers le feu.* L1 ciel en feu. L2 collines embrasées. L3 une silhouette de dos, le redon
levé, une petite femme à son bras. L4 onze mille silhouettes qui suivent. Dernier plan : route calcinée, une cloche
fêlée au sol. Anim : `troupeau_suit`, `redon_leve`, `rose_bras`, `flammes_avancent`, `silhouette_dans_flammes`,
`cloche_au_sol`.

**`estive_ventoux`** — *Fin C, l’estive.* L1 le Ventoux, sommet blanc « comme un os ». L2 pentes, alpages. L3 le
troupeau qui monte en file. L4 des silhouettes qui se redressent, regardent leurs mains. Lumière d’aube froide.
Anim : `troupeau_monte`, `redon_balance`, `revenus_se_redressent`, `sommet_blanc`.

### Vignettes des scènes (plans fixes)

- **`cimetiere_caveau`** — intérieur d’une chapelle funéraire : étagères de marbre, cercueils de chêne, inscription
  FAMILLE ROUX-BÉRENGER, housses blanches au sol, rai de lumière rouge sous la porte.
- **`saint_roch_nuit`** — le cimetière Saint-Roch sur son rocher : allées de mausolées accolés, conteneurs
  frigorifiques blancs sur l’esplanade, loge du gardien, soldat NRBC assis, housses le long des murs, grille ouvragée.
- **`cours_nuit`** — les cours de Salon la nuit : platanes, étals abandonnés sous bâches, voitures, enseigne du tabac,
  réverbères morts ; lune.
- **`nostradamus_cabinet`** — le cabinet reconstitué du musée : bureau de bois, sphère armillaire, crâne en plâtre,
  mannequin de cire en robe noire de médecin du XVIe, scanner radio sur batterie de voiture, cendrier plein.
- **`emperi_cour`** — la cour d’honneur de l’Empéri, galerie Renaissance, linge entre les colonnes, marmite sur feu de
  palettes, tableau d’ardoise, tour d’angle avec antenne sur bâton de ski.
- **`montee_puech`** — la montée du Puech : galets, deux murs, grilles du lycée, banderole « BIENVENUE AUX SECONDES »,
  porte du château doublée de palettes, ronces sous le rempart.
- **`collegiale_nef`** — nef gothique très haute, bancs, dizaines de silhouettes debout tournées vers l’autel, prêtre
  en aube avec clochette, grille de la chapelle de la Vierge et plaque de Nostradamus, lumière de cierges.
- **`hopital_parvis`** — urgences : ambulances en épi portes ouvertes, tente militaire effondrée, housses contre le mur,
  drap « ICI ON SOIGNE ENCORE ».
- **`hopital_sous_sol`** — couloir de sous-sol, néons morts, tiroirs d’inox de la morgue, casiers du vestiaire, lampe.
- **`cales_grande_salle`** — la grande grotte de Calès : voûte de safre, torches, foule assise, un tabouret au centre.
- **`senas_station`** — vergers sous filets anti-grêle noirs, station fruitière de tôle, « NON » à la bombe rouge,
  clocher au fond.
- **`plaine_route`** — route départementale entre oliviers et vergers, restanques, Alpilles au loin, jour.
- **`nuit_campagne`** — chemin de campagne la nuit, borne kilométrique, silhouette assise, étoiles.
