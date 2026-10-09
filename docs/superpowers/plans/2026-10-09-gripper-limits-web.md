# 夹爪行程网页设置 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在网页夹爪面板中查看并设置每个夹爪的开位和闭位（输入框、取当前位置、原始位置点动），设置立即生效、重启后保留，并同步更新网页开度显示与 3D 夹爪。

**Architecture:** `gripper_manager` 新增 `set_limits` / `move_raw` 两个服务和一个 `transient_local` 的 `limits` 话题，是唯一写覆盖文件 `gripper_overrides.yaml` 的一方；纯逻辑（校验、覆盖文件读写、设置编排）放在不依赖 ROS 的新模块 `gripper_limits.py`。Web 节点只转发命令，并订阅 `limits` 更新缓存后广播 `gripper_list`；前端在夹爪面板加折叠的"行程设置"区。

**Tech Stack:** Python 3.10（ROS 2 Humble：rclpy、rosidl）、PyYAML、unittest/pytest、TypeScript + Vite、Playwright。

设计文档：[docs/superpowers/specs/2026-10-09-gripper-limits-web-design.md](../specs/2026-10-09-gripper-limits-web-design.md)

## Global Constraints

以下数值和命名取自设计文档，每个任务都隐含遵守：

- 开位、闭位必须是整数（拒绝布尔值和小数），并落在该夹爪的 `[min_position, max_position]` 内。
- 要求 `open_position < close_position`。
- 要求 `close_position − open_position ≥ 5% × (max_position − min_position)`。
- `set_limits` 在该设备有待发目标，或最近 2 秒内通过连续控制路径（`request_move`）下发过目标时拒绝，返回"忙"；一次性开合服务和 `move_raw` 不计入。
- `move_raw` 目标超出 `[min_position, max_position]` 时拒绝，不截断；校验必须发生在自动使能（`_ready`）之前。
- 保存顺序：校验 → 忙检查 → 原子写文件（临时文件、`fsync`、`os.replace`）→ 更新内存 → 发布 `/<name>/limits`；写文件失败时内存不变。
- 覆盖文件名 `gripper_overrides.yaml`，默认与 `gripper.yaml` 同目录，可由节点参数 `overrides_file` 指定；只允许 `open_position`、`close_position` 两个字段；由 `config/ros/.gitignore` 忽略。
- 覆盖文件损坏或某条目非法：忽略该条目，用 `gripper.yaml` 的值，打 ERROR 日志，节点照常启动。
- `/<name>/limits` 的 QoS：可靠、`transient_local`、深度 1。
- `min_position` / `max_position` 只在 `gripper.yaml` 里改，网页无法越过。
- 新接口名固定：`SetGripperLimits.srv`、`MoveGripperRaw.srv`、`GripperLimits.msg`；服务 `/<name>/set_limits`、`/<name>/move_raw`，话题 `/<name>/limits`。
- 服务器 `read_only` 时在服务端拒绝 `set_limits` / `move_raw`。
- 前端：原始位置滑块只在松手（`change`）时发送一次 `move_raw`；"设为当前位置"仅在夹爪 `connected` 且 `speed` 为 0 时可用，只填入输入框、不保存；"应用"前用 `confirm()` 显示"旧值 → 新值"；无写权限（`canWrite()` 为假）时整个折叠区禁用；有未应用修改（脏）或输入框聚焦时不被 `gripper_list` 广播覆盖。
- 不做：`speed_pct` / `force_pct` / `accel` / `decel`、`min/max` 编辑、一键恢复默认。
- 提交时只添加本计划涉及的文件，不要带上工作区里与本计划无关的未提交修改：根目录 `.gitignore`、`src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py`、`.agents/skills/realman-site-*`。

## 本地测试环境

纯 Python 测试在本地虚拟环境运行（本机没有 ROS）：

```bash
python3 -m venv ~/.venvs/realman-web
~/.venvs/realman-web/bin/pip install pytest pyyaml
```

下文用 `PY=~/.venvs/realman-web/bin/python` 指代该解释器。需要 ROS 的测试只在 Task 9 的容器里运行，本地会被跳过。

## 文件结构

| 文件 | 动作 | 职责 |
|---|---|---|
| `src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py` | 新建 | 校验、覆盖文件读写、`LimitsStore`（不依赖 ROS） |
| `src/gripper/gripper_ros2/gripper_ros2/gripper_driver.py` | 修改 | `GripperBus.is_streaming` / `apply_endpoints` |
| `src/gripper/gripper_ros2/gripper_ros2/gripper_config.py` | 修改 | 接口后缀常量 |
| `src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py` | 修改 | 新服务、`limits` 话题、启动加载覆盖文件 |
| `src/gripper/gripper_ros2_msgs/{msg,srv}/…`、`CMakeLists.txt` | 新建/修改 | 三个新接口 |
| `config/ros/.gitignore` | 新建 | 忽略运行时覆盖文件 |
| `src/driver/realman_web_control/realman_web_control/protocol.py` | 修改 | 新命令校验、`reject_if_read_only` |
| `src/driver/realman_web_control/realman_web_control/web_control_node.py` | 修改 | 服务客户端、`limits` 订阅、命令转发 |
| `src/driver/realman_web_control/web/src/main.ts`、`style.css` | 修改 | "行程设置"折叠区 |
| `src/driver/realman_web_control/realman_web_control/static/**` | 重新生成 | Vite 打包产物（已提交到 git） |
| `website/tests/web-control/web-control.spec.ts` | 修改 | Playwright 用例 |
| `src/gripper/gripper_ros2/test/test_gripper_limits.py`、`test_gripper_limits_store.py`、`test_gripper_manager_node.py` | 新建 | 单测 |
| `website/docs/development/gripper-control.md`、`.agents/skills/developing-changingtek-grippers/SKILL.md` | 修改 | 文档 |

---

### Task 1: 建分支并提交已完成的配置修正与设计文档

**Files:**
- Modify: `website/docs/development/gripper-control.md:31-33`
- 已修改待提交：`config/ros/gripper.yaml`
- 待提交：`docs/superpowers/specs/2026-10-09-gripper-limits-web-design.md`、本计划文件

**Interfaces:**
- Produces: 分支 `feat/gripper-limits-web`，之后所有任务的提交都在它上面。

- [ ] **Step 1: 建分支（带着工作区修改切过去）**

Run: `git switch -c feat/gripper-limits-web`
Expected: `Switched to a new branch 'feat/gripper-limits-web'`

- [ ] **Step 2: 修正文档里过期的行程表**

在 `website/docs/development/gripper-control.md` 中把

```
| `gripper_right` | `/dev/realman/gripper_right` | `1` | `4000` / `12000` |
| `gripper_left` | `/dev/realman/gripper_left` | `1` | `400` / `949` |
```

替换为

```
| `gripper_right` | `/dev/realman/gripper_right` | `1` | `50` / `8500` |
| `gripper_left` | `/dev/realman/gripper_left` | `1` | `20` / `900` |
```

- [ ] **Step 3: 提交配置与文档修正**

```bash
git add config/ros/gripper.yaml website/docs/development/gripper-control.md
git commit -m "fix(gripper): set open/close positions to the measured mechanical limits"
```

- [ ] **Step 4: 提交设计文档和本计划**

```bash
git add docs/superpowers/specs/2026-10-09-gripper-limits-web-design.md docs/superpowers/plans/2026-10-09-gripper-limits-web.md
git commit -m "docs(gripper): design and plan for web-editable travel limits"
```

- [ ] **Step 5: 确认没有误带无关文件**

Run: `git status --short`
Expected: 仍显示 ` M .gitignore`、` M src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py` 和三个 `?? .agents/skills/realman-site-*`，没有其他项。

---

### Task 2: 纯逻辑模块 `gripper_limits.py`（校验与覆盖文件）

**Files:**
- Create: `src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py`
- Test: `src/gripper/gripper_ros2/test/test_gripper_limits.py`

**Interfaces:**
- Produces（后续任务依赖这些精确签名）：
  - `validate_limits(open_position, close_position, min_position, max_position) -> str | None`
  - `check_raw_position(position, min_position, max_position) -> str | None`
  - `position_ranges(config: dict) -> dict[str, tuple[int, int]]`
  - `overrides_path(config_file, override: str = "") -> Path`
  - `load_overrides(path, ranges) -> tuple[dict[str, dict[str, int]], list[str]]`
  - `save_overrides(path, overrides) -> None`（失败抛 `OSError`）
  - `apply_overrides(config: dict, overrides: dict) -> None`
  - 常量 `OVERRIDES_FILENAME = "gripper_overrides.yaml"`

- [ ] **Step 1: 写失败的测试**

创建 `src/gripper/gripper_ros2/test/test_gripper_limits.py`：

