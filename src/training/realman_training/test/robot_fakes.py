"""A fake realman_ts + server5090 for the serving and linkcheck tests: FakeRunner rules with editable state."""

from __future__ import annotations

import json
import shlex

from fake_runner import FakeRunner

SERVER_ADDR = "192.0.2.20"  # documentation range, never a real address
SERVE_CONTAINER = "openpi-serve-openpi-1"
BRIDGE_CONTAINER = "realman_pi-policy_bridge-1"
PLACE = "pick up the power adapter and put it in the blue bin"


def inspect_json(running: bool, env: dict[str, str] | None = None, args: list[str] | None = None,
                 ports: dict | None = None) -> str:
    return json.dumps([{
        "State": {"Running": running, "Status": "running" if running else "exited", "StartedAt": "2026-10-20T08:00:00.123456789Z"},
        "Config": {"Image": "img:tag", "Env": [f"{k}={v}" for k, v in (env or {}).items()]},
        "Image": "sha256:0123456789abcdef0123",
        "Args": args or [],
        "HostConfig": {"PortBindings": ports or {}},
    }])


class FakeChain:
    """Answers every command the console sends. Change the attributes, then build the runner."""

    def __init__(self):
        self.mode = {"requested_mode": "none", "selected_mode": "none", "active_mode": "none", "phase": 0, "detail": ""}
        self.stats = {"prompt": PLACE, "paused": "0.0", "allow_publish": "0.0", "mode_active": "0.0", "published": "0"}
        self.prompt_confirmed = True
        self.nodes = ["/policy_bridge_node", "/r/realman_driver"]
        self.bridge_port = 18000
        self.bridge_running = True
        self.serve_running = False
        self.gpu_used_mib = 500
        self.ssh_client = f"{SERVER_ADDR} 50000 22"
        self.wifi = "wlx0 1000000"  # interface and bytes over the window
        self.ping = "10 packets transmitted, 10 received, 0% packet loss, time 1800ms\nrtt min/avg/max/mdev = 3.1/8.4/20.5/4.0 ms"
        self.infer_ms = [900.0, 95.0, 101.0, 99.0, 120.0, 97.0]  # answers take the first ROUNDS of these
        self.serve_dies = False  # the serve container exits while loading
        self.serve_logs = ""
        self.unreachable = False
        # If set, the BT mode switches to this dict after the first warm-up probe runs
        self.mode_after_warmup: dict | None = None
        self._warmed = False

    @staticmethod
    def _infer_rounds(argv) -> int:
        text = argv[-1]
        if text.startswith("docker exec"):
            text = shlex.split(text)[-1]
        return int(shlex.split(text.split(" - ", 1)[1])[2])

    def _probe(self, argv, input):
        if input and "ros_probe" in input.splitlines()[0]:
            text = argv[-1]
            out = {}
            if "nodes" in text:
                out["nodes"] = self.nodes
            if "mode=" in text:
                mode = (self.mode_after_warmup if (self.mode_after_warmup and self._warmed) else self.mode)
                out["mode"] = mode
            if "stats=" in text:
                out["stats"] = self.stats
            if "prompt=" in text:
                out["prompt"] = {"published": True, "confirmed": self.prompt_confirmed, "stats": self.stats}
            return "noise from ros\n" + json.dumps(out)
        self._warmed = True
        rounds = self._infer_rounds(argv)
        return json.dumps({"ms": self.infer_ms[:rounds], "connect_ms": 12.0, "actions_shape": [16, 7]})

    def runner(self) -> FakeRunner:
        fake = FakeRunner()
        if self.unreachable:
            fake.on("ssh ", returncode=255, stdout="ssh: connect to host realman_local port 22: Connection timed out")
        fake.on("compose.serve.yaml up -d", action=lambda a, i: setattr(self, "serve_running", not self.serve_dies))
        fake.on("docker logs", stdout=lambda a, i: self.serve_logs)
        fake.on("SSH_CLIENT", stdout=lambda a, i: self.ssh_client + "\n")
        fake.on("policy_bridge.yaml", stdout=lambda a, i: f"network:\n  server_host: x\n  server_port: {self.bridge_port}\n")
        fake.on("python3 - ", stdout=lambda a, i: self._probe(a, i))
        fake.on("uv run --no-sync python - ", stdout=lambda a, i: self._probe(a, i))
        fake.on(f"docker inspect {BRIDGE_CONTAINER}", stdout=lambda a, i: inspect_json(self.bridge_running, {"POLICY_WS_HOST": SERVER_ADDR}))
        fake.on(f"-f {{{{.State.Running}}}} {SERVE_CONTAINER}", stdout=lambda a, i: "true\n" if self.serve_running else "false\n")
        fake.on(f"docker inspect {SERVE_CONTAINER}", stdout=lambda a, i: inspect_json(True, {"SERVE_GPU": "2"}) if self.serve_running else "",
                returncode=0)
        fake.on("/sys/class/net", stdout=lambda a, i: self.wifi + "\n")
        fake.on("ping -q", stdout=lambda a, i: self.ping + "\n")
        fake.on("nvidia-smi", stdout=lambda a, i: (
            f"2, {self.gpu_used_mib}, 32607\n" if "memory.total" in " ".join(a) else f"2, {self.gpu_used_mib}\n"))
        return fake
