# One More Day — Besoins des niveaux (commande du scénariste, histoire version 2)

> Pour chaque **lieu de l’histoire** (docs/HISTOIRE.md, §6) : son rôle, ses **entrées** (`teleporter`, démarrage,
> voyages guidés) et ses **marqueurs** (PNJ de `js/data/histoire/pnj.js`, déclencheurs de `declencheurs.js`, documents
> de `documents.js`). Chaque marqueur et chaque entrée qu’utilise l’histoire est écrit ici `entre accents graves` :
> `node tools/verifier_histoire.mjs` le vérifie. Les plans sont dans `js/data/niveaux/<id>.js` ; 1 unité ≈ 0,8 m.
> Principes de conception : `docs/RETOURS_JOUEUR.md` (P1 à P15, check-list §3).

---

## 0. Conventions

- **Entrée nommée** : `e.entree('nom', x, y)` (format à couches) ou `{ entree: 'nom' }` dans la légende (ASCII).
  `defaut` est l’arrivée quand rien d’autre n’est dit ; un voyage arrive par la sortie du côté d’où l’on vient.
- **Marqueur** : `e.marqueur('id', x, y, { nom })`, ou `marqueur: 'id'` sur un objet ou une porte (le geste se fait
  collé à eux). Un marqueur qu’aucun déclencheur, PNJ ni document ne vise est inerte.
- **PNJ de l’histoire** : `e.pnj('id', x, y, { marqueur: 'id' })`. Leurs conditions de présence sont dans `pnj.js` :
  le plan ne met pas de `si` sur eux.
- **Figurant** : `e.pnj('id_libre', x, y, { nom, style, dir, si, repliques: […] })` (une ou deux répliques, dites au
  hasard). Le validateur (`js/explore/niveau.js`) refuse les figurants dans la légende d’un plan ASCII : un plan ASCII qui
  en porte est compilé en couches dans son propre fichier (`asciiVersPlan`, puis l’API à couches) — c’est le cas de
  `cornillon`, `grans`, `cales`, `lancon` et `miramas`.
- **Porte à drapeau** : `verrou: { flag: 'x' }` + `message` qui dit pourquoi elle est fermée et ce qui l’ouvrira (P4).
  Porte forçable : `verrou: { forcer: 'pied_de_biche' }` + `message`. Porte d’un refuge habité : `gardee: { …si }`
  (aucun mort ne la passe ; elle se referme derrière toi) et `parvis` (on n’ouvre pas tant qu’un mort rôde devant).
- **Sortie gardée** : `e.sortie(x, y, w, h, { si, message })`. **Mort qui pose un drapeau** : `e.zombie(type, x, y,
  { flagMort })`. **Morts conditionnels** : `si: { flag, pasFlag }` (avant / après une scène, P2).
- **Refuge habité** : `refuge: { …si }` dans les méta du plan, et `sansMorts` sur les pièces habitées (aucun mort
  procédural ; ceux qui y entrent sont chassés tant que la condition tient ; on y dort en sûreté).
- **Lieux de l’histoire** : sans abords générés (P1 : lieux clés et lieux hors de la ville), sauf `istres`, en ville.

---

## 1. `miramas_le_vieux` — Le Refuge (actes I et III)

**Rôle** : le village fortifié de Miramas-le-Vieux, où le joueur est accueilli, fait sa quarantaine, ses corvées et sa
garde, puis où il assiste à la chute (le Refuge tombe la nuit du jour 4). Plan à couches, trois états : vivant, siège,
tombé (drapeaux `siege_commence`, `refuge_tombe`).

**Entrées** : `porte` (devant la porte Notre-Dame : le démarrage de la partie et la scène `ref_porte`), `quarantaine`
(dans la cellule de la tour-porte : `ref_porte_3` y téléporte), `defaut` (= `porte`), `place` (sur la place : retour de
nuit, `ref_retour_nuit_3`), `poste_breche` (dans la cour de la brèche : le siège, `siege_debut_2` et `siege_debut_nuit`).

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `puits` | le puits de la place | `ref_puits` : remonter vingt seaux (corvée d’eau) |
| `rudy_breche` | Rudy, assis devant la brèche du rempart nord-est | `ref_breche` (PNJ `rudy_breche`) : la fermer avec lui et quatre planches ; la brèche est aussi une ouverture qu’on barricade soi-même (`flagBarricade: 'breche_fermee'`) |
| `infirmerie` | la porte de l’infirmerie | `chute_infirmerie` : Karine et Noa, pendant la chute |
| `radio_helene` | la caisse sous la couverture, dans le donjon | `chute_helene` : Hélène à sa radio, pendant la chute |
| `poterne` | la poterne du rempart sud | `chute_poterne` : la fuite avec Inès |
| `helene`, `fernand`, `ines`, `bastien`, `karine`, `rudy` | PNJ de l’acte I (menus `*_parler`) | voir `pnj.js` ; `rudy_breche` : Rudy à la brèche |

