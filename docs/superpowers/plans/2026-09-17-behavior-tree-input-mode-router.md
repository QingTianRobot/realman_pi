# Behavior Tree Input Mode Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an explicitly launched, persistent three-arm input-mode behavior tree whose dynamically registered modes appear on the port 8765 Web control page, with sticky Web motion preemption and safe neutral transitions.

**Architecture:** The behavior-tree executor loads mode registrations from XML into a pure C++ registry and transition coordinator, then exposes the catalog and state through ROS 2 services and a transient-local topic. Reactive controls reevaluate the selected mode every tick; the Web control node discovers those interfaces, gates Web motion until `web` is active, and keeps its existing direct-control path when the router is absent. Root `config/` remains authoritative for the control tree and timing values.

**Tech Stack:** ROS 2 Humble (`rclcpp`, `rclpy`, rosidl), vendored `bt_core`/`bt_nodes`, C++17, Python 3, TypeScript/Vite, Playwright, Docker Compose, VitePress.

**Spec:** `docs/superpowers/specs/2026-09-17-behavior-tree-input-mode-router-design.md`

## Global Constraints

- The input mode is global for arms `l`, `m`, and `r`; mixed per-arm ownership is out of scope.
- User-selectable modes are discovered from XML and are `none`, `policy`, and `pika`; `web` is registered but never selectable from the dropdown.
- Every change from one active mode to another passes through one observable `none` tick. Re-requesting the already active mode does not increment `epoch`.
- `ReactiveSequence` and `ReactiveFallback` are new node types; existing stateful `Sequence` and `Fallback` semantics and tests remain unchanged.
- `ActivateInputMode` publishes active state before the selected input subtree can emit a command.
- Policy, Pika, Web, and idle leaves return `RUNNING` and create no Action client or motion goal in this change.
- Web `execute_motion`, `execute_trajectory`, and `start_cartesian_velocity` commands preempt to sticky `web`; software stop bypasses routing; gripper, recovery, calibration, kinematics, pose, and record operations remain mode-neutral.
- When the mode service is absent, port 8765 hides the mode UI and preserves current direct Web motion behavior.
- When a mode service disappears during an override, the queued Web motion fails and is never sent; only a later separate command may use direct mode.
- `./rm65 bt control` is persistent and explicit. `./rm65 up` must not start it.
- Normal automated validation is dry-run or mock only. Real hardware motion requires a separate operator decision, a cleared workspace, low speed, and an accessible emergency stop.
- Runtime C++ logs use `RCLCPP_*`; Python nodes use `self.get_logger()`; no custom console or file logging is added.
- New and changed configuration remains under repository-root `config/` and includes comments explaining units, constraints, and non-default behavior.
- Production implementation follows RED-GREEN-REFACTOR: every behavior test is observed failing for the intended missing behavior before its production change is written.

## File Responsibility Map

- `src/driver/realman_msgs/{msg,srv}/`: string-based mode catalog/state interfaces; the fixed enum scaffold is removed.
- `third_party/behavior_tree_cpp/bt_nodes/control/`: generic reactive sequence and fallback control nodes.
- `src/behavior/realman_bt/include/realman_bt/input_mode.hpp` and `src/input_mode.cpp`: ROS-independent catalog validation and neutral-transition state machine.
- `src/behavior/realman_bt/include/realman_bt/input_mode_nodes.hpp` and `src/input_mode_nodes.cpp`: BT guard, selection, activation, and no-command running leaves.
- `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`: XML registration plus mode ROS services/topic and diagnostics.
- `config/behavior-trees/control_router.xml`: sole authoritative mode catalog and branch order.
- `src/driver/realman_web_control/realman_web_control/input_mode_bridge.py`: ROS-independent Web selection/override correlation and timeout logic.
- `src/driver/realman_web_control/realman_web_control/web_control_node.py`: ROS discovery, service calls, state subscription, Web Action cancellation, and effect execution.
- `src/driver/realman_web_control/web/src/{main.ts,style.css}`: one global mode card sourced entirely from server events.
- `scripts/bt.sh`, `docker/bt_container_entrypoint.sh`, and launch/config files: explicit persistent control-router entrypoint.
- `.agents/skills/developing-realman-behavior-trees/` and `website/docs/development/`: reusable agent guidance and operator/developer contract.

---

### Task 1: Replace the Fixed Control-Mode ROS Scaffold

**Files:**
- Create: `src/driver/realman_msgs/msg/InputModeState.msg`
- Create: `src/driver/realman_msgs/srv/ListInputModes.srv`
- Create: `src/driver/realman_msgs/srv/SelectInputMode.srv`
- Modify: `src/driver/realman_msgs/CMakeLists.txt`
- Modify: `src/driver/realman_msgs/test/test_control_mode_interfaces.py`
- Delete: `src/driver/realman_msgs/msg/ControlMode.msg`
- Delete: `src/driver/realman_msgs/msg/ControlModeRequest.msg`
- Delete: `src/driver/realman_msgs/msg/ControlModeState.msg`
- Delete: `src/driver/realman_msgs/srv/RequestControlMode.srv`
- Delete: `src/driver/realman_msgs/action/SwitchControlMode.action`

**Interfaces:**
- Produces: `realman_msgs/msg/InputModeState`, `realman_msgs/srv/ListInputModes`, and `realman_msgs/srv/SelectInputMode` exactly as defined in the design spec.
- Preserves: all motion, coordinates, calibration, and recovery interfaces in `realman_msgs` unchanged.

- [ ] **Step 1: Prove the fixed interfaces have no production consumer**

Run:

