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

rm65_docker_bringup_remote() {
  emulate -L zsh
  _rm65_compose run --rm realman_bringup_remote
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
  print -r -- "  rm65_docker_bringup_remote         Run the headless remote-debug target"
  print -r -- "ROS:"
  print -r -- "  rm65_ros_build [args ...]           Build bringup and robot driver with Humble"
  print -r -- "Website:"
  print -r -- "  rm65_web_build                     Build the VitePress website"
  print -r -- "  rm65_web_test                      Run the website Playwright tests"
  print -r -- "Deployment:"
  print -r -- "  rm65_deploy_update                 Fast-forward main on the production host"
  print -r -- ""
  print -r -- "Runtime variables: RM65_MODEL, RM65_USE_GUI, RM65_USE_RVIZ,"
  print -r -- "REALMAN_JOY_DEVICE, ROS_DOMAIN_ID, REALMAN_PRODUCTION_HOST,"
  print -r -- "REALMAN_PRODUCTION_DIR. Run the underlying commands directly for"
  print -r -- "options not covered by these helpers."
}
