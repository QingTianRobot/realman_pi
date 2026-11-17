# Pika 键盘一键采集 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 SJDrealman 上用 enine 外接 W/A/S/D 键盘的启停状态（`/foot_pedal/enabled`）自动开始/结束录制，并在结束后把 l、r 臂 MoveJ 回 `pika_default_pose`。

**Architecture:** 新 ament_python 包 `realman_pika_session`：纯 Python 的配置加载（`config_loader.py`）和状态机（`episode_machine.py`）不 import rclpy，可在 Mac 上直接 pytest；`trigger_node.py` 只做 ROS 订阅、异步 service/action 调用和状态发布；`pika_episode.launch.py` 由 `system.launch.py` 包含，配置 `enabled: false` 时不启动节点。

**Tech Stack:** ROS 2 Humble、rclpy、`realman_msgs`（ExecuteMotion、InputModeState、CartesianVelocityState）、`realman_recording_msgs`（ManageRecording、RecordingStatus）、PyYAML、pytest。

Spec：`docs/superpowers/specs/2026-11-17-pika-keyboard-episode-design.md`

## Global Constraints

- 所有运行时配置在仓库根 `config/`：新文件 `config/ros/pika_episode.yaml`；归位位姿只从 `config/ros/pika_config.yaml` 的 `pika_default_pose` 读取，不复制。
- 仓库默认 `enabled: false`；SJD 在主机配置里打开。
- 只在 `active_mode == "pikavelocity"` 时响应键盘。
- 臂名映射：`left→l`、`middle→m`、`right→r`；`skip: true` 的臂不归位、不等待。
- MoveJ goal：`command=MOVEJ`、`reference_type=BASE`、`reference_name=""`、`connect=false`、`blend_radius_percent=0`、`velocity_percent=home_velocity_percent`（默认 30）、`timeout_sec=home_timeout_sec`（默认 120）。
- 录制 START：`command=START`、`profile`（默认 `teleop_v1`）、`task`、`duration_sec=0`、`record_cameras`（默认 true）、`start_at_walltime_ns=0`。STOP：`command=STOP`，`session_id` 为本节点开的 session。
- 节点只 STOP 自己开的 session，绝不 STOP 别人的。
- 异常停止（键盘状态超过 `keyboard_stale_sec`=3.0 s 未更新、或模式离开 pikavelocity）：STOP 录制、进入 FAILED、不归位。
- 归位时不动夹爪。
- 状态话题 `/pika_episode/state`：`std_msgs/String`（JSON：`state`、`session_id`、`task`、`detail`、`stamp_ns`），reliable + transient_local，depth 1。
- ROS 日志用节点 logger（`get_logger()`），不用 print。
- 文档是功能的一部分：`pika-teleop.md`、`recording-platform.md` 必须同步更新；不新增页面。
- 提交信息用 Conventional Commit，结尾加 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。

## File Structure

| 文件 | 职责 |
| --- | --- |
| `src/behavior/realman_pika_session/package.xml`、`setup.py`、`setup.cfg`、`resource/realman_pika_session` | 包元数据 |
| `src/behavior/realman_pika_session/realman_pika_session/__init__.py` | 空 |
| `.../realman_pika_session/config_loader.py` | 读并校验 `pika_episode.yaml` 与 `pika_default_pose` |
| `.../realman_pika_session/episode_machine.py` | 纯状态机，输入事件、输出动作 |
| `.../realman_pika_session/trigger_node.py` | ROS 外壳 |
| `.../launch/pika_episode.launch.py` | 读 `enabled`，决定是否启动节点 |
| `.../test/test_config_loader.py`、`test_episode_machine.py`、`test_trigger_node_ros.py` | 测试 |
| `config/ros/pika_episode.yaml` | 新配置 |
| `src/realman_bringup/launch/system.launch.py`、`package.xml`、`test/test_system_launch.py` | 包含新 launch |
| `config/docker/ros2-humble-rviz.Dockerfile` | colcon 清单加新包 |
| `website/docs/development/pika-teleop.md`、`recording-platform.md` | 文档 |

## 测试环境

- 纯 Python 测试（Task 1、2）在 Mac 上跑：`cd src/behavior/realman_pika_session && PYTHONPATH=. python3 -m pytest test/test_config_loader.py test/test_episode_machine.py -q`（需要 `pyyaml`、`pytest`）。
- ROS 测试（Task 3、4）需要 Humble：在 enine 或 SJD 上用 `rm65-humble-rviz:local` 起一次性容器，把仓库挂进去，`colcon build --packages-up-to realman_pika_session realman_bringup` 后 `colcon test --packages-select realman_pika_session realman_bringup --pytest-args -p no:anyio`，再 `colcon test-result --verbose`。镜像里 pytest 的 anyio 插件是坏的，必须带 `-p no:anyio`。示例（在主机上，仓库副本在 `~/scratch/pika_episode`）：

```bash
docker run --rm --network none -v ~/scratch/pika_episode:/ws -w /ws rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && colcon build --packages-up-to realman_pika_session realman_bringup && source install/setup.bash && colcon test --packages-select realman_pika_session realman_bringup --pytest-args -p no:anyio; colcon test-result --verbose'
```

---

### Task 1: 包骨架、配置文件与配置加载

**Files:**
- Create: `src/behavior/realman_pika_session/package.xml`
- Create: `src/behavior/realman_pika_session/setup.py`
- Create: `src/behavior/realman_pika_session/setup.cfg`
- Create: `src/behavior/realman_pika_session/resource/realman_pika_session`（空文件）
- Create: `src/behavior/realman_pika_session/realman_pika_session/__init__.py`（空文件）
- Create: `src/behavior/realman_pika_session/realman_pika_session/config_loader.py`
- Create: `config/ros/pika_episode.yaml`
- Test: `src/behavior/realman_pika_session/test/test_config_loader.py`

**Interfaces:**
- Produces:
  - `@dataclass(frozen=True) class EpisodeConfig: enabled: bool; task: str; profile: str; record_cameras: bool; keyboard_topic: str; required_mode: str; keyboard_stale_sec: float; release_timeout_sec: float; home_velocity_percent: int; home_timeout_sec: float`
  - `load_episode_config(path: Path) -> EpisodeConfig`
  - `load_home_pose(path: Path) -> dict[str, tuple[float, ...]]`，键是 `l`/`m`/`r`（只含未 skip 的臂），值是 6 个角度（度）。
  - 两者出错都抛 `ValueError`，信息以文件路径开头。

- [ ] **Step 1: 写失败测试**

`src/behavior/realman_pika_session/test/test_config_loader.py`：

