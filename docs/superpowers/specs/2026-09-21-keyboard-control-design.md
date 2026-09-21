# l/r Web Keyboard Cartesian Control

## Status

Draft design approved at the approach level. Implementation starts only after
this document is reviewed and approved.

## Goal

When the persistent `control` behavior tree is running, the Web control page at
`:8765` advertises a keyboard input mode. After the operator selects that mode,
two independent keyboard layouts control the Cartesian end-effector velocity of
the left (`l`) and right (`r`) arms. The middle arm (`m`) is never part of the
keyboard control session. Releasing all movement keys produces zero velocity;
browser focus loss, WebSocket loss, input-mode changes, behavior-tree stop, and
stale heartbeats also stop both arms.

The behavior tree remains the owner of input-mode selection. The Web page is an
input source, and the driver remains the owner of motion sessions, limits, and
physical stop behavior.

## Chosen approach

Add a dedicated `keyboard_control_router` alongside the existing
`pika_control_router` in `control_router.launch.py`.

The router subscribes to Web-originated keyboard velocity topics, observes the
authoritative `/realman_bt_executor/input_mode_state`, and creates at most one
Cartesian velocity Action session per arm. It forwards commands only while the
`keyboard` mode is `ACTIVE`. This keeps the keyboard protocol separate from the
Pika protocol while reusing the existing Action-plus-command-topic session
pattern.

The BT node named `KeyboardVelocityInput` is a long-running ownership marker,
matching the existing Pika input leaves. It does not open SDK connections or
publish driver commands. The router owns the asynchronous Action lifecycle and
the command watchdog.

## Runtime data flow

```text
Browser :8765
  -> WebSocket keyboard_state messages
  -> realman_web_control validates ownership and maps keys to TwistStamped
  -> /keyboard/l/cartesian_velocity
  -> /keyboard/r/cartesian_velocity
  -> keyboard_control_router
  -> /l|r/cartesian_velocity Action
  -> /l|r/cartesian_velocity/command
  -> realman driver motion_coordinator
```

The router also subscribes to:

```text
/realman_bt_executor/input_mode_state
```

The driver-facing Action goal uses each arm's profile from
`config/ros/realman_motion.yaml` and that arm's configured `default_work` from
`config/ros/realman_coordinates.yaml`. The current driver rejects BASE for
Cartesian velocity sessions because the vendor velocity initializer supports
only WORK or TOOL. Version 1 therefore requires the active, verified default
WORK reference. Commands use fresh `TwistStamped` timestamps and the resolved
WORK `ros_frame_id`.

The router does not silently fall back to TOOL. If an arm's configured default
WORK is not active and verified, keyboard control for that arm remains disabled
and no Action goal is sent. This preserves fixed directional semantics instead
of making the key directions rotate with the tool pose.

## Behavior-tree contract

`config/behavior-trees/control.xml` remains the authoritative input-mode
catalog. Insert the selectable `keyboard` branch after the non-selectable
`web` branch:

```xml
<ReactiveSequence name="keyboard_branch">
  <InputModeGuard mode="keyboard" label="Web / 键盘速度控制"
                  selectable="true" selected_mode="{selected_mode}"/>
  <ActivateInputMode mode="keyboard"/>
  <KeyboardVelocityInput/>
</ReactiveSequence>
```

The outer `ReactiveSequence` and inner `ReactiveFallback` are unchanged. The
existing neutral `none` handoff remains mandatory when changing modes, so the
old running branch is halted before the keyboard branch is activated. When the
keyboard branch is halted, `KeyboardVelocityInput::onHalted()` resets its
per-entry diagnostic state; the router observes the non-keyboard active mode and
cancels any keyboard sessions.

The mode catalog order becomes:

```text
web, keyboard, policy, pikaposition, pikavelocity, none
```

`web` remains non-selectable and sticky. `keyboard` is selectable. `none`
remains the safe fallback and neutral handoff mode. No browser-side static mode
list is added.

The new tag must be explicitly registered by `RealmanBtExecutorNode`. It has no
public ports and returns `RUNNING` while selected. It must have focused unit,
registration, and XML contract tests.

