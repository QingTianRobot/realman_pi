---
title: 测试与验证
description: 各组件的测试位置、运行方式、哪些测试需要 ROS/Docker，以及合并和上线前的验证清单。
---

# 测试与验证

本仓库**没有 ROS 测试的 CI**：`.github/workflows/` 里只有 GitHub Pages 的文档构建与发布。ROS 与硬件相关的测试必须由开发者在 Humble 环境（通常是项目 Docker 镜像）里运行，**提交前自己跑完下面对应的那一行**，并在提交说明里写清楚跑了什么、没跑什么。

## 测试矩阵

| 组件 | 测试位置 | 框架 | 运行环境 |
| --- | --- | --- | --- |
| `realman_robot_driver` | `src/driver/realman_robot_driver/test/` | pytest | Humble（mock SDK，不连真机） |
| `realman_msgs` | `src/driver/realman_msgs/test/` | pytest | Humble |
| `realman_web_control` | `src/driver/realman_web_control/test/` | pytest | Humble |
| 网页前端 | `website/tests/web-control/` | Playwright | 宿主机 Node（`npm run test:web-control`） |
| `realman_bt`（C++） | `src/behavior/realman_bt/test/test_*.cpp` | gtest / ament | Humble + colcon |
| `realman_bt`（树契约、router、launch） | `src/behavior/realman_bt/test/test_*.py` | pytest | Humble |
| `realman_bt_mock` | `src/behavior/realman_bt_mock/test/` | pytest | Humble |
| 行为树启动器 / 容器入口 / `./rm65` | `scripts/test_bt_*.sh`、`tests/*.sh`、`tests/test_bt_*.py` | bash / unittest | 宿主机（`RM65_DRY_RUN=1`，不启动容器） |
| `gripper_ros2` | `src/gripper/gripper_ros2/test/` | pytest | Humble（假串口） |
| `policy_bridge` | `src/policy_bridge/test/` | pytest | Humble 或装有依赖的 Python |
| `realman_camera_calibration` | `src/sensor/realman_camera_calibration/test/` | pytest | Humble |
| `realman_bringup` launch | `src/realman_bringup/test/` | pytest | Humble |
| `tools/velocity_follow` | `tools/velocity_follow/tests/` | pytest | 任意 Python（不依赖 ROS） |
| 文档站 | `website/tests/*.spec.ts` | Playwright | 宿主机 Node（`npm run test:e2e`） |

## 常用命令

**驱动 / Action 回归**（容器内，不连接真实控制器）：

```bash
docker compose build realman_driver_test
docker compose run --rm --no-deps realman_driver_test bash -lc '
  source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash
  cd /opt/rm65_ws
  PYTHONPATH=/opt/rm65_ws/src/driver/realman_robot_driver \
    python3 -m pytest -q src/driver/realman_msgs/test src/driver/realman_robot_driver/test
'
```

镜像构建阶段已经跑过 colcon 测试；完整包级结果用 `colcon test --packages-select realman_msgs realman_robot_driver realman_bringup && colcon test-result --verbose`。逐项用例清单见[Action 开发与测试](./realman-action-development#关键用例清单)。

**行为树**（无硬件）：

```bash
./rm65 bt-test all                       # 树契约 + mock 场景
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
bash tests/test_bt_bringup_detection.sh
bash tests/test_rm65_entry.sh            # ./rm65 的 dry-run 输出契约
python3 -m unittest discover -s tests -p test_bt_runtime_result.py
```

C++ 节点或生命周期变化时，还需 `./rm65 bt-test build`（`colcon build --packages-up-to realman_bt realman_bt_mock realman_msgs`）并运行 `realman_bt` 的 ctest。

**Web 控制 / 标定 / 夹爪**：

```bash
PYTHONPATH=src/driver/realman_web_control python3 -m pytest -q src/driver/realman_web_control/test
PYTHONPATH=src/sensor/realman_camera_calibration python3 -m pytest -q src/sensor/realman_camera_calibration/test
cd website && npm run build:web-control && npm run test:web-control
```

**策略桥**：`cd src/policy_bridge && PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTHONPATH=".:$PYTHONPATH" python3 -m pytest test/ -q`。

**速度跟随工具**：`cd tools/velocity_follow && PYTHONPATH=. python3 -m pytest tests -q`。

**文档站**：

```bash
cd website
npm ci
npm run build          # 同步三臂模型资源并构建；链接失效会让构建失败
npm run test:e2e       # 路由渲染、首页 3D 场景、表格布局、startup-entries 与 functions.zsh 的一致性
```

## 提交前检查清单

按改动类型勾选；任何一项没运行，都要在说明里写明原因：

- **启动行为**（`rm65`、Compose、`functions.zsh`）：`bash -n rm65`、`zsh -n functions.zsh`、`docker compose -f docker-compose.yml config --quiet`、`bash tests/test_rm65_entry.sh`。
- **ROS 节点 / launch / 日志**：遵守 `ros2-logging-conventions`；跑对应包的 pytest；改 launch 参数同时更新 `test_system_launch.py`。
- **配置**：只改根 `config/`，补注释；确认 router 对超限配置会拒绝启动而不是运行时才失败。
- **接口（Action/Service/Topic/msg）**：更新 [ROS 2 接口总表](../reference/ros-interfaces) 和专题页；`realman_msgs/test/test_interface_files.py` 通过。
- **文档**：`cd website && npm run build && npm run test:e2e`。

## 真机验证不是测试

mock 测试证明 ROS 协议、状态机和失败路径，**不证明**真实控制器行为、固件兼容性或现场安全。真机放行按[驱动页的运行门槛](./realman-driver-scaffold#真机运行门槛)逐级执行；Pika / 键盘速度相关改动还要按[Pika 遥操作](./pika-teleop)与[行为树 Demo](./behavior-tree-motion#真机执行)的顺序低速验证。默认保持 `REALMAN_BT_DRY_RUN=true`。
