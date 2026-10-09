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
