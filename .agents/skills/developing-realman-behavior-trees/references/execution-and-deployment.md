# Execution, Shutdown, and Production Diagnosis

## Entry Points

Run commands from the repository root.

| Need | Command and contract |
| --- | --- |
| Start long-lived drivers/Web | `./rm65 up`; never starts a BT executor. |
| Single arm | `./rm65 bt l`, `m`, or `r`; selects `move.xml` and overrides its arm. |
| Three-arm staged MoveJ | `./rm65 bt three`; selects `three.xml`. |
| Persistent input router | `./rm65 bt control`; selects `control.xml` and stays alive until interrupted. |
| Any root BT XML | `./rm65 bt <simple-name>` or `<simple-name>.xml`; resolves only inside `config/behavior-trees/`. |
| Timed tool-frame demo | `./rm65 bt tool_x`; selects `tool_x.xml`. |
| Preview wrapper commands | `RM65_DRY_RUN=1 ./rm65 bt <name>`; runs no container command. |
| Execute BT dry-run | `REALMAN_BT_DRY_RUN=true ./rm65 bt <name>`; validates but sends no motion goal/command. |
| Authorized real motion | `REALMAN_BT_DRY_RUN=false ./rm65 bt <name>`. |
| Keep a one-shot executor alive | `BT_EXIT_ON_TERMINAL=false ./rm65 bt <name>`. |

The selector must be a simple XML filename; paths are rejected. Legacy aliases `arm_move`, `three_arm_staged_move`, and `control_router` map to the current `move.xml`, `three.xml`, and `control.xml` names.

## Startup Flow

`scripts/bt.sh` resolves the tree and enters the already-running `realman_bringup_remote` container. `docker/bt_container_entrypoint.sh` then:

1. parses allowlisted startup metadata from the XML root;
2. acquires `/tmp/realman-bt.lock` so only one wrapped executor/router runs in that container;
3. copies the selected XML into `/tmp/realman-bt-workspace`;
4. starts the read-only monitor;
5. waits for every declared arm/action pair to expose at least one Action Server;
6. launches `arm_move.launch.py` or `control_router.launch.py`;
7. archives the XML and final `runtime.json` under `logs/behavior-trees/<run-id>/`.

Even dry-run execution performs Action-server readiness preflight. Wrapper preview with `RM65_DRY_RUN=1` does not. Preflight checks presence, not uniqueness; real motion requires confirming exactly one server for each targeted Action.

## Lifecycle

One-shot trees use `stop_on_terminal=true` and `exit_on_terminal=true`. On the unique terminal tick, the executor records the result, stops ticking, halts the tree, and drives cancellation drains from a separate timer. Exit occurs only after drains are empty. The wrapper treats a valid archive as exactly one `SUCCESS` or `FAILURE` terminal tick.

Persistent `control.xml` sets both flags false. It publishes the input-mode catalog/state and runs until Ctrl-C or failure. Interrupt handling first calls `/realman_bt_executor/stop`, waits up to the wrapper's bounded drain period, then terminates only that launch/executor and monitor; drivers continue.

Drain completion means a pending response was rejected or cancellation submission succeeded for an accepted goal. It does not mean the server acknowledged cancellation or the robot physically stopped.

Halt may reset root/node status to `IDLE` and clear leaf failure text. Determine archived outcome from `tick_stats.success`/`failure` and events, not final `root_status` alone:

```bash
python3 docker/bt_runtime_result.py logs/behavior-trees/<run-id>/runtime.json
```

Launcher exit codes include `1` for failed/missing/invalid terminal outcome, `73` for lock contention, and `74` for archival failure after otherwise successful execution.

## Input Router Inspection

While `./rm65 bt control` is running, inspect:

```bash
ros2 service call /realman_bt_executor/list_input_modes realman_msgs/srv/ListInputModes '{}'
ros2 topic echo /realman_bt_executor/input_mode_state realman_msgs/msg/InputModeState
```

If the Web selector is empty, first verify the control tree is running in the same `ROS_DOMAIN_ID`, then inspect the service and transient-local state topic. Do not add a browser-side static mode list.

## Repeated-Run FAILURE or UNKNOWN

Do not diagnose from the phrase "the second run failed." Collect the archived snapshot, exact Action result detail, ROS logs, process list, and DDS graph in the runtime's actual domain.

Inside the driver container:

```bash
docker compose exec -T realman_bringup_remote bash -lc '
  source /opt/ros/humble/setup.bash
  source /opt/rm65_ws/install/setup.bash
  printenv ROS_DOMAIN_ID
  for arm in l m r; do
    ros2 action info /$arm/execute_motion
    ros2 action info /$arm/cartesian_velocity
    timeout 5 ros2 topic echo --once /$arm/connected std_msgs/msg/Bool
  done
  ros2 node list
'
```

Each targeted Action must have exactly one server. Duplicate same-named servers can split goal/result services across drivers and produce `UNKNOWN`, but `UNKNOWN` alone does not prove duplication. If server counts are one, investigate result-listener setup, driver restart/result retention, timeouts, goal IDs, cancellation ownership, and connection feedback. Never convert `UNKNOWN` to success or discard the client to hide it.

The container lock cannot exclude another host or independently launched process in the same ROS domain.

## ROS Domain Changes

The root `.env` supplies `ROS_DOMAIN_ID`. Driver, Web, host camera, Pika/router, and remote clients that communicate must agree; independent robot stacks should use different domains.

After an authorized change, run `./rm65 down`, update `.env`, clear any stale exported override, then run `./rm65 up`. `docker compose restart` alone does not reload changed environment. Compare `docker compose config` with `printenv ROS_DOMAIN_ID` inside the relevant containers without printing unrelated secrets. Restart the ROS CLI daemon when cached discovery disagrees with current graph evidence.

## Validation Commands

Choose the focused subset first, then broaden:

```bash
python3 -m pytest -q \
  src/behavior/realman_bt/test/test_tree_contract.py \
  src/behavior/realman_bt/test/test_control_router_tree.py \
  src/behavior/realman_bt/test/test_tree_startup_metadata.py \
  src/behavior/realman_bt/test/test_pika_config.py \
  src/behavior/realman_bt/test/test_pika_control_router.py

./rm65 bt-test all
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
python3 -m unittest discover -s tests -p 'test_bt_runtime_result.py'
```

For C++/ROS changes, build and test `realman_msgs` and `realman_bt` in the ROS 2 Humble environment. Use the isolated mock graph for integration. Hardware motion is a separate, explicitly authorized validation step.