```bash
rg -n "ControlMode|RequestControlMode|SwitchControlMode" \
  --glob '!docs/superpowers/specs/**' --glob '!docs/superpowers/plans/**' .
```

Expected: matches are limited to the five scaffold interface files, their interface test, `realman_msgs/CMakeLists.txt`, `control_mode_state_machine.*`, its unit test, `control_mode.xml`, and historical documentation. Any runtime consumer must be investigated before deletion.

- [ ] **Step 2: Write the failing interface contract test**

Replace the fixed-enum assertions in `test_control_mode_interfaces.py` with literal section assertions:

```python
def test_input_mode_interfaces_are_exact():
    assert sections(ROOT / "msg/InputModeState.msg") == [[
        "uint8 ACTIVE=0", "uint8 SWITCHING=1", "uint8 FAILED=2",
        "string requested_mode", "string selected_mode", "string active_mode",
        "uint8 phase", "uint64 request_id", "uint64 epoch", "string detail",
    ]]
    assert sections(ROOT / "srv/ListInputModes.srv") == [[], [
        "bool success", "string message", "string[] mode_ids",
        "string[] labels", "bool[] selectable",
    ]]
    assert sections(ROOT / "srv/SelectInputMode.srv") == [
        ["string mode_id", "string requester_id"],
        ["bool accepted", "uint64 request_id", "string message"],
    ]
```

- [ ] **Step 3: Run the test and observe the intended RED result**

Run:

```bash
python3 -m pytest src/driver/realman_msgs/test/test_control_mode_interfaces.py -q
```

Expected: FAIL because `InputModeState.msg` does not exist.

- [ ] **Step 4: Add the three interface files and migrate rosidl generation**

Use the exact message/service bodies from Step 2. Replace the five old entries in `rosidl_generate_interfaces()` with:

```cmake
  "msg/InputModeState.msg"
  "srv/ListInputModes.srv"
  "srv/SelectInputMode.srv"
```

Delete the five fixed scaffold files only after the new files and CMake entries exist.

- [ ] **Step 5: Verify interface tests and ROS generation**

Run:

```bash
python3 -m pytest \
  src/driver/realman_msgs/test/test_control_mode_interfaces.py \
  src/driver/realman_msgs/test/test_interface_files.py -q
./rm65 bt-test build
```

Expected: Python tests PASS; the Humble build generates all three new types and reports no reference to a removed type.

- [ ] **Step 6: Commit the interface migration**

```bash
git add src/driver/realman_msgs
git commit -m "feat(msgs): add dynamic input mode interfaces"
```

### Task 2: Add Reactive Control-Node Semantics

**Files:**
- Create: `third_party/behavior_tree_cpp/bt_nodes/control/reactive_sequence_node.hpp`
- Create: `third_party/behavior_tree_cpp/bt_nodes/control/reactive_fallback_node.hpp`
- Create: `src/behavior/realman_bt/test/test_reactive_control_nodes.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`

**Interfaces:**
- Produces: `bt_nodes::ReactiveSequenceNode` and `bt_nodes::ReactiveFallbackNode`, each constructible as `(std::string, bt_core::NodeConfig)`.
- Contract: both start at child zero every tick; a running child that becomes ineligible is halted before traversal reaches a later replacement child.
- Preserves: `bt_nodes::SequenceNode` and `bt_nodes::FallbackNode` without edits.

- [ ] **Step 1: Write a failing control-node test with observable ordering**

Add a small test leaf that appends `tick:<name>` and `halt:<name>` to a shared vector. Cover these literal sequences:

```cpp
// ReactiveSequence: selector is ticked again while worker remains running.
assert(events == std::vector<std::string>({
    "tick:selector", "tick:worker", "tick:selector", "tick:worker"}));

// ReactiveFallback: candidate zero is reconsidered instead of resuming a cursor.
assert(events == std::vector<std::string>({
    "tick:candidate_zero", "tick:candidate_one",
    "tick:candidate_zero", "tick:candidate_one"}));
```

Also instantiate existing `SequenceNode` and `FallbackNode` to prove they retain their saved child cursor. Add a nested router case in which the old branch's reactive sequence observes a false guard, halts its running worker, and only then lets the fallback reach a later `none` branch. Higher-priority replacement is safe because the coordinator first selects the later `none` branch for one complete tick; the following tick replaces only the no-command idle branch.

- [ ] **Step 2: Run the new target and observe RED**

Run:

```bash
./rm65 bt-test build
```

Expected: FAIL because the reactive headers/classes are missing.

- [ ] **Step 3: Implement minimal reactive traversal**

For `ReactiveSequenceNode::tick()`, iterate from index zero. Continue on `SUCCESS`, return on `RUNNING`, and on `FAILURE` halt children after the failing child and return `FAILURE`. Track the previous running child index; before ticking a different child on a later tick, call `halt()` on the previous running child and set it `IDLE`.

For `ReactiveFallbackNode::tick()`, iterate from index zero. Continue on `FAILURE` and return on `RUNNING` or `SUCCESS`. When a previously running child is passed because it now fails, halt it before ticking the next child. Do not pre-halt the saved running branch merely to probe an earlier candidate; the mandatory neutral tick prevents a higher-priority replacement from overlapping a command-owning branch. Both `halt()` implementations clear tracked state and delegate to `bt_core::ControlNode::halt()`.

- [ ] **Step 4: Register and run the focused C++ test**

Add `test_reactive_control_nodes` in the package `BUILD_TESTING` block, include `${BT_VENDOR_ROOT}/bt_nodes`, and link `bt::core`.

Run:

