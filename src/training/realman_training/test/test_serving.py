from __future__ import annotations

import json

import pytest
from fake_runner import FakeRunner, RecordingLog
from robot_fakes import PLACE, SERVER_ADDR, SERVE_CONTAINER, FakeChain

from realman_training import serving, serving_state
from realman_training.config import load_config
from realman_training.jobs import StepFailed
from realman_training.linkcheck import Check

PICK = "pick up the power adapter"
CFG, EXP = "pi05_realman_multitask_action_only", "m_multitask_b16_2gpu"


@pytest.fixture()
def config(tmp_path):
    docker_data = tmp_path / "openpi-docker-data"
    folder = docker_data / "checkpoints" / CFG / EXP
    for step in ("10000", "29999", "20000"):
        (folder / step).mkdir(parents=True)
    (folder / "model_card.json").write_text(json.dumps({"tasks": {
        "pick_and_place": {"prompt": PLACE, "count": 114}, "pick_only": {"prompt": PICK, "count": 103}}}))
    path = tmp_path / "console.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n  openpi:\n    docker_data: {docker_data}\n")
    return load_config(path)


def params(config, **extra):
    return {"config": str(config.source), "action": "start", **extra}


class Port:
    """Closed for the first `closed` polls, then open."""

    def __init__(self, closed=2):
        self.closed, self.polls = closed, 0

    def __call__(self, port, host="127.0.0.1", timeout=1.0):
        self.polls += 1
        return self.polls > self.closed + 1  # the first call is the "already in use?" check


def ok_checks(*args, **kwargs):
    return [Check("pika", "pika_nodes", True, "0", "0")]


def start(config, chain, **kw):
    fake = chain.runner()
    log = RecordingLog()
    result = serving.start(params(config, **kw), log, fake, port_open=Port(), sleep=lambda s: None,
                           clock=iter(range(10_000)).__next__, checks=ok_checks)
    return result, fake, log


def index(fake, needle):
    for i, call in enumerate(fake.calls):
        if needle in " ".join(call):
            return i
    raise AssertionError(f"no call with {needle!r}: {fake.calls}")


def test_resolve_model_takes_the_latest_checkpoint_and_the_card_prompts(config):
    model = serving.resolve_model(config, None, None)
    assert (model.config_name, model.exp, model.step) == (CFG, EXP, 29999)
    assert model.checkpoint == f"checkpoints/{CFG}/{EXP}/29999"
    assert model.prompts == {"pick_and_place": PLACE, "pick_only": PICK}
    assert serving.resolve_model(config, f"{CFG}/{EXP}", "10000").step == 10000


def test_resolve_model_refuses_unknown_runs_and_checkpoints(config):
    with pytest.raises(StepFailed, match="no run"):
        serving.resolve_model(config, f"{CFG}/nope", None)
    with pytest.raises(StepFailed, match="checkpoint 5 .*10000, 20000, 29999"):
        serving.resolve_model(config, None, 5)


def test_prompts_fall_back_to_the_view_contract(config, tmp_path):
    folder = config.openpi.docker_data / "checkpoints" / CFG / EXP
    (folder / "model_card.json").unlink()
    view = tmp_path / "view"
    view.mkdir()
    (view / "contract.json").write_text(json.dumps({"prompts": {"pick_only": PICK}}))
    (folder / "console_train.json").write_text(json.dumps({"view": str(view)}))
    assert serving.model_prompts(folder) == {"pick_only": PICK}
    (folder / "console_train.json").unlink()
    with pytest.raises(StepFailed, match="no task prompts"):
        serving.resolve_model(config, None, None)


