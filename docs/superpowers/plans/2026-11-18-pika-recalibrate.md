# :8770 Pika 重标定按钮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One button in the :8770 Pika panel does a clean stop of the Pika stack, moves the libsurvive base-station calibration aside, restarts the stack, and then shows whether both Pikas are localized again.

**Architecture:** The Pika host helper (`scripts/pika_process_helper.py`) gets a locked `POST /recalibrate` that runs stop → rename `config.json` → start. The :8770 recording bridge gets a ROS-neutral module that refuses while a take is running or a Pika velocity command is flowing, then calls the helper through the existing loopback tunnel. Two aiohttp routes expose it. The frontend adds a button and a status line that watches the existing per-side pose `state`.

**Tech Stack:** Python 3.10 stdlib (helper), aiohttp + rclpy (recording bridge), TypeScript + Vite (recording web), pytest/unittest.

Spec: `docs/superpowers/specs/2026-11-18-pika-recalibrate-design.md`.

## Global Constraints

- Work in worktree `/Users/miakho/Organizations/realman_pi-pika-recal`, branch `feat/pika-recalibrate` (from `origin/main`).
- The helper stays **standard library only** and binds localhost only. The request body never chooses a command or a path.
- The calibration is **renamed, never deleted**: `<name>.bak-YYYYMMDD-HHMMSS`, then `-1`, `-2`, … on a name collision.
- If the stack is still running after the stop, **do not rename and do not start**.
- :8770 refuses with 409 while the recorder state is 1 (COUNTDOWN), 2 (RECORDING) or 4 (FINALIZING), or while any Pika side has `command_active`.
- `pika_helper_url` must be empty or `http://` on 127.0.0.1 / localhost / ::1. The repo default is `""` (feature off, button hidden).
- `pika_helper_timeout_sec` default 90.0. The frontend localization watch is 60 s.
- All runtime config lives under `config/` (project-config-layout rule). No private IPs or host secrets in repo files.
- User-facing strings are Chinese and copied exactly from this plan.
- Commits are Conventional Commits and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Test commands (from the worktree root):
- Helper: `python3 -m unittest tests/test_pika_process_helper.py -v`
- Recording: `cd src/recording/realman_recording && uv run -q --with pytest --with aiohttp --with pyyaml --with numpy --with pyarrow python -m pytest -q <files>`. Tests that need `rclpy` are skipped on the Mac; they run in the Docker image.
- Web: `cd website && npm ci && npm run build:recording`

---

### Task 1: Helper `POST /recalibrate`

**Files:**
- Modify: `scripts/pika_process_helper.py`
- Modify: `config/docker/pika_helper.json`
- Test: `tests/test_pika_process_helper.py`

**Interfaces:**
- Produces: HTTP `POST /recalibrate`.
  - 200 returns `{"ok": true, "action": "recalibrate", "backup": "<abs path>"|null, "started_at_ms", "finished_at_ms", "exit_code": 0, "output_tail": [...]}`.
  - 409 when busy, 404 `{"ok": false, "error": "recalibrate not configured"}`, and 500 `{"ok": false, "error", "output_tail"}` on failure.
  - `GET /status` → `last.backup` after a recalibrate.
- Config key `libsurvive_config` (optional string).

- [ ] **Step 1: Write the failing tests.** Append the following to `tests/test_pika_process_helper.py`, before the `if __name__ == "__main__":` line. Add `import tempfile` and `from unittest import mock` to the imports at the top.

