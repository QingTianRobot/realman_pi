# 夹爪行程端点的网页设置入口设计

## 背景与目标

`open_position` / `close_position` 只能通过改 `config/ros/gripper.yaml` 并重启 `gripper_manager` 修改（Web 节点启动时也只读一次该文件）。2026-10-09 的故障正是因为开位偏离机械全开位（右 4000、左 400），网页上无法发现，也无法在不重启的情况下修正。

目标：在网页夹爪面板中，让有写权限的操作者查看并设置每个夹爪的开位和闭位，可以直接输入数值、取当前位置、或点动夹爪到任意原始位置；设置立即生效、重启后保留，并同步更新网页的开度显示与 3D 夹爪。

## 范围

做：开位、闭位的查看与设置；原始位置点动；设置结果持久化；网页与所有 ROS 消费者（Pika、键盘、百分比服务）立即使用新行程。

不做：`speed_pct` / `force_pct` / `accel` / `decel`；`min_position` / `max_position`（仍只在 `gripper.yaml` 改，作为网页无法越过的硬边界）；一键恢复默认。需要恢复默认时，删除覆盖文件并重启 `gripper_manager`。

## 方案选择

在 `gripper_manager` 上新增服务和状态话题，Web 节点只转发（方案 A）。`gripper_manager` 是唯一写文件的一方，网页使用的数值都由它推送。放弃的方案：Web 节点自己写文件（要把 Web 容器的 `config` 挂载改为可写，两个进程写同一文件）；ROS 参数（持久化、范围校验、网页转发都要自己补）。

## ROS 接口（`gripper_ros2_msgs`）

| 接口 | 类型 | 内容 |
|---|---|---|
| `SetGripperLimits.srv` | 服务 | 请求 `int32 open_position`、`int32 close_position`；响应 `bool success`、`string message`、生效后的 `int32 open_position`、`int32 close_position` |
| `MoveGripperRaw.srv` | 服务 | 请求 `int32 position`；响应 `bool success`、`string message`（含实际反馈位置） |
| `GripperLimits.msg` | 消息 | `int32 open_position`、`close_position`、`min_position`、`max_position` |

每个夹爪名下新增：`/<name>/set_limits`（`SetGripperLimits`）、`/<name>/move_raw`（`MoveGripperRaw`）、`/<name>/limits`（`GripperLimits`，可靠、`transient_local`、深度 1）。`gripper_config.py` 的 `SERVICE_SUFFIXES` / `TOPIC_SUFFIXES` 相应增加 `set_limits`、`move_raw`、`limits`，现有的接口名测试同步更新。

## `gripper_manager` 行为

### 新模块 `gripper_limits.py`（`gripper_ros2` 包内，不依赖 ROS）

- `validate_limits(open_position, close_position, min_position, max_position)`：返回错误信息或 `None`，规则见下节。
- `load_overrides(path, grippers)`：读取覆盖文件，按夹爪校验，返回有效条目；无效条目被忽略并返回错误列表。
- `save_overrides(path, overrides)`：写临时文件、`fsync`、`os.replace` 到目标路径。临时文件与目标在同一目录（`config/ros` 是目录挂载，`os.replace` 可用）。

### `set_limits`

1. 校验；失败返回 `success=false` 和原因，不改任何状态。
2. 若该设备当前有待发目标，或在最近 2 秒内通过连续控制路径（`request_move`）下发过目标，返回"忙"。服务路径的一次性开合不计入，点动（`move_raw`）也不计入，以免"点动→取当前位置→应用"的操作被误拒。
3. 写覆盖文件；失败则返回 `success=false` 和错误，内存不变。
4. 持 `_cmd_lock` 更新设备的 `open_position` / `close_position`，清除该设备的待发目标和 `_last_sent` 记录。
5. 发布 `/<name>/limits`。

`set_limits` 不与硬件通信，设备离线时也可保存，且不会让夹爪动。

### `move_raw`

- `position` 超出 `[min_position, max_position]` 时直接拒绝，不截断。
- 其余前置条件与 `open` / `close` 相同：总线已连接，必要时自动使能；使用配置的速度、力矩、加减速。与现有开合服务一致，不因 `alarm≠0` 拒绝。
- 一次性下发，不进入连续控制路径。

### 启动加载

`gripper.yaml` 解析并校验后，叠加覆盖文件。覆盖文件路径取节点参数 `overrides_file`，默认是 `config_file` 同目录下的 `gripper_overrides.yaml`。文件不存在属于正常情况。文件损坏、夹爪名不存在或数值不满足校验规则时，该条目被忽略，用 `gripper.yaml` 的值，并打 ERROR 日志（写明文件与夹爪名），节点照常启动。节点启动后无论是否有覆盖文件，都会发布一次 `/<name>/limits`。

覆盖文件格式（只允许这两个字段）：

```yaml
grippers:
  gripper_right:
    open_position: 50
    close_position: 8500
```

该文件是这台机器的运行时状态，由新增的 `config/ros/.gitignore` 忽略，不进 git。

## 校验规则

对 `set_limits`（后端强制，前端仅提示）：

