# One More Day — Besoins des niveaux (commande du scénariste)

> Pour chaque **lieu clé** : plan à construire (fidèle au bâtiment réel autant que possible), marqueurs d’histoire
> (`legende` du niveau → `{ marqueur: 'id' }`), objets, PNJ, morts scénarisés, portes, déroulé attendu.
> Format : `docs/REFONTE.md` §4.2. Les marqueurs cités ici sont ceux qu’attendent `declencheurs.js`, `pnj.js` et
> `documents.js` (vérifiés par `tools/verifier_histoire.mjs`). 1 case ≈ 0,8 m.
>
> **Conventions demandées** (extensions, voir HISTOIRE.md §11) :
> - **Entrée nommée** : `{ entree: 'nom' }` dans la légende (utilisée par `teleporter` et par l’intégrateur au démarrage).
> - **Porte à drapeau** : `{ porte: true, verrou: { flag: 'x' } }` — s’ouvre quand le drapeau est posé.
> - **Zone-marqueur** : un marqueur peut être une zone (`declencheurs` du niveau, §4.2) qui interagit au passage.
> - **Documents** : un marqueur de document est un objet posé (papier, carnet, téléphone) ; l’interaction affiche le
>   document et l’ajoute au journal. Un document « sans marqueur » (fin de fichier) se pose librement dans le niveau.
> - **États des morts** : `dort`, `immobile`, `erre`, `fait_le_mort`, `cogne`.

---

## 1. `cimetiere` — Cimetière Saint-Roch (PROLOGUE, tutoriel d’exploration)

**Réel** : cimetière posé en hauteur sur le rocher, 140 bd du Roi-René ; mausolées et chapelles funéraires accolés
en « ville des morts », allées étroites en terrasses, grille d’entrée ouvragée, robinet pour les fleurs.
**Taille** : extérieur (`exterieur: true`), ≈ 60 × 45 cases, un seul niveau + l’intérieur du caveau (petite pièce).
**Ambiance** : fin de jour → crépuscule (le joueur sort du caveau vers 19 h), odeur (texte), silence, mouches.
**Pièces / zones nommées** :
- *Chapelle Roux-Bérenger* (caveau de départ) : 4 × 3 cases, `sombre: 2`, sol `carrelage` (marbre). Étagères (`s`)
  de marbre avec cercueils ; 3 housses au sol (`%`). Entrée nommée **`caveau`** sur l’étagère.
- *Allée des Pins*, *Allée du Rocher* (mausolées en rangs, portes de chapelles fermées `+`, 2 ouvertes avec housses).
- *Esplanade* : 2 conteneurs frigorifiques (`m` 2×5 chacun), groupe électrogène, tente NRBC effondrée.
- *Loge du gardien* (près de la grille) : bureau, fauteuil, tableau de clés.
- *Grille principale* (sortie `E`, fermée tant que `pro_grille` n’est pas résolue — voir plus bas).

**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `scelle_effets` | sur l’étagère, à côté du point d’entrée | `pro_scelle` : téléphone, portefeuille, mot de Maud (quête → sortir) |
| `soldat_nrbc` | allée, à 10 cases du caveau, soldat assis contre un mausolée (`%`) | `pro_soldat` : **lampe frontale + piles**, fiche de ramassage |
| `robinet_fleurs` | mur d’enceinte, près de l’esplanade | `pro_robinet` : boire (et source d’eau réutilisable) |
| `housse_patrick` | contre une chapelle voisine, dans l’allée | `pro_patrick` (P3, facultatif) |
| `conteneur_frigo` | porte du conteneur A | `pro_conteneur` : registre du lot 14 |
| `loge_gardien` | bureau de la loge | `pro_loge` : cahier, **clé de la grille** |
| `grille_sortie` | sur la porte de la grille (collé à elle : Examiner, et Ouvrir dans les actions) | `pro_grille` (la clé seulement : pas d’escalade) |

