from pathlib import Path

import pytest

from realman_web_control.model_manifest import build_manifest, resolve_model_asset


ROOT = Path(__file__).parents[4]


def paths():
    return (
        ROOT / "config/ros/three_robots.yaml",
        ROOT / "config/ros/realman_motion.yaml",
        ROOT / "config/ros/realman_coordinates.yaml",
        ROOT / "config/ros/keyboard_control.yaml",
        ROOT / "src/rm65_description",
    )


def test_manifest_reuses_layout_frames_motion_and_urdf_limits():
    manifest = build_manifest(*paths())
    assert manifest["root_frame"] == "world"
    assert [robot["id"] for robot in manifest["robots"]] == ["l", "m", "r"]
    left = manifest["robots"][0]
    assert left["transform"]["x"] == -1.0
    assert left["frames"]["tool"]["name"] == "tcpgrip"
    assert left["motion"]["velocity_control_period_ms"] == 10
    assert left["joints"][0]["lower_rad"] == pytest.approx(-3.106)
    assert left["urdf_url"] == "/models/urdf/RM65-B.urdf"
    assert manifest["keyboard_control"]["heartbeat_period_ms"] == 50
    assert set(manifest["keyboard_control"]["arms"]) == {"l", "r"}
    assert manifest["keyboard_control"]["arms"]["l"]["work_frame_id"] == "l/work/cell"
    assert manifest["keyboard_control"]["arms"]["l"]["bindings"]["vx"] == {
        "positive": "KeyW",
        "negative": "KeyS",
    }


def test_model_asset_resolution_rejects_path_traversal():
    _, _, _, _, description = paths()
    assert resolve_model_asset(description, "urdf/RM65-B.urdf").is_file()
    with pytest.raises(ValueError):
        resolve_model_asset(description, "../package.xml")


def test_manifest_accepts_symlink_installed_description_root(tmp_path):
    layout, motion, coordinates, keyboard, source_description = paths()
    installed_description = tmp_path / "rm65_description_share"
    installed_description.mkdir()
    (installed_description / "urdf").symlink_to(source_description / "urdf", target_is_directory=True)

    manifest = build_manifest(
        layout, motion, coordinates, keyboard, installed_description
    )

    assert manifest["robots"][0]["model"] == "RM65-B"
    assert resolve_model_asset(installed_description, "urdf/RM65-B.urdf").is_file()


def test_manifest_publishes_per_arm_gripper_mounts_from_end_effectors_config():
    manifest = build_manifest(*paths(), ROOT / "config/ros/end_effectors.yaml")

    assert set(manifest["end_effectors"]) == {"l", "m", "r"}
    left = manifest["end_effectors"]["l"]
    assert left["gripper_name"] == "gripper_left"
    assert manifest["end_effectors"]["m"]["gripper_name"] == "gripper_mid"
    assert manifest["end_effectors"]["r"]["gripper_name"] == "gripper_right"
    assert left["urdf_url"] == "/models/urdf/ctag2f90c.urdf"
    assert left["parent_link"] == "link_6"
    assert left["driving_joint"] == "Left_1_Joint"
    assert (left["closed_rad"], left["open_rad"]) == (0.0, 1.0)
    # The gripper URDF and its meshes are served through the existing /models route.
    _, _, _, _, description = paths()
    assert resolve_model_asset(description, "urdf/ctag2f90c.urdf").is_file()
    assert resolve_model_asset(description, "meshes/ctag2f90c/base_link.STL").is_file()


def test_manifest_has_no_end_effectors_without_the_config_file():
    assert build_manifest(*paths())["end_effectors"] == {}