1. 两个值都是整数（拒绝布尔值和小数），且都落在该夹爪的 `[min_position, max_position]` 内。
2. `open_position < close_position`。三个夹爪的物理方向都是"小=开"，防止填反后 open 命令反而去夹紧。真有反装的夹爪，在 `gripper.yaml` 里调整。
3. `close_position − open_position ≥ 5% × (max_position − min_position)`，避免百分比映射退化成一个点。

## Web 协议与节点

- `protocol.py`：`gripper_command` 的 `command` 白名单增加 `set_limits`（字段 `open_position`、`close_position`，整数）和 `move_raw`（字段 `position`，整数）。类型不符返回 `invalid_field`。
- `web_control_node.py`：为每个夹爪增加 `set_limits`、`move_raw` 两个服务客户端，沿用 `request_id` 和 `gripper_result`（`requested` / `completed` / `failed`）流程；服务未就绪返回现有的 `gripper_unavailable`。服务器处于 `read_only` 时在服务端拒绝这两个命令。
- 订阅每个夹爪的 `/<name>/limits`（`transient_local`），更新本地缓存的 `open_position`、`close_position`、`min_position`、`max_position`，并向所有客户端广播 `gripper_list`。此后 Web 容器无需重启就能跟上行程变化。

## 前端（`web/src/main.ts`、`web/index.html`）

夹爪面板内新增折叠区"行程设置"：

- 开位、闭位两个数值输入框，各配一个"设为当前位置"按钮。按钮仅在该夹爪 `connected` 且 `speed` 为 0 时可用；点它只把当前读数填入输入框，不保存。
- 原始位置滑块，范围取该夹爪的 `min..max`，旁边显示当前数值；只在松手（`change`）时发送一次 `move_raw`，不连续下发。
- "应用"按钮：点击后用 `confirm()` 显示"旧值 → 新值"，确认后发送 `set_limits`。前端校验仅作提示，规则以后端为准。
- 输入框有未应用的修改（脏）或正处于聚焦时，不被 `gripper_list` 广播覆盖；切换夹爪或应用成功后清除脏标记。
- 无写权限（`canWrite()` 为假）时整个折叠区禁用。

## 错误处理汇总

| 情形 | 行为 |
|---|---|
| 校验不通过 | `success=false`，消息写明原因，状态不变 |
| 覆盖文件写失败（只读、磁盘问题） | `success=false`，消息含错误，内存不变 |
| 连续控制进行中 | `success=false`，消息为"忙" |
| `move_raw` 越界 / 未连接 | `success=false`，消息写明原因 |
| 覆盖文件损坏或条目非法 | 忽略该条目，用 YAML 值，ERROR 日志 |
| 两个浏览器同时修改 | 后写的生效；`limits` 广播让所有页面更新 |
| 服务端 `read_only` | 协议层拒绝写命令 |

## 测试

先写失败的测试，再实现：

- `gripper_limits` 纯逻辑单测：校验的各分支；原子写（写失败时旧文件保持不变）；覆盖文件缺失 / 损坏 / 夹爪名不存在 / 数值非法。
- 驱动与节点（假 SDK）：`set_limits` 更新端点并清除待发目标；忙状态被拒；更新后 `percentage_to_position` 用新值；`move_raw` 越界被拒；设置后发布 `limits`；启动时叠加覆盖文件。
- Web 协议：扩展 `test_gripper_protocol.py`（新命令规范化、非法字段）；`read_only` 拒绝写命令。
- 前端：Playwright（`test:web-control`）覆盖面板、确认弹窗、请求内容、广播后读数更新、"设为当前位置"的禁用条件、脏标记；之后 `npm run build:web-control` 重新生成已提交的静态文件。
- 容器内对 `gripper_ros2_msgs`、`gripper_ros2`、`realman_web_control` 运行 `colcon build` 与 `colcon test`。

## 上线与验收

新增 srv / msg 需要重新编译 ROS 接口，镜像里的源码是烘焙进去的。正式路径是合并后重新构建镜像并重启整套服务，要选停机窗口。需要立即使用时，可以像此前补丁机械臂驱动那样，在容器里只重新编译相关的包再重启 `gripper_manager` 和 Web 容器，但这种改动在容器重建时会丢失，之后仍需重新构建镜像。具体选择在代码和测试通过后再定。

机器人上的验收按风险从低到高，每一步操作者在场：

1. 只读：`/<name>/limits` 与当前生效的配置一致。
2. 用当前值点一次"应用"，行程应保持不变。
3. 小幅点动。
4. 把开位改动一点，确认 `percentage=1` 落在新位置，再改回去。

覆盖文件由容器内的 root 写入，主机上的普通用户需要 `sudo` 才能手工修改；这是现有挂载的特性，不另行处理。

## 文档

同步更新 `website/docs/development/gripper-control.md`：接口表、WebSocket 命令、行程设置的操作说明与排障；`.agents/skills/developing-changingtek-grippers/SKILL.md` 中"Required Boundaries"补充覆盖文件的约定。

## 已知风险

左夹爪的数值量级只有右夹爪的约十分之一，单位可能不同（未确认）。网页只显示和设置设备原始数值，所以不依赖单位，但操作者需要意识到两个夹爪的数值不可直接比较。
