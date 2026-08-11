---
title: 仓库与 ROS 图
description: realman_pi 的网站、Docker 环境、ROS 2 描述包和运行节点结构。
---

# 仓库与 ROS 图

仓库把运行环境、ROS 2 包和文档网站分开管理。前端依赖不会进入 ROS 工作空间，容器构建也不会安装网站依赖。

## 代码仓库结构

<div class="repo-tree">realman_pi/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Pages 自动部署
├── docker/
│   ├── ros2-humble-rviz.Dockerfile
│   └── ros_entrypoint.sh
├── src/
│   └── rm65_description/          # ROS 2 ament_cmake 包
│       ├── launch/
│       ├── meshes/
│       ├── rviz/
│       └── urdf/
├── website/                       # VitePress 文档站
│   ├── docs/
│   │   ├── .vitepress/
│   │   ├── architecture/
│   │   ├── guide/
│   │   ├── models/
│   │   └── troubleshooting.md
│   ├── package.json
│   └── playwright.config.ts
├── docker-compose.yml
└── README.md</div>

## ROS 2 包结构

| 路径 | 用途 |
| --- | --- |
| `launch/display.launch.py` | 校验型号并启动三个可视化节点 |
| `urdf/*.urdf` | 五个型号的机器人描述与完整 TF 关系 |
| `meshes/<model>/*.STL` | 每个 link 的视觉与碰撞网格 |
| `rviz/rm65.rviz` | Fixed Frame、视角、RobotModel 与 TF 配置 |
| `CMakeLists.txt` | 安装 launch、URDF、mesh 与 RViz 资源 |
| `package.xml` | Humble 运行依赖和 ament 包元数据 |

URDF 使用标准 ROS 包 URI 引用网格：

```xml
<mesh filename="package://rm65_description/meshes/RM65-B/link_1.STL" />
```

安装后由 ament 索引定位 `rm65_description` 的共享目录，因此工作空间可以放在任意绝对路径。

## 运行节点

```text
joint_state_publisher_gui ── /joint_states ──▶ robot_state_publisher
                                                     │
                                   /tf + /tf_static  │
                                                     ▼
                                                   rviz2

robot_state_publisher ── /robot_description ────────▶ rviz2
```

`display.launch.py` 在创建节点前读取所选 URDF，并把文本作为 `robot_description` 参数交给 `robot_state_publisher`。RViz 使用该描述加载相同的模型资源。

## Docker 边界

Compose 使用 host network 和 host IPC，并挂载两个只读/受限的显示资源：

| 主机资源 | 容器路径 | 模式 |
| --- | --- | --- |
| `/tmp/.X11-unix` | `/tmp/.X11-unix` | 读写 socket |
| `$XAUTHORITY` | `/tmp/.Xauthority` | 只读 |

容器默认设置 `ROS_DOMAIN_ID=65`、`QT_X11_NO_MITSHM=1` 和 `LIBGL_ALWAYS_SOFTWARE=1`，降低独立 RViz 查看器与其他 ROS 图或主机 OpenGL 驱动冲突的概率。
