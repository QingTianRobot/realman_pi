#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/realman-bt-bringup-test.XXXXXXXX")"
trap 'rm -rf "$TEST_ROOT"' EXIT

fake_docker="$TEST_ROOT/docker"
docker_log="$TEST_ROOT/docker.log"
cat >"$fake_docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$*" >>"${FAKE_DOCKER_LOG:?}"
case "${1:-}" in
  ps)
    # The bringup is owned by a different Compose project, so the repository's
    # compose ps would not find it. Docker's service label still identifies it.
    if [[ " $* " == *" --filter label=com.docker.compose.service=realman_bringup_remote "* ]]; then
      printf 'bringup-from-independent-compose\n'
      exit 0
    fi
    printf 'unexpected docker ps query: %s\n' "$*" >&2
    exit 1
    ;;
  inspect)
    printf 'true\n'
    ;;
  exec)
    [[ " $* " == *" bringup-from-independent-compose "* ]]
    [[ " $* " == *" /usr/local/bin/bt-start "* ]]
    ;;
  *)
    printf 'unexpected docker command: %s\n' "$*" >&2
    exit 1
    ;;
esac
EOF
chmod +x "$fake_docker"

set +e
PATH="$TEST_ROOT:$PATH" \
FAKE_DOCKER_LOG="$docker_log" \
REALMAN_BT_DRY_RUN=true \
  "$ROOT/scripts/bt.sh" control >"$TEST_ROOT/output" 2>&1
rc=$?
set -e

if (( rc != 0 )); then
  cat "$TEST_ROOT/output" >&2
  printf 'bt launcher rejected a running bringup outside the current Compose project\n' >&2
  exit 1
fi
grep -Eq '^exec ' "$docker_log"
if grep -Fq ' compose ' "$docker_log"; then
  printf 'bt launcher unexpectedly used Compose service lookup/exec\n' >&2
  cat "$docker_log" >&2
  exit 1
fi
grep -Fq -- '--filter label=com.docker.compose.service=realman_bringup_remote' "$docker_log"
grep -Fq -- '--filter status=running' "$docker_log"
grep -Fq 'exec -i -e BT_AUTOSTART=true' "$docker_log"
grep -Fq -- '-e REALMAN_BT_DRY_RUN=true' "$docker_log"
grep -Fq 'bringup-from-independent-compose /usr/local/bin/bt-start' "$docker_log"

printf '%s\n' 'behavior-tree bringup container detection: PASS'
