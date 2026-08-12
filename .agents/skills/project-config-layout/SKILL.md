---
name: project-config-layout
description: Enforce a project configuration layout in which configuration sources live under the project-root config/ directory and contain clear explanatory comments. Use when creating, editing, moving, reviewing, or documenting application, service, build, deployment, container, ROS, CI, lint, formatting, test, or tooling configuration files.
---

# Project Config Layout

Keep project configuration centralized, discoverable, and understandable without requiring readers to reverse-engineer values.

## Apply The Layout

1. Determine the project root from the repository root or the nearest authoritative workspace manifest.
2. Create `<project-root>/config/` when configuration is needed.
3. Place configuration source files under `config/`, grouped by tool or subsystem only when grouping improves navigation.
4. Update all consumers, scripts, documentation, build files, and deployment workflows to reference the new paths.
5. Remove obsolete duplicate configuration after verifying that no consumer references it.
6. Run the relevant parser, formatter, build, test, or dry-run command to validate both syntax and path resolution.

Use predictable names such as:

```text
config/
├── docker/
│   └── compose.yaml
├── ros/
│   └── rviz.yaml
├── test/
│   └── playwright.config.ts
└── website/
    └── vitepress.config.mts
```

Do not scatter configuration across source packages, feature directories, or the repository root merely because a tool defaults to those locations.

## Write Useful Comments

Add comments that explain:

- why a non-obvious value or override is required;
- valid values, units, limits, and environment assumptions;
- security or compatibility implications;
- relationships with other configuration files or runtime variables;
- behavior that differs from the tool default.

Keep comments adjacent to the setting they explain. Prefer short intent-focused comments over restating the key name. Update comments whenever behavior changes, and remove stale or speculative comments.

Example:

```yaml
# Isolate the standalone RViz viewer from ROS graphs on the default domain.
ROS_DOMAIN_ID: ${ROS_DOMAIN_ID:-65}
```

Avoid comments like:

```yaml
# Set ROS_DOMAIN_ID.
ROS_DOMAIN_ID: 65
```

## Handle Format Constraints

Prefer a configuration format that supports comments when the tool supports multiple formats, such as YAML, TOML, JavaScript, or TypeScript.

When a required format does not support comments, such as strict JSON:

1. Do not add invalid pseudo-comments or comment-only keys that change the schema.
2. Put the explanation in the nearest supported configuration source under `config/`, or in `config/README.md` only when no machine-readable commented format is available.
3. Keep that documentation specific to configuration semantics; do not create general project documentation there.

## Handle Tool-Mandated Paths

Some tools require an entry file at a fixed path, such as `.github/workflows/`, `package.json`, or a root-level discovery filename.

In that case:

1. Keep the mandated entry file at the required location.
2. Make it the smallest valid adapter, loader, or dispatcher the tool permits.
3. Place the substantive configuration under `<project-root>/config/`.
4. Add a clear comment in the entry file explaining the tool constraint and pointing to the authoritative config file.
5. If the tool cannot delegate or load external configuration, treat the mandated file as an explicit exception and comment its purpose and constraint clearly.

Never break tool discovery solely to satisfy directory placement.

## Review Checklist

Before finishing, verify:

- every new or modified substantive configuration source is under root `config/`;
- required fixed-location entry files are minimal and documented;
- comments explain intent, constraints, and non-default values;
- no stale paths or duplicate sources remain;
- configuration syntax and consuming commands pass validation.