```python
from pathlib import Path

import pytest

from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose

REPO_CONFIG = Path(__file__).resolve().parents[4] / "config" / "ros"


def _write(tmp_path: Path, name: str, text: str) -> Path:
    path = tmp_path / name
    path.write_text(text, encoding="utf-8")
    return path


def test_repo_episode_config_defaults_to_disabled():
    config = load_episode_config(REPO_CONFIG / "pika_episode.yaml")
    assert config == EpisodeConfig(
        enabled=False,
        task="",
        profile="teleop_v1",
        record_cameras=True,
        keyboard_topic="/foot_pedal/enabled",
        required_mode="pikavelocity",
        keyboard_stale_sec=3.0,
        release_timeout_sec=8.0,
        home_velocity_percent=30,
        home_timeout_sec=120.0,
    )


def test_episode_config_rejects_bad_values(tmp_path):
    base = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    bad = _write(tmp_path, "e.yaml", base.replace("home_velocity_percent: 30", "home_velocity_percent: 0"))
    with pytest.raises(ValueError, match="home_velocity_percent"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e2.yaml", base.replace("keyboard_stale_sec: 3.0", "keyboard_stale_sec: -1"))
    with pytest.raises(ValueError, match="keyboard_stale_sec"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e3.yaml", base.replace("enabled: false", "enabled: maybe"))
    with pytest.raises(ValueError, match="enabled"):
        load_episode_config(bad)


def test_repo_home_pose_has_three_arms():
    pose = load_home_pose(REPO_CONFIG / "pika_config.yaml")
    assert sorted(pose) == ["l", "m", "r"]
    assert pose["l"] == (12.172, 25.223, 73.054, -16.703, 80.307, 14.455)
    assert all(len(v) == 6 for v in pose.values())


POSE_TEMPLATE = """
pika_default_pose:
  left:
    joint_degrees: [1, 2, 3, 4, 5, 6]
  middle:
    joint_degrees: [0, 0, 0, 0, 0, 0]
    {middle_extra}
  right:
    joint_degrees: {right}
"""


def test_home_pose_skips_arm(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="skip: true", right="[1, 1, 1, 1, 1, 1]"))
    assert sorted(load_home_pose(path)) == ["l", "r"]


def test_home_pose_rejects_wrong_length_and_all_skipped(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="", right="[1, 2, 3]"))
    with pytest.raises(ValueError, match="right"):
        load_home_pose(path)
    all_skip = """
pika_default_pose:
  left: {skip: true}
  middle: {skip: true}
  right: {skip: true}
"""
    with pytest.raises(ValueError, match="at least one arm"):
        load_home_pose(_write(tmp_path, "s.yaml", all_skip))


def test_home_pose_rejects_non_finite(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="", right="[1, 2, 3, 4, 5, .nan]"))
    with pytest.raises(ValueError, match="finite"):
        load_home_pose(path)
```

- [ ] **Step 2: 运行，确认失败**

Run: `cd src/behavior/realman_pika_session && PYTHONPATH=. python3 -m pytest test/test_config_loader.py -q`
Expected: FAIL，`ModuleNotFoundError: No module named 'realman_pika_session'`

- [ ] **Step 3: 写配置文件与包骨架**

`config/ros/pika_episode.yaml`：

```yaml
# One-key Pika episode recording (src/behavior/realman_pika_session).
# The enine W/A/S/D keyboard (pika_foot_pedal node) publishes its start/stop state on
# keyboard_topic. A press that starts teleop also starts a recording; the next press
# stops the recording and MoveJs the arms back to pika_default_pose (pika_config.yaml).
# Off by default; a robot host turns it on in its own config.
enabled: false
# Task label stored in every session (the training prompt). Change it and restart
# the bringup when switching task or material.
task: ""
profile: teleop_v1
record_cameras: true
keyboard_topic: /foot_pedal/enabled
# Keys are ignored in any other input mode, so a policy run is never moved.
required_mode: pikavelocity
# No keyboard state for this long while recording = link lost: stop, no homing.
keyboard_stale_sec: 3.0
# After STOP, wait at most this long for the velocity sessions to end before MoveJ.
release_timeout_sec: 8.0
home_velocity_percent: 30
home_timeout_sec: 120.0
```

`src/behavior/realman_pika_session/package.xml`：

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>realman_pika_session</name>
  <version>0.1.0</version>
  <description>Starts and stops one recording per Pika keyboard teleop session and homes the arms.</description>
  <maintainer email="maintainer@example.com">RealMan maintainers</maintainer>
  <license>BSD-3-Clause</license>
  <buildtool_depend>ament_python</buildtool_depend>
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>realman_msgs</depend>
  <depend>realman_recording_msgs</depend>
  <exec_depend>launch</exec_depend>
  <exec_depend>launch_ros</exec_depend>
  <exec_depend>python3-yaml</exec_depend>
  <test_depend>python3-pytest</test_depend>
  <export><build_type>ament_python</build_type></export>
</package>
```

`src/behavior/realman_pika_session/setup.py`：

```python
"""Package metadata for the Pika keyboard episode trigger."""
from glob import glob

from setuptools import find_packages, setup

package_name = "realman_pika_session"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
        (f"share/{package_name}/launch", glob("launch/*.launch.py")),
        (f"share/{package_name}/config/ros", glob("../../../config/ros/pika_episode.yaml")),
        (f"share/{package_name}/config/ros", glob("../../../config/ros/pika_config.yaml")),
    ],
    install_requires=["setuptools"],
    tests_require=["pytest"],
    zip_safe=True,
    maintainer="RealMan maintainers",
    maintainer_email="maintainer@example.com",
    description="Starts and stops one recording per Pika keyboard teleop session and homes the arms.",
    license="BSD-3-Clause",
    entry_points={
        "console_scripts": [
            "pika_episode_trigger = realman_pika_session.trigger_node:main",
        ],
    },
)
```

`src/behavior/realman_pika_session/setup.cfg`：

```ini
[develop]
script_dir=$base/lib/realman_pika_session
[install]
install_scripts=$base/lib/realman_pika_session
```

创建空文件 `resource/realman_pika_session` 和 `realman_pika_session/__init__.py`。

- [ ] **Step 4: 写 `config_loader.py`**

```python
"""Load and validate the episode trigger config and the Pika home pose (no ROS imports)."""
from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import yaml

ARM_NAMESPACES = {"left": "l", "middle": "m", "right": "r"}


@dataclass(frozen=True)
class EpisodeConfig:
    enabled: bool
    task: str
    profile: str
    record_cameras: bool
    keyboard_topic: str
    required_mode: str
    keyboard_stale_sec: float
    release_timeout_sec: float
    home_velocity_percent: int
    home_timeout_sec: float


def _read(path: Path) -> dict:
    document = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        raise ValueError(f"{path}: expected a mapping")
    return document


def _bool(path: Path, doc: dict, key: str) -> bool:
    value = doc.get(key)
    if not isinstance(value, bool):
        raise ValueError(f"{path}: {key} must be true or false")
    return value


def _str(path: Path, doc: dict, key: str, allow_empty: bool = False) -> str:
    value = doc.get(key)
    if not isinstance(value, str) or (not allow_empty and not value):
        raise ValueError(f"{path}: {key} must be a {'string' if allow_empty else 'non-empty string'}")
    return value


def _positive(path: Path, doc: dict, key: str) -> float:
    value = doc.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
        raise ValueError(f"{path}: {key} must be a positive number")
    return float(value)


def load_episode_config(path: Path) -> EpisodeConfig:
    doc = _read(path)
    velocity = doc.get("home_velocity_percent")
    if isinstance(velocity, bool) or not isinstance(velocity, int) or not 1 <= velocity <= 100:
        raise ValueError(f"{path}: home_velocity_percent must be an integer in 1..100")
    return EpisodeConfig(
        enabled=_bool(path, doc, "enabled"),
        task=_str(path, doc, "task", allow_empty=True),
        profile=_str(path, doc, "profile"),
        record_cameras=_bool(path, doc, "record_cameras"),
        keyboard_topic=_str(path, doc, "keyboard_topic"),
        required_mode=_str(path, doc, "required_mode"),
        keyboard_stale_sec=_positive(path, doc, "keyboard_stale_sec"),
        release_timeout_sec=_positive(path, doc, "release_timeout_sec"),
        home_velocity_percent=velocity,
        home_timeout_sec=_positive(path, doc, "home_timeout_sec"),
    )


