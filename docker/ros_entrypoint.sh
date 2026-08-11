#!/usr/bin/env bash
set -e

source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash

export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime-root}"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

exec "$@"
