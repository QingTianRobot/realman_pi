// What each registered behavior-tree node does, written from its C++ source. Ports (names, defaults, descriptions)
// are NOT here: they are extracted from providedPorts() at build time (website/scripts/bt-catalog.mjs), and the e2e
// test fails if a registered tag has no entry below.
export type NodeCategory = "control" | "decorator" | "condition" | "action";

export type NodeDoc = {
  category: NodeCategory;
  summary: string;
  success: string;
  failure: string;
  running: string;
  halt: string;
  blackboard?: string;
  page?: string; // developer-manual page (and anchor) with the long form
};

export const categoryLabels: Record<NodeCategory, string> = {
  control: "控制节点",
  decorator: "装饰节点",
  condition: "条件节点",
  action: "动作节点",
};

const holdsControl = {
  success: "不会返回",
  failure: "不会返回",
  running: "始终返回 RUNNING：在树中表示该输入正持有控制权，实际指令由对应的 router 进程转发",
  halt: "清除“已记录进入”的标记，下次进入分支时重新记录事件",
};

export const nodeDocs: Record<string, NodeDoc> = {
  Sequence: {
    category: "control",
    summary: "有状态的顺序执行：记住正在运行的子节点，下一拍从该节点继续，已成功的子节点不会重新执行。",
    success: "所有子节点依次成功",
    failure: "任一子节点失败；同时 halt() 全部子节点并把游标归零",
    running: "当前子节点返回 RUNNING",
    halt: "游标归零并 halt() 子节点，下次从第一个子节点重新开始",
    page: "./behavior-tree-control#任务控制节点",
  },
  ReactiveSequence: {
    category: "control",
    summary: "每一拍都从第一个子节点重新评估。放在 guard 之后时，条件一旦变化，就会立即中断后面正在运行的分支。",
    success: "本拍所有子节点都成功",
    failure: "某个子节点失败；其后的子节点被 halt()",
    running: "某个子节点返回 RUNNING；此前另一个处于 RUNNING 的子节点会被 halt()",
    halt: "清除运行中子节点的记录，并 halt() 全部子节点",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  Fallback: {
    category: "control",
    summary: "有状态的优先级列表：依次尝试子节点，第一个成功即整体成功；已处于 RUNNING 的子节点不会被重新评估。",
    success: "某个子节点成功；同时 halt() 全部子节点并把游标归零",
    failure: "全部子节点都失败",
    running: "当前候选子节点返回 RUNNING",
    halt: "游标归零并 halt() 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  ReactiveFallback: {
    category: "control",
    summary: "每一拍都从第一个子节点重新尝试。它是输入路由的根节点：哪个分支的 guard 先成功，哪个分支就持有控制权。",
    success: "某个子节点成功；同时 halt() 全部子节点",
    failure: "全部子节点都失败",
    running: "某个子节点返回 RUNNING；此前另一个处于 RUNNING 的分支会被 halt()",
    halt: "清除运行中子节点的记录，并 halt() 全部子节点",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  Repeat: {
    category: "decorator",
    summary: "子节点每成功一次计为一轮，达到 num_cycles 轮才返回成功。每轮之间会 halt() 子节点，因此下一轮从头开始。",
    success: "完成第 num_cycles 轮",
    failure: "子节点失败（计数清零）",
    running: "子节点返回 RUNNING；或刚完成一轮但未达到轮数，此时本拍 halt() 子节点并返回 RUNNING，下一拍开始新一轮",
    halt: "计数清零并 halt() 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  Retry: {
    category: "decorator",
    summary: "子节点失败时先 halt() 再重新执行，num_attempts 包含首次尝试；返回 RUNNING 不消耗次数。",
    success: "子节点成功（次数清零）",
    failure: "失败次数达到 num_attempts",
    running: "子节点返回 RUNNING；或失败后仍有剩余次数，此时本拍 halt() 子节点并返回 RUNNING",
    halt: "次数清零并 halt() 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  RetryUnlessFault: {
    category: "decorator",
    summary: "与 Retry 相同，但如果失败的叶节点已把黑板键 policy_fault 置为 true，会立即返回失败，不再消耗剩余次数。置位 policy_timeout 的失败（策略服务超时）按 timeout_attempts 单独计数，不占用 num_attempts，并在等待 timeout_backoff_sec 后才重试。",
    success: "子节点成功",
    failure: "policy_fault 已置位，或失败次数达到 num_attempts，或超时次数达到 timeout_attempts（此时在 policy_failure_reason 前加上 policy server timed out N times; last: ）",
    running: "子节点返回 RUNNING；或发生可重试的失败，此时 halt() 子节点并返回 RUNNING；超时后的等待期间也返回 RUNNING，且不 tick 子节点",
    halt: "结束本次运行（包括正在进行的等待），并清除 policy_fault 和 policy_timeout",
    blackboard: "读取 policy_fault、policy_timeout；每次运行开始时和被 halt() 时清除这两个键，因此上一次的标志不会影响新一轮的首次尝试；policy_timeout 在每次超时重试前也会清除。超时次数耗尽时改写 policy_failure_reason",
    page: "./behavior-tree-control#任务控制节点",
  },
  SelectInputMode: {
    category: "action",
    summary: "每一拍向协调器查询本拍应运行的模式，并处理 select_input_mode 请求以及经由 none 的中性切换。",
    success: "总是返回成功，并把结果写入 selected_mode",
    failure: "不会返回",
    running: "不会返回",
    halt: "无状态",
    blackboard: "写入 selected_mode",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  InputModeGuard: {
    category: "condition",
    summary: "模式分支的入口条件：selected_mode 等于本分支的 mode 时才成功。节点构造时会把 mode、label、selectable 登记到模式目录，因此新增模式只需修改 XML。",
    success: "selected_mode 等于 mode",
    failure: "当前选中的是其他模式",
    running: "不会返回",
    halt: "无状态",
    blackboard: "读取 selected_mode",
    page: "./behavior-tree-control",
  },
  ActivateInputMode: {
    category: "action",
    summary: "通知协调器该模式已进入，并发布 ACTIVE。它放在准备动作之后，因此准备失败时永远不会发布 ACTIVE。",
    success: "协调器接受激活",
    failure: "缺少 mode，或协调器拒绝（例如该模式并非当前选中的模式）",
    running: "不会返回",
    halt: "无状态",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  FailInputMode: {
    category: "action",
    summary: "把任务级失败转为输入模式 FAILED（detail 取自 reason），协调器随后切换到安全模式 none。每次进入只报告一次。",
    success: "不会返回",
    failure: "不会返回",
    running: "始终返回 RUNNING，直到协调器把路由切换到 none、该分支被 halt()",
    halt: "清除“已报告”的标记",
    blackboard: "reason 通常重映射到 {policy_failure_reason}",
    page: "./policy-task#节点",
  },
  PrepareKeyboardWork: {
    category: "action",
    summary: "进入键盘模式前，调用 /l|r/coordinates/select_work，把两臂切换到坐标注册表中的默认 WORK 坐标系，并核对读回的名称。",
    success: "两臂均返回 success，且 active_name 与配置一致；完成后保持 SUCCESS",
    failure: "任一服务拒绝请求、抛出异常，或读回的名称不一致",
    running: "等待两个服务回应",
    halt: "清空进度，下次进入时重新选择",
    page: "./behavior-tree-control",
  },
  WebInputStub: {
    category: "action",
    summary: "Web 分支的占位叶节点：Web 控制页直接发送 Action，树中只负责占住控制权。",
    ...holdsControl,
    halt: "无状态",
  },
  PolicyInputStub: {
    category: "action",
    summary: "policy 任务的全部周期完成后，分支停留在这里：桥接已停止，控制权仍属于 policy。",
    ...holdsControl,
    page: "./policy-task#树的结构",
  },
  KeyboardVelocityInput: {
    category: "action",
    summary: "键盘分支的输入叶节点；速度会话由 keyboard_control_router 管理。",
    ...holdsControl,
    page: "./behavior-tree-control",
  },
  PikaInputStub: {
    category: "action",
    summary: "旧版 Pika 占位叶节点，当前 control.xml 未使用。",
    ...holdsControl,
  },
  PikaPositionInput: {
    category: "action",
    summary: "Pika 位置控制分支的输入叶节点；指令由 pika_control_router 转发。",
    ...holdsControl,
    page: "./pika-teleop",
  },
  PikaVelocityInput: {
    category: "action",
    summary: "Pika 速度控制分支的输入叶节点；指令由 pika_control_router 转发。",
    ...holdsControl,
    page: "./pika-teleop",
  },
  PikaMixedInput: {
    category: "action",
    summary: "Pika Mixed 分支的输入叶节点；指令由 pika_control_router 转发。",
    ...holdsControl,
    page: "./pika-teleop",
  },
  IdleInput: {
    category: "action",
    summary: "none 分支的叶节点：不执行任何操作，始终返回 RUNNING。none 既是切换时的中性分支，也是失败后的安全回退。",
    success: "不会返回",
    failure: "不会返回",
    running: "始终返回 RUNNING",
    halt: "无状态",
  },
  MoveJ: {
    category: "action",
    summary: "单臂关节运动：向 /<arm_id>/execute_motion 发送一个 MoveJ goal，并等待结果。",
    success: "Action 成功；完成后保持 SUCCESS，直到被 halt()",
    failure: "goal 被拒绝、执行失败或超时",
    running: "goal 执行中",
    halt: "提交取消请求，由执行器的独立 timer 完成取消流程",
    page: "./behavior-tree-motion",
  },
  ThreeArmMoveJ: {
    category: "action",
    summary: "三臂同步关节运动：同时向 l、m、r 发送 MoveJ goal，三者都完成才算成功。policy 和 Pika 分支用它回到 pika_default_pose。",
    success: "三个 goal 均成功；完成后保持 SUCCESS，直到被 halt()，因此有状态的 Sequence 不会重复执行它",
    failure: "任一 goal 被拒绝、失败或超时",
    running: "仍有 goal 未完成",
    halt: "取消三臂尚未完成的 goal",
    blackboard: "关节角通常重映射到 {pika_l|m|r_joint_degrees}，由 launch 从 pika_config.yaml 注入",
    page: "./behavior-tree-motion",
  },
  CartesianVelocityForDuration: {
    category: "action",
    summary: "在指定参考系中以给定的线速度和角速度运动一段时间后停止，用于调试和演示树。",
    success: "运动 duration_sec 后正常停止",
    failure: "速度 Action 被拒绝或中途失败",
    running: "运动中",
    halt: "取消速度会话",
    page: "./behavior-tree-motion",
  },
  GripperReady: {
    category: "action",
    summary: "每次 policy 尝试的第一步：确认夹爪已张开。如果夹爪在闭合状态下开始，策略会直接进入搬运并松手。",
    success: "最新的位置读数不超过 gripper_ready.open_position_max",
    failure: "服务缺失、没有位置数据、open 被拒绝或超时：判为故障（置位 policy_fault），重试无法解决",
    running: "已调用一次 /<gripper>/open，正在等待位置读数回到阈值以内",
    halt: "清空进度",
    blackboard: "失败时写入 policy_fault、policy_failure_reason",
    page: "./policy-task#节点",
  },
  PolicyRun: {
    category: "action",
    summary: "运行并监督一次策略尝试：预检（包括切换到 task 对应的 prompt，并确认桥接已采用）、激活桥接、按任务的完成条件判定，最后按固定顺序停止。",
    success: "release_over_bin：在收纳盒一侧放手，且曾夹住物体；lift_and_hold：抬起后仍夹住物体",
    failure: "可重试的失败（抓空、掉落、超时、卡死）只写入原因；策略服务超时（桥接因推理超时而暂停、统计中断、预检时桥接未就绪、激活无回应）还会置位 policy_timeout；不可重试的失败（越界、数据丢失、执行了错误的任务）还会置位 policy_fault",
    running: "正在预检、等待激活、监督，或执行停止顺序",
    halt: "立即发出 deactivate 和两个急停调用（不等待回应），轨迹文件记为 result=halted",
    blackboard: "写入 policy_attempt_result、policy_grasp_verdict、policy_attempt_sec、policy_armed；失败时写入 policy_failure_reason（故障时还会写入 policy_fault，策略服务超时还会写入 policy_timeout）",
    page: "./policy-task#一次尝试",
  },
};

// The attribute shown next to a node's tag in the outline: the one a reader uses to tell siblings apart.
export function nodeLabel(attrs: Record<string, string>): string {
  return attrs.name ?? attrs.mode ?? attrs.task ?? "";
}
