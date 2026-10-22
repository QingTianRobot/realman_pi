"""Start, stop and inspect the inference chain: openpi-serve on server5090 and policy_bridge on realman_ts.

start: refuse while the behaviour tree is in a policy mode, a GPU held by someone else, a port already in use or one
the robot's policy_bridge.yaml does not use, and a serve container that already runs; `docker compose up -d` the serve
project with SERVE_CONFIG/SERVE_CHECKPOINT/SERVE_GPU/OPENPI_POLICY_PORT; wait for the port; warm up (the first
inference after a restart JIT-compiles ~26 s and would make the bridge time out and pause); then
`docker compose up -d --no-deps --no-build policy_bridge` on realman_ts pointed at this server (never ./rm65, never
bringup or the behaviour tree), set the model's task prompt, check the bridge is not publishing, run the link checks.
stop: refuse while the behaviour tree is in a policy mode; stop the bridge first, then openpi-serve.
Nothing here activates the bridge: motion still needs the behaviour tree and /policy/activate.
"""

from __future__ import annotations

import dataclasses
import json
import os
import re
import shlex
import socket
import time
from pathlib import Path

from . import linkcheck, serving_state
from .config import ConsoleConfig, ServingConfig, load_config
from .jobs import StepFailed, now
from .openpi import CONTAINER_PREFIX, busy_gpus, check_name, run_dir
from .robot import Robot, container_facts, redact, script
from .runner import CommandFailed, Runner


@dataclasses.dataclass(frozen=True)
class Model:
    config_name: str
    exp: str
    step: int
    run_dir: Path
    checkpoint: str  # relative to the openpi docker data dir, as SERVE_CHECKPOINT wants it
    prompts: dict[str, str]

    @property
    def name(self) -> str:
        return f"{self.config_name}/{self.exp}"


def model_prompts(folder: Path) -> dict[str, str]:
    """Task -> prompt of a run: its model_card.json, else the contract.json of the view it was trained on."""
    card = folder / "model_card.json"
    if card.is_file():
        data = json.loads(card.read_text(encoding="utf-8"))
        tasks = data.get("tasks")
        if isinstance(tasks, dict) and all(isinstance(v, dict) and v.get("prompt") for v in tasks.values()) and tasks:
            return {str(t): str(v["prompt"]) for t, v in tasks.items()}
        if isinstance(data.get("prompts"), dict) and data["prompts"]:
            return {str(t): str(p) for t, p in data["prompts"].items()}
    record = folder / "console_train.json"
    if record.is_file():
        view = Path(json.loads(record.read_text(encoding="utf-8")).get("view", ""))
        contract = view / "contract.json"
        if contract.is_file():
            prompts = json.loads(contract.read_text(encoding="utf-8")).get("prompts") or {}
            if prompts:
                return {str(t): str(p) for t, p in prompts.items()}
    return {}


def resolve_model(config: ConsoleConfig, model: str | None, checkpoint: str | int | None) -> Model:
    name = model or config.serving.model
    if name.count("/") != 1:
        raise StepFailed(f"model {name!r}: use <openpi config>/<exp>")
    config_name, exp = name.split("/")
    check_name("config_name", config_name)
    check_name("exp", exp)
    folder = run_dir(config.openpi, config_name, exp)
    if not folder.is_dir():
        raise StepFailed(f"no run {folder}")
    steps = sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())
    if not steps:
        raise StepFailed(f"{folder} has no checkpoints")
    wanted = checkpoint if checkpoint not in (None, "") else config.serving.checkpoint
    step = steps[-1] if wanted in (None, "") else int(wanted)
    if step not in steps:
        raise StepFailed(f"checkpoint {step} is not in {folder}: {', '.join(map(str, steps))}")
    prompts = model_prompts(folder)
    if not prompts:
        raise StepFailed(f"no task prompts known for {name}: register it (model_card.json) or train it with the console")
    return Model(config_name, exp, step, folder, f"checkpoints/{config_name}/{exp}/{step}", prompts)


def serve_container(sc: ServingConfig) -> str:
    return f"{sc.project}-{sc.service}-1"


def compose_argv(sc: ServingConfig, *args: str) -> list[str]:
    files = [Path(f).expanduser() for f in sc.compose_files]
    argv = ["docker", "compose", "-p", sc.project, "--project-directory", str(files[0].parent)]
    for f in files:
        argv += ["-f", str(f)]
    return [*argv, *args]