def test_start_runs_the_chain_in_order(config):
    chain = FakeChain()
    result, fake, log = start(config, chain)
    mode = index(fake, "mode=")
    up = index(fake, "compose.serve.yaml up -d openpi")
    running = index(fake, "{{.State.Running}}")
    warm = index(fake, "uv run --no-sync python - ")
    bridge = index(fake, "docker compose up -d --no-deps --no-build policy_bridge")
    prompt = index(fake, "prompt=")
    assert mode < up < running < warm < bridge < prompt
    env = fake.envs[up]
    assert env["SERVE_CONFIG"] == CFG and env["SERVE_CHECKPOINT"] == f"checkpoints/{CFG}/{EXP}/29999"
    assert env["SERVE_GPU"] == "2" and env["OPENPI_POLICY_PORT"] == "18000"
    assert env["OPENPI_COMPOSE_PROJECT_NAME"] == "openpi-serve"
    assert f"POLICY_WS_HOST={SERVER_ADDR} " in fake.calls[bridge][-1]
    warm_cmd = fake.calls[warm][-1]
    assert fake.calls[warm][:4] == ["docker", "exec", "-i", SERVE_CONTAINER]
    assert "127.0.0.1 8000 2 " in warm_cmd and PLACE in warm_cmd
    assert result["warmup_ms"] == [900.0, 95.0] and result["prompt"] == PLACE and result["linkcheck_ok"] is True
    record = serving_state.load(config)
    assert record["prompt"] == PLACE and record["step"] == 29999 and record["gpu"] == 2
    assert not any("./rm65" in " ".join(c) or "rm65 up" in " ".join(c) for c in fake.calls)
    assert "/policy/activate" not in " ".join(" ".join(c) for c in fake.calls)


def test_start_with_a_task_uses_its_prompt(config):
    result, fake, _ = start(config, FakeChain(), task="pick_only")
    assert result["prompt"] == PICK
    assert PICK in fake.calls[index(fake, "prompt=")][-1]


def test_start_refuses_a_task_the_model_does_not_know(config):
    with pytest.raises(StepFailed, match="task 'stack'.*pick_and_place, pick_only"):
        start(config, FakeChain(), task="stack")


@pytest.mark.parametrize("field", ["active_mode", "selected_mode", "requested_mode"])
def test_start_refuses_while_the_bt_is_in_policy_mode(config, field):
    chain = FakeChain()
    chain.mode[field] = "policy"
    with pytest.raises(StepFailed, match="behaviour tree is in policy mode"):
        start(config, chain)


def test_start_and_stop_refuse_when_the_bt_mode_is_unknown(config):
    chain = FakeChain()
    chain.mode = {"unknown": True, "detail": "realman_bt_executor is running but sent no input_mode_state"}
    with pytest.raises(StepFailed, match="cannot tell the behaviour tree's mode"):
        start(config, chain)
    with pytest.raises(StepFailed, match="cannot tell"):
        serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), chain.runner())


def test_no_executor_on_the_graph_is_not_a_refusal(config):
    chain = FakeChain()
    chain.mode = None
    result, _, log = start(config, chain)
    assert "behaviour tree is not running" in log.text() and result["prompt"] == PLACE


def test_start_refuses_a_gpu_held_by_someone_else(config):
    chain = FakeChain()
    chain.gpu_used_mib = 16000
    with pytest.raises(StepFailed, match="GPU 2 .*16000 MiB"):
        start(config, chain)


def test_start_refuses_a_port_the_bridge_does_not_use(config):
    chain = FakeChain()
    chain.bridge_port = 18000
    with pytest.raises(StepFailed, match="server_port 18000"):
        start(config, chain, port=18001)


def test_start_refuses_when_serve_is_already_running(config):
    chain = FakeChain()
    chain.serve_running = True
    with pytest.raises(StepFailed, match="already running"):
        start(config, chain)


def test_start_refuses_a_port_in_use(config):
    fake = FakeChain().runner()
    with pytest.raises(StepFailed, match="port 18000 is already in use"):
        serving.start(params(config), RecordingLog(), fake, port_open=lambda *a, **k: True, sleep=lambda s: None,
                      clock=iter(range(100)).__next__, checks=ok_checks)


def test_refusals_happen_before_anything_starts(config):
    chain = FakeChain()
    chain.gpu_used_mib = 16000
    fake = chain.runner()
    with pytest.raises(StepFailed):
        serving.start(params(config), RecordingLog(), fake, port_open=Port(), sleep=lambda s: None,
                      clock=iter(range(100)).__next__, checks=ok_checks)
    assert not fake.commands(" up -d")


def test_dry_run_checks_but_starts_nothing(config):
    result, fake, _ = start(config, FakeChain(), dry_run=True)
    assert result["dry_run"] is True
    assert "up -d openpi" in " ".join(result["serve_command"])
    assert "policy_bridge" in result["bridge_command"]
    assert not fake.commands(" up -d") and not serving_state.load(config)


