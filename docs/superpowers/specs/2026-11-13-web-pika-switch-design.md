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
| GET | `/status` | `{"running": bool, "busy": bool, "last": {...}}`, `running` from the status command's exit code (0 running, 1 not running; any other exit adds `"error"` and reports `running: false`) |
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
  "status_timeout_sec": 5,
  "start": ["tmux", "new-session", "-d", "-s", "pika", "~/pika_teleop_ws/start_pika_bag.sh"],
  "status": ["tmux", "has-session", "-t", "=pika"],
  "stop": ["tmux", "send-keys", "-t", "=pika", "C-c"],
  "stop_grace_sec": 8,
  "kill": ["tmux", "kill-session", "-t", "=pika"]
}
```

`start` is skipped (success) when `status` already exits 0. `stop` sends Ctrl-C,
polls `status` until it fails or `stop_grace_sec` passes, then runs `kill`.
Only `has-session` exit 1 means "not running"; any other non-zero exit (124
timeout, 127 missing tmux, ...) makes `start`/`stop` fail with that output. The
status probe uses `status_timeout_sec` (optional, default 5 s), the other commands
`timeout_sec`.
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
| `starting` | helper `/start` in flight (busy) | ok → `waiting_input`; error, or no answer within `helper_timeout_sec` + 5 s → `failed` |
| `waiting_input` | stack up, waiting for `/pika/l` and `/pika/r` cartesian_velocity both younger than `input_fresh_ms` | both fresh → `selecting`; `input_wait_timeout_sec` → `failed` (stack is left running, see below); `off` command → `stopping` (helper `/stop` only) |
| `selecting` | `pikavelocity` requested through the input-mode bridge | `ACTIVE` + `active_mode == pikavelocity` for our executor request → `on`; refused, FAILED, executor fallback (our request id with `requested_mode` no longer `pikavelocity`; FAILED lasts one executor tick), superseded or `mode_switch_timeout_sec` → `failed`; `off` command → forget the request, `stopping` with `none` |
| `on` | Pika velocity active | `off` command → `stopping`; mode leaves `pikavelocity` (another mode selected anywhere) → stays `on` with `mode_lost: true` |
| `stopping` | `none` requested (only when `pikavelocity` is active or requested; at most `off_mode_timeout_sec`), then helper `/stop` (busy) | helper ok → `off`; error, or no answer within `helper_timeout_sec` + 5 s → `failed` |
| `failed` | `detail` holds the reason | `on` or `off` command retries from the start; stack running and the tree ACTIVE in `pikavelocity` (any request) → `on` |

Rules:

- **Off order**: when `pikavelocity` is active or requested, select `none` first and
  wait for it (or for `off_mode_timeout_sec`, 10 s), then stop the stack; otherwise
  only stop the stack. If the input-mode router is unavailable, skip the mode step
  and still stop the stack; if the router is available but `none` is refused,
  times out, is superseded, or the bridge times out before the executor accepted
  it (`none not confirmed`), still stop the stack (with no input the router
  releases the session after `input_timeout_ms` = 3 s, so the arms stop anyway),
  and report the reason in `detail`. `detail` after a completed off is set only in
  those cases.
- **Off during the entry**: `off` is accepted in `waiting_input` (no mode selected
  yet → helper stop) and in `selecting` (the outstanding `pikavelocity` request is
  forgotten, its late result or error is ignored; `none` is selected as in the
  off step, then the stack is stopped). Only `starting` and `stopping` are busy.
- **Off without a helper**: `off` is accepted while the helper is unreachable as
  long as the row is shown (see `available`): the `none` step runs as usual and the
  helper stop then fails into `failed` with its detail. `on` needs a reachable helper.
- **Helper calls always answer**: the client turns any exception into a failed
  call, the node's helper thread reports every outcome, and a start/stop with no
  answer after `helper_timeout_sec` + 5 s fails (`Pika helper <action> got no
  answer`). Every helper call carries an epoch; answers of a call issued before
  a later start/stop are dropped, a late answer of the current one is handled
  as normal without starting another transition.
- **On failure while waiting for input** the stack is left running so the operator
  can look at it; `off` stops it. The detail names the missing arm(s) (e.g.
  `no /pika/r input for 30 s`).
- **Mode selection reuses** `InputModeBridge.select_mode` with the switch's own
  client id `pika_switch` and a server-made request id (`pika-<n>`), so the existing
  cancel-web-actions and supersede behaviour applies unchanged. Results are
  correlated by the executor request id from the bridge's `input_mode_result`
  (refused, or any bridge `error` for that request → fail/stop at once; only
  snapshots of that request, or a newer one = superseded, decide the outcome), so
  a FAILED/ACTIVE snapshot from an older request never decides a new attempt. The
  bridge's 5 s pending timeout (`input_mode_timeout`) is ignored while selecting
  in favour of `mode_switch_timeout_sec` (150 s, covers the entry MoveJ). If the
  catalog has no `pikavelocity` option (control tree not running), `on` is refused
  before starting the stack (`pika_mode_unavailable`, phase stays `off`, the page
  shows the message in the Pika row): `pikavelocity mode is not available; start the control tree first`.
- **One owner**: only one sequence runs; `on` during any transition and `off`
  during `starting`/`stopping` return `pika_switch_busy`. The state is global and broadcast, so every open page
  shows the same phase.
- **External changes**: the helper `/status` is polled every
  `status_poll_sec` (default 2 s) while idle; a stack started or stopped by hand
  moves the shown state (`off` ↔ `running, mode not pikavelocity`) without
  selecting any mode. At node start the phase is derived the same way: stack
  running and active mode `pikavelocity` → `on`; otherwise `off` (stack running
  but another mode is shown as `off` with `stack_running: true`, and `off` then
  only stops the stack). A `/status` with `error` (the probe itself failed)
  counts as an unreachable helper and keeps the last known `stack_running`; the
  node logs reachability changes once.
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
  "mode_lost": bool, "detail": "...", "helper_reachable": bool, "input_fresh_ms": n}`,
  sent on connect and on every change.

