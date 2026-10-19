// A tick-by-tick model of the policy task subtree for the documentation. The control and decorator nodes follow
// their C++ implementations line for line (third_party/behavior_tree_cpp/bt_nodes and retry_unless_fault_node.hpp):
// Sequence and Fallback keep a cursor, Repeat and Retry halt the child and return RUNNING for one tick before the
// next round, RetryUnlessFault clears policy_fault when a run starts and when it is halted. Only the leaves are
// scripted: each scenario says how every PolicyRun attempt ends.
export type XmlNode = { tag: string; attrs: Record<string, string>; children: XmlNode[]; note: string | null };
export type Status = "idle" | "running" | "success" | "failure";

export type OutcomeKind = "success" | "retry" | "fault";
export const outcomes: Record<string, { kind: OutcomeKind; reason: string; grasp: string }> = {
  released_held: { kind: "success", reason: "", grasp: "held" },
  lifted_held: { kind: "success", reason: "", grasp: "held" },
  released_empty: { kind: "retry", reason: "released over the bin but the jaws closed on nothing", grasp: "empty" },
  dropped: { kind: "retry", reason: "the object slipped out of the closed jaws", grasp: "empty" },
  timeout: { kind: "retry", reason: "no release within 45 s", grasp: "" },
  stall: { kind: "retry", reason: "the gripper is closed and the policy has not moved for 8 s", grasp: "" },
  fault: { kind: "fault", reason: "joint J5 = 18.4 deg is outside [20.0, 108.2]", grasp: "" },
  wrong_task: { kind: "fault", reason: "the arm turned to the bin side although the task is lift-and-hold", grasp: "" },
};

export type Scenario = {
  id: string;
  label: string;
  task: "place" | "pick";
  cycles: number;
  attempts: number;
  results: string[]; // how each PolicyRun attempt ends, in order; the last one repeats
  gripperStuck?: boolean;
};

export const scenarios: Scenario[] = [
  { id: "place-first", label: "放置 · 一次成功", task: "place", cycles: 1, attempts: 3, results: ["released_held"] },
  { id: "place-retry", label: "放置 · 抓空后重试成功", task: "place", cycles: 1, attempts: 3, results: ["released_empty", "released_held"] },
  { id: "place-exhaust", label: "放置 · 次数耗尽", task: "place", cycles: 1, attempts: 3, results: ["released_empty", "timeout", "stall"] },
  { id: "place-fault", label: "放置 · 关节越界（故障）", task: "place", cycles: 1, attempts: 3, results: ["fault"] },
  { id: "two-cycles", label: "两个周期", task: "place", cycles: 2, attempts: 3, results: ["released_held", "released_empty", "released_held"] },
  { id: "pick-lift", label: "抓起 · 掉落后重试成功", task: "pick", cycles: 1, attempts: 3, results: ["dropped", "lifted_held"] },
  { id: "pick-wrong", label: "抓起 · 跑成了放置任务", task: "pick", cycles: 1, attempts: 3, results: ["wrong_task"] },
  { id: "gripper-stuck", label: "夹爪张不开", task: "place", cycles: 1, attempts: 3, results: ["released_held"], gripperStuck: true },
];

// Ticks a leaf stays RUNNING before it finishes, so each phase is visible.
const MOVE_TICKS = 2;
const GRIPPER_TICKS = 1;
const POLICY_PHASES = ["预检：服务、数据、prompt", "激活 /policy/activate", "监督中", "停止：deactivate → 两个急停"];

type State = { status: Status; cursor: number; count: number; progress: number; runActive: boolean; reported: boolean; detail: string };

export class PolicyTaskSim {
  readonly root: XmlNode;
  readonly ids = new Map<XmlNode, string>();
  tick = 0;
  attempt = 0; // PolicyRun attempts started so far
  blackboard: Record<string, string> = {};
  mode = "SWITCHING → policy";
  log: string[] = [];
  finished = false;
  private states = new Map<XmlNode, State>();