def load_home_pose(path: Path) -> dict[str, tuple[float, ...]]:
    pose = _read(path).get("pika_default_pose")
    if not isinstance(pose, dict):
        raise ValueError(f"{path}: missing pika_default_pose")
    result: dict[str, tuple[float, ...]] = {}
    for name, namespace in ARM_NAMESPACES.items():
        arm = pose.get(name)
        if not isinstance(arm, dict):
            raise ValueError(f"{path}: pika_default_pose.{name} is missing")
        skip = arm.get("skip", False)
        if not isinstance(skip, bool):
            raise ValueError(f"{path}: pika_default_pose.{name}.skip must be true or false")
        if skip:
            continue
        joints = arm.get("joint_degrees")
        if not isinstance(joints, list) or len(joints) != 6:
            raise ValueError(f"{path}: pika_default_pose.{name}.joint_degrees must contain six values")
        if any(isinstance(j, bool) or not isinstance(j, (int, float)) or not math.isfinite(j) for j in joints):
            raise ValueError(f"{path}: pika_default_pose.{name}.joint_degrees must be finite numbers")
        result[namespace] = tuple(float(j) for j in joints)
    if not result:
        raise ValueError(f"{path}: pika_default_pose must keep at least one arm (all are skip: true)")
    return result
```

- [ ] **Step 5: 运行，确认通过**

Run: `cd src/behavior/realman_pika_session && PYTHONPATH=. python3 -m pytest test/test_config_loader.py -q`
Expected: `6 passed`

- [ ] **Step 6: 提交**

```bash
git add config/ros/pika_episode.yaml src/behavior/realman_pika_session
git commit -m "feat(pika-session): add the episode trigger package and its config loader

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 纯 Python 状态机

**Files:**
- Create: `src/behavior/realman_pika_session/realman_pika_session/episode_machine.py`
- Test: `src/behavior/realman_pika_session/test/test_episode_machine.py`

**Interfaces:**
- Consumes: 无（不依赖 Task 1 的模块，只用其数值）。
- Produces（Task 3 依赖这些名字）：
  - `class State(str, Enum)`：`IDLE`、`STARTING`、`RECORDING`、`STOPPING`、`RELEASING`、`HOMING`、`FAILED`（值为同名小写字符串）。
  - `@dataclass(frozen=True) class Action: kind: str; arms: tuple[str, ...] = ()`，`kind` 取 `"start"`、`"stop"`、`"home"`。
  - `@dataclass(frozen=True) class MachineConfig: required_mode: str; keyboard_stale_sec: float; release_timeout_sec: float; home_arms: tuple[str, ...]`
  - `class EpisodeMachine(config: MachineConfig)`，方法都返回 `list[Action]`（`on_recording_status` 返回 None）：
    - `on_keyboard(enabled: bool, now: float)`
    - `on_mode(active_mode: str, now: float)`
    - `on_velocity_session(arm: str, active: bool, now: float)`
    - `on_recording_status(recording: bool, session_id: str) -> None`
    - `on_start_result(success: bool, session_id: str, message: str, now: float)`
    - `on_stop_result(success: bool, message: str, now: float)`
    - `on_home_result(arm: str, success: bool, message: str, now: float)`
    - `tick(now: float)`
    - `snapshot() -> dict`，键 `state`（字符串）、`session_id`、`detail`。

行为要点（测试逐条覆盖）：
- 第一条键盘消息只作基线，不算边沿（节点启动时键盘可能已是 true）。
- IDLE 上升沿：模式不符 → detail `ignored: mode is <x>`；外部 session 在录 → detail `ignored: recording busy (<id>)`；否则 → STARTING + `start`。
- STARTING 期间下降沿记为 `pending_stop`；START 成功 → RECORDING，若 `pending_stop` 立即 STOPPING + `stop`。START 失败 → IDLE，detail `start failed: <msg>`。
- RECORDING 下降沿 → STOPPING + `stop`（正常）。
- RECORDING 期间 `tick` 发现键盘超过 `keyboard_stale_sec` 未更新，或 `on_mode` 得到非 required_mode → STOPPING + `stop`（异常，`abnormal=True`）。
- STOP 结果：异常 → FAILED（不论成功与否），detail `abnormal stop: <原因>`；正常 → RELEASING，记 `stop_ok`；若所有 home_arms 的速度会话都不活跃，立刻 HOMING + `home(home_arms)`。
- RELEASING：任一 `on_velocity_session` 使全部不活跃 → HOMING；`tick` 超过 `release_timeout_sec` → HOMING（detail `release timeout`）。
- HOMING：全部臂成功 → `stop_ok` 为真 IDLE，否则 FAILED（detail `stop failed: <msg>`）；任一臂失败 → FAILED（detail `home <arm> failed: <msg>`），其余结果忽略。
- FAILED：上升沿 → IDLE（清 detail 为 `cleared`），不发动作。
- STOPPING / RELEASING / HOMING 期间的键盘边沿忽略，detail `ignored: busy (<state>)`。
- 从未收到某臂速度状态 = 视为不活跃。

- [ ] **Step 1: 写失败测试**

`src/behavior/realman_pika_session/test/test_episode_machine.py`：

