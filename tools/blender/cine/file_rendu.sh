#!/usr/bin/env bash
# File de rendu des plans tournés : rend chaque plan (Blender, en arrière-plan), garde le maître, réencode un clip léger (VP9).
#   bash tools/blender/cine/file_rendu.sh intro_1 intro_2 …
BLENDER="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
FF="$(python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')"
RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
MAITRES="/d/projects 3D/OneMoreDay/cine/maitres"
mkdir -p "$MAITRES"
for p in "$@"; do
  echo "[file] $p : rendu…"
  "$BLENDER" -b --python "$RACINE/tools/blender/cine/tourner.py" -- "$p" > "/d/projects 3D/OneMoreDay/cine/$p.log" 2>&1
  if [ -s "$RACINE/img/cine/clips/$p.webm" ]; then
    mv -f "$RACINE/img/cine/clips/$p.webm" "$MAITRES/$p.webm"
    "$FF" -y -loglevel error -i "$MAITRES/$p.webm" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good -cpu-used 2 -an "$RACINE/img/cine/clips/$p.webm"
    echo "[file] $p : fait ($(du -h "$RACINE/img/cine/clips/$p.webm" | cut -f1))"
  else
    echo "[file] $p : ÉCHEC (voir le journal)"
  fi
done
echo "[file] terminé"
