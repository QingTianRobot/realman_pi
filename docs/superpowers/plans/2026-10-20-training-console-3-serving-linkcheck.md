# Training Console — Plan 3: start/stop of the inference chain and the data-path checks

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `realman-train serve start|stop|status` controls both ends of the inference chain (openpi-serve on server5090, policy_bridge on realman_ts) with the safety refusals of the spec, and `realman-train linkcheck` runs the four data-path checks with pass/fail + value + threshold.

**Architecture:** `robot.py` is the only place that talks to realman_ts (ssh through the `Runner`, `docker` on the robot host, two small scripts run inside robot containers: `remote_scripts/ros_probe.py` for the ROS graph and `remote_scripts/infer_probe.py` for timed real-size inferences). `serving.py` owns start/stop/status (start and stop run as background jobs of one kind, `serve`, so they never overlap), `linkcheck.py` owns the four checks and their history, `serving_state.py` keeps what was started (`<console_dir>/serving.json`). Everything outside the process goes through `Runner`, so the tests fake ssh and docker and check command order, refusals and thresholds.

**Tech Stack:** Python 3.10, PyYAML, pytest, argparse, `socket`. Remote scripts: rclpy + `realman_msgs`/`diagnostic_msgs`/`std_msgs` (robot ROS container), numpy + openpi_client (serve container or the bridge's vendored copy). No new dependencies.

Spec: `docs/superpowers/specs/2026-10-20-training-console-design.md` (section "服务控制与链路检测", delivery step 4). Plans 1–2: `docs/superpowers/plans/2026-10-20-training-console-1-data-inspect.md`, `...-2-jobs-steps.md` (merged, PRs #50 and #53). Branch: `feat/training-console-serving` from main `8a6aeb6`. Plan 4 = web console + container.

**Facts this plan relies on (memory notes, 2026-10-14…10-19):**
- openpi-serve: compose project `openpi-serve`, container `openpi-serve-openpi-1`, files `~/organization/openpi/compose.yaml` + `~/data/realman/compose.serve.yaml`, env `OPENPI_COMPOSE_PROJECT_NAME=openpi-serve OPENPI_POLICY_PORT=18000 SERVE_GPU=2 OPENPI_DOCKER_DATA_DIR=~/organization/openpi-docker-data SERVE_CONFIG=<config> SERVE_CHECKPOINT=checkpoints/<config>/<exp>/<step>`, `runtime: nvidia` (stale CDI spec). Currently serving `pi05_realman_multitask_action_only/m_multitask_b16_2gpu/29999`.
- First inference after a serve restart JIT-compiles ~26 s and blocks the websocket loop; the bridge's 1.5 s requests then time out and it pauses after 5 failures → warm up before the bridge talks to it (then ~65 ms).
- policy_bridge: service `policy_bridge` of the robot's compose (`~/realman_pi`, project `realman_pi`, container `realman_pi-policy_bridge-1`); server address from `POLICY_WS_HOST` (compose interpolation, host `.env` has server5090's LAN address), port is the literal `network.server_port: 18000` in `config/ros/policy_bridge.yaml` (the bridge's env expansion yields strings, so the port cannot be overridden by env: the console refuses a port the robot's yaml does not use). A recreate is fine since the 10-20 redeploy (code is in the image). The bridge starts inactive (`allow_publish=0`); only `/policy/activate` makes it publish.
- `/policy/stats` (diagnostic_msgs/DiagnosticArray, 1 Hz, status name `policy_bridge`): numbers `paused`, `allow_publish`, `mode_active`, `queue_remaining`, counters `published`, `queue_empty`, `prompt_change`, …, and the string `prompt`. Runtime prompt: std_msgs/String on `/policy/prompt`. BT mode: `realman_msgs/InputModeState` on `/realman_bt_executor/input_mode_state` (`requested_mode`, `selected_mode`, `active_mode`, `phase`), not published at a high fixed rate → wait up to 10 s, a missing message means the BT is not running.
- Bridge request = `{"wrist_image": uint8 224x224x3, "global_image": uint8 224x224x3, "state": float32[7], "prompt": str}`.
- Pika locator floods the Wi-Fi with small DDS packets (~2.6 MB/s, >18k pkt/s); then bulk TCP realman_ts → server5090 collapses to 0.1 MB/s while ping looks fine. Gate used on 10-14…10-19: Wi-Fi < 600 KB/s (500 on 10-14), bulk ≥ 2 MB/s, no `pika_*` nodes; 1400-byte pings showed 6 % loss when flooded.
- realman_ts cannot reach GitHub; server5090 reaches it as `ssh realman_local`.

**Verified on 2026-10-19 (parent session's live deployment):** ROS graph container `realman_pi-realman_bringup_remote-1` (the ros2 CLI daemon hangs: the probe uses rclpy directly), serve service `openpi`, serve_policy listens on `0.0.0.0:8000` inside the container (host port mapped from `OPENPI_POLICY_PORT`), Wi-Fi interface `wlx70f11c299f12` (auto-detected as the first `wl*`), the BT publishes `input_mode_state` transient-local depth 1 only on change (the probe subscribes transient-local and gets the current state at once). **Still to confirm in Task 6's read-only check:** the address realman_ts sees in `$SSH_CLIENT` (must be server5090's LAN address, not Tailscale; else set `serving.server_host` from `.env`-style local config, never in the repo).

## Global Constraints

- Python 3.10; `from __future__ import annotations` in every module of the package (not in `remote_scripts/*.py` or `openpi_scripts/*.py`, which run in other containers).
- Lint: `ruff check --config config/python/ruff.toml src tools scripts docker` must pass (CI).
- Tests: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider` (as CI). Unit tests never call real `ssh`, `docker`, `nvidia-smi` or sockets: functions take `runner` (and `port_open`, `sleep`, `clock`) arguments and tests pass fakes.
- Config lives under repo-root `config/training/training_console.yaml`; none in the package.
- Never write private IPs, tokens or host secrets into code, config, docs, tests or logs; hosts by ssh alias. Test addresses use the documentation range `192.0.2.x`.
- Never call `./rm65` (up/down/build/anything), never start/stop/recreate bringup, web, recording containers or the behaviour tree, never change the BT mode, never call `/policy/activate`. Robot-side writes are exactly: `docker compose up -d --no-deps --no-build policy_bridge`, `docker compose stop policy_bridge`, and publishing the model's task prompt on `/policy/prompt`.
- start and stop refuse while the BT's `requested_mode`, `selected_mode` or `active_mode` is in `serving.policy_modes` (`[policy]`).
- start refuses: a GPU with more than `openpi.gpu_busy_mib` (2000) MiB used, a port that is already listening, a port different from the robot's `policy_bridge.yaml` `network.server_port`, an openpi-serve container that is already running, a model without known task prompts, a task the model was not trained on.
- GPU containers use `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES` (in `compose.serve.yaml`), never `gpus:`.
- Prompts must match policy_bridge verbatim and come only from the model (`model_card.json` tasks, else the training view's `contract.json`).
- Stop order: bridge first, then openpi-serve.
- CLI: `serve start` and `serve stop` need `--yes` unless `--dry-run` (same rule as `train`); `serve status` and `linkcheck` are read-only and need neither. Web tokens are Plan 4.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (exactly this model name; check every commit's trailer).
- Docs are part of the feature: `website/docs/development/training-console.md`, `website/docs/reference/configuration.md`, `website/docs/reference/cli-and-env.md`.
- Verification on the machines may run `serve status`, `serve start --dry-run`, `serve stop --dry-run` and `linkcheck` (all read-only; the only robot-side side effect of linkcheck is a transient ROS probe node and 5+1 inference requests). Really starting/stopping openpi-serve or the bridge needs the user's explicit OK in that session; nothing may make the arm move.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/training/realman_training/realman_training/config.py` | (modify) `ServingConfig`, `LinkcheckConfig`, their validation, top keys `serving`, `linkcheck` |
| `config/training/training_console.yaml` | (modify) `serving` and `linkcheck` sections |
| `src/training/realman_training/realman_training/robot.py` | (create) `Robot`: ssh argv, remote run/check, container facts, server address, bridge port, ROS probe, bridge compose commands |
| `src/training/realman_training/realman_training/remote_scripts/ros_probe.py` | (create) runs in a robot ROS container: `nodes`, `mode=SEC`, `stats=SEC`, `prompt=TEXT` → one JSON line |
| `src/training/realman_training/realman_training/remote_scripts/infer_probe.py` | (create) runs in the serve or bridge container: N timed real-size inferences → one JSON line |
| `src/training/realman_training/realman_training/serving_state.py` | (create) `<console_dir>/serving.json` read/write |
| `src/training/realman_training/realman_training/linkcheck.py` | (create) the 4 checks, `Check`, `run_checks`, history, job entry `run` |
| `src/training/realman_training/realman_training/serving.py` | (create) model resolution, `start`, `stop`, `status`, job entry `run` |
| `src/training/realman_training/realman_training/jobs.py` | (modify) `STEPS` gains `serve` and `linkcheck` |
| `src/training/realman_training/realman_training/cli.py` | (modify) `serve start|stop|status`, `linkcheck`, shared `_run_job` |
| `src/training/realman_training/setup.py` | (modify) package_data `remote_scripts/*.py` |
| `src/training/realman_training/test/robot_fakes.py` | (create) FakeRunner rules for a fake realman_ts + server5090 |
| `src/training/realman_training/test/test_config.py` | (modify) serving/linkcheck defaults and validation |
| `src/training/realman_training/test/test_robot.py` | (create) |
| `src/training/realman_training/test/test_linkcheck.py` | (create) |
| `src/training/realman_training/test/test_serving.py` | (create) |
| `src/training/realman_training/test/test_cli.py` | (modify) serve/linkcheck commands |
| `website/docs/development/training-console.md`, `website/docs/reference/configuration.md`, `website/docs/reference/cli-and-env.md` | (modify) docs |

---

### Task 1: Config sections `serving` and `linkcheck`

**Files:**
- Modify: `src/training/realman_training/realman_training/config.py`
- Modify: `config/training/training_console.yaml`
- Test: `src/training/realman_training/test/test_config.py`

**Interfaces:**
- Produces: `ServingConfig`, `LinkcheckConfig` (frozen dataclasses below), `ConsoleConfig.serving`, `ConsoleConfig.linkcheck`.

- [ ] **Step 1: Write the failing tests** (append to `test/test_config.py`; extend the import line with `LinkcheckConfig, ServingConfig`)

```python
def test_the_shipped_serving_and_linkcheck_sections_equal_the_defaults():
    config = load_config(DEFAULT_CONFIG)
    assert config.serving == ServingConfig()
    assert config.linkcheck == LinkcheckConfig()


def test_serving_defaults_are_the_deployed_chain():
    s = ServingConfig()
    assert (s.project, s.service, s.gpu, s.port) == ("openpi-serve", "openpi", 2, 18000)
    assert s.compose_files == ("~/organization/openpi/compose.yaml", "~/data/realman/compose.serve.yaml")
    assert s.model == "pi05_realman_multitask_action_only/m_multitask_b16_2gpu"
    assert s.bridge_container == "realman_pi-policy_bridge-1" and s.bridge_service == "policy_bridge"
    assert s.policy_modes == ("policy",)
    assert s.warmup_rounds == 2 and s.container_port == 8000
    assert s.ros_container == "realman_pi-realman_bringup_remote-1"


def test_linkcheck_thresholds_come_from_the_live_runs():
    lc = LinkcheckConfig()
    assert lc.wifi_max_kb_per_sec == 600.0 and lc.wifi_window_sec == 5.0
    assert lc.bulk_min_mb_per_sec == 2.0
    assert lc.infer_max_ms == 200.0
    assert lc.pika_node_prefix == "pika_"


def test_serving_values_from_the_file(tmp_path):
    path = _write(tmp_path, "training_console:\n  serving:\n    gpu: 3\n    port: 18001\n    checkpoint: 20000\n  linkcheck:\n    infer_max_ms: 150\n")
    config = load_config(path)
    assert (config.serving.gpu, config.serving.port, config.serving.checkpoint) == (3, 18001, "20000")
    assert config.linkcheck.infer_max_ms == 150.0


@pytest.mark.parametrize(
    "body, fragment",
    [
        ("serving:\n    port: 0\n", "serving.port"),
        ("serving:\n    gpu: -1\n", "serving.gpu"),
        ("serving:\n    warmup_rounds: 0\n", "serving.warmup_rounds"),
        ("serving:\n    model: just_a_config\n", "serving.model"),
        ("serving:\n    container_port: 70000\n", "serving.container_port"),
        ("linkcheck:\n    wifi_window_sec: 0\n", "linkcheck.wifi_window_sec"),
        ("linkcheck:\n    infer_rounds: 0\n", "linkcheck.infer_rounds"),
        ("serving:\n    nope: 1\n", "unknown serving keys"),
    ],
)
def test_bad_serving_and_linkcheck_values_are_refused(tmp_path, body, fragment):
    path = _write(tmp_path, "training_console:\n  " + body)
    with pytest.raises(ValueError, match=fragment.replace(".", r"\.")):
        load_config(path)
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_config.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'LinkcheckConfig'`).

- [ ] **Step 3: Implement** — in `config.py`, after `OpenpiConfig`:

```python
@dataclasses.dataclass(frozen=True)
class ServingConfig:
    """openpi-serve on server5090 and policy_bridge on realman_ts: the two ends of the inference chain."""

    project: str = "openpi-serve"
    service: str = "openpi"  # container <project>-<service>-1
    compose_files: tuple[str, ...] = ("~/organization/openpi/compose.yaml", "~/data/realman/compose.serve.yaml")
    model: str = "pi05_realman_multitask_action_only/m_multitask_b16_2gpu"  # <openpi config>/<exp>
    checkpoint: str = ""  # "" = the latest numbered checkpoint of the run
    gpu: int = 2
    port: int = 18000  # must equal network.server_port of the robot's policy_bridge.yaml
    container_port: int = 8000  # serve_policy listens on 0.0.0.0:8000 inside; OPENPI_POLICY_PORT maps the host port
    start_timeout_sec: int = 600  # loading the checkpoint before the port listens
    warmup_rounds: int = 2  # the first inference after a restart JIT-compiles ~26 s
    warmup_timeout_sec: int = 180
    robot_repo: str = "~/realman_pi"  # on realman_ts
    bridge_service: str = "policy_bridge"
    bridge_container: str = "realman_pi-policy_bridge-1"
    bridge_config: str = "config/ros/policy_bridge.yaml"  # relative to robot_repo
    bridge_start_timeout_sec: int = 90
    ros_container: str = "realman_pi-realman_bringup_remote-1"  # any running ROS container on the robot's domain
    ros_setup: str = "source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash"
    server_host: str = ""  # address the bridge uses for server5090; "" = what realman_ts sees in $SSH_CLIENT
    mode_wait_sec: float = 10.0  # input_mode_state is not published at a fixed high rate
    policy_modes: tuple[str, ...] = ("policy",)


@dataclasses.dataclass(frozen=True)
class LinkcheckConfig:
    """Data-path checks; thresholds from the 2026-10-14..10-19 live runs."""

    pika_node_prefix: str = "pika_"
    wifi_interface: str = ""  # "" = the first wl* interface of realman_ts
    wifi_window_sec: float = 5.0
    wifi_max_kb_per_sec: float = 600.0  # the Pika locator flood measured ~2600
    bulk_bytes: int = 16 << 20
    bulk_min_mb_per_sec: float = 2.0
    ping_count: int = 10
    ping_size: int = 1400  # small pings pass even when bulk TCP has collapsed
    ping_max_avg_ms: float = 50.0
    ping_max_loss_pct: float = 5.0
    infer_rounds: int = 5  # timed rounds after one untimed connect-and-warm round
    infer_max_ms: float = 200.0  # median round trip from realman_ts
    stats_timeout_sec: float = 5.0
```

Add `serving` and `linkcheck` to `ConsoleConfig` (after `openpi`):

```python
    serving: ServingConfig = dataclasses.field(default_factory=ServingConfig)
    linkcheck: LinkcheckConfig = dataclasses.field(default_factory=LinkcheckConfig)
```

`_ALLOWED_TOP_KEYS = {"data_root", "state_dir", "quality", "remote", "openpi", "serving", "linkcheck", "prompts"}`. In `load_config`, after `openpi = dataclasses.replace(...)`:

```python
    serving = _parse(ServingConfig, section.get("serving") or {}, source, "serving")
    linkcheck = _parse(LinkcheckConfig, section.get("linkcheck") or {}, source, "linkcheck")
    _validate_serving(serving, linkcheck, source)
```

and pass `serving=serving, linkcheck=linkcheck` to `ConsoleConfig(...)`. Add:

```python
def _validate_serving(s: ServingConfig, lc: LinkcheckConfig, source: Path) -> None:
    def fail(key: str, why: str) -> None:
        raise ValueError(f"{source}: {key} {why}")

    if not 1 <= s.port <= 65535:
        fail("serving.port", "must be in 1..65535")
    if not 0 <= s.container_port <= 65535:
        fail("serving.container_port", "must be in 0..65535 (0 = same as port)")
    if s.gpu < 0:
        fail("serving.gpu", "must be a GPU index >= 0")
    if s.warmup_rounds < 1:
        fail("serving.warmup_rounds", "must be at least 1")
    if s.model.count("/") != 1:
        fail("serving.model", "must be <openpi config>/<exp>")
    if not s.compose_files:
        fail("serving.compose_files", "must list at least one compose file")
    for key in ("wifi_window_sec", "wifi_max_kb_per_sec", "bulk_min_mb_per_sec", "infer_max_ms", "stats_timeout_sec"):
        if getattr(lc, key) <= 0:
            fail(f"linkcheck.{key}", "must be positive")
    for key in ("bulk_bytes", "ping_count", "infer_rounds"):
        if getattr(lc, key) < 1:
            fail(f"linkcheck.{key}", "must be at least 1")
```

Note: `_parse` converts `checkpoint: 20000` to `"20000"` (default is a str) — that is what the test expects.

In `config/training/training_console.yaml`, append (inside `training_console:`, after `openpi:`; do NOT add a second key of the same name — a later duplicate overrides an earlier one):

```yaml
  # The inference chain (realman-train serve). openpi-serve on server5090 uses the compose files below with
  # SERVE_CONFIG/SERVE_CHECKPOINT/SERVE_GPU/OPENPI_POLICY_PORT; compose.serve.yaml uses runtime: nvidia (stale CDI
  # spec). policy_bridge on realman_ts is recreated with `docker compose up -d --no-deps --no-build policy_bridge`
  # in robot_repo (never ./rm65, never bringup or the behaviour tree) and starts inactive.
  serving:
    project: openpi-serve
    service: openpi
    compose_files: [~/organization/openpi/compose.yaml, ~/data/realman/compose.serve.yaml]
    model: pi05_realman_multitask_action_only/m_multitask_b16_2gpu   # <openpi config>/<exp>
    checkpoint: ""                  # "" = latest numbered checkpoint
    gpu: 2
    port: 18000                     # = network.server_port in the robot's config/ros/policy_bridge.yaml
    container_port: 8000            # inside the container ("server listening on 0.0.0.0:8000"); 0 = same as port
    start_timeout_sec: 600
    warmup_rounds: 2                # first inference after a restart JIT-compiles ~26 s
    warmup_timeout_sec: 180
    robot_repo: ~/realman_pi
    bridge_service: policy_bridge
    bridge_container: realman_pi-policy_bridge-1
    bridge_config: config/ros/policy_bridge.yaml
    bridge_start_timeout_sec: 90
    ros_container: realman_pi-realman_bringup_remote-1
    ros_setup: source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash
    server_host: ""                 # "" = the address realman_ts sees in $SSH_CLIENT (never write an IP here)
    mode_wait_sec: 10
    policy_modes: [policy]          # start/stop refuse while the behaviour tree is in one of these

  # Data-path checks (realman-train linkcheck). Thresholds from the 2026-10-14..10-19 live runs.
  linkcheck:
    pika_node_prefix: pika_         # any such node on the robot graph = the Pika locator floods the Wi-Fi
    wifi_interface: ""              # "" = first wl* interface on realman_ts
    wifi_window_sec: 5
    wifi_max_kb_per_sec: 600
    bulk_bytes: 16777216            # realman_ts -> server5090 over ssh
    bulk_min_mb_per_sec: 2.0
    ping_count: 10
    ping_size: 1400
    ping_max_avg_ms: 50
    ping_max_loss_pct: 5
    infer_rounds: 5                 # after one untimed round
    infer_max_ms: 200               # median, two 224x224 images + 7-dim state + prompt
    stats_timeout_sec: 5
```

Check: `ros_setup` contains `&&` and `/` but no `: ` or `#`, so it stays a plain YAML scalar; `checkpoint: ""` parses to `""`.

- [ ] **Step 4: Run tests** — same command. Expected: all pass (including the existing `test_the_shipped_file_equals_the_reviewed_defaults`).

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/config.py config/training/training_console.yaml src/training/realman_training/test/test_config.py
git commit -m "feat(training): serving and linkcheck config sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `robot.py` and the remote scripts

**Files:**
- Create: `src/training/realman_training/realman_training/robot.py`
- Create: `src/training/realman_training/realman_training/remote_scripts/__init__.py` (empty)
- Create: `src/training/realman_training/realman_training/remote_scripts/ros_probe.py`
- Create: `src/training/realman_training/realman_training/remote_scripts/infer_probe.py`
- Modify: `src/training/realman_training/setup.py` (`package_data={"realman_training": ["openpi_scripts/*.py", "remote_scripts/*.py"]}`)
- Create: `src/training/realman_training/test/robot_fakes.py`
- Test: `src/training/realman_training/test/test_robot.py`

**Interfaces:**
- Consumes: `RemoteConfig.ssh_host`, `RemoteConfig.connect_timeout_sec`, `ServingConfig` (Task 1), `Runner`, `Completed` (runner.py), `StepFailed` (jobs.py), `_normalize_docker_time` (steps/train.py).
- Produces:
  - `robot.script(name: str) -> str`, `robot.remote_path(path: str) -> str`, `robot.container_facts(inspect: dict) -> dict` with keys `running: bool, status: str, image: str, image_id: str, started: str, env: dict[str, str]`.
  - `class Robot(remote: RemoteConfig, serving: ServingConfig, runner: Runner)` with `ssh_argv(command) -> list[str]`, `run(command, *, input=None, timeout=None) -> Completed`, `check(command, *, input=None, timeout=None) -> str`, `container(name) -> dict | None` (facts), `server_address() -> str`, `bridge_port() -> int`, `ros_probe(*requests, timeout=90) -> dict`, `bt_mode() -> dict | None`, `bridge_stats(seconds) -> dict | None`, `set_prompt(text) -> dict`, `compose_command(*args, env=None) -> str`, `in_container(name, command) -> str`.
  - `ros_probe.py` prints `{"nodes": [...], "mode": {...}|null, "stats": {...}|null, "prompt": {"published": bool, "confirmed": bool, "stats": {...}|null}}` (only the requested keys).
  - `infer_probe.py HOST PORT ROUNDS PROMPT` prints `{"ms": [float, ...], "connect_ms": float, "actions_shape": [int, ...]}`.
  - `test/robot_fakes.py`: `ROBOT_ADDR = "192.0.2.10"`, `SERVER_ADDR = "192.0.2.20"`, `class FakeChain` (see code) used by Tasks 3–5.

- [ ] **Step 1: Write the fakes and failing tests**

`test/robot_fakes.py`:

```python
"""A fake realman_ts + server5090 for the serving and linkcheck tests: FakeRunner rules with editable state."""

from __future__ import annotations

import json
import shlex

from fake_runner import FakeRunner

SERVER_ADDR = "192.0.2.20"  # documentation range, never a real address
SERVE_CONTAINER = "openpi-serve-openpi-1"
BRIDGE_CONTAINER = "realman_pi-policy_bridge-1"
PLACE = "pick up the power adapter and put it in the blue bin"


def inspect_json(running: bool, env: dict[str, str] | None = None) -> str:
    return json.dumps([{
        "State": {"Running": running, "Status": "running" if running else "exited", "StartedAt": "2026-10-20T08:00:00.123456789Z"},
        "Config": {"Image": "img:tag", "Env": [f"{k}={v}" for k, v in (env or {}).items()]},
        "Image": "sha256:0123456789abcdef0123",
    }])


class FakeChain:
    """Answers every command the console sends. Change the attributes, then build the runner."""

    def __init__(self):
        self.mode = {"requested_mode": "none", "selected_mode": "none", "active_mode": "none", "phase": 0, "detail": ""}
        self.stats = {"prompt": PLACE, "paused": "0.0", "allow_publish": "0.0", "mode_active": "0.0", "published": "0"}
        self.prompt_confirmed = True
        self.nodes = ["/policy_bridge_node", "/r/realman_driver"]
        self.bridge_port = 18000
        self.bridge_running = True
        self.serve_running = False
        self.gpu_used_mib = 500
        self.ssh_client = f"{SERVER_ADDR} 50000 22"
        self.wifi = "wlx0 1000000"  # interface and bytes over the window
        self.ping = "10 packets transmitted, 10 received, 0% packet loss, time 1800ms\nrtt min/avg/max/mdev = 3.1/8.4/20.5/4.0 ms"
        self.infer_ms = [900.0, 95.0, 101.0, 99.0, 120.0, 97.0]  # answers take the first ROUNDS of these
        self.serve_dies = False  # the serve container exits while loading
        self.serve_logs = ""
        self.unreachable = False

    @staticmethod
    def _infer_rounds(argv) -> int:
        text = argv[-1]
        if text.startswith("docker exec"):
            text = shlex.split(text)[-1]
        return int(shlex.split(text.split(" - ", 1)[1])[2])

    def _probe(self, argv, input):
        if input and "ros_probe" in input.splitlines()[0]:
            text = argv[-1]
            out = {}
            if "nodes" in text:
                out["nodes"] = self.nodes
            if "mode=" in text:
                out["mode"] = self.mode
            if "stats=" in text:
                out["stats"] = self.stats
            if "prompt=" in text:
                out["prompt"] = {"published": True, "confirmed": self.prompt_confirmed, "stats": self.stats}
            return "noise from ros\n" + json.dumps(out)
        rounds = self._infer_rounds(argv)
        return json.dumps({"ms": self.infer_ms[:rounds], "connect_ms": 12.0, "actions_shape": [16, 7]})

    def runner(self) -> FakeRunner:
        fake = FakeRunner()
        if self.unreachable:
            fake.on("ssh ", returncode=255, stdout="ssh: connect to host realman_local port 22: Connection timed out")
        fake.on("compose.serve.yaml up -d", action=lambda a, i: setattr(self, "serve_running", not self.serve_dies))
        fake.on("docker logs", stdout=lambda a, i: self.serve_logs)
        fake.on("SSH_CLIENT", stdout=lambda a, i: self.ssh_client + "\n")
        fake.on("policy_bridge.yaml", stdout=lambda a, i: f"network:\n  server_host: x\n  server_port: {self.bridge_port}\n")
        fake.on("python3 - ", stdout=lambda a, i: self._probe(a, i))
        fake.on("uv run --no-sync python - ", stdout=lambda a, i: self._probe(a, i))
        fake.on(f"docker inspect {BRIDGE_CONTAINER}", stdout=lambda a, i: inspect_json(self.bridge_running, {"POLICY_WS_HOST": SERVER_ADDR}))
        fake.on(f"-f {{{{.State.Running}}}} {SERVE_CONTAINER}", stdout=lambda a, i: "true\n" if self.serve_running else "false\n")
        fake.on(f"docker inspect {SERVE_CONTAINER}", stdout=lambda a, i: inspect_json(True, {"SERVE_GPU": "2"}) if self.serve_running else "",
                returncode=0)
        fake.on("/sys/class/net", stdout=lambda a, i: self.wifi + "\n")
        fake.on("ping -q", stdout=lambda a, i: self.ping + "\n")
        fake.on("nvidia-smi", stdout=lambda a, i: (
            f"2, {self.gpu_used_mib}, 32607\n" if "memory.total" in " ".join(a) else f"2, {self.gpu_used_mib}\n"))
        return fake
```

Note on `docker inspect openpi-serve-openpi-1` when not running: `serving.container_inspect` treats empty stdout as "no container" (the real command exits 1 with `[]`; the fake returns `""` with code 0 — both mean absent).

`test/test_robot.py`:

```python
from __future__ import annotations

import ast
import json
import sys
import types

import pytest
from fake_runner import FakeRunner
from robot_fakes import SERVER_ADDR, FakeChain

from realman_training.config import RemoteConfig, ServingConfig
from realman_training.jobs import StepFailed
from realman_training.robot import Robot, container_facts, remote_path, script


def robot(fake) -> Robot:
    return Robot(RemoteConfig(), ServingConfig(), fake)


def test_ssh_argv_uses_the_alias_batch_mode_and_the_timeout():
    argv = robot(FakeRunner()).ssh_argv("true")
    assert argv[0] == "ssh" and "BatchMode=yes" in argv and "ConnectTimeout=10" in argv
    assert argv[-2:] == ["realman_local", "true"]


def test_remote_path_keeps_the_home_expansion():
    assert remote_path("~/realman_pi") == '"$HOME"/realman_pi'
    assert remote_path("/abs/with space") == "'/abs/with space'"


def test_check_turns_an_ssh_failure_into_a_readable_step_failure():
    chain = FakeChain()
    chain.unreachable = True
    with pytest.raises(StepFailed, match="realman_ts .*unreachable"):
        robot(chain.runner()).check("true")


def test_server_address_comes_from_ssh_client_unless_configured():
    chain = FakeChain()
    assert robot(chain.runner()).server_address() == SERVER_ADDR
    fixed = Robot(RemoteConfig(), ServingConfig(server_host="192.0.2.99"), chain.runner())
    assert fixed.server_address() == "192.0.2.99"


def test_bridge_port_is_read_from_the_robot_yaml():
    chain = FakeChain()
    chain.bridge_port = 18001
    fake = chain.runner()
    assert robot(fake).bridge_port() == 18001
    assert 'cat "$HOME"/realman_pi/config/ros/policy_bridge.yaml' in fake.calls[-1][-1]


def test_ros_probe_sends_the_script_and_reads_the_last_json_line():
    chain = FakeChain()
    fake = chain.runner()
    r = robot(fake)
    assert r.bt_mode()["active_mode"] == "none"
    command = fake.calls[-1][-1]
    assert command.startswith("docker exec -i realman_pi-realman_bringup_remote-1 bash -lc ")
    assert "mode=10.0" in command
    assert fake.inputs[-1] == script("ros_probe")


def test_container_facts():
    data = json.loads(json.dumps([{"State": {"Running": True, "Status": "running", "StartedAt": "2026-10-20T08:00:00.1Z"},
                                   "Config": {"Image": "img:1", "Env": ["A=1", "B=x=y"]}, "Image": "sha256:" + "a" * 64}]))[0]
    facts = container_facts(data)
    assert facts["running"] is True and facts["image"] == "img:1"
    assert facts["env"] == {"A": "1", "B": "x=y"}
    assert facts["image_id"] == "sha256:aaaaaaaaaaaa"


def test_bridge_compose_command_never_uses_rm65():
    command = robot(FakeRunner()).compose_command("up", "-d", "--no-deps", "--no-build", "policy_bridge", env={"POLICY_WS_HOST": SERVER_ADDR})
    assert command == f'cd "$HOME"/realman_pi && POLICY_WS_HOST={SERVER_ADDR} docker compose up -d --no-deps --no-build policy_bridge'
    assert "./rm65" not in command


@pytest.mark.parametrize("name", ["ros_probe", "infer_probe"])
def test_remote_scripts_parse(name):
    ast.parse(script(name))


def test_infer_probe_times_real_size_requests(monkeypatch, capsys):
    seen = []

    class Client:
        def __init__(self, host, port):
            seen.append((host, port))

        def infer(self, obs):
            seen.append({k: getattr(v, "shape", v) for k, v in obs.items()})
            import numpy as np

            return {"actions": np.zeros((16, 7))}

    module = types.ModuleType("openpi_client.websocket_client_policy")
    module.WebsocketClientPolicy = Client
    monkeypatch.setitem(sys.modules, "openpi_client", types.ModuleType("openpi_client"))
    monkeypatch.setitem(sys.modules, "openpi_client.websocket_client_policy", module)
    monkeypatch.setattr(sys, "argv", ["-", "192.0.2.20", "18000", "2", "do it"])
    exec(compile(script("infer_probe"), "infer_probe.py", "exec"), {"__name__": "__main__"})
    out = json.loads(capsys.readouterr().out.strip().splitlines()[-1])
    assert len(out["ms"]) == 2 and out["actions_shape"] == [16, 7]
    assert seen[0] == ("192.0.2.20", 18000)
    assert seen[1] == {"wrist_image": (224, 224, 3), "global_image": (224, 224, 3), "state": (7,), "prompt": "do it"}
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_robot.py -p no:cacheprovider`
Expected: FAIL (`ModuleNotFoundError: No module named 'realman_training.robot'`).

- [ ] **Step 3: Implement**

`realman_training/robot.py`:

```python
"""realman_ts as seen from server5090: ssh commands, docker on the robot host, and the ROS probe.

Robot-side writes are limited to the policy_bridge service (compose up/stop) and the bridge's runtime prompt; the
probe only reads the ROS graph otherwise. Hosts by ssh alias only.
"""

from __future__ import annotations

import json
import shlex
import subprocess
from pathlib import Path

import yaml

from .config import RemoteConfig, ServingConfig
from .jobs import StepFailed
from .runner import Completed, Runner
from .steps.train import _normalize_docker_time

SCRIPTS = Path(__file__).resolve().parent / "remote_scripts"


def script(name: str) -> str:
    return (SCRIPTS / f"{name}.py").read_text(encoding="utf-8")


def remote_path(path: str) -> str:
    """Quote a path for the remote shell but keep a leading ~ expanding to the remote home."""
    if path == "~":
        return '"$HOME"'
    if path.startswith("~/"):
        return '"$HOME"/' + shlex.quote(path[2:])
    return shlex.quote(path)


def container_facts(inspect: dict) -> dict:
    state = inspect.get("State") or {}
    env = {}
    for item in (inspect.get("Config") or {}).get("Env") or []:
        key, _, value = item.partition("=")
        env[key] = value
    return {
        "running": bool(state.get("Running")),
        "status": str(state.get("Status", "")),
        "image": str((inspect.get("Config") or {}).get("Image", "")),
        "image_id": str(inspect.get("Image", ""))[:19],
        "started": _normalize_docker_time(str(state.get("StartedAt", ""))),
        "env": env,
    }


class Robot:
    def __init__(self, remote: RemoteConfig, serving: ServingConfig, runner: Runner):
        self.remote, self.serving, self.runner = remote, serving, runner

    def ssh_argv(self, command: str) -> list[str]:
        return [
            "ssh",
            "-o", "BatchMode=yes",
            "-o", f"ConnectTimeout={self.remote.connect_timeout_sec}",
            "-o", "ServerAliveInterval=15",
            "-o", "ServerAliveCountMax=4",
            self.remote.ssh_host,
            command,
        ]

    def run(self, command: str, *, input: str | None = None, timeout: float | None = None) -> Completed:
        try:
            done = self.runner.run(self.ssh_argv(command), input=input, timeout=timeout)
        except subprocess.TimeoutExpired:
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}): {command[:120]} timed out after {timeout:g} s") from None
        if done.returncode == 255:
            tail = (done.stderr or done.stdout).strip().splitlines()[-1:] or [""]
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}) unreachable: {tail[0]}")
        return done

    def check(self, command: str, *, input: str | None = None, timeout: float | None = None) -> str:
        done = self.run(command, input=input, timeout=timeout)
        if done.returncode:
            tail = "\n".join((done.stderr or done.stdout).strip().splitlines()[-10:])
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}): {command[:120]} exited {done.returncode}: {tail}")
        return done.stdout

    def container(self, name: str) -> dict | None:
        done = self.run(f"docker inspect {shlex.quote(name)}")
        if done.returncode or not done.stdout.strip():
            return None
        data = json.loads(done.stdout)
        return container_facts(data[0]) if data else None

    def server_address(self) -> str:
        if self.serving.server_host:
            return self.serving.server_host
        parts = self.check('echo "$SSH_CLIENT"').split()
        if not parts:
            raise StepFailed("realman_ts did not report $SSH_CLIENT; set serving.server_host")
        return parts[0]

    def bridge_port(self) -> int:
        path = f"{remote_path(self.serving.robot_repo)}/{shlex.quote(self.serving.bridge_config)}"
        try:
            port = (yaml.safe_load(self.check(f"cat {path}")) or {})["network"]["server_port"]
            return int(port)
        except (KeyError, TypeError, ValueError, yaml.YAMLError) as error:
            raise StepFailed(f"cannot read network.server_port from the robot's {self.serving.bridge_config}: {error}") from None

    def in_container(self, name: str, command: str) -> str:
        return f"docker exec -i {shlex.quote(name)} bash -lc {shlex.quote(self.serving.ros_setup + ' && ' + command)}"

    def ros_probe(self, *requests: str, timeout: float = 90) -> dict:
        command = self.in_container(self.serving.ros_container, "python3 - " + shlex.join(requests))
        out = self.check(command, input=script("ros_probe"), timeout=timeout)
        lines = [line for line in out.strip().splitlines() if line.startswith("{")]
        if not lines:
            raise StepFailed(f"the ROS probe printed no result: {out.strip()[-300:]}")
        return json.loads(lines[-1])

    def bt_mode(self) -> dict | None:
        return self.ros_probe(f"mode={self.serving.mode_wait_sec}")["mode"]

    def bridge_stats(self, seconds: float) -> dict | None:
        return self.ros_probe(f"stats={seconds}")["stats"]

    def set_prompt(self, text: str) -> dict:
        return self.ros_probe(f"prompt={text}")["prompt"]

    def compose_command(self, *args: str, env: dict[str, str] | None = None) -> str:
        assigns = "".join(f"{key}={shlex.quote(value)} " for key, value in (env or {}).items())
        return f"cd {remote_path(self.serving.robot_repo)} && {assigns}docker compose {shlex.join(args)}"
```

`remote_scripts/ros_probe.py`:

```python
"""ros_probe: run inside a ROS container on realman_ts; print one JSON line with the requested answers.

usage: python3 - REQUEST... < ros_probe.py
  nodes          node names on the graph (after 2 s of discovery)
  mode=SEC       current /realman_bt_executor/input_mode_state (null = no executor on the graph;
                 {"unknown": true} = the executor runs but sent nothing within SEC)
  stats=SEC      last /policy/stats values of the policy_bridge status within SEC (null = none)
  prompt=TEXT    publish TEXT on /policy/prompt until /policy/stats reports it (10 s at most)
"""

import json
import sys
import time

import rclpy
from rclpy.node import Node

MODE_TOPIC = "/realman_bt_executor/input_mode_state"
STATS_TOPIC = "/policy/stats"
PROMPT_TOPIC = "/policy/prompt"


def spin_until(node, done, seconds):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline and not done():
        rclpy.spin_once(node, timeout_sec=0.1)


def nodes(node):
    spin_until(node, lambda: False, 2.0)
    return sorted(f"{ns.rstrip('/')}/{name}" for name, ns in node.get_node_names_and_namespaces())


def mode(node, seconds):
    from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
    from realman_msgs.msg import InputModeState

    # The executor publishes transient-local depth 1, only on change: a transient-local subscription gets the
    # current state at once.
    qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
    box = []
    sub = node.create_subscription(InputModeState, MODE_TOPIC, box.append, qos)
    spin_until(node, lambda: box, seconds)
    node.destroy_subscription(sub)
    if not box:
        names = [name for name, _ in node.get_node_names_and_namespaces()]
        if "realman_bt_executor" in names:
            return {"unknown": True, "detail": "realman_bt_executor is running but sent no input_mode_state"}
        return None
    m = box[-1]
    return {"requested_mode": m.requested_mode, "selected_mode": m.selected_mode, "active_mode": m.active_mode,
            "phase": int(m.phase), "detail": m.detail}


def _values(msg):
    for status in msg.status:
        if status.name == "policy_bridge":
            return {kv.key: kv.value for kv in status.values}
    return None


def _stats_box(node):
    from diagnostic_msgs.msg import DiagnosticArray

    box = []

    def on_msg(msg):
        values = _values(msg)
        if values is not None:
            box.append(values)

    return box, node.create_subscription(DiagnosticArray, STATS_TOPIC, on_msg, 10)


def stats(node, seconds):
    box, sub = _stats_box(node)
    spin_until(node, lambda: box, seconds)
    node.destroy_subscription(sub)
    return box[-1] if box else None


def prompt(node, text):
    from std_msgs.msg import String

    pub = node.create_publisher(String, PROMPT_TOPIC, 10)
    box, sub = _stats_box(node)
    spin_until(node, lambda: pub.get_subscription_count() > 0, 5.0)
    published = pub.get_subscription_count() > 0
    deadline = time.monotonic() + 10.0
    confirmed = False
    while published and time.monotonic() < deadline and not confirmed:
        pub.publish(String(data=text))
        spin_until(node, lambda: box and box[-1].get("prompt") == text, 1.0)
        confirmed = bool(box) and box[-1].get("prompt") == text
    node.destroy_subscription(sub)
    return {"published": published, "confirmed": confirmed, "stats": box[-1] if box else None}


def main():
    rclpy.init()
    node = Node("realman_training_probe")
    result = {}
    try:
        for request in sys.argv[1:]:
            key, _, value = request.partition("=")
            if key == "nodes":
                result["nodes"] = nodes(node)
            elif key == "mode":
                result["mode"] = mode(node, float(value or 10))
            elif key == "stats":
                result["stats"] = stats(node, float(value or 5))
            elif key == "prompt":
                result["prompt"] = prompt(node, value)
            else:
                raise SystemExit(f"unknown request {request!r}")
    finally:
        node.destroy_node()
        rclpy.shutdown()
    print(json.dumps(result))


main()
```

`remote_scripts/infer_probe.py`:

```python
"""infer_probe: time real-size inferences against an openpi policy server; print one JSON line.

usage: python3 - HOST PORT ROUNDS PROMPT < infer_probe.py
Runs in the openpi-serve container (openpi_client) or in the policy_bridge container (its vendored copy). The request
has the bridge's own keys and sizes: two 224x224 RGB images, a 7-dim state, the prompt.
"""

import json
import sys
import time

import numpy as np

try:
    from openpi_client.websocket_client_policy import WebsocketClientPolicy
except ImportError:
    from policy_bridge.inference.openpi_client.websocket_client_policy import WebsocketClientPolicy

host, port, rounds, prompt = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
rng = np.random.default_rng(0)
start = time.monotonic()
client = WebsocketClientPolicy(host, port)
connect_ms = round((time.monotonic() - start) * 1000, 1)
times = []
action = {}
for _ in range(rounds):
    obs = {
        "wrist_image": rng.integers(0, 256, (224, 224, 3), dtype=np.uint8),
        "global_image": rng.integers(0, 256, (224, 224, 3), dtype=np.uint8),
        "state": np.zeros(7, dtype=np.float32),
        "prompt": prompt,
    }
    began = time.monotonic()
    action = client.infer(obs)
    times.append(round((time.monotonic() - began) * 1000, 1))
shape = list(np.asarray(action.get("actions", [])).shape)
print(json.dumps({"ms": times, "connect_ms": connect_ms, "actions_shape": shape}))
```

Note the first line of each script's docstring starts with `"""ros_probe:` / `"""infer_probe:` — `FakeChain._probe` dispatches on it.

- [ ] **Step 4: Run tests** — same command. Expected: PASS. Also `ruff check --config config/python/ruff.toml src/training`.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/robot.py src/training/realman_training/realman_training/remote_scripts src/training/realman_training/setup.py src/training/realman_training/test/robot_fakes.py src/training/realman_training/test/test_robot.py
git commit -m "feat(training): realman_ts access and the ROS/inference probes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `linkcheck.py` and `serving_state.py`

**Files:**
- Create: `src/training/realman_training/realman_training/serving_state.py`
- Create: `src/training/realman_training/realman_training/linkcheck.py`
- Modify: `src/training/realman_training/realman_training/jobs.py` (`STEPS["linkcheck"]`)
- Test: `src/training/realman_training/test/test_linkcheck.py`

**Interfaces:**
- Consumes: `Robot` (Task 2), `ConsoleConfig.linkcheck/serving`, `load_config`, `write_json`, `now`, `StepFailed`, `CommandFailed`.
- Produces:
  - `serving_state.path(config) -> Path` (`<console_dir>/serving.json`), `load(config) -> dict` (`{}` if missing), `save(config, data: dict) -> None`.
  - `linkcheck.Check` dataclass `(item: str, name: str, ok: bool, value: str, threshold: str, detail: str = "")` with `to_dict()`.
  - `linkcheck.ITEMS = ("pika", "link", "inference", "bridge")`.
  - `linkcheck.run_checks(config, runner=None, *, robot=None, only=None, clock=time.monotonic, expected_prompt=None) -> list[Check]`.
  - `linkcheck.save_history(config, checks) -> Path`, `linkcheck.format_table(checks) -> list[str]`.
  - `linkcheck.run(params, log, runner=None) -> dict` (`{"ok": bool, "checks": [dict], "history": str}`).

- [ ] **Step 1: Write the failing tests** — `test/test_linkcheck.py`:

```python
from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from robot_fakes import PLACE, SERVER_ADDR, FakeChain

from realman_training import linkcheck, serving_state
from realman_training.config import load_config


@pytest.fixture()
def config(tmp_path):
    path = tmp_path / "console.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n")
    return load_config(path)


class Clock:
    """Advances 0.5 s per call: 16 MiB in 1 MiB chunks -> enough samples for a stable rate."""

    def __init__(self, step=0.5):
        self.t, self.step = 0.0, step

    def __call__(self):
        self.t += self.step
        return self.t


def bulk(chain_runner, total=16 << 20, chunk=1 << 20):
    def pipe(producer, consumer, on_bytes):
        sent = 0
        while sent < total:
            sent += chunk
            on_bytes(sent)
        return sent

    chain_runner.pipe_impl = pipe
    return chain_runner


def by_name(checks):
    return {c.name: c for c in checks}


def test_a_healthy_chain_passes_every_check(config):
    chain = FakeChain()
    fake = bulk(chain.runner())
    checks = linkcheck.run_checks(config, fake, clock=Clock(), expected_prompt=PLACE)
    assert [c.item for c in checks] == ["pika", "pika", "link", "link", "inference", "bridge", "bridge", "bridge"]
    assert all(c.ok for c in checks), [c.to_dict() for c in checks if not c.ok]
    named = by_name(checks)
    assert named["wifi_load"].value == "200.0 KB/s on wlx0" and named["wifi_load"].threshold == "< 600 KB/s"
    assert named["bulk_throughput"].threshold == ">= 2.0 MB/s"
    # 15 MiB after the first sample in 15 clock steps of 0.5 s -> ~2.1 MB/s
    assert named["bulk_throughput"].value.endswith("MB/s")
    assert named["inference_round_trip"].value.startswith("median 99.0 ms")


def test_the_pika_locator_fails_the_interference_item(config):
    chain = FakeChain()
    chain.nodes = ["/pika_double_locator", "/pika_teleop_publisher", "/r/realman_driver"]
    chain.wifi = "wlx0 13000000"  # 2600 KB/s over 5 s
    named = by_name(linkcheck.run_checks(config, bulk(chain.runner()), clock=Clock(), only=["pika"]))
    assert not named["pika_nodes"].ok and "pika_double_locator" in named["pika_nodes"].value
    assert not named["wifi_load"].ok and named["wifi_load"].value.startswith("2600.0 KB/s")


def test_no_wifi_interface_is_not_a_failure(config):
    chain = FakeChain()
    chain.wifi = "none"
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["pika"]))
    assert named["wifi_load"].ok and named["wifi_load"].value == "no Wi-Fi interface"


def test_slow_bulk_and_lossy_ping_fail_the_link_item(config):
    chain = FakeChain()
    chain.ping = "10 packets transmitted, 9 received, 10% packet loss, time 1800ms\nrtt min/avg/max/mdev = 3.1/80.0/200.5/4.0 ms"
    fake = bulk(chain.runner())
    named = by_name(linkcheck.run_checks(config, fake, clock=Clock(step=5.0), only=["link"]))
    assert not named["bulk_throughput"].ok  # 15 MiB in 75 s
    assert not named["ping"].ok and named["ping"].value == "avg 80.0 ms, loss 10%"
    ping = fake.commands("ping -q")[0][-1]
    assert f"-s 1400 {SERVER_ADDR}" in ping
    producer = fake.commands("PIPE")[0]
    assert "head -c 16777216 /dev/urandom" in producer


def test_slow_inference_fails_and_the_first_round_is_not_judged(config):
    chain = FakeChain()
    chain.infer_ms = [30000.0, 250.0, 260.0, 240.0, 300.0, 255.0]
    fake = chain.runner()
    named = by_name(linkcheck.run_checks(config, fake, only=["inference"]))
    check = named["inference_round_trip"]
    assert not check.ok and check.value.startswith("median 255.0 ms") and check.threshold == "< 200 ms"
    command = fake.commands("python3 - ")[-1][-1]
    assert command.startswith("docker exec -i realman_pi-policy_bridge-1 ")
    assert f"python3 - {SERVER_ADDR} 18000 6 " in command


def test_inference_needs_the_bridge_container(config):
    chain = FakeChain()
    chain.bridge_running = False
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["inference"]))
    assert not named["inference_round_trip"].ok and "not running" in named["inference_round_trip"].detail


def test_bridge_health_judges_prompt_pause_and_errors(config):
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "1.0", "allow_publish": "0.0", "infer_error": "3"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"], expected_prompt=PLACE))
    assert not named["bridge_prompt"].ok and named["bridge_prompt"].threshold == f"= {PLACE!r}"
    assert not named["bridge_paused"].ok
    assert not named["bridge_errors"].ok and named["bridge_errors"].value == "infer_error=3"


def test_without_a_serving_record_any_configured_prompt_passes(config):
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "0.0"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"]))
    assert named["bridge_prompt"].ok


def test_the_serving_record_gives_the_expected_prompt(config):
    serving_state.save(config, {"prompt": PLACE, "port": 18000})
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "0.0"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"]))
    assert not named["bridge_prompt"].ok


def test_an_unreachable_robot_fails_every_item_with_the_reason(config):
    chain = FakeChain()
    chain.unreachable = True
    checks = linkcheck.run_checks(config, chain.runner())
    assert {c.item for c in checks} == set(linkcheck.ITEMS)
    assert not any(c.ok for c in checks)
    assert all("unreachable" in c.detail for c in checks)


def test_the_job_entry_logs_a_table_and_keeps_history(config, monkeypatch):
    chain = FakeChain()
    monkeypatch.setattr(linkcheck, "Runner", lambda: bulk(chain.runner()))
    log = RecordingLog()
    result = linkcheck.run({"config": str(config.source), "only": ["bridge"]}, log)
    assert result["ok"] is True and len(result["checks"]) == 3
    saved = json.loads(open(result["history"], encoding="utf-8").read())
    assert saved["checks"] == result["checks"]
    assert "PASS  bridge_prompt" in log.text()
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_linkcheck.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'linkcheck'`).

- [ ] **Step 3: Implement**

`realman_training/serving_state.py`:

```python
"""What `serve start` started (model, checkpoint, GPU, port, prompt): <console_dir>/serving.json."""

from __future__ import annotations

import json
from pathlib import Path

from .config import ConsoleConfig
from .jobs import write_json


def path(config: ConsoleConfig) -> Path:
    return config.console_dir / "serving.json"


def load(config: ConsoleConfig) -> dict:
    try:
        return json.loads(path(config).read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        return {}


def save(config: ConsoleConfig, data: dict) -> None:
    path(config).parent.mkdir(parents=True, exist_ok=True)
    write_json(path(config), data)
```

(`write_json` in jobs.py writes atomically; check that it creates nothing else — if it does not `mkdir` the parent, the `mkdir` above covers it.)

`realman_training/linkcheck.py`:

```python
"""The four data-path checks between realman_ts and server5090, each pass/fail + value + threshold.

1 pika:      pika_* nodes on the robot graph (the Pika locator floods the Wi-Fi with small DDS packets) and the
             Wi-Fi interface's bytes/s over a window.
2 link:      bulk throughput realman_ts -> server5090 (over ssh, timed from the first received chunk) and a ping
             with large packets (small pings pass even when bulk TCP has collapsed).
3 inference: real-size requests from inside the policy_bridge container to the address and port it uses.
4 bridge:    /policy/stats: prompt = the served task's prompt, paused = 0, no error counters.
An item that cannot run fails with the reason; the others still run. Thresholds: linkcheck section of the config.
"""

from __future__ import annotations

import dataclasses
import datetime
import json
import re
import shlex
import statistics
import time
from pathlib import Path

from . import serving_state
from .config import ConsoleConfig, load_config
from .jobs import StepFailed, now, write_json
from .robot import Robot, script
from .runner import CommandFailed, Runner

ITEMS = ("pika", "link", "inference", "bridge")
_NAMES = {
    "pika": ("pika_nodes", "wifi_load"),
    "link": ("bulk_throughput", "ping"),
    "inference": ("inference_round_trip",),
    "bridge": ("bridge_prompt", "bridge_paused", "bridge_errors"),
}


@dataclasses.dataclass(frozen=True)
class Check:
    item: str
    name: str
    ok: bool
    value: str
    threshold: str
    detail: str = ""

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


def _pika(robot: Robot, config: ConsoleConfig) -> list[Check]:
    lc = config.linkcheck
    nodes = robot.ros_probe("nodes")["nodes"]
    pika = [n for n in nodes if n.rsplit("/", 1)[-1].startswith(lc.pika_node_prefix)]
    shown = ", ".join(n.rsplit("/", 1)[-1] for n in pika[:5]) + (" …" if len(pika) > 5 else "")
    checks = [Check("pika", "pika_nodes", not pika, f"{len(pika)}" + (f" ({shown})" if pika else ""), "0",
                    "stop the Pika stack on the teleop PC before a policy run" if pika else "")]
    iface = shlex.quote(lc.wifi_interface)
    window = f"{lc.wifi_window_sec:g}"
    command = (
        f"i={iface}; [ -n \"$i\" ] || i=$(ls /sys/class/net | grep '^wl' | head -n1); "
        "[ -n \"$i\" ] || { echo none; exit 0; }; s=/sys/class/net/$i/statistics; "
        "a=$(( $(cat $s/rx_bytes) + $(cat $s/tx_bytes) )); "
        f"sleep {window}; "
        "b=$(( $(cat $s/rx_bytes) + $(cat $s/tx_bytes) )); echo \"$i $((b - a))\""
    )
    out = robot.check(command, timeout=lc.wifi_window_sec + 30).split()
    threshold = f"< {lc.wifi_max_kb_per_sec:g} KB/s"
    if out[:1] == ["none"]:
        checks.append(Check("pika", "wifi_load", True, "no Wi-Fi interface", threshold))
    else:
        rate = int(out[1]) / lc.wifi_window_sec / 1000
        checks.append(Check("pika", "wifi_load", rate < lc.wifi_max_kb_per_sec, f"{rate:.1f} KB/s on {out[0]}", threshold))
    return checks


def _link(robot: Robot, config: ConsoleConfig, runner: Runner, clock) -> list[Check]:
    lc = config.linkcheck
    server = robot.server_address()  # first: an unreachable robot fails here, before the transfer
    samples: list[tuple[float, int]] = []
    producer = robot.ssh_argv(f"head -c {lc.bulk_bytes} /dev/urandom")
    try:
        runner.pipe(producer, ["sh", "-c", "cat > /dev/null"], lambda total: samples.append((clock(), total)))
    except CommandFailed as error:
        raise StepFailed(f"bulk transfer failed: {error}") from None
    threshold = f">= {lc.bulk_min_mb_per_sec:g} MB/s"
    if len(samples) < 2 or samples[-1][0] <= samples[0][0]:
        bulk = Check("link", "bulk_throughput", False, f"{samples[-1][1] if samples else 0} bytes", threshold,
                     "too few samples; raise linkcheck.bulk_bytes")
    else:
        rate = (samples[-1][1] - samples[0][1]) / (samples[-1][0] - samples[0][0]) / 1e6
        bulk = Check("link", "bulk_throughput", rate >= lc.bulk_min_mb_per_sec, f"{rate:.2f} MB/s", threshold)
    out = robot.run(f"ping -q -c {lc.ping_count} -i 0.2 -s {lc.ping_size} {shlex.quote(server)}",
                    timeout=lc.ping_count * 2 + 20).stdout
    loss = re.search(r"([\d.]+)% packet loss", out)
    avg = re.search(r"= [\d.]+/([\d.]+)/", out)
    threshold = f"avg <= {lc.ping_max_avg_ms:g} ms, loss <= {lc.ping_max_loss_pct:g}%"
    if not loss:
        ping = Check("link", "ping", False, "no reply", threshold, out.strip()[-200:])
    else:
        loss_pct = float(loss.group(1))
        avg_ms = float(avg.group(1)) if avg else float("inf")
        ok = loss_pct <= lc.ping_max_loss_pct and avg_ms <= lc.ping_max_avg_ms
        ping = Check("link", "ping", ok, f"avg {avg_ms:.1f} ms, loss {loss_pct:g}%", threshold, f"{lc.ping_size}-byte packets")
    return [bulk, ping]


def _inference(robot: Robot, config: ConsoleConfig, prompt: str) -> list[Check]:
    lc, sc = config.linkcheck, config.serving
    threshold = f"< {lc.infer_max_ms:g} ms"
    bridge = robot.container(sc.bridge_container)
    if not bridge or not bridge["running"]:
        return [Check("inference", "inference_round_trip", False, "-", threshold, f"{sc.bridge_container} is not running")]
    host = bridge["env"].get("POLICY_WS_HOST") or robot.server_address()
    port = robot.bridge_port()
    args = shlex.join([host, str(port), str(lc.infer_rounds + 1), prompt])
    out = robot.check(robot.in_container(sc.bridge_container, f"python3 - {args}"), input=script("infer_probe"),
                      timeout=120 + lc.infer_rounds * 10)
    data = json.loads([line for line in out.splitlines() if line.startswith("{")][-1])
    timed = data["ms"][1:]
    median = statistics.median(timed)
    value = f"median {median:.1f} ms (max {max(timed):.1f}, first {data['ms'][0]:.1f})"
    return [Check("inference", "inference_round_trip", median < lc.infer_max_ms, value, threshold, f"{host}:{port}")]


def _bridge(robot: Robot, config: ConsoleConfig, expected: str | None) -> list[Check]:
    stats = robot.bridge_stats(config.linkcheck.stats_timeout_sec)
    if stats is None:
        return [Check("bridge", name, False, "-", "", f"no /policy/stats within {config.linkcheck.stats_timeout_sec:g} s")
                for name in _NAMES["bridge"]]
    prompt = stats.get("prompt", "")
    if expected is not None:
        prompt_check = Check("bridge", "bridge_prompt", prompt == expected, repr(prompt), f"= {expected!r}")
    else:
        known = sorted(config.prompts.values())
        prompt_check = Check("bridge", "bridge_prompt", prompt in known, repr(prompt), "one of the configured prompts",
                             "no serving record: start the chain with `realman-train serve start` to pin the task")
    paused = float(stats.get("paused", "0") or 0)
    errors = {k: v for k, v in stats.items() if ("error" in k or "fail" in k) and _number(v)}
    return [
        prompt_check,
        Check("bridge", "bridge_paused", paused == 0, f"{paused:g}", "= 0",
              "paused after repeated inference failures; /policy/activate resumes it" if paused else ""),
        Check("bridge", "bridge_errors", not errors, ", ".join(f"{k}={v}" for k, v in sorted(errors.items())) or "0", "= 0"),
    ]


def _number(value: str) -> bool:
    try:
        return float(value) != 0
    except ValueError:
        return False


def run_checks(config: ConsoleConfig, runner: Runner | None = None, *, robot: Robot | None = None, only=None,
               clock=time.monotonic, expected_prompt: str | None = None) -> list[Check]:
    runner = runner or Runner()
    robot = robot or Robot(config.remote, config.serving, runner)
    state = serving_state.load(config)
    expected = expected_prompt if expected_prompt is not None else state.get("prompt")
    probe_prompt = expected or next(iter(config.prompts.values()), "")
    groups = {
        "pika": lambda: _pika(robot, config),
        "link": lambda: _link(robot, config, runner, clock),
        "inference": lambda: _inference(robot, config, probe_prompt),
        "bridge": lambda: _bridge(robot, config, expected),
    }
    checks: list[Check] = []
    for item in only or ITEMS:
        try:
            checks += groups[item]()
        except (StepFailed, CommandFailed, ValueError, KeyError, IndexError) as error:
            checks += [Check(item, name, False, "error", "", str(error)) for name in _NAMES[item]]
    return checks


def format_table(checks: list[Check]) -> list[str]:
    lines = []
    for c in checks:
        line = f"{'PASS' if c.ok else 'FAIL'}  {c.name:22} {c.value:40} {c.threshold}"
        lines.append(line + (f"  ({c.detail})" if c.detail else ""))
    return lines


def save_history(config: ConsoleConfig, checks: list[Check]) -> Path:
    folder = config.console_dir / "linkcheck"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{datetime.datetime.now():%Y%m%d-%H%M%S-%f}.json"
    write_json(target, {"at": now(), "ok": all(c.ok for c in checks), "checks": [c.to_dict() for c in checks]})
    return target


def run(params: dict, log, runner: Runner | None = None) -> dict:
    config = load_config(params.get("config"))
    checks = run_checks(config, runner or Runner(), only=params.get("only"))
    for line in format_table(checks):
        log(line)
    history = save_history(config, checks)
    return {"ok": all(c.ok for c in checks), "checks": [c.to_dict() for c in checks], "history": str(history)}
```

In `jobs.py`, replace the `STEPS` definition with:

```python
STEPS = {
    **{kind: f"realman_training.steps.{kind}:run" for kind in ("pull", "clean", "view", "norm", "train", "eval", "register")},
    "serve": "realman_training.serving:run",
    "linkcheck": "realman_training.linkcheck:run",
}
```

- [ ] **Step 4: Run tests** — `PYTHONPATH=. python -m pytest -q test -p no:cacheprovider` (whole suite: jobs tests must still pass). Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/linkcheck.py src/training/realman_training/realman_training/serving_state.py src/training/realman_training/realman_training/jobs.py src/training/realman_training/test/test_linkcheck.py
git commit -m "feat(training): data-path checks between realman_ts and server5090

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `serving.py` — model, start, stop, status

**Files:**
- Create: `src/training/realman_training/realman_training/serving.py`
- Test: `src/training/realman_training/test/test_serving.py`

**Interfaces:**
- Consumes: `Robot` (Task 2), `linkcheck.run_checks`, `Check` (Task 3), `serving_state` (Task 3), `openpi.busy_gpus`, `openpi.check_name`, `openpi.run_dir`, `openpi.CONTAINER_PREFIX`, `load_config`, `StepFailed`, `now`, `CommandFailed`, `robot.script`, `robot.container_facts`.
- Produces:
  - `Model` dataclass `(config_name, exp, step: int, run_dir: Path, checkpoint: str, prompts: dict[str, str])`, `checkpoint` = `"checkpoints/<config>/<exp>/<step>"`.
  - `resolve_model(config, model: str | None, checkpoint: str | int | None) -> Model`, `model_prompts(run_dir: Path) -> dict[str, str]`.
  - `serve_container(sc) -> str`, `compose_argv(sc, *args) -> list[str]`, `serve_env(config, model, gpu, port) -> dict[str, str]`, `port_open(port, host="127.0.0.1", timeout=1.0) -> bool`.
  - `start(params, log, runner=None, *, port_open=port_open, sleep=time.sleep, clock=time.monotonic, checks=linkcheck.run_checks) -> dict`.
  - `stop(params, log, runner=None) -> dict`.
  - `status(config, runner=None) -> dict` with keys `serve`, `bridge`, `bt_mode`, `record`, `gpu`.
  - `run(params, log, runner=None) -> dict` dispatching on `params["action"]` (`start` / `stop`).

- [ ] **Step 1: Write the failing tests** — `test/test_serving.py`:

```python
from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from robot_fakes import PLACE, SERVER_ADDR, SERVE_CONTAINER, FakeChain

from realman_training import serving, serving_state
from realman_training.config import load_config
from realman_training.jobs import StepFailed
from realman_training.linkcheck import Check

PICK = "pick up the power adapter"
CFG, EXP = "pi05_realman_multitask_action_only", "m_multitask_b16_2gpu"


@pytest.fixture()
def config(tmp_path):
    docker_data = tmp_path / "openpi-docker-data"
    folder = docker_data / "checkpoints" / CFG / EXP
    for step in ("10000", "29999", "20000"):
        (folder / step).mkdir(parents=True)
    (folder / "model_card.json").write_text(json.dumps({"tasks": {
        "pick_and_place": {"prompt": PLACE, "count": 114}, "pick_only": {"prompt": PICK, "count": 103}}}))
    path = tmp_path / "console.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n  openpi:\n    docker_data: {docker_data}\n")
    return load_config(path)


def params(config, **extra):
    return {"config": str(config.source), "action": "start", **extra}


class Port:
    """Closed for the first `closed` polls, then open."""

    def __init__(self, closed=2):
        self.closed, self.polls = closed, 0

    def __call__(self, port, host="127.0.0.1", timeout=1.0):
        self.polls += 1
        return self.polls > self.closed + 1  # the first call is the "already in use?" check


def ok_checks(*args, **kwargs):
    return [Check("pika", "pika_nodes", True, "0", "0")]


def start(config, chain, **kw):
    fake = chain.runner()
    log = RecordingLog()
    result = serving.start(params(config, **kw), log, fake, port_open=Port(), sleep=lambda s: None,
                           clock=iter(range(10_000)).__next__, checks=ok_checks)
    return result, fake, log


def index(fake, needle):
    for i, call in enumerate(fake.calls):
        if needle in " ".join(call):
            return i
    raise AssertionError(f"no call with {needle!r}: {fake.calls}")


def test_resolve_model_takes_the_latest_checkpoint_and_the_card_prompts(config):
    model = serving.resolve_model(config, None, None)
    assert (model.config_name, model.exp, model.step) == (CFG, EXP, 29999)
    assert model.checkpoint == f"checkpoints/{CFG}/{EXP}/29999"
    assert model.prompts == {"pick_and_place": PLACE, "pick_only": PICK}
    assert serving.resolve_model(config, f"{CFG}/{EXP}", "10000").step == 10000


def test_resolve_model_refuses_unknown_runs_and_checkpoints(config):
    with pytest.raises(StepFailed, match="no run"):
        serving.resolve_model(config, f"{CFG}/nope", None)
    with pytest.raises(StepFailed, match="checkpoint 5 .*10000, 20000, 29999"):
        serving.resolve_model(config, None, 5)


def test_prompts_fall_back_to_the_view_contract(config, tmp_path):
    folder = config.openpi.docker_data / "checkpoints" / CFG / EXP
    (folder / "model_card.json").unlink()
    view = tmp_path / "view"
    view.mkdir()
    (view / "contract.json").write_text(json.dumps({"prompts": {"pick_only": PICK}}))
    (folder / "console_train.json").write_text(json.dumps({"view": str(view)}))
    assert serving.model_prompts(folder) == {"pick_only": PICK}
    (folder / "console_train.json").unlink()
    with pytest.raises(StepFailed, match="no task prompts"):
        serving.resolve_model(config, None, None)


def test_start_runs_the_chain_in_order(config):
    chain = FakeChain()
    result, fake, log = start(config, chain)
    mode = index(fake, "mode=")
    up = index(fake, "compose.serve.yaml up -d openpi")
    running = index(fake, "{{.State.Running}}")
    warm = index(fake, "uv run --no-sync python - ")
    bridge = index(fake, "docker compose up -d --no-deps --no-build policy_bridge")
    prompt = index(fake, "prompt=")
    assert mode < up < running < warm < bridge < prompt
    env = fake.envs[up]
    assert env["SERVE_CONFIG"] == CFG and env["SERVE_CHECKPOINT"] == f"checkpoints/{CFG}/{EXP}/29999"
    assert env["SERVE_GPU"] == "2" and env["OPENPI_POLICY_PORT"] == "18000"
    assert env["OPENPI_COMPOSE_PROJECT_NAME"] == "openpi-serve"
    assert f"POLICY_WS_HOST={SERVER_ADDR} " in fake.calls[bridge][-1]
    warm_cmd = fake.calls[warm][-1]
    assert fake.calls[warm][:4] == ["docker", "exec", "-i", SERVE_CONTAINER]
    assert "127.0.0.1 8000 2 " in warm_cmd and PLACE in warm_cmd
    assert result["warmup_ms"] == [900.0, 95.0] and result["prompt"] == PLACE and result["linkcheck_ok"] is True
    record = serving_state.load(config)
    assert record["prompt"] == PLACE and record["step"] == 29999 and record["gpu"] == 2
    assert not any("./rm65" in " ".join(c) or "rm65 up" in " ".join(c) for c in fake.calls)
    assert "/policy/activate" not in " ".join(" ".join(c) for c in fake.calls)


def test_start_with_a_task_uses_its_prompt(config):
    result, fake, _ = start(config, FakeChain(), task="pick_only")
    assert result["prompt"] == PICK
    assert PICK in fake.calls[index(fake, "prompt=")][-1]


def test_start_refuses_a_task_the_model_does_not_know(config):
    with pytest.raises(StepFailed, match="task 'stack'.*pick_and_place, pick_only"):
        start(config, FakeChain(), task="stack")


@pytest.mark.parametrize("field", ["active_mode", "selected_mode", "requested_mode"])
def test_start_refuses_while_the_bt_is_in_policy_mode(config, field):
    chain = FakeChain()
    chain.mode[field] = "policy"
    with pytest.raises(StepFailed, match="behaviour tree is in policy mode"):
        start(config, chain)


def test_start_and_stop_refuse_when_the_bt_mode_is_unknown(config):
    chain = FakeChain()
    chain.mode = {"unknown": True, "detail": "realman_bt_executor is running but sent no input_mode_state"}
    with pytest.raises(StepFailed, match="cannot tell the behaviour tree's mode"):
        start(config, chain)
    with pytest.raises(StepFailed, match="cannot tell"):
        serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), chain.runner())


def test_no_executor_on_the_graph_is_not_a_refusal(config):
    chain = FakeChain()
    chain.mode = None
    result, _, log = start(config, chain)
    assert "behaviour tree is not running" in log.text() and result["prompt"] == PLACE


def test_start_refuses_a_gpu_held_by_someone_else(config):
    chain = FakeChain()
    chain.gpu_used_mib = 16000
    with pytest.raises(StepFailed, match="GPU 2 .*16000 MiB"):
        start(config, chain)


def test_start_refuses_a_port_the_bridge_does_not_use(config):
    chain = FakeChain()
    chain.bridge_port = 18000
    with pytest.raises(StepFailed, match="server_port 18000"):
        start(config, chain, port=18001)


def test_start_refuses_when_serve_is_already_running(config):
    chain = FakeChain()
    chain.serve_running = True
    with pytest.raises(StepFailed, match="already running"):
        start(config, chain)


def test_start_refuses_a_port_in_use(config):
    fake = FakeChain().runner()
    with pytest.raises(StepFailed, match="port 18000 is already in use"):
        serving.start(params(config), RecordingLog(), fake, port_open=lambda *a, **k: True, sleep=lambda s: None,
                      clock=iter(range(100)).__next__, checks=ok_checks)


def test_refusals_happen_before_anything_starts(config):
    chain = FakeChain()
    chain.gpu_used_mib = 16000
    fake = chain.runner()
    with pytest.raises(StepFailed):
        serving.start(params(config), RecordingLog(), fake, port_open=Port(), sleep=lambda s: None,
                      clock=iter(range(100)).__next__, checks=ok_checks)
    assert not fake.commands(" up -d")


def test_dry_run_checks_but_starts_nothing(config):
    result, fake, _ = start(config, FakeChain(), dry_run=True)
    assert result["dry_run"] is True
    assert "up -d openpi" in " ".join(result["serve_command"])
    assert "policy_bridge" in result["bridge_command"]
    assert not fake.commands(" up -d") and not serving_state.load(config)


def test_a_serve_container_that_dies_while_loading_fails_with_its_logs(config):
    chain = FakeChain()
    chain.serve_dies = True
    chain.serve_logs = "libEGL_nvidia.so.580.173.02: no such file"
    fake = chain.runner()
    with pytest.raises(StepFailed, match="exited while loading.*libEGL"):
        serving.start(params(config), RecordingLog(), fake, port_open=lambda *a, **k: False, sleep=lambda s: None,
                      clock=iter(range(10_000)).__next__, checks=ok_checks)
    assert not fake.commands("policy_bridge up") and not fake.commands("--no-deps")


def test_a_bridge_that_does_not_confirm_the_prompt_fails(config):
    chain = FakeChain()
    chain.prompt_confirmed = False
    with pytest.raises(StepFailed, match="did not confirm the prompt"):
        start(config, chain)


def test_a_publishing_bridge_after_start_fails(config):
    chain = FakeChain()
    chain.stats = {**chain.stats, "allow_publish": "1.0"}
    with pytest.raises(StepFailed, match="allow_publish"):
        start(config, chain)


def test_failed_linkchecks_do_not_fail_the_start(config):
    chain = FakeChain()
    fake = chain.runner()
    log = RecordingLog()
    bad = lambda *a, **k: [Check("link", "bulk_throughput", False, "0.1 MB/s", ">= 2 MB/s")]  # noqa: E731
    result = serving.start(params(config), log, fake, port_open=Port(), sleep=lambda s: None,
                           clock=iter(range(10_000)).__next__, checks=bad)
    assert result["linkcheck_ok"] is False and "FAIL  bulk_throughput" in log.text()


def test_stop_refuses_in_policy_mode(config):
    chain = FakeChain()
    chain.mode["active_mode"] = "policy"
    fake = chain.runner()
    with pytest.raises(StepFailed, match="behaviour tree is in policy mode"):
        serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    assert not fake.commands("docker stop") and not fake.commands("compose stop")


def test_stop_stops_the_bridge_first(config):
    chain = FakeChain()
    chain.serve_running = True
    serving_state.save(config, {"prompt": PLACE})
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    bridge = index(fake, "docker compose stop policy_bridge")
    serve = index(fake, f"docker stop -t 30 {SERVE_CONTAINER}")
    assert bridge < serve < index(fake, f"docker rm {SERVE_CONTAINER}")
    assert result == {"bridge": "stopped", "serve": "stopped"}
    assert serving_state.load(config)["stopped"]


def test_stop_with_nothing_running(config):
    chain = FakeChain()
    chain.bridge_running = False
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    assert result == {"bridge": "not running", "serve": "not running"}
    assert not fake.commands("docker stop") and not fake.commands("compose stop")


def test_stop_dry_run_only_checks(config):
    chain = FakeChain()
    chain.serve_running = True
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop", "dry_run": True}, RecordingLog(), fake)
    assert result["dry_run"] is True and not fake.commands("docker stop") and not fake.commands("compose stop")


def test_status_reports_both_ends(config):
    chain = FakeChain()
    chain.serve_running = True
    serving_state.save(config, {"model": f"{CFG}/{EXP}", "step": 29999, "gpu": 2, "port": 18000, "prompt": PLACE})
    data = serving.status(config, chain.runner())
    assert data["serve"]["running"] is True and data["serve"]["image"] == "img:tag"
    assert data["gpu"] == {"index": 2, "used_mib": 500, "total_mib": 32607}
    assert data["bridge"]["running"] is True and data["bridge"]["server"] == SERVER_ADDR
    assert data["bridge"]["prompt"] == PLACE and data["bridge"]["paused"] == "0.0"
    assert data["bt_mode"]["active_mode"] == "none"
    assert data["record"]["step"] == 29999


def test_status_survives_an_unreachable_robot(config):
    chain = FakeChain()
    chain.unreachable = True
    data = serving.status(config, chain.runner())
    assert "unreachable" in data["bridge"]["error"]
    assert data["serve"] == {"running": False}


def test_run_dispatches_on_action(config, monkeypatch):
    seen = []
    monkeypatch.setattr(serving, "stop", lambda p, log, runner=None: seen.append(p["action"]) or {})
    serving.run({"action": "stop"}, RecordingLog())
    assert seen == ["stop"]
    with pytest.raises(StepFailed, match="action"):
        serving.run({"action": "restart"}, RecordingLog())
```

Note: `FakeChain` flips `serve_running` to `True` when the serve `compose ... up -d` runs (unless `serve_dies`), so the wait loop sees a running container until the fake port opens; when not running, `docker inspect openpi-serve-openpi-1` answers an empty string (absent).

- [ ] **Step 2: Run to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_serving.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'serving'`).

- [ ] **Step 3: Implement** — `realman_training/serving.py`:

```python
"""Start, stop and inspect the inference chain: openpi-serve on server5090 and policy_bridge on realman_ts.

start: refuse while the behaviour tree is in a policy mode, a GPU held by someone else, a port already in use or one
the robot's policy_bridge.yaml does not use, and a serve container that already runs; `docker compose up -d` the serve
project with SERVE_CONFIG/SERVE_CHECKPOINT/SERVE_GPU/OPENPI_POLICY_PORT; wait for the port; warm up (the first
inference after a restart JIT-compiles ~26 s and would make the bridge time out and pause); then
`docker compose up -d --no-deps --no-build policy_bridge` on realman_ts pointed at this server (never ./rm65, never
bringup or the behaviour tree), set the model's task prompt, check the bridge is not publishing, run the link checks.
stop: refuse while the behaviour tree is in a policy mode; stop the bridge first, then openpi-serve.
Nothing here activates the bridge: motion still needs the behaviour tree and /policy/activate.
"""

from __future__ import annotations

import dataclasses
import json
import shlex
import socket
import time
from pathlib import Path

from . import linkcheck, serving_state
from .config import ConsoleConfig, ServingConfig, load_config
from .jobs import StepFailed, now
from .openpi import CONTAINER_PREFIX, busy_gpus, check_name, run_dir
from .robot import Robot, container_facts, script
from .runner import CommandFailed, Runner


@dataclasses.dataclass(frozen=True)
class Model:
    config_name: str
    exp: str
    step: int
    run_dir: Path
    checkpoint: str  # relative to the openpi docker data dir, as SERVE_CHECKPOINT wants it
    prompts: dict[str, str]

    @property
    def name(self) -> str:
        return f"{self.config_name}/{self.exp}"


def model_prompts(folder: Path) -> dict[str, str]:
    """Task -> prompt of a run: its model_card.json, else the contract.json of the view it was trained on."""
    card = folder / "model_card.json"
    if card.is_file():
        data = json.loads(card.read_text(encoding="utf-8"))
        tasks = data.get("tasks")
        if isinstance(tasks, dict) and all(isinstance(v, dict) and v.get("prompt") for v in tasks.values()) and tasks:
            return {str(t): str(v["prompt"]) for t, v in tasks.items()}
        if isinstance(data.get("prompts"), dict) and data["prompts"]:
            return {str(t): str(p) for t, p in data["prompts"].items()}
    record = folder / "console_train.json"
    if record.is_file():
        view = Path(json.loads(record.read_text(encoding="utf-8")).get("view", ""))
        contract = view / "contract.json"
        if contract.is_file():
            prompts = json.loads(contract.read_text(encoding="utf-8")).get("prompts") or {}
            if prompts:
                return {str(t): str(p) for t, p in prompts.items()}
    return {}


def resolve_model(config: ConsoleConfig, model: str | None, checkpoint: str | int | None) -> Model:
    name = model or config.serving.model
    if name.count("/") != 1:
        raise StepFailed(f"model {name!r}: use <openpi config>/<exp>")
    config_name, exp = name.split("/")
    check_name("config_name", config_name)
    check_name("exp", exp)
    folder = run_dir(config.openpi, config_name, exp)
    if not folder.is_dir():
        raise StepFailed(f"no run {folder}")
    steps = sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())
    if not steps:
        raise StepFailed(f"{folder} has no checkpoints")
    wanted = checkpoint if checkpoint not in (None, "") else config.serving.checkpoint
    step = steps[-1] if wanted in (None, "") else int(wanted)
    if step not in steps:
        raise StepFailed(f"checkpoint {step} is not in {folder}: {', '.join(map(str, steps))}")
    prompts = model_prompts(folder)
    if not prompts:
        raise StepFailed(f"no task prompts known for {name}: register it (model_card.json) or train it with the console")
    return Model(config_name, exp, step, folder, f"checkpoints/{config_name}/{exp}/{step}", prompts)


