# Unified Runtime Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a single production-oriented `rm65` entry that starts ROS 2 cameras and the headless three-arm runtime together, with opt-in RViz and compatibility wrappers.

**Architecture:** A thin root dispatcher delegates camera lifecycle to existing Zsh helpers and robot lifecycle to Docker Compose. A PID/state file under the existing logs root lets unified commands stop and inspect the host camera process without moving authoritative configuration out of `config/`.

**Tech Stack:** Bash, Zsh, Docker Compose, ROS 2 Humble, VitePress, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-11-unified-runtime-entry-design.md`

## Global Constraints

- Default runtime uses ROS 2 color camera topics from `config/ros/camera_calibration.yaml`.
- Default runtime does not start RViz.
- Camera and Docker processes must preserve timestamped ROS logs under `logs/YYYYMMDD_HHMMSS/`.
- Existing `functions.zsh` and standalone Compose services remain compatible.
- Production sync must refuse non-main or dirty worktrees.

### Task 1: Add unified dispatcher and lifecycle state

**Files:**
- Create: `rm65`
- Create: `tests/test_rm65_entry.sh`

- [ ] Write shell tests for command dispatch, default `up`, desktop/model options, and invalid commands.
- [ ] Run the focused shell test and verify it fails because `rm65` is missing.
- [ ] Implement `rm65` with strict mode, repository-root discovery, subcommands (`up`, `down`, `status`, `logs`, `camera`, `sync`), and a state file under `${REALMAN_LOG_ROOT:-$root/logs}/.rm65-camera.pid`.
- [ ] Ensure `up` starts `rm65_camera_ros2 color` first, then `docker compose up -d realman_bringup_remote`; on failure, stop the camera process.
- [ ] Ensure `desktop` adds `realman_remote_rviz`, and `model` runs `rm65_three_rviz`.
- [ ] Run shell tests and `bash -n rm65`.

### Task 2: Align Compose defaults with production headless startup

**Files:**
- Modify: `config/docker/compose.yaml`
- Modify: `.env`

- [ ] Add a clearly commented unified production service contract and ensure `realman_bringup_remote` defaults to real drivers, headless operation, and restart unless stopped.
- [ ] Keep RViz disabled in the remote service and preserve host log/config mounts.
- [ ] Render `docker compose config` and inspect the resulting command/environment.

### Task 3: Update helper compatibility and operator documentation

**Files:**
- Modify: `functions.zsh`
- Modify: `website/docs/development/startup-entries.md`
- Modify: `website/docs/development/system-bringup.md`
- Modify: `website/docs/guide/getting-started.md`
- Modify: `website/tests/startup-entries.spec.ts`

- [ ] Add a short compatibility helper that points operators to `./rm65` while leaving existing functions callable.
- [ ] Document the unified commands, camera ownership, default no-RViz behavior, and sync workflow.
- [ ] Update tests that assert the public startup index and helper output.
- [ ] Run focused website tests.

### Task 4: Verify and review

- [ ] Run `git diff --check` and `bash -n rm65`.
- [ ] Run `docker compose config`.
- [ ] Run relevant Python/ROS tests that do not require hardware.
- [ ] Run `npm run build` in `website/` and the startup-entry Playwright test if dependencies are available.
- [ ] Review the final diff for stale commands, secrets, and documentation drift.
