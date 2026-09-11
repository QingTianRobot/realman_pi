#!/usr/bin/env bash
#
# build_pages.sh — 从同一 Sphinx 构建根目录生成干净的 GitHub Pages 产物
#
# @author pony
# @date 2026-07-06
# @version v1.2.1
# @last_modified 2026-07-13
# @changelog
#   - v1.1.0 (2026-07-13): 统一文档构建与 Pages 打包根目录，避免复制陈旧 HTML
#   - v1.2.0 (2026-07-13): 禁止任意 Pages 删除目标并校验构建根目录边界
#   - v1.2.1 (2026-07-13): 在创建目录前解析父路径，拒绝软链接与 .. 越界
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BT_DOCS_BUILD_DIR:-$REPO_ROOT/docs/_build}"
DOCS_ROOT="$(cd -- "$REPO_ROOT/docs" && pwd -P)"
DEFAULT_BUILD_ROOT="$DOCS_ROOT/_build"
TEMP_ROOT="$(cd -- /tmp && pwd -P)"

if [[ -n "${BT_PAGES_DIR:-}" ]]; then
  echo "[pages] BT_PAGES_DIR is unsupported; set BT_DOCS_BUILD_DIR instead" >&2
  exit 1
fi
if [[ -z "$BUILD_DIR" || "$BUILD_DIR" != /* ]]; then
  echo "[pages] documentation build root must be an absolute path: ${BUILD_DIR:-<empty>}" >&2
  exit 1
fi
BUILD_PARENT="$(dirname -- "$BUILD_DIR")"
BUILD_NAME="$(basename -- "$BUILD_DIR")"
if [[ ! -d "$BUILD_PARENT" || "$BUILD_NAME" == "." || "$BUILD_NAME" == ".." ]]; then
  echo "[pages] build root parent must be an existing allowed directory: $BUILD_PARENT" >&2
  exit 1
fi
BUILD_PARENT="$(cd -- "$BUILD_PARENT" && pwd -P)"
case "$BUILD_PARENT/$BUILD_NAME" in
  "$DEFAULT_BUILD_ROOT"|"$DEFAULT_BUILD_ROOT"/*|"$TEMP_ROOT"/*) ;;
  *)
    echo "[pages] build root must be under $DEFAULT_BUILD_ROOT or $TEMP_ROOT: $BUILD_DIR" >&2
    exit 1
    ;;
esac
mkdir -p -- "$BUILD_DIR"
BUILD_DIR="$(cd -- "$BUILD_DIR" && pwd -P)"
case "$BUILD_DIR" in
  "$DEFAULT_BUILD_ROOT"|"$DEFAULT_BUILD_ROOT"/*|"$TEMP_ROOT"/*) ;;
  *)
    echo "[pages] build root must be under $DEFAULT_BUILD_ROOT or $TEMP_ROOT: $BUILD_DIR" >&2
    exit 1
    ;;
esac
HTML_DIR="$BUILD_DIR/html"
PAGES_DIR="$BUILD_DIR/pages"

BT_DOCS_BUILD_DIR="$BUILD_DIR" "$SCRIPT_DIR/build_docs.sh"

if [[ "$PAGES_DIR" != "$BUILD_DIR/pages" || "$PAGES_DIR" == "$HTML_DIR" ]]; then
  echo "[pages] unsafe Pages artifact path: $PAGES_DIR" >&2
  exit 1
fi
rm -rf -- "$PAGES_DIR"
mkdir -p -- "$PAGES_DIR"

# GitHub Pages serves paths beginning with '_' only when Jekyll is disabled.
touch "$PAGES_DIR/.nojekyll"

# Required Sphinx runtime assets.
cp -R "$HTML_DIR/_static" "$PAGES_DIR/_static"
if [[ -d "$HTML_DIR/_images" ]]; then
  cp -R "$HTML_DIR/_images" "$PAGES_DIR/_images"
fi

# Required pages and search index. Do not copy build caches/source dumps.
find "$HTML_DIR" -maxdepth 1 -type f \( \
  -name '*.html' -o \
  -name 'searchindex.js' \
\) -exec cp {} "$PAGES_DIR/" \;

if [[ ! -f "$PAGES_DIR/index.html" ]]; then
  echo "[pages] missing index.html in $PAGES_DIR" >&2
  exit 1
fi
if [[ ! -f "$PAGES_DIR/searchindex.js" ]]; then
  echo "[pages] missing searchindex.js in $PAGES_DIR" >&2
  exit 1
fi
if [[ ! -f "$PAGES_DIR/.nojekyll" ]]; then
  echo "[pages] missing .nojekyll in $PAGES_DIR" >&2
  exit 1
fi

cat <<MSG
[pages] built clean GitHub Pages artifact: $PAGES_DIR
[pages] upload/copy this directory contents, not docs/_build/html directly.
[pages] excluded: .doctrees, _sources, .buildinfo, objects.inv
MSG
