#!/usr/bin/env bash
# Création d'un workspace Superset : fichiers non versionnés, dépendances, types de routes, port.
# Relançable sans risque : rien n'est écrasé, rien n'est réservé deux fois.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$WORKSPACE"

# 1. Ce que git ne met pas dans un worktree. Un fichier déjà présent est laissé tel quel, pour ne
#    pas écraser une retouche propre au workspace.
if [ "$ROOT" != "$WORKSPACE" ]; then
  for src in "$ROOT"/.env*; do
    name="$(basename "$src")"
    [ -f "$src" ] && [ ! -e "$name" ] || continue
    git ls-files --error-unmatch "$name" >/dev/null 2>&1 && continue
    cp "$src" "$name"
    echo "Copié depuis le dépôt principal : $name"
  done

  # La mémoire des agents (reviewer…) est partagée plutôt que copiée : ce qu'un agent apprend dans
  # un workspace survit à sa suppression et profite aux autres.
  if [ -d "$ROOT/.claude/agent-memory" ] && [ ! -e .claude/agent-memory ]; then
    mkdir -p .claude
    ln -s "$ROOT/.claude/agent-memory" .claude/agent-memory
    echo "Lié au dépôt principal : .claude/agent-memory"
  fi
fi
if [ ! -e .env.local ]; then
  cp .env.example .env.local
  echo "Créé depuis .env.example : .env.local"
fi

# 2. Dépendances. Le store pnpm est global : l'installation ne fait que lier des paquets déjà là.
pnpm install --frozen-lockfile --prefer-offline

# 3. Types de routes (`LayoutProps`, `PageProps`), sans quoi `pnpm typecheck` échoue tant que
#    `next build` n'a pas tourné.
pnpm exec next typegen

# 4. Port du serveur de dev, réservé maintenant pour l'afficher dès la création.
port="$(workspace_port)"
echo "Workspace prêt. Serveur de dev (bouton Run) : http://localhost:$port"
