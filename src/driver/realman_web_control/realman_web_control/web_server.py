"""aiohttp server running on a dedicated asyncio thread."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import re
import shutil
import threading
from typing import Any, Callable
from urllib.parse import urlsplit
import uuid

import yaml

from .bt_library import list_trees, set_favorite
from .bt_runtime import UNAVAILABLE as BT_RUNTIME_UNAVAILABLE, compact_runtime_snapshot
from .model_manifest import resolve_model_asset
from .param_tuning import ChangeError, ConflictError, ParamWriteError
from .protocol import ProtocolError, parse_message


@dataclass(frozen=True)
class WebServerConfig:
    bind_host: str
    port: int
    allowed_origins: tuple[str, ...]
    max_clients: int
    max_message_bytes: int
    discovery_period_sec: float
    web_override_timeout_sec: float
    # Read-only behavior-tree monitor proxied at /api/bt/runtime; empty disables it.
    bt_monitor_url: str = ""
    bt_monitor_timeout_sec: float = 0.5
    bt_monitor_stale_after_sec: float = 5.0
    # How often the server re-reads the monitor while a browser is connected; changes go out over /ws.
    bt_monitor_poll_period_sec: float = 0.05
    # bt_launcher in the bringup container starts trees; empty URL hides the start menu.
    bt_launcher_url: str = ""
    bt_launcher_timeout_sec: float = 2.0
    bt_tree_dir: Path | None = None
    bt_favorites_file: Path | None = None
    # Host-side docker_restart_helper restarts this Compose service; empty URL hides the button.
    docker_restart_url: str = ""
    docker_restart_timeout_sec: float = 2.0
    docker_restart_service: str = ""
    # Catalog of the /params.html parameter page; None disables the page and its /api/params* routes.
    param_catalog_file: Path | None = None
    param_readback_timeout_sec: float = 0.5


def load_server_config(path: str | Path) -> WebServerConfig:
    with Path(path).open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream)
    if not isinstance(document, dict) or not isinstance(document.get("server"), dict):
        raise ValueError("web control config must contain a server mapping")
    server = document["server"]
    input_mode = document.get("input_mode")
    if not isinstance(input_mode, dict):
        raise ValueError("web control config must contain an input_mode mapping")
    timing = {}
    for field in ("discovery_period_sec", "web_override_timeout_sec"):
        value = input_mode.get(field)
        if (isinstance(value, bool) or not isinstance(value, (int, float))
                or not math.isfinite(value) or value <= 0):
            raise ValueError(f"input_mode.{field} must be finite and positive")
        timing[field] = float(value)
    bt_monitor = document.get("behavior_tree_monitor", {})
    if not isinstance(bt_monitor, dict):
        raise ValueError("behavior_tree_monitor must be a mapping")
    bt_monitor_url = bt_monitor.get("url", "")
    if not isinstance(bt_monitor_url, str) or (
        bt_monitor_url and urlsplit(bt_monitor_url).scheme not in ("http", "https")
    ):
        raise ValueError("behavior_tree_monitor.url must be an http(s) URL or empty")
    for field, default in (("timeout_sec", 0.5), ("stale_after_sec", 5.0), ("poll_period_sec", 0.05)):
        value = bt_monitor.get(field, default)
        if (isinstance(value, bool) or not isinstance(value, (int, float))
                or not math.isfinite(value) or value <= 0):
            raise ValueError(f"behavior_tree_monitor.{field} must be finite and positive")
        timing[f"bt_monitor_{field}"] = float(value)
    launcher = document.get("behavior_tree_launcher", {})
    if not isinstance(launcher, dict):
        raise ValueError("behavior_tree_launcher must be a mapping")
    launcher_url = launcher.get("url", "")
    if not isinstance(launcher_url, str) or (
        launcher_url and urlsplit(launcher_url).scheme not in ("http", "https")
    ):
        raise ValueError("behavior_tree_launcher.url must be an http(s) URL or empty")
    launcher_timeout = launcher.get("timeout_sec", 2.0)
    if (isinstance(launcher_timeout, bool) or not isinstance(launcher_timeout, (int, float))
            or not math.isfinite(launcher_timeout) or launcher_timeout <= 0):
        raise ValueError("behavior_tree_launcher.timeout_sec must be finite and positive")
    # Relative paths are under the config root (the parent of this file's ros/ directory).
    config_root = Path(path).resolve().parent.parent
    launcher_paths: dict[str, Path | None] = {}
    for field in ("tree_dir", "favorites_file"):
        value = launcher.get(field)
        if launcher_url and (not isinstance(value, str) or not value):
            raise ValueError(f"behavior_tree_launcher.{field} must be a path")
        launcher_paths[field] = (config_root / value) if isinstance(value, str) and value else None
    restart = document.get("docker_restart", {})
    if not isinstance(restart, dict):
        raise ValueError("docker_restart must be a mapping")
    restart_url = restart.get("url", "")
    if not isinstance(restart_url, str) or (
        restart_url and urlsplit(restart_url).scheme not in ("http", "https")
    ):
        raise ValueError("docker_restart.url must be an http(s) URL or empty")
    restart_timeout = restart.get("timeout_sec", 2.0)
    if (isinstance(restart_timeout, bool) or not isinstance(restart_timeout, (int, float))
            or not math.isfinite(restart_timeout) or restart_timeout <= 0):
        raise ValueError("docker_restart.timeout_sec must be finite and positive")
    restart_service = restart.get("service", "")
    if restart_url and (not isinstance(restart_service, str) or not restart_service):
        raise ValueError("docker_restart.service must name a Compose service")
    tuning = document.get("param_tuning", {})
    if not isinstance(tuning, dict):
        raise ValueError("param_tuning must be a mapping")
    catalog_file = tuning.get("catalog_file", "")
    if not isinstance(catalog_file, str):
        raise ValueError("param_tuning.catalog_file must be a path or empty")
    readback_timeout = tuning.get("readback_timeout_sec", 0.5)
    if (isinstance(readback_timeout, bool) or not isinstance(readback_timeout, (int, float))
            or not math.isfinite(readback_timeout) or not 0 < readback_timeout <= 5):
        raise ValueError("param_tuning.readback_timeout_sec must be above 0 and at most 5")
    bind_host = server.get("bind_host")
    origins = server.get("allowed_origins")
    if not isinstance(bind_host, str) or not bind_host:
        raise ValueError("server.bind_host must be a non-empty string")
    if not isinstance(origins, list) or not origins or not all(
        isinstance(origin, str) and origin for origin in origins
    ):
        raise ValueError("server.allowed_origins must contain one or more strings")
    config = WebServerConfig(
        bind_host=bind_host,
        port=int(server.get("port", 8765)),
        allowed_origins=tuple(origins),
        max_clients=int(server.get("max_clients", 8)),
        max_message_bytes=int(server.get("max_message_bytes", 65536)),
        bt_monitor_url=bt_monitor_url.rstrip("/"),
        bt_launcher_url=launcher_url.rstrip("/"),
        bt_launcher_timeout_sec=float(launcher_timeout),
        bt_tree_dir=launcher_paths["tree_dir"],
        bt_favorites_file=launcher_paths["favorites_file"],
        docker_restart_url=restart_url.rstrip("/"),
        docker_restart_timeout_sec=float(restart_timeout),
        docker_restart_service=restart_service if isinstance(restart_service, str) else "",
        param_catalog_file=(config_root / catalog_file) if catalog_file else None,
        param_readback_timeout_sec=float(readback_timeout),
        **timing,
    )
    if not 1 <= config.port <= 65535:
        raise ValueError("server.port must be from 1 through 65535")
    if not 1 <= config.max_clients <= 128:
        raise ValueError("server.max_clients must be from 1 through 128")
    if not 1024 <= config.max_message_bytes <= 1_048_576:
        raise ValueError("server.max_message_bytes must be from 1024 through 1048576")
    return config


class WebControlServer:
    """Serve the UI and move validated WebSocket messages into the ROS thread."""

    def __init__(
        self,
        *,
        config: WebServerConfig,
        manifest: dict[str, Any],
        static_root: str | Path,
        description_root: str | Path,
        calibration_config_file: str | Path,
        calibration_log_root: str | Path,
        on_command: Callable[[str, dict[str, Any]], None],
        on_client_connected: Callable[[str], None] | None,
        logger: Any,
        param_store: Any = None,
        param_store_error: str = "",
        param_reader: Callable[[dict[str, list[str]]], dict[str, Any]] | None = None,
    ) -> None:
        self.config = config
        self.manifest = manifest
        self.static_root = Path(static_root).resolve()
        self.description_root = Path(description_root).resolve()
        self.calibration_config_file = Path(calibration_config_file).resolve()
        self.calibration_log_root = Path(calibration_log_root).resolve()
        self.on_command = on_command
        self.on_client_connected = on_client_connected
        self.logger = logger
        # param_tuning.ParamStore (None when the catalog is disabled or broken) and the ROS readback.
        self.param_store = param_store
        self.param_store_error = param_store_error
        self.param_reader = param_reader
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._startup_error: BaseException | None = None
        self._clients: dict[str, Any] = {}
        self._runner: Any = None
        self._bt_session: Any = None
        # Last pushed behavior-tree view; new sockets get it right after hello.
        self._bt_runtime_latest: dict[str, Any] = dict(BT_RUNTIME_UNAVAILABLE)
        self._bt_runtime_task: asyncio.Task[None] | None = None
        self._bt_clients_present: asyncio.Event | None = None

    @property
    def read_only(self) -> bool:
        return False

    def start(self, timeout_sec: float = 5.0) -> None:
        if self._thread is not None:
            return
        self._thread = threading.Thread(
            target=self._thread_main,
            name="realman-web-control",
            daemon=True,
        )
        self._thread.start()
        if not self._ready.wait(timeout_sec):
            raise RuntimeError("web control server startup timed out")
        if self._startup_error is not None:
            raise RuntimeError(f"web control server failed: {self._startup_error}")

    def stop(self, timeout_sec: float = 5.0) -> None:
        loop = self._loop
        thread = self._thread
        if loop is None or thread is None:
            return
        future = asyncio.run_coroutine_threadsafe(self._shutdown(), loop)
        try:
            future.result(timeout=timeout_sec)
        except Exception as error:
            self.logger.error(f"Web control shutdown failed: {error}")
        loop.call_soon_threadsafe(loop.stop)
        thread.join(timeout=timeout_sec)
        self._thread = None

    def send_event(self, event: dict[str, Any], client_id: str | None = None) -> None:
        loop = self._loop
        if loop is None or not loop.is_running():
            return
        asyncio.run_coroutine_threadsafe(self._send_event(event, client_id), loop)

    def _thread_main(self) -> None:
        loop = asyncio.new_event_loop()
        self._loop = loop
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._start_async())
        except BaseException as error:
            self._startup_error = error
            self._ready.set()
            return
        self._ready.set()
        loop.run_forever()
        loop.close()

    async def _start_async(self) -> None:
        try:
            from aiohttp import web
        except ImportError as error:
            raise RuntimeError("python3-aiohttp is required") from error
        if not (self.static_root / "index.html").is_file():
            raise RuntimeError(f"Web UI is not built under {self.static_root}")
        app = web.Application(client_max_size=self.config.max_message_bytes)
        app.router.add_get("/healthz", self._health)
        app.router.add_get("/api/layout", self._layout)
        app.router.add_get("/api/bt/runtime", self._bt_runtime)
        app.router.add_get("/api/bt/trees", self._bt_trees)
        app.router.add_post("/api/bt/favorites", self._bt_favorite)
        app.router.add_post("/api/bt/start", self._bt_start)
        app.router.add_get("/api/docker/restart", self._docker_restart_status)
        app.router.add_post("/api/docker/restart", self._docker_restart)
        app.router.add_get("/api/params", self._params)
        app.router.add_get("/api/params/readback", self._params_readback)
        app.router.add_get("/api/params/history", self._params_history)
        app.router.add_get("/api/params/export", self._params_export)
        app.router.add_post("/api/params/apply", self._params_apply)
        app.router.add_post("/api/params/revert", self._params_revert)
        app.router.add_post("/api/params/baseline/reset", self._params_baseline_reset)
        app.router.add_post("/api/params/pending/clear", self._params_pending_clear)
        app.router.add_get("/api/calibration", self._calibration)
        app.router.add_get("/api/calibration/sessions", self._calibration_sessions)
        app.router.add_delete(
            "/api/calibration/sessions/{session_id}", self._delete_calibration_session
        )
        app.router.add_get("/api/calibration/preview/{path:.*}", self._calibration_preview)
        app.router.add_get("/ws", self._websocket)
        app.router.add_get("/models/{path:.*}", self._model_asset)
        app.router.add_get("/{path:.*}", self._static_asset)
        self._runner = web.AppRunner(app, access_log=None)
        await self._runner.setup()
        site = web.TCPSite(self._runner, self.config.bind_host, self.config.port)
        await site.start()
        if self.config.bt_monitor_url:
            self._bt_clients_present = asyncio.Event()
            self._bt_runtime_task = asyncio.create_task(self._push_bt_runtime())

    async def _shutdown(self) -> None:
        if self._bt_runtime_task is not None:
            self._bt_runtime_task.cancel()
            await asyncio.gather(self._bt_runtime_task, return_exceptions=True)
            self._bt_runtime_task = None
        clients = list(self._clients.values())
        if clients:
            await asyncio.gather(
                *(client.close(code=1001, message=b"server shutdown") for client in clients),
                return_exceptions=True,
            )
        if self._bt_session is not None:
            await self._bt_session.close()
            self._bt_session = None
        if self._runner is not None:
            await self._runner.cleanup()
            self._runner = None

    async def _health(self, _request: Any) -> Any:
        from aiohttp import web

        return web.json_response({"status": "ok", "read_only": self.read_only})

    async def _layout(self, _request: Any) -> Any:
        from aiohttp import web

        return web.json_response(self.manifest)

    async def _bt_runtime(self, _request: Any) -> Any:
        """One-shot read of the tree view; the page itself gets ``bt_runtime`` pushes over /ws."""
        from aiohttp import web

        return web.json_response(await self._read_bt_runtime(), headers={"Cache-Control": "no-store"})

    async def _read_bt_runtime(self) -> dict[str, Any]:
        """Fetch and compact the executor's snapshot; any failure reads as "no tree running"."""
        import time

        import aiohttp

        if not self.config.bt_monitor_url:
            return dict(BT_RUNTIME_UNAVAILABLE)
        if self._bt_session is None:
            self._bt_session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.config.bt_monitor_timeout_sec)
            )
        try:
            async with self._bt_session.get(f"{self.config.bt_monitor_url}/api/runtime") as response:
                if response.status != 200:
                    return dict(BT_RUNTIME_UNAVAILABLE)
                document = await response.json(content_type=None)
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            # bt-start stops the monitor when the tree exits, so a refused connection is normal.
            return dict(BT_RUNTIME_UNAVAILABLE)
        return compact_runtime_snapshot(
            document, int(time.time() * 1000), int(self.config.bt_monitor_stale_after_sec * 1000)
        )

    async def _push_bt_runtime(self) -> None:
        """Watch the monitor while browsers are connected and push each visible change.

        The executor rewrites its snapshot every tick, so ``timestamp_ms`` and ``sequence``
        change constantly; only a change in what the tree view draws is sent.
        """
        assert self._bt_clients_present is not None
        last_view: dict[str, Any] | None = None
        while True:
            if not self._clients:
                # Nobody is watching: stop reading, and do not greet the next page with an old tree.
                self._bt_runtime_latest = dict(BT_RUNTIME_UNAVAILABLE)
                self._bt_clients_present.clear()
                await self._bt_clients_present.wait()
                last_view = None
            payload = await self._read_bt_runtime()
            view = {key: value for key, value in payload.items() if key not in ("timestamp_ms", "sequence")}
            if view != last_view:
                last_view = view
                self._bt_runtime_latest = payload
                message = json.dumps({"type": "bt_runtime", "runtime": payload}, separators=(",", ":"))
                # Send to each socket on its own: one closing mid-send must not cost the others
                # this change (it is not resent) nor end the watcher; its handler cleans it up.
                await asyncio.gather(
                    *(socket.send_str(message) for socket in list(self._clients.values()) if not socket.closed),
                    return_exceptions=True,
                )
            await asyncio.sleep(self.config.bt_monitor_poll_period_sec)

    def _bt_launcher_enabled(self) -> bool:
        return bool(self.config.bt_launcher_url and self.config.bt_tree_dir and self.config.bt_favorites_file)

    async def _bt_launcher_call(self, method: str, path: str, body: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
        return await self._helper_call(
            f"{self.config.bt_launcher_url}{path}", method, self.config.bt_launcher_timeout_sec, body,
            "behavior-tree launcher is not reachable",
        )

    async def _helper_call(
        self, url: str, method: str, timeout_sec: float, body: dict[str, Any] | None, unreachable: str,
    ) -> tuple[int, dict[str, Any]]:
        """JSON request to a localhost helper; an unreachable helper becomes 503."""
        import aiohttp

        if self._bt_session is None:
            self._bt_session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.config.bt_monitor_timeout_sec)
            )
        try:
            async with self._bt_session.request(
                method, url, json=body, timeout=aiohttp.ClientTimeout(total=timeout_sec),
            ) as response:
                payload = await response.json(content_type=None)
                return response.status, payload if isinstance(payload, dict) else {}
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            return 503, {"ok": False, "error": unreachable}

    async def _bt_trees(self, _request: Any) -> Any:
        """Startable tree files (favorites first) and what the launcher is doing."""
        from aiohttp import web

        headers = {"Cache-Control": "no-store"}
        if not self._bt_launcher_enabled():
            return web.json_response({"available": False}, headers=headers)
        status_code, status = await self._bt_launcher_call("GET", "/status")
        trees = await asyncio.to_thread(list_trees, self.config.bt_tree_dir, self.config.bt_favorites_file)
        return web.json_response({
            "available": status_code == 200,
            "launcher": status if status_code == 200 else {"error": status.get("error", "")},
            "trees": trees,
        }, headers=headers)

    async def _bt_json_body(self, request: Any) -> dict[str, Any]:
        from aiohttp import web

        if not self._origin_allowed(request):
            raise web.HTTPForbidden(text="origin is not allowed")
        if not self._bt_launcher_enabled():
            raise web.HTTPNotFound(text="behavior-tree launcher is disabled")
        try:
            body = await request.json()
        except ValueError:
            body = None
        if not isinstance(body, dict):
            raise web.HTTPBadRequest(text="request body must be a JSON object")
        return body

    async def _bt_favorite(self, request: Any) -> Any:
        from aiohttp import web

        body = await self._bt_json_body(request)
        try:
            await asyncio.to_thread(
                set_favorite, self.config.bt_tree_dir, self.config.bt_favorites_file,
                body.get("name"), body.get("favorite"),
            )
        except ValueError as error:
            return web.json_response({"ok": False, "error": str(error)}, status=400)
        except OSError as error:
            self.logger.error(f"cannot write behavior-tree favorites: {error}")
            return web.json_response({"ok": False, "error": "favorites file is not writable"}, status=500)
        trees = await asyncio.to_thread(list_trees, self.config.bt_tree_dir, self.config.bt_favorites_file)
        return web.json_response({"ok": True, "trees": trees})

    async def _bt_start(self, request: Any) -> Any:
        from aiohttp import web

        body = await self._bt_json_body(request)
        tree, dry_run = body.get("tree"), body.get("dry_run")
        status_code, payload = await self._bt_launcher_call("POST", "/start", {"tree": tree, "dry_run": dry_run})
        log = getattr(self.logger, "warning", None) or self.logger.error
        log(f"Web start of behavior tree {tree!r} (dry_run={dry_run}) -> {status_code} {payload.get('error', '')}")
        return web.json_response(payload, status=status_code)

    async def _docker_restart_call(self, method: str, path: str, body: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
        return await self._helper_call(
            f"{self.config.docker_restart_url}{path}", method, self.config.docker_restart_timeout_sec, body,
            "host restart helper is not reachable (./rm65 restart-helper install)",
        )

    async def _docker_restart_status(self, _request: Any) -> Any:
        """Whether the restart button can work and what the last restart did."""
        from aiohttp import web

        headers = {"Cache-Control": "no-store"}
        if not self.config.docker_restart_url:
            return web.json_response({"available": False}, headers=headers)
        status_code, status = await self._docker_restart_call("GET", "/status")
        return web.json_response({
            "available": status_code == 200,
            "service": self.config.docker_restart_service,
            **({"helper": status} if status_code == 200 else {"error": status.get("error", "")}),
        }, headers=headers)

    async def _docker_restart(self, request: Any) -> Any:
        """Restart the configured Compose service; the browser cannot pick another one."""
        from aiohttp import web

        if not self._origin_allowed(request):
            raise web.HTTPForbidden(text="origin is not allowed")
        if not self.config.docker_restart_url:
            raise web.HTTPNotFound(text="docker restart is disabled")
        service = self.config.docker_restart_service
        status_code, payload = await self._docker_restart_call("POST", "/restart", {"service": service})
        if status_code == 200 and self.param_store is not None:
            # The parameter page's "needs a bringup restart" list is satisfied by this restart.
            await asyncio.to_thread(self.param_store.clear_pending)
        log = getattr(self.logger, "warning", None) or self.logger.error
        log(f"Web restart of Docker service {service!r} from {request.remote} -> {status_code} {payload.get('error', '')}")
        return web.json_response(payload, status=status_code)

    def _param_store_or_raise(self) -> Any:
        from aiohttp import web

        if self.config.param_catalog_file is None:
            raise web.HTTPNotFound(text="parameter tuning is disabled")
        if self.param_store is None:
            raise web.HTTPServiceUnavailable(text=self.param_store_error or "parameter catalog unavailable")
        return self.param_store

    async def _params(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        snapshot = await asyncio.to_thread(store.snapshot)
        return web.json_response(snapshot, headers={"Cache-Control": "no-store"})

    async def _params_readback(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        result = await asyncio.to_thread(store.readback, self.param_reader)
        return web.json_response(result, headers={"Cache-Control": "no-store"})

    async def _params_history(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        entries = await asyncio.to_thread(store.history)
        return web.json_response({"entries": entries}, headers={"Cache-Control": "no-store"})

    async def _params_export(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        patch = await asyncio.to_thread(store.export_patch)
        return web.Response(
            text=patch,
            content_type="text/x-diff",
            headers={"Content-Disposition": 'attachment; filename="param-tuning.patch"', "Cache-Control": "no-store"},
        )

    async def _params_body(self, request: Any) -> tuple[Any, dict[str, Any]]:
        from aiohttp import web

        if not self._origin_allowed(request):
            raise web.HTTPForbidden(text="origin is not allowed")
        store = self._param_store_or_raise()
        try:
            body = await request.json()
        except ValueError:
            body = None
        if not isinstance(body, dict):
            raise web.HTTPBadRequest(text="request body must be a JSON object")
        return store, body

    async def _params_write(self, request: Any, action: str, call: Callable[[], dict[str, Any]], dry_run: bool) -> Any:
        from aiohttp import web

        try:
            result = await asyncio.to_thread(call)
        except ChangeError as error:
            return web.json_response({"error": str(error), "errors": error.errors}, status=400)
        except ConflictError as error:
            return web.json_response({"error": str(error), "files": error.files}, status=409)
        except ParamWriteError as error:
            self.logger.error(f"Parameter page {action} failed: {error}")
            return web.json_response({"error": str(error)}, status=500)
        if not dry_run:
            summary = ", ".join(f"{c['id']}={c['before']!r}->{c['after']!r}" for c in result.get("changes", []))
            log = getattr(self.logger, "warning", None) or self.logger.error
            log(f"Parameter page {action} {result.get('id')} from {request.remote}: {summary}")
        return web.json_response(result)

    async def _params_apply(self, request: Any) -> Any:
        store, body = await self._params_body(request)
        dry_run = body.get("dry_run") is True
        return await self._params_write(
            request, "write", lambda: store.apply(body.get("changes"), body.get("expected_sha"), dry_run), dry_run,
        )

    async def _params_revert(self, request: Any) -> Any:
        store, body = await self._params_body(request)
        dry_run = body.get("dry_run") is True
        return await self._params_write(
            request, "revert", lambda: store.revert(body.get("entry"), body.get("expected_sha"), dry_run), dry_run,
        )

    async def _params_baseline_reset(self, request: Any) -> Any:
        from aiohttp import web

        store, _body = await self._params_body(request)
        result = await asyncio.to_thread(store.reset_baseline)
        log = getattr(self.logger, "warning", None) or self.logger.error
        log(f"Parameter page baseline reset from {request.remote}: {result['files']}")
        return web.json_response(result)

    async def _params_pending_clear(self, request: Any) -> Any:
        from aiohttp import web

        store, _body = await self._params_body(request)
        return web.json_response(await asyncio.to_thread(store.clear_pending))

    async def _calibration(self, _request: Any) -> Any:
        from aiohttp import web

        try:
            with self.calibration_config_file.open(encoding="utf-8") as stream:
                config = yaml.safe_load(stream) or {}
        except OSError as error:
            self.logger.error(f"Calibration config could not be read: {error}")
            raise web.HTTPServiceUnavailable(text="calibration configuration unavailable") from error
        return web.json_response(config)

    def _calibration_sessions_root(self) -> Path:
        return (self.calibration_log_root / "camera_calibration").resolve()

    @staticmethod
    def _valid_calibration_session_id(session_id: str) -> bool:
        return bool(re.fullmatch(r"session-[0-9TZ.\-]+", session_id))

    def _calibration_session_directory(self, session_id: str) -> Path | None:
        """Return one direct session child, never a caller-selected filesystem path."""
        if not self._valid_calibration_session_id(session_id):
            return None
        root = self._calibration_sessions_root()
        candidate = (root / session_id).resolve()
        return candidate if candidate.parent == root else None

    def _calibration_session_summary(self, directory: Path) -> dict[str, Any] | None:
        session_id = directory.name
        if not self._valid_calibration_session_id(session_id):
            return None
        sample_counts = {arm: 0 for arm in ("l", "m", "r")}
        try:
            for metadata_path in (directory / "batches").glob("*/*.json"):
                try:
                    sample = json.loads(metadata_path.read_text(encoding="utf-8"))
                    sample_id = str(sample.get("sample_id", ""))
                    arm = sample_id.split("-", 1)[0]
                    if arm in sample_counts and isinstance(sample.get("base_to_tool"), list):
                        sample_counts[arm] += 1
                except (OSError, ValueError, json.JSONDecodeError):
                    continue
            return {
                "session_id": session_id,
                "created_at": datetime.fromtimestamp(
                    directory.stat().st_mtime, tz=timezone.utc
                ).isoformat(),
                "sample_counts": sample_counts,
                "solved": (directory / "calibration_result.json").is_file(),
            }
        except OSError:
            # A concurrent capture may replace a batch while it is being inspected.
            return None

    def _list_calibration_sessions(self, delete_empty: bool = False) -> tuple[list[dict[str, Any]], list[str]]:
        """Return valid sessions and optionally remove only sessions with no accepted samples."""
        root = self._calibration_sessions_root()
        try:
            directories = [path for path in root.iterdir() if path.is_dir()]
        except FileNotFoundError:
            return [], []
        sessions: list[dict[str, Any]] = []
        deleted: list[str] = []
        for directory in directories:
            summary = self._calibration_session_summary(directory)
            if summary is None:
                continue
            if delete_empty and not any(summary["sample_counts"].values()):
                try:
                    shutil.rmtree(directory)
                    deleted.append(summary["session_id"])
                except OSError as error:
                    self.logger.error(
                        f"Empty calibration session {summary['session_id']} could not be deleted: {error}"
                    )
                continue
            sessions.append(summary)
        sessions.sort(key=lambda item: item["session_id"], reverse=True)
        return sessions, deleted

    async def _calibration_sessions(self, request: Any) -> Any:
        """List recoverable sessions and optionally prune sessions with no accepted samples."""
        from aiohttp import web

        try:
            delete_empty = request.query.get("delete_empty", "false").lower() == "true"
            sessions, deleted = self._list_calibration_sessions(delete_empty)
        except OSError as error:
            self.logger.error(f"Calibration sessions could not be read: {error}")
            raise web.HTTPServiceUnavailable(text="calibration sessions unavailable") from error
        return web.json_response({"sessions": sessions, "deleted_session_ids": deleted})

    async def _delete_calibration_session(self, request: Any) -> Any:
        """Delete one operator-selected session after the browser's explicit confirmation."""
        from aiohttp import web

        session_id = request.match_info["session_id"]
        directory = self._calibration_session_directory(session_id)
        if directory is None or not directory.is_dir():
            raise web.HTTPNotFound(text="calibration session does not exist")
        try:
            shutil.rmtree(directory)
        except OSError as error:
            self.logger.error(f"Calibration session {session_id} could not be deleted: {error}")
            raise web.HTTPServiceUnavailable(text="calibration session could not be deleted") from error
        return web.json_response({"deleted_session_id": session_id})

    async def _calibration_preview(self, request: Any) -> Any:
        from aiohttp import web

        relative = Path(request.match_info["path"])
        if relative.is_absolute() or ".." in relative.parts:
            raise web.HTTPNotFound()
        candidate = (self.calibration_log_root / relative).resolve()
        root = self.calibration_log_root
        if candidate != root and root not in candidate.parents:
            raise web.HTTPNotFound()
        if not candidate.is_file() or candidate.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            raise web.HTTPNotFound()
        return web.FileResponse(candidate)

    def _origin_allowed(self, request: Any) -> bool:
        origin = request.headers.get("Origin")
        if not origin:
            return True
        if origin in self.config.allowed_origins:
            return True
        if "same-origin" not in self.config.allowed_origins:
            return False
        parsed = urlsplit(origin)
        return parsed.scheme == request.scheme and parsed.netloc == request.host

    async def _websocket(self, request: Any) -> Any:
        from aiohttp import WSMsgType, web

        if not self._origin_allowed(request):
            raise web.HTTPForbidden(text="WebSocket origin is not allowed")
        if len(self._clients) >= self.config.max_clients:
            raise web.HTTPServiceUnavailable(text="maximum WebSocket clients reached")
        socket = web.WebSocketResponse(
            heartbeat=20.0,
            max_msg_size=self.config.max_message_bytes,
            autoping=True,
        )
        await socket.prepare(request)
        client_id = uuid.uuid4().hex
        self._clients[client_id] = socket
        await socket.send_json(
            {
                "type": "hello",
                "client_id": client_id,
                "read_only": self.read_only,
                "layout": self.manifest,
            }
        )
        await socket.send_json({"type": "bt_runtime", "runtime": self._bt_runtime_latest})
        if self._bt_clients_present is not None:
            self._bt_clients_present.set()
        if self.on_client_connected is not None:
            self.on_client_connected(client_id)
        try:
            async for incoming in socket:
                if incoming.type != WSMsgType.TEXT:
                    if incoming.type in (WSMsgType.CLOSE, WSMsgType.CLOSED, WSMsgType.ERROR):
                        break
                    await socket.send_json(
                        ProtocolError("invalid_message", "only text JSON messages are accepted").event()
                    )
                    continue
                try:
                    message = parse_message(
                        incoming.data,
                        max_bytes=self.config.max_message_bytes,
                    )
                    if message["type"] == "ping":
                        await socket.send_json({"type": "pong"})
                        continue
                    self.on_command(client_id, message)
                except ProtocolError as error:
                    await socket.send_json(error.event())
        finally:
            self._clients.pop(client_id, None)
            self.on_command(client_id, {"type": "client_disconnected"})
        return socket

    async def _model_asset(self, request: Any) -> Any:
        from aiohttp import web

        try:
            path = resolve_model_asset(self.description_root, request.match_info["path"])
        except ValueError as error:
            raise web.HTTPNotFound() from error
        return web.FileResponse(path)

    async def _static_asset(self, request: Any) -> Any:
        from aiohttp import web

        relative = request.match_info["path"] or "index.html"
        requested = Path(relative)
        if requested.is_absolute() or ".." in requested.parts:
            raise web.HTTPNotFound()
        candidate = self.static_root / requested
        if candidate.is_file():
            return web.FileResponse(candidate)
        if "." not in requested.name:
            index_file = self.static_root / "index.html"
            if index_file.is_file():
                return web.FileResponse(index_file)
        raise web.HTTPNotFound()

    async def _send_event(self, event: dict[str, Any], client_id: str | None) -> None:
        payload = json.dumps(event, ensure_ascii=True, separators=(",", ":"))
        targets = (
            [self._clients[client_id]]
            if client_id is not None and client_id in self._clients
            else list(self._clients.values()) if client_id is None else []
        )
        for socket in targets:
            if not socket.closed:
                await socket.send_str(payload)
