# Pika Joint-Space IK Teleop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained `pika_joint_ik` package (own git repo on 143) that turns Vive tracker pose + gripper into per-arm joint targets via in-house DLS/SVD velocity-IK, and streams them over ROS 2 to a 184 node calling `rm_movej_canfd(follow=False)`.

**Architecture:** One ROS 2 package with two nodes and a ROS-free IK core. On 143, `joint_ik_node` subscribes to `/pika_pose_*`, `/gripper_*`, and `/pika/{arm}/joint_feedback`, runs a resolved-rate DLS loop at 50 Hz, and publishes `/pika/{arm}/joint_target`. On 184, `arm_joint_stream_node` subscribes to `joint_target`, holds its own RealMan SDK handle, streams `rm_movej_canfd`, and publishes `joint_feedback` back.

**Tech Stack:** Python 3, ROS 2 Humble (ament_python), numpy, RealMan `Robotic_Arm` SDK (184 only), pytest.

**Spec:** `docs/superpowers/specs/2026-09-28-pika-joint-ik-teleop-design.md`

## Global Constraints

- Code lives in a new git repo on 143 (`~/pika_joint_ws`), **not** in the `realman_pi` repo; developed over SSH.
- No dependency on `realman_robot_driver`, `realman_msgs`, `pika_control_router`, `pika_realman_mapper`.
- IK core (`ik_core.py`) is ROS-free and SDK-free — importable and testable with plain `numpy` + `pytest`.
- Joint angles are radians internally; convert to **degrees** only at the `rm_movej_canfd` boundary.
- Run one control path at a time: the existing `realman_robot_driver` holds the arm's SDK handle, so it must be stopped before this package runs.
- Rate: 50 Hz loop, matching `rm_movej_canfd(follow=False)` 20 ms period.
- Default mock/dry-run; hardware moves need low-speed approval and an accessible e-stop.

## Review Focus

The spec's failure modes a person will hit, most likely first:

1. **Wrong/NaN joint targets reach the arm** — a singular `J` or a bad FK must never emit `NaN`/`Inf` joint angles. Behavior expected: the loop keeps the previous target (or stops) instead of sending garbage.
2. **Quaternion convention mix-up** — the pose input is `wxyz`; the FK must produce and the error must consume the same convention, else the arm twists.
3. **Units at the SDK boundary** — degrees vs radians. Behavior expected: `rm_movej_canfd` receives degrees; everything upstream stays radians.
4. **Stale pose with the session still "live"** — if the tracker drops, the node must stop sending (not freeze the arm in a bad pose). Behavior expected: stale timestamp → stop streaming.
5. **Gesture mis-detection** — a normal grasp must not read as a double/triple click (and vice versa). Behavior expected: click timing window is enforced.

---

### Task 1: Repo + package scaffold + custom messages

**Files:**
- Create: `~/pika_joint_ws/.gitignore`, `~/pika_joint_ws/README.md` (already exist from init; extend if needed)
- Create: `~/pika_joint_ws/src/pika_joint_ik/package.xml`
- Create: `~/pika_joint_ws/src/pika_joint_ik/setup.py`
- Create: `~/pika_joint_ws/src/pika_joint_ik/setup.cfg`
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/__init__.py`
- Create: `~/pika_joint_ws/src/pika_joint_ik/msg/JointTarget.msg`
- Create: `~/pika_joint_ws/src/pika_joint_ik/msg/JointFeedback.msg`
- Create: `~/pika_joint_ws/src/pika_joint_ik/msg/SessionEvent.msg`

**Interfaces:**
- Produces: message types `pika_joint_ik/msg/JointTarget` (`float64[6] joint_degrees`), `JointFeedback` (`float64[6] joint_degrees`), `SessionEvent` (`string side`, `uint8 action`, `uint64 timestamp_ns`, `uint8 source`). Package name string `pika_joint_ik` used by every later task.

- [ ] **Step 1: Write the message and package files**

`msg/JointTarget.msg`:
```
float64[6] joint_degrees
```

`msg/JointFeedback.msg`:
```
float64[6] joint_degrees
```

`msg/SessionEvent.msg`:
```
string side
uint8 action   # 0=START 1=STOP
uint64 timestamp_ns
uint8 source   # 0=GESTURE 1=MANUAL
```

`package.xml` (key fields):
```xml
<package format="3">
  <name>pika_joint_ik</name>
  <version>0.1.0</version>
  <description>Self-contained Pika joint-space IK teleop</description>
  <maintainer email="pika-joint-dev@localhost">pika-joint-dev</maintainer>
  <license>MIT</license>
  <buildtool_depend>ament_cmake</buildtool_depend>
  <buildtool_depend>rosidl_default_generators</buildtool_depend>
  <exec_depend>rosidl_default_runtime</exec_depend>
  <member_of_group>rosidl_interface_packages</member_of_group>
  <depend>rclpy</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>std_msgs</depend>
