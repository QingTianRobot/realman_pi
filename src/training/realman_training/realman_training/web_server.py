"""The training console's HTTP server (aiohttp): read APIs, token-gated job triggers and a job-log WebSocket.

Every write is POST /api/jobs (parameters built by job_params, started through jobs.JobStore) or PUT
/api/serve/settings, and needs REALMAN_TRAINING_TOKEN in the X-Training-Token header; an empty token makes the
console read-only. Blocking work (dataset scans, nvidia-smi, ssh) runs in the default executor. The UI is the Vite
build in realman_training/static/ (website: npm run build:training).
"""

from __future__ import annotations

import asyncio
import hmac
import json
import time
from pathlib import Path
from typing import Callable

from aiohttp import web

from . import catalog, gpus as gpu_mod, linkcheck, serving
from .catalog import BadRequest, NotFound
from .config import ARMS, ConsoleConfig
from .jobs import ACTIVE, JobConflict, JobStore, now
from .runner import Runner
from .summary_cache import SummaryCache

STATIC_ROOT = Path(__file__).resolve().parent / "static"
TOKEN_ENV = "REALMAN_TRAINING_TOKEN"
TOKEN_HEADER = "X-Training-Token"
_LOG_START_BYTES = 256 * 1024  # a WebSocket starts at most this far from the end of a long log
_POLL_SEC = 0.5


class TtlCache:
    def __init__(self, ttl: float, clock: Callable[[], float] = time.monotonic):
        self._ttl, self._clock = ttl, clock
        self._value: dict | None = None
        self._at = 0.0
        self._lock = asyncio.Lock()

    async def get(self, compute: Callable[[], dict], force: bool = False) -> dict:
        async with self._lock:
            if not force and self._value is not None and self._clock() - self._at < self._ttl:
                return self._value
            value = await asyncio.get_running_loop().run_in_executor(None, compute)
            self._value, self._at = {**value, "at": now()}, self._clock()
            return self._value


def _error(status: int, message: str) -> web.Response:
    return web.json_response({"error": message}, status=status)


@web.middleware
async def _errors(request, handler):
    try:
        return await handler(request)
    except web.HTTPException:
        raise
    except BadRequest as error:
        return _error(400, str(error))
    except NotFound as error:
        return _error(404, str(error))
    except JobConflict as error:
        return _error(409, str(error))