`available` is false when `pika_switch.helper_url` is empty, or when the helper
does not answer while the phase is `off` and the stack is not known to run; the
page then hides the row. While the phase is not `off` or the stack runs, the row
stays (Pika may still drive the arms) and the page appends `（helper 不可达）`
to the state text when `helper_reachable` is false.

Page: one toggle in the input-mode area, labelled `Pika 速度控制` with the phase as
text (未启动 / 启动中 / 等待 Pika 数据 l✓ r… / 切换模式 / 运行中 / 关闭中 / 失败: detail);
✓ uses the event's `input_fresh_ms` (fallback 500). The button is disabled only
in `starting`/`stopping` (or when the page cannot write). It reads `关闭 Pika` in
`waiting_input`, `selecting`, `on` and whenever the stack is running (`off` with
`stack_running: true`, shown as `Pika 已运行（未切换模式）`, or `failed` with the
stack up); otherwise `启动 Pika`. `error` events whose `request_id` starts with
`pika-switch-` are shown in the row for about 6 s. The row is hidden when the
socket closes.

### 4. Configuration

`config/ros/realman_web_control.yaml`:

```yaml
# "Pika 速度控制" switch on :8765. scripts/pika_process_helper.py runs on the robot
# host (./rm65 pika-helper install) with commands from config/docker/pika_helper.json.
pika_switch:
  helper_url: http://127.0.0.1:8783  # Empty string hides the switch (or no helper answers).
  helper_timeout_sec: 40.0           # Above the worst start (status 5 + start 20 + status 5 s) and a stop within stop_grace_sec; +5 s = no-answer deadline.
  input_fresh_ms: 500                # Both l and r must be newer than this.
  input_wait_timeout_sec: 30.0       # Stack started but no Pika data → failed.
  status_poll_sec: 2.0
  mode_switch_timeout_sec: 150.0     # Covers the entry MoveJ (pika_default_pose.timeout_sec 120).
  off_mode_timeout_sec: 10.0         # Off step: wait this long for `none`, then stop anyway.
  mode: pikavelocity
  off_mode: none
```

### Per-host configuration

The JSON commands are per host. SJDrealman gets the values above. On realman_ts
the Pika stack runs on PikaRemote, so its commands would be `ssh PikaRemote ...`;
this iteration ships no realman_ts values: realman_ts keeps the committed
`helper_url` but installs no helper, so no helper answers and the row is hidden
(or set `helper_url: ""` there to stop the status polling too). Host-specific values stay out of git where they contain private
addresses (use the untracked `.env`/skip-worktree pattern already used for arm IPs).

## Error handling summary

| Situation | Result |
|---|---|
| helper not installed / unreachable (phase `off`, stack not running) | `available: false`, row hidden |
| helper becomes unreachable while Pika may run | row stays with `（helper 不可达）`; `off` selects `none`, then the stop fails into `failed` |
| helper start/stop never answers | `failed` after `helper_timeout_sec` + 5 s |
| control tree not running | `on` refused, phase stays `off`, message in the Pika row, stack not started |
| `off` during the entry MoveJ | `pikavelocity` request forgotten, `none` selected, stack stopped |
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
  arms stop, `tmux has-session -t pika` fails; off during the entry MoveJ → `none`,
  stack stopped. Before that, check that the user unit has `DISPLAY` and
  `XAUTHORITY` (`systemctl --user show-environment`; the locator rviz needs them)
  and that `start_pika_bag.sh` works from a non-interactive tmux shell.

## Docs

`website/docs/development/realman-web-control.md` (switch, states, config) and
`startup-entries.md` (`./rm65 pika-helper install`).
