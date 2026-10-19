# Pika 位置控制相对锚点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `pikaposition` 在 session 启动时以臂的当前位姿为锚点，Pika 位姿流不连续时在 session 内原地重新锚定，并加上位置/姿态 leash。

**Architecture:** 在 `pika_control_router.py` 里新增纯 Python 的 `PositionTarget`（与 `MixedTarget` 并列），复用 mixed 已有的锚点读取（`/<arm>/get_current_pose`）和实测轮询；`_reconcile_position`、`_goal_response`、`_pose` 按 mixed 的结构接线。driver、`.action`、话题契约、`_pose_goal` 都不动。新增 `pika_config.yaml` 的 `pika_position` 段，由 `control_router.launch.py` 加载并传给 router。

**Tech Stack:** Python 3.10（ROS 2 Humble）、rclpy、pytest、PyYAML、VitePress（文档站）。

**Spec:** `docs/superpowers/specs/2026-10-10-pika-position-anchor-design.md`

## Global Constraints

- 只改 `pikaposition`；`pikamixed`、`pikavelocity`、keyboard router 行为不变。对 mixed 代码**唯一**的改动是把 `_reset_mixed` 机械地改名为 `_reset_target`（同时清空 `position`）。
- 不改 driver、`.action`、话题契约。`/<arm>/cartesian_pose/command` 仍是绝对基座系目标，frame_id 仍是 `<arm>/base_link`。`_pose_goal`（`follow=False`、`trajectory_mode=0`、`radio=0`、`control_period_ms`、driver 看门狗 100 ms）不动。
- 不做：控制器侧滤波/高跟随、One Euro、笛卡尔工作空间盒、`rm_movep_canfd`、启动时非指令运动保护。
- `pika_position` 默认值（初值，没有数据支撑）：`rebase_gap_ms: 1000`、`jump_position_m: 0.10`、`jump_orientation_rad: 0.5`、`max_position_lead_m: 0.05`、`max_orientation_lead_rad: 0.15`、`pose_poll_hz: 10.0`。
- 配置校验：全部为有限正数；`rebase_gap_ms` 为正整数；router 启动时校验 `rebase_gap_ms < watchdog_ms`（launch 传入 3000）。
- 输入丢失 3 s（`watchdog_ms`）释放 session 并丢弃锚点；锚点读失败退避 `_RESTART_BACKOFF_SEC`（0.5 s）；实测超过 `_MEASUREMENT_MAX_AGE_SEC`（1.0 s）视为不新鲜，目标保持。
- router 源码里必须保留这一行（`test_pika_router_requires_active_behavior_tree_mode_before_forwarding` 按源码文本断言）：`if self.mode != "pikaposition" and self.mode != "pikamixed":`
- ROS 日志只用 `self.get_logger()`，不用 `print`。配置只放根目录 `config/` 并带注释。
- 提交说明末尾加 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`。所有命令都在 worktree 根目录 `/Users/miakho/Organizations/realman_pi/.claude/worktrees/pika-position-anchor` 运行，不要 `cd` 到原仓库，不要 stage 无关文件。

## 测试运行方式（前置条件）

router 脚本在模块顶层导入 `rclpy`、`geometry_msgs`、`realman_msgs`，本机（macOS）没有这些，Docker 守护进程在写计划时也没有运行。所有 pytest 都在 Humble 镜像 `rm65-humble-rviz:local` 里跑，把 worktree 挂载为 `/work`（测试用 `Path(__file__).parents[4]` 取仓库根，所以必须挂整个仓库）。

- [ ] **Step P1: 确认 Docker 与镜像**

先启动 Docker Desktop，然后：

```bash
docker images rm65-humble-rviz:local
```

Expected: 列出一行 `rm65-humble-rviz   local`。如果没有，在原仓库根目录构建（耗时很长，且需要用户同意）：`docker compose build realman_driver_test`。

- [ ] **Step P2: 跑基线**

```bash
docker run --rm -v "$PWD":/work -w /work rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && python3 -m pytest -q -p no:cacheprovider src/behavior/realman_bt/test/test_pika_control_router.py src/behavior/realman_bt/test/test_pika_config.py'
```

Expected: 全部通过。记下通过的用例数，后面每个任务都和它比较。下文把这条命令记作 **`RUN_TESTS`**，只有末尾的文件列表会变。如果基线就失败，停下来报告，不要继续。

---

## File Structure

| 文件 | 职责 |
| --- | --- |
| `src/behavior/realman_bt/scripts/pika_control_router.py` | 新增 `PositionTarget`；`_ArmState.position`；`_reconcile_position`、`_on_anchor`、`_goal_response`、`_goal_finished`、`_pose` 接线；`_reset_mixed`→`_reset_target`；`_validate_position_parameters` |
| `src/behavior/realman_bt/launch/control_router.launch.py` | 新增 `_load_pika_position_config`，把 `pika_position_*` 传给 router |
| `config/ros/pika_config.yaml` | 新增 `pika_position` 段（带注释） |
| `src/behavior/realman_bt/test/test_pika_control_router.py` | 新增 `PositionTarget` 与 router 位置模式测试；改写 4 个编码"绝对直通"的旧测试；`_pika_router` 夹具补位置参数 |
| `src/behavior/realman_bt/test/test_pika_config.py` | 新增 `pika_position` 配置与加载器测试 |
| `scripts/simulate_pika_pose.py` | 先发基线再阶跃，适配相对语义 |
| `website/docs/development/pika-teleop.md`、`website/docs/reference/configuration.md` | 文档同步 |

---

### Task 1: `PositionTarget` 纯逻辑

**Files:**
- Modify: `src/behavior/realman_bt/scripts/pika_control_router.py`（在 `class PikaControlRouter(Node):` 之前插入，当前约第 389 行）
- Test: `src/behavior/realman_bt/test/test_pika_control_router.py`（文件末尾追加）

**Interfaces:**
- Consumes（已存在于同一文件）：`normalize_quaternion(q) -> tuple`、`rotate_towards(current, target, max_angle_rad) -> tuple`、`quaternion_multiply(a, b)`、`quaternion_conjugate(q)`、`quaternion_angle(a, b) -> float`、`_norm3(v) -> float`。
- Produces：
  - `PositionTarget(position, orientation_wxyz, *, rebase_gap_sec, jump_position_m, jump_orientation_rad, max_position_lead_m, max_orientation_lead_rad)`；任何设置非有限或 ≤ 0 抛 `ValueError`，位置非三个有限值抛 `ValueError`。
  - `.accept(position, orientation_wxyz, now) -> str`：返回重锚原因 `"silence"` / `"position jump"` / `"orientation jump"`，未重锚（含首帧配对）返回 `""`；非法输入抛 `ValueError` 且不改状态。
  - `.target(*, measured_position, measured_orientation) -> tuple[position, orientation_wxyz]`：实测任一为 `None` 时返回上一次交出的目标（保持）；否则计算并套 leash，记为"上一次交出的目标"。
  - 公开属性：`anchor_position`、`anchor_orientation`、`hand_position`、`hand_orientation`、`reference_position`、`reference_orientation`、`target_position`、`target_orientation`。

- [ ] **Step 1: 写失败的测试**

在 `src/behavior/realman_bt/test/test_pika_control_router.py` 末尾追加（用 Bash heredoc）：

```bash
cat >> src/behavior/realman_bt/test/test_pika_control_router.py <<'EOF'


# ---------------------------------------------------------- Pika / Position

_IDENTITY_Q = (1.0, 0.0, 0.0, 0.0)


def _position_target(orientation=_IDENTITY_Q, **overrides):
    from pika_control_router import PositionTarget

    settings = dict(
        rebase_gap_sec=1.0,
        jump_position_m=0.10,
        jump_orientation_rad=0.5,
        max_position_lead_m=0.05,
        max_orientation_lead_rad=0.15,
    )
    settings.update(overrides)
    return PositionTarget((0.3, 0.0, 0.4), orientation, **settings)


def _goal(target, **overrides):
    """The goal while the arm sits exactly where the previous goal put it."""
    settings = dict(
        measured_position=target.target_position,
        measured_orientation=target.target_orientation,
    )
    settings.update(overrides)
    return target.target(**settings)


def test_the_first_position_goal_is_the_anchor_itself():
    target = _position_target()
    position, orientation = _goal(target)
    assert position == pytest.approx((0.3, 0.0, 0.4))
    assert orientation == pytest.approx(_IDENTITY_Q)


def test_position_follows_the_hand_relative_to_the_paired_pose():
    # The Pika's absolute position is far from the arm's: only its motion counts.
    target = _position_target()
    assert target.accept((5.0, 2.0, 1.0), _IDENTITY_Q, now=0.0) == ""
    # Pairing alone does not move the arm.
    assert _goal(target)[0] == pytest.approx((0.3, 0.0, 0.4))
    assert target.accept((5.02, 2.01, 0.99), _IDENTITY_Q, now=0.05) == ""
    assert _goal(target)[0] == pytest.approx((0.32, 0.01, 0.39))


def test_position_orientation_is_relative_so_an_offset_pika_does_not_turn_the_wrist():
    # The Pika frame is 40 degrees off the arm. Holding the Pika still must hold
    # the arm; a later Pika rotation turns it by the same amount in the base frame.
    from pika_control_router import quaternion_multiply

    arm = _axis_angle_quaternion((1.0, 0.0, 0.0), math.radians(170))
    offset = _axis_angle_quaternion((0.3, 0.8, 0.5), math.radians(40))
    target = _position_target(orientation=arm, max_orientation_lead_rad=1.0)
    target.accept((0.0, 0.0, 0.0), offset, now=0.0)
    assert _angle_between(_goal(target)[1], arm) == pytest.approx(0.0, abs=1e-9)

    turn = _axis_angle_quaternion((0.0, 0.0, 1.0), math.radians(10))
    target.accept((0.0, 0.0, 0.0), quaternion_multiply(turn, offset), now=0.05)
    expected = quaternion_multiply(turn, arm)
    assert _angle_between(_goal(target)[1], expected) == pytest.approx(0.0, abs=1e-6)


