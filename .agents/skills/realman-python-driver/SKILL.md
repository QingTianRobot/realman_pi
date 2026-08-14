---
name: realman-python-driver
description: Use the realman_pi repository's curated RealMan Python API reference when designing, implementing, reviewing, debugging, or documenting a RealMan robot driver or ROS 2 integration. Trigger for RealMan/RM65 Python SDK questions, Robotic_Arm APIs, motion/state/force/IO/Modbus/UDP/end-effector integration, API return codes, data structures, enums, firmware compatibility, or requests to locate the relevant vendor documentation.
---

# RealMan Python Driver

Use this skill as the project-local reference workflow for developing a RealMan robot driver. The detailed API material lives in the repository's `doc/` directory; do not duplicate it in this skill.

## Reference Snapshot

The local reference was summarized from the official RealMan developer site on 2026-08-13.

- Document site version: `V1.7.13`.
- Coverage: 1 getting-started page, 30 API classes, 298 method sections, 61 structures, and 15 enum groups.
- Official entry point: <https://develop.realman-robotics.com/robot/apipython/getStarted/>.
- Official SDK repository: <https://github.com/RealManRobot/RM_API2>.
- The local notes are a summary, not a replacement for the official documentation. Check the official page when a firmware-dependent behavior, exact parameter table, or version discrepancy matters.

## Query Workflow

1. Identify the task boundary: connection, motion, state, coordinate/algorithm, force/safety, end-effector, IO/protocol, online programming, or type/return-code lookup.
2. Read [`doc/README.md`](../../../doc/README.md) for scope and the authoritative source links.
3. Read only the relevant topic file from the map below.
4. Search the exact API name, structure name, enum name, or error code with `rg` in [`doc/10-api-index.md`](../../../doc/10-api-index.md), [`doc/09-types-and-structures.md`](../../../doc/09-types-and-structures.md), and [`doc/11-examples-errors-and-versions.md`](../../../doc/11-examples-errors-and-versions.md).
5. Before implementing, open the linked official page for the selected API if the local note does not contain the complete parameter table, return object, warning, or hardware prerequisite.
6. In the implementation summary, state which local reference files and official pages were used, plus any unresolved model or firmware assumption.

### Topic Map

| Task | Read first |
| --- | --- |
| Install SDK, create a handle, choose thread mode, query software, release connections | [`01-getting-started.md`](../../../doc/01-getting-started.md) |
| MoveJ/MoveL/MoveS/MoveC, CANFD, follow, pause, stop, teach, drag teach | [`02-motion-and-teaching.md`](../../../doc/02-motion-and-teaching.md) |
| Robot state, joints, controller, network, install pose, controller/tool IO, speed and collision parameters | [`03-state-and-configuration.md`](../../../doc/03-state-and-configuration.md) |
| Pose representations, tool/work frames, forward/inverse kinematics, DH, singularity, self-collision | [`04-coordinate-and-algorithm.md`](../../../doc/04-coordinate-and-algorithm.md) |
| Force sensor, force-position control, electronic fence, virtual wall, collision safety | [`05-force-and-safety.md`](../../../doc/05-force-and-safety.md) |
| Gripper, dexterous hand, lift, expansion joint, RM Plus end-effector protocol | [`06-end-effectors-and-expansion.md`](../../../doc/06-end-effectors-and-expansion.md) |
| Controller/tool IO, RS485, Modbus RTU/TCP, UDP state push | [`07-io-and-protocols.md`](../../../doc/07-io-and-protocols.md) |
| Online programming files and global waypoints | [`08-project-and-waypoints.md`](../../../doc/08-project-and-waypoints.md) |
| Structure fields, units, nested return objects, enums | [`09-types-and-structures.md`](../../../doc/09-types-and-structures.md) |
| Exact class method names and signatures | [`10-api-index.md`](../../../doc/10-api-index.md) |
| Official demos, API2 return codes, release notes, version compatibility, common failures | [`11-examples-errors-and-versions.md`](../../../doc/11-examples-errors-and-versions.md) |

Useful searches:

```bash
rg -n "rm_movej|rm_movel|rm_movev|CANFD" doc/10-api-index.md doc/02-motion-and-teaching.md
rg -n "rm_pose_t|rm_current_arm_state_t|rm_realtime_push_config_t" doc/09-types-and-structures.md
rg -n "RM_TRIPLE_MODE_E|-5|-6|Modbus RTU|RM Plus" doc
```

## Driver Development Workflow

### 1. Establish the vendor boundary

