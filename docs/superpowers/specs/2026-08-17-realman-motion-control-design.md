# RealMan Motion Control Design

**Status:** Design approved by the user on 2026-08-17.

## Goal

Add cancellable, observable motion control for the three namespaced RealMan arms, make controller-side tool/work coordinates explicit and verifiable, and provide a safe six-axis Cartesian velocity session without coupling high-rate control to the notebook network link.

## Scope

The feature has three coordinated parts:

1. A namespaced `ExecuteMotion` Action for `MOVEJ`, `MOVEL`, and `MOVEJ_P`, with feedback, cancellation, timeout handling, and one active goal per arm.
2. A root `config/` coordinate profile that describes desired tool/work frames, payload, centre of mass, active selections, and startup verification policy.
3. A long-lived Cartesian velocity control session that accepts `geometry_msgs/TwistStamped` commands, runs at a fixed rate on the industrial PC, limits linear/angular acceleration, and uses a watchdog.

`MoveS`, `MoveC`, trajectory streaming, IO, force control, and MoveIt compatibility are follow-up extensions. They must use the same adapter and state/ownership rules but are outside the first implementation slice.

## Architecture

The existing `RealManDriverNode` remains the per-arm ROS owner under `/l`, `/m`, and `/r`. Vendor calls stay behind `RealManSdkAdapter`. The node delegates motion lifecycle to focused internal modules:

```text
ROS action/topic client
  -> MotionCoordinator or CartesianVelocitySession
  -> CoordinateManager and safety validation
  -> RealManSdkAdapter
  -> Robotic_Arm SDK
```

The adapter owns one SDK handle per arm, preserves API2 return codes, registers the triple-thread event callback, and serializes SDK access. The node's state publisher remains the source of the latest joint state used for feedback; motion completion comes from the vendor trajectory event and a state/trajectory monitor.

The ROS node must run with a `MultiThreadedExecutor` and a reentrant action callback group. A per-arm ownership lock prevents ordinary motion and Cartesian velocity control from running simultaneously. Cancellation, timeout, connection loss, and shutdown must all converge on one terminal state.

## Package and public interfaces

Create a separate `realman_msgs` ROS interface package rather than adding generated interfaces to the Python driver package. The package owns `action/ExecuteMotion.action` and any future velocity-session action/status messages.

### `ExecuteMotion.action`

The first version exposes these constants and fields:

```text
# Goal constants
uint8 MOVEJ=0
uint8 MOVEL=1
uint8 MOVEJ_P=2
uint8 BASE=0
uint8 WORK=1
uint8 TOOL=2

uint8 command
uint8 reference_type
string reference_name
float64[6] joint_degrees
float64[3] pose_position_m
float64[4] pose_quaternion_wxyz
uint32 velocity_percent
uint32 blend_radius_percent
bool connect
float32 timeout_sec
---
# Result constants
uint8 SUCCEEDED=0
uint8 CANCELED=1
uint8 ABORTED=2
uint8 TIMEOUT=3

bool success
uint8 terminal_state
int32 api2_status
float64[6] final_joint_degrees
string message
---
# Feedback constants
uint8 VALIDATING=0
uint8 SUBMITTING=1
uint8 EXECUTING=2
uint8 STOPPING=3

uint8 phase
float32 progress
float64[6] current_joint_degrees
uint8 active_reference_type
string active_reference_name
int32 api2_status
string detail
```

Goal validation requires finite values, exactly six joints for joint commands, a finite three-element position, a finite non-zero quaternion that is normalized before use, `velocity_percent` in `1..100`, `blend_radius_percent` in `0..100`, a positive finite timeout, a connected arm, and an active reference frame matching `reference_type` and `reference_name`. Version one rejects `connect=true` so that one goal maps to one trajectory completion event. `progress` is an estimate; `phase`, the result status, and the API2 code are authoritative. Quaternion is the ROS-side canonical pose representation. If a vendor method only accepts an Euler list, conversion is isolated inside the adapter at the SDK seam and is not used for interpolation, feedback, or velocity control.

The action servers are `/l/execute_motion`, `/m/execute_motion`, and `/r/execute_motion`. A busy arm rejects a new goal. A cancellation request calls `rm_set_arm_slow_stop()` and waits for the trajectory to stop before returning `CANCELED`. The existing `/l|m|r/stop` services keep their faster `rm_set_arm_stop()` behavior and remain the emergency-adjacent software stop, not an Action cancellation alias. A failed stop returns `ABORTED`; an action timeout returns `TIMEOUT` after the same controlled stop attempt.

Motion commands use `block=0`; a blocking SDK call must not occupy the executor thread. Completion is correlated using the triple-thread `rm_get_arm_event_call_back()` event (`RM_CURRENT_TRAJECTORY_STATE_E`, device `0`) plus the current state/trajectory monitor. The callback reference must remain alive for the SDK lifetime.

## Coordinate configuration

Add `config/ros/realman_coordinates.yaml`. It is a desired-state profile, not an instruction to overwrite the controller at every launch:

