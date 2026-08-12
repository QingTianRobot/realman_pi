#!/usr/bin/env bash
set -e

source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash

export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime-root}"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

# ROS 2 launch creates the final timestamped run directory. Keep the root
# available for direct ROS commands that also honor ROS_LOG_DIR.
export REALMAN_LOG_ROOT="${REALMAN_LOG_ROOT:-/opt/rm65_ws/logs}"
mkdir -p "$REALMAN_LOG_ROOT"

# Use rcutils' official colored output for every ROS 2 process in the container.
export RCUTILS_COLORIZED_OUTPUT="${RCUTILS_COLORIZED_OUTPUT:-1}"

exec "$@"
