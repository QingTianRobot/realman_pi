---
name: developing-changingtek-grippers
description: Use when adding, reviewing, debugging, deploying, or documenting Changingtek Modbus RTU grippers, gripper_ros2 services/topics, stable serial aliases, or Web control integration in realman_pi.
---

# Developing Changingtek Grippers

Treat the serial bus, Modbus device, ROS manager, and Web bridge as separate health boundaries. A serial port opening successfully does not prove that a slave answers Modbus requests.

## Read First

- Runtime topology: `config/ros/gripper.yaml`.
- Container devices: `config/docker/compose.yaml`.
- Vendor protocol: `src/gripper/gripper_ros2/gripper_ros2/changingtek/rtu_psdk.py`.
- Concurrency and reconnect: `gripper_driver.py` in the same package.
- ROS facade: `gripper_manager_node.py`.
- Browser bridge: `src/driver/realman_web_control/realman_web_control/{protocol.py,web_control_node.py}`.

When comparing a supplied reference SDK, read its RTU implementation, driver, and active configuration completely. Do not treat the legacy `griger.py` compatibility driver as the reference unless the task explicitly names it.

## Required Boundaries

- Create one SDK instance per physical RS-485 port. Serialize address switching and every transaction with the bus lock; independent ports may poll in parallel.
- Keep imports side-effect free. Opening ports, starting threads, enabling, resetting, calibrating, or moving hardware requires an explicit runtime call.
- Preserve `gripper_right`, `gripper_left`, and `gripper_mid` ROS names. Production ports are `/dev/realman/gripper_right`, `/dev/realman/gripper_left`, and `/dev/realman/gripper_mid`; `/dev/ttyUSB*` numbers are unstable implementation details.
- Keep authoritative configuration under root `config/`. Compose maps host aliases into `realman_bringup_remote`; Web control does not access serial devices directly.
- Treat `connect()`/`connect_all()` as “serial file opened.” Treat `/<name>/connected=true` as “background Modbus feedback reads currently succeed.” Compare systems with the same safe read transaction, not their open-port messages.
- Position is a configured device-unit integer. Web `percentage` is `0.0..1.0`, where `0` maps to `close_position` and `1` maps to `open_position`.

## Interface Contract

Each configured name exposes Trigger services `open`, `close`, `reset`, `grasp_check`, and `calibrate`; `enable` uses `std_srvs/SetBool`; `percentage` uses `gripper_ros2_msgs/GripperPercentage`. State topics are `position`, `speed`, `current`, `torque_reached`, `alarm`, and `connected`.

Web control reads the same YAML, sends ROS service requests, and publishes `gripper_list`, `gripper_state`, and `gripper_result` WebSocket events. Validate browser input in `protocol.py`. The current server reports `read_only=false` and enables direct control; any future read-only policy must reject write commands at the Web server boundary rather than relying on the UI.

## Diagnostic Order

1. Resolve host aliases and confirm their `ttyUSB` targets.
2. Confirm all three same-name character devices exist inside `realman_bringup_remote`.
3. Confirm the running node loaded `/opt/rm65_ws/config/ros/gripper.yaml` and exposes the expected graph.
4. Read `/<name>/connected` and feedback. Capture the bus snapshot error or driver log for `false`.
5. Stop competing serial users before running a reference probe. Make one configured slave active and perform the same feedback-register reads; `connect_all()==True` alone is inconclusive.
6. Only after read feedback succeeds, call `enable`; then use a bounded target already validated for that physical gripper.

If the reference probe also reports `No communication with the instrument (no answer)`, investigate slave ID, wiring, power, adapter, and device firmware before changing ROS code.

## Validation

Run focused Python tests under `src/gripper/gripper_ros2/test/` and `src/driver/realman_web_control/test/test_gripper_protocol.py`, then `docker compose config`, the ROS Docker build/tests, and the website build. Production verification proceeds in risk order: device presence, ROS graph, read-only feedback, enable, bounded motion, WebSocket request/result.

Update `website/docs/development/gripper-control.md` whenever topology, parameters, ROS interfaces, Web events, container mapping, or operator diagnostics change.