def serve_env(config: ConsoleConfig, model: Model, gpu: int, port: int) -> dict[str, str]:
    return {
        "OPENPI_COMPOSE_PROJECT_NAME": config.serving.project,
        "OPENPI_DOCKER_DATA_DIR": str(config.openpi.docker_data),
        "OPENPI_DOCKER_IMAGE": config.openpi.image,
        "SERVE_CONFIG": model.config_name,
        "SERVE_CHECKPOINT": model.checkpoint,
        "SERVE_GPU": str(gpu),
        "OPENPI_POLICY_PORT": str(port),
    }


# Where the published serve port is reachable. On the host that is 127.0.0.1; the console container sits on its own
# bridge network, so its compose service sets this to host.docker.internal (extra_hosts: host-gateway).
PROBE_HOST_ENV = "REALMAN_TRAINING_PROBE_HOST"


def probe_host() -> str:
    return os.environ.get(PROBE_HOST_ENV) or "127.0.0.1"


def port_open(port: int, host: str | None = None, timeout: float = 1.0) -> bool:
    host = host or probe_host()
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def container_inspect(runner: Runner, name: str) -> dict | None:
    done = runner.run(["docker", "inspect", name])
    if done.returncode or not done.stdout.strip():
        return None
    data = json.loads(done.stdout)
    return container_facts(data[0]) if data else None


def _guard_bt(robot: Robot, sc: ServingConfig, log) -> dict | None:
    mode = robot.bt_mode()
    if mode is None:
        log("no realman_bt_executor on the ROS graph: the behaviour tree is not running")
        return None
    if mode.get("unknown"):
        raise StepFailed(f"cannot tell the behaviour tree's mode ({mode.get('detail')}); not touching the chain")
    modes = {mode.get(k) for k in ("requested_mode", "selected_mode", "active_mode")}
    if modes & set(sc.policy_modes):
        raise StepFailed(
            f"the behaviour tree is in policy mode (requested {mode.get('requested_mode')!r}, selected "
            f"{mode.get('selected_mode')!r}, active {mode.get('active_mode')!r}): switch it to none first"
            " (./scripts/bt.sh or the web console); the console never changes the BT mode"
        )
    log(f"behaviour tree mode: {mode.get('active_mode') or '-'}")
    return mode


def _pick_prompt(model: Model, task: str | None) -> tuple[str, str]:
    if task is None:
        task = next(iter(model.prompts))
    if task not in model.prompts:
        raise StepFailed(f"task {task!r} is not one of {model.name}'s tasks: {', '.join(model.prompts)}")
    return task, model.prompts[task]


