"""HTTP contracts for deviation intervals and the sidecar export."""
from __future__ import annotations

import asyncio
import json

import pytest

FIRST = 1_790_000_000_000_000_000


def write_session(root, session_id="s1"):
    directory = root / session_id
    (directory / "export").mkdir(parents=True)
    (directory / "manifest.json").write_text(json.dumps({
        "session_id": session_id, "state": "READY", "decision": "ADOPTED",
        "started_realtime_ns": FIRST - 500_000_000, "ended_realtime_ns": FIRST + 3_000_000_000,
        "export": {"state": "SUCCEEDED"},
        "quality": {"revision": 0, "attempt": {"attempt_id": "policy_attempt_x", "outcome": "dropped"},
                    "intervals": [{"start_ns": str(FIRST + 150_000_000), "end_ns": str(FIRST + 450_000_000),
                                   "reason": "grasp_miss", "source": "live"}],
                    "rejected_marks": 0},
    }), encoding="utf-8")
    (directory / "export" / "lerobot-v3.json").write_text(json.dumps({
        "repo_id": "realman/pi05-policy-rollouts", "fps": 10, "episode_index": 3,
        "first_walltime_ns": FIRST, "frame_count": 20,
    }), encoding="utf-8")


def test_quality_api_reads_edits_and_exports(tmp_path):
    pytest.importorskip("aiohttp")
    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer
    from realman_recording.quality_events import QualityReason
    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "recordings"
    write_session(root)
    server = object.__new__(RecordingWebServer)
    server._recording_root = root.resolve()
    server._quality_reasons = (QualityReason("grasp_miss", "抓偏"), QualityReason("stall", "卡住犹豫"))
    app = web.Application(client_max_size=16_384)
    app.router.add_get("/api/lerobot/quality_events", server._quality_sidecar)
    app.router.add_get("/api/recording/{session_id}/quality_events", server._quality_get)
    app.router.add_put("/api/recording/{session_id}/quality_events", server._quality_put)
    edit = {"start_ns": str(FIRST + 200_000_000), "end_ns": str(FIRST + 500_000_000),
            "reason": "stall", "source": "live"}

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            current = await (await client.get("/api/recording/s1/quality_events")).json()
            assert current["revision"] == 0
            assert current["frames"] == {"fps": 10.0, "first_walltime_ns": str(FIRST), "frame_count": 20}
            assert (current["intervals"][0]["start_frame"], current["intervals"][0]["end_frame"]) == (2, 4)
            assert [reason["id"] for reason in current["reasons"]] == ["grasp_miss", "stall"]

            saved = await client.put("/api/recording/s1/quality_events", json={"revision": 0, "intervals": [edit]})
            assert saved.status == 200
            document = await saved.json()
            assert document["revision"] == 1
            assert document["intervals"][0]["source"] == "replay"
            assert (document["intervals"][0]["start_frame"], document["intervals"][0]["end_frame"]) == (2, 4)

            stale = await client.put("/api/recording/s1/quality_events", json={"revision": 0, "intervals": [edit]})
            assert stale.status == 409
            bad = await client.put("/api/recording/s1/quality_events", json={
                "revision": 1, "intervals": [{"start_ns": "5", "end_ns": None, "reason": None, "source": "live"}],
            })
            assert bad.status == 400
            not_json = await client.put("/api/recording/s1/quality_events", data="{")
            assert not_json.status == 400
            assert (await client.get("/api/recording/nope/quality_events")).status == 404

            sidecar = await client.get("/api/lerobot/quality_events", params={"repo_id": "realman/pi05-policy-rollouts"})
            assert sidecar.status == 200
            assert "episode_quality_events.json" in sidecar.headers["Content-Disposition"]
            assert list((await sidecar.json())["episodes"]) == ["3"]
            assert (await client.get("/api/lerobot/quality_events", params={"repo_id": "bad"})).status == 400
        finally:
            await client.close()

    asyncio.run(run())
