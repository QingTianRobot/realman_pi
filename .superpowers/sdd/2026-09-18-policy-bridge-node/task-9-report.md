# Task 9 Report: Mock Policy Service End-to-End Smoke

## Commit

- Pending: `test: add policy_bridge mock-websocket end-to-end smoke`

## Files Changed

- `src/policy_bridge/test/test_integration_mock_ws.py` (4 tests)
  - Drives the **real** downlink chain (InferenceScheduler + WsClient +
    validators + ChunkBuffer + Dispatcher + GripperPublisher) with a mock
    WebSocket transport returning a legal `(16, 7)` chunk. Only the outermost
    DDS publishers and the scheduler executor are swapped for recording /
    determinism; assertions check real message content.

## What Is Verified

- **Mode-gated publish:** `policy + ACTIVE` -> velocity publishes a
  `TwistStamped` with `frame_id = l_base_link` and `linear.x = action * 0.2`
  (twist_scale); gripper publishes `Float32 = 0.8` on the same tick.
- **ROS-clock stamp:** `header.stamp.sec > 1_600_000_000` (real `now()`, not zero).
- **50 Hz period:** `_publish_timer.timer_period_ns ~= 20 ms`.
- **One chunk -> steps_per_inference publishes:** transport cut before draining
  so the rolling-horizon re-trigger cannot refill; exactly 4 steps published,
  buffer drains to 0.
- **Queue-empty stop:** with the buffer empty the loop publishes nothing (never
  a zero command) so the driver watchdog takes over.
- **Inactive stop:** switching to `none` clears the queue and publishes nothing.

## Test Evidence

```text
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTHONPATH=".:$PYTHONPATH" \
  python3 -m pytest test/test_integration_mock_ws.py -q   # 4 passed
python3 -m pytest test/ -q                                 # 85 passed
```

## Concerns / Remaining

- The mock transport is injected; a live `websockets`-backed transport is still
  to be wired for real-service integration.
- DDS loopback (real topic subscribe) is intentionally avoided to keep CI
  deterministic; publishers are recorded at the object boundary.
- No robot motion; the R1 velocity-session gate still applies before real runs.

## Developer Manual (complete)

- `website/docs/development/policy-bridge.md` -- purpose/boundaries, config table
  with units, ROS topics/services, WebSocket contract, watchdog safety, R1-R5
  risk register, health/troubleshooting order, validation commands.
- Added to VitePress sidebar (`config/website/vitepress.config.mts`), the
  developer index table (`website/docs/development/index.md`), and the route list
  in `website/tests/site.spec.ts`.

```text
cd website && npm run build            # build complete; dist/development/policy-bridge.html generated
npx playwright test -g "documentation routes render"   # 2 passed (desktop + mobile)
```
