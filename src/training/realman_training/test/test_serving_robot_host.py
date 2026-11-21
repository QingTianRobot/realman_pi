"""Serving on SJDrealman: the console runs on the robot host (remote.ssh_host "") and the run's checkpoints live on
a compute host, so start copies the served step's params before openpi-serve starts."""

from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from robot_fakes import PLACE, FakeChain

from realman_training import linkcheck, serving
from realman_training.config import load_config
from realman_training.jobs import StepFailed
from realman_training.linkcheck import Check
from realman_training.robot import LOCAL_SERVER, Robot

CFG, EXP = "pi05_realman_sjd_left_v1_action_only", "sjd_left_ao_v1_b16_2gpu"
WORKDIR = "/srv/work"


@pytest.fixture()
def config(tmp_path):
    docker_data = tmp_path / "openpi-docker-data"
    folder = docker_data / "checkpoints" / CFG / EXP
    (folder / "29999" / "assets").mkdir(parents=True)  # the mirror: step dir without params
    (folder / "model_card.json").write_text(json.dumps({"tasks": {"pick_and_place": {"prompt": PLACE, "count": 87}}}))
    path = tmp_path / "console.yaml"
    path.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        "  remote:\n    ssh_host: ''\n"
        f"  compute:\n    ssh_host: compute_alias\n    workdir: {WORKDIR}\n"
        f"  openpi:\n    docker_data: {docker_data}\n"
        f"  serving:\n    model: {CFG}/{EXP}\n    gpu: 0\n"
        "    compose_files: [/x/openpi/compose.yaml, /x/openpi-serve.compose.yaml, '']\n"
    )
    return load_config(path)


def step_dir(config, step=29999):
    return config.openpi.docker_data / "checkpoints" / CFG / EXP / str(step)


class Port:
    def __init__(self):
        self.polls = 0

    def __call__(self, port, host=None, timeout=1.0):
        self.polls += 1
        return self.polls > 2


def no_checks(*args, **kwargs):
    return [Check("pika", "pika_nodes", True, "0", "0")]


def runner_for(config, chain, *, fetch_code=0, write_params=True):
    fake = chain.runner()

    def fetched(argv, _input):
        if write_params:
            (step_dir(config) / "params").mkdir(parents=True, exist_ok=True)
            (step_dir(config) / "params" / "shard").write_bytes(b"x" * 1024)

    # The rule must come before the FakeChain rules that match "ssh " in the rsync -e option.
    fake._rules.insert(0, ("--info=name1", "", fetch_code, ("params/", "params/shard", "assets/norm_stats.json"), fetched))
    return fake


def start(config, chain=None, fake=None, **extra):
    chain = chain or FakeChain()
    fake = fake or runner_for(config, chain)
    log = RecordingLog()
    result = serving.start({"config": str(config.source), "action": "start", **extra}, log, fake, port_open=Port(),
                           sleep=lambda s: None, clock=iter(range(10_000)).__next__, checks=no_checks)
    return result, fake, log


def test_a_local_robot_runs_its_commands_through_bash_without_ssh(config):
    chain = FakeChain()
    result, fake, _ = start(config, chain)
    bridge = fake.commands("docker compose up -d --no-deps --no-build policy_bridge")
    assert bridge and bridge[0][:2] == ["bash", "-c"]
    assert f"POLICY_WS_HOST={LOCAL_SERVER} " in bridge[0][-1]
    probes = fake.commands("python3 - ")
    assert probes and all(call[:2] == ["bash", "-c"] for call in probes)
    assert not fake.commands("SSH_CLIENT")
    assert not [c for c in fake.calls if c[:1] == ["ssh"]]
    assert result["prompt"] == PLACE


def test_start_fetches_the_served_step_from_the_compute_host_before_serving(config):
    result, fake, log = start(config)
    calls = [" ".join(c) for c in fake.calls]
    refresh = next(i for i, c in enumerate(calls) if c.startswith("rsync") and "--info=name1" not in c)
    fetch = next(i for i, c in enumerate(calls) if "--info=name1" in c)
    up = next(i for i, c in enumerate(calls) if " up -d openpi" in c)
    assert refresh < fetch < up
    assert f"compute_alias:{WORKDIR}/src/openpi/checkpoints/{CFG}/{EXP}/" in calls[refresh]
    assert "--exclude=params/" in calls[refresh]  # metadata only
    assert f"compute_alias:{WORKDIR}/src/openpi/checkpoints/{CFG}/{EXP}/29999/" in calls[fetch]
    assert "--exclude=train_state/" in calls[fetch] and "--exclude=params/" not in calls[fetch]
    assert (step_dir(config) / serving.FETCHED).is_file()
    assert "checkpoint 29999 fetched: 2 files" in log.text()
    assert result["step"] == 29999


def test_a_fetched_step_is_not_copied_again(config):
    (step_dir(config) / "params").mkdir()
    (step_dir(config) / serving.FETCHED).write_text("done\n")
    _, fake, _ = start(config)
    assert not fake.commands("--info=name1")


def test_a_failed_fetch_stops_before_openpi_serve_and_leaves_no_marker(config):
    chain = FakeChain()
    with pytest.raises(StepFailed, match="rsync exit 23.*start again to resume"):
        start(config, chain, runner_for(config, chain, fetch_code=23))
    assert not (step_dir(config) / serving.FETCHED).exists()
    assert not chain.serve_running


def test_a_remote_step_without_params_fails(config):
    chain = FakeChain()
    with pytest.raises(StepFailed, match="has no params/"):
        start(config, chain, runner_for(config, chain, write_params=False))


def test_dry_run_reports_the_fetch_but_copies_nothing(config):
    result, fake, _ = start(config, dry_run=True)
    assert result["dry_run"] is True and result["fetch"] is True
    assert not fake.commands("--info=name1")


def test_empty_compose_files_are_optional_overlays(config):
    argv = serving.compose_argv(config.serving, "up", "-d", "openpi")
    assert argv.count("-f") == 2 and argv[argv.index("--project-directory") + 1] == "/x/openpi"


def test_linkcheck_on_one_host_skips_the_network_checks(config):
    chain = FakeChain()
    fake = chain.runner()
    robot = Robot(config.remote, config.serving, fake)
    checks = {c.name: c for c in linkcheck.run_checks(config, fake, robot=robot, only=("pika", "link"))}
    for name in ("wifi_load", "bulk_throughput", "ping"):
        assert checks[name].ok and checks[name].value == "same host"
    assert not fake.commands("/sys/class/net") and not fake.commands("ping -q") and not fake.commands("PIPE")


def test_status_without_nvidia_smi_still_reports(config):
    chain = FakeChain()
    fake = chain.runner()
    real_run = fake.run

    def run(argv, **kwargs):
        if argv[:1] == ["nvidia-smi"]:
            raise FileNotFoundError("nvidia-smi")
        return real_run(argv, **kwargs)

    fake.run = run
    data = serving.status(config, fake)
    assert data["gpu"] == {"index": 0}
    assert "bridge" in data
