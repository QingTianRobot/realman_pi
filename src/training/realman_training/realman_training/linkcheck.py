"""The four data-path checks between realman_ts and server5090, each pass/fail + value + threshold.

1 pika:      pika_* nodes on the robot graph (the Pika locator floods the Wi-Fi with small DDS packets) and the
             Wi-Fi interface's bytes/s over a window.
2 link:      bulk throughput realman_ts -> server5090 (over ssh, timed from the first received chunk) and a ping
             with large packets (small pings pass even when bulk TCP has collapsed).
3 inference: real-size requests from inside the policy_bridge container to the address and port it uses.
4 bridge:    /policy/stats: prompt = the served task's prompt, paused = 0, no error counters.
An item that cannot run fails with the reason; the others still run. Thresholds: linkcheck section of the config.
"""

from __future__ import annotations

import dataclasses
import datetime
import json
import re
import shlex
import statistics
import time
from pathlib import Path

from . import serving_state
from .config import ConsoleConfig, load_config
from .jobs import StepFailed, now, write_json
from .robot import Robot, redact, script
from .runner import CommandFailed, Runner

ITEMS = ("pika", "link", "inference", "bridge")
_NAMES = {
    "pika": ("pika_nodes", "wifi_load"),
    "link": ("bulk_throughput", "ping"),
    "inference": ("inference_round_trip",),
    "bridge": ("bridge_prompt", "bridge_paused", "bridge_errors"),
}


@dataclasses.dataclass(frozen=True)
class Check:
    item: str
    name: str
    ok: bool
    value: str
    threshold: str
    detail: str = ""

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


def _pika(robot: Robot, config: ConsoleConfig) -> list[Check]:
    lc = config.linkcheck
    nodes = robot.ros_probe("nodes")["nodes"]
    pika = [n for n in nodes if n.rsplit("/", 1)[-1].startswith(lc.pika_node_prefix)]
    shown = ", ".join(n.rsplit("/", 1)[-1] for n in pika[:5]) + (" …" if len(pika) > 5 else "")
    checks = [Check("pika", "pika_nodes", not pika, f"{len(pika)}" + (f" ({shown})" if pika else ""), "0",
                    "stop the Pika stack on the teleop PC before a policy run" if pika else "")]
    iface = shlex.quote(lc.wifi_interface)
    window = f"{lc.wifi_window_sec:g}"
    command = (
        f"i={iface}; [ -n \"$i\" ] || i=$(ls /sys/class/net | grep '^wl' | head -n1); "
        "[ -n \"$i\" ] || { echo none; exit 0; }; s=/sys/class/net/$i/statistics; "
        "a=$(( $(cat $s/rx_bytes) + $(cat $s/tx_bytes) )); "
        f"sleep {window}; "
        "b=$(( $(cat $s/rx_bytes) + $(cat $s/tx_bytes) )); echo \"$i $((b - a))\""
    )
    out = robot.check(command, timeout=lc.wifi_window_sec + 30).split()
    threshold = f"< {lc.wifi_max_kb_per_sec:g} KB/s"
    if out[:1] == ["none"]:
        checks.append(Check("pika", "wifi_load", True, "no Wi-Fi interface", threshold))
    else:
        rate = int(out[1]) / lc.wifi_window_sec / 1000
        checks.append(Check("pika", "wifi_load", rate < lc.wifi_max_kb_per_sec, f"{rate:.1f} KB/s on {out[0]}", threshold))
    return checks


def _link(robot: Robot, config: ConsoleConfig, runner: Runner, clock) -> list[Check]:
    lc = config.linkcheck
    server = robot.server_address()  # first: an unreachable robot fails here, before the transfer
    samples: list[tuple[float, int]] = []
    producer = robot.ssh_argv(f"head -c {lc.bulk_bytes} /dev/urandom")
    try:
        runner.pipe(producer, ["sh", "-c", "cat > /dev/null"], lambda total: samples.append((clock(), total)))
    except CommandFailed as error:
        raise StepFailed(f"bulk transfer failed: {error}") from None
    threshold = f">= {lc.bulk_min_mb_per_sec:.1f} MB/s"
    if len(samples) < 2 or samples[-1][0] <= samples[0][0]:
        bulk = Check("link", "bulk_throughput", False, f"{samples[-1][1] if samples else 0} bytes", threshold,
                     "too few samples; raise linkcheck.bulk_bytes")
    else:
        rate = (samples[-1][1] - samples[0][1]) / (samples[-1][0] - samples[0][0]) / 1e6
        bulk = Check("link", "bulk_throughput", rate >= lc.bulk_min_mb_per_sec, f"{rate:.2f} MB/s", threshold)
    out = robot.run(f"ping -q -c {lc.ping_count} -i 0.2 -s {lc.ping_size} {shlex.quote(server)}",
                    timeout=lc.ping_count * 2 + 20).stdout
    loss = re.search(r"([\d.]+)% packet loss", out)
    avg = re.search(r"= [\d.]+/([\d.]+)/", out)
    threshold = f"avg <= {lc.ping_max_avg_ms:g} ms, loss <= {lc.ping_max_loss_pct:g}%"
    if not loss:
        ping = Check("link", "ping", False, "no reply", threshold, out.strip()[-200:])
    else:
        loss_pct = float(loss.group(1))
        avg_ms = float(avg.group(1)) if avg else float("inf")
        ok = loss_pct <= lc.ping_max_loss_pct and avg_ms <= lc.ping_max_avg_ms
        ping = Check("link", "ping", ok, f"avg {avg_ms:.1f} ms, loss {loss_pct:g}%", threshold, f"{lc.ping_size}-byte packets")
    return [bulk, ping]