```bash
./rm65 bt-test build
colcon test --packages-select realman_bt --ctest-args -R test_reactive_control_nodes
colcon test-result --verbose
```

Expected: PASS, including the halt-before-replacement order.

- [ ] **Step 5: Commit the generic reactive nodes**

```bash
git add third_party/behavior_tree_cpp/bt_nodes/control \
  src/behavior/realman_bt/CMakeLists.txt \
  src/behavior/realman_bt/test/test_reactive_control_nodes.cpp
git commit -m "feat(bt): add reactive routing controls"
```

### Task 3: Build the Dynamic Registry and Neutral Transition Coordinator

**Files:**
- Create: `src/behavior/realman_bt/include/realman_bt/input_mode.hpp`
- Create: `src/behavior/realman_bt/src/input_mode.cpp`
- Create: `src/behavior/realman_bt/test/test_input_mode.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Delete: `src/behavior/realman_bt/include/realman_bt/control_mode_state_machine.hpp`
- Delete: `src/behavior/realman_bt/include/realman_bt/control_mode_types.hpp`
- Delete: `src/behavior/realman_bt/src/control_mode_state_machine.cpp`
- Delete: `src/behavior/realman_bt/test/test_control_mode_state_machine.cpp`

**Interfaces:**
- Produces: `InputModeDefinition { id, label, selectable }`, `InputModeRegistry`, `InputModePhase`, `InputModeSnapshot`, `InputModeRequestResult`, and `InputModeCoordinator`.
- `InputModeRegistry::registerMode(std::string id, std::string label, bool selectable)` preserves first-declaration order and permits exact duplicate registration.
- `InputModeCoordinator(const InputModeRegistry& registry, std::chrono::milliseconds switch_timeout, std::string safe_fallback_mode, Observer observer)` receives all transition policy explicitly.
- `InputModeCoordinator::request(const std::string& mode_id, const std::string& requester_id, Clock::time_point now)` returns `{accepted, request_id, message}`.
- `InputModeCoordinator::selectForTick(Clock::time_point now)` returns the selected ID and updates state before routing.
- `InputModeCoordinator::activate(const std::string& mode_id, Clock::time_point now)` marks the entered branch active and notifies its observer.
- `InputModeCoordinator::fail(std::string detail, Clock::time_point now)` publishes `FAILED` and schedules `none` for the following tick.

- [ ] **Step 1: Write registry validation tests before the implementation**

Use literal cases in `test_input_mode.cpp`:

```cpp
registry.registerMode("web", "Web", false);
registry.registerMode("policy", "Policy", true);
registry.registerMode("pika", "Pika", true);
registry.registerMode("none", "无输入", true);
registry.registerMode("policy", "Policy", true);  // exact duplicate
registry.validate();
assert(registry.definitions().size() == 4);
assert(registry.definitions()[0].id == "web");
```

Add independent rejection cases for empty/uppercase/punctuation IDs, empty/whitespace/control-character labels, conflicting duplicates, missing `none`, selectable `web`, and no selectable entry.

- [ ] **Step 2: Write transition tests before the implementation**

Assert the complete observable state sequence for `policy -> pika`, `pika -> web`, and `web -> none`:

```text
request pika -> SWITCHING/selected=none/active=policy
activate none -> SWITCHING/selected=none/active=none
next tick -> SWITCHING/selected=pika/active=none
activate pika -> ACTIVE/selected=pika/active=pika/epoch+1
```

Also cover startup `none`, same-mode idempotence, superseding request IDs, unknown modes, empty requester IDs, and timeout producing `FAILED` before fallback to `none`.

- [ ] **Step 3: Run the focused target and observe RED**

Run:

```bash
./rm65 bt-test build
```

Expected: FAIL because `realman_bt/input_mode.hpp` is missing.

- [ ] **Step 4: Implement the registry and coordinator**

Use this public shape:

```cpp
enum class InputModePhase : std::uint8_t { kActive = 0, kSwitching = 1, kFailed = 2 };

struct InputModeDefinition {
  std::string id;
  std::string label;
  bool selectable{false};
};

struct InputModeSnapshot {
  std::string requested_mode{"none"};
  std::string selected_mode{"none"};
  std::string active_mode{"none"};
  InputModePhase phase{InputModePhase::kActive};
  std::uint64_t request_id{0};
  std::uint64_t epoch{0};
  std::string detail;
};
```

The coordinator stores an observer `std::function<void(const InputModeSnapshot&)>`. Notify only after a state mutation. A different request sets `phase=kSwitching`, records a monotonic request ID and deadline, and requires a neutral tick. `activate("none")` completes only the neutral half; the following `selectForTick()` selects the latest requested mode. Activating that mode increments `epoch` once and sets `kActive`. A same-active request returns accepted with the current request ID and no state mutation.

- [ ] **Step 5: Remove the fixed state machine and update the CMake target**

Replace `control_mode_state_machine` with an `input_mode` library, export/install it beside `runtime_snapshot`, and register `test_input_mode` against that library.

- [ ] **Step 6: Verify coordinator behavior and regressions**

Run:

```bash
./rm65 bt-test build
colcon test --packages-select realman_bt \
  --ctest-args -R 'test_input_mode|test_terminal_exit_policy|test_runtime_snapshot'
