"""aiohttp server running on a dedicated asyncio thread."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil
import threading
from typing import Any, Callable
from urllib.parse import urlsplit
import uuid

import yaml

from .model_manifest import resolve_model_asset
from .protocol import ProtocolError, parse_message


@dataclass(frozen=True)
class WebServerConfig:
    bind_host: str
    port: int
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
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._startup_error: BaseException | None = None
        self._clients: dict[str, Any] = {}
        self._runner: Any = None

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