## WebSocket protocol

Add a validated browser message type:

```json
{
  "type": "keyboard_state",
  "arm": "l",
  "keys": ["KeyW", "KeyD"],
  "sequence": 42
}
```

Rules:

- `arm` is only `l` or `r`; `m` is rejected.
- `keys` is a bounded array of unique physical `KeyboardEvent.code` identifiers
  from the configured mapping. Character values such as `event.key` are not
  accepted because they vary with input method and keyboard layout.
- `sequence` is a bounded non-negative integer; older sequences are ignored.
- The browser sends a state heartbeat at the configured control period even
  when `keys` is empty.
- Keydown and keyup are reduced to a complete pressed-key set, avoiding stuck
  keys from event ordering.
- `blur`, `visibilitychange`, page unload, and WebSocket close publish an empty
  key set before local state is cleared when transport permits; the router's
  watchdog remains the final fallback.

The Web node maps the validated key set to a six-element velocity vector using
the authoritative keyboard configuration. It publishes only the `l` and `r`
input topics; it never publishes directly to `/<arm>/cartesian_velocity/command`
and never creates the driver Action session.

## Keyboard mapping and configuration

Create `config/ros/keyboard_control.yaml` with explanatory comments. It is the
only production source for the keyboard mapping, command speed fractions,
browser heartbeat period, and Web-input timeout. Existing per-arm speed,
acceleration, Action-period, and driver-watchdog limits remain authoritative in
`config/ros/realman_motion.yaml`; the new file must not duplicate them. The
initial mapping uses disjoint physical letter codes so both arms can move
simultaneously:

```text
l: KeyW/KeyS, KeyA/KeyD, KeyR/KeyF, KeyQ/KeyE, KeyZ/KeyC, KeyX/KeyV
r: KeyI/KeyK, KeyJ/KeyL, KeyU/KeyO, KeyY/KeyP, KeyN/KeyM, KeyB/KeyG
```

Each pair maps to positive/negative values for `vx`, `vy`, `vz`, `wx`, `wy`,
and `wz`, respectively. The initial linear and angular command fractions are
`0.4`, so `l` and `r` initially command `0.02 m/s` and `0.10 rad/s` from the
current `0.05 m/s` and `0.25 rad/s` maxima. The initial browser heartbeat is
`50 ms`; the Web-input timeout is `150 ms`. The router refreshes accepted
driver commands at each arm's configured `20 ms` period, while the driver's
existing `100 ms` watchdog independently stops a failed router. WORK controller
names and ROS frame IDs are resolved from `realman_coordinates.yaml`; the new
configuration does not duplicate them. All fractions and timings are finite,
positive, and range-validated during startup.

The Web node loads and validates this file, adds a sanitized
`keyboard_control` section to the existing hello/layout payload, and uses the
same loaded data to map key sets to velocities. The UI therefore does not
duplicate key mappings or numeric speeds in TypeScript. Movement keys are
hold-to-run, and an empty set is always zero; version 1 has no separate dead-man
key.

## Router lifecycle and safety

`keyboard_control_router` creates Action clients, command publishers, and input
subscriptions only for `l` and `r`.

- Before opening a session, the router requires the selected arm's current
  coordinate state to report the configured default WORK as active and
  verified. If that condition is false, it suppresses the goal, publishes no
  command, and reports the arm as unavailable.
- On `ACTIVE/keyboard`, the first non-zero input starts that arm's Cartesian
  velocity session. The two arms start independently and are not physically
  synchronized.
- A non-empty key state publishes the mapped command only after the Action goal
  is accepted.
- After a session has started, an empty key state publishes an explicit zero
  `TwistStamped` while the session remains healthy. An arm that has never
  received a non-zero state does not open an Action session.
- If no heartbeat arrives before `input_timeout_ms`, the router publishes zero,
  cancels the arm session, and records a warning with the arm and reason.
- Any mode other than `keyboard`, any non-`ACTIVE` phase, or an executor
  publisher incarnation change cancels both sessions and prevents forwarding.
- Goal rejection, Action result failure, cancellation failure, and malformed
  input do not become success; they are logged with the official ROS 2 logger.