colcon test-result --verbose
```

Expected: all selected tests PASS.

- [ ] **Step 7: Commit the state-core migration**

```bash
git add src/behavior/realman_bt
git commit -m "feat(bt): coordinate dynamic input modes"
```

### Task 4: Add Input-Mode BT Nodes and the Authoritative Router XML

**Files:**
- Create: `src/behavior/realman_bt/include/realman_bt/input_mode_nodes.hpp`
- Create: `src/behavior/realman_bt/src/input_mode_nodes.cpp`
- Create: `src/behavior/realman_bt/test/test_input_mode_nodes.cpp`
- Create: `config/behavior-trees/control_router.xml`
- Create: `src/behavior/realman_bt/test/test_control_router_tree.py`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Modify: `src/behavior/realman_bt/test/test_tree_contract.py`
- Delete: `config/behavior-trees/control_mode.xml`

**Interfaces:**
- Blackboard keys: `kInputModeRegistryBlackboardKey` and `kInputModeCoordinatorBlackboardKey` from `input_mode_nodes.hpp`.
- Nodes: `SelectInputModeNode`, `InputModeGuardNode`, `ActivateInputModeNode`, `WebInputStubNode`, `PolicyInputStubNode`, `PikaInputStubNode`, and `IdleInputNode`.
- XML registration names: `SelectInputMode`, `InputModeGuard`, `ActivateInputMode`, `WebInputStub`, `PolicyInputStub`, `PikaInputStub`, `IdleInput`.

- [ ] **Step 1: Write node tests against the wished-for ports and construction behavior**

The focused test must prove:

- a factory probe with a blackboard that lacks the registry key does not throw;
- an actual `InputModeGuard` rejects `{blackboard}` remaps for `mode`, `label`, or `selectable`;
- the guard registers literal metadata exactly once and matches `selected_mode`;
- `SelectInputMode` writes `selected_mode` every tick;
- `ActivateInputMode` calls the coordinator observer before the next leaf tick;
- all four input leaves return `RUNNING`; no leaf has or receives an `rclcpp::Node` or Action client.

Use the expected observer order:

```cpp
assert(events == std::vector<std::string>({"state:web", "tick:web_stub"}));
```

- [ ] **Step 2: Write the XML contract test**

Parse `control_router.xml` and assert one root `ReactiveSequence`, one router `ReactiveFallback`, branch order `web,policy,pika,none`, exact labels/selectability, and the order `InputModeGuard -> ActivateInputMode -> input leaf` in every branch. Assert `selected_mode="{selected_mode}"` is the only remapped registration-related value.

- [ ] **Step 3: Run node/XML tests and observe RED**

Run:

```bash
python3 -m pytest src/behavior/realman_bt/test/test_control_router_tree.py -q
./rm65 bt-test build
```

Expected: both commands fail for missing XML/node files.

- [ ] **Step 4: Implement the nodes with probe-safe registration**

`InputModeGuardNode` checks whether its blackboard contains `InputModeRegistry*`. When absent, construction is a factory probe and performs no business validation. When present, require all three registration values in `NodeConfig::port_values`, reject matching entries in `port_remap`, call `registry->registerMode(...)`, and retain the mode ID for `tick()`.

`SelectInputModeNode::tick()` calls `selectForTick(Clock::now())`, writes the returned string through `setOutput("selected_mode", value)`, and returns `SUCCESS`. `ActivateInputModeNode::tick()` requires a literal mode, calls `activate()`, and returns `SUCCESS` or records `failureReason()` and returns `FAILURE` if the selected branch and requested activation disagree.

Policy and Pika record one runtime diagnostic on first entry explaining that they emit no command; their `onHalted()` resets the one-entry flag. Web and idle simply return `RUNNING`.

Add `control_router.xml` to the package install list so the installed share tree and the mounted root configuration expose the same XML contract.

- [ ] **Step 5: Add the exact confirmed XML**

Copy the pseudo tree from the spec verbatim into `control_router.xml`, including `Web`, `Policy`, `Pika`, `无输入`, and selectability `false,true,true,true`.

- [ ] **Step 6: Build and run focused tests**

Run:

```bash
python3 -m pytest \
  src/behavior/realman_bt/test/test_control_router_tree.py \
  src/behavior/realman_bt/test/test_tree_contract.py -q
./rm65 bt-test build
colcon test --packages-select realman_bt \
  --ctest-args -R 'test_input_mode_nodes|test_reactive_control_nodes|test_input_mode'
