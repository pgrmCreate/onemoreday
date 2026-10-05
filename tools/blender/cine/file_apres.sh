#!/usr/bin/env bash
# Attend la fin de la file en cours (journal $1 qui contient « terminé »), puis lance une autre file : file_apres.sh <journal> <plans…>
J="$1"; shift
until grep -q "terminé" "$J" 2>/dev/null; do sleep 30; done
bash "$(dirname "$0")/file_rendu.sh" "$@"
