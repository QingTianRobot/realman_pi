# Dual-Arm Web Keyboard Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a catalog-driven `keyboard` input mode that lets one :8765 browser independently command the Cartesian velocity of the `l` and `r` end effectors with hold-to-run keys and fail-safe stopping.

**Architecture:** `control.xml` selects a long-running `KeyboardVelocityInput` marker under the existing `ReactiveFallback`. The Web service validates a single-browser keyboard lease and publishes normalized `TwistStamped` input on `/keyboard/l|r/cartesian_velocity`; a separate `keyboard_control_router` owns the two driver Action sessions, validates each arm's active default WORK frame, refreshes commands, and stops on stale input or mode loss.

**Tech Stack:** ROS 2 Humble, BehaviorTree.CPP-X C++ nodes, Python `rclpy`, `realman_msgs/action/CartesianVelocity`, aiohttp WebSocket, TypeScript/Vite, Playwright, pytest, CTest.

**Spec:** `docs/superpowers/specs/2026-09-21-keyboard-control-design.md`

## Global Constraints

- Only arms `l` and `r` participate; no keyboard Action client, publisher, subscription, or UI control may target `m`.
- `config/behavior-trees/control.xml` remains the authoritative input-mode catalog; the browser must not hard-code a mode list.
- Mode order is exactly `web`, `keyboard`, `policy`, `pikaposition`, `pikavelocity`, `none`.
- The keyboard velocity Action uses each arm's configured, active, verified default WORK reference; BASE is rejected and TOOL is never an automatic fallback.
- Key identity uses physical `KeyboardEvent.code` values, not localized `KeyboardEvent.key` characters.
- Initial linear and angular speed fractions are `0.4`; with current motion profiles they produce `0.02 m/s` and `0.10 rad/s` component commands.
- Browser heartbeat is `50 ms`; Web-input timeout is `150 ms`; driver command period/watchdog remain the per-arm values in `config/ros/realman_motion.yaml` (`20 ms`/`100 ms` today).
- `config/ros/keyboard_control.yaml` owns only key mapping, speed fractions, heartbeat, and Web-input timeout. Motion limits remain owned by `config/ros/realman_motion.yaml`; WORK names/frames remain owned by `config/ros/realman_coordinates.yaml`.
- One WebSocket owns the keyboard lease. Competing clients, stale sequence numbers, unknown keys, and `m` messages are rejected.
- Empty key sets, focus loss, page hiding, disconnect, input timeout, input-mode change, executor loss, and node shutdown converge to zero commands and session cancellation.
- `dry_run=true` creates no driver goal and publishes no driver command.
- Ordinary validation must not move real hardware. Real motion requires a separate explicit operator authorization after dry-run validation.
- ROS runtime code uses official ROS logging only; configuration lives under root `config/` with explanatory comments.

---

### Task 1: Register the keyboard behavior-tree mode

**Files:**
- Modify: `config/behavior-trees/control.xml`
- Modify: `src/behavior/realman_bt/include/realman_bt/input_mode_nodes.hpp`
- Modify: `src/behavior/realman_bt/src/input_mode_nodes.cpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/test/test_control_router_tree.py`
- Modify: `src/behavior/realman_bt/test/test_input_mode_nodes.cpp`
- Modify: `src/behavior/realman_bt/test/test_input_mode_executor.cpp`

**Interfaces:**
- Consumes: existing `InputModeGuard`, `ActivateInputMode`, `InputModeCoordinator`, and `ReactiveFallback` contracts.
- Produces: registered XML tag `KeyboardVelocityInput`; selectable mode ID `keyboard`; label `Web / 键盘速度控制`.

- [ ] **Step 1: Write failing XML and node lifecycle assertions**

Update `test_control_router_tree.py` so `expected` begins as follows and the remap count becomes seven:

```python
expected = [
    ("web", "Web", "false", "WebInputStub", None, False),
    (
        "keyboard",
        "Web / 键盘速度控制",
        "true",
        "KeyboardVelocityInput",
        None,
        False,
    ),
    ("policy", "Policy", "true", "PolicyInputStub", None, False),
    (
        "pikaposition",
        "Pika / 位置控制",
        "true",
        "PikaPositionInput",
        "pika_position_entry",
        True,
    ),
    (
        "pikavelocity",
        "Pika / 速度控制",
        "true",
        "PikaVelocityInput",
        "pika_velocity_entry",
        True,
    ),
    ("none", "无输入", "true", "IdleInput", None, False),
]
assert remapped == [("selected_mode", "{selected_mode}")] * 7
```

In `test_input_mode_nodes.cpp`, register and exercise the new marker inside
`testPlaceholderLeavesRunWithoutRosOrActionDependencies()`:

```cpp
using realman_bt::KeyboardVelocityInputNode;

factory.registerNodeType<KeyboardVelocityInputNode>("KeyboardVelocityInput");

KeyboardVelocityInputNode keyboard("keyboard", diagnostic_config);
assert(keyboard.executeTick() == bt_core::NodeStatus::RUNNING);
assert(keyboard.executeTick() == bt_core::NodeStatus::RUNNING);
keyboard.halt();
assert(keyboard.executeTick() == bt_core::NodeStatus::RUNNING);
```

Update `test_input_mode_executor.cpp` to assert the actual service catalog:

```cpp
require(catalog->mode_ids == std::vector<std::string>(
            {"web", "keyboard", "policy", "pikaposition", "pikavelocity", "none"}),
        "catalog order differs from XML declarations");
require(catalog->labels == std::vector<std::string>(
            {"Web", "Web / 键盘速度控制", "Policy", "Pika / 位置控制",
             "Pika / 速度控制", "无输入"}),
        "catalog labels differ from XML declarations");
require(catalog->selectable.size() == 6 && !catalog->selectable[0] &&
            catalog->selectable[1] && catalog->selectable[2] &&
            catalog->selectable[3] && catalog->selectable[4] &&
            catalog->selectable[5],
        "catalog arrays/selectability differ from XML declarations");
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
python3 -m pytest -q src/behavior/realman_bt/test/test_control_router_tree.py
```

Expected: FAIL because the `keyboard` branch is absent.

Build/run the C++ test through the existing BT test entry:

```bash
./rm65 bt-test build
./rm65 bt-test all
```

