from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]
TREE = ROOT / "config/behavior-trees/tool_x.xml"
EXECUTOR = ROOT / "src/behavior/realman_bt/src/realman_bt_executor_node.cpp"
XML_PARSER = ROOT / "third_party/behavior_tree_cpp/bt_core/src/xml_parser.cpp"


def test_tool_x_example_uses_only_the_unified_reference_port():
    root = ET.parse(TREE).getroot()
    assert root.attrib == {
        "main_tree_to_execute": "MainTree",
        "realman_arm_id": "l",
        "realman_required_arms": "l",
        "realman_required_actions": "cartesian_velocity",
        "realman_launch": "arm_move",
        "realman_stop_on_terminal": "true",
        "realman_exit_on_terminal": "true",
    }
    node = root.find("./BehaviorTree/Sequence/CartesianVelocityForDuration")
    assert node is not None
    assert node.attrib == {
        "name": "move_tool_x_positive",
        "arm_id": "{arm_id}",
        "dry_run": "{dry_run}",
        "reference": "default_tool",
        "linear_velocity_mps": "0.02,0,0",
        "angular_velocity_radps": "0,0,0",
        "duration_sec": "0.5",
    }
    assert "reference_type" not in node.attrib
    assert "reference_name" not in node.attrib
    assert "frame_id" not in node.attrib


def test_cartesian_velocity_leaf_is_registered_by_the_executor():
    source = EXECUTOR.read_text(encoding="utf-8")
    assert (
        'registerNodeType<CartesianVelocityForDurationNode>(\n'
        '      "CartesianVelocityForDuration")'
    ) in source


def test_xml_parser_accepts_required_action_startup_metadata():
    source = XML_PARSER.read_text(encoding="utf-8")
    assert 'key == "realman_required_actions"' in source