def start(params: dict, log, runner: Runner | None = None, *, port_open=port_open, sleep=time.sleep,
          clock=time.monotonic, checks=linkcheck.run_checks) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    sc = config.serving
    model = resolve_model(config, params.get("model"), params.get("checkpoint"))
    gpu = int(params["gpu"]) if params.get("gpu") is not None else sc.gpu
    port = int(params["port"]) if params.get("port") is not None else sc.port
    task, prompt = _pick_prompt(model, params.get("task"))
    robot = Robot(config.remote, sc, runner)
    container = serve_container(sc)
    log(f"model {model.name} @ {model.step}, GPU {gpu}, port {port}, task {task}: {prompt!r}")

    _guard_bt(robot, sc, log)
    existing = container_inspect(runner, container)
    if existing and existing["running"]:
        raise StepFailed(f"openpi-serve is already running ({container}, started {existing['started']}); stop it first")
    if port_open(port):
        raise StepFailed(f"port {port} is already in use on this host")
    bridge_port = robot.bridge_port()
    if bridge_port != port:
        raise StepFailed(
            f"the robot's {sc.bridge_config} has network.server_port {bridge_port}: serve on {bridge_port}"
            " or change the robot config first"
        )
    busy = busy_gpus(runner, (gpu,), config.openpi.gpu_busy_mib)
    if busy:
        raise StepFailed(f"GPU {gpu} is in use by someone else ({busy[gpu]} MiB); pick a free GPU")
    server = robot.server_address()
    env = serve_env(config, model, gpu, port)
    up = compose_argv(sc, "up", "-d", sc.service)
    bridge_cmd = robot.compose_command("up", "-d", "--no-deps", "--no-build", sc.bridge_service, env={"POLICY_WS_HOST": server})
    log("$ " + " ".join(f"{k}={v}" for k, v in env.items()) + " " + shlex.join(up))
    log(f"$ ssh {config.remote.ssh_host} {redact(bridge_cmd)}")
    if params.get("dry_run"):
        return {"dry_run": True, "serve_command": up, "serve_env": env, "bridge_command": redact(bridge_cmd),
                "model": model.name, "step": model.step, "prompt": prompt}

    try:
        runner.check(up, env=env)
    except CommandFailed as error:
        raise StepFailed(f"openpi-serve did not start: {error}") from None
    deadline = clock() + sc.start_timeout_sec
    while not port_open(port):
        running = runner.run(["docker", "inspect", "-f", "{{.State.Running}}", container]).stdout.strip()
        if running != "true":
            logs = runner.run(["docker", "logs", "--tail", "30", container])
            raise StepFailed(f"{container} exited while loading: {(logs.stdout or logs.stderr).strip()[-1500:]}")
        if clock() > deadline:
            raise StepFailed(f"port {port} not listening after {sc.start_timeout_sec} s; see docker logs {container}")
        log.progress(0, None, "loading the checkpoint")
        sleep(2)
    log(f"port {port} listening; warming up ({sc.warmup_rounds} inferences)")

    inner = sc.container_port or port
    warm_cmd = CONTAINER_PREFIX + "uv run --no-sync python - " + shlex.join(["127.0.0.1", str(inner), str(sc.warmup_rounds), prompt])
    try:
        out = runner.check(["docker", "exec", "-i", container, "zsh", "-lc", warm_cmd], input=script("infer_probe"),
                           timeout=sc.warmup_timeout_sec)
    except CommandFailed as error:
        raise StepFailed(f"warm-up failed: {error}") from None
    warm_lines = [line for line in out.splitlines() if line.startswith("{")]
    if not warm_lines:
        raise StepFailed(f"warm-up printed no result: {out.strip()[-300:]}")
    warm = json.loads(warm_lines[-1])
    for i, ms in enumerate(warm["ms"], 1):
        log(f"warm-up {i}: {ms:.0f} ms")

    record = {"model": model.name, "config": model.config_name, "exp": model.exp, "step": model.step,
              "checkpoint": model.checkpoint, "gpu": gpu, "port": port, "task": task, "prompt": prompt,
              "started": now(), "warmup_ms": warm["ms"]}
    serving_state.save(config, record)

    _guard_bt(robot, sc, log)
    robot.check(bridge_cmd, timeout=300)
    log("policy_bridge up; waiting for /policy/stats")
    deadline = clock() + sc.bridge_start_timeout_sec
    while robot.bridge_stats(5) is None:
        if clock() > deadline:
            raise StepFailed(f"no /policy/stats from the bridge within {sc.bridge_start_timeout_sec} s")
    answer = robot.set_prompt(prompt)
    if not answer.get("confirmed"):
        raise StepFailed(f"the bridge did not confirm the prompt {prompt!r} (published={answer.get('published')})")
    stats = answer.get("stats") or {}
    ap_raw = stats.get("allow_publish")
    if ap_raw is None or ap_raw == "":
        raise StepFailed("allow_publish is missing from bridge stats after start; check the bridge config")
    try:
        ap_val = float(ap_raw)
    except (ValueError, TypeError):
        raise StepFailed(f"allow_publish is not numeric after start: {ap_raw!r}")
    if ap_val:
        raise StepFailed("the bridge reports allow_publish=1 right after start: call /policy/deactivate and check the BT")
    log(f"bridge prompt set to {prompt!r}; bridge inactive")

    results = checks(config, runner, robot=robot, expected_prompt=prompt)
    for line in linkcheck.format_table(results):
        log(line)
    linkcheck.save_history(config, results)
    ok = all(c.ok for c in results)
    if not ok:
        log("link checks failed: the chain is up but a policy run would likely stall (see above)")
    return {**record, "linkcheck_ok": ok, "linkcheck": [c.to_dict() for c in results]}


