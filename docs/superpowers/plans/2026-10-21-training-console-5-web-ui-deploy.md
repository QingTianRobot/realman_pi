# Training console Plan 5: the five pages, e2e, docs and the server5090 deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The browser side of the training console — 总览 / 服务 / 数据 / 训练 / 模型 plus a global job-log drawer, styled with the :8765 theme, no horizontal scroll on a phone — tested end-to-end with Playwright against the real `web_server.py` on a fixture world, documented, and running on server5090:8780.

**Architecture:** Plain TypeScript + DOM (no framework), like `src/driver/realman_web_control/web`. Vite builds `src/training/realman_training/web` into `src/training/realman_training/realman_training/static` (checked in, like the other bundles), configs under `config/training/`. Every page is `render(root, ctx)`; data comes only from the Plan 4 API (`api.ts`). Writes go through one confirm dialog (`dialog.ts`) that shows what will happen and asks for the token. The e2e backend (`test/web_fake.py`) is the real `Console` app on `console_fixture.build_world` with fake steps, serve status and GPUs.

**Tech Stack:** TypeScript (Vite 5 via website/node_modules, no type-check step), Playwright 1.62 with system Chrome, aiohttp (backend from Plan 4), GitHub Actions.

Prerequisite: Plan 4 (`2026-10-21-training-console-4-web-api-container.md`) is done on branch `feat/training-console-web`. The API contract in Plan 4 is the source of truth for every JSON shape used here.

## Global Constraints

- Everything from Plan 4's Global Constraints holds (token, no deletes, one job per kind, never `./rm65`, no private IPs/tokens, config only under `config/`, `runtime: nvidia`, same-path mounts, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` on every commit, ruff clean).
- Style: copy `src/driver/realman_web_control/web/src/theme.css` verbatim (only the header comment changes); layout CSS uses only its tokens (`--primary`, `--line`, `--ok`, … ) — no new colours.
- UI text is Chinese, labels as in the spec (总览, 服务, 数据, 训练, 模型, 任务, 令牌).
- No horizontal page scroll at 412 px width (Pixel 7) on any page; wide tables scroll inside `.table-wrap`.
- Every button that starts a job opens the confirm dialog first; read-only consoles disable it and say why.
- The deployment, any `serve start/stop`, and any training run need the user's explicit OK in the controller session. The walk-through on server5090 is read-only (no token entered).
- Docs are part of the feature: a new page `website/docs/development/training-console-web.md`, in the sidebar and in `website/tests/site.spec.ts`.

## Local test environment

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/website
npm ci                                                   # once
export PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export REALMAN_TRAINING_PYTHON="$SCRATCH/venv/bin/python"   # the Plan 4 venv (aiohttp, numpy, pyarrow, pyyaml)
npm run test:training                                     # builds the bundle, starts web_fake.py on :4180, runs the specs
```

Dev loop with live reload: `"$REALMAN_TRAINING_PYTHON" ../src/training/realman_training/test/web_fake.py --port 4180` in one terminal, `npm run dev:training` in another, open http://127.0.0.1:4176/.

## File structure

| File | Responsibility |
|---|---|
| `config/training/vite.config.mjs` | Vite root/outDir/dev proxy |
| `config/training/playwright.config.mjs` | e2e projects (desktop + `@mobile`) and the fake backend |
| `website/package.json` (modify) | `dev:training`, `build:training`, `test:training` |
| `config/website/playwright.config.mjs` (modify) | ignore `training-console/**` |
| `src/training/realman_training/test/web_fake.py`, `web_fake_steps.py` | e2e backend |
| `src/training/realman_training/web/index.html` | page shell |
| `.../web/src/theme.css` | copy of the :8765 theme |
| `.../web/src/style.css` | console layout |
| `.../web/src/api.ts` | types + fetch + token + WebSocket |
| `.../web/src/dom.ts` | `h()`/`svg()` builders, labels, formatters |
| `.../web/src/widgets.ts` | stat tiles, tables, GPU list, check/eval tables |
| `.../web/src/charts.ts` | line chart, gripper sparkline |
| `.../web/src/ctx.ts` | page context type |
| `.../web/src/dialog.ts` | confirm-and-start dialog |
| `.../web/src/drawer.ts` | job-log drawer |
| `.../web/src/main.ts` | top bar, router, status pills |
| `.../web/src/pages/{overview,serve,data,train,models}.ts` | the five pages |
| `src/training/realman_training/realman_training/static/` | built bundle (generated, committed) |
| `website/tests/training-console/console.spec.ts` | e2e |
| `website/docs/development/training-console-web.md` | docs page |
| `config/website/vitepress.config.mts`, `website/tests/site.spec.ts`, `website/docs/development/training-console.md` (modify) | sidebar, route test, cross-link |
| `.github/workflows/ci.yml` (modify) | training-console e2e job + bundle freshness |

---

### Task 1: Tooling, fake backend and the app shell

**Files:**
- Create: `config/training/vite.config.mjs`, `config/training/playwright.config.mjs`
- Modify: `website/package.json`, `config/website/playwright.config.mjs`
- Create: `src/training/realman_training/test/web_fake.py`, `src/training/realman_training/test/web_fake_steps.py`
- Create: `src/training/realman_training/web/index.html`, `web/src/theme.css`, `web/src/style.css`, `web/src/api.ts`, `web/src/dom.ts`, `web/src/ctx.ts`, `web/src/main.ts`, placeholder pages `web/src/pages/{overview,serve,data,train,models}.ts`
- Create: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: Plan 4 `web_server.Console`, `console_fixture.build_world`, `STATIC_ROOT`.
- Produces:
  - `api.ts`: `api.*` calls (see code), `getToken()`, `setToken(v)` (fires `window` event `token-changed`), `ApiError(status, message)`, `logSocket(id)`, all response types.
  - `dom.ts`: `h(tag, attrs, ...children)`, `svg(tag, attrs, ...children)`, `KIND_LABEL`, `STATE_LABEL`, `DATASET_KIND`, `stateClass`, `isActive`, `fmtBytes`, `fmtCount`, `fmtDuration`, `fmtTime`, `fmtDay`, `fmtMae`, `fmtMiB`, `errorText`.
  - `ctx.ts`: `Ctx { health, query, navigate(page, query?), reload(), openDrawer(jobId?), refreshStatus() }`, `Page = (root, ctx) => Promise<void | (() => void)>`.
  - DOM ids used by later tasks/tests: `#app`, `.topbar`, `nav.tabs a[data-page]`, `#pill-serve`, `#pill-bridge`, `#jobs-button`, `#token`, `#read-only`, `main#page[data-page]`.
  - Fake backend on `--port` (default 4180), token `e2e-token`.

- [ ] **Step 1: Vite and Playwright configs**

`config/training/vite.config.mjs`:

```js
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The training console UI shares website/node_modules with the other Vite apps. Its bundle is checked in under
// realman_training/static/ and served by web_server.py. `npm run dev:training` proxies /api (and the job-log
// WebSocket) to the e2e fake backend on :4180, or to TRAINING_API.
const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const webDirectory = resolve(repositoryDirectory, "src/training/realman_training/web");
const staticDirectory = resolve(repositoryDirectory, "src/training/realman_training/realman_training/static");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig } = requireFromWebsite("vite");
const api = process.env.TRAINING_API || "http://127.0.0.1:4180";

export default defineConfig({
  root: webDirectory,
  cacheDir: resolve(websiteDirectory, "node_modules/.vite-realman-training"),
  base: "/",
  build: { outDir: staticDirectory, emptyOutDir: true, sourcemap: false },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, proxy: { "/api": { target: api, ws: true } } },
});
```

`config/training/playwright.config.mjs`:

```js
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig, devices } = requireFromWebsite("@playwright/test");
// The real web_server.py on a fixture world with fake steps (src/training/realman_training/test/web_fake.py).
const python = process.env.REALMAN_TRAINING_PYTHON || "python3";

export default defineConfig({
  testDir: resolve(websiteDirectory, "tests/training-console"),
  outputDir: resolve(websiteDirectory, "test-results/training-console"),
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4180/",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Phones run the layout checks only (tests tagged @mobile); the flows run once, on desktop.
    { name: "mobile", grep: /@mobile/, use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    command: `npm run build:training && "${python}" ../src/training/realman_training/test/web_fake.py --port 4180`,
    cwd: websiteDirectory,
    url: "http://127.0.0.1:4180/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

In `website/package.json` `scripts`, after `build:recording`:

```json
    "dev:training": "vite --config ../config/training/vite.config.mjs",
    "build:training": "vite build --config ../config/training/vite.config.mjs",
```

and after `test:web-control`:

```json
    "test:training": "playwright test --config ../config/training/playwright.config.mjs"
```

(mind the commas: `test:web-control` gets a trailing comma).

In `config/website/playwright.config.mjs` change the ignore list and its comment:

```js
  // The browser action console has its own Vite server and configuration.
  // The recording replay UI is a different app (Vite on :4175) with its own config in config/recording/.
  // The training console runs against its own backend (config/training/playwright.config.mjs).
  testIgnore: ["web-control/**", "recording-replay.spec.ts", "training-console/**"],
```

- [ ] **Step 2: Fake backend**

`src/training/realman_training/test/web_fake_steps.py`:

```python
"""Job targets for the e2e backend (web_fake.py): a few log lines and a progress bar, no side effects."""

from __future__ import annotations

import time


def _fake(kind: str, params: dict, log) -> dict:
    log(f"fake {kind} started")
    for i in range(1, 5):
        time.sleep(0.25)
        log.progress(i, 4, f"{kind} {i}/4")
        log(f"fake {kind} step {i}/4")
    log(f"fake {kind} done")
    return {"fake": True, "kind": kind}


def pull(params, log):
    return _fake("pull", params, log)


def clean(params, log):
    return _fake("clean", params, log)


def view(params, log):
    return _fake("view", params, log)


def norm(params, log):
    return _fake("norm", params, log)


def train(params, log):
    return _fake("train", params, log)


def eval(params, log):  # noqa: A001 - named after the job kind
    return _fake("eval", params, log)


def register(params, log):
    return _fake("register", params, log)


def serve(params, log):
    return _fake("serve", params, log)


def linkcheck(params, log):
    return _fake("linkcheck", params, log)
```

`src/training/realman_training/test/web_fake.py`:

```python
"""The console's real web server on a fixture world, with fake steps, serve status and GPUs (Playwright e2e).

    python src/training/realman_training/test/web_fake.py --port 4180     # token: e2e-token
"""

from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path[:0] = [str(HERE.parent), str(HERE)]

from aiohttp import web  # noqa: E402
from console_fixture import MODEL, PLACE, build_world  # noqa: E402

from realman_training.config import load_config  # noqa: E402
from realman_training.jobs import STEPS, JobStore  # noqa: E402
from realman_training.web_server import STATIC_ROOT, Console  # noqa: E402

SERVE = {
    "serve": {"running": True, "status": "running", "image": "openpi:dev", "image_id": "sha256:4f1c2a",
              "started": "2026-10-16T17:02:00+08:00"},
    "gpu": {"index": 2, "used_mib": 8850, "total_mib": 32607},
    "bridge": {"running": True, "status": "running", "image": "realman_pi:local", "started": "2026-10-20T23:39:10+08:00",
               "server": "set", "prompt": PLACE, "paused": "0", "allow_publish": "0", "mode_active": "0"},
    "bt_mode": {"requested_mode": "none", "selected_mode": "none", "active_mode": "none"},
    "record": {"model": MODEL, "step": 29999, "gpu": 2, "port": 18000, "task": "pick_and_place", "prompt": PLACE,
               "started": "2026-10-16T17:02:00+08:00", "warmup_ms": [26012.4, 95.3]},
}
GPUS = {"available": True, "busy_mib": 2000, "gpus": [
    {"index": 0, "name": "NVIDIA GeForce RTX 5090", "used_mib": 15627, "total_mib": 32607, "util_pct": 97, "busy": True,
     "users": [{"pid": 4242, "who": "alice python", "container": None, "user": "alice", "command": "python", "used_mib": 15571}]},
    {"index": 1, "name": "NVIDIA GeForce RTX 5090", "used_mib": 3, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []},
    {"index": 2, "name": "NVIDIA GeForce RTX 5090", "used_mib": 8850, "total_mib": 32607, "util_pct": 4, "busy": True,
     "users": [{"pid": 5151, "who": "openpi-serve-openpi-1", "container": "openpi-serve-openpi-1", "user": "server5090",
                "command": "python3", "used_mib": 8820}]},
    {"index": 3, "name": "NVIDIA GeForce RTX 5090", "used_mib": 5, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []},
]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4180)
    parser.add_argument("--token", default="e2e-token")
    parser.add_argument("--static", default=str(STATIC_ROOT))
    args = parser.parse_args()
    root = Path(tempfile.mkdtemp(prefix="training-console-e2e-"))
    paths = build_world(root)
    config = load_config(paths["config"])
    store = JobStore(config.console_dir, env={"PYTHONPATH": str(HERE)})
    console = Console(config, token=args.token, store=store, targets={k: f"web_fake_steps:{k}" for k in STEPS},
                      serve_status=lambda: SERVE, gpu_query=lambda: GPUS, static_root=args.static)
    print(f"fake training console on http://{args.host}:{args.port} · world {root}", flush=True)
    web.run_app(console.app(), host=args.host, port=args.port, print=None, access_log=None)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Page shell, theme and layout CSS**

`src/training/realman_training/web/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#10191d" />
    <title>RealMan Training Console</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`web/src/theme.css`: copy the file and change only line 1:

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
{ echo '/* Copied from src/driver/realman_web_control/web/src/theme.css (the :8765 console): keep the two in step. */'; tail -n +2 src/driver/realman_web_control/web/src/theme.css; } > src/training/realman_training/web/src/theme.css
```

`web/src/style.css`:

```css
/* Training console layout; colours and shared primitives come from theme.css (the :8765 theme). */
.topbar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 10px clamp(16px, 3vw, 42px); border-bottom: 1px solid var(--line); background: oklch(1 0 0 / 0.86); backdrop-filter: blur(12px); }
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--btn-bg); color: var(--primary-strong); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.brand strong, .brand small { display: block; }
.brand strong { font-size: 15px; letter-spacing: .01em; }
.brand small { color: var(--text-3); font-size: 10px; margin-top: 2px; }
.tabs { display: flex; gap: 4px; padding: 4px; margin-right: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--card-bg); box-shadow: var(--shadow-card); }
.tabs a { padding: 8px 14px; border-radius: 10px; color: var(--text-2); font-size: 12px; font-weight: 700; letter-spacing: .06em; text-decoration: none; white-space: nowrap; }
.tabs a:hover:not(.selected) { background: var(--btn-bg-hover); color: var(--btn-content); }
.tabs a.selected { background: var(--primary); color: #fff; box-shadow: 0 4px 12px oklch(0.6 0.14 var(--hue) / 0.25); }
.top-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.status-pill { padding: 5px 10px; border-radius: 999px; background: var(--btn-bg); color: var(--btn-content); font-size: 10px; font-weight: 700; letter-spacing: .06em; white-space: nowrap; }
.status-pill.ok { background: var(--ok-bg); color: var(--ok); }
.status-pill.warn { background: var(--warn-bg); color: var(--warn); }
.status-pill.bad { background: var(--danger-bg); color: var(--danger); }
.token-field { display: flex; align-items: center; gap: 6px; }
.token-field input { width: 130px; padding: 7px 9px; font-size: 11px; }

.page { max-width: 1640px; margin: 0 auto; padding: 16px clamp(16px, 3vw, 42px) 96px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; min-width: 0; }
.page > * { min-width: 0; }
.panel { padding: 16px 18px; min-width: 0; }
.panel h2 { font-size: 15px; margin: 0 0 12px; }
.panel h3 { margin: 14px 0 8px; font-size: 12px; color: var(--text-2); letter-spacing: .04em; }
.panel-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.panel-head h2 { margin: 0; }
.cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.split { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); gap: 16px; align-items: start; }
.two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
.stack { display: grid; gap: 16px; min-width: 0; }
.kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 5px 12px; margin: 0; font-size: 12px; }
.kv dt { color: var(--text-3); white-space: nowrap; }
.kv dd { margin: 0; overflow-wrap: anywhere; }
.big { font-size: 20px; font-weight: 800; letter-spacing: -.01em; overflow-wrap: anywhere; }
.muted { color: var(--text-3); font-size: 11px; }
.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.stat { min-width: 0; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card-sub); }
.stat span { display: block; color: var(--text-3); font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.stat b { display: block; margin-top: 4px; font-size: 14px; overflow-wrap: anywhere; }
.list { display: grid; gap: 8px; }
.item { display: grid; gap: 3px; width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card-bg); color: var(--text); text-align: left; font: inherit; }
.item:hover { border-color: var(--accent-bar); background: var(--card-hover); }
.item.selected { border-color: var(--primary); background: var(--btn-bg); box-shadow: 0 0 0 1px var(--primary) inset; }
.item strong { font-size: 12.5px; overflow-wrap: anywhere; }
.item small { color: var(--text-3); font-size: 11px; overflow-wrap: anywhere; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 999px; background: var(--btn-bg); color: var(--btn-content); font-size: 10px; font-weight: 800; letter-spacing: .04em; white-space: nowrap; vertical-align: middle; }
.chip.ok { background: var(--ok-bg); color: var(--ok); }
.chip.warn { background: var(--warn-bg); color: var(--warn); }
.chip.bad { background: var(--danger-bg); color: var(--danger); }
.chip.run { background: var(--btn-bg-hover); color: var(--primary-strong); }
.table-wrap { max-width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { padding: 6px 8px; border-bottom: 1px solid var(--line); color: var(--text-3); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-align: left; white-space: nowrap; }
td { padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
tr.clickable { cursor: pointer; }
tr.clickable:hover td { background: var(--card-hover); }
tr.selected td { background: var(--btn-bg); }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.form { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; align-items: end; }
.form label { display: grid; gap: 4px; min-width: 0; color: var(--text-2); font-size: 11px; font-weight: 700; }
.form label.check { display: flex; align-items: center; gap: 6px; }
.form input:not([type="checkbox"]), .form select { width: 100%; min-width: 0; }
.form .wide { grid-column: 1 / -1; }
.checks { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 11.5px; }
.checks label { display: flex; align-items: center; gap: 5px; }
.bar { height: 8px; overflow: hidden; border: 1px solid var(--line); border-radius: 4px; background: var(--card-sub); }
.bar i { display: block; height: 100%; background: var(--primary); }
.bar.busy i { background: var(--warn); }
.gpu-row { display: grid; gap: 4px; padding: 7px 0; border-bottom: 1px solid var(--line); font-size: 11.5px; }
.gpu-row:last-child { border-bottom: 0; }
.gpu-row header { display: flex; justify-content: space-between; gap: 8px; }
.gpu-users { color: var(--text-3); overflow-wrap: anywhere; }
.task-bars { display: grid; gap: 8px; }
.task-bar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 8px; font-size: 12px; }
.task-bar span { overflow-wrap: anywhere; }
.task-bar .bar { grid-column: 1 / -1; }
.chart { display: block; width: 100%; height: auto; aspect-ratio: 600 / 180; }
.chart .line { fill: none; stroke: var(--primary); stroke-width: 1.6; }
.chart .axis { stroke: var(--line-strong); }
.chart text { fill: var(--text-3); font-size: 11px; }
.spark { display: block; width: 120px; height: 26px; }
.spark polyline { fill: none; stroke: var(--primary); stroke-width: 1.4; }
.spark line { stroke: var(--line-strong); stroke-dasharray: 2 2; }
.error { margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--danger-bg); color: var(--danger); font-size: 12px; overflow-wrap: anywhere; }
.notice { margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--warn-bg); color: var(--warn); font-size: 12px; overflow-wrap: anywhere; }
.loading { margin: 0; padding: 20px 0; color: var(--text-3); font-size: 12px; }
pre.log, pre.card { margin: 0; padding: 10px 12px; border-radius: 10px; font-size: 11px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; overflow-y: auto; }
pre.log { background: oklch(0.22 0.02 var(--hue)); color: oklch(0.93 0.01 var(--hue)); }
pre.card { max-height: 60vh; background: var(--card-sub); color: var(--text); }
details summary { cursor: pointer; color: var(--text-2); font-size: 12px; font-weight: 700; }