def test_a_serve_container_that_dies_while_loading_fails_with_its_logs(config):
    chain = FakeChain()
    chain.serve_dies = True
    chain.serve_logs = "libEGL_nvidia.so.580.173.02: no such file"
    fake = chain.runner()
    with pytest.raises(StepFailed, match="exited while loading.*libEGL"):
        serving.start(params(config), RecordingLog(), fake, port_open=lambda *a, **k: False, sleep=lambda s: None,
                      clock=iter(range(10_000)).__next__, checks=ok_checks)
    assert not fake.commands("policy_bridge up") and not fake.commands("--no-deps")


def test_a_bridge_that_does_not_confirm_the_prompt_fails(config):
    chain = FakeChain()
    chain.prompt_confirmed = False
    with pytest.raises(StepFailed, match="did not confirm the prompt"):
        start(config, chain)


def test_a_publishing_bridge_after_start_fails(config):
    chain = FakeChain()
    chain.stats = {**chain.stats, "allow_publish": "1.0"}
    with pytest.raises(StepFailed, match="allow_publish"):
        start(config, chain)


def test_failed_linkchecks_do_not_fail_the_start(config):
    chain = FakeChain()
    fake = chain.runner()
    log = RecordingLog()
    bad = lambda *a, **k: [Check("link", "bulk_throughput", False, "0.1 MB/s", ">= 2 MB/s")]  # noqa: E731
    result = serving.start(params(config), log, fake, port_open=Port(), sleep=lambda s: None,
                           clock=iter(range(10_000)).__next__, checks=bad)
    assert result["linkcheck_ok"] is False and "FAIL  bulk_throughput" in log.text()


def test_stop_refuses_in_policy_mode(config):
    chain = FakeChain()
    chain.mode["active_mode"] = "policy"
    fake = chain.runner()
    with pytest.raises(StepFailed, match="behaviour tree is in policy mode"):
        serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    assert not fake.commands("docker stop") and not fake.commands("compose stop")


def test_stop_stops_the_bridge_first(config):
    chain = FakeChain()
    chain.serve_running = True
    serving_state.save(config, {"prompt": PLACE})
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    bridge = index(fake, "docker compose stop policy_bridge")
    serve = index(fake, f"docker stop -t 30 {SERVE_CONTAINER}")
    assert bridge < serve < index(fake, f"docker rm {SERVE_CONTAINER}")
    assert result == {"bridge": "stopped", "serve": "stopped"}
    assert serving_state.load(config)["stopped"]


def test_stop_with_nothing_running(config):
    chain = FakeChain()
    chain.bridge_running = False
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop"}, RecordingLog(), fake)
    assert result == {"bridge": "not running", "serve": "not running"}
    assert not fake.commands("docker stop") and not fake.commands("compose stop")


def test_stop_dry_run_only_checks(config):
    chain = FakeChain()
    chain.serve_running = True
    fake = chain.runner()
    result = serving.stop({"config": str(config.source), "action": "stop", "dry_run": True}, RecordingLog(), fake)
    assert result["dry_run"] is True and not fake.commands("docker stop") and not fake.commands("compose stop")


def test_status_reports_both_ends(config):
    chain = FakeChain()
    chain.serve_running = True
    serving_state.save(config, {"model": f"{CFG}/{EXP}", "step": 29999, "gpu": 2, "port": 18000, "prompt": PLACE})
    data = serving.status(config, chain.runner())
    assert data["serve"]["running"] is True and data["serve"]["image"] == "img:tag"
    assert data["gpu"] == {"index": 2, "used_mib": 500, "total_mib": 32607}
    assert data["bridge"]["running"] is True and data["bridge"]["server"] == "set"
    assert data["bridge"]["prompt"] == PLACE and data["bridge"]["paused"] == "0.0"
    assert data["bt_mode"]["active_mode"] == "none"
    assert data["record"]["step"] == 29999


def test_status_survives_an_unreachable_robot(config):
    chain = FakeChain()
    chain.unreachable = True
    data = serving.status(config, chain.runner())
    assert "unreachable" in data["bridge"]["error"]
    assert data["serve"] == {"running": False}


