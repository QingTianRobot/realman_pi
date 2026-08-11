---
title: 完整 TF 树
description: RM65 描述包中 world、机械臂连杆和相机坐标系的连接关系。
---

# 完整 TF 树

每个 URDF 都显式声明 `world`，并通过固定关节连接 `base_link`。这让 RViz 的 Fixed Frame 可以稳定设置为 `world`，也避免独立查看模型时出现多个不相连的 TF 子树。

## RM65-B 主链

<div class="tf-tree-doc">
  <div class="tf-rail" aria-label="RM65 主 TF 树">
    <span class="tf-node root">world</span><span class="tf-arrow"></span>
    <span class="tf-node">base_link</span><span class="tf-arrow"></span>
    <span class="tf-node">link_1</span><span class="tf-arrow"></span>
    <span class="tf-node">link_2</span><span class="tf-arrow"></span>
    <span class="tf-node">link_3</span><span class="tf-arrow"></span>
    <span class="tf-node">link_4</span><span class="tf-arrow"></span>
    <span class="tf-node">link_5</span><span class="tf-arrow"></span>
    <span class="tf-node">link_6</span>
  </div>
</div>

| 父坐标系 | 关节 | 类型 | 子坐标系 |
| --- | --- | --- | --- |
| `world` | `world_to_base_link` | fixed | `base_link` |
| `base_link` | `joint_1` | revolute | `link_1` |
| `link_1` | `joint_2` | revolute | `link_2` |
| `link_2` | `joint_3` | revolute | `link_3` |
| `link_3` | `joint_4` | revolute | `link_4` |
| `link_4` | `joint_5` | revolute | `link_5` |
| `link_5` | `joint_6` | revolute | `link_6` |

## 相机分支

带 `-V` 后缀的型号继续从末端连接相机坐标系：

| 父坐标系 | 关节 | 类型 | 子坐标系 |
| --- | --- | --- | --- |
| `link_6` | `camera_rojoint` | fixed | `camera_rolink` |
| `camera_rolink` | `camera_joint` | fixed | `camera_link` |

这两个关节是固定关节，不需要 `joint_state_publisher_gui` 提供状态。

## 运行时检查

检查根坐标系到末端的变换：

```bash
ros2 run tf2_ros tf2_echo world link_6
```

带相机的型号可以检查：

```bash
ros2 run tf2_ros tf2_echo world camera_link
```

安装 `tf2_tools` 后可以生成整棵树的报告：

```bash
ros2 run tf2_tools view_frames
```

RViz 配置已经将 Fixed Frame 设置为 `world`，并启用了 TF 与 RobotModel 显示项。
