# RealMan RM65 ROS 2 Description

ROS 2 Humble description package and RViz 2 Docker environment for RealMan
RM65 robots.

## Documentation

Project documentation: https://qingtianrobot.github.io/realman_pi/

The VitePress source is stored in `website/` and deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml`.

## Zsh helper functions

Load the optional project helpers from any Zsh session:

```zsh
source /path/to/realman_pi/functions.zsh
rm65_project_help
```

The functions use prefixes to separate responsibilities: `rm65_project_*`,
`rm65_docker_*`, `rm65_ros_*`, `rm65_web_*`, and `rm65_deploy_*`. They locate
the repository root from `functions.zsh`, so they keep working after changing
directories. The direct Docker, colcon, npm, and SSH commands below remain
available when additional options are required.

## Supported models

- `RM65-B` (default)
- `RM65-B-V`
- `RM65-6F`
- `RM65-6FB`
- `RM65-6FB-V`

Each URDF has a complete TF tree rooted at `world`. The default RM65-B tree is:

```text
world -> base_link -> link_1 -> link_2 -> link_3 -> link_4 -> link_5 -> link_6
```

## Run with Docker

Graphical RViz services require the active desktop session to provide both
`DISPLAY` and `XAUTHORITY`. The headless `realman_bringup_remote` service does
not require either variable.

```bash
docker compose build rm65_rviz
docker compose run --rm rm65_rviz
```

### Unified bringup with an Xbox controller

`realman_bringup` starts the three-arm scene, RViz 2, the ROS 2
`game_controller_node`, and the C++ Xbox input node. The service scans the
host's `*-event-joystick` devices and waits if the controller is not connected:

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

Press and release events are printed by `/input/xbox_controller`. Set
`REALMAN_JOY_DEVICE` to use a specific device path or glob:

```bash
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm realman_bringup
```

For headless remote debugging, run the target without a local joystick or GUI:

```bash
ROS_DOMAIN_ID=65 docker compose run --rm realman_bringup_remote
```

Another ROS 2 Humble host on the same network and domain can publish
`sensor_msgs/msg/Joy` on `/input/joy`. Both hosts must use
`ROS_LOCALHOST_ONLY=0`, and the network firewall must permit DDS UDP traffic.

Bringup enables ROS 2's official colored rcutils output and writes each run to
`logs/YYYYMMDD_HHMMSS/`. ROS 2 creates node log files such as
`xbox_controller_node_<pid>_<timestamp>.log` in that directory.

### Standalone Xbox controller test

To test the physical controller without starting robot TF or RViz, use the
dedicated service:

```bash
docker compose build xbox_controller_test
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm xbox_controller_test
```

The terminal should show the Xbox input node startup and entries such as
`button[0] a PRESSED` and `button[0] a RELEASED` when A is pressed and released.
If the controller is not connected yet, the service keeps polling the
`*-event-joystick` devices under `/dev/input` and starts the Joy driver when the
controller appears.

### RealMan joint-state driver and RViz

The Python driver reads the current joint angles from the three RM65-B
controllers and publishes `/l/joint_states`, `/m/joint_states`, and
`/r/joint_states`. The default addresses are configured in
`config/ros/realman_driver.yaml`:

```text
l: 192.168.30.123
m: 192.168.30.124
r: 192.168.30.125
```

Start the real driver and RViz 2 without the Xbox input chain:

```bash
docker compose build realman_driver_rviz
docker compose run --rm realman_driver_rviz
```

The driver uses `rm_get_joint_degree()` and converts vendor degrees to ROS
radians before publishing. The SDK version is pinned in
`config/python/realman-sdk-requirements.txt`.

For an offline test that cannot contact a controller, use the separate mock
configuration:

```bash
docker compose build realman_driver_test
docker compose run --rm realman_driver_test
```

In another ROS 2 Humble terminal on the same domain, inspect the mock state:

```bash
ros2 topic echo /r/connected
ros2 topic echo /r/joint_states
```

The driver owns connection lifecycle, read-only joint state, reconnect and
stop services. It does not yet expose motion actions, force control, IO or
production motion behavior.

### Three-arm layout

The repository-root `config/ros/three_robots.yaml` is the authoritative layout
for the left (`l`), middle (`m`), and right (`r`) robots. The default layout
places the arms at X positions `-1.0`, `0.0`, and `1.0` metres. Left and right
face the same direction; middle uses yaw `pi` and faces the opposite direction.

```bash
docker compose build rm65_three_rviz
docker compose run --rm rm65_three_rviz
```

Each robot has both a ROS namespace and a collision-free TF prefix:

```text
/l  -> l/world -> l/base_link -> ... -> l/link_6
/m  -> m/world -> m/base_link -> ... -> m/link_6
/r  -> r/world -> r/base_link -> ... -> r/link_6
```

All three prefixed trees attach to the global `world` frame using the transforms
from `config/ros/three_robots.yaml`. Edit that file and restart the container to
change positions, orientations, or per-arm RM65 models; rebuilding is not needed.

Select another model with `RM65_MODEL`:

```bash
RM65_MODEL=RM65-6FB-V docker compose run --rm rm65_rviz
```

The standalone viewer uses `ROS_DOMAIN_ID=65` by default. Set the same domain
as an external ROS 2 graph when connecting to other nodes.

## Local ROS 2 build

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install \
  --packages-up-to realman_bringup realman_robot_driver
source install/setup.bash
ros2 launch realman_bringup system.launch.py
```

## Website development

```bash
cd website
npm ci
npm run dev
```

Production build output is written to `website/docs/.vitepress/dist`.

## Repository structure

```text
realman_pi/
├── .github/workflows/    GitHub Pages deployment
├── config/               Annotated Docker, ROS, TF, and RViz configuration
├── docker/               Container entrypoint scripts
├── src/
│   ├── driver/           Robot hardware and operator input drivers
│   │   └── realman_robot_driver/ Python SDK joint-state driver
│   ├── realman_bringup/  Top-level launch orchestration
│   └── rm65_description/ Robot descriptions, TF, and RViz launch
├── functions.zsh         Optional Zsh development and deployment helpers
└── website/              VitePress documentation site
```

The Web developer manual documents the
[Xbox input contract](https://qingtianrobot.github.io/realman_pi/development/xbox-controller)
and [system bringup contract](https://qingtianrobot.github.io/realman_pi/development/system-bringup)
separately.

## Model source

The converted RM65 URDF and mesh assets originate from the RealManRobot model
repository:

https://gitee.com/RealManRobot/rm_models/tree/main/RM65
