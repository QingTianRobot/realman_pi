# Task 7 Report: Node Assembly, Lifecycle Services, and Stats

## Commit

- Pending: `feat: assemble policy_bridge node with lifecycle services and stats`

## Files Changed

- `src/policy_bridge/policy_bridge/policy_bridge_node.py`
  - `PolicyBridgeNode(rclpy.Node)` declares `config_file` and `active_side`
    (phase-1 single-arm stream), loads config, and assembles every subsystem.
  - Fixed-rate `_publish_loop` (1/`publish_rate_hz`): triggers rolling-horizon
    inference only while `allow_publish` and mode != inactive; pops one step;
    splits `action[0:6]` -> Dispatcher, `action[6]` -> GripperPublisher with a
    ROS-clock `now()` stamp. Inactive / queue-empty / deactivated publishes
    nothing (driver 100 ms watchdog takes over).
  - `_on_mode_change` and `_on_prompt_change` clear the queue; buffer mutations
    are lock-guarded against the scheduler thread.
  - Lifecycle: `activate()` (clear + reset failure latch + resume + allow),
    `deactivate()`, `emergency_stop()` (clear + stop), `force_infer()`.
  - `main()` spins a `MultiThreadedExecutor`.
- `src/policy_bridge/policy_bridge/lifecycle/services.py` (+ `__init__.py`)
  - Registers 5 services from `LifecycleConfig` (activate/deactivate SetBool,
    emergency_stop/force_infer Trigger, set_prompt SetBool placeholder). Handlers
    are injected callbacks; exceptions are surfaced as `success=False`.
- `src/policy_bridge/policy_bridge/stats.py`
  - `Stats`: counters (`bump`) + live gauges (`gauge`), timer-republished as a
    `DiagnosticArray` to `/policy/stats`; level ERROR when paused.
- `src/policy_bridge/test/test_node_smoke.py` (11 tests)

## Test Evidence

```text
python3 -m pytest test/test_node_smoke.py -q   # 11 passed
# full suite: 81 passed; python -m compileall policy_bridge OK
```

## Concerns

- Smoke tests construct the real node under rclpy with the authoritative config
  and swap dispatcher/gripper/scheduler for recording fakes; no policy service or
  robot is contacted, and no motion is produced.
- Phase-1 drives a single `active_side`; bimanual independent streams are a
  documented phase-2 extension.