.drawer { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; display: grid; grid-template-rows: auto minmax(0, 1fr); height: min(60vh, 520px); border-top: 1px solid var(--line-strong); background: var(--card-bg); box-shadow: 0 -10px 30px oklch(0.3 0.02 var(--hue) / 0.12); }
.drawer-head { display: flex; align-items: center; gap: 10px; padding: 10px clamp(16px, 3vw, 42px); border-bottom: 1px solid var(--line); }
.drawer-head h2 { margin: 0 auto 0 0; font-size: 15px; }
.drawer-body { display: grid; grid-template-columns: minmax(220px, 300px) minmax(0, 1fr); min-height: 0; }
.drawer-jobs { display: grid; align-content: start; gap: 6px; min-width: 0; padding: 8px; overflow-y: auto; border-right: 1px solid var(--line); }
.drawer-log { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 6px; min-width: 0; min-height: 0; padding: 8px 12px; }
.drawer-job-head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; }
.drawer-log pre { height: 100%; }

dialog.confirm { width: min(520px, calc(100vw - 32px)); padding: 18px 20px; border: 1px solid var(--line); border-radius: var(--radius-card); background: var(--card-bg); color: var(--text); box-shadow: var(--shadow-card-hover); }
dialog.confirm::backdrop { background: oklch(0.2 0.02 var(--hue) / 0.35); }
dialog.confirm ul { padding-left: 18px; font-size: 12.5px; line-height: 1.6; overflow-wrap: anywhere; }
dialog.confirm .token-line { display: grid; gap: 4px; margin-bottom: 10px; color: var(--text-2); font-size: 11px; font-weight: 700; }
dialog.confirm .actions { justify-content: flex-end; margin-top: 12px; }

@media (max-width: 1100px) {
  .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 860px) {
  .split, .two { grid-template-columns: minmax(0, 1fr); }
  .drawer-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .drawer-jobs { grid-auto-flow: column; grid-auto-columns: minmax(170px, 1fr); overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--line); }
}
@media (max-width: 560px) {
  .cards { grid-template-columns: minmax(0, 1fr); }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tabs { order: 3; width: 100%; margin-right: 0; }
  .tabs a { flex: 1; padding: 8px 4px; text-align: center; }
  .brand small { display: none; }
  .token-field input { width: 96px; }
}
```

- [ ] **Step 4: `api.ts`, `dom.ts`, `ctx.ts`**

`web/src/api.ts`:

```ts
// The Plan 4 API (docs/superpowers/plans/2026-10-21-training-console-4-web-api-container.md, "API contract").
export type JobState = "starting" | "running" | "succeeded" | "failed" | "cancelled" | "interrupted";
export interface Progress { done: number; total: number | null; text: string; at: string }
export interface JobRow {
  id: string; kind: string; state: JobState; created?: string | null; started?: string | null; ended?: string | null;
  error?: string | null; progress?: Progress | null; params: Record<string, any>; result?: any;
}
export interface Health { ok: boolean; read_only: boolean; data_root: string; console_dir: string; time: string }
export interface QualityCounts { ok: number; suggest_drop: number; warn: number }
export interface DatasetRow {
  path: string; name: string; kind: "raw" | "clean" | "view" | "error"; episodes?: number; frames?: number;
  duration_sec?: number; fps?: number; first_file_time?: string | null; last_file_time?: string | null;
  disk_bytes?: number; tasks?: Record<string, number>; source?: string | null; removed_episodes?: number | null;
  prompts?: Record<string, string>; quality_counts?: QualityCounts | null; error?: string;
}
export interface Finding { code: string; severity: "drop" | "warn"; message: string }
export interface EpisodeQuality { episode: number; task: string; frames: number; verdict: "ok" | "suggest_drop" | "warn"; findings: Finding[] }
export interface Camera { key: string; codec: string | null; height: number | null; width: number | null }
export interface Summary {
  path: string; name: string; kind: string; codebase_version: string; robot_type: string; fps: number; episodes: number;
  frames: number; duration_sec: number; tasks: Record<string, number>; task_frames: Record<string, number>;
  features: Record<string, { dtype: string; shape: number[] }>; cameras: Camera[]; disk_bytes: number;
  first_file_time: string | null; last_file_time: string | null; source: string | null; removed_episodes: number | null;
  prompts: Record<string, string>;
}
export interface DatasetDetail {
  path: string; built: string; summary: Summary; quality: EpisodeQuality[] | null; quality_unavailable: string | null;
  suggested_drops: number[]; quality_counts: QualityCounts | null; traces: Record<string, number[]>;
}
export interface EvalLatest { step: number; tasks: Record<string, number> }
export interface RunRow {
  name: string; config: string; exp: string; checkpoints: number[]; view: string | null; gpus: number[] | null;
  batch_size: number | null; num_train_steps: number | null; last_step: number | null; started: string | null;
  ended: string | null; exit_code: number | null; registered: boolean; status: string | null; last_loss: number | null;
  eval_latest: EvalLatest | null;
}
export interface RunDetail extends RunRow {
  record: Record<string, any> | null; metrics: Record<string, (number | null)[]>;
  eval: Record<string, Record<string, any>> | null; card: Record<string, any> | null; card_markdown: string | null;
  job: JobRow | null;
}
export interface ModelRow {
  name: string; config: string; exp: string; method: string | null; trained_start: string | null; trained_end: string | null;
  dataset: string | null; dataset_dir: string | null; tasks: Record<string, { prompt?: string; episodes?: number }>;
  episodes: number | null; holdout_episodes: number[]; checkpoints: number[];
  open_loop: { step: number; tasks: Record<string, number>; zero_baseline: Record<string, number> } | null;
  status: string | null; serving: boolean;
}
export interface GpuUser { pid: number; who: string; container: string | null; user: string | null; command: string | null; used_mib: number | null }
export interface Gpu { index: number; name: string; used_mib: number | null; total_mib: number | null; util_pct: number | null; busy: boolean; users: GpuUser[] }
export interface Gpus { available: boolean; busy_mib: number; gpus: Gpu[]; error?: string; at?: string }
export interface ServeStatus {
  serve?: Record<string, any>; gpu?: Record<string, any>; bridge?: Record<string, any>; bt_mode?: Record<string, any> | null;
  record?: Record<string, any>; error?: string; at: string; job: JobRow | null;
}
export interface Settings { model: string; checkpoint: string; gpu: number; port: number; task: string | null }
export interface ServeModel { name: string; checkpoints: number[]; prompts: Record<string, string> }
export interface SettingsPayload { defaults: Settings; saved: Partial<Settings>; effective: Settings; models: ServeModel[] }
export interface Check { item: string; name: string; ok: boolean; value: string; threshold: string; detail: string }
export interface LinkRun { at: string; ok: boolean; checks: Check[] }
export interface LinkcheckPayload { latest: LinkRun | null; history: LinkRun[]; job: JobRow | null }
export interface Options {
  prompts: Record<string, string>; arms: string[]; default_arm: string; views: string[]; sources: string[];
  configs: string[]; linkcheck_items: string[]; read_only: boolean;
}

const TOKEN_KEY = "realman-training-token";

export function getToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(value: string): void {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: the token lives for this page only
  }
  window.dispatchEvent(new Event("token-changed"));
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token && method !== "GET") headers["X-Training-Token"] = token;
  const response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) throw new ApiError(response.status, data?.error || text || response.statusText);
  return data as T;
}

const q = encodeURIComponent;

export const api = {
  health: () => request<Health>("GET", "/api/health"),
  datasets: () => request<{ root: string; datasets: DatasetRow[] }>("GET", "/api/datasets"),
  dataset: (path: string) => request<DatasetDetail>("GET", `/api/dataset?path=${q(path)}`),
  jobs: (limit = 30, kind?: string) =>
    request<{ jobs: JobRow[] }>("GET", `/api/jobs?limit=${limit}${kind ? `&kind=${q(kind)}` : ""}`),
  job: (id: string) => request<{ job: JobRow; log: string }>("GET", `/api/jobs/${q(id)}`),
  startJob: (kind: string, params: Record<string, unknown>) =>
    request<{ job: JobRow }>("POST", "/api/jobs", { kind, params, confirm: true }),
  cancelJob: (id: string) => request<{ cancelled: boolean }>("POST", `/api/jobs/${q(id)}/cancel`, {}),
  runs: () => request<{ runs: RunRow[] }>("GET", "/api/runs"),
  run: (config: string, exp: string) => request<RunDetail>("GET", `/api/runs/${q(config)}/${q(exp)}`),
  models: () => request<{ models: ModelRow[]; registry_markdown: string | null }>("GET", "/api/models"),
  gpus: () => request<Gpus>("GET", "/api/gpus"),
  serve: (refresh = false) => request<ServeStatus>("GET", `/api/serve${refresh ? "?refresh=1" : ""}`),
  settings: () => request<SettingsPayload>("GET", "/api/serve/settings"),
  saveSettings: (settings: Partial<Settings>) => request<SettingsPayload>("PUT", "/api/serve/settings", settings),
  linkcheck: () => request<LinkcheckPayload>("GET", "/api/linkcheck"),
  options: () => request<Options>("GET", "/api/options"),
};

export function logSocket(id: string): WebSocket {
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  return new WebSocket(`${scheme}://${location.host}/api/jobs/${q(id)}/log`);
}
```

`web/src/dom.ts`:

```ts
import type { JobState } from "./api";

export type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown>;

function apply(el: Element, attrs: Attrs): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") el.setAttribute("class", String(value));
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value as EventListener);
    else if (key === "value" && "value" in el) (el as HTMLInputElement).value = String(value);
    else if ((key === "checked" || key === "disabled" || key === "hidden" || key === "selected") && key in el) (el as any)[key] = Boolean(value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
}

function append(el: Element, children: (Child | Child[])[]): void {
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export const KIND_LABEL: Record<string, string> = {
  pull: "拉取", clean: "清洗", view: "训练视图", norm: "Norm", train: "训练", eval: "评估", register: "登记",
  serve: "推理服务", linkcheck: "链路检测",
};
export const STATE_LABEL: Record<JobState, string> = {
  starting: "启动中", running: "运行中", succeeded: "成功", failed: "失败", cancelled: "已取消", interrupted: "中断",
};
export const DATASET_KIND: Record<string, string> = { raw: "原始", clean: "清洗版", view: "训练视图", error: "错误" };

export function isActive(state: JobState): boolean {
  return state === "starting" || state === "running";
}

export function stateClass(state: JobState): string {
  if (state === "succeeded") return "ok";
  if (state === "failed" || state === "interrupted") return "bad";
  if (state === "cancelled") return "warn";
  return "run";
}

export function fmtBytes(n: number | null | undefined): string {
  if (n === null || n === undefined) return "–";
  const units: [string, number][] = [["TB", 2 ** 40], ["GB", 2 ** 30], ["MB", 2 ** 20], ["KB", 2 ** 10]];
  for (const [unit, scale] of units) if (n >= scale) return `${(n / scale).toFixed(1)} ${unit}`;
  return `${n} B`;
}

export function fmtCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "–";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function fmtDuration(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return "–";
  if (sec < 120) return `${Math.round(sec)} s`;
  if (sec < 7200) return `${Math.round(sec / 60)} min`;
  return `${(sec / 3600).toFixed(1)} h`;
}

function parts(iso: string | null | undefined): string[] | null {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso) : null;
  return match ? match.slice(1) : null;
}

export function fmtTime(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p[1]}-${p[2]} ${p[3]}:${p[4]}` : "–";
}

export function fmtDay(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p[1]}-${p[2]}` : "–";
}