**Morts** : aucun dans le village vivant ; quelques-uns dans le bas du village (les planches) ; au siège, au pied du
rempart ; après la chute, partout.

## 2. `bergerie` — la bergerie de Cabassole, dans la Crau (acte II)

**Rôle** : la bergerie isolée de Gérard, où Fernand et le joueur viennent chercher les antibiotiques vétérinaires pour
Noa, et où ils passent la nuit avant la frappe. Sortie gardée la nuit (« Fernand ne marche pas de nuit dans la Crau »).

**Entrées** : `draille` (on arrive par le chemin des moutons, à l’est), `defaut` (= `draille`).

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `armoire_veto` | l’armoire du vétérinaire, dans le mas | `ber_armoire` : les antibiotiques (fermée à clé : la clé est sur Gérard, ou le pied-de-biche) |
| `fernand_crau` | Fernand, au mas | menu `fernand_crau_parler` |

Gérard est un mort du plan (marqueur `gerard`, `flagMort: 'gerard_acheve'`) ; une zone devant la porte lance `ber_gerard`.

## 3. `miramas` — la gare de triage (acte II vue de loin, acte V)

**Rôle** : la gare de triage où dix mille morts s’entassaient, bombardée à l’aube du jour 4 ; à l’acte V, on y trouve
la vérité sur le convoi de chlore, au milieu des cratères et des corps brûlés. La nuit, la brume y est la plus épaisse.

**Entrées** : `defaut` (la ville, à l’ouest) ; sorties ouest et est.

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `lettre_voiture` | la cabine du poste d’aiguillage, près du bureau (sud du faisceau) | document `doc_lettre_voiture` (`lieu: 'miramas', marqueur: 'lettre_voiture'`) |

**Deux états** : avant la frappe (`frappe_faite` absent), une foule de morts debout entre les trains ; après, six morts
seulement (des brûlés qui rampent). Le décor montre l’après (on n’explore la gare qu’à l’acte V) : cinq cratères,
les wagons du milieu du faisceau calcinés, le convoi de **wagons-citernes de chlore** éventré (`conteneur`, sans
fouille), une cinquantaine de corps brûlés, le haut-parleur du poste devenu muet. Le bulletin du train 44721
(`doc_triage`) reste posé dans le poste d’aiguillage.

## 4. `saint_chamas` — la Poudrerie (acte IV)

**Rôle** : le point de ralliement au bord de l’étang : la maison du gardien, où l’on attend deux jours (sorties fermées
pendant l’attente), jusqu’à ce que la brume monte et qu’il faille fuir vers Cornillon.

**Entrées** : `allee` (la grande allée de platanes, au nord : l’arrivée par le sentier du Refuge), `defaut` (= `allee`).

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `ines_pou` | Inès, dans la cuisine de la maison du gardien | menu `ines_pou_parler` |

## 5. `cornillon` — Cornillon-Confoux, la base (actes IV et V)

**Rôle** : le village perché au-dessus de la brume. Les survivants s’installent dans **la maison de la placette**
(voisine de la maison du guetteur) : la salle, la chambre, la cuisine, la salle de bain ; deux lits, un canapé, trois
matelas, une lanterne ; une seule porte sur la rue, gardée tant que la maison est habitée (`refuge` et `gardee` :
`cornillon_arrivee` sans `colonne_partie`). Aucun mort procédural dans la maison (`sansMorts`) ; les deux errants de la
placette s’en vont à l’arrivée (`si: { pasFlag: 'cornillon_arrivee' }`). La chambre du guetteur reste à la mission
`m_guetteur` (pièce « La chambre du guetteur », inchangée).

**Entrées** : `defaut` (la route qui monte, au sud).

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `ines_cor` | Inès, dans la salle de la maison | menu `ines_cor_parler` |
| `karine_cor` | Karine, dans la chambre, près du lit de Noa | menu `karine_cor_parler` |
| `bastien_cor` | Bastien, dans la cuisine | menu `bastien_cor_parler` |
| `rudy_cor` | Rudy, dehors devant la porte, qui surveille la route | menu `rudy_cor_parler` |

**Figurant** : Noa, couchée dans le lit du coin (`si: { flag: 'famille_cornillon', pasFlag: 'colonne_partie' }`).
**Document** : `doc_cornillon` (le carnet du guetteur, au belvédère).