```python
def make_recal(tmux, calibration, now=1795000000.0):
    config = {**CONFIG, "libsurvive_config": str(calibration)}
    return helper.PikaProcess(config, runner=tmux, sleep=FakeSleep(), home="/home/op", now=lambda: now)


class RecalibrateTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.calibration = self.dir / "config.json"
        self.calibration.write_text('{"lighthouse0": {}}')
        # 1795000000 = 2026-11-18 ... local; compute the expected stamp the same way the helper does.
        self.stamp = helper.time.strftime("%Y%m%d-%H%M%S", helper.time.localtime(1795000000.0))

    def tearDown(self):
        self.tmp.cleanup()

    def test_stop_then_move_then_start(self):
        tmux = FakeTmux(running=True)
        result = make_recal(tmux, self.calibration).recalibrate()
        verbs = [call[1] for call in tmux.calls]
        self.assertLess(verbs.index("send-keys"), verbs.index("new-session"))
        backup = self.dir / f"config.json.bak-{self.stamp}"
        self.assertEqual(result["backup"], str(backup))
        self.assertTrue(backup.exists())
        self.assertFalse(self.calibration.exists())
        self.assertTrue(result["ok"])
        self.assertEqual(result["action"], "recalibrate")
        self.assertTrue(tmux.running)

    def test_backup_name_collision_gets_a_suffix(self):
        (self.dir / f"config.json.bak-{self.stamp}").write_text("older")
        result = make_recal(FakeTmux(running=False), self.calibration).recalibrate()
        self.assertEqual(result["backup"], str(self.dir / f"config.json.bak-{self.stamp}-1"))
        self.assertEqual((self.dir / f"config.json.bak-{self.stamp}").read_text(), "older")

    def test_missing_calibration_still_restarts(self):
        self.calibration.unlink()
        tmux = FakeTmux(running=False)
        result = make_recal(tmux, self.calibration).recalibrate()
        self.assertIsNone(result["backup"])
        self.assertIn("new-session", [call[1] for call in tmux.calls])
        self.assertTrue(any("restarting only" in line for line in result["output_tail"]))

    def test_stack_still_running_after_stop_moves_nothing_and_starts_nothing(self):
        tmux = FakeTmux(running=True, stops_after=99, kill_survives=True)
        with self.assertRaises(helper.ActionFailed) as caught:
            make_recal(tmux, self.calibration).recalibrate()
        self.assertTrue(self.calibration.exists())
        self.assertNotIn("new-session", [call[1] for call in tmux.calls])
        self.assertIn("recalibrate failed", str(caught.exception))

    def test_rename_failure_does_not_start(self):
        tmux = FakeTmux(running=False)
        with mock.patch.object(helper.os, "replace", side_effect=OSError("read-only file system")):
            with self.assertRaises(helper.ActionFailed) as caught:
                make_recal(tmux, self.calibration).recalibrate()
        self.assertNotIn("new-session", [call[1] for call in tmux.calls])
        self.assertTrue(any("read-only" in line for line in caught.exception.output_tail))

    def test_busy_is_refused(self):
        process = make_recal(FakeTmux(running=False), self.calibration)
        process._busy = "start"
        with self.assertRaises(helper.Busy):
            process.recalibrate()
        self.assertTrue(self.calibration.exists())

    def test_not_configured(self):
        with self.assertRaises(helper.NotConfigured):
            make(FakeTmux(running=False)).recalibrate()

    def test_status_reports_the_backup(self):
        process = make_recal(FakeTmux(running=False), self.calibration)
        process.recalibrate()
        self.assertEqual(process.status()["last"]["backup"], str(self.dir / f"config.json.bak-{self.stamp}"))

    def test_config_path_validation(self):
        for broken in ("config.json", "~/.config/libsurvive/config.txt", "", 5):
            with self.assertRaises(ValueError):
                helper.validate_config({**CONFIG, "libsurvive_config": broken})
        helper.validate_config({**CONFIG, "libsurvive_config": "~/.config/libsurvive/config.json"})
        helper.validate_config({**CONFIG, "libsurvive_config": "/home/op/.config/libsurvive/config.json"})

    def test_tilde_is_expanded(self):
        config = {**CONFIG, "libsurvive_config": "~/.config/libsurvive/config.json"}
        process = helper.PikaProcess(config, runner=FakeTmux(), sleep=FakeSleep(), home="/home/op")
        self.assertEqual(str(process.calibration_path), "/home/op/.config/libsurvive/config.json")

    def test_repo_config_enables_recalibrate(self):
        config = helper.load_config(ROOT / "config/docker/pika_helper.json")
        self.assertEqual(config["libsurvive_config"], "~/.config/libsurvive/config.json")


class RecalibrateHttpTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        calibration = Path(self.tmp.name) / "config.json"
        calibration.write_text("{}")
        self.servers = []
        self.with_key = self._serve(make_recal(FakeTmux(running=False), calibration))
        self.without_key = self._serve(make(FakeTmux(running=False)))

    def _serve(self, process):
        server = ThreadingHTTPServer(("127.0.0.1", 0), helper.make_handler(process))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.servers.append(server)
        return f"http://127.0.0.1:{server.server_address[1]}"

    def tearDown(self):
        for server in self.servers:
            server.shutdown()
            server.server_close()
        self.tmp.cleanup()

    def post(self, base, path):
        request = Request(base + path, data=b"{}", method="POST")
        try:
            with urlopen(request, timeout=5) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            return error.code, json.loads(error.read())

    def test_recalibrate_route(self):
        status, payload = self.post(self.with_key, "/recalibrate")
        self.assertEqual((status, payload["ok"], payload["action"]), (200, True, "recalibrate"))

    def test_recalibrate_without_config_is_404(self):
        status, payload = self.post(self.without_key, "/recalibrate")
        self.assertEqual((status, payload["error"]), (404, "recalibrate not configured"))
```

- [ ] **Step 2: Run the tests and check they fail.**

Run: `python3 -m unittest tests/test_pika_process_helper.py -v 2>&1 | tail -5`
Expected: errors such as `TypeError: PikaProcess.__init__() got an unexpected keyword argument 'now'` and `AttributeError: ... 'recalibrate'`.

- [ ] **Step 3: Implement it in `scripts/pika_process_helper.py`.**

3a. Next to `class Busy`, add:

```python
class NotConfigured(Exception):
    pass
```

3b. In `validate_config`, just before `return document`, add:

```python
    if "libsurvive_config" in document:
        path = document["libsurvive_config"]
        if (not isinstance(path, str) or not (path.startswith("/") or path.startswith("~/"))
                or not path.endswith(".json")):
            raise ValueError("libsurvive_config must be an absolute or ~/ path to a .json file")
```

3c. `PikaProcess.__init__`:
- Add the parameter `now: Callable[[], float] = time.time` after `own_pgid`.
- After `self._own_pgid = ...`, add:

```python
        self._now = now
        calibration = config.get("libsurvive_config")
        self.calibration_path = (
            Path(home + calibration[1:] if calibration.startswith("~/") else calibration) if calibration else None
        )
```

3d. Replace the bodies of `start()` and `stop()` with shared `_start_locked()` and `_stop_locked()` helpers. Behaviour must stay identical; the existing tests prove it. Replace the whole `def start` … `return self._finish(exit_code, output)` block, and the same block for `def stop`, with:

