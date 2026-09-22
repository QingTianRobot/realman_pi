# Task 10 Report: Real OpenPI WebSocket Integration

## Commit

- Pending: `feat: wire policy_bridge to the real OpenPI msgpack websocket protocol`

## Why

Task 6 shipped `WsClient` with a hand-rolled JSON + base64 serialization and a
`request(str) -> str` transport interface, on the assumption of a generic
WebSocket service. The real VLA policy service is an **OpenPI
`WebsocketPolicyServer`**, whose client (`openpi_client.WebsocketClientPolicy`)
speaks **msgpack carrying raw NumPy bytes** and a **dict-level**
`infer(obs: dict) -> dict` interface, sends server metadata on connect, and
listens on port **18000**. The Task 6 contract could never talk to it. This task
corrects the transport so the node can actually connect and infer.

## Files Changed

- `src/policy_bridge/policy_bridge/inference/openpi_client/` (vendored, new)
  - `__init__.py`, `base_policy.py`, `msgpack_numpy.py` (verbatim from
    openpi-client 0.1.0), `websocket_client_policy.py` (adapted: relative
    imports, dropped `typing_extensions.override`, single bounded connect
    attempt instead of `while True: sleep(5)`, `timeout` on `recv`,
    `open_timeout` on connect, `close()`).
- `src/policy_bridge/policy_bridge/inference/ws_client.py`
  - Removed `serialize_observation` (JSON/base64). Transport contract is now
    dict-level `infer(obs) -> dict`. Lazy `_ensure_transport()` builds the real
    `WebsocketClientPolicy(host, port, timeout=infer_timeout_s,
    open_timeout=connect_timeout_s)`; failures drop the transport and surface as
    `PolicyServiceError` (counted by the scheduler). Backoff API unchanged.
- `src/policy_bridge/policy_bridge/policy_bridge_node.py`
  - `destroy_node()` now calls `self._ws.close()`.
- `src/policy_bridge/policy_bridge/tools/mock_policy_server.py` (new) +
  `setup.py` console_script `mock_policy_server`
  - Standalone OpenPI-protocol mock server (msgpack) for link validation on
    `:18000` without a model; logs received obs keys/shapes, returns a
    fixed-shape chunk (`--mode zeros|random`, `--horizon`, `--dim`).
- `config/ros/policy_bridge.yaml` — `server_port` 8766 → 18000; comments note
  the msgpack/OpenPI protocol.
- `config/python/policy-bridge-requirements.txt` (new) — `msgpack>=1.0.5`,
  `websockets>=11.0` (numpy NOT pinned <2; vendored msgpack_numpy round-trips on
  numpy 2.x).
- `config/docker/ros2-humble-rviz.Dockerfile` — pip install the new
  requirements; **add `policy_bridge` to the colcon build/test package lists**
  (it was missing, so `./rm65 up policy` would fail with "package not found"
  because the image never built it).
- `src/policy_bridge/test/test_ws_client.py` — rewritten for the dict contract:
  delegation, error-wrap + transport drop, non-dict guard, autoconnect-off,
  lazy-connect-to-absent-server, msgpack obs/actions round-trip, **real
  localhost WebSocket round-trip** via the vendored client, backoff.
- `src/policy_bridge/test/test_integration_mock_ws.py` — `MockTransport.request`
  → `infer`; "cut transport" now disables autoconnect (no real reconnect).
- `website/docs/development/policy-bridge.md` — WebSocket section rewritten
  (msgpack, not JSON; port 18000; `action_horizon` must match the server),
  mock-server link-test workflow, dev config path fix, validation counts.

## Test Evidence

```text
cd src/policy_bridge
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTHONPATH=".:$PYTHONPATH" python3 -m pytest test/ -q
# 86 passed (was 85; test_ws_client 9 -> 10)

# manual live proof (mock server on :18123, persistent connection, 3 infers):
#   infer 0..2: shape=(16,7) dtype=float32 finite=True
#   server logged obs keys: state (7,), wrist_image (4,4,3), global_image (4,4,3), prompt str

colcon build --packages-select policy_bridge           # 0.48s
ros2 pkg executables policy_bridge                      # mock_policy_server, policy_bridge_node
python3 -c "import policy_bridge.inference.openpi_client.websocket_client_policy"  # OK
```

## Concerns / Remaining

- `action_horizon` (config `16`) must equal the real server's returned row count
  (pi0 commonly 50) or `validators.check` rejects every chunk by shape. Confirm
  against the live service before enabling motion.
- obs image field names remain realman_pi's `wrist_image`/`global_image` per the
  operator's decision; the deployed policy's input transform must accept these
  keys (the OpenPI example used `center_image`/`left_image`).
- The scheduler still relies on `failure_pause_threshold` rather than sleeping
  `wait_backoff()` between reconnect attempts; a down service is bounded by the
  pause latch, not by backoff timing.
- R1–R5 (velocity-session gate, no cartesian state topic, position mode, gripper
  topic→service, watchdog topic) are unchanged and still gate real motion.