## 6. `grans` — le vieux moulin (acte V)

**Rôle** : un village sur la Touloubre ; au bord de l’eau, le vieux moulin dont le meunier, **Édouard** (80 ans), a
remis la roue en marche : les morts vont la regarder sur l’autre berge. Il cache Karine et Noa dans son logement si
elles se sont perdues par là. Le logement du meunier est un refuge (`sansMorts`, deux portes gardées, une bougie).

**Entrées** : `defaut` (la grand-rue, à l’ouest) ; sorties ouest et est.

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `karine_gra` | Karine, dans « Le logement du meunier » | scène `gra_karine` |

**Figurants** : Édouard le meunier (toujours là) ; Noa couchée dans le lit, avec la même condition que Karine
(`pont_annonce`, sans `noa_avec`, `familles_parties` ni `famille_cornillon`). **Document** : `doc_grans` (sur la table).

## 7. `istres` — la pharmacie (acte V)

**Rôle** : un bout de ville au bord de la BA 125. Sur le parking au sud de l’avenue, **la pharmacie** : l’officine
pillée, et derrière elle l’arrière-boutique fermée, sans fenêtre (rideaux tirés), où Bastien se cache, les poumons
brûlés par la brume. Repère : la croix verte de l’enseigne, au coin de la façade (à 10 unités de Bastien).
L’arrière-boutique est `sansMorts` ; les toilettes du personnel sont au fond.

**Entrées** : `defaut` (l’avenue, à l’ouest). Le plan garde ses abords de ville.

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `bastien_ist` | Bastien, dans « L’arrière-boutique de la pharmacie », près de son lit de camp | scène `ist_bastien` |

**Document** : `doc_istres` (salle radio de la base).

## 8. `lancon` — le péage de l’A7 (acte V)

**Rôle** : sept voies de voitures à l’arrêt devant la barrière jamais levée. Dans la voie 4, juste avant la barrière
arrachée, **le camion de Rudy** (un porteur bâché, à sec : `camionnette`, sans fouille) ; Rudy à côté ; contre la
cabine, le corps de **Yohan** (objet `cadavre` nommé « Yohan »).

**Entrées** : `defaut` (l’aire de repos, au sud) ; sorties sud et est.

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `rudy_lan` | Rudy, dans l’allée au sud de son camion | scène `lan_rudy` |

**Document** : `doc_lancon` (le ticket de péage, dans une allée).

## 9. `mallemort` — le pont (acte V, le final)

**Rôle** : la rive sud de la Durance devant le pont suspendu. Le **camp d’attente** (présent de `pont_annonce` à
`pont_fait`) : une trentaine de figurants assis autour de couvertures, cinq tentes, des voitures garées au bord de la
route, des feux éteints (l’armée les interdit), deux bidons d’eau ; en face, l’armée, ses sacs de sable et ses deux
projecteurs ; le pont routier muré de conteneurs. Le pont suspendu est **barré à l’entrée** par une grille, des
chevaux de frise et des sacs de sable : porte `verrou: { flag: 'pont_fait' }`, message « L’armée n’ouvre le pont qu’à
l’aube du mercredi, une heure. Personne ne passe avant. » Devant la grille, une bande vide où personne ne s’assoit. Sur
le tablier, la ligne des 200 mètres est peinte en travers ; au bout, la ligne de l’armée (deux soldats).

**Entrées** : `defaut` (la route D17d, à l’ouest), `camp` (au milieu du camp, pour une scène qui y place le joueur).

**Morts** : tant que le camp est là, aucun sur la rive sud (`refuge` et tout le lieu `sansMorts` : l’armée tire sur ceux
qui approchent) ; quelques errants avant l’annonce (`si: { pasFlag: 'pont_annonce' }`) ; six quand le camp a passé le
pont (`si: { flag: 'pont_fait' }`). À fouiller : le bar du pont, la maison de l’éclusier.

## 10. `emperi` — le château de l’Empéri, un refuge du monde (acte V)

**Rôle** : le camp vivant du professeur **Vidal** et de ses lycéens, sur le rocher du Puech (une quinzaine de
figurants à répliques, dont M. Vidal au feu de la cour). On y entre en montrant ses bras à la grille.

**Entrées** : `defaut` (le bas de la montée du Puech), `cour` (au milieu de la cour d’honneur).

| Marqueur | Où | Ce qui s’y passe |
|---|---|---|
| `grille_emperi` | dehors, juste devant la grille (parvis dégagé : aucun mort à moins de 8 unités) | scène `emp_grille` (« Appeler les guetteurs ») → drapeau `emp_entree_ok` |

