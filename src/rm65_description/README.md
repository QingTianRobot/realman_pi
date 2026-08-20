# RM65 ROS 2 description

This package contains the converted RealMan RM65 URDF assets as one ROS 2
Humble `ament_cmake` package.

Supported `model` values:

- `RM65-6F`
- `RM65-6FB`
- `RM65-B`
- `RM65-B-V`
- `RM65-6FB-V`

After building and sourcing the workspace, launch RViz 2 with:

```bash
ros2 launch rm65_description display.launch.py
```

## Docker (ROS 2 Humble)

Run these commands from the `realman_pi` workspace root, which contains
`docker-compose.yml`:

```bash
docker compose build rm65_rviz
docker compose run --rm rm65_rviz
```

The Compose service mounts the active X11/XWayland authorization cookie from
`$XAUTHORITY`. On a regular Xorg session where that variable is empty, set it
before starting the container:

```bash
export XAUTHORITY="$HOME/.Xauthority"
```

The Compose service reads `ROS_DOMAIN_ID` from the repository root `.env`.
The template uses domain `0`. To connect to an existing ROS 2 graph, set the
same domain ID in `.env` before starting the service:

```bash
RM65_MODEL=RM65-B docker compose run --rm rm65_rviz
```

The default model is `RM65-B`. Every converted URDF has one complete TF tree
rooted at `world`, followed by `base_link` and all arm links. RViz displays the
TF tree together with the robot model.

## Three-arm display

The repository-root `config/ros/three_robots.yaml` defines one layout for three
robots named `l`, `m`, and `r`. Launch it after building and sourcing the
workspace:

```bash
ros2 launch rm65_description three_robots.launch.py
```

The launch file creates `/l`, `/m`, and `/r` ROS namespaces and applies the TF
prefixes `l/`, `m/`, and `r/`. Static transforms attach `l/world`, `m/world`,
and `r/world` to the global `world` frame. The middle robot defaults to yaw
`3.141592653589793`, opposite to the left and right robots.

Use three GUI windows only when interactive joint control is required:

```bash
ros2 launch rm65_description three_robots.launch.py use_gui:=true
```
