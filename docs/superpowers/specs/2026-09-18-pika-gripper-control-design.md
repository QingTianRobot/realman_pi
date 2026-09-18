# Pika Continuous Gripper Control Design

## Goal

Allow the persistent Pika router to continuously control the left and right
Changingtek grippers while preserving the existing Web service contract.

## ROS contract

Pika publishes one normalized opening value per controlled arm:

```text
/pika/l/gripper_percentage  std_msgs/msg/Float32
/pika/r/gripper_percentage  std_msgs/msg/Float32
```

The value is in the inclusive range `0.0..1.0`: `0.0` is fully closed and
`1.0` is fully open. The middle arm has no Pika gripper topic.

The gripper manager adds non-blocking command topics:

```text
/gripper_left/percentage/command   std_msgs/msg/Float32
/gripper_right/percentage/command  std_msgs/msg/Float32
```

The manager validates the range, ensures the configured device is ready,
converts the percentage using the authoritative gripper configuration, and
calls `move_to` without waiting for the long feedback transaction. The
existing `/<name>/percentage` service remains synchronous for Web and manual
one-shot operations.

## Router behavior

`pika_control_router` subscribes only to the l/r Pika gripper topics and
publishes only to the corresponding left/right manager command topics. It
forwards values only while the behavior-tree executor reports
`pikaposition` or `pikavelocity` as `ACTIVE`; all other phases and modes are
ignored. `dry_run=true` suppresses manager command publication.

Pika arm pose/velocity routing and gripper routing share the same mode gate,
but gripper commands are independent of the Cartesian Action session. A mode
change stops accepting new gripper values and does not automatically open,
close, or stop a gripper. Continuous Pika values are forwarded as received;
the manager's non-blocking callback prevents service-style feedback waits from
backing up the stream.

## Safety and compatibility

- Only l/r are controlled; `m` remains untouched.
- The manager command callback rejects non-finite or out-of-range values and
  reports failures through ROS logging without blocking the executor.
- Existing Web `percentage` requests retain their synchronous result and
  feedback behavior.
- No real-hardware motion is part of default validation. Dry-run and mock
  tests must prove routing and bounds before production use.

## Validation

Focused tests cover manager topic validation/conversion and router l/r-only
mode-gated forwarding. Existing gripper, router, Docker build, and Web
documentation builds remain required before deployment.