def test_a_position_jump_re_anchors_without_moving_the_goal():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    target.accept((0.03, 0.0, 0.0), _IDENTITY_Q, now=0.05)
    assert _goal(target)[0] == pytest.approx((0.33, 0.0, 0.4))
    # The mapper was zeroed again: the Pika pose jumps 0.5 m.
    assert target.accept((0.5, 0.0, 0.0), _IDENTITY_Q, now=0.10) == "position jump"
    assert _goal(target)[0] == pytest.approx((0.33, 0.0, 0.4))
    target.accept((0.51, 0.0, 0.0), _IDENTITY_Q, now=0.15)
    assert _goal(target)[0] == pytest.approx((0.34, 0.0, 0.4))


def test_an_orientation_jump_re_anchors_without_turning_the_wrist():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    jumped = _axis_angle_quaternion((0.0, 0.0, 1.0), math.radians(60))  # 1.05 rad > 0.5
    assert target.accept((0.0, 0.0, 0.0), jumped, now=0.05) == "orientation jump"
    assert _angle_between(_goal(target)[1], _IDENTITY_Q) == pytest.approx(0.0, abs=1e-9)


def test_a_long_silence_re_anchors_but_a_wifi_sized_gap_does_not():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    # The measured worst Wi-Fi gap is about 0.41 s: the hand just moved.
    assert target.accept((0.02, 0.0, 0.0), _IDENTITY_Q, now=0.4) == ""
    assert _goal(target)[0] == pytest.approx((0.32, 0.0, 0.4))
    # More than rebase_gap_sec of silence: the mapper may have been restarted.
    assert target.accept((0.03, 0.0, 0.0), _IDENTITY_Q, now=1.6) == "silence"
    assert _goal(target)[0] == pytest.approx((0.32, 0.0, 0.4))
    target.accept((0.04, 0.0, 0.0), _IDENTITY_Q, now=1.65)
    assert _goal(target)[0] == pytest.approx((0.33, 0.0, 0.4))


def test_position_goal_is_leashed_to_the_measured_position():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    stuck = (0.3, 0.0, 0.4)  # the arm cannot follow (IK failure)
    target.accept((0.08, 0.0, 0.0), _IDENTITY_Q, now=0.05)
    position, _ = target.target(measured_position=stuck, measured_orientation=_IDENTITY_Q)
    assert position[0] - stuck[0] == pytest.approx(0.05)
    # The hand comes back: the goal returns to the arm at once, nothing accumulated.
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.10)
    position, _ = target.target(measured_position=stuck, measured_orientation=_IDENTITY_Q)
    assert position == pytest.approx(stuck)


def test_position_goal_orientation_is_leashed_to_the_measured_orientation():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    away = _axis_angle_quaternion((0.0, 1.0, 0.0), math.radians(25))  # 0.44 rad < jump
    target.accept((0.0, 0.0, 0.0), away, now=0.05)
    stuck = (0.3, 0.0, 0.4)
    _, orientation = target.target(measured_position=stuck, measured_orientation=_IDENTITY_Q)
    assert _angle_between(_IDENTITY_Q, orientation) == pytest.approx(0.15, abs=1e-6)
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.10)
    _, orientation = target.target(measured_position=stuck, measured_orientation=_IDENTITY_Q)
    assert _angle_between(_IDENTITY_Q, orientation) == pytest.approx(0.0, abs=1e-6)


def test_position_goal_holds_without_a_fresh_measurement():
    target = _position_target()
    target.accept((0.0, 0.0, 0.0), _IDENTITY_Q, now=0.0)
    target.accept((0.02, 0.0, 0.0), _IDENTITY_Q, now=0.05)
    held = _goal(target)
    target.accept((0.04, 0.0, 0.0), _IDENTITY_Q, now=0.10)
    assert target.target(measured_position=None, measured_orientation=None) == held
    assert target.target(measured_position=(0.3, 0.0, 0.4), measured_orientation=None) == held
    assert target.target(measured_position=None, measured_orientation=_IDENTITY_Q) == held


@pytest.mark.parametrize(
    "position", [(float("nan"), 0.0, 0.0), (0.0, float("inf"), 0.0), (0.0, 0.0)]
)
def test_position_target_rejects_an_unusable_pika_position(position):
    target = _position_target()
    with pytest.raises(ValueError):
        target.accept(position, _IDENTITY_Q, now=0.0)
    assert target.hand_position is None


def test_position_target_rejects_an_unusable_pika_orientation():
    target = _position_target()
    with pytest.raises(ValueError):
        target.accept((0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0), now=0.0)
    assert target.hand_position is None


@pytest.mark.parametrize(
    "name",
    [
        "rebase_gap_sec",
        "jump_position_m",
        "jump_orientation_rad",
        "max_position_lead_m",
        "max_orientation_lead_rad",
    ],
)
def test_position_target_rejects_non_positive_settings(name):
    with pytest.raises(ValueError, match=name):
        _position_target(**{name: 0.0})
    with pytest.raises(ValueError, match=name):
        _position_target(**{name: float("nan")})
EOF
```

- [ ] **Step 2: 运行，确认失败**

```bash
docker run --rm -v "$PWD":/work -w /work rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && python3 -m pytest -q -p no:cacheprovider src/behavior/realman_bt/test/test_pika_control_router.py -k "position_target or position_goal or position_follows or position_orientation or position_jump or orientation_jump or long_silence or first_position_goal or unusable_pika"'
```

Expected: FAIL，错误为 `ImportError: cannot import name 'PositionTarget' from 'pika_control_router'`。

- [ ] **Step 3: 实现 `PositionTarget`**

用 Edit 在 `src/behavior/realman_bt/scripts/pika_control_router.py` 里，把 `old_string` 的这一行：

```python
class PikaControlRouter(Node):
    """Bridge selected Pika topics to driver sessions without touching m."""
```

替换为（即在它前面插入整个新类）：

```python
class PositionTarget:
    """Absolute pose target for Pika position mode, relative to an anchor.

    The anchor is the arm's TCP pose when the session opened. The first Pika
    pose is paired with it, and from then on the goal is the anchor plus how far
    the Pika has moved since: position by translation, orientation by rotation
    (``q_pika * q_pika0^-1 * q_arm0``, the mapping MixedTarget uses), both in
    the base frame. The Pika mapper's own zero (its default TCP) therefore
    never decides where the arm goes, and the session starts at rest wherever
    the arm is.

    A new Pika pose that does not continue the previous one (the mapper was
    stopped and restarted, so its zero moved) re-anchors in place: the anchor
    becomes the goal handed out last and the Pika pose is paired with it anew.
    The commanded goal stays continuous; the hand motion during the jump is
    dropped.

    The goal is leashed to the measured TCP, so a target the arm cannot follow
    (IK failure, singularity) stays beside the arm instead of running away. The
    goal is a function of the latest Pika pose, so the leash is an output clamp
    and accumulates nothing.
    """

    def __init__(
        self,
        position: Any,
        orientation_wxyz: Any,
        *,
        rebase_gap_sec: float,
        jump_position_m: float,
        jump_orientation_rad: float,
        max_position_lead_m: float,
        max_orientation_lead_rad: float,
    ) -> None:
        anchor = tuple(float(value) for value in position)
        if len(anchor) != 3 or not all(math.isfinite(value) for value in anchor):
            raise ValueError("position must have three finite components")
        for name, value in (
            ("rebase_gap_sec", rebase_gap_sec),
            ("jump_position_m", jump_position_m),
            ("jump_orientation_rad", jump_orientation_rad),
            ("max_position_lead_m", max_position_lead_m),
            ("max_orientation_lead_rad", max_orientation_lead_rad),
        ):
            if not math.isfinite(value) or value <= 0.0:
                raise ValueError(f"{name} must be positive and finite")
        self.rebase_gap_sec = float(rebase_gap_sec)
        self.jump_position_m = float(jump_position_m)
        self.jump_orientation_rad = float(jump_orientation_rad)
        self.max_position_lead_m = float(max_position_lead_m)
        self.max_orientation_lead_rad = float(max_orientation_lead_rad)
        self.anchor_position: tuple[float, float, float] = anchor
        self.anchor_orientation: tuple[float, float, float, float] = normalize_quaternion(
            orientation_wxyz
        )
        # The latest accepted Pika pose, and the Pika pose paired with the anchor.
        self.hand_position: tuple[float, float, float] | None = None
        self.hand_orientation: tuple[float, float, float, float] | None = None
        self.reference_position: tuple[float, float, float] | None = None
        self.reference_orientation: tuple[float, float, float, float] | None = None
        self._accepted_at = 0.0
        # The goal handed out last: a re-anchor continues from it, and it is
        # what the goal holds while there is no fresh measurement.
        self.target_position: tuple[float, float, float] = anchor
        self.target_orientation: tuple[float, float, float, float] = self.anchor_orientation

    def accept(self, position: Any, orientation_wxyz: Any, now: float) -> str:
        """Take one new Pika pose; return why the anchor moved ("" if it did not).

        Called once per received message, not per re-sent goal, because the
        discontinuity test compares consecutive Pika messages.
        """
        hand = tuple(float(value) for value in position)
        if len(hand) != 3 or not all(math.isfinite(value) for value in hand):
            raise ValueError("position must have three finite components")
        orientation = normalize_quaternion(orientation_wxyz)
        reason = ""
        if self.reference_position is None:
            self.reference_position = hand
            self.reference_orientation = orientation
        else:
            reason = self._discontinuity(hand, orientation, now)
            if reason:
                self.anchor_position = self.target_position
                self.anchor_orientation = self.target_orientation
                self.reference_position = hand
                self.reference_orientation = orientation
        self.hand_position = hand
        self.hand_orientation = orientation
        self._accepted_at = now
        return reason

    def _discontinuity(self, hand: Any, orientation: Any, now: float) -> str:
        if now - self._accepted_at > self.rebase_gap_sec:
            return "silence"
        if math.dist(hand, self.hand_position) > self.jump_position_m:
            return "position jump"
        if quaternion_angle(orientation, self.hand_orientation) > self.jump_orientation_rad:
            return "orientation jump"
        return ""

    def target(
        self, *, measured_position: Any | None, measured_orientation: Any | None
    ) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
        """Return the goal pose (position, wxyz orientation) and remember it."""
        if measured_position is None or measured_orientation is None:
            # Without a recent measurement the leash cannot be enforced: hold.
            return self.target_position, self.target_orientation
        if self.hand_position is None:
            position, orientation = self.anchor_position, self.anchor_orientation
        else:
            position = tuple(
                a + (h - r)
                for a, h, r in zip(
                    self.anchor_position, self.hand_position, self.reference_position
                )
            )
            rotation = quaternion_multiply(
                self.hand_orientation, quaternion_conjugate(self.reference_orientation)
            )
            orientation = normalize_quaternion(
                quaternion_multiply(rotation, self.anchor_orientation)
            )
        measured = tuple(float(value) for value in measured_position)
        lead = tuple(c - m for c, m in zip(position, measured))
        lead_norm = _norm3(lead)
        if lead_norm > self.max_position_lead_m:
            position = tuple(
                m + value * self.max_position_lead_m / lead_norm
                for m, value in zip(measured, lead)
            )
        measured_q = normalize_quaternion(measured_orientation)
        if quaternion_angle(orientation, measured_q) > self.max_orientation_lead_rad:
            orientation = rotate_towards(measured_q, orientation, self.max_orientation_lead_rad)
        self.target_position = position
        self.target_orientation = orientation
        return position, orientation


