#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BT_BUILD_DIR:-$REPO_ROOT/build}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[bootstrap] missing required command: $1" >&2
    exit 1
  fi
}

need_cmd cmake
need_cmd npm
need_cmd python3

echo "[bootstrap] configuring C++ build: $BUILD_DIR"
cmake -S "$REPO_ROOT" -B "$BUILD_DIR" \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=ON \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=ON

echo "[bootstrap] installing frontend dependencies"
cd "$REPO_ROOT/bt_editor"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[bootstrap] installing Playwright Chromium browser"
npx playwright install chromium

cat <<EOF
[bootstrap] done

Next:
  ./scripts/dev.sh    # start bt_server + Vite editor
  ./scripts/test.sh   # run build, tests, server smoke, frontend checks
EOF
