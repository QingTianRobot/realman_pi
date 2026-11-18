# :8770 Pika 重标定按钮 — Design

Date: 2026-11-18. Status: approach 1 approved, spec under review.

## Goal

One button in the :8770 Pika panel recalibrates the Pika lighthouse setup. It does
a clean stop of the Pika stack, moves the libsurvive base-station calibration
aside, and starts the stack again. libsurvive then re-solves the base-station
poses from scratch. The page shows each step and whether the left and right Pika
are localized again.

Why: on 2026-11-18 the left Pika stopped publishing poses. The base-station
calibration in `~/.config/libsurvive/config.json` on enine had drifted: base
station 1 sat about 70 cm from its 11-16 position with the same orientation,
and the global-solve error was 20-100x the normal value. The right Pika still
localized and the left did not. The only fix is to delete the calibration and
restart, which today means ssh to the Pika host.

Non-goals:
- Re-plugging USB. The software cannot do this. If a restart leaves the trackers
  stuck, the page tells the operator to re-plug both Pikas and press again.
- Showing the libsurvive solve error on the page.
- The mapper's per-session Pika→arm alignment (`PIKA BASE CALIBRATED`). That
  alignment happens on its own at every session start and is not touched here.
- Moving the button to :8765.

## Flow (one click)

1. The operator presses **重标定** in the Pika panel and confirms the dialog:
   "将重启 Pika 栈并清除基站标定；请把两个 Pika 静置在两个基站都能看到的位置".
2. :8770 refuses with 409 if the recorder is busy (state COUNTDOWN, RECORDING or
   FINALIZING) or if either Pika side has `command_active` (a velocity
   command is flowing). The refusal is shown in the panel.
3. :8770 calls `POST <pika_helper_url>/recalibrate`. Through the existing tunnel,
   the helper on the Pika host runs as one locked action:
   - **stop:** the same clean stop as `/stop`, including the cleanup of leftover
     process groups.
   - **clear:** rename `libsurvive_config` to `config.json.bak-YYYYMMDD-HHMMSS`.
     If the file is missing, skip this step and note it.
   - **start:** the same start as `/start`.
4. The panel shows 停止中 → 清除标定 → 启动中 while the request runs, then
   等待定位. It waits until both sides' existing pose `state` is `live`
   (`snapshot.pika.sides.<side>.state`).