def serve_container(sc: ServingConfig) -> str:
    return f"{sc.project}-{sc.service}-1"


def compose_argv(sc: ServingConfig, *args: str) -> list[str]:
    files = [Path(f).expanduser() for f in sc.compose_files]
    argv = ["docker", "compose", "-p", sc.project, "--project-directory", str(files[0].parent)]
    for f in files:
        argv += ["-f", str(f)]
    return [*argv, *args]


def serve_env(config: ConsoleConfig, model: Model, gpu: int, port: int) -> dict[str, str]:
    return {
        "OPENPI_COMPOSE_PROJECT_NAME": config.serving.project,
        "OPENPI_DOCKER_DATA_DIR": str(config.openpi.docker_data),
        "OPENPI_DOCKER_IMAGE": config.openpi.image,
        "SERVE_CONFIG": model.config_name,
        "SERVE_CHECKPOINT": model.checkpoint,
        "SERVE_GPU": str(gpu),
        "OPENPI_POLICY_PORT": str(port),
    }


def port_open(port: int, host: str = "127.0.0.1", timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def container_inspect(runner: Runner, name: str) -> dict | None:
    done = runner.run(["docker", "inspect", name])
    if done.returncode or not done.stdout.strip():
        return None
    data = json.loads(done.stdout)
    return container_facts(data[0]) if data else None


def _guard_bt(robot: Robot, sc: ServingConfig, log) -> dict | None:
    mode = robot.bt_mode()
    if mode is None:
        log("no realman_bt_executor on the ROS graph: the behaviour tree is not running")
        return None
    if mode.get("unknown"):
        raise StepFailed(f"cannot tell the behaviour tree's mode ({mode.get('detail')}); not touching the chain")
    modes = {mode.get(k) for k in ("requested_mode", "selected_mode", "active_mode")}
    if modes & set(sc.policy_modes):
        raise StepFailed(
            f"the behaviour tree is in policy mode (requested {mode.get('requested_mode')!r}, selected "
            f"{mode.get('selected_mode')!r}, active {mode.get('active_mode')!r}): switch it to none first"
            " (./scripts/bt.sh or the web console); the console never changes the BT mode"
        )
    log(f"behaviour tree mode: {mode.get('active_mode') or '-'}")
    return mode


def _pick_prompt(model: Model, task: str | None) -> tuple[str, str]:
    if task is None:
        task = next(iter(model.prompts))
    if task not in model.prompts:
        raise StepFailed(f"task {task!r} is not one of {model.name}'s tasks: {', '.join(model.prompts)}")
    return task, model.prompts[task]


def start(params: dict, log, runner: Runner | None = None, *, port_open=port_open, sleep=time.sleep,
          clock=time.monotonic, checks=linkcheck.run_checks) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    sc = config.serving
    model = resolve_model(config, params.get("model"), params.get("checkpoint"))
    gpu = int(params["gpu"]) if params.get("gpu") is not None else sc.gpu
    port = int(params["port"]) if params.get("port") is not None else sc.port
    task, prompt = _pick_prompt(model, params.get("task"))
    robot = Robot(config.remote, sc, runner)
    container = serve_container(sc)
    log(f"model {model.name} @ {model.step}, GPU {gpu}, port {port}, task {task}: {prompt!r}")

    _guard_bt(robot, sc, log)
    existing = container_inspect(runner, container)
    if existing and existing["running"]:
        raise StepFailed(f"openpi-serve is already running ({container}, started {existing['started']}); stop it first")
    if port_open(port):
        raise StepFailed(f"port {port} is already in use on this host")
    bridge_port = robot.bridge_port()
    if bridge_port != port:
        raise StepFailed(
            f"the robot's {sc.bridge_config} has network.server_port {bridge_port}: serve on {bridge_port}"
            " or change the robot config first"
        )
    busy = busy_gpus(runner, (gpu,), config.openpi.gpu_busy_mib)
    if busy:
        raise StepFailed(f"GPU {gpu} is in use by someone else ({busy[gpu]} MiB); pick a free GPU")
    server = robot.server_address()
    env = serve_env(config, model, gpu, port)
    up = compose_argv(sc, "up", "-d", sc.service)
    bridge_cmd = robot.compose_command("up", "-d", "--no-deps", "--no-build", sc.bridge_service, env={"POLICY_WS_HOST": server})
    log("$ " + " ".join(f"{k}={v}" for k, v in env.items()) + " " + shlex.join(up))
    log(f"$ ssh {config.remote.ssh_host} {bridge_cmd}")
    if params.get("dry_run"):
        return {"dry_run": True, "serve_command": up, "serve_env": env, "bridge_command": bridge_cmd,
                "model": model.name, "step": model.step, "prompt": prompt, "server": server}

    try:
        runner.check(up, env=env)
    except CommandFailed as error:
        raise StepFailed(f"openpi-serve did not start: {error}") from None
    deadline = clock() + sc.start_timeout_sec
    while not port_open(port):
        running = runner.run(["docker", "inspect", "-f", "{{.State.Running}}", container]).stdout.strip()
        if running != "true":
            logs = runner.run(["docker", "logs", "--tail", "30", container])
            raise StepFailed(f"{container} exited while loading: {(logs.stdout or logs.stderr).strip()[-1500:]}")
        if clock() > deadline:
            raise StepFailed(f"port {port} not listening after {sc.start_timeout_sec} s; see docker logs {container}")
        log.progress(0, None, "loading the checkpoint")
        sleep(2)
    log(f"port {port} listening; warming up ({sc.warmup_rounds} inferences)")

    inner = sc.container_port or port
    warm_cmd = CONTAINER_PREFIX + "uv run --no-sync python - " + shlex.join(["127.0.0.1", str(inner), str(sc.warmup_rounds), prompt])
    try:
        out = runner.check(["docker", "exec", "-i", container, "zsh", "-lc", warm_cmd], input=script("infer_probe"),
                           timeout=sc.warmup_timeout_sec)
    except CommandFailed as error:
        raise StepFailed(f"warm-up failed: {error}") from None
    warm = json.loads([line for line in out.splitlines() if line.startswith("{")][-1])
    for i, ms in enumerate(warm["ms"], 1):
        log(f"warm-up {i}: {ms:.0f} ms")

    record = {"model": model.name, "config": model.config_name, "exp": model.exp, "step": model.step,
              "checkpoint": model.checkpoint, "gpu": gpu, "port": port, "task": task, "prompt": prompt,
              "server": server, "started": now(), "warmup_ms": warm["ms"]}
    serving_state.save(config, record)

    robot.check(bridge_cmd, timeout=300)
    log("policy_bridge up; waiting for /policy/stats")
    deadline = clock() + sc.bridge_start_timeout_sec
    while robot.bridge_stats(5) is None:
        if clock() > deadline:
            raise StepFailed(f"no /policy/stats from the bridge within {sc.bridge_start_timeout_sec} s")
    answer = robot.set_prompt(prompt)
    if not answer.get("confirmed"):
        raise StepFailed(f"the bridge did not confirm the prompt {prompt!r} (published={answer.get('published')})")
    stats = answer.get("stats") or {}
    if float(stats.get("allow_publish", "0") or 0):
        raise StepFailed("the bridge reports allow_publish=1 right after start: call /policy/deactivate and check the BT")
    log(f"bridge prompt set to {prompt!r}; bridge inactive")

    results = checks(config, runner, robot=robot, expected_prompt=prompt)
    for line in linkcheck.format_table(results):
        log(line)
    linkcheck.save_history(config, results)
    ok = all(c.ok for c in results)
    if not ok:
        log("link checks failed: the chain is up but a policy run would likely stall (see above)")
    return {**record, "linkcheck_ok": ok, "linkcheck": [c.to_dict() for c in results]}


def stop(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    sc = config.serving
    robot = Robot(config.remote, sc, runner)
    container = serve_container(sc)
    _guard_bt(robot, sc, log)
    bridge = robot.container(sc.bridge_container)
    serve = container_inspect(runner, container)
    bridge_on = bool(bridge and bridge["running"])
    serve_on = bool(serve and serve["running"])
    if params.get("dry_run"):
        return {"dry_run": True, "bridge_running": bridge_on, "serve_running": serve_on}
    result = {"bridge": "not running", "serve": "not running"}
    if bridge_on:
        robot.check(robot.compose_command("stop", sc.bridge_service), timeout=120)
        log("policy_bridge stopped")
        result["bridge"] = "stopped"
    if serve_on:
        runner.check(["docker", "stop", "-t", "30", container])
        runner.check(["docker", "rm", container])
        log(f"{container} stopped")
        result["serve"] = "stopped"
    record = serving_state.load(config)
    if record:
        serving_state.save(config, {**record, "stopped": now()})
    return result


def status(config: ConsoleConfig, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    sc = config.serving
    record = serving_state.load(config)
    serve = container_inspect(runner, serve_container(sc)) or {"running": False}
    gpu_index = record.get("gpu", sc.gpu)
    gpu: dict = {"index": gpu_index}
    done = runner.run(["nvidia-smi", "-i", str(gpu_index), "--query-gpu=index,memory.used,memory.total",
                       "--format=csv,noheader,nounits"])
    if done.returncode == 0 and done.stdout.strip():
        _, used, total = (int(x) for x in done.stdout.strip().splitlines()[0].split(","))
        gpu.update(used_mib=used, total_mib=total)
    robot = Robot(config.remote, sc, runner)
    bridge: dict
    bt_mode = None
    try:
        facts = robot.container(sc.bridge_container) or {"running": False}
        bridge = {k: facts[k] for k in ("running", "status", "image", "image_id", "started") if k in facts}
        bridge["server"] = (facts.get("env") or {}).get("POLICY_WS_HOST")
        probe = robot.ros_probe(f"stats={config.linkcheck.stats_timeout_sec}", "mode=3")
        stats = probe.get("stats") or {}
        bridge.update({k: stats.get(k) for k in ("prompt", "paused", "allow_publish", "mode_active")})
        bt_mode = probe.get("mode")
    except StepFailed as error:
        bridge = {"error": str(error)}
    return {"serve": serve, "gpu": gpu, "bridge": bridge, "bt_mode": bt_mode, "record": record}


def run(params: dict, log, runner: Runner | None = None) -> dict:
    action = params.get("action")
    if action == "start":
        return start(params, log, runner)
    if action == "stop":
        return stop(params, log, runner)
    raise StepFailed(f"unknown serve action {action!r}: start or stop")
```

Implementation notes the tests depend on:
- `status` with `serve_running=False`: the fake answers `docker inspect openpi-serve-openpi-1` with empty stdout → `{"running": False}` exactly.
- `test_status_reports_both_ends` expects the bridge `server` from the container env, and `paused` as the raw string `"0.0"`.
- The `index(fake, "compose.serve.yaml up -d openpi")` assertion relies on `compose_argv` putting the `-f .../compose.serve.yaml` last before `up`.

- [ ] **Step 4: Run tests** — whole suite. Expected: PASS. Run ruff.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/serving.py src/training/realman_training/test/test_serving.py src/training/realman_training/test/robot_fakes.py
git commit -m "feat(training): start, stop and status of the inference chain

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: CLI `serve start|stop|status` and `linkcheck`

**Files:**
- Modify: `src/training/realman_training/realman_training/cli.py`
- Test: `src/training/realman_training/test/test_cli.py`

**Interfaces:**
- Consumes: `serving.status`, `linkcheck.run_checks`, `linkcheck.save_history`, `linkcheck.format_table`, `linkcheck.ITEMS`, `JobStore` (jobs kind `serve`).
- Produces: `realman-train serve start [--model CFG/EXP] [--checkpoint N] [--gpu N] [--port N] [--task T] [--dry-run] [--yes] [--background] [--json]`, `serve stop [--dry-run] [--yes] [--background] [--json]`, `serve status [--json]`, `linkcheck [--only ITEM,...] [--json]` (exit 1 when a check fails).

- [ ] **Step 1: Write the failing tests** (append to `test/test_cli.py`):

```python
def test_serve_start_needs_yes(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "serve", "start"]) == 2
    assert "--yes" in capsys.readouterr().err


def test_serve_stop_needs_yes(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "serve", "stop"]) == 2
    assert "--yes" in capsys.readouterr().err


def test_serve_start_runs_a_serve_job_with_the_options(setup, monkeypatch):
    _, _, config = setup
    seen = {}

    def fake_run_job(kind, params, args, cfg):
        seen.update(kind=kind, params=params)
        return 0

    monkeypatch.setattr("realman_training.cli._run_job", fake_run_job)
    assert main(["--config", str(config), "serve", "start", "--gpu", "3", "--task", "pick_only", "--dry-run"]) == 0
    assert seen["kind"] == "serve"
    assert seen["params"]["action"] == "start" and seen["params"]["gpu"] == 3 and seen["params"]["task"] == "pick_only"
    assert seen["params"]["dry_run"] is True and "port" not in seen["params"]


def test_serve_status_prints_json(setup, monkeypatch, capsys):
    _, _, config = setup
    data = {"serve": {"running": False}, "gpu": {"index": 2}, "bridge": {"error": "realman_ts unreachable"},
            "bt_mode": None, "record": {}}
    monkeypatch.setattr("realman_training.serving.status", lambda cfg: data)
    assert main(["--config", str(config), "serve", "status", "--json"]) == 0
    assert json.loads(capsys.readouterr().out) == data
    assert main(["--config", str(config), "serve", "status"]) == 0
    out = capsys.readouterr().out
    assert "openpi-serve: not running" in out and "policy_bridge: realman_ts unreachable" in out


def test_linkcheck_exit_code_follows_the_checks(setup, monkeypatch, capsys):
    from realman_training.linkcheck import Check

    _, _, config = setup
    results = [Check("pika", "pika_nodes", True, "0", "0"), Check("link", "ping", False, "avg 80 ms", "avg <= 50 ms")]
    seen = {}

    def fake_checks(cfg, runner=None, only=None, **kw):
        seen["only"] = only
        return results

    monkeypatch.setattr("realman_training.linkcheck.run_checks", fake_checks)
    assert main(["--config", str(config), "linkcheck", "--only", "pika,link"]) == 1
    out = capsys.readouterr().out
    assert "PASS  pika_nodes" in out and "FAIL  ping" in out
    assert seen["only"] == ["pika", "link"]
    assert main(["--config", str(config), "linkcheck", "--json"]) == 1
    assert json.loads(capsys.readouterr().out)["ok"] is False


def test_linkcheck_refuses_unknown_items(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "linkcheck", "--only", "wifi"]) == 2
    assert "pika, link, inference, bridge" in capsys.readouterr().err
