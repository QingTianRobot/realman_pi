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

rm65_deploy_sync() {
  emulate -L zsh
  local host="${REALMAN_PRODUCTION_HOST:-realman_local}"
  local remote_dir="${REALMAN_PRODUCTION_DIR:-/home/administrator/realman_pi}"
  local branch
  local status
  local quoted_remote_dir
  local -a excludes

  if [[ "$host" == -* || "$host" == *$'\n'* || "$remote_dir" == *$'\n'* ]]; then
    print -u2 -r -- "rm65: invalid production host or directory"
    return 2
  fi

  _rm65_require_command git || return
  _rm65_require_command ssh || return
  _rm65_require_command rsync || return

  branch="$(command git -C "$RM65_PROJECT_ROOT" rev-parse --abbrev-ref HEAD)" || return
  if [[ "$branch" != "main" ]]; then
    print -u2 -r -- "rm65: production rsync must run from main, current branch is ${branch}"
    return 2
  fi

  status="$(command git -C "$RM65_PROJECT_ROOT" status --short --untracked-files=all)" || return
  if [[ -n "$status" ]]; then
    print -u2 -r -- "rm65: commit or stash local changes before production rsync"
    print -u2 -r -- "$status"
    return 1
  fi

  quoted_remote_dir="${(q)remote_dir}"
  excludes=(
    --exclude ".git/"
    --exclude ".claude/"
    --exclude ".worktrees/"
    --exclude "build/"
    --exclude "install/"
    --exclude "log/"
    --exclude "logs/"
    --exclude "website/node_modules/"
    --exclude "website/docs/.vitepress/dist/"
    --exclude "website/test-results/"
    --exclude "__pycache__/"
    --exclude "*.pyc"
    --exclude ".pytest_cache/"
    --exclude ".venv*/"
  )

  command ssh "$host" "mkdir -p -- ${quoted_remote_dir}" || return
  command rsync -avz --progress "${excludes[@]}" \
    "$RM65_PROJECT_ROOT/" "${host}:${remote_dir}/"
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
  print -r -- "启动入口索引: website/docs/development/startup-entries.md"
  print -r -- "每次修改 helper、Compose 服务或 launch 参数时，同步更新网站索引。"
  print -r -- ""
  print -r -- "Project:"
  print -r -- "  rm65_project_cd                    进入仓库根目录，便于执行 Compose、colcon 和网站命令"
  print -r -- "  rm65_project_help                  显示当前 helper 目录，并提示对应的网站说明页"
  print -r -- "Docker build and viewers:"
  print -r -- "  rm65_docker_build [service ...]     构建 Compose 服务；不传参数时构建 realman_bringup"
  print -r -- "  rm65_docker_rviz [model]            单臂 RViz 查看器，检查指定 RM65 型号 URDF"
  print -r -- "  rm65_docker_three_rviz              三臂 RViz 场景，验证 three_robots.yaml 布局和 TF"
  print -r -- "Standalone tests:"
  print -r -- "  rm65_docker_xbox_test               只测实体 Xbox 输入链，不启动三臂或 RViz"
  print -r -- "  rm65_docker_driver_test             只测三臂 mock 驱动，不访问真实控制器"
  print -r -- "  rm65_docker_driver_rviz             真实关节回读加 RViz，不启动输入节点"
  print -r -- "Bringup:"
  print -r -- "  rm65_docker_bringup                 完整本地系统：三臂、真实驱动、RViz、Joy 和 Xbox 输入"
  print -r -- "  rm65_docker_bringup_remote          远程 headless 目标：真实驱动和 ROS 图，不启动 RViz"
  print -r -- "Configurable bringup:"
  print -r -- "  rm65_docker_bringup_custom          前台运行 .env 配置的 realman_bringup_custom 组合"
  print -r -- "  rm65_docker_bringup_custom_start    后台启动 .env 配置组合并打印服务状态"
  print -r -- "  rm65_docker_bringup_custom_stop     停止后台参数化 bringup"
  print -r -- "  rm65_docker_bringup_custom_status   查看参数化 bringup 容器状态"
  print -r -- "  rm65_docker_bringup_custom_logs [-f] 查看或跟踪参数化 bringup 最近 100 行日志"
  print -r -- "  rm65_docker_bringup_custom_args ... 临时传 launch_arg:=value，不修改 .env"
  print -r -- "Bringup profiles:"
  print -r -- "  rm65_docker_bringup_model           只显示三臂模型和 RViz，不连接真机"
  print -r -- "  rm65_docker_bringup_hardware        三台真实驱动加 RViz，不启动输入和 Web 控制"
  print -r -- "  rm65_docker_bringup_headless        三台真实驱动加 Xbox 处理节点，无 GUI"
  print -r -- "  rm65_docker_bringup_input           只启动 Joy/Xbox 输入链，并等待实体设备"
  print -r -- "  rm65_docker_bringup_web             三台真实驱动加 Web 控制，不启动 RViz"
  print -r -- "Web control:"
  print -r -- "  rm65_docker_web_control             前台运行独立浏览器控制服务，加入已有 ROS 图"
  print -r -- "  rm65_docker_web_control_start       后台启动浏览器控制服务并打印状态"
  print -r -- "  rm65_docker_web_control_stop        停止后台浏览器控制服务"
  print -r -- "  rm65_docker_web_control_status      查看浏览器控制服务状态"
  print -r -- "  rm65_docker_web_control_logs [-f]   查看或跟踪浏览器控制服务日志"
  print -r -- "  rm65_web_control_url [host]         打印 http://host:port/ 浏览器控制台地址"
  print -r -- "Remote RViz:"
  print -r -- "  rm65_docker_remote_rviz [domain]    前台启动 RViz-only 远程查看器，保留终端日志"
  print -r -- "  rm65_docker_remote_rviz_start [domain] 后台启动 RViz-only 远程查看器"
  print -r -- "  rm65_docker_remote_rviz_stop        停止后台远程 RViz，不影响工控机驱动"
  print -r -- "  rm65_docker_remote_rviz_status      查看后台远程 RViz 状态"
  print -r -- "  rm65_docker_remote_rviz_logs [-f]   查看或跟踪远程 RViz 日志"
  print -r -- "ROS:"
  print -r -- "  rm65_ros_build [args ...]            使用本机 ROS 2 Humble 构建 bringup 和驱动包"
  print -r -- "Website:"
  print -r -- "  rm65_web_build                      构建 VitePress 网站和同步后的三臂 Web 资源"
  print -r -- "  rm65_web_test                       运行网站 Playwright 测试"
  print -r -- "Deployment:"
  print -r -- "  rm65_deploy_sync                    本地提交并 push 后，用 rsync 同步当前 main 到生产端"
  print -r -- "  rm65_deploy_update                  兼容入口：在生产主机对 main 执行 fetch 与 merge --ff-only"
  print -r -- ""
  print -r -- "Runtime variables: RM65_MODEL, RM65_USE_GUI, RM65_USE_RVIZ,"
  print -r -- "REALMAN_START_ROBOTS, REALMAN_START_DRIVER, REALMAN_START_JOY_DRIVER,"
  print -r -- "REALMAN_START_CONTROLLER, REALMAN_USE_GUI, REALMAN_USE_RVIZ,"
  print -r -- "REALMAN_START_WEB_CONTROL, REALMAN_WAIT_FOR_JOY_DEVICE, REALMAN_JOY_POLL_INTERVAL,"
  print -r -- "REALMAN_JOY_DEVICE, REALMAN_*_CONFIG_FILE,"
  print -r -- "ROS_DOMAIN_ID, DISPLAY, XAUTHORITY,"
  print -r -- "REALMAN_PRODUCTION_HOST,"
  print -r -- "REALMAN_PRODUCTION_DIR. Run the underlying commands directly for"
  print -r -- "options not covered by these helpers."
  print -r -- "Build mirror variables: ROS_BASE_IMAGE, UBUNTU_APT_MIRROR,"
  print -r -- "UBUNTU_PORTS_APT_MIRROR, ROS2_APT_MIRROR, PYPI_INDEX_URL."
}
