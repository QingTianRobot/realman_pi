#!/usr/bin/env bash

# Build the dynamic-loader environment used by smoke_install.sh.
#
# MSYS/Cygwin shells keep PATH as a colon-separated POSIX path and translate it
# for native Windows children. CMake, however, reports imported target paths in
# Windows form. Normalize those directories before composing the shell-side
# PATH so the result never mixes semicolon and colon conventions.
bt_install_smoke_prepare_loader() {
  if (( $# < 2 )); then
    echo "[install-smoke] loader setup requires a platform and existing path" >&2
    return 2
  fi

  local platform="$1"
  local existing_path="$2"
  shift 2

  local path_separator=":"
  local normalize_windows_paths=0
  local runtime_dir

  case "$platform" in
    Darwin)
      BT_INSTALL_SMOKE_LOADER_VARIABLE="DYLD_LIBRARY_PATH"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      BT_INSTALL_SMOKE_LOADER_VARIABLE="PATH"
      normalize_windows_paths=1
      if ! command -v cygpath >/dev/null 2>&1; then
        echo "[install-smoke] cygpath is required on $platform" >&2
        return 1
      fi
      ;;
    *)
      BT_INSTALL_SMOKE_LOADER_VARIABLE="LD_LIBRARY_PATH"
      ;;
  esac

  BT_INSTALL_SMOKE_RUNTIME_PATH=""
  for runtime_dir in "$@"; do
    if (( normalize_windows_paths )); then
      runtime_dir="$(cygpath -u "$runtime_dir")"
    fi

    if [[ -z "$BT_INSTALL_SMOKE_RUNTIME_PATH" ]]; then
      BT_INSTALL_SMOKE_RUNTIME_PATH="$runtime_dir"
    else
      BT_INSTALL_SMOKE_RUNTIME_PATH+="${path_separator}${runtime_dir}"
    fi
  done

  if [[ -n "$existing_path" ]]; then
    if [[ -n "$BT_INSTALL_SMOKE_RUNTIME_PATH" ]]; then
      BT_INSTALL_SMOKE_RUNTIME_PATH+="${path_separator}${existing_path}"
    else
      BT_INSTALL_SMOKE_RUNTIME_PATH="$existing_path"
    fi
  fi
}