def stop(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    sc = config.serving
    robot = Robot(config.remote, sc, runner)
    container = serve_container(sc)
    _guard_bt(robot, sc, log)
    bridge = robot.container(sc.bridge_container)
    serve = container_inspect(runner, container)
    bridge_on = bool(bridge and bridge["running"])
    serve_on = bool(serve and serve["running"])
    if params.get("dry_run"):
        return {"dry_run": True, "bridge_running": bridge_on, "serve_running": serve_on}
    result = {"bridge": "not running", "serve": "not running"}
    if bridge_on:
        robot.check(robot.compose_command("stop", sc.bridge_service), timeout=120)
        log("policy_bridge stopped")
        result["bridge"] = "stopped"
    if serve_on:
        runner.check(["docker", "stop", "-t", "30", container])
        runner.check(["docker", "rm", container])
        log(f"{container} stopped")
        result["serve"] = "stopped"
    record = serving_state.load(config)
    if record:
        serving_state.save(config, {**record, "stopped": now()})
    return result


_POLICY_DIR = re.compile(r"--policy\.dir=checkpoints/([A-Za-z0-9][A-Za-z0-9_.-]*)/([A-Za-z0-9][A-Za-z0-9_.-]*)/(\d+)")


def record_from_container(facts: dict) -> dict:
    """What a running openpi-serve serves, read from its command line (for a server started by hand)."""
    match = _POLICY_DIR.search(" ".join(facts.get("args") or []))
    if not match:
        return {}
    config_name, exp, step = match.groups()
    record = {"model": f"{config_name}/{exp}", "config": config_name, "exp": exp, "step": int(step)}
    gpu = (facts.get("env") or {}).get("NVIDIA_VISIBLE_DEVICES", "")
    if gpu.isdigit():
        record["gpu"] = int(gpu)
    ports = [int(p) for p in (facts.get("ports") or {}).values() if str(p).isdigit()]
    if ports:
        record["port"] = ports[0]
    return {**record, "source": "container"}


def status(config: ConsoleConfig, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    sc = config.serving
    record = serving_state.load(config)
    serve = container_inspect(runner, serve_container(sc)) or {"running": False}
    live = record_from_container(serve) if serve.get("running") else {}
    if live and (record.get("stopped") or (record.get("model"), record.get("step")) != (live["model"], live["step"])):
        record = live  # serving.json is missing, stale or about another model: the container is the truth
    serve = {k: v for k, v in serve.items() if k not in ("env", "args", "ports")}  # never pass its environment on
    gpu_index = record.get("gpu", sc.gpu)
    gpu: dict = {"index": gpu_index}
    done = runner.run(["nvidia-smi", "-i", str(gpu_index), "--query-gpu=index,memory.used,memory.total",
                       "--format=csv,noheader,nounits"])
    if done.returncode == 0 and done.stdout.strip():
        try:
            _, used, total = (int(x.strip()) for x in done.stdout.strip().splitlines()[0].split(","))
            gpu.update(used_mib=used, total_mib=total)
        except (ValueError, TypeError):
            pass  # e.g. [N/A] values from nvidia-smi when GPU info is unavailable
    robot = Robot(config.remote, sc, runner)
    bridge: dict
    bt_mode = None
    try:
        facts = robot.container(sc.bridge_container) or {"running": False}
        bridge = {k: facts[k] for k in ("running", "status", "image", "image_id", "started") if k in facts}
        bridge["server"] = "set" if (facts.get("env") or {}).get("POLICY_WS_HOST") else None
        probe = robot.ros_probe(f"stats={config.linkcheck.stats_timeout_sec}", "mode=3")
        stats = probe.get("stats") or {}
        bridge.update({k: stats.get(k) for k in ("prompt", "paused", "allow_publish", "mode_active")})
        bt_mode = probe.get("mode")
    except StepFailed as error:
        bridge = {"error": str(error)}
    return {"serve": serve, "gpu": gpu, "bridge": bridge, "bt_mode": bt_mode, "record": record}


def run(params: dict, log, runner: Runner | None = None) -> dict:
    action = params.get("action")
    if action == "start":
        return start(params, log, runner)
    if action == "stop":
        return stop(params, log, runner)
    raise StepFailed(f"unknown serve action {action!r}: start or stop")