export function fmtMae(n: number | null | undefined): string {
  return n === null || n === undefined ? "–" : n.toFixed(3);
}

export function fmtMiB(n: number | null | undefined): string {
  return n === null || n === undefined ? "–" : `${(n / 1024).toFixed(1)} GiB`;
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
```

`web/src/ctx.ts`:

```ts
import type { Health } from "./api";

export interface Ctx {
  health: Health;
  query: URLSearchParams;
  navigate(page: string, query?: Record<string, string>): void;
  reload(): void;
  openDrawer(jobId?: string): void;
  refreshStatus(): void;
}

export type Page = (root: HTMLElement, ctx: Ctx) => Promise<void | (() => void)>;
```

- [ ] **Step 5: `main.ts` and placeholder pages**

Each placeholder page (`web/src/pages/overview.ts`, `serve.ts`, `data.ts`, `train.ts`, `models.ts`) is replaced in Tasks 3-7; for now, e.g. `overview.ts`:

```ts
import type { Ctx } from "../ctx";
import { h } from "../dom";

export async function renderOverview(root: HTMLElement, _ctx: Ctx): Promise<void> {
  root.replaceChildren(h("section", { class: "panel" }, h("h2", {}, "总览")));
}
```

with the names `renderServe` / `renderData` / `renderTrain` / `renderModels` and headings 服务 / 数据 / 训练 / 模型.

`web/src/main.ts`:

```ts
import "./theme.css";
import "./style.css";
import { api, getToken, setToken, type Health, type ServeStatus } from "./api";
import type { Ctx, Page } from "./ctx";
import { errorText, h, isActive } from "./dom";
import { JobDrawer } from "./drawer";
import { renderData } from "./pages/data";
import { renderModels } from "./pages/models";
import { renderOverview } from "./pages/overview";
import { renderServe } from "./pages/serve";
import { renderTrain } from "./pages/train";

const PAGES: { id: string; label: string; render: Page }[] = [
  { id: "overview", label: "总览", render: renderOverview },
  { id: "serve", label: "服务", render: renderServe },
  { id: "data", label: "数据", render: renderData },
  { id: "train", label: "训练", render: renderTrain },
  { id: "models", label: "模型", render: renderModels },
];

function setPill(el: HTMLElement, text: string, tone: "" | "ok" | "warn" | "bad"): void {
  el.textContent = text;
  el.className = `status-pill${tone ? ` ${tone}` : ""}`;
}

export function showServePills(status: ServeStatus | null, servePill: HTMLElement, bridgePill: HTMLElement): void {
  if (!status || status.error) {
    setPill(servePill, "推理 ? 未知", "warn");
    setPill(bridgePill, "桥接 ? 未知", "warn");
    return;
  }
  const running = Boolean(status.serve?.running);
  setPill(servePill, running ? "推理 ● 运行中" : "推理 ○ 停止", running ? "ok" : "");
  const bridge = status.bridge || {};
  if (bridge.error) setPill(bridgePill, "桥接 ? 不可达", "warn");
  else if (!bridge.running) setPill(bridgePill, "桥接 ○ 停止", "");
  else if (Number(bridge.allow_publish)) setPill(bridgePill, "桥接 ● 发布中", "warn");
  else setPill(bridgePill, "桥接 ● 空闲", "ok");
}

async function boot(): Promise<void> {
  const app = document.getElementById("app")!;
  let health: Health;
  try {
    health = await api.health();
  } catch (error) {
    app.replaceChildren(h("p", { class: "error" }, `无法连接训练平台后端：${errorText(error)}`));
    return;
  }
  const tabs = h("nav", { class: "tabs", "aria-label": "页面" },
    PAGES.map((page) => h("a", { href: `#/${page.id}`, "data-page": page.id }, page.label)));
  const servePill = h("span", { class: "status-pill", id: "pill-serve" }, "推理 …");
  const bridgePill = h("span", { class: "status-pill", id: "pill-bridge" }, "桥接 …");
  const jobsButton = h("button", { class: "button secondary", id: "jobs-button", type: "button" }, "任务");
  const token = h("input", { type: "password", id: "token", autocomplete: "off", "aria-label": "令牌",
    placeholder: health.read_only ? "只读" : "令牌", value: getToken(), disabled: health.read_only });
  token.addEventListener("change", () => setToken(token.value.trim()));
  window.addEventListener("token-changed", () => { token.value = getToken(); });
  const drawer = new JobDrawer(() => health.read_only);
  jobsButton.addEventListener("click", () => (drawer.isOpen ? drawer.close() : void drawer.open()));
  const page = h("main", { class: "page", id: "page" });
  app.replaceChildren(
    h("header", { class: "topbar" },
      h("div", { class: "brand" }, h("span", { class: "brand-mark" }, "RM"),
        h("div", {}, h("strong", {}, "Training Console"), h("small", {}, "数据 → 训练 → 评估 → 部署"))),
      tabs,
      h("div", { class: "top-status" }, servePill, bridgePill, jobsButton,
        h("label", { class: "token-field" },
          health.read_only ? h("span", { class: "chip warn", id: "read-only" }, "只读") : null, token))),
    page, drawer.el);

  let dispose: void | (() => void);
  const ctx: Ctx = {
    health,
    query: new URLSearchParams(),
    navigate: (id, query) => {
      location.hash = `#/${id}${query ? `?${new URLSearchParams(query)}` : ""}`;
    },
    reload: () => void route(),
    openDrawer: (id) => void drawer.open(id),
    refreshStatus: () => void refreshStatus(),
  };

  async function route(): Promise<void> {
    const [path, search = ""] = location.hash.replace(/^#\/?/, "").split("?");
    const current = PAGES.find((p) => p.id === path) ?? PAGES[0];
    for (const a of tabs.querySelectorAll<HTMLElement>("a")) a.classList.toggle("selected", a.dataset.page === current.id);
    if (typeof dispose === "function") dispose();
    dispose = undefined;
    ctx.query = new URLSearchParams(search);
    page.dataset.page = current.id;
    page.replaceChildren(h("p", { class: "loading" }, "加载中…"));
    try {
      dispose = await current.render(page, ctx);
    } catch (error) {
      page.replaceChildren(h("p", { class: "error" }, `页面加载失败：${errorText(error)}`));
    }
  }

  async function refreshStatus(): Promise<void> {
    try {
      showServePills(await api.serve(), servePill, bridgePill);
    } catch {
      showServePills(null, servePill, bridgePill);
    }
    try {
      const active = (await api.jobs(20)).jobs.filter((job) => isActive(job.state)).length;
      jobsButton.textContent = active ? `任务 (${active})` : "任务";
    } catch {
      jobsButton.textContent = "任务";
    }
  }

  window.addEventListener("hashchange", () => void route());
  await route();
  void refreshStatus();
  window.setInterval(() => void refreshStatus(), 15000);
}

void boot();
```

Until Task 2 creates `drawer.ts`, create a minimal one so the build passes:

```ts
import { h } from "./dom";

export class JobDrawer {
  readonly el = h("aside", { class: "drawer", id: "drawer", hidden: true });
  constructor(_readOnly: () => boolean) {}
  get isOpen(): boolean { return !this.el.hidden; }
  async open(_jobId?: string): Promise<void> { this.el.hidden = false; }
  close(): void { this.el.hidden = true; }
}
```

- [ ] **Step 6: The first e2e specs** (`website/tests/training-console/console.spec.ts`)

```ts
import { expect, test, type Page } from "@playwright/test";

export const TOKEN = "e2e-token";
const PAGES = ["overview", "serve", "data", "train", "models"];

async function noHorizontalScroll(page: Page) {
  const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(inner);
}

test("the shell shows five tabs and the chain pills @mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav.tabs a")).toHaveText(["总览", "服务", "数据", "训练", "模型"]);
  await expect(page.locator("main#page")).toHaveAttribute("data-page", "overview");
  await expect(page.locator("#pill-serve")).toHaveText("推理 ● 运行中");
  await expect(page.locator("#pill-bridge")).toHaveText("桥接 ● 空闲");
  await page.locator("nav.tabs a[data-page=data]").click();
  await expect(page.locator("main#page")).toHaveAttribute("data-page", "data");
  await expect(page.locator("nav.tabs a[data-page=data]")).toHaveClass(/selected/);
});

test("no page scrolls sideways @mobile", async ({ page }) => {
  for (const id of PAGES) {
    await page.goto(`/#/${id}`);
    await expect(page.locator("main#page")).toHaveAttribute("data-page", id);
    await expect(page.locator("main#page .loading")).toHaveCount(0);
    await noHorizontalScroll(page);
  }
});
```

- [ ] **Step 7: Build and run the specs**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/website
npm run build:training && ls ../src/training/realman_training/realman_training/static/assets
npm run test:training
```

Expected: the bundle has one `index-*.js` and one `index-*.css`; 4 passed (2 desktop + 2 mobile).

- [ ] **Step 8: Commit** (bundle included)

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add config/training/vite.config.mjs config/training/playwright.config.mjs config/website/playwright.config.mjs \
  website/package.json src/training/realman_training/web src/training/realman_training/realman_training/static \
  src/training/realman_training/test/web_fake.py src/training/realman_training/test/web_fake_steps.py \
  website/tests/training-console
git commit -m "feat(training): console UI shell, theme and e2e backend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared widgets, the confirm dialog and the job-log drawer

**Files:**
- Create: `web/src/widgets.ts`, `web/src/charts.ts`, `web/src/dialog.ts`
- Replace: `web/src/drawer.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.ts`, `dom.ts`, `ctx.ts`.
- Produces:
  - `widgets.ts`: `panel(title, ...children)`, `panelHead(title, ...actions)`, `stat(label, value)`, `kv(pairs)`, `chip(text, tone?)`, `table(headers, rows, opts?)`, `gpuList(gpus)`, `checksTable(checks)`, `evalTable(evals)`, `swapTable(evals)`, `jobChip(job)`.
  - `charts.ts`: `lineChart(xs, ys, { label, id? })`, `sparkline(trace)`.
  - `dialog.ts`: `confirmJob(ctx, { title, lines, kind, params, danger?, confirmLabel? }) -> Promise<JobRow | null>`; DOM `dialog#confirm-dialog`, `#confirm-token`, `#confirm-start`, `.error`.
  - `drawer.ts`: `JobDrawer` with `open(jobId?)`, `close()`, `isOpen`; DOM `#drawer`, `#drawer-jobs .item[data-job]`, `#drawer-job-head`, `#drawer-log`, `#drawer-cancel`, `#drawer-close`; fires `window` event `job-ended` (`detail` = JobRow) when a job it watched while active finishes.

- [ ] **Step 1: `widgets.ts`**

```ts
import type { Check, Gpus, JobRow } from "./api";
import { fmtMae, fmtMiB, h, KIND_LABEL, STATE_LABEL, stateClass, type Child } from "./dom";

export function panel(title: string | null, ...children: (Child | Child[])[]): HTMLElement {
  return h("section", { class: "panel" }, title ? h("h2", {}, title) : null, ...children);
}

export function panelHead(title: string, ...actions: Child[]): HTMLElement {
  return h("div", { class: "panel-head" }, h("h2", {}, title), h("div", { class: "actions" }, ...actions));
}

export function stat(label: string, value: Child): HTMLElement {
  return h("div", { class: "stat" }, h("span", {}, label), h("b", {}, value));
}

export function kv(pairs: [string, Child][]): HTMLElement {
  return h("dl", { class: "kv" }, pairs.flatMap(([key, value]) => [h("dt", {}, key), h("dd", {}, value ?? "–")]));
}

export function chip(text: string, tone: "" | "ok" | "warn" | "bad" | "run" = ""): HTMLElement {
  return h("span", { class: `chip${tone ? ` ${tone}` : ""}` }, text);
}

export function jobChip(job: JobRow): HTMLElement {
  return chip(STATE_LABEL[job.state] ?? job.state, stateClass(job.state) as "ok");
}

export function jobLabel(job: JobRow): string {
  return KIND_LABEL[job.kind] ?? job.kind;
}

export function table(headers: string[], rows: Child[][], opts: { id?: string; numeric?: number[] } = {}): HTMLElement {
  const numeric = new Set(opts.numeric ?? []);
  return h("div", { class: "table-wrap" },
    h("table", { id: opts.id },
      h("thead", {}, h("tr", {}, headers.map((header, i) => h("th", { class: numeric.has(i) ? "num" : null }, header)))),
      h("tbody", {}, rows.map((row) => h("tr", {}, row.map((cell, i) => h("td", { class: numeric.has(i) ? "num" : null }, cell)))))));
}

export function gpuList(gpus: Gpus | null, only?: number[]): HTMLElement {
  if (!gpus) return h("p", { class: "muted" }, "GPU 状态未知");
  if (!gpus.available) return h("p", { class: "notice" }, `nvidia-smi 不可用：${gpus.error ?? ""}`);
  const rows = gpus.gpus.filter((gpu) => !only || only.includes(gpu.index));
  return h("div", { class: "gpu-list" }, rows.map((gpu) => {
    const share = gpu.used_mib && gpu.total_mib ? Math.min(100, (100 * gpu.used_mib) / gpu.total_mib) : 0;
    const users = gpu.users.length ? gpu.users.map((u) => `${u.who} · ${fmtMiB(u.used_mib)}`).join("；") : "空闲";
    return h("div", { class: "gpu-row", "data-gpu": gpu.index },
      h("header", {}, h("strong", {}, `GPU ${gpu.index}`), h("span", {}, `${fmtMiB(gpu.used_mib)} / ${fmtMiB(gpu.total_mib)}`,
        gpu.util_pct === null ? "" : ` · ${gpu.util_pct}%`)),
      h("div", { class: `bar${gpu.busy ? " busy" : ""}` }, h("i", { style: `width:${share.toFixed(1)}%` })),
      h("div", { class: "gpu-users" }, users));
  }));
}

export function checksTable(checks: Check[], id?: string): HTMLElement {
  return table(["项目", "结果", "数值", "阈值", "说明"], checks.map((c) => [
    c.name, chip(c.ok ? "PASS" : "FAIL", c.ok ? "ok" : "bad"), c.value, c.threshold, c.detail || "",
  ]), { id });
}

type Evals = Record<string, Record<string, any>> | null | undefined;

function evalSteps(evals: Evals): string[] {
  return Object.keys(evals ?? {}).filter((s) => /^\d+$/.test(s)).sort((a, b) => Number(a) - Number(b));
}

export function evalTable(evals: Evals, id = "eval-table"): HTMLElement {
  const steps = evalSteps(evals);
  if (!steps.length) return h("p", { class: "muted" }, "还没有评估结果");
  const tasks = [...new Set(steps.flatMap((s) => Object.keys(evals![s]).filter((t) => t !== "prompt_swap")))].sort();
  const rows: Child[][] = steps.map((s) => [s, ...tasks.map((t) => fmtMae(evals![s][t]?.mae))]);
  const baseline = steps.map((s) => evals![s]).find((block) => tasks.some((t) => block[t]?.zero_baseline !== undefined));
  if (baseline) rows.push(["零动作基线", ...tasks.map((t) => fmtMae(baseline[t]?.zero_baseline))]);
  return table(["checkpoint", ...tasks.map((t) => `${t} MAE`)], rows, { id, numeric: tasks.map((_, i) => i + 1) });
}

export function swapTable(evals: Evals, id = "swap-table"): HTMLElement | null {
  const step = evalSteps(evals).reverse().find((s) => evals![s].prompt_swap);
  if (!step) return null;
  const swap: Record<string, Record<string, number>> = evals![step].prompt_swap;
  const tasks = Object.keys(swap).sort();
  const prompts = [...new Set(tasks.flatMap((t) => Object.keys(swap[t])))].sort();
  return h("div", {},
    h("h3", {}, `prompt 交换（checkpoint ${step}）：行 = 数据任务，列 = 给模型的 prompt`),
    table(["任务", ...prompts], tasks.map((t) => [t, ...prompts.map((p) => {
      const value = fmtMae(swap[t][p]);
      return p === t ? h("strong", {}, value) : value;
    })]), { id, numeric: prompts.map((_, i) => i + 1) }));
}
```

