# Behavior Tree Runtime Diagnostics Design

## Goal

Expose behavior-tree execution diagnostics in the read-only monitor: preserve
action and service call details, surface ROS action errors such as unknown result
responses, and show cumulative tick outcomes as a success/failure bar chart.
Document the node-authoring and runtime-monitoring contracts as a reusable
project skill.

## Architecture

The executor remains the only tree ticker and the only ROS Action client. After
each tick it atomically writes a versioned runtime snapshot. The snapshot keeps
the existing tree and node fields and adds:

- `tick_stats`: cumulative `RUNNING`, `SUCCESS`, `FAILURE`, and total counts;
- `events`: a bounded list of the most recent 200 diagnostic events;
- event fields for timestamp, severity, source (`ACTION`, `SERVICE`, or
  `ROS_LOG`), interface name, phase, and human-readable detail.

The executor records its own MoveJ Action lifecycle, start/stop service calls,
and relevant ROS log messages. It subscribes to `/rosout` only for diagnostics;
the webpage never connects to ROS directly. Existing snapshot consumers remain
valid when optional fields are absent.

The server continues to serve `/api/runtime` read-only with ETag validation. The
frontend polls the endpoint and renders the existing tree/inspector plus:

- a compact cumulative SUCCESS/FAILURE bar chart with numeric totals;
- a diagnostic event panel that distinguishes Action, Service, and ROS log
  records and highlights errors;
- failure details from the selected node and root snapshot.

The monitor remains read-only and does not add XML editing, Tick, or Run controls.

## Error semantics

Mechanical-arm motion is an ROS 2 Action at `/<arm_id>/execute_motion`. It is
displayed as `ACTION`; only executor control endpoints
`/realman_bt_executor/start` and `/realman_bt_executor/stop` are `SERVICE`.
Action result messages and `rclcpp_action` warnings/errors are retained verbatim
in the event detail, with the node failure reason remaining the primary summary.

## Skill

Add `.agents/skills/developing-realman-behavior-trees/SKILL.md` with focused
references covering node ports and validation, Action/Service boundaries,
failure propagation, runtime snapshots, testing, and production safety. The
skill is project-local and discoverable by normal automatic invocation.

## Verification

- C++ tests cover snapshot schema, tick counters, bounded event retention, and
  JSON escaping.
- Frontend tests cover runtime DTO validation, chart totals, and diagnostic
  rendering.
- Existing behavior-tree, server, shell, Docker, and website build checks remain
  green.
- No real-motion command is sent during verification.
