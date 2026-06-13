# Musique & sons libres de droit — One More Day

Le jeu **fonctionne sans aucun fichier** : tout est synthétisé en temps réel. Ce
guide sert si tu veux remplacer certains thèmes (ou lits d'ambiance) par de
**vrais morceaux libres de droit**.

## Mode d'emploi (3 étapes)

1. Télécharge des morceaux depuis une source ci-dessous et **boucle-les proprement**
   (un éditeur comme Audacity suffit : couper sur un passage à zéro, fondu très court).
   Exporte en **`.ogg`** (bon compromis poids/qualité) ou `.mp3`.
2. Dépose les fichiers dans ce dossier `audio/`.
3. Copie `manifest.example.json` en **`manifest.json`** et garde uniquement les
   lignes dont tu as le fichier. Recharge le jeu : les entrées valides remplacent
   la synthèse, le reste reste synthétisé (repli silencieux, jamais d'erreur).

> ⚠️ **Licences** : vérifie TOUJOURS la licence exacte sur la page du morceau
> avant de l'utiliser, et **crédite l'auteur** si la licence l'exige (CC‑BY).
> Les indications ci‑dessous donnent la licence *habituelle* de la source, pas une
> garantie morceau par morceau. Note tes crédits dans `CREDITS.md` à la racine.

## Quel morceau pour quel thème ?

| id du thème (`manifest.json`) | Où il joue | Ambiance à chercher |
|---|---|---|
| `titre` | Écran-titre, scènes calmes | piano lent, mélancolique, post‑apo, « dark ambient melancholic » |
| `exploration` | Rues de Salon, région (jour) | drone discret, tension sourde, « desolate ambient » |
| `exploration_nuit` | Variante de nuit | plus grave, plus feutré, « dark drone night » |
| `tension` | Zombie proche (nappe d'alerte) | dissonance lente, « unsettling drone suspense » |
| `combat` | Boucle de combat | percussions tendues, « horror action loop » |
| `refuge` | Le Refuge de Miramas | chaud, fragile, « warm acoustic hope » |
| `train` | Voyage en train | basse roulante, « rhythmic travel underscore » |
| `mort` | Écran de mort | glas, « funeral dark sparse » |

Les `ambiances` (rue, hopital, eglise, region…) attendent plutôt des **field
recordings** (ambiances de terrain) en boucle longue : vent, salle vide, nef.

## Sources fiables

### CC0 (domaine public — aucune attribution requise)
- **FreePD.com** — musique CC0, classée par humeur (Horror, Dark, Epic). Idéal pour `combat`, `mort`, `tension`.
- **OpenGameArt.org** — filtre la licence sur **CC0** (et le type « Music »). Beaucoup de boucles pensées pour le jeu.
- **Pixabay Music** (pixabay.com/music) — *Pixabay Content License* : gratuit, usage commercial, sans attribution. Recherche « dark ambient », « horror drone », « post apocalyptic ».
- **freesound.org** — pour les **ambiances/field recordings** (vent, fontaine, salle vide). Filtre **CC0**. (Crédite si CC‑BY.)

### CC‑BY (gratuit, **mais attribution obligatoire**)
- **Kevin MacLeod — incompetech.com** — immense catalogue CC‑BY 4.0, tagué par humeur (Dark/Horror/Ambient). Parfait pour `titre`, `tension`, `combat`. Crédit type : « *Titre* — Kevin MacLeod (incompetech.com), CC BY 4.0 ».
- **Scott Buckley — scottbuckley.com.au** — cinématique/ambient, CC‑BY 4.0. Très bon pour `titre`, `refuge`, `exploration`.
- **Kai Engel**, **Lobo Loco**, **Monplaisir** (via **freemusicarchive.org**) — filtre la licence (souvent CC‑BY ou CC0). Vérifie chaque morceau.
- **Patrick de Arteaga — patrickdearteaga.com** — CC‑BY, orienté jeu vidéo.

## Conseils de bouclage
- Vise des boucles de **30 s à 2 min**, sans coup de cymbale/attaque franche aux extrémités.
- Le jeu applique son volume et son mute ; mixe les fichiers **plutôt bas** (le son est un survival, pas un clip).
- Pour `tension` et `combat`, des boucles **courtes et sans intro** marchent mieux (elles démarrent net).