**Porte** : la grille (et la poterne) `verrou: { flag: 'emp_entree_ok' }`, gardées ; avant, la grille dit pourquoi elle
est fermée (« les guetteurs n’ouvrent qu’à qui leur montre ses bras »). Trois morts plantés devant elle tant qu’on ne t’a
pas ouvert (`si: { pasFlag: 'emp_entree_ok' }`). **Documents du lieu** (s’ils sont gardés) : `journal_vidal` (le bureau
de Vidal), `panneau_regles` (l’ardoise des règles), `vitrine_sabres` (le cartel du sabre, au musée).

## 11. Les missions de survie (acte V)

| Mission | Lieu | Pièce ou marqueur |
|---|---|---|
| `m_aime` | `touloubre` | pièce « Le vieux moulin » ; la cache d’Aimé, marqueur `cache_aime` (au pied du troisième frêne de la rive est, en aval de la passerelle ; scène `aime_cache`, après `aime_cache_promise`) |
| `m_guetteur` | `cornillon` | pièce « La chambre du guetteur » |
| `m_mireille` | `pharmacie_carnot` | pièce « Le préparatoire » |
| `m_marche` | `place_de_gaulle` | pièce « Le tabac-presse » |
| `m_draisine` | `gare` | pièces « Le hall des voyageurs », « L’abri du quai 2 » |
| `m_coffre` | `leclerc` | pièces « L’hypermarché », « La direction » |

---

## 12. Les lieux sans rôle d’histoire

Tous les autres plans sont des lieux du monde, à explorer librement à l’acte V : `aerodrome`, `aurons`, `ba701`, `berre`,
`canourgues`, `carrefour_morgan`, `casino_shop`, `chaine_cotes`, `cineplanet`, `cimetiere`, `commissariat`,
`crau_coussouls`, `eyguieres`, `gare`, `gendarmerie`, `hopital`, `hotel_de_ville`, `hotel_poste`, `intermarche`,
`jean_moulin`, `la_barben`, `leclerc`, `lycee`, `marius_fabre`, `mediatheque`, `nostradamus`, `pelissanne`,
`pharmacie_carnot`, `place_crousillat`, `place_de_gaulle`, `pompiers`, `saint_laurent`, `saint_michel`, `senas`,
`touloubre`, `tour_horloge`, `vernegues`, `weldom`. Les anciens lieux clés y ont été rendus neutres : `cimetiere` (la
morgue provisoire de l’armée, la grille se pousse), `tour_horloge` (vide, la porte de chêne s’ouvre, un campement
abandonné), `nostradamus` (le musée abandonné), `saint_laurent` (la nef pleine de morts debout ; grille et sacristie
forçables), `hopital` (le donjon du butin médical), `cales` (un refuge habité par des familles de Lamanon, figurants
sans condition), `vernegues` (des ruines, une grille cadenassée sur des enragés), `ba701` (l’armoire forte se force),
`senas` (une famille morte dans la chambre froide barricadée). Chacun garde au moins trois traces lisibles (P3).

Des marqueurs de documents de musée y restent posés, à garder ou non : `mecanisme_horloge` (la plaque de l’horloge),
`cartel_peste` (Nostradamus), `presentoir` et `tombeau_nostradamus` (Saint-Laurent).

**Marqueurs de l’ancienne histoire retirés des plans** (un document qui en vise encore un ne s’affiche plus) :
`scelle_effets`, `soldat_nrbc`, `robinet_fleurs`, `housse_patrick`, `conteneur_frigo`, `loge_gardien`, `grille_sortie`,
`remise_etabli`, `carnet_tour`, `sommet_maud`, `maud`, `cave_patiente`, `scanner_maud`, `vidal`, `porte_emperi`,
`lou_rempart`, `radio_emperi`, `sac_rouge`, `nef_entree`, `cure_autel`, `porte_sacristie`, `clocher_lou`, `sac_nathan`,
`dossiers_urgences`, `bureau_maud`, `casier_luc`, `frigo_pharmacie`, `chambre_froide`, `morgue_couloir`, `salle_4`,
`joelle`, `clemence`, `lou_cales`, `grotte_puits`, `grotte_infirmerie`, `antenne_cales`, `martelliere_canal`,
`registre_cales`, `radio_cales`, `berger`, `rose`, `nadege`, `mur_eglise`, `pc_protection`, `armoire_forte`,
`hangar_paf`, `porte_chambre_froide`, `imbert`, `corde_clocher`, `ligne_200m`, `voiture_refugies`.

**Rappel de ton** : chaque lieu garde une trace de la vie interrompue (couverts dressés, cartables, jouets, un gâteau
d’anniversaire) — c’est ce qui rend le monde réel.