```

- [ ] **Step 2: Run to verify they fail** — `PYTHONPATH=. python -m pytest -q test/test_cli.py -p no:cacheprovider`. Expected: FAIL (`invalid choice: 'serve'`).

- [ ] **Step 3: Implement** in `cli.py`:

Imports: `from . import linkcheck, serving`.

Split `_run_step` so the job part is shared:

```python
def _run_step(args, config) -> int:
    if args.command == "train" and not (args.yes or args.dry_run or args.attach):
        print("error: training occupies GPUs for hours; check the command with --dry-run, then add --yes", file=sys.stderr)
        return 2
    kind, params = build_params(args, config)
    return _run_job(kind, params, args, config)


def _run_job(kind: str, params: dict, args, config) -> int:
    store = JobStore(config.console_dir)
    store.recover()
    try:
        job = store.start(kind, params)
    except JobConflict as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    ...  # the rest of the old _run_step body, unchanged (background, wait, Ctrl-C cancel, --json result)
```

Add:

```python
SERVE_CONFIRM = {
    "start": "starting takes a GPU on server5090 and (re)creates policy_bridge on realman_ts",
    "stop": "stopping takes the policy server and policy_bridge down",
}


def _serve_status_text(data: dict) -> list[str]:
    serve, bridge, record, gpu = data["serve"], data["bridge"], data.get("record") or {}, data.get("gpu") or {}
    lines = []
    if serve.get("running"):
        lines.append(f"openpi-serve: running since {serve.get('started')} · {serve.get('image')} {serve.get('image_id', '')}")
    else:
        lines.append("openpi-serve: not running")
    if record:
        lines.append(f"  model {record.get('model')} @ {record.get('step')} · GPU {record.get('gpu')} · port {record.get('port')}"
                     f" · task {record.get('task')}" + (f" · stopped {record['stopped']}" if record.get("stopped") else ""))
    if "used_mib" in gpu:
        lines.append(f"  GPU {gpu['index']}: {gpu['used_mib']} / {gpu['total_mib']} MiB")
    if "error" in bridge:
        lines.append(f"policy_bridge: {bridge['error']}")
    else:
        state = f"running since {bridge.get('started')}" if bridge.get("running") else "not running"
        lines.append(f"policy_bridge: {state} · {bridge.get('image', '')} · server {bridge.get('server') or '-'}")
        lines.append(f"  prompt {bridge.get('prompt')!r} · paused {bridge.get('paused')} · allow_publish {bridge.get('allow_publish')}")
    mode = data.get("bt_mode")
    lines.append(f"behaviour tree: {mode.get('active_mode') if mode else 'no input_mode_state (not running?)'}")
    return lines