```python
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from gripper_ros2.gripper_limits import (
    apply_overrides,
    check_raw_position,
    load_overrides,
    overrides_path,
    position_ranges,
    save_overrides,
    validate_limits,
)


RANGES = {"gripper_right": (0, 8500), "gripper_left": (0, 900)}
RIGHT = {"gripper_right": {"open_position": 50, "close_position": 8500}}


class ValidateLimitsTest(unittest.TestCase):
    def test_accepts_values_inside_the_travel(self):
        self.assertIsNone(validate_limits(50, 8500, 0, 8500))

    def test_rejects_non_integers(self):
        for bad in (True, 50.0, "50", None):
            with self.subTest(bad=bad):
                self.assertIn("integers", validate_limits(bad, 8500, 0, 8500))
                self.assertIn("integers", validate_limits(50, bad, 0, 8500))

    def test_rejects_values_outside_min_max(self):
        self.assertIn("open_position -1", validate_limits(-1, 8500, 0, 8500))
        self.assertIn("close_position 8501", validate_limits(50, 8501, 0, 8500))

    def test_requires_open_below_close(self):
        self.assertIn("smaller", validate_limits(8500, 50, 0, 8500))
        self.assertIn("smaller", validate_limits(100, 100, 0, 8500))

    def test_requires_five_percent_span(self):
        self.assertIn("at least 425", validate_limits(0, 424, 0, 8500))
        self.assertIsNone(validate_limits(0, 425, 0, 8500))


class CheckRawPositionTest(unittest.TestCase):
    def test_accepts_inclusive_bounds(self):
        self.assertIsNone(check_raw_position(0, 0, 8500))
        self.assertIsNone(check_raw_position(8500, 0, 8500))

    def test_rejects_out_of_range_and_non_integers(self):
        self.assertIn("outside 0..8500", check_raw_position(8501, 0, 8500))
        self.assertIn("outside 0..8500", check_raw_position(-1, 0, 8500))
        for bad in (True, 1.5, "7", None):
            with self.subTest(bad=bad):
                self.assertIn("integer", check_raw_position(bad, 0, 8500))


class ConfigHelpersTest(unittest.TestCase):
    CONFIG = {
        "buses": [
            {"port": "/a", "grippers": [
                {"name": "gripper_right", "min_position": 0, "max_position": 8500,
                 "open_position": 4000, "close_position": 8500},
            ]},
            {"port": "/b", "grippers": [
                {"name": "gripper_left", "min_position": 0, "max_position": 900,
                 "open_position": 400, "close_position": 900},
            ]},
        ]
    }

    def test_position_ranges(self):
        self.assertEqual(position_ranges(self.CONFIG), RANGES)

    def test_apply_overrides_changes_only_listed_grippers(self):
        import copy
        config = copy.deepcopy(self.CONFIG)
        apply_overrides(config, RIGHT)
        right = config["buses"][0]["grippers"][0]
        left = config["buses"][1]["grippers"][0]
        self.assertEqual((right["open_position"], right["close_position"]), (50, 8500))
        self.assertEqual((left["open_position"], left["close_position"]), (400, 900))

    def test_overrides_path_defaults_next_to_the_config(self):
        self.assertEqual(
            overrides_path("/opt/rm65_ws/config/ros/gripper.yaml"),
            Path("/opt/rm65_ws/config/ros/gripper_overrides.yaml"),
        )
        self.assertEqual(overrides_path("/x/gripper.yaml", "/y/custom.yaml"), Path("/y/custom.yaml"))


class OverridesFileTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "gripper_overrides.yaml"

    def test_missing_file_is_not_an_error(self):
        self.assertEqual(load_overrides(self.path, RANGES), ({}, []))

    def test_empty_file_is_not_an_error(self):
        self.path.write_text("", encoding="utf-8")
        self.assertEqual(load_overrides(self.path, RANGES), ({}, []))

    def test_round_trip_and_permissions(self):
        save_overrides(self.path, RIGHT)
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, RIGHT)
        self.assertEqual(errors, [])
        self.assertEqual(self.path.stat().st_mode & 0o777, 0o644)

    def test_invalid_entries_are_ignored_with_errors(self):
        self.path.write_text(
            "grippers:\n"
            "  gripper_right: {open_position: 9000, close_position: 8500}\n"
            "  gripper_left: {open_position: 20, close_position: 900}\n"
            "  gripper_gone: {open_position: 1, close_position: 99}\n",
            encoding="utf-8",
        )
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(accepted, {"gripper_left": {"open_position": 20, "close_position": 900}})
        self.assertEqual(len(errors), 2)
        self.assertTrue(any("gripper_right" in error for error in errors))
        self.assertTrue(any("gripper_gone" in error for error in errors))

    def test_corrupt_or_misshapen_file_is_ignored(self):
        for text in ("grippers: [unclosed", "- a\n- b\n", "grippers: 3\n"):
            with self.subTest(text=text):
                self.path.write_text(text, encoding="utf-8")
                accepted, errors = load_overrides(self.path, RANGES)
                self.assertEqual(accepted, {})
                self.assertEqual(len(errors), 1)

    def test_failed_replace_keeps_original_and_leaves_no_temp_files(self):
        save_overrides(self.path, RIGHT)
        original = self.path.read_text(encoding="utf-8")
        with mock.patch("gripper_ros2.gripper_limits.os.replace", side_effect=OSError("boom")):
            with self.assertRaises(OSError):
                save_overrides(self.path, {"gripper_left": {"open_position": 20, "close_position": 900}})
        self.assertEqual(self.path.read_text(encoding="utf-8"), original)
        self.assertEqual([item.name for item in Path(self.tmp.name).iterdir()], ["gripper_overrides.yaml"])

    def test_unwritable_directory_raises_oserror(self):
        with self.assertRaises(OSError):
            save_overrides(Path(self.tmp.name) / "missing" / "o.yaml", RIGHT)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_limits.py -q`
Expected: 收集阶段报错 `ModuleNotFoundError: No module named 'gripper_ros2.gripper_limits'`。

- [ ] **Step 3: 写最小实现**

创建 `src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py`：

```python
"""Validation and persistence of the web-editable gripper travel endpoints.

Only ``open_position`` and ``close_position`` are editable at runtime. They are
stored in a small overrides file next to ``gripper.yaml`` so the hand-written
configuration (comments, ``min_position``/``max_position``) is never rewritten.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import yaml


OVERRIDES_FILENAME = "gripper_overrides.yaml"
LIMIT_FIELDS = ("open_position", "close_position")
# The open..close span must cover at least this fraction of min..max so the
# percentage mapping cannot collapse into a single point.
MIN_SPAN_FRACTION = 0.05


def _is_int(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def validate_limits(open_position, close_position, min_position, max_position) -> str | None:
    """Return the reason the endpoints are unacceptable, or ``None`` when valid."""
    if not _is_int(open_position) or not _is_int(close_position):
        return "open_position and close_position must be integers"
    if not min_position <= open_position <= max_position:
        return f"open_position {open_position} is outside {min_position}..{max_position}"
    if not min_position <= close_position <= max_position:
        return f"close_position {close_position} is outside {min_position}..{max_position}"
    if open_position >= close_position:
        return "open_position must be smaller than close_position"
    minimum_span = MIN_SPAN_FRACTION * (max_position - min_position)
    if close_position - open_position < minimum_span:
        return f"close_position - open_position must be at least {minimum_span:g}"
    return None


def check_raw_position(position, min_position, max_position) -> str | None:
    """Return the reason a raw jog target is unacceptable, or ``None``."""
    if not _is_int(position):
        return "position must be an integer"
    if not min_position <= position <= max_position:
        return f"position {position} is outside {min_position}..{max_position}"
    return None


def position_ranges(config: dict) -> dict[str, tuple[int, int]]:
    """Map every configured gripper name to its ``(min_position, max_position)``."""
    return {
        gripper["name"]: (gripper["min_position"], gripper["max_position"])
        for bus in config["buses"]
        for gripper in bus["grippers"]
    }


def overrides_path(config_file, override: str = "") -> Path:
    return Path(override) if override else Path(config_file).with_name(OVERRIDES_FILENAME)


def load_overrides(path, ranges) -> tuple[dict[str, dict[str, int]], list[str]]:
    """Read the overrides file; return ``(accepted entries, problems)``.

    A missing or empty file is normal. Anything unreadable or invalid is
    reported in ``problems`` and skipped so the node still starts from
    ``gripper.yaml``.
    """
    path = Path(path)
    if not path.exists():
        return {}, []
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        return {}, [f"{path}: cannot read overrides: {error}"]
    if not document:
        return {}, []
    grippers = document.get("grippers") if isinstance(document, dict) else None
    if not isinstance(grippers, dict):
        return {}, [f"{path}: expected a 'grippers' mapping"]
    accepted, problems = {}, []
    for name, entry in grippers.items():
        if name not in ranges:
            problems.append(f"{path}: unknown gripper {name!r}")
            continue
        if not isinstance(entry, dict):
            problems.append(f"{path}: {name} must be a mapping")
            continue
        minimum, maximum = ranges[name]
        problem = validate_limits(
            entry.get("open_position"), entry.get("close_position"), minimum, maximum,
        )
        if problem:
            problems.append(f"{path}: {name}: {problem}")
            continue
        accepted[name] = {field: entry[field] for field in LIMIT_FIELDS}
    return accepted, problems


def save_overrides(path, overrides) -> None:
    """Atomically write the overrides file (temp file, fsync, ``os.replace``)."""
    path = Path(path)
    document = {
        "grippers": {
            name: {field: int(entry[field]) for field in LIMIT_FIELDS}
            for name, entry in sorted(overrides.items())
        }
    }
    text = (
        "# Written by gripper_manager from the web UI.\n"
        "# Delete this file to fall back to gripper.yaml.\n"
        + yaml.safe_dump(document, sort_keys=False)
    )
    descriptor, temporary = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp",
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    except BaseException:
        try:
            os.unlink(temporary)
        except OSError:
            pass
        raise


def apply_overrides(config: dict, overrides: dict) -> None:
    """Overlay accepted overrides onto a loaded ``gripper.yaml`` document."""
    for bus in config["buses"]:
        for gripper in bus["grippers"]:
            entry = overrides.get(gripper["name"])
            if entry:
                gripper.update({field: entry[field] for field in LIMIT_FIELDS})
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_limits.py -q`
Expected: 全部 PASS，没有 failed / error。

- [ ] **Step 5: 提交**

```bash
git add src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py src/gripper/gripper_ros2/test/test_gripper_limits.py
git commit -m "feat(gripper): add travel-limit validation and overrides file helpers"
```

---

### Task 3: 驱动支持（忙检测、更新端点）与 `LimitsStore`

**Files:**
- Modify: `src/gripper/gripper_ros2/gripper_ros2/gripper_driver.py`（`GripperBus`）
- Modify: `src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py`（追加 `LimitsStore`）
- Test: `src/gripper/gripper_ros2/test/test_gripper_driver.py`（追加两个用例）
- Create: `src/gripper/gripper_ros2/test/test_gripper_limits_store.py`

**Interfaces:**
- Consumes（Task 2）：`validate_limits`、`save_overrides`。
- Produces：
  - `GripperBus.STREAMING_WINDOW_S: float = 2.0`
  - `GripperBus.is_streaming(slave_id: int, now: float | None = None) -> bool`
  - `GripperBus.apply_endpoints(slave_id: int, open_position: int, close_position: int) -> None`
  - `LimitsStore(manager, path, overrides=None)`，属性 `overrides: dict`；`current(name) -> dict`（键 `open_position/close_position/min_position/max_position`）；`set_limits(name, open_position, close_position, now=None) -> tuple[bool, str]`。

- [ ] **Step 1: 写驱动层失败测试**

在 `test/test_gripper_driver.py` 中，于 `    def test_missing_port_can_reconnect(self):` 之前插入：

```python
    def test_is_streaming_covers_pending_and_recent_sends(self):
        bus = self._stream_bus()
        self.assertFalse(bus.is_streaming(1, now=100.0))
        bus.request_move(1, 5000)
        self.assertTrue(bus.is_streaming(1, now=100.0))
        bus._process_pending(100.0)
        self.assertTrue(bus.is_streaming(1, now=101.9))
        self.assertFalse(bus.is_streaming(1, now=102.1))

    def test_apply_endpoints_updates_device_and_clears_stream_state(self):
        bus = self._stream_bus()
        bus.request_move(1, 5000)
        bus._process_pending(100.0)
        bus.request_move(1, 9000)
        bus.apply_endpoints(1, 50, 8500)
        device = bus.get(1)
        self.assertEqual((device.open_position, device.close_position), (50, 8500))
        self.assertEqual(bus._pending, {})
        self.assertNotIn(1, bus._last_sent)

```

- [ ] **Step 2: 写 `LimitsStore` 失败测试**

创建 `src/gripper/gripper_ros2/test/test_gripper_limits_store.py`：

```python
from pathlib import Path
import tempfile
import unittest

from gripper_ros2 import gripper_driver as gd
from gripper_ros2.gripper_limits import LimitsStore, load_overrides


RANGES = {"gripper_right": (0, 8500), "gripper_left": (0, 900)}


class LimitsStoreTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "gripper_overrides.yaml"
        self.manager = gd.GripperManager()
        self.manager.add_bus("/bus")
        self.manager.add_gripper(
            "/bus", 1, name="gripper_right", open_position=4000, close_position=8500,
            min_position=0, max_position=8500,
        )
        self.manager.add_gripper(
            "/bus", 2, name="gripper_left", open_position=400, close_position=900,
            min_position=0, max_position=900,
        )
        self.store = LimitsStore(self.manager, self.path)

    def endpoints(self, name):
        device = self.manager.get(name)
        return device.open_position, device.close_position

    def test_valid_change_is_saved_and_applied(self):
        ok, message = self.store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertTrue(ok, message)
        self.assertEqual(self.endpoints("gripper_right"), (50, 8400))
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(errors, [])
        self.assertEqual(accepted["gripper_right"], {"open_position": 50, "close_position": 8400})

    def test_overrides_of_other_grippers_are_preserved(self):
        self.assertTrue(self.store.set_limits("gripper_right", 50, 8400, now=100.0)[0])
        self.assertTrue(self.store.set_limits("gripper_left", 20, 880, now=100.0)[0])
        accepted, _ = load_overrides(self.path, RANGES)
        self.assertEqual(set(accepted), {"gripper_right", "gripper_left"})

    def test_invalid_change_touches_nothing(self):
        ok, message = self.store.set_limits("gripper_right", 8500, 50, now=100.0)
        self.assertFalse(ok)
        self.assertIn("smaller", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertFalse(self.path.exists())

    def test_busy_gripper_is_rejected(self):
        self.manager.get_bus("/bus").request_move(1, 5000)
        ok, message = self.store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertFalse(ok)
        self.assertIn("busy", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertFalse(self.path.exists())

    def test_save_failure_keeps_live_values(self):
        store = LimitsStore(self.manager, Path(self.tmp.name) / "missing" / "o.yaml")
        ok, message = store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertFalse(ok)
        self.assertIn("Cannot save", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertEqual(store.overrides, {})

    def test_current_reports_endpoints_and_travel(self):
        self.assertEqual(
            self.store.current("gripper_right"),
            {"open_position": 4000, "close_position": 8500, "min_position": 0, "max_position": 8500},
        )


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: 运行，确认失败**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_driver.py test/test_gripper_limits_store.py -q`
Expected: `AttributeError: 'GripperBus' object has no attribute 'is_streaming'`，以及 `ImportError: cannot import name 'LimitsStore'`。