</package>
```

`setup.py` (messages + nodes in one ament_python package):
```python
from setuptools import find_packages, setup

package_name = 'pika_joint_ik'

setup(
    name=package_name,
    version='0.1.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/config', ['config/ik.yaml']),
        ('share/' + package_name + '/launch', ['launch/joint_ik.launch.py']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    entry_points={
        'console_scripts': [
            'joint_ik_node = pika_joint_ik.joint_ik_node:main',
            'arm_joint_stream_node = pika_joint_ik.arm_joint_stream_node:main',
        ],
    },
)
```

`setup.cfg`:
```ini
[develop]
script_dir=$base/lib/pika_joint_ik
[install]
install_scripts=$base/lib/pika_joint_ik
```

- [ ] **Step 2: Create `resource/pika_joint_ik` marker and `config/ik.yaml`, `launch/joint_ik.launch.py` as empty stubs so `data_files` resolves**

```bash
mkdir -p src/pika_joint_ik/resource src/pika_joint_ik/config src/pika_joint_ik/launch
touch src/pika_joint_ik/resource/pika_joint_ik
echo '{}' > src/pika_joint_ik/config/ik.yaml
```

- [ ] **Step 3: Build the workspace and verify messages generate**

```bash
cd ~/pika_joint_ws
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select pika_joint_ik
source install/setup.bash
ros2 interface show pika_joint_ik/msg/JointTarget
```

Expected: `ros2 interface show` prints `float64[6] joint_degrees`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffold pika_joint_ik package + messages"
```

---

### Task 2: IK core — DH types + forward kinematics

**Files:**
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/ik_core.py`
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/dh_params.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_fk.py`

**Interfaces:**
- Produces: `ik_core.forward_kinematics(dh, q) -> np.ndarray` (4×4 `T_base→ee`); `dh` is `list[tuple[a, alpha, d, theta_offset]]` in metres/radians. Later tasks import `forward_kinematics` by this exact name.

- [ ] **Step 1: Write the failing test (2-DoF planar arm, hand-computed FK)**

```python
import math
import numpy as np
from pika_joint_ik.ik_core import forward_kinematics

# 2-link planar arm: a=[1,1], all alpha=0, d=0
PLANAR = [(1.0, 0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)]

def test_fk_zero_returns_identity_homogeneous_shape():
    q = [0.0, 0.0]
    T = forward_kinematics(PLANAR, q)
    assert T.shape == (4, 4)

def test_fk_two_link_straight_out():
    # q=(0,0): ee at x=2, y=0
    T = forward_kinematics(PLANAR, [0.0, 0.0])
    assert np.allclose(T[:3, 3], [2.0, 0.0, 0.0], atol=1e-9)

def test_fk_two_link_bent():
    # q=(pi/2, 0): ee at x=0, y=2
    T = forward_kinematics(PLANAR, [math.pi/2, 0.0])
    assert np.allclose(T[:3, 3], [0.0, 2.0, 0.0], atol=1e-9)
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_fk.py -v`
Expected: `ModuleNotFoundError: No module named 'pika_joint_ik.ik_core'` (or `forward_kinematics` not defined).

- [ ] **Step 3: Implement `forward_kinematics` and the DH transform**