```python
from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig, State

CONFIG = MachineConfig(required_mode="pikavelocity", keyboard_stale_sec=3.0, release_timeout_sec=8.0, home_arms=("l", "r"))
START = [Action("start")]
STOP = [Action("stop")]
HOME = [Action("home", ("l", "r"))]


def ready(now: float = 0.0) -> EpisodeMachine:
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("pikavelocity", now)
    assert machine.on_keyboard(False, now) == []  # baseline
    return machine


def recording(now: float = 1.0) -> EpisodeMachine:
    machine = ready()
    assert machine.on_keyboard(True, now) == START
    assert machine.on_start_result(True, "s1", "", now) == []
    assert machine.state is State.RECORDING
    return machine


def test_first_keyboard_message_is_only_a_baseline():
    machine = EpisodeMachine(CONFIG)
    machine.on_mode("pikavelocity", 0.0)
    assert machine.on_keyboard(True, 0.0) == []
    assert machine.state is State.IDLE


def test_full_episode_happy_path():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_velocity_session("r", True, 1.5)
    assert machine.on_keyboard(False, 10.0) == STOP
    assert machine.state is State.STOPPING
    assert machine.on_stop_result(True, "", 10.1) == []
    assert machine.state is State.RELEASING
    assert machine.on_velocity_session("l", False, 13.0) == []
    assert machine.on_velocity_session("r", False, 13.1) == HOME
    assert machine.state is State.HOMING
    assert machine.on_home_result("l", True, "", 20.0) == []
    assert machine.on_home_result("r", True, "", 21.0) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["session_id"] == "s1"


def test_release_without_velocity_state_homes_immediately():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_stop_result(True, "", 5.1) == HOME


def test_release_timeout_homes_anyway():
    machine = recording()
    machine.on_velocity_session("l", True, 1.5)
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.0)
    assert machine.tick(12.9) == []
    assert machine.tick(13.1) == HOME
    assert machine.snapshot()["detail"] == "release timeout"


def test_keys_ignored_outside_required_mode():
    machine = ready()
    machine.on_mode("none", 0.5)
    assert machine.on_keyboard(True, 1.0) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["detail"] == "ignored: mode is none"


def test_keys_ignored_while_someone_else_records():
    machine = ready()
    machine.on_recording_status(True, "policy-7")
    assert machine.on_keyboard(True, 1.0) == []
    assert machine.snapshot()["detail"] == "ignored: recording busy (policy-7)"


def test_start_failure_returns_to_idle():
    machine = ready()
    machine.on_keyboard(True, 1.0)
    assert machine.on_start_result(False, "", "topic_stale:/l/joint_states", 1.2) == []
    assert machine.state is State.IDLE
    assert machine.snapshot()["detail"] == "start failed: topic_stale:/l/joint_states"


def test_release_during_starting_stops_right_after_start():
    machine = ready()
    machine.on_keyboard(True, 1.0)
    assert machine.on_keyboard(False, 1.1) == []
    assert machine.on_start_result(True, "s2", "", 1.3) == STOP
    assert machine.state is State.STOPPING


def test_keyboard_stale_is_abnormal_and_never_homes():
    machine = recording(now=1.0)
    assert machine.tick(3.9) == []
    assert machine.tick(4.1) == STOP
    assert machine.on_stop_result(True, "", 4.2) == []
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: keyboard state stale"


def test_mode_leaving_is_abnormal():
    machine = recording()
    assert machine.on_mode("policy", 2.0) == STOP
    machine.on_stop_result(True, "", 2.1)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "abnormal stop: mode changed to policy"


def test_stop_failure_still_homes_but_ends_failed():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    assert machine.on_stop_result(False, "writer error", 5.1) == HOME
    machine.on_home_result("l", True, "", 9.0)
    machine.on_home_result("r", True, "", 9.0)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "stop failed: writer error"


def test_home_failure_fails_and_ignores_the_other_result():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.1)
    assert machine.on_home_result("l", False, "arm is busy", 6.0) == []
    assert machine.state is State.FAILED
    machine.on_home_result("r", True, "", 7.0)
    assert machine.state is State.FAILED
    assert machine.snapshot()["detail"] == "home l failed: arm is busy"


def test_keys_ignored_while_homing():
    machine = recording()
    machine.on_keyboard(False, 5.0)
    machine.on_stop_result(True, "", 5.1)
    assert machine.on_keyboard(True, 6.0) == []
    assert machine.state is State.HOMING
    assert machine.snapshot()["detail"] == "ignored: busy (homing)"


def test_press_clears_failed_without_starting():
    machine = recording(now=1.0)
    machine.tick(5.0)
    machine.on_stop_result(True, "", 5.0)
    assert machine.state is State.FAILED
    machine.on_keyboard(False, 6.0)  # keyboard state refreshes; falling edge ignored in FAILED
    assert machine.on_keyboard(True, 7.0) == []
    assert machine.state is State.IDLE
    assert machine.on_keyboard(False, 8.0) == []
    assert machine.on_keyboard(True, 9.0) == START
```

- [ ] **Step 2: 运行，确认失败**

Run: `cd src/behavior/realman_pika_session && PYTHONPATH=. python3 -m pytest test/test_episode_machine.py -q`
Expected: FAIL，`ModuleNotFoundError: No module named 'realman_pika_session.episode_machine'`

- [ ] **Step 3: 写 `episode_machine.py`**

```python
"""ROS-neutral state machine: one recording per Pika keyboard session, then home the arms."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class State(str, Enum):
    IDLE = "idle"
    STARTING = "starting"
    RECORDING = "recording"
    STOPPING = "stopping"
    RELEASING = "releasing"
    HOMING = "homing"
    FAILED = "failed"


@dataclass(frozen=True)
class Action:
    kind: str  # "start" | "stop" | "home"
    arms: tuple[str, ...] = ()


@dataclass(frozen=True)
class MachineConfig:
    required_mode: str
    keyboard_stale_sec: float
    release_timeout_sec: float
    home_arms: tuple[str, ...]


class EpisodeMachine:
    def __init__(self, config: MachineConfig) -> None:
        self._config = config
        self.state = State.IDLE
        self._session_id = ""
        self._detail = ""
        self._keyboard: bool | None = None
        self._keyboard_stamp = 0.0
        self._mode = ""
        self._velocity_active: dict[str, bool] = {}
        self._external_session = ""
        self._pending_stop = False
        self._abnormal = ""
        self._stop_ok = True
        self._stop_message = ""
        self._release_started = 0.0
        self._home_pending: set[str] = set()

    # ---- inputs -------------------------------------------------------
    def on_keyboard(self, enabled: bool, now: float) -> list[Action]:
        previous = self._keyboard
        self._keyboard = enabled
        self._keyboard_stamp = now
        if previous is None or previous == enabled:
            return []
        return self._rising(now) if enabled else self._falling()

    def on_mode(self, active_mode: str, now: float) -> list[Action]:
        self._mode = active_mode
        if self.state is State.RECORDING and active_mode != self._config.required_mode:
            return self._abnormal_stop(f"mode changed to {active_mode}")
        return []

    def on_velocity_session(self, arm: str, active: bool, now: float) -> list[Action]:
        self._velocity_active[arm] = active
        if self.state is State.RELEASING and self._released():
            return self._home()
        return []

    def on_recording_status(self, recording: bool, session_id: str) -> None:
        self._external_session = session_id if recording and session_id != self._session_id else ""

    def on_start_result(self, success: bool, session_id: str, message: str, now: float) -> list[Action]:
        if self.state is not State.STARTING:
            return []
        if not success:
            self.state = State.IDLE
            self._detail = f"start failed: {message}"
            return []
        self._session_id = session_id
        self.state = State.RECORDING
        self._detail = ""
        if self._pending_stop:
            return self._normal_stop()
        return []

    def on_stop_result(self, success: bool, message: str, now: float) -> list[Action]:
        if self.state is not State.STOPPING:
            return []
        if self._abnormal:
            self.state = State.FAILED
            self._detail = f"abnormal stop: {self._abnormal}"
            return []
        self._stop_ok = success
        self._stop_message = message
        self.state = State.RELEASING
        self._release_started = now
        if self._released():
            return self._home()
        return []

    def on_home_result(self, arm: str, success: bool, message: str, now: float) -> list[Action]:
        if self.state is not State.HOMING or arm not in self._home_pending:
            return []
        if not success:
            self.state = State.FAILED
            self._detail = f"home {arm} failed: {message}"
            self._home_pending.clear()
            return []
        self._home_pending.discard(arm)
        if not self._home_pending:
            if self._stop_ok:
                self.state = State.IDLE
            else:
                self.state = State.FAILED
                self._detail = f"stop failed: {self._stop_message}"
        return []

    def tick(self, now: float) -> list[Action]:
        if self.state is State.RECORDING and now - self._keyboard_stamp > self._config.keyboard_stale_sec:
            return self._abnormal_stop("keyboard state stale")
        if self.state is State.RELEASING and now - self._release_started > self._config.release_timeout_sec:
            actions = self._home()
            self._detail = "release timeout"
            return actions
        return []

    def snapshot(self) -> dict:
        return {"state": self.state.value, "session_id": self._session_id, "detail": self._detail}

    # ---- transitions --------------------------------------------------
    def _rising(self, now: float) -> list[Action]:
        if self.state is State.FAILED:
            self.state = State.IDLE
            self._detail = "cleared"
            return []
        if self.state is not State.IDLE:
            return self._ignore_busy()
        if self._mode != self._config.required_mode:
            self._detail = f"ignored: mode is {self._mode or 'unknown'}"
            return []
        if self._external_session:
            self._detail = f"ignored: recording busy ({self._external_session})"
            return []
        self.state = State.STARTING
        self._pending_stop = False
        self._abnormal = ""
        self._stop_ok = True
        self._stop_message = ""
        self._session_id = ""
        self._detail = ""
        return [Action("start")]

    def _falling(self) -> list[Action]:
        if self.state is State.STARTING:
            self._pending_stop = True
            return []
        if self.state is State.RECORDING:
            return self._normal_stop()
        if self.state in (State.STOPPING, State.RELEASING, State.HOMING):
            return self._ignore_busy()
        return []

    def _ignore_busy(self) -> list[Action]:
        self._detail = f"ignored: busy ({self.state.value})"
        return []

    def _normal_stop(self) -> list[Action]:
        self.state = State.STOPPING
        return [Action("stop")]

    def _abnormal_stop(self, reason: str) -> list[Action]:
        self._abnormal = reason
        self.state = State.STOPPING
        return [Action("stop")]

    def _released(self) -> bool:
        return not any(self._velocity_active.get(arm, False) for arm in self._config.home_arms)

    def _home(self) -> list[Action]:
        self.state = State.HOMING
        self._home_pending = set(self._config.home_arms)
        return [Action("home", self._config.home_arms)]
```

