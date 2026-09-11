# SDK And ROS2 Foundation Checkpoint

## Accepted state

- `sdk-plugin-runtime` is Master-accepted in `.codex/spec-dag.json`.
- FunctionRegistry has one shared-library implementation across the host/plugin boundary.
- Plugin registration is transactional and loaded libraries remain alive for created trees.
- The installed `bt::nodes` package is consumable by an external same-toolchain project.
- ROS2 Task 1 (QoS and topic/type-addressed weak mock endpoints) and Task 2
  (`ReadBattery` waits for fresh data without rewriting stale values) are complete.

The authoritative designs and detailed task steps remain in:

- `docs/superpowers/specs/2026-07-10-commercial-sdk-recharge-design.md`
- `docs/superpowers/plans/2026-07-10-sdk-runtime-hardening.md`
- `docs/superpowers/plans/2026-07-10-ros2-stateful-recharge.md`

## Fresh Lead evidence

```text
BT_INSTALL_SMOKE_ROOT=/tmp ./scripts/smoke_install.sh
  [install-consumer] SUCCESS
  [install-smoke] result: SUCCESS

ctest --test-dir build -R 'PluginRuntime|FunctionRegistry' --output-on-failure
  12/12 passed

ctest --test-dir build --output-on-failure
  134/134 passed

./build/bin/test_ros_bases
  35/35 passed

git diff --check
  passed

node ~/.codex/scripts/spec-dag-check.mjs .codex/spec-dag.json
  OK; sdk-plugin-runtime [x], ros2-stateful-recharge in_progress
```

The install smoke needs `BT_INSTALL_SMOKE_ROOT=/tmp` in this managed sandbox
because `.codex/` is read-only. Its default remains valid in a normal writable
checkout.

## Deliberately excluded work

The checkpoint does not accept or stage the release README/Sphinx pages,
screenshots, `PROJECT_PLAN.md`, `scripts/smoke_ros2.sh`, or the ROS2-specific
parts of `scripts/test.sh`. Those files stay dirty for their corresponding DAG
nodes. Jazzy is not installed and must remain reported as unverified.

## Resume point

Continue `ros2-stateful-recharge` at Task 3 in the ROS2 plan. Implement
`RechargeTask` test-first with exactly seven ports, publish-once behavior,
dock-before-timeout precedence, terminal latching, halt/retry reset, stale dock
reset, and persistent ROS interfaces. Run separate specification and quality
reviews before Task 4 registration/XML work.

## Suggested skills

- `unattended-goal-runner` for checkpointed execution and recovery.
- `tdd` for the Task 3 RED/GREEN state-machine slice.
- `verification-loop` for each Master acceptance gate.
- `review` for the independent post-implementation quality pass.
