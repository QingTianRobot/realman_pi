"""realman_ts as seen from server5090: ssh commands, docker on the robot host, and the ROS probe.

Robot-side writes are limited to the policy_bridge service (compose up/stop) and the bridge's runtime prompt; the
probe only reads the ROS graph otherwise. Hosts by ssh alias only.
"""

from __future__ import annotations

import json
import re
import shlex
import subprocess
from pathlib import Path

import yaml

from .config import RemoteConfig, ServingConfig
from .jobs import StepFailed
from .runner import Completed, Runner
from .steps.train import _normalize_docker_time

SCRIPTS = Path(__file__).resolve().parent / "remote_scripts"

_ADDR_RE = re.compile(r'\b\d{1,3}(?:\.\d{1,3}){3}\b')


def redact(text: str) -> str:
    """Replace IPv4 address literals with <addr> so they are not logged or stored."""
    return _ADDR_RE.sub('<addr>', text)


def script(name: str) -> str:
    return (SCRIPTS / f"{name}.py").read_text(encoding="utf-8")


def remote_path(path: str) -> str:
    """Quote a path for the remote shell but keep a leading ~ expanding to the remote home."""
    if path == "~":
        return '"$HOME"'
    if path.startswith("~/"):
        return '"$HOME"/' + shlex.quote(path[2:])
    return shlex.quote(path)


def container_facts(inspect: dict) -> dict:
    state = inspect.get("State") or {}
    env = {}
    for item in (inspect.get("Config") or {}).get("Env") or []:
        key, _, value = item.partition("=")
        env[key] = value
    return {
        "running": bool(state.get("Running")),
        "status": str(state.get("Status", "")),
        "image": str((inspect.get("Config") or {}).get("Image", "")),
        "image_id": str(inspect.get("Image", ""))[:19],
        "started": _normalize_docker_time(str(state.get("StartedAt", ""))),
        "env": env,
    }


class Robot:
    def __init__(self, remote: RemoteConfig, serving: ServingConfig, runner: Runner):
        self.remote, self.serving, self.runner = remote, serving, runner

    def ssh_argv(self, command: str) -> list[str]:
        return [
            "ssh",
            "-o", "BatchMode=yes",
            "-o", f"ConnectTimeout={self.remote.connect_timeout_sec}",
            "-o", "ServerAliveInterval=15",
            "-o", "ServerAliveCountMax=4",
            self.remote.ssh_host,
            command,
        ]

    def run(self, command: str, *, input: str | None = None, timeout: float | None = None) -> Completed:
        try:
            done = self.runner.run(self.ssh_argv(command), input=input, timeout=timeout)
        except subprocess.TimeoutExpired:
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}): {redact(command[:120])} timed out after {timeout:g} s") from None
        if done.returncode == 255:
            tail = (done.stderr or done.stdout).strip().splitlines()[-1:] or [""]
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}) unreachable: {redact(tail[0])}")
        return done

    def check(self, command: str, *, input: str | None = None, timeout: float | None = None) -> str:
        done = self.run(command, input=input, timeout=timeout)
        if done.returncode:
            tail = "\n".join((done.stderr or done.stdout).strip().splitlines()[-10:])
            raise StepFailed(f"realman_ts ({self.remote.ssh_host}): {redact(command[:120])} exited {done.returncode}: {redact(tail)}")
        return done.stdout

    def container(self, name: str) -> dict | None:
        done = self.run(f"docker inspect {shlex.quote(name)}")
        if done.returncode or not done.stdout.strip():
            return None
        data = json.loads(done.stdout)
        return container_facts(data[0]) if data else None

    def server_address(self) -> str:
        if self.serving.server_host:
            return self.serving.server_host
        parts = self.check('echo "$SSH_CLIENT"').split()
        if not parts:
            raise StepFailed("realman_ts did not report $SSH_CLIENT; set serving.server_host")
        return parts[0]

    def bridge_port(self) -> int:
        path = f"{remote_path(self.serving.robot_repo)}/{shlex.quote(self.serving.bridge_config)}"
        try:
            port = (yaml.safe_load(self.check(f"cat {path}")) or {})["network"]["server_port"]
            return int(port)
        except (KeyError, TypeError, ValueError, yaml.YAMLError) as error:
            raise StepFailed(f"cannot read network.server_port from the robot's {self.serving.bridge_config}: {error}") from None

    def in_container(self, name: str, command: str) -> str:
        return f"docker exec -i {shlex.quote(name)} bash -lc {shlex.quote(self.serving.ros_setup + ' && ' + command)}"

    def ros_probe(self, *requests: str, timeout: float = 90) -> dict:
        command = self.in_container(self.serving.ros_container, "python3 - " + shlex.join(requests))
        out = self.check(command, input=script("ros_probe"), timeout=timeout)
        lines = [line for line in out.strip().splitlines() if line.startswith("{")]
        if not lines:
            raise StepFailed(f"the ROS probe printed no result: {out.strip()[-300:]}")
        return json.loads(lines[-1])

    def bt_mode(self) -> dict | None:
        return self.ros_probe(f"mode={self.serving.mode_wait_sec}")["mode"]

    def bridge_stats(self, seconds: float) -> dict | None:
        return self.ros_probe(f"stats={seconds}")["stats"]

    def set_prompt(self, text: str) -> dict:
        return self.ros_probe(f"prompt={text}")["prompt"]

    def compose_command(self, *args: str, env: dict[str, str] | None = None) -> str:
        assigns = "".join(f"{key}={shlex.quote(value)} " for key, value in (env or {}).items())
        return f"cd {remote_path(self.serving.robot_repo)} && {assigns}docker compose {shlex.join(args)}"
