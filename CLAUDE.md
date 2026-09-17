# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ROS 2 Humble workspace controlling three namespaced RealMan RM65 arms (`/l`, `/m`, `/r`), with a VitePress documentation site. The authoritative README is `README.md`; the developer manual lives in `website/docs/development/` and the curated RealMan Python SDK reference lives in `doc/` (Chinese).

## Commands

### Docker (primary dev loop)

The root `docker-compose.yml` is only an include adapter — the authoritative Compose file is `config/docker/compose.yaml`, and the Compose project auto-loads the repo-root `.env` for candidate values. Services:

```bash
docker compose build rm65_rviz            # single-arm RViz viewer (ROS_DOMAIN_ID=65)
docker compose run --rm rm65_rviz
docker compose build rm65_three_rviz      # three-arm layout
docker compose build realman_bringup      # full bringup: drivers + RViz + Xbox input
docker compose run --rm realman_bringup_remote   # headless, no GUI/joystick
docker compose build realman_driver_test  # offline mock driver (no controller)
docker compose build xbox_controller_test # standalone controller check
```

Select a model or device with env vars, e.g. `RM65_MODEL=RM65-6FB-V`, `REALMAN_JOY_DEVICE=/dev/input/...`. Rebuilding is only needed for image changes; editing `config/ros/*.yaml` then restarting the container is enough for layout/driver changes.

### Local ROS 2 build & test

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install \
  --packages-up-to realman_bringup realman_robot_driver realman_web_control
