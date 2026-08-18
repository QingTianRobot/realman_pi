"""aiohttp server running on a dedicated asyncio thread."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import hmac
import json
import os
from pathlib import Path
import threading
from typing import Any, Callable
from urllib.parse import urlsplit
import uuid

import yaml

from .model_manifest import resolve_model_asset
from .protocol import ProtocolError, parse_message, require_control


@dataclass(frozen=True)
class WebServerConfig:
    bind_host: str
    port: int
    control_enabled: bool
    control_token_env: str
    allowed_origins: tuple[str, ...]
    max_clients: int
    max_message_bytes: int


def load_server_config(path: str | Path) -> WebServerConfig:
    with Path(path).open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream)
    if not isinstance(document, dict) or not isinstance(document.get("server"), dict):
        raise ValueError("web control config must contain a server mapping")
    server = document["server"]
    bind_host = server.get("bind_host")
    token_env = server.get("control_token_env")
    origins = server.get("allowed_origins")
    if not isinstance(bind_host, str) or not bind_host:
        raise ValueError("server.bind_host must be a non-empty string")
    if not isinstance(token_env, str) or not token_env:
        raise ValueError("server.control_token_env must be a non-empty string")
    if not isinstance(origins, list) or not origins or not all(
        isinstance(origin, str) and origin for origin in origins
    ):
        raise ValueError("server.allowed_origins must contain one or more strings")
    config = WebServerConfig(
        bind_host=bind_host,
        port=int(server.get("port", 8765)),
        control_enabled=bool(server.get("control_enabled", False)),
        control_token_env=token_env,
        allowed_origins=tuple(origins),
        max_clients=int(server.get("max_clients", 8)),
        max_message_bytes=int(server.get("max_message_bytes", 65536)),
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
        on_command: Callable[[str, dict[str, Any]], None],
        logger: Any,
    ) -> None:
        self.config = config
        self.manifest = manifest
        self.static_root = Path(static_root).resolve()
        self.description_root = Path(description_root).resolve()
        self.on_command = on_command
        self.logger = logger
        self._token = os.environ.get(config.control_token_env, "")
        self._control_available = bool(config.control_enabled and self._token)
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._startup_error: BaseException | None = None
        self._clients: dict[str, Any] = {}
        self._authenticated: set[str] = set()
        self._runner: Any = None

    @property
    def read_only(self) -> bool:
        return not self._control_available

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
        app.router.add_get("/ws", self._websocket)
        app.router.add_get("/models/{path:.*}", self._model_asset)
        app.router.add_get("/{path:.*}", self._static_asset)
        self._runner = web.AppRunner(app, access_log=None)
        await self._runner.setup()
        site = web.TCPSite(self._runner, self.config.bind_host, self.config.port)
        await site.start()

    async def _shutdown(self) -> None:
        clients = list(self._clients.values())
        if clients:
            await asyncio.gather(
                *(client.close(code=1001, message=b"server shutdown") for client in clients),
                return_exceptions=True,
            )
        if self._runner is not None:
            await self._runner.cleanup()
            self._runner = None

    async def _health(self, _request: Any) -> Any:
        from aiohttp import web

        return web.json_response({"status": "ok", "read_only": self.read_only})

    async def _layout(self, _request: Any) -> Any:
        from aiohttp import web

        return web.json_response(self.manifest)

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
                "authentication_required": not self.read_only,
                "layout": self.manifest,
            }
        )
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
                    if message["type"] == "authenticate":
                        if not self._control_available:
                            raise ProtocolError("control_disabled", "web control is read-only on this server")
                        if not hmac.compare_digest(message["token"], self._token):
                            raise ProtocolError("authentication_failed", "control token is invalid")
                        self._authenticated.add(client_id)
                        await socket.send_json({"type": "authenticated", "client_id": client_id})
                        continue
                    if message["type"] == "ping":
                        await socket.send_json({"type": "pong"})
                        continue
                    require_control(
                        message,
                        authenticated=client_id in self._authenticated,
                        enabled=self._control_available,
                    )
                    self.on_command(client_id, message)
                except ProtocolError as error:
                    await socket.send_json(error.event())
        finally:
            self._clients.pop(client_id, None)
            self._authenticated.discard(client_id)
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
        candidate = (self.static_root / relative).resolve()
        if self.static_root not in candidate.parents and candidate != self.static_root:
            raise web.HTTPNotFound()
        if candidate.is_file():
            return web.FileResponse(candidate)
        if "." not in Path(relative).name:
            return web.FileResponse(self.static_root / "index.html")
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

