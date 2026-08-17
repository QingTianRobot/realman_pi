# RealMan Motion Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-arm cancellable RealMan motion Actions, verified tool/work coordinate profiles, and a safe six-axis Cartesian velocity session for the /l, /m, and /r drivers.

**Architecture:** Keep one SDK handle and one ownership state machine per namespaced driver node. Put generated ROS interfaces in a new realman_msgs package, keep vendor calls in RealManSdkAdapter, and isolate action lifecycle, coordinate policy, quaternion math, and fixed-rate velocity control in focused Python modules. Ordinary motion uses non-blocking SDK calls plus RealMan trajectory events; Cartesian velocity uses a local industrial-PC loop with a command watchdog.

**Tech Stack:** ROS 2 Humble, rclpy Actions, rosidl_default_generators, Python 3, RealMan Robotic_Arm SDK, geometry_msgs/msg/TwistStamped, YAML under root config/, Docker Compose, pytest, VitePress.

---

## Design Decisions Locked By The Spec

- Public ordinary-motion Actions: /l/execute_motion, /m/execute_motion, /r/execute_motion.
- Version-one ordinary commands: MOVEJ, MOVEL, MOVEJ_P; connect=true is rejected until trajectory chaining has explicit event ownership.
- Motion calls use block=0; rm_get_arm_event_call_back() plus state monitoring decides completion.
- Cancel means rm_set_arm_slow_stop() and a CANCELED result. Existing /l|m|r/stop remains the faster stop operation.
- Coordinate profiles are desired state. Startup defaults to verify and block motion on mismatch; applying or selecting a frame is explicit.
- Cartesian velocity is a separate long-lived /l|m|r/cartesian_velocity Action with geometry_msgs/TwistStamped commands on /l|m|r/cartesian_velocity/command.
- Cartesian velocity is [vx, vy, vz, wx, wy, wz] in m/s and rad/s. Quaternion is the canonical pose representation; no Euler state is used for interpolation or velocity control.
- Motion and velocity sessions are mutually exclusive per arm. High-rate control executes on the industrial PC, not on the notebook.

## File Map

### New files

- src/driver/realman_msgs/action/ExecuteMotion.action: typed point-to-point motion Goal/Result/Feedback.
- src/driver/realman_msgs/action/CartesianVelocity.action: long-lived velocity-session Goal/Result/Feedback.
- src/driver/realman_msgs/srv/SelectFrame.srv: explicit tool/work frame selection request and result.
- src/driver/realman_msgs/srv/VerifyCoordinates.srv: verify or explicitly apply the configured coordinate profile.
- src/driver/realman_msgs/CMakeLists.txt, package.xml, resource/realman_msgs: ament interface package metadata.
- src/driver/realman_robot_driver/realman_robot_driver/motion_types.py: command enums, validation results, and terminal-state values.
- src/driver/realman_robot_driver/realman_robot_driver/coordinate_manager.py: YAML profile loading, frame comparison, apply/select policy, and quaternion validation.
- src/driver/realman_robot_driver/realman_robot_driver/quaternion_math.py: normalization, multiplication, exponential integration, and Twist transform helpers.
- src/driver/realman_robot_driver/realman_robot_driver/motion_coordinator.py: one-active-goal Action lifecycle for ordinary motions.
- src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py: fixed-rate velocity loop, acceleration limiter, watchdog, and session feedback.
- config/ros/realman_coordinates.yaml: desired tool/work frames, payload, centre of mass, defaults, and startup policy for all three arms.
- config/ros/realman_motion.yaml: default timeouts, Cartesian speed/acceleration limits, velocity period, and watchdog policy for all three arms.
- src/driver/realman_msgs/test/test_interface_files.py: source-level interface contract checks.
- src/driver/realman_robot_driver/test/test_motion_types.py, test_coordinate_manager.py, test_quaternion_math.py, test_motion_coordinator.py, and test_cartesian_velocity_session.py: focused unit tests.

### Modified files

- src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py: thread-safe vendor motion, coordinate, current-pose, event-callback, and velocity methods.
- src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py: Action servers, coordinate services, velocity command subscription, ownership state, and multi-threaded shutdown.
- src/driver/realman_robot_driver/launch/realman_driver.launch.py and three_realman_drivers.launch.py: pass coordinate/motion config paths.
- src/realman_bringup/launch/system.launch.py: expose and forward the two config paths.
- src/driver/realman_robot_driver/setup.py and package.xml: install root configs and declare runtime dependencies.
- config/docker/ros2-humble-rviz.Dockerfile: build the interface dependency; the existing root config mount remains authoritative.
- src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py and test_realman_driver_node.py: new adapter, service, Action, and shutdown coverage.
- website/docs/development/realman-driver-scaffold.md, system-bringup.md, and index.md: developer contract and navigation.

