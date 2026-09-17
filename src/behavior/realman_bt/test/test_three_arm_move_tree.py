from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).parents[4]
TREE = ROOT / "config/behavior-trees/three_arm_staged_move.xml"


def test_three_arm_tree_waits_for_all_zero_moves_before_target_moves():
    root = ET.parse(TREE).getroot()
    tree = root.find("BehaviorTree")
    sequence = tree.find("Sequence")

    assert root.attrib["main_tree_to_execute"] == "MainTree"
    assert tree is not None and tree.attrib["ID"] == "MainTree"
    assert sequence is not None and sequence.attrib["name"] == "three_arm_staged_move"

    moves = sequence.findall("ThreeArmMoveJ")
    assert [move.attrib["name"] for move in moves] == ["all_zero", "requested_pose"]
    assert all(move.attrib["dry_run"] == "{dry_run}" for move in moves)
    assert all(move.attrib["velocity_percent"] == "10" for move in moves)
    assert all(move.attrib["blend_radius_percent"] == "0" for move in moves)
    assert all(move.attrib["timeout_sec"] == "120" for move in moves)

    assert moves[0].attrib["l_joint_degrees"] == "0,0,0,0,0,0"
    assert moves[0].attrib["m_joint_degrees"] == "0,0,0,0,0,0"
    assert moves[0].attrib["r_joint_degrees"] == "0,0,0,0,0,0"
    assert moves[1].attrib["l_joint_degrees"] == "24,20,66,24,84,14.5"
    assert moves[1].attrib["m_joint_degrees"] == "0,18,70,0,90,9"
    assert moves[1].attrib["r_joint_degrees"] == "15,22,65,23,82,-7.5"
