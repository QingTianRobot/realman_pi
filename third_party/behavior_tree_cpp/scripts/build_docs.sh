#!/usr/bin/env bash
#
# build_docs.sh — 以 warning-as-error 构建 Sphinx HTML 并校验链接
#
# @author pony
# @date 2026-07-06
# @version v1.1.0
# @last_modified 2026-07-13
# @changelog
#   - v1.1.0 (2026-07-13): 将 Sphinx linkcheck 纳入统一文档 gate
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"
BUILD_DIR="${BT_DOCS_BUILD_DIR:-$DOCS_DIR/_build}"

if ! command -v sphinx-build >/dev/null 2>&1; then
  echo "[docs] sphinx-build not found. Install with:" >&2
  echo "[docs]   python3 -m pip install -r docs/requirements.txt" >&2
  exit 1
fi

echo "[docs] building Sphinx HTML"
sphinx-build -W --keep-going -b html "$DOCS_DIR" "$BUILD_DIR/html"
touch "$BUILD_DIR/html/.nojekyll"

echo "[docs] built: $BUILD_DIR/html/index.html"

echo "[docs] checking Sphinx links"
sphinx-build -W --keep-going -b linkcheck "$DOCS_DIR" "$BUILD_DIR/linkcheck"
echo "[docs] linkcheck passed"