- [ ] **Step 4: 实现驱动方法**

在 `gripper_driver.py` 中：

先把
```python
class GripperBus:
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 0.3,
```
改为
```python
class GripperBus:
    # A target sent through the continuous (request_move) path within this many
    # seconds marks the device as under live control.
    STREAMING_WINDOW_S = 2.0

    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 0.3,
```

再在 `    def set_active(self, slave_id):` 之前插入：

```python
    def is_streaming(self, slave_id: int, now: float | None = None) -> bool:
        """True while continuous control keeps targeting this device."""
        now = time.time() if now is None else now
        slave_id = int(slave_id)
        with self._cmd_lock:
            if slave_id in self._pending:
                return True
            last = self._last_sent.get(slave_id)
        return last is not None and now - last[0] < self.STREAMING_WINDOW_S

    def apply_endpoints(self, slave_id: int, open_position: int, close_position: int):
        """Switch a device to new open/close endpoints and forget stale targets."""
        device = self.get(slave_id)
        with self._cmd_lock:
            device.open_position = int(open_position)
            device.close_position = int(close_position)
            self._pending.pop(int(slave_id), None)
            self._last_sent.pop(int(slave_id), None)

```

- [ ] **Step 5: 实现 `LimitsStore`**

在 `gripper_limits.py` 末尾追加：

```python


class LimitsStore:
    """Validate, persist and apply endpoint changes for the live devices."""

    def __init__(self, manager, path, overrides=None):
        self.manager = manager
        self.path = Path(path)
        self.overrides = dict(overrides or {})

    def current(self, name: str) -> dict[str, int]:
        device = self.manager.get(name)
        return {
            "open_position": device.open_position,
            "close_position": device.close_position,
            "min_position": device.min_position,
            "max_position": device.max_position,
        }

    def set_limits(self, name: str, open_position, close_position,
                   now: float | None = None) -> tuple[bool, str]:
        """Return ``(success, message)``; file and device change only on success."""
        device = self.manager.get(name)
        problem = validate_limits(
            open_position, close_position, device.min_position, device.max_position,
        )
        if problem:
            return False, problem
        if device.bus.is_streaming(device.slave_id, now):
            return False, "Gripper busy: continuous control is active"
        updated = {
            **self.overrides,
            name: {"open_position": open_position, "close_position": close_position},
        }
        try:
            save_overrides(self.path, updated)
        except OSError as error:
            return False, f"Cannot save {self.path}: {error}"
        self.overrides = updated
        device.bus.apply_endpoints(device.slave_id, open_position, close_position)
        return True, f"open_position={open_position}, close_position={close_position}"
```

- [ ] **Step 6: 运行，确认通过**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test -q`
Expected: 全部 PASS（含原有的 driver / config / deployment 用例）。

- [ ] **Step 7: 提交**

```bash
git add src/gripper/gripper_ros2/gripper_ros2/gripper_driver.py src/gripper/gripper_ros2/gripper_ros2/gripper_limits.py src/gripper/gripper_ros2/test/test_gripper_driver.py src/gripper/gripper_ros2/test/test_gripper_limits_store.py
git commit -m "feat(gripper): add busy detection, endpoint updates and LimitsStore"
```

---

### Task 4: ROS 接口定义、后缀常量与覆盖文件忽略

**Files:**
- Create: `src/gripper/gripper_ros2_msgs/msg/GripperLimits.msg`
- Create: `src/gripper/gripper_ros2_msgs/srv/SetGripperLimits.srv`
- Create: `src/gripper/gripper_ros2_msgs/srv/MoveGripperRaw.srv`
- Modify: `src/gripper/gripper_ros2_msgs/CMakeLists.txt`
- Modify: `src/gripper/gripper_ros2/gripper_ros2/gripper_config.py:12-13`
- Create: `config/ros/.gitignore`
- Test: `src/gripper/gripper_ros2/test/test_gripper_config.py`、`test_gripper_deployment.py`

**Interfaces:**
- Produces：`gripper_ros2_msgs.msg.GripperLimits`（字段 `open_position/close_position/min_position/max_position`，均 `int32`）；`gripper_ros2_msgs.srv.SetGripperLimits`（请求 `open_position`、`close_position`；响应 `success`、`message`、`open_position`、`close_position`）；`gripper_ros2_msgs.srv.MoveGripperRaw`（请求 `position`；响应 `success`、`message`）；`interface_names(name)` 返回的字典新增键 `set_limits`、`move_raw`、`limits`。

- [ ] **Step 1: 写失败的测试**

在 `test/test_gripper_config.py` 中，于 `    def test_percentage_maps_closed_zero_and_open_one(self):` 之前插入：

```python
    def test_interfaces_include_limit_endpoints(self):
        names = interface_names("gripper_right")
        self.assertEqual(names["set_limits"], "/gripper_right/set_limits")
        self.assertEqual(names["move_raw"], "/gripper_right/move_raw")
        self.assertEqual(names["limits"], "/gripper_right/limits")

```

在 `test/test_gripper_deployment.py` 中，于 `    def test_root_config_uses_three_stable_gripper_aliases(self):` 之前插入：

```python
    def test_runtime_overrides_file_is_not_tracked(self):
        ignored = (ROOT / "config/ros/.gitignore").read_text(encoding="utf-8").splitlines()
        self.assertIn("gripper_overrides.yaml", ignored)

    def test_limit_interfaces_are_declared_in_the_msgs_package(self):
        msgs = ROOT / "src/gripper/gripper_ros2_msgs"
        cmake = (msgs / "CMakeLists.txt").read_text(encoding="utf-8")
        for path in ("msg/GripperLimits.msg", "srv/SetGripperLimits.srv", "srv/MoveGripperRaw.srv"):
            self.assertTrue((msgs / path).is_file(), path)
            self.assertIn(f'"{path}"', cmake)

```

- [ ] **Step 2: 运行，确认失败**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_config.py test/test_gripper_deployment.py -q`
Expected: 3 个新用例 FAIL（`KeyError: 'set_limits'`、`FileNotFoundError: .../config/ros/.gitignore`、`msg/GripperLimits.msg` 不存在）。

- [ ] **Step 3: 创建接口文件**

`src/gripper/gripper_ros2_msgs/msg/GripperLimits.msg`：

```
int32 open_position    # 当前生效的开位（设备位置单位）
int32 close_position   # 当前生效的闭位
int32 min_position     # 软件允许的最小目标（来自 gripper.yaml，网页无法修改）
int32 max_position     # 软件允许的最大目标
```

`src/gripper/gripper_ros2_msgs/srv/SetGripperLimits.srv`：

```
int32 open_position    # 要设置的开位
int32 close_position   # 要设置的闭位
---
bool success           # 是否已保存并生效
string message         # 结果描述或拒绝原因
int32 open_position    # 调用后生效的开位（失败时为当前值）
int32 close_position   # 调用后生效的闭位（失败时为当前值）
```

`src/gripper/gripper_ros2_msgs/srv/MoveGripperRaw.srv`：

```
int32 position         # 原始设备位置，必须在 min_position..max_position 内
---
bool success           # 是否到位（未超时）
string message         # 结果描述（含实际位置反馈）
```

- [ ] **Step 4: 注册到 CMake**

把 `src/gripper/gripper_ros2_msgs/CMakeLists.txt` 中的

```cmake
rosidl_generate_interfaces(${PROJECT_NAME}
  "srv/GripperPercentage.srv"
)
```

替换为

```cmake
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/GripperLimits.msg"
  "srv/GripperPercentage.srv"
  "srv/MoveGripperRaw.srv"
  "srv/SetGripperLimits.srv"
)
```

- [ ] **Step 5: 更新后缀常量**

把 `gripper_config.py` 的

```python
SERVICE_SUFFIXES = ("open", "close", "reset", "enable", "grasp_check", "percentage", "calibrate")
TOPIC_SUFFIXES = ("position", "speed", "current", "torque_reached", "alarm", "connected")
```

替换为

```python
SERVICE_SUFFIXES = (
    "open", "close", "reset", "enable", "grasp_check", "percentage", "calibrate",
    "set_limits", "move_raw",
)
TOPIC_SUFFIXES = ("position", "speed", "current", "torque_reached", "alarm", "connected", "limits")
```

- [ ] **Step 6: 忽略运行时覆盖文件**

创建 `config/ros/.gitignore`：

```
# Runtime state written by gripper_manager from the web UI (see gripper_limits.py).
gripper_overrides.yaml
```

- [ ] **Step 7: 运行，确认通过**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test -q`
Expected: 全部 PASS。

- [ ] **Step 8: 提交**

```bash
git add src/gripper/gripper_ros2_msgs src/gripper/gripper_ros2/gripper_ros2/gripper_config.py src/gripper/gripper_ros2/test/test_gripper_config.py src/gripper/gripper_ros2/test/test_gripper_deployment.py config/ros/.gitignore
git commit -m "feat(gripper): declare set_limits/move_raw/limits interfaces"
```

---

### Task 5: `gripper_manager` 节点接入

**Files:**
- Modify: `src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py`
- Test: `src/gripper/gripper_ros2/test/test_gripper_deployment.py`（源码断言，本地可跑）
- Create: `src/gripper/gripper_ros2/test/test_gripper_manager_node.py`（需要 ROS，本地自动跳过，在 Task 9 容器里真正运行）

**Interfaces:**
- Consumes（Task 2–4）：`LimitsStore`、`load_overrides`、`apply_overrides`、`position_ranges`、`overrides_path`、`check_raw_position`；`GripperLimits`、`SetGripperLimits`、`MoveGripperRaw`。
- Produces：`GripperManagerNode(node, config_file, overrides_file="")`；服务 `/<name>/set_limits`、`/<name>/move_raw`；话题 `/<name>/limits`；节点参数 `overrides_file`。

- [ ] **Step 1: 写源码断言测试（本地可跑）**

在 `test/test_gripper_deployment.py` 中，于 `    def test_root_config_uses_three_stable_gripper_aliases(self):` 之前插入：

```python
    def test_manager_exposes_limit_services_and_latched_limits_topic(self):
        source = MANAGER_NODE.read_text(encoding="utf-8")
        self.assertIn('f"{prefix}/set_limits"', source)
        self.assertIn('f"{prefix}/move_raw"', source)
        self.assertIn('f"{prefix}/limits"', source)
        self.assertIn("QoSDurabilityPolicy.TRANSIENT_LOCAL", source)
        start = source.index("    def _move_raw(")
        end = source.index("    def _publish_feedback(", start)
        body = source[start:end]
        # An out-of-range jog must be rejected before the gripper is auto-enabled.
        self.assertLess(body.index("check_raw_position("), body.index("self._ready("))

