from __future__ import annotations

import asyncio
from pathlib import Path

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, build_world

from realman_training.config import load_config
from realman_training.jobs import JobStore
from realman_training.web_server import Console, TtlCache

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
                   ("pull", "clean", "view", "norm", "train", "eval", "register", "serve", "linkcheck")}
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
