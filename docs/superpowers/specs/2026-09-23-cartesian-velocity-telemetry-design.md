# Cartesian Velocity Telemetry Design

## Purpose

Expose both the Cartesian velocity command selected for an arm and the measured
end-effector velocity so ROS consumers and the Web control console can tell a
requested command from the robot's observed motion.

## Scope

The first implementation covers the existing `l` and `r` arms and all velocity
sources that already use the Cartesian velocity session: Web, keyboard and
Pika. It does not change velocity limits, input-mode ownership, gripper
behavior, or motion arbitration.

## ROS Contract

`realman_msgs/msg/CartesianVelocityState.msg` is the single telemetry contract.
Each driver namespace publishes it on:

```text
/<arm>/cartesian_velocity/state
```

The message contains:

- the active session and reference (`reference_type`, `reference_name`);
- the latest accepted command vector;
- the vector after speed and acceleration limiting, which is the value sent to
  the SDK;
- command and measured frame IDs;
- measured linear and angular end-effector velocity;
- command age, measured age, and a `measured_valid` flag.

Command vectors retain the active WORK frame (`l/work/cell` for keyboard and
`l|r/work/pikabase` for Pika). Measured velocity is expressed in the arm's
`l|r/base_link` frame. The frames are kept explicit instead of silently
rotating or translating one vector into the other.

The driver publishes telemetry with volatile, keep-last QoS. The command state
is updated by the Cartesian velocity session; measured state is sampled at the
existing driver state publication rate. No command echo is accepted as
measured data.

## Measurement Source

The first implementation reads the controller's current joint state, computes
the current base-frame pose with the existing SDK FK boundary, and estimates a
twist from consecutive pose samples. A missing, invalid, or stale pair of
samples sets `measured_valid=false`; it never publishes a fake zero as a valid
measurement. The message and Web UI identify the data age and frame.

The design leaves the state publisher boundary replaceable with the RealMan
UDP real-time state callback in a later change. That upgrade must preserve the
same ROS message and frame contract.

## Web Control

`realman_web_control` subscribes to each arm's state topic and forwards a
`cartesian_velocity_state` WebSocket event. The control page adds a compact
feedback section for both keyboard arms showing:

- command (limited) linear and angular vectors;
- measured linear and angular vectors;
- linear/angular magnitudes;
- command frame, measured frame, validity and sample age.

When no session is active, command values are shown as inactive. When measured
data is invalid or too old, the UI shows `STALE/NO DATA` rather than zero.

## Safety and Failure Handling

- Telemetry is read-only and never owns an arm or sends an SDK command.
- Driver shutdown and velocity cancellation publish a final inactive command
  state while preserving the measured validity semantics.
- A failed FK/state read is logged through the ROS logger and marks measured
  data invalid for that sample.
- No behavior-tree branch or watchdog behavior changes.

## Validation

Focused tests will cover:

1. message/interface section contract;
2. pose-difference linear and angular velocity math, invalid samples, and age;
3. driver topic wiring and command-vs-limited values;
4. Web ROS-to-WebSocket serialization and stale display state;
5. browser rendering of the dual-arm feedback panel.

The completion gate is a passing focused suite, full relevant `colcon test`,
`npm run build` for the Web manual, and a read-only ROS graph check confirming
the two state topics for `l` and `r`.