## Task 1: Add And Compile ROS Interfaces

**Files:**
- Create: src/driver/realman_msgs/action/ExecuteMotion.action
- Create: src/driver/realman_msgs/action/CartesianVelocity.action
- Create: src/driver/realman_msgs/srv/SelectFrame.srv
- Create: src/driver/realman_msgs/srv/VerifyCoordinates.srv
- Create: src/driver/realman_msgs/CMakeLists.txt, package.xml, resource/realman_msgs
- Test: src/driver/realman_msgs/test/test_interface_files.py

- [ ] **Step 1: Write the source-level interface test.** Assert the files exist and contain typed fields, not JSON/dictionary payloads.

~~~python
from pathlib import Path

ROOT = Path(__file__).parents[1]

def test_motion_actions_are_typed_and_present():
    motion = (ROOT / "action/ExecuteMotion.action").read_text()
    velocity = (ROOT / "action/CartesianVelocity.action").read_text()
    assert "float64[6] joint_degrees" in motion
    assert "float64[4] pose_quaternion_wxyz" in motion
    assert "uint8 MOVEJ=0" in motion
    assert "float64[3] commanded_linear_velocity_mps" in velocity
    assert "uint32 watchdog_ms" in velocity

def test_coordinate_services_are_explicit():
    select = (ROOT / "srv/SelectFrame.srv").read_text()
    verify = (ROOT / "srv/VerifyCoordinates.srv").read_text()
    assert "string name" in select
    assert verify.startswith("---")
    assert "int32 api2_status" in verify
~~~

- [ ] **Step 2: Run the source test and verify it fails because the interface files do not exist.**

Run: pytest -q src/driver/realman_msgs/test/test_interface_files.py

Expected: collection or assertion failure naming the missing action/ and srv/ files.

- [ ] **Step 3: Add the exact approved Action definitions.** ExecuteMotion.action uses MOVEJ/MOVEL/MOVEJ_P, BASE/WORK/TOOL, six joint degrees, position metres, quaternion wxyz, velocity/blend percentages, connect, timeout, terminal states, feedback phases, current joints, active frame, and API2 status. CartesianVelocity.action uses reference_type, reference_name, control_period_ms, watchdog_ms, linear/angular acceleration limits, follow, trajectory_mode, radio, terminal states SUCCEEDED/CANCELED/ABORTED/WATCHDOG_STOP, and feedback arrays for commanded/limited linear and angular velocities.

- [ ] **Step 4: Add SelectFrame.srv and VerifyCoordinates.srv.** SelectFrame.srv contains string name followed by bool success, int32 api2_status, string active_name, and string message. VerifyCoordinates.srv has an empty request followed by bool success, bool matched, int32 api2_status, and string message. The /verify and /apply endpoint names choose the operation, so the request cannot contradict the endpoint.

- [ ] **Step 5: Add the ament interface package.** Configure rosidl_generate_interfaces with action/ExecuteMotion.action, action/CartesianVelocity.action, srv/SelectFrame.srv, and srv/VerifyCoordinates.srv; export rosidl_default_runtime, install the four interface files, and register the package marker. Keep this package independent of the vendor SDK.

- [ ] **Step 6: Run source and ROS interface checks.**

Run:

~~~bash
pytest -q src/driver/realman_msgs/test/test_interface_files.py
docker compose build realman_driver_test
docker compose run --rm realman_driver_test bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && ros2 interface show realman_msgs/action/ExecuteMotion && ros2 interface show realman_msgs/action/CartesianVelocity'
~~~

Expected: source tests pass, the image builds, and both Action definitions print Goal/Result/Feedback sections.

- [ ] **Step 7: Commit the interface package.**

~~~bash
git add src/driver/realman_msgs
git commit -m "feat: add RealMan motion control interfaces"
~~~

## Task 2: Add Configuration Schemas And Coordinate Policy

**Files:**
- Create: config/ros/realman_coordinates.yaml
- Create: config/ros/realman_motion.yaml
- Create: src/driver/realman_robot_driver/realman_robot_driver/coordinate_manager.py
- Test: src/driver/realman_robot_driver/test/test_coordinate_manager.py
- Modify: src/driver/realman_robot_driver/setup.py, package.xml

