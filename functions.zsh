# Source this file from any directory to load realman_pi development helpers:
#   source /path/to/realman_pi/functions.zsh

typeset -g RM65_PROJECT_ROOT="${${(%):-%N}:A:h}"

_rm65_require_command() {
  emulate -L zsh
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    print -u2 -r -- "rm65: required command not found: ${command_name}"
    return 127
  fi
}

_rm65_compose() {
  emulate -L zsh
  _rm65_require_command docker || return

  if ! command docker compose version >/dev/null 2>&1; then
    print -u2 -r -- "rm65: Docker Compose v2 is required"
    return 127
  fi

  (cd -- "$RM65_PROJECT_ROOT" && command docker compose "$@")
}

rm65_project_cd() {
  cd -- "$RM65_PROJECT_ROOT"
}

rm65_docker_build() {
  emulate -L zsh
  local -a services

  if (( $# == 0 )); then
    services=(realman_bringup)
  else
    services=("$@")
  fi

  _rm65_compose build "${services[@]}"
}

rm65_docker_rviz() {
  emulate -L zsh
  local model="${1:-${RM65_MODEL:-RM65-B}}"

  if (( $# > 1 )); then
    print -u2 -r -- "usage: rm65_docker_rviz [model]"
    return 2
  fi

  (export RM65_MODEL="$model"; _rm65_compose run --rm rm65_rviz)
}

rm65_docker_three_rviz() {
  emulate -L zsh
  _rm65_compose run --rm rm65_three_rviz
}

rm65_docker_xbox_test() {
  emulate -L zsh
  _rm65_compose run --rm xbox_controller_test
}

rm65_docker_driver_test() {
  emulate -L zsh
  _rm65_compose run --rm realman_driver_test
}

rm65_docker_driver_rviz() {
  emulate -L zsh
  _rm65_compose run --rm realman_driver_rviz
}

rm65_docker_bringup() {
  emulate -L zsh
  _rm65_compose run --rm realman_bringup
}

rm65_docker_bringup_custom() {
  emulate -L zsh
  _rm65_compose run --rm realman_bringup_custom
}

rm65_docker_bringup_custom_start() {
  emulate -L zsh
  _rm65_compose up -d realman_bringup_custom
  _rm65_compose ps realman_bringup_custom
}

rm65_docker_bringup_custom_stop() {
  emulate -L zsh
  _rm65_compose stop realman_bringup_custom
}

rm65_docker_bringup_custom_status() {
  emulate -L zsh
  _rm65_compose ps realman_bringup_custom
}

rm65_docker_bringup_custom_logs() {
  emulate -L zsh
  _rm65_compose logs --tail=100 "$@" realman_bringup_custom
}

rm65_docker_bringup_custom_args() {
  emulate -L zsh
  if (( $# == 0 )); then
    print -u2 -r -- "usage: rm65_docker_bringup_custom_args launch_arg:=value ..."
    print -u2 -r -- "example: rm65_docker_bringup_custom_args start_driver:=false use_rviz:=true"
    return 2
  fi

  # Override the stable graphical service command while retaining its device,
  # config, log, and X11 mounts. Arguments are passed directly to system.launch.py.
  _rm65_compose run --rm realman_bringup \
    ros2 launch realman_bringup system.launch.py "$@"
}

_rm65_docker_bringup_profile() {
  emulate -L zsh
  local profile="$1"

  case "$profile" in
    model)
      (
        export REALMAN_START_ROBOTS=true
        export REALMAN_START_DRIVER=false
        export REALMAN_START_JOY_DRIVER=false
        export REALMAN_START_CONTROLLER=false
        export REALMAN_USE_GUI=false
        export REALMAN_USE_RVIZ=true
        export REALMAN_START_WEB_CONTROL=false
        export REALMAN_WAIT_FOR_JOY_DEVICE=false
        _rm65_compose run --rm realman_bringup_custom
      )
      ;;
    hardware)
      (
        export REALMAN_START_ROBOTS=true
        export REALMAN_START_DRIVER=true
        export REALMAN_START_JOY_DRIVER=false
        export REALMAN_START_CONTROLLER=false
        export REALMAN_USE_GUI=false
        export REALMAN_USE_RVIZ=true
        export REALMAN_START_WEB_CONTROL=false
        export REALMAN_WAIT_FOR_JOY_DEVICE=false
        _rm65_compose run --rm realman_bringup_custom
      )
      ;;
    headless)
      (
        export REALMAN_START_ROBOTS=true
        export REALMAN_START_DRIVER=true
        export REALMAN_START_JOY_DRIVER=false
        export REALMAN_START_CONTROLLER=true
        export REALMAN_USE_GUI=false
        export REALMAN_USE_RVIZ=false
        export REALMAN_START_WEB_CONTROL=false
        export REALMAN_WAIT_FOR_JOY_DEVICE=false
        _rm65_compose run --rm realman_bringup_custom
      )
      ;;
    input)
      (
        export REALMAN_START_ROBOTS=false
        export REALMAN_START_DRIVER=false
        export REALMAN_START_JOY_DRIVER=true
        export REALMAN_START_CONTROLLER=true
        export REALMAN_USE_GUI=false
        export REALMAN_USE_RVIZ=false
        export REALMAN_START_WEB_CONTROL=false
        export REALMAN_WAIT_FOR_JOY_DEVICE=true
        _rm65_compose run --rm realman_bringup_custom
      )
      ;;
    web)
      (
        export REALMAN_START_ROBOTS=true
        export REALMAN_START_DRIVER=true
        export REALMAN_START_JOY_DRIVER=false
        export REALMAN_START_CONTROLLER=false
        export REALMAN_USE_GUI=false
        export REALMAN_USE_RVIZ=false
        export REALMAN_START_WEB_CONTROL=true
        export REALMAN_WAIT_FOR_JOY_DEVICE=false
        _rm65_compose run --rm realman_bringup_custom
      )
      ;;
    *)
      print -u2 -r -- "rm65: unknown bringup profile: ${profile}"
      print -u2 -r -- "rm65: choose model, hardware, headless, input, or web"
      return 2
      ;;
  esac
}

