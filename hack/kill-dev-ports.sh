#!/usr/bin/env sh
# Releases standalone dev server ports before starting npm run dev / dev:mock.
# Only kills processes that are LISTENing on the port (not browser clients).
# Usage: sh hack/kill-dev-ports.sh [port ...]
# Default ports: 3001 (Go proxy), 9000 (webpack dev server)

set -eu

release_port() {
  port="$1"
  attempt=0
  while [ "$attempt" -lt 10 ]; do
    pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)
    if [ -z "$pids" ]; then
      return 0
    fi
    if [ "$attempt" -eq 0 ]; then
      echo "Releasing port ${port} (listener PIDs: ${pids})"
    fi
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
    sleep 0.4
    attempt=$((attempt + 1))
  done
  echo "warning: port ${port} still in use after cleanup" >&2
  return 1
}

if [ "$#" -eq 0 ]; then
  set -- 3001 9000
fi

for port in "$@"; do
  release_port "$port" || true
done
