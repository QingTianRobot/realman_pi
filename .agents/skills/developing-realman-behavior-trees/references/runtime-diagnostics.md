# Runtime Diagnostics Contract

## Snapshot Schema

`RuntimeSnapshotWriter` writes atomic JSON through a sibling `.tmp` file and replacement. Schema version `2` includes `tree_id`, `sequence`, `timestamp_ms`, `root_status`, `nodes`, optional root/node `failure_reason`, and `pending_cancellations`, plus:

```json
{
  "tick_stats": {"running": 0, "success": 0, "failure": 0, "total": 0},
  "events": [{
    "timestamp_ms": 0,
    "severity": "INFO",
    "source": "ACTION",
    "interface_name": "/r/execute_motion",
    "phase": "send_goal",
    "detail": "MoveJ goal sent"
  }]
}
```

The four `tick_stats` counters, `pending_cancellations`, and each diagnostic event `timestamp_ms` are non-negative safe integers in the monitor DTO. Top-level snapshot `sequence` and `timestamp_ms` are not validated by this client contract. `severity` is `INFO`, `WARN`, or `ERROR`; `source` is `ACTION`, `SERVICE`, `ROS_LOG`, or `EXECUTOR`; `interface_name`, `phase`, and `detail` are strings. Preserve `detail` verbatim, including ROS log text and Action result messages. Invalid optional diagnostics must be rejected by the client; legacy snapshots without them remain valid.

`RuntimeDiagnostics` is mutex-protected. Record exactly one `RUNNING`, `SUCCESS`, or `FAILURE` outcome for each executor tick, then write the snapshot, including exception ticks. Retain only the newest 200 events, discarding the oldest on overflow. Calls without a recorder still emit v2 fields with zero counters and an empty event array.

## Event Sources

| Source | Interface and phases |
| --- | --- |
| `ACTION` | MoveJ uses `/<arm_id>/execute_motion`: `wait_server`, `send_goal`, `goal_accepted`, `goal_rejected`, `result`, `timeout`, `cancel`. ThreeArmMoveJ records each arm's interface separately; its timeout is retained as a failure reason and in cancellation details rather than a dedicated `timeout` event. `CartesianVelocityForDuration` uses `/<arm_id>/cartesian_velocity` and adds `motion_verification`; its command topic and current-pose reads remain supporting interfaces rather than separate Action events. |
| `SERVICE` | `/realman_bt_executor/start` and `/realman_bt_executor/stop`: `request`, `response`; retain the response text in `detail`. |
| `ROS_LOG` | Filtered WARN/ERROR `/rosout` from logger names containing `realman_bt_executor` or `rclcpp_action`; phase `rosout`. |
| `EXECUTOR` | Executor exceptions use phase `exception`; input-mode selection, activation, and failure transitions use the executor's input-mode state topic as the interface name. Input placeholder leaves use phase `placeholder`. |

Flush snapshots before and after start/stop Service work, after terminal halt, and immediately after accepting a filtered `/rosout` event. A ROS Action warning can arrive after terminal ticking has stopped, so it must not depend on a later tick to become visible. The read-only monitor polls `GET /api/runtime`, uses ETag/`If-None-Match`, accepts `304`, and must provide no mutation route or control.

In one-shot mode the executor spins only until terminal cleanup has completed; events arriving after process shutdown cannot be captured. Halt can reset root/node status to `IDLE` and clear node failure reasons. The wrapper determines the outcome from exactly one terminal tick and retains the event history in `logs/behavior-trees/<run-id>/runtime.json`. `pending_cancellations` counts both MoveJ and Cartesian-velocity drains and must reach zero before normal one-shot exit.

`pika_control_router` uses its own ROS logger. Its messages are not included by the executor's current `/rosout` logger filter unless they are surfaced through an executor-owned event; diagnose Pika forwarding with the router log, executor input-mode state, and per-arm Action graph together. Do not claim the BT runtime snapshot contains every Pika router error.

See [execution and deployment](execution-and-deployment.md) for lifecycle, archive validation, and DDS duplicate-server diagnosis; do not treat an archived `IDLE` as a missing terminal result.

## Diagnostics Tests

Cover JSON escaping, atomic replacement, v2 fields, `pending_cancellations`, zero diagnostics, each tick bucket, one-record-per-tick behavior, 200-event retention, and concurrent recording. Cover Action, Service, ROS log, and executor events, including exact failure detail and Cartesian motion verification. In the TypeScript client, reject invalid counters, timestamps, severities, sources, or event field types while accepting a complete v2 and legacy payload. In the monitor, render events newest-first, retain selected-node failure reason, surface `ERROR` accessibly, and keep the runtime view read-only.
