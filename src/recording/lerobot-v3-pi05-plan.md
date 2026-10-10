# Canonical Robot Dataset / LeRobot v3 实施计划

> **For agentic workers:** 逐任务执行时使用 `superpowers:executing-plans`，每项先写失败测试、再实现、再验证并独立提交。

**目标：** 将原始 ROS 2 录制物化为可重建、模型无关的 Canonical Robot Dataset，并以 LeRobot v3 作为固定 policy-rate 存储层；π0.5、未来 VLA、WAM 和 RL 只通过 adapter 消费它。

**架构：** `state.mcap`、JPEG、标定与 URDF 快照是不可变事实来源。ADOPT 后 exporter 在固定 `dataset_fps` 网格对齐原始流，生成有 provenance 的 LeRobot v3 episode。FK、EE 速度、模型 state、reward 都是可版本化重建的派生字段，不能反写或取代原始录制。

**技术栈：** ROS 2 Humble、rosbag2 MCAP、`lerobot==0.4.4`、NumPy、Pillow、URDF/KDL FK 后端（在 Humble 容器固定）、OpenPI data transforms。

> **版本边界（2026-09-22 已核对）：** “LeRobot Dataset v3”是存储格式版本，不等于 Python 包版本。官方 v3 格式从 `lerobot >= 0.4.0` 起支持；本项目固定 `lerobot==0.4.4`（Humble Python 3.10 可安装的最新版本），使用 `LeRobotDataset.create()` / `resume()`、`add_frame()`、`save_episode()`、`finalize()` 的 v3 writer 路径。不要因为外部提到“v3.1”而把 SDK 版本号臆改为 `3.1`；若升级 SDK，必须在 Humble 容器先跑 SDK reload、视频 decode 和 OpenPI one-batch 验收。

## 不可变原则

1. recorder 只读 ROS topic；不为录制新增驱动 topic，也不向机械臂或夹爪发布命令。
2. MCAP/JPEG/header/receipt `SYSTEM_TIME` 是 raw truth；SDK 管理的 LeRobot `timestamp` 是 policy-grid 时间，不能冒充原始传感器时间。
3. 每个 feature 声明 `raw` 或 `derived`、单位、参考坐标系、生成器版本；重新导出只生成新 derived 数据集。
4. 一个 v3 dataset 只有一个 embodiment、固定 feature shape、相同 frame/unit/action 约定。多机器人使用独立 dataset + `embodiment_id` + adapter，不混入可变维度向量。
5. canonical 姿态固定为 base-frame `xyz + quaternion_xyzw`；rot6d、delta pose、`observation.state` 都是 adapter 输出。
6. `action.command.*` 是真实控制输入；没有驱动执行反馈时，FK 差分状态不能称为 `action.executed.*`。
7. required source 缺失、超 gap、四元数无效或 FK 失败必须拒绝 episode；不得补历史图像、伪造夹爪 action 或写零速度。

## Canonical v1 特征契约

数组顺序由 config 明确的 `l,m,r` 与 `left,mid,right` 决定，单位为 SI。

| Feature | Shape | 来源 | 约定 |
| --- | ---: | --- | --- |
| `observation.joint_position` | 18 | raw `JointState.position` | rad |
| `observation.joint_velocity` | 18 | derived position 差分（当前驱动） | rad/s；驱动以后提供才改用 raw `JointState.velocity` |
| `observation.joint_effort` | 可选 18 | raw `JointState.effort` | 当前驱动未发布；不假称 Nm，记录 capability |
| `observation.ee_pose_base` | 21 | derived FK | 每臂 `[x,y,z,qx,qy,qz,qw]` |
| `observation.ee_velocity_base` | 18 | derived pose 差分 | 每臂 `[vx,vy,vz,wx,wy,wz]` |
| `observation.gripper_position` | 3 | raw `Float64` | 原始设备单位记录在 metadata |
| `action.command.cartesian_velocity` | 18 | raw `TwistStamped` | 3 × `[vx,vy,vz,wx,wy,wz]` |
| `action.command.gripper` | 0 或 3 | raw command topic | 无真实 source 时不存在 |
| `observation.images.<camera>` | HWC RGB | raw JPEG | SDK video writer |
| `quality.valid` | 1 | derived | 所有 required source 有效 |
| `quality.sync_error_ns.<source>` | 1 | derived | anchor 与 source 时间差 |
| `task` | string | session metadata | 人类可读 instruction |