Expected: the updated C++ assertion fails or compilation reports the missing `KeyboardVelocityInputNode`.

- [ ] **Step 3: Add the marker node and XML branch**

Declare the node in `input_mode_nodes.hpp`:

```cpp
class KeyboardVelocityInputNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  bool entry_recorded_{false};
};
```

Implement it with the same once-per-entry diagnostic boundary as Pika:

```cpp
bt_core::NodeStatus KeyboardVelocityInputNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Keyboard velocity stream is routed by keyboard_control_router");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void KeyboardVelocityInputNode::onHalted() { entry_recorded_ = false; }
```

Register it in `RealmanBtExecutorNode` and insert this XML branch immediately after `web_branch`:

```xml
<ReactiveSequence name="keyboard_branch">
  <InputModeGuard mode="keyboard" label="Web / 键盘速度控制" selectable="true"
                  selected_mode="{selected_mode}"/>
  <ActivateInputMode mode="keyboard"/>
  <KeyboardVelocityInput/>
</ReactiveSequence>
```

Keep the root startup metadata unchanged. It still preflights three-arm
`execute_motion` for the Pika entry pose; `keyboard_control_router` performs
runtime availability checks for only `/l/cartesian_velocity` and
`/r/cartesian_velocity`. Adding `cartesian_velocity` to the root metadata would
incorrectly require `/m/cartesian_velocity`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
python3 -m pytest -q \
  src/behavior/realman_bt/test/test_control_router_tree.py \
  src/behavior/realman_bt/test/test_tree_startup_metadata.py \
  src/behavior/realman_bt/test/test_tree_contract.py
./rm65 bt-test all
```

Expected: PASS, with the catalog order and startup metadata asserted exactly.

- [ ] **Step 5: Commit the BT catalog increment**

```bash
git add config/behavior-trees/control.xml \
  src/behavior/realman_bt/include/realman_bt/input_mode_nodes.hpp \
  src/behavior/realman_bt/src/input_mode_nodes.cpp \
  src/behavior/realman_bt/src/realman_bt_executor_node.cpp \
  src/behavior/realman_bt/test/test_control_router_tree.py \
  src/behavior/realman_bt/test/test_input_mode_nodes.cpp \
  src/behavior/realman_bt/test/test_input_mode_executor.cpp
git commit -m "feat(bt): add keyboard input mode"
```

---

### Task 2: Add authoritative keyboard configuration and mapping

**Files:**
- Create: `config/ros/keyboard_control.yaml`
- Create: `src/driver/realman_web_control/realman_web_control/keyboard_control.py`
- Create: `src/driver/realman_web_control/test/test_keyboard_control.py`
- Modify: `src/driver/realman_web_control/realman_web_control/model_manifest.py`
- Modify: `src/driver/realman_web_control/test/test_model_manifest.py`
- Modify: `config/web-control/vite.config.mjs`
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/launch/web_control.launch.py`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/index.html`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/assets/*`

**Interfaces:**
- Consumes: `realman_motion.yaml` maxima and periods; `realman_coordinates.yaml` default WORK controller names and ROS frame IDs.
- Produces: `KeyboardControlConfig`; `KeyboardArmConfig`; `KeyboardArmCommand`; `load_keyboard_control_config(keyboard_path, motion_path, coordinates_path)`; `KeyboardControlConfig.command(arm, keys)`; browser manifest field `keyboard_control`.

- [ ] **Step 1: Write failing loader and manifest tests**

Create `test_keyboard_control.py` with the desired API:

```python
from pathlib import Path
import pytest

from realman_web_control.keyboard_control import load_keyboard_control_config

ROOT = Path(__file__).parents[4]


def load_config():
    return load_keyboard_control_config(
        ROOT / "config/ros/keyboard_control.yaml",
        ROOT / "config/ros/realman_motion.yaml",
        ROOT / "config/ros/realman_coordinates.yaml",
    )


def test_config_maps_independent_physical_keys_to_bounded_work_commands():
    config = load_config()
    assert tuple(config.arms) == ("l", "r")
    assert config.heartbeat_period_ms == 50
    assert config.input_timeout_ms == 150
    command = config.command("l", frozenset({"KeyW", "KeyD", "KeyQ"}))
    assert command.linear == pytest.approx((0.02, -0.02, 0.0))
    assert command.angular == pytest.approx((0.10, 0.0, 0.0))
    assert command.reference_name == "cell"
    assert command.frame_id == "l/work/cell"


def test_opposite_keys_cancel_and_middle_arm_is_rejected():
    config = load_config()
    command = config.command("r", frozenset({"KeyI", "KeyK"}))
    assert command.linear == (0.0, 0.0, 0.0)
    with pytest.raises(ValueError, match="l or r"):
        config.command("m", frozenset())
```

Extend `test_model_manifest.py`:

```python
assert manifest["keyboard_control"]["heartbeat_period_ms"] == 50
assert set(manifest["keyboard_control"]["arms"]) == {"l", "r"}
assert manifest["keyboard_control"]["arms"]["l"]["work_frame_id"] == "l/work/cell"
assert manifest["keyboard_control"]["arms"]["l"]["bindings"]["vx"] == {
    "positive": "KeyW", "negative": "KeyS"
}
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
python3 -m pytest -q \
  src/driver/realman_web_control/test/test_keyboard_control.py \
  src/driver/realman_web_control/test/test_model_manifest.py
```

Expected: import/file/signature failures because the configuration and loader do not exist.

- [ ] **Step 3: Create the commented root configuration**

Create `config/ros/keyboard_control.yaml` with this schema and exact defaults:

```yaml
# Hold-to-run Web keyboard input for the left and right arms only.
version: 1

# The browser sends its complete pressed-key set at this interval.
heartbeat_period_ms: 50
# The ROS keyboard router stops an arm after this gap in Web input.
input_timeout_ms: 150

# Fractions multiply per-arm maxima from realman_motion.yaml.
linear_speed_fraction: 0.4
angular_speed_fraction: 0.4

arms:
  l:
    vx: {positive: KeyW, negative: KeyS}
    vy: {positive: KeyA, negative: KeyD}
    vz: {positive: KeyR, negative: KeyF}
    wx: {positive: KeyQ, negative: KeyE}
    wy: {positive: KeyZ, negative: KeyC}
    wz: {positive: KeyX, negative: KeyV}
  r:
    vx: {positive: KeyI, negative: KeyK}
    vy: {positive: KeyJ, negative: KeyL}
    vz: {positive: KeyU, negative: KeyO}
    wx: {positive: KeyY, negative: KeyP}
    wy: {positive: KeyN, negative: KeyM}
    wz: {positive: KeyB, negative: KeyG}
```