- [ ] **Step 2: `charts.ts`**

```ts
import { svg } from "./dom";

const W = 600;
const H = 180;
const PAD = { left: 52, right: 10, top: 18, bottom: 22 };

function short(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return Math.abs(n) >= 1 ? n.toFixed(2) : n.toPrecision(2);
}

export function lineChart(xs: (number | null)[], ys: (number | null)[], opts: { label: string; id?: string }): SVGSVGElement {
  const chart = svg("svg", { class: "chart", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.label, id: opts.id });
  const points = xs.map((x, i) => [x, ys[i]] as const)
    .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null && Number.isFinite(p[1]));
  chart.append(svg("text", { x: PAD.left, y: 12 }, opts.label));
  if (!points.length) {
    chart.append(svg("text", { x: W / 2, y: H / 2, "text-anchor": "middle" }, "暂无数据"));
    return chart;
  }
  const x0 = points[0][0];
  const x1 = points[points.length - 1][0] === x0 ? x0 + 1 : points[points.length - 1][0];
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [, y] of points) {
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  if (y0 === y1) {
    y0 -= 1e-6;
    y1 += 1e-6;
  }
  const sx = (x: number) => PAD.left + ((x - x0) / (x1 - x0)) * (W - PAD.left - PAD.right);
  const sy = (y: number) => PAD.top + (1 - (y - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom);
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("");
  chart.append(
    svg("line", { class: "axis", x1: PAD.left, y1: H - PAD.bottom, x2: W - PAD.right, y2: H - PAD.bottom }),
    svg("line", { class: "axis", x1: PAD.left, y1: PAD.top, x2: PAD.left, y2: H - PAD.bottom }),
    svg("text", { x: PAD.left - 6, y: PAD.top + 4, "text-anchor": "end" }, short(y1)),
    svg("text", { x: PAD.left - 6, y: H - PAD.bottom, "text-anchor": "end" }, short(y0)),
    svg("text", { x: PAD.left, y: H - 6 }, short(x0)),
    svg("text", { x: W - PAD.right, y: H - 6, "text-anchor": "end" }, short(x1)),
    svg("path", { class: "line", d }),
  );
  return chart;
}

export function sparkline(trace: number[] | undefined): SVGSVGElement {
  const chart = svg("svg", { class: "spark", viewBox: "0 0 120 26", "aria-hidden": "true" });
  chart.append(svg("line", { x1: 0, y1: 13, x2: 120, y2: 13 }));
  if (trace && trace.length > 1) {
    const step = 120 / (trace.length - 1);
    const points = trace.map((v, i) => `${(i * step).toFixed(1)},${(24 - v * 22).toFixed(1)}`).join(" ");
    chart.append(svg("polyline", { points }));
  }
  return chart;
}
```

- [ ] **Step 3: `dialog.ts`**

```ts
import { api, getToken, setToken, type JobRow } from "./api";
import type { Ctx } from "./ctx";
import { errorText, h } from "./dom";

export interface JobRequest {
  title: string;
  lines: string[];
  kind: string;
  params: Record<string, unknown>;
  danger?: boolean;
  confirmLabel?: string;
}

export function confirmJob(ctx: Ctx, request: JobRequest): Promise<JobRow | null> {
  return new Promise((resolve) => {
    const readOnly = ctx.health.read_only;
    const needToken = !readOnly && !getToken();
    const tokenInput = h("input", { type: "password", id: "confirm-token", autocomplete: "off", placeholder: "REALMAN_TRAINING_TOKEN" });
    const error = h("p", { class: "error", hidden: true });
    const start = h("button", { class: `button ${request.danger ? "danger" : "primary"}`, id: "confirm-start", type: "button",
      disabled: readOnly }, request.confirmLabel ?? "确认启动");
    const cancel = h("button", { class: "button ghost", id: "confirm-cancel", type: "button" }, "取消");
    const dialog = h("dialog", { class: "confirm", id: "confirm-dialog" },
      h("h2", {}, request.title),
      h("ul", {}, request.lines.map((line) => h("li", {}, line))),
      readOnly ? h("p", { class: "notice" }, "只读模式：服务器没有设置 REALMAN_TRAINING_TOKEN，不能启动任务。") : null,
      needToken ? h("label", { class: "token-line" }, "令牌（只保存在本页会话里）", tokenInput) : null,
      error,
      h("div", { class: "actions" }, cancel, start));
    let done = false;
    const finish = (job: JobRow | null) => {
      if (done) return;
      done = true;
      dialog.close();
      dialog.remove();
      resolve(job);
    };
    cancel.addEventListener("click", () => finish(null));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    start.addEventListener("click", async () => {
      if (needToken && tokenInput.value.trim()) setToken(tokenInput.value.trim());
      start.disabled = true;
      error.hidden = true;
      try {
        const { job } = await api.startJob(request.kind, request.params);
        finish(job);
        ctx.openDrawer(job.id);
        ctx.refreshStatus();
      } catch (failure) {
        error.textContent = errorText(failure);
        error.hidden = false;
        start.disabled = false;
      }
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}
```

- [ ] **Step 4: `drawer.ts`** (replace the Task 1 stub)

```ts
import { api, logSocket, type JobRow } from "./api";
import { errorText, fmtTime, h, isActive } from "./dom";
import { jobChip, jobLabel } from "./widgets";

const MAX_LOG_CHARS = 400_000;

export class JobDrawer {
  readonly el: HTMLElement;
  private readonly jobs: HTMLElement;
  private readonly log: HTMLPreElement;
  private readonly head: HTMLElement;
  private readonly cancelButton: HTMLButtonElement;
  private socket: WebSocket | null = null;
  private selected: string | null = null;
  private timer = 0;

  constructor(private readonly readOnly: () => boolean) {
    this.jobs = h("div", { class: "drawer-jobs", id: "drawer-jobs" });
    this.log = h("pre", { class: "log", id: "drawer-log" });
    this.head = h("div", { class: "drawer-job-head", id: "drawer-job-head" });
    this.cancelButton = h("button", { class: "button danger", id: "drawer-cancel", type: "button", hidden: true }, "取消任务");
    this.cancelButton.addEventListener("click", () => void this.cancel());
    const close = h("button", { class: "button ghost", id: "drawer-close", type: "button" }, "关闭");
    close.addEventListener("click", () => this.close());
    this.el = h("aside", { class: "drawer", id: "drawer", hidden: true, "aria-label": "任务日志" },
      h("div", { class: "drawer-head" }, h("h2", {}, "任务日志"), this.cancelButton, close),
      h("div", { class: "drawer-body" }, this.jobs, h("div", { class: "drawer-log" }, this.head, this.log)));
  }

  get isOpen(): boolean {
    return !this.el.hidden;
  }

  async open(jobId?: string): Promise<void> {
    this.el.hidden = false;
    await this.refresh(jobId);
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => void this.refresh(), 5000);
  }

  close(): void {
    this.el.hidden = true;
    window.clearInterval(this.timer);
    this.socket?.close();
    this.socket = null;
    this.selected = null;
  }

  private async refresh(select?: string): Promise<void> {
    let rows: JobRow[];
    try {
      rows = (await api.jobs(30)).jobs;
    } catch (error) {
      this.jobs.replaceChildren(h("p", { class: "error" }, errorText(error)));
      return;
    }
    const current = select ?? this.selected;
    this.jobs.replaceChildren(...rows.map((job) => {
      const button = h("button", { class: `item${job.id === current ? " selected" : ""}`, type: "button", "data-job": job.id },
        h("strong", {}, jobLabel(job), " ", jobChip(job)),
        h("small", {}, fmtTime(job.created), job.progress?.text ? ` · ${job.progress.text}` : "", job.error ? ` · ${job.error}` : ""));
      button.addEventListener("click", () => this.select(job));
      return button;
    }));
    if (!rows.length) this.jobs.append(h("p", { class: "muted" }, "还没有任务"));
    const target = select ? rows.find((job) => job.id === select)
      : !this.selected ? rows.find((job) => isActive(job.state)) ?? rows[0] : undefined;
    if (target) this.select(target);
  }

  private select(job: JobRow): void {
    if (this.selected === job.id && this.socket) return;
    this.selected = job.id;
    this.socket?.close();
    this.log.textContent = "";
    this.showHead(job);
    for (const item of this.jobs.querySelectorAll<HTMLElement>(".item")) item.classList.toggle("selected", item.dataset.job === job.id);
    const socket = logSocket(job.id);
    this.socket = socket;
    let wasActive = false;
    socket.addEventListener("message", (event) => {
      if (this.socket !== socket) return;
      const data = JSON.parse(String(event.data));
      if (data.type === "lines") this.append(data.lines);
      if (data.type === "status") {
        const row = data.job as JobRow;
        this.showHead(row);
        if (isActive(row.state)) wasActive = true;
        else if (wasActive) window.dispatchEvent(new CustomEvent("job-ended", { detail: row }));
      }
    });
  }

  private append(lines: string[]): void {
    const atBottom = this.log.scrollTop + this.log.clientHeight >= this.log.scrollHeight - 8;
    this.log.append(`${lines.join("\n")}\n`);
    if ((this.log.textContent?.length ?? 0) > MAX_LOG_CHARS) this.log.textContent = this.log.textContent!.slice(-MAX_LOG_CHARS);
    if (atBottom) this.log.scrollTop = this.log.scrollHeight;
  }

  private showHead(job: JobRow): void {
    const progress = job.progress
      ? `${job.progress.text || ""}${job.progress.total ? ` (${job.progress.done}/${job.progress.total})` : ""}` : "";
    this.head.replaceChildren(h("strong", {}, `${jobLabel(job)} · ${job.id}`), jobChip(job),
      progress ? h("span", { class: "muted" }, progress) : null,
      job.error ? h("span", { class: "error" }, job.error) : null);
    this.cancelButton.hidden = !isActive(job.state) || this.readOnly();
    this.cancelButton.dataset.job = job.id;
  }

  private async cancel(): Promise<void> {
    const id = this.cancelButton.dataset.job;
    if (!id || !window.confirm("取消这个任务？训练会停止它的容器。")) return;
    try {
      await api.cancelJob(id);
    } catch (error) {
      window.alert(`取消失败：${errorText(error)}`);
    }
  }
}
```

- [ ] **Step 5: Drawer e2e** (append to `console.spec.ts`)

```ts
test("the jobs button opens the drawer with live logs", async ({ page, request }) => {
  const created = await request.post("/api/jobs", {
    headers: { "X-Training-Token": TOKEN },
    data: { kind: "linkcheck", params: { only: ["link"] }, confirm: true },
  });
  expect(created.status()).toBe(201);
  const { job } = await created.json();
  await page.goto("/");
  await page.locator("#jobs-button").click();
  await expect(page.locator("#drawer")).toBeVisible();
  await page.locator(`#drawer-jobs .item[data-job="${job.id}"]`).click();
  await expect(page.locator("#drawer-log")).toContainText("fake linkcheck done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await page.locator("#drawer-close").click();
  await expect(page.locator("#drawer")).toBeHidden();
});
```

- [ ] **Step 6: Run, commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/website && npm run test:training
cd .. && git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): confirm dialog, job-log drawer and shared widgets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: 5 passed.

---

### Task 3: 总览 (overview)

**Files:**
- Replace: `web/src/pages/overview.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.serve/linkcheck/gpus/jobs/datasets/models/runs`, widgets, `DATASET_KIND`.
- Produces: DOM `#card-serve`, `#card-link`, `#card-gpus`, `#card-train`, `#recent-datasets`, `#latest-models`, `#recent-jobs`.

- [ ] **Step 1: Write the failing spec** (append)

```ts
test("overview: four status cards and the recent lists @mobile", async ({ page }) => {
  await page.goto("/#/overview");
  await expect(page.locator("#card-serve")).toContainText("pi05_realman_multitask_action_only/m_multitask_b16_2gpu");
  await expect(page.locator("#card-serve")).toContainText("29999");
  await expect(page.locator("#card-link")).toContainText("未通过");
  await expect(page.locator("#card-link")).toContainText("bulk_throughput");
  await expect(page.locator("#card-gpus .gpu-row")).toHaveCount(4);
  await expect(page.locator("#card-gpus")).toContainText("openpi-serve-openpi-1");
  await expect(page.locator("#card-train")).toContainText("a_new_run");
  await expect(page.locator("#recent-datasets tbody tr")).toHaveCount(3);
  await expect(page.locator("#latest-models")).toContainText("m_multitask_b16_2gpu");
  await page.locator("#recent-datasets tbody tr", { hasText: "realman__multitask_clean" }).click();
  await expect(page).toHaveURL(/#\/data\?path=realman__multitask_clean/);
});
```

- [ ] **Step 2: Run, see it fail** (`npm run test:training`) — `#card-serve` missing.

- [ ] **Step 3: Implement `web/src/pages/overview.ts`**

