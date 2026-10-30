"""config/behavior-trees/control_pick.xml: control.xml with a pick-and-clear policy branch."""
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

import yaml

ROOT = Path(__file__).parents[4]
sys.path.insert(0, str(ROOT / "src/behavior/realman_bt/scripts"))
from tree_metadata import read_metadata  # noqa: E402

PICK = ROOT / "config/behavior-trees/control_pick.xml"
CONTROL = ROOT / "config/behavior-trees/control.xml"
EXECUTOR = ROOT / "src/behavior/realman_bt/src/realman_bt_executor_node.cpp"


def _branches(path):
    router = ET.parse(path).getroot().find("BehaviorTree/ReactiveSequence/ReactiveFallback")
    return {branch.attrib["name"]: branch for branch in router}


def test_metadata_is_the_persistent_router_of_control_xml():
    assert read_metadata(PICK) == read_metadata(CONTROL)


def test_every_branch_but_policy_is_identical_to_control_xml():
    pick, control = _branches(PICK), _branches(CONTROL)
    assert list(pick) == list(control)
    for name in control:
        if name != "policy_branch":
            assert ET.tostring(pick[name]) == ET.tostring(control[name]), name


def test_policy_branch_picks_lifts_turns_releases_and_checks_the_table():
    policy = _branches(PICK)["policy_branch"]
    guard = policy.find("InputModeGuard")
    assert guard.attrib["mode"] == "policy"
    entry = policy.find("Sequence[@name='policy_entry']")
    assert [child.tag for child in entry] == ["ThreeArmMoveJ", "ActivateInputMode", "Fallback"]
    task_ok, fail = list(entry.find("Fallback[@name='pick_task']"))
    assert fail.tag == "FailInputMode" and fail.attrib["reason"] == "{policy_failure_reason}"
    assert [child.tag for child in task_ok] == ["SetBool", "Fallback", "ThreeArmMoveJ", "PolicyInputStub"]
    home = task_ok.find("ThreeArmMoveJ")
    assert home.attrib["name"] == "pick_done_home"
    assert home.attrib["r_joint_degrees"] == "{pika_r_joint_degrees}"
    assert home.attrib["dry_run"] == "{dry_run}"
    reset = task_ok.find("SetBool")
    assert reset.attrib == {"key": "pick_table_clear", "value": "false"}

    repeat, clear = list(task_ok.find("Fallback[@name='pick_until_clear']"))
    assert repeat.tag == "Repeat" and repeat.attrib["num_cycles"] == "-1"
    assert clear.tag == "CheckBool" and clear.attrib == {"key": "pick_table_clear", "expected": "true"}

    cycle = repeat.find("Sequence[@name='pick_cycle']")
    assert [child.tag for child in cycle] == [
        "RetryUnlessFault", "MoveJ", "MoveJointTo", "GripperReady", "WhiteObjectsRemain"]
    attempt = cycle.find("RetryUnlessFault/Sequence[@name='pick_attempt']")
    assert [child.tag for child in attempt] == ["GripperReady", "ThreeArmMoveJ", "PolicyRun"]
    run = attempt.find("PolicyRun")
    assert run.attrib["task"] == "pick" and run.attrib["arm_id"] == "r"

    _, lift, turn, release, detect = list(cycle)
    assert lift.attrib["arm_id"] == "r"
    assert lift.attrib["joint_degrees"] == "{pick_lift_joint_degrees}"
    assert turn.attrib["arm_id"] == "r"
    assert turn.attrib["joint"] == "{pick_release_joint}"
    assert turn.attrib["target_degrees"] == "{pick_release_joint_deg}"
    assert release.attrib["arm_id"] == "r"
    assert detect.attrib["table_clear"] == "{pick_table_clear}"
    for leaf in (lift, turn, release, detect, run):
        assert leaf.attrib["dry_run"] == "{dry_run}"


def test_every_tag_is_registered_in_the_executor():
    registered = set(re.findall(r'registerNodeType<[^>]+>\(\s*"(\w+)"', EXECUTOR.read_text()))
    tags = {element.tag for element in ET.parse(PICK).getroot().iter()} - {"root", "BehaviorTree"}
    assert tags <= registered, tags - registered


def test_the_pick_cycle_settings_are_the_reviewed_values():
    document = yaml.safe_load((ROOT / "config/ros/policy_task.yaml").read_text(encoding="utf-8"))
    policy_task = document["realman_bt_executor"]["ros__parameters"]["policy_task"]
    assert policy_task["tasks"]["pick"]["completion"] == "lift_and_hold"
    pick_cycle = policy_task["pick_cycle"]
    # 2026-10-20: the lift pose is the right arm's start pose until a dedicated one is measured.
    pika = yaml.safe_load((ROOT / "config/ros/pika_config.yaml").read_text(encoding="utf-8"))
    assert pick_cycle["lift_joint_degrees"] == pika["pika_default_pose"]["right"]["joint_degrees"]
    assert pick_cycle["release_joint"] == 1
    assert pick_cycle["release_joint_deg"] == -163.0
    detection = policy_task["object_detection"]
    assert detection["image_topic"] == "/camera_global/d435/color/image_raw"
    assert detection["erode_px"] % 2 == 1


def test_the_tree_is_installed():
    cmake = (ROOT / "src/behavior/realman_bt/CMakeLists.txt").read_text()
    assert "behavior-trees/control_pick.xml" in cmake
