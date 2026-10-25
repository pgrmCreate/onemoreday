#!/usr/bin/env bash
# Une image d'essai (milieu du plan, qualité brouillon) par plan : D:\projects 3D\OneMoreDay\apercus\<plan>.jpg
#   bash tools/blender/cine/apercus.sh intro_5 frappe_2 …
BLENDER="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
for p in "$@"; do
  "$BLENDER" -b --python "$RACINE/tools/blender/cine/tourner.py" -- "$p" --image --brouillon > "/d/projects 3D/OneMoreDay/cine/apercu_$p.log" 2>&1
  if grep -q "terminé en" "/d/projects 3D/OneMoreDay/cine/apercu_$p.log"; then echo "[apercu] $p : ok"; else echo "[apercu] $p : ÉCHEC"; grep -i "error\|Traceback" -A3 "/d/projects 3D/OneMoreDay/cine/apercu_$p.log" | head -20; fi
done
