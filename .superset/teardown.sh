#!/usr/bin/env bash
# Suppression d'un workspace Superset : arrête ses serveurs et libère son port.
# N'échoue jamais : un teardown en erreur bloque la suppression dans l'interface.
set -uo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# Le dépôt principal n'est pas un workspace jetable : ni ses serveurs ni son port ne sont à lui
# retirer.
if [ -z "$WORKSPACE" ] || [ "$ROOT" = "$WORKSPACE" ]; then
  echo "Dépôt principal ou worktree introuvable : rien à arrêter."
  exit 0
fi

# 1. Tout serveur en écoute lancé depuis le worktree : `next dev` du bouton Run ou d'un agent,
#    `pnpm registry:serve`… Tuer le processus qui écoute fait tomber `next dev` et `pnpm` avec lui.
for pid in $(lsof -nP -iTCP -sTCP:LISTEN -t 2>/dev/null | sort -u); do
  cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')"
  case "$cwd" in
    "$WORKSPACE" | "$WORKSPACE"/*)
      command="$(ps -o command= -p "$pid" 2>/dev/null)"
      kill "$pid" 2>/dev/null && echo "Arrêté : ${command:-PID $pid}"
      ;;
  esac
done

# 2. Le port retourne au registre commun.
if release_port; then
  echo "Port libéré."
else
  echo "Port non libéré : retirer « $WORKSPACE » de $ALLOC_FILE à la main." >&2
fi
exit 0
