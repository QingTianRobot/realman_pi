# :8765 参数调试页

日期：2026-10-26。状态：设计已确认，待写实现计划。

## 问题

调参现在只能 ssh 到 realman_ts 手改 `~/realman_pi/config/ros/*.yaml`：要记得参数在哪个文件、哪一层；改错类型
（比如把 `0.10` 写成 `1`）路由会在启动时因 ROS 参数类型不符直接退出；改完不知道运行中的节点用的是不是新值；改了什么、
改之前是多少，只能翻 `~/deploy-backups/` 或 git diff。

golf-course-robot 的测试台控制台（`gcr_simulation/gcr_simulation/console/web/debug.js` 的「阈值」表，教程
`docs/网页控制台教程.md` ⑤）解决的是同一件事：白名单清单（`testbench/thresholds.yaml`）只列能调的参数和它们的类型、
单位、范围、备注；页面是一张 Excel 式的表（参数 / 备注 / 节点 / 默认值 / 当前值 / 已生效 / 暂存 / 新值 / 范围），
新值先暂存，再「重启生效」，最后从节点读回、和请求值对比。

## 目标与非目标

目标：

1. :8765 新增独立页面 `/params.html`，照 golf 阈值表的样子列出四类参数：策略任务（`policy_task.yaml`）、行为树
   执行器（`behavior_tree.yaml`）、运动限速（`realman_motion.yaml`、`policy_router.yaml`、`pika_config.yaml`）、
   夹爪（`gripper.yaml`）。
2. 能调哪些参数、类型、单位、范围、中文备注、何时生效、从哪个节点读回，全部写在一份清单
   `config/web-control/param_catalog.yaml` 里；清单外的键页面既不显示也不能写。
3. 写入直接改 `config/ros/*.yaml`：只替换目标值那一段文字，注释、缩进、键顺序、行尾注释原样保留；写之前显示 diff
   并确认；类型和范围在服务端再校验一遍。
4. 每一行标明生效时机，能读回的参数显示运行值和「已生效 / 待生效 / 未运行」。
5. 每次写入留历史和备份，可撤回；页面第一次改某个文件前留基线，「基线值」列和「导出补丁」都以它为准，补丁可以直接
   `git apply` 到仓库提 PR。

非目标：

- 不做 golf 的「方案」（命名参数组合）。
- 不做运行时热更新：这些节点都只在启动时读参数（行为树执行器的参数回调也不接受修改）。
- 驱动和 gripper_manager 不读回：它们读的是文件路径参数，值本身不是 ROS 参数。
- 夹爪开合位置（`open_position` / `close_position`）不进清单：主页面已经能在运行时改，改动存在
  `gripper_overrides.yaml` 里（`gripper_ros2/gripper_limits.py`），清单再改 `gripper.yaml` 会被覆盖文件遮住。
- 不管 `hard_max_*`：它们是 SDK 硬上限，只作为对应参数的「最大」显示，不能在页面上改。
- 不加口令：:8765 现有的写接口（启动行为树、重启 bringup、关节记录）只检查同源，这一页一样。

## 现状（决定设计的事实）

| 文件 | 谁读 | 何时读 | 能否读回 |
| --- | --- | --- | --- |
| `policy_task.yaml` | `realman_bt_executor`（ROS 参数 `policy_task.*`） | 行为树启动时（`control_router.launch.py`） | 能，`/realman_bt_executor` |
| `behavior_tree.yaml` | `realman_bt_executor` | 行为树启动时 | 能，`/realman_bt_executor` |
| `policy_router.yaml` | `policy_control_router`（ROS 参数） | 行为树启动时 | 能，`/policy_control_router` |
| `pika_config.yaml` 的 `pika_velocity` / `pika_mixed` | launch 文件读出后以 `pika_velocity_*` / `pika_mixed_*` 传给 `pika_control_router` | 行为树启动时 | 能，`/pika_control_router` |
| `realman_motion.yaml` | 三个驱动（bringup 启动时）；launch 文件也把它转成 `cartesian_velocity_profiles` 传给路由和执行器 | bringup 启动时 + 行为树启动时 | 不能 |
| `gripper.yaml` 的速度、力、加减速、指令间隔 | `gripper_manager` | bringup 启动时 | 不能 |

