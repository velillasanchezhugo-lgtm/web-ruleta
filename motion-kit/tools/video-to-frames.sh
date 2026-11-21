#!/usr/bin/env bash
# Prepara un vídeo (IA o 3D) para una película guiada por scroll:
#  1) detecta cortes secos (scene score > 0.2) → los imprime como índices de fotograma
#  2) exporta WebP para escritorio (1600 px, 24 fps) y móvil (1100 px, 18 fps)
#  3) imprime el JSON listo para src/film.json
# Uso: tools/video-to-frames.sh video.mp4 public/   (crea public/film y public/film-m)
set -euo pipefail
VIDEO="$1"; OUT="${2:-public}"
mkdir -p "$OUT/film" "$OUT/film-m"

echo "== Cortes secos detectados (revisar a mano; se disimulan con fundido+zoom en film.js)"
TMP="$(mktemp)"
ffmpeg -v error -i "$VIDEO" -vf "select='gte(scene,0)',metadata=print:key=lavfi.scene_score:file=$TMP" -f null -
CUTS_S=$(awk '/pts_time/{t=$0; sub(/.*pts_time:/,"",t)} /scene_score/{split($0,a,"="); if (a[2] > 0.2) print t}' "$TMP")
rm -f "$TMP"
echo "${CUTS_S:-ninguno} (segundos)"

ffmpeg -v error -y -i "$VIDEO" -vf "scale=1600:-2" -c:v libwebp -quality 72 -compression_level 5 "$OUT/film/f_%04d.webp"
ffmpeg -v error -y -i "$VIDEO" -vf "fps=18,scale=1100:-2" -c:v libwebp -quality 62 -compression_level 5 "$OUT/film-m/f_%04d.webp"
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$VIDEO" | awk -F/ '{printf "%.3f", $1/($2?$2:1)}')
D=$(ls "$OUT/film" | wc -l); M=$(ls "$OUT/film-m" | wc -l)
dcuts=$(for t in $CUTS_S; do awk -v t="$t" -v f="$FPS" 'BEGIN{printf "%d,", t*f+0.5}'; done); mcuts=$(for t in $CUTS_S; do awk -v t="$t" 'BEGIN{printf "%d,", t*18+0.5}'; done)
echo "== Peso: escritorio $(du -sh "$OUT/film" | cut -f1) · móvil $(du -sh "$OUT/film-m" | cut -f1) (objetivo < 15 MB / < 6 MB)"
echo "== src/film.json (ajusta 'stops' viendo dónde se detiene la cámara):"
echo "{ \"desktop\": { \"count\": $D, \"cuts\": [${dcuts%,}] }, \"mobile\": { \"count\": $M, \"cuts\": [${mcuts%,}] }, \"stops\": [0, 0.25, 0.5, 0.75, 1] }"
