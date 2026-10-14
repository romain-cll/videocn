#!/usr/bin/env bash
# Bouton Run de Superset : `next dev` sur le port réservé au workspace.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$WORKSPACE"

# Workspace créé avant que ce script existe : le setup n'y a jamais tourné.
[ -d node_modules ] || pnpm install --frozen-lockfile --prefer-offline

port="$(workspace_port)"
echo "videoCn : http://localhost:$port"
PORT="$port" exec pnpm dev