```python
import numpy as np

def _dh_transform(a, alpha, d, theta):
    ct, st = np.cos(theta), np.sin(theta)
    ca, sa = np.cos(alpha), np.sin(alpha)
    return np.array([
        [ct, -st * ca,  st * sa, a * ct],
        [st,  ct * ca, -ct * sa, a * st],
        [0.0,     sa,      ca,      d],
        [0.0,     0.0,     0.0,    1.0],
    ])

def forward_kinematics(dh, q):
    T = np.eye(4)
    for (a, alpha, d, theta_offset), q_i in zip(dh, q):
        T = T @ _dh_transform(a, alpha, d, q_i + theta_offset)
    return T
```

`dh_params.py` (RM65 placeholder table — overwritten in Task 2 Step 4's fetch, kept valid so FK does not crash):
```python
# Authoritative values come from rm_get_DH_data(); these are the URDF-derived
# RM65-B geometry as a sane stand-in until Task 2 Step 4 runs on 184.
RM65_DH = [
    (0.0,      0.0,          0.2405, 0.0),
    (0.0,      -1.5707963,   0.0,    0.0),
    (0.256,    0.0,          0.0,    1.5707963),
    (0.0,      1.5707963,    0.21,   0.0),
    (0.0,      -1.5707963,   0.0,    0.0),
    (0.0,      1.5707963,    0.144,  0.0),
]
```

- [ ] **Step 4: Fetch the authoritative MDH from the SDK and paste into `dh_params.py`**

On 184 (where the SDK is importable):
```bash
python3 - << 'PY'
from Robotic_Arm.rm_robot_interface import RoboticArm
# or the configured handle; print the DH table in (a, alpha, d, theta) order
PY
```
Write the returned 6 rows into `RM65_DH` in `dh_params.py` (metres/radians). If the SDK reports millimetres/degrees, convert (`a,d` ×0.001, `alpha,theta` ×π/180).

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_fk.py -v`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: DH forward kinematics in ik_core"
```

---

### Task 3: IK core — geometric Jacobian

**Files:**
- Modify: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/ik_core.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_jacobian.py`

**Interfaces:**
- Produces: `ik_core.geometric_jacobian(dh, q) -> np.ndarray` (6×N). Task 4 consumes it by this name.

- [ ] **Step 1: Write the failing test (Jacobian vs finite-difference of FK)**

```python
import numpy as np
from pika_joint_ik.ik_core import forward_kinematics, geometric_jacobian
from pika_joint_ik.dh_params import RM65_DH

def _fk_position(q):
    return forward_kinematics(RM65_DH, q)[:3, 3]

def test_jacobian_matches_finite_difference():
    q = np.array([0.2, -0.5, 0.8, 0.1, 0.3, -0.4])
    J = geometric_jacobian(RM65_DH, q)
    eps = 1e-6
    for j in range(6):
        dq = np.zeros(6); dq[j] = eps
        J_fd = (_fk_position(q + dq) - _fk_position(q - dq)) / (2 * eps)
        assert np.allclose(J[:3, j], J_fd, atol=1e-5), f"linear column {j} mismatch"
```

- [ ] **Step 2: Run to verify it fails**
Expected: `geometric_jacobian` not defined.

- [ ] **Step 3: Implement the geometric Jacobian**

```python
def geometric_jacobian(dh, q):
    T = np.eye(4)
    transforms = []
    for (a, alpha, d, theta_offset), q_i in zip(dh, q):
        T = T @ _dh_transform(a, alpha, d, q_i + theta_offset)
        transforms.append(T.copy())
    T_ee = transforms[-1]
    J = np.zeros((6, len(q)))
    for i, T_i in enumerate(transforms):
        p_i = T_i[:3, 3]
        z_i = T_i[:3, 2]
        # origin of frame i is the previous transform's translation (frame 0 = base)
        p_prev = transforms[i - 1][:3, 3] if i > 0 else np.zeros(3)
        J[:3, i] = np.cross(z_i, T_ee[:3, 3] - p_prev)
        J[3:, i] = z_i
    return J
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_jacobian.py -v`
Expected: PASS (all 6 columns within 1e-5).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: geometric Jacobian in ik_core"
```

---

### Task 4: IK core — DLS/SVD solve + adaptive damping

**Files:**
- Modify: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/ik_core.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_dls.py`

**Interfaces:**
- Produces: `ik_core.dls_velocity(J, v, lam) -> np.ndarray`; `ik_core.adaptive_lambda(sigma_min, sigma_safe, sigma_danger, lam_min, lam_max) -> float`. Task 6 consumes both.

- [ ] **Step 1: Write the failing test**

```python
import numpy as np
from pika_joint_ik.ik_core import dls_velocity, adaptive_lambda

def test_dls_matches_least_squares_when_well_conditioned():
    J = np.array([[1.0, 0.0, 0.0],
                  [0.0, 1.0, 0.0],
                  [0.0, 0.0, 1.0]])
    v = np.array([0.1, 0.2, 0.3])
    q_dot = dls_velocity(J, v, lam=1e-6)
    assert np.allclose(q_dot, v, atol=1e-3)

def test_dls_damps_singular_direction():
    # rank-1 J: the null direction must be suppressed, not blow up
    J = np.array([[1.0, 0.0],
                  [0.0, 0.0]])
    v = np.array([0.0, 1.0])  # only the unreachable direction
    q_dot = dls_velocity(J, v, lam=0.1)
    assert np.all(np.isfinite(q_dot))
    assert np.linalg.norm(q_dot) < 1e-6

def test_adaptive_lambda_ramps():
    assert adaptive_lambda(1.0, 0.1, 0.01, 1e-3, 1.0) == 1e-3   # well above safe
    assert adaptive_lambda(0.005, 0.1, 0.01, 1e-3, 1.0) == 1.0   # at/below danger
    mid = adaptive_lambda(0.05, 0.1, 0.01, 1e-3, 1.0)
    assert 1e-3 < mid < 1.0
```

- [ ] **Step 2: Run to verify it fails**
Expected: `dls_velocity` not defined.

- [ ] **Step 3: Implement DLS via SVD and adaptive damping**

```python
def dls_velocity(J, v, lam):
    U, S, Vt = np.linalg.svd(J, full_matrices=False)
    S = np.atleast_1d(S)
    damped = S / (S * S + lam * lam)
    return (Vt.T @ (damped[:, None] * (U.T @ v)))

def adaptive_lambda(sigma_min, sigma_safe, sigma_danger, lam_min, lam_max):
    if sigma_min > sigma_safe:
        return lam_min
    if sigma_min <= sigma_danger:
        return lam_max
    t = (sigma_safe - sigma_min) / (sigma_safe - sigma_danger)
    return lam_min + t * (lam_max - lam_min)
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_dls.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: DLS solve + adaptive damping"
```

---

### Task 5: IK core — joint limits, velocity clamp, singularity detection

**Files:**
- Modify: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/ik_core.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_limits.py`

**Interfaces:**
- Produces: `ik_core.clamp_joints(q, lower, upper) -> np.ndarray`; `ik_core.clamp_velocity(q_dot, vmax) -> np.ndarray`; `ik_core.singularity_flags(q, elbow_deg, wrist_deg) -> dict`. Task 6 consumes all three.

- [ ] **Step 1: Write the failing test**

```python
import numpy as np
from pika_joint_ik.ik_core import clamp_joints, clamp_velocity, singularity_flags

def test_clamp_joints_bounds():
    q = np.array([10.0, -10.0, 0.0])
    lo = np.array([-1.0, -1.0, -1.0])
    hi = np.array([1.0, 1.0, 1.0])
    out = clamp_joints(q, lo, hi)
    assert np.allclose(out, [1.0, -1.0, 0.0])

def test_clamp_velocity_scales_not_clips_direction():
    v = np.array([3.0, 4.0])  # norm 5
    out = clamp_velocity(v, 2.5)
    assert np.allclose(out, [1.5, 2.0])

def test_singularity_flags():
    f = singularity_flags([0.0, 0.0, 0.0, 0.0, 0.0, 0.0], 10.0, 10.0)
    assert f["elbow"] is True and f["wrist"] is True
```

- [ ] **Step 2: Run to verify it fails**
Expected: `clamp_joints` not defined.

- [ ] **Step 3: Implement**

```python
def clamp_joints(q, lower, upper):
    return np.clip(np.asarray(q, dtype=float), lower, upper)

def clamp_velocity(q_dot, vmax):
    q_dot = np.asarray(q_dot, dtype=float)
    n = np.linalg.norm(q_dot)
    if n > vmax and n > 0:
        q_dot = q_dot * (vmax / n)
    return q_dot

def singularity_flags(q, elbow_deg, wrist_deg):
    q = np.asarray(q, dtype=float)
    return {
        "elbow": abs(q[2]) < np.radians(elbow_deg),
        "wrist": abs(q[4]) < np.radians(wrist_deg),
    }
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_limits.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: joint limits, velocity clamp, singularity flags"
```

---

### Task 6: IK core — resolved-rate velocity-IK (ties it together)

**Files:**
- Modify: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/ik_core.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_resolved_rate.py`

**Interfaces:**
- Produces: `ik_core.resolved_rate_step(dh, q, T_target, Kp, dt, lower, upper, vmax, lam_min, lam_max, sigma_safe, sigma_danger) -> (q_next, sigma_min)` — the single call the 143 node makes each tick. Task 9 consumes it.

- [ ] **Step 1: Write the failing test**

```python
import numpy as np
from pika_joint_ik.ik_core import resolved_rate_step, forward_kinematics
from pika_joint_ik.dh_params import RM65_DH

LO = np.array([-3.14]*6); HI = np.array([3.14]*6)

def test_resolved_rate_converges_toward_target():
    q = np.array([0.0, -0.4, 0.6, 0.0, 0.3, 0.0])
    T_target = forward_kinematics(RM65_DH, np.array([0.1, -0.3, 0.5, 0.1, 0.2, 0.0]))
    for _ in range(500):
        q, _ = resolved_rate_step(RM65_DH, q, T_target, Kp=1.0, dt=0.02,
                                  lower=LO, upper=HI, vmax=0.5,
                                  lam_min=1e-3, lam_max=1.0,
                                  sigma_safe=0.05, sigma_danger=0.005)
    err = np.linalg.norm(forward_kinematics(RM65_DH, q)[:3, 3] - T_target[:3, 3])
    assert err < 1e-3
```

- [ ] **Step 2: Run to verify it fails**
Expected: `resolved_rate_step` not defined.

- [ ] **Step 3: Implement the resolved-rate step**

```python
def _pose_error_twist(T_current, T_target):
    # position error
    p_err = T_target[:3, 3] - T_current[:3, 3]
    # orientation error via rotation matrix logarithm
    R_err = T_target[:3, :3] @ T_current[:3, :3].T
    theta = np.arccos(np.clip((np.trace(R_err) - 1.0) / 2.0, -1.0, 1.0))
    if theta < 1e-9:
        w_err = np.zeros(3)
    else:
        w_err = theta / (2.0 * np.sin(theta)) * np.array(
            [R_err[2, 1] - R_err[1, 2],
             R_err[0, 2] - R_err[2, 0],
             R_err[1, 0] - R_err[0, 1]])
    return np.concatenate([p_err, w_err])

def resolved_rate_step(dh, q, T_target, Kp, dt, lower, upper, vmax,
                       lam_min, lam_max, sigma_safe, sigma_danger):
    q = np.asarray(q, dtype=float)
    T_cur = forward_kinematics(dh, q)
    v = Kp * _pose_error_twist(T_cur, T_target)
    J = geometric_jacobian(dh, q)
    sigma_min = float(np.linalg.svd(J, compute_uv=False).min())
    lam = adaptive_lambda(sigma_min, sigma_safe, sigma_danger, lam_min, lam_max)
    q_dot = dls_velocity(J, v, lam)
    q_dot = clamp_velocity(q_dot, vmax)
    q_next = clamp_joints(q + q_dot * dt, lower, upper)
    return q_next, sigma_min
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_resolved_rate.py -v`
Expected: PASS (position error < 1e-3 within 500 steps).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: resolved-rate velocity-IK step"
```

---

### Task 7: 143 helpers — base transform + gesture detection

**Files:**
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/pika_base.py`
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/gesture.py`
- Test: `~/pika_joint_ws/src/pika_joint_ik/test/test_gesture.py`

**Interfaces:**
- Produces: `pika_base.tracker_to_base(tracker_pose) -> np.ndarray` (4×4) using a `pika_base.PIKA_BASE_QUAT_XYZW` constant; `gesture.GestureDetector` with `detect(position) -> 'start'|'stop'|None`.

- [ ] **Step 1: Write the failing gesture test**

```python
from pika_joint_ik.gesture import GestureDetector

def test_double_click_detected():
    d = GestureDetector(click_max_interval_ms=450, click_min_interval_ms=50)
    # open->closed->open->closed->open is a double click
    seq = [0.0967, 0.0, 0.0967, 0.0, 0.0967]
    out = [d.detect(x) for x in seq]
    assert 'start' in out

def test_single_grasp_not_detected():
    d = GestureDetector(click_max_interval_ms=450, click_min_interval_ms=50)
    seq = [0.0967, 0.0, 0.05, 0.02, 0.01]  # smooth close, no reopen
    out = [d.detect(x) for x in seq]
    assert 'start' not in out and 'stop' not in out
```

- [ ] **Step 2: Run to verify it fails**
Expected: `ModuleNotFoundError: No module named 'pika_joint_ik.gesture'`.

- [ ] **Step 3: Implement the base transform and gesture detector**

`pika_base.py`:
```python
import numpy as np

# Tracker→robot-base orientation (wxyz). Reuse the existing pikabase value; tune if needed.
PIKA_BASE_QUAT_XYZW = np.array([0.70710678, 0.0, -0.70710678, 0.0])

def tracker_to_base(position_m, quat_wxyz):
    w, x, y, z = quat_wxyz
    R = np.array([
        [1-2*(y*y+z*z), 2*(x*y-w*z),   2*(x*z+w*y)],
        [2*(x*y+w*z),   1-2*(x*x+z*z), 2*(y*z-w*x)],
        [2*(x*z-w*y),   2*(y*z+w*x),   1-2*(x*x+y*y)],
    ])
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = np.asarray(position_m, dtype=float)
    return T
```

`gesture.py`:
```python
class GestureDetector:
    def __init__(self, click_max_interval_ms=450, click_min_interval_ms=50,
                 close_threshold=0.02, open_threshold=0.08):
        self.click_max = click_max_interval_ms
        self.click_min = click_min_interval_ms
        self.close_threshold = close_threshold
        self.open_threshold = open_threshold
        self._clicks = []
        self._was_closed = False

    def detect(self, position):
        closed = position < self.close_threshold
        if closed and not self._was_closed:
            self._clicks.append(0)  # rising edge of a close
        self._was_closed = closed
        # crude: a double click = >=2 close edges within a window; triple = >=3
        if len(self._clicks) >= 3:
            self._clicks.clear(); return 'stop'
        if len(self._clicks) == 2:
            self._clicks.clear(); return 'start'
        return None
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `cd ~/pika_joint_ws && pytest src/pika_joint_ik/test/test_gesture.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: base transform + gesture detection"
```

---

### Task 8: 143 node — `joint_ik_node`

**Files:**
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/joint_ik_node.py`
- Create: `~/pika_joint_ws/src/pika_joint_ik/config/ik.yaml` (real values)
- Create: `~/pika_joint_ws/src/pika_joint_ik/launch/joint_ik.launch.py`

**Interfaces:**
- Consumes: `ik_core.resolved_rate_step`, `pika_base.tracker_to_base`, `gesture.GestureDetector`, messages from Task 1.
- Produces: runnable node `joint_ik_node` (entry point `main()`), topics `/pika/{arm}/joint_target` (pub), `/pika/{arm}/joint_feedback` (sub), `/pika/{side}/session_event` (pub).

- [ ] **Step 1: Write the node**

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from sensor_msgs.msg import JointState
from pika_joint_ik.msg import JointTarget, JointFeedback, SessionEvent
import numpy as np
from .ik_core import resolved_rate_step
from .pika_base import tracker_to_base
from .gesture import GestureDetector
from .dh_params import RM65_DH

class JointIkNode(Node):
    def __init__(self):
        super().__init__('joint_ik_node')
        self.side = self.declare_parameter('side', 'left').value
        arm = 'l' if self.side == 'left' else 'r'
        self._rate = self.declare_parameter('rate_hz', 50.0).value
        self._kp = self.declare_parameter('kp', 1.0).value
        self._q = None
        self._target_pose = None
        self._pose_stamp = None
        self._enabled = False
        self._detector = GestureDetector()
        import json, os
        os.makedirs(os.path.expanduser('~/pika_joint_ws/log'), exist_ok=True)
        self._sidecar = open(os.path.expanduser('~/pika_joint_ws/log/session_events.jsonl'), 'a')
        self._target_pub = self.create_publisher(JointTarget, f'/pika/{arm}/joint_target', 1)
        self._event_pub = self.create_publisher(SessionEvent, f'/pika/{self.side}/session_event', 10)
        self.create_subscription(PoseStamped, f'/pika_pose_{arm}', self._on_pose, 1)
        self.create_subscription(JointFeedback, f'/pika/{arm}/joint_feedback', self._on_feedback, 1)
        self.create_subscription(JointState, f'/gripper_{arm}/joint_state', self._on_gripper, 1)
        self.create_timer(1.0 / self._rate, self._tick)

    def _on_pose(self, msg):
        self._target_pose = tracker_to_base(
            [msg.pose.position.x, msg.pose.position.y, msg.pose.position.z],
            [msg.pose.orientation.w, msg.pose.orientation.x,
             msg.pose.orientation.y, msg.pose.orientation.z])
        self._pose_stamp = self.get_clock().now()

    def _on_feedback(self, msg):
        self._q = np.array(msg.joint_degrees)

    def _on_gripper(self, msg):
        if msg.position:
            action = self._detector.detect(msg.position[0])
            if action:
                self._enabled = action == 'start'
                ev = SessionEvent()
                ev.side = self.side
                ev.action = 0 if action == 'start' else 1
                ev.timestamp_ns = self.get_clock().now().nanoseconds
                ev.source = 0
                self._event_pub.publish(ev)
                self._sidecar.write(json.dumps({
                    'side': self.side,
                    'action': 'start' if action == 'start' else 'stop',
                    'timestamp_ns': ev.timestamp_ns,
                    'source': 'gesture',
                }) + '\n')
                self._sidecar.flush()

    def _tick(self):
        if not self._enabled or self._q is None or self._target_pose is None:
            return
        age = (self.get_clock().now() - self._pose_stamp).nanoseconds / 1e9
        if age > 0.2:  # stale pose → stop sending
            return
        q_next, _ = resolved_rate_step(RM65_DH, self._q, self._target_pose,
                                       self._kp, 1.0 / self._rate,
                                       lower=np.array([-3.14]*6), upper=np.array([3.14]*6),
                                       vmax=0.5, lam_min=1e-3, lam_max=1.0,
                                       sigma_safe=0.05, sigma_danger=0.005)
        msg = JointTarget(); msg.joint_degrees = q_next.tolist()
        self._target_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = JointIkNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

- [ ] **Step 2: Write launch file and config**

`launch/joint_ik.launch.py`:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='pika_joint_ik', executable='joint_ik_node',
             name='joint_ik_left', parameters=[{'side': 'left'}]),
        Node(package='pika_joint_ik', executable='joint_ik_node',
             name='joint_ik_right', parameters=[{'side': 'right'}]),
    ])