def _cmd_serve(args, config) -> int:
    if args.serve_command == "status":
        data = serving.status(config)
        print(json.dumps(data, ensure_ascii=False, indent=2) if args.json else "\n".join(_serve_status_text(data)))
        return 0
    if not (args.yes or args.dry_run):
        print(f"error: {SERVE_CONFIRM[args.serve_command]}; check with --dry-run, then add --yes", file=sys.stderr)
        return 2
    params = {"config": str(config.source), "action": args.serve_command, "dry_run": args.dry_run}
    if args.serve_command == "start":
        for key in ("model", "checkpoint", "gpu", "port", "task"):
            value = getattr(args, key)
            if value is not None:
                params[key] = value
    return _run_job("serve", params, args, config)


def _cmd_linkcheck(args, config) -> int:
    only = [part.strip() for part in args.only.split(",") if part.strip()] if args.only else None
    unknown = sorted(set(only or ()) - set(linkcheck.ITEMS))
    if unknown:
        print(f"error: unknown items {unknown}; choose from {', '.join(linkcheck.ITEMS)}", file=sys.stderr)
        return 2
    checks = linkcheck.run_checks(config, only=only)
    history = linkcheck.save_history(config, checks)
    ok = all(c.ok for c in checks)
    if args.json:
        print(json.dumps({"ok": ok, "checks": [c.to_dict() for c in checks], "history": str(history)}, ensure_ascii=False, indent=2))
    else:
        print("\n".join(linkcheck.format_table(checks)))
        print(f"{'all checks passed' if ok else 'some checks FAILED'} · {history}")
    return 0 if ok else 1
