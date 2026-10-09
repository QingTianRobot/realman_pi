---
title: 远程 RViz
description: 在笔记本或桌面机上显示生产机的 ROS 图：RViz-only 服务、函数用法、生命周期和常见问题。
---

# 远程 RViz

真实机械臂驱动运行在连接工业交换机的工控机上（`realman_bringup_remote`，headless、自动重启）。需要图形界面时，让桌面机只运行 RViz-only 的 `realman_remote_rviz`，并使用**同一个** `ROS_DOMAIN_ID`。桌面机**不能**使用 `realman_driver_rviz` 去直接连接 `192.168.30.x` 控制器——那会产生重复驱动。

## 在本机显示远程机械臂

如果真实驱动运行在另一台工控机，而 RViz 要显示在当前桌面机上，请让工控机只运行
`realman_bringup_remote`，当前桌面机运行 RViz-only 服务。两端需要使用同一个未占用的
ROS domain；推荐在两端仓库根目录 `.env` 中写同一个 `ROS_DOMAIN_ID`。

工控机：

```bash
docker compose up -d realman_bringup_remote
```

`realman_bringup_remote` 是无 GUI 的生产端 ROS 图，Compose 配置会让它在主机重启、
Docker daemon 重启或异常退出后自动恢复。只有显式执行
`docker compose stop realman_bringup_remote` 时，Docker 才会把它视为人工停止。

当前桌面机：

```bash
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_remote_rviz
rm65_docker_remote_rviz_start
rm65_docker_remote_rviz_status
```

`rm65_docker_remote_rviz_start` 会从当前桌面会话读取 `DISPLAY` 和 `XAUTHORITY`，在 GNOME
Wayland 下也会查找 `.mutter-Xwaylandauth.*`。命令返回后容器和 RViz 窗口继续运行；查看日志
或停止时使用：

```zsh
rm65_docker_remote_rviz_logs -f
rm65_docker_remote_rviz_stop
```

需要让日志留在当前终端并在 `Ctrl-C` 时同时停止 RViz，可改用前台命令
`rm65_docker_remote_rviz`。参数缺省时函数使用当前环境或 `.env` 中的 `ROS_DOMAIN_ID`；
仍可用 `rm65_docker_remote_rviz 42` 做一次性临时覆盖。

该服务只启动 RViz 2，不连接机械臂、不启动 `robot_state_publisher`，也不发布假关节状态。
桌面机和工控机需要在可互通并允许 DDS UDP/组播的网络中；如果连接经过 NAT 或 VPN 不支持
组播，应改用 DDS discovery server 或在工控机上运行 RViz。

## 远程 RViz 函数详解

下面的函数只在有图形桌面的笔记本上运行。真实机械臂驱动仍应在连接工业交换机的工控机上
运行 `realman_bringup_remote`；笔记本不能使用 `realman_driver_rviz` 去直接连接
`192.168.30.x` 控制器。所有函数的可选 `domain` 参数必须与工控机一致，取值范围是 `0` 到
`232`；省略时使用当前环境或 `.env` 中的 `ROS_DOMAIN_ID`。

| 函数 | 使用方式 | 生命周期和适用场景 |
| --- | --- | --- |
| `rm65_docker_build` | `rm65_docker_build realman_remote_rviz` | 首次使用或代码更新后构建 RViz 镜像；不会启动节点。 |
| `rm65_docker_remote_rviz_start` | `rm65_docker_remote_rviz_start` | 后台启动 `realman_remote_rviz`；命令返回后 RViz 窗口和容器继续运行，适合日常使用。 |
| `rm65_docker_remote_rviz` | `rm65_docker_remote_rviz` | 前台启动；当前终端持续显示 launch 日志，关闭窗口或按 `Ctrl-C` 停止。适合首次排错。 |
| `rm65_docker_remote_rviz_status` | `rm65_docker_remote_rviz_status` | 只查看 Compose 服务状态，不改变运行状态。看到 `Up` 才表示容器仍在运行。 |
| `rm65_docker_remote_rviz_logs` | `rm65_docker_remote_rviz_logs` 或 `rm65_docker_remote_rviz_logs -f` | 查看最近 100 行日志；`-f` 持续跟踪日志，按 `Ctrl-C` 只退出跟踪，不停止 RViz。 |
| `rm65_docker_remote_rviz_stop` | `rm65_docker_remote_rviz_stop` | 停止笔记本上的 RViz-only 服务，不停止工控机驱动和机械臂。 |

推荐的笔记本操作顺序如下：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_remote_rviz  # 第一次或代码更新后执行
rm65_docker_remote_rviz_start
rm65_docker_remote_rviz_status
```

后台服务不会因为关闭当前终端而停止，但目前没有配置开机自动重启；电脑或 Docker 服务重启
后需要再次执行 `rm65_docker_remote_rviz_start`。函数会自动读取 `DISPLAY` 和
`XAUTHORITY`，并兼容 GNOME Wayland 的 `.mutter-Xwaylandauth.*` 文件。

常见问题的判断方式：

| 现象 | 检查方向 |
| --- | --- |
| `no readable Xauthority file` | 从当前图形桌面终端加载 `functions.zsh`，确认 `DISPLAY` 和 `XAUTHORITY` 指向当前会话。 |
| RViz 窗口出现但没有 `/l`、`/m`、`/r` 数据 | 工控机和笔记本的 `ROS_DOMAIN_ID` 是否相同，且两端 `ROS_LOCALHOST_ONLY=0`、DDS UDP/组播未被防火墙阻断。 |
| `socket connect err` 或 `invalid robot handle` 出现在笔记本 | 误用了 `realman_driver_rviz`；笔记本应使用 `realman_remote_rviz`，SDK 连接只在工控机完成。 |
| `permission denied while trying to connect to the Docker API` | 当前用户没有 Docker socket 权限；先修复 Docker 用户组或使用有权限的终端，再重试函数。 |
