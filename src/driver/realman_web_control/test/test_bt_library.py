import asyncio
import json
from pathlib import Path

import pytest
import yaml
from aiohttp import web

from realman_web_control.bt_library import list_trees, read_favorites, set_favorite
from realman_web_control.web_server import WebControlServer, WebServerConfig, load_server_config

ROOT = Path(__file__).resolve().parents[4]
ROOT_CONFIG = ROOT / "config/ros/realman_web_control.yaml"


def write_tree(directory: Path, name: str, launch="arm_move", arms="r"):
    (directory / name).write_text(
        f'<?xml version="1.0"?>\n<root main_tree_to_execute="Main" realman_launch="{launch}" '
        f'realman_required_arms="{arms}"><BehaviorTree ID="Main"/></root>\n', encoding="utf-8",
    )


@pytest.fixture
def trees(tmp_path):
    directory = tmp_path / "behavior-trees"
    directory.mkdir()
    write_tree(directory, "move.xml")
    write_tree(directory, "control.xml", launch="control_router", arms="l,m,r")
    write_tree(directory, "three.xml", arms="l,m,r")
    (directory / "broken.xml").write_text("<root", encoding="utf-8")
    (directory / "notes.txt").write_text("not a tree", encoding="utf-8")
    return directory, tmp_path / "web-control" / "behavior-trees" / "favorites.yaml"


def test_lists_every_xml_with_its_launch_metadata(trees):
    directory, favorites = trees
    listed = list_trees(directory, favorites)
    assert [tree["name"] for tree in listed] == ["broken.xml", "control.xml", "move.xml", "three.xml"]
    control = next(tree for tree in listed if tree["name"] == "control.xml")
    assert control == {"name": "control.xml", "main_tree": "Main", "launch": "control_router",
                       "arms": ["l", "m", "r"], "valid": True, "favorite": False}
    assert next(tree for tree in listed if tree["name"] == "broken.xml")["valid"] is False


def test_favorites_are_pinned_first_in_pin_order_and_shared_through_the_file(trees):
    directory, favorites = trees
    set_favorite(directory, favorites, "three.xml", True)
    set_favorite(directory, favorites, "control.xml", True)
    assert [tree["name"] for tree in list_trees(directory, favorites)][:2] == ["three.xml", "control.xml"]
    assert yaml.safe_load(favorites.read_text())["favorites"] == ["three.xml", "control.xml"]
    set_favorite(directory, favorites, "three.xml", False)
    listed = list_trees(directory, favorites)
    assert [tree["name"] for tree in listed if tree["favorite"]] == ["control.xml"]
    assert not list(favorites.parent.glob(".favorites-*"))  # atomic write leaves no temp file


def test_favorites_ignore_deleted_or_bogus_entries(trees):
    directory, favorites = trees
    favorites.parent.mkdir(parents=True)
    favorites.write_text(yaml.safe_dump({"favorites": ["gone.xml", "../x.xml", 3, "move.xml", "move.xml"]}))
    assert read_favorites(favorites) == ["gone.xml", "move.xml"]
    assert [tree["name"] for tree in list_trees(directory, favorites) if tree["favorite"]] == ["move.xml"]


@pytest.mark.parametrize("name, favorite", [("missing.xml", True), ("../move.xml", True), ("move.xml", "yes")])
def test_set_favorite_validates_input(trees, name, favorite):
    directory, favorites = trees
    with pytest.raises(ValueError):
        set_favorite(directory, favorites, name, favorite)


def test_root_config_points_at_the_repo_trees_and_favorites():
    config = load_server_config(ROOT_CONFIG)
    assert config.bt_launcher_url == "http://127.0.0.1:8781"
    assert config.bt_tree_dir == ROOT / "config/behavior-trees"
    assert config.bt_favorites_file == ROOT / "config/web-control/behavior-trees/favorites.yaml"
    assert (config.bt_tree_dir / "control.xml").is_file()


def test_launcher_config_is_validated(tmp_path):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["behavior_tree_launcher"]["url"] = "ftp://x"
    (tmp_path / "ros").mkdir()
    path = tmp_path / "ros" / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match="behavior_tree_launcher"):
        load_server_config(path)


class FakeLogger:
    def error(self, _message):
        pass

    def warning(self, _message):
        pass


class FakeRequest:
    def __init__(self, body, origin=None):
        self._body = body
        self.headers = {"Origin": origin} if origin else {}
        self.scheme = "http"
        self.host = "robot:8765"

    async def json(self):
        return self._body


def test_routes_list_pin_and_start_through_the_launcher(trees):
    directory, favorites = trees

    async def scenario():
        starts = []

        async def status(_request):
            return web.json_response({"running": False, "launched_here": False})

        async def start(request):
            body = await request.json()
            starts.append(body)
            if body["tree"] == "three.xml":
                return web.json_response({"ok": False, "error": "a behavior tree is already running"}, status=409)
            return web.json_response({"ok": True, **body})

        app = web.Application()
        app.router.add_get("/status", status)
        app.router.add_post("/start", start)
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "127.0.0.1", 0)
        await site.start()
        port = site._server.sockets[0].getsockname()[1]
        config = WebServerConfig(
            bind_host="127.0.0.1", port=8765, allowed_origins=("same-origin",), max_clients=8,
            max_message_bytes=65536, discovery_period_sec=1.0, web_override_timeout_sec=5.0,
            bt_launcher_url=f"http://127.0.0.1:{port}", bt_tree_dir=directory, bt_favorites_file=favorites,
        )
        server = WebControlServer(
            config=config, manifest={}, static_root=directory, description_root=directory,
            calibration_config_file=directory / "c.yaml", calibration_log_root=directory,
            on_command=lambda *_: None, on_client_connected=None, logger=FakeLogger(),
        )
        try:
            listed = json.loads((await server._bt_trees(None)).text)
            pinned = json.loads((await server._bt_favorite(FakeRequest({"name": "move.xml", "favorite": True}))).text)
            started = await server._bt_start(FakeRequest({"tree": "control.xml", "dry_run": False}, "http://robot:8765"))
            refused = await server._bt_start(FakeRequest({"tree": "three.xml", "dry_run": True}))
            with pytest.raises(web.HTTPForbidden):
                await server._bt_start(FakeRequest({"tree": "control.xml", "dry_run": False}, "http://evil.example"))
            await runner.cleanup()
            offline = json.loads((await server._bt_trees(None)).text)
        finally:
            if server._bt_session is not None:
                await server._bt_session.close()
        return listed, pinned, started, refused, offline, starts

    listed, pinned, started, refused, offline, starts = asyncio.run(scenario())
    assert listed["available"] is True and listed["launcher"]["running"] is False
    assert pinned["trees"][0]["name"] == "move.xml" and pinned["trees"][0]["favorite"] is True
    assert started.status == 200 and json.loads(started.text)["tree"] == "control.xml"
    assert starts[0] == {"tree": "control.xml", "dry_run": False}
    assert refused.status == 409
    assert len(starts) == 2  # the cross-origin start never reached the launcher
    assert offline["available"] is False and offline["trees"]
