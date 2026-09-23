# Node Authoring and Motion Safety

## Authoring Workflow

For a new executable BT node, update the complete contract:

1. Add the header/source under `src/behavior/realman_bt/{include/realman_bt,src}/`.
2. Declare typed ports with `providedPorts()`; use snake_case names and include units in names where ambiguity is possible.
3. Register the exact XML tag in `RealmanBtExecutorNode`; XML tags use PascalCase without the C++ `Node` suffix.
4. Add sources, ROS dependencies, installation, and focused tests in `CMakeLists.txt`/`package.xml` as needed.
5. Add or update an authoritative XML tree and its root startup metadata.
6. Add port, registration, XML, failure, dry-run, and lifecycle tests. Update developer documentation for any public contract.

Do not add a tag to XML before registration exists. Conversely, a registered node without a tested XML use site is not a complete public tree contract.

## Port Contract

Declare each public input with a type, safe default, and useful description. Read and validate every value before creating clients, publishers, timers, or goals. Reject malformed or non-finite input; do not clamp it or silently substitute a production fallback.

Use these naming rules:

- identity/reference: `arm_id`, `reference`, `mode`;
- booleans: `dry_run`, `selectable`;
- quantities: suffix units, such as `joint_degrees`, `linear_velocity_mps`, `angular_velocity_radps`, `duration_sec`, `timeout_sec`, `control_period_ms`;
- per-arm values: `l_`, `m_`, `r_`, such as `l_joint_degrees`;
- blackboard remapping: `{snake_case_key}`; keep catalog metadata such as input-mode `mode`, `label`, and `selectable` literal.

Validate bounds independently. Current motion nodes establish these examples:

| Node | Important ports and constraints |
| --- | --- |
| `MoveJ` | `arm_id` is `l/m/r`; six finite `joint_degrees`; velocity `[1,100]`; blend `[0,100]`; positive finite timeout; `dry_run=true` default. |
| `ThreeArmMoveJ` | Six finite joint values for each `l/m/r`; no `arm_id`; common velocity/blend/timeout; all values validated before any client is created. |
| `CartesianVelocityForDuration` | `arm_id`, configured logical `reference`, two finite three-value vectors, and positive duration; speed, acceleration, watchdog, goal timeout, and stop timeout come from the per-arm runtime profile. |

## Stateful Asynchronous Leaf Pattern

A long-running leaf returns `RUNNING` while it owns asynchronous work. Keep initialization idempotent and retain all resources as members: ROS node, client, goal-response future, accepted handle, result future, publisher/timer, deadlines, and explicit state flags.

The normal Action lifecycle is:

1. validate ports and build the complete goal;
2. if dry-run, record validation success and return `SUCCESS` without creating ROS motion resources;
3. create the client and wait non-blockingly for the server;
4. send exactly once and retain the pending goal response;
5. retain an accepted handle and install the result listener;
6. return `SUCCESS` only after both ROS result code and result payload satisfy the node contract;
7. on every failure, preserve the most specific message in `failureReason()` and diagnostics.

Never treat `UNKNOWN`, a missing result payload, a canceled result, or an exception as success. Prefer the Action result's `message`; otherwise retain the ROS result code or exception text.

## Halt and Cancellation Ownership

`onHalted()` is a safety boundary, not just state reset. Apply this order:

1. Stop periodic nonzero command generation.
2. Publish a neutral command when the interface requires it; `CartesianVelocityForDuration` publishes zero velocity.
3. If the goal response is pending, move the client and response future into an executor-owned drain.
4. If an accepted goal is nonterminal, move the client and handle into a drain, including when `async_get_result()` setup failed.
5. Only reset leaf state after ownership was transferred or no work remains.

The drain retains a pending response until rejection or acceptance. For an accepted goal it retries if `async_cancel_goal()` throws, then releases after cancellation submission succeeds. It does not wait for cancel acknowledgement or a terminal Action result. Never cancel a goal whose result is already terminal.

One-shot process exit waits until all MoveJ and Cartesian-velocity drains report empty. This is a software ownership guarantee, not proof of physical stop; the driver watchdog, software stop, and emergency stop remain separate layers.

## One-Shot and Continuous Motion

Use `MoveJ` for one completed joint-space operation through `/<arm>/execute_motion`.

Use `ThreeArmMoveJ` when one stage requires l/m/r goals to be submitted in the same tree tick and the next stage must wait for all three successes. A stateful `Sequence` of `ThreeArmMoveJ` leaves creates stage barriers; three sequential `MoveJ` leaves do not. Concurrent submission is not synchronized physical arrival.

Use the continuous-session pattern for streamed control:

- Action establishes and owns the session;
- Topic refreshes commands while that Action is active;
- watchdog handles stale commands;
- cancel/stop terminates the session;
- timer-based refresh must not depend on BT tick frequency.

`CartesianVelocityForDuration` follows this pattern with `/<arm>/cartesian_velocity` plus `/<arm>/cartesian_velocity/command`. It samples current pose before and after the session and returns success only when configured minimum physical motion is observed; an expected canceled session alone is not proof that the robot moved.

## Input-Mode Nodes

`InputModeGuard` registers literal XML metadata during tree construction. `ActivateInputMode` must occur after the guard and before the input leaf can emit commands. `SelectInputMode` writes the coordinator's current selection each tick.

Long-lived input leaves return `RUNNING`. Their `onHalted()` must stop or transfer owned work and reset once-per-entry state. A placeholder may record a once-per-entry diagnostic, but it must not create a hidden command path.

Pika's `PikaPositionInput` and `PikaVelocityInput` leaves are intentionally ownership/diagnostic markers; `pika_control_router` owns the l/r Action sessions and stream forwarding. Do not duplicate that routing inside the leaf.

## Test Matrix

At minimum, cover:

- valid defaults and every boundary independently;
- malformed, non-finite, short, and long vectors;
- dry-run creates no client, goal, timer, or hardware command;
- unavailable server, send exception, rejection, listener exception, result exception, non-success code, and payload failure;
- timeout before send, pending goal response after timeout, delayed acceptance, cancellation submission retry, and terminal result before cancel;
- halt with a pending response, accepted handle, and missing result future;
- exact diagnostic interface name, phase, severity, and failure detail;
- XML tag registration, port names, blackboard remaps, and startup metadata.

Run focused tests before ROS integration. Use mock/dry-run validation by default; never make a real motion goal part of an ordinary node test.
