#!/usr/bin/env bash
# Crea un proyecto nuevo de WEB CON MOTION a partir del starter.
# Uso: motion-kit/new-project.sh <carpeta-destino> "<Nombre del cliente>"
set -euo pipefail
KIT="$(cd "$(dirname "$0")" && pwd)"
DEST="$1"; NAME="${2:-Cliente}"
[ -e "$DEST" ] && { echo "Ya existe $DEST"; exit 1; }
cp -r "$KIT/starter" "$DEST"
mkdir -p "$DEST/src/kit" "$DEST/tools"
cp "$KIT/src/"* "$DEST/src/kit/"
cp "$KIT/tools/"* "$DEST/tools/"
SLUG=$(echo "$NAME" | iconv -f utf8 -t ascii//TRANSLIT 2>/dev/null | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//;s/-$//')
sed -i "s/__CLIENTE__/$NAME/g; s/__slug__/$SLUG/g" "$DEST/index.html" "$DEST/package.json"
(cd "$DEST" && npm install --silent)
echo "Listo: $DEST  →  cd $DEST && npm run dev"