- [ ] **Step 4: Implement the pure configuration module**

Provide immutable values with exact public methods:

```python
@dataclass(frozen=True)
class KeyboardArmCommand:
    arm: str
    linear: tuple[float, float, float]
    angular: tuple[float, float, float]
    reference_name: str
    frame_id: str


@dataclass(frozen=True)
class KeyboardArmConfig:
    bindings: dict[str, tuple[str, str]]
    allowed_codes: frozenset[str]
    linear_speed_mps: float
    angular_speed_radps: float
    reference_name: str
    frame_id: str


@dataclass(frozen=True)
class KeyboardControlConfig:
    heartbeat_period_ms: int
    input_timeout_ms: int
    arms: dict[str, KeyboardArmConfig]

    def command(self, arm: str, keys: frozenset[str]) -> KeyboardArmCommand:
        arm_config = self.arms.get(arm)
        if arm_config is None:
            raise ValueError("keyboard arm must be l or r")
        unknown = keys - arm_config.allowed_codes
        if unknown:
            raise ValueError(f"unknown keyboard codes for {arm}: {sorted(unknown)}")
        values = []
        for axis in ("vx", "vy", "vz", "wx", "wy", "wz"):
            positive, negative = arm_config.bindings[axis]
            values.append(float(positive in keys) - float(negative in keys))
        linear = tuple(value * arm_config.linear_speed_mps for value in values[:3])
        angular = tuple(value * arm_config.angular_speed_radps for value in values[3:])
        return KeyboardArmCommand(
            arm, linear, angular,
            arm_config.reference_name, arm_config.frame_id,
        )

    def public_manifest(self) -> dict[str, object]:
        return {
            "heartbeat_period_ms": self.heartbeat_period_ms,
            "input_timeout_ms": self.input_timeout_ms,
            "arms": {
                arm: {
                    "bindings": {
                        axis: {"positive": pair[0], "negative": pair[1]}
                        for axis, pair in config.bindings.items()
                    },
                    "linear_speed_mps": config.linear_speed_mps,
                    "angular_speed_radps": config.angular_speed_radps,
                    "work_reference_name": config.reference_name,
                    "work_frame_id": config.frame_id,
                }
                for arm, config in self.arms.items()
            },
        }


def load_keyboard_control_config(
    keyboard_path: str | Path,
    motion_path: str | Path,
    coordinates_path: str | Path,
) -> KeyboardControlConfig:
    """Validate all three root YAML sources and return derived l/r settings."""
```

Implement the loader body by parsing the three YAML mappings, applying the
validation list below, resolving each arm's `default_work`, and constructing
the immutable values above. It must not mutate or write any source file.

Validation must reject:

```python
set(document["arms"]) != {"l", "r"}
not 10 <= heartbeat_period_ms < input_timeout_ms
not 0.0 < speed_fraction <= 1.0
duplicate physical codes within or across arms
axes other than ("vx", "vy", "vz", "wx", "wy", "wz")
codes that do not match r"Key[A-Z]"
missing default_work/controller_name/ros_frame_id
```

Compute velocity components from the existing per-arm maxima. Do not write derived limits back to YAML.

- [ ] **Step 5: Add keyboard data to production and development manifests**

Change `build_manifest` to accept `keyboard_path` and add:

```python
keyboard = load_keyboard_control_config(keyboard_path, motion_path, coordinates_path)
return {
    # existing fields
    "keyboard_control": keyboard.public_manifest(),
}
```

Declare/pass `keyboard_control_config_file` in `web_control_node.py` and `web_control.launch.py` using:

```python
str(config_root / "ros" / "keyboard_control.yaml")
```

Update `config/web-control/vite.config.mjs::devManifest()` to read the same YAML and produce the same public structure. Its calculations must multiply the configured fractions by each arm's values from `realman_motion.yaml`; it must read controller/frame names from the configured `default_work` in `realman_coordinates.yaml`.

- [ ] **Step 6: Run loader, manifest, and Web build tests**

Run:

```bash
python3 -m pytest -q \
  src/driver/realman_web_control/test/test_keyboard_control.py \
  src/driver/realman_web_control/test/test_model_manifest.py \
  src/driver/realman_web_control/test/test_input_mode_node.py
cd website && npm run build:web-control
```

Expected: PASS; Vite consumes the new root config and writes the static bundle.

- [ ] **Step 7: Commit the configuration contract**

```bash
git add config/ros/keyboard_control.yaml config/web-control/vite.config.mjs \
  src/driver/realman_web_control/realman_web_control/keyboard_control.py \
  src/driver/realman_web_control/realman_web_control/model_manifest.py \
  src/driver/realman_web_control/realman_web_control/web_control_node.py \
  src/driver/realman_web_control/launch/web_control.launch.py \
  src/driver/realman_web_control/test/test_keyboard_control.py \
  src/driver/realman_web_control/test/test_model_manifest.py \
  src/driver/realman_web_control/realman_web_control/static
git commit -m "feat(web): add keyboard control configuration"
```

---

### Task 3: Validate keyboard messages and correlate the browser lease

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/keyboard_control_bridge.py`
- Create: `src/driver/realman_web_control/test/test_keyboard_control_bridge.py`
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py`
- Modify: `src/driver/realman_web_control/realman_web_control/input_mode_bridge.py`
- Modify: `src/driver/realman_web_control/test/test_protocol.py`
- Modify: `src/driver/realman_web_control/test/test_input_mode_bridge.py`

**Interfaces:**
- Consumes: `KeyboardControlConfig.command()` and the existing correlated input-mode selection state machine.
- Produces: normalized `keyboard_state`; `KeyboardControlBridge.activate/deactivate/command`; effects `keyboard_lease`, `keyboard_zero`, and `request_safe_mode`.

- [ ] **Step 1: Write failing protocol tests**

Add to `test_protocol.py`:

```python
def test_keyboard_state_uses_l_r_physical_codes_and_safe_sequence():
    assert parse_message(json.dumps({
        "type": "keyboard_state", "arm": "l",
        "keys": ["KeyW", "KeyD"], "sequence": 42,
    })) == {
        "type": "keyboard_state", "arm": "l",
        "keys": ["KeyW", "KeyD"], "sequence": 42,
    }


@pytest.mark.parametrize("message", [
    {"type": "keyboard_state", "arm": "m", "keys": [], "sequence": 1},
    {"type": "keyboard_state", "arm": "l", "keys": ["w"], "sequence": 1},
    {"type": "keyboard_state", "arm": "l", "keys": ["KeyW", "KeyW"], "sequence": 1},
    {"type": "keyboard_state", "arm": "r", "keys": [], "sequence": -1},
])
def test_keyboard_state_rejects_unsafe_values(message):
    with pytest.raises(ProtocolError):
        parse_message(json.dumps(message))
```

Use the upper sequence bound `9_007_199_254_740_991` so JSON numbers remain exact in the browser.

- [ ] **Step 2: Write failing lease and input-mode effect tests**

Create `test_keyboard_control_bridge.py`:

```python
def test_only_active_owner_can_advance_each_arm_sequence(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("browser-a")
    command = bridge.command("browser-a", {
        "arm": "l", "keys": ["KeyW"], "sequence": 5,
    })
    assert command.linear == pytest.approx((0.02, 0.0, 0.0))
    with pytest.raises(ProtocolError, match="lease"):
        bridge.command("browser-b", {
            "arm": "l", "keys": [], "sequence": 6,
        })
    with pytest.raises(ProtocolError, match="sequence"):
        bridge.command("browser-a", {
            "arm": "l", "keys": [], "sequence": 5,
        })


def test_deactivate_clears_the_owner_and_sequence_state(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("browser-a")
    bridge.command("browser-a", {
        "arm": "l", "keys": ["KeyW"], "sequence": 5,
    })
    bridge.deactivate()
    assert bridge.owner is None
    with pytest.raises(ProtocolError, match="lease"):
        bridge.command("browser-a", {
            "arm": "l", "keys": [], "sequence": 6,
        })
```

Extend the `InputModeBridge` traces so successful `ACTIVE/keyboard` emits:

```python
InputModeEffect("keyboard_lease", "browser-a", {"active": True})
```

Leaving keyboard emits `keyboard_zero` before `request_mode`; disconnecting the owner emits `keyboard_zero`, `keyboard_lease(active=False)`, then `request_safe_mode` with `mode_id="none"`.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
python3 -m pytest -q \
  src/driver/realman_web_control/test/test_protocol.py \
  src/driver/realman_web_control/test/test_keyboard_control_bridge.py \
  src/driver/realman_web_control/test/test_input_mode_bridge.py
```

Expected: failures for the unsupported message, missing bridge, and missing effects.

- [ ] **Step 4: Implement protocol normalization**

Handle `keyboard_state` before the generic three-arm `_arm()` path:

```python
if message_type == "keyboard_state":
    arm = message.get("arm")
    if arm not in {"l", "r"}:
        raise ProtocolError("invalid_arm", "keyboard arm must be l or r")
    keys = message.get("keys")
    if (not isinstance(keys, list) or len(keys) > 12 or
            not all(isinstance(code, str) and re.fullmatch(r"Key[A-Z]", code) for code in keys) or
            len(set(keys)) != len(keys)):
        raise ProtocolError("invalid_field", "keys must be unique physical KeyA through KeyZ codes")
    sequence = _integer(message.get("sequence"), "sequence", 0, 9_007_199_254_740_991)
    return {"type": message_type, "arm": arm, "keys": keys, "sequence": sequence}
```

- [ ] **Step 5: Implement lease state and correlated effects**

`KeyboardControlBridge` must expose:

```python
class KeyboardControlBridge:
    def __init__(self, config: KeyboardControlConfig) -> None:
        self._config = config
        self._owner: str | None = None
        self._sequences = {"l": -1, "r": -1}

    @property
    def owner(self) -> str | None:
        return self._owner

    def activate(self, client_id: str) -> None:
        self._owner = client_id
        self._sequences = {"l": -1, "r": -1}

    def deactivate(self) -> None:
        self._owner = None
        self._sequences = {"l": -1, "r": -1}

    def command(
        self, client_id: str, message: dict[str, Any]
    ) -> KeyboardArmCommand:
        if client_id != self._owner:
            raise ProtocolError("keyboard_lease", "client does not own keyboard control")
        arm = message["arm"]
        sequence = int(message["sequence"])
        if sequence <= self._sequences[arm]:
            raise ProtocolError("keyboard_sequence", "keyboard sequence is stale")
        try:
            command = self._config.command(arm, frozenset(message["keys"]))
        except ValueError as error:
            raise ProtocolError("keyboard_key_unknown", str(error)) from error
        self._sequences[arm] = sequence
        return command
```

`command()` validates that every key belongs to the selected arm's configured code set, enforces strictly increasing per-arm sequences, and returns a command containing `arm`, `linear`, `angular`, `reference_name`, and `frame_id`.

Extend `InputModeBridge` with `_keyboard_owner`. Use these exact transitions:

```python
# matching ACTIVE/keyboard resolution
self._keyboard_owner = pending.client_id
effects.append(InputModeEffect("keyboard_lease", pending.client_id, {"active": True}))

# leaving keyboard or catalog loss
effects += self._release_keyboard()

# owner disconnect
effects += self._release_keyboard()
effects.append(InputModeEffect("request_safe_mode", None, {"mode_id": "none"}))
```

`_release_keyboard()` returns zero/release effects only when an owner exists, making duplicate state samples idempotent.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run the same pytest command from Step 3.

Expected: PASS, including stale sequence, competing browser, mode change, catalog loss, and disconnect traces.

- [ ] **Step 7: Commit the browser protocol state machine**

```bash
git add src/driver/realman_web_control/realman_web_control/protocol.py \
  src/driver/realman_web_control/realman_web_control/input_mode_bridge.py \
  src/driver/realman_web_control/realman_web_control/keyboard_control_bridge.py \
  src/driver/realman_web_control/test/test_protocol.py \
  src/driver/realman_web_control/test/test_input_mode_bridge.py \
  src/driver/realman_web_control/test/test_keyboard_control_bridge.py