colcon test-result --verbose
```

Expected: all commands PASS and the existing arm/three-arm XML tests remain unchanged.

- [ ] **Step 7: Commit BT nodes and XML**

```bash
git add config/behavior-trees src/behavior/realman_bt
git commit -m "feat(bt): route registered input mode branches"
```

### Task 5: Expose Catalog, Selection, and State from the Executor

**Files:**
- Modify: `src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/package.xml`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Create: `src/behavior/realman_bt/test/test_input_mode_executor.cpp`
- Modify: `src/behavior/realman_bt/test/test_tree_contract.py`

**Interfaces:**
- Services: `/realman_bt_executor/list_input_modes` and `/realman_bt_executor/select_input_mode`.
- Topic: `/realman_bt_executor/input_mode_state` using depth 1, reliable, transient-local QoS.
- Executor methods: `publishInputModeState`, `handleListInputModes`, and `handleSelectInputMode`.
- Mode interfaces exist only if the loaded XML registered at least one mode.

- [ ] **Step 1: Write an executor integration test before wiring ROS**

Construct the node with a temporary router XML and a temporary runtime snapshot. Assert the list response arrays are equal length and ordered `web,policy,pika,none`; selecting `policy` is accepted; selecting `unknown` is rejected; selecting `web` is accepted for requester `web-control`; and transient-local state received by a late subscriber starts at active `none`.

Construct a second node with `arm_move.xml` and assert both mode services are absent after bounded discovery.

- [ ] **Step 2: Run the new test and observe RED**

Run:

```bash
./rm65 bt-test build
```

Expected: FAIL because the executor has no mode service/topic members.

- [ ] **Step 3: Register all router node types and seed the blackboard**

Before parsing, create `InputModeRegistry` and `InputModeCoordinator`; pass a callback to the coordinator that synchronously publishes state, then place both object pointers in the blackboard and register:

```cpp
factory_.registerNodeType<bt_nodes::ReactiveSequenceNode>("ReactiveSequence");
factory_.registerNodeType<bt_nodes::ReactiveFallbackNode>("ReactiveFallback");
factory_.registerNodeType<SelectInputModeNode>("SelectInputMode");
factory_.registerNodeType<InputModeGuardNode>("InputModeGuard");
factory_.registerNodeType<ActivateInputModeNode>("ActivateInputMode");
```

Register the four running input leaves as well. Parse the tree, then if the registry is non-empty call `validate()` and create the mode interfaces. Invalid mode metadata must fail node construction before ticking starts.

Read `switch_timeout_ms` and `safe_fallback_mode` from node parameters, validate the timeout as positive and the fallback as a registered mode, and pass them to the coordinator. After creating the transient-local publisher, publish the initial active `none` snapshot once so late and already-connected subscribers see identical startup state.

- [ ] **Step 4: Implement service/topic behavior and diagnostics**

Map `InputModePhase` directly to `InputModeState::{ACTIVE,SWITCHING,FAILED}`. `handleListInputModes` copies the registry arrays in declaration order. `handleSelectInputMode` records `SERVICE` request/response events, delegates to the coordinator, returns its request ID/message, and publishes the resulting state.

The coordinator observer calls `publishInputModeState()` synchronously from `ActivateInputMode`, satisfying publish-before-subtree ordering. On a tick exception, preserve the exception diagnostic, call `coordinator.fail(error.what(), now)`, halt the tree, and allow the persistent router to select `none` on its next tick.

Record each request/response as a `SERVICE` event and each selected/active/failed transition as an `EXECUTOR` event, preserving `detail` verbatim and flushing the runtime snapshot after the event. Use `RCLCPP_INFO/WARN/ERROR` for the corresponding node log; do not replace the existing diagnostics stream.

- [ ] **Step 5: Verify ROS tests and logging conventions**

Run:

```bash
./rm65 bt-test build
colcon test --packages-select realman_bt \
  --ctest-args -R 'test_input_mode_executor|test_input_mode_nodes|test_runtime_snapshot'
colcon test-result --verbose
rg -n "printf|std::cout|std::cerr" \
  src/behavior/realman_bt/include src/behavior/realman_bt/src
```

Expected: tests PASS; the logging scan has no new match in executor/input-mode runtime code.

- [ ] **Step 6: Commit executor ROS integration**

```bash
git add src/behavior/realman_bt
git commit -m "feat(bt): publish input mode registry and state"
```

### Task 6: Add the Persistent `./rm65 bt control` Entry Point and Root Configuration

**Files:**
- Create: `src/behavior/realman_bt/launch/control_router.launch.py`
- Modify: `config/ros/behavior_tree.yaml`
- Modify: `config/docker/compose.yaml`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Modify: `scripts/bt.sh`
- Modify: `docker/bt_container_entrypoint.sh`
- Modify: `scripts/test_bt_launcher.sh`
- Modify: `scripts/test_bt_container_entrypoint.sh`

**Interfaces:**
- Command: `./rm65 bt control`.
- Selector values remain `l`, `m`, `r`, `three`, plus new `control`.
- Control selector sets tree `control_router.xml`, required arms `l,m,r`, launch `control_router.launch.py`, `stop_on_terminal=false`, and `exit_on_terminal=false`.
- One-shot selectors preserve their existing launch, terminal behavior, lock, archive, and result validation.

- [ ] **Step 1: Extend launcher tests first**

Add a dry-run invocation and assert literal command effects:

```bash
control_output="$(RM65_DRY_RUN=1 "$ROOT/scripts/bt.sh" control)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/control_router.xml' <<<"$control_output"
grep -Fq 'BT_REQUIRED_ARMS=l\,m\,r' <<<"$control_output"
grep -Fq 'BT_LAUNCH_FILE=control_router.launch.py' <<<"$control_output"
grep -Fq 'BT_STOP_ON_TERMINAL=false' <<<"$control_output"
grep -Fq 'BT_EXIT_ON_TERMINAL=false' <<<"$control_output"
```

Add entrypoint assertions for validation of both booleans and forwarding `stop_on_terminal` to ROS launch.

- [ ] **Step 2: Run launcher tests and observe RED**

Run:

```bash
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
```

Expected: launcher test FAIL because `control` is not a valid selector.

- [ ] **Step 3: Implement the selector and safe launch selection**

In `scripts/bt.sh`, set per-selector values without accepting arbitrary launch filenames. Add environment arguments `BT_LAUNCH_FILE` and `BT_STOP_ON_TERMINAL` to the existing `docker compose exec` array.

In the container entrypoint, accept only `arm_move.launch.py` or `control_router.launch.py`; validate both terminal booleans; pass `stop_on_terminal` and `exit_on_terminal` explicitly. Keep the existing single `/tmp/realman-bt.lock`, action readiness checks, cleanup trap, and persistent-mode skip of terminal-result parsing.

Allow `realman_bringup_remote` to forward the already-supported `REALMAN_DRIVER_CONFIG_FILE` launch override, defaulting to `/opt/rm65_ws/config/ros/realman_driver.yaml`. This makes the exact production CLI testable against `realman_driver_mock.yaml` without changing its normal default or contacting controllers.

- [ ] **Step 4: Add a config-driven control launch**

`control_router.launch.py` loads `/opt/rm65_ws/config/ros/behavior_tree.yaml` (or `REALMAN_CONFIG_ROOT/ros/behavior_tree.yaml`) as the base parameter file, then overrides the copied runtime tree and snapshot paths supplied by the wrapper. It sets official ROS log environment variables exactly as `arm_move.launch.py` does.

Change `behavior_tree.yaml` to:

```yaml
# Persistent global input router. The tree is started explicitly with ./rm65 bt control.
realman_bt_executor:
  ros__parameters:
    tree_file: /opt/rm65_ws/config/behavior-trees/control_router.xml
    tick_rate_hz: 10.0  # Hz; each tick reevaluates the global input selection.
    switch_timeout_ms: 5000  # Maximum Web/selector wait before FAILED and safe none.
    safe_fallback_mode: none  # Must match a registered, selectable XML mode.
    autostart: true
    stop_on_terminal: false
    exit_on_terminal: false
