from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]


def test_arm_move_tree_has_single_safe_movej():
    root = ET.parse(ROOT / "config/behavior-trees/arm_move.xml").getroot()
    assert root.attrib["main_tree_to_execute"] == "MainTree"
    tree = root.find("BehaviorTree")
    assert tree is not None and tree.attrib["ID"] == "MainTree"
    sequence = tree.find("Sequence")
    assert sequence is not None
    move = sequence.find("MoveJ")
    assert move is not None
    assert move.attrib["arm_id"] == "{arm_id}"
    assert move.attrib["dry_run"] == "{dry_run}"
    assert move.attrib["joint_degrees"] == "0,0,0,0,0,0"
    assert move.attrib["velocity_percent"] == "10"
    assert len(list(sequence)) == 1
