# Task 1 Report: Package Skeleton and Config Loader

## Commit

- Pending: `feat: add policy_bridge package skeleton and config loader`

## Files Changed

- `src/policy_bridge/package.xml`, `setup.py`, `setup.cfg`, `resource/policy_bridge`
  - New `ament_python` package with the `policy_bridge_node` console script and a
    `launch/*.launch.py` install glob. Depends on `realman_msgs` (InputModeState).
- `src/policy_bridge/policy_bridge/config_loader.py`
  - Self-contained loader (the shared `realman_config` package does not exist in
    this repo, verified by search). Frozen dataclasses for every config section,
    `${ENV:-default}` expansion, and startup validation.
  - Validation: >=1 enabled image, `state_expected_dim == 7`, `action_dim == 7`,
    `command_namespace` starts with `/`, three mode sets disjoint,
    `smoothing_alpha in (0,1]`, non-empty left/right `frame_ids`,
    `steps_per_inference <= action_horizon`, `backoff.max_s >= initial_s`.
  - Topic existence is intentionally **not** validated (pure publish layer).
- `config/ros/policy_bridge.yaml`
  - Authoritative config with explanatory comments; `arm_names: [l, r]`,
    `${POLICY_WS_HOST:-127.0.0.1}`, velocity-only mode mapping (`policy`),
    `inactive_modes: [web, pika, none]`, 50 Hz downlink, N=5 failure pause.
- `src/policy_bridge/test/test_config_loader.py` (14 tests)

## Test Evidence

```text
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTHONPATH=".:$PYTHONPATH" \
  python3 -m pytest test/test_config_loader.py -q
# 14 passed
```

## Concerns

- `realman_config` from memory is stale/absent; loader is package-local by design.
- `gripper_config` defaults to a container path; a missing file degrades to an
  empty limit map rather than crashing (covered in Task 5).