- [ ] **Step 4: 运行，确认通过**

Run: `cd src/behavior/realman_pika_session && PYTHONPATH=. python3 -m pytest test/test_episode_machine.py test/test_config_loader.py -q`
Expected: `20 passed`

- [ ] **Step 5: 变异检查**

临时把 `_released()` 改成 `return True`，运行 `test_release_timeout_homes_anyway` 应失败；还原后再跑全部应通过。

- [ ] **Step 6: 提交**

```bash
git add src/behavior/realman_pika_session/realman_pika_session/episode_machine.py src/behavior/realman_pika_session/test/test_episode_machine.py
git commit -m "feat(pika-session): add the ROS-neutral episode state machine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: ROS 节点、launch 与隔离 ROS 集成测试

**Files:**
- Create: `src/behavior/realman_pika_session/realman_pika_session/trigger_node.py`
- Create: `src/behavior/realman_pika_session/launch/pika_episode.launch.py`
- Test: `src/behavior/realman_pika_session/test/test_trigger_node_ros.py`

**Interfaces:**
- Consumes：Task 1 的 `load_episode_config`、`load_home_pose`、`EpisodeConfig`；Task 2 的 `EpisodeMachine`、`MachineConfig`、`Action`、`State`。
- Produces：
  - 可执行 `pika_episode_trigger`，节点名 `pika_episode_trigger`，ROS 参数 `episode_config_file`（str）、`pika_config_file`（str）。
  - `class TriggerNode(Node)`，构造参数 `episode_config: EpisodeConfig, home_pose: dict[str, tuple[float, ...]]`；方法 `interfaces_ready() -> bool`（录制服务和所有归位臂的 MoveJ server 都已发现）；`main()` 从参数读文件后构造。
  - 配置根目录取环境变量 `REALMAN_CONFIG_ROOT`（为空或未设时退到包 share 目录的 `config/`），与其它 launch 一致；不声明 launch 参数。

ROS 接口（全部绝对名）：
- 订阅 `keyboard_topic`（`std_msgs/Bool`，reliable，depth 10）。
- 订阅 `/realman_bt_executor/input_mode_state`（`realman_msgs/InputModeState`，reliable + transient_local，depth 1），用 `active_mode`，仅当 `phase == ACTIVE`；`phase` 非 ACTIVE 时按模式 `""` 处理（RECORDING 中会触发异常停止）。
- 订阅 `/<arm>/cartesian_velocity/state`（`realman_msgs/CartesianVelocityState`，best effort，depth 10），对每个 home 臂，用 `session_active`。
- 订阅 `/recording/status`（`realman_recording_msgs/RecordingStatus`，depth 10），`recording = state in (COUNTDOWN, RECORDING)`。
- 客户端 `/recording/manage`（ManageRecording），action 客户端 `/<arm>/execute_motion`（ExecuteMotion）。
- 发布 `/pika_episode/state`。
- 10 Hz 定时器调用 `machine.tick(now)`，并在 snapshot 变化或每秒一次时发布状态。
- 时间用 `time.monotonic()`。
- 所有调用异步：服务未就绪（`service_is_ready()` 为 False）立即按失败回送；服务调用 10 s 内没回复按失败回送（定时器检查）；action server 未就绪、goal 被拒、结果 `success=False`、或 `home_timeout_sec + 5` s 内没结果都按该臂失败回送。
- 单线程 executor（`rclpy.spin`），回调都不阻塞，因此不需要锁。

- [ ] **Step 1: 写失败的集成测试**

`src/behavior/realman_pika_session/test/test_trigger_node_ros.py`：

```python
"""Isolated-graph test: fake recorder service and fake MoveJ servers drive one full episode."""
import json
import os
import time

import pytest

rclpy = pytest.importorskip("rclpy")

from rclpy.action import ActionServer  # noqa: E402
from rclpy.executors import SingleThreadedExecutor  # noqa: E402
from rclpy.node import Node  # noqa: E402
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy  # noqa: E402
from std_msgs.msg import Bool, String  # noqa: E402

from realman_msgs.action import ExecuteMotion  # noqa: E402
from realman_msgs.msg import InputModeState  # noqa: E402
from realman_recording_msgs.srv import ManageRecording  # noqa: E402

from realman_pika_session.config_loader import EpisodeConfig  # noqa: E402
from realman_pika_session.trigger_node import TriggerNode  # noqa: E402

LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
CONFIG = EpisodeConfig(
    enabled=True, task="pick cable", profile="teleop_v1", record_cameras=True,
    keyboard_topic="/foot_pedal/enabled", required_mode="pikavelocity",
    keyboard_stale_sec=3.0, release_timeout_sec=0.5, home_velocity_percent=30, home_timeout_sec=5.0,
)
HOME = {"l": (1.0, 2.0, 3.0, 4.0, 5.0, 6.0), "r": (6.0, 5.0, 4.0, 3.0, 2.0, 1.0)}


class FakeWorld(Node):
    def __init__(self):
        super().__init__("fake_world")
        self.requests = []
        self.goals = {}
        self.states = []
        self.create_service(ManageRecording, "/recording/manage", self._manage)
        for arm in ("l", "r", "m"):
            ActionServer(self, ExecuteMotion, f"/{arm}/execute_motion", self._make_execute(arm))
        self.keyboard = self.create_publisher(Bool, "/foot_pedal/enabled", 10)
        self.mode = self.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state", LATCHED)
        self.create_subscription(String, "/pika_episode/state", lambda m: self.states.append(json.loads(m.data)), LATCHED)

    def _manage(self, request, response):
        self.requests.append((request.command, request.task, request.profile, request.session_id))
        response.success = True
        response.session_id = "sess-1"
        response.state = "RECORDING" if request.command == ManageRecording.Request.START else "READY"
        return response

    def _make_execute(self, arm):
        def execute(goal_handle):
            self.goals[arm] = goal_handle.request
            goal_handle.succeed()
            result = ExecuteMotion.Result()
            result.success = True
            return result
        return execute

    def publish_mode(self, mode):
        message = InputModeState()
        message.active_mode = mode
        message.selected_mode = mode
        message.phase = InputModeState.ACTIVE
        self.mode.publish(message)


@pytest.fixture
def graph():
    os.environ["ROS_DOMAIN_ID"] = str(150 + os.getpid() % 50)
    rclpy.init()
    world = FakeWorld()
    node = TriggerNode(CONFIG, HOME)
    executor = SingleThreadedExecutor()
    executor.add_node(world)
    executor.add_node(node)
    # Discovery takes a moment; a key press before it would be a START failure, not the case under test.
    assert spin_until(executor, node.interfaces_ready)
    yield world, executor
    executor.shutdown()
    node.destroy_node()
    world.destroy_node()
    rclpy.shutdown()


