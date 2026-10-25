#!/usr/bin/env bash
# Range les « rushes » de l'histoire du Refuge pour pouvoir les retoucher plus tard (hors dépôt, ils pèsent des Go) :
#   bash tools/blender/cine/archiver_rushes.sh
# → D:\projects 3D\OneMoreDay\rushes\histoire_refuge_2026-10\
#     plans\<plan>.blend        la scène de chaque plan, images embarquées, plage d'images et sortie vidéo réglées
#     vignettes\<décor>.blend   les scènes des incrustations (horde, morts du péage, bergerie)
#     maitres\<plan>.webm       les vidéos maîtres, avant la compression du jeu
#     vignettes\images\         calques 3D (PNG transparents) et vignettes finales
BLENDER="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
SRC="/d/projects 3D/OneMoreDay"
DEST="$SRC/rushes/histoire_refuge_2026-10"
PLANS="intro_1 intro_2 intro_3 intro_4 intro_5 intro_6 frappe_1 frappe_2 frappe_3 chute_1 chute_2 chute_3 brume_1 brume_2 brume_3 cornillon_1 cornillon_2 pont_1 pont_2 pont_3 fin_pont_1 fin_pont_2 fin_place_1 fin_place_2 fin_seul_1"
mkdir -p "$DEST/plans" "$DEST/vignettes/images" "$DEST/maitres"
for p in $PLANS; do
  fr=$(grep -ho "frames [0-9]*-[0-9]*" "$SRC/cine/$p.log" | tail -1 | cut -d' ' -f2)
  f0=${fr%-*}; f1=${fr#*-}
  "$BLENDER" -b "$SRC/cine/$p.blend" --python "$RACINE/tools/blender/cine/rushes.py" -- "$p" "$f0" "$f1" "$(cygpath -w "$DEST/plans/$p.blend")" 2>&1 | grep -h "\[rush\]"
  cp -f "$SRC/cine/maitres/$p.webm" "$DEST/maitres/"
done
for d in triage_horde peage_lancon bergerie_crau; do
  "$BLENDER" -b "$SRC/cine/composites/$d.blend" --python "$RACINE/tools/blender/cine/rushes.py" -- "$d" 0 0 "$(cygpath -w "$DEST/vignettes/$d.blend")" 2>&1 | grep -h "\[rush\]"
done
cp -f "$SRC"/apercus/calque_*.png "$SRC"/apercus/plaque_*.jpg "$DEST/vignettes/images/"
echo "[rushes] $(du -sh "$DEST" | cut -f1) dans $DEST"