```

`config/ik.yaml`:
```yaml
joint_ik_left:
  ros__parameters:
    side: left
    rate_hz: 50.0
    kp: 1.0
joint_ik_right:
  ros__parameters:
    side: right
    rate_hz: 50.0
    kp: 1.0
```

- [ ] **Step 3: Build and smoke-test that the node imports and starts (no arm)**

```bash
cd ~/pika_joint_ws && source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select pika_joint_ik && source install/setup.bash
ROS_DOMAIN_ID=65 timeout 3 ros2 run pika_joint_ik joint_ik_node --ros-args -p side:=left
```

Expected: node starts, no import errors, then times out (exit 124).

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: 143 joint_ik_node"
```

---

### Task 9: 184 node — `arm_joint_stream_node`

**Files:**
- Create: `~/pika_joint_ws/src/pika_joint_ik/pika_joint_ik/arm_joint_stream_node.py`

**Interfaces:**
- Consumes: `JointTarget` message; RealMan `Robotic_Arm` SDK on 184.
- Produces: `rm_movej_canfd` streaming at 20 ms, publishing `JointFeedback`.

- [ ] **Step 1: Write the node**

```python
import rclpy
from rclpy.node import Node
from pika_joint_ik.msg import JointTarget, JointFeedback
import numpy as np

class ArmJointStreamNode(Node):
    def __init__(self):
        super().__init__('arm_joint_stream_node')
        arm = self.declare_parameter('arm', 'l').value
        self._sdk = self._connect()
        self._current = np.zeros(6)
        self._target = None
        self._period = 0.02
        self.create_subscription(JointTarget, f'/pika/{arm}/joint_target', self._on_target, 1)
        self._fb_pub = self.create_publisher(JointFeedback, f'/pika/{arm}/joint_feedback', 1)
        self.create_timer(self._period, self._stream)

    def _connect(self):
        from Robotic_Arm.rm_robot_interface import RoboticArm
        arm = RoboticArm()  # configure with the arm's IP/port in production
        return arm

    def _on_target(self, msg):
        self._target = np.array(msg.joint_degrees)

    def _stream(self):
        if self._target is None:
            return
        # radians -> degrees at the SDK boundary
        deg = np.degrees(self._target).tolist()
        ret = self._sdk.rm_movej_canfd(deg, follow=False)
        if ret == 0:
            self._current = self._target
        fb = JointFeedback(); fb.joint_degrees = self._current.tolist()
        self._fb_pub.publish(fb)

def main(args=None):
    rclpy.init(args=args)
    node = ArmJointStreamNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

- [ ] **Step 2: Build**

```bash
cd ~/pika_joint_ws && source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select pika_joint_ik
```

Expected: build succeeds (note: SDK import only happens at runtime, so 143 can still build it).

- [ ] **Step 3: Hardware smoke (low speed, one arm, e-stop ready)**

```bash
# on 143: publish a tiny fixed joint target by hand, watch 184 stream it
ROS_DOMAIN_ID=65 ros2 topic pub /pika/l/joint_target pika_joint_ik/msg/JointTarget '{joint_degrees: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}' -r 50
```

Expected: arm holds (near-zero target), no `-1` return, feedback topic flows at 50 Hz.

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: 184 arm_joint_stream_node"
```

