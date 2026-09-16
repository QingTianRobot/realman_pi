# Behavior Tree Input Mode Router Design

## Goal

Add a persistent, explicitly launched behavior tree that owns the global input mode for all three RealMan arms. The tree selects the requested mode on every tick and routes execution through a fallback whose branches are `web`, `policy`, `pika`, and `none`.

The production Web control page on port 8765 discovers the modes registered by the running tree. It shows a selector for user-selectable modes only while this control tree is running. Web motion remains available when the tree is absent and becomes a sticky, highest-priority override when the tree is present.

Policy and Pika control implementations are outside this change. Their placeholder leaves remain running and send no robot command.

## Product Behavior

The global mode applies to the l, m, and r arms together. A single selector on the port 8765 page offers `none`, `policy`, and `pika`. The page separately displays the active mode, which can also be `web`.

Web is not a selectable option. Any Web `execute_motion`, `execute_trajectory`, or Cartesian velocity start command requests `web`, waits for the router to confirm that `web` is active, and only then forwards the original command. Web remains active after the command completes. Resuming Policy or Pika requires an explicit selection.

Software stop always executes directly. Gripper operations and motion recovery do not change the input mode.

When the control tree is not running, the mode UI is hidden and existing Web motion commands retain their current direct behavior. If the control tree disappears during a Web override request, that request fails without sending its motion command. A later user command observes that the router is absent and uses normal direct control.

## Runtime and Ownership Boundary

`./rm65 up` continues to start drivers and Web control without starting a behavior tree. A new command starts the router explicitly:

```bash
./rm65 bt control
```

This selector uses `config/behavior-trees/control_router.xml`, requires the l, m, and r Action Servers, and sets both `stop_on_terminal` and `exit_on_terminal` to false. The tree remains running until Ctrl-C or process failure. The existing container lock prevents another one-shot or control tree from starting concurrently in the same driver container.

The behavior-tree executor owns mode registration, requested/active mode state, and branch lifecycle. The Web control node owns browser transport and Web-originated Action clients. Future Policy and Pika leaves own their respective command clients and must cancel or transfer unfinished work when halted.

The driver continues to own SDK connections and motion arbitration. No behavior-tree leaf opens or closes a robot SDK connection.

## Tree Structure

The new authoritative pseudo tree is:

```xml
<?xml version="1.0"?>
<root main_tree_to_execute="InputControl">
  <BehaviorTree ID="InputControl">
    <ReactiveSequence name="input_control">
      <SelectInputMode selected_mode="{selected_mode}"/>
      <ReactiveFallback name="input_router">
        <ReactiveSequence name="web_branch">
          <InputModeGuard mode="web" label="Web" selectable="false"
                          selected_mode="{selected_mode}"/>
          <ActivateInputMode mode="web"/>
          <WebInputStub/>
        </ReactiveSequence>
        <ReactiveSequence name="policy_branch">
          <InputModeGuard mode="policy" label="Policy" selectable="true"
                          selected_mode="{selected_mode}"/>
          <ActivateInputMode mode="policy"/>
          <PolicyInputStub/>
        </ReactiveSequence>
        <ReactiveSequence name="pika_branch">
          <InputModeGuard mode="pika" label="Pika" selectable="true"
                          selected_mode="{selected_mode}"/>
          <ActivateInputMode mode="pika"/>
          <PikaInputStub/>
        </ReactiveSequence>
        <ReactiveSequence name="none_branch">
          <InputModeGuard mode="none" label="无输入" selectable="true"
                          selected_mode="{selected_mode}"/>
          <ActivateInputMode mode="none"/>
          <IdleInput/>
        </ReactiveSequence>
      </ReactiveFallback>
    </ReactiveSequence>
  </BehaviorTree>
</root>
```

The package registers `ReactiveSequence` and `ReactiveFallback` without changing the existing stateful `Sequence` and `Fallback`. Reactive controls begin from their first child on every tick and halt a previously running branch before the replacement branch can emit commands.

`SelectInputMode` runs on every tick and writes the transition controller's selected mode to the blackboard. Each `InputModeGuard` registers its literal mode ID, label, and `selectable` flag during XML construction, then returns success only when its mode matches the blackboard value. Mode IDs are lower-case ASCII identifiers. Dynamic blackboard substitutions are not allowed for registration metadata.

`ActivateInputMode` is an idempotent success leaf placed after the guard and before the input subtree. It marks the selected branch active and publishes the matching request ID and epoch before that subtree can emit a command. Future complex subtrees keep this activation leaf at their entry boundary.

The four placeholder input leaves return `RUNNING`. Policy and Pika record a diagnostic explaining that they are placeholders and emit no Action request. `IdleInput` and `WebInputStub` likewise emit no motion; Web-originated commands still travel through the existing Web control Action bridge after mode activation.