git commit -m "feat(web): arbitrate keyboard control lease"
```

---

### Task 4: Publish gated Web keyboard commands into ROS

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/test/test_input_mode_node.py`
- Modify: `src/driver/realman_web_control/test/test_web_server.py`

**Interfaces:**
- Consumes: `keyboard_state`, `KeyboardControlBridge`, `keyboard_lease`/`keyboard_zero`/`request_safe_mode` effects, and `/l|r/coordinates/state` payloads.
- Produces: `/keyboard/l/cartesian_velocity` and `/keyboard/r/cartesian_velocity` `TwistStamped` topics with default WORK frame IDs.

- [ ] **Step 1: Write failing Web node tests**

Add tests using the existing node stubs in `test_input_mode_node.py`:

```python
def test_keyboard_owner_publishes_only_verified_default_work_commands(node):
    node._keyboard.activate("browser")
    node._coordinate_state["l"] = {
        "motion_allowed": True, "work_matched": True,
        "current_work": "cell", "expected_work": "cell",
        "work": {"name": "cell", "frame_id": "l/work/cell"},
    }
    node._dispatch("browser", {
        "type": "keyboard_state", "arm": "l",
        "keys": ["KeyW"], "sequence": 1,
    })
    message = node._keyboard_publishers["l"].messages[-1]
    assert message.header.frame_id == "l/work/cell"
    assert message.twist.linear.x == pytest.approx(0.02)


def test_keyboard_rejects_unverified_work_and_never_constructs_middle_publisher(node):
    node._keyboard.activate("browser")
    node._coordinate_state["l"] = {
        "motion_allowed": False, "work_matched": False,
        "current_work": "other", "expected_work": "cell",
    }
    with pytest.raises(ProtocolError, match="WORK"):
        node._dispatch("browser", {
            "type": "keyboard_state", "arm": "l",
            "keys": ["KeyW"], "sequence": 1,
        })
    assert set(node._keyboard_publishers) == {"l", "r"}
```

Add a disconnect trace asserting two zeros and a `SelectInputMode` request for `none` with a nonempty `requester_id`.

- [ ] **Step 2: Run focused node tests and verify RED**

Run:

```bash
python3 -m pytest -q \
  src/driver/realman_web_control/test/test_input_mode_node.py \
  src/driver/realman_web_control/test/test_web_server.py
```

Expected: failures for missing publishers, dispatch branch, effect handling, and safe-mode request.

- [ ] **Step 3: Initialize keyboard resources from the loaded config**

In `WebControlNode.__init__`:

```python
self._keyboard_config = load_keyboard_control_config(
    keyboard_config_file, motion_file, coordinates_file
)
self._keyboard = KeyboardControlBridge(self._keyboard_config)
self._keyboard_publishers = {
    arm: self.create_publisher(
        TwistStamped, f"/keyboard/{arm}/cartesian_velocity", 1
    )
    for arm in ("l", "r")
}
```

Do not add a publisher for `m`.

- [ ] **Step 4: Gate and publish normalized commands**

Add exact helper boundaries:

```python
def _keyboard_work_available(self, arm: str) -> bool:
    state = self._coordinate_state.get(arm, {})
    arm_config = self._keyboard_config.arms[arm]
    work = state.get("work")
    return bool(
        state.get("motion_allowed") is True
        and state.get("work_matched") is True
        and state.get("current_work") == arm_config.reference_name
        and state.get("expected_work") == arm_config.reference_name
        and isinstance(work, dict)
        and work.get("name") == arm_config.reference_name
        and work.get("frame_id") == arm_config.frame_id
    )

def _keyboard_state(self, client_id: str, message: dict[str, Any]) -> None:
    command = self._keyboard.command(client_id, message)
    nonzero = any(command.linear) or any(command.angular)
    if nonzero and not self._keyboard_work_available(command.arm):
        raise ProtocolError(
            "keyboard_work_unavailable",
            f"{command.arm} default WORK reference is unavailable",
        )
    self._publish_keyboard_command(command)

def _publish_keyboard_command(self, command: KeyboardArmCommand) -> None:
    message = TwistStamped()
    message.header.stamp = self.get_clock().now().to_msg()
    message.header.frame_id = command.frame_id
    message.twist.linear.x, message.twist.linear.y, message.twist.linear.z = command.linear
    message.twist.angular.x, message.twist.angular.y, message.twist.angular.z = command.angular
    self._keyboard_publishers[command.arm].publish(message)

def _publish_keyboard_zeros(self) -> None:
    for command in (
        self._keyboard_config.command("l", frozenset()),
        self._keyboard_config.command("r", frozenset()),
    ):
        self._publish_keyboard_command(command)

def _request_keyboard_safe_mode(self) -> None:
    request = SelectInputMode.Request()
    request.mode_id = "none"
    request.requester_id = "web:keyboard-disconnect"
    self._mode_select_client.call_async(request)
```

`_keyboard_work_available()` returns true only when all conditions hold:

```python
state["motion_allowed"] is True
state["work_matched"] is True
state["current_work"] == arm_config.reference_name
state["expected_work"] == arm_config.reference_name
state["work"]["name"] == arm_config.reference_name
state["work"]["frame_id"] == arm_config.frame_id
```

Permit an empty key set even when WORK has just become unavailable so the owner can publish zero. Reject non-empty commands with code `keyboard_work_unavailable`.

Handle the new input-mode effects in order:

```python
elif effect.kind == "keyboard_lease":
    if effect.payload["active"]:
        self._keyboard.activate(effect.client_id)
    else:
        self._keyboard.deactivate()
elif effect.kind == "keyboard_zero":
    self._publish_keyboard_zeros()
elif effect.kind == "request_safe_mode":
    self._request_keyboard_safe_mode()
```

The internal safe-mode request is untracked by browser request state and uses a requester such as `web:keyboard-disconnect`.

- [ ] **Step 5: Make shutdown and disconnect neutral**

Before stopping the Web server in `destroy_node()`, call `_publish_keyboard_zeros()` and deactivate the lease. On owner disconnect, apply the bridge effects before canceling ordinary Web Actions. Failure to reach the selection service must be logged with `get_logger().warning`; the input timeout still stops the router.

