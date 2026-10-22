#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRY="$ROOT/rm65_server"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT
ENV_FILE="$SCRATCH/console.env"
printf 'REALMAN_TRAINING_TOKEN=x\n' >"$ENV_FILE"
chmod 600 "$ENV_FILE"

dry() { RM65_DRY_RUN=1 RM65_SERVER_ENV="$ENV_FILE" "$ENTRY" "$@" 2>&1; }

expect_compose() {
  grep -Fq -- "-p realman-training" <<<"$1"
  grep -Fq -- "--profile training" <<<"$1"
  grep -Fq -- "--env-file $ENV_FILE" <<<"$1"
}

no_robot_services() {
  if grep -Eq "realman_bringup|realman_web_control|realman_recording|policy_bridge|camera" <<<"$1"; then
    echo "rm65_server touched a robot service: $1" >&2
    exit 1
  fi
}

output="$(dry up)"
expect_compose "$output"
grep -Fq "up -d realman_training" <<<"$output"
no_robot_services "$output"
if grep -Fq " build " <<<"$output"; then
  echo "plain up unexpectedly builds" >&2
  exit 1
fi

output="$(dry up --build)"
grep -Fq "up -d --build realman_training" <<<"$output"

output="$(dry build)"
expect_compose "$output"
grep -Fq "build realman_training" <<<"$output"
no_robot_services "$output"

for command in down restart status logs; do
  output="$(dry "$command")"
  expect_compose "$output"
  no_robot_services "$output"
done
grep -Fq "logs --tail=100 realman_training" <<<"$(dry logs)"
grep -Fq "logs --tail=100 -f realman_training" <<<"$(dry logs -f)"

output="$(dry exec python -m realman_training jobs)"
grep -Fq "exec realman_training python -m realman_training jobs" <<<"$output"

# A missing env file stops before any docker call and says how to create it.
if output="$(RM65_SERVER_ENV="$SCRATCH/missing.env" "$ENTRY" up 2>&1)"; then
  echo "up without an env file unexpectedly succeeded" >&2
  exit 1
fi
grep -Fq "init-env" <<<"$output"

# init-env writes a private file with a token and never overwrites one.
NEW_ENV="$SCRATCH/new/console.env"
RM65_SERVER_ENV="$NEW_ENV" "$ENTRY" init-env >/dev/null
grep -Eq '^REALMAN_TRAINING_TOKEN=.{20,}$' "$NEW_ENV"
grep -Fq "TRAINING_REPO=$ROOT" "$NEW_ENV"
grep -Fq "TRAINING_UID=$(id -u)" "$NEW_ENV"
[[ "$(stat -c %a "$NEW_ENV" 2>/dev/null || stat -f %Lp "$NEW_ENV")" == "600" ]]
if RM65_SERVER_ENV="$NEW_ENV" "$ENTRY" init-env >/dev/null 2>&1; then
  echo "init-env unexpectedly overwrote an existing file" >&2
  exit 1
fi

grep -Fq "up [--build]" <<<"$("$ENTRY" help)"
if "$ENTRY" does-not-exist >/dev/null 2>&1; then
  echo "invalid command unexpectedly succeeded" >&2
  exit 1
fi

echo "rm65_server entry tests passed"
