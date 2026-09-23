# Task 6 Report: WebSocket Client and Rolling-Horizon Scheduler

## Commit

- Pending: `feat: add policy_bridge websocket client and rolling-horizon scheduler`

## Files Changed

- `src/policy_bridge/policy_bridge/inference/ws_client.py`
  - `serialize_observation()` fixes the wire contract: `state` -> float list,
    `prompt` -> str, each image -> `{shape, dtype, b64}` (base64 of C-order raw
    bytes). `WsClient.infer()` sends one request, decodes JSON, wraps transport
    and parse failures in `PolicyServiceError`, and resets backoff on success.
    Injectable `transport` keeps the scheduler testable without a network.
    Exponential backoff via `_next_backoff()` capped at `max_s`.
- `src/policy_bridge/policy_bridge/inference/scheduler.py`
  - `InferenceScheduler`: `should_trigger(remaining, force)` (force / empty /
    `remaining <= inference_lead_steps`); `maybe_trigger()` re-entrancy guard via
    `_inflight` + lock and pause latch; `_run()` builds obs (None -> skip, not a
    failure), infers, validates via `validators.check`, and on success calls
    `on_chunk(validated[:steps_per_inference])` and resets the failure counter.
  - `_register_failure()` pauses after `failure_pause_threshold` consecutive
    failures (recovery via `resume()`, called by activate). Runs on an injectable
    executor (`_InlineExecutor` for deterministic tests, else `ThreadPoolExecutor`).
  - The WS callback thread never publishes; the node consumes chunks from the
    publish timer thread.
- `src/policy_bridge/test/test_scheduler.py` (11), `test_ws_client.py` (9)

## Test Evidence

```text
python3 -m pytest test/test_scheduler.py test/test_ws_client.py -q   # 20 passed
# full suite: 81 passed
```

## Concerns

- Simplified the executor selection to `if executor is None: ThreadPoolExecutor`
  to remove a confusing redundant ternary.
- A real `websockets`-backed transport is not wired yet; `infer()` runs against
  the injected transport. Live transport belongs to phase-1 integration.
