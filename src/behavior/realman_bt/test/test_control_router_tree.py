import re
from pathlib import Path
import xml.etree.ElementTree as ET

import yaml


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "config/behavior-trees/control.xml"
CMAKE = ROOT / "src/behavior/realman_bt/CMakeLists.txt"

# mode -> (entry ThreeArmMoveJ node name, velocity_percent)
ENTRY_MOVE = {
    "policy": ("policy_start_pose", "10"),
    "pikaposition": ("pika_default_pose", "30"),
    "pikavelocity": ("pika_default_pose", "30"),
    "pikamixed": ("pika_default_pose", "30"),
}


def test_control_router_is_the_literal_authoritative_mode_catalog():
    document = ET.parse(ROUTER).getroot()
    assert document.attrib == {
        "main_tree_to_execute": "InputControl",
        "realman_arm_id": "r",
        "realman_required_arms": "l,m,r",
        "realman_launch": "control_router",
        "realman_stop_on_terminal": "false",
        "realman_exit_on_terminal": "false",
    }
    behavior_tree = document.find("BehaviorTree")
    assert behavior_tree is not None
    assert behavior_tree.attrib == {"ID": "InputControl"}

    root_children = list(behavior_tree)
    assert len(root_children) == 1
    root = root_children[0]
    assert root.tag == "ReactiveSequence"
    assert root.attrib == {"name": "input_control"}
    selector, router = list(root)
    assert selector.tag == "SelectInputMode"
    assert selector.attrib == {"selected_mode": "{selected_mode}"}
    assert router.tag == "ReactiveFallback"
    assert router.attrib == {"name": "input_router"}
    assert len(document.findall(".//ReactiveFallback")) == 1

    expected = [
        ("web", "Web", "false", "WebInputStub", None, False),
        (
            "keyboard",
            "Web / 键盘速度控制",
            "true",
            "KeyboardVelocityInput",
            None,
            False,
        ),
        ("policy", "Policy", "true", "Fallback", "policy_entry", True),
        (
            "pikaposition",
            "Pika / 位置控制",
            "true",
            "PikaPositionInput",
            "pika_position_entry",
            True,
        ),
        (
            "pikavelocity",
            "Pika / 速度控制",
            "true",
            "PikaVelocityInput",
            "pika_velocity_entry",
            True,
        ),
        (
            "pikamixed",
            "Pika / Mixed 控制",
            "true",
            "PikaMixedInput",
            "pika_mixed_entry",
            True,
        ),
        ("none", "无输入", "true", "IdleInput", None, False),
    ]
    assert len(list(router)) == len(expected)
    for branch, (mode, label, selectable, leaf_tag, entry_sequence_name, has_entry_move) in zip(router, expected):
        assert branch.tag == "ReactiveSequence"
        assert branch.attrib == {"name": f"{mode}_branch"}
        children = list(branch)
        if mode == "keyboard":
            guard, entry_sequence = children
            assert entry_sequence.tag == "Sequence"
            assert entry_sequence.attrib == {"name": "keyboard_entry"}
            preparation, activation, leaf = list(entry_sequence)
            assert preparation.tag == "PrepareKeyboardWork"
            assert preparation.attrib == {"dry_run": "{dry_run}"}
        elif has_entry_move:
            guard, entry_sequence = children
            assert entry_sequence.tag == "Sequence"
            assert entry_sequence.attrib == {"name": entry_sequence_name}
            entry_move, activation, leaf = list(entry_sequence)
            assert entry_move.tag == "ThreeArmMoveJ"
            # Pika and policy share the entry pose (config/ros/pika_config.yaml, injected at launch); only the node
            # name and the speed differ: the policy starts slower.
            entry_name, entry_speed = ENTRY_MOVE[mode]
            assert entry_move.attrib == {
                "name": entry_name,
                "dry_run": "{dry_run}",
                "l_joint_degrees": "{pika_l_joint_degrees}",
                "m_joint_degrees": "{pika_m_joint_degrees}",
                "r_joint_degrees": "{pika_r_joint_degrees}",
                "velocity_percent": entry_speed,
                "blend_radius_percent": "0",
                "timeout_sec": "120",
            }
        else:
            guard, activation, leaf = children
        assert guard.tag == "InputModeGuard"
        assert guard.attrib == {
            "mode": mode,
            "label": label,
            "selectable": selectable,
            "selected_mode": "{selected_mode}",
        }
        assert activation.tag == "ActivateInputMode"
        assert activation.attrib == {"mode": mode}
        assert leaf.tag == leaf_tag
        # The policy branch ends in the task supervisor (see test_policy_branch_supervises_the_task).
        assert leaf.attrib == ({"name": "policy_task"} if mode == "policy" else {})

    registration_nodes = [selector, *document.findall(".//InputModeGuard")]
    remapped = [
        (attribute, value)
        for node in registration_nodes
        for attribute, value in node.attrib.items()
        if value.startswith("{") or value.endswith("}")
    ]
    assert remapped == [("selected_mode", "{selected_mode}")] * 8


