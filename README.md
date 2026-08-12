# RealMan RM65 ROS 2 Description

ROS 2 Humble description package and RViz 2 Docker environment for RealMan
RM65 robots.

## Documentation

Project documentation: https://qingtianrobot.github.io/realman_pi/

The VitePress source is stored in `website/` and deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml`.

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

The active desktop session must provide both `DISPLAY` and `XAUTHORITY`.

```bash
docker compose build rm65_rviz
docker compose run --rm rm65_rviz
```

### Unified bringup with an Xbox controller

`realman_bringup` starts the three-arm scene, RViz 2, the ROS 2
`game_controller_node`, and the C++ Xbox input node. The controller defaults to
the host's `/dev/input/event0`:

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

Press and release events are printed by `/input/xbox_controller`. Set
`REALMAN_JOY_DEVICE` when Linux exposes the controller at another path:

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
colcon build --symlink-install --packages-up-to realman_bringup
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
│   ├── driver/           C++ operator input packages
│   ├── realman_bringup/  Top-level launch orchestration
│   └── rm65_description/ Robot descriptions, TF, and RViz launch
└── website/              VitePress documentation site
```

The Xbox input and bringup contracts are documented in the
[Web developer manual](https://qingtianrobot.github.io/realman_pi/development/xbox-controller-bringup).

## Model source

The converted RM65 URDF and mesh assets originate from the RealManRobot model
repository:

https://gitee.com/RealManRobot/rm_models/tree/main/RM65