rm65_docker_bringup_model() {
  emulate -L zsh
  _rm65_docker_bringup_profile model
}

rm65_docker_bringup_hardware() {
  emulate -L zsh
  _rm65_docker_bringup_profile hardware
}

rm65_docker_bringup_headless() {
  emulate -L zsh
  _rm65_docker_bringup_profile headless
}

rm65_docker_bringup_input() {
  emulate -L zsh
  _rm65_docker_bringup_profile input
}

rm65_docker_bringup_web() {
  emulate -L zsh
  _rm65_docker_bringup_profile web
}

rm65_docker_bringup_remote() {
  emulate -L zsh
  _rm65_compose run --rm realman_bringup_remote
}

rm65_docker_web_control() {
  emulate -L zsh
  _rm65_compose run --rm realman_web_control
}

rm65_docker_web_control_start() {
  emulate -L zsh
  _rm65_compose up -d realman_web_control
  _rm65_compose ps realman_web_control
}

rm65_docker_web_control_stop() {
  emulate -L zsh
  _rm65_compose stop realman_web_control
}

rm65_docker_web_control_status() {
  emulate -L zsh
  _rm65_compose ps realman_web_control
}

rm65_docker_web_control_logs() {
  emulate -L zsh
  _rm65_compose logs --tail=100 "$@" realman_web_control
}

rm65_web_control_url() {
  emulate -L zsh
  local host="${1:-${REALMAN_WEB_CONTROL_HOST:-127.0.0.1}}"
  local port="${REALMAN_WEB_CONTROL_PORT:-8765}"
  if [[ "$host" == -* || "$host" == *$'\n'* || "$port" != <-> ]]; then
    print -u2 -r -- "rm65: invalid Web control host or port"
    return 2
  fi
  print -r -- "http://${host}:${port}/"
}

