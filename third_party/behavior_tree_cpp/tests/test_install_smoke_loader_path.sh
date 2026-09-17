#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HELPER="$REPO_ROOT/scripts/install_smoke_loader_path.sh"

fail() {
  echo "[install-smoke-loader-test] FAIL: $*" >&2
  exit 1
}

assert_eq() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    fail "$label: expected '$expected', got '$actual'"
  fi
}

if [[ ! -f "$HELPER" ]]; then
  fail "loader helper is missing: $HELPER"
fi

# shellcheck source=../scripts/install_smoke_loader_path.sh
source "$HELPER"

cygpath() {
  [[ "$1" == "-u" ]] || fail "cygpath must be called with -u"
  case "$2" in
    "C:/SDK Runtime/bin") printf '%s\n' "/c/SDK Runtime/bin" ;;
    "D:/BT Core/bin") printf '%s\n' "/d/BT Core/bin" ;;
    *) fail "unexpected cygpath input: $2" ;;
  esac
}

bt_install_smoke_prepare_loader \
  "MSYS_NT-10.0" \
  "/usr/local/bin:/usr/bin" \
  "C:/SDK Runtime/bin" \
  "D:/BT Core/bin"
assert_eq "PATH" "$BT_INSTALL_SMOKE_LOADER_VARIABLE" "MSYS loader variable"
assert_eq \
  "/c/SDK Runtime/bin:/d/BT Core/bin:/usr/local/bin:/usr/bin" \
  "$BT_INSTALL_SMOKE_RUNTIME_PATH" \
  "MSYS normalized PATH"
[[ "$BT_INSTALL_SMOKE_RUNTIME_PATH" != *';'* ]] || \
  fail "MSYS shell-side PATH must not contain semicolon separators"

bt_install_smoke_prepare_loader \
  "Darwin" \
  "/existing/lib" \
  "/opt/BT SDK/lib" \
  "/opt/BT Core/lib"
assert_eq \
  "DYLD_LIBRARY_PATH" \
  "$BT_INSTALL_SMOKE_LOADER_VARIABLE" \
  "macOS loader variable"
assert_eq \
  "/opt/BT SDK/lib:/opt/BT Core/lib:/existing/lib" \
  "$BT_INSTALL_SMOKE_RUNTIME_PATH" \
  "macOS runtime path"

bt_install_smoke_prepare_loader \
  "Linux" \
  "" \
  "/opt/bt/lib" \
  "/opt/bt nodes/lib"
assert_eq \
  "LD_LIBRARY_PATH" \
  "$BT_INSTALL_SMOKE_LOADER_VARIABLE" \
  "Linux loader variable"
assert_eq \
  "/opt/bt/lib:/opt/bt nodes/lib" \
  "$BT_INSTALL_SMOKE_RUNTIME_PATH" \
  "Linux runtime path"

echo "[install-smoke-loader-test] PASS"
