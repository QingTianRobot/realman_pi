---
name: developing-realman-behavior-trees
description: Use when designing, implementing, reviewing, testing, launching, or diagnosing RealMan behavior trees, behavior-tree XML, custom BT nodes and ports, input-mode routing, Pika control interfaces, cancellable robot motion, runtime snapshots, or repeated-run ROS 2 failures.
---

# Developing RealMan Behavior Trees

Treat `src/behavior/realman_bt/` and `config/behavior-trees/` as a robot-motion and control-ownership boundary. Derive contracts from the executor registration, XML, ROS interfaces, launch files, and focused tests together. Default validation stays dry-run; real motion always requires an explicit operator decision.

## Read the Relevant Reference

- Read [architecture and XML](references/architecture-and-xml.md) before designing a tree, choosing control nodes, adding root startup metadata, or changing the persistent input router.
- Read [node authoring](references/node-authoring.md) before implementing or reviewing a C++ leaf, port, asynchronous Action lifecycle, continuous command session, failure path, or cancellation drain.
- Read [ROS interfaces and naming](references/ros-interfaces-and-naming.md) before adding an Action, Service, Topic, parameter, blackboard key, input-mode ID, or any Pika-facing interface.
- Read [runtime diagnostics](references/runtime-diagnostics.md) when changing snapshots, executor events, `/rosout`, failure reasons, or the read-only monitor DTO.
- Read [execution and deployment](references/execution-and-deployment.md) for `./rm65 bt`, XML-name launching, startup preflight, one-shot exit, archives, repeated execution, or `UNKNOWN`/duplicate Action Server diagnosis.

## Non-Negotiable Design Boundaries

1. The BT orchestrates; drivers own SDK connections, motion arbitration, watchdogs, and physical stop behavior. A BT leaf never opens a RealMan SDK connection.
2. Use a ROS Action for long-running, cancellable, or session-owning robot work. Use a Service only for a short request/response operation. Use a Topic for a stream or observation whose individual messages are not independently completed operations.
3. Every custom node must be registered explicitly in `RealmanBtExecutorNode`. Only registered control and leaf tags may appear in an executable XML tree; do not assume upstream BehaviorTree.CPP nodes exist.
4. Validate every port before creating a ROS client or publisher. Preserve a useful `failureReason()` before returning `FAILURE`.
5. A halt must not abandon a pending goal response, accepted nonterminal goal, live command timer, or failed result-listener setup. Stop command publication first, publish the interface-specific neutral command when required, then transfer cancellation ownership to the executor drain.
6. `dry_run=true` validates configuration and emits diagnostics but creates no motion Action client, sends no goal, and publishes no hardware command. Keep it the default.
7. XML under root `config/behavior-trees/` is the authoritative tree source. Runtime configuration belongs under root `config/ros/`; do not duplicate production values in XML, Python, the Web client, or C++ constants.

## Current Runtime Shape

The executor currently registers `Sequence`, `ReactiveSequence`, `ReactiveFallback`, input-mode nodes, `MoveJ`, `ThreeArmMoveJ`, and `CartesianVelocityForDuration`. The production trees are:

| XML | Purpose | Lifecycle |
| --- | --- | --- |
| `move.xml` | One arm `MoveJ` | One-shot |
| `three.xml` | Two staged, concurrent three-arm barriers | One-shot |
| `tool_x.xml` | Timed Cartesian velocity in a configured logical frame | One-shot |
| `control.xml` | Global Web/Policy/Pika/None input router | Persistent |

`approach_and_grasp.xml` and `pick_task.xml` contain task-template tags that the current executor does not register. Do not present them as runnable production trees unless all referenced nodes and controls are implemented, registered, and tested.

`./rm65 up` owns long-lived drivers and Web control. `./rm65 bt <name>` starts a separate executor and read-only monitor inside the existing driver container, using a simple filename from `config/behavior-trees/`; `.xml` is optional. It never creates a second driver.

## Required Validation Order

1. Run focused unit and XML/metadata contract tests.
2. Run the relevant mock or isolated BT suite.
3. Run `RM65_DRY_RUN=1 ./rm65 bt <tree>` to inspect the wrapper plan when launch behavior changed.
4. Run the real executor with `REALMAN_BT_DRY_RUN=true` and confirm no goal or hardware command is emitted.
5. Perform real motion only after explicit authorization, target review, a cleared workspace, low speed, and an accessible emergency stop.

When behavior, ROS interfaces, configuration, commands, or operator-visible failure modes change, update `website/docs/development/behavior-tree-motion.md`, `behavior-tree-control.md`, and any owning interface page, then build the Web manual.