```python
    def _start_locked(self) -> tuple[int, str]:
        if self._session():
            return 0, "already running"
        # Leftovers of an earlier stack hold the trackers; a second locator would crash-loop on them.
        note = ""
        groups = self._leftover_groups()
        if groups:
            note = self._stop_leftovers(groups) + "\n"
            if self._leftover_groups():
                return 1, note + "not started"
        exit_code, output = self._run("start")
        # Judge by the end state: a lost race ("duplicate session") still leaves Pika running.
        if exit_code != 0 and self._session():
            exit_code = 0
        return exit_code, note + output

    def _stop_locked(self) -> tuple[int, str]:
        if not self._running():
            return 0, "not running"
        exit_code, output = 0, ""
        if self._session():
            exit_code, output = self._run("stop")
            # Give the session time to stop the official group itself (its supervisor needs
            # SIGINT + SIGTERM timeouts), so leftovers are only the fallback.
            waited = 0.0
            while self._running() and waited < self.stop_grace_sec:
                self._sleep(STOP_POLL_SEC)
                waited += STOP_POLL_SEC
            if self._session():
                exit_code, output = self._run("kill")
                output = f"{output}\nkilled after {self.stop_grace_sec:g} s"
            if self._session():
                return exit_code or 1, f"{output}\npika session still running after kill"
        groups = self._leftover_groups()
        if groups:
            output = f"{output}\n{self._stop_leftovers(groups)}"
        # Judge by the end state, not by the last command's exit code.
        return (exit_code or 1 if self._leftover_groups() else 0), output

    def _guarded(self, action: str, body: Callable[[], tuple[int, str]]) -> dict[str, Any]:
        self._begin(action)
        try:
            exit_code, output = body()
        except StatusError as error:
            return self._finish(error.exit_code, f"{error.output}\n{error}")
        except BaseException:
            self._finish_quietly()
            raise
        return self._finish(exit_code, output)

    def start(self) -> dict[str, Any]:
        return self._guarded("start", self._start_locked)

    def stop(self) -> dict[str, Any]:
        return self._guarded("stop", self._stop_locked)

    def _move_calibration(self) -> str | None:
        path = self.calibration_path
        assert path is not None
        if not path.exists():
            return None
        stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime(self._now()))
        backup = path.with_name(f"{path.name}.bak-{stamp}")
        suffix = 0
        while backup.exists():
            suffix += 1
            backup = path.with_name(f"{path.name}.bak-{stamp}-{suffix}")
        os.replace(path, backup)
        return str(backup)

    def _recalibrate_locked(self) -> tuple[int, str]:
        exit_code, output = self._stop_locked()
        if exit_code != 0 or self._running():
            return exit_code or 1, f"{output}\nnot recalibrated: Pika stack still running"
        try:
            backup = self._move_calibration()
        except OSError as error:
            return 1, f"{output}\nnot recalibrated: cannot move {self.calibration_path}: {error}"
        with self._lock:
            self._last["backup"] = backup
        note = (f"calibration moved to {backup}" if backup
                else f"no calibration at {self.calibration_path}; restarting only")
        start_exit, start_output = self._start_locked()
        return start_exit, f"{output}\n{note}\n{start_output}"

    def recalibrate(self) -> dict[str, Any]:
        """Stop, move the libsurvive calibration aside, start: libsurvive re-solves the base stations."""
        if self.calibration_path is None:
            raise NotConfigured("recalibrate not configured")
        return self._guarded("recalibrate", self._recalibrate_locked)
```

`_finish` already copies `self._last` into the result, so `backup` reaches the 200 body and `/status`.

3e. In `make_handler.do_POST`:
- Change the action table to `{"/start": process.start, "/stop": process.stop, "/recalibrate": process.recalibrate}`.
- Add this branch before `except Busy`:

```python
            except NotConfigured as error:
                self._reply(404, {"ok": False, "error": str(error)})
```

3f. Update the module docstring's first paragraph. Append the sentence: "`POST /recalibrate` (only when `libsurvive_config` is set) stops the stack, renames the libsurvive calibration to `<name>.bak-<timestamp>` and starts again, so libsurvive re-solves the base stations (the :8770 重标定 button)."

3g. In `config/docker/pika_helper.json`, add the following line after `"leftover_grace_sec": 5`, with a comma on the line before it:

```json
  "libsurvive_config": "~/.config/libsurvive/config.json"
```

- [ ] **Step 4: Run the tests and check they pass.**

Run: `python3 -m unittest tests/test_pika_process_helper.py -v 2>&1 | tail -3`
Expected: `OK`. All earlier start/stop/leftover tests must still pass.

- [ ] **Step 5: Commit.**

```bash
git add scripts/pika_process_helper.py config/docker/pika_helper.json tests/test_pika_process_helper.py
git commit -m "feat(pika-helper): add POST /recalibrate that resets the libsurvive calibration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Recording-side guard and helper client (ROS-neutral)

**Files:**
- Create: `src/recording/realman_recording/realman_recording/pika_recalibrate.py`
- Test: `src/recording/realman_recording/test/test_pika_recalibrate.py`

**Interfaces:**
- Produces:
  - `validate_helper_url(value: str) -> str`: returns `""` or the URL with no trailing `/`; raises `ValueError`.
  - `call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[int, dict]`: `action` is `"status"` or `"recalibrate"`; the int is the HTTP status, 0 = unreachable.
  - `recalibrate(helper_url: str, timeout_sec: float, recording_state: Any, pika_snapshot: Mapping | None, call=call_helper) -> tuple[int, dict]`.
  - `BUSY_RECORDING_STATES = frozenset({1, 2, 4})`.

- [ ] **Step 1: Write the failing test** `src/recording/realman_recording/test/test_pika_recalibrate.py`:

```python
"""Guard and helper client behind the :8770 Pika 重标定 button (no ROS needed)."""
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from realman_recording.pika_recalibrate import BUSY_RECORDING_STATES, call_helper, recalibrate, validate_helper_url

IDLE_PIKA = {"sides": {"l": {"command_active": False}, "r": {"command_active": False}}}


class _Calls:
    def __init__(self, answer):
        self.answer = answer
        self.calls = []

    def __call__(self, url, action, timeout):
        self.calls.append((url, action, timeout))
        return self.answer


@pytest.mark.parametrize("state", sorted(BUSY_RECORDING_STATES))
def test_busy_recorder_is_refused_without_calling_the_helper(state):
    calls = _Calls((200, {"ok": True}))
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, state, IDLE_PIKA, call=calls)
    assert (status, body["error"]) == (409, "录制进行中，不能重标定")
    assert calls.calls == []


def test_active_pika_command_is_refused():
    calls = _Calls((200, {"ok": True}))
    pika = {"sides": {"l": {"command_active": True}, "r": {"command_active": False}}}
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, pika, call=calls)
    assert (status, body["error"]) == (409, "Pika 速度指令进行中（l），不能重标定")
    assert calls.calls == []


