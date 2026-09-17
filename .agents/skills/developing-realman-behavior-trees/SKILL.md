---
name: developing-realman-behavior-trees
description: Use when developing or operating RealMan behavior trees, ThreeArmMoveJ staged motion, Action cancellation, one-shot executor/launcher shutdown, runtime snapshots, or repeated-run failures and ROS_DOMAIN_ID conflicts.
---

# Developing RealMan Behavior Trees

Treat `src/behavior/realman_bt/` and `config/behavior-trees/` as a robot-motion boundary. Keep the default path dry-run; do not make a real goal part of ordinary validation.

## Choose the Reference

Read the existing node, executor, XML tree, and focused tests. Register a new node explicitly in `RealmanBtExecutorNode`; update the XML contract when a public node or port changes.

- Read [node authoring](references/node-authoring.md) for ports, failure reasons, Action ownership, Service boundaries, dry-run, and tests.
- Read [node authoring](references/node-authoring.md) before changing the persistent input router, its XML-discovered catalog, or a router input leaf.
- Read [runtime diagnostics](references/runtime-diagnostics.md) when changing snapshots, executor events, `/rosout`, or the read-only monitor DTO.
- Read [execution and deployment](references/execution-and-deployment.md) for `./rm65 bt`, three-arm stage barriers, one-shot exit, archives, repeated execution, or `UNKNOWN`/duplicate Action Server diagnosis.

## Runtime Model

`realman_bt` uses the vendored `third_party/behavior_tree_cpp` factory/parser, with explicit `Sequence`, `MoveJ`, and `ThreeArmMoveJ` registration. Do not assume upstream BehaviorTree.CPP node names or all task-template nodes are registered. XML lives under root `config/behavior-trees/`.

`./rm65 up` owns the long-lived drivers. `./rm65 bt [l|m|r|three]` runs a one-shot executor and read-only monitor inside the existing `realman_bringup_remote` container; it does not create a second driver. A new run reuses the driver's Action Servers, not the previous executor. SDK connections belong to drivers, not BT leaves.

`./rm65 bt control` is the separate persistent global input router. It loads
`config/behavior-trees/control_router.xml`, stays alive with its read-only
monitor until Ctrl-C, and does not make `./rm65 up` start an executor. The XML
literal `InputModeGuard` entries are the catalog consumed by the executor and
Web bridge; do not add a Python, ROS, or browser-side mode enum.

For concurrent three-arm stages, reuse `ThreeArmMoveJ`: submit all three goals in one tick, return success only when all three results succeed, then let `Sequence` advance. This is a completion barrier, not synchronized physical arrival. The reusable zero-then-pose tree is `config/behavior-trees/three_arm_staged_move.xml`.

## Required Boundary

Use an Action for long-running or cancellable robot motion. Use a Service only for a short executor control request. A terminal node result must preserve a useful `failureReason()` before returning `FAILURE`.

While the tree is ticking, retain a pending goal response or accepted Action until rejection or a terminal result. Only after halt transfers it to `MoveJCancellationDrain` may ownership release: retain the pending response until rejection, or the accepted nonterminal handle until `async_cancel_goal()` successfully submits; retry submission exceptions, then release without waiting for a cancel acknowledgement or terminal result. A halt must not discard a pending goal response, an accepted handle, or a failed result-listener setup.

`exit_on_terminal=true` waits for an empty cancellation drain before shutting down the executor. Final archived root/node status may be `IDLE` after halt; use the unique terminal tick and event details. Releasing a leaf client in its destructor does not resolve duplicate Action Servers or replace cancellation ownership.

## Validation Order

1. Run the relevant source, unit, and XML contract tests.
2. Run dry-run first; confirm it only validates and emits diagnostics.
3. Test real motion only with an explicit operator decision, a cleared workspace, low speed, and an accessible emergency stop.

Update the existing Web manual pages `website/docs/development/behavior-tree-motion.md` and `behavior-tree-control.md` for changed contracts; use `document-feature-updates` for verification.