- `dry_run=true` validates subscriptions and state transitions but creates no
  driver goal and publishes no driver command.
- Node shutdown cancels both sessions and sends neutral commands before release.

Keyboard input has one browser owner at a time. The Web node associates the
client that successfully requested `keyboard` with the active keyboard lease.
States from another client are rejected with a stable protocol error. The lease
is cleared on mode change or failed activation. On owner disconnect, the Web
node publishes zero states for both arms and requests `none`; the router input
timeout remains the independent fallback if either operation cannot complete.
The next client must select `keyboard` again.

## Web UI behavior

The existing input-mode card remains catalog-driven. The keyboard panel is
rendered when the discovered catalog contains `keyboard`, which occurs after
`./rm65 bt control` is running and discovered by the long-lived :8765 service.
It shows independent `l` and `r` key groups, the currently pressed keys, and a
local `READY`, `MOVING`, `RELEASED`, or `WORK UNAVAILABLE` state. It also shows
the resolved WORK frame for each arm, such as `l/work/cell` or `r/work/cell`.
These labels describe browser input capture and coordinate eligibility, not
confirmation of physical motion. If the control tree disappears or an arm's
WORK reference becomes unverified, the affected controls are disabled,
pressed-key state is cleared, and no further non-zero keyboard messages are
sent for that arm.

The panel does not expose arbitrary velocity or frame values in the keyboard
path. It shows the configured mapping and safety status. Existing direct Web
motion controls remain governed by the existing `web` mode and are not silently
converted into keyboard commands.

## Failure and handoff behavior

1. Browser selects `keyboard` through the existing input-mode WebSocket
   request.
2. Executor performs the existing neutral `none` handoff and activates
   `keyboard`.
3. The bridge confirms `ACTIVE/keyboard`, grants the requesting WebSocket the
   keyboard lease, and only then accepts its keyboard velocity states.
4. Selecting another mode first cancels keyboard sessions, then performs the
   existing neutral handoff.
5. A failed transition returns to `none`, clears the keyboard lease, and sends
   an error/state event to the browser.
6. Browser close, server shutdown, executor stop, and router shutdown all
   converge to zero velocity and session cancellation.

No keyboard command is allowed to bypass the mode router or the driver Action
boundary.

## Testing and validation

Focused tests must cover:

- exact `control.xml` branch order, literals, registration, and metadata;
- `KeyboardVelocityInput` lifecycle and halt behavior;
- keyboard YAML validation, key uniqueness, finite limits, and l/r-only scope;
- default-WORK resolution, active/verified coordinate gating, and explicit
  rejection of BASE or TOOL fallback;
- WebSocket parsing, rejected `m`, duplicate/unknown keys, sequence ordering,
  empty-state zero behavior, and bounded payloads;
- one keyboard lease, disconnect/release, competing clients, and mode changes;
- router mode gating, l/r Action creation, no m resources, watchdog timeout,
  zero commands, cancellation, dry-run, and Action failure paths;
- Web UI rendering and keydown/keyup/blur/visibility handling;
- mock graph integration with recorded commands and no hardware connection.

Required validation order:

```bash
./rm65 bt-test all
python3 -m pytest -q src/driver/realman_web_control/test
RM65_DRY_RUN=1 ./rm65 bt control
REALMAN_BT_DRY_RUN=true ./rm65 bt control
```

For the Web UI, run the existing `website` build/tests after the source UI is
updated. Real motion is a separate explicitly authorized step and is not part
of ordinary tests.

## Documentation updates

Update these existing pages after implementation:

- `website/docs/development/behavior-tree-control.md` for the `keyboard` mode,
  BT branch, ROS graph, lease, and router lifecycle;
- `website/docs/development/realman-web-control.md` for the WebSocket message,
  panel behavior, and disconnect safety;
- `website/docs/development/behavior-tree-motion.md` for the dual-arm
  Cartesian session and watchdog contract;
- `website/docs/development/system-bringup.md` or startup documentation if the
  launch process or operator commands change.

Run `npm run build` from `website/` and include the result in the completion
summary.