def test_control_router_is_installed_with_the_package():
    source = CMAKE.read_text()
    assert 'config/behavior-trees/control.xml"' in source
    assert "DESTINATION share/${PROJECT_NAME}/behavior-trees" in source


def _policy_task():
    document = ET.parse(ROUTER).getroot()
    branch = next(b for b in document.iter("ReactiveSequence") if b.attrib.get("name") == "policy_branch")
    entry = next(b for b in branch if b.attrib.get("name") == "policy_entry")
    return list(entry)[2]


def test_policy_branch_supervises_the_task_from_inside_the_tree():
    task = _policy_task()
    assert task.tag == "Fallback" and task.attrib == {"name": "policy_task"}
    cycles_ok, give_up = list(task)

    # Everything that can end the task funnels into FailInputMode, whose reason is the last failure's.
    assert give_up.tag == "FailInputMode"
    assert give_up.attrib == {"reason": "{policy_failure_reason}"}

    assert cycles_ok.tag == "Sequence" and cycles_ok.attrib == {"name": "policy_cycles_ok"}
    repeat, idle = list(cycles_ok)
    assert idle.tag == "PolicyInputStub" and idle.attrib == {}
    assert repeat.tag == "Repeat" and repeat.attrib == {"num_cycles": "{policy_cycles}"}
    (retry,) = list(repeat)
    assert retry.tag == "RetryUnlessFault" and retry.attrib == {"num_attempts": "{policy_attempts}"}
    (attempt,) = list(retry)
    assert attempt.tag == "Sequence" and attempt.attrib == {"name": "policy_attempt"}

    gripper, rehome, run = list(attempt)
    assert gripper.tag == "GripperReady"
    assert gripper.attrib == {"arm_id": "r", "dry_run": "{dry_run}"}
    assert rehome.tag == "ThreeArmMoveJ"
    assert rehome.attrib == {
        "name": "policy_rehome",
        "dry_run": "{dry_run}",
        "l_joint_degrees": "{pika_l_joint_degrees}",
        "m_joint_degrees": "{pika_m_joint_degrees}",
        "r_joint_degrees": "{pika_r_joint_degrees}",
        "velocity_percent": "10",
        "blend_radius_percent": "0",
        "timeout_sec": "120",
    }
    assert run.tag == "PolicyRun"
    # The policy mode is the pick-and-place task; its prompt and completion come from policy_task.yaml.
    assert run.attrib == {"arm_id": "r", "task": "place", "dry_run": "{dry_run}"}


def test_policy_run_names_a_task_from_the_policy_task_config():
    tasks = yaml.safe_load((ROOT / "config/ros/policy_task.yaml").read_text(encoding="utf-8"))
    names = tasks["realman_bt_executor"]["ros__parameters"]["policy_task"]["task_names"]
    runs = [node for node in _policy_task().iter() if node.tag == "PolicyRun"]
    assert runs and all(node.attrib.get("task") in names for node in runs)


def test_policy_task_thresholds_live_in_config_not_in_the_tree():
    task = _policy_task()
    numeric_literals = {
        (node.tag, key, value)
        for node in task.iter()
        for key, value in node.attrib.items()
        if value.replace(".", "", 1).lstrip("-").isdigit()
    }
    # Only the re-home motion parameters are literals, same as every other branch's entry move.
    assert numeric_literals == {
        ("ThreeArmMoveJ", "velocity_percent", "10"),
        ("ThreeArmMoveJ", "blend_radius_percent", "0"),
        ("ThreeArmMoveJ", "timeout_sec", "120"),
    }


def test_every_policy_task_tag_is_registered_by_the_executor():
    source = (ROOT / "src/behavior/realman_bt/src/realman_bt_executor_node.cpp").read_text()
    for tag in ("Fallback", "Repeat", "RetryUnlessFault", "GripperReady", "PolicyRun", "FailInputMode"):
        assert re.search(rf'registerNodeType<[^>]+>\("{tag}"\)', source), tag
