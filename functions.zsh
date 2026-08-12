# Source this file from any directory to load realman_pi development helpers:
#   source /path/to/realman_pi/functions.zsh

typeset -g REALMAN_PROJECT_ROOT="${${(%):-%N}:A:h}"

_realman_require_command() {
  emulate -L zsh
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    print -u2 -r -- "realman_pi: required command not found: ${command_name}"
    return 127
  fi
}

_realman_compose() {
  emulate -L zsh
  _realman_require_command docker || return

  if ! command docker compose version >/dev/null 2>&1; then
    print -u2 -r -- "realman_pi: Docker Compose v2 is required"
    return 127
  fi

  (cd -- "$REALMAN_PROJECT_ROOT" && command docker compose "$@")
}

realman_cd() {
  cd -- "$REALMAN_PROJECT_ROOT"
}

realman_build() {
  emulate -L zsh
  local -a services

  if (( $# == 0 )); then
    services=(realman_bringup)
  else
    services=("$@")
  fi

  _realman_compose build "${services[@]}"
}

realman_rviz() {
  emulate -L zsh
  local model="${1:-${RM65_MODEL:-RM65-B}}"

  if (( $# > 1 )); then
    print -u2 -r -- "usage: realman_rviz [model]"
    return 2
  fi

  (export RM65_MODEL="$model"; _realman_compose run --rm rm65_rviz)
}

realman_three_rviz() {
  emulate -L zsh
  _realman_compose run --rm rm65_three_rviz
}

realman_bringup() {
  emulate -L zsh
  _realman_compose run --rm realman_bringup
}

realman_bringup_remote() {
  emulate -L zsh
  _realman_compose run --rm realman_bringup_remote
}

realman_colcon_build() {
  emulate -L zsh
  local humble_setup

  for humble_setup in /opt/ros/humble/setup.zsh /opt/ros/humble/setup.bash /opt/ros/humble/setup.sh; do
    [[ -r "$humble_setup" ]] && break
  done

  if [[ ! -r "$humble_setup" ]]; then
    print -u2 -r -- "realman_pi: ROS 2 Humble setup not found under /opt/ros/humble"
    return 1
  fi

  (
    cd -- "$REALMAN_PROJECT_ROOT" || return
    source "$humble_setup"
    _realman_require_command colcon || return
    command colcon build --symlink-install --packages-up-to realman_bringup "$@"
  )
}

realman_web_build() {
  emulate -L zsh
  _realman_require_command npm || return
  (cd -- "$REALMAN_PROJECT_ROOT/website" && command npm run build)
}

realman_web_test() {
  emulate -L zsh
  _realman_require_command npm || return
  (cd -- "$REALMAN_PROJECT_ROOT/website" && command npm run test:e2e)
}

realman_deploy() {
  emulate -L zsh
  local host="${REALMAN_PRODUCTION_HOST:-realman_local}"
  local remote_dir="${REALMAN_PRODUCTION_DIR:-/home/administrator/realman_pi}"
  local quoted_remote_dir

  if [[ "$host" == -* || "$host" == *$'\n'* || "$remote_dir" == *$'\n'* ]]; then
    print -u2 -r -- "realman_pi: invalid production host or directory"
    return 2
  fi

  _realman_require_command ssh || return
  quoted_remote_dir="${(q)remote_dir}"

  command ssh "$host" \
    "cd -- ${quoted_remote_dir} && git fetch origin main && git merge --ff-only origin/main && git status --short --branch && git log -1 --oneline"
}

realman_help() {
  print -r -- "realman_pi Zsh functions"
  print -r -- ""
  print -r -- "  realman_cd                         Change to the repository root"
  print -r -- "  realman_build [service ...]        Build Compose services (default: realman_bringup)"
  print -r -- "  realman_rviz [model]               Run the single-arm RViz viewer"
  print -r -- "  realman_three_rviz                 Run the configured three-arm RViz scene"
  print -r -- "  realman_bringup                    Run robots, RViz, Joy, and Xbox input"
  print -r -- "  realman_bringup_remote             Run the headless remote-debug target"
  print -r -- "  realman_colcon_build [args ...]    Build through realman_bringup with Humble"
  print -r -- "  realman_web_build                  Build the VitePress website"
  print -r -- "  realman_web_test                   Run the website Playwright tests"
  print -r -- "  realman_deploy                     Fast-forward main on the production host"
  print -r -- ""
  print -r -- "Runtime variables: RM65_MODEL, RM65_USE_GUI, RM65_USE_RVIZ,"
  print -r -- "REALMAN_JOY_DEVICE, ROS_DOMAIN_ID, REALMAN_PRODUCTION_HOST,"
  print -r -- "REALMAN_PRODUCTION_DIR. Run the underlying commands directly for"
  print -r -- "options not covered by these helpers."
}