```

Note `_cmd_linkcheck` calls `linkcheck.run_checks(config, only=only)` through the module attribute, so the monkeypatch in the test takes effect; same for `serving.status(config)`.

Parser additions in `make_parser()` (before `jobs = sub.add_parser(...)`):

```python
    serve = sub.add_parser("serve", help="start/stop/status of the inference chain (openpi-serve + policy_bridge)")
    serve_sub = serve.add_subparsers(dest="serve_command", required=True)
    p = serve_sub.add_parser("start", help="openpi-serve with a registered model, warm-up, policy_bridge (inactive), link checks")
    p.add_argument("--model", help="<openpi config>/<exp> (default: serving.model)")
    p.add_argument("--checkpoint", help="checkpoint step (default: the latest)")
    p.add_argument("--gpu", type=int)
    p.add_argument("--port", type=int)
    p.add_argument("--task", help="task whose prompt the bridge gets (default: the model's first task)")
    p.add_argument("--dry-run", action="store_true", help="run the checks and print the commands only")
    p.add_argument("--yes", action="store_true")
    p.add_argument("--background", action="store_true")
    p.add_argument("--json", action="store_true")
    p = serve_sub.add_parser("stop", help="stop policy_bridge, then openpi-serve (refused in policy mode)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--yes", action="store_true")
    p.add_argument("--background", action="store_true")
    p.add_argument("--json", action="store_true")
    p = serve_sub.add_parser("status", help="both containers, model, GPU memory, bridge prompt")
    p.add_argument("--json", action="store_true")
    check = sub.add_parser("linkcheck", help="the four data-path checks (Pika/Wi-Fi, bulk + ping, inference, bridge)")
    check.add_argument("--only", help="comma list of pika, link, inference, bridge")
    check.add_argument("--json", action="store_true")
