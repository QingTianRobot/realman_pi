from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "config/behavior-trees/control.xml"
CMAKE = ROOT / "src/behavior/realman_bt/CMakeLists.txt"


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
        ("policy", "Policy", "true", "PolicyInputStub", None, False),
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
            assert entry_move.attrib == {
                "name": "pika_default_pose",
                "dry_run": "{dry_run}",
                "l_joint_degrees": "{pika_l_joint_degrees}",
                "m_joint_degrees": "{pika_m_joint_degrees}",
                "r_joint_degrees": "{pika_r_joint_degrees}",
                "velocity_percent": "10",
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
        assert leaf.attrib == {}

    registration_nodes = [selector, *document.findall(".//InputModeGuard")]
    remapped = [
        (attribute, value)
        for node in registration_nodes
        for attribute, value in node.attrib.items()
        if value.startswith("{") or value.endswith("}")
    ]
    assert remapped == [("selected_mode", "{selected_mode}")] * 7


def test_control_router_is_installed_with_the_package():
    source = CMAKE.read_text()
    assert 'config/behavior-trees/control.xml"' in source
    assert "DESTINATION share/${PROJECT_NAME}/behavior-trees" in source
