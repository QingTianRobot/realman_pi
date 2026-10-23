from __future__ import annotations

import asyncio
import json
from pathlib import Path

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, build_world
from fake_runner import FakeRunner

from realman_training.config import load_config
from realman_training.jobs import JobStore
from realman_training.web_server import Console, TOKEN_HEADER, TtlCache

TEST_DIR = Path(__file__).resolve().parent
TOKEN = "t0k-for-tests"
RAW = "raw_realman_ts_20261016/realman__pi05-three-arm"
GPUS = {"available": True, "busy_mib": 2000, "gpus": [
    {"index": i, "name": "RTX 5090", "used_mib": 100 * i, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []}
    for i in range(4)]}


class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    config = load_config(paths["config"])
    static = tmp_path / "static"
    (static / "assets").mkdir(parents=True)
    (static / "index.html").write_text("<!doctype html><title>Training Console</title>")
    (static / "assets" / "app.js").write_text("console.log(1)")
    calls = {"serve": 0, "gpus": 0}

    def serve_status():
        calls["serve"] += 1
        return {"serve": {"running": True}, "gpu": {"index": 2}, "bridge": {"running": False}, "bt_mode": None,
                "record": {"model": MODEL}}

    def gpu_query():
        calls["gpus"] += 1
        return GPUS

    clock = Clock()

    def make(token=TOKEN, **kwargs):
        store = JobStore(config.console_dir, env={"PYTHONPATH": str(TEST_DIR)})
        targets = {kind: "fake_steps:ok" for kind in
                   ("pull", "clean", "view", "norm", "train", "eval", "register", "serve", "linkcheck", "tags_refresh")}
        return Console(config, token=token, store=store, targets=kwargs.pop("targets", targets),
                       serve_status=serve_status, gpu_query=gpu_query, static_root=kwargs.pop("static_root", static),
                       clock=clock, **kwargs)

    return {"paths": paths, "config": config, "make": make, "calls": calls, "clock": clock}


def call(console: Console, scenario):
    """Run `scenario(client)` against the app; returns what it returns."""
    from aiohttp.test_utils import TestClient, TestServer

    async def run():
        client = TestClient(TestServer(console.app()))
        await client.start_server()
        try:
            return await scenario(client)
        finally:
            await client.close()

    return asyncio.run(run())


async def get_json(client, url, status=200):
    response = await client.get(url)
    assert response.status == status, await response.text()
    return await response.json()


def test_health_says_whether_writes_are_possible(world):
    async def scenario(client):
        return await get_json(client, "/api/health")

    assert call(world["make"](), scenario)["read_only"] is False
    data = call(world["make"](token=""), scenario)
    assert data["read_only"] is True and data["ok"] is True
    assert data["data_root"] == str(world["paths"]["data"])


def test_datasets_and_one_dataset(world):
    async def scenario(client):
        listing = await get_json(client, "/api/datasets")
        detail = await get_json(client, f"/api/dataset?path={RAW}")
        bad = await get_json(client, "/api/dataset?path=../etc", status=400)
        missing = await get_json(client, "/api/dataset?path=nope", status=404)
        return listing, detail, bad, missing

    listing, detail, bad, missing = call(world["make"](), scenario)
    assert listing["root"] == str(world["paths"]["data"])
    assert {row["path"] for row in listing["datasets"]} >= {RAW, "realman_right_arm_multitask_view"}
    assert detail["suggested_drops"] == [1, 2] and detail["summary"]["episodes"] == 5
    assert "leaves data_root" in bad["error"] or "without .." in bad["error"]
    assert "no dataset" in missing["error"]


