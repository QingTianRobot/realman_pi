---
title: 启动入口索引
description: functions.zsh 中每个项目启动、构建、测试和部署入口的当前用途、组件范围和权威配置。
---

# 启动入口索引

本页同步根目录 `functions.zsh` 的当前入口，面向需要选择启动方式、定位组件边界或维护 GitHub Pages 文档的开发者。这里记录**当前 main 分支的有效行为**，不按 commit 追加历史说明；每次修改 helper、Compose 服务、launch 参数或运行配置时，应在同一次提交中更新本页、`rm65_project_help` 和相关专题页。

::: tip 时效性
`functions.zsh` 只是快捷入口。最终行为以根目录 `config/`、ROS 2 launch 文件和 Compose 服务为准。本页优先链接到权威专题页，避免复制容易过期的参数细节。
:::

## 使用方式

```zsh
source /path/to/realman_pi/functions.zsh
rm65_project_help
```

所有 helper 都从 `functions.zsh` 所在位置定位仓库根目录，因此可以在任意目录调用。函数不会自动写入 `~/.zshrc`，也不会隐藏底层 Docker、colcon、npm、SSH 命令；遇到未覆盖的参数时，继续直接调用底层命令。

## 项目入口

| 函数 | 当前用途 | 适用场景 | 权威来源 |
| --- | --- | --- | --- |
| `rm65_project_cd` | 切回仓库根目录。 | 在多个终端目录之间切换后，快速回到 `realman_pi` 执行 Compose、colcon 或网站命令。 | `functions.zsh` 中的 `RM65_PROJECT_ROOT` |
| `rm65_project_help` | 打印分组后的 helper 索引，并指向本页。 | 忘记入口名称或需要快速判断哪个服务适合当前任务时先运行。 | `functions.zsh` 本身与本页 |

## Docker 构建和模型查看

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_build [service ...]` | 从仓库根目录构建一个或多个 Compose 服务；不传参数时构建 `realman_bringup`。 | 只执行 Docker build，不启动 ROS 图。 | 首次运行、Dockerfile/依赖变化后，或切换镜像源后。 | `config/docker/compose.yaml`、`config/docker/ros2-humble-rviz.Dockerfile`、[系统 Bringup](./system-bringup#国内镜像与官方源切换) |
| `rm65_docker_rviz [model]` | 前台启动单臂 RViz 查看器，默认型号为 `RM65-B` 或当前 `RM65_MODEL`。 | `rm65_description/display.launch.py`、`rviz2`、单台 URDF/TF。 | 只检查某个 RM65 型号的 URDF、网格和关节树，不需要三臂布局。 | `src/rm65_description/urdf/`、[支持型号](../models/) |
| `rm65_docker_three_rviz` | 前台启动三臂 RViz 场景。 | `three_robots.launch.py`、三组 `/l` `/m` `/r` 描述、TF 和 RViz。 | 验证 `three_robots.yaml` 中三台机械臂的位置、朝向、命名空间和 TF 前缀。 | `config/ros/three_robots.yaml`、[三臂配置驱动可视化](./three-arm-visualization) |

## 独立测试入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_xbox_test` | 前台启动独立 Xbox 输入测试。 | SDL `game_controller_node`、`/input/joy`、`xbox_controller_node`；不启动三臂、驱动或 RViz。 | 先确认实体手柄、Linux input 权限、SDL 映射和按键边沿日志是否正常。 | `config/ros/xbox_controller.yaml`、[Xbox 手柄输入](./xbox-controller#独立实体手柄测试) |
| `rm65_docker_driver_test` | 前台启动三臂 mock 驱动测试。 | `/l` `/m` `/r` 三个 `realman_driver` mock 实例；不访问真实控制器。 | 没有机械臂时验证 ROS topic/service、mock 连接和关节状态发布。 | `config/ros/realman_driver_mock.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold#独立启动) |
| `rm65_docker_driver_rviz` | 前台启动真实三臂驱动和 RViz。 | 三台真实 `realman_driver`、三臂描述/TF、RViz；不启动 Joy 或 Xbox 输入。 | 已连接控制器网络时，只观察真实关节回读和模型姿态，不引入操作输入。 | `config/ros/realman_driver.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold) |

