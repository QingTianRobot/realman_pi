import asyncio
from pathlib import Path

import pytest
from aiohttp import web

from realman_web_control.web_server import WebControlServer, WebServerConfig


class FakeLogger:
    def error(self, _message):
        pass


class FakeRequest:
    def __init__(self, path: str):
        self.match_info = {"path": path}


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