**Morts** : dans la loge, le gardien est un **corps du décor** (`gardien_mort`, intuable) assis dans le fauteuil ; la clé
est nouée à son poignet, et quand on l'emporte, un mort se lève à sa place, réveillé et sur toi (`si: pro_cle_prise`,
`reveil`) : pas de discrétion possible ;
dans le conteneur A, 3 à 5 morts **`cogne`** (ne sortent pas) ; 2 errants **`erre`** lents dans les allées éloignées
(`errant`) ; le plus proche du caveau hors de la route principale. Pas de mort sur le trajet caveau → soldat (on apprend
à marcher et à s’éclairer).
**Portes** : la grille principale est une sortie `E` placée **derrière** une porte `{ porte: true, verrou:
{ flag: 'pro_grille_ouverte' } }` (la scène pose le drapeau quand on ouvre avec la clé).
**Documents libres** : `doc_cimetiere_manieres` (plan des chapelles, punaisé dans la loge ou sur la tente).
**Déroulé** : se réveiller (scène) → fouiller le scellé → sortir du caveau (dans le noir, le rai de lumière guide) →
soldat (lampe) → (Patrick) → robinet → conteneurs (lecture) → loge (discrétion, clé) → grille → carte.

## 2. `tour_horloge` — Tour de l’Horloge (PROLOGUE)

**Réel** : tour-porte de 1626-1664, trois étages en retrait, porche voûté au rez-de-chaussée, campanile de fer forgé
et trois cloches, horloge à phases de lune ; à son pied la place Crousillat, la Fontaine Moussue, l’Hôtel de la Poste.
**Étages** : `rdc` (bande de la place Crousillat ≈ 20 × 12 avec la fontaine `~`, terrasses `t`/`c`, et le porche ; une
petite porte donne sur l’escalier), `e1` (salle de l’horloge : mécanisme `m`, plaque), `e2` (escalier à vis, meurtrières
`|`), `sommet` (terrasse sous le campanile : 3 cloches en décor, parapet).
**Lumière** : nuit ; la place est éclairée par la lune, l’intérieur `sombre: 2`.
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `mecanisme_horloge` | salle de l’horloge | `pro_mecanisme` + plaque 1909 |
| `carnet_tour` | marche de l’escalier, à mi-hauteur | document `doc_carnet_maud_tour` |
| `sommet_maud` | Maud assise contre un pilier, au sommet | `pro_maud` (si `pro_cloches_faites`) |

**Morts** : aucun à l’intérieur. Sur la place, **la foule** convoquée par la cinématique `pro_cloches` : 15 à 25 morts
`immobile` tournés vers la tour après la scène (le joueur est déjà dedans) — ils restent si l’on revient de nuit.
**Porte** : la petite porte du pied de tour est verrouillée `{ flag: 'pro_signal' }` (Maud l’ouvre depuis le haut).
**Entrée nommée** `porche` : au pied de l’escalier, côté intérieur de la petite porte (la scène `pro_cloches_porte` y place le joueur, porte refermée derrière lui).
**Déroulé** : arrivée → scène `pro_horloge` → cinématique → choix chronométré → escalier → mécanisme → Maud → fin du
prologue (téléportation chez Nostradamus).

## 3. `nostradamus` — Maison de Nostradamus (CHAPITRE 1, hub)

**Réel** : maison où vécut Nostradamus (1547-1566), rue Nostradamus, musée municipal de 10 salles sur 3 niveaux avec
scénographies (cuisine, cabinet de l’astrologue, apothicairerie), escaliers étroits.
**Étages** : `cave` (voûtée, 8 × 6), `rdc` (accueil-boutique, cuisine reconstituée avec **grande cheminée** où Maud
chauffe le cautère), `e1` (cabinet de l’astrologue : bureau, sphère armillaire, mannequin de cire ; c’est le poste de
Maud), `e2` (chambre basse sous les toits : lit de camp du joueur, entrée nommée **`chambre`**).
**Lumière** : pénombre (volets clos), lampe à pétrole au cabinet.
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `maud` | Maud au bureau du cabinet (PNJ, présente jusqu’à la nuit des sonnailles) | menu `maud_parler` |
| `cave_patiente` | lit de camp dans la cave, Mireille (P5) sous un drap, enchaînée | `nos_cave` + `doc_fiche_p5` |
| `cartel_peste` | panneau du musée, rez-de-chaussée | `doc_cartel_peste` |
| `scanner_maud` | à côté du scanner, cabinet | `doc_scanner_maud` |

