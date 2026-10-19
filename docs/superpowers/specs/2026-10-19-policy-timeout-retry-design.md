# Policy 服务超时重试（行为树）

2026-10-19。在 [policy 任务设计](./2026-10-14-policy-task-in-bt-design.md) 的基础上，为行为树新增"策略服务超时后重试"。

## 问题

`max_attempt_sec`（45 s 内没有完成）早已判为可重试的 `timeout`，与抓空、卡死共用 `attempts: 3`。真正让任务中断的是策略**服务侧**的超时，而它们原先都被判为故障（`policy_fault`），一次都不会重试：

- serve 容器重启后，第一次推理要 JIT 编译约 26 s，期间会阻塞 WebSocket 循环。桥接的推理请求每次在 1.5 s 后超时，连续 5 次后桥接自行暂停，`PolicyRun` 随即报出 "paused itself" 故障。
- Wi-Fi 被 Pika 定位程序挤占时（2026-10-14），往返时间升到 2–3 s，结果相同。
- 桥接的统计中断超过 `stats_stale_sec`、预检时桥接迟迟未就绪、`/policy/activate` 无回应，同样都判为故障。

此外，暂停的桥接还会卡住下一次预检：原先 `paused` 是预检的阻塞项，而只有 `/policy/activate` 才能解除暂停。

## 方案

在叶节点和装饰节点之间新增第三类失败 `policy_timeout`，与 `policy_fault` 并列，作为黑板标志使用。树的形状不变，`RetryUnlessFault` 增加两个端口。

| 位置 | 改动 |
| --- | --- |
| `PolicySupervisor` | 新增结果 `kPolicyTimeout`（`policy_timeout`），可重试、不是故障。桥接 `paused=1` 和统计中断从故障改为这个结果。尝试开始前收到的暂停状态不计入，因为激活刚刚解除了它 |
| `PolicyRun` | 预检超时时，如果缺的**只有**桥接本身（三个 `/policy/*` 服务或 `/policy/stats`），判为 `policy_timeout`；其余情况（三臂或夹爪数据、路由服务、桥接不在 policy 模式、prompt 不一致、桥接版本过旧）仍判为故障。`/policy/activate` 无回应时判为 `policy_timeout`，并照常执行停止顺序。暂停不再阻塞预检。结束时置位黑板 `policy_timeout`，事件级别为 `WARN` |
| `RetryUnlessFault` | 新增端口 `timeout_attempts`（默认 0，`-1` 不限）和 `timeout_backoff_sec`（默认 0）。`policy_timeout` 失败不占用 `num_attempts`，按 `timeout_attempts` 单独计数；重试前先 `halt()` 子树，再等待 `timeout_backoff_sec`（期间返回 `RUNNING`，不 tick 子节点）。次数耗尽时，在 `policy_failure_reason` 前加上 `policy server timed out N times; last: ` 并返回失败。`policy_fault` 优先于 `policy_timeout`。端口为 0 时保持原有行为：超时按普通失败计数，不等待 |
| `policy_task.yaml` | 新增 `timeout_retry: {attempts: 3, backoff_sec: 20.0}`。执行器把它们写入黑板，键名为 `policy_timeout_attempts` 和 `policy_timeout_backoff_sec` |
| `control.xml` | `RetryUnlessFault` 增加 `timeout_attempts="{policy_timeout_attempts}"` 和 `timeout_backoff_sec="{policy_timeout_backoff_sec}"` |

**分类原则**：桥接"不在或不应答"（服务缺失、统计中断、推理超时导致暂停、激活无回应）属于超时，等一等可能恢复；桥接"在线但不一致"（不在 policy 模式、prompt 不对、版本过旧）以及机器人自身的问题属于故障，重试无济于事。

**两次尝试之间**：停止顺序不变（`deactivate` → 两个急停 → 等待路由释放）。之后等待 `backoff_sec`，桥接在此期间保持停止，再执行 `GripperReady` → `policy_rehome` → `PolicyRun`。等待期间切换模式会触发 `halt()`，立即结束等待并清除标志。

**最终失败**：经原有的 `Fallback` → `FailInputMode` 进入 `FAILED` → `none`，原因形如 `policy server timed out 3 times; last: the policy bridge paused itself ...`。

## 默认值

`attempts: 3`、`backoff_sec: 20`。桥接经过约 8 s 的连续超时才会暂停，加上 20 s 的等待，覆盖了约 26 s 的 JIT 编译。服务彻底宕机时，每次超时约需 10 s 预检，加上 20 s 等待和回位，大约一分半后进入 `FAILED`。不按每个周期单独配置，而是在每个周期（每次 `RetryUnlessFault` 运行）内重新计数。

## 未做

- 不检测"进程在跑但策略没有输出"（夹爪张开、指令为零）。这类情况仍由 `max_attempt_sec` 判为 `timeout`。
- 不自动预热 serve 容器。重启后仍建议先手动做一次推理。
- 桥接本身的 `infer_timeout_s` 和 `failure_pause_threshold` 不变。

## 测试

`test_retry_unless_fault_node`（单独计数、等待、原因前缀、故障优先、`halt` 与跨周期重置、默认 0 时行为不变）、`test_policy_supervisor`（暂停和统计中断判为 `policy_timeout`，开始前的暂停状态不计入）、`test_policy_run_node`（桥接缺失和统计中断判为超时，同时缺机器人数据时仍判为故障；激活无回应时照常停止；运行中暂停或统计中断；开始前已暂停的桥接由激活恢复）、`test_policy_task_config` / `params` / `config_file`、`test_control_router_tree`、站点 e2e（模拟器新增两个场景）。实现的变异测试见提交说明。