```ts
import { api, type DatasetRow, type Gpus, type JobRow, type LinkcheckPayload, type ModelRow, type RunRow, type ServeStatus } from "../api";
import type { Ctx } from "../ctx";
import { DATASET_KIND, errorText, fmtCount, fmtMae, fmtTime, h, isActive } from "../dom";
import { chip, gpuList, jobChip, jobLabel, kv, panel } from "../widgets";

function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function failure(result: PromiseSettledResult<unknown>): HTMLElement | null {
  return result.status === "rejected" ? h("p", { class: "error" }, errorText(result.reason)) : null;
}

function card(id: string, title: string, ...children: (Node | string | null)[]): HTMLElement {
  const el = panel(title, ...children);
  el.id = id;
  return el;
}

function serveCard(status: ServeStatus | null): HTMLElement {
  if (!status) return card("card-serve", "推理服务", h("p", { class: "muted" }, "状态未知"));
  if (status.error) return card("card-serve", "推理服务", h("p", { class: "notice" }, status.error));
  const record = status.record || {};
  const running = Boolean(status.serve?.running);
  const bridge = status.bridge || {};
  return card("card-serve", "推理服务",
    h("p", { class: "big" }, running ? "运行中" : "已停止"),
    kv([
      ["模型", record.model ? `${record.model} @ ${record.step}` : "–"],
      ["GPU · 端口", record.gpu !== undefined ? `GPU ${record.gpu} · :${record.port}` : "–"],
      ["任务", record.task ?? "–"],
      ["桥接", bridge.error ? "不可达" : bridge.running ? (Number(bridge.allow_publish) ? "发布中" : "空闲（未激活）") : "已停止"],
    ]));
}

function linkCard(link: LinkcheckPayload | null): HTMLElement {
  const latest = link?.latest;
  if (!latest) return card("card-link", "数据链路", h("p", { class: "muted" }, "还没有链路检测"));
  const failed = latest.checks.filter((c) => !c.ok);
  return card("card-link", "数据链路",
    h("p", { class: "big" }, latest.ok ? "全部通过" : "未通过"),
    h("p", { class: "muted" }, fmtTime(latest.at)),
    failed.length ? h("p", {}, failed.map((c) => `${c.name} ${c.value}`).join("；")) : null);
}

function trainCard(trainJobs: JobRow[] | null, runs: RunRow[] | null): HTMLElement {
  const running = trainJobs?.find((job) => isActive(job.state));
  if (running) {
    const p = running.progress;
    const share = p?.total ? Math.min(100, (100 * p.done) / p.total) : 0;
    return card("card-train", "当前训练",
      h("p", { class: "big" }, `${running.params.config_name}/${running.params.exp}`),
      h("div", { class: "bar" }, h("i", { style: `width:${share.toFixed(1)}%` })),
      h("p", { class: "muted" }, p?.text || "启动中"));
  }
  const live = runs?.find((run) => run.started && !run.ended);
  if (live) {
    return card("card-train", "当前训练",
      h("p", { class: "big" }, live.name),
      h("p", { class: "muted" }, `step ${live.last_step ?? "–"} / ${live.num_train_steps ?? "–"} · loss ${fmtMae(live.last_loss)}`),
      h("p", { class: "muted" }, "（没有跟随它的任务：在训练页用 attach 接管）"));
  }
  return card("card-train", "当前训练", h("p", { class: "muted" }, "没有运行中的训练"));
}

function recentDatasets(rows: DatasetRow[] | null, ctx: Ctx): HTMLElement {
  const recent = (rows ?? []).filter((r) => r.kind !== "error")
    .sort((a, b) => (b.last_file_time ?? "").localeCompare(a.last_file_time ?? "")).slice(0, 5);
  const body = h("tbody", {}, recent.map((row) => {
    const tr = h("tr", { class: "clickable" },
      h("td", {}, row.name, h("div", { class: "muted" }, row.path)), h("td", {}, DATASET_KIND[row.kind]),
      h("td", { class: "num" }, row.episodes ?? "–"), h("td", { class: "num" }, fmtCount(row.frames)),
      h("td", {}, fmtTime(row.last_file_time)));
    tr.addEventListener("click", () => ctx.navigate("data", { path: row.path }));
    return tr;
  }));
  return panel("最近数据集", h("div", { class: "table-wrap" }, h("table", { id: "recent-datasets" },
    h("thead", {}, h("tr", {}, ["数据集", "类型", "条数", "帧数", "更新"].map((t, i) => h("th", { class: i === 2 || i === 3 ? "num" : null }, t)))),
    body)));
}

function latestModels(models: ModelRow[] | null, ctx: Ctx): HTMLElement {
  const list = h("div", { class: "list", id: "latest-models" }, (models ?? []).slice(0, 3).map((model) => {
    const mae = model.open_loop ? Object.entries(model.open_loop.tasks).map(([t, v]) => `${t} ${fmtMae(v)}`).join(" · ") : "未评估";
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, model.name, " ", model.serving ? chip("服务中", "ok") : null),
      h("small", {}, `${model.method ?? ""} · ${fmtTime(model.trained_end)}`), h("small", {}, mae));
    item.addEventListener("click", () => ctx.navigate("models", { model: model.name }));
    return item;
  }));
  if (!models?.length) list.append(h("p", { class: "muted" }, "还没有登记的模型"));
  return panel("最新模型", list);
}

function recentJobs(jobs: JobRow[] | null, ctx: Ctx): HTMLElement {
  const list = h("div", { class: "list", id: "recent-jobs" }, (jobs ?? []).map((job) => {
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, jobLabel(job), " ", jobChip(job)),
      h("small", {}, `${fmtTime(job.created)}${job.progress?.text ? ` · ${job.progress.text}` : ""}${job.error ? ` · ${job.error}` : ""}`));
    item.addEventListener("click", () => ctx.openDrawer(job.id));
    return item;
  }));
  if (!jobs?.length) list.append(h("p", { class: "muted" }, "还没有任务"));
  return panel("最近任务", list);
}

export async function renderOverview(root: HTMLElement, ctx: Ctx): Promise<void> {
  const results = await Promise.allSettled([
    api.serve(), api.linkcheck(), api.gpus(), api.jobs(8), api.jobs(5, "train"), api.datasets(), api.models(), api.runs(),
  ]);
  const [serve, link, gpus, jobs, trainJobs, datasets, models, runs] = results;
  const gpuCard = card("card-gpus", "GPU", gpuList(settled(gpus) as Gpus | null));
  root.replaceChildren(
    h("section", { class: "cards" },
      serveCard(settled(serve)), linkCard(settled(link)), gpuCard,
      trainCard(settled(trainJobs)?.jobs ?? null, settled(runs)?.runs ?? null)),
    ...results.map(failure).filter((e): e is HTMLElement => e !== null),
    h("section", { class: "two" },
      recentDatasets(settled(datasets)?.datasets ?? null, ctx), latestModels(settled(models)?.models ?? null, ctx)),
    recentJobs(settled(jobs)?.jobs ?? null, ctx));
}
```

- [ ] **Step 4: Run** `npm run test:training` — expected: all pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): overview page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 数据 (datasets, quality table, cleaned set, training view)

**Files:**
- Replace: `web/src/pages/data.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.datasets/dataset/options`, `confirmJob`, widgets, `sparkline`.
- Produces: DOM `#dataset-list .item[data-path]`, `#pull`, `#dataset-detail`, `#dataset-stats`, `#task-bars`, `#features`, `#quality-table tr[data-episode] input.drop`, `#drop-count`, `#make-clean`, `#make-view`, `#view-form`, `#view-start`, `.quality-unavailable`.

- [ ] **Step 1: Write the failing specs** (append)

```ts
const RAW = "raw_realman_ts_20261016/realman__pi05-three-arm";

test("data: suggested drops are pre-checked and a cleaned set is requested", async ({ page, request }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await expect(page.locator("#dataset-list .item.selected")).toContainText("realman__pi05-three-arm");
  await expect(page.locator("#dataset-stats")).toContainText("5");
  await expect(page.locator("#dataset-stats")).toContainText("LeRobot v3.0");
  await expect(page.locator("#task-bars")).toContainText("pick_only");
  await expect(page.locator("#features")).toContainText("observation.gripper_position");
  const rows = page.locator("#quality-table tbody tr");
  await expect(rows).toHaveCount(5);
  const box = (ep: number) => page.locator(`#quality-table tr[data-episode="${ep}"] input.drop`);
  await expect(box(1)).toBeChecked();
  await expect(box(2)).toBeChecked();
  await expect(box(0)).not.toBeChecked();
  await expect(box(4)).not.toBeChecked();
  await expect(page.locator(`#quality-table tr[data-episode="4"]`)).toContainText("提示");
  await expect(page.locator("#quality-table svg.spark").first()).toBeVisible();
  await box(2).uncheck();
  await box(4).check();
  await expect(page.locator("#make-clean")).toHaveText("生成清洗版（剔除 2 条）");
  await page.locator("#make-clean").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toContainText("剔除 2 条：1, 4");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("#drawer")).toBeVisible();
  await expect(page.locator("#drawer-log")).toContainText("fake clean done");
  const jobs = await (await request.get("/api/jobs?kind=clean")).json();
  expect(jobs.jobs[0].params.drop).toEqual([1, 4]);
  expect(jobs.jobs[0].params.reasons["1"]).toContain("closed plateau");
  expect(jobs.jobs[0].params.reasons["4"]).toBe("人工剔除");
});

test("data: a training view request carries the task prompts", async ({ page, request }) => {
  await page.goto("/#/data?path=realman__multitask_clean");
  await page.locator("#make-view").click();
  await expect(page.locator("#view-form")).toBeVisible();
  await expect(page.locator('#view-form input[data-task="pick_only"]')).toHaveValue("pick up the power adapter");
  await page.locator('#view-form input[name="dst"]').fill("e2e_view");
  await page.locator('#view-form input[name="dry_run"]').check();
  await page.locator("#view-start").click();
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake view done");
  const jobs = await (await request.get("/api/jobs?kind=view")).json();
  expect(jobs.jobs[0].params.task_prompts.pick_only).toBe("pick up the power adapter");
  expect(jobs.jobs[0].params.dry_run).toBe(true);
  expect(jobs.jobs[0].params.dst).toMatch(/e2e_view$/);
});

test("data: a training view says why it has no quality table", async ({ page }) => {
  await page.goto("/#/data?path=realman_right_arm_multitask_view");
  await expect(page.locator(".quality-unavailable")).toContainText("training view");
  await expect(page.locator("#make-clean")).toHaveCount(0);
  await expect(page.locator("#dataset-detail")).toContainText("pick up the power adapter and put it in the blue bin");
});
```

Every Playwright test gets a fresh browser context, so the session has no token and the dialog always shows `#confirm-token` on a test's first job.

- [ ] **Step 2: Run, see them fail.**

- [ ] **Step 3: Implement `web/src/pages/data.ts`**

```ts
import { api, type DatasetDetail, type DatasetRow, type EpisodeQuality, type Options } from "../api";
import { sparkline } from "../charts";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { DATASET_KIND, errorText, fmtBytes, fmtCount, fmtDay, fmtDuration, fmtTime, h } from "../dom";
import { chip, kv, panel, panelHead, stat } from "../widgets";

const VERDICT: Record<EpisodeQuality["verdict"], [string, "ok" | "warn" | "bad"]> = {
  ok: ["正常", "ok"], warn: ["提示", "warn"], suggest_drop: ["建议剔除", "bad"],
};

function datasetItem(row: DatasetRow, selected: boolean, ctx: Ctx): HTMLElement {
  const quality = row.quality_counts;
  const item = h("button", { class: `item${selected ? " selected" : ""}`, type: "button", "data-path": row.path },
    h("strong", {}, row.name, " ", chip(DATASET_KIND[row.kind] ?? row.kind, row.kind === "error" ? "bad" : "")),
    row.kind === "error"
      ? h("small", {}, row.error ?? "")
      : h("small", {}, `${row.episodes} 条 · ${fmtCount(row.frames)} 帧 · ${fmtTime(row.last_file_time)}`),
    quality?.suggest_drop ? h("small", {}, `建议剔除 ${quality.suggest_drop} 条`) : null,
    row.kind === "clean" && row.removed_episodes ? h("small", {}, `已剔除 ${row.removed_episodes} 条`) : null,
    row.path !== row.name ? h("small", {}, row.path) : null);
  item.addEventListener("click", () => ctx.navigate("data", { path: row.path }));
  return item;
}

function taskBars(detail: DatasetDetail): HTMLElement {
  const s = detail.summary;
  const total = Math.max(1, s.episodes);
  return h("div", { class: "task-bars", id: "task-bars" }, Object.entries(s.tasks).map(([task, count]) =>
    h("div", { class: "task-bar" }, h("span", {}, task), h("span", {}, `${count} 条 · ${fmtCount(s.task_frames[task])} 帧`),
      h("div", { class: "bar" }, h("i", { style: `width:${((100 * count) / total).toFixed(1)}%` })))));
}

function features(detail: DatasetDetail): HTMLElement {
  const s = detail.summary;
  return h("div", { id: "features" },
    kv(Object.entries(s.features).map(([name, f]) => [name, `${f.dtype} [${(f.shape ?? []).join(", ")}]`])),
    h("h3", {}, "相机"),
    kv(s.cameras.map((c) => [c.key, `${c.codec ?? "?"} · ${c.height ?? "?"}×${c.width ?? "?"}`])));
}

function reasonFor(q: EpisodeQuality | undefined): string {
  const drops = (q?.findings ?? []).filter((f) => f.severity === "drop").map((f) => f.message);
  return drops.length ? drops.join("; ") : "人工剔除";
}

function viewForm(detail: DatasetDetail, options: Options, ctx: Ctx): HTMLElement {
  const s = detail.summary;
  const arm = h("select", { name: "arm" }, options.arms.map((a) => h("option", { value: a, selected: a === options.default_arm }, a)));
  const prompts = Object.keys(s.tasks).map((task) =>
    h("label", { class: "wide" }, `${task} 的 prompt`,
      h("input", { type: "text", "data-task": task, value: options.prompts[task] ?? "" })));
  const dst = h("input", { type: "text", name: "dst", placeholder: `${s.name}_view` });
  const dryRun = h("input", { type: "checkbox", name: "dry_run" });
  const error = h("p", { class: "error", hidden: true });
  const start = h("button", { class: "button primary", id: "view-start", type: "button" }, "生成训练视图");
  start.addEventListener("click", () => {
    const taskPrompts: Record<string, string> = {};
    for (const input of prompts.map((label) => label.querySelector("input")!)) taskPrompts[input.dataset.task!] = input.value.trim();
    const empty = Object.entries(taskPrompts).filter(([, p]) => !p).map(([t]) => t);
    if (empty.length) {
      error.textContent = `这些任务没有 prompt：${empty.join(", ")}`;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const params: Record<string, unknown> = { src: detail.path, arm: arm.value, task_prompts: taskPrompts, dry_run: dryRun.checked };
    if (dst.value.trim()) params.dst = dst.value.trim();
    void confirmJob(ctx, {
      title: "生成训练视图", kind: "view", params,
      lines: [`来源：${detail.path}`, `手臂：${arm.value}`, ...Object.entries(taskPrompts).map(([t, p]) => `${t} → “${p}”`),
        `新目录：${dst.value.trim() || `${s.name}_view`}（已存在会被拒绝）`, "生成后自动检查每条的夹爪标签",
        ...(dryRun.checked ? ["试运行：只打印命令"] : [])],
    });
  });
  return h("div", { id: "view-form", hidden: true },
    h("h3", {}, "训练视图"),
    h("div", { class: "form" }, h("label", {}, "手臂", arm), ...prompts, h("label", {}, "目录名（可选）", dst),
      h("label", { class: "check" }, dryRun, "试运行")),
    h("p", { class: "muted" }, "prompt 必须和机器人 policy_bridge 的 prompt 完全一致。"),
    error, h("div", { class: "actions" }, start));
}

function qualitySection(detail: DatasetDetail, options: Options, ctx: Ctx): HTMLElement {
  if (!detail.quality) {
    return panel("逐条质检", h("p", { class: "notice quality-unavailable" }, detail.quality_unavailable ?? "没有质检结果"));
  }
  const byEpisode = new Map(detail.quality.map((q) => [q.episode, q]));
  const suggested = new Set(detail.suggested_drops);
  const count = h("span", { id: "drop-count", class: "muted" });
  const makeClean = h("button", { class: "button primary", id: "make-clean", type: "button" });
  const makeView = h("button", { class: "button secondary", id: "make-view", type: "button" }, "生成训练视图…");
  const form = viewForm(detail, options, ctx);
  makeView.addEventListener("click", () => { form.hidden = !form.hidden; });
  const fps = detail.summary.fps || 1;
  const body = h("tbody", {}, detail.quality.map((q) => {
    const [label, tone] = VERDICT[q.verdict];
    const box = h("input", { type: "checkbox", class: "drop", checked: suggested.has(q.episode), "aria-label": `剔除 ${q.episode}` });
    box.addEventListener("change", update);
    return h("tr", { "data-episode": q.episode },
      h("td", {}, box), h("td", { class: "num" }, q.episode), h("td", {}, q.task),
      h("td", { class: "num" }, `${q.frames} · ${fmtDuration(q.frames / fps)}`),
      h("td", {}, sparkline(detail.traces[String(q.episode)])), h("td", {}, chip(label, tone)),
      h("td", {}, q.findings.map((f) => f.message).join("；")));
  }));
  function checked(): number[] {
    return [...body.querySelectorAll<HTMLInputElement>("input.drop")].filter((b) => b.checked)
      .map((b) => Number(b.closest("tr")!.dataset.episode)).sort((a, b) => a - b);
  }
  function update(): void {
    const n = checked().length;
    count.textContent = `已选 ${n} 条`;
    makeClean.textContent = `生成清洗版（剔除 ${n} 条）`;
    makeClean.disabled = n === 0;
  }
  makeClean.addEventListener("click", () => {
    const drop = checked();
    const reasons = Object.fromEntries(drop.map((ep) => [String(ep), reasonFor(byEpisode.get(ep))]));
    void confirmJob(ctx, {
      title: "生成清洗版", kind: "clean", params: { src: detail.path, drop, reasons },
      lines: [`来源：${detail.path}`, `剔除 ${drop.length} 条：${drop.join(", ")}`,
        `新目录：${detail.summary.name}_clean_<日期时间>（原数据不动，视频用硬链接）`, "剔除清单和原因写进新目录的 clean_manifest.json"],
    });
  });
  update();
  return h("section", { class: "panel" },
    panelHead("逐条质检", count, makeClean, makeView),
    h("p", { class: "muted" }, "建议剔除的条目已预勾选；勾选可增减，确认后才生成清洗版。夹爪缩略图：上 = 闭合，下 = 张开。"),
    h("div", { class: "table-wrap" }, h("table", { id: "quality-table" },
      h("thead", {}, h("tr", {}, ["剔除", "#", "任务", "帧数 · 时长", "夹爪", "结论", "原因"].map((t) => h("th", {}, t)))), body)),
    form);
}

async function renderDetail(el: HTMLElement, path: string, options: Options, ctx: Ctx): Promise<void> {
  let detail: DatasetDetail;
  try {
    detail = await api.dataset(path);
  } catch (error) {
    el.replaceChildren(h("p", { class: "error" }, errorText(error)));
    return;
  }
  const s = detail.summary;
  const codecs = [...new Set(s.cameras.map((c) => c.codec ?? "?"))].join(", ") || "–";
  const provenance: [string, string][] = [["类型", DATASET_KIND[s.kind] ?? s.kind], ["路径", detail.path], ["机器人", s.robot_type || "–"]];
  if (s.source) provenance.push(["来源", s.source]);
  if (s.removed_episodes) provenance.push(["已剔除", `${s.removed_episodes} 条`]);
  for (const [task, prompt] of Object.entries(s.prompts)) provenance.push([`prompt ${task}`, prompt]);
  el.replaceChildren(
    h("section", { class: "panel" },
      h("h2", {}, s.name),
      h("div", { class: "stats", id: "dataset-stats" },
        stat("条数", String(s.episodes)),
        stat("帧数 / 时长", `${fmtCount(s.frames)} · ${fmtDuration(s.duration_sec)}`),
        stat("时间范围", `${fmtDay(s.first_file_time)} → ${fmtDay(s.last_file_time)}`),
        stat("格式", `LeRobot ${s.codebase_version} · ${s.fps} fps`),
        stat("磁盘 / 编码", `${fmtBytes(s.disk_bytes)} · ${codecs}`)),
      h("h3", {}, "来源"), kv(provenance)),
    h("section", { class: "two" }, panel("任务分布", taskBars(detail)), panel("特征与相机", features(detail))),
    qualitySection(detail, options, ctx));
}

export async function renderData(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [{ datasets }, options] = await Promise.all([api.datasets(), api.options()]);
  const selected = ctx.query.get("path") ?? datasets.find((d) => d.kind !== "error")?.path ?? null;
  const pull = h("button", { class: "button secondary", id: "pull", type: "button" }, "从 realman_ts 拉取");
  pull.addEventListener("click", () => void confirmJob(ctx, {
    title: "从 realman_ts 拉取录制", kind: "pull", params: {},
    lines: ["通过 ssh realman_local 从录制容器打包当前录制", `写入 ${ctx.health.data_root}/raw_realman_ts_<日期时间>（新目录，不覆盖）`,
      "录制可以继续；拉取期间占用 realman_ts 的上行带宽"],
  }));
  const list = h("div", { class: "list", id: "dataset-list" }, datasets.map((row) => datasetItem(row, row.path === selected, ctx)));
  if (!datasets.length) list.append(h("p", { class: "muted" }, `${ctx.health.data_root} 下还没有数据集`));
  const detail = h("div", { class: "stack", id: "dataset-detail" }, h("p", { class: "loading" }, "加载中…"));
  root.replaceChildren(h("section", { class: "split" },
    h("section", { class: "panel" }, panelHead("数据集", pull), list), detail));
  if (selected) await renderDetail(detail, selected, options, ctx);
  else detail.replaceChildren();
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["pull", "clean", "view"].includes(job.kind) && job.state === "succeeded") ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
```

