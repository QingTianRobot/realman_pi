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


def test_policy_branch_picks_carries_while_held_releases_and_checks_the_table():
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
    assert [child.tag for child in cycle] == ["RetryUnlessFault", "GripperReady", "WhiteObjectsRemain"]
    attempts = cycle.find("RetryUnlessFault")
    assert attempts.attrib["num_attempts"] == "{policy_attempts}"
    assert attempts.attrib["timeout_attempts"] == "{policy_timeout_attempts}"
    assert "timeouts_to_parent" not in attempts.attrib
    attempt = attempts.find("Sequence[@name='pick_attempt']")
    # An attempt starts from the start pose; the carry is part of it, so a drop on the way goes back there too.
    assert [child.tag for child in attempt] == [
        "GripperReady", "ThreeArmMoveJ", "SetBool", "RetryUnlessFault", "WhileGraspHeld"]
    assert attempt.find("SetBool").attrib == {"key": "pick_regrasp", "value": "false"}

    # Regrasps: misses rerun the policy from where the arm is; timeouts go to the outer retry (start pose).
    regrasps = attempt.find("RetryUnlessFault[@name='pick_regrasps']")
    assert regrasps.attrib["num_attempts"] == "{pick_regrasp_attempts}"
    assert regrasps.attrib["timeouts_to_parent"] == "true"
    prepare, mark, run = list(regrasps.find("Sequence[@name='pick_try']"))
    assert run.tag == "PolicyRun" and run.attrib["task"] == "pick" and run.attrib["arm_id"] == "r"
    assert mark.tag == "SetBool" and mark.attrib == {"key": "pick_regrasp", "value": "true"}
    # The first run skips the back-off (the flag is still false); every later one opens and lifts first.
    first, back_off = list(prepare)
    assert prepare.tag == "Fallback"
    assert first.tag == "CheckBool" and first.attrib == {"key": "pick_regrasp", "expected": "false"}
    regrasp_open, regrasp_lift = list(back_off)
    assert regrasp_open.tag == "GripperReady" and regrasp_open.attrib["arm_id"] == "r"
    assert regrasp_lift.tag == "CartesianVelocityForDuration" and regrasp_lift.attrib["arm_id"] == "r"
    assert regrasp_lift.attrib["reference"] == "work/pikabase"
    assert regrasp_lift.attrib["angular_velocity_radps"] == "0,0,0"
    vx, vy, vz = (float(value) for value in regrasp_lift.attrib["linear_velocity_mps"].split(","))
    assert vx == vy == 0.0 and 0.0 < vz <= 0.03
    # "A little": clear of the table (2 cm was too low, 2026-11-01), still below the carry's lift.
    regrasp_rise = vz * float(regrasp_lift.attrib["duration_sec"])
    assert 0.03 <= regrasp_rise <= 0.05

    carry = attempt.find("WhileGraspHeld")
    assert carry.attrib["arm_id"] == "r"
    up, lift, turn = list(carry.find("Sequence[@name='pick_carry_to_release']"))
    assert up.tag == "CartesianVelocityForDuration" and up.attrib["arm_id"] == "r"
    # Straight up in the identity work frame of the upright r base, slowly, a few centimetres.
    assert up.attrib["reference"] == "work/pikabase"
    assert up.attrib["angular_velocity_radps"] == "0,0,0"
    vx, vy, vz_carry = (float(value) for value in up.attrib["linear_velocity_mps"].split(","))
    assert vx == vy == 0.0 and 0.0 < vz_carry <= 0.05
    assert 0.03 <= vz_carry * float(up.attrib["duration_sec"]) <= 0.08
    assert regrasp_rise < vz_carry * float(up.attrib["duration_sec"])
    assert lift.tag == "MoveJ" and lift.attrib["arm_id"] == "r"
    assert lift.attrib["joint_degrees"] == "{pick_lift_joint_degrees}"
    assert turn.tag == "MoveJointTo" and turn.attrib["arm_id"] == "r"
    assert turn.attrib["joint"] == "{pick_release_joint}"
    assert turn.attrib["target_degrees"] == "{pick_release_joint_deg}"

    _, release, detect = list(cycle)
    assert release.attrib["arm_id"] == "r"
    assert detect.attrib["table_clear"] == "{pick_table_clear}"
    for leaf in (carry, up, lift, turn, release, detect, run, regrasp_open, regrasp_lift):
        assert leaf.attrib["dry_run"] == "{dry_run}"


def test_every_tag_is_registered_in_the_executor():
    registered = set(re.findall(r'registerNodeType<[^>]+>\(\s*"(\w+)"', EXECUTOR.read_text()))
    tags = {element.tag for element in ET.parse(PICK).getroot().iter()} - {"root", "BehaviorTree"}
    assert tags <= registered, tags - registered


def test_the_pick_cycle_settings_are_the_reviewed_values():
    document = yaml.safe_load((ROOT / "config/ros/policy_task.yaml").read_text(encoding="utf-8"))
    policy_task = document["realman_bt_executor"]["ros__parameters"]["policy_task"]
    assert policy_task["tasks"]["pick"]["completion"] == "grasp_check"
    pick_cycle = policy_task["pick_cycle"]
    # 2026-10-20: the lift pose is the right arm's start pose until a dedicated one is measured.
    pika = yaml.safe_load((ROOT / "config/ros/pika_config.yaml").read_text(encoding="utf-8"))
    assert pick_cycle["lift_joint_degrees"] == pika["pika_default_pose"]["right"]["joint_degrees"]
    assert pick_cycle["release_joint"] == 1
    assert pick_cycle["release_joint_deg"] == -163.0
    # 2026-11-01: 3 attempts from the start pose, each with up to 3 policy runs (regrasps).
    assert policy_task["attempts"] == 3
    assert pick_cycle["regrasp_attempts"] == 3
    detection = policy_task["object_detection"]
    assert detection["image_topic"] == "/camera_global/d435/color/image_raw"
    assert detection["erode_px"] % 2 == 1


def test_the_tree_is_installed():
    cmake = (ROOT / "src/behavior/realman_bt/CMakeLists.txt").read_text()
    assert "behavior-trees/control_pick.xml" in cmake