- [ ] **Step 6: Run node and full Web Python tests**

Run:

```bash
python3 -m pytest -q src/driver/realman_web_control/test
```

Expected: PASS with no ROS hardware connection.

- [ ] **Step 7: Commit the Web-to-ROS bridge**

```bash
git add src/driver/realman_web_control/realman_web_control/web_control_node.py \
  src/driver/realman_web_control/test/test_input_mode_node.py \
  src/driver/realman_web_control/test/test_web_server.py
git commit -m "feat(web): publish dual-arm keyboard velocity input"
```

---

### Task 5: Implement the dual-arm keyboard Action router

**Files:**
- Create: `src/behavior/realman_bt/scripts/keyboard_control_router.py`
- Create: `src/behavior/realman_bt/test/test_keyboard_control_router.py`
- Modify: `src/behavior/realman_bt/launch/control_router.launch.py`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Modify: `src/behavior/realman_bt/package.xml`
- Modify: `src/behavior/realman_bt/test/test_launch_module_imports.py`

**Interfaces:**
- Consumes: `/keyboard/l|r/cartesian_velocity`, `/l|r/coordinates/state`, `/realman_bt_executor/input_mode_state`, flattened coordinate/profile registries, and `keyboard_control.yaml` timeout.
- Produces: `/<arm>/cartesian_velocity` Action sessions and `/<arm>/cartesian_velocity/command` refresh streams for `l` and `r` only.

- [ ] **Step 1: Write failing router contract tests**

Create `test_keyboard_control_router.py` with source and pure-helper assertions:

```python
def test_router_constructs_only_left_and_right_resources():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'for arm in ("l", "r")' in source
    assert 'f"/keyboard/{arm}/cartesian_velocity"' in source
    assert 'f"/{arm}/cartesian_velocity/command"' in source
    assert '"/keyboard/m/cartesian_velocity"' not in source


def test_router_requires_active_keyboard_and_verified_default_work():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'message.active_mode == "keyboard"' in source
    assert 'state.get("work_matched") is True' in source
    assert 'state.get("motion_allowed") is True' in source
    assert 'CartesianVelocity.Goal.WORK' in source
    assert 'CartesianVelocity.Goal.BASE' not in source


def test_router_stops_on_timeout_mode_loss_and_shutdown():
    source = ROUTER.read_text(encoding="utf-8")
    assert "input_timeout_ms" in source
    assert "_publish_zero" in source
    assert "_cancel" in source
    assert "cancel_after_accept" in source
    assert "destroy_node" in source
    assert "self.dry_run" in source
```

Add import tests for the pure profile parser:

```python
from keyboard_control_router import parse_arm_profiles


def test_profile_parser_resolves_only_l_r_default_work_and_motion_limits():
    profiles = parse_arm_profiles(
        [
            "l|default_work|1|cell|l/work/cell",
            "m|default_work|1|cell|m/work/cell",
            "r|default_work|1|cell|r/work/cell",
        ],
        [
            "l|20|100|0.05|0.25|0.1|0.5|10|2",
            "m|20|100|0.05|0.25|0.1|0.5|10|2",
            "r|20|100|0.05|0.25|0.1|0.5|10|2",
        ],
    )
    assert set(profiles) == {"l", "r"}
    assert profiles["l"].reference_name == "cell"
    assert profiles["l"].frame_id == "l/work/cell"
    assert profiles["r"].control_period_ms == 20


def test_profile_parser_rejects_base_or_missing_default_work():
    with pytest.raises(ValueError, match="default WORK"):
        parse_arm_profiles(
            ["l|base|0|base|l/base_link", "r|default_work|1|cell|r/work/cell"],
            [
                "l|20|100|0.05|0.25|0.1|0.5|10|2",
                "r|20|100|0.05|0.25|0.1|0.5|10|2",
            ],
        )
```

- [ ] **Step 2: Run router tests and verify RED**

Run:

```bash
python3 -m pytest -q \
  src/behavior/realman_bt/test/test_keyboard_control_router.py \
  src/behavior/realman_bt/test/test_launch_module_imports.py
```

Expected: FAIL because the executable and launch node do not exist.

- [ ] **Step 3: Implement typed router state and parameter parsing**

Model the Pika router's Action ownership but keep keyboard-specific state separate:

```python
@dataclass(frozen=True)
class _ArmProfile:
    reference_name: str
    frame_id: str
    control_period_ms: int
    watchdog_ms: int
    max_linear_speed_mps: float
    max_angular_speed_radps: float
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float


@dataclass
class _ArmState:
    action_client: ActionClient
    command_publisher: Any
    profile: _ArmProfile
    goal_handle: Any = None
    pending_goal: Any = None
    cancel_pending: Any = None
    latest_command: TwistStamped | None = None
    last_input_at: float = 0.0
    work_available: bool = False
    cancel_after_accept: bool = False
```

Parse the `default_work` entry from `coordinate_references` and motion values from `cartesian_velocity_profiles`. Reject missing, duplicate, malformed, non-finite, or non-positive fields before creating Action clients.

- [ ] **Step 4: Implement mode, coordinate, input, and timer gates**

Use callbacks with these responsibilities:

```python
def _mode_state(self, message: InputModeState) -> None:
    active = (
        message.active_mode
        if message.phase == InputModeState.ACTIVE
        and message.active_mode == "keyboard"
        else ""
    )
    if active != self.mode:
        self.mode = active
        if not active:
            for arm in ("l", "r"):
                self._publish_zero(arm)
                self._cancel(arm, "input mode left keyboard")

def _coordinate_state(self, arm: str, message: String) -> None:
    payload = json.loads(message.data)
    self._arms[arm].work_available = self._work_matches(arm, payload)
    if not self._arms[arm].work_available:
        self._publish_zero(arm)
        self._cancel(arm, "default WORK reference unavailable")

def _velocity_input(self, arm: str, message: TwistStamped) -> None:
    state = self._arms[arm]
    self._validate_input(arm, message)
    state.latest_command = message
    state.last_input_at = time.monotonic()

def _reconcile(self) -> None:
    for arm in ("l", "r"):
        self._reconcile_arm(arm, time.monotonic())

def _publish_zero(self, arm: str) -> None:
    zero = TwistStamped()
    zero.header.stamp = self.get_clock().now().to_msg()
    zero.header.frame_id = self._arms[arm].profile.frame_id
    self._publish_driver_command(arm, zero)

def _cancel(self, arm: str, reason: str) -> None:
    self.get_logger().warning(f"Stopping keyboard control for {arm}: {reason}")
    state = self._arms[arm]
    if state.pending_goal is not None:
        state.cancel_after_accept = True
    self._request_cancel_if_owned(arm)
```

