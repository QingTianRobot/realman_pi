"""Dedicated aiohttp/WebSocket shell for the read-only recording dashboard.

This server has a private event loop/thread.  It receives only coalesced state snapshots
from the bridge and must never call archive/session/camera worker code.  Slow clients
are dropped rather than allowed to accumulate a durable-data backlog.
"""
from __future__ import annotations

import asyncio
import json
import threading
from pathlib import Path
from typing import Any


def load_replay_index(dataset_dir: Path) -> dict[str, Any]:
    """Load one browser replay index and reject paths that escape its dataset."""
    index_path = dataset_dir / "replay.json"
    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError("replay index is unreadable") from error
    if not isinstance(payload, dict) or not isinstance(payload.get("frames"), list):
        raise ValueError("replay index has no frames")
    for frame in payload["frames"]:
        if not isinstance(frame, dict) or not isinstance(frame.get("timestamp_ns"), int):
            raise ValueError("replay frame is invalid")
        cameras = frame.get("cameras", {})
        if not isinstance(cameras, dict):
            raise ValueError("replay cameras are invalid")
        for relative_path in cameras.values():
            relative = Path(str(relative_path))
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError("camera path escapes dataset")
    return payload


class RecordingWebServer:
    def __init__(
        self,
        *,
        bind_host: str,
        port: int,
        static_root: str | Path,
        manifest: dict[str, Any],
        description_root: str | Path,
        lerobot_root: str | Path,
        logger: Any,
    ) -> None:
        self._bind_host = bind_host
        self._port = port
        self._static_root = Path(static_root).resolve()
        self._manifest = manifest
        self._description_root = Path(description_root).resolve()
        self._lerobot_root = Path(lerobot_root).resolve()
        self._logger = logger
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._startup_error: BaseException | None = None
        self._clients: set[Any] = set()
        self._runner: Any = None
        self._preview_lock = threading.Lock()
        self._previews: dict[str, bytes] = {}
        self._snapshot_lock = threading.Lock()
        self._pending_snapshot: dict[str, Any] | None = None
        self._snapshot_flush_scheduled = False

    def start(self) -> None:
        if self._thread is not None:
            return
        self._thread = threading.Thread(target=self._thread_main, name="recording-web", daemon=True)
        self._thread.start()
        if not self._ready.wait(timeout=5.0):
            raise RuntimeError("recording web server startup timed out")
        if self._startup_error is not None:
            raise RuntimeError(f"recording web server startup failed: {self._startup_error}")

    def stop(self) -> None:
        loop, thread = self._loop, self._thread
        if loop is None or thread is None:
            return
        future = asyncio.run_coroutine_threadsafe(self._shutdown(), loop)
        future.result(timeout=5.0)
        loop.call_soon_threadsafe(loop.stop)
        thread.join(timeout=5.0)
        self._thread = None

    def send_snapshot(self, payload: dict[str, Any]) -> None:
        """Coalesce snapshots so slow clients cannot create an asyncio backlog."""
        loop = self._loop
        if loop is None or not loop.is_running():
            return
        with self._snapshot_lock:
            self._pending_snapshot = payload
            if self._snapshot_flush_scheduled:
                return
            self._snapshot_flush_scheduled = True
        asyncio.run_coroutine_threadsafe(self._flush_snapshot(), loop)

    def send_event(self, payload: dict[str, Any]) -> None:
        """Schedule a small lifecycle event without waiting for any WebSocket client."""
        loop = self._loop
        if loop is not None and loop.is_running():
            asyncio.run_coroutine_threadsafe(self._broadcast(payload), loop)

    async def _flush_snapshot(self) -> None:
        """Send newest state and discard intermediate snapshots by design."""
        while True:
            with self._snapshot_lock:
                payload = self._pending_snapshot
                self._pending_snapshot = None
            if payload is None:
                with self._snapshot_lock:
                    if self._pending_snapshot is None:
                        self._snapshot_flush_scheduled = False
                        return
                    payload = self._pending_snapshot
                    self._pending_snapshot = None
                if payload is None:
                    return
            await self._broadcast(payload)

    def set_preview(self, camera_id: str, jpeg: bytes) -> None:
        """Replace one preview frame; producer threads never wait for Web clients."""
        if not camera_id or not jpeg:
            return
        with self._preview_lock:
            self._previews[camera_id] = jpeg

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
            raise RuntimeError("python3-aiohttp is required for recording Web display") from error
        app = web.Application(client_max_size=16_384)
        app.router.add_get("/healthz", self._health)
        app.router.add_get("/api/layout", self._layout)
        app.router.add_get("/ws", self._websocket)
        app.router.add_get("/preview/{camera_id}.jpg", self._preview)
        app.router.add_get("/models/{path:.*}", self._model_asset)
        app.router.add_get("/api/lerobot", self._lerobot_list)
        app.router.add_get("/api/lerobot/{session}/frames", self._lerobot_frames)
        app.router.add_get("/api/lerobot/{session}/frames/{index}/cameras/{camera}", self._lerobot_camera)
        app.router.add_get("/api/lerobot/{session}/videos/{path:.*}", self._lerobot_video)
        app.router.add_get("/{path:.*}", self._static_asset)
        self._runner = web.AppRunner(app, access_log=None)
        await self._runner.setup()
        await web.TCPSite(self._runner, self._bind_host, self._port).start()

    async def _shutdown(self) -> None:
        for client in list(self._clients):
            await client.close(code=1001, message=b"recording server shutdown")
        if self._runner is not None:
            await self._runner.cleanup()
            self._runner = None

    async def _health(self, _request: Any) -> Any:
        from aiohttp import web
        return web.json_response({"status": "ok", "read_only_robot": True})

    async def _layout(self, _request: Any) -> Any:
        from aiohttp import web
        return web.json_response(self._manifest)

    async def _model_asset(self, request: Any) -> Any:
        from aiohttp import web
        relative = Path(request.match_info["path"])
        if relative.is_absolute() or ".." in relative.parts:
            raise web.HTTPNotFound(text="model asset does not exist")
        candidate = self._description_root / relative
        if self._description_root not in candidate.parents or not candidate.is_file():
            raise web.HTTPNotFound(text="model asset does not exist")
        return web.FileResponse(candidate)

    async def _static_asset(self, request: Any) -> Any:
        from aiohttp import web
        relative = Path(request.match_info["path"] or "index.html")
        if relative.is_absolute() or ".." in relative.parts:
            raise web.HTTPNotFound(text="static asset does not exist")
        candidate = self._static_root / relative
        if self._static_root in candidate.parents and candidate.is_file():
            return web.FileResponse(candidate)
        index_file = self._static_root / "index.html"
        if index_file.is_file():
            return web.FileResponse(index_file)
        raise web.HTTPNotFound(text="static asset does not exist")

    async def _preview(self, request: Any) -> Any:
        from aiohttp import web
        camera_id = request.match_info["camera_id"]
        with self._preview_lock:
            jpeg = self._previews.get(camera_id)
        if jpeg is None:
            raise web.HTTPNotFound(text="preview is not available")
        return web.Response(body=jpeg, content_type="image/jpeg", headers={"Cache-Control": "no-store"})

    async def _lerobot_list(self, _request: Any) -> Any:
        from aiohttp import web
        sessions = []
        if self._lerobot_root.is_dir():
            for child in sorted(self._lerobot_root.iterdir()):
                if child.is_dir() and (child / "replay.json").is_file():
                    try:
                        replay = load_replay_index(child)
                    except ValueError:
                        continue
                    sessions.append({"session_id": child.name, "frames": len(replay["frames"])})
        return web.json_response({"sessions": sessions})

    async def _lerobot_frames(self, request: Any) -> Any:
        from aiohttp import web
        session = Path(request.match_info["session"])
        if session.name != str(session) or ".." in session.parts:
            raise web.HTTPNotFound(text="invalid session")
        dataset = self._lerobot_root / session
        if not dataset.is_dir():
            raise web.HTTPNotFound(text="dataset not found")
        try:
            return web.json_response(load_replay_index(dataset))
        except ValueError as error:
            raise web.HTTPNotFound(text=str(error)) from error

    async def _lerobot_camera(self, request: Any) -> Any:
        from aiohttp import web
        session = Path(request.match_info["session"])
        if session.name != str(session) or ".." in session.parts:
            raise web.HTTPNotFound(text="invalid session")
        try:
            index = int(request.match_info["index"])
        except ValueError as error:
            raise web.HTTPNotFound(text="invalid frame index") from error
        try:
            replay = load_replay_index(self._lerobot_root / session)
            relative = Path(str(replay["frames"][index]["cameras"][request.match_info["camera"]]))
        except (IndexError, KeyError, ValueError):
            raise web.HTTPNotFound(text="replay camera frame not found")
        candidate = self._lerobot_root / session / relative
        if not candidate.is_file():
            raise web.HTTPNotFound(text="replay camera frame not found")
        return web.FileResponse(candidate, headers={"Cache-Control": "no-store"})

    async def _lerobot_video(self, request: Any) -> Any:
        from aiohttp import web
        session = Path(request.match_info["session"])
        relative = Path(request.match_info["path"])
        if session.name != str(session) or ".." in session.parts or relative.is_absolute() or ".." in relative.parts:
            raise web.HTTPNotFound(text="invalid path")
        candidate = self._lerobot_root / session / "videos" / "chunk-000" / relative
        if not candidate.is_file():
            raise web.HTTPNotFound(text="video not found")
        return web.FileResponse(candidate)

    async def _websocket(self, request: Any) -> Any:
        from aiohttp import web
        socket = web.WebSocketResponse(heartbeat=20.0)
        await socket.prepare(request)
        self._clients.add(socket)
        await socket.send_json({"type": "hello", "read_only_robot": True})
        try:
            async for message in socket:
                # Read-only dashboard: the browser never sends commands, so any inbound
                # text is rejected rather than forwarded to a (nonexistent) control path.
                if message.type == web.WSMsgType.TEXT:
                    await socket.send_json(
                        {
                            "type": "error",
                            "code": "read_only_robot",
                            "message": "recording dashboard is read-only",
                        }
                    )
        finally:
            self._clients.discard(socket)
        return socket

    async def _broadcast(self, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, separators=(",", ":"))
        stale = []
        # Iterate over a snapshot: a client can connect or drop while `send_str`
        # yields to the loop, and mutating a set mid-iteration raises RuntimeError
        # (which, swallowed by the caller's future, would wedge the flush forever).
        for client in list(self._clients):
            try:
                # A browser that cannot drain one small state snapshot promptly is a
                # preview concern, never a reason to delay other browser clients.
                await asyncio.wait_for(client.send_str(encoded), timeout=1.0)
            except Exception:
                stale.append(client)
        for client in stale:
            self._clients.discard(client)
