"""config/ros/policy_task.yaml: the thresholds PolicyRun and GripperReady use, and how they reach the executor."""
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).parents[4]
CONFIG = ROOT / "config/ros/policy_task.yaml"
LAUNCH = ROOT / "src/behavior/realman_bt/launch/control_router.launch.py"
LOADER = ROOT / "src/behavior/realman_bt/src/policy_task_params.cpp"
CMAKE = ROOT / "src/behavior/realman_bt/CMakeLists.txt"


def _parameters():
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    assert list(document) == ["realman_bt_executor"]
    return document["realman_bt_executor"]["ros__parameters"]["policy_task"]


def _flatten(prefix, node):
    for key, value in node.items():
        if isinstance(value, dict):
            yield from _flatten(f"{prefix}{key}.", value)
        else:
            yield f"{prefix}{key}", value


def _loader_keys():
    source = LOADER.read_text(encoding="utf-8")
    keys = set(re.findall(r'p \+ "([a-z_.]+)"', source))
    # The per-arm gripper names are declared in a loop over l, m and r.
    keys.discard("gripper_for_arm.")
    keys |= {f"gripper_for_arm.{arm}" for arm in "lmr"}
    # Each task named in task_names gets tasks.<name>.prompt and tasks.<name>.completion.
    keys.discard("tasks.")
    assert 'p + "tasks." + name + ".prompt"' in source and 'p + "tasks." + name + ".completion"' in source
    keys |= {f"tasks.{name}.{field}" for name in _parameters()["task_names"] for field in ("prompt", "completion")}
    return keys


def test_every_key_the_loader_declares_is_in_the_file_and_nothing_else():
    # ROS silently ignores a parameter nobody declared, so a typo in the YAML would fall back to the
    # default without a sound.
    in_file = {key for key, _ in _flatten("", _parameters())}
    assert in_file == _loader_keys()


def test_the_counts_and_the_activation_mode_are_the_reviewed_defaults():
    parameters = _parameters()
    assert parameters["cycles"] == 1
    assert parameters["attempts"] == 3
    assert parameters["arm"] == "r"
    assert parameters["activation"] == "auto"
    assert parameters["command_namespace"] == "/pi05_policy"


def test_the_safety_thresholds_are_the_reviewed_values():
    parameters = _parameters()
    # p1/p99 of the 130 demonstration episodes, each side widened by 10 degrees, J5 floored at 20.
    assert parameters["joint_envelope_deg"]["lo"] == [-73.4, 5.0, -16.2, -28.4, 20.0, -125.1]
    assert parameters["joint_envelope_deg"]["hi"] == [40.1, 107.0, 124.3, 70.8, 108.2, 49.0]
    assert parameters["max_joint_speed_dps"] == 50
    assert parameters["lm_drift_limit_deg"] == 1.0
    assert parameters["joint_state_stale_sec"] == 1.0
    assert parameters["max_attempt_sec"] == 45
    assert parameters["release"]["joint_index"] == 0
    assert parameters["release"]["joint_below_deg"] == -35.0
    assert parameters["verdict"]["empty_position_min"] == 7800
    assert parameters["gripper_ready"]["open_position_max"] == 500
    assert parameters["gripper_for_arm"] == {"l": "gripper_left", "m": "gripper_mid", "r": "gripper_right"}


def test_every_attempt_leaves_a_trace_in_the_host_log_directory():
    trace = _parameters()["trace"]
    assert trace["enabled"] is True
    # /opt/rm65_ws/logs is the host's ~/realman_pi/logs (read-write mount of the bringup container).
    assert trace["dir"] == "/opt/rm65_ws/logs/policy-attempts"
    assert trace["period_sec"] == 0.1


def test_the_command_namespace_matches_the_policy_bridge():
    bridge = yaml.safe_load((ROOT / "config/ros/policy_bridge.yaml").read_text(encoding="utf-8"))
    assert _parameters()["command_namespace"] == bridge["downlink"]["command_namespace"]


def test_the_tasks_are_the_two_prompts_of_the_multitask_model():
    parameters = _parameters()
    assert parameters["task_names"] == ["place", "pick"]
    assert set(parameters["tasks"]) == set(parameters["task_names"])  # a task not named is ignored by ROS
    # Verbatim the training view's tasks (m_multitask_b16_2gpu, 2026-10-16); the model has no other names for them.
    assert parameters["tasks"]["place"] == {
        "prompt": "pick up the power adapter and put it in the blue bin",
        "completion": "release_over_bin",
    }
    assert parameters["tasks"]["pick"] == {"prompt": "pick up the power adapter", "completion": "lift_and_hold"}


def test_the_lift_thresholds_are_the_reviewed_values():
    lift = _parameters()["lift"]
    assert lift == {
        "min_closed_sec": 3.0,
        "joint_index": 1,
        "joint_delta_deg": -10.0,
        "hold_sec": 2.0,
        "wrong_side_joint_index": 0,
        "wrong_side_below_deg": -25.0,
    }


def test_the_prompt_topic_matches_the_policy_bridge():
    bridge = yaml.safe_load((ROOT / "config/ros/policy_bridge.yaml").read_text(encoding="utf-8"))
    assert _parameters()["prompt_topic"] == bridge["prompt"]["topic"]


def test_the_bridge_starts_with_the_place_prompt():
    # Until the tree switches it, the bridge serves place; the BT's policy branch runs task="place".
    bridge = yaml.safe_load((ROOT / "config/ros/policy_bridge.yaml").read_text(encoding="utf-8"))
    assert bridge["prompt"]["initial"] == _parameters()["tasks"]["place"]["prompt"]


def test_the_launch_file_hands_the_file_to_the_executor():
    source = LAUNCH.read_text(encoding="utf-8")
    executor = source[source.index("executor = Node("):source.index("pika_router = Node(")]
    assert 'config_root / "ros" / "policy_task.yaml"' in executor
