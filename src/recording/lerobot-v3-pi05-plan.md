# Canonical Robot Dataset / LeRobot v3 实施计划

> **For agentic workers:** 逐任务执行时使用 `superpowers:executing-plans`，每项先写失败测试、再实现、再验证并独立提交。

**目标：** 将原始 ROS 2 录制物化为可重建、模型无关的 Canonical Robot Dataset，并以 LeRobot v3 作为固定 policy-rate 存储层；π0.5、未来 VLA、WAM 和 RL 只通过 adapter 消费它。

**架构：** `state.mcap`、JPEG、标定与 URDF 快照是不可变事实来源。ADOPT 后 exporter 在固定 `dataset_fps` 网格对齐原始流，生成有 provenance 的 LeRobot v3 episode。FK、EE 速度、模型 state、reward 都是可版本化重建的派生字段，不能反写或取代原始录制。

**技术栈：** ROS 2 Humble、rosbag2 MCAP、`lerobot==0.6.1`、NumPy、Pillow、URDF/KDL FK 后端（在 Humble 容器固定）、OpenPI data transforms。

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

> 进度（2026-09-22）：Task 1–5 的纯 Python/静态实现已完成并以失败测试覆盖；唯一未通过的验收是 Humble + `lerobot==0.6.1` + OpenPI 的真实 SDK/真机 smoke。宿主没有这些运行时依赖，不能把静态验证误报为端到端成功。

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
3. receipt 写入 schema、SDK、raw manifest、URDF、calibration hashes、对齐报告和 generator versions。（已实现 optional calibration snapshot：未配置时显式 `UNAVAILABLE`。）
4. 为 success/terminated/truncated/intervention 保留 manifest annotation block；不实现 reward/RL writer。
5. 提交 `feat(recording): preserve canonical episode provenance`。

### Task 5：π0.5 adapter 与 smoke test（adapter 已实现；容器 smoke 待执行）

**文件：** 新增 `realman_recording/adapters/pi05.py`、`test/test_pi05_adapter.py`、训练环境文档。

1. 写纯 NumPy 测试：canonical `ee_pose_base + gripper_position` 转所选 checkpoint 的 `observation.state`；canonical command 转对应 action contract。
2. adapter 的字段选择、是否包含真实 gripper command、rot6d/delta、checkpoint state/action dimension、normalizer asset version 都显式配置；normalizer version 为空必须拒绝，并将 adapter `contract()` 与训练运行产物一起保存。adapter 不执行归一化，OpenPI transform 是唯一的归一化实现；禁止训练代码猜测单位/shape。
3. 在 OpenPI 训练容器跑 loader + one-batch smoke；action dimension 以实际 checkpoint 为准，不预设 21/32。
4. 提交 `feat(recording): add pi05 canonical data adapter`。

### Task 6：回放、文档与真机验证（回放/文档已实现；真机验收待执行）

**文件：** `replay.py`、`web_server.py`、Web 前端、`website/docs/development/recording-platform.md`、`src/recording/README.md`。

1. 回放从 canonical episode 读取 joint、EE、gripper、相机，展示 derived feature source/version。
2. 文档列出 raw source、LeRobot feature、单位/frame、缺失策略与 annotation workflow。
3. Humble 真机验收四相机/三臂/三夹爪：fixed FPS、quality masks、FK 基准、SDK reload、π0.5 adapter batch。
4. 提交回放与文档变更。

## 顺序与明确不做的事

先执行 Task 1–4，之后是 Task 5，最后回放/RL。当前不实现 force/torque、触觉、移动底盘、reward 聚合、`action.executed` 或 RL rollout 字段：它们没有可靠 raw source，仅保留 metadata extension 位置。

## 总验收门槛

- derived dataset 可从同一 raw session 删除后重建。
- LeRobot SDK reload 的 feature shape、episode 边界、metadata 一致。
- FK 与独立 FK 基准一致，EE velocity 无 quaternion sign-flip spike。
- π0.5 adapter 用明确配置取得 batch，不改变 canonical dataset。
- source 缺失、frame/unit ambiguity、对齐超限、FK/calibration hash 不匹配都显式失败。
