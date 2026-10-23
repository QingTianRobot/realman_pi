from pathlib import Path
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]
sys.path.insert(0, str(ROOT / "src/behavior/realman_bt/scripts"))
from tree_metadata import read_metadata  # noqa: E402

TREE = ROOT / "config/behavior-trees/rotate_joint.xml"


def test_rotate_joint_tree_turns_j6_out_and_back():
    root = ET.parse(TREE).getroot()
    assert root.attrib["main_tree_to_execute"] == "MainTree"
    sequence = root.find("BehaviorTree/Sequence")
    assert sequence is not None
    leaves = list(sequence)
    assert [leaf.tag for leaf in leaves] == ["RotateJoint", "RotateJoint"]
    assert [leaf.attrib["direction"] for leaf in leaves] == ["ccw", "cw"]
    for leaf in leaves:
        assert leaf.attrib["arm_id"] == "{arm_id}"
        assert leaf.attrib["dry_run"] == "{dry_run}"
        assert leaf.attrib["joint"] == "6"
        assert leaf.attrib["angle_degrees"] == "10"
        assert leaf.attrib["velocity_percent"] == "10"


def test_rotate_joint_tree_metadata_is_single_arm_one_shot():
    assert read_metadata(TREE) == (
        "r", "r", "execute_motion", "arm_move.launch.py", "true", "true"
    )


def test_rotate_joint_is_registered_and_installed():
    package = ROOT / "src/behavior/realman_bt"
    executor = (package / "src/realman_bt_executor_node.cpp").read_text()
    assert 'registerNodeType<RotateJointNode>("RotateJoint")' in executor
    assert "behavior-trees/rotate_joint.xml" in (package / "CMakeLists.txt").read_text()
