ONE MORE DAY — Dossier audio (optionnel)
=========================================

Par défaut, TOUT le son du jeu est synthétisé en temps réel : ce dossier
peut rester vide (ou être supprimé), le jeu fonctionne sans lui.

Mais si vous voulez remplacer certains thèmes musicaux ou certaines
ambiances par de VRAIS fichiers audio, déposez-les ici et décrivez-les
dans un fichier "manifest.json" placé dans ce même dossier.

FORMAT DU MANIFEST (audio/manifest.json)
-----------------------------------------

{
  "themes": {
    "titre": "titre.ogg",
    "refuge": "refuge.ogg",
    "combat": "combat.ogg"
  },
  "ambiances": {
    "rue": "rue.ogg"
  }
}

- Les chemins sont relatifs au dossier audio/ (ex. "titre.ogg" =
  audio/titre.ogg). Les sous-dossiers marchent aussi ("musique/titre.ogg").
- Formats acceptés : tout ce que votre navigateur sait décoder
  (.ogg, .mp3, .wav, .m4a…). L'OGG est un bon choix.
- Les fichiers sont joués EN BOUCLE : prévoyez des boucles propres.
- Le volume et le mute du jeu s'appliquent normalement.

NOMS DE THÈMES RECONNUS ("themes")
-----------------------------------
  titre             écran titre et scènes calmes (le générique du jeu)
  refuge            le refuge de Miramas-le-Vieux
  exploration       rues de Salon et carte de la région, le jour
  exploration_nuit  variante de nuit (si absente, "exploration" est utilisé)
  mort              écran de mort et scènes funèbres
  train             scènes de train / voyage
  combat            remplace la boucle de combat procédurale
  tension           réservé (nappe d'alerte zombie — synthèse pour l'instant)

NOMS D'AMBIANCES RECONNUS ("ambiances")
----------------------------------------
Ce sont les identifiants des scènes sonores du jeu :
  hotel, interieur, rue, magasin, eglise, musee, gare, triage, hopital,
  commissariat, garage, mediatheque, cinema, region, village, refuge,
  sombre, train

Un fichier d'ambiance remplace le LIT SONORE continu du lieu (vent,
drones, rythme des rails). Les bruits ponctuels du lieu (corbeaux,
craquements, gémissements…) et la musique restent synthétisés par-dessus.

RÈGLES DE REPLI
----------------
- Pas de manifest.json : comportement normal, tout est synthétisé.
- Manifest invalide, fichier manquant ou illisible : l'entrée concernée
  est ignorée EN SILENCE et la synthèse reprend la main pour celle-ci.
- Vous pouvez ne déclarer qu'un seul thème : tout le reste demeure synthétisé.

Aucune erreur ne s'affichera jamais : si votre fichier ne joue pas,
vérifiez son nom dans le manifest, son format, et la console du navigateur
(onglet Réseau) pour voir si le fichier est bien trouvé.
