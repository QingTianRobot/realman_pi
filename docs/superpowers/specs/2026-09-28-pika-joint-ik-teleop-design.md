# Pika Joint-Space IK Teleop Design (self-contained)

## Goal

A **completely independent** package (its own git repo, developed and run directly on 143 + 184 over SSH, no dependency on the existing `realman_pi` repo or its driver/router/mapper) that turns Pika tracker pose + gripper into per-arm joint targets via in-house **velocity-IK (DLS + SVD + adaptive damping + singularity handling)**, and streams them over ROS 2 to a self-contained 184 node that calls `rm_movej_canfd(follow=False)` directly.

## Decisions made (from brainstorming)

- IK core: hand-rolled DLS/SVD (not the SDK's `rm_algo_inverse_kinematics`).
- Send path: continuous joint streaming via `rm_movej_canfd(follow=False)` at 50 Hz.
- **184 side: a self-contained SDK node** in this repo (NOT an extension of `realman_robot_driver`).
- Integration: fully independent — no `pika_control_router` / `control_router.xml` / `realman_msgs` / `realman_robot_driver` / `pika_realman_mapper` dependency.
- Gesture: keep double/triple-click; record start/stop timestamps to a **sidecar JSONL**; no data cleaning for now.

## Scope

**In (new repo, one ROS 2 package `pika_joint_ik`):**

- `ik_core.py` — ROS-free DLS/SVD IK core (unit-testable).
- `joint_ik_node.py` — 143 node: pose + gripper + joint feedback → `q_next`.
- `arm_joint_stream_node.py` — 184 node: `q_next` → `rm_movej_canfd` + publish joint feedback.
- custom messages (`JointTarget`, `JointFeedback`, `SessionEvent`).
- base-frame transform (`pika_base.py`) — the tracker→robot-base transform, self-contained.
- config / launch / test.

**Out / not touched (existing platform is left as-is):**

- `realman_robot_driver`, `realman_msgs`, `pika_control_router`, `control_router.xml`, `pika_realman_mapper`, web control, Cartesian position/velocity path.

**Assumptions (confirm at review):**

1. Both arms `l` and `r`; `m` untouched.
2. The joint path is a parallel alternative to the Cartesian path — the operator runs one at a time.
3. The new package consumes raw `/pika_pose_*` (Vive tracker pose) and does its own base transform, not the mapper's `/pika/{arm}/cartesian_pose`.

## Part A — Joint-space IK teleop

### A1. Data flow

```text
143:  /pika_pose_l|r        (Vive tracker pose, 250 Hz)
      /gripper_l|r/joint_state   (gesture + gripper open)
      /pika/{arm}/joint_feedback (current q, from 184)     ←┐
                       │                                     │
                       ▼                                     │
        joint_ik_node  [base transform + DLS/SVD velocity IK]│
                       │                                     │
        /pika/{arm}/joint_target  (q_next, radians)          │
                       ▼                                     │
184:  arm_joint_stream_node  [own SDK handle → rm_movej_canfd(follow=False)]
                       │                                     │
                       ├──► RM65                              │
                       └─────► /pika/{arm}/joint_feedback ────┘
                                  (SDK get_joint, current q)
```

Both nodes live in the same new repo; they talk over ROS 2 DDS (`ROS_DOMAIN_ID=65`, same as today) using only self-defined topics.

### A2. ROS contract (all messages defined in this repo)

```text
pika_joint_ik/msg/JointTarget   float64[6] joint_degrees   # radians
pika_joint_ik/msg/JointFeedback float64[6] joint_degrees   # radians, current
pika_joint_ik/msg/SessionEvent  string side; uint8 action(0=START,1=STOP); uint64 timestamp_ns; uint8 source(0=GESTURE,1=MANUAL)
```

Topics: `/pika/{arm}/joint_target`, `/pika/{arm}/joint_feedback`, `/pika/{side}/session_event`.

### A3. IK core (`ik_core.py`, ROS-free, unit-testable)

- **FK**: static RM65 MDH table → `T_base→ee(q)`. Parameters hardcoded from the RM65 URDF / SDK `rm_get_DH_data()` (verified at implementation), metres/radians internally.
- **Jacobian**: analytic geometric Jacobian `J(q)` in the base frame; finite-difference kept as a test oracle.
- **DLS via SVD**: `J = U Σ Vᵀ`, `σ_min = min(Σ)`, `q_dot = V·diag(σᵢ/(σᵢ²+λ²))·Uᵀ·v`.
- **Adaptive damping** on `σ_min`: `λ_min` when `σ_min > σ_safe`, ramp between `σ_safe`/`σ_danger`, `λ_max` when `σ_min ≤ σ_danger`.
- **Singularity first layer** (warning/log only): elbow `|q3|`, wrist `|q5|`, shoulder (wrist-centre→J1/J2 plane), boundary.
- **Limits**: clamp `q_next` to joint limits; clamp `q_dot` to per-joint velocity limits.

### A4. IK node (143, `joint_ik_node.py`)

- 50 Hz timer. Resolved-rate loop: read target `T_tgt` from `/pika_pose_*`, apply base transform, read `q` from `/pika/{arm}/joint_feedback`, compute `v = K_p·(T_tgt ⊖ T_fk(q))`, `q_dot = DLS(J(q),σ_min)·v`, `q_next = clamp(q+q_dot·dt)`, publish `JointTarget`.
- **Own gesture detection** from `/gripper_*` (double-click = START, triple-click = STOP), plus an optional `manual_enable`-style service. Emits `SessionEvent` on each transition; writes a sidecar JSONL of start/stop timestamps.
- Publish debug telemetry (`q_target`, `σ_min`).

### A5. SDK node (184, `arm_joint_stream_node.py`)

- Own `Robotic_Arm` connection (own robot handle). Subscribes `/pika/{arm}/joint_target`; runs `rm_movej_canfd(joint_degrees, follow=False)` on a fixed 20 ms period; publishes `/pika/{arm}/joint_feedback` from `get_joint`.
- Watchdog: stale `JointTarget` → stop. Converts radians → degrees at the SDK boundary.

### A6. Deployment & dependencies

- **New git repo** (e.g. `pika_joint_ik`), created on 143 (or 184); developed via SSH, built with `colcon` against `/opt/ros/humble`.
- 184 node needs the RealMan SDK (`Robotic_Arm`) importable in its environment (reuse the SDK site-packages already on 184, or a venv).
- **Caveat (important):** the existing `realman_robot_driver` holds the arm's SDK handle. The self-contained 184 node needs its own handle, so the existing driver for that arm must be **stopped** before this package runs (operator runs one control path at a time).

### A7. Safety

- Watchdog stop on stale targets; joint-limit + velocity clamps; adaptive damping caps `q_dot` near singularities.
- Default mock/dry-run; hardware testing requires explicit low-speed approval and an accessible e-stop.

### A8. Testing

- `ik_core` unit tests: FK vs known poses, Jacobian vs finite-difference, DLS damping near singular configs, joint-limit/velocity clamping.
- Node tests: gesture detection, base transform, target→feedback loop (mock 184 node).
- Hardware: low-speed smoke test on one arm first.

## Part B — Gesture timestamp sidecar (part of this package)

- `joint_ik_node` owns gesture detection and writes `/pika/{side}/session_event` plus a sidecar JSONL `{side, action, timestamp_ns, source}` next to the recording. No data cleaning for now.

## Open questions

- Exact RM65 MDH values to hardcode (from URDF / `rm_get_DH_data()`).
- Base-frame transform parameters (`pika_base.py`): reuse the existing `pikabase` values or a fresh calibration.
- SDK environment on 184 for the standalone node (reuse container site-packages vs venv).
- Whether the gesture timestamps should also be forwarded to the existing recording platform (out of scope here, but may be a follow-up).