@pytest.mark.parametrize("state", [0, 6, 9, "IDLE", None])
def test_idle_states_call_the_helper(state):
    calls = _Calls((200, {"ok": True, "backup": "/h/config.json.bak-x"}))
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, state, IDLE_PIKA, call=calls)
    assert (status, body["backup"]) == (200, "/h/config.json.bak-x")
    assert calls.calls == [("http://127.0.0.1:8783", "recalibrate", 90.0)]


def test_missing_snapshot_is_not_active():
    status, _body = recalibrate("http://127.0.0.1:8783", 90.0, 0, None, call=_Calls((200, {"ok": True})))
    assert status == 200


@pytest.mark.parametrize("answer,expected", [
    ((409, {"ok": False, "error": "start is already running"}), (409, "start is already running")),
    ((500, {"ok": False, "error": "recalibrate failed with exit 1", "output_tail": ["x"]}),
     (502, "recalibrate failed with exit 1")),
    ((0, {"ok": False, "error": "Pika helper is not reachable"}), (502, "Pika helper is not reachable")),
    ((200, {"ok": False}), (502, "Pika helper answered HTTP 200")),
])
def test_helper_failures_are_mapped(answer, expected):
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, IDLE_PIKA, call=_Calls(answer))
    assert (status, body["error"]) == expected
    assert body["ok"] is False


def test_output_tail_is_passed_through():
    answer = (500, {"ok": False, "error": "e", "output_tail": ["a", "b"]})
    _status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, IDLE_PIKA, call=_Calls(answer))
    assert body["output_tail"] == ["a", "b"]


@pytest.mark.parametrize("value,expected", [
    ("", ""), ("  ", ""), ("http://127.0.0.1:8783/", "http://127.0.0.1:8783"),
    ("http://localhost:8783", "http://localhost:8783"), ("http://[::1]:8783", "http://[::1]:8783"),
])
def test_valid_helper_urls(value, expected):
    assert validate_helper_url(value) == expected


@pytest.mark.parametrize("value", ["https://127.0.0.1:8783", "http://192.168.5.49:8783", "ftp://localhost", "127.0.0.1:8783"])
def test_invalid_helper_urls(value):
    with pytest.raises(ValueError):
        validate_helper_url(value)


def _serve(status, payload):
    class Handler(BaseHTTPRequestHandler):
        def _send(self):
            body = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        do_GET = do_POST = _send

        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def test_call_helper_returns_status_and_json():
    server, url = _serve(200, {"ok": True, "action": "recalibrate"})
    try:
        assert call_helper(url, "recalibrate", 2.0) == (200, {"ok": True, "action": "recalibrate"})
    finally:
        server.shutdown()


def test_call_helper_passes_http_errors_through():
    server, url = _serve(409, {"ok": False, "error": "busy"})
    try:
        assert call_helper(url, "recalibrate", 2.0) == (409, {"ok": False, "error": "busy"})
    finally:
        server.shutdown()


def test_call_helper_unreachable():
    status, body = call_helper("http://127.0.0.1:9", "status", 0.5)
    assert status == 0 and body["error"] == "Pika helper is not reachable"


def test_call_helper_rejects_unknown_action():
    with pytest.raises(ValueError):
        call_helper("http://127.0.0.1:8783", "start", 1.0)
```

- [ ] **Step 2: Run the test and check it fails.**

Run: `cd src/recording/realman_recording && uv run -q --with pytest --with aiohttp --with pyyaml --with numpy --with pyarrow python -m pytest -q test/test_pika_recalibrate.py 2>&1 | tail -3`
Expected: `ModuleNotFoundError: No module named 'realman_recording.pika_recalibrate'`.

- [ ] **Step 3: Implement** `src/recording/realman_recording/realman_recording/pika_recalibrate.py`:

```python
"""Guarded one-click Pika lighthouse recalibration through the host pika_process_helper.

The helper (scripts/pika_process_helper.py) runs on the Pika host and is reached
through a loopback tunnel. This module is ROS-neutral: the bridge passes in the
latest recorder state and Pika snapshot, so the guard is unit-testable.
"""

from __future__ import annotations

import json
from typing import Any, Callable, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

# RecordingStatus states in which restarting Pika would cut a take: COUNTDOWN, RECORDING, FINALIZING.
BUSY_RECORDING_STATES = frozenset({1, 2, 4})
LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
_METHODS = {"status": "GET", "recalibrate": "POST"}

HelperCall = Callable[[str, str, float], tuple[int, dict[str, Any]]]


def validate_helper_url(value: str) -> str:
    url = str(value).strip().rstrip("/")
    if not url:
        return ""
    parts = urlsplit(url)
    if parts.scheme != "http" or parts.hostname not in LOOPBACK_HOSTS:
        raise ValueError("pika_helper_url must be empty or an http:// URL on 127.0.0.1, localhost or ::1")
    return url


def call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[int, dict[str, Any]]:
    method = _METHODS.get(action)
    if method is None:
        raise ValueError(f"unknown Pika helper action: {action}")
    request = Request(f"{base_url}/{action}", data=b"{}" if method == "POST" else None, method=method,
                      headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=timeout_sec) as response:  # noqa: S310 - validated loopback URL
            return response.status, _payload(response.read())
    except HTTPError as error:
        return error.code, _payload(error.read())
    except (URLError, OSError, TimeoutError, ValueError):
        return 0, {"ok": False, "error": "Pika helper is not reachable"}
    except Exception as error:  # noqa: BLE001 - e.g. http.client.HTTPException; the page must get an answer
        return 0, {"ok": False, "error": f"Pika helper call failed: {type(error).__name__}: {error}"}


