---
name: realman-site-deploy
description: Use when building, previewing, testing, or publishing the realman_pi GitHub Pages website, changing .github/workflows/deploy-pages.yml or its path triggers, or when the deployed site differs from local or a Pages deploy fails.
---

# RM65 Site Build & Deploy

Pipeline: push to `main` touching a trigger path → `.github/workflows/deploy-pages.yml` → Node 22, `npm ci`, `npm run build` in `website/` → upload `website/docs/.vitepress/dist` → `deploy-pages`. Site URL base: `/realman_pi/`.

## Local verification (same as CI plus gates)

```bash
cd website
npm ci
node ../.agents/skills/realman-site-design-system/scripts/check-site-style.mjs
npm run build          # runs sync-assets first
npm run test:e2e       # Playwright, config/website/playwright.config.mjs
npm run dev            # live preview
```

## Invariants

- Site settings live in `config/website/vitepress.config.mts` (the file under `docs/.vitepress/` only re-exports it). Workflow stays under `.github/workflows/` (GitHub requirement).
- `base: "/realman_pi/"`; internal links in HTML use `withBase()`, Markdown links stay relative.
- 3D models are generated, never committed: `sync-three-robots.mjs` rebuilds `website/docs/.vitepress/cache/public` from `config/ros/three_robots.yaml`, `end_effectors.yaml` and `src/rm65_description`.
- The workflow `paths:` list must include every input the build reads. When the build starts reading a new file, add its path to the trigger list and to this skill.
- Pin tool versions in `website/package.json`; keep Node at 22 in the workflow.

## Failure triage

| Symptom | Check |
| --- | --- |
| Pages 404 for CSS/JS | `base` changed or raw `/path` link used |
| Robot scene stuck on loading | `sync-assets` failed; read its error; `three-robots.json` in dist |
| Deploy not triggered | changed file not under a `paths:` entry |
| Chinese Mermaid labels overflow | Mermaid font stack removed from config |
| Style gate fails | fix the page; do not edit `tokens.json` to silence it |

Page content workflow: `document-feature-updates`. Look and components: `realman-site-design-system`, `realman-site-components`.