- [ ] **Step 4: Run** `npm run test:training` — expected: all pass. If `#dataset-stats` shows the episode count as `5` only inside another tile, tighten the first assertion to `page.locator("#dataset-stats .stat").first()`.

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): data page with the quality table, cleaned sets and training views

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 训练 (new run, runs, curves, eval, register)

**Files:**
- Replace: `web/src/pages/train.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.runs/run/options/gpus`, `lineChart`, `evalTable`, `swapTable`, `gpuList`, `confirmJob`.
- Produces: DOM `#train-form` (`input[name=config_name]`, `select[name=view]`, `input[name=exp]`, `input.gpu[data-gpu]`, `input[name=batch]`, `input[name=steps]`, `input[name=dry_run]`), `#start-train`, `#train-error`, `#run-list .item[data-run]`, `#run-detail`, `#chart-loss`, `#chart-grad`, `#eval-table`, `#swap-table`, `#eval-form`, `#start-eval`, `#register-form`, `#start-register`.

- [ ] **Step 1: Write the failing specs** (append)

```ts
const MODEL = "pi05_realman_multitask_action_only/m_multitask_b16_2gpu";

test("train: curves, per-task eval and the prompt swap of a run", async ({ page }) => {
  await page.goto(`/#/train?run=${encodeURIComponent(MODEL)}`);
  await expect(page.locator("#run-list .item.selected")).toContainText("m_multitask_b16_2gpu");
  await expect(page.locator("#chart-loss path.line")).toHaveCount(1);
  await expect(page.locator("#chart-grad path.line")).toHaveCount(1);
  await expect(page.locator("#eval-table")).toContainText("0.096");
  await expect(page.locator("#eval-table")).toContainText("零动作基线");
  await expect(page.locator("#swap-table")).toContainText("0.187");
  await expect(page.locator("#run-detail .gpu-row")).toHaveCount(2);
});

test("train: a new run needs GPUs and goes through the confirm dialog", async ({ page, request }) => {
  await page.goto("/#/train");
  const form = page.locator("#train-form");
  await form.locator('input[name="config_name"]').fill("pi05_realman_multitask_action_only");
  await form.locator('select[name="view"]').selectOption("realman_right_arm_multitask_view");
  await form.locator('input[name="exp"]').fill("e2e_run");
  await page.locator("#start-train").click();
  await expect(page.locator("#train-error")).toContainText("GPU");
  await form.locator('input.gpu[data-gpu="1"]').check();
  await form.locator('input.gpu[data-gpu="3"]').check();
  await form.locator('input[name="batch"]').fill("16");
  await form.locator('input[name="dry_run"]').check();
  await page.locator("#start-train").click();
  await expect(page.locator("#confirm-dialog")).toContainText("GPU 1,3");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake train done");
  const jobs = await (await request.get("/api/jobs?kind=train")).json();
  expect(jobs.jobs[0].params).toMatchObject({ exp: "e2e_run", gpus: "1,3", batch: 16, dry_run: true });
});

test("train: evaluate and register a run", async ({ page, request }) => {
  await page.goto(`/#/train?run=${encodeURIComponent(MODEL)}`);
  await page.locator('#eval-form select[name="gpu"]').selectOption("3");
  await page.locator("#start-eval").click();
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake eval done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await page.waitForTimeout(500); // the page reloads itself when the job ends
  const evals = await (await request.get("/api/jobs?kind=eval")).json();
  expect(evals.jobs[0].params).toMatchObject({ gpu: "3", checkpoints: [29999], prompt_swap: null });
  await page.locator('#register-form input[name="status"]').fill("e2e");
  await page.locator("#start-register").click();
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake register done");
});
```

- [ ] **Step 2: Run, see them fail.**

- [ ] **Step 3: Implement `web/src/pages/train.ts`**

```ts
import { api, type Gpus, type Options, type RunDetail, type RunRow } from "../api";
import { lineChart } from "../charts";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { errorText, fmtMae, fmtMiB, fmtTime, h } from "../dom";
import { chip, evalTable, gpuList, kv, panel, panelHead, swapTable } from "../widgets";

function runState(run: RunRow): HTMLElement {
  if (run.started && !run.ended) return chip("训练中", "run");
  if (run.exit_code === 0) return chip(run.registered ? "已登记" : "完成", "ok");
  if (run.exit_code) return chip(`失败 ${run.exit_code}`, "bad");
  return chip(run.registered ? "已登记" : "—");
}