`observation.state`、顶层 `action`、rot6d、delta action、RL `log_prob/value/advantage` 不属于 canonical dataset；每个模型 adapter 从上述字段生成。

## Episode metadata

manifest 与 dataset receipt 保存：`embodiment_id`、robot model/serial、URDF hash、joint names/limits、EE/base frame、tool/work frame、控制模式/action 语义、相机 intrinsics/extrinsics hash、calibration version、采集频率、operator/teleop、task/result、frame/unit convention、schema hash 与 derived generator versions。

`success`、`terminated`、`truncated`、failure reason、intervention 是 episode annotation。reward 分量、VLM 标注和 RL rollout metadata 为独立 annotation extension，不能阻塞基础 session ADOPT。

## 已完成基线（不得回退）

- ROS `SYSTEM_TIME` receipt、MCAP archive、4 路 JPEG archive、PREPARE 与 ADOPT/DISCARD 生命周期。
- LeRobot v3 SDK writer、固定 FPS grid、相机 skew 拒绝、数据集锁、session→episode receipt。
- exporter 已 materialize canonical physical/derived feature；剩余工作是运行时验收，不得回退到 π0.5 专用向量。

## 实施任务

> 进度补记（2026-09-23，本轮）：上述 97 条测试/镜像缺 MCAP 是本轮之前的状态，现已被后续验证取代。当前工控机 `rm65-recording:test` 已更新，含 MCAP plugin 和 `setuptools=79.0.1`（满足 Humble `colcon-core<80`）；`ros2 bag list storage` 列出 mcap，`colcon list` 正常，当前 recording 测试套件 107 条通过。新增隔离 ROS domain 的真实 recorder Service 集成测试，以合成传感器流完成 PREPARE、START、MCAP 写入、STOP、重复 STOP、DISCARD，并验证节点正常销毁；同时修复 recorder/Web bridge 对 `rclpy.Node._subscriptions` 重复登记导致销毁异常的问题。新增 WebSocket 慢 client 回归测试发现并修复 `web_server.py` 缺少 `json` import 导致 snapshot 广播后台失败的问题；验证慢客户端不会阻塞 producer、最新快照有界合并、发送超时后 client 被清理。新增进程级恢复测试，在 MCAP 已写入后 SIGKILL 活跃 recorder，再通过启动新 recorder ROS 节点验证 partial session 恢复为 FAILED。上一版镜像保留为 `rm65-recording:backup-before-process-recovery-20260923`；更早的 WebSocket 修复前镜像也有备份 tag。另用 LeRobot 0.4.4 SDK 生成的视频 episode fixture 端到端验证 Web HTTP list/summary/frames/JPEG 与 `source_timestamps_ns` 精确映射；这是 SDK fixture 而非机械臂真机采集。四相机成功采集、真实 ENOSPC、真机成功 LeRobot 导出、OpenPI one-batch 与训练验证仍待设备/运行环境验收。

### Task 1：Canonical schema、能力描述与配置（已实现）

**文件：** `config/ros/recording.yaml`、`realman_recording/lerobot_schema.py`、`test/test_lerobot_schema.py`、`src/recording/README.md`。

1. 写失败测试：三臂 canonical feature shape 为 `18/18/18/21/18/3/18`，topic 枚举顺序变化不影响字段布局。
2. 将 `LeRobotV3Schema.features()` 改为 canonical feature map，移除 writer 对 `observation.state`、顶层 `action` 的依赖。
3. 配置加入 `embodiment_id`、URDF source/version、base/EE frame、joint name order、action frame/representation、sensor capability；所有非默认值写相邻注释。
4. 运行纯 schema 测试、YAML parser、`compileall`，提交 `feat(recording): define canonical robot schema`。

### Task 2：完整 JointState 与对齐质量报告（已实现）

**文件：** `lerobot_exporter.py`、`lerobot_align.py`、`test/test_lerobot_export_alignment.py`。

1. 写失败测试：joint name 错序、source skew 超限必须明确失败；当前驱动没有 velocity 时从 position 推导，effort 不得以零值伪造。
2. MCAP extractor 从 position-only 改为结构化 joint sample；当前 profile 用对齐 position 差分生成 velocity，未来仅在完整 raw velocity/effort 存在时 materialize 原始字段。
3. 每个 camera/state/action 对齐返回 actual timestamp/skew/policy，写 `quality.valid` 与固定 shape `quality.sync_error_ns.*`。
4. 验证四路 15Hz 不生成 60Hz timeline，提交 `feat(recording): materialize canonical joint and quality data`。