- [ ] **Step 1: Write failing profile tests.** Cover exact robot IDs l/m/r, quaternion normalization/rejection, controller name length, missing defaults, unique namespaced ros_frame_id values, on_start/on_mismatch, and expected-versus-current tool/work frame comparison.

~~~python
def test_rejects_zero_quaternion(tmp_path):
    path = write_profile(tmp_path, tool_quaternion=[0.0, 0.0, 0.0, 0.0])
    with pytest.raises(ValueError, match="quaternion"):
        CoordinateManager.from_yaml(path)

def test_mismatch_blocks_motion_by_default(fake_adapter, profile_path):
    manager = CoordinateManager.from_yaml(profile_path)
    result = manager.verify(fake_adapter, "l")
    assert result.matched is False
    assert manager.motion_allowed("l") is False
~~~

- [ ] **Step 2: Run the focused tests and verify they fail because CoordinateManager is absent.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_coordinate_manager.py

Expected: import failure for realman_robot_driver.coordinate_manager.

- [ ] **Step 3: Add both root YAML files with comments and safe defaults.** realman_coordinates.yaml must define all three robots, default_tool, default_work, separate controller_name and namespaced ros_frame_id values, desired tool/work positions as xyz_m plus quaternion wxyz, payload kilograms, centre of mass metres, and policy.on_start: verify, policy.on_mismatch: block_motion. realman_motion.yaml must define per-arm default_timeout_sec, max_linear_speed_mps, max_angular_speed_radps, velocity_control_period_ms, velocity_watchdog_ms, max_linear_accel_mps2, and max_angular_accel_radps2; each value gets an adjacent unit/safety comment.

- [ ] **Step 4: Implement CoordinateManager.from_yaml().** Use yaml.safe_load; require exactly l, m, and r; normalize valid quaternions; reject non-finite values, zero-norm quaternions, invalid frame names, and missing defaults; return immutable dataclasses for policy, tool frames, work frames, and per-arm coordinate defaults. Motion defaults remain owned by realman_motion.yaml and motion_types.py.

- [ ] **Step 5: Implement the policy methods with exact signatures.** Add verify(adapter, arm) -> CoordinateVerification, apply(adapter, arm) -> CoordinateVerification, select_tool(adapter, arm, name) -> CoordinateVerification, select_work(adapter, arm, name) -> CoordinateVerification, and motion_allowed(arm) -> bool. apply() writes the configured frame through the adapter and immediately reads it back. select_tool() and select_work() refuse a busy arm through the ownership callback supplied by the node. Controller names remain separate from ROS TF IDs.

- [ ] **Step 6: Install configuration fallbacks and declare dependencies.** Change setup.py to install both root YAML files; add python3-yaml, realman_msgs, geometry_msgs, and action runtime dependencies in package.xml without copying configuration into src/.

- [ ] **Step 7: Run profile and YAML checks.**

Run:

~~~bash
PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_coordinate_manager.py
python3 - <<'PY'
from pathlib import Path
import yaml
for name in ("realman_coordinates.yaml", "realman_motion.yaml"):
    assert isinstance(yaml.safe_load(Path("config/ros", name).read_text()), dict)
print("configuration YAML OK")
PY
~~~

Expected: all profile tests pass and the parser prints configuration YAML OK.

- [ ] **Step 8: Commit configuration and coordinate policy.**

~~~bash
git add config/ros/realman_coordinates.yaml config/ros/realman_motion.yaml src/driver/realman_robot_driver/realman_robot_driver/coordinate_manager.py src/driver/realman_robot_driver/test/test_coordinate_manager.py src/driver/realman_robot_driver/setup.py src/driver/realman_robot_driver/package.xml
git commit -m "feat: add RealMan coordinate profiles"
~~~

## Task 3: Deepen The SDK Adapter For Motion And Events

**Files:**
- Modify: src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py
- Modify: src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py

- [ ] **Step 1: Extend the fake SDK tests before implementation.** Add FakeRobot methods for rm_movej, rm_movel, rm_movej_p, rm_set_arm_slow_stop, rm_set_arm_stop, rm_get_arm_current_trajectory, rm_get_current_arm_state, rm_get_arm_event_call_back, rm_set_movev_canfd_init, rm_movev_canfd, tool/work frame reads/writes, and a call log. Assert each adapter method forwards exact arguments and returns the vendor status unchanged.

~~~python
def test_movej_is_nonblocking_and_preserves_degrees(adapter, fake_robot):
    assert adapter.movej([1.0] * 6, 20, 0, False) == 0
    assert fake_robot.calls[-1] == ("rm_movej", [1.0] * 6, 20, 0, 0)