- Keep RealMan SDK calls inside the driver implementation, not in launch files or UI code.
- Wrap the SDK handle and connection lifecycle in an object with explicit connect, state, stop, disconnect, and cleanup behavior.
- Preserve the vendor API's return code and relevant `rm_err_t` data in the driver's error path. Do not turn every failure into a generic boolean.
- Record the robot model, force type, SDK version, controller software versions, IP, and port as deployment inputs. Do not hard-code credentials or machine-specific secrets.
- For multiple arms, create one independent handle and state namespace per arm. Never share mutable SDK state between arms without confirming the SDK's thread-safety contract.

### 2. Choose the execution model deliberately

- Use `rm_thread_mode_e.RM_SINGLE_MODE_E` only when the application does not need the SDK's asynchronous callbacks or UDP state reception.
- Use `RM_DUAL_MODE_E` when the receive queue needs a dedicated receive thread.
- Use `RM_TRIPLE_MODE_E` for UDP real-time state push. Confirm target IP, broadcast port, push enablement, firewall rules, and callback lifetime.
- Keep blocking motion calls out of high-frequency ROS callbacks and executor-critical paths. Set explicit timeouts in single-thread blocking mode.
- Separate command, state polling/callback, safety-stop, and reconnect concerns. A failed status update must not silently imply that the robot stopped.

### 3. Map vendor operations to ROS 2

- Follow the existing package and namespace conventions in `src/driver/` and `src/realman_bringup/` before adding a new public interface.
- Use ROS 2 parameters for connection and behavior settings. New project configuration belongs under the repository-root `config/` directory and must include comments describing units, valid values, and hardware assumptions.
- Use ROS 2 topics for continuous state, services for short request/response configuration operations, and actions for long-running or cancellable motion/program operations when that matches the existing project contract.
- Use exact frame, topic, service, action, and parameter names from the driver design. For a multi-arm system, include the arm namespace in every public resource and TF frame.
- Keep vendor units at the boundary explicit. Convert once at the ROS interface and document whether a ROS field is radians/degrees, metres/millimetres, N/Nm, or a vendor-scaled integer.
- Apply the companion [`ros2-logging-conventions`](../ros2-logging-conventions/SKILL.md) skill for all ROS runtime logging. Use official ROS 2 logging interfaces and preserve the project's colored, timestamped node log behavior.

### 4. Validate in increasing risk order

1. Import the SDK and run the official basic-process example in an isolated environment.
2. Connect and query software/model information without issuing motion.
3. Run the driver in simulation mode where supported and validate parameter/unit conversion.
4. Test read-only state, stop, and error paths with a disconnected or unavailable controller.
5. Test motion at low speed in a cleared workspace with a reachable emergency stop.
6. Test force, IO, Modbus, UDP, and end-effector features only when the matching hardware and firmware are present.
7. Test reconnect, timeout, external stop, controller error, stale state, and shutdown cleanup.

For each test, record the command, model, SDK/controller versions, network settings without secrets, expected return code, observed state, and safety preconditions.

## API Guardrails

- Most commands use `0` for success and nonzero values for API2 errors; query methods commonly return `(error_code, data)`. Check the code before reading data.
- `rm_movej()` uses degrees for joints, a velocity ratio of `1..100`, blend radius `0..100`, and `connect=1` to connect the next trajectory. The blend radius has no effect when `connect=0`.
- In multi-thread mode, `block=0` is non-blocking and `block=1` is blocking; in single-thread mode a nonzero block value is typically a timeout in seconds. Confirm the exact method page before relying on this convention.
- `MoveS` needs at least three consecutive connected points; otherwise the resulting motion can be a straight line.
- CANFD and other transparent-transmission interfaces need a stable communication period and smooth, prevalidated trajectories. Do not treat transparent transmission as a safety planner.
- UDP callbacks require triple-thread mode and correct IP/port/firewall configuration. Single-thread mode cannot use the documented arm event callback.
- Modbus RTU on the controller RS485 port is mutually exclusive with direct robot control on that port. Close RTU mode before expecting normal robot-control behavior.
- Electronic-fence and virtual-wall shape/mode support is limited; check the current official page before assuming arbitrary geometry.
- RM Plus features may require a vendor-provided custom end-effector firmware package. Force APIs require the matching force-sensor hardware version.
- The algorithm documentation warns to validate in simulation first, avoid driving the elbow joint exactly to the singular zero position, and keep software joint limits away from unsafe boundary behavior.

## When Information Is Missing

Do not invent a parameter range, enum value, ROS interface, or firmware capability. Search the local index first, then consult the linked official page, release notes, API2 error list, or official SDK repository. If the official sources disagree, report the disagreement and treat the target controller/SDK version as an explicit compatibility decision.

When a driver feature is completed, use the companion [`document-feature-updates`](../document-feature-updates/SKILL.md) skill to update the Web developer manual. Keep this skill focused on how to find and apply the RealMan Python reference.
