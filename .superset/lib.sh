# Fonctions partagées par setup.sh, run.sh et teardown.sh. Sourcé, jamais exécuté.

# Superset lance les scripts depuis le worktree du workspace.
WORKSPACE="$(cd "${SUPERSET_WORKSPACE_PATH:-$PWD}" && pwd -P)"
ROOT="$(cd "${SUPERSET_ROOT_PATH:-$WORKSPACE}" && pwd -P)"

# Chaque workspace reçoit son port pour `next dev`, réservé dans un registre commun à tous les
# dépôts de la machine (le dépôt superset s'en sert déjà). Même fichier, même verrou, même grille
# de créneaux de 20 à partir de 3000 que lui : sinon deux dépôts se donneraient le même port.
ALLOC_FILE="$HOME/.superset/port-allocations.json"
ALLOC_LOCK="$HOME/.superset/port-allocations.lock"
PORT_START=3000
PORT_STEP=20
# Jamais attribués : 4000 est celui de `pnpm registry:serve`, que les projets de banc
# (videocn-test-base, videocn-test-radix) pointent en dur ; les autres sont bloqués par les
# navigateurs ou pris par AirPlay sur macOS.
RESERVED_PORTS="3659 4000 4045 5000 5060 5061 6000 6566 6665 6666 6667 6668 6669 6697 7000"

lock_allocations() {
  local waited=0 pid mtime
  mkdir -p "$(dirname "$ALLOC_LOCK")"
  while ! mkdir "$ALLOC_LOCK" 2>/dev/null; do
    # Libéré entre-temps : retenter tout de suite.
    mtime="$(stat -f %m "$ALLOC_LOCK" 2>/dev/null)" || continue
    pid="$(cat "$ALLOC_LOCK/pid" 2>/dev/null || true)"
    # Verrou abandonné : son détenteur est mort, ou il traîne depuis plus de 5 minutes.
    if { [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; } || [ $(($(date +%s) - mtime)) -ge 300 ]; then
      rm -rf "$ALLOC_LOCK"
      continue
    fi
    if [ "$waited" -ge 30 ]; then
      echo "Verrou $ALLOC_LOCK toujours pris après 30 s." >&2
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
  echo $$ > "$ALLOC_LOCK/pid"
}

unlock_allocations() {
  rm -rf "$ALLOC_LOCK"
}

port_is_free() {
  local port="$1" reserved
  for reserved in $RESERVED_PORTS; do
    [ "$port" = "$reserved" ] && return 1
  done
  jq -e --argjson p "$port" 'any(.[]; . == $p)' "$ALLOC_FILE" >/dev/null && return 1
  ! lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1
}

# À appeler verrou pris. Lit le port du workspace, ou réserve le premier créneau libre.
reserve_port() {
  local port
  [ -f "$ALLOC_FILE" ] || echo '{}' > "$ALLOC_FILE" || return 1
  port="$(jq -r --arg k "$WORKSPACE" '.[$k] // empty' "$ALLOC_FILE")" || return 1
  if [ -z "$port" ]; then
    port=$PORT_START
    while ! port_is_free "$port"; do
      port=$((port + PORT_STEP))
      [ "$port" -lt 65000 ] || return 1
    done
    jq --arg k "$WORKSPACE" --argjson v "$port" '. + {($k): $v}' "$ALLOC_FILE" > "$ALLOC_FILE.tmp.$$" \
      && mv "$ALLOC_FILE.tmp.$$" "$ALLOC_FILE" || { rm -f "$ALLOC_FILE.tmp.$$"; return 1; }
  fi
  echo "$port"
}

# Affiche le port du workspace, en le réservant au premier appel.
workspace_port() {
  local port status=0
  lock_allocations || return 1
  port="$(reserve_port)" || status=$?
  unlock_allocations
  [ "$status" -eq 0 ] && echo "$port"
}

release_port() {
  local status=0
  [ -f "$ALLOC_FILE" ] || return 0
  lock_allocations || return 1
  jq --arg k "$WORKSPACE" 'del(.[$k])' "$ALLOC_FILE" > "$ALLOC_FILE.tmp.$$" \
    && mv "$ALLOC_FILE.tmp.$$" "$ALLOC_FILE" || { rm -f "$ALLOC_FILE.tmp.$$"; status=1; }
  unlock_allocations
  return "$status"
}
