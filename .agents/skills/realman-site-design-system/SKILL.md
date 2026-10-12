---
name: realman-site-design-system
description: Use when creating, restyling, or reviewing any page, component, or CSS of the realman_pi GitHub Pages site (VitePress, website/docs), or when a page looks different from the rest of the site — colors, fonts, spacing, dark mode, breakpoints, motion, Mermaid styling.
---

# RM65 Site Design System

The published site has one look. Reproduce it exactly; never restyle per page.

**Source of truth:** `website/docs/.vitepress/theme/custom.css`. `tokens.json` (this skill) is a machine-checked mirror. Change tokens only on explicit user request, and edit both files in the same change.

## Gate (mandatory before calling any site work done)

```bash
cd website && node ../.agents/skills/realman-site-design-system/scripts/check-site-style.mjs
```

It fails on token drift, unregistered breakpoints, literal colors outside token blocks, `<style>` blocks or inline color/font styles in pages, classes not defined in `custom.css`, and changes to `lang`/`base`/`cleanUrls`/theme-color/Mermaid font in `config/website/vitepress.config.mts`.

## Look & feel

| Aspect | Rule |
| --- | --- |
| Palette | Teal brand (`--vp-c-brand-1` #116a75 light / #5fb8be dark), one warm accent `--rm-accent` #c85e35 for index numbers and the root TF node only. Neutral greenish greys for surfaces. |
| Color use | Always `var(--vp-c-*)` / `var(--rm-*)`. No hex in pages. Dark mode comes free from tokens, so add no per-page dark rules. |
| Type | Base `--vp-font-family-base` (Inter stack). Mono `--vp-font-family-mono` for kickers, values, identifiers, node chips. `letter-spacing: 0` globally. |
| Shape | Radius 4px (buttons, nodes, callouts), 6px (cards, mermaid buttons), 8px (mermaid frame, joint panel). Hairline 1px `--vp-c-divider` borders; no shadows, no gradients. |
| Layout | Content width `min(1180px, calc(100% - 48px))`; section padding 92px (64px phone). Alternate sections `rm-section` / `rm-section alt`. |
| Breakpoints | Only `900px` and `640px` (max-width). |
| Motion | `160ms ease` border/background transitions; the 3D auto-rotate and idle joint swing; one-time scroll reveal (`v-reveal`, 320ms ease-out); dashed Mermaid edges flowing along their arrows and the architecture-map flow dashes. No other animation. Honor `prefers-reduced-motion` (reveal and 3D motion check it in JS; transitions are already neutralised globally). |
| Language | UI and prose in Chinese (`zh-CN`); identifiers, paths, topics verbatim. |
| Kicker | Section kickers are short English mono uppercase (`Capabilities`, `Control path`); headings are Chinese sentences. |

## Do not

- Add a CSS framework, icon font, web font, emoji decoration, or new color.
- Style via `style="…"` or page-level `<style>`; add a class to `custom.css` (and the component catalog) instead.
- Rename `rm-*`/`robot-*`/`joint-*`/`signal-*` classes or `data-*` attributes: Playwright specs select them.

Reusing existing blocks: see `realman-site-components`. Build/deploy: `realman-site-deploy`.
