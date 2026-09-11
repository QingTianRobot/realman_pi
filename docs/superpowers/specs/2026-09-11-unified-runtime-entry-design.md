# Unified Runtime Entry Design

## Goal

Provide one production-oriented command that starts the ROS 2 camera chain and
the three-arm RealMan bringup together, while keeping RViz opt-in and retaining
legacy helpers for compatibility.

## Behavior

- `./rm65 up` starts the production runtime: ROS 2 color cameras on the host
  and the headless `realman_bringup_remote` Compose service with real drivers.
- `./rm65 up desktop` starts the same runtime with a local RViz viewer.
- `./rm65 up model` starts the offline three-arm model viewer without hardware.
- `./rm65 down`, `status`, and `logs` operate on the unified runtime.
- `./rm65 camera` exposes the legacy RTSP/depth streaming maintenance path.
- `./rm65 sync` validates a clean `main` checkout and synchronizes it to the
  configured production host; it does not restart services implicitly.

## Architecture

The root `rm65` script is a thin dispatcher. Runtime ownership remains split by
resource: the host process owns USB camera access and ROS 2 camera nodes, while
Docker owns the RealMan ROS graph and its logs. A small state directory under
`logs/` records the camera launch PID so unified stop/status commands can manage
both sides safely. Existing `functions.zsh` functions remain available and are
not removed in this change.

The default camera path is `rm65_camera_ros2 color`, matching
`config/ros/camera_calibration.yaml` topics and avoiding RTSP/TCP conversion
latency. RViz remains disabled unless `desktop` is requested.

## Failure and compatibility

If camera startup fails, the Docker bringup is not started. If Docker startup
fails after cameras are running, the command reports the failure and stops the
camera process to avoid a half-started production graph. Existing standalone
camera, Compose, and helper commands continue to work.

## Documentation and verification

The Web developer manual and startup index will document the new commands,
ownership boundaries, state/log locations, and production sync behavior.
Validation includes shell syntax, Compose config rendering, focused helper
tests, relevant ROS package tests, and the VitePress production build.