def _inference(robot: Robot, config: ConsoleConfig, prompt: str) -> list[Check]:
    lc, sc = config.linkcheck, config.serving
    threshold = f"< {lc.infer_max_ms:g} ms"
    bridge = robot.container(sc.bridge_container)
    if not bridge or not bridge["running"]:
        return [Check("inference", "inference_round_trip", False, "-", threshold, f"{sc.bridge_container} is not running")]
    host = bridge["env"].get("POLICY_WS_HOST") or robot.server_address()
    port = robot.bridge_port()
    args = shlex.join([host, str(port), str(lc.infer_rounds + 1), prompt])
    out = robot.check(robot.in_container(sc.bridge_container, f"python3 - {args}"), input=script("infer_probe"),
                      timeout=120 + lc.infer_rounds * 10)
    json_lines = [line for line in out.splitlines() if line.startswith("{")]
    if not json_lines:
        raise StepFailed(f"inference probe printed no result: {out.strip()[-300:]}")
    data = json.loads(json_lines[-1])
    timed = data["ms"][1:]
    median = statistics.median(timed)
    value = f"median {median:.1f} ms (max {max(timed):.1f}, first {data['ms'][0]:.1f})"
    return [Check("inference", "inference_round_trip", median < lc.infer_max_ms, value, threshold,
                  f"<POLICY_WS_HOST>:{port}")]


def _bridge(robot: Robot, config: ConsoleConfig, expected: str | None) -> list[Check]:
    stats = robot.bridge_stats(config.linkcheck.stats_timeout_sec)
    if stats is None:
        return [Check("bridge", name, False, "-", "", f"no /policy/stats within {config.linkcheck.stats_timeout_sec:g} s")
                for name in _NAMES["bridge"]]
    prompt = stats.get("prompt", "")
    if expected is not None:
        prompt_check = Check("bridge", "bridge_prompt", prompt == expected, repr(prompt), f"= {expected!r}")
    else:
        known = sorted(config.prompts.values())
        prompt_check = Check("bridge", "bridge_prompt", prompt in known, repr(prompt), "one of the configured prompts",
                             "no serving record: start the chain with `realman-train serve start` to pin the task")
    paused = float(stats.get("paused", "0") or 0)
    errors = {k: v for k, v in stats.items() if ("error" in k or "fail" in k) and _number(v)}
    return [
        prompt_check,
        Check("bridge", "bridge_paused", paused == 0, f"{paused:g}", "= 0",
              "paused after repeated inference failures; /policy/activate resumes it" if paused else ""),
        Check("bridge", "bridge_errors", not errors, ", ".join(f"{k}={v}" for k, v in sorted(errors.items())) or "0", "= 0"),
    ]


def _number(value: str) -> bool:
    try:
        return float(value) != 0
    except ValueError:
        return False


def run_checks(config: ConsoleConfig, runner: Runner | None = None, *, robot: Robot | None = None, only=None,
               clock=time.monotonic, expected_prompt: str | None = None) -> list[Check]:
    runner = runner or Runner()
    robot = robot or Robot(config.remote, config.serving, runner)
    state = serving_state.load(config)
    expected = expected_prompt if expected_prompt is not None else state.get("prompt")
    probe_prompt = expected or next(iter(config.prompts.values()), "")
    groups = {
        "pika": lambda: _pika(robot, config),
        "link": lambda: _link(robot, config, runner, clock),
        "inference": lambda: _inference(robot, config, probe_prompt),
        "bridge": lambda: _bridge(robot, config, expected),
    }
    checks: list[Check] = []
    for item in only or ITEMS:
        try:
            checks += groups[item]()
        except (StepFailed, CommandFailed, ValueError, KeyError, IndexError) as error:
            checks += [Check(item, name, False, "error", "", str(error)) for name in _NAMES[item]]
    # Results are logged and kept as history: no addresses (ping's own output names the server).
    return [dataclasses.replace(c, value=redact(c.value), detail=redact(c.detail)) for c in checks]


def format_table(checks: list[Check]) -> list[str]:
    lines = []
    for c in checks:
        line = f"{'PASS' if c.ok else 'FAIL'}  {c.name:22} {c.value:40} {c.threshold}"
        lines.append(line + (f"  ({c.detail})" if c.detail else ""))
    return lines


def save_history(config: ConsoleConfig, checks: list[Check]) -> Path:
    folder = config.console_dir / "linkcheck"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{datetime.datetime.now():%Y%m%d-%H%M%S-%f}.json"
    write_json(target, {"at": now(), "ok": all(c.ok for c in checks), "checks": [c.to_dict() for c in checks]})
    return target


def run(params: dict, log, runner: Runner | None = None) -> dict:
    config = load_config(params.get("config"))
    checks = run_checks(config, runner or Runner(), only=params.get("only"))
    for line in format_table(checks):
        log(line)
    history = save_history(config, checks)
    return {"ok": all(c.ok for c in checks), "checks": [c.to_dict() for c in checks], "history": str(history)}