function newRunForm(options: Options, gpus: Gpus | null, ctx: Ctx): HTMLElement {
  const configs = h("datalist", { id: "train-configs" }, options.configs.map((c) => h("option", { value: c })));
  const configName = h("input", { type: "text", name: "config_name", list: "train-configs", placeholder: "openpi 配置名" });
  const view = h("select", { name: "view" }, h("option", { value: "" }, "选择训练视图"),
    options.views.map((v) => h("option", { value: v }, v)));
  const exp = h("input", { type: "text", name: "exp", placeholder: "实验名，例如 m_multitask_b16_2gpu" });
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpuBoxes = indices.map((i) => {
    const info = gpus?.gpus.find((g) => g.index === i);
    const box = h("input", { type: "checkbox", class: "gpu", "data-gpu": i });
    return h("label", {}, box, `GPU ${i}`, info ? ` · ${fmtMiB(info.used_mib)}${info.busy ? " 占用" : ""}` : "");
  });
  const batch = h("input", { type: "number", name: "batch", min: 1, placeholder: "默认 = 配置" });
  const steps = h("input", { type: "number", name: "steps", min: 1, placeholder: "默认 = 配置" });
  const dryRun = h("input", { type: "checkbox", name: "dry_run" });
  const error = h("p", { class: "error", id: "train-error", hidden: true });
  const start = h("button", { class: "button primary", id: "start-train", type: "button" }, "开始训练");
  start.addEventListener("click", () => {
    const chosen = gpuBoxes.map((l) => l.querySelector("input")!).filter((b) => b.checked).map((b) => b.dataset.gpu!);
    const missing = [!configName.value.trim() && "配置名", !view.value && "训练视图", !exp.value.trim() && "实验名", !chosen.length && "GPU"]
      .filter(Boolean);
    if (missing.length) {
      error.textContent = `还缺：${missing.join("、")}`;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const params: Record<string, unknown> = { config_name: configName.value.trim(), view: view.value, exp: exp.value.trim(),
      gpus: chosen.join(","), dry_run: dryRun.checked };
    if (batch.value) params.batch = Number(batch.value);
    if (steps.value) params.steps = Number(steps.value);
    void confirmJob(ctx, {
      title: "开始训练", kind: "train", params,
      lines: [`配置：${params.config_name}`, `训练视图：${params.view}`, `实验名：${params.exp}`, `GPU ${chosen.join(",")}`,
        `batch ${batch.value || "默认"} · steps ${steps.value || "默认"}`, "缺 norm 时先自动计算；同一时间只允许一个训练",
        "训练会占用所选 GPU 数小时；GPU 被他人占用时会被拒绝", ...(dryRun.checked ? ["试运行：只打印命令"] : [])],
    });
  });
  return h("section", { class: "panel" }, h("h2", {}, "新建训练"),
    h("div", { class: "form", id: "train-form" },
      h("label", {}, "openpi 配置", configName, configs), h("label", {}, "训练视图", view), h("label", {}, "实验名", exp),
      h("div", { class: "wide checks" }, gpuBoxes), h("label", {}, "batch", batch), h("label", {}, "steps", steps),
      h("label", { class: "check" }, dryRun, "试运行")),
    error, h("div", { class: "actions" }, start));
}

function evalForm(run: RunDetail, gpus: Gpus | null, ctx: Ctx): HTMLElement {
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpu = h("select", { name: "gpu" }, indices.map((i) => h("option", { value: i }, `GPU ${i}`)));
  const latest = run.checkpoints[run.checkpoints.length - 1];
  const boxes = run.checkpoints.map((step) => h("label", {}, h("input", { type: "checkbox", class: "ckpt", value: step, checked: step === latest }), String(step)));
  const swap = h("input", { type: "checkbox", name: "prompt_swap", checked: true });
  const start = h("button", { class: "button secondary", id: "start-eval", type: "button", disabled: !run.view || !run.checkpoints.length }, "评估");
  start.addEventListener("click", () => {
    const checkpoints = boxes.map((l) => l.querySelector("input")!).filter((b) => b.checked).map((b) => Number(b.value));
    void confirmJob(ctx, {
      title: "按任务开环评估", kind: "eval",
      params: { config_name: run.config, exp: run.exp, view: run.view, gpu: Number(gpu.value), checkpoints, prompt_swap: swap.checked },
      lines: [`${run.name}`, `checkpoint ${checkpoints.join(", ") || "最新"}`, `GPU ${gpu.value}`, `留出集来自 ${run.view}`,
        swap.checked ? "含 prompt 交换测试" : "不做 prompt 交换"],
    });
  });
  return h("div", { id: "eval-form" }, h("h3", {}, "评估"),
    h("div", { class: "form" }, h("label", {}, "GPU", gpu), h("div", { class: "wide checks" }, boxes),
      h("label", { class: "check" }, swap, "prompt 交换")),
    h("div", { class: "actions" }, start));
}

function registerForm(run: RunDetail, ctx: Ctx): HTMLElement {
  const status = h("input", { type: "text", name: "status", placeholder: "状态，例如 待真机验证" });
  const method = h("input", { type: "text", name: "method", placeholder: "方法（默认 pi0.5 action-only 微调）" });
  const start = h("button", { class: "button secondary", id: "start-register", type: "button", disabled: !run.record }, "登记");
  start.addEventListener("click", () => {
    void confirmJob(ctx, {
      title: "登记模型", kind: "register",
      params: { config_name: run.config, exp: run.exp, status: status.value.trim() || null, method: method.value.trim() || null },
      lines: [run.name, "写 MODEL_CARD.md + model_card.json，并更新 checkpoints/MODELS.md", "手写的模型卡不会被覆盖"],
    });
  });
  return h("div", { id: "register-form" }, h("h3", {}, "登记"),
    h("div", { class: "form" }, h("label", {}, "状态", status), h("label", {}, "方法", method)), h("div", { class: "actions" }, start));
}

async function renderRun(el: HTMLElement, name: string, gpus: Gpus | null, ctx: Ctx): Promise<void> {
  const [config, exp] = name.split("/");
  let run: RunDetail;
  try {
    run = await api.run(config, exp);
  } catch (error) {
    el.replaceChildren(h("p", { class: "error" }, errorText(error)));
    return;
  }
  const m = run.metrics;
  const progress = run.job?.progress;
  el.replaceChildren(
    h("section", { class: "panel" },
      panelHead(run.name, runState(run), run.job ? (() => {
        const b = h("button", { class: "button ghost", type: "button" }, "打开日志");
        b.addEventListener("click", () => ctx.openDrawer(run.job!.id));
        return b;
      })() : null),
      progress ? h("p", { class: "muted" }, progress.text) : null,
      kv([["训练视图", run.view ?? "–"], ["GPU", run.gpus?.join(",") ?? "–"], ["batch · steps", `${run.batch_size ?? "–"} · ${run.num_train_steps ?? "–"}`],
        ["时间", `${fmtTime(run.started)} → ${fmtTime(run.ended)}`], ["最后 step · loss", `${run.last_step ?? "–"} · ${fmtMae(run.last_loss)}`],
        ["checkpoints", run.checkpoints.join(", ") || "–"]])),
    h("section", { class: "two" },
      panel("loss", lineChart(m.step ?? [], m.loss ?? [], { label: "loss", id: "chart-loss" })),
      panel("grad norm", lineChart(m.step ?? [], m.grad_norm ?? [], { label: "grad_norm", id: "chart-grad" }))),
    h("section", { class: "two" },
      panel("各 checkpoint 按任务评估", evalTable(run.eval), swapTable(run.eval)),
      panel("GPU", gpuList(gpus, run.gpus ?? []), evalForm(run, gpus, ctx), registerForm(run, ctx))));
}

export async function renderTrain(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [{ runs }, options, gpus] = await Promise.all([api.runs(), api.options(), api.gpus().catch(() => null)]);
  const selected = ctx.query.get("run") ?? runs[0]?.name ?? null;
  const list = h("div", { class: "list", id: "run-list" }, runs.map((run) => {
    const item = h("button", { class: `item${run.name === selected ? " selected" : ""}`, type: "button", "data-run": run.name },
      h("strong", {}, run.name, " ", runState(run)),
      h("small", {}, `${fmtTime(run.started)} · step ${run.last_step ?? "–"} · loss ${fmtMae(run.last_loss)}`),
      run.eval_latest ? h("small", {}, Object.entries(run.eval_latest.tasks).map(([t, v]) => `${t} ${fmtMae(v)}`).join(" · ")) : null);
    item.addEventListener("click", () => ctx.navigate("train", { run: run.name }));
    return item;
  }));
  if (!runs.length) list.append(h("p", { class: "muted" }, "还没有训练"));
  const detail = h("div", { class: "stack", id: "run-detail" });
  root.replaceChildren(newRunForm(options, gpus, ctx),
    h("section", { class: "split" }, h("section", { class: "panel" }, h("h2", {}, "训练列表"), list), detail));
  if (selected) await renderRun(detail, selected, gpus, ctx);
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["train", "eval", "register"].includes(job.kind) && job.state === "succeeded") ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
```

- [ ] **Step 4: Run** `npm run test:training` — expected: all pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): train page with curves, evaluation and registration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 服务 (both ends, settings, start/stop, link checks, bridge stats)

**Files:**
- Replace: `web/src/pages/serve.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.serve/settings/saveSettings/linkcheck/gpus`, `confirmJob`, `checksTable`, `gpuList`.
- Produces: DOM `#serve-end`, `#bridge-end`, `#serve-refresh`, `#serve-form` (`select[name=model|checkpoint|task|gpu]`, `input[name=port]`), `#save-settings`, `#settings-message`, `#serve-start`, `#serve-stop`, `#run-linkcheck`, `#linkcheck-latest`, `#linkcheck-history .item`, `#bridge-stats`.

- [ ] **Step 1: Write the failing specs** (append)

```ts
test("serve: both ends, link checks with history and bridge stats", async ({ page }) => {
  await page.goto("/#/serve");
  await expect(page.locator("#serve-end")).toContainText("运行中");
  await expect(page.locator("#serve-end")).toContainText("openpi:dev");
  await expect(page.locator("#bridge-end")).toContainText("空闲");
  await expect(page.locator("#linkcheck-latest")).toContainText("bulk_throughput");
  await expect(page.locator("#linkcheck-latest")).toContainText("FAIL");
  await expect(page.locator("#linkcheck-history .item")).toHaveCount(2);
  await page.locator("#linkcheck-history .item").nth(1).click();
  await expect(page.locator("#linkcheck-latest")).toContainText("7.91 MB/s");
  await expect(page.locator("#bridge-stats")).toContainText("pick up the power adapter and put it in the blue bin");
  await expect(page.locator("#bridge-stats")).toContainText("26012");
});

test("serve: settings are saved with the token and start asks first", async ({ page, request }) => {
  await page.goto("/#/serve");
  const form = page.locator("#serve-form");
  await expect(form.locator('select[name="model"]')).toHaveValue(MODEL);
  await form.locator('select[name="task"]').selectOption("pick_only");
  await form.locator('select[name="gpu"]').selectOption("3");
  await page.locator("#token").fill("wrong-token");
  await page.locator("#token").dispatchEvent("change");
  await page.locator("#save-settings").click();
  await expect(page.locator("#settings-message")).toContainText("wrong or missing token");
  await page.locator("#token").fill(TOKEN);
  await page.locator("#token").dispatchEvent("change");
  await page.locator("#save-settings").click();
  await expect(page.locator("#settings-message")).toContainText("已保存");
  const saved = await (await request.get("/api/serve/settings")).json();
  expect(saved.saved).toMatchObject({ gpu: 3, task: "pick_only" });
  await page.locator("#serve-start").click();
  await expect(page.locator("#confirm-dialog")).toContainText("GPU 3");
  await expect(page.locator("#confirm-dialog")).toContainText("pick up the power adapter");
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake serve done");
  await expect(page.locator("#drawer-job-head")).toContainText("成功");
  await page.waitForTimeout(500); // the page reloads itself when the job ends
  const jobs = await (await request.get("/api/jobs?kind=serve")).json();
  expect(jobs.jobs[0].params).toMatchObject({ action: "start", gpu: 3, task: "pick_only", model: MODEL });
  await page.locator("#serve-stop").click();
  await expect(page.locator("#confirm-dialog")).toContainText("先停桥接");
  await page.locator("#confirm-cancel").click();
  await expect(page.locator("#confirm-dialog")).toHaveCount(0);
});
```

- [ ] **Step 2: Run, see them fail.**

- [ ] **Step 3: Implement `web/src/pages/serve.ts`**

```ts
import { api, type Gpus, type LinkcheckPayload, type LinkRun, type ServeStatus, type Settings, type SettingsPayload } from "../api";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { errorText, fmtTime, h } from "../dom";
import { checksTable, chip, kv, panel, panelHead } from "../widgets";

function serveEnd(status: ServeStatus): HTMLElement {
  const serve = status.serve || {};
  const record = status.record || {};
  const gpu = status.gpu || {};
  const el = panel("server5090 · openpi-serve",
    status.error ? h("p", { class: "notice" }, status.error) : null,
    h("p", { class: "big" }, serve.running ? "运行中" : "已停止"),
    kv([["启动于", fmtTime(serve.started)], ["镜像", `${serve.image ?? "–"} ${serve.image_id ?? ""}`],
      ["模型", record.model ? `${record.model} @ ${record.step}` : "–"], ["端口", record.port ? `:${record.port}` : "–"],
      ["GPU", gpu.used_mib !== undefined ? `GPU ${gpu.index}: ${gpu.used_mib} / ${gpu.total_mib} MiB` : `GPU ${gpu.index ?? "–"}`],
      ["状态时间", fmtTime(status.at)]]));
  el.id = "serve-end";
  return el;
}

function bridgeEnd(status: ServeStatus): HTMLElement {
  const bridge = status.bridge || {};
  const mode = status.bt_mode;
  const state = bridge.error ? "不可达" : !bridge.running ? "已停止" : Number(bridge.allow_publish) ? "发布中" : "空闲（未激活）";
  const el = panel("realman_ts · policy_bridge",
    bridge.error ? h("p", { class: "notice" }, bridge.error) : null,
    h("p", { class: "big" }, state),
    kv([["启动于", fmtTime(bridge.started)], ["镜像", bridge.image ?? "–"], ["服务地址", bridge.server ? "已设置" : "–"],
      ["行为树模式", mode ? mode.active_mode ?? "–" : "没有 input_mode_state（行为树未运行？）"]]),
    h("p", { class: "muted" }, "平台只启停桥接，不激活；机械臂运动仍由行为树和 /policy/activate 决定。"));
  el.id = "bridge-end";
  return el;
}

function bridgeStats(status: ServeStatus): HTMLElement {
  const bridge = status.bridge || {};
  const record = status.record || {};
  const el = panel("桥接统计",
    kv([["prompt", bridge.prompt ?? "–"], ["paused", bridge.paused ?? "–"], ["allow_publish", bridge.allow_publish ?? "–"],
      ["mode_active", bridge.mode_active ?? "–"], ["服务任务", record.task ?? "–"],
      ["预热耗时", (record.warmup_ms ?? []).map((ms: number) => `${Math.round(ms)} ms`).join(" · ") || "–"]]));
  el.id = "bridge-stats";
  return el;
}

function settingsForm(payload: SettingsPayload, gpus: Gpus | null, prefill: string | null, ctx: Ctx): HTMLElement {
  const effective: Settings = { ...payload.effective };
  if (prefill && prefill !== effective.model) Object.assign(effective, { model: prefill, checkpoint: "", task: null });
  const names = payload.models.map((m) => m.name);
  if (!names.includes(effective.model)) names.unshift(effective.model);
  const model = h("select", { name: "model" }, names.map((n) => h("option", { value: n, selected: n === effective.model }, n)));
  const checkpoint = h("select", { name: "checkpoint" });
  const task = h("select", { name: "task" });
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpu = h("select", { name: "gpu" }, indices.map((i) => {
    const info = gpus?.gpus.find((g) => g.index === i);
    const who = info?.users.map((u) => u.who).join(", ");
    return h("option", { value: i, selected: i === effective.gpu }, `GPU ${i}${who ? ` · ${who}` : ""}`);
  }));
  const port = h("input", { type: "number", name: "port", min: 1, max: 65535, value: effective.port });
  const message = h("p", { class: "muted", id: "settings-message" });
  function fillModel(keep: boolean): void {
    const info = payload.models.find((m) => m.name === model.value);
    checkpoint.replaceChildren(h("option", { value: "" }, "最新"),
      ...(info?.checkpoints ?? []).map((s) => h("option", { value: s, selected: keep && String(s) === String(effective.checkpoint) }, String(s))));
    const prompts = info?.prompts ?? {};
    task.replaceChildren(...Object.entries(prompts).map(([t, p]) =>
      h("option", { value: t, selected: keep && t === effective.task }, `${t} · ${p}`)));
  }
  fillModel(true);
  model.addEventListener("change", () => fillModel(false));
  const values = (): Settings => ({ model: model.value, checkpoint: checkpoint.value, gpu: Number(gpu.value),
    port: Number(port.value), task: task.value || null });
  const promptOf = (s: Settings) => payload.models.find((m) => m.name === s.model)?.prompts[s.task ?? ""] ?? "（模型的第一个任务）";
  const save = h("button", { class: "button secondary", id: "save-settings", type: "button" }, "保存设置");
  save.addEventListener("click", async () => {
    try {
      await api.saveSettings(values());
      message.textContent = `已保存 · ${fmtTime(new Date().toISOString())}`;
      message.className = "muted";
    } catch (error) {
      message.textContent = errorText(error);
      message.className = "error";
    }
  });
  const start = h("button", { class: "button primary", id: "serve-start", type: "button" }, "启动");
  start.addEventListener("click", () => {
    const s = values();
    void confirmJob(ctx, {
      title: "启动推理链路", kind: "serve", params: { action: "start", ...s, checkpoint: s.checkpoint ? Number(s.checkpoint) : null },
      lines: [`模型 ${s.model} @ ${s.checkpoint || "最新"}`, `GPU ${s.gpu} · 端口 ${s.port}`, `prompt：${promptOf(s)}`,
        "启动 openpi-serve → 预热 → 在 realman_ts 重建 policy_bridge（不激活）→ 链路检测",
        "行为树在 policy 模式、GPU 被他人占用或端口与机器人配置不符时会被拒绝"],
    });
  });
  const stop = h("button", { class: "button danger", id: "serve-stop", type: "button" }, "关闭");
  stop.addEventListener("click", () => void confirmJob(ctx, {
    title: "关闭推理链路", kind: "serve", params: { action: "stop" }, danger: true, confirmLabel: "确认关闭",
    lines: ["先停桥接，再停 openpi-serve", "行为树在 policy 模式时会拒绝；平台从不切换行为树模式"],
  }));
  const check = h("button", { class: "button secondary", id: "run-linkcheck", type: "button" }, "链路检测");
  check.addEventListener("click", () => void confirmJob(ctx, {
    title: "数据链路检测", kind: "linkcheck", params: {},
    lines: ["Pika 节点与 Wi-Fi 负载", "realman_ts → server5090 吞吐与 ping", "桥接镜像里的端到端推理（真实尺寸）", "桥接 /policy/stats"],
  }));
  return panel("设置",
    h("div", { class: "form", id: "serve-form" }, h("label", { class: "wide" }, "模型", model), h("label", {}, "checkpoint", checkpoint),
      h("label", { class: "wide" }, "任务 · prompt", task), h("label", {}, "GPU", gpu), h("label", {}, "端口", port)),
    h("p", { class: "muted" }, "prompt 只能从模型的任务里选；保存的设置存在平台状态目录，不改仓库配置。"),
    message, h("div", { class: "actions" }, save, start, stop, check));
}

function linkcheckPanel(link: LinkcheckPayload): HTMLElement {
  const latest = h("div", { id: "linkcheck-latest" });
  const show = (run: LinkRun | null) => latest.replaceChildren(run
    ? h("div", {}, h("p", { class: "muted" }, `${fmtTime(run.at)} · `, chip(run.ok ? "全部通过" : "未通过", run.ok ? "ok" : "bad")),
      checksTable(run.checks))
    : h("p", { class: "muted" }, "还没有链路检测"));
  show(link.latest);
  const history = h("div", { class: "list", id: "linkcheck-history" }, link.history.map((run) => {
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, fmtTime(run.at), " ", chip(run.ok ? "通过" : "未通过", run.ok ? "ok" : "bad")),
      h("small", {}, run.checks.filter((c) => !c.ok).map((c) => c.name).join(", ") || "全部通过"));
    item.addEventListener("click", () => show(run));
    return item;
  }));
  return h("section", { class: "two" }, panel("链路检测", latest), panel("历史", history));
}

export async function renderServe(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [status, settings, link, gpus] = await Promise.all([api.serve(), api.settings(), api.linkcheck(), api.gpus().catch(() => null)]);
  const refresh = h("button", { class: "button ghost", id: "serve-refresh", type: "button" }, "刷新状态");
  refresh.addEventListener("click", async () => {
    refresh.disabled = true;
    try {
      await api.serve(true);
    } finally {
      ctx.reload();
    }
  });
  root.replaceChildren(
    h("section", { class: "panel" }, panelHead("推理链路", refresh),
      h("p", { class: "muted" }, "server5090 的 openpi-serve 和 realman_ts 的 policy_bridge；不碰 bringup 和行为树。")),
    h("section", { class: "two" }, serveEnd(status), bridgeEnd(status)),
    h("section", { class: "two" }, settingsForm(settings, gpus, ctx.query.get("model"), ctx), bridgeStats(status)),
    linkcheckPanel(link));
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["serve", "linkcheck"].includes(job.kind)) ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
```

Note: the start dialog in the spec does not ask for the token because the spec typed it into the top bar first.

- [ ] **Step 4: Run** `npm run test:training` — expected: all pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): serve page with both ends, settings, start/stop and link checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 模型 (registry, card, deploy)

**Files:**
- Replace: `web/src/pages/models.ts`
- Modify: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: `api.models`, `api.run` (card markdown), widgets.
- Produces: DOM `#model-table tr[data-model]`, `#model-card`, `#model-card-markdown`, `#deploy`, `#registry-markdown`; navigation to `#/serve?model=<name>`.

- [ ] **Step 1: Write the failing spec** (append)

```ts
test("models: registry, card and deploy to the serve page", async ({ page }) => {
  await page.goto("/#/models");
  const row = page.locator(`#model-table tr[data-model="${MODEL}"]`);
  await expect(row).toContainText("服务中");
  await expect(row).toContainText("0.096");
  await row.click();
  await expect(page.locator("#model-card")).toContainText("pi0.5 action-only fine-tune");
  await expect(page.locator("#model-card")).toContainText("pick up the power adapter");
  await expect(page.locator("#model-card-markdown")).toContainText("generated by realman-train register");
  await expect(page.locator("#registry-markdown")).toContainText("模型登记表");
  await page.locator("#deploy").click();
  await expect(page).toHaveURL(/#\/serve\?model=/);
  await expect(page.locator('#serve-form select[name="model"]')).toHaveValue(MODEL);
});
```

- [ ] **Step 2: Run, see it fail.**

- [ ] **Step 3: Implement `web/src/pages/models.ts`**

```ts
import { api, type ModelRow } from "../api";
import type { Ctx } from "../ctx";
import { errorText, fmtMae, fmtTime, h } from "../dom";
import { chip, kv, panel, panelHead, table } from "../widgets";

function maeText(model: ModelRow): string {
  if (!model.open_loop) return "未评估";
  return Object.entries(model.open_loop.tasks).map(([task, mae]) => `${task} ${fmtMae(mae)}`).join(" · ");
}

