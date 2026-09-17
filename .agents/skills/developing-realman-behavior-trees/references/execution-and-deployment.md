# Execution, Shutdown, and Production Diagnosis

## Entry Points and Configuration

Run commands from the repository root. Inspect `scripts/bt.sh`, `docker/bt_container_entrypoint.sh`, `docker/bt_runtime_result.py`, and `src/behavior/realman_bt/launch/arm_move.launch.py` when changing launch behavior.

| Need | Entry point / contract |
| --- | --- |
| Existing production drivers | `./rm65 up`; does not execute a behavior tree. |
| Single arm | `./rm65 bt r` (`l` and `m` also supported); `config/behavior-trees/arm_move.xml`. |
| Three arms, zero then target pose | `./rm65 bt three`; `config/behavior-trees/three_arm_staged_move.xml`. |
| Preview shell commands only | `RM65_DRY_RUN=1 ./rm65 bt three`; no container or ROS execution. |
| Actual dry-run | `REALMAN_BT_DRY_RUN=true ./rm65 bt three`; validates via executor, sends no goals. |
| Authorized real motion | `REALMAN_BT_DRY_RUN=false ./rm65 bt three`; uses the configured XML goals. |
| Keep executor and monitor alive | `BT_EXIT_ON_TERMINAL=false ./rm65 bt three`. |
| Persistent input router | `./rm65 bt control`; requires the existing driver container, uses `control_router.launch.py`, and stays up until Ctrl-C. |

The CLI selectors are `l`, `m`, `r`, and `three` for one-shot motion trees,
plus `control` for the persistent input router; each overwrites `BT_TREE_FILE`.
For another XML, use the existing ROS launch's `tree_file:=<absolute-path>`
argument or invoke the container entrypoint with an explicit `BT_TREE_FILE` and
`BT_REQUIRED_ARMS`. Do not claim `./rm65 bt path.xml` works. A direct ROS
launch does not provide the container lock, monitor, or archival wrapper.

For example, this explicitly selects the existing three-arm XML through the wrapper; replace only the tree path with another mounted XML when needed. `BT_REQUIRED_ARMS` is a comma-separated subset of `l,m,r`:

```bash
docker compose exec -T \
  -e BT_AUTOSTART=true -e REALMAN_BT_DRY_RUN=true \
  -e BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/three_arm_staged_move.xml \
  -e BT_REQUIRED_ARMS=l,m,r \
  realman_bringup_remote /usr/local/bin/bt-start
```

The CLI requires the driver container to be running. Its entrypoint starts the monitor, then waits for at least one server on each required Action, even in dry-run. It does **not** check server uniqueness; production preflight must check that separately. Default readiness timeout is 30 seconds per arm; this is separate from the XML motion timeout.

`./rm65 up` starts the long-lived driver/Web runtime only; it never starts the
router. Start `./rm65 bt control` explicitly after `up`. Unlike `l`, `m`, `r`,
and `three`, `control` forces `stop_on_terminal=false` and
`exit_on_terminal=false`, so its executor and :8080 read-only monitor remain
available until Ctrl-C. Ctrl-C stops only these behavior-tree processes; the
driver container continues. Use `./rm65 down` to stop the production runtime.

While control is running, inspect the executor-owned discovery interfaces:
`/realman_bt_executor/list_input_modes`,
`/realman_bt_executor/select_input_mode`, and transient-local reliable
`/realman_bt_executor/input_mode_state`. If the browser shows no selectable
modes, first confirm the control router is running in the same `ROS_DOMAIN_ID`,
then inspect the list service and state topic; do not add a static Web list.

The staged tree's joint targets are degrees:

| Stage | L | M | R |
| --- | --- | --- | --- |
| `all_zero` | `0,0,0,0,0,0` | `0,0,0,0,0,0` | `0,0,0,0,0,0` |
| `requested_pose` | `24,20,66,24,84,14.5` | `0,18,70,0,90,9` | `15,22,65,23,82,-7.5` |

Both stages use 10% velocity, 0% blend, and 120 seconds timeout. Concurrent submission does not guarantee equal physical arrival times. Targets and speeds remain operator-specific motion decisions; a dry-run does not establish collision safety or real motion success.

## One-Shot Lifecycle

1. The wrapper acquires `/tmp/realman-bt.lock` before replacing its temporary workspace. A concurrent invocation returns `73`; it does not delete the active run's files.
2. On `SUCCESS`/`FAILURE`, the executor records the terminal tick, stops ticking, halts the tree, and drains pending cancellations using a separate 50 ms timer.
3. Drain completion means pending response rejection or successful submission of cancellation for an accepted goal. It does not mean cancellation acknowledgement or physical stop. An unanswered goal response or repeated cancel submission exceptions can keep the executor alive.
4. When the drain is empty and `exit_on_terminal=true`, the executor flushes its snapshot and shuts down its ROS context. `ros2 launch` exits, and the wrapper stops the monitor and archives XML plus `runtime.json` under `logs/behavior-trees/<YYYYMMDD_HHMMSS_PID>/`.
5. The wrapper removes its temporary workspace and releases the lock. Drivers and SDK connections continue running, so the next tree can reuse the Action Servers.