```

In `main()`, before `return _cmd_jobs(args, config)`:

```python
        if args.command == "serve":
            return _cmd_serve(args, config)
        if args.command == "linkcheck":
            return _cmd_linkcheck(args, config)
```

Also add `StepFailed` to the caught exceptions in `main()` (serve status/linkcheck call helpers that can raise it): `except (NotALeRobotDataset, FileNotFoundError, OSError, ValueError, KeyError, yaml.YAMLError, StepFailed) as error:` with `from .jobs import JobConflict, JobStore, StepFailed`.

- [ ] **Step 4: Run tests** — whole suite + ruff. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/cli.py src/training/realman_training/test/test_cli.py
git commit -m "feat(training): realman-train serve and linkcheck commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Docs, then the read-only check on the machines

**Files:**
- Modify: `website/docs/development/training-console.md` (new section `## 推理服务与链路检测` after `## 后台任务`; `## 安全规则` gains the serving rules; frontmatter `description` mentions 推理服务启停与链路检测)
- Modify: `website/docs/reference/configuration.md` (row for `training_console.yaml` mentions `serving`/`linkcheck`)
- Modify: `website/docs/reference/cli-and-env.md` (four new command lines)
- Modify (if the check shows a different value): `config/training/training_console.yaml` (`serving.ros_container`, `serving.service`, `serving.container_port`) and the matching defaults in `config.py` and their tests.