```

- [ ] **Step 2: 写 ROS 节点级测试**

创建 `src/gripper/gripper_ros2/test/test_gripper_manager_node.py`：

```python
from pathlib import Path
import tempfile
import unittest

try:
    from gripper_ros2 import gripper_driver as gd
    from gripper_ros2 import gripper_manager_node as gmn
    from gripper_ros2_msgs.srv import MoveGripperRaw, SetGripperLimits
    HAVE_ROS = True
except ImportError:  # no ROS 2 environment (e.g. a developer laptop)
    HAVE_ROS = False


CONFIG = """buses:
  - port: /dev/fake_right
    grippers:
      - {name: gripper_right, slave_id: 1, open_position: 4000, close_position: 8500, min_position: 0, max_position: 8500}
"""


class FakeInstrument:
    def __init__(self, address):
        self.address = address


class FakeSDK:
    def __init__(self, port, slave_id=1, baudrate=115200, timeout=0.3):
        self.port = port
        self.instrument = FakeInstrument(slave_id)
        self.calls = []

    def connect(self):
        return True

    def disconnect(self):
        pass

    def enable(self, value=True):
        self.calls.append(("enable", value))

    def temp_move(self, position_mm, speed_pct, force_pct, accel, decel, trigger=True):
        self.calls.append(("temp_move", position_mm))

    def set_temp_position_mm(self, position):
        self.calls.append(("set_pos", position))

    def trigger_temp_move(self):
        self.calls.append(("trigger",))

    def set_cmd_update_mode(self, mode):
        pass

    def wait_until_pos_or_torque(self, timeout=5.0, poll=0.02):
        return "position"

    def _r(self, address, count=1):
        if address == gd.REG_SPEED_FB:
            return [0, 0, 0, 4000][:count]
        if address == gd.REG_TORQUE_REACHED:
            return [0, 1, 0, 1][:count]
        return [0] * count


class StubLogger:
    def __init__(self):
        self.warnings, self.errors = [], []

    def info(self, message):
        pass

    def warning(self, message):
        self.warnings.append(message)

    def error(self, message):
        self.errors.append(message)


class StubPublisher:
    def __init__(self):
        self.messages = []

    def publish(self, message):
        self.messages.append(message)


class StubNode:
    def __init__(self):
        self.logger = StubLogger()
        self.services = {}
        self.publishers = {}

    def get_logger(self):
        return self.logger

    def create_service(self, _type, name, callback):
        self.services[name] = callback
        return object()

    def create_subscription(self, *args, **kwargs):
        return object()

    def create_publisher(self, _type, name, _qos):
        self.publishers[name] = StubPublisher()
        return self.publishers[name]

    def create_timer(self, *args, **kwargs):
        return object()


@unittest.skipUnless(HAVE_ROS, "needs a ROS 2 environment with gripper_ros2_msgs built")
class ManagerNodeTest(unittest.TestCase):
    def setUp(self):
        self.original = gd.Changingtek_rtu_psdk
        gd.Changingtek_rtu_psdk = FakeSDK
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.config = Path(self.tmp.name) / "gripper.yaml"
        self.config.write_text(CONFIG, encoding="utf-8")
        self.overrides = Path(self.tmp.name) / "gripper_overrides.yaml"
        self.node = StubNode()
        self.adapter = None
        self.addCleanup(self._cleanup)

    def _cleanup(self):
        if self.adapter is not None:
            self.adapter.destroy()
        gd.Changingtek_rtu_psdk = self.original

    def start(self):
        self.adapter = gmn.GripperManagerNode(self.node, str(self.config))
        return self.adapter

    def call(self, suffix, request, response):
        return self.node.services[f"/gripper_right/{suffix}"](request, response)

    def device(self):
        return self.adapter.manager.get("gripper_right")

    def sdk_calls(self):
        return self.adapter.manager.get_bus("/dev/fake_right")._sdk.calls

    def test_initial_limits_are_published(self):
        self.start()
        messages = self.node.publishers["/gripper_right/limits"].messages
        self.assertEqual(len(messages), 1)
        self.assertEqual(
            (messages[0].open_position, messages[0].close_position,
             messages[0].min_position, messages[0].max_position),
            (4000, 8500, 0, 8500),
        )

    def test_set_limits_updates_device_file_and_topic(self):
        self.start()
        response = self.call(
            "set_limits",
            SetGripperLimits.Request(open_position=50, close_position=8400),
            SetGripperLimits.Response(),
        )
        self.assertTrue(response.success, response.message)
        self.assertEqual((response.open_position, response.close_position), (50, 8400))
        self.assertEqual((self.device().open_position, self.device().close_position), (50, 8400))
        self.assertTrue(self.overrides.is_file())
        messages = self.node.publishers["/gripper_right/limits"].messages
        self.assertEqual((messages[-1].open_position, messages[-1].close_position), (50, 8400))

    def test_set_limits_rejects_invalid_values_without_side_effects(self):
        self.start()
        response = self.call(
            "set_limits",
            SetGripperLimits.Request(open_position=8500, close_position=50),
            SetGripperLimits.Response(),
        )
        self.assertFalse(response.success)
        self.assertEqual((response.open_position, response.close_position), (4000, 8500))
        self.assertFalse(self.overrides.exists())
        self.assertEqual(len(self.node.publishers["/gripper_right/limits"].messages), 1)

    def test_overrides_are_applied_at_startup(self):
        self.overrides.write_text(
            "grippers:\n  gripper_right: {open_position: 100, close_position: 8000}\n",
            encoding="utf-8",
        )
        self.start()
        self.assertEqual((self.device().open_position, self.device().close_position), (100, 8000))
        message = self.node.publishers["/gripper_right/limits"].messages[0]
        self.assertEqual((message.open_position, message.close_position), (100, 8000))

    def test_invalid_override_is_ignored_and_logged(self):
        self.overrides.write_text(
            "grippers:\n  gripper_right: {open_position: 9000, close_position: 8500}\n",
            encoding="utf-8",
        )
        self.start()
        self.assertEqual((self.device().open_position, self.device().close_position), (4000, 8500))
        self.assertTrue(self.node.logger.errors)

    def test_move_raw_rejects_out_of_range_before_touching_the_gripper(self):
        self.start()
        response = self.call("move_raw", MoveGripperRaw.Request(position=9000), MoveGripperRaw.Response())
        self.assertFalse(response.success)
        self.assertIn("outside 0..8500", response.message)
        self.assertEqual([call for call in self.sdk_calls() if call[0] in ("enable", "temp_move")], [])

    def test_move_raw_moves_to_the_requested_position(self):
        self.start()
        response = self.call("move_raw", MoveGripperRaw.Request(position=3000), MoveGripperRaw.Response())
        self.assertTrue(response.success, response.message)
        self.assertIn(("temp_move", 3000), self.sdk_calls())


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: 运行，确认失败**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_deployment.py test/test_gripper_manager_node.py -q`
Expected: `test_manager_exposes_limit_services_and_latched_limits_topic` FAIL（`ValueError: substring not found`）；`test_gripper_manager_node.py` 7 个用例 SKIPPED。

- [ ] **Step 4: 实现——导入**

在 `gripper_manager_node.py` 中把

```python
import std_msgs.msg
from std_srvs.srv import SetBool, Trigger
from gripper_ros2_msgs.srv import GripperPercentage

from .gripper_config import load_gripper_config, percentage_to_position
from .gripper_driver import GripperManager
```

替换为

```python
import std_msgs.msg
from rclpy.qos import QoSDurabilityPolicy, QoSProfile, QoSReliabilityPolicy
from std_srvs.srv import SetBool, Trigger
from gripper_ros2_msgs.msg import GripperLimits
from gripper_ros2_msgs.srv import GripperPercentage, MoveGripperRaw, SetGripperLimits

from .gripper_config import load_gripper_config, percentage_to_position
from .gripper_driver import GripperManager
from .gripper_limits import (
    LimitsStore,
    apply_overrides,
    check_raw_position,
    load_overrides,
    overrides_path,
    position_ranges,
)
```

- [ ] **Step 5: 实现——构造函数加载覆盖文件并发布初始行程**

把

```python
    def __init__(self, node, config_file: str):
        self.node = node
        self.config = load_gripper_config(config_file)
        self.manager = GripperManager.from_config(self.config)
        self._services = []
        self._subscriptions = []
        self._publishers = {}
        for name in self.manager.device_names:
            self._create_device_interfaces(name)
```

替换为

```python
    def __init__(self, node, config_file: str, overrides_file: str = ""):
        self.node = node
        self.config = load_gripper_config(config_file)
        path = overrides_path(config_file, overrides_file)
        overrides, problems = load_overrides(path, position_ranges(self.config))
        for problem in problems:
            node.get_logger().error(f"Ignoring gripper override: {problem}")
        apply_overrides(self.config, overrides)
        self.manager = GripperManager.from_config(self.config)
        self.limits = LimitsStore(self.manager, path, overrides)
        self._services = []
        self._subscriptions = []
        self._publishers = {}
        self._limits_publishers = {}
        for name in self.manager.device_names:
            self._create_device_interfaces(name)
        for name in self.manager.device_names:
            self._publish_limits(name)
```

- [ ] **Step 6: 实现——服务与 `limits` 发布者**

把

```python
            self.node.create_service(Trigger, f"{prefix}/calibrate", lambda req, res, n=name: self._calibrate(n, res)),
        ])
```

替换为

```python
            self.node.create_service(Trigger, f"{prefix}/calibrate", lambda req, res, n=name: self._calibrate(n, res)),
            self.node.create_service(SetGripperLimits, f"{prefix}/set_limits", lambda req, res, n=name: self._set_limits(n, req, res)),
            self.node.create_service(MoveGripperRaw, f"{prefix}/move_raw", lambda req, res, n=name: self._move_raw(n, req, res)),
        ])
```

再把

```python
                "connected": std_msgs.msg.Bool,
            }.items()
        }
```

替换为

```python
                "connected": std_msgs.msg.Bool,
            }.items()
        }
        self._limits_publishers[name] = self.node.create_publisher(
            GripperLimits,
            f"{prefix}/limits",
            QoSProfile(
                depth=1,
                reliability=QoSReliabilityPolicy.RELIABLE,
                durability=QoSDurabilityPolicy.TRANSIENT_LOCAL,
            ),
        )
```

- [ ] **Step 7: 实现——三个新方法**

在 `    def _publish_feedback(self):` 之前插入（必须放在 `_calibrate` 之后，否则现有测试对 `_percentage_command` 到 `_calibrate` 区间的断言会受影响）：

```python
    def _publish_limits(self, name):
        self._limits_publishers[name].publish(GripperLimits(**self.limits.current(name)))

    def _set_limits(self, name, request, response):
        success, message = self.limits.set_limits(
            name, int(request.open_position), int(request.close_position),
        )
        if success:
            self._publish_limits(name)
        current = self.limits.current(name)
        response.open_position = current["open_position"]
        response.close_position = current["close_position"]
        return self._response(response, success, message)

    def _move_raw(self, name, request, response):
        device = self.manager.get(name)
        problem = check_raw_position(request.position, device.min_position, device.max_position)
        if problem:
            return self._response(response, False, problem)
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        position = int(request.position)
        try:
            device.move_to(position)
            result = device.bus.transaction(
                device.slave_id,
                lambda sdk: sdk.wait_until_pos_or_torque(20.0),
            )
            feedback = device.read_feedback()
            return self._response(
                response,
                result != "timeout",
                f"raw -> pos={position} ({result}, pos_fb={feedback['position']})",
            )
        except Exception as error:
            return self._response(response, False, f"Move error: {error}")

