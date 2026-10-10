# test_web_queue_endpoint.py
from realman_recording.lerobot_web_replay import queue_from_manifests


def test_queue_skips_missing_manifest_and_orders_by_request_time(tmp_path):
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "manifest.json").write_text('{"state":"READY","decision":"ADOPTED","export":{"state":"QUEUED","requested_realtime_ns":2}}')
    (tmp_path / "b").mkdir()
    (tmp_path / "b" / "manifest.json").write_text('{"state":"READY","decision":"ADOPTED","export":{"state":"QUEUED","requested_realtime_ns":1}}')
    (tmp_path / "corrupt").mkdir()  # no manifest.json
    jobs = queue_from_manifests(tmp_path)
    assert [j["session_id"] for j in jobs] == ["b", "a"]
    assert jobs[0]["export_state"] == "QUEUED"