**Morts** : aucun (maison sécurisée). Mireille est un décor jusqu’à `ch1_p5` (combat géré par la scène).
**Objets** : cuisine : conserves (butin), trousse de soins ; cabinet : piles.
**Déroulé** : réveil (`chambre`) → `ch1_matin` (déclencheur d’entrée) → cautère (scène) → sorties vers Empéri. Retour
avec le registre → `ch1_confrontation` → cave.

## 4. `emperi` — Château de l’Empéri et montée du Puech (CHAPITRE 1)

**Réel** : forteresse du Xe au XVIIe s. sur le rocher du Puech ; cour d’honneur à galerie Renaissance, cour Nord
(Jardin des Simples), chapelle Sainte-Catherine (castrale), salles du musée d’art et d’histoire militaire, remparts et
tours ; en contrebas la montée du Puech et le lycée de l’Empéri.
**Étages** :
- `montee` (extérieur) : montée pavée ≈ 40 × 14, grilles du lycée à gauche, **ronces sous le rempart**, la **porte du
  château** (grille de chantier + palettes). Point d’arrivée `@`.
- `rdc` : cour d’honneur (feu, linge, tableau d’ardoise), cour Nord / Jardin des Simples (herbes médicinales à
  cueillir), **chapelle** (cellule de Maud si arrêtée ; dortoir des petits pendant le siège), salle des gardes (bureau
  de Vidal), **poterne** côté lycée (escalier descendant vers une grille à manivelle).
- `e1` : salles du musée (vitrines d’armes : sabres, baïonnettes ; uniformes), galerie.
- `remparts` : chemin de ronde, **tour d’angle** avec la radio.
**Lumière** : jour ; salles du musée `sombre: 1`, chapelle `sombre: 1`.
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `porte_emperi` | devant la grille (côté montée) | PNJ Vidal à travers la grille si statut « rejeté » |
| `vidal` | cour d’honneur | menu `vidal_parler` |
| `lou_rempart` | chemin de ronde (Lou après son retour) | menu `lou_parler` |
| `radio_emperi` | sommet de la tour d’angle | `emp_radio` (si `radio_ok`) |
| `sac_rouge` | ronces sous le rempart, côté montée | `emp_sac_rouge` (téléphone, vidéo) |
| `journal_vidal` | bureau de la salle des gardes | `doc_journal_vidal` |
| `panneau_regles` | mur de la cour | `doc_regles_emperi` |
| `vitrine_sabres` | salle du musée | `doc_cartel_sabre` (+ butin : `sabre_cavalerie`) |

**Porte** : la porte du château est `{ porte: true, verrou: { flag: 'emp_entree_ok' } }` (ouverte après l’inspection
réussie, l’acceptation « immunisé », ou le retour de Lou).
**PNJ décor** : 15 à 20 adolescents (silhouettes non interactives) dans la cour ; Hugo et Mehdi à la porte.
**Morts** : aucun à l’intérieur avant le siège. Dans la montée : 2 `erre` bas vers le lycée.
**État « siège »** (après `sonnailles_commencees`) : la montée est remplie de morts `erre`/`cogne` contre la porte ; les
combats du siège sont lancés par les scènes (`ch1_siege_*`), le niveau n’a qu’à montrer la foule en contrebas.
**Déroulé** : inspection → Vidal → (Saint-Laurent) → retour de Lou → radio → carnet de Lou → sac rouge → vidéo → Vidal.
Nuit des sonnailles : siège → aube → départ (la scène `ch1_fin` renvoie à la carte).

## 5. `saint_laurent` — Collégiale Saint-Laurent (CHAPITRE 1, discrétion)

