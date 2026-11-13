# :8765 Pika 速度控制开关 — Design

Date: 2026-11-13. Status: approved approach A, spec under review.

## Goal

One button on the :8765 page turns Pika velocity teleoperation on and off:

- **On**: start the Pika teleop stack on the host, wait until both Pika velocity
  streams arrive, then select the `pikavelocity` input mode (the control tree moves
  the arms to the Pika default pose and starts following).
- **Off**: select `none` (无输入) so the arms stop following, then stop the Pika stack.

Today the mode switch already exists on :8765, but the Pika stack is started by hand
(`~/pika_teleop_ws/start_pika_bag.sh` in tmux session `pika` on SJDrealman).

Non-goals: Pika position / mixed modes (the same switch could be extended later),
starting the control tree itself (the existing BT start menu does that), managing
Pika on a different machine in this iteration (see "Per-host configuration").

## Components

### 1. Host helper `scripts/pika_process_helper.py`

Runs on the robot host, not in a container, because the Pika stack is a native
install (USB serial, libsurvive config, DISPLAY for the locator). Same shape as
`scripts/docker_restart_helper.py`: standard library only, `ThreadingHTTPServer`
bound to `127.0.0.1`, JSON in/out, one operation at a time (409 if busy).

Endpoints:

| Method | Path | Effect |
|---|---|---|
| GET | `/status` | `{"running": bool, "busy": bool, "last": {...}}`, `running` from the status command's exit code |
| POST | `/start` | runs the start command; 200 if it exits 0 (already running is success) |
| POST | `/stop` | runs the stop command; 200 if it exits 0 (already stopped is success) |

Commands are fixed argv lists from `config/docker/pika_helper.json`; the HTTP body
carries no command, path or argument. `last` records action, exit code, start/finish
time and the last 12 output lines, as the restart helper does.

`config/docker/pika_helper.json` (SJDrealman values; paths use `~` expanded by the helper):

```json
{
  "bind_host": "127.0.0.1",
  "port": 8783,
  "timeout_sec": 20,
  "start": ["tmux", "new-session", "-d", "-s", "pika", "~/pika_teleop_ws/start_pika_bag.sh"],
  "status": ["tmux", "has-session", "-t", "=pika"],
  "stop": ["tmux", "send-keys", "-t", "=pika", "C-c"],
  "stop_grace_sec": 8,
  "kill": ["tmux", "kill-session", "-t", "=pika"]
}
```

`start` is skipped (success) when `status` already exits 0. `stop` sends Ctrl-C,
polls `status` until it fails or `stop_grace_sec` passes, then runs `kill`.
Installed with `./rm65 pika-helper install`, which adds a **user** systemd unit
(`systemctl --user`, unit file `config/docker/realman-pika-helper.service`), not a
system unit like the restart helper: it must run as the desktop user so tmux and
DISPLAY=:0 work, and SJDrealman has no passwordless sudo. Needs
`loginctl enable-linger` once (done by the operator if not already on).

### 2. `realman_web_control`: `pika_switch.py` (ROS-neutral state machine)

A pure class, unit-testable without ROS, owned by `web_control_node` and called
under its existing control serialization. Inputs: commands from the browser,
helper results, per-arm Pika input age, input-mode snapshots. Outputs: effects
(`helper_start`, `helper_stop`, `select_mode(mode_id)`, `send_event`).

States (`phase`):

| phase | meaning | exits |
|---|---|---|
| `off` | stack stopped, not our mode | `on` command → `starting` |
| `starting` | helper `/start` in flight | ok → `waiting_input`; error → `failed` |
| `waiting_input` | stack up, waiting for `/pika/l` and `/pika/r` cartesian_velocity both younger than `input_fresh_ms` | both fresh → `selecting`; `input_wait_timeout_sec` → `failed` (stack is left running, see below) |
| `selecting` | `pikavelocity` requested through the input-mode bridge | `ACTIVE` + `active_mode == pikavelocity` → `on`; bridge error/timeout → `failed` |
| `on` | Pika velocity active | `off` command → `stopping`; mode leaves `pikavelocity` (another mode selected anywhere) → stays `on` with `mode_lost: true` |
| `stopping` | `none` requested, then helper `/stop` | helper ok → `off`; error → `failed` |
| `failed` | `detail` holds the reason | `on` or `off` command retries from the start |

Rules:

- **Off order**: select `none` first and wait for it (or for the bridge timeout),
  then stop the stack. If the input-mode router is unavailable, skip the mode step
  and still stop the stack; if the router is available but `none` is refused,
  still stop the stack (with no input the router releases the session after
  `input_timeout_ms` = 3 s, so the arms stop anyway), and report the refusal in `detail`.
- **On failure while waiting for input** the stack is left running so the operator
  can look at it; `off` stops it. The detail names the missing arm(s) (e.g.
  `no /pika/r input for 30 s`).
