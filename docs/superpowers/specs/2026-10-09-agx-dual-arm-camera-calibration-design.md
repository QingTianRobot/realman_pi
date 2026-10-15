# AGX 双臂 ChArUco 相机标定设计

## 目标

将 `realman_camera_calibration` 的可验证采样、手眼求解、结果持久化逻辑移植到
`sl-arm` 的 `agx_arm_ws`。系统包含两台腕部相机和一台固定全局相机，使用既有
CC200-15-11.25 ChArUco 标定板。标定过程不移动机械臂、不自动发布或写入外参 TF。

成功条件：采样服务只接受三个相机均检测到标定板且 TF/时间戳有效的一批图像；
求解输出左右 `tcp_link -> camera` 与左臂基座 `base_link -> global_camera`，并以
残差和离散度拒绝不可靠结果。

## ROS 接口

相机话题固定为：

- `/camera/left/color/image_raw`、`/camera/left/color/camera_info`
- `/camera/right/color/image_raw`、`/camera/right/color/camera_info`
- `/camera/global/color/image_raw`、`/camera/global/color/camera_info`

运行时先验证 TF 帧；计划使用 `left/base_link -> left/tcp_link` 与
`right/base_link -> right/tcp_link`。相机光学帧写入配置，但本次不依赖相机驱动
自动发布的相机外参。

在 `agx_arm_msgs` 新增与现有 RealMan 等价的 `CaptureCalibrationSample.srv` 和
`SolveCalibration.srv`，服务名保持 `/camera_calibration/capture_sample` 与
`/camera_calibration/solve`。服务仅采样/求解；不会控制机械臂。

## 计算流程

每次 capture 原子性地读取三路最新图像和 CameraInfo，检测 ChArUco，并为左右臂
在对应图像时间戳读取 `base_link -> tcp_link`。若任一路缺失、过期、板不可见、TF
不可用或三路时间偏差过大，整批拒绝且不写入可求解样本。

solve 对左右腕部分别调用 OpenCV `calibrateHandEye(TSAI)`，产生 `tool_to_camera`。
用每个样本计算 `base_to_board = base_to_tool * tool_to_camera * board_to_camera`，并以
均值位置/旋转离散度验证标定板在世界中静止。

全局相机不使用 eye-in-hand 算法。由于它同时观测同一块静止标定板，其左臂基座
外参由已验证的左臂 `base_to_board` 与全局观测 `board_to_global_camera` 直接得到：
`base_to_global_camera = base_to_board * board_to_global_camera`。多个有效批次须通过
同样的位置/旋转离散度门限；右臂可作为独立一致性校验。

结果写入会话目录的 JSON/PNG/预览图，不修改机器人或静态 TF 配置。用户审核
`calibration_result.json` 后，后续单独决定是否应用外参。

## 配置

新包提供 YAML：标定板参数沿用 `DICT_5X5_100`、12x9、方格 0.015 m、Marker
0.01125 m、至少 12 个角点；每臂至少 30 个姿态分散样本；最大手眼残差 0.05 m；
最大全局/标定板位置和旋转离散度分别为 0.03 m、0.05 rad。

## 测试与部署

先为放宽后的“双腕 + 一个全局”配置验证、全局外参组合数学、以及不写入 TF 的
结果契约编写并运行失败测试；随后移植最小实现使其通过。再运行包的完整 pytest
套件、构建 `agx_arm_msgs` 和新包，最后以真实 ROS 图像/CameraInfo/TF 健康状态
验证启动，但不执行采样或求解，不会产生机械臂运动。
