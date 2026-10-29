# Policy Quality Annotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record every pi05 policy attempt as its own session in a separate LeRobot dataset, let the operator mark "deviation started / recovered / reason" live on :8765, edit those intervals in the recording replay page, and hand per-frame labels to training as a sidecar JSON.

**Architecture:** Two new topics feed the existing recorder node: `/recording/attempt` (`AttemptEvent`, published by realman_bt PolicyRun, the only one that may open/close a session) and `/recording/quality_mark` (`QualityMark`, published by realman_web_control, annotation only). All rules live in ROS-free modules (`quality_events.py`, `attempt_recording.py` in realman_recording, `quality_marks.py` in realman_web_control) so they are unit-tested on a laptop and in CI; the recorder, web_control node and PolicyRun only wire them to ROS. The finalized manifest's `quality` block (nanosecond intervals) is the authority; replay edits it with a revision check; frames are derived on read.

**Tech Stack:** Python 3.10 (rclpy Humble, aiohttp, PyYAML, pytest), C++17 (rclcpp, realman_bt assert-style tests), TypeScript + Vite (recording replay page, :8765), Playwright, VitePress docs.

Spec: `docs/superpowers/specs/2026-10-29-policy-quality-annotation-design.md`.

## Global Constraints

- Work in the worktree `/Users/miakho/Organizations/realman_pi/.claude/worktrees/policy-quality-annotation`, branch `feat/policy-quality-annotation` (based on main `a1acf902`). Never touch the main checkout (`/Users/miakho/Organizations/realman_pi`), which has unrelated uncommitted work.
- Do not change `ManageRecording.srv` or `RecordingStatus.msg`: the Pika machine calls `/recording/manage` and Humble does not check message types.
- Topics: `/recording/attempt` (`realman_recording_msgs/msg/AttemptEvent`, reliable, depth 10, volatile) and `/recording/quality_mark` (`realman_recording_msgs/msg/QualityMark`, reliable, depth 50, volatile). Only the attempt topic may start or stop a session.
- The recorder never interrupts a session it did not open for an attempt; such an attempt is just not recorded.
- Profile `policy_rollout` exports to `realman/pi05-policy-rollouts`; every other profile keeps `lerobot_repo_id`.
- Nanosecond times in JSON are decimal strings. Frame time `t_i = first_walltime_ns + i * round(1e9 / fps)` (the exporter's grid).
- The reason list is `config/recording/quality_reasons.yaml`, at most 9 entries, ids matching `^[a-z][a-z0-9_]{0,31}$`.
- `quality_events.py`, `attempt_recording.py` (realman_recording) and `quality_marks.py` (realman_web_control) import no ROS and no aiohttp. No new Python dependencies (CI installs `pytest pyyaml numpy aiohttp pyarrow`).
- Committed web bundles must match their sources: `src/recording/realman_recording/realman_recording/static` (`npm run build:recording`) and `src/driver/realman_web_control/realman_web_control/static` (`npm run build:web-control`).
- Docs are part of the feature: Chinese, under `website/docs/`. No private IPs, tokens or machine-specific secrets in docs or config.
- New C++ tests start with `#undef NDEBUG` (they are assert-style and the Humble build is Release); the existing `test_policy_run_node.cpp` already does.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Test setup (used by every task)

```bash
WT=/Users/miakho/Organizations/realman_pi/.claude/worktrees/policy-quality-annotation
PY=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/7fa0fc46-4316-4de3-b45a-75a31272bc7f/scratchpad/venv310/bin/python
# Recreate the venv if it is gone:
#   uv venv --python 3.10 "$(dirname "$(dirname "$PY")")"
#   uv pip install --python "$PY" pytest pyyaml numpy aiohttp pyarrow ruff
rec()  { (cd "$WT/src/recording/realman_recording" && PYTHONPATH=. "$PY" -m pytest -q "$@" -p no:cacheprovider); }
webc() { (cd "$WT/src/driver/realman_web_control" && PYTHONPATH=. "$PY" -m pytest -q "$@" -p no:cacheprovider); }
lint() { (cd "$WT" && "$(dirname "$PY")/ruff" check --config config/python/ruff.toml src tools scripts docker); }

# ROS 2 Humble runs on server5090 in the stock image rm65-humble-rviz:local (the Mac has no ROS).
# The scratch tree is repo-shaped because realman_bt's CMake reads third_party/ and config/.
# .build/.install persist across runs (rsync --delete leaves excluded paths alone).
ssh server5090 'mkdir -p scratch/quality/repo' < /dev/null
humble() {
  rsync -rlc --delete --exclude .git --exclude website/node_modules --exclude .build --exclude .install \
    "$WT/" server5090:scratch/quality/repo/ &&
  ssh server5090 "docker run --rm -e ROS_LOCALHOST_ONLY=1 -e ROS_DOMAIN_ID=231 \
    -v \$HOME/scratch/quality/repo:/w -w /w rm65-humble-rviz:local bash -lc '
      source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash &&
      colcon build --base-paths src/driver/realman_msgs src/recording src/behavior/realman_bt src/driver/realman_web_control \
        --packages-select realman_msgs realman_recording_msgs realman_recording realman_bt realman_web_control \
        --build-base /w/.build --install-base /w/.install \
        --cmake-args -DBUILD_TESTING=ON -DCMAKE_BUILD_TYPE=Release > /w/.build.log 2>&1 ||
        { tail -40 /w/.build.log; exit 1; }
      source /w/.install/setup.bash && $1'" < /dev/null
}

# Web bundles and Playwright (once per worktree):
(cd "$WT/website" && npm ci)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

`humble` takes one argument: the command to run inside the container after the overlay is sourced. Do not put single quotes in it. Never pipe `colcon build` into `head` (SIGPIPE leaves stale binaries); the function already redirects it to `/w/.build.log`.

---

### Task 1: Reason list, interval rules and live marks (`quality_events.py`, part 1)

**Files:**
- Create: `config/recording/quality_reasons.yaml`
- Create: `src/recording/realman_recording/realman_recording/quality_events.py`
- Create: `src/recording/realman_recording/test/test_quality_events.py`
- Modify: `.github/workflows/ci.yml` (no-ROS suite list)

**Interfaces:**
- Produces (used by Tasks 2, 3, 4, 6, 8):
  - `QualityError(ValueError)`, `QualityConflict(RuntimeError)`
  - `QualityReason(id: str, label: str)` (frozen dataclass)
  - `load_quality_reasons(path: str | Path) -> tuple[QualityReason, ...]`
  - `parse_ns(value: Any, field: str) -> int`
  - `empty_quality() -> dict`, `quality_block(manifest: dict) -> dict` with keys `revision`, `attempt`, `intervals`, `rejected_marks`
  - `validate_intervals(intervals: Any, *, start_ns: int, end_ns: int | None, reasons: Iterable[str]) -> list[dict]`
  - `MARK_KINDS = ("deviate_start", "recover", "reason")` (index = `QualityMark.kind`)
  - `LiveQualityTracker(*, session_start_ns: int, reasons: Iterable[str])` with `apply(kind, stamp_ns, reason, *, now_ns) -> bool`, `deviating: bool`, `open_interval() -> dict | None` (int bounds), `intervals() -> list[dict]` (string bounds), `rejected: int`

- [ ] **Step 1: Create the reason list**

`config/recording/quality_reasons.yaml`:

```yaml
# Deviation reasons for live marking (:8765) and replay editing. One file for the recorder,
# the recording web page and realman_web_control. Order sets the :8765 digit keys (first
# entry = key 1), so keep at most 9. The id is what manifests store: renaming an id orphans
# the reason on every interval already labelled with it; change labels freely.
reasons:
  - {id: grasp_miss, label: 抓偏}
  - {id: wrong_target, label: 目标错}
  - {id: collision_risk, label: 碰撞风险}
  - {id: stall, label: 卡住犹豫}
  - {id: drop, label: 掉落}
  - {id: other, label: 其他}
```

- [ ] **Step 2: Write the failing tests**

`src/recording/realman_recording/test/test_quality_events.py`:

```python
"""Pure rules for deviation reasons, intervals and live marks (no ROS)."""
from __future__ import annotations

from pathlib import Path

import pytest

from realman_recording.quality_events import (
    LiveQualityTracker,
    QualityError,
    load_quality_reasons,
    quality_block,
    validate_intervals,
)

ROOT = Path(__file__).parents[4]
REASONS = ("grasp_miss", "stall")
START = 1_790_000_000_000_000_000
SECOND = 1_000_000_000


def test_the_repository_reason_list_loads_in_key_order():
    reasons = load_quality_reasons(ROOT / "config/recording/quality_reasons.yaml")
    assert [reason.id for reason in reasons] == [
        "grasp_miss", "wrong_target", "collision_risk", "stall", "drop", "other",
    ]
    assert reasons[0].label == "抓偏"


def test_a_missing_reason_file_means_no_reasons(tmp_path):
    assert load_quality_reasons(tmp_path / "absent.yaml") == ()


@pytest.mark.parametrize("body", [
    "reasons: {id: a}\n",
    "reasons:\n  - {id: Bad, label: x}\n",
    "reasons:\n  - {id: a, label: x}\n  - {id: a, label: y}\n",
    "reasons:\n  - {id: a, label: ''}\n",
    "reasons:\n" + "".join(f"  - {{id: r{index}, label: x}}\n" for index in range(10)),
])
def test_a_broken_reason_file_is_refused(tmp_path, body):
    path = tmp_path / "reasons.yaml"
    path.write_text(body, encoding="utf-8")
    with pytest.raises(QualityError):
        load_quality_reasons(path)


def interval(start, end, reason=None, source="live"):
    return {"start_ns": start, "end_ns": end, "reason": reason, "source": source}


def test_valid_intervals_are_normalized_to_decimal_strings():
    result = validate_intervals(
        [interval(START + SECOND, START + 2 * SECOND, "stall"), interval(str(START + 3 * SECOND), None)],
        start_ns=START, end_ns=START + 10 * SECOND, reasons=REASONS,
    )
    assert result == [
        {"start_ns": str(START + SECOND), "end_ns": str(START + 2 * SECOND), "reason": "stall", "source": "live"},
        {"start_ns": str(START + 3 * SECOND), "end_ns": None, "reason": None, "source": "live"},
    ]


@pytest.mark.parametrize("intervals", [
    "not a list",
    [interval(START + 2 * SECOND, START + 3 * SECOND), interval(START + SECOND, START + 4 * SECOND)],  # overlap
    [interval(START + SECOND, None), interval(START + 3 * SECOND, START + 4 * SECOND)],  # open not last
    [interval(START + SECOND, START + SECOND)],  # empty
    [interval(START + SECOND, START + 2 * SECOND, "unknown")],
    [interval(START + SECOND, START + 2 * SECOND, None, "guess")],
    [{**interval(START + SECOND, START + 2 * SECOND), "start_frame": 1}],
    [interval(START - 5 * SECOND, START + SECOND)],  # before the recording
    [interval(START + SECOND, START + 20 * SECOND)],  # after the recording
    [interval(True, None)],
])
def test_invalid_intervals_are_refused(intervals):
    with pytest.raises(QualityError):
        validate_intervals(intervals, start_ns=START, end_ns=START + 10 * SECOND, reasons=REASONS)


def test_quality_block_defaults_for_sessions_without_one():
    assert quality_block({}) == {"revision": 0, "attempt": None, "intervals": [], "rejected_marks": 0}
    block = {"revision": 3, "attempt": {"attempt_id": "a"}, "intervals": [], "rejected_marks": 1}
    assert quality_block({"quality": block}) == block


def test_live_marks_build_one_interval_with_its_reason():
    tracker = LiveQualityTracker(session_start_ns=START, reasons=REASONS)
    now = START + 10 * SECOND
    assert tracker.apply("deviate_start", START + SECOND, "", now_ns=now)
    assert tracker.deviating
    assert tracker.open_interval() == {"start_ns": START + SECOND, "end_ns": None, "reason": None, "source": "live"}
    assert tracker.apply("reason", START + 2 * SECOND, "stall", now_ns=now)
    assert tracker.apply("recover", START + 3 * SECOND, "", now_ns=now)
    assert not tracker.deviating
    assert tracker.intervals() == [
        {"start_ns": str(START + SECOND), "end_ns": str(START + 3 * SECOND), "reason": "stall", "source": "live"},
    ]
    assert tracker.rejected == 0


def test_live_marks_that_break_the_rules_are_counted_and_ignored():
    tracker = LiveQualityTracker(session_start_ns=START, reasons=REASONS)
    now = START + 10 * SECOND
    assert not tracker.apply("recover", START + SECOND, "", now_ns=now)  # nothing to recover
    assert not tracker.apply("reason", START + SECOND, "stall", now_ns=now)  # nothing to label
    assert tracker.apply("deviate_start", START + 2 * SECOND, "grasp_miss", now_ns=now)
    assert not tracker.apply("deviate_start", START + 3 * SECOND, "", now_ns=now)  # already deviating
    assert not tracker.apply("reason", START + 3 * SECOND, "unknown", now_ns=now)
    assert not tracker.apply("recover", START + SECOND, "", now_ns=now)  # before the open start
    assert not tracker.apply("recover", now + SECOND, "", now_ns=now)  # stamped in the future
    assert not tracker.apply("jump", START + 4 * SECOND, "", now_ns=now)
    assert tracker.rejected == 7
    assert tracker.deviating
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `rec test/test_quality_events.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_recording.quality_events'`

- [ ] **Step 4: Write the module**

`src/recording/realman_recording/realman_recording/quality_events.py`:

```python
"""Deviation annotation model: reason list, interval rules, live marks and frame mapping.

Shared by the recorder (live marks during a session), the recording Web API (replay edits)
and the sidecar export used by training. Pure Python with no ROS or aiohttp import, so every
rule here is unit-testable on a laptop.

Intervals live in the session manifest's ``quality`` block with nanosecond SYSTEM_TIME bounds
stored as decimal strings (JavaScript numbers lose epoch-nanosecond precision). An ``end_ns``
of ``None`` means the deviation never recovered before the recording ended.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import yaml

REASON_ID_RE = re.compile(r"^[a-z][a-z0-9_]{0,31}$")
MAX_REASONS = 9  # one digit key per reason on :8765
MAX_INTERVALS = 200
SOURCES = frozenset({"live", "replay"})
# Index = realman_recording_msgs/QualityMark.kind.
MARK_KINDS = ("deviate_start", "recover", "reason")
# Slack for interval bounds against the session's start/end wall time.
BOUND_TOLERANCE_NS = 1_000_000_000
# A live mark stamped further than this after its receipt is a clock problem, not a mark.
FUTURE_TOLERANCE_NS = 500_000_000


class QualityError(ValueError):
    """An interval list, reason file or mark breaks the annotation rules."""


class QualityConflict(RuntimeError):
    """An editor submitted a stale quality revision."""


@dataclass(frozen=True)
class QualityReason:
    id: str
    label: str


def load_quality_reasons(path: str | Path) -> tuple[QualityReason, ...]:
    """Read ``config/recording/quality_reasons.yaml``; a missing file means no reasons."""
    source = Path(path)
    if not source.is_file():
        return ()
    payload = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    items = payload.get("reasons") if isinstance(payload, dict) else None
    if not isinstance(items, list) or len(items) > MAX_REASONS:
        raise QualityError(f"{source}: reasons must be a list of at most {MAX_REASONS} entries")
    reasons: list[QualityReason] = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise QualityError(f"{source}: reasons[{index}] must be a mapping")
        reason_id, label = item.get("id"), item.get("label")
        if not isinstance(reason_id, str) or not REASON_ID_RE.fullmatch(reason_id):
            raise QualityError(f"{source}: reasons[{index}].id must match {REASON_ID_RE.pattern}")
        if any(existing.id == reason_id for existing in reasons):
            raise QualityError(f"{source}: duplicate reason id {reason_id}")
        if not isinstance(label, str) or not label.strip() or len(label.strip()) > 32:
            raise QualityError(f"{source}: reasons[{index}].label must be 1-32 characters")
        reasons.append(QualityReason(reason_id, label.strip()))
    return tuple(reasons)


def parse_ns(value: Any, field: str) -> int:
    """Accept a non-negative int or decimal string; reject bools, floats and signs."""
    if isinstance(value, bool):
        raise QualityError(f"{field} must be nanoseconds")
    if isinstance(value, int):
        number = value
    elif isinstance(value, str) and value.isdigit():
        number = int(value)
    else:
        raise QualityError(f"{field} must be nanoseconds as an integer or decimal string")
    if number < 0:
        raise QualityError(f"{field} must be non-negative")
    return number


def empty_quality() -> dict[str, Any]:
    return {"revision": 0, "attempt": None, "intervals": [], "rejected_marks": 0}


def quality_block(manifest: dict[str, Any]) -> dict[str, Any]:
    """The manifest's ``quality`` block, with defaults for sessions recorded before it existed."""
    block = manifest.get("quality") if isinstance(manifest, dict) else None
    result = empty_quality()
    if isinstance(block, dict):
        if type(block.get("revision")) is int and block["revision"] >= 0:
            result["revision"] = block["revision"]
        if isinstance(block.get("attempt"), dict):
            result["attempt"] = block["attempt"]
        if isinstance(block.get("intervals"), list):
            result["intervals"] = block["intervals"]
        if type(block.get("rejected_marks")) is int:
            result["rejected_marks"] = block["rejected_marks"]
    return result


def validate_intervals(
    intervals: Any,
    *,
    start_ns: int,
    end_ns: int | None,
    reasons: Iterable[str],
) -> list[dict[str, Any]]:
    """Return a normalized copy of ``intervals`` or raise ``QualityError``.

    Rules: sorted by start, no overlap, start < end, only the last interval may stay open
    (``end_ns`` null), every bound inside the session (with ``BOUND_TOLERANCE_NS``), reason
    from the configured list or null, source ``live`` or ``replay``, no other keys.
    """
    if not isinstance(intervals, list) or len(intervals) > MAX_INTERVALS:
        raise QualityError(f"intervals must be a list of at most {MAX_INTERVALS} entries")
    allowed = set(reasons)
    lower = start_ns - BOUND_TOLERANCE_NS
    upper = None if end_ns is None else end_ns + BOUND_TOLERANCE_NS
    result: list[dict[str, Any]] = []
    previous_end: int | None = None
    for index, item in enumerate(intervals):
        if not isinstance(item, dict) or set(item) != {"start_ns", "end_ns", "reason", "source"}:
            raise QualityError(f"intervals[{index}] must have exactly start_ns, end_ns, reason, source")
        begin = parse_ns(item["start_ns"], f"intervals[{index}].start_ns")
        finish = None if item["end_ns"] is None else parse_ns(item["end_ns"], f"intervals[{index}].end_ns")
        reason = item["reason"]
        if reason is not None and reason not in allowed:
            raise QualityError(f"intervals[{index}].reason is not a configured reason")
        if item["source"] not in SOURCES:
            raise QualityError(f"intervals[{index}].source must be live or replay")
        if begin < lower or (upper is not None and begin > upper):
            raise QualityError(f"intervals[{index}] starts outside the recording")
        if finish is not None and (finish <= begin or (upper is not None and finish > upper)):
            raise QualityError(f"intervals[{index}] must end after it starts and inside the recording")
        if result and previous_end is None:
            raise QualityError("only the last interval may stay open")
        if previous_end is not None and begin < previous_end:
            raise QualityError(f"intervals[{index}] overlaps the previous interval")
        result.append({
            "start_ns": str(begin),
            "end_ns": None if finish is None else str(finish),
            "reason": reason,
            "source": item["source"],
        })
        previous_end = finish
    return result


class LiveQualityTracker:
    """Turn live QualityMark events into intervals while one session records.

    The recorder owns one tracker per session and calls ``apply`` for every mark it receives;
    a rejected mark only bumps ``rejected``. ``intervals()`` is what the recorder writes to
    ``manifest.partial.json`` after every mark.
    """

    def __init__(self, *, session_start_ns: int, reasons: Iterable[str]) -> None:
        self._session_start_ns = session_start_ns
        self._reasons = frozenset(reasons)
        self._intervals: list[dict[str, Any]] = []
        self.rejected = 0

    @property
    def deviating(self) -> bool:
        return bool(self._intervals) and self._intervals[-1]["end_ns"] is None

    def open_interval(self) -> dict[str, Any] | None:
        return dict(self._intervals[-1]) if self.deviating else None

    def apply(self, kind: str, stamp_ns: int, reason: str, *, now_ns: int) -> bool:
        """Apply one mark; return whether it was accepted."""
        accepted = self._apply(kind, stamp_ns, reason or None, now_ns)
        if not accepted:
            self.rejected += 1
        return accepted

    def _apply(self, kind: str, stamp_ns: int, reason: str | None, now_ns: int) -> bool:
        if kind not in MARK_KINDS:
            return False
        if reason is not None and reason not in self._reasons:
            return False
        if stamp_ns < self._session_start_ns - BOUND_TOLERANCE_NS or stamp_ns > now_ns + FUTURE_TOLERANCE_NS:
            return False
        if self._intervals:
            last = self._intervals[-1]
            boundary = last["start_ns"] if last["end_ns"] is None else last["end_ns"]
            if stamp_ns < boundary:
                return False
        if kind == "deviate_start":
            if self.deviating:
                return False
            self._intervals.append({"start_ns": stamp_ns, "end_ns": None, "reason": reason, "source": "live"})
            return True
        if not self.deviating:
            return False
        current = self._intervals[-1]
        if kind == "recover":
            if stamp_ns <= current["start_ns"]:
                return False
            current["end_ns"] = stamp_ns
            return True
        if reason is None:  # kind == "reason"
            return False
        current["reason"] = reason
        return True

    def intervals(self) -> list[dict[str, Any]]:
        """Manifest form: nanosecond bounds as decimal strings."""
        return [
            {
                "start_ns": str(item["start_ns"]),
                "end_ns": None if item["end_ns"] is None else str(item["end_ns"]),
                "reason": item["reason"],
                "source": item["source"],
            }
            for item in self._intervals
        ]
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `rec test/test_quality_events.py`
Expected: PASS (all tests)

- [ ] **Step 6: Add the test file to the CI no-ROS suite**

In `.github/workflows/ci.yml`, in the `for suite in \` list of the "Run the suites that import without rclpy" step, add this line right after `src/behavior/realman_bt:test/test_bt_launcher.py \`:

```yaml
            src/recording/realman_recording:test/test_quality_events.py \
```

- [ ] **Step 7: Lint and commit**

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add config/recording/quality_reasons.yaml src/recording/realman_recording/realman_recording/quality_events.py src/recording/realman_recording/test/test_quality_events.py .github/workflows/ci.yml
git commit -m "feat(recording): add deviation reason list, interval rules and live mark tracker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Frame grid, session document and sidecar (`quality_events.py`, part 2)

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/quality_events.py` (append)
- Modify: `src/recording/realman_recording/test/test_quality_events.py` (append)

**Interfaces:**
- Consumes: `parse_ns`, `quality_block`, `QualityReason`, `QualityError` (Task 1); `json_io.atomic_json_write(path, payload)`.
- Produces (used by Task 8):
  - `SIDECAR_SCHEMA = "realman.quality_events.v1"`
  - `frame_step_ns(fps) -> int`, `frame_time_ns(first_walltime_ns, fps, index) -> int`
  - `interval_frames(interval, *, first_walltime_ns, fps, frame_count) -> tuple[int | None, int | None]`
  - `frame_labels(intervals, *, first_walltime_ns, fps, frame_count) -> tuple[list[int], list[int]]` (deviating, frames_to_deviation)
  - `read_receipt(directory: Path) -> dict | None`, `receipt_frames(receipt) -> dict | None` (`fps`, `first_walltime_ns` int, `frame_count`)
  - `with_frames(intervals, frames) -> list[dict]` (adds `start_frame`, `end_frame`)
  - `session_document(directory: Path, reasons: Iterable[QualityReason]) -> dict` (GET payload)
  - `build_sidecar(recording_root: Path, repo_id: str, *, generated_at_ns: int) -> dict`
  - CLI `python3 -m realman_recording.quality_events dump --recording-root DIR --repo-id ID -o FILE`

- [ ] **Step 1: Write the failing tests**

In `src/recording/realman_recording/test/test_quality_events.py`, add `import json` above `from pathlib import Path`, and replace the `from realman_recording.quality_events import (...)` block with:

```python
from realman_recording.quality_events import (
    LiveQualityTracker,
    QualityError,
    QualityReason,
    build_sidecar,
    frame_labels,
    interval_frames,
    load_quality_reasons,
    main,
    quality_block,
    session_document,
    validate_intervals,
)
```

Then append:

```python
FIRST = 1_790_000_000_000_000_000
STEP = 100_000_000  # 10 fps


def test_interval_frames_follow_the_exporter_grid():
    grid = {"first_walltime_ns": FIRST, "fps": 10.0, "frame_count": 8}
    # [1.15 s, 1.35 s) covers frames at 1.2 s and 1.3 s.
    assert interval_frames(interval(FIRST + 150_000_000, FIRST + 350_000_000), **grid) == (2, 3)
    assert interval_frames(interval(FIRST + 6 * STEP, None), **grid) == (6, 7)
    assert interval_frames(interval(FIRST - 5 * STEP, FIRST + STEP), **grid) == (0, 0)
    assert interval_frames(interval(FIRST - 5 * STEP, FIRST - STEP), **grid) == (None, None)
    assert interval_frames(interval(FIRST + 20 * STEP, None), **grid) == (None, None)


def test_frame_labels_mark_deviation_and_count_down_to_the_next_one():
    intervals = [interval(FIRST + 150_000_000, FIRST + 350_000_000), interval(FIRST + 6 * STEP, None)]
    deviating, ahead = frame_labels(intervals, first_walltime_ns=FIRST, fps=10.0, frame_count=8)
    assert deviating == [0, 0, 1, 1, 0, 0, 1, 1]
    assert ahead == [2, 1, 0, 0, 2, 1, 0, 0]
    assert frame_labels([], first_walltime_ns=FIRST, fps=10.0, frame_count=3) == ([0, 0, 0], [-1, -1, -1])


def make_session(root, session_id, *, repo_id="realman/pi05-policy-rollouts", episode_index=3,
                 decision="ADOPTED", export_state="SUCCEEDED", receipt=True):
    directory = root / session_id
    (directory / "export").mkdir(parents=True)
    manifest = {
        "session_id": session_id, "state": "READY", "decision": decision,
        "started_realtime_ns": FIRST - 500_000_000, "ended_realtime_ns": FIRST + 3 * SECOND,
        "export": {"state": export_state},
        "quality": {
            "revision": 0,
            "attempt": {"attempt_id": "policy_attempt_20261029_031500_r", "outcome": "dropped", "succeeded": False},
            "intervals": [interval(str(FIRST + 150_000_000), str(FIRST + 450_000_000), "grasp_miss")],
            "rejected_marks": 0,
        },
    }
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    if receipt:
        (directory / "export" / "lerobot-v3.json").write_text(json.dumps({
            "repo_id": repo_id, "fps": 10, "episode_index": episode_index,
            "first_walltime_ns": FIRST, "frame_count": 20,
        }), encoding="utf-8")
    return directory


def test_session_document_adds_frames_and_reasons(tmp_path):
    directory = make_session(tmp_path, "s1")
    document = session_document(directory, (QualityReason("grasp_miss", "抓偏"),))
    assert document["session_id"] == "s1"
    assert document["revision"] == 0
    assert document["attempt"]["outcome"] == "dropped"
    assert document["frames"] == {"fps": 10.0, "first_walltime_ns": str(FIRST), "frame_count": 20}
    assert document["intervals"][0]["start_frame"] == 2
    assert document["intervals"][0]["end_frame"] == 4
    assert document["reasons"] == [{"id": "grasp_miss", "label": "抓偏"}]


def test_session_document_without_export_has_no_frames(tmp_path):
    directory = make_session(tmp_path, "s1", receipt=False)
    document = session_document(directory, ())
    assert document["frames"] is None
    assert document["intervals"][0]["start_frame"] is None


def test_sidecar_keeps_exported_episodes_of_one_dataset(tmp_path):
    make_session(tmp_path, "a", episode_index=3)
    make_session(tmp_path, "b", episode_index=1)
    make_session(tmp_path, "c", repo_id="realman/pi05-three-arm", episode_index=0)
    make_session(tmp_path, "d", episode_index=7, decision="DISCARDED")
    make_session(tmp_path, "e", episode_index=8, export_state="FAILED")
    make_session(tmp_path, "f", episode_index=3)  # duplicate index -> error, first one kept
    sidecar = build_sidecar(tmp_path, "realman/pi05-policy-rollouts", generated_at_ns=42)
    assert sidecar["schema"] == "realman.quality_events.v1"
    assert sidecar["generated_at_ns"] == "42"
    assert list(sidecar["episodes"]) == ["1", "3"]
    episode = sidecar["episodes"]["3"]
    assert episode["session_id"] == "a"
    assert episode["fps"] == 10.0 and episode["frame_count"] == 20
    assert episode["first_walltime_ns"] == str(FIRST)
    assert episode["intervals"][0]["start_frame"] == 2
    assert [error["session_id"] for error in sidecar["errors"]] == ["f"]


def test_the_dump_command_writes_the_sidecar(tmp_path, capsys):
    make_session(tmp_path / "recordings", "a")
    output = tmp_path / "episode_quality_events.json"
    assert main(["dump", "--recording-root", str(tmp_path / "recordings"),
                 "--repo-id", "realman/pi05-policy-rollouts", "-o", str(output)]) == 0
    assert list(json.loads(output.read_text(encoding="utf-8"))["episodes"]) == ["3"]
    assert "1 episodes" in capsys.readouterr().out
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `rec test/test_quality_events.py`
Expected: FAIL with `ImportError: cannot import name 'build_sidecar'`

- [ ] **Step 3: Append the implementation**

Add these imports at the top of `quality_events.py`, next to the existing ones (keep them sorted):

```python
import argparse
import json
import time
```

and, after `import yaml`:

```python
from .json_io import atomic_json_write
```

Then add after `MARK_KINDS = ...`:

```python
SIDECAR_SCHEMA = "realman.quality_events.v1"
```

Append at the end of the file:

```python
def frame_step_ns(fps: float) -> int:
    """The exporter's integer policy-grid step (lerobot_exporter rounds the same way)."""
    if not fps or fps <= 0:
        raise QualityError("fps must be positive")
    return round(1_000_000_000 / fps)


def frame_time_ns(first_walltime_ns: int, fps: float, index: int) -> int:
    return first_walltime_ns + index * frame_step_ns(fps)


def interval_frames(
    interval: dict[str, Any], *, first_walltime_ns: int, fps: float, frame_count: int,
) -> tuple[int | None, int | None]:
    """Inclusive frame range an interval covers, or ``(None, None)`` outside the episode."""
    step = frame_step_ns(fps)
    begin = parse_ns(interval["start_ns"], "start_ns")
    start_frame = max(0, -(-(begin - first_walltime_ns) // step))
    if interval["end_ns"] is None:
        end_frame = frame_count - 1
    else:
        finish = parse_ns(interval["end_ns"], "end_ns")
        end_frame = min(frame_count - 1, -(-(finish - first_walltime_ns) // step) - 1)
    if frame_count <= 0 or start_frame > end_frame:
        return None, None
    return start_frame, end_frame


def frame_labels(
    intervals: list[dict[str, Any]], *, first_walltime_ns: int, fps: float, frame_count: int,
) -> tuple[list[int], list[int]]:
    """Per-frame ``deviating`` (0/1) and ``frames_to_deviation`` (0 inside, -1 none ahead)."""
    deviating = [0] * frame_count
    for interval in intervals:
        start, end = interval_frames(
            interval, first_walltime_ns=first_walltime_ns, fps=fps, frame_count=frame_count,
        )
        if start is not None and end is not None:
            for index in range(start, end + 1):
                deviating[index] = 1
    frames_to_deviation = [-1] * frame_count
    upcoming = -1
    for index in range(frame_count - 1, -1, -1):
        if deviating[index]:
            frames_to_deviation[index] = 0
            upcoming = index
        elif upcoming >= 0:
            frames_to_deviation[index] = upcoming - index
    return deviating, frames_to_deviation


def read_receipt(directory: Path) -> dict[str, Any] | None:
    path = Path(directory) / "export" / "lerobot-v3.json"
    if not path.is_file():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload if isinstance(payload, dict) else None


def receipt_frames(receipt: dict[str, Any] | None) -> dict[str, Any] | None:
    """``{fps, first_walltime_ns, frame_count}`` from an export receipt, or None."""
    if not receipt:
        return None
    try:
        fps = float(receipt["fps"])
        first = int(receipt["first_walltime_ns"])
        count = int(receipt["frame_count"])
    except (KeyError, TypeError, ValueError):
        return None
    if fps <= 0 or first < 0 or count < 0:
        return None
    return {"fps": fps, "first_walltime_ns": first, "frame_count": count}


def with_frames(intervals: list[dict[str, Any]], frames: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Copy of ``intervals`` with ``start_frame``/``end_frame`` (None without an export)."""
    result = []
    for interval in intervals:
        start = end = None
        if frames is not None:
            start, end = interval_frames(
                interval, first_walltime_ns=frames["first_walltime_ns"], fps=frames["fps"],
                frame_count=frames["frame_count"],
            )
        result.append({**interval, "start_frame": start, "end_frame": end})
    return result


def session_document(directory: Path, reasons: Iterable[QualityReason]) -> dict[str, Any]:
    """GET payload for one finalized session: quality block, frame grid and reason list."""
    manifest = json.loads((Path(directory) / "manifest.json").read_text(encoding="utf-8"))
    if not isinstance(manifest, dict):
        raise QualityError("recording manifest must be a JSON object")
    block = quality_block(manifest)
    frames = receipt_frames(read_receipt(directory))
    return {
        "session_id": Path(directory).name,
        "revision": block["revision"],
        "attempt": block["attempt"],
        "intervals": with_frames(block["intervals"], frames),
        "frames": None if frames is None else {**frames, "first_walltime_ns": str(frames["first_walltime_ns"])},
        "reasons": [{"id": reason.id, "label": reason.label} for reason in reasons],
    }


def build_sidecar(recording_root: Path, repo_id: str, *, generated_at_ns: int) -> dict[str, Any]:
    """``episode_quality_events.json`` for one dataset, keyed by its episode_index.

    Only exported (SUCCEEDED), not discarded or hidden sessions whose receipt names ``repo_id``
    count. A broken session or a duplicate episode_index goes to ``errors`` instead of failing.
    """
    root = Path(recording_root)
    episodes: dict[str, Any] = {}
    errors: list[dict[str, str]] = []
    for directory in (sorted(root.iterdir()) if root.is_dir() else []):
        if not directory.is_dir() or directory.name.startswith(".") or not (directory / "manifest.json").is_file():
            continue
        try:
            manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
            if not isinstance(manifest, dict):
                raise QualityError("recording manifest must be a JSON object")
            export = manifest.get("export") or {}
            if export.get("state") != "SUCCEEDED" or manifest.get("decision") in {"DISCARDED", "DELETED"}:
                continue
            receipt = read_receipt(directory)
            if not receipt or receipt.get("repo_id") != repo_id:
                continue
            frames = receipt_frames(receipt)
            if frames is None:
                raise QualityError("export receipt has no frame grid")
            index = receipt.get("episode_index")
            if type(index) is not int or index < 0:
                raise QualityError("export receipt has no episode_index")
            key = str(index)
            if key in episodes:
                raise QualityError(f"episode_index {index} already used by {episodes[key]['session_id']}")
            block = quality_block(manifest)
            episodes[key] = {
                "session_id": directory.name,
                "fps": frames["fps"],
                "first_walltime_ns": str(frames["first_walltime_ns"]),
                "frame_count": frames["frame_count"],
                "attempt": block["attempt"],
                "intervals": with_frames(block["intervals"], frames),
            }
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
            errors.append({"session_id": directory.name, "error": str(error)})
    return {
        "schema": SIDECAR_SCHEMA,
        "repo_id": repo_id,
        "generated_at_ns": str(generated_at_ns),
        "episodes": dict(sorted(episodes.items(), key=lambda item: int(item[0]))),
        "errors": errors,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python3 -m realman_recording.quality_events")
    commands = parser.add_subparsers(dest="command", required=True)
    dump = commands.add_parser("dump", help="write episode_quality_events.json for one dataset")
    dump.add_argument("--recording-root", required=True)
    dump.add_argument("--repo-id", required=True)
    dump.add_argument("-o", "--output", required=True)
    args = parser.parse_args(argv)
    sidecar = build_sidecar(Path(args.recording_root), args.repo_id, generated_at_ns=time.time_ns())
    atomic_json_write(Path(args.output), sidecar)
    print(f"wrote {len(sidecar['episodes'])} episodes ({len(sidecar['errors'])} errors) to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `rec test/test_quality_events.py`
Expected: PASS

- [ ] **Step 5: Lint and commit**

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/quality_events.py src/recording/realman_recording/test/test_quality_events.py
git commit -m "feat(recording): map deviation intervals onto export frames and build the sidecar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Session manifest `quality` block (`SessionStore`)

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/session_store.py`
- Create: `src/recording/realman_recording/test/test_session_store_quality.py`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `quality_block`, `validate_intervals`, `QualityConflict` (Task 1); `episode_tags.validate_tags`.
- Produces (used by Tasks 6, 7, 8):
  - `SessionStore.update_quality(self, quality: dict) -> None` (active session; writes `manifest.partial.json`)
  - `SessionStore.record_attempt_outcome(self, attempt: dict, *, auto_tags: dict) -> None` (active session; sets `quality.attempt`, `episode_tags.auto`, `annotations.success/failure_reason`)
  - `SessionStore.update_quality_intervals(directory, intervals, revision, *, reasons) -> dict` (static, finalized session, returns the new quality block; raises `QualityConflict`, `QualityError`, `ValueError`)

- [ ] **Step 1: Write the failing tests**

`src/recording/realman_recording/test/test_session_store_quality.py`:

```python
"""The session manifest's quality block: live writes, attempt outcome, replay edits."""
from __future__ import annotations

import json

import pytest

from realman_recording.quality_events import QualityConflict, QualityError
from realman_recording.session_store import SessionState, SessionStore

START = 1_790_000_000_000_000_000
SECOND = 1_000_000_000


def interval(start, end, reason=None, source="live"):
    return {"start_ns": str(start), "end_ns": None if end is None else str(end), "reason": reason, "source": source}


def live_quality():
    return {"revision": 0, "attempt": None, "intervals": [interval(START + SECOND, START + 2 * SECOND, "stall")],
            "rejected_marks": 1}


def test_live_quality_is_written_to_the_partial_and_kept_on_finalize(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.transition(SessionState.RECORDING)
    store.update_quality(live_quality())
    partial = json.loads((session.directory / "manifest.partial.json").read_text(encoding="utf-8"))
    assert partial["quality"] == live_quality()
    final = json.loads(store.finalize(True, ended_realtime_ns=START + 5 * SECOND).read_text(encoding="utf-8"))
    assert final["quality"] == live_quality()


def test_attempt_outcome_sets_tags_and_business_success(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    attempt = {"attempt_id": "policy_attempt_x", "task": "pick_only", "outcome": "dropped", "succeeded": False}
    tags = {"success": False, "policy_task": "pick_only", "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}
    store.record_attempt_outcome(attempt, auto_tags=tags)
    final = json.loads(store.finalize(True, ended_realtime_ns=START + 5 * SECOND).read_text(encoding="utf-8"))
    assert final["quality"]["attempt"] == attempt
    assert final["quality"]["intervals"] == live_quality()["intervals"]  # the live marks survive
    assert final["episode_tags"]["auto"] == tags
    assert final["annotations"]["success"] is False  # not overwritten by the default on finalize
    assert final["annotations"]["failure_reason"] == "dropped"
    assert session.session_id == final["session_id"]


def test_an_interrupted_session_keeps_its_quality_block(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    recovered = SessionStore.recover_orphaned_sessions(tmp_path, recovered_realtime_ns=START + 9 * SECOND)
    assert recovered == [{"session_id": session.session_id, "state": "FAILED"}]
    final = json.loads((session.directory / "manifest.json").read_text(encoding="utf-8"))
    assert final["quality"] == live_quality()


def finalized(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    store.finalize(True, ended_realtime_ns=START + 5 * SECOND)
    return session.directory


def test_replay_edits_bump_the_revision_and_mark_changed_intervals(tmp_path):
    directory = finalized(tmp_path)
    kept = interval(START + SECOND, START + 2 * SECOND, "stall", "replay")  # unchanged bounds and reason
    added = interval(START + 3 * SECOND, None, None, "live")  # new: the server marks it replay
    quality = SessionStore.update_quality_intervals(directory, [kept, added], 0, reasons=["stall"])
    assert quality["revision"] == 1
    assert [item["source"] for item in quality["intervals"]] == ["live", "replay"]
    assert quality["rejected_marks"] == 1
    stored = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))["quality"]
    assert stored == quality


def test_a_stale_revision_or_invalid_intervals_are_refused(tmp_path):
    directory = finalized(tmp_path)
    SessionStore.update_quality_intervals(directory, [], 0, reasons=["stall"])
    with pytest.raises(QualityConflict):
        SessionStore.update_quality_intervals(directory, [], 0, reasons=["stall"])
    with pytest.raises(QualityError):
        SessionStore.update_quality_intervals(directory, [interval(5, None)], 1, reasons=["stall"])
    with pytest.raises(ValueError):
        SessionStore.update_quality_intervals(directory, [], "1", reasons=["stall"])


def test_replay_edits_need_a_finalized_manifest(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    with pytest.raises(ValueError):
        SessionStore.update_quality_intervals(session.directory, [], 0, reasons=[])
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `rec test/test_session_store_quality.py`
Expected: FAIL with `AttributeError: 'SessionStore' object has no attribute 'update_quality'`

- [ ] **Step 3: Implement**

In `session_store.py` change `from typing import Any` to:

```python
from typing import Any, Iterable
```

Add these two methods to `SessionStore` right after `update_metadata`:

```python
    def update_quality(self, quality: dict[str, Any]) -> None:
        """Atomically replace the active session's ``quality`` block (live marks, attempt)."""
        if self._manifest is None:
            raise RuntimeError("no active recording session")
        self._manifest["quality"] = quality
        self._write_partial()

    def record_attempt_outcome(self, attempt: dict[str, Any], *, auto_tags: dict[str, Any]) -> None:
        """Store the finished policy attempt, its machine-written tags and its business success.

        ``finalize`` keeps ``annotations.success`` once it is set, so the attempt's verdict
        wins over the saved default.
        """
        if self._manifest is None:
            raise RuntimeError("no active recording session")
        from .episode_tags import validate_tags
        from .quality_events import quality_block
        quality = quality_block(self._manifest)
        quality["attempt"] = attempt
        self._manifest["quality"] = quality
        self._manifest["episode_tags"]["auto"] = validate_tags(auto_tags)
        annotations = self._manifest["annotations"]
        annotations["success"] = bool(attempt.get("succeeded"))
        annotations["failure_reason"] = None if attempt.get("succeeded") else attempt.get("outcome")
        self._write_partial()
```

Add this static method right after `update_subtasks`:

```python
    @staticmethod
    @_episode_serialized
    def update_quality_intervals(
        directory: str | Path, intervals: Any, revision: Any, *, reasons: Iterable[str],
    ) -> dict[str, Any]:
        """Replace a finalized session's deviation intervals from a replay edit.

        ``revision`` must match the stored one (compare-and-set, like episode tags). An interval
        whose bounds and reason equal a stored live one stays ``live``; anything else becomes
        ``replay``, whatever the client sent.
        """
        from .quality_events import QualityConflict, quality_block, validate_intervals
        if type(revision) is not int or revision < 0:
            raise ValueError("revision must be a non-negative integer")
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("recording manifest must be a JSON object")
        quality = quality_block(payload)
        if quality["revision"] != revision:
            raise QualityConflict("deviation intervals changed in another editor; reload before saving")
        started = payload.get("started_realtime_ns")
        if type(started) is not int:
            raise ValueError("recording manifest has no started_realtime_ns")
        ended = payload.get("ended_realtime_ns")
        normalized = validate_intervals(
            intervals, start_ns=started, end_ns=ended if type(ended) is int else None, reasons=reasons,
        )
        live = {
            (item.get("start_ns"), item.get("end_ns"), item.get("reason"))
            for item in quality["intervals"]
            if isinstance(item, dict) and item.get("source") == "live"
        }
        for item in normalized:
            item["source"] = "live" if (item["start_ns"], item["end_ns"], item["reason"]) in live else "replay"
        quality.update(intervals=normalized, revision=revision + 1)
        payload["quality"] = quality
        atomic_json_write(final, payload)
        SessionStore._refresh_episode_index_async(final.parent.parent)
        return quality
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `rec test/test_session_store_quality.py test/test_session_store.py test/test_subtask_annotation.py`
Expected: PASS

- [ ] **Step 5: Add to CI, lint and commit**

In `.github/workflows/ci.yml`, after the line added in Task 1, add:

```yaml
            src/recording/realman_recording:test/test_session_store_quality.py \
```

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/session_store.py src/recording/realman_recording/test/test_session_store_quality.py .github/workflows/ci.yml
git commit -m "feat(recording): keep live marks, attempt outcome and replay edits in the manifest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Episode tags: machine-written `auto` layer and derived `deviation_count`

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/episode_tags.py`
- Create: `src/recording/realman_recording/test/test_episode_tags_auto.py`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `quality_block` (Task 1); `manifest["episode_tags"]["auto"]` written by `SessionStore.record_attempt_outcome` (Task 3).
- Produces: effective tags = defaults snapshot → `auto` (source `auto`) → removed keys dropped → manual (source `manual`) → `deviation_count` (source `derived`). `deviation_count` is reserved: manual set/delete is refused. `update()` and `backfill()` keep `episode_tags.auto`.

- [ ] **Step 1: Write the failing tests**

`src/recording/realman_recording/test/test_episode_tags_auto.py`:

```python
"""Machine-written (auto) episode tags and the derived deviation_count."""
from __future__ import annotations

import json

import pytest

from realman_recording.episode_tags import EpisodeTagStore

AUTO = {"success": False, "policy_task": "pick_only", "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}


def write_session(root, *, auto=AUTO, intervals=None):
    directory = root / "s1"
    directory.mkdir(parents=True)
    episode_tags = {"defaults": {"success": True, "arm": None, "lighting_level": None},
                    "manual": {}, "removed": [], "revision": 0}
    if auto is not None:
        episode_tags["auto"] = dict(auto)
    manifest = {
        "session_id": "s1", "state": "READY", "decision": "PENDING",
        "started_realtime_ns": 1_790_091_000_000_000_000,
        # The recorder writes the attempt verdict into annotations too.
        "annotations": {"success": False if auto is not None else None},
        "metadata": {"task": "pick_only"},
        "episode_tags": episode_tags,
        "quality": {"revision": 0, "attempt": None, "intervals": intervals or [], "rejected_marks": 0},
    }
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    return directory


def stored(directory):
    return json.loads((directory / "manifest.json").read_text(encoding="utf-8"))


def test_auto_tags_override_defaults_and_say_so(tmp_path):
    write_session(tmp_path)
    result = EpisodeTagStore(tmp_path).get("s1")
    assert result["tags"]["success"] is False
    assert result["tag_sources"]["success"] == "auto"  # not mistaken for a manual edit
    assert result["tags"]["failure_reason"] == "dropped"
    assert result["tag_sources"]["policy_task"] == "auto"


def test_manual_tags_win_over_auto_and_auto_survives_edits(tmp_path):
    directory = write_session(tmp_path)
    store = EpisodeTagStore(tmp_path)
    result = store.update("s1", 0, {"success": True}, [], ["policy_task"])
    assert result["tags"]["success"] is True
    assert result["tag_sources"]["success"] == "manual"
    assert "policy_task" not in result["tags"]
    assert stored(directory)["episode_tags"]["auto"] == AUTO
    assert stored(directory)["annotations"]["success"] is True


def test_backfill_keeps_auto_tags(tmp_path):
    directory = write_session(tmp_path)
    store = EpisodeTagStore(tmp_path)
    store.save_defaults({"success": True, "lighting_level": 2})
    store.backfill(dry_run=False)
    assert stored(directory)["episode_tags"]["auto"] == AUTO
    assert stored(directory)["episode_tags"]["defaults"]["lighting_level"] == 2


def test_deviation_count_is_derived_and_read_only(tmp_path):
    intervals = [
        {"start_ns": "1790091001000000000", "end_ns": "1790091002000000000", "reason": None, "source": "live"},
        {"start_ns": "1790091003000000000", "end_ns": None, "reason": None, "source": "live"},
    ]
    write_session(tmp_path, auto=None, intervals=intervals)
    store = EpisodeTagStore(tmp_path)
    result = store.get("s1")
    assert result["tags"]["deviation_count"] == 2
    assert result["tag_sources"]["deviation_count"] == "derived"
    with pytest.raises(ValueError):
        store.update("s1", 0, {"deviation_count": 0}, [])
    with pytest.raises(ValueError):
        store.update("s1", 0, {}, [], ["deviation_count"])
    episode = store.rebuild()["episodes"][0]
    assert episode["tags"]["deviation_count"] == 2


def test_sessions_without_quality_count_zero_deviations(tmp_path):
    directory = write_session(tmp_path, auto=None)
    manifest = stored(directory)
    del manifest["quality"]
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    assert EpisodeTagStore(tmp_path).get("s1")["tags"]["deviation_count"] == 0
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `rec test/test_episode_tags_auto.py`
Expected: FAIL (`success` source is `manual`, no `deviation_count`)

- [ ] **Step 3: Implement**

In `episode_tags.py`:

1. After `from .json_io import atomic_json_write` add:

```python
from .quality_events import quality_block
```

2. Add `"deviation_count"` to `RESERVED`:

```python
RESERVED = set(CORE) | {"session_id", "dataset_path", "episode_index", "raw_session_path",
                        "recording_state", "decision", "export_state", "tag_sources", "revision",
                        "default_snapshot", "path_base", "complete", "deviation_count"}
```

3. After `derived_date`, add:

```python
def deviation_count(manifest: dict[str, Any]) -> int:
    """Number of deviation intervals in the manifest's quality block (derived, read-only)."""
    return len(quality_block(manifest)["intervals"])


def _tag_state(snapshot: dict[str, Any], manual: dict[str, Any], removed: Iterable[str], revision: int,
               auto: dict[str, Any]) -> dict[str, Any]:
    """The manifest's ``episode_tags`` object; ``auto`` (recorder-written) is kept only when present."""
    state: dict[str, Any] = {"defaults": snapshot, "manual": manual, "removed": sorted(removed), "revision": revision}
    if auto:
        state["auto"] = auto
    return state
```

and change `from typing import Any, Iterator` to `from typing import Any, Iterable, Iterator`.

4. Add this static method to `EpisodeTagStore` right before `_state`:

```python
    @staticmethod
    def _auto(manifest: dict[str, Any]) -> dict[str, Any]:
        """Tags the recorder wrote for a policy attempt (``episode_tags.auto``)."""
        state = manifest.get("episode_tags")
        auto = state.get("auto") if isinstance(state, dict) else None
        return validate_tags(auto) if isinstance(auto, dict) else {}
```

5. In `_state`, replace the legacy-success block:

```python
        annotations = manifest.get("annotations")
        legacy = annotations.get("success") if isinstance(annotations, dict) else None
        if "success" not in manual and type(legacy) is bool and (
            not isinstance(manifest.get("episode_tags"), dict) or legacy != snapshot["success"]
        ):
            manual["success"] = legacy
```

with:

```python
        annotations = manifest.get("annotations")
        legacy = annotations.get("success") if isinstance(annotations, dict) else None
        # The recorder mirrors an attempt's verdict into annotations; that is not a manual edit.
        baseline = self._auto(manifest).get("success", snapshot["success"])
        if "success" not in manual and type(legacy) is bool and (
            not isinstance(manifest.get("episode_tags"), dict) or legacy != baseline
        ):
            manual["success"] = legacy
```

6. Replace `_effective` with:

```python
    def _effective(self, manifest: dict[str, Any]) -> dict[str, Any]:
        snapshot, manual, revision = self._state(manifest)
        tags = {**snapshot, "date": derived_date(manifest)}
        sources = {key: "default" for key in snapshot}
        sources["date"] = "derived"
        auto = self._auto(manifest)
        tags.update(auto)
        sources.update({key: "auto" for key in auto})
        state = manifest.get("episode_tags") or {}
        removed = state.get("removed", []) if isinstance(state, dict) else []
        if isinstance(removed, list):
            for key in removed:
                if isinstance(key, str) and key not in CORE:
                    tags.pop(key, None)
                    sources.pop(key, None)
        tags.update(manual)
        sources.update({key: "manual" for key in manual})
        tags["deviation_count"] = deviation_count(manifest)
        sources["deviation_count"] = "derived"
        return {"tags": tags, "tag_sources": sources, "revision": revision,
                "complete": tags.get("arm") is not None and tags.get("lighting_level") is not None and tags.get("date") is not None}
```

7. In `update`, replace

```python
            manifest["episode_tags"] = {"defaults": snapshot, "manual": manual, "removed": sorted(removed), "revision": current + 1}
```

with

```python
            manifest["episode_tags"] = _tag_state(snapshot, manual, removed, current + 1, self._auto(manifest))
```

8. In `backfill`, replace

```python
                        manifest["episode_tags"] = {"defaults": snapshot, "manual": manual, "removed": sorted(removed), "revision": revision + 1}
```

with

```python
                        manifest["episode_tags"] = _tag_state(snapshot, manual, removed, revision + 1, self._auto(manifest))
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `rec test/test_episode_tags_auto.py test/test_episode_tags.py test/test_web_episode_tags.py test/test_session_store_quality.py`
Expected: PASS

- [ ] **Step 5: Add to CI, lint and commit**

In `.github/workflows/ci.yml`, after the Task 3 line, add:

```yaml
            src/recording/realman_recording:test/test_episode_tags_auto.py \
```

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/episode_tags.py src/recording/realman_recording/test/test_episode_tags_auto.py .github/workflows/ci.yml
git commit -m "feat(recording): add auto episode tags and the derived deviation_count

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Pure attempt-recording rules (`attempt_recording.py`)

**Files:**
- Create: `src/recording/realman_recording/realman_recording/attempt_recording.py`
- Create: `src/recording/realman_recording/test/test_attempt_recording.py`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces (used by Task 7):
  - `NO_RESULT = "no_result"`
  - `parse_profile_repo_ids(entries: Iterable[str]) -> dict[str, str]`
  - `repo_id_for_profile(profile: str, mapping: dict[str, str], default: str) -> str`
  - `attempt_goal(*, task: str, max_duration_sec: int, profile: str, stop_margin_sec: int, record_cameras: bool) -> SimpleNamespace` (fields `command, session_id, profile, task, duration_sec, record_cameras, start_at_walltime_ns`)
  - `started_attempt(*, attempt_id, task, arm, prompt, stamp_ns) -> dict`
  - `finished_attempt(attempt: dict, *, outcome: str, succeeded: bool, reason: str) -> dict`
  - `attempt_tags(attempt: dict) -> dict`

- [ ] **Step 1: Write the failing tests**

`src/recording/realman_recording/test/test_attempt_recording.py`:

```python
"""Pure rules the recorder uses to record one session per policy attempt."""
from __future__ import annotations

import pytest

from realman_recording.attempt_recording import (
    NO_RESULT,
    attempt_goal,
    attempt_tags,
    finished_attempt,
    parse_profile_repo_ids,
    repo_id_for_profile,
    started_attempt,
)


def test_profile_routing_maps_listed_profiles_and_keeps_the_default():
    mapping = parse_profile_repo_ids(["", " policy_rollout = realman/pi05-policy-rollouts "])
    assert mapping == {"policy_rollout": "realman/pi05-policy-rollouts"}
    assert repo_id_for_profile("policy_rollout", mapping, "realman/pi05-three-arm") == "realman/pi05-policy-rollouts"
    assert repo_id_for_profile("teleop", mapping, "realman/pi05-three-arm") == "realman/pi05-three-arm"


@pytest.mark.parametrize("entries", [
    ["policy_rollout"],
    ["=realman/x"],
    ["policy_rollout=no-slash"],
    ["a=realman/x", "a=realman/y"],
])
def test_profile_routing_refuses_malformed_entries(entries):
    with pytest.raises(ValueError):
        parse_profile_repo_ids(entries)


def test_the_start_goal_records_the_attempt_plus_a_margin():
    goal = attempt_goal(task="pick_only", max_duration_sec=60, profile="policy_rollout",
                        stop_margin_sec=10, record_cameras=True)
    assert (goal.profile, goal.task, goal.duration_sec) == ("policy_rollout", "pick_only", 70)
    assert goal.record_cameras is True
    assert goal.start_at_walltime_ns == 0
    with pytest.raises(ValueError):
        attempt_goal(task="t", max_duration_sec=0, profile="p", stop_margin_sec=0, record_cameras=False)


def test_attempt_records_and_tags():
    attempt = started_attempt(attempt_id="policy_attempt_x", task="pick_only", arm="r",
                              prompt="pick up the white object", stamp_ns=42)
    assert attempt == {"attempt_id": "policy_attempt_x", "task": "pick_only", "arm": "r",
                       "prompt": "pick up the white object", "started_ns": "42",
                       "outcome": None, "succeeded": None, "reason": ""}
    failed = finished_attempt(attempt, outcome="dropped", succeeded=False, reason="slipped")
    assert attempt_tags(failed) == {"success": False, "policy_task": "pick_only",
                                    "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}
    succeeded = finished_attempt(attempt, outcome="lifted_held", succeeded=True, reason="")
    assert attempt_tags(succeeded) == {"success": True, "policy_task": "pick_only", "attempt_id": "policy_attempt_x"}
    assert finished_attempt(attempt, outcome="", succeeded=False, reason="")["outcome"] == NO_RESULT
    with pytest.raises(ValueError):
        started_attempt(attempt_id="", task="t", arm="r", prompt="", stamp_ns=0)
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `rec test/test_attempt_recording.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_recording.attempt_recording'`

- [ ] **Step 3: Write the module**

`src/recording/realman_recording/realman_recording/attempt_recording.py`:

```python
"""Pure rules for recording one session per policy attempt (no ROS import).

The recorder turns /recording/attempt events into its ordinary START/STOP lifecycle; these
helpers build the START goal, the manifest's ``quality.attempt`` record, the machine-written
episode tags and the profile -> LeRobot dataset routing, so they can be tested without a graph.
"""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, Iterable

# Outcome recorded when a session ends before PolicyRun reported the attempt's result.
NO_RESULT = "no_result"


def parse_profile_repo_ids(entries: Iterable[str]) -> dict[str, str]:
    """``["policy_rollout=realman/pi05-policy-rollouts"]`` -> mapping; blank entries are skipped."""
    mapping: dict[str, str] = {}
    for entry in entries:
        text = str(entry).strip()
        if not text:
            continue
        profile, separator, repo_id = text.partition("=")
        profile, repo_id = profile.strip(), repo_id.strip()
        if not separator or not profile or "/" not in repo_id or profile in mapping:
            raise ValueError(f"lerobot_profile_repo_ids entries must be unique profile=owner/dataset: {text!r}")
        mapping[profile] = repo_id
    return mapping


def repo_id_for_profile(profile: str, mapping: dict[str, str], default: str) -> str:
    return mapping.get(profile.strip(), default)


def attempt_goal(
    *, task: str, max_duration_sec: int, profile: str, stop_margin_sec: int, record_cameras: bool,
) -> SimpleNamespace:
    """A ManageRecording START look-alike for the recorder's ``_prepare``/``_start_session``.

    ``duration_sec`` is the recorder's own countdown: if PolicyRun never reports a RESULT, the
    session still ends ``stop_margin_sec`` after the longest the attempt could have lasted.
    """
    if int(max_duration_sec) <= 0:
        raise ValueError("max_duration_sec must be positive")
    return SimpleNamespace(
        command=0,
        session_id="",
        profile=profile,
        task=task,
        duration_sec=int(max_duration_sec) + max(0, int(stop_margin_sec)),
        record_cameras=bool(record_cameras),
        start_at_walltime_ns=0,
    )


def started_attempt(*, attempt_id: str, task: str, arm: str, prompt: str, stamp_ns: int) -> dict[str, Any]:
    if not attempt_id:
        raise ValueError("attempt_id is required")
    return {"attempt_id": attempt_id, "task": task, "arm": arm, "prompt": prompt,
            "started_ns": str(stamp_ns), "outcome": None, "succeeded": None, "reason": ""}


def finished_attempt(attempt: dict[str, Any], *, outcome: str, succeeded: bool, reason: str) -> dict[str, Any]:
    return {**attempt, "outcome": outcome or NO_RESULT, "succeeded": bool(succeeded), "reason": reason}


def attempt_tags(attempt: dict[str, Any]) -> dict[str, Any]:
    """Episode tags the recorder writes (``episode_tags.auto``); a manual edit still wins."""
    tags: dict[str, Any] = {"success": bool(attempt["succeeded"]), "policy_task": attempt["task"],
                            "attempt_id": attempt["attempt_id"]}
    if not attempt["succeeded"]:
        tags["failure_reason"] = attempt["outcome"]
    return tags
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `rec test/test_attempt_recording.py`
Expected: PASS

- [ ] **Step 5: Add to CI, lint and commit**

In `.github/workflows/ci.yml`, after the Task 4 line, add:

```yaml
            src/recording/realman_recording:test/test_attempt_recording.py \
```

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/attempt_recording.py src/recording/realman_recording/test/test_attempt_recording.py .github/workflows/ci.yml
git commit -m "feat(recording): add pure rules for recording one session per policy attempt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Messages, live marks in the recorder, status and interface docs

**Files:**
- Create: `src/recording/realman_recording_msgs/msg/AttemptEvent.msg`
- Create: `src/recording/realman_recording_msgs/msg/QualityMark.msg`
- Modify: `src/recording/realman_recording_msgs/CMakeLists.txt`
- Modify: `src/recording/realman_recording/realman_recording/topic_catalog.py`
- Modify: `src/recording/realman_recording/realman_recording/recorder_node.py`
- Create: `src/recording/realman_recording/test/test_recording_quality_ros_integration.py`
- Modify: `website/docs/reference/ros-interfaces.md`

**Interfaces:**
- Consumes: `LiveQualityTracker`, `MARK_KINDS`, `load_quality_reasons` (Task 1); `SessionStore.update_quality` (Task 3).
- Produces (used by Tasks 7, 10, 11):
  - `realman_recording_msgs/msg/AttemptEvent` (`START=0`, `RESULT=1`; fields `kind, stamp, attempt_id, task, arm, prompt, max_duration_sec, outcome, succeeded, reason`)
  - `realman_recording_msgs/msg/QualityMark` (`DEVIATE_START=0`, `RECOVER=1`, `REASON=2`; fields `kind, stamp, reason`)
  - Recorder parameters `quality_mark_topic` (default `/recording/quality_mark`), `quality_reasons_path`
  - Recorder attributes used by Task 7: `_quality_tracker`, `_dropped_marks`, `_session_profile`, `_attempt`, `_quality_payload_locked()`, `_quality_status_locked()`
  - `/recording/status.diagnostics_json` gains `"quality": {"profile", "attempt_id", "deviating", "deviation_start_ns", "reason", "rejected_marks", "dropped_marks"}`
  - Test helpers in `test_recording_quality_ros_integration.py`: `recorder_graph(tmp_path, extra: dict)`, `_wait`, `_manage`

- [ ] **Step 1: Add the messages**

`src/recording/realman_recording_msgs/msg/AttemptEvent.msg`:

```text
# One policy attempt's lifecycle, published by realman_bt PolicyRun on /recording/attempt.
# The recorder opens a session on START and closes it on RESULT (auto_record_* parameters).
uint8 START=0
uint8 RESULT=1

uint8 kind
# Publisher SYSTEM_TIME.
builtin_interfaces/Time stamp
# The attempt's policy trace CSV name without .csv: policy_attempt_<UTC>_<arm>[_n].
string attempt_id
# policy_task.tasks entry, the arm it drives and the prompt the bridge was switched to.
string task
string arm
string prompt
# START only: the longest the attempt can last from START (activation + run + stop). The
# recorder adds a margin and stops the session itself if no RESULT arrives by then.
uint32 max_duration_sec
# RESULT only: PolicyRun's outcome name (lifted_held, dropped, timeout, ...) or "halted".
string outcome
bool succeeded
# RESULT only: the human-readable reason PolicyRun reported (empty on success).
string reason
```

`src/recording/realman_recording_msgs/msg/QualityMark.msg`:

```text
# One live deviation mark from the :8765 operator, published by realman_web_control on
# /recording/quality_mark. Annotation data only: it never starts or stops a recording.
uint8 DEVIATE_START=0
uint8 RECOVER=1
# Set the reason of the deviation that has not recovered yet.
uint8 REASON=2

uint8 kind
# SYSTEM_TIME when web_control received the operator's key press.
builtin_interfaces/Time stamp
# An id from config/recording/quality_reasons.yaml, or empty.
string reason
```

In `src/recording/realman_recording_msgs/CMakeLists.txt` replace

```cmake
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/RecordingStatus.msg"
  "srv/ManageRecording.srv"
```

with

```cmake
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/AttemptEvent.msg"
  "msg/QualityMark.msg"
  "msg/RecordingStatus.msg"
  "srv/ManageRecording.srv"
```

- [ ] **Step 2: Write the failing ROS integration test**

`src/recording/realman_recording/test/test_recording_quality_ros_integration.py`:

```python
"""ROS integration coverage for live deviation marks and per-attempt auto recording."""
from __future__ import annotations

import json
import os
import threading
import time
from contextlib import contextmanager

import pytest


def _wait(predicate, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.02)
    return predicate()


@contextmanager
def recorder_graph(tmp_path, extra=None):
    """A recorder plus a synthetic driver on an isolated domain; yields (recorder, driver)."""
    rclpy = pytest.importorskip("rclpy")
    try:
        from rclpy.executors import MultiThreadedExecutor
        from rclpy.node import Node
        from rclpy.parameter import Parameter
        from sensor_msgs.msg import JointState
        from std_msgs.msg import Bool
        from realman_recording.recorder_node import RecordingRecorderNode
    except ImportError as error:  # pragma: no cover - only available in Humble test images
        pytest.skip(f"ROS recording runtime is unavailable: {error}")
    previous_domain = os.environ.get("ROS_DOMAIN_ID")
    domain_id = (os.getpid() % 200) + 20
    os.environ["ROS_DOMAIN_ID"] = str(219 if domain_id == 65 else domain_id)
    rclpy.init(args=[])
    recorder = driver = executor = spin_thread = None
    try:
        reasons = tmp_path / "quality_reasons.yaml"
        reasons.write_text("reasons:\n  - {id: grasp_miss, label: x}\n  - {id: stall, label: y}\n", encoding="utf-8")
        values = {
            "recording_root": str(tmp_path / "sessions"),
            "lerobot_export_dir": str(tmp_path / "lerobot"),
            "arm_namespaces": ["qa"],
            "preflight_required_topics": ["/qa/joint_states"],
            "min_free_space_bytes": 0,
            "auto_export_on_stop": False,
            "quality_reasons_path": str(reasons),
            **(extra or {}),
        }
        recorder = RecordingRecorderNode(parameter_overrides=[Parameter(name, value=value) for name, value in values.items()])
        driver = Node("recording_quality_test_driver")
        joint_pub = driver.create_publisher(JointState, "/qa/joint_states", 10)
        connected_pub = driver.create_publisher(Bool, "/qa/connected", 10)
        joint_message = JointState()
        joint_message.name = [f"joint_{index}" for index in range(1, 7)]
        joint_message.position = [0.0] * 6

        def publish_sensor_state():
            joint_pub.publish(joint_message)
            connected_pub.publish(Bool(data=True))

        driver.create_timer(0.05, publish_sensor_state)
        executor = MultiThreadedExecutor(num_threads=3)
        executor.add_node(recorder)
        executor.add_node(driver)
        spin_thread = threading.Thread(target=executor.spin, name="recording-quality-test", daemon=True)
        spin_thread.start()
        assert _wait(lambda: "/qa/joint_states" in recorder._last_receipt_wall_ns
                     and recorder._arm_connected.get("qa") is True)
        yield recorder, driver
    finally:
        if executor is not None:
            executor.shutdown(timeout_sec=2.0)
        if spin_thread is not None:
            spin_thread.join(timeout=2.0)
        if driver is not None:
            driver.destroy_node()
        if recorder is not None:
            recorder.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
        if previous_domain is None:
            os.environ.pop("ROS_DOMAIN_ID", None)
        else:
            os.environ["ROS_DOMAIN_ID"] = previous_domain


def _manage(driver, command, **fields):
    from realman_recording_msgs.srv import ManageRecording
    client = getattr(driver, "_test_manage_client", None)
    if client is None:
        client = driver.create_client(ManageRecording, "/recording/manage")
        driver._test_manage_client = client
    assert client.wait_for_service(timeout_sec=5.0)
    future = client.call_async(ManageRecording.Request(command=command, **fields))
    assert _wait(future.done, timeout=8.0), f"service command {command} timed out"
    return future.result()


def _read_manifest(path):
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}


def test_live_marks_become_session_intervals_and_status(tmp_path):
    with recorder_graph(tmp_path) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import QualityMark
        from realman_recording_msgs.srv import ManageRecording
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        marks = driver.create_publisher(QualityMark, "/recording/quality_mark", 50)
        assert _wait(lambda: marks.get_subscription_count() >= 1)

        def mark(kind, reason=""):
            message = QualityMark(kind=kind, reason=reason)
            message.stamp = wall.now().to_msg()
            marks.publish(message)
            time.sleep(0.05)

        started = _manage(driver, ManageRecording.Request.START, profile="manual", task="marks", record_cameras=False)
        assert started.success, started.message
        mark(QualityMark.DEVIATE_START)
        assert _wait(lambda: recorder._quality_tracker is not None and recorder._quality_tracker.deviating)
        with recorder._lock:
            status = json.loads(recorder._diagnostics_json())["quality"]
        assert status["deviating"] is True
        assert status["profile"] == "manual"
        assert int(status["deviation_start_ns"]) > 0
        mark(QualityMark.REASON, "grasp_miss")
        mark(QualityMark.REASON, "not_a_reason")  # rejected
        mark(QualityMark.RECOVER)
        assert _wait(lambda: not recorder._quality_tracker.deviating)

        stopped = _manage(driver, ManageRecording.Request.STOP)
        assert stopped.success, stopped.message
        manifest = _read_manifest(tmp_path / "sessions" / started.session_id / "manifest.json")
        intervals = manifest["quality"]["intervals"]
        assert len(intervals) == 1
        assert intervals[0]["reason"] == "grasp_miss"
        assert intervals[0]["source"] == "live"
        assert int(intervals[0]["end_ns"]) > int(intervals[0]["start_ns"])
        assert manifest["quality"]["rejected_marks"] == 1
        assert manifest["metadata"]["topic_types"]["/recording/quality_mark"] == "realman_recording_msgs/msg/QualityMark"

        mark(QualityMark.DEVIATE_START)  # nothing records now
        assert _wait(lambda: recorder._dropped_marks == 1)
```

- [ ] **Step 3: Run it to see it fail**

Run: `humble "cd src/recording/realman_recording && python3 -m pytest -q test/test_recording_quality_ros_integration.py -p no:cacheprovider"`
Expected: FAIL (`RecordingRecorderNode` has no attribute `_quality_tracker`, or the parameter `quality_reasons_path` is undeclared)

- [ ] **Step 4: Register the mark topic in the catalog**

In `topic_catalog.py`:

1. After `from realman_msgs.msg import CartesianVelocityState` add:

```python
from realman_recording_msgs.msg import QualityMark
```

2. Add to `TYPE_REGISTRY`:

```python
    "realman_recording_msgs/msg/QualityMark": QualityMark,
```

3. Add a keyword parameter to `build_topic_catalog` after `gripper_alarm_topics: Iterable[str] = (),`:

```python
    quality_mark_topic: str = "",
```

4. At the end of `build_topic_catalog`, before `return catalog`, add:

```python
    # Live deviation marks from :8765: annotation input, archived like any observation.
    if quality_mark_topic:
        add(quality_mark_topic, QualityMark, "realman_recording_msgs/msg/QualityMark")
```

- [ ] **Step 5: Wire live marks into the recorder**

In `recorder_node.py`:

1. Imports. Add `import os` after `import json`. Change

```python
from rclpy.callback_groups import ReentrantCallbackGroup
```

to

```python
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup
```

change

```python
from realman_recording_msgs.msg import RecordingStatus
```

to

```python
from realman_recording_msgs.msg import QualityMark, RecordingStatus
```

and after `from .provenance import snapshot_optional_file` add:

```python
from .quality_events import MARK_KINDS, LiveQualityTracker, load_quality_reasons
```

2. Parameters. After `self.declare_parameter("min_free_space_bytes", 5_000_000_000)` add:

```python
        # Live deviation marks from :8765 (realman_recording_msgs/QualityMark). They are archived
        # to MCAP like any input and folded into the session's quality.intervals; an empty topic
        # disables the subscription.
        self.declare_parameter("quality_mark_topic", "/recording/quality_mark")
        # config/recording/quality_reasons.yaml: the reason ids a mark may carry.
        self.declare_parameter(
            "quality_reasons_path",
            str(Path(os.environ.get("REALMAN_CONFIG_ROOT", "/opt/rm65_ws/config")) / "recording" / "quality_reasons.yaml"),
        )
```

3. State. Immediately before `self._topic_types: dict[str, str] = {}` add:

```python
        self._quality_topic = str(self.get_parameter("quality_mark_topic").value)
        try:
            self._quality_reasons = tuple(
                reason.id for reason in load_quality_reasons(str(self.get_parameter("quality_reasons_path").value))
            )
        except Exception as error:  # noqa: BLE001 - a bad reason file must not stop recording
            self.get_logger().error(f"deviation reasons unavailable, marks carry no reason: {error}")
            self._quality_reasons = ()
        # Marks are applied in arrival order: a reentrant group could run D and its reason at once.
        self._quality_callback_group = MutuallyExclusiveCallbackGroup()
        # Live marks of the active session; None while nothing records.
        self._quality_tracker: LiveQualityTracker | None = None
        self._dropped_marks = 0
        self._session_profile = ""
        # The policy attempt the active session records (auto_record_* parameters, Task 7).
        self._attempt: dict[str, Any] | None = None
```

4. Replace `_register_subscriptions` with:

```python
    def _register_subscriptions(self) -> None:
        """Subscribe to every configured input; one callback archives samples to MCAP."""
        catalog = build_topic_catalog(
            self._arms,
            arm_action_topics=self.get_parameter("arm_action_topics").value,
            arm_velocity_topics=self.get_parameter("arm_velocity_topics").value,
            gripper_position_topics=self.get_parameter("gripper_position_topics").value,
            gripper_action_topics=self.get_parameter("gripper_action_topics").value,
            gripper_torque_topics=self.get_parameter("gripper_torque_topics").value,
            gripper_alarm_topics=self.get_parameter("gripper_alarm_topics").value,
            quality_mark_topic=self._quality_topic,
        )
        self._topic_types = {spec.topic: spec.type_name for spec in catalog.values()}
        for spec in catalog.values():
            if spec.topic == self._quality_topic:
                self.create_subscription(
                    spec.message_type, spec.topic, self._record_quality_mark, 50,
                    callback_group=self._quality_callback_group,
                )
                continue
            connected_arm = _connected_arm_from_topic(spec.topic)
            self.create_subscription(
                spec.message_type,
                spec.topic,
                lambda message, selected=spec.topic, arm=connected_arm: self._record_message(
                    selected, message, arm
                ),
                10,
                callback_group=self._callback_group,
            )
        # Canonical v1 records the configured calibration snapshot as immutable camera
        # provenance.  It deliberately does not archive live CameraInfo or /tf_static:
        # adding either requires a versioned topic contract and an exporter that proves
        # it used the same calibration as the raw images, rather than a best-effort
        # runtime transform lookup.
```

5. In `_start_session`, right after

```python
            self._state = SessionState.RECORDING
            store.transition(self._state)
```

add:

```python
            self._session_profile = goal.profile.strip()
            self._attempt = None
            self._quality_tracker = LiveQualityTracker(session_start_ns=now_wall_ns, reasons=self._quality_reasons)
```

and in the camera-startup failure branch replace

```python
                    self._store = None
                    self._archive = None
                    self._state = SessionState.FAILED
                    raise
```

with

```python
                    self._store = None
                    self._archive = None
                    self._quality_tracker = None
                    self._session_profile = ""
                    self._state = SessionState.FAILED
                    raise
```

6. In `_stop_session`, in the first `with self._lock:` block, after `self._deadline_monotonic_ns = None` add:

```python
            self._quality_tracker = None
            self._session_profile = ""
```

7. Replace `_diagnostics_json` with:

```python
    def _diagnostics_json(self) -> str:
        """Preflight diagnostics plus the live marking state; callers hold ``self._lock``."""
        payload = self._preflight_payload()
        payload["quality"] = self._quality_status_locked()
        return json.dumps(payload, separators=(",", ":"))
```

8. After `_record_message`, add:

```python
    def _record_quality_mark(self, message: QualityMark) -> None:
        """Archive a live mark like any input, then fold it into the session's intervals."""
        self._record_message(self._quality_topic, message)
        receipt_wall_ns = self._receipt_wall_clock.now().nanoseconds
        stamp_ns = message.stamp.sec * 1_000_000_000 + message.stamp.nanosec
        kind = MARK_KINDS[message.kind] if message.kind < len(MARK_KINDS) else ""
        with self._lock:
            tracker, store = self._quality_tracker, self._store
            if tracker is None or store is None:
                self._dropped_marks += 1
                return
            tracker.apply(kind, stamp_ns, message.reason, now_ns=receipt_wall_ns)
            # Rejected marks change rejected_marks, so the partial is rewritten either way.
            store.update_quality(self._quality_payload_locked())

    def _quality_payload_locked(self) -> dict[str, Any]:
        """The active session's quality block; callers hold ``self._lock``."""
        tracker = self._quality_tracker
        return {
            "revision": 0,
            "attempt": self._attempt,
            "intervals": tracker.intervals() if tracker is not None else [],
            "rejected_marks": tracker.rejected if tracker is not None else 0,
        }

    def _quality_status_locked(self) -> dict[str, Any]:
        """Marking state for /recording/status (the :8765 strip); callers hold ``self._lock``."""
        tracker = self._quality_tracker
        current = tracker.open_interval() if tracker is not None else None
        attempt = self._attempt if self._store is not None else None
        return {
            "profile": self._session_profile,
            "attempt_id": str((attempt or {}).get("attempt_id", "")),
            "deviating": current is not None,
            "deviation_start_ns": "" if current is None else str(current["start_ns"]),
            "reason": "" if current is None or current["reason"] is None else current["reason"],
            "rejected_marks": tracker.rejected if tracker is not None else 0,
            "dropped_marks": self._dropped_marks,
        }
```

- [ ] **Step 6: Run the ROS tests to see them pass**

Run: `humble "cd src/recording/realman_recording && python3 -m pytest -q test/test_recording_quality_ros_integration.py test/test_recording_service_ros_integration.py -p no:cacheprovider"`
Expected: PASS (2 passed)

- [ ] **Step 7: Document the interfaces**

In `website/docs/reference/ros-interfaces.md`, in the `## 数据录制 \`realman_recording\`` table, replace the `/recording/manage` row with:

```markdown
| `/recording/manage` | `realman_recording_msgs/ManageRecording`（Service） | 人工 / Pika 的会话控制入口：`PREPARE` / `START` / `STOP` / `ADOPT` / `DISCARD`（策略尝试走下面的 `/recording/attempt`） |
```

and add these rows after the `/recording/status` row:

```markdown
| `/recording/attempt` | `realman_recording_msgs/AttemptEvent` | 行为树 PolicyRun 发布：`START` 时 recorder 为这次尝试开一个 session，`RESULT` 时写结果并停录（详见[策略运行偏离标注](../development/quality-annotation)） |
| `/recording/quality_mark` | `realman_recording_msgs/QualityMark` | :8765 发布的现场偏离打点（开始偏离 / 恢复 / 原因），只作标注，不会开录或停录 |
```

- [ ] **Step 8: Lint and commit**

Run: `lint && rec test/test_quality_events.py`
Expected: `All checks passed!` and PASS

```bash
cd "$WT" && git add src/recording/realman_recording_msgs src/recording/realman_recording/realman_recording/topic_catalog.py src/recording/realman_recording/realman_recording/recorder_node.py src/recording/realman_recording/test/test_recording_quality_ros_integration.py website/docs/reference/ros-interfaces.md
git commit -m "feat(recording): record live deviation marks into the session manifest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Recorder auto-records each policy attempt; profile routing; config and recording docs

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/recorder_node.py`
- Modify: `src/recording/realman_recording/test/test_recording_quality_ros_integration.py` (append)
- Modify: `src/recording/realman_recording/test/test_recording_service_ros_integration.py`
- Modify: `config/ros/recording.yaml`
- Modify: `src/recording/README.md`
- Modify: `website/docs/development/recording-platform.md`

**Interfaces:**
- Consumes: Task 5 helpers; `SessionStore.record_attempt_outcome` (Task 3); Task 6 recorder state; `AttemptEvent` (Task 6).
- Produces: recorder parameters `auto_record_enabled`, `attempt_topic`, `auto_record_profile`, `auto_record_stop_margin_sec`, `auto_record_adopt_on_stop`, `auto_record_cameras`, `lerobot_profile_repo_ids`; `/recording/status.diagnostics_json.quality` gains `auto_record_last_error` and `auto_record: {ignored_busy, start_failed, result_ignored}`.

- [ ] **Step 1: Append the failing ROS tests**

Append to `src/recording/realman_recording/test/test_recording_quality_ros_integration.py`:

```python
ATTEMPT = "policy_attempt_20261029_031500_r"


def _attempt(publisher, wall, kind, attempt_id=ATTEMPT, **fields):
    from realman_recording_msgs.msg import AttemptEvent
    message = AttemptEvent(kind=kind, attempt_id=attempt_id, task="pick_only", arm="r",
                           prompt="pick up the white object", **fields)
    message.stamp = wall.now().to_msg()
    publisher.publish(message)


def _publishers(driver):
    from realman_recording_msgs.msg import AttemptEvent, QualityMark
    attempts = driver.create_publisher(AttemptEvent, "/recording/attempt", 10)
    marks = driver.create_publisher(QualityMark, "/recording/quality_mark", 50)
    assert _wait(lambda: attempts.get_subscription_count() >= 1 and marks.get_subscription_count() >= 1)
    return attempts, marks


def test_a_policy_attempt_is_recorded_as_one_tagged_session(tmp_path):
    extra = {"auto_record_cameras": False, "auto_record_stop_margin_sec": 5,
             "lerobot_profile_repo_ids": ["policy_rollout=realman/pi05-policy-rollouts"]}
    with recorder_graph(tmp_path, extra) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import AttemptEvent, QualityMark
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        attempts, marks = _publishers(driver)
        _attempt(attempts, wall, AttemptEvent.START, max_duration_sec=30)
        assert _wait(lambda: recorder._store is not None and recorder._attempt is not None)
        session_id = recorder._store.session.session_id
        mark = QualityMark(kind=QualityMark.DEVIATE_START, reason="stall")
        mark.stamp = wall.now().to_msg()
        marks.publish(mark)
        assert _wait(lambda: recorder._quality_tracker is not None and recorder._quality_tracker.deviating)
        with recorder._lock:
            assert json.loads(recorder._diagnostics_json())["quality"]["attempt_id"] == ATTEMPT
        _attempt(attempts, wall, AttemptEvent.RESULT, outcome="dropped", succeeded=False, reason="slipped out")
        path = tmp_path / "sessions" / session_id / "manifest.json"
        assert _wait(lambda: _read_manifest(path).get("decision") == "ADOPTED", timeout=8.0)
        manifest = _read_manifest(path)
        assert manifest["metadata"]["profile"] == "policy_rollout"
        assert manifest["metadata"]["task"] == "pick_only"
        assert manifest["metadata"]["canonical_config"]["repo_id"] == "realman/pi05-policy-rollouts"
        attempt = manifest["quality"]["attempt"]
        assert attempt["attempt_id"] == ATTEMPT
        assert (attempt["outcome"], attempt["succeeded"], attempt["reason"]) == ("dropped", False, "slipped out")
        assert manifest["quality"]["intervals"][0]["end_ns"] is None  # never recovered
        assert manifest["episode_tags"]["auto"] == {"success": False, "policy_task": "pick_only",
                                                    "attempt_id": ATTEMPT, "failure_reason": "dropped"}
        assert manifest["annotations"]["success"] is False


def test_an_attempt_without_result_stops_at_its_deadline_as_no_result(tmp_path):
    extra = {"auto_record_cameras": False, "auto_record_stop_margin_sec": 0, "auto_record_adopt_on_stop": False}
    with recorder_graph(tmp_path, extra) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import AttemptEvent
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        attempts, _ = _publishers(driver)
        _attempt(attempts, wall, AttemptEvent.START, max_duration_sec=1)
        assert _wait(lambda: recorder._store is not None)
        session_id = recorder._store.session.session_id
        path = tmp_path / "sessions" / session_id / "manifest.json"
        assert _wait(path.is_file, timeout=6.0)
        manifest = _read_manifest(path)
        assert manifest["quality"]["attempt"]["outcome"] == "no_result"
        assert manifest["quality"]["attempt"]["succeeded"] is False
        assert manifest["episode_tags"]["auto"]["failure_reason"] == "no_result"
        assert manifest["decision"] == "PENDING"
        _attempt(attempts, wall, AttemptEvent.RESULT, outcome="lifted_held", succeeded=True)  # too late
        assert _wait(lambda: recorder._auto_record_counters["result_ignored"] == 1)


def test_an_attempt_is_not_recorded_while_another_session_records(tmp_path):
    with recorder_graph(tmp_path, {"auto_record_cameras": False}) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import AttemptEvent
        from realman_recording_msgs.srv import ManageRecording
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        attempts, _ = _publishers(driver)
        started = _manage(driver, ManageRecording.Request.START, profile="manual", task="teleop", record_cameras=False)
        assert started.success, started.message
        _attempt(attempts, wall, AttemptEvent.START, max_duration_sec=30)
        assert _wait(lambda: recorder._auto_record_counters["ignored_busy"] == 1)
        assert recorder._attempt is None
        assert recorder._store.session.session_id == started.session_id
        assert _manage(driver, ManageRecording.Request.STOP).success
```

In `src/recording/realman_recording/test/test_recording_service_ros_integration.py`, the existing test asserts one subscription per recorded topic, and the attempt subscription is not a recorded topic. Add this line to its `parameters` list right after `Parameter("auto_export_on_stop", value=False),`:

```python
            Parameter("auto_record_enabled", value=False),
```

- [ ] **Step 2: Run them to see them fail**

Run: `humble "cd src/recording/realman_recording && python3 -m pytest -q test/test_recording_quality_ros_integration.py -p no:cacheprovider"`
Expected: FAIL (undeclared parameter `auto_record_cameras`)

- [ ] **Step 3: Implement auto recording**

In `recorder_node.py`:

1. Imports. Add `import queue` after `import json`. Change the msgs import to:

```python
from realman_recording_msgs.msg import AttemptEvent, QualityMark, RecordingStatus
```

and after `from .camera_workers import (...)` block add:

```python
from .attempt_recording import (
    NO_RESULT,
    attempt_goal,
    attempt_tags,
    finished_attempt,
    parse_profile_repo_ids,
    repo_id_for_profile,
    started_attempt,
)
```

2. Parameters, right after the `quality_reasons_path` declaration:

```python
        # One session per policy attempt, driven by realman_bt PolicyRun on attempt_topic. Besides
        # /recording/manage this is the only lifecycle input; it takes the same serialized START/STOP
        # path and never interrupts a session someone else started (that attempt is not recorded).
        self.declare_parameter("auto_record_enabled", True)
        self.declare_parameter("attempt_topic", "/recording/attempt")
        self.declare_parameter("auto_record_profile", "policy_rollout")
        self.declare_parameter("auto_record_stop_margin_sec", 10)
        self.declare_parameter("auto_record_adopt_on_stop", True)
        # Camera-less test graphs set this false; on the robot attempts are recorded with cameras.
        self.declare_parameter("auto_record_cameras", True)
        # profile=owner/dataset entries; a profile not listed exports to lerobot_repo_id.
        self.declare_parameter("lerobot_profile_repo_ids", [""])
```

3. State, right after `self._attempt: dict[str, Any] | None = None`:

```python
        self._attempt_open = False  # the attempt still waits for its RESULT
        self._auto_session = False  # the active session was opened for an attempt
        self._auto_record_last_error = ""
        self._auto_record_counters = {"ignored_busy": 0, "start_failed": 0, "result_ignored": 0}
        self._profile_repo_ids = parse_profile_repo_ids(self.get_parameter("lerobot_profile_repo_ids").value)
```

4. After the `self._upstream_service = self.create_service(...)` statement add:

```python
        # Attempt events are handled in arrival order on one worker that takes the same lifecycle
        # lock as /recording/manage, so an attempt START never races a service STOP.
        self._attempt_events: queue.Queue[Any] = queue.Queue()
        self._attempt_worker = threading.Thread(
            target=self._attempt_worker_main, name="recording-attempt-worker", daemon=True,
        )
        self._attempt_worker.start()
        if bool(self.get_parameter("auto_record_enabled").value):
            self.create_subscription(
                AttemptEvent, str(self.get_parameter("attempt_topic").value), self._attempt_events.put, 10,
                callback_group=self._quality_callback_group,
            )
```

5. Replace `destroy_node` with:

```python
    def destroy_node(self) -> bool:
        self._attempt_events.put(None)
        self._stop_session(success=False, reason="recording node shutdown")
        return super().destroy_node()
```

6. In `_start_session`, in the `canonical_config` dict, replace

```python
                        "repo_id": str(self.get_parameter("lerobot_repo_id").value),
```

with

```python
                        "repo_id": repo_id_for_profile(
                            goal.profile, self._profile_repo_ids, str(self.get_parameter("lerobot_repo_id").value)
                        ),
```

7. Replace the whole `_stop_session` with:

```python
    def _stop_session(self, *, success: bool, reason: str) -> str | None:
        """Finalize the session: stop archive/camera writers and write the final manifest.

        The durable writers are stopped outside the lock so a slow archive/rosbag close
        cannot block subscription callbacks.  The final READY/FAILED state reflects both
        the requested ``success`` and whether the archive reported write errors.  An attempt
        session that ends before its RESULT (countdown, service STOP, shutdown) records the
        outcome ``no_result``.
        """
        with self._lock:
            store, archive, camera_worker = self._store, self._archive, self._camera_worker
            if store is None or store.session is None:
                return None
            session_id = store.session.session_id
            self._state = SessionState.FINALIZING
            store.transition(self._state)
            self._store = None
            self._archive = None
            self._camera_worker = None
            self._deadline_monotonic_ns = None
            self._quality_tracker = None
            self._session_profile = ""
            unanswered = self._attempt if self._attempt_open else None
            auto_session = self._auto_session
            self._attempt_open = False
            self._auto_session = False
        archive_stats = archive.stop() if archive is not None else None
        camera_summary = camera_worker.stop() if camera_worker is not None else {}
        archive_write_errors = archive_stats.write_errors if archive_stats else 1
        camera_write_errors = camera_summary_error_count(camera_summary)
        final_success = success and archive_write_errors == 0 and camera_write_errors == 0
        final_reason = reason if final_success else (
            f"{reason}; MCAP write/close errors: {archive_write_errors}; "
            f"camera JPEG write errors: {camera_write_errors}"
        )
        if unanswered is not None:
            finished = finished_attempt(unanswered, outcome=NO_RESULT, succeeded=False, reason=reason)
            store.record_attempt_outcome(finished, auto_tags=attempt_tags(finished))
        store.finalize(
            final_success,
            ended_realtime_ns=self._receipt_wall_clock.now().nanoseconds,
            reason=final_reason,
            enqueued_samples=archive_stats.enqueued if archive_stats else 0,
            accepted_samples=archive_stats.accepted if archive_stats else 0,
            dropped_samples=archive_stats.dropped if archive_stats else 0,
            write_errors=archive_write_errors,
            camera_write_errors=camera_write_errors,
            cameras=camera_summary,
        )
        with self._lock:
            self._last_session_id = session_id
            self._last_archive_stats = archive_stats
            self._last_camera_summary = camera_summary
            self._state = SessionState.READY if final_success else SessionState.FAILED
        # Auto-export enqueues a clean STOP for conversion; a FAILED session (write
        # errors) is never adopted.  auto_export_on_stop=false restores the manual
        # ADOPT-only flow; attempt sessions follow auto_record_adopt_on_stop instead.
        if should_auto_export(
            auto_export_on_stop=bool(self.get_parameter("auto_export_on_stop").value)
            or (auto_session and bool(self.get_parameter("auto_record_adopt_on_stop").value)),
            final_success=final_success,
        ):
            self._adopt_session(session_id)
        return session_id
```

8. In `_export_adopted_session`, route the dataset by the session's profile. Replace

```python
        with self._decision_lock:
            try:
                manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
                decision = manifest.get("decision") if isinstance(manifest, dict) else None
            except (OSError, json.JSONDecodeError):
                decision = None
```

with

```python
        profile = ""
        with self._decision_lock:
            try:
                manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
                decision = manifest.get("decision") if isinstance(manifest, dict) else None
                metadata = manifest.get("metadata") if isinstance(manifest, dict) else None
                profile = str(metadata.get("profile", "")) if isinstance(metadata, dict) else ""
            except (OSError, json.JSONDecodeError):
                decision = None
```

and in the `schema_from_parameters(...)` call replace

```python
                        repo_id=str(self.get_parameter("lerobot_repo_id").value),
```

with

```python
                        repo_id=repo_id_for_profile(
                            profile, self._profile_repo_ids, str(self.get_parameter("lerobot_repo_id").value)
                        ),
```

9. In `_quality_status_locked`, add two keys to the returned dict after `"dropped_marks": self._dropped_marks,`:

```python
            "auto_record_last_error": self._auto_record_last_error,
            "auto_record": dict(self._auto_record_counters),
```

10. Add the worker methods after `_quality_status_locked`:

```python
    def _attempt_worker_main(self) -> None:
        """Handle /recording/attempt events one at a time, in arrival order."""
        while True:
            message = self._attempt_events.get()
            if message is None:
                return
            try:
                with self._service_lock:
                    if message.kind == AttemptEvent.START:
                        self._attempt_started(message)
                    elif message.kind == AttemptEvent.RESULT:
                        self._attempt_finished(message)
            except Exception as error:  # noqa: BLE001 - one bad event must not stop the worker
                self.get_logger().error(f"policy attempt event failed: {error}")

    def _attempt_started(self, message: AttemptEvent) -> None:
        """Open one session for a policy attempt, unless something else is recording."""
        # A countdown stop runs on its own thread; give its finalization a moment to finish.
        deadline = time.monotonic() + 10.0
        while time.monotonic() < deadline:
            with self._lock:
                if self._state is not SessionState.FINALIZING:
                    break
            time.sleep(0.05)
        with self._lock:
            busy = self._store is not None or self._state in {SessionState.SCHEDULED, SessionState.FINALIZING}
            if busy:
                self._auto_record_counters["ignored_busy"] += 1
        if busy:
            self.get_logger().warning(f"policy attempt {message.attempt_id} not recorded: another session is active")
            return
        try:
            attempt = started_attempt(
                attempt_id=message.attempt_id, task=message.task, arm=message.arm, prompt=message.prompt,
                stamp_ns=message.stamp.sec * 1_000_000_000 + message.stamp.nanosec,
            )
            goal = attempt_goal(
                task=message.task,
                max_duration_sec=int(message.max_duration_sec),
                profile=str(self.get_parameter("auto_record_profile").value),
                stop_margin_sec=int(self.get_parameter("auto_record_stop_margin_sec").value),
                record_cameras=bool(self.get_parameter("auto_record_cameras").value),
            )
            self._prepare(goal)
            if self._last_preflight is None or not self._last_preflight.ready:
                summary = self._last_preflight.summary if self._last_preflight else "preflight unavailable"
                raise RuntimeError(f"preflight failed: {summary}")
            self._start_session(goal)
        except Exception as error:  # noqa: BLE001 - an unrecorded attempt still runs
            with self._lock:
                self._auto_record_counters["start_failed"] += 1
                self._auto_record_last_error = str(error)
            self.get_logger().warning(f"policy attempt {message.attempt_id} not recorded: {error}")
            return
        with self._lock:
            self._attempt = attempt
            self._attempt_open = True
            self._auto_session = True
            self._auto_record_last_error = ""
            if self._store is not None:
                self._store.update_quality(self._quality_payload_locked())
        self.get_logger().info(f"recording policy attempt {message.attempt_id}")

    def _attempt_finished(self, message: AttemptEvent) -> None:
        """Write the attempt's outcome into its own session, then stop that session."""
        with self._lock:
            store, attempt = self._store, self._attempt
            if (store is None or attempt is None or not self._attempt_open
                    or attempt["attempt_id"] != message.attempt_id):
                self._auto_record_counters["result_ignored"] += 1
                return
            finished = finished_attempt(
                attempt, outcome=message.outcome, succeeded=message.succeeded, reason=message.reason,
            )
            self._attempt = finished
            self._attempt_open = False
            store.record_attempt_outcome(finished, auto_tags=attempt_tags(finished))
        self._stop_session(success=True, reason=f"policy attempt ended: {finished['outcome']}")
```

- [ ] **Step 4: Run the ROS tests to see them pass**

Run: `humble "cd src/recording/realman_recording && python3 -m pytest -q test/test_recording_quality_ros_integration.py test/test_recording_service_ros_integration.py test/test_recording_process_recovery.py -p no:cacheprovider"`
Expected: PASS (all; `test_recording_process_recovery.py` may skip parts that need extra runtime)

- [ ] **Step 5: Configure the robot**

In `config/ros/recording.yaml`, under `/recording_recorder:` → `ros__parameters:`, right after the line `    auto_export_on_stop: false`, add:

```yaml
    # One session per policy attempt: realman_bt PolicyRun publishes START/RESULT on
    # /recording/attempt and the recorder opens/closes the session itself, through the
    # same serialized lifecycle path as /recording/manage. A session someone else started
    # (manual or Pika) is never interrupted; that attempt is just not recorded.
    auto_record_enabled: true
    auto_record_profile: policy_rollout
    # Seconds added to the attempt's own max_duration_sec before the recorder stops a
    # session whose RESULT never arrived (outcome no_result).
    auto_record_stop_margin_sec: 10
    # Attempt sessions export right away, unlike the manual sessions above (ADOPT_ALL).
    auto_record_adopt_on_stop: true
    # Policy rollouts go to their own LeRobot dataset so they never mix into teleop BC data.
    lerobot_profile_repo_ids: ["policy_rollout=realman/pi05-policy-rollouts"]
```

- [ ] **Step 6: Update the recording docs**

In `src/recording/README.md`, replace

```markdown
- 上游通过 ROS 2 Service 控制录制生命周期；Service 是唯一的录制控制入口。
```

with

```markdown
- 上游通过 ROS 2 Service `/recording/manage` 控制录制生命周期；唯一的例外是策略尝试：行为树 PolicyRun 在 `/recording/attempt` 上发 `START`/`RESULT`，recorder 用同一条串行的内部 START/STOP 路径为每次尝试录一个 session（`auto_record_*` 参数，可关闭），并且绝不打断别人开的 session。
```

and replace

```markdown
`/recording/manage` 是唯一的会话控制入口；录制平台不再提供 `recording/manage_session` Action。Web 保持纯只读，不创建任何控制客户端。
```

with

```markdown
`/recording/manage` 是人工和 Pika 的会话控制入口；策略尝试由 `/recording/attempt` 自动开录、停录（见上方边界说明）。录制平台不提供 `recording/manage_session` Action。Web 不创建任何录制控制客户端。
```

In `website/docs/development/recording-platform.md`, replace

```markdown
`/recording/manage` 是唯一的会话控制入口，类型为 `realman_recording_msgs/srv/ManageRecording`。录制平台不提供 `recording/manage_session` Action；网页也只读取状态，不发起录制控制：
```

with

```markdown
`/recording/manage` 是人工和 Pika 的会话控制入口，类型为 `realman_recording_msgs/srv/ManageRecording`。策略尝试另走 `/recording/attempt`（见下文“策略尝试自动录制与偏离打点”）。录制平台不提供 `recording/manage_session` Action；网页也只读取状态，不发起录制控制：
```

and insert this section right before the line `## 配置和运行`:

```markdown
## 策略尝试自动录制与偏离打点

行为树 PolicyRun 每次尝试在 `/recording/attempt` 上发两条 `AttemptEvent`：预检通过、准备激活策略时发 `START`，尝试结束（或被 halt）时发 `RESULT`。recorder 收到 `START` 后，用 `auto_record_profile`（默认 `policy_rollout`）走和 `/recording/manage` 相同的串行 START 路径开录，`duration_sec` 设为尝试的 `max_duration_sec` 加 `auto_record_stop_margin_sec`；收到同一个 `attempt_id` 的 `RESULT` 后写结果并停录，`auto_record_adopt_on_stop` 打开时立即 ADOPT 导出。

- 已经有 session 在录（人工或 Pika 开的）时，这次尝试不录，计数 `auto_record.ignored_busy`；预检失败也不录，原因写在 status 的 `auto_record_last_error`。尝试本身照常运行。
- 没收到 `RESULT` 就停录（超时、手动 STOP、节点退出）时，结果记为 `no_result`。
- `lerobot_profile_repo_ids` 按 profile 选导出数据集：`policy_rollout` 导出到 `realman/pi05-policy-rollouts`，其余 profile 仍用 `lerobot_repo_id`，策略数据不会混进遥操作数据集。

录制期间，:8765 的现场打点以 `QualityMark` 发到 `/recording/quality_mark`。recorder 把每条打点原样写进 MCAP，同时合成偏离区间，实时写进 `manifest.partial.json` 的 `quality` 块。尝试结果写进 `quality.attempt`，并作为机器写入的 `auto` 标签（`success`、`failure_reason`、`policy_task`、`attempt_id`）出现在标签编辑器里；人工标签仍然优先。派生标签 `deviation_count` 是区间条数，只读。完整的标注规范、回放修改方法和 sidecar 格式见[策略运行偏离标注](./quality-annotation)。
```

- [ ] **Step 7: Lint and commit**

Run: `lint && rec test/test_quality_events.py test/test_attempt_recording.py test/test_session_store_quality.py test/test_episode_tags_auto.py`
Expected: `All checks passed!` and PASS

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/recorder_node.py src/recording/realman_recording/test/test_recording_quality_ros_integration.py src/recording/realman_recording/test/test_recording_service_ros_integration.py config/ros/recording.yaml src/recording/README.md website/docs/development/recording-platform.md
git commit -m "feat(recording): record each policy attempt as its own session

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Recording Web API for intervals and the sidecar

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/web_server.py`
- Modify: `src/recording/realman_recording/realman_recording/web_bridge_node.py`
- Create: `src/recording/realman_recording/test/test_web_quality_events.py`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `session_document`, `build_sidecar`, `load_quality_reasons`, `QualityReason`, `QualityConflict` (Tasks 1–2); `SessionStore.update_quality_intervals` (Task 3).
- Produces (used by Task 9):
  - `GET /api/recording/{session_id}/quality_events` → `session_document` payload
  - `PUT /api/recording/{session_id}/quality_events` body `{"revision": int, "intervals": [...]}` → updated document; 400 invalid, 404 unknown session, 409 stale revision
  - `GET /api/lerobot/quality_events?repo_id=owner/dataset` → sidecar JSON with `Content-Disposition: attachment; filename="episode_quality_events.json"`; 400 bad repo id
  - `RecordingWebServer(..., quality_reasons=())` keyword; bridge parameter `quality_reasons_path`

- [ ] **Step 1: Write the failing test**

`src/recording/realman_recording/test/test_web_quality_events.py`:

```python
"""HTTP contracts for deviation intervals and the sidecar export."""
from __future__ import annotations

import asyncio
import json

import pytest

FIRST = 1_790_000_000_000_000_000


def write_session(root, session_id="s1"):
    directory = root / session_id
    (directory / "export").mkdir(parents=True)
    (directory / "manifest.json").write_text(json.dumps({
        "session_id": session_id, "state": "READY", "decision": "ADOPTED",
        "started_realtime_ns": FIRST - 500_000_000, "ended_realtime_ns": FIRST + 3_000_000_000,
        "export": {"state": "SUCCEEDED"},
        "quality": {"revision": 0, "attempt": {"attempt_id": "policy_attempt_x", "outcome": "dropped"},
                    "intervals": [{"start_ns": str(FIRST + 150_000_000), "end_ns": str(FIRST + 450_000_000),
                                   "reason": "grasp_miss", "source": "live"}],
                    "rejected_marks": 0},
    }), encoding="utf-8")
    (directory / "export" / "lerobot-v3.json").write_text(json.dumps({
        "repo_id": "realman/pi05-policy-rollouts", "fps": 10, "episode_index": 3,
        "first_walltime_ns": FIRST, "frame_count": 20,
    }), encoding="utf-8")


def test_quality_api_reads_edits_and_exports(tmp_path):
    pytest.importorskip("aiohttp")
    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer
    from realman_recording.quality_events import QualityReason
    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "recordings"
    write_session(root)
    server = object.__new__(RecordingWebServer)
    server._recording_root = root.resolve()
    server._quality_reasons = (QualityReason("grasp_miss", "抓偏"), QualityReason("stall", "卡住犹豫"))
    app = web.Application(client_max_size=16_384)
    app.router.add_get("/api/lerobot/quality_events", server._quality_sidecar)
    app.router.add_get("/api/recording/{session_id}/quality_events", server._quality_get)
    app.router.add_put("/api/recording/{session_id}/quality_events", server._quality_put)
    edit = {"start_ns": str(FIRST + 200_000_000), "end_ns": str(FIRST + 500_000_000),
            "reason": "stall", "source": "live"}

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            current = await (await client.get("/api/recording/s1/quality_events")).json()
            assert current["revision"] == 0
            assert current["frames"] == {"fps": 10.0, "first_walltime_ns": str(FIRST), "frame_count": 20}
            assert (current["intervals"][0]["start_frame"], current["intervals"][0]["end_frame"]) == (2, 4)
            assert [reason["id"] for reason in current["reasons"]] == ["grasp_miss", "stall"]

            saved = await client.put("/api/recording/s1/quality_events", json={"revision": 0, "intervals": [edit]})
            assert saved.status == 200
            document = await saved.json()
            assert document["revision"] == 1
            assert document["intervals"][0]["source"] == "replay"
            assert (document["intervals"][0]["start_frame"], document["intervals"][0]["end_frame"]) == (2, 4)

            stale = await client.put("/api/recording/s1/quality_events", json={"revision": 0, "intervals": [edit]})
            assert stale.status == 409
            bad = await client.put("/api/recording/s1/quality_events", json={
                "revision": 1, "intervals": [{"start_ns": "5", "end_ns": None, "reason": None, "source": "live"}],
            })
            assert bad.status == 400
            not_json = await client.put("/api/recording/s1/quality_events", data="{")
            assert not_json.status == 400
            assert (await client.get("/api/recording/nope/quality_events")).status == 404

            sidecar = await client.get("/api/lerobot/quality_events", params={"repo_id": "realman/pi05-policy-rollouts"})
            assert sidecar.status == 200
            assert "episode_quality_events.json" in sidecar.headers["Content-Disposition"]
            assert list((await sidecar.json())["episodes"]) == ["3"]
            assert (await client.get("/api/lerobot/quality_events", params={"repo_id": "bad"})).status == 400
        finally:
            await client.close()

    asyncio.run(run())
```

- [ ] **Step 2: Run it to see it fail**

Run: `rec test/test_web_quality_events.py`
Expected: FAIL with `AttributeError: ... has no attribute '_quality_sidecar'`

- [ ] **Step 3: Implement the endpoints**

In `web_server.py`:

1. Add `import time` after `import threading`, and after `from .session_store import SessionStore` add:

```python
from .quality_events import QualityConflict, QualityReason, build_sidecar, session_document
```

2. Add a keyword parameter to `RecordingWebServer.__init__` after `export_all: Callable[[], dict[str, Any]] | None = None,`:

```python
        quality_reasons: tuple[QualityReason, ...] = (),
```

and store it after `self._export_all = export_all`:

```python
        self._quality_reasons = tuple(quality_reasons)
```

3. Register the routes. After `app.router.add_get("/api/lerobot/pending", self._lerobot_pending)` add:

```python
        app.router.add_get("/api/lerobot/quality_events", self._quality_sidecar)
```

and after `app.router.add_put("/api/recording/{session_id}/tags", self._tags_put)` add:

```python
        app.router.add_get("/api/recording/{session_id}/quality_events", self._quality_get)
        app.router.add_put("/api/recording/{session_id}/quality_events", self._quality_put)
```

4. Add the handlers right after `_lerobot_subtasks_update`:

```python
    async def _quality_get(self, request: Any) -> Any:
        """Deviation intervals of one finalized session, with frames and the reason list."""
        from aiohttp import web
        try:
            directory = self._session_directory(request.match_info["session_id"])
            document = await asyncio.to_thread(session_document, directory, self._quality_reasons)
        except (OSError, ValueError) as error:
            raise web.HTTPNotFound(text=str(error)) from error
        return web.json_response(document)

    async def _quality_put(self, request: Any) -> Any:
        """Replace one session's deviation intervals (compare-and-set on ``revision``)."""
        from aiohttp import web
        body = await self._tag_body(request)
        try:
            directory = self._session_directory(request.match_info["session_id"])
        except ValueError as error:
            raise web.HTTPNotFound(text=str(error)) from error
        try:
            await asyncio.to_thread(
                SessionStore.update_quality_intervals, directory, body.get("intervals"), body.get("revision"),
                reasons=[reason.id for reason in self._quality_reasons],
            )
            document = await asyncio.to_thread(session_document, directory, self._quality_reasons)
        except QualityConflict as error:
            raise web.HTTPConflict(text=str(error)) from error
        except ValueError as error:
            raise web.HTTPBadRequest(text=str(error)) from error
        except OSError as error:
            raise web.HTTPNotFound(text=str(error)) from error
        return web.json_response(document)

    async def _quality_sidecar(self, request: Any) -> Any:
        """``episode_quality_events.json`` for one exported dataset, as a download."""
        from aiohttp import web
        repo_id = request.query.get("repo_id", "")
        if "/" not in repo_id:
            raise web.HTTPBadRequest(text="repo_id must be an owner/dataset identifier")
        sidecar = await asyncio.to_thread(
            build_sidecar, self._recording_root, repo_id, generated_at_ns=time.time_ns(),
        )
        return web.json_response(
            sidecar, headers={"Content-Disposition": 'attachment; filename="episode_quality_events.json"'},
        )
```

5. In `web_bridge_node.py`, add the import after `from .web_server import RecordingWebServer`:

```python
from .quality_events import load_quality_reasons
```

declare the parameter after `self.declare_parameter("lerobot_export_dir", "/data/realman-recordings/lerobot")`:

```python
        # Deviation reasons shown and accepted by the replay editor (same file as the recorder).
        self.declare_parameter("quality_reasons_path", str(config_root / "recording" / "quality_reasons.yaml"))
```

and immediately before `self._server = RecordingWebServer(` add:

```python
        try:
            quality_reasons = load_quality_reasons(str(self.get_parameter("quality_reasons_path").value))
        except Exception as error:  # noqa: BLE001 - replay still works without reasons
            self.get_logger().error(f"deviation reasons unavailable: {error}")
            quality_reasons = ()
```

then add `quality_reasons=quality_reasons,` as the last keyword argument of the `RecordingWebServer(...)` call.

- [ ] **Step 4: Run the tests to see them pass**

Run: `rec test/test_web_quality_events.py test/test_web_episode_tags.py test/test_subtask_annotation.py test/test_web_server.py`
Expected: PASS

- [ ] **Step 5: Add to CI, lint and commit**

In `.github/workflows/ci.yml`, after the Task 5 line, add:

```yaml
            src/recording/realman_recording:test/test_web_quality_events.py \
```

Run: `lint`
Expected: `All checks passed!`

```bash
cd "$WT" && git add src/recording/realman_recording/realman_recording/web_server.py src/recording/realman_recording/realman_recording/web_bridge_node.py src/recording/realman_recording/test/test_web_quality_events.py .github/workflows/ci.yml
git commit -m "feat(recording): serve deviation intervals and the sidecar from the recording web

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Replay page deviation editor

**Files:**
- Create: `src/recording/realman_recording/web/src/replay/quality.ts`
- Modify: `src/recording/realman_recording/web/index.html`
- Modify: `src/recording/realman_recording/web/src/main.ts`
- Modify: `src/recording/realman_recording/web/src/styles.css`
- Modify: `src/recording/realman_recording/web/src/replay/tags.ts`
- Modify: `website/tests/recording-replay.spec.ts`
- Rebuild: `src/recording/realman_recording/realman_recording/static/**`

**Interfaces:**
- Consumes: Task 8 endpoints; `sidebar.getSession(id)?.repo_id`; `notify(message, error)` in `main.ts`.
- Produces: `initQuality(callbacks: { getCurrentFrame(): number; getRepoId(): string | null; notify(message: string, error?: boolean): void }): { load(sessionId: string): void; clear(): void; onFrameChange(frameIndex: number): void }`.

- [ ] **Step 1: Write the failing Playwright test**

Append to `website/tests/recording-replay.spec.ts`:

```ts
test("replay marks deviation intervals on frames and saves them in nanoseconds", async ({ page }) => {
  const first = 1_790_000_000_000_000_000n;
  const step = 100_000_000n;
  const reasons = [{ id: "grasp_miss", label: "抓偏" }, { id: "stall", label: "卡住犹豫" }];
  const saved: any[] = [];
  let revision = 0;
  const frameOf = (ns: string | null) => (ns === null ? null : Number((BigInt(ns) - first + step - 1n) / step));
  const documentFor = (intervals: any[]) => ({
    session_id: "episode-q", revision, attempt: { attempt_id: "policy_attempt_x", outcome: "dropped", succeeded: false },
    frames: { fps: 10, first_walltime_ns: first.toString(), frame_count: 4 }, reasons,
    intervals: intervals.map((item) => ({
      ...item, source: "replay", start_frame: frameOf(item.start_ns),
      end_frame: item.end_ns === null ? 3 : (frameOf(item.end_ns) as number) - 1,
    })),
  });
  await page.route("**/api/lerobot", (route) => route.fulfill({ json: { sessions: [
    { session_id: "episode-q", repo_id: "realman/pi05-policy-rollouts", episode_index: 0, frames: 4, fps: 10,
      task: "pick_only", quality: { invalid_frames: 0 } },
  ] } }));
  await page.route("**/api/lerobot/episode-q/summary", (route) => route.fulfill({ json: {
    features: { "observation.images.front": { dtype: "video", shape: [] } }, quality: { invalid_frames: 0 }, canonical: {},
  } }));
  await page.route("**/api/lerobot/episode-q/frames", (route) => route.fulfill({ json: { frames: [0, 1, 2, 3].map((index) => ({
    frame_index: index, timestamp_ns: 1_000_000_000 + index * 100_000_000, state: Array(21).fill(0), action: [], features: {},
    cameras: { front: true },
  })) } }));
  await page.route("**/api/lerobot/episode-q/video/*", (route) => route.fulfill({ status: 200, contentType: "video/mp4", body: "" }));
  await page.route("**/api/lerobot/episode-q/subtasks", (route) => route.fulfill({ json: { subtasks: [] } }));
  await page.route("**/api/recording/episode-q/quality_events", async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      saved.push(body);
      expect(body.revision).toBe(revision);
      revision += 1;
      await route.fulfill({ json: documentFor(body.intervals) });
    } else {
      await route.fulfill({ json: documentFor([]) });
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "回放" }).click();
  await page.locator('.episode-item[data-session="episode-q"] .episode-main').click();
  await expect(page.locator("#replay-frame-label")).toHaveText("1 / 4");
  await page.locator("#quality-toggle").click();
  await expect(page.locator("#quality-attempt")).toContainText("policy_attempt_x");

  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#replay-frame-label")).toHaveText("2 / 4");
  await page.keyboard.press("d");
  await expect.poll(() => saved.length).toBe(1);
  expect(saved[0].intervals).toEqual([
    { start_ns: (first + step).toString(), end_ns: null, reason: null, source: "replay" },
  ]);
  await expect(page.locator("#quality-track .quality-band.open")).toHaveCount(1);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#replay-frame-label")).toHaveText("4 / 4");
  await page.keyboard.press("d");
  await expect.poll(() => saved.length).toBe(2);
  expect(saved[1].intervals).toEqual([
    { start_ns: (first + step).toString(), end_ns: (first + 4n * step).toString(), reason: null, source: "replay" },
  ]);

  await page.locator("#quality-list .quality-reason").selectOption("stall");
  await expect.poll(() => saved.length).toBe(3);
  expect(saved[2].intervals[0].reason).toBe("stall");
  expect(saved[2].intervals[0].start_ns).toBe((first + step).toString());

  // The reason <select> may still hold focus, and keys typed into a field never edit intervals.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Delete");
  await expect.poll(() => saved.length).toBe(4);
  expect(saved[3].intervals).toEqual([]);
  await expect(page.locator("#quality-track .quality-band")).toHaveCount(0);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd "$WT/website" && npx playwright install chromium && npx playwright test --config ../config/recording/playwright.config.mjs --project recording-replay -g "deviation intervals"`
Expected: FAIL (`#quality-toggle` not found)

- [ ] **Step 3: Write the editor module**

`src/recording/realman_recording/web/src/replay/quality.ts`:

```ts
// Deviation intervals on the replay timeline (偏离标注). The manifest's quality block is the
// authority and stores nanosecond bounds; this editor works in frames of the exported episode and
// converts with the exporter's integer grid, first_walltime_ns + i * round(1e9 / fps), in BigInt
// so epoch nanoseconds keep their precision. The server decides each saved interval's source (an
// unchanged live interval stays "live").
//
// Keys, only while the 偏离 editor is on and never while typing in a field:
//   D       outside an interval: start one on this frame (it runs to the next interval, or stays
//           open to the end); inside an interval: end it on this frame
//   [ / ]   move the start / end of the interval under the cursor to this frame; outside any
//           interval, [ moves the next interval's start and ] the previous interval's end
//   Delete  remove the interval under the cursor

export type QualityReason = { id: string; label: string };
type ServerInterval = {
  start_ns: string;
  end_ns: string | null;
  reason: string | null;
  source: string;
  start_frame: number | null;
  end_frame: number | null;
};
type QualityDocument = {
  session_id: string;
  revision: number;
  attempt: { attempt_id?: string; outcome?: string | null; succeeded?: boolean | null } | null;
  intervals: ServerInterval[];
  frames: { fps: number; first_walltime_ns: string; frame_count: number } | null;
  reasons: QualityReason[];
};
type EditInterval = {
  start: number | null; // null: the interval lies outside the exported frames
  end: number | null; // null with a start: open to the last frame
  reason: string | null;
  source: string;
  startNs: string;
  endNs: string | null;
  boundsChanged: boolean;
};
type SavedInterval = { start_ns: string; end_ns: string | null; reason: string | null; source: string };

export type QualityCallbacks = {
  getCurrentFrame(): number;
  getRepoId(): string | null;
  notify(message: string, error?: boolean): void;
};

export type QualityApi = {
  load(sessionId: string): void;
  clear(): void;
  onFrameChange(frameIndex: number): void;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function initQuality(callbacks: QualityCallbacks): QualityApi {
  const toggleBtn = $<HTMLButtonElement>("#quality-toggle");
  const exportBtn = $<HTMLButtonElement>("#quality-export");
  const statusEl = $("#quality-status");
  const track = $("#quality-track");
  const panel = $("#quality-panel");
  const attemptEl = $("#quality-attempt");
  const listEl = $("#quality-list");

  let sessionId: string | null = null;
  let doc: QualityDocument | null = null;
  let intervals: EditInterval[] = [];
  let enabled = false;
  // Bumped on every local change so a save's response never replaces a newer local edit.
  let editVersion = 0;
  // Saves are serialized; each one sends the newest local list with the newest revision.
  let saveChain: Promise<void> = Promise.resolve();

  function frameCount(): number {
    return doc?.frames?.frame_count ?? 0;
  }
  function endOf(item: EditInterval): number {
    return item.end ?? frameCount() - 1;
  }
  function frameNs(frame: number): string {
    const frames = doc!.frames!;
    const step = BigInt(Math.round(1e9 / frames.fps));
    return (BigInt(frames.first_walltime_ns) + BigInt(frame) * step).toString();
  }
  function startKey(item: EditInterval): bigint {
    return BigInt(item.boundsChanged && item.start !== null ? frameNs(item.start) : item.startNs);
  }
  function active(): boolean {
    return enabled && sessionId !== null && doc?.frames != null;
  }
  function editable(): EditInterval[] {
    return intervals.filter((item) => item.start !== null);
  }
  function containing(frame: number): EditInterval | undefined {
    return editable().find((item) => item.start! <= frame && frame <= endOf(item));
  }

  function fromDocument(next: QualityDocument): void {
    doc = next;
    intervals = next.intervals.map((item) => ({
      start: item.start_frame,
      end: item.end_ns === null ? null : item.end_frame,
      reason: item.reason,
      source: item.source,
      startNs: item.start_ns,
      endNs: item.end_ns,
      boundsChanged: false,
    }));
  }

  function renderTrack(): void {
    const count = frameCount();
    track.innerHTML = count > 0
      ? editable().map((item) => {
        const left = (item.start! / count) * 100;
        const width = ((endOf(item) - item.start! + 1) / count) * 100;
        return `<span class="quality-band${item.end === null ? " open" : ""}" style="left:${left}%;width:${width}%"></span>`;
      }).join("")
      : "";
  }

  function renderStatus(): void {
    if (!sessionId || !doc) {
      statusEl.textContent = "";
      return;
    }
    if (!doc.frames) {
      statusEl.textContent = "该 Episode 还没有导出，不能按帧标注";
      return;
    }
    if (!enabled) {
      statusEl.textContent = `${intervals.length} 段偏离`;
      return;
    }
    const frame = callbacks.getCurrentFrame();
    statusEl.innerHTML = containing(frame)
      ? `第 ${frame} 帧在偏离区间内 · <b>D</b> 结束于此帧 · <b>[</b> <b>]</b> 改起止 · <b>Delete</b> 删除`
      : `第 ${frame} 帧 · <b>D</b> 从此帧开始偏离 · <b>[</b> <b>]</b> 延伸最近一段`;
  }

  function renderList(): void {
    const attempt = doc?.attempt;
    attemptEl.textContent = attempt
      ? `尝试 ${attempt.attempt_id ?? "—"} · ${attempt.outcome ?? "进行中"}${attempt.succeeded === true ? " · 成功" : attempt.succeeded === false ? " · 失败" : ""}`
      : "非策略录制";
    const reasons = doc?.reasons ?? [];
    listEl.innerHTML = intervals.length
      ? intervals.map((item, index) => {
        const range = item.start === null ? "超出回放范围" : `${item.start} – ${item.end === null ? "结尾" : item.end}`;
        const options = [
          '<option value="">未填原因</option>',
          ...reasons.map((reason) =>
            `<option value="${escapeHtml(reason.id)}"${reason.id === item.reason ? " selected" : ""}>${escapeHtml(reason.label)}</option>`),
        ].join("");
        return `<div class="quality-row"><span class="quality-range">${range}</span><select class="quality-reason" data-index="${index}" aria-label="偏离原因">${options}</select><span class="quality-source">${item.source === "live" ? "现场" : "回放"}</span><button class="quality-remove" data-index="${index}" title="删除该段">×</button></div>`;
      }).join("")
      : '<div class="annotation-empty">暂无偏离区间</div>';
  }

  function render(): void {
    toggleBtn.textContent = enabled ? "退出偏离标注" : "偏离";
    toggleBtn.classList.toggle("active", enabled);
    panel.hidden = !(enabled && sessionId !== null && doc !== null);
    renderTrack();
    renderStatus();
    if (!panel.hidden) renderList();
  }

  function payload(): SavedInterval[] {
    return intervals.map((item) => {
      if (!item.boundsChanged || item.start === null) {
        return { start_ns: item.startNs, end_ns: item.endNs, reason: item.reason, source: item.source };
      }
      return {
        start_ns: frameNs(item.start),
        end_ns: item.end === null ? null : frameNs(item.end + 1),
        reason: item.reason,
        source: "replay",
      };
    });
  }

  async function doSave(): Promise<void> {
    if (!sessionId || !doc) return;
    const owner = sessionId;
    const versionAtStart = editVersion;
    const response = await fetch(`/api/recording/${encodeURIComponent(owner)}/quality_events`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: doc.revision, intervals: payload() }),
    });
    if (response.status === 409) {
      callbacks.notify("偏离区间已在别处修改，已重新加载", true);
      if (sessionId === owner) await load(owner);
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const next = (await response.json()) as QualityDocument;
    if (sessionId !== owner) return;
    if (editVersion === versionAtStart) fromDocument(next);
    else if (doc) doc.revision = next.revision;
    render();
    callbacks.notify("偏离区间已保存");
  }

  function save(): void {
    saveChain = saveChain
      .then(() => doSave())
      .catch((error) => {
        callbacks.notify(`保存偏离区间失败: ${String(error)}`, true);
        if (sessionId) void load(sessionId);
      });
  }

  function changed(): void {
    intervals.sort((a, b) => (startKey(a) < startKey(b) ? -1 : startKey(a) > startKey(b) ? 1 : 0));
    editVersion += 1;
    render();
    save();
  }

  function toggleAt(frame: number): void {
    const inside = containing(frame);
    if (inside) {
      inside.end = frame;
      inside.boundsChanged = true;
      changed();
      return;
    }
    const next = editable().filter((item) => item.start! > frame).sort((a, b) => a.start! - b.start!)[0];
    intervals.push({
      start: frame, end: next ? next.start! - 1 : null, reason: null, source: "replay",
      startNs: "", endNs: null, boundsChanged: true,
    });
    changed();
  }

  function setStart(frame: number): void {
    const target = containing(frame) ?? editable().filter((item) => item.start! > frame).sort((a, b) => a.start! - b.start!)[0];
    if (!target) {
      callbacks.notify("后面没有偏离区间可改起点", true);
      return;
    }
    const previous = editable().filter((item) => item !== target && item.start! < target.start!).sort((a, b) => b.start! - a.start!)[0];
    if (previous && endOf(previous) >= frame) {
      callbacks.notify("起点不能落进前一段偏离", true);
      return;
    }
    if (frame > endOf(target)) {
      callbacks.notify("起点不能晚于终点", true);
      return;
    }
    target.start = frame;
    target.boundsChanged = true;
    changed();
  }

  function setEnd(frame: number): void {
    const target = containing(frame) ?? editable().filter((item) => endOf(item) < frame).sort((a, b) => b.start! - a.start!)[0];
    if (!target) {
      callbacks.notify("前面没有偏离区间可改终点", true);
      return;
    }
    const following = editable().filter((item) => item !== target && item.start! > target.start!).sort((a, b) => a.start! - b.start!)[0];
    if (following && following.start! <= frame) {
      callbacks.notify("终点不能落进后一段偏离", true);
      return;
    }
    if (frame < target.start!) {
      callbacks.notify("终点不能早于起点", true);
      return;
    }
    target.end = frame;
    target.boundsChanged = true;
    changed();
  }

  function removeAt(index: number): void {
    if (index < 0 || index >= intervals.length) return;
    intervals.splice(index, 1);
    changed();
  }

  async function load(nextSessionId: string): Promise<void> {
    sessionId = nextSessionId;
    doc = null;
    intervals = [];
    editVersion += 1;
    const versionAtLoad = editVersion;
    render();
    try {
      const response = await fetch(`/api/recording/${encodeURIComponent(nextSessionId)}/quality_events`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = (await response.json()) as QualityDocument;
      if (sessionId !== nextSessionId || editVersion !== versionAtLoad) return;
      fromDocument(next);
    } catch (error) {
      if (sessionId !== nextSessionId) return;
      callbacks.notify(`加载偏离区间失败: ${String(error)}`, true);
    }
    render();
  }

  function clear(): void {
    sessionId = null;
    doc = null;
    intervals = [];
    editVersion += 1;
    render();
  }

  toggleBtn.addEventListener("click", () => {
    if (!sessionId) {
      callbacks.notify("请先选择一个 Episode", true);
      return;
    }
    enabled = !enabled;
    render();
  });
  exportBtn.addEventListener("click", () => {
    const repoId = callbacks.getRepoId();
    if (!repoId) {
      callbacks.notify("请先选择一个已导出的 Episode", true);
      return;
    }
    const link = document.createElement("a");
    link.href = `/api/lerobot/quality_events?repo_id=${encodeURIComponent(repoId)}`;
    link.download = "episode_quality_events.json";
    link.click();
  });
  listEl.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    if (!target.matches(".quality-reason")) return;
    const item = intervals[Number(target.dataset.index)];
    if (!item) return;
    item.reason = target.value || null;
    editVersion += 1;
    save();
  });
  listEl.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".quality-remove");
    if (target) removeAt(Number(target.dataset.index));
  });
  // D, [, ] and Delete are disjoint from video.ts (arrows, space) and annotation.ts (Q/R).
  document.addEventListener("keydown", (event) => {
    if (!active() || event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
    const frame = callbacks.getCurrentFrame();
    if (event.key === "d" || event.key === "D") {
      event.preventDefault();
      toggleAt(frame);
    } else if (event.key === "[") {
      event.preventDefault();
      setStart(frame);
    } else if (event.key === "]") {
      event.preventDefault();
      setEnd(frame);
    } else if (event.key === "Delete") {
      const inside = containing(frame);
      if (inside) {
        event.preventDefault();
        removeAt(intervals.indexOf(inside));
      }
    }
  });

  render();

  return {
    load: (nextSessionId) => {
      void load(nextSessionId);
    },
    clear,
    onFrameChange: () => {
      renderStatus();
    },
  };
}
```

- [ ] **Step 4: Add the markup**

In `src/recording/realman_recording/web/index.html` (the `replay-timeline` section is one long line), replace

```html
<input id="replay-slider" type="range" min="0" max="0" value="0" step="1">
```

with

```html
<input id="replay-slider" type="range" min="0" max="0" value="0" step="1"><div id="quality-track" class="quality-track" aria-label="偏离区间"></div>
```

and replace

```html
取消当前段</button></div></div></section>
```

with

```html
取消当前段</button></div></div><div class="quality-bar"><button id="quality-toggle" type="button" title="编辑偏离区间：D 开始/结束，[ ] 改起止，Delete 删除">偏离</button><span id="quality-status" class="quality-status"></span><button id="quality-export" type="button" title="下载当前数据集的 episode_quality_events.json">导出偏离标注</button></div><div id="quality-panel" class="quality-panel" hidden><div id="quality-attempt" class="quality-attempt"></div><div id="quality-list" class="quality-list"></div></div></section>
```

- [ ] **Step 5: Wire it into the page**

In `src/recording/realman_recording/web/src/main.ts`:

1. After `import { initAnnotation } from "./replay/annotation";` add:

```ts
import { initQuality } from "./replay/quality";
```

2. In `selectReplaySession`, after `void annotation.load(sessionId);` add:

```ts
    quality.load(sessionId);
```

3. In `exitReplay`, after `annotation.clear();` add:

```ts
  quality.clear();
```

4. In `renderReplayFrame`, after `annotation.onFrameChange(frameIndex);` add:

```ts
  quality.onFrameChange(frameIndex);
```

5. After the `const annotation = initAnnotation({ ... });` statement add:

```ts
const quality = initQuality({
  getCurrentFrame: () => replay?.index ?? 0,
  getRepoId: () => (replay ? sidebar.getSession(replay.session)?.repo_id ?? null : null),
  notify,
});
```

- [ ] **Step 6: Style it**

Append to `src/recording/realman_recording/web/src/styles.css`:

```css
.replay-timeline .quality-track{position:relative;height:6px;margin-top:6px;background:#101826;border-radius:3px;overflow:hidden}
.replay-timeline .quality-band{position:absolute;top:0;bottom:0;background:var(--red);opacity:.85}
.replay-timeline .quality-band.open{background:repeating-linear-gradient(135deg,var(--red) 0 4px,transparent 4px 8px)}
.replay-timeline .quality-bar{display:flex;align-items:center;gap:10px;margin-top:9px;padding-top:9px;border-top:1px solid var(--line)}
.replay-timeline .quality-bar button{background:#1c2d45;color:var(--text);border:1px solid #2b4665;border-radius:6px;padding:5px 12px;cursor:pointer;font:11px inherit}
.replay-timeline .quality-bar button.active{border-color:var(--red);color:var(--red)}
.replay-timeline .quality-status{flex:1;color:var(--muted);font:11px ui-monospace,Menlo,monospace}
.replay-timeline .quality-status b{color:var(--amber);font-weight:600}
.replay-timeline .quality-panel{display:none;margin-top:9px}
.replay-timeline .quality-panel:not([hidden]){display:block}
.replay-timeline .quality-attempt{color:var(--muted);font:11px ui-monospace,Menlo,monospace;margin-bottom:6px}
.replay-timeline .quality-list{display:grid;gap:5px;max-height:150px;overflow:auto}
.replay-timeline .quality-row{display:flex;align-items:center;gap:8px;background:#0d1420;border:1px solid #202c40;border-radius:6px;padding:6px 9px;font:11px ui-monospace,Menlo,monospace}
.replay-timeline .quality-range{min-width:84px}
.replay-timeline .quality-source{color:var(--muted)}
.replay-timeline .quality-remove{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px}
@media (max-width:720px){.replay-timeline .quality-bar{flex-wrap:wrap}.replay-timeline .quality-status{flex-basis:100%}}
```

- [ ] **Step 7: Keep derived and machine-written tags honest in the tag editor**

In `src/recording/realman_recording/web/src/replay/tags.ts`, inside `makeRow`, replace

```ts
    input.classList.add("tag-value"); if (!input.isConnected) row.append(input);
    const origin = document.createElement("small"); origin.textContent = source === "manual" ? "人工" : source === "derived" ? "自动日期" : "默认";
    row.append(origin);
    if (sessionId) {
```

with

```ts
    input.classList.add("tag-value"); if (!input.isConnected) row.append(input);
    // deviation_count is derived from the deviation intervals: shown, never edited here.
    const derived = source === "derived" && key !== "date";
    if (derived) {
      row.dataset.derived = "true";
      input.disabled = true;
      row.querySelector<HTMLSelectElement>(".tag-type")?.setAttribute("disabled", "");
    }
    const origin = document.createElement("small");
    origin.textContent = source === "manual" ? "人工" : source === "derived" ? (key === "date" ? "自动日期" : "自动派生")
      : source === "auto" ? "机器写入" : "默认";
    row.append(origin);
    if (sessionId && !derived) {
```

and in `collect()`, make the loop skip derived rows: replace

```ts
    for (const row of fields.querySelectorAll<HTMLElement>(".tag-row")) {
      const keyInput = row.querySelector<HTMLInputElement>(".tag-key");
```

with

```ts
    for (const row of fields.querySelectorAll<HTMLElement>(".tag-row")) {
      if (row.dataset.derived === "true") continue;
      const keyInput = row.querySelector<HTMLInputElement>(".tag-key");
```

- [ ] **Step 8: Build and run the test to see it pass**

Run: `cd "$WT/website" && npm run build:recording && npx playwright test --config ../config/recording/playwright.config.mjs`
Expected: build succeeds; all recording-replay tests PASS on both projects (desktop and mobile)

- [ ] **Step 9: Commit (sources and the rebuilt bundle)**

```bash
cd "$WT" && git add src/recording/realman_recording/web src/recording/realman_recording/realman_recording/static website/tests/recording-replay.spec.ts
git status --short src/recording/realman_recording/realman_recording/static   # deleted old assets must be staged too
git commit -m "feat(recording): edit deviation intervals on the replay timeline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: PolicyRun announces each attempt on `/recording/attempt`

**Files:**
- Modify: `src/behavior/realman_bt/package.xml`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Modify: `src/behavior/realman_bt/include/realman_bt/policy_run_node.hpp`
- Modify: `src/behavior/realman_bt/src/policy_run_node.cpp`
- Modify: `src/behavior/realman_bt/test/test_policy_run_node.cpp`
- Modify: `website/docs/development/policy-task.md`

**Interfaces:**
- Consumes: `realman_recording_msgs/msg/AttemptEvent` (Task 6).
- Produces: `START` when the preflight passes (entering arming), with `attempt_id` = trace file stem, `max_duration_sec = ceil(max_attempt_sec + 4 * service_call_timeout_sec + router_release_sec)`; `RESULT` from `finalize()` (`outcome = outcomeName`, `succeeded`, `reason`) or `onHalted()` (`outcome = "halted"`). Nothing for a dry run or a failed preflight; at most one RESULT per START.

- [ ] **Step 1: Write the failing tests**

In `src/behavior/realman_bt/test/test_policy_run_node.cpp`:

1. After `#include "realman_bt/policy_task_config.hpp"` add:

```cpp
#include "realman_recording_msgs/msg/attempt_event.hpp"
```

2. In `FakeStack`'s constructor, after the `prompt_sub = ...;` statement add:

```cpp
    // Like the recorder: collects PolicyRun's attempt announcements.
    attempt_sub = node->create_subscription<realman_recording_msgs::msg::AttemptEvent>(
        "/recording/attempt", rclcpp::QoS(10).reliable(),
        [this](realman_recording_msgs::msg::AttemptEvent::ConstSharedPtr message) {
          attempts.push_back(*message);
        });
```

3. In `FakeStack`'s members, after `rclcpp::Subscription<std_msgs::msg::String>::SharedPtr prompt_sub;` add:

```cpp
  rclcpp::Subscription<realman_recording_msgs::msg::AttemptEvent>::SharedPtr attempt_sub;
  std::vector<realman_recording_msgs::msg::AttemptEvent> attempts;
```

4. Add these tests before `}  // namespace` (above `int main`):

```cpp
// ---- announcements for the recorder -----------------------------------------------------------

using AttemptEvent = realman_recording_msgs::msg::AttemptEvent;

void testASuccessfulAttemptIsAnnouncedForTheRecorder() {
  Fixture f;
  f.stack.serve();
  GraspScenario scenario(true);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);
  f.settle();

  assert(f.stack.attempts.size() == 2);
  const auto& start = f.stack.attempts[0];
  const auto& result = f.stack.attempts[1];
  assert(start.kind == AttemptEvent::START);
  assert(result.kind == AttemptEvent::RESULT);
  assert(start.attempt_id == result.attempt_id);
  assert(start.attempt_id.rfind("policy_attempt_", 0) == 0);
  assert(start.task == "place");
  assert(start.arm == "r");
  assert(start.prompt == kPlacePrompt);
  assert(start.max_duration_sec >= static_cast<uint32_t>(f.config.max_attempt_sec));
  assert(result.outcome == "released_held");
  assert(result.succeeded);
  // The id names the attempt's trace file, so a recording and its trace can be matched.
  bool trace_found = false;
  for (const auto& entry : fs::directory_iterator(f.config.trace.dir)) {
    if (entry.path().stem().string() == start.attempt_id) trace_found = true;
  }
  assert(trace_found);
}

void testARetryableFailureIsAnnouncedWithItsOutcome() {
  PolicyTaskConfig config = fastConfig();
  config.max_attempt_sec = 0.8;
  Fixture f(false, config);
  f.stack.serve();

  assert(f.run(5s) == NodeStatus::FAILURE);
  f.settle();

  assert(f.stack.attempts.size() == 2);
  assert(f.stack.attempts[1].outcome == "timeout");
  assert(!f.stack.attempts[1].succeeded);
  assert(!f.stack.attempts[1].reason.empty());
}

void testAFailedPreflightAnnouncesNothing() {
  Fixture f;
  f.stack.serve(true, true, true, /*router_estop=*/false);

  assert(f.run(3s) == NodeStatus::FAILURE);
  f.settle();

  assert(f.stack.attempts.empty());
}

void testAHaltedAttemptIsAnnouncedAsHaltedOnce() {
  Fixture f;
  f.stack.serve();
  assert(f.run(4s, nullptr, [&](NodeStatus) { return f.stack.activated(); }) ==
         NodeStatus::RUNNING);

  f.node->halt();
  f.settle();
  f.node->halt();  // halting again announces nothing more
  f.settle();

  assert(f.stack.attempts.size() == 2);
  assert(f.stack.attempts[1].kind == AttemptEvent::RESULT);
  assert(f.stack.attempts[1].outcome == "halted");
  assert(!f.stack.attempts[1].succeeded);
}

void testADryRunAnnouncesNothing() {
  Fixture f(true);
  f.stack.serve();

  assert(f.run(1s) == NodeStatus::SUCCESS);
  f.settle();

  assert(f.stack.attempts.empty());
}
```

5. In `main`, before `rclcpp::shutdown();`, add:

```cpp
  testASuccessfulAttemptIsAnnouncedForTheRecorder();
  testARetryableFailureIsAnnouncedWithItsOutcome();
  testAFailedPreflightAnnouncesNothing();
  testAHaltedAttemptIsAnnouncedAsHaltedOnce();
  testADryRunAnnouncesNothing();
```

6. In `src/behavior/realman_bt/CMakeLists.txt`, change the test target's dependencies to

```cmake
  ament_target_dependencies(test_policy_run_node
    rclcpp std_msgs std_srvs sensor_msgs diagnostic_msgs geometry_msgs realman_recording_msgs)
```

and add, next to the other `find_package` lines at the top:

```cmake
find_package(realman_recording_msgs REQUIRED)
```

In `src/behavior/realman_bt/package.xml`, after `<depend>diagnostic_msgs</depend>` add:

```xml
  <depend>realman_recording_msgs</depend>
```

- [ ] **Step 2: Run the test to see it fail**

Run: `humble "cd /w/.build/realman_bt && ctest -R ^test_policy_run_node$ --output-on-failure --timeout 240"`
Expected: FAIL (an `assert` on `f.stack.attempts.size() == 2` aborts)

- [ ] **Step 3: Implement**

In `src/behavior/realman_bt/CMakeLists.txt`, change the library's dependencies to

```cmake
ament_target_dependencies(policy_task_nodes
  rclcpp std_msgs std_srvs sensor_msgs diagnostic_msgs geometry_msgs realman_recording_msgs)
```

In `policy_run_node.hpp`:

1. After `#include "realman_bt/policy_task_config.hpp"` add:

```cpp
#include "realman_recording_msgs/msg/attempt_event.hpp"
```

2. Extend the class comment's last paragraph: replace

```cpp
// FAILURE, policy_failure_reason. halt() sends the stop calls without waiting, so nothing keeps
// driving when the router switches away from the policy branch. dry_run=true only records what
// would be supervised: no subscriptions, no service calls.
```

with

```cpp
// FAILURE, policy_failure_reason. halt() sends the stop calls without waiting, so nothing keeps
// driving when the router switches away from the policy branch. dry_run=true only records what
// would be supervised: no subscriptions, no service calls.
//
// Each attempt is announced on /recording/attempt for the recorder: START once the preflight has
// passed (the id is the attempt's trace file name), then exactly one RESULT when it ends or is
// halted. A dry run or a failed preflight announces nothing.
```

3. In the private method list, after `void publishPrompt(Clock::time_point now);` add:

```cpp
  void publishAttemptStart();
  void publishAttemptResult(const std::string& outcome, bool succeeded, const std::string& reason);
```

4. In the members, after `Clock::time_point prompt_sent_at_{};` add:

```cpp
  rclcpp::Publisher<realman_recording_msgs::msg::AttemptEvent>::SharedPtr attempt_pub_;
  std::string attempt_id_;
  bool attempt_announced_{false};  // a START went out and its RESULT has not
```

In `policy_run_node.cpp`:

1. Add `#include <filesystem>` after `#include <cstdlib>`.

2. In `initialize()`, after the `prompt_pub_ = ...;` line add:

```cpp
  // Reliable so the recorder never misses the START/RESULT pair of an attempt.
  attempt_pub_ = ros_node_->create_publisher<realman_recording_msgs::msg::AttemptEvent>(
      "/recording/attempt", rclcpp::QoS(10).reliable());
```

3. In `resetAttempt()`, after `prompt_sent_at_ = Clock::time_point{};` add:

```cpp
  attempt_announced_ = false;
```

4. In `tick()`, in the `if (phase_ == Phase::kIdle)` block, after `openTrace();` add:

```cpp
    attempt_id_ = trace_.isOpen()
                      ? std::filesystem::path(trace_.path()).stem().string()
                      : "policy_attempt_" + utcStamp(std::chrono::system_clock::now()) + "_" + arm_;
```

5. In `tickPreflight`, replace

```cpp
  if (missing.text.empty()) {
    phase_ = Phase::kArming;
    phase_started_ = now;
    return tickArming(now);
  }
```

with

```cpp
  if (missing.text.empty()) {
    phase_ = Phase::kArming;
    phase_started_ = now;
    publishAttemptStart();
    return tickArming(now);
  }
```

6. In `finalize()`, after the `recordPolicyEvent(... "attempt_end", ...);` statement and before `resetAttempt();` add:

```cpp
  publishAttemptResult(outcomeName(verdict.outcome), verdict.succeeded, verdict.reason);
```

7. In `onHalted()`, replace the final `resetAttempt();` with:

```cpp
  publishAttemptResult("halted", false, "halted by the behavior tree");
  resetAttempt();
```

8. Add after `publishPrompt`:

```cpp
void PolicyRunNode::publishAttemptStart() {
  realman_recording_msgs::msg::AttemptEvent event;
  event.kind = realman_recording_msgs::msg::AttemptEvent::START;
  event.stamp = rclcpp::Clock(RCL_SYSTEM_TIME).now();
  event.attempt_id = attempt_id_;
  event.task = task_name_;
  event.arm = arm_;
  event.prompt = task_.prompt;
  // From here: the activation call, the run, three stop calls and the router release.
  event.max_duration_sec = static_cast<uint32_t>(std::ceil(
      config_->max_attempt_sec + 4.0 * config_->service_call_timeout_sec + config_->router_release_sec));
  try {
    attempt_pub_->publish(event);
    attempt_announced_ = true;
  } catch (const std::exception& error) {
    recordPolicyEvent(blackboard(), "WARN", name(), "attempt_event", error.what());
  }
}

void PolicyRunNode::publishAttemptResult(const std::string& outcome, bool succeeded,
                                         const std::string& reason) {
  if (!attempt_announced_) return;
  attempt_announced_ = false;
  realman_recording_msgs::msg::AttemptEvent event;
  event.kind = realman_recording_msgs::msg::AttemptEvent::RESULT;
  event.stamp = rclcpp::Clock(RCL_SYSTEM_TIME).now();
  event.attempt_id = attempt_id_;
  event.task = task_name_;
  event.arm = arm_;
  event.prompt = task_.prompt;
  event.outcome = outcome;
  event.succeeded = succeeded;
  event.reason = reason;
  try {
    attempt_pub_->publish(event);
  } catch (const std::exception& error) {
    recordPolicyEvent(blackboard(), "WARN", name(), "attempt_event", error.what());
  }
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `humble "cd /w/.build/realman_bt && ctest -R ^test_policy_run_node$ --output-on-failure --timeout 240"`
Expected: `100% tests passed, 0 tests failed out of 1`

Mutation check (do not commit it): in the scratch tree only, comment out `publishAttemptStart();` in `tickPreflight`, rerun the same command, expect FAIL, then restore with a fresh `humble` run (rsync puts the real file back).

- [ ] **Step 5: Document it**

In `website/docs/development/policy-task.md`, insert this section right before the line `## 配置与激活方式`:

```markdown
## 录制与偏离标注

PolicyRun 每次尝试都会在 `/recording/attempt` 上通知录制服务：预检通过、准备激活策略时发 `START`，尝试结束或被 halt 时发一次 `RESULT`（`outcome` 是上面的结果名，被 halt 时是 `halted`）。`attempt_id` 就是本次尝试的轨迹文件名（去掉 `.csv`），所以录制的 session 和[轨迹记录](#轨迹记录)能一一对上。`START` 带上这次尝试最多还会持续多久（`max_attempt_sec` 加 4 次服务调用超时和路由释放时间），录制服务超过这个时间还没收到 `RESULT` 就自己停录。dry-run 和预检就失败的尝试什么都不发。

录制服务（`realman_recording`）收到 `START` 后为这次尝试单独录一个 session，导出到 `realman/pi05-policy-rollouts` 数据集；操作员在 :8765 上标注的偏离区间写进同一个 session。没有启动录制服务时，这些通知没人接收，尝试照常运行。详见[策略运行偏离标注](./quality-annotation)。
```

- [ ] **Step 6: Commit**

```bash
cd "$WT" && git add src/behavior/realman_bt/package.xml src/behavior/realman_bt/CMakeLists.txt src/behavior/realman_bt/include/realman_bt/policy_run_node.hpp src/behavior/realman_bt/src/policy_run_node.cpp src/behavior/realman_bt/test/test_policy_run_node.cpp website/docs/development/policy-task.md
git commit -m "feat(bt): announce each policy attempt on /recording/attempt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: web_control backend for live marks

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/quality_marks.py`
- Create: `src/driver/realman_web_control/test/test_quality_marks.py`
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py`
- Modify: `src/driver/realman_web_control/test/test_protocol.py`
- Modify: `src/driver/realman_web_control/realman_web_control/model_manifest.py`
- Modify: `src/driver/realman_web_control/test/test_model_manifest.py`
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/package.xml`
- Modify: `config/web-control/vite.config.mjs`

**Interfaces:**
- Consumes: `QualityMark`, `RecordingStatus` (Task 6); `/recording/status.diagnostics_json.quality` (Tasks 6–7).
- Produces (used by Task 12):
  - WS command `{"type": "quality_mark", "request_id": str, "kind": "deviate_start"|"recover"|"reason", "reason": str}`; reply `{"type": "quality_mark_result", "request_id", "kind", "reason"}`; unknown reason → `error` event with code `invalid_reason` and the request_id
  - WS push `{"type": "recording_state", "recording": {state, session_id, elapsed_sec, profile, attempt_id, deviating, deviation_start_ns, reason, rejected_marks, dropped_marks, last_error}}` on change (elapsed time alone is not a change) and to every new client
  - Manifest key `quality_reasons: [{"id", "label"}]` (also in the Vite dev manifest)

- [ ] **Step 1: Write the failing tests**

`src/driver/realman_web_control/test/test_quality_marks.py`:

```python
import json
from pathlib import Path

import pytest

from realman_web_control.quality_marks import load_quality_reasons, recording_view, view_changed

ROOT = Path(__file__).parents[4]


def test_the_repository_reasons_load_in_key_order():
    reasons = load_quality_reasons(ROOT / "config/recording/quality_reasons.yaml")
    assert reasons[0] == {"id": "grasp_miss", "label": "抓偏"}
    assert len(reasons) == 6


def test_no_reason_file_means_no_reasons(tmp_path):
    assert load_quality_reasons(tmp_path / "absent.yaml") == []
    assert load_quality_reasons(None) == []


def test_only_the_shape_of_the_reason_file_is_checked_here(tmp_path):
    # The recorder validates ids, duplicates and the 9-entry limit (realman_recording.quality_events);
    # here a malformed file is refused and anything well-shaped is passed through to the page.
    path = tmp_path / "reasons.yaml"
    path.write_text("reasons: {id: a}\n", encoding="utf-8")
    with pytest.raises(ValueError):
        load_quality_reasons(path)
    path.write_text("reasons:\n  - {id: Bad, label: x}\n", encoding="utf-8")
    assert load_quality_reasons(path) == [{"id": "Bad", "label": "x"}]


def test_the_recording_view_condenses_the_recorder_status():
    diagnostics = json.dumps({"checked_wall_ns": 1, "diagnostics": [], "quality": {
        "profile": "policy_rollout", "attempt_id": "policy_attempt_x", "deviating": True,
        "deviation_start_ns": "1790000000000000000", "reason": "stall", "rejected_marks": 1,
        "dropped_marks": 2, "auto_record_last_error": "", "auto_record": {"ignored_busy": 0},
    }})
    view = recording_view(state=2, session_id="s1", elapsed_sec=3.14159, diagnostics_json=diagnostics)
    assert view == {"state": "RECORDING", "session_id": "s1", "elapsed_sec": 3.1, "profile": "policy_rollout",
                    "attempt_id": "policy_attempt_x", "deviating": True,
                    "deviation_start_ns": "1790000000000000000", "reason": "stall",
                    "rejected_marks": 1, "dropped_marks": 2, "last_error": ""}


def test_the_recording_view_tolerates_an_old_recorder():
    view = recording_view(state=0, session_id="", elapsed_sec=0.0, diagnostics_json="not json")
    assert view["state"] == "IDLE"
    assert view["deviating"] is False
    assert view["profile"] == ""


def test_elapsed_time_alone_is_not_a_change():
    first = recording_view(state=2, session_id="s1", elapsed_sec=1.0, diagnostics_json="{}")
    later = recording_view(state=2, session_id="s1", elapsed_sec=2.0, diagnostics_json="{}")
    assert view_changed(None, first)
    assert not view_changed(first, later)
    assert view_changed(first, {**later, "deviating": True})
```

Append to `src/driver/realman_web_control/test/test_protocol.py`:

```python
def test_quality_mark_is_global_and_validates_kind_and_reason():
    message = {"type": "quality_mark", "request_id": "q-1", "kind": "deviate_start", "reason": "grasp_miss"}
    assert parse_message(json.dumps(message)) == message
    assert parse_message(json.dumps({"type": "quality_mark", "request_id": "q-2", "kind": "recover"})) == {
        "type": "quality_mark", "request_id": "q-2", "kind": "recover", "reason": "",
    }


@pytest.mark.parametrize("message", [
    {"type": "quality_mark", "request_id": "q", "kind": "jump"},
    {"type": "quality_mark", "request_id": "q", "kind": "reason"},
    {"type": "quality_mark", "request_id": "q", "kind": "reason", "reason": "Not An Id"},
    {"type": "quality_mark", "request_id": "q", "kind": "recover", "reason": "stall"},
    {"type": "quality_mark", "kind": "deviate_start"},
])
def test_quality_mark_rejects_malformed_commands(message):
    with pytest.raises(ProtocolError):
        parse_message(json.dumps(message))
```

Append to `src/driver/realman_web_control/test/test_model_manifest.py`:

```python
def test_manifest_publishes_the_deviation_reasons():
    manifest = build_manifest(*paths(), quality_reasons_path=ROOT / "config/recording/quality_reasons.yaml")
    assert manifest["quality_reasons"][0] == {"id": "grasp_miss", "label": "抓偏"}
    assert build_manifest(*paths())["quality_reasons"] == []
```

- [ ] **Step 2: Run them to see them fail**

Run: `webc test/test_quality_marks.py test/test_protocol.py test/test_model_manifest.py`
Expected: FAIL (`No module named 'realman_web_control.quality_marks'`, `unsupported message type: quality_mark`, unexpected keyword `quality_reasons_path`)

- [ ] **Step 3: Write the pure module**

`src/driver/realman_web_control/realman_web_control/quality_marks.py`:

```python
"""Live deviation marks at the :8765 boundary (no ROS import, unit-tested in CI).

The operator's ``quality_mark`` commands become realman_recording_msgs/QualityMark on
/recording/quality_mark; the recorder's /recording/status becomes the page's compact recording
state. The reason list is config/recording/quality_reasons.yaml. The recorder validates that file
and refuses marks with an unknown reason (realman_recording.quality_events); this module only
passes the list to the page.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

# Index = realman_recording_msgs/QualityMark.kind.
MARK_KINDS = {"deviate_start": 0, "recover": 1, "reason": 2}
# realman_recording_msgs/RecordingStatus state constants.
RECORDING_STATES = {0: "IDLE", 1: "COUNTDOWN", 2: "RECORDING", 4: "FINALIZING", 5: "EXPORTING", 6: "READY",
                    7: "FAILED", 8: "PREPARING", 9: "ARMED", 10: "SCHEDULED", 11: "EXPORTED"}


def load_quality_reasons(path: str | Path | None) -> list[dict[str, str]]:
    """``[{"id", "label"}]`` in key order for the page; a missing file means no reasons.

    Only the shape is checked: ids, duplicates and the entry limit are the recorder's to enforce.
    """
    if path is None or not Path(path).is_file():
        return []
    payload = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    items = payload.get("reasons") if isinstance(payload, dict) else None
    if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
        raise ValueError(f"{path}: reasons must be a list of id/label mappings")
    return [{"id": str(item.get("id", "")), "label": str(item.get("label", ""))} for item in items]


def recording_view(*, state: int, session_id: str, elapsed_sec: float, diagnostics_json: str) -> dict[str, Any]:
    """The page's recording state from one RecordingStatus (an older recorder has no quality key)."""
    try:
        diagnostics = json.loads(diagnostics_json) if diagnostics_json else {}
    except json.JSONDecodeError:
        diagnostics = {}
    quality = diagnostics.get("quality") if isinstance(diagnostics, dict) else None
    quality = quality if isinstance(quality, dict) else {}
    return {
        "state": RECORDING_STATES.get(int(state), "UNKNOWN"),
        "session_id": session_id,
        "elapsed_sec": round(max(0.0, float(elapsed_sec)), 1),
        "profile": str(quality.get("profile", "")),
        "attempt_id": str(quality.get("attempt_id", "")),
        "deviating": bool(quality.get("deviating", False)),
        "deviation_start_ns": str(quality.get("deviation_start_ns", "")),
        "reason": str(quality.get("reason", "")),
        "rejected_marks": int(quality.get("rejected_marks", 0) or 0),
        "dropped_marks": int(quality.get("dropped_marks", 0) or 0),
        "last_error": str(quality.get("auto_record_last_error", "")),
    }


def view_changed(previous: dict[str, Any] | None, current: dict[str, Any]) -> bool:
    """Elapsed time alone is not a change: the page counts it up from the last push."""
    if previous is None:
        return True
    return ({key: value for key, value in previous.items() if key != "elapsed_sec"}
            != {key: value for key, value in current.items() if key != "elapsed_sec"})
```

- [ ] **Step 4: Parse the command**

In `protocol.py`, after `_parse_stop_behavior_tree` add:

```python
def _parse_quality_mark(message: dict[str, Any]) -> dict[str, Any]:
    """A live deviation mark for the recorder; the node checks the reason against the config."""
    request_id = _request_id(message)
    kind = message.get("kind")
    if kind not in {"deviate_start", "recover", "reason"}:
        raise ProtocolError("invalid_field", "kind must be deviate_start, recover or reason", request_id)
    reason = message.get("reason", "")
    if not isinstance(reason, str) or (reason and re.fullmatch(r"[a-z][a-z0-9_]{0,31}", reason) is None):
        raise ProtocolError("invalid_field", "reason must be a reason id", request_id)
    if kind == "reason" and not reason:
        raise ProtocolError("invalid_field", "a reason mark needs a reason", request_id)
    if kind == "recover" and reason:
        raise ProtocolError("invalid_field", "recover takes no reason", request_id)
    return {"type": "quality_mark", "request_id": request_id, "kind": kind, "reason": reason}
```

and add `"quality_mark": _parse_quality_mark,` to `_ARMLESS_PARSERS` after `"stop_behavior_tree": _parse_stop_behavior_tree,`.

- [ ] **Step 5: Publish the reasons in the manifest**

In `model_manifest.py`:

1. Add the import next to the other package imports at the top:

```python
from .quality_marks import load_quality_reasons
```

2. Add a parameter to `build_manifest` after `policy_task_path: str | Path | None = None,`:

```python
    quality_reasons_path: str | Path | None = None,
```

3. In the returned dict, add to `"source"` after `"joint_current": "config/ros/policy_task.yaml",`:

```python
            "quality_reasons": "config/recording/quality_reasons.yaml",
```

and after the `"joint_current": ...` entry of the returned dict add:

```python
        # Deviation reasons for the live marking strip (digit keys follow this order).
        "quality_reasons": load_quality_reasons(quality_reasons_path),
```

In `config/web-control/vite.config.mjs` (the dev manifest has the same shape), after the line `const jointCurrent = { ...policyTask.current_guard, policy_arm: policyTask.arm };` add:

```js
  // Same shape as model_manifest quality_reasons (validation lives in quality_marks.py).
  const qualityReasons = YAML.parse(await readFile(resolve(repositoryDirectory, "config/recording/quality_reasons.yaml"), "utf8")).reasons;
```

and after `    joint_current: jointCurrent,` add:

```js
    quality_reasons: qualityReasons,
```

- [ ] **Step 6: Run the pure tests to see them pass**

Run: `webc`
Expected: PASS (whole realman_web_control suite)

- [ ] **Step 7: Wire the node**

In `web_control_node.py`:

1. Imports. After `from rclpy.callback_groups import ReentrantCallbackGroup` add:

```python
from rclpy.clock import Clock, ClockType
```

after `from realman_msgs.msg import CartesianVelocityState, InputModeState, MotionWaypoint` add:

```python
from realman_recording_msgs.msg import QualityMark, RecordingStatus
```

and after `from .protocol import ProtocolError, reject_if_read_only` add:

```python
from .quality_marks import MARK_KINDS, recording_view, view_changed
```

2. Parameter, after the `policy_task_config_file` declaration:

```python
        self.declare_parameter(
            "quality_reasons_config_file",
            str(config_root / "recording" / "quality_reasons.yaml"),
        )
```

3. Pass it to `build_manifest`: replace

```python
            self._parameter("end_effectors_config_file"),
            self._parameter("policy_task_config_file"),
        )
```

with

```python
            self._parameter("end_effectors_config_file"),
            self._parameter("policy_task_config_file"),
            self._parameter("quality_reasons_config_file"),
        )
        self._quality_reason_ids = {reason["id"] for reason in self._manifest["quality_reasons"]}
```

4. After the `self._web_subscriptions.append(...)` that subscribes `/camera_calibration/camera_health`, add:

```python
        # Live deviation marks for the recorder (annotation only: never starts a recording) and the
        # recorder's status, condensed for the page's marking strip.
        self._wall_clock = Clock(clock_type=ClockType.SYSTEM_TIME)
        self._quality_mark_publisher = self.create_publisher(QualityMark, "/recording/quality_mark", 50)
        self._recording_lock = threading.Lock()
        self._recording_view: dict[str, Any] | None = None
        self._web_subscriptions.append(
            self.create_subscription(
                RecordingStatus,
                "/recording/status",
                self._recording_status_message,
                10,
                callback_group=self._callback_group,
            )
        )
```

5. In `_dispatch`, before the final `else:` add:

```python
        elif message_type == "quality_mark":
            self._quality_mark(client_id, message)
```

6. In `_send_cached_state`, after `self._send_tf_frames(client_id)` add:

```python
        with self._recording_lock:
            recording = self._recording_view
        if recording is not None:
            self._server.send_event({"type": "recording_state", "recording": recording}, client_id)
```

7. Add the handlers right after `_stop_behavior_tree`:

```python
    def _recording_status_message(self, message: RecordingStatus) -> None:
        view = recording_view(
            state=int(message.state),
            session_id=message.session_id,
            elapsed_sec=message.elapsed_sec,
            diagnostics_json=message.diagnostics_json,
        )
        with self._recording_lock:
            changed = view_changed(self._recording_view, view)
            self._recording_view = view
        if changed:
            self._server.send_event({"type": "recording_state", "recording": view}, None)

    def _quality_mark(self, client_id: str, message: dict[str, Any]) -> None:
        reason = message["reason"]
        if reason and reason not in self._quality_reason_ids:
            raise ProtocolError("invalid_reason", f"unknown deviation reason: {reason}", message["request_id"])
        mark = QualityMark()
        mark.kind = MARK_KINDS[message["kind"]]
        mark.stamp = self._wall_clock.now().to_msg()
        mark.reason = reason
        self._quality_mark_publisher.publish(mark)
        self._server.send_event(
            {"type": "quality_mark_result", "request_id": message["request_id"],
             "kind": message["kind"], "reason": reason},
            client_id,
        )
```

8. In `src/driver/realman_web_control/package.xml`, after `<exec_depend>realman_msgs</exec_depend>` add:

```xml
  <exec_depend>realman_recording_msgs</exec_depend>
```

- [ ] **Step 8: Check the node imports and builds under Humble**

Run: `humble "python3 -c import\ realman_web_control.web_control_node && echo import-ok"`
Expected: build succeeds and prints `import-ok` (the backslash-escaped space keeps the import one argument; `humble` cannot pass single quotes)

- [ ] **Step 9: Lint and commit**

Run: `lint && webc`
Expected: `All checks passed!` and PASS

```bash
cd "$WT" && git add src/driver/realman_web_control/realman_web_control/quality_marks.py src/driver/realman_web_control/test/test_quality_marks.py src/driver/realman_web_control/realman_web_control/protocol.py src/driver/realman_web_control/test/test_protocol.py src/driver/realman_web_control/realman_web_control/model_manifest.py src/driver/realman_web_control/test/test_model_manifest.py src/driver/realman_web_control/realman_web_control/web_control_node.py src/driver/realman_web_control/package.xml config/web-control/vite.config.mjs
git commit -m "feat(web-control): forward live deviation marks and the recorder state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: :8765 marking strip

**Files:**
- Create: `src/driver/realman_web_control/web/src/quality_strip.ts`
- Modify: `src/driver/realman_web_control/web/index.html`
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Modify: `website/tests/web-control/web-control.spec.ts`
- Modify: `website/docs/development/realman-web-control.md`
- Rebuild: `src/driver/realman_web_control/realman_web_control/static/**`

**Interfaces:**
- Consumes: Task 11 WS messages and manifest `quality_reasons`; `send`, `canWrite`, `keyboardModeActive`, `btRuntime` in `main.ts`.
- Produces: `initQualityStrip({ send, canWrite, keyboardActive })` → `{ setReasons, setRecording, setPolicyRunning, onResult, onError }`.

- [ ] **Step 1: Write the failing Playwright test**

Append to `website/tests/web-control/web-control.spec.ts`:

```ts
test("marks deviations from the keyboard while a policy attempt is recorded", async ({ page }) => {
  await page.goto("/");
  await pushBtRuntime(page, {
    available: true, tree_id: "control_pick", sequence: 1, timestamp_ms: 1, root_status: "RUNNING", failure_reason: "",
    nodes: [
      btNode("0", "Control", "Sequence", "control_pick", "RUNNING"),
      btNode("0/0", "Action", "PolicyRun", "PolicyRun", "RUNNING"),
    ],
  });
  await expect(page.locator("#quality-warning")).toContainText("本次尝试未录制");

  const recording = {
    state: "RECORDING", session_id: "20261029T031500Z-abc", elapsed_sec: 3, profile: "policy_rollout",
    attempt_id: "policy_attempt_20261029_031500_r", deviating: false, deviation_start_ns: "", reason: "",
    rejected_marks: 0, dropped_marks: 0, last_error: "",
  };
  await emitWebSocketEvent(page, { type: "recording_state", recording });
  await expect(page.locator("#quality-live")).toBeVisible();
  await expect(page.locator("#quality-warning")).toBeHidden();
  await expect(page.locator("#quality-recording")).toContainText("policy_attempt_20261029_031500_r");
  await expect(page.locator("#quality-reasons button")).toHaveCount(6);

  const sentMarks = () => page.evaluate(() => ((window as any).__webMessages as string[])
    .map((raw) => JSON.parse(raw))
    .filter((message) => message.type === "quality_mark")
    .map((message) => [message.kind, message.reason]));
  await page.keyboard.press("d");
  await expect.poll(sentMarks).toEqual([["deviate_start", ""]]);
  const requestId = await page.evaluate(() => ((window as any).__webMessages as string[])
    .map((raw) => JSON.parse(raw)).filter((message) => message.type === "quality_mark")[0].request_id);
  await emitWebSocketEvent(page, { type: "quality_mark_result", request_id: requestId, kind: "deviate_start", reason: "" });
  await expect(page.locator("#quality-marks li")).toHaveCount(1);

  await emitWebSocketEvent(page, { type: "recording_state", recording: {
    ...recording, deviating: true, deviation_start_ns: `${Date.now()}000000`,
  } });
  await expect(page.locator("#quality-state")).toContainText("偏离中");
  await page.keyboard.press("2");
  await page.keyboard.press("d");
  await expect.poll(sentMarks).toEqual([["deviate_start", ""], ["reason", "wrong_target"], ["recover", ""]]);

  await emitWebSocketEvent(page, { type: "recording_state", recording: { ...recording, state: "READY" } });
  await pushBtRuntime(page, { available: false });
  await expect(page.locator("#quality-strip")).toBeHidden();
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd "$WT/website" && PLAYWRIGHT_CHROME_PATH="$CHROME" npm run test:web-control -- --project desktop -g "marks deviations"`
Expected: FAIL (`#quality-warning` not found)

- [ ] **Step 3: Write the strip module**

`src/driver/realman_web_control/web/src/quality_strip.ts`:

```ts
// Live deviation marking while the recorder records a policy attempt (偏离打点). Marks go to the
// recorder as realman_recording_msgs/QualityMark through the quality_mark WebSocket command; the
// deviating state shown here is the recorder's own, from /recording/status.
//
//   D      normal: start a deviation; deviating: recover
//   1..9   normal: start a deviation with that reason; deviating: set the reason
// Keys do nothing while typing in a field, while keyboard teleoperation is active, while the page
// cannot write, or while the strip is hidden. Every key has a button.

export type QualityReason = { id: string; label: string };
export type RecordingView = {
  state: string;
  session_id: string;
  elapsed_sec: number;
  profile: string;
  attempt_id: string;
  deviating: boolean;
  deviation_start_ns: string;
  reason: string;
  rejected_marks: number;
  dropped_marks: number;
  last_error: string;
};
type MarkKind = "deviate_start" | "recover" | "reason";
type SentMark = { kind: MarkKind; reason: string; at: Date };

export type QualityStripCallbacks = {
  send(message: { type: string } & Record<string, unknown>): void;
  canWrite(): boolean;
  keyboardActive(): boolean;
};

export type QualityStripApi = {
  setReasons(reasons: QualityReason[]): void;
  setRecording(view: RecordingView | null): void;
  setPolicyRunning(running: boolean): void;
  onResult(message: Record<string, unknown>): void;
  onError(message: Record<string, unknown>): boolean;
};

// Only sessions the recorder opened for a policy attempt get the strip.
const POLICY_PROFILE = "policy_rollout";
const KIND_TEXT: Record<MarkKind, string> = { deviate_start: "开始偏离", recover: "恢复正常", reason: "原因" };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function initQualityStrip(callbacks: QualityStripCallbacks): QualityStripApi {
  const strip = document.querySelector<HTMLElement>("#quality-strip")!;
  const warning = document.querySelector<HTMLElement>("#quality-warning")!;
  const live = document.querySelector<HTMLElement>("#quality-live")!;
  const recordingEl = document.querySelector<HTMLElement>("#quality-recording")!;
  const stateEl = document.querySelector<HTMLElement>("#quality-state")!;
  const toggle = document.querySelector<HTMLButtonElement>("#quality-toggle")!;
  const reasonsEl = document.querySelector<HTMLElement>("#quality-reasons")!;
  const messageEl = document.querySelector<HTMLElement>("#quality-message")!;
  const marksEl = document.querySelector<HTMLOListElement>("#quality-marks")!;

  let reasons: QualityReason[] = [];
  let view: RecordingView | null = null;
  let viewAt = 0;
  let policyRunning = false;
  let attemptId = "";
  let marks: SentMark[] = [];
  let requestCounter = 0;
  const pending = new Map<string, SentMark>();

  function recording(): boolean {
    return view?.state === "RECORDING" && view.profile === POLICY_PROFILE;
  }

  function renderClock(): void {
    if (!view) return;
    const elapsed = view.elapsed_sec + (performance.now() - viewAt) / 1000;
    recordingEl.textContent = `录制中 · ${view.attempt_id || view.session_id} · ${elapsed.toFixed(0)} s`;
    let deviation = "";
    if (view.deviating && view.deviation_start_ns) {
      const nowNs = BigInt(Date.now()) * BigInt(1000000);
      deviation = ` ${Math.max(0, Number(nowNs - BigInt(view.deviation_start_ns)) / 1e9).toFixed(0)}s`;
    }
    stateEl.textContent = view.deviating ? `偏离中${deviation}` : "正常";
  }

  function render(): void {
    const showLive = recording();
    const showWarning = policyRunning && !showLive;
    strip.hidden = !(showLive || showWarning);
    live.hidden = !showLive;
    warning.hidden = !showWarning;
    warning.textContent = showWarning
      ? `本次尝试未录制${view?.last_error ? `：${view.last_error}` : "（录制服务没有在录）"}`
      : "";
    if (!showLive || !view) return;
    const writable = callbacks.canWrite();
    renderClock();
    stateEl.classList.toggle("deviating", view.deviating);
    toggle.textContent = view.deviating ? "恢复正常 (D)" : "开始偏离 (D)";
    toggle.disabled = !writable;
    reasonsEl.innerHTML = reasons.map((reason, index) =>
      `<button type="button" class="quality-reason${view!.reason === reason.id ? " active" : ""}" data-index="${index}"${writable ? "" : " disabled"} title="快捷键 ${index + 1}">${index + 1} ${escapeHtml(reason.label)}</button>`).join("");
    marksEl.innerHTML = marks.map((mark) => {
      const label = reasons.find((reason) => reason.id === mark.reason)?.label;
      return `<li>${mark.at.toLocaleTimeString()} ${KIND_TEXT[mark.kind]}${label ? ` · ${escapeHtml(label)}` : ""}</li>`;
    }).join("");
  }

  function send(kind: MarkKind, reason: string): void {
    if (!recording() || !callbacks.canWrite()) return;
    const requestId = `quality-${++requestCounter}`;
    pending.set(requestId, { kind, reason, at: new Date() });
    callbacks.send({ type: "quality_mark", request_id: requestId, kind, reason });
  }

  function toggleDeviation(): void {
    send(view?.deviating ? "recover" : "deviate_start", "");
  }

  function chooseReason(index: number): void {
    const reason = reasons[index];
    if (reason) send(view?.deviating ? "reason" : "deviate_start", reason.id);
  }

  toggle.addEventListener("click", toggleDeviation);
  reasonsEl.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-index]");
    if (button) chooseReason(Number(button.dataset.index));
  });
  window.addEventListener("keydown", (event) => {
    if (!recording() || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select") || target?.isContentEditable) return;
    if (callbacks.keyboardActive() || !callbacks.canWrite()) return;
    if (event.code === "KeyD") {
      event.preventDefault();
      toggleDeviation();
      return;
    }
    const digit = /^Digit([1-9])$/.exec(event.code);
    if (digit) {
      event.preventDefault();
      chooseReason(Number(digit[1]) - 1);
    }
  });
  window.setInterval(() => {
    if (recording()) renderClock();
  }, 500);

  return {
    setReasons(next) {
      reasons = next.slice(0, 9);
      render();
    },
    setRecording(next) {
      view = next;
      viewAt = performance.now();
      const nextAttempt = next?.attempt_id ?? "";
      if (nextAttempt !== attemptId) {
        attemptId = nextAttempt;
        marks = [];
        messageEl.textContent = "";
      }
      render();
    },
    setPolicyRunning(running) {
      policyRunning = running;
      render();
    },
    onResult(message) {
      const requestId = String(message.request_id ?? "");
      const sent = pending.get(requestId);
      if (!sent) return;
      pending.delete(requestId);
      marks = [sent, ...marks].slice(0, 5);
      messageEl.textContent = "";
      render();
    },
    onError(message) {
      const requestId = String(message.request_id ?? "");
      if (!pending.has(requestId)) return false;
      pending.delete(requestId);
      messageEl.textContent = `打点失败：${String(message.message ?? message.code ?? "未知错误")}`;
      return true;
    },
  };
}
```

- [ ] **Step 4: Add the markup**

In `src/driver/realman_web_control/web/index.html`, replace

```html
          <div id="bt-mode-reason" class="bt-mode-reason" role="status" aria-live="polite" hidden></div>
```

with

```html
          <div id="bt-mode-reason" class="bt-mode-reason" role="status" aria-live="polite" hidden></div>
          <div id="quality-strip" class="quality-strip" hidden>
            <div id="quality-warning" class="quality-warning" role="status" hidden></div>
            <div id="quality-live" class="quality-live" hidden>
              <div class="quality-head"><span id="quality-recording" class="quality-recording"></span><span id="quality-state" class="quality-state">正常</span></div>
              <div class="quality-actions"><button id="quality-toggle" class="button" type="button" title="快捷键 D">开始偏离 (D)</button><div id="quality-reasons" class="quality-reasons"></div></div>
              <div id="quality-message" class="quality-message" role="status" aria-live="polite"></div>
              <ol id="quality-marks" class="quality-marks"></ol>
            </div>
          </div>
```

- [ ] **Step 5: Wire it into the page**

In `src/driver/realman_web_control/web/src/main.ts`:

1. After the `import { activeRouterBranch, ... } from "./bt_tree";` line add:

```ts
import { initQualityStrip, type QualityReason, type RecordingView } from "./quality_strip";
```

2. In `type Manifest = {`, after `joint_current?: JointCurrentGuard;` add:

```ts
  quality_reasons?: QualityReason[];
```

3. In `loadManifest`, after `manifest = next;` add:

```ts
  qualityStrip.setReasons(next.quality_reasons ?? []);
```

4. In `handleMessage`, replace

```ts
  } else if (message.type === "bt_runtime") {
    // Pushed by the server on every visible change of the executor's snapshot, and once after hello.
    btRuntime = message.runtime?.available === true ? message.runtime as BtRuntime : { available: false };
    renderBehaviorTree();
```

with

```ts
  } else if (message.type === "recording_state") {
    qualityStrip.setRecording(message.recording as RecordingView);
  } else if (message.type === "quality_mark_result") {
    qualityStrip.onResult(message);
  } else if (message.type === "bt_runtime") {
    // Pushed by the server on every visible change of the executor's snapshot, and once after hello.
    btRuntime = message.runtime?.available === true ? message.runtime as BtRuntime : { available: false };
    renderBehaviorTree();
    qualityStrip.setPolicyRunning(policyRunRunning(btRuntime));
```

and replace

```ts
  } else if (message.type === "error" && message.request_id && message.request_id === btStopRequest) {
```

with

```ts
  } else if (message.type === "error" && qualityStrip.onError(message)) {
    // A refused deviation mark: the marking strip shows why.
  } else if (message.type === "error" && message.request_id && message.request_id === btStopRequest) {
```

5. In the `socket.addEventListener("close", ...)` handler, replace

```ts
    // Tree states only arrive over this socket; do not keep showing a frozen tree.
    btRuntime = { available: false };
    renderBehaviorTree();
```

with

```ts
    // Tree states only arrive over this socket; do not keep showing a frozen tree.
    btRuntime = { available: false };
    renderBehaviorTree();
    // Nor a recording state nobody updates any more.
    qualityStrip.setRecording(null);
    qualityStrip.setPolicyRunning(false);
```

6. After `let btRuntime: BtRuntime = { available: false };` add:

```ts
// PolicyRun is RUNNING from its preflight until its stop calls are done.
function policyRunRunning(runtime: BtRuntime) {
  return runtime.available && runtime.nodes.some((node) => node.registration_name === "PolicyRun" && node.status === "RUNNING");
}
const qualityStrip = initQualityStrip({ send, canWrite, keyboardActive: keyboardModeActive });
```

- [ ] **Step 6: Style it**

Append to `src/driver/realman_web_control/web/src/style.css`:

```css
.quality-strip { margin: 0 0 8px; }
.quality-warning { padding: 6px 8px; border-radius: 8px; color: var(--warn); background: var(--warn-bg); border: 1px solid var(--line); font-size: 11px; line-height: 1.45; overflow-wrap: anywhere; }
.quality-live { padding: 8px; border-radius: 8px; background: var(--card-sub); border: 1px solid var(--line); }
.quality-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 11px; color: var(--text-2); }
.quality-recording { overflow-wrap: anywhere; }
.quality-state { font-weight: 600; color: var(--ok); white-space: nowrap; }
.quality-state.deviating { color: var(--danger); }
.quality-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.quality-reasons { display: flex; flex-wrap: wrap; gap: 4px; }
.quality-reason { padding: 4px 8px; border-radius: var(--radius-control); border: 1px solid var(--line); background: var(--btn-bg); color: var(--btn-content); font-size: 11px; cursor: pointer; }
.quality-reason.active { border-color: var(--danger); color: var(--danger); }
.quality-reason:disabled { opacity: .5; cursor: not-allowed; }
.quality-message { margin-top: 6px; color: var(--danger); font-size: 11px; }
.quality-message:empty { display: none; }
.quality-marks { margin: 6px 0 0; padding-left: 18px; color: var(--text-3); font-size: 10px; }
```

- [ ] **Step 7: Build and run the test to see it pass**

Run: `cd "$WT/website" && npm run build:web-control && PLAYWRIGHT_CHROME_PATH="$CHROME" npm run test:web-control`
Expected: build succeeds; all web-control tests PASS (desktop and mobile)

- [ ] **Step 8: Document it**

In `website/docs/development/realman-web-control.md`, insert this section right before the line `### 重启 Docker（驱动容器）`:

```markdown
### 偏离打点

行为树里 PolicyRun 在跑、录制服务也在为这次尝试录制（profile 为 `policy_rollout`）时，行为树卡片里会出现打点条：录制中的 `attempt_id` 和时长、当前状态（正常 / 偏离中 N 秒）、开始/恢复按钮、原因按钮和本次尝试最近几条打点。PolicyRun 在跑但录制服务没在录时，打点条变成黄色的“本次尝试未录制”，并显示录制服务给出的原因。

| 按键 | 正常时 | 偏离中 |
| --- | --- | --- |
| `D` | 开始偏离 | 恢复正常 |
| `1`–`9` | 带这个原因开始偏离 | 给当前这段设原因 |

数字键按 `config/recording/quality_reasons.yaml` 的顺序对应原因。焦点在输入框里、键盘遥操作模式开着、页面不可写或打点条没显示时，按键不起作用。USB 脚踏设成发 `D` 就能用脚打点。

打点通过 WebSocket 指令 `{"type": "quality_mark", "request_id": "...", "kind": "deviate_start" | "recover" | "reason", "reason": "<原因 id 或空>"}` 发给后端，后端用服务器的系统时间盖戳后发到 `/recording/quality_mark`，并回 `quality_mark_result`；原因不在列表里时回 `error`（`invalid_reason`）。页面上的“偏离中”状态来自录制服务的 `/recording/status`，后端在它变化时推送 `recording_state`。标注规范和回放修改方法见[策略运行偏离标注](./quality-annotation)。
```

- [ ] **Step 9: Commit (sources and the rebuilt bundle)**

```bash
cd "$WT" && git add src/driver/realman_web_control/web src/driver/realman_web_control/realman_web_control/static website/tests/web-control/web-control.spec.ts website/docs/development/realman-web-control.md
git status --short src/driver/realman_web_control/realman_web_control/static   # deleted old assets must be staged too
git commit -m "feat(web-control): mark deviations live from :8765

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Annotation guide page, sidebar and site test

**Files:**
- Create: `website/docs/development/quality-annotation.md`
- Modify: `config/website/vitepress.config.mts`
- Modify: `website/tests/site.spec.ts`

**Interfaces:**
- Consumes: everything above (the page links to recording-platform, policy-task, realman-web-control, ros-interfaces).
- Produces: route `/development/quality-annotation`.

- [ ] **Step 1: Add the route to the site test (failing first)**

In `website/tests/site.spec.ts`, in the first page list, after `"development/recording-platform",` add:

```ts
    "development/quality-annotation",
```

Run: `cd "$WT/website" && npm run build && PLAYWRIGHT_CHROME_PATH="$CHROME" npm run test:e2e -- site.spec.ts`
Expected: FAIL for `development/quality-annotation` (404)

- [ ] **Step 2: Write the page**

`website/docs/development/quality-annotation.md`:

````markdown
# 策略运行偏离标注

pi05 自主运行时，操作员在 :8765 上实时标出“开始偏离 / 恢复正常 / 偏离原因”，录制服务把它们和这次尝试的录像存在同一个 session 里，之后可以在录制回放页逐帧修正，最后导出成逐帧标签给训练用。目标是积累“机械臂正在往好方向还是坏方向执行”的监督数据，用来评测和训练运行时的失败预警。

## 数据从哪里来

| 环节 | 谁做 | 结果 |
| --- | --- | --- |
| 每次尝试自动录制 | 行为树 PolicyRun 在 `/recording/attempt` 上发 `START`/`RESULT`，录制服务据此开录、停录 | 一次尝试一个 session，导出到 `realman/pi05-policy-rollouts`，带 `success`、`failure_reason`、`policy_task`、`attempt_id` 机器标签 |
| 现场打点 | :8765 行为树卡片里的打点条（`D`、数字键或按钮） | 偏离区间实时写进 session 的 manifest |
| 回放修正 | 录制回放页的“偏离”编辑器 | 改起止帧、补原因、删误标 |
| 导出 | 回放页“导出偏离标注”按钮或命令行 | `episode_quality_events.json` |

遥操作录制也可以在回放页事后补标，用于清洗示范数据；但要训练“预测 pi05 跑偏”的模型，标签必须来自 pi05 自己运行时的失败。

## 标注规范

开录前先统一“偏离”的标准，否则不同人、不同天标出来的不一致：

- **开始偏离**：你判断它已经在往错的方向走、再不纠正就会失败的那一刻。例如夹爪对准点明显偏出物体、走向错误目标、来回抖动或犹豫超过 1 秒、即将碰撞。
- **恢复正常**：它重新回到正确轨道的那一刻。一直没恢复就不用按，录制结束时这一段自动延续到结尾。
- **原因**：从下表选一个；现场来不及可以留空，回放时再补。

| 键 | 原因 id | 含义 |
| --- | --- | --- |
| `1` | `grasp_miss` | 抓偏 |
| `2` | `wrong_target` | 目标错 |
| `3` | `collision_risk` | 碰撞风险 |
| `4` | `stall` | 卡住犹豫 |
| `5` | `drop` | 掉落 |
| `6` | `other` | 其他 |

原因列表在 `config/recording/quality_reasons.yaml`，最多 9 条，顺序决定数字键；`id` 写进数据，改名会让旧标注失效，`label` 可以随时改。

人按键会比实际慢 0.3–1 秒。现场打粗点即可，精确的帧在回放里修。

## 现场打点（:8765）

行为树里 PolicyRun 在跑、录制服务也在为这次尝试录制时，行为树卡片里出现打点条。`D` 在正常时开始偏离、偏离中时恢复；数字键在正常时带原因开始偏离、偏离中时设原因。显示的“偏离中”状态来自录制服务本身，不是页面猜的。PolicyRun 在跑但打点条显示黄色的“本次尝试未录制”时，这次按键不会被保存，原因（例如相机预检失败）就写在提示里。按键和协议细节见 [Web 控制](./realman-web-control#偏离打点)。

## 回放修正

在录制回放页选中一个已导出的 episode，点时间轴下方的“偏离”进入编辑。时间轴下面的红色条是偏离区间，斜纹表示一直没恢复。

| 按键 | 作用 |
| --- | --- |
| `D` | 当前帧不在区间内：从这一帧开始一段（延续到下一段之前，或到结尾）；在区间内：把这一段的结束点设到这一帧 |
| `[` | 把当前帧所在区间的起点设到这一帧；不在区间里时改后面最近一段的起点 |
| `]` | 把当前帧所在区间的终点设到这一帧；不在区间里时改前面最近一段的终点（用来延长） |
| `Delete` | 删掉当前帧所在的区间 |

每次修改自动保存。别处同时改过时会提示并重新加载。修改过的区间来源从“现场”变成“回放”。

## 数据格式

session 的 `manifest.json` 里有一个 `quality` 块，时间是纳秒字符串：

```json
"quality": {
  "revision": 2,
  "attempt": {"attempt_id": "policy_attempt_20261029_031500_r", "task": "pick_only", "arm": "r",
              "outcome": "dropped", "succeeded": false, "reason": "the object slipped out of the closed jaws"},
  "intervals": [{"start_ns": "1792984500123000000", "end_ns": null, "reason": "grasp_miss", "source": "live"}],
  "rejected_marks": 0
}
```

- `attempt.outcome` 是 PolicyRun 的结果名；被 halt 是 `halted`，录制结束前没收到结果是 `no_result`。
- 标签编辑器里，尝试结果显示为“机器写入”的标签，人工修改仍然优先；`deviation_count`（区间条数）是只读的派生标签，训练端可以用 `--where deviation_count=0` 之类的条件筛选。

`episode_quality_events.json` 按数据集的 `episode_index` 给出每个 episode 的帧网格、尝试结果和区间（纳秒和帧号都有）。第 i 帧的时间是 `first_walltime_ns + i × round(1e9 / fps)`，与导出器的网格一致。在帧上展开成逐帧标签时：

- `deviating[i]`：第 i 帧落在某个区间里为 1，否则为 0；
- `frames_to_deviation[i]`：在区间里为 0，否则是离下一段偏离开始还有几帧，后面没有偏离为 -1。训练提前预警时用它。

`realman_recording.quality_events.frame_labels()` 实现了这两列。

导出方式：

- 回放页点“导出偏离标注”，下载当前 episode 所在数据集的文件；
- 或者在录制容器里运行：

```bash
python3 -m realman_recording.quality_events dump --recording-root /data/realman-recordings --repo-id realman/pi05-policy-rollouts -o episode_quality_events.json
```

## 排障

| 现象 | 原因与处理 |
| --- | --- |
| 打点条显示“本次尝试未录制” | 录制服务没启动、正在录别的 session（人工或 Pika 开的），或开录预检失败；提示里有录制服务给出的原因 |
| 按键没反应 | 焦点在输入框里、键盘遥操作模式开着、页面不可写，或打点条没显示 |
| 打点被忽略 | 顺序不对（没在偏离时按恢复、偏离中又按开始）或原因不在列表里；manifest 的 `rejected_marks` 会加 1 |
| 回放页提示“还没有导出” | episode 没有导出成功，只能等导出完成后按帧标注 |
````

- [ ] **Step 3: Add the sidebar entry**

In `config/website/vitepress.config.mts`, after

```ts
          { text: "独立数据录制平台", link: "/development/recording-platform" },
```

add

```ts
          { text: "策略运行偏离标注", link: "/development/quality-annotation" },
```

- [ ] **Step 4: Build and run the site test to see it pass**

Run: `cd "$WT/website" && npm run build && PLAYWRIGHT_CHROME_PATH="$CHROME" npm run test:e2e -- site.spec.ts`
Expected: build succeeds (no dead links) and the site tests PASS

- [ ] **Step 5: Commit**

```bash
cd "$WT" && git add website/docs/development/quality-annotation.md config/website/vitepress.config.mts website/tests/site.spec.ts
git commit -m "docs: add the policy-run deviation annotation guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Final verification

- [ ] `lint` → `All checks passed!`
- [ ] `rec test/test_quality_events.py test/test_session_store_quality.py test/test_episode_tags_auto.py test/test_attempt_recording.py test/test_web_quality_events.py test/test_episode_tags.py test/test_session_store.py test/test_web_episode_tags.py test/test_subtask_annotation.py` → PASS
- [ ] `webc` → PASS
- [ ] `humble "cd src/recording/realman_recording && python3 -m pytest -q test/test_recording_quality_ros_integration.py test/test_recording_service_ros_integration.py -p no:cacheprovider && cd /w/.build/realman_bt && ctest -R ^test_policy_run_node$ --output-on-failure --timeout 240"` → PASS
- [ ] `cd "$WT/website" && npm run build:recording && npm run build:web-control && git -C "$WT" status --short -- src/recording/realman_recording/realman_recording/static src/driver/realman_web_control/realman_web_control/static` → no changes (committed bundles match sources)
- [ ] Recording replay, web-control and site Playwright suites → PASS
- [ ] On-robot acceptance (needs the user; not part of this plan's automation): deploy to realman_ts, run one real attempt from :8765 with two marked deviations, check the new episode in `realman/pi05-policy-rollouts`, its intervals and auto tags, edit it in replay, and confirm the sidecar frames match the replay timeline.
