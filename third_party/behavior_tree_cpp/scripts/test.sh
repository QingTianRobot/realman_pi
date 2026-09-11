#!/usr/bin/env bash
#
# test.sh — BehaviorTree.CPP-X 统一非 ROS 发布验证入口
#
# @author pony
# @date 2026-07-06
# @version v2.2.0
# @last_modified 2026-07-13
# @changelog
#   - v2.2.0 (2026-07-13): 分轮保留 Playwright 报告、trace 与 CI 文档截图证据
#   - v2.1.0 (2026-07-13): 锁定前端依赖，并让 Linux gate 对比临时截图与已提交文档基准
#   - v2.0.1 (2026-07-13): 将默认 sanitizer 构建放入已忽略的主构建目录
#   - v2.0.0 (2026-07-13): 增加 Release 产物解析、sanitizer、live E2E、临时截图与 linkcheck
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BT_BUILD_DIR:-$REPO_ROOT/build}"
BUILD_CONFIG="${BT_BUILD_CONFIG:-Release}"
SANITIZER_BUILD_DIR="${BT_SANITIZER_BUILD_DIR:-$BUILD_DIR/sanitizers}"

TEMP_DIRS=()
cleanup() {
  local path
  for path in "${TEMP_DIRS[@]}"; do
    rm -rf "$path"
  done
}
trap cleanup EXIT

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[test] missing required command: $1" >&2
    exit 1
  fi
}

