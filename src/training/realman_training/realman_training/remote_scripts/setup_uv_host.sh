#!/usr/bin/env bash
# Lay out a shared GPU host (no docker, no sudo) for the training console: env.sh, openpi in a uv venv, run dirs.
# usage (from the console host): realman-train compute setup [--openpi-ref REF]
#   == ssh <host> bash -s -- <workdir> <openpi-ref> < setup_uv_host.sh
# Idempotent. Everything stays under <workdir>; nothing there is deleted (env.sh is rewritten, an existing openpi
# clone is fetched and checked out, not re-cloned). Steps learned on the campus server, 2026-11-18:
#  - uv's git clone of lerobot dies mid-pack; the codeload tarball + `uv pip install --no-deps` works.
#  - pyarrow's bundled jemalloc background thread segfaults on that host: JE_ARROW_MALLOC_CONF.
set -euo pipefail
W=${1:?workdir}
REF=${2:-main}
OPENPI_URL=https://github.com/QingTianRobot/openpi.git
command -v uv >/dev/null || { echo "uv is not on PATH (install it for this user first)" >&2; exit 1; }
mkdir -p "$W"/{cache/uv,cache/python,cache/xdg,data/openpi,data/lerobot,data/realman,src,logs}

cat > "$W/env.sh" <<EOF
export REALMAN_COMPUTE_WORKDIR=$W
export UV_CACHE_DIR=$W/cache/uv
export UV_PYTHON_INSTALL_DIR=$W/cache/python
export XDG_CACHE_HOME=$W/cache/xdg
export OPENPI_DATA_HOME=$W/data/openpi
export HF_HOME=$W/cache/xdg/huggingface
export HF_LEROBOT_HOME=$W/data/lerobot
export GIT_LFS_SKIP_SMUDGE=1
export UV_LINK_MODE=copy
export JE_ARROW_MALLOC_CONF=background_thread:false
# realman_training on this host (config/training/training_console.yaml reads these)
export REALMAN_TRAINING_DATA_ROOT=$W/data/realman
export REALMAN_OPENPI_BACKEND=uv
export REALMAN_OPENPI_ENV_FILE=$W/env.sh
export REALMAN_OPENPI_REPO=$W/src/openpi
export REALMAN_OPENPI_DATA=$W/src/openpi
export REALMAN_OPENPI_SHARE_GPUS=true
export REALMAN_OPENPI_WEIGHTS=$W/data/openpi/openpi-assets/checkpoints/pi05_base/params
EOF
source "$W/env.sh"

if [ ! -d "$W/src/openpi/.git" ]; then
  git clone "$OPENPI_URL" "$W/src/openpi"
fi
cd "$W/src/openpi"
git fetch origin "$REF" || { echo "fetch $REF failed" >&2; exit 1; }
git checkout --detach FETCH_HEAD
# The console points openpi at its training view through this variable (QingTianRobot/openpi#6).
grep -q OPENPI_REALMAN_DATASET_DIR src/openpi/training/config.py || {
  echo "openpi $REF does not read OPENPI_REALMAN_DATASET_DIR: use a ref that has QingTianRobot/openpi#6" >&2; exit 1; }
mkdir -p checkpoints assets wandb console_run

for try in 1 2 3; do
  uv sync --frozen --no-install-package lerobot && break
  echo "uv sync failed (try $try)"
  [ "$try" = 3 ] && exit 1
  sleep 10
done
REV=$(grep -o 'github.com/huggingface/lerobot[^"]*#[0-9a-f]\{40\}' uv.lock | head -1 | sed 's/.*#//') || REV=
[ -n "$REV" ] || { echo "no pinned lerobot revision in uv.lock" >&2; exit 1; }
L="$W/src/lerobot-$REV"
if [ ! -d "$L" ]; then
  curl -fsSL --retry 5 -o "$W/cache/lerobot-$REV.tar.gz" "https://codeload.github.com/huggingface/lerobot/tar.gz/$REV"
  # extract next to it and move into place: an interrupted extract never looks like a finished one
  T=$(mktemp -d "$W/src/.lerobot-extract.XXXXXX")
  tar -C "$T" -xzf "$W/cache/lerobot-$REV.tar.gz"
  mv "$T/lerobot-$REV" "$L"
  rmdir "$T"
fi
uv pip install --no-deps "$L"
.venv/bin/python -c "import openpi, lerobot, pyarrow; print('openpi env ok')"
echo "pi05_base: $( [ -d "$W/data/openpi/openpi-assets/checkpoints/pi05_base/params" ] && echo present || echo MISSING — fetch it with gcs_chunked_get.py )"