  constructor(root: XmlNode, readonly scenario: Scenario) {
    this.root = root;
    const assign = (node: XmlNode, id: string) => {
      this.ids.set(node, id);
      node.children.forEach((child, index) => assign(child, `${id}.${index}`));
    };
    assign(root, "0");
  }

  state(node: XmlNode): State {
    let state = this.states.get(node);
    if (!state) {
      state = { status: "idle", cursor: 0, count: 0, progress: 0, runActive: false, reported: false, detail: "" };
      this.states.set(node, state);
    }
    return state;
  }

  step(): void {
    if (this.finished) return;
    this.tick += 1;
    this.run(this.root);
  }

  private say(text: string) {
    this.log.unshift(`#${this.tick} ${text}`);
    if (this.log.length > 60) this.log.pop();
  }

  private number(value: string | undefined, fallback: number): number {
    if (value === "{policy_cycles}") return this.scenario.cycles;
    if (value === "{policy_attempts}") return this.scenario.attempts;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private halt(node: XmlNode) {
    const state = this.state(node);
    if (node.tag === "RetryUnlessFault") {
      state.runActive = false;
      delete this.blackboard.policy_fault;
    }
    if (node.tag === "PolicyRun" && state.status === "running") this.say("PolicyRun 被 halt：发出停止调用，轨迹写 result=halted");
    state.cursor = 0;
    state.count = 0;
    state.progress = 0;
    state.reported = false;
    state.status = "idle";
    state.detail = "";
    node.children.forEach((child) => this.halt(child));
  }

  private finish(node: XmlNode, status: Status): Status {
    this.state(node).status = status;
    return status;
  }

  private run(node: XmlNode): Status {
    const state = this.state(node);
    switch (node.tag) {
      case "Sequence": {
        while (state.cursor < node.children.length) {
          const status = this.run(node.children[state.cursor]);
          if (status === "running") return this.finish(node, "running");
          if (status === "failure") {
            node.children.forEach((child) => this.halt(child));
            state.cursor = 0;
            return this.finish(node, "failure");
          }
          state.cursor += 1;
        }
        state.cursor = 0;
        return this.finish(node, "success");
      }
      case "Fallback": {
        while (state.cursor < node.children.length) {
          const status = this.run(node.children[state.cursor]);
          if (status === "running") return this.finish(node, "running");
          if (status === "success") {
            node.children.forEach((child) => this.halt(child));
            state.cursor = 0;
            return this.finish(node, "success");
          }
          state.cursor += 1;
        }
        state.cursor = 0;
        return this.finish(node, "failure");
      }
      case "Repeat": {
        const cycles = this.number(node.attrs.num_cycles, 1);
        const status = this.run(node.children[0]);
        if (status === "success") {
          state.count += 1;
          if (cycles < 0 || state.count < cycles) {
            this.say(`Repeat：第 ${state.count} 轮完成，halt 子树，下一拍开始第 ${state.count + 1} 轮`);
            this.halt(node.children[0]);
            state.detail = `${state.count} / ${cycles < 0 ? "∞" : cycles} 轮`;
            return this.finish(node, "running");
          }
          state.count = 0;
          state.detail = `${cycles} / ${cycles} 轮`;
          this.say("Repeat：全部周期完成");
          return this.finish(node, "success");
        }
        if (status === "failure") state.count = 0;
        state.detail = `${state.count} / ${cycles < 0 ? "∞" : cycles} 轮`;
        return this.finish(node, status);
      }
      case "RetryUnlessFault": {
        const attempts = this.number(node.attrs.num_attempts, 1);
        if (!state.runActive) {
          state.runActive = true;
          state.count = 0;
          delete this.blackboard.policy_fault;
        }
        const status = this.run(node.children[0]);
        if (status === "failure") {
          state.count += 1;
          const fault = this.blackboard.policy_fault === "true";
          if (!fault && (attempts < 0 || state.count < attempts)) {
            this.say(`RetryUnlessFault：第 ${state.count} 次失败，可重试，halt 子树，下一拍重来`);
            this.halt(node.children[0]);
            state.detail = `已失败 ${state.count} / ${attempts}`;
            return this.finish(node, "running");
          }
          this.say(fault ? "RetryUnlessFault：policy_fault 已置位，不再重试" : `RetryUnlessFault：${attempts} 次都失败`);
          state.runActive = false;
          state.count = 0;
          state.detail = fault ? "故障，停止" : "次数耗尽";
          return this.finish(node, "failure");
        }
        if (status === "success") {
          state.runActive = false;
          state.count = 0;
        }
        state.detail = `已失败 ${state.count} / ${attempts}`;
        return this.finish(node, status);
      }
      default:
        return this.finish(node, this.leaf(node, state));
    }
  }

  private leaf(node: XmlNode, state: State): Status {
    switch (node.tag) {
      case "ThreeArmMoveJ": {
        if (state.status === "success") return "success"; // latched until halted
        state.progress += 1;
        if (state.progress <= MOVE_TICKS) {
          state.detail = `三臂移动中 ${state.progress}/${MOVE_TICKS}`;
          return "running";
        }
        state.detail = "已到 pika_default_pose";
        this.say(`${node.attrs.name ?? "ThreeArmMoveJ"}：三臂到位`);
        return "success";
      }
      case "ActivateInputMode":
        if (this.mode !== "ACTIVE/policy") this.say("ActivateInputMode：发布 ACTIVE/policy");
        this.mode = "ACTIVE/policy";
        return "success";
      case "GripperReady": {
        if (state.status === "success") return "success";
        state.progress += 1;
        if (this.scenario.gripperStuck) {
          if (state.progress <= 2) {
            state.detail = "已调用 open，等位置回落";
            return "running";
          }
          this.blackboard.policy_fault = "true";
          this.blackboard.policy_failure_reason = "gripper_right did not open within 20 s";
          this.say("GripperReady：夹爪张不开 → 置 policy_fault");
          return "failure";
        }
        if (state.progress <= GRIPPER_TICKS) {
          state.detail = "已调用 open，等位置回落";
          return "running";
        }
        state.detail = "夹爪已张开";
        return "success";
      }
      case "PolicyRun": {
        if (state.progress === 0) {
          this.attempt += 1;
          this.say(`PolicyRun：第 ${this.attempt} 次尝试开始（task=${this.scenario.task}）`);
        }
        state.progress += 1;
        if (state.progress <= POLICY_PHASES.length) {
          state.detail = POLICY_PHASES[state.progress - 1];
          return "running";
        }
        const results = this.scenario.results;
        const result = results[Math.min(this.attempt - 1, results.length - 1)];
        const outcome = outcomes[result];
        this.blackboard.policy_attempt_result = result;
        this.blackboard.policy_grasp_verdict = outcome.grasp || "n/a";
        state.detail = result;
        if (outcome.kind === "success") {
          delete this.blackboard.policy_failure_reason;
          this.say(`PolicyRun → SUCCESS（${result}）`);
          return "success";
        }
        this.blackboard.policy_failure_reason = outcome.reason;
        if (outcome.kind === "fault") this.blackboard.policy_fault = "true";
        this.say(`PolicyRun → FAILURE（${result}${outcome.kind === "fault" ? "，置 policy_fault" : "，可重试"}）`);
        return "failure";
      }
      case "PolicyInputStub":
        if (!state.reported) this.say("全部周期完成：停在 PolicyInputStub，桥接已停，控制权仍属 policy");
        state.reported = true;
        this.mode = "ACTIVE/policy（任务完成）";
        this.finished = true;
        return "running";
      case "FailInputMode":
        if (!state.reported) this.say(`FailInputMode：输入模式 FAILED（${this.blackboard.policy_failure_reason ?? "policy task failed"}），协调器接着切到 none`);
        state.reported = true;
        this.mode = "FAILED → none";
        this.finished = true;
        return "running";
      default:
        return "success";
    }
  }
}

// The policy task subtree of control.xml: the Sequence named policy_entry.
export function findNode(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode | null {
  if (predicate(node)) return node;
  for (const child of node.children) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}
