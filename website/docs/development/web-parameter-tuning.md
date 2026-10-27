---
title: 网页参数调试
description: :8765 的 /params.html：按白名单清单查看和写入 config/ros 里的参数，读回运行值，留历史、可撤回、可导出补丁。
---

# 网页参数调试

:8765 顶栏的「参数调试」打开 `/params.html`。页面把常调的参数排成一张表：策略任务（`policy_task.yaml`）、行为树执行器
（`behavior_tree.yaml`）、运动限速（`realman_motion.yaml`、`policy_router.yaml`、`pika_config.yaml`）和夹爪
（`gripper.yaml`）。新值先在浏览器里暂存，确认 diff 后写回 `config/ros/*.yaml`。写入时只替换那个值本身，注释和格式
都不动。能读回的参数还会显示运行中节点实际在用的值。

做法参考 golf-course-robot 测试台控制台的「阈值」表。设计见
`docs/superpowers/specs/2026-10-26-web-param-tuning-design.md`。

## 能调哪些参数

只有 [`config/web-control/param_catalog.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/web-control/param_catalog.yaml)
里列出的参数才会显示，也只有它们能写。清单不存数值：数值来自配置文件本身，运行值从节点读。

| 组 | 文件 | 生效时机 | 运行值 |
| --- | --- | --- | --- |
| 策略任务（尝试与重试、安全监督、成功判定、清台检测） | `policy_task.yaml` | 下次启动行为树 | `/realman_bt_executor` |
| 行为树执行器 | `behavior_tree.yaml` | 下次启动行为树 | `/realman_bt_executor` |
| 运动限速 · 驱动（l / m / r） | `realman_motion.yaml` | 重启 bringup | 无 |
| 运动限速 · 策略路由 | `policy_router.yaml` | 下次启动行为树 | `/policy_control_router` |
| 运动限速 · Pika 速度 / 混合 | `pika_config.yaml` | 下次启动行为树 | `/pika_control_router` |
| 夹爪（right / left / mid） | `gripper.yaml` | 重启 bringup | 无 |

这几张表之所以生效时机不同：行为树由 `bt-start` 启动，`control_router.launch.py` 在每次启动时重新读
`policy_task`、`behavior_tree`、`policy_router`、`pika_config`；驱动和 `gripper_manager` 只在 bringup 容器启动时读
`realman_motion.yaml` 和 `gripper.yaml`（`realman_motion.yaml` 也会在行为树启动时转给路由，所以改它要重启 bringup，
重启后行为树需要重新启动）。

刻意不放进清单的：

- 夹爪开合位置 `open_position` / `close_position`：控制页的夹爪卡片在运行时就能改，改动存在 `gripper_overrides.yaml`，
  会盖过 `gripper.yaml`。
- `hard_max_*`：SDK 硬上限，只作为对应参数的「最大」显示。
- 字符串、话题名、提示词、可变长度的列表（比如 `object_detection.exclude_xywh`）。

## 怎么用

1. 在「新值」列输入，回车暂存并跳到下一行；不按回车、直接点别处（包括「写入配置」）也会暂存，不合法的值留在格子里标红（Shift+回车上一行，Esc 清空，↑/↓ 换行，空单元格按 Delete 取消暂存）。
   布尔值用下拉框，选了就暂存。超出范围或违反约束（比如关节下限不能高于上限）的值会标红，不进暂存。暂存只保存在
   这个浏览器里，刷新不丢。
2. 点「写入配置」。服务端先演练一遍（`dry_run`），弹窗列出每项旧值 → 新值、要重启 bringup 的项数和 unified diff；
   确认后才真正写入。
3. 看「生效」列：
   - 能读回的参数：运行值等于文件值显示「已生效」，不等显示「待生效」，节点没在运行显示「未运行」，
     节点在运行但没有这个参数（版本较旧或键名改过）显示「未声明」。
   - 驱动和夹爪参数：写入后显示「待重启」，页面顶部出现「重启 bringup」按钮（和控制页的重启按钮是同一个接口，
     两次点击确认）。用别的方式重启过的，点「知道了」清掉提示。
   - 行为树正在运行时，暂存或待生效的参数会提示「运行中的树不会使用新值」。

表格列：`# | 参数 | 备注 | 文件 | 基线值 | 文件值 | 运行值 | 暂存 | 新值 | 最小 | 最大 | 单位 | 生效`。「最大」「最小」
已经算上了引用的另一个参数（悬停可以看到是哪一个，它暂存的新值也算在内）。

## 写入的保护措施

- 只接受清单里的 id；类型、范围、`special`（例如 `-1` = 不限）和 `max_ref` / `min_ref` 约束在浏览器和服务端各查一遍。
- 浮点参数写回时总带小数点（`0.2`、`8.0`）。rclpy 路由按 YAML 里的类型声明参数，浮点写成整数会让它启动失败。
- 写入前用 `yaml.compose` 找到目标值的精确字符位置，只替换那一段；替换后重新解析，和原文档对比必须**只有**目标值变了，
  否则拒绝。
- 请求带上页面读到的文件 sha256，文件在这期间被别人改过就返回 409，页面重新读取，暂存保留。
- 同目录临时文件 + `os.replace`，并把属主和权限改回原文件的（宿主机上 `config/ros` 属于普通用户，容器里是 root）。
  一次写多个文件时，任何一个失败都会把已经写的文件恢复原样。
- 接口和 :8765 其他写操作一样只做同源校验，不需要口令。服务端日志里会记一行谁在什么时候改了什么。

## 历史、基线和补丁

状态都在 `logs/param-tuning/`（容器里 `/opt/rm65_ws/logs/param-tuning/`）：

| 文件 | 内容 |
| --- | --- |
| `history.jsonl` | 每次写入一行：时间、逐项旧值 / 新值、每个文件写入前后的 sha、diff；撤回的记录带 `reverts` |
| `backups/<记录 id>/ros/*.yaml` | 每次写入前的原文件 |
| `baseline/ros/*.yaml`、`baseline.json` | 页面第一次改某个文件之前的副本 |
| `state.json` | 每个文件最后一次由页面写出的 sha、「待重启」列表 |

- **撤回**：「修改历史」里每条都有「撤回」。它把那条记录里的每一项改回旧值，走同样的演练和确认，记成一条新记录。
  如果某项之后又被改过，确认框会列出来（照样改回）。
- **基线值**：有基线时显示基线里的值，否则就是当前文件值；文件值和基线不同的单元格会高亮。
- **导出补丁**：基线到当前文件的 unified diff，路径头是 `a/config/ros/...`，在仓库根目录 `git apply` 后提 PR。
- **重置基线**：改动合进仓库并重新部署后点它（两次确认），旧基线挪到 `baseline-archive/<时间>/`，以后从当前文件重新开始。
- 某个文件在页面外被改过（手改、重新部署）时，页面会标出来；补丁仍以基线为准。

## 加一个参数

1. 在清单对应的组里加一行：`key`（相对组 `prefix` 的点分路径）、`type`（`int` / `float` / `bool` / `int[]` / `float[]`）、
   `min` / `max`、`unit`、`note`（必填，中文）。数组还要 `labels`（每个元素一行）。需要时加 `special`、
   `max_ref` / `min_ref`（`{key: ..., strict: true}` 表示严格小于 / 大于）、`label`（显示名）。
2. 路径语法：映射键 `a.b`、列表下标 `a[2]`、按字段选列表项 `buses[port=/dev/realman/gripper_{i}]`；`{i}` 换成组的
   `instances` 里的每个名字。
3. 能读回就给组写 `readback: {node: /节点名, param: "模板{key}"}`；参数名在 launch 文件里被改过的，在参数上单独写
   `readback` 覆盖。
4. 跑 `test_param_tuning.py`：`test_root_catalog_matches_the_root_config` 会检查每一行在文件里存在、类型对、当前值在
   范围内、满足引用约束。
5. 重启 `realman_web_control` 容器（清单只在启动时读）。

## 部署要求

- `config/docker/compose.yaml` 的 `realman_web_control` 服务要把 `./config/ros` 以读写方式挂进去（和 bringup 一样）。
  这个挂载是创建容器时定的，所以第一次部署要**重建** web_control 容器，`restart` 不够。没重建的容器里页面是只读的，
  顶部会说明原因，其他功能不受影响。
- `config/ros/realman_web_control.yaml` 的 `param_tuning.catalog_file` 置空即关闭这一页（`/api/params*` 返回 404）。

## 接口

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/params` | 清单展开后的行、文件 sha、是否可写、清单错误、页面外修改、待重启 |
| GET | `/api/params/readback` | 每行的运行值和「已生效 / 待生效 / 未运行 / 未声明」 |
| POST | `/api/params/apply` | `{changes: [{id, value}], expected_sha, dry_run}`；400 逐项原因，409 文件已变或只读 |
| POST | `/api/params/revert` | `{entry, expected_sha, dry_run}` |
| GET | `/api/params/history` | 最近 100 条记录 |
| GET | `/api/params/export` | 补丁（下载） |
| POST | `/api/params/baseline/reset` | 归档基线 |
| POST | `/api/params/pending/clear` | 清掉待重启（通过 `/api/docker/restart` 重启成功时自动清） |

## 排错

- **页面只读**：web_control 容器没有以读写方式挂 `./config/ros`，见「部署要求」。
- **某些参数不见了，顶部提示清单对不上**：配置文件里删了或改了那个键、类型变了；改清单或配置，让清单测试通过。
- **一直「待生效」**：写入后还没重启行为树。停止当前的树再启动。
- **运行值一直「未运行」**：对应节点没起来（行为树没在运行时三个节点都不在），或者 `GetParameters` 超过
  `param_tuning.readback_timeout_sec` 没应答。
- **运行值显示「未声明」**：节点在运行，但它的版本没有声明这个参数（比如机器人上的执行器比仓库旧）。
  `GetParameters` 只要有一个名字未声明就整个请求不回值，所以页面会先用 `ListParameters` 查出节点声明了哪些参数，
  只读这些，其余标「未声明」；节点消失再出现时重新查。
- **写入时提示文件已被修改**：别人刚改过同一个文件（另一个浏览器、手改）。页面已经重新读取，确认 diff 后再写一次。

## 代码在哪

| 位置 | 内容 |
| --- | --- |
| `src/driver/realman_web_control/realman_web_control/param_tuning.py` | 清单解析、精确改写、校验、写入、历史、基线、补丁（不依赖 ROS） |
| `src/driver/realman_web_control/realman_web_control/param_readback.py` | `GetParameters` / `ListParameters` 读回（不依赖 rclpy，节点注入客户端） |
| `src/driver/realman_web_control/realman_web_control/web_server.py` | `/api/params*` 接口 |
| `src/driver/realman_web_control/web/params.html`、`web/src/params.ts`、`web/src/params.css` | 页面 |
| `src/driver/realman_web_control/test/test_param_tuning.py`、`test_param_readback.py`、`test_param_api.py` | pytest（无 ROS，CI 运行） |
| `website/tests/web-control/params.spec.ts` | Playwright |