```

- [ ] **Step 8: 实现——`overrides_file` 参数**

在 `main()` 中把

```python
    node.declare_parameter("config_file", "")
    config_file = node.get_parameter("config_file").value
```

替换为

```python
    node.declare_parameter("config_file", "")
    node.declare_parameter("overrides_file", "")
    config_file = node.get_parameter("config_file").value
```

再把

```python
    adapter = GripperManagerNode(node, str(Path(config_file)))
```

替换为

```python
    adapter = GripperManagerNode(
        node, str(Path(config_file)), node.get_parameter("overrides_file").value,
    )
```

- [ ] **Step 9: 运行本地测试，确认通过**

Run: `cd src/gripper/gripper_ros2 && ~/.venvs/realman-web/bin/python -m pytest test -q`
Expected: 全部 PASS，`test_gripper_manager_node.py` 的 7 个用例显示 skipped。

- [ ] **Step 10: 提交**

```bash
git add src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py src/gripper/gripper_ros2/test/test_gripper_deployment.py src/gripper/gripper_ros2/test/test_gripper_manager_node.py
git commit -m "feat(gripper): add set_limits and move_raw services and a latched limits topic"
```

---

### Task 6: Web 协议与节点

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py`
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Test: `src/driver/realman_web_control/test/test_gripper_protocol.py`

**Interfaces:**
- Consumes（Task 4）：`GripperLimits`、`SetGripperLimits`、`MoveGripperRaw`。
- Produces：
  - `parse_message` 接受 `gripper_command` 的 `set_limits`（`open_position`、`close_position`，整数 0..`MAX_GRIPPER_POSITION`）和 `move_raw`（`position`）。
  - `protocol.MAX_GRIPPER_POSITION = 1_000_000`（仅为协议层的合理性上限，真实范围由 manager 校验）。
  - `protocol.reject_if_read_only(command: str, read_only: bool, request_id: str = "") -> None`，写命令集合 `WRITE_LIMIT_COMMANDS = frozenset({"set_limits", "move_raw"})`，只读时抛 `ProtocolError("read_only", …, request_id)`。
  - Web 节点：每个夹爪的 `clients["set_limits"]`、`clients["move_raw"]`；订阅 `/<name>/limits` 后更新 `self._grippers[name]` 的四个字段并广播 `gripper_list`。

- [ ] **Step 1: 写失败的测试**

在 `test/test_gripper_protocol.py` 中，把 `from realman_web_control.protocol import ProtocolError, parse_message` 改为

```python
from realman_web_control.protocol import ProtocolError, parse_message, reject_if_read_only
```

并在 `if __name__ == "__main__":` 之前追加：

```python
    def test_set_limits_command(self):
        self.assertEqual(
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"set_limits","open_position":50,"close_position":8500}'
            ),
            {
                "type": "gripper_command",
                "request_id": "x",
                "name": "gripper_right",
                "command": "set_limits",
                "open_position": 50,
                "close_position": 8500,
            },
        )

    def test_set_limits_rejects_bad_fields_and_keeps_the_request_id(self):
        bodies = (
            '"open_position":50.5,"close_position":8500',
            '"open_position":true,"close_position":8500',
            '"open_position":50',
            '"open_position":-1,"close_position":8500',
            '"open_position":50,"close_position":2000000',
        )
        for body in bodies:
            with self.subTest(body=body):
                with self.assertRaises(ProtocolError) as context:
                    parse_message(
                        '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                        '"command":"set_limits",' + body + "}"
                    )
                self.assertEqual(context.exception.request_id, "x")

    def test_move_raw_command(self):
        self.assertEqual(
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"move_raw","position":3000}'
            )["position"],
            3000,
        )
        with self.assertRaises(ProtocolError) as context:
            parse_message(
                '{"type":"gripper_command","request_id":"x","name":"gripper_right",'
                '"command":"move_raw","position":"3000"}'
            )
        self.assertEqual(context.exception.request_id, "x")

    def test_read_only_rejects_only_the_limit_write_commands(self):
        for command in ("set_limits", "move_raw"):
            with self.subTest(command=command):
                with self.assertRaises(ProtocolError) as context:
                    reject_if_read_only(command, True, "req-1")
                self.assertEqual(context.exception.code, "read_only")
                self.assertEqual(context.exception.request_id, "req-1")
                reject_if_read_only(command, False, "req-1")
        reject_if_read_only("percentage", True, "req-1")

```

- [ ] **Step 2: 运行，确认失败**

Run: `cd src/driver/realman_web_control && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_protocol.py -q`
Expected: 收集阶段 `ImportError: cannot import name 'reject_if_read_only'`。

- [ ] **Step 3: 实现协议层**

在 `protocol.py` 中，把

```python
MAX_REQUEST_ID_LENGTH = 96
```

替换为

```python
MAX_REQUEST_ID_LENGTH = 96
# Sanity cap only; gripper_manager enforces the real per-gripper travel.
MAX_GRIPPER_POSITION = 1_000_000
WRITE_LIMIT_COMMANDS = frozenset({"set_limits", "move_raw"})
```

在 `def parse_message(raw: str | bytes, *, max_bytes: int = 65536) -> dict[str, Any]:` 之前插入：

```python
def _gripper_position(message: dict[str, Any], field: str, request_id: str) -> int:
    try:
        return _integer(message.get(field), field, 0, MAX_GRIPPER_POSITION)
    except ProtocolError as error:
        raise ProtocolError(error.code, error.message, request_id) from error


def reject_if_read_only(command: str, read_only: bool, request_id: str = "") -> None:
    """Refuse gripper travel writes at the server boundary in read-only mode."""
    if read_only and command in WRITE_LIMIT_COMMANDS:
        raise ProtocolError("read_only", "the server is read-only", request_id)


```

把 `gripper_command` 分支中的

```python
        if command not in {"open", "close", "reset", "enable", "disable", "percentage", "grasp_check"}:
```

替换为

```python
        if command not in {
            "open", "close", "reset", "enable", "disable", "percentage", "grasp_check",
            "set_limits", "move_raw",
        }:
```

并把

```python
                raise ProtocolError("invalid_field", "percentage must be from 0.0 through 1.0", request_id)
        return normalized
```

替换为

```python
                raise ProtocolError("invalid_field", "percentage must be from 0.0 through 1.0", request_id)
        if command == "set_limits":
            normalized["open_position"] = _gripper_position(message, "open_position", request_id)
            normalized["close_position"] = _gripper_position(message, "close_position", request_id)
        if command == "move_raw":
            normalized["position"] = _gripper_position(message, "position", request_id)
        return normalized
```

- [ ] **Step 4: 运行协议测试，确认通过**

Run: `cd src/driver/realman_web_control && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_protocol.py -q`
Expected: 全部 PASS。

- [ ] **Step 5: 实现 Web 节点——导入**

在 `web_control_node.py` 中把

```python
from gripper_ros2_msgs.srv import GripperPercentage
```

替换为

```python
from gripper_ros2_msgs.msg import GripperLimits
from gripper_ros2_msgs.srv import GripperPercentage, MoveGripperRaw, SetGripperLimits
```

把

```python
from .protocol import ProtocolError
```

替换为

```python
from .protocol import ProtocolError, reject_if_read_only
```

- [ ] **Step 6: 实现 Web 节点——客户端与订阅**

把

```python
                        "percentage": self.create_client(GripperPercentage, f"/{name}/percentage", callback_group=self._callback_group),
                    }
```

替换为

```python
                        "percentage": self.create_client(GripperPercentage, f"/{name}/percentage", callback_group=self._callback_group),
                        "set_limits": self.create_client(SetGripperLimits, f"/{name}/set_limits", callback_group=self._callback_group),
                        "move_raw": self.create_client(MoveGripperRaw, f"/{name}/move_raw", callback_group=self._callback_group),
                    }
```

把

```python
                        self.create_subscription(Int32, f"/{name}/alarm", lambda msg, n=name: self._gripper_state(n, "alarm", int(msg.data)), 10, callback_group=self._callback_group),
                    ])
```

替换为

```python
                        self.create_subscription(Int32, f"/{name}/alarm", lambda msg, n=name: self._gripper_state(n, "alarm", int(msg.data)), 10, callback_group=self._callback_group),
                        self.create_subscription(
                            GripperLimits,
                            f"/{name}/limits",
                            lambda msg, n=name: self._gripper_limits(n, msg),
                            QoSProfile(
                                depth=1,
                                reliability=ReliabilityPolicy.RELIABLE,
                                durability=DurabilityPolicy.TRANSIENT_LOCAL,
                            ),
                            callback_group=self._callback_group,
                        ),
                    ])
```

- [ ] **Step 7: 实现 Web 节点——限位广播与命令转发**

把

```python
    def _gripper_command(self, client_id: str, message: dict[str, Any]) -> None:
        name, command, request_id = message["name"], message["command"], message["request_id"]
```

替换为

```python
    def _gripper_limits(self, name: str, message: GripperLimits) -> None:
        item = self._grippers.get(name)
        if item is None:
            return
        item.update(
            open_position=int(message.open_position),
            close_position=int(message.close_position),
            min_position=int(message.min_position),
            max_position=int(message.max_position),
        )
        self._server.send_event({"type": "gripper_list", "grippers": list(self._grippers.values())})

    def _gripper_command(self, client_id: str, message: dict[str, Any]) -> None:
        name, command, request_id = message["name"], message["command"], message["request_id"]
        reject_if_read_only(command, self._server.read_only, request_id)
```

再把

```python
        elif command == "percentage":
            client = clients["percentage"]
            request = GripperPercentage.Request()
            request.percentage = float(message["percentage"])
```

替换为

```python
        elif command == "percentage":
            client = clients["percentage"]
            request = GripperPercentage.Request()
            request.percentage = float(message["percentage"])
        elif command == "set_limits":
            client = clients["set_limits"]
            request = SetGripperLimits.Request()
            request.open_position = int(message["open_position"])
            request.close_position = int(message["close_position"])
        elif command == "move_raw":
            client = clients["move_raw"]
            request = MoveGripperRaw.Request()
            request.position = int(message["position"])
```

- [ ] **Step 8: 本地语法检查并运行 Web 包的纯 Python 测试**

Run: `python3 -m py_compile src/driver/realman_web_control/realman_web_control/web_control_node.py && cd src/driver/realman_web_control && ~/.venvs/realman-web/bin/python -m pytest test/test_gripper_protocol.py test/test_protocol.py -q`
Expected: 编译无输出；测试全部 PASS（`web_control_node.py` 依赖 ROS，只做语法检查，行为在 Task 9 容器里验证）。

- [ ] **Step 9: 提交**

```bash
git add src/driver/realman_web_control/realman_web_control/protocol.py src/driver/realman_web_control/realman_web_control/web_control_node.py src/driver/realman_web_control/test/test_gripper_protocol.py
git commit -m "feat(web-control): forward gripper set_limits/move_raw and track limits"
```

---

### Task 7: 前端"行程设置"折叠区

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Test: `website/tests/web-control/web-control.spec.ts`
- Regenerate: `src/driver/realman_web_control/realman_web_control/static/**`

