---
title: 三臂配置驱动可视化
description: l、m、r 三台 RM65 在 ROS 2、RViz 2 和 GitHub Pages 中共享配置的数据流与验证方法。
---

# 三臂配置驱动可视化

该功能使用一份 YAML 同时定义左侧 `l`、中间 `m` 和右侧 `r` 三台机械臂的型号与世界位姿。ROS 2 运行环境根据它发布三组隔离的机器人状态和完整 TF；Web 构建根据同一配置生成 Three.js 场景。

## 功能契约

- 配置必须且只能包含 `l`、`m`、`r` 三台机械臂。
- 每台机械臂的 ROS 命名空间必须与 ID 相同，TF 前缀分别为 `l/`、`m/`、`r/`。
- 三台机械臂必须连接到同一个无前导斜杠的父坐标系，默认是 `world`。
- 位置单位为米，欧拉角单位为弧度；Web 与 ROS 2 使用相同的 `x/y/z/roll/pitch/yaw`。
- `settings.default_joint_position` 作为六个旋转关节的初始位置。
- 当前默认布局中，左右机械臂同向，中间机械臂使用 `yaw=pi` 反向。

权威配置是 [`config/ros/three_robots.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/three_robots.yaml)。不要在 launch 文件、网页组件或 RViz 配置中复制布局数值。

## ROS 2 数据流

`src/rm65_description/launch/three_robots.launch.py` 读取配置并为每台机械臂创建：

1. 命名空间内的 `robot_state_publisher`；
2. 命名空间内的 `joint_state_publisher` 或 GUI 版本；
3. 从父坐标系到 `<prefix>world` 的 `static_transform_publisher`。

默认 TF 结构为：

```text
world -> l/world -> l/base_link -> l/link_1 -> ... -> l/link_6
      -> m/world -> m/base_link -> m/link_1 -> ... -> m/link_6
      -> r/world -> r/base_link -> r/link_1 -> ... -> r/link_6
```

机器人内部连杆关系来自所选 URDF。`frame_prefix` 由 `robot_state_publisher` 添加，因此三组原始 URDF 可以使用相同的 link 名称而不会产生 TF 冲突。

## Web 构建数据流

`website/scripts/sync-three-robots.mjs` 在 `npm run dev` 和 `npm run build` 前执行：

```text
config/ros/three_robots.yaml
          │
          ├── 校验 l/m/r、命名空间、TF 前缀、型号和有限数值
          ├── 从 src/rm65_description 复制当前所需 URDF/STL
          └── 生成 three-robots.json
                         │
                         ▼
               RobotViewer.vue / Three.js
```

生成内容位于被 Git 忽略的 `website/docs/.vitepress/cache/public/`，不是第二份配置来源。查看器加载每台配置模型，应用世界变换与默认关节位置，再根据三台机械臂的组合边界调整相机。三台机械臂分别使用青绿、橙色和石墨色，便于区分命名空间。

GitHub Pages 工作流监听 YAML、URDF、mesh 和网站文件。推送这些路径的变化会重新构建页面，因此线上模型会反映最新提交。

## 运行与验证

启动 Docker RViz 2 三臂场景：

```bash
docker compose build rm65_three_rviz
docker compose run --rm rm65_three_rviz
```

验证 Web 构建和桌面/移动端场景：

```bash
cd website
npm ci
npm run build
npm run test:e2e
```

端到端测试会检查三台模型完成加载、画布非空且持续渲染、页面无横向溢出，并把生成 JSON 中的型号、命名空间、TF 前缀、父坐标系、位姿和默认关节角与权威 YAML 逐项比较。

## 已知边界

- Web 查看器同步机器人布局和默认关节位置，不解析 `config/rviz/three_robots.rviz` 中的 RViz 相机视角。RViz 与 Three.js 的相机参数体系不同。
- 修改 YAML 后，本地 RViz 需要重启对应 Compose 服务；Web 页面需要重新构建。推送到 `main` 后由 GitHub Pages 自动完成 Web 重建。
- 网页是 URDF 状态预览，不订阅正在运行的 ROS 2 `/tf` 或 `/joint_states`，因此不会实时跟随机械臂控制器。
