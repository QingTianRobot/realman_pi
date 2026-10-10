---
name: realman-site-components
description: Use when adding or editing a section of the realman_pi website homepage or any page that needs the site's standard blocks — hero, signal band, section heading, capability cards, pipeline, TF network, final CTA, 3D RobotViewer with joint panel, Mermaid diagram, or doc tables.
---

# RM65 Site Components

Compose pages only from these blocks. Copy the template verbatim, change text/links only. Required skills: **REQUIRED BACKGROUND:** `realman-site-design-system`.

| Block | Template | Where | Locked contract |
| --- | --- | --- | --- |
| Hero + RobotViewer | `templates/hero.md` | home only | `.rm-hero > RobotViewer + .rm-hero-inner > .hero-copy`; one `<h1>`; one `primary` + one plain `rm-action` |
| Signal band | `templates/signal-band.md` | after hero | exactly 3 `.signal-item` (grid is 3 columns) |
| Section + heading | `templates/section.md` | home | kicker + h2 left, one-paragraph lede right; `alt` alternates |
| Capability cards | `templates/capability-grid.md` | in a section | `.model-grid` of `.model-item`; first is `featured`; each ends with one `.section-link` |
| Pipeline | `templates/pipeline.md` | in a section | exactly 4 `.pipeline-step`, index `01`–`04` |
| TF network | `templates/tf-network.md` | in a section | one `.tf-branch` per arm; `arm-l/m/r` colors fixed |
| TF explorer | `templates/tf-explorer.md` | home TF section | `<TfExplorer />` only; data comes from the URDF at runtime; exposes `data-state`, `data-selected-arm`, `data-hovered-frame`, `data-frame-count` |
| Final CTA | `templates/final-cta.md` | last on home | dark band, one `rm-action` |
| Doc page | `templates/doc-page.md` | `docs/**` | frontmatter `title` + `description`; no custom HTML |
| Mermaid | `templates/doc-page.md` | doc pages | ` ```mermaid `; rules below |

## Fixed behaviours (do not reimplement)

- **RobotViewer** (`theme/components/RobotViewer.vue`): reads generated `three-robots.json`; exposes `data-state`, `data-robot-count`, `data-root-frame`, `data-visualization-reference-arm`, `data-mesh-count`, `data-animated`; joint panel (`.joint-panel`, `.joint-arms`, `.joint-row`, `.joint-auto`) collapsed by default at ≤640px. Import it, never fork it. Robot data comes from `config/ros/three_robots.yaml` via `npm run sync-assets`.
- **TfExplorer** (`theme/components/TfExplorer.vue`): tree of frames (`.tf-explorer-tree [data-frame]`) + 3D view; tabs `L/M/R` choose the arm, other arms fade. Hover/focus a node or hover a link mesh to highlight child (accent) / parent (brand) and show the info card. Never fork it.
- **Mermaid zoom** (`theme/mermaid-zoom.ts`): click opens lightbox; `-`/`+`/`0`/`Esc`. Registered in `theme/index.ts`; automatic for every ` ```mermaid ` fence.
- **Tables** span the content column (`table-layout: fixed`); keep cells short, no wide unbroken strings.

## Mermaid rules

One idea per diagram, ≤ ~12 nodes, `flowchart TB`, short labels with `<br/>`, ≤5 sequence participants. Never set per-diagram colors/fonts; the site config pins the CJK font stack.

## Adding a genuinely new block

1. Prefer composing existing blocks. If impossible, add classes to `custom.css` using tokens only, with a ≤640px rule.
2. Add a template file here and a row above.
3. Add a Playwright assertion in `website/tests/site.spec.ts` (no horizontal overflow at desktop + mobile).
4. Run the style gate and `npm run test:e2e`.

Content/IA rules (sidebar, index, reference tables): `document-feature-updates`.
