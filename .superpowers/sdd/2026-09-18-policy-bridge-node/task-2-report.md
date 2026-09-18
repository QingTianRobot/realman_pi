# Task 2 Report: ModeWatcher bound to InputModeState

## Commit

- Pending: `feat: add policy_bridge mode watcher bound to InputModeState`

## Files Changed

- `src/policy_bridge/policy_bridge/mode/mode_watcher.py` (+ `__init__.py`)
  - `resolve_internal_mode(active_mode, phase, mapping, default_when_unknown)`
    pure function: any non-ACTIVE phase collapses to `inactive`; else maps via
    velocity/position/inactive sets; unknown -> `(default, False)`.
  - `ACTIVE_PHASE = 0` (InputModeState.ACTIVE, uint8). `ModeWatcher.update()` is
    the pure test entry; `_on_msg` adapts the subscription callback.
  - Unknown `active_mode` warns once (`_warned_unknown`); transitions fire
    `on_state_change`.
  - The `realman_msgs` import is wrapped so a dev shell without the message
    package logs an error and stays `inactive` (safe) instead of crashing.
- `src/policy_bridge/test/test_mode_watcher.py` (8 tests)

## Test Evidence

```text
python3 -m pytest test/test_mode_watcher.py -q   # 8 passed
```

## Concerns

- Mode literals are owned by `control_router.xml` InputModeGuard; this module
  defines no enum and only maps configured strings.
