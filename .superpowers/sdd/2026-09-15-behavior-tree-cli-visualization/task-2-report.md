# Task 2 Report: Editor API Support for Opening a Workspace Tree

## Changes

- Added `OpenTreeResult` (`{ xml: string }`) to the editor protocol types.
- Added `openTree(name)` in `src/api/client.ts`, using `GET /api/tree/open?name=<encoded name>`.
- Added a URL-driven startup effect in `App.tsx`:
  - waits for `/api/nodes` manifests;
  - reads `?tree=` once;
  - opens and imports the workspace XML into the canvas;
  - calls `loadTree(xml)` so Tick/Run use the opened tree;
  - routes open/import/load failures through the existing error toast path.
- Added a focused Vitest client test for URL encoding and response parsing.
- Documented the `?tree=` workflow in `website/docs/development/behavior-tree-control.md`.

## Validation

- `npm test -- --run src/api/client.test.ts`: passed (1 test).
- `npm run build`: passed (`tsc --noEmit` and Vite production build).

## Concerns

- The App integration path is covered by the TypeScript build and the client contract test; no React/jsdom integration test was added because the repository has no App test harness and the task requested a focused client test.
- `npm ci` reported existing dependency audit findings (8 vulnerabilities); dependency versions were not changed.