- [ ] **Step 1: Write the docs.** Content of the new section (Chinese, like the page):

```markdown
## 推理服务与链路检测

推理链路两端：server5090 上的 `openpi-serve`（compose 项目 `openpi-serve`，`~/organization/openpi/compose.yaml` + `~/data/realman/compose.serve.yaml`）和 realman_ts 上的 `policy_bridge` 容器。在 server5090 上：

```bash
PYTHONPATH=. python -m realman_training serve status
PYTHONPATH=. python -m realman_training serve start --dry-run                  # 只做检查、打印命令
PYTHONPATH=. python -m realman_training serve start --task pick_only --yes     # 默认模型、GPU 2、端口 18000
PYTHONPATH=. python -m realman_training serve stop --yes
PYTHONPATH=. python -m realman_training linkcheck [--only pika,link,inference,bridge] [--json]
```

`serve start`（后台任务，种类 `serve`，与 `stop` 互斥）：

1. 检查：行为树的 `requested/selected/active_mode` 是 `policy` 就拒绝；`openpi-serve` 已在运行、端口已被占用、GPU 显存超过 `openpi.gpu_busy_mib`（2000 MiB）、端口与机器人 `config/ros/policy_bridge.yaml` 的 `network.server_port` 不同（桥接的端口只能在那里改）都拒绝；模型必须有任务 prompt（`model_card.json` 的 `tasks`，否则训练视图的 `contract.json`），`--task` 只能选模型训练过的任务。
2. 用 `SERVE_CONFIG`/`SERVE_CHECKPOINT`/`SERVE_GPU`/`OPENPI_POLICY_PORT` 执行 `docker compose up -d`（`runtime: nvidia`，不用 `gpus:`），等端口监听（加载 checkpoint，最多 `start_timeout_sec`）。
3. 在服务容器里发 2 次真实尺寸的推理预热：重启后第一次推理要 JIT 编译约 26 s，会让桥接的 1.5 s 请求超时、连续 5 次失败后暂停。
4. 在 realman_ts 的 `~/realman_pi` 执行 `POLICY_WS_HOST=<server5090 地址> docker compose up -d --no-deps --no-build policy_bridge`（地址取 realman_ts 看到的 `$SSH_CLIENT`，不写进配置）；不调用 `./rm65`，不碰 bringup、web、录制容器和行为树。
5. 等 `/policy/stats` 出现，在 `/policy/prompt` 发所选任务的 prompt 并等桥接确认；桥接必须是非激活状态（`allow_publish=0`）。机械臂运动仍然只由行为树和 `/policy/activate` 决定。
6. 运行链路检测；检测失败不让启动失败，但会在日志里标出来。

启动记录在 `<data_root>/_console/serving.json`（模型、checkpoint、GPU、端口、任务、prompt、预热耗时）。`serve stop`：同样在 `policy` 模式下拒绝，先停桥接（`docker compose stop policy_bridge`），再停并删除 `openpi-serve-openpi-1`。`serve status`：两端容器、镜像、启动时间、GPU 显存、模型、桥接 prompt/paused/allow_publish、行为树模式；realman_ts 不可达时只报告原因。

| 检测项 | 判断 | 阈值（`linkcheck` 段） |
|---|---|---|
| `pika_nodes` | 机器人 ROS 图里的 `pika_*` 节点：Pika 定位器在 Wi-Fi 上发大量小 DDS 包（2026-10-14 实测 ~2.6 MB/s、>18000 包/s），批量 TCP 会掉到 0.1 MB/s 而 ping 正常 | 0 个 |
| `wifi_load` | realman_ts 的 Wi-Fi 接口 5 s 收发字节 | < 600 KB/s |
| `bulk_throughput` | realman_ts → server5090 经 ssh 传 16 MiB，从收到第一块开始计时 | ≥ 2 MB/s |
| `ping` | 1400 字节的 ping（小包在链路塌掉时也能通） | 平均 ≤ 50 ms，丢包 ≤ 5 % |
| `inference_round_trip` | 在桥接容器里向它实际使用的地址和端口发 1 + 5 次请求（两张 224×224 + 7 维状态 + prompt），第一次不计 | 中位数 < 200 ms |
| `bridge_prompt` / `bridge_paused` / `bridge_errors` | `/policy/stats`：prompt 等于所服务任务的 prompt（没有启动记录时等于配置里任一 prompt）、`paused=0`、没有 error/fail 计数 | 见左 |

每次检测写一份 `<data_root>/_console/linkcheck/<时间>.json`；某项无法执行（如 realman_ts 不可达）时该项判失败并给出原因，其余项照常执行。
```