**Réel** : plus grande église de Salon, gothique provençal (1344-XVe), nef unique très haute à croisées d’ogives,
chapelles latérales, **tombeau de Nostradamus dans la chapelle de la Vierge**, clocher octogonal, sacristie.
**Étages** : `rdc` (parvis et square Jean XXIII, nef ≈ 14 × 36, bancs `n` en rangs, chœur, autel, chapelles latérales,
chapelle de la Vierge fermée par une grille, sacristie avec porte basse sur la ruelle), `clocher` (escalier à vis
depuis le bas-côté, chambre des cloches).
**Lumière** : `sombre: 1` (vitraux), cierges près de l’autel.
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `nef_entree` | zone juste après le portail | `stl_nef` |
| `cure_autel` | le prêtre à l’autel | `stl_cure` (voler la clé de la sacristie) |
| `tombeau_nostradamus` | grille de la chapelle de la Vierge | `stl_nathan` + plaque |
| `clocher_lou` | chambre des cloches | `stl_lou` |
| `porte_sacristie` | porte de la sacristie (côté chœur) | `stl_sortie` (si Lou trouvée et clé) |
| `sac_nathan` | sac de sport ouvert sur le parvis | `doc_telephone_nathan` |
| `presentoir` | présentoir près du portail | `doc_annonce_paroisse` |

**Morts** : **40 à 50 `immobile`** debout entre les bancs, tournés vers l’autel (cône de vue réduit : ils regardent
l’autel) ; le **prêtre** (`errant`, `immobile`) derrière l’autel. **Demande spéciale** : tant que le prêtre agite sa
clochette (son en boucle), l’ouïe des morts de la nef est très réduite ; si `stl_cure` échoue ou si le prêtre meurt, la
clochette s’arrête et la nef passe en `alerte` (effet `bruit: 3` de la scène). Nathan (`coureur`) enfermé derrière la
grille de la chapelle (ne peut pas sortir).
**Portes** : sacristie `X` avec `verrou: 'cle_sacristie'` ; grille de la chapelle : infranchissable (décor `|`).
**Déroulé** : parvis (chien, sac) → nef (discrétion) → clocher (Lou) → prêtre (clé) → sacristie → sortie avec Lou.

## 6. `hopital` — Centre hospitalier du Pays salonais (CHAPITRE 1, donjon)

**Réel** : hôpital public (~350 lits), urgences, bloc, maternité, morgue au sous-sol.
**Étages** : `exterieur` (parking, ambulances en épi, tente militaire, housses), `rdc` (hall barricadé, urgences : box
1 à 8, secrétariat, salle de tri), `ssol` (morgue, **chambre froide**, pharmacie centrale, **salle 4 — plâtres**,
vestiaires du personnel, locaux techniques), `e1` (bureau du chef de service, chambres de garde, couloir de médecine).
**Lumière** : `sombre: 2` au sous-sol (noir), `sombre: 1` ailleurs ; quelques néons qui clignotent (décor).
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `dossiers_urgences` | secrétariat des urgences (RDC) | `hop_dossiers` (dossiers P4 et Luc) |
| `bureau_maud` | bureau du chef de service (E1) | `hop_bureau` (carnet P1, rapport du 8/09) |
| `morgue_couloir` | zone au début du couloir de la morgue (SSOL) | `hop_brancardier` (boss) |
| `chambre_froide` | paillasse au fond de la chambre froide | `hop_registre` (le registre) |
| `salle_4` | seuil de la salle des plâtres | `hop_salle4` (souvenir, clochette) |
| `casier_luc` | vestiaires | `hop_casier` (lettre, photo) |
| `frigo_pharmacie` | pharmacie centrale | `hop_frigo` (insuline) |