Future modes use an `InputModeGuard`, an `ActivateInputMode`, and then any leaf or subtree. The UI discovers the guard registration and does not need a hard-coded option.

## Safe Mode Transition

Mode state contains `requested_mode`, `selected_mode`, `active_mode`, `phase`, `request_id`, `epoch`, and `detail`. Startup state is `none` and active.

When the requested mode differs from the active mode, the controller performs a neutral transition:

1. Publish phase `SWITCHING` and select `none` for the current tick.
2. The reactive router halts the previous running branch before entering `IdleInput`.
3. Mark `none` active at the end of the neutral tick.
4. On the next tick select the requested mode and enter its branch.
5. `ActivateInputMode` publishes it as active, increments `epoch`, and publishes phase `ACTIVE` with the matching `request_id` before ticking the input subtree.

A request for the already active mode succeeds without another neutral transition. A later request supersedes an earlier request that has not become active; its new request ID lets Web control ignore stale state.

Leaving Web mode requires Web control to cancel its in-flight `ExecuteMotion`, trajectory, and Cartesian velocity work across all three arms before requesting the selectable mode. For future Policy and Pika implementations, branch halt is the cancellation boundary. Successful cancellation submission is sufficient to release branch ownership; acknowledgment and physical stop remain driver-level concerns consistent with the existing cancellation-drain contract.

Web preemption reverses the order: request Web first, allow the router to halt Policy or Pika through the neutral tick, wait for `web` to become active, then send the Web command. A timeout or failed transition prevents that command from being sent.

## Mode Registry Validation

The executor creates mode ROS interfaces only when at least one input mode is registered by the loaded XML. Existing MoveJ trees therefore expose no mode services and do not make the selector appear.

Loading a mode-aware tree fails when:

- two guards use the same mode ID with different metadata;
- a mode ID or label is empty or malformed;
- registration metadata uses a blackboard substitution;
- no `none` mode exists;
- the `web` mode is user-selectable;
- no user-selectable mode exists.

Repeated identical registration is permitted so a mode may appear in more than one structural location, but it produces one catalog entry. Catalog order follows the first declaration in the XML.

## ROS Interfaces

The interfaces live in `realman_msgs` and use the existing executor namespace. They intentionally use string mode IDs because the XML registry is extensible.

### `realman_msgs/msg/InputModeState`

```text
uint8 ACTIVE=0
uint8 SWITCHING=1
uint8 FAILED=2

string requested_mode
string selected_mode
string active_mode
uint8 phase
uint64 request_id
uint64 epoch
string detail
```

### `realman_msgs/srv/ListInputModes`

```text
---
bool success
string message
string[] mode_ids
string[] labels
bool[] selectable
```

The three arrays always have equal length and preserve registry order.

### `realman_msgs/srv/SelectInputMode`

```text
string mode_id
string requester_id
---
bool accepted
uint64 request_id
string message
```

The executor exposes:

- `/realman_bt_executor/list_input_modes`
- `/realman_bt_executor/select_input_mode`
- `/realman_bt_executor/input_mode_state`

The state topic uses transient-local reliable QoS so a newly connected Web node immediately receives the current state. Service selection validates against the active registry. The `web` mode is accepted from the Web bridge even though it is not user-selectable; browser-originated dropdown requests may select only entries with `selectable=true`.

## Migration from the Fixed Control-Mode Scaffold

The repository currently contains an unused scaffold based on the fixed enum `none/web/policy/teleop`: `ControlMode.msg`, `ControlModeRequest.msg`, `ControlModeState.msg`, `RequestControlMode.srv`, `SwitchControlMode.action`, `ControlModeStateMachine`, and `config/behavior-trees/control_mode.xml`. No production node serves or consumes those mode interfaces.

This feature replaces that scaffold with the registry-driven string interfaces above. Implementation removes the obsolete fixed-mode files, their tests, and `control_mode.xml` after a final repository-wide consumer check. The current motion Action interfaces remain unchanged. Historical design documents stay historical; current Web manuals and skills describe only the registry-driven contract.

## Web Control Integration

The Web control ROS node probes the list service at a bounded interval. When the service becomes ready it fetches the catalog, subscribes to state, and broadcasts both to connected browsers. When it disappears, the node broadcasts unavailability and the page hides the mode card.

New WebSocket messages are:

| Direction | Type | Purpose |
| --- | --- | --- |
| Server to browser | `input_mode_list` | Availability and registered `id`, `label`, `selectable` entries. |
| Browser to server | `select_input_mode` | Select one user-selectable mode using a browser request ID. |
| Server to browser | `input_mode_result` | Accepted/rejected result and executor request ID. |
| Server to browser | `input_mode_state` | Requested, selected, active, phase, epoch, and detail. |

The server validates the selected ID against the latest executor-provided catalog rather than a Python constant. It rejects `web` from the dropdown protocol and rejects all selections while the registry is unavailable.