def test_velocity_vector_is_not_converted_to_euler(adapter, fake_robot):
    assert adapter.movev([0.1, 0.0, 0.0, 0.0, 0.2, 0.0], True, 0, 0) == 0
    assert fake_robot.calls[-1][0] == "rm_movev_canfd"
    assert fake_robot.calls[-1][1] == [0.1, 0.0, 0.0, 0.0, 0.2, 0.0]
~~~

- [ ] **Step 2: Run adapter tests and verify they fail with missing methods.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py

Expected: failures naming the new adapter methods.

- [ ] **Step 3: Add an RLock and preserve SDK callback lifetime.** Protect handle state and individual SDK calls with threading.RLock; do not hold the lock around a blocking vendor operation. Store the callback callable on the adapter instance so Python garbage collection cannot invalidate the SDK callback. Keep existing connect/disconnect/get-state return-code semantics.

- [ ] **Step 4: Add motion methods with exact vendor signatures.** Implement movej(joint_degrees, velocity_percent, blend_radius_percent, connect), movel(pose, velocity_percent, blend_radius_percent, connect), and movej_p(pose, velocity_percent, blend_radius_percent, connect), passing block=0 and returning the integer status. Implement slow_stop(), stop(), current_trajectory(), and event callback registration. Treat missing SDK, disconnected state, exceptions, and invalid handle as explicit failures.

- [ ] **Step 5: Add current-pose and velocity methods.** Implement current_arm_state(), set_movev_init(avoid_singularity_flag, frame_type, period_ms), and movev(cartesian_velocity, follow, trajectory_mode, radio). Pass [vx,vy,vz,wx,wy,wz] unchanged in SI units. Add adapter methods for the coordinate manager to read/write/select tool and work frames using the documented rm_frame_t shape.

- [ ] **Step 6: Run adapter tests and the existing regression suite.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py src/driver/realman_robot_driver/test/test_connection_probe.py

Expected: all adapter and connection-probe tests pass, including existing missing-SDK and reconnect behavior.

- [ ] **Step 7: Commit the adapter seam.**

~~~bash
git add src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py
git commit -m "feat: expose thread-safe RealMan motion adapter"
~~~

## Task 4: Add Quaternion Math And Motion Validation

**Files:**
- Create: src/driver/realman_robot_driver/realman_robot_driver/quaternion_math.py
- Create: src/driver/realman_robot_driver/realman_robot_driver/motion_types.py
- Test: src/driver/realman_robot_driver/test/test_quaternion_math.py
- Test: src/driver/realman_robot_driver/test/test_motion_types.py

- [ ] **Step 1: Write quaternion and validation tests.** Cover normalization, zero-norm rejection, identity multiplication, a 90-degree axis rotation, body/spatial integration order, finite-value rejection, exact six-element joint validation, velocity range checks, and positive timeout checks.

~~~python
def test_quaternion_exp_integrates_z_rotation_without_euler(quaternion_exp):
    result = quaternion_exp((0.0, 0.0, 3.141592653589793), 1.0)
    assert result == pytest.approx((0.70710678, 0.0, 0.0, 0.70710678), abs=1e-6)

def test_twist_acceleration_limit_preserves_direction():
    limited = limit_vector_delta((0.0, 0.0, 0.0), (3.0, 4.0, 0.0), 1.0, 1.0)
    assert math.sqrt(sum(value * value for value in limited)) == pytest.approx(1.0)
    assert limited[0] / limited[1] == pytest.approx(3.0 / 4.0)
~~~

- [ ] **Step 2: Run focused tests and verify they fail because the helpers are absent.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_quaternion_math.py src/driver/realman_robot_driver/test/test_motion_types.py

Expected: import failures for quaternion_math and motion_types.

- [ ] **Step 3: Implement quaternion operations with wxyz order.** Add normalize, multiply, conjugate, quaternion_exp(angular_velocity, dt), integrate_body_quaternion, integrate_spatial_quaternion, and finite-value checks. Use no Euler conversion in these helpers. Add a Twist transform helper only for explicit frame conversion; the normal TOOL/WORK path uses the controller-selected frame.

- [ ] **Step 4: Implement typed command validation and motion settings parsing.** Add CommandType, ReferenceType, terminal/feedback phases, immutable validation results, and MotionSettings.from_yaml(config_path, arm). Return a concrete error string for each invalid Goal field, reject connect=true in version one, reject a zero or non-finite quaternion, and reject non-positive periods, watchdogs, timeouts, speed limits, or acceleration limits from realman_motion.yaml.

