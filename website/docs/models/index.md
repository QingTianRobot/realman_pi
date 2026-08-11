---
title: 支持型号
description: RM65-B、RM65-B-V、RM65-6F、RM65-6FB 与 RM65-6FB-V 的描述资源。
---

# 支持型号

仓库为每个型号保留独立 URDF 和 STL 目录。launch 文件只接受下表中的精确名称，默认值是 `RM65-B`。

## 型号矩阵

| 型号 | ROS link 数 | joint 数 | 额外相机 TF | URDF |
| --- | ---: | ---: | --- | --- |
| `RM65-B` | 8 | 7 | 无 | `urdf/RM65-B.urdf` |
| `RM65-B-V` | 10 | 9 | 有 | `urdf/RM65-B-V.urdf` |
| `RM65-6F` | 8 | 7 | 无 | `urdf/RM65-6F.urdf` |
| `RM65-6FB` | 8 | 7 | 无 | `urdf/RM65-6FB.urdf` |
| `RM65-6FB-V` | 10 | 9 | 有 | `urdf/RM65-6FB-V.urdf` |

计数包含 `world`、`base_link` 和固定关节 `world_to_base_link`。

## 公共机械臂链

所有型号都包含同一命名形式的主链：

```text
world
└── base_link
    └── link_1
        └── link_2
            └── link_3
                └── link_4
                    └── link_5
                        └── link_6
```

主链由一个固定关节和 `joint_1` 到 `joint_6` 六个旋转关节组成。每个 URDF 都包含对应型号的质量、惯量、关节限制、视觉网格和碰撞网格。

## 带 V 的型号

`RM65-B-V` 与 `RM65-6FB-V` 在 `link_6` 后增加两个固定连接：

```text
link_6
└── camera_rolink
    └── camera_link
```

对应关节名是 `camera_rojoint` 和 `camera_joint`。因此相机相关坐标系仍属于同一棵以 `world` 为根的 TF 树。

## 选择规则

Docker 使用环境变量：

```bash
RM65_MODEL=RM65-6F docker compose run --rm rm65_rviz
```

本地 launch 使用参数：

```bash
ros2 launch rm65_description display.launch.py model:=RM65-6F
```

型号名称区分大小写。选择型号只会更换 URDF；启动节点和 RViz 配置保持不变。