class PikaControlRouter(Node):
    """Bridge selected Pika topics to driver sessions without touching m."""
```

- [ ] **Step 4: 运行，确认通过**

用 Step 2 的同一条命令。Expected: 新增的 `PositionTarget` 用例全部 PASS。再跑整个 `test_pika_control_router.py`（`RUN_TESTS` 只留这个文件），Expected: 通过数 = 基线 + 新增用例数，0 失败。

- [ ] **Step 5: 提交**

```bash
git add src/behavior/realman_bt/scripts/pika_control_router.py src/behavior/realman_bt/test/test_pika_control_router.py
git commit -m "$(cat <<'EOF'
feat(pika): add PositionTarget for anchored position mode

Pure target logic: anchor at the arm pose, pair the first Pika pose,
follow the hand's motion, re-anchor on a jump or a long silence, and
leash the goal to the measured TCP.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 配置、加载器与 router 参数校验

**Files:**
- Modify: `config/ros/pika_config.yaml`（末尾追加 `pika_position` 段）
- Modify: `src/behavior/realman_bt/launch/control_router.launch.py`（新增加载器；`generate_launch_description` 里接线）
- Modify: `src/behavior/realman_bt/scripts/pika_control_router.py`（`__init__` 声明参数；新增 `_validate_position_parameters`）
- Test: `src/behavior/realman_bt/test/test_pika_config.py`、`src/behavior/realman_bt/test/test_pika_control_router.py`

**Interfaces:**
- Consumes：Task 1 的 `PositionTarget` 构造参数名（`rebase_gap_sec` 等）——本任务只提供配置，不构造它。
- Produces：
  - YAML 段 `pika_position`，键 `rebase_gap_ms`（整数）、`jump_position_m`、`jump_orientation_rad`、`max_position_lead_m`、`max_orientation_lead_rad`、`pose_poll_hz`。
  - `_load_pika_position_config(config_file: Path) -> dict`，键为 `pika_position_rebase_gap_ms`、`pika_position_jump_position_m`、`pika_position_jump_orientation_rad`、`pika_position_max_position_lead_m`、`pika_position_max_orientation_lead_rad`、`pika_position_pose_poll_hz`；缺段抛 `ValueError("missing pika_position ...")`。
  - router 属性 `position_rebase_gap_ms`（int）、`position_jump_position_m`、`position_jump_orientation_rad`、`position_max_position_lead_m`、`position_max_orientation_lead_rad`、`position_pose_poll_hz`（float）。
  - `PikaControlRouter._validate_position_parameters()`；`_pika_router` 测试夹具会设置上述属性默认值。

- [ ] **Step 1: 写失败的测试**

在 `src/behavior/realman_bt/test/test_pika_config.py` 末尾追加：

```bash
cat >> src/behavior/realman_bt/test/test_pika_config.py <<'EOF'


def test_pika_position_config_is_declared_with_the_documented_defaults():
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    position = document["pika_position"]
    assert position["rebase_gap_ms"] == 1000
    assert position["jump_position_m"] == 0.10
    assert position["jump_orientation_rad"] == 0.5
    assert position["max_position_lead_m"] == 0.05
    assert position["max_orientation_lead_rad"] == 0.15
    assert position["pose_poll_hz"] == 10.0


def _load_launch_module():
    import importlib.util
    import sys

    sys.path.insert(0, str(LAUNCH.parent))
    spec = importlib.util.spec_from_file_location("control_router_launch", LAUNCH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_pika_position_loader_passes_every_router_parameter(tmp_path):
    import pytest

    module = _load_launch_module()
    loaded = module._load_pika_position_config(CONFIG)
    assert set(loaded) == {
        "pika_position_rebase_gap_ms",
        "pika_position_jump_position_m",
        "pika_position_jump_orientation_rad",
        "pika_position_max_position_lead_m",
        "pika_position_max_orientation_lead_rad",
        "pika_position_pose_poll_hz",
    }
    assert loaded["pika_position_rebase_gap_ms"] == 1000
    assert isinstance(loaded["pika_position_rebase_gap_ms"], int)
    assert "**pika_position_config" in LAUNCH.read_text(encoding="utf-8")

    missing = tmp_path / "pika_config.yaml"
    missing.write_text("pika_velocity: {}\n", encoding="utf-8")
    with pytest.raises(ValueError, match="missing pika_position"):
        module._load_pika_position_config(missing)


@pytest.mark.parametrize(
    "line, message",
    [
        ("rebase_gap_ms: 0", "rebase_gap_ms must be a positive integer"),
        ("rebase_gap_ms: 1.5", "rebase_gap_ms must be a positive integer"),
        ("jump_position_m: 0", "jump_position_m must be positive"),
        ("jump_orientation_rad: -1.0", "jump_orientation_rad must be positive"),
        ("max_position_lead_m: .nan", "max_position_lead_m must be positive"),
        ("max_orientation_lead_rad: true", "max_orientation_lead_rad must be positive"),
        ("pose_poll_hz: .inf", "pose_poll_hz must be positive"),
    ],
)
def test_pika_position_loader_rejects_unusable_values(tmp_path, line, message):
    module = _load_launch_module()
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))["pika_position"]
    key = line.split(":")[0]
    lines = [f"  {name}: {value}" for name, value in document.items() if name != key]
    broken = tmp_path / "pika_config.yaml"
    broken.write_text("pika_position:\n" + "\n".join(lines) + f"\n  {line}\n", encoding="utf-8")
    with pytest.raises(ValueError, match=message):
        module._load_pika_position_config(broken)
EOF
```

注意 `test_pika_config.py` 顶部目前没有 `import pytest`（现有测试在函数内导入）。追加后在文件顶部 `import yaml` 之后加一行 `import pytest`：

```python
import pytest
import yaml
```

用 Edit：`old_string` 为 `import yaml\n\n\nROOT = Path(__file__).parents[4]`，`new_string` 为 `import pytest\nimport yaml\n\n\nROOT = Path(__file__).parents[4]`。

再在 `src/behavior/realman_bt/test/test_pika_control_router.py` 里给夹具 `_pika_router` 补位置参数。用 Edit：

`old_string`:
```python
    router.max_angular_accel_radps2 = 0.5
    router._arms = {"l": state}
```
`new_string`:
```python
    router.max_angular_accel_radps2 = 0.5
    router.position_rebase_gap_ms = 1000
    router.position_jump_position_m = 0.10
    router.position_jump_orientation_rad = 0.5
    router.position_max_position_lead_m = 0.05
    router.position_max_orientation_lead_rad = 0.15
    router.position_pose_poll_hz = 10.0
    router._last_unavailable_log = {}
    router._arms = {"l": state}
```

并在 `test_pika_control_router.py` 末尾追加 router 校验测试：

```bash
cat >> src/behavior/realman_bt/test/test_pika_control_router.py <<'EOF'


def _position_settings_router():
    from pika_control_router import PikaControlRouter

    router = PikaControlRouter.__new__(PikaControlRouter)
    router.watchdog_ms = 3000
    router.position_rebase_gap_ms = 1000
    router.position_jump_position_m = 0.10
    router.position_jump_orientation_rad = 0.5
    router.position_max_position_lead_m = 0.05
    router.position_max_orientation_lead_rad = 0.15
    router.position_pose_poll_hz = 10.0
    return router


def test_position_rebase_gap_must_be_below_the_watchdog():
    router = _position_settings_router()
    router._validate_position_parameters()
    router.position_rebase_gap_ms = 3000  # the session would be released first
    with pytest.raises(ValueError, match="rebase_gap_ms"):
        router._validate_position_parameters()
    router.position_rebase_gap_ms = 0
    with pytest.raises(ValueError, match="rebase_gap_ms"):
        router._validate_position_parameters()


@pytest.mark.parametrize(
    "name",
    [
        "position_jump_position_m",
        "position_jump_orientation_rad",
        "position_max_position_lead_m",
        "position_max_orientation_lead_rad",
        "position_pose_poll_hz",
    ],
)
def test_position_settings_must_be_positive_and_finite(name):
    router = _position_settings_router()
    setattr(router, name, 0.0)
    with pytest.raises(ValueError, match=name):
        router._validate_position_parameters()
    setattr(router, name, float("nan"))
    with pytest.raises(ValueError, match=name):
        router._validate_position_parameters()
EOF
```

- [ ] **Step 2: 运行，确认失败**

```bash
docker run --rm -v "$PWD":/work -w /work rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && python3 -m pytest -q -p no:cacheprovider src/behavior/realman_bt/test/test_pika_config.py src/behavior/realman_bt/test/test_pika_control_router.py -k "position_config or position_loader or rebase_gap or position_settings"'
```

Expected: FAIL（`KeyError: 'pika_position'`、`AttributeError: ... _load_pika_position_config`、`AttributeError: ... _validate_position_parameters`）。

- [ ] **Step 3: 写配置段**

在 `config/ros/pika_config.yaml` 末尾追加（`pika_mixed` 段最后一行是 `pose_poll_hz: 10.0`）：