- **Mode selection reuses** `InputModeBridge.select_mode` with the requesting
  browser's `client_id` and a server-made request id (`pika-<n>`), so the existing
  cancel-web-actions, supersede and timeout behaviour applies unchanged. If the
  catalog has no `pikavelocity` option (control tree not running), `on` fails
  before starting the stack: `pikavelocity mode is not available; start the control tree first`.
- **One owner**: only one sequence runs; a second `on`/`off` during a transition
  returns `pika_switch_busy`. The state is global and broadcast, so every open page
  shows the same phase.
- **External changes**: the helper `/status` is polled every
  `status_poll_sec` (default 2 s) while idle; a stack started or stopped by hand
  moves the shown state (`off` ↔ `running, mode not pikavelocity`) without
  selecting any mode. At node start the phase is derived the same way: stack
  running and active mode `pikavelocity` → `on`; otherwise `off` (stack running
  but another mode is shown as `off` with `stack_running: true`, and `off` then
  only stops the stack).
- **Access**: the same gate as `select_input_mode` (currently none; read-only
  mode only blocks gripper limit writes). If the server later gates mode
  selection, this command follows it.

Node wiring in `web_control_node.py`: two `TwistStamped` subscriptions on
`/pika/{l,r}/cartesian_velocity` recording the last receive time (monotonic,
local clock, as the router does), a timer for timeouts and status polling, and
the helper calls made off the control thread (short HTTP with
`helper_timeout_sec`) with results fed back serialized.

### 3. Protocol and page

WebSocket messages (validated in `protocol.py`):

- browser → server: `{"type": "pika_switch", "request_id": "...", "enabled": true|false}`
- server → browser: `{"type": "pika_switch_state", "available": bool, "phase": "...",
  "stack_running": bool, "input_age_ms": {"l": n|null, "r": n|null},
  "mode_lost": bool, "detail": "..."}`, sent on connect and on every change.

`available` is false when `pika_switch.helper_url` is empty or the helper does not
answer; the page then hides the button.

Page: one toggle in the input-mode area, labelled `Pika 速度控制` with the phase as
text (未启动 / 启动中 / 等待 Pika 数据 l✓ r… / 切换模式 / 运行中 / 关闭中 / 失败: detail).
It is disabled during transitions. While `on`, the button reads `关闭 Pika`.

### 4. Configuration

`config/ros/realman_web_control.yaml`:

```yaml
# "Pika 速度控制" switch on :8765. scripts/pika_process_helper.py runs on the robot
# host (./rm65 pika-helper install) with commands from config/docker/pika_helper.json.
pika_switch:
  helper_url: http://127.0.0.1:8783  # Empty string hides the switch.
  helper_timeout_sec: 25.0           # Above the helper's timeout_sec + stop_grace_sec.
  input_fresh_ms: 500                # Both l and r must be newer than this.
  input_wait_timeout_sec: 30.0       # Stack started but no Pika data → failed.
  status_poll_sec: 2.0
  mode: pikavelocity
  off_mode: none
```

### Per-host configuration

The JSON commands are per host. SJDrealman gets the values above. On realman_ts
the Pika stack runs on PikaRemote, so its commands would be `ssh PikaRemote ...`;
this iteration ships no realman_ts values and leaves `helper_url` empty there
(switch hidden). Host-specific values stay out of git where they contain private
addresses (use the untracked `.env`/skip-worktree pattern already used for arm IPs).

## Error handling summary

| Situation | Result |
|---|---|
| helper not installed / unreachable | `available: false`, button hidden |
| control tree not running | `on` fails immediately, stack not started |
| start command fails | `failed`, helper output tail in `detail` |
| one Pika arm never publishes (e.g. right tracker missing) | `failed` after 30 s, stack left running |
| page closed mid-sequence | sequence continues on the server |
| Pika stream drops while on | unchanged router behaviour: zero velocity after 200 ms, session released after 3 s |
| web_control restarts while on | comes back as `stack running, mode pikavelocity` → shown as `on` |

## Testing

- `test_pika_process_helper.py`: fake runner; start when already running, stop
  grace then kill, busy 409, argv never taken from the request.
- `test_pika_switch.py`: every transition in the table with a fake clock,
  including off-with-router-unavailable, refused `none`, missing-arm detail,
  busy, external stop, mode lost.
- `test_protocol.py`: `pika_switch` validation.
- Playwright `web-control.spec.ts`: button hidden when unavailable, phases render,
  disabled during transitions (mocked WS events).
- Robot check on SJDrealman: on → arms move to Pika default pose and follow; off →
  arms stop, `tmux has-session -t pika` fails.

## Docs

`website/docs/development/realman-web-control.md` (switch, states, config) and
`startup-entries.md` (`./rm65 pika-helper install`).