def spin_until(executor, predicate, timeout=10.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        executor.spin_once(timeout_sec=0.05)
        if predicate():
            return True
    return False


def press(world, executor, value, repeat=10):
    for _ in range(repeat):
        world.keyboard.publish(Bool(data=value))
        executor.spin_once(timeout_sec=0.05)


def last_state(world):
    return world.states[-1]["state"] if world.states else None


def test_one_key_episode_records_and_homes(graph):
    world, executor = graph
    world.publish_mode("pikavelocity")
    assert spin_until(executor, lambda: last_state(world) == "idle")
    press(world, executor, False)
    press(world, executor, True)
    assert spin_until(executor, lambda: last_state(world) == "recording")
    assert world.requests[0][:3] == (ManageRecording.Request.START, "pick cable", "teleop_v1")
    press(world, executor, False)
    assert spin_until(executor, lambda: last_state(world) == "idle" and len(world.goals) == 2)
    assert world.requests[1] == (ManageRecording.Request.STOP, "", "", "sess-1")
    assert sorted(world.goals) == ["l", "r"]  # m is not in HOME
    goal = world.goals["l"]
    assert goal.command == ExecuteMotion.Goal.MOVEJ
    assert goal.reference_type == ExecuteMotion.Goal.BASE
    assert list(goal.joint_degrees) == list(HOME["l"])
    assert goal.velocity_percent == 30
    assert goal.connect is False


def test_keys_do_nothing_outside_pikavelocity(graph):
    world, executor = graph
    world.publish_mode("none")
    assert spin_until(executor, lambda: last_state(world) == "idle")
    press(world, executor, False)
    press(world, executor, True)
    spin_until(executor, lambda: False, timeout=0.5)
    assert world.requests == []
    assert world.states[-1]["detail"] == "ignored: mode is none"
```

- [ ] **Step 2: 在 Humble 容器里运行，确认失败**

按“测试环境”一节的命令构建并测试 `realman_pika_session`。
Expected: `test_trigger_node_ros.py` 失败于 `ModuleNotFoundError: No module named 'realman_pika_session.trigger_node'`；Task 1、2 的测试通过。

- [ ] **Step 3: 写 `trigger_node.py`**

```python
"""ROS shell around EpisodeMachine: keyboard edges -> recording START/STOP -> MoveJ home."""
from __future__ import annotations

import json
import time
from pathlib import Path

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
from std_msgs.msg import Bool, String

from realman_msgs.action import ExecuteMotion
from realman_msgs.msg import CartesianVelocityState, InputModeState
from realman_recording_msgs.msg import RecordingStatus
from realman_recording_msgs.srv import ManageRecording

from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose
from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig

SERVICE_TIMEOUT_SEC = 10.0
RESULT_MARGIN_SEC = 5.0
LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
BEST_EFFORT = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)


class TriggerNode(Node):
    def __init__(self, episode_config: EpisodeConfig, home_pose: dict[str, tuple[float, ...]]) -> None:
        super().__init__("pika_episode_trigger")
        self._config = episode_config
        self._home_pose = home_pose
        arms = tuple(sorted(home_pose))
        self._machine = EpisodeMachine(MachineConfig(
            required_mode=episode_config.required_mode,
            keyboard_stale_sec=episode_config.keyboard_stale_sec,
            release_timeout_sec=episode_config.release_timeout_sec,
            home_arms=arms,
        ))
        self._recording = self.create_client(ManageRecording, "/recording/manage")
        self._movej = {arm: ActionClient(self, ExecuteMotion, f"/{arm}/execute_motion") for arm in arms}
        self._pending_call = None  # (kind, future, deadline)
        self._home_deadlines: dict[str, float] = {}
        self._state_pub = self.create_publisher(String, "/pika_episode/state", LATCHED)
        self._last_published: dict | None = None
        self._last_publish_time = 0.0

        self.create_subscription(Bool, episode_config.keyboard_topic, self._on_keyboard, 10)
        self.create_subscription(InputModeState, "/realman_bt_executor/input_mode_state", self._on_mode, LATCHED)
        self.create_subscription(RecordingStatus, "/recording/status", self._on_recording_status, 10)
        for arm in arms:
            self.create_subscription(
                CartesianVelocityState, f"/{arm}/cartesian_velocity/state",
                lambda msg, arm=arm: self._apply(self._machine.on_velocity_session(arm, msg.session_active, time.monotonic())),
                BEST_EFFORT,
            )
        self.create_timer(0.1, self._on_timer)
        self.get_logger().info(
            f"pika episode trigger ready: keyboard={episode_config.keyboard_topic} "
            f"mode={episode_config.required_mode} home_arms={','.join(arms)} task='{episode_config.task}'"
        )
        self._publish_state(force=True)

    def interfaces_ready(self) -> bool:
        """True once the recorder service and every home arm's MoveJ server are discovered."""
        return self._recording.service_is_ready() and all(c.server_is_ready() for c in self._movej.values())

    # ---- subscriptions ------------------------------------------------
    def _on_keyboard(self, message: Bool) -> None:
        self._apply(self._machine.on_keyboard(bool(message.data), time.monotonic()))

    def _on_mode(self, message: InputModeState) -> None:
        mode = message.active_mode if message.phase == InputModeState.ACTIVE else ""
        self._apply(self._machine.on_mode(mode, time.monotonic()))

    def _on_recording_status(self, message: RecordingStatus) -> None:
        recording = message.state in (RecordingStatus.COUNTDOWN, RecordingStatus.RECORDING)
        self._machine.on_recording_status(recording, message.session_id)

    def _on_timer(self) -> None:
        now = time.monotonic()
        if self._pending_call is not None and now > self._pending_call[2]:
            kind, future, _ = self._pending_call
            self._pending_call = None
            future.cancel()
            self._service_result(kind, False, "", "recording service timed out")
        for arm, deadline in list(self._home_deadlines.items()):
            if now > deadline:
                del self._home_deadlines[arm]
                self._apply(self._machine.on_home_result(arm, False, "no MoveJ result in time", now))
        self._apply(self._machine.tick(now))
        self._publish_state()

    # ---- actions ------------------------------------------------------
    def _apply(self, actions: list[Action]) -> None:
        for action in actions:
            if action.kind in ("start", "stop"):
                self._call_recording(action.kind)
            elif action.kind == "home":
                for arm in action.arms:
                    self._send_home(arm)
        self._publish_state()

    def _call_recording(self, kind: str) -> None:
        request = ManageRecording.Request()
        if kind == "start":
            request.command = ManageRecording.Request.START
            request.profile = self._config.profile
            request.task = self._config.task
            request.duration_sec = 0
            request.record_cameras = self._config.record_cameras
            request.start_at_walltime_ns = 0
        else:
            request.command = ManageRecording.Request.STOP
            request.session_id = self._machine.snapshot()["session_id"]
        if not self._recording.service_is_ready():
            self._service_result(kind, False, "", "/recording/manage is not available")
            return
        self.get_logger().info(f"recording {kind} requested")
        future = self._recording.call_async(request)
        self._pending_call = (kind, future, time.monotonic() + SERVICE_TIMEOUT_SEC)
        future.add_done_callback(lambda done, kind=kind: self._on_service_done(kind, done))

    def _on_service_done(self, kind: str, future) -> None:
        if self._pending_call is None or self._pending_call[1] is not future:
            return  # timed out already
        self._pending_call = None
        if future.cancelled() or future.exception() is not None:
            self._service_result(kind, False, "", f"recording {kind} call failed: {future.exception()}")
            return
        response = future.result()
        self._service_result(kind, response.success, response.session_id, response.message)

    def _service_result(self, kind: str, success: bool, session_id: str, message: str) -> None:
        now = time.monotonic()
        log = self.get_logger().info if success else self.get_logger().warning
        log(f"recording {kind} {'ok' if success else 'failed'}: session={session_id} {message}")
        if kind == "start":
            self._apply(self._machine.on_start_result(success, session_id, message, now))
        else:
            self._apply(self._machine.on_stop_result(success, message, now))

    def _send_home(self, arm: str) -> None:
        client = self._movej[arm]
        now = time.monotonic()
        if not client.server_is_ready():
            self._apply(self._machine.on_home_result(arm, False, f"/{arm}/execute_motion is not available", now))
            return
        goal = ExecuteMotion.Goal()
        goal.command = ExecuteMotion.Goal.MOVEJ
        goal.reference_type = ExecuteMotion.Goal.BASE
        goal.reference_name = ""
        goal.joint_degrees = list(self._home_pose[arm])
        goal.velocity_percent = self._config.home_velocity_percent
        goal.blend_radius_percent = 0
        goal.connect = False
        goal.timeout_sec = float(self._config.home_timeout_sec)
        self.get_logger().info(f"homing /{arm} to pika_default_pose {list(self._home_pose[arm])}")
        self._home_deadlines[arm] = now + self._config.home_timeout_sec + RESULT_MARGIN_SEC
        client.send_goal_async(goal).add_done_callback(lambda done, arm=arm: self._on_goal_response(arm, done))

    def _on_goal_response(self, arm: str, future) -> None:
        goal_handle = future.result() if future.exception() is None else None
        if goal_handle is None or not goal_handle.accepted:
            self._finish_home(arm, False, "MoveJ goal rejected")
            return
        goal_handle.get_result_async().add_done_callback(lambda done, arm=arm: self._on_home_done(arm, done))

    def _on_home_done(self, arm: str, future) -> None:
        if future.exception() is not None:
            self._finish_home(arm, False, f"MoveJ result failed: {future.exception()}")
            return
        result = future.result().result
        self._finish_home(arm, result.success, result.message)

    def _finish_home(self, arm: str, success: bool, message: str) -> None:
        if self._home_deadlines.pop(arm, None) is None:
            return  # already timed out
        log = self.get_logger().info if success else self.get_logger().error
        log(f"homing /{arm} {'done' if success else 'failed'}: {message}")
        self._apply(self._machine.on_home_result(arm, success, message, time.monotonic()))

    # ---- state topic --------------------------------------------------
    def _publish_state(self, force: bool = False) -> None:
        snapshot = dict(self._machine.snapshot(), task=self._config.task)
        now = time.monotonic()
        if not force and snapshot == self._last_published and now - self._last_publish_time < 1.0:
            return
        if snapshot != self._last_published:
            self.get_logger().info(f"episode state: {snapshot['state']} {snapshot['detail']}")
        self._last_published = snapshot
        self._last_publish_time = now
        self._state_pub.publish(String(data=json.dumps(dict(snapshot, stamp_ns=time.time_ns()))))


