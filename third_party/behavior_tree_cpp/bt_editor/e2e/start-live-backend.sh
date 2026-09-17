#!/usr/bin/env bash
#
# start-live-backend.sh — 为 Playwright 启动真实 bt_server
#
# @author lovelyyoshino
# @date 2026-07-13
# @version v1.0.0
# @last_modified 2026-07-13
# @changelog
#   - v1.0.0 (2026-07-13): 初始实现，要求调用方显式提供二进制与插件路径
#
set -euo pipefail

: "${BT_SERVER_BIN:?BT_SERVER_BIN must point to the built bt_server executable}"
: "${BT_NODES_PLUGIN:?BT_NODES_PLUGIN must point to the built bt_nodes plugin}"

if [[ ! -x "$BT_SERVER_BIN" ]]; then
  echo "[live-e2e] bt_server is not executable: $BT_SERVER_BIN" >&2
  exit 1
fi
if [[ ! -f "$BT_NODES_PLUGIN" ]]; then
  echo "[live-e2e] bt_nodes plugin is missing: $BT_NODES_PLUGIN" >&2
  exit 1
fi

export BT_TREE_WORKSPACE="${BT_TREE_WORKSPACE:-../examples/trees}"
exec "$BT_SERVER_BIN" 127.0.0.1 18080 "$BT_NODES_PLUGIN"