Add to `## 安全规则`:

```markdown
- 推理服务：启停都在行为树为 `policy` 模式时拒绝；机器人侧只执行 `docker compose up -d --no-deps --no-build policy_bridge`、`docker compose stop policy_bridge` 和发布 prompt，从不调用 `./rm65`、不改行为树模式、不调用 `/policy/activate`。
```

`reference/cli-and-env.md`, after the `cancel` line:

```text
PYTHONPATH=. python -m realman_training serve start [--model <配置>/<实验>] [--checkpoint N] [--gpu N] [--port N] [--task <任务>] [--dry-run] [--yes]
PYTHONPATH=. python -m realman_training serve stop [--dry-run] [--yes]
PYTHONPATH=. python -m realman_training serve status [--json]
PYTHONPATH=. python -m realman_training linkcheck [--only pika,link,inference,bridge] [--json]
```

`reference/configuration.md` row: replace the description cell with `data_root`、逐条质检阈值（`quality`）、realman_ts 录制（`remote`）、openpi（`openpi`）、推理服务（`serving`：模型、GPU、端口、两端容器）和链路检测阈值（`linkcheck`）、任务 prompt（`prompts`）.

- [ ] **Step 2: Website build + e2e for the page** — `cd website && npm ci && npm run build && npm run test:e2e -- --grep training-console` (Mac: `PLAYWRIGHT_CHROME_PATH` to the local Chrome). Expected: build OK, route test passes.

- [ ] **Step 3: Commit docs**

```bash
git add website/docs/development/training-console.md website/docs/reference/configuration.md website/docs/reference/cli-and-env.md
git commit -m "docs(training): serve and linkcheck commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Read-only check on server5090** (no start/stop without the user's OK). Copy the branch to a scratch checkout on server5090 (`git bundle` or `rsync` of `src/training` + `config/training`; server5090 has no GitHub auth) and run, from `src/training/realman_training`:

```bash
ssh realman_local 'echo "$SSH_CLIENT"; docker ps --format "{{.Names}}"'   # is the address the LAN one? the ROS container's name?
grep -n "port\|network_mode\|command" ~/data/realman/compose.serve.yaml     # service name, host networking or a port mapping
PYTHONPATH=. python -m realman_training serve status
PYTHONPATH=. python -m realman_training serve start --dry-run --json
PYTHONPATH=. python -m realman_training serve stop --dry-run --json
PYTHONPATH=. python -m realman_training linkcheck
```

Expected: status shows `openpi-serve-openpi-1` running with the multitask model and the bridge's prompt; both dry runs pass their refusal checks (or refuse for a stated, true reason — e.g. "already running" for start is correct while it serves); linkcheck prints 8 rows. If a container name, the service name or the in-container port differs, fix the config default (Task 1 files + test) and re-run. Record the results in the PR description.

- [ ] **Step 5: Commit any config fix** with the same trailer, push, open the PR against `main`, wait for CI green.
```

---

## Self-review notes

- Spec coverage: start steps 1–4 → Task 4 `start` (refusals, compose up with the four env vars, port wait, 2 warm-ups with real-size fake input, bridge `up -d --no-deps`, inactive, linkcheck); stop order + policy refusal → `stop`; status → `status`; 4 linkcheck items with value/threshold → Task 3; settings in `serving`/`linkcheck` sections → Task 1; "prompt only from the model's contract" → `model_prompts`; history ("结果与历史") → `save_history`; CLI with `--yes`/`--dry-run` → Task 5; tests with faked docker/ssh → Tasks 2–5; docs → Task 6. Spec's "网页上改的值存到平台状态目录" is Plan 4 (web).
- Type consistency: `Robot.ros_probe` / `bt_mode` / `bridge_stats` / `set_prompt` used by Tasks 3–4 as defined in Task 2; `linkcheck.run_checks(config, runner, *, robot, only, clock, expected_prompt)` called with those keywords in Task 4; `serving_state.load/save` same in Tasks 3–4; `Check.to_dict()` in Tasks 3–5.