- [ ] **Step 5: Run the helpers and lint checks.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_quaternion_math.py src/driver/realman_robot_driver/test/test_motion_types.py && git diff --check

Expected: all tests pass and git diff --check produces no output.

- [ ] **Step 6: Commit the math and validation seam.**

~~~bash
git add src/driver/realman_robot_driver/realman_robot_driver/quaternion_math.py src/driver/realman_robot_driver/realman_robot_driver/motion_types.py src/driver/realman_robot_driver/test/test_quaternion_math.py src/driver/realman_robot_driver/test/test_motion_types.py
git commit -m "feat: add quaternion and motion validation primitives"
~~~

## Task 5: Implement The Ordinary Motion Coordinator And ROS Action Server

**Files:**
- Create: src/driver/realman_robot_driver/realman_robot_driver/motion_coordinator.py
- Modify: src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py
- Test: src/driver/realman_robot_driver/test/test_motion_coordinator.py
- Modify: src/driver/realman_robot_driver/test/test_realman_driver_node.py

- [ ] **Step 1: Write coordinator tests around a fake goal handle.** Assert invalid goals abort without SDK calls; a busy arm rejects a second goal; a valid MOVEJ calls adapter.movej(joint_degrees, velocity_percent, blend_radius_percent, connect=False) and the adapter forwards block=0; a successful event returns SUCCEEDED; a vendor error returns ABORTED; cancellation calls slow_stop() once and returns CANCELED; timeout calls slow_stop() and returns TIMEOUT; frame mismatch is rejected before motion.

~~~python
def test_cancel_stops_once_and_returns_canceled(coordinator, goal_handle, adapter):
    goal_handle.is_cancel_requested = True
    result = coordinator.execute(goal_handle)
    assert result.terminal_state == ExecuteMotion.Result.CANCELED
    assert adapter.slow_stop_calls == 1

def test_busy_arm_rejects_new_goal(coordinator, active_goal):
    assert coordinator.goal_callback(active_goal) == GoalResponse.REJECT
~~~

- [ ] **Step 2: Run coordinator tests and verify they fail because the coordinator and Action integration are absent.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_motion_coordinator.py

Expected: import or attribute failures for MotionCoordinator.

- [ ] **Step 3: Implement the one-active-goal state machine.** Add goal_callback, cancel_callback, accepted_callback, and execute methods. accepted_callback must call goal_handle.execute(). The execute path publishes VALIDATING, SUBMITTING, and EXECUTING; calls the adapter with block=0; monitors the callback event and latest state; computes estimated progress only when target/current data are valid; and atomically chooses one terminal result.

- [ ] **Step 4: Integrate ActionServer into RealManDriverNode.** Create ActionServer(self, ExecuteMotion, "execute_motion", execute_callback=self.motion_coordinator.execute, goal_callback=self.motion_coordinator.goal_callback, cancel_callback=self.motion_coordinator.cancel_callback, handle_accepted_callback=self.motion_coordinator.accepted_callback, callback_group=self.motion_callback_group) under the arm namespace. Add the coordinate and motion configuration parameters, pass adapter/coordinate manager into the coordinator, and expose active goal status through the existing ROS logger and Action feedback.

- [ ] **Step 5: Make the node executor and shutdown concurrent-safe.** Replace rclpy.spin(node) with a MultiThreadedExecutor, add the node, spin it, and on shutdown cancel the active coordinator before disconnecting. Keep the existing state timer, connection services, and /joint_states behavior unchanged.

- [ ] **Step 6: Run mock Action integration tests and discovery.**

Run:

~~~bash
PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_motion_coordinator.py src/driver/realman_robot_driver/test/test_realman_driver_node.py
docker compose build realman_driver_test
docker compose run --rm -e ROS_DOMAIN_ID=168 realman_driver_test bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && ros2 action list | grep execute_motion'
~~~

Expected: mock tests pass, the container rebuilds, and the three namespaced Action servers appear when mock bringup is running.

- [ ] **Step 7: Commit ordinary motion Action support.**

~~~bash
git add src/driver/realman_robot_driver/realman_robot_driver/motion_coordinator.py src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py src/driver/realman_robot_driver/test/test_motion_coordinator.py src/driver/realman_robot_driver/test/test_realman_driver_node.py
git commit -m "feat: add cancellable RealMan motion actions"
~~~

## Task 6: Wire Coordinate Services And Launch Configuration

**Files:**
- Modify: src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py
- Modify: src/driver/realman_robot_driver/launch/realman_driver.launch.py
- Modify: src/driver/realman_robot_driver/launch/three_realman_drivers.launch.py
- Modify: src/realman_bringup/launch/system.launch.py
- Modify: src/driver/realman_robot_driver/test/test_realman_driver_node.py

