import fcntl
import json
from pathlib import Path
import sys
import threading
import time
import urllib.error
import urllib.request

import pytest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from bt_launcher import (  # noqa: E402
    LaunchRefused, Launcher, load_config, lock_is_held, make_handler,
)

ROOT_CONFIG = Path(__file__).resolve().parents[4] / "config/ros/bt_launcher.yaml"


@pytest.fixture
def launcher(tmp_path):
    trees = tmp_path / "trees"
    trees.mkdir()
    (trees / "control.xml").write_text("<root/>", encoding="utf-8")
    # Stand-in for bt-start: record the environment it was given, then hold the lock briefly.
    fake = tmp_path / "bt-start"
    fake.write_text(
        "#!/usr/bin/env bash\n"
        'env | grep -E "^(BT_|REALMAN_BT_)" | sort > "$FAKE_ENV_OUT"\n'
        'if [[ "$BT_TREE_FILE" == *fail.xml ]]; then echo "Action /l/execute_motion is not ready"; exit 1; fi\n'
        # Hold the instance lock like bt-start's `flock -n 9` (portable: macOS has no flock(1)).
        'exec python3 -c "import fcntl,sys,time; f=open(sys.argv[1],\'a\'); fcntl.flock(f, fcntl.LOCK_EX); time.sleep(0.3)" "$FAKE_LOCK"\n',
        encoding="utf-8",
    )
    fake.chmod(0o755)
    config = load_config(ROOT_CONFIG)
    config.update({
        "tree_dir": str(trees), "bt_start": str(fake), "log_dir": str(tmp_path / "logs"),
        "instance_lock": str(tmp_path / "bt.lock"),
    })
    config["env"] = {**config["env"], "FAKE_ENV_OUT": str(tmp_path / "env.txt"),
                     "FAKE_LOCK": str(tmp_path / "bt.lock")}
    return Launcher(config), tmp_path


def wait_until(predicate, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.02)
    return False


def test_root_config_matches_the_bt_sh_environment():
    config = load_config(ROOT_CONFIG)
    assert config["bind_host"] == "127.0.0.1"  # never exposed beyond the robot host
    assert config["env"]["BT_SERVER_PORT"] == 8080
    assert config["env"]["BT_RUNTIME_SNAPSHOT"] == "/tmp/realman-bt-workspace/runtime.json"
    assert config["instance_lock"] == "/tmp/realman-bt.lock"


def test_start_runs_bt_start_with_the_tree_and_real_motion_choice(launcher):
    instance, tmp_path = launcher
    result = instance.start("control.xml", False)
    assert result["ok"] and result["tree"] == "control.xml" and result["dry_run"] is False
    assert wait_until(lambda: (tmp_path / "env.txt").exists() and (tmp_path / "env.txt").read_text())
    env = dict(line.split("=", 1) for line in (tmp_path / "env.txt").read_text().splitlines())
    assert env["BT_AUTOSTART"] == "true"
    assert env["BT_TREE_FILE"].endswith("/trees/control.xml")
    assert env["REALMAN_BT_DRY_RUN"] == "false"
    assert env["BT_READ_ONLY"] == "true" and env["BT_ARM_ID_OVERRIDE"] == ""
    assert instance.status()["running"] is True
    assert wait_until(lambda: not instance.status()["running"])
    assert instance.status()["exit_code"] == 0


def test_dry_run_is_passed_through(launcher):
    instance, tmp_path = launcher
    instance.start("control.xml", True)
    assert wait_until(lambda: (tmp_path / "env.txt").exists() and (tmp_path / "env.txt").read_text())
    assert "REALMAN_BT_DRY_RUN=true" in (tmp_path / "env.txt").read_text()


@pytest.mark.parametrize("tree, dry_run, status", [
    ("../etc/passwd.xml", True, 400),
    ("control", True, 400),
    ("missing.xml", True, 404),
    ("control.xml", "false", 400),
])
def test_start_rejects_bad_requests(launcher, tree, dry_run, status):
    instance, _ = launcher
    with pytest.raises(LaunchRefused) as refused:
        instance.start(tree, dry_run)
    assert refused.value.status == status


def test_a_tree_started_elsewhere_blocks_a_second_start(launcher):
    instance, tmp_path = launcher
    lock = tmp_path / "bt.lock"
    with open(lock, "w") as held:  # e.g. `./rm65 bt control` from a terminal
        fcntl.flock(held, fcntl.LOCK_EX)
        assert lock_is_held(lock)
        assert instance.status()["running"] is True
        with pytest.raises(LaunchRefused) as refused:
            instance.start("control.xml", False)
        assert refused.value.status == 409
    assert not lock_is_held(lock)


def test_failed_start_reports_exit_code_and_log_tail(launcher):
    instance, tmp_path = launcher
    (tmp_path / "trees" / "fail.xml").write_text("<root/>", encoding="utf-8")
    instance.start("fail.xml", False)
    assert wait_until(lambda: "exit_code" in instance.status())
    status = instance.status()
    assert status["exit_code"] == 1
    assert any("not ready" in line for line in status["log_tail"])


def test_http_interface(launcher):
    from http.server import ThreadingHTTPServer

    instance, _ = launcher
    server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(instance))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_address[1]}"

    def post(body):
        request = urllib.request.Request(f"{base}/start", data=json.dumps(body).encode(), method="POST")
        try:
            with urllib.request.urlopen(request, timeout=2) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as error:
            return error.code, json.load(error)

    try:
        assert post({"tree": "missing.xml", "dry_run": True})[0] == 404
        status, body = post({"tree": "control.xml", "dry_run": True})
        assert status == 200 and body["ok"]
        with urllib.request.urlopen(f"{base}/status", timeout=2) as response:
            assert json.load(response)["tree"] == "control.xml"
        assert post({"tree": "control.xml", "dry_run": True})[0] == 409
    finally:
        server.shutdown()
        server.server_close()