async function renderCard(el: HTMLElement, model: ModelRow, ctx: Ctx): Promise<void> {
  const deploy = h("button", { class: "button primary", id: "deploy", type: "button" }, "部署到推理服务");
  deploy.addEventListener("click", () => ctx.navigate("serve", { model: model.name }));
  const tasks = Object.entries(model.tasks);
  const loop = model.open_loop;
  const markdown = h("pre", { class: "card", id: "model-card-markdown" }, "加载中…");
  el.replaceChildren(h("section", { class: "panel", id: "model-card" },
    panelHead(model.name, model.serving ? chip("服务中", "ok") : null, deploy),
    kv([["方法", model.method ?? "–"], ["训练时间", `${fmtTime(model.trained_start)} → ${fmtTime(model.trained_end)}`],
      ["数据集", model.dataset ?? model.dataset_dir ?? "–"], ["条数", model.episodes ?? "–"],
      ["留出集", model.holdout_episodes.join(", ") || "–"], ["checkpoints", model.checkpoints.join(", ") || "–"],
      ["状态", model.status ?? "–"]]),
    h("h3", {}, "任务与 prompt"),
    table(["任务", "prompt", "条数"], tasks.map(([task, info]) => [task, info.prompt ?? "–", info.episodes ?? "–"])),
    loop ? h("h3", {}, `开环评估（checkpoint ${loop.step}）`) : null,
    loop ? table(["任务", "MAE", "零动作基线"], Object.keys(loop.tasks).map((t) => [t, fmtMae(loop.tasks[t]), fmtMae(loop.zero_baseline[t])]),
      { numeric: [1, 2] }) : null,
    h("h3", {}, "MODEL_CARD.md"), markdown));
  try {
    const run = await api.run(model.config, model.exp);
    markdown.textContent = run.card_markdown ?? "没有 MODEL_CARD.md";
  } catch (error) {
    markdown.textContent = errorText(error);
  }
}

export async function renderModels(root: HTMLElement, ctx: Ctx): Promise<void> {
  const { models, registry_markdown } = await api.models();
  const selected = models.find((m) => m.name === ctx.query.get("model")) ?? models[0] ?? null;
  const card = h("div", { class: "stack" });
  const body = h("tbody", {}, models.map((model) => {
    const tr = h("tr", { class: `clickable${model === selected ? " selected" : ""}`, "data-model": model.name },
      h("td", {}, model.name, " ", model.serving ? chip("服务中", "ok") : null), h("td", {}, model.method ?? "–"),
      h("td", {}, `${fmtTime(model.trained_start)} → ${fmtTime(model.trained_end)}`), h("td", {}, model.dataset ?? "–"),
      h("td", {}, maeText(model)), h("td", {}, model.status ?? "–"));
    tr.addEventListener("click", () => {
      for (const row of body.querySelectorAll("tr")) row.classList.toggle("selected", row === tr);
      void renderCard(card, model, ctx);
    });
    return tr;
  }));
  root.replaceChildren(
    panel("模型登记表",
      models.length ? h("div", { class: "table-wrap" }, h("table", { id: "model-table" },
        h("thead", {}, h("tr", {}, ["run", "方法", "训练时间", "数据集", "开环 MAE", "状态"].map((t) => h("th", {}, t)))), body))
        : h("p", { class: "muted" }, "还没有登记的模型（训练页的“登记”会写模型卡）"),
      registry_markdown ? h("details", {}, h("summary", {}, "checkpoints/MODELS.md"),
        h("pre", { class: "card", id: "registry-markdown" }, registry_markdown)) : null),
    card);
  if (selected) await renderCard(card, selected, ctx);
}
```

`#registry-markdown` sits inside a closed `<details>`; Playwright's `toContainText` reads hidden text, so the spec passes without opening it.

- [ ] **Step 4: Run** `npm run test:training` — expected: all pass (the deploy assertion uses the serve form from Task 6).

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add src/training/realman_training/web src/training/realman_training/realman_training/static website/tests/training-console
git commit -m "feat(training): models page with registry, card and deploy link

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Docs page, route test and CI

**Files:**
- Create: `website/docs/development/training-console-web.md`
- Modify: `config/website/vitepress.config.mts`, `website/tests/site.spec.ts`, `website/docs/development/training-console.md`, `.github/workflows/ci.yml`

- [ ] **Step 1: Write `website/docs/development/training-console-web.md`**

````markdown
---
title: 训练控制平台（网页）
description: server5090:8780 上的训练控制平台网页：数据集与质检、清洗与训练视图、训练与评估、模型登记、推理链路启停与链路检测，写操作需要令牌。
---

# 训练控制平台（网页）

`realman_training` 包（[命令行](./training-console.md)）的网页界面，运行在 server5090 的容器 `realman_training` 里，端口 8780，风格沿用机器人 :8765 控制台。网页和命令行调用同一套步骤函数，所有步骤都作为后台任务运行，任务日志在顶栏“任务”打开的底部抽屉里实时显示。

## 页面

| 页 | 内容 |
|---|---|
| 总览 | 推理服务、数据链路、GPU 0–3（显存和占用者）、当前训练进度四张状态卡；最近数据集、最新模型、最近任务 |
| 服务 | server5090 `openpi-serve` 和 realman_ts `policy_bridge` 两端状态；设置（模型、checkpoint、任务 prompt、GPU、端口）；启动 / 关闭；链路检测四项结果和历史；桥接统计 |
| 数据 | 数据集列表；条数、帧数 / 时长、时间范围、格式 / fps、磁盘 / 编码；任务分布；特征与相机；逐条质检表（含夹爪轨迹缩略图，建议剔除已预勾选）；“生成清洗版”“生成训练视图” |
| 训练 | 新建训练；训练列表；loss / grad norm 曲线；GPU；各 checkpoint 按任务的开环评估和 prompt 交换结果；“评估”“登记” |
| 模型 | 登记表、模型卡、`MODELS.md`；“部署到推理服务”跳到服务页并填好模型 |

数据集概况和质检结果缓存在各数据集目录下的 `.console/summary.json`，数据文件或质检阈值变化才重算；第一次打开数据页要等每个数据集算一遍。

## 安全规则

- 所有写操作需要令牌：服务器端 `REALMAN_TRAINING_TOKEN`（仓库根 `.env`），网页顶栏输入，只存在浏览器本页会话里；没有设置令牌时平台是只读的。
- 每个启动任务的按钮都先弹出确认框，列出会发生什么。同一类任务同一时间只能有一个；训练前检查所选 GPU，有他人进程就拒绝。
- 不提供删除；清洗版、训练视图写新目录，目标已存在就拒绝。
- 关闭或启动推理链路前检查行为树模式，`policy` 时拒绝；平台只启停桥接，不激活，机械臂运动仍由行为树和 `/policy/activate` 决定。
- 平台不调用 `./rm65`，不碰 bringup、web_control、录制容器和行为树。

## 部署（server5090）

容器定义在 `config/docker/compose.yaml` 的 `realman_training` 服务（profile `training`，机器人侧任何命令都不会构建或启动它），镜像 `config/docker/training-console.Dockerfile`，配置 `config/training/training_console.yaml` 的 `web` 段。平台要把主机路径交给主机的 docker（openpi 容器）和 ssh（`realman_local`），所以这些路径在容器里挂载到同样的绝对路径，容器以主机用户身份运行。

在 server5090 的部署工作区里，`.env` 写入：

```bash
REALMAN_TRAINING_TOKEN=<随机令牌>
TRAINING_HOME=/home/<用户>
TRAINING_REPO=<部署工作区的绝对路径>
TRAINING_DOCKER_GID=<getent group docker 的 gid>
```

然后：

```bash
docker compose --profile training build realman_training
docker compose --profile training up -d realman_training
docker compose --profile training logs --tail=50 realman_training
```

浏览器打开 `http://server5090:8780`（或 `ssh -N -L 8780:127.0.0.1:8780 server5090` 后打开 `http://127.0.0.1:8780`）。重启容器会中断它启动的任务：任务被标记为“中断”；训练容器本身不受影响，用命令行 `realman-train train ... --attach` 接管。

## 开发

```bash
cd website
npm ci
python ../src/training/realman_training/test/web_fake.py --port 4180   # 真实后端 + 测试数据 + 假步骤，令牌 e2e-token
npm run dev:training                                                   # http://127.0.0.1:4176，/api 代理到 :4180
npm run build:training                                                 # 打包到 realman_training/static（提交到仓库）
npm run test:training                                                  # Playwright：桌面全流程 + 手机布局
```

后端测试：`cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test`（`test_web_server.py`、`test_job_params.py`、`test_catalog.py`、`test_summary_cache.py`、`test_gpus.py`、`test_container.py`）。接口约定见实现计划 `docs/superpowers/plans/2026-10-21-training-console-4-web-api-container.md`。
````

- [ ] **Step 2: Sidebar, route test, cross-link**

In `config/website/vitepress.config.mts`, after the 命令行 entry:

```ts
          { text: "训练控制平台（命令行）", link: "/development/training-console" },
          { text: "训练控制平台（网页）", link: "/development/training-console-web" },
```

In `website/tests/site.spec.ts`, after `"development/training-console",`:

```ts
    "development/training-console-web",
```

At the top of `website/docs/development/training-console.md`, after the first paragraph:

```markdown
网页界面（server5090:8780）见 [训练控制平台（网页）](./training-console-web.md)。
```

- [ ] **Step 3: CI job** — append to `.github/workflows/ci.yml` under `jobs:`

```yaml

  training-console:
    name: Training console e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.10"
      - name: Backend dependencies
        run: python -m pip install aiohttp numpy pyarrow pyyaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: website/package-lock.json
      - run: npm ci
        working-directory: website
      - name: Playwright (builds the bundle, starts web_fake.py)
        run: npm run test:training
        working-directory: website
        env:
          REALMAN_TRAINING_PYTHON: python
      - name: The committed bundle matches the sources
        run: git diff --exit-code -- src/training/realman_training/realman_training/static
```

- [ ] **Step 4: Run the site build, the site e2e (routes) and the console e2e locally**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/website
npm run build
node ../.agents/skills/realman-site-design-system/scripts/check-site-style.mjs
npx playwright test --config ../config/website/playwright.config.mjs site.spec.ts
npm run test:training
git status --short ../src/training/realman_training/realman_training/static
```

Expected: build OK, style gate OK, site specs pass, console specs pass, and the bundle has no uncommitted change.

- [ ] **Step 5: Commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git add website/docs/development/training-console-web.md website/docs/development/training-console.md \
  config/website/vitepress.config.mts website/tests/site.spec.ts .github/workflows/ci.yml
git commit -m "docs(training): web console page, route test and CI e2e job

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: PR

Controller-only (not a subagent task).

- [ ] **Step 1:** If PR #54 has merged, `git fetch origin && git rebase origin/main`, rerun the pytest suite and `npm run test:training`.
- [ ] **Step 2:** Check every trailer: `git log --format='%h %(trailers:key=Co-Authored-By,valueonly)' origin/main..HEAD` → only `Claude Opus 5.5 <noreply@anthropic.com>`.
- [ ] **Step 3:** `git push -u origin feat/training-console-web` and `gh pr create --base main` (base `feat/training-console-serving` while #54 is open) with a body that lists Plans 4-5, the API, the safety rules, the tests run and what is not verified yet (deployment), ending with the Claude Code attribution line. Bind it with the ccd_pr tools and read CI.

---

### Task 10: Deploy on server5090 and walk the real data read-only

Controller-only, and **only after the user's explicit OK** for deploying the container. Nothing here starts/stops openpi-serve or the bridge, or trains.

- [ ] **Step 1: Ship the branch** (server5090 cannot fetch from GitHub)

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git bundle create "$SCRATCH/console.bundle" feat/training-console-web
scp "$SCRATCH/console.bundle" server5090:/tmp/console.bundle
ssh server5090 'cd ~/organization/realman_pi && git fetch /tmp/console.bundle feat/training-console-web:deploy/training-console-20261021 \
  && git worktree add ~/organization/realman_pi-console deploy/training-console-20261021 && rm /tmp/console.bundle'
```

A separate worktree, because the existing checkout `~/organization/realman_pi` may be mounted by other containers on that host (`docker ps` showed `bt-test-*` and `bt-tutorial-run`): never switch its branch.

- [ ] **Step 2: `.env` in the worktree** (token generated on the host, never printed)

```bash
ssh server5090 'cd ~/organization/realman_pi-console && umask 077 && {
  echo "REALMAN_TRAINING_TOKEN=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))")"
  echo "TRAINING_HOME=$HOME"; echo "TRAINING_REPO=$PWD"; echo "TRAINING_UID=$(id -u)"; echo "TRAINING_GID=$(id -g)"
  echo "TRAINING_DOCKER_GID=$(getent group docker | cut -d: -f3)"; } > .env && grep -c . .env'
```

Expected: `6`. Tell the user where the token is (`grep REALMAN_TRAINING_TOKEN ~/organization/realman_pi-console/.env` on server5090), not its value.

- [ ] **Step 3: Build and start** (`-p realman-training` keeps the project apart from anything named after the folder)

```bash
ssh server5090 'cd ~/organization/realman_pi-console && docker compose -p realman-training --profile training config realman_training >/dev/null && echo config-ok'
ssh server5090 'cd ~/organization/realman_pi-console && docker compose -p realman-training --profile training build realman_training 2>&1 | tail -20'
ssh server5090 'cd ~/organization/realman_pi-console && docker compose -p realman-training --profile training up -d realman_training && sleep 8 && docker compose -p realman-training logs --tail=20 realman_training'
```

Expected: `config-ok`; the build pulls `python:3.12-slim` through the registry mirror (if pip or apt stalls, set `TRAINING_PIP_INDEX_URL` / `TRAINING_APT_MIRROR` in `.env` to a domestic mirror and rebuild); the log line `training console on http://0.0.0.0:8780 · data /home/.../data/realman · writes need the X-Training-Token header`.

- [ ] **Step 4: Checks inside the container**

```bash
ssh server5090 'docker exec realman-training-realman_training-1 sh -lc "id; echo \$HOME; docker ps --format {{.Names}} | head -3; nvidia-smi -L | head -2; ssh -o BatchMode=yes -o ConnectTimeout=10 realman_local true && echo ssh-ok; git -C ~/organization/openpi rev-parse --short HEAD"'
ssh server5090 'curl -s localhost:8780/api/health; echo; curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:8780/api/jobs -H "Content-Type: application/json" -d "{}"'
```

Expected: uid 1000 with the host HOME, docker works, GPUs listed, `ssh-ok`, the openpi commit; health `read_only: false`; the unauthenticated POST answers `401`.

- [ ] **Step 5: Real data through the API** (first call computes every summary; give it minutes)

```bash
ssh server5090 'time curl -s localhost:8780/api/datasets | python3 -c "import json,sys; d=json.load(sys.stdin); [print(r[\"path\"], r[\"kind\"], r.get(\"episodes\"), r.get(\"quality_counts\")) for r in d[\"datasets\"]]"'
ssh server5090 'curl -s "localhost:8780/api/dataset?path=raw_realman_ts_20261016/realman__pi05-three-arm" | python3 -c "import json,sys; print(json.load(sys.stdin)[\"suggested_drops\"])"'
ssh server5090 'curl -s localhost:8780/api/gpus | python3 -m json.tool | head -40; curl -s localhost:8780/api/runs | python3 -c "import json,sys; [print(r[\"name\"], r[\"checkpoints\"], r[\"last_loss\"]) for r in json.load(sys.stdin)[\"runs\"]]"'
```

Expected: the same datasets as `realman-train list` (Plan 2 dry pass); the 10-16 raw set suggests exactly `[13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216]` (the spec's acceptance set); GPUs 0-3 with holders; both registered runs.

- [ ] **Step 6: Walk the pages read-only in the browser pane**

```bash
ssh -N -L 8780:127.0.0.1:8780 server5090    # run in the background
```

Open http://127.0.0.1:8780 in the built-in browser, no token entered, and visit 总览, 服务 (status only — press nothing that starts a job), 数据 (the 10-16 raw set: 13 pre-checked rows), 训练 (`m_multitask_b16_2gpu` curves and eval), 模型 (card). Take one screenshot per page; check `read_console_messages` for errors and the phone width (`resize_window` mobile) for sideways scroll. Stop the tunnel afterwards.

- [ ] **Step 7: Notes**

Write the deployment facts (worktree path, branch, image id, how to restart, rollback = `docker compose -p realman-training down` + `git worktree remove`) to the shared notes folder and update the `training-console-project` memory.