- 行为树在 bringup 容器里由 `bt-start` 启动，重启 bringup 时行为树也会停，需要重新启动。
- web_control 容器把 `config/` 挂成只读，只有 `config/web-control/joint-records`、`config/web-control/behavior-trees`
  可写；bringup 容器已经有 `./config/ros:/opt/rm65_ws/config/ros:rw`。`logs/` 在 web_control 里可写
  （`REALMAN_LOG_ROOT`，宿主机 `~/realman_pi/logs`）。
- 宿主机上 `config/ros` 的文件属于 `administrator`，容器里的进程是 root。
- rclpy 路由按 YAML 里的类型声明参数：浮点参数写成整数（`1`）会让路由启动失败；执行器的 `policy_task_params.cpp`
  按动态类型声明，能容忍整数，但其他节点不行。
- 镜像里有 PyYAML，没有 ruamel.yaml；CI 的无 ROS 测试只装 `pytest pyyaml numpy aiohttp pyarrow`。

## 设计

### 1. 清单 `config/web-control/param_catalog.yaml`

```yaml
schema_version: 1
# 生效时机的显示文字。
applies:
  bt_start: 下次启动行为树生效
  bringup_restart: 重启 bringup 后生效（行为树随之停止，需要重新启动）
groups:
  - id: policy_safety
    title: 策略任务 · 安全监督
    file: ros/policy_task.yaml                 # 相对 config 根目录，必须在 ros/ 下
    prefix: realman_bt_executor.ros__parameters.policy_task
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "policy_task.{key}"}
    params:
      - key: joint_envelope_deg.lo
        type: float[]
        labels: [J1, J2, J3, J4, J5, J6]
        min: -180.0
        max: 180.0
        max_ref: joint_envelope_deg.hi          # 逐元素：lo[i] <= hi[i]
        unit: deg
        note: 策略运行中关节下限；超出即保护停止（故障，不重试）。来自 130 条示教的 p1 再放宽 10°。
      - key: current_guard.limits_ma
        type: int[]
        labels: [J1, J2, J3, J4, J5, J6]
        min: 500
        max: 20000
        unit: mA
        note: 被监督手臂任一关节电流持续 sustain_sec 超过它就停下重试（overcurrent）。
  - id: motion
    title: 运动限速 · 驱动
    file: ros/realman_motion.yaml
    prefix: "robots.{i}"
    instances: [l, m, r]                        # 每个实例展开一组行，{i} 替换为实例名
    applies: bringup_restart
    params:
      - {key: max_linear_speed_mps, type: float, min: 0.005, max: 0.25, max_ref: hard_max_linear_speed_mps,
         unit: m/s, note: 笛卡尔平移速度上限；普通运动和速度会话都受它限制。}
  - id: gripper
    title: 夹爪
    file: ros/gripper.yaml
    prefix: "buses[port=/dev/realman/gripper_{i}]"
    instances: [right, left, mid]
    applies: bringup_restart
    params:
      - {key: "grippers[name=gripper_{i}].force_pct", type: int, min: 20, max: 100, unit: "%", note: 夹持力百分比。}
```

字段：

- `key`：在 `prefix` 下的点分路径。一段可以是映射键 `name`、列表下标 `name[2]` 或按字段选列表项
  `name[field=value]`（选中该字段等于 value 的唯一一项；值里不能有 `.`、`[`、`]`）。`{i}` 换成实例名。
- `type`：`int`、`float`、`bool`、`int[]`、`float[]`。数组参数长度固定（等于 `labels` 的长度，加载时核对文件），
  每个元素单独一行。
- `min` / `max`：闭区间，数组可以给标量（每个元素同一范围）或等长列表。`special: [-1]` 列出范围外仍然合法的值
  （`attempts`、`cycles` 的 -1 = 不限）。