```

Remove `default_lease_timeout_ms`; the new coordinator has no lease semantics.

- [ ] **Step 5: Run syntax, config, and launcher tests**

Run:

```bash
bash -n scripts/bt.sh docker/bt_container_entrypoint.sh
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
docker compose config >/dev/null
RM65_DRY_RUN=1 ./rm65 bt control
```

Expected: all checks PASS; dry-run output names the persistent control tree without touching Docker or hardware.

- [ ] **Step 6: Commit the explicit launch path**

```bash
git add config/behavior-trees/control_router.xml config/ros/behavior_tree.yaml \
  config/docker/compose.yaml docker/bt_container_entrypoint.sh scripts \
  src/behavior/realman_bt/CMakeLists.txt src/behavior/realman_bt/launch/control_router.launch.py
git commit -m "feat(bt): add persistent control router command"
```

### Task 7: Add the Web Mode Controller, Protocol, and ROS Bridge

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/input_mode_bridge.py`
- Create: `src/driver/realman_web_control/test/test_input_mode_bridge.py`
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py`
- Modify: `src/driver/realman_web_control/test/test_protocol.py`
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/launch/web_control.launch.py`
- Modify: `src/driver/realman_web_control/package.xml`
- Modify: `config/ros/realman_web_control.yaml`

**Interfaces:**
- Browser request: `select_input_mode { request_id, mode_id }`.
- Server events: `input_mode_list`, `input_mode_result`, and `input_mode_state` with the fields specified in the design.
- Pure controller: `InputModeBridge.update_catalog`, `select_mode`, `intercept_motion`, `selection_response`, `update_state`, and `expire` return ordered `InputModeEffect` values.
- Qualifying motion types: exactly `execute_motion`, `execute_trajectory`, and `start_cartesian_velocity`.

- [ ] **Step 1: Write protocol RED tests**

Add literal accepted input:

```python
assert parse_message(
    '{"type":"select_input_mode","request_id":"mode-1","mode_id":"policy"}'
) == {
    "type": "select_input_mode",
    "request_id": "mode-1",
    "mode_id": "policy",
}
```

Reject empty, uppercase, punctuation, absent request ID, and oversized IDs. The parser validates syntax only; selectability comes from the live catalog.

- [ ] **Step 2: Write pure bridge tests covering every routing boundary**

Use a fake monotonic time and literal catalogs. Assert:

- absent catalog returns `forward_motion` immediately;
- available catalog queues motion and emits `request_mode(web)` but no `forward_motion`;
- a matching accepted request ID plus `ACTIVE/web` emits exactly one `forward_motion`;
- stale request/state IDs emit no motion;
- timeout, `FAILED`, service disappearance, and supersession emit an error and discard the old command;
- a completed Web command does not request or restore the previous Policy/Pika mode;
- `select_mode(policy)` while active Web emits effects in the exact order `cancel_web_actions`, then `request_mode(policy)`;
- `web`, unknown, non-selectable, and unavailable dropdown choices are rejected;
- stop, gripper, and recovery messages never enter this controller.

- [ ] **Step 3: Run Python tests and observe RED**

Run:

```bash
python3 -m pytest \
  src/driver/realman_web_control/test/test_protocol.py \
  src/driver/realman_web_control/test/test_input_mode_bridge.py -q
```

Expected: FAIL because `select_input_mode` and `input_mode_bridge.py` do not exist.

- [ ] **Step 4: Implement the ROS-independent effect controller**

Use immutable `InputModeOption`, `InputModeSnapshot`, and `InputModeEffect` dataclasses. Keep at most one pending Web override globally. Store both browser request ID and executor request ID; release only when state is `ACTIVE`, mode is `web`, and `request_id` matches. `update_catalog(None)` must first fail a pending override, then emit `input_mode_list {available:false,modes:[]}`.

- [ ] **Step 5: Wire ROS discovery and state into `WebControlNode`**

Create clients for `ListInputModes` and `SelectInputMode`, plus a reliable/transient-local `InputModeState` subscription. A timer uses the configured discovery period to probe the list service and refresh the catalog. Convert ROS messages to the WebSocket fields without inventing a Python mode list.

Apply effects on the ROS thread:

- `forward_motion`: call a private direct dispatcher that invokes `_execute_motion`, `_execute_trajectory`, or `_start_velocity` exactly once;
- `request_mode`: call `/realman_bt_executor/select_input_mode` and correlate its response;
- `cancel_web_actions`: mark every current l/m/r Web action record cancel-requested, call `_request_cancel()` for accepted goals, and rely on the existing goal-response callback to cancel delayed acceptance;
- `send_event`: use the existing `WebControlServer.send_event()`.