find_built_file() {
  local base_name="$1"
  shift
  local candidates=(
    "$BUILD_DIR/bin/$BUILD_CONFIG/$base_name"
    "$BUILD_DIR/bin/$BUILD_CONFIG/$base_name.exe"
    "$BUILD_DIR/bin/$base_name"
    "$BUILD_DIR/bin/$base_name.exe"
    "$@"
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

find_plugin() {
  find_built_file bt_nodes.dll \
    "$BUILD_DIR/lib/$BUILD_CONFIG/libbt_nodes.dylib" \
    "$BUILD_DIR/lib/$BUILD_CONFIG/libbt_nodes.so" \
    "$BUILD_DIR/lib/$BUILD_CONFIG/bt_nodes.dll" \
    "$BUILD_DIR/bin/$BUILD_CONFIG/bt_nodes.dll" \
    "$BUILD_DIR/lib/libbt_nodes.dylib" \
    "$BUILD_DIR/lib/libbt_nodes.so" \
    "$BUILD_DIR/lib/bt_nodes.dll" \
    "$BUILD_DIR/bin/bt_nodes.dll"
}

need_cmd cmake
need_cmd ctest
need_cmd npm
need_cmd python3
need_cmd curl
need_cmd cmp

if [[ "${BT_SKIP_E2E:-0}" == "1" ]]; then
  echo "[test] BT_SKIP_E2E=1 is not allowed by the release gate" >&2
  exit 1
fi
if [[ "$BUILD_CONFIG" != "Release" ]]; then
  echo "[test] BT_BUILD_CONFIG must be Release for the release gate: $BUILD_CONFIG" >&2
  exit 1
fi

echo "[test] check shell script syntax"
bash -n \
  "$SCRIPT_DIR/bootstrap.sh" \
  "$SCRIPT_DIR/dev.sh" \
  "$SCRIPT_DIR/smoke_server.sh" \
  "$SCRIPT_DIR/smoke_ros2.sh" \
  "$SCRIPT_DIR/smoke_install.sh" \
  "$SCRIPT_DIR/install_smoke_loader_path.sh" \
  "$REPO_ROOT/tests/test_install_smoke_loader_path.sh" \
  "$SCRIPT_DIR/test.sh" \
  "$SCRIPT_DIR/build_docs.sh" \
  "$SCRIPT_DIR/build_pages.sh"

echo "[test] run install-smoke loader path regression"
bash "$REPO_ROOT/tests/test_install_smoke_loader_path.sh"

echo "[test] configure C++ build"
cmake -S "$REPO_ROOT" -B "$BUILD_DIR" \
  -DCMAKE_BUILD_TYPE="$BUILD_CONFIG" \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=ON \
  -DBT_BUILD_ROS2=OFF \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=ON

echo "[test] build C++ targets"
cmake --build "$BUILD_DIR" --config "$BUILD_CONFIG" --parallel

echo "[test] run C++ unit tests"
ctest --test-dir "$BUILD_DIR" -C "$BUILD_CONFIG" --output-on-failure

echo "[test] configure ASan/UBSan plugin-runtime build"
cmake -S "$REPO_ROOT" -B "$SANITIZER_BUILD_DIR" \
  -DCMAKE_BUILD_TYPE=Debug \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=OFF \
  -DBT_BUILD_ROS2=OFF \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=OFF \
  -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer" \
  -DCMAKE_EXE_LINKER_FLAGS="-fsanitize=address,undefined" \
  -DCMAKE_SHARED_LINKER_FLAGS="-fsanitize=address,undefined" \
  -DCMAKE_MODULE_LINKER_FLAGS="-fsanitize=address,undefined"
cmake --build "$SANITIZER_BUILD_DIR" --config Debug \
  --target test_plugin_runtime --parallel
ctest --test-dir "$SANITIZER_BUILD_DIR" -C Debug \
  -R '^PluginRuntime\.' --output-on-failure

echo "[test] run installed SDK consumer smoke"
BT_INSTALL_SMOKE_ROOT="${TMPDIR:-/tmp}" "$SCRIPT_DIR/smoke_install.sh"

echo "[test] run XML example trees"
PLUGIN="$(find_plugin || true)"
if [[ -z "$PLUGIN" || ! -f "$PLUGIN" ]]; then
  echo "[test] just-built bt_nodes plugin not found under $BUILD_DIR" >&2
  exit 1
fi
EXAMPLE_LOAD_XML="$(find_built_file example_load_xml || true)"
FUNCTION_RECHARGE="$(find_built_file example_function_recharge || true)"
SERVER_BIN="$(find_built_file bt_server || true)"
if [[ -z "$EXAMPLE_LOAD_XML" || -z "$FUNCTION_RECHARGE" || -z "$SERVER_BIN" ]]; then
  echo "[test] just-built release executables are incomplete under $BUILD_DIR" >&2
  exit 1
fi
for tree in \
  "$REPO_ROOT/examples/trees/patrol.xml" \
  "$REPO_ROOT/examples/trees/minimal_sequence_fallback.xml" \
  "$REPO_ROOT/examples/trees/blackboard_data_flow.xml" \
  "$REPO_ROOT/examples/trees/diagnostic_demo.xml" \
  "$REPO_ROOT/examples/trees/subtree_reuse.xml"; do
  "$EXAMPLE_LOAD_XML" "$PLUGIN" "$tree" >/dev/null
done

echo "[test] run FunctionRegistry recharge demo (singleton + factory + fn-ref)"
"$FUNCTION_RECHARGE" >/dev/null

echo "[test] run server API smoke"
BT_BUILD_DIR="$BUILD_DIR" \
BT_SERVER_BIN="$SERVER_BIN" \
BT_NODES_PLUGIN="$PLUGIN" \
  "$SCRIPT_DIR/smoke_server.sh"

echo "[test] check ROS2 launch syntax and XML files"
PYTHON_CACHE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/btx-pycache.XXXXXX")"
TEMP_DIRS+=("$PYTHON_CACHE_DIR")
PYTHONPYCACHEPREFIX="$PYTHON_CACHE_DIR" \
  python3 -m py_compile "$REPO_ROOT/bt_ros2/launch/bt_executor.launch.py"
python3 - "$REPO_ROOT" <<'PY'
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(sys.argv[1])
for rel in [
    "bt_ros2/package.xml",
    "bt_ros2/trees/example.xml",
    "bt_ros2/trees/recharge.xml",
]:
    ET.parse(root / rel)
PY

echo "[test] run frontend checks"
cd "$REPO_ROOT/bt_editor"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm test
npm run build
npm run screenshots:check

echo "[test] run mocked Playwright three consecutive times"
for run in 1 2 3; do
  echo "[test] mocked Playwright run $run/3"
  BT_E2E_REUSE_SERVER=0 \
  BT_PLAYWRIGHT_OUTPUT_DIR="test-results/mocked-$run" \
  BT_PLAYWRIGHT_REPORT_DIR="playwright-report/mocked-$run" \
    npx playwright test --project=chromium
done

echo "[test] run live Playwright against just-built release artifacts"
BT_SERVER_BIN="$SERVER_BIN" \
BT_NODES_PLUGIN="$PLUGIN" \
BT_TREE_WORKSPACE="$REPO_ROOT/examples/trees" \
BT_PLAYWRIGHT_OUTPUT_DIR="test-results/live-backend" \
BT_PLAYWRIGHT_REPORT_DIR="playwright-report/live-backend" \
  npm run test:e2e:live

echo "[test] generate and validate screenshots in a temporary directory"
if [[ -n "${CI:-}" ]]; then
  SCREENSHOT_DIR="$REPO_ROOT/bt_editor/test-results/documentation-screenshots"
  mkdir -p "$SCREENSHOT_DIR"
else
  SCREENSHOT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/btx-screenshots.XXXXXX")"
  TEMP_DIRS+=("$SCREENSHOT_DIR")
fi
BT_UPDATE_SCREENSHOTS=1 \
BT_SCREENSHOT_DIR="$SCREENSHOT_DIR" \
BT_E2E_REUSE_SERVER=0 \
BT_PLAYWRIGHT_OUTPUT_DIR="test-results/docs-screenshots" \
BT_PLAYWRIGHT_REPORT_DIR="playwright-report/docs-screenshots" \
  npx playwright test e2e/docs-screenshots.spec.ts --project=chromium
BT_SCREENSHOT_DIR="$SCREENSHOT_DIR" npm run screenshots:check
if [[ "$(uname -s)" == "Linux" ]]; then
  for screenshot in \
    01_editor_loaded.png \
    02_sample_tree.png \
    03_tick_colored.png \
    04_tick_highlight_fixed.png; do
    cmp "$SCREENSHOT_DIR/$screenshot" \
      "$REPO_ROOT/docs/blog/screenshots/$screenshot"
  done
  echo "[test] generated screenshots match the committed Linux reference images"
else
  echo "[test] skipped exact screenshot comparison outside canonical Linux rendering"
fi

echo "[test] build Sphinx docs"
"$SCRIPT_DIR/build_docs.sh"

if [[ "${BT_RUN_ROS2_SMOKE:-0}" == "1" ]]; then
  echo "[test] run ROS2 colcon/launch/topic smoke"
  "$SCRIPT_DIR/smoke_ros2.sh"
elif command -v colcon >/dev/null 2>&1 && command -v ros2 >/dev/null 2>&1; then
  echo "[test] ROS2 tools detected; set BT_RUN_ROS2_SMOKE=1 to run real colcon/launch/topic smoke."
else
  echo "[test] skipped real ROS2 colcon/launch validation: colcon/ros2 not available on this machine."
fi

echo "[test] all mandatory non-ROS release checks passed"
