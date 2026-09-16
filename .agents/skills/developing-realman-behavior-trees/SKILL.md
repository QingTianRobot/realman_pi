---
name: developing-realman-behavior-trees
description: Use when adding, reviewing, or debugging RealMan behavior-tree nodes, ports, Action or Service integration, cancellation behavior, or runtime monitor diagnostics.
---

# Developing RealMan Behavior Trees

Treat `src/behavior/realman_bt/` and `config/behavior-trees/` as a robot-motion boundary. Keep the default path dry-run; do not make a real goal part of ordinary validation.

## Before Editing

Read the existing node, executor, XML tree, and focused tests. Register a new node explicitly in `RealmanBtExecutorNode`; update the XML contract when a public node or port changes.

- Read [node authoring](references/node-authoring.md) for ports, failure reasons, Action ownership, Service boundaries, dry-run, and tests.
- Read [runtime diagnostics](references/runtime-diagnostics.md) when changing snapshots, executor events, `/rosout`, or the read-only monitor DTO.

## Required Boundary

Use an Action for long-running or cancellable robot motion. Use a Service only for a short executor control request. A terminal node result must preserve a useful `failureReason()` before returning `FAILURE`.

Treat an accepted Action as owned until a terminal result has been observed or executor-owned cancellation draining has completed. A halt must not discard a pending goal response, an accepted handle, or a failed result-listener setup.

## Validation Order

1. Run the relevant source, unit, and XML contract tests.
2. Run dry-run first; confirm it only validates and emits diagnostics.
3. Test real motion only with an explicit operator decision, a cleared workspace, low speed, and an accessible emergency stop.