```bash
cat >> config/ros/pika_config.yaml <<'EOF'

# Pika / Position: /pika/<arm>/cartesian_pose is read as the hand's motion since
# the session started, not as an absolute target. When the session opens the
# router reads the arm's current TCP pose (the anchor), pairs the first Pika pose
# with it, and from then on the goal is anchor + how far the Pika has moved
# (translation, and rotation in the base frame). The Pika mapper's own zero (the
# default TCP in pika_default_pose) therefore no longer decides where the arm
# goes, and the session starts at rest wherever the arm is. Same IK + joint
# passthrough execution path as the other pose sessions; the driver is unchanged.
pika_position:
  # Re-anchor in place when the Pika pose stream was silent for longer than this:
  # a stopped and restarted mapper re-zeroes, so the pose may jump. The measured
  # worst Wi-Fi gap on the Pika link is about 414 ms, so 1000 ms does not fire in
  # normal use. Must be below the router watchdog (3000 ms in the launch file),
  # otherwise the session is released first and this rule never fires.
  rebase_gap_ms: 1000
  # Re-anchor in place when two consecutive Pika poses differ by more than this.
  # The goal stays continuous; the hand motion during the jump is dropped. These
  # two are first guesses: tune them from a recording of consecutive-pose deltas.
  jump_position_m: 0.10
  jump_orientation_rad: 0.5
  # The goal may lead the measured TCP by at most this distance / angle. If the
  # arm stops following (IK failure, singularity), the goal stops beside it
  # instead of running away and snapping the arm forward later. Same meaning as
  # in pika_mixed.
  max_position_lead_m: 0.05
  max_orientation_lead_rad: 0.15
  # How often the measured TCP pose is read for that leash, in Hz. Each read is
  # one get_current_pose call (joint read + forward kinematics) on the driver.
  pose_poll_hz: 10.0
EOF
```

- [ ] **Step 4: 写加载器并接线**

在 `src/behavior/realman_bt/launch/control_router.launch.py` 用三处 Edit。

1) 在 `_load_keyboard_timing` 前插入加载器。`old_string`：

```python
def _load_keyboard_timing(config_file: Path) -> tuple[int, int]:
```

`new_string`：

```python
def _load_pika_position_config(config_file: Path) -> dict[str, float | int]:
    """Return the Pika / Position router parameters from pika_config.yaml."""
    with config_file.open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream) or {}
    position = document.get("pika_position")
    if not isinstance(position, dict):
        raise ValueError(f"missing pika_position in {config_file}")
    rebase_gap_ms = position.get("rebase_gap_ms")
    if isinstance(rebase_gap_ms, bool) or not isinstance(rebase_gap_ms, int) or rebase_gap_ms <= 0:
        raise ValueError(f"{config_file}: pika_position.rebase_gap_ms must be a positive integer")
    result: dict[str, float | int] = {"pika_position_rebase_gap_ms": rebase_gap_ms}
    for config_name in (
        "jump_position_m",
        "jump_orientation_rad",
        "max_position_lead_m",
        "max_orientation_lead_rad",
        "pose_poll_hz",
    ):
        value = position.get(config_name)
        if (
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(float(value))
            or float(value) <= 0.0
        ):
            raise ValueError(f"{config_file}: pika_position.{config_name} must be positive")
        result[f"pika_position_{config_name}"] = float(value)
    return result


def _load_keyboard_timing(config_file: Path) -> tuple[int, int]:
```

2) `old_string`：`    pika_mixed_config = _load_pika_mixed_config(pika_config_file)`
   `new_string`：
```python
    pika_mixed_config = _load_pika_mixed_config(pika_config_file)
    pika_position_config = _load_pika_position_config(pika_config_file)
```

3) `old_string`：`            **pika_mixed_config,`
   `new_string`：
```python
            **pika_mixed_config,
            **pika_position_config,
```

- [ ] **Step 5: router 声明并校验参数**

在 `src/behavior/realman_bt/scripts/pika_control_router.py` 用两处 Edit。

1) `old_string`：

```python
        self._validate_mixed_parameters()
        profiles = parse_arm_profiles(
```

`new_string`：

```python
        self._validate_mixed_parameters()
        # Pika / Position: anchored relative target (see PositionTarget).
        self.position_rebase_gap_ms = int(
            self.declare_parameter("pika_position_rebase_gap_ms", 1000).value
        )
        self.position_jump_position_m = float(
            self.declare_parameter("pika_position_jump_position_m", 0.10).value
        )
        self.position_jump_orientation_rad = float(
            self.declare_parameter("pika_position_jump_orientation_rad", 0.5).value
        )
        self.position_max_position_lead_m = float(
            self.declare_parameter("pika_position_max_position_lead_m", 0.05).value
        )
        self.position_max_orientation_lead_rad = float(
            self.declare_parameter("pika_position_max_orientation_lead_rad", 0.15).value
        )
        self.position_pose_poll_hz = float(
            self.declare_parameter("pika_position_pose_poll_hz", 10.0).value
        )
        self._validate_position_parameters()
        profiles = parse_arm_profiles(
```

2) 在 `_mode_state` 前插入校验方法。`old_string`：`    def _mode_state(self, message: InputModeState) -> None:`

`new_string`：

```python
    def _validate_position_parameters(self) -> None:
        # A gap threshold at or above the watchdog never fires: the session is
        # released (and its anchor dropped) first.
        if self.position_rebase_gap_ms <= 0 or self.position_rebase_gap_ms >= self.watchdog_ms:
            raise ValueError("pika_position_rebase_gap_ms must be positive and below watchdog_ms")
        for name in (
            "position_jump_position_m",
            "position_jump_orientation_rad",
            "position_max_position_lead_m",
            "position_max_orientation_lead_rad",
            "position_pose_poll_hz",
        ):
            value = getattr(self, name)
            if not math.isfinite(value) or value <= 0.0:
                raise ValueError(f"pika_{name} must be positive and finite")

    def _mode_state(self, message: InputModeState) -> None:
```

- [ ] **Step 6: 运行，确认通过**

`RUN_TESTS`（两个测试文件）。Expected: 通过数 = 基线 + Task 1 新增 + 本任务新增，0 失败。

- [ ] **Step 7: 提交**

```bash
git add config/ros/pika_config.yaml src/behavior/realman_bt/launch/control_router.launch.py src/behavior/realman_bt/scripts/pika_control_router.py src/behavior/realman_bt/test/test_pika_config.py src/behavior/realman_bt/test/test_pika_control_router.py
git commit -m "$(cat <<'EOF'
feat(pika): add the pika_position router settings

Declare pika_position in pika_config.yaml, load it in the control-router
launch file, and validate it in the router (the rebase gap must stay below
the watchdog, everything else positive and finite).

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: router 的 session 生命周期与锚定（目标保持在锚点）

完成后行为：进入 `pikaposition` 先读臂位姿、再开 session、首个目标是锚点；session 结束/被拒/丢失都会清锚点。**此任务内手的运动还不会带动臂**（目标一直是锚点），由 Task 4 接入。

**Files:**
- Modify: `src/behavior/realman_bt/scripts/pika_control_router.py`
- Test: `src/behavior/realman_bt/test/test_pika_control_router.py`

**Interfaces:**
- Consumes：Task 1 的 `PositionTarget`；Task 2 的 `self.position_*` 属性。
- Produces：
  - `_ArmState.position: PositionTarget | None`
  - `PikaControlRouter._reset_target(state)`（由 `_reset_mixed` 改名，同时清 `position`）
  - `PikaControlRouter._pose_message(position, orientation) -> PoseStamped`（静态）
  - `PikaControlRouter._publish_position_target(arm, state, now)`：用实测新鲜度调用 `state.position.target(...)` 并经 `_publish_pose` 发布；`state.position is None` 时什么也不做。
  - 测试夹具 `_position_router(*, goal_active=False, input_ago=0.0, anchor=True, sends=None)` 返回 `(router, state, published, cancelled, sends, calls)`；`calls` 收集 `get_current_pose` 请求。

- [ ] **Step 1: 写失败的测试**

先改写 4 个编码"绝对直通"的旧测试（在 `test_pika_control_router.py` 中，当前约第 400–440 行），用 Edit 逐个替换。

1) `old_string`:
```python
    router, state, published, cancelled, _ = _pika_router(
        mode="pikaposition", kind="position", goal_active=True, input_ago=0.4
    )
    router._reconcile()
    router._reconcile()
    assert cancelled == []
    assert len(published["pose"]) == 2
    message = published["pose"][-1]
    assert message.header.frame_id == "l/base_link"
    assert message.header.stamp.sec == 42
    assert message.pose.position.x == pytest.approx(0.3)
```
`new_string`:
```python
    router, state, published, cancelled, _, _ = _position_router(
        goal_active=True, input_ago=0.4
    )
    router._reconcile()
    router._reconcile()
    assert cancelled == []
    assert len(published["pose"]) == 2
    message = published["pose"][-1]
    assert message.header.frame_id == "l/base_link"
    assert message.header.stamp.sec == 42
    # Held at the anchor: the Pika has not moved since it was paired.
    assert message.pose.position.x == pytest.approx(0.3)
```

2) `old_string`:
```python
    router, state, published, cancelled, _ = _pika_router(
        mode="pikaposition", kind="position", goal_active=True, input_ago=3.5
    )
    router._reconcile()
    assert cancelled == [True]
```
`new_string`:
```python
    router, state, published, cancelled, _, _ = _position_router(
        goal_active=True, input_ago=3.5
    )
    router._reconcile()
    assert cancelled == [True]
    # The anchor goes with the session: the arm may move before the next one.
    assert state.position is None
```

3) `old_string`:
```python
    router, state, published, cancelled, sends = _pika_router(mode="pikaposition")
    router._reconcile()
    assert len(sends) == 1
    assert sends[0].watchdog_ms == 100
```
`new_string`:
```python
    router, state, published, cancelled, sends, _ = _position_router()
    router._reconcile()
    assert len(sends) == 1
    assert sends[0].watchdog_ms == 100
```

4) `old_string`:
```python
def test_a_pose_session_publishes_the_cached_target_on_acceptance():
    router, state, published, cancelled, sends = _pika_router(mode="pikaposition")
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=True, get_result_async=lambda: Future()))
    state.pending_goal = pending
    router._goal_response("l", "position", pending)
    assert state.active_kind == "position"
    assert len(published["pose"]) == 1
