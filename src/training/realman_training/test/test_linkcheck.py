from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from robot_fakes import PLACE, SERVER_ADDR, FakeChain

from realman_training import linkcheck, serving_state
from realman_training.config import load_config


@pytest.fixture()
def config(tmp_path):
    path = tmp_path / "console.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n")
    return load_config(path)


class Clock:
    """Advances 0.5 s per call: 16 MiB in 1 MiB chunks -> enough samples for a stable rate."""

    def __init__(self, step=0.5):
        self.t, self.step = 0.0, step

    def __call__(self):
        self.t += self.step
        return self.t


def bulk(chain_runner, total=16 << 20, chunk=1 << 20):
    def pipe(producer, consumer, on_bytes):
        sent = 0
        while sent < total:
            sent += chunk
            on_bytes(sent)
        return sent

    chain_runner.pipe_impl = pipe
    return chain_runner


def by_name(checks):
    return {c.name: c for c in checks}


def test_a_healthy_chain_passes_every_check(config):
    chain = FakeChain()
    fake = bulk(chain.runner())
    checks = linkcheck.run_checks(config, fake, clock=Clock(), expected_prompt=PLACE)
    assert [c.item for c in checks] == ["pika", "pika", "link", "link", "inference", "bridge", "bridge", "bridge"]
    assert all(c.ok for c in checks), [c.to_dict() for c in checks if not c.ok]
    named = by_name(checks)
    assert named["wifi_load"].value == "200.0 KB/s on wlx0" and named["wifi_load"].threshold == "< 600 KB/s"
    assert named["bulk_throughput"].threshold == ">= 2.0 MB/s"
    # 15 MiB after the first sample in 15 clock steps of 0.5 s -> ~2.1 MB/s
    assert named["bulk_throughput"].value.endswith("MB/s")
    assert named["inference_round_trip"].value.startswith("median 99.0 ms")


def test_the_pika_locator_fails_the_interference_item(config):
    chain = FakeChain()
    chain.nodes = ["/pika_double_locator", "/pika_teleop_publisher", "/r/realman_driver"]
    chain.wifi = "wlx0 13000000"  # 2600 KB/s over 5 s
    named = by_name(linkcheck.run_checks(config, bulk(chain.runner()), clock=Clock(), only=["pika"]))
    assert not named["pika_nodes"].ok and "pika_double_locator" in named["pika_nodes"].value
    assert not named["wifi_load"].ok and named["wifi_load"].value.startswith("2600.0 KB/s")


def test_no_wifi_interface_is_not_a_failure(config):
    chain = FakeChain()
    chain.wifi = "none"
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["pika"]))
    assert named["wifi_load"].ok and named["wifi_load"].value == "no Wi-Fi interface"


def test_slow_bulk_and_lossy_ping_fail_the_link_item(config):
    chain = FakeChain()
    chain.ping = "10 packets transmitted, 9 received, 10% packet loss, time 1800ms\nrtt min/avg/max/mdev = 3.1/80.0/200.5/4.0 ms"
    fake = bulk(chain.runner())
    named = by_name(linkcheck.run_checks(config, fake, clock=Clock(step=5.0), only=["link"]))
    assert not named["bulk_throughput"].ok  # 15 MiB in 75 s
    assert not named["ping"].ok and named["ping"].value == "avg 80.0 ms, loss 10%"
    ping = fake.commands("ping -q")[0][-1]
    assert f"-s 1400 {SERVER_ADDR}" in ping
    producer = fake.commands("PIPE")[0]
    assert "head -c 16777216 /dev/urandom" in producer


def test_slow_inference_fails_and_the_first_round_is_not_judged(config):
    chain = FakeChain()
    chain.infer_ms = [30000.0, 250.0, 260.0, 240.0, 300.0, 255.0]
    fake = chain.runner()
    named = by_name(linkcheck.run_checks(config, fake, only=["inference"]))
    check = named["inference_round_trip"]
    assert not check.ok and check.value.startswith("median 255.0 ms") and check.threshold == "< 200 ms"
    command = fake.commands("python3 - ")[-1][-1]
    assert command.startswith("docker exec -i realman_pi-policy_bridge-1 ")
    assert f"python3 - {SERVER_ADDR} 18000 6 " in command


def test_inference_needs_the_bridge_container(config):
    chain = FakeChain()
    chain.bridge_running = False
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["inference"]))
    assert not named["inference_round_trip"].ok and "not running" in named["inference_round_trip"].detail


def test_bridge_health_judges_prompt_pause_and_errors(config):
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "1.0", "allow_publish": "0.0", "infer_error": "3"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"], expected_prompt=PLACE))
    assert not named["bridge_prompt"].ok and named["bridge_prompt"].threshold == f"= {PLACE!r}"
    assert not named["bridge_paused"].ok
    assert not named["bridge_errors"].ok and named["bridge_errors"].value == "infer_error=3"


def test_without_a_serving_record_any_configured_prompt_passes(config):
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "0.0"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"]))
    assert named["bridge_prompt"].ok


def test_the_serving_record_gives_the_expected_prompt(config):
    serving_state.save(config, {"prompt": PLACE, "port": 18000})
    chain = FakeChain()
    chain.stats = {"prompt": "pick up the power adapter", "paused": "0.0"}
    named = by_name(linkcheck.run_checks(config, chain.runner(), only=["bridge"]))
    assert not named["bridge_prompt"].ok


def test_an_unreachable_robot_fails_every_item_with_the_reason(config):
    chain = FakeChain()
    chain.unreachable = True
    checks = linkcheck.run_checks(config, chain.runner())
    assert {c.item for c in checks} == set(linkcheck.ITEMS)
    assert not any(c.ok for c in checks)
    assert all("unreachable" in c.detail for c in checks)


def test_run_checks_leaves_no_private_ip_in_history(config):
    chain = FakeChain()
    fake = bulk(chain.runner())
    checks = linkcheck.run_checks(config, fake, clock=Clock(), expected_prompt=PLACE)
    history = linkcheck.save_history(config, checks)
    text = history.read_text(encoding="utf-8")
    assert SERVER_ADDR not in text, f"IP found in history: {text}"
    for c in checks:
        assert SERVER_ADDR not in c.value, f"IP in check value: {c}"
        assert SERVER_ADDR not in c.detail, f"IP in check detail: {c}"


def test_a_silent_ping_keeps_its_output_but_not_the_address(config):
    chain = FakeChain()
    chain.ping = f"PING {SERVER_ADDR} ({SERVER_ADDR}) 1400(1428) bytes of data.\n--- ping statistics ---"
    named = by_name(linkcheck.run_checks(config, bulk(chain.runner()), clock=Clock(), only=["link"]))
    assert not named["ping"].ok and "ping statistics" in named["ping"].detail
    assert SERVER_ADDR not in named["ping"].detail


def test_the_job_entry_logs_a_table_and_keeps_history(config, monkeypatch):
    chain = FakeChain()
    monkeypatch.setattr(linkcheck, "Runner", lambda: bulk(chain.runner()))
    log = RecordingLog()
    result = linkcheck.run({"config": str(config.source), "only": ["bridge"]}, log)
    assert result["ok"] is True and len(result["checks"]) == 3
    saved = json.loads(open(result["history"], encoding="utf-8").read())
    assert saved["checks"] == result["checks"]
    assert "PASS  bridge_prompt" in log.text()
