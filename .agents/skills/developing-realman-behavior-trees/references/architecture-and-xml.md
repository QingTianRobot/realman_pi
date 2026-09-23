# Architecture, Tree Design, and XML Contracts

## Layer Ownership

```text
operator/Web/Pika
  -> selection or command ingress
  -> realman_bt executor and XML orchestration
  -> ROS Action/Service/Topic contract
  -> realman_driver motion_coordinator
  -> RealMan SDK and hardware
```

The executor owns tree parsing, tick/halt, blackboard injection, input-mode coordination, diagnostics, snapshots, and cancellation drains. Drivers own SDK sessions, per-arm arbitration, limits, watchdogs, feedback, and controlled stop. Launch/wrapper code owns startup preflight, the single-instance lock, the monitor, process lifetime, and archival.

Do not let a BT leaf call the SDK directly or let Web/Pika bypass the driver Action boundary.

## Registered Node Set Is the Language

`RealmanBtExecutorNode` explicitly registers the only XML tags the runtime understands. At the current revision these are:

- controls: `Sequence`, `ReactiveSequence`, `ReactiveFallback`;
- routing: `SelectInputMode`, `InputModeGuard`, `ActivateInputMode`;
- input leaves: `WebInputStub`, `PolicyInputStub`, `PikaInputStub`, `PikaPositionInput`, `PikaVelocityInput`, `IdleInput`;
- motion: `MoveJ`, `ThreeArmMoveJ`, `CartesianVelocityForDuration`.

Do not use upstream `Fallback`, `Parallel`, `Retry`, `SubTree`, `SetBlackboard`, or task-specific tags merely because examples exist in the repository or upstream library. Implement and register them first. `approach_and_grasp.xml` and `pick_task.xml` are templates, not current production runtime trees.

## Choosing Control Nodes

Use stateful `Sequence` for a finite workflow whose completed children must not rerun while a later child is `RUNNING`. This is why:

- `three.xml` can complete `all_zero` once, then advance to `requested_pose`;
- each Pika entry sequence performs `ThreeArmMoveJ` once, activates the mode, then remains in its streaming input leaf.

Use `ReactiveSequence` when an earlier condition/selection must be reevaluated every tick and must halt later running work as soon as it changes.

Use `ReactiveFallback` for an ordered set of guarded branches whose priority and selection are reevaluated every tick. The input router combines an outer `ReactiveSequence` with an inner `ReactiveFallback` so a new selected mode halts the previous `RUNNING` branch before the replacement leaf controls anything.

## Input Router Invariants

`config/behavior-trees/control.xml` is the authoritative input-mode catalog. Do not create a duplicate enum in Python, C++, ROS parameters, or the browser.

Keep these invariants:

- catalog order: `web`, `policy`, `pikaposition`, `pikavelocity`, `none` unless product behavior deliberately changes;
- `web` is first, sticky/high priority, and `selectable="false"`;
- `none` exists, is selectable, and is the configured safe fallback;
- `InputModeGuard` metadata is literal; only `selected_mode` is remapped;
- ordinary branch order is guard -> activate -> input leaf;
- a Pika branch is guard -> stateful entry `Sequence` -> three-arm entry pose -> activate -> Pika leaf;
- the root remains persistent (`realman_stop_on_terminal="false"`, `realman_exit_on_terminal="false"`).

Changing modes deliberately takes a neutral handoff: select/activate `none` for one tick, then select/activate the requested mode on the next tick. This ensures the reactive parent halts the old branch before the new one emits commands. Re-requesting the active mode does not add a neutral tick or increment the epoch. A failed transition schedules the configured safe fallback.

Pika activation must occur only after the l/m/r entry `ThreeArmMoveJ` succeeds. The entry joint values are loaded once at launch from `config/ros/pika_config.yaml` and injected as `pika_l_joint_degrees`, `pika_m_joint_degrees`, and `pika_r_joint_degrees`; do not copy those values into `control.xml`.

## XML Startup Metadata

Every runnable root-level XML should declare launcher metadata consumed by `tree_metadata.py` and `bt-start`:

```xml
<root main_tree_to_execute="MainTree"
      realman_arm_id="r"
      realman_required_arms="l,m,r"
      realman_required_actions="execute_motion"
      realman_launch="arm_move"
      realman_stop_on_terminal="true"
      realman_exit_on_terminal="true">
```

Rules:

| Attribute | Contract |
| --- | --- |
| `main_tree_to_execute` | Existing `BehaviorTree ID`. |
| `realman_arm_id` | One of `l`, `m`, `r`; default blackboard arm. |
| `realman_required_arms` | Unique comma-separated subset of `l,m,r`; startup preflight scope. |
| `realman_required_actions` | Unique comma-separated `execute_motion` and/or `cartesian_velocity`; defaults to `execute_motion`. |
| `realman_launch` | Allowlisted `arm_move` or `control_router`. |
| `realman_stop_on_terminal` | Literal `true`/`false`. |
| `realman_exit_on_terminal` | Literal `true`/`false`. |

Metadata drives wrapper preflight and lifecycle; node names are not inspected to infer required ROS interfaces. Add an allowed startup action only when `tree_metadata.py`, the container entrypoint, and their tests all understand it.

## Blackboard and Configuration

The executor injects shared dependencies under internal `__realman_bt_*__` keys and public tree values under ordinary snake_case keys. Internal pointer/sink keys are implementation details and must not appear in XML.

Use blackboard remapping for launch-selected values such as `{arm_id}`, `{dry_run}`, and injected Pika entry joints. Keep static safe task constants literal in XML only when they genuinely belong to that tree. Put reusable production configuration, coordinate mappings, profiles, and hardware limits in root `config/ros/`.

For logical coordinate references, XML supplies one `reference` such as `default_tool` or `work/cell`. Launch builds a registry from `realman_coordinates.yaml` so the leaf receives the matching driver type/name and ROS frame together; do not expose three independently configurable fields that can disagree.

## Tree Review Checklist

- Are all tags explicitly registered by this executor?
- Does the chosen control node give the intended retick/halt semantics?
- Can a branch return `RUNNING` indefinitely, and if so, what halts and cleans it?
- Is each stage barrier explicit rather than implied by sequential single-arm leaves?
- Does root metadata list every required arm and Action without overclaiming?
- Are production values sourced from the correct root config file?
- Does dry-run traverse the same validation path without creating motion resources?
- Do XML contract tests assert exact structure, port names, literals, remaps, and metadata?