Keep `_software_stop`, `_gripper_command`, `_recover_motion`, calibration, kinematics, pose, and joint-record dispatch outside the gate.

- [ ] **Step 6: Add commented Web timing configuration**

Under the existing root Web configuration add:

```yaml
input_mode:
  discovery_period_sec: 1.0  # Seconds between bounded router service probes.
  web_override_timeout_sec: 5.0  # No Web Action is sent after this wait expires.
```

Validate both values are finite and positive in `load_server_config()` and pass them through launch parameters or the loaded `WebServerConfig`, using one authoritative source.

- [ ] **Step 7: Verify Python tests and ROS package build**

Run:

```bash
python3 -m pytest src/driver/realman_web_control/test -q
./rm65 bt-test build
rg -n "print\(|logging\." \
  src/driver/realman_web_control/realman_web_control/input_mode_bridge.py \
  src/driver/realman_web_control/realman_web_control/web_control_node.py
```

Expected: tests/build PASS; the logging scan finds no new runtime console logger.

- [ ] **Step 8: Commit the Web/ROS routing bridge**

```bash
git add config/ros/realman_web_control.yaml src/driver/realman_web_control
git commit -m "feat(web): gate motion through input mode router"
```

### Task 8: Render the Dynamically Discovered Global Mode Card on Port 8765

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Modify: `website/tests/web-control/web-control.spec.ts`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/index.html`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/assets/*`

**Interfaces:**
- DOM: `#input-mode-card`, `#input-mode-select`, `#input-mode-active`, and `#input-mode-detail`.
- The card is hidden for `available=false` and visible for `available=true`.
- Options use server-provided `id`, `label`, `selectable`, and order; `web` is never rendered as a dropdown option.

- [ ] **Step 1: Add Playwright scenarios before UI code**

Extend the fake WebSocket with helper-emitted events and assert:

```ts
await expect(page.locator("#input-mode-card")).toBeHidden();
// emit input_mode_list with web/policy/pika/none
await expect(page.locator("#input-mode-select option")).toHaveText(["Policy", "Pika", "无输入"]);
await expect(page.locator("#input-mode-select option[value=web]")).toHaveCount(0);
```

Select Pika and assert the emitted `select_input_mode` payload. Emit `SWITCHING`, `ACTIVE/web`, `FAILED`, and unavailable state events; assert disabled state, active label, detail text, and final hiding. Keep a separate existing test that sends motion with no catalog, proving the legacy UI remains usable.

- [ ] **Step 2: Run the browser test and observe RED**

Run:

```bash
npm --prefix website run test:web-control -- --grep "input mode"
```

Expected: FAIL because `#input-mode-card` is missing.

- [ ] **Step 3: Implement event state and one global card**

Add typed mode option/state structures, cache the latest catalog/state, and render a single card above per-arm motion controls. The select change sends `{type:"select_input_mode", request_id, mode_id}`. Disable selection during `SWITCHING` and while its browser request is pending. Display Web as active when state says `web` even though it is not an option.

- [ ] **Step 4: Style desktop/mobile layouts without per-arm duplication**

Reuse existing panel, status pill, and responsive tokens. Ensure the selector and state/detail remain readable at the existing Pixel 7 viewport; do not add a second mode card when the selected arm changes.

- [ ] **Step 5: Build static assets and run browser coverage**

Run:

```bash
npm --prefix website run build:web-control
npm --prefix website run test:web-control
```

Expected: generated assets update and all desktop/mobile Web control tests PASS.

- [ ] **Step 6: Commit the mode UI**

```bash
git add src/driver/realman_web_control/web \
  src/driver/realman_web_control/realman_web_control/static \
  website/tests/web-control/web-control.spec.ts
git commit -m "feat(web): show dynamic global input modes"
```

### Task 9: Update the Behavior-Tree Skill and Developer Documentation