**Interfaces:**
- Consumes（Task 6）：WebSocket `gripper_command` 的 `set_limits`（`open_position`、`close_position`）、`move_raw`（`position`）；`gripper_list` 条目带 `open_position/close_position/min_position/max_position`；`gripper_result` 带 `command/state/success/message`。
- Produces：DOM id `gripper-limits`（`<details>`）、`gripper-open-position`、`gripper-close-position`、`gripper-teach-open`、`gripper-teach-close`、`gripper-raw-position`、`gripper-raw-value`、`gripper-limits-apply`、`gripper-limits-range`。

- [ ] **Step 1: 写失败的 Playwright 用例**

在 `website/tests/web-control/web-control.spec.ts` 末尾追加：

```ts

test("gripper travel limits are edited, confirmed and applied from the web panel", async ({ page }) => {
  await page.goto("/");
  const sentCommands = () => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((item) => item.type === "gripper_command"));
  const list = (open: number, close: number) => ({
    type: "gripper_list",
    grippers: [{ name: "gripper_right", open_position: open, close_position: close, min_position: 0, max_position: 12000 }],
  });
  const state = (position: number, speed = 0) => ({
    type: "gripper_state", name: "gripper_right", connected: true, position, speed, current: 0, torque_reached: false, alarm: 0,
  });

  await emitWebSocketEvent(page, list(4000, 12000));
  await emitWebSocketEvent(page, state(4000));
  await page.locator("#gripper-limits > summary").click();
  await expect(page.locator("#gripper-open-position")).toHaveValue("4000");
  await expect(page.locator("#gripper-close-position")).toHaveValue("12000");
  await expect(page.locator("#gripper-limits-range")).toContainText("0..12000");

  // "Set to current position" only copies the live reading into the input.
  await emitWebSocketEvent(page, state(52));
  await page.locator("#gripper-teach-open").click();
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  expect(await sentCommands()).toHaveLength(0);

  // It is disabled while the gripper is moving.
  await emitWebSocketEvent(page, state(60, 5));
  await expect(page.locator("#gripper-teach-open")).toBeDisabled();
  await emitWebSocketEvent(page, state(52, 0));
  await expect(page.locator("#gripper-teach-open")).toBeEnabled();

  // Unapplied edits survive a gripper_list broadcast.
  await page.locator("#gripper-close-position").fill("8500");
  await emitWebSocketEvent(page, list(77, 11000));
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  await expect(page.locator("#gripper-close-position")).toHaveValue("8500");

  // Apply asks for confirmation that shows old -> new values, then sends one command.
  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.locator("#gripper-limits-apply").click();
  expect(dialogMessage).toContain("开位 77 → 52");
  expect(dialogMessage).toContain("闭位 11000 → 8500");
  const commands = await sentCommands();
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    command: "set_limits", name: "gripper_right", open_position: 52, close_position: 8500,
  });

  // The completed result clears the edit state; the broadcast limits drive the readout.
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "set_limits",
    request_id: commands[0].request_id, state: "completed", success: true, message: "ok",
  });
  await emitWebSocketEvent(page, list(52, 8500));
  await emitWebSocketEvent(page, state(4000));
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  await expect(page.locator("#gripper-close-position")).toHaveValue("8500");
  await expect(page.locator("#gripper-feedback")).toContainText("开合 53%");

  // The raw-position slider sends one move_raw on release.
  await page.locator("#gripper-raw-position").evaluate((element: HTMLInputElement) => {
    element.value = "1234";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#gripper-raw-value")).toHaveText("1234");
  const jog = (await sentCommands()).filter((item) => item.command === "move_raw");
  expect(jog).toHaveLength(1);
  expect(jog[0]).toMatchObject({ name: "gripper_right", position: 1234 });
});

test("gripper travel limits are disabled without write access", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, { type: "hello", read_only: true });
  await emitWebSocketEvent(page, {
    type: "gripper_list",
    grippers: [{ name: "gripper_right", open_position: 50, close_position: 8500, min_position: 0, max_position: 8500 }],
  });
  await page.locator("#gripper-limits > summary").click();
  await expect(page.locator("#gripper-limits-apply")).toBeDisabled();
  await expect(page.locator("#gripper-open-position")).toBeDisabled();
  await expect(page.locator("#gripper-raw-position")).toBeDisabled();
});
```

- [ ] **Step 2: 运行，确认失败**

Run（从仓库根目录；本机 Chrome 路径用环境变量指定）:

```bash
cd website && PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx playwright test --config ../config/web-control/playwright.config.mjs -g "gripper travel limits" --project=desktop
```

Expected: 两个用例 FAIL，原因为 `#gripper-limits > summary` 不存在（超时）。

- [ ] **Step 3: 加 HTML**

在 `main.ts` 的模板字符串中，把

```html
<div id="gripper-feedback" class="feedback">等待夹爪状态</div></section>
```

替换为

```html
<div id="gripper-feedback" class="feedback">等待夹爪状态</div><details id="gripper-limits" class="gripper-limits"><summary>行程设置</summary><div class="gripper-limits-body"><div class="form-grid"><label>开位<input id="gripper-open-position" type="number" step="1" /></label><label>闭位<input id="gripper-close-position" type="number" step="1" /></label></div><div class="inline-actions"><button id="gripper-teach-open" class="button ghost" type="button">开位=当前位置</button><button id="gripper-teach-close" class="button ghost" type="button">闭位=当前位置</button></div><label class="gripper-raw">原始位置 <output id="gripper-raw-value">0</output><input id="gripper-raw-position" type="range" min="0" max="1" step="1" value="0" /></label><button id="gripper-limits-apply" class="button primary full" type="button">应用行程</button><div id="gripper-limits-range" class="feedback"></div></div></details></section>
```

- [ ] **Step 4: 加样式**

在 `style.css` 末尾追加：

```css
.gripper-limits { margin-top: 9px; }
.gripper-limits summary { cursor: pointer; color: #8fa6a9; font-size: 11px; }
.gripper-limits[open] summary { margin-bottom: 9px; }
.gripper-limits-body { display: grid; gap: 9px; }
.gripper-raw { display: grid; gap: 5px; color: #8fa6a9; font-size: 10px; }
.gripper-raw input { width: 100%; }
```

- [ ] **Step 5: 加状态变量和函数**

在 `main.ts` 中，把

```ts
let selectedGripper = "";
```

替换为

```ts
let selectedGripper = "";
// Unapplied edits in the travel-limit inputs must survive gripper_list broadcasts.
let gripperLimitsDirty = false;
```

在 `function updateGripperList(list: any[]) {` 之前插入：

```ts
function gripperLimitsElements() {
  return {
    open: $("#gripper-open-position") as HTMLInputElement,
    close: $("#gripper-close-position") as HTMLInputElement,
    raw: $("#gripper-raw-position") as HTMLInputElement,
    rawValue: $("#gripper-raw-value"),
    apply: $("#gripper-limits-apply") as HTMLButtonElement,
    teachOpen: $("#gripper-teach-open") as HTMLButtonElement,
    teachClose: $("#gripper-teach-close") as HTMLButtonElement,
  };
}
// Travel-limit editor. The inputs follow the configuration only while they are clean and unfocused.
function renderGripperLimits() {
  const config = gripperConfigs[selectedGripper];
  const state = gripperStates[selectedGripper];
  const elements = gripperLimitsElements();
  const writable = canWrite() && Boolean(config);
  const teachable = writable && state?.connected === true && Number(state.speed) === 0;
  if (config) {
    const minimum = Number(config.min_position ?? 0);
    const maximum = Number(config.max_position ?? 0);
    elements.raw.min = String(minimum);
    elements.raw.max = String(maximum);
    $("#gripper-limits-range").textContent = `允许范围 ${minimum}..${maximum}（min/max 只能在 gripper.yaml 中修改）`;
    const editing = document.activeElement === elements.open || document.activeElement === elements.close;
    if (!gripperLimitsDirty && !editing) {
      elements.open.value = String(config.open_position);
      elements.close.value = String(config.close_position);
    }
  }
  if (state && document.activeElement !== elements.raw) {
    elements.raw.value = String(Math.round(Number(state.position) || 0));
    elements.rawValue.textContent = elements.raw.value;
  }
  for (const input of [elements.open, elements.close, elements.raw, elements.apply]) input.disabled = !writable;
  elements.teachOpen.disabled = !teachable;
  elements.teachClose.disabled = !teachable;
}
function teachGripperLimit(field: "open" | "close") {
  const position = Number(gripperStates[selectedGripper]?.position);
  if (!Number.isFinite(position)) return;
  gripperLimitsElements()[field].value = String(Math.round(position));
  gripperLimitsDirty = true;
}
function applyGripperLimits() {
  const config = gripperConfigs[selectedGripper];
  if (!config) return;
  const { open, close } = gripperLimitsElements();
  const openPosition = Number(open.value);
  const closePosition = Number(close.value);
  if (open.value === "" || close.value === "" || !Number.isInteger(openPosition) || !Number.isInteger(closePosition)) {
    $("#gripper-feedback").textContent = "开位和闭位必须是整数";
    return;
  }
  const confirmed = window.confirm(
    `确认修改 ${selectedGripper} 的行程？\n开位 ${config.open_position} → ${openPosition}\n闭位 ${config.close_position} → ${closePosition}`,
  );
  if (!confirmed) return;
  sendGripper("set_limits", { open_position: openPosition, close_position: closePosition });
}
```

- [ ] **Step 6: 接入渲染与消息处理**

把 `renderGripperState` 中的

```ts
  $("#gripper-state").textContent = state.connected ? "ONLINE" : "OFFLINE";
```

替换为

```ts
  $("#gripper-state").textContent = state.connected ? "ONLINE" : "OFFLINE";
  renderGripperLimits();
```

把 `updateGripperList` 末尾的

```ts
  select.value = selectedGripper;
  renderGripperState();
}
```

替换为

```ts
  select.value = selectedGripper;
  renderGripperState();
  renderGripperLimits();
}
```

把 `handleMessage` 中的

```ts
    if (message.message) $("#gripper-feedback").textContent = String(message.message);
```

替换为

```ts
    if (message.message) $("#gripper-feedback").textContent = String(message.message);
    if (message.command === "set_limits" && message.state === "completed" && message.success === true) {
      gripperLimitsDirty = false;
      renderGripperLimits();
    }
```

- [ ] **Step 7: 接入事件监听**

把

```ts
($("#gripper-select") as HTMLSelectElement).addEventListener("change", (event) => { selectedGripper = (event.target as HTMLSelectElement).value; renderGripperState(); });
```

替换为

```ts
($("#gripper-select") as HTMLSelectElement).addEventListener("change", (event) => {
  selectedGripper = (event.target as HTMLSelectElement).value;
  gripperLimitsDirty = false;
  renderGripperState();
  renderGripperLimits();
});
```

在 `$("#gripper-percentage").addEventListener(...)` 那一行之后追加：

```ts
($("#gripper-open-position") as HTMLInputElement).addEventListener("input", () => { gripperLimitsDirty = true; });
($("#gripper-close-position") as HTMLInputElement).addEventListener("input", () => { gripperLimitsDirty = true; });
$("#gripper-teach-open").addEventListener("click", () => teachGripperLimit("open"));
$("#gripper-teach-close").addEventListener("click", () => teachGripperLimit("close"));
$("#gripper-limits-apply").addEventListener("click", applyGripperLimits);
const gripperRaw = $("#gripper-raw-position") as HTMLInputElement;
gripperRaw.addEventListener("input", () => { $("#gripper-raw-value").textContent = gripperRaw.value; });
gripperRaw.addEventListener("change", () => sendGripper("move_raw", { position: Number(gripperRaw.value) }));
```

