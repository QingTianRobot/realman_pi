"""HTTP contracts for the Episode tag endpoints."""
import asyncio
import json

import pytest


def test_tag_api_validation_revision_and_rebuild(tmp_path):
    pytest.importorskip("aiohttp")
    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer
    from realman_recording.episode_tags import EpisodeTagStore
    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "recordings"
    session = root / "s1"
    session.mkdir(parents=True)
    (session / "manifest.json").write_text(json.dumps({
        "session_id": "s1", "state": "READY", "decision": "PENDING",
        "started_realtime_ns": 1_790_091_000_000_000_000,
        "annotations": {"success": None}, "metadata": {"task": "original"},
    }))
    server = object.__new__(RecordingWebServer)
    server._tags = EpisodeTagStore(root)
    app = web.Application(client_max_size=16_384)
    app.router.add_get("/api/recording/tag-defaults", server._tag_defaults_get)
    app.router.add_put("/api/recording/tag-defaults", server._tag_defaults_put)
    app.router.add_get("/api/recording/{session_id}/tags", server._tags_get)
    app.router.add_put("/api/recording/{session_id}/tags", server._tags_put)
    app.router.add_post("/api/recording/episode-meta/rebuild", server._episode_meta_rebuild)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            defaults = await client.get("/api/recording/tag-defaults")
            assert (await defaults.json())["tags"]["success"] is True
            invalid = await client.put("/api/recording/tag-defaults", json={"tags": {"success": None}})
            assert invalid.status == 400
            duplicate = await client.put("/api/recording/tag-defaults", data='{"tags":{"success":true,"success":false}}')
            assert duplicate.status == 400
            saved = await client.put("/api/recording/tag-defaults", json={"tags": {"success": False}})
            assert saved.status == 200
            current = await client.get("/api/recording/s1/tags")
            initial = await current.json()
            assert initial["tags"]["success"] is True  # old sessions are not retroactively changed
            invalid_level = await client.put("/api/recording/s1/tags", json={
                "revision": 0, "set": {"lighting_level": True}, "reset": [],
            })
            assert invalid_level.status == 400
            updated = await client.put("/api/recording/s1/tags", json={
                "revision": 0, "set": {"success": False, "object_count": 2, "gain": 2},
                "set_types": {"object_count": "int", "gain": "float"}, "reset": [],
            })
            assert updated.status == 200
            result = await updated.json()
            assert result["tags"]["success"] is False
            assert result["tags"]["object_count"] == 2
            assert result["tag_sources"]["gain"] == "manual"
            assert result["meta_synced"] is True
            stale = await client.put("/api/recording/s1/tags", json={
                "revision": 0, "set": {"success": True}, "reset": [],
            })
            assert stale.status == 409
            rebuilt = await client.post("/api/recording/episode-meta/rebuild")
            assert rebuilt.status == 200
            assert (await rebuilt.json())["episodes"][0]["tags"]["success"] is False
        finally:
            await client.close()

    asyncio.run(run())