def test_start_leaves_no_private_ip_in_logs_or_state(config):
    chain = FakeChain()
    result, fake, log = start(config, chain)
    assert SERVER_ADDR not in log.text(), f"IP in log: {[l for l in log.lines if SERVER_ADDR in l]}"
    record_text = (config.console_dir / "serving.json").read_text(encoding="utf-8")
    assert SERVER_ADDR not in record_text, f"IP in serving.json: {record_text}"
    history_dir = config.console_dir / "linkcheck"
    for f in history_dir.glob("*.json"):
        text = f.read_text(encoding="utf-8")
        assert SERVER_ADDR not in text, f"IP in history: {text}"


def test_dry_run_leaves_no_private_ip(config):
    result, fake, log = start(config, FakeChain(), dry_run=True)
    result_str = json.dumps(result)
    assert SERVER_ADDR not in result_str, f"IP in dry_run result: {result_str}"
    assert SERVER_ADDR not in log.text(), f"IP in log: {log.text()}"
    assert "server" not in result, "dry_run result must not include a 'server' key"


def test_status_leaves_no_private_ip(config):
    chain = FakeChain()
    chain.serve_running = True
    serving_state.save(config, {"model": f"{CFG}/{EXP}", "step": 29999, "gpu": 2})
    data = serving.status(config, chain.runner())
    data_str = json.dumps(data)
    assert SERVER_ADDR not in data_str, f"IP in status: {data_str}"


def test_start_re_guards_bt_after_warmup(config):
    """BT mode flips to policy between warm-up and the bridge command; start must detect it."""
    chain = FakeChain()
    chain.mode_after_warmup = {"requested_mode": "policy", "selected_mode": "policy",
                               "active_mode": "policy", "phase": 0, "detail": ""}
    fake = chain.runner()
    log = RecordingLog()
    with pytest.raises(StepFailed, match="behaviour tree is in policy mode"):
        serving.start(params(config), log, fake, port_open=Port(), sleep=lambda s: None,
                      clock=iter(range(10_000)).__next__, checks=ok_checks)
    assert not fake.commands("--no-deps"), "bridge compose command must not have been sent"


@pytest.mark.parametrize("ap_value", [None, ""])
def test_start_fails_on_missing_allow_publish(config, ap_value):
    chain = FakeChain()
    chain.stats = {**chain.stats, "allow_publish": ap_value}
    with pytest.raises(StepFailed, match="allow_publish"):
        start(config, chain)


def test_start_fails_on_non_numeric_allow_publish(config):
    chain = FakeChain()
    chain.stats = {**chain.stats, "allow_publish": "yes"}
    with pytest.raises(StepFailed, match="allow_publish"):
        start(config, chain)


def test_start_fails_when_warmup_prints_no_json(config):
    chain = FakeChain()
    fake = FakeRunner()
    fake.on("uv run --no-sync python - ", stdout="ERROR: something failed\n")
    for rule in chain.runner()._rules:
        if "uv run" not in rule[0]:
            fake._rules.append(rule)
    with pytest.raises(StepFailed, match="warm-up printed no result"):
        serving.start(params(config), RecordingLog(), fake, port_open=Port(), sleep=lambda s: None,
                      clock=iter(range(10_000)).__next__, checks=ok_checks)


def test_status_survives_nvidia_smi_na(config):
    chain = FakeChain()
    chain.serve_running = True
    chain.gpu_used_mib = "[N/A]"  # causes int() to fail if not handled
    serving_state.save(config, {"model": f"{CFG}/{EXP}", "gpu": 2})
    data = serving.status(config, chain.runner())
    assert "used_mib" not in data["gpu"], "gpu memory must be omitted when smi returns [N/A]"
    assert data["gpu"]["index"] == 2


def test_run_dispatches_on_action(config, monkeypatch):
    seen = []
    monkeypatch.setattr(serving, "stop", lambda p, log, runner=None: seen.append(p["action"]) or {})
    serving.run({"action": "stop"}, RecordingLog())
    assert seen == ["stop"]
    with pytest.raises(StepFailed, match="action"):
        serving.run({"action": "restart"}, RecordingLog())