5. If both sides are live within 60 s, it shows 已重新定位. If not, it names the
   sides that are not live and says "未重新定位：先在 :8765「Pika 速度控制」点关闭 Pika
   停栈，再重新插拔两个 Pika，然后再点一次重标定". Re-plugging must happen with the stack
   stopped: re-plugging while it runs and then restarting leaves the trackers stuck. With the
   stack already stopped, 重标定 only starts it once (the helper's stop is a no-op).

## Components

### 1. Host helper `scripts/pika_process_helper.py` + `config/docker/pika_helper.json`

- New optional config key `libsurvive_config` (string, a leading `~/` is
  expanded the same way as the argv entries). It must be an absolute path after
  expansion and its file name must end in `.json`. When the key is absent,
  `POST /recalibrate` returns 404 `{"ok": false, "error": "recalibrate not configured"}`.
- `PikaProcess.recalibrate()`:
  - takes the same single-action lock (`_begin("recalibrate")`, 409 while busy);
  - runs the stop logic shared with `stop()` (factor the body into `_stop_locked()`);
  - **if the stack is still running after stop, it does not rename and does not start**:
    it finishes with exit 1 and "not recalibrated: Pika stack still running";
  - renames the calibration with `os.replace` to a sibling `<name>.bak-<local timestamp>`.
    If that name already exists, it appends `-1`, `-2`, and so on. A rename OSError
    finishes with exit 1 and nothing is started;
  - runs the start logic shared with `start()` (factor into `_start_locked()`);
  - result: `{"ok": true, "action": "recalibrate", "backup": "<path or null>", ...}`.
    The result is judged by the end state, like `start`. `last` in `/status` carries
    `backup`.
- HTTP: `POST /recalibrate` is added to the action table. The request body is
  ignored, as for the other actions.
- The repo's `pika_helper.json` gets `"libsurvive_config": "~/.config/libsurvive/config.json"`.
  The enine copy gets the same key.
- The helper timeout stays per command. The whole action takes up to about 15 s
  of stop grace, plus leftover handling, plus start (≤ 20 s).

### 2. :8770 backend (`realman_recording`)

- New parameters on `/recording_web_bridge`:
  - `pika_helper_url` (string, default `""` = feature off, button hidden);
  - `pika_helper_timeout_sec` (default 90.0; a worst-case recalibrate is stop ≈ 32 s + start ≈ 37 s).

  Validation: empty, or an `http://` URL whose host is 127.0.0.1, localhost or ::1.
  The helper is only reached through the loopback tunnel.
- New module `realman_recording/pika_helper_client.py`. It is a stdlib `urllib`
  client with the same shape as `realman_web_control/pika_helper_client.py`
  (`call_helper(base_url, action, timeout)` returning `(ok, payload)`), with the
  actions `status` (GET) and `recalibrate` (POST). It is copied rather than
  imported, so the recording package gains no dependency on web_control.
- The bridge node passes a `pika_recalibrate: Callable[[], tuple[int, dict]] | None`
  into `RecordingWebServer`, the same pattern as `export_all`. The callable does
  the following:
  - checks the latest recorder state and the latest pika snapshot. It returns
    409 `{"ok": false, "error": "录制进行中，不能重标定"}` or
    `"Pika 速度指令进行中，不能重标定"`;
  - otherwise calls the helper and maps the result: 200 when the helper succeeds,
    otherwise the helper's error with status 502 (unreachable or failed) or 409
    (helper busy).
- Routes:
  - `POST /api/pika/recalibrate`: runs the callable in the default executor so it
    never blocks the aiohttp loop.
  - `GET /api/pika/helper`: the helper's `/status`, or `{"configured": false}`
    when the feature is off.
- `/api/layout` (manifest) gains `pika_recalibrate: true|false`, so the frontend
  knows whether to render the button.

### 3. :8770 frontend (`web/src/pika-view.ts`, `styles.css`)

- A **重标定** button in the Pika panel header, rendered only when the manifest
  says `pika_recalibrate: true`.
- Click → `confirm()` with the text above → POST. While the request runs, the
  button is disabled and a status line under the cards shows the step. The steps
  are not streamed: the line shows 停止中 → 清除标定 → 启动中 on a timer (stop up
  to about 15 s) and replaces it with the real result when the POST returns.
- After a successful POST, a 60 s watch starts on the snapshot `state` of each
  side and ends with 已重新定位 or the re-plug message. The backup path from the
  result is shown in small text.
- Errors (409/502/timeout) are shown verbatim in the status line, and the button
  is enabled again.

## Configuration

- Repo `config/ros/recording.yaml`: `pika_helper_url: ""`, so the feature is off by
  default and a host without a helper shows no button.
- SJD host config: `pika_helper_url: http://127.0.0.1:8783` (the existing
  `realman-pika-tunnel` user unit forwards it to enine).

## Error handling summary

| Case | Result |
| --- | --- |
| Recorder busy / Pika command active | 409 before any helper call; nothing changes |
| Helper unreachable | 502 "Pika helper is not reachable"; nothing changes |
| Helper busy | 409 from the helper, passed through |
| Stop leaves processes | helper exit 1; calibration NOT renamed; stack NOT started |
| Calibration file missing | still restarts; `backup: null`, note in output |
| Rename fails | exit 1; stack left stopped (the operator can use the :8765 switch or press again) |
| Start fails | exit 1 with output tail; calibration already moved (backup path in result) |
| Not localized in 60 s | page shows the re-plug message with the sides that are not live |

## Testing

- `tests/test_pika_process_helper.py`:
  - normal order stop → rename → start (fake runner, fake scan, tmp dir);
  - backup naming and the collision suffix;
  - missing file → still starts, `backup` null;
  - stack still running after stop → no rename, no start, exit 1;
  - rename OSError → no start;
  - busy → 409;
  - key absent → 404;
  - config validation (relative path, non-.json).
- `realman_recording` tests:
  - client mapping (ok / HTTP error / unreachable);
  - bridge guard: recording state and command_active → 409, helper not called;
  - server routes: POST forwards and runs off the loop, GET status, manifest flag
    off when the URL is empty;
  - parameter validation (non-loopback URL rejected).
- Frontend: `npm run build` of the recording web bundle; a manual check on SJD
  after deploy.

## Documentation

`website/docs/development/pika-teleop.md` gets a section "基站重标定（:8770）": when
to use it (poses missing while the Pika is visible, `pika_localization_status_*`
false), what the button does, the 60 s re-plug fallback, where the backups go, and
how to restore a backup by hand.

## Deployment

1. enine: back up `~/realman_pika_helper/`, copy the new `pika_process_helper.py`,
   add `libsurvive_config` to `pika_helper.json`, then
   `systemctl --user restart realman-pika-helper`. Rollback: restore the backup
   and restart the unit.
2. SJD: build an image from the merged branch, set `pika_helper_url` in the host
   `recording.yaml`, and recreate only `realman_recording`. Rollback: the image tag
   and config backup, same as earlier recording deploys.
3. Live check: press the button with both Pikas visible. Expect both sides live
   again and a new `config.json` on enine with a low solve error.