def test_runs_models_linkcheck_options(world):
    async def scenario(client):
        return (await get_json(client, "/api/runs"), await get_json(client, f"/api/runs/{CONFIG_NAME}/{EXP}"),
                await get_json(client, f"/api/runs/{CONFIG_NAME}/nope", status=404),
                await get_json(client, "/api/models"), await get_json(client, "/api/linkcheck"),
                await get_json(client, "/api/options"))

    runs, run, missing, models, history, options = call(world["make"](), scenario)
    assert MODEL in {r["name"] for r in runs["runs"]}
    assert run["metrics"]["loss"] and run["eval"]["29999"]["pick_only"]["mae"] == 0.092 and run["job"] is None
    assert "no run" in missing["error"]
    assert models["models"][0]["serving"] is True
    assert history["latest"]["ok"] is False and len(history["history"]) == 2 and history["job"] is None
    assert options["views"] == ["realman_right_arm_multitask_view"]
    assert set(options["sources"]) == {RAW, "realman__multitask_clean"}
    assert options["arms"] == ["l", "m", "r"] and options["linkcheck_items"] == ["pika", "link", "inference", "bridge"]
    assert options["configs"] == ["pi05_realman_action_only", CONFIG_NAME]


def test_serve_status_and_gpus_are_cached(world):
    console = world["make"]()

    async def scenario(client):
        first = await get_json(client, "/api/serve")
        await get_json(client, "/api/serve")
        world["clock"].t += 25
        await get_json(client, "/api/serve")
        await get_json(client, "/api/serve?refresh=1")
        gpus = await get_json(client, "/api/gpus")
        await get_json(client, "/api/gpus")
        return first, gpus

    first, gpus = call(console, scenario)
    assert first["serve"]["running"] is True and first["job"] is None and "at" in first
    assert world["calls"]["serve"] == 3 and world["calls"]["gpus"] == 1
    assert [g["index"] for g in gpus["gpus"]] == [0, 1, 2, 3]


def test_a_failing_status_provider_becomes_an_error_field(world):
    def boom():
        raise RuntimeError("docker socket missing")

    console = world["make"]()
    console._serve_status = boom

    async def scenario(client):
        return await get_json(client, "/api/serve")

    assert "docker socket missing" in call(console, scenario)["error"]


def test_serve_settings_read(world):
    async def scenario(client):
        return await get_json(client, "/api/serve/settings")

    data = call(world["make"](), scenario)
    assert data["defaults"]["model"] == MODEL and data["saved"] == {} and data["effective"]["port"] == 18000
    assert data["models"][0]["name"] == MODEL


def test_the_ui_is_served_and_a_missing_build_says_so(world, tmp_path):
    async def scenario(client):
        index = await client.get("/")
        asset = await client.get("/assets/app.js")
        escape = await client.get("/assets/../../console.yaml")
        missing_asset = await client.get("/assets/nope.js")
        return index.status, await index.text(), asset.status, await escape.text(), missing_asset.status

    status, text, asset, escape, missing_asset = call(world["make"](), scenario)
    assert (status, asset, missing_asset) == (200, 200, 404) and "Training Console" in text
    assert escape.startswith("<!doctype html>") and "training_console" not in escape

    async def missing(client):
        response = await client.get("/")
        return response.status

    assert call(world["make"](static_root=tmp_path / "nothing"), missing) == 503


def test_ttl_cache_adds_a_timestamp():
    clock = Clock()
    cache = TtlCache(5, clock)
    values = iter([{"n": 1}, {"n": 2}])

    async def scenario():
        a = await cache.get(lambda: next(values))
        b = await cache.get(lambda: next(values))
        return a, b

    a, b = asyncio.run(scenario())
    assert a["n"] == b["n"] == 1 and "at" in a


def _job_body(kind="clean", **params):
    params = params or {"src": RAW, "drop": [1, 2], "reasons": {"1": "closed on nothing"}}
    return {"kind": kind, "params": params, "confirm": True}


def test_writes_need_the_token(world):
    async def scenario(client):
        none = await client.post("/api/jobs", json=_job_body())
        wrong = await client.post("/api/jobs", json=_job_body(), headers={TOKEN_HEADER: "nope"})
        settings = await client.put("/api/serve/settings", json={"gpu": 1})
        cancel = await client.post("/api/jobs/x/cancel")
        return none.status, (await none.json())["error"], wrong.status, settings.status, cancel.status

    assert call(world["make"](), scenario) == (401, "wrong or missing token", 401, 401, 401)

    async def read_only(client):
        response = await client.post("/api/jobs", json=_job_body(), headers={TOKEN_HEADER: TOKEN})
        return response.status, (await response.json())["error"]

    status, message = call(world["make"](token=""), read_only)
    assert status == 403 and "read-only" in message