def main() -> None:
    rclpy.init()
    loader = Node("pika_episode_trigger_params")
    episode_file = loader.declare_parameter("episode_config_file", "").value
    pika_file = loader.declare_parameter("pika_config_file", "").value
    loader.destroy_node()
    node = TriggerNode(load_episode_config(Path(episode_file)), load_home_pose(Path(pika_file)))
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
```

注意：`main()` 先用临时节点 `pika_episode_trigger_params` 读两个文件路径参数，再构造 `TriggerNode`（构造函数直接收配置对象，测试因此不用写文件）。launch 必须用不带节点名前缀的全局 `--ros-args -p name:=value` 传参（Step 4 的 `arguments`），这样进程里每个节点都能读到；若改用 `parameters=[{...}]` 配 `name="pika_episode_trigger"`，参数只发给同名节点，临时节点读到的是空字符串，启动会失败。

- [ ] **Step 4: 写 `launch/pika_episode.launch.py`**

```python
#!/usr/bin/env python3
"""Start the Pika keyboard episode trigger when config/ros/pika_episode.yaml enables it."""
import os
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import LogInfo
from launch_ros.actions import Node

from realman_pika_session.config_loader import load_episode_config, load_home_pose


def _config_root() -> Path:
    fallback = Path(get_package_share_directory("realman_pika_session")) / "config"
    return Path(os.environ.get("REALMAN_CONFIG_ROOT", fallback))


def generate_launch_description():
    root = _config_root()
    episode_file = root / "ros" / "pika_episode.yaml"
    pika_file = root / "ros" / "pika_config.yaml"
    config = load_episode_config(episode_file)
    if not config.enabled:
        return LaunchDescription([LogInfo(msg=f"pika_episode_trigger disabled ({episode_file})")])
    load_home_pose(pika_file)  # fail the launch early on a bad home pose
    return LaunchDescription([
        Node(
            package="realman_pika_session",
            executable="pika_episode_trigger",
            name="pika_episode_trigger",
            output="screen",
            arguments=[
                "--ros-args",
                "-p", f"episode_config_file:={episode_file}",
                "-p", f"pika_config_file:={pika_file}",
            ],
        ),
    ])
```

- [ ] **Step 5: 在 Humble 容器里运行，确认通过**

按“测试环境”一节的命令。
Expected: `realman_pika_session` 全部测试通过（20 个纯 Python + 2 个 ROS）。再在同一容器里检查 launch：

```bash
docker run --rm --network none -v ~/scratch/pika_episode:/ws -w /ws -e REALMAN_CONFIG_ROOT=/ws/config rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source install/setup.bash && timeout 5 ros2 launch realman_pika_session pika_episode.launch.py; true'
```

Expected: 输出 `pika_episode_trigger disabled (/ws/config/ros/pika_episode.yaml)` 后退出。

- [ ] **Step 6: 变异检查**

临时在 `_send_home` 里把 `goal.connect = False` 改成 `True`，`test_one_key_episode_records_and_homes` 应失败；还原。

- [ ] **Step 7: 提交**

```bash
git add src/behavior/realman_pika_session
git commit -m "feat(pika-session): drive recording and homing from the Pika keyboard state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 接入 bringup 与镜像

**Files:**
- Modify: `src/realman_bringup/launch/system.launch.py`（`generate_launch_description` 内：share 路径、新 launch 参数、`IncludeLaunchDescription`）
- Modify: `src/realman_bringup/package.xml`（加 `<exec_depend>realman_pika_session</exec_depend>`）
- Modify: `src/realman_bringup/test/test_system_launch.py`（disabled 列表加 `"start_pika_episode"`）
- Modify: `config/docker/ros2-humble-rviz.Dockerfile:197-198`（`--packages-up-to` 与 `colcon test --packages-select` 两处都加 `realman_pika_session`）

**Interfaces:**
- Consumes：Task 3 的 `share/realman_pika_session/launch/pika_episode.launch.py`。
- Produces：`system.launch.py` 参数 `start_pika_episode`（默认 `true`）；为 `false` 时不包含该 launch。

- [ ] **Step 1: 改测试（先让它失败）**

在 `test_system_launch.py` 的 disabled 名单末尾加 `"start_pika_episode",`。在 Humble 容器里运行 `colcon test --packages-select realman_bringup --pytest-args -p no:anyio`。
Expected: 现在仍会通过（未声明的 launch configuration 不会报错）。这一步只是把参数登记进测试；真正的检查在 Step 3。