## Bringup 固定入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup` | 前台启动完整本地系统。 | 三臂描述/TF、真实驱动、RViz、SDL Joy、Xbox 输入；等待实体手柄。 | 本机同时连接显示环境、控制器网络和实体 Xbox 手柄时的完整联调。 | `config/docker/compose.yaml`、[系统 Bringup](./system-bringup#docker-服务) |
| `rm65_docker_bringup_remote` | 前台启动 headless 远程目标。 | 三臂描述/TF、真实驱动、Xbox 处理节点；不启动 Joy 设备读取和 RViz，可选 Web 控制。 | 工控机作为 ROS 图和真实 SDK 连接的运行端，桌面机另行启动远程 RViz。 | `realman_bringup_remote` 服务、[系统 Bringup](./system-bringup#远程验证) |

## Bringup 配置入口

`realman_bringup_custom` 把 `.env` 中的开关透传给 `realman_bringup/system.launch.py`。这些函数用于快速切换当前有效组合；每个 profile 都在子 shell 中设置变量，执行结束后不会污染当前终端环境。

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup_custom` | 前台运行 `.env` 参数化 bringup。 | 按 `REALMAN_START_*`、`REALMAN_USE_*` 和 `REALMAN_*_CONFIG_FILE` 创建组件。 | 需要试验 launch 组合，但不想编辑 Compose 文件时。 | `.env`、`config/docker/compose.yaml`、[系统 Bringup：参数化组合](./system-bringup#参数化组合) |
| `rm65_docker_bringup_custom_start` | 后台启动 `.env` 参数化 bringup 并打印服务状态。 | `docker compose up -d realman_bringup_custom`。 | 需要让组合在终端返回后继续运行，并通过 status/logs 管理生命周期。 | `realman_bringup_custom` 服务 |
| `rm65_docker_bringup_custom_stop` | 停止后台参数化 bringup。 | `docker compose stop realman_bringup_custom`。 | 结束后台 ROS 图；不会删除镜像或修改配置。 | `realman_bringup_custom` 服务 |
| `rm65_docker_bringup_custom_status` | 查看后台参数化 bringup 状态。 | `docker compose ps realman_bringup_custom`。 | 判断容器是否仍在运行。 | Docker Compose |
| `rm65_docker_bringup_custom_logs [-f]` | 查看最近 100 行或持续跟踪参数化 bringup 日志。 | `docker compose logs --tail=100 ... realman_bringup_custom`。 | 排查 launch、驱动、Web 控制或 DDS 连接问题；`-f` 只跟踪日志，不停止服务。 | Docker Compose 与 ROS 日志 |
| `rm65_docker_bringup_custom_args launch_arg:=value ...` | 临时把 launch 参数直接交给 `system.launch.py`。 | 使用图形版服务的挂载和设备配置，但不读取 `.env` profile。 | 一次性验证 `start_driver:=false use_rviz:=true` 等组合，不想改 `.env`。 | `realman_bringup/system.launch.py`、[系统 Bringup：启动入口](./system-bringup#启动入口) |

## Bringup profiles

| 函数 | 当前用途 | 组件组合 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup_model` | 只显示配置中的机器人模型。 | `start_robots=true`、`start_driver=false`、`use_rviz=true`、输入和 Web 关闭。 | 离线检查三臂模型、TF 和 RViz，不连接真实机械臂。 | `config/ros/three_robots.yaml`、[三臂配置驱动可视化](./three-arm-visualization) |
| `rm65_docker_bringup_hardware` | 连接真实驱动并显示 RViz，不启用输入。 | `start_robots=true`、`start_driver=true`、`use_rviz=true`、Joy/Xbox/Web 关闭。 | 已接入控制器网络时，先验证真实关节回读与 RViz 显示。 | `config/ros/realman_driver.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold) |
| `rm65_docker_bringup_headless` | 启动真实驱动和 Xbox 处理节点，不显示 GUI。 | `start_robots=true`、`start_driver=true`、`start_controller=true`、`use_rviz=false`、Joy/Web 关闭。 | 远程主机上运行 headless ROS 图，并允许其他节点发布 `/input/joy`。 | [系统 Bringup](./system-bringup#典型启动组合) |
| `rm65_docker_bringup_input` | 只启动 Joy 和 Xbox 输入链。 | `start_robots=false`、`start_driver=false`、`start_joy_driver=true`、`start_controller=true`，等待设备。 | 独立验证实体手柄输入，不触碰机械臂或 RViz。 | `config/ros/xbox_controller.yaml`、[Xbox 手柄输入](./xbox-controller) |
| `rm65_docker_bringup_web` | 启动真实驱动和 Web 控制，不显示 RViz。 | `start_robots=true`、`start_driver=true`、`start_web_control=true`、RViz/Joy/Xbox 关闭。 | 工控机上提供浏览器 Action 控制和 URDF 状态影子。 | `config/ros/realman_web_control.yaml`、[WebSocket 浏览器控制与 URDF 影子](./realman-web-control) |

## Web 控制入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_web_control` | 前台启动独立 Web 控制服务。 | `realman_web_control/web_control.launch.py`；加入已有 ROS 图，但不启动驱动。 | 已有 `realman_bringup_remote` 或其他驱动图运行时，单独观察 WebSocket 协议和页面日志。 | `config/ros/realman_web_control.yaml`、[WebSocket 浏览器控制与 URDF 影子](./realman-web-control) |
| `rm65_docker_web_control_start` | 后台启动独立 Web 控制服务并打印状态。 | `docker compose up -d realman_web_control`。 | 工控机长期提供 `http://<host>:8765/` 浏览器入口。 | `realman_web_control` Compose 服务 |
| `rm65_docker_web_control_stop` | 停止后台 Web 控制服务。 | `docker compose stop realman_web_control`。 | 关闭浏览器控制桥；不停止真实驱动容器。 | Docker Compose |
| `rm65_docker_web_control_status` | 查看 Web 控制服务状态。 | `docker compose ps realman_web_control`。 | 判断 Web 服务是否仍在后台运行。 | Docker Compose |
| `rm65_docker_web_control_logs [-f]` | 查看或跟踪 Web 控制服务日志。 | `docker compose logs --tail=100 ... realman_web_control`。 | 排查 WebSocket、Action client、URDF 资源或授权配置。 | Docker Compose 与 `realman_web_control` 日志 |
| `rm65_web_control_url [host]` | 打印浏览器控制台 URL。 | 不启动服务，只根据 host 和 `REALMAN_WEB_CONTROL_PORT` 输出 `http://host:port/`。 | 启动 Web 控制后，把正确地址复制给同网段开发机浏览器。 | `config/ros/realman_web_control.yaml` 中的端口配置 |

## 远程 RViz 入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_remote_rviz [domain]` | 前台启动 RViz-only 远程查看器。 | `remote_rviz.launch.py` 和 `rviz2`；不启动本地 driver、robot_state_publisher 或假关节状态源。 | 首次排查远程 DDS、X11 授权或 RViz 配置时，保留终端日志。 | [快速开始：远程 RViz 函数详解](../guide/getting-started#远程-rviz-函数详解) |
| `rm65_docker_remote_rviz_start [domain]` | 后台启动 RViz-only 远程查看器并打印状态。 | `docker compose up -d realman_remote_rviz`。 | 日常在桌面机持续观察工控机 `realman_bringup_remote` 发布的三臂状态。 | `realman_remote_rviz` Compose 服务 |
| `rm65_docker_remote_rviz_stop` | 停止后台远程 RViz。 | `docker compose stop realman_remote_rviz`。 | 关闭桌面机 RViz-only 服务，不影响工控机驱动和机械臂。 | Docker Compose |
| `rm65_docker_remote_rviz_status` | 查看后台远程 RViz 状态。 | `docker compose ps realman_remote_rviz`。 | 确认 RViz 容器是否仍在运行。 | Docker Compose |
| `rm65_docker_remote_rviz_logs [-f]` | 查看或跟踪远程 RViz 日志。 | `docker compose logs --tail=100 ... realman_remote_rviz`。 | 排查 DDS 发现、TF、joint state 或显示授权问题。 | Docker Compose、[故障排查](../troubleshooting) |

## 本机构建、网站和部署入口

| 函数 | 当前用途 | 影响范围 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_ros_build [args ...]` | 加载本机 ROS 2 Humble 后执行 `colcon build --symlink-install --packages-up-to realman_bringup realman_robot_driver`。 | 本机 `install/`、`build/`、`log/`。 | 不使用 Docker 时构建 ROS 包，或给 `colcon` 追加调试参数。 | `src/` 下 ROS packages、[系统 Bringup：构建与验证](./system-bringup#构建与验证) |
| `rm65_web_build` | 在 `website/` 中构建 VitePress 网站。 | 先同步三臂模型资源，再输出 `website/docs/.vitepress/dist`。 | push 前确认开发者手册、模型资源和 GitHub Pages 构建不会失败。 | `website/package.json`、`website/scripts/sync-three-robots.mjs` |
| `rm65_web_test` | 在 `website/` 中运行 Playwright 网站测试。 | 桌面和移动端文档路由、首页 WebGL 场景和生成 JSON。 | 修改网站页面、导航、生成资源或 docs 结构后。 | `website/tests/`、`config/website/playwright.config.mjs` |
| `rm65_deploy_sync` | 本地 `main` 提交并 `git push origin main` 后，用 `rsync` 同步当前干净工作树到生产主机。 | 更新生产目录文件；排除 `.git/`、构建产物、日志、Node 依赖、测试结果和 Python 缓存；不自动重建或重启容器。 | GitHub 已有最新提交，但生产主机拉取 GitHub 不稳定或希望以本地文件为同步源时。 | `REALMAN_PRODUCTION_HOST`、`REALMAN_PRODUCTION_DIR`、[系统 Bringup：生产端代码部署](./system-bringup#生产端代码部署) |
| `rm65_deploy_update` | 兼容入口：通过 SSH 到生产主机执行 `git fetch origin main` 和 `git merge --ff-only origin/main`。 | 更新生产端 Git checkout 元数据和文件；不自动重建或重启容器。 | 生产主机可稳定访问 GitHub，且需要让远端 checkout 的 `main` 快进到 `origin/main` 时。 | `REALMAN_PRODUCTION_HOST`、`REALMAN_PRODUCTION_DIR`、[系统 Bringup：生产端代码部署](./system-bringup#生产端代码部署) |

## 维护规则

- 修改 `functions.zsh` 新增、重命名或删除入口时，同步更新本页、`rm65_project_help`、`website/docs/development/index.md` 和 `website/tests/site.spec.ts` 路由列表。
- 修改 Compose 服务、launch 参数或 `.env` 变量时，优先更新对应专题页，再让本页链接到新的权威说明。
- 不把真实 token、临时 IP、现场 SSH 密钥或未验证的真机行为写入文档。真实硬件行为应标明验证状态。
- 运行文档验证：

```bash
cd website
npm run build
npm run test:e2e
```
