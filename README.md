# RealMan RM65 ROS 2 Description

ROS 2 Humble description package and RViz 2 Docker environment for RealMan
RM65 robots.

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

Select another model with `RM65_MODEL`:

```bash
RM65_MODEL=RM65-6FB-V docker compose run --rm rm65_rviz
```

The standalone viewer uses `ROS_DOMAIN_ID=65` by default. Set the same domain
as an external ROS 2 graph when connecting to other nodes.

## Local ROS 2 build

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select rm65_description
source install/setup.bash
ros2 launch rm65_description display.launch.py
```

## Model source

The converted RM65 URDF and mesh assets originate from the RealManRobot model
repository:

https://gitee.com/RealManRobot/rm_models/tree/main/RM65