- `max_ref` / `min_ref`：同一组、同一实例里另一个键，校验用它的「生效后的值」（暂存的新值，没有就用文件值）。
  写成字符串是 `≤` / `≥`；写成 `{key: stale_ms, strict: true}` 是 `<` / `>`（launch 文件要求
  `stale_ms < input_timeout_ms`，相等也会启动失败）。数组之间逐元素比较。被引用的键在这个实例里不存在（`m` 臂没有 `hard_max_linear_accel_mps2`）时跳过这条约束。
  被引用的键可以不在清单里（`hard_max_*`），这时它只作为上限显示。
- `readback`：组级模板，`{key}` 换成参数键；参数自己也可以写 `readback` 覆盖（Pika 用 `pika_velocity_{leaf}`
  这类改名，见首批清单）。没有 `readback` 的组不读回。
- `note`：中文备注，页面「备注」列显示。
- `label`：可选的显示名，默认就是 `key`（夹爪参数的键带选择器，用 `label` 显示成 `force_pct`）。

每一行的 id 是 `<group>/<key>`，有实例时是 `<group>@<instance>/<key>`，数组元素再加 `[n]`，例如
`motion@r/max_linear_speed_mps`、`policy_safety/joint_envelope_deg.lo[4]`。

清单加载时就核对：文件在 `ros/` 下、每个路径在文件里存在且唯一、文件里的当前值类型与 `type` 一致（`float` 允许文件里是
整数，`int` 不允许小数）、数组长度与 `labels` 一致。核对失败的行不显示，错误列在页面顶部；pytest 用真实配置跑同样的
核对，配置和清单一旦对不上 CI 就红。

### 2. 后端模块 `realman_web_control/param_tuning.py`（不依赖 ROS）

- **定位**：`yaml.compose()` 得到节点树，沿路径找到目标标量节点，取它的 `start_mark.index` / `end_mark.index`
  （字符下标）。只用 PyYAML。
- **改写**：把这一段替换成新值的文字。`int` 写成整数；`float` 总是带小数点（`0.1`、`8.0`、`1.0e-05`），保证 rclpy
  按 double 声明；`bool` 写成 `true` / `false`。一个文件的多处修改按下标从后往前替换。替换后重新 `safe_load`，和改前的
  文档逐项比较：必须**只有**目标路径变了、而且等于新值，否则拒绝写入（防止定位错位或格式化出错）。
- **校验**：类型、`min`/`max`/`special`、`max_ref`/`min_ref`；超出清单的 id 一律拒绝。
- **并发**：请求带上页面看到的每个文件的 sha256；写之前在进程锁里重新读文件，sha 不一致返回 409（文件被别人改过），
  页面提示刷新。
- **写文件**：同目录临时文件 → `fsync` → `os.replace`，然后把属主、权限改回原文件的 uid/gid/mode（容器里是 root，
  `chown` 可以执行），宿主机上的文件仍属于 `administrator`。整个 `config/ros` 是目录挂载，bringup 容器能直接看到新文件。
- **备份和历史**（`<log_root>/param-tuning/`）：
  - `backups/<entry_id>/<file>`：写入前的原文件。
  - `history.jsonl`：每次写入一行：`id`（时间戳）、`time`、`changes`（`id`、`file`、`label`、`before`、`after`）、
    每个文件的 `before_sha` / `after_sha`、unified diff、撤回时多一个 `reverts`（被撤回那条的 id）。
  - `state.json`：每个文件最后一次由页面写出的 sha，以及「需要重启 bringup」的待办 id 列表。
- **撤回**：把某条历史里每项改回 `before`，走和写入完全相同的校验和写入流程，记成一条新历史。某项之后又被改过
  （当前值 ≠ 那条的 `after`）时照样改回，页面在确认框里列出这些项。
- **基线**：某个文件第一次被页面写入之前，把它复制到 `baseline/<file>`，并在 `baseline.json` 里记 sha 和时间。
  「基线值」列：有基线时读基线文件，否则就是当前文件值。「导出补丁」：每个有基线的文件生成基线 → 当前文件的 unified
  diff，路径头是 `a/config/ros/<file>` / `b/config/ros/<file>`，在仓库根目录 `git apply` 即可。「重置基线」把
  `baseline/` 挪进 `baseline-archive/<时间>/`（不删除），以后从当前文件重新开始。