```
`new_string`:
```python
def test_a_pose_session_starts_by_publishing_the_anchor():
    router, state, published, cancelled, sends, _ = _position_router()
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=True, get_result_async=lambda: Future()))
    state.pending_goal = pending
    router._goal_response("l", "position", pending)
    assert state.active_kind == "position"
    assert len(published["pose"]) == 1
    position = published["pose"][0].pose.position
    assert (position.x, position.y, position.z) == pytest.approx((0.3, 0.0, 0.4))
```

然后在文件末尾追加夹具和新测试：

```bash
cat >> src/behavior/realman_bt/test/test_pika_control_router.py <<'EOF'


def _position_router(*, goal_active=False, input_ago=0.0, anchor=True, sends=None):
    """Router in pikaposition with one l arm and fake transports."""
    router, state, published, cancelled, sends = _pika_router(
        mode="pikaposition",
        kind="position",
        goal_active=goal_active,
        input_ago=input_ago,
        sends=sends,
    )
    calls = []

    def call_async(request):
        calls.append(request)
        return Future()

    state.current_pose_client = SimpleNamespace(
        service_is_ready=lambda: True, call_async=call_async
    )
    if anchor:
        state.position = _position_target()
        state.measured_position = (0.3, 0.0, 0.4)
        state.measured_orientation = _IDENTITY_Q
        state.measured_at = time.monotonic()
    return router, state, published, cancelled, sends, calls


def test_position_mode_anchors_at_the_current_pose_before_requesting_a_session():
    router, state, published, cancelled, sends, calls = _position_router(anchor=False)
    router._reconcile()
    assert sends == []
    assert len(calls) == 1
    assert calls[0].reference_name == "base"
    response = SimpleNamespace(
        success=True, pose_position_m=[0.31, 0.02, 0.41], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    )
    # set_result fires the router's own done callback, as rclpy's future would.
    state.anchor_future.set_result(response)
    assert state.anchor_future is None
    assert state.mixed is None
    assert state.position.anchor_position == pytest.approx((0.31, 0.02, 0.41))
    assert state.measured_orientation == pytest.approx((1.0, 0.0, 0.0, 0.0))
    router._reconcile()
    assert len(sends) == 1
    # A pose session: BASE reference with the driver watchdog.
    assert sends[0].reference_name == "base"
    assert sends[0].watchdog_ms == 100


def test_a_failed_position_anchor_read_backs_off_instead_of_starting_blind():
    router, state, published, cancelled, sends, calls = _position_router(anchor=False)
    router._reconcile()
    state.anchor_future.set_result(SimpleNamespace(success=False))
    assert state.position is None
    assert state.retry_after > time.monotonic()
    router._reconcile()
    assert sends == []


def test_a_late_position_anchor_from_a_previous_activation_is_ignored():
    from realman_msgs.msg import InputModeState

    router, state, published, cancelled, sends, calls = _position_router(anchor=False)
    router._reconcile()
    stale_future = state.anchor_future
    router._mode_state(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    stale_future.set_result(SimpleNamespace(
        success=True, pose_position_m=[9.0, 9.0, 9.0], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    ))
    assert state.position is None


def test_a_rejected_position_goal_drops_the_anchor_and_backs_off():
    router, state, published, cancelled, sends, calls = _position_router()
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=False))
    router._goal_response("l", "position", pending)
    # The arm may move before the retry, so the next session re-anchors.
    assert state.position is None
    assert state.retry_after > time.monotonic()


def test_a_driver_ended_position_session_drops_the_anchor():
    router, state, published, cancelled, sends, calls = _position_router(goal_active=True)
    finished = Future()
    finished.set_result(SimpleNamespace(result=SimpleNamespace(
        success=False, message="pose command watchdog expired", terminal_state=3,
    )))
    router._goal_finished("l", "position", finished)
    assert state.position is None
    assert state.retry_after > time.monotonic()


def test_a_stale_position_anchor_is_dropped_when_the_stream_is_lost_before_a_session():
    router, state, published, cancelled, sends, calls = _position_router(input_ago=3.5)
    router._reconcile()
    assert state.position is None
    assert sends == []


