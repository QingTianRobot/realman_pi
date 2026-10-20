from __future__ import annotations

import ast
import json
import sys
import types

import pytest
from fake_runner import FakeRunner
from robot_fakes import SERVER_ADDR, FakeChain

from realman_training.config import RemoteConfig, ServingConfig
from realman_training.jobs import StepFailed
from realman_training.robot import Robot, container_facts, remote_path, script


def robot(fake) -> Robot:
    return Robot(RemoteConfig(), ServingConfig(), fake)


def test_ssh_argv_uses_the_alias_batch_mode_and_the_timeout():
    argv = robot(FakeRunner()).ssh_argv("true")
    assert argv[0] == "ssh" and "BatchMode=yes" in argv and "ConnectTimeout=10" in argv
    assert argv[-2:] == ["realman_local", "true"]


def test_remote_path_keeps_the_home_expansion():
    assert remote_path("~/realman_pi") == '"$HOME"/realman_pi'
    assert remote_path("/abs/with space") == "'/abs/with space'"


def test_check_turns_an_ssh_failure_into_a_readable_step_failure():
    chain = FakeChain()
    chain.unreachable = True
    with pytest.raises(StepFailed, match="realman_ts .*unreachable"):
        robot(chain.runner()).check("true")


def test_server_address_comes_from_ssh_client_unless_configured():
    chain = FakeChain()
    assert robot(chain.runner()).server_address() == SERVER_ADDR
    fixed = Robot(RemoteConfig(), ServingConfig(server_host="192.0.2.99"), chain.runner())
    assert fixed.server_address() == "192.0.2.99"


def test_bridge_port_is_read_from_the_robot_yaml():
    chain = FakeChain()
    chain.bridge_port = 18001
    fake = chain.runner()
    assert robot(fake).bridge_port() == 18001
    assert 'cat "$HOME"/realman_pi/config/ros/policy_bridge.yaml' in fake.calls[-1][-1]


def test_ros_probe_sends_the_script_and_reads_the_last_json_line():
    chain = FakeChain()
    fake = chain.runner()
    r = robot(fake)
    assert r.bt_mode()["active_mode"] == "none"
    command = fake.calls[-1][-1]
    assert command.startswith("docker exec -i realman_pi-realman_bringup_remote-1 bash -lc ")
    assert "mode=10.0" in command
    assert fake.inputs[-1] == script("ros_probe")


def test_container_facts():
    data = json.loads(json.dumps([{"State": {"Running": True, "Status": "running", "StartedAt": "2026-10-20T08:00:00.1Z"},
                                   "Config": {"Image": "img:1", "Env": ["A=1", "B=x=y"]}, "Image": "sha256:" + "a" * 64}]))[0]
    facts = container_facts(data)
    assert facts["running"] is True and facts["image"] == "img:1"
    assert facts["env"] == {"A": "1", "B": "x=y"}
    assert facts["image_id"] == "sha256:aaaaaaaaaaaa"


def test_bridge_compose_command_never_uses_rm65():
    command = robot(FakeRunner()).compose_command("up", "-d", "--no-deps", "--no-build", "policy_bridge", env={"POLICY_WS_HOST": SERVER_ADDR})
    assert command == f'cd "$HOME"/realman_pi && POLICY_WS_HOST={SERVER_ADDR} docker compose up -d --no-deps --no-build policy_bridge'
    assert "./rm65" not in command


@pytest.mark.parametrize("name", ["ros_probe", "infer_probe"])
def test_remote_scripts_parse(name):
    ast.parse(script(name))


def test_infer_probe_times_real_size_requests(monkeypatch, capsys):
    seen = []

    class Client:
        def __init__(self, host, port):
            seen.append((host, port))

        def infer(self, obs):
            seen.append({k: getattr(v, "shape", v) for k, v in obs.items()})
            import numpy as np

            return {"actions": np.zeros((16, 7))}

    module = types.ModuleType("openpi_client.websocket_client_policy")
    module.WebsocketClientPolicy = Client
    monkeypatch.setitem(sys.modules, "openpi_client", types.ModuleType("openpi_client"))
    monkeypatch.setitem(sys.modules, "openpi_client.websocket_client_policy", module)
    monkeypatch.setattr(sys, "argv", ["-", "192.0.2.20", "18000", "2", "do it"])
    exec(compile(script("infer_probe"), "infer_probe.py", "exec"), {"__name__": "__main__"})
    out = json.loads(capsys.readouterr().out.strip().splitlines()[-1])
    assert len(out["ms"]) == 2 and out["actions_shape"] == [16, 7]
    assert seen[0] == ("192.0.2.20", 18000)
    assert seen[1] == {"wrist_image": (224, 224, 3), "global_image": (224, 224, 3), "state": (7,), "prompt": "do it"}
