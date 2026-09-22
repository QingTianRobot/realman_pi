# Task 8 Report: Launch, Container Service, and `./rm65 up policy`

## Commit

- Pending: `feat: add policy_bridge launch, container service, and rm65 up policy`

## Files Changed

- `src/policy_bridge/launch/policy_bridge.launch.py`
  - Declares `config_file` (default `<config_root>/ros/policy_bridge.yaml`) and
    `active_side` (choices left/right). Sets `RCUTILS_COLORIZED_OUTPUT=1` and a
    timestamped `ROS_LOG_DIR` per the logging convention. Launches the
    `policy_bridge_node` executable with both parameters.
- `config/docker/compose.yaml`
  - New `policy_bridge` service peer to `realman_web_control` (shares the
    `realman-common` anchor: host networking, `ROS_DOMAIN_ID`, read-only config +
    logs mounts). Added `POLICY_WS_HOST` to the shared environment so the config
    `${POLICY_WS_HOST}` expansion resolves inside the container.
- `rm65`
  - New `up policy` profile: production graph **plus** the `policy_bridge`
    container. Added `policy_bridge` to `down`/`status`/`logs` service lists and
    updated usage text.
- `src/policy_bridge/setup.py` already installs `launch/*.launch.py`.

## Test Evidence

```text
bash -n rm65                                             # OK
python3 -m py_compile src/policy_bridge/launch/...       # OK
docker compose -f docker-compose.yml config --services   # lists policy_bridge
RM65_DRY_RUN=1 ./rm65 up policy                          # up -d ... policy_bridge
colcon build --packages-select realman_msgs policy_bridge # both finished
ros2 pkg executables policy_bridge                       # policy_bridge policy_bridge_node
ros2 launch policy_bridge policy_bridge.launch.py --show-args  # config_file, active_side
```

## Concerns

- `colcon build --packages-select policy_bridge` requires `realman_msgs` to be
  built first (declared dependency); built it explicitly in this workspace.
- The bridge container is idle until the router selects policy mode (R1 gate) and
  `/policy/activate` is called; no real motion path is enabled by this task.
