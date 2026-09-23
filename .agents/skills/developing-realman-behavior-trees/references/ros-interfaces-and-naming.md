# ROS Interfaces and Naming Conventions

## Choose the Interface by Semantics

| Need | Interface | RealMan examples |
| --- | --- | --- |
| Long-running, cancellable operation with feedback/result | Action | `/<arm>/execute_motion`, `/<arm>/cartesian_velocity`, `/<arm>/cartesian_pose` |
| Short, bounded request/response | Service | `/realman_bt_executor/select_input_mode`, `/<arm>/get_current_pose`, `/realman_bt_executor/stop` |
| State or command stream where messages have no individual completion | Topic | `/realman_bt_executor/input_mode_state`, `/<arm>/cartesian_velocity/command`, `/pika/l/cartesian_pose` |

Continuous Cartesian control is deliberately two-stage: an Action establishes ownership and result/cancel semantics; a command Topic refreshes targets inside that session. Never replace the session Action with a bare command Topic.

## General Naming Rules

| Surface | Form | Example |
| --- | --- | --- |
| C++ type | PascalCase plus role suffix | `MoveJNode`, `InputModeCoordinator` |
| C++ file | snake_case plus role | `move_j_node.cpp`, `input_mode_nodes.hpp` |
| XML node tag | PascalCase, omit `Node` | `ThreeArmMoveJ` |
| XML node instance | descriptive snake_case | `pika_default_pose`, `requested_pose` |
| BT port/blackboard key | snake_case; include unit suffix | `timeout_sec`, `linear_velocity_mps` |
| ROS node | snake_case | `realman_bt_executor`, `pika_control_router` |
| ROS interface file/type | PascalCase | `SelectInputMode.srv`, `CartesianVelocity.action` |
| ROS graph name | lowercase snake_case path segments | `/realman_bt_executor/input_mode_state` |
| YAML key | snake_case | `pika_default_pose`, `safe_fallback_mode` |
| Input-mode ID | lowercase ASCII letters/digits only | `pikaposition`, `pikavelocity` |

Input-mode IDs are protocol identifiers, not ROS graph names: they cannot contain `_`, `/`, `-`, spaces, or uppercase letters. A user-facing label may be localized, such as `Pika / 位置控制`.

## Namespace Ownership

- `/<arm>/...` (`arm` is `l`, `m`, or `r`) belongs to a driver instance and exposes that arm's Actions, Services, feedback, and continuous command Topics.
- `/realman_bt_executor/...` belongs to the single active behavior-tree executor. Private `~/...` names in executor code resolve to this namespace.
- `/pika/<arm>/...` is external Pika command ingress. It is not a driver API and not a behavior-tree node namespace.
- `/gripper_<side>/...` belongs to the gripper manager; the Pika router maps arm IDs to `gripper_left`/`gripper_right` explicitly.

Do not prepend `pika` to driver Actions. Pika input `/pika/l/cartesian_velocity` is routed into a session on `/l/cartesian_velocity`, with commands forwarded to `/l/cartesian_velocity/command`.

## Pika Contract

The word `pika` has different valid forms by layer:

| Layer | Required form |
| --- | --- |
| Mode IDs | `pikaposition`, `pikavelocity` |
| Display labels | `Pika / 位置控制`, `Pika / 速度控制` |
| ROS node | `pika_control_router` |
| External ingress namespace | `/pika/l/...`, `/pika/r/...` |
| Config root | `pika_default_pose` |
| Executor parameters/blackboard | `pika_l_joint_degrees`, `pika_m_joint_degrees`, `pika_r_joint_degrees` |
| XML instance/sequence names | `pika_default_pose`, `pika_position_entry`, `pika_velocity_entry` |
| C++ BT tags/types | `PikaPositionInput`, `PikaVelocityInput`; `PikaPositionInputNode`, `PikaVelocityInputNode` |

Current Pika ingress is l/r only:

| Topic | Type | Meaning |
| --- | --- | --- |
| `/pika/l|r/cartesian_pose` | `geometry_msgs/msg/PoseStamped` | Absolute base-frame position session input. |
| `/pika/l|r/cartesian_velocity` | `geometry_msgs/msg/TwistStamped` | Cartesian velocity session input. |
| `/pika/l|r/gripper_percentage` | `std_msgs/msg/Float32` | Normalized opening `[0,1]`; `0` closed, `1` open. |

The middle arm has no Pika streaming or gripper ingress. It participates only in the three-arm Pika entry pose so the cell reaches a known starting arrangement.

The router forwards active modes as follows:

| Pika ingress | Driver/manager target |
| --- | --- |
| pose | `/<arm>/cartesian_pose` Action + `/<arm>/cartesian_pose/command` Topic |
| velocity | `/<arm>/cartesian_velocity` Action + `/<arm>/cartesian_velocity/command` Topic |
| gripper percentage | `/gripper_left|right/percentage/command` Topic |

Forward only while executor state is phase `ACTIVE` with the matching mode. `SWITCHING`, `FAILED`, `none`, `web`, and `policy` suppress Pika forwarding and cancel live Pika arm sessions. `dry_run=true` suppresses both arm sessions and gripper command publication.

## Executor Input-Mode Interfaces

These graph names and types are stable public contracts:

- `/realman_bt_executor/list_input_modes` — `realman_msgs/srv/ListInputModes`; returns parallel `mode_ids`, `labels`, and `selectable` arrays in XML declaration order.
- `/realman_bt_executor/select_input_mode` — `realman_msgs/srv/SelectInputMode`; request has `mode_id` and nonempty correlation field `requester_id`; response has `accepted`, `request_id`, `message`.
- `/realman_bt_executor/input_mode_state` — `realman_msgs/msg/InputModeState`; reliable transient-local state with requested/selected/active mode, `ACTIVE|SWITCHING|FAILED`, request ID, epoch, and detail.

`requester_id` is correlation metadata, not authentication. Browser-selectable policy comes from the XML `selectable` field; the ROS service itself accepts any registered mode, including internal `web`.

## Action and Result Rules

For per-arm interfaces, construct the name from a validated arm ID: `"/" + arm_id + "/<action>"`. Do not accept arbitrary namespace text through a port.

An Action result succeeds only when both layers agree:

- `rclcpp_action::ResultCode::SUCCEEDED`;
- result payload exists and `success == true`;
- any node-specific terminal state or observed-motion condition is also satisfied.

Record diagnostics against the actual resolved graph name. Use consistent phases such as `wait_server`, `send_goal`, `goal_accepted`, `goal_rejected`, `result`, `timeout`, and `cancel`.

## QoS and Streaming

- State needed by late joiners, such as `input_mode_state`, uses reliable transient-local QoS.
- High-rate continuous command topics use small volatile queues; Cartesian velocity commands use `KEEP_LAST=1` and a lifespan aligned with the watchdog.
- Publish fresh ROS timestamps on forwarded/generated stamped commands.
- A watchdog is mandatory for continuous motion. Stale input must converge to driver-level stop/failure, not indefinite reuse of the last nonzero command.

## Interface Change Checklist

- Is the semantic choice Action vs Service vs Topic correct?
- Is namespace ownership clear, with no duplicated `pika` or arm prefix?
- Are mode IDs distinct from ROS/YAML snake_case naming?
- Do quantity names expose units?
- Are interface definitions in `realman_msgs` and consumers updated together?
- Are QoS, watchdog, result, cancellation, and dry-run semantics tested?
- Are XML, launch, root config, Web bridge, and developer manual synchronized?