**Files:**
- Modify: `.agents/skills/developing-realman-behavior-trees/SKILL.md`
- Modify: `.agents/skills/developing-realman-behavior-trees/references/node-authoring.md`
- Modify: `.agents/skills/developing-realman-behavior-trees/references/execution-and-deployment.md`
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/behavior-tree-motion.md`
- Modify: `website/docs/development/realman-web-control.md`
- Modify: `website/docs/development/startup-entries.md`
- Modify: `website/docs/development/system-bringup.md`
- Modify: `website/docs/development/index.md`

**Interfaces:**
- Skill guidance covers reactive routing, literal XML mode registration, neutral transitions, `ActivateInputMode` ordering, Web override behavior, and persistent `./rm65 bt control` lifecycle.
- Web manual documents ROS names, WebSocket payloads, root config values, UI visibility, startup/stop commands, failure modes, and no-hardware validation.

- [ ] **Step 1: Run a baseline skill pressure scenario before editing the skill**

Use a fresh subagent without the updated skill text and this realistic prompt: “Add a new selectable joystick input subtree to the RealMan control router and let it take over immediately from Policy.” Record whether it incorrectly hard-codes the Web list, skips `none`, omits `ActivateInputMode`, or changes stateful `Fallback`. This is the RED evidence required by `superpowers:writing-skills`.

- [ ] **Step 2: Add only guidance that corrects observed baseline failures**

Keep the existing skill concise. Put node-authoring details in `references/node-authoring.md` and startup/discovery diagnostics in `references/execution-and-deployment.md`. Preserve existing MoveJ, cancellation-drain, one-shot, and ROS domain rules.

- [ ] **Step 3: Re-run the same scenario with the updated skill**

Expected behavior: the agent uses a literal `InputModeGuard`, `ActivateInputMode`, then the new subtree; preserves Web priority and the neutral tick; updates XML rather than a Python enum; and proposes dry-run/mock tests before hardware.

- [ ] **Step 4: Update the Web developer manual as current-state documentation**

Document:

- `./rm65 up` versus `./rm65 bt control` ownership and termination;
- all two services and one transient-local topic with message fields;
- `none/policy/pika` selection and sticky, non-selectable Web override;
- the three WebSocket server events plus browser selection request;
- direct-control compatibility when the tree is absent;
- cancellation-before-leaving-Web and neutral-tick ordering;
- `config/behavior-trees/control_router.xml`, both ROS YAML files, units, and valid values;
- mock validation commands and the fact that placeholders send no goals.

- [ ] **Step 5: Validate the skill and site**

Run:

```bash
python3 /home/server5090/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/developing-realman-behavior-trees
npm --prefix website run build
npm --prefix website run test:e2e -- --grep "behavior tree|web control|startup"
```

Expected: skill validation, VitePress build, and affected route tests PASS.

- [ ] **Step 6: Commit skill and documentation together**

```bash
git add .agents/skills/developing-realman-behavior-trees website
git commit -m "docs(bt): document dynamic input routing"
```

### Task 10: Run Full Mock/Docker Verification and Final Consistency Checks

**Files:**
- Modify only if a failing verification exposes a defect, and return to the relevant task's RED-GREEN cycle before changing production code.

**Interfaces:**
- Validates the completed ROS graph, CLI lifecycle, Web discovery, no-goal placeholder boundary, and existing one-shot behavior.

- [ ] **Step 1: Run static and package regression suites**

```bash
git diff --check
bash -n rm65 scripts/bt.sh docker/bt_container_entrypoint.sh
zsh -n functions.zsh
docker compose config >/dev/null
python3 -m pytest src/driver/realman_msgs/test src/driver/realman_web_control/test -q
./rm65 bt-test all
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
python3 -m unittest discover -s tests -p 'test_bt_runtime_result.py'
```

Expected: every command exits zero.

- [ ] **Step 2: Run Web and documentation verification**

```bash
npm --prefix website run build:web-control
npm --prefix website run test:web-control
npm --prefix website run build
```

Expected: static Web assets, browser tests, and VitePress build all succeed.

- [ ] **Step 3: Build the Humble image and start mock drivers**

```bash
docker compose build realman_bringup_remote realman_web_control
REALMAN_DRIVER_CONFIG_FILE=/opt/rm65_ws/config/ros/realman_driver_mock.yaml \
  REALMAN_START_GRIPPER=false \
  docker compose up -d --force-recreate realman_bringup_remote realman_web_control
```

Expected: both services become healthy in the configured ROS domain; the remote bringup uses `mock_mode=true`, no gripper device is opened, and no physical controller is contacted.

- [ ] **Step 4: Start the persistent router and inspect its ROS contract**

In one terminal:

```bash
./rm65 bt control
```

From a second terminal/container in the same domain:

```bash
docker compose exec -T realman_web_control bash -lc '
  source /opt/ros/humble/setup.bash
  source /opt/rm65_ws/install/setup.bash
  ros2 service call /realman_bt_executor/list_input_modes realman_msgs/srv/ListInputModes "{}"
  ros2 topic echo --once /realman_bt_executor/input_mode_state realman_msgs/msg/InputModeState
'
```

Expected: catalog order is `web, policy, pika, none`; only the last three are selectable; initial state is active `none`; the process stays alive.

- [ ] **Step 5: Verify neutral transitions and no-command leaves against mock Action status**

Call `policy`, `pika`, and `none` selections, observing `SWITCHING/none` before each new `ACTIVE` state. Subscribe to the three mock drivers' Action status topics before the selection sequence and retain the capture for at least two seconds of Policy and Pika ticks.

Expected: `epoch` changes once per completed new mode, request IDs are monotonic, and every captured status list remains empty until an explicit Web motion is submitted.

- [ ] **Step 6: Verify port 8765 discovery and Web override gating**

Open the production Web page or run the integration browser harness. Confirm the mode card appears only while the router is running. Send one Web motion against mock actions and capture evidence that no goal is received before `ACTIVE/web`, exactly one is received afterward, and the active mode remains Web after completion. Stop the router and confirm the card hides; a new, separate Web motion uses the legacy direct path.

- [ ] **Step 7: Verify stop and neutral operations bypass routing**

While Policy or Pika is active, invoke software stop and confirm its service call is immediate without a mode request. Invoke a gripper UI command and recovery request in the test harness and confirm neither changes the mode state.

- [ ] **Step 8: Stop test services and confirm existing one-shot behavior**

Terminate `./rm65 bt control` with Ctrl-C, then run:

```bash
REALMAN_BT_DRY_RUN=true ./rm65 bt three
docker compose stop realman_bringup_remote realman_web_control
```

Expected: the control executor/monitor releases the lock and exits cleanly; the existing staged tree completes its normal dry-run lifecycle and archives a valid terminal result.

- [ ] **Step 9: Run the completion gate**

```bash
git status --short
rg -n "control_mode\.xml|default_lease_timeout_ms|RequestControlMode|SwitchControlMode" \
  src config scripts docker website .agents/skills/developing-realman-behavior-trees
git log --oneline --decorate -10
```

Expected: no unintended uncommitted files; no current runtime/config/docs reference to the removed scaffold; all intended commits are visible. Historical design documents may retain historical names.
