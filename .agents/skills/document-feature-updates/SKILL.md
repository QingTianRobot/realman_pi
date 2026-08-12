---
name: document-feature-updates
description: Keep the realman_pi Web developer manual aligned with completed product behavior. Use whenever adding, changing, or removing a project feature, workflow, public interface, ROS graph, TF contract, configuration field, container behavior, deployment behavior, or operator-facing command; also use when finishing bug fixes that change documented behavior.
---

# Document Feature Updates

Treat developer documentation as part of the feature. Do not report a functional change as complete until its Web manual content is current and verified.

## Update Workflow

1. Inspect `website/docs/development/` and related user documentation before editing code.
2. Select the existing page that owns the behavior. Create a focused feature page only when no clear owner exists.
3. After implementation, update the documentation to describe the resulting behavior, not the sequence of edits.
4. Update affected diagrams, commands, configuration references, navigation, and cross-links.
5. Add the new route to `website/tests/site.spec.ts` when creating a page.
6. Run `npm run build` from `website/`. Run relevant Web tests when navigation, rendering, examples, or generated assets changed.
7. Include the documentation paths and validation result in the final work summary.

## Required Content

For each documented feature, record the applicable items:

- purpose, behavior, boundaries, and developer-facing contract;
- owning source modules and data flow;
- authoritative configuration under repository-root `config/`, including units and constraints;
- ROS namespaces, topics, services, actions, parameters, and TF frames;
- build, launch, deployment, or integration commands;
- validation steps and expected observable results;
- compatibility assumptions, failure modes, and known limitations.

Use clickable relative links between Web manual pages. Keep code paths and identifiers exact. Never publish credentials, host secrets, private addresses, or machine-specific tokens.

## Manual Structure

- Use `website/docs/development/index.md` as the developer manual index and contribution contract.
- Put feature pages in `website/docs/development/` with stable lowercase hyphenated names.
- Update an existing feature page for incremental changes. Avoid date-stamped duplicate pages and changelog-only entries.
- Keep end-user instructions in their existing guide or troubleshooting page, then link to deeper developer details.
- Add developer pages to the VitePress navigation and `开发者手册` sidebar section.

## Completion Gate

Before declaring the task complete, verify:

- implementation and Web documentation describe the same current behavior;
- configuration remains authoritative under root `config/` and has useful comments;
- commands and paths in the manual work from the documented directory;
- diagrams and examples match current namespaces, TF frames, and runtime flow;
- `npm run build` succeeds;
- relevant tests pass, or the final response explicitly identifies what could not be run.

Apply `project-config-layout` alongside this skill whenever configuration is created or changed.