def test_a_mode_change_drops_the_position_anchor():
    from realman_msgs.msg import InputModeState

    router, state, published, cancelled, sends, calls = _position_router()
    router._mode_state(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    assert state.position is None
EOF
```

- [ ] **Step 2: 运行，确认失败**

```bash
docker run --rm -v "$PWD":/work -w /work rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && python3 -m pytest -q -p no:cacheprovider src/behavior/realman_bt/test/test_pika_control_router.py -k "pose_target_is_held or lost_pose_stream or pose_goal_uses or pose_session_starts or position_mode_anchors or failed_position_anchor or late_position_anchor or rejected_position_goal or driver_ended_position_session or stale_position_anchor or mode_change_drops"'
```

Expected: FAIL（`AttributeError: ... has no attribute 'position'` 等）。

- [ ] **Step 3: 实现**

在 `src/behavior/realman_bt/scripts/pika_control_router.py`：

1) `_ArmState` 加字段。`old_string`：
```python
    mixed: "MixedTarget | None" = None
    anchor_future: Any = None
```
`new_string`：
```python
    mixed: "MixedTarget | None" = None
    # Position mode: the anchored target. It shares the anchor, measurement and
    # retry fields with mixed mode; only one of the two is set at a time.
    position: "PositionTarget | None" = None
    anchor_future: Any = None
```

2) 重命名。先用 Edit（`replace_all: true`）把 `_reset_mixed` 全部替换为 `_reset_target`（定义加 4 处调用）。然后补函数体，`old_string`：
```python
    def _reset_target(state: _ArmState) -> None:
        state.mixed = None
```
`new_string`：
```python
    def _reset_target(state: _ArmState) -> None:
        """Forget the anchored target of either mode; the next session re-anchors."""
        state.mixed = None
        state.position = None
```

3) `_reconcile_position`。`old_string`：
```python
        """Hold one pose session while the Pika stream is alive.

        The latest target is re-sent at the control period, so a Pika gap
        longer than the driver's 100 ms pose watchdog holds the arm at its
        last target instead of ending (and later re-opening) the session.
        """
        age = self._age(state, now)
        lost = age >= self.watchdog_ms / 1000.0
        if state.active_kind == "position" and state.goal_handle is not None:
            if lost or state.latest_pose is None:
                self._cancel(state)
            else:
                self._publish_pose(arm, state, state.latest_pose)
            return
        if lost or state.latest_pose is None:
            return
        if not self._can_request(state, now):
            return
        if not state.pose_client.server_is_ready():
```
`new_string`：
```python
        """Hold one pose session anchored at the arm's pose when it started.

        The session opens only after the arm's current pose has been read (the
        anchor). The goal is then the anchor plus the hand's motion, re-sent at
        the control period, so a Pika gap longer than the driver's 100 ms pose
        watchdog holds the arm at its last goal instead of ending (and later
        re-opening) the session. Losing the stream for ``watchdog_ms`` releases
        the session and drops the anchor.
        """
        age = self._age(state, now)
        lost = age >= self.watchdog_ms / 1000.0
        if state.active_kind == "position" and state.goal_handle is not None:
            if lost or state.position is None:
                self._cancel(state)
                self._reset_target(state)
                return
            self._poll_measured_pose(arm, state, now)
            self._publish_position_target(arm, state, now)
            return
        if lost:
            # The arm may be moved while there is no session; never reuse an
            # anchor read before the stream was lost.
            self._reset_target(state)
            return
        if state.latest_pose is None:
            return
        if not self._can_request(state, now):
            return
        if state.position is None:
            # Anchor the target at the arm's current TCP, so the session starts
            # exactly where the arm is.
            self._request_anchor(arm, state)
            return
        if not state.pose_client.server_is_ready():
```

4) `_on_anchor` 分发与日志。`old_string`：
```python
            self.get_logger().error(f"Pika mixed anchor pose failed for {arm}: {error}")
```
`new_string`：
```python
            self.get_logger().error(f"Pika {self.mode} anchor pose failed for {arm}: {error}")
```
`old_string`：
```python
                f"Pika mixed mode could not read the current pose of {arm}; "
```
`new_string`：
```python
                f"Pika {self.mode} could not read the current pose of {arm}; "
```
`old_string`：
```python
        position, orientation = pose
        state.mixed = MixedTarget(position, orientation)
```
`new_string`：
```python
        position, orientation = pose
        if self.mode == "pikaposition":
            state.position = PositionTarget(
                position,
                orientation,
                rebase_gap_sec=self.position_rebase_gap_ms / 1000.0,
                jump_position_m=self.position_jump_position_m,
                jump_orientation_rad=self.position_jump_orientation_rad,
                max_position_lead_m=self.position_max_position_lead_m,
                max_orientation_lead_rad=self.position_max_orientation_lead_rad,
            )
        else:
            state.mixed = MixedTarget(position, orientation)
```

5) 新增发布方法，插在 `_goal_response` 之前。`old_string`：`    def _goal_response(self, arm: str, kind: str, future: Any) -> None:`
`new_string`：
```python
    @staticmethod
    def _pose_message(position: Any, orientation: Any) -> PoseStamped:
        message = PoseStamped()
        (message.pose.position.x, message.pose.position.y, message.pose.position.z) = position
        w, x, y, z = orientation
        message.pose.orientation.w = w
        message.pose.orientation.x = x
        message.pose.orientation.y = y
        message.pose.orientation.z = z
        return message

    def _publish_position_target(self, arm: str, state: _ArmState, now: float) -> None:
        """Publish the anchored goal, leashed to a measurement that is still fresh."""
        if state.position is None:
            return
        fresh = (
            state.measured_position is not None
            and now - state.measured_at <= _MEASUREMENT_MAX_AGE_SEC
        )
        position, orientation = state.position.target(
            measured_position=state.measured_position if fresh else None,
            measured_orientation=state.measured_orientation if fresh else None,
        )
        self._publish_pose(arm, state, self._pose_message(position, orientation))

    def _goal_response(self, arm: str, kind: str, future: Any) -> None:
```

6) `_goal_response`。`old_string`：
```python
            if kind == "mixed":
                # Re-anchor next time: the arm may move before the retry.
                self._reset_target(state)
```
`new_string`：
```python
            if kind in ("mixed", "position"):
                # Re-anchor next time: the arm may move before the retry.
                self._reset_target(state)
```
`old_string`：
```python
        if kind == "position" and state.latest_pose is not None:
            self._publish_pose(arm, state, state.latest_pose)
```
`new_string`：
```python
        if kind == "position":
            # The first target is the anchor itself, so the session starts at
            # rest exactly where the arm is.
            self._publish_position_target(arm, state, time.monotonic())
```

7) `_goal_finished`。`old_string`：
```python
        state.cancel_pending = None
        if kind == "mixed":
            self._reset_target(state)
        try:
```
`new_string`：
```python
        state.cancel_pending = None
        if kind in ("mixed", "position"):
            self._reset_target(state)
        try:
```

8) `_pose` 的位置分支暂时不再原样转发 Pika 绝对位姿（Task 4 接入锚点）。`old_string`：
```python
        if not self.dry_run and state.active_kind == "position" and state.goal_handle is not None:
            # Forward immediately for latency; _reconcile_position keeps
            # re-sending it between Pika messages.
            self._publish_pose(arm, state, message)
        else:
            self._reconcile()
```
`new_string`：
```python
        # The goal is computed from the anchor, never forwarded raw; the hand's
        # motion is folded in by the ingress step that follows this one.
        self._reconcile()
```

- [ ] **Step 4: 运行，确认通过**

`RUN_TESTS`（两个测试文件）。Expected: 全部通过，0 失败；特别确认所有 `mixed` 用例仍通过（`_reset_target` 改名不改变其行为）。

- [ ] **Step 5: 提交**

```bash
git add src/behavior/realman_bt/scripts/pika_control_router.py src/behavior/realman_bt/test/test_pika_control_router.py
git commit -m "$(cat <<'EOF'
feat(pika): anchor pikaposition at the arm pose when the session opens

Read the arm's current pose before opening a position session, start the
session at that pose, and drop the anchor when the session ends, is
rejected, or the stream is lost. Rename _reset_mixed to _reset_target so
it clears both modes. The hand's motion is wired in by the next change.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 入口——手的运动带动目标、重锚、坏帧、实测轮询频率

**Files:**
- Modify: `src/behavior/realman_bt/scripts/pika_control_router.py`
- Test: `src/behavior/realman_bt/test/test_pika_control_router.py`

**Interfaces:**
- Consumes：Task 1 `PositionTarget.accept(...)`；Task 3 `_publish_position_target(arm, state, now)`、`_position_router(...)`、`_pika_router` 夹具（已含 `router._last_unavailable_log = {}`）。
- Produces：
  - `PikaControlRouter._warn_throttled(arm, key, text)`：每 `(arm, key)` 至少间隔 1 s 记一条 warning。
  - `PikaControlRouter._pose_poll_hz() -> float`：`pikaposition` 用 `position_pose_poll_hz`，其余用 `mixed_pose_poll_hz`。
  - `_pose()` 对 `pikaposition`：校验位置有限、四元数可归一化，非法帧忽略并告警，且不刷新 `last_input_at`/`latest_pose`；合法帧调 `state.position.accept(...)`，重锚时记 warning（含 `re-anchored`）；session 活跃且非 dry-run 时立刻发布目标。
  - 测试辅助 `_pika_pose(x=0.0, y=0.0, z=0.0, orientation=(1.0, 0.0, 0.0, 0.0)) -> PoseStamped`。

- [ ] **Step 1: 写失败的测试**

```bash
cat >> src/behavior/realman_bt/test/test_pika_control_router.py <<'EOF'


def _pika_pose(x=0.0, y=0.0, z=0.0, orientation=(1.0, 0.0, 0.0, 0.0)):
    from geometry_msgs.msg import PoseStamped

    message = PoseStamped()
    message.pose.position.x, message.pose.position.y, message.pose.position.z = x, y, z
    (
        message.pose.orientation.w,
        message.pose.orientation.x,
        message.pose.orientation.y,
        message.pose.orientation.z,
    ) = orientation
    return message


def test_position_mode_moves_the_goal_by_the_hand_motion_not_its_absolute_pose():
    router, state, published, cancelled, sends, calls = _position_router(goal_active=True)
    # The Pika's absolute position is far from the arm's: only its motion counts.
    router._pose("l", _pika_pose(5.0, 2.0, 1.0))  # pairs with the anchor
    first = published["pose"][-1]
    assert first.header.frame_id == "l/base_link"
    assert first.pose.position.x == pytest.approx(0.3)
    router._pose("l", _pika_pose(5.02, 2.01, 0.99))
    position = published["pose"][-1].pose.position
    assert (position.x, position.y, position.z) == pytest.approx((0.32, 0.01, 0.39))
    # Between Pika messages the same goal is re-sent.
    router._reconcile()
    resent = published["pose"][-1].pose.position
    assert (resent.x, resent.y, resent.z) == pytest.approx((0.32, 0.01, 0.39))


def test_a_pika_pose_jump_re_anchors_the_running_session_in_place():
    router, state, published, cancelled, sends, calls = _position_router(goal_active=True)
    warnings = []
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=warnings.append, error=lambda _m: None
    )
    router._pose("l", _pika_pose(0.0, 0.0, 0.0))
    router._pose("l", _pika_pose(0.03, 0.0, 0.0))
    assert published["pose"][-1].pose.position.x == pytest.approx(0.33)
    state.measured_position = (0.33, 0.0, 0.4)  # the arm has followed
    # The mapper was zeroed again: the Pika pose jumps 0.6 m.
    router._pose("l", _pika_pose(0.6, 0.0, 0.0))
    assert published["pose"][-1].pose.position.x == pytest.approx(0.33)
    assert any("re-anchored" in message for message in warnings)
    assert cancelled == []  # same session, no restart
    router._pose("l", _pika_pose(0.61, 0.0, 0.0))
    assert published["pose"][-1].pose.position.x == pytest.approx(0.34)


def test_bad_position_poses_are_ignored_and_do_not_refresh_the_input():
    router, state, published, cancelled, sends, calls = _position_router(
        goal_active=True, input_ago=1.0
    )
    warnings = []
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=warnings.append, error=lambda _m: None
    )
    before = state.last_input_at
    latest = state.latest_pose
    router._pose("l", _pika_pose(float("nan"), 0.0, 0.0))
    router._pose("l", _pika_pose(0.0, 0.0, 0.0, orientation=(0.0, 0.0, 0.0, 0.0)))
    assert state.last_input_at == before
    assert state.latest_pose is latest
    assert state.position.hand_position is None
    assert published["pose"] == []
    # The warning is rate limited, not once per 20 Hz message.
    assert len(warnings) == 1


def test_a_pose_arriving_before_the_anchor_is_cached_and_triggers_the_anchor_read():
    router, state, published, cancelled, sends, calls = _position_router(anchor=False)
    message = _pika_pose(0.5, 0.0, 0.0)
    router._pose("l", message)
    assert state.latest_pose is message
    assert state.position is None
    assert published["pose"] == []
    assert len(calls) == 1


def test_position_ingress_does_not_publish_in_dry_run():
    router, state, published, cancelled, sends, calls = _position_router(goal_active=True)
    router.dry_run = True
    router._pose("l", _pika_pose(0.0, 0.0, 0.0))
    assert published["pose"] == []
    assert state.position.hand_position == pytest.approx((0.0, 0.0, 0.0))


def test_position_mode_polls_the_measured_pose_at_its_own_rate():
    router, state, published, cancelled, sends, calls = _position_router(goal_active=True)
    router.position_pose_poll_hz = 2.0
    state.next_measure_at = 0.0
    before = time.monotonic()
    router._reconcile()
    assert len(calls) == 1
    assert state.next_measure_at - before == pytest.approx(0.5, abs=0.05)
    state.measure_future.set_result(SimpleNamespace(
        success=True, pose_position_m=[0.31, 0.0, 0.4], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    ))
    assert state.measured_position == pytest.approx((0.31, 0.0, 0.4))
    router._reconcile()
    # Polling is rate limited, not once per 10 ms tick.
    assert len(calls) == 1
EOF
```

- [ ] **Step 2: 运行，确认失败**

```bash
docker run --rm -v "$PWD":/work -w /work rm65-humble-rviz:local bash -lc 'source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash && python3 -m pytest -q -p no:cacheprovider src/behavior/realman_bt/test/test_pika_control_router.py -k "moves_the_goal_by_the_hand or re_anchors_the_running or bad_position_poses or before_the_anchor or position_ingress_does_not or polls_the_measured_pose_at_its_own"'
```

Expected: FAIL（目标没有随手位姿移动；轮询频率断言失败；`_warn_throttled` 缺失）。

- [ ] **Step 3: 实现**

在 `pika_control_router.py`：

1) 轮询频率。`old_string`：`        state.next_measure_at = now + 1.0 / self.mixed_pose_poll_hz`
`new_string`：`        state.next_measure_at = now + 1.0 / self._pose_poll_hz()`

在 `_current_pose_request` 之前插入方法。`old_string`：`    def _current_pose_request(self) -> Any:`
`new_string`：
```python
    def _pose_poll_hz(self) -> float:
        """Measured-pose polling rate of the active mode (the leash input)."""
        if self.mode == "pikaposition":
            return self.position_pose_poll_hz
        return self.mixed_pose_poll_hz

    def _current_pose_request(self) -> Any:
```

2) 节流告警 + `_pose` 入口。先在 `_pose` 前插入 `_warn_throttled`。`old_string`：`    def _pose(self, arm: str, message: PoseStamped) -> None:`
`new_string`：
```python
    def _warn_throttled(self, arm: str, key: str, text: str) -> None:
        now = time.monotonic()
        if now - self._last_unavailable_log.get((arm, key), 0.0) >= 1.0:
            self._last_unavailable_log[(arm, key)] = now
            self.get_logger().warning(text)

    def _pose(self, arm: str, message: PoseStamped) -> None:
```

