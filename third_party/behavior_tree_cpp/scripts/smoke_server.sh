#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BT_BUILD_DIR:-$REPO_ROOT/build}"
HOST="${BT_SERVER_HOST:-127.0.0.1}"
PORT="${BT_SERVER_PORT:-${1:-}}"
SERVER_BIN="${BT_SERVER_BIN:-$BUILD_DIR/bin/bt_server}"
TREE_XML="${BT_SMOKE_TREE:-$REPO_ROOT/examples/trees/patrol.xml}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[smoke] missing required command: $1" >&2
    exit 1
  fi
}

find_plugin() {
  local candidates=(
    "$BUILD_DIR/lib/libbt_nodes.dylib"
    "$BUILD_DIR/lib/libbt_nodes.so"
    "$BUILD_DIR/lib/libbt_nodes.dll"
    "$BUILD_DIR/bin/bt_nodes.dll"
    "$BUILD_DIR/lib/"*bt_nodes*
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

pick_port() {
  python3 - <<'PY'
import socket

sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(sock.getsockname()[1])
sock.close()
PY
}

need_cmd cmake
need_cmd curl
need_cmd python3

if [[ -z "$PORT" ]]; then
  PORT="$(pick_port)"
fi

PLUGIN="${BT_NODES_PLUGIN:-}"
if [[ -z "$PLUGIN" ]]; then
  PLUGIN="$(find_plugin || true)"
fi

if [[ ! -x "$SERVER_BIN" || -z "$PLUGIN" ]]; then
  echo "[smoke] bt_server or bt_nodes plugin missing; building required targets"
  cmake -S "$REPO_ROOT" -B "$BUILD_DIR" \
    -DBT_BUILD_NODES=ON \
    -DBT_BUILD_SERVER=ON \
    -DBT_BUILD_TESTS=ON \
    -DBT_BUILD_EXAMPLES=ON
  cmake --build "$BUILD_DIR" --target bt_server bt_nodes
  PLUGIN="${BT_NODES_PLUGIN:-$(find_plugin || true)}"
fi

if [[ ! -x "$SERVER_BIN" ]]; then
  echo "[smoke] bt_server not found or not executable: $SERVER_BIN" >&2
  exit 1
fi
if [[ -z "$PLUGIN" || ! -f "$PLUGIN" ]]; then
  echo "[smoke] bt_nodes plugin not found under $BUILD_DIR/lib" >&2
  exit 1
fi
if [[ ! -f "$TREE_XML" ]]; then
  echo "[smoke] tree XML not found: $TREE_XML" >&2
  exit 1
fi

TMP_DIR="$(mktemp -d)"
SERVER_LOG="$TMP_DIR/bt_server.log"
TREE_WORKSPACE="${BT_TREE_WORKSPACE:-$TMP_DIR/trees}"
SERVER_PID=""

cleanup() {
  local status=$?
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
  return "$status"
}
trap cleanup EXIT

echo "[smoke] starting bt_server on http://$HOST:$PORT"
mkdir -p "$TREE_WORKSPACE"
cp "$TREE_XML" "$TREE_WORKSPACE/patrol.xml"
BT_TREE_WORKSPACE="$TREE_WORKSPACE" "$SERVER_BIN" "$HOST" "$PORT" "$PLUGIN" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

BASE_URL="http://$HOST:$PORT"
HEALTH_JSON="$TMP_DIR/health.json"

ready=0
for _ in {1..80}; do
  if curl -fsS "$BASE_URL/api/health" -o "$HEALTH_JSON" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo "[smoke] bt_server exited before becoming ready" >&2
    cat "$SERVER_LOG" >&2 || true
    exit 1
  fi
  sleep 0.1
done

if [[ "$ready" != "1" ]]; then
  echo "[smoke] bt_server did not become ready" >&2
  cat "$SERVER_LOG" >&2 || true
  exit 1
fi

python3 - "$HEALTH_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("version"), data
PY
echo "[smoke] health ok"

NODES_JSON="$TMP_DIR/nodes.json"
curl -fsS "$BASE_URL/api/nodes" -o "$NODES_JSON" >/dev/null
python3 - "$NODES_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
names = {item.get("registration_name") for item in data}
assert len(data) == 25, (len(data), data)
assert {"Sequence", "Fallback", "PrintMessage", "FunctionAction", "FunctionCondition"}.issubset(names), names
# 本轮新增的 6 个商用级内置节点也必须被后端枚举到。
assert {"Delay", "WaitUntilElapsed", "BlackboardExists", "ClearBlackboard", "LogEvent", "ScalarThreshold"}.issubset(names), names
PY
echo "[smoke] nodes ok"

NEG_EXPORT_JSON="$TMP_DIR/export_before_load.json"
status="$(curl -sS -o "$NEG_EXPORT_JSON" -w '%{http_code}' "$BASE_URL/api/tree/export")"
if [[ "$status" != "404" ]]; then
  echo "[smoke] expected export-before-load status 404, got $status" >&2
  cat "$NEG_EXPORT_JSON" >&2 || true
  exit 1
fi
python3 - "$NEG_EXPORT_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("xml") == "", data
assert data.get("error"), data
PY

NEG_TICK_JSON="$TMP_DIR/tick_before_load.json"
status="$(curl -sS -X POST -o "$NEG_TICK_JSON" -w '%{http_code}' "$BASE_URL/api/tree/tick")"
if [[ "$status" != "404" ]]; then
  echo "[smoke] expected tick-before-load status 404, got $status" >&2
  cat "$NEG_TICK_JSON" >&2 || true
  exit 1
fi
python3 - "$NEG_TICK_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("status") == "IDLE", data
assert data.get("nodes") == [], data
assert data.get("error"), data
PY

NEG_STRUCTURE_JSON="$TMP_DIR/structure_before_load.json"
status="$(curl -sS -o "$NEG_STRUCTURE_JSON" -w '%{http_code}' "$BASE_URL/api/tree/structure")"
if [[ "$status" != "404" ]]; then
  echo "[smoke] expected structure-before-load status 404, got $status" >&2
  cat "$NEG_STRUCTURE_JSON" >&2 || true
  exit 1
fi
python3 - "$NEG_STRUCTURE_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("nodes") == [], data
assert data.get("error"), data
PY

MISSING_XML_PAYLOAD="$TMP_DIR/missing_xml.json"
printf '{}' >"$MISSING_XML_PAYLOAD"
NEG_LOAD_JSON="$TMP_DIR/load_missing_xml.json"
status="$(curl -sS -H 'Content-Type: application/json' --data-binary "@$MISSING_XML_PAYLOAD" -o "$NEG_LOAD_JSON" -w '%{http_code}' "$BASE_URL/api/tree/load")"
if [[ "$status" != "400" ]]; then
  echo "[smoke] expected load-missing-xml status 400, got $status" >&2
  cat "$NEG_LOAD_JSON" >&2 || true
  exit 1
fi
python3 - "$NEG_LOAD_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is False, data
assert data.get("error"), data
PY

MALFORMED_XML_PAYLOAD="$TMP_DIR/malformed_xml.json"
python3 - "$MALFORMED_XML_PAYLOAD" <<'PY'
import json
import sys

with open(sys.argv[1], "w", encoding="utf-8") as out:
    json.dump({"xml": "<root>"}, out)
PY
NEG_MALFORMED_JSON="$TMP_DIR/load_malformed_xml.json"
status="$(curl -sS -H 'Content-Type: application/json' --data-binary "@$MALFORMED_XML_PAYLOAD" -o "$NEG_MALFORMED_JSON" -w '%{http_code}' "$BASE_URL/api/tree/load")"
if [[ "$status" != "400" ]]; then
  echo "[smoke] expected load-malformed-xml status 400, got $status" >&2
  cat "$NEG_MALFORMED_JSON" >&2 || true
  exit 1
fi
python3 - "$NEG_MALFORMED_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is False, data
assert data.get("error"), data
PY

status="$(curl -sS -X OPTIONS -o /dev/null -w '%{http_code}' "$BASE_URL/api/tree/load")"
if [[ "$status" != "204" ]]; then
  echo "[smoke] expected OPTIONS status 204, got $status" >&2
  exit 1
fi
echo "[smoke] negative API contracts ok"

LOAD_PAYLOAD="$TMP_DIR/load_payload.json"
python3 - "$TREE_XML" "$LOAD_PAYLOAD" <<'PY'
import json
import sys

xml = open(sys.argv[1], encoding="utf-8").read()
with open(sys.argv[2], "w", encoding="utf-8") as out:
    json.dump({"xml": xml}, out, ensure_ascii=False)
PY

VALIDATE_JSON="$TMP_DIR/validate.json"
curl -fsS \
  -H 'Content-Type: application/json' \
  --data-binary "@$LOAD_PAYLOAD" \
  "$BASE_URL/api/tree/validate" \
  -o "$VALIDATE_JSON" >/dev/null
python3 - "$VALIDATE_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("node_count", 0) >= 3, data
PY
echo "[smoke] validate ok"

FORMAT_JSON="$TMP_DIR/format.json"
curl -fsS \
  -H 'Content-Type: application/json' \
  --data-binary "@$LOAD_PAYLOAD" \
  "$BASE_URL/api/tree/format" \
  -o "$FORMAT_JSON" >/dev/null
python3 - "$FORMAT_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("node_count", 0) >= 3, data
xml = data.get("xml", "")
assert "<root" in xml and "<BehaviorTree" in xml, data
PY
echo "[smoke] format ok"

FORMAT_PAYLOAD_2="$TMP_DIR/format_payload_2.json"
FORMAT_JSON_2="$TMP_DIR/format_2.json"
python3 - "$FORMAT_JSON" "$FORMAT_PAYLOAD_2" <<'PY'
import json
import sys

xml = json.load(open(sys.argv[1], encoding="utf-8"))["xml"]
with open(sys.argv[2], "w", encoding="utf-8") as out:
    json.dump({"xml": xml}, out, ensure_ascii=False)
PY
curl -fsS \
  -H 'Content-Type: application/json' \
  --data-binary "@$FORMAT_PAYLOAD_2" \
  "$BASE_URL/api/tree/format" \
  -o "$FORMAT_JSON_2" >/dev/null
python3 - "$FORMAT_JSON" "$FORMAT_JSON_2" <<'PY'
import json
import sys

first = json.load(open(sys.argv[1], encoding="utf-8"))
second = json.load(open(sys.argv[2], encoding="utf-8"))
assert first.get("ok") is True, first
assert second.get("ok") is True, second
assert first.get("xml") == second.get("xml"), (first.get("xml"), second.get("xml"))
PY
echo "[smoke] format idempotency ok"

TREES_JSON="$TMP_DIR/trees.json"
curl -fsS "$BASE_URL/api/trees" -o "$TREES_JSON" >/dev/null
python3 - "$TREES_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
names = {item["name"] for item in data.get("trees", [])}
assert "patrol.xml" in names, data
assert data.get("workspace"), data
PY
echo "[smoke] list trees ok"

OPEN_JSON="$TMP_DIR/open.json"
curl -fsS "$BASE_URL/api/tree/open?name=patrol.xml" -o "$OPEN_JSON" >/dev/null
python3 - "$OPEN_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("name") == "patrol.xml", data
assert "<BehaviorTree" in data.get("xml", ""), data
PY
echo "[smoke] open tree ok"

SAVE_PAYLOAD="$TMP_DIR/save_payload.json"
python3 - "$TREE_XML" "$SAVE_PAYLOAD" <<'PY'
import json
import sys

xml = open(sys.argv[1], encoding="utf-8").read()
with open(sys.argv[2], "w", encoding="utf-8") as out:
    json.dump({"name": "saved_smoke.xml", "xml": xml}, out, ensure_ascii=False)
PY
SAVE_JSON="$TMP_DIR/save.json"
curl -fsS \
  -H 'Content-Type: application/json' \
  --data-binary "@$SAVE_PAYLOAD" \
  "$BASE_URL/api/tree/save" \
  -o "$SAVE_JSON" >/dev/null
python3 - "$SAVE_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("name") == "saved_smoke.xml", data
assert data.get("bytes", 0) > 0, data
PY
test -f "$TREE_WORKSPACE/saved_smoke.xml"
echo "[smoke] save tree ok"

TRAVERSAL_PAYLOAD="$TMP_DIR/traversal_payload.json"
python3 - "$TREE_XML" "$TRAVERSAL_PAYLOAD" <<'PY'
import json
import sys

xml = open(sys.argv[1], encoding="utf-8").read()
with open(sys.argv[2], "w", encoding="utf-8") as out:
    json.dump({"name": "../escape.xml", "xml": xml}, out)
PY
TRAVERSAL_JSON="$TMP_DIR/traversal.json"
status="$(curl -sS -H 'Content-Type: application/json' --data-binary "@$TRAVERSAL_PAYLOAD" -o "$TRAVERSAL_JSON" -w '%{http_code}' "$BASE_URL/api/tree/save")"
if [[ "$status" != "400" ]]; then
  echo "[smoke] expected traversal save status 400, got $status" >&2
  cat "$TRAVERSAL_JSON" >&2 || true
  exit 1
fi
python3 - "$TRAVERSAL_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is False, data
assert data.get("error"), data
PY
echo "[smoke] workspace path guard ok"

LOAD_JSON="$TMP_DIR/load.json"
curl -fsS \
  -H 'Content-Type: application/json' \
  --data-binary "@$LOAD_PAYLOAD" \
  "$BASE_URL/api/tree/load" \
  -o "$LOAD_JSON" >/dev/null
python3 - "$LOAD_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("ok") is True, data
assert data.get("node_count", 0) >= 3, data
PY
echo "[smoke] load ok"

EXPORT_JSON="$TMP_DIR/export.json"
curl -fsS "$BASE_URL/api/tree/export" -o "$EXPORT_JSON" >/dev/null
python3 - "$EXPORT_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
xml = data.get("xml", "")
assert "<root" in xml, data
assert "<BehaviorTree" in xml, data
assert "PatrolTree" in xml or "MainTree" in xml, data
PY
echo "[smoke] export ok"

TICK_JSON="$TMP_DIR/tick.json"
curl -fsS -X POST "$BASE_URL/api/tree/tick" -o "$TICK_JSON" >/dev/null
python3 - "$TICK_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("status") == "SUCCESS", data
assert data.get("nodes"), data
PY
echo "[smoke] tick ok"

RUN_JSON="$TMP_DIR/run.json"
curl -fsS -X POST "$BASE_URL/api/tree/run" -o "$RUN_JSON" >/dev/null
python3 - "$RUN_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("final_status") == "SUCCESS", data
assert isinstance(data.get("transitions"), list), data
assert data["transitions"], data
PY
echo "[smoke] run ok"

STRUCTURE_JSON="$TMP_DIR/structure.json"
curl -fsS "$BASE_URL/api/tree/structure" -o "$STRUCTURE_JSON" >/dev/null
python3 - "$STRUCTURE_JSON" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
nodes = data.get("nodes", [])
assert nodes, data
assert any(node.get("children") for node in nodes), data
PY
echo "[smoke] structure ok"

echo "[smoke] server smoke passed"
