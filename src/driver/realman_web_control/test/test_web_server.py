import asyncio
import json
from pathlib import Path

import pytest
from aiohttp import web

from realman_web_control.web_server import WebControlServer, WebServerConfig


class FakeLogger:
    def error(self, _message):
        pass


class FakeRequest:
    def __init__(self, path: str = "", query: dict[str, str] | None = None):
        self.match_info = {"path": path}
        self.query = query or {}


def _server(static_root: Path) -> WebControlServer:
    config = WebServerConfig(
        bind_host="127.0.0.1",
        port=8765,
        allowed_origins=("same-origin",),
        max_clients=8,
        max_message_bytes=65536,
    )
    return WebControlServer(
        config=config,
        manifest={"robots": []},
        static_root=static_root,
        description_root=static_root,
        calibration_config_file=static_root / "calibration.yaml",
        calibration_log_root=static_root / "logs",
        on_command=lambda *_args: None,
        on_client_connected=None,
        logger=FakeLogger(),
    )


def test_static_root_serves_index_when_index_is_symlink(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    target_dir = tmp_path / "built"
    target_dir.mkdir()
    (target_dir / "index.html").write_text("ok", encoding="utf-8")
    (static_root / "index.html").symlink_to(target_dir / "index.html")

    response = asyncio.run(_server(static_root)._static_asset(FakeRequest("")))

    assert response.status == 200


def test_web_control_is_open_without_browser_authentication(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    (static_root / "index.html").write_text("ok", encoding="utf-8")

    assert _server(static_root).read_only is False


def test_static_root_rejects_parent_traversal(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    (static_root / "index.html").write_text("ok", encoding="utf-8")

    with pytest.raises(web.HTTPNotFound):
        asyncio.run(_server(static_root)._static_asset(FakeRequest("../package.xml")))


def test_calibration_preview_is_limited_to_log_root(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    (static_root / "index.html").write_text("ok", encoding="utf-8")
    logs = static_root / "logs" / "session-1"
    logs.mkdir(parents=True)
    preview = logs / "l-preview.png"
    preview.write_bytes(b"png")
    response = asyncio.run(
        _server(static_root)._calibration_preview(FakeRequest("session-1/l-preview.png"))
    )
    assert response.status == 200

    with pytest.raises(web.HTTPNotFound):
        asyncio.run(_server(static_root)._calibration_preview(FakeRequest("../index.html")))


def test_calibration_sessions_list_only_valid_sessions_and_sample_counts(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    (static_root / "index.html").write_text("ok", encoding="utf-8")
    session = static_root / "logs" / "camera_calibration" / "session-20260821T102303.053863Z"
    batch = session / "batches" / "20260821T102303.053863Z"
    batch.mkdir(parents=True)
    for arm in ("l", "m", "r"):
        (batch / f"{arm}-0000.json").write_text(
            json.dumps({"sample_id": f"{arm}-0000-example", "base_to_tool": [[1.0]]}),
            encoding="utf-8",
        )
    (session / "calibration_result.json").write_text("{}", encoding="utf-8")
    ignored = static_root / "logs" / "camera_calibration" / "not-a-session"
    ignored.mkdir()

    response = asyncio.run(_server(static_root)._calibration_sessions(FakeRequest()))

    payload = json.loads(response.body)
    assert len(payload["sessions"]) == 1
    listed = payload["sessions"][0]
    assert listed["session_id"] == "session-20260821T102303.053863Z"
    assert listed["sample_counts"] == {"l": 1, "m": 1, "r": 1}
    assert listed["solved"] is True
    assert listed["created_at"].endswith("+00:00")


def test_calibration_session_cleanup_and_explicit_delete_are_scoped_to_sessions(tmp_path):
    static_root = tmp_path / "static"
    static_root.mkdir()
    (static_root / "index.html").write_text("ok", encoding="utf-8")
    sessions_root = static_root / "logs" / "camera_calibration"
    empty = sessions_root / "session-20260821T100000.000000Z"
    kept = sessions_root / "session-20260821T100001.000000Z"
    (empty / "attempts").mkdir(parents=True)
    batch = kept / "batches" / "batch-1"
    batch.mkdir(parents=True)
    (batch / "l-0000.json").write_text(
        json.dumps({"sample_id": "l-0000-example", "base_to_tool": [[1.0]]}),
        encoding="utf-8",
    )
    server = _server(static_root)

    response = asyncio.run(server._calibration_sessions(FakeRequest(query={"delete_empty": "true"})))

    payload = json.loads(response.body)
    assert payload["deleted_session_ids"] == [empty.name]
    assert [session["session_id"] for session in payload["sessions"]] == [kept.name]
    assert not empty.exists()
    deleted = asyncio.run(
        server._delete_calibration_session(
            type("Request", (), {"match_info": {"session_id": kept.name}})()
        )
    )
    assert json.loads(deleted.body) == {"deleted_session_id": kept.name}
    assert not kept.exists()

    with pytest.raises(web.HTTPNotFound):
        asyncio.run(
            server._delete_calibration_session(
                type("Request", (), {"match_info": {"session_id": "../outside"}})()
            )
        )