- [ ] **Step 2: 改 `system.launch.py`**

在 `calibration_share = ...` 之后加：

```python
    pika_session_share = Path(get_package_share_directory("realman_pika_session"))
```

在已有 `start_bt_launcher` 的 `LaunchConfiguration` / `DeclareLaunchArgument` 旁边，按同一写法加：

```python
    start_pika_episode = LaunchConfiguration("start_pika_episode")
```

```python
            DeclareLaunchArgument(
                "start_pika_episode",
                default_value="true",
                description="Include the Pika keyboard episode trigger (it still obeys enabled in pika_episode.yaml).",
            ),
```

在 `bt_launcher` 的 `Node(...)` 之后加：

```python
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(
                    str(pika_session_share / "launch" / "pika_episode.launch.py")
                ),
                condition=IfCondition(start_pika_episode),
            ),
```

`package.xml` 在 `<exec_depend>realman_web_control</exec_depend>` 后加 `<exec_depend>realman_pika_session</exec_depend>`。

Dockerfile 第 197、198 行的两个包列表都在 `realman_bt_mock` 后插入 ` realman_pika_session`。

- [ ] **Step 3: 在 Humble 容器里运行**

`colcon build --packages-up-to realman_bringup realman_pika_session && colcon test --packages-select realman_bringup realman_pika_session --pytest-args -p no:anyio; colcon test-result --verbose`
Expected: 全部通过。再把 disabled 名单里的 `"start_pika_episode"` 临时删掉跑一次：仍应通过（仓库配置 `enabled: false`，包含进来也只打印 disabled 日志），证明默认关闭不会在 bringup 里起进程；恢复该行。

- [ ] **Step 4: 提交**

```bash
git add src/realman_bringup config/docker/ros2-humble-rviz.Dockerfile
git commit -m "feat(bringup): include the Pika keyboard episode trigger

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 文档

**Files:**
- Modify: `website/docs/development/pika-teleop.md`（在 `## 进入 Pika 前的准备动作` 之后、`## 发送端消息规范` 之前新增一节）
- Modify: `website/docs/development/recording-platform.md`（“边界与数据流”之后的上游控制说明）

- [ ] **Step 1: 在 `pika-teleop.md` 新增一节**

```markdown
## 键盘一键采集（`pika_episode_trigger`）

enine 上的外接 W/A/S/D 小键盘由 `pika_foot_pedal` 节点读取（节点名沿用脚踏板，实际读的是键盘）。打开本功能后，一条示教 episode 只需要按两次键：

1. 在 `:8765` 进入 `pikavelocity`（l、r 先 MoveJ 到 `pika_default_pose`）。
2. 按一次 W/A/S/D：左右遥操作开始，同时 `/recording/manage` START，任务标签取自配置。
3. 再按一次：遥操作停止，录制 STOP；等 l、r 的速度会话结束（最多 `release_timeout_sec`），再把 l、r MoveJ 回 `pika_default_pose`。`skip: true` 的臂不动。
4. 录制结束后按录制平台的 `auto_export_on_stop` 自动导出；不要的 episode 在 `:8770` 回放页隐藏或 DISCARD。

节点运行在机器人主机的 bringup 里（domain 65），只消费桥过来的键盘启停状态 `/foot_pedal/enabled`（`std_msgs/Bool`）。enine 的 `pika_domain_bridge.yaml` 必须多转这个话题：

```yaml
  /foot_pedal/enabled:
    type: std_msgs/msg/Bool
```

改完重启 enine 的 `realman-pika-bridge` 用户单元。

配置在 `config/ros/pika_episode.yaml`，仓库默认 `enabled: false`；机器人主机在自己的配置里打开并填 `task`，换任务或材料时改 `task` 后重启 bringup。归位位姿不单独配置，就是 `pika_config.yaml` 的 `pika_default_pose`。

| 情况 | 行为 |
| --- | --- |
| 输入模式不是 `pikavelocity` | 按键不开录、不运动 |
| 已有别人开的录制（例如策略尝试自动录制） | 按键不开录，`detail` 写 `recording busy` |
| START 被拒（预检不过） | 遥操作照常，本条不录 |
| 开录途中就松键 | START 成功后立即 STOP 并归位 |
| 录制中键盘状态超过 3 s 没更新（桥断）或模式被切走 | STOP 录制，进入 FAILED，不归位 |
| STOP 失败 | 仍归位，但最终 FAILED |
| 归位 MoveJ 被拒或失败 | FAILED，不重试 |
| FAILED 后再按一次键 | 只清除故障，下一次按键才开新的一条 |

归位时不动夹爪：enine 的 Pika 夹爪流一直在发，机器人侧的夹爪命令会被立即覆盖。

观察状态（reliable + transient_local，JSON 含 `state`、`session_id`、`task`、`detail`）：

```bash
ros2 topic echo /pika_episode/state --qos-durability transient_local
```
```

- [ ] **Step 2: 在 `recording-platform.md` 登记上游控制方**

在“边界与数据流”一节的数据流代码块之后加一段：

```markdown
目前的 `/recording/manage` 上游有三个：人工命令行（`recording_service_client`）、行为树 PolicyRun（经 `/recording/attempt`），以及 Pika 键盘一键采集节点 `pika_episode_trigger`（见 [Pika 遥操作](./pika-teleop.md#键盘一键采集-pika-episode-trigger)），它只 START/STOP 自己开的 session。
```

锚点按 VitePress 生成规则核对：在 dev server 打开页面、点该标题取实际 id，替换上面的 `#键盘一键采集-pika-episode-trigger`。

- [ ] **Step 3: 构建网站**

Run: `cd website && npm ci && npm run build`
Expected: 构建成功，无 dead link 报错。

- [ ] **Step 4: 提交**

```bash
git add website/docs/development/pika-teleop.md website/docs/development/recording-platform.md
git commit -m "docs(pika): document one-key Pika keyboard episode recording

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: PR

- [ ] **Step 1: 推送并开 PR**

```bash
git push -u origin feat/pika-keyboard-episode
gh pr create --base main --title "feat(pika-session): one-key Pika keyboard episode recording and homing" --body "$(cat <<'EOF'
## Summary
- New package `realman_pika_session`: `pika_episode_trigger` turns the bridged Pika keyboard state into recording START/STOP and MoveJ l/r back to `pika_default_pose`.
- Config `config/ros/pika_episode.yaml` (off by default); home pose comes from `pika_config.yaml`.
- Included from `system.launch.py`; image build list updated; docs in pika-teleop / recording-platform.

## Tests
- 20 pure-Python tests (config loader + state machine) and 2 isolated-graph ROS tests (fake recorder service, fake MoveJ servers).
- Not yet run on the robot.

Spec: docs/superpowers/specs/2026-11-17-pika-keyboard-episode-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: 等 CI 变绿后由用户决定合并（仓库禁用了 auto-merge）。**

---

## 部署（不在本计划内执行，需用户逐步批准）

SJDrealman：主机配置 `pika_episode.yaml` 设 `enabled: true` 与 `task`；重建镜像前打回滚 tag；重建 `rm65-humble-rviz:local`；只重建 `realman_bringup_remote`；重建后 BT 树是 STOPPED，从 `:8765` 重新启动 control_pick。enine：`pika_domain_bridge.yaml` 加 `/foot_pedal/enabled`，重启 `realman-pika-bridge`。现场验收按 spec 的“测试”一节。