source install/setup.bash
ros2 launch realman_bringup system.launch.py
```

Tests are `pytest` under each package's `test/`, and they import the **installed** package, so build first (`colcon build --symlink-install`). Run via colcon:

```bash
colcon test --packages-select realman_robot_driver realman_web_control realman_msgs
colcon test-result --verbose
```

Run a single test file directly (workspace sourced):

```bash
pytest src/driver/realman_robot_driver/test/test_motion_types.py
```

The C++ package `xbox_controller_driver` uses gtest (`colcon test --packages-select xbox_controller_driver`).

### Website

```bash
cd website
npm ci
npm run dev            # VitePress dev server (runs sync-assets first)
npm run build          # outputs to website/docs/.vitepress/dist
npm run test:e2e       # Playwright, config in config/website/
npm run test:web-control   # Playwright, config in config/web-control/
```

Deployment to GitHub Pages is `config/website/vitepress.config.mts` driven via `.github/workflows/deploy-pages.yml`.

### Optional Zsh helpers

`source functions.zsh` then `rm65_project_help` — prefixed `rm65_project_*`, `rm65_docker_*`, `rm65_ros_*`, `rm65_web_*`, `rm65_deploy_*`. They resolve the repo root from `functions.zsh` so they work from any directory.

## Architecture

### Three-arm namespacing

Each physical arm is one namespaced ROS node plus a collision-free TF prefix: `/l -> l/world -> l/base_link -> ... -> l/link_6` (same for `m`, `r`). `config/ros/three_robots.yaml` is the authoritative layout (positions, orientations, per-arm model); the driver addresses/parameters live in `config/ros/realman_driver.yaml` (mock variant: `realman_driver_mock.yaml`).

### Configuration is the source of truth

All runtime configuration lives under the repo-root `config/`, grouped by subsystem (`docker/`, `ros/`, `rviz/`, `python/`, `website/`, `web-control/`). Do not scatter config into packages or the repo root. `.env` holds only Docker candidate values. This convention is enforced by the project-local skill `.agents/skills/project-config-layout/SKILL.md`.

### Driver internals (`src/driver/realman_robot_driver`)

The key layering, top to bottom:

- `realman_driver_node.py` — per-arm ROS owner (`RealManDriverNode`); publishes `/<arm>/joint_states` and owns the action/service/topic interface. Runs under a `MultiThreadedExecutor`.
- `motion_coordinator.py` / `cartesian_velocity_session.py` — ROS-neutral lifecycle for ordinary motion and Cartesian velocity respectively; one active goal per arm, guarded by a per-arm ownership lock.
- `coordinate_manager.py` — validates desired tool/work frame profiles. Its SDK seam is deliberately duck-typed so this module never imports the RealMan SDK.
- `realman_sdk_adapter.py` — the only thread-safe boundary around the vendor `Robotic_Arm` SDK; owns one handle per arm, preserves API2 return codes.
- `motion_types.py` — enums (`CommandType`, `ReferenceType`, `TerminalState`, `FeedbackPhase`) and goal/limit validation. `pose_math.py` / `quaternion_math.py` — small rigid-pose/kinematics helpers.

The ROS-neutral split (coordinator/coordinate_manager don't import the SDK) is what makes them unit-testable without hardware.

### Interfaces (`src/driver/realman_msgs`)

All motion/coordinate interfaces live in this separate package, not the Python driver. Actions: `ExecuteMotion`, `ExecuteTrajectory`, `CartesianVelocity`. Services: `SolveIk`, `ForwardKinematics`, `GetCurrentPose`, `SelectFrame`, `RecoverMotion`, `VerifyCoordinates`, plus calibration capture/solve. `gripper_ros2_msgs` provides the gripper service.

### Web control (`src/driver/realman_web_control`)

Bridges an authenticated browser UI + WebSocket to the ROS action interface:

- `web_control_node.py` — ROS node (MultiThreadedExecutor); routes validated WS commands to `realman_msgs` actions.
- `web_server.py` — aiohttp HTTP server on a dedicated asyncio thread; serves the UI.
- `protocol.py` — validates the JSON accepted by the WebSocket endpoint (`ARMS = {l, m, r}`, fixed action names).
- `action_bridge.py` — adapters mapping validated protocol dicts onto generated ROS messages.
- `joint_records.py` — persistent joint-target records stored under the `config/` tree.
- `model_manifest.py` — builds the UI model/safety manifest from root project config. `tf_pose.py` — dependency-free pose ops at the Web/TF boundary.

Set `REALMAN_WEB_CONTROL_TOKEN` (empty = read-only console) and see `config/ros/realman_web_control.yaml`.

### Other packages

- `rm65_description` — URDF/mesh/TF/RViz for five RM65 models (`RM65-B` default, `-V`, `-6F`, `-6FB`, `-6FB-V`); `display.launch.py`, `three_robots.launch.py`.
- `realman_bringup` — top-level `system.launch.py` orchestrating drivers, TF, RViz, `game_controller_node`, and input handling; `remote_rviz.launch.py` is the headless variant.
- `xbox_controller_driver` — C++ node (`rclcpp`) turning standard `sensor_msgs/Joy` into button edge logs; contract in `website/docs/development/xbox-controller.md`.
- `gripper_ros2` — Modbus RTU (RS-485) wrapper for the Changingtek gripper.
- `sensor_bringup` + vendored `sensor/OrbbecSDK_ROS2` and `sensor/realsense` — cameras; `start_sensors.sh` sources each as its own workspace.
- `camera_stream/` — non-ROS Python RTSP/mediamtx streaming stack (separate from the ROS workspace).

## Documentation conventions

- The developer manual is `website/docs/development/` (index = contribution contract). **Treat docs as part of the feature**: a functional change is not complete until the manual reflects it (`document-feature-updates` skill). Create focused, stable lowercase-hyphenated pages; add new routes to `website/tests/site.spec.ts`.
- RealMan SDK questions should consult `doc/` (curated snapshot of the official Python API, V1.7.13) rather than the SDK directly — see `doc/README.md` for the topic map and `realman-python-driver` skill.
- ROS logging rules (`ros2-logging-conventions` skill): C++ nodes use `RCLCPP_*` macros only; no `printf`/`std::cout`/`std::cerr`; enable `RCUTILS_COLORIZED_OUTPUT=1` (no hand-written ANSI); each bringup writes to `logs/YYYYMMDD_HHMMSS/` via `ROS_LOG_DIR`.
- Never publish credentials, host secrets, private IPs, or machine-specific tokens into docs or config (they belong in the untracked `.env`, which is gitignored).