_rm65_prepare_remote_rviz_env() {
  emulate -L zsh
  local domain_id="${1:-${ROS_DOMAIN_ID:-166}}"
  local runtime_dir="${XDG_RUNTIME_DIR:-/run/user/$EUID}"
  local -a xauthority_candidates

  if [[ "$domain_id" != <-> ]] || (( domain_id < 0 || domain_id > 232 )); then
    print -u2 -r -- "rm65: ROS domain must be an integer from 0 through 232: ${domain_id}"
    return 2
  fi

  export ROS_DOMAIN_ID="$domain_id"
  export ROS_LOCALHOST_ONLY=0
  export DISPLAY="${DISPLAY:-:0}"

  if [[ -z "${XAUTHORITY:-}" || ! -r "$XAUTHORITY" ]]; then
    xauthority_candidates=("$runtime_dir"/.mutter-Xwaylandauth.*(N.om))
    if (( ${#xauthority_candidates} > 0 )); then
      export XAUTHORITY="${xauthority_candidates[1]}"
    elif [[ -r "$HOME/.Xauthority" ]]; then
      export XAUTHORITY="$HOME/.Xauthority"
    else
      print -u2 -r -- "rm65: no readable Xauthority file for display ${DISPLAY}"
      print -u2 -r -- "rm65: run this command from the active desktop session or export XAUTHORITY"
      return 1
    fi
  fi

  print -r -- "rm65: local RViz uses ROS_DOMAIN_ID=${ROS_DOMAIN_ID}, DISPLAY=${DISPLAY}"
}

rm65_docker_remote_rviz() {
  emulate -L zsh
  if (( $# > 1 )); then
    print -u2 -r -- "usage: rm65_docker_remote_rviz [domain_id]"
    return 2
  fi

  (
    _rm65_prepare_remote_rviz_env "${1:-}" || return
    print -r -- "rm65: RViz is running in the foreground; close it or press Ctrl-C to stop"
    _rm65_compose run --rm realman_remote_rviz
  )
}

rm65_docker_remote_rviz_start() {
  emulate -L zsh
  if (( $# > 1 )); then
    print -u2 -r -- "usage: rm65_docker_remote_rviz_start [domain_id]"
    return 2
  fi

  (
    _rm65_prepare_remote_rviz_env "${1:-}" || return
    _rm65_compose up -d realman_remote_rviz || return
    _rm65_compose ps realman_remote_rviz
  )
}

rm65_docker_remote_rviz_stop() {
  emulate -L zsh
  _rm65_compose stop realman_remote_rviz
}

rm65_docker_remote_rviz_status() {
  emulate -L zsh
  _rm65_compose ps realman_remote_rviz
}

rm65_docker_remote_rviz_logs() {
  emulate -L zsh
  _rm65_compose logs --tail=100 "$@" realman_remote_rviz
}

rm65_ros_build() {
  emulate -L zsh
  local humble_setup

  for humble_setup in /opt/ros/humble/setup.zsh /opt/ros/humble/setup.bash /opt/ros/humble/setup.sh; do
    [[ -r "$humble_setup" ]] && break
  done

  if [[ ! -r "$humble_setup" ]]; then
    print -u2 -r -- "rm65: ROS 2 Humble setup not found under /opt/ros/humble"
    return 1
  fi

  (
    cd -- "$RM65_PROJECT_ROOT" || return
    source "$humble_setup"
    _rm65_require_command colcon || return
    command colcon build --symlink-install \
      --packages-up-to realman_bringup realman_robot_driver "$@"
  )
}

rm65_web_build() {
  emulate -L zsh
  _rm65_require_command npm || return
  (cd -- "$RM65_PROJECT_ROOT/website" && command npm run build)
}

rm65_web_test() {
  emulate -L zsh
  _rm65_require_command npm || return
  (cd -- "$RM65_PROJECT_ROOT/website" && command npm run test:e2e)
}

rm65_deploy_update() {
  emulate -L zsh
  local host="${REALMAN_PRODUCTION_HOST:-realman_local}"
  local remote_dir="${REALMAN_PRODUCTION_DIR:-/home/administrator/realman_pi}"
  local quoted_remote_dir

  if [[ "$host" == -* || "$host" == *$'\n'* || "$remote_dir" == *$'\n'* ]]; then
    print -u2 -r -- "rm65: invalid production host or directory"
    return 2
  fi

  _rm65_require_command ssh || return
  quoted_remote_dir="${(q)remote_dir}"

  command ssh "$host" \
    "cd -- ${quoted_remote_dir} && git fetch origin main && git merge --ff-only origin/main && git status --short --branch && git log -1 --oneline"
}

rm65_project_help() {
  print -r -- "realman_pi Zsh functions"
  print -r -- ""
  print -r -- "Project:"
  print -r -- "  rm65_project_cd                    Change to the repository root"
  print -r -- "  rm65_project_help                 Show this grouped command list"
  print -r -- "Docker:"
  print -r -- "  rm65_docker_build [service ...]    Build Compose services"
  print -r -- "  rm65_docker_rviz [model]           Run the single-arm RViz viewer"
  print -r -- "  rm65_docker_three_rviz             Run the configured three-arm RViz scene"
  print -r -- "  rm65_docker_xbox_test              Test only the physical Xbox input chain"
  print -r -- "  rm65_docker_driver_test            Test only the three mock robot drivers"
  print -r -- "  rm65_docker_driver_rviz            Visualize real joint states in RViz 2"
  print -r -- "  rm65_docker_bringup                Run robots, RViz, Joy, and Xbox input"
  print -r -- "  rm65_docker_bringup_custom         Run the .env-configured bringup profile"
  print -r -- "  rm65_docker_bringup_custom_start   Start the .env-configured profile"
  print -r -- "  rm65_docker_bringup_custom_stop    Stop the configurable profile"
  print -r -- "  rm65_docker_bringup_custom_status  Show configurable profile status"
  print -r -- "  rm65_docker_bringup_custom_logs [-f]  Show configurable profile logs"
  print -r -- "  rm65_docker_bringup_custom_args ... Pass launch args directly"
  print -r -- "  rm65_docker_bringup_model           Show only the configured robot model"
  print -r -- "  rm65_docker_bringup_hardware        Real drivers plus RViz, no input"
  print -r -- "  rm65_docker_bringup_headless        Real drivers and controller, no GUI"
  print -r -- "  rm65_docker_bringup_input           Test only Joy and Xbox input"
  print -r -- "  rm65_docker_bringup_web             Real drivers plus Web control"
  print -r -- "  rm65_docker_bringup_remote         Run the headless remote-debug target"
  print -r -- "  rm65_docker_web_control             Run the browser action console"
  print -r -- "  rm65_docker_web_control_start       Start the browser action console"
  print -r -- "  rm65_docker_web_control_stop        Stop the browser action console"
  print -r -- "  rm65_docker_web_control_status      Show browser action console status"
  print -r -- "  rm65_docker_web_control_logs [-f]   Show or follow browser console logs"
  print -r -- "  rm65_docker_remote_rviz [domain]   Run remote RViz in the foreground"
  print -r -- "  rm65_docker_remote_rviz_start [domain]  Start remote RViz in the background"
  print -r -- "  rm65_docker_remote_rviz_stop       Stop the background remote RViz"
  print -r -- "  rm65_docker_remote_rviz_status     Show the background remote RViz status"
  print -r -- "  rm65_docker_remote_rviz_logs [-f]  Show or follow remote RViz logs"
  print -r -- "ROS:"
  print -r -- "  rm65_ros_build [args ...]           Build bringup and robot driver with Humble"
  print -r -- "Website:"
  print -r -- "  rm65_web_build                     Build the VitePress website"
  print -r -- "  rm65_web_test                      Run the website Playwright tests"
  print -r -- "  rm65_web_control_url [host]         Print the browser action console URL"
  print -r -- "Deployment:"
  print -r -- "  rm65_deploy_update                 Fast-forward main on the production host"
  print -r -- ""
  print -r -- "Runtime variables: RM65_MODEL, RM65_USE_GUI, RM65_USE_RVIZ,"
  print -r -- "REALMAN_START_ROBOTS, REALMAN_START_DRIVER, REALMAN_START_JOY_DRIVER,"
  print -r -- "REALMAN_START_CONTROLLER, REALMAN_USE_GUI, REALMAN_USE_RVIZ,"
  print -r -- "REALMAN_START_WEB_CONTROL, REALMAN_WAIT_FOR_JOY_DEVICE, REALMAN_JOY_POLL_INTERVAL,"
  print -r -- "REALMAN_JOY_DEVICE, REALMAN_*_CONFIG_FILE, REALMAN_WEB_CONTROL_TOKEN,"
  print -r -- "ROS_DOMAIN_ID, DISPLAY, XAUTHORITY,"
  print -r -- "REALMAN_PRODUCTION_HOST,"
  print -r -- "REALMAN_PRODUCTION_DIR. Run the underlying commands directly for"
  print -r -- "options not covered by these helpers."
  print -r -- "Build mirror variables: ROS_BASE_IMAGE, UBUNTU_APT_MIRROR,"
  print -r -- "UBUNTU_PORTS_APT_MIRROR, ROS2_APT_MIRROR, PYPI_INDEX_URL."
}
