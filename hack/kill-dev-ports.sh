#!/usr/bin/env sh
# Releases standalone dev server ports before starting npm run dev / dev:mock.
# Only kills processes that are LISTENing on the port (not browser clients).
# Usage: sh hack/kill-dev-ports.sh [port ...]
# Default ports: 3001 (Go proxy), 9000 (webpack dev server)

set -eu

if [ "$#" -eq 0 ]; then
  set -- 3001 9000
fi

for port in "$@"; do
  pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -z "$pids" ]; then
    continue
  fi
  echo "Releasing port ${port} (listener PIDs: ${pids})"
  # shellcheck disable=SC2086
  kill ${pids} 2>/dev/null || true
  sleep 0.3
  pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
  fi
done
