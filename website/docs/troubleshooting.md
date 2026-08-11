---
title: 故障排查
description: 排查 Docker 中 RViz 2、Qt xcb、X11 授权、TF 和型号选择问题。
---

# 故障排查

## Qt 无法连接 display

典型日志如下：

```text
Authorization required, but no authorization protocol specified
qt.qpa.xcb: could not connect to display :0
Could not load the Qt platform plugin "xcb"
```

这组信息通常表示 Qt 已经找到 `xcb` 插件，但容器没有获得当前桌面的 X11 授权，并不代表需要重新安装 Qt。

先在启动 Compose 的同一个终端检查：

```bash
printf 'DISPLAY=%s\nXAUTHORITY=%s\n' "$DISPLAY" "$XAUTHORITY"
test -S /tmp/.X11-unix/X0 && echo "X11 socket exists"
test -r "$XAUTHORITY" && echo "Xauthority is readable"
```

如果是 Xorg 且 `XAUTHORITY` 为空：

```bash
export DISPLAY=:0
export XAUTHORITY="$HOME/.Xauthority"
docker compose run --rm rm65_rviz
```

Wayland 桌面需要启用 XWayland，并使用桌面会话实际提供的 `DISPLAY` 和 `XAUTHORITY`。不要在 SSH 登录或未继承图形会话变量的 shell 中直接启动 GUI 容器。

::: danger
不建议使用 `xhost +`。它会放宽整个 X server 的访问控制；当前 Compose 已支持通过 Xauthority cookie 做精确授权。
:::

## RViz 进程退出，代码为 -6

如果退出前紧邻 `xcb`、`could not connect to display` 或授权错误，先解决上一节的 X11 问题。RViz 和关节状态 GUI 都依赖同一套 Qt 显示连接，通常会一起退出。

如果显示授权正常，保留默认的软件渲染设置再启动：

```bash
LIBGL_ALWAYS_SOFTWARE=1 docker compose run --rm rm65_rviz
```

## Compose 提示 XAUTHORITY 未设置

Compose 文件主动要求该变量，避免容器在没有授权文件时静默启动：

```text
XAUTHORITY must point to the active X11 authority file
```

普通 Xorg 会话可以设置：

```bash
export XAUTHORITY="$HOME/.Xauthority"
```

设置前确认文件存在。某些桌面管理器会把授权文件放在 `/run/user/<uid>/` 下，此时应保留桌面会话已经给出的路径。

## 型号不受支持

型号名称必须和 URDF 文件名一致：

```text
Unsupported RM65 model '...'. Choose one of: ...
```

使用[型号列表](/models/)中的值，并注意大小写和连字符。

## RobotModel 可见但 TF 不完整

先确认当前终端和容器使用同一个 ROS 域：

```bash
echo "$ROS_DOMAIN_ID"
```

独立容器默认是域 `65`。连接外部节点时应显式传入对应值：

```bash
ROS_DOMAIN_ID=0 docker compose run --rm rm65_rviz
```

然后检查末端变换：

```bash
ros2 run tf2_ros tf2_echo world link_6
```

## 网格无法加载

URDF 中的 `package://rm65_description/...` 路径依赖 ament 索引。进行本地构建后必须 source 当前工作空间：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select rm65_description
source install/setup.bash
ros2 launch rm65_description display.launch.py
```

如果跳过 `source install/setup.bash`，RViz 可能无法解析包共享目录中的 STL 文件。