The page renders one global mode card, not one card per arm. During `SWITCHING`, the selector is disabled and the active display shows the neutral transition. Policy and Pika placeholders show their diagnostic detail without presenting them as motion-producing implementations.

The existing motion handlers become mode-aware wrappers. With no registry, they retain current behavior. With a registry, each qualifying Web motion request is queued behind a Web override request and correlated by request ID. It is forwarded exactly once after a matching `ACTIVE/web` state. Failure, timeout, service disappearance, or a newer superseding browser request removes it without sending an Action goal.

Software stop bypasses mode selection. Gripper, calibration, pose reading, inverse kinematics, joint-record management, and motion recovery retain their existing mode-neutral behavior.

## Failure Handling and Diagnostics

- Unknown or non-selectable browser modes return a stable protocol error.
- Registry/service disappearance hides the selector and fails pending selection/override requests with an explicit message.
- A rejected executor request leaves the active mode unchanged.
- A branch exception publishes `FAILED`, includes the original detail, and selects `none` on the following tick.
- Mode events enter the existing behavior-tree runtime diagnostics as `SERVICE` or `EXECUTOR` events without replacing ROS 2 node logging.
- The Web page distinguishes requested, neutral switching, active, failed, and unavailable states.
- The router never converts a failed Web override into a direct motion send. A later separate command may use direct control after the router is confirmed absent.
- Future mode subtrees must preserve Action result details and cancellation ownership under the existing behavior-tree skill contract.

## Configuration and Documentation

The authoritative tree is `config/behavior-trees/control_router.xml`. No second YAML mode catalog is introduced. ROS service names follow the fixed executor namespace, and Web labels come from XML registrations.

`config/ros/behavior_tree.yaml` points its control-router path at this XML and retains the tick rate, mode-switch timeout, and safe fallback `none`; the obsolete lease setting is removed. `config/ros/realman_web_control.yaml` adds commented discovery-period and Web-override timeout values. The CLI and launch code load these authoritative root configurations rather than duplicating numeric defaults in source.

Update the behavior-tree development skill with reactive routing, registry rules, Web override ordering, and placeholder boundaries. Update the Web developer manual, behavior-tree control/motion pages, startup index, architecture guide, and troubleshooting page with the new command, ROS graph, WebSocket events, and failure behavior.

## Testing

### Behavior tree and ROS

- ReactiveSequence reticks its selector every tick.
- ReactiveFallback reevaluates from the first branch and halts the old running branch before activating another.
- Switching Policy to Pika, Pika to Web, and Web to None each passes through an observable neutral tick.
- Re-requesting the active mode does not add a neutral transition or increment the epoch.
- A superseding request invalidates the earlier request ID.
- Registry validation covers duplicates, malformed/dynamic metadata, missing None, selectable Web, and catalog order.
- Existing stateful Sequence/Fallback and one-shot MoveJ tests remain unchanged and passing.
- Policy/Pika/Web/Idle placeholders create no ROS Action client and send no goal.
- XML contract verifies all four branches and their metadata.
- `./rm65 bt control` selects the new tree, requires l/m/r, sets stop/exit-on-terminal false, stays persistent, and retains lock/archive cleanup.

### Web bridge

- Protocol validation accepts user-selectable IDs from a supplied catalog and rejects Web, unknown, malformed, and unavailable selections.
- The mode card appears only while the list service is available and uses executor labels/order.
- State updates render active, switching, failed, and unavailable states.
- A Web motion sends no Action before matching `ACTIVE/web`, sends once afterward, and is discarded on failure, timeout, disappearance, or supersession.
- With no router, existing Web motion behavior remains unchanged.
- Leaving Web cancels all Web-owned motion types across l/m/r before selection.
- Software stop bypasses mode selection; gripper and recovery remain mode-neutral.

### Integration

- Build and test `realman_msgs`, `realman_bt`, and `realman_web_control` in ROS 2 Humble.
- Run focused Python, C++, XML/CLI, and Web browser tests.
- Build the driver image and execute `./rm65 bt control` in dry-run against mock Action Servers.
- Confirm port 8765 discovers the catalog on router startup and hides it after router shutdown.
- Confirm Policy and Pika placeholders never generate a real or mock motion goal.
- Build the VitePress developer manual and validate affected routes.

Real hardware motion is not required to validate this feature because Policy and Pika are placeholders and Web Action forwarding already has a testable bridge boundary.

## Out of Scope

- Policy model execution or policy command generation.
- Pika device protocol, calibration, or command generation.
- Per-arm input modes or mixed ownership between arms.
- Automatic return from Web to the previous autonomous mode.
- Starting the control router from `./rm65 up`.
- Running the control router concurrently with another behavior-tree executor.
- Changing gripper ownership based on the arm input mode.
