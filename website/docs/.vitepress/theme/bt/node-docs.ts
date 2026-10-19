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
  running: "一直 RUNNING：它在树里代表“这个输入正拥有控制权”，真正的指令由对应 router 进程转发",
  halt: "清掉“已记录进入”的标记，下次进入分支时再记一次事件",
};

export const nodeDocs: Record<string, NodeDoc> = {
  Sequence: {
    category: "control",
    summary: "有状态的顺序执行：记住正在运行的子节点，下一拍从它继续，前面已成功的子节点不再重跑。",
    success: "所有子节点依次成功",
    failure: "任一子节点失败；同时 halt 全部子节点、游标归零",
    running: "当前子节点 RUNNING",
    halt: "游标归零并 halt 子节点，下次从第一个子节点重新开始",
    page: "./behavior-tree-control#任务控制节点",
  },
  ReactiveSequence: {
    category: "control",
    summary: "每一拍都从第一个子节点重新评估。放在 guard 后面，条件一变就立刻打断后面正在运行的分支。",
    success: "所有子节点这一拍都成功",
    failure: "某个子节点失败；它后面的子节点被 halt",
    running: "某个子节点 RUNNING；之前另一个 RUNNING 的子节点会被 halt",
    halt: "清掉运行中子节点的记录并 halt 全部子节点",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  Fallback: {
    category: "control",
    summary: "有状态的优先级列表：依次尝试，第一个成功即成功；已在 RUNNING 的子节点不会被重新评估。",
    success: "某个子节点成功；halt 全部子节点、游标归零",
    failure: "全部子节点都失败",
    running: "当前候选子节点 RUNNING",
    halt: "游标归零并 halt 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  ReactiveFallback: {
    category: "control",
    summary: "每一拍从第一个子节点重新尝试。输入路由的根：哪个分支的 guard 先成功，哪个分支拥有控制权。",
    success: "某个子节点成功；halt 全部子节点",
    failure: "全部子节点失败",
    running: "某个子节点 RUNNING；之前另一个 RUNNING 的分支被 halt",
    halt: "清掉运行中子节点的记录并 halt 全部子节点",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  Repeat: {
    category: "decorator",
    summary: "子节点每成功一次计一轮，达到 num_cycles 才成功。每轮之间 halt 子节点，所以下一轮从头开始。",
    success: "完成第 num_cycles 轮",
    failure: "子节点失败（计数清零）",
    running: "子节点 RUNNING，或刚完成一轮还没到轮数：这一拍 halt 子节点并返回 RUNNING，下一拍开始新一轮",
    halt: "轮数清零并 halt 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  Retry: {
    category: "decorator",
    summary: "子节点失败时 halt 后重跑，num_attempts 含首次；RUNNING 不消耗次数。",
    success: "子节点成功（次数清零）",
    failure: "失败次数达到 num_attempts",
    running: "子节点 RUNNING，或失败后还有次数：这一拍 halt 子节点并返回 RUNNING",
    halt: "次数清零并 halt 子节点",
    page: "./behavior-tree-control#任务控制节点",
  },
  RetryUnlessFault: {
    category: "decorator",
    summary: "和 Retry 一样，但失败的叶节点若把黑板键 policy_fault 置为 true，立即失败，不再消耗剩余次数。",
    success: "子节点成功",
    failure: "policy_fault 已置位，或失败次数达到 num_attempts",
    running: "子节点 RUNNING，或可重试的失败：halt 子节点并返回 RUNNING",
    halt: "结束这一次运行并清除 policy_fault",
    blackboard: "读 policy_fault；每次运行开始和 halt 时清除它，所以上一次的故障不会挡住新的第一次尝试",
    page: "./behavior-tree-control#任务控制节点",
  },
  SelectInputMode: {
    category: "action",
    summary: "每一拍问协调器“这一拍该运行哪个模式”，处理 select_input_mode 请求和经过 none 的中性切换。",
    success: "总是成功，把结果写到 selected_mode",
    failure: "不会返回",
    running: "不会返回",
    halt: "无状态",
    blackboard: "写 selected_mode",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  InputModeGuard: {
    category: "condition",
    summary: "模式分支的门：selected_mode 等于本分支的 mode 才成功。构造时把 mode / label / selectable 登记进模式目录，所以新增模式只改 XML。",
    success: "selected_mode == mode",
    failure: "选的是别的模式",
    running: "不会返回",
    halt: "无状态",
    blackboard: "读 selected_mode",
    page: "./behavior-tree-control",
  },
  ActivateInputMode: {
    category: "action",
    summary: "告诉协调器“这个模式已经进入”，发布 ACTIVE。放在准备动作之后，准备失败就永远不会 ACTIVE。",
    success: "协调器接受激活",
    failure: "mode 缺失或协调器拒绝（例如它不是当前选中的模式）",
    running: "不会返回",
    halt: "无状态",
    page: "./behavior-tree-control#输入路由-ros-契约",
  },
  FailInputMode: {
    category: "action",
    summary: "把任务级失败变成输入模式 FAILED（detail 是 reason），协调器随后安排安全模式 none。只报告一次。",
    success: "不会返回",
    failure: "不会返回",
    running: "一直 RUNNING，直到协调器把路由切到 none、这个分支被 halt",
    halt: "清掉“已报告”的标记",
    blackboard: "reason 通常重映射到 {policy_failure_reason}",
    page: "./policy-task#节点",
  },
  PrepareKeyboardWork: {
    category: "action",
    summary: "键盘模式进入前，调用 /l|r/coordinates/select_work 把两臂切到坐标注册表里的默认 WORK，并核对读回的名称。",
    success: "两臂都返回 success 且 active_name 与配置一致；完成后保持 SUCCESS",
    failure: "任一服务拒绝、异常或读回名称不一致",
    running: "等两个服务回应",
    halt: "清空进度，下次进入重新选择",
    page: "./behavior-tree-control",
  },
  WebInputStub: { category: "action", summary: "Web 分支的占位叶：Web 控制页直接发 Action，树里只占住控制权。", ...holdsControl, halt: "无状态" },
  PolicyInputStub: { category: "action", summary: "policy 任务的所有周期都完成后，分支停在这里：桥接已停，控制权仍属于 policy。", ...holdsControl, page: "./policy-task#树的形状" },
  KeyboardVelocityInput: { category: "action", summary: "键盘分支的输入叶；速度会话由 keyboard_control_router 管理。", ...holdsControl, page: "./behavior-tree-control" },
  PikaInputStub: { category: "action", summary: "旧版 Pika 占位叶（当前 control.xml 不用）。", ...holdsControl },
  PikaPositionInput: { category: "action", summary: "Pika 位置控制分支的输入叶；转发由 pika_control_router 完成。", ...holdsControl, page: "./pika-teleop" },
  PikaVelocityInput: { category: "action", summary: "Pika 速度控制分支的输入叶；转发由 pika_control_router 完成。", ...holdsControl, page: "./pika-teleop" },
  PikaMixedInput: { category: "action", summary: "Pika Mixed 分支的输入叶；转发由 pika_control_router 完成。", ...holdsControl, page: "./pika-teleop" },
  IdleInput: {
    category: "action",
    summary: "none 分支的叶：什么都不做，一直 RUNNING。none 既是切换时的中性分支，也是失败后的安全回退。",
    success: "不会返回",
    failure: "不会返回",
    running: "一直 RUNNING",
    halt: "无状态",
  },
  MoveJ: {
    category: "action",
    summary: "单臂关节运动：向 /<arm_id>/execute_motion 发一个 MoveJ goal，等到结果。",
    success: "Action 成功；完成后保持 SUCCESS 直到被 halt",
    failure: "goal 被拒绝、执行失败或超时",
    running: "goal 执行中",
    halt: "提交取消，由执行器的独立 timer 排空取消流程",
    page: "./behavior-tree-motion",
  },
  ThreeArmMoveJ: {
    category: "action",
    summary: "三臂同步关节运动：同时给 l、m、r 发 MoveJ goal，三个都完成才成功。policy 和 Pika 分支用它回到 pika_default_pose。",
    success: "三个 goal 都成功；完成后保持 SUCCESS 直到被 halt，所以有状态 Sequence 不会重复执行它",
    failure: "任一 goal 被拒绝、失败或超时",
    running: "还有 goal 没完成",
    halt: "取消三臂未完成的 goal",
    blackboard: "关节角通常重映射到 {pika_l|m|r_joint_degrees}，由 launch 从 pika_config.yaml 注入",
    page: "./behavior-tree-motion",
  },
  CartesianVelocityForDuration: {
    category: "action",
    summary: "在指定参考系下以给定线/角速度运动一段时间，然后停止。用于调试和 demo 树。",
    success: "持续 duration_sec 后正常停止",
    failure: "速度 Action 被拒绝或中途失败",
    running: "运动中",
    halt: "取消速度 session",
    page: "./behavior-tree-motion",
  },
  GripperReady: {
    category: "action",
    summary: "每次 policy 尝试的第一步：确认夹爪张开。闭合着开始，策略会直接搬运并松手。",
    success: "新鲜的位置读数不超过 gripper_ready.open_position_max",
    failure: "服务缺失、没有位置数据、open 被拒绝或超时：故障（置 policy_fault），重试也没用",
    running: "已调用一次 /<gripper>/open，等位置读数回到阈值内",
    halt: "清空进度",
    blackboard: "失败时写 policy_fault、policy_failure_reason",
    page: "./policy-task#节点",
  },
  PolicyRun: {
    category: "action",
    summary: "运行并监督一次策略尝试：预检（含切换到 task 的 prompt 并确认桥接已采用）、激活桥接、按任务的完成条件判定、按固定顺序停止。",
    success: "release_over_bin：在收纳盒一侧放手且夹住过东西；lift_and_hold：抬起并仍夹着",
    failure: "可重试（抓空、掉落、超时、卡死）只写原因；不可重试（越界、数据丢失、桥接暂停、执行了错误的任务）同时置 policy_fault",
    running: "预检、等待激活、监督中，或正在执行停止顺序",
    halt: "立即发出 deactivate 和两个急停（不等回应），轨迹文件写 result=halted",
    blackboard: "写 policy_attempt_result、policy_grasp_verdict、policy_attempt_sec、policy_armed，失败时写 policy_failure_reason（故障还写 policy_fault）",
    page: "./policy-task#一次尝试",
  },
};

// The attribute shown next to a node's tag in the outline: the one a reader uses to tell siblings apart.
export function nodeLabel(attrs: Record<string, string>): string {
  return attrs.name ?? attrs.mode ?? attrs.task ?? "";
}