- [ ] **Step 1: Add failing service tests.** Assert /l/coordinates/verify reports mismatch without writes, /l/coordinates/apply writes then reads back, /l/coordinates/select_tool selects a configured frame, and every coordinate operation is rejected while motion/velocity ownership is busy.

- [ ] **Step 2: Run service tests and verify they fail because endpoints are absent.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_realman_driver_node.py -k coordinates

Expected: service lookup or assertion failures for the missing endpoints.

- [ ] **Step 3: Declare and pass configuration paths.** Add coordinates_config_file and motion_config_file launch arguments with defaults under the root config/ros directory. Forward both from system.launch.py into three_realman_drivers.launch.py, and pass them as node parameters for each l/m/r driver.

- [ ] **Step 4: Register coordinate services.** Create VerifyCoordinates services named coordinates/verify and coordinates/apply, plus SelectFrame services named coordinates/select_tool and coordinates/select_work. Responses include success, matched where applicable, the adapter API2 code, the active controller frame name, and a concise detail string.

- [ ] **Step 5: Enforce startup policy.** After successful connection, call CoordinateManager.verify(). Set the per-arm motion_allowed flag from on_mismatch. Never write controller frames during verify-only startup.

- [ ] **Step 6: Run launch and service checks.**

Run:

~~~bash
python3 -m py_compile src/driver/realman_robot_driver/launch/realman_driver.launch.py src/driver/realman_robot_driver/launch/three_realman_drivers.launch.py src/realman_bringup/launch/system.launch.py
docker compose config --quiet
PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_realman_driver_node.py -k coordinates
~~~

Expected: Python compilation, Compose parsing, and coordinate service tests pass.

- [ ] **Step 7: Commit coordinate ROS integration.**

~~~bash
git add src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py src/driver/realman_robot_driver/launch/realman_driver.launch.py src/driver/realman_robot_driver/launch/three_realman_drivers.launch.py src/realman_bringup/launch/system.launch.py src/driver/realman_robot_driver/test/test_realman_driver_node.py
git commit -m "feat: expose verified RealMan coordinate services"
~~~

## Task 7: Implement Six-Axis Cartesian Velocity Session

**Files:**
- Create: src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py
- Create: src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py
- Modify: src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py
- Modify: src/driver/realman_robot_driver/test/test_realman_driver_node.py

- [ ] **Step 1: Write limiter and lifecycle tests.** Cover vector-norm acceleration limiting, zero-command initialization, command frame mismatch, invalid NaN/Inf input, watchdog expiry, cancel-to-slow-stop, SDK initialization failure, and mutual exclusion with MotionCoordinator.

~~~python
def test_watchdog_sends_zero_then_stops(session, adapter, clock):
    session.start(valid_goal())
    clock.advance(milliseconds=101)
    session.tick()
    assert adapter.velocity_calls[-1][0] == [0.0] * 6
    assert adapter.slow_stop_calls == 1
    assert session.result.terminal_state == CartesianVelocity.Result.WATCHDOG_STOP

def test_tool_velocity_keeps_linear_and_angular_axes_separate(session):
    session.accept_command(twist(frame="tcpgrip", linear=(0.1, 0.0, 0.0), angular=(0.0, 0.2, 0.0)))
    session.tick()
    assert adapter.velocity_calls[-1][0] == pytest.approx([0.1, 0.0, 0.0, 0.0, 0.2, 0.0])
~~~

- [ ] **Step 2: Run focused velocity tests and verify they fail because the session is absent.**

Run: PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py

Expected: import failures for CartesianVelocitySession.

- [ ] **Step 3: Implement the fixed-rate session.** Add start(goal), accept_command(TwistStamped), tick(), cancel(), and shutdown(). start() verifies the active frame and ownership, calls adapter.set_movev_init(avoid_singularity_flag, frame_type, control_period_ms), resets the previous command to zero, and starts one dedicated daemon control thread. Schedule ticks from monotonic deadlines, wake shutdown through threading.Event, and join the thread before releasing arm ownership.

- [ ] **Step 4: Implement command validation and acceleration limiting.** Require TwistStamped.header.frame_id to equal the active controller/ROS frame mapping; reject non-finite values. Limit linear and angular delta norms by max_linear_accel_mps2 * dt and max_angular_accel_radps2 * dt, then pass the six-vector unchanged to adapter.movev().