**Morts** : dense — 10 à 14 au total : patients en blouse (`errant`), soignants (`coureur`), 2 `rampant` sous des lits,
morts `cogne` derrière les portes des box, 3 à 4 `fait_le_mort` sur les brancards du couloir. **Boss** : Karim
(`colosse`), assis sur un chariot au bout du couloir de la morgue, déclenché par la scène (ne pas le placer en `Z`
libre ; le placer `immobile` au bout du couloir).
**Portes** : chambre froide `X`, `verrou: 'badge_morgue'` (badge sur Karim) ; accès au sous-sol par l’escalier de service
(porte `+`) ou l’ascenseur bloqué (décor).
**Déroulé** : parking → RDC (dossiers) → E1 (bureau, facultatif) → SSOL : salle 4 (souvenir) → vestiaires → pharmacie
→ couloir (Karim) → chambre froide (registre). Sortie par le parking.

## 7. `cales` — Grottes de Calès, Lamanon (CHAPITRE 2, hub des vivants)

**Réel** : cirque entre deux falaises de safre, 116 grottes creusées (dont 58 habitats troglodytiques des XIIe-XVe s.),
escaliers taillés, rigoles, niches à pigeons, sentier depuis le village ; site rouvert en avril 2025 ; le canal de
Craponne passe au pied du village (prise du pertuis).
**Étages** : `bas` (village de Lamanon côté église, sentier, **canal de Craponne** avec la martelière, bas de l’échelle
de corde), `n1` (première corniche : grande salle, grotte du conseil, infirmerie, grotte du puits), `n2` (corniche
haute : grottes-dortoirs, niche de Lou, poste du guetteur), `sommet` (plateau, chênes kermès, **antenne**).
**Lumière** : jour ; grottes `sombre: 1` avec feux (lumière chaude).
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `joelle` | grotte du conseil (carte sur une caisse) | menu `joelle_parler` |
| `clemence` | grande salle | menu `clemence_parler` |
| `lou_cales` | niche de Lou, N2 | menu `lou_parler_cales` |
| `grotte_puits` | grotte du puits, derrière une grille de jardin | Maud captive (menu `maud_captive_parler`) |
| `grotte_infirmerie` | infirmerie | Maud médecin (menu `maud_medecin_parler`) |
| `antenne_cales` | sommet de la falaise | `cal_contact` (avec valise radio) |
| `martelliere_canal` | vanne du canal, en bas | `cal_martelliere` |
| `registre_cales` | grotte du conseil | `doc_registre_cales` |
| `radio_cales` | poste radio de Joëlle, grande salle | `doc_bulletin_meteo` |

**PNJ décor** : 40 à 60 silhouettes (vivants de Calès et de l’Empéri), le chien roux.
**Morts** : aucun dans les grottes ; 1 à 2 `erre` dans le village en bas avant `troupeau_passe`, 3 à 5 après.
**Grande salle** : prévoir une grotte assez vaste (≈ 12 × 10) pour la scène du procès (déclencheur d’entrée).
**Déroulé** : arrivée (inspection, insuline) → Joëlle → (Mallemort) → retour : procès → (BA 701) → antenne → veille.

## 8. `mallemort` — Les ponts de Mallemort (CHAPITRE 2 + FINAL)

**Réel** : pont suspendu de 1844-1848 (Marc Seguin, 320 m, pylônes de pierre), restauré et rouvert en 2025 en
passerelle ; pont routier de 1980 à côté ; barrage et canal EDF ; rive nord : Mérindol (Vaucluse).
**Étage unique** extérieur ≈ 70 × 40 : rive sud (route D17d, voitures calcinées, roseaux), **pont routier** muré de
conteneurs empilés (`x`) à mi-longueur, **pont suspendu** (tablier de planches ≈ 3 cases de large, pylônes `#`,
câbles décor) jusqu’au marquage **200 M**, la Durance (`~`) de part et d’autre ; la rive nord est hors d’atteinte
(décor : sacs de sable, projecteurs, tente).
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `ligne_200m` | **zone** en travers du tablier, 4 cases avant le 200 M | `mal_ligne` (sommation, tir) |
| `voiture_refugies` | une voiture ouverte sur la rive sud, au pied du pont | `doc_sms_mallemort` |