- **页面外的修改**：当前文件 sha ≠ `state.json` 里页面最后写出的 sha 时，页面标出「这个文件在页面外改过」；补丁仍然以
  基线为准，要从新内容重新开始就重置基线。

### 3. 读回

读回逻辑放在不依赖 ROS 的 `realman_web_control/param_readback.py`：类 `ParameterReadback(get_clients,
get_request, list_clients, list_request, timeout_sec)`，方法 `read(requests) -> {node: {available, values}}`，`requests` 是
`{node: [param, ...]}`。`web_control_node.py` 在启动时为清单里的每个节点建好 `GetParameters`（`<node>/get_parameters`）和
`ListParameters`（`<node>/list_parameters`）客户端，连同两个 `Request` 类型注入，并把 `readback.read` 作为 `param_reader`
传给 `WebControlServer`；aiohttp 线程不新建 ROS 实体。
服务没准备好就是「未运行」；否则 `call_async` 后用 `threading.Event` 等，最多 `param_tuning.readback_timeout_sec`
（默认 0.5 s），超时也算「未运行」。`ParameterValue` 按 `type` 字段的数字常量（1 bool、2 int、3 double、6/7/8 三种数组）
转成 Python 值，其他类型记为 `None`。服务端在 `asyncio.to_thread` 里调它，不阻塞 aiohttp 线程；节点本来就跑在
`MultiThreadedExecutor` 里，回调能在等待期间完成。

每行的状态：

- 有读回、节点在运行：运行值 = 文件值 → 「已生效」；不等 → 「待生效」（浮点按 1e-9 相对误差比较）。
- 有读回、节点不在：「未运行」。
- 有读回、节点在但没有声明这个参数：「未声明」（执行中发现：`GetParameters` 只要有一个名字未声明，rclcpp / rclpy
  都会丢掉整个请求、返回空列表；所以收到长度不符的回复后用 `ListParameters` 查一次节点声明了哪些名字，之后只问这些，
  节点消失后清掉缓存。2026-10-26 在 server5090 的 Humble 容器里用真实 rclpy 验证过）。
- 没有读回：生效列只显示时机；如果这个文件有页面写入后还没重启 bringup 的改动，标「待重启」。

「待重启」来自 `state.json` 的待办列表：写入 `bringup_restart` 类参数时加入；通过 :8765 的「重启 bringup」
（`/api/docker/restart`，由服务端代理）成功受理后清空；用别的方式重启过的，可以点「知道了」清掉。

### 4. HTTP 接口（`web_server.py`）