- [ ] **Step 5: Implement watchdog and terminal states.** Track monotonic command receipt time. On expiry, send [0.0] * 6, call slow_stop(), set WATCHDOG_STOP, and reject further commands. On Action cancel or node shutdown, execute the same zero-plus-slow-stop sequence and return CANCELED unless the stop fails, then return ABORTED.

- [ ] **Step 6: Add the ROS Action server and command subscription.** Register ActionServer(self, CartesianVelocity, "cartesian_velocity", execute_callback=self.velocity_session.execute, goal_callback=self.velocity_session.goal_callback, cancel_callback=self.velocity_session.cancel_callback, handle_accepted_callback=self.velocity_session.accepted_callback, callback_group=self.motion_callback_group) and a TwistStamped subscription at cartesian_velocity/command in the arm namespace. Publish feedback at a lower diagnostic rate than the control loop. Reject ordinary motion goals while the session owns the arm and reject velocity goals while an ordinary motion is active.

- [ ] **Step 7: Run mock velocity tests and topic discovery.**

Run:

~~~bash
PYTHONPATH=src/driver/realman_robot_driver pytest -q src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py src/driver/realman_robot_driver/test/test_quaternion_math.py
docker compose build realman_driver_test
docker compose run --rm realman_driver_test bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && ros2 interface show realman_msgs/action/CartesianVelocity'
~~~

Expected: limiter/watchdog/quaternion tests pass and the generated velocity Action displays all three sections.

- [ ] **Step 8: Commit Cartesian velocity support.**

~~~bash
git add src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py src/driver/realman_robot_driver/test/test_realman_driver_node.py
git commit -m "feat: add six-axis Cartesian velocity sessions"
~~~

## Task 8: Build, Container, And Regression Verification

**Files:**
- Modify: config/docker/ros2-humble-rviz.Dockerfile
- Modify: src/driver/realman_robot_driver/package.xml
- Test: existing launch and driver tests.

- [ ] **Step 1: Build the complete Humble workspace.** Ensure the Docker build invokes colcon build --symlink-install --packages-up-to realman_bringup realman_robot_driver realman_msgs and that generated interfaces are available before Python imports them.

Run: docker compose build --progress=plain realman_driver_test realman_bringup_remote realman_remote_rviz

Expected: image build completes and the colcon test stage reports no package test failures.

- [ ] **Step 2: Run all tests in the built environment.**

Run:

~~~bash
docker compose run --rm realman_driver_test bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && pytest -q /opt/rm65_ws/src/driver/realman_robot_driver/test /opt/rm65_ws/src/driver/realman_bringup/test'
docker compose config --quiet
~~~

Expected: all existing connection, adapter, node, launch, coordinate, Action, velocity, and quaternion tests pass; Compose exits successfully.

- [ ] **Step 3: Run a mock ROS graph smoke test.** Start realman_bringup_remote with the mock driver configuration on an unused domain, verify ros2 action list contains all six Action endpoints, verify /l|m|r/cartesian_velocity/command exists, and send one mock MOVEJ Goal with timeout_sec=5.0. Expected result is SUCCEEDED with six joint positions and no physical SDK import.

- [ ] **Step 4: Run static quality checks.**

Run:

~~~bash
rg -n "print\\(|printf|std::cout|std::cerr" src/driver/realman_robot_driver src/driver/realman_msgs
git diff --check
git status --short --branch
~~~

Expected: no runtime print calls in ROS code, no whitespace errors, and only intended feature changes in the worktree.

- [ ] **Step 5: Commit build and regression updates.**

~~~bash
git add config/docker/ros2-humble-rviz.Dockerfile src/driver/realman_robot_driver/package.xml
git commit -m "test: verify RealMan motion control in Humble containers"
~~~

## Task 9: Update Developer Manual And Operator Workflow

**Files:**
- Modify: website/docs/development/realman-driver-scaffold.md
- Modify: website/docs/development/system-bringup.md
- Modify: website/docs/development/index.md

- [ ] **Step 1: Add documentation examples for the public graph.** Document these exact checks:

~~~bash
ros2 action list | grep -E '/(l|m|r)/(execute_motion|cartesian_velocity)'
ros2 service list | grep -E '/(l|m|r)/coordinates/(verify|apply|select_tool|select_work)'
ros2 topic echo /l/cartesian_velocity/command geometry_msgs/msg/TwistStamped
~~~

Document Goal units, quaternion wxyz, terminal states, block=0 event completion, cancel versus fast stop, frame verification policy, and watchdog behavior.