---

### Task 10: End-to-end integration + docs

**Files:**
- Create: `~/pika_joint_ws/README.md` (usage: build, launch on 143 + 184, stop-existing-driver note)
- Modify: `~/pika_joint_ws/src/pika_joint_ik/launch/joint_ik.launch.py` (add `arm_joint_stream_node` for both arms)

**Interfaces:** none new.

- [ ] **Step 1: Update launch to include the 184 node**

```python
def generate_launch_description():
    return LaunchDescription([
        Node(package='pika_joint_ik', executable='joint_ik_node', name='joint_ik_left', parameters=[{'side': 'left'}]),
        Node(package='pika_joint_ik', executable='joint_ik_node', name='joint_ik_right', parameters=[{'side': 'right'}]),
        Node(package='pika_joint_ik', executable='arm_joint_stream_node', name='arm_stream_l', parameters=[{'arm': 'l'}]),
        Node(package='pika_joint_ik', executable='arm_joint_stream_node', name='arm_stream_r', parameters=[{'arm': 'r'}]),
    ])
```

- [ ] **Step 2: Write README usage**

Document: build command, `ROS_DOMAIN_ID=65`, run `joint_ik.launch.py` on the machine with the tracker data (143) and `arm_joint_stream_node` on 184 (SDK), the "stop existing driver first" caveat, and the double-click=START / triple-click=STOP gesture.

- [ ] **Step 3: End-to-end low-speed smoke on one arm**

Start the stack on 143 (tracker + gripper present), start `arm_stream_l` on 184, double-click the gripper, confirm the arm follows slowly; triple-click to stop.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: end-to-end integration + docs"
```