3) `_pose` 头部校验。`old_string`：
```python
        state = self._arms[arm]
        if self.mode == "pikamixed":
            orientation = message.pose.orientation
            try:
                normalize_quaternion((orientation.w, orientation.x, orientation.y, orientation.z))
            except ValueError as error:
                self.get_logger().warning(f"Ignoring Pika mixed orientation for {arm}: {error}")
                return
        now = time.monotonic()
```
`new_string`：
```python
        state = self._arms[arm]
        orientation = message.pose.orientation
        if self.mode == "pikamixed":
            try:
                normalize_quaternion((orientation.w, orientation.x, orientation.y, orientation.z))
            except ValueError as error:
                self.get_logger().warning(f"Ignoring Pika mixed orientation for {arm}: {error}")
                return
        hand = None
        if self.mode == "pikaposition":
            # Position mode folds the pose into the target, so a bad frame must
            # be dropped here, before it can refresh the input timestamps.
            position = message.pose.position
            try:
                values = (float(position.x), float(position.y), float(position.z))
                if not all(math.isfinite(value) for value in values):
                    raise ValueError("position must be finite")
                hand = (
                    values,
                    normalize_quaternion(
                        (orientation.w, orientation.x, orientation.y, orientation.z)
                    ),
                )
            except ValueError as error:
                self._warn_throttled(arm, "bad_pose", f"Ignoring Pika position pose for {arm}: {error}")
                return
        now = time.monotonic()
```

4) `_pose` 尾部。`old_string`（Task 3 留下的）：
```python
        # The goal is computed from the anchor, never forwarded raw; the hand's
        # motion is folded in by the ingress step that follows this one.
        self._reconcile()
```
`new_string`：
```python
        if state.position is not None:
            reason = state.position.accept(hand[0], hand[1], now)
            if reason:
                self.get_logger().warning(
                    f"Pika position target for {arm} re-anchored: {reason}"
                )
        if not self.dry_run and state.active_kind == "position" and state.goal_handle is not None:
            # Fold the hand's motion into the goal and forward it immediately
            # for latency; _reconcile_position keeps re-sending it between
            # Pika messages.
            self._publish_position_target(arm, state, now)
        else:
            self._reconcile()
```

- [ ] **Step 4: 运行，确认通过**

`RUN_TESTS`（两个测试文件）。Expected: 全部通过，0 失败，通过数 = 基线 + 全部新增。

另跑一次源码文本断言，确认那一行还在：

```bash
grep -n 'if self.mode != "pikaposition" and self.mode != "pikamixed":' src/behavior/realman_bt/scripts/pika_control_router.py
```

Expected: 恰好一行。

- [ ] **Step 5: 提交**

```bash
git add src/behavior/realman_bt/scripts/pika_control_router.py src/behavior/realman_bt/test/test_pika_control_router.py
git commit -m "$(cat <<'EOF'
feat(pika): fold the hand's motion into the anchored position goal

Position-mode ingress now validates each pose, feeds PositionTarget.accept
once per message (re-anchoring on a jump or a long silence), publishes the
leashed goal immediately, and polls the measured pose at pika_position's
own rate.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 链路探针脚本适配相对语义

`scripts/simulate_pika_pose.py` 现在持续发固定绝对位姿。位置模式改成相对语义后，首帧成为 `p0`，偏移被当作零，臂不会动，会让人误判"链路坏了"。

**Files:**
- Modify: `scripts/simulate_pika_pose.py`

**Interfaces:**
- Consumes：无。
- Produces：模块常量 `BASELINE_SEC = 2.0`；脚本先发 `BASELINE_SEC` 秒基线位姿，再发偏移 `delta_mm` 的位姿，共 5 s。命令行用法不变。

- [ ] **Step 1: 改脚本**

1) 文档字符串。`old_string`：
```
  delta_mm  how far to offset the current tool pose (default 5.0 mm). The pose is
            only offset on the axis with the largest reach; use a small value.
```
`new_string`：
```
  delta_mm  how far the simulated hand moves along x after the baseline (default
            5.0 mm); use a small value.

pikaposition reads the stream as hand motion relative to the first pose it sees
(the arm is anchored at its current pose), so the script holds a baseline pose
for BASELINE_SEC and only then steps by delta_mm. The absolute x value is
irrelevant; a constant pose would never move the arm.
```

2) 常量。`old_string`：
```python
class ChainProbe(Node):
```
`new_string`：
```python
# Seconds of constant baseline pose before the simulated hand steps by delta_mm.
BASELINE_SEC = 2.0


class ChainProbe(Node):
```

3) 位姿注释与初值。`old_string`：
```python
        # A nominal pose in the arm's base frame; the driver accepts only
        # frame_id == "<arm>/base_link". Real position is irrelevant here: the
        # point is to see whether the stream is accepted and forwarded.
        target = PoseStamped()
        target.header.frame_id = f"{self.arm}/base_link"
        target.pose.position.x = 0.2 + self.delta
```
`new_string`：
```python
        # A nominal pose in the arm's base frame; the driver accepts only
        # frame_id == "<arm>/base_link". The absolute position is irrelevant:
        # the router pairs the first pose with the arm's current pose and moves
        # the arm by the change from there.
        target = PoseStamped()
        target.header.frame_id = f"{self.arm}/base_link"
        target.pose.position.x = 0.2
```

4) 日志与循环。`old_string`：
```python
            f"streaming PoseStamped -> /pika/{self.arm}/cartesian_pose for 5s "
            f"(frame={target.header.frame_id})"
        )
        period = 0.02  # 50 Hz, matching pika's streaming cadence
        while time.monotonic() - self.t0 < 5.0:
            target.header.stamp = self.get_clock().now().to_msg()
```
`new_string`：
```python
            f"streaming PoseStamped -> /pika/{self.arm}/cartesian_pose for 5s "
            f"(frame={target.header.frame_id}, baseline {BASELINE_SEC:.0f}s then "
            f"+{self.delta * 1000.0:.1f}mm)"
        )
        period = 0.02  # 50 Hz, matching pika's streaming cadence
        while time.monotonic() - self.t0 < 5.0:
            stepped = time.monotonic() - self.t0 >= BASELINE_SEC
            target.pose.position.x = 0.2 + (self.delta if stepped else 0.0)
            target.header.stamp = self.get_clock().now().to_msg()
```

- [ ] **Step 2: 语法检查**

脚本顶层导入 `rclpy`，本机无法运行，只做语法检查（用 `ast.parse` 避免生成 `__pycache__`）：

```bash
python3 -c "import ast; ast.parse(open('scripts/simulate_pika_pose.py', encoding='utf-8').read()); print('ok')"
```

Expected: `ok`。

- [ ] **Step 3: 提交**

```bash
git add scripts/simulate_pika_pose.py
git commit -m "$(cat <<'EOF'
fix(scripts): step the simulated Pika hand after a baseline

pikaposition now reads /pika/<arm>/cartesian_pose as motion relative to
the first pose, so a constant pose never moves the arm. Hold a baseline
for two seconds, then step by delta_mm.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 文档同步

**Files:**
- Modify: `website/docs/development/pika-teleop.md`
- Modify: `website/docs/reference/configuration.md`

**Interfaces:**
- Consumes：Task 2 的配置键与默认值、Task 1/3/4 的行为。
- Produces：无代码接口。

- [ ] **Step 1: 改 `pika-teleop.md`**

五处 Edit。

1) 流程图节点。`old_string`：`  M -- pikaposition --> P["CartesianPose<br/>IK + CANFD 透传"]`
`new_string`：`  M -- pikaposition --> P["CartesianPose<br/>启用时锚定臂位姿<br/>IK + CANFD 透传"]`

2) 模式表。`old_string`：
```
| `pikaposition` | Pika / 位置控制 | `cartesian_pose`（绝对位姿） | `CartesianPose`：IK + `rm_movej_canfd` 关节透传 | 末端绝对位置跟随 |
```
`new_string`：
```
| `pikaposition` | Pika / 位置控制 | `cartesian_pose`（手相对启用时的位移） | `CartesianPose`：IK + `rm_movej_canfd` 关节透传，目标锚定在启用时的臂位姿 | 末端位置跟随，启用时臂原地起步、不跳变 |
```

3) 保持规则表两格。`old_string`：
```
| 输入新鲜 | 按 `10 ms` 周期重打时间戳后重发最新速度，DDS 抖动不会触发 driver `100 ms` watchdog | 立即转发，并按周期重发最新目标位姿 |
```
`new_string`：
```
| 输入新鲜 | 按 `10 ms` 周期重打时间戳后重发最新速度，DDS 抖动不会触发 driver `100 ms` watchdog | 立即按锚点换算并转发目标位姿，并按周期重发 |
```
`old_string`：
```
| 输入丢失 | 晚于 `input_timeout_ms`（`3000 ms`）发布零速度并取消 | 晚于 router `watchdog_ms`（`3000 ms`）取消 |
```
`new_string`：
```
| 输入丢失 | 晚于 `input_timeout_ms`（`3000 ms`）发布零速度并取消 | 晚于 router `watchdog_ms`（`3000 ms`）取消，并丢弃锚点（下次重新读臂位姿） |
```

4) 新增位置模式一节，插在"Session 保持与重发规则"之前。`old_string`：`## Session 保持与重发规则`
`new_string`：