- [ ] **Step 8: 运行 Playwright，确认通过**

Run: 同 Step 2 的命令，把 `--project=desktop` 保留；再追加运行 `--project=mobile`。
Expected: 两个项目下两个新用例都 PASS。

再运行该规格里已有的夹爪相关用例，确认没有回归：

```bash
cd website && PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx playwright test --config ../config/web-control/playwright.config.mjs -g "gripper" --project=desktop
```

Expected: 全部 PASS。

- [ ] **Step 9: 重新生成已提交的静态文件**

Run: `cd website && npm run build:web-control`
Expected: Vite 构建成功；`git status --short src/driver/realman_web_control/realman_web_control/static` 显示 `assets/` 下旧哈希文件被删除、新哈希文件新增，`index.html` / `calibration.html` 被修改。

- [ ] **Step 10: 提交**

```bash
git add src/driver/realman_web_control/web/src/main.ts src/driver/realman_web_control/web/src/style.css website/tests/web-control/web-control.spec.ts
git add -A src/driver/realman_web_control/realman_web_control/static
git commit -m "feat(web-control): add gripper travel-limit editor to the control panel"
```

---

### Task 8: 文档

**Files:**
- Modify: `website/docs/development/gripper-control.md`
- Modify: `.agents/skills/developing-changingtek-grippers/SKILL.md`

**Interfaces:**
- Consumes: 前面各任务确定的接口名与行为。

- [ ] **Step 1: ROS 接口表增加三行**

在 `gripper-control.md` 中，于

```
| `/<name>/percentage/command` | `std_msgs/msg/Float32` | 非阻塞持续目标；`0.0` 闭合，`1.0` 张开 |
```

之后插入：

```
| `/<name>/set_limits` | `gripper_ros2_msgs/srv/SetGripperLimits` | 校验、保存并立即应用开位和闭位 |
| `/<name>/move_raw` | `gripper_ros2_msgs/srv/MoveGripperRaw` | 把夹爪点动到 `min..max` 内的原始位置，越界直接拒绝 |
| `/<name>/limits` | `gripper_ros2_msgs/msg/GripperLimits` | 当前生效的开位、闭位和 `min/max`；可靠、`transient_local`、深度 1 |
```

- [ ] **Step 2: 增加"网页设置行程"一节**

在 `gripper-control.md` 中，于 `## 键盘双夹爪全开／全闭` 之前插入：

```markdown
## 在网页上设置开位和闭位

夹爪面板的"行程设置"折叠区可以查看并修改所选夹爪的 `open_position` 和 `close_position`：

- 直接输入数值，或点"开位=当前位置"／"闭位=当前位置"把实时读数填入输入框（仅在夹爪在线且速度为 0 时可用，只填入，不保存）。
- 用"原始位置"滑块点动夹爪到 `min_position..max_position` 内的任意位置；松手时才发送一次 `move_raw`。
- 点"应用行程"，确认弹窗会显示"旧值 → 新值"；确认后发送 `set_limits`。

`gripper_manager` 按以下规则校验，不满足时返回 `success=false` 和原因，状态不变：

1. 两个值都是整数，且都在该夹爪的 `[min_position, max_position]` 内；
2. `open_position < close_position`；
3. `close_position − open_position` 不小于 `max_position − min_position` 的 5%；
4. 该夹爪有待发目标，或最近 2 秒内收到过连续控制（Pika、键盘）的目标时拒绝，返回"忙"。

通过后依次：原子写入覆盖文件、更新内存中的端点（同时清掉该夹爪待发目标）、发布 `/<name>/limits`。Web 节点订阅该话题并向所有浏览器广播 `gripper_list`，所以网页的开合百分比和 3D 夹爪不需要重启就会跟上。

覆盖文件是 `gripper.yaml` 同目录下的 `gripper_overrides.yaml`（可用节点参数 `overrides_file` 指定其他路径），只包含开位和闭位：

```yaml
grippers:
  gripper_right:
    open_position: 50
    close_position: 8500
```

它是这台机器的运行时状态，被 `config/ros/.gitignore` 忽略，不进 git；容器以 root 写入，主机上手工修改需要 `sudo`。`gripper_manager` 启动时在 `gripper.yaml` 之上叠加该文件；文件损坏、夹爪名不存在或数值不满足上述规则时，对应条目被忽略并打 ERROR 日志，节点照常用 `gripper.yaml` 启动。要恢复默认，删除该文件并重启 `gripper_manager`。`min_position` / `max_position` 只能在 `gripper.yaml` 中修改，网页无法越过。

```

- [ ] **Step 3: WebSocket 命令列表**

把

```
`command` 支持 `open`、`close`、`reset`、`enable`、`disable`、`grasp_check` 和 `percentage`；Web 协议目前不暴露 `calibrate`。
```

替换为

```
`command` 支持 `open`、`close`、`reset`、`enable`、`disable`、`grasp_check`、`percentage`、`set_limits`（字段 `open_position`、`close_position`，整数）和 `move_raw`（字段 `position`，整数）；Web 协议目前不暴露 `calibrate`。服务器处于 `read_only` 时，`set_limits` 和 `move_raw` 在服务端被拒绝（错误码 `read_only`）。
```

- [ ] **Step 4: 更新夹爪开发技能的约定**

在 `.agents/skills/developing-changingtek-grippers/SKILL.md` 的 `## Required Boundaries` 列表末尾追加：

```
- Only `open_position` and `close_position` are editable at runtime (`set_limits` service, web "行程设置" panel). They persist in `gripper_overrides.yaml` next to `gripper.yaml`, written atomically by `gripper_manager` only; `min_position`/`max_position` stay in `gripper.yaml`. Validation lives in `gripper_limits.py`; do not duplicate it in the Web layer.
```

- [ ] **Step 5: 提交**

```bash
git add website/docs/development/gripper-control.md .agents/skills/developing-changingtek-grippers/SKILL.md
git commit -m "docs(gripper): document web-editable travel limits"
```

---

### Task 9: 在 ROS 容器里整体验证

本机没有 ROS，需要 ROS 的测试（`test_gripper_manager_node.py`、Web 节点导入、接口生成）在 `realman_ts` 上用一次性容器验证。容器用 `--network none`，不会接触运行中的机器人，也不会影响正在运行的容器。

**Files:** 无代码改动。

- [ ] **Step 1: 把相关源码同步到机器人主机的临时目录**

从仓库根目录运行：

```bash
ssh realman_ts 'mkdir -p ~/scratch/gripper-limits'
rsync -aR --delete --exclude node_modules --exclude __pycache__ \
  src/gripper src/driver/realman_web_control config \
  realman_ts:scratch/gripper-limits/
```

Expected: 无报错。

- [ ] **Step 2: 在一次性容器里编译三个包并跑测试**

```bash
ssh realman_ts 'docker run --rm --network none --entrypoint bash -v "$HOME/scratch/gripper-limits":/ws -w /ws rm65-humble-rviz:local -c "
set -e
source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash
colcon build --base-paths src/gripper src/driver/realman_web_control --packages-select gripper_ros2_msgs gripper_ros2 realman_web_control --build-base /tmp/build --install-base /tmp/install
source /tmp/install/setup.bash
cd /ws/src/gripper/gripper_ros2 && python3 -m pytest test -q
cd /ws/src/driver/realman_web_control && python3 -m pytest test -q
"'
```

Expected:
- `colcon build` 三个包 `Finished`，没有 rosidl 报错。
- `gripper_ros2` 测试全部 PASS，`test_gripper_manager_node.py` 的 7 个用例这次**执行并通过**（不再 skipped）。
- `realman_web_control` 测试全部 PASS。若出现与本计划改动文件无关的失败，用 `git worktree add /tmp/main-baseline main` 检出 `main`，按相同步骤同步并运行，确认是既有失败后再继续；本计划引入的失败必须修复。

- [ ] **Step 3: 验证 Web 节点能导入并构造新接口**

```bash
ssh realman_ts 'docker run --rm --network none --entrypoint bash -v "$HOME/scratch/gripper-limits":/ws -w /ws rm65-humble-rviz:local -c "
set -e
source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash
colcon build --base-paths src/gripper src/driver/realman_web_control --packages-select gripper_ros2_msgs gripper_ros2 realman_web_control --build-base /tmp/build --install-base /tmp/install >/dev/null
source /tmp/install/setup.bash
python3 -c \"from realman_web_control import web_control_node; from gripper_ros2_msgs.msg import GripperLimits; from gripper_ros2_msgs.srv import SetGripperLimits, MoveGripperRaw; print(GripperLimits(open_position=1, close_position=2, min_position=0, max_position=3)); print(SetGripperLimits.Request(open_position=1, close_position=2)); print(MoveGripperRaw.Request(position=5))\"
"'
```

Expected: 打印三条消息/请求对象，无 `ImportError`。

- [ ] **Step 4: 清理临时目录**

```bash
ssh realman_ts 'rm -rf ~/scratch/gripper-limits'
```

---

### Task 10: 上线与机器人验收（需要用户决定并在场）

这一步改变机器人上运行的软件并让夹爪动作，**每一步都要得到用户明确同意并有人在场**，不要自动执行。

**Files:** 无代码改动。

- [ ] **Step 1: 合并并选择上线方式（停下来问用户）**

向用户确认：分支怎么合并（PR 到 `main`），以及选择哪种上线方式：

- **方案 A（推荐）：重建镜像。** 在 `realman_ts` 上把 `~/realman_pi` 更新到合并后的 `main`（注意该工作副本里有未提交的 `config/ros/gripper.yaml` 调优，先与用户确认如何处理），然后：

  ```bash
  cd ~/realman_pi && ./rm65 build && ./rm65 down && ./rm65 up
  ```

  这会重启整套服务（机械臂驱动、相机、Web 控制），需要选停机窗口。
- **方案 B：容器内热补丁。** 容器里的源码比仓库 HEAD 落后，Web 容器又无法在不停机的情况下原位编译 ROS 接口，因此这条路需要单独再做一份小计划，不在本计划内。

用户选定前，不要执行后续步骤。

- [ ] **Step 2: 只读验收**

上线后，在 `realman_ts` 上读取三个夹爪的 `limits`，与当前生效配置对比：

```bash
ssh realman_ts 'docker exec realman_pi-realman_bringup_remote-1 bash -c "source /opt/ros/humble/setup.bash; source /opt/rm65_ws/install/setup.bash; for g in gripper_right gripper_left gripper_mid; do echo == \$g; timeout 5 ros2 topic echo --once --qos-durability transient_local --qos-reliability reliable /\$g/limits; done"'
```

Expected: 右 `50/8500/0/8500`，左 `20/900/0/900`，中 `0/9000/0/9000`（若覆盖文件不存在）。

- [ ] **Step 3: 用当前值点一次"应用"（空操作）**

在网页上打开"行程设置"，不改任何数值，点"应用行程"并确认。
Expected: `gripper_result` 显示成功，`/<name>/limits` 数值不变，夹爪不动；主机上 `~/realman_pi/config/ros/gripper_overrides.yaml` 被创建。

- [ ] **Step 4: 小幅点动（用户确认夹爪周围无障碍物）**

用"原始位置"滑块把一个夹爪移动一小段（例如右夹爪从 `50` 附近移到 `1000`），松手后观察。
Expected: 夹爪移动到该位置，`gripper_result` 成功；超出 `min..max` 的值滑块本身取不到。

- [ ] **Step 5: 改动开位并验证百分比**