def test_end_effector_config_rejects_a_missing_gripper_urdf(tmp_path):
    bad = tmp_path / "end_effectors.yaml"
    bad.write_text(
        "grippers: {g: {urdf: missing.urdf, driving_joint: J, closed_rad: 0.0, open_rad: 1.0}}\n"
        "mounts: {l: {gripper: g, gripper_name: gripper_left, parent_link: link_6,"
        " xyz: [0, 0, 0], rpy: [0, 0, 0]}}\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="gripper URDF does not exist"):
        build_manifest(*paths(), bad)


def test_manifest_publishes_the_shared_pedestal_from_the_layout():
    pedestal = build_manifest(*paths())["pedestal"]

    assert pedestal["frame"] == "world"
    assert pedestal["center_xy"] == [-0.981, 0.195]
    assert pedestal["size_xy"] == [0.36, 0.62]
    assert pedestal["top_z"] > pedestal["bottom_z"]
    assert pedestal["color"] == "#e9edf1"


def _layout_with_pedestal(tmp_path, block):
    import yaml

    layout_path, *rest = paths()
    layout = yaml.safe_load(layout_path.read_text(encoding="utf-8"))
    if block is None:
        layout.pop("pedestal", None)
    else:
        layout["pedestal"] = block
    out = tmp_path / "three_robots.yaml"
    out.write_text(yaml.safe_dump(layout), encoding="utf-8")
    return (out, *rest)


def test_manifest_has_no_pedestal_when_the_layout_has_none(tmp_path):
    assert build_manifest(*_layout_with_pedestal(tmp_path, None))["pedestal"] is None


@pytest.mark.parametrize(
    ("change", "message"),
    [
        ({"frame": "map"}, "frame must be 'world'"),
        ({"size_xy": [0.36, 0.0]}, "size_xy must be positive"),
        ({"top_z": -0.3}, "top_z must be above"),
        ({"center_xy": [0.0]}, "center_xy must be a 2-element list"),
        ({"color": "red"}, "color must be"),
    ],
)
def test_manifest_rejects_an_invalid_pedestal(tmp_path, change, message):
    block = {"frame": "world", "center_xy": [0.0, 0.0], "size_xy": [0.3, 0.6], "top_z": 0.0,
             "bottom_z": -0.2, "color": "#e9edf1", **change}
    with pytest.raises(ValueError, match=message):
        build_manifest(*_layout_with_pedestal(tmp_path, block))


def test_manifest_publishes_the_policy_current_guard_for_the_current_charts():
    guard = build_manifest(*paths(), None, ROOT / "config/ros/policy_task.yaml")["joint_current"]
    assert guard == {
        "enabled": True,
        "limits_ma": [4000.0, 7000.0, 8000.0, 6000.0, 7500.0, 3000.0],
        "sustain_sec": 0.5,
        "policy_arm": "r",
    }


def test_manifest_falls_back_to_the_executor_defaults_without_the_guard(tmp_path):
    # The executor declares the same defaults when policy_task.yaml has no current_guard block.
    assert build_manifest(*paths())["joint_current"]["limits_ma"] == [4000.0, 7000.0, 8000.0, 6000.0, 7500.0, 3000.0]
    task = tmp_path / "policy_task.yaml"
    task.write_text("realman_bt_executor:\n  ros__parameters:\n    policy_task:\n      arm: l\n", encoding="utf-8")
    guard = build_manifest(*paths(), None, task)["joint_current"]
    assert guard["policy_arm"] == "l" and guard["sustain_sec"] == 0.5 and guard["enabled"] is True


@pytest.mark.parametrize(
    "block, message",
    [
        ("limits_ma: [1, 2, 3]", "six numbers"),
        ("limits_ma: [4000, 7000, 0, 6000, 7500, 3000]", "positive"),
        ("sustain_sec: .nan", "finite"),
    ],
)
def test_manifest_rejects_an_invalid_current_guard(tmp_path, block, message):
    task = tmp_path / "policy_task.yaml"
    task.write_text(
        "realman_bt_executor:\n  ros__parameters:\n    policy_task:\n      current_guard:\n        " + block + "\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match=message):
        build_manifest(*paths(), None, task)


def test_manifest_publishes_the_deviation_reasons():
    manifest = build_manifest(*paths(), quality_reasons_path=ROOT / "config/recording/quality_reasons.yaml")
    assert manifest["quality_reasons"][0] == {"id": "grasp_miss", "label": "抓偏"}
    assert build_manifest(*paths())["quality_reasons"] == []