### Task 3：离线 FK 与 EE pose/velocity（已实现）

**文件：** 新增 `kinematics.py`，修改 exporter/schema/config，新增 `test/test_kinematics.py`。

1. 写 FK fixture：零位/已知关节位返回预期 base-frame pose；未知 joint order、URDF hash 不匹配、非单位 quaternion 必须失败。
2. 在 Humble 容器固定 URDF FK 后端，按 config joint order、active tool transform 计算 `ee_pose_base`；四元数统一 xyzw 且归一化。
3. 中间帧中心差分、边界帧前后向差分；角速度以 `q_next * inverse(q_prev)` 的最短轴角 rotation vector 除以 `dt`，不使用 Euler 差分。
4. 写入 FK backend/URDF hash/velocity algorithm；验证静止、恒定平移、quaternion sign flip，提交 `feat(recording): derive end-effector pose and velocity`。

### Task 4：command、annotation 与 provenance（核心已实现）

**文件：** `recorder_node.py`、`session_store.py`、`lerobot_dataset_store.py`、`lerobot_exporter.py`、相关测试。

1. 写生命周期测试：STOP 不导出；ADOPT 只追加一次 episode；重复 ADOPT 或 worker 失败不损坏 raw session。
2. 保存真实 `TwistStamped` command 的 `header.frame_id`/控制 mode；frame 不匹配、未知语义、无 samples 时拒绝 action-supervised export。
3. receipt 写入 schema、SDK、raw manifest、URDF、calibration hashes、对齐报告、JPEG archive `accepted/dropped/errors` 和 generator versions。（已实现 optional calibration snapshot：未配置时显式 `UNAVAILABLE`；旧 session 缺少相机统计时显式 `UNAVAILABLE`。）
4. 为 success/terminated/truncated/intervention 保留 manifest annotation block；不实现 reward/RL writer。
5. 提交 `feat(recording): preserve canonical episode provenance`。

### Task 5：π0.5 adapter 与 smoke test（adapter、LeRobot 容器 smoke 已实现；OpenPI 待执行）

**文件：** 新增 `realman_recording/adapters/pi05.py`、`test/test_pi05_adapter.py`、训练环境文档。

1. 写纯 NumPy 测试：canonical `ee_pose_base + gripper_position` 转所选 checkpoint 的 `observation.state`；canonical command 转对应 action contract。
2. adapter 的字段选择、是否包含真实 gripper command、rot6d/delta、checkpoint state/action dimension、normalizer asset version 都显式配置；normalizer version 为空必须拒绝，并将 adapter `contract()` 与训练运行产物一起保存。adapter 不执行归一化，OpenPI transform 是唯一的归一化实现；禁止训练代码猜测单位/shape。
3. 在 OpenPI 训练容器跑 loader + one-batch smoke；当前已完成 LeRobot/adapter 容器 smoke，OpenPI 本体仍待安装。action dimension 以实际 checkpoint 为准，不预设 21/32。
4. 提交 `feat(recording): add pi05 canonical data adapter`。

### Task 6：文档与真机验证（离线回放暂缓）

**文件：** `web_server.py`、Web 前端、`website/docs/development/recording-platform.md`、`src/recording/README.md`。

1. 文档列出 raw source、LeRobot feature、单位/frame、缺失策略与 annotation workflow。
2. 已在 `recording-test` 加载 ROS interface 并手工验证 `/recording/manage` 的 PREPARE、短时 START/自动结束和重复 STOP；完整 Humble 真机验收仍需四相机/三臂/三夹爪 fixed FPS、quality masks、FK 基准、SDK reload、π0.5 adapter batch。
3. 离线回放/Rerun 不纳入本阶段验收，保留骨架供后续恢复。

## 顺序与明确不做的事

先执行 Task 1–4，之后是 Task 5，最后做真机验收。离线回放/Rerun 暂缓。当前不实现 force/torque、触觉、移动底盘、reward 聚合、`action.executed` 或 RL rollout 字段：它们没有可靠 raw source，仅保留 metadata extension 位置。

## 总验收门槛

- derived dataset 可从同一 raw session 删除后重建。
- LeRobot SDK reload 的 feature shape、episode 边界、metadata 一致。
- FK 与独立 FK 基准一致，EE velocity 无 quaternion sign-flip spike。
- π0.5 adapter 用明确配置取得 batch，不改变 canonical dataset。
- source 缺失、frame/unit ambiguity、对齐超限、FK/calibration hash 不匹配都显式失败。