**Morts** : reconnaissance : 3 à 5 `erre` sur la rive sud, 0 sur le pont (une vingtaine de corps `%`). **Final**
(`mistral_leve`) : le niveau sert surtout de décor : la scène `fin_pont_1` se joue dès l’entrée.
**Déroulé** : reconnaissance (entrée → approche → `ligne_200m`) ; final (entrée → scènes).

## 9. `vernegues` — Vieux-Vernègues (CHAPITRE 2, les revenus)

**Réel** : village perché détruit par le séisme du 11 juin 1909 ; ruines du château et de l’église, caves voûtées sous
les ruines, trous où le sol s’effondre, panorama sur toute la plaine.
**Étages** : `surface` (extérieur ≈ 50 × 40 : ruelles de ruines, église sans toit — mur à l’inscription —, sacristie
effondrée, dent du château, figuiers `T`), `caves` (caves voûtées reliées : dortoirs des revenus, cave des « ratés »
enchaînés).
**Lumière** : nuit ; des centaines de bougies (points de lumière chaude fixes).
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `berger` | chœur de l’église, feu de sarments | menu `berger_parler` + `doc_carnet_berger` |
| `rose` | sacristie effondrée, Rose assise avec le redon | menu `rose_parler` + `doc_lettre_rose` |
| `nadege` | ruelle principale | menu `nadege_parler` |
| `mur_eglise` | mur de l’église (UN POUR UN) | `doc_credo_revenus` |

**PNJ décor** : 20 à 25 revenus (silhouettes vivantes, non hostiles : ils jouent aux cartes, recousent), deux chiens.
**Morts** : cave des ratés : 6 à 8 `enrage` **enchaînés** (`cogne`, ne se déplacent pas) ; Maud y soigne si `maud_berger`.
**Danger environnemental** (souhait) : 2 à 3 zones où le sol cède vers les caves (chute, blessure légère).
**Déroulé** : arrivée (scène + cinématique) → Nadège → le Berger → Rose (au départ) → caves (facultatif).

## 10. `ba701` — Base aérienne 701 (CHAPITRE 2, donjon militaire)

**Réel** : École de l’air et de l’espace, Patrouille de France (Alphajets), escadron de protection, 450 ha, pistes,
tour de contrôle ; à l’entrée, le rond-point au **Fouga Magister** sur son mât.
**Étages** : `exterieur` (≈ 80 × 50 : rond-point du Fouga, poste de garde et barrière, parking aux **rangers
alignées**, bâtiment de l’escadron, bâtiments d’élèves, tarmac avec 9 Alphajets `v`, hangar de la Patrouille),
`pc` (intérieur du bâtiment de l’escadron : salle de permanence, couloir, **armoire forte**, cellules), `hangar`
(intérieur du hangar PAF : un Alphajet capot ouvert, vestiaires des pilotes).
**Lumière** : plein jour, chaleur ; intérieurs `sombre: 1`.
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `pc_protection` | console de la salle de permanence (lieutenant assis) | `ba_pc` (clé de l’armoire) |
| `armoire_forte` | porte de l’armoire forte | `ba_armoire` (valise radio, classeur, ordre Cautère, Protocole R) |
| `hangar_paf` | cockpit de l’Alphajet en révision | `ba_hangar` (Athos 6, lettre) |

**Morts** : dense et « militaire » : 12 à 18 `militaire` (treillis, gilets) sur la base, dont 4 `fait_le_mort` alignés
sur le parking, 3 `immobile` au garde-à-vous devant le mât aux couleurs ; le lieutenant de permanence `militaire`
`immobile` (géré par la scène) ; Athos 6 sanglé (décor, combat seulement si choisi). Un `colosse` dans les cellules
(facultatif, butin de munitions derrière).
**Portes** : armoire forte `X`, `verrou: 'cle_armoire_forte'`.
**Déroulé** : rond-point (scène) → poste de garde → bâtiment de l’escadron → permanence (clé) → armoire forte →
(hangar) → sortie.

## 11. `senas` — Sénas (CHAPITRE 2, facultatif : « un jour de plus »)