Executor exit code is `0` for success and `1` for failure. Because `ros2 launch` may return zero after a child failure, the wrapper also validates the archived-to-be snapshot: one-shot mode requires exactly one terminal tick (`success + failure == 1`). The CLI returns `1` for a failed/missing/invalid terminal result, `73` for lock contention, and `74` if archival fails after an otherwise successful run. Existing nonzero failures take precedence over archive errors.

Halt resets node/root status to `IDLE` and may clear node failure reasons. Read `tick_stats.success`/`failure` together with `events`, not just final `root_status`. From the repository root, inspect one completed one-shot run with:

```bash
python3 docker/bt_runtime_result.py logs/behavior-trees/<run-id>/runtime.json
```

This prints `SUCCESS` or `FAILURE`; the helper exits zero for either valid result, unlike the launcher. It rejects persistent-mode histories with multiple terminal ticks.

For persistent service control, directly launch with `exit_on_terminal:=false autostart:=false` and use `/realman_bt_executor/start` and `/stop` (`std_srvs/srv/Trigger`). `/stop` halts the tree but does not itself mark a terminal result or request process exit. `exit_on_terminal=true` overrides `stop_on_terminal=false` on a terminal tick. Ctrl-C/process destruction initiates cleanup but does not guarantee the same drained path as normal terminal exit. SDK disconnect belongs to the driver shutdown, not a BT leaf destructor.

## Repeated-Run FAILURE / UNKNOWN

Do not infer the cause from “I ran the same tree twice.” Collect the final snapshot, Action result details, ROS logs, active processes, and DDS graph in the runtime's actual domain. In the running driver container:

```bash
docker compose exec -T realman_bringup_remote bash -lc '
  source /opt/ros/humble/setup.bash
  source /opt/rm65_ws/install/setup.bash
  printenv ROS_DOMAIN_ID
  for arm in l m r; do
    ros2 action info /$arm/execute_motion
    timeout 5 ros2 topic echo --once /$arm/connected std_msgs/msg/Bool
  done
  ros2 node list
'
```

Each targeted Action must have exactly one server, and connection feedback should be true. More than one same-named server can route goal/result service requests to different drivers, producing `UNKNOWN` while one driver later reports `SUCCEEDED`. Compare goal IDs and driver logs where available. Preserve UNKNOWN as failure; changing it to success or simply releasing the leaf client would hide the underlying issue. UNKNOWN alone does not prove duplicate servers: if counts are one, continue investigating result-listener errors, driver restarts/result retention, timeouts, and pending ownership using recorded evidence.

The container-local lock only excludes competing wrapper runs in that container. It cannot exclude another host's driver in the same domain or a separately launched executor. Distinguish a `73` launch rejection from a motion Action failure.

## ROS Domain Changes

Store `ROS_DOMAIN_ID` in the repository-root `.env` (Compose/helper discovery exception to root `config/`). Use an unused, platform-valid domain; `65` is an example, not a fleet-wide mandated value. Driver, Web control, host cameras, and remote viewers that communicate together must agree; independent robot stacks should use different domains.

After an authorized domain change, stop the old runtime with `./rm65 down`, update `.env`, and restart with `./rm65 up`. An existing exported `ROS_DOMAIN_ID` can override `.env`; clear a stale export with `unset ROS_DOMAIN_ID`, and re-source `functions.zsh` in Zsh sessions using its helpers. `docker compose restart` alone does not apply changed container environment.

Verify the key in `.env` without printing unrelated secrets, then compare `docker compose config` to `printenv ROS_DOMAIN_ID` inside both `realman_bringup_remote` and `realman_web_control`. Resolve actual containers using `docker compose ps -q <service>`, rather than assuming the service is the container name. Verify host camera process environment and the remote viewer domain as applicable. A DDS CLI daemon may cache discovery; `ros2 daemon stop` followed by `ros2 daemon start` in the intended domain refreshes it when observations disagree. Recheck server counts, feedback, and a dry-run; claim real-motion success only after an authorized real-motion run.

## Validation Commands

For these existing interfaces, run the relevant checks, not a hardware trial:

```bash
./rm65 bt-test all
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
python3 -m unittest discover -s tests -p test_bt_runtime_result.py
```

For C++/ROS changes, build and test `realman_bt` in the Humble test environment. `tests/test_bt_entrypoint_runtime.sh` exercises success/failure propagation, archive failure, and lock contention in a test container with `bt-start` and monitor assets installed; run it only in that isolated environment. Keep mock `/realman/mock/*` separate from real arm interfaces.