```markdown
## 位置模式（`pikaposition`）

位置模式把 `/pika/<arm>/cartesian_pose` 当作**手相对启用时刻的位移**，叠加到启用时臂的 TCP 位姿上，作为一个
绝对位姿 session 的目标（`/<arm>/cartesian_pose`，IK + `rm_movej_canfd` 关节透传；driver 契约不变，
`/<arm>/cartesian_pose/command` 仍是绝对基座系目标，由 router 计算后发布）：

| 自由度 | 处理 |
| --- | --- |
| 位置 | `A_pos + (p − p0)`，基座系；`p` 是当前 Pika 位置，`p0` 是与锚点配对的第一条 Pika 位置 |
| 姿态 | `(q · q0⁻¹) · A_q`，与 Mixed 的姿态映射相同；Pika 在基座系中转多少，机械臂就转多少 |

`A` 是锚点：session 开始前 router 调用 `/<arm>/get_current_pose`（BASE）读到的 TCP 位姿；`(p0, q0)` 是锚点之后
第一条有效 Pika 位姿。因此 Pika 发送端 mapper 的零位（`pika_default_pose` 的默认 TCP）不再决定臂的绝对落点：
无论臂在哪里启用，第一个目标都是锚点本身，臂原地起步。**代价**：手与臂的绝对对应关系每次启用都会改变。

生命周期：

1. 进入模式时和其它 Pika 模式一样，先由 `ThreeArmMoveJ` 到 `pika_default_pose`，再激活。
2. 第一条有效输入到达后，router 读锚点，再建立位姿 session。锚点读取失败时退避 `0.5 s` 重试，不会盲目起步。
3. session 结束（driver 中止、watchdog、被拒绝）、模式切换或输入丢失 `watchdog_ms`，都会丢弃锚点；下一个 session
   重新读臂位姿，不会回到旧目标。
4. **会话内重新锚定**：Mapper 手势停止再启动会重新清零，Pika 位姿会突然跳变，而 router 的 session 可能还没释放。
   对每一条新到的有效 Pika 位姿，满足下列任一条件就在 session 内原地重新锚定：与上一条有效位姿相比位置变化超过
   `jump_position_m`、姿态变化超过 `jump_orientation_rad`，或与上一条相隔超过 `rebase_gap_ms`。重新锚定时锚点取
   router **上一条已发布的目标**，所以指令流连续、臂不会动；跳变期间的手部位移被丢弃（类似离合器），日志里有
   `Pika position target for <arm> re-anchored: <原因>`。
5. **牵引约束**：router 以 `pose_poll_hz` 读取实测 TCP 位姿，目标位置最多领先实测 `max_position_lead_m`，目标姿态
   最多领先实测 `max_orientation_lead_rad`。位置模式的目标是手位姿的无状态函数，牵引只是输出夹持，不会累积漂移；
   IK 失败或奇异导致机械臂停住时，目标停在臂旁，恢复可达后不会猛追。超过 `1 s` 没有有效实测时目标保持不动。
6. 非法 Pika 消息（位置含 NaN/inf，或四元数为零）被忽略并按每臂 `1 s` 限频告警，且不刷新输入时间戳。

权威配置是 [`config/ros/pika_config.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/pika_config.yaml) 的 `pika_position`：

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `rebase_gap_ms` | `1000` | 两条 Pika 位姿相隔超过此值即重锚；必须小于 router 的 `watchdog_ms`（`3000`），否则启动被拒绝 |
| `jump_position_m` | `0.10` | 相邻位姿位置跳变超过此值即重锚（初值，待真机数据调整） |
| `jump_orientation_rad` | `0.5` | 相邻位姿姿态跳变超过此值即重锚（初值，待真机数据调整） |
| `max_position_lead_m` | `0.05` | 目标可领先实测 TCP 的最大距离 |
| `max_orientation_lead_rad` | `0.15` | 目标姿态可领先实测 TCP 姿态的最大角度 |
| `pose_poll_hz` | `10` | 牵引约束的实测位姿读取频率 |

已知限制：`pose_poll_hz` 的每次读取是一次 `get_current_pose`（关节读取加 FK），与 CANFD 流共用 driver 适配器的
SDK 锁，读状态变慢会影响透传（Mixed 模式同样如此）；实测最多滞后约 `100 ms`，跟随速度上限大致为
`max_position_lead_m / 滞后`。`scripts/simulate_pika_pose.py` 会先发 `2 s` 基线位姿再阶跃偏移，用于验证
mapper→router→driver→臂的链路；恒定位姿不会让臂动。

## Session 保持与重发规则
```

- [ ] **Step 2: 改 `configuration.md`**

`old_string`：`Pika 入场姿态 `pika_default_pose`、`pika_velocity`、`pika_mixed``
`new_string`：`Pika 入场姿态 `pika_default_pose`、`pika_velocity`、`pika_mixed`、`pika_position``

- [ ] **Step 3: 检查**

```bash
git diff --check
grep -n "pika_position" website/docs/reference/configuration.md website/docs/development/pika-teleop.md | head
```

Expected: `git diff --check` 无输出；`grep` 列出 `configuration.md` 与 `pika-teleop.md` 的命中行。

如果本机已装 Node 依赖，再构建文档站检查死链（worktree 里没有 `node_modules`，首次需要 `npm ci`；装不上就在说明里写明没跑）：

```bash
cd website && npm ci && npm run build
```

Expected: 构建成功，无死链错误。`npm run test:e2e` 需要 Playwright 浏览器，这次只改了一个已有页面的内容，没有新增页面、路由或侧栏，可以不跑，在提交说明里注明。

- [ ] **Step 4: 提交**

```bash
git add website/docs/development/pika-teleop.md website/docs/reference/configuration.md
git commit -m "$(cat <<'EOF'
docs(pika): document the anchored position mode

Describe the anchor, in-session re-anchoring, the leash and the new
pika_position settings, and correct the mode table that called the
position stream an absolute target.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: 上线与验证清单（不是代码任务，实现者不要自行执行真机步骤）

这些步骤需要真机、人在急停旁，并由用户明确批准。实现者只负责把 Task 1–6 做完并报告，不执行本任务。

- [ ] **A. 部署**：生产容器内的 `src/` 落后于仓库，只能按 hunk 把 `pika_control_router.py`、`control_router.launch.py`、`pika_config.yaml` 的改动打进去，不能整文件覆盖；`config/ros` 是宿主机 `~/realman_pi/config/ros` 的读写挂载，改宿主机文件。先备份到 `~/deploy-backups/`。部署后重启 router。**注意**：仓库主检出里有一份未提交的 Pika 速度 `follow` 改动（`_velocity_goal`、`pika_velocity.follow`、`_load_pika_velocity_config`），与本分支改的是同一批文件的不同代码块，合并时预计无冲突，但打补丁到生产时不要把它们当成本次改动的一部分。
- [ ] **B. mock / dry-run**：`REALMAN_BT_DRY_RUN=true`（默认）下进入 `pikaposition`，用 `scripts/simulate_pika_pose.py` 确认 router 先发起 `get_current_pose`、日志无异常，且 dry-run 时不发布位姿。
- [ ] **C. 真机零指令台架**（需批准）：左臂、左 Pika 已启用但不动，`REALMAN_BT_DRY_RUN=false` 进入 `pikaposition`，记录前 2 秒关节角，期望相对锚点变化接近 0。记忆 `pika-velocity-start-pull` 记录了**速度** session 启动时控制器会朝陈旧透传目标拉动臂；位置 session 走 `rm_movej_canfd`，首条是绝对关节目标，预期会覆盖陈旧目标，但尚未测量，以此台架确认。
- [ ] **D. 重锚验证**（需批准）：手势停止后在 3 s 内重新启动，确认日志出现 `re-anchored: silence`（或 `position jump`），臂不动。
- [ ] **E. 记录阈值数据**：`ros2 bag record /pika/l/cartesian_pose` 录一段正常操作，离线算相邻帧位姿差的分布：

```python
import numpy as np
# positions: (N, 3) array of consecutive /pika/l/cartesian_pose positions
steps = np.linalg.norm(np.diff(positions, axis=0), axis=1)
print(np.percentile(steps, [50, 95, 99, 100]))
```

用结果确定 `jump_position_m`、`jump_orientation_rad`，改 `config/ros/pika_config.yaml` 并更新文档表格里的"初值"说明。

---

## Self-Review（写完计划后对照 spec 做的检查）

**Spec 覆盖**

| spec 要求 | 任务 |
| --- | --- |
| 锚定与配对（读 `get_current_pose`、读失败退避、首目标=锚点、惰性配对、`A + (p−p0)`、姿态相对映射） | T1（数学）、T3（读锚点/退避/首目标）、T4（配对由首帧 `accept` 完成） |
| 会话内重新锚定（跳变/静默；`A` 取上一条已发布目标；按新到消息而非重发判定） | T1（`accept`/`_discontinuity`）、T4（入口每帧调用一次） |
| leash（位置+姿态、无状态函数、1 s 无新鲜实测则保持） | T1（`target`）、T3（`_publish_position_target` 判新鲜度）、T4（轮询频率） |
| 不变的部分（3 s 释放、`_pose_goal`、driver） | 全程未改；T3 的 `_reconcile_position` 保留 `watchdog_ms` 释放 |
| `PositionTarget` 的 `accept`/`target` 拆分 | T1 |
| router 接线（`_ArmState.position`、`_on_anchor` 分发、`_reconcile_position`、`_goal_response` position 分支、`_pose()` 校验、`_reset_target`） | T3、T4 |
| 配置（`pika_position` 段、加载器、`rebase_gap_ms < watchdog_ms`） | T2 |
| 异常与边界（读失败、迟到锚点、session 结束清锚点、坏帧不刷新时间戳、重锚发生在 leash 期间） | T3、T4 的测试；重锚在 leash 期间由 `target_*` 记录的是已夹持目标保证（T1 `test_a_position_jump_re_anchors_without_moving_the_goal`） |
| 测试（改旧测试、纯逻辑、router 层、配置） | T1–T4 |
| 文档与连带（`pika-teleop.md`、`configuration.md`、`simulate_pika_pose.py`） | T5、T6 |
| 上线与验证（mock/dry-run、零指令台架、阈值数据、hunk 部署） | T7 |

**占位符扫描：** 没有 TBD/TODO；每个代码步骤都有完整代码；T6 的 `npm` 步骤给了命令和"装不上就注明"的出口。

**类型/命名一致性：** `PositionTarget(position, orientation_wxyz, *, rebase_gap_sec, jump_position_m, jump_orientation_rad, max_position_lead_m, max_orientation_lead_rad)`（T1 定义，T3 `_on_anchor` 按同名关键字构造）；`accept(...) -> str`、`target(*, measured_position, measured_orientation)`（T1 定义，T3/T4 调用）；router 属性 `position_rebase_gap_ms` 等（T2 声明，T3 使用，`_pika_router` 夹具设置）；ROS 参数名 `pika_position_*` 与加载器键一致；`_reset_target`、`_publish_position_target(arm, state, now)`、`_pose_message`、`_pose_poll_hz`、`_warn_throttled`、`_position_router`、`_position_target`、`_goal`、`_pika_pose`、`_IDENTITY_Q` 在各任务间名称一致；重锚原因字符串 `"silence"`/`"position jump"`/`"orientation jump"` 在 T1 实现与测试中一致，日志片段 `re-anchored` 在 T4 实现与测试中一致。