把右夹爪的开位从 `50` 改为 `300` 并应用，再点"打开"。
Expected: 夹爪停在 `300` 附近；网页"开合"读数为 100%；再把开位改回 `50` 并应用，点"打开"回到 `50` 附近。

- [ ] **Step 6: 验证"忙"保护和重启保留**

- Pika 或键盘连续控制进行时点"应用行程"，Expected: 提示 `Gripper busy`，数值不变。
- 重启 `gripper_manager` 后读取 `limits`，Expected: 仍为刚才应用的数值（覆盖文件生效）。

---

### Task 11: `policy_bridge` 跟随 `/<name>/limits`（最终评审补充，在 Task 10 上线前完成）

最终评审发现：`policy_bridge` 的 `StateComposer` 只在启动时从 `gripper.yaml` 读一次开位、闭位，网页修改后观测里的 `state[6]`（夹爪开合 0..1）会与 `gripper_manager` 实际使用的行程不一致。用户已决定让它订阅 `/<name>/limits`。

**Files:**
- Modify: `src/policy_bridge/policy_bridge/observation/state_composer.py`
- Modify: `src/policy_bridge/package.xml`
- Modify: `src/policy_bridge/test/test_state_composer.py`
- Modify: `config/ros/policy_bridge.yaml`（仅注释）
- Modify: `website/docs/development/policy-bridge.md`

**Interfaces:**
- Consumes: `gripper_ros2_msgs.msg.GripperLimits`（字段 `open_position`、`close_position`、`min_position`、`max_position`，`int32`）；话题 `/<name>/limits`，可靠、`transient_local`、深度 1。
- Produces: `StateComposer.update_limits(name: str, open_position: int, close_position: int) -> None`（`open_position == close_position` 时忽略）；`StateComposer._on_limits(name: str, msg) -> None`。

- [ ] **Step 1: 写失败的测试**

在 `src/policy_bridge/test/test_state_composer.py` 末尾追加：

```python
def test_update_limits_changes_the_percentage_mapping(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_joint("left", [0, 0, 0, 0, 0, 0])
    composer.update_gripper_position("left", 674.5)  # gripper.yaml: 400..949 -> 0.5
    assert abs(float(composer.compose("left")[6]) - 0.5) < 1e-6
    composer.update_limits("gripper_left", 20, 900)  # endpoints edited from the web UI
    composer.update_gripper_position("left", 460.0)  # (460 - 900) / (20 - 900) = 0.5
    assert abs(float(composer.compose("left")[6]) - 0.5) < 1e-6
    composer.update_gripper_position("left", 20.0)   # new open position -> 1.0
    assert abs(float(composer.compose("left")[6]) - 1.0) < 1e-6


def test_update_limits_works_without_a_gripper_yaml(tmp_path):
    composer = StateComposer(None, _state_cfg(str(tmp_path / "missing.yaml")))
    composer.update_joint("right", [0, 0, 0, 0, 0, 0])
    composer.update_limits("gripper_right", 50, 8500)
    composer.update_gripper_position("right", 50.0)
    assert abs(float(composer.compose("right")[6]) - 1.0) < 1e-6


def test_update_limits_ignores_a_degenerate_span(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_limits("gripper_left", 500, 500)
    composer.update_joint("left", [0, 0, 0, 0, 0, 0])
    composer.update_gripper_position("left", 949.0)  # still the yaml 400..949 mapping
    assert float(composer.compose("left")[6]) == 0.0


def test_on_limits_forwards_the_message_fields(tmp_path):
    from types import SimpleNamespace

    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer._on_limits(
        "gripper_left",
        SimpleNamespace(open_position=20, close_position=900, min_position=0, max_position=900),
    )
    assert composer._limits["gripper_left"] == (20, 900)


def test_composer_subscribes_to_latched_limits_topics(tmp_path):
    pytest.importorskip("rclpy")
    pytest.importorskip("gripper_ros2_msgs")
    from gripper_ros2_msgs.msg import GripperLimits
    from rclpy.qos import QoSDurabilityPolicy, QoSReliabilityPolicy

    class RecordingNode:
        def __init__(self):
            self.subscriptions = []

        def create_subscription(self, msg_type, topic, callback, qos):
            self.subscriptions.append((msg_type, topic, callback, qos))
            return object()

    node = RecordingNode()
    composer = StateComposer(node, _state_cfg(_write_gripper_yaml(tmp_path)))
    limits = {topic: (msg_type, callback, qos) for msg_type, topic, callback, qos in node.subscriptions
              if topic.endswith("/limits")}
    assert set(limits) == {"/gripper_left/limits", "/gripper_right/limits"}
    msg_type, callback, qos = limits["/gripper_left/limits"]
    assert msg_type is GripperLimits
    assert qos.durability == QoSDurabilityPolicy.TRANSIENT_LOCAL
    assert qos.reliability == QoSReliabilityPolicy.RELIABLE
    assert qos.depth == 1
    callback(GripperLimits(open_position=20, close_position=900, min_position=0, max_position=900))
    assert composer._limits["gripper_left"] == (20, 900)
```

并把文件顶部的 `import numpy as np` 之后加一行 `import pytest`（与现有导入保持字母顺序即可）。

- [ ] **Step 2: 运行，确认失败**

Run: `cd src/policy_bridge && ~/.venvs/realman-web/bin/python -m pytest test/test_state_composer.py -q`
Expected: 前四个新用例 FAIL（`AttributeError: ... 'update_limits'`），第五个本地 SKIPPED。若本地缺少 `numpy`，先 `~/.venvs/realman-web/bin/pip install numpy`。

- [ ] **Step 3: 实现**

在 `state_composer.py` 中，把

```python
            from sensor_msgs.msg import JointState
            from std_msgs.msg import Float64
```

替换为

```python
            from gripper_ros2_msgs.msg import GripperLimits
            from rclpy.qos import QoSDurabilityPolicy, QoSProfile, QoSReliabilityPolicy
            from sensor_msgs.msg import JointState
            from std_msgs.msg import Float64
```

把

```python
            for side, topic in state_cfg.gripper_position_topics.items():
                self._subscriptions.append(
                    node.create_subscription(
                        Float64, topic, lambda m, s=side: self._on_gripper(s, m), 10
                    )
                )
```

替换为

```python
            for side, topic in state_cfg.gripper_position_topics.items():
                self._subscriptions.append(
                    node.create_subscription(
                        Float64, topic, lambda m, s=side: self._on_gripper(s, m), 10
                    )
                )
            # gripper_manager latches the effective endpoints (gripper.yaml overlaid by the
            # web-editable overrides); follow them so state[6] matches what it commands.
            limits_qos = QoSProfile(
                depth=1,
                reliability=QoSReliabilityPolicy.RELIABLE,
                durability=QoSDurabilityPolicy.TRANSIENT_LOCAL,
            )
            for topic in state_cfg.gripper_position_topics.values():
                name = gripper_name_from_topic(topic)
                if name:
                    self._subscriptions.append(
                        node.create_subscription(
                            GripperLimits, f"/{name}/limits",
                            lambda m, n=name: self._on_limits(n, m), limits_qos,
                        )
                    )
```

在 `    def update_joint(self, side: str, positions) -> None:` 之前插入：

```python
    def _on_limits(self, name: str, msg) -> None:
        self.update_limits(name, msg.open_position, msg.close_position)

    def update_limits(self, name: str, open_position: int, close_position: int) -> None:
        """Adopt the live endpoints published on ``/<name>/limits``."""
        if open_position == close_position:
            return
        self._limits[name] = (int(open_position), int(close_position))

```

把模块文档字符串中的 "using the ``open_position``/``close_position`` from ``gripper.yaml``" 改为 "using the ``open_position``/``close_position`` from ``gripper.yaml``, kept current by the latched ``/<name>/limits`` topic"（保持其余文字不变）。

在 `package.xml` 的 `<exec_depend>geometry_msgs</exec_depend>` 之后加一行：

```xml
  <!-- GripperLimits (latched effective open/close endpoints). -->
  <exec_depend>gripper_ros2_msgs</exec_depend>
```

把 `config/ros/policy_bridge.yaml` 中

```
    # state[6] 夹爪开合 0~1。来源为 gripper_manager 发布的 Float64 设备单位，
    # 用 gripper_config 的 open/close_position 换算（0=close, 1=open）。
```

替换为

```
    # state[6] 夹爪开合 0~1。来源为 gripper_manager 发布的 Float64 设备单位，
    # 用 open/close_position 换算（0=close, 1=open）：启动时取 gripper_config，
    # 之后跟随 gripper_manager 发布的 /<name>/limits（网页"行程设置"修改后立即生效）。
```

在 `website/docs/development/policy-bridge.md` 的订阅表中，于夹爪位置一行之后插入：

```
| 夹爪行程 | `/gripper_left/limits`、`/gripper_right/limits` | `gripper_ros2_msgs/GripperLimits`（可靠、`transient_local`、深度 1）；`state[6]` 的开位、闭位随它更新 |
```

- [ ] **Step 4: 运行本地测试，确认通过**

Run: `cd src/policy_bridge && ~/.venvs/realman-web/bin/python -m pytest test/test_state_composer.py -q`
Expected: 前四个新用例与原有用例 PASS，订阅用例 SKIPPED。再运行 `python3 -m py_compile src/policy_bridge/policy_bridge/observation/state_composer.py`，无输出。

- [ ] **Step 5: 提交**

```bash
git add src/policy_bridge/policy_bridge/observation/state_composer.py src/policy_bridge/package.xml src/policy_bridge/test/test_state_composer.py config/ros/policy_bridge.yaml website/docs/development/policy-bridge.md
git commit -m "feat(policy-bridge): follow the latched /<name>/limits endpoints"
```

（容器内验证由控制者完成：编译 `gripper_ros2_msgs` 与 `policy_bridge`，运行 `src/policy_bridge/test`，订阅用例此时真正执行。）

---

## Self-Review（已对照设计文档逐条检查）

**Spec 覆盖：**
- 接口（三个 srv/msg、三个 ROS 名称、QoS）→ Task 4、5。
- `gripper_limits.py` 的 `validate_limits` / `load_overrides` / `save_overrides` → Task 2；`LimitsStore` 的保存顺序和忙检查 → Task 3；`set_limits` / `move_raw` / 启动加载 / 初始发布 → Task 5。
- 校验三条规则与"忙"规则 → Task 2、3 的测试与实现。
- 覆盖文件格式、默认路径、`overrides_file` 参数、`.gitignore` → Task 2、4、5。
- Web 协议命令、`read_only` 服务端拒绝、`limits` 订阅并广播 → Task 6。
- 前端折叠区、确认弹窗、脏标记、"设为当前位置"禁用条件、`change` 时才发 `move_raw`、无写权限禁用 → Task 7。
- 错误处理表中的各行 → 对应测试：校验失败（Task 2/3/5）、写失败（Task 2/3）、忙（Task 3）、`move_raw` 越界（Task 5）、覆盖文件损坏（Task 2/5）、`read_only`（Task 6）、双浏览器广播（Task 7 的脏标记用例）。
- 测试、上线与验收、文档 → Task 2–10、8。
- 已知风险（左夹爪单位）→ 已在设计文档里说明，网页只处理原始数值，无需额外任务。

**类型与命名一致性：** `validate_limits` / `check_raw_position` / `LimitsStore.set_limits` / `current` / `GripperBus.is_streaming` / `apply_endpoints` / `reject_if_read_only` / `GripperLimits` / `SetGripperLimits` / `MoveGripperRaw` / DOM id 在各任务中拼写一致；`GripperManagerNode` 构造函数第三个参数名 `overrides_file` 与节点参数名一致。