- [ ] **Step 2: Document the two-machine deployment boundary.** State that the industrial PC runs realman_bringup_remote and the fixed-rate velocity loop, while the notebook runs only remote RViz and low-rate clients. Include ROS_DOMAIN_ID=166, the functions.zsh RViz commands, and the prohibition on running realman_driver_rviz from the notebook.

- [ ] **Step 3: Document configuration ownership.** Link to config/ros/realman_coordinates.yaml, config/ros/realman_motion.yaml, and config/ros/realman_driver.yaml. Explain verify as the startup default, apply as explicit, controller names versus ROS TF IDs, and metres/quaternion wxyz.

- [ ] **Step 4: Keep the existing developer pages authoritative.** Add the Action and velocity contract to realman-driver-scaffold.md and system-bringup.md, update development/index.md links if needed, and do not create a duplicate feature page or new route.

- [ ] **Step 5: Build the website and run its tests.**

Run: cd website && npm run build && npm run test:e2e

Expected: VitePress build succeeds and all route/example checks pass.

- [ ] **Step 6: Commit documentation.**

~~~bash
git add website/docs/development/realman-driver-scaffold.md website/docs/development/system-bringup.md website/docs/development/index.md
git commit -m "docs: document RealMan motion and velocity controls"
~~~

## Task 10: Remote Staging And Hardware Smoke Test

**Files:**
- No source changes; use the committed configuration, container, and documentation from Tasks 1-9.

- [ ] **Step 1: Verify the final tree before deployment.**

Run:

~~~bash
git status --short --branch
git log -5 --oneline
docker compose config --quiet
~~~

Expected: clean intended branch, all feature commits present, and valid Compose configuration.

- [ ] **Step 2: Update the industrial PC without touching unrelated services.** From the notebook run source functions.zsh && rm65_deploy_update; on the industrial PC build the updated realman_bringup_remote image and keep the existing mapping l=192.168.30.123, m=192.168.30.125, r=192.168.30.124.

- [ ] **Step 3: Restart only the RealMan remote bringup.** Use ROS_DOMAIN_ID=166 docker compose up -d --force-recreate realman_bringup_remote, then verify logs contain three RealMan connection ready messages and no invalid-handle errors. Do not stop cameras, grippers, or unrelated ROS containers.

- [ ] **Step 4: Run read-only coordinate verification.** Call each /{arm}/coordinates/verify endpoint and confirm active controller tool/work names and quaternion/payload data match config/ros/realman_coordinates.yaml. Do not call apply until physical tool measurements have been reviewed.

- [ ] **Step 5: Perform the low-risk Action smoke test.** In a cleared workspace with a reachable hardware emergency stop, send one low-speed MOVEJ to one arm, collect feedback through EXECUTING, then repeat with explicit cancel. Confirm SUCCEEDED and CANCELED results, current joint feedback, and corresponding ROS logs. Stop immediately if any arm moves unexpectedly.

- [ ] **Step 6: Perform the velocity-session smoke test.** Start one arm's Cartesian velocity Action with conservative period/watchdog and verified TOOL frame. Publish a zero Twist, then a small single-axis command, verify limited six-vector feedback, stop publishing, and confirm watchdog zero-plus-slow-stop. Test one arm at a time.

- [ ] **Step 7: Verify notebook RViz remains remote-only.** On the notebook run source functions.zsh && rm65_docker_remote_rviz_status; inside the viewer container verify it discovers /l|m|r/execute_motion, /l|m|r/cartesian_velocity, and the existing joint-state/TF graph without creating local SDK driver nodes.

- [ ] **Step 8: Record the smoke-test outcome without committing runtime artifacts.** Do not add runtime logs, controller backups, or machine-local credentials. If a limitation is observed, update the already-authoritative Web manual with the API2 code and hardware/firmware versions, then commit that documentation correction separately.

## Final Verification Checklist

- [ ] realman_msgs builds before realman_robot_driver and both Actions/services are discoverable.
- [ ] All three namespaces expose the same public contract and retain the corrected IP mapping.
- [ ] Motion Actions use block=0, event completion, single-goal ownership, feedback, cancel, timeout, and API2 results.
- [ ] Coordinate profiles live only under root config/, validate quaternion and frame names, verify on startup, and never implicitly switch during a Goal.
- [ ] Cartesian velocity sends six-axis Twist values in SI units from a fixed industrial-PC loop, applies vector acceleration limits, and stops on watchdog expiry.
- [ ] Quaternion math has no Euler state or gimbal-lock path in internal control logic.
- [ ] Mock, container, website, and real-arm smoke tests have recorded commands and outcomes.
- [ ] Web documentation, ROS names, TF names, config paths, and deployment instructions match the implementation.
