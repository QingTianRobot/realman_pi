"""Opt-in real CLI lifecycle check against an existing isolated mock container.

Set RM65_BT_CLI_RUNTIME_TEST=1 and COMPOSE_PROJECT_NAME for a mock-only project.
The caller owns creating/removing that project; this test never starts drivers.
"""

import json
import os
from pathlib import Path
import pty
import select
import signal
import subprocess
import time
import unittest
from urllib.request import urlopen
from urllib.error import URLError


ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(os.environ.get("RM65_BT_CLI_RUNTIME_TEST") == "1", "requires isolated mock Compose project")
class CliInterruptTest(unittest.TestCase):
    def test_actual_rm65_control_ctrl_c_archives_exits_and_releases_lock(self):
        self._run_interrupt(terminal_input=True)

    def test_noninteractive_rm65_control_sigint_preserves_shutdown(self):
        self._run_interrupt(terminal_input=False)

    def _run_interrupt(self, *, terminal_input):
        environment = {**os.environ, "REALMAN_BT_DRY_RUN": "true"}
        compose = ["docker", "compose", "-f", str(ROOT / "docker-compose.yml")]
        container = subprocess.check_output(compose + ["ps", "-q", "realman_bringup_remote"], text=True).strip()
        self.assertTrue(container)
        info = json.loads(subprocess.check_output(["docker", "inspect", container], text=True))[0]
        command = " ".join(info["Config"]["Cmd"])
        self.assertIn("realman_driver_mock.yaml", command)
        self.assertIn("start_gripper:=false", command)
        self.assertTrue(all(device["PathOnHost"] == "/dev/null" for device in info["HostConfig"]["Devices"]))
        archives = ROOT / "logs/behavior-trees"
        before = set(archives.glob("*/runtime.json"))
        process = None
        if terminal_input:
            pid, terminal = pty.fork()
            if pid == 0:
                os.chdir(ROOT)
                os.execve(str(ROOT / "rm65"), [str(ROOT / "rm65"), "bt", "control"], environment)
        else:
            process = subprocess.Popen([str(ROOT / "rm65"), "bt", "control"], cwd=ROOT,
                                       stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                       stderr=subprocess.STDOUT, start_new_session=True, env=environment)
            pid, terminal = process.pid, process.stdout.fileno()
        output = ""
        reaped = False
        try:
            deadline = time.monotonic() + 45
            while time.monotonic() < deadline and "press Ctrl-C" not in output:
                if select.select([terminal], [], [], 0.1)[0]:
                    output += os.read(terminal, 65536).decode(errors="replace")
            self.assertIn("press Ctrl-C", output)
            deadline = time.monotonic() + 10
            running = False
            while time.monotonic() < deadline:
                try:
                    with urlopen(f"http://127.0.0.1:{os.environ.get('BT_SERVER_PORT', '8080')}/api/runtime", timeout=1) as response:
                        running = json.load(response).get("tick_stats", {}).get("running", 0) > 0
                except (URLError, OSError):
                    pass
                if running:
                    break
                if select.select([terminal], [], [], 0.05)[0]:
                    output += os.read(terminal, 65536).decode(errors="replace")
            self.assertTrue(running, output)
            contender = subprocess.run([str(ROOT / "rm65"), "bt", "three"], cwd=ROOT,
                                       stdin=subprocess.DEVNULL, capture_output=True, timeout=10, env=environment)
            self.assertEqual(contender.returncode, 73, contender.stdout + contender.stderr)
            # The real terminal sends SIGINT to the local CLI foreground group.
            if terminal_input:
                os.write(terminal, b"\x03")
            else:
                os.kill(pid, signal.SIGINT)
            deadline = time.monotonic() + 12
            while time.monotonic() < deadline:
                if select.select([terminal], [], [], 0.1)[0]:
                    try:
                        output += os.read(terminal, 65536).decode(errors="replace")
                    except OSError:
                        pass
                ended, status = os.waitpid(pid, os.WNOHANG)
                if ended:
                    reaped = True
                    exit_code = os.waitstatus_to_exitcode(status)
                    if process is not None:
                        process.returncode = exit_code
                    self.assertEqual(exit_code, 130, output)
                    break
            self.assertTrue(reaped, output)
            deadline = time.monotonic() + 5
            while time.monotonic() < deadline and not (set(archives.glob("*/runtime.json")) - before):
                time.sleep(0.05)
            created = set(archives.glob("*/runtime.json")) - before
            self.assertEqual(len(created), 1, output)
            snapshot = json.loads(created.pop().read_text())
            self.assertGreater(snapshot["tick_stats"]["running"], 0)
            subprocess.run(["docker", "exec", container, "flock", "-n", "/tmp/realman-bt.lock", "true"], check=True)
            remaining = subprocess.run(["docker", "exec", container, "pgrep", "-f",
                                        "[r]ealman_bt_executor|[b]t_server"], capture_output=True, text=True)
            self.assertEqual(remaining.returncode, 1, remaining.stdout)
            print(f"CLI_INTERRUPT_PASS: terminal={terminal_input}, exit=130, archive, no executor/monitor, lock released; contender=73")
        finally:
            if not reaped:
                os.killpg(pid, signal.SIGTERM)
                os.waitpid(pid, 0)
            if process is None:
                os.close(terminal)
            else:
                process.stdout.close()


if __name__ == "__main__":
    unittest.main()