`_publish_driver_command()` must return without publishing when `dry_run` is
true. Otherwise it must stamp a copy with the current ROS time, force the
profile WORK frame ID, and publish only when that arm has an accepted goal
handle. This single helper applies to nonzero commands and zero refreshes.

The goal-response callback must clear `pending_goal` and immediately cancel an
accepted handle without storing it as active when any of these is true:

```python
state.cancel_after_accept
self.mode != "keyboard"
not state.work_available
time.monotonic() - state.last_input_at >= self.input_timeout_ms / 1000.0
```

Reset `cancel_after_accept` only after rejection, successful cancellation
submission, or before starting a fresh goal. Add a focused fake-future test that
calls the callback after `_cancel()` and asserts `cancel_goal_async()` was
invoked and the handle was never assigned to `state.goal_handle`.

Input validation requires:

```python
self.mode == "keyboard"
message.header.frame_id == profile.frame_id
all six components are finite
abs(linear component) <= profile.max_linear_speed_mps
abs(angular component) <= profile.max_angular_speed_radps
```

The coordinate gate checks the same six fields used by the Web node. A nonzero fresh command starts a session only when WORK is available. Once accepted, `_reconcile()` republishes the latest command every `control_period_ms`; empty input refreshes zero. At `input_timeout_ms`, mode loss, coordinate loss, or shutdown, publish zero before requesting cancellation.

- [ ] **Step 5: Construct the driver Action goal without BASE fallback**

Use:

```python
goal = CartesianVelocity.Goal()
goal.reference_type = CartesianVelocity.Goal.WORK
goal.reference_name = profile.reference_name
goal.control_period_ms = profile.control_period_ms
goal.watchdog_ms = profile.watchdog_ms
goal.max_linear_accel_mps2 = profile.max_linear_accel_mps2
goal.max_angular_accel_radps2 = profile.max_angular_accel_radps2
goal.follow = True
goal.trajectory_mode = 0
goal.radio = 0
```

Goal rejection, callback exceptions, and non-success results are logged and leave the arm stopped. `dry_run` must return before `send_goal_async()` and before publishing to the driver command topic.

- [ ] **Step 6: Wire launch, install, and dependencies**

In `control_router.launch.py`, pass the already loaded `coordinate_references` and `velocity_profiles`, plus `input_timeout_ms` loaded from `config/ros/keyboard_control.yaml`, to the router node:

```python
keyboard_router = Node(
    package="realman_bt",
    executable="keyboard_control_router",
    name="keyboard_control_router",
    output="screen",
    parameters=[{
        "dry_run": LaunchConfiguration("dry_run"),
        "input_timeout_ms": 150,
        "coordinate_references": coordinate_references,
        "cartesian_velocity_profiles": velocity_profiles,
    }],
)
```

The implementation must load `150` from YAML rather than retain that literal in launch code. Install the script as `keyboard_control_router`, add Python runtime dependencies already used by Pika (`rclpy`, `geometry_msgs`, `std_msgs`, `realman_msgs`), and include the new pytest in CMake.

- [ ] **Step 7: Run router and BT tests**

Run:

```bash
python3 -m pytest -q \
  src/behavior/realman_bt/test/test_keyboard_control_router.py \
  src/behavior/realman_bt/test/test_launch_module_imports.py \
  src/behavior/realman_bt/test/test_control_router_tree.py
./rm65 bt-test all
RM65_DRY_RUN=1 ./rm65 bt control
```

Expected: tests PASS; wrapper preview names both routers and sends no container/hardware command.

- [ ] **Step 8: Commit the keyboard router**

```bash
git add src/behavior/realman_bt/scripts/keyboard_control_router.py \
  src/behavior/realman_bt/test/test_keyboard_control_router.py \
  src/behavior/realman_bt/launch/control_router.launch.py \
  src/behavior/realman_bt/CMakeLists.txt \
  src/behavior/realman_bt/package.xml \
  src/behavior/realman_bt/test/test_launch_module_imports.py
git commit -m "feat(bt): route dual-arm keyboard velocity"
```

---

### Task 6: Add the catalog-driven :8765 keyboard panel

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Modify: `website/tests/web-control/web-control.spec.ts`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/index.html`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/assets/*`

**Interfaces:**
- Consumes: `layout.keyboard_control`, discovered `keyboard` mode, `input_mode_state`, and per-arm `coordinate_state`.
- Produces: complete `keyboard_state` heartbeats for `l` and `r`, independent pressed-key displays, and immediate empty states on browser safety events.

- [ ] **Step 1: Write failing Playwright tests for render and independent keys**

Extend the fake `/api/layout`/hello data and mode catalog with `keyboard`. Add:

```typescript
test("captures independent l/r physical keys only while keyboard is active", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, keyboardCatalog);
  await emitWebSocketEvent(page, activeKeyboardState);
  await expect(page.locator("#keyboard-control-card")).toBeVisible();

  await page.keyboard.down("w");
  await page.keyboard.down("i");
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map(JSON.parse)
      .filter((message) => message.type === "keyboard_state")
      .some((message) => message.arm === "l" && message.keys.includes("KeyW"))
  )).toBe(true);
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map(JSON.parse)
      .filter((message) => message.type === "keyboard_state")
      .some((message) => message.arm === "r" && message.keys.includes("KeyI"))
  )).toBe(true);
});
```

Add separate tests for `keyup`, `blur`, `visibilitychange`, catalog disappearance, non-keyboard active mode, and WORK mismatch. Each safety event must produce empty states for both arms and stop the heartbeat.

- [ ] **Step 2: Run the desktop Web test and verify RED**

Run:

```bash
cd website
npm run test:web-control -- --project=desktop \
  --grep "keyboard|physical keys|focus|WORK"
```

Expected: FAIL because the card and keyboard messages do not exist.

