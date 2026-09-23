from pathlib import Path
import sys


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "src/behavior/realman_bt/scripts/pika_control_router.py"
sys.path.insert(0, str(ROUTER.parent))


def test_pika_router_only_constructs_left_and_right_streams():
    source = ROUTER.read_text(encoding="utf-8")

    assert 'for arm in ("l", "r")' in source
    assert '"/pika/{arm}/cartesian_pose"' in source
    assert '"/pika/{arm}/cartesian_velocity"' in source
    assert '"/m/cartesian_pose/command"' not in source
    assert '"/m/cartesian_velocity/command"' not in source


def test_pika_router_requires_active_behavior_tree_mode_before_forwarding():
    source = ROUTER.read_text(encoding="utf-8")

    assert 'if self.mode != "pikaposition":' in source
    assert 'if self.mode != "pikavelocity":' in source
    assert 'InputModeState.ACTIVE' in source
    assert 'self._cancel(state)' in source
    assert 'self.dry_run' in source


def test_pika_router_uses_both_continuous_driver_actions():
    source = ROUTER.read_text(encoding="utf-8")

    assert "ActionClient(self, CartesianPose" in source
    assert "ActionClient(self, CartesianVelocity" in source
    assert "cartesian_pose/command" in source
    assert "cartesian_velocity/command" in source
    assert 'self.mode != expected_mode' in source


def test_pika_velocity_uses_configured_work_and_per_session_speed_limits():
    source = ROUTER.read_text(encoding="utf-8")

    assert "parse_arm_profiles" in source
    assert 'logical_name == work_reference' in source
    assert "CartesianVelocity.Goal.WORK" in source
    assert "goal.max_linear_speed_mps = profile.max_linear_speed_mps" in source
    assert "goal.max_angular_speed_radps = profile.max_angular_speed_radps" in source
    assert "message.header.frame_id != profile.frame_id" in source
    assert "linear speed exceeds Pika session limit" in source


def test_profile_parser_selects_configured_pikabase_work_reference():
    from pika_control_router import parse_arm_profiles

    profiles = parse_arm_profiles(
        [
            "l|default_work|1|cell|l/work/cell",
            "l|work/pikabase|1|pikabase|l/work/pikabase",
            "r|default_work|1|cell|r/work/cell",
            "r|work/pikabase|1|pikabase|r/work/pikabase",
        ],
        [
            "l|20|100|0.05|0.25|0.1|0.5|10|2",
            "r|20|100|0.05|0.25|0.1|0.5|10|2",
        ],
        "work/pikabase",
        1.0,
        0.25,
    )

    assert profiles["l"].reference_name == "pikabase"
    assert profiles["l"].frame_id == "l/work/pikabase"
    assert profiles["r"].reference_name == "pikabase"
    assert profiles["r"].frame_id == "r/work/pikabase"


def test_pika_router_forwards_continuous_gripper_percentages_for_left_and_right():
    source = ROUTER.read_text(encoding="utf-8")

    assert "Float32" in source
    assert '"/pika/{arm}/gripper_percentage"' in source
    assert '"/gripper_left/percentage/command"' in source
    assert '"/gripper_right/percentage/command"' in source
    assert 'self.mode not in {"pikaposition", "pikavelocity"}' in source
    assert "math.isfinite" in source
    assert "0.0 <= value <= 1.0" in source
    assert 'for arm in ("l", "r")' in source
    assert '"/pika/m/gripper_percentage"' not in source