def _payload(body: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(body or b"{}")
    except ValueError:
        return {"ok": False, "error": "Pika helper returned invalid JSON"}
    return payload if isinstance(payload, dict) else {}


def recalibrate(helper_url: str, timeout_sec: float, recording_state: Any,
                pika_snapshot: Mapping[str, Any] | None, call: HelperCall = call_helper) -> tuple[int, dict[str, Any]]:
    """Return (HTTP status, JSON body) for POST /api/pika/recalibrate."""
    if recording_state in BUSY_RECORDING_STATES:
        return 409, {"ok": False, "error": "录制进行中，不能重标定"}
    sides = (pika_snapshot or {}).get("sides") or {}
    active = sorted(side for side, data in sides.items() if isinstance(data, Mapping) and data.get("command_active"))
    if active:
        return 409, {"ok": False, "error": f"Pika 速度指令进行中（{'、'.join(active)}），不能重标定"}
    status, payload = call(helper_url, "recalibrate", timeout_sec)
    if status == 200 and payload.get("ok"):
        return 200, payload
    body = {"ok": False, "error": payload.get("error") or f"Pika helper answered HTTP {status}",
            "output_tail": payload.get("output_tail", [])}
    return (409 if status == 409 else 502), body
```

- [ ] **Step 4: Run the test and check it passes.**

Run: the same command as Step 2.
Expected: all tests pass.

- [ ] **Step 5: Commit.**

```bash
git add src/recording/realman_recording/realman_recording/pika_recalibrate.py src/recording/realman_recording/test/test_pika_recalibrate.py
git commit -m "feat(recording): guarded Pika recalibrate call to the host helper

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: :8770 routes, bridge wiring and config

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/web_server.py` (constructor at ~88-140, routes at ~216-260, new handlers after `_lerobot_export_all` at ~584)
- Modify: `src/recording/realman_recording/realman_recording/web_bridge_node.py` (parameters at ~85-92, server construction at ~183-201, new methods after `_export_all`)
- Modify: `config/ros/recording.yaml` (`/recording_web_bridge` section, after `pika_command_velocity_topics`)
- Test: `src/recording/realman_recording/test/test_web_pika_recalibrate.py` (new), `src/recording/realman_recording/test/test_web_bridge_config.py`, `src/recording/realman_recording/test/test_web_bridge_node.py`

**Interfaces:**
- Consumes: `recalibrate`, `call_helper` and `validate_helper_url` from Task 2.
- Produces:
  - `POST /api/pika/recalibrate` passes through `(status, body)`, or returns 404 `{"ok": false, "error": "Pika 重标定未配置"}`.
  - `GET /api/pika/helper` returns `{"configured": false}` or `{"configured": true, "reachable": bool, ...helper status}`.
  - The manifest key `pika_recalibrate: bool`.
  - `RecordingWebServer(..., pika_recalibrate: Callable[[], tuple[int, dict]] | None = None, pika_helper_status: Callable[[], tuple[int, dict]] | None = None)`.

- [ ] **Step 1: Write the failing tests.**

New file `src/recording/realman_recording/test/test_web_pika_recalibrate.py`:

```python
"""aiohttp routes for the :8770 Pika 重标定 button (run where aiohttp is installed)."""
import asyncio
import threading

import pytest

from realman_recording.web_server import RecordingWebServer


class _NullLogger:
    def warning(self, *_args):
        pass


def _server(recalibrate=None, helper_status=None):
    server = object.__new__(RecordingWebServer)
    server._pika_recalibrate = recalibrate
    server._pika_helper_status = helper_status
    server._logger = _NullLogger()
    return server


def _app(server):
    from aiohttp import web

    app = web.Application()
    app.router.add_post("/api/pika/recalibrate", server._pika_recalibrate_route)
    app.router.add_get("/api/pika/helper", server._pika_helper_route)
    return app


def _request(app, method, url):
    from aiohttp.test_utils import TestClient, TestServer

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await getattr(client, method)(url)
            return response.status, await response.json()
        finally:
            await client.close()

    return asyncio.run(run())


def test_recalibrate_passes_status_and_body_through_off_the_loop():
    pytest.importorskip("aiohttp")
    seen = {}

    def recalibrate():
        seen["thread"] = threading.current_thread().name
        return 409, {"ok": False, "error": "录制进行中，不能重标定"}

    status, body = _request(_app(_server(recalibrate=recalibrate)), "post", "/api/pika/recalibrate")
    assert (status, body["error"]) == (409, "录制进行中，不能重标定")
    assert seen["thread"] != threading.main_thread().name


def test_recalibrate_not_configured_is_404():
    pytest.importorskip("aiohttp")
    status, body = _request(_app(_server()), "post", "/api/pika/recalibrate")
    assert (status, body["error"]) == (404, "Pika 重标定未配置")


def test_helper_status_routes():
    pytest.importorskip("aiohttp")
    assert _request(_app(_server()), "get", "/api/pika/helper") == (200, {"configured": False})
    status, body = _request(_app(_server(helper_status=lambda: (200, {"running": True, "busy": False}))),
                            "get", "/api/pika/helper")
    assert status == 200
    assert body == {"configured": True, "reachable": True, "running": True, "busy": False}
    _status, body = _request(_app(_server(helper_status=lambda: (0, {"ok": False, "error": "x"}))),
                             "get", "/api/pika/helper")
    assert body["reachable"] is False
```

Append to `src/recording/realman_recording/test/test_web_bridge_config.py`:

```python
def test_pika_recalibrate_is_off_by_default_and_outlasts_the_helper():
    import json

    bridge, recorder = _bridge_params()
    assert bridge["pika_helper_url"] == ""
    assert "pika_helper_url" not in recorder
    helper = json.loads((ROOT / "config" / "docker" / "pika_helper.json").read_text(encoding="utf-8"))
    status = helper["status_timeout_sec"]
    # Worst recalibrate = worst stop (grace + leftover INT/TERM/KILL + status probes)
    # + worst start (status probes + start + leftover clearing); LEFTOVER_TERM_WAIT_SEC is 1.0.
    worst_stop = helper["stop_grace_sec"] + helper["leftover_grace_sec"] + 2 * 1.0 + 2 * status
    worst_start = 2 * status + helper["timeout_sec"] + helper["leftover_grace_sec"] + 2 * 1.0
    assert worst_stop + worst_start < bridge["pika_helper_timeout_sec"]
```

Append to `src/recording/realman_recording/test/test_web_bridge_node.py`:

```python
def test_pika_recalibrate_passes_recorder_state_and_snapshot(monkeypatch):
    __import__("pytest").importorskip("rclpy")
    from realman_recording import web_bridge_node
    from realman_recording.pika_motion import PikaMotionCache
    from realman_recording.web_bridge_node import RecordingWebBridgeNode

    seen = {}

    def fake_recalibrate(url, timeout, state, snapshot):
        seen.update(url=url, timeout=timeout, state=state, sides=sorted(snapshot["sides"]))
        return 200, {"ok": True}

    monkeypatch.setattr(web_bridge_node, "recalibrate", fake_recalibrate)
    node = object.__new__(RecordingWebBridgeNode)
    node._pika_helper_url = "http://127.0.0.1:8783"
    node._pika_helper_timeout_sec = 90.0
    node._recording_status = {"state": 2}
    node._pika = PikaMotionCache(["l", "r"], ["/pika_pose_l", "/pika_pose_r"], [])
    assert node._pika_recalibrate() == (200, {"ok": True})
    assert seen == {"url": "http://127.0.0.1:8783", "timeout": 90.0, "state": 2, "sides": ["l", "r"]}
```

- [ ] **Step 2: Run the tests and check they fail.**

Run: `cd src/recording/realman_recording && uv run -q --with pytest --with aiohttp --with pyyaml --with numpy --with pyarrow python -m pytest -q test/test_web_pika_recalibrate.py test/test_web_bridge_config.py test/test_web_bridge_node.py 2>&1 | tail -5`
Expected: FAIL with `AttributeError: ... '_pika_recalibrate_route'` and `KeyError: 'pika_helper_url'`. The bridge node test is skipped on the Mac (no rclpy).

- [ ] **Step 3: Implement it.**

3a. `web_server.py`, in `RecordingWebServer.__init__`:
- Add two keyword parameters after `quality_reasons`:

```python
        pika_recalibrate: Callable[[], tuple[int, dict[str, Any]]] | None = None,
        pika_helper_status: Callable[[], tuple[int, dict[str, Any]]] | None = None,
```

- Store them after `self._quality_reasons = ...`:

```python
        self._pika_recalibrate = pika_recalibrate
        self._pika_helper_status = pika_helper_status
```

3b. `web_server.py` routes: add these two lines right after `app.router.add_post("/api/lerobot/{session_id}/subtasks", ...)`. They must come before the `/models/` and catch-all `/{path:.*}` routes.

```python
        app.router.add_post("/api/pika/recalibrate", self._pika_recalibrate_route)
        app.router.add_get("/api/pika/helper", self._pika_helper_route)
```

3c. `web_server.py`: add these handlers right after `_lerobot_export_all`:

```python
    async def _pika_recalibrate_route(self, _request: Any) -> Any:
        """Stop Pika, move the libsurvive calibration aside, start again (host helper)."""
        from aiohttp import web
        if self._pika_recalibrate is None:
            return web.json_response({"ok": False, "error": "Pika 重标定未配置"}, status=404)
        status, payload = await asyncio.to_thread(self._pika_recalibrate)
        if status != 200:
            self._logger.warning(f"Pika recalibrate refused/failed ({status}): {payload.get('error')}")
        return web.json_response(payload, status=status)

    async def _pika_helper_route(self, _request: Any) -> Any:
        from aiohttp import web
        if self._pika_helper_status is None:
            return web.json_response({"configured": False})
        status, payload = await asyncio.to_thread(self._pika_helper_status)
        return web.json_response({"configured": True, "reachable": status == 200, **payload})
```

3d. `web_bridge_node.py`:
- Add the import next to `from .pika_motion import PikaMotionCache`:

```python
from .pika_recalibrate import call_helper, recalibrate, validate_helper_url
```

- After `self.declare_parameter("pika_command_velocity_topics", [""])`, add:

```python
        # Host pika_process_helper reached over a loopback tunnel; "" hides the :8770 重标定 button.
        self.declare_parameter("pika_helper_url", "")
        self.declare_parameter("pika_helper_timeout_sec", 90.0)
```

- Right after `self._manifest = build_recording_manifest(...)`, add:

```python
        self._pika_helper_url = validate_helper_url(str(self.get_parameter("pika_helper_url").value))
        self._pika_helper_timeout_sec = float(self.get_parameter("pika_helper_timeout_sec").value)
        if self._pika_helper_timeout_sec <= 0.0:
            raise ValueError("pika_helper_timeout_sec must be positive")
        self._manifest["pika_recalibrate"] = bool(self._pika_helper_url)
```

- In the `RecordingWebServer(...)` call, after `quality_reasons=quality_reasons,`, add:

```python
            pika_recalibrate=self._pika_recalibrate if self._pika_helper_url else None,
            pika_helper_status=self._pika_helper_status if self._pika_helper_url else None,
```

- After the `_export_all` method, add:

```python
    def _pika_recalibrate(self) -> tuple[int, dict[str, Any]]:
        """Runs on the aiohttp worker thread; blocks only it for up to pika_helper_timeout_sec."""
        return recalibrate(
            self._pika_helper_url, self._pika_helper_timeout_sec,
            self._recording_status.get("state"), self._pika.snapshot(time.monotonic_ns()),
        )

    def _pika_helper_status(self) -> tuple[int, dict[str, Any]]:
        return call_helper(self._pika_helper_url, "status", 5.0)
```

3e. In `config/ros/recording.yaml`, under `/recording_web_bridge` → `ros__parameters`, after `pika_command_velocity_topics: [...]`, add:

```yaml
    # :8770 Pika 重标定 button: the host pika_process_helper (scripts/pika_process_helper.py)
    # over a loopback URL, e.g. http://127.0.0.1:8783 through the Pika-host tunnel.
    # "" hides the button. The timeout covers a worst-case stop + start on the helper.
    pika_helper_url: ""
    pika_helper_timeout_sec: 90.0
```

- [ ] **Step 4: Run the tests and check they pass.**

Run: `cd src/recording/realman_recording && uv run -q --with pytest --with aiohttp --with pyyaml --with numpy --with pyarrow python -m pytest -q test/test_web_pika_recalibrate.py test/test_web_bridge_config.py test/test_web_bridge_node.py test/test_pika_recalibrate.py test/test_web_server.py 2>&1 | tail -3`
Expected: all pass; rclpy tests skipped.

- [ ] **Step 5: Commit.**

```bash
git add src/recording/realman_recording/realman_recording/web_server.py src/recording/realman_recording/realman_recording/web_bridge_node.py config/ros/recording.yaml src/recording/realman_recording/test/test_web_pika_recalibrate.py src/recording/realman_recording/test/test_web_bridge_config.py src/recording/realman_recording/test/test_web_bridge_node.py
git commit -m "feat(recording): expose Pika recalibrate on :8770 behind pika_helper_url

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: :8770 重标定 button and status line

**Files:**
- Create: `src/recording/realman_recording/web/src/pika-recalibrate.ts`
- Modify: `src/recording/realman_recording/web/index.html` (Pika panel, the `pika-head` span and after `#pika-cards`)
- Modify: `src/recording/realman_recording/web/src/main.ts` (`type Manifest` at ~30, `pikaView.render` at ~557, `initPikaView` at ~868, the `/api/layout` `.then` at ~876)
- Modify: `src/recording/realman_recording/web/src/styles.css` (after the `.pika-cards` rule at ~157)
- Regenerated: `src/recording/realman_recording/realman_recording/static/` (Vite output; commit the regenerated files and the deleted old hashed assets)

**Interfaces:**
- Consumes:
  - `POST /api/pika/recalibrate` (Task 3), with body `{ok, error?, backup?, output_tail?}`;
  - the manifest key `pika_recalibrate`;
  - `PikaSnapshot` from `./pika-view`.
- Produces: `initPikaRecalibrate(button, line) -> { enable(on: boolean): void; observe(snapshot: PikaSnapshot | undefined): void }`.

- [ ] **Step 1: Create `web/src/pika-recalibrate.ts`.**

```ts
import type { PikaSnapshot } from "./pika-view";

// One-click lighthouse recalibration: POST, then watch every side's pose state turn live.
const WATCH_MS = 60_000;
// The helper does not stream progress; these labels follow the usual timing (stop grace ≤ 15 s).
const STEPS: [number, string][] = [[0, "停止中…"], [15_000, "清除标定…"], [17_000, "启动中…"]];
const CONFIRM = "将重启 Pika 栈并清除基站标定；请把两个 Pika 静置在两个基站都能看到的位置。继续？";
const SIDE_NAMES: Record<string, string> = { l: "左", r: "右" };

type RecalibrateResult = { ok?: boolean; error?: string; backup?: string | null; output_tail?: string[] };

export function initPikaRecalibrate(button: HTMLButtonElement, line: HTMLElement) {
  let running = false;
  let watchUntil = 0;
  let backup: string | null = null;
  let timers: number[] = [];

  function show(text: string, tone: "info" | "ok" | "warn" = "info") {
    line.hidden = false;
    line.dataset.tone = tone;
    line.textContent = text;
  }

  function backupNote(): string {
    return backup ? `（旧标定已备份为 ${backup}）` : "";
  }

  async function run() {
    if (running || !window.confirm(CONFIRM)) return;
    running = true;
    button.disabled = true;
    watchUntil = 0;
    backup = null;
    timers = STEPS.map(([delay, text]) => window.setTimeout(() => show(text), delay));
    let status = 0;
    let result: RecalibrateResult = {};
    try {
      const response = await fetch("/api/pika/recalibrate", { method: "POST" });
      status = response.status;
      result = await response.json().catch(() => ({}));
    } catch (error) {
      result = { error: `请求失败：${String(error)}` };
    }
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    running = false;
    button.disabled = false;
    if (status === 200 && result.ok) {
      backup = result.backup ?? null;
      watchUntil = Date.now() + WATCH_MS;
      show(`等待定位…${backupNote()}`);
    } else {
      const tail = result.output_tail?.length ? ` · ${result.output_tail.at(-1)}` : "";
      show(`重标定失败：${result.error ?? `HTTP ${status}`}${tail}`, "warn");
    }
  }

  function observe(snapshot: PikaSnapshot | undefined) {
    if (!watchUntil) return;
    const sides = snapshot?.sides ?? {};
    const names = Object.keys(sides);
    const notLive = names.filter((side) => sides[side].state !== "live");
    if (names.length && !notLive.length) {
      watchUntil = 0;
      show(`已重新定位${backupNote()}`, "ok");
    } else if (Date.now() > watchUntil) {
      watchUntil = 0;
      const which = notLive.map((side) => SIDE_NAMES[side] ?? side).join("、") || "无快照";
      show(`未重新定位（${which}）：请重新插拔两个 Pika 后再点一次重标定`, "warn");
    }
  }

  button.addEventListener("click", () => { void run(); });
  return {
    enable(on: boolean) { button.hidden = !on; },
    observe,
  };
}
```

- [ ] **Step 2: Edit `web/index.html`.**
- In the Pika panel, replace `<button id="pika-recenter" class="button ghost small" type="button" title="视角重新跟随 Pika">居中</button></span>` with:

```html
<button id="pika-recenter" class="button ghost small" type="button" title="视角重新跟随 Pika">居中</button><button id="pika-recalibrate" class="button ghost small" type="button" hidden title="重启 Pika 栈并让 libsurvive 重新求解基站位置">重标定</button></span>
```

- Replace `<div id="pika-cards" class="pika-cards"></div>` with:

```html
<div id="pika-cards" class="pika-cards"></div><div id="pika-recal-line" class="pika-recal" role="status" hidden></div>
```

- [ ] **Step 3: Edit `web/src/main.ts`.**
- Add the import next to the `./pika-view` import:

```ts
import { initPikaRecalibrate } from "./pika-recalibrate";
```

- Change `type Manifest = { version: number; default_joint_position_rad: number; robots: Robot[] };` to:

```ts
type Manifest = { version: number; default_joint_position_rad: number; robots: Robot[]; pika_recalibrate?: boolean };
```

- Right after the `const pikaView = initPikaView(...);` statement, add:

```ts
const pikaRecalibrate = initPikaRecalibrate($<HTMLButtonElement>("#pika-recalibrate"), $("#pika-recal-line"));
```

- Change `pikaView.render(payload.pika);` to:

```ts
  pikaView.render(payload.pika);
  pikaRecalibrate.observe(payload.pika);
```

- In the `/api/layout` chain, change `manifest = next as Manifest;` to:

```ts
    manifest = next as Manifest;
    pikaRecalibrate.enable(Boolean(manifest.pika_recalibrate));
```

`pikaRecalibrate` is a `const` declared after `render` is defined. `render` only runs on WebSocket messages, and `connect()` is called after this declaration, so there is no temporal-dead-zone access. Check this in the file: `connect();` must come after the new line.

- [ ] **Step 4: Edit `web/src/styles.css`.** Add these rules after the `.pika-cards { ... }` rule:

```css
.pika-recal { margin: 8px 12px 0; padding: 6px 10px; border-radius: 6px; background: var(--card-sub); color: var(--text-2); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.pika-recal[hidden] { display: none; }
.pika-recal[data-tone="ok"] { color: var(--ok); }
.pika-recal[data-tone="warn"] { color: var(--warn); }
```

- [ ] **Step 5: Build, and type-check through the build.**

Run: `cd website && npm ci && npm run build:recording 2>&1 | tail -5`
Expected: the Vite build succeeds, and `src/recording/realman_recording/realman_recording/static/index.html` references new hashed assets. Then:

Run: `grep -c "pika-recalibrate" src/recording/realman_recording/realman_recording/static/index.html`
Expected: `1`.

- [ ] **Step 6: Commit.**

```bash
git add -A src/recording/realman_recording/web src/recording/realman_recording/realman_recording/static
git commit -m "feat(recording-web): Pika 重标定 button with localization watch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Documentation

**Files:**
- Modify: `website/docs/development/pika-teleop.md`: add a new `### 基站重标定（:8770 一键）` subsection under `## 链路与已知问题` (~line 306), before `### 输入链路是 Wi‑Fi，入站会丢包`.

- [ ] **Step 1: Write the section.** Content (Chinese, matching the page's style):

```markdown
### 基站重标定（:8770 一键）

**何时用**：Pika 一直在基站视野内，但 :8770 Pika 卡片显示 STALE / NO DATA，且 Pika 主机上
`pika_localization_status_<side>` 为 false、追踪器 USB 仍在发数据（`/sys/bus/usb/devices/<port>/urbnum`
持续增长）。这通常是 libsurvive 把基站位置解错了：`~/.config/libsurvive/config.json` 中某个
`lighthouseN.pose` 与以前相比位置跳了几十厘米而朝向几乎不变，locator 日志里 `Global solve ... error of`
比正常大一到两个数量级。2026-11-18 左 Pika 断流即此原因。

**按钮做什么**：:8770「Pika 运动 3D」面板的 **重标定** 调 `POST /api/pika/recalibrate`，经回环隧道转到
Pika 主机上的 `pika_process_helper` `POST /recalibrate`，在同一把锁里：干净停栈（含残留进程组清理）→
把 `config.json` 改名为 `config.json.bak-YYYYMMDD-HHMMSS` → 启动。libsurvive 随后从头求解基站。页面
等待左右两侧位姿都回到 LIVE，最多 60 s。

- 录制进行中（倒计时 / 录制 / 收尾）或任一侧 Pika 速度指令在发时拒绝（409），不会打断采集或遥操作。
- 停栈不干净时不改名、不启动；改名失败不启动。
- 60 s 内未重新定位：先 **重新插拔两个 Pika**，再点一次。重启偶尔会让追踪器卡住（见下方运行时陷阱）。
- 启用条件：helper 配置 `libsurvive_config`（`config/docker/pika_helper.json`），且 `config/ros/recording.yaml`
  的 `/recording_web_bridge` 设置 `pika_helper_url`（仓库默认空 = 隐藏按钮）。

**恢复旧标定**：在 Pika 主机上先停栈，再把某个 `config.json.bak-*` 改回 `config.json`，然后启动。
```

- [ ] **Step 2: Build the site.**

Run: `cd website && npm run build 2>&1 | tail -3`
Expected: the build succeeds (no dead-link errors).

- [ ] **Step 3: Commit.**

```bash
git add website/docs/development/pika-teleop.md
git commit -m "docs(pika): document the :8770 lighthouse recalibration button

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## After the tasks (not part of the plan's code; needs the user's go-ahead)

1. Run the full recording suite in the image: `-p no:anyio`, same as earlier recording PRs. Then push and open the PR.
2. Deploy as in the spec's Deployment section: helper on enine, then the SJD image plus the host `pika_helper_url` and recreating only `realman_recording`, with rollbacks.
3. Live check on SJD with both Pikas visible. This is also the actual fix for today's left Pika.