所有 POST 都先过 `_origin_allowed`，和现有接口一样。

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/params` | 清单展开后的行（含文件值、基线值、范围、单位、备注、生效、读回目标）、每个文件的 sha、`writable`、清单错误、页面外修改、待重启列表 |
| GET | `/api/params/readback` | 调 `param_reader` 读所有有读回的行，返回 `{nodes: {node: {available, values}}}` |
| POST | `/api/params/apply` | `{changes: [{id, value}], expected_sha: {file: sha}, dry_run}`；`dry_run: true` 只校验并返回 diff；否则写入，返回历史条目。校验错误 400（逐项原因），sha 不符 409 |
| POST | `/api/params/revert` | `{entry: id, expected_sha, dry_run}`，语义同上 |
| GET | `/api/params/history` | 最近 100 条历史（新的在前） |
| GET | `/api/params/export` | 补丁文本（`text/x-diff`，`Content-Disposition: attachment; filename=param-tuning.patch`） |
| POST | `/api/params/baseline/reset` | 归档基线 |
| POST | `/api/params/pending/clear` | 清掉「待重启」 |

`writable` 为假（`config/ros` 不可写，比如还没改 compose 的容器）时 GET 照常返回、写接口返回 409 和原因，页面变成只读并
说明原因。`param_tuning.catalog_file` 为空时所有 `/api/params*` 返回 404，页面显示「参数调试已关闭」（主页面顶栏的
链接和「相机标定」一样始终显示，不额外探测）。

### 5. 页面 `/params.html`

- Vite 新入口 `web/params.html` + `web/src/params.ts` + `web/src/params.css`，沿用 `theme.css` 的变量；顶栏和相机标定页
  同一风格，左侧机械臂图标和标题「参数调试」，右侧「运动控制」「相机标定」链接。主页面顶栏在「相机标定」旁加「参数调试」。
- 工具条：筛选框（参数 / 备注 / 文件 / 单位）、「共 N 项」、「暂存 N 项」、「写入配置」、「清空暂存」、「导出补丁」、
  「重置基线」。
- 提示条：行为树正在运行（来自 `/api/bt/trees` 的 `launcher.running` / `tree`）且暂存里有 `bt_start` 类参数时，
  提示「运行中的 <tree> 不会使用新值，停止后重新启动生效」；有待重启时显示「有 N 项需要重启 bringup」、「重启 bringup」
  按钮（复用现有确认流程）和「知道了」；清单错误和页面外修改也在这里。
- 表格：分组横条（标题 + 项数），列为
  `# | 参数 | 备注 | 文件 | 基线值 | 文件值 | 运行值 | 暂存 | 新值 | 最小 | 最大 | 单位 | 生效`。
  文件值 ≠ 基线值时高亮；数组元素行的参数名写成 `joint_envelope_deg.lo · J5`；有实例的组每个实例单独一条分组横条
  （`运动限速 · 驱动（r）`），参数名可以用清单的 `label` 简写（夹爪的 `force_pct`）。
  「最大」列有 `max_ref` 时显示引用键的生效后的值并在 title 里写出键名。
- 新值单元格（golf 同款键盘操作）：回车暂存并跳到下一行，Shift+回车跳到上一行，Esc 清空，↑/↓ 换行，空单元格按
  Delete / Backspace 取消暂存；暂存列里的 × 也能取消。`bool` 用下拉框（true / false），选了即暂存。输入超范围时单元格
  标红并在 title 里写原因，不进暂存。
- 暂存只在浏览器里（`localStorage`，键里带页面路径），刷新不丢；文件值变得和暂存值相同时自动移出暂存。
- 「写入配置」：先 `dry_run`，弹窗列出每项「旧值 → 新值」、每个文件的 diff、生效时机汇总（哪些要重启 bringup，
  哪些下次启动行为树），确认后真正写入；409 时提示「文件已被修改，已刷新」并重新加载，暂存保留。
- 运行值每 2 s 轮询一次（页面不可见时暂停）。
- 底部「修改历史」：每条显示时间、改了几项、展开看逐项和 diff；「撤回」走同样的 dry_run 确认。
- 手机宽度：表格在自己的容器里横向滚动，页面本身不横向滚动；工具条换行。

### 6. 配置和部署

- `config/ros/realman_web_control.yaml` 新增：

  ```yaml
  param_tuning:
    catalog_file: web-control/param_catalog.yaml  # 相对 config 根目录；空字符串关闭这一页
    readback_timeout_sec: 0.5                     # 每个节点 GetParameters 的等待上限
  ```

- `config/docker/compose.yaml` 的 `realman_web_control` 服务加 `./config/ros:/opt/rm65_ws/config/ros:rw`（与 bringup
  相同）。部署时要重建 web_control 容器才能写；没重建的容器里页面是只读的，其余功能不受影响。
- 构建产物 `realman_web_control/static/` 随代码提交（`npm run build:web-control`），和现有做法一样。
- 开发服务器（`config/web-control/vite.config.mjs`）的 `/api/params*` 不做本地模拟：页面显示「参数接口不可用」，
  Playwright 用 `page.route` 提供数据。

## 错误处理