class Console:
    def __init__(self, config: ConsoleConfig, *, token: str = "", store: JobStore | None = None,
                 targets: dict[str, str] | None = None, runner: Runner | None = None,
                 serve_status: Callable[[], dict] | None = None, gpu_query: Callable[[], dict] | None = None,
                 static_root: str | Path = STATIC_ROOT, clock: Callable[[], float] = time.monotonic):
        self.config = config
        self.token = token or ""
        self.store = store or JobStore(config.console_dir)
        self.targets = targets or {}
        runner = runner or Runner()
        self._serve_status = serve_status or (lambda: serving.status(config, runner))
        self._gpu_query = gpu_query or (lambda: gpu_mod.query(runner, busy_mib=config.openpi.gpu_busy_mib,
                                                              passwd=Path(config.web.passwd_file)))
        self.summaries = SummaryCache(config.quality)
        self.serve_cache = TtlCache(config.web.serve_status_ttl_sec, clock)
        self.gpu_cache = TtlCache(config.web.gpu_ttl_sec, clock)
        self.static_root = Path(static_root).resolve()

    @property
    def read_only(self) -> bool:
        return not self.token

    # ---- plumbing -------------------------------------------------------------------------------------------
    async def _blocking(self, function, *args):
        return await asyncio.get_running_loop().run_in_executor(None, function, *args)

    def _require_token(self, request) -> None:
        if self.read_only:
            raise web.HTTPForbidden(text=json.dumps({"error": f"read-only console: {TOKEN_ENV} is not set"}),
                                    content_type="application/json")
        given = request.headers.get(TOKEN_HEADER, "")
        if not hmac.compare_digest(given.encode(), self.token.encode()):
            raise web.HTTPUnauthorized(text=json.dumps({"error": "wrong or missing token"}),
                                       content_type="application/json")

    async def _body(self, request) -> dict:
        try:
            body = await request.json()
        except (ValueError, UnicodeDecodeError):
            raise BadRequest("the body must be JSON") from None
        if not isinstance(body, dict):
            raise BadRequest("the body must be a JSON object")
        return body

    def _running(self, kind: str, match: Callable[[dict], bool] = lambda params: True) -> dict | None:
        for job in self.store.list(kind=kind, limit=20):
            row = catalog.job_row(job)
            if row["state"] in ACTIVE and match(row["params"]):
                return row
        return None

    def app(self) -> web.Application:
        app = web.Application(client_max_size=1 << 20, middlewares=[_errors])
        r = app.router
        r.add_get("/api/health", self.health)
        r.add_get("/api/datasets", self.datasets)
        r.add_get("/api/dataset", self.dataset)
        r.add_get("/api/jobs", self.jobs)
        r.add_post("/api/jobs", self.start_job)
        r.add_get("/api/jobs/{id}", self.job)
        r.add_get("/api/jobs/{id}/log", self.job_log)
        r.add_post("/api/jobs/{id}/cancel", self.cancel_job)
        r.add_get("/api/runs", self.runs)
        r.add_get("/api/runs/{config}/{exp}", self.run)
        r.add_get("/api/models", self.models)
        r.add_get("/api/gpus", self.gpus)
        r.add_get("/api/serve", self.serve)
        r.add_get("/api/serve/settings", self.settings)
        r.add_put("/api/serve/settings", self.save_settings)
        r.add_get("/api/linkcheck", self.linkcheck)
        r.add_get("/api/options", self.options)
        r.add_get("/{path:.*}", self.static)
        return app

    # ---- reads ----------------------------------------------------------------------------------------------
    async def health(self, request):
        return web.json_response({"ok": True, "read_only": self.read_only, "data_root": str(self.config.data_root),
                                  "console_dir": str(self.config.console_dir), "time": now()})

    async def datasets(self, request):
        rows = await self._blocking(catalog.list_datasets, self.config, self.summaries)
        return web.json_response({"root": str(self.config.data_root), "datasets": rows})

    async def dataset(self, request):
        rel = request.query.get("path", "")
        return web.json_response(await self._blocking(catalog.dataset_detail, self.config, self.summaries, rel))

    async def jobs(self, request):
        kind = request.query.get("kind") or None
        try:
            limit = max(1, min(200, int(request.query.get("limit", "30"))))
        except ValueError:
            raise BadRequest("limit must be a number") from None

        def rows():
            self.store.recover()
            return [catalog.job_row(job) for job in self.store.list(kind=kind, limit=limit)]

        return web.json_response({"jobs": await self._blocking(rows)})

    def _job(self, request):
        try:
            return self.store.get(request.match_info["id"])
        except KeyError:
            raise NotFound(f"no job {request.match_info['id']}") from None

    async def job(self, request):
        job = self._job(request)
        return web.json_response({"job": catalog.job_row(job), "log": job.log_text(self.config.web.log_tail_lines)})

    async def runs(self, request):
        return web.json_response({"runs": await self._blocking(catalog.list_runs, self.config)})

    async def run(self, request):
        config_name, exp = request.match_info["config"], request.match_info["exp"]
        detail = await self._blocking(catalog.run_detail, self.config, config_name, exp)
        detail["job"] = self._running("train", lambda p: p.get("exp") == exp and p.get("config_name") == config_name)
        return web.json_response(detail)

    async def models(self, request):
        return web.json_response(await self._blocking(catalog.list_models, self.config))

    async def gpus(self, request):
        return web.json_response(await self.gpu_cache.get(self._gpu_query, force=request.query.get("refresh") == "1"))

    def _safe_serve_status(self) -> dict:
        try:
            return self._serve_status()
        except Exception as error:  # noqa: BLE001 - the page shows why the status is unknown
            return {"error": f"{type(error).__name__}: {error}"}

    async def serve(self, request):
        data = await self.serve_cache.get(self._safe_serve_status, force=request.query.get("refresh") == "1")
        return web.json_response({**data, "job": self._running("serve")})

    def _settings_payload(self) -> dict:
        return {"defaults": catalog.serve_defaults(self.config), "saved": catalog.load_settings(self.config),
                "effective": catalog.effective_settings(self.config), "models": catalog.serve_models(self.config)}

    async def settings(self, request):
        return web.json_response(await self._blocking(self._settings_payload))

    async def linkcheck(self, request):
        history = await self._blocking(catalog.linkcheck_history, self.config, self.config.web.history_limit)
        return web.json_response({"latest": history[0] if history else None, "history": history,
                                  "job": self._running("linkcheck")})

    def _options(self) -> dict:
        rows = catalog.list_datasets(self.config, self.summaries)
        base = self.config.openpi.docker_data / "checkpoints"
        configs = sorted(p.name for p in base.iterdir() if p.is_dir()) if base.is_dir() else []
        return {"prompts": self.config.prompts, "arms": list(ARMS), "default_arm": self.config.quality.arm,
                "views": [r["path"] for r in rows if r["kind"] == "view"],
                "sources": [r["path"] for r in rows if r["kind"] in ("raw", "clean")],
                "configs": configs, "linkcheck_items": list(linkcheck.ITEMS), "read_only": self.read_only}

    async def options(self, request):
        return web.json_response(await self._blocking(self._options))

    async def static(self, request):
        if request.match_info["path"].startswith("api/"):
            return _error(404, f"no route {request.path}")
        index = self.static_root / "index.html"
        if not index.is_file():
            return web.Response(status=503, text="the console UI is not built (website: npm run build:training)")
        rel = request.match_info["path"] or "index.html"
        candidate = (self.static_root / rel).resolve()
        if not candidate.is_relative_to(self.static_root):
            return _error(404, "not found")
        if candidate.is_file():
            return web.FileResponse(candidate)
        if rel.startswith("assets/"):
            return _error(404, "not found")
        return web.FileResponse(index)

    # ---- writes (Task 7) ------------------------------------------------------------------------------------
    async def start_job(self, request):
        raise web.HTTPNotImplemented()

    async def cancel_job(self, request):
        raise web.HTTPNotImplemented()

    async def save_settings(self, request):
        raise web.HTTPNotImplemented()

    async def job_log(self, request):
        raise web.HTTPNotImplemented()


def serve(config: ConsoleConfig, host: str, port: int, token: str) -> None:
    console = Console(config, token=token)
    interrupted = console.store.recover()
    mode = "read-only (no token)" if console.read_only else f"writes need the {TOKEN_HEADER} header"
    print(f"training console on http://{host}:{port} · data {config.data_root} · {mode}"
          + (f" · marked interrupted: {', '.join(interrupted)}" if interrupted else ""), flush=True)
    web.run_app(console.app(), host=host, port=port, print=None, access_log=None)
