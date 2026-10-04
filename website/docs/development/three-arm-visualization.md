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
- 两个 Web 查看器固定以中间臂 `m` 的基座为**显示原点和相机焦点**。这只是渲染坐标的平移；YAML 中的世界/TF 变换不会被改写。
- `settings.default_joint_position` 作为六个旋转关节的初始位置。
- 当前配置保存最近一次生产三臂 ChArUco 标定结果：左臂是布局参考；中、右臂的六自由度位姿来自同一次求解。重新标定后应将成功写回的 `three_robots.yaml` 提交，才能让 GitHub Pages 与生产布局一致。
- 生产 Web 控制台进入 `ACTIVE/keyboard` 时，会在 l/r URDF 上绘制当前已验证 WORK 坐标轴；坐标位姿来自驱动运行状态，失配或离开模式立即隐藏。

权威配置是 [`config/ros/three_robots.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/three_robots.yaml)。不要在 launch 文件、网页组件或 RViz 配置中复制布局数值。

## ROS 2 数据流

`src/rm65_description/launch/three_robots.launch.py` 读取配置并为每台机械臂创建：

1. 命名空间内的 `robot_state_publisher`；
2. 默认是命名空间内的 `joint_state_publisher` 或 GUI 版本；当 `use_driver_joint_states:=true` 时改由对应命名空间的 `realman_robot_driver` 提供 `/l|m|r/joint_states`；
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
config/ros/three_robots.yaml + config/ros/end_effectors.yaml
          │
          ├── 校验 l/m/r、命名空间、TF 前缀、型号和有限数值
          ├── 从 src/rm65_description 复制当前所需 URDF/STL
          ├── 复制夹爪 URDF/STL（end_effectors.yaml 的 mounts）
          └── 生成 three-robots.json
                         │
                         ▼
               RobotViewer.vue / Three.js
```

生成内容位于被 Git 忽略的 `website/docs/.vitepress/cache/public/`，不是第二份配置来源。生成的
`three-robots.json` 明确写入 `visualizationReferenceArm: "m"`；查看器加载每台配置模型（首页场景使用放松弯曲并缓慢摆动的待机姿态，而不是零位）后，统一减去中臂的平移，把中臂基座放在显示 `(0,0,0)`，再根据三台机械臂的组合边界设置距离。三台机械臂分别使用青绿、橙色和石墨色，便于区分命名空间。运行中的 Web 控制页面也采用同一显示约定，但其 ROS/TF 运动请求仍使用未平移的配置坐标。

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

## 末端夹爪与关节滑块

首页三维场景在每臂 `link_6` 上各挂一个 AG2F90-C 夹爪。挂载关系来自 [`config/ros/end_effectors.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/end_effectors.yaml)：`grippers` 定义夹爪（URDF、驱动关节、闭合/全开弧度），`mounts` 按 `l/m/r` 指定挂在哪个 link 以及 `xyz`（m）、`rpy`（rad，ZYX）。`website/scripts/sync-three-robots.mjs` 在构建时校验该文件，把夹爪 URDF 与网格复制到站点资源，并把 `grippers`、`endEffectors` 写入生成的 `three-robots.json`；`RobotViewer.vue` 据此把夹爪加载为对应 link 的子节点。夹爪模型细节见[Changingtek 夹爪控制](./gripper-control#ag2f90-c-夹爪模型)。

场景右下角的"关节控制"面板：

- 选 `L / M / R`，六个滑块控制该臂关节（范围取自 URDF 限位），"夹爪"滑块控制开合（`0%` 闭合、`100%` 全开）。
- 自动摆动时滑块实时跟随；拖动任一滑块，该臂（或夹爪）停止自由变化并保持用户设定的值，标签显示"手动"。"恢复自动摆动"让该臂的关节与夹爪重新自动运动。
- 这只是网页预览，不会连接真实机器人。

## 已知边界

- Web 查看器同步机器人布局和默认关节位置，不解析 `config/rviz/three_robots.rviz` 中的 RViz 相机视角。RViz 与 Three.js 的相机参数体系不同；网页的固定中臂居中不改变 RViz 或 TF。
- 修改 YAML 后，本地 RViz 需要重启对应 Compose 服务；Web 页面需要重新构建。推送到 `main` 后由 GitHub Pages 自动完成 Web 重建。
- 网页是 URDF 状态预览，不订阅正在运行的 ROS 2 `/tf` 或 `/joint_states`，因此不会实时跟随机械臂控制器。
- 上一条只适用于静态文档查看器。:8765 生产 Web 控制台订阅关节状态和坐标状态，并用运行时 WORK 位姿绘制键盘控制坐标轴。