- 清单本身读不了（文件缺失、YAML 错）：`/api/params` 返回 503 和原因，页面显示错误，不影响 :8765 其他功能。
- 单行核对失败：这一行不显示，原因列在提示条里。
- 写入中途失败（磁盘满等）：临时文件被删除，原文件不变（`os.replace` 是原子的），不记历史，返回 500 和原因。
- 一次写入涉及多个文件时逐个文件替换；某个文件失败时已经替换的文件用备份恢复，返回 500。
- 读回失败只影响「运行值」列，不影响写入。

## 测试

- `test/test_param_tuning.py`（无 ROS，进 CI）：
  - 路径解析：映射键、下标、按字段选项、`{i}` 展开；选择器零个或多个匹配时报错。
  - 改写：只有目标那一行变化（其余字节相同）；行尾注释、引号、流式列表 `[a, b]` 里的单个元素；同一文件多处修改；
    浮点总带小数点、整数不带；改后重新解析只差目标值，故意错位时拒绝。
  - 校验：类型、范围、`special`、`max_ref`（含暂存值参与、引用键缺失时跳过、数组逐元素）。
  - 写入：sha 不符拒绝；属主和权限保留（tmp_path 里 chmod 后检查）；历史、备份、撤回；基线只在第一次写入时建立，
    导出的补丁在基线副本上 `git apply --check` 通过；重置基线后归档。
  - 真实清单 × 真实配置：每一行都能定位，当前值类型对、在范围内、满足 `max_ref`。
- `test/test_param_api.py`（无 ROS，进 CI）：非同源 403；`dry_run` 返回 diff 不写文件；写入后 GET 反映新值；409；
  不可写时 409；撤回；导出；读回用假的 `param_reader`（可用、不可用、超时）；`catalog_file` 为空时 404；
  `load_server_config` 校验 `param_tuning`。
- `test/test_param_readback.py`（无 ROS，进 CI）：用假客户端测服务未就绪、正常返回（标量、数组、未设置）、超时、
  有未声明的名字时列一次节点参数并缓存、节点消失后清缓存。
- `website/tests/web-control/params.spec.ts`（Playwright，桌面 + 手机）：加载清单渲染分组和列；键盘暂存、取消、超范围
  标红；写入的 dry_run 弹窗内容和最终请求体；409 后刷新保留暂存；运行值三种状态；行为树运行中的提示；待重启条和
  「知道了」；历史撤回的请求；手机宽度页面无横向滚动。主页面顶栏有「参数调试」链接。

## 文档

- 新页 `website/docs/development/web-parameter-tuning.md`：页面怎么用、清单字段、生效时机表、加参数的步骤、写入的安全
  措施、历史 / 基线 / 补丁、部署要求（compose 挂载）、排错。
- `config/website/vitepress.config.mts` 侧栏加在「Web 控制与 URDF 影子」后面；`website/tests/site.spec.ts` 路由列表加上
  这一页；`realman-web-control.md` 加一段指向它。
- 文档里不写具体数值（数值以配置为准），不写 IP、主机名和口令。

## 首批清单

`bt_start` = 下次启动行为树生效；`bringup` = 重启 bringup 后生效。每项的范围、单位和备注写在实施计划
给出的清单文件里，原则是「当前值在内、物理上合理、不超过硬上限」，清单测试保证当前值都在范围内。