**Réel** : village agricole de la plaine de la Durance, vergers de pommiers et poiriers sous filets anti-grêle,
stations fruitières et entrepôts frigorifiques, ex-RN7.
**Étages** : `exterieur` (≈ 60 × 40 : grand-rue, vergers en rangs `T`, station fruitière, église), `station`
(intérieur du hangar : palox empilés, **porte de chambre froide**), `clocher` (escalier, corde de la cloche).
**Marqueurs** :
| id | où | déclenche |
|---|---|---|
| `porte_chambre_froide` | porte de la chambre froide, fond du hangar | `sen_station` + `doc_imbert` |
| `imbert` | même porte (PNJ, s’il reste) | menu `imbert_parler` |
| `corde_clocher` | pied de la corde, clocher | `sen_cloches` |

**Morts** : 4 à 6 `erre` dans les vergers, 2 `rampant` sous les filets.
**Déroulé** : arrivée → station (les Imbert) → clocher (sonner ou non).

---

## 12. Lieux secondaires (niveaux simples) — documents à placer

Chaque niveau secondaire reçoit son document (posé librement, sans marqueur) :

| Lieu | Document | Suggestion de placement |
|---|---|---|
| `hotel_poste` | `doc_entailles_203` | mur de la chambre 203 (2e étage) |
| `place_crousillat` | `doc_addition_crousillat` | table 7 d’une terrasse |
| `casino_shop` | `doc_liste_casino` | comptoir |
| `pharmacie_carnot` | `doc_ordonnance_luc` | tiroir du comptoir |
| `hotel_de_ville` | `doc_arrete_prefectoral`, `doc_pv_cellule_crise` | hall ; salle du conseil |
| `saint_michel` | `doc_saint_michel` | portail (dehors) |
| `place_de_gaulle` | `doc_affiche_marche` | panneau municipal |
| `cineplanet` | `doc_programme_cine` | caisse ; porte de la salle 3 (fermée, `cogne` derrière) |
| `mediatheque` | `doc_centuries` | table de lecture |
| `marius_fabre` | `doc_savonnerie` | porte de l’atelier |
| `lycee` | `doc_sms_parents` | téléphone sur un banc de la cour |
| `canourgues` | `doc_lettre_canourgues` | table d’un appartement |
| `commissariat` | `doc_main_courante` | comptoir d’accueil |
| `weldom` | `doc_weldom` | caisse |
| `intermarche` | `doc_intermarche` | caisse 4 |
| `leclerc` | `doc_leclerc` | porte de la réserve |
| `pompiers` | `doc_carnet_pompier` | cabine d’un VSAV |
| `gendarmerie` | `doc_repli_gendarmerie` | bureau de l’accueil |
| `jean_moulin` | `doc_socle_jean_moulin` | socle de la statue |
| `gare` | `doc_annonce_gare` | panneau d’affichage |
| `la_barben` | `doc_soigneur_barben` | cabane du soigneur |
| `aerodrome` | `doc_aerodrome` | bureau de l’aéroclub |
| `istres` | `doc_istres` | salle radio |
| `saint_chamas` | `doc_poudrerie` | plaque, ruines |
| `berre` | `doc_berre` | panneau d’entrée du site |
| `miramas` | `doc_triage` | cabine de poste d’aiguillage |
| `miramas_le_vieux` | `doc_miramas_vieux` | porte Notre-Dame |
| `pelissanne` | `doc_pelissanne` | vitrine de la boulangerie |
| `aurons` | `doc_aurons` | mairie |
| `eyguieres` | `doc_eyguieres` | boîte aux lettres |
| `grans` | `doc_grans` | moulin sur la Touloubre |
| `lancon` | `doc_lancon` | voiture dans la file du péage |
| `cornillon` | `doc_cornillon` | belvédère |

**Rappel de ton** : chaque lieu secondaire garde une trace de la vie interrompue (couverts dressés, cartables, jouets,
un gâteau d’anniversaire) — c’est ce qui rend le monde réel. Le **marché mort** (morts `immobile` devant les étals) est
bienvenu sur les cours et la place de Gaulle tant que `troupeau_passe` n’est pas posé ; après, Salon est **vide**.
