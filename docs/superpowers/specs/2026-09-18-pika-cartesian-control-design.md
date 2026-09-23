# Pika Cartesian Control Design

## Goal

Allow the persistent behavior-tree input router to select Pika Cartesian position or velocity control for the left and right arms, while keeping the middle arm inactive and preserving the driver's ownership, watchdog, and stop boundaries.

## ROS contract

Pika publishes:

```text
/pika/l/cartesian_pose       geometry_msgs/msg/PoseStamped
/pika/r/cartesian_pose       geometry_msgs/msg/PoseStamped
/pika/l/cartesian_velocity   geometry_msgs/msg/TwistStamped
/pika/r/cartesian_velocity   geometry_msgs/msg/TwistStamped
```

Pose commands are absolute base-frame targets with metre positions and quaternions. The router republishes accepted messages to the per-arm driver command topics after the corresponding continuous-control Action is active.

The driver exposes:

```text
/<arm>/cartesian_pose                 realman_msgs/action/CartesianPose
/<arm>/cartesian_pose/command         geometry_msgs/msg/PoseStamped
```

The position session uses `rm_movep_canfd` on a fixed configured period. It validates the active base frame, timestamp freshness, finite normalized quaternions, bounded pose deltas, and watchdog expiry. On cancellation, stale input, stop, disconnect, or shutdown it releases the same `ArmOwnership` used by ordinary and velocity motion.

## Router modes

`config/behavior-trees/control_router.xml` is authoritative for selectable labels and declares `pikaposition` and `pikavelocity`. The Web bridge continues to discover the catalog dynamically. A companion Pika router node subscribes to the executor's transient-local `input_mode_state`; it starts or cancels l/r sessions and forwards only the topic matching the active mode. It never creates a session for m.

Mode changes pass through the existing `none` neutral tick. Any non-active or switching state cancels Pika sessions and suppresses forwarding until the target mode is active.

## Safety and compatibility

- Existing Web direct control and velocity Action contracts remain unchanged.
- Position defaults reuse the configured velocity period/watchdog and linear/angular limits; all values remain under `config/ros/realman_motion.yaml`.
- Default validation is mock/dry-run. Real hardware testing requires explicit low-speed approval and an accessible emergency stop.
- ROS logs use official `RCLCPP_*`/`get_logger()` APIs and the existing timestamped log directories.

## Verification

Unit tests cover pose validation, watchdog/cancel ownership, SDK adapter conversion, mode XML/catalog, and router forwarding. Source tests and mock launch checks verify that only l/r receive Pika traffic and m remains untouched. Web documentation records the topics, Action lifecycle, mode labels, limits, and deployment commands.