| 组 | 文件 · 前缀 | 参数 | 生效 | 读回 |
| --- | --- | --- | --- | --- |
| 策略任务 · 尝试与重试 | `policy_task.yaml` · `policy_task` | `cycles`（`special: [-1]`）、`attempts`（`special: [-1]`）、`timeout_retry.attempts`（`special: [-1]`）、`timeout_retry.backoff_sec`、`max_attempt_sec`、`service_wait_sec`、`service_call_timeout_sec`、`router_release_sec` | bt_start | `/realman_bt_executor` `policy_task.{key}` |
| 策略任务 · 安全监督 | 同上 | `joint_envelope_deg.lo` / `.hi`（6 元素，`lo ≤ hi`）、`max_joint_speed_dps`、`lm_drift_limit_deg`、`joint_state_stale_sec`、`stats_stale_sec`、`stall.cmd_lin_mps_below`、`stall.cmd_ang_radps_below`、`stall.sec`、`current_guard.enabled`、`current_guard.limits_ma`（6 元素）、`current_guard.sustain_sec` | bt_start | 同上 |
| 策略任务 · 成功判定 | 同上 | `release.open_above`、`release.closed_below`（`≤ open_above`）、`release.min_closed_sec`、`release.joint_below_deg`、`release.settle_sec`、`lift.min_closed_sec`、`lift.joint_delta_deg`、`lift.hold_sec`、`lift.wrong_side_below_deg`、`verdict.window_sec`、`verdict.empty_position_min`、`gripper_ready.open_position_max`、`gripper_ready.timeout_sec`、`gripper_ready.position_stale_sec` | bt_start | 同上 |
| 策略任务 · 清台检测 | 同上 | `object_detection.roi_xywh`（4 元素 x/y/w/h）、`object_detection.min_channel`、`max_chroma`、`erode_px`、`min_pixels`、`settle_sec`、`timeout_sec` | bt_start | 同上 |
| 行为树执行器 | `behavior_tree.yaml` · `realman_bt_executor.ros__parameters` | `tick_rate_hz`、`switch_timeout_ms`、`shutdown_drain_timeout_sec` | bt_start | `/realman_bt_executor` `{key}` |
| 运动限速 · 驱动（l / m / r） | `realman_motion.yaml` · `robots.{i}` | `max_linear_speed_mps`（`≤ hard_max_linear_speed_mps`）、`max_angular_speed_radps`（`≤ hard_max_angular_speed_radps`）、`max_linear_accel_mps2`（`≤ hard_max_linear_accel_mps2`，没有时跳过）、`max_angular_accel_radps2`（`≤ hard_max_angular_accel_radps2`）、`velocity_watchdog_ms`、`joint_goal_tolerance_deg`、`pose_max_joint_speed_dps`、`default_timeout_sec`、`stop_timeout_sec` | bringup | 无 |
| 运动限速 · 策略路由 | `policy_router.yaml` · `policy_control_router.ros__parameters` | `max_linear_speed_mps`、`max_angular_speed_radps`、`max_linear_accel_mps2`、`max_angular_accel_radps2`、`stale_ms`、`input_timeout_ms`（`> stale_ms`，strict）、`drift_limit_deg`、`drift_window_sec`、`gripper_max_hz` | bt_start | `/policy_control_router` `{key}` |
| 运动限速 · Pika 速度 | `pika_config.yaml` · `pika_velocity` | `stale_ms`、`input_timeout_ms`（`> stale_ms`，strict）、`max_linear_speed_mps`、`max_angular_speed_radps`、`max_linear_accel_mps2`、`max_angular_accel_radps2` | bt_start | `/pika_control_router` `pika_velocity_{key}` |
| 运动限速 · Pika 混合 | `pika_config.yaml` · `pika_mixed` | `stale_ms`、`input_timeout_ms`（`> stale_ms`，strict）、`max_linear_speed_mps`、`max_linear_accel_mps2`、`max_angular_speed_radps`、`max_position_lead_m`、`max_orientation_lead_rad`、`pose_poll_hz` | bt_start | `/pika_control_router` `pika_mixed_{key}` |
| 夹爪（right / left / mid） | `gripper.yaml` · `buses[port=/dev/realman/gripper_{i}]` | `grippers[name=gripper_{i}].speed_pct`、`.force_pct`、`.accel`、`.decel`、`min_command_interval_s`、`command_deadband`、`streaming_poll_interval`、`command_quiet_s` | bringup | 无 |

读回名已经核对过：`control_router.launch.py` 把 `pika_velocity.<key>` / `pika_mixed.<key>` 传成
`pika_velocity_<key>` / `pika_mixed_<key>`，`pika_control_router.py` 逐个 `declare_parameter`；`policy_control_router.py`
声明的就是 `policy_router.yaml` 里的键名；执行器的 `policy_task.*` 由 `policy_task_params.cpp` 声明。所以首批清单都用组模板，
不需要参数级的 `readback` 覆盖（字段保留给以后改名的参数）。