- [ ] **Step 3: Render the panel from the manifest, not constants**

Add a hidden panel with stable selectors:

```html
<section id="keyboard-control-card" class="panel panel-section" hidden>
  <div id="keyboard-left" data-arm="l"></div>
  <div id="keyboard-right" data-arm="r"></div>
</section>
```

Build key labels from `manifest.keyboard_control.arms[arm].bindings`. Display each arm's WORK frame and one of `READY`, `MOVING`, `RELEASED`, or `WORK UNAVAILABLE`. Do not use those labels as proof of physical motion.

- [ ] **Step 4: Implement complete-set capture and heartbeat**

Maintain exact state:

```typescript
const keyboardPressed: Record<"l" | "r", Set<string>> = {
  l: new Set(),
  r: new Set(),
};
const keyboardSequence: Record<"l" | "r", number> = { l: 0, r: 0 };
let keyboardHeartbeat = 0;
```

Use `event.code`, ignore editable targets (`input`, `textarea`, `select`, and `contenteditable`), and call `event.preventDefault()` only for configured movement codes while `ACTIVE/keyboard` and the arm's WORK gate is available.

At each configured heartbeat:

```typescript
for (const arm of ["l", "r"] as const) {
  send({
    type: "keyboard_state",
    arm,
    keys: [...keyboardPressed[arm]].sort(),
    sequence: ++keyboardSequence[arm],
  });
}
```

`keyup` changes the set; an empty set is still sent. `blur`, hidden visibility, socket close, input-mode loss, and catalog loss call a shared `releaseKeyboardInput()` that sends empty states when the socket is open, clears both sets, and stops the interval.

- [ ] **Step 5: Style desktop and mobile layouts without obscuring stop controls**

Use a two-column desktop grid and one-column mobile layout. Pressed keycaps need a visible active state, but no animation may imply robot feedback. Keep the global software-stop button visible at existing breakpoints.

- [ ] **Step 6: Run UI tests and rebuild committed static assets**

Run:

```bash
cd website
npm run test:web-control -- --project=desktop
npm run test:web-control -- --project=mobile
npm run build:web-control
```

Expected: both projects PASS and the Vite build updates only the expected static files.

- [ ] **Step 7: Commit the browser UI**

```bash
git add src/driver/realman_web_control/web/src/main.ts \
  src/driver/realman_web_control/web/src/style.css \
  website/tests/web-control/web-control.spec.ts \
  src/driver/realman_web_control/realman_web_control/static
git commit -m "feat(web): add dual-arm keyboard control panel"
```

---

### Task 7: Synchronize documentation and run full dry-run verification

**Files:**
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/realman-web-control.md`
- Modify: `website/docs/development/behavior-tree-motion.md`
- Modify: `website/docs/development/system-bringup.md`
- Modify: `website/docs/development/index.md` only if the existing summaries need the new keyboard capability named explicitly.

**Interfaces:**
- Consumes: completed runtime behavior and exact ROS/Web contracts from Tasks 1-6.
- Produces: current developer manual, successful site build, and evidence-backed dry-run validation.

- [ ] **Step 1: Update the behavior-tree control contract**

Document:

```text
catalog order: web, keyboard, policy, pikaposition, pikavelocity, none
keyboard branch: guard -> activate -> KeyboardVelocityInput
Web topics: /keyboard/l|r/cartesian_velocity
driver sessions: /l|r/cartesian_velocity + command topics
WORK-only eligibility and no TOOL fallback
single WebSocket lease and neutral none handoff
```

Include the exact failure behavior for mode loss, stale input, coordinate mismatch, disconnect, and dry-run.

- [ ] **Step 2: Update Web, motion, and bringup pages**

In `realman-web-control.md`, add the `keyboard_state` JSON shape, physical key-code rule, heartbeat, UI states, and release events. In `behavior-tree-motion.md`, describe the independent dual-arm sessions and the two watchdog layers. In `system-bringup.md`, state that `./rm65 up` serves the panel but `./rm65 bt control` must be running before the catalog exposes `keyboard`.

- [ ] **Step 3: Run focused source checks**

Run:

```bash
rg -n "printf|std::cout|std::cerr" \
  src/behavior/realman_bt/scripts/keyboard_control_router.py \
  src/behavior/realman_bt/src/input_mode_nodes.cpp
rg -n "/keyboard/m|for arm in \(\"l\", \"m\", \"r\"\)" \
  src/behavior/realman_bt/scripts/keyboard_control_router.py \
  src/driver/realman_web_control/realman_web_control/keyboard_control.py
git diff --check
```

Expected: the logging and middle-arm searches return no matches; `git diff --check` exits zero.

- [ ] **Step 4: Run Python, BT, Web, and configuration verification**

Run:

```bash
python3 -m pytest -q src/driver/realman_web_control/test
./rm65 bt-test all
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
docker compose config >/dev/null
cd website
npm run test:web-control -- --project=desktop
npm run test:web-control -- --project=mobile
npm run build:web-control
npm run build
```

Expected: every command exits zero. Record exact test counts and any intentionally skipped environment-dependent cases.

- [ ] **Step 5: Run wrapper preview and executor dry-run**

From the repository root:

```bash
RM65_DRY_RUN=1 ./rm65 bt control
REALMAN_BT_DRY_RUN=true ./rm65 bt control
```

For the second command, stop the persistent dry-run router after confirming:

```text
input catalog contains keyboard
keyboard_control_router and pika_control_router are running
no CartesianVelocity goal or driver command is emitted
```

If the long-lived driver container or ROS graph is unavailable, report that exact limitation; do not substitute a real-motion run.

- [ ] **Step 6: Commit documentation and verification-aligned changes**

```bash
git add website/docs/development/behavior-tree-control.md \
  website/docs/development/realman-web-control.md \
  website/docs/development/behavior-tree-motion.md \
  website/docs/development/system-bringup.md \
  website/docs/development/index.md
git commit -m "docs: document dual-arm keyboard control"
```

- [ ] **Step 7: Perform final branch verification before claiming completion**

Run:

```bash
git status --short
git log --oneline --decorate -8
git diff HEAD~7..HEAD --check
```

Expected: no unintended working-tree changes, only the planned commits, and no whitespace errors. Do not perform real arm motion as part of this plan.