def test_a_confirmed_job_starts_and_finishes(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        unconfirmed = await client.post("/api/jobs", json={**_job_body(), "confirm": False}, headers=headers)
        bad = await client.post("/api/jobs", json=_job_body(src=RAW, drop=[1], rm=True), headers=headers)
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        for _ in range(100):
            detail = await get_json(client, f"/api/jobs/{job['id']}")
            if detail["job"]["state"] in ("succeeded", "failed"):
                break
            await asyncio.sleep(0.1)
        listing = await get_json(client, "/api/jobs?kind=clean")
        return unconfirmed.status, bad.status, (await bad.json())["error"], created.status, job, detail, listing

    unconfirmed, bad, message, created, job, detail, listing = call(world["make"](), scenario)
    assert unconfirmed == 400 and bad == 400 and "unknown" in message
    assert created == 201 and job["kind"] == "clean"
    assert detail["job"]["state"] == "succeeded" and "hello" in detail["log"]
    assert detail["job"]["params"]["drop"] == [1, 2] and "config" not in detail["job"]["params"]
    assert detail["job"]["result"]["echo"]["src"] == str(world["paths"]["raw"])
    assert [j["id"] for j in listing["jobs"]] == [job["id"]]


def test_a_second_job_of_the_same_kind_is_refused_and_can_be_cancelled(world, tmp_path, monkeypatch):
    import realman_training.job_params as jp

    flag = tmp_path / "started"
    real = jp.build
    # fake_steps.sleep needs params["flag"], which the real whitelist refuses: add it after the whitelist.
    monkeypatch.setattr(jp, "build", lambda kind, raw, config, settings=None: {**real(kind, raw, config, settings),
                                                                               "flag": str(flag)})
    console = world["make"](targets={"pull": "fake_steps:sleep"})
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        first = await client.post("/api/jobs", json={"kind": "pull", "params": {"name": "raw_a"}, "confirm": True},
                                  headers=headers)
        job = (await first.json())["job"]
        second = await client.post("/api/jobs", json={"kind": "pull", "params": {"name": "raw_b"}, "confirm": True},
                                   headers=headers)
        cancel = await client.post(f"/api/jobs/{job['id']}/cancel", headers=headers)
        for _ in range(100):
            state = (await get_json(client, f"/api/jobs/{job['id']}"))["job"]["state"]
            if state not in ("starting", "running"):
                break
            await asyncio.sleep(0.1)
        return first.status, second.status, (await second.json())["error"], await cancel.json(), state

    first, second, message, cancel, state = call(console, scenario)
    assert first == 201 and second == 409 and "already running" in message
    assert cancel == {"cancelled": True} and state == "cancelled"


def test_serve_jobs_take_the_saved_settings(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        bad = await client.put("/api/serve/settings", json={"model": "pi05_x/none"}, headers=headers)
        saved = await client.put("/api/serve/settings", json={"gpu": 3, "task": "pick_only"}, headers=headers)
        created = await client.post("/api/jobs", json={"kind": "serve", "params": {"action": "start", "dry_run": True},
                                                       "confirm": True}, headers=headers)
        return bad.status, await saved.json(), (await created.json())["job"]

    bad, saved, job = call(world["make"](), scenario)
    assert bad == 400
    assert saved["saved"] == {"gpu": 3, "task": "pick_only"} and saved["effective"]["gpu"] == 3
    assert job["params"] == {"action": "start", "model": MODEL, "checkpoint": None, "gpu": 3, "port": 18000,
                             "task": "pick_only", "dry_run": True}
    assert json.loads((world["config"].console_dir / "serve_settings.json").read_text()) == {"gpu": 3, "task": "pick_only"}


def test_the_log_websocket_streams_lines_status_and_end(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        messages = []

        async def receive():
            async with client.ws_connect(f"/api/jobs/{job['id']}/log") as ws:
                async for message in ws:
                    data = json.loads(message.data)
                    messages.append(data)
                    if data["type"] == "end":
                        break

        await asyncio.wait_for(receive(), timeout=15)
        missing = await client.get("/api/jobs/nope/log")
        return messages, missing.status

    messages, missing = call(world["make"](), scenario)
    lines = [line for m in messages if m["type"] == "lines" for line in m["lines"]]
    assert any("hello" in line for line in lines)
    states = [m["job"]["state"] for m in messages if m["type"] == "status"]
    assert states[-1] == "succeeded"
    assert messages[-1] == {"type": "end"}
    assert missing == 404


def test_pump_closes_socket_on_exception(world, monkeypatch):
    """A pump that raises RuntimeError must close the socket so the receive loop ends, not hang."""
    import realman_training.catalog as cat
    headers = {TOKEN_HEADER: TOKEN}

    call_count = [0]
    original = cat.job_row

    def boom(j):
        call_count[0] += 1
        raise RuntimeError("storage exploded")

    async def scenario(client):
        # Start the job first (uses the real catalog.job_row for the 201 response).
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        # Only patch after the job is started so the POST handler is unaffected.
        monkeypatch.setattr(cat, "job_row", boom)
        ended = False
        try:
            async def receive():
                nonlocal ended
                async with client.ws_connect(f"/api/jobs/{job['id']}/log") as ws:
                    async for _ in ws:
                        pass
                ended = True
            await asyncio.wait_for(receive(), timeout=5)
        except asyncio.TimeoutError:
            pass  # socket not closed — will cause assertion failure below
        except Exception:
            ended = True  # connection closed with an error is fine
        monkeypatch.setattr(cat, "job_row", original)
        return ended

    ended = call(world["make"](), scenario)
    assert call_count[0] >= 1
    assert ended, "socket was not closed by pump within 5 s — client would hang"


def test_transient_value_error_from_job_row_is_skipped(world, monkeypatch):
    """A transient ValueError from catalog.job_row (half-written status.json) is retried; stream ends normally."""
    import realman_training.catalog as cat
    headers = {TOKEN_HEADER: TOKEN}

    calls = [0]
    original = cat.job_row

    def flaky(j):
        calls[0] += 1
        if calls[0] <= 2:
            raise ValueError("half-written status.json")
        return original(j)

    async def scenario(client):
        # Start the job first (real catalog.job_row for the 201 response).
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        # Patch after job creation so start_job handler is unaffected.
        monkeypatch.setattr(cat, "job_row", flaky)
        messages = []

        async def receive():
            async with client.ws_connect(f"/api/jobs/{job['id']}/log") as ws:
                async for message in ws:
                    data = json.loads(message.data)
                    messages.append(data)
                    if data["type"] == "end":
                        break

        await asyncio.wait_for(receive(), timeout=15)
        monkeypatch.setattr(cat, "job_row", original)
        return messages

    messages = call(world["make"](), scenario)
    assert messages[-1] == {"type": "end"}


def test_partial_first_line_is_dropped_when_log_is_seeked(world, monkeypatch):
    """When offset > 0 (log longer than _LOG_START_BYTES), the pump must skip the partial first line."""
    import realman_training.web_server as ws_mod
    original = ws_mod._LOG_START_BYTES
    monkeypatch.setattr(ws_mod, "_LOG_START_BYTES", 10)  # very small so any non-trivial log triggers a seek
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        messages = []

        async def receive():
            async with client.ws_connect(f"/api/jobs/{job['id']}/log") as ws:
                async for message in ws:
                    data = json.loads(message.data)
                    messages.append(data)
                    if data["type"] == "end":
                        break

        await asyncio.wait_for(receive(), timeout=15)
        return messages

    monkeypatch.setattr(ws_mod, "_LOG_START_BYTES", 10)
    messages = call(world["make"](), scenario)
    monkeypatch.setattr(ws_mod, "_LOG_START_BYTES", original)
    # The stream must end (no partial garbage from mid-line seek)
    assert messages[-1] == {"type": "end"}
    lines = [line for m in messages if m["type"] == "lines" for line in m["lines"]]
    # No line should start with a partial word that cuts into a previous line (all lines complete)
    assert all("\n" not in line for line in lines)


def test_nan_in_payload_becomes_null_in_json_response(world):
    """A GET whose underlying data contains NaN must return parseable JSON with null, not the bare NaN token."""
    import math

    # Inject NaN into the metrics CSV for the registered run
    run = world["paths"]["run"]
    csv_path = run / "metrics.csv"
    csv_path.write_text(csv_path.read_text(encoding="utf-8") + "99999,nan,nan,nan\n", encoding="utf-8")

    async def scenario(client):
        response = await client.get(f"/api/runs/{CONFIG_NAME}/{EXP}")
        assert response.status == 200
        text = await response.text()
        # Must be parseable — json.loads raises on bare NaN
        data = json.loads(text)
        # The NaN loss values must come back as null
        losses = data["metrics"].get("loss", [])
        assert all(v is None or (isinstance(v, float) and math.isfinite(v)) for v in losses)
        return data

    call(world["make"](), scenario)


def test_models_mark_what_the_live_serve_status_serves(world):
    (world["config"].console_dir / "serving.json").unlink()  # e.g. openpi-serve started by hand

    async def scenario(client):
        return await get_json(client, "/api/models")

    assert call(world["make"](), scenario)["models"][0]["serving"] is True
    stopped = world["make"]()
    stopped._serve_status = lambda: {"serve": {"running": False}, "record": {"model": MODEL}}
    assert call(stopped, scenario)["models"][0]["serving"] is False


def test_dataset_detail_carries_tags(world):
    async def scenario(client):
        raw = await get_json(client, f"/api/dataset?path={RAW}")
        view = await get_json(client, "/api/dataset?path=realman_right_arm_multitask_view")
        return raw, view

    raw, view = call(world["make"](), scenario)
    assert raw["tags"]["keys"][0] == "task" and raw["tags"]["episodes"]["2"]["tags"]["success"] is False
    assert raw["tags"]["episodes"]["2"]["tag_sources"]["success"] == "manual"
    assert view["tags"] is None


def test_select_previews_tag_drops(world):
    async def scenario(client):
        ok = await get_json(client, f"/api/dataset/select?path={RAW}&where=lighting_level%3D2&where=success%3Dtrue")
        bad = await get_json(client, f"/api/dataset/select?path={RAW}&where=colour%3Dred", status=400)
        none = await get_json(client, "/api/dataset/select?path=realman__multitask_clean&where=success%3Dtrue", status=400)
        return ok, bad, none

    ok, bad, none = call(world["make"](), scenario)
    assert ok["drop"] == [2, 3, 4] and ok["keep_count"] == 2
    assert ok["reasons"]["2"] == "tag success=false (2 closing events (re-grasp))"
    assert ok["reasons"]["3"] == "tag lighting_level=1 not in {2}"
    assert "unknown tag" in bad["error"] and "no episode tags" in none["error"]


def test_tags_status_reports_unknown_when_the_robot_is_away(world):
    down = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")

    async def scenario(client):
        return await get_json(client, f"/api/dataset/tags-status?path={RAW}")

    data = call(world["make"](runner=down), scenario)
    assert data["state"] == "unknown" and "realman_local" in data["error"]


def test_tag_jobs_are_validated(world):
    async def scenario(client):
        headers = {TOKEN_HEADER: TOKEN}

        async def post(kind, params, status):
            response = await client.post("/api/jobs", json={"kind": kind, "params": params, "confirm": True}, headers=headers)
            assert response.status == status, await response.text()
            return await response.json()

        refresh = await post("tags_refresh", {"path": RAW}, 201)
        where_only = await post("clean", {"src": RAW, "where": ["lighting_level=2"]}, 201)
        unknown = await post("clean", {"src": RAW, "where": ["colour=red"]}, 400)
        nothing = await post("clean", {"src": RAW, "where": ["lighting_level=1,2"]}, 400)
        return refresh, where_only, unknown, nothing

    refresh, where_only, unknown, nothing = call(world["make"](), scenario)
    assert refresh["job"]["params"]["path"].endswith(RAW)
    assert where_only["job"]["params"]["where"] == ["lighting_level=2"] and where_only["job"]["params"]["drop"] == []
    assert "unknown tag" in unknown["error"] and "nothing to drop" in nothing["error"]