```yaml
version: 1
policy:
  on_start: verify
  on_mismatch: block_motion
robots:
  l:
    default_tool: tcpgrip
    default_work: cell
    tools:
      tcpgrip:
        controller_name: tcpgrip
        ros_frame_id: l/tool/tcpgrip
        pose:
          xyz_m: [0.0, 0.0, 0.120]
          quaternion_wxyz: [1.0, 0.0, 0.0, 0.0]
        payload_kg: 0.80
        center_of_mass_m: [0.0, 0.0, 0.060]
    work_frames:
      cell:
        controller_name: cell
        ros_frame_id: l/work/cell
        pose:
          xyz_m: [0.0, 0.0, 0.0]
          quaternion_wxyz: [1.0, 0.0, 0.0, 0.0]
```

The schema is repeated for `l`, `m`, and `r`. Controller frame names must obey the vendor length limit; each separate `ros_frame_id` must be non-empty, unique, and use the arm namespace prefix. Positions and centre-of-mass values are metres, quaternions use `wxyz` order, and payload is kilograms. The implementation must validate all finite numeric values, frame names, robot IDs, and quaternion norms before launch. Euler angles are not part of the authoritative configuration schema.

Startup behavior is `connect -> read current controller frames -> compare -> allow or block motion`. `on_start=apply` is an explicit maintenance choice. The driver must expose separate short operations for `/{arm}/coordinates/verify`, `/{arm}/coordinates/apply`, `/{arm}/coordinates/select_tool`, and `/{arm}/coordinates/select_work`; applying or selecting a frame writes through `rm_set_manual_tool_frame()`, `rm_change_tool_frame()`, `rm_set_manual_work_frame()`, or `rm_change_work_frame()` and then reads back the result. Frame selection is rejected while an arm is moving. An Action goal never changes the active frame implicitly.

The same profile may generate optional RViz-only static transforms such as `l/link_6 -> l/tool/tcpgrip`. Those transforms are visualization aids and never replace controller-side frame verification.

## Six-axis Cartesian velocity session

Cartesian velocity is a separate long-lived session. The command vector is a `geometry_msgs/TwistStamped`:

```text
[vx, vy, vz, wx, wy, wz]
```

`vx/vy/vz` are metres per second and `wx/wy/wz` are radians per second. The intended orientation components are angular velocity, not Euler-angle rates. The session selects `BASE`, `WORK`, or `TOOL` and a verified frame name before calling `rm_set_movev_canfd_init()`. SDK enum integers are mapped internally from named ROS values; clients never pass raw vendor integers.

The session owns a fixed-rate loop on the industrial PC. The notebook may publish commands, but DDS timing is not treated as the control period. Each command is checked against the session frame ID, finite-value rules, configured speed limits, and a watchdog. Linear and angular velocity changes are limited by vector norms:

```text
||v_next - v_previous|| <= max_linear_accel_mps2 * dt
||w_next - w_previous|| <= max_angular_accel_radps2 * dt
```

No-Euler rule: current orientation, feedback, configuration, and any velocity integration use normalized quaternions. If a pose must be integrated, the implementation uses a quaternion exponential with the correct left/right multiplication for spatial/base versus body/tool angular velocity. It does not convert every sample through `rx/ry/rz`. A vendor boundary conversion is permitted only when an SDK method lacks a quaternion form, and that conversion is never used as the control state.

The session publishes phase, active frame, command age, commanded and limited Twist, current joint state, and API2 status. A watchdog expiry sends zero velocity, attempts controlled stop, and terminates with a distinct timeout/safety result. Ordinary motion and velocity sessions are mutually exclusive. Hardware emergency stop and the existing fast stop service remain independent.

## Error and ownership rules

- Preserve every vendor return code and the relevant operation in the Action result, service response, feedback, and ROS log.
- Never report success from a stale joint state or an invalid event callback.
- A connection loss aborts the active operation, releases ownership, and leaves the reconnect loop responsible for recovery; it must not silently restart a motion.
- Shutdown cancels ordinary motion with a slow stop, sends zero velocity and then a slow stop for an active Cartesian velocity session, releases the callback, deletes the robot handle, and destroys the SDK object.
- Tool/work frame changes, motion goals, velocity sessions, and stop operations use one per-arm ownership state machine.

## Testing and rollout

Mock-mode tests must cover Goal validation, busy rejection, successful completion event, API error, cancellation, timeout, frame mismatch, velocity acceleration limiting, watchdog expiry, quaternion normalization, and mutual exclusion. Adapter tests use a fake SDK and assert the exact vendor method and arguments, including degrees/radians and `block=0`.

Container tests must validate YAML parsing, `docker compose config --quiet`, Humble build, and ROS Action discovery with `mock_mode=true`. A real-arm smoke test is read-only first, then low-speed `MOVEJ`, then a controlled cancel, and finally a short velocity session in a cleared workspace with a reachable hardware emergency stop. Record model, SDK/controller versions, frame profile, period, limits, and API2 outcomes.

The Web developer manual must document the new package, action/service/topic names, coordinate config, units, TF distinction, startup/apply policy, velocity watchdog, cancellation semantics, and validation commands. Update the existing driver scaffold and system bringup pages rather than creating duplicate operator instructions.
